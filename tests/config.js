// ตั้งค่ากลางของเทสต์ ใช้ได้ทั้งในเครื่องและบน GitHub Actions
// PAGES_DIR  : โฟลเดอร์ที่มีไฟล์ customer-booking.html ฯลฯ (ไม่ตั้ง = ใช้ <folder>/index.html ใน repository)
// CHROMIUM_PATH : ตำแหน่งเบราว์เซอร์ (ไม่ตั้ง = ใช้ที่ Playwright ติดตั้งให้)
const path = require('path'), fs = require('fs'), os = require('os');
const ROOT = path.resolve(__dirname, '..');
const DIR = { 'customer-booking.html': 'customer', 'shop-owner.html': 'shop', 'staff-app.html': 'staff', 'admin-panel.html': 'admin' };
function pageFile(name) {
  if (process.env.PAGES_DIR) return path.join(process.env.PAGES_DIR, name);
  if (!DIR[name]) throw new Error('unknown page ' + name);
  return path.join(ROOT, DIR[name], 'index.html');
}
exports.page = name => 'file://' + pageFile(name);
// ไม่ตั้ง CHROMIUM_PATH = ใช้ headless แบบใหม่ (channel chromium) เพราะแบบเก่ารายงานสิทธิ์แจ้งเตือนเป็น denied ทำให้เทสต์ push ล้มเอง
exports.launch = process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : { channel: 'chromium' };
exports.tmp = name => path.join(os.tmpdir(), name);
// ตั้งนาฬิกาให้ข้อสอบเหมือนรันตอน 10:00 น. (เวลาไทย) ของวันนี้เสมอ ทั้งฝั่งข้อสอบ (Date ของ Node) และเบราว์เซอร์ทุกหน้าต่าง
// นาฬิกายังเดินต่อตามจริง (ตัวจับเวลาทำงานปกติ) แค่จุดเริ่มต้นคงที่ ข้อสอบที่มีคิวเวลาตายตัว เช่น 23:00 น. จึงไม่ล้มเมื่อรันช่วงค่ำ
// เรียกบรรทัดแรกของไฟล์ข้อสอบ ก่อนคำนวณวันที่ใดๆ: require('./config').pinClock()
//   ctx:false = ไม่ตั้งในเบราว์เซอร์ให้ (ข้อสอบตั้ง p.clock เองด้วย time:Date.now())
// ใช้จำลองเวลาที่รันจริง: TEST_NOW=2026-11-06T23:30:00+07:00   ปิดการตั้งเวลา (ดูว่าข้อสอบล้มไหม): PIN_OFF=1
exports.pinClock = (opt = {}) => {
  if (global.__pinnedClock) return;
  const Real = Date, realNow = Real.now.bind(Real), t0 = realNow();
  const wall = process.env.TEST_NOW ? Real.parse(process.env.TEST_NOW) : t0;
  const day = new Real(wall + 7 * 3600000).toISOString().slice(0, 10);
  const start = process.env.PIN_OFF ? wall : Real.parse(day + 'T' + (opt.at || '10:00') + ':00+07:00');
  global.__pinnedClock = { start, day };
  if (start === t0) return;
  const now = () => start + (realNow() - t0);
  class PinnedDate extends Real {
    constructor(...a) { if (a.length) super(...a); else super(now()); }
    static now() { return now(); }
  }
  global.Date = PinnedDate;
  if (opt.ctx === false) return;
  const { chromium } = require('playwright');
  const launch = chromium.launch.bind(chromium);
  chromium.launch = async (...a) => {
    const b = await launch(...a), newContext = b.newContext.bind(b);
    b.newContext = async (...o) => { const c = await newContext(...o); await c.clock.install({ time: new Real(now()) }); return c; };
    b.newPage = async (...o) => { const c = await b.newContext(...o); return c.newPage(); };
    return b;
  };
};
// โฟลเดอร์ชั่วคราวที่มีไฟล์ 4 หน้าตามชื่อเดิม สำหรับเทสต์ที่ต้องใช้เว็บเซิร์ฟเวอร์
exports.serveDir = () => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'pages-'));
  for (const n of Object.keys(DIR)) fs.copyFileSync(pageFile(n), path.join(d, n));
  for (const f of ['sw.js', 'push.js', 'update.js', 'errlog.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-logo-192.png', 'icon-logo-512.png']) {
    for (const dd of Object.values(DIR)) { const s = path.join(ROOT, dd, f); if (fs.existsSync(s) && !fs.existsSync(path.join(d, f))) fs.copyFileSync(s, path.join(d, f)); }
  }
  return d;
};

