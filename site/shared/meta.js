// ใช้ร่วมกันระหว่าง functions ของ Cloudflare Pages (ไฟล์นี้เปิดอ่านได้จากเว็บด้วย แต่มีเฉพาะข้อมูลที่เปิดเผยได้)
// กุญแจ publishable ของ Supabase เปิดเผยได้ (ตัวเดียวกับในหน้าเว็บ) อ่านได้เฉพาะบทความที่เผยแพร่ตาม RLS
export const SB = { url: 'https://dwdnmfwepydyweeqfdxn.supabase.co', key: 'sb_publishable_4xaAEuN8jFIxGjyhtzABow_FsbGcoI3' };

export async function sbGet(path) {
  const r = await fetch(SB.url + path, { headers: { apikey: SB.key, Authorization: 'Bearer ' + SB.key } });
  if (!r.ok) throw new Error('supabase ' + r.status);
  return r.json();
}

export function esc(x) {
  return String(x == null ? '' : x).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function imgUrl(p) {
  if (!p) return null;
  if (/^https?:\/\//.test(p)) return p;
  return SB.url + '/storage/v1/object/public/' + (/^place-images\//.test(p) ? p : 'place-images/' + p);
}

// แทนค่าแท็ก meta ในหน้า index.html ด้วยข้อมูลของบทความ เพื่อให้ LINE / Facebook / Google เห็นหัวข้อ คำอธิบาย และรูปที่ถูกต้อง
// (โปรแกรมพวกนี้ไม่รันสคริปต์ในหน้าเว็บ)
export function withMeta(html, m) {
  const t = esc(m.title), d = esc(m.desc), u = esc(m.url);
  const setMeta = (h, attr, name, val) => {
    const re = new RegExp('(<meta ' + attr + '="' + name.replace(/[:]/g, '\\$&') + '" content=")[^"]*(")');
    return re.test(h) ? h.replace(re, '$1' + val + '$2') : h.replace('</head>', '<meta ' + attr + '="' + name + '" content="' + val + '">\n</head>');
  };
  let h = html;
  if (m.title) {
    h = h.replace(/<title>[^<]*<\/title>/, '<title>' + t + '</title>');
    h = setMeta(h, 'name', 'description', d);
    h = setMeta(h, 'property', 'og:type', 'article');
    h = setMeta(h, 'property', 'og:title', t);
    h = setMeta(h, 'property', 'og:description', d);
  }
  h = setMeta(h, 'property', 'og:url', u);
  if (m.image) {
    h = setMeta(h, 'property', 'og:image', esc(m.image));
    h = h.replace(/<meta property="og:image:(width|height)" content="[^"]*">/g, '');
    h = setMeta(h, 'property', 'og:image:alt', esc(m.imageAlt || m.title));
  } else {
    // รูปเริ่มต้นของเว็บ: LINE / Facebook ต้องการลิงก์เต็ม
    h = h.replace('<meta property="og:image" content="/', '<meta property="og:image" content="' + esc(new URL(m.url).origin) + '/');
  }
  h = h.replace('</head>', '<link rel="canonical" href="' + u + '">\n</head>');
  if (m.jsonld) h = h.replace('</head>', '<script type="application/ld+json">' + JSON.stringify(m.jsonld).replace(/</g, '\\u003c') + '</script>\n</head>');
  return h;
}
