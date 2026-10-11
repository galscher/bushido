/* ================= 永 the score of the Way never resets =================
   The live score is now a career score: a new cycle, a new journey or a new device never drops it.
   When a run changes, what you earned is banked, so the number carries on from where it stood and keeps growing.
   On a new device the score is restored from your row on the board before anything is written,
   so a fresh browser can never overwrite your record with a lower one. */
SIGK.add('bushido-bank');
const C_PMAX=(()=>{try{return ptsOf([100,5000,60,100,1,1,9,9,ACH.length,10,1,1000,500,80,3])}catch(e){return 5e6}})();
{const o=ptsOf;ptsOf=function(pc){if(Array.isArray(pc)&&pc.length===17)return o(pc.slice(0,15))+(pc[15]|0);return o(pc)}}
{const o=ptsValid;ptsValid=function(pc,p){try{if(Array.isArray(pc)&&pc.length===17){const b=pc[15],n=pc[16];
  if(![b,n].every(x=>typeof x==='number'&&isFinite(x)&&x>=0&&x===Math.floor(x)))return false;if(n>9999||b>n*C_PMAX)return false;return o(pc.slice(0,15),p-b)}}catch(e){return false}return o(pc,p)}}
const cBank=()=>{const B=LSget('bushido-bank',null);return B&&typeof B==='object'?{b:B.b|0,n:B.n|0,id:B.id||null,last:B.last|0,banked:B.banked||''}:{b:0,n:0,id:null,last:0,banked:''}};
function cRunId(){if(!S)return null;if(!S.runId)S.runId=Date.now().toString(36)+Math.random().toString(36).slice(2,6);return S.runId}
let C_SIG='';
function cSaveBank(B){const s=JSON.stringify(B);if(s===C_SIG)return;C_SIG=s;try{if(!(S&&S._t))LSset('bushido-bank',B)}catch(e){}}
{const o=ptsPc;ptsPc=function(){const r=o.apply(this,arguments);if(!r||!S||r.length!==15)return r;try{const B=cBank(),id=cRunId(),now=ptsOf(r);
  if(B.id!==id){if(B.id&&B.id!=='__new'){const tot=B.b+B.last;B.b=Math.max(0,tot-now);B.n=Math.max(1,B.n+1)}B.id=id}
  B.last=now;if(B.b>B.n*C_PMAX)B.n=Math.ceil(B.b/C_PMAX);cSaveBank(B);return r.concat([B.b,B.n])}catch(e){return r}}}
/* restore from the board: your record there is the floor */
function cAdopt(rows){try{if(!S||!rows||!UID)return;const me=rows.find(r=>r.id===UID);if(!me||!ptsValid(me.hpc,me.hp))return;
 const b=ptsBest();if(!b||me.hp>b.p)LSset('bushido-ptsbest',{p:me.hp,pc:me.hpc});
 const pc=ptsPc();if(!pc||pc.length!==17)return;const tot=ptsOf(pc);if(me.hp<=tot)return;
 const B=cBank(),now=ptsOf(pc.slice(0,15));B.b=me.hp-now;B.n=Math.max(B.n,1,me.hpc.length===17?me.hpc[16]:0);if(B.b>B.n*C_PMAX)B.n=Math.ceil(B.b/C_PMAX);B.id=cRunId();B.last=now;cSaveBank(B);
 try{ptsTick()}catch(e){}}catch(e){}}
