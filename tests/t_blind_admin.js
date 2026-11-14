// ป้ายร้านของคนพิการทางการเห็น (แอปแอดมิน): ตรวจบัตรตอนอนุมัติ, GP ตามป้าย, ลบรูปบัตรหลังอนุมัติ/ไม่อนุมัติ, เปิดป้ายร้านเดิม, ตั้งอัตรา GP
const {chromium}=require('playwright');const W=require('./config').waitFor;
const PNG=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==','base64');
(async()=>{const b=await chromium.launch(require('./config').launch);
const ctx=await b.newContext({timezoneId:'Asia/Bangkok',locale:'th-TH'});const errs=[],calls=[],stor=[];
let CC=[],CCC=[];let n=100;const now=()=>new Date().toISOString();
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
 app_settings:[{id:true,gp_rate_default:10,gp_rate_blind:5,org_pp_on:false,org_pp_type:'tax',org_pp_id:'',org_pp_name:'',association_name:'สมาคมวิทยากรฝึกอาชีพคนตาบอด',phone:'021234567',email:'a@b.c',default_minutes:60,shop_radius_km:10,org_radius_km:10,notify_user:true,notify_staff:true,promptpay_on:true,promptpay_type:'mobile',promptpay_id:'',promptpay_name:'',wallet_warn1:100,wallet_warn2:50,logo_path:null}],
 shop_registrations:[{id:'r1',owner_user_id:'u8',name:'ร้านใหม่หนึ่ง',phone:'0812340001',category_id:'c1',image_path:'avatars/u8/shop-x.jpg',license_path:'u8/license-x.jpg',status:'pending',created_at:'2026-10-17T03:00:00Z',gp_accepted_percent:10,gp_accepted_at:'2026-10-17T03:00:00Z'},{id:'r3',owner_user_id:'u7',name:'ร้านป้ายสาม',phone:'0812340003',category_id:null,image_path:null,license_path:'u7/license-z.jpg',status:'pending',created_at:'2026-10-17T05:00:00Z',gp_accepted_percent:10,gp_accepted_at:'2026-10-17T05:00:00Z',blind_owner:true,card_path:'u7/card-z.jpg',blind_consent_at:'2026-10-17T05:00:00Z'},{id:'r4',owner_user_id:'u6',name:'ร้านป้ายสี่',phone:'0812340004',category_id:null,image_path:null,license_path:'u6/license-w.jpg',status:'pending',created_at:'2026-10-17T06:00:00Z',blind_owner:true,card_path:'u6/card-w.jpg',blind_consent_at:'2026-10-17T06:00:00Z'},{id:'r2',owner_user_id:'u9',name:'ร้านใหม่สอง',phone:'0812340002',category_id:null,image_path:null,license_path:'u9/license-y.jpg',status:'pending',created_at:'2026-10-17T04:00:00Z'}],
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
 if(path.startsWith('/storage/v1/object/authenticated/'))return r.fulfill({status:200,contentType:'image/png',body:Buffer.concat([PNG,Buffer.from(path)])}); // ไฟล์ต่างกันตามที่อยู่ (สลิปเหมือนกันทุกใบจะถูกเตือนว่าซ้ำ ตั้งแต่ 13 พ.ย.)
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
  if(f==='approve_shop_registration'){const rg=T.shop_registrations.find(x=>x.id===body.p_reg&&x.status==='pending');if(!rg)return J(400,{code:'P0001',message:'ไม่พบคำขอ หรือดำเนินการไปแล้ว'});rg.status='approved';const id='sh'+(++n);T.places.push({id,type:'shop',name:rg.name,category_id:rg.category_id,area:'',phone:rg.phone,image_path:rg.image_path,lat:null,lng:null,open_time:'10:00:00',close_time:'21:00:00',advance_days:14,cancel_hours:24,gp_percent:body.p_gp,blind_owned:!!body.p_blind,active:true,auto_closed:false,status:'approved',created_at:'9'});rg.card_path=null;bal[id]={balance:body.p_credit,owner_phone:rg.phone,owner_name:''};return J(200,id)}
  if(f==='reject_shop_registration'){const rg=T.shop_registrations.find(x=>x.id===body.p_reg);rg.status='rejected';rg.reject_reason=body.p_reason;rg.card_path=null;return J(204,null)}
  if(f==='confirm_topup'){const t=T.topup_requests.find(x=>x.id===body.p_id);t.status=body.p_ok?'confirmed':'rejected';if(body.p_ok)bal[t.place_id].balance+=t.amount;return J(204,null)}
  if(f==='admin_set_blind'){const pl=T.places.find(x=>x.id===body.p_place);pl.blind_owned=body.p_on;pl.gp_percent=body.p_gp==null?(body.p_on?5:10):body.p_gp;return J(200,pl.gp_percent)}
  if(f==='give_credit'){bal[body.p_place].balance+=body.p_amount;return J(204,null)}
  if(f==='admin_save_staff'){if(T.staff.some(s=>s.phone===body.p_phone&&s.id!==body.p_id))return J(400,{code:'P0001',message:'เบอร์มือถือนี้ถูกใช้กับพนักงานคนอื่นแล้ว'});let s=body.p_id&&T.staff.find(x=>x.id===body.p_id);if(!s){s={id:'p'+(++n),place_id:null,active:true,user_id:null,created_at:'9'};T.staff.push(s)}Object.assign(s,{name:body.p_name,phone:body.p_phone,photo_path:body.p_photo});T.staff_services=T.staff_services.filter(x=>x.staff_id!==s.id).concat(body.p_services.map(v=>({staff_id:s.id,service_id:v})));return J(200,s.id)}
  if(f==='admin_company_contacts')return J(200,CC.map(x=>({...x})));
  if(f==='admin_company_contact_add'){CCC.push(['add',body]);if(body.p_phone==='0999999999')return J(400,{code:'P0001',message:'ไม่พบบัญชีที่ใช้เบอร์นี้ ให้เจ้าของเบอร์สมัครสมาชิกก่อน'});CC.push({place_id:body.p_place,user_id:'uc'+CC.length,name:'คุณผู้ประสาน',phone:body.p_phone});return J(204,null)}
  if(f==='admin_company_contact_remove'){CCC.push(['rm',body]);CC=CC.filter(x=>!(x.place_id===body.p_place&&x.user_id===body.p_user));return J(204,null)}
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
const until=async(f,a)=>{try{await p.waitForFunction(f,a,{timeout:10000});return true}catch(e){return false}};
const has=async t=>until(x=>document.body.innerText.includes(x),t);
const wait=async ms=>p.waitForTimeout(ms);
await p.goto(require('./config').page('admin-panel.html'));
// ---- แอดมินคนแรก
ok('no admin -> setup screen',await has('สร้างบัญชีแอดมินคนแรก')&&!!(await p.$('#spw')));
await p.fill('#sn','แอดมิน หนึ่ง');await p.fill('#sph','0811111111');await p.fill('#spw','short');await p.fill('#spw2','short');await p.click('button[type=submit]');ok('short password blocked',await has('อย่างน้อย 8 ตัวอักษร'));
await p.fill('#spw','adminpass1');await p.fill('#spw2','adminpass2');await p.click('button[type=submit]');ok('mismatch blocked',await has('ไม่ตรงกัน'));
await p.fill('#spw2','adminpass1');await p.click('button[type=submit]');
ok('first admin created and app opens',await until(()=>document.getElementById('tabs').textContent.includes('หน้าหลัก')));
ok('claim_first_admin called with bearer',await W(()=>calls.some(c=>c.path.endsWith('claim_first_admin')&&c.auth==='at-u1')));
ok('admin id stored in admins',await W(()=>T.admins[0]==='u1'));
ok('place tab shows 4 new shops',(await p.textContent('#tabs')).includes('4'));
// ---- รีโหลดคงอยู่ + ออกจากระบบ
await p.reload();ok('session persists',await until(()=>document.getElementById('tabs').textContent.includes('หน้าหลัก')));
await p.click('#tabs [data-id=sys]');await p.click('#main .subtabs [data-id=me]');await p.click('[data-a=logout]');await until(()=>document.querySelector('#aph'));
ok('admin exists -> login screen (not setup)',!!(await p.$('#aph'))&&!(await p.$('#spw')));
await p.fill('#aph','0833333333');await p.fill('#apw','custpass1');await p.click('button[type=submit]');
ok('customer account denied',await has('ไม่มีสิทธิ์แอดมิน'));
ok('no data loaded for non-admin',!calls.some(c=>c.auth==='at-u3'&&c.path.includes('/rest/v1/places')));
await p.click('[data-ag=logout]');await until(()=>document.querySelector('#aph'));
await p.fill('#aph','0811111111');await p.fill('#apw','wrong');await p.click('button[type=submit]');ok('wrong password',await has('เบอร์มือถือหรือรหัสผ่านไม่ถูกต้อง'));
await p.click('[data-ag=fp]');ok('forgot -> instructions',await has('Authentication'));await p.click('[data-ag=login]');
await p.fill('#aph','081-111-1111');await p.fill('#apw','adminpass1');await p.click('button[type=submit]');
ok('admin login',await until(()=>document.getElementById('tabs').textContent.includes('หน้าหลัก')));
// ===== ป้ายร้านของคนพิการทางการเห็น (แอดมิน)
const dels=()=>calls.filter(c=>c.m==='DELETE'&&c.path.startsWith('/storage/v1/object/licenses/'));
await p.click('#tabs [data-id=pl]');await p.waitForTimeout(400);
const M=await txt('#main');
ok('blind request shown on the registration card',M.includes('ขอป้ายร้านของคนพิการทางการเห็น'));
ok('GP field defaults: general 10, blind request 5',(await p.inputValue('#rg_r1'))==='10'&&(await p.inputValue('#rg_r3'))==='5');
ok('badge checkbox only for shops that asked',!!(await p.$('#rb_r3'))&&!(await p.$('#rb_r1'))&&await p.isChecked('#rb_r3'));
ok('button says licence and card',(await p.textContent('[data-a=reglic][data-id=r3]')).includes('ดูใบอนุญาตและบัตร'));
await p.click('[data-a=reglic][data-id=r3]');ok('card image loaded from licenses bucket',await until(()=>document.querySelector('#card_r3 img')));
ok('card fetched with admin bearer',calls.some(c=>c.path==='/storage/v1/object/authenticated/licenses/u7/card-z.jpg'&&c.auth==='at-u1'));
ok('card image alt text',(await p.getAttribute('#card_r3 img','alt')).includes('บัตรประจำตัวคนพิการ'));
await p.uncheck('#rb_r3');ok('untick badge -> GP back to general 10',(await p.inputValue('#rg_r3'))==='10');
await p.check('#rb_r3');ok('tick badge -> GP 5 again',(await p.inputValue('#rg_r3'))==='5');
await p.click('[data-a=regok][data-id=r3]');await has('อนุมัติร้าน ร้านป้ายสาม แล้ว พร้อมป้ายร้านของคนพิการทางการเห็น');
const ap3=calls.filter(c=>c.path.endsWith('approve_shop_registration')).pop();
ok('approve sends p_blind true + GP 5',!!ap3&&ap3.body.p_reg==='r3'&&ap3.body.p_blind===true&&ap3.body.p_gp===5);
ok('card file deleted after approval',await W(()=>dels().some(c=>c.path==='/storage/v1/object/licenses/u7/card-z.jpg')));
await p.click('[data-a=ss][data-id=all]').catch(()=>{});await p.waitForTimeout(300);
ok('shop list shows the badge',await p.$$eval('.tag.bl',a=>a.some(x=>x.textContent.includes('ร้านของคนพิการทางการเห็น'))));
await p.click('[data-a=ss][data-id=new]').catch(()=>{});await p.waitForTimeout(300);
await p.click('[data-a=regno][data-id=r4]');await p.click('[data-a=regno][data-id=r4]');
ok('card file deleted after rejection',await W(()=>dels().some(c=>c.path==='/storage/v1/object/licenses/u6/card-w.jpg')));
ok('licence files never deleted',!dels().some(c=>/license-/.test(c.path)));
// เปิดป้ายร้านเดิมจากหน้าแก้ไขร้าน
await p.click('[data-a=ss][data-id=all]').catch(()=>{});await p.waitForTimeout(300);
await p.click('[data-a=edit][data-t=shop][data-id=sh1]');await p.waitForSelector('#fbl');
ok('edit form: badge unticked for sh1, GP 10',!(await p.isChecked('#fbl'))&&(await p.inputValue('#fg'))==='10');
await p.check('#fbl');ok('tick -> GP field 5',(await p.inputValue('#fg'))==='5');
await p.fill('#olat','13.7563');await p.fill('#olng','100.5018');
await p.click('[data-a=save]');await has('บันทึกร้านค้าแล้ว');
const sb=calls.filter(c=>c.path.endsWith('admin_set_blind')).pop();
ok('admin_set_blind called with on + GP 5',!!sb&&sb.body.p_place==='sh1'&&sb.body.p_on===true&&sb.body.p_gp===5);
ok('sh1 now has the badge',T.places.find(x=>x.id==='sh1').blind_owned===true);
await p.click('[data-a=edit][data-t=shop][data-id=sh1]');await p.waitForSelector('#fbl');
const nb=calls.filter(c=>c.path.endsWith('admin_set_blind')).length;
await p.fill('#fcr','100');await p.click('[data-a=save]');await until(()=>!document.getElementById('fbl'));await p.waitForTimeout(300);
ok('saving without changing the badge does not call admin_set_blind',calls.filter(c=>c.path.endsWith('admin_set_blind')).length===nb);
ok('credit note says เจ้าหน้าที่, not สมาคม',(c=>c&&c.body.p_note==='เครดิตจากเจ้าหน้าที่')(calls.filter(c=>c.path.endsWith('give_credit')).pop()));
// ตั้งค่าอัตรา GP
await p.click('#tabs [data-id=sys]');await p.waitForTimeout(400);await p.click('[data-a=tab][data-id=set]');await p.waitForTimeout(300);
await p.click('[data-a=sub][data-id=b]');await p.waitForSelector('#gpd');
ok('settings: GP rate card with both rates',(await p.inputValue('#gpd'))==='10'&&(await p.inputValue('#gpb'))==='5');
await p.fill('#gpb','150');await p.click('[data-a=setsave]');ok('rate validation',await has('ค่า GP ต้องอยู่ระหว่าง 0-100'));
await p.fill('#gpb','4');await p.fill('#gpd','11');await p.click('[data-a=setsave]');
ok('rates saved to app_settings',await W(()=>calls.some(c=>c.m==='PATCH'&&c.path.endsWith('/app_settings')&&c.body&&c.body.gp_rate_default===11&&c.body.gp_rate_blind===4)));
console.log('errors:',errs.join('|')||'none');
await b.close()})();
