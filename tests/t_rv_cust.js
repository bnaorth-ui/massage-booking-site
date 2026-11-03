const {chromium}=require('playwright');
const bkk=(n=0)=>{const d=new Date(Date.now()+7*3600000+n*86400000);return d.toISOString().slice(0,10)};
(async()=>{const b=await chromium.launch(require('./config').launch);
const ctx=await b.newContext({timezoneId:'Asia/Bangkok',locale:'th-TH'});const errs=[],calls=[];
let mode={cat:true,rpcMissing:false};let PTS={on:true,baht_per:10,per_baht:10,min:100,expire_months:12,balance:450,next_expiry:new Date(Date.now()+30*86400000).toISOString(),next_expiry_points:100,history:[{kind:'earn',points:450,note:'ได้แต้มจากการใช้บริการ MS1',at:new Date().toISOString()}]};let lastCB=null;let MSGS=[{id:'m1',booking_id:'bid-MS1',room_key:'shop',sender_id:'shopuser',sender_role:'shop',sender_name:'ร้านสบายดี สปา',body:'ยินดีต้อนรับค่ะ',created_at:'2026-10-29T10:00:00.000000+00:00'}];let UNR=[{booking_id:'bid-MS1',room:'shop',n:1}];let marks=[];let sendErr=null;let seq=100000;const BKS=[];const NOTES=[];
const UID='uuid-1';const REVD=[];const subs=[];let subErr=null;
const places=[
 {id:'sh1',type:'shop',name:'ร้านสบายดี สปา',area:'สุขุมวิท',lat:13.76,lng:100.51,open_days:[0,1,2,3,4,5,6],open_time:'10:00:00',close_time:'21:00:00',fixed_date:null,advance_days:14,cancel_hours:24,image_path:null,status:'approved',active:true},
 {id:'og1',type:'org',name:'สำนักงานพัฒนาสังคม',area:'พญาไท',lat:13.758,lng:100.509,open_days:[0,1,2,3,4,5,6],open_time:'09:00:00',close_time:'17:00:00',fixed_date:bkk(3),advance_days:14,cancel_hours:24,image_path:null,status:'approved',active:true},
 {id:'cp1',type:'company',name:'บริษัท ไทยออฟฟิศ',area:'ปทุมวัน',lat:13.7635,lng:100.5018,open_days:[1,2,3,4,5],open_time:'09:00:00',close_time:'18:00:00',fixed_date:null,advance_days:14,cancel_hours:24,image_path:null,status:'approved',active:true}];
const services=[
 {id:'ga',place_id:null,name:'นวดไทยแผนโบราณ',minutes:60,price:400,applies_all:true,active:true},
 {id:'sa',place_id:'sh1',name:'นวดไทย',minutes:60,price:400,applies_all:false,active:true},
 {id:'sb',place_id:'sh1',name:'นวดเท้า',minutes:60,price:350,applies_all:false,active:true}];
const staff=[{id:'st1',name:'คุณวิภา',place_id:'sh1',photo_path:null},{id:'st2',name:'คุณสมศรี',place_id:'sh1',photo_path:null},{id:'st3',name:'คุณนุ่น',place_id:null,photo_path:null},{id:'st4',name:'คุณมะลิ',place_id:null,photo_path:null}];
const ss=[['st1','sa'],['st1','sb'],['st2','sa'],['st3','ga'],['st4','ga']].map(x=>({staff_id:x[0],service_id:x[1]}));
const ps=[{place_id:'og1',staff_id:'st3',weekdays:[]},{place_id:'cp1',staff_id:'st4',weekdays:[1,2,3,4,5]}];
const promos=[{id:'pm1',place_id:'sh1',title:'ลดราคานวดเท้า',description:'',type:'percent',value:10,applies_all:false,start_date:bkk(-1),end_date:bkk(30),image_path:null,active:true}];
const pms=[{promotion_id:'pm1',service_id:'sb'}];
const nm=id=>(staff.find(s=>s.id===id)||{}).name;
const busyItems=()=>BKS.filter(x=>x.status==='confirmed').flatMap(x=>x.items.filter(i=>i.active));
const fmt=b=>({ref:b.ref,place_id:b.place_id,place_name:b.place_name,place_type:b.place_type,cancel_hours:24,phone:b.phone,customer_name:'สมชาย ใจดี',starts_at:new Date(b.s).toISOString(),ends_at:new Date(b.e).toISOString(),total:b.total,discount:b.discount,promo:b.promo,status:b.status,moved_from:b.moved_from,moved_to:b.moved_to,id:'bid-'+b.ref,points_used:b.pu||0,points_discount:b.pd||0,created_at:new Date().toISOString(),items:b.items.map(i=>({id:i.id,service_id:i.service_id,service_name:i.service_name,staff_id:i.staff_id,staff_name:nm(i.staff_id),minutes:i.minutes,price:i.price,starts_at:new Date(i.s).toISOString(),ends_at:new Date(i.e).toISOString(),active:i.active,job:i.job||'pending'}))});
await ctx.route('**/*supabase.co/**',async r=>{const q=r.request(),u=new URL(q.url()),m=q.method(),path=u.pathname,body=(()=>{try{return JSON.parse(q.postData()||'null')}catch(e){return null}})();
 calls.push({m,path,body,auth:q.headers()['authorization']||''});
 const J=(s,o)=>r.fulfill({status:s,contentType:'application/json',body:JSON.stringify(o)});
 const sess=()=>({access_token:'at',refresh_token:'rt',expires_in:3600,user:{id:UID,user_metadata:{first_name:'สมชาย',last_name:'ใจดี',phone:'0811111111'}}});
 if(path==='/auth/v1/signup'||(path==='/auth/v1/token'&&u.search.includes('password')))return J(200,sess());
 if(path==='/auth/v1/token')return J(200,sess());
 if(path==='/rest/v1/profiles')return J(200,[{first_name:'สมชาย',last_name:'ใจดี',phone:'0811111111',avatar_path:null}]);
 if(!mode.cat&&path.startsWith('/rest/v1/places'))return r.abort();
 const T={places:places,services:services,service_places:[],staff_public:staff,staff_services:ss,place_staff:ps,staff_days_off:[],promotions:promos,promotion_services:pms,place_day_overrides:[],app_settings:[process.env.EMPTY?{shop_radius_km:10,org_radius_km:10,notify_user:true,notify_staff:true}:{shop_radius_km:10,org_radius_km:10,notify_user:true,notify_staff:true,association_name:'สมาคมทดสอบ',address:'เลขที่ 1 ถนนทดสอบ',phone:'02-123 4567',line_url:'https://line.me/R/ti/p/@test',hours_text:'จันทร์ – ศุกร์ 08:30 – 16:30 น.\nเสาร์ – อาทิตย์ ปิด',register_url:'https://shop.example.com/'}],announcements:[{title:'ประกาศทดสอบ',body:'สวัสดี',audiences:['ผู้ใช้งาน'],active:true}],notifications:NOTES};
 const t=path.replace('/rest/v1/','');
 if(m==='GET'&&T[t]!==undefined)return J(200,T[t]);
 if(mode.rpcMissing&&path.startsWith('/rest/v1/rpc/'))return J(404,{code:'PGRST202',message:'Could not find the function public.'+path.split('/').pop()+' in the schema cache'});
 if(path==='/rest/v1/rpc/busy_slots'){const f=Date.parse(body.p_from),to=Date.parse(body.p_to);return J(200,busyItems().filter(i=>body.p_staff.includes(i.staff_id)&&i.s<to&&i.e>f).map(i=>({staff_id:i.staff_id,starts_at:new Date(i.s).toISOString(),ends_at:new Date(i.e).toISOString()})))}
 if(path==='/rest/v1/rpc/chat_unread')return J(200,UNR);
 if(path==='/rest/v1/rpc/chat_mark_read'){marks.push(body);UNR=UNR.filter(x=>!(x.booking_id===body.p_booking&&x.room===body.p_room));return J(204,null)}
 if(path==='/rest/v1/rpc/chat_send'){if(sendErr)return J(400,{code:'P0001',message:sendErr});MSGS.push({id:'m'+(MSGS.length+1),booking_id:body.p_booking,room_key:body.p_room,sender_id:UID,sender_role:'user',sender_name:'สมชาย ใจดี',body:body.p_body,created_at:new Date().toISOString().replace('Z','000+00:00')});return J(200,'x')}
 if(path==='/rest/v1/chat_messages'){const b=u.searchParams.get('booking_id').replace('eq.',''),r=u.searchParams.get('room_key').replace('eq.',''),gt=u.searchParams.get('created_at');let L=MSGS.filter(m=>m.booking_id===b&&m.room_key===r);if(gt)L=L.filter(m=>m.created_at>gt.replace('gt.',''));return J(200,L)}
 if(path==='/rest/v1/rpc/place_ratings'){if(mode.noRv)return J(404,{code:'PGRST202',message:'Could not find the function'});return J(200,[{place_id:'sh1',avg_rating:4.6,fresh:false}])}
 if(path==='/rest/v1/reviews'&&m==='GET')return J(200,REVD.map(x=>({booking_id:x})));
 if(path==='/rest/v1/rpc/submit_review'){subs.push(body);if(subErr)return J(400,{code:'P0001',message:subErr});REVD.push(body.p_booking);return J(200,'rid')}
 if(path==='/rest/v1/rpc/place_reviews'){const off=body.p_offset;const all=Array.from({length:13},(_,i)=>({id:'r'+i,first:'คุณ'+i,rating:5-(i%3),comment:i===0?'บริการดีมาก':'',reply:i===0?'ขอบคุณค่ะ':null,at:new Date(Date.now()-i*86400000).toISOString()}));return J(200,{n:13,avg:4.6,items:all.slice(off,off+10),more:off+10<13})}
 if(path==='/rest/v1/rpc/my_points')return J(200,PTS);
 if(path==='/rest/v1/rpc/my_bookings')return J(200,BKS.slice().sort((a,b)=>b.s-a.s).map(fmt));
 if(path==='/rest/v1/rpc/cancel_booking'){const b=BKS.find(x=>x.ref===body.p_ref);if(Date.now()>b.s-24*3600000)return J(400,{code:'P0001',message:'ยกเลิกไม่ได้ เกินเวลาที่ยกเลิกได้'});b.status='cancelled';b.items.forEach(i=>i.active=false);return r.fulfill({status:204,body:''})}
 if(path==='/rest/v1/rpc/create_booking'){const pl=places.find(p=>p.id===body.p_place);const start=Date.parse(body.p_start);let old=null;
   if(body.p_moved_from){old=BKS.find(x=>x.ref===body.p_moved_from&&x.status==='confirmed');if(!old)return J(400,{code:'P0001',message:'ไม่พบการจองเดิมที่จะเลื่อน'})}
   const its=[];let tot=0,dis=0,promo=null;
   for(const it of body.p_items){const sv=services.find(s=>s.id===it.service_id);const s=start+it.offset_min*60000,e=s+sv.minutes*60000;
     const pool=busyItems().filter(i=>!(old&&old.items.includes(i)));
     if(pool.some(i=>i.staff_id===it.staff_id&&i.s<e&&i.e>s))return J(400,{code:'P0001',message:'คิวนี้เพิ่งเต็ม กรุณาเลือกเวลาหรือพนักงานใหม่'});
     let d=0;const pm=promos.find(p=>p.place_id===pl.id&&(pms.some(q=>q.promotion_id===p.id&&q.service_id===sv.id)));if(pm){d=Math.round(sv.price*pm.value)/100;promo=pm.title}
     tot+=sv.price-d;dis+=d;its.push({id:'it'+Math.random(),service_id:sv.id,service_name:sv.name,staff_id:it.staff_id,minutes:sv.minutes,price:sv.price-d,s,e,active:true})}
   if(old){old.status='rescheduled';old.items.forEach(i=>i.active=false)}
   const ref='MS'+(seq++);if(old)old.moved_to=ref;
   BKS.push({ref,place_id:pl.id,place_name:pl.name,place_type:pl.type,phone:body.p_phone,s:Math.min(...its.map(i=>i.s)),e:Math.max(...its.map(i=>i.e)),total:tot,discount:dis,promo,status:'confirmed',moved_from:body.p_moved_from,moved_to:null,items:its});
   NOTES.unshift({id:'n'+seq,title:'จองสำเร็จ',body:'เลขที่ '+ref,created_at:new Date().toISOString(),booking_id:'x'});
   if(body.p_points){lastCB=body;const pd=body.p_points/10;BKS[BKS.length-1].total-=pd;BKS[BKS.length-1].pu=body.p_points;BKS[BKS.length-1].pd=pd;PTS.balance-=body.p_points}
   return J(200,ref)}
 return J(404,{message:'nf '+path})});
const p=await ctx.newPage();await ctx.route('**/rest/v1/rpc/public_catalog',async r=>{try{const o=new URL(r.request().url()).origin;const g=t=>p.evaluate(async u=>{try{const x=await fetch(u);return x.ok?await x.json():null}catch(e){return null}},o+'/rest/v1/'+t+'?select=*');const R={};for(const [k,t] of [['places','places'],['services','services'],['service_places','service_places'],['staff','staff_public'],['staff_services','staff_services'],['place_staff','place_staff'],['days_off','staff_days_off'],['promos','promotions'],['promo_services','promotion_services'],['overrides','place_day_overrides'],['settings','app_settings'],['ann','announcements']])R[k]=await g(t);if(R.places===null)return r.fulfill({status:500,contentType:'application/json',body:'{"message":"fail"}'});for(const k in R)if(R[k]===null)R[k]=[];R.settings=R.settings&&R.settings[0];r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(R)})}catch(e){}});{const _w=p.waitForSelector.bind(p);p.waitForSelector=async(s,o)=>{if(s==='#lph'){await _w('#lph,[data-gb=login]',o);if(!(await p.$('#lph')))await p.click('[data-gb=login]')}return _w(s,o)}}{const _f=p.fill.bind(p);p.fill=async(s,v,o)=>{if(s==='#lph'){await p.waitForSelector('#lph,[data-gb=login]',{timeout:8000});if(!(await p.$('#lph')))await p.click('[data-gb=login]')}return _f(s,v,o)}};p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>{errs.push('DIALOG '+d.message());d.dismiss()});
const store=[];await ctx.route('**/storage/v1/object/avatars/**',r=>{store.push({m:r.request().method(),u:new URL(r.request().url()).pathname,auth:r.request().headers()['authorization']||''});r.fulfill({status:200,contentType:'application/json',body:'{}'})});
const patches=[];await ctx.route('**/rest/v1/profiles?id=eq.*',async r=>{if(r.request().method()==='PATCH'){patches.push(JSON.parse(r.request().postData()||'{}'));return r.fulfill({status:204,body:''})}return r.fallback()});
await p.goto(require('./config').page('customer-booking.html'));
const A=async()=>await p.textContent('#app');const home=async()=>{if(await p.$('#home'))await p.click('#home');if(await p.$('#again'))await p.click('#again')};const ok=(n,c)=>console.log((c?'PASS ':'FAIL ')+n);
const H=3600000,mk=(ref,off,st,job)=>({ref,place_id:'sh1',place_name:'ร้านสบายดี สปา',place_type:'shop',phone:'0811111111',s:Date.now()+off*H,e:Date.now()+off*H+H,total:400,discount:0,promo:null,status:st,moved_from:null,moved_to:null,items:[{id:'it'+ref,service_id:'v1',service_name:'นวดไทย',staff_id:'st1',minutes:60,price:400,s:Date.now()+off*H,e:Date.now()+off*H+H,active:st==='confirmed',job:job||'pending'}]});
BKS.push(mk('MS1',72,'confirmed'),mk('MS2',-48,'confirmed','done'),mk('MS3',96,'cancelled'),mk('MS4',120,'rescheduled'),mk('MS5',-72,'completed','done'));

