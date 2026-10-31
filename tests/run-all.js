#!/usr/bin/env node
// รันเทสต์ทั้งหมด (t_*.js) แล้วสรุปผล   ใช้: node run-all.js [โฟลเดอร์เทสต์] [คำกรองชื่อไฟล์]
// ตัวแปร: ONLY=ชื่อไฟล์,ชื่อไฟล์ (รันเฉพาะที่ระบุ)  JOBS=จำนวนที่รันพร้อมกัน (ค่าเริ่มต้น 4)  TIMEOUT_MS=เวลาสูงสุดต่อไฟล์ (ค่าเริ่มต้น 300000)
const fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const dir = path.resolve(process.argv[2] || __dirname), filter = process.argv[3] || '';
const jobs = +process.env.JOBS || 4, limit = +process.env.TIMEOUT_MS || 300000;
const only = (process.env.ONLY || '').split(',').filter(Boolean);
const files = fs.readdirSync(dir).filter(f => /^t_.*\.js$/.test(f) && f.includes(filter) && (!only.length || only.includes(f))).sort();
const res = []; let next = 0, running = 0;
function runOne(f) {
  return new Promise(done => {
    const p = spawn('node', [path.join(dir, f)], { cwd: dir, env: process.env });
    let out = '', killed = false;
    const to = setTimeout(() => { killed = true; p.kill('SIGKILL'); }, limit);
    p.stdout.on('data', d => out += d); p.stderr.on('data', d => out += d);
    p.on('close', code => {
      clearTimeout(to);
      const lines = out.split('\n'), pass = lines.filter(l => /^PASS /.test(l)).length, failL = lines.filter(l => /^FAIL /.test(l));
      const status = killed ? 'TIMEOUT' : (code !== 0 ? 'CRASH' : (failL.length ? 'FAIL' : (pass === 0 ? 'EMPTY' : 'OK')));
      done({ f, pass, fail: failL.length, status, failL, tail: lines.slice(-6).join('\n') });
    });
  });
}
(async () => {
  await new Promise(resolve => {
    const pump = () => {
      while (running < jobs && next < files.length) {
        const f = files[next++]; running++;
        runOne(f).then(r => { res.push(r); running--; console.log((r.status === 'OK' ? 'ok   ' : 'BAD  ') + r.f + ' pass=' + r.pass + (r.fail ? ' fail=' + r.fail : '') + (r.status !== 'OK' ? ' [' + r.status + ']' : '')); pump(); });
      }
      if (running === 0 && next >= files.length) resolve();
    };
    pump();
  });
  const bad = res.filter(r => r.status !== 'OK').sort((a, b) => a.f.localeCompare(b.f));
  const total = res.reduce((a, r) => a + r.pass, 0);
  console.log('\n== สรุป: ' + res.length + ' ไฟล์, PASS ' + total + ' ข้อ, ไม่ผ่าน/ผิดปกติ ' + bad.length + ' ไฟล์');
  for (const r of bad) { console.log('--- ' + r.f + ' [' + r.status + ']'); (r.failL.length ? r.failL : [r.tail]).slice(0, 5).forEach(l => console.log('   ' + l)); }
  process.exit(bad.length ? 1 : 0);
})();
