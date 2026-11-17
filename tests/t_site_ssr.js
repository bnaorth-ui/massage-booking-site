// เว็บประชาสัมพันธ์ (site/) แบบที่ Cloudflare ใส่เนื้อหามาให้แล้ว (functions/_middleware.js): เบราว์เซอร์ใช้เนื้อหาเดิม ไม่สร้างใหม่ ไม่โหลดซ้ำ
// ปุ่มต่างๆ ยังทำงาน (เปลี่ยนหน้า ดูเพิ่มเติม ย้อนกลับ) และปิดสคริปต์แล้วยังเห็นเนื้อหา (แบบที่โปรแกรมของ Google / LINE เห็น)
// เซิร์ฟเวอร์ชั่วคราวในเครื่อง เรียก middleware จริง ข้อมูลจำลอง ไม่แตะ Supabase จริง
const {chromium}=require('playwright');const C=require('./config');const http=require('http'),fs=require('fs'),path=require('path'),os=require('os');
const ok=(n,c)=>console.log((c?'PASS ':'FAIL ')+n);
const ROOT=path.resolve(__dirname,'..','site');
const day=i=>new Date(Date.UTC(2026,10,17-i)).toISOString().slice(0,10);
const DB=[];for(let i=1;i<=15;i++)DB.push({no:i,kind:i%3?'news':'article',title:'เรื่องที่ '+i,summary:'สรุป '+i,body:'เนื้อหา '+i,cover_path:null,cover_alt:'',day:day(i),pinned:false,active:true});
function q(u){const x=new URL(u),p=x.searchParams;let r=DB.filter(a=>a.active);if(p.get('kind'))r=r.filter(a=>a.kind===p.get('kind').slice(3));if(p.get('no'))r=r.filter(a=>a.no===+p.get('no').slice(3));
 const off=+(p.get('offset')||0),lim=+(p.get('limit')||1000);return r.slice(off,off+lim)}
const CONTACT={name:'สมาคมวิทยากรฝึกอาชีพคนตาบอด',phone:'0989983654',email:'info@example.org',hours:'จันทร์ - ศุกร์ 09:00 - 17:00 น.'};
// fetch ฝั่งเซิร์ฟเวอร์ (middleware) ใช้ข้อมูลจำลอง
global.fetch=async u=>{u=String(u);const J=x=>new Response(JSON.stringify(x),{headers:{'Content-Type':'application/json'}});if(u.includes('/rpc/public_contact'))return J(CONTACT);return J(q(u))};
(async()=>{
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'sitessr-'));
fs.cpSync(path.join(ROOT,'functions'),path.join(tmp,'functions'),{recursive:true});fs.cpSync(path.join(ROOT,'shared'),path.join(tmp,'shared'),{recursive:true});fs.writeFileSync(path.join(tmp,'package.json'),'{"type":"module"}');
const mw=await import('file://'+path.join(tmp,'functions/_middleware.js'));
const INDEX=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
const MIME={'.html':'text/html; charset=utf-8','.png':'image/png','.js':'text/javascript'};
const srv=http.createServer(async(qq,s)=>{const u=decodeURIComponent(qq.url.split('?')[0]);const f=path.join(ROOT,u);
 if(f.startsWith(ROOT)&&fs.existsSync(f)&&fs.statSync(f).isFile()){s.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});return fs.createReadStream(f).pipe(s)}
 const r=await mw.onRequest({request:new Request('http://'+qq.headers.host+qq.url),next:async()=>new Response(INDEX,{headers:{'Content-Type':'text/html; charset=utf-8'}})});
 s.writeHead(r.status,{'Content-Type':'text/html; charset=utf-8'});s.end(await r.text())});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const BASE='http://127.0.0.1:'+srv.address().port;
