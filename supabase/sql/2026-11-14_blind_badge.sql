-- 2026-11-14 ป้าย "ร้านของคนพิการทางการเห็น" + ค่า GP ตามป้าย
-- ร้านติ๊กขอป้ายตอนสมัครพร้อมแนบบัตรคนพิการ เจ้าหน้าที่ (สิทธิ์หมวดร้านนวด) ตรวจแล้วเปิดป้าย
-- เปิดป้าย = GP ตามอัตราร้านของคนพิการทางการเห็น (ตั้งค่าได้ ค่าเริ่มต้น 5) ปิดป้าย = อัตราร้านทั่วไป (ค่าเริ่มต้น 10)
-- รูปบัตรลบทิ้งหลังอนุมัติหรือไม่อนุมัติ (แอปแอดมินลบไฟล์ ฐานข้อมูลล้าง card_path)

-- 1) ช่องข้อมูล
alter table public.places
  add column if not exists blind_owned boolean not null default false,
  add column if not exists blind_by uuid,
  add column if not exists blind_at timestamptz;
alter table public.shop_registrations
  add column if not exists blind_owner boolean not null default false,
  add column if not exists card_path text,
  add column if not exists blind_consent_at timestamptz;
alter table public.app_settings
  add column if not exists gp_rate_default numeric not null default 10 check (gp_rate_default >= 0 and gp_rate_default <= 100),
  add column if not exists gp_rate_blind numeric not null default 5 check (gp_rate_blind >= 0 and gp_rate_blind <= 100);

-- 2) ใบสมัคร: ติ๊กขอป้ายต้องมีรูปบัตรในโฟลเดอร์ของตัวเอง บันทึกเวลายินยอม (ทริกเกอร์เดิม BEFORE INSERT)
create or replace function public.trg_sr_gp_accept()
 returns trigger language plpgsql set search_path = public as $$
begin
  if new.gp_accepted_percent is not null then new.gp_accepted_at := now();
  else new.gp_accepted_at := null; end if;
  if new.blind_owner then
    if new.card_path is null or split_part(new.card_path, '/', 1) <> new.owner_user_id::text then
      raise exception 'กรุณาแนบรูปบัตรประจำตัวคนพิการ';
    end if;
    new.blind_consent_at := now();
  else
    new.card_path := null; new.blind_consent_at := null;
  end if;
  return new;
end $$;
revoke execute on function public.trg_sr_gp_accept() from public, anon, authenticated;

-- 3) ร้านแก้ป้ายเองไม่ได้
create or replace function public.guard_places()
 returns trigger language plpgsql set search_path = public as $$
begin
  if auth.uid() is not null and not public.is_admin() and coalesce(current_setting('app.sys', true), '') <> '1' then
    if new.gp_percent is distinct from old.gp_percent or new.status is distinct from old.status
       or new.type is distinct from old.type or new.category_id is distinct from old.category_id
       or new.auto_closed is distinct from old.auto_closed or new.closed_at is distinct from old.closed_at then
      raise exception 'GP สถานะ ประเภท และหมวดหมู่ของร้าน แก้ได้เฉพาะเจ้าหน้าที่';
    end if;
    if new.blind_owned is distinct from old.blind_owned or new.blind_by is distinct from old.blind_by
       or new.blind_at is distinct from old.blind_at then
      raise exception 'ป้ายร้านของคนพิการทางการเห็น แก้ได้เฉพาะเจ้าหน้าที่';
    end if;
    if new.active and not old.active and old.closed_at is not null then
      raise exception 'ร้านนี้ปิดบัญชีแล้ว เปิดรับจองเองไม่ได้ กรุณาติดต่อเจ้าหน้าที่';
    end if;
    if new.active and not old.active and old.auto_closed then
      raise exception 'ร้านถูกปิดอัตโนมัติเพราะยอดกระเป๋าเงินไม่พอ ต้องเติมเงินก่อน ระบบจะเปิดร้านให้เองเมื่อชำระค่าค้างครบ';
    end if;
  end if;
  if new.active and not old.active and old.closed_at is not null and new.closed_at is not distinct from old.closed_at then
    new.closed_at := null;   -- แอดมินเปิดร้านกลับ
  end if;
  return new;
