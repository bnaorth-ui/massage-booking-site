-- 2026-11-26 ลูกค้ากด "ฉันถึงร้านแล้ว" (คู่กับ customer v1.52, staff v1.28, shop v1.28, admin v1.46)
-- ผู้ใช้เลือก: ระยะถือว่าถึงร้าน 200 เมตร, ไม่ยืนยันตำแหน่ง = ไม่กันปุ่มลูกค้าไม่มา, ไม่แจ้งแอดมิน
-- เก็บแค่เวลาที่มาถึงและยืนยันตำแหน่งหรือไม่ ไม่เก็บพิกัดของลูกค้า (ใช้คำนวณระยะแล้วทิ้ง)

alter table public.bookings add column if not exists arrived_at timestamptz;
alter table public.bookings add column if not exists arrived_ok boolean not null default false;
alter table public.bookings add column if not exists arrive_nudged boolean not null default false;

-- ลูกค้ากดถึงร้าน p_lat/p_lng ว่าง = เครื่องหาตำแหน่งไม่ได้ (บันทึกแบบไม่ยืนยันตำแหน่ง)
create or replace function public.customer_arrive(p_ref text, p_lat double precision default null, p_lng double precision default null)
 returns jsonb language plpgsql security definer set search_path = public as $$
declare b public.bookings; pl public.places; dist int; ok boolean; x record; who text; fresh boolean;
begin
  if auth.uid() is null then raise exception 'กรุณาเข้าสู่ระบบ'; end if;
  select * into b from public.bookings where ref = p_ref and customer_id = auth.uid() for update;
  if not found then raise exception 'ไม่พบการจองนี้'; end if;
  select * into pl from public.places where id = b.place_id;
  if pl.type::text <> 'shop' then raise exception 'ใช้ได้กับการจองที่ร้านเท่านั้น'; end if;
  if b.status::text <> 'confirmed' then raise exception 'การจองนี้ปิดไปแล้ว'; end if;
  if now() < b.starts_at - interval '30 minutes' then raise exception 'กดได้ตั้งแต่ 30 นาทีก่อนเวลานัด'; end if;
  if now() > b.starts_at + interval '30 minutes' then raise exception 'เลยเวลานัดเกิน 30 นาทีแล้ว โปรดติดต่อร้าน'; end if;
  if exists (select 1 from public.booking_items where booking_id = b.id and active and job in ('in_progress', 'done')) then
    raise exception 'หมอนวดเริ่มงานแล้ว'; end if;
  if b.arrived_ok then
    return jsonb_build_object('ok', true, 'arrived_at', b.arrived_at, 'arrived_ok', true);
  end if;
  ok := false;
  if p_lat is not null and p_lng is not null and pl.lat is not null and pl.lng is not null then
    if p_lat not between -90 and 90 or p_lng not between -180 and 180 then raise exception 'ตำแหน่งไม่ถูกต้อง'; end if;
    dist := round(6371000 * 2 * asin(sqrt(power(sin(radians(p_lat - pl.lat) / 2), 2)
              + cos(radians(pl.lat)) * cos(radians(p_lat)) * power(sin(radians(p_lng - pl.lng) / 2), 2))));
    if dist > 200 then
      return jsonb_build_object('ok', false, 'dist', dist);
    end if;
    ok := true;
  end if;
  if b.arrived_at is not null and not ok then
    return jsonb_build_object('ok', true, 'arrived_at', b.arrived_at, 'arrived_ok', false);
  end if;
  fresh := b.arrived_at is null;
  update public.bookings set arrived_at = coalesce(arrived_at, now()), arrived_ok = ok where id = b.id
    returning * into b;
  who := 'ลูกค้า ' || b.customer_name || ' คิว ' || to_char(b.starts_at at time zone 'Asia/Bangkok', 'HH24:MI') || ' น.'
         || case when ok then '' else E'\n(ไม่ได้ยืนยันตำแหน่ง)' end;
  -- อัปเกรดจากไม่ยืนยันเป็นยืนยันภายหลัง ไม่ต้องแจ้งซ้ำ
  if fresh then
    for x in select staff_id, string_agg(service_name, ', ') svc from public.booking_items
              where booking_id = b.id and active and staff_id is not null group by staff_id loop
      perform public.notify('staff', 'ลูกค้าถึงร้านแล้ว', who || E'\n' || x.svc, p_staff => x.staff_id, p_kind => 'job', p_booking => b.id);
    end loop;
    perform public.notify('shop', 'ลูกค้าถึงร้านแล้ว', who || E'\nเลขที่ ' || b.ref, p_place => b.place_id, p_kind => 'job', p_booking => b.id);
  end if;
  return jsonb_build_object('ok', true, 'arrived_at', b.arrived_at, 'arrived_ok', ok, 'dist', dist);
end $$;
revoke execute on function public.customer_arrive(text, double precision, double precision) from public, anon;
grant execute on function public.customer_arrive(text, double precision, double precision) to authenticated;

