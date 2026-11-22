// แอปแอดมิน เมนู ระบบ > บทความและข่าว (เว็บประชาสัมพันธ์ site/): เขียน แก้ ร่าง เผยแพร่ ซ่อน ลบ รูปปก (ย่อเหลือกว้าง 1200 ต้องมีคำบรรยายรูป)
// และกรณียังไม่ได้สร้างตาราง site_articles ในฐานข้อมูล (เมนูอื่นต้องใช้ได้ตามปกติ)
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
 const filt=rr=>{for(const [k,v] of sp.entries()){if(['select','order','limit','on_conflict'].includes(k))continue;if(v==='is.null')rr=rr.filter(x=>x[k]==null);else if(v.startsWith('eq.'))rr=rr.filter(x=>String(x[k])===v.slice(3))}return rr};
 if(m==='GET'){let rr=filt(T[tb]);const sel=sp.get('select')||'';
  rr=rr.map(x=>{x=Object.assign({},x);if(sel.includes('staff_services('))x.staff_services=T.staff_services.filter(q=>q.staff_id===x.id).map(q=>({service_id:q.service_id}));if(sel.includes('places(name)'))x.places={name:(T.places.find(p=>p.id===x.place_id)||{}).name};return x});
  if(tb==='notification_reads')rr=rr.filter(x=>x.user_id===me.id);return J(200,rr)}
 if(m==='POST'){const arr=Array.isArray(body)?body:[body];for(const bd of arr){const row=Object.assign({id:tb[0]+(++n),created_at:now(),active:true},bd);if(tb==='notification_reads'&&T[tb].some(x=>x.notification_id===bd.notification_id&&x.user_id===bd.user_id))continue;T[tb].push(row)}return J(201,null)}
 if(m==='PATCH'){filt(T[tb]).forEach(x=>Object.assign(x,body));return J(204,null)}
 if(m==='DELETE'){const keep=T[tb].filter(x=>!filt([x]).length);if(tb==='places'&&sp.get('id')==='eq.sh1')return J(409,{code:'23503',message:'fk'});T[tb]=keep;return J(204,null)}
 return J(404,{message:'nf'})});
// ---- ด้านบนคัดลอกฐานข้อมูลจำลองจาก t_admin_share.js ----
const W=require('./config').waitFor;
T.site_articles=[
 {id:'sa1',no:1,kind:'news',title:'ข่าวที่เผยแพร่อยู่',summary:'สรุปข่าว',body:'เนื้อหา',cover_path:null,cover_alt:'',day:'2026-11-10',pinned:false,active:true,created_at:'1',updated_at:'1'},
 {id:'sa2',no:2,kind:'article',title:'บทความร่าง',summary:'',body:'ร่างเนื้อหา',cover_path:'place-images/00000000-0000-0000-0000-000000000000/site-old.jpg',cover_alt:'',day:'2026-11-12',pinned:true,active:false,created_at:'2',updated_at:'2'}];
let MISSING=false;
await ctx.route(/\/rest\/v1\/site_articles/,r=>MISSING?r.fulfill({status:404,contentType:'application/json',body:JSON.stringify({code:'42P01',message:'relation "public.site_articles" does not exist'})}):r.fallback());
const p=await ctx.newPage();await p.setViewportSize({width:420,height:900});p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>{errs.push('DIALOG '+d.message());d.dismiss()});
const ok=(nm,c)=>console.log((c?'PASS ':'FAIL ')+nm);
const until=async(f,a)=>{try{await p.waitForFunction(f,a,{timeout:4000});return true}catch(e){return false}};
const has=async t=>until(x=>document.body.innerText.includes(x),t);
const saCalls=()=>calls.filter(c=>c.path==='/rest/v1/site_articles'&&c.m!=='GET');
await p.goto(require('./config').page('admin-panel.html'));
await has('สร้างบัญชีแอดมินคนแรก');
await p.fill('#sn','แอดมิน หนึ่ง');await p.fill('#sph','0811111111');await p.fill('#spw','adminpass1');await p.fill('#spw2','adminpass1');await p.click('button[type=submit]');
await until(()=>document.getElementById('tabs').textContent.includes('หน้าหลัก'));
await p.click('#tabs [data-id=sys]');
ok('sys sub-menu has บทความและข่าว next to ประกาศ',await until(()=>{const s=[].map.call(document.querySelectorAll('#main .subtabs [data-id]'),x=>x.dataset.id);return s.indexOf('art')===s.indexOf('ann')+1}));
await p.click('#main .subtabs [data-id=art]');
ok('list shows both, published has link to the public site',await has('บทความร่าง')&&await p.evaluate(()=>{const a=document.querySelector('a[href="https://massage-home-bna.pages.dev/news/1"]');return !!a&&a.target==='_blank'}));
ok('draft row: no web link, gently suggests a cover description, says pinned',await p.evaluate(()=>!document.querySelector('a[href$="/news/2"]')&&document.body.innerText.includes('รูปปกยังไม่มีคำบรรยาย (แนะนำให้ใส่)')&&document.body.innerText.includes('ปักหมุด')));
ok('hint links to the public site and counts published (1)',await has('เผยแพร่อยู่ 1 เรื่อง'));

