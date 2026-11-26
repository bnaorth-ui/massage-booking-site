-- 2026-11-27 แชตแบบกดกริ่ง (คู่กับ rt.js ทั้ง 4 แอป: customer 1.54, shop 1.30, staff 1.30, admin 1.48)
-- เมื่อมีข้อความใหม่ ทริกเกอร์อัปเดตแถวใน rt_bells (มีแค่ชื่อห้องกับเวลา ไม่มีเนื้อข้อความ)
-- แอปฟังการเปลี่ยนแปลงของแถวห้องตัวเองผ่าน Supabase Realtime (postgres_changes ตรวจสิทธิ์ด้วยกฎ RLS ด้านล่าง)
-- ได้ยินกริ่งแล้วโหลดข้อความด้วยวิธีเดิม ถ้าต่อไม่ได้ แอปกลับไปถามทุก 4-5 วินาทีแบบเดิม
-- (ไม่ใช้ broadcast จากฐานข้อมูล เพราะตาราง realtime.messages ของโปรเจกต์ยังไม่มี partition ส่งแล้วหายเงียบ)
-- ชื่อห้อง (topic):
--   chat:<booking_id>:<room_key>  แชตของการจอง ฟังได้เฉพาะคนในห้อง (_chat_role เดียวกับที่อ่านแชตได้)
--   sup:<user_id>:<app>           แชตกับเจ้าหน้าที่ ฟังได้เฉพาะเจ้าของห้องและแอดมิน
--   sup-admin                     รายชื่อห้องแชตในแอปแอดมิน เฉพาะแอดมิน

create or replace function public._rt_can(p_topic text)
 returns boolean language plpgsql stable security definer set search_path = public as $$
declare uid uuid := auth.uid(); m text[];
begin
  if uid is null or p_topic is null then return false; end if;
  if p_topic = 'sup-admin' then return public.is_admin(); end if;
  m := regexp_match(p_topic, '^chat:([0-9a-f-]{36}):(.+)$');
  if m is not null then return public._chat_role(m[1]::uuid, m[2], uid) is not null; end if;
  m := regexp_match(p_topic, '^sup:([0-9a-f-]{36}):([a-z]+)$');
  if m is not null then return m[1]::uuid = uid or public.is_admin(); end if;
  return false;
exception when others then return false;
end $$;
revoke execute on function public._rt_can(text) from public, anon;
grant execute on function public._rt_can(text) to authenticated;

create table if not exists public.rt_bells (
  topic text primary key,
  at timestamptz not null default now()
);
alter table public.rt_bells enable row level security;
revoke all on table public.rt_bells from anon, authenticated;
grant select on table public.rt_bells to authenticated;
drop policy if exists rt_bells_sel on public.rt_bells;
create policy rt_bells_sel on public.rt_bells for select to authenticated using (public._rt_can(topic));
do $p$ begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'rt_bells') then
    alter publication supabase_realtime add table public.rt_bells;
  end if;
end $p$;

create or replace function public._rt_ring(p_topic text)
 returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.rt_bells(topic, at) values (p_topic, clock_timestamp())
    on conflict (topic) do update set at = excluded.at;
exception when others then raise warning 'rt_ring: %', sqlerrm;
end $$;
revoke execute on function public._rt_ring(text) from public, anon, authenticated;

create or replace function public.trg_chat_bell()
 returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public._rt_ring('chat:' || new.booking_id || ':' || new.room_key);
  return null;
end $$;
revoke execute on function public.trg_chat_bell() from public, anon, authenticated;
drop trigger if exists trg_chat_bell on public.chat_messages;
create trigger trg_chat_bell after insert on public.chat_messages for each row execute function public.trg_chat_bell();

create or replace function public.trg_sup_bell()
 returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public._rt_ring('sup:' || new.user_id || ':' || new.app);
  perform public._rt_ring('sup-admin');
  return null;
end $$;
revoke execute on function public.trg_sup_bell() from public, anon, authenticated;
drop trigger if exists trg_sup_bell on public.support_messages;
create trigger trg_sup_bell after insert on public.support_messages for each row execute function public.trg_sup_bell();

-- ล้างแถวห้องที่เงียบเกิน 30 วัน (แถวละไม่กี่ไบต์ แต่ไม่ให้สะสม)
select cron.unschedule('rt-bells-cleanup') where exists (select 1 from cron.job where jobname = 'rt-bells-cleanup');
select cron.schedule('rt-bells-cleanup', '17 3 * * *', $c$delete from public.rt_bells where at < now() - interval '30 days'$c$);
