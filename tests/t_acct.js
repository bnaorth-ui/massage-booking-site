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
const p=await ctx.newPage();await ctx.route('**/rest/v1/rpc/public_catalog',async r=>{try{const o=new URL(r.request().url()).origin;const g=t=>p.evaluate(async u=>{try{const x=await fetch(u);return x.ok?await x.json():null}catch(e){return null}},o+'/rest/v1/'+t+'?select=*');const R={};for(const [k,t] of [['places','places'],['services','services'],['service_places','service_places'],['staff','staff_public'],['staff_services','staff_services'],['place_staff','place_staff'],['days_off','staff_days_off'],['promos','promotions'],['promo_services','promotion_services'],['overrides','place_day_overrides'],['settings','app_settings'],['ann','announcements']])R[k]=await g(t);if(R.places===null)return r.fulfill({status:500,contentType:'application/json',body:'{"message":"fail"}'});for(const k in R)if(R[k]===null)R[k]=[];R.settings=R.settings&&R.settings[0];r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(R)})}catch(e){}});{const _w=p.waitForSelector.bind(p);p.waitForSelector=async(s,o)=>{if(s==='#lph'){await _w('#lph,[data-gb=login]',o);if(!(await p.$('#lph')))await p.click('[data-gb=login]')}return _w(s,o)}}{const _f=p.fill.bind(p);p.fill=async(s,v,o)=>{if(s==='#lph'){await p.waitForSelector('#lph,[data-gb=login]',{timeout:8000});if(!(await p.$('#lph')))await p.click('[data-gb=login]')}return _f(s,v,o)}};p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>{errs.push('DIALOG '+d.message());d.dismiss()});
const store=[];await ctx.route('**/storage/v1/object/avatars/**',r=>{store.push({m:r.request().method(),u:new URL(r.request().url()).pathname,auth:r.request().headers()['authorization']||''});r.fulfill({status:200,contentType:'application/json',body:'{}'})});
const patches=[];await ctx.route('**/rest/v1/profiles?id=eq.*',async r=>{if(r.request().method()==='PATCH'){patches.push(JSON.parse(r.request().postData()||'{}'));return r.fulfill({status:204,body:''})}return r.fallback()});
await p.goto(require('./config').page('customer-booking.html'));
const A=async()=>await p.textContent('#app');const home=async()=>{if(await p.$('#home'))await p.click('#home');if(await p.$('#again'))await p.click('#again')};const ok=(n,c)=>console.log((c?'PASS ':'FAIL ')+n);
const H=3600000,mk=(ref,off,st,job)=>({ref,place_id:'sh1',place_name:'ร้านสบายดี สปา',place_type:'shop',phone:'0811111111',s:Date.now()+off*H,e:Date.now()+off*H+H,total:400,discount:0,promo:null,status:st,moved_from:null,moved_to:null,items:[{id:'it'+ref,service_id:'v1',service_name:'นวดไทย',staff_id:'st1',minutes:60,price:400,s:Date.now()+off*H,e:Date.now()+off*H+H,active:st==='confirmed',job:job||'pending'}]});
BKS.push(mk('MS1',72,'confirmed'),mk('MS2',-48,'confirmed','done'),mk('MS3',96,'cancelled'),mk('MS4',120,'rescheduled'),mk('MS5',-72,'completed','done'));

await p.fill('#lph','0811111111');await p.fill('#lpw','abc123');await p.click('button[type=submit]');await p.waitForSelector('[data-pl]',{timeout:4000});

