-- 2026-11-22 ข้อความถึงแอดมินและร้าน: "พนักงาน" → "หมอนวด" (คู่กับ admin v1.39)
-- ไม่แตะ: trg_announce_notify (ค่า 'พนักงาน' ใน announcements.audiences เป็นข้อมูล), org_requests_tick ("แจ้งพนักงานที่จองคิวไว้" = พนักงานของหน่วยงาน), ความเห็นในโค้ด
-- แต่ละฟังก์ชัน: อ่านนิยามเดิม แทนข้อความทีละคู่ (ต้องเจอครบตามจำนวนที่คาด ไม่งั้นหยุด) แล้วสร้างใหม่ สิทธิ์เดิมคงอยู่ (create or replace)
do $$
declare
  r record; d text; i int; o text; nw text; cnt int;
  jobs jsonb := $j$[
    {"fn":"public._org_invite_apply","pairs":[["'พนักงานนี้ไม่ได้ใช้งานอยู่'","'หมอนวดคนนี้ไม่ได้ใช้งานอยู่'",1]]},
    {"fn":"public.admin_save_place","pairs":[["'เลือกพนักงานส่วนกลางที่ยังใช้งานอยู่เท่านั้น'","'เลือกหมอนวดส่วนกลางที่ยังใช้งานอยู่เท่านั้น'",1],["'พนักงาน % ถูกจัดให้ % ในวันเดียวกันแล้ว'","'หมอนวด % ถูกจัดให้ % ในวันเดียวกันแล้ว'",1],["'พนักงาน % รับงานนอกสถานที่ของ % ในวันที่ % แล้ว'","'หมอนวด % รับงานนอกสถานที่ของ % ในวันที่ % แล้ว'",1]]},
    {"fn":"public.admin_save_staff","pairs":[["'เบอร์มือถือนี้ถูกใช้กับพนักงานคนอื่นแล้ว'","'เบอร์มือถือนี้ถูกใช้กับหมอนวดคนอื่นแล้ว'",1],["'ไม่พบพนักงานส่วนกลางคนนี้'","'ไม่พบหมอนวดส่วนกลางคนนี้'",1],["'กรุณากรอกชื่อพนักงาน'","'กรุณากรอกชื่อหมอนวด'",1]]},
    {"fn":"public.admin_staff_delete_requests","pairs":[["'พนักงานส่วนกลาง'","'หมอนวดส่วนกลาง'",1]]},
    {"fn":"public.admin_staff_delete_resolve","pairs":[["'คำขอนี้ไม่ใช่ของพนักงานส่วนกลาง","'คำขอนี้ไม่ใช่ของหมอนวดส่วนกลาง",1]]},
    {"fn":"public.admin_staff_leave_add","pairs":[["'ไม่พบพนักงาน'","'ไม่พบหมอนวด'",1]]},
    {"fn":"public.shop_mark_no_show","pairs":[["'พนักงานเริ่มให้บริการแล้ว","'หมอนวดเริ่มให้บริการแล้ว",1]]},
    {"fn":"public.staff_request_delete","pairs":[["'พนักงานขอลบบัญชี', 'พนักงาน: '","'หมอนวดขอลบบัญชี', 'หมอนวด: '",1],["E'\\nพนักงานส่วนกลางของสมาคม'","E'\\nหมอนวดส่วนกลางของสมาคม'",1],["เมนู สถานที่และคน > พนักงาน'","เมนู ทะเบียน > หมอนวด'",1]]},
    {"fn":"public.trg_admin_job_status","pairs":[["'พนักงาน' || lbl","'หมอนวด' || lbl",1],["'พนักงาน: ' || coalesce(sf.name","'หมอนวด: ' || coalesce(sf.name",1]]}
  ]$j$;
  job jsonb; pr jsonb;
begin
  for job in select * from jsonb_array_elements(jobs) loop
    select pg_get_functiondef(p.oid) into d from pg_proc p where p.oid = (job->>'fn')::regproc;
    for pr in select * from jsonb_array_elements(job->'pairs') loop
      o := pr->>0; nw := pr->>1;
      cnt := (length(d) - length(replace(d, o, ''))) / length(o);
      if cnt <> (pr->>2)::int then raise exception '% : พบ "%" % ครั้ง (คาด %)', job->>'fn', o, cnt, pr->>2; end if;
      d := replace(d, o, nw);
    end loop;
    execute d;
  end loop;
end $$;