// เขียนใหม่
await p.click('[data-a=new][data-t=art]');await p.waitForSelector('#arT');
ok('form: labelled fields, date defaults to today',await p.evaluate(()=>['arK','arT','arS','arB','artimg','arA','arD','arP'].every(i=>!!document.querySelector('label[for="'+i+'"]')||!!document.getElementById(i).closest('label'))&&/^\d{4}-\d{2}-\d{2}$/.test(document.getElementById('arD').value)));
await p.click('[data-a=save][data-pub="1"]');
ok('empty title: error and focus on title',await has('กรุณากรอกหัวข้อ')&&await p.evaluate(()=>document.activeElement.id==='arT'));
await p.fill('#arT','เปิดอบรมหมอนวด');await p.fill('#arS','รับสมัคร 30 คน');await p.fill('#arB','ย่อหน้า 1\n\n## รายละเอียด\n- ฟรี');await p.selectOption('#arK','news');await p.check('#arP');
// รูปใหญ่ 2400x1000 ต้องย่อเหลือกว้าง 1200
const big=await p.evaluate(()=>{const c=document.createElement('canvas');c.width=2400;c.height=1000;const x=c.getContext('2d');x.fillStyle='#0a6';x.fillRect(0,0,2400,1000);return c.toDataURL('image/png').split(',')[1]});
await p.setInputFiles('#artimg',{name:'cover.png',mimeType:'image/png',buffer:Buffer.from(big,'base64')});
ok('big image resized to 1200 wide (keeps ratio), preview shown, focus to description',await until(()=>{const i=document.querySelector('#artprev img');return !!i&&i.src.startsWith('data:image/jpeg')})&&await p.evaluate(()=>new Promise(r=>{const i=new Image();i.onload=()=>r(i.width===1200&&i.height===500&&document.activeElement.id==='arA');i.src=document.querySelector('#artprev img').src})));
ok('cover description label says optional (not required)',await p.evaluate(()=>/ไม่บังคับ/.test(document.querySelector('label[for="arA"]').textContent)));
// แทรกรูปในเนื้อหา: วางเคอร์เซอร์หลัง "ย่อหน้า 1" แล้วแทรกรูปพร้อมคำบรรยาย
await p.evaluate(()=>{const t=document.getElementById('arB');t.focus();t.setSelectionRange(9,9)});
const upN=()=>stor.filter(x=>!x.path.startsWith('public/')).length,nIn=upN();
let [fc]=await Promise.all([p.waitForEvent('filechooser'),p.click('[data-a=artinimg]')]);await fc.setFiles({name:'in1.png',mimeType:'image/png',buffer:Buffer.from(big,'base64')});
ok('inline image: preview + optional caption field (labelled), focus on caption, body text kept',await until(()=>!!document.querySelector('#artinbox img')&&document.activeElement.id==='arIC')&&await p.evaluate(()=>/ไม่บังคับ/.test(document.querySelector('label[for="arIC"]').textContent)&&document.getElementById('arT').value==='เปิดอบรมหมอนวด'));
await p.fill('#arIC','ห้อง [อบรม]\nชั้น 2');await p.click('[data-a=artinins]');
const IMGP='place-images\\/00000000-0000-0000-0000-000000000000\\/site-[a-z0-9]+\\.jpg';
ok('inline image: uploaded, line inserted at cursor on its own paragraph, caption cleaned, focus back in body',await until(()=>/แทรกรูปแล้ว/.test(document.getElementById('artinmsg').textContent))&&upN()===nIn+1&&await p.evaluate(P=>new RegExp('^ย่อหน้า 1\\n\\n\\[รูป: ห้อง อบรม ชั้น 2\\]\\('+P+'\\)\\n\\n## รายละเอียด\\n- ฟรี$').test(document.getElementById('arB').value)&&document.activeElement.id==='arB'&&!document.querySelector('#artinbox img'),IMGP));
// แทรกรูปที่ 2 ท้ายเรื่อง ไม่ใส่คำบรรยาย
await p.evaluate(()=>{const t=document.getElementById('arB');t.setSelectionRange(t.value.length,t.value.length)});
[fc]=await Promise.all([p.waitForEvent('filechooser'),p.click('[data-a=artinimg]')]);await fc.setFiles({name:'in2.png',mimeType:'image/png',buffer:Buffer.from(big,'base64')});
await until(()=>!!document.querySelector('#artinbox img'));await p.click('[data-a=artinins]');
ok('inline image without caption: [รูป](path) added as last paragraph, message says no caption',await until(()=>/ไม่มีคำบรรยาย/.test(document.getElementById('artinmsg').textContent))&&await p.evaluate(P=>new RegExp('- ฟรี\\n\\n\\[รูป\\]\\('+P+'\\)$').test(document.getElementById('arB').value),IMGP));
// ยกเลิก: ไม่อัปโหลด ไม่แตะเนื้อหา
const bodyNow=await p.inputValue('#arB'),nIn2=upN();
[fc]=await Promise.all([p.waitForEvent('filechooser'),p.click('[data-a=artinimg]')]);await fc.setFiles({name:'in3.png',mimeType:'image/png',buffer:Buffer.from(big,'base64')});
await until(()=>!!document.querySelector('#artinbox img'));await p.click('[data-a=artincan]');
ok('inline image cancel: no upload, body unchanged, focus back on the insert button',await p.evaluate(()=>!document.querySelector('#artinbox img')&&document.activeElement.dataset.a==='artinimg')&&upN()===nIn2&&await p.inputValue('#arB')===bodyNow);
await p.fill('#arA','ภาพห้องอบรม');
await p.click('[data-a=save][data-pub="1"]');
ok('published message',await has('เผยแพร่บนเว็บแล้ว'));
await W(()=>saCalls().length>0);let c=saCalls()[0]||{};
ok('POST body: fields (with 2 inline image lines), published, pinned, cover in association folder',c.m==='POST'&&c.body.title==='เปิดอบรมหมอนวด'&&c.body.summary==='รับสมัคร 30 คน'&&new RegExp('^ย่อหน้า 1\\n\\n\\[รูป: ห้อง อบรม ชั้น 2\\]\\('+IMGP+'\\)\\n\\n## รายละเอียด\\n- ฟรี\\n\\n\\[รูป\\]\\('+IMGP+'\\)$').test(c.body.body)&&c.body.kind==='news'&&c.body.active===true&&c.body.pinned===true&&c.body.cover_alt==='ภาพห้องอบรม'&&/^place-images\/00000000-0000-0000-0000-000000000000\/site-[a-z0-9]+\.jpg$/.test(c.body.cover_path)&&!!c.body.updated_at);
ok('image uploaded to place-images/<NIL>/site-*.jpg',stor.some(x=>/^place-images\/00000000-0000-0000-0000-000000000000\/site-[a-z0-9]+\.jpg$/.test(x.path)&&x.len>0));
ok('form closed, new item in list',await until(()=>!document.getElementById('arT')&&document.body.innerText.includes('เปิดอบรมหมอนวด')));

