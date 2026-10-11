/* endless cycles: full strength growth for the first five, then slower but never-ending */
const NGF=n=>{n=Math.max(0,+n||0);return n<=5?n:5+Math.log2(1+(n-5))*1.5};
/* ---------- saga state, gates and flow ---------- */
const SG=()=>{if(!S.saga)S.saga={c:0,st:0,f:{},v:{g:0,n:0,y:0},ng:0,ends:[],pick:{},end:null,ann:-1};const G=S.saga;G.f=G.f||{};G.v=G.v||{g:0,n:0,y:0};G.ends=G.ends||[];G.pick=G.pick||{};return G};
const sgF=j=>{const G=SG();return{...G.f,v:G.v,ng:G.ng,hero:(HEROES[S.hero]||{}).id,p:G.pick[j==null?G.c:j]}};
const sgGold=()=>Math.round((250+(S.level||1)*25)*(1+.25*NGF(SG().ng)));
function sgNeed(i){const c=SGC[i],o=[];if(!c)return o;const y=tYear();if(y<c.y)o.push({k:'y',a:y,b:c.y});if((S.level||1)<c.lv)o.push({k:'lv',a:S.level,b:c.lv});if(c.prov&&S.clan.cities.length<c.prov)o.push({k:'prov',a:S.clan.cities.length,b:c.prov});return o}
function sgNeedTxt(n){return n.map(x=>x.k==='y'?TX(`השנה ${x.b} (עכשיו ${x.a}). כל קרב, ניצחון או הפסד, מקדם את הזמן.`,`The year ${x.b} (now ${x.a}). Every fight, won or lost, moves time forward.`):x.k==='lv'?TX(`דרגה ${x.b} (עכשיו ${x.a}).`,`Level ${x.b} (now ${x.a}).`):TX(`${x.b} מחוזות (יש לך ${x.a}). כובשים מחוזות במפה.`,`${x.b} provinces (you hold ${x.a}). Conquer provinces on the map.`))}
const sgP=t=>`<p data-lt="1" style="white-space:pre-line;line-height:1.75;margin-top:10px">${esc(t)}</p>`;
function sgHeader(i){const c=SGC[i],a=SGACT[c.act],G=SG();return `<div class="eyebrow">📜 物語 · ${TX('מערכה','Act')} <span class="kanji">${a[0]}</span> ${TX(a[1],a[2])} · ${TX('פרק','Chapter')} ${i+1}/${SGC.length} · ${c.y}${G.ng?` · 周回 ${G.ng+1}`:''}</div><div class="kanji" style="font-size:46px;line-height:1;color:var(--gold);text-align:center;margin:4px 0 0">${c.k}</div><h2 style="text-align:center;margin-bottom:6px">${sgT(c.h)}</h2>`}
function sgApply(o){const G=SG();if(o.fx)for(const k in o.fx)G.v[k]=(G.v[k]||0)+o.fx[k];for(const f of(o.set||[]))G.f[f]=1;
 if(o.gold>0){const g=Math.round(sgGold()*o.gold);S.gold+=g;toast(`+${fmtN(g)} ${TX('זהב','gold')}`)}
 else if(o.gold<0){const g=Math.min(Math.max(0,S.gold),Math.round(sgGold()*.8));S.gold-=g;toast(`−${fmtN(g)} ${TX('זהב','gold')}`)}
 try{updatePills()}catch(e){}}
function sgFoeId(i,F){const c=SGC[i];if(c.pre){const o=c.pre.o.find(x=>x.k===F.p);if(o&&o.foe)return typeof o.foe==='function'?o.foe(F):o.foe}return c.foe?c.foe(F):'foxman'}
const sgBusy=()=>{try{return(typeof autoDecide==='function'&&autoDecide())||!$('#overlay').hidden||$('#scr-hub').hidden||!!document.querySelector('.x50ov,.v40ov,#march,#intro')}catch(e){return true}};
let SGBUSY=false;
const sgLock=()=>SGBUSY&&!$('#overlay').hidden;
function sgFight(i){const c=SGC[i],F=sgF(),id=sgFoeId(i,F);const fd=sgFoe(id,i>=15?3:i>=8?2:1);const pl=typeof c.place==='function'?c.place(F):c.place;
 setTimeout(()=>{try{startFight({kind:'plot',plot:'saga',sg:i,fd,place:sgT(pl),banner:`${TX('פרק','Chapter')} ${i+1} · ${c.k}`})}catch(e){console.warn('saga fight',e)}},250)}
