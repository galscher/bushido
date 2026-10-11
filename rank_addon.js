/* ================= 国盗り合戦 Kunitori-gassen: challenge the lord above you on the board =================
   Every player on the board can challenge the one directly above. It is not a duel of two men:
   your whole realm marches against his whole realm, his armies, his provinces, his commander.
   He does not need to be online. His realm is kept as a war record on the board, and his generals fight in his name.
   Balance, so the veterans keep their pride:
   - the defender never loses points; the winner gains glory, at most a quarter of the defender's score per win,
     so a wide gap takes several victories to close;
   - a defender who was beaten gets a 12-hour truce and a free revenge challenge;
   - the defender fights at home: his castles count for +10%;
   - each lord can launch one challenge every three hours. */
const RK_CD=3*3600e3,RK_TRUCE=12*3600e3;
function rkSnap(){try{const ap=Math.round(armyPower()),gm=+generalMul().toFixed(3);return{ap,gm,lv:S.level|0,prov:S.clan.cities.length,ret:S.clan.ret.length,hero:S.hero|0,str:(S.stats&&S.stats.str)|0,wk:myWk()}}catch(e){return null}}
const rkLast=()=>LSget('bushido-rk',{cd:0,seen:0,rev:{}});
SIGK.add('bushido-rk');
{const o=liveRow;liveRow=function(){const r=o.apply(this,arguments);try{if(S){const s=rkSnap();if(s)r.emp=s;const L=rkLast();if(L.last)r.rk=L.last}}catch(e){}return r}}
function rkBoard(){try{if(!LIVE_ROWS||!UID)return null;const rows=LIVE_ROWS.filter(r=>ptsValid(r.hpc,r.hp)).map(r=>r.id===UID?{...r,hp:Math.max(r.hp,ptsNow())}:r);
 if(!rows.some(r=>r.id===UID))rows.push({id:UID,name:playerName()||'?',hp:ptsNow(),me:1});rows.sort((a,b)=>b.hp-a.hp);const i=rows.findIndex(r=>r.id===UID);return{rows,i,me:rows[i],above:i>0?rows[i-1]:null}}catch(e){return null}}
function rkTruce(uid){try{const now=Date.now();return(LIVE_ROWS||[]).some(r=>r.rk&&r.rk.t===uid&&r.rk.w&&now-(r.rk.ts||0)<RK_TRUCE&&r.id!==UID)}catch(e){return false}}
function rkDef(t){const e=t.emp||{};const lv=clamp(e.lv||t.lv||1,1,100);const ap=Math.max(50,Math.min(e.ap||lv*40,lv*6000));return Math.round(ap*clamp(e.gm||1,.5,3)*1.1)}
function rkFoe(t){const e=t.emp||{},lv=clamp(e.lv||t.lv||1,1,100),h=HEROES[e.hero!=null?e.hero:(t.h|0)]||HEROES[0];
 return{name:(t.name||TX('אדון אלמוני','A nameless lord')).slice(0,20),level:lv,stats:genStats(lv,'str',hashStr(t.id||'x'),4),wk:e.wk||h.wk,forge:Math.min(5,Math.floor(lv/12)),armor:Math.min(4,Math.floor(lv/20)),look:{...h.look,hero:1},champ:1,blurb:TX('האימפריה שמעליך בטבלה','The empire above you on the board')}}
/* the two realms on one map */
function rkMap(cv,n2){try{if(!MAPD)MAPD=buildMapData();const D=MAPD,W=MAPW,H=MAPH,own=new Set(S.clan.cities.map(id=>CITIES.findIndex(c=>c.id===id)).filter(i=>i>=0));
 const home=[...own].map(i=>D.pts[i]);const cx=home.length?home.reduce((s,p)=>s+p.x,0)/home.length:W/2,cy=home.length?home.reduce((s,p)=>s+p.y,0)/home.length:H/2;
 const foe=new Set(CITIES.map((c,i)=>i).filter(i=>!own.has(i)).sort((a,b)=>Math.hypot(D.pts[b].x-cx,D.pts[b].y-cy)-Math.hypot(D.pts[a].x-cx,D.pts[a].y-cy)).slice(0,Math.max(1,Math.min(99-own.size,n2))));
 const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d'),im=g.createImageData(W,H),d=im.data,t=performance.now()/1000;
 for(let k=0;k<W*H;k++){const o=D.owner[k],j=k*4;let r=14,gg=30,b=50;if(o>=0){const e=.72+(D.elev[k]||0)*.5;if(own.has(o)){r=40*e;gg=170*e;b=245*e}else if(foe.has(o)){r=220*e;gg=50*e;b=40*e}else{r=70*e;gg=64*e;b=52*e}
  const x=k%W,y=(k/W)|0,R=x+1<W?D.owner[k+1]:o,Dn=y+1<H?D.owner[k+W]:o;if((own.has(o)&&(foe.has(R)||foe.has(Dn)))||(foe.has(o)&&(own.has(R)||own.has(Dn)))){const f=Math.sin(t*8+x+y)>0;r=255;gg=f?220:90;b=f?90:30}}
  d[j]=r;d[j+1]=gg;d[j+2]=b;d[j+3]=255}g.putImageData(im,0,0);const g2=cv.getContext('2d');g2.imageSmoothingEnabled=false;g2.drawImage(c,0,0,cv.width,cv.height)}catch(e){}}