// แก้บทความร่าง: ใส่คำบรรยายรูปเดิม บันทึกเป็นร่าง (ไม่อัปโหลดรูปซ้ำ)
const ups=()=>stor.filter(x=>!x.path.startsWith('public/')).length,nStor=ups();
await p.click('[data-a=edit][data-t=art][data-id=sa2]');await p.waitForSelector('#arT');
ok('edit: fields filled, existing cover previewed, kind บทความ',await p.evaluate(()=>document.getElementById('arT').value==='บทความร่าง'&&document.getElementById('arK').value==='article'&&document.getElementById('arP').checked&&!!document.querySelector('#artprev img[src*="site-old.jpg"]')));
ok('edit draft: buttons say publish / keep as draft',await has('บันทึกและเผยแพร่')&&await has('บันทึกเป็นร่าง'));
const nSa0=saCalls().length;await p.fill('#arA','ภาพเดิม');await p.click('[data-a=save][data-pub="0"]');
ok('saved as draft message',await has('บันทึกเป็นร่างแล้ว'));
await W(()=>saCalls().length>nSa0);c=saCalls()[nSa0]||{};
ok('PATCH draft keeps old cover, no new upload',c.m==='PATCH'&&c.q.includes('id=eq.sa2')&&c.body.active===false&&c.body.cover_path==='place-images/00000000-0000-0000-0000-000000000000/site-old.jpg'&&c.body.cover_alt==='ภาพเดิม'&&ups()===nStor);

// เอารูปออก
await p.click('[data-a=edit][data-t=art][data-id=sa2]');await p.waitForSelector('#arT');
await p.click('[data-a=artnoimg]');
ok('remove image: preview cleared, focus on file input',await p.evaluate(()=>!document.querySelector('#artprev img')&&document.activeElement.id==='artimg'));
const nSa=saCalls().length;await p.click('[data-a=save][data-pub="0"]');
ok('PATCH without cover clears path and description',await W(()=>{const x=saCalls()[nSa];return !!x&&x.m==='PATCH'&&x.body.cover_path===null&&x.body.cover_alt===''}));

