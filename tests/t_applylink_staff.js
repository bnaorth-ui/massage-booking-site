// ลิงก์รับสมัครหมอนวดแบบสั้น /apply (staff/apply/index.html): การ์ดตัวอย่างลิงก์, เด้งออกจาก LINE,
// เปิดประกาศที่รับอยู่ (ไม่มี / มี 1 / มีหลายประกาศให้เลือก), กล่อง "เปิดในเบราว์เซอร์ของเครื่อง" และปุ่มแชร์ประกาศนี้ต่อ
// ใช้เซิร์ฟเวอร์ http ในเครื่อง (ที่อยู่แบบ /apply ใช้กับ file:// ไม่ได้)
const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const ok=(n,c)=>console.log((c?'PASS ':'FAIL ')+n);const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const ROOT=path.resolve(__dirname,'..','staff'),PORT=8794,BASE='http://127.0.0.1:'+PORT;
const TYPES={'.html':'text/html; charset=utf-8','.js':'application/javascript','.json':'application/json','.png':'image/png','.webmanifest':'application/manifest+json'};
const UA={line:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari Line/13.20.0',
 android:'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36'};
const PO={po1:{id:'po1',title:'รับสมัครหมอนวดประจำ',detail:'ย่านกรุงเทพ',slots:5,deadline:'2026-12-31',open:true},
 po2:{id:'po2',title:'รับสมัครหมอนวดรอบเสาร์อาทิตย์',detail:'ย่านนนทบุรี',slots:2,deadline:null,open:true}};
let OPENS=[];
(async()=>{
const hits=[];
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(new URL(q.url,BASE).pathname);hits.push(q.url);
 if(p.endsWith('/'))p+='index.html';const f=path.join(ROOT,p);
 if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){if(fs.existsSync(f+'/index.html')){r.writeHead(301,{location:p+'/'+(new URL(q.url,BASE).search)});return r.end()}r.writeHead(404);return r.end()}
 r.writeHead(200,{'content-type':TYPES[path.extname(f)]||'application/octet-stream'});r.end(fs.readFileSync(f))}).listen(PORT,'127.0.0.1');
await new Promise(r=>srv.once('listening',r));
const b=await chromium.launch(require('./config').launch);const errs=[];
const mk=async ua=>{const ctx=await b.newContext({userAgent:ua,locale:'th-TH',timezoneId:'Asia/Bangkok',serviceWorkers:'block',viewport:{width:390,height:844}});
 await ctx.route(/supabase\.co/,r=>{const q=r.request(),u=new URL(q.url()).pathname;let body=null;try{body=JSON.parse(q.postData()||'null')}catch(e){}
  const J=(o,s)=>r.fulfill({status:s||200,contentType:'application/json',body:JSON.stringify(o)});
  if(u==='/auth/v1/signup')return J({access_token:'at',refresh_token:'rt',expires_in:3600,user:{id:'ua',user_metadata:body.data}});
  if(u.endsWith('/rpc/public_contact'))return J({name:'สมาคมทดสอบ',phone:'0989983654'});
  if(u.endsWith('/rpc/staff_postings_open'))return J(OPENS.map(k=>PO[k]));
  if(u.endsWith('/rpc/staff_posting_get'))return J(PO[body.p_id]||null);
  if(u.endsWith('/rpc/my_staff_applications'))return J([]);
  return J(u.includes('/rpc/')?null:[])});
 const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));return p};
const signup=async p=>{await p.fill('#rfn','สมหญิง');await p.fill('#rln','ใจดี');await p.fill('#rph','0855555555');await p.fill('#rpw','abc12345');await p.fill('#rpw2','abc12345');await p.check('#rpv');await p.click('#agf button[type=submit]')};
const until=async(fn,ms=8000)=>{const t0=Date.now();for(;;){try{if(await fn())return true}catch(e){}if(Date.now()-t0>ms)return false;await sleep(50)}};
const body=p=>p.evaluate(()=>document.body.innerText);

