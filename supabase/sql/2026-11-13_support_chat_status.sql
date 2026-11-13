-- แชตกับผู้ใช้ (แอดมิน): ป้าย "ตอบแล้ว โดย [ชื่อ]" และ "[ชื่อ] กำลังดูอยู่"
alter table public.support_rooms add column if not exists last_admin_name text;
alter table public.support_rooms add column if not exists last_admin_at timestamptz;
alter table public.support_rooms add column if not exists viewing_by uuid;
alter table public.support_rooms add column if not exists viewing_name text;
alter table public.support_rooms add column if not exists viewing_at timestamptz;

-- เติมชื่อคนตอบล่าสุดจากข้อความเดิม
update public.support_rooms r set last_admin_name = m.sender_name, last_admin_at = m.created_at
  from (select distinct on (user_id, app) user_id, app, sender_name, created_at from public.support_messages
         where sender_role = 'admin' order by user_id, app, created_at desc) m
 where m.user_id = r.user_id and m.app = r.app and r.last_admin_at is null;

create or replace function public.admin_support_rooms()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare me uuid := auth.uid();
begin
  if not public.is_admin() then raise exception 'เฉพาะแอดมินเท่านั้น'; end if;
  return (select coalesce(jsonb_agg(jsonb_build_object('user_id',r.user_id,'app',r.app,'name',r.name,'phone',r.phone,
      'last_at',r.last_at,'last_from',r.last_from,'last_body',r.last_body,
      'last_admin_name',r.last_admin_name,'last_admin_at',r.last_admin_at,
      'viewing_name',case when r.viewing_by is not null and r.viewing_by <> me and r.viewing_at > now() - interval '2 minutes' then r.viewing_name end,
      'unread',(select count(*) from public.support_messages m where m.user_id = r.user_id and m.app = r.app
                 and m.sender_role = 'user' and m.created_at > coalesce(r.admin_read_at,'epoch')))
      order by (r.last_from = 'user') desc, r.last_at desc), '[]'::jsonb)
    from public.support_rooms r where r.last_at is not null);
end $$;

-- แอดมินเปิดห้อง (p_on = true ส่งซ้ำทุก 1 นาทีขณะเปิดอยู่) / ออกจากห้อง (false ล้างเฉพาะของตัวเอง)
-- คืนชื่อแอดมินคนอื่นที่กำลังดูห้องนี้อยู่ (ถ้ามี) ให้หน้าเว็บขึ้นคำเตือน
create or replace function public.admin_support_viewing(p_user uuid, p_app text, p_on boolean)
returns text language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); nm text; rm public.support_rooms;
begin
  if not public.is_admin() then raise exception 'เฉพาะแอดมินเท่านั้น'; end if;
  select * into rm from public.support_rooms where user_id = p_user and app = p_app for update;
  if not found then return null; end if;
  if p_on then
    if rm.viewing_by is not null and rm.viewing_by <> me and rm.viewing_at > now() - interval '2 minutes' then
      return rm.viewing_name;   -- คนอื่นดูอยู่ก่อน ไม่แย่งชื่อ
    end if;
    select coalesce(nullif(btrim(first_name),''), 'แอดมิน') into nm from public.profiles where id = me;
    update public.support_rooms set viewing_by = me, viewing_name = coalesce(nm,'แอดมิน'), viewing_at = now()
     where user_id = p_user and app = p_app;
    return null;
  end if;
  update public.support_rooms set viewing_by = null, viewing_name = null, viewing_at = null
   where user_id = p_user and app = p_app and viewing_by = me;
  return null;
end $$;
revoke all on function public.admin_support_viewing(uuid, text, boolean) from public, anon;
grant execute on function public.admin_support_viewing(uuid, text, boolean) to authenticated;

create or replace function public.admin_support_reply(p_user uuid, p_app text, p_body text)
returns uuid language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); body text := btrim(coalesce(p_body,'')); rm public.support_rooms; nm text; mid uuid;
  st public.app_settings; prev text;
begin
  if not public.is_admin() then raise exception 'เฉพาะแอดมินเท่านั้น'; end if;
  if char_length(body) = 0 then raise exception 'กรุณาพิมพ์ข้อความ'; end if;
  if char_length(body) > 1000 then raise exception 'ข้อความยาวเกินไป (ไม่เกิน 1,000 ตัวอักษร)'; end if;
  select * into rm from public.support_rooms where user_id = p_user and app = p_app for update;
  if not found then raise exception 'ไม่พบห้องแชตนี้ (อาจถูกลบแล้ว)'; end if;
  select coalesce(nullif(btrim(first_name),''), 'เจ้าหน้าที่') into nm from public.profiles where id = uid;
  insert into public.support_messages(user_id, app, sender_id, sender_role, sender_name, body)
    values (p_user, p_app, uid, 'admin', 'เจ้าหน้าที่ ' || coalesce(nm,''), body) returning id into mid;
  update public.support_rooms set last_at = clock_timestamp(), last_from = 'admin', last_body = left(body,120),
    admin_read_at = clock_timestamp(), last_admin_name = 'เจ้าหน้าที่ ' || coalesce(nm,''), last_admin_at = clock_timestamp()
   where user_id = p_user and app = p_app;
  if rm.user_notified_at is null or rm.user_notified_at < now() - interval '2 minutes' then
    update public.support_rooms set user_notified_at = now() where user_id = p_user and app = p_app;
    select * into st from public.app_settings limit 1;
    prev := left(body, 80) || case when char_length(body) > 80 then '...' else '' end;
    if p_app = 'user' and st.notify_user then
      perform public.notify('user', 'ข้อความใหม่จากเจ้าหน้าที่', prev, p_user => p_user, p_kind => 'support');
    elsif p_app = 'shop' and rm.place_id is not null then
      perform public.notify('shop', 'ข้อความใหม่จากเจ้าหน้าที่', prev, p_place => rm.place_id, p_kind => 'support');
    elsif p_app = 'staff' and rm.staff_id is not null and st.notify_staff then
      perform public.notify('staff', 'ข้อความใหม่จากเจ้าหน้าที่', prev, p_staff => rm.staff_id, p_kind => 'support');
    end if;
  end if;
  return mid;
end $$;
