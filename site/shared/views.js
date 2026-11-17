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
  /* ข้อมูลกฎหมายหน้า "สำหรับบริษัท" ตรวจเมื่อ พ.ย. 2569 (กรมการจัดหางาน, กรมส่งเสริมและพัฒนาคุณภาพชีวิตคนพิการ) มูลค่ามาตรา 35 เปลี่ยนทุกปี ปรับที่นี่ */
  var LAW = { s35Value: "123,005", s35Year: "2570" };
  var LIST_COLS = "no,kind,title,summary,cover_path,cover_alt,day,pinned";
  var PAGE = 12;
  var MONTHS = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];

  function esc(x) { return String(x == null ? "" : x).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function imgUrl(p) { if (!p) return null; if (/^https?:\/\//.test(p)) return p; return SB.url + "/storage/v1/object/public/" + (/^place-images\//.test(p) ? p : "place-images/" + p); }
  /* วันที่ไทย เช่น 17 พฤศจิกายน 2569 (เขียนเอง ไม่พึ่ง Intl ให้ผลเหมือนกันทั้งในเครื่องและบน Cloudflare) */
  function thDate(s) { var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(s || "")); if (!m) return ""; var mo = +m[2]; if (mo < 1 || mo > 12) return ""; return (+m[3]) + " " + MONTHS[mo - 1] + " " + (+m[1] + 543); }
  function listQ(kind, limit, offset) { return "/rest/v1/site_articles?select=" + LIST_COLS + "&active=eq.true" + (kind ? "&kind=eq." + kind : "") + "&order=pinned.desc,day.desc,no.desc&limit=" + limit + (offset ? "&offset=" + offset : ""); }
  function postQ(no) { return "/rest/v1/site_articles?select=*&active=eq.true&no=eq." + no + "&limit=1"; }

  /* เนื้อหาบทความ: ข้อความธรรมดา บรรทัดว่างคั่นย่อหน้า, "## " = หัวข้อย่อย, "- " = รายการ, ลิงก์ http(s) กดได้ (ไม่รับ HTML) */
  function linkify(s) { return esc(s).replace(/https?:\/\/[^\s<]+[^\s<.,;:!?)"'\]]/g, function (u) { return '<a href="' + u + '" rel="noopener nofollow" target="_blank">' + u + '<span class="sr"> (เปิดหน้าต่างใหม่)</span></a>'; }); }
  function renderBody(t) {
    var out = [], blocks = String(t || "").replace(/\r/g, "").split(/\n\s*\n/);
    blocks.forEach(function (b) {
      var lines = b.split("\n").filter(function (l) { return l.trim() !== ""; }); if (!lines.length) return;
      var buf = [], list = [];
      function flushP() { if (buf.length) { out.push("<p>" + buf.map(linkify).join("<br>") + "</p>"); buf = []; } }
      function flushL() { if (list.length) { out.push("<ul>" + list.map(function (x) { return "<li>" + linkify(x) + "</li>"; }).join("") + "</ul>"); list = []; } }
      lines.forEach(function (l) {
        var s = l.trim();
        if (/^#{2,3}\s+/.test(s)) { flushP(); flushL(); out.push("<h2>" + linkify(s.replace(/^#{2,3}\s+/, "")) + "</h2>"); }
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
    if (p === "/news") { var k = (/[?&]k=([^&]*)/.exec(search || "") || [])[1] || ""; return { name: "list", kind: KIND[k] ? k : "" }; }
    if ((m = p.match(/^\/news\/(\d{1,9})$/))) return { name: "post", no: +m[1] };
    return { name: "notfound" };
  }
  /* ลิงก์หลักของหน้า (canonical) */
  function canonPath(r) { return r.name === "home" ? "/" : r.name === "company" ? "/company/" : r.name === "list" ? "/news/" + (r.kind ? "?k=" + r.kind : "") : r.name === "post" ? "/news/" + r.no : null; }

  /* ชื่อหน้า (แถบเบราว์เซอร์ / ผลค้นหา Google) และคำอธิบาย แยกตามหน้า */
  function meta(r, a, info) {
    if (r.name === "home") return { title: "นวดไทยโดยหมอนวดตาบอดที่ขึ้นทะเบียนถูกต้อง | " + SITE_NAME, desc: "นวดแผนไทยโดยหมอนวดตาบอดที่ขึ้นทะเบียนกับกรมสนับสนุนบริการสุขภาพ จองนวดออนไลน์ จ้างหมอนวดไปนวดที่บริษัท สมัครเปิดร้านนวด สมัครเป็นหมอนวด และข่าวสารจาก" + SITE_NAME };
    if (r.name === "company") { var pr = baht(info && info.rate); return { title: "นวดออฟฟิศซินโดรมให้พนักงาน และจ้างงานคนพิการ มาตรา 33, 35 | " + SITE_NAME, desc: "จ้างหมอนวดตาบอดที่ขึ้นทะเบียนถูกต้องไปนวดออฟฟิศซินโดรมให้พนักงานที่บริษัท" + (pr ? " " + pr + " ต่อหมอนวด 1 คน ต่อชั่วโมง (กรุงเทพฯ)" : "") + " หรือจ้างประจำตามมาตรา 33, 35 ใช้แทนการส่งเงินเข้ากองทุนตามมาตรา 34" }; }
    if (r.name === "list") { var t = r.kind ? KIND[r.kind] : "ข่าวและบทความ"; return { title: t + " | " + SITE_NAME, desc: (r.kind === "work" ? "หน่วยงานและบริษัทที่" + SITE_NAME + "ส่งหมอนวดตาบอดไปให้บริการนวด" : "รวม" + t + "จาก" + SITE_NAME + " เรื่องการนวดแผนไทย หมอนวดตาบอด และกิจกรรมของสมาคม") }; }
    if (r.name === "post" && a) return { title: a.title + " | " + SITE_NAME, desc: String(a.summary || a.title).slice(0, 300) };
    return { title: "ไม่พบหน้านี้ | " + SITE_NAME, desc: "" };
  }

  function homeHTML(latest) {
    return '<div class="hero"><h1>นวดไทยโดยหมอนวดตาบอด ที่ขึ้นทะเบียนถูกต้อง</h1><p>หมอนวดของเราเป็นคนพิการทางการเห็นที่ขึ้นทะเบียนกับกรมสนับสนุนบริการสุขภาพ กระทรวงสาธารณสุข จองคิวกับร้านนวดใกล้บ้านได้ทันที</p><div class="btns"><a class="btn" href="' + APP.book + '">จองนวดออนไลน์</a><a class="btn ghost" href="/company/" data-nav>สำหรับบริษัทและหน่วยงาน</a><a class="btn ghost" href="/news/" data-nav>อ่านข่าวและบทความ</a></div></div>' +
      '<section aria-labelledby="hLatest"><div class="secHead"><h2 id="hLatest">ข่าวและบทความล่าสุด</h2><a href="/news/" data-nav>ดูทั้งหมด</a></div>' + (latest ? '<div id="latest">' + latestHTML(latest) + '</div>' : '<div id="latest" data-pending>' + LOADING + '</div>') + '</section>' +
      '<section aria-labelledby="hBiz"><h2 id="hBiz">สำหรับบริษัทและหน่วยงาน</h2><div class="box"><h3>นวดออฟฟิศซินโดรมให้พนักงาน หรือจ้างประจำตามมาตรา 33, 35</h3><p>จ้างหมอนวดตาบอดไปนวดที่บริษัทเป็นครั้งคราวสำหรับงานกิจกรรม หรือจ้างประจำเพื่อใช้เป็นการจ้างงานคนพิการตามกฎหมาย</p><div class="btns"><a class="btn" href="/company/" data-nav>ดูรายละเอียดและราคา</a><a class="btn ghost" href="' + APP.orgreq + '">ขอบริการสำหรับหน่วยงาน</a></div></div></section>' +
      '<section aria-labelledby="hJoin"><h2 id="hJoin">ร่วมงานกับเรา</h2><div class="cols"><div class="box"><h3>สมัครเปิดร้านนวด</h3><p>ร้านนวดที่จดทะเบียนถูกต้อง สมัครเข้าระบบเพื่อรับคิวจากลูกค้าออนไลน์</p><a class="btn" href="' + APP.shop + '">สมัครเปิดร้าน</a></div><div class="box"><h3>สมัครเป็นหมอนวด</h3><p>หมอนวดที่ขึ้นทะเบียนแล้ว สมัครเพื่อรับงานจากร้านและหน่วยงานในระบบ</p><a class="btn" href="' + APP.staff + '">สมัครเป็นหมอนวด</a></div></div></section>' +
      '<section aria-labelledby="hHow"><h2 id="hHow">จองนวดง่ายๆ 3 ขั้นตอน</h2><div class="box"><ol class="steps"><li>เลือกร้านนวดใกล้คุณ และเลือกบริการที่ต้องการ</li><li>เลือกวัน เวลา และหมอนวด</li><li>เข้าสู่ระบบด้วยเบอร์โทร แล้วยืนยันการจอง เลื่อนหรือยกเลิกเองได้ภายหลัง</li></ol><p style="margin:14px 0 0"><a class="btn" href="' + APP.book + '">เริ่มจองนวด</a></p></div></section>';
  }
  function latestHTML(a) { return a.length ? '<ul class="grid">' + a.map(function (x) { return card(x, 3); }).join("") + '</ul>' : '<div class="empty">ยังไม่มีข่าวในตอนนี้ ติดตามได้เร็วๆ นี้</div>'; }

  function listHead(kind) {
    var ttl = kind ? KIND[kind] : "ข่าวและบทความ";
    var f = [["", "ทั้งหมด"], ["news", "ข่าวและกิจกรรม"], ["work", "ผลงานบริการ"], ["article", "บทความ"]].map(function (x) { return '<li><a href="/news/' + (x[0] ? "?k=" + x[0] : "") + '" data-nav' + (x[0] === kind ? ' aria-current="page"' : '') + '>' + x[1] + '</a></li>'; }).join("");
    return '<h1>' + esc(ttl) + '</h1><nav aria-label="เลือกประเภท"><ul class="filters">' + f + '</ul></nav>';
  }
  /* items: แถวที่ได้จากฐานข้อมูล (ขอมา PAGE+1 แถว เพื่อรู้ว่ามีหน้าต่อไหม) หรือ null = ให้หน้าเว็บโหลดเอง */
  function listHTML(kind, items) {
    if (!items) return listHead(kind) + '<div id="list" data-pending>' + LOADING + '</div>';
    return listHead(kind) + '<div id="list">' + listBody(kind, items, 0) + '</div>';
  }
  function listBody(kind, items, offset) {
    var more = items.length > PAGE; items = items.slice(0, PAGE);
    if (!items.length && !offset) return '<div class="empty">ยังไม่มี' + (kind ? KIND[kind] : "ข่าวหรือบทความ") + 'ในตอนนี้</div>';
    return '<ul class="grid">' + items.map(function (x) { return card(x, 2); }).join("") + '</ul>' + moreBtn(kind, offset, more);
  }
  function moreBtn(kind, offset, more) { return more ? '<div class="more"><button class="btn ghost" type="button" data-more="' + (offset + PAGE) + '" data-kind="' + esc(kind) + '">ดูเพิ่มเติม</button></div>' : ''; }

  function postHTML(a, link, shareLabel) {
    var u = imgUrl(a.cover_path);
    return '<article class="post"><nav class="crumb" aria-label="ตำแหน่งหน้า"><a href="/news/" data-nav>ข่าวและบทความ</a> / <a href="/news/?k=' + esc(a.kind) + '" data-nav>' + esc(KIND[a.kind] || "ข่าว") + '</a></nav>' +
      '<h1>' + esc(a.title) + '</h1><div class="meta"><span>' + esc(KIND[a.kind] || "ข่าว") + '</span><span aria-hidden="true">·</span><span>วันที่ ' + esc(thDate(a.day)) + '</span></div>' +
      (u ? '<figure><img class="cover" src="' + esc(u) + '" alt="' + esc(a.cover_alt || "") + '">' + (a.cover_alt ? '<figcaption>' + esc(a.cover_alt) + '</figcaption>' : '') + '</figure>' : '') +
      (a.summary ? '<p class="lead">' + esc(a.summary) + '</p>' : '') + '<div class="body">' + renderBody(a.body) + '</div>' +
      '<div class="share"><h2>แชร์เรื่องนี้</h2><div class="btns"><a class="btn" href="https://social-plugins.line.me/lineit/share?url=' + encodeURIComponent(link) + '" target="_blank" rel="noopener">แชร์ไป LINE<span class="sr"> (เปิดหน้าต่างใหม่)</span></a><a class="btn" href="https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(link) + '" target="_blank" rel="noopener">แชร์ไป Facebook<span class="sr"> (เปิดหน้าต่างใหม่)</span></a><button class="btn ghost" type="button" data-copy="' + esc(link) + '">' + esc(shareLabel || "คัดลอกลิงก์") + '</button></div></div>' +
      '<p style="margin-top:28px"><a href="/news/" data-nav>← กลับไปหน้าข่าวและบทความ</a></p></article>';
  }
  function notFoundHTML(msg) { return '<h1>ไม่พบหน้านี้</h1><p>' + esc(msg || "ลิงก์อาจไม่ถูกต้อง หรือหน้านี้ถูกย้ายไปแล้ว") + '</p><div class="btns"><a class="btn" href="/" data-nav>ไปหน้าแรก</a><a class="btn ghost" href="/news/" data-nav>ข่าวและบทความ</a></div>'; }
  var POST_GONE = "ไม่พบข่าวหรือบทความนี้ อาจถูกลบหรือซ่อนไปแล้ว";

  /* อัตราค่าบริการ เช่น 400 -> "400 บาท" (ใส่จุลภาคเอง ไม่พึ่ง Intl) */
  function baht(n) { n = Number(n); if (!(n > 0)) return ""; var s = String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ","); return s + " บาท"; }
  function telHref(phone) { var ph = String(phone || "").replace(/\D/g, ""); return ph ? "tel:" + ph : "#contact"; }

  /* หน้า "บริษัทและหน่วยงาน" (ชุดเดียว กระชับ): การ์ด 2 แบบ -> ผลงานบริการ -> ขั้นตอน 2 คอลัมน์ -> กฎหมาย (7 รูปแบบมาตรา 35 พับไว้) -> แถบติดต่อท้ายหน้า
     ปุ่มหลักอยู่ในการ์ดที่เดียว ปุ่มโทรอยู่ในการ์ดและท้ายหน้า
     info: { rate: อัตราต่อชั่วโมงจาก public_contact, phone, email, works: ผลงานบริการล่าสุด (null = ให้หน้าเว็บโหลดเอง, [] = ซ่อนส่วนผลงาน) } */
  function companyHTML(info) {
    info = info || {};
    var tel = telHref(info.phone), price = baht(info.rate);
    var ph = String(info.phone || "").replace(/\D/g, ""), phShow = ph.length === 10 ? ph.slice(0, 3) + "-" + ph.slice(3, 6) + "-" + ph.slice(6) : (info.phone || "");
    var okMail = info.email && /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(info.email);
    var call = '<a class="btn ghost js-tel" href="' + esc(tel) + '">โทรสอบถาม</a>';
    var worksHead = '<section aria-labelledby="hWorks" id="worksSec"><div class="secHead"><h2 id="hWorks">หน่วยงานที่เราเคยไปให้บริการ</h2><a href="/news/?k=work" data-nav>ดูทั้งหมด</a></div>';
    var works = info.works === null || info.works === undefined ? worksHead + '<div id="works" data-pending>' + LOADING + '</div></section>'
      : info.works.length ? worksHead + '<div id="works"><ul class="grid">' + info.works.map(function (x) { return card(x, 3); }).join("") + '</ul></div></section>' : '';
    return '<article class="post wide"><h1>สำหรับบริษัทและหน่วยงาน</h1><p class="lead">ดูแลสุขภาพพนักงานด้วยการนวดแผนไทยจากหมอนวดตาบอดที่ขึ้นทะเบียนกับกรมสนับสนุนบริการสุขภาพ กระทรวงสาธารณสุข เลือกได้ทั้งแบบครั้งคราวและแบบจ้างประจำ</p>' +
      '<div class="cols offers">' +
      '<div class="box offer"><span class="badge once">ครั้งคราว</span><h2>นวดออฟฟิศซินโดรมให้พนักงาน</h2>' +
      '<p class="price"><b class="js-rate">' + (price || "ดูราคาในแอป") + '</b> <span class="js-rate-unit"' + (price ? '' : ' hidden') + '>ต่อหมอนวด 1 คน ต่อชั่วโมง</span></p>' +
      '<ul><li>เหมาะกับวันสุขภาพพนักงาน งานสัมมนา งานปีใหม่ หรือกิจกรรมเพื่อสังคม</li><li>ตอนนี้รับเฉพาะหน่วยงานในกรุงเทพมหานคร</li><li>จ่ายเป็นรายครั้ง ไม่ผูกพัน</li></ul>' +
      '<div class="btns"><a class="btn" href="' + APP.orgreq + '">ขอบริการสำหรับหน่วยงาน</a>' + call + '</div><p class="sub"><a href="#steps">ดูขั้นตอน</a></p></div>' +
      '<div class="box offer"><span class="badge regular">ประจำ</span><h2>จ้างประจำตามมาตรา 33 หรือ 35</h2>' +
      '<p class="tagline">ใช้แทนการส่งเงินเข้ากองทุนตามมาตรา 34</p>' +
      '<ul><li>หมอนวดประจำที่บริษัทตามวันและเวลาที่ตกลง</li><li>นับเป็นการจ้างงานคนพิการตามกฎหมาย</li><li>หมอนวดประจำลา สมาคมจัดหมอนวดแทนให้</li></ul>' +
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
      '<details class="more7"><summary>ดูการให้สิทธิตามมาตรา 35 ทั้ง 7 รูปแบบ</summary><ol><li>ให้สัมปทาน</li><li>จัดสถานที่จำหน่ายสินค้าหรือบริการ</li><li>จัดจ้างเหมาช่วงงานหรือจ้างเหมาบริการ (เช่น จ้างหมอนวดตาบอดมานวดให้พนักงาน)</li><li>ฝึกงาน</li><li>จัดให้มีอุปกรณ์หรือสิ่งอำนวยความสะดวก</li><li>จัดให้มีบริการล่ามภาษามือ</li><li>ให้ความช่วยเหลืออื่นใดแก่คนพิการหรือผู้ดูแลคนพิการ</li></ol></details>' +
      '</section>' +
      '<section aria-labelledby="hAsk" class="askband"><h2 id="hAsk">มีคำถามก่อนตัดสินใจ</h2><p>คุยกับเจ้าหน้าที่สมาคมได้ในเวลาทำการ</p><div class="btns"><a class="btn js-tel" href="' + esc(tel) + '">โทร&nbsp;<span class="js-phone">' + esc(phShow || "สมาคม") + '</span></a>' +
      '<a class="btn ghost js-mail" href="' + (okMail ? "mailto:" + esc(info.email) : "#contact") + '"' + (okMail ? '' : ' hidden') + '>ส่งอีเมล</a></div></section>' +
      '</article>';
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
    SB: SB, APP: APP, KIND: KIND, SITE_NAME: SITE_NAME, LAW: LAW, PAGE: PAGE, POST_GONE: POST_GONE, LOADING: LOADING,
    esc: esc, imgUrl: imgUrl, thDate: thDate, renderBody: renderBody, card: card, errBox: errBox, listQ: listQ, postQ: postQ,
    parse: parse, canonPath: canonPath, meta: meta, homeHTML: homeHTML, latestHTML: latestHTML, listHTML: listHTML, listBody: listBody, moreBtn: moreBtn,
    postHTML: postHTML, notFoundHTML: notFoundHTML, companyHTML: companyHTML, baht: baht, telHref: telHref, contactParts: contactParts, copyText: copyText
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
