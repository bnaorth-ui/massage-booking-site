const {chromium}=require('playwright');
const PNG=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==','base64');
(async()=>{const b=await chromium.launch(require('./config').launch);
const ctx=await b.newContext({timezoneId:'Asia/Bangkok',locale:'th-TH'});const errs=[],calls=[],stor=[];
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
let reads=[],blocks=[],mode={};
await ctx.route('**/*',async r=>{const q=r.request(),u=new URL(q.url());if(u.protocol==='file:')return r.continue();if(!u.host.endsWith('supabase.co'))return r.abort();
 const m=q.method(),path=u.pathname,sp=u.searchParams;let body=null;try{body=JSON.parse(q.postData()||'null')}catch(e){}
 const auth=(q.headers().authorization||'').replace('Bearer ',''),me=Object.values(users).find(x=>'at-'+x.id===auth);calls.push({m,path,q:u.search,body});
 const J=(s,o)=>r.fulfill({status:s,contentType:'application/json',body:JSON.stringify(o)});
 if(mode.net)return r.abort();
 const sess=us=>({access_token:'at-'+us.id,refresh_token:'rt-'+us.id,expires_in:3600,user:{id:us.id}});
 if(path==='/auth/v1/signup'){const ph=body.email.split('@')[0];if(users[ph])return J(422,{error_code:'user_already_exists',msg:'User already registered'});const id='u'+(++n);users[ph]={id,pw:body.password,phone:ph,name:body.data.first_name};return J(200,sess(users[ph]))}
 if(path==='/auth/v1/token'){if(sp.get('grant_type')==='refresh_token'){const x=Object.values(users).find(z=>'rt-'+z.id===body.refresh_token);return x?J(200,sess(x)):J(400,{error_code:'bad',msg:'bad'})}
  const us=users[body.email.split('@')[0]];if(!us||us.pw!==body.password)return J(400,{error_code:'invalid_credentials',msg:'Invalid login credentials'});return J(200,sess(us))}
 if(path==='/auth/v1/logout')return J(204,{});
 if(path.startsWith('/storage/v1/object/')){stor.push(path);return J(200,{Key:'k'})}
 if(!me)return J(401,{message:'JWT'});
 const rm=path.match(/^\/rest\/v1\/rpc\/(\w+)/);
 if(rm){const f=rm[1],isS=me.id==='u1';
  if(f==='staff_me')return J(200,isS?{id:'s1',name:ST.name,phone:ST.phone,photo_path:ST.photo_path,active:true,accepting:ST.accepting,work_days:ST.work_days,place:'ร้านสบายดี สปา',open_min:600,close_min:1260}:null);
  if(!isS)return J(400,{code:'P0001',message:'บัญชีนี้ไม่ใช่พนักงาน'});
  if(f==='my_jobs')return J(200,items);
  if(f==='staff_save_self'){if(!body.p_work_days.length)return J(400,{code:'P0001',message:'ต้องเลือกวันทำงานอย่างน้อย 1 วัน'});ST.accepting=body.p_accepting;ST.work_days=body.p_work_days;if(!body.p_keep_photo)ST.photo_path=body.p_photo;return J(204,null)}
  if(f==='staff_set_blocks'){for(const mm of body.p_minutes){const hit=items.find(i=>i.active&&bkDate(Date.parse(i.starts_at))===body.p_day&&(()=>{const s=Math.floor(((Date.parse(i.starts_at)+H7)%86400000)/60000);return mm<s+i.minutes&&mm+30>s})());if(hit)return J(400,{code:'P0001',message:'ช่วงเวลานี้มีคิวอยู่แล้ว ปิดไม่ได้'})}
   if(mode.failBlock)return J(400,{code:'P0001',message:'จำลองล้มเหลว'});blocks=blocks.filter(x=>x.day!==body.p_day).concat(body.p_minutes.map(mm=>({day:body.p_day,minute:mm})));return J(204,null)}
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
// 1 desktop + join -> reg, readonly prefilled
let a=await mk(null,'?join=0877777777');
ok('desktop join -> reg page',(await T0(a)).includes('สร้างบัญชีพนักงาน')&&!(await T0(a)).includes('ติดตั้งแอปรับงานพนักงาน'));
ok('phone prefilled + readonly',await a.$eval('#rph',e=>e.value==='0877777777'&&e.readOnly));
ok('label notes shop saved it',(await T0(a)).includes('ร้านบันทึกไว้ให้แล้ว'));
// complete signup
await a.fill('#rfn','ใหม่');await a.fill('#rpw','abcdef');await a.fill('#rpw2','abcdef');await a.check('#rpv');await a.click('#agf .btn[type=submit]');await sleep(500);
ok('signup sent with joined phone',calls.some(c=>c.path==='/auth/v1/signup'&&c.body&&c.body.email.startsWith('0877777777@')));
await a.close();
// 2 invalid join ignored
a=await mk(null,'?join=123');ok('invalid join -> login',(await T0(a)).includes('เข้าสู่ระบบพนักงาน')&&!(await a.$('#rph')));await a.close();
// 3 no join -> login, no ins even on android
a=await mk(UAS.android,'');ok('no join android -> login (no install intro)',(await T0(a)).includes('เข้าสู่ระบบพนักงาน'));await a.close();
// 4 android + join -> install intro manual
a=await mk(UAS.android,'?join=0877777777');let t=await T0(a);
ok('NEW android: features 5 + icons 3 + numbers 3 + no copy btn',(await a.$$('.insft li')).length===5&&(await a.$$('.insst li svg')).length===3&&(await a.$$('.insst .insn')).length===3&&!(await a.$('[data-ins=copy]'))&&t.includes('แอปนี้ทำอะไรได้')&&t.includes('รับงาน'));
ok('NEW icons decorative (aria-hidden)',await a.evaluate(()=>[...document.querySelectorAll('.insi,.insn,.insft li span:first-child')].every(e=>e.getAttribute('aria-hidden')==='true')));
ok('android join -> install intro',t.includes('ติดตั้งแอปรับงานพนักงาน')&&t.includes('ติดตั้งแอป')&&t.includes('⋮'));
ok('title focused',await a.evaluate(()=>document.activeElement&&document.activeElement.id==='inst'));
await a.click('button[data-ins=skip] >> nth=-1');await sleep(300);
ok('skip -> reg with phone',(await T0(a)).includes('สร้างบัญชีพนักงาน')&&(await a.inputValue('#rph'))==='0877777777');
await a.reload();await sleep(400);ok('seen -> reg directly next time',(await T0(a)).includes('สร้างบัญชีพนักงาน')&&!(await T0(a)).includes('ติดตั้งแอปรับงาน'));await a.close();
// 4b beforeinstallprompt -> button
a=await mk(UAS.android,'?join=0877777777');
await a.evaluate(()=>{const e=new Event('beforeinstallprompt');e.prompt=()=>{window.__pr=1};e.userChoice=Promise.resolve({outcome:'accepted'});window.dispatchEvent(e)});await sleep(200);
ok('install button when prompt available',!!(await a.$('[data-ins=go]')));
await a.click('[data-ins=go]');await sleep(300);ok('prompt called + installed state',(await a.evaluate(()=>window.__pr))===1&&(await T0(a)).includes('ติดตั้งแล้ว'));await a.close();
// 5 LINE android
a=await mk(UAS.line,'?join=0877777777');t=await T0(a);ok('LINE android -> open in Chrome',t.includes('เปิดใน Chrome')&&t.includes('อยู่ในแอปอื่น'));
ok('NEW open button label = ติดตั้งแอป',((await a.textContent('[data-ins=open]'))||'').trim()==='ติดตั้งแอป');
ok('NEW LINE: copy+open buttons, url shown',!!(await a.$('[data-ins=copy]'))&&!!(await a.$('[data-ins=open]'))&&(await a.textContent('.insurl')).includes('join=0877777777'));
await a.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{value:{writeText:t=>{window.__cp=t;return Promise.resolve()}},configurable:true})});
await a.click('[data-ins=copy]');await sleep(200);
ok('NEW copy writes full url w/ join',((await a.evaluate(()=>window.__cp))||'').includes('join=0877777777')&&(await a.textContent('#insmsg')).includes('คัดลอกลิงก์แล้ว'));
ok('NEW copy keeps page (still install intro)',(await T0(a)).includes('ติดตั้งแอปรับงานพนักงาน'));
await a.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{value:{writeText:t=>Promise.reject(new Error('no'))},configurable:true});document.execCommand=()=>false});
await a.click('[data-ins=copy]');await sleep(250);ok('NEW copy failure -> message tells to long-press',(await a.textContent('#insmsg')).includes('ไม่สำเร็จ'));
await a.close();
// 6 iOS
a=await mk(UAS.ios,'?join=0877777777');ok('NEW iOS: 3 svg icons, no copy btn',(await a.$$('.insst li svg')).length===3&&!(await a.$('[data-ins=copy]')));await a.close();
a=await mk(UAS.ios,'?join=0877777777');t=await T0(a);ok('iOS steps',t.includes('เพิ่มไปยังหน้าจอโฮม')&&t.includes('แชร์')&&t.includes('รับแจ้งเตือนบน iPhone'));await a.close();
a=await mk(UAS.iosline,'?join=0877777777');t=await T0(a);ok('iOS LINE -> Safari first',t.includes('เปิดใน Safari'));
ok('NEW iOS LINE: copy+open + steps kept',!!(await a.$('[data-ins=copy]'))&&!!(await a.$('[data-ins=open]'))&&t.includes('เพิ่มไปยังหน้าจอโฮม'));
await a.evaluate(()=>{window.__nav=[];});
await a.click('[data-ins=open]').catch(()=>{});await sleep(1800);
ok('NEW open fallback message shown',(await a.textContent('#insmsg')).includes('คัดลอกลิงก์'));
await a.close();
// 7 existing account -> login prefilled
a=await mk(null,'?join=0844444444');await a.fill('#rfn','นุ่น');await a.fill('#rpw','abcdef');await a.fill('#rpw2','abcdef');await a.check('#rpv');await a.click('#agf .btn[type=submit]');await sleep(500);
t=await T0(a);ok('existing -> login with msg + phone',t.includes('เข้าสู่ระบบพนักงาน')&&t.includes('เบอร์นี้มีบัญชีอยู่แล้ว')&&(await a.inputValue('#lph'))==='0844444444');
// 8 logged in + join -> app, not reg
await a.fill('#lpw','staffpass1');await a.click('#agf .btn');await sleep(900);
ok('logged in as staff',!(await a.$('#agf')));
await a.goto(URLB+'?join=0877777777');await sleep(900);
ok('logged-in + join link keeps session (no reg page)',!(await a.$('#rph'))&&!(await T0(a)).includes('สร้างบัญชีพนักงาน'));
console.log('errors:',errs.join('|')||'none');await b.close();process.exit(0)})();
