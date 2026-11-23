// เว็บประชาสัมพันธ์ (site/): หน้าแรก รวมข่าวและบทความ หน้าบทความ ลิงก์แชร์ หน้าไม่พบ และการใช้งานกับโปรแกรมอ่านหน้าจอ
// เปิดเว็บเซิร์ฟเวอร์ชั่วคราว (พอร์ตว่างที่ระบบเลือกให้) ส่ง index.html ให้ทุกลิงก์ที่ไม่ใช่ไฟล์ เหมือน Cloudflare Pages
// ข้อมูลบทความจำลอง ไม่แตะ Supabase จริง (ตรวจ functions ของ Cloudflare ใน t_site_fn.js)
const {chromium}=require('playwright');const C=require('./config');const http=require('http'),fs=require('fs'),path=require('path');
const W=C.waitFor;const ok=(n,c)=>console.log((c?'PASS ':'FAIL ')+n);const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const ROOT=path.resolve(__dirname,'..','site');
const MIME={'.html':'text/html; charset=utf-8','.png':'image/png','.js':'text/javascript'};
const srv=http.createServer((q,s)=>{const u=decodeURIComponent(q.url.split('?')[0]);let f=path.join(ROOT,u);
 if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory())f=path.join(ROOT,'index.html');
 s.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(s)});
const day=i=>{const d=new Date(Date.UTC(2026,10,17-i));return d.toISOString().slice(0,10)};
function mk(){const A=[];
 A.push({no:1,kind:'news',title:'อบรมหมอนวดรุ่นใหม่',summary:'เปิดรับสมัครแล้ววันนี้',body:'ย่อหน้าแรก\nบรรทัดที่สอง\n\n## หัวข้อย่อย\n- ข้อหนึ่ง\n- ข้อสอง\n\nอ่านเพิ่มที่ https://bna.or.th/info.\n\nสำหรับบริษัท ดูที่ https://massage-home-bna.pages.dev/company/\n\nเกี่ยวกับ [กรมการจัดหางาน](https://www.doe.go.th/) และเรื่อง https://massage-home-bna.pages.dev/news/19\n\n[รูป: ภาพหมอนวดในห้องอบรม](place-images/x/site-a.jpg)\n[รูป](place-images/x/site-b.jpg)',cover_path:'place-images/00000000-0000-0000-0000-000000000000/site-a.jpg',cover_alt:'ภาพหมอนวดกำลังอบรม',day:day(3),pinned:false,active:true});
 A.push({no:2,kind:'article',title:'ประโยชน์ของการนวดไทย <img src=x onerror=window.XSS=1>',summary:'',body:'<script>window.XSS=2</script>ข้อความ',cover_path:null,cover_alt:'',day:day(5),pinned:true,active:true});
 A.push({no:3,kind:'news',title:'ร่างที่ยังไม่เผยแพร่',summary:'',body:'',cover_path:null,cover_alt:'',day:day(0),pinned:false,active:false});
 A.push({no:19,kind:'work',title:'นวดให้พนักงานบริษัท ก',summary:'วันสุขภาพพนักงาน',body:'x',cover_path:'place-images/00000000-0000-0000-0000-000000000000/site-w.jpg',cover_alt:'หมอนวดกำลังนวดพนักงาน',day:day(40),pinned:false,active:true});
 for(let i=4;i<=18;i++)A.push({no:i,kind:'news',title:'ข่าวลำดับ '+i,summary:'สรุป '+i,body:'เนื้อหา '+i,cover_path:null,cover_alt:'',day:day(10+i),pinned:false,active:true});
 return A}
let DB=mk(),FAIL=false,REQ=[];
const noF=(r,v)=>v.startsWith('in.(')?(L=>r.filter(a=>L.includes(a.no)))(v.slice(4,-1).split(',').map(Number)):r.filter(a=>a.no===+v.slice(3));
const kindF=(r,v)=>v.startsWith('neq.')?r.filter(a=>a.kind!==v.slice(4)):r.filter(a=>a.kind===v.slice(3));
const adjF=(r,p)=>{const o=p.get('or');if(!o)return r;const m=/^\(day\.(lt|gt)\.([\d-]+),and\(day\.eq\.[\d-]+,no\.(?:lt|gt)\.(\d+)\)\)$/.exec(o);if(!m)throw new Error('bad or '+o);const lt=m[1]==='lt',d=m[2],n=+m[3];r=r.filter(a=>lt?(a.day<d||(a.day===d&&a.no<n)):(a.day>d||(a.day===d&&a.no>n)));const asc=(p.get('order')||'').startsWith('day.asc');return r.sort((a,b)=>(asc?1:-1)*((a.day<b.day?-1:a.day>b.day?1:0)||(a.no-b.no)))};
function q(u){const x=new URL(u),p=x.searchParams;let r=DB.slice();
 if(p.get('active')==='eq.true')r=r.filter(a=>a.active);
 if(p.get('kind'))r=kindF(r,p.get('kind'));
 if(p.get('no'))r=noF(r,p.get('no'));
 if(p.get('or'))r=adjF(r,p);else r.sort((a,b)=>(b.pinned-a.pinned)||(b.day<a.day?-1:b.day>a.day?1:0)||(b.no-a.no));
 const off=+(p.get('offset')||0),lim=+(p.get('limit')||1000);return r.slice(off,off+lim)}
