// เมนูรายการโปรด: แถบหมอโปรด (เวลาว่าง เรียง ไม่รับจอง หน้าว่าง) และจองกับหมอโปรด (บริการที่หมอทำได้ เวลาที่หมอว่าง เลือกหมอไว้ให้ ไม่ระบุหมอ จองหลายคน)
const {chromium}=require('playwright');
const bkk=(n=0)=>{const d=new Date(Date.now()+7*3600000+n*86400000);return d.toISOString().slice(0,10)};
(async()=>{const b=await chromium.launch(require('./config').launch);
const ctx=await b.newContext({timezoneId:'Asia/Bangkok',locale:'th-TH'});const errs=[],calls=[];
let mode={cat:true,rpcMissing:false,busyErr:false};const FP=[],FS=[];const BUSYQ=[];let seq=100000;const BKS=[];const NOTES=[];
const UID='uuid-1';
const places=[
 {id:'sh1',type:'shop',name:'ร้านสบายดี สปา',area:'สุขุมวิท',lat:13.76,lng:100.51,open_days:[0,1,2,3,4,5,6],open_time:'10:00:00',close_time:'21:00:00',fixed_date:null,advance_days:14,cancel_hours:24,image_path:null,status:'approved',active:true},
 {id:'sh2',type:'shop',name:'ร้านใหญ่',area:'สีลม',lat:13.761,lng:100.511,open_days:[0,1,2,3,4,5,6],open_time:'10:00:00',close_time:'21:00:00',fixed_date:null,advance_days:14,cancel_hours:24,image_path:null,status:'approved',active:true},
 {id:'og1',type:'org',name:'สำนักงานพัฒนาสังคม',area:'พญาไท',lat:13.758,lng:100.509,open_days:[0,1,2,3,4,5,6],open_time:'09:00:00',close_time:'17:00:00',fixed_date:bkk(3),advance_days:14,cancel_hours:24,image_path:null,status:'approved',active:true},
 {id:'cp1',type:'company',name:'บริษัท ไทยออฟฟิศ',area:'ปทุมวัน',lat:13.7635,lng:100.5018,open_days:[1,2,3,4,5],open_time:'09:00:00',close_time:'18:00:00',fixed_date:null,advance_days:14,cancel_hours:24,image_path:null,status:'approved',active:true}];
const services=[
 {id:'ga',place_id:null,name:'นวดไทยแผนโบราณ',minutes:60,price:400,applies_all:true,active:true},
 {id:'sa',place_id:'sh1',name:'นวดไทย',minutes:60,price:400,applies_all:false,active:true},
 {id:'sb',place_id:'sh1',name:'นวดเท้า',minutes:60,price:350,applies_all:false,active:true},
 {id:'sc',place_id:'sh2',name:'นวดคอบ่าไหล่',minutes:30,price:250,applies_all:false,active:true},{id:'sd',place_id:'sh2',name:'นวดไทย 2 ชม.',minutes:120,price:600,applies_all:false,active:true}];
const staff=[{id:'st1',name:'คุณวิภา',place_id:'sh1',photo_path:null},{id:'st2',name:'คุณสมศรี',place_id:'sh1',photo_path:null},{id:'st3',name:'คุณนุ่น',place_id:null,photo_path:null},{id:'st4',name:'คุณมะลิ',place_id:null,photo_path:null}].concat([1,2,3,4,5,6].map(i=>({id:'bg'+i,name:'หมอ'+i,place_id:'sh2',photo_path:null})));
const ss=[['st1','sa'],['st1','sb'],['st2','sa'],['st3','ga'],['st4','ga']].concat([1,2,3,4,5,6].flatMap(i=>[['bg'+i,'sc'],['bg'+i,'sd']])).map(x=>({staff_id:x[0],service_id:x[1]}));
const ps=[{place_id:'og1',staff_id:'st3',weekdays:[]},{place_id:'cp1',staff_id:'st4',weekdays:[1,2,3,4,5]}];
const promos=[{id:'pm1',place_id:'sh1',title:'ลดราคานวดเท้า',description:'',type:'percent',value:10,applies_all:false,start_date:bkk(-1),end_date:bkk(30),image_path:null,active:true}];
const pms=[{promotion_id:'pm1',service_id:'sb'}];
const nm=id=>(staff.find(s=>s.id===id)||{}).name;
const busyItems=()=>BKS.filter(x=>x.status==='confirmed').flatMap(x=>x.items.filter(i=>i.active));
const fmt=b=>({ref:b.ref,place_id:b.place_id,place_name:b.place_name,place_type:b.place_type,cancel_hours:24,phone:b.phone,customer_name:'สมชาย ใจดี',starts_at:new Date(b.s).toISOString(),ends_at:new Date(b.e).toISOString(),total:b.total,discount:b.discount,promo:b.promo,status:b.status,moved_from:b.moved_from,moved_to:b.moved_to,created_at:new Date().toISOString(),items:b.items.map(i=>({id:i.id,service_id:i.service_id,service_name:i.service_name,staff_id:i.staff_id,staff_name:nm(i.staff_id),minutes:i.minutes,price:i.price,starts_at:new Date(i.s).toISOString(),ends_at:new Date(i.e).toISOString(),active:i.active,job:i.job||'pending'}))});
await ctx.route('**/*supabase.co/**',async r=>{const q=r.request(),u=new URL(q.url()),m=q.method(),path=u.pathname,body=(()=>{try{return JSON.parse(q.postData()||'null')}catch(e){return null}})();
 calls.push({m,path,body,auth:q.headers()['authorization']||''});
 const J=(s,o)=>r.fulfill({status:s,contentType:'application/json',body:JSON.stringify(o)});
 const sess=()=>({access_token:'at',refresh_token:'rt',expires_in:3600,user:{id:UID,user_metadata:{first_name:'สมชาย',last_name:'ใจดี',phone:'0811111111'}}});
 if(path==='/auth/v1/signup'||(path==='/auth/v1/token'&&u.search.includes('password')))return J(200,sess());
 if(path==='/auth/v1/token')return J(200,sess());
  if(path==='/rest/v1/favorite_places'||path==='/rest/v1/favorite_staff'){const isP=path.endsWith('places'),col=isP?'place_id':'staff_id',L=isP?FP:FS;
   if(m==='GET')return J(200,L.map(x=>({[col]:x})));
   if(m==='POST'){L.push(body[col]);return J(201,null)}
   if(m==='DELETE'){const id=u.searchParams.get(col).replace('eq.','');const i=L.indexOf(id);if(i>=0)L.splice(i,1);return J(204,null)}}
 if(path==='/rest/v1/profiles')return J(200,[{first_name:'สมชาย',last_name:'ใจดี',phone:'0811111111',avatar_path:null}]);
 if(!mode.cat&&path.startsWith('/rest/v1/places'))return r.abort();
 const T={places:places,services:services,service_places:[],staff_public:staff,staff_services:ss,place_staff:ps,staff_days_off:[],promotions:promos,promotion_services:pms,place_day_overrides:[],app_settings:[process.env.EMPTY?{shop_radius_km:10,org_radius_km:10,notify_user:true,notify_staff:true}:{shop_radius_km:10,org_radius_km:10,notify_user:true,notify_staff:true,association_name:'สมาคมทดสอบ',address:'เลขที่ 1 ถนนทดสอบ',phone:'02-123 4567',line_url:'https://line.me/R/ti/p/@test',hours_text:'จันทร์ – ศุกร์ 08:30 – 16:30 น.\nเสาร์ – อาทิตย์ ปิด',register_url:'https://shop.example.com/'}],announcements:[{title:'ประกาศทดสอบ',body:'สวัสดี',audiences:['ผู้ใช้งาน'],active:true}],notifications:NOTES};
 const t=path.replace('/rest/v1/','');
 if(m==='GET'&&T[t]!==undefined)return J(200,T[t]);
 if(mode.rpcMissing&&path.startsWith('/rest/v1/rpc/'))return J(404,{code:'PGRST202',message:'Could not find the function public.'+path.split('/').pop()+' in the schema cache'});
 if(path==='/rest/v1/rpc/busy_slots'){BUSYQ.push(body);if(mode.busyErr)return J(500,{message:'boom'});const f=Date.parse(body.p_from),to=Date.parse(body.p_to);return J(200,busyItems().filter(i=>body.p_staff.includes(i.staff_id)&&i.s<to&&i.e>f).map(i=>({staff_id:i.staff_id,starts_at:new Date(i.s).toISOString(),ends_at:new Date(i.e).toISOString()})))}
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
   return J(200,ref)}
 return J(404,{message:'nf '+path})});
const p=await ctx.newPage();await ctx.route('**/rest/v1/rpc/public_catalog',async r=>{try{const o=new URL(r.request().url()).origin;const g=t=>p.evaluate(async u=>{try{const x=await fetch(u);return x.ok?await x.json():null}catch(e){return null}},o+'/rest/v1/'+t+'?select=*');const R={};for(const [k,t] of [['places','places'],['services','services'],['service_places','service_places'],['staff','staff_public'],['staff_services','staff_services'],['place_staff','place_staff'],['days_off','staff_days_off'],['promos','promotions'],['promo_services','promotion_services'],['overrides','place_day_overrides'],['settings','app_settings'],['ann','announcements']])R[k]=await g(t);if(R.places===null)return r.fulfill({status:500,contentType:'application/json',body:'{"message":"fail"}'});for(const k in R)if(R[k]===null)R[k]=[];R.settings=R.settings&&R.settings[0];r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(R)})}catch(e){}});{const _w=p.waitForSelector.bind(p);p.waitForSelector=async(s,o)=>{if(s==='#lph'){await _w('#lph,[data-gb=login]',o);if(!(await p.$('#lph')))await p.click('[data-gb=login]')}return _w(s,o)}}{const _f=p.fill.bind(p);p.fill=async(s,v,o)=>{if(s==='#lph'){await p.waitForSelector('#lph,[data-gb=login]',{timeout:8000});if(!(await p.$('#lph')))await p.click('[data-gb=login]')}return _f(s,v,o)}};p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>{errs.push('DIALOG '+d.message());d.dismiss()});
const store=[];await ctx.route('**/storage/v1/object/avatars/**',r=>{store.push({m:r.request().method(),u:new URL(r.request().url()).pathname,auth:r.request().headers()['authorization']||''});r.fulfill({status:200,contentType:'application/json',body:'{}'})});
const patches=[];await ctx.route('**/rest/v1/profiles?id=eq.*',async r=>{if(r.request().method()==='PATCH'){patches.push(JSON.parse(r.request().postData()||'{}'));return r.fulfill({status:204,body:''})}return r.fallback()});
await p.goto(require('./config').page('customer-booking.html'));
const A=async()=>await p.textContent('#app');const home=async()=>{if(await p.$('#home'))await p.click('#home');if(await p.$('#again'))await p.click('#again')};const ok=(n,c)=>console.log((c?'PASS ':'FAIL ')+n);
const H=3600000,mk=(ref,off,st,job)=>({ref,place_id:'sh1',place_name:'ร้านสบายดี สปา',place_type:'shop',phone:'0811111111',s:Date.now()+off*H,e:Date.now()+off*H+H,total:400,discount:0,promo:null,status:st,moved_from:null,moved_to:null,items:[{id:'it'+ref,service_id:'v1',service_name:'นวดไทย',staff_id:'st1',minutes:60,price:400,s:Date.now()+off*H,e:Date.now()+off*H+H,active:st==='confirmed',job:job||'pending'}]});


