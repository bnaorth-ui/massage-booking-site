// ความปลอดภัยในแชตของผู้ใช้งาน: รายงาน บล็อก ผู้ที่บล็อกไว้ และหน้ายอมรับเงื่อนไขการใช้งาน (ตั้งต้นจาก t_chat_cust.js)
const {chromium}=require('playwright');
const bkk=(n=0)=>{const d=new Date(Date.now()+7*3600000+n*86400000);return d.toISOString().slice(0,10)};
(async()=>{const b=await chromium.launch(require('./config').launch);
const ctx=await b.newContext({timezoneId:'Asia/Bangkok',locale:'th-TH'});const errs=[],calls=[];
let mode={cat:true,rpcMissing:false};let PTS={on:true,baht_per:10,per_baht:10,min:100,expire_months:12,balance:450,next_expiry:new Date(Date.now()+30*86400000).toISOString(),next_expiry_points:100,history:[{kind:'earn',points:450,note:'ได้แต้มจากการใช้บริการ MS1',at:new Date().toISOString()}]};let lastCB=null;let MSGS=[{id:'m1',booking_id:'bid-MS1',room_key:'shop',sender_id:'shopuser',sender_role:'shop',sender_name:'ร้านสบายดี สปา',body:'ยินดีต้อนรับค่ะ',created_at:'2026-10-29T10:00:00.000000+00:00'}];let UNR=[{booking_id:'bid-MS1',room:'shop',n:1}];let marks=[];let sendErr=null;let seq=100000;const BKS=[];const NOTES=[];
const UID='uuid-1';const TERMS={cur:2,acc:1};const SAFE={calls:[],bid:null,state:{},list:[],repErr:null};
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
const fmt=b=>({ref:b.ref,place_id:b.place_id,place_name:b.place_name,place_type:b.place_type,cancel_hours:24,phone:b.phone,customer_name:'สมชาย ใจดี',starts_at:new Date(b.s).toISOString(),ends_at:new Date(b.e).toISOString(),total:b.total,discount:b.discount,promo:b.promo,status:b.status,moved_from:b.moved_from,moved_to:b.moved_to,id:'bid-'+b.ref,points_used:b.pu||0,points_discount:b.pd||0,created_at:new Date().toISOString(),items:b.items.map(i=>({id:i.id,service_id:i.service_id,service_name:i.service_name,staff_id:i.staff_id,staff_name:nm(i.staff_id),minutes:i.minutes,price:i.price,starts_at:new Date(i.s).toISOString(),ends_at:new Date(i.e).toISOString(),active:i.active,job:i.job||'pending'}))});
await ctx.route('**/*supabase.co/**',async r=>{const q=r.request(),u=new URL(q.url()),m=q.method(),path=u.pathname,body=(()=>{try{return JSON.parse(q.postData()||'null')}catch(e){return null}})();
 calls.push({m,path,body,auth:q.headers()['authorization']||''});
 const J=(s,o)=>r.fulfill({status:s,contentType:'application/json',body:JSON.stringify(o)});
 const sess=()=>({access_token:'at',refresh_token:'rt',expires_in:3600,user:{id:UID,user_metadata:{first_name:'สมชาย',last_name:'ใจดี',phone:'0811111111'}}});
 if(path==='/auth/v1/signup'||(path==='/auth/v1/token'&&u.search.includes('password')))return J(200,sess());
 if(path==='/auth/v1/token')return J(200,sess());
 if(path==='/rest/v1/profiles')return J(200,[{first_name:'สมชาย',last_name:'ใจดี',phone:'0811111111',avatar_path:null}]);
 if(!mode.cat&&path.startsWith('/rest/v1/places'))return r.abort();
 const T={places:places,services:services,service_places:[],staff_public:staff,staff_services:ss,place_staff:ps,staff_days_off:[],promotions:promos,promotion_services:pms,place_day_overrides:[],app_settings:[process.env.EMPTY?{shop_radius_km:10,org_radius_km:10,notify_user:true,notify_staff:true}:{shop_radius_km:10,org_radius_km:10,notify_user:true,notify_staff:true,association_name:'สมาคมทดสอบ',address:'เลขที่ 1 ถนนทดสอบ',phone:'02-123 4567',line_url:'https://line.me/R/ti/p/@test',hours_text:'จันทร์ – ศุกร์ 08:30 – 16:30 น.\nเสาร์ – อาทิตย์ ปิด',register_url:'https://shop.example.com/'}],announcements:[{title:'ประกาศทดสอบ',body:'สวัสดี',audiences:['ผู้ใช้งาน'],active:true}],notifications:NOTES};
 const t=path.replace('/rest/v1/','');
 if(m==='GET'&&T[t]!==undefined)return J(200,T[t]);
 if(mode.rpcMissing&&path.startsWith('/rest/v1/rpc/'))return J(404,{code:'PGRST202',message:'Could not find the function public.'+path.split('/').pop()+' in the schema cache'});
 if(path==='/rest/v1/rpc/busy_slots'){const f=Date.parse(body.p_from),to=Date.parse(body.p_to);return J(200,busyItems().filter(i=>body.p_staff.includes(i.staff_id)&&i.s<to&&i.e>f).map(i=>({staff_id:i.staff_id,starts_at:new Date(i.s).toISOString(),ends_at:new Date(i.e).toISOString()})))}
 if(path==='/rest/v1/rpc/chat_unread')return J(200,UNR);
 if(path==='/rest/v1/rpc/chat_mark_read'){marks.push(body);UNR=UNR.filter(x=>!(x.booking_id===body.p_booking&&x.room===body.p_room));return J(204,null)}
 if(path==='/rest/v1/rpc/chat_send'){if(sendErr)return J(400,{code:'P0001',message:sendErr});MSGS.push({id:'m'+(MSGS.length+1),booking_id:body.p_booking,room_key:body.p_room,sender_id:UID,sender_role:'user',sender_name:'สมชาย ใจดี',body:body.p_body,created_at:new Date().toISOString().replace('Z','000+00:00')});return J(200,'x')}
 if(path==='/rest/v1/chat_messages'){const b=u.searchParams.get('booking_id').replace('eq.',''),r=u.searchParams.get('room_key').replace('eq.',''),gt=u.searchParams.get('created_at');let L=MSGS.filter(m=>m.booking_id===b&&m.room_key===r);if(gt)L=L.filter(m=>m.created_at>gt.replace('gt.',''));return J(200,L)}
 if(path==='/rest/v1/rpc/my_points')return J(200,PTS);
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
   if(body.p_points){lastCB=body;const pd=body.p_points/10;BKS[BKS.length-1].total-=pd;BKS[BKS.length-1].pu=body.p_points;BKS[BKS.length-1].pd=pd;PTS.balance-=body.p_points}
   return J(200,ref)}
 if(path==='/rest/v1/rpc/terms_status')return J(200,{current:TERMS.cur,accepted:TERMS.acc});
 if(path==='/rest/v1/rpc/accept_terms'){TERMS.acc=TERMS.cur;SAFE.calls.push(['accept',body]);return J(204,null)}
 if(path==='/rest/v1/rpc/chat_room_state'){SAFE.calls.push(['state',body]);return J(200,Object.assign({role:'user',block_id:SAFE.bid,reported:false,suspended:false,blocked_by_me:!!SAFE.bid,blocked_by_other:false},SAFE.state))}
 if(path==='/rest/v1/rpc/chat_report'){SAFE.calls.push(['report',body]);if(SAFE.repErr)return J(400,{code:'P0001',message:SAFE.repErr});return J(200,'rep1')}
 if(path==='/rest/v1/rpc/chat_block'){SAFE.calls.push(['block',body]);SAFE.bid='blk1';return J(200,'blk1')}
 if(path==='/rest/v1/rpc/chat_unblock'){SAFE.calls.push(['unblock',body]);SAFE.bid=null;SAFE.list=SAFE.list.filter(x=>x.id!==body.p_id);return J(204,null)}
 if(path==='/rest/v1/rpc/my_blocks'){SAFE.calls.push(['list',body]);return J(200,SAFE.list)}
 return J(404,{message:'nf '+path})});
const p=await ctx.newPage();await ctx.route('**/rest/v1/rpc/public_catalog',async r=>{try{const o=new URL(r.request().url()).origin;const g=t=>p.evaluate(async u=>{try{const x=await fetch(u);return x.ok?await x.json():null}catch(e){return null}},o+'/rest/v1/'+t+'?select=*');const R={};for(const [k,t] of [['places','places'],['services','services'],['service_places','service_places'],['staff','staff_public'],['staff_services','staff_services'],['place_staff','place_staff'],['days_off','staff_days_off'],['promos','promotions'],['promo_services','promotion_services'],['overrides','place_day_overrides'],['settings','app_settings'],['ann','announcements']])R[k]=await g(t);if(R.places===null)return r.fulfill({status:500,contentType:'application/json',body:'{"message":"fail"}'});for(const k in R)if(R[k]===null)R[k]=[];R.settings=R.settings&&R.settings[0];r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(R)})}catch(e){}});{const _w=p.waitForSelector.bind(p);p.waitForSelector=async(s,o)=>{if(s==='#lph'){await _w('#lph,[data-gb=login]',o);if(!(await p.$('#lph')))await p.click('[data-gb=login]')}return _w(s,o)}}{const _f=p.fill.bind(p);p.fill=async(s,v,o)=>{if(s==='#lph'){await p.waitForSelector('#lph,[data-gb=login]',{timeout:8000});if(!(await p.$('#lph')))await p.click('[data-gb=login]')}return _f(s,v,o)}};p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>{errs.push('DIALOG '+d.message());d.dismiss()});
const store=[];await ctx.route('**/storage/v1/object/avatars/**',r=>{store.push({m:r.request().method(),u:new URL(r.request().url()).pathname,auth:r.request().headers()['authorization']||''});r.fulfill({status:200,contentType:'application/json',body:'{}'})});
const patches=[];await ctx.route('**/rest/v1/profiles?id=eq.*',async r=>{if(r.request().method()==='PATCH'){patches.push(JSON.parse(r.request().postData()||'{}'));return r.fulfill({status:204,body:''})}return r.fallback()});
await p.goto(require('./config').page('customer-booking.html'));
const A=async()=>await p.textContent('#app');const home=async()=>{if(await p.$('#home'))await p.click('#home');if(await p.$('#again'))await p.click('#again')};const ok=(n,c)=>console.log((c?'PASS ':'FAIL ')+n);
const H=3600000,mk=(ref,off,st,job)=>({ref,place_id:'sh1',place_name:'ร้านสบายดี สปา',place_type:'shop',phone:'0811111111',s:Date.now()+off*H,e:Date.now()+off*H+H,total:400,discount:0,promo:null,status:st,moved_from:null,moved_to:null,items:[{id:'it'+ref,service_id:'v1',service_name:'นวดไทย',staff_id:'st1',minutes:60,price:400,s:Date.now()+off*H,e:Date.now()+off*H+H,active:st==='confirmed',job:job||'pending'}]});
BKS.push(mk('MS1',72,'confirmed'),mk('MS2',-48,'confirmed','done'),mk('MS3',96,'cancelled'),mk('MS4',120,'rescheduled'),mk('MS5',-72,'completed','done'));