(async()=>{await new Promise(r=>srv.listen(0,'127.0.0.1',r));const BASE='http://127.0.0.1:'+srv.address().port;
const b=await chromium.launch(C.launch);const errs=[];
const ctx=await b.newContext({locale:'th-TH'});
await ctx.route(/^https?:/,r=>{const u=r.request().url();
 if(u.startsWith(BASE))return r.continue();
 if(/supabase\.co\/rest\/v1\/rpc\/public_contact/.test(u))return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({name:'สมาคมวิทยากรฝึกอาชีพคนตาบอด',phone:'0989983654',hours:'จันทร์ - ศุกร์ 09:00 - 17:00 น.',email:'info@example.org',org_rate:400})});
 if(/supabase\.co\/rest\/v1\/site_articles/.test(u)){REQ.push(u);if(FAIL)return r.fulfill({status:500,body:'{}'});return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(q(u))})}
 if(/supabase\.co\/storage/.test(u))return r.fulfill({status:200,contentType:'image/png',body:fs.readFileSync(path.join(ROOT,'icon-192.png'))});
 return r.abort()});
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));
const h1=()=>p.evaluate(()=>{const h=document.querySelectorAll('#view h1');return{n:h.length,t:h[0]&&h[0].textContent,focus:document.activeElement===h[0]}});

// หน้าแรก
await p.goto(BASE+'/');await p.waitForSelector('#latest .card');
let H=await h1();ok('home: one h1 and it has focus',H.n===1&&H.focus&&/คนตาบอด/.test(H.t));
const latest=await p.$$eval('#latest .card h3',a=>a.map(x=>x.textContent));
ok('home: 6 latest, pinned first, drafts hidden',latest.length===6&&/ประโยชน์/.test(latest[0])&&!latest.some(t=>/ร่าง/.test(t)));
ok('home: list query only asks for published items',REQ.every(u=>u.includes('active=eq.true')));
ok('home: book / shop / staff links go to the existing apps',await p.evaluate(()=>['massage-customer-bna.pages.dev/','massage-shop-bna.pages.dev/reg/','massage-staff-bna.pages.dev/apply/'].every(u=>!!document.querySelector('a[href="https://'+u+'"]'))));
ok('home: contact phone from public_contact is a tel: link',await W(()=>true)&&await p.evaluate(()=>{const a=document.querySelector('#cPhone a');return !!a&&a.getAttribute('href')==='tel:0989983654'&&a.textContent==='098-998-3654'}));
ok('home: hours shown',(await p.textContent('#cHours')).includes('09:00'));
ok('home: tab title',(await p.title())==='จ้างงานคนตาบอด มาตรา 33, 35 และบริการนวดโดยหมอนวดตาบอด | สมาคมวิทยากรฝึกอาชีพคนตาบอด');
ok('contact order: name, phone, email, hours',await p.evaluate(()=>[...document.querySelectorAll('#contact p[id]:not(#copy)')].map(x=>x.id).join(',')==='cName,cPhone,cEmail,cHours'));
ok('visitor stats: Cloudflare Web Analytics beacon with token and spa on',await p.evaluate(()=>{const x=document.querySelector('script[src="https://static.cloudflareinsights.com/beacon.min.js"]');if(!x)return false;const c=JSON.parse(x.getAttribute('data-cf-beacon'));return x.defer&&c.token==='84e868c35fa94960abe34feda073bcaf'&&c.spa===true}));
ok('footer: Facebook link uses the same address as SV.FB_PAGE (one place to change)',await p.evaluate(()=>{const a=[...document.querySelectorAll('#contact a')].find(x=>/เพจ Facebook ของสมาคม/.test(x.textContent));return !!a&&a.href===window.SV.FB_PAGE&&a.target==='_blank'}));
ok('footer: link named เว็บไซต์หลักของสมาคม goes to bna.or.th (address not shown)',await p.evaluate(()=>{const a=document.querySelector('#contact a[href="https://bna.or.th/"]');return !!a&&a.textContent==='เว็บไซต์หลักของสมาคม'&&!document.getElementById('contact').textContent.includes('bna.or.th')}));
ok('home: order hero > company > works > latest; works section shows work item, latest has no work items',await p.waitForFunction(()=>{const ids=[...document.querySelectorAll('#view section h2')].map(h=>h.id);const w=document.querySelectorAll('#works .card').length;const lw=[...document.querySelectorAll('#latest .card .tag')].some(t=>t.textContent==='ผลงานบริการ');return ids.slice(0,3).join()==='hBiz,hWorks,hLatest'&&w===1&&!lw},null,{timeout:4000}).then(()=>true,()=>false));
ok('home: email from public_contact is a mailto link',await p.evaluate(()=>{const a=document.querySelector('#cEmail a');return !!a&&a.getAttribute('href')==='mailto:info@example.org'&&a.textContent==='info@example.org'}));
ok('footer: copyright with Thai year and association name',(await p.textContent('#copy'))==='© '+(new Date().getFullYear()+543)+' สมาคมวิทยากรฝึกอาชีพคนตาบอด สงวนลิขสิทธิ์');
ok('main nav order: หน้าแรก, ข่าวและบทความ, บริษัทและหน่วยงาน, จองนวด, ติดต่อเรา',await p.evaluate(()=>[...document.querySelectorAll('nav.main a')].map(a=>a.textContent).join()==='หน้าแรก,ข่าวและบทความ,บริษัทและหน่วยงาน,จองนวด,ติดต่อเรา'));
ok('a11y: skip link and labelled main nav',await p.evaluate(()=>!!document.querySelector('a.skip[href="#main"]')&&document.querySelector('nav.main').getAttribute('aria-label')==='เมนูหลัก'&&document.querySelector('nav.main a[aria-current="page"]').textContent==='หน้าแรก'));
ok('a11y: every image has an alt attribute',await p.evaluate(()=>[].every.call(document.images,i=>i.hasAttribute('alt'))));
ok('xss: title with html shown as text',await p.evaluate(()=>!window.XSS&&!document.querySelector('#latest img[src="x"]')));