await p.fill('#lph','0811111111');await p.fill('#lpw','abc123');await p.click('button[type=submit]');await p.waitForSelector('[data-pl]',{timeout:4000});

const D0=bkk(0),D1=bkk(1);const T=(d,hm)=>Date.parse(d+'T'+hm+':00+07:00');
const busy=(staff,d,from,to)=>{BKS.push({ref:'X'+(seq++),place_id:'sh1',status:'confirmed',items:[{staff_id:staff,s:T(d,from),e:T(d,to),active:true}],s:T(d,from),e:T(d,to)})};
const app=async()=>(await p.textContent('#app')).replace(/\s+/g,' ');
await p.clock.setFixedTime(new Date(D0+'T10:12:00+07:00'));
// ไม่มีรายการโปรด
await p.click('#tabs [data-tab="fv"]');await p.waitForTimeout(500);
ok('menu named รายการโปรด, heading too',(await p.textContent('#tabs [data-tab="fv"]')).includes('รายการโปรด')&&(await p.textContent('#fvt'))==='รายการโปรด');
ok('two tabs, staff first and selected, counts shown',(await p.$$eval('[data-fvk]',e=>e.map(x=>x.dataset.fvk+':'+x.textContent))).join('|')==='s:หมอโปรด (0)|p:ร้านโปรด (0)'&&(await p.getAttribute('[data-fvk=s]','aria-pressed'))==='true');
ok('no favourite staff: explains how to add',(await app()).includes('ยังไม่มีหมอโปรด')&&(await app()).includes('กดรูปหัวใจที่ชื่อหมอนวด'));
// มีแต่ร้านโปรด -> เปิดแถบร้านโปรด
FP.push('sh1');await p.evaluate(()=>loadFavs().then(()=>{}));await p.click('#tabs [data-tab=""]');await p.waitForTimeout(300);await p.click('#tabs [data-tab="fv"]');await p.waitForTimeout(500);
ok('only favourite shops: opens on the shop tab',(await p.getAttribute('[data-fvk=p]','aria-pressed'))==='true'&&!!(await p.$('[data-pl="sh1"]')));
// หมอโปรด 3 คน: st2 ว่างวันนี้ 11:00, st1 วันนี้เต็ม -> พรุ่งนี้, bg1 ร้านใหญ่
FS.push('st1','st2','bg1');busy('st1',D0,'10:00','21:00');
await p.evaluate(()=>loadFavs().then(()=>{CQ={}}));await p.click('#tabs [data-tab=""]');await p.waitForTimeout(300);await p.click('#tabs [data-tab="fv"]');await p.waitForTimeout(900);
ok('opening the menu again goes back to the staff tab',(await p.getAttribute('[data-fvk=s]','aria-pressed'))==='true'&&(await p.textContent('[data-fvk=s]'))==='หมอโปรด (3)');
let t=await app();
ok('staff cards show shop and next free time',t.includes('คุณสมศรี')&&t.includes('ร้านสบายดี สปา')&&t.includes('ว่างวันนี้ 11:00 น.')&&t.includes('คุณวิภา')&&t.includes('ว่างพรุ่งนี้ 10:00 น.')&&t.includes('หมอ1')&&t.includes('ร้านใหญ่'));
const ord=await p.$$eval('[data-fvb]',e=>e.map(x=>x.dataset.fvb));ok('sorted by soonest free: tomorrow one last',ord[ord.length-1]==='st1'&&ord.length===3);
ok('each card: book button named with the staff, labelled remove button',(await p.textContent('[data-fvb="st2"]'))==='จองกับคุณสมศรี'&&(await p.getAttribute('[data-fv="s:st2"]','aria-label'))==='เอาคุณสมศรีออกจากหมอโปรด');
// หมอที่ปิดรับงาน
await p.evaluate(()=>{var pl=PLACES.filter(x=>x.id==='sh2')[0];pl.staff.forEach(c=>{if(c.id==='bg1')c.on=0});CQC={};render(true)});await p.waitForTimeout(300);
ok('staff not taking bookings: says so, no book button, can remove',(await app()).includes('ไม่รับจองในขณะนี้')&&!(await p.$('[data-fvb="bg1"]'))&&!!(await p.$('[data-fv="s:bg1"]')));
await p.click('[data-fv="s:bg1"]');await p.waitForTimeout(400);ok('remove staff: gone from the list',!FS.includes('bg1')&&!(await p.$('[data-fv="s:bg1"]')));
// จองกับคุณวิภา
await p.click('[data-fvb="st1"]');await p.waitForSelector('[data-qty]');await p.waitForTimeout(300);
t=await app();ok('book: goes to the service step of her shop with a "booking with" bar',t.includes('เลือกบริการ')&&t.includes('จองกับ คุณวิภา')&&!!(await p.$('[data-want=clear]')));
ok('book: only services she does are listed',(await p.$$eval('[data-qty][data-dir="1"]',e=>e.map(x=>x.dataset.qty))).sort().join(',')==='sa,sb');
await p.click('[data-qty="sa"][data-dir="1"]');await p.click('#next');await p.waitForSelector('#selT');await p.waitForTimeout(900);
let nf=await p.$$eval('[data-nf]',e=>e.map(x=>x.dataset.nf));ok('earliest free: only her times (today full -> tomorrow 10:00)',nf[0]===D1+'|600');
await p.evaluate(d=>{S.date=d;S.time=null;render(true)},D0);await p.waitForTimeout(800);
const opt=await p.$eval('#selT option[value="660"]',e=>e.textContent);ok('time select: her busy times say she is not free',opt.includes('(คุณวิภาไม่ว่าง)'));
await p.click('[data-nf="'+D1+'|600"]');await p.waitForTimeout(900);await p.click('#go3');await p.waitForTimeout(400);
ok('staff step: she is already selected',(await p.getAttribute('[data-st="st1"]','aria-pressed'))==='true'&&!(await p.$eval('#next',e=>e.disabled)));
// ไม่ระบุหมอ
await p.click('#back');await p.waitForSelector('#selT');await p.click('[data-want=clear]');await p.waitForTimeout(900);
nf=await p.$$eval('[data-nf]',e=>e.map(x=>x.dataset.nf));ok('no preference: bar gone, times from all staff (today 11:00)',!(await p.$('[data-want]'))&&nf[0]===D0+'|660');
// จองหลายคนพร้อมกันกับหมอโปรด: คุณวิภารับคนแรก
await p.click('#tabs [data-tab="fv"]');await p.waitForTimeout(600);await p.click('[data-fvb="st1"]');await p.waitForSelector('[data-qty]');
await p.click('[data-qty="sa"][data-dir="1"]');await p.click('[data-qty="sa"][data-dir="1"]');await p.click('#next');await p.waitForSelector('#selT');await p.waitForTimeout(900);
nf=await p.$$eval('[data-nf]',e=>e.map(x=>x.dataset.nf));ok('two people together: needs her plus one more (tomorrow 10:00)',nf[0]===D1+'|600');
await p.click('[data-nf="'+D1+'|600"]');await p.waitForTimeout(900);await p.click('#go3');await p.waitForTimeout(400);
const pressed=await p.$$eval('[data-st][aria-pressed="true"]',e=>e.map(x=>x.dataset.st+'@'+x.dataset.sv));
ok('two people: she is preselected for the first person only',pressed.length===1&&pressed[0].startsWith('st1@'));
if(process.env.SHOT){await p.click('#tabs [data-tab="fv"]');await p.waitForTimeout(500);await p.setViewportSize({width:390,height:844});await p.screenshot({path:process.env.SHOT+'/fv_staff.png'});await p.setViewportSize({width:1280,height:720})}
console.log('errors:',errs.join('|')||'none');ok('no page errors',errs.length===0);await b.close();process.exit(0)})();