async function rkChallenge(t,revenge){if(!S||!t)return;const L=rkLast(),now=Date.now();
 const cd0=Math.max(L.cd||0,S.rkCd||0);if(!revenge&&now-cd0<RK_CD){toast(TX(`הצבא עוד מתאושש. אתגר הבא בעוד ${Math.ceil((RK_CD-(now-cd0))/60000)} דקות.`,`Your army is still recovering. Next challenge in ${Math.ceil((RK_CD-(now-cd0))/60000)} minutes.`));return}
 if(!revenge&&rkTruce(t.id)){toast(TX(`${t.name} בהפוגה: הוא הובס לאחרונה ומוגן 12 שעות.`,`${t.name} is under truce: beaten recently and protected for 12 hours.`));return}
 const my=Math.round(armyPower()*generalMul()),def=rkDef(t),e=t.emp||{},meN=playerName()||S.name,gain=Math.max(1,Math.min(Math.round(t.hp*.25),t.hp-ptsNow()+1));
 const banner=(nm,ap,prov,col,kj)=>`<div style="flex:1;min-width:0;text-align:center;padding:8px;border:2px solid ${col};border-radius:10px;background:rgba(0,0,0,.35)"><div class="kanji" style="font-size:30px;color:${col}">${kj}</div><b style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(nm)}</b><div class="muted" style="font-size:12px">⚔ ${fmtN(ap)} · ${prov} ${TX('מחוזות','provinces')}</div></div>`;
 const pr=choice(`<div class="eyebrow">国盗り合戦 · ${revenge?TX('נקמה','Revenge'):TX('אתגר על המקום בטבלה','A challenge for the place on the board')}</div><h2>${TX('אימפריה מול אימפריה','Empire against empire')}</h2>
  <canvas id="rkMap" width="336" height="376" style="width:100%;max-width:300px;display:block;margin:6px auto;border:2px solid #000;border-radius:6px;image-rendering:pixelated"></canvas>
  <div class="row" style="gap:8px;flex-wrap:nowrap">${banner(meN,my,S.clan.cities.length,'#28aaf5','攻')}<div class="kanji" style="align-self:center;font-size:26px;color:var(--gold)">対</div>${banner(t.name,def,e.prov||t.prov||0,'#e8402a','守')}</div>
  <p data-lt="1" class="muted" style="font-size:13px;margin-top:8px">${TX(`${t.name} לא צריך להיות מחובר: הגנרלים שלו מגינים בשמו, ולטירות שלו יתרון של 10% בבית. ניצחון יעניק לך עד ${fmtN(gain)} נקודות תהילה, והוא לא יאבד אף נקודה. מפסידים? הצבא שלך ישלם בחיילים.`,`${t.name} need not be online: his generals defend in his name, and his castles give him 10% at home. Victory gives you up to ${fmtN(gain)} points of glory, and he loses none. Lose, and your army pays in soldiers.`)}</p>`,
  [{key:'go',label:TX('⚔ צא למלחמה','⚔ March to war'),cls:'gold'},{key:'no',label:TX('לא עכשיו','Not now'),cls:'ghost'}]);
 let raf=0;const loop=()=>{const cv=document.getElementById('rkMap');if(!cv)return;rkMap(cv,e.prov||t.prov||10);raf=setTimeout(loop,120)};setTimeout(loop,30);
 const k=await pr;clearTimeout(raf);if(k!=='go')return;
 const L2=rkLast();if(!revenge){L2.cd=Date.now();S.rkCd=L2.cd;save()}else{L2.rev=L2.rev||{};delete L2.rev[t.id]}LSset('bushido-rk',L2);
 startFight({kind:'rank',def,fd:rkFoe(t),rkT:{id:t.id,name:t.name,hp:t.hp,gain},place:TX(`האימפריה של ${t.name}`,`${t.name}’s empire`),banner:TX('国盗り合戦!','国盗り合戦!')})}
{const o=warEnd;warEnd=async function(win,x){try{const ctx=WAR&&WAR.ctx;if(ctx&&ctx.kind==='rank'&&ctx.rkT){const L=rkLast();L.last={t:ctx.rkT.id,ts:Date.now(),w:win?1:0};LSset('bushido-rk',L);
  if(win){const B=cBank();B.b+=ctx.rkT.gain;B.n=Math.max(1,B.n);if(B.b>B.n*C_PMAX)B.n=Math.ceil(B.b/C_PMAX);cSaveBank(B);if(FF&&FF.notes)FF.notes.push(TX(`🏆 ניצחת את האימפריה של ${ctx.rkT.name}: +${fmtN(ctx.rkT.gain)} נקודות תהילה`,`🏆 You defeated ${ctx.rkT.name}’s empire: +${fmtN(ctx.rkT.gain)} points of glory`));setTimeout(()=>{try{ptsTick();livePush(true)}catch(e){}},1500)}
  else if(FF&&FF.notes)FF.notes.push(TX(`${ctx.rkT.name} הדף אותך. נסה שוב בעוד שלוש שעות.`,`${ctx.rkT.name} threw you back. Try again in three hours.`))}}catch(e){}return o.apply(this,arguments)}}
