const SPC=[];const SPS=[{id:"po1",title:"รับสมัครหมอนวดประจำ",detail:"เปิดรับ 5 คน",slots:5,deadline:null,is_open:true,open:true,total:1,fresh:1}];const SAS=[{id:"sa1",posting_id:"po1",full_name:"คุณสมศรี ใจดี",nickname:"ศรี",phone:"0812223333",line_id:"sri99",area:"บางรัก",experience:"gt3",course:"hss255",course_other:null,has_disability_card:true,has_hss_reg:false,work_history:"ร้านนวดสุขใจ",weekdays:[1,3,5],travel:"guide",note:null,source:"LINE",status:"new",admin_note:null,created_at:"2026-11-04T05:00:00Z"}];
const CAPC=[];const CAPS=[{id:"a1",company_name:"บริษัท เอบีซี จำกัด",district:"บางรัก",address:"1 ถ.สีลม",contact_name:"คุณสมหญิง",contact_phone:"0812223333",total:3,gender_mode:"split",male:1,female:2,employment:"s33",salary:15000,weekdays:[1,3],start_time:"09:00:00",end_time:"17:00:00",note:"ขอคนสุภาพ",status:"new",admin_note:null,place_id:null,contract_start:null,contract_end:null,assigned:0},{id:"a2",company_name:"บริษัท ไม่ระบุเงิน",district:null,address:null,contact_name:"คุณชาย",contact_phone:"0844445555",total:1,gender_mode:"any",male:null,female:null,employment:"s35",salary:null,weekdays:[5],start_time:"10:00:00",end_time:"12:00:00",note:null,status:"new",admin_note:null,place_id:null,contract_start:null,contract_end:null,assigned:0}];
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
 reviews:[{id:'rv1',place_id:'sh1',reviewer_first:'สมชาย',shop_rating:1,shop_comment:'แย่มาก',shop_reply:null,hidden:false,reported:true,created_at:'2026-10-20T01:00:00Z'},{id:'rv2',place_id:'sh1',reviewer_first:'มาลี',shop_rating:2,shop_comment:'ช้า',shop_reply:'ขออภัย',hidden:false,reported:false,created_at:'2026-10-19T01:00:00Z'},{id:'rv3',place_id:'sh1',reviewer_first:'ซ่อน',shop_rating:1,shop_comment:'หยาบคาย',hidden:true,reported:false,created_at:'2026-10-18T01:00:00Z'}],
 review_staff:[{id:'rs1',place_id:'sh1',staff_id:'p1',reviewer_first:'สมชาย',rating:2,comment:'ไม่สุภาพ',reply:null,hidden:false,reported:true,created_at:'2026-10-20T01:00:00Z'}],
 app_settings:[{id:true,...(process.env.NOCOL?{}:{staff_url:'https://old.example/'}),new_shop_alert_on:true,new_shop_radius_km:5,auto_close_hours:3,points_on:true,points_baht_per:10,points_per_baht:10,points_min_redeem:100,points_expire_months:12,address:'เลขที่ 99 ถนนทดสอบ แขวงสมมติ เขตตัวอย่าง กรุงเทพฯ 10000',association_name:'สมาคมวิทยากรฝึกอาชีพคนตาบอด',phone:'021234567',email:'a@b.c',default_minutes:60,shop_radius_km:10,org_radius_km:10,notify_user:true,notify_staff:true,promptpay_on:true,promptpay_type:'mobile',promptpay_id:'',promptpay_name:'',wallet_warn1:100,wallet_warn2:50,logo_path:null}],
 shop_registrations:[{id:'r1',owner_user_id:'u8',name:'ร้านใหม่หนึ่ง',phone:'0812340001',category_id:'c1',image_path:'avatars/u8/shop-x.jpg',license_path:'u8/license-x.jpg',status:'pending',created_at:'2026-10-17T03:00:00Z'},{id:'r2',owner_user_id:'u9',name:'ร้านใหม่สอง',phone:'0812340002',category_id:null,image_path:null,license_path:'u9/license-y.jpg',status:'pending',created_at:'2026-10-17T04:00:00Z'}],
 topup_requests:[{id:'t9',ref:'TP000009',place_id:'sh1',amount:200,status:'confirmed',slip_path:null,slip_cleared_at:'2026-10-01T00:00:00Z',slip_at:null,created_at:'2025-08-01T00:00:00Z'},{id:'t1',ref:'TP000001',place_id:'sh2',amount:500,status:'pending',slip_path:'sh2/TP000001-a.jpg',slip_at:'2026-10-17T05:00:00Z',created_at:'2026-10-17T04:30:00Z'},{id:'t2',ref:'TP000002',place_id:'sh1',amount:300,status:'pending',slip_path:null,slip_at:null,created_at:'2026-10-17T06:00:00Z'},{id:'t3',ref:'TP000003',place_id:'sh1',amount:200,status:'pending',slip_path:null,slip_at:null,created_at:'2026-10-17T07:00:00Z'}],
 notifications:[{id:'n1',audience:'admin',kind:'topup',title:'ร้านขอเติมเงิน 500 บาท',body:'อ้างอิง TP000001\nร้านปิดอัตโนมัติ',created_at:'2026-10-17T04:30:00Z'},{id:'n2',audience:'admin',kind:'status',title:'ร้านปิดรับจองชั่วคราว',body:'x',created_at:'2026-10-17T05:30:00Z'},{id:'n3',audience:'admin',kind:'approval',title:'มีคำขอลงทะเบียน',body:'y',created_at:'2026-10-17T06:30:00Z'}],
 notification_reads:[],
 org_requests:[
  {id:'q1',ref:'ORG000001',org_name:'บริษัทตัวอย่าง จำกัด',district:'บางรัก',address:'1 ถนนสีลม',lat:13.72,lng:100.52,contact_name:'คุณสมชาย',contact_phone:'0812223333',service_date:new Date(Date.now()+864e5*10).toISOString().slice(0,10),start_time:'09:00:00',end_time:'17:00:00',lunch_start:'12:00:00',lunch_end:'13:00:00',hours:7,rate:400,staff_ids:['p1','p2'],status:'pending',created_at:'2026-11-01T01:00:00Z',slip_path:null,amount:null},
  {id:'q2',ref:'ORG000002',org_name:'โรงเรียนทดสอบ',district:'ดุสิต',address:'2 ถนนราชวิถี',lat:13.76,lng:100.51,contact_name:'คุณมาลี',contact_phone:'0844445555',service_date:new Date(Date.now()+864e5*10).toISOString().slice(0,10),start_time:'09:00:00',end_time:'12:00:00',lunch_start:null,lunch_end:null,hours:3,rate:400,staff_ids:['p1'],status:'paid_review',created_at:'2026-10-31T01:00:00Z',slip_path:'u3/orgslip-1.jpg',amount:1200},
  {id:'q4',ref:'ORG000004',org_name:'หน่วยงานยืนยันแล้ว',district:'ห้วยขวาง',address:'4',lat:13.77,lng:100.54,contact_name:'ข',contact_phone:'0899999999',service_date:new Date(Date.now()+864e5*20).toISOString().slice(0,10),start_time:'09:00:00',end_time:'11:00:00',lunch_start:null,lunch_end:null,hours:2,rate:400,staff_ids:['p1'],status:'confirmed',user_id:'u5',receipt_path:null,receipt_at:null,created_at:'2026-10-29T01:00:00Z',slip_path:null},
  {id:'q3',ref:'ORG000003',org_name:'หน่วยงานรอตอบ',district:'พญาไท',address:'3',lat:13.77,lng:100.53,contact_name:'ก',contact_phone:'0800000000',service_date:new Date(Date.now()+864e5*10).toISOString().slice(0,10),start_time:'09:00:00',end_time:'11:00:00',lunch_start:null,lunch_end:null,hours:2,rate:400,staff_ids:['p1'],status:'invited',created_at:'2026-10-30T01:00:00Z',slip_path:null,amount:null}],
 org_invites:[{id:'iv1',request_id:'q3',staff_id:'p1',status:'pending',by_admin:false},{id:'iv2',request_id:'q2',staff_id:'p2',status:'accepted',by_admin:false}]};
