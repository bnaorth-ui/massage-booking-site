-- public_contact ส่งชื่อแอป (app) ด้วย ใช้ในข้อความชวนร้านนวดของแอปร้านนวดก่อนเข้าสู่ระบบ
create or replace function public.public_contact()
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce((select jsonb_build_object('name', association_name, 'phone', phone, 'line', line_url, 'hours', hours_text,
                                             'app', nullif(btrim(coalesce(app_name, '')), ''))
                     from public.app_settings limit 1), '{}'::jsonb) $$;
