// หน้าสาธารณะของแอปผู้ใช้งาน /privacy/ และ /delete-account/ (สร้างด้วย tools/gen-legal.js)
// ไฟล์ต้องตรงกับที่สร้างใหม่จากนโยบายในแอป (ถ้า FAIL ให้รัน node tools/gen-legal.js), เปิดได้โดยไม่ต้องเข้าสู่ระบบ, เติมชื่อ/เบอร์จาก public_contact
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');const C=require('./config');
const ok=(n,c)=>console.log((c?'PASS ':'FAIL ')+n);const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const R=path.resolve(__dirname,'..');
(async()=>{
const built=require(path.join(R,'tools','gen-legal.js')).build();
for(const [f,h] of Object.entries(built))ok(f+' is up to date with the in-app policy (else run node tools/gen-legal.js)',fs.existsSync(path.join(R,f))&&fs.readFileSync(path.join(R,f),'utf8')===h);
const b=await chromium.launch(C.launch);const errs=[];
const ctx=await b.newContext({locale:'th-TH',viewport:{width:390,height:844}});const calls=[];
await ctx.route(/^https?:/,r=>{const q=r.request(),u=q.url();if(/rpc\/public_contact/.test(u)){calls.push({u,h:q.headers()});return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({name:'สมาคมทดสอบ',phone:'02-123-4567'})})}return r.abort()});
// นโยบาย: ข้อความเดียวกับในแอป
const app=await ctx.newPage();app.on('pageerror',e=>errs.push(e.message));await app.goto(C.page('customer-booking.html'));await sleep(1200);
const inApp=await app.evaluate(()=>{SET.ct={name:'สมาคมทดสอบ',phone:'02-123-4567'};const d=document.createElement('div');d.innerHTML=pvHtml();return d.textContent.replace(/\s+/g,'')});
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.join(R,'customer','privacy','index.html'));await sleep(500);
const pub=await p.evaluate(()=>document.querySelector('.pv').textContent.replace(/\s+/g,''));
ok('privacy page text equals the in-app policy (with live contact)',pub===inApp);
ok('privacy page: title, one h1, Thai, canonical url',(await p.title()).startsWith('นโยบายความเป็นส่วนตัว')&&(await p.$$('h1')).length===1&&(await p.evaluate(()=>document.documentElement.lang))==='th'&&(await p.getAttribute('link[rel=canonical]','href'))==='https://massage-customer-bna.pages.dev/privacy/');
ok('contact fetched with the public key only (no login token)',calls.length>=1&&!!calls[0].h.apikey&&!calls[0].h.authorization);
ok('contact name and phone filled in',(await p.textContent('header')).includes('สมาคมทดสอบ')&&(await p.textContent('.pv')).includes('สมาคมทดสอบ โทร 02-123-4567'));
ok('links: open app, privacy, delete-account',!!(await p.$('a.home[href="/"]'))&&!!(await p.$('footer a[href="/privacy/"]'))&&!!(await p.$('footer a[href="/delete-account/"]')));
// วิธีลบบัญชี
await p.goto('file://'+path.join(R,'customer','delete-account','index.html'));await sleep(500);let t=await p.textContent('main');
ok('delete page: steps match the app buttons',(await p.textContent('h1'))==='วิธีลบบัญชีผู้ใช้งาน'&&t.includes('"บัญชี"')&&t.includes('"ลบบัญชีของฉัน"')&&t.includes('"ยืนยันลบบัญชีถาวร"')&&(await p.$$('ol li')).length===4);
const appTxt=fs.readFileSync(path.join(R,'customer','index.html'),'utf8');
ok('app still has the buttons the page describes',appTxt.includes('id="delgo">ยืนยันลบบัญชีถาวร<')&&appTxt.includes('data-del="ask" style="margin-top:8px">ลบบัญชีของฉัน<')&&appTxt.includes('["ac","👤","บัญชี"')&&appTxt.includes('data-ag="fp">ลืมรหัสผ่าน<'));
ok('delete page: what is deleted, what is kept, help when locked out with phone',t.includes('ข้อมูลที่ถูกลบทันที')&&t.includes('ข้อมูลที่ยังเก็บไว้')&&t.includes('12 เดือน')&&t.includes('ลืมรหัสผ่าน')&&t.includes('สมาคมทดสอบ โทร 02-123-4567'));
// โหลดเบอร์ไม่ได้: ยังอ่านได้ ชื่อสมาคมเริ่มต้น
const c2=await b.newContext({locale:'th-TH'});await c2.route(/^https?:/,r=>r.abort());const p2=await c2.newPage();p2.on('pageerror',e=>errs.push(e.message));
await p2.goto('file://'+path.join(R,'customer','privacy','index.html'));await sleep(400);
ok('contact unavailable: default association name, no broken text',(await p2.textContent('.pv')).includes('สมาคมวิทยากรฝึกอาชีพคนตาบอด เป็นผู้ดูแลข้อมูล')&&!(await p2.textContent('body')).includes('undefined'));
ok('sitemap lists both pages',['/privacy/','/delete-account/'].every(u=>fs.readFileSync(path.join(R,'customer','sitemap.xml'),'utf8').includes('https://massage-customer-bna.pages.dev'+u)));
console.log('errors:',errs.join('|')||'none');ok('no page errors',errs.length===0);await b.close();process.exit(0)})();
