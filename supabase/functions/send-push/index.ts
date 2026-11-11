// Supabase Edge Function: send-push  (ส่ง Web Push ไปยังเครื่องของผู้รับ)
// เวอร์ชันเบา: ไม่พึ่งไลบรารีภายนอกเลย ใช้ WebCrypto ของระบบ จึงไม่ค้างตอนเริ่มทำงาน
// Deploy: Edge Functions > send-push > Code > ลบของเดิมให้หมด > วางโค้ดนี้ > Deploy updates
// ต้องปิด "Enforce JWT verification" (ฟังก์ชันนี้ตรวจรหัสลับ x-push-secret เอง)
// สำเนาโค้ดที่ใช้งานจริงบน Supabase เก็บไว้ในที่เก็บโค้ดเพื่อดูย้อนหลัง (ไม่มีรหัสลับในไฟล์นี้ รหัสอยู่ใน Secrets ของ Supabase)
// 2026-11-11: รับ "app" (customer/shop/staff/admin) จาก notif_push แล้วส่งเฉพาะเครื่องที่ลงทะเบียนจากแอปนั้น
//             เครื่องที่ยังไม่ระบุแอป (app เป็นค่าว่าง ลงทะเบียนจากหน้าเว็บรุ่นเก่า) ยังได้รับเหมือนเดิม
const enc = new TextEncoder();
const b64u = (u: Uint8Array) => btoa(String.fromCharCode(...u)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const unb64u = (s: string) => {
  s = s.trim().replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  return Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
};
const cat = (...a: Uint8Array[]) => {
  const o = new Uint8Array(a.reduce((n, x) => n + x.length, 0));
  let p = 0;
  for (const x of a) { o.set(x, p); p += x.length; }
  return o;
};
const subtle = crypto.subtle;

async function hkdf(salt: Uint8Array, ikm: Uint8Array, info: Uint8Array, len: number) {
  const k = await subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"]);
  return new Uint8Array(await subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt, info }, k, len * 8));
}

