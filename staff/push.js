/* =====================================================================
   แจ้งเตือนนอกหน้าจอ (Web Push) + เสียงเตือนในหน้า — ใช้ร่วมกันทั้ง 4 หน้า
   หน้าเว็บเรียก Push.attach({url,key,api,token,uid,app}) หลังประกาศ sbApi (app = customer, shop, staff หรือ admin)
   ===================================================================== */
(function(){
var C=null,pill=null,toastEl=null,state="hidden",lastUid=null,ctx=null,busy=false,msg="";
var IOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
var STANDALONE=(window.matchMedia&&matchMedia("(display-mode: standalone)").matches)||navigator.standalone===true;
var CAN=!!(window.isSecureContext&&"serviceWorker" in navigator&&"PushManager" in window&&"Notification" in window);
function b64u(s){var p="=".repeat((4-s.length%4)%4),b=(s+p).replace(/-/g,"+").replace(/_/g,"/"),r=atob(b),o=new Uint8Array(r.length);for(var i=0;i<r.length;i++)o[i]=r.charCodeAt(i);return o}
function esc(x){return String(x==null?"":x).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
/* ---------- เสียงในหน้า ---------- */
function unlock(){try{var A=window.AudioContext||window.webkitAudioContext;if(!A)return;if(!ctx)ctx=new A();if(ctx.state==="suspended")ctx.resume()}catch(e){}}
["pointerdown","keydown","touchstart"].forEach(function(ev){document.addEventListener(ev,unlock,{passive:true})});
var lastBeep=0;
function beep(){lastBeep=Date.now();try{unlock();if(!ctx)return;var t=ctx.currentTime;[[880,0],[1175,0.18],[880,0.36],[1175,0.54]].forEach(function(n){var o=ctx.createOscillator(),g=ctx.createGain();o.type="sine";o.frequency.value=n[0];o.connect(g);g.connect(ctx.destination);g.gain.setValueAtTime(0.0001,t+n[1]);g.gain.exponentialRampToValueAtTime(0.35,t+n[1]+0.02);g.gain.exponentialRampToValueAtTime(0.0001,t+n[1]+0.16);o.start(t+n[1]);o.stop(t+n[1]+0.18)});if(navigator.vibrate)navigator.vibrate([200,100,200])}catch(e){}}
function toast(title,body){try{if(!toastEl){toastEl=document.createElement("div");toastEl.setAttribute("role","status");toastEl.style.cssText="position:fixed;left:12px;right:12px;top:max(12px,env(safe-area-inset-top));z-index:100;max-width:460px;margin:0 auto;background:#1f6f5c;color:#fff;border-radius:14px;padding:12px 16px;box-shadow:0 6px 24px rgba(0,0,0,.3);font:inherit;display:none;cursor:pointer";toastEl.onclick=function(){toastEl.style.display="none"};document.body.appendChild(toastEl)}
 toastEl.innerHTML="<b>🔔 "+esc(title)+"</b><div style=\"white-space:pre-wrap;font-size:.92rem\">"+esc(body)+"</div>";toastEl.style.display="block";clearTimeout(toastEl._t);toastEl._t=setTimeout(function(){toastEl.style.display="none"},7000)}catch(e){}}
if("serviceWorker" in navigator)navigator.serviceWorker.addEventListener("message",function(e){var d=e.data||{};if(d.type!=="push")return;if(document.visibilityState==="visible"){beep();toast(d.title,d.body)}try{window.dispatchEvent(new Event("push-refresh"))}catch(x){}});
/* ---------- แจ้งว่ามีเวอร์ชันใหม่ (จาก service worker) ---------- */
var updEl=null;
function showUpd(){try{if(updEl)return;updEl=document.createElement("div");updEl.setAttribute("role","status");updEl.style.cssText="position:fixed;left:12px;right:12px;bottom:calc(env(safe-area-inset-bottom,0px) + 12px);z-index:95;background:#1f6f5c;color:#fff;border-radius:14px;padding:12px 14px;display:flex;gap:10px;align-items:center;justify-content:space-between;font-size:1rem;box-shadow:0 6px 24px rgba(0,0,0,.25)";
 updEl.innerHTML='<span>มีเวอร์ชันใหม่ของแอป</span><button type="button" style="background:#fff;color:#1f6f5c;border:0;border-radius:10px;padding:10px 14px;font-weight:700;font-size:1rem;min-height:44px">อัปเดตเดี๋ยวนี้</button>';
 updEl.querySelector("button").onclick=function(){location.reload()};document.body.appendChild(updEl)}catch(x){}}
if("serviceWorker" in navigator)navigator.serviceWorker.addEventListener("message",function(e){var d=e.data||{};if(d.type==="update")showUpd()});
/* ลงทะเบียน service worker ตั้งแต่เปิดหน้า เพื่อให้หน้าเว็บถูกเก็บไว้ในเครื่อง (ไม่เกี่ยวกับการเปิดแจ้งเตือน) */
if("serviceWorker" in navigator&&window.isSecureContext)window.addEventListener("load",function(){navigator.serviceWorker.register("sw.js").then(function(){return navigator.serviceWorker.ready}).then(function(r){if(r.active)r.active.postMessage({type:"warm",path:location.pathname})}).catch(function(){})});
/* ---------- ปุ่มเปิด/ปิด ---------- */
function mkPill(){if(pill)return;pill=document.createElement("button");pill.type="button";pill.id="pushpill";pill.style.cssText="position:fixed;right:12px;bottom:calc(env(safe-area-inset-bottom,0px) + 74px);z-index:60;font:inherit;font-size:.85rem;font-weight:700;border-radius:99px;padding:8px 14px;border:2px solid #1f6f5c;background:#1f6f5c;color:#fff;box-shadow:0 3px 12px rgba(0,0,0,.25);cursor:pointer;max-width:80vw";pill.onclick=onPill;document.body.appendChild(pill)}
function paint(){if(!pill)return;var label="",bg="#1f6f5c",fg="#fff";
 if(state==="hidden"||(state==="on"&&!busy&&!msg)){pill.style.display="none";return}pill.style.display="";
 if(state==="off")label="🔔 เปิดแจ้งเตือนนอกหน้าจอ";
 else if(state==="on"){label="🔔 แจ้งเตือนนอกหน้าจอ: เปิดอยู่";bg="#fff";fg="#1f6f5c"}
 else if(state==="denied"){label="🔕 แจ้งเตือนถูกบล็อก";bg="#b3402a"}
 else if(state==="ios"){label="🔔 เปิดแจ้งเตือน (iPhone)"}
 if(busy)label="กำลังดำเนินการ…";if(msg)label=msg;
 pill.textContent=label;pill.style.background=bg;pill.style.color=fg;pill.disabled=busy;setTimeout(ask,600)}
function say(t,ms){msg=t;paint();clearTimeout(say._t);say._t=setTimeout(function(){msg="";paint()},ms||6000)}
function reg(){return navigator.serviceWorker.register("sw.js").then(function(){return navigator.serviceWorker.ready})}
/* ส่งชื่อแอป (customer/shop/staff/admin) ไปด้วย ระบบจะส่งแจ้งเตือนนอกหน้าจอเฉพาะแอปที่ตรงกับเรื่องนั้น
   (เบอร์เดียวกันใช้ได้หลายแอป เช่น ผู้ใช้งาน + หมอนวด) ถ้าฐานข้อมูลยังเป็นรุ่นเก่าที่ไม่รับชื่อแอป จะลงทะเบียนแบบเดิมแทน */
function sendReg(sub){var j=sub.toJSON(),k=j.keys||{},b={p_endpoint:j.endpoint,p_p256dh:k.p256dh,p_auth:k.auth},go=function(x){return C.api("/rest/v1/rpc/register_push",{method:"POST",json:1,body:JSON.stringify(x)})};
 if(!C.app)return go(b);var b2={p_endpoint:b.p_endpoint,p_p256dh:b.p_p256dh,p_auth:b.p_auth,p_app:C.app};
 return go(b2).catch(function(e){if(/p_app|register_push|schema cache|PGRST202|function/i.test(String(e&&e.message||e)))return go(b);throw e})}
function refreshState(){
 if(!C||!C.uid()){state="hidden";lastUid=null;paint();return}
 if(IOS&&!STANDALONE){state="ios";paint();return}
 if(!CAN){state="hidden";paint();return}
 if(Notification.permission==="denied"){state="denied";paint();return}
 if(Notification.permission!=="granted"){state="off";paint();return}
 navigator.serviceWorker.getRegistration("sw.js").then(function(r){return r&&r.pushManager.getSubscription()}).then(function(sub){
  if(!sub){state="off";paint();return}
  state="on";paint();
  if(lastUid!==C.uid()){lastUid=C.uid();sendReg(sub).catch(function(){})} /* ย้ายการแจ้งเตือนของเครื่องนี้ให้เป็นของผู้ที่ล็อกอินอยู่ */
 }).catch(function(){state="off";paint()})}
function enable(){
 busy=true;paint();
 return Notification.requestPermission().then(function(p){
  if(p!=="granted"){busy=false;state=p==="denied"?"denied":"off";say(p==="denied"?"ถูกบล็อก ไปเปิดสิทธิ์แจ้งเตือนในตั้งค่าเบราว์เซอร์":"ยังไม่ได้อนุญาตการแจ้งเตือน");return}
  return C.api("/rest/v1/app_settings?select=vapid_public&limit=1").then(function(r){
   var k=r&&r[0]&&r[0].vapid_public;if(!k)throw new Error("NOKEY");
   return reg().then(function(rg){return rg.pushManager.getSubscription().then(function(old){return old||rg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64u(k)})})}).then(function(sub){
    return sendReg(sub).then(function(){busy=false;lastUid=C.uid();state="on";say("เปิดแจ้งเตือนนอกหน้าจอแล้ว ✓");beep();
     navigator.serviceWorker.ready.then(function(rg){rg.showNotification("เปิดแจ้งเตือนแล้ว",{body:"ต่อไปนี้จะมีเสียงเตือนเมื่อมีรายการใหม่ แม้ปิดหน้านี้อยู่",icon:"icon-192.png",tag:"welcome"})}).catch(function(){})})})})
 }).catch(function(e){busy=false;var m=String(e&&e.message||"");
  say(m==="NOKEY"?"ผู้ดูแลยังไม่ได้ตั้งค่ากุญแจแจ้งเตือน (VAPID) ในระบบ":m==="NET"?"เชื่อมต่อไม่ได้ ลองใหม่":/register_push|schema cache|does not exist/i.test(m)?"ฐานข้อมูลยังไม่ได้รัน SQL ชุดที่ 6":"เปิดแจ้งเตือนไม่สำเร็จ: "+m,9000)})}
/* ---------- หน้าต่างชวนเปิดแจ้งเตือน (หลังเข้าสู่ระบบ ถามไม่เกินวันละครั้ง) ---------- */
var askEl=null,askShown=false,askInert=[];
function askKey(){return "pushAsk:"+(C&&C.uid?C.uid():"")}
function askRecent(){try{var t=+localStorage.getItem(askKey())||0;return Date.now()-t<20*3600*1000}catch(e){return false}}
function askStamp(){try{localStorage.setItem(askKey(),String(Date.now()))}catch(e){}}
function askClose(){if(!askEl)return;try{askEl.parentNode&&askEl.parentNode.removeChild(askEl)}catch(e){}askInert.forEach(function(e){e.inert=false});askInert=[];var el=askEl;askEl=null;if(el._prev&&el._prev.focus)try{el._prev.focus()}catch(e){}}
function ask(){
 if(askShown||askEl||window.__NO_PUSH_ASK===true||(navigator.webdriver&&window.__NO_PUSH_ASK!==false))return; /* เบราว์เซอร์ที่ถูกควบคุมด้วยโปรแกรมทดสอบไม่ขึ้นหน้าต่างนี้ เว้นแต่ข้อสอบตั้ง __NO_PUSH_ASK=false */
 if(!C||!C.uid||!C.uid()||(state!=="off"&&state!=="ios")||busy)return;
 if(document.getElementById("updcov")||document.hidden||!document.body)return; /* รอหน้า "มีเวอร์ชันใหม่" ปิดก่อน แล้วลองใหม่รอบถัดไป */
 if(askRecent())return;
 askShown=true;askStamp();
 var ios=state==="ios";
 var d=document.createElement("div");d.id="pushask";d.setAttribute("role","dialog");d.setAttribute("aria-modal","true");d.setAttribute("aria-labelledby","pushaskh");d._prev=document.activeElement;
 d.style.cssText="position:fixed;left:0;top:0;right:0;bottom:0;z-index:2147482000;background:rgba(18,49,42,.55);display:flex;align-items:center;justify-content:center;padding:20px";
 var bs="width:100%;min-height:52px;border-radius:14px;font:inherit;font-size:1.1rem;font-weight:700;cursor:pointer;";
 d.innerHTML='<div style="background:#fff;color:#12312a;border-radius:20px;padding:24px 20px;max-width:380px;width:100%;text-align:center;box-shadow:0 10px 40px rgba(0,0,0,.35)">'+
  '<img src="icon-logo-192.png" alt="" width="72" height="72" style="width:72px;height:72px;border-radius:50%">'+
  '<h2 id="pushaskh" tabindex="-1" style="margin:12px 0 8px;font-size:1.35rem;outline:none">เปิดการแจ้งเตือน</h2>'+
  (ios?'<p style="margin:0 0 16px;color:#4a6b62;text-align:left">บน iPhone ต้องติดตั้งแอปก่อนจึงจะเปิดแจ้งเตือนได้ ให้กดปุ่มแชร์ของ Safari เลือก "เพิ่มลงในหน้าจอโฮม" เปิดแอปจากไอคอนนั้น แล้วเข้าสู่ระบบอีกครั้ง จะมีหน้านี้ให้กดเปิดแจ้งเตือน</p>'
   :'<p style="margin:0 0 16px;color:#4a6b62">รับแจ้งเตือนเรื่องการจอง การเปลี่ยนแปลง และข้อความ แม้ปิดแอปอยู่ เปิดครั้งเดียวใช้ได้ต่อเนื่อง</p>')+
  (ios?'':'<button type="button" id="pushaskgo" style="'+bs+'border:0;background:#1f6f5c;color:#fff">เปิดแจ้งเตือน</button>')+
  '<button type="button" id="pushasklater" style="'+bs+(ios?'border:0;background:#1f6f5c;color:#fff':'margin-top:10px;min-height:48px;border:2px solid #1f6f5c;background:#fff;color:#1f6f5c;font-weight:600')+'">'+(ios?'รับทราบ':'ไว้ทีหลัง')+'</button></div>';
 document.body.appendChild(d);askEl=d;
 [].slice.call(document.body.children).forEach(function(e){if(e===d||e.tagName==="SCRIPT"||e.inert===true)return;e.inert=true;askInert.push(e)});
 var go=d.querySelector("#pushaskgo"),lt=d.querySelector("#pushasklater");
 if(go)go.onclick=function(){askClose();unlock();enable()};
 lt.onclick=askClose;
 d.addEventListener("keydown",function(ev){if(ev.key==="Escape")askClose()});
 var h=d.querySelector("#pushaskh");try{h.focus()}catch(e){}}
function onPill(){unlock();if(busy)return;
 if(state==="ios"){say("iPhone: กดปุ่มแชร์ แล้วเลือก \"เพิ่มลงในหน้าจอโฮม\" เปิดแอปจากไอคอนนั้น แล้วกดปุ่มนี้อีกครั้ง",12000);return}
 if(state==="denied"){say("เปิดสิทธิ์แจ้งเตือนของเว็บนี้ในตั้งค่าเบราว์เซอร์ แล้วโหลดหน้าใหม่",10000);return}
 if(state==="off")enable()}
window.Push={
 attach:function(cfg){C=cfg;mkPill();refreshState();var tick=0,had=false;setInterval(function(){tick++;var has=!!(C.uid&&C.uid());if(has!==had||(has&&tick%6===0)){had=has;refreshState()}},1000);document.addEventListener("visibilitychange",function(){if(!document.hidden)refreshState()})},
 beep:beep,toast:toast,
 /* เสียงสำรองในหน้า: เรียก fn ทุก 2 วินาที (คืนจำนวนแจ้งเตือนที่ยังไม่อ่าน หรือ null ถ้าข้อมูลยังไม่พร้อม) ถ้าจำนวนเพิ่มขึ้น = มีของใหม่ → ส่งเสียง */
 watch:function(fn){var last=null,since=0;setInterval(function(){var n=null;try{n=fn()}catch(e){n=null}
  if(typeof n!=="number"){last=null;since=0;return}
  if(last===null){last=n;since=Date.now();return}
  if(n>last&&Date.now()-since>6000&&Date.now()-lastBeep>8000){beep();toast("มีแจ้งเตือนใหม่","เปิดเมนูแจ้งเตือนเพื่อดูรายละเอียด")}
  last=n},2000)},
 /* เรียกก่อนออกจากระบบ: เลิกผูกการแจ้งเตือนของเครื่องนี้กับบัญชีเดิม (ใช้ token ที่จับไว้ก่อนล้าง session) */
 beforeLogout:function(){try{if(!C||!CAN)return;var tk=C.token&&C.token();if(!tk||!("serviceWorker" in navigator))return;
  return navigator.serviceWorker.getRegistration("sw.js").then(function(r){return r&&r.pushManager.getSubscription()}).then(function(sub){if(!sub)return;
   return fetch(C.url+"/rest/v1/rpc/unregister_push",{method:"POST",keepalive:true,headers:{apikey:C.key,Authorization:"Bearer "+tk,"Content-Type":"application/json"},body:JSON.stringify({p_endpoint:sub.endpoint})}).catch(function(){})}).catch(function(){})}catch(e){}}
};
})();
