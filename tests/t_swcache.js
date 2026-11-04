// แคชหน้าเว็บด้วย service worker: เปิดซ้ำตอนออฟไลน์ได้ และมีเวอร์ชันใหม่แล้วขึ้นปุ่มอัปเดต (ไม่รีโหลดเอง)
const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
(async()=>{const dir=require('./config').serveDir();let ver='V1';
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.png':'image/png','.webmanifest':'application/manifest+json'};
const reqs=[];
const srv=http.createServer((q,r)=>{const p=decodeURIComponent(q.url.split('?')[0]);reqs.push(p);const f=path.join(dir,p==='/'?'customer-booking.html':p);
 if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.statusCode=404;return r.end('nf')}
 let b=fs.readFileSync(f);if(f.endsWith('.html'))b=Buffer.from(b.toString().replace('</body>','<div id="swver">'+ver+'</div></body>'));
 r.setHeader('content-type',types[path.extname(f)]||'application/octet-stream');r.setHeader('cache-control','public, max-age=0, must-revalidate');r.end(b)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+srv.address().port;
const b=await chromium.launch(require('./config').launch);const ctx=await b.newContext({locale:'th-TH',timezoneId:'Asia/Bangkok'});
await ctx.route(/supabase\.co|googleapis|gstatic/,r=>r.abort());
const errs=[];const ok=(n,c)=>console.log((c?'PASS ':'FAIL ')+n);const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));
const U=base+'/customer-booking.html';
await p.goto(U);await p.evaluate(()=>navigator.serviceWorker.ready.then(()=>1));
for(let i=0;i<40;i++){const n=await p.evaluate(()=>caches.keys().then(async ks=>{let c=0;for(const k of ks){c+=(await (await caches.open(k)).keys()).length}return c}));if(n>0)break;await sleep(150)}
ok('page copy stored in cache after first visit',(await p.evaluate(()=>caches.keys())).includes('pages-v1')&&(await p.evaluate(()=>caches.open('pages-v1').then(c=>c.keys()).then(k=>k.length)))>=1);
ok('first load shows V1',(await p.textContent('#swver'))==='V1');
await p.reload();await p.waitForSelector('#swver');
ok('page is controlled by the service worker',await p.evaluate(()=>!!navigator.serviceWorker.controller));
// ออฟไลน์
await ctx.setOffline(true);await p.reload();await p.waitForSelector('#swver',{timeout:8000});
ok('opens offline from cache',(await p.textContent('#swver'))==='V1');
await ctx.setOffline(false);
// เวอร์ชันใหม่
ver='V2';await p.reload();await p.waitForSelector('#swver');
ok('stale copy shown immediately (no auto reload)',(await p.textContent('#swver'))==='V1');
await p.waitForSelector('div[role=status]:has-text("มีเวอร์ชันใหม่")',{timeout:8000});
ok('update banner appears with button',!!(await p.$('div[role=status] button:has-text("อัปเดตเดี๋ยวนี้")')));
await p.click('div[role=status] button:has-text("อัปเดตเดี๋ยวนี้")');await p.waitForSelector('#swver');await sleep(300);
ok('after tapping update, new version shown',(await p.textContent('#swver'))==='V2');
// ไม่ยุ่งกับคำขอที่ไม่ใช่การเปิดหน้า
ok('only navigation is cached (no API/other GET cached)',(await p.evaluate(()=>caches.open('pages-v1').then(c=>c.keys()).then(k=>k.map(x=>new URL(x.url).pathname))))+''==='/customer-booking.html');
console.log('errors:',errs.join('|')||'none');await b.close();srv.close();process.exit(0)})();