// 1) การ์ดตัวอย่างลิงก์ (LINE/Facebook อ่านจาก HTML โดยไม่รันสคริปต์)
const html=fs.readFileSync(path.join(ROOT,'apply','index.html'),'utf8');
const og=k=>{const m=new RegExp('<meta property="og:'+k+'" content="([^"]*)"').exec(html);return m?m[1]:''};
ok('og: title is the recruitment',og('title')==='รับสมัครหมอนวด สมาคมวิทยากรฝึกอาชีพคนตาบอด');
ok('og: description says apply by mobile in about 3 minutes',og('description').includes('สร้างบัญชีด้วยเบอร์มือถือ')&&og('description').includes('3 นาที'));
ok('og: absolute image and url on the staff site',og('image')==='https://massage-staff-bna.pages.dev/icon-logo-512.png'&&og('url')==='https://massage-staff-bna.pages.dev/apply');
ok('og: logo file exists',fs.existsSync(path.join(ROOT,'icon-logo-512.png')));
ok('apply page: noindex, no shop leftovers, plain link',/noindex/.test(html)&&!/shop|reg=1|ร้านนวดเข้าร่วม/.test(html)&&/<a href="\/\?apply=open">/.test(html));

// 2) เบราว์เซอร์ปกติ มีประกาศเดียว: เปิดหน้าสร้างบัญชี แล้วเข้าใบสมัครของประกาศนั้นทันที
OPENS=['po1'];let p=await mk(UA.android);await p.goto(BASE+'/apply');await p.waitForSelector('#rph',{timeout:6000});
ok('normal browser: /apply opens applicant sign-up',(await body(p)).includes('สร้างบัญชีเพื่อสมัครเป็นหมอนวด'));
ok('normal browser: address ends at app root, no apply= or LINE param',new URL(p.url()).pathname==='/'&&!/apply=|openExternalBrowser/.test(p.url()));
ok('normal browser: no open-in-browser box',!(await p.$('#regext')));
await signup(p);await p.waitForSelector('#apf',{timeout:6000});let t=await body(p);
ok('one open posting: goes straight to its form',t.includes('รับสมัครหมอนวดประจำ')&&t.includes('ปิดรับสมัครวันที่ 31/12/2569')&&!t.includes('เลือกประกาศที่ต้องการสมัคร'));
await p.evaluate(()=>{window.__sh=null;navigator.share=o=>{window.__sh=o;return Promise.resolve()}});
await p.click('[data-ap=share]');await until(()=>p.evaluate(()=>!!window.__sh));let sh=await p.evaluate(()=>window.__sh);
ok('share onward: full announcement from the association',!!sh&&sh.title==='รับสมัครหมอนวดประจำ'&&sh.text.startsWith('สมาคมทดสอบ รับสมัครหมอนวด: รับสมัครหมอนวดประจำ')&&sh.text.includes('\nรับ 5 คน')&&sh.text.includes('ปิดรับสมัครวันที่ 31/12/2569')&&sh.text.includes('สำเนาบัตรคนพิการ'));
ok('share onward: short link alone on its own line, then phone',!!sh&&sh.text.includes('\nสมัครที่นี่\n'+BASE+'/apply\nสอบถาม: 0989983654')&&!/apply=|openExternalBrowser|·/.test(sh.text));
await p.evaluate(()=>{Object.defineProperty(navigator,'share',{value:undefined,configurable:true});window.__cp=null;Object.defineProperty(navigator,'clipboard',{value:{writeText:t=>{window.__cp=t;return Promise.resolve()}},configurable:true})});
await p.click('[data-ap=share]');await until(()=>p.evaluate(()=>!!window.__cp));
ok('share onward without native share: copies the same text and says so',(await p.evaluate(()=>window.__cp))===sh.text&&(await p.textContent('#apshmsg')).includes('คัดลอกข้อความประกาศแล้ว'));
ok('chosen posting remembered for reload',(await p.evaluate(()=>sessionStorage.getItem('sapGo')))==='po1');
await p.context().close();

