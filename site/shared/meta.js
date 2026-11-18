// ใช้ร่วมกันระหว่าง functions ของ Cloudflare Pages (ไฟล์นี้เปิดอ่านได้จากเว็บด้วย แต่มีเฉพาะข้อมูลที่เปิดเผยได้)
// กุญแจ publishable ของ Supabase เปิดเผยได้ (ตัวเดียวกับในหน้าเว็บ) อ่านได้เฉพาะบทความที่เผยแพร่ตาม RLS
export const SB = { url: 'https://dwdnmfwepydyweeqfdxn.supabase.co', key: 'sb_publishable_4xaAEuN8jFIxGjyhtzABow_FsbGcoI3' };

function sbHeaders() { return { apikey: SB.key, Authorization: 'Bearer ' + SB.key }; }
export async function sbGet(path) {
  const r = await fetch(SB.url + path, { headers: sbHeaders() });
  if (!r.ok) throw new Error('supabase ' + r.status);
  return r.json();
}
export async function sbRpc(name) {
  const r = await fetch(SB.url + '/rest/v1/rpc/' + name, { method: 'POST', headers: { ...sbHeaders(), 'Content-Type': 'application/json' }, body: '{}' });
  if (!r.ok) throw new Error('supabase ' + r.status);
  return r.json();
}

export function esc(x) {
  return String(x == null ? '' : x).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}


// แทนค่าแท็ก meta ในหน้า index.html ให้ตรงกับหน้านั้น ให้ Google / LINE / Facebook เห็นชื่อหน้า คำอธิบาย และรูปที่ถูกต้อง
// (โปรแกรมพวกนี้มักไม่รันสคริปต์ในหน้าเว็บ) m: { title, desc, url, ogType, image, imageAlt, jsonld: [..], noindex }
export function withMeta(html, m) {
  const setMeta = (h, attr, name, val) => {
    const re = new RegExp('(<meta ' + attr + '="' + name.replace(/[:]/g, '\\$&') + '" content=")[^"]*(")');
    return re.test(h) ? h.replace(re, '$1' + val + '$2') : h.replace('</head>', '<meta ' + attr + '="' + name + '" content="' + val + '">\n</head>');
  };
  let h = html;
  if (m.title) {
    const t = esc(m.title);
    h = h.replace(/<title>[^<]*<\/title>/, '<title>' + t + '</title>');
    h = setMeta(h, 'property', 'og:title', t);
  }
  if (m.desc) {
    const d = esc(m.desc);
    h = setMeta(h, 'name', 'description', d);
    h = setMeta(h, 'property', 'og:description', d);
  }
  if (m.ogType) h = setMeta(h, 'property', 'og:type', m.ogType);
  if (m.url) {
    h = setMeta(h, 'property', 'og:url', esc(m.url));
    h = h.replace('</head>', '<link rel="canonical" href="' + esc(m.url) + '">\n</head>');
  }
  if (m.image) {
    h = setMeta(h, 'property', 'og:image', esc(m.image));
    h = h.replace(/<meta property="og:image:(width|height)" content="[^"]*">\n?/g, '');
    h = setMeta(h, 'property', 'og:image:alt', esc(m.imageAlt || m.title || ''));
  } else if (m.url) {
    // รูปเริ่มต้นของเว็บ: LINE / Facebook ต้องการลิงก์เต็ม
    h = h.replace('<meta property="og:image" content="/', '<meta property="og:image" content="' + esc(new URL(m.url).origin) + '/');
  }
  if (m.noindex) h = h.replace('</head>', '<meta name="robots" content="noindex">\n</head>');
  for (const j of m.jsonld || []) h = h.replace('</head>', '<script type="application/ld+json">' + JSON.stringify(j).replace(/</g, '\\u003c') + '</script>\n</head>');
  return h;
}
