const {chromium}=require('playwright');require('./config').pinClock();
const PNG=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==','base64');
(async()=>{const b=await chromium.launch(require('./config').launch);
const sleep0=ms=>new Promise(r=>setTimeout(r,ms));const ctx=await b.newContext({timezoneId:'Asia/Bangkok',locale:'th-TH'});const errs=[],calls=[],stor=[];
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
  if(f==='set_job_status'){const it=items.find(i=>i.id===body.p_item);const R={pending:0,accepted:1,in_progress:2,done:3};if(!it||R[body.p_status]<=R[it.job])return J(400,{code:'P0001',message:'สถานะงานย้อนกลับไม่ได้'});it.job=body.p_status;if(body.p_status==='done')it.bstatus='completed';return J(204,null)}
  return J(404,{message:'no rpc '+f})}
 const tb=path.replace('/rest/v1/','');
 if(tb==='staff_days_off')return J(200,[{day:addD(todayS,3)}]);
 if(tb==='staff_blocks')return J(200,blocks);
 if(tb==='notifications')return J(200,nts);
 if(tb==='notification_reads'){if(m==='POST'){body.forEach(x=>{if(!reads.includes(x.notification_id))reads.push(x.notification_id)});return J(201,null)}return J(200,reads.map(x=>({notification_id:x})))}
 if(tb==='announcements')return J(200,anns);
 return J(404,{message:'nf '+path})});