async function sgPlay(){if(sgLock()||!S)return;const G=SG();if(G.c>=SGC.length){sgCredits();return}
 const i=G.c,c=SGC[i],need=sgNeed(i);
 if(need.length){await modal(sgHeader(i)+`<p class="muted" style="text-align:center">${TX('הפרק הזה עוד לא נפתח. הוא ייפתח כש:','This chapter isn’t open yet. It opens when you reach:')}</p><div class="stack" style="gap:6px;margin-top:8px">${sgNeedTxt(need).map(t=>`<div class="card" style="padding:8px 12px">🔒 ${t}</div>`).join('')}</div>`,[{key:'x',label:TX('הבנתי','Got it'),cls:'gold'}]);return}
 if(G.st===2){sgPost();return}
 SGBUSY=true;try{const F=sgF();
  if(G.st===0){const sp=typeof c.sp==='function'?c.sp(F):c.sp;
   const echo=G.ng&&c.echo?`<p data-lt="1" style="font-style:italic;color:#9fe8b0;margin-top:10px;line-height:1.6">✦ ${esc(sgT(c.echo))}</p>`:'';
   sfx('gong');await modal(sgHeader(i)+sgHead(sp)+sgP(sgT(c.sc(F)))+echo,[{key:'x',label:c.pre?TX('המשך','Continue'):TX('⚔ לדו־קרב','⚔ To the duel'),cls:'gold'}]);
   if(c.pre){const opts=c.pre.o.filter(o=>(!o.need||o.need(F))&&(!o.ng||G.ng)),hid=c.pre.o.length-opts.length;
    const k=await choice(sgHeader(i)+`<p style="text-align:center;font-size:17px;margin:6px 0 4px">${sgT(c.pre.q)}</p>${hid?`<p class="muted" style="text-align:center;font-size:12.5px">${TX('יש דרך נוספת, אבל משהו שלא עשית קודם סוגר אותה.','There is another way, but something you didn’t do earlier keeps it closed.')}</p>`:''}`,opts.map(o=>({key:o.k,label:sgT(o.l),sub:o.s?sgT(o.s):''})));
    const o=opts.find(x=>x.k===k)||opts[0];G.pick[i]=o.k;sgApply(o)}
   G.st=1;save()}
  if(G.st===1){const F2=sgF(),f=SGF[sgFoeId(i,F2)];
   SGBUSY=false;sgFight(i);return}
 }catch(e){console.warn('saga',e)}SGBUSY=false;try{renderStoryCard()}catch(e){}}
