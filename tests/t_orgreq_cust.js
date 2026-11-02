let CATCALLS=0;

const {chromium}=require('playwright');
const bkk=(n=0)=>{const d=new Date(Date.now()+7*3600000+n*86400000);return d.toISOString().slice(0,10)};
(async()=>{const b=await chromium.launch(require('./config').launch);
const ctx=await b.newContext({timezoneId:'Asia/Bangkok',locale:'th-TH'});const errs=[],calls=[];
let mode={cat:true,rpcMissing:false};const ORL=[],SUBS=[],CANC=[],ATT=[],UPL=[];let SUBFAIL='';let seq=100000;const BKS=[];const NOTES=[];
const UID='uuid-1';
const places=[
 {id:'sh1',type:'shop',name:'ร้านสบายดี สปา',area:'สุขุมวิท',lat:13.76,lng:100.51,open_days:[0,1,2,3,4,5,6],open_time:'10:00:00',close_time:'21:00:00',fixed_date:null,advance_days:14,cancel_hours:24,image_path:null,status:'approved',active:true},
 {id:'og1',type:'org',name:'สำนักงานพัฒนาสังคม',area:'พญาไท',lat:13.758,lng:100.509,open_days:[0,1,2,3,4,5,6],open_time:'09:00:00',close_time:'17:00:00',fixed_date:bkk(3),advance_days:14,cancel_hours:24,image_path:null,status:'approved',active:true},
 {id:'cp1',type:'company',name:'บริษัท ไทยออฟฟิศ',area:'ปทุมวัน',lat:13.7635,lng:100.5018,open_days:[1,2,3,4,5],open_time:'09:00:00',close_time:'18:00:00',fixed_date:null,advance_days:14,cancel_hours:24,image_path:null,status:'approved',active:true}];
const services=[
 {id:'ga',place_id:null,name:'นวดไทยแผนโบราณ',minutes:60,price:400,applies_all:true,active:true},
 {id:'sa',place_id:'sh1',name:'นวดไทย',minutes:60,price:400,applies_all:false,active:true},
 {id:'sb',place_id:'sh1',name:'นวดเท้า',minutes:60,price:350,applies_all:false,active:true}];
const staff=[{id:'st1',name:'คุณวิภา',place_id:'sh1',photo_path:null},{id:'st2',name:'คุณสมศรี',place_id:'sh1',photo_path:null},{id:'st3',name:'คุณนุ่น',place_id:null,photo_path:null},{id:'st4',name:'คุณมะลิ',place_id:null,photo_path:null}];
const ss=[['st1','sa'],['st1','sb'],['st2','sa'],['st3','ga'],['st4','ga']].map(x=>({staff_id:x[0],service_id:x[1]}));
const ps=[{place_id:'og1',staff_id:'st3',weekdays:[]},{place_id:'cp1',staff_id:'st4',weekdays:[1,2,3,4,5]}];
const promos=[{id:'pm1',place_id:'sh1',title:'ลดราคานวดเท้า',description:'',type:'percent',value:10,applies_all:false,start_date:bkk(-1),end_date:bkk(30),image_path:null,active:true}];
const pms=[{promotion_id:'pm1',service_id:'sb'}];
const nm=id=>(staff.find(s=>s.id===id)||{}).name;
const busyItems=()=>BKS.filter(x=>x.status==='confirmed').flatMap(x=>x.items.filter(i=>i.active));
const fmt=b=>({ref:b.ref,place_id:b.place_id,place_name:b.place_name,place_type:b.place_type,cancel_hours:24,phone:b.phone,customer_name:'สมชาย ใจดี',starts_at:new Date(b.s).toISOString(),ends_at:new Date(b.e).toISOString(),total:b.total,discount:b.discount,promo:b.promo,status:b.status,moved_from:b.moved_from,moved_to:b.moved_to,created_at:new Date().toISOString(),items:b.items.map(i=>({id:i.id,service_id:i.service_id,service_name:i.service_name,staff_id:i.staff_id,staff_name:nm(i.staff_id),minutes:i.minutes,price:i.price,starts_at:new Date(i.s).toISOString(),ends_at:new Date(i.e).toISOString(),active:i.active,job:i.job||'pending'}))});
await ctx.route('**/*supabase.co/**',async r=>{const q=r.request(),u=new URL(q.url()),m=q.method(),path=u.pathname,body=(()=>{try{return JSON.parse(q.postData()||'null')}catch(e){return null}})();
 calls.push({m,path,body,auth:q.headers()['authorization']||''});
 const J=(s,o)=>r.fulfill({status:s,contentType:'application/json',body:JSON.stringify(o)});const r2=()=>r.fulfill({status:204,body:''});
 const sess=()=>({access_token:'at',refresh_token:'rt',expires_in:3600,user:{id:UID,user_metadata:{first_name:'สมชาย',last_name:'ใจดี',phone:'0811111111'}}});
 if(path==='/rest/v1/rpc/org_request_info')return J(200,{rate:400,districts:['ปทุมวัน','พญาไท','บางรัก','ดุสิต'],lead_days:2,max_days:120});
 if(path==='/rest/v1/app_settings'&&m==='GET'&&u.search.includes('promptpay'))return J(200,[{promptpay_on:true,promptpay_type:'mobile',promptpay_id:'0812345678',promptpay_name:'สมาคมทดสอบ'}]);
 if(path==='/rest/v1/rpc/my_org_requests')return J(200,ORL);
 if(path==='/rest/v1/rpc/submit_org_request'){SUBS.push(body.p);if(SUBFAIL)return J(400,{code:'P0001',message:SUBFAIL});const p=body.p;ORL.unshift({id:'rq'+(ORL.length+1),ref:'ORG-TEST-000'+(ORL.length+1),org_name:p.name,district:p.district,address:p.address,lat:p.lat,lng:p.lng,contact_name:p.contact_name,contact_phone:p.contact_phone,service_date:p.date,start_time:p.start+':00',end_time:p.end+':00',lunch_start:p.lunch_start?p.lunch_start+':00':null,lunch_end:p.lunch_end?p.lunch_end+':00':null,hours:5,rate:400,status:'pending',accepted_count:0,amount:null,pay_due_at:null,slip_path:null,slip_at:null,note:null,created_at:new Date().toISOString(),invites:[]});return J(200,'rq'+ORL.length)}
 if(path==='/rest/v1/rpc/org_request_cancel'){CANC.push(body.p_id);const r=ORL.find(x=>x.id===body.p_id);if(r)r.status='cancelled';return r2()}
 if(path==='/rest/v1/rpc/org_request_attach_slip'){ATT.push(body);const r=ORL.find(x=>x.id===body.p_id);r.status='paid_review';r.slip_path=body.p_path;return r2(r)}
 if(path.startsWith('/storage/v1/object/licenses/')){UPL.push({m,path,auth:q.headers()['authorization']||''});return J(200,{Key:'ok'})}

 if(path==='/auth/v1/signup'||(path==='/auth/v1/token'&&u.search.includes('password')))return J(200,sess());
 if(path==='/auth/v1/token')return J(200,sess());
 if(path==='/rest/v1/profiles')return J(200,[{first_name:'สมชาย',last_name:'ใจดี',phone:'0811111111',avatar_path:null}]);
 if(!mode.cat&&path.startsWith('/rest/v1/places'))return r.abort();
 const T={places:places,services:services,service_places:[],staff_public:staff,staff_services:ss,place_staff:ps,staff_days_off:[],promotions:promos,promotion_services:pms,place_day_overrides:[],app_settings:[process.env.EMPTY?{shop_radius_km:10,org_radius_km:10,notify_user:true,notify_staff:true}:{shop_radius_km:10,org_radius_km:10,notify_user:true,notify_staff:true,association_name:'สมาคมทดสอบ',address:'เลขที่ 1 ถนนทดสอบ',phone:'02-123 4567',line_url:'https://line.me/R/ti/p/@test',hours_text:'จันทร์ – ศุกร์ 08:30 – 16:30 น.\nเสาร์ – อาทิตย์ ปิด',register_url:'https://shop.example.com/'}],announcements:[{title:'ประกาศทดสอบ',body:'สวัสดี',audiences:['ผู้ใช้งาน'],active:true}],notifications:NOTES};
 const t=path.replace('/rest/v1/','');
 if(m==='GET'&&T[t]!==undefined)return J(200,T[t]);
 if(mode.rpcMissing&&path.startsWith('/rest/v1/rpc/'))return J(404,{code:'PGRST202',message:'Could not find the function public.'+path.split('/').pop()+' in the schema cache'});
 if(path==='/rest/v1/rpc/public_catalog'){CATCALLS++;return J(200,{places,services,service_places:[],staff:staff,staff_services:ss,place_staff:ps,days_off:[],promos:promos,promo_services:pms,overrides:[],settings:{association_name:'สมาคมทดสอบ',address:'1 ถนนทดสอบ <b>x</b> กรุงเทพ',phone:'02-123-4567',email:'info@example.org',line_url:'https://line.me/R/ti/p/@test',hours_text:'จ-ศ 9:00-17:00',register_url:'https://shop.example.org/',shop_radius_km:10,org_radius_km:1,notify_user:true,notify_staff:true},ann:[]})}
 if(path==='/rest/v1/rpc/place_ratings')return J(200,[]);
 if(path==='/rest/v1/rpc/busy_slots'){const f=Date.parse(body.p_from),to=Date.parse(body.p_to);return J(200,busyItems().filter(i=>body.p_staff.includes(i.staff_id)&&i.s<to&&i.e>f).map(i=>({staff_id:i.staff_id,starts_at:new Date(i.s).toISOString(),ends_at:new Date(i.e).toISOString()})))}
 if(path==='/rest/v1/rpc/my_bookings')return J(200,BKS.slice().sort((a,b)=>b.s-a.s).map(fmt));
 if(path==='/rest/v1/rpc/cancel_booking'){const b=BKS.find(x=>x.ref===body.p_ref);if(Date.now()>b.s-24*3600000)return J(400,{code:'P0001',message:'ยกเลิกไม่ได้ เกินเวลาที่ยกเลิกได้'});b.status='cancelled';b.items.forEach(i=>i.active=false);return r.fulfill({status:204,body:''})}
 if(path==='/rest/v1/rpc/create_booking'){const pl=places.find(p=>p.id===body.p_place);const start=Date.parse(body.p_start);let old=null;
   if(body.p_moved_from){old=BKS.find(x=>x.ref===body.p_moved_from&&x.status==='confirmed');if(!old)return J(400,{code:'P0001',message:'ไม่พบการจองเดิมที่จะเลื่อน'})}
   const its=[];let tot=0,dis=0,promo=null;
   for(const it of body.p_items){const sv=services.find(s=>s.id===it.service_id);const s=start+it.offset_min*60000,e=s+sv.minutes*60000;
     const pool=busyItems().filter(i=>!(old&&old.items.includes(i)));
     if(pool.some(i=>i.staff_id===it.staff_id&&i.s<e&&i.e>s))return J(400,{code:'P0001',message:'คิวนี้เพิ่งเต็ม กรุณาเลือกเวลาหรือพนักงานใหม่'});
     let d=0;const pm=promos.find(p=>p.place_id===pl.id&&(pms.some(q=>q.promotion_id===p.id&&q.service_id===sv.id)));if(pm){d=Math.round(sv.price*pm.value)/100;promo=pm.title}
     tot+=sv.price-d;dis+=d;its.push({id:'it'+Math.random(),service_id:sv.id,service_name:sv.name,staff_id:it.staff_id,minutes:sv.minutes,price:sv.price-d,s,e,active:true})}
   if(old){old.status='rescheduled';old.items.forEach(i=>i.active=false)}
   const ref='MS'+(seq++);if(old)old.moved_to=ref;
   BKS.push({ref,place_id:pl.id,place_name:pl.name,place_type:pl.type,phone:body.p_phone,s:Math.min(...its.map(i=>i.s)),e:Math.max(...its.map(i=>i.e)),total:tot,discount:dis,promo,status:'confirmed',moved_from:body.p_moved_from,moved_to:null,items:its});
   NOTES.unshift({id:'n'+seq,title:'จองสำเร็จ',body:'เลขที่ '+ref,created_at:new Date().toISOString(),booking_id:'x'});
   return J(200,ref)}
 return J(404,{message:'nf '+path})});
await ctx.route('**/unpkg.com/**',r=>r.abort());
await ctx.route('**/nominatim.openstreetmap.org/**',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({display_name:'ถนนทดสอบ เขตปทุมวัน',address:{road:'ถนนทดสอบ',city_district:'ปทุมวัน'}})}));
await ctx.route('**/cdnjs.cloudflare.com/ajax/libs/qrcodejs/**',r=>r.fulfill({status:200,contentType:'application/javascript',body:"window.QRCode=function(el,o){el.setAttribute('data-qr',o.text);el.innerHTML='<canvas></canvas>'};window.QRCode.CorrectLevel={M:0};"}));
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>{errs.push('DIALOG '+d.message());d.dismiss()});
await p.goto(require('./config').page('customer-booking.html'));
const ok=(n,c)=>console.log((c?'PASS ':'FAIL ')+n);
const PNG=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==','base64');
await p.waitForSelector('[data-pl]',{timeout:5000});
// ---- ผู้เยี่ยมชมเห็นปุ่มขอบริการสำหรับหน่วยงาน -> ต้องล็อกอินก่อน
ok('guest home shows org invitation bar with button',await p.$eval('.regbar:has([data-orq=guest])',e=>e.textContent.includes('ให้หมอนวดไปดูแลคนในองค์กรของคุณถึงที่')&&e.textContent.includes('ขอบริการสำหรับหน่วยงาน')));
ok('org bar sits after register-shop bar',await p.evaluate(()=>{const a=[...document.querySelectorAll('.regbar')];return a.length<2||a[a.length-1].querySelector('[data-orq=guest]')!==null}));
await p.click('[data-orq=guest]');await p.waitForSelector('#rph,#lph',{timeout:3000});
ok('login/register required first',!!(await p.$('#rph,#lph'))&&(await p.textContent('#app')).includes('ส่งคำขอสำหรับหน่วยงาน'));
if(await p.$('[data-ag=login]'))await p.click('[data-ag=login]');
await p.waitForSelector('#lph');await p.fill('#lph','0811111111');await p.fill('#lpw','abc123');await p.click('button[type=submit]');
await p.waitForSelector('#orqf',{timeout:6000});
ok('after login goes straight to the org form',(await p.textContent('#app')).includes('ขอบริการสำหรับหน่วยงาน')&&!!(await p.$('#orqf')));
ok('form shows Bangkok-only + rate notice',await p.$$eval('.orqn',L=>L.some(e=>e.textContent.includes('กรุงเทพมหานคร')&&e.textContent.includes('400')&&e.textContent.includes('ไม่รวมช่วงพักเที่ยง'))&&L.some(e=>e.textContent.includes('ขั้นตอนง่าย ๆ 4 ข้อ')&&e.querySelectorAll('ol li').length===4)));
ok('districts from server only',JSON.stringify(await p.$$eval('#orq_dist option',o=>o.map(x=>x.value).filter(Boolean)))===JSON.stringify(['ปทุมวัน','พญาไท','บางรัก','ดุสิต']));
ok('only central therapists listed',JSON.stringify(await p.$$eval('[data-orqs]',o=>o.map(x=>x.dataset.orqs)))===JSON.stringify(['st3','st4']));
// ---- ตรวจความถูกต้อง
const err=async()=>await p.textContent('#orq_err');
await p.click('[data-orq=send]');ok('empty name rejected',(await err()).includes('ชื่อหน่วยงาน'));
await p.fill('#orq_name','บริษัท ทดสอบ จำกัด');await p.click('[data-orq=send]');ok('district required',(await err()).includes('เลือกเขต'));
await p.selectOption('#orq_dist','ปทุมวัน');await p.fill('#orq_addr','88 ถนนพระราม 1');await p.click('[data-orq=send]');ok('pin required',(await err()).includes('ปักหมุด'));
// ปักหมุดนอกกรุงเทพฯ
await p.click('[data-orq=pin]');await p.waitForSelector('#mpov');await p.fill('#mp_lat','14.5');await p.fill('#mp_lng','100.5');await p.click('[data-mp=ok]');await p.waitForTimeout(200);
ok('pin outside Bangkok rejected',(await err()).includes('นอกพื้นที่กรุงเทพมหานคร')&&(await p.textContent('#orq_pin')).includes('ยังไม่ได้ปักหมุด'));
await p.click('[data-orq=pin]');await p.waitForSelector('#mpov');await p.fill('#mp_lat','13.7466');await p.fill('#mp_lng','100.5347');await p.click('[data-mp=ok]');await p.waitForTimeout(200);
ok('pin in Bangkok accepted',(await p.textContent('#orq_pin')).includes('13.74660')&&(await err())==='');
await p.fill('#orq_cn','สมหมาย');await p.fill('#orq_cp','12345');await p.click('[data-orq=send]');ok('bad phone rejected',(await err()).includes('เบอร์'));
await p.fill('#orq_cp','0899999999');await p.click('[data-orq=send]');ok('date required',(await err()).includes('วันที่'));
await p.fill('#orq_date',bkk(0));await p.click('[data-orq=send]');ok('date too soon rejected',(await err()).includes('2 วันถัดไป'));
await p.fill('#orq_date',bkk(5));
await p.selectOption('#orq_s','15:00');await p.selectOption('#orq_e','09:00');await p.click('[data-orq=send]');ok('end before start rejected',(await err()).includes('หลังเวลาเริ่ม'));
await p.selectOption('#orq_s','09:00');await p.selectOption('#orq_e','15:00');
await p.click('[data-orq=send]');ok('therapist required',(await err()).includes('หมอนวด'));
// ประมาณราคา
await p.check('[data-orqs=st3]');
ok('estimate: 5 hrs (9-15 minus lunch) x400 = 2,000',await p.$eval('#orq_est',e=>e.textContent.includes('5 ชั่วโมง')&&e.textContent.includes('2,000')));
await p.check('[data-orqs=st4]');ok('estimate: 2 therapists = 4,000',await p.$eval('#orq_est',e=>e.textContent.includes('4,000')));
await p.selectOption('#orq_ls','');await p.selectOption('#orq_le','');
ok('estimate: no lunch -> 6 hrs',await p.$eval('#orq_est',e=>e.textContent.includes('6 ชั่วโมง')&&e.textContent.includes('2,400')));
await p.selectOption('#orq_ls','12:00');await p.selectOption('#orq_le','13:00');
await p.click('[data-orq=send]');ok('terms required',(await err()).includes('ยอมรับเงื่อนไข')&&SUBS.length===0);
await p.check('#orq_terms');await p.click('[data-orq=send]');await p.waitForSelector('.orqc',{timeout:4000});
ok('submit payload correct',SUBS.length===1&&SUBS[0].name==='บริษัท ทดสอบ จำกัด'&&SUBS[0].district==='ปทุมวัน'&&SUBS[0].lat===13.7466&&SUBS[0].start==='09:00'&&SUBS[0].end==='15:00'&&SUBS[0].lunch_start==='12:00'&&SUBS[0].lunch_end==='13:00'&&SUBS[0].staff.length===2&&SUBS[0].terms===true&&SUBS[0].rate===400&&SUBS[0].contact_phone==='0899999999');
ok('list shows pending request',await p.$eval('.orqc',e=>e.textContent.includes('รอสมาคมตรวจสอบ')&&e.textContent.includes('ORG-TEST-0001')));
ok('flash after submit',(await p.textContent('.flash')).includes('ส่งคำขอแล้ว'));
// ---- ยกเลิกคำขอ
await p.click('[data-orq=cancel]');ok('cancel asks to confirm',(await p.textContent('.orqc')).includes('ยืนยันยกเลิก'));
await p.click('[data-orq=cancelno]');ok('cancel can be dismissed',CANC.length===0);
// ---- สถานะ -> รอชำระเงิน
ORL[0].status='awaiting_payment';ORL[0].accepted_count=2;ORL[0].amount=4000;ORL[0].pay_due_at=new Date(Date.now()+40*3600000).toISOString();ORL[0].invites=[{id:'i1',staff_id:'st3',name:'คุณนุ่น',status:'accepted'},{id:'i2',staff_id:'st4',name:'คุณมะลิ',status:'accepted'}];
await p.click('[data-orq=back]');await p.waitForSelector('[data-pl],.list',{timeout:3000}).catch(()=>{});
await p.click('[data-tab=ac]');await p.waitForSelector('[data-orq=open]');ok('account card has invitation text + button inside',await p.$eval('.regbar:has([data-orq=open])',e=>e.textContent.includes('ให้หมอนวดไปดูแลคนในองค์กรของคุณถึงที่')&&e.textContent.includes('ออฟฟิศ โรงงาน')));await p.waitForFunction(()=>document.querySelector('[data-orq=open] .bdg'),null,{timeout:3000}).catch(()=>{});ok('account shows pay badge (list refreshed)',await p.$eval('[data-orq=open]',e=>!!e.querySelector('.bdg')&&e.textContent.includes('1')));
await p.click('[data-orq=open]');await p.waitForSelector('[data-orq=pay]');
ok('list shows amount + therapists accepted',await p.$eval('.orqc',e=>e.textContent.includes('4,000')&&e.textContent.includes('คุณนุ่น ตอบรับ')&&e.textContent.includes('คุณมะลิ ตอบรับ')&&e.textContent.includes('ชำระภายใน')));
await p.click('[data-orq=pay]');await p.waitForSelector('#orqqr[data-qr]',{timeout:4000});
{const q=await p.getAttribute('#orqqr','data-qr');
 ok('QR is PromptPay with fixed amount',q.startsWith('000201010212')&&q.includes('A000000677010111')&&q.includes('0066812345678')&&q.includes('54074000.00')&&q.includes('5802TH')&&/6304[0-9A-F]{4}$/.test(q));}