await p.fill('#lph','0811111111');await p.fill('#lpw','abc123');await p.click('button[type=submit]');
await p.waitForSelector('#tmacc',{timeout:5000});
ok('terms gate shown after login when a newer version exists',(await A()).includes('กรุณาอ่านและกดยอมรับเงื่อนไขการใช้งาน')&&(await A()).includes('ห้ามขอหรือเสนอบริการทางเพศ'));
ok('terms gate: focus on heading, no bottom bar content',await p.evaluate(()=>document.activeElement&&document.activeElement.id==='tmgt'));
await p.click('#tmpv');await p.waitForTimeout(200);
ok('terms gate: can read privacy policy, then go back',(await A()).includes('นโยบายความเป็นส่วนตัว')&&(await A()).includes('ห้องที่มีผู้กดรายงาน')&&!!(await p.$('#tmback')));
await p.click('#tmback');await p.waitForSelector('#tmacc');
await p.click('#tmacc');await p.waitForSelector('[data-pl]',{timeout:4000});
ok('terms accepted -> home',SAFE.calls.some(c=>c[0]==='accept'&&c[1].p_app==='customer')&&TERMS.acc===2);



await p.click('[data-tab="bk"]');await p.waitForTimeout(500);
await p.click('[data-chat="bid-MS1"][data-room=shop]');await p.waitForSelector('#chrp',{timeout:4000});
ok('room state asked for this room',SAFE.calls.some(c=>c[0]==='state'&&c[1].p_booking==='bid-MS1'&&c[1].p_room==='shop'));
ok('report and block buttons in chat',(await p.textContent('#chrp')).trim()==='รายงาน'&&(await p.textContent('#chbk')).trim()==='บล็อก'&&!!(await p.$('#chf')));
await p.click('#chrp');await p.waitForTimeout(150);
ok('report form: focus on legend, 5 reasons, note about staff seeing messages',await p.evaluate(()=>document.activeElement&&document.activeElement.id==='chrl')&&(await p.$$('input[name=chr]')).length===5&&(await p.textContent('#chrf')).includes('เจ้าหน้าที่จะเห็นข้อความล่าสุด'));
await p.click('#chrf button[type=submit]');await p.waitForTimeout(150);
ok('report: reason required',(await p.textContent('#chrm')).includes('กรุณาเลือกเหตุผล')&&!SAFE.calls.some(c=>c[0]==='report'));
await p.check('#chr_other');await p.click('#chrf button[type=submit]');await p.waitForTimeout(150);
ok('report: detail required for other',(await p.textContent('#chrm')).includes('กรุณาพิมพ์รายละเอียด'));
await p.check('#chr_offplatform');await p.fill('#chrd','ขอเบอร์ส่วนตัว');await p.click('#chrf button[type=submit]');await p.waitForTimeout(400);
const rp=SAFE.calls.find(c=>c[0]==='report');
ok('report sent with reason and detail',!!rp&&rp[1].p_booking==='bid-MS1'&&rp[1].p_room==='shop'&&rp[1].p_reason==='offplatform'&&rp[1].p_detail==='ขอเบอร์ส่วนตัว');
ok('report done: button disabled, status said, focus back',(await p.getAttribute('#chrp','aria-disabled'))==='true'&&(await p.textContent('#chrp')).includes('รายงานแล้ว')&&(await p.textContent('#chsm')).includes('ส่งรายงานถึงเจ้าหน้าที่แล้ว')&&await p.evaluate(()=>document.activeElement&&document.activeElement.id==='chrp'));
await p.fill('#chi','ยังพิมพ์ได้');
await p.click('#chbk');await p.waitForTimeout(150);
ok('block asks to confirm first, focus on question',(await p.textContent('#chsx')).includes('บล็อกร้านนี้?')&&await p.evaluate(()=>document.activeElement&&document.activeElement.id==='chbq')&&!SAFE.calls.some(c=>c[0]==='block'));
await p.click('[data-chs=bc]');await p.waitForTimeout(100);
ok('block cancel: nothing sent, focus back, text kept',!SAFE.calls.some(c=>c[0]==='block')&&await p.evaluate(()=>document.activeElement&&document.activeElement.id==='chbk')&&(await p.inputValue('#chi'))==='ยังพิมพ์ได้');
await p.click('#chbk');await p.click('[data-chs=bk]');await p.waitForTimeout(400);
ok('blocked: call sent, form replaced by notice, unblock button',SAFE.calls.some(c=>c[0]==='block'&&c[1].p_room==='shop')&&!(await p.$('#chf'))&&(await p.textContent('#chlock')).includes('คุณบล็อกร้านนี้ไว้')&&(await p.textContent('#chbk')).trim()==='ยกเลิกบล็อก');
await p.click('#chbk');await p.waitForTimeout(400);
ok('unblock: form back',SAFE.calls.some(c=>c[0]==='unblock'&&c[1].p_id==='blk1')&&!!(await p.$('#chf'))&&(await p.textContent('#chsm')).includes('ยกเลิกบล็อกแล้ว'));
await p.click('#chback');await p.waitForTimeout(400);
// ถูกอีกฝ่ายบล็อก / บัญชีถูกระงับ
SAFE.state={blocked_by_other:true};await p.click('[data-chat="bid-MS1"][data-room=shop]');await p.waitForSelector('#chlock',{timeout:4000});
ok('blocked by the other side: no send box, plain notice',!(await p.$('#chf'))&&(await p.textContent('#chlock')).includes('อีกฝ่ายปิดรับข้อความจากคุณ')&&(await p.textContent('#chbk')).trim()==='บล็อก');
await p.click('#chback');await p.waitForTimeout(300);
SAFE.state={suspended:true};await p.click('[data-chat="bid-MS1"][data-room=shop]');await p.waitForSelector('#chlock',{timeout:4000});
ok('suspended: no send box, suspended notice',!(await p.$('#chf'))&&(await p.textContent('#chlock')).includes('บัญชีของคุณถูกระงับ'));
await p.click('#chback');await p.waitForTimeout(300);SAFE.state={};
// หน้าบัญชี: เงื่อนไข และ ผู้ที่บล็อกไว้
SAFE.list=[{id:'b1',name:'ร้านสบายดี สปา',kind:'shop'},{id:'b2',name:'คุณวิภา',kind:'staff'}];
await p.click('[data-tab="ac"]');await p.waitForTimeout(300);
ok('account has terms and blocked-list buttons',!!(await p.$('[data-view=tm]'))&&!!(await p.$('[data-blk=open]')));
await p.click('[data-view=tm]');await p.waitForTimeout(200);
ok('terms page from account',(await A()).includes('เงื่อนไขการใช้งาน')&&(await A()).includes('ห้ามชวนหมอนวดรับงานหรือรับเงินนอกระบบ'));
await p.click('[data-view=ac]');await p.waitForTimeout(200);
await p.click('[data-blk=open]');await p.waitForSelector('[data-ublk]',{timeout:4000});
ok('blocked list shows names and kinds',(await A()).includes('ร้านสบายดี สปา (ร้าน)')&&(await A()).includes('คุณวิภา (พนักงาน)')&&SAFE.calls.some(c=>c[0]==='list'&&c[1].p_app==='customer'));
await p.click('[data-ublk=b1]');await p.waitForTimeout(400);
ok('unblock from list removes the row and says so',!(await A()).includes('ร้านสบายดี สปา (ร้าน)')&&(await A()).includes('คุณวิภา (พนักงาน)')&&(await p.textContent('#blkm')).includes('ยกเลิกบล็อกแล้ว'));
await p.click('[data-blk=no]');await p.waitForTimeout(200);
ok('back to account page',(await A()).includes('ผู้ที่บล็อกไว้')&&!(await p.$('[data-ublk]')));
console.log('errors:',errs.join('|')||'none');ok('no page errors',errs.length===0);await b.close();process.exit(0)})();
