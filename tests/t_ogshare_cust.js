// การ์ดตัวอย่างลิงก์ของแอปผู้ใช้งาน (13 พ.ย. 2569): รูปแนวนอน 1200x630 ชื่อ "จองคิวนวด"
const fs=require('fs'),path=require('path');const ok=(n,c)=>console.log((c?'PASS ':'FAIL ')+n);
const R=path.join(__dirname,'..','customer'),h=fs.readFileSync(path.join(R,'index.html'),'utf8');
const m=k=>{const x=h.match(new RegExp('<meta (?:property|name)="'+k+'" content="([^"]*)"'));return x?x[1]:null};
const img=m('og:image');
ok('og:image is the share card on the customer site',img==='https://massage-customer-bna.pages.dev/og-share.png');
const b=fs.readFileSync(path.join(R,'og-share.png'));
ok('share card file is a 1200x630 PNG',b.slice(1,4).toString()==='PNG'&&b.readUInt32BE(16)===1200&&b.readUInt32BE(20)===630);
ok('size declared and alt text set',m('og:image:width')==='1200'&&m('og:image:height')==='630'&&(m('og:image:alt')||'').includes('จองคิวนวด'));
ok('large image card for X/Twitter',m('twitter:card')==='summary_large_image');
ok('site name and title use the app name',m('og:site_name')==='จองคิวนวด'&&(m('og:title')||'').startsWith('จองคิวนวด'));
ok('og:url unchanged',m('og:url')==='https://massage-customer-bna.pages.dev/');
