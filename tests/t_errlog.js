// ตัวรายงานข้อผิดพลาดจากหน้าเว็บ (errlog.js) ทั้ง 4 แอป: ส่งเฉพาะข้อมูลทางเทคนิค ไม่มีข้อมูลส่วนตัว จำกัด 5 ครั้งต่อการเปิดหน้า
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const ok=(n,c)=>console.log((c?'PASS ':'FAIL ')+n);
const CAT={places:[],services:[],service_places:[],staff:[],staff_services:[],place_staff:[],days_off:[],promos:[],promo_services:[],overrides:[],settings:{shop_radius_km:10,org_radius_km:10},ann:[]};
(async()=>{const b=await chromium.launch(require('./config').launch);
// ไฟล์ errlog.js ต้องเหมือนกันทุกแอป
const R=path.resolve(__dirname,'..');const E=['customer','shop','staff','admin'].map(a=>fs.readFileSync(path.join(R,a,'errlog.js'),'utf8'));
ok('errlog.js identical in all 4 apps',E.every(x=>x===E[0]));
for(const [app,file] of [['customer','customer-booking.html'],['shop','shop-owner.html'],['staff','staff-app.html'],['admin','admin-panel.html']]){
 const ctx=await b.newContext({timezoneId:'Asia/Bangkok',locale:'th-TH'});const logs=[],errs=[];
 await ctx.route('**/*',r=>{const q=r.request(),u=new URL(q.url());if(u.protocol==='file:')return r.continue();if(!u.host.endsWith('supabase.co'))return r.abort();
  const J=(s,o)=>r.fulfill({status:s,contentType:'application/json',body:JSON.stringify(o)});
  if(u.pathname==='/rest/v1/rpc/log_client_error'){logs.push({body:JSON.parse(q.postData()||'{}'),auth:q.headers().authorization||'',apikey:q.headers().apikey||''});return r.fulfill({status:204,body:''})}
  if(u.pathname==='/rest/v1/rpc/public_catalog')return J(200,CAT);
  if(u.pathname==='/rest/v1/rpc/admin_exists')return J(200,true);
  if(u.pathname.startsWith('/rest/v1/rpc/'))return J(200,null);
  return J(200,[])});
 const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));
 await p.goto(require('./config').page(file));await p.waitForTimeout(700);
 const L=app+': ';
 ok(L+'ErrLog loaded and attached',await p.evaluate(()=>!!window.ErrLog));
 ok(L+'no report on a clean load',logs.length===0);
 // ข้อผิดพลาดสคริปต์ (มีเบอร์โทรและอีเมลในข้อความ)
 await p.evaluate(()=>setTimeout(()=>{throw new Error('boom 0812345678 a.b@x.com')},0));await p.waitForTimeout(400);
 const x=logs[0]&&logs[0].body||{};
 ok(L+'js error reported with app/kind',logs.length===1&&x.p_app===app&&x.p_kind==='js');
 ok(L+'phone and email removed from message',x.p_message==='Error: boom # @'&&!/\d{6,}|@x\.com/.test(JSON.stringify(x)));
 ok(L+'version from meta app-version',x.p_version===(await p.evaluate(()=>document.querySelector('meta[name="app-version"]').content)));
 ok(L+'device summary present, no full user agent',typeof x.p_device==='string'&&x.p_device.length>0&&x.p_device.length<=40&&!/Mozilla/.test(x.p_device));
 ok(L+'sent with public key only (no user token)',logs[0].apikey.length>10&&logs[0].auth==='');
 ok(L+'only the 7 technical fields are sent',Object.keys(x).sort().join()==='p_app,p_device,p_kind,p_menu,p_message,p_source,p_version');
 // ข้อผิดพลาดเดิมซ้ำไม่ส่งซ้ำ
 await p.evaluate(()=>setTimeout(()=>{throw new Error('boom 0812345678 a.b@x.com')},0));await p.waitForTimeout(300);
 ok(L+'same error not sent twice in one page load',logs.length===1);
 // ไม่นับ: เน็ตหลุด, Script error, ยังไม่ล็อกอิน, คำตอบเซิร์ฟเวอร์ (มี status)
 await p.evaluate(()=>{setTimeout(()=>{throw new Error('NET')},0);Promise.reject(new Error('NOSESS'));Promise.reject(Object.assign(new Error('ยกเลิกไม่ได้'),{status:400}));Promise.reject(new TypeError('Failed to fetch'))});await p.waitForTimeout(400);
 ok(L+'noise ignored (NET, NOSESS, server answer, Failed to fetch)',logs.length===1);
 // promise ที่ไม่มีคนรับ
 await p.evaluate(()=>{Promise.reject(new Error('ไม่มีคนรับผล'))});await p.waitForTimeout(300);
 ok(L+'unhandled promise reported',logs.length===2&&logs[1].body.p_kind==='promise'&&logs[1].body.p_message==='ไม่มีคนรับผล');
 // เซิร์ฟเวอร์: 5xx และรหัส SQL ผิดเท่านั้น ตัดส่วนค้นหาออก (อาจมีรหัส)
 await p.evaluate(()=>{ErrLog.server('/rest/v1/rpc/create_booking?id=eq.123456789',500,'');ErrLog.server('/rest/v1/rpc/x',400,'P0001');ErrLog.server('/rest/v1/places',401,'');ErrLog.server('/rest/v1/rpc/y',404,'PGRST202')});await p.waitForTimeout(300);
 const sv=logs.slice(2).map(z=>z.body);
 ok(L+'server: 500 and PGRST202 reported, business errors not',sv.length===2&&sv[0].p_kind==='server'&&sv[0].p_message==='HTTP 500 /rest/v1/rpc/create_booking'&&sv[1].p_message==='HTTP 404 PGRST202 /rest/v1/rpc/y');
 // เพดาน 5 ครั้งต่อการเปิดหน้า
 await p.evaluate(()=>{for(let i=0;i<4;i++)setTimeout(()=>{throw new Error('ปัญหาที่ '+i)},0)});await p.waitForTimeout(400);
 ok(L+'at most 5 reports per page load',logs.length===5);
 ok(L+'no page errors from the reporter itself',errs.filter(m=>!/boom|NET|NOSESS|ยกเลิกไม่ได้|Failed to fetch|ไม่มีคนรับผล|ปัญหาที่/.test(m)).length===0);
 await ctx.close();
}
// ออฟไลน์: ไม่ส่งรายงาน
{const ctx=await b.newContext();const logs=[];await ctx.route('**/*',r=>{const u=new URL(r.request().url());if(u.protocol==='file:')return r.continue();if(u.pathname.endsWith('/log_client_error'))logs.push(1);return r.fulfill({status:200,contentType:'application/json',body:u.pathname.endsWith('public_catalog')?JSON.stringify(CAT):'[]'})});
 const p=await ctx.newPage();await p.goto(require('./config').page('customer-booking.html'));await p.waitForTimeout(500);
 await ctx.setOffline(true);await p.evaluate(()=>setTimeout(()=>{throw new Error('ตอนออฟไลน์')},0));await p.waitForTimeout(300);
 ok('offline: nothing sent',logs.length===0);await ctx.close()}
