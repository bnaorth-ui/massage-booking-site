-- แบ่งสิทธิ์แอดมิน ครั้งที่ 2: ฟังก์ชันหลังบ้านและสิทธิ์เขียนตาราง ตรวจตามหมวด (แอดมินหลักผ่านทุกหมวด)
-- การอ่านข้อมูลทั่วไปยังเปิดให้แอดมินทุกคน (หน้าเว็บซ่อนเมนูที่ไม่มีสิทธิ์) ส่วนการกระทำและการเขียนตรวจตามหมวด
-- ฟังก์ชันที่ยังใช้ is_admin() ตามเดิม: _audit_trg, guard_places, guard_staff, is_booking_party, cancel_booking,
--   cancel_topup, attach_topup_slip, delete_my_account, shop_save_staff, shop_save_promotion, admin_invite_claim, admin_shop_overview
do $m$ declare r record; d text; n int := 0;
begin
  for r in
    with m(fn, area) as (values
      ('admin_support_mark_read','chat'),('admin_support_messages','chat'),('admin_support_reply','chat'),
      ('admin_support_rooms','chat'),('admin_support_viewing','chat'),
      ('admin_shop_close_requests','shop'),('admin_shop_close_resolve','shop'),
      ('approve_shop_registration','shop'),('reject_shop_registration','shop'),
      ('admin_company_application_activate','org'),('admin_company_application_discard','org'),
      ('admin_company_application_make_draft','org'),('admin_company_application_set','org'),('admin_company_applications','org'),
      ('admin_company_contact_add','org'),('admin_company_contact_remove','org'),('admin_company_contacts','org'),
      ('admin_company_handover_decide','org'),('admin_company_handovers','org'),
      ('admin_company_sub_assign','org'),('admin_company_sub_candidates','org'),('admin_company_sub_remove','org'),
      ('admin_handover_candidates','org'),('admin_handover_decide','org'),('admin_handovers','org'),
      ('admin_org_close_invites','org'),('admin_org_invite_respond','org'),('admin_org_remove_staff','org'),
      ('admin_org_replace_staff','org'),('admin_org_request_approve','org'),('admin_org_request_reject','org'),
      ('admin_save_place','org'),
      ('admin_save_staff','staff'),('admin_staff_application_set','staff'),('admin_staff_applications','staff'),
      ('admin_staff_delete_requests','staff'),('admin_staff_delete_resolve','staff'),('admin_staff_leave_add','staff'),
      ('admin_staff_posting_save','staff'),('admin_staff_posting_set_open','staff'),('admin_staff_postings','staff'),
      ('admin_finance_month','finance'),('admin_mark_slips_cleared','finance'),('admin_old_slips','finance'),
      ('admin_old_slips_count','finance'),('admin_org_payment_confirm','finance'),('admin_org_receipt_set','finance'),
      ('confirm_topup','finance'),('give_credit','finance'),
      ('admin_chat_report_resolve','safety'),('admin_chat_reports','safety'),('admin_hide_review','safety'),
      ('admin_org_reviews','safety'),('admin_company_reviews','safety'),
      ('admin_customer_unsuspend','users'),('admin_find_users','users'),('admin_reset_password','users'),
      ('admin_client_errors','owner'),('admin_system_status','owner'))
    select p.oid, m.fn, m.area from m join pg_proc p on p.proname = m.fn and p.pronamespace = 'public'::regnamespace
  loop
    d := pg_get_functiondef(r.oid);
    if position('public.is_admin()' in d) = 0 then raise exception 'ไม่พบ is_admin ใน %', r.fn; end if;
    d := replace(d, 'public.is_admin()', format('public.admin_can(%L)', r.area));
    if r.area = 'owner' then d := replace(d, 'เฉพาะแอดมินเท่านั้น', 'เฉพาะแอดมินหลักเท่านั้น');
    else d := replace(d, 'เฉพาะแอดมินเท่านั้น', 'บัญชีนี้ไม่มีสิทธิ์ใช้เมนูนี้ ติดต่อแอดมินหลัก'); end if;
    execute d; n := n + 1;
  end loop;
  if n <> 59 then raise exception 'จำนวนฟังก์ชันไม่ตรง: %', n; end if;
end $m$;