async function sgPost(){if(sgLock()||!S)return;const G=SG(),i=G.c,c=SGC[i];if(G.st!==2||!c)return;SGBUSY=true;try{
 let F=sgF();const go=TX('המשך','Continue');
 if(c.post)await modal(sgHeader(i)+sgP(sgT(c.post(F))),[{key:'x',label:go,cls:'gold'}]);
 const AF=c.after||[];
 for(let a=0;a<AF.length;a++){if(G.pick[i+'_'+a]!=null)continue;const A=AF[a];F=sgF();
  const list=(typeof A.o==='function'?A.o(F):A.o).filter(o=>(!o.need||o.need(F))&&(!o.ng||G.ng));
  const q=A.q?sgP(sgT(A.q(F))):`<p style="text-align:center;font-size:17px;margin:6px 0 4px">${TX('מה תעשה?','What will you do?')}</p>`;
  const k=await choice(sgHeader(i)+q,list.map(o=>({key:o.k,label:sgT(o.l),sub:o.s?sgT(o.s):''})));
  const o=list.find(x=>x.k===k)||list[0];G.pick[i+'_'+a]=o.k;sgApply(o);save();
  if(o.out)await modal(sgHeader(i)+sgP(sgT(o.out)),[{key:'x',label:go,cls:'gold'}])}
 const g=sgGold(),xp=Math.round((120+(S.level||1)*30)*(1+.25*NGF(G.ng)));S.gold+=g;const lv=gainXp(xp);S.meiyo=(S.meiyo||0)+2;
 G.c=i+1;G.st=0;save();try{updatePills()}catch(e){}
 const nx=SGC[G.c];sfx('gong');
 await modal(`<div class="eyebrow">📜 物語 · ${TX('פרק הושלם','Chapter complete')}</div><div class="kanji" style="font-size:54px;line-height:1;color:var(--gold);text-align:center">${c.k}</div><h2 style="text-align:center">${sgT(c.h)}</h2><p class="muted" style="text-align:center">+${fmtN(g)} ${TX('זהב','gold')} · +${fmtN(xp)} XP · +2 ${TX('כבוד','honor')}${lv?` · ${TX('דרגה','Level')} ${S.level}!`:''}</p>${nx?`<p style="text-align:center;margin-top:8px">${TX('הפרק הבא','Next chapter')}: <span class="kanji">${nx.k}</span> ${sgT(nx.h)} · ${nx.y}</p>`:''}`,[{key:'x',label:G.c>=SGC.length?TX('אל הסוף','To the ending'):go,cls:'gold'}]);
 if(G.c>=SGC.length){SGBUSY=false;await sgEnding();return}
}catch(e){console.warn('saga post',e)}SGBUSY=false;try{renderStoryCard()}catch(e){}}
async function sgEnding(){if(sgLock())return;SGBUSY=true;try{const G=SG(),F=sgF(SGC.length-1);let key=G.end;
 if(!key){const av=SGEND.filter(e=>e.ok(F)),lock=SGEND.length-av.length;
  const k=await choice(sgHead('tamamo')+`<h2 style="text-align:center">${TX('הרגע האחרון','The last moment')}</h2>${sgP(sgT(SGC[SGC.length-1].post(F)))}${lock?`<p class="muted" style="font-size:12.5px;margin-top:6px">${TX(`עוד ${lock} דרכים היו יכולות להיפתח כאן. משהו שעשית, או שלא עשית, לאורך הדרך סגר אותן.`,`${lock} more paths could have opened here. Something you did, or didn’t do, along the way closed them.`)}</p>`:''}`,av.map(e=>({key:e.k,label:`<span class="kanji">${e.kj}</span> ${sgT(e.l)}`})));
  key=k;G.end=k;const first=!G.ends.includes(k);if(first){G.ends.push(k);const g=sgGold()*5;S.gold+=g;S.meiyo=(S.meiyo||0)+10;toast(`+${fmtN(g)} ${TX('זהב','gold')} · +10 ${TX('כבוד','honor')}`)}save()}
 const E=SGEND.find(e=>e.k===key)||SGEND[0];const fates=SGFATE.filter(f=>{try{return f[0](F)}catch(e){return false}}).map(f=>sgT([f[1],f[2]]));
 sfx('gong');
 await modal(`<div class="eyebrow">📜 物語 · ${TX('סוף','Ending')}${E.secret?` · ${TX('סודי','secret')}`:''}</div><div class="kanji" style="font-size:64px;line-height:1;color:var(--gold);text-align:center;margin:6px 0">${E.kj}</div><h2 style="text-align:center">${sgT(E.h)}</h2>${sgP(sgT(E.t))}${fates.length?`<div class="card" style="margin-top:12px;padding:10px 12px;border-color:#a8792a"><b style="color:var(--gold)">${TX('מה עלה בגורלם','What became of them')}</b>${fates.map(x=>`<p data-lt="1" style="margin-top:6px;line-height:1.6;font-size:14px">${esc(x)}</p>`).join('')}</div>`:''}`,[{key:'x',label:TX('המשך','Continue'),cls:'gold'}]);
}catch(e){console.warn('saga end',e)}SGBUSY=false;await sgCredits()}
function sgEndsHtml(){const G=SG();return `<div class="row" style="gap:6px;justify-content:center;flex-wrap:wrap;margin-top:6px">${SGEND.map(e=>G.ends.includes(e.k)?`<span class="pill gold" title="${esc(sgT(e.h))}"><span class="kanji">${e.kj}</span> ${sgT(e.h)}</span>`:`<span class="pill" style="opacity:.55">${e.secret?'✦':'？'} ???</span>`).join('')}</div>`}
function sgPathHtml(){const v=SG().v;return `<div class="row" style="gap:6px;justify-content:center;flex-wrap:wrap;margin-top:6px"><span class="pill"><span class="kanji">義</span> ${TX('חובה','Duty')} ${v.g||0}</span><span class="pill"><span class="kanji">情</span> ${TX('חמלה','Compassion')} ${v.n||0}</span><span class="pill"><span class="kanji">野</span> ${TX('שאפתנות','Ambition')} ${v.y||0}</span></div>`}
async function sgCredits(){if(sgLock())return;SGBUSY=true;let k='x';try{const G=SG();
 k=await choice(`<div class="eyebrow">📜 物語 · ${TX('הסיפור הסתיים','The story is over')}${G.ng?` · 周回 ${G.ng+1}`:''}</div><div class="kanji" style="font-size:44px;line-height:1;color:var(--gold);text-align:center;margin:6px 0">完</div><p data-lt="1" style="text-align:center;line-height:1.7">${TX(`מ־1460 ועד 1615, משריפת קיוטו ועד שאוסקה בערה. הדרך שבחרת:`,`From 1460 to 1615, from the burning of Kyoto to the fall of Osaka. The path you chose:`)}</p>${sgPathHtml()}<p style="text-align:center;margin-top:10px"><b>${TX('הסופים שמצאת','Endings found')}: ${G.ends.length}/${SGEND.length}</b></p>${sgEndsHtml()}<p data-lt="1" class="muted" style="margin-top:12px;line-height:1.65;font-size:13.5px">${TX('ב־New Game+ חוזרים ל־1460 עם הלוחם שלך: הדרגה, הסטטיסטיקות, הנשק והשריון נשמרים. העולם, המחוזות והסיפור מתחילים מחדש. האויבים חזקים יותר, הפרסים גדולים יותר, ויש בחירות שאפשר לראות רק בפעם השנייה. בחירות אחרות יפתחו סופים אחרים. אין סוף לסיבובים: כל סיום פותח סיבוב חדש, קשה יותר ומתגמל יותר.','In New Game+ you return to 1460 with your warrior: level, stats, weapon and armour are kept. The world, the provinces and the story begin again. Foes are stronger, rewards are bigger, and some choices only appear the second time. Different choices open different endings. The cycles never end: every ending opens a new one, harder and more rewarding.')}</p>`,
  [{key:'ng',label:`🔁 New Game+ · 周回 ${G.ng+2}`,cls:'gold'},{key:'x',label:TX('המשך לשחק בעולם הזה','Keep playing in this world'),cls:'ghost'}])}catch(e){console.warn(e)}SGBUSY=false;
 if(k==='ng')await sgNGPlus();else try{renderStoryCard()}catch(e){}}
