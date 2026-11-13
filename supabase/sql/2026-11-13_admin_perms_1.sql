-- แบ่งสิทธิ์แอดมิน ครั้งที่ 1: โครงสร้าง (สิทธิ์ต่อคน คำสั่งตรวจสิทธิ์ แก้สิทธิ์ เชิญพร้อมสิทธิ์)
-- หมวด: owner (แอดมินหลัก ทำได้ทุกอย่าง), chat, queue, shop, org, staff, finance, safety, users
alter table public.admins add column if not exists perms text[] not null default '{}';
update public.admins set perms = '{owner}' where perms = '{}';
alter table public.admin_invites add column if not exists perms text[] not null default '{chat,queue,shop,staff}';

create or replace function public.admin_perm_ok(p text[]) returns boolean language sql immutable set search_path = public as $$
  select p is not null and cardinality(p) > 0 and p <@ array['owner','chat','queue','shop','org','staff','finance','safety','users']::text[] $$;

create or replace function public.admin_can(p_area text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid() and ('owner' = any(perms) or p_area = any(perms))) $$;
revoke all on function public.admin_can(text) from public, anon;
grant execute on function public.admin_can(text) to authenticated;

create or replace function public.my_admin_perms() returns text[]
language sql stable security definer set search_path = public as $$
  select perms from public.admins where user_id = auth.uid() $$;
revoke all on function public.my_admin_perms() from public, anon;
grant execute on function public.my_admin_perms() to authenticated;

-- แก้สิทธิ์ (เฉพาะแอดมินหลัก) ต้องเหลือแอดมินหลักอย่างน้อย 1 คน
create or replace function public.admin_set_perms(p_user uuid, p_perms text[]) returns void
language plpgsql security definer set search_path = public as $$
declare ps text[];
begin
  if not public.admin_can('owner') then raise exception 'เฉพาะแอดมินหลักเท่านั้น'; end if;
  select array_agg(distinct x order by x) into ps from unnest(coalesce(p_perms,'{}')) x;
  if 'owner' = any(ps) then ps := '{owner}'; end if;
  if not public.admin_perm_ok(ps) then raise exception 'เลือกสิทธิ์อย่างน้อย 1 หมวด'; end if;
  if not exists (select 1 from public.admins where user_id = p_user) then raise exception 'ไม่พบแอดมินคนนี้'; end if;
  if not ('owner' = any(ps)) and not exists (select 1 from public.admins where user_id <> p_user and 'owner' = any(perms)) then
    raise exception 'ต้องมีแอดมินหลักอย่างน้อย 1 คน'; end if;
  update public.admins set perms = ps where user_id = p_user;
end $$;
revoke all on function public.admin_set_perms(uuid, text[]) from public, anon;
grant execute on function public.admin_set_perms(uuid, text[]) to authenticated;

drop function if exists public.admin_list();
create function public.admin_list()
returns table(user_id uuid, name text, phone text, created_at timestamptz, perms text[])
language plpgsql stable security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.admin_can('owner') then raise exception 'เฉพาะแอดมินหลักเท่านั้น'; end if;
  return query select a.user_id, btrim(coalesce(p.first_name,'') || ' ' || coalesce(p.last_name,'')), p.phone, a.created_at, a.perms
    from public.admins a left join public.profiles p on p.id = a.user_id order by a.created_at;
end $$;
revoke all on function public.admin_list() from public, anon;
grant execute on function public.admin_list() to authenticated;

drop function if exists public.admin_invite_list();
create function public.admin_invite_list()
returns table(id uuid, phone text, created_at timestamptz, expires_at timestamptz, attempts integer, perms text[])
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.admin_can('owner') then raise exception 'เฉพาะแอดมินหลักเท่านั้น'; end if;
  return query select i.id, i.phone, i.created_at, i.expires_at, i.attempts, i.perms from public.admin_invites i
    where i.used_at is null and i.cancelled_at is null order by i.created_at desc;
end $$;
revoke all on function public.admin_invite_list() from public, anon;
grant execute on function public.admin_invite_list() to authenticated;

drop function if exists public.admin_invite_create(text);
create function public.admin_invite_create(p_phone text, p_perms text[] default '{chat,queue,shop,staff}')
returns jsonb language plpgsql security definer set search_path = public as $$
declare ph text := public.normalize_phone(p_phone); code text; iid uuid := gen_random_uuid(); exp timestamptz := now() + interval '48 hours'; ps text[];
begin
  if not public.admin_can('owner') then raise exception 'เฉพาะแอดมินหลักเท่านั้น'; end if;
  select array_agg(distinct x order by x) into ps from unnest(coalesce(p_perms,'{}')) x;
  if 'owner' = any(ps) then ps := '{owner}'; end if;
  if not public.admin_perm_ok(ps) then raise exception 'เลือกสิทธิ์อย่างน้อย 1 หมวด'; end if;
  if ph is null or ph !~ '^0\d{9}$' then raise exception 'เบอร์มือถือต้องเป็นตัวเลข 10 หลักขึ้นต้นด้วย 0'; end if;
  if exists (select 1 from public.profiles where phone = ph) then
    raise exception 'เบอร์นี้มีบัญชีอยู่แล้ว ให้ใช้ปุ่ม เพิ่มเป็นแอดมิน แทน (เจ้าของเบอร์ล็อกอินด้วยรหัสผ่านเดิม)'; end if;
  update public.admin_invites set cancelled_at = now() where phone = ph and used_at is null and cancelled_at is null;
  code := lpad((('x' || substr(md5(gen_random_uuid()::text), 1, 8))::bit(32)::bigint % 1000000)::text, 6, '0');
  insert into public.admin_invites(id, phone, code_hash, created_by, expires_at, perms)
  values (iid, ph, encode(sha256(convert_to(code || ':' || iid::text, 'utf8')), 'hex'), auth.uid(), exp, ps);
  return jsonb_build_object('id', iid, 'phone', ph, 'code', code, 'expires_at', exp, 'perms', ps);