async function vapidAuth(endpoint: string, subj: string, pub: string, priv: string) {
  const p = unb64u(pub);
  const jwk = { kty: "EC", crv: "P-256", x: b64u(p.slice(1, 33)), y: b64u(p.slice(33, 65)), d: priv.trim(), ext: true };
  const key = await subtle.importKey("jwk", jwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const head = b64u(enc.encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const claim = b64u(enc.encode(JSON.stringify({ aud: new URL(endpoint).origin, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: subj })));
  const sig = new Uint8Array(await subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, enc.encode(head + "." + claim)));
  return "vapid t=" + head + "." + claim + "." + b64u(sig) + ", k=" + pub;
}

// เข้ารหัสข้อความตาม RFC 8291 (aes128gcm)
async function encrypt(payload: string, p256dh: string, auth: string) {
  const ua = unb64u(p256dh), authSecret = unb64u(auth);
  const eph = await subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
  const asPub = new Uint8Array(await subtle.exportKey("raw", eph.publicKey));
  const uaKey = await subtle.importKey("raw", ua, { name: "ECDH", namedCurve: "P-256" }, false, []);
  const ecdh = new Uint8Array(await subtle.deriveBits({ name: "ECDH", public: uaKey }, eph.privateKey, 256));
  const ikm = await hkdf(authSecret, ecdh, cat(enc.encode("WebPush: info\0"), ua, asPub), 32);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(salt, ikm, enc.encode("Content-Encoding: aes128gcm\0"), 16);
  const nonce = await hkdf(salt, ikm, enc.encode("Content-Encoding: nonce\0"), 12);
  const aes = await subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
  const ct = new Uint8Array(await subtle.encrypt({ name: "AES-GCM", iv: nonce }, aes, cat(enc.encode(payload), new Uint8Array([2]))));
  return cat(salt, new Uint8Array([0, 0, 0x10, 0]), new Uint8Array([asPub.length]), asPub, ct);
}

const J = { "Content-Type": "application/json" };
Deno.serve(async (req: Request) => {
  if (req.method === "GET") return new Response("send-push ok (native)", { status: 200 });
  if (req.method !== "POST") return new Response("method not allowed", { status: 405 });
  if (req.headers.get("x-push-secret") !== Deno.env.get("PUSH_SECRET")) return new Response("forbidden", { status: 403 });
  let b: { user_ids?: string[]; title?: string; body?: string; page?: string; tag?: string; app?: string };
  try { b = await req.json(); } catch { return new Response("bad request", { status: 400 }); }
  if (!Array.isArray(b.user_ids) || !b.user_ids.length) return new Response(JSON.stringify({ sent: 0 }), { headers: J });

  try {
    let subj = (Deno.env.get("VAPID_SUBJECT") || "").trim();
    if (/^[^\s@:]+@[^\s@]+\.[^\s@]+$/.test(subj)) subj = "mailto:" + subj;   // ใส่ mailto: ให้เองถ้าลืม
    const pub = (Deno.env.get("VAPID_PUBLIC_KEY") || "").trim();
    const priv = (Deno.env.get("VAPID_PRIVATE_KEY") || "").trim();
    if (!/^(mailto:[^\s@]+@[^\s@]+\.[^\s@]+|https:\/\/\S+)$/.test(subj)) throw new Error("VAPID_SUBJECT ต้องเป็นรูปแบบ mailto:อีเมล เช่น mailto:contact@example.com (ตอนนี้คือ: " + (subj || "ว่าง") + ")");
    if (!pub || !priv) throw new Error("ยังไม่ได้ตั้ง VAPID_PUBLIC_KEY หรือ VAPID_PRIVATE_KEY ใน Secrets");
    const url = Deno.env.get("SUPABASE_URL")!, svc = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const H = { apikey: svc, Authorization: "Bearer " + svc };
    const ids = b.user_ids.filter((x) => /^[0-9a-f-]{36}$/i.test(x));
    // ส่งเฉพาะเครื่องของแอปที่ตรงกับเรื่องนี้ (เบอร์เดียวกันอาจติดตั้งทั้งแอปผู้ใช้งานและแอปหมอนวด) + เครื่องที่ยังไม่ระบุแอป
    const app = typeof b.app === "string" && /^(customer|shop|staff|admin)$/.test(b.app) ? b.app : "";
    const r = await fetch(url + "/rest/v1/push_subscriptions?select=id,endpoint,p256dh,auth&user_id=in.(" + ids.join(",") + ")" + (app ? "&or=(app.is.null,app.eq." + app + ")" : ""), { headers: H, signal: AbortSignal.timeout(8000) });
    if (!r.ok) throw new Error("อ่านตาราง push_subscriptions ไม่ได้: " + r.status + " " + (await r.text()).slice(0, 150));
    const data: { id: string; endpoint: string; p256dh: string; auth: string }[] = await r.json();
    const payload = JSON.stringify({ title: b.title, body: b.body, page: b.page, tag: b.tag });
    let sent = 0;
    const gone: string[] = [], fails: string[] = [];
    await Promise.all(data.map(async (s) => {
      try {
        const body = await encrypt(payload, s.p256dh, s.auth);
        const res = await fetch(s.endpoint, {
          method: "POST",
          headers: { Authorization: await vapidAuth(s.endpoint, subj, pub, priv), "Content-Encoding": "aes128gcm", "Content-Type": "application/octet-stream", TTL: "86400", Urgency: "high" },
          body, signal: AbortSignal.timeout(10000),
        });
        if (res.status >= 200 && res.status < 300) sent++;
        else if (res.status === 404 || res.status === 410) gone.push(s.id);
        else fails.push(res.status + " " + (await res.text()).slice(0, 100));
      } catch (e) { fails.push((e as Error).message); }
    }));
    if (gone.length) await fetch(url + "/rest/v1/push_subscriptions?id=in.(" + gone.join(",") + ")", { method: "DELETE", headers: H, signal: AbortSignal.timeout(8000) });
    return new Response(JSON.stringify({ sent, removed: gone.length, subscriptions: data.length, app, fails }), { headers: J });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String((e as Error).message || e) }), { status: 500, headers: J });
  }
});
