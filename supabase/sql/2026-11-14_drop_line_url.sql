-- 2026-11-14 ลบลิงก์ LINE ติดต่อเจ้าหน้าที่ที่เลิกใช้แล้ว (เปลี่ยนเป็นแชตในแอปตั้งแต่ก่อนหน้านี้ ไม่มีแอปไหนอ่านค่านี้)
-- ไม่แตะปุ่มแชร์ไป LINE ในแอปแอดมิน และช่อง LINE ID ในใบสมัครหมอนวด
do $$
declare d text; o text := $a$'line_url',a.line_url,$a$;
begin
  select pg_get_functiondef('public.public_catalog'::regproc) into d;
  if (length(d) - length(replace(d, o, ''))) / length(o) <> 1 then raise exception 'public_catalog เปลี่ยนไปจากที่คาด'; end if;
  execute replace(d, o, '');
end $$;

create or replace function public.public_contact()
 returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce((select jsonb_build_object('name', association_name, 'phone', phone, 'hours', hours_text,
                                             'app', nullif(btrim(coalesce(app_name, '')), ''), 'gp', gp_rate_default)
                     from public.app_settings limit 1), '{}'::jsonb) $$;

alter table public.app_settings drop column if exists line_url;
