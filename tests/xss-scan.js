// ตรวจว่าข้อความจากฐานข้อมูลแสดงเป็นตัวหนังสือในทุกหน้า (กันโค้ดแปลกปลอมจากชื่อร้าน/บริการ/หมอนวด ฯลฯ)
// วิธีทำงาน: รันข้อสอบเดิมทุกไฟล์ของ 4 แอป โดยเติมโค้ดทดลอง ("'><img onerror=...>) ต่อท้ายทุกช่องข้อความที่มาจาก Supabase
// ถ้าหน้าไหนใส่ข้อความลงหน้าเว็บโดยไม่ผ่าน esc() โค้ดทดลองจะทำงานและถูกรายงานพร้อมตำแหน่งในหน้า
// ใช้: cd tests && node xss-scan.js [คำกรองชื่อไฟล์]   (ใช้เวลาพอๆ กับชุดเต็ม ไม่รวมใน run-all.js รันเมื่อแก้หน้าเว็บครั้งใหญ่)
// ผลข้อสอบเดิมระหว่างสแกนไม่ต้องสนใจ (ชื่อถูกเติมจึงอาจไม่ผ่าน) ดูเฉพาะรายงานท้ายสุด
const path=require('path'),fs=require('fs'),os=require('os'),{spawn}=require('child_process');
if(process.argv[2]==='--one'){
const T=path.resolve(process.argv[3]),OUT=process.argv[4],TD=path.dirname(T);
const head=fs.readFileSync(T,'utf8').slice(0,600);(head.match(/^\/\/ RUN-ENV: (.*)$/m)||[,''])[1].split(/\s+/).filter(Boolean).forEach(kv=>{const i=kv.indexOf('=');process.env[kv.slice(0,i)]=kv.slice(i+1)});
const pw=require(require.resolve('playwright',{paths:[TD]}));
const HITS=new Set();
const INIT=`(()=>{const RX=/(^|_)(name|title|body|description|desc|area|comment|reply|note|notes|reason|detail|message|address|nickname|text|summary|line_id|work_history|source|course_other|province|amphoe|tambon|district|label|caption|hours_text|account_name|promo|place_name|service_name|staff_name|customer_name|shop_name|company_name|contact_name|first_name|last_name|full_name|admin_note|cover_alt)$/i;
const P=k=>'"\\'><img src=x onerror="console.log(\\'XSSHIT:'+k+'|\\'+(this.parentNode&&this.parentNode.outerHTML||\\'\\').slice(0,220))">';
function mut(o,d){if(d>8)return o;if(Array.isArray(o)){for(let i=0;i<o.length;i++)o[i]=mut(o[i],d+1);return o}if(o&&typeof o==='object'){for(const k in o){const v=o[k];if(typeof v==='string'&&v&&RX.test(k))o[k]=v+P(k);else if(v&&typeof v==='object')o[k]=mut(v,d+1)}}return o}
const of=window.fetch;window.fetch=async function(u,i){const r=await of.apply(this,arguments);try{const url=String(u&&u.url||u);if(!/supabase\\.co\\/(rest|auth|functions)/.test(url))return r;const ct=r.headers.get('content-type')||'';if(!ct.includes('json'))return r;const t=await r.clone().text();if(!t)return r;const j=mut(JSON.parse(t),0);return new Response(JSON.stringify(j),{status:r.status,statusText:r.statusText,headers:r.headers})}catch(e){return r}}})()`;
const hook=pg=>pg.on('console',m=>{const t=m.text();if(t.startsWith('XSSHIT:'))HITS.add(t.slice(7))});
const orig=pw.chromium.launch.bind(pw.chromium);
pw.chromium.launch=async o=>{const b=await orig(o);const nc=b.newContext.bind(b);
 b.newContext=async op=>{const c=await nc(op);await c.addInitScript(INIT);c.on('page',hook);return c};
 const np=b.newPage.bind(b);b.newPage=async op=>{const c=await b.newContext(op);return c.newPage()};return b};
process.on('exit',()=>{if(HITS.size)fs.appendFileSync(OUT,[...HITS].map(h=>path.basename(T)+'\t'+h.replace(/\s+/g,' ')).join('\n')+'\n')});
process.chdir(TD);require(T);
}else{
const dir=__dirname,flt=process.argv[2]||'',JOBS=+process.env.JOBS||4;
const files=fs.readdirSync(dir).filter(f=>/^t_.*\.js$/.test(f)&&f.includes(flt)&&/admin-panel|shop-owner|staff-app|customer-booking/.test(fs.readFileSync(path.join(dir,f),'utf8'))).sort();
const OUT=path.join(os.tmpdir(),'xss-scan-'+process.pid+'.txt');fs.writeFileSync(OUT,'');
let i=0,done=0;console.log('สแกน '+files.length+' ไฟล์ ...');
const next=()=>{if(i>=files.length)return;const f=files[i++];const c=spawn(process.execPath,[__filename,'--one',path.join(dir,f),OUT],{stdio:'ignore'});
 const k=setTimeout(()=>c.kill('SIGKILL'),180000);c.on('exit',()=>{clearTimeout(k);done++;if(done===files.length)report();else next()})};
for(let n=0;n<JOBS;n++)next();
function report(){const L=fs.readFileSync(OUT,'utf8').split('\n').filter(Boolean);fs.unlinkSync(OUT);
 if(!L.length){console.log('PASS ไม่พบข้อความที่ถูกตีความเป็นโค้ด ('+files.length+' ไฟล์)');process.exit(0)}
 console.log('FAIL พบ '+L.length+' จุด (ช่อง|ส่วนของหน้าที่ใส่ข้อความโดยไม่ esc):');L.slice(0,60).forEach(l=>console.log('  '+l.slice(0,260)));process.exit(1)}
}
