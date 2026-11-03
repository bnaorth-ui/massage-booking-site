const {chromium}=require('playwright');
const PNG=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==','base64');
(async()=>{const b=await chromium.launch(require('./config').launch);
const ctx=await b.newContext({timezoneId:'Asia/Bangkok',locale:'th-TH'});const errs=[],calls=[],stor=[];
let n=100;const now=()=>new Date().toISOString();
const users={'0811111111':{id:'u1',pw:'adminpass1',name:'แอดมิน หนึ่ง'},'0833333333':{id:'u3',pw:'custpass1',name:'ลูกค้า'}};
for(const [ph,u] of Object.entries(users))u.phone=ph;
const byTok=t=>Object.values(users).find(u=>'at-'+u.id===t);
const D1=d=>new Date(Date.now()+d*864e5).toISOString();
const it=(id,a,job,act=true,sn='คุณนุ่น')=>({id,service_name:'นวดไทย',minutes:60,active:act,job,starts_at:a,staff:{name:sn}});
const nowB=new Date(Date.now()+252e5),Y=nowB.getUTCFullYear(),M0=String(nowB.getUTCMonth()+1).padStart(2,'0');
const at=(d,h,m=0)=>new Date(`${Y}-${M0}-${String(d).padStart(2,'0')}T${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:00+07:00`).toISOString();
const RB=(id,ref,cu,nm,d,h,st,job,sv,stf,act=true)=>({id,ref,customer_id:cu,customer_name:nm,phone:'0899999999',place_id:'og1',status:st,starts_at:at(d,h),ends_at:at(d,h+1),total_price:0,booking_items:[{id:'x'+id,service_name:sv,minutes:60,active:act,job,starts_at:at(d,h),ends_at:at(d,h+1),started_at:job==='done'?at(d,h,5):null,done_at:job==='done'?at(d,h,58):null,staff:{name:stf}}]});
const RPT=[RB('r1','MS201','c1','สมชาย ใจดี',1,9,'confirmed','done','นวดไทย','คุณนุ่น'),RB('r2','MS202','c1','สมชาย ใจดี',2,9,'confirmed','done','นวดเท้า','คุณนุ่น'),RB('r3','MS203','c2','สมหญิง รักดี',2,13,'completed','done','นวดไทย','คุณวิภา'),RB('r4','MS204','c3','มานะ',3,13,'cancelled','pending','นวดไทย','คุณวิภา',false),RB('r5','MS205','c2','สมหญิง รักดี',4,10,'confirmed','pending','นวดไทย','คุณนุ่น')];
const BKX=[
 {id:'b1',ref:'MS1',customer_name:'ลูกค้าใหม่',phone:'0801',place_id:'og1',status:'confirmed',starts_at:D1(1),ends_at:D1(1.04),total_price:0,booking_items:[it('i1',D1(1),'pending')]},
 {id:'b2',ref:'MS2',customer_name:'ลูกค้ารับแล้ว',phone:'0802',place_id:'og1',status:'confirmed',starts_at:D1(2),ends_at:D1(2.04),total_price:0,booking_items:[it('i2',D1(2),'accepted')]},
 {id:'b3',ref:'MS3',customer_name:'ลูกค้าเสร็จ',phone:'0803',place_id:'og1',status:'confirmed',starts_at:D1(-1),ends_at:D1(-0.96),total_price:0,booking_items:[it('i3',D1(-1),'done')]},
 {id:'b4',ref:'MS4',customer_name:'ลูกค้ายกเลิก',phone:'0804',place_id:'og1',status:'cancelled',starts_at:D1(3),ends_at:D1(3.04),total_price:0,booking_items:[it('i4',D1(3),'pending',false)]},
 {id:'b5',ref:'MS5',customer_name:'ของร้านนวด',phone:'0805',place_id:'sh1',status:'confirmed',starts_at:D1(1),ends_at:D1(1.04),total_price:400,booking_items:[]}
];
const T={bookings:BKX.filter(b=>b.place_id!=='og1').concat(RPT),admins:[],
 categories:[{id:'c1',name:'ร้านนวดแผนไทย',kind:'shop',description:'',active:true,created_at:'1'},{id:'c2',name:'หน่วยงานรัฐ',kind:'org',description:'',active:true,created_at:'2'}],
 places:[{id:'sh1',type:'shop',name:'ร้านสบายดี สปา',category_id:'c1',area:'สุขุมวิท',phone:'0899',image_path:null,lat:null,lng:null,open_time:'10:00:00',close_time:'21:00:00',fixed_date:null,advance_days:14,cancel_hours:24,gp_percent:10,active:true,auto_closed:false,status:'approved',created_at:'1'},
  {id:'sh2',type:'shop',name:'ร้านปิดอัตโนมัติ',category_id:'c1',area:'',phone:'0898',image_path:null,lat:13.7,lng:100.5,open_time:'10:00:00',close_time:'21:00:00',fixed_date:null,advance_days:14,cancel_hours:24,gp_percent:10,active:false,auto_closed:true,status:'approved',created_at:'2'},
  {id:'og1',type:'org',name:'สำนักงานเขต',category_id:'c2',area:'',phone:null,image_path:null,lat:13.75,lng:100.51,open_time:'09:00:00',close_time:'17:00:00',fixed_date:'2026-12-01',advance_days:30,cancel_hours:12,gp_percent:10,active:true,auto_closed:false,status:'approved',created_at:'3'}],
 services:[{id:'v1',place_id:null,name:'นวดไทยกลาง',minutes:60,price:400,description:'',active:true,image_path:null,created_at:'1'}],
 staff:[{id:'p1',place_id:null,name:'คุณกลาง',phone:'0866666666',photo_path:null,active:true,user_id:null,created_at:'1'},{id:'p2',place_id:null,name:'คุณสอง',phone:'0877777777',photo_path:null,active:true,user_id:'u7',created_at:'2'}],
 staff_services:[{staff_id:'p1',service_id:'v1'}],service_places:[{service_id:'v1',place_id:'og1'}],place_staff:[{place_id:'og1',staff_id:'p1',weekdays:[]}],
 announcements:[{id:'a1',title:'ประกาศเดิม',body:'ข้อความ',audiences:['ผู้ใช้งาน'],day:'2026-10-01',active:true,created_at:'1'}],
 app_settings:[{id:true,address:'เลขที่ 99 ถนนทดสอบ แขวงสมมติ เขตตัวอย่าง กรุงเทพฯ 10000',association_name:'สมาคมวิทยากรฝึกอาชีพคนตาบอด',phone:'021234567',email:'a@b.c',default_minutes:60,shop_radius_km:10,org_radius_km:10,notify_user:true,notify_staff:true,promptpay_on:true,promptpay_type:'mobile',promptpay_id:'',promptpay_name:'',wallet_warn1:100,wallet_warn2:50,logo_path:null}],
 shop_registrations:[{id:'r1',owner_user_id:'u8',name:'ร้านใหม่หนึ่ง',phone:'0812340001',category_id:'c1',image_path:'avatars/u8/shop-x.jpg',license_path:'u8/license-x.jpg',status:'pending',created_at:'2026-10-17T03:00:00Z'},{id:'r2',owner_user_id:'u9',name:'ร้านใหม่สอง',phone:'0812340002',category_id:null,image_path:null,license_path:'u9/license-y.jpg',status:'pending',created_at:'2026-10-17T04:00:00Z'}],
 topup_requests:[{id:'t1',ref:'TP000001',place_id:'sh2',amount:500,status:'pending',slip_path:'sh2/TP000001-a.jpg',slip_at:'2026-10-17T05:00:00Z',created_at:'2026-10-17T04:30:00Z'},{id:'t2',ref:'TP000002',place_id:'sh1',amount:300,status:'pending',slip_path:null,slip_at:null,created_at:'2026-10-17T06:00:00Z'},{id:'t3',ref:'TP000003',place_id:'sh1',amount:200,status:'pending',slip_path:null,slip_at:null,created_at:'2026-10-17T07:00:00Z'}],
 notifications:[{id:'n1',audience:'admin',kind:'topup',title:'ร้านขอเติมเงิน 500 บาท',body:'อ้างอิง TP000001\nร้านปิดอัตโนมัติ',created_at:'2026-10-17T04:30:00Z'},{id:'n2',audience:'admin',kind:'status',title:'ร้านปิดรับจองชั่วคราว',body:'x',created_at:'2026-10-17T05:30:00Z'},{id:'n3',audience:'admin',kind:'approval',title:'มีคำขอลงทะเบียน',body:'y',created_at:'2026-10-17T06:30:00Z'}],
 notification_reads:[]};
const bal={sh1:{balance:960,owner_phone:'0899111111',owner_name:'สมหมาย ใจดี'},sh2:{balance:-600,owner_phone:'0898',owner_name:''},og1:null};
let mode={netDown:false};
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
  if(!isA)return J(400,{code:'P0001',message:'เฉพาะแอดมินเท่านั้น'});
  if(f==='admin_shop_overview')return J(200,T.places.filter(p=>p.type==='shop').map(p=>({place_id:p.id,balance:bal[p.id].balance,owner_phone:bal[p.id].owner_phone,owner_name:bal[p.id].owner_name})));
  if(f==='admin_list')return J(200,T.admins.map(id=>{const us=Object.values(users).find(z=>z.id===id);return{user_id:id,name:us?us.name:'',phone:us?us.phone:'',created_at:now()}}));
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
 const filt=rr=>{for(const [k,v] of sp.entries()){if(['select','order','limit','on_conflict'].includes(k))continue;if(v==='is.null')rr=rr.filter(x=>x[k]==null);else if(k==='starts_at'){}else if(v.startsWith('in.('))rr=rr.filter(x=>v.slice(4,-1).split(',').includes(String(x[k])));else if(v.startsWith('eq.'))rr=rr.filter(x=>String(x[k])===v.slice(3))}return rr};
 if(m==='GET'){let rr=filt(T[tb]);if(tb==='bookings'&&sp.getAll('starts_at').length){const gte=sp.getAll('starts_at').find(x=>x.startsWith('gte.')),lt=sp.getAll('starts_at').find(x=>x.startsWith('lt.'));rr=rr.filter(x=>(!gte||x.starts_at>=gte.slice(4))&&(!lt||x.starts_at<lt.slice(3)))}const sel=sp.get('select')||'';
  rr=rr.map(x=>{x=Object.assign({},x);if(sel.includes('staff_services('))x.staff_services=T.staff_services.filter(q=>q.staff_id===x.id).map(q=>({service_id:q.service_id}));if(sel.includes('places(name,type)')){const q=T.places.find(p=>p.id===x.place_id)||{};x.places={name:q.name,type:q.type}}else if(sel.includes('places(name)'))x.places={name:(T.places.find(p=>p.id===x.place_id)||{}).name};return x});
  if(tb==='notification_reads')rr=rr.filter(x=>x.user_id===me.id);return J(200,rr)}
 if(m==='POST'){const arr=Array.isArray(body)?body:[body];for(const bd of arr){const row=Object.assign({id:tb[0]+(++n),created_at:now(),active:true},bd);if(tb==='notification_reads'&&T[tb].some(x=>x.notification_id===bd.notification_id&&x.user_id===bd.user_id))continue;T[tb].push(row)}return J(201,null)}
 if(m==='PATCH'){filt(T[tb]).forEach(x=>Object.assign(x,body));return J(204,null)}
 if(m==='DELETE'){const keep=T[tb].filter(x=>!filt([x]).length);if(tb==='places'&&sp.get('id')==='eq.sh1')return J(409,{code:'23503',message:'fk'});T[tb]=keep;return J(204,null)}
 return J(404,{message:'nf'})});