// ข้อผิดพลาดก่อน attach ถูกเก็บไว้แล้วส่งทีหลัง
{const ctx=await b.newContext();const logs=[];await ctx.route('**/*',r=>{const u=new URL(r.request().url());if(u.protocol==='file:')return r.continue();if(u.pathname.endsWith('/log_client_error'))logs.push(JSON.parse(r.request().postData()));return r.fulfill({status:200,contentType:'application/json',body:'null'})});
 const tf=require('./config').tmp('errlog_q.html');fs.writeFileSync(tf,'<!doctype html><meta charset="utf-8"><meta name="app-version" content="9.9"><script src="'+'file://'+path.join(R,'customer','errlog.js')+'"></script>');
 const p=await ctx.newPage();await p.goto('file://'+tf);
 await p.evaluate(()=>setTimeout(()=>{throw new Error('ก่อนเชื่อม')},0));await p.waitForTimeout(200);
 ok('before attach: queued, not sent',logs.length===0);
 await p.evaluate(()=>ErrLog.attach({app:'shop',url:'https://dwdnmfwepydyweeqfdxn.supabase.co',key:'test-key-xxxxxxxx',menu:()=>'wal'}));await p.waitForTimeout(300);
 ok('after attach: queued report sent with version',logs.length===1&&logs[0].p_message==='Error: ก่อนเชื่อม'&&logs[0].p_version==='9.9'&&logs[0].p_app==='shop');
 await ctx.close()}
await b.close();process.exit(0)})();
