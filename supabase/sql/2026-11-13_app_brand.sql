-- หน้าตาแอปผู้ใช้งาน: แอดมินตั้งชื่อแอปและโลโก้แอปได้เอง (แยกจากชื่อและโลโก้สมาคม)
-- ว่าง = แอปผู้ใช้งานใช้ค่ามาตรฐานที่ฝังในหน้า ("จองคิวนวด" และโลโก้มือประคองใบไม้)
alter table public.app_settings add column if not exists app_name text;
alter table public.app_settings add column if not exists app_logo_path text;
alter table public.app_settings drop constraint if exists app_settings_app_name_len;
alter table public.app_settings add constraint app_settings_app_name_len check (app_name is null or char_length(app_name) <= 40);

CREATE OR REPLACE FUNCTION public.public_catalog()
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  with t as (select (now() at time zone 'Asia/Bangkok')::date as d)
  select jsonb_build_object(
    'places', coalesce((select jsonb_agg(jsonb_build_object(
        'id',p.id,'type',p.type,'category_id',p.category_id,'name',p.name,'area',p.area,
        'description',p.description,'image_path',p.image_path,'lat',p.lat,'lng',p.lng,
        'open_days',p.open_days,'open_time',p.open_time,'close_time',p.close_time,
        'fixed_date',p.fixed_date,'advance_days',p.advance_days,'cancel_hours',p.cancel_hours,
        'lunch_start',p.lunch_start,'lunch_end',p.lunch_end))
      from public.places p where p.status = 'approved' and p.active), '[]'::jsonb),
    'services', coalesce((select jsonb_agg(jsonb_build_object(
        'id',s.id,'place_id',s.place_id,'name',s.name,'minutes',s.minutes,'rest_minutes',s.rest_minutes,'price',s.price,
        'description',s.description,'applies_all',s.applies_all,'active',s.active,'image_path',s.image_path))
      from public.services s where s.active), '[]'::jsonb),
    'service_places', coalesce((select jsonb_agg(jsonb_build_object('service_id',x.service_id,'place_id',x.place_id))
      from public.service_places x), '[]'::jsonb),
    'staff', coalesce((select jsonb_agg(jsonb_build_object(
        'id',f.id,'name',f.name,'photo_path',f.photo_path,'place_id',f.place_id,'work_days',f.work_days))
      from public.staff_public f), '[]'::jsonb),
    'staff_services', coalesce((select jsonb_agg(jsonb_build_object('staff_id',x.staff_id,'service_id',x.service_id))
      from public.staff_services x where x.staff_id in (select id from public.staff_public)), '[]'::jsonb),
    'place_staff', coalesce((select jsonb_agg(jsonb_build_object('place_id',x.place_id,'staff_id',x.staff_id,'weekdays',x.weekdays))
      from public.place_staff x where x.staff_id in (select id from public.staff_public)), '[]'::jsonb),
    'place_subs', coalesce((select jsonb_agg(jsonb_build_object('place_id',x.place_id,'staff_id',x.staff_id,'day',x.day)) from public.company_substitutes x, t where x.day >= t.d and x.staff_id in (select id from public.staff_public)), '[]'::jsonb), 'days_off', coalesce((select jsonb_agg(jsonb_build_object('staff_id',x.staff_id,'day',x.day))
      from public.staff_days_off x, t where x.day >= t.d and x.staff_id in (select id from public.staff_public)), '[]'::jsonb),
    'promos', coalesce((select jsonb_agg(jsonb_build_object(
        'id',m.id,'place_id',m.place_id,'title',m.title,'description',m.description,'type',m.type,'value',m.value,
        'applies_all',m.applies_all,'start_date',m.start_date,'end_date',m.end_date,'image_path',m.image_path,'active',m.active))
      from public.promotions m, t where m.active and m.end_date >= t.d), '[]'::jsonb),
    'promo_services', coalesce((select jsonb_agg(jsonb_build_object('promotion_id',x.promotion_id,'service_id',x.service_id))
      from public.promotion_services x), '[]'::jsonb),
    'overrides', coalesce((select jsonb_agg(jsonb_build_object('place_id',x.place_id,'day',x.day,'closed',x.closed))
      from public.place_day_overrides x, t where x.closed and x.day >= t.d), '[]'::jsonb),
    'settings', (select jsonb_build_object(
        'association_name',a.association_name,'address',a.address,'phone',a.phone,'email',a.email,'line_url',a.line_url,
        'hours_text',a.hours_text,'register_url',a.register_url,
        'shop_radius_km',a.shop_radius_km,'org_radius_km',a.org_radius_km,
        'notify_user',a.notify_user,'notify_staff',a.notify_staff,'book_open_min',a.book_open_min,
        'longdo_key',a.longdo_key,'app_name',a.app_name,'app_logo_path',a.app_logo_path)
      from public.app_settings a limit 1),
    'ann', coalesce((select jsonb_agg(jsonb_build_object('title',n.title,'body',n.body,'audiences',n.audiences))
      from public.announcements n where n.active and 'ผู้ใช้งาน' = any(n.audiences)), '[]'::jsonb)
  )
$function$;
