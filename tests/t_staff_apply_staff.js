const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch(require('./config').launch);
const ctx=await b.newContext({timezoneId:'Asia/Bangkok',locale:'th-TH'});const errs=[];
const AND='Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36';
const SUBM=[],MINE=[],SIGN=[];let PO={id:'po1',title:'รับสมัครหมอนวดประจำ',detail:'เปิดรับ 5 คน ย่านกรุงเทพ',slots:5,deadline:null,open:true},users={};
const THF=require('fs').readFileSync(require('path').join(__dirname,'..','staff','th-address.json'));let THFAIL=false;
await ctx.route('**/*',async r=>{const q=r.request(),u=new URL(q.url());if(u.protocol==='file:')return r.continue();if(!u.host.endsWith('supabase.co'))return r.abort();
 const path=u.pathname;let body=null;try{body=JSON.parse(q.postData()||'null')}catch(e){}
 const J=(s,o)=>r.fulfill({status:s,contentType:'application/json',body:JSON.stringify(o)});
 const auth=(q.headers().authorization||'').replace('Bearer ','');
 if(path==='/auth/v1/signup'){SIGN.push(body);const ph=body.email.split('@')[0];users[ph]={id:'ua',pw:body.password};return J(200,{access_token:'at-ua',refresh_token:'rt-ua',expires_in:3600,user:{id:'ua',user_metadata:body.data}})}
 if(path==='/auth/v1/token'){return J(200,{access_token:'at-ua',refresh_token:'rt-ua',expires_in:3600,user:{id:'ua',user_metadata:{first_name:'สมหญิง',last_name:'ใจดี',phone:'0855555555'}}})}
 if(path==='/auth/v1/logout')return J(204,{});
 if(auth!=='at-ua')return J(401,{message:'JWT'});
 const rm=path.match(/^\/rest\/v1\/rpc\/(\w+)/);
 if(rm){const f=rm[1];
  if(f==='staff_me')return J(200,null);
  if(f==='staff_posting_get')return J(200,body.p_id==='po1'?PO:null);
  if(f==='my_staff_applications')return J(200,MINE);
  if(f==='staff_application_submit'){SUBM.push(body);MINE.unshift({id:'sa1',title:PO.title,status:'new',admin_note:null});return J(200,'sa1')}
  return J(404,{message:'nf '+f})}
 return J(404,{message:'nf '+path})});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const ok=(n,c)=>console.log((c?'PASS ':'FAIL ')+n);
const URLB=require('./config').page('staff-app.html');
async function mk(query){const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(e.message));pg.on('dialog',d=>{errs.push('DIALOG '+d.message());d.dismiss()});
 await pg.addInitScript(u=>{Object.defineProperty(navigator,'userAgent',{get:()=>u});},AND);
 await pg.goto(URLB+query);await pg.evaluate(()=>{localStorage.clear();sessionStorage.clear()});await pg.goto(URLB+query);await sleep(500);return pg}
