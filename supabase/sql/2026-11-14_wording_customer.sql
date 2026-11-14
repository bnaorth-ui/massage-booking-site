-- 2026-11-14 ข้อความที่ลูกค้า (และหมอนวด) เห็น: เปลี่ยน "พนักงาน" เป็น "หมอนวด"
-- ข้อความถึงร้านและแอดมินคงคำว่า "พนักงาน" ไว้ (ร้านดูแลลูกจ้างของตัวเอง)
-- วิธี: ดึงนิยามฟังก์ชันปัจจุบัน แทนที่ข้อความทีละคู่ (ต้องเจอพอดี 1 ครั้ง) แล้วสร้างใหม่ สิทธิ์เดิมคงอยู่
do $$
declare
  r record; d text; n int;
begin
  for r in select * from (values
    ('auto_cancel_unaccepted', $a$pl.name || E'\nพนักงาน ' || names$a$, $a$pl.name || E'\nหมอนวด ' || names$a$),
    ('cancel_booking', 'พนักงานเริ่มให้บริการแล้ว ยกเลิกไม่ได้', 'หมอนวดเริ่มให้บริการแล้ว ยกเลิกไม่ได้'),
    ('chat_send', $a$else 'พนักงาน' end$a$, $a$else 'หมอนวด' end$a$),
    ('reply_review', 'พนักงานตอบรีวิวของคุณ', 'หมอนวดตอบรีวิวของคุณ'),
    ('set_job_status', $a$notify('user', 'พนักงาน' || lbl$a$, $a$notify('user', 'หมอนวด' || lbl$a$),
    ('submit_review', 'พนักงานไม่ได้อยู่ในการจองนี้', 'หมอนวดไม่ได้อยู่ในการจองนี้'),
    ('create_booking', 'คิวนี้เพิ่งเต็ม กรุณาเลือกเวลาหรือพนักงานใหม่', 'คิวนี้เพิ่งเต็ม กรุณาเลือกเวลาหรือหมอนวดใหม่'),
    ('create_booking', 'พนักงาน % ไม่ได้ประจำในวันที่เลือก', 'หมอนวด % ไม่ได้ประจำในวันที่เลือก'),
    ('create_booking', 'พนักงาน % หยุดในวันที่เลือก', 'หมอนวด % หยุดในวันที่เลือก'),
    ('create_booking', 'พนักงานที่เลือกไม่ให้บริการนี้ที่สถานที่นี้', 'หมอนวดที่เลือกไม่ให้บริการนี้ที่สถานที่นี้'),
    ('check_item_staff', 'พนักงาน % ปิดรับงานชั่วคราว', 'หมอนวด % ปิดรับงานชั่วคราว'),
    ('check_item_staff', 'พนักงาน % ไม่ได้ทำงานในวันที่เลือก', 'หมอนวด % ไม่ได้ทำงานในวันที่เลือก'),
    ('check_item_staff', 'พนักงาน % ไม่ว่างในช่วงเวลาที่เลือก', 'หมอนวด % ไม่ว่างในช่วงเวลาที่เลือก'),
    ('staff_mark_no_show', $a$E'\nพนักงาน ' || sf.name || ' บันทึกว่า$a$, $a$E'\nหมอนวด ' || sf.name || ' บันทึกว่า$a$)
  ) v(fn, old, new)
  loop
    select count(*) into n from pg_proc where pronamespace = 'public'::regnamespace and proname = r.fn;
    if n <> 1 then raise exception 'ฟังก์ชัน % มี % ตัว', r.fn, n; end if;
    select pg_get_functiondef(p.oid) into d from pg_proc p where pronamespace = 'public'::regnamespace and proname = r.fn;
    n := (length(d) - length(replace(d, r.old, ''))) / length(r.old);
    if n <> 1 then raise exception 'ใน % เจอข้อความ "%" % ครั้ง', r.fn, r.old, n; end if;
    execute replace(d, r.old, r.new);
  end loop;
end $$;