T.org_requests.find(x=>x.id==='q3').invite_due_at=new Date(Date.now()+5*36e5).toISOString();
const CHL=[{id:'ch1',status:'pending_admin',place_id:'cp1',place_name:'บริษัท ไทยออฟฟิศ',day:'2099-01-12',from_name:'คุณนุ่น',to_name:'คุณสอง',reason:'ป่วย',admin_note:null,by_admin:false}],CHU=[{place_id:'cp1',place_name:'บริษัท ไทยออฟฟิศ',day:'2099-01-14',from_id:'p2',from_name:'คุณนุ่น',reason:'ธุระ'}],chCalls=[];const oqCalls=[];const rcCalls=[],rcUps=[],rcDels=[],hoCalls=[],HOL=[{id:'h1',status:'pending_admin',org_name:'บริษัทโอนงาน',ref:'ORG-H-1',service_date:'2099-01-10',from_name:'คุณเอ',to_name:'คุณบี',reason:'ติดธุระ',admin_note:null},{id:'h2',status:'pending_admin',org_name:'บริษัทสอง',ref:'ORG-H-2',service_date:'2099-01-11',from_name:'คุณซี',to_name:'คุณดี',reason:'',admin_note:null}],SDR=[];
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
 if(path==='/storage/v1/object/receipts'&&m==='DELETE'){rcDels.push(body.prefixes);return J(200,[])}
 if(path.startsWith('/storage/v1/object/receipts/')&&m==='POST'){rcUps.push({path:path.replace('/storage/v1/object/receipts/',''),ct:q.headers()['content-type'],len:(q.postDataBuffer()||Buffer.alloc(0)).length});return J(200,{Key:'k'})}
 if(path.startsWith('/storage/v1/object/authenticated/receipts/'))return r.fulfill({status:200,contentType:'application/pdf',body:Buffer.from('%PDF-1.4 test')});
 if(path.startsWith('/storage/v1/object/authenticated/'))return r.fulfill({status:200,contentType:'image/png',body:PNG});
 if(path==='/storage/v1/object/slips'&&m==='DELETE'){dels.push(body.prefixes);if(delFail)return J(500,{message:'storage error'});return J(200,[])}
 if(path.startsWith('/storage/v1/object/')){stor.push({path:path.replace('/storage/v1/object/',''),len:(q.postDataBuffer()||Buffer.alloc(0)).length});return J(200,{Key:'k'})}
 const rm=path.match(/^\/rest\/v1\/rpc\/(\w+)/);
 if(rm){const f=rm[1],isA=me&&T.admins.includes(me.id);
  if(f==='admin_exists')return J(200,T.admins.length>0);
  if(!me)return J(401,{message:'JWT'});
  if(f==='is_admin')return J(200,isA);
  if(f==='claim_first_admin'){if(T.admins.length)return J(400,{code:'P0001',message:'ระบบมีแอดมินอยู่แล้ว ให้แอดมินคนเดิมเพิ่มสิทธิ์ให้'});T.admins.push(me.id);return J(204,null)}
  if(!isA)return J(400,{code:'P0001',message:'เฉพาะแอดมินเท่านั้น'});
  if(f==='admin_shop_overview')return J(200,T.places.filter(p=>p.type==='shop').map(p=>({place_id:p.id,balance:bal[p.id].balance,owner_phone:bal[p.id].owner_phone,owner_name:bal[p.id].owner_name})));
  if(f==='admin_find_users'){finds.push(body);const q=body.p_q.replace(/\D/g,'');if(q.length<3)return J(400,{code:'P0001',message:'พิมพ์เบอร์อย่างน้อย 3 หลัก'});return J(200,PEOPLE.filter(x=>x.phone.includes(q)))}
  if(f==='admin_reset_password'){resets.push(body);if(resetErr)return J(400,{code:'P0001',message:resetErr});const u=PEOPLE.find(x=>x.id===body.p_user);T.password_reset_log.unshift({id:resets.length,admin_name:'แอดมิน หนึ่ง',user_name:u.name,user_phone:u.phone,created_at:now()});return J(204,null)}
  if(f==='admin_handovers')return J(200,HOL);
  if(f==='admin_company_reviews')return J(200,[{id:'c1',place_id:'cp1',place_name:'บริษัท ไทยออฟฟิศ',month:'2026-10-01',rating:2,comment:'หมอนวดมาสาย',problem:true,created_at:'2026-11-01T03:00:00Z'},{id:'c2',place_id:'cp1',place_name:'บริษัท ไทยออฟฟิศ',month:'2026-09-01',rating:5,comment:null,problem:false,created_at:'2026-10-01T03:00:00Z'}]);
  if(f==='admin_org_reviews')return J(200,[{id:'v1',request_id:'q1',ref:'ORG000001',org_name:'บริษัทตัวอย่าง จำกัด',service_date:'2026-10-20',rating:2,comment:'มาสายมาก',problem:true,created_at:'2026-10-21T03:00:00Z',staff:'คุณกลาง'},{id:'v2',request_id:'q2',ref:'ORG000002',org_name:'โรงเรียนทดสอบ',service_date:'2026-10-22',rating:5,comment:null,problem:false,created_at:'2026-10-23T03:00:00Z',staff:'คุณสอง'}]);
  if(f==='admin_handover_candidates')return J(200,[{id:'p1',name:'คุณกลาง',comp:[{name:'บริษัท ไทยออฟฟิศ',days:[1,3]}]},{id:'p3',name:'คุณว่าง',comp:[]}]);
  if(f==='admin_org_replace_staff'){hoCalls.push(['replace',body]);return J(200,'hx')}
  if(f==='admin_company_handovers')return J(200,{handovers:CHL,uncovered:CHU});
  if(f==='admin_staff_postings')return J(200,SPS);
  if(f==='admin_staff_applications')return J(200,SAS);
  if(f==='admin_staff_posting_save'){SPC.push(['save',body]);if(!body.p.id){SPS.unshift({id:'po9',title:body.p.title,detail:body.p.detail,slots:body.p.slots?+body.p.slots:null,deadline:body.p.deadline||null,is_open:true,open:true,total:0,fresh:0})}else{Object.assign(SPS.find(x=>x.id===body.p.id),{title:body.p.title})}return J(200,'po9')}
  if(f==='admin_staff_posting_set_open'){SPC.push(['open',body]);const x=SPS.find(y=>y.id===body.p_id);x.is_open=body.p_open;x.open=body.p_open;return J(204,null)}
  if(f==='admin_staff_application_set'){SPC.push(['set',body]);const a=SAS.find(x=>x.id===body.p_id);a.status=body.p_status;a.admin_note=body.p_note;return J(204,null)}
  if(f==='admin_company_applications')return J(200,CAPS);
  if(f==='admin_company_application_set'){CAPC.push(['set',body]);const a=CAPS.find(x=>x.id===body.p_id);a.status=body.p_status;a.admin_note=body.p_note;return J(204,null)}
  if(f==='admin_company_application_make_draft'){CAPC.push(['draft',body]);const a=CAPS.find(x=>x.id===body.p_id);a.status='draft';a.place_id='cp1';return J(200,'cp1')}
  if(f==='admin_company_application_discard'){CAPC.push(['discard',body]);const a=CAPS.find(x=>x.id===body.p_id);a.status='negotiating';a.place_id=null;return J(204,null)}
  if(f==='admin_company_application_activate'){CAPC.push(['activate',body]);const a=CAPS.find(x=>x.id===body.p_id);a.status='active';a.contract_start=body.p_year+'-01-01';a.contract_end=body.p_year+'-12-31';return J(204,null)}
  if(f==='admin_company_handover_decide'){chCalls.push(['decide',body]);const h=CHL.find(x=>x.id===body.p_id);h.status=body.p_ok?'pending_staff':'rejected';return J(204,null)}
  if(f==='admin_company_sub_candidates'){chCalls.push(['cands',body]);return J(200,[{id:'p1',name:'คุณกลาง'}])}
  if(f==='admin_company_sub_assign'){chCalls.push(['assign',body]);CHU.splice(0,CHU.length);CHL.push({id:'ch9',status:'pending_staff',place_id:body.p_place,place_name:'บริษัท ไทยออฟฟิศ',day:body.p_day,from_name:'คุณนุ่น',to_name:'คุณกลาง',reason:'',admin_note:null,by_admin:true});return J(200,'ch9')}
  if(f==='admin_company_sub_remove'){chCalls.push(['remove',body]);const i=CHL.findIndex(x=>x.id===body.p_id);CHL.splice(i,1);return J(204,null)}
  if(f==='admin_staff_leave_add'){chCalls.push(['leave',body]);return J(204,null)}
  if(f==='admin_handover_decide'){hoCalls.push(body);const h=HOL.find(x=>x.id===body.p_id);h.status=body.p_ok?'pending_staff':'rejected';return J(204,null)}
  if(f==='admin_org_receipt_set'){rcCalls.push(body);const x=T.org_requests.find(z=>z.id===body.p_id);x.receipt_path=body.p_path;x.receipt_at=body.p_path?new Date().toISOString():null;return J(204,null)}
  if(f.startsWith('admin_org_')){oqCalls.push([f,body]);const rq=T.org_requests.find(x=>x.id===(body.p_id));if(f==='admin_org_request_approve'){rq.status='invited';T.org_invites.push({id:'iv9',request_id:rq.id,staff_id:'p1',status:'pending',by_admin:false});return J(200,'pl9')}if(f==='admin_org_request_reject'){rq.status='rejected';return J(204,null)}if(f==='admin_org_payment_confirm'){rq.status=body.p_ok?'confirmed':'awaiting_payment';return J(204,null)}if(f==='admin_org_invite_respond'){const iv=T.org_invites.find(x=>x.id===body.p_invite);iv.status=body.p_accept?'accepted':'declined';iv.by_admin=true;return J(204,null)}if(f==='admin_org_close_invites'){rq.status='no_staff';return J(204,null)}}
  if(f==='admin_staff_delete_requests'){if(process.env.NOSQL)return J(404,{message:'Could not find the function public.admin_staff_delete_requests in the schema cache'});return J(200,SDR.filter(x=>x.st==='pending').map(x=>x.row))}
  if(f==='admin_staff_delete_resolve'){sdrCalls.push(body);const x=SDR.find(z=>z.row.id===body.p_req&&z.st==='pending');if(!x)return J(400,{code:'P0001',message:'ไม่พบคำขอที่รออยู่'});if(x.row.open_jobs>0&&body.p_approve)return J(400,{code:'P0001',message:'พนักงานยังมีคิวที่ยังไม่เสร็จ'});x.st=body.p_approve?'done':'rejected';if(body.p_approve){const sf=T.staff.find(q=>q.id===x.row.staff_id);Object.assign(sf,{name:'พนักงานที่ออกจากระบบ',phone:null,active:false,user_id:null})}return J(204,null)}
  if(f==='admin_old_slips_count'){return J(200,OLD.length)}
  if(f==='admin_old_slips'){return J(200,OLD.slice(0,200).map(x=>({id:x.id,slip_path:x.slip_path})))}
  if(f==='admin_mark_slips_cleared'){marks.push(body.p_ids);let c=0;for(const id of body.p_ids){const i=OLD.findIndex(x=>x.id===id);if(i>=0){OLD.splice(i,1);c++}}return J(200,c)}
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
  if(f==='admin_hide_review'){hides.push(body);const row=(body.p_kind==='shop'?T.reviews:T.review_staff).find(x=>x.id===body.p_id);row.hidden=body.p_hidden;row.reported=false;return J(204,null)}
  return J(404,{message:'no rpc '+f})}
 if(!me||!T.admins.includes(me.id))return J(403,{code:'42501',message:'permission denied'});
 const tb=path.replace('/rest/v1/','');if(T[tb]===undefined)return J(404,{message:'nf '+path});
 const filt=rr=>{for(const [k,v] of sp.entries()){if(['select','order','limit','on_conflict'].includes(k))continue;if(v==='is.null')rr=rr.filter(x=>x[k]==null);else if(k==='starts_at'){}else if(v.startsWith('in.('))rr=rr.filter(x=>v.slice(4,-1).split(',').includes(String(x[k])));else if(v.startsWith('eq.'))rr=rr.filter(x=>String(x[k])===v.slice(3))}return rr};
 if(m==='GET'){let rr=filt(T[tb]);if(tb==='bookings'&&sp.getAll('starts_at').length){const gte=sp.getAll('starts_at').find(x=>x.startsWith('gte.')),lt=sp.getAll('starts_at').find(x=>x.startsWith('lt.'));rr=rr.filter(x=>(!gte||x.starts_at>=gte.slice(4))&&(!lt||x.starts_at<lt.slice(3)))}const sel=sp.get('select')||'';
  rr=rr.map(x=>{x=Object.assign({},x);if(sel.includes('org_invites('))x.org_invites=T.org_invites.filter(q=>q.request_id===x.id);if(sel.includes('staff_services('))x.staff_services=T.staff_services.filter(q=>q.staff_id===x.id).map(q=>({service_id:q.service_id}));if(sel.includes('places(name,type)')){const q=T.places.find(p=>p.id===x.place_id)||{};x.places={name:q.name,type:q.type}}else if(sel.includes('places(name)'))x.places={name:(T.places.find(p=>p.id===x.place_id)||{}).name};return x});
  if(tb==='notification_reads')rr=rr.filter(x=>x.user_id===me.id);return J(200,rr)}
 if(m==='POST'){const arr=Array.isArray(body)?body:[body];for(const bd of arr){const row=Object.assign({id:tb[0]+(++n),created_at:now(),active:true},bd);if(tb==='notification_reads'&&T[tb].some(x=>x.notification_id===bd.notification_id&&x.user_id===bd.user_id))continue;T[tb].push(row)}return J(201,null)}
 if(m==='PATCH'){filt(T[tb]).forEach(x=>Object.assign(x,body));return J(204,null)}
 if(m==='DELETE'){const keep=T[tb].filter(x=>!filt([x]).length);if(tb==='places'&&sp.get('id')==='eq.sh1')return J(409,{code:'23503',message:'fk'});T[tb]=keep;return J(204,null)}
 return J(404,{message:'nf'})});

