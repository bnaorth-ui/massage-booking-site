const {chromium}=require('playwright');require('./config').pinClock();
const RVS=[{id:'q1',staff_id:'s1',reviewer_first:'สมชาย',rating:4,comment:'สุภาพ',reply:null,hidden:false,reported:false,created_at:new Date(Date.now()-864e5).toISOString()},{id:'q2',staff_id:'s1',reviewer_first:'มาลี',rating:5,comment:'ดีมาก',reply:'ขอบคุณค่ะ',hidden:false,reported:false,created_at:new Date(Date.now()-2*864e5).toISOString()},{id:'q3',staff_id:'s1',reviewer_first:'ซ่อน',rating:1,comment:'แย่',reply:null,hidden:true,reported:false,created_at:new Date(Date.now()-3*864e5).toISOString()}];const reps=[];
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
let reads=[],blocks=[],mode={};let MSGS=[{id:'m1',booking_id:'bk1',room_key:'staff:s1',sender_id:'cust',sender_role:'user',sender_name:'สมศรี',body:'ถึงหน้าร้านแล้วค่ะ',created_at:'2026-10-29T10:00:00.000000+00:00'}];let UNR=[{booking_id:'bk1',room:'staff:s1',n:1}];let marks=[];
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
  if(f==='staff_mark_no_show'){const it=items.find(i=>i.id===body.p_item);calls.push({ns:body.p_item});it.bstatus='no_show';it.active=false;return J(204,null)}
 if(f==='reply_review'){reps.push(body);const r=RVS.find(x=>x.id===body.p_id);if(r.reply)return J(400,{code:'P0001',message:'ตอบรีวิวนี้ไปแล้ว'});r.reply=body.p_text;return J(204,null)}
 if(f==='report_review'){reps.push(body);RVS.find(x=>x.id===body.p_id).reported=true;return J(204,null)}
 if(f==='chat_unread')return J(200,UNR);
  if(f==='chat_mark_read'){marks.push(body);UNR=UNR.filter(x=>!(x.booking_id===body.p_booking));return J(204,null)}
  if(f==='chat_send'){MSGS.push({id:'m'+(MSGS.length+1),booking_id:body.p_booking,room_key:body.p_room,sender_id:'u1',sender_role:'staff',sender_name:'คุณนุ่น',body:body.p_body,created_at:new Date().toISOString().replace('Z','000+00:00')});return J(200,'x')}
  if(f==='set_job_status'){const it=items.find(i=>i.id===body.p_item);const R={pending:0,accepted:1,in_progress:2,done:3};if(!it||R[body.p_status]<=R[it.job])return J(400,{code:'P0001',message:'สถานะงานย้อนกลับไม่ได้'});it.job=body.p_status;if(body.p_status==='done')it.bstatus='completed';return J(204,null)}
  return J(404,{message:'no rpc '+f})}
 const tb=path.replace('/rest/v1/','');
 if(tb.startsWith('chat_messages')){const b=sp.get('booking_id').replace('eq.',''),r=sp.get('room_key').replace('eq.','');return J(200,MSGS.filter(m=>m.booking_id===b&&m.room_key===r))}
 if(tb.startsWith('review_staff')){if(process.env.NORV)return J(404,{code:'42P01',message:'relation does not exist'});return J(200,RVS.filter(x=>tb.includes('staff_id=eq.s1')||true))}
 if(tb==='staff_days_off')return J(200,[{day:addD(todayS,3)}]);
 if(tb==='staff_blocks')return J(200,blocks);
 if(tb==='notifications')return J(200,nts);
 if(tb==='notification_reads'){if(m==='POST'){body.forEach(x=>{if(!reads.includes(x.notification_id))reads.push(x.notification_id)});return J(201,null)}return J(200,reads.map(x=>({notification_id:x})))}
 if(tb==='announcements')return J(200,anns);
 if(tb==='app_settings')return J(200,process.env.EMPTY?[{}]:[{association_name:'สมาคมทดสอบ',address:'เลขที่ 1 ถนนทดสอบ',phone:'02-123 4567',line_url:'https://line.me/R/ti/p/@test',hours_text:'จันทร์ – ศุกร์ 08:30 – 16:30 น.',auto_close_hours:3}]);
 return J(404,{message:'nf '+path})});
const p=await ctx.newPage();await p.setViewportSize({width:420,height:900});p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>{errs.push('DIALOG '+d.message());d.dismiss()});
const ok=(nm,c)=>console.log((c?'PASS ':'FAIL ')+nm);const txt=async s=>await p.textContent(s||'body');const sleep=ms=>new Promise(r=>setTimeout(r,ms));
await p.goto(require('./config').page('staff-app.html'));await sleep(300);
ok('login gate shown',(await txt()).includes('เข้าสู่ระบบหมอนวด'));
ok('nav hidden at gate',await p.$eval('#navb',e=>getComputedStyle(e).display)==='none');
// bad password
await p.fill('#lph','0844444444');await p.fill('#lpw','wrong');await p.click('#agf .btn');await sleep(300);
ok('bad pw message',(await txt()).includes('เบอร์มือถือหรือรหัสผ่านไม่ถูกต้อง'));
// non-staff account
await p.fill('#lph','0899999999');await p.fill('#lpw','nopass111');await p.click('#agf .btn');await sleep(400);
ok('non-staff -> denied',(await txt()).includes('ยังไม่ผูกกับหมอนวด'));
await p.click('[data-ag=logout]');await sleep(400);

await p.fill('#lph','0844444444');await p.fill('#lpw','staffpass1');await p.click('#agf .btn');await sleep(700);
await p.click('#nav [data-id=ac]');await sleep(700);
let t=await txt('#app');
ok('section + avg ignoring hidden (4,5 => 4.5)',t.includes('รีวิวของฉัน')&&t.includes('4.5 จาก 5 (2 รีวิว)'));
ok('hidden tagged',t.includes('เจ้าหน้าที่ซ่อนไว้'));
ok('2 reply buttons (q1,q3 hidden none)',(await p.$$('[data-a=rvreply]')).length===1);
await p.click('[data-a=rvreply][data-id=q1]');await sleep(200);
ok('textarea focused',await p.evaluate(()=>document.activeElement&&document.activeElement.id==='rvtxt'));
await p.fill('#rvtxt','ขอบคุณค่ะ');await sleep(100);
await p.click('[data-a=rvsend]');await sleep(500);
ok('reply payload',reps[0]&&reps[0].p_kind==='staff'&&reps[0].p_id==='q1'&&reps[0].p_text==='ขอบคุณค่ะ');
t=await txt('#app');ok('reply shown + banner',t.includes('คำตอบของคุณ')&&t.includes('ส่งคำตอบแล้ว'));
await p.click('[data-a=rvrep][data-id=q1]');await sleep(400);
ok('report payload + tag',reps[1]&&reps[1].p_id==='q1'&&(await txt('#app')).includes('แจ้งตรวจสอบแล้ว'));
console.log('errors:',errs.join('|')||'none');await b.close();process.exit(0)})();
