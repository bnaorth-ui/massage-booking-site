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
const APPS=[],SUBM=[],CANCS=[];
await ctx.route('**/rest/v1/rpc/my_company_applications',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(APPS)}));
await ctx.route('**/rest/v1/rpc/company_application_submit',r=>{const pl=JSON.parse(r.request().postData()).p;SUBM.push(pl);APPS.unshift({id:'ap'+SUBM.length,company_name:pl.company_name,total:pl.gender_mode==='split'?pl.male+pl.female:pl.total,gender_mode:pl.gender_mode,male:pl.male,female:pl.female,employment:pl.employment,salary:pl.salary,weekdays:pl.weekdays,start_time:pl.start_time+':00',end_time:pl.end_time+':00',status:'new',admin_note:null,contract_start:null,contract_end:null});r.fulfill({status:200,contentType:'application/json',body:'"ap'+SUBM.length+'"'})});
await ctx.route('**/rest/v1/rpc/company_application_cancel',r=>{const id=JSON.parse(r.request().postData()).p_id;CANCS.push(id);APPS.find(a=>a.id===id).status='cancelled';r.fulfill({status:200,contentType:'application/json',body:'null'})});
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>{errs.push('DIALOG '+d.message());d.dismiss()});
await p.goto(require('./config').page('customer-booking.html'));
const ok=(n,c)=>console.log((c?'PASS ':'FAIL ')+n);
await p.waitForSelector('[data-pl]',{timeout:5000});
ok('guest home has company bar after org bar',await p.evaluate(()=>{const a=[...document.querySelectorAll('.regbar')];const i=a.findIndex(x=>x.querySelector('[data-orq=guest]')),j=a.findIndex(x=>x.querySelector('[data-orq=capguest]'));return i>-1&&j===i+1&&a[j].textContent.includes('ดูแลพนักงานของคุณ พร้อมสร้างอาชีพให้ผู้พิการทางการเห็น')&&a[j].textContent.includes('ออฟฟิศซินโดรม')&&a[j].textContent.includes('ลงทะเบียนบริษัท')}));
await p.click('[data-orq=capguest]');await p.waitForSelector('#rph,#lph',{timeout:3000});
ok('guest must log in first',!!(await p.$('#rph,#lph')));
if(await p.$('[data-ag=login]'))await p.click('[data-ag=login]');
await p.waitForSelector('#lph');await p.fill('#lph','0811111111');await p.fill('#lpw','abc123');await p.click('button[type=submit]');
await p.waitForSelector('#capf',{timeout:6000});
ok('after login goes to the application form',(await p.textContent('#app')).includes('ลงทะเบียนบริษัท'));
ok('contact prefilled from account',(await p.inputValue('#cap_cn')).includes('สมชาย')&&(await p.inputValue('#cap_cp'))==='0811111111');
ok('no employee-count field; has therapists-count, s33/s35 radios, salary',!(await p.textContent('#capf')).includes('พนักงานกี่คน')&&!!(await p.$('#cap_total'))&&(await p.$$('[name=cap_emp]')).length===2&&!!(await p.$('#cap_sal')));
const sub=async()=>{await p.click('[data-orq=capsend]');await p.waitForTimeout(200)};
await sub();ok('empty submit blocked with message',(await p.textContent('#cap_err')).includes('ชื่อบริษัท')&&SUBM.length===0);
await p.fill('#cap_name','บริษัท ทดสอบ จำกัด');await p.fill('#cap_total','25');await sub();
ok('over 20 blocked',(await p.textContent('#cap_err')).includes('1 ถึง 20')&&SUBM.length===0);
await p.fill('#cap_total','2');await sub();ok('employment required',(await p.textContent('#cap_err')).includes('มาตรา 33')&&SUBM.length===0);
await p.check('[name=cap_emp][value=s33]');await sub();ok('weekday required',(await p.textContent('#cap_err')).includes('วัน')&&SUBM.length===0);
await p.check('[data-capwd="1"]');await p.check('[data-capwd="3"]');await sub();ok('privacy consent required',(await p.textContent('#cap_err')).includes('นโยบายความเป็นส่วนตัว')&&SUBM.length===0);
await p.check('#cap_terms');await p.selectOption('#cap_s','13:00');await p.selectOption('#cap_e','09:00');await sub();ok('end after start',(await p.textContent('#cap_err')).includes('เวลาสิ้นสุด')&&SUBM.length===0);
await p.selectOption('#cap_e','17:00');
await p.check('[name=cap_gm][value=split]');await p.waitForSelector('#cap_male');
ok('split mode shows male/female and hides total',!(await p.$('#cap_total')));
await p.fill('#cap_male','1');await p.fill('#cap_female','2');ok('sum shown',(await p.textContent('#cap_sum')).includes('รวม 3 คน'));
await p.evaluate(()=>Object.defineProperty(navigator,'userAgent',{get:()=>'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1'}));
await p.fill('#cap_sal','15000');await sub();
await p.waitForSelector('.flash',{timeout:3000});
ok('submitted with right payload',SUBM.length===1&&SUBM[0].gender_mode==='split'&&SUBM[0].male===1&&SUBM[0].female===2&&SUBM[0].employment==='s33'&&SUBM[0].salary===15000&&JSON.stringify(SUBM[0].weekdays)==='[1,3]'&&SUBM[0].start_time==='13:00'&&SUBM[0].end_time==='17:00');
ok('list shows application with status and salary',await p.$eval('#app',e=>e.textContent.includes('บริษัท ทดสอบ จำกัด')&&e.textContent.includes('รอสมาคมรับเรื่อง')&&e.textContent.includes('ชาย 1 หญิง 2')&&e.textContent.includes('มาตรา 33')&&e.textContent.includes('15,000')));
ok('install tip shown inline after submit (iPhone browser)',await p.evaluate(()=>{const e=document.getElementById('cap_instip');return !!e&&e.textContent.includes('ติดตั้งแอปเพื่อไม่พลาดการแจ้งเตือน')&&!!e.querySelector('[data-insp=open]')}));
ok('form reset after send',(await p.inputValue('#cap_name'))==='');
await p.click('[data-orq=capcancel]');ok('cancel needs confirm click',CANCS.length===0&&(await p.textContent('#app')).includes('ยืนยันยกเลิกใบสมัคร'));
await p.click('[data-orq=capcancel]');await p.waitForTimeout(300);ok('cancel sent',CANCS.length===1&&(await p.textContent('#app')).includes('ยกเลิกแล้ว'));
await p.click('[data-orq=capback]');await p.waitForTimeout(200);
ok('back returns to account with bar',!!(await p.$('[data-orq=capopen]')));
ok('account menu: compact button "สำหรับบริษัท", no title/description',await p.evaluate(()=>{const b=document.querySelector('[data-orq=capopen]');const bar=b&&b.closest('.regbar');return !!bar&&b.textContent.trim()==='สำหรับบริษัท'&&bar.textContent.trim()==='สำหรับบริษัท'&&!document.body.innerText.includes('ลงทะเบียนบริษัทของคุณด้านล่างนี้')}));
await p.click('[data-orq=capopen]');await p.waitForSelector('#capf');ok('reopen works',!!(await p.$('#capf')));
console.log('errors:',errs.join('|')||'none');await b.close();process.exit(0)
})()
