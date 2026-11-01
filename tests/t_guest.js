let CATCALLS=0;
const {chromium}=require('playwright');
const bkk=(n=0)=>{const d=new Date(Date.now()+7*3600000+n*86400000);return d.toISOString().slice(0,10)};
(async()=>{const b=await chromium.launch(require('./config').launch);
const ctx=await b.newContext({timezoneId:'Asia/Bangkok',locale:'th-TH'});const errs=[],calls=[];
let mode={cat:true,rpcMissing:false};let seq=100000;const BKS=[];const NOTES=[];
const UID='uuid-1';
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
const fmt=b=>({ref:b.ref,place_id:b.place_id,place_name:b.place_name,place_type:b.place_type,cancel_hours:24,phone:b.phone,customer_name:'สมชาย ใจดี',starts_at:new Date(b.s).toISOString(),ends_at:new Date(b.e).toISOString(),total:b.total,discount:b.discount,promo:b.promo,status:b.status,moved_from:b.moved_from,moved_to:b.moved_to,created_at:new Date().toISOString(),items:b.items.map(i=>({id:i.id,service_id:i.service_id,service_name:i.service_name,staff_id:i.staff_id,staff_name:nm(i.staff_id),minutes:i.minutes,price:i.price,starts_at:new Date(i.s).toISOString(),ends_at:new Date(i.e).toISOString(),active:i.active,job:i.job||'pending'}))});
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
 if(path==='/rest/v1/rpc/public_catalog'){CATCALLS++;return J(200,{places,services,service_places:[],staff:staff,staff_services:ss,place_staff:ps,days_off:[],promos:promos,promo_services:pms,overrides:[],settings:{association_name:'สมาคมทดสอบ',address:'1 ถนนทดสอบ <b>x</b> กรุงเทพ',phone:'02-123-4567',email:'info@example.org',line_url:'https://line.me/R/ti/p/@test',hours_text:'จ-ศ 9:00-17:00',register_url:'https://shop.example.org/',shop_radius_km:10,org_radius_km:1,notify_user:true,notify_staff:true},ann:[]})}
 if(path==='/rest/v1/rpc/place_ratings')return J(200,[]);
 if(path==='/rest/v1/rpc/busy_slots'){const f=Date.parse(body.p_from),to=Date.parse(body.p_to);return J(200,busyItems().filter(i=>body.p_staff.includes(i.staff_id)&&i.s<to&&i.e>f).map(i=>({staff_id:i.staff_id,starts_at:new Date(i.s).toISOString(),ends_at:new Date(i.e).toISOString()})))}
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
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>{errs.push('DIALOG '+d.message());d.dismiss()});
const store=[];await ctx.route('**/storage/v1/object/avatars/**',r=>{store.push({m:r.request().method(),u:new URL(r.request().url()).pathname,auth:r.request().headers()['authorization']||''});r.fulfill({status:200,contentType:'application/json',body:'{}'})});
const patches=[];await ctx.route('**/rest/v1/profiles?id=eq.*',async r=>{if(r.request().method()==='PATCH'){patches.push(JSON.parse(r.request().postData()||'{}'));return r.fulfill({status:204,body:''})}return r.fallback()});

await p.goto(require('./config').page('customer-booking.html'));
const ok=(n,c)=>console.log((c?'PASS ':'FAIL ')+n);
await p.waitForSelector('[data-pl]',{timeout:5000});
ok('guest sees shop list without login',true);
ok('public_catalog called',CATCALLS>0);
ok('no login form on home',!(await p.$('#lph')));
ok('guest bar login btn',!!(await p.$('[data-gb=login]')));
{const ct=await p.$eval('#seoct',e=>({t:e.innerText,tel:(e.querySelector('a[href^="tel:"]')||{}).href,mail:(e.querySelector('a[href^="mailto:"]')||{}).href,line:!!e.querySelector('a[href^="https://line.me"]'),b:e.querySelectorAll('b').length,vis:getComputedStyle(document.getElementById('seo')).display!=='none'&&!document.getElementById('seo').hidden}));
ok('guest sees association contact at bottom',ct.vis&&ct.t.includes('ติดต่อสมาคม')&&ct.t.includes('02-123-4567')&&ct.t.includes('info@example.org')&&ct.t.includes('จ-ศ 9:00-17:00'));
ok('tel/mailto/line links',ct.tel==='tel:021234567'&&ct.mail==='mailto:info@example.org'&&ct.line);
ok('address is escaped text (no injected tag)',ct.b===1&&ct.t.includes('<b>x</b>'));}
{const rb=await p.$eval('.regbar',e=>({t:e.innerText,href:(e.querySelector('a')||{}).href,tgt:(e.querySelector('a')||{}).target,afterList:!!(document.querySelector('.list')&&(document.querySelector('.list').compareDocumentPosition(e)&4))}));
ok('register-shop bar after list',rb.t.includes('ลงทะเบียนร้านนวด')&&rb.href==='https://shop.example.org/'&&rb.tgt==='_blank'&&rb.afterList);
ok('register-shop link in about section',await p.$eval('#seoct',e=>[...e.querySelectorAll('a')].some(a=>a.textContent==='ลงทะเบียนร้านนวด'&&a.href==='https://shop.example.org/')));}
await p.click('[data-pl="sh1"]');await p.waitForSelector('.opt');await p.click('.qb[data-dir="1"] >> nth=0');await p.click('#next');
await p.waitForSelector('#selD');const dates=await p.$$eval('#selD option',o=>o.map(x=>x.value).filter(Boolean));await p.selectOption('#selD',dates[1]||dates[0]);
await p.waitForFunction(()=>{const s=document.getElementById('selT');return s&&!s.disabled},null,{timeout:4000});
const ts=await p.$$eval('#selT option',o=>o.map(x=>x.value).filter(Boolean));await p.selectOption('#selT',ts[0]);
await p.waitForSelector('button.opt[data-st]');await p.click('button.opt[data-st] >> nth=0');
await p.waitForSelector('#next:not([disabled])');await p.click('#next');
await p.waitForSelector('#ok');
ok('reached confirm step as guest',true);
ok('no phone field on summary',!(await p.$('#ph')));await p.click('#ok');await p.waitForSelector('#rph',{timeout:3000});
const t=await p.textContent('#app');
ok('register shown first with flash',t.includes('รายการที่เลือกไว้จะยังอยู่'));
ok('no create_booking before login',!calls.some(c=>c.path.endsWith('create_booking')));
await p.click('[data-ag=login]');await p.waitForSelector('#lph');await p.fill('#lph','0811111111');await p.fill('#lpw','abc123');await p.click('button[type=submit]');
await p.waitForSelector('#ok',{timeout:5000});
const t2=await p.textContent('#app');
ok('restored to confirm step with shop',t2.includes('ร้านสบายดี'));

await p.click('#ok');await p.waitForSelector('.done',{timeout:5000});
ok('booking created after login',calls.some(c=>c.path.endsWith('create_booking'))&&BKS.length===1);
ok('phone sent from account',(calls.find(c=>c.path.endsWith('create_booking')).body||{}).p_phone==='0811111111');

// logout -> guest shop list (no login form)
await p.click('[data-tab=ac]');await p.waitForSelector('[data-auth=out]');await p.click('[data-auth=out]');
await p.waitForSelector('[data-pl]',{timeout:5000});
ok('logout -> guest shop list',!(await p.$('#lph'))&&!!(await p.$('[data-gb=login]')));
ok('guest has no bottom tabs',await p.$eval('#tabs',e=>getComputedStyle(e).display==='none'));
// login screen has back-to-browse link
await p.click('[data-gb=login]');await p.waitForSelector('#lph');
ok('login has back-to-browse',!!(await p.$('[data-gb=browse]')));
await p.click('[data-gb=browse]');await p.waitForSelector('[data-pl]');
ok('back-to-browse shows shops',true);
// no phone/contact leakage in public catalog request body/response is server-side; ensure guest never sends auth header to catalog
ok('catalog fetched without user token',calls.filter(c=>c.path.endsWith('public_catalog')).slice(0,1).every(c=>!/Bearer at$/.test(c.auth)));

// returning device (hadAcct) -> login first; fresh device -> register first, then sign up and restore
await p.evaluate(()=>localStorage.removeItem('hadAcct'));
await p.reload();await p.waitForSelector('[data-pl]');
await p.click('[data-pl="sh1"]');await p.waitForSelector('.opt');await p.click('.qb[data-dir="1"] >> nth=0');await p.click('#next');
await p.waitForSelector('#selD');{const d=await p.$$eval('#selD option',o=>o.map(x=>x.value).filter(Boolean));await p.selectOption('#selD',d[1]||d[0])}
await p.waitForFunction(()=>{const s=document.getElementById('selT');return s&&!s.disabled},null,{timeout:4000});
{const t=await p.$$eval('#selT option',o=>o.map(x=>x.value).filter(Boolean));await p.selectOption('#selT',t[1]||t[0])}
await p.waitForSelector('button.opt[data-st]');await p.click('button.opt[data-st] >> nth=0');await p.waitForSelector('#next:not([disabled])');await p.click('#next');
await p.waitForSelector('#ok');await p.click('#ok');await p.waitForSelector('#rph',{timeout:3000});
ok('fresh device: register first',!(await p.$('#lph')));
await p.fill('#rfn','สมหญิง');await p.fill('#rln','ใจงาม');await p.fill('#rph','0822222222');await p.fill('#rpw','abc12345');await p.fill('#rpw2','abc12345');
await p.check('#rpv').catch(()=>{});await p.click('button[type=submit]');
await p.waitForSelector('#ok',{timeout:6000}).catch(()=>{});
ok('after sign-up back at confirm step',!!(await p.$('#ok'))&&(await p.textContent('#app')).includes('ร้านสบายดี'));
console.log('errors:',errs.join('|')||'none');await b.close();process.exit(0)
})()
