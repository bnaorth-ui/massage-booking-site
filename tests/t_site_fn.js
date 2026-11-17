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
 {no:8,kind:'article',title:'ประโยชน์ของการนวด',summary:'',body:'เนื้อหา',cover_path:null,cover_alt:'',day:'2026-11-10',pinned:false,active:true}];
let FAIL=false,ASKED=[],CONTACT={name:'สมาคมวิทยากรฝึกอาชีพคนตาบอด',phone:'0989983654',email:'info@example.org',hours:'จันทร์ - ศุกร์ 09:00 - 17:00 น.'};
global.fetch=async(u,o)=>{u=String(u);ASKED.push({u,h:o&&o.headers});if(FAIL)return new Response('x',{status:500});
 const J=x=>new Response(JSON.stringify(x),{headers:{'Content-Type':'application/json'}});
 if(u.includes('/rpc/public_contact'))return J(CONTACT);
 const q=new URL(u).searchParams;let r=ROWS.filter(a=>a.active);
 if(q.get('kind'))r=r.filter(a=>a.kind===q.get('kind').slice(3));if(q.get('no'))r=r.filter(a=>a.no===+q.get('no').slice(3));
 return J(r.slice(0,+(q.get('limit')||100)))};
const B='https://massage-home-bna.pages.dev';
const get=async p=>{const r=await mw.onRequest({request:new Request(B+p),next});return{r,h:await r.text()}};
const view=h=>(h.match(/<div class="wrap" id="view"[^>]*>([\s\S]*?)<\/div><\/main>/)||[])[1]||'';
const ld=h=>[...h.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map(m=>({raw:m[1],j:JSON.parse(m[1])}));
const titleOf=h=>(h.match(/<title>([^<]*)<\/title>/)||[])[1];

// หน้าแรก
let {r,h}=await get('/');
ok('home: 200 html, short cache',r.status===200&&/text\/html/.test(r.headers.get('Content-Type'))&&r.headers.get('Cache-Control')==='public, max-age=60');
ok('home: content in page without script (h1, sections, latest news)',view(h).includes('<h1>นวดไทยโดยหมอนวดตาบอด ที่ขึ้นทะเบียนถูกต้อง</h1>')&&view(h).includes('สำหรับบริษัทและองค์กร')&&view(h).includes('href="/news/7"')&&!view(h).includes('data-pending')&&h.includes('data-ssr="/"'));
ok('home: title and description for home',titleOf(h)==='นวดไทยโดยหมอนวดตาบอดที่ขึ้นทะเบียนถูกต้อง | สมาคมวิทยากรฝึกอาชีพคนตาบอด'&&h.includes('<meta name="description" content="นวดแผนไทยโดยหมอนวดตาบอด'));
ok('home: canonical, og:url, full share image, og:type website',h.includes('<link rel="canonical" href="'+B+'/">')&&h.includes('<meta property="og:url" content="'+B+'/">')&&h.includes('<meta property="og:image" content="'+B+'/og-share.png">')&&h.includes('<meta property="og:type" content="website">'));
let L=ld(h);ok('home: Organization data uses this site (no unverified domain), phone and email',L.length===1&&L[0].j['@type']==='Organization'&&L[0].j.url===B+'/'&&L[0].j.logo===B+'/icon-512.png'&&L[0].j.telephone==='0989983654'&&L[0].j.email==='info@example.org'&&!h.includes('bna.or.th'));
ok('home: nav marks หน้าแรก',h.includes('data-k="home" aria-current="page">'));
ok('footer: contact filled in order phone, email, hours',/<p id="cPhone">โทร <a href="tel:0989983654">098-998-3654<\/a><\/p>\s*<p id="cEmail">อีเมล <a href="mailto:info@example.org">info@example.org<\/a><\/p>\s*<p id="cHours">จันทร์ - ศุกร์ 09:00 - 17:00 น.<\/p>/.test(h));
ok('footer: copyright with Thai year',h.includes('<p class="copy" id="copy">© '+(new Date().getUTCFullYear()+543)+' สมาคมวิทยากรฝึกอาชีพคนตาบอด สงวนลิขสิทธิ์</p>'));
ok('page script still there',h.includes('function start()')&&h.includes('<script src="/shared/views.js"></script>'));

// หน้าสำหรับบริษัท
({r,h}=await get('/company/'));
ok('company: law content in page without script',view(h).includes('<h1>สำหรับบริษัทและองค์กร</h1>')&&view(h).includes('มาตรา 35: ให้สิทธิแทนการจ้าง')&&view(h).includes('123,005')&&h.includes('data-ssr="/company/"'));
ok('company: own title, description, canonical',titleOf(h)==='จ้างหมอนวดตาบอดไปนวดที่บริษัท และจ้างงานคนพิการ มาตรา 33, 35 | สมาคมวิทยากรฝึกอาชีพคนตาบอด'&&h.includes('<meta name="description" content="จ้างหมอนวดตาบอดที่ขึ้นทะเบียนถูกต้องไปนวดให้พนักงาน')&&h.includes('<meta property="og:title" content="จ้างหมอนวดตาบอดไปนวดที่บริษัท')&&h.includes('<link rel="canonical" href="'+B+'/company/">')&&h.includes('data-k="company" aria-current="page">'));
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
ok('post: share links with full url',view(h).includes('https://social-plugins.line.me/lineit/share?url='+encodeURIComponent(B+'/news/7')));
({h}=await get('/news/8'));ok('post without cover: default share image (full url), Article type, description = title',h.includes('<meta property="og:image" content="'+B+'/og-share.png">')&&ld(h).some(x=>x.j['@type']==='Article')&&h.includes('<meta name="description" content="ประโยชน์ของการนวด">'));

// ไม่พบ
({r,h}=await get('/news/99'));
ok('missing/draft post: 404, noindex, not-found message in page, no canonical',r.status===404&&h.includes('<meta name="robots" content="noindex">')&&view(h).includes('ไม่พบข่าวหรือบทความนี้')&&!h.includes('rel="canonical"'));
({r,h}=await get('/abc/xyz'));ok('unknown page: 404 + noindex + not-found in page',r.status===404&&h.includes('noindex')&&view(h).includes('<h1>ไม่พบหน้านี้</h1>'));

// ฐานข้อมูลไม่ตอบ
FAIL=true;
({r,h}=await get('/'));ok('db down home: 200, page still has content, latest marked for browser to load, contact default',r.status===200&&view(h).includes('<h1>นวดไทย')&&view(h).includes('<div id="latest" data-pending>')&&h.includes('<p id="cName">สมาคมวิทยากรฝึกอาชีพคนตาบอด</p>')&&h.includes('<p id="cPhone"></p>'));
({r,h}=await get('/news/7'));ok('db down post: 200, page left for browser to load (no data-ssr)',r.status===200&&!h.includes('id="view" data-ssr')&&!h.includes('noindex'));
FAIL=false;

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
