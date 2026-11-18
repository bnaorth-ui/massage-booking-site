// functions ของ Cloudflare Pages ในเว็บประชาสัมพันธ์ (site/functions): ใส่เนื้อหาของแต่ละหน้าลงในหน้าเว็บตั้งแต่ตอนส่ง (ให้ Google / LINE เห็นโดยไม่รันสคริปต์)
// ชื่อหน้า คำอธิบาย canonical รูปแชร์ ข้อมูลโครงสร้าง กล่องติดต่อ ลิขสิทธิ์ หน้าไม่พบ (404) แผนผังเว็บ และ robots.txt
// รันใน Node ด้วย fetch / next() จำลอง ไม่แตะ Supabase จริง (ไม่ได้ใช้เบราว์เซอร์)
const fs=require('fs'),path=require('path'),os=require('os');
const ok=(n,c)=>console.log((c?'PASS ':'FAIL ')+n);
const SITE=path.resolve(__dirname,'..','site');
(async()=>{
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'sitefn-'));
fs.cpSync(path.join(SITE,'functions'),path.join(tmp,'functions'),{recursive:true});fs.cpSync(path.join(SITE,'shared'),path.join(tmp,'shared'),{recursive:true});
fs.writeFileSync(path.join(tmp,'package.json'),'{"type":"module"}');
const imp=f=>import('file://'+path.join(tmp,f));
const mw=await imp('functions/_middleware.js'),sm=await imp('functions/sitemap.xml.js'),rb=await imp('functions/robots.txt.js');
const INDEX=fs.readFileSync(path.join(SITE,'index.html'),'utf8');
const next=async()=>new Response(INDEX,{headers:{'Content-Type':'text/html; charset=utf-8'}});
const ROWS=[{no:7,kind:'news',title:'อบรม "หมอนวด" <รุ่น 2>',summary:'สรุปข่าว & กิจกรรม',body:'ย่อหน้าแรก\n\n## หัวข้อย่อย\n- ข้อหนึ่ง',cover_path:'place-images/00000000-0000-0000-0000-000000000000/site-x.jpg',cover_alt:'ภาพการอบรม',day:'2026-11-17',updated_at:'2026-11-18T01:00:00Z',pinned:true,active:true},
 {no:9,kind:'work',title:'นวดให้พนักงานบริษัท ก',summary:'',body:'x',cover_path:'place-images/x/site-w.jpg',cover_alt:'หมอนวดกำลังนวด',day:'2026-11-01',pinned:false,active:true},
 {no:8,kind:'article',title:'ประโยชน์ของการนวด',summary:'',body:'เนื้อหา',cover_path:null,cover_alt:'',day:'2026-11-10',pinned:false,active:true}];
let FAIL=false,ASKED=[],CONTACT={name:'สมาคมวิทยากรฝึกอาชีพคนตาบอด',phone:'0989983654',email:'info@example.org',hours:'จันทร์ - ศุกร์ 09:00 - 17:00 น.',org_rate:400};
const kindF=(r,v)=>v.startsWith('neq.')?r.filter(a=>a.kind!==v.slice(4)):r.filter(a=>a.kind===v.slice(3));
const adjF=(r,p)=>{const o=p.get('or');if(!o)return r;const m=/^\(day\.(lt|gt)\.([\d-]+),and\(day\.eq\.[\d-]+,no\.(?:lt|gt)\.(\d+)\)\)$/.exec(o);if(!m)throw new Error('bad or '+o);const lt=m[1]==='lt',d=m[2],n=+m[3];r=r.filter(a=>lt?(a.day<d||(a.day===d&&a.no<n)):(a.day>d||(a.day===d&&a.no>n)));const asc=(p.get('order')||'').startsWith('day.asc');return r.sort((a,b)=>(asc?1:-1)*((a.day<b.day?-1:a.day>b.day?1:0)||(a.no-b.no)))};
global.fetch=async(u,o)=>{u=String(u);ASKED.push({u,h:o&&o.headers});if(FAIL)return new Response('x',{status:500});
 const J=x=>new Response(JSON.stringify(x),{headers:{'Content-Type':'application/json'}});
 if(u.includes('/rpc/public_contact'))return J(CONTACT);
 const q=new URL(u).searchParams;let r=ROWS.filter(a=>a.active);
 if(q.get('kind'))r=kindF(r,q.get('kind'));if(q.get('no'))r=r.filter(a=>a.no===+q.get('no').slice(3));if(q.get('or'))r=adjF(r,q);
 return J(r.slice(0,+(q.get('limit')||100)))};
