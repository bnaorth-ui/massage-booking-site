/* เนื้อหาของเว็บประชาสัมพันธ์ ใช้ร่วมกัน 2 ที่:
   1) หน้าเว็บ (index.html โหลดไฟล์นี้ด้วย <script src="/shared/views.js">) ใช้ตอนกดเปลี่ยนหน้า
   2) Cloudflare (functions/_middleware.js import ไฟล์นี้) ใส่เนื้อหาลงหน้าเว็บตั้งแต่ตอนส่ง ให้ Google / Bing / LINE เห็นเนื้อหาโดยไม่ต้องรันสคริปต์
   ไฟล์นี้ห้ามแตะ document / window (ทำงานได้ทั้งสองที่) แก้ข้อความหน้าเว็บที่นี่ที่เดียว */
(function (G) {
  "use strict";
  var SB = { url: "https://dwdnmfwepydyweeqfdxn.supabase.co", key: "sb_publishable_4xaAEuN8jFIxGjyhtzABow_FsbGcoI3" };
  var APP = { book: "https://massage-customer-bna.pages.dev/", shop: "https://massage-shop-bna.pages.dev/reg/", staff: "https://massage-staff-bna.pages.dev/apply/", company: "https://massage-customer-bna.pages.dev/?company=1", orgreq: "https://massage-customer-bna.pages.dev/?orgreq=1", privacy: "https://massage-customer-bna.pages.dev/privacy/" };
  var KIND = { news: "ข่าวและกิจกรรม", article: "บทความ", work: "ผลงานบริการ" };
  var SITE_NAME = "สมาคมวิทยากรฝึกอาชีพคนตาบอด";
  /* สถานะทางกฎหมายของสมาคม (หัวเว็บ ท้ายเว็บ และข้อมูลสำหรับ Google) ผู้ใช้ยืนยัน 19 พ.ย. 2569 ไม่ใส่เลขหนังสือรับรอง */
  var ORG_STATUS = "องค์กรสาธารณประโยชน์";
  /* ที่อยู่ของเว็บนี้ ลิงก์ในเนื้อหาที่ชี้มาเว็บนี้เปิดในหน้าเดิม (ถ้าเปลี่ยนชื่อเว็บใน Cloudflare แก้ที่นี่ด้วย) */
  var SITE_HOST = "massage-home-bna.pages.dev";
  /* เว็บไซต์หลักของสมาคม (ผู้ใช้ยืนยัน 18 พ.ย. 2569) เว็บนี้เน้นการจ้างงานคนตาบอด ข่าว ผลงาน การสมัคร และจองนวด */
  var ORG_SITE = "https://bna.or.th/";
  /* ข้อมูลกฎหมายหน้า "สำหรับบริษัท" ตรวจเมื่อ พ.ย. 2569 (กรมการจัดหางาน, กรมส่งเสริมและพัฒนาคุณภาพชีวิตคนพิการ) มูลค่ามาตรา 35 เปลี่ยนทุกปี ปรับที่นี่ */
  var LAW = { s35Value: "123,005", s35Year: "2570" };
  var LIST_COLS = "no,kind,title,summary,cover_path,cover_alt,day,pinned";
  var PAGE = 12;
  var MONTHS = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];

  function esc(x) { return String(x == null ? "" : x).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function imgUrl(p) { if (!p) return null; if (/^https?:\/\//.test(p)) return p; return SB.url + "/storage/v1/object/public/" + (/^place-images\//.test(p) ? p : "place-images/" + p); }
  /* วันที่ไทย เช่น 17 พฤศจิกายน 2569 (เขียนเอง ไม่พึ่ง Intl ให้ผลเหมือนกันทั้งในเครื่องและบน Cloudflare) */
  function thDate(s) { var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(s || "")); if (!m) return ""; var mo = +m[2]; if (mo < 1 || mo > 12) return ""; return (+m[3]) + " " + MONTHS[mo - 1] + " " + (+m[1] + 543); }
  /* kind: "" = ทุกประเภท, "!work" = ทุกประเภทยกเว้นผลงานบริการ (ข่าวล่าสุดหน้าแรก เพราะผลงานมีส่วนของตัวเอง) */
  function listQ(kind, limit, offset) { return "/rest/v1/site_articles?select=" + LIST_COLS + "&active=eq.true" + (kind === "!work" ? "&kind=neq.work" : kind ? "&kind=eq." + kind : "") + "&order=pinned.desc,day.desc,no.desc&limit=" + limit + (offset ? "&offset=" + offset : ""); }
  function postQ(no) { return "/rest/v1/site_articles?select=*&active=eq.true&no=eq." + no + "&limit=1"; }

  /* ประเภทที่มีเรื่องเผยแพร่แล้ว (ใช้ซ่อนตัวกรองที่ยังว่าง) */
  var KINDS_Q = "/rest/v1/site_articles?select=kind&active=eq.true";
  function kindsOf(rows) { var o = {}; (rows || []).forEach(function (x) { if (KIND[x.kind]) o[x.kind] = 1; }); return Object.keys(o); }

  /* เนื้อหาบทความ: ข้อความธรรมดา (ไม่รับ HTML)
     - บรรทัดว่างคั่นย่อหน้า, "## " = หัวข้อย่อย, "- " = รายการ
     - ลิงก์ https:// กดได้ ตั้งชื่อเองได้ด้วย [ข้อความ](https://...)
     - ลิงก์มาเว็บนี้เปิดในหน้าเดิม ไม่ตั้งชื่อเอง ระบบตั้งชื่อหน้าให้ (บทความเรื่องอื่นใช้ชื่อเรื่อง ถ้ารู้) ลิงก์ไปเว็บอื่นเปิดหน้าต่างใหม่
     - บรรทัดรูป [รูป: คำบรรยาย](ที่อยู่รูป) หรือ [รูป](ที่อยู่รูป) แอปแอดมินใส่ให้ตอนกด "แทรกรูปในเนื้อหา"
     opt: { title: หัวข้อเรื่อง (ใช้เป็นคำบรรยายสำรอง), titles: { เลขเรื่อง: ชื่อเรื่อง } } */
  var IMG_LINE = /^\[รูป(?:\s*:\s*([^\]]*))?\]\(([^()\s]+)\)$/;
  var LINK_RE = /\[([^\[\]\n]+)\]\((https?:\/\/[^\s()<>]+)\)|https?:\/\/[^\s<>]+[^\s<>.,;:!?)"'\]]/g;
  function ownName(rest, titles) {
    var h = rest.split("#")[0], q = h.indexOf("?"), r = parse(q >= 0 ? h.slice(0, q) || "/" : h, q >= 0 ? h.slice(q) : "");
    if (r.name === "home") return "หน้าแรก";
    if (r.name === "company") return "หน้าบริษัทและหน่วยงาน";
    if (r.name === "list") return r.kind ? "หน้า" + KIND[r.kind] : "หน้าข่าวและบทความ";
    if (r.name === "post" && titles && titles[r.no]) return titles[r.no];
    return null;
  }
  function linkTo(u, text, titles) {
    var m = /^https?:\/\/([^\/?#]+)(.*)$/.exec(u);
    if (m && m[1].toLowerCase() === SITE_HOST) { var rest = m[2] || "/"; return '<a href="' + esc(rest) + '" data-nav>' + esc(text || ownName(rest, titles) || u) + '</a>'; }
    return '<a href="' + esc(u) + '" rel="noopener nofollow" target="_blank">' + esc(text || u) + '<span class="sr"> (เปิดหน้าต่างใหม่)</span></a>';
  }
  function linkify(s, titles) {
    var out = "", last = 0; s = String(s); LINK_RE.lastIndex = 0;
    s.replace(LINK_RE, function (all, text, url, at) { out += esc(s.slice(last, at)) + (url ? linkTo(url, text.trim(), titles) : linkTo(all, null, titles)); last = at + all.length; return all; });
    return out + esc(s.slice(last));
  }
  function okImg(p) { return /^https:\/\//.test(p) || /^(place-images\/)?[\w\-\/.]+\.(jpe?g|png|webp|gif)$/i.test(p); }
  function figure(cap, path, title) {
    var u = imgUrl(path), c = (cap || "").trim();
    return '<figure class="inimg"><img loading="lazy" decoding="async" src="' + esc(u) + '" alt="' + esc(c || altFor(title)) + '">' + (c ? '<figcaption>' + esc(c) + '</figcaption>' : '') + '</figure>';
  }
  /* คำบรรยายสำรอง เมื่อแอดมินไม่ได้ใส่ (ไม่บังคับ) */
  function altFor(title) { return "รูปประกอบเรื่อง " + String(title || "").trim(); }
  /* เลขเรื่องในเว็บนี้ที่เนื้อหาลิงก์ไปถึง (ไว้ถามชื่อเรื่อง) */
  function linkedNos(t) {
    var o = {}, re = new RegExp("https?://" + SITE_HOST.replace(/\./g, "\\.") + "/news/(\\d+)", "gi"), m;
    while ((m = re.exec(String(t || "")))) o[m[1]] = 1;
    return Object.keys(o).slice(0, 20);
  }
  function titlesQ(nos) { return "/rest/v1/site_articles?select=no,title&active=eq.true&no=in.(" + nos.join(",") + ")"; }
  function titleMap(rows) { var o = {}; (rows || []).forEach(function (x) { o[x.no] = x.title; }); return o; }
  function renderBody(t, opt) {
    opt = opt || {};
    var out = [], titles = opt.titles, L = function (x) { return linkify(x, titles); }, blocks = String(t || "").replace(/\r/g, "").split(/\n\s*\n/);
    blocks.forEach(function (b) {
      var lines = b.split("\n").filter(function (l) { return l.trim() !== ""; }); if (!lines.length) return;
      var buf = [], list = [];
      function flushP() { if (buf.length) { out.push("<p>" + buf.map(L).join("<br>") + "</p>"); buf = []; } }
      function flushL() { if (list.length) { out.push("<ul>" + list.map(function (x) { return "<li>" + L(x) + "</li>"; }).join("") + "</ul>"); list = []; } }
      lines.forEach(function (l) {
        var s = l.trim(), im = IMG_LINE.exec(s);
        if (im && okImg(im[2])) { flushP(); flushL(); out.push(figure(im[1], im[2], opt.title)); }
        else if (/^#{2,3}\s+/.test(s)) { flushP(); flushL(); out.push("<h2>" + L(s.replace(/^#{2,3}\s+/, "")) + "</h2>"); }
        else if (/^[-•*]\s+/.test(s)) { flushP(); list.push(s.replace(/^[-•*]\s+/, "")); }
        else { flushL(); buf.push(s); }
      });
      flushP(); flushL();
    });
    return out.join("");
  }
  function card(a, lvl) {
    var u = imgUrl(a.cover_path), h = lvl || 3;
    return '<li class="card">' + (u ? '<img loading="lazy" decoding="async" src="' + esc(u) + '" alt="">' : '<div class="ph" aria-hidden="true">' + (a.kind === "article" ? "📖" : a.kind === "work" ? "🤝" : "📣") + '</div>') +
      '<div class="in"><div class="meta"><span class="tag">' + esc(KIND[a.kind] || "ข่าว") + '</span>' + (a.pinned ? '<span class="tag">ปักหมุด</span>' : '') + '<span>' + esc(thDate(a.day)) + '</span></div>' +
      '<h' + h + '><a href="/news/' + a.no + '" data-nav>' + esc(a.title) + '</a></h' + h + '>' + (a.summary ? '<p>' + esc(a.summary) + '</p>' : '') + '</div></li>';
  }
  function errBox(msg) { return '<div class="err" role="alert"><p>' + esc(msg || "โหลดข้อมูลไม่สำเร็จ") + '</p><button class="btn ghost" type="button" data-retry>ลองอีกครั้ง</button></div>'; }
  var LOADING = '<p>กำลังโหลด...</p>';

  /* แยกลิงก์เป็นหน้า: home, company, list (kind), post (no), notfound */
  function parse(pathname, search) {
    var p = String(pathname || "/").replace(/\/index\.html$/, "/").replace(/\/+$/, "") || "/", m;
    if (p === "/") return { name: "home" };
    if (p === "/company") return { name: "company" };
    if (p === "/company/calc") return { name: "calc" };
    if (p === "/news") { var k = (/[?&]k=([^&]*)/.exec(search || "") || [])[1] || ""; return { name: "list", kind: KIND[k] ? k : "" }; }
    if ((m = p.match(/^\/news\/(\d{1,9})$/))) return { name: "post", no: +m[1] };
    return { name: "notfound" };
  }
  /* ลิงก์หลักของหน้า (canonical) */
  function canonPath(r) { return r.name === "home" ? "/" : r.name === "company" ? "/company/" : r.name === "calc" ? "/company/calc/" : r.name === "list" ? "/news/" + (r.kind ? "?k=" + r.kind : "") : r.name === "post" ? "/news/" + r.no : null; }

  /* ชื่อหน้า (แถบเบราว์เซอร์ / ผลค้นหา Google) และคำอธิบาย แยกตามหน้า */
  function meta(r, a, info) {
    if (r.name === "home") return { title: "จ้างงานคนตาบอด มาตรา 33, 35 และบริการนวดโดยหมอนวดตาบอด | " + SITE_NAME, desc: "จ้างหมอนวดผู้พิการทางการเห็นที่ขึ้นทะเบียนถูกต้องไปนวดให้พนักงานแบบครั้งคราว หรือจ้างประจำตามมาตรา 33, 35 ผลงานที่ไปให้บริการ ข่าวสาร สมัครเป็นหมอนวด และจองนวดออนไลน์ จาก" + SITE_NAME };
    if (r.name === "company") { var pr = baht(info && info.rate); return { title: "นวดออฟฟิศซินโดรมให้พนักงาน และจ้างงานคนพิการ มาตรา 33, 35 | " + SITE_NAME, desc: "จ้างหมอนวดตาบอดที่ขึ้นทะเบียนถูกต้องไปนวดออฟฟิศซินโดรมให้พนักงานที่บริษัท" + (pr ? " " + pr + " ต่อหมอนวด 1 คน ต่อชั่วโมง (กรุงเทพฯ)" : "") + " หรือจ้างประจำตามมาตรา 33, 35 ใช้แทนการส่งเงินเข้ากองทุนตามมาตรา 34" }; }
    if (r.name === "calc") return { title: "คำนวณจำนวนคนพิการที่บริษัทต้องจ้าง และเงินส่งกองทุน มาตรา 34 | " + SITE_NAME, desc: "กรอกจำนวนพนักงาน รู้ทันทีว่าบริษัทต้องจ้างคนพิการกี่คนตามมาตรา 33 และถ้าไม่จ้างต้องส่งเงินเข้ากองทุนตามมาตรา 34 ปีละเท่าไร พร้อมทางเลือกจ้างหมอนวดตาบอดตามมาตรา 33 หรือ 35" };
    if (r.name === "list") { var t = r.kind ? KIND[r.kind] : "ข่าวและบทความ"; return { title: t + " | " + SITE_NAME, desc: (r.kind === "work" ? "หน่วยงานและบริษัทที่" + SITE_NAME + "ส่งหมอนวดตาบอดไปให้บริการนวด" : "รวม" + t + "จาก" + SITE_NAME + " เรื่องการนวดแผนไทย หมอนวดตาบอด และกิจกรรมของสมาคม") }; }
    if (r.name === "post" && a) return { title: a.title + " | " + SITE_NAME, desc: String(a.summary || a.title).slice(0, 300) };
    return { title: "ไม่พบหน้านี้ | " + SITE_NAME, desc: "" };
  }

  /* หน้าแรก (เน้นการจ้างงานคนตาบอด ยังมีการจองนวด): หัวข้อหลัก -> บริษัทและหน่วยงาน -> ผลงานบริการ -> ข่าวและบทความล่าสุด -> ร่วมงานกับเรา -> จองนวด
     latest / works: แถวจากฐานข้อมูล หรือ null = ให้หน้าเว็บโหลดเอง (works [] = ซ่อนส่วนผลงาน) */
  function homeHTML(latest, works) {
    return '<div class="hero"><h1>จ้างงานคนตาบอดผ่านงานนวด ที่ขึ้นทะเบียนถูกต้อง</h1><p>จ้างหมอนวดผู้พิการทางการเห็นไปนวดให้พนักงานแบบครั้งคราว หรือจ้างประจำตามมาตรา 33, 35 และร่วมสร้างอาชีพที่มั่นคงให้คนตาบอด</p><div class="btns"><a class="btn" href="/company/" data-nav>สำหรับบริษัทและหน่วยงาน</a><a class="btn ghost" href="' + APP.book + '">จองนวดออนไลน์</a><a class="btn ghost" href="/news/" data-nav>อ่านข่าวและบทความ</a></div></div>' +
      '<section aria-labelledby="hBiz"><h2 id="hBiz">สำหรับบริษัทและหน่วยงาน</h2><div class="box"><h3>นวดออฟฟิศซินโดรมให้พนักงาน หรือจ้างประจำตามมาตรา 33, 35</h3><p>จ้างหมอนวดตาบอดไปนวดที่บริษัทเป็นครั้งคราวสำหรับงานกิจกรรม หรือจ้างประจำเพื่อใช้เป็นการจ้างงานคนพิการตามกฎหมาย</p><div class="btns"><a class="btn" href="/company/" data-nav>ดูรายละเอียดและราคา</a><a class="btn ghost" href="' + APP.orgreq + '">ขอบริการสำหรับหน่วยงาน</a><a class="btn ghost" href="/company/calc/" data-nav>คำนวณจำนวนคนพิการที่ต้องจ้าง</a></div></div></section>' +
      worksSection(works) +
      '<section aria-labelledby="hLatest"><div class="secHead"><h2 id="hLatest">ข่าวและบทความล่าสุด</h2><a href="/news/" data-nav>ดูทั้งหมด</a></div>' + (latest ? '<div id="latest">' + latestHTML(latest) + '</div>' : '<div id="latest" data-pending>' + LOADING + '</div>') + '</section>' +
      '<section aria-labelledby="hJoin"><h2 id="hJoin">ร่วมงานกับเรา</h2><div class="cols"><div class="box"><h3>สมัครเป็นหมอนวด</h3><p>หมอนวดที่ขึ้นทะเบียนแล้ว สมัครเพื่อรับงานจากร้านและหน่วยงานในระบบ</p><a class="btn" href="' + APP.staff + '">สมัครเป็นหมอนวด</a></div><div class="box"><h3>สมัครเปิดร้านนวด</h3><p>ร้านนวดที่จดทะเบียนถูกต้อง สมัครเข้าระบบเพื่อรับคิวจากลูกค้าออนไลน์</p><a class="btn" href="' + APP.shop + '">สมัครเปิดร้าน</a></div></div></section>' +
      '<section aria-labelledby="hHow"><h2 id="hHow">จองนวดง่ายๆ 3 ขั้นตอน</h2><div class="box"><ol class="steps"><li>เลือกร้านนวดใกล้คุณ และเลือกบริการที่ต้องการ</li><li>เลือกวัน เวลา และหมอนวด</li><li>เข้าสู่ระบบด้วยเบอร์โทร แล้วยืนยันการจอง เลื่อนหรือยกเลิกเองได้ภายหลัง</li></ol><p style="margin:14px 0 0"><a class="btn" href="' + APP.book + '">เริ่มจองนวด</a></p></div></section>';
  }
  /* ส่วน "หน่วยงานที่เราเคยไปให้บริการ" (ใช้ทั้งหน้าแรกและหน้าบริษัท) */
  function worksSection(works) {
    var head = '<section aria-labelledby="hWorks" id="worksSec"><div class="secHead"><h2 id="hWorks">หน่วยงานที่เราเคยไปให้บริการ</h2><a href="/news/?k=work" data-nav>ดูทั้งหมด</a></div>';
    if (works === null || works === undefined) return head + '<div id="works" data-pending>' + LOADING + '</div></section>';
    return works.length ? head + '<div id="works"><ul class="grid">' + works.map(function (x) { return card(x, 3); }).join("") + '</ul></div></section>' : '';
  }
  function latestHTML(a) { return a.length ? '<ul class="grid">' + a.map(function (x) { return card(x, 3); }).join("") + '</ul>' : '<div class="empty">ยังไม่มีข่าวในตอนนี้ ติดตามได้เร็วๆ นี้</div>'; }

  /* ตัวกรองประเภท แสดงเฉพาะประเภทที่มีเรื่องแล้ว (และประเภทที่กำลังเปิดอยู่) ถ้ามีประเภทเดียว ไม่ต้องมีตัวกรอง
     kinds: รายชื่อประเภทที่มีเรื่อง หรือ null = ยังไม่รู้ (แสดงทุกประเภท) */
  function filtersHTML(kind, kinds) {
    var show = ["news", "work", "article"].filter(function (k) { return !kinds || kinds.indexOf(k) >= 0 || k === kind; });
    if (show.length < 2 && !kind) return "";
    return '<nav aria-label="เลือกประเภท"><ul class="filters">' + [""].concat(show).map(function (k) { return '<li><a href="/news/' + (k ? "?k=" + k : "") + '" data-nav' + (k === kind ? ' aria-current="page"' : '') + '>' + (k ? KIND[k] : "ทั้งหมด") + '</a></li>'; }).join("") + '</ul></nav>';
  }
  /* items: แถวที่ได้จากฐานข้อมูล (ขอมา PAGE+1 แถว เพื่อรู้ว่ามีหน้าต่อไหม) หรือ null = ให้หน้าเว็บโหลดเอง */
  function listHTML(kind, items, kinds) {
    var head = '<h1>' + esc(kind ? KIND[kind] : "ข่าวและบทความ") + '</h1><div id="filt"' + (kinds ? '' : ' data-pending') + '>' + filtersHTML(kind, kinds) + '</div>';
    if (!items) return head + '<div id="list" data-pending>' + LOADING + '</div>';
    return head + '<div id="list">' + listBody(kind, items, 0) + '</div>';
  }
  function listBody(kind, items, offset) {
    var more = items.length > PAGE; items = items.slice(0, PAGE);
    if (!items.length && !offset) return '<div class="empty">ยังไม่มี' + (kind ? KIND[kind] : "ข่าวหรือบทความ") + 'ในตอนนี้</div>';
    return '<ul class="grid">' + items.map(function (x) { return card(x, 2); }).join("") + '</ul>' + moreBtn(kind, offset, more);
  }
  function moreBtn(kind, offset, more) { return more ? '<div class="more"><button class="btn ghost" type="button" data-more="' + (offset + PAGE) + '" data-kind="' + esc(kind) + '">ดูเพิ่มเติม</button></div>' : ''; }

  /* เรื่องก่อนหน้า (เก่ากว่า) / เรื่องถัดไป (ใหม่กว่า) ในประเภทเดียวกัน เรียงตามวันที่แสดงบนเว็บ แล้วตามเลขเรื่อง */
  function adjQ(a, dir) {
    var d = String(a.day || "").slice(0, 10), op = dir === "prev" ? "lt" : "gt", ord = dir === "prev" ? "desc" : "asc";
    return "/rest/v1/site_articles?select=no,title,kind&active=eq.true&kind=eq." + a.kind + "&or=(day." + op + "." + d + ",and(day.eq." + d + ",no." + op + "." + a.no + "))&order=day." + ord + ",no." + ord + "&limit=1";
  }
  /* adj: { prev, next } (แถวหรือ null) หรือ null = ยังไม่โหลด (ให้หน้าเว็บโหลดเอง) */
  function adjHTML(adj) {
    if (!adj || (!adj.prev && !adj.next)) return "";
    function one(x, lbl, cls) { return x ? '<a class="pn-' + cls + '" href="/news/' + x.no + '" data-nav><span class="pn-l">' + lbl + '</span><span class="pn-t">' + esc(x.title) + '</span></a>' : ''; }
    return one(adj.prev, "← เรื่องก่อนหน้า", "prev") + one(adj.next, "เรื่องถัดไป →", "next");
  }
  function postHTML(a, link, shareLabel, adj, titles) {
    var u = imgUrl(a.cover_path);
    return '<article class="post"><nav class="crumb" aria-label="ตำแหน่งหน้า"><a href="/" data-nav>หน้าแรก</a> / <a href="/news/" data-nav>ข่าวและบทความ</a> / <a href="/news/?k=' + esc(a.kind) + '" data-nav>' + esc(KIND[a.kind] || "ข่าว") + '</a></nav>' +
      '<h1>' + esc(a.title) + '</h1><div class="meta"><span>' + esc(KIND[a.kind] || "ข่าว") + '</span><span aria-hidden="true">·</span><span>วันที่ ' + esc(thDate(a.day)) + '</span></div>' +
      (u ? '<figure><img class="cover" src="' + esc(u) + '" alt="' + esc(a.cover_alt || altFor(a.title)) + '">' + (a.cover_alt ? '<figcaption>' + esc(a.cover_alt) + '</figcaption>' : '') + '</figure>' : '') +
      (a.summary ? '<p class="lead">' + esc(a.summary) + '</p>' : '') + '<div class="body">' + renderBody(a.body, { title: a.title, titles: titles }) + '</div>' +
      '<div class="share"><h2>แชร์เรื่องนี้</h2><div class="btns"><a class="btn" href="https://social-plugins.line.me/lineit/share?url=' + encodeURIComponent(link) + '" target="_blank" rel="noopener">แชร์ไป LINE<span class="sr"> (เปิดหน้าต่างใหม่)</span></a><a class="btn" href="https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(link) + '" target="_blank" rel="noopener">แชร์ไป Facebook<span class="sr"> (เปิดหน้าต่างใหม่)</span></a><button class="btn ghost" type="button" data-copy="' + esc(link) + '">' + esc(shareLabel || "คัดลอกลิงก์") + '</button></div></div>' +
      '<nav class="pn" id="pn" aria-label="เรื่องอื่นใน' + esc(KIND[a.kind] || "ข่าว") + '" data-no="' + a.no + '" data-day="' + esc(String(a.day || "").slice(0, 10)) + '" data-kind="' + esc(a.kind) + '"' + (adj ? '' : ' data-pending') + '>' + adjHTML(adj) + '</nav>' +
      '<p class="backs"><a href="/news/" data-nav>กลับไปหน้าข่าวและบทความ</a><a href="/" data-nav>กลับหน้าแรก</a></p></article>';
  }
  function notFoundHTML(msg) { return '<h1>ไม่พบหน้านี้</h1><p>' + esc(msg || "ลิงก์อาจไม่ถูกต้อง หรือหน้านี้ถูกย้ายไปแล้ว") + '</p><div class="btns"><a class="btn" href="/" data-nav>ไปหน้าแรก</a><a class="btn ghost" href="/news/" data-nav>ข่าวและบทความ</a></div>'; }
  var POST_GONE = "ไม่พบข่าวหรือบทความนี้ อาจถูกลบหรือซ่อนไปแล้ว";

  /* อัตราค่าบริการ เช่น 400 -> "400 บาท" (ใส่จุลภาคเอง ไม่พึ่ง Intl) */
  function baht(n) { n = Number(n); if (!(n > 0)) return ""; var s = String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ","); return s + " บาท"; }
  function telHref(phone) { var ph = String(phone || "").replace(/\D/g, ""); return ph ? "tel:" + ph : "#contact"; }

  /* คำถามที่พบบ่อย หน้าบริษัทและหน่วยงาน (ผู้ใช้ยืนยันคำตอบ 18 พ.ย. 2569: จองล่วงหน้า 10 วัน ชำระก่อน 3 วัน ใบเสร็จเฉพาะแบบครั้งคราว ลดหย่อนภาษีไม่ได้ เก้าอี้ 2 ตัวต่อหมอนวด 1 คน)
     ใช้ทั้งในหน้าเว็บ และข้อมูลโครงสร้าง FAQPage สำหรับ Google (ข้อความธรรมดา) */
  function faqList(info) {
    var pr = baht(info && info.rate);
    return [
      { g: "แบบครั้งคราว (นวดออฟฟิศซินโดรมให้พนักงาน)", items: [
        ["ต้องจองล่วงหน้ากี่วัน", "ต้องส่งคำขอล่วงหน้าอย่างน้อย 10 วันก่อนวันใช้บริการ เพื่อให้สมาคมจัดหาหมอนวดได้ทัน"],
        ["ค่าบริการเท่าไร", (pr ? pr + " ต่อหมอนวด 1 คน ต่อชั่วโมง ไม่รวมช่วงพักเที่ยง" : "ดูอัตราค่าบริการในแอปก่อนส่งคำขอ") + " สมาคมจะแจ้งยอดรวมหลังจากหมอนวดตอบรับงานแล้ว"],
        ["ชำระเงินอย่างไร และเมื่อไร", "โอนผ่าน PromptPay อย่างน้อย 3 วันก่อนวันใช้บริการ แล้วแนบสลิปในแอป เจ้าหน้าที่จะตรวจสอบและยืนยันงานให้"],
        ["ออกใบเสร็จได้ไหม นำไปลดหย่อนภาษีได้ไหม", "สมาคมออกใบเสร็จรับเงินให้ แต่ใบเสร็จนี้ไม่สามารถนำไปลดหย่อนภาษีได้"],
        ["ต้องเตรียมสถานที่อย่างไร", "เตรียมเก้าอี้ให้หมอนวด 1 ตัว และให้พนักงานที่มารับบริการ 1 ตัว ต่อหมอนวด 1 คน เช่น ใช้หมอนวด 5 คน ให้เตรียมเก้าอี้ 10 ตัว (สำหรับพนักงาน 5 ตัว และหมอนวด 5 ตัว)"],
        ["ให้บริการพื้นที่ไหนบ้าง", "ตอนนี้รับเฉพาะหน่วยงานในกรุงเทพมหานคร"]
      ] },
      { g: "แบบประจำ (จ้างตามมาตรา 33 หรือ 35)", items: [
        ["บริษัทไม่มีตำแหน่งงานที่เหมาะกับคนตาบอด ทำอย่างไรได้บ้าง", "เลือกให้" + AT_ASSOC + " ได้ " + AT_ASSOC_D + " หรือให้หมอนวดตาบอดไปนวดประจำให้พนักงานที่บริษัท"],
        ["เริ่มต้นอย่างไร", "กด \"ลงทะเบียนบริษัท\" กรอกข้อมูลบริษัท จำนวนหมอนวด และเลือกจ้างตามมาตรา 33 หรือ 35 จากนั้นเจ้าหน้าที่สมาคมจะติดต่อกลับเพื่อคุยรายละเอียดและทำสัญญา"]
      ] }
    ];
  }
  function faqHTML(info) {
    var n = 0;
    return '<section aria-labelledby="hFaq" id="faq"><h2 id="hFaq">คำถามที่พบบ่อย</h2>' + faqList(info).map(function (grp) {
      return '<h3>' + esc(grp.g) + '</h3>' + grp.items.map(function (x) { n++; return '<details class="faq"><summary>' + n + '. ' + esc(x[0]) + '</summary><p>' + esc(x[1]) + '</p></details>'; }).join("");
    }).join("") + '</section>';
  }
  function faqLD(info) {
    var all = []; faqList(info).forEach(function (g) { g.items.forEach(function (x) { all.push({ "@type": "Question", name: x[0], acceptedAnswer: { "@type": "Answer", text: x[1] } }); }); });
    return { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: all };
  }

  /* หน้า "บริษัทและหน่วยงาน" (ชุดเดียว กระชับ): การ์ด 2 แบบ -> ผลงานบริการ -> ขั้นตอน 2 คอลัมน์ -> กฎหมาย (7 รูปแบบมาตรา 35 พับไว้) -> แถบติดต่อท้ายหน้า
     ปุ่มหลักอยู่ในการ์ดที่เดียว ปุ่มโทรอยู่ในการ์ดและท้ายหน้า
     info: { rate: อัตราต่อชั่วโมงจาก public_contact, phone, email, works: ผลงานบริการล่าสุด (null = ให้หน้าเว็บโหลดเอง, [] = ซ่อนส่วนผลงาน) } */
  function companyHTML(info) {
    info = info || {};
    var tel = telHref(info.phone), price = baht(info.rate);
    var ph = String(info.phone || "").replace(/\D/g, ""), phShow = ph.length === 10 ? ph.slice(0, 3) + "-" + ph.slice(3, 6) + "-" + ph.slice(6) : (info.phone || "");
    var okMail = info.email && /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(info.email);
    var call = '<a class="btn ghost js-tel" href="' + esc(tel) + '">โทรสอบถาม</a>';
    var works = worksSection(info.works);
    return '<article class="post wide"><h1>สำหรับบริษัทและหน่วยงาน</h1><p class="lead">ดูแลสุขภาพพนักงานด้วยการนวดแผนไทยจากหมอนวดตาบอดที่ขึ้นทะเบียนกับกรมสนับสนุนบริการสุขภาพ กระทรวงสาธารณสุข เลือกได้ทั้งแบบครั้งคราวและแบบจ้างประจำ</p>' +
      '<div class="cols offers">' +
      '<div class="box offer"><span class="badge once">ครั้งคราว</span><h2>นวดออฟฟิศซินโดรมให้พนักงาน</h2>' +
      '<p class="price"><b class="js-rate">' + (price || "ดูราคาในแอป") + '</b> <span class="js-rate-unit"' + (price ? '' : ' hidden') + '>ต่อหมอนวด 1 คน ต่อชั่วโมง</span></p>' +
      '<ul><li>เหมาะกับวันสุขภาพพนักงาน งานสัมมนา งานปีใหม่ หรือกิจกรรมเพื่อสังคม</li><li>ตอนนี้รับเฉพาะหน่วยงานในกรุงเทพมหานคร</li><li>จ่ายเป็นรายครั้ง ไม่ผูกพัน</li></ul>' +
      '<div class="btns"><a class="btn" href="' + APP.orgreq + '">ขอบริการสำหรับหน่วยงาน</a>' + call + '</div><p class="sub"><a href="#steps">ดูขั้นตอน</a></p></div>' +
      '<div class="box offer"><span class="badge regular">ประจำ</span><h2>จ้างประจำตามมาตรา 33 หรือ 35</h2>' +
      '<p class="tagline">ใช้แทนการส่งเงินเข้ากองทุนตามมาตรา 34</p>' +
      '<ul><li>หมอนวดประจำที่บริษัทตามวันและเวลาที่ตกลง</li><li>หรือให้' + AT_ASSOC + ' บริษัทไม่ต้องจัดตำแหน่งงานหรือสถานที่เอง</li><li>นับเป็นการจ้างงานคนพิการตามกฎหมาย</li></ul>' +
      '<div class="btns"><a class="btn" href="' + APP.company + '">ลงทะเบียนบริษัท</a>' + call + '</div><p class="sub"><a href="#law">ดูข้อกฎหมาย</a></p></div>' +
      '</div>' +
      works +
      '<section aria-labelledby="hSteps" id="steps"><h2 id="hSteps">ขั้นตอน</h2><div class="cols">' +
      '<div class="box" id="once"><h3>ครั้งคราว</h3><ol class="steps"><li>กด "ขอบริการสำหรับหน่วยงาน" เข้าสู่ระบบด้วยเบอร์โทร แล้วกรอกสถานที่ วันเวลา และหมอนวดที่ต้องการ</li><li>เจ้าหน้าที่สมาคมตรวจสอบ และส่งคำเชิญถึงหมอนวด</li><li>หมอนวดตอบรับ แล้วสมาคมแจ้งยอดค่าบริการ</li><li>โอนเงินผ่าน PromptPay แนบสลิป แล้วรอรับการยืนยัน</li></ol></div>' +
      '<div class="box" id="regular"><h3>ประจำ</h3><ol class="steps"><li>กด "ลงทะเบียนบริษัท" เข้าสู่ระบบด้วยเบอร์โทร แล้วกรอกข้อมูลบริษัท จำนวนหมอนวด และรูปแบบการจ้าง</li><li>เจ้าหน้าที่สมาคมติดต่อกลับเพื่อคุยรายละเอียดและทำสัญญา</li><li>หมอนวดเริ่มงานตามวันที่ตกลง ดูสถานะและตารางงานได้ในแอป</li></ol></div>' +
      '</div><p>ทุกขั้นตอนมีแจ้งเตือนในแอป</p></section>' +
      '<section aria-labelledby="hLaw" id="law"><h2 id="hLaw">การจ้างงานคนพิการตามกฎหมาย (มาตรา 33, 34, 35)</h2>' +
      '<p>พระราชบัญญัติส่งเสริมและพัฒนาคุณภาพชีวิตคนพิการ พ.ศ. 2550 และที่แก้ไขเพิ่มเติม กำหนดให้นายจ้าง เจ้าของสถานประกอบการ และหน่วยงานของรัฐ ที่มีลูกจ้างตั้งแต่ 100 คนขึ้นไป รับคนพิการเข้าทำงานในอัตรา <b>ลูกจ้างที่ไม่ใช่คนพิการทุก 100 คน ต่อคนพิการ 1 คน</b> ถ้ามีเศษเกิน 50 คน ให้จ้างเพิ่มอีก 1 คน เช่น ลูกจ้าง 140 คน จ้างคนพิการ 1 คน, ลูกจ้าง 160 คน จ้าง 2 คน</p>' +
      '<div class="cols"><div class="box"><h3>มาตรา 33: จ้างคนพิการเข้าทำงาน</h3><p>รับคนพิการเป็นลูกจ้างของบริษัทโดยตรง เช่น จ้างหมอนวดตาบอดเป็นพนักงานประจำเพื่อนวดให้พนักงานในบริษัท</p></div>' +
      '<div class="box"><h3>มาตรา 34: ส่งเงินเข้ากองทุน</h3><p>ถ้าไม่จ้างตามมาตรา 33 ต้องส่งเงินเข้ากองทุนส่งเสริมและพัฒนาคุณภาพชีวิตคนพิการ คำนวณจากอัตราค่าจ้างขั้นต่ำต่ำสุด คูณ 365 วัน คูณจำนวนคนพิการที่ไม่ได้จ้าง</p></div>' +
      '<div class="box"><h3>มาตรา 35: ให้สิทธิแทนการจ้าง</h3><p>ถ้าไม่จ้างตามมาตรา 33 และไม่ส่งเงินตามมาตรา 34 ให้สิทธิแก่คนพิการหรือผู้ดูแลคนพิการแทนได้ มูลค่าไม่น้อยกว่า ' + LAW.s35Value + ' บาทต่อคนต่อปี (ปีงบประมาณ ' + LAW.s35Year + ') สมาคมรับจ้างเหมาบริการนวดได้</p></div></div>' +
      '<div class="box calcbox"><h3>บริษัทของคุณต้องจ้างคนพิการกี่คน</h3><p>กรอกจำนวนพนักงาน ดูจำนวนคนพิการที่ต้องจ้าง และเงินที่ต้องส่งเข้ากองทุนถ้าไม่จ้าง</p><a class="btn" href="/company/calc/" data-nav>คำนวณจำนวนคนพิการที่ต้องจ้าง</a></div>' +
      '<details class="more7"><summary>ดูการให้สิทธิตามมาตรา 35 ทั้ง 7 รูปแบบ</summary><ol><li>ให้สัมปทาน</li><li>จัดสถานที่จำหน่ายสินค้าหรือบริการ</li><li>จัดจ้างเหมาช่วงงานหรือจ้างเหมาบริการ (เช่น จ้างหมอนวดตาบอดมานวดให้พนักงาน)</li><li>ฝึกงาน</li><li>จัดให้มีอุปกรณ์หรือสิ่งอำนวยความสะดวก</li><li>จัดให้มีบริการล่ามภาษามือ</li><li>ให้ความช่วยเหลืออื่นใดแก่คนพิการหรือผู้ดูแลคนพิการ</li></ol></details>' +
      '</section>' + faqHTML(info) +
      '<section aria-labelledby="hAsk" class="askband"><h2 id="hAsk">มีคำถามก่อนตัดสินใจ</h2><p>คุยกับเจ้าหน้าที่สมาคมได้ในเวลาทำการ</p><div class="btns"><a class="btn js-tel" href="' + esc(tel) + '">โทร&nbsp;<span class="js-phone">' + esc(phShow || "สมาคม") + '</span></a>' +
      '<a class="btn ghost js-mail" href="' + (okMail ? "mailto:" + esc(info.email) : "#contact") + '"' + (okMail ? '' : ' hidden') + '>ส่งอีเมล</a></div></section>' +
      '</article>';
  }

  /* เครื่องคิดเลขจ้างงานคนพิการ (/company/calc/): ลูกจ้างที่ไม่ใช่คนพิการทุก 100 คน ต่อคนพิการ 1 คน เศษเกิน 50 จ้างเพิ่ม 1 คน (เริ่มที่ 100 คน)
     เงินส่งกองทุนมาตรา 34 ต่อคนต่อปี = LAW.s35Value (ปรับทุกปีงบประมาณ) */
  function calcNeed(n) { n = Math.floor(Number(n)); if (!(n >= 100)) return 0; return Math.floor(n / 100) + (n % 100 > 50 ? 1 : 0); }
  function numOk(v) { return /^\d{1,7}$/.test(String(v == null ? "" : v).trim()); }
  var PER = Number(LAW.s35Value.replace(/,/g, ""));
  /* ทางเลือกจ้างประจำกับสมาคม (ผู้ใช้เลือกข้อความแบบ ก 20 พ.ย. 2569, ได้ทั้งมาตรา 33 และ 35) ใช้ในเครื่องคิดเลข การ์ดจ้างประจำ และคำถามที่พบบ่อย */
  var AT_ASSOC = "คนตาบอดทำงานที่สมาคม (องค์กรสาธารณประโยชน์)", AT_ASSOC_D = "บริษัทจ้างตามมาตรา 33 หรือให้สิทธิตามมาตรา 35 โดยคนพิการทำงานที่สมาคม บริษัทไม่ต้องจัดตำแหน่งงานหรือสถานที่เอง";
  function calcResult(nv, hv, info) {
    info = info || {};
    if (!numOk(nv)) return '<p class="calcerr">กรอกจำนวนพนักงานเป็นตัวเลข เช่น 250</p>';
    if (String(hv == null ? "" : hv).trim() !== "" && !numOk(hv)) return '<p class="calcerr">จำนวนคนพิการที่จ้างอยู่ ต้องเป็นตัวเลข หรือเว้นว่าง</p>';
    var n = +nv, h = +(hv || 0), need = calcNeed(n), tel = telHref(info.phone), call = '<a class="btn ghost js-tel" href="' + esc(tel) + '">โทรสอบถาม</a>';
    if (!need) return '<p class="big">ยังไม่ต้องจ้างคนพิการตามกฎหมาย</p><p>พนักงาน ' + n.toLocaleString("en-US") + ' คน กฎหมายบังคับเมื่อมีลูกจ้างที่ไม่ใช่คนพิการตั้งแต่ 100 คนขึ้นไป ดูแลสุขภาพพนักงานด้วยนวดออฟฟิศซินโดรมแบบครั้งคราวได้</p><div class="btns"><a class="btn" href="' + APP.orgreq + '">ขอบริการสำหรับหน่วยงาน</a>' + call + '</div>';
    var out = '<p class="big">ต้องจ้างคนพิการ ' + need + ' คน</p><p>จากพนักงาน ' + n.toLocaleString("en-US") + ' คน' + (h ? ' จ้างอยู่แล้ว ' + h + ' คน' : '') + '</p>';
    if (h >= need) return out + '<p>จ้างครบตามกฎหมายแล้ว ถ้าต้องการเพิ่มสวัสดิการให้พนักงาน จ้างหมอนวดตาบอดไปนวดที่บริษัทได้</p><div class="btns"><a class="btn" href="' + APP.orgreq + '">ขอบริการสำหรับหน่วยงาน</a>' + call + '</div>';
    var lack = need - h;
    return out + '<p class="big">ยังขาดอีก ' + lack + ' คน</p>' +
      '<p>ถ้าไม่จ้าง ต้องส่งเงินเข้ากองทุนตามมาตรา 34 ประมาณ <b>' + baht(lack * PER) + ' ต่อปี</b> (' + LAW.s35Value + ' บาท ต่อคน ปีงบประมาณ ' + LAW.s35Year + ')</p>' +
      '<h2 class="calch">ทางเลือกกับสมาคม แทนการส่งเงินเข้ากองทุน (' + lack + ' คน)</h2><ol class="opts">' +
      '<li><b>หมอนวดตาบอดไปนวดให้พนักงานที่บริษัท</b> นวดประจำตามวันและเวลาที่ตกลง พนักงานได้ดูแลสุขภาพ</li>' +
      '<li><b>' + AT_ASSOC + '</b> ' + AT_ASSOC_D + '</li></ol>' +
      '<div class="btns"><a class="btn" href="' + APP.company + '">ลงทะเบียนบริษัท</a>' + call + '</div>';
  }
  function calcHTML(info, nv, hv) {
    var has = nv != null && String(nv).trim() !== "";
    return '<article class="post wide"><nav class="crumb" aria-label="ตำแหน่งหน้า"><a href="/" data-nav>หน้าแรก</a> / <a href="/company/" data-nav>บริษัทและหน่วยงาน</a></nav>' +
      '<h1>คำนวณจำนวนคนพิการที่บริษัทต้องจ้าง</h1><p class="lead">กรอกจำนวนพนักงาน ดูว่าต้องจ้างคนพิการกี่คนตามมาตรา 33 และถ้าไม่จ้าง ต้องส่งเงินเข้ากองทุนตามมาตรา 34 ปีละเท่าไร</p>' +
      '<form class="box calcf" id="calcF" method="get" action="/company/calc/" novalidate>' +
      '<label for="cN">จำนวนพนักงานที่ไม่ใช่คนพิการ (คน)</label><input id="cN" name="n" type="text" inputmode="numeric" autocomplete="off" maxlength="7" value="' + (has ? esc(String(nv).trim()) : '') + '">' +
      '<label for="cH">จำนวนคนพิการที่จ้างอยู่แล้ว (ไม่บังคับ)</label><input id="cH" name="h" type="text" inputmode="numeric" autocomplete="off" maxlength="7" value="' + esc(String(hv == null ? "" : hv).trim()) + '">' +
      '<div class="btns" style="margin-top:16px"><button class="btn" type="submit">คำนวณ</button></div>' +
      '<div id="calcOut" class="calcout" role="status" aria-live="polite">' + (has ? calcResult(nv, hv, info) : '') + '</div></form>' +
      '<section aria-labelledby="hHow"><h2 id="hHow">วิธีคิด</h2><p>พระราชบัญญัติส่งเสริมและพัฒนาคุณภาพชีวิตคนพิการ พ.ศ. 2550 และที่แก้ไขเพิ่มเติม กำหนดให้บริษัทที่มีลูกจ้างที่ไม่ใช่คนพิการตั้งแต่ 100 คนขึ้นไป จ้างคนพิการ 1 คน ต่อลูกจ้างทุก 100 คน ถ้ามีเศษเกิน 50 คน ให้จ้างเพิ่มอีก 1 คน</p>' +
      '<ul><li>ลูกจ้าง 99 คน: ยังไม่ต้องจ้าง</li><li>ลูกจ้าง 150 คน: จ้าง 1 คน</li><li>ลูกจ้าง 151 คน: จ้าง 2 คน</li><li>ลูกจ้าง 250 คน: จ้าง 2 คน</li><li>ลูกจ้าง 251 คน: จ้าง 3 คน</li></ul>' +
      '<p>ถ้าไม่จ้างครบ ต้องส่งเงินเข้ากองทุนตามมาตรา 34 คนละ ' + LAW.s35Value + ' บาทต่อปี (ปีงบประมาณ ' + LAW.s35Year + ') หรือให้สิทธิตามมาตรา 35 แทน มูลค่าไม่น้อยกว่ากัน เช่น จ้างเหมาบริการนวดจากสมาคม</p>' +
      '<p class="backs"><a href="/company/#law" data-nav>อ่านเรื่องมาตรา 33, 34, 35</a><a href="/company/" data-nav>กลับไปหน้าบริษัทและหน่วยงาน</a></p></section></article>';
  }

  /* กล่องติดต่อท้ายหน้า (ข้อมูลจาก public_contact) เรียง: ชื่อ, โทร, อีเมล, เวลาเปิดปิด */
  function contactParts(c) {
    c = c || {};
    var ph = String(c.phone || "").replace(/\D/g, ""), show = ph.length === 10 ? ph.slice(0, 3) + "-" + ph.slice(3, 6) + "-" + ph.slice(6) : (c.phone || "");
    var okMail = c.email && /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(c.email);
    return {
      name: esc(c.name || SITE_NAME),
      phone: ph ? 'โทร <a href="tel:' + esc(ph) + '">' + esc(show) + '</a>' : "",
      email: okMail ? 'อีเมล <a href="mailto:' + esc(c.email) + '">' + esc(c.email) + '</a>' : "",
      hours: esc(c.hours || "")
    };
  }
  function copyText(year) { return "© " + year + " " + SITE_NAME + " สงวนลิขสิทธิ์"; }

  G.SV = {
    SB: SB, ORG_SITE: ORG_SITE, SITE_NAME: SITE_NAME, ORG_STATUS: ORG_STATUS, PAGE: PAGE, POST_GONE: POST_GONE, LOADING: LOADING, KINDS_Q: KINDS_Q,
    esc: esc, imgUrl: imgUrl, card: card, errBox: errBox, listQ: listQ, postQ: postQ, kindsOf: kindsOf, filtersHTML: filtersHTML, renderBody: renderBody, altFor: altFor, linkedNos: linkedNos, titlesQ: titlesQ, titleMap: titleMap,
    parse: parse, canonPath: canonPath, meta: meta, homeHTML: homeHTML, latestHTML: latestHTML, listHTML: listHTML, listBody: listBody, moreBtn: moreBtn,
    postHTML: postHTML, adjQ: adjQ, adjHTML: adjHTML, notFoundHTML: notFoundHTML, companyHTML: companyHTML, faqLD: faqLD, calcHTML: calcHTML, calcResult: calcResult, calcNeed: calcNeed, baht: baht, telHref: telHref, contactParts: contactParts, copyText: copyText
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
