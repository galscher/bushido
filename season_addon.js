/* ================= 場所 the weekly season: everyone starts the week at zero ================= */
/* The board used to rank by the best score of all time, so a new journey still showed the old points and the top was out of
   reach. Now the main board is a weekly season (basho, like the sumo tournaments): every point earned this week, in any
   journey, counts; a new journey never erases what was earned; on Sunday everyone starts again. Dan ranks from ashigaru to
   shōgun mark how far you climbed this week. The pill on top shows this journey alone (a new journey starts at zero);
   the career bank underneath stays as it was, it is simply no longer what the board ranks. The hall of fame keeps each
   player's best single journey. */
SIGK.add('bushido-season');SIGK.add('bushido-runbest');
/* the points of this journey alone (the career bank, if any, is the tail of the record and is left out) */
const runPc=()=>{const pc=ptsPc();return pc?pc.slice(0,15):null};
const runNow=()=>{const pc=runPc();return pc?ptsOf(pc):0};
const runOf=(pc,p)=>{try{if(!ptsValid(pc,p))return 0;return pc.length>15?ptsOf(pc.slice(0,15)):p}catch(e){return 0}};
function runBest(){const b=LSget('bushido-runbest',null);return b&&ptsValid(b.pc,b.p)?b:null}
const SN_EP=Date.UTC(2026,0,3,21),SN_WK=6048e5;
let SN_OFF=0;
const snNow=()=>Math.floor((Date.now()+SN_OFF-SN_EP)/SN_WK);
const snEnds=()=>SN_EP+(snNow()+1)*SN_WK-SN_OFF;
const SN_LG=[[0,'足軽','אשיגארו','Ashigaru'],[600,'侍','סמוראי','Samurai'],[3000,'物頭','מפקד פלוגה','Captain'],[10000,'侍大将','סמוראי־טאישו','Samurai general'],[30000,'大名','דאימיו','Daimyō'],[90000,'将軍','שוגון','Shōgun']];
const snLg=p=>{let i=0;for(let k=0;k<SN_LG.length;k++)if(p>=SN_LG[k][0])i=k;return i};
const snLgName=i=>TX(SN_LG[i][2],SN_LG[i][3]);
const snVal=st=>st?Math.min(2e6,Math.max(0,(st.bank|0)+Math.max(0,(st.top|0)-(st.base|0)))):0;
function snLoad(){const st=LSget('bushido-season',null);return st&&typeof st==='object'&&typeof st.s==='number'?st:null}
let SN_SIG='';
function snSave(st){const j=JSON.stringify(st);if(j===SN_SIG)return;SN_SIG=j;LSset('bushido-season',st)}
/* points only grow from the highest point this journey reached, so a loss and a recovery never count twice,
   and a journey restored from a code starts counting from where it stands */
function snTick(){try{if(!S||S._t||sideBad())return snLoad();const pc=runPc(),p=pc?ptsOf(pc):0,rid=cRunId(),cur=snNow();let st=snLoad(),fresh=null;
 if(!st||st.s!==cur){const last=st&&st.s<cur?{s:st.s,p:snVal(st)}:(st&&st.last)||null;if(st&&st.s<cur&&last&&last.p>0)fresh=last;st={s:cur,bank:0,rid,base:p,top:p,last}}
 if(st.rid!==rid){st.bank=(st.bank|0)+Math.max(0,(st.top|0)-(st.base|0));st.rid=rid;st.base=p;st.top=p}
 const before=snLg(snVal(st));if(p>st.top)st.top=p;snSave(st);{const rb=runBest();if(pc&&(!rb||p>rb.p))LSset('bushido-runbest',{p,pc})}const after=snLg(snVal(st));
 if(fresh)setTimeout(()=>{try{toast(TX(`🎌 עונה חדשה התחילה! בעונה הקודמת צברת ${fmtN(fresh.p)} נקודות ודרגת ${snLgName(snLg(fresh.p))}. כולם מתחילים שוב מאפס.`,`🎌 A new season has begun! Last season you earned ${fmtN(fresh.p)} points and reached ${snLgName(snLg(fresh.p))}. Everyone starts again from zero.`))}catch(e){}},600);
 else if(after>before){try{sfx('win')}catch(e){}try{toast(TX(`⛩ עלית בדרגה: ${SN_LG[after][1]} ${snLgName(after)}!`,`⛩ Rank up: ${SN_LG[after][1]} ${snLgName(after)}!`))}catch(e){}}
 return st}catch(e){console.warn('season',e);return null}}
