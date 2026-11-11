/* Service worker: (1) รับ Web Push แล้วแสดงแจ้งเตือน + เสียง/สั่น ของระบบเครื่อง แม้ปิดหน้าเว็บอยู่
   (2) เก็บตัวหน้าเว็บไว้ในเครื่อง เปิดซ้ำเร็วและเปิดได้แม้สัญญาณอ่อน: ส่งของที่เก็บไว้ทันที แล้วตรวจเวอร์ชันใหม่เบื้องหลัง
       ถ้ามีเวอร์ชันใหม่จะแจ้งให้หน้าเว็บแสดงปุ่ม "อัปเดต" (ไม่รีโหลดเองกลางคัน) ข้อมูลจาก Supabase ไม่ผ่านแคชนี้เลย
   (3) เปิดครั้งแรกตอนไม่มีอินเทอร์เน็ต: แสดงหน้า "ไม่มีอินเทอร์เน็ต" ภาษาไทย พร้อมปุ่มลองใหม่
   เปลี่ยนเลข PAGE_CACHE เมื่อต้องการล้างแคชหน้าเว็บของทุกเครื่อง */
var PAGE_CACHE='pages-v2';
self.addEventListener('install',function(){self.skipWaiting()});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==PAGE_CACHE&&k.indexOf('pages-')===0}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}))});
function pageKey(u){return u.origin+u.pathname}
function refreshPage(key,cache,old){
 return fetch(key,{cache:'no-cache',credentials:'same-origin'}).then(function(res){
  if(!res||!res.ok||res.redirected||!/text\/html/i.test(res.headers.get('content-type')||''))return;
  return res.clone().text().then(function(nt){
   return (old?old.clone().text():Promise.resolve(null)).then(function(ot){
    if(ot===nt)return;
    return cache.put(key,res).then(function(){
     if(ot===null)return;
     return self.clients.matchAll({type:'window',includeUncontrolled:true}).then(function(list){list.forEach(function(c){c.postMessage({type:'update'})})})})})})}).catch(function(){})}
self.addEventListener('message',function(e){
 var d=e.data||{};if(d.type!=='warm'||typeof d.path!=='string'||d.path.charAt(0)!=='/')return;
 var key=self.location.origin+d.path.split('?')[0].split('#')[0];
 e.waitUntil(caches.open(PAGE_CACHE).then(function(c){return c.match(key).then(function(h){return refreshPage(key,c,h||null)})}))});
self.addEventListener('fetch',function(e){
 var r=e.request;if(r.method!=='GET'||r.mode!=='navigate')return;
 var u=new URL(r.url);if(u.origin!==self.location.origin)return;
 var key=pageKey(u);
 e.respondWith(caches.open(PAGE_CACHE).then(function(cache){
  return cache.match(key).then(function(hit){
   if(hit){e.waitUntil(refreshPage(key,cache,hit));
    /* สำเนาที่มีเครื่องหมายถูกเปลี่ยนเส้นทางใช้ตอบการเปิดหน้าไม่ได้ (เบราว์เซอร์ปฏิเสธ) จึงทำสำเนาใหม่ให้ */
    if(hit.redirected)return hit.clone().blob().then(function(bl){return new Response(bl,{status:200,statusText:'OK',headers:{'content-type':hit.headers.get('content-type')||'text/html; charset=utf-8'}})});
    return hit}
   /* ครั้งแรก: ใช้เครือข่ายตามปกติ แล้วเก็บสำเนาไว้ให้ครั้งหน้า */
   e.waitUntil(refreshPage(key,cache,null));
   return fetch(r).catch(function(){return offlinePage()})})})) });
/* หน้าที่แสดงเมื่อเปิดครั้งแรกตอนไม่มีอินเทอร์เน็ต (ยังไม่มีสำเนาหน้าแอปในเครื่อง) แทนหน้าเตือนของเบราว์เซอร์ */
function offlinePage(){
 var h='<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>ไม่มีอินเทอร์เน็ต</title>'+
  '<style>body{margin:0;background:#f6faf8;color:#14302a;font:18px/1.6 system-ui,-apple-system,"Sarabun","Noto Sans Thai",sans-serif}main{max-width:480px;margin:0 auto;padding:48px 20px;text-align:center}'+
  'button{margin-top:18px;width:100%;min-height:52px;border:0;border-radius:14px;background:#1f6f5c;color:#fff;font:700 1.1rem system-ui,sans-serif}p{color:#4d635c}'+
  '@media (prefers-color-scheme:dark){body{background:#10201b;color:#e6f2ee}p{color:#a9c2ba}button{background:#5fd1a8;color:#10201b}}</style></head>'+
  '<body><main><img src="icon-logo-192.png" alt="" width="96" height="96" onerror="this.remove()"><h1 tabindex="-1" id="oft">ไม่มีอินเทอร์เน็ต</h1>'+
  '<p>เปิดแอปครั้งแรกต้องใช้อินเทอร์เน็ต ตรวจสอบ Wi-Fi หรือเน็ตมือถือ แล้วกดลองใหม่</p><button type="button" onclick="location.reload()">ลองใหม่</button></main>'+
  '<script>try{document.getElementById("oft").focus()}catch(e){}addEventListener("online",function(){location.reload()})<\/script></body></html>';
 return new Response(h,{status:200,headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store'}})}
self.addEventListener('push',function(e){
 var d={};try{d=e.data?e.data.json():{}}catch(x){d={title:'แจ้งเตือนใหม่',body:e.data?e.data.text():''}}
 var title=d.title||'แจ้งเตือนใหม่',body=d.body||'';
 e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(function(list){
  list.forEach(function(c){c.postMessage({type:'push',title:title,body:body,page:d.page||''})});
  if(list.some(function(c){return c.visibilityState==='visible'}))return; /* หน้าเว็บเปิดอยู่ จะมีเสียงและแบนเนอร์ในหน้าเอง */
  return self.registration.showNotification(title,{body:body,icon:'icon-logo-192.png',badge:'icon-192.png',tag:d.tag||'msg',renotify:true,vibrate:[200,100,200,100,400],data:{page:d.page||'index.html'}});
 }));
});
self.addEventListener('notificationclick',function(e){
 e.notification.close();var url=new URL('index.html',self.registration.scope).href;
 e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(function(list){
  for(var i=0;i<list.length;i++){if(list[i].url.split('?')[0].split('#')[0]===url&&'focus' in list[i])return list[i].focus()}
  return self.clients.openWindow(url)}));
});
