-- เตือนงานค้างนาน: ตรวจทุก 10 นาที ส่งแจ้งเตือน (รวมถึงแจ้งเตือนเด้ง) ถึงคนที่ดูแลหมวดนั้น เรื่องละครั้ง
-- ส่งเฉพาะ 08:00-20:00 (เวลาไทย) เรื่องที่เกินเวลาตอนกลางคืนรวมส่งตอน 08:00
-- เกณฑ์: สลิปเติมเงิน 2 ชม. (นับจากแนบสลิป) แชตไม่มีใครตอบ 30 นาที คำขอรหัสผ่านใหม่ 2 ชม.
--        ร้านสมัครใหม่ คำขอปิดร้าน หมอนวดสมัครงาน คำขอลบบัญชีหมอนวด 1 วัน
create table if not exists public.admin_overdue_sent (
  kind text not null, ref text not null, sent_at timestamptz not null default now(),
  primary key (kind, ref));
alter table public.admin_overdue_sent enable row level security;   -- ไม่มีกฎ: ใช้ภายในฟังก์ชันเท่านั้น

create or replace function public.admin_overdue_alerts(p_force boolean default false)
returns integer language plpgsql security definer set search_path = public as $$
declare hr int := extract(hour from now() at time zone 'Asia/Bangkok'); n int := 0; g record;
begin
  if not p_force and (hr < 8 or hr >= 20) then return 0; end if;
  delete from public.admin_overdue_sent where sent_at < now() - interval '60 days';
  create temp table if not exists _od (kind text, ref text, areas text[], line text) on commit drop;
  truncate _od;
  insert into _od
  select 'topup', t.id::text, array['finance'], 'สลิปเติมเงินรอยืนยัน ' || coalesce(p.name, '')
    from public.topup_requests t left join public.places p on p.id = t.place_id
   where t.status = 'pending' and t.slip_path is not null and coalesce(t.slip_at, t.created_at) < now() - interval '2 hours'
  union all
  select 'support', r.user_id::text || ':' || r.app || ':' || extract(epoch from r.last_at)::bigint, public._sup_areas(r.user_id, r.app),
         'แชตยังไม่มีใครตอบ ' || case r.app when 'shop' then 'ร้านนวด ' when 'staff' then 'หมอนวด ' else 'ผู้ใช้งาน ' end || coalesce(r.name, '')
    from public.support_rooms r
   where r.last_from = 'user' and r.last_at < now() - interval '30 minutes'
  union all
  select 'pwreq', q.id::text, array['users'], 'คำขอรหัสผ่านใหม่ ' || q.first_name || ' ' || q.last_name
    from public.password_requests q where q.status = 'pending' and q.created_at < now() - interval '2 hours'
  union all
  select 'shopreg', s.id::text, array['shop'], 'ร้านสมัครใหม่รออนุมัติ ' || coalesce(s.name, '')
    from public.shop_registrations s where s.status = 'pending' and s.created_at < now() - interval '1 day'
  union all
  select 'shopclose', c.id::text, array['shop'], 'คำขอปิดร้าน ' || coalesce(p.name, '')
    from public.shop_close_requests c left join public.places p on p.id = c.place_id
   where c.status = 'pending' and c.requested_at < now() - interval '1 day'
  union all
  select 'staffapp', a.id::text, array['staff'], 'หมอนวดสมัครงาน ' || coalesce(a.full_name, '')
    from public.staff_applications a where a.status = 'new' and a.created_at < now() - interval '1 day'
  union all
  select 'staffdel', d.id::text, array['staff'], 'คำขอลบบัญชีหมอนวด ' || coalesce(st.name, '')
    from public.staff_delete_requests d left join public.staff st on st.id = d.staff_id
   where d.status = 'pending' and d.requested_at < now() - interval '1 day';
  delete from _od o using public.admin_overdue_sent s where s.kind = o.kind and s.ref = o.ref;
  for g in select o.areas, count(*) c, string_agg(o.line, E'\n' order by o.kind, o.line) body from _od o group by o.areas loop
    insert into public.notifications(audience, kind, title, body, areas)
      values ('admin', 'overdue', 'งานเกินเวลา ' || g.c || ' รายการ', left(g.body, 600), g.areas);
    n := n + 1;
  end loop;
  insert into public.admin_overdue_sent(kind, ref) select distinct kind, ref from _od on conflict do nothing;
  return n;
end $$;
revoke all on function public.admin_overdue_alerts(boolean) from public, anon, authenticated;

select cron.unschedule('admin-overdue-alerts') where exists (select 1 from cron.job where jobname = 'admin-overdue-alerts');
select cron.schedule('admin-overdue-alerts', '*/10 * * * *', 'select public.admin_overdue_alerts()');
