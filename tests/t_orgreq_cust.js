let CATCALLS=0;

const {chromium}=require('playwright');
const bkk=(n=0)=>{const d=new Date(Date.now()+7*3600000+n*86400000);return d.toISOString().slice(0,10)};
(async()=>{const b=await chromium.launch(require('./config').launch);
const ctx=await b.newContext({timezoneId:'Asia/Bangkok',locale:'th-TH'});const errs=[],calls=[];
let mode={cat:true,rpcMissing:false};const RVS=[],RCGET=[],CMPR=[],CMPS=[],CMPL=[],CMPV=[],CMPSUB=[];let CMPON=false;const CMPMO=new Date(Date.now()+7*3600000).toISOString().slice(0,7);let RVFAIL='';const ORL=[],SUBS=[],CANC=[],ATT=[],UPL=[];let SUBFAIL='';let seq=100000;const BKS=[];const NOTES=[];
const UID='uuid-1';
const places=[
 {id:'sh1',type:'shop',name:'ร้านสบายดี สปา',area:'สุขุมวิท',lat:13.76,lng:100.51,open_days:[0,1,2,3,4,5,6],open_time:'10:00:00',close_time:'21:00:00',fixed_date:null,advance_days:14,cancel_hours:24,image_path:null,status:'approved',active:true},
 {id:'og1',type:'org',name:'สำนักงานพัฒนาสังคม',area:'พญาไท',lat:13.758,lng:100.509,open_days:[0,1,2,3,4,5,6],open_time:'09:00:00',close_time:'17:00:00',fixed_date:bkk(3),advance_days:14,cancel_hours:24,image_path:null,status:'approved',active:true},
 {id:'cp1',type:'company',name:'บริษัท ไทยออฟฟิศ',area:'ปทุมวัน',lat:13.7635,lng:100.5018,open_days:[1,2,3,4,5],open_time:'09:00:00',close_time:'18:00:00',fixed_date:null,advance_days:14,cancel_hours:24,image_path:null,status:'approved',active:true}];
const services=[
 {id:'ga',place_id:null,name:'นวดไทยแผนโบราณ',minutes:60,price:400,applies_all:true,active:true},
 {id:'sa',place_id:'sh1',name:'นวดไทย',minutes:60,price:400,applies_all:false,active:true},
 {id:'sb',place_id:'sh1',name:'นวดเท้า',minutes:60,price:350,applies_all:false,active:true}];
const FREECALLS=[];const UPD=[];const MORE=[];const REPCALLS=[];
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
 if(path==='/rest/v1/rpc/my_org_report'){REPCALLS.push(body.p_request);const t=bkk(3)+'T';return J(200,{rows:[{ref:'BK1',status:'completed',starts_at:t+'03:00:00Z',ends_at:t+'04:00:00Z',started_at:null,done_at:null,service:'นวดไทย',minutes:60,job:'done',active:true,staff:'คุณนุ่น',customer:'สมชาย'},{ref:'BK2',status:'confirmed',starts_at:t+'04:00:00Z',ends_at:t+'05:00:00Z',started_at:null,done_at:null,service:'นวดไทย',minutes:60,job:null,active:true,staff:'คุณนุ่น',customer:'มาลี'},{ref:'BK3',status:'cancelled',starts_at:t+'05:00:00Z',ends_at:t+'06:00:00Z',started_at:null,done_at:null,service:'นวดไทย',minutes:60,job:null,active:false,staff:'คุณนุ่น',customer:'ประยุทธ'}]})}
 if(path==='/rest/v1/rpc/org_link_info'){const q=ORL.find(x=>x.id===body.p_id);return J(200,q?{status:q.status,place_id:q.status==='confirmed'?'og1':null,org_name:q.org_name,service_date:q.service_date,start_time:q.start_time,end_time:q.end_time}:null)}
 if(path==='/rest/v1/rpc/org_request_invite_more'){MORE.push(body);const q=ORL.find(x=>x.id===body.p_id);q.status='invited';return J(200,body.p_staff.length)}
 if(path==='/rest/v1/rpc/org_request_update'){UPD.push(body);const q=ORL.find(x=>x.id===body.p_id);Object.assign(q,{org_name:body.p.name,contact_name:body.p.contact_name,service_id:body.p.service,staff_ids:body.p.staff});return J(200,q.id)}
 if(path==='/rest/v1/rpc/org_free_staff'){FREECALLS.push(body.p_date);return J(200,body.p_date===bkk(19)?['st4']:body.p_date===bkk(22)?[]:['st3','st4'])}
 if(path==='/rest/v1/rpc/org_request_info')return J(200,{rate:400,districts:['ปทุมวัน','พญาไท','บางรัก','ดุสิต'],lead_days:10,pay_before_days:3,max_days:120,services:[{id:'sv15',name:'นวดคอบ่าไหล่',minutes:15,rest_minutes:5},{id:'sv30',name:'นวดไทย',minutes:30,rest_minutes:0}]});
 if(path==='/rest/v1/app_settings'&&m==='GET'&&u.search.includes('promptpay'))return J(200,[{promptpay_on:true,promptpay_type:'mobile',promptpay_id:'0812345678',promptpay_name:'สมาคมทดสอบ'}]);
 if(path.startsWith('/storage/v1/object/authenticated/receipts/')){RCGET.push(path);return r.fulfill({status:200,contentType:'application/pdf',body:Buffer.from('%PDF-1.4 rc')})}
 if(path==='/rest/v1/rpc/my_company_places')return J(200,CMPON?[{id:'cmp1',name:'บริษัท ไทยออฟฟิศ'}]:[]);
 if(path==='/rest/v1/rpc/my_company_schedule'){CMPS.push(body);const d0=body.p_from,dd=n=>new Date(Date.parse(d0+'T00:00:00Z')+n*86400000).toISOString().slice(0,10);return J(200,{open:'09:00:00',close:'17:00:00',staff:[{name:'คุณนุ่น',days:[1,3]},{name:'คุณแพร',days:[3]}],days:[{day:dd(0),present:['คุณนุ่น'],leave:[]},{day:dd(1),present:['คุณแพร (แทน)'],leave:[{name:'คุณนุ่น',reason:'ไปหาหมอ',sub:'คุณแพร'}]},{day:dd(5),present:['คุณแพร'],leave:[{name:'คุณนุ่น',reason:'ธุระครอบครัว'}]},{day:dd(20),present:['คุณนุ่น','คุณแพร'],leave:[]},{day:dd(30),present:['คุณนุ่น'],leave:[]}]})}
 if(path==='/rest/v1/rpc/my_company_leaves'){CMPL.push(body);return J(200,[{day:body.p_month.slice(0,8)+'04',name:'คุณนุ่น',reason:'ไปหาหมอ ปวดหลัง',sub:'คุณแพร'}])}
 if(path==='/rest/v1/rpc/my_company_reviews')return J(200,CMPV.slice());
 if(path==='/rest/v1/rpc/company_review_submit'){CMPSUB.push(body);if(body.p_rating===1)return J(400,{code:'P0001',message:'เดือนนี้ให้คะแนนไปแล้ว'});CMPV.unshift({month:body.p_month,rating:body.p_rating,comment:body.p_comment,problem:body.p_problem});return J(204,null)}
 if(path==='/rest/v1/rpc/my_company_report'){CMPR.push(body);const mo=body.p_month.slice(0,7),tt=(d,h,m)=>mo+'-'+d+'T'+h+':'+m+':00+07:00';return J(200,{month:body.p_month,rows:mo===CMPMO?[
  {ref:'BK1',status:'completed',starts_at:new Date(tt('03','10','00')).toISOString(),ends_at:new Date(tt('03','10','30')).toISOString(),started_at:new Date(tt('03','10','02')).toISOString(),done_at:new Date(tt('03','10','31')).toISOString(),service:'นวดไทย',minutes:30,job:'done',active:true,staff:'คุณนุ่น',customer:'สมชาย'},
  {ref:'BK2',status:'completed',starts_at:new Date(tt('03','10','30')).toISOString(),ends_at:new Date(tt('03','11','30')).toISOString(),started_at:new Date(tt('03','10','32')).toISOString(),done_at:new Date(tt('03','11','31')).toISOString(),service:'นวดไทย',minutes:60,job:'done',active:true,staff:'คุณนุ่น',customer:'สมหญิง'},
  {ref:'BK3',status:'confirmed',starts_at:new Date(tt('05','13','00')).toISOString(),ends_at:new Date(tt('05','13','30')).toISOString(),started_at:null,done_at:null,service:'นวดเท้า',minutes:30,job:'pending',active:true,staff:'คุณวิภา',customer:'สมศักดิ์'},
  {ref:'BK4',status:'no_show',starts_at:new Date(tt('06','14','00')).toISOString(),ends_at:new Date(tt('06','14','30')).toISOString(),started_at:null,done_at:null,service:'นวดไทย',minutes:30,job:'pending',active:true,staff:'คุณวิภา',customer:'สมชาติ'}]:[]})}
 if(path==='/rest/v1/rpc/org_review_submit'){RVS.push(body);const q=ORL.find(x=>x.id===body.p_id);if(RVFAIL)return J(400,{code:'P0001',message:RVFAIL});q.review={rating:body.p_rating,comment:body.p_comment,problem:body.p_problem};return r2()}
 if(path==='/rest/v1/rpc/my_org_requests')return J(200,ORL);
 if(path==='/rest/v1/rpc/submit_org_request'){SUBS.push(body.p);if(SUBFAIL)return J(400,{code:'P0001',message:SUBFAIL});const p=body.p;ORL.unshift({id:'rq'+(ORL.length+1),ref:'ORG-TEST-000'+(ORL.length+1),org_name:p.name,district:p.district,address:p.address,lat:p.lat,lng:p.lng,contact_name:p.contact_name,contact_phone:p.contact_phone,service_date:p.date,start_time:p.start+':00',end_time:p.end+':00',service_label:p.service==='sv15'?'นวดคอบ่าไหล่ 15 นาที พัก 5 นาที':'นวดไทย 30 นาที',lunch_start:p.lunch_start?p.lunch_start+':00':null,lunch_end:p.lunch_end?p.lunch_end+':00':null,hours:5,rate:400,status:'pending',accepted_count:0,amount:null,pay_due_at:null,slip_path:null,slip_at:null,note:null,created_at:new Date().toISOString(),invites:[]});return J(200,'rq'+ORL.length)}
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
ok('org bar sits after register-shop bar',await p.evaluate(()=>{const a=[...document.querySelectorAll('.regbar')];return a.length<2||(a[a.length-2].querySelector('[data-orq=guest]')!==null&&a[a.length-1].querySelector('[data-orq=capguest]')!==null)}));
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
const pick=async ymd=>{await p.click('#orq_dbtn');await p.waitForSelector('#orqdlg');for(let i=0;i<8&&!(await p.$('[data-orqd="'+ymd+'"]'));i++)await p.click('[data-orqm="1"]');await p.click('[data-orqd="'+ymd+'"]');await p.waitForSelector('#orqdlg',{state:'detached'})};
const openCal=async()=>{await p.click('#orq_dbtn');await p.waitForSelector('#orqdlg')};const closeCal=async()=>{await p.click('[data-orqx]');await p.waitForSelector('#orqdlg',{state:'detached'})};
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
await openCal();ok('calendar: today is not shown at all',(await p.$('[data-orqd="'+bkk(0)+'"]'))===null);
ok('calendar: day 5 (inside the 10-day lead) is not shown',(await p.$('[data-orqd="'+bkk(5)+'"]'))===null&&(await p.$('[data-orqd="'+bkk(9)+'"]'))===null);
ok('lead/pay rule shown near date + min attr',(await p.textContent('#orqf')).includes('ล่วงหน้าอย่างน้อย 10 วัน')&&(await p.textContent('#orqf')).includes('ภายใน 3 วันก่อนวันให้บริการ')&&(await p.$('[data-orqd="'+bkk(10)+'"]'))!==null);await closeCal();
await pick(bkk(15));
await p.selectOption('#orq_s','15:00');await p.selectOption('#orq_e','09:00');await p.click('[data-orq=send]');ok('end before start rejected',(await err()).includes('หลังเวลาเริ่ม'));
await p.selectOption('#orq_s','09:00');await p.selectOption('#orq_e','15:00');
await p.click('[data-orq=send]');ok('service required first',(await err()).includes('รูปแบบการนวด'));
ok('service options shown',(await p.$$eval('[data-orqv]',o=>o.map(x=>x.parentElement.textContent.trim()))).join('|')==='นวดคอบ่าไหล่ 15 นาที พัก 5 นาที|นวดไทย 30 นาที');
await p.check('[data-orqv=sv15]');
await p.click('[data-orq=send]');ok('therapist required',(await err()).includes('หมอนวด'));
// ประมาณราคา
await p.check('[data-orqs=st3]');
ok('estimate shows rounds (5h*60/20=15)',await p.$eval('#orq_est',e=>e.textContent.includes('ประมาณ 15 รอบ')));
ok('estimate: 5 hrs (9-15 minus lunch) x400 = 2,000',await p.$eval('#orq_est',e=>e.textContent.includes('5 ชั่วโมง')&&e.textContent.includes('2,000')));
await p.check('[data-orqs=st4]');ok('estimate: 2 therapists = 4,000',await p.$eval('#orq_est',e=>e.textContent.includes('4,000')));
// กรองหมอนวดตามวันที่: วันที่ st3 ไม่ว่าง -> ซ่อนและเอาออกจากที่เลือก + ประกาศ
ok('date picked -> free list requested',FREECALLS.includes(bkk(15)));
await pick(bkk(19));await p.waitForFunction(()=>document.querySelectorAll('[data-orqs]').length===1,null,{timeout:4000});
ok('busy therapist hidden for that date',JSON.stringify(await p.$$eval('[data-orqs]',o=>o.map(x=>x.dataset.orqs)))===JSON.stringify(['st4']));
ok('still-free therapist keeps selection',await p.isChecked('[data-orqs=st4]'));
await p.waitForFunction(()=>/ไม่ว่างในวันนี้/.test((document.getElementById('sr')||{}).textContent||''),null,{timeout:3000}).catch(()=>{});
ok('removal announced in live region',(await p.textContent('#sr')).includes('ไม่ว่างในวันนี้')&&(await p.textContent('#sr')).includes('คุณนุ่น'));
ok('hint shows count',(await p.textContent('#orq_stf')).includes('ที่ว่างในวันที่เลือก 1 คน'));
await pick(bkk(22));await p.waitForFunction(()=>document.querySelectorAll('[data-orqs]').length===0,null,{timeout:4000});
ok('nobody free message',(await p.textContent('#orq_stf')).includes('ไม่มีหมอนวดที่ว่างในวันที่เลือก'));
await pick(bkk(15));await p.waitForFunction(()=>document.querySelectorAll('[data-orqs]').length===2,null,{timeout:4000});
await p.check('[data-orqs=st3]');await p.check('[data-orqs=st4]');
await p.selectOption('#orq_ls','');await p.selectOption('#orq_le','');
ok('estimate: no lunch -> 6 hrs',await p.$eval('#orq_est',e=>e.textContent.includes('6 ชั่วโมง')&&e.textContent.includes('2,400')));
await p.selectOption('#orq_ls','12:00');await p.selectOption('#orq_le','13:00');
await p.click('[data-orq=send]');ok('terms required',(await err()).includes('ยอมรับเงื่อนไข')&&SUBS.length===0);
await p.evaluate(()=>Object.defineProperty(navigator,'userAgent',{get:()=>'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1',configurable:true}));
await p.check('#orq_terms');await p.click('[data-orq=send]');await p.waitForSelector('.orqc',{timeout:4000});
ok('submit payload correct',SUBS.length===1&&SUBS[0].name==='บริษัท ทดสอบ จำกัด'&&SUBS[0].district==='ปทุมวัน'&&SUBS[0].lat===13.7466&&SUBS[0].start==='09:00'&&SUBS[0].end==='15:00'&&SUBS[0].lunch_start==='12:00'&&SUBS[0].lunch_end==='13:00'&&SUBS[0].staff.length===2&&SUBS[0].service==='sv15'&&SUBS[0].terms===true&&SUBS[0].rate===400&&SUBS[0].contact_phone==='0899999999');
ok('list shows pending request',await p.$eval('.orqc',e=>e.textContent.includes('รอสมาคมตรวจสอบ')&&e.textContent.includes('ORG-TEST-0001')));
ok('SR announces org request sent',await p.waitForFunction(t=>document.getElementById('sr').textContent.includes(t),'ส่งคำขอแล้ว',{timeout:4000}).then(()=>true,()=>false));
ok('flash after submit',(await p.textContent('.flash')).includes('ส่งคำขอแล้ว'));
ok('install tip shown after submit (not installed)',await p.$eval('#orq_instip',e=>e.textContent.includes('ก่อนวันให้บริการ 3 วัน')&&!!e.querySelector('[data-insp=open]')));
await p.evaluate(()=>{delete navigator.userAgent});

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
ok('SR announces slip sent',await p.waitForFunction(t=>document.getElementById('sr').textContent.includes(t),'ส่งสลิปแล้ว',{timeout:4000}).then(()=>true,()=>false));
ok('status now awaiting review',(await p.textContent('.orqc')).includes('ส่งสลิปแล้ว รอสมาคมตรวจสอบ'));
// ---- สมาคมปฏิเสธสลิป -> กลับมารอชำระเงินพร้อมหมายเหตุ
ORL[0].status='awaiting_payment';ORL[0].note='ไม่พบยอดโอน';await p.click('[data-orq=open]').catch(()=>{});
await p.click('[data-tab=ac]');await p.click('[data-orq=open]');await p.waitForSelector('[data-orq=pay]');
ok('rejected slip shows note',(await p.textContent('.orqc')).includes('ไม่พบยอดโอน'));
// ---- ยกเลิกจริง
await p.click('[data-orq=cancel]');await p.click('[data-orq=cancelok]');await p.waitForFunction(()=>document.querySelector('.orqc')&&document.querySelector('.orqc').textContent.includes('ยกเลิกแล้ว'),null,{timeout:4000});
ok('SR announces org request cancelled',await p.waitForFunction(t=>document.getElementById('sr').textContent.includes(t),'ยกเลิกคำขอแล้ว',{timeout:4000}).then(()=>true,()=>false));
ok('cancel rpc sent',CANC.length===1&&CANC[0]==='rq1');
// ---- งานที่ยืนยันแล้ว: ลิงก์จองสำหรับพนักงานองค์กร
ORL[0].status='confirmed';ORL[0].place_id='og1';
await p.click('[data-orq=back]');await p.click('[data-tab=ac]');await p.click('[data-orq=open]');await p.waitForSelector('[data-orq=lcopy]',{timeout:4000});
ok('confirmed card shows link/QR buttons',await p.$eval('.orqc',e=>!!e.querySelector('[data-orq=lcopy]')&&!!e.querySelector('[data-orq=lqr]')&&e.textContent.includes('พนักงานของหน่วยงานจองคิวเอง')));
await p.evaluate(()=>{window.__cp=[];Object.defineProperty(navigator,'clipboard',{value:{writeText:t=>{window.__cp.push(t);return Promise.resolve()}},configurable:true})});
await p.click('[data-orq=lcopy]');await p.waitForFunction(()=>window.__cp.length===1,null,{timeout:3000});
ok('copy puts the place link on clipboard',(await p.evaluate(()=>window.__cp[0])).endsWith('?org=og1'));
ok('SR announces link copied',await p.waitForFunction(t=>document.getElementById('sr').textContent.includes(t),'คัดลอกลิงก์แล้ว',{timeout:4000}).then(()=>true,()=>false));
await p.click('[data-orq=lqr]');await p.waitForSelector('#orqlqr[data-qr]',{timeout:4000});
ok('QR encodes the same link + shown link text',(await p.getAttribute('#orqlqr','data-qr')).endsWith('?org=og1')&&(await p.textContent('.orqc .insurl')).endsWith('?org=og1')&&(await p.getAttribute('[data-orq=lqr]','aria-expanded'))==='true');
await p.dispatchEvent('[data-orq=lqr]','click');ok('QR can be hidden',!(await p.$('#orqlqr'))&&(await p.getAttribute('[data-orq=lqr]','aria-expanded'))==='false');
// ---- ข้อผิดพลาดจากเซิร์ฟเวอร์แสดงให้ผู้ใช้เห็น
await p.click('[data-orq=new]');await p.waitForSelector('#orqf');
ok('draft cleared after submit -> new form blank',(await p.inputValue('#orq_name'))==='');
await p.fill('#orq_name','ห้างทดสอบ');await p.selectOption('#orq_dist','พญาไท');await p.fill('#orq_addr','1 ถนนพหลโยธิน');await p.click('[data-orq=pin]');await p.waitForSelector('#mpov');await p.fill('#mp_lat','13.78');await p.fill('#mp_lng','100.54');await p.click('[data-mp=ok]');
await pick(bkk(17));await p.check('[data-orqv=sv30]');await p.check('[data-orqs=st3]');await p.check('#orq_terms');SUBFAIL='อัตราค่าบริการมีการเปลี่ยนแปลง กรุณาโหลดหน้าใหม่แล้วตรวจเงื่อนไขอีกครั้ง';
await p.click('[data-orq=send]');await p.waitForFunction(()=>(document.getElementById('orq_err')||{}).textContent,null,{timeout:3000});
ok('server error shown, form kept',(await err()).includes('อัตราค่าบริการมีการเปลี่ยนแปลง')&&(await p.inputValue('#orq_name'))==='ห้างทดสอบ');
// ---- แท็บแบ่งคำขอ / ส่งซ้ำ / ติดต่อสมาคม / ใบสรุป PDF
await p.click('[data-orq=back]');
ORL.push({id:'rq9',ref:'ORG-TEST-0009',org_name:'บริษัท รอตรวจ',district:'ดุสิต',address:'9 ถนนทดสอบ',lat:13.77,lng:100.52,contact_name:'คุณทดสอบ',contact_phone:'0811112222',service_date:bkk(30),start_time:'09:00:00',end_time:'12:00:00',lunch_start:null,lunch_end:null,hours:3,rate:400,status:'pending',accepted_count:0,amount:null,pay_due_at:null,slip_path:null,slip_at:null,note:null,service_label:'นวดไทย 30 นาที',created_at:new Date().toISOString(),invites:[]});
await p.click('[data-tab=ac]');await p.click('[data-orq=open]');await p.waitForSelector('.orqtabs',{timeout:4000});
ok('tab counts shown',JSON.stringify(await p.$$eval('.orqtabs button',o=>o.map(x=>x.textContent)))===JSON.stringify(['กำลังดำเนินการ (1)','ยืนยันแล้ว (1)','ยกเลิกและหมดอายุ (0)','รายงาน']));
ok('default tab = in progress, shows only pending card',(await p.getAttribute('#orqtab_act','aria-pressed'))==='true'&&await p.$$eval('.orqc',o=>o.length===1&&o[0].textContent.includes('บริษัท รอตรวจ')));
await p.click('.orqc [data-orq=lcopy]');
ok('pending card: share link available before payment (?orq=)',await p.waitForFunction(()=>(window.__cp||[]).some(x=>x.endsWith('?orq=rq9')),null,{timeout:4000}).then(()=>true,()=>false));
await p.click('#orqtab_done');ok('done tab shows confirmed only',(await p.getAttribute('#orqtab_done','aria-pressed'))==='true'&&await p.$$eval('.orqc',o=>o.length===1&&o[0].textContent.includes('ORG-TEST-0001')));
ok('SR announces tab change',await p.waitForFunction(t=>document.getElementById('sr').textContent.includes(t),'ยืนยันแล้ว 1 รายการ',{timeout:4000}).then(()=>true,()=>false));
await p.click('#orqtab_closed');ok('empty tab message',(await p.textContent('#app')).includes('ไม่มีคำขอในหมวดนี้'));
await p.click('#orqtab_done');
ok('contact buttons (tel + LINE) on card',await p.$eval('.orqc',e=>!!e.querySelector('a[href^="tel:"]')&&!!e.querySelector('a[href^="https://line.me"]')));
{const dl=p.waitForEvent('download',{timeout:15000});await p.click('[data-orq=sumpdf]');const d=await dl;const fp=await d.path();const buf=require('fs').readFileSync(fp);
 if(process.env.PDFOUT)require('fs').copyFileSync(fp,process.env.PDFOUT);
 ok('summary PDF downloads (ASCII name, valid PDF)',d.suggestedFilename()==='summary-ORG-TEST-0001.pdf'&&buf.slice(0,5).toString()==='%PDF-'&&buf.length>5000);}
{await p.click('[data-orq=reppage]');await p.waitForSelector('.orqsum',{timeout:5000});
 ok('report tab opened from card, rpc called with request id',REPCALLS[0]==='rq1'&&(await p.getAttribute('#orqtab_rep','aria-pressed'))==='true');
 const sm=await p.$$eval('.orqsum li',o=>o.map(x=>x.textContent));
 ok('report summary counts',sm[0].startsWith('2')&&sm[1].startsWith('2')&&sm[2].startsWith('1')&&sm[3].startsWith('60')&&sm[5].startsWith('1'));
 const tx=await p.textContent('#app');
 ok('report shows first names + per-therapist, no PDF-less state',tx.includes('มาลี')&&tx.includes('แยกตามหมอนวด')&&tx.includes('เสร็จสิ้น')&&tx.includes('ยกเลิก'));
 ok('report SR announcement',await p.waitForFunction(t=>document.getElementById('sr').textContent.includes(t),'โหลดรายงานแล้ว',{timeout:4000}).then(()=>true,()=>false));
 const dl=p.waitForEvent('download',{timeout:15000});await p.click('[data-orq=reppdf]');const d=await dl;const buf=require('fs').readFileSync(await d.path());
 ok('report PDF downloads',d.suggestedFilename()==='report-ORG-TEST-0001.pdf'&&buf.slice(0,5).toString()==='%PDF-'&&buf.length>5000);
 await p.click('#orqtab_done');}
{ORL.find(x=>x.id==='rq9').status='invited';await p.evaluate(()=>orqLoad(1));
 ok('status change alerts requester (SR + flash)',await p.waitForFunction(t=>document.getElementById('sr').textContent.includes(t),'สมาคมอนุมัติคำขอแล้ว',{timeout:4000}).then(()=>true,()=>false)&&(await p.textContent('#app')).includes('สมาคมอนุมัติคำขอแล้ว'));
 ok('status change plays sound + toast',await p.evaluate(()=>!!document.querySelector('[role=status]')&&document.body.textContent.includes('ความคืบหน้าคำขอหน่วยงาน')));
 ORL.find(x=>x.id==='rq9').status='pending';}
await p.click('[data-orq=again]');await p.waitForSelector('#orqf',{timeout:4000});
ok('again: form prefilled, date + service left empty',(await p.inputValue('#orq_name'))==='บริษัท ทดสอบ จำกัด'&&(await p.inputValue('#orq_dist'))==='ปทุมวัน'&&(await p.inputValue('#orq_date'))===''&&(await p.$('[data-orqv]:checked'))===null);
ok('again: SR announces',await p.waitForFunction(t=>document.getElementById('sr').textContent.includes(t),'เปิดแบบฟอร์มด้วยข้อมูลเดิม',{timeout:4000}).then(()=>true,()=>false));
// ---- เลือกหมอนวดเพิ่มเมื่อได้ไม่ครบ
await p.click('[data-orq=back]').catch(()=>{});
ORL.push({id:'rq10',ref:'ORG-TEST-0010',org_name:'บริษัท ขาดหมอ',district:'ดุสิต',address:'10 ถนนทดสอบ',lat:13.77,lng:100.52,contact_name:'คุณทดสอบ',contact_phone:'0811112222',service_date:bkk(19),start_time:'09:00:00',end_time:'12:00:00',lunch_start:null,lunch_end:null,hours:3,rate:400,status:'awaiting_payment',accepted_count:1,amount:1200,pay_due_at:new Date(Date.now()+40*3600000).toISOString(),slip_path:null,note:null,service_label:null,place_id:null,staff_ids:['st3','st4'],invites:[{id:'i9',staff_id:'st3',name:'คุณนุ่น',status:'accepted'},{id:'i10',staff_id:'st5',name:'คุณอื่น',status:'declined'}]});
await p.evaluate(()=>orqLoad());await p.click('#orqtab_act');
const mb=await p.$('[data-orq=more][data-id=rq10]');
ok('short-staffed request shows add-more button + summary',!!mb&&(await p.textContent('#app')).includes('มีหมอนวดรับงาน 1 จาก 2 คน'));
ok('no add-more button when full',!(await p.$('[data-orq=more][data-id=rq1]')));
await p.click('[data-orq=more][data-id=rq10]');await p.waitForSelector('[data-orqm]',{timeout:4000});
ok('free list excludes already invited, shows st4 only',JSON.stringify(await p.$$eval('[data-orqm]',o=>o.map(x=>x.dataset.orqm)))==='["st4"]');
await p.check('[data-orqm=st4]');
ok('send button reflects selection',(await p.textContent('[data-orq=moresend]')).includes('1 คน'));
await p.click('[data-orq=moresend]');
ok('invite-more RPC called with selection',await p.waitForFunction(()=>true).then(()=>MORE.length===1&&MORE[0].p_id==='rq10'&&MORE[0].p_staff[0]==='st4'));
ok('after sending: status invited + flash + SR',await p.waitForFunction(t=>document.getElementById('sr').textContent.includes(t),'ส่งคำเชิญหมอนวดเพิ่ม 1 คน',{timeout:4000}).then(()=>true,()=>false)&&!(await p.$('[data-orq=more]')));
// ---- แก้ไขคำขอที่ยังรออนุมัติ
{const q=ORL.find(x=>x.id==='rq9');q.service_id='sv30';q.staff_ids=['st3'];}
await p.evaluate(()=>orqLoad());await p.click('#orqtab_act');
ok('edit button only on pending',!!(await p.$('[data-orq=edit][data-id=rq9]'))&&!(await p.$('[data-orq=edit][data-id=rq1]')));
await p.click('[data-orq=edit][data-id=rq9]');await p.waitForSelector('#orqf',{timeout:4000});
ok('edit form prefilled incl. date, service, staff',(await p.inputValue('#orq_name'))==='บริษัท รอตรวจ'&&(await p.inputValue('#orq_date'))===bkk(30)&&await p.isChecked('[data-orqv=sv30]')&&(await p.textContent('h1')).includes('แก้ไขคำขอ')&&(await p.textContent('[data-orq=send]')).includes('บันทึกการแก้ไข'));
await p.fill('#orq_name','บริษัท รอตรวจ (แก้ไข)');await p.check('#orq_terms');
await p.waitForFunction(()=>!!document.querySelector('[data-orqs=st3]'),null,{timeout:4000});
await p.click('[data-orq=send]');await p.waitForSelector('.orqc',{timeout:4000});
ok('update rpc called with id + new data',UPD.length===1&&UPD[0].p_id==='rq9'&&UPD[0].p.name==='บริษัท รอตรวจ (แก้ไข)'&&UPD[0].p.service==='sv30'&&UPD[0].p.staff[0]==='st3');
ok('edited card shown + SR',(await p.textContent('#app')).includes('บริษัท รอตรวจ (แก้ไข)')&&await p.waitForFunction(t=>document.getElementById('sr').textContent.includes(t),'บันทึกการแก้ไขคำขอแล้ว',{timeout:4000}).then(()=>true,()=>false));
await p.click('[data-orq=new]').catch(()=>{});await p.waitForSelector('#orqf',{timeout:4000});
ok('new request after edit starts empty',(await p.inputValue('#orq_name'))===''&&(await p.textContent('h1')).includes('ขอบริการสำหรับหน่วยงาน'));
await p.click('[data-orq=back]');
// ---- เปิดลิงก์จองของงาน (?org=) ต้องไปหน้าจองของงานนั้นเลย
await p.goto(require('./config').page('customer-booking.html')+'?org=og1');await p.waitForTimeout(1500);
ok('deep link opens the org place booking',await p.$eval('#app',e=>e.textContent.includes('สำนักงานพัฒนาสังคม')&&!e.querySelector('[data-pl]')));
ok('link consumed (stored id cleared)',!(await p.evaluate(()=>sessionStorage.getItem('orgLink'))));
await p.goto(require('./config').page('customer-booking.html')+'?org=00000000-0000-0000-0000-000000000000');await p.waitForTimeout(1500);
ok('bad link announces unavailable + shows home',(await p.textContent('#sr')).includes('ลิงก์จองนี้ไม่พร้อมใช้งาน')&&!!(await p.$('[data-pl]')));
await p.goto(require('./config').page('customer-booking.html')+'?orq=rq9');await p.waitForSelector('#orqlm',{timeout:6000});
ok('pre-payment link shows waiting message, not booking',(await p.textContent('#orqlm')).includes('ยังไม่เปิดรับจอง')&&!!(await p.$('[data-pl]')));
await p.goto(require('./config').page('customer-booking.html')+'?orq=rq1');await p.waitForTimeout(2000);
ok('confirmed request link opens booking page',await p.$eval('#app',e=>e.textContent.includes('สำนักงานพัฒนาสังคม')&&!e.querySelector('[data-pl]')));
await p.goto(require('./config').page('customer-booking.html')+'?orq=nope');await p.waitForSelector('#orqlm',{timeout:6000});
ok('unknown request link says not found',(await p.textContent('#orqlm')).includes('ไม่พบงาน'));
BKS.push({ref:'BK-OG1-1',place_id:'og1',place_name:'สำนักงานพัฒนาสังคม',place_type:'org',phone:'0811111111',s:Date.now()+3*86400000,e:Date.now()+3*86400000+3600000,total:400,discount:0,promo:null,status:'confirmed',moved_from:null,moved_to:null,items:[]});
await p.goto(require('./config').page('customer-booking.html')+'?org=og1');await p.waitForSelector('#orqlm',{timeout:6000});
ok('one booking per person: second attempt blocked with message',(await p.textContent('#orqlm')).includes('จองได้คนละ 1 คิว')&&!!(await p.$('[data-pl]')));
// ---- ให้คะแนนบริการหลังงานเสร็จ
ORL.push({id:'rq11',ref:'ORG-TEST-0011',org_name:'บริษัท งานผ่านแล้ว',district:'ดุสิต',service_date:bkk(-1),address:'11 ถนนทดสอบ',lat:13.77,lng:100.52,contact_name:'คุณทดสอบ',contact_phone:'0811112222',start_time:'09:00:00',end_time:'12:00:00',lunch_start:null,lunch_end:null,hours:3,rate:400,status:'confirmed',accepted_count:1,amount:1200,pay_due_at:null,slip_path:null,note:null,service_label:null,place_id:'og1',staff_ids:['st3'],invites:[{id:'i11',staff_id:'st3',name:'คุณนุ่น',status:'accepted'}]});
ORL.push({id:'rq12',ref:'ORG-TEST-0012',org_name:'บริษัท งานอนาคต',district:'ดุสิต',service_date:bkk(5),address:'11 ถนนทดสอบ',lat:13.77,lng:100.52,contact_name:'คุณทดสอบ',contact_phone:'0811112222',start_time:'09:00:00',end_time:'12:00:00',lunch_start:null,lunch_end:null,hours:3,rate:400,status:'confirmed',accepted_count:1,amount:1200,pay_due_at:null,slip_path:null,note:null,service_label:null,place_id:'og1',staff_ids:['st3'],invites:[{id:'i11',staff_id:'st3',name:'คุณนุ่น',status:'accepted'}]});
await p.goto(require('./config').page('customer-booking.html'));await p.click('[data-tab=ac]');await p.click('[data-orq=open]');await p.waitForSelector('.orqtabs',{timeout:4000});await p.click('#orqtab_done');
{const t=await p.evaluate(()=>{const g=(i)=>document.querySelector('[data-orq=rev][data-id='+i+']');return [!!g('rq11'),!!g('rq12')]});
ok('rating button only on past confirmed job',t[0]===true&&t[1]===false);}
await p.click('[data-orq=rev][data-id=rq11]');await p.waitForSelector('input[name=orq_rv]',{timeout:4000});
ok('review page opens with 5 radio options',(await p.$$('input[name=orq_rv]')).length===5&&(await p.evaluate(()=>document.activeElement.id))==='orqt');
await p.click('[data-orq=revsend]');await p.waitForTimeout(300);ok('must pick rating first (no rpc, error read)',RVS.length===0&&(await p.textContent('#orq_rverr')).includes('กรุณาเลือกคะแนน'));
await p.check('input[name=orq_rv][value="2"]');await p.fill('#orq_rvc','มาสาย');await p.check('#orq_rvp');
RVFAIL='ท่านให้คะแนนงานนี้แล้ว';await p.click('[data-orq=revsend]');await p.waitForTimeout(500);
ok('server error shown, form kept',(await p.textContent('#orq_rverr')).includes('ให้คะแนนงานนี้แล้ว')&&(await p.inputValue('#orq_rvc'))==='มาสาย'&&(await p.isChecked('input[name=orq_rv][value="2"]')));
RVFAIL='';await p.click('[data-orq=revsend]');await p.waitForTimeout(800);
ok('review rpc payload',RVS.length===2&&RVS[1].p_id==='rq11'&&RVS[1].p_rating===2&&RVS[1].p_comment==='มาสาย'&&RVS[1].p_problem===true);
{const t=await p.textContent('#app');ok('back to list with thanks + shown rating, button gone',t.includes('ขอบคุณที่ให้คะแนน')&&t.includes('ท่านให้คะแนนบริการแล้ว 2/5 (แจ้งปัญหา)')&&!(await p.$('[data-orq=rev][data-id=rq11]')));}
// ---- ดาวน์โหลดใบเสร็จที่สมาคมแนบ
ok('no receipt button before admin attaches',!(await p.$('[data-orq=rcp]')));
ORL.find(x=>x.id==='rq11').receipt_path='uuid-1/rq11-abc.pdf';
await p.evaluate(()=>orqLoad());await p.waitForSelector('[data-orq=rcp][data-id=rq11]',{timeout:4000});
ok('receipt button only on the request that has one',(await p.$$('[data-orq=rcp]')).length===1);
{const [dl]=await Promise.all([p.waitForEvent('download',{timeout:5000}),p.click('[data-orq=rcp][data-id=rq11]')]);
ok('receipt downloaded as pdf named by ref',dl.suggestedFilename()==='receipt-ORG-TEST-0011.pdf'&&RCGET.length===1&&RCGET[0].endsWith('/receipts/uuid-1/rq11-abc.pdf'));}
// ---- รายงานบริษัทรายเดือน
await p.goto(require('./config').page('customer-booking.html'));await p.click('[data-tab=ac]');await p.waitForTimeout(500);
ok('no company report card for ordinary user',!(await p.$('[data-orq=cmpopen]')));
CMPON=true;await p.goto(require('./config').page('customer-booking.html'));await p.click('[data-tab=ac]');await p.waitForSelector('[data-orq=cmpopen]',{timeout:5000});
ok('company contact sees report card',(await p.textContent('.regbar:has([data-orq=cmpopen])')).includes('งานนวดประจำบริษัท')&&(await p.textContent('[data-orq=cmpopen]')).trim()==='เปิดหน้าบริษัท');
await p.click('[data-orq=cmpopen]');await p.waitForSelector('#cmptab_ov',{timeout:5000});await p.waitForSelector('.orqsum',{timeout:5000});
{const t=await p.textContent('#app');
ok('5 tabs shown, overview default',(await p.$$('[data-orq=cmptab]')).length===5&&(await p.getAttribute('#cmptab_ov','aria-pressed'))==='true'&&t.includes('ภาพรวม')&&t.includes('ตารางงาน')&&t.includes('การลา')&&t.includes('รายงานรายเดือน')&&t.includes('แจ้งปัญหาและคะแนน'));
ok('overview: today/tomorrow, tomorrow no therapist warning, leave within 14 days with reason',t.includes('วันนี้')&&t.includes('พรุ่งนี้')&&t.includes('ไปหาหมอ')&&t.includes('ธุระครอบครัว')&&!t.includes('หมอนวดประจำลา) สมาคมจะแจ้งหากมีผู้มาแทน'+'x'));
ok('overview: substitute named, uncovered flagged',t.includes('มี คุณแพร มาแทน')&&t.includes('ยังไม่มีคนแทน'));
ok('overview month summary requested for this month',CMPR.length>=1&&CMPR[0].p_month===CMPMO+'-01'&&/คิวทั้งหมด/.test(t));
ok('schedule requested range today..+34',CMPS.length>=1&&CMPS[0].p_to&&Math.round((Date.parse(CMPS[0].p_to)-Date.parse(CMPS[0].p_from))/86400000)===34);}
// ตารางงาน
await p.click('#cmptab_sc');await p.waitForSelector('.orqt',{timeout:4000});
{const t=await p.textContent('#app');
ok('schedule tab: weekly days + hours + 4-week calendar excludes day 30',t.includes('จันทร์, พุธ')&&t.includes('09:00-17:00')&&t.includes('ปฏิทิน 4 สัปดาห์')&&t.includes('คุณแพร')&&(await p.$$eval('table.orqt',r=>r[r.length-1].querySelectorAll('tbody tr').length))===4);}
// การลา
CMPL.length=0;await p.click('#cmptab_lv');await p.waitForSelector('.orqt',{timeout:4000});
{const t=await p.textContent('#app');
ok('leaves tab: month rpc + name + FULL reason',CMPL.length===1&&CMPL[0].p_place==='cmp1'&&CMPL[0].p_month===CMPMO+'-01'&&t.includes('คุณนุ่น')&&t.includes('ไปหาหมอ ปวดหลัง')&&t.includes('ผู้มาแทน')&&t.includes('คุณแพร'));}
await p.selectOption('#cmp_month',await p.$$eval('#cmp_month option',o=>o[1].value));await p.waitForTimeout(700);
ok('leaves month change refetches',CMPL.length===2&&CMPL[1].p_month!==CMPL[0].p_month);await p.selectOption('#cmp_month',CMPMO);await p.waitForTimeout(500);
// ให้คะแนน
await p.click('#cmptab_fb');await p.waitForSelector('#cmp_fbm',{timeout:4000});
ok('feedback tab: 4 months, contact buttons',(await p.$$('#cmp_fbm option')).length===4&&(await p.textContent('#app')).includes('ติดต่อสมาคม'));
await p.click('[data-orq=cmpfbsend]');await p.waitForTimeout(300);ok('requires rating',(await p.textContent('#app')).includes('กรุณาเลือกคะแนน 1-5')&&CMPSUB.length===0);
await p.check('input[name=cmp_rt][value="1"]');await p.fill('#cmp_fbc','ทดสอบ');await p.click('[data-orq=cmpfbsend]');await p.waitForTimeout(600);
ok('server error shown, text kept',(await p.textContent('#app')).includes('เดือนนี้ให้คะแนนไปแล้ว')&&(await p.inputValue('#cmp_fbc'))==='ทดสอบ');
await p.check('input[name=cmp_rt][value="4"]');await p.check('#cmp_fbp');await p.click('[data-orq=cmpfbsend]');await p.waitForTimeout(900);
{const t=await p.textContent('#app'),sb=CMPSUB[CMPSUB.length-1];
ok('rating submitted with problem flag + history row, month removed from options',sb.p_rating===4&&sb.p_problem===true&&sb.p_comment==='ทดสอบ'&&sb.p_place==='cmp1'&&t.includes('ขอบคุณครับ')&&t.includes('4/5')&&(await p.$$('#cmp_fbm option')).length===3);}
// รายงานรายเดือน
const cmp0=CMPR.length;await p.click('#cmptab_rp');await p.waitForSelector('.orqsum',{timeout:5000});
{const t=await p.textContent('#app');
ok('report requested for this month, day 1',CMPR.length>=1&&CMPR[0].p_place==='cmp1'&&CMPR[0].p_month===CMPMO+'-01');
ok('summary: 4 queues, 2 done, 1.5 hours, 1 no-show',/4\s*คิวทั้งหมด/.test(t)&&/2\s*ใช้บริการแล้ว/.test(t)&&/1\.5\s*ชั่วโมงที่ให้บริการ/.test(t)&&/1\s*ไม่มา/.test(t));
ok('per-therapist hours, per-day table, actual times',t.includes('คุณนุ่น')&&t.includes('แยกตามวัน')&&t.includes('เวลาให้บริการจริง')&&t.includes('10:02')&&t.includes('บริษัท ไทยออฟฟิศ'));
ok('no money anywhere in report',!/บาท|ราคา|ยอด|฿/.test(t.slice(t.indexOf('แยกตามหมอนวด'))));}
ok('month select has 24 months, current selected',(await p.$$('#cmp_month option')).length===24&&(await p.inputValue('#cmp_month'))===CMPMO);
await p.selectOption('#cmp_month',await p.$$eval('#cmp_month option',o=>o[1].value));await p.waitForTimeout(700);
ok('changing month reloads with new month, empty message',CMPR.length>cmp0&&CMPR[CMPR.length-1].p_month!==CMPMO+'-01'&&(await p.textContent('#app')).includes('ยังไม่มีการจองคิวในเดือนนี้'));
await p.selectOption('#cmp_month',CMPMO);await p.waitForSelector('.orqsum',{timeout:4000});
{const [dl]=await Promise.all([p.waitForEvent('download',{timeout:8000}),p.click('[data-orq=cmppdf]')]);const buf=require('fs').readFileSync(await dl.path());
ok('monthly PDF downloads (ASCII name, valid PDF)',dl.suggestedFilename()==='company-report-'+CMPMO+'.pdf'&&buf.slice(0,5).toString()==='%PDF-'&&buf.length>3000);}
await p.click('[data-orq=cmpback]');await p.waitForTimeout(300);ok('back returns to account page',!!(await p.$('[data-orq=cmpopen]')));
console.log('errors:',errs.join('|')||'none');await b.close();process.exit(0)
})()