let C_SEEN=false;
{const o=liveOnRows;liveOnRows=function(){try{if(LIVE_ROWS){cAdopt(LIVE_ROWS);C_SEEN=true}}catch(e){}return o.apply(this,arguments)}}
{const o=livePush;livePush=async function(force){if(!C_SEEN){try{const rows=await fetchLive();if(rows){cAdopt(rows);C_SEEN=true}}catch(e){}if(!C_SEEN)return false}return o.apply(this,arguments)}}
/* ================= ▶ auto can always come back, even in the middle of a duel ================= */
{const o=autoBtnSync;autoBtnSync=function(){const r=o.apply(this,arguments);try{const b=$('#autoStop');if(!b||!S||autoOn())return r;const scr=SCREENS.find(n=>!$('#scr-'+n).hidden);
  if(scr==='fight'&&$('#overlay').hidden&&!fightOver&&P&&E&&!(FF&&FF.war)&&!XV){b.hidden=false;b.classList.add('resume');const t=TX('▶ המשך אוטומטי','▶ Resume auto');if(b.textContent!==t)b.textContent=t}}catch(e){}return r}}
{const o=autoResume;autoResume=function(){try{const scr=SCREENS.find(n=>!$('#scr-'+n).hidden);if(S&&scr==='fight'&&!fightOver&&P&&E&&!XV){S.auto=true;S.autoFight=true;NOAUTO=false;save();sfx('step');toast(TX('האוטומט חזר לפעול. הקרב ממשיך לבד.','Auto is back on. The duel carries on by itself.'));autoBtnSync();refreshPad();return}}catch(e){}return o.apply(this,arguments)}}
if(false)window.__cr={ptsPc:()=>ptsPc(),ptsOf:x=>ptsOf(x),ptsValid:(a,b)=>ptsValid(a,b),cBank:()=>cBank(),cAdopt:r=>cAdopt(r),ptsBest:()=>ptsBest(),liveRow:()=>liveRow(),get UID(){return UID},set UID(v){UID=v}};

/* a new journey adds to the score of the Way: the finished run is banked whole before the save is wiped */
function cBankRun(){try{let old=S;if(!old){try{old=load()}catch(e){old=null}}if(!old||old._t)return;const keep=S;S=old;let pc=null;try{pc=ptsPc()}finally{S=keep}
 if(!pc||pc.length!==17)return;const B=cBank(),rid=old.runId||'';if(rid&&B.banked===rid)return;B.b=ptsOf(pc);B.n=Math.max(1,(B.n|0)+1);if(B.b>B.n*C_PMAX)B.n=Math.ceil(B.b/C_PMAX);B.id='__new';B.last=0;B.banked=rid;C_SIG='';try{LSset('bushido-bank',B)}catch(e){}}catch(e){}}
{const o=wipeSave;wipeSave=function(){cBankRun();return o.apply(this,arguments)}}
{const o=newSave;newSave=function(){cBankRun();return o.apply(this,arguments)}}
/* ================= ∞ the autopilot never stops: once it is on, the game finds its own way, day and night ================= */
let AW={sig:'',t:Date.now(),n:0,lock:null};
const AW_BAD=/ספוקו|seppuku|מסע חדש|new journey|מחק|delete|wipe|לא עכשיו|not now|אני אלחם|I.ll fight|ידני|manual|עצור|stop|כבה|turn off|נקמה|revenge|אתגר|challenge|לסרב|refuse/i;
function awSig(){try{const sc=SCREENS.find(n=>!$('#scr-'+n).hidden);return[S&&S.clan&&S.clan.day,S&&S.wins,Math.round((S&&S.gold)||0),S&&S.level,sc,!$('#overlay').hidden&&($('#ovCard').textContent||'').slice(0,60),P&&Math.round(P.hp),E&&Math.round(E.hp),busy,fightOver,WAR&&WAR.round,document.querySelectorAll('.x50ov,.v40ov,#march,#intro').length].join('|')}catch(e){return String(Math.random())}}
const awVis=b=>b&&b.offsetParent&&!b.disabled;
function awUnstick(n){window.__awN=(window.__awN||0)+1;try{
 const ov=$('#overlay');if(ov&&!ov.hidden){const card=$('#ovCard');const fc=[...card.querySelectorAll('.fcard')].filter(awVis);if(fc.length&&!card.querySelector('.fcard.picked')){fc[0].click();return'card'}
  const bs=[...card.querySelectorAll('button')].filter(b=>awVis(b)&&!b.classList.contains('ovx'));const ok=bs.filter(b=>!AW_BAD.test(b.textContent||''));const pick=ok.find(b=>b.classList.contains('gold'))||ok[0]||bs[0];if(pick){pick.click();return'choice'}ov.hidden=true;return'hide'}
 for(const x of document.querySelectorAll('.x50ov,.v40ov')){const c=x.querySelector('.bar .btn')||x.querySelector('button');if(c){c.click();return'x'}x.remove();return'xr'}
 for(const x of document.querySelectorAll('#march,#intro')){x.click();return'm'}
 for(const id of['#pfOv','#lgOv']){const x=document.querySelector(id);if(x&&!x.hidden){x.hidden=true;return'p'}}
 const sc=SCREENS.find(k=>!$('#scr-'+k).hidden);
 if(sc==='title'){const b=$('#btnContinue');if(b&&!b.hidden){b.click();return'cont'}return'title'}
 if(sc==='fight'){if(fightOver){show('hub');renderHub();return'fover'}if(busy&&n>=3){busy=false}try{refreshPad();autoTurn()}catch(e){}return'fight'}
 if(sc==='war'){try{if(WAR&&!WAR.over&&!WAR.busy)autoWar();else if(WAR&&WAR.over){show('hub');renderHub()}}catch(e){}return'war'}
 if(sc!=='hub'){show('hub');renderHub();return'hub'}
 if(!nextT){S.autoFight=true;NOAUTO=false;try{GATE=0}catch(e){}autoNext();return'next'}return'wait'}catch(e){return'err'}}
