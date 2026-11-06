const {chromium}=require('playwright');require('./config').pinClock();
const PNG=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==','base64');
(async()=>{const b=await chromium.launch(require('./config').launch);
const ctx=await b.newContext({timezoneId:'Asia/Bangkok',locale:'th-TH'});await require('./config').pinCtx(ctx);const errs=[],calls=[],stor=[];
const H7=7*3600000,bkDate=t=>new Date(t+H7).toISOString().slice(0,10);
const todayS=bkDate(Date.now()),addD=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*86400000).toISOString().slice(0,10);
const at=(d,m)=>new Date(Date.parse(d+'T00:00:00+07:00')+m*60000).toISOString();
const users={'0844444444':{id:'u1',pw:'staffpass1',phone:'0844444444',name:'นุ่น'},'0899999999':{id:'u9',pw:'nopass111',phone:'0899999999',name:'คนนอก'}};
const ST={id:'s1',user:'u1',name:'คุณนุ่น',phone:'0844444444',photo_path:null,accepting:true,work_days:[0,1,2,3,4,5,6]};
let n=100;
let items=[
 {id:'i1',ref:'MS100001',bstatus:'confirmed',active:true,job:'pending',service:'นวดไทย',minutes:60,starts_at:at(todayS,23*60),ends_at:at(todayS,24*60),price:400,customer:'สมศรี ใจดี',phone:'0811111111',place:'ร้านสบายดี สปา'},
 {id:'i2',ref:'MS100002',bstatus:'confirmed',active:true,job:'pending',service:'นวดเท้า',minutes:60,starts_at:at(addD(todayS,1),600),ends_at:at(addD(todayS,1),660),price:300,customer:'วิชัย',phone:'0822222222',place:'ร้านสบายดี สปา'},
 {id:'i3',ref:'MS100003',bstatus:'cancelled',active:false,job:'pending',service:'นวดไทย',minutes:60,starts_at:at(todayS,23*60-120),ends_at:at(todayS,23*60-60),price:400,customer:'ยกเลิกนะ',phone:null,place:'ร้านสบายดี สปา'}];
let nts=[{id:'n1',audience:'staff',staff_id:'s1',kind:'booking',title:'คิวใหม่',body:'เลขที่ MS100002',created_at:new Date().toISOString()}];
let anns=[{id:'a1',title:'ประชุมพนักงาน',body:'วันศุกร์ 10 โมง',audiences:['พนักงาน'],day:todayS,active:true,created_at:new Date(Date.now()-3600000).toISOString()},{id:'a2',title:'ไม่ใช่ของเรา',body:'x',audiences:['ผู้ใช้งาน'],day:todayS,active:true,created_at:new Date().toISOString()}];
let reads=[],blocks=[],mode={},incCalls=[],pwPut=[];
const thisM=todayS.slice(0,7),prevM=(()=>{let y=+thisM.slice(0,4),m=+thisM.slice(5,7)-1;m--;if(m<0){m=11;y--}return y+'-'+String(m+1).padStart(2,'0')})();
const INCROWS=[
 {id:'x1',ref:'R1',service:'นวดไทย',starts_at:at(thisM+'-01',600),place:'ร้านสบายดี สปา',list_price:400,pct:50,share:200},
 {id:'x2',ref:'R2',service:'นวดเท้า',starts_at:at(thisM+'-01',720),place:'ร้านสบายดี สปา',list_price:300,pct:50,share:150},
 {id:'x3',ref:'R3',service:'นวดน้ำมัน',starts_at:at(thisM+'-01',900),place:'ร้านสบายดี สปา',list_price:500,pct:null,share:null},
 {id:'x4',ref:'R4',service:'นวดคอ',starts_at:at(prevM+'-15',600),place:'ร้านสบายดี สปา',list_price:200,pct:40,share:80}];
await ctx.route('**/*',async r=>{const q=r.request(),u=new URL(q.url());if(u.protocol==='file:')return r.continue();if(!u.host.endsWith('supabase.co'))return r.abort();
 const m=q.method(),path=u.pathname,sp=u.searchParams;let body=null;try{body=JSON.parse(q.postData()||'null')}catch(e){}
 const auth=(q.headers().authorization||'').replace('Bearer ',''),me=Object.values(users).find(x=>'at-'+x.id===auth);calls.push({m,path,q:u.search,body});
 const J=(s,o)=>r.fulfill({status:s,contentType:'application/json',body:JSON.stringify(o)});
 if(mode.net)return r.abort();
 const sess=us=>({access_token:'at-'+us.id,refresh_token:'rt-'+us.id,expires_in:3600,user:{id:us.id}});
 if(path==='/auth/v1/signup'){const ph=body.email.split('@')[0];if(users[ph])return J(422,{error_code:'user_already_exists',msg:'User already registered'});const id='u'+(++n);users[ph]={id,pw:body.password,phone:ph,name:body.data.first_name};return J(200,sess(users[ph]))}
 if(path==='/auth/v1/token'){if(sp.get('grant_type')==='refresh_token'){const x=Object.values(users).find(z=>'rt-'+z.id===body.refresh_token);return x?J(200,sess(x)):J(400,{error_code:'bad',msg:'bad'})}
  const us=users[body.email.split('@')[0]];if(!us||us.pw!==body.password)return J(400,{error_code:'invalid_credentials',msg:'Invalid login credentials'});return J(200,sess(us))}
 if(path==='/auth/v1/user'&&m==='PUT'){if(!me)return J(401,{msg:'JWT'});if(body.password===me.pw)return J(422,{error_code:'same_password',msg:'New password should be different from the old password.'});me.pw=body.password;pwPut.push(body.password);return J(200,{id:me.id})}
 if(path==='/auth/v1/logout')return J(204,{});
 if(path.startsWith('/storage/v1/object/')){stor.push(path);return J(200,{Key:'k'})}
 if(!me)return J(401,{message:'JWT'});
 const rm=path.match(/^\/rest\/v1\/rpc\/(\w+)/);
 if(rm){const f=rm[1],isS=me.id==='u1';
  if(f==='staff_me')return J(200,isS?{id:'s1',name:ST.name,phone:ST.phone,photo_path:ST.photo_path,active:true,accepting:ST.accepting,work_days:ST.work_days,place:'ร้านสบายดี สปา',open_min:600,close_min:1260}:null);
  if(!isS)return J(400,{code:'P0001',message:'บัญชีนี้ไม่ใช่พนักงาน'});
  if(f==='my_jobs')return J(200,items);
  if(f==='staff_income'){incCalls.push(body);if(mode.incOff)return J(404,{message:'Could not find the function public.staff_income in the schema cache'});if(mode.incErr)return J(500,{message:'boom'});const fr=Date.parse(body.p_from),to=Date.parse(body.p_to);return J(200,INCROWS.filter(x=>{const t=Date.parse(x.starts_at);return t>=fr&&t<to}))}
  if(f==='staff_save_self'){if(!body.p_work_days.length)return J(400,{code:'P0001',message:'ต้องเลือกวันทำงานอย่างน้อย 1 วัน'});ST.accepting=body.p_accepting;ST.work_days=body.p_work_days;if(!body.p_keep_photo)ST.photo_path=body.p_photo;return J(204,null)}
  if(f==='set_job_status'){const it=items.find(i=>i.id===body.p_item);const R={pending:0,accepted:1,in_progress:2,done:3};if(!it||R[body.p_status]<=R[it.job])return J(400,{code:'P0001',message:'สถานะงานย้อนกลับไม่ได้'});it.job=body.p_status;if(body.p_status==='done')it.bstatus='completed';return J(204,null)}
  return J(404,{message:'no rpc '+f})}
 const tb=path.replace('/rest/v1/','');
 if(tb==='staff_days_off')return J(200,[{day:addD(todayS,3)}]);
 if(tb==='staff_blocks')return J(200,blocks);
 if(tb==='notifications')return J(200,nts);
 if(tb==='notification_reads'){if(m==='POST'){body.forEach(x=>{if(!reads.includes(x.notification_id))reads.push(x.notification_id)});return J(201,null)}return J(200,reads.map(x=>({notification_id:x})))}
 if(tb==='announcements')return J(200,anns);
 return J(404,{message:'nf '+path})});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const ok=(nm,c)=>console.log((c?'PASS ':'FAIL ')+nm);
const URLB=require('./config').page('staff-app.html');
const UAS={desk:null,android:'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36',line:'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36 Line/13.0.0',ios:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1',iosline:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Line/13.0.0'};
async function mk(ua,query,clear=true){const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(e.message));pg.on('dialog',d=>{errs.push('DIALOG '+d.message());d.dismiss()});
 if(ua)await pg.addInitScript(u=>{Object.defineProperty(navigator,'userAgent',{get:()=>u});},ua);
 await pg.goto(URLB+(query||''));if(clear){await pg.evaluate(()=>localStorage.clear());await pg.goto(URLB+(query||''))}await sleep(400);return pg}
