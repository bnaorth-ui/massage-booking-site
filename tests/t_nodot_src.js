// ตรวจว่าไม่มีเครื่องหมาย "·" ในโค้ดทั้งสี่หน้า (ตัวอ่านหน้าจออ่านเป็นสัญลักษณ์) ใช้ ", " แทน
const fs=require('fs'),path=require('path');const R=path.resolve(__dirname,'..');
let bad=0;for(const d of ['admin','shop','staff','customer']){const s=fs.readFileSync(path.join(R,d,'index.html'),'utf8');const n=(s.match(/·/g)||[]).length;console.log((n===0?'PASS ':'FAIL ')+d+' has no middle dot'+(n?' ('+n+')':''));if(n)bad++}
process.exit(bad?1:0);
