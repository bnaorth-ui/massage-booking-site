// ตรวจเว็บจริงทั้ง 4 แอปทุกเช้า (GitHub Actions: .github/workflows/live-check.yml)
// ไม่ใช่ข้อสอบในชุด run-all.js (ชื่อไม่ขึ้นต้นด้วย t_) เพราะต้องต่ออินเทอร์เน็ตและฐานข้อมูลจริง
// อ่านอย่างเดียว: เปิดหน้าแรก/หน้าล็อกอิน ไม่ล็อกอิน ไม่สร้างหรือแก้ข้อมูลใดๆ
// ใช้: node live_check.js   (ตั้ง LIVE_BASE=http://localhost:8800/{app}/ เพื่อลองกับเซิร์ฟเวอร์ในเครื่อง, LIVE_MOCK=1 ให้ตอบ Supabase แทน)
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const ROOT=path.resolve(__dirname,'..');
const APPS=[
 {app:'customer',name:'ผู้ใช้งาน',host:'massage-customer-bna'},
 {app:'shop',name:'ร้านนวด',host:'massage-shop-bna'},
 {app:'staff',name:'หมอนวด',host:'massage-staff-bna'},
 {app:'admin',name:'แอดมิน',host:'massage-admin-bna'}];
const urlOf=a=>process.env.LIVE_BASE?process.env.LIVE_BASE.replace('{app}',a.app):`https://${a.host}.pages.dev/`;
const fails=[];let passN=0;
const ok=(n,c,why)=>{if(c){passN++;console.log('PASS '+n)}else{fails.push(n+(why?' ('+why+')':''));console.log('FAIL '+n+(why?' ('+why+')':''))}};
(async()=>{const b=await chromium.launch(require('./config').launch);
for(const a of APPS){
 const L=a.name+': ',want=JSON.parse(fs.readFileSync(path.join(ROOT,a.app,'version.json'),'utf8')).v;
 const ctx=await b.newContext({locale:'th-TH',timezoneId:'Asia/Bangkok',serviceWorkers:'block',viewport:{width:390,height:844}});
 const pageErrs=[],badOwn=[],sb={};
 if(process.env.LIVE_MOCK)await ctx.route(/supabase\.co/,r=>{const u=new URL(r.request().url()).pathname;r.fulfill({status:200,contentType:'application/json',body:u.endsWith('/public_catalog')?JSON.stringify({places:[{id:'x',type:'shop',name:'ร้านทดสอบ',active:true,status:'approved',open_days:[0,1,2,3,4,5,6],open_time:'10:00:00',close_time:'21:00:00'}],services:[],staff:[],settings:{}}):u.endsWith('/admin_exists')?'true':'null'})});
 const p=await ctx.newPage();
 p.on('pageerror',e=>pageErrs.push(e.message));
 p.on('response',r=>{const u=new URL(r.url());
  if(/supabase\.co$/.test(u.host)){const k=u.pathname.split('/').pop();if(!sb[k]||r.status()>=400)sb[k]=r.status()}
  else if(u.origin===new URL(urlOf(a)).origin&&r.status()>=400)badOwn.push(r.status()+' '+u.pathname)});
 let res=null;try{res=await p.goto(urlOf(a),{waitUntil:'domcontentloaded',timeout:45000})}catch(e){}
 ok(L+'เปิดหน้าเว็บได้',!!res&&res.status()<400,res?'HTTP '+res.status():'เปิดไม่ได้');
 if(!res){await ctx.close();continue}
 await p.waitForTimeout(6000);
 const live=await p.evaluate(()=>{const m=document.querySelector('meta[name="app-version"]');return m?m.content:''});
 ok(L+'เวอร์ชันบนเว็บตรงกับ GitHub ('+want+')',live===want,'บนเว็บเป็น '+(live||'ไม่พบ'));
 const st=await p.evaluate(()=>({forms:document.querySelectorAll('input[type=password]').length,btn:document.querySelectorAll('button').length,text:document.body.innerText.trim().length,err:window.ErrLog?1:0}));
 ok(L+'หน้าแสดงเนื้อหาและปุ่ม',st.text>40&&st.btn>0,'ข้อความ '+st.text+' ตัว, ปุ่ม '+st.btn);
 ok(L+'ตัวรายงานข้อผิดพลาดโหลดแล้ว',st.err===1);
 if(a.app==='customer'){
  ok(L+'ดึงรายการร้านจากฐานข้อมูลได้',sb.public_catalog===200,'public_catalog '+(sb.public_catalog||'ไม่ได้เรียก'));
  const shops=await p.$$eval('[data-pl]',e=>e.length).catch(()=>0);
  console.log('     (หน้าแรกแสดงร้าน '+shops+' ร้าน)');
 }else{
  ok(L+'มีช่องรหัสผ่านสำหรับเข้าสู่ระบบ',st.forms>0);
 }
 if(a.app==='admin')ok(L+'ฐานข้อมูลตอบ admin_exists',sb.admin_exists===200,'admin_exists '+(sb.admin_exists||'ไม่ได้เรียก'));
 const sbBad=Object.entries(sb).filter(([k,s])=>s>=500);
 ok(L+'ฐานข้อมูลไม่ตอบผิดพลาด (5xx)',!sbBad.length,sbBad.map(([k,s])=>k+' '+s).join(', '));
 ok(L+'ไฟล์ของเว็บโหลดครบ',!badOwn.length,badOwn.join(', '));
 ok(L+'ไม่มีข้อผิดพลาดของสคริปต์',!pageErrs.length,pageErrs.slice(0,3).join(' | '));
 await ctx.close();
}
await b.close();
console.log('\n== สรุป: ผ่าน '+passN+' ข้อ, ไม่ผ่าน '+fails.length+' ข้อ');
if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,'## ตรวจเว็บจริงประจำวัน\n\nผ่าน '+passN+' ข้อ, ไม่ผ่าน '+fails.length+' ข้อ\n\n'+fails.map(f=>'- '+f).join('\n')+'\n');
if(fails.length)fs.writeFileSync(path.join(__dirname,'live_fail.md'),'การตรวจเว็บจริงประจำวันพบปัญหา '+fails.length+' ข้อ\n\n'+fails.map(f=>'- '+f).join('\n')+'\n\nเวลาตรวจ: '+new Date().toLocaleString('th-TH',{timeZone:'Asia/Bangkok'})+' น.\n');
process.exit(fails.length?1:0)})();