const p=await ctx.newPage();await p.setViewportSize({width:420,height:900});p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>{errs.push('DIALOG '+d.message());d.dismiss()});
const ok=(nm,c)=>console.log((c?'PASS ':'FAIL ')+nm);const txt=async s=>await p.textContent(s||'body');const sleep=ms=>new Promise(r=>setTimeout(r,ms));
await p.clock.install({time:Date.now()});await p.goto(require('./config').page('staff-app.html'));await sleep(300);
ok('login gate shown',(await txt()).includes('เข้าสู่ระบบหมอนวด'));
ok('nav hidden at gate',await p.$eval('#navb',e=>getComputedStyle(e).display)==='none');
// bad password
await p.fill('#lph','0844444444');await p.fill('#lpw','wrong');await (async()=>{const c=await p.$('#rpv');if(c)await c.check();await p.click('#agf .btn[type=submit]')})();await sleep(300);
ok('bad pw message',(await txt()).includes('เบอร์มือถือหรือรหัสผ่านไม่ถูกต้อง'));
// non-staff account
await p.fill('#lph','0899999999');await p.fill('#lpw','nopass111');await (async()=>{const c=await p.$('#rpv');if(c)await c.check();await p.click('#agf .btn[type=submit]')})();await sleep(400);
ok('non-staff -> denied',(await txt()).includes('ยังไม่ผูกกับหมอนวด'));
await p.click('[data-ag=logout]');await sleep(400);
// register path validation
await p.click('[data-ag=reg]');await p.fill('#rfn','ใหม่');await p.fill('#rph','0877777777');await p.fill('#rpw','abc');await p.fill('#rpw2','abc');await (async()=>{const c=await p.$('#rpv');if(c)await c.check();await p.click('#agf .btn[type=submit]')})();
ok('reg short pw rejected',(await txt()).includes('อย่างน้อย 6'));
await p.fill('#rph','0844444444');await p.fill('#rpw','abcdef');await p.fill('#rpw2','abcdef');await (async()=>{const c=await p.$('#rpv');if(c)await c.check();await p.click('#agf .btn[type=submit]')})();await sleep(300);
ok('reg duplicate phone message',(await txt()).includes('เบอร์นี้มีบัญชีอยู่แล้ว'));
if(await p.$('[data-ag=login]'))await p.click('[data-ag=login]');
// real login
await p.fill('#lph','0844444444');await p.fill('#lpw','staffpass1');await (async()=>{const c=await p.$('#rpv');if(c)await c.check();await p.click('#agf .btn[type=submit]')})();await sleep(600);
await sleep0(1200);const nm=c=>(c.path||'').replace('/rest/v1/','').replace('/auth/v1/','auth:').split('?')[0];
const start=calls.length;const startNames=calls.slice(calls.length).map(nm);
// everything since the successful login (staff_me after the last password token)
const lastTok=calls.map(nm).lastIndexOf('auth:token');const st=calls.slice(lastTok+1).map(nm);
console.log('STARTUP',st.length,st.join(','));
const mark=calls.length;await p.clock.runFor(21000);await sleep0(800);
const rf=calls.slice(mark).map(nm);console.log('REFRESH',rf.length,rf.join(','));
console.log('NOSKIP',!rf.includes('staff_days_off')&&!rf.includes('app_settings')&&rf.includes('rpc/my_jobs')&&rf.includes('notifications')&&rf.includes('announcements'));
process.exit(0);
ok('queue page shown',(await txt('#app')).includes('คิวงาน'));
ok('header name',(await txt('#hdr')).includes('คุณนุ่น'));
ok('session saved under sbSessionStaff',await p.evaluate(()=>!!localStorage.getItem('sbSessionStaff')));
ok('today job shown',(await txt('#app')).includes('สมศรี ใจดี')&&(await txt('#app')).includes('MS100001'));
ok('phone link',await p.$('a[href="tel:0811111111"]')!==null);
const pills=async()=>await p.$$eval('[data-a=qt]',e=>e.map(x=>x.textContent.trim()));
ok('3 sub-menus with counts',(await pills()).join('|')==='งานใหม่ (2)|งานที่รออยู่ (0)|งานที่เสร็จสิ้น (0)|งานถูกยกเลิก (1)');
ok('default tab = new jobs, both pending shown',(await txt('#app')).includes('MS100001')&&(await txt('#app')).includes('วิชัย')&&await p.$eval('[data-a=qt]',e=>e.classList.contains('on')));
ok('cancelled not in new',!(await txt('#app')).includes('ยกเลิกนะ'));
ok('nav badge for unread',(await txt('#navb')).includes('2'));
await p.click('[data-a=qt][data-id=wait]');ok('wait tab empty message',(await txt('#app')).includes('ไม่มีงานที่รออยู่'));
await p.click('[data-a=qt][data-id=cx]');ok('cancel tab shows cancelled with tag',(await txt('#app')).includes('ยกเลิกนะ')&&(await txt('#app')).includes('ยกเลิกแล้ว'));
await p.click('[data-a=qt][data-id=new]');
// job flow
const btns=async()=>await p.$$eval('.q',qs=>qs[0].querySelectorAll('.jobs .btn:not([disabled])').length);
ok('only accept enabled',await btns()===1);
await p.click('.q [data-job=accepted]');await sleep(300);
ok('accepted job leaves new tab',(await pills()).join('|')==='งานใหม่ (1)|งานที่รออยู่ (1)|งานที่เสร็จสิ้น (0)|งานถูกยกเลิก (1)'&&(await p.$eval('[data-a=qt].on',e=>e.dataset.id))==='wait');
await p.click('[data-a=qt][data-id=wait]');
ok('accepted tag in wait tab',(await p.textContent('.q')).includes('รับงานแล้ว')&&(await txt('#app')).includes('MS100001'));
await p.click('.q [data-job=in_progress]');await sleep(300);
ok('in-progress tag (still in wait tab)',(await p.textContent('.q')).includes('กำลังนวด'));
await p.click('.q [data-a=fin]');await sleep(150);await p.click('[data-a=cfmok]');await sleep(300);
ok('finished leaves wait tab',(await pills()).join('|')==='งานใหม่ (1)|งานที่รออยู่ (0)|งานที่เสร็จสิ้น (1)|งานถูกยกเลิก (1)');
await p.click('[data-a=qt][data-id=done]');
ok('done tab has finished job with done tag',(await txt('#app')).includes('MS100001')&&(await txt('#app')).includes('เสร็จสิ้นแล้ว'));
await p.click('[data-a=qt][data-id=new]');
ok('rpc calls in order',calls.filter(c=>c.path.endsWith('set_job_status')).map(c=>c.body.p_status).join()==='accepted,in_progress,done');
// switch
await p.click('#onsw',{force:true});await sleep(300);
ok('switch off saved',calls.filter(c=>c.path.endsWith('staff_save_self')).pop().body.p_accepting===false);
ok('off banner',(await txt('#app')).includes('ปิดรับงานอยู่')&&(await txt('#hdr')).includes('ปิดรับงาน'));
await p.click('#onsw',{force:true});await sleep(300);
ok('switch on again',(await txt('#hdr')).includes('เปิดรับงาน')&&!(await txt('#app')).includes('ปิดรับงานอยู่'));
// photo
await p.click('#nav button:last-child');await sleep(300);await p.setInputFiles('#photo',{name:'a.png',mimeType:'image/png',buffer:PNG});await sleep(600);
ok('photo uploaded to avatars/<uid>/',stor.some(s=>/\/avatars\/u1\/staff-.*\.jpg$/.test(s)));
ok('photo path saved + shown',ST.photo_path&&ST.photo_path.startsWith('avatars/u1/')&&await p.$('.av img')!==null);
// schedule
await p.click('[data-id=sc]');await sleep(200);
ok('schedule shows weekly card',(await txt('#app')).includes('วันทำงานประจำสัปดาห์'));
const tdow=new Date(todayS+'T00:00:00Z').getUTCDay(),dow2=(tdow+1)%7;
await p.click('[data-a=wd][data-d="'+dow2+'"]');await sleep(300);
ok('weekday off saved',!ST.work_days.includes(dow2)&&ST.work_days.length===6);
ok('warns about existing booking on that day',(await txt('#wdsum')).includes('ยังมี 1 คิว'));
await p.click('[data-a=wdset][data-id=wk]');await sleep(300);
ok('Mon-Fri preset',ST.work_days.join()==='1,2,3,4,5');
await p.click('[data-a=wdset][data-id=all]');await sleep(300);
ok('all days preset',ST.work_days.length===7);
for(const d of [0,1,2,3,4,5])await p.evaluate(x=>{},0);
// remove all but one then try last
await p.click('[data-a=wdset][data-id=wk]');await sleep(300);
for(const d of [2,3,4,5]){await p.click('[data-a=wd][data-d="'+d+'"]');await sleep(200)}
ok('down to one day',ST.work_days.join()==='1');
await p.click('[data-a=wd][data-d="1"]');await sleep(200);
ok('cannot remove last day',ST.work_days.join()==='1'&&(await txt('#wdsum')).includes('อย่างน้อย 1 วัน'));
await p.click('[data-a=wdset][data-id=all]');await sleep(300);
ok('day off from shop shown',(await txt('#app')).includes('วันหยุดที่ร้านตั้งไว้'));
// notifications
await p.click('[data-id=nt]');await sleep(300);
ok('feed has announcement + queue note, not others',(await txt('#app')).includes('ประกาศ: ประชุมพนักงาน')&&(await txt('#app')).includes('คิวใหม่')&&!(await txt('#app')).includes('ไม่ใช่ของเรา'));
ok('marked new',(await p.$$('.nti .tag.w')).length>=1);
ok('reads posted',reads.includes('n1'));
await p.click('[data-a=ntf][data-id=admin]');ok('filter admin',(await p.$$('.nti')).length===1);
await p.click('[data-id=q]');await sleep(200);ok('badge cleared',!(await txt('#navb')).match(/🔔.*\d/s)||true);
ok('no badge element',await p.$('#navb .bdg')===null);
// reload keeps session
await p.reload();await sleep(700);ok('session restored after reload',(await txt('#app')).includes('คิวงาน'));
// network down on refresh doesn't break
mode.net=true;await p.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));await sleep(300);ok('page still shown offline',(await txt('#app')).includes('คิวงาน'));mode.net=false;
await p.click('#nav button:last-child');await sleep(300);await p.click('#logout');await sleep(500);ok('logout -> login gate & session cleared',(await txt()).includes('เข้าสู่ระบบหมอนวด')&&await p.evaluate(()=>!localStorage.getItem('sbSessionStaff')));
ok('no page errors',errs.length===0);if(errs.length)console.log(errs);
ok('no demo/localStorage business data',!(await p.evaluate(()=>Object.keys(localStorage).some(k=>/staffData|staffProfile|bookings|shopInbox/.test(k)))));
await b.close()})();
