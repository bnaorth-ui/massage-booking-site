// แถบเรียงและกรองร้านนวด (แอปผู้ใช้งาน): แสดงเมื่อมีร้านตั้งแต่ 4 ร้าน เรียง แนะนำ/ใกล้สุด/คะแนนสูงสุด/ว่างเร็วสุด กรอง ว่างวันนี้/มีโปรโมชัน
const {chromium}=require('playwright');
const bkk=(n=0)=>{const d=new Date(Date.now()+7*3600000+n*86400000);return d.toISOString().slice(0,10)};
(async()=>{const b=await chromium.launch(require('./config').launch);
const ctx=await b.newContext({timezoneId:'Asia/Bangkok',locale:'th-TH'});const errs=[],calls=[];
let mode={cat:true,rpcMissing:false,busyErr:false};const BUSYQ=[];let seq=100000;const BKS=[];const NOTES=[];
const UID='uuid-1';
const places=[
 {id:'sh1',type:'shop',name:'ร้านสบายดี สปา',area:'สุขุมวิท',lat:13.76,lng:100.51,open_days:[0,1,2,3,4,5,6],open_time:'10:00:00',close_time:'21:00:00',fixed_date:null,advance_days:14,cancel_hours:24,image_path:null,status:'approved',active:true},
 {id:'sh2',type:'shop',name:'ร้านใหญ่',area:'สีลม',lat:13.761,lng:100.511,open_days:[0,1,2,3,4,5,6],open_time:'10:00:00',close_time:'21:00:00',fixed_date:null,advance_days:14,cancel_hours:24,image_path:null,status:'approved',active:true},
 {id:'sh3',type:'shop',name:'ร้านดาวเด่น',area:'บางนา',lat:13.80,lng:100.55,open_days:[0,1,2,3,4,5,6],open_time:'10:00:00',close_time:'21:00:00',fixed_date:null,advance_days:14,cancel_hours:24,image_path:null,status:'approved',active:true},
 {id:'sh4',type:'shop',name:'ร้านเปิดใหม่',area:'ธนบุรี',lat:13.70,lng:100.45,open_days:[0,1,2,3,4,5,6],open_time:'10:00:00',close_time:'21:00:00',fixed_date:null,advance_days:14,cancel_hours:24,image_path:null,status:'approved',active:true},
 {id:'og1',type:'org',name:'สำนักงานพัฒนาสังคม',area:'พญาไท',lat:13.758,lng:100.509,open_days:[0,1,2,3,4,5,6],open_time:'09:00:00',close_time:'17:00:00',fixed_date:bkk(3),advance_days:14,cancel_hours:24,image_path:null,status:'approved',active:true},
 {id:'cp1',type:'company',name:'บริษัท ไทยออฟฟิศ',area:'ปทุมวัน',lat:13.7635,lng:100.5018,open_days:[1,2,3,4,5],open_time:'09:00:00',close_time:'18:00:00',fixed_date:null,advance_days:14,cancel_hours:24,image_path:null,status:'approved',active:true}];
const services=[
 {id:'ga',place_id:null,name:'นวดไทยแผนโบราณ',minutes:60,price:400,applies_all:true,active:true},
 {id:'sa',place_id:'sh1',name:'นวดไทย',minutes:60,price:400,applies_all:false,active:true},
 {id:'sb',place_id:'sh1',name:'นวดเท้า',minutes:60,price:350,applies_all:false,active:true},
 {id:'se',place_id:'sh3',name:'นวดไทย',minutes:60,price:400,applies_all:false,active:true},{id:'sf',place_id:'sh4',name:'นวดไทย',minutes:60,price:380,applies_all:false,active:true},{id:'sc',place_id:'sh2',name:'นวดคอบ่าไหล่',minutes:30,price:250,applies_all:false,active:true},{id:'sd',place_id:'sh2',name:'นวดไทย 2 ชม.',minutes:120,price:600,applies_all:false,active:true}];
const staff=[{id:'st1',name:'คุณวิภา',place_id:'sh1',photo_path:null},{id:'st2',name:'คุณสมศรี',place_id:'sh1',photo_path:null},{id:'st3',name:'คุณนุ่น',place_id:null,photo_path:null},{id:'st4',name:'คุณมะลิ',place_id:null,photo_path:null}].concat([1,2,3,4,5,6].map(i=>({id:'bg'+i,name:'หมอ'+i,place_id:'sh2',photo_path:null}))).concat([{id:'c3',name:'คุณดาว',place_id:'sh3',photo_path:null},{id:'c4',name:'คุณใหม่',place_id:'sh4',photo_path:null}]);
const ss=[['st1','sa'],['st1','sb'],['st2','sa'],['st3','ga'],['st4','ga']].concat([1,2,3,4,5,6].flatMap(i=>[['bg'+i,'sc'],['bg'+i,'sd']])).concat([['c3','se'],['c4','sf']]).map(x=>({staff_id:x[0],service_id:x[1]}));
const ps=[{place_id:'og1',staff_id:'st3',weekdays:[]},{place_id:'cp1',staff_id:'st4',weekdays:[1,2,3,4,5]}];
const promos=[{id:'pm1',place_id:'sh1',title:'ลดราคานวดเท้า',description:'',type:'percent',value:10,applies_all:false,start_date:bkk(-1),end_date:bkk(30),image_path:null,active:true}];
const pms=[{promotion_id:'pm1',service_id:'sb'}];
const nm=id=>(staff.find(s=>s.id===id)||{}).name;
const busyItems=()=>BKS.filter(x=>x.status==='confirmed').flatMap(x=>x.items.filter(i=>i.active));
const fmt=b=>({ref:b.ref,place_id:b.place_id,place_name:b.place_name,place_type:b.place_type,cancel_hours:24,phone:b.phone,customer_name:'สมชาย ใจดี',starts_at:new Date(b.s).toISOString(),ends_at:new Date(b.e).toISOString(),total:b.total,discount:b.discount,promo:b.promo,status:b.status,moved_from:b.moved_from,moved_to:b.moved_to,created_at:new Date().toISOString(),items:b.items.map(i=>({id:i.id,service_id:i.service_id,service_name:i.service_name,staff_id:i.staff_id,staff_name:nm(i.staff_id),minutes:i.minutes,price:i.price,starts_at:new Date(i.s).toISOString(),ends_at:new Date(i.e).toISOString(),active:i.active,job:i.job||'pending'}))});
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
 if(path==='/rest/v1/rpc/place_ratings')return J(200,[{place_id:'sh1',avg_rating:4.6,fresh:false},{place_id:'sh2',avg_rating:3.9,fresh:false},{place_id:'sh3',avg_rating:4.9,fresh:false},{place_id:'sh4',avg_rating:null,fresh:true}]);
 if(path==='/rest/v1/reviews')return J(200,[]);
 if(path==='/rest/v1/rpc/busy_slots'){BUSYQ.push(body);if(mode.busyErr)return J(500,{message:'boom'});const f=Date.parse(body.p_from),to=Date.parse(body.p_to);return J(200,busyItems().filter(i=>body.p_staff.includes(i.staff_id)&&i.s<to&&i.e>f).map(i=>({staff_id:i.staff_id,starts_at:new Date(i.s).toISOString(),ends_at:new Date(i.e).toISOString()})))}
 if(path==='/rest/v1/rpc/my_bookings')return J(200,BKS.slice().sort((a,b)=>b.s-a.s).map(fmt));
 if(path==='/rest/v1/rpc/cancel_booking'){const b=BKS.find(x=>x.ref===body.p_ref);if(Date.now()>b.s-24*3600000)return J(400,{code:'P0001',message:'ยกเลิกไม่ได้ เกินเวลาที่ยกเลิกได้'});b.status='cancelled';b.items.forEach(i=>i.active=false);return r.fulfill({status:204,body:''})}
 if(path==='/rest/v1/rpc/create_booking'){const pl=places.find(p=>p.id===body.p_place);const start=Date.parse(body.p_start);let old=null;
   if(body.p_moved_from){old=BKS.find(x=>x.ref===body.p_moved_from&&x.status==='confirmed');if(!old)return J(400,{code:'P0001',message:'ไม่พบการจองเดิมที่จะเลื่อน'})}
   const its=[];let tot=0,dis=0,promo=null;
   for(const it of body.p_items){const sv=services.find(s=>s.id===it.service_id);const s=start+it.offset_min*60000,e=s+sv.minutes*60000;
     const pool=busyItems().filter(i=>!(old&&old.items.includes(i)));
     if(pool.some(i=>i.staff_id===it.staff_id&&i.s<e&&i.e>s))return J(400,{code:'P0001',message:'คิวนี้เพิ่งเต็ม กรุณาเลือกเวลาหรือหมอนวดใหม่'});
     let d=0;const pm=promos.find(p=>p.place_id===pl.id&&(pms.some(q=>q.promotion_id===p.id&&q.service_id===sv.id)));if(pm){d=Math.round(sv.price*pm.value)/100;promo=pm.title}
     tot+=sv.price-d;dis+=d;its.push({id:'it'+Math.random(),service_id:sv.id,service_name:sv.name,staff_id:it.staff_id,minutes:sv.minutes,price:sv.price-d,s,e,active:true})}
   if(old){old.status='rescheduled';old.items.forEach(i=>i.active=false)}
   const ref='MS'+(seq++);if(old)old.moved_to=ref;
   BKS.push({ref,place_id:pl.id,place_name:pl.name,place_type:pl.type,phone:body.p_phone,s:Math.min(...its.map(i=>i.s)),e:Math.max(...its.map(i=>i.e)),total:tot,discount:dis,promo,status:'confirmed',moved_from:body.p_moved_from,moved_to:null,items:its});
   NOTES.unshift({id:'n'+seq,title:'จองสำเร็จ',body:'เลขที่ '+ref,created_at:new Date().toISOString(),booking_id:'x'});
   return J(200,ref)}
 return J(404,{message:'nf '+path})});