const b=await chromium.launch(C.launch);const errs=[];
// ปิดสคริปต์: เห็นเนื้อหาครบ
const nj=await b.newContext({javaScriptEnabled:false,locale:'th-TH'});const np=await nj.newPage();
await np.goto(BASE+'/company/');
ok('no-JS: company content visible',(await np.textContent('#view')).includes('มาตรา 35: ให้สิทธิแทนการจ้าง')&&(await np.textContent('h1'))==='สำหรับบริษัทและองค์กร');
await np.goto(BASE+'/');ok('no-JS: home shows latest news and contact',await np.$$eval('#latest .card',a=>a.length)===6&&(await np.textContent('#cEmail')).includes('info@example.org'));
await np.goto(BASE+'/news/4');ok('no-JS: article body visible',(await np.textContent('.body'))==='เนื้อหา 4');
await nj.close();

const ctx=await b.newContext({locale:'th-TH'});const REQ=[];
await ctx.route(/supabase\.co/,r=>{const u=r.request().url();REQ.push(u);if(u.includes('public_contact'))return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(CONTACT)});return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(q(u))})});
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));
await p.goto(BASE+'/');await p.waitForLoadState('networkidle');
ok('home: uses content from server (no re-render, no news request)',await p.evaluate(()=>document.getElementById('view').getAttribute('data-ssr')==='/')&&!REQ.some(u=>u.includes('site_articles'))&&await p.$$eval('#latest .card',a=>a.length)===6);
ok('home: first load does not move focus to heading (normal page load)',await p.evaluate(()=>document.activeElement===document.body));
ok('home: nav marked, contact order phone/email/hours',await p.evaluate(()=>document.querySelector('nav.main a[aria-current="page"]').textContent==='หน้าแรก'&&[...document.querySelectorAll('#contact p[id]:not(#copy)')].map(x=>x.id).join()==='cName,cPhone,cEmail,cHours'));
await p.click('#latest a[href="/news/1"]');await p.waitForSelector('article.post h1');
ok('click from server page: article opens in page, h1 focused',p.url()===BASE+'/news/1'&&await p.evaluate(()=>document.activeElement===document.querySelector('#view h1')&&document.activeElement.textContent==='เรื่องที่ 1'));
await p.goBack();ok('back: home again (rendered by browser)',await p.waitForSelector('#latest .card',{timeout:5000}).then(()=>true,()=>false)&&(await p.textContent('#view h1')).startsWith('นวดไทย'));
// หน้ารวมจากเซิร์ฟเวอร์ แล้วกดดูเพิ่มเติม
REQ.length=0;await p.goto(BASE+'/news/');await p.waitForLoadState('networkidle');
ok('list from server: 12 items and more button, no request',await p.$$eval('#list .card',a=>a.length)===12&&!!await p.$('button[data-more]')&&!REQ.some(u=>u.includes('site_articles')));
await p.click('button[data-more]');
ok('load more works on server page (15 total)',await p.waitForFunction(()=>document.querySelectorAll('#list .card').length===15&&!document.querySelector('button[data-more]'),null,{timeout:5000}).then(()=>true,()=>false));
// หน้าบทความจากเซิร์ฟเวอร์
await p.goto(BASE+'/news/3');await p.waitForLoadState('networkidle');
ok('article from server: tab title, copy button works',(await p.title())==='เรื่องที่ 3 | สมาคมวิทยากรฝึกอาชีพคนตาบอด'&&(await p.textContent('button[data-copy]'))==='คัดลอกลิงก์');
await p.goto(BASE+'/news/999');ok('missing article from server: not found shown',(await p.textContent('#view h1'))==='ไม่พบหน้านี้');
await p.goto(BASE+'/company/');await p.click('nav.main a[href="/news/"]');
ok('nav from company page to news works',await p.waitForSelector('#list .card',{timeout:5000}).then(()=>true,()=>false)&&p.url()===BASE+'/news/');
console.log('errors:',errs.join('|')||'none');ok('no page errors',errs.length===0);
await b.close();srv.close();fs.rmSync(tmp,{recursive:true,force:true});process.exit(0)})().catch(e=>{console.log('FAIL crash '+e.stack);process.exit(1)});
