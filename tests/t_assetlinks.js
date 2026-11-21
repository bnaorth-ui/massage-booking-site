// ไฟล์ยืนยันแอป Android (Google Play) กับเว็บแอปผู้ใช้งาน: customer/.well-known/assetlinks.json
// ทำให้แอปจาก Play เปิดเต็มจอ ไม่มีแถบที่อยู่เว็บ รหัส SHA-256 ไม่ใช่ข้อมูลลับ (กุญแจจริงเก็บกับสมาคม ห้ามใส่ในที่เก็บโค้ด)
const fs=require('fs'),path=require('path');
const ok=(n,c)=>console.log((c?'PASS ':'FAIL ')+n);
const R=path.resolve(__dirname,'..'),F=path.join(R,'customer','.well-known','assetlinks.json');
let j=null;try{j=JSON.parse(fs.readFileSync(F,'utf8'))}catch(e){}
ok('assetlinks.json exists and is valid JSON (array)',Array.isArray(j)&&j.length>=1);
const t=(j&&j[0]&&j[0].target)||{},rel=(j&&j[0]&&j[0].relation)||[];
ok('relation handle_all_urls',rel.indexOf('delegate_permission/common.handle_all_urls')>-1);
ok('android_app th.or.bna.massage (same as Package ID / codemagic)',t.namespace==='android_app'&&t.package_name==='th.or.bna.massage');
const fp=t.sha256_cert_fingerprints||[];
ok('fingerprints: at least one, all SHA-256 format AA:BB:.. (32 bytes)',fp.length>=1&&fp.every(x=>/^([0-9A-F]{2}:){31}[0-9A-F]{2}$/.test(x)));
ok('no duplicate fingerprints',new Set(fp).size===fp.length);
const h=fs.readFileSync(path.join(R,'customer','_headers'),'utf8');
ok('_headers serves it as application/json',/\/\.well-known\/assetlinks\.json\s*\n\s+Content-Type: application\/json/.test(h));
const bad=[];(function walk(d){for(const n of fs.readdirSync(d)){const p=path.join(d,n);if(fs.statSync(p).isDirectory()){if(n!=='node_modules'&&n!=='.git')walk(p)}else if(/\.(keystore|jks|p8|p12)$/i.test(n)||/^signing-key-info/i.test(n))bad.push(path.relative(R,p))}})(R);
ok('no signing keys or key passwords committed in the repo'+(bad.length?' ('+bad.join(', ')+')':''),bad.length===0);
