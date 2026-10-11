/* ================= 兵糧 Hyōrō: an army marches on its stomach, and the treasury is never only a number =================
   1. Army provisions. Rice alone was the ration of the poor and the cause of kakke (beriberi), the weakness that
      crippled armies fed on white rice. Every real Sengoku ration comes from a land you must hold or trade with:
      Hatchō miso of Mikawa and Date's miso of Sendai, Kishū umeboshi, Tosa katsuobushi, the Takeda imogara rope,
      the hyōrōgan pills of Iga, Shinano soba, Ezo kombu, Ryūkyū black sugar, Echigo sake and, after 1605,
      the Satsuma sweet potato. Each one costs gold every day for every soldier fed, and each one gives something.
   2. The realm takes its share. Hideyoshi and Ieyasu kept the great lords poor with tenka-bushin: forced
      contributions to castles, temples and river works. A full treasury is noticed.
   3. Victory has a price: rice for the families of the fallen, war weariness, the polisher's fee for a blade. */
const HYO=[
 {k:'kome',kj:'糒',n:TX('הושי־אי, אורז מיובש','Hoshi-ii, dried rice'),src:null,p:.08,d:TX('הבסיס. לבד הוא גורם לקאקה, חולשת האורז הלבן','The base. On its own it brings kakke, the white-rice weakness')},
 {k:'miso',kj:'味噌',n:TX('מיסו האצ׳ו ומיסו של סנדאי','Hatchō miso and Sendai miso'),src:['mikawa','rikuzen','sendai'],p:.22,d:TX('+6 אנרגיה בדו־קרב, +מורל','+6 stamina in duels, +morale'),fx:{sta:6,mor:.5}},
 {k:'ume',kj:'梅干',n:TX('אומבושי של קישו','Kishū umeboshi'),src:['kii'],p:.18,d:TX('נגד צמא ומחלות: פצועים מחלימים מהר יותר','Against thirst and sickness: the wounded heal faster'),fx:{heal:.06}},
 {k:'katsuo',kj:'鰹節',n:TX('קאטסואובושי של טוסה','Tosa katsuobushi'),src:['tosa'],p:.28,d:TX('+4% לכוח הצבא','+4% army strength'),fx:{army:.04}},
 {k:'imogara',kj:'芋茎縄',n:TX('חבל אימוגארה של טאקדה','Takeda’s imogara rope'),src:['kai','shinano'],p:.14,d:TX('גבעולי טארו מבושלים במיסו וקלועים לחבל: −15% אבדות במלחמה','Taro stems boiled in miso and braided into rope: −15% war losses'),fx:{loss:.15}},
 {k:'gan',kj:'兵糧丸',n:TX('היורוגאן, כדורי הנינג׳ה של איגה','Hyōrōgan, the ration pills of Iga'),src:['iga'],p:.3,d:TX('+12 קי בתחילת כל דו־קרב','+12 ki at the start of every duel'),fx:{ki:12}},
 {k:'soba',kj:'蕎麦',n:TX('סובה של שינאנו','Shinano soba'),src:['shinano','hida'],p:.08,d:TX('+2% לכוח הצבא, זול','+2% army strength, cheap'),fx:{army:.02}},
 {k:'konbu',kj:'昆布',n:TX('קומבו מאזו','Ezo kombu'),src:['matsumae','oshima','shiribeshi'],p:.2,d:TX('+4% חיים בדו־קרב','+4% health in duels'),fx:{hp:.04}},
 {k:'kokuto',kj:'黒糖',n:TX('סוכר שחור מריוקיו','Ryūkyū black sugar'),src:['amami','chuzan','hokuzan','nanzan'],p:.32,d:TX('+8 אנרגיה בדו־קרב','+8 stamina in duels'),fx:{sta:8}},
 {k:'sake',kj:'酒',n:TX('סאקה של אצ׳יגו','Echigo sake'),src:['echigo','sado'],p:.22,d:TX('+מורל כל יום','+morale every day'),fx:{mor:1}},
 {k:'imo',kj:'甘藷',n:TX('בטטה של סאצומה (מ־1605)','Satsuma sweet potato (from 1605)'),src:['satsuma','osumi'],yr:1605,p:.07,d:TX('מזון רעב: +מורל, +2% לצבא','Famine food: +morale, +2% army'),fx:{mor:.5,army:.02}}];
