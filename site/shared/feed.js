// RSS 2.0 ของเว็บประชาสัมพันธ์ (ให้เว็บอื่น เช่น bna.or.th ที่ใช้ WordPress ดึงเรื่องล่าสุดไปแสดงด้วยบล็อก/วิดเจ็ต RSS)
// /feed.xml = ทุกเรื่อง, /feed-work.xml = เฉพาะผลงานบริการ ส่งแค่หัวข้อ สรุปสั้น วันที่ ลิงก์ (เนื้อหาเต็มอยู่เว็บนี้ที่เดียว ไม่ให้ Google มองว่าซ้ำ)
import { sbGet, esc } from './meta.js';

const NAME = 'สมาคมวิทยากรฝึกอาชีพคนตาบอด';
const KIND = { news: 'ข่าวและกิจกรรม', article: 'บทความ', work: 'ผลงานบริการ' };

/* ข้อความสั้นจากเนื้อหา (เมื่อไม่มีสรุป): ตัดบรรทัดรูป เครื่องหมายหัวข้อ/รายการ ลิงก์มีชื่อเหลือแค่ชื่อ ยาวไม่เกิน 200 ตัวอักษร */
export function plain(body, max = 200) {
  const t = String(body || '').split('\n').filter(l => !/^\s*\[รูป[^\]]*\]\([^)]*\)\s*$/.test(l))
    .map(l => l.replace(/^\s*#{1,3}\s+/, '').replace(/^\s*[-•*]\s+/, '')).join(' ')
    .replace(/\[([^\[\]\n]+)\]\((https?:\/\/[^\s()]+)\)/g, '$1').replace(/\s+/g, ' ').trim();
  return t.length > max ? t.slice(0, max).trim() + '…' : t;
}
/* วันที่ (yyyy-mm-dd ตามเวลาไทย) เป็นรูปแบบที่ RSS ใช้ */
export function rfc822(day) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(day || ''));
  return m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], 1, 0, 0)).toUTCString() : '';
}

export async function feedResponse(request, kind) {
  const base = new URL('/', request.url).origin;
  const self = base + (kind === 'work' ? '/feed-work.xml' : '/feed.xml');
  const list = base + '/news/' + (kind === 'work' ? '?k=work' : '');
  const title = (kind === 'work' ? 'ผลงานบริการ' : 'ข่าวและบทความ') + ' | ' + NAME;
  let rows;
  try {
    rows = await sbGet('/rest/v1/site_articles?select=no,kind,title,summary,body,day&active=eq.true' + (kind ? '&kind=eq.' + kind : '') + '&order=day.desc,no.desc&limit=20');
  } catch (e) {
    return new Response('ดึงข้อมูลไม่สำเร็จ ลองใหม่ภายหลัง', { status: 503, headers: { 'Retry-After': '600', 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } });
  }
  const items = rows.map(r => {
    const link = base + '/news/' + r.no, d = rfc822(r.day);
    return '  <item>\n    <title>' + esc(r.title) + '</title>\n    <link>' + esc(link) + '</link>\n    <guid isPermaLink="true">' + esc(link) + '</guid>\n' +
      (d ? '    <pubDate>' + d + '</pubDate>\n' : '') + (KIND[r.kind] ? '    <category>' + esc(KIND[r.kind]) + '</category>\n' : '') +
      '    <description>' + esc((r.summary || '').trim() || plain(r.body)) + '</description>\n  </item>';
  }).join('\n');
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n<channel>\n' +
    '  <title>' + esc(title) + '</title>\n  <link>' + esc(list) + '</link>\n' +
    '  <description>' + esc(kind === 'work' ? 'หน่วยงานที่หมอนวดตาบอดของสมาคมไปให้บริการ' : 'ข่าว กิจกรรม และบทความเรื่องการจ้างงานคนตาบอดและบริการนวด จาก' + NAME) + '</description>\n' +
    '  <language>th</language>\n  <atom:link href="' + esc(self) + '" rel="self" type="application/rss+xml"/>\n' +
    (rows[0] && rfc822(rows[0].day) ? '  <lastBuildDate>' + rfc822(rows[0].day) + '</lastBuildDate>\n' : '') +
    items + (items ? '\n' : '') + '</channel>\n</rss>\n';
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=900', 'Access-Control-Allow-Origin': '*' } });
}
