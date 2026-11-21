-- 2026-11-22 ห้ามเครื่องหมาย < และ > ในชื่อที่แสดงให้คนอื่นเห็น (ชั้นป้องกันที่สองของการแก้ช่องโหว่ในแอปผู้ใช้งาน v1.42)
-- เดิมร้านตั้งชื่อร้าน/บริการ/หมอนวดเป็นคำสั่งหน้าเว็บได้ แล้วคำสั่งนั้นทำงานในเครื่องลูกค้า ตอนนี้แอปแสดงเป็นตัวหนังสือแล้ว
-- ตรวจก่อนรัน: ข้อมูลเดิมไม่มีเครื่องหมายนี้ในทุกช่องด้านล่าง (22 พ.ย. 2569)
-- ใช้ทริกเกอร์แทน check constraint เพื่อให้ข้อความแจ้งเป็นภาษาไทย (รหัส P0001 ทุกแอปแสดงข้อความตรงๆ อยู่แล้ว ไม่ต้องแก้แอป)
create or replace function public.no_angle_brackets()
 returns trigger language plpgsql set search_path = public as $$
declare j jsonb := to_jsonb(new); i int := 0; v text;
begin
  -- TG_ARGV เป็นคู่: ชื่อคอลัมน์, คำที่ใช้ในข้อความแจ้ง
  while i < tg_nargs loop
    v := j ->> tg_argv[i];
    if v ~ '[<>]' then
      raise exception '%ห้ามมีเครื่องหมาย < หรือ > กรุณาลบออกแล้วบันทึกใหม่', tg_argv[i + 1];
    end if;
    i := i + 2;
  end loop;
  return new;
end $$;
revoke execute on function public.no_angle_brackets() from public, anon, authenticated;

drop trigger if exists trg_nab_places on public.places;
create trigger trg_nab_places before insert or update of name, area on public.places
  for each row execute function public.no_angle_brackets('name', 'ชื่อ', 'area', 'ที่ตั้ง');

drop trigger if exists trg_nab_services on public.services;
create trigger trg_nab_services before insert or update of name on public.services
  for each row execute function public.no_angle_brackets('name', 'ชื่อบริการ');

drop trigger if exists trg_nab_staff on public.staff;
create trigger trg_nab_staff before insert or update of name on public.staff
  for each row execute function public.no_angle_brackets('name', 'ชื่อหมอนวด');

drop trigger if exists trg_nab_promotions on public.promotions;
create trigger trg_nab_promotions before insert or update of title on public.promotions
  for each row execute function public.no_angle_brackets('title', 'ชื่อโปรโมชั่น');

drop trigger if exists trg_nab_shop_reg on public.shop_registrations;
create trigger trg_nab_shop_reg before insert or update of name on public.shop_registrations
  for each row execute function public.no_angle_brackets('name', 'ชื่อร้าน');
