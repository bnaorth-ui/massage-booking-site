/* rt.js ไฟล์ร่วมของทั้ง 4 แอป (ต้องเหมือนกันทุกแอป) แชตแบบกดกริ่ง (27 พ.ย. 2569)
   ต่อ Supabase Realtime ค้างไว้ระหว่างเปิดแชต ฟังแถวห้องตัวเองในตาราง rt_bells (ไม่มีเนื้อข้อความ)
   เมื่อกริ่งดัง เรียก onBell ให้แอปโหลดข้อความด้วยวิธีเดิม
   h.due() บอกแอปว่าควรถามเองรอบนี้ไหม: ต่อไม่ได้ = ถามทุกรอบแบบเดิม (4-5 วินาที), ต่อได้ = ถามสำรองทุก 30 วินาที
   ใช้: var h=Bell.sub({url,key,token:function(){return Promise<access_token>},topic,onBell,onLive}); h.close() ตอนปิดแชต */
(function(){
var VSN="1.0.0",BACK=[2000,5000,15000,30000,60000],SAFE=30000;
function sub(o){
 var h={live:false,closed:false,last:Date.now()},ws=null,ref=0,jr=null,hb=null,tok=null,tries=0,rt=null,ch="realtime:"+o.topic;
 function send(m){try{if(ws&&ws.readyState===1)ws.send(JSON.stringify(m))}catch(e){}}
 function setLive(v){if(h.live===v)return;h.live=v;if(o.onLive)try{o.onLive(v)}catch(e){}}
 function bell(){h.last=Date.now();try{o.onBell()}catch(e){}}
 function nref(){ref++;return String(ref)}
 function drop(){var w=ws;ws=null;clearInterval(hb);hb=null;setLive(false);if(w)try{w.onclose=null;w.close()}catch(e){}}
 function again(){clearTimeout(rt);if(h.closed||document.hidden)return;var d=BACK[Math.min(tries,BACK.length-1)];tries++;rt=setTimeout(open,d)}
 function newTok(){o.token().then(function(t){if(t&&t!==tok&&ws){tok=t;send({topic:ch,event:"access_token",payload:{access_token:t},ref:nref(),join_ref:jr})}},function(){})}
 function open(){
  clearTimeout(rt);if(h.closed||ws)return;
  if(typeof WebSocket==="undefined")return;
  o.token().then(function(t){
   if(h.closed||ws)return;tok=t;var w;
   try{w=new WebSocket(o.url.replace(/^http/,"ws")+"/realtime/v1/websocket?apikey="+encodeURIComponent(o.key)+"&vsn="+VSN)}catch(e){again();return}
   ws=w;
   w.onopen=function(){if(ws!==w)return;jr=nref();
    send({topic:ch,event:"phx_join",ref:jr,join_ref:jr,payload:{access_token:tok,config:{broadcast:{self:false,ack:false},presence:{key:""},private:false,
     postgres_changes:[{event:"*",schema:"public",table:"rt_bells",filter:"topic=eq."+o.topic}]}}});
    hb=setInterval(function(){send({topic:"phoenix",event:"heartbeat",payload:{},ref:nref()});newTok()},25000)};
   w.onmessage=function(e){if(ws!==w)return;var m;try{m=JSON.parse(e.data)}catch(x){return}
    if(!m||m.topic!==ch)return;var p=m.payload||{};
    if(m.event==="phx_reply"&&m.ref===jr){if(p.status!=="ok"){drop();tries=BACK.length;again()}return}
    if(m.event==="system"){if(p.extension==="postgres_changes"){if(p.status==="ok"){tries=0;setLive(true);bell()}else{drop();tries=BACK.length;again()}}return}
    if(m.event==="postgres_changes"){bell();return}
    if(m.event==="phx_error"||m.event==="phx_close"){drop();again()}};
   w.onerror=function(){};
   w.onclose=function(){if(ws!==w)return;drop();again()};
  },function(){again()})}
 function vis(){if(h.closed||document.hidden)return;if(!ws){tries=0;open()}}
 document.addEventListener("visibilitychange",vis);
 h.due=function(){var n=Date.now();if(!h.live||n-h.last>=SAFE){h.last=n;return true}return false};
 h.close=function(){if(h.closed)return;h.closed=true;clearTimeout(rt);document.removeEventListener("visibilitychange",vis);
  if(ws&&jr)send({topic:ch,event:"phx_leave",payload:{},ref:nref(),join_ref:jr});drop()};
 open();
 return h}
window.Bell={sub:sub};
})();