const p=await ctx.newPage();await p.setViewportSize({width:420,height:900});p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>{errs.push('DIALOG '+d.message());d.dismiss()});
const ok=(nm,c)=>console.log((c?'PASS ':'FAIL ')+nm);

const GRP={shop:'pl',org:'pl',comp:'pl',staff:'pl',pp:'fin',rp:'fin',svc:'sys',cat:'sys',ann:'sys',set:'sys'};
const goTab=async id=>{if(id==='q'||id==='nt'){await p.click('#tabs [data-id='+id+']');return}if(id==='pp')id='pprq';const g=GRP[id==='pprq'||id==='ppac'?'pp':id];await p.click('#tabs [data-id='+g+']');await p.waitForTimeout(150);await p.click('#main .subtabs.mgb [data-id='+id+']')};
const until=async(f,a)=>{try{await p.waitForFunction(f,a,{timeout:4000});return true}catch(e){return false}};
await p.goto(require('./config').page('admin-panel.html'));
await until(()=>document.querySelector('#spw'));
await p.fill('#sn','แอดมิน หนึ่ง');await p.fill('#sph','0811111111');await p.fill('#spw','adminpass1');await p.fill('#spw2','adminpass1');await p.click('button[type=submit]');
await until(()=>document.getElementById('hacts').textContent.includes('ออกจากระบบ')&&document.getElementById('tabs').children.length>0);
const tabs=await p.$$eval('#tabs button',b=>b.map(x=>x.textContent.trim()));
ok('tab order: หน้าหลัก, สถานที่และคน, การเงิน ('+tabs.slice(0,3).join('|')+')',tabs[0].includes('หน้าหลัก')&&tabs[1].includes('สถานที่และคน')&&tabs[2].includes('การเงิน'));
await goTab('set');
ok('address field in settings with value',(await p.$eval('#c4',e=>e.value)).includes('เลขที่ 99'));
await p.fill('#c4','ที่อยู่ใหม่ 1/2');await p.click('[data-a=setsave]');await p.waitForTimeout(400);
const pc2=calls.filter(c=>c.m==='PATCH'&&c.path.endsWith('app_settings')).pop();ok('address saved in PATCH',!!pc2&&pc2.body.address==='ที่อยู่ใหม่ 1/2');
await goTab('rp');
await p.click('[data-a=rpgo]');ok('asks to choose place',(await p.textContent('#main')).includes('กรุณาเลือกหน่วยงานหรือบริษัท'));
await p.selectOption('#rpp','og1');await p.click('[data-a=rpgo]');
ok('report rendered',await until(()=>document.body.innerText.includes('สรุปภาพรวม')));
const t=await p.textContent('#main');
const sm=await p.$$eval('.rps div',d=>d.map(x=>x.querySelector('small').textContent+'='+x.querySelector('b').textContent));console.log(sm.join(' | '));
const hd=await p.$eval('.rph',e=>({img:!!e.querySelector('img.rplogo')&&e.querySelector('img.rplogo').getAttribute('src').length>20,t:e.innerText}));
ok('header has logo + address + phone/email',hd.img&&hd.t.includes('ที่อยู่ใหม่ 1/2')&&hd.t.includes('โทร 021234567')&&hd.t.includes('a@b.c'));
await p.locator('.rph').screenshot({path:require('./config').tmp('rep_head.png')});
ok('summary: tot5 done3 open1 cx1 cust2 hrs3',sm.join()==='คิวทั้งหมด=5,เสร็จสิ้น=3,รอให้บริการ=1,ยกเลิก=1,เลื่อนคิว=0,ผู้ใช้บริการ (คน)=2,เวลาที่ให้บริการ=3 ชม.');
ok('service table counts',/นวดไทย[\s\S]*?3/.test(t)&&t.includes('นวดเท้า'));
ok('staff names',t.includes('คุณนุ่น')&&t.includes('คุณวิภา'));
ok('name masked, phone hidden',t.includes('สมชาย ใ***')&&!t.includes('สมชาย ใจดี')&&!t.includes('0899999999')&&t.includes('มา***'));
ok('actual times shown (09:05 - 09:58) and duration',t.includes('09:05 - 09:58')&&t.includes('60 นาที')&&t.includes('เวลาให้บริการจริง'));
const sb=await p.$$eval('.rpst',e=>e.map(x=>x.querySelector('b').textContent+'#'+x.querySelectorAll('tbody tr').length));console.log(sb.join(' | '));
ok('per-staff blocks (นุ่น 3 คิว, วิภา 1 คิว, cancelled excluded)',sb.join()==='พนักงาน: คุณนุ่น (3 คิว)#3,พนักงาน: คุณวิภา (1 คิว)#1');
ok('per-staff row has start-end, actual, masked customer',(await p.$eval('.rpst',e=>e.innerText)).includes('09:00 - 10:00')&&(await p.$eval('.rpst',e=>e.innerText)).includes('09:05 - 09:58')&&(await p.$eval('.rpst',e=>e.innerText)).includes('สมชาย ใ***'));
ok('detail rows 5',(await p.$$eval('.rpw:not(.rpst .rpw) tbody tr',r=>r.length))===5);
ok('no other org bookings',!t.includes('ลูกค้าใหม่'));
const [dl]=await Promise.all([p.waitForEvent('download'),p.click('[data-a=rpcsv]')]);
const path=await dl.path();const csv=require('fs').readFileSync(path,'utf8');
ok('csv has actual times',csv.includes('"09:05","09:58"')&&csv.split('\r\n')[0].split(',').length===10);
ok('csv BOM + header + masked ('+dl.suggestedFilename()+')',csv.startsWith('\ufeff"วันที่"')&&csv.includes('สมชาย ใ***')&&!csv.includes('0899')&&csv.trim().split('\r\n').length===6);


