const {chromium}=require('playwright');
const PNG=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==','base64');
(async()=>{const b=await chromium.launch(require('./config').launch);
const ctx=await b.newContext({timezoneId:'Asia/Bangkok',locale:'th-TH'});const errs=[],calls=[],stor=[];
let n=100;const now=()=>new Date().toISOString();
const puts=[];let putSame=false;const users={'0811111111':{id:'u1',pw:'abc123'},'0822222222':{id:'u2',pw:'abc123'}};
const byTok=t=>Object.values(users).find(u=>'at-'+u.id===t);
const D1=d=>new Date(Date.now()+d*864e5).toISOString();
const it=(id,sv,a,job,act=true)=>({id,service_name:sv,minutes:60,price:400,starts_at:a,ends_at:new Date(Date.parse(a)+36e5).toISOString(),active:act,job,staff_id:'p1'});
const BK=[
 {id:'b1',ref:'MS1',customer_name:'ลูกค้าA',phone:'0801',place_id:'sh1',status:'confirmed',starts_at:D1(1),ends_at:D1(1.04),total_price:400,created_at:D1(0),booking_items:[it('i1','นวดไทย',D1(1),'pending')]},
 {id:'b2',ref:'MS2',customer_name:'ลูกค้าB',phone:'0802',place_id:'sh1',status:'confirmed',starts_at:D1(-1),ends_at:D1(-0.96),total_price:400,created_at:D1(-2),booking_items:[it('i2','นวดไทย',D1(-1),'done')]},
 {id:'b3',ref:'MS3',customer_name:'ลูกค้าC',phone:'0803',place_id:'sh1',status:'completed',starts_at:D1(-2),ends_at:D1(-1.96),total_price:400,created_at:D1(-3),booking_items:[it('i3','นวดไทย',D1(-2),'done')]},
 {id:'b4',ref:'MS4',customer_name:'ลูกค้าD',phone:'0804',place_id:'sh1',status:'cancelled',starts_at:D1(2),ends_at:D1(2.04),total_price:400,created_at:D1(-1),booking_items:[it('i4','นวดไทย',D1(2),'pending',false)]},
 {id:'b5',ref:'MS5',customer_name:'ลูกค้าE',phone:'0805',place_id:'sh1',status:'rescheduled',moved_to:'MS6',starts_at:D1(3),ends_at:D1(3.04),total_price:400,created_at:D1(-1),booking_items:[it('i5','นวดไทย',D1(3),'pending',false)]},
 {id:'b7',ref:'MS7',customer_name:'ร้านอื่น',phone:'0807',place_id:'sh9',status:'confirmed',starts_at:D1(1),ends_at:D1(1.04),total_price:400,created_at:D1(0),booking_items:[]}
];
const T={
 categories:[{id:'c1',name:'ร้านนวดแผนไทย',kind:'shop',active:true},{id:'c2',name:'สปา',kind:'shop',active:true}],
 shop_members:[{place_id:'sh1',user_id:'u1',role:'owner'}],
 shop_registrations:[{id:'r0',owner_user_id:'u2',name:'ร้านรอผล',status:'pending',phone:'0822222222',created_at:now()}],
 places:[{id:'sh1',type:'shop',name:'ร้านสบายดี สปา',area:'สุขุมวิท',description:'',image_path:null,lat:null,lng:null,open_days:[0,1,2,3,4,5,6],open_time:'10:00:00',close_time:'21:00:00',advance_days:14,cancel_hours:24,gp_percent:10,active:true,auto_closed:false}],
 services:[{id:'v1',place_id:'sh1',name:'นวดไทย',minutes:60,price:400,description:'กดจุด',active:true,image_path:null,created_at:'1'},{id:'vUsed',place_id:'sh1',name:'นวดเท้า',minutes:60,price:350,description:'',active:true,image_path:null,created_at:'2'}],
 staff:[{id:'p1',place_id:'sh1',name:'คุณนุ่น',phone:'0899999999',photo_path:null,active:true,user_id:'u9',created_at:'1'}],
 staff_services:[{staff_id:'p1',service_id:'v1'}],
 promotions:[{id:'m1',place_id:'sh1',title:'ลดนวดเท้า',description:'',type:'percent',value:10,applies_all:false,start_date:'2026-10-01',end_date:'2026-12-31',image_path:null,active:true,created_at:'1'}],
 promotion_services:[{promotion_id:'m1',service_id:'vUsed'}],
 wallet_tx:[{id:'w1',place_id:'sh1',type:'credit',amount:1000,note:'เครดิตวงเงินเบื้องต้นจากสมาคม',ref:null,status:'success',created_at:'2026-10-10T02:00:00Z'},{id:'w2',place_id:'sh1',type:'gp',amount:-40,note:'หักค่า GP งาน MS1',ref:null,status:'success',created_at:'2026-10-12T02:00:00Z'}],
 topup_requests:[],
 reviews:[{id:'rv1',booking_id:'b3',customer_id:'c',place_id:'sh1',reviewer_first:'สมชาย',shop_rating:2,shop_comment:'รอนาน',shop_reply:null,hidden:false,reported:false,created_at:D1(-1)},{id:'rv2',booking_id:'b2',customer_id:'c',place_id:'sh1',reviewer_first:'มาลี',shop_rating:5,shop_comment:'ดีมาก',shop_reply:'ขอบคุณค่ะ',hidden:false,reported:false,created_at:D1(-2)},{id:'rv3',booking_id:'b8',customer_id:'c',place_id:'sh1',reviewer_first:'ผู้ซ่อน',shop_rating:1,shop_comment:'ไม่สุภาพ',hidden:true,reported:false,created_at:D1(-3)},{id:'rv9',booking_id:'b9',customer_id:'c',place_id:'sh9',reviewer_first:'ร้านอื่น',shop_rating:1,shop_comment:'ไม่ควรเห็น',hidden:false,reported:false,created_at:D1(-3)}],
 review_staff:[{id:'rs1',review_id:'rv1',booking_id:'b3',place_id:'sh1',staff_id:'p1',reviewer_first:'สมชาย',rating:4,comment:'สุภาพ',reply:null,hidden:false,reported:false,created_at:D1(-1)}],
 bookings:BK,
 notifications:[{id:'n9',audience:'shop',place_id:'sh1',kind:'announce',title:'📢 ปิดปรับปรุงระบบ',body:'คืนนี้',created_at:'2026-10-16T01:00:01Z'},{id:'n10',audience:'shop',place_id:'sh1',kind:'cancel',title:'ระบบยกเลิกคิวอัตโนมัติ',body:'MS9',created_at:'2026-10-17T01:00:00Z'},{id:'n1',audience:'shop',place_id:'sh1',kind:'booking',title:'มีการจองใหม่',body:'MS000001',created_at:'2026-10-15T02:00:00Z'},{id:'n2',audience:'shop',place_id:'sh1',kind:'job',title:'พนักงานเริ่มงาน',body:'x',created_at:'2026-10-15T03:00:00Z'},{id:'n3',audience:'shop',place_id:'sh1',kind:'wallet_low',title:'ยอดต่ำ',body:'y',created_at:'2026-10-15T04:00:00Z'}],
 notification_reads:[],
 announcements:[{id:'a1',title:'ปิดปรับปรุงระบบ',body:'คืนนี้',audiences:['ร้านค้า'],active:true,day:'2026-10-16',created_at:'2026-10-16T01:00:00Z'},{id:'a2',title:'เฉพาะผู้ใช้',body:'x',audiences:['ผู้ใช้งาน'],active:true,day:'2026-10-16',created_at:'2026-10-16T01:00:00Z'}],
 app_settings:[{...(process.env.NOURL?{}:{staff_url:process.env.BADURL||'https://staff.example.pages.dev/'}),promptpay_on:true,promptpay_type:'mobile',promptpay_id:'0812345678',promptpay_name:'สมาคมฯ',association_name:'สมาคมทดสอบ',address:'1 ถนนทดสอบ',phone:'021234567',line_url:'https://line.me/R/ti/p/@x',hours_text:'จ-ศ 9-17',wallet_warn1:100,wallet_warn2:50}]};
const sess=u=>({access_token:'at-'+u.id,refresh_token:'rt-'+u.id,expires_in:3600,user:{id:u.id,user_metadata:{phone:u.phone}}});
for(const [ph,u] of Object.entries(users))u.phone=ph;
const reps=[];let mode={fkErr:true,netDown:false};let MSGS=[{id:'m1',booking_id:'b1',room_key:'shop',sender_id:'cust',sender_role:'user',sender_name:'ลูกค้าA',body:'ขอเลื่อนเวลาได้ไหมคะ',created_at:'2026-10-29T10:00:00.000000+00:00'}];let UNR=[{booking_id:'b1',room:'shop',n:2}];let marks=[];
await ctx.route('**/*',async r=>{const q=r.request(),u=new URL(q.url());if(u.protocol==='file:')return r.continue();if(u.host==='cdnjs.cloudflare.com'&&/qrcode/.test(u.pathname))return r.fulfill({contentType:'application/javascript',body:"window.QRCode=function(el,o){var c=document.createElement('canvas');c.width=c.height=o.width;var x=c.getContext('2d');x.fillStyle='#000';x.fillRect(0,0,o.width/2,o.width/2);el.appendChild(c)};QRCode.CorrectLevel={M:0};"});if(!u.host.endsWith('supabase.co'))return r.abort();
 const m=q.method(),path=u.pathname,sp=u.searchParams;let body=null;try{body=JSON.parse(q.postData()||'null')}catch(e){}
 const hdr=q.headers(),auth=(hdr.authorization||'').replace('Bearer ',''),me=byTok(auth);calls.push({m,path,q:u.search,body,auth,pref:hdr.prefer||''});
 const J=(s,o)=>r.fulfill({status:s,contentType:'application/json',body:JSON.stringify(o)});
 if(mode.netDown)return r.abort();
 if(path==='/auth/v1/signup'){const e=body.email,ph=e.split('@')[0];if(users[ph])return J(422,{error_code:'user_already_exists',msg:'User already registered'});const id='u'+(++n);users[ph]={id,pw:body.password,phone:ph};return J(200,sess(users[ph]))}
 if(path==='/auth/v1/token'){if(sp.get('grant_type')==='refresh_token'){const u2=Object.values(users).find(x=>'rt-'+x.id===body.refresh_token);return u2?J(200,sess(u2)):J(400,{error_code:'refresh_token_not_found',msg:'bad'})}
  const ph=body.email.split('@')[0],us=users[ph];if(!us||us.pw!==body.password)return J(400,{error_code:'invalid_credentials',msg:'Invalid login credentials'});return J(200,sess(us))}
 if(path==='/rest/v1/rpc/public_contact'){if(process.env.NOCT)return J(200,null);return J(200,{name:'สมาคมทดสอบ',phone:'02-123-4567',line:'https://line.me/x',hours:'จ-ศ 9-17'})}
 if(path==='/auth/v1/user'&&m==='PUT'){puts.push(body);if(putSame)return J(422,{error_code:'same_password',msg:'New password should be different from the old password.'})}
 if(path==='/auth/v1/user'&&m==='PUT'){me.pw=body.password;return J(200,{id:me.id})}
 if(path==='/auth/v1/logout')return J(204,{});
 if(path.startsWith('/storage/v1/object/authenticated/'))return r.fulfill({status:200,contentType:'image/png',body:PNG});
 if(path.startsWith('/storage/v1/object/')){stor.push({path:path.replace('/storage/v1/object/',''),len:(q.postDataBuffer()||Buffer.alloc(0)).length,ct:hdr['content-type']});return J(200,{Key:'k'})}
 if(!me&&path!=='/rest/v1/categories')return J(401,{message:'JWT required',code:'PGRST301'});
 const rm=path.match(/^\/rest\/v1\/rpc\/(\w+)/);
 if(rm){const f=rm[1];
  if(f==='shop_save_staff'){if(T.staff.some(s=>s.phone===body.p_phone&&s.id!==body.p_id))return J(400,{code:'P0001',message:'เบอร์มือถือนี้ถูกใช้กับพนักงานคนอื่นแล้ว'});
   let s=body.p_id&&T.staff.find(x=>x.id===body.p_id);if(!s){s={id:'p'+(++n),place_id:body.p_place,active:true,user_id:null,created_at:'9'};T.staff.push(s)}
   Object.assign(s,{name:body.p_name,phone:body.p_phone,photo_path:body.p_photo});T.staff_services=T.staff_services.filter(x=>x.staff_id!==s.id).concat(body.p_services.map(v=>({staff_id:s.id,service_id:v})));return J(200,s.id)}
  if(f==='shop_save_promotion'){let p=body.p_id&&T.promotions.find(x=>x.id===body.p_id);if(!p){p={id:'m'+(++n),place_id:body.p_place,active:true,created_at:'9'};T.promotions.push(p)}
   Object.assign(p,{title:body.p_title,description:body.p_desc,type:body.p_type,value:body.p_value,applies_all:body.p_all,start_date:body.p_start,end_date:body.p_end,image_path:body.p_image});
   T.promotion_services=T.promotion_services.filter(x=>x.promotion_id!==p.id).concat(body.p_services.map(v=>({promotion_id:p.id,service_id:v})));return J(200,p.id)}
  if(f==='attach_topup_slip'){const t=T.topup_requests.find(x=>x.id===body.p_id);if(!t||t.status!=='pending')return J(400,{code:'P0001',message:'รายการนี้ปิดแล้ว ส่งสลิปไม่ได้'});t.slip_path=body.p_path;t.slip_at=now();return J(204,null)}
  if(f==='cancel_topup'){const t=T.topup_requests.find(x=>x.id===body.p_id);t.status='cancelled';return J(204,null)}
  if(f==='chat_unread')return J(200,UNR);
  if(f==='chat_mark_read'){marks.push(body);UNR=UNR.filter(x=>x.booking_id!==body.p_booking);return J(204,null)}
  if(f==='chat_send'){MSGS.push({id:'m'+(MSGS.length+1),booking_id:body.p_booking,room_key:body.p_room,sender_id:'u1',sender_role:'shop',sender_name:'ร้านสบายดี สปา',body:body.p_body,created_at:new Date().toISOString().replace('Z','000+00:00')});return J(200,'x')}
  if(f==='reply_review'){reps.push(body);const row=(body.p_kind==='shop'?T.reviews:T.review_staff).find(x=>x.id===body.p_id);if(body.p_kind==='shop'){if(row.shop_reply)return J(400,{code:'P0001',message:'ตอบรีวิวนี้ไปแล้ว'});row.shop_reply=body.p_text}else row.reply=body.p_text;return J(204,null)}
  if(f==='report_review'){reps.push(body);const row=(body.p_kind==='shop'?T.reviews:T.review_staff).find(x=>x.id===body.p_id);row.reported=true;return J(204,null)}
  return J(404,{message:'no rpc '+f})}
 if(path==='/rest/v1/chat_messages'){const bb=sp.get('booking_id').replace('eq.',''),rr=sp.get('room_key').replace('eq.','');return J(200,MSGS.filter(m=>m.booking_id===bb&&m.room_key===rr))}
 const tb=path.replace('/rest/v1/','');if(T[tb]===undefined)return J(404,{message:'nf '+path});
 let rows=T[tb];
 const filt=rr=>{for(const [k,v] of sp.entries()){if(['select','order','limit','on_conflict'].includes(k))continue;if(v.startsWith('eq.'))rr=rr.filter(x=>String(x[k])===v.slice(3))}return rr};
 if(m==='GET'){let rr=filt(rows);
  if(tb==='shop_members'||tb==='notification_reads')rr=rr.filter(x=>x.user_id===me.id);
  if(tb==='shop_registrations')rr=rr.filter(x=>x.owner_user_id===me.id);
  const sel=sp.get('select')||'';
  rr=rr.map(x=>{x=Object.assign({},x);if(sel.includes('staff_services('))x.staff_services=T.staff_services.filter(q=>q.staff_id===x.id).map(q=>({service_id:q.service_id}));if(sel.includes('promotion_services('))x.promotion_services=T.promotion_services.filter(q=>q.promotion_id===x.id).map(q=>({service_id:q.service_id}));return x});
  return J(200,rr)}
 if(m==='POST'){const arr=Array.isArray(body)?body:[body];const out=[];
  for(const b of arr){const row=Object.assign({id:tb[0]+(++n),created_at:now(),active:true},b);
   if(tb==='topup_requests'){row.status='pending';row.ref='TP00'+n}
   if(tb==='shop_registrations'){row.status='pending'}
   if(tb==='notification_reads'){if(T[tb].some(x=>x.notification_id===b.notification_id&&x.user_id===b.user_id))continue}
   T[tb].push(row);out.push(row)}
  return (q.headers().prefer||'').includes('representation')?J(201,out):J(201,null)}
 if(m==='PATCH'){filt(rows).forEach(x=>Object.assign(x,body));return J(204,null)}
 if(m==='DELETE'){if(tb==='services'&&mode.fkErr&&sp.get('id')==='eq.vUsed')return J(409,{code:'23503',message:'violates foreign key constraint'});const keep=rows.filter(x=>!filt([x]).length);T[tb]=keep;if(tb==='services')T.staff_services=T.staff_services.filter(x=>keep.some(s=>s.id===x.service_id));return J(204,null)}
 return J(404,{message:'nf'})});
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>{errs.push('DIALOG '+d.message());d.dismiss()});
const ok=(nm,c)=>console.log((c?'PASS ':'FAIL ')+nm);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const until=async(f,a)=>{try{await p.waitForFunction(f,a,{timeout:4000});return true}catch(e){return false}};
await p.addInitScript(()=>{window.__sh=[];window.__cp=[];
 if(!localStorage.getItem('NOSHARE')){navigator.share=async d=>{window.__sh.push(d)}}else{try{Object.defineProperty(navigator,'share',{value:undefined})}catch(e){}}
 try{Object.defineProperty(navigator,'clipboard',{value:{writeText:async t=>{window.__cp.push(t)}},configurable:true})}catch(e){}});
await p.goto(require('./config').page('shop-owner.html'));await p.evaluate(()=>localStorage.clear());await p.reload();
await until(()=>document.querySelector('#gph'));
await p.fill('#gph','0811111111');await p.fill('#gpw','abc123');await p.click('[data-g=login]');
ok('app opens',await until(()=>!document.getElementById('main').hidden&&document.getElementById('hdr').textContent.includes('สบายดี')));
await p.click('#tabs [data-id=mg]');await sleep(300);await p.click('[role=tab][data-id=staff]');await sleep(400);
ok('linked staff has no share button',!(await p.$('[data-a=stshare]')));
// add new staff
await p.click('[data-a=new][data-t=staff]');await sleep(200);
await p.fill('#fn','น้องใหม่');await p.fill('#fph','0866666666');
const ssc=await p.$$('.ss');if(ssc.length)await ssc[0].check();
await p.click('[data-a=save]');await sleep(900);
let t=await p.textContent('#main');
ok('after-save box',t.includes('เพิ่มน้องใหม่แล้ว')&&!!(await p.$('[data-a=stshare]')));
if(process.env.NOURL){
 await p.click('[data-a=stshare]');await sleep(200);
 ok('no url -> contact assoc msg',(await p.textContent('#main')).includes('ยังไม่ได้ตั้งลิงก์แอปพนักงาน')&&(await p.evaluate(()=>window.__sh.length+window.__cp.length))===0);
}else{
 await p.click('[data-a=stshare]');await sleep(300);
 const sh=await p.evaluate(()=>window.__sh);
 ok('native share called once',sh.length===1);
 ok('link has ?join=phone',sh[0]&&sh[0].text.includes('https://staff.example.pages.dev/?join=0866666666'));
 ok('NEW shop link has openExternalBrowser=1 + short msg',sh[0]&&sh[0].text.includes('?join=0866666666&openExternalBrowser=1')&&sh[0].text.includes('กดลิงก์ แล้วทำตามขั้นตอนติดตั้งในหน้านั้น')&&sh[0].text.includes('สมัครด้วยเบอร์ 0866666666'));
 ok('message wording',sh[0]&&sh[0].text.includes('น้องใหม่')&&sh[0].text.includes('0866666666')&&sh[0].text.includes('ร้านสบายดี'));
 ok('status shown',(await p.textContent('#main')).includes('เปิดเมนูแชร์'));
 // copy fallback
 await p.evaluate(()=>{navigator.share=undefined});
 await p.click('[data-a=stshare]');await sleep(300);
 const cp=await p.evaluate(()=>window.__cp);
 ok('clipboard fallback',cp.length===1&&cp[0].includes('?join=0866666666')&&(await p.textContent('#main')).includes('คัดลอก'));
 // list button for unlinked staff
 await p.click('[data-a=stnewno]');await sleep(200);
 const btns=await p.$$('[data-a=stshare]');ok('list button for unlinked only',btns.length===1);
 // share user rejects (AbortError) -> silent
 await p.evaluate(()=>{navigator.share=async()=>{const e=new Error('x');e.name='AbortError';throw e}});
 const cp0=(await p.evaluate(()=>window.__cp)).length;await p.click('[data-a=stshare]');await sleep(300);
 ok('cancel share does not copy',(await p.evaluate(()=>window.__cp)).length===cp0);
 // phone edit -> link uses new phone ; inactive staff has no button
 await p.click('[data-a=edit][data-t=staff]:nth-of-type(1)').catch(()=>{});
}
// tab switch clears box
await p.click('#tabs [data-id=q]');await sleep(200);await p.click('#tabs [data-id=mg]');await sleep(200);await p.click('[role=tab][data-id=staff]');await sleep(300);
ok('box cleared after leaving',!(await p.textContent('#main')).includes('เพิ่มน้องใหม่แล้ว'));
console.log('errors:',errs.join('|')||'none');await b.close();process.exit(0)})();
