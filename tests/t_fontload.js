// ฟอนต์ Noto Sans Thai เก็บในเว็บเอง (23 พ.ย. 2569 เดิมดึงจาก Google Fonts ตั้งแต่ 2 พ.ย. แบบไม่บล็อกหน้า)
// ตรวจ: ไม่เรียก Google, โหลดไฟล์ของเว็บเองได้ทั้งตัวปกติและตัวหนา, หน้าแสดงได้แม้ฟอนต์ยังไม่มา, ไฟล์เหมือนกันทั้ง 4 แอป, แคช 1 ปี, มีไฟล์สัญญาอนุญาต
const fs=require('fs'),path=require('path'),crypto=require('crypto');const {chromium}=require('playwright');const C=require('./config');
const R=path.join(__dirname,'..');
(async()=>{const b=await chromium.launch(C.launch);const ok=(n,c)=>console.log((c?'PASS ':'FAIL ')+n);const errs=[];
const APPS=[['customer','customer-booking.html'],['shop','shop-owner.html'],['staff','staff-app.html'],['admin','admin-panel.html']];
const hashes=new Set();
for(const [nm,file] of APPS){
 const html=fs.readFileSync(path.join(R,nm,'index.html'),'utf8'),m=html.match(/href="fonts\/(noto-sans-thai-v\d+\.woff2)"/);
 ok(nm+': preload of own font file',!!m&&html.includes('src:url(fonts/'+m[1]+') format("woff2");font-weight:400 700'));
 ok(nm+': no Google Fonts left',!/fonts\.(googleapis|gstatic)\.com/.test(html));
 const fp=m&&path.join(R,nm,'fonts',m[1]);ok(nm+': font file exists (<40KB)',!!fp&&fs.existsSync(fp)&&fs.statSync(fp).size<40000);
 if(fp&&fs.existsSync(fp))hashes.add(crypto.createHash('md5').update(fs.readFileSync(fp)).digest('hex'));
 ok(nm+': licence (OFL) shipped with the font',fs.existsSync(path.join(R,nm,'fonts','OFL.txt')));
 ok(nm+': _headers caches fonts for a year',/\/fonts\/\*\n  Cache-Control: public, max-age=31536000, immutable/.test(fs.readFileSync(path.join(R,nm,'_headers'),'utf8')));
 // เปิดหน้า: กักไฟล์ฟอนต์ไว้ก่อน หน้าต้องขึ้นได้, แล้วปล่อย ฟอนต์ต้องใช้ได้ทั้ง 400 และ 700
 const ctx=await b.newContext();let ext=0,fontHit=0,release;const gate=new Promise(r=>release=r);
 await ctx.route('**/*',async r=>{const u=new URL(r.request().url());
  if(u.protocol==='file:'){if(/\/fonts\/.*\.woff2$/.test(u.pathname)){fontHit++;await gate}return r.continue()}
  if(/fonts\.(googleapis|gstatic)\.com/.test(u.host))ext++;return r.abort()});
 const p=await ctx.newPage();p.on('pageerror',e=>errs.push(nm+': '+e.message));
 await p.goto(C.page(file),{waitUntil:'domcontentloaded'});
 ok(nm+': content renders while the font is still loading',await p.waitForFunction(()=>document.body&&document.body.innerText.trim().length>0,null,{timeout:4000}).then(()=>true,()=>false));
 release();
 const st=await p.evaluate(async()=>{await document.fonts.load('400 16px "Noto Sans Thai"','ก');await document.fonts.load('700 16px "Noto Sans Thai"','ก');await document.fonts.ready;
  const f=[...document.fonts].filter(x=>x.family.replace(/"/g,'')==='Noto Sans Thai');
  return {n:f.length,loaded:f.every(x=>x.status==='loaded'),c4:document.fonts.check('400 16px "Noto Sans Thai"','สวัสดี 123'),c7:document.fonts.check('700 16px "Noto Sans Thai"','จองคิว'),
   fam:getComputedStyle(document.body).fontFamily}});
 ok(nm+': font loaded from own site (400 and 700)',st.n===1&&st.loaded&&st.c4&&st.c7&&fontHit>=1);
 ok(nm+': body uses Noto Sans Thai first',/^"?Noto Sans Thai/.test(st.fam));
 ok(nm+': no request to Google',ext===0);
 await ctx.close()}
ok('same font file in all 4 apps',hashes.size===1);
console.log('errors:',errs.join('|')||'none');await b.close();process.exit(0)})();
