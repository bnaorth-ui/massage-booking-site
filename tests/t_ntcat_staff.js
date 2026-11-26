// แอปหมอนวด v1.32 (27 พ.ย. 2569): ข้อความจากเจ้าหน้าที่และผลอนุมัติบัญชีอยู่หมวด "จากระบบ" ไม่ติดป้าย "คิว"
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
const T0=Date.now(),iso=t=>new Date(t).toISOString();
let items=[
 {id:'j1',booking_id:'b1',ref:'MS200001',bstatus:'confirmed',active:true,job:'accepted',service:'นวดไทย',minutes:60,starts_at:iso(T0-5*60000),ends_at:iso(T0+55*60000),price:400,customer:'ยืนยันแล้ว',phone:null,place:'ร้านสบายดี สปา',arrived_at:iso(T0-12*60000),arrived_ok:true},
 {id:'j2',booking_id:'b2',ref:'MS200002',bstatus:'confirmed',active:true,job:'accepted',service:'นวดเท้า',minutes:60,starts_at:iso(T0-5*60000),ends_at:iso(T0+55*60000),price:300,customer:'ไม่ยืนยัน',phone:null,place:'ร้านสบายดี สปา',arrived_at:iso(T0-3*60000),arrived_ok:false},
 {id:'j3',booking_id:'b3',ref:'MS200003',bstatus:'confirmed',active:true,job:'in_progress',service:'นวดคอ',minutes:60,starts_at:iso(T0-20*60000),ends_at:iso(T0+40*60000),price:300,customer:'เริ่มแล้ว',phone:null,place:'ร้านสบายดี สปา',arrived_at:iso(T0-25*60000),arrived_ok:true},
 {id:'j4',booking_id:'b4',ref:'MS200004',bstatus:'confirmed',active:true,job:'accepted',service:'นวดไทย',minutes:60,starts_at:iso(T0-5*60000),ends_at:iso(T0+55*60000),price:400,customer:'ยังไม่มา',phone:null,place:'ร้านสบายดี สปา'}];
let nts=[{id:'n1',audience:'staff',staff_id:'s1',kind:'job',title:'มีคิวใหม่รอกดรับงาน',body:'เลขที่ MS100002',created_at:new Date(Date.now()-5*60000).toISOString()},{id:'n2',audience:'staff',staff_id:'s1',kind:'support',title:'ข้อความใหม่จากเจ้าหน้าที่',body:'ครับ',created_at:new Date(Date.now()-1*60000).toISOString()},{id:'n3',audience:'staff',staff_id:'s1',kind:'approval',title:'บัญชีหมอนวดได้รับการอนุมัติแล้ว',body:'เริ่มรับงานได้',created_at:new Date(Date.now()-3*60000).toISOString()},{id:'n4',audience:'staff',staff_id:'s1',kind:'cancel',title:'ลูกค้ายกเลิกการจอง',body:'เลขที่ MS100003',created_at:new Date(Date.now()-4*60000).toISOString()}];
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



await p.goto(require('./config').page('staff-app.html'));await sleep(300);
await p.fill('#lph','0844444444');await p.fill('#lpw','staffpass1');await (async()=>{const c=await p.$('#rpv');if(c)await c.check();await p.click('#agf .btn[type=submit]')})();await sleep(800);
await p.click('#nav [data-a=tab][data-id=nt]');await sleep(700);
const cat=async id=>{await p.click('[data-a=ntf][data-id='+id+']');await sleep(300);return p.$$eval('.nti',o=>o.map(x=>({t:x.querySelector('b').textContent,tag:x.querySelector('.qh .tag').textContent,go:!!x.querySelector('[data-supgo]')})))};
const A=await cat('admin'),B=await cat('booking');
const f=(L,t)=>L.find(x=>x.t===t);
ok('staff reply in "จากระบบ" tagged แชต (not คิว) '+JSON.stringify(f(A,'ข้อความใหม่จากเจ้าหน้าที่')),f(A,'ข้อความใหม่จากเจ้าหน้าที่')&&f(A,'ข้อความใหม่จากเจ้าหน้าที่').tag==='แชต'&&f(A,'ข้อความใหม่จากเจ้าหน้าที่').go);
ok('account approval in "จากระบบ" tagged ระบบ',f(A,'บัญชีหมอนวดได้รับการอนุมัติแล้ว')&&f(A,'บัญชีหมอนวดได้รับการอนุมัติแล้ว').tag==='ระบบ');
ok('job + cancel stay in "เกี่ยวกับคิว" tagged คิว '+JSON.stringify(B),B.length===2&&B.every(x=>x.tag==='คิว')&&!B.some(x=>x.t.includes('เจ้าหน้าที่')));
ok('no page errors '+errs.join('|'),errs.length===0);
await b.close()})();