end $$;
revoke all on function public.admin_invite_create(text, text[]) from public, anon;
grant execute on function public.admin_invite_create(text, text[]) to authenticated;

drop function if exists public.add_admin(text);
create function public.add_admin(p_phone text, p_perms text[] default '{chat,queue,shop,staff}')
returns void language plpgsql security definer set search_path = public as $$
declare ph text := public.normalize_phone(p_phone); uid uuid; ps text[];
begin
  if auth.uid() is not null and not public.admin_can('owner') then raise exception 'เฉพาะแอดมินหลักเท่านั้น'; end if;
  select array_agg(distinct x order by x) into ps from unnest(coalesce(p_perms,'{}')) x;
  if 'owner' = any(ps) then ps := '{owner}'; end if;
  if not public.admin_perm_ok(ps) then raise exception 'เลือกสิทธิ์อย่างน้อย 1 หมวด'; end if;
  select id into uid from public.profiles where phone = ph;
  if uid is null then raise exception 'ไม่พบบัญชีที่ใช้เบอร์นี้ ให้เจ้าของเบอร์สมัครสมาชิกก่อน'; end if;
  insert into public.admins(user_id, perms) values (uid, ps) on conflict do nothing;
end $$;
revoke all on function public.add_admin(text, text[]) from public, anon;
grant execute on function public.add_admin(text, text[]) to authenticated;

create or replace function public.remove_admin(p_user uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.admin_can('owner') then raise exception 'เฉพาะแอดมินหลักเท่านั้น'; end if;
  if p_user = auth.uid() then raise exception 'ลบสิทธิ์ของตัวเองไม่ได้'; end if;
  if (select count(*) from public.admins) <= 1 then raise exception 'ต้องมีแอดมินอย่างน้อย 1 คน'; end if;
  if exists (select 1 from public.admins where user_id = p_user and 'owner' = any(perms))
     and not exists (select 1 from public.admins where user_id <> p_user and 'owner' = any(perms)) then
    raise exception 'ต้องมีแอดมินหลักอย่างน้อย 1 คน'; end if;
  delete from public.admins where user_id = p_user;
end $$;

-- รับคำเชิญ: ใส่สิทธิ์ตามคำเชิญ
create or replace function public.admin_invite_claim(p_code text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); ph text; inv public.admin_invites; pr public.profiles; bad constant jsonb := jsonb_build_object('ok', false, 'msg', 'รหัสเชิญไม่ถูกต้อง หรือคำเชิญหมดอายุ ให้ขอรหัสใหม่จากแอดมิน');
begin
  if uid is null then raise exception 'ต้องเข้าสู่ระบบก่อน'; end if;
  if public.is_admin() then return jsonb_build_object('ok', true, 'msg', 'เป็นแอดมินอยู่แล้ว'); end if;
  select * into pr from public.profiles where id = uid;
  ph := public.normalize_phone(pr.phone);
  if ph is null then return bad; end if;
  select * into inv from public.admin_invites where phone = ph and used_at is null and cancelled_at is null for update;
  if not found or inv.expires_at < now() or inv.attempts >= 5 then return bad; end if;
  if encode(sha256(convert_to(btrim(coalesce(p_code, '')) || ':' || inv.id::text, 'utf8')), 'hex') <> inv.code_hash then
    update public.admin_invites set attempts = attempts + 1 where id = inv.id;
    return bad;
  end if;
  update public.admin_invites set used_at = now(), used_by = uid where id = inv.id;
  insert into public.admins(user_id, perms) values (uid, case when public.admin_perm_ok(inv.perms) then inv.perms else '{chat,queue,shop,staff}' end) on conflict do nothing;
  perform public.notify('admin', 'มีแอดมินใหม่เข้าร่วม', btrim(coalesce(pr.first_name, '') || ' ' || coalesce(pr.last_name, '')) || E'\nเบอร์ ' || ph, p_kind => 'status');
  return jsonb_build_object('ok', true, 'msg', 'ok');
end $$;

create or replace function public.admin_invite_cancel(p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.admin_can('owner') then raise exception 'เฉพาะแอดมินหลักเท่านั้น'; end if;
  update public.admin_invites set cancelled_at = now() where id = p_id and used_at is null and cancelled_at is null;
end $$;
revoke all on function public.admin_perm_ok(text[]) from public, anon;
grant execute on function public.admin_perm_ok(text[]) to authenticated;
