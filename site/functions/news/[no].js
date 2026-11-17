// หน้า /news/<เลข> : ส่งหน้าเว็บเดิม (index.html) แต่ใส่หัวข้อ คำอธิบาย และรูปของบทความลงในแท็ก meta
// ถ้าดึงข้อมูลไม่ได้ ส่งหน้าเดิมไปตามปกติ (หน้าเว็บโหลดบทความเองอยู่แล้ว)
import { sbGet, imgUrl, withMeta } from '../../shared/meta.js';

const SITE = 'สมาคมวิทยากรฝึกอาชีพคนตาบอด';

export async function onRequestGet(ctx) {
  const { request, env, params } = ctx;
  const page = await env.ASSETS.fetch(new URL('/', request.url));
  const no = String(params.no || '');
  if (!/^\d{1,9}$/.test(no)) return page;
  let a = null;
  try {
    const r = await sbGet('/rest/v1/site_articles?select=no,kind,title,summary,cover_path,cover_alt,day,updated_at&active=eq.true&no=eq.' + no + '&limit=1');
    a = r && r[0];
  } catch (e) { return page; }
  const html = await page.text();
  const headers = new Headers(page.headers);
  headers.set('Content-Type', 'text/html; charset=utf-8');
  headers.set('Cache-Control', 'public, max-age=300');
  if (!a) {
    // ไม่มีบทความนี้: ให้ค้นหาเลิกเก็บลิงก์นี้ หน้าเว็บจะแสดงข้อความ "ไม่พบ" เอง
    return new Response(html.replace('</head>', '<meta name="robots" content="noindex">\n</head>'), { status: 404, headers });
  }
  const url = new URL('/news/' + a.no, request.url).toString();
  const img = imgUrl(a.cover_path);
  const desc = (a.summary || a.title).slice(0, 300);
  const out = withMeta(html, {
    title: a.title + ' | ' + SITE, desc, url, image: img, imageAlt: a.cover_alt,
    jsonld: {
      '@context': 'https://schema.org', '@type': a.kind === 'news' ? 'NewsArticle' : 'Article',
      headline: a.title.slice(0, 110), description: desc, datePublished: a.day, dateModified: a.updated_at || a.day,
      image: img ? [img] : undefined, mainEntityOfPage: url,
      publisher: { '@type': 'Organization', name: SITE, logo: { '@type': 'ImageObject', url: new URL('/icon-512.png', request.url).toString() } }
    }
  });
  return new Response(out, { status: 200, headers });
}