// เผยแพร่ / ซ่อน จากรายการ
await W(()=>true);await p.click('[data-a=tog][data-t=art][data-id=sa1]');
ok('hide from list: message and PATCH active=false',await has('ซ่อนจากเว็บแล้ว')&&await W(()=>{const x=saCalls().pop();return x&&x.m==='PATCH'&&x.q.includes('id=eq.sa1')&&x.body.active===false}));
// ลบ ต้องกดสองครั้ง
await p.click('[data-a=del][data-t=art][data-id=sa2]');
ok('delete asks to press again',await has('กดอีกครั้งเพื่อลบ')&&!calls.some(x=>x.m==='DELETE'&&x.path==='/rest/v1/site_articles'));
await p.click('[data-a=del][data-t=art][data-id=sa2]');
ok('second press deletes',await W(()=>calls.some(x=>x.m==='DELETE'&&x.path==='/rest/v1/site_articles'&&x.q.includes('id=eq.sa2')))&&await until(()=>!document.body.innerText.includes('บทความร่าง')));

// ประเภทใหม่ "ผลงานบริการ" ต้องมีรูปปก
await p.click('[data-a=new][data-t=art]');await p.waitForSelector('#arT');
ok('kind select has ผลงานบริการ',await p.evaluate(()=>[...document.querySelectorAll('#arK option')].map(o=>o.value).join()==='news,work,article'));
await p.selectOption('#arK','work');await p.fill('#arT','นวดให้พนักงานบริษัท ก');await p.fill('#arB','วันสุขภาพพนักงาน');
const nW=saCalls().length;await p.click('[data-a=save][data-pub="1"]');
ok('work without cover: blocked with reason, focus on file input',await has('ผลงานบริการต้องมีรูปปก')&&saCalls().length===nW&&await p.evaluate(()=>document.activeElement.id==='artimg'));
const img2=await p.evaluate(()=>{const c=document.createElement('canvas');c.width=800;c.height=450;c.getContext('2d').fillRect(0,0,800,450);return c.toDataURL('image/png').split(',')[1]});
await p.setInputFiles('#artimg',{name:'w.png',mimeType:'image/png',buffer:Buffer.from(img2,'base64')});
await until(()=>{const i=document.querySelector('#artprev img');return !!i&&i.src.startsWith('data:image/jpeg')});
await p.click('[data-a=save][data-pub="1"]');
ok('work with cover but no description: saves (description optional), cover_alt empty',await W(()=>{const x=saCalls()[nW];return !!x&&x.m==='POST'&&x.body.kind==='work'&&x.body.active===true&&/site-/.test(x.body.cover_path||'')&&x.body.cover_alt===''}));
ok('list shows ผลงานบริการ label',await until(()=>document.body.innerText.includes('ผลงานบริการ,')));
// เกิน 10 รูปในเนื้อหา: ปุ่มแทรกรูปบอกเหตุผล, บันทึกไม่ได้
await p.click('[data-a=new][data-t=art]');await p.waitForSelector('#arT');await p.fill('#arT','รูปเยอะ');
await p.fill('#arB',Array.from({length:10},(_,i)=>'[รูป](place-images/x/site-'+i+'.jpg)').join('\n\n'));
await p.click('[data-a=artinimg]');
ok('10 inline images: insert button explains the limit',await until(()=>/ไม่เกิน 10 รูป/.test(document.getElementById('artinmsg').textContent)));
await p.fill('#arB',Array.from({length:11},(_,i)=>'[รูป](place-images/x/site-'+i+'.jpg)').join('\n\n'));
const nL=saCalls().length;await p.click('[data-a=save][data-pub="0"]');
ok('11 inline images: save blocked with reason, focus on body',await has('รูปในเนื้อหาเกิน 10 รูป')&&saCalls().length===nL&&await p.evaluate(()=>document.activeElement.id==='arB'));
await p.click('[data-a=cancel]');

// ยังไม่ได้สร้างตารางในฐานข้อมูล: เมนูอื่นใช้ได้ เมนูนี้บอกว่าต้องเพิ่มตาราง
MISSING=true;await p.reload();await until(()=>document.getElementById('tabs')&&document.getElementById('tabs').textContent.includes('หน้าหลัก'));
await p.click('#tabs [data-id=sys]');await p.click('#main .subtabs [data-id=ann]');
ok('table missing: other menus still load (ประกาศ)',await has('ประกาศเดิม'));
await p.click('#main .subtabs [data-id=art]');
ok('table missing: art menu explains database step',await has('ต้องเพิ่มตารางบทความในฐานข้อมูลก่อน')&&!(await p.$('[data-a=new][data-t=art]')));

console.log('errors:',errs.join('|')||'none');ok('no page errors',errs.length===0);await b.close();process.exit(0)})();
