/* ================= 剣聖 the hard road: a duel is read, not spammed =================
   1. 鍔迫り Tsubazeriai: a blade clash is no longer a sure win for the stronger arm. The masters,
      bosses and veterans push harder, a predictable rhythm weakens your own push, and only a
      decisive edge lands a sure cut.
   2. 読み Yomi and 返し技 Kaeshi-waza: swing the same strike again and again and the opponent
      reads it, raises his guard before it lands and answers with a counter-cut.
   3. Harder everywhere: tougher difficulty settings, foes that grow with your victories, a
      director that pushes harder, and a saga that demands a real domain before its great battles. */
{
const KS_ATK=['quick','normal','power'];
const ksDiff=()=>{try{return S&&S.diff!=null&&S.diff<4?S.diff:1}catch(e){return 1}};
const ksNG=()=>{try{return (S&&S.saga&&S.saga.ng)||0}catch(e){return 0}};
function ksIQ(e){if(!e)return 0;let q=(e.tier==='boss'?.25:e.tier==='mini'?.15:0)+(e.champ?.1:0)+(e.elite?.05:0)-(e.yokai?.12:0);
 q+=(ksDiff()-1)*.06+Math.min(.15,.03*ksNG());try{q+=clamp(((e.level||1)-(S.level||1))*.02,-.15,.2)}catch(x){}return q}
function ksRep(k){const h=(FF&&FF.ksH)||[];return h.filter(x=>x===k).length}
/* --- the blade clash, rebuilt --- */
function ksPow(f,k){let v=f.stats.str*2+f.level*1.2+FORGE[f.forge].dmg+((f.look&&f.look.build)||1)*10+f.sta/12+rnd(-12,12);
 if(f.isPlayer){v+=formOf()*5+3*bn('edge');const r=ksRep(k);if(r>=2)v-=7*(r-1);v-=6*((FF&&FF.ksCW)||0)}
 else{v+=(f.tier==='boss'?10:f.tier==='mini'?6:0)+(f.champ?5:0)+(f.elite?4:0)+(ksDiff()-1)*3+2*Math.min(5,ksNG())}
 return Math.round(v)}
clash=async function(k){
 P.sta=Math.max(0,P.sta-costOf(P,k)-4);E.sta=Math.max(0,E.sta-COST[k]-4);
 const wind={quick:'qWind',normal:'windup',power:'pWind'}[k],str={quick:'qStrike',normal:'strike',power:'pStrike'}[k];
 const px=P.x,ex=E.x,mx=(px+ex)/2;techCall(P,k);techCall(E,k);
 await Promise.all([play(P,[{p:wind,d:230},{p:str,d:110,swing:1,x:mx-50,fn:()=>sfx('swish')}]),play(E,[{p:wind,d:230},{p:str,d:110,swing:1,x:mx+50}])]);
 sfx('clang');sfx('big');spark(mx,GROUND-165,'block',1.7);burst(mx,GROUND-165,34,['#ffffff','#ffe39a','#6fd0ff'],13);shake=18;hitstop=240;flashScreen=.7;announce(TX('התנגשות!','Clash!'),{size:90,dur:1000,flash:1});
 await Promise.all([play(P,[{p:'block',d:120}]),play(E,[{p:'block',d:120}])]);
 wear(P,'w',13);wear(E,'w',13);
 const a=ksPow(P,k),b=ksPow(E,k);if(FF){FF.ksN=(FF.ksN||0)+1;if(a>b)FF.ksPW=(FF.ksPW||0)+1}floatText(P.x,GROUND-270,TX(`כוח ${a}`,`Power ${a}`),'#bff0ff',28);floatText(E.x,GROUND-270,TX(`כוח ${b}`,`Power ${b}`),'#ffb0a0',28);
 for(let i=0;i<3;i++){await wait(240);shake=7;sfx('clang');burst(mx,GROUND-165,6,['#ffe39a','#ffffff'],6)}
 const diff=a-b;
 if(Math.abs(diff)<4){P.sta=Math.max(0,P.sta-6);E.sta=Math.max(0,E.sta-6);logMsg(TX('הלהבים ננעלים בכוח שווה. שני הלוחמים נהדפים לאחור, מתנשמים.','The blades lock with equal force. Both fighters are thrown back, gasping.'));await Promise.all([play(P,[{p:'dodge',d:180,x:px},{p:'idle',d:200}]),play(E,[{p:'dodge',d:180,x:ex},{p:'idle',d:200}])]);return}
 const Wn=diff>0?P:E,Ls=diff>0?E:P,dec=Math.abs(diff)>=15;
 if(FF){FF.ksCW=diff>0?(FF.ksCW||0)+1:0}
 logMsg(TX(`${Wn.name} חזק יותר (${Math.max(a,b)} מול ${Math.min(a,b)}) ודוחף את ${Ls.name} לאחור!${dec?' המכה מכריעה.':''}`,`${Wn.name} is stronger (${Math.max(a,b)} to ${Math.min(a,b)}) and drives ${Ls.name} back!${dec?' A decisive edge.':''}`));
 if(Wn===P&&FF&&FF.ksCW===2)toast(TX('היריב מרגיש כבר את משקל הלהב שלך. בהתנגשות הבאה הוא יהיה מוכן.','Your opponent has felt the weight of your blade. In the next clash he will be ready.'));
 Ls.sta=Math.max(0,Ls.sta-15);await play(Ls,[{p:'hit',d:130,x:Ls.x-Ls.facing*44}]);
 await play(Wn,[{p:str,d:90,swing:1},{d:130,fn:()=>resolveHit(Wn,Ls,k,dec)},{p:'idle',d:240}]);
 await Promise.all([play(P,[{p:'idle',d:220,x:px}]),play(E,[{p:'idle',d:220,x:ex}])]);
};
/* --- yomi: the opponent reads a repeated strike before it lands --- */
{const o=playerAct;playerAct=async function(k){
 try{if(!busy&&!fightOver&&FF&&!FF.war&&P&&E&&KS_ATK.includes(k)&&!E.stun&&E.hp>0&&Math.abs(E.pos-P.pos)<=reachOf(E)&&E.sta>=8){
  const r=ksRep(k);if(r>=2){const ch=clamp(.3+.2*(r-2)+ksIQ(E),.1,.85);
   if(Math.random()<ch){E._read=k;FF.ksReads=(FF.ksReads||0)+1;E.guard=true;E.sta=Math.max(0,E.sta-4);floatText(E.x,GROUND-320,TX('קורא אותך!','Reads you!'),'#ffd27a',30);
    logMsg(TX(`${E.name} קרא את הקצב שלך. ההגנה שלו כבר למעלה לפני שהלהב שלך יוצא.`,`${E.name} has read your rhythm. His guard is up before your blade leaves.`));
    if(!FF.ksTip){FF.ksTip=1;toast(TX('קריאה: אותה מכה שוב ושוב היא הזמנה. גוון בין מהירה, רגילה, כוח, הגנה ותנועה.','Reading: the same strike over and over is an invitation. Mix quick, normal, power, guard and footwork.'))}}}}}catch(e){}
 if(FF&&KS_ATK.includes(k)&&!busy&&!fightOver){FF.ksH=((FF.ksH)||[]).concat(k).slice(-3)}
 return o.apply(this,arguments)}}
{const o=aiChoose;aiChoose=function(e,p){const base=o(e,p);try{if(e&&!e.isPlayer&&e._read){const k=e._read;
  if(k!=='power'&&e.sta>=COST.power)return'power';if(k!=='normal'&&e.sta>=COST.normal)return'normal';if(k!=='quick'&&e.sta>=COST.quick)return'quick';return'rest'}
  if(e&&!e.isPlayer&&!e.yokai&&p&&p.guard&&e.sta>=COST.quick&&Math.random()<.35+ksIQ(e))return'quick';
  if(e&&!e.isPlayer&&p&&p.sta<COST.normal&&e.sta>=COST.power&&Math.abs(e.pos-p.pos)<=reachOf(e)&&Math.random()<.4+ksIQ(e))return'power'}catch(x){}return base}}
/* --- kaeshi-waza: the counter-cut after a read strike --- */
{const o=doAction;doAction=async function(a,d,k){const read=!!(a&&a.isPlayer&&d&&d._read&&d._read===k&&KS_ATK.includes(k));
 const r=await o.apply(this,arguments);
 try{if(d&&d._read&&a&&a.isPlayer)d._read=null;
  if(read&&!fightOver&&d.hp>0&&a.hp>0){bigKanji={t:'返し',life:1.1};sfx('clang');floatText(d.x,GROUND-300,TX('מכת נגד!','Counter-cut!'),'#ff8a5a',30);
   logMsg(TX(`${d.name} הסיט את המכה הצפויה וחתך בחזרה.`,`${d.name} turns aside the strike he expected and cuts back.`));
   const dx=d.x;await play(d,[{p:'qStrike',d:110,swing:1,x:dx+d.facing*30,fn:()=>sfx('swish')},{d:100,fn:()=>resolveHit(d,a,'normal',true)},{p:'idle',d:220,x:dx}])}}catch(e){}
 return r}}
/* --- harder everywhere --- */
try{const H=[[.95,.9],[1.12,1.12],[1.3,1.3],[1.5,1.5]];H.forEach((h,i)=>{if(DIFF[i]){DIFF[i].hp=h[0];DIFF[i].dmg=h[1];DIFF[i].army=Math.max(DIFF[i].army||1,h[0])}});
 if(DIFF[1])DIFF[1].d=TX('האתגר כפי שתוכנן: יריבים שקוראים אותך, וכל ניצחון צריך להרוויח','The challenge as intended: foes who read you, and every victory must be earned');
 if(DIFF[2])DIFF[2].d=TX('יריבים וצבאות חזקים ב־30%, פחות מזל, יותר בריתות נגדך','Foes and armies 30% stronger, less luck, more alliances against you');
 if(DIFF[3])DIFF[3].d=TX('רק לאגדות: הכל חזק ב־50%, המזל אכזרי, וכל יפן נגדך','Only for legends: everything 50% stronger, cruel luck, and all of Japan against you')}catch(e){}
{const o=foeScale;foeScale=function(ctx){o(ctx);try{if(!S||!E||(ctx&&ctx.redeem))return;const w=S.wins||0;
  E.maxHp=Math.round(E.maxHp*(1+Math.min(.3,w/300))*(E.tier==='boss'?1.12:E.tier==='mini'?1.06:1));E.hp=E.hpLag=E.maxHp;E.dmgMul=(E.dmgMul||1)*(1+Math.min(.22,w/400))}catch(e){}}}
{const o=aiP;aiP=function(){const p=o();try{return clamp(p+.05+(ksDiff()-1)*.03,-.1,.35)}catch(e){return p}}}
/* --- 降 surrender and recruitment: a reputation opens doors, it does not fill the hall for free --- */
const ksRetCap=()=>{let c=4;try{c+=2*(bl('castle')||0)+Math.floor(S.clan.cities.length/5)}catch(e){}return Math.min(30,c)};
try{Object.defineProperty(window,'ksJoinMul',{writable:false,configurable:false,value:function(E,ctx){try{const n=S.clan.ret.length,cap=ksRetCap();
  if(n>=cap){if(FF&&FF.notes&&!FF.ksFullSaid){FF.ksFullSaid=1;FF.notes.push(TX(`אולם השבט מלא (${n}/${cap} נאמנים). טירה גבוהה יותר ועוד מחוזות יפנו מקום לעוד.`,`The clan hall is full (${n}/${cap} retainers). A higher castle and more provinces make room for more.`))}return 0}
  let m=Math.pow(.88,Math.max(0,n-3));if(FF&&FF.surrender)m*=.5;if(E&&S&&E.level<S.level-8)m*=.6;return m}catch(e){return 1}}})}catch(e){}
try{Object.defineProperty(window,'ksSurr',{writable:false,configurable:false,value:function(){try{const R=S.ksSur||{n:0,d:S.clan.day||0};const n=Math.max(0,R.n-Math.max(0,(S.clan.day||0)-R.d)/2);return Math.pow(.5,n)*(ksDiff()>=2?.6:1)}catch(e){return 1}}})}catch(e){}
{const o=endFight;endFight=async function(win){try{if(win&&FF&&FF.surrender&&S){const R=S.ksSur||{n:0,d:S.clan.day||0};S.ksSur={n:Math.max(0,R.n-Math.max(0,(S.clan.day||0)-R.d)/2)+1,d:S.clan.day||0}}}catch(e){}return o.apply(this,arguments)}}
{const o=gainXp;gainXp=function(n){try{if(FF&&FF.surrender&&fightOver)n=Math.round(n*.35)}catch(e){}return o.call(this,n)}}
/* --- 弓 a bow has no place in a duel at sword's length: archers draw the tachi of the mounted archer --- */
try{if(KIND.yumi)KIND.yumi.d=(KIND.yumi.d||'')+TX(' בדו־קרב קרוב הקשת לא עוזרת, ולוחם הקשת נלחם בטאצ׳י, חרב הפרש. הקשת שווה זהב במלחמות.',' In a duel at close quarters a bow is useless, so the archer fights with the tachi, the horseman’s sword. The bow earns its keep in wars.')}catch(e){}
{const o=foeScale;foeScale=function(ctx){o(ctx);try{for(const f of[P,E]){if(f&&f.wk==='yumi'){f.wk='tachi';f.p45sig=null;f._bow=1}}if(P&&P._bow)setTimeout(()=>{try{logMsg(TX('בדו־קרב קרוב הקשת לא עוזרת. אתה שולף את הטאצ׳י.','A bow is useless at close quarters. You draw your tachi.'))}catch(e){}},1200)}catch(e){}
 /* 包囲網 no warrior stays untouchable: the stronger you are against a foe, the harder he fights for his life */
 try{if(!P||!E||E.yokai)return;const sc=(a,d)=>a.maxHp*(FORGE[a.forge].dmg*KIND[a.wk].m+a.stats.str*1.7)*hitChance(a,d,'normal')/100;const ra=sc(P,E)/Math.max(1,sc(E,P));
  if(ra>1.5){E.dmgMul=(E.dmgMul||1)*Math.min(1.7,1+(ra-1.5)*.35);E.maxHp=Math.round(E.maxHp*Math.min(1.4,1+(ra-1.5)*.15));E.hp=E.hpLag=E.maxHp}}catch(e){}}}
{const o=startFight;startFight=function(ctx){try{if(ctx&&ctx.def&&!ctx.ksNet&&S&&ctx.kind!=='rank'){ctx.ksNet=1;const my=armyPower()*generalMul();if(my>ctx.def*1.8){const nd=Math.round(my*(.55+.08*ksDiff()));if(nd>ctx.def){ctx.def=nd;setTimeout(()=>toast(TX('包囲網 רשת הכיתור: השכנים חוששים מכוחך ושלחו צבאות לעזרת היריב.','包囲網 The encirclement net: your neighbours fear your power and sent armies to help your enemy.')),900)}}}}catch(e){}return o.apply(this,arguments)}}
try{const NEED={oke:2,naga:4,honno:6,rikyu:8,seki:12,gan:14,fuyu:16,natsu:18};for(const c of SGC)if(NEED[c.id])c.prov=Math.max(c.prov||0,NEED[c.id])}catch(e){}

}
if(false)window.__ks={act:k=>playerAct(k),get FF(){return FF},get P(){return P},get E(){return E},get busy(){return busy},get over(){return fightOver},reach:()=>dist()<=reachOf(P),cost:k=>costOf(P,k)};