const p=await ctx.newPage();await ctx.route('**/rest/v1/rpc/public_catalog',async r=>{try{const o=new URL(r.request().url()).origin;const g=t=>p.evaluate(async u=>{try{const x=await fetch(u);return x.ok?await x.json():null}catch(e){return null}},o+'/rest/v1/'+t+'?select=*');const R={};for(const [k,t] of [['places','places'],['services','services'],['service_places','service_places'],['staff','staff_public'],['staff_services','staff_services'],['place_staff','place_staff'],['days_off','staff_days_off'],['promos','promotions'],['promo_services','promotion_services'],['overrides','place_day_overrides'],['settings','app_settings'],['ann','announcements']])R[k]=await g(t);if(R.places===null)return r.fulfill({status:500,contentType:'application/json',body:'{"message":"fail"}'});for(const k in R)if(R[k]===null)R[k]=[];R.settings=R.settings&&R.settings[0];r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(R)})}catch(e){}});{const _w=p.waitForSelector.bind(p);p.waitForSelector=async(s,o)=>{if(s==='#lph'){await _w('#lph,[data-gb=login]',o);if(!(await p.$('#lph')))await p.click('[data-gb=login]')}return _w(s,o)}}{const _f=p.fill.bind(p);p.fill=async(s,v,o)=>{if(s==='#lph'){await p.waitForSelector('#lph,[data-gb=login]',{timeout:8000});if(!(await p.$('#lph')))await p.click('[data-gb=login]')}return _f(s,v,o)}};p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>{errs.push('DIALOG '+d.message());d.dismiss()});
const store=[];await ctx.route('**/storage/v1/object/avatars/**',r=>{store.push({m:r.request().method(),u:new URL(r.request().url()).pathname,auth:r.request().headers()['authorization']||''});r.fulfill({status:200,contentType:'application/json',body:'{}'})});
const patches=[];await ctx.route('**/rest/v1/profiles?id=eq.*',async r=>{if(r.request().method()==='PATCH'){patches.push(JSON.parse(r.request().postData()||'{}'));return r.fulfill({status:204,body:''})}return r.fallback()});
await p.goto(require('./config').page('customer-booking.html'));
const A=async()=>await p.textContent('#app');const home=async()=>{if(await p.$('#home'))await p.click('#home');if(await p.$('#again'))await p.click('#again')};const ok=(n,c)=>console.log((c?'PASS ':'FAIL ')+n);
const H=3600000,mk=(ref,off,st,job)=>({ref,place_id:'sh1',place_name:'ร้านสบายดี สปา',place_type:'shop',phone:'0811111111',s:Date.now()+off*H,e:Date.now()+off*H+H,total:400,discount:0,promo:null,status:st,moved_from:null,moved_to:null,items:[{id:'it'+ref,service_id:'v1',service_name:'นวดไทย',staff_id:'st1',minutes:60,price:400,s:Date.now()+off*H,e:Date.now()+off*H+H,active:st==='confirmed',job:job||'pending'}]});


