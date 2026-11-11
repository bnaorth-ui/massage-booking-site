// เมื่อไม่มีอินเทอร์เน็ต (update.js และ sw.js ที่ใช้ร่วมกันทั้ง 4 แอป)
// 1) แถบ "ไม่มีอินเทอร์เน็ต" พร้อมปุ่มลองใหม่ ทุกแอป หายเองเมื่อเน็ตกลับมา
// 2) เปิดหน้าที่ยังไม่เคยเก็บไว้ตอนไม่มีเน็ต: service worker ส่งหน้า "ไม่มีอินเทอร์เน็ต" ภาษาไทย แทนหน้าเตือนของเบราว์เซอร์
const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');const C=require('./config');
const ok=(n,c)=>console.log((c?'PASS ':'FAIL ')+n);const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await chromium.launch(C.launch);const errs=[];
for(const [nm,file] of [['customer','customer-booking.html'],['shop','shop-owner.html'],['staff','staff-app.html'],['admin','admin-panel.html']]){
 const ctx=await b.newContext({locale:'th-TH',timezoneId:'Asia/Bangkok'});
 await ctx.route(/^https?:/,r=>{const u=r.request().url();if(/supabase\.co/.test(u))return r.fulfill({status:200,contentType:'application/json',body:u.includes('/rpc/')?'null':'[]'});return r.abort()});
 const p=await ctx.newPage();p.on('pageerror',e=>errs.push(nm+': '+e.message));
 await p.goto(C.page(file));await sleep(1800);
 ok(nm+': no bar while online',!(await p.$('#netbar'))||!(await p.isVisible('#netbar')));
 await ctx.setOffline(true);await sleep(300);
 ok(nm+': offline bar shows with retry, as an alert',await p.isVisible('#netbar')&&(await p.textContent('#netmsg')).includes('ไม่มีอินเทอร์เน็ต')&&await p.isVisible('#netretry')&&(await p.getAttribute('#netbar','role'))==='alert');
 ok(nm+': bar is first in the page (top)',await p.evaluate(()=>document.body.firstElementChild&&document.body.firstElementChild.id==='netbar'));
 await p.click('#netretry');await sleep(200);
 ok(nm+': retry while still offline explains, no reload',(await p.textContent('#netmsg')).includes('ยังไม่มีอินเทอร์เน็ต'));
 await ctx.setOffline(false);await sleep(300);
 ok(nm+': back online says connected, no retry button',(await p.textContent('#netmsg')).includes('เชื่อมต่ออินเทอร์เน็ตแล้ว')&&!(await p.isVisible('#netretry')));
 await sleep(3300);ok(nm+': bar hides itself',!(await p.isVisible('#netbar')));
 await ctx.close();
}
// ไฟล์ร่วมเหมือนกันทุกแอป
const R=path.resolve(__dirname,'..');for(const f of ['update.js','sw.js']){const a=fs.readFileSync(path.join(R,'customer',f),'utf8');ok(f+' identical in 4 apps',['shop','staff','admin'].every(x=>fs.readFileSync(path.join(R,x,f),'utf8')===a))}
// หน้าออฟไลน์จาก service worker
const ROOT=path.join(R,'customer');const T={'.html':'text/html; charset=utf-8','.js':'text/javascript','.png':'image/png','.json':'application/json','.webmanifest':'application/manifest+json'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=path.join(ROOT,u);if(!f.startsWith(ROOT)||!fs.existsSync(f)){r.statusCode=404;return r.end('nf')}r.setHeader('content-type',T[path.extname(f)]||'application/octet-stream');r.end(fs.readFileSync(f))});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+srv.address().port;
const ctx=await b.newContext({locale:'th-TH'});await ctx.route(/supabase\.co|googleapis|gstatic|unpkg|cdnjs|longdo/,r=>r.abort());
const p=await ctx.newPage();p.on('pageerror',e=>errs.push('sw: '+e.message));
await p.goto(base+'/');await p.evaluate(()=>navigator.serviceWorker.ready.then(()=>1));await p.reload();await sleep(500);
ok('page controlled by service worker',await p.evaluate(()=>!!navigator.serviceWorker.controller));
await ctx.setOffline(true);
await p.goto(base+'/delete-account/').catch(()=>{});await sleep(300);
ok('first open while offline: Thai offline page with retry, focus on title',(await p.textContent('h1'))==='ไม่มีอินเทอร์เน็ต'&&(await p.textContent('body')).includes('กดลองใหม่')&&!!(await p.$('button'))&&await p.evaluate(()=>document.activeElement&&document.activeElement.id==='oft'));
ok('offline page is Thai and not cached as the real page',(await p.evaluate(()=>document.documentElement.lang))==='th'&&!(await p.evaluate(async()=>{const c=await caches.open('pages-v2');return !!(await c.match(location.origin+'/delete-account/'))})));
await ctx.setOffline(false);await sleep(1200);
ok('back online: offline page reloads into the real page',(await p.textContent('h1').catch(()=>''))==='วิธีลบบัญชีผู้ใช้งาน');
await ctx.setOffline(true);await p.goto(base+'/').catch(()=>{});await sleep(300);
ok('visited page still opens offline from cache (not the offline page)',(await p.title())!=='ไม่มีอินเทอร์เน็ต'&&!!(await p.$('#bar')));
await ctx.setOffline(false);
console.log('errors:',errs.join('|')||'none');ok('no page errors',errs.length===0);await b.close();srv.close();process.exit(0)})();
