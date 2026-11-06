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
// ตั้งนาฬิกาให้ข้อสอบเหมือนรันตอน 10:00 น. (เวลาไทย) ของวันนี้เสมอ ทั้งฝั่งข้อสอบ (Date ของ Node) และเบราว์เซอร์
// นาฬิกายังเดินต่อตามจริง (ตัวจับเวลาทำงานปกติ) แค่จุดเริ่มต้นคงที่ ข้อสอบที่มีคิวเวลาตายตัว เช่น 23:00 น. จึงไม่ล้มเมื่อรันช่วงค่ำ
// 1) บรรทัดแรกของไฟล์ข้อสอบ ก่อนคำนวณวันที่ใดๆ: require('./config').pinClock()
// 2) หลังสร้างหน้าต่างเบราว์เซอร์: await require('./config').pinCtx(ctx)
//    (ใช้ addInitScript แทน clock API เพื่อให้ทำงานเหมือนกันทุกเวอร์ชันของ Playwright และมีข้อเช็กว่าเบราว์เซอร์ใช้เวลาเดียวกันจริง)
//    ข้อสอบที่ตั้ง p.clock เอง ไม่ต้องเรียก pinCtx แต่ให้ใช้ p.clock.install({time:Date.now()})
// ใช้จำลองเวลาที่รันจริง: TEST_NOW=2026-11-06T23:30:00+07:00   ปิดการตั้งเวลา (ดูว่าข้อสอบล้มไหม): PIN_OFF=1
exports.pinClock = (opt = {}) => {
  if (global.__pinnedClock) return;
  const Real = Date, realNow = Real.now.bind(Real), t0 = realNow();
  const wall = process.env.TEST_NOW ? Real.parse(process.env.TEST_NOW) : t0;
  const day = new Real(wall + 7 * 3600000).toISOString().slice(0, 10);
  const start = process.env.PIN_OFF ? wall : Real.parse(day + 'T' + (opt.at || '10:00') + ':00+07:00');
  const off = start - t0;
  global.__pinnedClock = { start, day, off };
  if (!off) return;
  class PinnedDate extends Real {
    constructor(...a) { if (a.length) super(...a); else super(realNow() + off); }
    static now() { return realNow() + off; }
  }
  global.Date = PinnedDate;
};
exports.pinCtx = async ctx => {
  const pc = global.__pinnedClock;
  if (!pc || !pc.off) return;
  await ctx.addInitScript(off => {
    const R = Date, rn = R.now.bind(R);
    class D extends R { constructor(...a) { if (a.length) super(...a); else super(rn() + off); } static now() { return rn() + off; } }
    window.Date = D;
  }, pc.off);
  let checked = false;
  ctx.on('page', p => p.on('load', async () => {
    if (checked) return; checked = true;
    try {
      const d = await p.evaluate(() => Date.now());
      if (Math.abs(d - Date.now()) > 120000) console.log('FAIL test clock: browser time is not pinned (' + new Date(d).toISOString() + ' vs ' + new Date().toISOString() + ')');
    } catch (e) {}
  }));
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

