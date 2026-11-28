// กันชื่อฟังก์ชันซ้ำในสคริปต์หลักของ 4 แอป (28 พ.ย. 2569)
// เคยเกิด: chKey(c) ใหม่ทับ chKey(b,r) เดิม ตัวเลขข้อความใหม่ทุกห้องรวมเป็นตัวเดียว (ห้องหมอนวดไปโชว์ที่แชตกับร้าน)
// ตรวจเฉพาะฟังก์ชันระดับบนสุด (ไม่นับฟังก์ชันย่อยในฟังก์ชันอื่น) แอปร้าน/หมอนวด/แอดมินห่อโค้ดใน (function(){...})() จึงนับชั้นที่ 1 แทน
const fs=require('fs'),path=require('path');let pass=0,fail=0;const ok=(n,c)=>{c?pass++:fail++;console.log((c?'PASS ':'FAIL ')+n)};
function top(src){const out=[];let d=0,i=0,q=null,line=false,blk=false,re=false;
 while(i<src.length){const c=src[i],n=src[i+1];
  if(line){if(c==='\n')line=false;i++;continue}
  if(blk){if(c==='*'&&n==='/'){blk=false;i+=2;continue}i++;continue}
  if(q){if(c==='\\'){i+=2;continue}if(c===q)q=null;i++;continue}
  if(c==='/'&&n==='/'){line=true;i+=2;continue}
  if(c==='/'&&n==='*'){blk=true;i+=2;continue}
  if(c==='"'||c==="'"||c==='`'){q=c;i++;continue}
  if(c==='/'){const p=src.slice(Math.max(0,i-20),i).replace(/\s+$/,'');if(/[=(,:;!&|?{}\[]$|return$|^$/.test(p)){i++;while(i<src.length&&src[i]!=='/'){if(src[i]==='\\')i++;else if(src[i]==='['){while(i<src.length&&src[i]!==']'){if(src[i]==='\\')i++;i++}}i++}i++;while(/[a-z]/.test(src[i]||''))i++;continue}}
  if(c==='{'){d++;i++;continue}if(c==='}'){d--;i++;continue}
  if(d<=1&&src.startsWith('function ',i)&&!/[\w$.]/.test(src[i-1]||'')){const m=/^function\s+([\w$]+)\s*\(/.exec(src.slice(i));if(m)out.push([m[1],d])}
  i++}
 return out}
for(const a of ['customer','shop','staff','admin']){
 const s=fs.readFileSync(path.join(__dirname,'..',a,'index.html'),'utf8');
 const js=[...s.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n;\n');
 const all=top(js),d0=all.filter(x=>x[1]===0),names=(d0.length>100?d0:all.filter(x=>x[1]===1)).map(x=>x[0]),c={};names.forEach(x=>c[x]=(c[x]||0)+1);
 const dup=Object.keys(c).filter(k=>c[k]>1);
 ok(a+': '+names.length+' top-level functions, no duplicate names'+(dup.length?' (ซ้ำ: '+dup.join(', ')+')':''),names.length>100&&dup.length===0);
}
console.log('pass='+pass+' fail='+fail);process.exit(fail?1:0);
