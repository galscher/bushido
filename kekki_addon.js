/* ================= 血気 Kekki: bloodlust in the duel =================
   Every blow that lands fills the warrior's bloodlust (and pain feeds the one who takes it). A miss, a guard or a rest
   cools it. When the cup is full, the warrior may let it loose: 修羅 Shura, the fighting frenzy of the asura, for three
   exchanges: every cut bites a third deeper, but the frenzied one cannot guard, rest or step back, and takes harder blows.
   The foe's bloodlust rises too, and he will let it loose when he can. */
const KK_TURNS=3,KK_ATK=1.35,KK_TAKE=1.15;
const kkB=f=>f?(f.blood||0):0;
function kkGo(f){if(!f||kkB(f)<100||f.shura>0||fightOver)return false;f.blood=0;f.shura=KK_TURNS;f.kkCol=f.ghostCol;f.ghostCol='#ff2a1a';f.ghostOn=true;
 try{bigKanji={t:'修羅',life:1.4};shake=12;flashScreen=.5;sfx('big');floatText(f.x,GROUND-300,TX('צמא דם!','Bloodlust!'),'#ff3a2a',34);
  logMsg(f.isPlayer?TX('אתה משחרר את צמא הדם: שלוש מכות עמוקות, בלי הגנה ובלי נסיגה.','You let loose your bloodlust: three deep blows, no guard and no retreat.'):TX(`${f.name} משתחרר בצמא דם! המכות שלו יעמיקו, אבל הוא חשוף.`,`${f.name} lets loose his bloodlust! His blows bite deeper, but he is open.`))}catch(e){}return true}
function kkCool(f){if(!f)return;f.shura=0;f.ghostOn=false;if(f.kkCol)f.ghostCol=f.kkCol}
/* the cut itself: the frenzy deepens the wound, and fills or drains the cup */
{const o=resolveHit;resolveHit=function(a,d,k,sure){const h0=d?d.hp:0;const r=o.apply(this,arguments);try{if(!a||!d)return r;const dealt=Math.max(0,h0-d.hp);
  if(dealt>0){let extra=0;if(a.shura>0)extra+=Math.round(dealt*(KK_ATK-1));if(d.shura>0)extra+=Math.round(dealt*(KK_TAKE-1));
   if(extra>0&&d.hp>0){d.hp=Math.max(0,d.hp-extra);floatText(d.x,GROUND-210,`+${extra} 修羅`,'#ff4a3a',24)}
   if(!(a.shura>0))a.blood=Math.min(100,kkB(a)+dealt/Math.max(1,d.maxHp)*120+(k==='power'?6:0));if(!(d.shura>0))d.blood=Math.min(100,kkB(d)+dealt/Math.max(1,d.maxHp)*35)}
  else if(!(a.shura>0))a.blood=Math.max(0,kkB(a)-10)}catch(e){}return r}}
/* in the frenzy there is no guard, no rest and no stepping back */
{const o=doAction;doAction=async function(a,d,k){try{if(a&&a.shura>0&&['block','rest','ret','taunt','dirty'].includes(k)){k=a.sta>=costOf(a,'normal')?'normal':'quick'}
  if(a&&!(a.shura>0)&&(k==='block'||k==='rest'))a.blood=Math.max(0,kkB(a)-(k==='rest'?25:12))}catch(e){}
 const r=await o.call(this,a,d,k);try{if(a&&a.shura>0&&!['adv'].includes(k)){a.shura--;if(a.shura<=0){kkCool(a);floatText(a.x,GROUND-260,TX('הדם מתקרר','The blood cools'),'#cfd8e6',22)}}}catch(e){}return r}}