end $$;
revoke execute on function public.guard_places() from public, anon, authenticated;

-- 4) เจ้าหน้าที่เปิด/ปิดป้าย (GP ตามอัตราในการตั้งค่า หรือค่าที่ส่งมา)
create or replace function public.admin_set_blind(p_place uuid, p_on boolean, p_gp numeric default null)
 returns numeric language plpgsql security definer set search_path = public as $$
declare pl public.places; g numeric;
begin
  if not public.admin_can('shop') then raise exception 'บัญชีนี้ไม่มีสิทธิ์ใช้เมนูนี้ ติดต่อแอดมินหลัก'; end if;
  if p_on is null then raise exception 'ไม่ได้ระบุว่าจะเปิดหรือปิดป้าย'; end if;
  if p_gp is not null and not (p_gp >= 0 and p_gp <= 100) then raise exception 'ค่า GP ต้องอยู่ระหว่าง 0-100'; end if;
  select * into pl from public.places where id = p_place and type = 'shop' for update;
  if not found then raise exception 'ไม่พบร้านนี้'; end if;
  select case when p_on then gp_rate_blind else gp_rate_default end into g from public.app_settings limit 1;
  g := coalesce(p_gp, g, case when p_on then 5 else 10 end);
  if pl.blind_owned = p_on and pl.gp_percent = g then return g; end if;
  update public.places set blind_owned = p_on,
    blind_by = case when p_on then coalesce(case when pl.blind_owned then pl.blind_by end, auth.uid()) end,
    blind_at = case when p_on then coalesce(case when pl.blind_owned then pl.blind_at end, now()) end,
    gp_percent = g
  where id = p_place;
  if pl.blind_owned is distinct from p_on then
    perform public.notify('shop',
      case when p_on then 'ร้านได้รับป้ายร้านของคนพิการทางการเห็น' else 'ยกเลิกป้ายร้านของคนพิการทางการเห็น' end,
      case when p_on then 'เจ้าหน้าที่ตรวจสอบแล้ว ลูกค้าจะเห็นป้าย ร้านของคนพิการทางการเห็น ที่ร้าน ' || pl.name || E'\nค่า GP ' || trim_scale(g)::text || '%'
           else 'เจ้าหน้าที่ยกเลิกป้ายร้านของคนพิการทางการเห็นของร้าน ' || pl.name || E'\nค่า GP ' || trim_scale(g)::text || '% สอบถามได้ทางแชตกับเจ้าหน้าที่ในเมนูติดต่อเรา' end,
      p_place => p_place, p_kind => 'approval');
  end if;
  return g;
end $$;
revoke execute on function public.admin_set_blind(uuid, boolean, numeric) from public, anon;
grant execute on function public.admin_set_blind(uuid, boolean, numeric) to authenticated;

-- 5) อนุมัติร้าน: เพิ่ม p_blind, GP ว่าง = ตามอัตราในการตั้งค่า, ล้างที่อยู่รูปบัตร
drop function if exists public.approve_shop_registration(uuid, numeric, numeric);
create function public.approve_shop_registration(p_reg uuid, p_gp numeric default null, p_credit numeric default 0, p_blind boolean default false)
 returns uuid language plpgsql security definer set search_path = public as $$
