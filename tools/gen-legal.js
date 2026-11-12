// สร้างหน้าเว็บสาธารณะของแอปผู้ใช้งาน (เปิดได้โดยไม่ต้องเข้าสู่ระบบ ใช้กรอกใน Google Play / App Store)
//   customer/privacy/index.html         นโยบายความเป็นส่วนตัว (เนื้อหาเดียวกับในแอป ดึงจากฟังก์ชัน pvHtml ใน customer/index.html)
//   customer/delete-account/index.html  วิธีลบบัญชี และข้อมูลที่ถูกลบ / เก็บต่อ
// วิธีใช้: แก้นโยบายใน customer/index.html แล้วรัน  node tools/gen-legal.js
// ข้อสอบ tests/t_legal_pages.js ตรวจว่าไฟล์ที่เก็บไว้ตรงกับที่สร้างใหม่ ถ้าลืมรันจะขึ้น FAIL
// ชื่อและเบอร์โทรของสมาคมเติมตอนเปิดหน้า จาก public_contact (ถ้าโหลดไม่ได้ แสดงชื่อสมาคมอย่างเดียว)
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const DEF_NAME = 'สมาคมวิทยากรฝึกอาชีพคนตาบอด';
const SITE = 'https://massage-customer-bna.pages.dev';

function grabFn(src, name) {
  const i = src.indexOf('function ' + name + '(');
  if (i < 0) throw new Error('ไม่พบฟังก์ชัน ' + name);
  let d = 0, j = src.indexOf('{', i), q = null;
  for (let k = j; k < src.length; k++) {
    const c = src[k];
    if (q) { if (c === '\\') { k++; continue } if (c === q) q = null; continue }
    if (c === '"' || c === "'") { q = c; continue }
    if (c === '{') d++; else if (c === '}') { d--; if (!d) return src.slice(i, k + 1) }
  }
  throw new Error('ฟังก์ชัน ' + name + ' ไม่ครบ');
}

function policyBody(src) {
  const ctx = { SET: { ct: { name: '\u0001NM\u0001', phone: '\u0001TEL\u0001' } } };
  vm.createContext(ctx);
  const ESC = 'function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",\'"\':"&quot;"}[c]})}';
  if (src.indexOf(ESC) < 0) throw new Error('ฟังก์ชัน esc ในหน้าแอปเปลี่ยนไป ให้แก้ ESC ในสคริปต์นี้ให้ตรงกัน');
  vm.runInContext(ESC + '\n' + grabFn(src, 'pvHtml') + '\nvar OUT=pvHtml();', ctx);
  let h = ctx.OUT;
  h = h.split(' โทร \u0001TEL\u0001').join('<span data-ct="tel"></span>');
  h = h.split('\u0001NM\u0001').join('<span data-ct="name">' + DEF_NAME + '</span>');
  if (/\u0001/.test(h)) throw new Error('ยังมีตัวแทนชื่อหรือเบอร์ค้างอยู่');
  return h;
}

const LI = a => '<ul>' + a.map(x => '<li>' + x + '</li>').join('') + '</ul>';
const OL = a => '<ol>' + a.map(x => '<li>' + x + '</li>').join('') + '</ol>';
const NM = '<span data-ct="name">' + DEF_NAME + '</span>';
function deleteBody() {
  return '<div class="pv"><p>คุณลบบัญชีผู้ใช้งานและข้อมูลส่วนตัวของคุณได้เองในแอปจองคิวนวด ลบแล้วกู้คืนไม่ได้</p>' +
    '<h2>ลบเองในแอป</h2>' + OL([
      'เปิดแอปจองคิวนวด หรือเว็บ <a href="/">massage-customer-bna.pages.dev</a> แล้วเข้าสู่ระบบ',
      'ไปที่แท็บ &quot;บัญชี&quot;',
      'เลื่อนลงไปท้ายหน้า กดปุ่ม &quot;ลบบัญชีของฉัน&quot;',
      'กรอกรหัสผ่านเพื่อยืนยัน แล้วกด &quot;ยืนยันลบบัญชีถาวร&quot;']) +
    '<h2>ก่อนลบ</h2>' + LI([
      'ต้องไม่มีการจองที่ยังไม่เสร็จสิ้น ให้ยกเลิก หรือรอให้ใช้บริการเสร็จก่อน',
      'บัญชีร้านนวด หมอนวด และแอดมิน ลบเองในแอปไม่ได้ ให้ติดต่อเจ้าหน้าที่']) +
    '<h2>ถ้าเข้าสู่ระบบไม่ได้</h2>' + LI([
      'ลองกด &quot;ลืมรหัสผ่าน&quot; ที่หน้าเข้าสู่ระบบก่อน',
      'หรือติดต่อเจ้าหน้าที่ ' + NM + '<span data-ct="tel"></span> แจ้งเบอร์โทรที่ใช้สมัคร เจ้าหน้าที่จะตรวจสอบว่าเป็นเจ้าของบัญชีก่อนลบให้']) +
    '<h2>ข้อมูลที่ถูกลบทันที</h2>' + LI([
      'บัญชี ชื่อ เบอร์โทร และรูปโปรไฟล์',
      'แต้มสะสม การแจ้งเตือน รายการโปรด และรายชื่อที่คุณบล็อก',
      'ข้อความแชตที่คุณส่ง']) +
    '<h2>ข้อมูลที่ยังเก็บไว้ โดยไม่ผูกกับคุณ</h2>' + LI([
      'ประวัติการจองของร้าน ล้างชื่อและเบอร์โทรของคุณออกแล้ว',
      'รีวิวที่คุณเขียน ยังแสดงอยู่ แต่ไม่เชื่อมกับบัญชีของคุณ',
      'คำขอบริการสำหรับหน่วยงานที่เคยส่ง (ถ้ามี) ถ้าต้องการให้ลบ ติดต่อเจ้าหน้าที่',
      'รายงานแชตที่เกี่ยวข้อง เก็บไว้ไม่เกิน 12 เดือน แล้วลบอัตโนมัติ']) +
    '<p>อ่านรายละเอียดเพิ่มเติมได้ที่ <a href="/privacy/">นโยบายความเป็นส่วนตัว</a></p></div>';
}