const B='https://massage-home-bna.pages.dev';
const get=async p=>{const r=await mw.onRequest({request:new Request(B+p),next});return{r,h:await r.text()}};
const view=h=>(h.match(/<div class="wrap" id="view"[^>]*>([\s\S]*?)<\/div><\/main>/)||[])[1]||'';
const ld=h=>[...h.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map(m=>({raw:m[1],j:JSON.parse(m[1])}));
const titleOf=h=>(h.match(/<title>([^<]*)<\/title>/)||[])[1];

// หน้าแรก
let {r,h}=await get('/');
ok('home: 200 html, short cache',r.status===200&&/text\/html/.test(r.headers.get('Content-Type'))&&r.headers.get('Cache-Control')==='public, max-age=60');
ok('home: content in page without script (h1, sections, latest news)',view(h).includes('<h1>จ้างงานคนตาบอดผ่านงานนวด ที่ขึ้นทะเบียนถูกต้อง</h1>')&&view(h).includes('สำหรับบริษัทและหน่วยงาน')&&view(h).includes('href="https://massage-customer-bna.pages.dev/?orgreq=1"')&&view(h).includes('href="/news/7"')&&!view(h).includes('data-pending')&&h.includes('data-ssr="/"'));
ok('home: title and description for home (employment focus, differs from bna.or.th)',titleOf(h)==='จ้างงานคนตาบอด มาตรา 33, 35 และบริการนวดโดยหมอนวดตาบอด | สมาคมวิทยากรฝึกอาชีพคนตาบอด'&&h.includes('<meta name="description" content="จ้างหมอนวดผู้พิการทางการเห็น'));
ok('home: works section first, latest news excludes works, footer links bna.or.th',view(h).indexOf('id="worksSec"')>-1&&view(h).indexOf('id="worksSec"')<view(h).indexOf('id="hLatest"')&&view(h).indexOf('id="hBiz"')<view(h).indexOf('id="worksSec"')&&!(view(h).split('id="hLatest"')[1].split('</section>')[0]).includes('href="/news/9"')&&h.includes('เว็บไซต์สมาคม <a href="https://bna.or.th/">bna.or.th</a>'));
ok('home: canonical, og:url, full share image, og:type website',h.includes('<link rel="canonical" href="'+B+'/">')&&h.includes('<meta property="og:url" content="'+B+'/">')&&h.includes('<meta property="og:image" content="'+B+'/og-share.png">')&&h.includes('<meta property="og:type" content="website">'));
let L=ld(h);ok('home: Organization data = association site bna.or.th (sameAs this site), phone and email',L.length===1&&L[0].j['@type']==='Organization'&&L[0].j.url==='https://bna.or.th/'&&L[0].j.sameAs.join()==='https://bna.or.th/,'+B+'/'&&L[0].j.logo===B+'/icon-512.png'&&L[0].j.telephone==='0989983654'&&L[0].j.email==='info@example.org');
ok('home: nav marks หน้าแรก',h.includes('data-k="home" aria-current="page">'));
ok('footer: contact filled in order phone, email, hours',/<p id="cPhone">โทร <a href="tel:0989983654">098-998-3654<\/a><\/p>\s*<p id="cEmail">อีเมล <a href="mailto:info@example.org">info@example.org<\/a><\/p>\s*<p id="cHours">จันทร์ - ศุกร์ 09:00 - 17:00 น.<\/p>/.test(h));
ok('footer: copyright with Thai year',h.includes('<p class="copy" id="copy">© '+(new Date().getUTCFullYear()+543)+' สมาคมวิทยากรฝึกอาชีพคนตาบอด สงวนลิขสิทธิ์</p>'));
ok('fallback head in index.html matches home (title, og:title, description) and share image alt',(()=>{const raw=fs.readFileSync(path.join(__dirname,'..','site','index.html'),'utf8');const t='จ้างงานคนตาบอด มาตรา 33, 35 และบริการนวดโดยหมอนวดตาบอด | สมาคมวิทยากรฝึกอาชีพคนตาบอด';return titleOf(raw)===t&&raw.includes('<meta property="og:title" content="'+t+'">')&&raw.includes('<meta name="description" content="จ้างหมอนวดผู้พิการทางการเห็น')&&raw.includes('<meta property="og:description" content="จ้างหมอนวดผู้พิการทางการเห็น')&&raw.includes('จ้างงานคนตาบอดผ่านงานนวด ที่ขึ้นทะเบียนถูกต้อง">')&&!raw.includes('ข่าวสารและบทความ"')})());
ok('og-share.png is 1200x630 PNG',(()=>{const b=fs.readFileSync(path.join(__dirname,'..','site','og-share.png'));return b.readUInt32BE(16)===1200&&b.readUInt32BE(20)===630})());
ok('header subtitle: จ้างงานคนตาบอดผ่านงานนวด',h.includes('<small>จ้างงานคนตาบอดผ่านงานนวด</small>'));
ok('page script still there',h.includes('function start()')&&h.includes('<script src="/shared/views.js"></script>'));

// หน้าสำหรับบริษัท
({r,h}=await get('/company/'));
ok('company: regular card has no "หมอนวดประจำลา" line',!view(h).includes('หมอนวดประจำลา'));
ok('company: law content in page without script',view(h).includes('<h1>สำหรับบริษัทและหน่วยงาน</h1>')&&view(h).includes('มาตรา 35: ให้สิทธิแทนการจ้าง')&&view(h).includes('123,005')&&h.includes('data-ssr="/company/"'));
ok('company: own title, description with price, canonical',titleOf(h)==='นวดออฟฟิศซินโดรมให้พนักงาน และจ้างงานคนพิการ มาตรา 33, 35 | สมาคมวิทยากรฝึกอาชีพคนตาบอด'&&h.includes('<meta name="description" content="จ้างหมอนวดตาบอดที่ขึ้นทะเบียนถูกต้องไปนวดออฟฟิศซินโดรมให้พนักงานที่บริษัท 400 บาท ต่อหมอนวด 1 คน ต่อชั่วโมง (กรุงเทพฯ)')&&h.includes('<meta property="og:title" content="นวดออฟฟิศซินโดรมให้พนักงาน')&&h.includes('<link rel="canonical" href="'+B+'/company/">')&&h.includes('data-k="company" aria-current="page">'));
ok('company: price, phone links and works in page without script',view(h).includes('<b class="js-rate">400 บาท</b> <span class="js-rate-unit">ต่อหมอนวด 1 คน ต่อชั่วโมง</span>')&&(view(h).match(/<a class="btn ghost js-tel" href="tel:0989983654">โทรสอบถาม<\/a>/g)||[]).length===2&&view(h).includes('<a class="btn js-tel" href="tel:0989983654">โทร&nbsp;<span class="js-phone">098-998-3654</span></a>')&&view(h).includes('<a class="btn ghost js-mail" href="mailto:info@example.org">ส่งอีเมล</a>')&&!view(h).includes('<table')&&view(h).includes('<details class="more7">')&&view(h).includes('id="worksSec"')&&view(h).includes('href="/news/9"')&&!view(h).includes('data-pending'));
{const fq=ld(h).find(x=>x.j['@type']==='FAQPage');ok('company: FAQPage data with 7 questions, price in answer, FAQ in page without script',!!fq&&fq.j.mainEntity.length===7&&fq.j.mainEntity[1].acceptedAnswer.text.startsWith('400 บาท ต่อหมอนวด 1 คน')&&fq.j.mainEntity[0].name==='ต้องจองล่วงหน้ากี่วัน'&&(view(h).match(/<details class="faq">/g)||[]).length===7)}
({h}=await get('/'));ok('home: no FAQPage data (only on company page)',!ld(h).some(x=>x.j['@type']==='FAQPage'));({h}=await get('/company/'));
ROWS.find(x=>x.no===9).active=false;({h}=await get('/company/'));ok('company: no published works -> works section left out',!view(h).includes('worksSec')&&!view(h).includes('data-pending'));ROWS.find(x=>x.no===9).active=true;
CONTACT.org_rate=null;({h}=await get('/company/'));ok('company: no rate set -> "ดูราคาในแอป", unit hidden, no price in description',view(h).includes('<b class="js-rate">ดูราคาในแอป</b> <span class="js-rate-unit" hidden>')&&!h.includes('บาท ต่อหมอนวด 1 คน ต่อชั่วโมง (กรุงเทพฯ)'));CONTACT.org_rate=400;
({h}=await get('/news/?k=work'));ok('list ผลงานบริการ: own title/description, only work items',titleOf(h)==='ผลงานบริการ | สมาคมวิทยากรฝึกอาชีพคนตาบอด'&&h.includes('<meta name="description" content="หน่วยงานและบริษัทที่')&&view(h).includes('href="/news/9"')&&!view(h).includes('href="/news/7"'));
({h}=await get('/company'));ok('company without slash: canonical still /company/',h.includes('<link rel="canonical" href="'+B+'/company/">'));

// หน้ารวม
({r,h}=await get('/news/?k=article'));
ok('list filtered: only articles in page, canonical keeps filter, title บทความ',view(h).includes('href="/news/8"')&&!view(h).includes('href="/news/7"')&&h.includes('<link rel="canonical" href="'+B+'/news/?k=article">')&&titleOf(h)==='บทความ | สมาคมวิทยากรฝึกอาชีพคนตาบอด'&&h.includes('data-ssr="/news/?k=article"'));
({h}=await get('/news/?k=bogus'));ok('list: unknown filter = all, canonical /news/',view(h).includes('href="/news/7"')&&h.includes('<link rel="canonical" href="'+B+'/news/">'));

// หน้าบทความ
ASKED=[];({r,h}=await get('/news/7'));
ok('post: 200, asks only for published row by number with public key',r.status===200&&ASKED.some(a=>a.u.includes('active=eq.true')&&a.u.includes('no=eq.7')&&a.h.apikey.startsWith('sb_publishable_')));
ok('post: body in page (paragraph, sub-heading, list), title escaped',view(h).includes('<p>ย่อหน้าแรก</p><h2>หัวข้อย่อย</h2><ul><li>ข้อหนึ่ง</li></ul>')&&view(h).includes('<h1>อบรม &quot;หมอนวด&quot; &lt;รุ่น 2&gt;</h1>')&&view(h).includes('วันที่ 17 พฤศจิกายน 2569'));
ok('post: title/og escaped, description from summary',titleOf(h)==='อบรม &quot;หมอนวด&quot; &lt;รุ่น 2&gt; | สมาคมวิทยากรฝึกอาชีพคนตาบอด'&&h.includes('<meta name="description" content="สรุปข่าว &amp; กิจกรรม">')&&h.includes('<meta property="og:type" content="article">')&&h.split('og:title').length===2);
ok('post: canonical, og:image = cover with alt, size tags removed',h.includes('<link rel="canonical" href="'+B+'/news/7">')&&h.includes('<meta property="og:image" content="https://dwdnmfwepydyweeqfdxn.supabase.co/storage/v1/object/public/place-images/00000000-0000-0000-0000-000000000000/site-x.jpg">')&&h.includes('<meta property="og:image:alt" content="ภาพการอบรม">')&&!h.includes('og:image:width'));
L=ld(h);const na=L.find(x=>x.j['@type']==='NewsArticle');
ok('post: NewsArticle data (dates, image) + Organization, no raw "<"',!!na&&na.j.datePublished==='2026-11-17'&&na.j.dateModified==='2026-11-18T01:00:00Z'&&na.j.image[0].endsWith('site-x.jpg')&&na.j.headline.includes('<รุ่น 2>')&&!na.raw.includes('<')&&L.some(x=>x.j['@type']==='Organization'));
ok('post: author = association (Organization, url bna.or.th)',!!na&&na.j.author&&na.j.author['@type']==='Organization'&&na.j.author.name==='สมาคมวิทยากรฝึกอาชีพคนตาบอด'&&na.j.author.url==='https://bna.or.th/');
ok('post: prev/next of same type in page (news 7: no other news -> nav empty but present)',view(h).includes('<nav class="pn" id="pn" aria-label="เรื่องอื่นในข่าวและกิจกรรม" data-no="7" data-day="2026-11-17" data-kind="news"></nav>')&&view(h).includes('<a href="/" data-nav>กลับหน้าแรก</a>')&&view(h).includes('<nav class="crumb" aria-label="ตำแหน่งหน้า"><a href="/" data-nav>หน้าแรก</a>'));
ok('post: share links with full url',view(h).includes('https://social-plugins.line.me/lineit/share?url='+encodeURIComponent(B+'/news/7')));
({h}=await get('/news/8'));ok('post without cover: default share image (full url), Article type, description = title',h.includes('<meta property="og:image" content="'+B+'/og-share.png">')&&ld(h).some(x=>x.j['@type']==='Article')&&h.includes('<meta name="description" content="ประโยชน์ของการนวด">'));

// ไม่พบ
({r,h}=await get('/news/99'));
ok('missing/draft post: 404, noindex, not-found message in page, no canonical',r.status===404&&h.includes('<meta name="robots" content="noindex">')&&view(h).includes('ไม่พบข่าวหรือบทความนี้')&&!h.includes('rel="canonical"'));
({r,h}=await get('/abc/xyz'));ok('unknown page: 404 + noindex + not-found in page',r.status===404&&h.includes('noindex')&&view(h).includes('<h1>ไม่พบหน้านี้</h1>'));

// ฐานข้อมูลไม่ตอบ
FAIL=true;
({r,h}=await get('/'));ok('db down home: 200, page still has content, latest marked for browser to load, contact default',r.status===200&&view(h).includes('<h1>จ้างงานคนตาบอด')&&view(h).includes('<div id="latest" data-pending>')&&h.includes('<p id="cName">สมาคมวิทยากรฝึกอาชีพคนตาบอด</p>')&&h.includes('<p id="cPhone"></p>'));
({r,h}=await get('/news/7'));ok('db down post: 200, page left for browser to load (no data-ssr)',r.status===200&&!h.includes('id="view" data-ssr')&&!h.includes('noindex'));
FAIL=false;

// ไฟล์ยืนยัน Google Search Console
for(const gp of ['/google388ba24f989c9ab1.html','/google388ba24f989c9ab1']){({r,h}=await get(gp));ok('google verify file served directly at '+gp,r.status===200&&h==='google-site-verification: google388ba24f989c9ab1.html'&&/text\/html/.test(r.headers.get('Content-Type')))}
ok('google verify file also in site folder with same content',fs.readFileSync(path.join(SITE,'google388ba24f989c9ab1.html'),'utf8').trim()==='google-site-verification: google388ba24f989c9ab1.html');
r=await mw.onRequest({request:new Request(B+'/other'),next:async()=>new Response('<p>other</p>',{status:200,headers:{'Content-Type':'text/html'}})});
ok('other html (not our page) passed through unchanged',r.status===200&&(await r.text())==='<p>other</p>');

// ไฟล์อื่นไม่แตะ
let called=0;const png=new Response('PNG',{headers:{'Content-Type':'image/png'}});
r=await mw.onRequest({request:new Request(B+'/icon-192.png'),next:async()=>{called++;return png}});
ok('files passed through untouched',r===png&&called===1);
r=await mw.onRequest({request:new Request(B+'/',{method:'POST'}),next:async()=>png});ok('non-GET passed through',r===png);

// แผนผังเว็บ / robots
ROWS[0].updated_at='2026-11-05T10:00:00Z';
r=await sm.onRequestGet({request:new Request(B+'/sitemap.xml')});h=await r.text();
ok('sitemap: home, company, list and each published article',/application\/xml/.test(r.headers.get('Content-Type'))&&['/','/company/','/news/'].every(p=>h.includes('<loc>'+B+p+'</loc>'))&&h.includes('<loc>'+B+'/news/7</loc><lastmod>2026-11-05</lastmod>')&&h.includes('/news/8</loc><lastmod>2026-11-10</lastmod>'));
FAIL=true;h=await (await sm.onRequestGet({request:new Request('https://a.b/sitemap.xml')})).text();FAIL=false;
ok('sitemap: database down still gives main pages',h.includes('<loc>https://a.b/</loc>')&&!h.includes('/news/7'));
h=await (await rb.onRequestGet({request:new Request('https://x.org/robots.txt')})).text();
ok('robots.txt points to sitemap on the same domain',h.includes('Sitemap: https://x.org/sitemap.xml')&&h.includes('Allow: /'));

fs.rmSync(tmp,{recursive:true,force:true});process.exit(0)})().catch(e=>{console.log('FAIL crash '+e.stack);process.exit(1)});
