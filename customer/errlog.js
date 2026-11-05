/* =====================================================================
   รายงานข้อผิดพลาดจากหน้าเว็บ (ใช้ร่วมกันทั้ง 4 หน้า ไฟล์ต้องเหมือนกันทุกแอป)
   โหลดก่อนสคริปต์อื่นในส่วนหัว จึงดักข้อผิดพลาดได้ตั้งแต่เริ่มเปิดหน้า
   หน้าเว็บเรียก ErrLog.attach({app,url,key,menu}) หลังประกาศ SB
   และ ErrLog.server(path,status,code) เมื่อเซิร์ฟเวอร์ตอบผิดปกติ
   ไม่ส่งข้อมูลส่วนตัว: ไม่มีชื่อ เบอร์ บัญชีผู้ใช้ เลขการจอง หรือข้อความที่พิมพ์ (ตัวเลขยาวถูกแทนด้วย #)
   ===================================================================== */
(function(){
var C=null,Q=[],sent=0,seen={},MAX=5;
function clean(s,n){return String(s==null?"":s).replace(/\d{6,}/g,"#").replace(/[\w.+-]+@[\w-]+\.[\w.]+/g,"@").replace(/\s+/g," ").trim().slice(0,n)}
function ver(){var m=document.querySelector('meta[name="app-version"]');return m?m.getAttribute("content")||"":""}
function device(){var u=navigator.userAgent||"",d=/iPad/.test(u)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1)?"iPad":/iPhone|iPod/.test(u)?"iPhone":/Android/.test(u)?"Android":/Windows/.test(u)?"Windows":/Mac/.test(u)?"Mac":"อื่นๆ",
 b=/Line\//.test(u)?"LINE":/FBAN|FBAV/.test(u)?"Facebook":/SamsungBrowser/.test(u)?"Samsung":/EdgA?\//.test(u)?"Edge":/CriOS|Chrome\//.test(u)?"Chrome":/FxiOS|Firefox\//.test(u)?"Firefox":/Safari\//.test(u)?"Safari":"อื่นๆ",
 app=(window.matchMedia&&matchMedia("(display-mode: standalone)").matches)||navigator.standalone===true;
 return d+" "+b+(app?" แอป":" เว็บ")}
function src(f,l,c){if(!f)return"";var p=String(f).split("#")[0].split("?")[0],i=p.lastIndexOf("/");p=i>=0?p.slice(i+1):p;return(p||"index.html")+(l?":"+l+(c?":"+c:""):"")}
function sameOrigin(f){if(!f)return true;try{var u=new URL(f,location.href);return u.origin===location.origin||u.protocol==="file:"}catch(e){return false}}
function menu(){try{return C&&C.menu?String(C.menu()||""):""}catch(e){return""}}
function post(x){
 try{fetch(C.url+"/rest/v1/rpc/log_client_error",{method:"POST",keepalive:true,headers:{apikey:C.key,"Content-Type":"application/json"},
  body:JSON.stringify({p_app:C.app,p_version:x.v,p_kind:x.k,p_message:x.m,p_source:x.s,p_menu:x.u,p_device:x.d})}).catch(function(){})}catch(e){}}
function report(k,m,s){
 m=clean(m,200);s=clean(s,120);if(!m)return;
 if(navigator.onLine===false)return;
 var key=k+"|"+m+"|"+s;if(seen[key]||sent>=MAX)return;seen[key]=1;sent++;
 var x={k:k,m:m,s:s,v:ver(),u:menu(),d:device()};
 if(C)post(x);else if(Q.length<MAX)Q.push(x)}
/* ข้อความที่ไม่ใช่ปัญหาของระบบ (ส่วนเสริมของเบราว์เซอร์ เน็ตหลุด ยังไม่ล็อกอิน) */
function noise(m){return !m||/^Script error\.?$/i.test(m)||/ResizeObserver loop/i.test(m)||/^(NET|NOSESS)$/.test(m)||/Load failed|Failed to fetch|NetworkError|network error/i.test(m)}
window.addEventListener("error",function(e){
 if(!e||e.target&&e.target!==window)return; /* รูปหรือไฟล์โหลดไม่ขึ้น ไม่นับ */
 var m=String(e.message||(e.error&&e.error.message)||"").replace(/^Uncaught\s+(\w*Error:\s*)?/,function(a,t){return t||""});if(noise(m.replace(/^\w*Error:\s*/,""))||!sameOrigin(e.filename))return;
 report("js",m,src(e.filename,e.lineno,e.colno))});
window.addEventListener("unhandledrejection",function(e){
 var r=e&&e.reason;if(r&&r.status!==undefined)return; /* คำตอบจากเซิร์ฟเวอร์ รายงานแยกที่ ErrLog.server แล้ว */
 var m=r&&r.message||String(r==null?"":r);if(noise(m))return;
 var s="";try{var st=r&&r.stack?String(r.stack).split("\n"):[];for(var i=0;i<st.length;i++){var g=/(\S+?):(\d+):(\d+)\)?\s*$/.exec(st[i]);if(g){if(!sameOrigin(g[1]))return;s=src(g[1],g[2],g[3]);break}}}catch(x){}
 report("promise",m,s)});
window.ErrLog={
 attach:function(c){if(!c||!c.url||!c.key||!c.app)return;C=c;var q=Q;Q=[];q.forEach(post)},
 /* เซิร์ฟเวอร์ล่ม (5xx) หรือ SQL/ฟังก์ชันผิด (รหัส 42xxx, PGRST2xx) เท่านั้น ข้อความแจ้งเตือนทั่วไปของระบบไม่นับ */
 server:function(path,status,code){status=+status||0;code=String(code||"");
  if(!(status>=500||/^42/.test(code)||/^PGRST2/.test(code)))return;
  var p=String(path||"").split("?")[0];report("server","HTTP "+status+(code?" "+code:"")+" "+p,"")},
 _test:{clean:clean,device:device}
};
})();
