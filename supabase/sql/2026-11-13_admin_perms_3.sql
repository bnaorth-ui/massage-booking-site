-- แบ่งสิทธิ์แอดมิน ครั้งที่ 3: แชตและการแจ้งเตือนแยกตามหมวด
-- ห้องแชต: ผู้ใช้งาน = chat (+ org ถ้าเป็นคนส่งคำขอหน่วยงานหรือผู้ติดต่อบริษัท), ร้านนวด = shop + finance, หมอนวด = staff, แอดมินหลักเห็นทุกห้อง
-- แจ้งเตือนถึงแอดมิน: เก็บหมวดไว้ใน notifications.areas เห็นและได้รับแจ้งเตือนเด้งเฉพาะคนที่มีหมวดนั้น (ไม่มีหมวด = แอดมินหลักเท่านั้น)

create or replace function public._sup_areas(p_user uuid, p_app text) returns text[]
language sql stable security definer set search_path = public as $$
  select case p_app when 'shop' then array['shop','finance'] when 'staff' then array['staff']
    else array['chat'] || case when exists (select 1 from public.org_requests where user_id = p_user)
                                or exists (select 1 from public.company_contacts where user_id = p_user)
                               then array['org'] else '{}'::text[] end end $$;
revoke all on function public._sup_areas(uuid, text) from public, anon, authenticated;

create or replace function public.admin_can_any(p_areas text[]) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid()
    and ('owner' = any(perms) or perms && coalesce(p_areas, '{}'::text[]))) $$;
revoke all on function public.admin_can_any(text[]) from public, anon;
grant execute on function public.admin_can_any(text[]) to authenticated;

create or replace function public.admin_room_ok(p_user uuid, p_app text) returns boolean
language sql stable security definer set search_path = public as $$
  select public.admin_can_any(public._sup_areas(p_user, p_app)) $$;
revoke all on function public.admin_room_ok(uuid, text) from public, anon;
grant execute on function public.admin_room_ok(uuid, text) to authenticated;

-- คำสั่งแชตฝั่งแอดมิน: ตรวจสิทธิ์ตามประเภทห้อง
do $m$ declare f text; d text;
begin
  foreach f in array array['admin_support_messages','admin_support_mark_read','admin_support_reply','admin_support_viewing'] loop
    select pg_get_functiondef(p.oid) into d from pg_proc p where p.proname = f and p.pronamespace = 'public'::regnamespace;
    if position('public.admin_can(''chat'')' in d) = 0 then raise exception 'ไม่พบการตรวจสิทธิ์ใน %', f; end if;
    execute replace(d, 'public.admin_can(''chat'')', 'public.admin_room_ok(p_user, p_app)');
  end loop;
end $m$;

create or replace function public.admin_support_rooms()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare me uuid := auth.uid();
begin
  if not public.is_admin() then raise exception 'เฉพาะแอดมินเท่านั้น'; end if;
  return (select coalesce(jsonb_agg(jsonb_build_object('user_id',r.user_id,'app',r.app,'name',r.name,'phone',r.phone,
      'last_at',r.last_at,'last_from',r.last_from,'last_body',r.last_body,
      'last_admin_name',r.last_admin_name,'last_admin_at',r.last_admin_at,
      'viewing_name',case when r.viewing_by is not null and r.viewing_by <> me and r.viewing_at > now() - interval '2 minutes' then r.viewing_name end,
      'link',case when r.app <> 'user' then null
                  when exists (select 1 from public.company_contacts c where c.user_id = r.user_id) then 'company'
                  when exists (select 1 from public.org_requests q where q.user_id = r.user_id) then 'org' end,
      'unread',(select count(*) from public.support_messages m where m.user_id = r.user_id and m.app = r.app
                 and m.sender_role = 'user' and m.created_at > coalesce(r.admin_read_at,'epoch')))
      order by (r.last_from = 'user') desc, r.last_at desc), '[]'::jsonb)
    from public.support_rooms r where r.last_at is not null and public.admin_room_ok(r.user_id, r.app));
end $$;

-- แจ้งเตือน: หมวดของเรื่อง
alter table public.notifications add column if not exists areas text[];

create or replace function public.notif_area() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.audience = 'admin' and new.areas is null then
    new.areas := case new.kind
      when 'topup' then array['finance'] when 'shop_registration' then array['shop']
      when 'orgreq' then array['org'] when 'company' then array['org']
      when 'staffapp' then array['staff'] when 'approval' then array['staff']
      when 'job' then array['queue'] when 'cancel' then array['queue']
      when 'review' then array['safety'] when 'support' then array['chat']
      else null end;
  end if;
  return new;
end $$;
revoke execute on function public.notif_area() from public, anon, authenticated;
drop trigger if exists trg_notif_area on public.notifications;
create trigger trg_notif_area before insert on public.notifications for each row execute function public.notif_area();

-- แชตใหม่: ใส่หมวดตามประเภทห้อง
do $m$ declare d text; o text := 'perform public.notify(''admin'', ''แชตใหม่จาก'' || lbl || '' '' || coalesce(nullif(idn.name,''''), ''''), prev, p_kind => ''support'');';
begin
  select pg_get_functiondef('public.support_send(text,text)'::regprocedure) into d;
  if position(o in d) = 0 then raise exception 'ไม่พบคำสั่งแจ้งเตือนใน support_send'; end if;
  execute replace(d, o, 'insert into public.notifications(audience, kind, title, body, areas) values (''admin'', ''support'', ''แชตใหม่จาก'' || lbl || '' '' || coalesce(nullif(idn.name,''''), ''''), prev, public._sup_areas(uid, p_app));');
end $m$;

-- เรื่องเก่า: จัดหมวดย้อนหลัง
update public.notifications set areas = case kind
    when 'topup' then array['finance'] when 'shop_registration' then array['shop']
    when 'orgreq' then array['org'] when 'company' then array['org']
    when 'staffapp' then array['staff'] when 'approval' then array['staff']
    when 'job' then array['queue'] when 'cancel' then array['queue'] when 'review' then array['safety']
    when 'support' then case when title like 'แชตใหม่จากร้านนวด%' then array['shop','finance']
                             when title like 'แชตใหม่จากหมอนวด%' then array['staff'] else array['chat'] end
    else null end
 where audience = 'admin' and areas is null;

-- เห็นในเมนูแจ้งเตือนเฉพาะหมวดที่มีสิทธิ์
alter policy nt_sel on public.notifications using (
  ((audience = 'user'::notif_audience) and (user_id = (select auth.uid())))
  or ((audience = 'staff'::notif_audience) and (staff_id = (select my_staff_id())))
  or ((audience = 'shop'::notif_audience) and is_shop_member(place_id))
  or ((audience = 'admin'::notif_audience) and public.admin_can_any(areas)));

-- แจ้งเตือนเด้ง: ส่งถึงแอดมินเฉพาะหมวด
create or replace function public.push_users(n notifications)
returns uuid[] language sql stable security definer set search_path = public as $$
  select coalesce(array_agg(distinct u), '{}') from (
    select n.user_id as u where n.audience = 'user' and n.user_id is not null
    union all select user_id from public.staff where n.audience = 'staff' and id = n.staff_id and user_id is not null
    union all select user_id from public.shop_members where n.audience = 'shop' and place_id = n.place_id
    union all select user_id from public.admins where n.audience = 'admin'
      and ('owner' = any(perms) or perms && coalesce(n.areas, '{}'::text[]))
  ) q where u is not null $$;
