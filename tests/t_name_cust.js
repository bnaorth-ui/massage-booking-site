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

const NM=[];let nmFail=false;
await ctx.route('**/nominatim.openstreetmap.org/**',r=>{const u=new URL(r.request().url());const lat=+u.searchParams.get('lat'),lon=+u.searchParams.get('lon');NM.push({t:Date.now(),lat,lon,lang:u.searchParams.get('accept-language')});
 if(nmFail)return r.fulfill({status:500,body:'err'});
 const j=lat<10?{name:'โรงแรมทดสอบ ป่าตอง',address:{road:'ถนนราษฎร์อุทิศ 200 ปี',suburb:'ป่าตอง',city_district:'กะทู้',state:'ภูเก็ต'}}:{name:'',address:{road:'ถนนพระราม 4',suburb:'ลุมพินี',city_district:'ปทุมวัน',state:'กรุงเทพมหานคร'}};
 return r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(j)})});

await p.goto(require('./config').page('customer-booking.html'));
const ok=(n,c)=>console.log((c?'PASS ':'FAIL ')+n);const wait=ms=>p.waitForTimeout(ms);
await p.fill('#lph','0811111111');await p.fill('#lpw','abc123');await p.click('button[type=submit]');await p.waitForSelector('[data-pl]',{timeout:4000});await wait(800);
ok('no place lookup before any user action (auto GPS)',NM.length===0);
await p.click('[data-loc=map]');await p.waitForSelector('#mpm[data-stub]');await wait(1200);
ok('picker with known start looks up name (Thai, road only -> "ใกล้")',NM.length===1&&NM[0].lang==='th'&&(await p.textContent('#mp_place')).includes('ใกล้ ถนนพระราม 4'));
await p.evaluate(()=>{for(let i=0;i<6;i++)window.__lf.drag({lat:7.88+i*0.0001,lng:98.29})});await wait(2200);
ok('rapid drags -> only one lookup (debounce)',NM.length===2&&NM[1].lat>7.88);
ok('POI name shown first',(await p.textContent('#mp_place')).includes('โรงแรมทดสอบ ป่าตอง')&&(await p.textContent('#mp_place')).includes('ภูเก็ต'));
await p.click('[data-mp=ok]');await wait(300);
ok('page shows selected place name',(await p.textContent('#locnm')).includes('โรงแรมทดสอบ ป่าตอง'));
const n2=NM.length;
await p.click('[data-loc=map]');await p.waitForSelector('#mpm[data-stub]');await wait(1500);
ok('reopen same pin -> cached (no new request)',NM.length===n2&&(await p.textContent('#mp_place')).includes('โรงแรมทดสอบ'));
await p.evaluate(()=>window.__lf.fire('click',{latlng:{lat:13.7,lng:100.5}}));await wait(1500);
await p.evaluate(()=>window.__lf.fire('click',{latlng:{lat:7.5,lng:98.1}}));await wait(1800);
const gaps=NM.slice(1).map((x,i)=>x.t-NM[i].t);ok('requests spaced >= 1s ('+gaps.join(',')+')',gaps.every(x=>x>=1000));
nmFail=true;await p.evaluate(()=>window.__lf.fire('click',{latlng:{lat:7.2,lng:98.0}}));await wait(2500);
ok('lookup failure -> coords message, no crash',(await p.textContent('#mp_place')).includes('ไม่พบชื่อสถานที่ (พิกัด 7.20000'));
await p.click('[data-mp=ok]');await wait(300);
ok('confirm still works; no stale name',(await p.textContent('.loc')).includes('จุดที่คุณเลือก')&&!(await p.$('#locnm')));
nmFail=false;
await p.click('[data-loc=reset]');await wait(200);ok('reset: no name',!(await p.$('#locnm')));
await p.evaluate(()=>{navigator.geolocation.getCurrentPosition=function(ok){ok({coords:{latitude:13.75,longitude:100.5}})}});await p.click('[data-loc=gps]');await wait(2500);
ok('gps button -> name of current place shown',(await p.$('#locnm'))?(await p.textContent('#locnm')).includes('ถนนพระราม 4'):false);
const cnt=NM.length;await ctx.setGeolocation({latitude:13.76,longitude:100.51});await wait(2500);
ok('background gps movement does not trigger lookups, stale name cleared',NM.length===cnt&&!(await p.$('#locnm')));
await p.click('[data-a=tab][data-id=ac]').catch(()=>{});
console.log('errors:',errs.join('|')||'none');await b.close();process.exit(0)
})()
