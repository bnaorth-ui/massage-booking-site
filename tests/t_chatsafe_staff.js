// หมอนวด: รายงาน/บล็อกลูกค้าในแชต, รายชื่อลูกค้าที่บล็อกไว้, เงื่อนไขการใช้งาน (หน้าแขก, ตอนสมัคร, ยอมรับครั้งเดียวหลังเข้าสู่ระบบ)
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
let items0=[
 {id:'i1',ref:'MS100001',bstatus:'confirmed',active:true,job:'pending',service:'นวดไทย',minutes:60,starts_at:at(todayS,23*60),ends_at:at(todayS,24*60),price:400,customer:'สมศรี ใจดี',phone:'0811111111',place:'ร้านสบายดี สปา'},
 {id:'i2',ref:'MS100002',bstatus:'confirmed',active:true,job:'pending',service:'นวดเท้า',minutes:60,starts_at:at(addD(todayS,1),600),ends_at:at(addD(todayS,1),660),price:300,customer:'วิชัย',accept_by:new Date(Date.now()+3*60000).toISOString(),phone:'0822222222',place:'ร้านสบายดี สปา'},
 {id:'i4',ref:'MS100004',bstatus:'confirmed',active:true,job:'pending',service:'นวดคอ',minutes:60,starts_at:at(addD(todayS,-1),600),ends_at:at(addD(todayS,-1),660),price:300,customer:'เมื่อวานนี้',phone:null,place:'ร้านสบายดี สปา'},
 {id:'i3',ref:'MS100003',bstatus:'cancelled',active:false,job:'pending',service:'นวดไทย',minutes:60,starts_at:at(todayS,23*60-120),ends_at:at(todayS,23*60-60),price:400,customer:'ยกเลิกนะ',phone:null,place:'ร้านสบายดี สปา'}];
let items=[
 {id:'i1',booking_id:'bk1',ref:'MS1',bstatus:'confirmed',active:true,job:'pending',service:'นวดไทย',minutes:60,starts_at:new Date(Date.now()-30*60000).toISOString(),ends_at:new Date(Date.now()+30*60000).toISOString(),price:400,customer:'สมศรี',phone:null,place:'ร้านสบายดี'},
 {id:'i2',ref:'MS2',bstatus:'confirmed',active:true,job:'pending',service:'นวดเท้า',minutes:60,starts_at:new Date(Date.now()+2*3600000).toISOString(),ends_at:new Date(Date.now()+3*3600000).toISOString(),price:300,customer:'วิชัย',phone:null,place:'ร้านสบายดี'},
 {id:'i3',booking_id:'bk3',ref:'MS3',bstatus:'confirmed',active:true,job:'in_progress',service:'นวดคอ',minutes:60,starts_at:new Date(Date.now()-2*3600000).toISOString(),ends_at:new Date(Date.now()-3600000).toISOString(),price:300,customer:'เมื่อกี้',phone:null,place:'ร้านสบายดี'}];