const p=await ctx.newPage();await p.setViewportSize({width:420,height:900});p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>{errs.push('DIALOG '+d.message());d.dismiss()});
const ok=(nm,c)=>console.log((c?'PASS ':'FAIL ')+nm);
const until=async(f,a)=>{try{await p.waitForFunction(f,a,{timeout:4000});return true}catch(e){return false}};
await p.goto(require('./config').page('admin-panel.html'));
await until(()=>document.querySelector('#spw'));
await p.fill('#sn','แอดมิน หนึ่ง');await p.fill('#sph','0811111111');await p.fill('#spw','adminpass1');await p.fill('#spw2','adminpass1');await p.click('button[type=submit]');
await p.waitForTimeout(800);
await p.click('#tabs [data-id=pl]');await p.waitForTimeout(300);
let t=await p.evaluate(()=>document.body.innerText);
ok('subtab badge counts pending+paid_review (2)',/คำขอหน่วยงาน \(2\)/.test(t));
await p.click('#main .subtabs [data-id=oreq]');await p.waitForTimeout(400);
await p.evaluate(()=>{window.__open=[];window.open=(u)=>{window.__open.push(u);return null};window.__clip=[];Object.defineProperty(navigator,'clipboard',{value:{writeText:t=>{window.__clip.push(t);return Promise.resolve()}},configurable:true})});
const Q=()=>p.evaluate(()=>document.getElementById('spq')?document.getElementById('spq').innerText:'');
let c=await Q();
ok('panel shows posting, counts, new badge',c.includes('รับสมัครหมอนวด')&&c.includes('รับสมัครหมอนวดประจำ')&&c.includes('เปิดรับสมัคร')&&c.includes('ผู้สมัคร 1 คน (ใหม่ 1)')&&c.includes('ใหม่ 1'));
await p.click('[data-a=spline][data-id=po1]');
ok('LINE share url has link',await p.evaluate(()=>window.__open.length===1&&window.__open[0].startsWith('https://line.me/R/share?text=')&&decodeURIComponent(window.__open[0]).includes('?apply=po1')));
await p.click('[data-a=spfb][data-id=po1]');
ok('Facebook share url has link',await p.evaluate(()=>window.__open[1].startsWith('https://www.facebook.com/sharer/sharer.php?u=')&&decodeURIComponent(window.__open[1]).includes('massage-staff-bna.pages.dev/?apply=po1')));
await p.click('[data-a=spcopy][data-id=po1]');await p.waitForTimeout(300);
ok('copy link works',await p.evaluate(()=>window.__clip[0]==='https://massage-staff-bna.pages.dev/?apply=po1'));
await p.click('[data-a=spnew]');await p.fill('#sp_t','รับสมัครรอบ 2');await p.fill('#sp_d','รับ 3 คน');await p.fill('#sp_n','3');await p.click('[data-a=spsave]');await p.waitForTimeout(500);
ok('create posting sent and listed',SPC[0][0]==='save'&&SPC[0][1].p.title==='รับสมัครรอบ 2'&&SPC[0][1].p.id===null&&(await Q()).includes('รับสมัครรอบ 2'));
await p.click('[data-a=spopen][data-id=po9]');await p.waitForTimeout(500);
ok('close posting',SPC.some(x=>x[0]==='open'&&x[1].p_id==='po9'&&x[1].p_open===false)&&(await Q()).includes('ปิดรับสมัคร'));
await p.click('[data-a=spview][data-id=po1]');await p.waitForTimeout(200);c=await Q();
ok('applicant details shown',c.includes('คุณสมศรี ใจดี')&&c.includes('0812223333')&&c.includes('sri99')&&c.includes('มากกว่า 3 ปี')&&c.includes('255 ชั่วโมง')&&c.includes('บัตรคนพิการ: มี')&&c.includes('ใบขึ้นทะเบียน สบส.: ไม่มี')&&c.includes('ต้องมีผู้ช่วยนำทาง')&&c.includes('จ. พ. ศ.'));
await p.click('[data-a=spst][data-v=interview]');await p.waitForTimeout(500);
ok('status -> interview',SPC.some(x=>x[0]==='set'&&x[1].p_status==='interview')&&(await Q()).includes('สถานะ: นัดสัมภาษณ์'));
await p.click('[data-a=sprj][data-id=sa1]');await p.waitForTimeout(200);
ok('reject asks reason first',!!(await p.$('#sp_rn_sa1'))&&!SPC.some(x=>x[1].p_status==='rejected'));
await p.fill('#sp_rn_sa1','ครบจำนวนแล้ว');await p.click('[data-a=sprj][data-id=sa1]');await p.waitForTimeout(500);
ok('reject sent with reason',SPC.some(x=>x[1].p_status==='rejected'&&x[1].p_note==='ครบจำนวนแล้ว'));
console.log('errors:',errs.join('|')||'none');await b.close();process.exit(0)})();