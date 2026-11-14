-- บัญชีพร้อมเพย์แยกสำหรับหน่วยงานชำระค่าบริการ (เดิมใช้บัญชีเดียวกับร้านนวดเติมเงิน)
-- ร้านนวดใช้ promptpay_* ตามเดิม หน่วยงานใช้ org_pp_* ไม่ใช้แทนกัน (คนละเจ้าของบัญชี)
-- ค่าเริ่มต้นปิดไว้ จนกว่าแอดมินหลักจะตั้งบัญชีสมาคม (แนะนำประเภทเลขประจำตัวผู้เสียภาษี)
alter table public.app_settings add column if not exists org_pp_on boolean not null default false;
alter table public.app_settings add column if not exists org_pp_type text not null default 'tax';
alter table public.app_settings add column if not exists org_pp_id text not null default '';
alter table public.app_settings add column if not exists org_pp_name text not null default '';
alter table public.app_settings drop constraint if exists app_settings_org_pp_type_chk;
alter table public.app_settings add constraint app_settings_org_pp_type_chk check (org_pp_type in ('mobile','national','tax','ewallet'));
