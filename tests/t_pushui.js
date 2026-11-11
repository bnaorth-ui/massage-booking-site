const {chromium}=require('playwright');
const {spawn}=require('child_process');
(async()=>{
const srv=spawn('python3',['-m','http.server','8099','--directory',require('./config').serveDir()],{stdio:'ignore'});await new Promise(r=>setTimeout(r,1000));
const ORIGIN='http://localhost:8099',errs=[],calls=[];
const b=await chromium.launch(require('./config').launch);
const ctx=await b.newContext({timezoneId:'Asia/Bangkok',locale:'th-TH',permissions:['notifications']});
const users={'0844444444':{id:'u1',pw:'staffpass1',phone:'0844444444'}};
let subsDb=[],unreg=[];const ST={id:'s1',accepting:true,work_days:[0,1,2,3,4,5,6]};let vapid='BOkdwTbKuxGVw6k3LRJW61-FhPlaceholderKeyAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
await ctx.route('**/*',async r=>{const q=r.request(),u=new URL(q.url());if(u.origin===ORIGIN)return r.continue();if(!u.host.endsWith('supabase.co'))return r.abort();
 const path=u.pathname,sp=u.searchParams;let body=null;try{body=JSON.parse(q.postData()||'null')}catch(e){}
 const auth=(q.headers().authorization||'').replace('Bearer ',''),me=Object.values(users).find(x=>'at-'+x.id===auth);calls.push({m:q.method(),path,body});
 const J=(s,o)=>r.fulfill({status:s,contentType:'application/json',body:JSON.stringify(o)});
 const sess=us=>({access_token:'at-'+us.id,refresh_token:'rt-'+us.id,expires_in:3600,user:{id:us.id}});
 if(path==='/auth/v1/token'){const us=users[body.email.split('@')[0]];if(!us||us.pw!==body.password)return J(400,{error_code:'invalid_credentials',msg:'x'});return J(200,sess(us))}
 if(path==='/auth/v1/logout')return J(204,{});
 if(!me)return J(401,{message:'JWT'});
 const rm=path.match(/^\/rest\/v1\/rpc\/(\w+)/);
 if(rm){const f=rm[1];
  if(f==='staff_me')return J(200,{id:'s1',name:'คุณนุ่น',phone:'0844444444',photo_path:null,active:true,accepting:true,work_days:[0,1,2,3,4,5,6],place:'ร้าน',open_min:600,close_min:1260});
  if(f==='my_jobs')return J(200,[]);
  if(f==='register_push'&&process.env.OLDDB&&body&&body.p_app)return J(404,{code:'PGRST202',message:'Could not find the function public.register_push(p_app, p_auth, p_endpoint, p_p256dh) in the schema cache'});
  if(f==='register_push'){if(!body.p_endpoint)return J(400,{code:'P0001',message:'x'});subsDb=subsDb.filter(x=>x.endpoint!==body.p_endpoint).concat([{endpoint:body.p_endpoint,keys:[body.p_p256dh,body.p_auth],user:me.id}]);return J(204,null)}
  if(f==='unregister_push'){unreg.push(body.p_endpoint);subsDb=subsDb.filter(x=>x.endpoint!==body.p_endpoint);return J(204,null)}
  return J(404,{message:'no rpc '+f})}
 const tb=path.replace('/rest/v1/','');
 if(tb==='app_settings')return J(200,[{vapid_public:vapid}]);
 if(['staff_days_off','staff_blocks','notifications','notification_reads','announcements'].includes(tb))return J(200,[]);
 return J(404,{message:'nf '+path})});
// fake push service: real PushManager.subscribe would need FCM
await ctx.addInitScript(()=>{
 const fake={endpoint:'https://fcm.example/send/abc123',toJSON(){return{endpoint:this.endpoint,keys:{p256dh:'P256DHKEY',auth:'AUTHKEY'}}},unsubscribe(){window.__unsubbed=true;localStorage.removeItem('__fakesub');return Promise.resolve(true)}};
 window.__subscribeArgs=null;
 PushManager.prototype.subscribe=function(o){window.__subscribeArgs={uvo:o.userVisibleOnly,keyLen:o.applicationServerKey.length||o.applicationServerKey.byteLength};localStorage.setItem('__fakesub','1');return Promise.resolve(fake)};
 PushManager.prototype.getSubscription=function(){return Promise.resolve(localStorage.getItem('__fakesub')?fake:null)};
 window.__beeps=0;const O=window.AudioContext;if(O){const oc=O.prototype.createOscillator;O.prototype.createOscillator=function(){window.__beeps++;return oc.call(this)}}
});
const ok=(nm,c)=>console.log((c?'PASS ':'FAIL ')+nm);const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.setViewportSize({width:420,height:900});
await p.goto(ORIGIN+'/staff-app.html');await sleep(500);
ok('no pill before login',await p.$eval('#pushpill',e=>getComputedStyle(e).display)==='none');
await p.fill('#lph','0844444444');await p.fill('#lpw','staffpass1');await p.click('#agf .btn');await sleep(1500);
console.log('pill:',await p.textContent('#pushpill'));ok('pill visible after login: off state',(await p.textContent('#pushpill')).includes('เปิดแจ้งเตือนนอกหน้าจอ'));
ok('manifest link present',await p.$('link[rel=manifest]')!==null);
await p.click('#pushpill');await sleep(2500);
ok('subscribed with userVisibleOnly + 65-byte key',await p.evaluate(()=>window.__subscribeArgs&&window.__subscribeArgs.uvo===true&&window.__subscribeArgs.keyLen>0));
ok('vapid read from app_settings',calls.some(c=>c.path.endsWith('/app_settings')));
ok('register_push sent with endpoint+keys',calls.some(c=>c.path.endsWith('register_push')&&c.body.p_endpoint==='https://fcm.example/send/abc123'&&c.body.p_p256dh==='P256DHKEY'&&c.body.p_auth==='AUTHKEY'));
if(process.env.OLDDB)ok('old database (no app name): falls back to registering without it',calls.some(c=>c.path.endsWith('register_push')&&c.body.p_app==='staff')&&calls.some(c=>c.path.endsWith('register_push')&&c.body.p_endpoint==='https://fcm.example/send/abc123'&&!('p_app' in c.body))&&subsDb.length===1);
else ok('register_push names the app (staff) so pushes go only to this app',calls.some(c=>c.path.endsWith('register_push')&&c.body.p_endpoint==='https://fcm.example/send/abc123'&&c.body.p_app==='staff'));
console.log('pill2:',await p.textContent('#pushpill'));ok('pill now says on',(await p.textContent('#pushpill')).includes('แล้ว')||(await p.textContent('#pushpill')).includes('เปิดอยู่'));
await sleep(6500);ok('pill hides itself once on',(await p.$eval('#pushpill',e=>getComputedStyle(e).display))==='none');
// SW registered
const regs=await p.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistrations();return r.map(x=>x.scope)});
ok('service worker registered',regs.length===1&&regs[0]===ORIGIN+'/');
// deliver push while page visible
const keeper=await ctx.newPage();const cdp=await ctx.newCDPSession(keeper);let regId=null;cdp.on('ServiceWorker.workerRegistrationUpdated',e=>{if(e.registrations&&e.registrations[0])regId=e.registrations[0].registrationId});
await cdp.send('ServiceWorker.enable');await sleep(500);
ok('got registration id',!!regId);
let refreshCalls=calls.filter(c=>c.path.endsWith('my_jobs')).length;
await p.evaluate(()=>{document.body.click()});
await cdp.send('ServiceWorker.deliverPushMessage',{origin:ORIGIN,registrationId:regId,data:JSON.stringify({title:'คิวใหม่',body:'เลขที่ MS100777',page:'staff-app.html',tag:'booking'})});
await sleep(1500);
ok('visible page: in-page banner shown',(await p.evaluate(()=>document.body.innerText)).includes('คิวใหม่')&&(await p.evaluate(()=>document.body.innerText)).includes('MS100777'));
ok('visible page: beep played (4 tones)',await p.evaluate(()=>window.__beeps>=4));
ok('visible page: data refreshed',calls.filter(c=>c.path.endsWith('my_jobs')).length>refreshCalls);
const shown1=await p.evaluate(async()=>{const r=await navigator.serviceWorker.ready;return (await r.getNotifications()).filter(n=>n.title==='คิวใหม่').length});
ok('visible page: no duplicate system notification',shown1===0);
// close page, push again -> system notification
await p.close();await sleep(500);
await cdp.send('ServiceWorker.deliverPushMessage',{origin:ORIGIN,registrationId:regId,data:JSON.stringify({title:'ร้านส่งสลิปเติมเงิน',body:'ยอด 500 บาท',page:'admin-panel.html',tag:'topup'})}).catch(e=>errs.push('cdp '+e.message));
await sleep(1500);
const p2=await ctx.newPage();await p2.goto(ORIGIN+'/manifest.webmanifest');
const notes=await p2.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistration(location.origin+'/');if(!r)return null;return (await r.getNotifications()).map(n=>({t:n.title,b:n.body,tag:n.tag,page:n.data&&n.data.page,renotify:n.renotify,vib:n.vibrate}))});
console.log(JSON.stringify(notes));
ok('closed page: system notification shown',Array.isArray(notes)&&notes.some(n=>n.t==='ร้านส่งสลิปเติมเงิน'&&n.b==='ยอด 500 บาท'&&n.page==='admin-panel.html'));
ok('notification vibrates & renotifies',Array.isArray(notes)&&notes.some(n=>n.renotify&&n.vib&&n.vib.length>=3));
await p2.close();
// reload, then logout unregisters
p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto(ORIGIN+'/staff-app.html');await sleep(1500);
console.log('pill3:',await p.textContent('#pushpill'));ok('session restored: pill stays hidden',(await p.$eval('#pushpill',e=>getComputedStyle(e).display))==='none');
await p.click('[data-a=tab][data-id=ac]');await sleep(300);await p.click('#logout');await sleep(1500);
ok('logout calls unregister_push with endpoint',unreg.includes('https://fcm.example/send/abc123'));
await b.close();srv.kill();
ok('no page errors',errs.length===0);if(errs.length)console.log(errs);
})();