// ---- ปุ่มพิมพ์: เปิดหน้าใหม่ที่พร้อมพิมพ์
await p.click('[data-a=rpgo]');await until(()=>document.body.innerText.includes('สรุปภาพรวม'));
{const [dlp]=await Promise.all([p.waitForEvent('download'),p.click('[data-a=rppdf]')]);const pth=await dlp.path(),buf=require('fs').readFileSync(pth);
 ok('report pdf filename ('+dlp.suggestedFilename()+')',/^report-\d{4}-\d{2}\.pdf$/.test(dlp.suggestedFilename()));
 ok('report pdf header/trailer',buf.slice(0,5).toString()==='%PDF-'&&buf.slice(-6).toString().includes('%%EOF'));
 require('fs').copyFileSync(pth,process.env.PDFOUT||'/tmp/rp_out.pdf');
 await p.waitForTimeout(300);ok('report pdf announced',(await p.textContent('#sr')).includes('ดาวน์โหลดไฟล์ PDF รายงาน'))}
const [pop]=await Promise.all([ctx.waitForEvent('page'),p.click('[data-a=rpprint]')]);
await pop.waitForLoadState();
const pt=await pop.textContent('body');
ok('print page opens with report',pt.includes('รายงานการใช้บริการ')&&pt.includes('สรุปภาพรวม')&&pt.includes('แยกตามพนักงาน'));
ok('print page has no control buttons from admin (only its own print button)',!pt.includes('ดาวน์โหลด Excel')&&!pt.includes('สร้างรายงาน')&&pt.includes('พิมพ์ / บันทึกเป็น PDF'));
ok('print page keeps header logo',!!(await pop.$('.rplogo')));
await pop.emulateMedia({media:'print'});ok('print page hides its print button in print',await pop.$eval('.noprint',e=>getComputedStyle(e).display==='none'));
await pop.close();
// popup blocked -> download fallback
await p.evaluate(()=>{window.open=function(){return null}});
const [dlh]=await Promise.all([p.waitForEvent('download'),p.click('[data-a=rpprint]')]);
ok('fallback downloads html file + message',(await p.textContent('#main')).includes('เปิดหน้าพิมพ์ไม่ได้'));
await p.click('[data-a=rpmode][data-id=d]');
ok('date inputs shown, place kept',!!(await p.$('#rpf'))&&!!(await p.$('#rpt'))&&(await p.$eval('#rpp',e=>e.value))==='og1');
await p.fill('#rpf',`${Y}-${M0}-03`);await p.fill('#rpt',`${Y}-${M0}-02`);await p.click('[data-a=rpgo]');
ok('end before start blocked',(await p.textContent('#main')).includes('วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่มต้น'));
await p.fill('#rpf',`${Y}-${M0}-02`);await p.fill('#rpt',`${Y}-${M0}-03`);await p.click('[data-a=rpgo]');
await until(()=>document.querySelectorAll('.rpw:not(.rpst .rpw) tbody tr').length>0);
const t2=await p.textContent('#main');
ok('range report: 3 rows (days 2-3), label with date range',(await p.$$eval('.rpw:not(.rpst .rpw) tbody tr',r=>r.length))===3&&t2.includes('ช่วงเวลาที่รายงาน')&&t2.includes(' ถึง 3 '));
ok('range excludes day1 and day4',!t2.includes('MS201')&&!t2.includes('MS205')&&t2.includes('MS202')&&t2.includes('MS204'));
await p.fill('#rpf','');await p.click('[data-a=rpgo]');ok('empty date blocked',(await p.textContent('#main')).includes('กรุณาเลือกวันที่เริ่มต้นและวันที่สิ้นสุด'));
await p.fill('#rpf',`${Y-2}-01-01`);await p.fill('#rpt',`${Y}-${M0}-03`);await p.click('[data-a=rpgo]');ok('over 366 days blocked',(await p.textContent('#main')).includes('ไม่เกิน 366 วัน'));
await p.fill('#rpf',`${Y}-${M0}-02`);await p.fill('#rpt',`${Y}-${M0}-02`);await p.click('[data-a=rpgo]');await until(()=>document.body.innerText.includes('สรุปภาพรวม'));
ok('single day label',(await p.textContent('#main')).includes('ช่วงเวลาที่รายงาน')&&!(await p.textContent('#main')).includes(' ถึง 2 '));
await p.evaluate(()=>{window.__dn='';document.addEventListener('click',e=>{if(e.target&&e.target.download)window.__dn=e.target.download},true)});await p.click('[data-a=rpcsv]');await p.waitForTimeout(300);const dn=await p.evaluate(()=>window.__dn);ok('csv name has range ('+dn+')',dn.includes(`${Y}-${M0}-02_ถึง_${Y}-${M0}-02`));
await p.click('[data-a=rpmode][data-id=m]');ok('back to month mode',!!(await p.$('#rpm')));
await p.setViewportSize({width:1000,height:900});await p.waitForTimeout(200);await p.locator('.card:has(.rpst)').first().screenshot({path:require('./config').tmp('rep_staff.png')});await p.setViewportSize({width:420,height:900});
await p.emulateMedia({media:'print'});
ok('print hides controls/tabs',await p.$eval('#rpctl',e=>getComputedStyle(e).display==='none')&&await p.$eval('header.top',e=>getComputedStyle(e).display==='none'));
await p.pdf({path:require('./config').tmp('rep.pdf'),format:'A4'});
console.log('errors:',errs.join('|')||'none');await b.close();process.exit(0)
})()
