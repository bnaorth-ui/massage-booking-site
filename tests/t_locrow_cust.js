// แถวตำแหน่งหน้าแรก (แอปผู้ใช้งาน 13 พ.ย. 2569): บรรทัดแรกเป็นข้อความ "แสดงร้านใกล้..." บรรทัดที่สองเป็นปุ่ม
// ปุ่ม: ใช้ตำแหน่งของฉัน / ค้นหาสถานที่ (รวมกับเลือกจุดบนแผนที่) / ร้านทั้งหมด (เดิม ไม่ใช้ตำแหน่ง ขึ้นเมื่อมีตำแหน่ง)
const {chromium}=require('playwright');const C=require('./config');
const ok=(n,c)=>console.log((c?'PASS ':'FAIL ')+n);const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await chromium.launch(C.launch);const errs=[];
const ctx=await b.newContext({locale:'th-TH',viewport:{width:390,height:844}});
const CAT={places:[{id:'p1',name:'ร้านหนึ่ง',type:'shop',lat:13.7,lng:100.5,open:true}],services:[],staff:[],promos:[]};
await ctx.route(/^https?:/,r=>{const u=r.request().url();if(/supabase/.test(u))return r.fulfill({status:200,contentType:'application/json',body:u.includes('public_catalog')?JSON.stringify(CAT):u.includes('/rpc/')?'null':'[]'});return r.abort()});
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto(C.page('customer-booking.html'));await sleep(1500);
const st=async(fn)=>{await p.evaluate(fn);await p.evaluate(()=>render(true));await sleep(150);return{l:(await p.textContent('#locl')).trim(),b:await p.$$eval('.loc button',e=>e.map(x=>x.dataset.loc+':'+x.textContent.trim()))}};
let r=await st(()=>{V.loc=null;V.manual=false;V.locName="";V.kind="shop"});
ok('no location: label says all shops, two buttons',r.l==='📍 แสดงร้านทั้งหมด ระบุตำแหน่งเพื่อดูร้านใกล้คุณ'&&r.b.join('|')==='gps:ใช้ตำแหน่งของฉัน|find:ค้นหาสถานที่');
r=await st(()=>{V.loc={lat:13.7,lng:100.5};V.manual=false;V.locName=""});
ok('gps, no name yet',r.l==='📍 แสดงร้านใกล้ตำแหน่งของคุณ'&&r.b.join('|')==='gps:อัปเดตตำแหน่ง|find:ค้นหาสถานที่|reset:ร้านทั้งหมด');
r=await st(()=>{V.manual=true;V.locName=""});
ok('chosen point, no name yet',r.l==='📍 แสดงร้านใกล้จุดที่คุณเลือก'&&r.b.join('|')==='gps:กลับไปใช้ตำแหน่งของฉัน|find:เปลี่ยนสถานที่|reset:ร้านทั้งหมด');
r=await st(()=>{V.locName="ซอยสุขุมวิท 21 เขตวัฒนา"});
ok('with place name',r.l==='📍 แสดงร้านใกล้: ซอยสุขุมวิท 21 เขตวัฒนา'&&(await p.textContent('#locnm'))==='ซอยสุขุมวิท 21 เขตวัฒนา');
ok('label is plain text (not a button), pin emoji hidden from screen readers',await p.evaluate(()=>{const l=document.getElementById('locl');return l.tagName==='P'&&!l.querySelector('button')&&l.querySelector('[aria-hidden=true]').textContent.includes('📍')}));
ok('buttons on their own line below the label',await p.evaluate(()=>{const l=document.getElementById('locl').getBoundingClientRect(),b=document.querySelector('.loc button').getBoundingClientRect();return b.top>=l.bottom-1}));
ok('no separate map button any more',!(await p.$('[data-loc=map]')));
r=await st(()=>{V.kind="org"});
ok('organization tab: wording uses หน่วยงาน',r.l==='📍 แสดงหน่วยงานใกล้: ซอยสุขุมวิท 21 เขตวัฒนา'&&r.b.includes('reset:หน่วยงานทั้งหมด'));
await st(()=>{V.kind="shop"});await p.click('[data-loc=reset]');await sleep(300);
ok('all shops button: location cleared, label updated, focus on first button',(await p.textContent('#locl')).includes('แสดงร้านทั้งหมด')&&!(await p.$('[data-loc=reset]'))&&(await p.evaluate(()=>document.activeElement&&document.activeElement.dataset.loc))==='gps');
ok('announced for screen readers',(await p.evaluate(()=>new Promise(r=>setTimeout(()=>r((document.querySelector('#sr')||{}).textContent||''),200)))).includes('แสดงร้านทั้งหมดแล้ว'));
console.log('errors:',errs.join('|')||'none');ok('no page errors',errs.length===0);await b.close();process.exit(0)})();
