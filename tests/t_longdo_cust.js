// หน้าต่าง "ค้นหาหรือเลือกจุดบนแผนที่" ของผู้ใช้งานเมื่อแอดมินใส่รหัส Longdo Map:
// ค้นหาด้วย Longdo (JSONP), แผนที่ Longdo (คลิก ลากหมุด ขยับหมุด), ตกกลับไปใช้ OpenStreetMap เมื่อไม่มีรหัส/โหลดไม่ได้/ค้นไม่สำเร็จ
// ใช้ตัวจำลอง Longdo (ไม่ต่ออินเทอร์เน็ตจริง)
const {chromium}=require('playwright');
const ok=(n,c)=>console.log((c?'PASS ':'FAIL ')+n);const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const until=async(fn,ms=8000)=>{const t0=Date.now();for(;;){try{if(await fn())return true}catch(e){}if(Date.now()-t0>ms)return false;await sleep(50)}};
const KEY='abcdef0123456789abcdef0123456789';
const LGSTUB=`(function(){var W=window;W.__lg={handlers:{},center:null,zoom:null,mk:null,opts:null};
function Map(o){var self=this;W.__lg.opts=o;W.__lg.center={lat:o.location.lat,lon:o.location.lon};W.__lg.zoom=o.zoom;o.placeholder.setAttribute('data-lgstub','1');
 this.location=function(a,anim){if(a===W.longdo.LocationMode.Pointer)return W.__lg.pointer;if(a){W.__lg.center={lat:a.lat,lon:a.lon};return}return W.__lg.center};
 this.zoom=function(z){if(z!=null){W.__lg.zoom=z;return}return W.__lg.zoom};this.resize=function(){W.__lg.resized=true};
 this.Overlays={add:function(m){W.__lg.added=m}};this.Event={bind:function(n,f){W.__lg.handlers[n]=f}};W.__lg.map=this}
function Marker(l,o){var p={lat:l.lat,lon:l.lon};this.opts=o;this.location=function(a){if(a){p={lat:a.lat,lon:a.lon};return}return p};W.__lg.mk=this}
W.longdo={Map:Map,Marker:Marker,LocationMode:{Pointer:'pointer'}}})();`;
const LEAF=`(function(){var W=window;function LL(a,b){return{lat:a,lng:b}}W.__lf={};
W.L={map:function(box){var c=LL(0,0),m={};m.setView=function(a){c=LL(a[0],a[1]);return m};m.latLngToContainerPoint=function(a){a=Array.isArray(a)?LL(a[0],a[1]):a;return{x:(a.lng-c.lng)*1000,y:-(a.lat-c.lat)*1000}};
 m.containerPointToLatLng=function(p){return LL(c.lat-p.y/1000,c.lng+p.x/1000)};m.panTo=function(a){c=LL(a[0],a[1])};m.on=function(){return m};m.remove=function(){};m.invalidateSize=function(){};box.setAttribute('data-leaf','1');return m},
 tileLayer:function(){return{addTo:function(){}}},divIcon:function(o){return o},marker:function(a){var k={addTo:function(){return k},setLatLng:function(){},getLatLng:function(){return LL(a[0],a[1])},on:function(){return k}};return k}}})();`;
(async()=>{const b=await chromium.launch(require('./config').launch);const errs=[];
const mk=async o=>{o=o||{};const ctx=await b.newContext({locale:'th-TH',timezoneId:'Asia/Bangkok',viewport:{width:390,height:844},serviceWorkers:'block'});
 const H={map3:[],search:[],nom:[]};
 await ctx.route(/supabase\.co/,r=>{const u=new URL(r.request().url()).pathname;r.fulfill({status:200,contentType:'application/json',body:u.endsWith('/public_catalog')?JSON.stringify({places:[{id:'x',type:'shop',name:'ร้านทดสอบ',area:'สยาม',lat:13.74,lng:100.53,open_days:[0,1,2,3,4,5,6],open_time:'10:00:00',close_time:'21:00:00'}],services:[],staff:[],settings:{shop_radius_km:10,org_radius_km:10,longdo_key:o.key===undefined?KEY:o.key}}):u.includes('/rpc/')?'null':'[]'})});
 await ctx.route('**/api.longdo.com/**',r=>{const u=r.request().url();H.map3.push(u);if(o.mapFail)return r.abort();
  if(o.docWrite&&!u.includes('real.js'))return r.fulfill({status:200,contentType:'application/javascript',body:'document.write(\'<script src="https://api.longdo.com/map3/real.js"></scr\'+\'ipt>\');'});
  r.fulfill({status:200,contentType:'application/javascript',body:LGSTUB})});
 await ctx.route('**/search.longdo.com/**',r=>{const u=new URL(r.request().url());H.search.push(u.search);if(o.searchFail)return r.fulfill({status:500,body:'x'});
  const cb=u.searchParams.get('callback'),q=u.searchParams.get('keyword');
  const data=q==='ไม่มี'?[]:[{id:'A1',name:'<b>โรงแรม</b>ทดสอบ แกรนด์',lat:13.7443,lon:100.5402,address:'ถนนเพลินจิต แขวงลุมพินี เขตปทุมวัน กรุงเทพมหานคร'},{id:'A2',name:'โรงแรมทดสอบ พัทยา',lat:12.93,lon:100.88,address:'บางละมุง ชลบุรี'}];
  r.fulfill({status:200,contentType:'application/javascript',body:cb+'('+JSON.stringify({meta:{keyword:q},data})+')'})});
 await ctx.route('**/nominatim.openstreetmap.org/**',r=>{const u=new URL(r.request().url());if(u.pathname.startsWith('/search')){H.nom.push(u.search);return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify([{lat:'13.75',lon:'100.5',name:'สถานที่จาก OSM',display_name:'สถานที่จาก OSM, กรุงเทพมหานคร',address:{state:'กรุงเทพมหานคร'}}])})}r.fulfill({status:200,contentType:'application/json',body:'{}'})});
 await ctx.route('**/unpkg.com/**',r=>r.request().url().endsWith('.css')?r.fulfill({status:200,contentType:'text/css',body:''}):r.fulfill({status:200,contentType:'application/javascript',body:LEAF}));
 await ctx.addInitScript(()=>{for(const C of [HTMLScriptElement,HTMLLinkElement]){Object.defineProperty(C.prototype,'integrity',{configurable:true,get(){return ''},set(v){}})}});
 const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));
 await p.goto(require('./config').page('customer-booking.html'));await p.waitForSelector('[data-loc=find]',{timeout:8000});return {p,ctx,H}};
