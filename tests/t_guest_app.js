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
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'standalone',{value:true,configurable:true})});
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>{errs.push('DIALOG '+d.message());d.dismiss()});
const store=[];await ctx.route('**/storage/v1/object/avatars/**',r=>{store.push({m:r.request().method(),u:new URL(r.request().url()).pathname,auth:r.request().headers()['authorization']||''});r.fulfill({status:200,contentType:'application/json',body:'{}'})});
const patches=[];await ctx.route('**/rest/v1/profiles?id=eq.*',async r=>{if(r.request().method()==='PATCH'){patches.push(JSON.parse(r.request().postData()||'{}'));return r.fulfill({status:204,body:''})}return r.fallback()});

const ok=(n,c)=>console.log((c?'PASS ':'FAIL ')+n);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
// ===== 1) เปิดจากหน้าจอโฮม (ติดตั้งแล้ว) ยังไม่เข้าสู่ระบบ =====
await p.goto(require('./config').page('customer-booking.html'));
await p.waitForSelector('[data-pl]',{timeout:5000});
ok('installed guest: shop list shown',true);
ok('installed guest: no top login bar',!(await p.$('.gbar'))&&!(await p.$('[data-gb=login]')));
ok('installed guest: no bottom promo bars',(await p.$$('.regbar')).length===0&&!(await p.textContent('#app')).includes('เป็นเจ้าของร้านนวด')&&!(await p.textContent('#app')).includes('ให้หมอนวดไปดูแลคนในองค์กร')&&!(await p.textContent('#app')).includes('ดูแลพนักงานของคุณ'));
ok('installed guest: no website (SEO) section',await p.$eval('#seo',e=>e.hidden||getComputedStyle(e).display==='none'));
ok('installed guest: bottom tab bar visible with 5 tabs',await p.$eval('#tabs',e=>getComputedStyle(e).display!=='none')&&(await p.$$eval('#tabs [data-tab]',b=>b.map(x=>x.textContent.replace(/\s+/g,''))).then(a=>a.length===5&&a[0].includes('หน้าหลัก')&&a[1].includes('รายการ')&&a[2].includes('ร้านโปรด')&&a[3].includes('แจ้งเตือน')&&a[4].includes('บัญชี'))));
ok('installed guest: tabs have no unread/booking badges',(await p.$$('#tabs .bdg')).length===0);
for(const [t,h] of [['bk','รายการ'],['fv','ร้านโปรด'],['nt','แจ้งเตือน'],['ac','บัญชี']]){
 await p.click('#tabs [data-tab='+t+']');await p.waitForSelector('[data-gb=login]',{timeout:3000});
 const tx=await p.textContent('#app');
 ok('installed guest tab '+h+': heading + login prompt',tx.includes(h)&&tx.includes('เข้าสู่ระบบเพื่อ')&&!!(await p.$('[data-gb=reg]')));
 ok('installed guest tab '+h+': current tab marked',(await p.$eval('#tabs button.on',e=>e.dataset.tab))===t);}
ok('installed guest account tab: shows app version',(await p.textContent('#app')).includes('เวอร์ชันแอป '+(await p.getAttribute('meta[name=app-version]','content'))));
ok('installed guest account tab: contact + privacy',(await p.textContent('#app')).includes('ติดต่อ')&&!!(await p.$('[data-view=pv]')));
ok('no authenticated data calls as guest',!calls.some(c=>/my_bookings|my_points|chat_unread/.test(c.path)));
await p.click('[data-view=pv]');ok('guest privacy page opens',(await p.textContent('#app')).includes('นโยบายความเป็นส่วนตัว'));
await p.click('#tabs [data-tab=ac]');
await p.click('[data-gb=reg]');ok('register button opens sign-up',await p.waitForSelector('#rph',{timeout:3000}).then(()=>true,()=>false));
ok('tab bar hidden on auth screen',await p.$eval('#tabs',e=>getComputedStyle(e).display==='none'));
await p.click('[data-gb=browse]');await p.waitForSelector('[data-pl]');
ok('back to browse shows list + tab bar again',await p.$eval('#tabs',e=>getComputedStyle(e).display!=='none'));
await p.click('#tabs [data-tab=ac]');await p.click('[data-gb=login]');ok('login button opens login form',await p.waitForSelector('#lph',{timeout:3000}).then(()=>true,()=>false));
await p.click('[data-gb=browse]');await p.waitForSelector('[data-pl]');
await p.click('#tabs [data-tab=""]');ok('home tab returns to list',!!(await p.$('[data-pl]')));
// ===== 2) เปิดจากเว็บ (ไม่ใช่แอปที่ติดตั้ง) ต้องเหมือนเดิม =====
await ctx.close();
const ctx2=await b.newContext({timezoneId:'Asia/Bangkok',locale:'th-TH'});
// ใช้การจำลอง API ชุดเดิมกับ context ใหม่ไม่ได้ จึงตรวจแบบเว็บด้วย t_guest.js (ข้อสอบเดิมครอบคลุมแล้ว)
await ctx2.close();
console.log('errors:',errs.join('|')||'none');await b.close();process.exit(0)})();