let nts=[{id:'n1',audience:'staff',staff_id:'s1',kind:'booking',title:'คิวใหม่',body:'เลขที่ MS100002',created_at:new Date().toISOString()}];
let anns=[{id:'a1',title:'ประชุมพนักงาน',body:'วันศุกร์ 10 โมง',audiences:['พนักงาน'],day:todayS,active:true,created_at:new Date(Date.now()-3600000).toISOString()},{id:'a2',title:'ไม่ใช่ของเรา',body:'x',audiences:['ผู้ใช้งาน'],day:todayS,active:true,created_at:new Date().toISOString()}];
let reads=[],blocks=[],mode={};let MSGS=[{id:'m1',booking_id:'bk1',room_key:'staff:s1',sender_id:'cust',sender_role:'user',sender_name:'สมศรี',body:'ถึงหน้าร้านแล้วค่ะ',created_at:'2026-10-29T10:00:00.000000+00:00'}];let UNR=[{booking_id:'bk1',room:'staff:s1',n:1}];let marks=[];const TM={acc:null},CX={bid:null,other:false,rep:false},CS=[];let BL=[];
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
  if(f==='terms_status')return J(200,{current:1,accepted:isS?TM.acc:1});
  if(f==='accept_terms'){CS.push({f,u:me.id,...body});if(isS)TM.acc=1;return J(204,null)}
  if(!isS)return J(400,{code:'P0001',message:'บัญชีนี้ไม่ใช่พนักงาน'});
  if(f==='my_jobs')return J(200,items);
  if(f==='staff_save_self'){if(!body.p_work_days.length)return J(400,{code:'P0001',message:'ต้องเลือกวันทำงานอย่างน้อย 1 วัน'});ST.accepting=body.p_accepting;ST.work_days=body.p_work_days;if(!body.p_keep_photo)ST.photo_path=body.p_photo;return J(204,null)}
  if(f==='staff_mark_no_show'){const it=items.find(i=>i.id===body.p_item);calls.push({ns:body.p_item});it.bstatus='no_show';it.active=false;return J(204,null)}
 if(f==='chat_unread')return J(200,UNR);
  if(f==='chat_mark_read'){marks.push(body);UNR=UNR.filter(x=>!(x.booking_id===body.p_booking));return J(204,null)}
  if(f==='chat_send'){MSGS.push({id:'m'+(MSGS.length+1),booking_id:body.p_booking,room_key:body.p_room,sender_id:'u1',sender_role:'staff',sender_name:'คุณนุ่น',body:body.p_body,created_at:new Date().toISOString().replace('Z','000+00:00')});return J(200,'x')}
  if(f==='set_job_status'){const it=items.find(i=>i.id===body.p_item);const R={pending:0,accepted:1,in_progress:2,done:3};if(!it||R[body.p_status]<=R[it.job])return J(400,{code:'P0001',message:'สถานะงานย้อนกลับไม่ได้'});it.job=body.p_status;if(body.p_status==='done')it.bstatus='completed';return J(204,null)}
  if(f==='chat_room_state'){CS.push({f,...body});return J(200,{role:'staff',blocked_by_me:!!CX.bid,block_id:CX.bid,blocked_by_other:CX.other,reported:CX.rep,suspended:false})}
  if(f==='chat_block'){CS.push({f,...body});CX.bid='blk1';return J(200,'blk1')}
  if(f==='chat_unblock'){CS.push({f,...body});CX.bid=null;BL=BL.filter(x=>x.id!==body.p_id);return J(204,null)}
  if(f==='chat_report'){CS.push({f,...body});CX.rep=true;return J(200,'rp1')}
  if(f==='my_blocks'){CS.push({f,...body});return J(200,BL)}
  if(f==='support_unread'){SPQ.push([f,body]);return J(200,SPM.filter(x=>x.sender_role!=='user'&&!x.read).length)}
  if(f==='support_mark_read'){SPQ.push([f,body]);SPM.forEach(x=>x.read=1);return J(204,null)}
  if(f==='support_room'){SPQ.push([f,body]);return J(200,{messages:body.p_after?SPM.filter(x=>x.created_at>body.p_after):SPM,hours:'9-17'})}
  if(f==='support_send'){SPQ.push([f,body]);SPM.push({id:'sp'+SPM.length,sender_id:SPUID,sender_role:'user',sender_name:'x',body:body.p_body,created_at:new Date().toISOString(),read:1});return J(200,'mid')}
  return J(404,{message:'no rpc '+f})}
 const tb=path.replace('/rest/v1/','');
 if(tb.startsWith('chat_messages')){const b=sp.get('booking_id').replace('eq.',''),r=sp.get('room_key').replace('eq.','');return J(200,MSGS.filter(m=>m.booking_id===b&&m.room_key===r))}
 if(tb==='staff_days_off')return J(200,[{day:addD(todayS,3)}]);
 if(tb==='staff_blocks')return J(200,blocks);
 if(tb==='notifications')return J(200,nts);
 if(tb==='notification_reads'){if(m==='POST'){body.forEach(x=>{if(!reads.includes(x.notification_id))reads.push(x.notification_id)});return J(201,null)}return J(200,reads.map(x=>({notification_id:x})))}
 if(tb==='announcements')return J(200,anns);
 if(tb==='app_settings')return J(200,process.env.EMPTY?[{}]:[{association_name:'สมาคมทดสอบ',address:'เลขที่ 1 ถนนทดสอบ',phone:'02-123 4567',line_url:'https://line.me/R/ti/p/@test',hours_text:'จันทร์ – ศุกร์ 08:30 – 16:30 น.',auto_close_hours:3}]);
 return J(404,{message:'nf '+path})});
