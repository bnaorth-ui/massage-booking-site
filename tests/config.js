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
// โฟลเดอร์ชั่วคราวที่มีไฟล์ 4 หน้าตามชื่อเดิม สำหรับเทสต์ที่ต้องใช้เว็บเซิร์ฟเวอร์
exports.serveDir = () => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'pages-'));
  for (const n of Object.keys(DIR)) fs.copyFileSync(pageFile(n), path.join(d, n));
  for (const f of ['sw.js', 'push.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png']) {
    for (const dd of Object.values(DIR)) { const s = path.join(ROOT, dd, f); if (fs.existsSync(s) && !fs.existsSync(path.join(d, f))) fs.copyFileSync(s, path.join(d, f)); }
  }
  return d;
};