const find=async(p,q)=>{await p.fill('#mp_q',q);await p.click('[data-mp=find]')};

// 1) มีรหัส: แผนที่และการค้นหาใช้ Longdo
let {p,ctx,H}=await mk();
await p.click('[data-loc=find]');await p.waitForSelector('#mpm[data-lgstub]',{timeout:8000});
ok('Longdo: map script loaded once with the key',H.map3.length===1&&H.map3[0].includes('map3/?key='+KEY));
ok('Longdo: map starts at current start point without last-view, Thai',await p.evaluate(()=>window.__lg.opts.lastView===false&&window.__lg.opts.language==='th'&&!!window.__lg.added));
ok('Longdo: cursor stays in the search box',await p.evaluate(()=>document.activeElement&&document.activeElement.id==='mp_q'));
await find(p,'โรงแรมทดสอบ');await p.waitForSelector('[data-mpr]',{timeout:8000});
ok('Longdo search: keyword, Thai, limit 5, key, JSONP callback',H.search.length===1&&/keyword=%E0/.test(H.search[0])&&/locale=th/.test(H.search[0])&&/limit=5/.test(H.search[0])&&H.search[0].includes('key='+KEY)&&/callback=__lgcb\d+/.test(H.search[0])&&H.nom.length===0);
const rs=await p.$$eval('[data-mpr]',e=>e.map(x=>x.textContent));
ok('Longdo search: results with name (tags removed) and address',rs.length===2&&rs[0].startsWith('โรงแรมทดสอบ แกรนด์')&&rs[0].includes('เขตปทุมวัน')&&!rs[0].includes('<b>'));
ok('Longdo search: callback cleaned up',await p.evaluate(()=>!Object.keys(window).some(k=>/^__lgcb/.test(k)&&window[k])));
await p.click('[data-mpr="0"]');await sleep(150);
ok('pick: marker, map centre, zoom and inputs move to the place',await p.evaluate(()=>{const m=window.__lg.mk.location(),c=window.__lg.center;return Math.abs(m.lat-13.7443)<1e-6&&Math.abs(m.lon-100.5402)<1e-6&&Math.abs(c.lat-13.7443)<1e-6&&window.__lg.zoom===17})&&Math.abs(+(await p.inputValue('#mp_lat'))-13.7443)<1e-6);
ok('pick: focus on confirm with the place name',await p.evaluate(()=>document.activeElement&&document.activeElement.getAttribute('aria-label')==='ยืนยันจุดนี้ โรงแรมทดสอบ แกรนด์'));
await p.evaluate(()=>{window.__lg.pointer={lat:13.8,lon:100.6};window.__lg.handlers.click()});
ok('map click moves the pin',Math.abs(+(await p.inputValue('#mp_lat'))-13.8)<1e-6&&Math.abs(+(await p.inputValue('#mp_lng'))-100.6)<1e-6&&await p.evaluate(()=>Math.abs(window.__lg.mk.location().lat-13.8)<1e-6));
await p.evaluate(()=>{window.__lg.mk.location({lat:13.81,lon:100.61});window.__lg.handlers.overlayDrop(window.__lg.mk)});
ok('dragging the marker updates the coordinates',Math.abs(+(await p.inputValue('#mp_lat'))-13.81)<1e-6);
const la0=+(await p.inputValue('#mp_lat')),ln0=+(await p.inputValue('#mp_lng'));await p.click('[data-mp=u]');const la1=+(await p.inputValue('#mp_lat'));await p.click('[data-mp=r]');const ln1=+(await p.inputValue('#mp_lng'));
ok('nudge buttons move the pin a little (up raises latitude, right raises longitude)',la1>la0&&la1-la0<0.01&&ln1>ln0&&ln1-ln0<0.01);
await p.click('[data-mpr="0"]').catch(()=>{});
await find(p,'โรงแรมทดสอบ');await p.waitForSelector('[data-mpr]');await p.click('[data-mpr="0"]');await p.click('[data-mp=ok]');await sleep(300);
ok('confirm: point used for nearby shops, name kept',!(await p.$('#mpov'))&&(await p.textContent('.loc')).includes('จุดที่คุณเลือก')&&(await p.textContent('#locnm')).startsWith('โรงแรมทดสอบ แกรนด์'));
await p.click('[data-loc=find]');await p.waitForSelector('#mpm[data-lgstub]');
ok('reopen: Longdo script not loaded again',H.map3.length===1);
await find(p,'ไม่มี');await until(async()=>(await p.textContent('#mp_rs')).includes('ไม่พบ'));
ok('Longdo nothing found: suggestion shown, no OSM fallback',(await p.textContent('#mp_rs')).includes('ลองพิมพ์ชื่อถนน')&&H.nom.length===0);
// เฉพาะกรุงเทพ (ขอบริการหน่วยงาน): ตัดผลนอกกรุงเทพทิ้ง
await p.keyboard.press('Escape');await p.evaluate(()=>openPicker({search:1,bkk:1,start:{lat:13.7563,lng:100.5018,z:11,known:0},cb:function(){}}));await p.waitForSelector('#mpov');
await find(p,'โรงแรมทดสอบ');await p.waitForSelector('[data-mpr]');
ok('Bangkok-only search keeps only places in Bangkok',(await p.$$('[data-mpr]')).length===1&&(await p.textContent('[data-mpr="0"]')).includes('แกรนด์')&&/limit=15/.test(H.search[H.search.length-1]));
await ctx.close();

