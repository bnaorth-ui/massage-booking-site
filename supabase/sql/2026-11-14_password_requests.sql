-- ลืมรหัสผ่าน: ผู้ใช้ส่งคำขอ (ชื่อ นามสกุล เบอร์) เจ้าหน้าที่โทรกลับยืนยันตัวตน แล้วตั้งรหัสชั่วคราว (อย่างน้อย 6 ตัว)
-- เข้าสู่ระบบด้วยรหัสชั่วคราวแล้วต้องตั้งรหัสใหม่ (ธง must_change_pw ในข้อมูลผู้ใช้ของระบบล็อกอิน หน้าเว็บล้างธงตอนเปลี่ยนรหัส)
create table if not exists public.password_requests (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  first_name text not null,
  last_name text not null,
  app text not null check (app in ('user','shop','staff')),
  user_id uuid,
  name_match boolean not null default false,
  attempts integer not null default 1,
  status text not null default 'pending' check (status in ('pending','done','closed')),
  close_reason text,
  handled_by uuid,
  handled_name text,
  handled_at timestamptz,
  created_at timestamptz not null default now(),
  last_at timestamptz not null default now());
create index if not exists password_requests_phone on public.password_requests(phone, created_at desc);
create index if not exists password_requests_status on public.password_requests(status, created_at desc);
alter table public.password_requests enable row level security;   -- ไม่มีกฎ: เข้าถึงผ่านฟังก์ชันเท่านั้น

-- ส่งคำขอ (ไม่ต้องเข้าสู่ระบบ) ตอบเหมือนกันทุกกรณี ไม่บอกว่าเบอร์มีบัญชีหรือชื่อตรงหรือไม่
create or replace function public.request_password_reset(p_first text, p_last text, p_phone text, p_app text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare ph text := public.normalize_phone(p_phone); fn text := left(btrim(coalesce(p_first,'')), 60); ln text := left(btrim(coalesce(p_last,'')), 60);
  pr public.profiles; rq public.password_requests; n int; ok boolean;
begin
  if fn = '' or ln = '' then raise exception 'กรุณากรอกชื่อและนามสกุล'; end if;
  if ph is null or ph !~ '^0\d{9}$' then raise exception 'กรุณากรอกเบอร์มือถือ 10 หลัก ขึ้นต้นด้วย 0'; end if;
  if p_app not in ('user','shop','staff') then raise exception 'ข้อมูลไม่ถูกต้อง'; end if;
  if (select count(*) from public.password_requests where last_at > now() - interval '10 minutes') >= 30 then
    raise exception 'ขณะนี้มีคำขอจำนวนมาก กรุณาลองใหม่ภายหลัง หรือโทรหาเจ้าหน้าที่โดยตรง'; end if;
  select coalesce(sum(attempts), 0) into n from public.password_requests where phone = ph and created_at > now() - interval '24 hours';
  if n >= 3 then raise exception 'วันนี้ส่งคำขอสำหรับเบอร์นี้ครบแล้ว กรุณารอเจ้าหน้าที่โทรกลับ หรือโทรหาเจ้าหน้าที่โดยตรง'; end if;
  select * into pr from public.profiles where phone = ph limit 1;
  -- เทียบชื่อเต็ม (บางบัญชีเก็บชื่อและนามสกุลไว้ในช่องชื่อช่องเดียว) ไม่สนช่องว่างซ้ำและตัวพิมพ์
  ok := pr.id is not null
    and lower(regexp_replace(btrim(coalesce(pr.first_name,'') || ' ' || coalesce(pr.last_name,'')), '\s+', ' ', 'g'))
      = lower(regexp_replace(fn || ' ' || ln, '\s+', ' ', 'g'));
  select * into rq from public.password_requests where phone = ph and status = 'pending' order by created_at desc limit 1 for update;
  if found then
    update public.password_requests set attempts = attempts + 1, last_at = now(), first_name = fn, last_name = ln, app = p_app,
      user_id = pr.id, name_match = ok where id = rq.id;
  else
    insert into public.password_requests(phone, first_name, last_name, app, user_id, name_match)
      values (ph, fn, ln, p_app, pr.id, ok);
    insert into public.notifications(audience, kind, title, body, areas)
      values ('admin', 'pwreq', 'มีคำขอรหัสผ่านใหม่', fn || ' ' || ln || E'\nเบอร์ ' || ph
        || case when pr.id is null then ' (ไม่พบบัญชี)' when not ok then ' (ชื่อไม่ตรงกับบัญชี)' else '' end, array['users']);
  end if;
  return jsonb_build_object('ok', true, 'phone', ph);
end $$;
revoke all on function public.request_password_reset(text, text, text, text) from public;
grant execute on function public.request_password_reset(text, text, text, text) to anon, authenticated;

-- แอดมิน: รายการคำขอ (ค้าง หรือ ย้อนหลัง 60 วัน)
create or replace function public.admin_password_requests(p_history boolean default false)
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not public.admin_can('users') then raise exception 'บัญชีนี้ไม่มีสิทธิ์ใช้เมนูนี้ ติดต่อแอดมินหลัก'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object('id', r.id, 'phone', r.phone, 'first_name', r.first_name, 'last_name', r.last_name,
      'app', r.app, 'user_id', r.user_id, 'name_match', r.name_match, 'attempts', r.attempts, 'status', r.status,
      'close_reason', r.close_reason, 'handled_name', r.handled_name, 'handled_at', r.handled_at,
      'created_at', r.created_at, 'last_at', r.last_at,
      'account_name', btrim(coalesce(p.first_name,'') || ' ' || coalesce(p.last_name,'')),
      'is_admin', exists (select 1 from public.admins a where a.user_id = r.user_id),
      'kind', case when r.user_id is null then null
                   when exists (select 1 from public.shop_members m where m.user_id = r.user_id) then 'shop'
                   when exists (select 1 from public.staff s where s.user_id = r.user_id) then 'staff' else 'user' end)
      order by r.created_at desc)
    from public.password_requests r left join public.profiles p on p.id = r.user_id
    where case when p_history then r.status <> 'pending' and r.created_at > now() - interval '60 days' else r.status = 'pending' end), '[]'::jsonb);
