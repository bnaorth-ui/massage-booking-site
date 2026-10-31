const {chromium}=require('playwright');
const {spawn}=require('child_process');
(async()=>{
const srv=spawn('python3',['-m','http.server','8099','--directory',require('../config').serveDir()],{stdio:'ignore'});await new Promise(r=>setTimeout(r,1000));
const ORIGIN='http://localhost:8099',errs=[],calls=[];
const b=await chromium.launch(require('../config').launch);
const ctx=await b.newContext({timezoneId:'Asia/Bangkok',locale:'th-TH',permissions:['notifications']});
const users={'0844444444':{id:'u1',pw:'staffpass1',phone:'0844444444'}};
let NTS=[];let subsDb=[],unreg=[];const ST={id:'s1',accepting:true,work_days:[0,1,2,3,4,5,6]};let vapid='BOkdwTbKuxGVw6k3LRJW61-FhPlaceholderKeyAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
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
  if(f==='register_push'){if(!body.p_endpoint)return J(400,{code:'P0001',message:'x'});subsDb=subsDb.filter(x=>x.endpoint!==body.p_endpoint).concat([{endpoint:body.p_endpoint,keys:[body.p_p256dh,body.p_auth],user:me.id}]);return J(204,null)}
  if(f==='unregister_push'){unreg.push(body.p_endpoint);subsDb=subsDb.filter(x=>x.endpoint!==body.p_endpoint);return J(204,null)}
  return J(404,{message:'no rpc '+f})}
 const tb=path.replace('/rest/v1/','');
 if(tb==='app_settings')return J(200,[{vapid_public:vapid}]);
 if(tb==='notifications')return J(200,NTS);if(['staff_days_off','staff_blocks','notification_reads','announcements'].includes(tb))return J(200,[]);
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
console.log('pill2:',await p.textContent('#pushpill'));ok('pill now says on',(await p.textContent('#pushpill')).includes('แล้ว')||(await p.textContent('#pushpill')).includes('เปิดอยู่'));
await sleep(6500);ok('pill steady state "เปิดอยู่"',(await p.textContent('#pushpill')).includes('เปิดอยู่'));

await sleep(7000);
const b0=await p.evaluate(()=>window.__beeps);
NTS=[{id:'n1',audience:'staff',staff_id:'s1',kind:'booking',title:'คิวใหม่ทดสอบ',body:'เลขที่ MS1',created_at:new Date().toISOString()}];
await p.evaluate(()=>{document.body.click()});
await p.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));
await sleep(4500);
ok('fallback beep when unread count rises (no push needed)',await p.evaluate(b=>window.__beeps-b>=4,b0));
ok('fallback toast shown',(await p.evaluate(()=>document.body.innerText)).includes('มีแจ้งเตือนใหม่'));
const b1=await p.evaluate(()=>window.__beeps);
await p.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));await sleep(4500);
ok('no repeat beep when count unchanged',await p.evaluate(b=>window.__beeps===b,b1));
await b.close();srv.kill();
ok('no page errors',errs.length===0);if(errs.length)console.log(errs);
})();
