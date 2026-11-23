-- 2026-11-23 แยกกฎสิทธิ์ "ทำได้ทุกอย่าง" (FOR ALL) ใน 13 ตาราง เป็น เพิ่ม/แก้/ลบ เงื่อนไขเดิมทุกตัว
-- เหตุผล: ตัวตรวจ Supabase เตือน multiple_permissive_policies ตอนอ่านข้อมูลต้องตรวจทั้งกฎอ่าน (_sel) และกฎ ALL
-- ปลอดภัย: ทุกตาราง ผู้ที่ผ่านเงื่อนไขกฎแก้ อ่านได้อยู่แล้วตามกฎ _sel (admin_can(...) ⊂ is_admin(), shop member อยู่ในกฎอ่าน) การอ่านจึงเหมือนเดิม
-- ไม่ต้องแก้แอป ทดสอบแบบย้อนกลับแล้ว (ดู CHANGELOG 2026-11-23)
begin;
-- announcements
drop policy if exists an_adm on public.announcements;
create policy an_adm_ins on public.announcements for insert to authenticated with check (admin_can('users'::text));
create policy an_adm_upd on public.announcements for update to authenticated using (admin_can('users'::text)) with check (admin_can('users'::text));
create policy an_adm_del on public.announcements for delete to authenticated using (admin_can('users'::text));
-- categories
drop policy if exists cat_adm on public.categories;
create policy cat_adm_ins on public.categories for insert to authenticated with check (admin_can('owner'::text));
create policy cat_adm_upd on public.categories for update to authenticated using (admin_can('owner'::text)) with check (admin_can('owner'::text));
create policy cat_adm_del on public.categories for delete to authenticated using (admin_can('owner'::text));
-- place_day_overrides
drop policy if exists ov_wr on public.place_day_overrides;
create policy ov_wr_ins on public.place_day_overrides for insert to authenticated with check ((admin_can('shop'::text) OR admin_can('org'::text) OR is_shop_member(place_id)));
create policy ov_wr_upd on public.place_day_overrides for update to authenticated using ((admin_can('shop'::text) OR admin_can('org'::text) OR is_shop_member(place_id))) with check ((admin_can('shop'::text) OR admin_can('org'::text) OR is_shop_member(place_id)));
create policy ov_wr_del on public.place_day_overrides for delete to authenticated using ((admin_can('shop'::text) OR admin_can('org'::text) OR is_shop_member(place_id)));
-- place_staff
drop policy if exists ps_adm on public.place_staff;
create policy ps_adm_ins on public.place_staff for insert to authenticated with check (admin_can('org'::text));
create policy ps_adm_upd on public.place_staff for update to authenticated using (admin_can('org'::text)) with check (admin_can('org'::text));
create policy ps_adm_del on public.place_staff for delete to authenticated using (admin_can('org'::text));
-- promotion_services
drop policy if exists pms_wr on public.promotion_services;
create policy pms_wr_ins on public.promotion_services for insert to authenticated with check ((admin_can('shop'::text) OR (EXISTS ( SELECT 1 FROM promotions p WHERE ((p.id = promotion_services.promotion_id) AND is_shop_member(p.place_id))))));
create policy pms_wr_upd on public.promotion_services for update to authenticated using ((admin_can('shop'::text) OR (EXISTS ( SELECT 1 FROM promotions p WHERE ((p.id = promotion_services.promotion_id) AND is_shop_member(p.place_id)))))) with check ((admin_can('shop'::text) OR (EXISTS ( SELECT 1 FROM promotions p WHERE ((p.id = promotion_services.promotion_id) AND is_shop_member(p.place_id))))));
create policy pms_wr_del on public.promotion_services for delete to authenticated using ((admin_can('shop'::text) OR (EXISTS ( SELECT 1 FROM promotions p WHERE ((p.id = promotion_services.promotion_id) AND is_shop_member(p.place_id))))));
-- promotions
drop policy if exists pm_wr on public.promotions;
create policy pm_wr_ins on public.promotions for insert to authenticated with check ((admin_can('shop'::text) OR is_shop_member(place_id)));
create policy pm_wr_upd on public.promotions for update to authenticated using ((admin_can('shop'::text) OR is_shop_member(place_id))) with check ((admin_can('shop'::text) OR is_shop_member(place_id)));
create policy pm_wr_del on public.promotions for delete to authenticated using ((admin_can('shop'::text) OR is_shop_member(place_id)));
-- service_places
drop policy if exists sp_adm on public.service_places;
create policy sp_adm_ins on public.service_places for insert to authenticated with check (admin_can('owner'::text));
create policy sp_adm_upd on public.service_places for update to authenticated using (admin_can('owner'::text)) with check (admin_can('owner'::text));
create policy sp_adm_del on public.service_places for delete to authenticated using (admin_can('owner'::text));
-- services
drop policy if exists sv_wr on public.services;
create policy sv_wr_ins on public.services for insert to authenticated with check ((admin_can(CASE WHEN (place_id IS NULL) THEN 'owner'::text ELSE 'shop'::text END) OR ((place_id IS NOT NULL) AND is_shop_member(place_id))));
create policy sv_wr_upd on public.services for update to authenticated using ((admin_can(CASE WHEN (place_id IS NULL) THEN 'owner'::text ELSE 'shop'::text END) OR ((place_id IS NOT NULL) AND is_shop_member(place_id)))) with check ((admin_can(CASE WHEN (place_id IS NULL) THEN 'owner'::text ELSE 'shop'::text END) OR ((place_id IS NOT NULL) AND is_shop_member(place_id))));
create policy sv_wr_del on public.services for delete to authenticated using ((admin_can(CASE WHEN (place_id IS NULL) THEN 'owner'::text ELSE 'shop'::text END) OR ((place_id IS NOT NULL) AND is_shop_member(place_id))));
-- shop_members
drop policy if exists sm_adm on public.shop_members;
create policy sm_adm_ins on public.shop_members for insert to authenticated with check (admin_can('shop'::text));
create policy sm_adm_upd on public.shop_members for update to authenticated using (admin_can('shop'::text)) with check (admin_can('shop'::text));
create policy sm_adm_del on public.shop_members for delete to authenticated using (admin_can('shop'::text));
-- site_articles
drop policy if exists sa_adm on public.site_articles;
create policy sa_adm_ins on public.site_articles for insert to authenticated with check (admin_can('users'::text));
create policy sa_adm_upd on public.site_articles for update to authenticated using (admin_can('users'::text)) with check (admin_can('users'::text));
create policy sa_adm_del on public.site_articles for delete to authenticated using (admin_can('users'::text));
-- staff
drop policy if exists st_wr on public.staff;
create policy st_wr_ins on public.staff for insert to authenticated with check ((admin_can('staff'::text) OR admin_can('shop'::text) OR ((place_id IS NOT NULL) AND is_shop_member(place_id))));
create policy st_wr_upd on public.staff for update to authenticated using ((admin_can('staff'::text) OR admin_can('shop'::text) OR ((place_id IS NOT NULL) AND is_shop_member(place_id)))) with check ((admin_can('staff'::text) OR admin_can('shop'::text) OR ((place_id IS NOT NULL) AND is_shop_member(place_id))));
create policy st_wr_del on public.staff for delete to authenticated using ((admin_can('staff'::text) OR admin_can('shop'::text) OR ((place_id IS NOT NULL) AND is_shop_member(place_id))));
-- staff_days_off
drop policy if exists off_wr on public.staff_days_off;
create policy off_wr_ins on public.staff_days_off for insert to authenticated with check ((admin_can('staff'::text) OR admin_can('shop'::text) OR (EXISTS ( SELECT 1 FROM staff s WHERE ((s.id = staff_days_off.staff_id) AND (s.place_id IS NOT NULL) AND is_shop_member(s.place_id))))));
create policy off_wr_upd on public.staff_days_off for update to authenticated using ((admin_can('staff'::text) OR admin_can('shop'::text) OR (EXISTS ( SELECT 1 FROM staff s WHERE ((s.id = staff_days_off.staff_id) AND (s.place_id IS NOT NULL) AND is_shop_member(s.place_id)))))) with check ((admin_can('staff'::text) OR admin_can('shop'::text) OR (EXISTS ( SELECT 1 FROM staff s WHERE ((s.id = staff_days_off.staff_id) AND (s.place_id IS NOT NULL) AND is_shop_member(s.place_id))))));
create policy off_wr_del on public.staff_days_off for delete to authenticated using ((admin_can('staff'::text) OR admin_can('shop'::text) OR (EXISTS ( SELECT 1 FROM staff s WHERE ((s.id = staff_days_off.staff_id) AND (s.place_id IS NOT NULL) AND is_shop_member(s.place_id))))));
-- staff_services
drop policy if exists ss_wr on public.staff_services;
create policy ss_wr_ins on public.staff_services for insert to authenticated with check ((admin_can('staff'::text) OR admin_can('shop'::text) OR (EXISTS ( SELECT 1 FROM staff s WHERE ((s.id = staff_services.staff_id) AND (s.place_id IS NOT NULL) AND is_shop_member(s.place_id))))));
create policy ss_wr_upd on public.staff_services for update to authenticated using ((admin_can('staff'::text) OR admin_can('shop'::text) OR (EXISTS ( SELECT 1 FROM staff s WHERE ((s.id = staff_services.staff_id) AND (s.place_id IS NOT NULL) AND is_shop_member(s.place_id)))))) with check ((admin_can('staff'::text) OR admin_can('shop'::text) OR (EXISTS ( SELECT 1 FROM staff s WHERE ((s.id = staff_services.staff_id) AND (s.place_id IS NOT NULL) AND is_shop_member(s.place_id))))));
create policy ss_wr_del on public.staff_services for delete to authenticated using ((admin_can('staff'::text) OR admin_can('shop'::text) OR (EXISTS ( SELECT 1 FROM staff s WHERE ((s.id = staff_services.staff_id) AND (s.place_id IS NOT NULL) AND is_shop_member(s.place_id))))));
commit;

