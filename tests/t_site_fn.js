// functions ของ Cloudflare Pages ในเว็บประชาสัมพันธ์ (site/functions): ใส่หัวข้อ คำอธิบาย รูปของบทความในแท็ก meta (ให้ LINE / Facebook / Google เห็น)
// แผนผังเว็บ (sitemap.xml) และ robots.txt  รันใน Node ด้วย fetch / ASSETS จำลอง ไม่แตะ Supabase จริง (ไม่ได้ใช้เบราว์เซอร์)
const fs=require('fs'),path=require('path'),os=require('os');
const ok=(n,c)=>console.log((c?'PASS ':'FAIL ')+n);
const SITE=path.resolve(__dirname,'..','site');
(async()=>{
// คัดลอกไปโฟลเดอร์ชั่วคราวที่เป็น ES module (Cloudflare รวมไฟล์ให้เอง)
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'sitefn-'));
fs.cpSync(path.join(SITE,'functions'),path.join(tmp,'functions'),{recursive:true});fs.cpSync(path.join(SITE,'shared'),path.join(tmp,'shared'),{recursive:true});
fs.writeFileSync(path.join(tmp,'package.json'),'{"type":"module"}');
const imp=f=>import('file://'+path.join(tmp,f));
const art=await imp('functions/news/[no].js'),sm=await imp('functions/sitemap.xml.js'),rb=await imp('functions/robots.txt.js'),mw=await imp('functions/_middleware.js');
const INDEX=fs.readFileSync(path.join(SITE,'index.html'),'utf8');
const ASSETS={fetch:async()=>new Response(INDEX,{headers:{'Content-Type':'text/html; charset=utf-8'}})};
let ROWS=[],FAIL=false,ASKED=[];
global.fetch=async(u,o)=>{ASKED.push({u:String(u),h:o&&o.headers});if(FAIL)return new Response('x',{status:500});return new Response(JSON.stringify(ROWS),{headers:{'Content-Type':'application/json'}})};
const get=(no)=>art.onRequestGet({request:new Request('https://massage-home-bna.pages.dev/news/'+no),env:{ASSETS},params:{no}});