const SG_KEEP=['hero','name','level','xp','stats','free','forge','armor','ownA','ownW','gear','meiyo','v','wins','bestStreak','diff','origin','beauty','body','form','physTier','kills','story','fightSpd','autoSpeed','yoroi'];
async function sgNGPlus(){const G=SG();if(!G.end)return;
 const k=await choice(`<div class="eyebrow">🔁 New Game+ · 周回 ${G.ng+2}</div><h2>${TX('להתחיל את הסיפור מחדש?','Begin the story again?')}</h2><dl class="kv"><dt>${TX('נשמר','Kept')}</dt><dd>${TX('הלוחם, הדרגה, הסטטיסטיקות, הנשק, השריון, הכבוד, הניצחונות והסופים שמצאת','Your warrior, level, stats, weapon, armour, honor, wins and the endings you found')}</dd><dt>${TX('מתחיל מחדש','Starts over')}</dt><dd>${TX('השנה 1460, המחוזות, האחוזה, הצבא, הסיפור, ו־15% מהזהב עובר איתך','The year 1460, provinces, estate, army, the story; 15% of your gold comes with you')}</dd><dt>${TX('קשה יותר','Harder')}</dt><dd>${TX(`האויבים חזקים פי ${(1+.3*NGF(G.ng+1)).toFixed(1)}`,`Foes are ×${(1+.3*NGF(G.ng+1)).toFixed(1)} stronger`)}</dd></dl>${sgLegacyHtml(G.ends,G.ng+1)}<p class="muted" style="font-size:12.5px;margin-top:8px">${TX('ההישגים, השריונות ושיא הניקוד שלך בטבלה נשמרים. וכל סוף שמצאת משאיר לך שריד של כוח לסיבוב הבא.','Your achievements, armours and best leaderboard score are kept. And every ending you found leaves you a relic of power for the next run.')}</p>`,
  [{key:'go',label:TX('🔁 כן, מתחילים מחדש','🔁 Yes, begin again'),cls:'gold'},{key:'no',label:TX('לא עכשיו','Not now'),cls:'ghost'}]);
 if(k!=='go'){try{renderStoryCard()}catch(e){}return}
 const o=S,D=DIFF[o.diff||0]||DIFF[0];let N;
 try{N=newSave(o.hero);for(const key of SG_KEEP)if(o[key]!==undefined)N[key]=JSON.parse(JSON.stringify(o[key]));
  N.gold=(D.start?D.start.gold:120)+Math.round(Math.min(Math.max(0,o.gold||0),400000)*.15);if(D.start&&N.est)N.est.soldiers=D.start.sold;
  N.saga={c:0,st:0,f:{},v:{g:0,n:0,y:0},ng:(G.ng||0)+1,ends:[...G.ends],pick:{},end:null,ann:-1};N.guide=false;if(N.est)N.est.soldiers=(N.est.soldiers||0)+300*NGF(N.saga.ng)}catch(e){console.warn('ng+',e);toast(TX('משהו השתבש. נסה שוב.','Something went wrong. Try again.'));return}
 S=N;save();try{renderHub();show('hub')}catch(e){}
 sfx('gong');await modal(`<div class="eyebrow">🔁 周回 ${S.saga.ng+1}</div><div class="kanji" style="font-size:54px;line-height:1;color:var(--gold);text-align:center;margin:6px 0">灰</div><h2 style="text-align:center">${TX('האבן נסדקה שוב','The stone has cracked again')}</h2>${sgP(TX('השנה 1460. קיוטו עוד לא בוערת. בהרים של נאסו, האבן ההורגת, שהנזיר גנו ביקע לפני דורות, עדיין מעשנת, ובית קטן עדיין שומר עליה.\n\nאבל החרב שלך שבורה, ובתוכה מאיר אור ירוק קטן. ״זה מוזר,״ אומרת הוטארו. ״אני זוכרת דברים שעוד לא קרו.״','The year 1460. Kyoto is not yet burning. In the mountains of Nasu, the Killing Stone, split by the monk Gennō generations ago, still smoulders, and a small house still guards it.\n\nBut your sword is broken, and inside it glows a small green light. “That’s strange,” says Hotaru. “I remember things that haven’t happened yet.”'))}`,[{key:'x',label:TX('לדרך','Onward'),cls:'gold'}]);
 try{renderHub()}catch(e){}}
