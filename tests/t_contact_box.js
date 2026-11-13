// กล่อง "ติดต่อเรา" ในแอปผู้ใช้งาน (ร้านนวดและหมอนวดตรวจใน t_chatsafe_shop.js / t_chatsafe_staff.js): ไม่แสดงชื่อและที่อยู่สมาคม (เลือกแบบ ก 12 พ.ย. 2569)
// มีปุ่มแชตกับเจ้าหน้าที่ (แทน LINE ตั้งแต่ 13 พ.ย. 2569) ปุ่มโทร เวลาทำการ ส่วนท้ายเว็บผู้ใช้งาน (ข้อมูลองค์กร) ยังแสดงชื่อและที่อยู่
const {chromium}=require('playwright');const C=require('./config');
const ok=(n,c)=>console.log((c?'PASS ':'FAIL ')+n);const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const CTD={name:'สมาคมทดสอบ',addr:'99 ถนนทดสอบ เขตทดสอบ',phone:'02-123-4567',line:'https://line.me/R/ti/p/@test',hours:'จันทร์-ศุกร์ 9:00-17:00'};
(async()=>{const b=await chromium.launch(C.launch);const errs=[];
for(const [nm,file,fn] of [['customer','customer-booking.html','ctHtml']]){
 const ctx=await b.newContext({locale:'th-TH'});await ctx.route(/^https?:/,r=>{const u=r.request().url();if(/supabase/.test(u))return r.fulfill({status:200,contentType:'application/json',body:u.includes('/rpc/')?'null':'[]'});return r.abort()});
 const p=await ctx.newPage();p.on('pageerror',e=>errs.push(nm+': '+e.message));await p.goto(C.page(file));await sleep(1200);
 const h=await p.evaluate(([fn,d])=>{if(fn==='ctHtml'){SET.ct=d}else{CT=d;if(typeof S==='undefined'||!S)window.S={}}return eval(fn+'()')},[fn,CTD]);
 ok(nm+': contact box has no association name or address',!h.includes('สมาคมทดสอบ')&&!h.includes('ถนนทดสอบ')&&!h.includes('สมาคมวิทยากรฝึกอาชีพคนตาบอด'));
 ok(nm+': phone, hours and chat-with-staff entry (guest: log in first), no LINE even if an old link is set',h.includes('tel:021234567')&&!h.includes('line.me')&&!h.includes('LINE')&&h.includes('จันทร์-ศุกร์')&&h.includes('ติดต่อเรา')&&h.includes('แชตกับเจ้าหน้าที่')&&h.includes('data-gb="login"'));
 if(nm==='customer'){const f=await p.evaluate(d=>{SET.ct=d;seoCt();return document.getElementById('seoct').textContent},CTD);ok('customer web footer still shows name and address',f.includes('สมาคมทดสอบ')&&f.includes('ถนนทดสอบ'))}
 await ctx.close()}
console.log('errors:',errs.join('|')||'none');ok('no page errors',errs.length===0);await b.close();process.exit(0)})();
