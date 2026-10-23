/* =====================================================================
   แจ้งเตือนนอกหน้าจอ (Web Push) + เสียงเตือนในหน้า — ใช้ร่วมกันทั้ง 4 หน้า
   หน้าเว็บเรียก Push.attach({url,key,api,token,uid}) หลังประกาศ sbApi
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
/* ---------- ปุ่มเปิด/ปิด ---------- */
function mkPill(){if(pill)return;pill=document.createElement("button");pill.type="button";pill.id="pushpill";pill.style.cssText="position:fixed;right:12px;bottom:calc(env(safe-area-inset-bottom,0px) + 74px);z-index:60;font:inherit;font-size:.85rem;font-weight:700;border-radius:99px;padding:8px 14px;border:2px solid #1f6f5c;background:#1f6f5c;color:#fff;box-shadow:0 3px 12px rgba(0,0,0,.25);cursor:pointer;max-width:80vw";pill.onclick=onPill;document.body.appendChild(pill)}
function paint(){if(!pill)return;var label="",bg="#1f6f5c",fg="#fff";
 if(state==="hidden"){pill.style.display="none";return}pill.style.display="";
 if(state==="off")label="🔔 เปิดแจ้งเตือนนอกหน้าจอ";
 else if(state==="on"){label="🔔 แจ้งเตือนนอกหน้าจอ: เปิดอยู่";bg="#fff";fg="#1f6f5c"}
 else if(state==="denied"){label="🔕 แจ้งเตือนถูกบล็อก";bg="#b3402a"}
 else if(state==="ios"){label="🔔 เปิดแจ้งเตือน (iPhone)"}
 if(busy)label="กำลังดำเนินการ…";if(msg)label=msg;
 pill.textContent=label;pill.style.background=bg;pill.style.color=fg;pill.disabled=busy}
function say(t,ms){msg=t;paint();clearTimeout(say._t);say._t=setTimeout(function(){msg="";paint()},ms||6000)}
function reg(){return navigator.serviceWorker.register("sw.js").then(function(){return navigator.serviceWorker.ready})}
function sendReg(sub){var j=sub.toJSON(),k=j.keys||{};return C.api("/rest/v1/rpc/register_push",{method:"POST",json:1,body:JSON.stringify({p_endpoint:j.endpoint,p_p256dh:k.p256dh,p_auth:k.auth})})}
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
function disable(){
 busy=true;paint();
 return navigator.serviceWorker.getRegistration("sw.js").then(function(r){return r&&r.pushManager.getSubscription()}).then(function(sub){
  if(!sub)return;var ep=sub.endpoint;return C.api("/rest/v1/rpc/unregister_push",{method:"POST",json:1,body:JSON.stringify({p_endpoint:ep})}).catch(function(){}).then(function(){return sub.unsubscribe()})
 }).then(function(){busy=false;state="off";say("ปิดแจ้งเตือนนอกหน้าจอแล้ว")},function(){busy=false;refreshState()})}
function onPill(){unlock();if(busy)return;
 if(state==="ios"){say("iPhone: กดปุ่มแชร์ แล้วเลือก \"เพิ่มลงในหน้าจอโฮม\" เปิดแอปจากไอคอนนั้น แล้วกดปุ่มนี้อีกครั้ง",12000);return}
 if(state==="denied"){say("เปิดสิทธิ์แจ้งเตือนของเว็บนี้ในตั้งค่าเบราว์เซอร์ แล้วโหลดหน้าใหม่",10000);return}
 if(state==="off")enable();else if(state==="on"){if(pill.dataset.ask==="1"){pill.dataset.ask="";disable()}else{pill.dataset.ask="1";say("กดอีกครั้งเพื่อปิดแจ้งเตือนนอกหน้าจอ",4000);setTimeout(function(){if(pill)pill.dataset.ask=""},4000)}}}
window.Push={
 attach:function(cfg){C=cfg;mkPill();refreshState();var tick=0,had=false;setInterval(function(){tick++;var has=!!(C.uid&&C.uid());if(has!==had||(has&&tick%6===0)){had=has;refreshState()}},1000);document.addEventListener("visibilitychange",function(){if(!document.hidden)refreshState()})},
 beep:beep,
 /* เสียงสำรองในหน้า: เรียก fn ทุก 2 วินาที (คืนจำนวนแจ้งเตือนที่ยังไม่อ่าน หรือ null ถ้าข้อมูลยังไม่พร้อม) ถ้าจำนวนเพิ่มขึ้น = มีของใหม่ → ส่งเสียง */
 watch:function(fn){var last=null,since=0;setInterval(function(){var n=null;try{n=fn()}catch(e){n=null}
  if(typeof n!=="number"){last=null;since=0;return}
  if(last===null){last=n;since=Date.now();return}
  if(n>last&&Date.now()-since>6000&&Date.now()-lastBeep>8000){beep();toast("มีแจ้งเตือนใหม่","เปิดเมนูแจ้งเตือนเพื่อดูรายละเอียด")}
  last=n},2000)},
 /* เรียกก่อนออกจากระบบ: เลิกผูกการแจ้งเตือนของเครื่องนี้กับบัญชีเดิม (ใช้ token ที่จับไว้ก่อนล้าง session) */
 beforeLogout:function(){try{if(!C||!CAN)return;var tk=C.token&&C.token();if(!tk||!("serviceWorker" in navigator))return;
  navigator.serviceWorker.getRegistration("sw.js").then(function(r){return r&&r.pushManager.getSubscription()}).then(function(sub){if(!sub)return;
   fetch(C.url+"/rest/v1/rpc/unregister_push",{method:"POST",keepalive:true,headers:{apikey:C.key,Authorization:"Bearer "+tk,"Content-Type":"application/json"},body:JSON.stringify({p_endpoint:sub.endpoint})}).catch(function(){})}).catch(function(){})}catch(e){}}
};
})();