ok('pay page shows amount + account',await p.$eval('#app',e=>e.textContent.includes('4,000')&&e.textContent.includes('0812345678')&&e.textContent.includes('สมาคมทดสอบ')));
ok('send disabled without slip',await p.$eval('[data-orq=slipsend]',e=>e.disabled));
await p.setInputFiles('#orq_slip',{name:'slip.png',mimeType:'image/png',buffer:PNG});await p.waitForSelector('#orq_sprev img',{timeout:3000});
ok('slip preview + send enabled',await p.$eval('[data-orq=slipsend]',e=>!e.disabled));
await p.click('[data-orq=slipsend]');await p.waitForSelector('[data-orq=back]');await p.waitForFunction(()=>document.querySelector('.orqc')&&document.querySelector('.orqc').textContent.includes('รอสมาคมตรวจสลิป'),null,{timeout:4000});
ok('slip uploaded to own folder',UPL.length===1&&UPL[0].path.startsWith('/storage/v1/object/licenses/uuid-1/orgslip-')&&/Bearer at$/.test(UPL[0].auth));
ok('attach rpc sent with same path',ATT.length===1&&ATT[0].p_id==='rq1'&&UPL[0].path.endsWith(ATT[0].p_path));
ok('status now awaiting review',(await p.textContent('.orqc')).includes('ส่งสลิปแล้ว รอสมาคมตรวจสอบ'));
// ---- สมาคมปฏิเสธสลิป -> กลับมารอชำระเงินพร้อมหมายเหตุ
ORL[0].status='awaiting_payment';ORL[0].note='ไม่พบยอดโอน';await p.click('[data-orq=open]').catch(()=>{});
await p.click('[data-tab=ac]');await p.click('[data-orq=open]');await p.waitForSelector('[data-orq=pay]');
ok('rejected slip shows note',(await p.textContent('.orqc')).includes('ไม่พบยอดโอน'));
// ---- ยกเลิกจริง
await p.click('[data-orq=cancel]');await p.click('[data-orq=cancelok]');await p.waitForFunction(()=>document.querySelector('.orqc')&&document.querySelector('.orqc').textContent.includes('ยกเลิกแล้ว'),null,{timeout:4000});
ok('cancel rpc sent',CANC.length===1&&CANC[0]==='rq1');
// ---- ข้อผิดพลาดจากเซิร์ฟเวอร์แสดงให้ผู้ใช้เห็น
await p.click('[data-orq=new]');await p.waitForSelector('#orqf');
ok('draft cleared after submit -> new form blank',(await p.inputValue('#orq_name'))==='');
await p.fill('#orq_name','ห้างทดสอบ');await p.selectOption('#orq_dist','พญาไท');await p.fill('#orq_addr','1 ถนนพหลโยธิน');await p.click('[data-orq=pin]');await p.waitForSelector('#mpov');await p.fill('#mp_lat','13.78');await p.fill('#mp_lng','100.54');await p.click('[data-mp=ok]');
await p.fill('#orq_date',bkk(7));await p.check('[data-orqs=st3]');await p.check('#orq_terms');SUBFAIL='อัตราค่าบริการมีการเปลี่ยนแปลง กรุณาโหลดหน้าใหม่แล้วตรวจเงื่อนไขอีกครั้ง';
await p.click('[data-orq=send]');await p.waitForFunction(()=>(document.getElementById('orq_err')||{}).textContent,null,{timeout:3000});
ok('server error shown, form kept',(await err()).includes('อัตราค่าบริการมีการเปลี่ยนแปลง')&&(await p.inputValue('#orq_name'))==='ห้างทดสอบ');
console.log('errors:',errs.join('|')||'none');await b.close();process.exit(0)
})()

