const {chromium}=require('playwright');const W=require('./config').waitFor;
const PNG=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==','base64');
(async()=>{const b=await chromium.launch(require('./config').launch);
const ctx=await b.newContext({timezoneId:'Asia/Bangkok',locale:'th-TH'});const errs=[],calls=[],stor=[];
let n=100;const now=()=>new Date().toISOString();
const users={'0811111111':{id:'u1',pw:'abc123'},'0822222222':{id:'u2',pw:'abc123'}};
const byTok=t=>Object.values(users).find(u=>'at-'+u.id===t);
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
 notifications:[{id:'n1',audience:'shop',place_id:'sh1',kind:'booking',title:'มีการจองใหม่',body:'MS000001',created_at:'2026-10-15T02:00:00Z'},{id:'n2',audience:'shop',place_id:'sh1',kind:'job',title:'พนักงานเริ่มงาน',body:'x',created_at:'2026-10-15T03:00:00Z'},{id:'n3',audience:'shop',place_id:'sh1',kind:'wallet_low',title:'ยอดต่ำ',body:'y',created_at:'2026-10-15T04:00:00Z'}],
 notification_reads:[],
 announcements:[{id:'a1',title:'ปิดปรับปรุงระบบ',body:'คืนนี้',audiences:['ร้านค้า'],active:true,day:'2026-10-16',created_at:'2026-10-16T01:00:00Z'},{id:'a2',title:'เฉพาะผู้ใช้',body:'x',audiences:['ผู้ใช้งาน'],active:true,day:'2026-10-16',created_at:'2026-10-16T01:00:00Z'}],
 app_settings:[{promptpay_on:true,promptpay_type:'mobile',promptpay_id:'0812345678',promptpay_name:'สมาคมฯ',wallet_warn1:100,wallet_warn2:50}]};
const sess=u=>({access_token:'at-'+u.id,refresh_token:'rt-'+u.id,expires_in:3600,user:{id:u.id,user_metadata:{phone:u.phone}}});
for(const [ph,u] of Object.entries(users))u.phone=ph;
let mode={fkErr:true,netDown:false};
await ctx.route('**/*',async r=>{const q=r.request(),u=new URL(q.url());if(u.protocol==='file:')return r.continue();if(u.host==='cdnjs.cloudflare.com'&&/qrcode/.test(u.pathname))return r.fulfill({contentType:'application/javascript',body:"window.QRCode=function(el,o){var c=document.createElement('canvas');c.width=c.height=o.width;var x=c.getContext('2d');x.fillStyle='#000';x.fillRect(0,0,o.width/2,o.width/2);el.appendChild(c)};QRCode.CorrectLevel={M:0};"});if(!u.host.endsWith('supabase.co'))return r.abort();
 const m=q.method(),path=u.pathname,sp=u.searchParams;let body=null;try{body=JSON.parse(q.postData()||'null')}catch(e){}
 const hdr=q.headers(),auth=(hdr.authorization||'').replace('Bearer ',''),me=byTok(auth);calls.push({m,path,q:u.search,body,auth,pref:hdr.prefer||''});
 const J=(s,o)=>r.fulfill({status:s,contentType:'application/json',body:JSON.stringify(o)});
 if(mode.netDown)return r.abort();
 if(path==='/auth/v1/signup'){const e=body.email,ph=e.split('@')[0];if(users[ph])return J(422,{error_code:'user_already_exists',msg:'User already registered'});const id='u'+(++n);users[ph]={id,pw:body.password,phone:ph};return J(200,sess(users[ph]))}
 if(path==='/auth/v1/token'){if(sp.get('grant_type')==='refresh_token'){const u2=Object.values(users).find(x=>'rt-'+x.id===body.refresh_token);return u2?J(200,sess(u2)):J(400,{error_code:'refresh_token_not_found',msg:'bad'})}
  const ph=body.email.split('@')[0],us=users[ph];if(!us||us.pw!==body.password)return J(400,{error_code:'invalid_credentials',msg:'Invalid login credentials'});return J(200,sess(us))}
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
  return J(404,{message:'no rpc '+f})}
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
const txt=async s=>await p.textContent(s||'body');
const sub=async id=>{const sel='[role=tab][data-id='+id+']';for(let i=0;i<3&&!(await p.$(sel));i++){await p.click('#tabs [data-id=mg]');await p.waitForSelector(sel,{timeout:4000}).catch(()=>{})}await p.click(sel)};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const until=async(f,a)=>{try{await p.waitForFunction(f,a,{timeout:10000});return true}catch(e){return false}};
const has=async t=>until(x=>document.body.innerText.includes(x),t);
const URLF=require('./config').page('shop-owner.html');
const STUB=`(function(){var W=window;function LL(a,b){return{lat:a,lng:b}}
W.__lf={};
W.L={map:function(box,o){var c=LL(0,0),h={},m={};m.setView=function(a,z){c=LL(a[0],a[1]);m.z=z;return m};
 m.latLngToContainerPoint=function(a){a=Array.isArray(a)?LL(a[0],a[1]):a;return{x:(a.lng-c.lng)*1000,y:-(a.lat-c.lat)*1000}};
 m.containerPointToLatLng=function(p){return LL(c.lat-p.y/1000,c.lng+p.x/1000)};
 m.panTo=function(a){c=LL(a[0],a[1])};m.on=function(e,f){h[e]=f;return m};m.remove=function(){W.__lf.removed=true};m.invalidateSize=function(){};
 W.__lf.map=m;W.__lf.fire=function(e,x){h[e]&&h[e](x)};W.__lf.center=function(){return c};box.setAttribute('data-stub','1');return m},
 tileLayer:function(){return{addTo:function(){W.__lf.tiles=true}}},
 divIcon:function(o){return o},
 marker:function(a,o){var p=LL(a[0],a[1]),h={},k={addTo:function(){return k},setLatLng:function(x){p=LL(x[0],x[1])},getLatLng:function(){return p},on:function(e,f){h[e]=f;return k}};W.__lf.mk=k;W.__lf.drag=function(x){p=LL(x.lat,x.lng);h.dragend&&h.dragend()};return k}}})();`;
let stubOn=true;
await ctx.route('**/unpkg.com/**',r=>{const u=r.request().url();if(!stubOn)return r.abort();if(u.endsWith('.css'))return r.fulfill({status:200,contentType:'text/css',body:''});return r.fulfill({status:200,contentType:'application/javascript',body:STUB})});
await ctx.addInitScript(()=>{window.__sri=[];for(const C of [HTMLScriptElement,HTMLLinkElement]){const d=Object.getOwnPropertyDescriptor(C.prototype,'integrity');Object.defineProperty(C.prototype,'integrity',{configurable:true,get(){return this.__i||''},set(v){this.__i=v;window.__sri.push(v)}})}});

const NM=[];let nmFail=false;
await ctx.route('**/nominatim.openstreetmap.org/**',r=>{const u=new URL(r.request().url());const lat=+u.searchParams.get('lat'),lon=+u.searchParams.get('lon');NM.push({t:Date.now(),lat,lon,lang:u.searchParams.get('accept-language')});
 if(nmFail)return r.fulfill({status:500,body:'err'});
 const j=lat<10?{name:'โรงแรมทดสอบ ป่าตอง',address:{road:'ถนนราษฎร์อุทิศ 200 ปี',suburb:'ป่าตอง',city_district:'กะทู้',state:'ภูเก็ต'}}:{name:'',address:{road:'ถนนพระราม 4',suburb:'ลุมพินี',city_district:'ปทุมวัน',state:'กรุงเทพมหานคร'}};
 return r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(j)})});