const snMine=()=>{const st=snLoad();return st&&st.s===snNow()?snVal(st):0};
{const o=ptsTick;ptsTick=function(){snTick();const r=o.apply(this,arguments);try{const el=$('#ptsPill');if(el&&S)el.textContent=`🏆 ${fmtN(runNow())}${PTS_RANK?` · #${PTS_RANK}`:''}`}catch(e){}return r}}
/* the streaming board: the place and the "passed you" news follow this week's season */
let SN_PREV={},SN_TT=0;
if(typeof liveOnRows==='function'){const o=liveOnRows;liveOnRows=function(){LIVE_TT=Date.now();const r=o.apply(this,arguments);try{if(S&&LIVE_ROWS){const s=snNow(),mp=snMine();const others=LIVE_ROWS.filter(x=>!(UID&&x.id===UID)&&snOk(x,s));let n=1;for(const x of others)if(x.sp>mp)n++;PTS_RANK=mp>0?n:null;
 const first=!Object.keys(SN_PREV).length;let msg='';for(const x of others){const above=x.sp>mp,was=SN_PREV[x.id];if(!first&&mp>0&&was!==undefined&&was!==above)msg=above?TX(`⚔ ${x.name} עקף אותך בעונה! אתה עכשיו במקום #${n}`,`⚔ ${x.name} just passed you this season! You’re now #${n}`):TX(`🏆 עקפת את ${x.name} בעונה! אתה עכשיו במקום #${n}`,`🏆 You passed ${x.name} this season! You’re now #${n}`);SN_PREV[x.id]=above}
 if(msg&&!document.hidden&&Date.now()-SN_TT>15000){SN_TT=Date.now();toast(msg)}ptsTick();
 setTimeout(()=>{try{const ov=document.querySelector('.x50ov');const c=ov&&ov.querySelector('.x50tabs .chip[data-t="season"][aria-pressed="true"],.x50tabs .chip[data-t="run"][aria-pressed="true"]');if(c){const sc=ov.querySelector('#x50bd');const y=sc?sc.scrollTop:0;c.click();if(sc)setTimeout(()=>{sc.scrollTop=y},120)}}catch(e){}},1300)}}catch(e){}return r}}
{const o=liveRow;liveRow=function(){const r=o();try{const st=snLoad(),cur=snNow();r.ss=cur;r.sp=st&&st.s===cur?snVal(st):0;const l=st&&st.s===cur?st.last:st?{s:st.s,p:snVal(st)}:null;if(l&&l.s===cur-1){r.lss=l.s;r.lsp=Math.min(2e6,l.p|0)}const rb=runBest();if(rb){r.rb=rb.p;r.rbc=rb.pc}}catch(e){}return r}}
/* a player's best single journey: the record they pushed, or for an older row, the journey inside their best snapshot */
const hallOf=r=>{try{if(r&&ptsValid(r.rbc,r.rb)&&r.rbc.length===15)return r.rb;return runOf(r&&r.hpc,r&&r.hp)}catch(e){return 0}};
/* a season row is believed only if it is a whole number within reach of what that player has really done */
function snOk(r,s){if(!r||r.ss!==s)return false;const p=r.sp;if(typeof p!=='number'||!isFinite(p)||p<0||p!==Math.floor(p)||p>2e6)return false;
 return p<=Math.max(hallOf(r),ptsValid(r.hpc,r.hp)?r.hp:0)*4+60000}
const snLastOk=(r,s)=>r&&r.lss===s&&typeof r.lsp==='number'&&isFinite(r.lsp)&&r.lsp>0&&r.lsp===Math.floor(r.lsp)&&r.lsp<=2e6&&r.lsp<=Math.max(hallOf(r),ptsValid(r.hpc,r.hp)?r.hp:0)*4+60000;
function snLeft(){const ms=Math.max(0,snEnds()-Date.now()),d=Math.floor(ms/864e5),h=Math.floor(ms%864e5/36e5),m=Math.floor(ms%36e5/6e4);
 return d?TX(`${d} ימים ו־${h} שעות`,`${d}d ${h}h`):h?TX(`${h} שעות ו־${m} דקות`,`${h}h ${m}m`):TX(`${m} דקות`,`${m} min`)}
/* the place on the pill and in the info card is the place in this week's season */
ptsRank=async function(force){try{if(!force&&Date.now()-PTS_RT<120000)return PTS_RANK;PTS_RT=Date.now();const rows=await fetchLive();if(!rows)return PTS_RANK=null;
 const s=snNow(),mp=snMine();let n=1;for(const r of rows){if(UID&&r.id===UID)continue;if(snOk(r,s)&&r.sp>mp)n++}PTS_RANK=mp>0?n:null;ptsTick();return PTS_RANK}catch(e){return null}};
const snBadge=p=>{const i=snLg(p);return`<span class="snb snb${i}" title="${esc(snLgName(i))}">${SN_LG[i][1]}</span>`};
function snHead(mp,rank,rows,s){const i=snLg(mp),nx=SN_LG[i+1],lo=SN_LG[i][0],pc=nx?Math.round(100*(mp-lo)/(nx[0]-lo)):100;
 let chase='';if(rows){const above=rows.filter(r=>!r.mine&&snOk(r,s)&&r.sp>mp).sort((a,b)=>a.sp-b.sp)[0];
  chase=above?TX(`עוד <b>${fmtN(above.sp-mp+1)}</b> נקודות ותעקוף את <b>${esc(above.name)}</b>`,`<b>${fmtN(above.sp-mp+1)}</b> more points to pass <b>${esc(above.name)}</b>`):mp>0?TX('👑 אתה בראש העונה. שמור על המקום.','👑 You lead the season. Hold the top.'):TX('כל נקודה שתצבור השבוע תכניס אותך לטבלה.','Every point you earn this week puts you on the board.')}
 return`<div class="card snhead"><div class="snrow"><span class="snbig">${snBadge(mp)}</span><div style="flex:1;min-width:0"><div class="eyebrow">${TX('עונה','Season')} ${s} · ${TX('נגמרת בעוד','ends in')} ${snLeft()}</div>
 <div class="snpts">${fmtN(mp)} <small>${TX('נקודות השבוע','points this week')}${rank?` · #${rank}`:''}</small></div>
 <div class="snlg">${esc(snLgName(i))}${nx?` · ${TX('הדרגה הבאה','next')}: ${esc(TX(nx[2],nx[3]))} ${nx[1]} · ${TX('עוד','')} ${fmtN(nx[0]-mp)}${TX('',' to go')}`:` · ${TX('הדרגה הגבוהה ביותר','the highest rank')}`}</div>
 <div class="snbar"><i style="width:${Math.max(2,Math.min(100,pc))}%"></i></div></div></div>${chase?`<p class="snchase">${chase}</p>`:''}</div>`}
openBoard=async function(tab){sfx('step');const ov=xOverlay(TX('טבלת השיאים','Leaderboard'));const B=ov.body;
 B.innerHTML=`<div class="x50tabs"><button class="chip" data-t="season">${TX('🎌 העונה','🎌 Season')}</button><button class="chip" data-t="run">${TX('המסע הנוכחי','This journey')}</button><button class="chip" data-t="daily">${TX('אתגר היום','Today’s challenge')}</button><button class="chip" data-t="live">${TX('🏯 היכל התהילה','🏯 Hall of fame')}</button><button class="chip" data-t="speed">${TX('⏱ ספידראן','⏱ Speedrun')}</button><button class="chip" data-t="end">${TX('מסעות שהסתיימו','Finished journeys')}</button></div><div id="x50bd" class="stack"><p class="muted">${TX('טוען...','Loading...')}</p></div>
 <div class="card stack" style="gap:8px"><div class="eyebrow">${TX('השם שלך בטבלה','Your name on the board')}</div><div style="display:flex;gap:8px"><input class="hs-name" id="x50nm" maxlength="20" autocomplete="off"><button class="btn gold" id="x50nmok" style="flex:none">${TX('שמור','Save')}</button></div><div class="x50note" id="x50st"></div></div>`;
 const nm=B.querySelector('#x50nm');nm.value=playerName();
 {const sb=mkBtn(TX('📤 שתף את ההישגים שלי','📤 Share my progress'),()=>{const r=liveRow();const st=dailyStreak();const sp=snMine(),lg=snLg(sp);x50Share(TX(`בושידו ⚔️ ${r.name}${r.h>=0?` · ${HEROES[r.h].name}`:''}\n🎌 עונה ${snNow()}: ${fmtN(sp)} נקודות · ${SN_LG[lg][1]} ${snLgName(lg)}${PTS_RANK?` · מקום ${PTS_RANK}`:''}\n🏆 המסע הנוכחי ${fmtN(runNow())} · המסע הטוב ביותר ${fmtN(hallOf(r))}\nדרגה ${r.lv} · ${r.wins} ניצחונות · ${r.prov} מחוזות · ${r.ach}/${ACH.length} הישגים${st>1?`\n🔥 רצף של ${st} ימים באתגר היומי`:''}\nמי עוקף אותי השבוע?`,`Bushido ⚔️ ${r.name}${r.h>=0?` · ${HEROES[r.h].name}`:''}\n🎌 Season ${snNow()}: ${fmtN(sp)} points · ${SN_LG[lg][1]} ${snLgName(lg)}${PTS_RANK?` · #${PTS_RANK}`:''}\n🏆 This journey ${fmtN(runNow())} · best journey ${fmtN(hallOf(r))}\nLevel ${r.lv} · ${r.wins} wins · ${r.prov} provinces · ${r.ach}/${ACH.length} achievements${st>1?`\n🔥 ${st}-day daily streak`:''}\nWho can beat me this week?`))},0,'wide ghost');sb.style.marginTop='4px';B.querySelector('#x50st').after(sb)}
 B.querySelector('#x50nmok').onclick=async()=>{const v=(nm.value||'').trim().slice(0,20);if(!v)return;LSset('bushido-player2',v);try{localStorage.setItem('bushido-player',v)}catch(e){}sfx('step');const ok=await livePush(true);toast(ok?TX('השם נשמר בטבלה','Name saved on the board'):TX('השם נשמר ומופיע בשורה שלך בטבלה','Name saved and shown in your row'));draw(cur)};
 let cur=tab==='live'||!tab?'season':tab,rows=null,cw=null,seq=0;
 const st=B.querySelector('#x50st');
 const setTabs=()=>B.querySelectorAll('.x50tabs .chip').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.t===cur)));
 B.querySelectorAll('.x50tabs .chip').forEach(b=>b.onclick=()=>{sfx('step');cur=b.dataset.t;draw(cur)});
 /* the top of the list, then the rows around you, so the board always shows who is right ahead */
 const around=(list,meIdx,top)=>{if(meIdx<top+3)return list.slice(0,Math.max(top,meIdx+3)).map((r,i)=>[r,i]);const out=list.slice(0,top).map((r,i)=>[r,i]);out.push(null);for(let i=Math.max(top,meIdx-2);i<=Math.min(list.length-1,meIdx+2);i++)out.push([list[i],i]);return out};
 async function draw(t){const my=++seq;setTabs();const box=B.querySelector('#x50bd');
  if(t==='end'){const h=await boardHtml(20);if(my===seq)box.innerHTML=h;return}
  if(t==='speed'){let sr=null;try{await dbInit();if(DB){const q=await DB.collection('speed').limit(200).get();sr=q.docs.map(d=>({...d.data(),id:d.id}))}}catch(e){sr=null}if(my!==seq)return;
   const shared=!!sr;if(!sr)sr=LSget('bushido-speed',[]).map(r=>({...r,mine:1}));if(UID)for(const r of sr)if(r.id===UID)r.mine=1;sr=sr.filter(r=>r&&r.ms>0).sort((a,b)=>a.ms-b.ms);
   const fm=ms=>{try{return spdFmt(ms)}catch(e){return Math.round(ms/1000)+'s'}};
   box.innerHTML=`<p class="x50note">${TX('מצב ספידראן נבחר בתחילת מסע חדש: השעון רץ מהרגע הראשון, ומי שמגיע ליעד הכי מהר מוביל.','Speedrun is picked when starting a new journey: the clock runs from the first moment, and the fastest to reach the goal leads.')}${shared?'':' '+TX('(מוצגות רק ריצות מהמכשיר הזה)','(only runs from this device are shown)')}</p>`+(sr.length?`<div class="x50tw"><table class="hs-table"><tr><th>#</th><th>${TX('שחקן','Player')}</th><th>${TX('לוחם','Warrior')}</th><th>${TX('זמן','Time')}</th><th>${TX('דרגה','Lv')}</th></tr>${sr.slice(0,50).map((r,i)=>`<tr class="${r.mine?'me':''}"><td>${i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1}</td><td>${esc(r.name)}</td><td>${esc(window.bsdHero?window.bsdHero(r):r.hero)}</td><td class="num">${fm(r.ms)}</td><td>${num(r.lvl)}</td></tr>`).join('')}</table></div>`:`<p class="muted">${TX('עוד אף אחד לא סיים ספידראן.','Nobody has finished a speedrun yet.')}</p>`);return}
  snTick();await livePush(true);rows=await fetchLive();if(cw===null)cw=await canWrite();if(my!==seq)return;
  const me=liveRow();let shared=!!rows;if(!rows)rows=[{...me,id:'me',mine:1}];
  if(UID)for(const r of rows)if(r.id===UID)r.mine=1;
  st.textContent=!shared?TX('הטבלה המשותפת לא זמינה כאן, לכן מוצגות רק התוצאות של המכשיר הזה.','The shared board is not available here, so only this device’s results are shown.'):(LIVE_RO||cw===false)?TX('בקישור הזה הטבלה המשותפת פתוחה לצפייה בלבד, ולכן אי אפשר להוסיף אליה שורות. השם והתוצאות שלך נשמרים כאן, בשורה המסומנת "במכשיר הזה". רוצה שכולם יראו? לחץ על "שתף את ההישגים שלי".','On this link the shared board is view-only, so new rows can’t be added. Your name and results are kept here, in the row marked "this device". Want everyone to see? Tap "Share my progress".'):TX('התוצאות שלך מתעדכנות בטבלה אוטומטית.','Your results update on the board automatically.');
  if((LIVE_RO||cw===false)&&shared&&!rows.some(r=>r.mine))rows.push({...me,id:'me',mine:1,name:me.name+TX(' (במכשיר הזה)',' (this device)')});
  if(t==='season'){const s=snNow(),mp=snMine();for(const r of rows)if(r.mine&&r.id==='me'){r.ss=s;r.sp=mp}
   const list=rows.filter(r=>snOk(r,s)&&(r.sp>0||r.mine)).sort((a,b)=>b.sp-a.sp||(b.lv||0)-(a.lv||0));const mi=list.findIndex(r=>r.mine),rank=mi>=0&&mp>0?mi+1:null;
   const last=rows.filter(r=>snLastOk(r,s-1)).sort((a,b)=>b.lsp-a.lsp).slice(0,3);
   let h=snHead(mp,rank,list,s);
   if(last.length)h+=`<div class="card snpod"><div class="eyebrow">${TX('אלופי העונה הקודמת','Last season’s champions')} · ${s-1}</div>${last.map((r,i)=>`<div class="snpr"><span>${['🥇','🥈','🥉'][i]}</span><b>${esc(r.name)}</b>${snBadge(r.lsp)}<span class="num">${fmtN(r.lsp)}</span></div>`).join('')}</div>`;
   h+=`<p class="x50note"><b style="color:#7fe08a">● ${TX('בזמן אמת','LIVE')}</b> · ${TX('בכל שבוע מתחילה עונה חדשה וכולם מתחילים מאפס. כל נקודה שאתה צובר השבוע, בכל מסע, נספרת, ומסע חדש לא מוחק אותה. בסוף השבוע שלושת הראשונים נכנסים לפודיום.','Every week a new season starts and everyone begins at zero. Every point you earn this week, in any journey, counts, and a new journey never erases it. At the end of the week the top three take the podium.')}</p>`;
   if(!list.length)h+=`<p class="muted">${TX('עוד אף אחד לא צבר נקודות השבוע. זה הרגע להוביל.','Nobody has earned points this week yet. This is your moment to lead.')}</p>`;
   else h+=`<div class="x50tw"><table class="hs-table"><tr><th>#</th><th>${TX('שחקן','Player')}</th><th>${TX('דרגה','Rank')}</th><th>🎌</th><th>${TX('לוחם','Warrior')}</th><th>${TX('המסע','Journey')}</th></tr>${around(list,mi,15).map(x=>x?`<tr class="${x[0].mine?'me':''}"><td>${x[1]===0&&x[0].sp?'👑':x[1]+1}</td><td>${esc(x[0].name)}</td><td>${snBadge(x[0].sp)}</td><td class="num" style="color:var(--gold);font-weight:700">${fmtN(x[0].sp)}</td><td>${esc(heroN(x[0].h))}</td><td class="num">${(v=>v?fmtN(v):'—')(x[0].mine?runNow():runOf(x[0].pc,x[0].pts))}</td></tr>`:`<tr><td colspan="6" class="muted" style="text-align:center">⋯</td></tr>`).join('')}</table></div>`;
   box.innerHTML=h;return}
  if(t==='run'){for(const r of rows)r._p=r.mine&&r.id==='me'?runNow():runOf(r.pc,r.pts);const list=rows.filter(r=>r._p>0).sort((a,b)=>b._p-a._p||(b.lv||0)-(a.lv||0));const mi=list.findIndex(r=>r.mine);
   box.innerHTML=`<p class="x50note">${TX('כאן מתחרים רק במסע שאתה נמצא בו עכשיו. מסע חדש מתחיל מאפס, ולכן כל מסע הוא מרוץ חדש.','Here only the journey you are on now counts. A new journey starts at zero, so every journey is a new race.')}</p>`+(list.length?`<div class="x50tw"><table class="hs-table"><tr><th>#</th><th>${TX('שחקן','Player')}</th><th>🏆</th><th>${TX('לוחם','Warrior')}</th><th>${TX('דרגה','Lv')}</th><th>${TX('ניצחונות','Wins')}</th></tr>${around(list,mi,15).map(x=>x?`<tr class="${x[0].mine?'me':''}"><td>${x[1]===0?'👑':x[1]+1}</td><td>${esc(x[0].name)}</td><td class="num" style="color:var(--gold);font-weight:700">${fmtN(x[0]._p)}</td><td>${esc(heroN(x[0].h))}</td><td class="num">${num(x[0].lv)}</td><td class="num">${num(x[0].wins)}</td></tr>`:`<tr><td colspan="6" class="muted" style="text-align:center">⋯</td></tr>`).join('')}</table></div>`:`<p class="muted">${TX('עוד אין אף אחד בטבלה. התחל מסע ותהיה הראשון.','Nobody on the board yet. Start a journey and be the first.')}</p>`);return}
  if(t==='live'){for(const r of rows)r._p=r.mine?Math.max(hallOf(r),(runBest()||{p:0}).p):hallOf(r);const list=rows.filter(r=>r._p>0||(r.lv||0)>0||(r.ach||0)>0).sort((a,b)=>b._p-a._p||(b.lv||0)-(a.lv||0)||(b.wins||0)-(a.wins||0));
   if(!list.length){box.innerHTML=`<p class="muted">${TX('עוד אין אף אחד בטבלה. התחל מסע ותהיה הראשון.','Nobody on the board yet. Start a journey and be the first.')}</p>`;return}
   box.innerHTML=`<p class="x50note">${TX('🏯 היכל התהילה: המסע הטוב ביותר של כל שחקן, מאז ומעולם (מסע אחד, לא סכום של כולם). איך מחושב הניקוד? זה סוד. שחק טוב, שחק הרבה, ותגלה.','🏯 Hall of fame: every player’s best single journey ever (one journey, not the sum of all). How is it counted? That’s a secret. Play well, play a lot, and find out.')}</p><div class="x50tw"><table class="hs-table"><tr><th>#</th><th>${TX('שחקן','Player')}</th><th>🏆</th><th>${TX('לוחם','Warrior')}</th><th>${TX('דרגה','Lv')}</th><th>${TX('ניצחונות','Wins')}</th><th>${TX('אלופים','Champs')}</th><th>${TX('מחוזות','Prov.')}</th><th>${TX('הישגים','Ach.')}</th></tr>${list.slice(0,50).map((r,i)=>`<tr class="${r.mine?'me':''}"><td>${i===0&&r._p?'👑':i+1}</td><td>${esc(r.name)}</td><td class="num" style="color:var(--gold);font-weight:700">${r._p?fmtN(r._p):'—'}</td><td>${esc(heroN(r.h))}</td><td class="num">${num(r.lv)}</td><td>${num(r.wins)}</td><td>${num(r.champs)}</td><td>${num(r.prov)}</td><td>${num(r.ach)}/${ACH.length}</td></tr>`).join('')}</table></div>`;return}
  {const td=today();const list=rows.filter(r=>r.dd===td&&r.dt>0).sort((a,b)=>a.dt-b.dt||(b.dhp||0)-(a.dhp||0));const D=dailyOf(td);
   box.innerHTML=`<div class="card x50vs"><div>${'<span data-c="me"></span>'}<b>${esc(heroN(D.h))}</b></div><div class="mid">対</div><div><span data-c="foe"></span><b>${esc(D.fd.name)}</b></div></div>`+(list.length?`<div class="x50tw"><table class="hs-table"><tr><th>#</th><th>${TX('שחקן','Player')}</th><th>${TX('מכות','Strikes')}</th><th>${TX('חיים שנשארו','HP left')}</th></tr>${list.map((r,i)=>`<tr class="${r.mine?'me':''}"><td>${i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1}</td><td>${esc(r.name)}</td><td class="num">${num(r.dt)}</td><td>${num(r.dhp)}%</td></tr>`).join('')}</table></div>`:`<p class="muted">${TX('אף אחד עוד לא ניצח באתגר של היום.','Nobody has won today’s challenge yet.')}</p>`);
   box.querySelector('[data-c=me]').replaceWith(heroCanvas(D.h,72));box.querySelector('[data-c=foe]').replaceWith(Object.assign(lookCanvas(D.fd.look,'x50f'+D.idx),{style:'width:72px;height:72px'}));
   const b=mkBtn(TX('לאתגר היום','Play today’s challenge'),()=>{ov.close();openDaily()},0,'wide gold');box.append(b)}}
 draw(cur)};
/* the trophy card: this journey, this week's season and the all-time best, side by side */
ptsInfo=async function(){const p=runNow(),b=runBest();snTick();const r=await ptsRank(true),mp=snMine(),i=snLg(mp);
 const k=await modal(`<div class="eyebrow">🏆 ${TX('ניקוד הדרך','The score of the Way')}</div>
 <div class="snrow" style="margin:8px 0"><span class="snbig">${snBadge(mp)}</span><div><div class="snpts" style="font-size:30px">${fmtN(mp)}</div><div class="snlg">${TX('נקודות בעונה','season points')} ${snNow()} · ${esc(snLgName(i))}${r?` · #${r}`:''}</div></div></div>
 <dl class="kv"><dt>${TX('המסע הנוכחי','This journey')}</dt><dd>${fmtN(p)}</dd><dt>${TX('המסע הטוב ביותר שלך','Your best journey')}</dt><dd>${fmtN(Math.max(p,b?b.p:0))}</dd><dt>${TX('העונה נגמרת בעוד','Season ends in')}</dt><dd>${snLeft()}</dd></dl>
 <p data-lt="1" style="margin-top:10px;line-height:1.65">${TX('המספר למעלה הוא המסע הנוכחי, ומסע חדש מתחיל מאפס. כל שבוע הוא עונה חדשה וכולם מתחילים מאפס, וכל נקודה שתצבור השבוע נספרת בעונה, גם אם תתחיל מסע חדש. איך משיגים נקודות? זה סוד של הדרך: כל מה שלוחם גדול עושה נספר, וחלק מהדברים שווים הרבה יותר ממה שנדמה.','The number on top is this journey, and a new journey starts at zero. Every week is a new season and everyone starts at zero, and every point you earn this week counts for the season, even if you start a new journey. How do you earn points? That’s a secret of the Way: everything a great warrior does counts, and some things are worth far more than they seem.')}</p>`,
 [{key:'b',label:TX('🎌 לטבלת העונה','🎌 To the season board'),cls:'gold'},{key:'x',label:TX('סגור','Close'),cls:'ghost'}]);
 if(k==='b')openBoard('season')};
document.head.insertAdjacentHTML('beforeend',`<style>.snb{display:inline-grid;place-items:center;min-width:26px;height:22px;padding:0 4px;border-radius:5px;font:700 13px var(--kanji);color:#120c0a;background:#8a7a64;box-shadow:0 0 0 1px #000;white-space:nowrap}
.snb1{background:#b9a27a}.snb2{background:#c98b4a}.snb3{background:#c0c4cc}.snb4{background:linear-gradient(180deg,#f3d27a,#b8862a)}.snb5{background:linear-gradient(180deg,#e2463a,#7a1610);color:#f7e7c0;box-shadow:0 0 0 1px #000,0 0 8px rgba(230,180,80,.7)}
.snhead{gap:6px}.snrow{display:flex;align-items:center;gap:12px}.snbig .snb{min-width:52px;height:52px;font-size:24px;border-radius:10px;transform:rotate(-4deg)}
.snpts{font:400 28px var(--display);color:var(--gold);font-variant-numeric:tabular-nums;line-height:1.1}.snpts small{font:500 12px var(--body);color:var(--paper-dim)}
.snlg{font-size:12.5px;color:var(--paper-dim);margin-top:2px}.snbar{height:7px;border-radius:99px;background:#2a201c;margin-top:6px;overflow:hidden;box-shadow:inset 0 0 0 1px #3a2c22}.snbar i{display:block;height:100%;background:linear-gradient(90deg,#a8792a,#e6b450)}
.snchase{margin:4px 0 0;font-size:13.5px}.snchase b{color:var(--gold)}.snpod{gap:4px}.snpr{display:flex;align-items:center;gap:8px}.snpr b{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.snpr .num{color:var(--gold);font-weight:700}</style>`);
if(false)window.__sn={snNow,snTick,snLoad,snVal,snMine,snOk,setOff:v=>{SN_OFF=v},SN_LG,openBoard:t=>openBoard(t),fetchLive:()=>fetchLive(),liveRow:()=>liveRow(),runNow:()=>runNow(),hallOf};