/* the journal: every chapter, every choice, the path and the endings */
async function sgJournal(){const G=SG(),L=SGL();
 const rows=SGC.map((c,i)=>{if(i<G.c){const F=sgF(i);const pre=c.pre&&c.pre.o.find(o=>o.k===G.pick[i]);return `<button class="btn ghost wide choice sgj" data-i="${i}" style="text-align:start">✅ ${i+1}. <span class="kanji">${c.k}</span> ${sgT(c.h)}${pre?`<small>${sgT(pre.l)}</small>`:''}</button>`}
  if(i===G.c)return `<button class="btn gold wide choice sgj" data-i="${i}" style="text-align:start">▶ ${i+1}. <span class="kanji">${c.k}</span> ${sgT(c.h)} · ${c.y}</button>`;
  return `<div class="muted" style="padding:6px 12px">🔒 ${i+1}. ${c.y} · ${TX('פרק נעול','Locked chapter')}</div>`}).join('');
 const p=modal(`<div class="eyebrow">📜 物語 · ${TX('יומן הסיפור','Story journal')}${G.ng?` · 周回 ${G.ng+1}`:''}</div><h2>${TX('הדרך שלך','Your path')}</h2>${sgPathHtml()}${sgLegacyHtml(G.ends,G.ng)}<p class="muted" style="font-size:12.5px;text-align:center;margin-top:4px">${TX('כל בחירה משאירה סימן. חלק מהסימנים יחזרו אליך הרבה יותר מאוחר.','Every choice leaves a mark. Some marks come back to you much later.')}</p><p style="text-align:center;margin-top:8px"><b>${TX('סופים','Endings')}: ${G.ends.length}/${SGEND.length}</b></p>${sgEndsHtml()}<div class="stack" style="gap:6px;margin-top:10px">${rows}</div>`,[{key:'x',label:TX('סגור','Close'),cls:'ghost'}]);
 setTimeout(()=>{for(const b of document.querySelectorAll('#ovCard .sgj'))b.onclick=e=>{e.stopPropagation();const i=+b.dataset.i;$('#overlay').hidden=true;(i<G.c?sgReread(i):sgPlay()).then(()=>{if(i<G.c)sgJournal()})}},30);
 return p}