const p=await ctx.newPage();await p.setViewportSize({width:420,height:900});p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>{errs.push('DIALOG '+d.message());d.dismiss()});
const SPQ=[],SPM=[{id:'sp0',sender_id:'ad',sender_role:'admin',sender_name:'เจ้าหน้าที่ สมหญิง',body:'สวัสดีจากเจ้าหน้าที่',created_at:new Date(Date.now()-60000).toISOString()}],SPUID='me';const ok=(nm,c)=>console.log((c?'PASS ':'FAIL ')+nm);const txt=async s=>await p.textContent(s||'body');const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const W=require('./config').waitFor;const until=async(f,a)=>{try{await p.waitForFunction(f,a,{timeout:5000});return true}catch(e){return false}};
const focusId=()=>p.evaluate(()=>document.activeElement&&document.activeElement.id);
await p.goto(require('./config').page('staff-app.html'));await sleep(300);
ok('login page has terms link',!!(await p.$('[data-ag=tm]')));
await p.click('[data-ag=tm]');await sleep(200);
ok('guest terms page: staff terms, focus on title',(await txt('#tmt')).includes('เงื่อนไขการใช้งาน (หมอนวด)')&&(await focusId())==='tmt'&&(await txt()).includes('ลูกค้าคนนั้นจะจองคุณไม่ได้อีก'));
await p.click('[data-ag=tmback]');await sleep(200);ok('back to login',!!(await p.$('#lph')));
// สมัครบัญชีใหม่: ช่องยินยอมรวมเงื่อนไข
await p.click('[data-ag=reg]');await sleep(200);
ok('signup consent covers terms and privacy',(await txt('label[for=rpv]')).includes('เงื่อนไขการใช้งานและนโยบายความเป็นส่วนตัว'));
await p.fill('#rfn','มะลิ');await p.fill('#rph','0866666666');await p.fill('#rpw','abc12345');await p.fill('#rpw2','abc12345');
await p.click('[data-ag=tm]');await sleep(200);ok('terms from signup',(await txt('#tmt')).includes('เงื่อนไขการใช้งาน (หมอนวด)'));
await p.click('[data-ag=tmback]');await sleep(200);ok('signup draft kept',(await p.inputValue('#rfn'))==='มะลิ'&&(await p.inputValue('#rph'))==='0866666666');
await p.click('#agf button[type=submit]');await sleep(300);ok('signup blocked without consent',(await txt('#aerr')).includes('ยอมรับเงื่อนไขการใช้งานและนโยบายความเป็นส่วนตัว'));
await p.check('#rpv');await p.click('#agf button[type=submit]');
ok('terms accepted right after signup',await W(()=>CS.some(c=>c.f==='accept_terms'&&c.p_app==='staff'&&c.u!=='u1')));
await until(()=>document.body.innerText.includes('ยังไม่ผูกกับหมอนวด'));await p.click('[data-ag=logout]');await sleep(500);
// พนักงานเดิม: ยอมรับครั้งเดียว
await p.fill('#lph','0844444444');await p.fill('#lpw','staffpass1');await p.click('#agf .btn');
ok('existing staff: terms gate, focus on its title',await until(()=>document.getElementById('tmacc')&&document.activeElement.id==='tmgt'));
ok('gate: nav hidden, privacy and logout offered',await p.$eval('#navb',e=>getComputedStyle(e).display)==='none'&&!!(await p.$('[data-ag=pv]'))&&!!(await p.$('[data-ag=logout]')));
await p.click('[data-ag=pv]');await sleep(200);ok('gate: privacy page',(await txt('#pvt')).includes('นโยบายความเป็นส่วนตัว (หมอนวด)')&&(await txt()).includes('เก็บรายงานไว้ 12 เดือน'));
await p.click('[data-ag=pvback]');await sleep(200);ok('back to the gate',!!(await p.$('#tmacc')));
await p.click('#tmacc');
ok('accept opens the app',await until(()=>document.getElementById('navb').style.display!=='none'&&!!document.querySelector('[data-chat=bk1]'))&&CS.some(c=>c.f==='accept_terms'&&c.u==='u1'&&c.p_app==='staff'));
// ---- แชต ----
await p.click('[data-chat=bk1]');await sleep(700);
ok('room state asked',CS.some(c=>c.f==='chat_room_state'&&c.p_booking==='bk1'&&c.p_room==='staff:s1'));
ok('report and block buttons',(await txt('#chrp')).trim()==='รายงาน'&&(await txt('#chbk')).trim()==='บล็อกลูกค้า');
await p.click('#chrp');await sleep(150);ok('report form, focus on legend',(await focusId())==='chrl');
await p.check('#chr_sexual');await p.click('#chrf button[type=submit]');
ok('report sent',await W(()=>CS.some(c=>c.f==='chat_report'&&c.p_room==='staff:s1'&&c.p_reason==='sexual'&&c.p_detail===null)));
await sleep(200);ok('reported state',(await txt('#chrp')).includes('รายงานแล้ว')&&(await focusId())==='chrp');
await p.click('#chbk');await sleep(150);ok('block confirm says customer cannot book you',(await txt('#chbq')).includes('จองคุณไม่ได้อีก'));
await p.click('[data-chs=bk]');ok('block sent',await W(()=>CS.some(c=>c.f==='chat_block'&&c.p_room==='staff:s1')));
await sleep(200);ok('locked after block',!(await p.$('#chf'))&&(await txt('#chlock')).includes('คุณบล็อกลูกค้าคนนี้ไว้'));
await p.click('#chbk');ok('unblock',await W(()=>CS.some(c=>c.f==='chat_unblock')));await sleep(200);ok('send box back',!!(await p.$('#chf')));
await p.click('#chback');await sleep(500);
// ---- บัญชี ----
BL=[{id:'blk9',name:'สมศรี',kind:'customer',at:'2026-11-10T03:00:00Z'}];
await p.click('[data-a=tab][data-id=ac]');await sleep(300);
ok('contact box: no association name or address, phone still there',!(await txt('#app')).includes('สมาคมทดสอบ')&&!(await txt('#app')).includes('ถนนทดสอบ')&&!!(await p.$('#app a.cta[href^="tel:"]')));ok('account page: blocked list and terms buttons',!!(await p.$('[data-a=blkopen]'))&&!!(await p.$('[data-a=tmopen]')));