await p.goto(URLF);
ok('gate shows login',await has('เข้าสู่ระบบร้านค้า')&&!!(await p.$('#gph')));
ok('main hidden at gate',await p.$eval('#main',e=>e.hidden));
await p.click('[data-g=forgot]');ok('forgot -> request form (call-back by staff)',(await txt('#gate')).includes('เจ้าหน้าที่จะโทรกลับเพื่อยืนยันตัวตน'));
await p.click('[data-g=back]');
await p.fill('#gph','0811111111');await p.fill('#gpw','wrong');await p.click('[data-g=login]');
ok('wrong password message',await has('เบอร์มือถือหรือรหัสผ่านไม่ถูกต้อง'));
await p.fill('#gph','123');await p.click('[data-g=login]');ok('bad phone validation',await has('กรอกเบอร์มือถือ 10 หลัก'));
// ---- ลงทะเบียนร้านใหม่
await p.click('[data-g=reg]');await until(()=>document.querySelector('#rc option'));
ok('categories loaded anon',(await p.$$eval('#rc option',o=>o.map(x=>x.textContent))).join()==='ร้านนวดแผนไทย,สปา');
ok('category fetch without bearer',await W(()=>calls.find(c=>c.path.endsWith('/categories')).auth===''));
await p.fill('#rn','ร้านใหม่ทดสอบ');await p.fill('#rph','0833333333');await p.fill('#rpw','secret1');await p.fill('#rpw2','secret1');
await p.check('#rpv');await p.check('#rgp');await p.click('[data-g=regsend]');ok('licence required',await has('กรุณาแนบรูปใบอนุญาต'));
await p.fill('#rn','ร้านใหม่ทดสอบ');await p.fill('#rph','0833333333');await p.fill('#rpw','secret1');await p.fill('#rpw2','secret2');
await p.setInputFiles('#rlic',{name:'l.png',mimeType:'image/png',buffer:PNG});await until(()=>document.querySelector('#glicprev img'));
await p.click('[data-g=regsend]');ok('password mismatch',await has('รหัสผ่านสองช่องไม่ตรงกัน'));
await p.fill('#rpw','secret1');await p.fill('#rpw2','secret1');await p.setInputFiles('#rimg',{name:'s.png',mimeType:'image/png',buffer:PNG});await until(()=>document.querySelector('#gprev img'));
await p.click('[data-g=regsend]');
ok('registration -> pending status',await has('ส่งคำขอลงทะเบียนแล้ว รอเจ้าหน้าที่อนุมัติ'));
const lic=stor.find(s=>s.path.startsWith('licenses/u'));const shopimg=stor.find(s=>s.path.startsWith('avatars/u'));
ok('licence uploaded to private bucket under uid',!!lic&&/^licenses\/u\d+\/license-.*\.jpg$/.test(lic.path)&&lic.len>100);
ok('shop image uploaded to avatars/uid',!!shopimg);
const reg=T.shop_registrations.find(r=>r.name==='ร้านใหม่ทดสอบ');
ok('registration row saved',reg&&reg.owner_user_id===users['0833333333'].id&&reg.phone==='0833333333'&&reg.category_id==='c1'&&reg.license_path===lic.path.replace('licenses/','')&&reg.image_path==='avatars/'+shopimg.path.replace('avatars/',''));
ok('signup sent phone alias + metadata',(c=>c&&c.body.email==='0833333333@gmail.com'&&c.body.data.phone==='0833333333')(calls.find(c=>c.path==='/auth/v1/signup')));
await p.click('[data-g=logout]');await p.waitForLoadState();
// ---- ผู้ใช้ที่รออนุมัติ
await until(()=>document.querySelector('#gph'));await p.fill('#gph','0822222222');await p.fill('#gpw','abc123');await p.click('[data-g=login]');
ok('pending owner sees status',await has('ร้านรอผล')&&await has('รอเจ้าหน้าที่อนุมัติ'));
T.shop_members.push({place_id:'sh1',user_id:'u2',role:'owner'});
await p.click('[data-g=retry]');ok('after approval opens app',await until(()=>!document.getElementById('main').hidden&&document.getElementById('hdr').textContent.includes('สบายดี')));
// ---- ใช้งานร้าน (สลับเป็นเจ้าของ u1 ผ่านรีโหลด)
await p.evaluate(()=>localStorage.clear());await p.reload();
await until(()=>document.querySelector('#gph'));await p.fill('#gph','0811111111');await p.fill('#gpw','abc123');await p.click('[data-g=login]');
ok('owner enters app',await until(()=>!document.getElementById('main').hidden&&document.getElementById('hdr').textContent.includes('สบายดี')));
ok('gate hidden',await p.$eval('#gate',e=>e.hidden));
await sub('svc');await sleep(300);
ok('services listed',(await txt('#main')).includes('นวดไทย')&&(await txt('#main')).includes('400 บาท'));
ok('REST carries owner bearer',await W(()=>calls.filter(c=>c.path.startsWith('/rest/v1/services')).slice(-1).every(c=>c.auth==='at-u1')));
// เพิ่มบริการ
await p.click('[data-a=new][data-t=svc]');await p.fill('#sn','นวดน้ำมัน');await p.fill('#sp','750');await p.selectOption('#sm','90');await p.fill('#sd','อโรมา');
await p.setInputFiles('#simg',{name:'a.png',mimeType:'image/png',buffer:PNG});await until(()=>document.querySelector('#imgprev img'));
await p.click('[data-a=save]');ok('service added in list',await has('นวดน้ำมัน'));
const nsv=T.services.find(s=>s.name==='นวดน้ำมัน');
ok('service row body',nsv&&nsv.place_id==='sh1'&&nsv.minutes===90&&nsv.price===750&&nsv.description==='อโรมา'&&/^place-images\/sh1\/svc-.*\.jpg$/.test(nsv.image_path));
ok('service image stored under place folder',stor.some(s=>/^place-images\/sh1\/svc-/.test(s.path)));
ok('service image shown with public URL',await p.$eval('#main',m=>!!m.querySelector('img[src*="/storage/v1/object/public/place-images/sh1/svc-"]')));
await p.click('[data-a=save]').catch(()=>{});
// validate
await p.click('[data-a=new][data-t=svc]');await p.click('[data-a=save]');ok('name validation',await has('กรุณากรอกชื่อบริการ'));await p.fill('#sn','x');await p.click('[data-a=save]');ok('price validation',await has('ราคาต้องมากกว่า 0'));await p.click('[data-a=cancel]');
// แก้ไข
await p.click('[data-a=edit][data-id=v1]');await p.fill('#sp','450');await p.click('[data-a=save]');await until(()=>document.body.innerText.includes('450 บาท'));
ok('edit service price',await W(()=>T.services.find(s=>s.id==='v1').price===450));
// สลับเปิด/ปิด
await p.click('[data-a=tog][data-t=svc][data-id=v1]');await until(()=>document.body.innerText.includes('ปิดชั่วคราว'));
ok('toggle service off',await W(()=>T.services.find(s=>s.id==='v1').active===false));
// ลบ (ต้องกดสองครั้ง)
await p.click('[data-a=del][data-t=svc][data-id=v1]');ok('delete asks twice',await has('กดอีกครั้งเพื่อลบ'));await p.click('[data-a=del][data-t=svc][data-id=v1]');
await until(()=>!document.body.innerText.includes('กดอีกครั้ง'));
ok('service deleted',!T.services.some(s=>s.id==='v1')&&!(await txt('#main')).includes('450 บาท'));
await p.click('[data-a=del][data-t=svc][data-id=vUsed]');await p.click('[data-a=del][data-t=svc][data-id=vUsed]');
ok('delete used service -> suspend message',await has('ให้ปิดหรือระงับแทนการลบ'));
ok('used service still listed',(await txt('#main')).includes('นวดเท้า'));
// ---- พนักงาน
await sub('staff');
ok('staff listed with linked',(await txt('#main')).includes('คุณนุ่น')&&(await txt('#main')).includes('เชื่อมบัญชีแล้ว'));
await p.click('[data-a=new][data-t=staff]');
ok('staff form has no password field',!(await p.$('#fpw')));
await p.fill('#fn','คุณใหม่');await p.fill('#fph','0899999999');await p.click('.ss >> nth=0');await p.click('[data-a=save]');
ok('duplicate phone message from server',await has('เบอร์มือถือนี้ถูกใช้กับพนักงานคนอื่นแล้ว'));
await p.fill('#fph','12');await p.click('[data-a=save]');ok('phone format validation',await has('เบอร์มือถือต้องเป็นตัวเลข 10 หลัก'));
await p.fill('#fph','0877777777');await p.click('[data-a=save]');ok('staff saved',await has('รอพนักงานสมัครสมาชิกด้วยเบอร์นี้'));
const ns=T.staff.find(s=>s.name==='คุณใหม่');ok('staff rpc body',ns&&ns.phone==='0877777777'&&T.staff_services.some(q=>q.staff_id===ns.id)&&calls.find(c=>c.path.endsWith('shop_save_staff')).body.p_place==='sh1');
await p.click(`[data-a=tog][data-t=staff][data-id=${ns.id}]`);await until(()=>document.body.innerText.includes('ระงับ'));ok('staff suspended',await W(()=>T.staff.find(s=>s.id===ns.id).active===false));
// ---- โปรโมชั่น
await sub('promo');ok('promo listed',(await txt('#main')).includes('ลดนวดเท้า')&&(await txt('#main')).includes('ลด 10%'));
await p.click('[data-a=new][data-t=promo]');await p.fill('#mt','ลด 50 บาท');await p.selectOption('#mty','baht');await p.fill('#mv','50');await p.fill('#ms1','2026-10-20');await p.fill('#me1','2026-10-10');
await p.click('[data-a=save]');ok('promo date validation',await has('วันสิ้นสุดต้องไม่ก่อนวันเริ่ม'));
await p.fill('#me1','2026-11-20');await p.click('[data-a=save]');await has('ลด 50 บาท');
const np=T.promotions.find(x=>x.title==='ลด 50 บาท');ok('promo saved as amount',np&&np.type==='amount'&&np.value===50&&np.applies_all===true);
ok('promo shows baht discount',(await txt('#main')).includes('ลด 50 บาท'));
await p.click(`[data-a=tog][data-t=promo][data-id=${np.id}]`);await until(()=>true);await p.waitForTimeout(150);ok('promo toggled off',await W(()=>T.promotions.find(x=>x.id===np.id).active===false));
await p.click(`[data-a=del][data-t=promo][data-id=${np.id}]`);await p.click(`[data-a=del][data-t=promo][data-id=${np.id}]`);await p.waitForTimeout(200);ok('promo deleted',!T.promotions.some(x=>x.id===np.id));
// ---- กระเป๋าเงิน
await p.click('[data-a=tab][data-id=wal]');await has('960');
ok('balance 960',(await txt('#main')).includes('960 บาท'));
await p.click('[data-a=wnew]');await p.fill('#wa','50');await p.click('[data-a=wsave]');ok('min topup',await has('ขั้นต่ำ 100'));
await p.fill('#wa','300');await p.click('[data-a=wsave]');ok('topup panel with QR box',await until(()=>document.querySelector('#qrbox')));
const tp=T.topup_requests[0];ok('topup request body',tp&&tp.amount===300&&tp.place_id==='sh1'&&tp.status==='pending');
ok('pending topup not in balance',(await txt('#main')).includes('960 บาท'));
ok('promptpay info shown',(await txt('#main')).includes('0812345678'));
await p.setInputFiles('#slipf',{name:'s.png',mimeType:'image/png',buffer:PNG});await until(()=>!document.getElementById('slipsend').disabled);
const dlP=p.waitForEvent('download',{timeout:5000}).catch(()=>null);await p.click('[data-a=qrsave]');const dl=await dlP;ok('QR saved as png download',!!dl&&/^QR-.*\.png$/.test(dl.suggestedFilename()));
await sleep(200);ok('QR save message',await has('บันทึกรูป'));
await p.click('#slipsend');await sleep(200);ok('confirm step shown (not sent yet)',await has('ยืนยันส่งสลิปให้เจ้าหน้าที่')&&!stor.some(s=>/^slips\//.test(s.path)));
await p.click('[data-a=slipno]');await sleep(200);ok('cancel confirm',!(await has('ยืนยันส่งสลิปให้เจ้าหน้าที่'))&&!stor.some(s=>/^slips\//.test(s.path)));
await p.click('#slipsend');await sleep(200);await p.click('#slipsend');ok('slip sent',await has('ส่งสลิปให้เจ้าหน้าที่แล้ว'));ok('staff-will-check message',await has('เจ้าหน้าที่จะตรวจสอบและอนุมัติ'));
ok('slip stored in slips bucket under place',stor.some(s=>new RegExp('^slips/sh1/'+tp.ref+'-').test(s.path))&&/^sh1\//.test(tp.slip_path));
ok('slip preview loaded via authenticated read',await until(()=>document.querySelector('#slipcur img')));
await p.click('[role=tab][data-a=wt][data-id=his]');ok('topup in history waiting',(await txt('#main')).includes('รอยืนยัน')&&(await txt('#main')).includes('แนบสลิปแล้ว'));
await p.click('[role=tab][data-a=wt][data-id=bal]');
await p.click('[data-a=tpcancel]');await has('ยกเลิกคำขอเติมเงินแล้ว');ok('topup cancelled',await W(()=>T.topup_requests[0].status==='cancelled'));
// admin confirms another topup -> server side adds wallet row; client sees after refresh
T.wallet_tx.push({id:'w9',place_id:'sh1',type:'topup',amount:500,note:'เติมเงินผ่านพร้อมเพย์ (อ้างอิง TPX)',ref:'TPX',status:'success',created_at:now()});
await sub('svc');await p.click('[data-a=tab][data-id=wal]');ok('refresh picks up admin-confirmed topup',await has('1,460 บาท'));
// ---- แจ้งเตือน
ok('unread badge shows 4',(await p.textContent('#tabs')).includes('4'));
await p.click('[data-a=tab][data-id=nt]');await p.click('[data-a=ntf][data-id=admin]');const okA=await has('ประกาศ: ปิดปรับปรุงระบบ');await p.click('[data-a=ntf][data-id=user]');ok('notifications listed w/ announcement',okA&&(await txt('#main')).includes('มีการจองใหม่'));
ok('other-audience announcement hidden',!(await txt('#main')).includes('เฉพาะผู้ใช้'));
await p.waitForTimeout(200);
ok('reads posted for db notifications only',(c=>c&&c.body.length===3&&c.body.every(x=>x.user_id==='u1'&&/^n\d$/.test(x.notification_id))&&c.q.includes('on_conflict')&&c.pref.includes('ignore-duplicates'))(calls.filter(c=>c.path.endsWith('notification_reads')&&c.m==='POST').pop()));
ok('badge cleared',!(await p.textContent('#tabs')).match(/\d/));
await p.click('[data-a=ntf][data-id=staff]');ok('filter staff',(await txt('#main')).includes('พนักงานเริ่มงาน')&&!(await txt('#main')).includes('มีการจองใหม่'));
// ---- ตั้งค่า
await sub('set');

const wait=ms=>p.waitForTimeout(ms);
ok('lookup button in pin box',!!(await p.$('[data-a=pkname]')));
ok('no auto lookup when form opens',NM.length===0);
await p.fill('#olat','7.8804');await p.fill('#olng','98.2923');await p.click('[data-a=pkname]');await wait(1500);
ok('manual button -> name shown',(await p.textContent('#pinname')).includes('ที่ตั้ง: โรงแรมทดสอบ ป่าตอง')&&NM.length===1);
await p.click('[data-a=pkmap]');await p.waitForSelector('#mpm[data-stub]');await wait(1500);
ok('picker starts at existing pin -> name (cached, no new request)',(await p.textContent('#mp_place')).includes('โรงแรมทดสอบ')&&NM.length===1);
await p.evaluate(()=>window.__lf.fire('click',{latlng:{lat:13.7563,lng:100.5018}}));await wait(1800);
ok('new pin name in picker',(await p.textContent('#mp_place')).includes('ถนนพระราม 4'));
await p.click('[data-mp=ok]');await wait(500);
ok('after confirm name shown in form (from cache)',(await p.textContent('#pinname')).includes('ที่ตั้ง: ใกล้ ถนนพระราม 4')&&NM.length===2);
nmFail=true;await p.fill('#olat','7.1');await p.fill('#olng','98.1');await p.click('[data-a=pkname]');await wait(2500);
ok('failure -> friendly message',(await p.textContent('#pinname')).includes('ไม่พบชื่อสถานที่'));
await p.fill('#olat','abc');await p.click('[data-a=pkname]');await wait(200);ok('invalid coords -> empty',(await p.textContent('#pinname'))==='');
const gaps=NM.slice(1).map((x,i)=>x.t-NM[i].t);ok('requests spaced >= 1s ('+gaps.join(',')+')',gaps.every(x=>x>=1000));
console.log('errors:',errs.length?errs:'none');await b.close();process.exit(0)
})().catch(e=>{console.log('TEST CRASH',e.message);process.exit(1)});
