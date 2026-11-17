// หน้าแรก (/) หน้ารวมข่าว (/news/) และหน้าสำหรับบริษัท (/company/): ใส่ลิงก์เต็มของหน้า (canonical, og:url) และรูปแชร์ ให้ LINE / Facebook / Google อ่านได้
// ไฟล์อื่น (รูป ไอคอน) และหน้าบทความ (/news/<เลข> ทำใน news/[no].js) ส่งต่อไปตามปกติ
import { withMeta } from '../shared/meta.js';

export async function onRequest(ctx) {
  const res = await ctx.next();
  const u = new URL(ctx.request.url);
  const path = u.pathname.replace(/\/index\.html$/, '/');
  if (ctx.request.method !== 'GET' || !(path === '/' || path === '/news' || path === '/news/' || path === '/company' || path === '/company/')) return res;
  if (!(res.headers.get('Content-Type') || '').includes('text/html')) return res;
  const canon = u.origin + (path === '/' ? '/' : path.startsWith('/company') ? '/company/' : '/news/') + (path.startsWith('/news') && u.searchParams.get('k') ? '?k=' + encodeURIComponent(u.searchParams.get('k')) : '');
  const html = withMeta(await res.text(), { url: canon });
  const headers = new Headers(res.headers);
  headers.delete('Content-Length');
  return new Response(html, { status: res.status, headers });
}
