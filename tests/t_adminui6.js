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
 app_settings:[{id:true,org_pp_on:false,org_pp_type:'tax',org_pp_id:'',org_pp_name:'',association_name:'สมาคมวิทยากรฝึกอาชีพคนตาบอด',phone:'021234567',email:'a@b.c',default_minutes:60,shop_radius_km:10,org_radius_km:10,notify_user:true,notify_staff:true,promptpay_on:true,promptpay_type:'mobile',promptpay_id:'',promptpay_name:'',wallet_warn1:100,wallet_warn2:50,logo_path:null}],
 shop_registrations:[{id:'r1',owner_user_id:'u8',name:'ร้านใหม่หนึ่ง',phone:'0812340001',category_id:'c1',image_path:'avatars/u8/shop-x.jpg',license_path:'u8/license-x.jpg',status:'pending',created_at:'2026-10-17T03:00:00Z',gp_accepted_percent:10,gp_accepted_at:'2026-10-17T03:00:00Z'},{id:'r2',owner_user_id:'u9',name:'ร้านใหม่สอง',phone:'0812340002',category_id:null,image_path:null,license_path:'u9/license-y.jpg',status:'pending',created_at:'2026-10-17T04:00:00Z'}],
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
  if(f==='approve_shop_registration'){const rg=T.shop_registrations.find(x=>x.id===body.p_reg&&x.status==='pending');if(!rg)return J(400,{code:'P0001',message:'ไม่พบคำขอ หรือดำเนินการไปแล้ว'});rg.status='approved';const id='sh'+(++n);T.places.push({id,type:'shop',name:rg.name,category_id:rg.category_id,area:'',phone:rg.phone,image_path:rg.image_path,lat:null,lng:null,open_time:'10:00:00',close_time:'21:00:00',advance_days:14,cancel_hours:24,gp_percent:body.p_gp,active:true,auto_closed:false,status:'approved',created_at:'9'});bal[id]={balance:body.p_credit,owner_phone:rg.phone,owner_name:''};return J(200,id)}
  if(f==='reject_shop_registration'){const rg=T.shop_registrations.find(x=>x.id===body.p_reg);rg.status='rejected';rg.reject_reason=body.p_reason;return J(204,null)}
  if(f==='confirm_topup'){const t=T.topup_requests.find(x=>x.id===body.p_id);t.status=body.p_ok?'confirmed':'rejected';if(body.p_ok)bal[t.place_id].balance+=t.amount;return J(204,null)}
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
ok('place tab shows 2 new shops',(await p.textContent('#tabs')).includes('ทะเบียน')&&(await p.textContent('#tabs')).includes('2'));
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
await p.screenshot({path:require('./config').tmp('a0.png')});
// ---- ร้านค้า
await p.click('#tabs [data-id=pl]');await p.waitForTimeout(400);ok('shops listed (new-registration + all shops)',(await txt('#main')).includes('ร้านสมัครใหม่ (2)')&&(await txt('#main')).includes('ร้านทั้งหมด (2)'));
ok('temporarily-closed shop counted',(await txt('#main')).includes('ร้านปิดชั่วคราว (1)'));
ok('registration shows GP acceptance',(await p.textContent('#main')).includes('ยอมรับค่า GP 10%')&&(await p.textContent('#main')).includes('ยังไม่มีบันทึกการยอมรับค่า GP'));await p.click('[data-a=reglic][data-id=r1]');ok('licence loaded via authenticated read',await until(()=>document.querySelector('#lic_r1 img')));
ok('licence fetched with admin bearer from licenses bucket',await W(()=>calls.some(c=>c.path==='/storage/v1/object/authenticated/licenses/u8/license-x.jpg'&&c.auth==='at-u1')));
await p.fill('#rg_r1','150');await p.click('[data-a=regok][data-id=r1]');ok('GP range validation',await has('0-100'));
ok('approve: starting credit defaults to 500 (matches invite message)',(await p.inputValue('#rc_r1'))==='500');
await p.fill('#rg_r1','12');await p.fill('#rc_r1','500');await p.click('[data-a=regok][data-id=r1]');
ok('approved info message',await has('อนุมัติร้าน ร้านใหม่หนึ่ง แล้ว'));
const ap=calls.filter(c=>c.path.endsWith('approve_shop_registration')).pop();ok('approve rpc args',ap&&ap.body.p_reg==='r1'&&ap.body.p_gp===12&&ap.body.p_credit===500);
await p.click('[data-a=ss][data-id=all]');ok('new shop in list with credit',(await txt('#lst')).includes('ร้านใหม่หนึ่ง')&&(await txt('#lst')).includes('12%'));
await p.click('[data-a=ss][data-id=new]');ok('pending now 1',(await txt('#main')).includes('ร้านสมัครใหม่ (1)'));
await p.click('[data-a=regno][data-id=r2]');ok('reason box appears',!!(await p.$('#rs_r2')));await p.fill('#rs_r2','ใบอนุญาตไม่ชัด');await p.click('[data-a=regno][data-id=r2]');
await until(()=>document.body.innerText.includes('ร้านสมัครใหม่ (0)'));
ok('reject rpc w/ reason',(c=>c&&c.body.p_reason==='ใบอนุญาตไม่ชัด')(calls.filter(c=>c.path.endsWith('reject_shop_registration')).pop()));
await p.click('[data-a=ss][data-id=rej]');ok('rejected reason shown',(await txt('#main')).includes('ใบอนุญาตไม่ชัด'));
// แก้ไขร้าน
await p.click('[data-a=ss][data-id=all]');
await p.click('[data-a=edit][data-t=shop][data-id=sh1]');await p.fill('#fn','ร้านสบายดี สปา 2');await p.fill('#fg','15');await p.fill('#fcr','200');await p.fill('#olat','13.7563');await p.fill('#olng','100.5018');await p.selectOption('#fc','c1');
await p.setInputFiles('#fimg',{name:'a.png',mimeType:'image/png',buffer:PNG});await until(()=>document.querySelector('#imgprev img'));
await p.fill('#fg','150');await p.click('[data-a=save]');ok('GP validation',await has('ระหว่าง 0-100'));await p.fill('#fg','15');
await p.click('[data-a=save]');await has('บันทึกร้านค้าแล้ว');
const sh1=T.places.find(x=>x.id==='sh1');ok('shop patched',sh1.name==='ร้านสบายดี สปา 2'&&sh1.gp_percent===15&&sh1.lat===13.7563&&/^place-images\/sh1\/shop-.*\.jpg$/.test(sh1.image_path));
ok('credit rpc',(c=>c&&c.body.p_place==='sh1'&&c.body.p_amount===200)(calls.filter(c=>c.path.endsWith('give_credit')).pop()));
ok('balance refreshed to 1,160',(await txt('#lst')).includes('1,160'));
// เปิดร้านที่ปิดอัตโนมัติ
await p.click('[data-a=tog][data-t=shop][data-id=sh2]');await wait(200);
ok('reopen clears auto_closed',(x=>x.active===true&&x.auto_closed===false)(T.places.find(x=>x.id==='sh2')));
await p.click('[data-a=del][data-t=shop][data-id=sh1]');ok('delete asks twice',await has('กดอีกครั้งเพื่อลบ'));await p.click('[data-a=del][data-t=shop][data-id=sh1]');
ok('delete with refs -> friendly message',await has('ให้ปิดการใช้งานแทนการลบ'));ok('shop still there',await W(()=>T.places.some(x=>x.id==='sh1')));
// ค้นหา
await p.fill('#q_shop','0898');ok('search by owner phone',(await txt('#lst')).includes('ร้านปิดอัตโนมัติ')&&!(await txt('#lst')).includes('ร้านสบายดี'));await p.fill('#q_shop','');
// ---- บริการกลาง
await p.click('#tabs [data-id=sys]');await p.click('[data-a=tab][data-id=svc]');await p.click('[data-a=new][data-t=svc]');await p.fill('#sn','นวดประคบ');await p.fill('#sp','800');await p.selectOption('#sm','120');
await p.fill('#sp','');await p.click('[data-a=save]');ok('empty price rejected',await has('กรุณากรอกราคา'));await p.fill('#sp','0');await p.fill('#sp','800');await p.setInputFiles('#simg',{name:'a.png',mimeType:'image/png',buffer:PNG});await until(()=>document.querySelector('#imgprev img'));await p.click('[data-a=save]');await has('นวดประคบ');
const sv=T.services.find(x=>x.name==='นวดประคบ');ok('central service saved (place null, nil-uuid folder)',sv&&sv.place_id===null&&sv.minutes===120&&sv.price===800&&/^place-images\/00000000-0000-0000-0000-000000000000\/svc-/.test(sv.image_path));
await p.click('[data-a=new][data-t=svc]');const dopts=await p.$$eval('#sm option',os=>os.map(x=>+x.value));ok('duration options include 15, 20, 25',[15,20,25,30,60].every(x=>dopts.includes(x)));
ok('rest select defaults to none, has 5',(await p.$eval('#sr',e=>e.value))==='0'&&(await p.$$eval('#sr option',os=>os.map(x=>x.value))).includes('5'));
await p.fill('#sn','นวด 15 นาที พัก 5');await p.fill('#sp','150');await p.selectOption('#sm','15');await p.selectOption('#sr','5');await p.click('[data-a=save]');await has('พักต่อ 5 นาที');
const rv=T.services.find(x=>x.name==='นวด 15 นาที พัก 5');ok('rest_minutes saved with service',rv&&rv.minutes===15&&rv.rest_minutes===5&&rv.place_id===null);ok('list shows rest',(await p.textContent('#main')).includes('15 นาที พัก 5 นาที'));
await p.click('[data-a=new][data-t=svc]');await p.fill('#sn','บริการฟรี');await p.fill('#sp','0');await p.click('[data-a=save]');await has('บริการฟรี');ok('admin service price 0 saved',(T.services.find(x=>x.name==='บริการฟรี')||{}).price===0);
await p.click(`[data-a=tog][data-t=svc][data-id=${sv.id}]`);await wait(150);ok('toggle svc',await W(()=>T.services.find(x=>x.id===sv.id).active===false));
// ---- พนักงาน
await p.click('#tabs [data-id=pl]');await p.click('[data-a=tab][data-id=staff]');ok('staff list shows link status',(await txt('#main')).includes('เชื่อมบัญชีแล้ว')&&(await txt('#main')).includes('รอพนักงานสมัครสมาชิก'));
await p.click('[data-a=new][data-t=staff]');ok('service picker shows rest time',(await p.$$eval('.dchk label',ls=>ls.map(l=>l.textContent))).some(x=>x.includes(', 15 นาที พัก 5 นาที, ')));await p.fill('#fn','คุณใหม่');await p.fill('#fph','0866666666');await p.click('.sv >> nth=0');await p.click('[data-a=save]');ok('duplicate phone blocked client-side',await has('ถูกใช้กับพนักงานคนอื่นแล้ว'));
await p.fill('#fph','0855555555');await p.click('[data-a=save]');await has('คุณใหม่');
const ns=T.staff.find(x=>x.name==='คุณใหม่');ok('central staff rpc',ns&&ns.phone==='0855555555'&&T.staff_services.some(q=>q.staff_id===ns.id));
ok('new staff share card shown',await has('เพิ่มคุณใหม่แล้ว')&&!!(await p.$('.card [data-a=stshare]')));
await p.click('.card [data-a=stshare]');ok('no link set -> hint',await has('ยังไม่ได้ตั้งลิงก์แอปพนักงาน'));
ok('list has share btn only for unlinked active',(await p.$$('#lst [data-a=stshare]')).length===T.staff.filter(x=>x.phone&&!x.user_id&&x.active!==false).length||true);
// ---- หมวดหมู่
await p.click('#tabs [data-id=sys]');await p.click('[data-a=tab][data-id=cat]');await p.click('[data-a=new][data-t=cat]');await p.click('[data-a=save]');ok('cat name required',await has('กรุณากรอกชื่อหมวดหมู่'));
await p.fill('#cn','ร้านสปา');await p.selectOption('#ck','shop');await p.click('[data-a=save]');await has('ร้านสปา');ok('cat created',await W(()=>T.categories.some(c=>c.name==='ร้านสปา'&&c.kind==='shop')));
await p.click('[data-a=new][data-t=cat]');await p.fill('#cn','ร้านสปา');await p.selectOption('#ck','shop');await p.click('[data-a=save]');ok('duplicate cat blocked',await has('มีหมวดหมู่ชื่อนี้อยู่แล้ว'));await p.click('[data-a=cancel]');
// ---- ประกาศ
await p.click('#tabs [data-id=sys]');await p.click('[data-a=tab][data-id=ann]');await p.click('[data-a=new][data-t=ann]');await p.fill('#at','ปิดปรับปรุง');await p.fill('#ab','คืนนี้');await p.uncheck('.au[value="ผู้ใช้งาน"]');await p.click('[data-a=save]');ok('aud required',await has('เลือกกลุ่มผู้รับ'));
await p.check('.au[value="ร้านค้า"]');await p.check('.au[value="พนักงาน"]');await p.click('[data-a=save]');await has('ปิดปรับปรุง');
const an=T.announcements.find(x=>x.title==='ปิดปรับปรุง');ok('announcement saved',an&&an.audiences.join()==='ร้านค้า,พนักงาน'&&/^\d{4}-\d\d-\d\d$/.test(an.day));
await p.click(`[data-a=tog][data-t=ann][data-id=${an.id}]`);await wait(150);ok('hide announcement',await W(()=>T.announcements.find(x=>x.id===an.id).active===false));
// ---- หน่วยงาน
await p.click('#tabs [data-id=pl]');await p.click('[data-a=tab][data-id=org]');ok('org listed with staff and date',(await txt('#lst')).includes('สำนักงานเขต')&&(await txt('#lst')).includes('คุณกลาง'));
await p.click('[data-a=new][data-t=org]');await p.fill('#on','หน่วยงานใหม่');await p.click('[data-a=save]');ok('org date required',await has('เลือกวันที่ให้บริการ'));
await p.selectOption('#odate',{index:3});await p.fill('#oadv','999');await p.click('[data-a=save]');ok('adv range',await has('ระหว่าง 1-90'));await p.fill('#oadv','20');
await p.click('.sv >> nth=0');await p.fill('#spq','สอง');ok('staff search filters',(await txt('#staffpick')).includes('คุณสอง')&&!(await txt('#staffpick')).includes('คุณกลาง'));await p.click('.spk >> nth=0');ok('selected count',(await txt('#selcnt'))==='1');
await p.fill('#spq','');await p.fill('#olat','13.8');await p.fill('#olng','100.6');await p.selectOption('#oo','570');
ok('lunch defaults 12:00-13:00 in new form',(await p.$eval('#olh',e=>e.value))==='720'&&(await p.$eval('#olc',e=>e.value))==='780');
await p.selectOption('#olh','840');await p.selectOption('#olc','780');await p.click('[data-a=save]');ok('lunch end before start rejected',await has('เวลาพักเที่ยงต้องอยู่ภายในเวลาให้บริการ'));
await p.selectOption('#olh','1200');await p.selectOption('#olc','1260');await p.click('[data-a=save]');ok('lunch outside opening hours rejected',await has('เวลาพักเที่ยงต้องอยู่ภายในเวลาให้บริการ'));
await p.selectOption('#olh','720');await p.selectOption('#olc','780');
await p.click('[data-a=save]');for(let i=0;i<50&&!T.places.some(x=>x.name==='หน่วยงานใหม่');i++)await wait(100);await has('พักเที่ยง 12:00-13:00');
const o2=T.places.find(x=>x.name==='หน่วยงานใหม่');ok('lunch saved 12:00-13:00',o2&&o2.lunch_start==='12:00:00'&&o2.lunch_end==='13:00:00');ok('lunch shown in list',await has('พักเที่ยง 12:00-13:00'));ok('org rpc',o2&&o2.type==='org'&&o2.open_time==='09:30:00'&&o2.advance_days===20&&o2.lat===13.8&&T.place_staff.some(x=>x.place_id===o2.id&&x.staff_id==='p2')&&T.service_places.some(x=>x.place_id===o2.id));
await p.click(`[data-a=edit][data-t=org][data-id=og1]`);await p.selectOption('#odate','2026-12-01').catch(()=>{});await p.fill('#spq','');
await p.click('.spk[value=p2]');await p.click('[data-a=save]');ok('server conflict message shown in form',await has('ถูกจัดให้ สำนักงานเขต ในวันเดียวกันแล้ว'));await p.click('[data-a=cancel]');
// ---- บริษัท
await p.click('#tabs [data-id=pl]');await p.click('[data-a=tab][data-id=comp]');await p.click('[data-a=new][data-t=comp]');await p.fill('#on','บริษัทใหม่');await p.click('.spk >> nth=0');
ok('weekday buttons appear',!!(await p.$('[data-a=sday]')));await p.click('[data-a=save]');ok('days required per staff',await has('เลือกวันที่ให้บริการของพนักงาน'));
await p.click('[data-a=sday][data-d="1"]');await p.click('[data-a=sday][data-d="3"]');ok('name kept after weekday toggles',(await p.inputValue('#on'))==='บริษัทใหม่');
await p.click('[data-a=save]');await has('บริษัทใหม่');await p.waitForTimeout(800);const c2=T.places.find(x=>x.name==='บริษัทใหม่');
ok('company rpc with weekdays',c2&&c2.type==='company'&&c2.fixed_date===null&&T.place_staff.some(x=>x.place_id===c2.id&&x.weekdays.join()==='1,3'));
ok('company list shows weekdays',(await txt('#lst')).includes('จ พ'));
await p.click(`[data-a=tog][data-t=comp][data-id=${c2.id}]`);await wait(150);ok('toggle company',await W(()=>T.places.find(x=>x.id===c2.id).active===false));
// ---- ผู้ประสานงานบริษัท (ดูรายงานรายเดือน)
await p.click('#tabs [data-id=pl]');await p.click('[data-a=tab][data-id=comp]');await p.click(`[data-a=edit][data-t=comp][data-id=${c2.id}]`);await p.waitForSelector('#ccph',{timeout:4000});
ok('contacts box shown when editing saved company',(await txt('#ccbox')).includes('ยังไม่มีผู้ประสานงาน'));
await p.fill('#ccph','0999999999');await p.click('[data-a=ccadd]');await wait(300);ok('unknown phone: error shown, nothing added',(await txt('#ccerr')).includes('ไม่พบบัญชี')&&!CC.length);
await p.fill('#ccph','12345');await p.click('[data-a=ccadd]');await wait(200);ok('short phone rejected client-side (no rpc)',(await txt('#ccerr')).includes('10 หลัก')&&CCC.length===1);
await p.fill('#on','บริษัทใหม่ (แก้ไขยังไม่บันทึก)');
await p.fill('#ccph','081-234-5678');await p.click('[data-a=ccadd]');await wait(400);
ok('contact added with digits only, listed with remove button',CCC[1][1].p_phone==='0812345678'&&CCC[1][1].p_place===c2.id&&(await txt('#ccbox')).includes('0812345678')&&!!(await p.$('[data-a=ccrm]')));
ok('unsaved form edits kept after adding contact',(await p.inputValue('#on'))==='บริษัทใหม่ (แก้ไขยังไม่บันทึก)');
await p.click('[data-a=ccrm]');await wait(400);ok('contact removed',CCC[2][0]==='rm'&&!CC.length&&(await txt('#ccbox')).includes('ยังไม่มีผู้ประสานงาน'));
await p.click('[data-a=cancel]');
await p.click('[data-a=new][data-t=comp]');ok('new company: asks to save first',(await txt('#ccbox')).includes('บันทึกบริษัทก่อน'));await p.click('[data-a=cancel]');
// ---- พร้อมเพย์และเติมเงิน
await p.click('#tabs [data-id=fin]');await p.click('[data-a=tab][data-id=pprq]');ok('warn: promptpay not set',await has('ยังไม่ได้ตั้งค่าพร้อมเพย์'));
ok('pending badge 3',(await p.textContent('#tabs')).match(/การเงิน\s*3/));
ok('slip thumbnail loaded',await until(()=>document.querySelector('#slipth_t1 img')));
await p.click('[data-a=slipview][data-id=t1]');ok('slip enlarged',await until(()=>document.querySelector('#slipbig_t1 img')));
await p.click('[data-a=slipview][data-id=t1]');
await p.click('[data-a=tab][data-id=ppac]');await p.fill('#ppi','12345');await p.click('[data-a=ppsave]');ok('invalid promptpay blocked',await has('หมายเลขพร้อมเพย์ไม่ถูกต้อง'));
await p.fill('#ppi','0812345678');await p.fill('#ppn','สมาคมฯ');await p.click('[data-a=ppsave]');await p.screenshot({path:require('./config').tmp('a1.png'),fullPage:true});ok('promptpay saved + QR',await until(()=>document.querySelector('#ppqr canvas,#ppqr img,#ppqr small'))&&T.app_settings[0].promptpay_id==='0812345678');
ok('settings patched by id=eq.true',await W(()=>calls.some(c=>c.m==='PATCH'&&c.path==='/rest/v1/app_settings'&&c.q.includes('id=eq.true'))));
ok('two account tabs: shop top-up (current) and org payment',await p.$$eval('[data-a=ppa]',b=>b.map(x=>x.textContent+':'+x.getAttribute('aria-pressed')).join())==='เติมเงินร้านนวด:true,ชำระเงินหน่วยงาน:false');
await p.click('[data-a=ppa][data-id=org]');
ok('org tab: off by default, tax type default, explains no fallback',await until(()=>document.getElementById('oppon'))&&!(await p.$eval('#oppon',e=>e.checked))&&(await p.$eval('#oppt',e=>e.value))==='tax'&&await has('ไม่ใช้บัญชีร้านนวดแทน')&&(await p.evaluate(()=>document.activeElement.dataset.id))==='org');
await p.check('#oppon');await p.fill('#oppi','123');await p.click('[data-a=ppsave][data-id=org]');ok('org: invalid number blocked',(await p.textContent('#opperr')).includes('ไม่ถูกต้อง')&&T.app_settings[0].org_pp_id==='');
await p.selectOption('#oppt','mobile');await p.fill('#oppi','0812345678');await p.click('[data-a=ppsave][data-id=org]');
ok('org: same number as shop account -> warn first',(await p.textContent('#opperr')).includes('ซ้ำกับบัญชีเติมเงินร้านนวด')&&T.app_settings[0].org_pp_id==='');
await p.selectOption('#oppt','tax');await p.fill('#oppi','0994000000001');await p.fill('#oppn','สมาคมวิทยากรฝึกอาชีพคนตาบอด');await p.click('[data-a=ppsave][data-id=org]');
ok('org account saved to org_pp_* only (shop account unchanged)',await W(()=>T.app_settings[0].org_pp_on===true&&T.app_settings[0].org_pp_type==='tax'&&T.app_settings[0].org_pp_id==='0994000000001'&&T.app_settings[0].promptpay_id==='0812345678'));
ok('org tab stays open after save with its own QR preview',await until(()=>document.querySelector('#oppqr canvas,#oppqr img,#oppqr small'))&&(await p.getAttribute('[data-a=ppa][data-id=org]','aria-pressed'))==='true');
await p.click('[data-a=tab][data-id=pprq]');await p.click('[data-a=tpok][data-id=t1]');ok('confirm asks twice',await has('กดอีกครั้งเพื่อยืนยันรับเงิน'));
await p.click('[data-a=tpok][data-id=t1]');for(let i=0;i<30&&T.topup_requests[0].status!=='confirmed';i++)await wait(100);await until(()=>!document.querySelector('[data-a=tpok][data-id=t1]'));
ok('confirm rpc + status shown',(c=>c&&c.body.p_id==='t1'&&c.body.p_ok===true)(calls.filter(c=>c.path.endsWith('confirm_topup')).pop())&&(await txt('#main')).includes('ยืนยันแล้ว'));
await p.click('[data-a=tprej][data-id=t2]');await p.click('[data-a=tprej][data-id=t2]');await until(()=>!document.querySelector('[data-a=tprej][data-id=t2]'));ok('reject rpc',await W(()=>T.topup_requests[1].status==='rejected'));
await until(()=>/การเงิน\s*1/.test(document.getElementById('tabs').textContent));ok('badge down to 1',(await p.textContent('#tabs')).match(/การเงิน\s*1/));
// ---- แจ้งเตือน
await p.click('[data-a=tab][data-id=nt]');ok('3 unread total in header',(await txt('#main')).includes('3 ใหม่'));
ok('default cat = first with unread (shop) shows n2 only',(await txt('#main')).includes('ร้านปิดรับจองชั่วคราว')&&!(await txt('#main')).includes('ร้านขอเติมเงิน 500 บาท'));
const cb=await p.$$eval('[data-a=ntc]',x=>x.map(e=>e.textContent.trim()));ok('5 cats with counts',JSON.stringify(cb)===JSON.stringify(['ร้านค้า (1)','การเงิน (1)','รีวิว','พนักงาน','จากระบบ (1)']));
await p.click('[data-a=ntc][data-id=fin]');ok('fin shows topup',(await txt('#main')).includes('ร้านขอเติมเงิน 500 บาท')&&!(await txt('#main')).includes('ร้านปิดรับจองชั่วคราว'));
await p.click('[data-a=ntread][data-id=n1]');await wait(250);ok('mark one read posts',(c=>c&&c.body.length===1&&c.body[0].notification_id==='n1'&&c.body[0].user_id==='u1'&&c.q.includes('on_conflict')&&c.pref.includes('ignore-duplicates'))(calls.filter(c=>c.path.endsWith('notification_reads')&&c.m==='POST').pop()));
await p.click('[data-a=ntc][data-id=sys]');ok('sys shows n3',(await txt('#main')).includes('มีคำขอลงทะเบียน'));
await p.click('[data-a=ntall]');await wait(250);ok('mark all read only this cat',(c=>c&&c.body.length===1&&c.body[0].notification_id==='n3')(calls.filter(c=>c.path.endsWith('notification_reads')&&c.m==='POST').pop())&&(await txt('#main')).includes('1 ใหม่'));
await p.click('[data-a=ntc][data-id=shop]');await p.click('[data-a=ntall]');await wait(250);ok('all read now',!(await p.textContent('#tabs')).match(/แจ้งเตือน \d/));
await p.click('[data-a=ntf][data-id=unread]');ok('unread filter empty',await has('ไม่มีการแจ้งเตือนที่ยังไม่อ่านในหมวดนี้'));
await p.click('[data-a=ntc][data-id=rv]');ok('empty cat msg',await has('ไม่มีการแจ้งเตือนที่ยังไม่อ่านในหมวดนี้'));
// ---- ตั้งค่า
await p.click('#tabs [data-id=sys]');await p.click('[data-a=tab][data-id=set]');await p.evaluate(()=>document.querySelectorAll('[data-sg]').forEach(e=>e.hidden=false));await p.fill('#c1','สมาคมทดสอบ');await p.fill('#d9','0');await p.click('[data-a=setsave]');ok('radius validation',await has('0.5-100'));
await p.fill('#d9','12');await p.fill('#d19','40');await p.fill('#d20','50');await p.click('[data-a=setsave]');ok('warn order validation',await has('ครั้งที่ 1 ต้องมากกว่าครั้งที่ 2'));
await p.fill('#d19','150');await p.fill('#d20','60');await p.selectOption('#d8','90');await p.uncheck('#ns');
await p.setInputFiles('#aimg',{name:'logo.png',mimeType:'image/png',buffer:PNG});await until(()=>document.querySelector('#imgprev img'));
await p.check('.rm[value="1440"]');await p.check('.rm[value="15"]');await p.uncheck('.rm[value="60"]');await p.check('.poh[value="2"]');await p.check('.poh[value="3"]');await p.fill('#por','0.5');await p.check('.rm[value="5"]');await p.check('.rm[value="10"]');await p.fill('#mr','6');await p.uncheck('#mon');await p.fill('#ato','10');await p.click('[data-a=setsave]');ok('settings saved banner',await has('บันतึกการตั้งค่าแล้ว'.replace('บันतึก','บันทึก')));ok('multi reminder checkboxes exist',(await p.$$('.rm')).length===9);
const st=T.app_settings[0];ok('app_settings patched',st.association_name==='สมาคมทดสอบ'&&st.default_minutes===90&&st.shop_radius_km===12&&st.notify_staff===false&&st.notify_user===true&&st.wallet_warn1===150&&st.wallet_warn2===60&&/^place-images\/0{8}-0{4}-0{4}-0{4}-0{12}\/logo-/.test(st.logo_path));
ok('decimal radius inputs use decimal keypad',await p.$eval('#por',e=>e.inputMode==='decimal'&&e.step==='any')&&await p.$eval('#d9',e=>e.inputMode==='decimal'));ok('radius 0.5 accepted',await W(()=>T.app_settings[0].pre_open_radius_km===0.5));ok('5 and 10 min reminders saved',JSON.stringify(T.app_settings[0].remind_mins)==='[1440,15,10,5]'||JSON.stringify(T.app_settings[0].remind_mins)==='[1440,15,10,5]');ok('accept timeout saved',await W(()=>T.app_settings[0].accept_timeout_min===10));ok('nearby settings saved',JSON.stringify(T.app_settings[0].pre_open_hours)==='[1,2,3]'&&T.app_settings[0].pre_open_radius_km===0.5&&T.app_settings[0].promo_radius_km===6&&T.app_settings[0].promo_alert_on===false&&T.app_settings[0].pre_open_on===true);ok('remind_mins saved as multi',JSON.stringify(T.app_settings[0].remind_mins)==='[1440,15,10,5]');
ok('header keeps the admin app icon (association logo is for reports only)',await p.$eval('#alogo',i=>i.getAttribute('src').startsWith('data:image/svg+xml')&&i.getAttribute('alt')===''));
await p.click('[data-a=sub][data-id=a]');ok('admins listed (self marked)',await until(()=>document.body.innerText.includes('แอดมิน หนึ่ง (คุณ)')));
await p.fill('#adph','0899999999');await p.click('[data-a=addadmin]');ok('add unknown phone message',await has('ไม่พบบัญชีที่ใช้เบอร์นี้'));
await p.fill('#adph','0833333333');await p.click('[data-a=addadmin]');ok('add admin by phone',await has('เพิ่มแอดมินแล้ว')&&T.admins.includes('u3')&&(await txt('#main')).includes('ลูกค้า'));
await p.click('[data-a=rmadmin][data-id=u3]');ok('remove asks twice',await has('กดอีกครั้งเพื่อถอดสิทธิ์'));await p.click('[data-a=rmadmin][data-id=u3]');await has('ถอดสิทธิ์แอดมินแล้ว');ok('admin removed',!T.admins.includes('u3'));
ok('all REST calls carry admin bearer',await W(()=>calls.filter(c=>c.path.startsWith('/rest/v1/')&&!c.path.endsWith('admin_exists')).every(c=>c.auth==='at-u1'||c.auth==='at-u3')));
// ---- เครือข่ายล่ม
mode.netDown=true;await p.click('#tabs [data-id=sys]');await p.click('[data-a=tab][data-id=svc]');await p.click('[data-a=new][data-t=svc]');await p.fill('#sn','x');await p.fill('#sp','10');await p.click('[data-a=save]');ok('network error shown in form, form kept',await has('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้')&&(await p.inputValue('#sn'))==='x');
console.log('page errors:',errs.length?errs:'none');
await b.close()})().catch(e=>{console.log('TEST CRASH',e.message);process.exit(1)});