await p.fill('#lph','0811111111');await p.fill('#lpw','abc123');await p.click('button[type=submit]');await p.waitForSelector('[data-pl]',{timeout:4000});



await p.click('[data-tab="bk"]');await p.waitForTimeout(500);await p.click('[data-bt=hist]');await p.waitForTimeout(300);
ok('rate button on completed booking',(await p.$$('[data-rate="bid-MS5"]')).length===1);
ok('no rate button on confirmed/cancelled',(await p.$$('[data-rate]')).length===1);
await p.click('[data-rate="bid-MS5"]');await p.waitForTimeout(300);
ok('form title + tabs visible',(await p.textContent('#rvt')).includes('ให้คะแนนบริการ')&&await p.$eval('#tabs',e=>getComputedStyle(e).display!=='none'));
ok('shop + staff sections',(await p.textContent('#app')).includes('คะแนนร้าน')&&(await p.textContent('#app')).includes('คะแนนพนักงาน คุณวิภา'));
ok('score buttons labelled',(await p.$$eval('.rvs button',b=>b.map(x=>x.textContent))).slice(0,5).join()==='1 คะแนน,2 คะแนน,3 คะแนน,4 คะแนน,5 คะแนน');
await p.click('#rvsend');await p.waitForTimeout(200);
ok('empty submit blocked',(await p.textContent('#rve')).includes('อย่างน้อย 1 ส่วน')&&subs.length===0);
await p.click('.rvs[data-k=shop] button[data-sc="5"]');await p.fill('#rcs','ดีมากครับ');
ok('pressed state',(await p.getAttribute('.rvs[data-k=shop] button[data-sc="5"]','aria-pressed'))==='true');
await p.waitForTimeout(4600);
ok('typed comment kept after bg refresh',(await p.inputValue('#rcs'))==='ดีมากครับ'&&!!(await p.$('#rvp')));
subErr='เกินเวลาให้คะแนน (ภายใน 7 วันหลังบริการเสร็จสิ้น)';await p.click('#rvsend');await p.waitForTimeout(400);
ok('server error shown, form stays',(await p.textContent('#rve')).includes('เกินเวลา')&&!!(await p.$('#rvsend')));
subErr=null;await p.click('.rvs[data-k=s0] button[data-sc="4"]');await p.fill('#rcst0','สุภาพ');await p.click('#rvsend');await p.waitForTimeout(800);
const sb=subs[subs.length-1];
ok('payload',sb.p_booking==='bid-MS5'&&sb.p_shop_rating===5&&sb.p_shop_comment==='ดีมากครับ'&&sb.p_staff.length===1&&sb.p_staff[0].staff_id==='st1'&&sb.p_staff[0].rating===4&&sb.p_staff[0].comment==='สุภาพ');
ok('SR announces review thanks',(await p.evaluate(()=>document.getElementById('sr').textContent)).includes('ขอบคุณสำหรับคะแนน'));
ok('back on list with thanks, no rate button',(await A()).includes('ขอบคุณสำหรับคะแนน')&&(await p.$$('[data-rate]')).length===0&&(await A()).includes('ให้คะแนนบริการแล้ว'));
await p.click('[data-tab=""]');await p.waitForTimeout(400);
ok('place card shows score only',(await A()).includes('คะแนน 4.6 จาก 5')&&!(await A()).includes('จาก 13'));
ok('review button',(await p.$$('[data-rv="sh1"]')).length===1);
await p.click('[data-rv="sh1"]');await p.waitForTimeout(500);
ok('list page avg + first review + reply',(await A()).includes('คะแนน 4.6 จาก 5')&&(await A()).includes('บริการดีมาก')&&(await A()).includes('ร้านตอบกลับ'));
ok('10 items then more',(await p.$$('.rv')).length===10&&!!(await p.$('#rvmore')));
await p.click('#rvmore');await p.waitForTimeout(500);
ok('13 items, no more button',(await p.$$('.rv')).length===13&&!(await p.$('#rvmore')));
ok('tabs visible on review list',await p.$eval('#tabs',e=>getComputedStyle(e).display!=='none'));
await p.click('[data-tab="bk"]');await p.waitForTimeout(400);
ok('tab click leaves review page',!(await p.$('#rvp'))&&(await A()).includes('รายการจอง'));
await p.click('[data-tab=""]');await p.waitForTimeout(400);
ok('back at places',!!(await p.$('[data-pl]'))&&await p.$eval('#tabs',e=>getComputedStyle(e).display!=='none'));
console.log('errors:',errs.join('|')||'none');await b.close();process.exit(0)})();