-- ลูกค้ายืนยันตำแหน่งแล้ว บันทึก "ลูกค้าไม่มา" ไม่ได้ (ครอบทั้งปุ่มของร้านและหมอนวด)
create or replace function public.trg_no_show_arrived()
 returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status::text = 'no_show' and old.status::text <> 'no_show' and old.arrived_ok then
    raise exception 'ลูกค้ายืนยันตำแหน่งว่าถึงร้านแล้ว ใช้ปุ่มลูกค้าไม่มาไม่ได้';
  end if;
  return new;
end $$;
revoke execute on function public.trg_no_show_arrived() from public, anon, authenticated;
drop trigger if exists trg_no_show_arrived on public.bookings;
create trigger trg_no_show_arrived before update of status on public.bookings
  for each row execute function public.trg_no_show_arrived();

-- ลูกค้ารอเกิน 10 นาที (นับจากเวลานัดหรือเวลามาถึงที่ช้ากว่า) ยังไม่เริ่มงาน: เตือนหมอนวดและร้านครั้งเดียว
create or replace function public.remind_arrived_waiting()
 returns integer language plpgsql security definer set search_path = public as $$
declare r record; x record; n int := 0; msg text;
begin
  perform set_config('app.sys', '1', true);
  for r in select b.* from public.bookings b
            where b.status = 'confirmed' and b.arrived_at is not null and not b.arrive_nudged
              and greatest(b.starts_at, b.arrived_at) <= now() - interval '10 minutes'
              and b.starts_at > now() - interval '3 hours'
              and not exists (select 1 from public.booking_items i where i.booking_id = b.id and i.active and i.job in ('in_progress', 'done'))
            for update skip locked loop
    update public.bookings set arrive_nudged = true where id = r.id;
    msg := 'ลูกค้า ' || r.customer_name || ' ถึงร้านตั้งแต่ ' || to_char(r.arrived_at at time zone 'Asia/Bangkok', 'HH24:MI')
           || ' น. คิว ' || to_char(r.starts_at at time zone 'Asia/Bangkok', 'HH24:MI') || E' น.\nกดเริ่มงานในแอป';
    for x in select distinct staff_id from public.booking_items where booking_id = r.id and active and staff_id is not null loop
      perform public.notify('staff', 'ลูกค้ารออยู่ที่ร้าน', msg, p_staff => x.staff_id, p_kind => 'job', p_booking => r.id);
    end loop;
    perform public.notify('shop', 'ลูกค้ารออยู่ที่ร้าน', msg || E'\nเลขที่ ' || r.ref, p_place => r.place_id, p_kind => 'job', p_booking => r.id);
    n := n + 1;
  end loop;
  return n;
end $$;
revoke execute on function public.remind_arrived_waiting() from public, anon, authenticated;

select cron.unschedule('remind-arrived-waiting') where exists (select 1 from cron.job where jobname = 'remind-arrived-waiting');
select cron.schedule('remind-arrived-waiting', '* * * * *', 'select public.remind_arrived_waiting()');

-- ส่งเวลามาถึงให้แอป: ผู้ใช้งาน (my_bookings), หมอนวด (my_jobs), แอดมินค้นหา (admin_search)
-- แก้แบบแทรกข้อความในฟังก์ชันเดิม (รันซ้ำได้ ไม่แทรกซ้ำ)
do $m$
declare d text;
begin
  d := pg_get_functiondef('public.my_bookings()'::regprocedure);
  if d not like '%arrived_at%' then
    d := replace(d, '''created_at'', b.created_at,', '''created_at'', b.created_at, ''arrived_at'', b.arrived_at, ''arrived_ok'', b.arrived_ok,');
    execute d;
  end if;
  d := pg_get_functiondef('public.my_jobs(timestamptz)'::regprocedure);
  if d not like '%arrived_at%' then
    d := replace(d, '''created_at'', b.created_at,', '''created_at'', b.created_at, ''arrived_at'', b.arrived_at, ''arrived_ok'', b.arrived_ok,');
    execute d;
  end if;
  d := pg_get_functiondef('public.admin_search(text)'::regprocedure);
  if d not like '%arrived_at%' then
    d := replace(d, '''discount'',coalesce(b.discount,0),', '''discount'',coalesce(b.discount,0),''arrived_at'',b.arrived_at,''arrived_ok'',b.arrived_ok,'
      || '''started_at'',(select min(i.started_at) from public.booking_items i where i.booking_id = b.id),');
    execute d;
  end if;
  if pg_get_functiondef('public.my_bookings()'::regprocedure) not like '%arrived_ok%'
     or pg_get_functiondef('public.my_jobs(timestamptz)'::regprocedure) not like '%arrived_ok%'
     or pg_get_functiondef('public.admin_search(text)'::regprocedure) not like '%arrived_ok%' then
    raise exception 'แทรก arrived_at ไม่สำเร็จ';
  end if;
end $m$;
