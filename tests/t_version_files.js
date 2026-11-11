const fs=require('fs'),path=require('path'),crypto=require('crypto');
const ROOT=path.resolve(__dirname,'..');const ok=(nm,c)=>console.log((c?'PASS ':'FAIL ')+nm);
const md5=f=>crypto.createHash('md5').update(fs.readFileSync(f)).digest('hex');
const apps=['customer','shop','staff','admin'];const hashes=new Set();
for(const a of apps){const d=path.join(ROOT,a);
 let v=null;try{v=JSON.parse(fs.readFileSync(path.join(d,'version.json'),'utf8'))}catch(e){}
 ok(a+': version.json is valid',!!v&&/^\d+\.\d+(\.\d+)?$/.test(v.v)&&typeof v.required==='boolean'&&Array.isArray(v.notes)&&v.notes.length<=3&&v.notes.every(x=>typeof x==='string'));
 const h=fs.readFileSync(path.join(d,'index.html'),'utf8');const m=h.match(/<meta name="app-version" content="([^"]+)">/);
 ok(a+': version in index.html matches version.json (bump both together)',!!m&&!!v&&m[1]===v.v);
 ok(a+': update.js loaded before push.js',h.indexOf('<script src="update.js"></script>')>-1&&h.indexOf('update.js')<h.indexOf('push.js'));
 hashes.add(md5(path.join(d,'update.js')));
 const hd=fs.readFileSync(path.join(d,'_headers'),'utf8');ok(a+': version.json never cached',/\/version\.json\s*\n\s*Cache-Control: no-store/.test(hd));
 const mf=JSON.parse(fs.readFileSync(path.join(d,'manifest.webmanifest'),'utf8'));ok(a+': manifest icons exist (logo)',mf.icons.every(i=>/icon-logo-/.test(i.src)&&fs.existsSync(path.join(d,i.src))));
 ok(a+': badge icon file kept',fs.existsSync(path.join(d,'icon-192.png')));}
ok('update.js identical in all four apps',hashes.size===1);
// ไฟล์ที่ใช้ร่วมกันต้องเหมือนกันทุกแอป (แก้ที่เดียวแล้วคัดลอกไปอีก 3 แอป)
// แต่ละแอปบอกชื่อตัวเองตอนลงทะเบียนแจ้งเตือนนอกหน้าจอ (ส่งแจ้งเตือนเฉพาะแอปที่ตรงกับเรื่องนั้น)
for(const a of apps)ok(a+' tells push.js its app name',fs.readFileSync(path.join(ROOT,a,'index.html'),'utf8').includes('Push.attach({app:"'+a+'",'));
for(const f of ['push.js','sw.js','errlog.js'])ok(f+' identical in all four apps',new Set(apps.map(a=>md5(path.join(ROOT,a,f)))).size===1);
// ชื่อแอปบนหน้าจอโฮมของฝั่งพนักงาน (Android: manifest, iOS: apple-mobile-web-app-title)
{const mf=JSON.parse(fs.readFileSync(path.join(ROOT,'staff','manifest.webmanifest'),'utf8')),hx=fs.readFileSync(path.join(ROOT,'staff','index.html'),'utf8');
ok('staff app home-screen name (Android short_name) is หมอนวด',mf.short_name==='หมอนวด');
ok('staff app home-screen name (iOS title meta) is หมอนวด',/<meta name="apple-mobile-web-app-title" content="หมอนวด">/.test(hx));}
