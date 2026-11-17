-- 2026-11-17 ข้อความที่ร้านนวดและหมอนวดเห็น: "พนักงาน" -> "หมอนวด" (ทางเลือก ก)
-- ไม่เปลี่ยน: ข้อความถึงแอดมิน (แอปแอดมินจัดหมวดแจ้งเตือนจากคำว่า พนักงาน), "โปรดแจ้งพนักงานที่จองคิวไว้" (พนักงานของหน่วยงาน)
-- ชื่อแทนบัญชีที่ลบแล้ว เปลี่ยนเป็น "หมอนวดที่ออกจากระบบ" (ตอนนี้ไม่มีแถวชื่อเดิม แอปร้าน/แอดมินรู้จักทั้งสองชื่อ)
-- วิธี: ดึงนิยามฟังก์ชัน แทนที่ทีละคู่ (ต้องเจอพอดีตามจำนวน) แล้วสร้างใหม่ สิทธิ์เดิมคงอยู่
do $$
declare r record; d text; n int;
begin
  for r in select * from (values
    ('_staff_delete_do', 'พนักงานยังมีคิวที่ยังไม่เสร็จ % คิว', 'หมอนวดยังมีคิวที่ยังไม่เสร็จ % คิว', 1),
    ('_staff_delete_do', 'พนักงานที่ออกจากระบบ', 'หมอนวดที่ออกจากระบบ', 1),
    ('_staff_leave_apply', $a$notify('shop', 'พนักงานแจ้งลา', 'พนักงาน: '$a$, $a$notify('shop', 'หมอนวดแจ้งลา', 'หมอนวด: '$a$, 1),
    ('approve_shop_registration', 'เพิ่มบริการและพนักงาน', 'เพิ่มบริการและหมอนวด', 1),
    ('auto_cancel_unaccepted', $a$b.customer_name || E'\nพนักงาน ' || names$a$, $a$b.customer_name || E'\nหมอนวด ' || names$a$, 1),
    ('auto_close_overdue', $a$E'\nพนักงานไม่ได้กดเสร็จสิ้นงานภายใน '$a$, $a$E'\nหมอนวดไม่ได้กดเสร็จสิ้นงานภายใน '$a$, 1),
    ('remind_overdue_jobs', $a$E'\nพนักงานยังไม่ได้กดเสร็จสิ้น$a$, $a$E'\nหมอนวดยังไม่ได้กดเสร็จสิ้น$a$, 1),
    ('set_job_status', $a$notify('shop', 'พนักงาน' || lbl, 'พนักงาน: '$a$, $a$notify('shop', 'หมอนวด' || lbl, 'หมอนวด: '$a$, 1),
    ('shop_save_staff', 'กรุณากรอกชื่อพนักงาน', 'กรุณากรอกชื่อหมอนวด', 1),
    ('shop_save_staff', 'เบอร์มือถือนี้ถูกใช้กับพนักงานคนอื่นแล้ว', 'เบอร์มือถือนี้ถูกใช้กับหมอนวดคนอื่นแล้ว', 1),
    ('shop_save_staff', 'ไม่พบพนักงานในร้านนี้', 'ไม่พบหมอนวดในร้านนี้', 1),
    ('shop_staff_delete_resolve', 'ไม่พบคำขอของพนักงานในร้านนี้', 'ไม่พบคำขอของหมอนวดในร้านนี้', 1),
    ('staff_cancel_delete', 'บัญชีนี้ไม่ใช่พนักงาน', 'บัญชีนี้ไม่ใช่บัญชีหมอนวด', 1),
    ('staff_income', 'บัญชีนี้ไม่ใช่พนักงาน', 'บัญชีนี้ไม่ใช่บัญชีหมอนวด', 1),
    ('staff_leave_add', 'บัญชีนี้ไม่ใช่พนักงาน', 'บัญชีนี้ไม่ใช่บัญชีหมอนวด', 1),
    ('staff_leave_cancel', 'บัญชีนี้ไม่ใช่พนักงาน', 'บัญชีนี้ไม่ใช่บัญชีหมอนวด', 1),
    ('staff_leave_cancel', $a$notify('shop', 'พนักงานยกเลิกการลา', 'พนักงาน: '$a$, $a$notify('shop', 'หมอนวดยกเลิกการลา', 'หมอนวด: '$a$, 1),
    ('staff_mark_no_show', $a$notify('shop', 'ลูกค้าไม่มาตามนัด', 'พนักงาน: '$a$, $a$notify('shop', 'ลูกค้าไม่มาตามนัด', 'หมอนวด: '$a$, 1),
    ('staff_request_delete', 'บัญชีนี้ไม่ใช่พนักงาน', 'บัญชีนี้ไม่ใช่บัญชีหมอนวด', 1),
    ('staff_request_delete', $a$notify('shop', 'พนักงานขอลบบัญชี', 'พนักงาน: ' || f.name || E'\nตรวจสอบและอนุมัติได้ที่เมนู จัดการร้าน > พนักงาน'$a$,
                             $a$notify('shop', 'หมอนวดขอลบบัญชี', 'หมอนวด: ' || f.name || E'\nตรวจสอบและอนุมัติได้ที่เมนู จัดการร้าน > เพิ่มหมอนวด'$a$, 1),
    ('staff_save_self', 'บัญชีนี้ไม่ใช่พนักงาน', 'บัญชีนี้ไม่ใช่บัญชีหมอนวด', 1),
    ('staff_sub_candidates', 'บัญชีนี้ไม่ใช่พนักงาน', 'บัญชีนี้ไม่ใช่บัญชีหมอนวด', 1),
    ('staff_sub_request', 'บัญชีนี้ไม่ใช่พนักงาน', 'บัญชีนี้ไม่ใช่บัญชีหมอนวด', 1),
    ('trg_gp_notify', $a$E'\nพนักงาน: ' || coalesce(stf$a$, $a$E'\nหมอนวด: ' || coalesce(stf$a$, 1)
  ) v(fn, old, new, cnt)
  loop
    select count(*) into n from pg_proc where pronamespace = 'public'::regnamespace and proname = r.fn;
    if n <> 1 then raise exception 'ฟังก์ชัน % มี % ตัว', r.fn, n; end if;
    select pg_get_functiondef(p.oid) into d from pg_proc p where pronamespace = 'public'::regnamespace and proname = r.fn;
    n := (length(d) - length(replace(d, r.old, ''))) / length(r.old);
    if n <> r.cnt then raise exception 'ใน % เจอข้อความ "%" % ครั้ง', r.fn, r.old, n; end if;
    execute replace(d, r.old, r.new);
  end loop;
end $$;
