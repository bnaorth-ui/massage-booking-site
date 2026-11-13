// หัวหน้าแรกแอปผู้ใช้งาน (13 พ.ย. 2569): ค่าเริ่มต้น "จองคิวนวด" กับโลโก้มือประคองใบไม้ที่ฝังในหน้า
// แอดมินตั้งชื่อแอปและโลโก้แอปได้ (app_settings.app_name, app_logo_path ส่งมาใน public_catalog.settings)
// จำค่าล่าสุดไว้ในเครื่อง โหลดไม่ได้ใช้ค่าที่จำไว้ รูปเสียกลับไปใช้โลโก้มาตรฐาน
const {chromium}=require('playwright');const C=require('./config');const fs=require('fs'),path=require('path');
const ok=(n,c)=>console.log((c?'PASS ':'FAIL ')+n);const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const PNG=fs.readFileSync(path.join(__dirname,'..','customer','icon-192.png'));
(async()=>{const b=await chromium.launch(C.launch);const errs=[];
const ctx=await b.newContext({locale:'th-TH',viewport:{width:320,height:700}});
let SETS=null,CATFAIL=false;
await ctx.route(/^https?:/,r=>{const u=r.request().url();
 if(/\/storage\/v1\/object\/public\//.test(u))return u.includes('broken')?r.fulfill({status:404,body:''}):r.fulfill({status:200,contentType:'image/png',body:PNG});
 if(/supabase/.test(u)){if(u.includes('public_catalog'))return CATFAIL?r.fulfill({status:500,body:'{}'}):r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({places:[],services:[],staff:[],promos:[],settings:SETS})});
  return r.fulfill({status:200,contentType:'application/json',body:u.includes('/rpc/')?'null':'[]'})}
 return r.abort()});
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));
const hd=async()=>p.evaluate(()=>{const i=document.getElementById('alogo'),t=document.getElementById('abrand');return{src:i.getAttribute('src'),alt:i.getAttribute('alt'),name:t.textContent,ok:i.complete&&i.naturalWidth>0,cache:localStorage.getItem('brand')}});
await p.goto(C.page('customer-booking.html'));await sleep(1200);
let h=await hd();
ok('default header name is จองคิวนวด',h.name==='จองคิวนวด');
ok('default logo is the built-in leaf logo and it loads',h.src.startsWith('data:image/svg+xml')&&h.ok);
ok('logo is decorative (name read as text instead)',h.alt==='');
ok('association name no longer in the header',!(await p.textContent('header')).includes('สมาคม'));
ok('header name fits on one line at 320px',await p.evaluate(()=>{const t=document.getElementById('abrand');return t.getBoundingClientRect().height<40}));
SETS={association_name:'สมาคมทดสอบ',app_name:'นวดดีใกล้บ้าน',app_logo_path:'place-images/00000000-0000-0000-0000-000000000000/applogo-x.jpg'};
await p.reload();await sleep(1200);h=await hd();
ok('admin app name shown in header',h.name==='นวดดีใกล้บ้าน');
ok('admin app logo shown in header',h.src.includes('/storage/v1/object/public/place-images/00000000-0000-0000-0000-000000000000/applogo-x.jpg')&&h.ok);
ok('remembered on this device',(JSON.parse(h.cache||'{}').n)==='นวดดีใกล้บ้าน');
CATFAIL=true;await p.reload();await sleep(400);h=await hd();
ok('catalog fails: remembered name and logo still shown',h.name==='นวดดีใกล้บ้าน'&&h.src.includes('applogo-x.jpg'));
CATFAIL=false;SETS={app_name:'',app_logo_path:'place-images/x/broken.jpg'};await p.reload();await sleep(1500);h=await hd();
ok('empty name falls back to จองคิวนวด',h.name==='จองคิวนวด');
ok('broken logo falls back to the built-in logo',h.src.startsWith('data:image/svg+xml'));
SETS={app_name:null,app_logo_path:null};await p.reload();await sleep(1200);h=await hd();
ok('settings cleared: default name and logo, cache cleared',h.name==='จองคิวนวด'&&h.src.startsWith('data:image/svg+xml')&&JSON.parse(h.cache).n===''&&JSON.parse(h.cache).l==='');
const ctx2=await b.newContext({locale:'th-TH'});await ctx2.addInitScript(()=>{try{if(!sessionStorage.getItem('s')){sessionStorage.setItem('s','1');localStorage.setItem('brand',JSON.stringify({n:'<b>x</b>',l:'javascript:alert(1)'}))}}catch(e){}});
await ctx2.route(/^https?:/,r=>{const u=r.request().url();if(u.includes('public_catalog'))return;if(/supabase/.test(u))return r.fulfill({status:200,contentType:'application/json',body:'[]'});return r.abort()});
const p2=await ctx2.newPage();p2.on('pageerror',e=>errs.push(e.message));await p2.goto(C.page('customer-booking.html'));await sleep(600);
const h2=await p2.evaluate(()=>({name:document.getElementById('abrand').textContent,src:document.getElementById('alogo').getAttribute('src'),b:!!document.querySelector('header b')}));
ok('bad cached values are not used as html or unsafe links',h2.name==='<b>x</b>'&&h2.src.startsWith('data:image/svg+xml')&&!h2.b);await ctx2.close();
const mf=JSON.parse(fs.readFileSync(path.join(__dirname,'..','customer','manifest.webmanifest'),'utf8'));
ok('manifest has a maskable icon',mf.icons.some(i=>i.purpose==='maskable'&&fs.existsSync(path.join(__dirname,'..','customer',i.src))));
console.log('errors:',errs.join('|')||'none');ok('no page errors',errs.length===0);await b.close();process.exit(0)})();