-- ===== คืนค่าเดิม (ถ้าจำเป็น) =====
-- drop policy an_adm_ins on public.announcements; drop policy an_adm_upd on public.announcements; drop policy an_adm_del on public.announcements;
-- create policy an_adm on public.announcements for all to authenticated using (admin_can('users'::text)) with check (admin_can('users'::text));
-- drop policy cat_adm_ins on public.categories; drop policy cat_adm_upd on public.categories; drop policy cat_adm_del on public.categories;
-- create policy cat_adm on public.categories for all to authenticated using (admin_can('owner'::text)) with check (admin_can('owner'::text));
-- drop policy ov_wr_ins on public.place_day_overrides; drop policy ov_wr_upd on public.place_day_overrides; drop policy ov_wr_del on public.place_day_overrides;
-- create policy ov_wr on public.place_day_overrides for all to authenticated using ((admin_can('shop'::text) OR admin_can('org'::text) OR is_shop_member(place_id))) with check ((admin_can('shop'::text) OR admin_can('org'::text) OR is_shop_member(place_id)));
-- drop policy ps_adm_ins on public.place_staff; drop policy ps_adm_upd on public.place_staff; drop policy ps_adm_del on public.place_staff;
-- create policy ps_adm on public.place_staff for all to authenticated using (admin_can('org'::text)) with check (admin_can('org'::text));
-- drop policy pms_wr_ins on public.promotion_services; drop policy pms_wr_upd on public.promotion_services; drop policy pms_wr_del on public.promotion_services;
-- create policy pms_wr on public.promotion_services for all to authenticated using ((admin_can('shop'::text) OR (EXISTS ( SELECT 1 FROM promotions p WHERE ((p.id = promotion_services.promotion_id) AND is_shop_member(p.place_id)))))) with check ((admin_can('shop'::text) OR (EXISTS ( SELECT 1 FROM promotions p WHERE ((p.id = promotion_services.promotion_id) AND is_shop_member(p.place_id))))));
-- drop policy pm_wr_ins on public.promotions; drop policy pm_wr_upd on public.promotions; drop policy pm_wr_del on public.promotions;
-- create policy pm_wr on public.promotions for all to authenticated using ((admin_can('shop'::text) OR is_shop_member(place_id))) with check ((admin_can('shop'::text) OR is_shop_member(place_id)));
-- drop policy sp_adm_ins on public.service_places; drop policy sp_adm_upd on public.service_places; drop policy sp_adm_del on public.service_places;
-- create policy sp_adm on public.service_places for all to authenticated using (admin_can('owner'::text)) with check (admin_can('owner'::text));
-- drop policy sv_wr_ins on public.services; drop policy sv_wr_upd on public.services; drop policy sv_wr_del on public.services;
-- create policy sv_wr on public.services for all to authenticated using ((admin_can(CASE WHEN (place_id IS NULL) THEN 'owner'::text ELSE 'shop'::text END) OR ((place_id IS NOT NULL) AND is_shop_member(place_id)))) with check ((admin_can(CASE WHEN (place_id IS NULL) THEN 'owner'::text ELSE 'shop'::text END) OR ((place_id IS NOT NULL) AND is_shop_member(place_id))));
-- drop policy sm_adm_ins on public.shop_members; drop policy sm_adm_upd on public.shop_members; drop policy sm_adm_del on public.shop_members;
-- create policy sm_adm on public.shop_members for all to authenticated using (admin_can('shop'::text)) with check (admin_can('shop'::text));
-- drop policy sa_adm_ins on public.site_articles; drop policy sa_adm_upd on public.site_articles; drop policy sa_adm_del on public.site_articles;
-- create policy sa_adm on public.site_articles for all to authenticated using (admin_can('users'::text)) with check (admin_can('users'::text));
-- drop policy st_wr_ins on public.staff; drop policy st_wr_upd on public.staff; drop policy st_wr_del on public.staff;
-- create policy st_wr on public.staff for all to authenticated using ((admin_can('staff'::text) OR admin_can('shop'::text) OR ((place_id IS NOT NULL) AND is_shop_member(place_id)))) with check ((admin_can('staff'::text) OR admin_can('shop'::text) OR ((place_id IS NOT NULL) AND is_shop_member(place_id))));
-- drop policy off_wr_ins on public.staff_days_off; drop policy off_wr_upd on public.staff_days_off; drop policy off_wr_del on public.staff_days_off;
-- create policy off_wr on public.staff_days_off for all to authenticated using ((admin_can('staff'::text) OR admin_can('shop'::text) OR (EXISTS ( SELECT 1 FROM staff s WHERE ((s.id = staff_days_off.staff_id) AND (s.place_id IS NOT NULL) AND is_shop_member(s.place_id)))))) with check ((admin_can('staff'::text) OR admin_can('shop'::text) OR (EXISTS ( SELECT 1 FROM staff s WHERE ((s.id = staff_days_off.staff_id) AND (s.place_id IS NOT NULL) AND is_shop_member(s.place_id))))));
-- drop policy ss_wr_ins on public.staff_services; drop policy ss_wr_upd on public.staff_services; drop policy ss_wr_del on public.staff_services;
-- create policy ss_wr on public.staff_services for all to authenticated using ((admin_can('staff'::text) OR admin_can('shop'::text) OR (EXISTS ( SELECT 1 FROM staff s WHERE ((s.id = staff_services.staff_id) AND (s.place_id IS NOT NULL) AND is_shop_member(s.place_id)))))) with check ((admin_can('staff'::text) OR admin_can('shop'::text) OR (EXISTS ( SELECT 1 FROM staff s WHERE ((s.id = staff_services.staff_id) AND (s.place_id IS NOT NULL) AND is_shop_member(s.place_id))))));
