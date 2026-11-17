-- เว็บประชาสัมพันธ์ (site/): ตารางบทความและข่าว ที่คนทั่วไปอ่านได้โดยไม่ต้องล็อกอิน
-- คนทั่วไป (anon) อ่านได้เฉพาะเรื่องที่เผยแพร่ (active = true) แอดมินที่มีสิทธิ์ "ผู้ใช้งานและประกาศ" (users) เขียน แก้ ลบได้
-- แยกจากตาราง announcements (ประกาศภายในถึงผู้ใช้ ร้าน หมอนวด) เพราะประกาศภายในต้องเห็นเฉพาะคนในระบบ

create table if not exists public.site_articles (
  id uuid primary key default gen_random_uuid(),
  no bigint generated always as identity unique,          -- เลขในลิงก์ เช่น /news/12
  kind text not null default 'news' check (kind in ('news', 'article')),  -- news = ข่าวและกิจกรรม, article = บทความ
  title text not null check (length(btrim(title)) between 1 and 200),
  summary text not null default '' check (length(summary) <= 500),
  body text not null default '' check (length(body) <= 50000),
  cover_path text,                                         -- รูปปก ใน place-images/00000000-.../site-*.jpg
  cover_alt text not null default '' check (length(cover_alt) <= 300),  -- คำบรรยายรูปสำหรับโปรแกรมอ่านหน้าจอ
  day date not null default current_date,                  -- วันที่แสดงบนข่าว
  pinned boolean not null default false,                   -- ปักหมุดไว้บนหน้าแรก
  active boolean not null default false,                   -- false = ร่าง, true = เผยแพร่
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists site_articles_pub_idx on public.site_articles (active, pinned desc, day desc, no desc);

alter table public.site_articles enable row level security;

-- ค่าเริ่มต้นของ Supabase ให้ anon ทำได้ทุกอย่าง (RLS กันไว้อีกชั้น) ตัดให้เหลืออ่านอย่างเดียว
revoke all on public.site_articles from anon;
grant select on public.site_articles to anon;

-- แยกนโยบายของ anon: anon เรียก admin_can ไม่ได้ (permission denied) ถ้ารวมไว้ในนโยบายเดียว คนทั่วไปจะอ่านไม่ได้เลย
drop policy if exists sa_sel on public.site_articles;
drop policy if exists sa_sel_anon on public.site_articles;
create policy sa_sel_anon on public.site_articles for select to anon
  using (active);
create policy sa_sel on public.site_articles for select to authenticated
  using (active or public.admin_can('users'));
drop policy if exists sa_adm on public.site_articles;
create policy sa_adm on public.site_articles for all to authenticated
  using (public.admin_can('users')) with check (public.admin_can('users'));

-- บันทึกประวัติการทำงานของแอดมิน เหมือนตารางอื่น (ฟังก์ชันทริกเกอร์เดิม ไม่ได้สร้างใหม่)
drop trigger if exists audit_site_articles on public.site_articles;
create trigger audit_site_articles after insert or delete or update on public.site_articles
  for each row execute function public._audit_trg();

-- รูปปก: แอดมินสิทธิ์ users อัปโหลดลงโฟลเดอร์ของสมาคม (uuid ศูนย์) ชื่อไฟล์ขึ้นต้น site- ได้
-- (นโยบายเดิมเปิดให้เฉพาะสิทธิ์ shop/org) ทุกคนอ่านรูปใน place-images ได้อยู่แล้ว
drop policy if exists "place-images site write" on storage.objects;
create policy "place-images site write" on storage.objects for all to authenticated
  using (bucket_id = 'place-images' and name like '00000000-0000-0000-0000-000000000000/site-%' and public.admin_can('users'))
  with check (bucket_id = 'place-images' and name like '00000000-0000-0000-0000-000000000000/site-%' and public.admin_can('users'));
