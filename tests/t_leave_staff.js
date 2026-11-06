const {chromium}=require('playwright');require('./config').pinClock();
const PNG=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==','base64');
(async()=>{const b=await chromium.launch(require('./config').launch);
const ctx=await b.newContext({timezoneId:'Asia/Bangkok',locale:'th-TH'});await require('./config').pinCtx(ctx);const errs=[],calls=[],stor=[];
const H7=7*3600000,bkDate=t=>new Date(t+H7).toISOString().slice(0,10);
const todayS=bkDate(Date.now()),addD=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*86400000).toISOString().slice(0,10);
const at=(d,m)=>new Date(Date.parse(d+'T00:00:00+07:00')+m*60000).toISOString();
const users={'0844444444':{id:'u1',pw:'staffpass1',phone:'0844444444',name:'นุ่น'},'0899999999':{id:'u9',pw:'nopass111',phone:'0899999999',name:'คนนอก'}};
const ST={id:'s1',user:'u1',name:'คุณนุ่น',phone:'0844444444',photo_path:null,accepting:true,work_days:[0,1,2,3,4,5,6]};
let n=100;const oiCalls=[];const HO=[];const hoCalls=[];const OI=[{id:'iv1',status:'pending',req_status:'invited',org_name:'บริษัทตัวอย่าง',district:'บางรัก',service_date:addD(todayS,5),start_time:'09:00:00',end_time:'17:00:00',lunch_start:'12:00:00',lunch_end:'13:00:00',hours:7},{id:'iv2',status:'accepted',req_status:'confirmed',org_name:'โรงเรียนทดสอบ',district:'ดุสิต',service_date:addD(todayS,6),start_time:'09:00:00',end_time:'12:00:00',lunch_start:null,lunch_end:null,hours:3},{id:'iv3',status:'pending',req_status:'rejected',org_name:'ไม่ควรเห็น',district:'x',service_date:addD(todayS,7),start_time:'09:00:00',end_time:'10:00:00',lunch_start:null,lunch_end:null,hours:1}];
let items=[
 {id:'i1',ref:'MS100001',bstatus:'confirmed',active:true,job:'pending',service:'นวดไทย',minutes:60,starts_at:at(todayS,23*60),ends_at:at(todayS,24*60),price:400,customer:'สมศรี ใจดี',phone:'0811111111',place:'ร้านสบายดี สปา'},
 {id:'i2',ref:'MS100002',bstatus:'confirmed',active:true,job:'pending',service:'นวดเท้า',minutes:60,starts_at:at(addD(todayS,1),600),ends_at:at(addD(todayS,1),660),price:300,customer:'วิชัย',phone:'0822222222',place:'ร้านสบายดี สปา'},
 {id:'i3',ref:'MS100003',bstatus:'cancelled',active:false,job:'pending',service:'นวดไทย',minutes:60,starts_at:at(todayS,23*60-120),ends_at:at(todayS,23*60-60),price:400,customer:'ยกเลิกนะ',phone:null,place:'ร้านสบายดี สปา'}];
let nts=[{id:'n1',audience:'staff',staff_id:'s1',kind:'booking',title:'คิวใหม่',body:'เลขที่ MS100002',created_at:new Date().toISOString()}];
let anns=[{id:'a1',title:'ประชุมพนักงาน',body:'วันศุกร์ 10 โมง',audiences:['พนักงาน'],day:todayS,active:true,created_at:new Date(Date.now()-3600000).toISOString()},{id:'a2',title:'ไม่ใช่ของเรา',body:'x',audiences:['ผู้ใช้งาน'],day:todayS,active:true,created_at:new Date().toISOString()}];
let LV=[],lvCalls=[],SH=[],shCalls=[],reads=[],blocks=[],mode={},incCalls=[],pwPut=[],dlCalls=[],DL={st:'none',note:'',open:0};
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
  if(f==='my_org_invites')return J(200,OI);
  if(f==='my_handovers')return J(200,HO);
  if(f==='my_assignments')return J(200,[{place_id:'cp1',name:'บริษัท ไทยออฟฟิศ',days:[1,3],open:'09:00:00',close:'17:00:00'}]);
  if(f==='staff_handover_candidates')return J(200,[{id:'sx',name:'คุณเพื่อน'}]);
  if(f==='staff_handover_request'){hoCalls.push(['req',body]);HO.push({id:'h1',role:'from',status:'pending_admin',org_name:'โรงเรียนทดสอบ',service_date:addD(todayS,6),start_time:'09:00:00',end_time:'12:00:00',from_name:'ฉัน',to_name:'คุณเพื่อน',reason:body.p_reason,admin_note:null,invite_id:body.p_invite});return J(200,'h1')}
  if(f==='staff_handover_cancel'){hoCalls.push(['cancel',body]);HO.splice(0,HO.length);return J(204,null)}
  if(f==='staff_handover_respond'){hoCalls.push(['resp',body]);HO.splice(0,HO.length);return J(204,null)}
  if(f==='staff_org_invite_respond'){oiCalls.push(body);const i=OI.find(x=>x.id===body.p_invite);i.status=body.p_accept?'accepted':'declined';return J(204,null)}
  if(f==='my_leaves')return J(200,LV);
  if(f==='my_sub_handovers')return J(200,SH);
  if(f==='staff_sub_candidates'){shCalls.push(['cands',body]);return J(200,[{id:'sx',name:'คุณเพื่อน'}])}
  if(f==='staff_sub_request'){shCalls.push(['req',body]);SH.push({id:'h1',role:'from',status:'pending_admin',place_id:body.p_place,place_name:'บริษัท ไทยออฟฟิศ',day:body.p_day,from_name:'คุณนุ่น',to_name:'คุณเพื่อน',reason:body.p_reason,open:'09:00:00',close:'17:00:00'});return J(200,'h1')}
  if(f==='staff_sub_cancel'){shCalls.push(['cancel',body]);SH.splice(0,SH.length);return J(204,null)}
  if(f==='staff_company_sub_respond'){shCalls.push(['resp',body]);const h=SH.find(x=>x.id===body.p_id);h.status=body.p_accept?'done':'declined';return J(204,null)}
  if(f==='staff_leave_add'){lvCalls.push(['add',body]);if(body.p_day===addD(todayS,2))return J(400,{code:'P0001',message:'วันนี้มีคิวจองแล้ว 1 คิว กรุณาติดต่อสมาคมเพื่อจัดการคิวก่อนลา'});LV.push({day:body.p_day,reason:body.p_reason});return J(204,null)}
  if(f==='staff_leave_cancel'){lvCalls.push(['del',body]);const i=LV.findIndex(x=>x.day===body.p_day);if(i<0)return J(400,{code:'P0001',message:'ไม่พบรายการลานี้'});LV.splice(i,1);return J(204,null)}
  if(f==='my_jobs')return J(200,items);
  if(f==='staff_delete_status'){if(mode.dlOff)return J(404,{message:'Could not find the function public.staff_delete_status in the schema cache'});return J(200,{status:DL.st,note:DL.note,open_jobs:DL.open,by:DL.by||'shop'})}
  if(f==='staff_request_delete'){dlCalls.push('req');if(DL.open>0)return J(400,{code:'P0001',message:'ยังมีคิวที่ยังไม่เสร็จ '+DL.open+' คิว'});DL.st='pending';return J(204,null)}
  if(f==='staff_cancel_delete'){dlCalls.push('cancel');DL.st='cancelled';return J(204,null)}
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

let p=await mk(null,'');
await p.fill('#lph','0844444444');await p.fill('#lpw','staffpass1');await p.click('#agf .btn');await sleep(800);
let t=await T0(p);
ok('queue page has no leave card',!t.includes('แจ้งลางาน')&&!(await p.$('#lvd')));
await p.click('[data-a=tab][data-id=ac]');await sleep(500);t=await T0(p);
ok('staff account: version line is last, matches meta app-version',await p.evaluate(()=>{const v=document.getElementById('appver'),m=document.querySelector('meta[name="app-version"]').content;return !!v&&v.textContent==='เวอร์ชันแอป '+m&&!v.nextElementSibling&&v.parentElement.id==='app'}));
ok('account tab: leave is a button, form not on the page',(await p.textContent('[data-a=lvopen]')).trim()==='แจ้งลางาน'&&!(await p.$('#lvd')));
await p.click('[data-a=lvopen]');await sleep(300);t=await T0(p);
ok('leave page opens with its own heading, focus on heading',t.includes('ยังไม่มีการแจ้งลา')&&!!(await p.$('#lvd'))&&!!(await p.$('#lvr'))&&await p.evaluate(()=>document.activeElement&&document.activeElement.id==='lvt'&&document.activeElement.tagName==='H1'&&document.activeElement.textContent==='แจ้งลางาน'));
ok('leave page: heading not repeated, back button first',(await p.$$eval('#app h1,#app h2',e=>e.filter(x=>x.textContent.trim()==='แจ้งลางาน').length))===1&&(await p.textContent('[data-a=lvno]')).includes('กลับ'));
ok('leave page: other account sections hidden',!(await p.$('[data-a=pv]'))&&!(await p.$('[data-a=lvopen]'))&&!(await p.$('#appver')));
ok('date input bounded to 60 days',(await p.getAttribute('#lvd','max'))===addD(todayS,60)&&(await p.getAttribute('#lvd','min'))===todayS);
await p.click('[data-a=lvadd]');await sleep(300);t=await T0(p);
ok('requires date',t.includes('กรุณาเลือกวันที่ลา')&&lvCalls.length===0);
await p.fill('#lvd',addD(todayS,5));await p.click('[data-a=lvadd]');await sleep(300);t=await T0(p);
ok('requires reason and keeps date',t.includes('กรุณาใส่เหตุผลการลา')&&lvCalls.length===0&&(await p.inputValue('#lvd'))===addD(todayS,5));
await p.fill('#lvr','ไปหาหมอ');await p.click('[data-a=lvadd]');await sleep(800);t=await T0(p);
ok('leave added via rpc + listed with reason',lvCalls[0][0]==='add'&&lvCalls[0][1].p_day===addD(todayS,5)&&lvCalls[0][1].p_reason==='ไปหาหมอ'&&t.includes('แจ้งลาวันที่')&&t.includes('ไปหาหมอ')&&t.includes('ยกเลิกการลา'));
await p.fill('#lvd',addD(todayS,2));await p.fill('#lvr','ธุระ');await p.click('[data-a=lvadd]');await sleep(800);t=await T0(p);
ok('server block (has bookings) shown, input kept',t.includes('มีคิวจองแล้ว 1 คิว')&&(await p.inputValue('#lvr'))==='ธุระ');
await p.click('[data-a=lvdel]');await sleep(800);t=await T0(p);
ok('cancel leave rpc',lvCalls[lvCalls.length-1][0]==='del'&&lvCalls[lvCalls.length-1][1].p_day===addD(todayS,5)&&t.includes('ยกเลิกการลาวันที่')&&!(await p.$('[data-a=lvdel]')));
await p.screenshot({path:'leave_staff.png',fullPage:true});
await p.click('[data-a=lvno]');await sleep(300);
ok('back: account page with focus on the leave button',!!(await p.$('[data-a=pv]'))&&!(await p.$('#lvd'))&&await p.evaluate(()=>document.activeElement&&document.activeElement.dataset.a==='lvopen'));
await p.click('[data-a=lvopen]');await sleep(300);
// ---- หาคนแทน (บริษัท ไทยออฟฟิศ ประจำจันทร์/พุธ)
let mon=null;for(let k=3;k<30;k++){const dd=addD(todayS,k),w=new Date(dd+'T00:00:00Z').getUTCDay();if(w===1){mon=dd;break}}
await p.fill('#lvd',mon);await p.fill('#lvr','ลาป่วย');await p.click('[data-a=lvadd]');await sleep(800);t=await T0(p);
ok('regular company day leave offers find-substitute',t.includes('ยังไม่มีคนแทน')&&!!(await p.$('[data-a=subopen]')));
await p.click('[data-a=subopen]');await p.waitForSelector('#subto',{timeout:4000});
ok('candidates loaded for that place+day',shCalls[0][0]==='cands'&&shCalls[0][1].p_place==='cp1'&&shCalls[0][1].p_day===mon&&(await p.$$eval('#subto option',o=>o.map(x=>x.textContent))).includes('คุณเพื่อน'));
await p.click('[data-a=subsend]');await sleep(300);t=await T0(p);
ok('must choose a colleague',t.includes('กรุณาเลือกเพื่อนที่จะไปแทน')&&shCalls.length===1);
await p.selectOption('#subto','sx');await p.fill('#subre','ป่วย');await p.click('[data-a=subsend]');await sleep(800);t=await T0(p);
ok('request rpc + waiting for admin shown',shCalls[1][0]==='req'&&shCalls[1][1].p_to==='sx'&&shCalls[1][1].p_reason==='ป่วย'&&t.includes('รอแอดมินอนุมัติ (คุณเพื่อน)')&&!!(await p.$('[data-a=subcancel]')));
await p.click('[data-a=subcancel]');await sleep(800);t=await T0(p);
ok('cancel substitute request',shCalls[2][0]==='cancel'&&t.includes('ยกเลิกคำขอหาคนแทนแล้ว')&&!!(await p.$('[data-a=subopen]')));
await p.click('[data-a=tab][data-id=q]');await sleep(400);t=await T0(p);
ok('queue page shows no leave strip even with leave days',!t.includes('วันลาที่แจ้งไว้')&&!t.includes('คุณแจ้งลา')&&!(await p.$('[data-a=lvdel]')));
// ฝั่งผู้รับ
SH.push({id:'h2',role:'to',status:'pending_staff',place_id:'cp1',place_name:'บริษัท ไทยออฟฟิศ',day:addD(todayS,9),from_name:'คุณแพร',to_name:'คุณนุ่น',reason:'ธุระ',open:'09:00:00',close:'17:00:00'});
await p.reload();await sleep(900);t=await T0(p);
ok('org invite waits -> opens on org tab; company tab present with count',(await p.getAttribute('[data-a=hv][data-id=og]','aria-selected'))==='true'&&(await p.textContent('[data-a=hv][data-id=co]')).includes('(1)')&&!t.includes('งานแทนบริษัท'));
await p.click('[data-a=hv][data-id=co]');await sleep(300);t=await T0(p);
ok('incoming substitute request card',t.includes('งานแทนบริษัท')&&t.includes('ขอให้คุณไปแทน คุณแพร')&&t.includes('บริษัท ไทยออฟฟิศ'));
await p.click('[data-a=subresp][data-ok="1"]');await sleep(800);t=await T0(p);
ok('accept rpc then listed as upcoming substitute job',shCalls[3][0]==='resp'&&shCalls[3][1].p_accept===true&&t.includes('รับไปแทนแล้ว')&&t.includes('ไปแทน คุณแพร'));
await p.click('[data-a=tab][data-id=ac]');await sleep(400);
ok('leaving to another menu closes the leave page; button shows how many days',!(await p.$('#lvd'))&&/^แจ้งลางาน \(แจ้งไว้ \d+ วัน\)$/.test((await p.textContent('[data-a=lvopen]')).trim()));
console.log('errors:',errs.join('|')||'none');await p.context().browser().close();process.exit(0)})();