ROWS=[{no:7,kind:'news',title:'อบรม "หมอนวด" <รุ่น 2>',summary:'สรุปข่าว & กิจกรรม',cover_path:'place-images/00000000-0000-0000-0000-000000000000/site-x.jpg',cover_alt:'ภาพการอบรม',day:'2026-11-17',updated_at:'2026-11-18T01:00:00Z'}];
let r=await get('7'),h=await r.text();
ok('article: status 200, html',r.status===200&&/text\/html/.test(r.headers.get('Content-Type')));
ok('article: asks only for published row by number with the public key',ASKED[0].u.includes('/rest/v1/site_articles?')&&ASKED[0].u.includes('active=eq.true')&&ASKED[0].u.includes('no=eq.7')&&ASKED[0].h.apikey.startsWith('sb_publishable_'));
ok('article: <title> and og:title are the article (escaped)',h.includes('<title>อบรม &quot;หมอนวด&quot; &lt;รุ่น 2&gt; | สมาคมวิทยากรฝึกอาชีพคนตาบอด</title>')&&h.includes('<meta property="og:title" content="อบรม &quot;หมอนวด&quot; &lt;รุ่น 2&gt; | สมาคม'));
ok('article: description from summary, escaped',h.includes('<meta name="description" content="สรุปข่าว &amp; กิจกรรม">')&&h.includes('<meta property="og:description" content="สรุปข่าว &amp; กิจกรรม">'));
ok('article: og:url and canonical are the full link',h.includes('<meta property="og:url" content="https://massage-home-bna.pages.dev/news/7">')&&h.includes('<link rel="canonical" href="https://massage-home-bna.pages.dev/news/7">'));
ok('article: og:image is the cover (full url) with alt, default size tags removed',h.includes('<meta property="og:image" content="https://dwdnmfwepydyweeqfdxn.supabase.co/storage/v1/object/public/place-images/00000000-0000-0000-0000-000000000000/site-x.jpg">')&&h.includes('content="ภาพการอบรม"')&&!h.includes('og:image:width'));
ok('article: og:type article, only one og:title',h.includes('<meta property="og:type" content="article">')&&h.split('og:title').length===2);
const ldRaw=(h.match(/<script type="application\/ld\+json">(\{"@context":"https:\/\/schema.org","@type":"NewsArticle".*?)<\/script>/)||[])[1]||'null',ld=JSON.parse(ldRaw);
ok('article: NewsArticle structured data with date and image',!!ld&&ld.datePublished==='2026-11-17'&&ld.dateModified==='2026-11-18T01:00:00Z'&&ld.image[0].endsWith('site-x.jpg')&&ld.headline.includes('<รุ่น 2>')&&!ldRaw.includes('<'));
ok('article: page script still there',h.includes('function route()'));

ROWS=[{no:8,kind:'article',title:'ไม่มีรูป',summary:'',cover_path:null,cover_alt:'',day:'2026-11-10'}];
h=await (await get('8')).text();
ok('article without cover: default share image as full url, description = title',h.includes('<meta property="og:image" content="https://massage-home-bna.pages.dev/og-share.png">')&&h.includes('<meta name="description" content="ไม่มีรูป">')&&h.includes('"@type":"Article"'));

ROWS=[];r=await get('99');h=await r.text();
ok('missing / draft: 404 + noindex, page still served (shows not found)',r.status===404&&h.includes('<meta name="robots" content="noindex">')&&h.includes('function route()'));
FAIL=true;r=await get('7');h=await r.text();
ok('supabase down: plain page served',r.status===200&&h===INDEX);
FAIL=false;ASKED=[];r=await art.onRequestGet({request:new Request('https://x.pages.dev/news/abc'),env:{ASSETS},params:{no:'abc'}});
ok('bad number: plain page, no database call',ASKED.length===0&&(await r.text())===INDEX);

ROWS=[{no:2,day:'2026-11-01',updated_at:'2026-11-05T10:00:00Z'},{no:1,day:'2026-10-01'}];
r=await sm.onRequestGet({request:new Request('https://massage-home-bna.pages.dev/sitemap.xml')});h=await r.text();
ok('sitemap: xml with home, list and each published article',/application\/xml/.test(r.headers.get('Content-Type'))&&h.includes('<loc>https://massage-home-bna.pages.dev/</loc>')&&h.includes('<loc>https://massage-home-bna.pages.dev/company/</loc>')&&h.includes('<loc>https://massage-home-bna.pages.dev/news/</loc>')&&h.includes('<loc>https://massage-home-bna.pages.dev/news/2</loc><lastmod>2026-11-05</lastmod>')&&h.includes('/news/1</loc><lastmod>2026-10-01</lastmod>'));
ok('sitemap: asks only for published',ASKED.pop().u.includes('active=eq.true'));
FAIL=true;h=await (await sm.onRequestGet({request:new Request('https://a.b/sitemap.xml')})).text();FAIL=false;
ok('sitemap: database down still gives home + list',h.includes('<loc>https://a.b/</loc>')&&!h.includes('/news/1'));
h=await (await rb.onRequestGet({request:new Request('https://bna.or.th/robots.txt')})).text();
ok('robots.txt points to sitemap on the same domain',h.includes('Sitemap: https://bna.or.th/sitemap.xml')&&h.includes('Allow: /'));

const next=async()=>new Response(INDEX,{headers:{'Content-Type':'text/html; charset=utf-8'}});
h=await (await mw.onRequest({request:new Request('https://massage-home-bna.pages.dev/'),next})).text();
ok('home: canonical, og:url and full share image added',h.includes('<link rel="canonical" href="https://massage-home-bna.pages.dev/">')&&h.includes('<meta property="og:url" content="https://massage-home-bna.pages.dev/">')&&h.includes('content="https://massage-home-bna.pages.dev/og-share.png"')&&h.includes('<title>สมาคมวิทยากรฝึกอาชีพคนตาบอด | ข่าวสารและบทความ'));
h=await (await mw.onRequest({request:new Request('https://massage-home-bna.pages.dev/news/?k=article'),next})).text();
ok('list page: canonical keeps the filter',h.includes('<link rel="canonical" href="https://massage-home-bna.pages.dev/news/?k=article">'));
h=await (await mw.onRequest({request:new Request('https://massage-home-bna.pages.dev/company/'),next})).text();
ok('company page: canonical /company/',h.includes('<link rel="canonical" href="https://massage-home-bna.pages.dev/company/">'));
const png=new Response('PNG',{headers:{'Content-Type':'image/png'}});
r=await mw.onRequest({request:new Request('https://massage-home-bna.pages.dev/icon-192.png'),next:async()=>png});
ok('other files passed through untouched',r===png);

fs.rmSync(tmp,{recursive:true,force:true});process.exit(0)})().catch(e=>{console.log('FAIL crash '+e.stack);process.exit(1)});
