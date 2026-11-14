// ลิงก์ชวนร้านนวดแบบสั้น /reg (shop/reg/index.html): การ์ดตัวอย่างลิงก์, เด้งออกจาก LINE, เปิดฟอร์มลงทะเบียน,
// กล่อง "เปิดในเบราว์เซอร์ของเครื่อง" เมื่อยังอยู่ในแอปอื่น และปุ่มแชร์ข้อความชวนต่อ
// ใช้เซิร์ฟเวอร์ http ในเครื่อง (ที่อยู่แบบ /reg ใช้กับ file:// ไม่ได้)
const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const ok=(n,c)=>console.log((c?'PASS ':'FAIL ')+n);const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const ROOT=path.resolve(__dirname,'..','shop'),PORT=8793,BASE='http://127.0.0.1:'+PORT;
const TYPES={'.html':'text/html; charset=utf-8','.js':'application/javascript','.json':'application/json','.png':'image/png','.webmanifest':'application/manifest+json'};
const UA={line:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari Line/13.20.0',
 android:'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36',
 fb:'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36 [FBAN/FB4A;FBAV/440.0]'};
(async()=>{
const hits=[];
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(new URL(q.url,BASE).pathname);hits.push(q.url);
 if(p.endsWith('/'))p+='index.html';const f=path.join(ROOT,p);
 if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){if(fs.existsSync(f+'/index.html')){r.writeHead(301,{location:p+'/'+(new URL(q.url,BASE).search)});return r.end()}r.writeHead(404);return r.end()}
 r.writeHead(200,{'content-type':TYPES[path.extname(f)]||'application/octet-stream'});r.end(fs.readFileSync(f))}).listen(PORT,'127.0.0.1');
await new Promise(r=>srv.once('listening',r));
const b=await chromium.launch(require('./config').launch);const errs=[];
const mk=async ua=>{const ctx=await b.newContext({userAgent:ua,locale:'th-TH',serviceWorkers:'block',viewport:{width:390,height:844}});
 await ctx.route(/supabase\.co/,r=>{const u=new URL(r.request().url()).pathname;
  const J=o=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(o)});
  if(u.endsWith('/rpc/public_contact'))return J({name:'สมาคมทดสอบ',phone:'0989983654'});
  if(u.endsWith('/categories'))return J([{id:'c1',name:'ร้านนวดแผนไทย'}]);
  return J(u.includes('/rpc/')?null:[])});
 const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));return p};

// 1) การ์ดตัวอย่างลิงก์ (LINE/Facebook อ่านจาก HTML โดยไม่รันสคริปต์)
const html=fs.readFileSync(path.join(ROOT,'reg','index.html'),'utf8');
const og=k=>{const m=new RegExp('<meta property="og:'+k+'" content="([^"]*)"').exec(html);return m?m[1]:''};
ok('og: title is the invitation',og('title')==='ขอเชิญร้านนวดเข้าร่วมระบบจองนวดออนไลน์');
ok('og: description mentions licence and GP 10%',og('description').includes('สถานประกอบการเพื่อสุขภาพ')&&og('description').includes('GP) 10%'));
ok('og: absolute image and url on the shop site',/^https:\/\/massage-shop-bna\.pages\.dev\/icon-logo-512\.png$/.test(og('image'))&&og('url')==='https://massage-shop-bna.pages.dev/reg');
ok('og: logo file exists',fs.existsSync(path.join(ROOT,'icon-logo-512.png')));
ok('reg page: noindex and a plain link without script',/noindex/.test(html)&&/<a href="\/\?reg=1">/.test(html));