const T0=async pg=>await pg.evaluate(()=>document.body.innerText);

const sleep2=sleep;
let p=await mk(null,'');
await p.fill('#lph','0844444444');await p.fill('#lpw','staffpass1');await p.click('#agf .btn');await sleep(700);
let nav=await p.evaluate(()=>[...document.querySelectorAll('#nav button')].map(b=>b.innerText.replace(/\s+/g,' ').trim()));
console.log(nav.join(' | '));
ok('nav order: ... ตารางงาน, รายได้, การแจ้งเตือน, บัญชี',nav.length===5&&nav[2].includes('รายได้')&&nav[3].includes('การแจ้งเตือน'));
await p.click('#nav button:nth-child(3)');await sleep(500);
let t=await T0(p);
ok('income header',t.includes('รายได้ของฉัน'));
ok('total 350 (200+150) shown',t.includes('350 บาท'));
ok('3 jobs',t.includes('3 งาน'));
ok('1 job without share noted',t.includes('มี 1 งานที่ยังไม่มียอดส่วนแบ่ง'));
ok('row detail price x pct',t.includes('ราคาเต็ม 400 × 50%'));
ok('no customer data',!t.includes('สมศรี'));
ok('next disabled on current month',await p.$eval('[data-a=incnext]',e=>e.disabled));
ok('rpc called with 1st of month range',incCalls.length>=1&&incCalls[0].p_from.slice(0,7)===new Date(Date.parse(thisM+'-01T00:00:00+07:00')).toISOString().slice(0,7));
await p.screenshot({path:'inc_staff.png',fullPage:true});
await p.click('[data-a=incprev]');await sleep(500);t=await T0(p);
ok('prev month shows 80 บาท 1 งาน',t.includes('80 บาท')&&t.includes('1 งาน')&&!t.includes('350 บาท'));
ok('next enabled now',await p.$eval('[data-a=incnext]',e=>!e.disabled));
await p.click('[data-a=incnext]');await sleep(500);t=await T0(p);ok('back to current 350',t.includes('350 บาท'));
mode.incErr=true;await p.click('#nav button:nth-child(1)');await p.click('#nav button:nth-child(3)');await sleep(500);t=await T0(p);
ok('error + retry',t.includes('โหลดรายได้ไม่สำเร็จ')&&t.includes('ลองใหม่'));
mode.incErr=false;await p.click('[data-a=incretry]');await sleep(500);ok('retry ok',(await T0(p)).includes('350 บาท'));
mode.incOff=true;await p.click('#nav button:nth-child(1)');await p.click('#nav button:nth-child(3)');await sleep(500);
ok('sql missing message',(await T0(p)).includes('SQL ส่วนที่ 33'));mode.incOff=false;
// password
await p.click('#nav button:nth-child(5)');await sleep(400);
ok('pw button',(await T0(p)).includes('เปลี่ยนรหัสผ่าน'));
await p.click('[data-a=pwopen]');await sleep(200);
await p.fill('#pwo','staffpass1');await p.fill('#pwn','abc');await p.fill('#pwn2','abc');await p.click('[data-a=pwsave]');await sleep(300);
ok('short pw rejected',(await T0(p)).includes('อย่างน้อย 6 ตัวอักษร'));
await p.fill('#pwn','newpass22');await p.fill('#pwn2','newpass23');await p.click('[data-a=pwsave]');await sleep(300);
ok('mismatch rejected',(await T0(p)).includes('ไม่ตรงกัน'));
await p.fill('#pwn2','newpass22');await p.fill('#pwo','wrongold');await p.click('[data-a=pwsave]');await sleep(500);
ok('wrong old pw',(await T0(p)).includes('รหัสผ่านเดิมไม่ถูกต้อง')&&pwPut.length===0);
await p.fill('#pwo','staffpass1');await p.fill('#pwn','staffpass1');await p.fill('#pwn2','staffpass1');await p.click('[data-a=pwsave]');await sleep(300);
ok('same as old blocked',(await T0(p)).includes('ไม่ซ้ำกับรหัสเดิม'));
await p.fill('#pwn','newpass22');await p.fill('#pwn2','newpass22');await p.click('[data-a=pwsave]');await sleep(700);
t=await T0(p);ok('success msg + form closed',t.includes('เปลี่ยนรหัสผ่านแล้ว')&&!(await p.$('#pwn'))&&pwPut.join()==='newpass22');
// session still works
await p.click('#nav button:nth-child(1)');await sleep(300);ok('still logged in after change',(await T0(p)).includes('คิวงาน'));
// relogin with new password
await p.click('#nav button:nth-child(5)');await p.click('#logout');await sleep(800);
await p.fill('#lph','0844444444');await p.fill('#lpw','staffpass1');await p.click('#agf .btn');await sleep(500);
ok('old pw fails',(await T0(p)).includes('ไม่ถูกต้อง'));
await p.fill('#lpw','newpass22');await p.click('#agf .btn');await sleep(700);ok('new pw works',(await T0(p)).includes('คิวงาน'));
// narrow phone
await p.setViewportSize({width:340,height:700});await p.click('#nav button:nth-child(3)');await sleep(500);
ok('nav fits 340px (no horiz scroll)',await p.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1));
await p.screenshot({path:'inc_staff_narrow.png'});
console.log('ERRS',errs.join('|')||'none');
await b.close();})();
