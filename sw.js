/* Service worker: รับ Web Push แล้วแสดงแจ้งเตือน + เสียง/สั่น ของระบบเครื่อง แม้ปิดหน้าเว็บอยู่ */
self.addEventListener('install',function(){self.skipWaiting()});
self.addEventListener('activate',function(e){e.waitUntil(self.clients.claim())});
self.addEventListener('push',function(e){
 var d={};try{d=e.data?e.data.json():{}}catch(x){d={title:'แจ้งเตือนใหม่',body:e.data?e.data.text():''}}
 var title=d.title||'แจ้งเตือนใหม่',body=d.body||'';
 e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(function(list){
  list.forEach(function(c){c.postMessage({type:'push',title:title,body:body,page:d.page||''})});
  if(list.some(function(c){return c.visibilityState==='visible'}))return; /* หน้าเว็บเปิดอยู่ จะมีเสียงและแบนเนอร์ในหน้าเอง */
  return self.registration.showNotification(title,{body:body,icon:'icon-192.png',badge:'icon-192.png',tag:d.tag||'msg',renotify:true,vibrate:[200,100,200,100,400],data:{page:d.page||'index.html'}});
 }));
});
self.addEventListener('notificationclick',function(e){
 e.notification.close();var page=(e.notification.data&&e.notification.data.page)||'index.html',url=new URL(page,self.registration.scope).href;
 e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(function(list){
  for(var i=0;i<list.length;i++){if(list[i].url.split('?')[0].split('#')[0]===url&&'focus' in list[i])return list[i].focus()}
  return self.clients.openWindow(url)}));
});
