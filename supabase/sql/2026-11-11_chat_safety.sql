-- ความปลอดภัยในแชต: บล็อก, รายงาน, ระงับบัญชีลูกค้า, ยอมรับเงื่อนไขการใช้งาน (2026-11-11)
-- ทุกฟังก์ชันเป็น SECURITY DEFINER ตั้ง search_path = public เปิดสิทธิ์เฉพาะ authenticated
-- ตารางใหม่เปิด RLS ไม่มี policy (อ่าน/เขียนผ่านฟังก์ชันเท่านั้น) แอดมินอ่านแชตปกติไม่ได้ เห็นแค่สำเนาในรายงาน

-- ---------- ตาราง ----------
create table if not exists public.chat_blocks (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users(id) on delete cascade,
  party_kind text not null check (party_kind in ('shop','staff')),
  party_id uuid not null,                 -- places.id (ร้าน) หรือ staff.id (หมอนวด)
  by_party boolean not null,              -- true = ร้าน/หมอนวดบล็อกลูกค้า, false = ลูกค้าบล็อกร้าน/หมอนวด
  created_by uuid,
  created_at timestamptz not null default now(),
  unique (customer_id, party_kind, party_id, by_party)
);
create index if not exists chat_blocks_party_idx on public.chat_blocks (party_kind, party_id);
alter table public.chat_blocks enable row level security;

