-- เว็บประชาสัมพันธ์ หน้า "บริษัทและหน่วยงาน":
-- 1) ตารางข่าว site_articles รับประเภทใหม่ 'work' = ผลงานบริการ (หน่วยงานที่สมาคมไปให้บริการ มีรูปปก)
-- 2) public_contact() ส่งอัตราค่าบริการหน่วยงานต่อหมอนวด 1 คนต่อชั่วโมง (app_settings.org_rate_per_hour) ให้เว็บแสดงราคา
--    ตรงกับที่แอดมินตั้ง (แอปผู้ใช้งานแสดงอัตรานี้ในหน้าขอบริการสำหรับหน่วยงานอยู่แล้ว) ช่องอื่นคงเดิม ไม่เปลี่ยนสิทธิ์
alter table public.site_articles drop constraint if exists site_articles_kind_check;
alter table public.site_articles add constraint site_articles_kind_check check (kind in ('news', 'article', 'work'));

create or replace function public.public_contact()
 returns jsonb
 language sql
 stable security definer
 set search_path to 'public'
as $function$
  select coalesce((select jsonb_build_object('name', association_name, 'phone', phone, 'hours', hours_text,
                                             'app', nullif(btrim(coalesce(app_name, '')), ''), 'gp', gp_rate_default,
                                             'email', nullif(btrim(coalesce(email, '')), ''),
                                             'org_rate', org_rate_per_hour)
                     from public.app_settings limit 1), '{}'::jsonb) $function$;
