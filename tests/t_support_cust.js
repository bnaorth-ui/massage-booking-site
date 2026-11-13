// แชตกับเจ้าหน้าที่ในแอปผู้ใช้งาน (13 พ.ย. 2569): ปุ่มในติดต่อเรา ห้องแชต ตอบรับอัตโนมัติ ข้อความใหม่ แจ้งเตือน และไม่มีปุ่ม LINE แล้ว
const {chromium}=require('playwright');
const bkk=(n=0)=>{const d=new Date(Date.now()+7*3600000+n*86400000);return d.toISOString().slice(0,10)};
(async()=>{const b=await chromium.launch(require('./config').launch);
const ctx=await b.newContext({timezoneId:'Asia/Bangkok',locale:'th-TH'});const errs=[],calls=[];
let mode={cat:true,rpcMissing:false,busyErr:false};let SUP=[],SUPREAD=0,SUPERR=null,SUPQ=[];const FP=[],FS=[];const BUSYQ=[];let seq=100000;const BKS=[];const NOTES=[];
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
 if(path==='/rest/v1/rpc/support_unread'){SUPQ.push(['unread',body]);return J(200,SUP.filter(x=>x.sender_role!=='user'&&Date.parse(x.created_at)>SUPREAD).length)}
 if(path==='/rest/v1/rpc/support_mark_read'){SUPQ.push(['read',body]);SUPREAD=Date.now();return J(204,null)}
 if(path==='/rest/v1/rpc/support_room'){SUPQ.push(['room',body]);const a=body.p_after?SUP.filter(x=>x.created_at>body.p_after):SUP;return J(200,{messages:a,hours:'จันทร์ – ศุกร์'})}
 if(path==='/rest/v1/rpc/support_send'){SUPQ.push(['send',body]);if(SUPERR)return J(400,{code:'P0001',message:SUPERR});const t=new Date().toISOString();SUP.push({id:'s'+SUP.length,sender_id:UID,sender_role:'user',sender_name:'สมชาย ใจดี',body:body.p_body.trim(),created_at:t});if(SUP.length===1)SUP.push({id:'s1',sender_id:null,sender_role:'auto',sender_name:'ระบบ',body:'ได้รับข้อความแล้ว เจ้าหน้าที่จะตอบกลับโดยเร็วที่สุด',created_at:new Date(Date.parse(t)+1).toISOString()});return J(200,'mid')}
 if(path==='/rest/v1/rpc/my_notifications'||path==='/rest/v1/notifications')return J(200,NOTES);
 return J(404,{message:'nf '+path})});
const p=await ctx.newPage();await ctx.route('**/rest/v1/rpc/public_catalog',async r=>{try{const o=new URL(r.request().url()).origin;const g=t=>p.evaluate(async u=>{try{const x=await fetch(u);return x.ok?await x.json():null}catch(e){return null}},o+'/rest/v1/'+t+'?select=*');const R={};for(const [k,t] of [['places','places'],['services','services'],['service_places','service_places'],['staff','staff_public'],['staff_services','staff_services'],['place_staff','place_staff'],['days_off','staff_days_off'],['promos','promotions'],['promo_services','promotion_services'],['overrides','place_day_overrides'],['settings','app_settings'],['ann','announcements']])R[k]=await g(t);if(R.places===null)return r.fulfill({status:500,contentType:'application/json',body:'{"message":"fail"}'});for(const k in R)if(R[k]===null)R[k]=[];R.settings=R.settings&&R.settings[0];r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(R)})}catch(e){}});{const _w=p.waitForSelector.bind(p);p.waitForSelector=async(s,o)=>{if(s==='#lph'){await _w('#lph,[data-gb=login]',o);if(!(await p.$('#lph')))await p.click('[data-gb=login]')}return _w(s,o)}}{const _f=p.fill.bind(p);p.fill=async(s,v,o)=>{if(s==='#lph'){await p.waitForSelector('#lph,[data-gb=login]',{timeout:8000});if(!(await p.$('#lph')))await p.click('[data-gb=login]')}return _f(s,v,o)}};p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>{errs.push('DIALOG '+d.message());d.dismiss()});
const store=[];await ctx.route('**/storage/v1/object/avatars/**',r=>{store.push({m:r.request().method(),u:new URL(r.request().url()).pathname,auth:r.request().headers()['authorization']||''});r.fulfill({status:200,contentType:'application/json',body:'{}'})});
const patches=[];await ctx.route('**/rest/v1/profiles?id=eq.*',async r=>{if(r.request().method()==='PATCH'){patches.push(JSON.parse(r.request().postData()||'{}'));return r.fulfill({status:204,body:''})}return r.fallback()});
await p.goto(require('./config').page('customer-booking.html'));
const A=async()=>await p.textContent('#app');const home=async()=>{if(await p.$('#home'))await p.click('#home');if(await p.$('#again'))await p.click('#again')};const ok=(n,c)=>console.log((c?'PASS ':'FAIL ')+n);
const H=3600000,mk=(ref,off,st,job)=>({ref,place_id:'sh1',place_name:'ร้านสบายดี สปา',place_type:'shop',phone:'0811111111',s:Date.now()+off*H,e:Date.now()+off*H+H,total:400,discount:0,promo:null,status:st,moved_from:null,moved_to:null,items:[{id:'it'+ref,service_id:'v1',service_name:'นวดไทย',staff_id:'st1',minutes:60,price:400,s:Date.now()+off*H,e:Date.now()+off*H+H,active:st==='confirmed',job:job||'pending'}]});


