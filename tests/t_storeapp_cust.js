// แอปผู้ใช้งานในแอปจากร้านค้า: iPhone (user agent มี BNAMassageApp/ios) และ Android (/?src=twa)
// ซ่อนแถบผู้ยังไม่ล็อกอิน ปุ่มติดตั้งแอป และส่วนแนะนำเว็บ ส่วนเว็บปกติยังแสดงเหมือนเดิม
// ในแอป iPhone ลิงก์ไปเว็บอื่นเปิดนอกแอป (ผ่านปลั๊กอิน Browser ของตัวห่อแอป)
const {chromium}=require('playwright');const C=require('./config');
const ok=(n,c)=>console.log((c?'PASS ':'FAIL ')+n);const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const IOS='Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const AND='Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36';
const CAT={places:[{id:'p1',name:'ร้านหนึ่ง',type:'shop',lat:13.7,lng:100.5,open:true}],services:[],staff:[],promos:[]};
(async()=>{const b=await chromium.launch(C.launch);const errs=[];
const mk=async(ua,url,init)=>{const ctx=await b.newContext({userAgent:ua,locale:'th-TH',timezoneId:'Asia/Bangkok',viewport:{width:390,height:844}});
 await ctx.route(/^https?:/,r=>{const u=r.request().url();if(/supabase\.co/.test(u))return r.fulfill({status:200,contentType:'application/json',body:u.includes('public_catalog')?JSON.stringify(CAT):u.includes('/rpc/')?'null':'[]'});return r.abort()});
 if(init)await ctx.addInitScript(init);
 const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto(C.page('customer-booking.html')+(url||''));await sleep(1800);return p};
const st=p=>p.evaluate(()=>({guest:!!document.querySelector('.gbar'),ins:!!document.querySelector('[data-gb=ins]'),seo:(()=>{const s=document.getElementById('seo');return !!s&&!s.hidden})(),store:storeApp(),app:isApp()}));
// เว็บปกติบน iPhone Safari
let p=await mk(IOS);let s=await st(p);
ok('web (iPhone Safari): guest bar, install button and site section shown',s.guest&&s.ins&&s.seo&&s.store===''&&!s.app);
await p.context().close();
// แอป iPhone
p=await mk(IOS+' BNAMassageApp/ios');s=await st(p);
ok('iPhone app: detected as store app',s.store==='ios'&&s.app);
ok('iPhone app: no guest bar, no install button, no site section',!s.guest&&!s.ins&&!s.seo);
ok('iPhone app: bottom tabs shown for guest like home-screen app',await p.evaluate(()=>getComputedStyle(document.getElementById('tabs')).display!=='none'));
await p.context().close();
// ลิงก์ในแอป iPhone
p=await mk(IOS+' BNAMassageApp/ios',null,()=>{window.__opened=[];window.Capacitor={isNativePlatform:()=>true,Plugins:{Browser:{open:o=>{window.__opened.push(o.url);return Promise.resolve()}}}}});
await p.evaluate(()=>{const mkA=(h,t,id)=>{const a=document.createElement('a');a.href=h;if(t)a.target=t;a.id=id;a.textContent=id;document.body.appendChild(a)};mkA('https://www.google.com/maps/dir/?api=1&destination=13.7,100.5','_blank','ext');mkA('tel:021234567','','tel');mkA('#x','','hash')});
await p.click('#ext');await sleep(200);
ok('iPhone app: outside link opens with the Browser plugin, page stays',(await p.evaluate(()=>window.__opened))[0]==='https://www.google.com/maps/dir/?api=1&destination=13.7,100.5'&&(await p.url()).startsWith('file:'));
await p.evaluate(()=>{document.getElementById('tel').addEventListener('click',e=>{window.__telPrevented=e.defaultPrevented;e.preventDefault()})});
await p.click('#tel');await p.click('#hash');await sleep(100);
ok('iPhone app: tel and in-page links left alone',(await p.evaluate(()=>window.__opened.length))===1&&(await p.evaluate(()=>window.__telPrevented))===false);
await p.context().close();
// เว็บปกติ: ลิงก์ไม่ถูกดัก
p=await mk(IOS,null,()=>{window.__opened=[];window.Capacitor={Plugins:{Browser:{open:o=>{window.__opened.push(o.url)}}}}});
await p.evaluate(()=>{const a=document.createElement('a');a.href='https://example.com/';a.id='ext';a.textContent='x';a.addEventListener('click',e=>{window.__prev=e.defaultPrevented;e.preventDefault()});document.body.appendChild(a)});
await p.click('#ext');ok('web: outside links not intercepted',(await p.evaluate(()=>window.__prev))===false&&(await p.evaluate(()=>window.__opened.length))===0);
await p.context().close();
// แอป Android: เปิดด้วย ?src=twa แล้วจำไว้ตลอดรอบที่เปิดแอป
p=await mk(AND,'?src=twa');s=await st(p);
ok('Android app: detected from ?src=twa, install button and guest bar hidden',s.store==='android'&&!s.ins&&!s.guest&&!s.seo);
await p.goto(C.page('customer-booking.html'));await sleep(1500);s=await st(p);
ok('Android app: still detected after navigating without the marker (same session)',s.store==='android'&&!s.guest);
ok('Android app: marker kept in sessionStorage only',await p.evaluate(()=>sessionStorage.getItem('storeApp')==='android'&&localStorage.getItem('storeApp')===null));
await p.context().close();
// Chrome ปกติบน Android ยังเป็นเว็บ
p=await mk(AND);s=await st(p);ok('Android Chrome web: guest bar and site section shown',s.guest&&s.seo&&s.store==='');
ok('web footer links to the public delete-account page',await p.evaluate(()=>!!document.querySelector('#seo a[href="/delete-account/"]')));
await p.context().close();
// ไฟล์ตั้งค่าตัวห่อแอปต้องตรงกับตัวตรวจในหน้าเว็บ
const fs=require('fs'),path=require('path'),R=path.resolve(__dirname,'..');
const cap=JSON.parse(fs.readFileSync(path.join(R,'app-shell/ios-customer/capacitor.config.json'),'utf8')),info=JSON.parse(fs.readFileSync(path.join(R,'app-shell/ios-customer/ios-info.json'),'utf8'));
const html=fs.readFileSync(path.join(R,'customer/index.html'),'utf8'),cm=fs.readFileSync(path.join(R,'codemagic.yaml'),'utf8');
ok('wrapper: app id, name and site match the page',cap.appId==='th.or.bna.massage'&&cap.appName==='จองคิวนวด'&&cap.server.url==='https://massage-customer-bna.pages.dev/'&&html.includes('android-app:\\/\\/th\\.or\\.bna\\.massage'));
ok('wrapper: iPhone user-agent marker matches the page',cap.ios.appendUserAgent==='BNAMassageApp/ios'&&html.includes('BNAMassageApp\\/ios'));
ok('wrapper: Thai permission texts for location, camera, photos',['NSLocationWhenInUseUsageDescription','NSCameraUsageDescription','NSPhotoLibraryUsageDescription'].every(k=>/[ก-๙]/.test(info[k]||''))&&info.ITSAppUsesNonExemptEncryption===false);
ok('codemagic: same bundle id, wrapper folder, TestFlight',cm.includes('bundle_identifier: th.or.bna.massage')&&cm.includes('working_directory: app-shell/ios-customer')&&cm.includes('submit_to_testflight: true'));
ok('wrapper: 1024px icon present, no secrets in app-shell',fs.existsSync(path.join(R,'app-shell/ios-customer/assets/icon-only.png'))&&!fs.readdirSync(path.join(R,'app-shell'),{recursive:true}).some(f=>/\.(p8|p12|keystore|jks|mobileprovision)$/.test(f)));
console.log('errors:',errs.join('|')||'none');ok('no page errors',errs.length===0);await b.close();process.exit(0)})();