declare r public.shop_registrations; pid uuid; g numeric; bl boolean := coalesce(p_blind, false);
begin
  if auth.uid() is not null and not public.admin_can('shop') then raise exception 'บัญชีนี้ไม่มีสิทธิ์ใช้เมนูนี้ ติดต่อแอดมินหลัก'; end if;
  select * into r from public.shop_registrations where id = p_reg and status = 'pending' for update;
  if not found then raise exception 'ไม่พบคำขอ หรือดำเนินการไปแล้ว'; end if;
  if bl and not r.blind_owner then raise exception 'ร้านนี้ไม่ได้ขอป้ายร้านของคนพิการทางการเห็น เปิดป้ายภายหลังได้ที่หน้าแก้ไขร้าน'; end if;
  if p_gp is not null and not (p_gp >= 0 and p_gp <= 100) then raise exception 'ค่า GP ต้องอยู่ระหว่าง 0-100'; end if;
  select case when bl then gp_rate_blind else gp_rate_default end into g from public.app_settings limit 1;
  g := coalesce(p_gp, g, case when bl then 5 else 10 end);
  insert into public.places(type, category_id, name, phone, image_path, gp_percent, status, blind_owned, blind_by, blind_at)
  values ('shop', r.category_id, r.name, r.phone, r.image_path, g, 'approved', bl,
          case when bl then auth.uid() end, case when bl then now() end) returning id into pid;
  insert into public.shop_members(place_id, user_id) values (pid, r.owner_user_id);
  if p_credit > 0 then
    insert into public.wallet_tx(place_id, type, amount, note, created_by)
    values (pid, 'credit', p_credit, 'เครดิตต้อนรับร้านใหม่', auth.uid());
  end if;
  update public.shop_registrations set status = 'approved', place_id = pid, reviewed_by = auth.uid(), reviewed_at = now(), card_path = null where id = p_reg;
  perform public.notify('shop', 'อนุมัติร้านเรียบร้อยแล้ว',
    'เจ้าหน้าที่อนุมัติร้าน ' || r.name || ' เรียบร้อยแล้ว เริ่มตั้งค่าร้าน เพิ่มบริการและพนักงาน แล้วเปิดรับจองได้ทันที'
    || case when bl then E'\nร้านของคุณได้รับป้ายร้านของคนพิการทางการเห็น ค่า GP ' || trim_scale(g)::text || '%' else '' end,
    p_place => pid, p_kind => 'approval');
  if p_credit > 0 then
    perform public.notify('shop', 'ได้รับเครดิตวงเงินเบื้องต้น', 'เครดิต ' || to_char(p_credit, 'FM999,999,990') || ' บาท เข้ากระเป๋าเงินระบบของร้านแล้ว', p_place => pid, p_kind => 'credit');
  end if;
  return pid;
end $$;
revoke execute on function public.approve_shop_registration(uuid, numeric, numeric, boolean) from public, anon;
grant execute on function public.approve_shop_registration(uuid, numeric, numeric, boolean) to authenticated;

create or replace function public.reject_shop_registration(p_reg uuid, p_reason text default null)
 returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.admin_can('shop') then raise exception 'บัญชีนี้ไม่มีสิทธิ์ใช้เมนูนี้ ติดต่อแอดมินหลัก'; end if;
  update public.shop_registrations set status = 'rejected', reject_reason = p_reason, reviewed_by = auth.uid(), reviewed_at = now(), card_path = null
  where id = p_reg and status = 'pending';
  if not found then raise exception 'ไม่พบคำขอ หรือดำเนินการไปแล้ว'; end if;
end $$;

-- 6) แอปแอดมินลบไฟล์รูปบัตรได้ (เฉพาะไฟล์ card-*)
drop policy if exists "licenses card delete" on storage.objects;
create policy "licenses card delete" on storage.objects for delete to authenticated
  using (bucket_id = 'licenses' and name like '%/card-%' and public.admin_can('shop'));

-- 7) แอปผู้ใช้งานเห็นป้าย, แอปร้านนวด (ก่อนเข้าสู่ระบบ) เห็นอัตรา GP ร้านทั่วไป
do $$
declare d text; o text := $a$'lunch_start',p.lunch_start,'lunch_end',p.lunch_end))$a$;
begin
  select pg_get_functiondef('public.public_catalog'::regproc) into d;
  if (length(d) - length(replace(d, o, ''))) / length(o) <> 1 then raise exception 'public_catalog เปลี่ยนไปจากที่คาด'; end if;
  execute replace(d, o, $a$'lunch_start',p.lunch_start,'lunch_end',p.lunch_end,'blind',p.blind_owned))$a$);
end $$;

create or replace function public.public_contact()
 returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce((select jsonb_build_object('name', association_name, 'phone', phone, 'line', line_url, 'hours', hours_text,
                                             'app', nullif(btrim(coalesce(app_name, '')), ''), 'gp', gp_rate_default)
                     from public.app_settings limit 1), '{}'::jsonb) $$;
