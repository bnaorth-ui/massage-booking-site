const {chromium}=require('playwright');
const {spawn}=require('child_process');
(async()=>{
const srv=spawn('python3',['-m','http.server','8099','--directory',require('./config').serveDir()],{stdio:'ignore'});await new Promise(r=>setTimeout(r,1000));
const ORIGIN='http://localhost:8099',errs=[],calls=[];
const b=await chromium.launch(require('./config').launch);
const ctx=await b.newContext({timezoneId:'Asia/Bangkok',locale:'th-TH',userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',permissions:['notifications']});
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
await ctx.addInitScript(()=>{window.__NO_PUSH_ASK=false});
let p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));
await p.goto(ORIGIN+'/staff-app.html');await sleep(500);
await p.fill('#lph','0844444444');await p.fill('#lpw','staffpass1');await p.click('#agf .btn');
await p.waitForSelector('#pushask',{timeout:8000});
const t=await p.textContent('#pushask');
ok('iphone (not installed): install instructions shown',t.includes('เพิ่มลงในหน้าจอโฮม'));
ok('iphone: no enable button, only acknowledge',!(await p.$('#pushaskgo'))&&(await p.textContent('#pushasklater')).includes('รับทราบ'));
await p.click('#pushasklater');await sleep(200);ok('iphone: dialog closes',(await p.$('#pushask'))===null);
await b.close();srv.kill();
ok('no page errors',errs.length===0);if(errs.length)console.log(errs);
})();
