// แผนผังเว็บสำหรับ Google: หน้าแรก หน้ารวมข่าว และบทความที่เผยแพร่ทุกเรื่อง (สร้างใหม่ทุกครั้ง เก็บแคช 1 ชั่วโมง)
import { sbGet, esc } from '../shared/meta.js';

export async function onRequestGet({ request }) {
  const base = new URL('/', request.url).origin;
  const urls = [{ loc: base + '/' }, { loc: base + '/news/' }];
  try {
    const rows = await sbGet('/rest/v1/site_articles?select=no,day,updated_at&active=eq.true&order=no.desc&limit=5000');
    for (const r of rows) urls.push({ loc: base + '/news/' + r.no, mod: String(r.updated_at || r.day || '').slice(0, 10) });
  } catch (e) { /* ดึงไม่ได้ ส่งเฉพาะหน้าหลัก */ }
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map(u => '  <url><loc>' + esc(u.loc) + '</loc>' + (u.mod ? '<lastmod>' + esc(u.mod) + '</lastmod>' : '') + '</url>').join('\n') +
    '\n</urlset>\n';
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
}