ok('contact: chat-with-staff button first, no LINE',!!(await p.$('#app button.cta[data-supgo]'))&&!(await txt('#app')).includes('LINE')&&!(await p.$('a[href*="line.me"]')));
ok('contact: unread badge from support_unread (staff)',SPQ.some(x=>x[0]==='support_unread'&&x[1].p_app==='staff')&&((await p.getAttribute('#app button.cta[data-supgo]','aria-label'))||'').includes('ข้อความใหม่ 1 ข้อความ'));
await p.click('#app button.cta[data-supgo]');
ok('staff chat room opens with focus on heading',await W(async()=>(await p.evaluate(()=>document.activeElement&&document.activeElement.id))==='chtitle'));
ok('room: title, 6-month note, no report/block, earlier reply shown',(await txt('#chtitle')).includes('แชตกับเจ้าหน้าที่')&&(await txt('#app')).includes('6 เดือน')&&!(await p.$('#chsx button'))&&(await txt('#chl')).includes('สวัสดีจากเจ้าหน้าที่'));
ok('marked read',await W(()=>SPQ.some(x=>x[0]==='support_mark_read'&&x[1].p_app==='staff')));
await p.fill('#chi','ขอเปลี่ยนเบอร์โทร');await p.click('#chsend');
ok('message sent with app staff',await W(()=>SPQ.some(x=>x[0]==='support_send'&&x[1].p_app==='staff'&&x[1].p_body==='ขอเปลี่ยนเบอร์โทร'))&&await W(async()=>(await txt('#chl')).includes('ขอเปลี่ยนเบอร์โทร')));
ok('1000-char limit',(await p.getAttribute('#chi','maxlength'))==='1000');
await p.click('#chback');await sleep(300);
await p.click('[data-a=blkopen]');ok('blocked list',await until(()=>document.getElementById('app').textContent.includes('สมศรี')&&!!document.querySelector('[data-a=ublk]'))&&CS.some(c=>c.f==='my_blocks'&&c.p_app==='staff'));
await p.click('[data-a=ublk][data-id=blk9]');ok('unblock from list',await W(()=>CS.some(c=>c.f==='chat_unblock'&&c.p_id==='blk9')));
await sleep(200);ok('list empty',(await txt('#app')).includes('ยังไม่ได้บล็อกลูกค้าคนไหน'));
await p.click('[data-a=blkno]');await sleep(150);await p.click('[data-a=tmopen]');await sleep(150);
ok('terms page in account',(await txt('#tmt')).includes('เงื่อนไขการใช้งาน (หมอนวด)')&&(await focusId())==='tmt');
await p.click('[data-a=tmno]');await sleep(150);ok('back to account',!!(await p.$('[data-a=tmopen]')));
console.log('errors:',errs.join('|')||'none');ok('no page errors',errs.length===0);await b.close();process.exit(0)})();