function page(o) {
  return `<!doctype html>
<html lang="th">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<!-- ไฟล์นี้สร้างจาก tools/gen-legal.js ห้ามแก้ตรงนี้ ให้แก้ต้นฉบับแล้วรันสคริปต์ใหม่ -->
<title>${o.title} | จองคิวนวด ${DEF_NAME}</title>
<meta name="description" content="${o.desc}">
<link rel="canonical" href="${SITE}${o.path}">
<link rel="icon" href="/icon-192.png">
<style>
:root{--bg:#f6faf8;--ink:#14302a;--mute:#4d635c;--brand:#0f6e56;--line:#cfe0da}
@media (prefers-color-scheme:dark){:root{--bg:#10201b;--ink:#e6f2ee;--mute:#a9c2ba;--brand:#5fd1a8;--line:#2c4a41}}
body{margin:0;background:var(--bg);color:var(--ink);font:18px/1.7 system-ui,-apple-system,"Noto Sans Thai","Sarabun",sans-serif}
main{max-width:720px;margin:0 auto;padding:24px 16px 48px}
header{display:flex;gap:12px;align-items:center;margin-bottom:8px}
header img{width:56px;height:56px;border-radius:14px}
h1{font-size:1.5rem;line-height:1.4;margin:8px 0 12px}
h2{font-size:1.15rem;margin:22px 0 6px}
p,li{color:var(--ink)}
ul,ol{padding-left:1.4em;margin:6px 0}
li{margin:4px 0}
a{color:var(--brand)}
.home{display:inline-block;margin-top:24px;padding:12px 20px;border-radius:12px;background:var(--brand);color:#fff;text-decoration:none;font-weight:600}
@media (prefers-color-scheme:dark){.home{color:#10201b}}
footer{margin-top:28px;padding-top:14px;border-top:2px solid var(--line);color:var(--mute);font-size:.95rem}
</style>
</head>
<body>
<main>
<header><img src="/icon-logo-192.png" alt=""><div><b>จองคิวนวด</b><br><span data-ct="name">${DEF_NAME}</span></div></header>
<h1>${o.title}</h1>
${o.body}
<a class="home" href="/">เปิดแอปจองคิวนวด</a>
<footer><a href="/privacy/">นโยบายความเป็นส่วนตัว</a>, <a href="/delete-account/">วิธีลบบัญชี</a></footer>
</main>
<script>
(function(){
 /* เติมชื่อและเบอร์โทรของสมาคมจากระบบ (ข้อมูลเดียวกับหน้าติดต่อเราในแอป) */
 try{fetch("https://dwdnmfwepydyweeqfdxn.supabase.co/rest/v1/rpc/public_contact",{method:"POST",headers:{apikey:"sb_publishable_4xaAEuN8jFIxGjyhtzABow_FsbGcoI3","Content-Type":"application/json"},body:"{}"})
  .then(function(r){return r.ok?r.json():null}).then(function(c){if(!c)return;
   var nm=String(c.name||"").trim(),tel=String(c.phone||"").trim();
   document.querySelectorAll('[data-ct="name"]').forEach(function(e){if(nm)e.textContent=nm});
   document.querySelectorAll('[data-ct="tel"]').forEach(function(e){if(tel)e.textContent=" โทร "+tel})}).catch(function(){})}catch(e){}
})();
</script>
</body>
</html>
`;
}

function build() {
  const src = fs.readFileSync(path.join(ROOT, 'customer', 'index.html'), 'utf8');
  return {
    'customer/privacy/index.html': page({ title: 'นโยบายความเป็นส่วนตัว', path: '/privacy/', desc: 'นโยบายความเป็นส่วนตัวของแอปจองคิวนวด ' + DEF_NAME + ' เก็บข้อมูลอะไร ใช้ทำอะไร ใครเห็น และเก็บนานแค่ไหน', body: policyBody(src) }),
    'customer/delete-account/index.html': page({ title: 'วิธีลบบัญชีผู้ใช้งาน', path: '/delete-account/', desc: 'วิธีลบบัญชีผู้ใช้งานแอปจองคิวนวด ' + DEF_NAME + ' และข้อมูลที่ถูกลบหรือเก็บต่อ', body: deleteBody() }),
  };
}
module.exports = { build };
if (require.main === module) {
  for (const [f, h] of Object.entries(build())) {
    const p = path.join(ROOT, f);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, h);
    console.log('เขียน', f);
  }
}