-- ค้นหารวม: แสดงเฉพาะกลุ่มที่มีสิทธิ์ (การจอง=คิวงาน, บัญชี=ผู้ใช้งาน, ร้าน/หน่วยงาน=ร้านนวดหรือหน่วยงาน, หมอนวด=หมอนวด, ร้านสมัคร=ร้านนวด)
create or replace function public.admin_search(p_q text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare q text := btrim(coalesce(p_q,'')); d text; lk text; ql text;
  cq boolean := public.admin_can('queue'); cu boolean := public.admin_can('users'); cs boolean := public.admin_can('shop');
  co boolean := public.admin_can('org'); cst boolean := public.admin_can('staff');
begin
  if auth.uid() is null or not public.is_admin() then raise exception 'เฉพาะแอดมินเท่านั้น'; end if;
  if char_length(q) < 2 then raise exception 'พิมพ์อย่างน้อย 2 ตัวอักษร'; end if;
  q := left(q, 60);
  d := regexp_replace(q, '\D', '', 'g'); if char_length(d) < 3 then d := null; end if;
  lk := '%' || replace(replace(replace(q, '\', '\\'), '%', '\%'), '_', '\_') || '%';
  ql := upper(q);
  return jsonb_build_object(
   'bookings', case when not cq then '[]'::jsonb else coalesce((select jsonb_agg(x order by x->>'starts_at' desc) from (
      select jsonb_build_object('id',b.id,'ref',b.ref,'starts_at',b.starts_at,'ends_at',b.ends_at,'status',b.status,
        'customer_name',b.customer_name,'phone',b.phone,'customer_id',b.customer_id,'place_id',b.place_id,
        'place_name',pl.name,'place_type',pl.type,'total',b.total_price,'discount',coalesce(b.discount,0),
        'items',coalesce((select jsonb_agg(jsonb_build_object('service',i.service_name,'staff',s.name,'starts_at',i.starts_at,'price',i.price) order by i.starts_at)
            from public.booking_items i left join public.staff s on s.id = i.staff_id where i.booking_id = b.id and i.active),'[]'::jsonb)) x
      from public.bookings b left join public.places pl on pl.id = b.place_id
      where upper(b.ref) like '%' || ql || '%' or b.customer_name ilike lk
         or (d is not null and regexp_replace(coalesce(b.phone,''), '\D', '', 'g') like '%' || d || '%')
      order by b.starts_at desc limit 10) z), '[]'::jsonb) end,
   'customers', case when not cu then '[]'::jsonb else coalesce((select jsonb_agg(x) from (
      select jsonb_build_object('id',p.id,'name',btrim(coalesce(p.first_name,'') || ' ' || coalesce(p.last_name,'')),'phone',p.phone,
        'created_at',p.created_at,'suspended',p.suspended_at is not null,
        'kind',case when exists (select 1 from public.shop_members m where m.user_id = p.id) then 'shop'
                    when exists (select 1 from public.staff s where s.user_id = p.id) then 'staff' else 'user' end,
        'is_admin',exists (select 1 from public.admins a where a.user_id = p.id),
        'room',exists (select 1 from public.support_rooms r where r.user_id = p.id and r.app = 'user' and r.last_at is not null),
        'recent',case when not cq then '[]'::jsonb else coalesce((select jsonb_agg(jsonb_build_object('id',b.id,'ref',b.ref,'starts_at',b.starts_at,'status',b.status,'place_name',pl.name) order by b.starts_at desc)
            from (select * from public.bookings where customer_id = p.id order by starts_at desc limit 5) b
            left join public.places pl on pl.id = b.place_id),'[]'::jsonb) end) x
      from public.profiles p
      where (btrim(coalesce(p.first_name,'') || ' ' || coalesce(p.last_name,''))) ilike lk
         or (d is not null and regexp_replace(coalesce(p.phone,''), '\D', '', 'g') like '%' || d || '%')
      order by p.created_at desc limit 10) z), '[]'::jsonb) end,
   'places', case when not (cs or co) then '[]'::jsonb else coalesce((select jsonb_agg(x) from (
      select jsonb_build_object('id',pl.id,'type',pl.type,'name',pl.name,'phone',pl.phone,'area',pl.area,'status',pl.status,'active',pl.active) x
      from public.places pl
      where ((pl.type = 'shop' and cs) or (pl.type <> 'shop' and co))
        and (pl.name ilike lk or (d is not null and regexp_replace(coalesce(pl.phone,''), '\D', '', 'g') like '%' || d || '%'))
      order by pl.name limit 10) z), '[]'::jsonb) end,
   'staff', case when not cst then '[]'::jsonb else coalesce((select jsonb_agg(x) from (
      select jsonb_build_object('id',s.id,'name',s.name,'phone',s.phone,'place_id',s.place_id,'place_name',pl.name,'place_type',pl.type,
        'active',s.active,'linked',s.user_id is not null) x
      from public.staff s left join public.places pl on pl.id = s.place_id
      where s.name ilike lk or (d is not null and regexp_replace(coalesce(s.phone,''), '\D', '', 'g') like '%' || d || '%')
      order by s.active desc, s.name limit 10) z), '[]'::jsonb) end,
   'regs', case when not cs then '[]'::jsonb else coalesce((select jsonb_agg(x) from (
      select jsonb_build_object('id',r.id,'name',r.name,'phone',r.phone,'status',r.status,'created_at',r.created_at) x
      from public.shop_registrations r
      where r.status = 'pending' and (r.name ilike lk or (d is not null and regexp_replace(coalesce(r.phone,''), '\D', '', 'g') like '%' || d || '%'))
      order by r.created_at desc limit 10) z), '[]'::jsonb) end);
end $$;

-- สิทธิ์เขียนตาราง (อ่านยังเหมือนเดิม)
alter policy admin_audit_sel on public.admin_audit using (public.admin_can('owner'));
alter policy an_adm on public.announcements using (public.admin_can('users')) with check (public.admin_can('users'));
alter policy as_upd on public.app_settings using (public.admin_can('owner')) with check (public.admin_can('owner'));
alter policy cat_adm on public.categories using (public.admin_can('owner')) with check (public.admin_can('owner'));
alter policy sp_adm on public.service_places using (public.admin_can('owner')) with check (public.admin_can('owner'));
alter policy prl_admin_read on public.password_reset_log using (public.admin_can('users'));
alter policy ov_wr on public.place_day_overrides
  using (public.admin_can('shop') or public.admin_can('org') or is_shop_member(place_id))
  with check (public.admin_can('shop') or public.admin_can('org') or is_shop_member(place_id));
alter policy ps_adm on public.place_staff using (public.admin_can('org')) with check (public.admin_can('org'));
alter policy pl_upd on public.places
  using (public.admin_can(case when type = 'shop' then 'shop' else 'org' end) or is_shop_member(id))
  with check (public.admin_can(case when type = 'shop' then 'shop' else 'org' end) or is_shop_member(id));
alter policy pl_ins on public.places with check (public.admin_can(case when type = 'shop' then 'shop' else 'org' end));
alter policy pl_del on public.places using (public.admin_can(case when type = 'shop' then 'shop' else 'org' end));
alter policy pm_wr on public.promotions using (public.admin_can('shop') or is_shop_member(place_id)) with check (public.admin_can('shop') or is_shop_member(place_id));
alter policy pms_wr on public.promotion_services
  using (public.admin_can('shop') or exists (select 1 from public.promotions p where p.id = promotion_services.promotion_id and is_shop_member(p.place_id)))
  with check (public.admin_can('shop') or exists (select 1 from public.promotions p where p.id = promotion_services.promotion_id and is_shop_member(p.place_id)));
alter policy sv_wr on public.services
  using (public.admin_can(case when place_id is null then 'owner' else 'shop' end) or (place_id is not null and is_shop_member(place_id)))
  with check (public.admin_can(case when place_id is null then 'owner' else 'shop' end) or (place_id is not null and is_shop_member(place_id)));
alter policy sm_adm on public.shop_members using (public.admin_can('shop')) with check (public.admin_can('shop'));
alter policy st_wr on public.staff
  using (public.admin_can('staff') or public.admin_can('shop') or (place_id is not null and is_shop_member(place_id)))
  with check (public.admin_can('staff') or public.admin_can('shop') or (place_id is not null and is_shop_member(place_id)));
alter policy off_wr on public.staff_days_off
  using (public.admin_can('staff') or public.admin_can('shop') or exists (select 1 from public.staff s where s.id = staff_days_off.staff_id and s.place_id is not null and is_shop_member(s.place_id)))
  with check (public.admin_can('staff') or public.admin_can('shop') or exists (select 1 from public.staff s where s.id = staff_days_off.staff_id and s.place_id is not null and is_shop_member(s.place_id)));
alter policy ss_wr on public.staff_services
  using (public.admin_can('staff') or public.admin_can('shop') or exists (select 1 from public.staff s where s.id = staff_services.staff_id and s.place_id is not null and is_shop_member(s.place_id)))
  with check (public.admin_can('staff') or public.admin_can('shop') or exists (select 1 from public.staff s where s.id = staff_services.staff_id and s.place_id is not null and is_shop_member(s.place_id)));
alter policy wt_ins on public.wallet_tx with check (public.admin_can('finance'));
alter policy "slips delete admin" on storage.objects using (bucket_id = 'slips' and public.admin_can('finance'));
alter policy "receipts admin delete" on storage.objects using (bucket_id = 'receipts' and public.admin_can('finance'));
alter policy "receipts admin insert" on storage.objects with check (bucket_id = 'receipts' and public.admin_can('finance'));
alter policy "place-images write" on storage.objects
  using (bucket_id = 'place-images' and (public.admin_can('shop') or public.admin_can('org') or is_shop_member(((storage.foldername(name))[1])::uuid)))
  with check (bucket_id = 'place-images' and (public.admin_can('shop') or public.admin_can('org') or is_shop_member(((storage.foldername(name))[1])::uuid)));