await p.fill('#lph','0811111111');await p.fill('#lpw','abc123');await p.click('button[type=submit]');await p.waitForSelector('[data-pl]',{timeout:4000});
const W=async(f,t=4000)=>{const e=Date.now()+t;while(Date.now()<e){try{if(await f())return true}catch(x){}await new Promise(r=>setTimeout(r,100))}return false};
await p.click('#tabs [data-tab=ac]');await p.waitForTimeout(500);
let t=await A();
ok('contact: chat-with-staff button shown first',!!(await p.$('[data-supgo]'))&&t.indexOf('แชตกับเจ้าหน้าที่')<t.indexOf('โทรหาเจ้าหน้าที่'));
ok('contact: no LINE button any more',!t.includes('LINE')&&!(await p.$('a[href*="line.me"]')));
ok('contact: phone and hours still shown',!!(await p.$('a[href^="tel:"]'))&&t.includes('เวลาทำการ'));
await p.click('[data-supgo]');
ok('opens chat room with heading focused',await W(async()=>(await p.evaluate(()=>document.activeElement&&document.activeElement.id))==='chtitle'));
t=await A();
ok('room explains who sees it and 6-month retention',t.includes('แชตกับเจ้าหน้าที่')&&t.includes('เจ้าหน้าที่ของสมาคม')&&t.includes('6 เดือน'));
ok('empty hint and 1000-char limit',t.includes('พิมพ์คำถาม')&&(await p.getAttribute('#chi','maxlength'))==='1000');
ok('no report/block buttons in staff chat',!(await p.$('#chsx button')));
ok('loaded via support_room for the customer app',SUPQ.some(x=>x[0]==='room'&&x[1].p_app==='user'));
await p.fill('#chi','  สอบถามการจอง MS1  ');await p.click('#chsend');
ok('message sent (trimmed) via support_send',await W(()=>SUPQ.some(x=>x[0]==='send'&&x[1].p_app==='user'&&x[1].p_body.trim()==='สอบถามการจอง MS1')));
ok('own message and auto reply shown in the log',await W(async()=>{const l=await p.textContent('#chl');return l.includes('สอบถามการจอง MS1')&&l.includes('ได้รับข้อความแล้ว')}));
ok('log is a polite live region for screen readers',(await p.getAttribute('#chl','role'))==='log'&&(await p.getAttribute('#chl','aria-live'))==='polite');
SUP.push({id:'a1',sender_id:'adm',sender_role:'admin',sender_name:'เจ้าหน้าที่ สมหญิง',body:'ตรวจสอบให้แล้วค่ะ',created_at:new Date(Date.now()+5).toISOString()});
ok('staff reply appears by polling and is marked read',await W(async()=>(await p.textContent('#chl')).includes('ตรวจสอบให้แล้วค่ะ'),8000)&&await W(()=>SUPQ.some(x=>x[0]==='read')));
SUPERR='ส่งข้อความถี่เกินไป กรุณารอสักครู่แล้วลองใหม่';await p.fill('#chi','อีกข้อความ');await p.click('#chsend');
ok('server error shown to the user',await W(async()=>(await p.textContent('#che')).includes('ส่งข้อความถี่เกินไป')));SUPERR=null;
await p.click('#chback');await p.waitForTimeout(400);
SUP.push({id:'a2',sender_id:'adm',sender_role:'admin',sender_name:'เจ้าหน้าที่ สมหญิง',body:'ใหม่',created_at:new Date(Date.now()+60000).toISOString()});
await p.evaluate(()=>loadSupUnread());
ok('unread count badge on the contact button',await W(async()=>{const e=await p.$('[data-supgo]');return e&&(await e.getAttribute('aria-label')||'').includes('ข้อความใหม่ 1 ข้อความ')}));
NOTES.unshift({id:'nsup',kind:'support',title:'ข้อความใหม่จากเจ้าหน้าที่',body:'ใหม่',created_at:new Date().toISOString(),booking_id:null});
await p.click('#tabs [data-tab=nt]');
ok('support notification has an open-chat button',await W(async()=>!!(await p.$('[data-supgo]'))));
await p.click('[data-supgo]');ok('notification button opens the staff chat',await W(async()=>(await p.textContent('#app')).includes('ข้อความนี้เห็นเฉพาะคุณกับเจ้าหน้าที่')));
await p.click('#chback');
const pv=await p.evaluate(()=>pvHtml());ok('privacy policy mentions staff chat and 6 months, no LINE',pv.includes('แชตกับเจ้าหน้าที่')&&pv.includes('6 เดือน')&&!pv.includes('LINE'));
await p.evaluate(()=>{AU.ct={name:'ส',phone:'021234567',line:'https://line.me/x',hours:'9-17'}});
const fp=await p.evaluate(()=>{AU.step='fp';var s=SBS;SBS=null;authRender();var h=document.getElementById('app').innerHTML;SBS=s;return h});
ok('forgot-password help: phone only, no LINE',fp.includes('tel:021234567')&&!fp.includes('line.me')&&!fp.includes('LINE'));
console.log('errors:',errs.join('|')||'none');ok('no page errors',errs.length===0);await b.close();process.exit(0)})();