const KR=()=>{if(!S)return{on:{},fed:[],ricedays:0,ww:0,lv:0};S.kura=S.kura||{on:{},fed:[],ricedays:0,ww:0,lv:0};return S.kura};
function hyoAvail(h){try{if(h.yr&&tYear()<h.yr)return false;if(!h.src)return((S.mat&&S.mat.rice)||0)>0||S.clan.cities.length>0;return h.src.some(id=>S.clan.cities.includes(id)||(S.routes&&S.routes[id]))}catch(e){return false}}
const hyoMen=()=>Math.max(0,Math.round((S.est&&S.est.soldiers)||0));
const hyoCost=h=>Math.round(5+h.p*hyoMen());
const hyoFed=k=>{try{return KR().fed.includes(k)}catch(e){return false}};
function hyoFx(key){let v=0;try{for(const h of HYO)if(h.fx&&h.fx[key]&&hyoFed(h.k))v+=h.fx[key]}catch(e){}return v}
const hyoKakke=()=>{try{const K=KR();return K.ricedays>=8&&K.fed.length<=1}catch(e){return false}};
/* the day: buy what can be bought, feed the army, take stock */
{const o=dayTick;dayTick=function(notes){o(notes);try{if(!S||!S.est)return;const K=KR(),fed=[],miss=[];let paid=0;
  for(const h of HYO){if(K.on[h.k]===false||!hyoAvail(h))continue;const c=hyoCost(h);if((S.gold||0)>=c){S.gold-=c;paid+=c;fed.push(h.k)}else miss.push(h.n)}
  K.fed=fed;K.ricedays=fed.length<=1?(K.ricedays||0)+1:0;
  if(paid)notes.push(TX(`🍙 הצבא אכל ${fed.length} סוגי מזון · ${fmtN(paid)} זהב`,`🍙 The army ate ${fed.length} kinds of food · ${fmtN(paid)} gold`));
  if(miss.length)notes.push(TX(`⚠ לא היה זהב ל: ${miss.join(', ')}`,`⚠ No gold for: ${miss.join(', ')}`));
  const mor=hyoFx('mor');if(mor)S.est.mor=clamp(S.est.mor+mor,0,100);
  const hl=hyoFx('heal');if(hl&&S.est.wounded){const h=Math.ceil(S.est.wounded*hl);S.est.wounded-=h;S.est.soldiers+=h}
  if(hyoKakke()){S.est.mor=clamp(S.est.mor-1,0,100);if(K.ricedays===8||K.ricedays%10===0)notes.push(TX('脚気 קאקה: הצבא אוכל רק אורז ונחלש. מזון מעוד ארצות יחזיר לו כוח.','脚気 Kakke: the army eats only rice and grows weak. Food from other lands will bring its strength back.'))}
  /* war weariness fades with peace; when it is deep, men slip away */
  K.ww=Math.max(0,(K.ww||0)-.2);if(K.ww>=6&&S.est.soldiers>20){const d=Math.ceil(S.est.soldiers*.01);S.est.soldiers-=d;notes.push(TX(`厭戦 עייפות מלחמה: ${d} חיילים ערקו הביתה.`,`厭戦 War weariness: ${d} soldiers slipped away home.`))}
  /* tenka-bushin: the realm asks for its share of a full treasury */
  const T=30000+(S.level||1)*1500,day=S.clan.day||0;if(day-(K.lv||0)>=12&&(S.gold||0)>T&&!K.pend){K.lv=day;const amt=Math.round(((S.gold||0)-T)*.25*Math.pow(1.5,K.ref||0)*(1-.05*(typeof fyCourt==='function'?fyCourt():0)));
   if(S.auto){S.gold-=amt;S.meiyo=(S.meiyo||0)+2;notes.push(TX(`普請 תרמת ${fmtN(amt)} זהב לעבודות הממלכה (+2 כבוד)`,`普請 You gave ${fmtN(amt)} gold to the works of the realm (+2 honor)`))}else K.pend={amt}}}catch(e){console.warn('kura',e)}}}