create table if not exists public.chat_reports (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete set null,
  booking_ref text,
  place_id uuid,
  room_key text not null,
  reporter_id uuid references auth.users(id) on delete set null,
  reporter_role text not null check (reporter_role in ('user','shop','staff')),
  customer_id uuid references auth.users(id) on delete set null,
  target_kind text not null check (target_kind in ('customer','shop','staff')),
  target_id uuid,
  target_name text,
  reason text not null check (reason in ('abuse','offplatform','sexual','scam','other')),
  detail text check (char_length(detail) <= 500),
  snapshot jsonb not null default '[]'::jsonb,
  status text not null default 'open' check (status in ('open','dismissed','warned','suspended')),
  admin_note text check (char_length(admin_note) <= 500),
  decided_by uuid,
  decided_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists chat_reports_status_idx on public.chat_reports (status, created_at desc);
create index if not exists chat_reports_reporter_idx on public.chat_reports (reporter_id);
create index if not exists chat_reports_booking_idx on public.chat_reports (booking_id);
alter table public.chat_reports enable row level security;
drop trigger if exists audit_chat_reports on public.chat_reports;
create trigger audit_chat_reports after update on public.chat_reports for each row execute function public._audit_trg();

alter table public.profiles add column if not exists suspended_at timestamptz;
alter table public.profiles add column if not exists suspended_note text;

create table if not exists public.terms_accepts (
  user_id uuid not null references auth.users(id) on delete cascade,
  app text not null check (app in ('customer','shop','staff')),
  version integer not null,
  accepted_at timestamptz not null default now(),
  primary key (user_id, app)
);
alter table public.terms_accepts enable row level security;
alter table public.app_settings add column if not exists terms_version integer not null default 1;

-- ---------- ตัวช่วย ----------
-- คู่สนทนาของห้อง: ลูกค้า + ร้าน (ห้อง shop) หรือ ลูกค้า + หมอนวด (ห้อง staff:<id>)
create or replace function public._room_party(p_booking uuid, p_room text, out customer_id uuid, out party_kind text, out party_id uuid)
language plpgsql stable security definer set search_path = public as $$
declare b public.bookings;
begin
  select * into b from public.bookings where id = p_booking;
  if not found then return; end if;
  customer_id := b.customer_id;
  if p_room = 'shop' then party_kind := 'shop'; party_id := b.place_id;
  elsif p_room like 'staff:%' then party_kind := 'staff'; begin party_id := substr(p_room, 7)::uuid; exception when others then party_id := null; end;
  end if;
end $$;

create or replace function public._is_suspended(p_user uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = p_user and suspended_at is not null)
$$;

-- ---------- ห้องแชต: สถานะ บล็อก ยกเลิกบล็อก ----------
create or replace function public.chat_room_state(p_booking uuid, p_room text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare uid uuid := auth.uid(); r text; rp record; mine public.chat_blocks; other boolean;
begin
  r := public._chat_role(p_booking, p_room, uid);
  if r is null then raise exception 'ไม่มีสิทธิ์ใช้ห้องแชตนี้'; end if;
  select * into rp from public._room_party(p_booking, p_room);
  select * into mine from public.chat_blocks c where c.customer_id = rp.customer_id and c.party_kind = rp.party_kind and c.party_id = rp.party_id and c.by_party = (r <> 'user');
  other := exists (select 1 from public.chat_blocks c where c.customer_id = rp.customer_id and c.party_kind = rp.party_kind and c.party_id = rp.party_id and c.by_party = (r = 'user'));
  return jsonb_build_object('role', r, 'blocked_by_me', mine.id is not null, 'block_id', mine.id, 'blocked_by_other', other,
    'reported', exists (select 1 from public.chat_reports where booking_id = p_booking and room_key = p_room and reporter_id = uid and status = 'open'),
    'suspended', r = 'user' and public._is_suspended(uid));
end $$;

create or replace function public.chat_block(p_booking uuid, p_room text)
returns uuid language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); r text; rp record; bid uuid;
begin
  r := public._chat_role(p_booking, p_room, uid);
  if r is null then raise exception 'ไม่มีสิทธิ์ใช้ห้องแชตนี้'; end if;
  select * into rp from public._room_party(p_booking, p_room);
  if rp.customer_id is null or rp.party_id is null then raise exception 'บล็อกห้องนี้ไม่ได้'; end if;
  insert into public.chat_blocks(customer_id, party_kind, party_id, by_party, created_by)
  values (rp.customer_id, rp.party_kind, rp.party_id, r <> 'user', uid)
  on conflict (customer_id, party_kind, party_id, by_party) do update set created_by = excluded.created_by
  returning id into bid;
  return bid;
end $$;

create or replace function public.chat_unblock(p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); c public.chat_blocks; ok boolean;
begin
  select * into c from public.chat_blocks where id = p_id;
  if not found then return; end if;
  ok := case when not c.by_party then c.customer_id = uid
             when c.party_kind = 'shop' then exists (select 1 from public.shop_members where place_id = c.party_id and user_id = uid)
             else exists (select 1 from public.staff where id = c.party_id and user_id = uid) end;
  if not ok then raise exception 'ไม่มีสิทธิ์ยกเลิกการบล็อกนี้'; end if;
  delete from public.chat_blocks where id = p_id;
end $$;

-- รายชื่อที่บล็อกไว้ของแอปนั้น (ร้านและหมอนวดเห็นแค่ชื่อต้นของลูกค้า)
create or replace function public.my_blocks(p_app text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'ต้องเข้าสู่ระบบก่อน'; end if;
  if p_app = 'customer' then
    return coalesce((select jsonb_agg(jsonb_build_object('id', c.id, 'name',
        case when c.party_kind = 'shop' then (select name from public.places where id = c.party_id) else (select name from public.staff where id = c.party_id) end,
        'kind', c.party_kind, 'at', c.created_at) order by c.created_at desc)
      from public.chat_blocks c where c.customer_id = uid and not c.by_party), '[]'::jsonb);
  elsif p_app in ('shop','staff') then
    return coalesce((select jsonb_agg(jsonb_build_object('id', c.id, 'name', coalesce(nullif(btrim(p.first_name), ''), 'ลูกค้า'), 'kind', 'customer', 'at', c.created_at) order by c.created_at desc)
      from public.chat_blocks c left join public.profiles p on p.id = c.customer_id
      where c.by_party and c.party_kind = p_app
        and ((p_app = 'shop' and exists (select 1 from public.shop_members m where m.place_id = c.party_id and m.user_id = uid))
          or (p_app = 'staff' and exists (select 1 from public.staff s where s.id = c.party_id and s.user_id = uid)))), '[]'::jsonb);
  end if;
  raise exception 'แอปไม่ถูกต้อง';
end $$;

-- ---------- รายงาน ----------
create or replace function public.chat_report(p_booking uuid, p_room text, p_reason text, p_detail text default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); r text; rp record; b public.bookings; tk text; tid uuid; tn text; snap jsonb; rid uuid; dt text := nullif(btrim(coalesce(p_detail, '')), '');
begin
  r := public._chat_role(p_booking, p_room, uid);
  if r is null then raise exception 'ไม่มีสิทธิ์ใช้ห้องแชตนี้'; end if;
  if p_reason is null or p_reason not in ('abuse','offplatform','sexual','scam','other') then raise exception 'กรุณาเลือกเหตุผล'; end if;
  if p_reason = 'other' and dt is null then raise exception 'กรุณาพิมพ์รายละเอียด'; end if;
  if char_length(dt) > 500 then raise exception 'รายละเอียดยาวเกินไป (ไม่เกิน 500 ตัวอักษร)'; end if;
  if exists (select 1 from public.chat_reports where booking_id = p_booking and room_key = p_room and reporter_id = uid and status = 'open') then
    raise exception 'คุณรายงานห้องนี้ไว้แล้ว รอเจ้าหน้าที่ตรวจสอบ'; end if;
  select * into b from public.bookings where id = p_booking;
  select * into rp from public._room_party(p_booking, p_room);
  if r = 'user' then
    tk := rp.party_kind; tid := rp.party_id;
    tn := case when tk = 'shop' then (select name from public.places where id = tid) else (select name from public.staff where id = tid) end;
  else
    tk := 'customer'; tid := rp.customer_id;
    tn := coalesce((select nullif(btrim(coalesce(first_name,'') || ' ' || coalesce(last_name,'')), '') from public.profiles where id = tid), b.customer_name);
  end if;
  select coalesce(jsonb_agg(jsonb_build_object('at', m.created_at, 'role', m.sender_role, 'name', m.sender_name, 'body', m.body) order by m.created_at), '[]'::jsonb)
    into snap from (select * from public.chat_messages where booking_id = p_booking and room_key = p_room order by created_at desc limit 30) m;
  insert into public.chat_reports(booking_id, booking_ref, place_id, room_key, reporter_id, reporter_role, customer_id, target_kind, target_id, target_name, reason, detail, snapshot)
  values (p_booking, b.ref, b.place_id, p_room, uid, r, rp.customer_id, tk, tid, tn, p_reason, dt, snap) returning id into rid;
  perform public.notify('admin', 'รายงานแชตใหม่', 'เลขที่ ' || coalesce(b.ref, '') || E'\nเหตุผล: ' ||
    case p_reason when 'abuse' then 'ไม่สุภาพหรือคุกคาม' when 'offplatform' then 'ชวนติดต่อหรือนัดนอกระบบ' when 'sexual' then 'เนื้อหาทางเพศ' when 'scam' then 'หลอกลวง' else 'อื่นๆ' end ||
    E'\nตรวจสอบได้ที่เมนู รีวิว > รายงานแชต', p_kind => 'report');
  return rid;
end $$;

create or replace function public.admin_chat_reports(p_status text default 'open')
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'เฉพาะแอดมิน'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object(
      'id', c.id, 'ref', c.booking_ref, 'place', (select name from public.places where id = c.place_id), 'room', c.room_key,
      'reporter_role', c.reporter_role, 'reporter_name', case when c.reporter_role = 'user' then (select coalesce(nullif(btrim(coalesce(first_name,'') || ' ' || coalesce(last_name,'')), ''), 'ลูกค้า') from public.profiles where id = c.reporter_id)
                                                          when c.reporter_role = 'shop' then (select name from public.places where id = c.place_id)
                                                          else (select name from public.staff where id::text = substr(c.room_key, 7)) end,
      'target_kind', c.target_kind, 'target_id', c.target_id, 'target_name', c.target_name,
      'target_suspended', c.target_kind = 'customer' and public._is_suspended(c.target_id),
      'reason', c.reason, 'detail', c.detail, 'snapshot', c.snapshot, 'status', c.status, 'admin_note', c.admin_note,
      'decided_at', c.decided_at, 'created_at', c.created_at) order by c.created_at desc)
    from public.chat_reports c where (p_status = 'all' or c.status = p_status) and (p_status = 'open' or c.created_at > now() - interval '12 months')), '[]'::jsonb);
