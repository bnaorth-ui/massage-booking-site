-- 2026-11-24 ส่งเวลาเตือนก่อนนัด (app_settings.remind_mins ที่แอดมินตั้ง) ให้แอปผู้ใช้งานผ่าน public_catalog().settings
-- เดิมแอปผู้ใช้งานฝังค่า "ก่อนนัด 2 ชั่วโมง" ไว้เอง ไม่ตรงกับที่ send_reminders() เตือนจริง (customer v1.49 อ่านค่านี้)
-- วิธี: อ่านนิยามเดิม แทรกคีย์ใหม่หลัง 'app_logo_path' (ต้องเจอครั้งเดียว ไม่งั้นหยุด) แล้วสร้างใหม่ สิทธิ์เดิมคงอยู่ (create or replace)
do $$
declare d text; o text := '''app_logo_path'',a.app_logo_path)'; cnt int;
begin
  d := pg_get_functiondef('public.public_catalog'::regproc);
  cnt := (length(d) - length(replace(d, o, ''))) / length(o);
  if cnt <> 1 then raise exception 'public_catalog: พบ % ครั้ง (คาด 1)', cnt; end if;
  d := replace(d, o, '''app_logo_path'',a.app_logo_path,''remind_mins'',a.remind_mins)');
  execute d;
end $$;