async function kuraLevy(){const K=KR();if(!K.pend||!S)return;const amt=Math.min(K.pend.amt,Math.floor(S.gold||0));K.pend=null;if(amt<=0)return;
 const sh=S.clan&&S.clan.shogun;
 const k=await choice(`<div class="eyebrow">天下普請 · ${TX('עבודות הממלכה','The works of the realm')}</div><div class="kanji" style="font-size:52px;color:var(--gold)">普請</div><h2>${sh?TX('הממלכה שלך צריכה את האוצר שלך','Your realm needs your treasury'):TX('השליט דורש את חלקו','The ruler demands his share')}</h2>
  <p>${sh?TX(`כשוגון, אתה מצפה מהאדונים לבנות. עכשיו הם מצפים ממך: חומות לטירה, סכרים על הנהר, ומקדש לבודהה הגדול. ${fmtN(amt)} זהב.`,`As shogun you expect the lords to build. Now they expect it of you: castle walls, dikes on the river, a hall for the Great Buddha. ${fmtN(amt)} gold.`):TX(`האוצר שלך מלא, וכולם יודעים. השליט מצווה על כל אדון לתרום לבניית טירות, מקדשים ותעלות: ${fmtN(amt)} זהב. ככה שמרו הידיושי ואייאסו על האדונים עניים מכדי למרוד.`,`Your treasury is full, and everyone knows it. The ruler orders every lord to give to castles, temples and canals: ${fmtN(amt)} gold. This is how Hideyoshi and Ieyasu kept the lords too poor to rebel.`)}</p>`,
  [{key:'pay',label:TX(`לתרום ${fmtN(amt)} זהב`,`Give ${fmtN(amt)} gold`),cls:'gold',sub:TX('+3 כבוד, +מורל','+3 honor, +morale')},{key:'no',label:TX('לסרב','Refuse'),cls:'ghost',sub:TX('−6 כבוד, היריבים מתחזקים, והדרישה הבאה תגדל','−6 honor, rivals grow stronger, and the next demand grows')}]);
 if(k==='pay'){S.gold-=amt;S.meiyo=(S.meiyo||0)+3;S.est.mor=clamp(S.est.mor+3,0,100);K.ref=0;sfx('gong')}
 else{S.meiyo=(S.meiyo||0)-6;K.ref=(K.ref||0)+1;try{const r=RK();r.foeBoost=(r.foeBoost||0)+1}catch(e){}}
 save();try{updatePills();renderHub()}catch(e){}}
{const o=renderHub;renderHub=function(){const r=o.apply(this,arguments);try{const K=KR();if(K.pend&&$('#overlay').hidden&&!busy)setTimeout(()=>{if($('#overlay').hidden&&!$('#scr-hub').hidden)kuraLevy()},600)}catch(e){}return r}}
/* the provisions in war and in the duel */
{const o=generalMul;generalMul=function(){let m=o();try{if(S){m*=1+hyoFx('army');if(hyoKakke())m*=.88}}catch(e){}return m}}
{const o=foeScale;foeScale=function(ctx){o(ctx);try{if(!S||!P)return;const st=hyoFx('sta')-(hyoKakke()?8:0),hp=hyoFx('hp'),ki=hyoFx('ki');
  if(st){P.maxSta=Math.max(30,P.maxSta+st);P.sta=Math.min(P.maxSta,Math.max(P.sta,P.maxSta))}if(hp){P.maxHp=Math.round(P.maxHp*(1+hp));P.hp=P.hpLag=P.maxHp}if(ki)P.ki=Math.min(100,(P.ki||0)+ki)}catch(e){}}}