async function sgReread(i){const G=SG(),c=SGC[i],F=sgF(i);let t=sgT(c.sc(F));
 if(c.post)t+='\n\n— — —\n\n'+sgT(c.post(F));
 (c.after||[]).forEach((A,a)=>{const list=typeof A.o==='function'?A.o(F):A.o;const o=list.find(x=>x.k===G.pick[i+'_'+a]);if(o&&o.out)t+='\n\n'+sgT(o.out)});
 const sp=typeof c.sp==='function'?c.sp(F):c.sp;
 await modal(sgHeader(i)+sgHead(sp)+sgP(t),[{key:'x',label:TX('חזרה ליומן','Back to the journal'),cls:'gold'}])}
/* the hub card replaces the old ten-chapter card */
renderStoryCard=function(){const adv=$('#advisor');if(!adv||!S||!$('#scr-hub .stack'))return;let el=$('#storyCard');
 if(!el){el=document.createElement('div');el.id='storyCard';el.className='card stack';el.style.gap='8px';adv.before(el)}
 const G=SG(),i=G.c;el.style.borderColor='#a8792a';
 if(i>=SGC.length){const E=SGEND.find(e=>e.k===G.end);
  el.innerHTML=`<div class="eyebrow">📜 物語 ${TX('הסיפור','The Saga')} · ${TX('הושלם','complete')}${G.ng?` · 周回 ${G.ng+1}`:''}</div><h2><span class="kanji" style="color:var(--gold)">${E?E.kj:'完'}</span> ${E?sgT(E.h):TX('הסוף','The end')}</h2><p class="muted" style="font-size:13.5px">${TX('סופים שנמצאו','Endings found')}: ${G.ends.length}/${SGEND.length}</p><div class="row"><button class="btn gold" id="sgGo">🔁 New Game+</button><button class="btn ghost" id="sgJ">${TX('📖 יומן','📖 Journal')}</button></div>`;
  $('#sgGo').onclick=()=>{sfx('step');G.end?sgCredits():sgEnding()};$('#sgJ').onclick=()=>{sfx('step');sgJournal()};return}
 const c=SGC[i],need=sgNeed(i),a=SGACT[c.act];let st,lbl;
 if(G.st===2){st=TX('ניצחת בדו־קרב. הסיפור ממשיך.','You won the duel. The story continues.');lbl=TX('▶ המשך את הפרק','▶ Continue the chapter')}
 else if(G.st===1){let nm='';try{nm=sgT(SGF[sgFoeId(i,sgF())].n)}catch(e){}st=`⚔ ${TX('מחכה לך דו־קרב','A duel awaits')}: ${nm}`;lbl=TX('⚔ לדו־קרב','⚔ To the duel')}
 else if(need.length){st='🔒 '+sgNeedTxt(need).join(' ');lbl=TX('🔒 מה צריך?','🔒 What’s needed?')}
 else{st=TX('הפרק מוכן.','The chapter is ready.');lbl=TX('▶ שחק את הפרק','▶ Play the chapter')}
 const pc=Math.round(i/SGC.length*100);
 el.innerHTML=`<div class="eyebrow">📜 物語 ${TX('הסיפור','The Saga')} · ${TX('מערכה','Act')} <span class="kanji">${a[0]}</span> · ${TX('פרק','Chapter')} ${i+1}/${SGC.length}${G.ng?` · 周回 ${G.ng+1}`:''}</div><h2><span class="kanji" style="color:var(--gold)">${c.k}</span> ${sgT(c.h)} <span class="muted" style="font-size:14px">${c.y}</span></h2><p class="muted" style="font-size:13.5px">${st}</p><div class="xpbar"><i style="width:${pc}%"></i></div><div class="row"><button class="btn ${need.length&&G.st===0?'ghost':'gold'}" id="sgGo">${lbl}</button><button class="btn ghost" id="sgJ">${TX('📖 יומן','📖 Journal')}</button></div>`;
 $('#sgGo').onclick=()=>{sfx('step');sgPlay()};$('#sgJ').onclick=()=>{sfx('step');sgJournal()}};