end $$;

create or replace function public.admin_chat_report_resolve(p_id uuid, p_action text, p_note text default null)
returns void language plpgsql security definer set search_path = public as $$
declare c public.chat_reports; nt text := nullif(btrim(coalesce(p_note, '')), ''); msg text;
begin
  if not public.is_admin() then raise exception 'เฉพาะแอดมิน'; end if;
  if p_action not in ('dismissed','warned','suspended') then raise exception 'การดำเนินการไม่ถูกต้อง'; end if;
  select * into c from public.chat_reports where id = p_id for update;
  if not found then raise exception 'ไม่พบรายงานนี้'; end if;
  if c.status <> 'open' then raise exception 'รายงานนี้ตรวจสอบแล้ว'; end if;
  if p_action = 'suspended' and c.target_kind <> 'customer' then raise exception 'ระงับได้เฉพาะบัญชีลูกค้า ร้านหรือหมอนวดให้จัดการที่เมนูร้านนวดหรือหมอนวด'; end if;
  update public.chat_reports set status = p_action, admin_note = nt, decided_by = auth.uid(), decided_at = now() where id = p_id;
  msg := 'จากการตรวจสอบรายงานแชต (เลขที่ ' || coalesce(c.booking_ref, '-') || ') ' || coalesce('เหตุผล: ' || nt || ' ', '');
  if p_action = 'warned' then
    if c.target_kind = 'customer' and c.target_id is not null then
      perform public.notify('user', 'คำเตือนจากเจ้าหน้าที่', msg || 'กรุณาปฏิบัติตามเงื่อนไขการใช้งาน หากเกิดซ้ำ บัญชีอาจถูกระงับ', p_user => c.target_id, p_kind => 'approval');
    elsif c.target_kind = 'shop' then
      perform public.notify('shop', 'คำเตือนจากเจ้าหน้าที่', msg || 'กรุณาปฏิบัติตามเงื่อนไขการใช้งาน', p_place => c.target_id, p_kind => 'approval');
    elsif c.target_kind = 'staff' then
      perform public.notify('staff', 'คำเตือนจากเจ้าหน้าที่', msg || 'กรุณาปฏิบัติตามเงื่อนไขการใช้งาน', p_staff => c.target_id, p_kind => 'approval');
    end if;
  elsif p_action = 'suspended' and c.target_id is not null then
    update public.profiles set suspended_at = now(), suspended_note = nt where id = c.target_id;
    perform public.notify('user', 'บัญชีของคุณถูกระงับ', msg || 'คุณจองใหม่และส่งแชตไม่ได้ ยังดูประวัติและลบบัญชีได้ สอบถามได้ที่เมนูติดต่อเรา', p_user => c.target_id, p_kind => 'approval');
  end if;
  if c.reporter_id is not null then
    if c.reporter_role = 'user' then perform public.notify('user', 'เจ้าหน้าที่ตรวจสอบรายงานแล้ว', 'รายงานแชตเลขที่ ' || coalesce(c.booking_ref, '-') || ' ได้รับการตรวจสอบแล้ว ขอบคุณที่แจ้ง', p_user => c.reporter_id, p_kind => 'approval');
    elsif c.reporter_role = 'shop' then perform public.notify('shop', 'เจ้าหน้าที่ตรวจสอบรายงานแล้ว', 'รายงานแชตเลขที่ ' || coalesce(c.booking_ref, '-') || ' ได้รับการตรวจสอบแล้ว ขอบคุณที่แจ้ง', p_place => c.place_id, p_kind => 'approval');
    else perform public.notify('staff', 'เจ้าหน้าที่ตรวจสอบรายงานแล้ว', 'รายงานแชตเลขที่ ' || coalesce(c.booking_ref, '-') || ' ได้รับการตรวจสอบแล้ว ขอบคุณที่แจ้ง', p_staff => (select id from public.staff where id::text = substr(c.room_key, 7)), p_kind => 'approval');
    end if;
  end if;
