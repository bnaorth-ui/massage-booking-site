// ต่ออายุการล็อกอินครั้งเดียวเมื่อหมดอายุ (27 พ.ย. 2569) ทั้ง 4 แอป
// เดิม: คำขอที่ยิงพร้อมกันหลังพักเกิน 1 ชม. ต่างคนต่างต่ออายุ (เห็น 11-12 ครั้งต่อนาทีจาก iPhone หมอนวด)
const fs=require('fs'),vm=require('vm'),path=require('path');
let pass=0,fail=0;const ok=(n,c)=>{c?pass++:fail++;console.log((c?'PASS ':'FAIL ')+n)};
(async()=>{
for(const app of ['customer','shop','staff','admin']){
 const s=fs.readFileSync(path.join(__dirname,'..',app,'index.html'),'utf8');
 const i=s.indexOf('function sbSet('),j=s.indexOf('\nfunction sbApi(',i);const k=s.indexOf('\n',j+1);
 const code=s.slice(i,k);
 let calls=[],fails=false,saved=0;const now=Math.floor(Date.now()/1000);
 const ctx={Promise,Date,Math,JSON,Error,console,
  sbSave:()=>{saved++},
  sbReq:(p,o)=>new Promise((res,rej)=>{calls.push(p);setTimeout(()=>{if(/refresh_token/.test(p)){if(fails){const e=new Error('Invalid Refresh Token');e.status=400;rej(e)}else res({access_token:'A'+calls.length,refresh_token:'R'+calls.length,expires_in:3600,user:{id:'u'}})}else res([])},30)}),
  SBS:{access_token:'old',refresh_token:'R0',expires_at:now-10,user:{id:'u'}}};
 vm.createContext(ctx);vm.runInContext(code+';this.go=function(n){var a=[];for(var x=0;x<n;x++)a.push(sbApi("/rest/v1/rpc/f"+x,{}));return Promise.all(a)};this.setS=function(v){SBS=v};this.getS=function(){return SBS}',ctx);
 // sbSet คืนค่า session ใหม่ แต่แอปตั้ง SBS เองใน sbSave จริง ที่นี่จำลองด้วยการตั้งจากผลลัพธ์
 ctx.sbSave=v=>{saved++;ctx.setS(v)};
 await ctx.go(12);
 const r=calls.filter(c=>/refresh_token/.test(c)).length;
 ok(app+': 12 requests after expiry -> 1 refresh (got '+r+')',r===1);
 ok(app+': all 12 requests still sent',calls.filter(c=>/rpc\/f/.test(c)).length===12);
 calls=[];await ctx.go(5);
 ok(app+': fresh session -> no refresh',calls.filter(c=>/refresh_token/.test(c)).length===0);
 // หมดอายุอีกรอบ และต่ออายุล้มเหลว: ทุกคำขอได้ข้อผิดพลาด และรอบถัดไปลองใหม่ได้
 ctx.setS({access_token:'x',refresh_token:'bad',expires_at:now-10,user:{id:'u'}});fails=true;calls=[];
 const out=await Promise.all([0,1,2].map(x=>ctx.go(1).then(()=>'ok',e=>'err')));
 ok(app+': failed refresh rejects every waiter, once ('+out+')',out.every(x=>x==='err')&&calls.filter(c=>/refresh_token/.test(c)).length===1);
 fails=false;calls=[];await ctx.go(3);
 ok(app+': retries after a failure',calls.filter(c=>/refresh_token/.test(c)).length===1);
}
console.log('pass='+pass+' fail='+fail);process.exit(fail?1:0)})();
