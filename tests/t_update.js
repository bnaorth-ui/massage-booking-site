const {chromium}=require('playwright');
const cfg=require('./config');
const APPS=[['customer-booking.html','ผู้ใช้งาน'],['shop-owner.html','ร้านค้า'],['staff-app.html','พนักงาน'],['admin-panel.html','แอดมิน']];
(async()=>{const b=await chromium.launch(cfg.launch);const errs=[];
const ok=(nm,c)=>console.log((c?'PASS ':'FAIL ')+nm);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
// สร้างหน้าใหม่ 1 รอบ: ver = {status,body,delay} คืนค่า {p,ctx,pageHits}
async function open(app,ver,pageRes){
 const ctx=await b.newContext({timezoneId:'Asia/Bangkok',locale:'th-TH'});const st={pageHits:0};
 await ctx.addInitScript(()=>{window.__APP_VER_URL='https://ver.test/version.json';window.__APP_PAGE_URL='https://ver.test/page.html'});
 await ctx.route('**/*',async r=>{const u=new URL(r.request().url());if(u.protocol==='file:')return r.continue();
  if(u.host==='ver.test'&&u.pathname==='/version.json'){if(ver.delay)await sleep(ver.delay);try{return await r.fulfill({status:ver.status||200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:ver.raw!==undefined?ver.raw:JSON.stringify(ver.body)})}catch(e){return}}
  if(u.host==='ver.test'&&u.pathname==='/page2.html'){st.pageHits++;return r.fulfill({status:200,contentType:'text/html; charset=utf-8',headers:{'access-control-allow-origin':'*'},body:'<html>ok</html>'})}
  if(u.host==='ver.test'&&u.pathname==='/page.html'){st.pageHits++;const pr=pageRes||{status:200};return r.fulfill({status:pr.status,contentType:'text/html; charset=utf-8',headers:Object.assign({'access-control-allow-origin':'*'},pr.location?{location:pr.location}:{}),body:'<html></html>'})}
  return r.abort()});
 const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));
 await p.goto(cfg.page(app));return {p,ctx,st}}
