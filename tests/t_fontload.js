const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch(require('./config').launch);const ok=(n,c)=>console.log((c?'PASS ':'FAIL ')+n);const errs=[];
for(const [nm,file] of [['customer','customer-booking.html'],['shop','shop-owner.html'],['staff','staff-app.html'],['admin','admin-panel.html']]){
 const ctx=await b.newContext();let fontReq=0,release;const gate=new Promise(r=>release=r);
 await ctx.route('**/*',async r=>{const u=new URL(r.request().url());if(u.protocol==='file:')return r.continue();
  if(u.host==='fonts.googleapis.com'){fontReq++;await gate;return r.fulfill({status:200,contentType:'text/css',body:'/* test */'})}
  return r.abort()});
 const p=await ctx.newPage();p.on('pageerror',e=>errs.push(nm+': '+e.message));
 await p.goto(require('./config').page(file),{waitUntil:'domcontentloaded'});
 // font stylesheet is held back: page must still have painted content (not blocked)
 await p.waitForFunction(()=>document.body&&document.body.innerText.trim().length>0,null,{timeout:4000}).catch(()=>{});
 const early=await p.evaluate(()=>({len:document.body.innerText.trim().length,media:document.querySelector('link[rel=stylesheet][href*="fonts.googleapis"]').media,ns:!!document.querySelector('noscript')}));
 ok(nm+': content renders while font CSS is still pending',early.len>0&&early.media==='print');
 release();await p.waitForFunction(()=>document.querySelector('link[rel=stylesheet][href*="fonts.googleapis"]').media==='all',null,{timeout:4000}).then(()=>ok(nm+': font CSS applied after load (media=all)',true),()=>ok(nm+': font CSS applied after load (media=all)',false));
 ok(nm+': noscript fallback present',early.ns&&await p.evaluate(()=>document.documentElement.innerHTML.includes('<noscript>')));
 await ctx.close()}
console.log('errors:',errs.join('|')||'none');await b.close();process.exit(0)})();