/* the old card's pop-ups give way to the saga's own */
stCheck=async function(){try{renderStoryCard();sgTick()}catch(e){}};
function sgTick(){if(!S||sgLock())return;const G=SG();if(sgBusy())return;
 if(G.st===2){sgPost();return}
 if(G.c<SGC.length&&G.st===0&&!sgNeed(G.c).length&&G.ann!==G.c){G.ann=G.c;save();
  if(G.c===0&&(S.wins||0)>=1)sgPlay();else{toast(`📜 ${TX('פרק חדש בסיפור נפתח','A new story chapter is open')}: ${sgT(SGC[G.c].h)}`);sfx('gong')}}}
/* the duel: allies you earned step in; winning moves the story */
{const o=duelIntro;duelIntro=async function(ctx){const r=await o.apply(this,arguments);try{if(ctx&&ctx.plot==='saga'&&E&&SGC[ctx.sg]&&SGC[ctx.sg].help){const hs=SGC[ctx.sg].help(sgF(ctx.sg)).filter(Boolean);let p=0;for(const h of hs){p+=h.p;try{logMsg('✦ '+sgT(h.t))}catch(e){}toast('✦ '+sgT(h.t))}if(p>0){E.hp=Math.max(1,Math.round(E.maxHp*(1-Math.min(.45,p))));}}}catch(e){}return r}}
{const o=endFight;endFight=async function(win){const c=CUR;try{if(c&&c.plot==='saga'&&S){const G=SG();if(win&&G.c===c.sg&&G.st===1){G.st=2;save()}}}catch(e){}const r=await o.apply(this,arguments);
 try{if(c&&c.plot==='saga'&&S&&!win)toast(TX('״קום,״ אומרת הוטארו. ״ננסה שוב.״','“Get up,” says Hotaru. “We’ll try again.”'))}catch(e){}return r}}