const cov=p=>p.$('#updcov');
for(const [app,label] of APPS){
 console.log('--- '+label);const CUR=/name="app-version" content="([^"]+)"/.exec(require('fs').readFileSync(cfg.page(app).replace('file://',''),'utf8'))[1];
 // 1 เลขตรงกัน
 let s=await open(app,{body:{v:CUR,required:false,notes:[]}});await sleep(700);
 ok(label+': same version -> no update screen',(await cov(s.p))===null);await s.ctx.close();
 // 2 ขณะรอผลเช็ก ต้องมีหน้าปิดบัง (ไม่เห็นหน้าแอปเก่า) แล้วหายเมื่อเลขตรง
 s=await open(app,{body:{v:CUR},delay:600});await sleep(150);
 ok(label+': checking cover shown while waiting',!!(await cov(s.p))&&(await s.p.textContent('#updcov')).includes('กำลังตรวจสอบเวอร์ชัน'));
 await sleep(900);ok(label+': cover gone after same-version result',(await cov(s.p))===null);await s.ctx.close();
 // 3 มีเวอร์ชันใหม่ (ปกติ)
 s=await open(app,{body:{v:'9.9',required:false,notes:['ข้อหนึ่ง','ข้อสอง','ข้อสาม','ข้อสี่ห้ามขึ้น']}});await s.p.waitForSelector('#updh',{timeout:3000});
 const t=await s.p.textContent('#updcov');
 ok(label+': update screen has association name, app name, heading',t.includes('สมาคมวิทยากรฝึกอาชีพคนตาบอด')&&t.includes('ระบบจองนวด')&&t.includes('มีเวอร์ชันใหม่ของแอป'));
 ok(label+': shows up to 3 notes only',t.includes('ข้อสาม')&&!t.includes('ข้อสี่ห้ามขึ้น'));
 ok(label+': shows version current -> new',t.includes('เวอร์ชันของคุณ '+CUR+' → ใหม่ 9.9'));
 ok(label+': has update and later buttons',!!(await s.p.$('#updgo'))&&!!(await s.p.$('#updlater')));
 ok(label+': logo is the association logo file',(await s.p.getAttribute('#updcov img','src'))==='icon-logo-192.png');
 ok(label+': dialog semantics + focus on heading',(await s.p.getAttribute('#updcov','role'))==='dialog'&&(await s.p.getAttribute('#updcov','aria-modal'))==='true'&&(await s.p.evaluate(()=>document.activeElement&&document.activeElement.id))==='updh');
 ok(label+': app content behind is inert',await s.p.evaluate(()=>{const e=[...document.body.children].filter(x=>x.tagName!=='SCRIPT');return e.length>0&&e.every(x=>x.inert===true)}));
 await s.p.click('#updlater');ok(label+': later closes screen and un-inerts',(await cov(s.p))===null&&await s.p.evaluate(()=>[...document.body.children].every(x=>x.inert!==true)));
 await s.p.reload();await sleep(700);ok(label+': later remembered for this session (not asked again)',(await cov(s.p))===null);await s.ctx.close();
 // 4 บังคับ
 s=await open(app,{body:{v:'9.9',required:true,notes:['แก้ฐานข้อมูล']}});await s.p.waitForSelector('#updh',{timeout:3000});
 ok(label+': required has no later button',!(await s.p.$('#updlater'))&&(await s.p.textContent('#updcov')).includes('จำเป็นต้องอัปเดตจึงจะใช้งานต่อได้'));
 await s.p.reload();await s.p.waitForSelector('#updh',{timeout:3000});ok(label+': required asked again after reload',true);await s.ctx.close();
 // 5 กดอัปเดต
 s=await open(app,{body:{v:'9.9',required:false}});await s.p.waitForSelector('#updgo',{timeout:3000});
 const nav=s.p.waitForEvent('load',{timeout:5000}).catch(()=>null);await s.p.click('#updgo');await nav;await sleep(900);
 ok(label+': update fetched the page and reloaded',s.st.pageHits===1);
 ok(label+': no loop after update even if version still differs',(await cov(s.p))===null&&(await s.p.evaluate(()=>sessionStorage.getItem('upd-tried')))==='9.9');await s.ctx.close();
 // 6 อัปเดตไม่สำเร็จ
 s=await open(app,{body:{v:'9.9',required:true}},{status:500});await s.p.waitForSelector('#updgo',{timeout:3000});await s.p.click('#updgo');
 await s.p.waitForFunction(()=>document.getElementById('updmsg')&&document.getElementById('updmsg').textContent.includes('อัปเดตไม่สำเร็จ'),null,{timeout:4000});
 ok(label+': failed update shows message and re-enables button',!(await s.p.$eval('#updgo',e=>e.disabled))&&!!(await cov(s.p)));await s.ctx.close();
 // 6c ข้อความล้มเหลวมีรหัส (ไม่ใช่เหมาแล้วว่าไม่มีอินเทอร์เน็ต)
 s=await open(app,{body:{v:'9.9',required:true}},{status:500});await s.p.waitForSelector('#updgo',{timeout:3000});await s.p.click('#updgo');
 await s.p.waitForFunction(()=>document.getElementById('updmsg')&&document.getElementById('updmsg').textContent.includes('อัปเดตไม่สำเร็จ'),null,{timeout:4000});
 ok(label+': server error shows code, not "check internet"',(await s.p.textContent('#updmsg')).includes('รหัส http500')&&!(await s.p.textContent('#updmsg')).includes('สัญญาณอินเทอร์เน็ต'));await s.ctx.close();
 // 7 เช็กช้าเกิน 1.5 วินาที -> เข้าแอปเลย
 s=await open(app,{body:{v:'9.9'},delay:3500});await sleep(2100);
 ok(label+': slow check -> app opens without update screen',(await cov(s.p))===null);await s.ctx.close();
 // 8 ไฟล์เวอร์ชันเสีย
 s=await open(app,{raw:'not json'});await sleep(800);ok(label+': broken version file -> no update screen',(await cov(s.p))===null);await s.ctx.close();
 s=await open(app,{status:500,raw:'x'});await sleep(800);ok(label+': server error -> no update screen',(await cov(s.p))===null);await s.ctx.close();
}
console.log('errors:',errs.join('|')||'none');await b.close();process.exit(0)})();