// 2) เบราว์เซอร์ปกติ: /reg -> ฟอร์มลงทะเบียน
let p=await mk(UA.android);await p.goto(BASE+'/reg');await sleep(1200);
ok('normal browser: /reg opens the registration form',!!(await p.$('#rn'))&&(await p.textContent('body')).includes('ลงทะเบียนร้านนวดใหม่'));
ok('normal browser: address ends at the app root, no reg=1, no LINE param',new URL(p.url()).pathname==='/'&&!/reg=1|openExternalBrowser/.test(p.url()));
ok('normal browser: no open-in-browser box',!(await p.$('#regext')));
// แชร์ข้อความชวนต่อ
await p.evaluate(()=>{window.__sh=null;navigator.share=o=>{window.__sh=o;return Promise.resolve()}});
await p.click('[data-g=invshare]');await sleep(250);let sh=await p.evaluate(()=>window.__sh);
ok('share onward: native share with the full message',!!sh&&sh.title==='ชวนร้านนวดเข้าร่วมระบบจองนวด'&&sh.text.startsWith('ขอเชิญร้านนวดเข้าร่วม "จองคิวนวด" แอปจองนวดออนไลน์\n\n🎁 ร้านที่เข้าร่วมใหม่ รับเครดิต 500 บาท ไว้ใช้หักค่าบริการระบบ')&&!sh.text.includes('สมาคม'));
ok('share onward: short link alone on its own line, then phone',!!sh&&sh.text.includes('\nลงทะเบียนที่นี่\n'+BASE+'/reg\nสอบถามเจ้าหน้าที่: 0989983654')&&!/reg=1|openExternalBrowser/.test(sh.text));
await p.evaluate(()=>{delete navigator.share;window.__cp=null;Object.defineProperty(navigator,'share',{value:undefined,configurable:true});Object.defineProperty(navigator,'clipboard',{value:{writeText:t=>{window.__cp=t;return Promise.resolve()}},configurable:true})});
await p.click('[data-g=invshare]');await sleep(250);
ok('share onward without native share: copies the same text and says so',(await p.evaluate(()=>window.__cp))===sh.text&&(await p.textContent('#invmsg')).includes('คัดลอกข้อความชวนแล้ว'));
await p.context().close();

// 3) เปิดใน LINE: ขอให้ LINE เปิดในเบราว์เซอร์ของเครื่อง (เติม openExternalBrowser=1 ครั้งเดียว)
hits.length=0;p=await mk(UA.line);await p.goto(BASE+'/reg');await sleep(1200);
const regHits=hits.filter(h=>h.startsWith('/reg'));
ok('LINE: /reg reloads once with openExternalBrowser=1',regHits.some(h=>/^\/reg\/?\?openExternalBrowser=1$/.test(h))&&regHits.filter(h=>/openExternalBrowser=1/.test(h)).length===1);
// LINE รุ่นที่ไม่เด้ง: ฟอร์มยังเปิดในแอป พร้อมกล่องให้กดเปิดในเบราว์เซอร์ของเครื่อง
ok('LINE (did not leave): form still opens',!!(await p.$('#rn')));
ok('LINE (did not leave): open-in-browser box above the form with Safari',!!(await p.$('#regext'))&&(await p.textContent('#regext')).includes('เปิดใน Safari')&&await p.evaluate(()=>{const a=document.getElementById('regext'),f=document.getElementById('rn');return !!(a.compareDocumentPosition(f)&Node.DOCUMENT_POSITION_FOLLOWING)}));
ok('LINE: box buttons are open-in-browser and copy link',(await p.textContent('#regext [data-g=insopen]')).trim()==='เปิดในเบราว์เซอร์ของเครื่อง'&&!!(await p.$('#regext [data-g=inscopy]')));
ok('LINE: link shown in the box is the short invite link',(await p.textContent('#regext .insurl')).trim()===BASE+'/reg');
await p.context().close();

// 4) Facebook (ไม่มีคำสั่งเด้ง): ฟอร์มพร้อมกล่อง เปิดใน Chrome
p=await mk(UA.fb);await p.goto(BASE+'/reg');await sleep(1200);
ok('Facebook: form with open-in-Chrome box',!!(await p.$('#rn'))&&(await p.textContent('#regext')).includes('เปิดใน Chrome'));
await p.context().close();

console.log('errors:',errs.join('|')||'none');ok('no page errors',errs.length===0);
await b.close();srv.close();process.exit(0)})();