async function awWake(on){try{if(on&&!AW.lock&&navigator.wakeLock&&!document.hidden){AW.lock=await navigator.wakeLock.request('screen');AW.lock.addEventListener('release',()=>{AW.lock=null})}else if(!on&&AW.lock){await AW.lock.release();AW.lock=null}}catch(e){AW.lock=null}}
setInterval(()=>{try{const on=!!(S&&autoOn());awWake(on);if(!on||document.hidden)return;S.bossAuto=1;
 const s=awSig();if(s!==AW.sig){AW.sig=s;AW.t=Date.now();AW.n=0;return}if(Date.now()-AW.t<18000)return;AW.t=Date.now();AW.n++;awUnstick(AW.n)}catch(e){}},3000);
document.addEventListener('visibilitychange',()=>{try{if(!document.hidden&&S&&autoOn()){AW.t=Date.now();awWake(true)}}catch(e){}});
/* three losses in a row no longer stop the autopilot: it grows stronger and carries on */
{const o=autoStopCard;autoStopCard=async function(){try{const m=AM();m.ls=0;m.growNext=0;feed(TX('נאוטורה: שלוש תבוסות. היא מחליפה כיוון, מחזקת את הצבא וממשיכה.','Naotora: three defeats. She changes course, strengthens the army and carries on.'));try{autoGrow()}catch(e){}save();try{renderHub()}catch(e){}return}catch(e){return o.apply(this,arguments)}}}
/* a camp day when there is nothing left to do: time passes, the treasury fills, the wounded heal, and the autopilot never spins in place */
{const o=autoGrow;autoGrow=function(){const d0=S&&S.clan?S.clan.day:0;const r=o.apply(this,arguments);try{if(S&&autoOn()&&S.clan.day===d0){const AMm=AM();AMm.idle=(AMm.idle||0)+1;if(AMm.idle>=2){AMm.idle=0;const n=[];dayTick(n);const b=Math.floor(S.est.bank||0);if(b>0){S.gold+=b;S.est.bank-=b}feed(TX(`נאוטורה: יום מנוחה במחנה. האוצר מתמלא והפצועים מחלימים (+${b} זהב).`,`Naotora: a day of rest in camp. The treasury fills and the wounded heal (+${b} gold).`));save();try{updatePills();renderHub()}catch(e){}}}else if(S){AM().idle=0}}catch(e){}return r}}