/* the defender learns of it, and may take revenge */
let RK_SAID=0;
{const o=liveOnRows;liveOnRows=function(){const r=o.apply(this,arguments);try{if(!S||!UID||!LIVE_ROWS)return r;const L=rkLast();let ch=false;
  for(const x of LIVE_ROWS){if(!x.rk||x.rk.t!==UID||x.id===UID||!x.rk.w||(x.rk.ts||0)<=(L.seen||0))continue;L.seen=Math.max(L.seen||0,x.rk.ts);L.rev=L.rev||{};L.rev[x.id]=x.rk.ts;ch=true;
   if(Date.now()-RK_SAID>10000){RK_SAID=Date.now();toast(TX(`⚔ ${x.name} הביס את הצבאות שלך ועקף אותך בטבלה! יש לך זכות לנקמה.`,`⚔ ${x.name} defeated your armies and passed you on the board! You have the right of revenge.`))}}
  if(ch){LSset('bushido-rk',L);try{if(!$('#scr-hub').hidden)renderHub()}catch(e){}}}catch(e){}return r}}
/* the war banner in the hub */
{const o=renderHub;renderHub=function(){const r=o.apply(this,arguments);try{let el=$('#rkCard');if(el)el.remove();const B=rkBoard();if(!B||!S)return r;const L=rkLast(),rev=Object.keys(L.rev||{}).map(id=>B.rows.find(x=>x.id===id)).filter(Boolean);
  if(!B.above&&!rev.length)return r;const host=document.querySelector('#scr-hub .stack')||$('#scr-hub');if(!host)return r;
  el=document.createElement('div');el.id='rkCard';el.className='card stack';el.style.cssText='gap:8px;border-color:#a8392a;background:linear-gradient(180deg,rgba(120,20,10,.35),rgba(0,0,0,.2))';
  const cd=Math.max(0,RK_CD-(Date.now()-Math.max(L.cd||0,S.rkCd||0))),tr=B.above&&rkTruce(B.above.id);
  el.innerHTML=`<div class="eyebrow">国盗り合戦 · ${TX('המלחמה על הטבלה','The war for the board')}</div>`+(B.above?`<p style="margin:0">${TX(`אתה במקום <b>#${B.i+1}</b>. מעליך: <b>${esc(B.above.name)}</b> עם ${fmtN(B.above.hp)} נקודות.`,`You are <b>#${B.i+1}</b>. Above you: <b>${esc(B.above.name)}</b> with ${fmtN(B.above.hp)} points.`)}</p>`:'')+`<div class="row rkb" style="gap:8px"></div>`;
  const row=el.querySelector('.rkb');
  for(const x of rev)row.append(mkBtn(TX(`⚔ נקמה ב־${x.name}`,`⚔ Revenge on ${x.name}`),()=>rkChallenge(x,true),0,'gold'));
  if(B.above)row.append(mkBtn(cd?TX(`הצבא מתאושש · ${Math.ceil(cd/60000)} דק׳`,`Army recovering · ${Math.ceil(cd/60000)} min`):tr?TX('בהפוגה של 12 שעות','Under a 12-hour truce'):TX(`⚔ אתגר את ${B.above.name}`,`⚔ Challenge ${B.above.name}`),()=>rkChallenge(B.above,false),!!(cd||tr),rev.length?'ghost':'gold'));
  const first=host.querySelector('.card');if(first&&first.parentNode===host)first.after(el);else host.prepend(el)}catch(e){console.warn('rk card',e)}return r}}
if(false)window.__rk={warEnd:w=>warEnd(w,{}),get WAR(){return WAR},rkBoard,rkChallenge:(t,r)=>rkChallenge(t,r),rkDef,rkFoe,rkSnap,get ROWS(){return LIVE_ROWS},set ROWS(v){LIVE_ROWS=v},get UID(){return UID},set UID(v){UID=v}};
