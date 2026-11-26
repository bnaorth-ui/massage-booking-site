-- 2026-11-26 ชวนลูกค้าให้คะแนนหลังนวดเสร็จตามเวลาที่แอดมินตั้ง (คู่กับ admin v1.45)
-- เดิม trg_review_invite ส่ง "ให้คะแนนบริการ" ทันทีที่การจองเสร็จ (พร้อมกับ "บริการเสร็จสิ้น") ข้อความไม่บอกร้าน/หมอนวด และอ้าง "เมนูรายการ" (ชื่อเก่า)
-- ใหม่: app_settings.review_invite_min (0 = ทันที, 30 ค่าเริ่ม, 60, 120) การจองที่เสร็จจะเข้าคิว review_invites แล้ว send_review_invites() (cron ทุก 5 นาที) ส่งเมื่อถึงเวลา
-- ไม่ส่ง: รีวิวแล้ว, การจองไม่อยู่ในสถานะเสร็จสิ้นแล้ว, ปิดแจ้งเตือนลูกค้า, เลย 7 วัน (หมดเวลารีวิว) ส่งครั้งเดียวต่อการจอง
-- การจองที่เสร็จก่อนรันไฟล์นี้ไม่มีแถวในคิว จึงไม่ถูกส่งย้อนหลัง

alter table public.app_settings add column if not exists review_invite_min int not null default 30;
alter table public.app_settings drop constraint if exists app_settings_review_invite_min_chk;
alter table public.app_settings add constraint app_settings_review_invite_min_chk check (review_invite_min in (0, 30, 60, 120));

create table if not exists public.review_invites (
  booking_id uuid primary key references public.bookings(id) on delete cascade,
  due_at timestamptz not null,
  sent_at timestamptz,
  skipped text
);
alter table public.review_invites enable row level security;
revoke all on table public.review_invites from anon, authenticated;
create index if not exists review_invites_due on public.review_invites (due_at) where sent_at is null;

-- ส่ง 1 การจอง (ใช้ทั้งตอนตั้งเป็น "ทันที" และจาก cron) คืน true ถ้าส่งจริง
create or replace function public._review_invite_send(p_booking uuid)
 returns boolean language plpgsql security definer set search_path = public as $$
declare b public.bookings; s public.app_settings; pname text; ptype public.place_type; svc text; stf text; why text;
begin
  select * into b from public.bookings where id = p_booking;
  select * into s from public.app_settings limit 1;
  why := case when b.id is null then 'gone'
              when b.status::text <> 'completed' then 'status'
              when s.notify_user is not true then 'off'
              when exists (select 1 from public.reviews r where r.booking_id = b.id) then 'reviewed'
              when b.ends_at < now() - interval '7 days' then 'expired' end;
  if why is not null then
    update public.review_invites set sent_at = now(), skipped = why where booking_id = p_booking and sent_at is null;
    return false;
  end if;
  select name, type into pname, ptype from public.places where id = b.place_id;
  select string_agg(distinct i.service_name || ' ' || i.minutes || ' นาที', ', '),
         string_agg(distinct st.name, ', ')
    into svc, stf
    from public.booking_items i left join public.staff st on st.id = i.staff_id
   where i.booking_id = b.id and (i.active or not exists (select 1 from public.booking_items a where a.booking_id = b.id and a.active));
  perform public.notify('user',
    case when ptype = 'shop' then 'ให้คะแนนร้านและหมอนวด' else 'ให้คะแนนบริการ' end,
    coalesce(svc, 'บริการเลขที่ ' || b.ref) || case when stf is not null then ' กับ' || stf else '' end || ' ที่' || coalesce(pname, '')
      || E'\nให้คะแนนได้ภายใน 7 วัน ที่เมนูการจอง > ประวัติ',
    p_user => b.customer_id, p_kind => 'review', p_booking => b.id);
  update public.review_invites set sent_at = now() where booking_id = p_booking;
  return true;
end $$;
revoke execute on function public._review_invite_send(uuid) from public, anon, authenticated;

-- ทริกเกอร์เดิม: เข้าคิวแทนการส่งทันที (ตั้ง 0 = ส่งทันที)
create or replace function public.trg_review_invite()
 returns trigger language plpgsql security definer set search_path = public as $$
declare s public.app_settings; d int;
begin
  if new.status::text = 'completed' and old.status::text is distinct from 'completed' then
    begin
      select * into s from public.app_settings limit 1;
      if s.notify_user then
        d := coalesce(s.review_invite_min, 30);
        insert into public.review_invites(booking_id, due_at) values (new.id, now() + make_interval(mins => d)) on conflict do nothing;
        if d = 0 then perform public._review_invite_send(new.id); end if;
      end if;
    exception when others then raise warning 'review_invite: %', sqlerrm;
    end;
  end if;
  return new;
end $$;
revoke execute on function public.trg_review_invite() from public, anon, authenticated;

create or replace function public.send_review_invites()
 returns integer language plpgsql security definer set search_path = public as $$
declare r record; n int := 0;
begin
  perform set_config('app.sys', '1', true);
  for r in select booking_id from public.review_invites where sent_at is null and due_at <= now() order by due_at limit 200 for update skip locked loop
    if public._review_invite_send(r.booking_id) then n := n + 1; end if;
  end loop;
  return n;
end $$;
revoke execute on function public.send_review_invites() from public, anon, authenticated;

select cron.unschedule('send-review-invites') where exists (select 1 from cron.job where jobname = 'send-review-invites');
select cron.schedule('send-review-invites', '*/5 * * * *', 'select public.send_review_invites()');
