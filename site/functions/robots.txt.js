// robots.txt ชี้ไปที่แผนผังเว็บของโดเมนที่เปิดอยู่ (ใช้ได้ทั้ง .pages.dev และโดเมนของสมาคมในอนาคต)
export async function onRequestGet({ request }) {
  const base = new URL('/', request.url).origin;
  return new Response('User-agent: *\nAllow: /\n\nSitemap: ' + base + '/sitemap.xml\n', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=86400' }
  });
}