await p.fill('#lph','0811111111');await p.fill('#lpw','abc123');await p.click('button[type=submit]');await p.waitForSelector('[data-pl]',{timeout:4000});

const D0=bkk(0);const T=(d,hm)=>Date.parse(d+'T'+hm+':00+07:00');
const busy=(staff,d,from,to)=>{BKS.push({ref:'X'+(seq++),place_id:'x',status:'confirmed',items:[{staff_id:staff,s:T(d,from),e:T(d,to),active:true}],s:T(d,from),e:T(d,to)})};
const order=async()=>await p.$$eval('#app [data-pl]',e=>e.map(x=>x.dataset.pl));
const sub=async()=>(await p.textContent('#app .sub')).trim();
const refresh=async()=>{await p.evaluate(()=>{CQ={};render()});await p.waitForTimeout(700)};
await p.clock.setFixedTime(new Date(D0+'T10:12:00+07:00'));busy('c3',D0,'10:00','21:00');await refresh();
await p.evaluate(()=>{loadReviews().then(function(){render()})});await p.waitForTimeout(600);
ok('4 shops: bar with sort select and two filter buttons',!!(await p.$('#sfs'))&&(await p.$$('[data-sf=a],[data-sf=p]')).length===2&&(await p.$eval('#sfs',e=>e.value))==='rec');
ok('bar sits between the kind toggle and the list',await p.evaluate(()=>{const t=document.querySelector('.tg'),b=document.querySelector('.sfb'),l=document.querySelector('#app .list');return !!(t.compareDocumentPosition(b)&4)&&!!(b.compareDocumentPosition(l)&4)}));
ok('select has a spoken label and 4 choices',(await p.textContent('label[for=sfs]'))==='เรียงร้าน'&&(await p.$$eval('#sfs option',e=>e.map(x=>x.textContent))).join('|')==='เรียง: แนะนำ|เรียง: ใกล้สุด|เรียง: คะแนนสูงสุด|เรียง: ว่างเร็วสุด');
const rec=await order();ok('recommended keeps the old order (new shop first)',rec[0]==='sh4'&&rec.length===4);
await p.selectOption('#sfs','rate');await p.waitForTimeout(300);
ok('sort by rating: 4.9, 4.6, 3.9, new shop last',(await order()).join(',')==='sh3,sh1,sh2,sh4');
ok('sub text says how it is sorted',(await sub()).startsWith('พบ 4 ร้าน เรียงตามคะแนนสูงสุด'));
ok('focus stays on the select and result is announced',(await p.evaluate(()=>document.activeElement.id))==='sfs'&&(await p.evaluate(()=>new Promise(r=>setTimeout(()=>r((document.querySelector('#sr')||{}).textContent||''),200)))).includes('แสดง 4 ร้าน เรียงตามคะแนนสูงสุด'));
await p.selectOption('#sfs','soon');await p.waitForTimeout(300);let o=await order();
ok('sort by soonest: shop full today goes last',o[o.length-1]==='sh3'&&o.length===4);
await p.click('[data-sf=a]');await p.waitForTimeout(300);o=await order();
ok('filter free today: full shop hidden, button pressed',o.length===3&&!o.includes('sh3')&&(await p.getAttribute('[data-sf=a]','aria-pressed'))==='true');
ok('sub text lists the filter',(await sub()).includes('พบ 3 ร้าน เรียงตามว่างเร็วสุด เฉพาะที่ว่างวันนี้'));
await p.click('[data-sf=p]');await p.waitForTimeout(300);
ok('both filters: only shop with promo and free today',(await order()).join(',')==='sh1'&&(await sub()).includes('เฉพาะที่ว่างวันนี้ และมีโปรโมชัน'));
ok('choices saved on this device',(await p.evaluate(()=>localStorage.getItem('custShopSort')))==='{"s":"soon","a":true,"p":true}');
busy('st1',D0,'10:00','21:00');busy('st2',D0,'10:00','21:00');await refresh();
ok('nothing matches: message with clear button',(await p.textContent('#sfempty')).includes('ไม่มีร้านที่ตรงเงื่อนไข')&&!!(await p.$('[data-sf=clear]')));
await p.click('[data-sf=clear]');await p.waitForTimeout(300);
ok('clear filters: all 4 shops back, sort kept, focus on select',(await order()).length===4&&(await p.$eval('#sfs',e=>e.value))==='soon'&&(await p.evaluate(()=>document.activeElement.id))==='sfs');
// ใกล้สุด
await p.selectOption('#sfs','near');await p.waitForTimeout(300);
ok('nearest without location: hint to use location',(await sub()).includes('กด "ใช้ตำแหน่งของฉัน" เพื่อเรียงตามระยะทาง'));
await p.evaluate(()=>{V.loc={lat:13.70,lng:100.451};render()});await p.waitForTimeout(300);
ok('nearest with location: closest first',(await order())[0]==='sh4');
// ร้านไม่ถึง 4 ร้านในรัศมี: ไม่แสดงแถบ ไม่กรอง
await p.evaluate(()=>{SF.p=true;V.loc={lat:13.7605,lng:100.5105};SET.defShop.radius=1;render()});await p.waitForTimeout(300);
ok('fewer than 4 shops: no bar, filter not applied',!(await p.$('#sfs'))&&(await order()).length===2);
ok('saved choice kept for later',(await p.evaluate(()=>SF.p))===true);
await p.evaluate(()=>{SET.defShop.radius=10;V.loc=null;render()});await p.waitForTimeout(300);
await p.click('[data-kind=org]');await p.waitForTimeout(300);ok('organizations: no bar',!(await p.$('#sfs')));
await p.click('[data-kind=shop]');await p.waitForTimeout(300);ok('back to shops: bar and saved promo filter apply',!!(await p.$('#sfs'))&&(await order()).join(',')==='sh1');
if(process.env.SHOT){await p.setViewportSize({width:390,height:844});await p.click('[data-sf=p]');await p.selectOption('#sfs','rec');await p.click('[data-sf=a]');await p.waitForTimeout(300);await p.screenshot({path:process.env.SHOT+'/sf_bar.png'})}
console.log('errors:',errs.join('|')||'none');ok('no page errors',errs.length===0);await b.close();process.exit(0)})();