await ctx.route('**/th-address.json',r=>THFAIL?r.fulfill({status:500,body:'x',headers:{'access-control-allow-origin':'*'}}):r.fulfill({status:200,contentType:'application/json',body:THF,headers:{'access-control-allow-origin':'*'}}));
const p=await mk('?apply=po1');
let t=await p.evaluate(()=>document.body.innerText);
ok('apply link opens applicant registration (not staff login)',t.includes('สร้างบัญชีเพื่อสมัครเป็นหมอนวด')&&!!(await p.$('#rph')));
await p.fill('#rfn','สมหญิง');await p.fill('#rln','ใจดี');await p.fill('#rph','0855555555');await p.fill('#rpw','abc12345');await p.fill('#rpw2','abc12345');await p.check('#rpv');await p.click('#agf button[type=submit]');
await p.waitForSelector('#apf',{timeout:6000});
t=await p.evaluate(()=>document.body.innerText);
ok('not blocked by denied screen; form shown with posting',!t.includes('ยังไม่ผูกกับพนักงาน')&&t.includes('รับสมัครหมอนวดประจำ')&&t.includes('เปิดรับ 5 คน'));
ok('docs list 5 sets + photos',t.includes('อย่างละ 5 ชุด')&&t.includes('สำเนาบัตรคนพิการ')&&t.includes('255 ชั่วโมง')&&t.includes('รูปถ่าย 1 นิ้ว จำนวน 5 รูป'));
ok('only Mon-Fri; removed fields absent',(await p.$$('[data-apwd]')).length===5&&!t.includes('วันที่เริ่มงาน')&&!t.includes('ช่วงเวลา')&&!t.includes('รูปแบบงานที่สนใจ')&&!t.includes('รูปแบบการนวดที่ทำได้'));
ok('prefilled name/phone',(await p.inputValue('#ap_name'))==='สมหญิง ใจดี'&&(await p.inputValue('#ap_phone'))==='0855555555');
const sub=async()=>{await p.click('[data-ap=send]');await sleep(250)};
const er=async()=>await p.textContent('#ap_err');
await sub();ok('province required',(await er()).includes('จังหวัดและเขตหรืออำเภอ')&&SUBM.length===0);
await p.waitForSelector('#ap_prov option:nth-child(70)',{state:'attached'});
ok('77 provinces; amphoe disabled-ish until province',(await p.$$('#ap_prov option')).length===78&&(await p.$$('#ap_amp option')).length===1&&(await p.textContent('label[for=ap_amp]')).includes('อำเภอ'));
await p.selectOption('#ap_prov','กรุงเทพมหานคร');await sleep(250);
ok('bangkok labels เขต/แขวง; focus moves to amphoe',(await p.textContent('label[for=ap_amp]')).includes('เขต')&&(await p.textContent('label[for=ap_tmb]')).includes('แขวง')&&(await p.evaluate(()=>document.activeElement.id))==='ap_amp'&&(await p.$$('#ap_amp option')).length>40);
await sub();ok('amphoe still required',(await er()).includes('จังหวัดและเขตหรืออำเภอ'));
await p.selectOption('#ap_amp','บางรัก');await sleep(250);
ok('tambon list filled; focus to tambon',(await p.evaluate(()=>document.activeElement.id))==='ap_tmb'&&(await p.$$('#ap_tmb option')).length>1);
await p.selectOption('#ap_prov','เชียงใหม่');await sleep(250);
ok('change province resets amphoe/tambon; labels อำเภอ/ตำบล',(await p.inputValue('#ap_amp'))===''&&(await p.inputValue('#ap_tmb'))===''&&(await p.textContent('label[for=ap_amp]')).includes('อำเภอ')&&(await p.textContent('label[for=ap_tmb]')).includes('ตำบล'));
await p.selectOption('#ap_prov','กรุงเทพมหานคร');await sleep(200);await p.selectOption('#ap_amp','บางรัก');await sleep(200);
await p.selectOption('#ap_tmb',{index:1});await p.fill('#ap_addr','99 ถ.สีลม');await sub();ok('experience required',(await er()).includes('ประสบการณ์'));
await p.check('[name=ap_exp][value=gt3]');await sub();ok('course required',(await er()).includes('ใบรับรอง'));
await p.check('[name=ap_course][value=other]');await p.waitForSelector('#ap_co');await sub();ok('other course name required',(await er()).includes('หลักสูตรอื่น'));
await p.check('[name=ap_course][value=hss255]');await sleep(200);ok('other box hidden again',!(await p.$('#ap_co')));
await sub();ok('disability card required',(await er()).includes('บัตรคนพิการ'));
await p.check('[name=ap_dc][value=y]');await sub();ok('registration required',(await er()).includes('ใบขึ้นทะเบียน'));
await p.check('[name=ap_hr][value=n]');await sub();ok('weekday required',(await er()).includes('วันที่ทำได้'));
await p.check('[data-apwd="1"]');await p.check('[data-apwd="5"]');await sub();ok('travel required',(await er()).includes('เดินทาง'));
await p.check('[name=ap_tr][value=guide]');await sub();ok('consent required',(await er()).includes('นโยบายความเป็นส่วนตัว')&&SUBM.length===0);
await p.check('#ap_terms');await sub();await sleep(600);
ok('submitted with right payload',SUBM.length===1&&SUBM[0].p_posting==='po1'&&SUBM[0].p.province==='กรุงเทพมหานคร'&&SUBM[0].p.amphoe==='บางรัก'&&!!SUBM[0].p.tambon&&SUBM[0].p.address==='99 ถ.สีลม'&&SUBM[0].p.area===undefined&&SUBM[0].p.experience==='gt3'&&SUBM[0].p.course==='hss255'&&SUBM[0].p.has_disability_card===true&&SUBM[0].p.has_hss_reg===false&&JSON.stringify(SUBM[0].p.weekdays)==='[1,5]'&&SUBM[0].p.travel==='guide'&&SUBM[0].p.consent==='true');
t=await p.evaluate(()=>document.body.innerText);
ok('success: message, status, docs, no form',t.includes('ส่งใบสมัครแล้ว')&&t.includes('รอสมาคมตรวจสอบ')&&t.includes('อย่างละ 5 ชุด')&&!(await p.$('#apf')));
ok('install-app box shown inline (staff app install)',t.includes('ติดตั้งแอปรับงานพนักงาน'));
ok('no dialog popups',errs.every(e=>!e.startsWith('DIALOG')));
await p.reload();await sleep(900);t=await p.evaluate(()=>document.body.innerText);
ok('reopen app later (no link): still shows application status, not denied',t.includes('ใบสมัครหมอนวดของฉัน')&&t.includes('รอสมาคมตรวจสอบ')&&!t.includes('ยังไม่ผูกกับพนักงาน'));
console.log('errors:',errs.join('|')||'none');await b.close();process.exit(0)
})()