/* the legacy of the house: every cycle and every ending you found makes the next run stronger */
const SG_RELIC={cut:{d:['+5% נזק','+5% damage'],dmg:.05},rule:{d:['+10% זהב מכל קרב','+10% gold from every fight'],gold:.1},seal:{d:['+10% חיים','+10% health'],hp:.1},hotaru:{d:['+15 קי בתחילת כל קרב','+15 Ki at the start of every fight'],ki:15},mercy:{d:['+5% לכל דבר','+5% to everything'],all:.05}};
function sgLegacy(){const G=S&&S.saga;const L={gold:0,xp:0,hp:0,dmg:0,ki:0};if(!G)return L;const ng=NGF(G.ng||0);L.gold+=.1*ng;L.xp+=.1*ng;for(const k of G.ends||[]){const R=SG_RELIC[k];if(!R)continue;for(const x of['gold','hp','dmg','ki'])if(R[x])L[x]+=R[x];if(R.all){L.gold+=R.all;L.xp+=R.all;L.hp+=R.all;L.dmg+=R.all}}return L}
function sgLegacyHtml(ends,ng){const rows=[];if(ng)rows.push(TX(`周回 ${ng+1}: +${Math.round(10*NGF(ng))}% זהב וניסיון מכל קרב`,`周回 ${ng+1}: +${Math.round(10*NGF(ng))}% gold and XP from every fight`));for(const k of ends){const E=SGEND.find(e=>e.k===k),R=SG_RELIC[k];if(E&&R)rows.push(`<span class="kanji">${E.kj}</span> ${sgT(E.h)}: ${sgT(R.d)}`)}return rows.length?`<div class="card" style="padding:8px 12px;margin-top:8px;border-color:#a8792a"><b style="color:var(--gold)">${TX('ירושת הבית','Legacy of the house')}</b>${rows.map(x=>`<div style="font-size:13px;margin-top:3px">✦ ${x}</div>`).join('')}</div>`:''}
{const o=foeScale;foeScale=function(ctx){const r=o.apply(this,arguments);try{const L=sgLegacy();if(P&&(L.hp||L.dmg)){if(L.hp){P.maxHp=Math.round(P.maxHp*(1+L.hp));P.hp=P.hpLag=P.maxHp}if(L.dmg)P.dmgMul=(P.dmgMul||1)*(1+L.dmg)}}catch(e){}return r}}
{const o=duelIntro;duelIntro=async function(ctx){const r=await o.apply(this,arguments);try{const L=sgLegacy();if(P&&L.ki)P.ki=Math.min(100,(P.ki||0)+L.ki)}catch(e){}return r}}
{const o=endFight;endFight=async function(win){let g0=0,lv=0;try{g0=S?S.gold:0;lv=E?E.level:0}catch(e){}const r=await o.apply(this,arguments);try{if(win&&S){const L=sgLegacy();const dg=S.gold-g0;if(L.gold&&dg>0){const b=Math.round(dg*L.gold);S.gold+=b}if(L.xp&&lv){gainXp(Math.round((55+lv*20)*L.xp))}if(L.gold||L.xp){save();try{updatePills()}catch(e){}}}}catch(e){}return r}}
/* New Game+: every cycle the world pushes back harder */
{const o=foeScale;foeScale=function(ctx){const r=o.apply(this,arguments);try{const ng=NGF((S&&S.saga&&S.saga.ng)||0);if(ng&&E){E.maxHp=Math.round(E.maxHp*(1+.3*ng));E.hp=E.hpLag=E.maxHp;E.dmgMul=(E.dmgMul||1)*(1+.15*ng)}}catch(e){}return r}}
/* the saga counts toward the score of the Way */
{const o=ptsPc;ptsPc=function(){const r=o.apply(this,arguments);try{if(r&&S&&S.saga){const s=Math.min(10,Math.floor((S.saga.c||0)*10/SGC.length));if(s>r[9])r[9]=s}}catch(e){}return r}}
