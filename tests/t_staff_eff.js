// แอปหมอนวดกับโปรแกรมอ่านหน้าจอ (23 พ.ย. 2569): ตัวโหลดข้อมูลทุก 20 วิไม่วาดหน้าใหม่ถ้าไม่มีอะไรเปลี่ยน, โฟกัสกลับที่เดิมเมื่อวาดใหม่, การ์ดคิวอ่านสรุปบรรทัดเดียว
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
 {id:'i2',ref:'MS100002',bstatus:'confirmed',active:true,job:'pending',service:'นวดเท้า',minutes:60,starts_at:at(addD(todayS,1),600),ends_at:at(addD(todayS,1),660),price:300,customer:'วิชัย',accept_by:new Date(Date.now()+3*60000).toISOString(),phone:'0822222222',place:'ร้านสบายดี สปา'},
 {id:'i4',ref:'MS100004',bstatus:'confirmed',active:true,job:'pending',service:'นวดคอ',minutes:60,starts_at:at(addD(todayS,-1),600),ends_at:at(addD(todayS,-1),660),price:300,customer:'เมื่อวานนี้',phone:null,place:'ร้านสบายดี สปา'},
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
const ok=(nm,c)=>console.log((c?'PASS ':'FAIL ')+nm);const txt=async s=>await p.textContent(s||'body');let pend=0;const PQ=new Set();p.on('request',r=>{PQ.add(r);pend=PQ.size});p.on('requestfinished',r=>{PQ.delete(r);pend=PQ.size});p.on('requestfailed',r=>{PQ.delete(r);pend=PQ.size});p.on('framenavigated',fr=>{if(fr===p.mainFrame()){PQ.clear();pend=0}});/* คำขอที่ค้างตอนหน้าโหลดใหม่ (เช่น /auth/v1/logout ก่อน location.reload) ไม่มีเหตุการณ์จบ เคยทำให้ sleep รอครบ 10 วิทุกครั้งจนข้อสอบหมดเวลา (23 พ.ย. 2569) */
const nap=ms=>new Promise(r=>setTimeout(r,ms));
// รอเวลาที่กำหนด แล้วรอต่อจนไม่มีคำขอค้างอย่างต่อเนื่อง 200 มิลลิวินาที (กันเทสต์ล้มเองเมื่อเครื่องช้า)
const sleep=async ms=>{await nap(ms);let quiet=0,t0=Date.now();while(quiet<200&&Date.now()-t0<10000){await nap(50);if(pend<=0)quiet+=50;else quiet=0}};

// แอปหมอนวด v1.26 (24 พ.ย. 2569): ลดคำขอที่โหลดซ้ำทุก 20 วิ, หน้าแจ้งเตือนไม่อ่านซ้ำ, หัวข้อหน้าคิวเรียงลำดับ, ย่อคำอธิบาย
await p.clock.install();
await p.goto(require('./config').page('staff-app.html'));await sleep(300);
await p.fill('#lph','0844444444');await p.fill('#lpw','staffpass1');await (async()=>{const c=await p.$('#rpv');if(c)await c.check();await p.click('#agf .btn[type=submit]')})();await sleep(600);
await p.waitForFunction(()=>{const a=document.getElementById('app');return a&&a.innerText.includes('คิวงาน')},null,{timeout:8000}).catch(()=>{});
ok('logged in, queue shown',(await txt('#app')).includes('คิวงาน'));
const RQ=[];p.on('request',r=>{const u=r.url();if(/\/rest\/v1\//.test(u))RQ.push(u.replace(/^.*\/rest\/v1\//,'').replace(/\?.*$/,''))});
const tick=async ms=>{RQ.length=0;await p.clock.runFor(ms);await sleep(400);return RQ.slice().sort()};
let q=await tick(20000);
ok('20s tick: only jobs + me ('+q.join(',')+')',q.join(',')==='rpc/my_jobs,rpc/staff_me');
q=await tick(20000);ok('next tick still light',q.length===2);
q=await tick(100000);
ok('after 2 minutes: notifications, invites, chat reloaded ('+q.length+')',['notifications','notification_reads','announcements','rpc/my_org_invites','rpc/my_leaves','rpc/chat_unread','rpc/support_unread'].every(x=>q.includes(x)));
q=await tick(20000);ok('then light again',q.length===2);
RQ.length=0;await p.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));await sleep(600);
ok('back to the app -> full reload',RQ.includes('notifications')&&RQ.includes('rpc/my_jobs'));
// หัวข้อหน้าคิว: ไม่ข้ามระดับ
const hs=await p.evaluate(()=>[...document.querySelectorAll('#app h1,#app h2,#app h3,#app h4')].map(h=>+h.tagName[1]));
ok('queue headings in order ('+hs.join(',')+')',hs[0]===1&&hs.every((l,i)=>i===0||l<=hs[i-1]+1));
ok('day heading is level 2',await p.evaluate(()=>[...document.querySelectorAll('#app h2')].some(h=>/วันนี้, /.test(h.textContent))));
// หน้าแจ้งเตือน
await p.click('#navb [data-id="nt"]');await sleep(500);
const nt=await p.evaluate(()=>({sub:document.getElementById('app').innerText.includes('เลือกหมวด: ระบบ หรือคิวของคุณ'),lab:[...document.querySelectorAll('[data-a=ntf]')].map(b=>b.getAttribute('aria-label'))}));
ok('notifications: repeated hint removed',!nt.sub);
ok('notifications: category buttons read once ('+nt.lab.join(' | ')+')',nt.lab.length===2&&nt.lab.every(l=>l&&!/\(\d+\)/.test(l))&&nt.lab.some(l=>/, ใหม่ \d/.test(l)));
RQ.length=0;await p.clock.runFor(20000);await sleep(400);ok('on notifications page the 20s tick reloads notifications',RQ.includes('notifications'));
// คำอธิบาย
await p.click('#navb [data-id="sc"]');await sleep(400);const sc=await txt('#app');
ok('schedule hint shortened',sc.includes('ลูกค้าจองได้เฉพาะวันที่เลือก')&&!sc.includes('เลือกวันที่คุณทำงาน'));
await p.click('#navb [data-id="inc"]');await sleep(400);const ic=await txt('#app');
ok('income hint shortened',ic.includes('เห็นเฉพาะคุณ')&&!ic.includes('ส่วนแบ่งจากงานที่เสร็จสิ้นแล้ว'));
await p.click('#navb [data-id="ac"]');await sleep(400);
ok('account: no stray "รหัสผ่าน" label above the button',await p.evaluate(()=>![...document.querySelectorAll('#app b')].some(b=>b.textContent.trim()==='รหัสผ่าน')&&!!document.querySelector('[data-a=pwopen]')));
ok('no page errors',errs.length===0);if(errs.length)console.log(errs.join('\n'));
await b.close();})();
