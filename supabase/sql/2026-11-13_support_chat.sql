-- แชตกับเจ้าหน้าที่ (แทนลิงก์ LINE) ใช้ได้ในแอปผู้ใช้งาน ร้านนวด หมอนวด แอดมินตอบในแอปแอดมิน
-- ห้องละ 1 ห้องต่อผู้ใช้ต่อแอป (app: user / shop / staff) เข้าถึงผ่านฟังก์ชันเท่านั้น (เปิด RLS ไม่มี policy)
-- เก็บ 6 เดือนนับจากข้อความล่าสุดของห้อง ลบบัญชีแล้วห้องถูกลบตาม (FK on delete cascade)

create table if not exists public.support_rooms (
  user_id uuid not null references auth.users(id) on delete cascade,
  app text not null check (app in ('user','shop','staff')),
  name text not null default '',
  phone text,
  place_id uuid,
  staff_id uuid,
  last_at timestamptz,
  last_from text,
  last_body text,
  user_read_at timestamptz,
  admin_read_at timestamptz,
  admin_notified_at timestamptz,
  user_notified_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (user_id, app)
);
create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  app text not null,
  sender_id uuid,
  sender_role text not null check (sender_role in ('user','admin','auto')),
  sender_name text not null default '',
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default clock_timestamp(),
  foreign key (user_id, app) references public.support_rooms(user_id, app) on delete cascade
);
create index if not exists support_messages_room_idx on public.support_messages (user_id, app, created_at);
create index if not exists support_rooms_last_idx on public.support_rooms (last_at);
alter table public.support_rooms enable row level security;
alter table public.support_messages enable row level security;
revoke all on public.support_rooms, public.support_messages from anon, authenticated;

-- ตัวตนของผู้ใช้ในแต่ละแอป (ไม่มีสิทธิ์ = null)
create or replace function public._sup_ident(p_app text, p_uid uuid)
returns table(name text, phone text, place_id uuid, staff_id uuid)
language sql stable security definer set search_path = public as $$
  select btrim(coalesce(p.first_name,'') || ' ' || coalesce(p.last_name,'')), p.phone, null::uuid, null::uuid
    from public.profiles p where p_app = 'user' and p.id = p_uid
  union all
  select pl.name, (select phone from public.profiles where id = p_uid), pl.id, null::uuid
    from (select m.place_id from public.shop_members m where m.user_id = p_uid order by m.place_id limit 1) x
    join public.places pl on pl.id = x.place_id where p_app = 'shop'
  union all
  select s.name, s.phone, null::uuid, s.id
    from (select * from public.staff where user_id = p_uid order by active desc, created_at limit 1) s where p_app = 'staff'
  limit 1 $$;
revoke all on function public._sup_ident(text, uuid) from public, anon, authenticated;

create or replace function public._sup_msgs(p_user uuid, p_app text, p_after timestamptz)
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object('id',m.id,'sender_id',m.sender_id,'sender_role',m.sender_role,
           'sender_name',m.sender_name,'body',m.body,'created_at',m.created_at) order by m.created_at), '[]'::jsonb)
  from (select * from public.support_messages where user_id = p_user and app = p_app
          and (p_after is null or created_at > p_after) order by created_at desc limit 200) m $$;
revoke all on function public._sup_msgs(uuid, text, timestamptz) from public, anon, authenticated;

-- ===== ฝั่งผู้ใช้ =====
create or replace function public.support_room(p_app text, p_after timestamptz default null)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'กรุณาเข้าสู่ระบบ'; end if;
  if not exists (select 1 from public._sup_ident(p_app, uid)) then raise exception 'ไม่มีสิทธิ์ใช้ห้องแชตนี้'; end if;
  return jsonb_build_object('messages', public._sup_msgs(uid, p_app, p_after),
    'hours', (select hours_text from public.app_settings limit 1));
end $$;

create or replace function public.support_mark_read(p_app text)
returns void language sql security definer set search_path = public as $$
  update public.support_rooms set user_read_at = clock_timestamp() where user_id = auth.uid() and app = p_app $$;

create or replace function public.support_unread(p_app text)
returns integer language sql stable security definer set search_path = public as $$
  select count(*)::int from public.support_messages m join public.support_rooms r on r.user_id = m.user_id and r.app = m.app
   where m.user_id = auth.uid() and m.app = p_app and m.sender_role <> 'user'
     and m.created_at > coalesce(r.user_read_at, 'epoch') $$;

create or replace function public.support_send(p_app text, p_body text)
returns uuid language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); body text := btrim(coalesce(p_body,'')); idn record; rm public.support_rooms;
  mid uuid; hrs text; prev text; lbl text;