// เปิดบทความจากการ์ด (ไม่โหลดหน้าใหม่)
await p.evaluate(()=>window.__same=1);
await p.click('#latest a[href="/news/1"]');await p.waitForSelector('article.post h1');
H=await h1();ok('post: url /news/1, same page (no reload), h1 focused',p.url()===BASE+'/news/1'&&await p.evaluate(()=>window.__same===1)&&H.focus&&H.t==='อบรมหมอนวดรุ่นใหม่');
ok('post: tab title uses article title',(await p.title()).startsWith('อบรมหมอนวดรุ่นใหม่ | สมาคม'));
const body=await p.innerHTML('.body');
ok('post: paragraphs, line break, sub-heading, list',/<p>ย่อหน้าแรก<br>บรรทัดที่สอง<\/p>/.test(body)&&/<h2>หัวข้อย่อย<\/h2>/.test(body)&&/<ul><li>ข้อหนึ่ง<\/li><li>ข้อสอง<\/li><\/ul>/.test(body));
ok('post: url becomes a link (trailing dot left out), opens new window with notice',await p.evaluate(()=>{const a=document.querySelector('.body a');return !!a&&a.getAttribute('href')==='https://bna.or.th/info'&&a.target==='_blank'&&/หน้าต่างใหม่/.test(a.textContent)&&/nofollow/.test(a.rel)}));
ok('post: cover has the alt text written by admin',await p.evaluate(()=>{const i=document.querySelector('img.cover');return !!i&&i.alt==='ภาพหมอนวดกำลังอบรม'&&i.src.includes('/storage/v1/object/public/place-images/00000000-0000-0000-0000-000000000000/site-a.jpg')}));
await p.goto(BASE+'/news/');await p.waitForSelector('#list .card');
ok('cards: title heading first, then type + date, then summary (screen reader hears type/date after title)',await p.evaluate(()=>[...document.querySelectorAll('#list .card .in')].every(x=>{const c=[...x.children].map(e=>e.tagName==='DIV'?'meta':e.tagName);return /^H[23]$/.test(c[0])&&c[1]==='meta'&&(c.length===2||c[2]==='P')})));
await p.goBack();await p.waitForSelector('.lead');
ok('post: summary and date (Thai)',(await p.textContent('.lead'))==='เปิดรับสมัครแล้ววันนี้'&&/พ\.ศ\.|2569/.test(await p.textContent('article .meta')));
ok('post: share links to LINE and Facebook carry the page url',await p.evaluate(u=>{const l=[].map.call(document.querySelectorAll('.share a'),a=>a.href);return l.some(h=>h.startsWith('https://social-plugins.line.me/lineit/share?url='+encodeURIComponent(u)))&&l.some(h=>h.startsWith('https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(u)))},BASE+'/news/1'));
await ctx.grantPermissions(['clipboard-read','clipboard-write'],{origin:BASE});
await p.click('button[data-copy]');
ok('post: copy link button copies and announces',await W(async()=>true)&&await p.waitForFunction(()=>document.getElementById('live').textContent==='คัดลอกลิงก์แล้ว',null,{timeout:4000}).then(()=>true,()=>false)&&(await p.evaluate(()=>navigator.clipboard.readText()))===BASE+'/news/1');
ok('post: breadcrumb starts with หน้าแรก',await p.evaluate(()=>[...document.querySelectorAll('.crumb a')].map(a=>a.textContent+'>'+a.getAttribute('href')).join('|')==='หน้าแรก>/|ข่าวและบทความ>/news/|ข่าวและกิจกรรม>/news/?k=news'));
ok('post: prev/next in same type (news): older = ข่าวลำดับ 4, no newer news',await p.waitForFunction(()=>{const n=document.getElementById('pn');if(!n||n.hasAttribute('data-pending'))return false;const pv=n.querySelector('a.pn-prev'),nx=n.querySelector('a.pn-next');return !!pv&&pv.getAttribute('href')==='/news/4'&&pv.textContent==='← เรื่องก่อนหน้าข่าวลำดับ 4'&&!nx&&n.getAttribute('aria-label')==='เรื่องอื่นในข่าวและกิจกรรม'},null,{timeout:4000}).then(()=>true,()=>false));
ok('post: back links to news list and home',await p.evaluate(()=>[...document.querySelectorAll('.backs a')].map(a=>a.textContent+'>'+a.getAttribute('href')).join('|')==='กลับไปหน้าข่าวและบทความ>/news/|กลับหน้าแรก>/'));
await p.click('#pn a.pn-prev');await p.waitForFunction(()=>document.querySelector('#view h1')&&document.querySelector('#view h1').textContent==='ข่าวลำดับ 4',null,{timeout:4000});
ok('prev link opens older story in page; it now has next = the first story',p.url()===BASE+'/news/4'&&await p.waitForFunction(()=>{const nx=document.querySelector('#pn a.pn-next');return !!nx&&nx.getAttribute('href')==='/news/1'},null,{timeout:4000}).then(()=>true,()=>false));
await p.click('.backs a[href="/"]');ok('กลับหน้าแรก goes home',await p.waitForSelector('#latest .card',{timeout:5000}).then(()=>true,()=>false)&&p.url()===BASE+'/');
await p.goto(BASE+'/news/1');await p.waitForSelector('article.post h1');
ok('post: nav marks ข่าวและบทความ',await p.evaluate(()=>document.querySelector('nav.main a[aria-current="page"]').textContent==='ข่าวและบทความ'));

ok('post: link to this site opens in the same tab (no new-window notice), link to other sites opens new window',await p.evaluate(()=>{const a=[...document.querySelectorAll('.body a')];const own=a.find(x=>x.textContent==='หน้าบริษัทและหน่วยงาน'),ext=a.find(x=>x.getAttribute('href')==='https://bna.or.th/info');return !!own&&own.getAttribute('href')==='/company/'&&!own.target&&own.hasAttribute('data-nav')&&!/หน้าต่างใหม่/.test(own.textContent)&&!!ext&&ext.target==='_blank'}));
await p.click('.body a[href="/company/"]');
ok('own-site link in article goes to company page in the same tab; back returns to the article',await p.waitForSelector('#hLaw',{timeout:5000}).then(()=>true,()=>false)&&p.url()===BASE+'/company/'&&(await p.context().pages()).length===1&&await p.goBack().then(()=>p.waitForFunction(()=>document.querySelector('#view h1')&&document.querySelector('#view h1').textContent==='อบรมหมอนวดรุ่นใหม่',null,{timeout:5000})).then(()=>true,()=>false));

ok('post: [text](url) shows the name, link to another story shows its title (asked by number), no raw addresses for these',await p.waitForFunction(()=>{const a=[...document.querySelectorAll('.body a')],d=a.find(x=>x.getAttribute('href')==='https://www.doe.go.th/'),s=a.find(x=>x.getAttribute('href')==='/news/19');return !!d&&d.firstChild.textContent==='กรมการจัดหางาน'&&d.target==='_blank'&&!!s&&s.textContent==='นวดให้พนักงานบริษัท ก'&&!s.target},null,{timeout:4000}).then(()=>true,()=>false)&&REQ.some(u=>/no=in\.\(19\)/.test(u)));
ok('post: inline images in body: caption under image + as alt; no caption -> alt from story title, no caption text',await p.evaluate(()=>{const f=[...document.querySelectorAll('.body figure.inimg')];if(f.length!==2)return false;const i0=f[0].querySelector('img'),i1=f[1].querySelector('img');return i0.src.endsWith('/storage/v1/object/public/place-images/x/site-a.jpg')&&i0.alt==='ภาพหมอนวดในห้องอบรม'&&f[0].querySelector('figcaption').textContent==='ภาพหมอนวดในห้องอบรม'&&i1.alt==='รูปประกอบเรื่อง อบรมหมอนวดรุ่นใหม่'&&!f[1].querySelector('figcaption')&&i0.loading==='lazy'}));

// หน้าบทความ html ในเนื้อหาไม่ทำงาน
await p.goto(BASE+'/news/2');await p.waitForSelector('article.post h1');
ok('xss: script in body/title shown as text',await p.evaluate(()=>!window.XSS&&document.querySelector('.body').textContent.includes('<script>')&&document.querySelector('article h1').textContent.includes('<img')));
ok('post without cover: no image',await p.evaluate(()=>!document.querySelector('img.cover')));

// ร่าง / เลขที่ไม่มี / หน้าแปลก
await p.goto(BASE+'/news/3');await p.waitForSelector('#view h1');
ok('draft link: not found message',(await h1()).t==='ไม่พบหน้านี้'&&(await p.textContent('#view')).includes('อาจถูกลบหรือซ่อน'));
await p.goto(BASE+'/abc/xyz');await p.waitForSelector('#view h1');
ok('unknown page: not found with links home',(await h1()).t==='ไม่พบหน้านี้'&&!!await p.$('#view a[href="/"]'));

// หน้ารวม ตัวกรอง และดูเพิ่มเติม
await p.goto(BASE+'/news/');await p.waitForSelector('#list .card');
let n=await p.$$eval('#list .card',a=>a.length);
ok('list: 12 first, headings are h2 under the page h1',n===12&&(await h1()).t==='ข่าวและบทความ'&&await p.$$eval('#list .card h2',a=>a.length)===12);
ok('list: filter "ทั้งหมด" is current',await p.evaluate(()=>document.querySelector('.filters a[aria-current="page"]').textContent==='ทั้งหมด'));
await p.click('button[data-more]');
ok('list: load more adds the rest (18 published)',await p.waitForFunction(()=>document.querySelectorAll('#list .card').length===18,null,{timeout:5000}).then(()=>true,()=>false));
ok('list: no more button at the end; focus moves to first new item; announced',await p.waitForFunction(()=>!document.querySelector('button[data-more]')&&document.activeElement&&document.activeElement.closest('li')===document.querySelectorAll('#list .card')[12]&&/โหลดเพิ่มอีก 6 เรื่อง/.test(document.getElementById('live').textContent),null,{timeout:4000}).then(()=>true,()=>false));
await p.click('.filters a[href="/news/?k=article"]');
ok('filter บทความ: only articles, url ?k=article, h1 บทความ',await p.waitForFunction(()=>document.querySelectorAll('#list .card').length===1,null,{timeout:5000}).then(()=>true,()=>false)&&p.url().endsWith('/news/?k=article')&&(await h1()).t==='บทความ');
await p.click('.filters a[href="/news/?k=work"]');
ok('filter ผลงานบริการ: only work items, h1',await p.waitForFunction(()=>document.querySelectorAll('#list .card').length===1&&document.querySelector('#view h1').textContent==='ผลงานบริการ',null,{timeout:5000}).then(()=>true,()=>false));
await p.goBack();
await p.goBack();
ok('back button returns to all items',await p.waitForFunction(()=>document.querySelectorAll('#list .card').length===12&&document.querySelector('#view h1').textContent==='ข่าวและบทความ',null,{timeout:5000}).then(()=>true,()=>false));
await p.goto(BASE+'/news/?k=bogus');await p.waitForSelector('#list .card');
ok('unknown filter treated as all',await p.$$eval('#list .card',a=>a.length)===12);
ok('filters: all 3 types have stories, so all filters shown',await p.waitForFunction(()=>{const f=document.getElementById('filt');return f&&!f.hasAttribute('data-pending')&&[...f.querySelectorAll('a')].map(a=>a.textContent).join()==='ทั้งหมด,ข่าวและกิจกรรม,ผลงานบริการ,บทความ'},null,{timeout:4000}).then(()=>true,()=>false));
DB=mk().filter(a=>a.kind==='article'||!a.active);
await p.goto(BASE+'/news/');await p.waitForSelector('#list .card');
ok('filters: only one type has stories -> no filter bar (empty types hidden)',await p.waitForFunction(()=>{const f=document.getElementById('filt');return f&&!f.hasAttribute('data-pending')&&!f.querySelector('.filters')},null,{timeout:4000}).then(()=>true,()=>false));
await p.goto(BASE+'/news/?k=work');await p.waitForSelector('#list .empty');
ok('filters: opening an empty type by link keeps that filter (current) + ทั้งหมด + types with stories',await p.waitForFunction(()=>{const f=document.getElementById('filt');return f&&!f.hasAttribute('data-pending')&&[...f.querySelectorAll('a')].map(a=>a.textContent+(a.getAttribute('aria-current')?'*':'')).join()==='ทั้งหมด,ผลงานบริการ*,บทความ'},null,{timeout:4000}).then(()=>true,()=>false));
await p.click('.filters a[href="/news/"]');
ok('filters: going back to all in page uses the loaded types (no filter bar)',await p.waitForFunction(()=>document.querySelectorAll('#list .card').length===1&&!document.querySelector('#filt .filters'),null,{timeout:4000}).then(()=>true,()=>false));
DB=mk();

// หน้าสำหรับบริษัท
await p.goto(BASE+'/');await p.waitForSelector('#latest .card');
ok('home: hero buttons (company first, booking kept)',await p.evaluate(()=>[...document.querySelectorAll('.hero .btn')].map(a=>a.textContent+'>'+a.getAttribute('href')).join('|')==='สำหรับบริษัทและหน่วยงาน>/company/|จองนวดออนไลน์>https://massage-customer-bna.pages.dev/|อ่านข่าวและบทความ>/news/'));
ok('home: company box links to /company/ and to org service request',await p.evaluate(()=>!!document.querySelector('#view a[href="/company/"]')&&!!document.querySelector('#view a[href="https://massage-customer-bna.pages.dev/?orgreq=1"]')&&document.getElementById('hBiz').textContent==='สำหรับบริษัทและหน่วยงาน'));
await p.click('nav.main a[href="/company/"]');await p.waitForSelector('#hLaw');
H=await h1();ok('company: url, h1 focused, nav current',p.url()===BASE+'/company/'&&H.focus&&H.t==='สำหรับบริษัทและหน่วยงาน'&&await p.evaluate(()=>document.querySelector('nav.main a[aria-current="page"]').textContent==='บริษัทและหน่วยงาน'));
const ct=await p.textContent('#view');
ok('company: two offer cards (once / regular) with badges, titles and main buttons',await p.evaluate(()=>{const c=[...document.querySelectorAll('#view .offers .offer')];if(c.length!==2)return false;const t=c.map(x=>[x.querySelector('.badge').textContent,x.querySelector('h2').textContent,x.querySelector('.btn').textContent,x.querySelector('.btn').getAttribute('href')].join('|'));return t[0]==='ครั้งคราว|นวดออฟฟิศซินโดรมให้พนักงาน|ขอบริการสำหรับหน่วยงาน|https://massage-customer-bna.pages.dev/?orgreq=1'&&t[1]==='ประจำ|จ้างประจำตามมาตรา 33 หรือ 35|ลงทะเบียนบริษัท|https://massage-customer-bna.pages.dev/?company=1'}));
ok('company: price from settings (400 บาท ต่อหมอนวด 1 คน ต่อชั่วโมง), Bangkok only, s34 benefit',await p.waitForFunction(()=>{const o=document.querySelector('#view .offer .price');return o&&o.textContent==='400 บาท ต่อหมอนวด 1 คน ต่อชั่วโมง'},null,{timeout:4000}).then(()=>true,()=>false)&&(await p.textContent('#view')).includes('ตอนนี้รับเฉพาะหน่วยงานในกรุงเทพมหานคร')&&(await p.textContent('#view')).includes('ใช้แทนการส่งเงินเข้ากองทุนตามมาตรา 34'));
ok('company: call buttons (2 in cards + 1 at end) dial the association phone, end band shows number and email',await p.waitForFunction(()=>{const a=[...document.querySelectorAll('#view a.js-tel')];const b=document.querySelector('.askband a.js-mail');return a.length===3&&a.every(x=>x.getAttribute('href')==='tel:0989983654')&&document.querySelector('.askband .js-phone').textContent==='098-998-3654'&&!!b&&!b.hidden&&b.getAttribute('href')==='mailto:info@example.org'},null,{timeout:4000}).then(()=>true,()=>false));
ok('company: each main button only once (in its card)',await p.evaluate(()=>document.querySelectorAll('#view a[href="https://massage-customer-bna.pages.dev/?orgreq=1"]').length===1&&document.querySelectorAll('#view a[href="https://massage-customer-bna.pages.dev/?company=1"]').length===1));
ok('company: no comparison table (removed at user request)',await p.evaluate(()=>!document.querySelector('#view table')));
ok('company: FAQ has 8 questions in 2 groups, closed by default, after law and before ask band',await p.evaluate(()=>{const f=document.getElementById('faq');if(!f)return false;const d=[...f.querySelectorAll('details.faq')];const g=[...f.querySelectorAll('h3')].map(x=>x.textContent);const law=document.getElementById('law'),ask=document.querySelector('.askband');return d.length===8&&d.every(x=>!x.open)&&g.join('|')==='แบบครั้งคราว (นวดออฟฟิศซินโดรมให้พนักงาน)|แบบประจำ (จ้างตามมาตรา 33 หรือ 35)'&&d[0].querySelector('summary').textContent==='1. ต้องจองล่วงหน้ากี่วัน'&&(law.compareDocumentPosition(f)&4)&&(f.compareDocumentPosition(ask)&4)&&!f.textContent.includes('ทั้งสองแบบ')&&d[6].querySelector('summary').textContent==='7. บริษัทไม่มีตำแหน่งงานที่เหมาะกับคนตาบอด ทำอย่างไรได้บ้าง'&&d[6].textContent.includes('คนตาบอดทำงานที่สมาคม (องค์กรสาธารณประโยชน์)')}));
await p.click('#faq details:nth-of-type(2) summary').catch(()=>{});
ok('company: FAQ answers (10 days, price 400, 3 days, receipt no tax, chairs, Bangkok, start)',await p.waitForFunction(()=>{const t=document.getElementById('faq').textContent;return t.includes('อย่างน้อย 10 วันก่อนวันใช้บริการ')&&t.includes('400 บาท ต่อหมอนวด 1 คน ต่อชั่วโมง ไม่รวมช่วงพักเที่ยง')&&t.includes('อย่างน้อย 3 วันก่อนวันใช้บริการ')&&t.includes('ไม่สามารถนำไปลดหย่อนภาษีได้')&&t.includes('เตรียมเก้าอี้ 10 ตัว')&&t.includes('รับเฉพาะหน่วยงานในกรุงเทพมหานคร')&&t.includes('เลือกจ้างตามมาตรา 33 หรือ 35')},null,{timeout:4000}).then(()=>true,()=>false));
ok('company: FAQ opens with click (summary at least 44px tall)',await p.evaluate(()=>{const d=document.querySelector('#faq details.faq');d.querySelector('summary').click();return d.open&&d.querySelector('summary').getBoundingClientRect().height>=44}));
ok('company: s35 seven forms folded (closed) but in page',await p.evaluate(()=>{const d=document.querySelector('#view details.more7');return !!d&&!d.open&&d.querySelectorAll('ol li').length===7}));
ok('company: one steps section with both ways side by side + jump links',await p.evaluate(()=>!!document.querySelector('#steps #once')&&!!document.querySelector('#steps #regular')&&document.querySelectorAll('#once ol.steps li').length===4&&document.querySelectorAll('#regular ol.steps li').length===3&&!!document.querySelector('#view a[href="#steps"]')&&!!document.querySelector('#view a[href="#law"]')&&!document.querySelector('#view .box h3')?.textContent.includes('สมาคมช่วยบริษัทได้')));
ok('company: works section shows latest service work with photo, link to all works',await p.waitForFunction(()=>{const w=document.querySelectorAll('#works .card');return w.length===1&&!!document.querySelector('#works .card img')&&document.querySelector('#works h3 a').getAttribute('href')==='/news/19'},null,{timeout:4000}).then(()=>true,()=>false)&&!!await p.$('#worksSec a[href="/news/?k=work"]'));
ok('company: law facts (100:1, เศษเกิน 50, ม.33/34/35, 365 วัน)',['ทุก 100 คน ต่อคนพิการ 1 คน','เศษเกิน 50 คน','มาตรา 33','มาตรา 34','มาตรา 35','365 วัน','พ.ศ. 2550'].every(t=>ct.includes(t)));
ok('company: s35 has 7 forms and value; filing period paragraph removed',await p.evaluate(()=>{const o=[...document.querySelectorAll('#view ol')].find(x=>x.textContent.includes('สัมปทาน'));return !!o&&o.children.length===7})&&ct.includes('123,005 บาท')&&!ct.includes('1 ตุลาคม ถึง 31 ธันวาคม')&&!ct.includes('e-service.doe.go.th')&&!await p.$('#view a[href="tel:1506"]'));
ok('company: headings in order (h1 > h2 > h3), no source/date note',await p.evaluate(()=>{const hs=[...document.querySelectorAll('#view h1,#view h2,#view h3')].map(h=>+h.tagName[1]);return hs[0]===1&&hs.every((v,i)=>i===0||v<=hs[i-1]+1)})&&!ct.includes('ข้อมูลนี้เป็นข้อมูลเบื้องต้น'));
ok('company: tab title has keywords',(await p.title())==='นวดออฟฟิศซินโดรมให้พนักงาน และจ้างงานคนพิการ มาตรา 33, 35 | สมาคมวิทยากรฝึกอาชีพคนตาบอด');
await p.goto(BASE+'/company/');await p.waitForSelector('#hLaw');ok('company: direct link works',(await h1()).t==='สำหรับบริษัทและหน่วยงาน');

// ว่าง / โหลดไม่สำเร็จแล้วลองใหม่
DB=[];await p.goto(BASE+'/');await p.waitForSelector('#latest .empty');ok('home: empty message when no news',(await p.textContent('#latest')).includes('ยังไม่มีข่าว'));
DB=mk();FAIL=true;await p.goto(BASE+'/news/');await p.waitForSelector('#list [role="alert"]');ok('list: error box with retry',!!await p.$('#list button[data-retry]'));
FAIL=false;await p.click('#list button[data-retry]');ok('retry loads the list',await p.waitForSelector('#list .card',{timeout:5000}).then(()=>true,()=>false));

// มือถือ: ไม่ล้นจอ
const m=await b.newContext({locale:'th-TH',viewport:{width:360,height:740},isMobile:true});await m.route(/^https?:/,r=>{const u=r.request().url();if(u.startsWith(BASE))return r.continue();if(/cloudflareinsights\.com/.test(u))return r.abort();if(/site_articles/.test(u))return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(q(u))});return r.fulfill({status:200,contentType:'application/json',body:'null'})});
const mp=await m.newPage();mp.on('pageerror',e=>errs.push('mobile: '+e.message));await mp.goto(BASE+'/news/1');await mp.waitForSelector('article.post h1');
ok('no email from server: email line stays empty',(await mp.textContent('#cEmail'))==='');
ok('mobile 360px: no sideways scroll',await mp.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1));
// เครื่องคิดเลขจ้างงานคนพิการ
await p.goto(BASE+'/company/');await p.waitForSelector('#hLaw');await p.click('.calcbox a[href="/company/calc/"]');
ok('calc: opened from company page in same page, focus on h1, nav still on company',await p.waitForFunction(()=>document.querySelector('#view h1')&&document.querySelector('#view h1').textContent==='คำนวณจำนวนคนพิการที่บริษัทต้องจ้าง'&&document.activeElement===document.querySelector('#view h1'),null,{timeout:5000}).then(()=>true,()=>false)&&await p.evaluate(()=>document.querySelector('nav.main a[aria-current="page"]').getAttribute('href')==='/company/'&&document.title.startsWith('คำนวณจำนวนคนพิการ')));
await p.fill('#cN','251');await p.fill('#cH','1');await p.click('#calcF button[type=submit]');
ok('calc: result in status box (need 3, lack 2, 246,010 baht, 2 options incl. working at the association), no reload, link holds the numbers',await p.waitForFunction(()=>/ต้องจ้างคนพิการ 3 คน/.test(document.getElementById('calcOut').textContent),null,{timeout:4000}).then(()=>true,()=>false)&&await p.evaluate(()=>{const o=document.getElementById('calcOut');return o.getAttribute('role')==='status'&&/ยังขาดอีก 2 คน/.test(o.textContent)&&/246,010 บาท ต่อปี/.test(o.textContent)&&o.querySelectorAll('ol.opts li').length===2&&/คนตาบอดทำงานที่สมาคม \(องค์กรสาธารณประโยชน์\)/.test(o.textContent)&&/ทางเลือกกับสมาคม แทนการส่งเงินเข้ากองทุน \(2 คน\)/.test(o.textContent)&&location.search==='?n=251&h=1'&&!!o.querySelector('a[href*="?company=1"]')}));
await p.fill('#cN','12x');await p.click('#calcF button[type=submit]');
ok('calc: bad number -> error and focus back on the field',await p.waitForFunction(()=>/กรอกจำนวนพนักงานเป็นตัวเลข/.test(document.getElementById('calcOut').textContent)&&document.activeElement.id==='cN',null,{timeout:4000}).then(()=>true,()=>false));
await p.fill('#cN','80');await p.press('#cN','Enter');
ok('calc: Enter key works, 80 staff -> not required + occasional service button',await p.waitForFunction(()=>/ยังไม่ต้องจ้างคนพิการ/.test(document.getElementById('calcOut').textContent)&&!!document.querySelector('#calcOut a[href*="?orgreq=1"]'),null,{timeout:4000}).then(()=>true,()=>false));
await p.fill('#cN','300');await p.fill('#cH','5');await p.click('#calcF button[type=submit]');
ok('calc: already hired enough -> says complete, no fund amount',await p.waitForFunction(()=>/จ้างครบตามกฎหมายแล้ว/.test(document.getElementById('calcOut').textContent)&&!/ต่อปี/.test(document.getElementById('calcOut').textContent),null,{timeout:4000}).then(()=>true,()=>false));
await mp.goto(BASE+'/company/calc/');await mp.waitForSelector('#cN');
ok('mobile calc: no sideways scroll, fields and button at least 44px',await mp.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1&&['cN','cH'].every(i=>document.getElementById(i).getBoundingClientRect().height>=44)&&document.querySelector('#calcF button').getBoundingClientRect().height>=44));
await mp.goto(BASE+'/');await mp.waitForSelector('#latest .card');
ok('mobile home: no sideways scroll',await mp.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1));
await mp.goto(BASE+'/company/');await mp.waitForSelector('#hLaw');ok('mobile company: no sideways scroll',await mp.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1));
ok('mobile: buttons and nav links at least 44px tall',await mp.evaluate(()=>[].every.call(document.querySelectorAll('nav.main a, .btn'),a=>a.getBoundingClientRect().height>=44)));

console.log('errors:',errs.join('|')||'none');ok('no page errors',errs.length===0);await b.close();srv.close();process.exit(0)})();
