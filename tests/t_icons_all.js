// ไอคอนชุดเดียวกัน 4 แอป (13 พ.ย. 2569): มือประคองเหมือนกัน ของในมือและสีพื้นต่างกัน
// ผู้ใช้งาน ใบไม้ เขียว / ร้านนวด หน้าร้าน น้ำเงิน / หมอนวด หัวใจ ส้มเข้ม / แอดมิน เฟือง เทาเข้ม
const fs=require('fs'),path=require('path');const {chromium}=require('playwright');const C=require('./config');
const ok=(n,c)=>console.log((c?'PASS ':'FAIL ')+n);
const R=path.join(__dirname,'..'),APPS={customer:[15,110,86],shop:[29,79,145],staff:[180,80,28],admin:[58,70,86]};
const dim=f=>{const b=fs.readFileSync(f);return b.slice(1,4).toString()==='PNG'?[b.readUInt32BE(16),b.readUInt32BE(20)]:null};
(async()=>{const b=await chromium.launch(C.launch);const p=await b.newPage();
for(const [a,rgb] of Object.entries(APPS)){const d=path.join(R,a),mf=JSON.parse(fs.readFileSync(path.join(d,'manifest.webmanifest'),'utf8'));
 const files=['icon-logo-192.png','icon-logo-512.png','icon-192.png','icon-512.png','icon-logo-maskable-512.png'];
 ok(a+': all icon files exist with the right size',files.every(f=>{const z=dim(path.join(d,f)),n=+f.match(/(\d+)\.png/)[1];return z&&z[0]===n&&z[1]===n}));
 ok(a+': manifest lists a maskable icon',mf.icons.some(i=>i.purpose==='maskable'&&i.src==='icon-logo-maskable-512.png'));
 const px=await p.evaluate(async u=>{const im=new Image();im.src=u;await im.decode();const c=document.createElement('canvas');c.width=c.height=192;const x=c.getContext('2d');x.drawImage(im,0,0);return Array.from(x.getImageData(20,96,1,1).data).slice(0,3)},'data:image/png;base64,'+fs.readFileSync(path.join(d,'icon-logo-192.png')).toString('base64'));
 ok(a+': background color is the app colour',px.every((v,i)=>Math.abs(v-rgb[i])<=6));}
const hash=a=>fs.readFileSync(path.join(R,a,'icon-logo-192.png')).toString('base64');
ok('each app has its own icon',new Set(Object.keys(APPS).map(hash)).size===4);
await b.close();process.exit(0)})();