begin
  if uid is null then raise exception 'กรุณาเข้าสู่ระบบ'; end if;
  select * into idn from public._sup_ident(p_app, uid);
  if not found then raise exception 'ไม่มีสิทธิ์ใช้ห้องแชตนี้'; end if;
  if char_length(body) = 0 then raise exception 'กรุณาพิมพ์ข้อความ'; end if;
  if char_length(body) > 1000 then raise exception 'ข้อความยาวเกินไป (ไม่เกิน 1,000 ตัวอักษร)'; end if;
  if (select count(*) from public.support_messages where user_id = uid and app = p_app and sender_role = 'user'
        and created_at > now() - interval '10 minutes') >= 30 then
    raise exception 'ส่งข้อความถี่เกินไป กรุณารอสักครู่แล้วลองใหม่'; end if;
  insert into public.support_rooms(user_id, app, name, phone, place_id, staff_id)
    values (uid, p_app, coalesce(idn.name,''), idn.phone, idn.place_id, idn.staff_id)
    on conflict (user_id, app) do update set name = excluded.name, phone = excluded.phone,
      place_id = excluded.place_id, staff_id = excluded.staff_id;
  select * into rm from public.support_rooms where user_id = uid and app = p_app for update;
  insert into public.support_messages(user_id, app, sender_id, sender_role, sender_name, body)
    values (uid, p_app, uid, 'user', coalesce(idn.name,''), body) returning id into mid;
  -- ตอบรับอัตโนมัติเมื่อทักมาหลังเงียบไป 12 ชั่วโมง (หรือครั้งแรก)
  if rm.last_at is null or rm.last_at < now() - interval '12 hours' then
    select nullif(btrim(hours_text),'') into hrs from public.app_settings limit 1;
    insert into public.support_messages(user_id, app, sender_id, sender_role, sender_name, body)
      values (uid, p_app, null, 'auto', 'ระบบ', 'ได้รับข้อความแล้ว เจ้าหน้าที่จะตอบกลับโดยเร็วที่สุด'
        || coalesce(E'\nเวลาทำการ: ' || hrs, ''));
  end if;
  update public.support_rooms set last_at = clock_timestamp(), last_from = 'user', last_body = left(body, 120),
    user_read_at = clock_timestamp() where user_id = uid and app = p_app;
  -- แจ้งแอดมิน (รวมเป็นรายการเดียวต่อห้องต่อ 2 นาที)
  if rm.admin_notified_at is null or rm.admin_notified_at < now() - interval '2 minutes' then
    update public.support_rooms set admin_notified_at = now() where user_id = uid and app = p_app;
    lbl := case p_app when 'shop' then 'ร้านนวด' when 'staff' then 'หมอนวด' else 'ผู้ใช้งาน' end;
    prev := left(body, 80) || case when char_length(body) > 80 then '...' else '' end;
    perform public.notify('admin', 'แชตใหม่จาก' || lbl || ' ' || coalesce(nullif(idn.name,''), ''), prev, p_kind => 'support');
  end if;
  return mid;
end $$;

-- ===== ฝั่งแอดมิน =====
create or replace function public.admin_support_rooms()
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'เฉพาะแอดมินเท่านั้น'; end if;
  return (select coalesce(jsonb_agg(jsonb_build_object('user_id',r.user_id,'app',r.app,'name',r.name,'phone',r.phone,
      'last_at',r.last_at,'last_from',r.last_from,'last_body',r.last_body,
      'unread',(select count(*) from public.support_messages m where m.user_id = r.user_id and m.app = r.app
                 and m.sender_role = 'user' and m.created_at > coalesce(r.admin_read_at,'epoch')))
      order by (r.last_from = 'user') desc, r.last_at desc), '[]'::jsonb)
    from public.support_rooms r where r.last_at is not null);
end $$;

create or replace function public.admin_support_messages(p_user uuid, p_app text, p_after timestamptz default null)
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'เฉพาะแอดมินเท่านั้น'; end if;
  return public._sup_msgs(p_user, p_app, p_after);
end $$;

create or replace function public.admin_support_mark_read(p_user uuid, p_app text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'เฉพาะแอดมินเท่านั้น'; end if;
  update public.support_rooms set admin_read_at = clock_timestamp() where user_id = p_user and app = p_app;
end $$;

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
    admin_read_at = clock_timestamp() where user_id = p_user and app = p_app;
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

create or replace function public.support_purge()
returns integer language sql security definer set search_path = public as $$
  with d as (delete from public.support_rooms where coalesce(last_at, created_at) < now() - interval '6 months' returning 1)
  select count(*)::int from d $$;
revoke all on function public.support_purge() from public, anon, authenticated;

do $$ declare f text; begin
  foreach f in array array['support_room(text, timestamptz)','support_mark_read(text)','support_unread(text)','support_send(text, text)',
    'admin_support_rooms()','admin_support_messages(uuid, text, timestamptz)','admin_support_mark_read(uuid, text)','admin_support_reply(uuid, text, text)']
  loop execute format('revoke all on function public.%s from public, anon', f);
       execute format('grant execute on function public.%s to authenticated', f); end loop;
end $$;

select cron.schedule('support-purge', '15 20 * * *', 'select public.support_purge()');
