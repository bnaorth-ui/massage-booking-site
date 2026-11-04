const {chromium}=require('playwright');
const PNG=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==','base64');
(async()=>{const b=await chromium.launch(require('./config').launch);
const ctx=await b.newContext({timezoneId:'Asia/Bangkok',locale:'th-TH'});const errs=[],calls=[],stor=[];
let n=100;const now=()=>new Date().toISOString();
const users={'0811111111':{id:'u1',pw:'adminpass1',name:'แอดมิน หนึ่ง'},'0833333333':{id:'u3',pw:'custpass1',name:'ลูกค้า'}};
for(const [ph,u] of Object.entries(users))u.phone=ph;
const byTok=t=>Object.values(users).find(u=>'at-'+u.id===t);
const T={admins:[],
 categories:[{id:'c1',name:'ร้านนวดแผนไทย',kind:'shop',description:'',active:true,created_at:'1'},{id:'c2',name:'หน่วยงานรัฐ',kind:'org',description:'',active:true,created_at:'2'}],
 places:[{id:'sh1',type:'shop',name:'ร้านสบายดี สปา',category_id:'c1',area:'สุขุมวิท',phone:'0899',image_path:null,lat:null,lng:null,open_time:'10:00:00',close_time:'21:00:00',fixed_date:null,advance_days:14,cancel_hours:24,gp_percent:10,active:true,auto_closed:false,status:'approved',created_at:'1'},
  {id:'sh2',type:'shop',name:'ร้านปิดอัตโนมัติ',category_id:'c1',area:'',phone:'0898',image_path:null,lat:13.7,lng:100.5,open_time:'10:00:00',close_time:'21:00:00',fixed_date:null,advance_days:14,cancel_hours:24,gp_percent:10,active:false,auto_closed:true,status:'approved',created_at:'2'},
  {id:'og1',type:'org',name:'สำนักงานเขต',category_id:'c2',area:'',phone:null,image_path:null,lat:13.75,lng:100.51,open_time:'09:00:00',close_time:'17:00:00',fixed_date:'2026-12-01',advance_days:30,cancel_hours:12,gp_percent:10,active:true,auto_closed:false,status:'approved',created_at:'3'}],
 services:[{id:'v1',place_id:null,name:'นวดไทยกลาง',minutes:60,price:400,description:'',active:true,image_path:null,created_at:'1'}],
 staff:[{id:'p1',place_id:null,name:'คุณกลาง',phone:'0866666666',photo_path:null,active:true,user_id:null,created_at:'1'},{id:'p2',place_id:null,name:'คุณสอง',phone:'0877777777',photo_path:null,active:true,user_id:'u7',created_at:'2'}],
 staff_services:[{staff_id:'p1',service_id:'v1'}],service_places:[{service_id:'v1',place_id:'og1'}],place_staff:[{place_id:'og1',staff_id:'p1',weekdays:[]}],
 announcements:[{id:'a1',title:'ประกาศเดิม',body:'ข้อความ',audiences:['ผู้ใช้งาน'],day:'2026-10-01',active:true,created_at:'1'}],
 app_settings:[{id:true,staff_url:'https://app.example/staff',association_name:'สมาคมวิทยากรฝึกอาชีพคนตาบอด',phone:'021234567',email:'a@b.c',default_minutes:60,shop_radius_km:10,org_radius_km:10,notify_user:true,notify_staff:true,promptpay_on:true,promptpay_type:'mobile',promptpay_id:'',promptpay_name:'',wallet_warn1:100,wallet_warn2:50,logo_path:null}],
 shop_registrations:[{id:'r1',owner_user_id:'u8',name:'ร้านใหม่หนึ่ง',phone:'0812340001',category_id:'c1',image_path:'avatars/u8/shop-x.jpg',license_path:'u8/license-x.jpg',status:'pending',created_at:'2026-10-17T03:00:00Z'},{id:'r2',owner_user_id:'u9',name:'ร้านใหม่สอง',phone:'0812340002',category_id:null,image_path:null,license_path:'u9/license-y.jpg',status:'pending',created_at:'2026-10-17T04:00:00Z'}],
 topup_requests:[{id:'t1',ref:'TP000001',place_id:'sh2',amount:500,status:'pending',slip_path:'sh2/TP000001-a.jpg',slip_at:'2026-10-17T05:00:00Z',created_at:'2026-10-17T04:30:00Z'},{id:'t2',ref:'TP000002',place_id:'sh1',amount:300,status:'pending',slip_path:null,slip_at:null,created_at:'2026-10-17T06:00:00Z'},{id:'t3',ref:'TP000003',place_id:'sh1',amount:200,status:'pending',slip_path:null,slip_at:null,created_at:'2026-10-17T07:00:00Z'}],
 notifications:[{id:'n1',audience:'admin',kind:'topup',title:'ร้านขอเติมเงิน 500 บาท',body:'อ้างอิง TP000001\nร้านปิดอัตโนมัติ',created_at:'2026-10-17T04:30:00Z'},{id:'n2',audience:'admin',kind:'status',title:'ร้านปิดรับจองชั่วคราว',body:'x',created_at:'2026-10-17T05:30:00Z'},{id:'n3',audience:'admin',kind:'approval',title:'มีคำขอลงทะเบียน',body:'y',created_at:'2026-10-17T06:30:00Z'}],
 notification_reads:[]};
const bal={sh1:{balance:960,owner_phone:'0899111111',owner_name:'สมหมาย ใจดี'},sh2:{balance:-600,owner_phone:'0898',owner_name:''},og1:null};
let mode={netDown:false};const INV=[];
await ctx.route('**/*',async r=>{const q=r.request(),u=new URL(q.url());if(u.protocol==='file:')return r.continue();if(!u.host.endsWith('supabase.co'))return r.abort();
 const m=q.method(),path=u.pathname,sp=u.searchParams;let body=null;try{body=JSON.parse(q.postData()||'null')}catch(e){}
 const hdr=q.headers(),auth=(hdr.authorization||'').replace('Bearer ',''),me=byTok(auth);calls.push({m,path,q:u.search,body,auth,pref:hdr.prefer||''});
 const J=(s,o)=>r.fulfill({status:s,contentType:'application/json',body:JSON.stringify(o)});
 if(mode.netDown)return r.abort();
 const sess=us=>({access_token:'at-'+us.id,refresh_token:'rt-'+us.id,expires_in:3600,user:{id:us.id,user_metadata:{phone:us.phone,first_name:us.name}}});
 if(path==='/auth/v1/signup'){const ph=body.email.split('@')[0];if(users[ph])return J(422,{error_code:'user_already_exists',msg:'User already registered'});const id='u'+(++n);users[ph]={id,pw:body.password,phone:ph,name:body.data.first_name};return J(200,sess(users[ph]))}
 if(path==='/auth/v1/token'){if(sp.get('grant_type')==='refresh_token'){const x=Object.values(users).find(z=>'rt-'+z.id===body.refresh_token);return x?J(200,sess(x)):J(400,{error_code:'bad',msg:'bad'})}
  const ph=body.email.split('@')[0],us=users[ph];if(!us||us.pw!==body.password)return J(400,{error_code:'invalid_credentials',msg:'Invalid login credentials'});return J(200,sess(us))}
 if(path==='/auth/v1/logout')return J(204,{});
 if(path.startsWith('/storage/v1/object/authenticated/'))return r.fulfill({status:200,contentType:'image/png',body:PNG});
 if(path.startsWith('/storage/v1/object/')){stor.push({path:path.replace('/storage/v1/object/',''),len:(q.postDataBuffer()||Buffer.alloc(0)).length});return J(200,{Key:'k'})}
 const rm=path.match(/^\/rest\/v1\/rpc\/(\w+)/);
 if(rm){const f=rm[1],isA=me&&T.admins.includes(me.id);
  if(f==='admin_exists')return J(200,T.admins.length>0);
  if(!me)return J(401,{message:'JWT'});
  if(f==='is_admin')return J(200,isA);
  if(f==='claim_first_admin'){if(T.admins.length)return J(400,{code:'P0001',message:'ระบบมีแอดมินอยู่แล้ว ให้แอดมินคนเดิมเพิ่มสิทธิ์ให้'});T.admins.push(me.id);return J(204,null)}
  if(f==='admin_invite_claim'){const iv=INV.find(x=>x.phone===me.phone&&!x.used&&!x.cancelled);if(isA)return J(200,{ok:true,msg:'เป็นแอดมินอยู่แล้ว'});const BAD={ok:false,msg:'รหัสเชิญไม่ถูกต้อง หรือคำเชิญหมดอายุ ให้ขอรหัสใหม่จากแอดมิน'};if(!iv||iv.attempts>=5)return J(200,BAD);if(String(body.p_code).trim()!==iv.code){iv.attempts++;return J(200,BAD)}iv.used=true;T.admins.push(me.id);return J(200,{ok:true,msg:'ok'})}
  if(!isA)return J(400,{code:'P0001',message:'เฉพาะแอดมินเท่านั้น'});
  if(f==='admin_shop_overview')return J(200,T.places.filter(p=>p.type==='shop').map(p=>({place_id:p.id,balance:bal[p.id].balance,owner_phone:bal[p.id].owner_phone,owner_name:bal[p.id].owner_name})));
  if(f==='admin_list')return J(200,T.admins.map(id=>{const us=Object.values(users).find(z=>z.id===id);return{user_id:id,name:us?us.name:'',phone:us?us.phone:'',created_at:now()}}));
  if(f==='admin_invite_create'){if(users[body.p_phone])return J(400,{code:'P0001',message:'เบอร์นี้มีบัญชีอยู่แล้ว ให้ใช้ปุ่ม เพิ่มเป็นแอดมิน แทน (เจ้าของเบอร์ล็อกอินด้วยรหัสผ่านเดิม)'});INV.filter(x=>x.phone===body.p_phone).forEach(x=>x.cancelled=true);const iv={id:'iv'+(++n),phone:body.p_phone,code:'123456',attempts:0,used:false,cancelled:false,expires_at:new Date(Date.now()+48*36e5).toISOString(),created_at:now()};INV.push(iv);return J(200,{id:iv.id,phone:iv.phone,code:iv.code,expires_at:iv.expires_at})}
  if(f==='admin_invite_list')return J(200,INV.filter(x=>!x.used&&!x.cancelled).map(x=>({id:x.id,phone:x.phone,created_at:x.created_at,expires_at:x.expires_at,attempts:x.attempts})));
  if(f==='admin_invite_cancel'){const x=INV.find(z=>z.id===body.p_id);if(x)x.cancelled=true;return J(204,null)}
  if(f==='add_admin'){const us=users[body.p_phone];if(!us)return J(400,{code:'P0001',message:'ไม่พบบัญชีที่ใช้เบอร์นี้ ให้เจ้าของเบอร์สมัครสมาชิกก่อน'});if(!T.admins.includes(us.id))T.admins.push(us.id);return J(204,null)}
  if(f==='remove_admin'){T.admins=T.admins.filter(x=>x!==body.p_user);return J(204,null)}
  if(f==='approve_shop_registration'){const rg=T.shop_registrations.find(x=>x.id===body.p_reg&&x.status==='pending');if(!rg)return J(400,{code:'P0001',message:'ไม่พบคำขอ หรือดำเนินการไปแล้ว'});rg.status='approved';const id='sh'+(++n);T.places.push({id,type:'shop',name:rg.name,category_id:rg.category_id,area:'',phone:rg.phone,image_path:rg.image_path,lat:null,lng:null,open_time:'10:00:00',close_time:'21:00:00',advance_days:14,cancel_hours:24,gp_percent:body.p_gp,active:true,auto_closed:false,status:'approved',created_at:'9'});bal[id]={balance:body.p_credit,owner_phone:rg.phone,owner_name:''};return J(200,id)}
  if(f==='reject_shop_registration'){const rg=T.shop_registrations.find(x=>x.id===body.p_reg);rg.status='rejected';rg.reject_reason=body.p_reason;return J(204,null)}
  if(f==='confirm_topup'){const t=T.topup_requests.find(x=>x.id===body.p_id);t.status=body.p_ok?'confirmed':'rejected';if(body.p_ok)bal[t.place_id].balance+=t.amount;return J(204,null)}
  if(f==='give_credit'){bal[body.p_place].balance+=body.p_amount;return J(204,null)}
  if(f==='admin_save_staff'){if(T.staff.some(s=>s.phone===body.p_phone&&s.id!==body.p_id))return J(400,{code:'P0001',message:'เบอร์มือถือนี้ถูกใช้กับพนักงานคนอื่นแล้ว'});let s=body.p_id&&T.staff.find(x=>x.id===body.p_id);if(!s){s={id:'p'+(++n),place_id:null,active:true,user_id:null,created_at:'9'};T.staff.push(s)}Object.assign(s,{name:body.p_name,phone:body.p_phone,photo_path:body.p_photo});T.staff_services=T.staff_services.filter(x=>x.staff_id!==s.id).concat(body.p_services.map(v=>({staff_id:s.id,service_id:v})));return J(200,s.id)}
  if(f==='admin_save_place'){if(body.p_staff.some(x=>x.staff_id==='p2')&&body.p_type==='org'&&body.p_fixed_date==='2026-12-01')return J(400,{code:'P0001',message:'พนักงาน คุณสอง ถูกจัดให้ สำนักงานเขต ในวันเดียวกันแล้ว'});
   let p=body.p_id&&T.places.find(x=>x.id===body.p_id);if(!p){p={id:'pl'+(++n),type:body.p_type,status:'approved',active:true,auto_closed:false,gp_percent:10,area:'',created_at:'9'};T.places.push(p)}
   Object.assign(p,{name:body.p_name,category_id:body.p_category,lat:body.p_lat,lng:body.p_lng,open_time:body.p_open+':00',close_time:body.p_close+':00',fixed_date:body.p_type==='org'?body.p_fixed_date:null,advance_days:body.p_adv,cancel_hours:body.p_cancel,lunch_start:body.p_lunch_start?body.p_lunch_start+':00':null,lunch_end:body.p_lunch_end?body.p_lunch_end+':00':null});
   T.service_places=T.service_places.filter(x=>x.place_id!==p.id).concat(body.p_services.map(v=>({service_id:v,place_id:p.id})));T.place_staff=T.place_staff.filter(x=>x.place_id!==p.id).concat(body.p_staff.map(s=>({place_id:p.id,staff_id:s.staff_id,weekdays:s.weekdays})));return J(200,p.id)}
  return J(404,{message:'no rpc '+f})}
 if(!me||!T.admins.includes(me.id))return J(403,{code:'42501',message:'permission denied'});
 const tb=path.replace('/rest/v1/','');if(T[tb]===undefined)return J(404,{message:'nf '+path});
 const filt=rr=>{for(const [k,v] of sp.entries()){if(['select','order','limit','on_conflict'].includes(k))continue;if(v==='is.null')rr=rr.filter(x=>x[k]==null);else if(v.startsWith('eq.'))rr=rr.filter(x=>String(x[k])===v.slice(3))}return rr};
 if(m==='GET'){let rr=filt(T[tb]);const sel=sp.get('select')||'';
  rr=rr.map(x=>{x=Object.assign({},x);if(sel.includes('staff_services('))x.staff_services=T.staff_services.filter(q=>q.staff_id===x.id).map(q=>({service_id:q.service_id}));if(sel.includes('places(name)'))x.places={name:(T.places.find(p=>p.id===x.place_id)||{}).name};return x});
  if(tb==='notification_reads')rr=rr.filter(x=>x.user_id===me.id);return J(200,rr)}
 if(m==='POST'){const arr=Array.isArray(body)?body:[body];for(const bd of arr){const row=Object.assign({id:tb[0]+(++n),created_at:now(),active:true},bd);if(tb==='notification_reads'&&T[tb].some(x=>x.notification_id===bd.notification_id&&x.user_id===bd.user_id))continue;T[tb].push(row)}return J(201,null)}
 if(m==='PATCH'){filt(T[tb]).forEach(x=>Object.assign(x,body));return J(204,null)}
 if(m==='DELETE'){const keep=T[tb].filter(x=>!filt([x]).length);if(tb==='places'&&sp.get('id')==='eq.sh1')return J(409,{code:'23503',message:'fk'});T[tb]=keep;return J(204,null)}
 return J(404,{message:'nf'})});
const p=await ctx.newPage();await p.setViewportSize({width:420,height:900});p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>{errs.push('DIALOG '+d.message());d.dismiss()});
const ok=(nm,c)=>console.log((c?'PASS ':'FAIL ')+nm);
const txt=async s=>await p.textContent(s||'body');
const until=async(f,a)=>{try{await p.waitForFunction(f,a,{timeout:4000});return true}catch(e){return false}};
const has=async t=>until(x=>document.body.innerText.includes(x),t);
const wait=async ms=>p.waitForTimeout(ms);const has2=async t=>p.waitForFunction(x=>document.body.innerText.includes(x),t,{timeout:600}).then(()=>true,()=>false);
await p.goto(require('./config').page('admin-panel.html'));
await p.fill('#sn','แอดมิน หนึ่ง');await p.fill('#sph','0811111111');await p.fill('#spw','adminpass1');await p.fill('#spw2','adminpass1');await p.click('button[type=submit]');
ok('first admin created',await until(()=>document.getElementById('tabs').textContent.includes('หน้าหลัก')));
await p.click('#tabs [data-id=sys]');await p.click('[data-a=tab][data-id=set]');await p.click('[data-a=sub][data-id=a]');
ok('invite section shown',await has('เชิญแอดมินที่ยังไม่มีบัญชี'));
await p.fill('#invph','12');await p.click('[data-a=invcreate]');ok('bad phone blocked client-side',(await txt('#inverr')).includes('10 หลัก'));
await p.fill('#invph','0833333333');await p.click('[data-a=invcreate]');ok('existing account -> server message',await has('เบอร์นี้มีบัญชีอยู่แล้ว'));
await p.fill('#invph','0844444444');await p.click('[data-a=invcreate]');
ok('invite card shows code',await has('คำเชิญสำหรับ 0844444444')&&(await txt('#main')).includes('123456'));
ok('pending list has the invite',(await p.$$eval('[data-a=invcancel]',e=>e.length))===1);
ok('create rpc sent phone',calls.some(c=>c.path.endsWith('admin_invite_create')&&c.body.p_phone==='0844444444'));
await p.evaluate(()=>{window.__cp=null;Object.defineProperty(navigator,'share',{value:undefined,configurable:true});Object.defineProperty(navigator,'clipboard',{value:{writeText:t=>{window.__cp=t;return Promise.resolve()}},configurable:true})});
await p.click('[data-a=invshare]');await wait(250);const cp=await p.evaluate(()=>window.__cp);
ok('share msg: join link, phone, no code',!!cp&&cp.includes('?join=0844444444&openExternalBrowser=1')&&cp.includes('เบอร์ 0844444444')&&!cp.includes('123456')&&cp.includes('รหัสเชิญ 6 หลัก'));
ok('share toast mentions code is separate',await has('แจ้งรหัสแยกให้ผู้รับ'));
await p.click('[data-a=invdone]');ok('closing card hides code (shown once)',!(await txt('#main')).includes('123456'));
ok('pending still listed after card closed',(await p.$$eval('[data-a=invcancel]',e=>e.length))===1);
await p.fill('#invph','0855555555');await p.click('[data-a=invcreate]');await until(()=>document.querySelectorAll('[data-a=invcancel]').length===2);
await p.click('[data-a=invcancel][data-id='+INV.find(x=>x.phone==='0855555555').id+']');await until(()=>document.querySelectorAll('[data-a=invcancel]').length===1);
ok('cancel removes invite',INV.find(x=>x.phone==='0855555555').cancelled===true&&(await p.$$eval('[data-a=invcancel]',e=>e.length))===1);
// ผู้รับคำเชิญ
await p.click('[data-a=logout]');await until(()=>document.querySelector('#aph'));
ok('login screen has invite link',await has('ได้รับคำเชิญ? สร้างบัญชีแอดมิน'));
await p.goto(require('./config').page('admin-panel.html')+'?join=0844444444');
ok('?join= opens join screen with phone prefilled',await until(()=>document.querySelector('#jph'))&&(await p.inputValue('#jph'))==='0844444444');
await p.fill('#jn','แอดมิน สอง');await p.fill('#jpw','newadmin99');await p.fill('#jpw2','newadmin98');await p.fill('#jcode','123456');await p.click('button[type=submit]');ok('password mismatch blocked',await has('ไม่ตรงกัน'));
await p.fill('#jpw2','newadmin99');await p.fill('#jcode','12ab');await p.click('button[type=submit]');ok('non-digit code blocked',await has('ตัวเลข 6 หลัก'));
await p.fill('#jcode','999999');await p.click('button[type=submit]');
ok('wrong code -> generic error, not admin',await has('รหัสเชิญไม่ถูกต้อง หรือคำเชิญหมดอายุ')&&!T.admins.includes(users['0844444444'].id));
ok('attempt counted',INV.find(x=>x.phone==='0844444444').attempts===1);
await p.fill('#jcode','123456');await p.click('button[type=submit]');
ok('correct code -> admin app opens',await until(()=>document.getElementById('tabs').textContent.includes('หน้าหลัก')));
ok('new account is admin and invite used',T.admins.includes(users['0844444444'].id)&&INV.find(x=>x.phone==='0844444444').used===true);
ok('claim rpc used new user bearer',calls.some(c=>c.path.endsWith('admin_invite_claim')&&c.auth==='at-'+users['0844444444'].id&&c.body.p_code==='123456'));
// คนทั่วไปไม่มีคำเชิญ
await p.click('[data-a=logout]');await until(()=>document.querySelector('#aph'));
await p.goto(require('./config').page('admin-panel.html')+'?join=0866666666');await until(()=>document.querySelector('#jph'));
await p.fill('#jn','คนแปลกหน้า');await p.fill('#jpw','strangerpw1');await p.fill('#jpw2','strangerpw1');await p.fill('#jcode','123456');await p.click('button[type=submit]');
ok('no invite -> same generic error, no admin',await has('รหัสเชิญไม่ถูกต้อง หรือคำเชิญหมดอายุ')&&!T.admins.includes(users['0866666666'].id));
console.log('errors:',errs.join('|')||'none');await b.close();process.exit(0)})();