/* victory has a price */
{const o=warEnd;warEnd=async function(win,x){let s0=0;try{s0=(S&&S.est&&S.est.soldiers)||0}catch(e){}const r=await o.apply(this,arguments);
 try{if(S&&S.est){const lost=Math.max(0,s0-S.est.soldiers),K=KR();if(lost>0){const back=Math.round(lost*hyoFx('loss'));if(back){S.est.soldiers+=back}
   const pay=Math.min(Math.floor(S.gold||0),Math.round((lost-back)*4));S.gold-=pay;K.ww=(K.ww||0)+1;S.est.mor=clamp(S.est.mor-Math.min(6,Math.round(K.ww)),0,100);
   toast(TX(`⚖ מחיר הניצחון: ${fmtN(lost-back)} נפלו · ${fmtN(pay)} זהב אורז למשפחות${back?` · האימוגארה הצילה ${back}`:''}${K.ww>=4?' · הצבא עייף ממלחמה':''}`,`⚖ The price of victory: ${fmtN(lost-back)} fell · ${fmtN(pay)} gold in rice for the families${back?` · imogara saved ${back}`:''}${K.ww>=4?' · the army is weary of war':''}`));save()}}}catch(e){}return r}}
{const o=endFight;endFight=async function(win){try{if(win&&S&&FF&&E&&!FF.surrender&&!FF.war&&FF.notes&&!XV){const fee=Math.min(Math.floor(S.gold||0),Math.round(15+(E.level||1)*3*(1+(S.streak||0)*.05)));if(fee>0){S.gold-=fee;FF.notes.push(TX(`研ぎ מלטש החרבות לקח ${fee} זהב לתקן את הלהב אחרי הקרב`,`研ぎ The sword polisher took ${fee} gold to restore the blade after the fight`))}}}catch(e){}return o.apply(this,arguments)}}
/* the provisions card, in the clan and army screen */
{const o=renderClan;renderClan=function(){const r=o.apply(this,arguments);try{const host=$('#clArmy');const card=host&&host.closest('.card');if(!card)return r;let el=$('#hyoCard');if(el)el.remove();
  el=document.createElement('div');el.id='hyoCard';el.className='card stack';el.style.gap='8px';const K=KR();let tot=0;
  const rows=HYO.map(h=>{const av=hyoAvail(h),on=K.on[h.k]!==false,c=hyoCost(h);if(av&&on)tot+=c;const src=h.src?h.src.map(id=>{const c=CITIES.find(x=>x.id===id);return c?c.n:id}).join(' / '):TX('המחסנים','the storehouses');
   return `<div class="row" style="align-items:center;gap:8px;flex-wrap:nowrap;opacity:${av?1:.5}"><span class="kanji" style="font-size:22px;flex:0 0 46px;color:${av?'var(--gold)':'#777'}">${h.kj}</span><div style="flex:1;min-width:0"><b>${h.n}</b>${hyoFed(h.k)?' <span class="tag done">'+TX('נאכל היום','fed today')+'</span>':''}<div class="muted" style="font-size:12px">${h.d} · ${av?`${fmtN(c)} ${TX('זהב ליום','gold a day')}`:TX(`דורש: ${src}`,`Needs: ${src}`)}</div></div>${av?`<button class="chip" data-hk="${h.k}" aria-pressed="${on}" style="flex:none">${on?TX('מוגש','Served'):TX('כבוי','Off')}</button>`:''}</div>`}).join('');
  el.innerHTML=`<div class="eyebrow">兵糧 · ${TX('מזון הצבא','Army provisions')}</div><p class="muted" style="font-size:13px;margin:0">${TX('כל מזון מגיע מארץ אחרת: כבוש אותה או פתח אליה נתיב סחר. כל סוג עולה זהב כל יום לפי מספר החיילים. צבא שאוכל רק אורז חוטף קאקה ונחלש.','Every food comes from another land: conquer it or open a trade route to it. Each kind costs gold every day for every soldier. An army that eats only rice gets kakke and grows weak.')}</p>
   <div class="status-line">${TX(`הוצאה יומית: ${fmtN(tot)} זהב · ${K.fed.length} סוגים נאכלו היום`,`Daily cost: ${fmtN(tot)} gold · ${K.fed.length} kinds eaten today`)}${hyoKakke()?' · <b style="color:#ff8a6a">脚気 '+TX('קאקה!','Kakke!')+'</b>':''}${(K.ww||0)>=2?` · 厭戦 ${TX('עייפות מלחמה','war weariness')} ${Math.round(K.ww)}`:''}</div>${rows}`;
  el.querySelectorAll('[data-hk]').forEach(b=>b.onclick=()=>{const k=b.dataset.hk;K.on[k]=K.on[k]===false;sfx('step');save();renderClan()});
  card.after(el)}catch(e){console.warn('hyo card',e)}return r}}
if(false)window.__kura={HYO,KR,hyoAvail,hyoFx,hyoKakke,kuraLevy:()=>kuraLevy(),dayTick:n=>dayTick(n)};