/* the foe lets it loose as soon as his cup is full and he is close */
{const o=aiChoose;aiChoose=function(e,p){try{if(e&&kkB(e)>=100&&!(e.shura>0)&&dist()<=reachOf(e))kkGo(e);if(e&&e.shura>0){if(dist()>reachOf(e))return'adv';return e.sta>=costOf(e,'power')&&Math.random()<.45?'power':e.sta>=costOf(e,'normal')?'normal':'quick'}}catch(er){}return o.apply(this,arguments)}}
/* the autopilot lets it loose too */
{const o=playerAct;playerAct=async function(k){try{if(S&&S.autoFight&&P&&kkB(P)>=100&&!(P.shura>0)&&!busy&&dist()<=reachOf(P)){kkGo(P);kkPad()}}catch(e){}return o.apply(this,arguments)}}
/* the button under the bushido strike, and the cup's level */
function kkPad(){try{const pad=$('#pad');if(!pad)return;let b=$('#kkBtn');if(!b){b=document.createElement('button');b.id='kkBtn';b.className='kkb';b.type='button';
   b.innerHTML=`<span class="kanji">血気</span><b>${TX('צמא דם','Bloodlust')}</b><small id="kkiS"></small><i id="kkiBar"></i>`;
   b.onclick=()=>{if(busy||fightOver||!P)return;if(kkGo(P)){kkPad();try{refreshPad()}catch(e){}}};const sp=pad.querySelector('.act.sp');if(sp)sp.after(b);else pad.append(b)}
  if(!P){b.hidden=true;return}b.hidden=false;const v=Math.floor(kkB(P)),on=P.shura>0;
  $('#kkiBar').style.width=(on?P.shura/KK_TURNS*100:v)+'%';b.classList.toggle('full',v>=100&&!on);b.classList.toggle('on',on);
  b.disabled=!(v>=100&&!on&&!busy&&!fightOver);
  $('#kkiS').textContent=on?TX(`修羅 · עוד ${P.shura} מכות · +35% נזק · בלי הגנה`,`修羅 · ${P.shura} more blows · +35% damage · no guard`):v>=100?TX('מלא! שחרר: +35% נזק ל־3 מכות, בלי הגנה','Full! Let loose: +35% damage for 3 blows, no guard'):TX(`${v}/100 · מתמלא מפגיעות, מתקרר בהחטאה, הגנה ומנוחה`,`${v}/100 · fills with hits, cools with misses, guard and rest`);
  if(E&&E.shura>0)$('#kkiS').textContent+=TX(` · ${E.name} בטירוף!`,` · ${E.name} is in a frenzy!`)}catch(e){}}
{const o=refreshPad;refreshPad=function(){const r=o.apply(this,arguments);try{kkPad();if(P&&P.shura>0)document.querySelectorAll('#pad .act').forEach(b=>{if(['block','rest','ret','taunt'].includes(b.dataset.a))b.disabled=true})}catch(e){}return r}}
document.head.insertAdjacentHTML('beforeend',`<style>
#pad .kkb{grid-column:1/-1;position:relative;overflow:hidden;display:flex;align-items:center;gap:10px;min-height:42px;padding:4px 12px;border-radius:12px;border:1px solid #5a1a14;background:linear-gradient(90deg,#2a0c0a,#3e1210,#2a0c0a);color:var(--paper);font:13px var(--body);cursor:pointer}
#pad .kkb .kanji{font-size:20px;color:#ff5a3a;white-space:nowrap;z-index:1}#pad .kkb b{font:500 14px var(--body);white-space:nowrap;z-index:1}#pad .kkb small{font-size:11px;color:#e8c0b0;text-align:start;z-index:1;overflow:hidden;text-overflow:ellipsis}
#pad .kkb i{position:absolute;inset:auto auto 0 0;height:4px;background:linear-gradient(90deg,#7a0a08,#ff3a2a);transition:width .3s}
[dir=rtl] #pad .kkb i{inset:auto 0 0 auto}
#pad .kkb.full{border-color:#ff3a2a;box-shadow:0 0 12px rgba(255,40,20,.6);animation:kkpulse .6s infinite alternate}
#pad .kkb.on{border-color:#ff3a2a;background:linear-gradient(90deg,#5a0806,#8a120c,#5a0806)}
#pad .kkb:disabled{opacity:1;cursor:default}#pad .kkb:disabled:not(.on) b{opacity:.75}
@keyframes kkpulse{from{filter:brightness(1)}to{filter:brightness(1.45)}}
</style>`);
if(false)window.__kk={kkGo:f=>kkGo(f),get P(){return P},get E(){return E}};KKX={go:kkGo,b:kkB,cool:kkCool,T:KK_TURNS};