// 2) ค้นด้วย Longdo ไม่สำเร็จ: ใช้ OpenStreetMap แทน
({p,ctx,H}=await mk({searchFail:true}));await p.click('[data-loc=find]');await p.waitForSelector('#mpm[data-lgstub]');
await find(p,'โรงแรมทดสอบ');await p.waitForSelector('[data-mpr]',{timeout:12000});
ok('Longdo search fails: OpenStreetMap results instead',H.search.length===1&&H.nom.length===1&&(await p.textContent('[data-mpr="0"]')).includes('สถานที่จาก OSM'));
await ctx.close();

// 3) โหลดแผนที่ Longdo ไม่ได้: ใช้แผนที่ OpenStreetMap
({p,ctx,H}=await mk({mapFail:true}));await p.click('[data-loc=find]');await p.waitForSelector('#mpm[data-leaf]',{timeout:15000});
ok('Longdo map fails: OpenStreetMap map shown instead',!(await p.$('#mpm[data-lgstub]'))&&!(await p.$('#mpm[data-lg]')));
await find(p,'โรงแรมทดสอบ');await p.waitForSelector('[data-mpr]');
ok('Longdo map fails: Longdo search still used',H.search.length===1&&(await p.textContent('[data-mpr="0"]')).includes('แกรนด์'));
await p.keyboard.press('Escape');await p.click('[data-loc=find]');await p.waitForSelector('#mpm[data-leaf]');
ok('Longdo map fails: not retried in the same visit',H.map3.length===1);
await ctx.close();

// 4) ไม่มีรหัส: ไม่เรียก Longdo เลย
({p,ctx,H}=await mk({key:null}));await p.click('[data-loc=find]');await p.waitForSelector('#mpm[data-leaf]');
await find(p,'โรงแรมทดสอบ');await p.waitForSelector('[data-mpr]');
ok('no key: OpenStreetMap only, no Longdo requests',H.map3.length===0&&H.search.length===0&&H.nom.length===1);
await ctx.close();
({p,ctx,H}=await mk({key:'bad key!'}));await p.click('[data-loc=find]');await p.waitForSelector('#mpm[data-leaf]');
ok('malformed key ignored',H.map3.length===0);
await ctx.close();

// 5) สคริปต์ Longdo ใช้ document.write: หน้าเว็บไม่ถูกล้าง
({p,ctx,H}=await mk({docWrite:true}));await p.click('[data-loc=find]');await p.waitForSelector('#mpm[data-lgstub]',{timeout:8000});
ok('loader using document.write: map still loads, page intact',H.map3.some(u=>u.includes('real.js'))&&!!(await p.$('#mp_q'))&&!!(await p.$('.loc'))&&await p.evaluate(()=>document.write.toString().indexOf('native code')>-1));
await ctx.close();

console.log('errors:',errs.join('|')||'none');ok('no page errors',errs.length===0);
await b.close();process.exit(0)})();
