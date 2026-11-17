-- เว็บประชาสัมพันธ์ (site/): กล่อง "ติดต่อเรา" แสดงอีเมลสมาคมด้วย
-- public_contact() เปิดให้คนทั่วไป (anon) เรียกได้อยู่แล้ว เพิ่มช่อง email จาก app_settings.email
-- (อีเมลเดียวกับที่แอปผู้ใช้งานแสดงในกล่องติดต่อสมาคม) ช่องอื่นคงเดิม ไม่เปลี่ยนสิทธิ์
create or replace function public.public_contact()
 returns jsonb
 language sql
 stable security definer
 set search_path to 'public'
as $function$
  select coalesce((select jsonb_build_object('name', association_name, 'phone', phone, 'hours', hours_text,
                                             'app', nullif(btrim(coalesce(app_name, '')), ''), 'gp', gp_rate_default,
                                             'email', nullif(btrim(coalesce(email, '')), ''))
                     from public.app_settings limit 1), '{}'::jsonb) $function$;
