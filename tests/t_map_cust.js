const {chromium}=require('playwright');
const bkk=(n=0)=>{const d=new Date(Date.now()+7*3600000+n*86400000);return d.toISOString().slice(0,10)};
(async()=>{const b=await chromium.launch(require('./config').launch);
const ctx=await b.newContext({timezoneId:'Asia/Bangkok',locale:'th-TH',permissions:['geolocation'],geolocation:{latitude:13.75,longitude:100.5}});const errs=[],calls=[];
let mode={cat:true,rpcMissing:false};let seq=100000;const BKS=[];const NOTES=[];
const UID='uuid-1';
const places=[
 {id:'sh1',type:'shop',name:'ร้านสบายดี สปา',area:'สุขุมวิท',lat:13.76,lng:100.51,open_days:[0,1,2,3,4,5,6],open_time:'10:00:00',close_time:'21:00:00',fixed_date:null,advance_days:14,cancel_hours:24,image_path:null,status:'approved',active:true},
 {id:'sh9',type:'shop',name:'ร้านป่าตอง สปา',area:'ป่าตอง',lat:7.8804,lng:98.2923,open_days:[0,1,2,3,4,5,6],open_time:'10:00:00',close_time:'21:00:00',fixed_date:null,advance_days:14,cancel_hours:24,image_path:null,status:'approved',active:true},
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
 const T={places:places,services:services,service_places:[],staff_public:staff,staff_services:ss,place_staff:ps,staff_days_off:[],promotions:promos,promotion_services:pms,place_day_overrides:[],app_settings:[{shop_radius_km:10,org_radius_km:10,notify_user:true,notify_staff:true}],announcements:[{title:'ประกาศทดสอบ',body:'สวัสดี',audiences:['ผู้ใช้งาน'],active:true}],notifications:NOTES};
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
     if(pool.some(i=>i.staff_id===it.staff_id&&i.s<e&&i.e>s))return J(400,{code:'P0001',message:'คิวนี้เพิ่งเต็ม กรุณาเลือกเวลาหรือหมอนวดใหม่'});
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

const STUB=`(function(){var W=window;function LL(a,b){return{lat:a,lng:b}}
W.__lf={};
W.L={map:function(box,o){var c=LL(0,0),h={},m={};m.setView=function(a,z){c=LL(a[0],a[1]);m.z=z;return m};
 m.latLngToContainerPoint=function(a){a=Array.isArray(a)?LL(a[0],a[1]):a;return{x:(a.lng-c.lng)*1000,y:-(a.lat-c.lat)*1000}};
 m.containerPointToLatLng=function(p){return LL(c.lat-p.y/1000,c.lng+p.x/1000)};
 m.panTo=function(a){c=LL(a[0],a[1])};m.on=function(e,f){h[e]=f;return m};m.remove=function(){W.__lf.removed=true};m.invalidateSize=function(){};
 W.__lf.map=m;W.__lf.fire=function(e,x){h[e]&&h[e](x)};W.__lf.center=function(){return c};box.setAttribute('data-stub','1');return m},
 tileLayer:function(){return{addTo:function(){W.__lf.tiles=true}}},
 divIcon:function(o){return o},
 marker:function(a,o){var p=LL(a[0],a[1]),h={},k={addTo:function(){return k},setLatLng:function(x){p=LL(x[0],x[1])},getLatLng:function(){return p},on:function(e,f){h[e]=f;return k}};W.__lf.mk=k;W.__lf.drag=function(x){p=LL(x.lat,x.lng);h.dragend&&h.dragend()};return k}}})();`;
let stubOn=true;
await ctx.route('**/unpkg.com/**',r=>{const u=r.request().url();if(!stubOn)return r.abort();if(u.endsWith('.css'))return r.fulfill({status:200,contentType:'text/css',body:''});return r.fulfill({status:200,contentType:'application/javascript',body:STUB})});

await ctx.addInitScript(()=>{window.__sri=[];for(const C of [HTMLScriptElement,HTMLLinkElement]){const d=Object.getOwnPropertyDescriptor(C.prototype,'integrity');Object.defineProperty(C.prototype,'integrity',{configurable:true,get(){return this.__i||''},set(v){this.__i=v;window.__sri.push(v)}})}});
await p.goto(require('./config').page('customer-booking.html'));
const A=async()=>await p.textContent('#app');const ok=(n,c)=>console.log((c?'PASS ':'FAIL ')+n);const wait=ms=>p.waitForTimeout(ms);
await p.fill('#lph','0811111111');await p.fill('#lpw','abc123');await p.click('button[type=submit]');await p.waitForSelector('[data-pl]',{timeout:4000});await wait(500);
const names=async()=>await p.$$eval('[data-pl]',e=>e.map(x=>x.textContent));
let L1=(await names()).join('|');
ok('gps (Bangkok): sh1 shown, Phuket hidden',L1.includes('ร้านสบายดี')&&!L1.includes('ป่าตอง'));
ok('search/map button present (merged, 13 Nov)',!!(await p.$('[data-loc=find]'))&&!(await p.$('[data-loc=map]'))&&(await p.evaluate(()=>document.getElementById('locl').textContent+' '+document.querySelector('.loc').textContent)).includes('ค้นหาสถานที่'));
const before=calls.filter(c=>c.path.endsWith('set_my_location')).length;
await p.click('[data-loc=find]');await p.waitForSelector('#mpov');await p.waitForSelector('#mpm[data-stub]');
ok('SRI + crossorigin set on leaflet js/css',await p.evaluate(()=>{const sc=[...document.scripts].find(x=>x.src.includes('unpkg.com/leaflet@1.9.4/dist/leaflet.js')),ln=[...document.querySelectorAll('link')].find(x=>x.href.includes('unpkg.com/leaflet@1.9.4/dist/leaflet.css'));return !!sc&&sc.getAttribute('crossorigin')===''&&!!ln&&ln.getAttribute('crossorigin')===''&&window.__sri.includes('sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=')&&window.__sri.includes('sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=')}));
ok('dialog a11y',await p.$eval('#mpov',e=>e.getAttribute('role')==='dialog'&&e.getAttribute('aria-modal')==='true'));
ok('starts at current location',Math.abs(+(await p.inputValue('#mp_lat'))-13.75)<0.001);
ok('osm tiles requested + not heavy lib on first load (loaded lazily)',await p.evaluate(()=>!!window.__lf.tiles));
await p.evaluate(()=>window.__lf.fire('click',{latlng:{lat:7.8804,lng:98.2923}}));
ok('map click moves pin + inputs',Math.abs(+(await p.inputValue('#mp_lat'))-7.8804)<0.0001&&Math.abs(+(await p.inputValue('#mp_lng'))-98.2923)<0.0001);
const la0=+(await p.inputValue('#mp_lat'));await p.click('[data-mp=u]');const la1=+(await p.inputValue('#mp_lat'));
ok('nudge up raises latitude',la1>la0);await p.click('[data-mp=d]');ok('nudge down back',Math.abs(+(await p.inputValue('#mp_lat'))-la0)<0.0001);
await p.evaluate(()=>window.__lf.drag({lat:7.88,lng:98.29}));ok('drag updates inputs',Math.abs(+(await p.inputValue('#mp_lat'))-7.88)<0.0001);
await p.fill('#mp_lat','abc');await p.click('[data-mp=ok]');ok('invalid coords message',(await p.textContent('#mp_msg')).includes('พิกัดไม่ถูกต้อง')&&!!(await p.$('#mpov')));
await p.fill('#mp_lat','7,88');await p.fill('#mp_lng','98.29');await p.click('[data-mp=ok]');await wait(300);
ok('dialog closed',!(await p.$('#mpov')));
ok('map instance removed',await p.evaluate(()=>!!window.__lf.removed));
const loc=await p.evaluate(()=>document.getElementById('locl').textContent+' '+document.querySelector('.loc').textContent);ok('label: showing shops near the chosen point, buttons say back to my location / change place',loc.includes('แสดงร้านใกล้')&&loc.includes('กลับไปใช้ตำแหน่งของฉัน')&&loc.includes('เปลี่ยนสถานที่'));
let L2=(await names()).join('|');ok('Phuket shop shown, Bangkok hidden',L2.includes('ร้านป่าตอง')&&!L2.includes('ร้านสบายดี'));
ok('sub text uses selected point',(await A()).includes('จากจุดที่คุณเลือก'));
ok('distance from pin shown (≈0 km)',(await A()).includes('ห่าง 0.'));
await ctx.setGeolocation({latitude:13.9,longitude:100.6});await wait(1500);
ok('gps watcher does not overwrite pin',(await names()).join('|').includes('ร้านป่าตอง')&&(await p.evaluate(()=>document.getElementById('locl').textContent+' '+document.querySelector('.loc').textContent)).includes('กลับไปใช้ตำแหน่งของฉัน'));
ok('pin never sent to server',calls.filter(c=>c.path.endsWith('set_my_location')).length===before||!calls.filter(c=>c.path.endsWith('set_my_location')).slice(before).some(c=>c.body&&Math.abs(c.body.p_lat-7.88)<0.01));
await p.click('[data-loc=find]');await p.waitForSelector('#mpov');ok('reopen starts at chosen pin',Math.abs(+(await p.inputValue('#mp_lat'))-7.88)<0.001);await p.keyboard.press('Escape');await wait(200);ok('Escape closes',!(await p.$('#mpov')));
ok('cancel keeps pin',(await p.evaluate(()=>document.getElementById('locl').textContent+' '+document.querySelector('.loc').textContent)).includes('กลับไปใช้ตำแหน่งของฉัน'));
await p.click('[data-loc=gps]');await wait(300);ok('gps click drops pin immediately (no stale pin kept)',!(await p.evaluate(()=>document.getElementById('locl').textContent+' '+document.querySelector('.loc').textContent)).includes('กลับไปใช้ตำแหน่งของฉัน'));await ctx.setGeolocation({latitude:13.751,longitude:100.501});await wait(1800);
const loc2=await p.evaluate(()=>document.getElementById('locl').textContent+' '+document.querySelector('.loc').textContent);console.log('LOC2',loc2,'|',await p.evaluate(()=>document.querySelector('.hint')&&document.querySelector('.hint').textContent));ok('back to gps',loc2.includes('ตำแหน่งของคุณ')&&!loc2.includes('กลับไปใช้ตำแหน่งของฉัน'));
let L3=(await names()).join('|');ok('Bangkok shop back',L3.includes('ร้านสบายดี')&&!L3.includes('ป่าตอง'));
// reset then pick again with map blocked
await p.click('[data-loc=reset]');await wait(200);stubOn=false;await p.evaluate(()=>{delete window.L});
await p.click('[data-loc=find]');await p.waitForSelector('#mpov');await p.waitForFunction(()=>document.getElementById('mpm').textContent.includes('โหลดแผนที่ไม่สำเร็จ'),null,{timeout:15000});
ok('load failure message',true);
await p.fill('#mp_lat','7.8804');await p.fill('#mp_lng','98.2923');await p.click('[data-mp=ok]');await wait(300);
ok('manual coords work without map',(await names()).join('|').includes('ร้านป่าตอง')&&(await p.evaluate(()=>document.getElementById('locl').textContent+' '+document.querySelector('.loc').textContent)).includes('กลับไปใช้ตำแหน่งของฉัน'));
await p.click('[data-loc=reset]');await wait(200);ok('reset clears manual',(await p.evaluate(()=>document.getElementById('locl').textContent+' '+document.querySelector('.loc').textContent)).includes('แสดงร้านทั้งหมด'));
// ---- ค้นหาสถานที่ ----
stubOn=true;const NMQ=[];let nmMode='ok';
const RES={'ป่าตอง':[{lat:'7.8961',lon:'98.2964',name:'หาดป่าตอง',display_name:'หาดป่าตอง, ป่าตอง, กะทู้, ภูเก็ต',address:{suburb:'ป่าตอง',county:'กะทู้',state:'ภูเก็ต'}},{lat:'7.8930',lon:'98.3000',name:'ถนนบางลา',display_name:'ถนนบางลา, ป่าตอง, ภูเก็ต',address:{road:'ถนนบางลา',suburb:'ป่าตอง',state:'ภูเก็ต'}}]};
await ctx.route('**/nominatim.openstreetmap.org/**',r=>{const u=new URL(r.request().url());if(!u.pathname.startsWith('/search'))return r.fulfill({status:200,contentType:'application/json',body:'{}'});
 NMQ.push({t:Date.now(),q:u.searchParams.get('q'),s:u.search});if(nmMode==='err')return r.fulfill({status:500,body:'x'});r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(RES[u.searchParams.get('q')]||[])})});
const lbs=await p.$$eval('.loc button',e=>e.map(x=>x.dataset.loc));
ok('search: button order gps, find (map button merged into find)',lbs.indexOf('find')===lbs.indexOf('gps')+1&&lbs.indexOf('map')<0&&(await p.textContent('[data-loc=find]')).trim()==='ค้นหาสถานที่');
await p.click('[data-loc=find]');await p.waitForSelector('#mpov');
ok('search: dialog title and cursor in the search box',(await p.textContent('#mp_h'))==='ค้นหาหรือเลือกจุดบนแผนที่'&&await p.evaluate(()=>document.activeElement&&document.activeElement.id==='mp_q')&&(await p.getAttribute('#mpov','aria-label'))==='ค้นหาหรือเลือกจุดบนแผนที่');
await p.fill('#mp_q','ป');await p.click('[data-mp=find]');await wait(200);
ok('search: too short asks for 2 letters, no request',(await p.textContent('#mp_rs')).includes('อย่างน้อย 2 ตัวอักษร')&&NMQ.length===0);
await p.fill('#mp_q','ป่าตอง');await p.keyboard.press('Enter');await p.waitForSelector('[data-mpr]',{timeout:6000});
ok('search: Thailand only, Thai names, not limited to Bangkok',NMQ.length===1&&/countrycodes=th/.test(NMQ[0].s)&&/accept-language=th/.test(NMQ[0].s)&&!/bounded/.test(NMQ[0].s)&&/limit=5/.test(NMQ[0].s));
ok('search: status says how many found (polite live region)',(await p.textContent('#mp_rs'))==='พบ 2 แห่ง เลือกแห่งที่ต้องการ'&&(await p.getAttribute('#mp_rs','role'))==='status');
const rs=await p.$$eval('[data-mpr]',e=>e.map(x=>x.textContent));
ok('search: results are buttons with name and address',rs.length===2&&rs[0].startsWith('หาดป่าตอง')&&rs[0].includes('กะทู้')&&rs[1].startsWith('ถนนบางลา'));
await p.click('[data-mpr="0"]');await wait(150);
ok('pick: pin and coordinates move to the place',Math.abs(+(await p.inputValue('#mp_lat'))-7.8961)<1e-6&&Math.abs(+(await p.inputValue('#mp_lng'))-98.2964)<1e-6);
ok('pick: focus on confirm button that names the place, list cleared',await p.evaluate(()=>document.activeElement&&document.activeElement.dataset.mp==='ok'&&document.activeElement.getAttribute('aria-label')==='ยืนยันจุดนี้ หาดป่าตอง')&&(await p.$$('[data-mpr]')).length===0);
ok('pick: place name shown above the map',(await p.textContent('#mp_place')).startsWith('หาดป่าตอง'));
await p.click('[data-mp=ok]');await wait(300);
ok('confirm: shops near the searched place, name kept',(await names()).join('|').includes('ร้านป่าตอง')&&(await p.evaluate(()=>document.getElementById('locl').textContent+' '+document.querySelector('.loc').textContent)).includes('กลับไปใช้ตำแหน่งของฉัน')&&(await p.textContent('#locnm')).startsWith('หาดป่าตอง'));
await p.click('[data-loc=find]');await p.waitForSelector('#mpov');const n0=NMQ.length;await p.fill('#mp_q','ป่าตอง');await p.click('[data-mp=find]');await p.waitForSelector('[data-mpr]',{timeout:6000});
ok('search: same words again uses saved result (no new request)',NMQ.length===n0);
await p.fill('#mp_q','ไม่มีที่นี่');await p.click('[data-mp=find]');await p.waitForFunction(()=>document.getElementById('mp_rs').textContent.includes('ไม่พบ'),null,{timeout:6000});
ok('search: nothing found suggests road or area',(await p.textContent('#mp_rs')).includes('ลองพิมพ์ชื่อถนน ย่าน')&&(await p.$$('[data-mpr]')).length===0);
nmMode='err';await p.fill('#mp_q','ล้มเหลว');await p.click('[data-mp=find]');await p.waitForFunction(()=>document.getElementById('mp_rs').textContent.includes('ไม่สำเร็จ'),null,{timeout:6000});
ok('search: failure message',(await p.textContent('#mp_rs')).includes('ค้นหาไม่สำเร็จ'));
const gaps=NMQ.slice(1).map((x,i)=>x.t-NMQ[i].t);ok('search: at most one request per second',gaps.every(g=>g>=1000));
await p.keyboard.press('Escape');await wait(200);
ok('search: Escape closes and keeps earlier point',!(await p.$('#mpov'))&&(await p.evaluate(()=>document.getElementById('locl').textContent+' '+document.querySelector('.loc').textContent)).includes('กลับไปใช้ตำแหน่งของฉัน'));
await p.click('[data-loc=find]');await p.waitForSelector('#mpov');
ok('find button: search box there with cursor in it, hint to drag the pin',!!(await p.$('#mp_q'))&&await p.evaluate(()=>document.activeElement&&document.activeElement.id==='mp_q')&&(await p.textContent('#mpov')).includes('หรือแตะ ลากหมุดบนแผนที่ด้านล่าง'));
await p.keyboard.press('Escape');
console.log('errors:',errs.join('|')||'none');await b.close();process.exit(0)
})()
