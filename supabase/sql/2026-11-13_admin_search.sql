-- ค้นหารวมสำหรับแอดมิน (ปุ่ม 🔍 บนแถบหัวแอปแอดมิน) อ่านอย่างเดียว เฉพาะแอดมิน
-- ค้นจาก: เลขที่การจอง ชื่อ/เบอร์ลูกค้า (การจองและบัญชี) ชื่อ/เบอร์ ร้าน หน่วยงาน บริษัท หมอนวด และร้านที่สมัครรออนุมัติ
-- เบอร์: ตัดทุกอย่างที่ไม่ใช่ตัวเลขทั้งคำค้นและข้อมูล (081-234-5678 = 0812345678) ต้องมีอย่างน้อย 3 หลัก
create or replace function public.admin_search(p_q text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare q text := btrim(coalesce(p_q,'')); d text; lk text; ql text;
begin
  if auth.uid() is null or not public.is_admin() then raise exception 'เฉพาะแอดมินเท่านั้น'; end if;
  if char_length(q) < 2 then raise exception 'พิมพ์อย่างน้อย 2 ตัวอักษร'; end if;
  q := left(q, 60);
  d := regexp_replace(q, '\D', '', 'g'); if char_length(d) < 3 then d := null; end if;
  lk := '%' || replace(replace(replace(q, '\', '\\'), '%', '\%'), '_', '\_') || '%';
  ql := upper(q);
  return jsonb_build_object(
   'bookings', coalesce((select jsonb_agg(x order by x->>'starts_at' desc) from (
      select jsonb_build_object('id',b.id,'ref',b.ref,'starts_at',b.starts_at,'ends_at',b.ends_at,'status',b.status,
        'customer_name',b.customer_name,'phone',b.phone,'customer_id',b.customer_id,'place_id',b.place_id,
        'place_name',pl.name,'place_type',pl.type,'total',b.total_price,'discount',coalesce(b.discount,0),
        'items',coalesce((select jsonb_agg(jsonb_build_object('service',i.service_name,'staff',s.name,'starts_at',i.starts_at,'price',i.price) order by i.starts_at)
            from public.booking_items i left join public.staff s on s.id = i.staff_id where i.booking_id = b.id and i.active),'[]'::jsonb)) x
      from public.bookings b left join public.places pl on pl.id = b.place_id
      where upper(b.ref) like '%' || ql || '%' or b.customer_name ilike lk
         or (d is not null and regexp_replace(coalesce(b.phone,''), '\D', '', 'g') like '%' || d || '%')
      order by b.starts_at desc limit 10) z), '[]'::jsonb),
   'customers', coalesce((select jsonb_agg(x) from (
      select jsonb_build_object('id',p.id,'name',btrim(coalesce(p.first_name,'') || ' ' || coalesce(p.last_name,'')),'phone',p.phone,
        'created_at',p.created_at,'suspended',p.suspended_at is not null,
        'kind',case when exists (select 1 from public.shop_members m where m.user_id = p.id) then 'shop'
                    when exists (select 1 from public.staff s where s.user_id = p.id) then 'staff' else 'user' end,
        'is_admin',exists (select 1 from public.admins a where a.user_id = p.id),
        'room',exists (select 1 from public.support_rooms r where r.user_id = p.id and r.app = 'user' and r.last_at is not null),
        'recent',coalesce((select jsonb_agg(jsonb_build_object('id',b.id,'ref',b.ref,'starts_at',b.starts_at,'status',b.status,'place_name',pl.name) order by b.starts_at desc)
            from (select * from public.bookings where customer_id = p.id order by starts_at desc limit 5) b
            left join public.places pl on pl.id = b.place_id),'[]'::jsonb)) x
      from public.profiles p
      where (btrim(coalesce(p.first_name,'') || ' ' || coalesce(p.last_name,''))) ilike lk
         or (d is not null and regexp_replace(coalesce(p.phone,''), '\D', '', 'g') like '%' || d || '%')
      order by p.created_at desc limit 10) z), '[]'::jsonb),
   'places', coalesce((select jsonb_agg(x) from (
      select jsonb_build_object('id',pl.id,'type',pl.type,'name',pl.name,'phone',pl.phone,'area',pl.area,'status',pl.status,'active',pl.active) x
      from public.places pl
      where pl.name ilike lk or (d is not null and regexp_replace(coalesce(pl.phone,''), '\D', '', 'g') like '%' || d || '%')
      order by pl.name limit 10) z), '[]'::jsonb),
   'staff', coalesce((select jsonb_agg(x) from (
      select jsonb_build_object('id',s.id,'name',s.name,'phone',s.phone,'place_id',s.place_id,'place_name',pl.name,'place_type',pl.type,
        'active',s.active,'linked',s.user_id is not null) x
      from public.staff s left join public.places pl on pl.id = s.place_id
      where s.name ilike lk or (d is not null and regexp_replace(coalesce(s.phone,''), '\D', '', 'g') like '%' || d || '%')
      order by s.active desc, s.name limit 10) z), '[]'::jsonb),
   'regs', coalesce((select jsonb_agg(x) from (
      select jsonb_build_object('id',r.id,'name',r.name,'phone',r.phone,'status',r.status,'created_at',r.created_at) x
      from public.shop_registrations r
      where r.status = 'pending' and (r.name ilike lk or (d is not null and regexp_replace(coalesce(r.phone,''), '\D', '', 'g') like '%' || d || '%'))
      order by r.created_at desc limit 10) z), '[]'::jsonb));
end $$;
revoke all on function public.admin_search(text) from public, anon;
grant execute on function public.admin_search(text) to authenticated;
