/* ================= 解体 the armory clears itself =================
   When the armory is full (12 pieces), new forging is no longer blocked: pieces weaker than what you wear in the
   same slot are taken apart automatically, the lowest first, and you get the usual quarter of their forging cost back.
   Equipped pieces are never touched, legendary pieces only when nothing else is left, and the player can turn it off. */
const GA_CAP=12;
function gaOn(){try{return!!(S&&S.cf&&S.cf.autoScrap!==false)}catch(e){return false}}
function gaScrap(cf,need){const out=[];try{if(!cf||!cf.inv||need<=0)return out;
 const eqLv={};for(const sl of['w','a','h']){const id=cf.eq[sl];const it=id?cf.inv.find(x=>x.id===id):null;eqLv[sl]=it?it.lv:0}
 const eqIds=new Set(Object.values(cf.eq).filter(Boolean));
 const cand=cf.inv.filter(it=>!eqIds.has(it.id)&&it.lv<(eqLv[it.s]||0)).sort((a,b)=>{const la=(a.pros||[]).includes('legend')?1:0,lb=(b.pros||[]).includes('legend')?1:0;return la-lb||a.lv-b.lv});
 for(const it of cand){if(out.length>=need)break;let back=0;try{back=Math.round(c43cost(it.s,it.lv,false).gold*.25)}catch(e){back=0}cf.inv=cf.inv.filter(x=>x!==it);S.gold=(S.gold||0)+back;out.push({it,back})}
 if(out.length){const gold=out.reduce((a,x)=>a+x.back,0),names=out.map(x=>`${x.it.name} (${TX('רמה','lv')} ${x.it.lv})`).join(', ');
  const t=TX(`🔨 הנשקייה הייתה מלאה: פורקו אוטומטית ${names} · +${fmtN(gold)} זהב`,`🔨 The armory was full: auto-scrapped ${names} · +${fmtN(gold)} gold`);
  try{cf.log.unshift(t);cf.log.length=Math.min(cf.log.length,10)}catch(e){}try{if(autoOn())feed(t);else toast(t)}catch(e){}try{updatePills()}catch(e){}}}catch(e){}return out}
function gaMakeRoom(cf){try{if(!cf||!gaOn())return;const over=cf.inv.length-(GA_CAP-1);if(over>0)gaScrap(cf,over)}catch(e){}}
/* every new piece passes through c43make: forging, the autopilot's forge, promotion forging */
{const o=c43make;c43make=function(slot,kind,lv,master,s0){try{const s=s0||S;if(s&&s===S&&s.cf&&s.cf.inv)gaMakeRoom(s.cf)}catch(e){}return o.apply(this,arguments)}}
/* the forge button checks the cap before making anything, so make room first */
{const o=c43craft;c43craft=async function(){try{if(S&&S.cf)gaMakeRoom(S.cf)}catch(e){}return o.apply(this,arguments)}}
/* a switch in the armory */
{const o=renderCraft;renderCraft=function(){const r=o.apply(this,arguments);try{const el=$('#c43Body');if(!el||!S||!S.cf)return r;const on=gaOn(),n=S.cf.inv.length;
 const d=document.createElement('div');d.className='card';d.id='gaCard';d.style.cssText='display:flex;align-items:center;gap:10px;padding:8px 12px;margin:6px 0';
 d.innerHTML=`<span class="kanji" style="font-size:22px">解</span><div style="flex:1;font-size:13px"><b>${TX('פירוק אוטומטי','Auto-scrap')}: ${on?TX('פעיל','on'):TX('כבוי','off')}</b> · ${TX(`${n}/${GA_CAP} בנשקייה`,`${n}/${GA_CAP} in the armory`)}<div class="muted" style="font-size:12px">${TX('כשהנשקייה מלאה, ציוד חלש ממה שאתה לובש באותו מקום מתפרק לבד (25% מהעלות חוזרים). הציוד שעליך לא נוגעים בו.','When the armory is full, gear weaker than what you wear in the same slot is taken apart by itself (25% of the cost back). What you wear is never touched.')}</div></div>`;
 d.append(mkBtn(on?TX('לכבות','Turn off'):TX('להפעיל','Turn on'),()=>{S.cf.autoScrap=!on;save();sfx('step');renderCraft()},false,'ghost'));
 const old=document.getElementById('gaCard');if(old)old.remove();const first=el.querySelector('.card');first?first.after(d):el.prepend(d)}catch(e){}return r}}
if(false)window.__ga={gaScrap,gaMakeRoom,c43make:(...a)=>c43make(...a),c43craft:()=>c43craft(),renderCraft:()=>renderCraft()};
