-- 2026-11-24 เตือนหมอนวดก่อนหมดเวลานวด (คู่กับ admin v1.42)
-- ผู้ใช้เลือก: นับจากเวลาจบตามที่จอง (booking_items.ends_at), ส่งให้หมอนวดคนเดียว, เฉพาะคิวที่กดเริ่มงานแล้ว (job = in_progress)
-- ค่าเริ่มต้น 10, 5 นาที และเมื่อครบเวลา (0) ตั้งในแอปแอดมิน ตั้งค่า > การแจ้งเตือน ปิดทั้งหมด = ไม่ติ๊กเลย
-- ไม่ทับกับ remind_overdue_jobs() (เริ่มเตือนหลังคิวจบ 30 นาที)

alter table public.app_settings add column if not exists end_remind_mins int[] not null default '{10,5,0}';
alter table public.app_settings drop constraint if exists app_settings_end_remind_mins_chk;
alter table public.app_settings add constraint app_settings_end_remind_mins_chk check (end_remind_mins <@ array[0,5,10,15]);

-- จดว่าเตือนช่วงไหนไปแล้ว (กันส่งซ้ำ) เข้าถึงผ่านฟังก์ชันระบบเท่านั้น
create table if not exists public.job_end_reminders (
  item_id uuid not null references public.booking_items(id) on delete cascade,
  mins int not null,
  sent_at timestamptz not null default now(),
  primary key (item_id, mins)
);
alter table public.job_end_reminders enable row level security;
revoke all on table public.job_end_reminders from anon, authenticated;

create or replace function public.send_end_reminders()
 returns integer language plpgsql security definer set search_path = public as $$
declare s public.app_settings; r record; n int := 0; due int[]; pick int; left_m int; ttl text; bdy text;
begin
  perform set_config('app.sys', '1', true);
  select * into s from public.app_settings limit 1;
  if s.notify_staff is false or coalesce(array_length(s.end_remind_mins, 1), 0) = 0 then return 0; end if;
  for r in
    select i.id, i.staff_id, i.service_name, i.ends_at, i.started_at, b.id as booking_id, b.customer_name
    from public.booking_items i join public.bookings b on b.id = i.booking_id
    where b.status = 'confirmed' and i.active and i.job = 'in_progress' and i.staff_id is not null
      and i.ends_at > now() - interval '3 minutes'
      and exists (select 1 from unnest(s.end_remind_mins) m
                  where i.ends_at <= now() + make_interval(mins => m)
                    and not exists (select 1 from public.job_end_reminders x where x.item_id = i.id and x.mins = m))
    for update of i skip locked
  loop
    -- ช่วงที่ถึงเวลาแล้วและยังไม่เคยเตือน: จดไว้ทั้งหมด แต่แจ้งแค่ช่วงที่ใกล้ที่สุด (กันแจ้งรัว ๆ)
    select array_agg(m order by m) into due from unnest(s.end_remind_mins) m
      where r.ends_at <= now() + make_interval(mins => m)
        and not exists (select 1 from public.job_end_reminders x where x.item_id = r.id and x.mins = m);
    insert into public.job_end_reminders(item_id, mins) select r.id, unnest(due) on conflict do nothing;
    -- เริ่มงานหลังเลยช่วงนั้นมาแล้ว (เช่น เริ่มช้า) ไม่ต้องเตือนช่วงนั้น
    select min(m) into pick from unnest(due) m where r.started_at is null or r.started_at <= r.ends_at - make_interval(mins => m);
    if pick is null then continue; end if;
    left_m := greatest(1, round(extract(epoch from (r.ends_at - now())) / 60)::int);
    ttl := case when pick = 0 then 'ครบเวลานวดแล้ว' else 'อีก ' || public._remind_txt(left_m) || ' หมดเวลานวด' end;
    bdy := 'ลูกค้า ' || r.customer_name || E'\n' || r.service_name || ' คิวจบ ' || to_char(r.ends_at at time zone 'Asia/Bangkok', 'HH24:MI') || ' น.'
           || case when pick = 0 then E'\nกดเสร็จสิ้นงานในแอป' else '' end;
    perform public.notify('staff', ttl, bdy, p_staff => r.staff_id, p_kind => 'job', p_booking => r.booking_id);
    n := n + 1;
  end loop;
  return n;
end $$;
revoke execute on function public.send_end_reminders() from public, anon, authenticated;

select cron.unschedule('send-end-reminders') where exists (select 1 from cron.job where jobname = 'send-end-reminders');
select cron.schedule('send-end-reminders', '* * * * *', 'select public.send_end_reminders()');