end $$;
revoke all on function public.admin_password_requests(boolean) from public, anon;
grant execute on function public.admin_password_requests(boolean) to authenticated;

create or replace function public.admin_password_request_close(p_id uuid, p_reason text)
returns void language plpgsql security definer set search_path = public as $$
declare nm text;
begin
  if not public.admin_can('users') then raise exception 'บัญชีนี้ไม่มีสิทธิ์ใช้เมนูนี้ ติดต่อแอดมินหลัก'; end if;
  if btrim(coalesce(p_reason,'')) = '' then raise exception 'กรุณาเลือกเหตุผล'; end if;
  select btrim(coalesce(first_name,'') || ' ' || coalesce(last_name,'')) into nm from public.profiles where id = auth.uid();
  update public.password_requests set status = 'closed', close_reason = left(btrim(p_reason), 200), handled_by = auth.uid(),
    handled_name = coalesce(nm,''), handled_at = now() where id = p_id and status = 'pending';
  if not found then raise exception 'คำขอนี้ถูกจัดการไปแล้ว'; end if;
end $$;
revoke all on function public.admin_password_request_close(uuid, text) from public, anon;
grant execute on function public.admin_password_request_close(uuid, text) to authenticated;

-- ตั้งรหัสชั่วคราว: อย่างน้อย 6 ตัว ตั้งธงให้เปลี่ยนรหัส ปิดคำขอที่ค้างของเบอร์นี้
create or replace function public.admin_reset_password(p_user uuid, p_password text)
returns void language plpgsql security definer set search_path = public, auth, extensions as $$
declare me uuid := auth.uid(); pr record; an text;
begin
  if me is null or not public.admin_can('users') then raise exception 'บัญชีนี้ไม่มีสิทธิ์ใช้เมนูนี้ ติดต่อแอดมินหลัก'; end if;
  if p_password is null or length(p_password) < 6 then raise exception 'รหัสผ่านชั่วคราวต้องมีอย่างน้อย 6 ตัวอักษร'; end if;
  if p_user = me then raise exception 'ตั้งรหัสผ่านของตัวเองไม่ได้ที่นี่ ให้ใช้เมนูเปลี่ยนรหัสผ่านในหน้าบัญชี'; end if;
  if exists (select 1 from public.admins where user_id = p_user) then raise exception 'ตั้งรหัสผ่านให้บัญชีแอดมินไม่ได้'; end if;
  select id, trim(first_name || ' ' || last_name) as nm, phone into pr from public.profiles where id = p_user;
  if pr.id is null then raise exception 'ไม่พบผู้ใช้นี้'; end if;
  update auth.users set encrypted_password = extensions.crypt(p_password, extensions.gen_salt('bf', 10)), updated_at = now(),
    raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || '{"must_change_pw": true}'::jsonb where id = p_user;
  if not found then raise exception 'ไม่พบบัญชีผู้ใช้นี้'; end if;
  begin delete from auth.refresh_tokens where user_id::text = p_user::text; exception when undefined_table then null; end;
  begin delete from auth.sessions where user_id = p_user; exception when undefined_table then null; end;
  select trim(first_name || ' ' || last_name) into an from public.profiles where id = me;
  insert into public.password_reset_log(admin_id, admin_name, user_id, user_name, user_phone) values (me, coalesce(an, ''), p_user, pr.nm, pr.phone);
  update public.password_requests set status = 'done', close_reason = 'ตั้งรหัสชั่วคราวแล้ว', handled_by = me, handled_name = coalesce(an, ''), handled_at = now()
   where status = 'pending' and (user_id = p_user or phone = pr.phone);
end $$;

-- แจ้งเตือนคำขอรหัสผ่านใหม่ = หมวดผู้ใช้งานและประกาศ (ใช้เมื่อเรียก notify ทั่วไป)
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
      when 'pwreq' then array['users']
      else null end;
  end if;
  return new;
end $$;
revoke execute on function public.notif_area() from public, anon, authenticated;
