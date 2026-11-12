-- 2026-11-12: ดัชนีของ chat_reports.customer_id (ตัวตรวจ Supabase แจ้ง unindexed_foreign_keys หลังเพิ่มตารางรายงานแชต)
-- ช่วยให้ลบบัญชีลูกค้า (ตั้ง customer_id เป็น null) และค้นรายงานตามลูกค้าเร็วขึ้น ไม่เปลี่ยนข้อมูล ติดตั้งแล้วหลังผู้ใช้อนุมัติ
create index if not exists chat_reports_customer_idx on public.chat_reports (customer_id);