end $$;

create or replace function public.admin_customer_unsuspend(p_user uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'เฉพาะแอดมิน'; end if;
  update public.profiles set suspended_at = null, suspended_note = null where id = p_user and suspended_at is not null;
  if found then perform public.notify('user', 'ยกเลิกการระงับบัญชีแล้ว', 'บัญชีของคุณกลับมาจองและส่งแชตได้ตามปกติ', p_user => p_user, p_kind => 'approval'); end if;
end $$;

-- ---------- เงื่อนไขการใช้งาน ----------
create or replace function public.terms_status(p_app text)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object('current', (select terms_version from public.app_settings limit 1),
    'accepted', (select version from public.terms_accepts where user_id = auth.uid() and app = p_app))
$$;

create or replace function public.accept_terms(p_app text)
returns void language plpgsql security definer set search_path = public as $$
declare v integer;
begin
  if auth.uid() is null then raise exception 'ต้องเข้าสู่ระบบก่อน'; end if;
  if p_app not in ('customer','shop','staff') then raise exception 'แอปไม่ถูกต้อง'; end if;
  select terms_version into v from public.app_settings limit 1;
  insert into public.terms_accepts(user_id, app, version) values (auth.uid(), p_app, coalesce(v, 1))
  on conflict (user_id, app) do update set version = excluded.version, accepted_at = now();
end $$;

-- ---------- กันการจองและคำขอหน่วยงานเมื่อถูกระงับหรือถูกบล็อก ----------
create or replace function public._guard_booking_block()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.customer_id is not null then
    if public._is_suspended(new.customer_id) then raise exception 'บัญชีของคุณถูกระงับ จองใหม่ไม่ได้ สอบถามได้ที่เมนูติดต่อเรา'; end if;
    if exists (select 1 from public.chat_blocks where customer_id = new.customer_id and party_kind = 'shop' and party_id = new.place_id and by_party) then
      raise exception 'จองร้านนี้ไม่ได้ กรุณาเลือกร้านอื่น'; end if;
  end if;
  return new;
end $$;
drop trigger if exists trg_guard_booking_block on public.bookings;
create trigger trg_guard_booking_block before insert on public.bookings for each row execute function public._guard_booking_block();

create or replace function public._guard_item_block()
returns trigger language plpgsql security definer set search_path = public as $$
declare cu uuid;
begin
  if new.staff_id is null then return new; end if;
  select customer_id into cu from public.bookings where id = new.booking_id;
  if cu is not null and exists (select 1 from public.chat_blocks where customer_id = cu and party_kind = 'staff' and party_id = new.staff_id and by_party) then
    raise exception 'จองหมอนวดคนนี้ไม่ได้ กรุณาเลือกหมอนวดคนอื่น'; end if;
  return new;
end $$;
drop trigger if exists trg_guard_item_block on public.booking_items;
create trigger trg_guard_item_block before insert or update of staff_id on public.booking_items for each row execute function public._guard_item_block();

create or replace function public._guard_orgreq_suspended()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.user_id is not null and public._is_suspended(new.user_id) then raise exception 'บัญชีของคุณถูกระงับ ส่งคำขอไม่ได้ สอบถามได้ที่เมนูติดต่อเรา'; end if;
  return new;
end $$;
drop trigger if exists trg_guard_orgreq_suspended on public.org_requests;
create trigger trg_guard_orgreq_suspended before insert on public.org_requests for each row execute function public._guard_orgreq_suspended();

-- ---------- สิทธิ์ ----------
do $g$
declare f text;
begin
  foreach f in array array['public._room_party(uuid,text)','public._is_suspended(uuid)','public.chat_room_state(uuid,text)','public.chat_block(uuid,text)',
    'public.chat_unblock(uuid)','public.my_blocks(text)','public.chat_report(uuid,text,text,text)','public.admin_chat_reports(text)',
    'public.admin_chat_report_resolve(uuid,text,text)','public.admin_customer_unsuspend(uuid)','public.terms_status(text)','public.accept_terms(text)'] loop
    execute 'revoke all on function ' || f || ' from public, anon';
    execute 'grant execute on function ' || f || ' to authenticated';
  end loop;
  foreach f in array array['public._guard_booking_block()','public._guard_item_block()','public._guard_orgreq_suspended()'] loop
    execute 'revoke all on function ' || f || ' from public, anon, authenticated';
  end loop;
end $g$;
-- ตัวช่วยภายใน ไม่ต้องเรียกจากหน้าเว็บ
revoke execute on function public._room_party(uuid,text) from authenticated;
revoke execute on function public._is_suspended(uuid) from authenticated;

-- ---------- ส่งแชต: ไม่รับเมื่อถูกบล็อกหรือบัญชีถูกระงับ ----------
do $c$
declare d text; d2 text;
begin
  d := pg_get_functiondef('public.chat_send(uuid,text,text)'::regprocedure);
  d2 := replace(d, $x$if r is null then raise exception 'ไม่มีสิทธิ์ใช้ห้องแชตนี้'; end if;$x$,
    $x$if r is null then raise exception 'ไม่มีสิทธิ์ใช้ห้องแชตนี้'; end if;
  if r = 'user' and public._is_suspended(uid) then raise exception 'บัญชีของคุณถูกระงับ ส่งแชตไม่ได้'; end if;
  if exists (select 1 from public.chat_blocks c, public._room_party(p_booking, p_room) rp
             where c.customer_id = rp.customer_id and c.party_kind = rp.party_kind and c.party_id = rp.party_id) then
    raise exception 'ส่งข้อความไม่ได้ เพราะมีการบล็อกระหว่างคุณกับอีกฝ่าย'; end if;$x$);
  if d2 = d then raise exception 'chat_send pattern not found'; end if;
  execute d2;
end $c$;

-- ---------- ลบรายงานที่เก่ากว่า 12 เดือน ----------
select cron.schedule('chat-reports-purge', '25 20 * * *', $$delete from public.chat_reports where created_at < now() - interval '12 months'$$);
