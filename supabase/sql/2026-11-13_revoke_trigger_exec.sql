-- ปิดสิทธิ์เรียกฟังก์ชันทริกเกอร์ตรงๆ (ทุกตัวใน public ที่คืนค่า trigger) จาก public, anon, authenticated
-- ระบบยังเรียกทริกเกอร์เองได้ตามปกติ (ตอนทริกเกอร์ทำงาน ฐานข้อมูลไม่ตรวจสิทธิ์ EXECUTE ของผู้ใช้)
-- ทดสอบแบบย้อนกลับแล้ว: เพิ่มรายการโปรด (fav_limit) แก้โปรไฟล์ (set_updated_at) ส่งแชตเจ้าหน้าที่ (notify -> notif_push) ทำงานได้ในสิทธิ์ authenticated
-- ทริกเกอร์ที่สร้างใหม่ต้องรันคำสั่งนี้ซ้ำ (ค่าเริ่มต้นของฐานข้อมูลเปิดสิทธิ์ให้ public)
do $$ declare fn record; begin
  for fn in select p.oid::regprocedure sig from pg_proc p
             where p.pronamespace = 'public'::regnamespace and p.prorettype = 'trigger'::regtype loop
    execute format('revoke execute on function %s from public, anon, authenticated', fn.sig);
  end loop;
end $$;
