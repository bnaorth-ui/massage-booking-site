// ทุกหน้าของเว็บ (/, /company/, /news/, /news/<เลข>, หน้าที่ไม่มี): ใส่เนื้อหาของหน้านั้นลงในหน้าเว็บตั้งแต่ตอนส่ง
// พร้อมชื่อหน้า คำอธิบาย ลิงก์หลัก (canonical) รูปแชร์ ข้อมูลโครงสร้างสำหรับ Google และกล่องติดต่อท้ายหน้า
// ให้ Google / Bing / LINE / Facebook เห็นเนื้อหาครบโดยไม่ต้องรันสคริปต์ หน้าเว็บในเบราว์เซอร์ใช้เนื้อหาที่ใส่มาเลย (ดู start() ใน index.html)
// เนื้อหาเดียวกับหน้าเว็บ มาจาก ../shared/views.js  ไฟล์อื่น (รูป ไอคอน .js) ส่งต่อไปตามปกติ
import '../shared/views.js';
import { sbGet, sbRpc, imgUrl, withMeta } from '../shared/meta.js';

const V = globalThis.SV;
const NAV = { home: 'home', company: 'company', list: 'news', post: 'news' };

export async function onRequest(ctx) {
  const req = ctx.request;
  const u = new URL(req.url);
  if (req.method !== 'GET' || /\.[A-Za-z0-9]+$/.test(u.pathname)) return ctx.next();
  const res = await ctx.next();
  if (!(res.headers.get('Content-Type') || '').includes('text/html')) return res;

  let r = V.parse(u.pathname, u.search);
  const contactP = sbRpc('public_contact').catch(() => null);
  let view = null, status = 200, art = null;
  if (r.name === 'home') view = V.homeHTML(await sbGet(V.listQ(null, 6)).catch(() => null));
  else if (r.name === 'company') view = V.companyHTML();
  else if (r.name === 'list') view = V.listHTML(r.kind, await sbGet(V.listQ(r.kind, V.PAGE + 1, 0)).catch(() => null));
  else if (r.name === 'post') {
    let rows;
    try { rows = await sbGet(V.postQ(r.no)); } catch (e) { rows = undefined; }
    if (rows === undefined) view = null; // ฐานข้อมูลไม่ตอบ: ส่งหน้าเปล่า ให้หน้าเว็บโหลดเอง
    else if (rows[0]) { art = rows[0]; view = V.postHTML(art, u.origin + '/news/' + art.no); }
    else { status = 404; view = V.notFoundHTML(V.POST_GONE); r = { name: 'notfound' }; }
  } else { status = 404; view = V.notFoundHTML(); }

  const contact = await contactP;
  let html = await res.text();
  const cp = V.canonPath(r);
  const url = cp ? u.origin + cp : null;
  const m = V.meta(r, art);
  const org = { '@context': 'https://schema.org', '@type': 'Organization', name: V.SITE_NAME, url: u.origin + '/', logo: u.origin + '/icon-512.png' };
  if (contact && contact.phone) org.telephone = String(contact.phone);
  if (contact && contact.email) org.email = String(contact.email);
  const jsonld = [org];
  let image = null;
  if (art) {
    image = imgUrl(art.cover_path);
    jsonld.push({
      '@context': 'https://schema.org', '@type': art.kind === 'news' ? 'NewsArticle' : 'Article',
      headline: String(art.title).slice(0, 110), description: m.desc, datePublished: art.day, dateModified: art.updated_at || art.day,
      image: image ? [image] : undefined, mainEntityOfPage: url,
      publisher: { '@type': 'Organization', name: V.SITE_NAME, logo: { '@type': 'ImageObject', url: u.origin + '/icon-512.png' } }
    });
  }
  html = withMeta(html, { title: m.title, desc: m.desc, url, ogType: art ? 'article' : 'website', image, imageAlt: art && art.cover_alt, jsonld, noindex: status === 404 });

  if (view !== null) html = html.replace(/<div class="wrap" id="view">[\s\S]*?<\/div><\/main>/, () => '<div class="wrap" id="view" data-ssr="' + V.esc(u.pathname + u.search) + '">' + view + '</div></main>');
  const key = NAV[r.name];
  if (key) html = html.replace('data-k="' + key + '">', 'data-k="' + key + '" aria-current="page">');
  const c = V.contactParts(contact);
  html = html.replace(/<p id="cName">[^<]*<\/p>/, () => '<p id="cName">' + c.name + '</p>')
    .replace('<p id="cPhone"></p>', () => '<p id="cPhone">' + c.phone + '</p>')
    .replace('<p id="cEmail"></p>', () => '<p id="cEmail">' + c.email + '</p>')
    .replace('<p id="cHours"></p>', () => '<p id="cHours">' + c.hours + '</p>')
    .replace(/<p class="copy" id="copy">[^<]*<\/p>/, () => '<p class="copy" id="copy">' + V.copyText(new Date().getUTCFullYear() + 543) + '</p>');

  const headers = new Headers(res.headers);
  headers.delete('Content-Length');
  headers.set('Content-Type', 'text/html; charset=utf-8');
  headers.set('Cache-Control', 'public, max-age=60');
  return new Response(html, { status, headers });
}