// 3) ไม่มีประกาศที่เปิดรับ
OPENS=[];p=await mk(UA.android);await p.goto(BASE+'/apply');await p.waitForSelector('#rph',{timeout:6000});await signup(p);
await until(async()=>(await body(p)).includes('ตอนนี้ยังไม่เปิดรับสมัครหมอนวด'));
ok('no open posting: says not recruiting now, no form',(await body(p)).includes('ตอนนี้ยังไม่เปิดรับสมัครหมอนวด')&&!(await p.$('#apf'))&&!(await p.$('[data-ap=share]')));
await p.context().close();

// 4) หลายประกาศ: ให้เลือกก่อน
OPENS=['po1','po2'];p=await mk(UA.android);await p.goto(BASE+'/apply');await p.waitForSelector('#rph',{timeout:6000});await signup(p);
await p.waitForSelector('[data-ap=pick]',{timeout:6000});
const picks=await p.$$eval('[data-ap=pick]',e=>e.map(x=>x.textContent));
ok('several postings: chooser lists each with deadline',(await body(p)).includes('เลือกประกาศที่ต้องการสมัคร')&&picks.length===2&&picks[0].includes('รับสมัครหมอนวดประจำ')&&picks[0].includes('ปิดรับ 31/12/2569')&&picks[1].includes('รอบเสาร์อาทิตย์')&&!(await p.$('#apf')));
await p.click('[data-ap=pick][data-id=po2]');await p.waitForSelector('#apf',{timeout:6000});t=await body(p);
ok('several postings: picking one opens its form',t.includes('รับสมัครหมอนวดรอบเสาร์อาทิตย์')&&t.includes('ย่านนนทบุรี')&&(await p.evaluate(()=>sessionStorage.getItem('sapGo')))==='po2');
await p.context().close();

// 5) เปิดใน LINE: เติม openExternalBrowser=1 ครั้งเดียว ถ้า LINE ไม่เด้ง มีกล่องให้เปิดในเบราว์เซอร์ของเครื่อง
OPENS=['po1'];hits.length=0;p=await mk(UA.line);await p.goto(BASE+'/apply');await p.waitForSelector('#rph',{timeout:6000});
const ah=hits.filter(h=>h.startsWith('/apply'));
ok('LINE: /apply reloads once with openExternalBrowser=1',ah.some(h=>/^\/apply\/?\?openExternalBrowser=1$/.test(h))&&ah.filter(h=>/openExternalBrowser=1/.test(h)).length===1);
ok('LINE (did not leave): open-in-Safari box above the sign-up form',!!(await p.$('#regext'))&&(await p.textContent('#regext')).includes('เปิดใน Safari')&&await p.evaluate(()=>{const a=document.getElementById('regext'),f=document.getElementById('rph');return !!(a.compareDocumentPosition(f)&Node.DOCUMENT_POSITION_FOLLOWING)}));
ok('LINE: box button label and short link shown',(await p.textContent('#regext [data-ins=open]')).trim()==='เปิดในเบราว์เซอร์ของเครื่อง'&&(await p.textContent('#regext .insurl')).trim()===BASE+'/apply');
await p.context().close();

// 6) ลิงก์เก่า ?apply=<รหัส> ยังใช้ได้ และกล่องในแอปพาไปประกาศเดิม
p=await mk(UA.line);await p.goto(BASE+'/?apply=po2&openExternalBrowser=1');await p.waitForSelector('#rph',{timeout:6000});
ok('old link: in-app box keeps the same posting',(await p.textContent('#regext .insurl')).trim()===BASE+'/?apply=po2');
await signup(p);await p.waitForSelector('#apf',{timeout:6000});
ok('old link: opens that posting form directly',(await body(p)).includes('รับสมัครหมอนวดรอบเสาร์อาทิตย์'));
await p.context().close();

console.log('errors:',errs.join('|')||'none');ok('no page errors',errs.length===0);
await b.close();srv.close();process.exit(0)})();
