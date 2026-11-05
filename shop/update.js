/* ตรวจเวอร์ชันตอนเปิดแอป ก่อนแสดงหน้าแอป (ไฟล์เดียวกันทั้ง 4 แอป)
   - เลขเวอร์ชันในแอปอยู่ที่ <meta name="app-version"> เทียบกับ version.json บนเซิร์ฟเวอร์ ({"v":"1.0","required":false,"notes":["..."]})
   - เลขตรงกัน เช็กไม่ได้ หรือเกิน 1.5 วินาที: เข้าแอปตามปกติ (ไม่ขวางการใช้งานตอนออฟไลน์หรือสัญญาณอ่อน)
   - เลขไม่ตรง: แสดงหน้า "มีเวอร์ชันใหม่" เต็มจอ มีปุ่มอัปเดต และปุ่ม "ไว้ทีหลัง" (ซ่อนเมื่อ required = true)
   - กันวนซ้ำ: ถ้ากดอัปเดตแล้วเลขยังไม่ตรง (เช่นแคชปลายทางยังไม่ทัน) ในรอบการใช้งานเดียวกันจะไม่ถามซ้ำ */
(function(){
 var mv=document.querySelector('meta[name="app-version"]');if(!mv)return;
 var cur=mv.getAttribute("content")||"",mn=document.querySelector('meta[name="app-name"]'),appName=mn?mn.getAttribute("content"):"ระบบจองนวด";
 var ss={get:function(k){try{return sessionStorage.getItem(k)}catch(e){return null}},set:function(k,v){try{sessionStorage.setItem(k,v)}catch(e){}}};
 var verUrl=window.__APP_VER_URL||new URL("version.json",location.href).href;
 var pageUrl=window.__APP_PAGE_URL||location.href.split("#")[0].split("?")[0];
 var cov=document.createElement("div");cov.id="updcov";cov.setAttribute("role","dialog");cov.setAttribute("aria-modal","true");cov.setAttribute("aria-label","ตรวจสอบเวอร์ชันของแอป");
 cov.style.cssText="position:fixed;left:0;top:0;right:0;bottom:0;z-index:2147483000;background:#fff;color:#12312a;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px 20px calc(24px + env(safe-area-inset-bottom,0px));text-align:center;overflow:auto;font-family:system-ui,-apple-system,'Sarabun','Noto Sans Thai',sans-serif";
 cov.innerHTML='<img src="icon-logo-192.png" alt="" width="112" height="112" style="width:112px;height:112px;border-radius:50%"><p id="updst" role="status" style="margin:16px 0 0;color:#4a6b62;font-size:1rem">กำลังตรวจสอบเวอร์ชัน</p>';
 var inerted=[];
 function setInert(on){try{var b=document.body;if(!b)return;if(on){[].slice.call(b.children).forEach(function(e){if(e===cov||e.tagName==="SCRIPT")return;if(e.inert!==true){e.inert=true;inerted.push(e)}})}else{inerted.forEach(function(e){e.inert=false});inerted=[]}}catch(x){}}
 function hide(){clearTimeout(tm);if(cov.parentNode)cov.parentNode.removeChild(cov);setInert(false)}
 document.documentElement.appendChild(cov);
 var done=false,tm=setTimeout(function(){done=true;hide()},1500);
 function esc(s){var d=document.createElement("div");d.textContent=String(s==null?"":s);return d.innerHTML}
 function panel(r){clearTimeout(tm);var req=r.required===true,notes=Array.isArray(r.notes)?r.notes.filter(function(x){return typeof x==="string"&&x}).slice(0,3):[];
  cov.setAttribute("aria-label","มีเวอร์ชันใหม่ของแอป");
  cov.innerHTML='<img src="icon-logo-192.png" alt="โลโก้สมาคมวิทยากรฝึกอาชีพคนตาบอด" width="112" height="112" style="width:112px;height:112px;border-radius:50%">'+
   '<p style="margin:10px 0 0;font-weight:700">สมาคมวิทยากรฝึกอาชีพคนตาบอด</p><p style="margin:2px 0 0;color:#4a6b62;font-size:.95rem">'+esc(appName)+'</p>'+
   '<h1 id="updh" tabindex="-1" style="margin:20px 0 6px;font-size:1.5rem;outline:none">มีเวอร์ชันใหม่ของแอป</h1>'+
   '<p style="margin:0 0 10px;color:#4a6b62">'+(req?"เวอร์ชันนี้จำเป็นต้องอัปเดตจึงจะใช้งานต่อได้":"อัปเดตใช้เวลาไม่ถึงนาที ข้อมูลของคุณไม่หาย")+'</p>'+
   (notes.length?'<div style="text-align:left;max-width:340px;width:100%;margin:0 0 10px"><p style="margin:0 0 4px;font-weight:700">สิ่งที่เปลี่ยน</p><ul style="margin:0;padding-left:1.2em">'+notes.map(function(n){return'<li>'+esc(n)+'</li>'}).join("")+'</ul></div>':"")+
   '<button type="button" id="updgo" style="margin-top:8px;width:100%;max-width:340px;min-height:52px;border:0;border-radius:14px;background:#1f6f5c;color:#fff;font-size:1.1rem;font-weight:700">อัปเดตเดี๋ยวนี้</button>'+
   (req?"":'<button type="button" id="updlater" style="margin-top:10px;width:100%;max-width:340px;min-height:48px;border:2px solid #1f6f5c;border-radius:14px;background:#fff;color:#1f6f5c;font-size:1.05rem;font-weight:600">ไว้ทีหลัง</button>')+
   '<p id="updmsg" role="status" style="margin:12px 0 0;min-height:1.4em;color:#b00020"></p>'+
   '<p style="margin:6px 0 0;color:#6b8179;font-size:.85rem">เวอร์ชันของคุณ '+esc(cur)+' → ใหม่ '+esc(r.v)+'</p>';
  setInert(true);if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){if(cov.parentNode)setInert(true)});var h=document.getElementById("updh");if(h)try{h.focus()}catch(x){}
  var go=document.getElementById("updgo"),lt=document.getElementById("updlater"),msg=document.getElementById("updmsg");
  if(lt)lt.onclick=function(){ss.set("upd-later",String(r.v));hide()};
  go.onclick=function(){go.disabled=true;go.style.opacity=".6";msg.style.color="#4a6b62";msg.textContent="กำลังอัปเดต กรุณารอสักครู่";apply(r).then(function(){ss.set("upd-tried",String(r.v));location.reload()},function(){go.disabled=false;go.style.opacity="1";msg.style.color="#b00020";msg.textContent="อัปเดตไม่สำเร็จ ตรวจสอบสัญญาณอินเทอร์เน็ตแล้วกดอีกครั้ง"})}}
 function apply(r){return fetch(pageUrl,{cache:"reload",credentials:"same-origin"}).then(function(res){
   if(!res||!res.ok||res.redirected||!/text\/html/i.test(res.headers.get("content-type")||""))throw new Error("bad");
   if(!window.caches)return;
   var u=new URL(pageUrl),keys=[u.origin+u.pathname];if(/\/$/.test(u.pathname))keys.push(u.origin+u.pathname+"index.html");else if(/\/index\.html$/.test(u.pathname))keys.push(u.origin+u.pathname.replace(/index\.html$/,""));
   return caches.keys().then(function(ns){return Promise.all(ns.filter(function(n){return n.indexOf("pages-")===0}).map(function(n){return caches.open(n).then(function(c){return Promise.all(keys.map(function(k){return c.put(k,res.clone())}))})}))})})}
 var ac=window.AbortController?new AbortController():null;
 fetch(verUrl,{cache:"no-store",signal:ac?ac.signal:undefined}).then(function(x){if(!x.ok)throw new Error("x");return x.json()}).then(function(r){
  if(done)return;done=true;
  if(!r||typeof r.v!=="string"||r.v===cur){hide();return}
  if(ss.get("upd-tried")===r.v){hide();return}
  if(r.required!==true&&ss.get("upd-later")===r.v){hide();return}
  panel(r)}).catch(function(){if(!done){done=true;hide()}});
 setTimeout(function(){if(!done&&ac)try{ac.abort()}catch(x){}},1500);
})();