const vis=async()=>await p.$eval('#tabs',e=>getComputedStyle(e).display!=='none'&&e.getBoundingClientRect().bottom>=innerHeight-1);
const lab=async()=>await p.$$eval('#tabs button b',b=>b.map(x=>x.textContent));
ok('tabs visible on home at bottom',await vis());ok('5 tabs '+(await lab()).join('|'),(await lab()).join('|')==='หน้าหลัก|รายการ|รายการโปรด|แจ้งเตือน|บัญชี');
ok('old top menu gone',!(await p.$('.mn')));
ok('no aria-current / no nav landmark / no aria-label on tabs',(await p.$$('#tabs [aria-current]')).length===0&&(await p.$$('nav')).length===0&&!(await p.getAttribute('#tabs','aria-label')));
const cur=async()=>await p.$$eval('#tabs button.on b',b=>b.map(x=>x.textContent).join());
ok('home active',(await cur())==='หน้าหลัก');
await p.waitForSelector('#tabs .bdg',{timeout:3000}).catch(()=>{});const badge=await p.$$eval('#tabs .bdg',b=>b.map(x=>x.textContent));ok('upcoming badge 1 ('+badge+')',badge.includes('1'));
ok('home has no profile/logout',!(await p.$('.prof'))&&!(await p.$('[data-auth=out]')));
await p.click('[data-tab=ac]');await p.waitForSelector('h1');{const t=await p.textContent('body');
ok('account view',(await p.textContent('h1'))==='บัญชี'&&(await cur())==='บัญชี'&&await vis());
ok('account: name+phone',t.includes('สมชาย')&&t.includes('0811111111'));
ok('account: change photo input',!!(await p.$('#myimg')));
ok('account: contact section',(await p.textContent('h2')).includes('ติดต่อเรา')&&!!(await p.$('a.cta[href^="tel:"]')));
const ord=await p.evaluate(()=>{const y=e=>document.querySelector(e).getBoundingClientRect().top;return[y('.prof'),y('h2.stl'),y('[data-auth=out]')]});ok('order profile<contact<logout '+ord,ord[0]<ord[1]&&ord[1]<ord[2]);
ok('logout button exists once',(await p.$$('[data-auth=out]')).length===1);}
ok('no old home button in view',!(await p.$('#home')));
await p.click('[data-tab=bk]');await p.waitForSelector('[data-bt]');ok('bk view',(await p.textContent('h1'))==='รายการ'&&(await cur())==='รายการ');
await p.click('[data-tab=nt]');ok('nt view',(await p.textContent('h1'))==='แจ้งเตือน'&&(await cur())==='แจ้งเตือน');
{const sb=await p.$$eval('[data-nt]',b=>b.map(x=>x.textContent.trim()));console.log(sb.join('|'));ok('nt has 2 sub-tabs',sb.length===2&&/^แจ้งเตือน \(\d+\)$/.test(sb[0])&&/^จากระบบ \(\d+\)$/.test(sb[1]));
ok('default: notifications, no announcements',(await p.$$('.ann')).length===0&&(await p.$eval('[data-nt].on',e=>e.dataset.nt))==='n');
await p.click('[data-nt=a]');const t2=await p.textContent('#app,main,body');ok('จากระบบ shows announcements only',(await p.$$('.ann')).length>0&&(await p.$$('.msg')).length===0);
await p.click('[data-nt=n]');ok('back to notifications (empty state)',(await p.$$('.ann')).length===0&&(await p.textContent('body')).includes('ยังไม่มีการแจ้งเตือน'));}
await p.click('[data-tab=""]');await p.waitForSelector('[data-pl]');ok('home tab returns',(await p.textContent('h1'))==='เลือกสถานที่'&&(await cur())==='หน้าหลัก');
// booking flow: action bar must sit above tabs, both visible
await p.click('[data-pl]');await p.waitForSelector('#next,.opt');
const r=await p.evaluate(()=>{const b=document.getElementById('bar').getBoundingClientRect(),t=document.getElementById('tabs').getBoundingClientRect();return{barBottom:b.bottom,tabTop:t.top,barShown:getComputedStyle(document.getElementById('bar')).display!=='none'}});
ok('flow: action bar above tabs ('+JSON.stringify(r)+')',r.barShown&&r.barBottom<=r.tabTop+1);
await p.setViewportSize({width:390,height:844});await p.screenshot({path:'tabs_flow.png'});
await p.click('#back');await p.waitForSelector('[data-pl]');await p.screenshot({path:'tabs_home.png'});
await p.click('[data-tab=ac]');await p.waitForSelector('h1');await p.screenshot({path:'tabs_ac.png'});
await p.click('[data-tab=ac]');await p.click('[data-auth=out]');ok('logout works -> login form',await p.waitForSelector('#lph',{timeout:4000}).then(()=>true,()=>false));
const lg=await p.$('#lph');ok('login form shown',!!lg);ok('tabs hidden after logout',await p.$eval('#tabs',e=>getComputedStyle(e).display==='none'));
console.log('errors:',errs.join('|')||'none');await b.close();process.exit(0)
})()
