/* ================= 戦場 Senjō: the tactical battlefield =================
   The three rounds of rock-paper-scissors give way to a turn-based battle on a map of squares, in the manner of the
   old tactics games: rice paddies, forest, hills, a river with its bridges, villages, castles, the open sea.
   Every unit shows its strength from 1 to 10; every attack opens a short split-screen clash; both generals stand above
   the field as commanders, each with a power that fills during the battle.
   Everything that was wired to the old result stays wired: the core startWar still sets the war up (doctrines, fleet,
   kami wind, mercenaries, walls, logistics), and the battle hands its result back to warEnd. */
const SJ_C=10,SJ_R=8,SJ_DAYS=8,SJ_TS=48,SJ_PMAX=230;
let SJ=null,SJ_SKIPSG=0,SJ_LAST=null;
const sjL=(h,e)=>TX(h,e);
/* ---------- the ground ---------- */
const SJT={
 plain:{kj:'野',he:'שדה פתוח',en:'Open field',st:1,mv:{foot:1,horse:1,heavy:1}},
 paddy:{kj:'田',he:'שדות אורז',en:'Rice paddies',st:0,mv:{foot:2,horse:3,heavy:3},dhe:'בוץ ומים: מאט פרשים, בלי מחסה',den:'Mud and water: slows cavalry, no cover'},
 forest:{kj:'林',he:'יער',en:'Forest',st:2,mv:{foot:2,horse:3,heavy:3},cover:1},
 hill:{kj:'丘',he:'גבעה',en:'Hill',st:3,mv:{foot:2,horse:2,heavy:3},cover:1,high:1,dhe:'קשתים, טפו ותותחים יורים מכאן משבצת אחת רחוק יותר',den:'Archers, teppō and cannon shoot one square farther from here'},
 river:{kj:'川',he:'נהר',en:'River',st:0,mv:{}},
 ford:{kj:'瀬',he:'מעבר רדוד',en:'Ford',st:0,mv:{foot:3,horse:3,heavy:4}},
 bridge:{kj:'橋',he:'גשר',en:'Bridge',st:0,mv:{foot:1,horse:1,heavy:1}},
 village:{kj:'村',he:'כפר',en:'Village',st:2,mv:{foot:1,horse:1,heavy:1},heal:20,cover:1,dhe:'מרפא 2 בתחילת כל תור',den:'Heals 2 at the start of each turn'},
 honjin:{kj:'本陣',he:'מטה השדה',en:'Field HQ',st:3,mv:{foot:1,horse:1,heavy:1},heal:20,cover:1},
 moat:{kj:'堀',he:'חפיר',en:'Moat',st:0,mv:{}},
 wall:{kj:'石垣',he:'חומת אבן',en:'Stone wall',st:0,mv:{}},
 castle:{kj:'郭',he:'חצר הטירה',en:'Castle bailey',st:2,mv:{foot:1,horse:1,heavy:1},cover:1,keep:1},
 gate:{kj:'門',he:'שער',en:'Gate',st:2,mv:{foot:1,horse:1,heavy:1},keep:1},
 tenshu:{kj:'天守',he:'מגדל הטירה',en:'Castle keep',st:3,mv:{foot:1,horse:1,heavy:1},heal:20,cover:1,keep:1},
 sea:{kj:'海',he:'ים פתוח',en:'Open sea',st:0,mv:{ship:1,hship:1}},
 shoal:{kj:'浅瀬',he:'שרטון',en:'Shoals',st:1,mv:{ship:2,hship:3},dhe:'מים רדודים: ספינות כבדות נתקעות',den:'Shallow water: heavy ships drag'},
 reef:{kj:'岩礁',he:'שוניות',en:'Reefs',st:0,mv:{}},
 island:{kj:'島',he:'אי',en:'Island',st:0,mv:{}},
 port:{kj:'港',he:'מעגן',en:'Anchorage',st:2,mv:{ship:1,hship:1},heal:20}};
/* ---------- the men and the ships ---------- */
const SJU={
 yari:{kj:'槍',he:'אשיגרו',en:'Ashigaru',sh:'חניתות ארוכות',se:'long pikes',mv:3,mt:'foot',r:[1,1],c:10},
 yumi:{kj:'弓',he:'קשתים',en:'Archers',sh:'יורים למרחק 2',se:'shoot 2 squares',mv:3,mt:'foot',r:[1,2],c:11},
 teppo:{kj:'鉄砲',he:'טפו',en:'Teppō',sh:'רובי פתיל: יורים או זזים',se:'matchlocks: fire or move',mv:3,mt:'foot',r:[1,2],c:13,still:1,noc:1},
 kiba:{kj:'騎',he:'פרשים',en:'Cavalry',sh:'מהירים',se:'fast',mv:5,mt:'horse',r:[1,1],c:14},
 sam:{kj:'侍',he:'סמוראים',en:'Samurai',sh:'עילית',se:'elite',mv:4,mt:'foot',r:[1,1],c:16},
 monk:{kj:'僧',he:'נזירים לוחמים',en:'Warrior monks',sh:'נגינאטה',se:'naginata',mv:3,mt:'foot',r:[1,1],c:11},
 ozutsu:{kj:'大筒',he:'אוזוטסו',en:'Ōzutsu',sh:'תותח: יורה 2 עד 4',se:'cannon: range 2–4',mv:2,mt:'heavy',r:[2,4],c:18,still:1,noc:1},
 gen:{kj:'将',he:'המפקד',en:'Commander',sh:'אם הוא נופל, הקרב אבוד',se:'if he falls, the battle is lost',mv:3,mt:'horse',r:[1,1],c:30},
 atake:{kj:'安宅',he:'אטקבונה',en:'Atakebune',sh:'מבצר צף',se:'floating fortress',mv:3,mt:'hship',r:[1,2],c:20},
 seki:{kj:'関',he:'סקיבונה',en:'Sekibune',sh:'ספינת מלחמה',se:'war galley',mv:4,mt:'ship',r:[1,1],c:13},
 kobaya:{kj:'小早',he:'קובאיה',en:'Kobaya',sh:'מהירה, פצצות אש',se:'fast, fire-bombs',mv:6,mt:'ship',r:[1,1],c:10},
 flag:{kj:'旗艦',he:'ספינת הדגל',en:'Flagship',sh:'אם היא טובעת, הקרב אבוד',se:'if she sinks, the battle is lost',mv:3,mt:'hship',r:[1,2],c:30},
 gate:{kj:'門',he:'שער',en:'Gate',sh:'שוברים אותו כדי להיכנס',se:'break it to get in',mv:0,mt:'none',r:[0,0],c:8,st:1},
 yagura:{kj:'櫓',he:'מגדל יגורה',en:'Yagura',sh:'יורה מהחומה',se:'shoots from the wall',mv:0,mt:'none',r:[1,2],c:10,st:1}};
/* base damage at full strength, in hundredths of a unit (before terrain): who beats whom */
const SJB={
 yari:{yari:55,yumi:65,teppo:70,kiba:85,sam:40,monk:50,ozutsu:75,gen:45,gate:30,yagura:20},
 yumi:{yari:70,yumi:50,teppo:50,kiba:40,sam:45,monk:70,ozutsu:60,gen:40,gate:6,yagura:22},
 teppo:{yari:70,yumi:60,teppo:55,kiba:95,sam:80,monk:75,ozutsu:60,gen:65,gate:14,yagura:30},
 kiba:{yari:30,yumi:90,teppo:95,kiba:60,sam:50,monk:45,ozutsu:90,gen:55,gate:6,yagura:8},
 sam:{yari:65,yumi:80,teppo:75,kiba:65,sam:55,monk:70,ozutsu:85,gen:60,gate:35,yagura:30},
 monk:{yari:60,yumi:65,teppo:60,kiba:60,sam:45,monk:55,ozutsu:75,gen:45,gate:30,yagura:22},
 ozutsu:{yari:65,yumi:65,teppo:65,kiba:55,sam:60,monk:65,ozutsu:60,gen:55,gate:95,yagura:90},
 gen:{yari:55,yumi:65,teppo:65,kiba:60,sam:50,monk:55,ozutsu:75,gen:50,gate:30,yagura:25},
 yagura:{yari:50,yumi:50,teppo:45,kiba:55,sam:40,monk:50,ozutsu:50,gen:35},
 atake:{atake:55,seki:70,kobaya:85,flag:50},
 seki:{atake:40,seki:55,kobaya:75,flag:40},
 kobaya:{atake:75,seki:40,kobaya:55,flag:60},
 flag:{atake:50,seki:65,kobaya:75,flag:45}};
const sjFam=t=>t==='yumi'||t==='teppo'?'arrows':t==='kiba'?'charge':t==='yari'||t==='sam'||t==='monk'?'pikes':null;
/* ---------- the commanders and their powers ---------- */
const SJCO={
 musashi:{kj:'二天一流',he:'שתי השמיים',en:'Niten Ichi-ryū',dh:'כל התקפה מכה ראשונה, והמטרה לא מחזירה מכה',de:'Every attack lands first, and no target can strike back',noc:1,atk:1.1},
 kojiro:{kj:'燕返し',he:'הסנונית החוזרת',en:'Swallow Cut',dh:'כשתוקפים אתכם, מחזירים מכה ראשונים ובעוצמה +30%',de:'When attacked, your units strike back first, at +30%',first:1,ctr:1.3},
 tomoe:{kj:'巴の騎',he:'פרשי טומואה',en:'Tomoe’s Riders',dh:'פרשים: +2 תנועה ו־+35% התקפה',de:'Cavalry: +2 move and +35% attack',mvT:{kiba:2,gen:1},atkT:{kiba:1.35}},
 benkei:{kj:'立往生',he:'עומד עד המוות',en:'Standing Death',dh:'כל היחידות מתרפאות 2, ואף אחת לא נופלת עד התור הבא',de:'All units heal 2, and none can fall until your next turn',heal:20,undying:1},
 masamune:{kj:'独眼竜',he:'הדרקון בעל העין האחת',en:'One-Eyed Dragon',dh:'קשתים וטפו: +1 טווח ו־+30% התקפה',de:'Archers and teppō: +1 range and +30% attack',rngT:{yumi:1,teppo:1},atkT:{yumi:1.3,teppo:1.3}},
 tadakatsu:{kj:'蜻蛉切',he:'חותך השפיריות',en:'Dragonfly Cutter',dh:'הנזק שאתם סופגים −35%, אשיגרו +25%',de:'Damage taken −35%, ashigaru +25%',def:.65,atkT:{yari:1.25}},
 yoshitsune:{kj:'鵯越',he:'הירידה מהצוק',en:'Hiyodori Descent',dh:'+1 תנועה, וכל שטח עולה צעד אחד בלבד',de:'+1 move, and every terrain costs a single step',mv:1,terr1:1,atk:1.1},
 yukimura:{kj:'真田丸',he:'מבצר סנאדה',en:'Sanada-maru',dh:'מרפא 1. יחידות במחסה: +2 כוכבים ו־+20% התקפה',de:'Heal 1. Units in cover: +2 stars and +20% attack',heal:10,coverSt:2,coverAtk:1.2},
 takeda:{kj:'風林火山',he:'רוח, יער, אש, הר',en:'Fūrinkazan',dh:'+1 תנועה, פרשים +30%',de:'+1 move, cavalry +30%',mv:1,atkT:{kiba:1.3,gen:1.2}},
 oda:{kj:'三段撃ち',he:'מטח בשלוש שורות',en:'Three-Rank Volley',dh:'טפו וקשתים +45%',de:'Teppō and archers +45%',atkT:{teppo:1.45,yumi:1.45}},
 odaPike:{kj:'長槍衾',he:'יער החניתות הארוכות',en:'Long-Pike Wall',dh:'אשיגרו +35%, ומחזירים מכה ראשונים',de:'Ashigaru +35%, and they strike back first',atkT:{yari:1.35},first:1},
 uesugi:{kj:'車懸り',he:'גלגל הקרון',en:'Kuruma-gakari',dh:'כל היחידות מתרפאות 1 ו־+20% התקפה',de:'All units heal 1 and +20% attack',heal:10,atk:1.2},
 shimazu:{kj:'釣り野伏せ',he:'מארב בנסיגה',en:'Tsuri-nobuse',dh:'יחידות ביער ובכפר +45% התקפה',de:'Units in forest and villages +45% attack',coverAtk:1.45},
 ikko:{kj:'南無阿弥陀仏',he:'תפילת הנאמנים',en:'Namu Amida Butsu',dh:'כל היחידות מתרפאות 2 ו־+10% התקפה',de:'All units heal 2 and +10% attack',heal:20,atk:1.1},
 hojo:{kj:'籠城',he:'מתבצרים',en:'Rōjō',dh:'הנזק שהם סופגים −35%',de:'Damage they take −35%',def:.65},
 date:{kj:'騎射',he:'קשתות מהסוס',en:'Kisha',dh:'פרשים וקשתים +25%, פרשים יורים 2',de:'Cavalry and archers +25%, cavalry shoot 2',atkT:{kiba:1.25,yumi:1.25},rngT:{kiba:1}},
 sanada:{kj:'奇策',he:'תחבולה',en:'Kisaku',dh:'מלכודות: כל יחידה שלכם מאבדת 1',de:'Traps: every unit of yours loses 1',trap:10},
 tokugawa:{kj:'忍耐',he:'סבלנות',en:'Endurance',dh:'מתרפאים 1, והנזק שהם סופגים −30%',de:'Heal 1, damage they take −30%',heal:10,def:.7},
 mori:{kj:'焙烙火矢',he:'פצצות אש',en:'Hōroku-hiya',dh:'ספינות +35% התקפה ו־+1 תנועה',de:'Ships +35% attack and +1 move',atk:1.35,mv:1},
 mongol:{kj:'てつはう',he:'פצצות חרס',en:'Tetsuhau',dh:'+1 תנועה ו־+30% התקפה',de:'+1 move and +30% attack',mv:1,atk:1.3},
 ming:{kj:'火器',he:'כלי האש של מינג',en:'Ming firearms',dh:'יחידות טווח +40%',de:'Ranged units +40%',atkT:{yumi:1.4,teppo:1.4,ozutsu:1.4,atake:1.4}},
 wako:{kj:'倭寇',he:'שודדי הים',en:'Wakō raid',dh:'+2 תנועה ו־+15% התקפה',de:'+2 move and +15% attack',mv:2,atk:1.15},
 kachi:{kj:'鬨の声',he:'זעקת הקרב',en:'War Cry',dh:'+25% התקפה לכל היחידות',de:'+25% attack for all units',atk:1.25}};
function sjCoKey(side){try{if(side==='me'){const h=HEROES[S.hero];return h&&SJCO[h.id]?h.id:'kachi'}const fd=SJ&&SJ.ctx.fd;if(fd&&fd.sjHero&&SJCO[fd.sjHero])return fd.sjHero;
 const k=WAR&&WAR.docKey;if(k==='oda')return tYear()>=1575?'oda':'odaPike';if(k&&SJCO[k])return k;if(SJ&&SJ.sea)return'mori';return'kachi'}catch(e){return'kachi'}}
/* ---------- small helpers ---------- */
const sjK=(x,y)=>x+y*SJ_C;
const sjIn=(x,y)=>x>=0&&y>=0&&x<SJ_C&&y<SJ_R;
const sjD=(a,b,c,d)=>Math.abs(a-c)+Math.abs(b-d);
const sjTile=(x,y)=>SJ.map[y][x];
const sjAt=(x,y)=>SJ.units.find(u=>u.hp>0&&u.x===x&&u.y===y);
const sjOf=side=>SJ.units.filter(u=>u.hp>0&&u.side===side);
const sjFoe=side=>side==='me'?'foe':'me';
const sjHPd=u=>Math.max(0,Math.ceil(u.hp/10));
const sjLive=B=>SJ&&SJ===B&&!SJ.over;
const sjSum=side=>SJ.units.reduce((a,u)=>a+(u.side===side&&!SJU[u.t].st?Math.max(0,u.hp):0),0);
const sjName=t=>sjL(SJU[t].he,SJU[t].en);
const sjTName=k=>sjL(SJT[k].he,SJT[k].en);
function sjPow(side){const p=SJ.pow[side];return p?SJCO[p]:null}
/* ---------- the maps ---------- */
function sjGenField(R,M,x0,x1,river){
 const blob=(type,n,len,ok)=>{for(let i=0;i<n;i++){let x=x0+Math.floor(R()*(x1-x0+1)),y=Math.floor(R()*SJ_R);for(let j=0;j<len;j++){if(sjIn(x,y)&&ok(x,y))M[y][x]=type;const d=Math.floor(R()*4);x+=[1,-1,0,0][d];y+=[0,0,1,-1][d];x=clamp(x,x0,x1);y=clamp(y,0,SJ_R-1)}}};
 const free=(x,y)=>M[y][x]==='plain';
 if(river){let rc=4+(R()<.5?0:1);for(let y=0;y<SJ_R;y++){M[y][rc]='river';if(y<SJ_R-1&&R()<.4){const nc=clamp(rc+(R()<.5?-1:1),3,6);M[y][nc]='river';rc=nc}}
  const rows=[0,1,2,3,4,5,6,7].sort(()=>R()-.5);const cross=(y,t)=>{for(let x=0;x<SJ_C;x++)if(M[y][x]==='river')M[y][x]=t};cross(rows[0],'bridge');cross(rows[1],'bridge');cross(rows[2],'ford');if(R()<.5)cross(rows[3],'ford')}
 blob('paddy',3,5,(x,y)=>free(x,y));blob('forest',3,4,(x,y)=>free(x,y));blob('hill',2,3,(x,y)=>free(x,y));
 for(let i=0,n=0;i<30&&n<2;i++){const x=3+Math.floor(R()*4),y=Math.floor(R()*SJ_R);if(free(x,y)||M[y][x]==='paddy'){M[y][x]='village';n++}}}
function sjGenMap(kind,seed,castleSide){const R=rng(seed),M=Array.from({length:SJ_R},()=>Array(SJ_C).fill(kind==='sea'?'sea':'plain'));const hm=3+Math.floor(R()*2);const G={M,hq:{},gates:[],yagura:[],keep:null};
 if(kind==='sea'){
  for(let i=0;i<3;i++){let x=2+Math.floor(R()*6),y=Math.floor(R()*SJ_R);for(let j=0;j<4;j++){if(sjIn(x,y))M[y][x]='shoal';x=clamp(x+Math.floor(R()*3)-1,2,7);y=clamp(y+Math.floor(R()*3)-1,0,SJ_R-1)}}
  {let x=4+Math.floor(R()*2),y=1+Math.floor(R()*6);M[y][x]='island';const d=Math.floor(R()*4);const nx=x+[1,-1,0,0][d],ny=y+[0,0,1,-1][d];if(sjIn(nx,ny)&&nx>2&&nx<7)M[ny][nx]='island'}
  for(let i=0;i<2;i++){const x=3+Math.floor(R()*4),y=Math.floor(R()*SJ_R);if(M[y][x]==='sea')M[y][x]='reef'}
  M[hm][0]='port';M[hm][SJ_C-1]='port';G.hq={me:[0,hm],foe:[SJ_C-1,hm]};return G}
 if(kind==='siege'){const mir=castleSide==='me',X=x=>mir?SJ_C-1-x:x;
  sjGenField(R,M,mir?4:0,mir?9:5,false);
  const g1=2+Math.floor(R()*2),g2=5+Math.floor(R()*2),mid=Math.round((g1+g2)/2);
  for(let y=0;y<SJ_R;y++){M[y][X(6)]='moat';M[y][X(7)]='wall';M[y][X(8)]='castle';M[y][X(9)]='castle'}
  for(const g of[g1,g2]){M[g][X(6)]='bridge';M[g][X(7)]='gate';G.gates.push([X(7),g])}
  for(const y of[g1-1,g2+1])if(y>=0&&y<SJ_R&&M[y][X(7)]==='wall')G.yagura.push([X(7),y]);
  M[mid][X(9)]='tenshu';G.keep=castleSide;
  const oh=3+Math.floor(R()*2);M[oh][X(0)]='honjin';
  G.hq=mir?{me:[X(9),mid],foe:[X(0),oh]}:{me:[0,oh],foe:[9,mid]};
  for(let y=0;y<SJ_R;y++)for(const x of[X(4),X(5)])if(M[y][x]==='village')M[y][x]='plain';
  return G}
 sjGenField(R,M,1,8,true);M[hm][0]='honjin';M[hm][SJ_C-1]='honjin';G.hq={me:[0,hm],foe:[SJ_C-1,hm]};
 if(kind==='rank'){for(const[dx,dy]of[[0,-1],[0,1],[-1,0]]){const x=SJ_C-1+dx,y=hm+dy;if(sjIn(x,y))M[y][x]='castle'}G.keep='foe'}
 for(let y=0;y<SJ_R;y++)for(const x of[0,SJ_C-1])if(M[y][x]==='village')M[y][x]='plain';
 return G}
/* ---------- the armies ---------- */
function sjWeights(side){const w={};const add=(k,v)=>{if(v>0)w[k]=(w[k]||0)+v};const yr=tYear();
 if(SJ.sea){if(side==='me'){const n=S.navy||0;add('seki',1+.6*n);add('kobaya',1+.3*Math.min(10,S.boats||0));if(n>=2)add('atake',.35*n)}
  else{const k=WAR.docKey;if(k==='wako'){add('kobaya',3);add('seki',2);add('atake',.5)}else if(k==='mori'){add('seki',3);add('kobaya',2);add('atake',1.5)}else if(SJ.ctx.kind==='foreign'){add('atake',2);add('seki',2);add('kobaya',1)}else{add('seki',2);add('kobaya',2);add('atake',1)}}
  return w}
 if(side==='me'){const A=S.arm||{};add('yari',3+.6*(A.yari||0)+.4*(A.gusoku||0));add('yumi',2+.6*(A.yumi||0));
  if(bl('stables')>0||fa('horse')>4)add('kiba',1+.5*bl('stables')+Math.min(3,fa('horse')/6));
  add('sam',Math.min(3,(S.clan.ret||[]).length)*.9+(S.level>=10?.5:0));
  if(yr>=1543&&(A.gun||0)>0)add('teppo',1+.7*A.gun);
  if(yr>=1576&&S.tech&&S.tech.done&&S.tech.done.includes('ozutsu'))add('ozutsu',SJ.kind==='siege'&&SJ.keepSide==='foe'?1.4:.7);
  return w}
 const fd=SJ.ctx.fd||{};if(fd.sjWr){const r=fd.sjWr;for(const k of['yari','yumi','teppo','kiba','sam','ozutsu'])add(k,r[k]||0);if(!Object.keys(w).length)add('yari',3);if(yr<1543)delete w.teppo;return w}
 const k=WAR.docKey,pool=k==='takeda'||k==='date'?'kkyky skkyy':k==='oda'||k==='spain'?'yyyyy kspyy':k==='ikko'?'mmymm ympmy':k==='siam'?'ppppp ypspp':k==='ming'?'pypyp ykpyp':k==='joseon'?'yypyy pkyps':k==='mongol'?'kykpk ykskk':'pypks ypkyp';
 const map={p:'yari',y:'yumi',k:'kiba',s:'sam',m:'monk'};for(const ch of pool)if(map[ch])add(map[ch],1);
 if(yr>=1543){const g=k==='oda'||k==='spain'?.6:k==='ming'?.4:Math.min(.4,(fd.level||1)/80);if(w.yumi){const mv=w.yumi*g;w.yumi-=mv;add('teppo',mv)}}
 if(yr>=1576&&(k==='spain'||SJ.ctx.kind==='empire'))add('ozutsu',.6);
 return w}
function sjPick(w,n){const keys=Object.keys(w).filter(k=>w[k]>0);if(!keys.length)return Array(n).fill('yari');const tot=keys.reduce((a,k)=>a+w[k],0),cnt={},rem=[];let used=0;
 for(const k of keys){const q=w[k]/tot*n;cnt[k]=Math.floor(q);used+=cnt[k];rem.push([q-cnt[k],k])}rem.sort((a,b)=>b[0]-a[0]);for(let i=0;used<n;i=(i+1)%rem.length){cnt[rem[i][1]]++;used++}
 if(cnt.ozutsu>2){cnt.yari=(cnt.yari||0)+cnt.ozutsu-2;cnt.ozutsu=2}if(cnt.atake>3){cnt.seki=(cnt.seki||0)+cnt.atake-3;cnt.atake=3}
 const out=[];for(const k of keys)for(let i=0;i<cnt[k];i++)out.push(k);return out}
/* power decides the numbers: the side with more men brings more and fuller units, never past ten */
function sjBudget(my,foe){const r=clamp(my/Math.max(1,foe),.2,5);let a=70*Math.sqrt(r),b=70/Math.sqrt(r);const top=Math.max(a,b);if(top>100){a*=100/top;b*=100/top}return[clamp(Math.round(a/5)*5,20,100),clamp(Math.round(b/5)*5,20,100)]}
function sjSlots(side,G){const rows=[3,4,2,5,1,6,0,7],M=G.M;
 if(SJ.kind==='siege'&&G.keep===side){const mir=side==='me',inner=[],outer=[];for(const y of rows){for(const x of mir?[1,0]:[8,9])if(M[y][x]==='castle')inner.push([x,y]);for(const x of mir?[4,5]:[5,4])outer.push([x,y])}return{inner,outer}}
 const X=c=>side==='me'?c:SJ_C-1-c,front=rows.map(y=>[X(2),y]),back=rows.map(y=>[X(1),y]).concat(rows.map(y=>[X(0),y]));return{inner:back,outer:front.concat(back)}}
function sjDeploy(side,types,G){const hq=G.hq[side],U=SJ.units;const taken=(x,y)=>U.some(u=>u.x===x&&u.y===y);
 const gt=SJ.sea?'flag':'gen';U.push(sjMk(side,gt,hq[0],hq[1],100));
 const sl=sjSlots(side,G);const can=(t,x,y)=>sjIn(x,y)&&!taken(x,y)&&sjCost({t,side},SJ.map[y][x])<99;
 const order=types.slice().sort((a,b)=>(SJU[a].r[1]>1?1:0)-(SJU[b].r[1]>1?1:0));
 for(const t of order){const ranged=SJU[t].r[1]>1;let pool=ranged?sl.inner.concat(sl.outer):sl.outer.concat(sl.inner);if(t==='kiba')pool=pool.slice().sort((a,b)=>Math.abs(b[1]-3.5)-Math.abs(a[1]-3.5));
  let p=pool.find(q=>can(t,q[0],q[1]));if(!p){for(let c=0;c<SJ_C&&!p;c++)for(let y=0;y<SJ_R&&!p;y++){const x=side==='me'?c:SJ_C-1-c;if(can(t,x,y))p=[x,y]}}if(p)U.push(sjMk(side,t,p[0],p[1],100))}}
let SJ_ID=0;
function sjMk(side,t,x,y,hp){return{id:++SJ_ID,side,t,x,y,px:x,py:y,hp,done:false,moved:false,gen:t==='gen'||t==='flag',ph:Math.random()*6}}
/* ---------- the rules ---------- */
function sjCost(u,tk){const U=SJU[u.t],T=SJT[tk];if(!U||!T||!U.mt||U.mt==='none')return 99;const c=T.mv[U.mt];if(c==null)return 99;const p=SJ&&SJ.pow&&sjPow(u.side);return p&&p.terr1?1:c}
function sjMove(u){const p=sjPow(u.side);let m=SJU[u.t].mv;if(p){m+=(p.mv||0)+((p.mvT&&p.mvT[u.t])||0)}if(S&&S.wx==='snow'&&!SJ.sea)m-=u.t==='kiba'?1:0;return Math.max(1,m)}
function sjRange(u,x,y){const U=SJU[u.t];let[a,b]=U.r;if(u.t==='atake'&&tYear()<1543)b=1;if(b>1&&!SJ.sea&&SJT[sjTile(x,y)].high)b++;const p=sjPow(u.side);if(p&&p.rngT&&p.rngT[u.t]){b+=p.rngT[u.t];if(a<1)a=1}return[a,b]}
function sjStars(u){if(SJU[u.t].st)return 0;let s=SJT[sjTile(u.x,u.y)].st;const p=sjPow(u.side);if(p&&p.coverSt&&SJT[sjTile(u.x,u.y)].cover)s+=p.coverSt;return s}
function sjReach(u){const res=new Map();if(SJU[u.t].st)return res.set(sjK(u.x,u.y),{c:0,p:-1}),res;const mv=sjMove(u);res.set(sjK(u.x,u.y),{c:0,p:-1});const q=[[0,u.x,u.y]];
 while(q.length){q.sort((a,b)=>a[0]-b[0]);const[c,x,y]=q.shift();if(c>res.get(sjK(x,y)).c)continue;
  for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(!sjIn(nx,ny))continue;const o=sjAt(nx,ny);if(o&&o.side!==u.side)continue;const cc=c+sjCost(u,sjTile(nx,ny));if(cc>mv)continue;const k=sjK(nx,ny),e=res.get(k);if(!e||cc<e.c){res.set(k,{c:cc,p:sjK(x,y)});q.push([cc,nx,ny])}}}
 for(const[k]of res){const x=k%SJ_C,y=(k/SJ_C)|0;const o=sjAt(x,y);if(o&&o!==u&&(o.side===u.side))res.get(k).pass=1}return res}
function sjPath(reach,k){const p=[];while(k!=null&&k>=0){p.unshift([k%SJ_C,(k/SJ_C)|0]);const e=reach.get(k);k=e?e.p:-1}return p}
function sjCanHit(a,d){if(!d||d.hp<=0||d.side===a.side)return false;return SJB[a.t]&&SJB[a.t][d.t]!=null}
function sjTargets(u,x,y,moved){if(SJU[u.t].still&&moved)return[];const[a,b]=sjRange(u,x,y);return SJ.units.filter(d=>sjCanHit(u,d)&&(()=>{const r=sjD(x,y,d.x,d.y);return r>=a&&r<=b})())}
function sjLuck(){try{return clamp(1+(LK().dmg||0)-.08*curse()+.05*goodKarma(),.7,1.3)}catch(e){return 1}}
function sjAtkMul(a,ax,ay){let m=1;const D=WAR&&WAR.doc,f=sjFam(a.t),w=WX();
 if(!SJ.sea){if(a.t==='teppo')m*=w.gun;else if(a.t==='yumi')m*=w.arrows;else if(a.t==='kiba')m*=w.charge}
 if(a.side==='me'){if(f)m*=Math.min(1.45,Math.sqrt(tacBonus(f)));m*=SJ.luck;if(D){if(D.gunWeak&&a.t==='yumi')m*=1.25;if(D.flank&&a.t==='kiba')m*=1.2;if(D.tough)m*=D.tough}}
 else if(D){if(f&&D.mul&&D.mul[f])m*=Math.sqrt(D.mul[f]);if(D.grow)m*=1+D.grow*.5*(SJ.day-1);if(D.first&&SJ.day===1)m*=Math.sqrt(D.first);if(D.feint)m*=SJ.day===1?.8:SJ.day===2?1.3:1;if(D.naval&&SJ.sea)m*=Math.sqrt(D.naval)}
 const p=sjPow(a.side);if(p){m*=p.atk||1;if(p.atkT&&p.atkT[a.t])m*=p.atkT[a.t];if(p.coverAtk&&SJT[sjTile(ax,ay)].cover)m*=p.coverAtk}
 return m}
function sjWallMul(d){const T=SJT[sjTile(d.x,d.y)];if(!T.keep||SJ.keepSide!==d.side)return 1;try{return Math.sqrt(clamp(defMul(d.side),.4,1))}catch(e){return .87}}
function sjDmg(a,d,ax,ay,ahp,exp){const B=SJB[a.t]&&SJB[a.t][d.t];if(B==null)return 0;const hpA=Math.ceil((ahp==null?a.hp:ahp)/10);if(hpA<=0)return 0;
 let v=B*sjAtkMul(a,ax,ay)*hpA/10*(1-.1*sjStars(d)*sjHPd(d)/10)*sjWallMul(d);const p=sjPow(d.side);if(p&&p.def)v*=p.def;if(!exp)v*=rnd(.92,1.08);return Math.max(SJU[d.t].st?1:0,Math.round(v))}
function sjCanCtr(d,a,ax,ay){if(d.hp<=0||SJU[d.t].noc)return false;if(SJU[d.t].st&&d.t!=='yagura')return false;const pa=sjPow(a.side);if(pa&&pa.noc)return false;if(!sjCanHit(d,a))return false;const[r0,r1]=sjRange(d,d.x,d.y),r=sjD(ax,ay,d.x,d.y);return r>=r0&&r<=r1}
function sjForecast(a,d,ax,ay){const pd=sjPow(d.side),first=pd&&pd.first&&sjCanCtr(d,a,ax,ay);let ahp=a.hp,dhp=d.hp,c=0,h=0;
 if(first){c=Math.round(sjDmg(d,a,d.x,d.y,dhp,1)*(pd.ctr||1));ahp=Math.max(0,ahp-c)}
 h=sjDmg(a,d,ax,ay,ahp,1);dhp=Math.max(0,dhp-h);if(!first&&dhp>0&&sjCanCtr(d,a,ax,ay))c=Math.round(sjDmg(d,a,d.x,d.y,dhp,1)*((pd&&pd.ctr)||1));return{h:Math.min(h,d.hp),c:Math.min(c,a.hp),first}}
/* ---------- the battle ---------- */
function sjKind(ctx){if(ctx.naval)return'sea';if(ctx.kind==='rank')return'rank';const def=WAR.defender;const h=Math.abs(hashStr(String(ctx.id||ctx.place||'x')+(S.clan.day||0)));
 if(def==='foe'){if(ctx.kind==='empire')return'siege';const c=ctx.kind==='city'&&CITIES.find(x=>x.id===ctx.id);if(c&&c.fort)return'siege';return h%5<3?'siege':'field'}
 if(def==='me')return h%2?'siege':'field';return'field'}
async function sjStart(){const ctx=WAR.ctx;try{document.querySelectorAll('#sjOv').forEach(e=>e.remove())}catch(e){}
 const kind=sjKind(ctx),seed=Math.abs(hashStr(String(ctx.place||'')+(ctx.id||'')+(S.clan.day||0)+(S.wins||0)));
 SJ={ctx,kind,sea:kind==='sea',units:[],day:1,turn:null,first:WAR.defender==='me'?'foe':'me',sel:null,st:'idle',meter:{me:0,foe:0},pow:{me:null,foe:null},fx:[],vs:null,cut:null,ban:null,over:false,spd:1,auto:{me:!!S.autoFight,foe:true},acted:0,rec:{a:0,n:0},t0:performance.now(),hover:null,luck:sjLuck(),log:[]};
 const castleSide=kind==='siege'?(WAR.defender==='me'?'me':'foe'):null;
 const G=sjGenMap(kind,seed,castleSide);SJ.map=G.M;SJ.hq=G.hq;SJ.keepSide=G.keep||null;
 SJ.co={me:sjCoKey('me'),foe:sjCoKey('foe')};
 const[bm,bf]=sjBudget(WAR.my.max,WAR.foe.max);
 const nMe=Math.max(1,Math.ceil((bm-10)/10)),nFoe=Math.max(1,Math.ceil((bf-10)/10));
 sjDeploy('me',sjPick(sjWeights('me'),nMe),G);sjDeploy('foe',sjPick(sjWeights('foe'),nFoe),G);
 const trim=(side,b)=>{let over=sjSum(side)-b;const us=sjOf(side).filter(u=>!u.gen&&!SJU[u.t].st).reverse();for(const u of us){if(over<=0)break;const cut=Math.min(over,u.hp-10);u.hp-=cut;over-=cut}};trim('me',bm*10);trim('foe',bf*10);
 for(const[x,y]of G.gates)SJ.units.push(sjMk(castleSide,'gate',x,y,100));for(const[x,y]of G.yagura)SJ.units.push(sjMk(castleSide,'yagura',x,y,100));
 SJ.start={me:sjSum('me'),foe:sjSum('foe')};
 try{S.sjPend={p:String(ctx.place||'').slice(0,40),t:Date.now()};save()}catch(e){}
 sjBuildUI();sjTerrainCache();sjLoopDraw();
 const intro=SJ.kind==='siege'?(SJ.keepSide==='foe'?sjL('城攻め · שבור שער, הפל את המפקד בטנשו','城攻め · Break a gate, bring down the commander in the keep'):sjL('籠城 · החזק את הטירה עד היום השמיני','籠城 · Hold the castle to the eighth day')):SJ.sea?sjL('海戦 · הטבע את ספינת הדגל שלהם','海戦 · Sink their flagship'):sjL('合戦 · הפל את המפקד שלהם או שבור את הצבא','合戦 · Bring down their commander or break their army');
 SJ.ban={t:intro,c:'#ffe39a',life:2.2,big:0};try{sfx('gong')}catch(e){}
 if(S.autoFight){SJ.spd=14}
 await sjWait(S.autoFight?300:1300);
 try{S.seenHelp=S.seenHelp||{};if(!S.autoFight&&!S.seenHelp.senjo){S.seenHelp.senjo=1;save();sjHelp();while(document.getElementById('sjHelpOv'))await wait(200)}}catch(e){}
 sjRun()}
function sjWait(ms){return new Promise(r=>setTimeout(r,Math.max(8,ms/((SJ&&SJ.spd)||1))))}
async function sjRun(){const B=SJ;try{let side=SJ.first;
 while(sjLive(B)){await sjBeginTurn(side);if(SJ.over)break;
  if(SJ.auto[side])await sjAITurn(side);else await sjPlayerTurn();
  if(!sjLive(B))break;for(const u of sjOf(side)){u.done=false;u.moved=false}
  side=sjFoe(side);if(side===SJ.first){SJ.day++;if(WAR)WAR.round=SJ.day-1;if(SJ.day>SJ_DAYS){sjTimeUp();break}}}
 }catch(e){console.warn('senjo',e);if(SJ&&!SJ.over)sjFinish({win:sjSum('me')/SJ.start.me>sjSum('foe')/SJ.start.foe,why:'time'})}}
async function sjBeginTurn(side){SJ.turn=side;SJ.sel=null;SJ.st='idle';SJ.peek=null;
 if(SJ.pow[side]){SJ.pow[side]=null}
 for(const u of sjOf(side)){u.done=false;u.moved=false;const T=SJT[sjTile(u.x,u.y)];if(T.heal&&u.hp<100&&!SJU[u.t].st&&!(T===SJT.honjin&&sjHQOwner(u.x,u.y)!==side)){u.hp=Math.min(100,u.hp+T.heal);sjFx(u.x,u.y,'+'+(T.heal/10),'#9ef08a')}}
 const mine=side==='me';SJ.ban={t:mine?sjL(`יום ${SJ.day} · התור שלך`,`Day ${SJ.day} · Your turn`):sjL(`יום ${SJ.day} · תור האויב`,`Day ${SJ.day} · Enemy turn`),c:mine?'#8fd0ff':'#ff9a7a',life:1.1};
 sjHud();try{sfx('banner')}catch(e){}await sjWait(mine&&!SJ.auto.me?650:420)}
function sjHQOwner(x,y){for(const s of['me','foe']){const h=SJ.hq[s];if(h&&h[0]===x&&h[1]===y)return s}return null}
function sjPlayerTurn(){return new Promise(res=>{SJ.endP=res;SJ.st='idle';sjHud()})}
/* ---------- doing things ---------- */
async function sjMoveAnim(u,path){if(path.length<2){return}for(let i=1;i<path.length;i++){const[x,y]=path[i];const sx=u.px,sy=u.py,t0=performance.now(),dur=110/(SJ.spd||1);
  await new Promise(r=>{const st=()=>{const k=Math.min(1,(performance.now()-t0)/dur);u.px=sx+(x-sx)*k;u.py=sy+(y-sy)*k;if(k<1)requestAnimationFrame(st);else r()};if(dur<12){u.px=x;u.py=y;r()}else requestAnimationFrame(st)});
  if(i%2===1)try{sfx('step')}catch(e){}}
 const l=path[path.length-1];u.x=u.px=l[0];u.y=u.py=l[1];u.moved=true}
function sjFx(x,y,t,c){SJ.fx.push({x,y,t,c,life:1})}
function sjHit(d,v){const p=sjPow(d.side);let hp=d.hp-v;if(p&&p.undying&&!SJU[d.t].st)hp=Math.max(10,hp);d.hp=Math.max(0,hp)}
async function sjAttack(a,d){const ax=a.x,ay=a.y,a0=a.hp,d0=d.hp,pd=sjPow(d.side),first=pd&&pd.first&&sjCanCtr(d,a,ax,ay);let c=0,h=0;
 if(first){c=Math.round(sjDmg(d,a,d.x,d.y,d.hp)*(pd.ctr||1));sjHit(a,c)}
 if(a.hp>0){h=sjDmg(a,d,ax,ay);sjHit(d,h)}
 if(!first&&d.hp>0&&sjCanCtr(d,a,ax,ay)){c=Math.round(sjDmg(d,a,d.x,d.y)*((pd&&pd.ctr)||1));sjHit(a,c)}
 const dealt=d0-d.hp,taken=a0-a.hp;SJ.acted++;if(a.side==='me')SJ.rec.a++;
 for(const[s,v]of[[a.side,dealt*.55+taken*.75],[d.side,taken*.55+dealt*.75]])if(!SJ.pow[s])SJ.meter[s]=Math.min(SJ_PMAX,SJ.meter[s]+v);
 await sjClash(a,d,a0,a.hp,d0,d.hp,first);
 if(dealt)sjFx(d.x,d.y,'-'+Math.max(1,Math.round(dealt/10)),'#ffb35a');if(taken)sjFx(a.x,a.y,'-'+Math.max(1,Math.round(taken/10)),'#ff8a6a');
 for(const u of[a,d])if(u.hp<=0){sjFx(u.x,u.y,u.gen?sjL('נפל!','Fallen!'):'✕','#fff');if(u.t==='gate')SJ.map[u.y][u.x]='castle'}
 sjHud();sjCheck()}
function sjCheck(){if(SJ.over)return true;for(const s of['me','foe']){const g=SJ.units.find(u=>u.side===s&&u.gen);if(g&&g.hp<=0){sjFinish({win:s==='foe',why:'gen'});return true}
  const th=s==='foe'&&WAR.doc&&WAR.doc.norout?.05:.15;if(sjSum(s)<=SJ.start[s]*th||!sjOf(s).some(u=>!SJU[u.t].st)){sjFinish({win:s==='foe',why:'rout'});return true}}return false}
function sjTimeUp(){const fm=sjSum('me')/SJ.start.me,ff=sjSum('foe')/SJ.start.foe,att=WAR.defender==='foe'?'me':WAR.defender==='me'?'foe':null,d=fm-ff;
 sjFinish({win:att==='me'?d>.03:att==='foe'?d>-.03:d>0,why:'time'})}
async function sjActivate(side){const k=SJ.co[side],P=SJCO[k];if(!P||SJ.pow[side]||SJ.meter[side]<SJ_PMAX)return;SJ.meter[side]=0;SJ.pow[side]=k;
 SJ.cut={side,k,life:1};try{sfx('gong')}catch(e){}
 if(P.heal)for(const u of sjOf(side))if(!SJU[u.t].st&&u.hp>0){u.hp=Math.min(100,u.hp+P.heal);sjFx(u.x,u.y,'+'+P.heal/10,'#9ef08a')}
 if(P.trap)for(const u of sjOf(sjFoe(side)))if(!SJU[u.t].st){u.hp=Math.max(10,u.hp-P.trap);sjFx(u.x,u.y,'-'+P.trap/10,'#ff8a6a')}
 sjHud();await sjWait(1500);SJ.cut=null}
/* ---------- the enemy general thinks ---------- */
function sjThreat(side){const map=new Map();for(const e of sjOf(sjFoe(side))){if(!SJB[e.t])continue;const reach=SJU[e.t].still||SJU[e.t].st?new Map([[sjK(e.x,e.y),{}]]):sjReach(e);const seen=new Set();
  for(const[k]of reach){const x=k%SJ_C,y=(k/SJ_C)|0;const o=sjAt(x,y);if(o&&o!==e)continue;const[a,b]=sjRange(e,x,y);for(let yy=Math.max(0,y-b);yy<=Math.min(SJ_R-1,y+b);yy++)for(let xx=Math.max(0,x-b);xx<=Math.min(SJ_C-1,x+b);xx++){const r=sjD(x,y,xx,yy);if(r<a||r>b)continue;seen.add(sjK(xx,yy))}}
  for(const k of seen){if(!map.has(k))map.set(k,[]);map.get(k).push(e)}}return map}
function sjFlow(side,mt){const dist=new Array(SJ_C*SJ_R).fill(1e9),q=[];const tgt=sjOf(sjFoe(side)).filter(u=>!(SJU[u.t].st&&u.t==='yagura'));
 for(const e of tgt)for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1],[0,0]]){const x=e.x+dx,y=e.y+dy;if(!sjIn(x,y))continue;const w=e.gen?0:e.t==='gate'?1:2;const k=sjK(x,y);if(w<dist[k]){dist[k]=w;q.push([w,x,y])}}
 const fake={t:{foot:'yari',horse:'kiba',heavy:'ozutsu',ship:'seki',hship:'atake'}[mt]||'yari',side};
 while(q.length){q.sort((a,b)=>a[0]-b[0]);const[c,x,y]=q.shift();if(c>dist[sjK(x,y)])continue;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(!sjIn(nx,ny))continue;let cc=sjCost(fake,sjTile(nx,ny));const o=sjAt(nx,ny);if(o&&o.t==='gate'&&o.side!==side)cc=3;if(cc>=99)continue;const k=sjK(nx,ny);if(c+cc<dist[k]){dist[k]=c+cc;q.push([c+cc,nx,ny])}}}
 return dist}
function sjUrg(side){const att=WAR.defender==='foe'?'me':WAR.defender==='me'?'foe':null,o=sjFoe(side);const need=att===side||(!att&&sjSum(side)/SJ.start[side]<=sjSum(o)/SJ.start[o]);return need?clamp((SJ.day-1)/(SJ_DAYS-2),0,1):0}
function sjAg(side){if(side==='me')return .7;const k=WAR.docKey,fd=SJ.ctx.fd||{};if(fd.sjWr&&fd.sjWr.ag!=null)return clamp(fd.sjWr.ag,.15,1);
 let a=SJ.keepSide==='foe'?.35:.72;if(k==='takeda'||k==='shimazu'||k==='uesugi'||k==='mongol'||k==='wako')a+=.15;if(k==='hojo'||k==='tokugawa')a-=.15;return clamp(a,.15,1)}
function sjBest(u,ctx){const U=SJU[u.t],side=u.side,foe=sjFoe(side);const reach=U.st?new Map([[sjK(u.x,u.y),{c:0,p:-1}]]):sjReach(u);
 const ag=ctx.ag,hold=SJ.keepSide===side&&SJ.day<=SJ_DAYS-2&&sjSum(side)/SJ.start[side]>=sjSum(foe)/SJ.start[foe]-.1;
 const flow=ctx.flow[U.mt]||(ctx.flow[U.mt]=sjFlow(side,U.mt));const hq=SJ.hq[side];let best=null;
 for(const[k,e]of reach){if(e.pass)continue;const x=k%SJ_C,y=(k/SJ_C)|0;const T=SJT[sjTile(x,y)];const moved=x!==u.x||y!==u.y;
  let pv=T.st*(u.gen?7:3.5);if(T.heal&&u.hp<70)pv+=12;if(T.keep&&SJ.keepSide===side)pv+=hold?7:3;
  const th=ctx.threat.get(k)||[];let dang=0;for(const en of th)dang+=(SJB[en.t]&&SJB[en.t][u.t]||0)*en.hp/100*(1-.1*T.st);
  pv-=dang*(u.gen?2.6:ctx.dw*(1.25-ag*.6)*(1-.75*ctx.urg))*U.c/12;
  if(u.gen){pv-=sjD(x,y,hq[0],hq[1])*(SJ.day>=SJ_DAYS-1?.5:2.5)}else if(!U.st){const d=flow[k];const w=(hold&&!ctx.urg?.5:(.6+ag*2.6))*(1+ctx.urg);pv-=Math.min(40,d)*w}
  const opts=[{v:pv-(dang>0&&!u.gen&&!U.st?(1-ctx.urg)*7*U.c/10:0),x,y,tg:null}];
  for(const d of sjTargets(u,x,y,moved||u.moved)){const f=sjForecast({...u,x,y},d,x,y);const kill=f.h>=d.hp;
   let v=f.h*SJU[d.t].c/10+(kill?SJU[d.t].c*2.4:0)+(d.gen?(kill?900:f.h*1.6):0)-f.c*U.c/10*.95;if(d.t==='gate')v=f.h*.9+(kill?40:0)+(SJ.keepSide===foe?12:0);if(d.t==='yagura')v*=.9;
   if(f.first&&f.c>=u.hp)v-=200;opts.push({v:v+pv+4,x,y,tg:d})}
  for(const o of opts)if(!best||o.v>best.v)best=o}
 return best?{...best,u}:{v:-1e9,u,x:u.x,y:u.y,tg:null}}
async function sjAITurn(side){const B0=SJ;if(SJ.meter[side]>=SJ_PMAX&&!SJ.pow[side])await sjActivate(side);
 const ctx={ag:sjAg(side),urg:sjUrg(side)};{const o=sjFoe(side),r=(sjSum(side)+1)/(sjSum(o)+1);ctx.dw=clamp(.16/Math.max(.6,r),.06,.22)}for(let g=0;g<40&&sjLive(B0);g++){const us=sjOf(side).filter(u=>!u.done&&(!SJU[u.t].st||u.t==='yagura'));if(!us.length)break;
  ctx.threat=sjThreat(side);ctx.flow={};let best=null;for(const u of us){const b=sjBest(u,ctx);if(!best||b.v>best.v)best=b}
  if(!best)break;const u=best.u;if(SJ.auto.me===false&&side==='me')break;
  if(best.x!==u.x||best.y!==u.y){const r=sjReach(u);await sjMoveAnim(u,sjPath(r,sjK(best.x,best.y)));if(side==='me')SJ.rec.n++}
  if(best.tg&&best.tg.hp>0&&sjLive(B0)){await sjWait(140);if(!sjLive(B0))return;await sjAttack(u,best.tg)}if(!sjLive(B0))return;u.done=true;sjHud();await sjWait(side==='me'?160:240)}}
/* ---------- the player's hands ---------- */
function sjZone(e){const set=new Set();const reach=SJU[e.t].still||SJU[e.t].st?new Map([[sjK(e.x,e.y),{}]]):sjReach(e);for(const[k]of reach){const x=k%SJ_C,y=(k/SJ_C)|0;const o=sjAt(x,y);if(o&&o!==e)continue;const[a,b]=sjRange(e,x,y);for(let yy=0;yy<SJ_R;yy++)for(let xx=0;xx<SJ_C;xx++){const r=sjD(x,y,xx,yy);if(r>=a&&r<=b)set.add(sjK(xx,yy))}}return set}
function sjSelect(u){SJ.peek=null;SJ.sel={u,ox:u.x,oy:u.y,reach:sjReach(u),aim:null};SJ.st='sel';try{sfx('step')}catch(e){}sjHud()}
function sjAttackFrom(u,reach,d){const ox=SJ.sel?SJ.sel.ox:u.x,oy=SJ.sel?SJ.sel.oy:u.y;let best=null;for(const[k,e]of reach){if(e.pass)continue;const x=k%SJ_C,y=(k/SJ_C)|0;if(SJU[u.t].still&&(x!==ox||y!==oy))continue;if(u.moved&&(x!==u.x||y!==u.y))continue;const[a,b]=sjRange(u,x,y),r=sjD(x,y,d.x,d.y);if(r<a||r>b)continue;
  const f=sjForecast({...u,x,y},d,x,y);const v=f.h-f.c+SJT[sjTile(x,y)].st*4-e.c*.5+(x===u.x&&y===u.y?3:0);if(!best||v>best.v)best={x,y,v}}return best}
async function sjTap(x,y){if(!SJ||SJ.over||SJ.turn!=='me'||SJ.auto.me||SJ.busy)return;const o=sjAt(x,y);SJ.hover=[x,y];
 if(SJ.st==='idle'){if(o&&o.side==='me'&&!o.done&&!SJU[o.t].st){SJ.peek=null;sjSelect(o)}else{SJ.peek=o&&o.side!=='me'&&SJB[o.t]?(SJ.peek&&SJ.peek.u===o?null:{u:o,tiles:sjZone(o)}):null;sjHud()}return}
 const sel=SJ.sel;if(!sel){SJ.st='idle';return}const u=sel.u;
 if(SJ.st==='aim'&&sel.aim&&o===sel.aim.d){return sjConfirm()}
 if(o&&o.side!=='me'&&sjCanHit(u,o)){const from=sjAttackFrom(u,SJ.st==='moved'?new Map([[sjK(u.x,u.y),{c:0}]]):sel.reach,o);if(from){sel.aim={d:o,x:from.x,y:from.y,f:sjForecast({...u,x:from.x,y:from.y},o,from.x,from.y)};SJ.st='aim';try{sfx('step')}catch(e){}sjHud();return}}
 if(SJ.st==='sel'||SJ.st==='aim'){if(o&&o.side==='me'&&o!==u&&!o.done&&!SJU[o.t].st&&!u.moved)return sjSelect(o);
  if(o===u&&!u.moved){sel.aim=null;await sjAfterMove(u);return}
  const e=sel.reach.get(sjK(x,y));if(e&&!e.pass&&!u.moved&&(!o||o===u)){sel.aim=null;SJ.busy=1;await sjMoveAnim(u,sjPath(sel.reach,sjK(x,y)));SJ.busy=0;SJ.rec.n++;await sjAfterMove(u);return}
  if(!u.moved){SJ.sel=null;SJ.st='idle';sjHud()}return}
 if(SJ.st==='moved'){sjHud()}}
async function sjAfterMove(u){u.moved=true;SJ.st='moved';const tg=sjTargets(u,u.x,u.y,u.x!==SJ.sel.ox||u.y!==SJ.sel.oy);if(!tg.length){sjDone(u);return}sjHud()}
function sjDone(u){u.done=true;SJ.sel=null;SJ.st='idle';sjHud();if(!sjOf('me').some(v=>!v.done&&!SJU[v.t].st))sjFlash(sjL('כל היחידות פעלו. סיים את התור.','All units have acted. End the turn.'))}
async function sjConfirm(){const sel=SJ.sel;if(!sel||!sel.aim||SJ.busy)return;const u=sel.u,a=sel.aim;SJ.busy=1;
 if(a.x!==u.x||a.y!==u.y){if(u.moved){SJ.busy=0;return}await sjMoveAnim(u,sjPath(sel.reach,sjK(a.x,a.y)));SJ.rec.n++}
 SJ.st='anim';sjHud();await sjAttack(u,a.d);SJ.busy=0;if(SJ.over)return;sjDone(u)}
function sjCancel(){const sel=SJ.sel;if(!sel||SJ.busy)return;const u=sel.u;if(SJ.st==='aim'&&sel.aim){sel.aim=null;SJ.st=u.moved?'moved':'sel';sjHud();return}
 if(u.moved&&!u.done){u.x=u.px=sel.ox;u.y=u.py=sel.oy;u.moved=false;SJ.rec.n=Math.max(0,SJ.rec.n-1);sjSelect(u);return}SJ.sel=null;SJ.st='idle';sjHud()}
let SJ_ENDT=0,SJ_RETT=0;
function sjEndTurn(){if(!SJ||SJ.turn!=='me'||SJ.busy||SJ.over)return;const left=sjOf('me').filter(u=>!u.done&&!SJU[u.t].st).length;
 if(left&&Date.now()-SJ_ENDT>2500){SJ_ENDT=Date.now();sjFlash(sjL(`${left} יחידות עוד לא פעלו. לחץ שוב כדי לסיים.`,`${left} units have not acted. Tap again to end.`));return}
 if(SJ.sel&&SJ.sel.u.moved)SJ.sel.u.done=true;SJ.sel=null;SJ.st='idle';const r=SJ.endP;SJ.endP=null;if(r)r()}
function sjRetreat(){if(!SJ||SJ.over||SJ.busy)return;if(Date.now()-SJ_RETT>2500){SJ_RETT=Date.now();sjFlash(sjL('נסיגה מאורגנת: מצילה חיילים, אבל המלחמה אבודה. לחץ שוב.','Ordered retreat: saves soldiers, but the war is lost. Tap again.'));return}
 sjFinish({win:false,why:'retreat'})}
function sjAutoTog(){if(!SJ||SJ.over)return;const B=SJ;B.auto.me=!B.auto.me;B.spd=B.auto.me?(S.autoFight?14:2.5):1;if(B.auto.me&&B.turn==='me'&&B.endP){(async()=>{while(SJ===B&&B.busy)await wait(40);if(SJ!==B||!B.endP||!B.auto.me)return;B.sel=null;B.st='idle';const r=B.endP;B.endP=null;await sjAITurn('me');r()})()}sjHud()}
async function sjPowBtn(){if(!SJ||SJ.turn!=='me'||SJ.busy||SJ.auto.me)return;if(SJ.meter.me<SJ_PMAX||SJ.pow.me)return;SJ.busy=1;await sjActivate('me');SJ.busy=0;sjHud()}
/* ---------- the end ---------- */
function sjFinish(res){if(!SJ||SJ.over)return;SJ.over=true;try{delete S.sjPend}catch(e){}const fm=sjSum('me')/Math.max(1,SJ.start.me),ff=sjSum('foe')/Math.max(1,SJ.start.foe);
 const rout=res.why==='gen'?.6:1;
 WAR.my.cur=Math.max(0,Math.round(WAR.my.max*fm*(!res.win&&res.why==='gen'?rout:1)));WAR.foe.cur=Math.max(0,Math.round(WAR.foe.max*ff*(res.win&&res.why==='gen'?rout:1)));
 WAR.kills=Math.max(0,Math.round((WAR.foe.max-WAR.foe.cur)*.6));SJ_LAST={win:!!res.win,why:res.why,day:SJ.day,fm:+fm.toFixed(2),ff:+ff.toFixed(2),my:WAR.my.max,foe:WAR.foe.max,kind:SJ.kind,ms:Math.round(performance.now()-SJ.t0)};WAR.round=SJ.acted?3:0;WAR.myT=WAR.foeT=null;
 try{const R=S.sjRec=S.sjRec||{n:0,ag:.6};const ag=clamp(SJ.rec.a/Math.max(1,SJ.rec.n+SJ.rec.a*.5),0,1);if(SJ.rec.n+SJ.rec.a>2){R.ag=+(R.ag*.7+ag*.3).toFixed(2);R.n=Math.min(999,(R.n||0)+1)}}catch(e){}
 const W=res.why==='retreat'?null:res.win;const txt=res.why==='retreat'?sjL('נסיגה','Retreat'):res.win?(res.why==='gen'?sjL('大将討ち取ったり! ניצחון','大将討ち取ったり! Victory'):sjL('勝利 · ניצחון','勝利 · Victory')):(res.why==='gen'?sjL('המפקד שלך נפל','Your commander has fallen'):sjL('敗北 · תבוסה','敗北 · Defeat'));
 SJ.ban={t:txt,c:W?'#ffcf5a':'#8fa8c8',life:2.4,big:1};try{sfx(W?'win':'ko')}catch(e){}
 const end=()=>{const o=document.getElementById('sjOv');if(o)o.remove();try{document.removeEventListener('keydown',SJ.key);const h=document.getElementById('sjHelpOv');if(h)h.remove()}catch(e){}cancelAnimationFrame(SJ&&SJ.raf);const w=res.why==='retreat'?false:!!res.win;const sj=SJ;SJ=null;if(WAR)WAR.busy=false;
  try{warEnd(w,res.why==='retreat'?{retreat:1}:{})}catch(e){console.warn('senjo end',e)}};
 setTimeout(end,S.autoFight?700:2000)}
/* ---------- drawing ---------- */
const SJ_COL={me:{b:'#27427a',f:'#ece4d2',r:'rgba(70,140,255,.38)',m:'#5aa0ff'},foe:{b:'#7a1e1a',f:'#141414',r:'rgba(255,70,50,.36)',m:'#ff6a4a'}};
function sjTerrainCache(){const c=mkCanvas(SJ_C*SJ_TS*2,SJ_R*SJ_TS*2),g=c.getContext('2d');g.scale(2,2);const R=rng(77);
 for(let y=0;y<SJ_R;y++)for(let x=0;x<SJ_C;x++)sjPaintTile(g,x*SJ_TS,y*SJ_TS,sjTile(x,y),R,x,y);
 g.strokeStyle='rgba(0,0,0,.13)';g.lineWidth=1;for(let x=0;x<=SJ_C;x++){g.beginPath();g.moveTo(x*SJ_TS+.5,0);g.lineTo(x*SJ_TS+.5,SJ_R*SJ_TS);g.stroke()}for(let y=0;y<=SJ_R;y++){g.beginPath();g.moveTo(0,y*SJ_TS+.5);g.lineTo(SJ_C*SJ_TS,y*SJ_TS+.5);g.stroke()}
 SJ.tc=c}
function sjPaintTile(g,X,Y,k,R,tx,ty){const T=SJ_TS,F=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(X+x,Y+y,w,h)};
 const grass=()=>{F('#6f9444',0,0,T,T);for(let i=0;i<10;i++)F(R()<.5?'#5f8438':'#82a650',R()*T,R()*T,2,2);if(R()<.4)F('#e8d36a',R()*T,R()*T,2,2)};
 const water=(a,b)=>{F(a,0,0,T,T);for(let i=0;i<5;i++)F(b,R()*(T-8),R()*T,8,1)};
 if(k==='plain'||k==='honjin'||k==='village'||k==='forest'||k==='hill')grass();
 if(k==='paddy'){F('#7a9a50',0,0,T,T);for(let r=0;r<2;r++)for(let c=0;c<2;c++){F('#7fa8b0',3+c*23,3+r*23,19,19);for(let i=0;i<9;i++)F('#5f9a3a',5+c*23+(i%3)*6,6+r*23+((i/3)|0)*6,2,3)}}
 if(k==='forest'){for(let i=0;i<4;i++){const cx=8+(i%2)*22+R()*6,cy=20+((i/2)|0)*18+R()*4;g.fillStyle='#2e3a1e';g.fillRect(X+cx-1,Y+cy,3,6);for(let j=0;j<3;j++){g.fillStyle=j===0?'#25502a':j===1?'#2e6232':'#3a7438';g.beginPath();g.moveTo(X+cx-10+j*2,Y+cy-j*6);g.lineTo(X+cx+11-j*2,Y+cy-j*6);g.lineTo(X+cx+.5,Y+cy-12-j*6);g.fill()}}}
 if(k==='hill'){g.fillStyle='#7c7a44';g.beginPath();g.ellipse(X+T/2,Y+T*.72,T*.46,T*.36,0,Math.PI,0);g.fill();g.fillStyle='#9a9658';g.beginPath();g.ellipse(X+T/2-4,Y+T*.66,T*.3,T*.24,0,Math.PI,0);g.fill();F('#6a6a6a',12,30,5,3);F('#7a7a7a',30,33,4,3)}
 if(k==='river'||k==='bridge'||k==='ford'){water('#3a6a9a','#6a9ac8');if(k==='ford'){for(let i=0;i<7;i++)F('#9a9078',4+R()*38,4+R()*38,5,4)}if(k==='bridge'){F('#6a4a2a',0,14,T,20);for(let i=0;i<8;i++)F('#8a6238',i*6,15,5,18);F('#4a2e18',0,12,T,3);F('#4a2e18',0,33,T,3)}}
 if(k==='village'){for(const[hx,hy]of[[6,10],[24,24]]){F('#d8c8a0',hx+2,hy+10,16,10);g.fillStyle='#8a6a3a';g.beginPath();g.moveTo(X+hx-2,Y+hy+11);g.lineTo(X+hx+22,Y+hy+11);g.lineTo(X+hx+10,Y+hy);g.fill();F('#3a2a1a',hx+8,hy+14,4,6)}}
 if(k==='honjin'){const side=sjHQOwner(tx,ty)||'me',col=SJ_COL[side];F('rgba(0,0,0,.18)',4,30,40,8);F('#ece4d2',4,16,40,16);for(let i=0;i<5;i++)F(i%2?'#ece4d2':'#cfc6b2',4+i*8,16,8,16);g.fillStyle=col.b;g.beginPath();g.arc(X+24,Y+24,5,0,7);g.fill();for(const bx of[6,40]){F('#2a1a12',bx,2,2,30);F(col.b,bx+2,3,6,14)}}
 if(k==='moat')water('#2a4a6a','#4a6a8a');
 if(k==='wall'){F('#6a6a6a',0,0,T,T);for(let r=0;r<6;r++)for(let c=0;c<4;c++)F(((r+c)%2)?'#7a7a78':'#626260',c*12+(r%2)*6,r*8,11,7);F('#ece8dc',0,0,T,9);F('#2a2a30',0,0,T,3)}
 if(k==='castle'||k==='gate'||k==='tenshu'){F('#bfb28c',0,0,T,T);for(let i=0;i<14;i++)F(R()<.5?'#aea27c':'#cfc39c',R()*T,R()*T,3,2)}
 if(k==='tenshu'){F('#ece8dc',12,22,24,22);F('#ece8dc',15,10,18,12);g.fillStyle='#2a2a30';for(const[y,w]of[[22,30],[10,24],[2,16]]){g.beginPath();g.moveTo(X+24-w/2-3,Y+y+2);g.lineTo(X+24+w/2+3,Y+y+2);g.lineTo(X+24+w/2-2,Y+y-4);g.lineTo(X+24-w/2+2,Y+y-4);g.fill()}F('#e6b450',22,0,4,3);F('#3a3a40',20,34,8,10)}
 if(k==='sea'||k==='shoal'||k==='reef'||k==='port'||k==='island'){water(k==='shoal'?'#3a8a9a':'#244a7a',k==='shoal'?'#7ac0c8':'#4a7aaa');if(k==='shoal')for(let i=0;i<4;i++)F('#c8b880',R()*40,R()*40,6,3);
  if(k==='reef')for(let i=0;i<4;i++){F('#3a3a3a',8+R()*28,8+R()*28,8,6);F('#ece8e0',6+R()*32,10+R()*28,6,1)}
  if(k==='island'){g.fillStyle='#d8c890';g.beginPath();g.ellipse(X+24,Y+26,20,16,0,0,7);g.fill();g.fillStyle='#5a8a40';g.beginPath();g.ellipse(X+24,Y+24,14,10,0,0,7);g.fill();F('#3a2a1a',23,10,2,10);g.fillStyle='#2e6232';g.beginPath();g.ellipse(X+24,Y+10,9,4,0,0,7);g.fill()}
  if(k==='port'){F('#6a4a2a',0,20,T,8);for(let i=0;i<4;i++)F('#4a2e18',4+i*12,28,3,10)}}}
function sjDrawUnit(g,u,t){const T=SJ_TS,cx=u.px*T+T/2,cy=u.py*T+T/2,col=SJ_COL[u.side]||SJ_COL.foe,me=u.side==='me';const dim=u.done&&SJ.turn===u.side;
 g.save();if(dim)g.globalAlpha=.55;
 if(SJU[u.t].st){if(u.t==='gate'){g.fillStyle='#4a2e18';g.fillRect(cx-16,cy-12,32,26);g.fillStyle='#6a4a2a';g.fillRect(cx-14,cy-10,13,22);g.fillRect(cx+1,cy-10,13,22);g.fillStyle='#222';for(let i=0;i<4;i++){g.fillRect(cx-12,cy-7+i*6,2,2);g.fillRect(cx+10,cy-7+i*6,2,2)}g.fillStyle='#2a2a30';g.fillRect(cx-20,cy-18,40,6)}
  else{g.fillStyle='#ece8dc';g.fillRect(cx-13,cy-14,26,26);g.fillStyle='#2a2a30';g.fillRect(cx-17,cy-18,34,5);g.fillRect(cx-6,cy-6,12,6)}
  g.fillStyle=col.m;g.fillRect(cx-16,cy+14,32,3)}
 else{g.fillStyle=me?'rgba(60,120,240,.35)':'rgba(230,60,40,.35)';g.beginPath();g.ellipse(cx,cy+14,19,6,0,0,7);g.fill();
  if(SJ.sea){const sz={atake:.48,seki:.4,kobaya:.32,flag:.52}[u.t]||.4;try{drawShip(g,cx,cy+8,me?1:-1,col.b,t,u.id,sz)}catch(e){}if(u.t==='flag'||u.t==='atake'){g.fillStyle='#2a1a12';g.fillRect(cx-1,cy-22,2,18);g.fillStyle=u.t==='flag'?'#e6b450':col.b;g.fillRect(cx+(me?1:-9),cy-22,8,10)}}
  else{g.translate(cx,cy+16);if(!me)g.scale(-1,1);const n=u.gen?1:u.hp>66?3:u.hp>33?2:1,kind=u.t==='ozutsu'?'cannon':u.t;
   const xs=n===1?[0]:n===2?[-7,7]:[-12,0,12];
   for(let i=0;i<n;i++){const s=u.gen?1.9:1.55;try{twMan(g,xs[i],(i%2)*2,s,col.b,(i===0&&(u.gen||u.t==='yari'||u.t==='sam'))?col.f:null,t,kind,i+u.id,false)}catch(e){}}
   if(u.gen){g.fillStyle='#2a1a12';g.fillRect(-14,-38,2,30);g.fillStyle=col.b;g.fillRect(-12,-38,9,14);g.fillStyle='#e6b450';g.fillRect(-9,-34,3,3)}
   if(u.t==='ozutsu'){g.fillStyle='#2a2a2a';g.fillRect(-4,-8,18,5);g.fillStyle='#5a3a1a';g.beginPath();g.arc(0,-2,4,0,7);g.fill()}}}
 g.restore();
 /* the number of strength, 1 to 10 */
 const hd=sjHPd(u);g.fillStyle='rgba(0,0,0,.78)';g.fillRect(cx+T/2-17,cy+T/2-15,16,14);g.fillStyle=hd>=7?'#fff':hd>=4?'#ffe08a':'#ff9a7a';g.font="bold 12px Rubik,sans-serif";g.textAlign='center';g.fillText(String(hd),cx+T/2-9,cy+T/2-4);
 g.fillStyle=col.m;g.fillRect(cx-T/2+2,cy-T/2+2,SJU[u.t].kj.length>1?20:12,11);g.fillStyle='#fff';g.font="9px 'Yuji Syuku',serif";g.fillText(SJU[u.t].kj,cx-T/2+(SJU[u.t].kj.length>1?12:8),cy-T/2+11);g.textAlign='left'}
function sjDraw(){if(!SJ||!SJ.cv)return;const g=SJ.g,T=SJ_TS,W=SJ_C*T,H=SJ_R*T,t=performance.now()/1000,dt=Math.min(.05,t-(SJ.lt||t));SJ.lt=t;
 g.setTransform(SJ.cv.width/W,0,0,SJ.cv.height/H,0,0);g.imageSmoothingEnabled=false;g.lineJoin='round';g.drawImage(SJ.tc,0,0,W,H);
 for(let y=0;y<SJ_R;y++)for(let x=0;x<SJ_C;x++){const k=sjTile(x,y);if(k==='river'||k==='moat'||k==='sea'||k==='shoal'||k==='ford'){g.fillStyle='rgba(220,240,255,.22)';for(let i=0;i<2;i++){const p=((t*.35+i*.5+(x*7+y*3)%10/10)%1);g.fillRect(x*T+p*(T-10),y*T+8+i*20+Math.sin(t*2+x)*2,10,1)}}}
 const sel=SJ.sel;
 if(SJ.peek&&SJ.peek.u.hp>0&&!sel){const p=.55+.25*Math.sin(t*4);for(const k of SJ.peek.tiles){const x=k%SJ_C,y=(k/SJ_C)|0;g.fillStyle=`rgba(255,90,40,${.22*p+.08})`;g.fillRect(x*T+1,y*T+1,T-2,T-2)}g.strokeStyle='#ff9a5a';g.lineWidth=2;g.strokeRect(SJ.peek.u.x*T+2,SJ.peek.u.y*T+2,T-4,T-4)}
 if(sel&&SJ.turn==='me'){if(SJ.st==='sel'||SJ.st==='aim'){for(const[k,e]of sel.reach){if(e.pass)continue;const x=k%SJ_C,y=(k/SJ_C)|0;g.fillStyle=SJ_COL.me.r;g.fillRect(x*T+1,y*T+1,T-2,T-2)}}
  const mv=SJ.st==='moved'||sel.u.moved;const tg=new Set();if(mv)for(const d of sjTargets(sel.u,sel.u.x,sel.u.y,sel.u.x!==sel.ox||sel.u.y!==sel.oy))tg.add(d);else for(const d of SJ.units)if(sjCanHit(sel.u,d)&&sjAttackFrom(sel.u,sel.reach,d))tg.add(d);
  for(const d of tg){const p=.5+.5*Math.sin(t*7);g.fillStyle=`rgba(255,60,40,${.25+.25*p})`;g.fillRect(d.x*T+1,d.y*T+1,T-2,T-2);g.strokeStyle='#ff5a3a';g.lineWidth=2;g.strokeRect(d.x*T+2,d.y*T+2,T-4,T-4)}
  if(sel.aim){const a=sel.aim;g.strokeStyle='#ffe39a';g.lineWidth=2;g.setLineDash([4,3]);g.strokeRect(a.x*T+3,a.y*T+3,T-6,T-6);g.setLineDash([]);sel.aimLbl=a}
  if(SJ.st==='sel'&&SJ.hover){const k=sjK(SJ.hover[0],SJ.hover[1]),e=sel.reach.get(k);if(e&&!e.pass){const p=sjPath(sel.reach,k);g.strokeStyle='rgba(255,240,180,.9)';g.lineWidth=4;g.lineCap='round';g.beginPath();p.forEach(([x,y],i)=>i?g.lineTo(x*T+T/2,y*T+T/2):g.moveTo(x*T+T/2,y*T+T/2));g.stroke()}}}
 if(SJ.hover&&!SJ.vs){const[x,y]=SJ.hover;g.strokeStyle='rgba(255,255,255,.85)';g.lineWidth=2;const L=10;for(const[ax,ay,dx,dy]of[[0,0,1,1],[T,0,-1,1],[0,T,1,-1],[T,T,-1,-1]]){g.beginPath();g.moveTo(x*T+ax,y*T+ay+dy*L);g.lineTo(x*T+ax,y*T+ay);g.lineTo(x*T+ax+dx*L,y*T+ay);g.stroke()}}
 const us=SJ.units.filter(u=>u.hp>0).sort((a,b)=>a.py-b.py);for(const u of us)sjDrawUnit(g,u,t);
 if(sel){const u=sel.u;g.strokeStyle='#ffe39a';g.lineWidth=2;g.strokeRect(u.px*T+1,u.py*T+1,T-2,T-2)}
 for(const f of SJ.fx){f.life-=dt*.9;const y=f.y*T+T/2-(1-f.life)*26;g.globalAlpha=clamp(f.life*2,0,1);g.font="bold 20px 'Suez One',serif";g.textAlign='center';g.lineWidth=4;g.strokeStyle='#000';g.strokeText(f.t,f.x*T+T/2,y);g.fillStyle=f.c;g.fillText(f.t,f.x*T+T/2,y);g.globalAlpha=1}SJ.fx=SJ.fx.filter(f=>f.life>0);
 if(sel&&SJ.st==='aim'&&sel.aim){const a=sel.aim,d=a.d,lx=clamp(d.x*T+T/2,42,W-42),ly=d.y*T-6<22?d.y*T+T+20:d.y*T-6;g.fillStyle='rgba(0,0,0,.85)';g.fillRect(lx-40,ly-17,80,22);g.strokeStyle='#ffe39a';g.lineWidth=1.5;g.strokeRect(lx-40,ly-17,80,22);g.font="bold 13px Rubik,sans-serif";g.textAlign='center';g.fillStyle='#ffb35a';g.fillText(`⚔${a.f.h}%`,lx-18,ly-1);g.fillStyle='#ff8a6a';g.fillText(`↩${a.f.c}%`,lx+20,ly-1);g.textAlign='left'}
 if(SJ.vs)sjDrawVS(g,W,H,dt);
 if(SJ.cut)sjDrawCut(g,W,H,dt);
 if(SJ.ban){SJ.ban.life-=dt;if(SJ.ban.life>0){const b=SJ.ban,al=clamp(b.life*2.5,0,1);g.globalAlpha=al*.8;g.fillStyle='#000';g.fillRect(0,H/2-(b.big?34:22),W,b.big?68:44);g.globalAlpha=al;g.font=(b.big?"34px":"20px")+" 'Suez One',serif";g.textAlign='center';g.lineWidth=5;g.strokeStyle='#000';g.strokeText(b.t,W/2,H/2+(b.big?12:7));g.fillStyle=b.c;g.fillText(b.t,W/2,H/2+(b.big?12:7));g.globalAlpha=1;g.textAlign='left'}else SJ.ban=null}}
function sjLoopDraw(){if(!SJ)return;try{sjDraw()}catch(e){console.warn('senjo draw',e)}SJ.raf=requestAnimationFrame(sjLoopDraw)}
/* the split screen: your men on the left facing right, theirs on the right facing left */
function sjClash(a,d,a0,a1,d0,d1,first){if(!SJ)return Promise.resolve();const me=a.side==='me'?a:d,fo=a.side==='me'?d:a;
 const v={a,d,me,fo,hp:{[a.id]:[a0,a1],[d.id]:[d0,d1]},t:0,first,ctr:a1<a0,dur:(a1<a0||first?1.75:1.2)};
 if(S.autoFight&&SJ.spd>8){return sjWait(220)}
 SJ.vs=v;try{sfx(SJU[a.t].r[1]>1?'swish':'clang')}catch(e){}
 return new Promise(r=>{v.done=r})}
function sjSkipVS(){if(SJ&&SJ.vs)SJ.vs.t=SJ.vs.dur}
function sjVSBack(g,x0,w,H,tk,mirror,t){const T=SJT[tk]||SJT.plain;const sky=g.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#3a4a7a');sky.addColorStop(.5,'#d89a6a');sky.addColorStop(.52,'#6f9444');sky.addColorStop(1,'#46642a');
 g.fillStyle=sky;g.fillRect(x0,0,w,H);const gy=H*.52;{const ph=mirror?1.7:0;g.fillStyle='rgba(60,50,90,.55)';g.beginPath();g.moveTo(x0,gy);for(let i=0;i<=8;i++){const x=x0+i*w/8;g.lineTo(x,gy-30-Math.abs(Math.sin(i*1.3+ph))*46)}g.lineTo(x0+w,gy);g.fill();g.fillStyle='rgba(40,40,70,.6)';g.beginPath();g.moveTo(x0,gy);for(let i=0;i<=6;i++){const x=x0+i*w/6;g.lineTo(x,gy-12-Math.abs(Math.sin(i*2.1+ph+1))*24)}g.lineTo(x0+w,gy);g.fill();g.fillStyle='rgba(255,236,210,.35)';for(let i=0;i<3;i++){const cx=x0+((i*97+t*6)%(w+80))-40;g.fillRect(cx,40+i*26,60,6);g.fillRect(cx+12,34+i*26,34,6)}}
 if(SJ.sea||tk==='sea'||tk==='shoal'||tk==='port'||tk==='reef'||tk==='island'){g.fillStyle='#2a5a8a';g.fillRect(x0,gy,w,H-gy);g.fillStyle='rgba(255,255,255,.35)';for(let i=0;i<12;i++)g.fillRect(x0+((i*53+t*30*(mirror?-1:1))%w+w)%w,gy+10+(i*29)%(H-gy-14),18,2);return}
 if(tk==='paddy'){g.fillStyle='#7fa8b0';for(let i=0;i<5;i++)g.fillRect(x0,gy+14+i*24,w,10)}
 if(tk==='forest'){for(let i=0;i<7;i++){const x=x0+12+i*w/7,h=60+(i*37)%30;g.fillStyle='#25502a';g.beginPath();g.moveTo(x-18,gy+4);g.lineTo(x+18,gy+4);g.lineTo(x,gy-h);g.fill()}}
 if(tk==='hill'){g.fillStyle='#7c7a44';g.beginPath();g.ellipse(x0+w/2,gy+30,w*.7,70,0,Math.PI,0);g.fill()}
 if(tk==='village'){for(let i=0;i<3;i++){const x=x0+20+i*w/3;g.fillStyle='#d8c8a0';g.fillRect(x,gy-26,44,26);g.fillStyle='#8a6a3a';g.beginPath();g.moveTo(x-6,gy-24);g.lineTo(x+50,gy-24);g.lineTo(x+22,gy-48);g.fill()}}
 if(SJT[tk]&&SJT[tk].keep||tk==='wall'){g.fillStyle='#6a6a6a';g.fillRect(x0,gy-50,w,50);g.fillStyle='#ece8dc';g.fillRect(x0,gy-70,w,22);g.fillStyle='#2a2a30';g.fillRect(x0,gy-76,w,7)}
 if(tk==='river'||tk==='bridge'||tk==='ford'){g.fillStyle='#3a6a9a';g.fillRect(x0,gy+40,w,40)}
 if(tk==='honjin'){g.fillStyle='#ece4d2';g.fillRect(x0,gy-40,w,30);g.fillStyle=mirror?'#7a1e1a':'#27427a';g.beginPath();g.arc(x0+w/2,gy-25,9,0,7);g.fill()}}
function sjDrawSide(g,x0,w,H,u,hpNow,mirror,t,act,hitK,isAtk){const gy=H*.52,col=SJ_COL[u.side],kind=u.t==='ozutsu'?'cannon':u.t,n=Math.max(0,Math.ceil(hpNow/10));
 g.save();g.beginPath();g.rect(x0,0,w,H);g.clip();sjVSBack(g,x0,w,H,sjTile(u.x,u.y),mirror,t);
 const dir=mirror?-1:1,lunge=act&&!SJU[u.t].st&&SJU[u.t].r[1]<2?Math.sin(Math.min(1,act)*Math.PI)*34:0;
 if(SJ.sea){const sz=u.t==='kobaya'?.9:u.t==='seki'?1.1:1.3;try{drawShip(g,x0+w/2+dir*lunge,gy+60,dir,col.b,t,u.id,sz)}catch(e){}if(hitK>0){for(let i=0;i<6;i++){g.fillStyle=`rgba(60,60,60,${.5*hitK})`;g.beginPath();g.arc(x0+w/2+(i-3)*16,gy+30-i*8*hitK,12+i*3,0,7);g.fill()}}}
 else if(SJU[u.t].st){const cx=x0+w/2;g.fillStyle=u.t==='gate'?'#5a3a1e':'#ece8dc';g.fillRect(cx-60,gy-60,120,120);g.fillStyle='#2a2a30';g.fillRect(cx-72,gy-76,144,18);if(u.t==='gate'){g.fillStyle='#7a5230';g.fillRect(cx-54,gy-52,52,108);g.fillRect(cx+2,gy-52,52,108)}const cr=1-hpNow/100;g.strokeStyle='#111';g.lineWidth=3;for(let i=0;i<Math.round(cr*8);i++){g.beginPath();g.moveTo(cx-40+i*12,gy-50);g.lineTo(cx-30+i*10,gy+10);g.lineTo(cx-44+i*12,gy+50);g.stroke()}}
 else{const all=10,hor=u.t==='kiba'||u.gen,sp=hor?36:30,sc=hor?2.5:3.1;for(let i=all-1;i>=0;i--){const row=i%2,colI=(i/2)|0;const alive=i<n;const fx=x0+w/2+dir*(-84+colI*sp-row*14)+dir*lunge*(1-colI*.1),fy=gy+40+row*44;
   g.save();g.translate(fx,fy);if(mirror)g.scale(-1,1);
   if(!alive){g.globalAlpha=.75;g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(0,2,26,6,0,0,7);g.fill();g.fillStyle=shade(col.b,-.35);g.fillRect(-22,-6,26,8);g.fillStyle='#e0b48a';g.fillRect(5,-6,7,7);g.fillStyle='#5a4632';g.fillRect(-30,-1,48,2);g.restore();continue}
   try{twMan(g,0,0,sc,col.b,i===1?col.f:null,t,u.gen&&i===0?'gen':kind,i+u.id,act>0&&act<1)}catch(e){}g.restore()}
  if(act>0&&act<1){const tx=x0+(mirror?20:w-20);if(u.t==='yumi'||u.t==='kiba'&&false){g.strokeStyle='#2a1a12';g.lineWidth=2;for(let i=0;i<9;i++){const p=(act*1.6+i*.08)%1,sx=x0+w/2,ex=mirror?x0-w*.5:x0+w*1.5,x=sx+(ex-sx)*p,y=gy-Math.sin(p*Math.PI)*120+i*6;g.beginPath();g.moveTo(x,y);g.lineTo(x-dir*12,y+5);g.stroke()}}
   if(u.t==='teppo'||u.t==='ozutsu'||u.t==='atake'&&tYear()>=1543){for(let i=0;i<5;i++){const fx=x0+w/2+dir*(-60+i*26);if(Math.sin(t*30+i)>.2){g.fillStyle='#ffe08a';g.fillRect(fx+dir*14,gy+28+(i%2)*44,10*dir,4)}g.fillStyle=`rgba(230,230,230,${.5*(1-act)})`;g.beginPath();g.arc(fx+dir*24,gy+20+(i%2)*44-act*20,10+act*14,0,7);g.fill()}}
   if(SJU[u.t].r[1]<2&&!SJ.sea){for(let i=0;i<5;i++){g.fillStyle='rgba(255,230,150,.8)';const sx=tx+Math.cos(t*20+i)*14,sy=gy+30+Math.sin(t*17+i*2)*30;g.fillRect(sx,sy,4,4)}}}}
 /* the label and the number */
 g.fillStyle='rgba(0,0,0,.6)';g.fillRect(x0+6,8,w-12,30);g.font="15px 'Suez One',serif";g.fillStyle=col.m;g.textAlign=mirror?'right':'left';g.fillText(`${SJU[u.t].kj} ${sjName(u.t)}`,mirror?x0+w-12:x0+12,28);
 g.font="bold 42px 'Suez One',serif";g.lineWidth=6;g.strokeStyle='#000';const ns=String(Math.max(0,Math.ceil(hpNow/10)));const nx=mirror?x0+18:x0+w-18;g.textAlign=mirror?'left':'right';g.strokeText(ns,nx,H-14);g.fillStyle=hpNow>=70?'#fff':hpNow>=40?'#ffe08a':'#ff9a7a';g.fillText(ns,nx,H-14);g.textAlign='left';
 if(isAtk){g.fillStyle='#e6b450';g.font="12px Rubik,sans-serif";g.textAlign=mirror?'right':'left';g.fillText(sjL('תוקף','Attacking'),mirror?x0+w-12:x0+12,52);g.textAlign='left'}
 g.restore()}
function sjDrawVS(g,W,H,dt){const v=SJ.vs;v.t+=dt*(SJ.spd>1?Math.min(3,SJ.spd):SJ.turn==='foe'?1.35:1);const t=performance.now()/1000;const open=clamp(v.t/.2,0,1),close=clamp((v.dur-v.t)/.2,0,1),k=Math.min(open,close);
 const hpAt=(u,ph)=>{const[h0,h1]=v.hp[u.id];return ph?h1:h0};
 /* timeline: the attacker strikes 0.2–0.8, the defender answers 0.85–1.45 */
 const aIsMe=v.a===v.me;const s1=clamp((v.t-.2)/.6,0,1),s2=clamp((v.t-.85)/.6,0,1);
 const firstC=v.first;const strikeA=firstC?s2:s1,strikeD=firstC?s1:s2;
 const dHit=strikeA>=.7,aHit=v.ctr&&strikeD>=.7;
 const meHP=v.me===v.a?(aHit?hpAt(v.a,1):hpAt(v.a,0)):(dHit?hpAt(v.d,1):hpAt(v.d,0));
 const foHP=v.fo===v.a?(aHit?hpAt(v.a,1):hpAt(v.a,0)):(dHit?hpAt(v.d,1):hpAt(v.d,0));
 g.save();g.globalAlpha=k;g.fillStyle='rgba(0,0,0,.6)';g.fillRect(0,0,W,H);const off=(1-open)*W*.5;
 const actMe=v.me===v.a?(strikeA>0&&strikeA<1?strikeA:0):(v.ctr&&strikeD>0&&strikeD<1?strikeD:0);const actFo=v.fo===v.a?(strikeA>0&&strikeA<1?strikeA:0):(v.ctr&&strikeD>0&&strikeD<1?strikeD:0);
 g.translate(-off,0);sjDrawSide(g,0,W/2,H,v.me,meHP,false,t,actMe,(v.me===v.d?dHit:aHit)?1:0,v.me===v.a);g.translate(off*2,0);sjDrawSide(g,W/2,W/2,H,v.fo,foHP,true,t,actFo,(v.fo===v.d?dHit:aHit)?1:0,v.fo===v.a);
 g.setTransform(SJ.cv.width/W,0,0,SJ.cv.height/H,0,0);g.globalAlpha=k;sjProj(g,W,H,v,strikeA,strikeD,t);g.fillStyle='#e6b450';g.beginPath();g.moveTo(W/2-6,0);g.lineTo(W/2+2,0);g.lineTo(W/2+6,H);g.lineTo(W/2-2,H);g.fill();
 g.font="26px 'Yuji Syuku',serif";g.textAlign='center';g.fillStyle='#ffe39a';g.strokeStyle='#000';g.lineWidth=4;g.strokeText('対',W/2,H/2+9);g.fillText('対',W/2,H/2+9);g.textAlign='left';g.restore();
 if(!v.snd1&&strikeA>=.7){v.snd1=1;try{sfx('big')}catch(e){}}if(!v.snd2&&v.ctr&&strikeD>=.7){v.snd2=1;try{sfx('clang')}catch(e){}}
 if(v.t>=v.dur){SJ.vs=null;v.done&&v.done()}}
function sjProj(g,W,H,v,sA,sD,t){const gy=H*.52;const one=(u,p)=>{if(!(p>0&&p<1))return;const fromL=u===v.me,sx=fromL?W*.25:W*.75,ex=fromL?W*.75:W*.25;
 if(u.t==='yumi'||u.t==='yagura'||u.t==='seki'||(u.t==='atake'||u.t==='flag')&&tYear()<1543){g.strokeStyle='#1a120a';g.lineWidth=2;for(let i=0;i<12;i++){const q=clamp(p*1.5-i*.04,0,1);if(q<=0||q>=1)continue;const x=sx+(ex-sx)*q+(i%4-1.5)*14,y=gy+30-Math.sin(q*Math.PI)*150+(i%3)*10;const dx=(ex-sx)*.02,dy=Math.cos(q*Math.PI)*-6;g.beginPath();g.moveTo(x,y);g.lineTo(x-dx*1.5,y-dy*1.5-2);g.stroke();g.fillStyle='#d8dee6';g.fillRect(x-1,y-1,2,2)}}
 else if(u.t==='kobaya'){for(let i=0;i<4;i++){const q=clamp(p*1.4-i*.08,0,1);if(q<=0)continue;if(q<1){const x=sx+(ex-sx)*q,y=gy+30-Math.sin(q*Math.PI)*120+i*8;g.fillStyle='#3a2a1a';g.beginPath();g.arc(x,y,5,0,7);g.fill();g.fillStyle=i%2?'#ffb24a':'#ffe39a';g.fillRect(x-2,y-9,4,5)}else{g.fillStyle=`rgba(255,${120+i*30},40,.8)`;g.beginPath();g.arc(ex+(i-1.5)*20,gy+50-Math.sin(t*20+i)*8,10+4*Math.sin(t*15+i),0,7);g.fill()}}}
 else if(u.t==='ozutsu'||u.t==='atake'||u.t==='flag'){const q=clamp(p*1.4,0,1);if(q<1){g.fillStyle='#111';g.beginPath();g.arc(sx+(ex-sx)*q,gy+20-Math.sin(q*Math.PI)*110,5,0,7);g.fill()}else{for(let i=0;i<8;i++){const a=i*.8+t*4;g.fillStyle=i%2?'#ffb24a':'#ffe39a';g.beginPath();g.arc(ex+Math.cos(a)*22*(p),gy+40+Math.sin(a)*14*p,8,0,7);g.fill()}}}
 else if(u.t==='teppo'){g.fillStyle='rgba(255,240,180,.9)';for(let i=0;i<6;i++){const q=(p*3+i*.17)%1;g.fillRect(sx+(ex-sx)*q,gy+30+(i%2)*44,6,2)}}};
 one(v.a,sA);if(v.ctr)one(v.d,sD)}
const SJ_PORC={};
function sjPortrait(side){try{if(side==='me')return portrait(S.look||HEROES[S.hero].look,'lvl'+S.hero);const fd=SJ.ctx.fd||{};if(fd.sjHeroIdx!=null&&HEROES[fd.sjHeroIdx])return portrait(fd.look||HEROES[fd.sjHeroIdx].look,HEROES[fd.sjHeroIdx].id);return portrait(fd.look||{},fd.name||'foe')}catch(e){return null}}
function sjDrawCut(g,W,H,dt){const c=SJ.cut;c.life-=dt*.75*(SJ.spd>1?2:1);const k=clamp(Math.min(c.life*3,(1-c.life)*6),0,1);const P=SJCO[c.k],me=c.side==='me',col=SJ_COL[c.side];
 g.save();g.globalAlpha=k;g.fillStyle='rgba(0,0,0,.55)';g.fillRect(0,0,W,H);const bh=150,by=H/2-bh/2;const gr=g.createLinearGradient(0,by,W,by);gr.addColorStop(0,me?'#1a2a5a':'#0a0606');gr.addColorStop(1,me?'#0a0606':'#5a1410');
 g.fillStyle=gr;g.fillRect(0,by,W,bh);g.fillStyle='#e6b450';g.fillRect(0,by,W,3);g.fillRect(0,by+bh-3,W,3);
 const por=sjPortrait(c.side);const ps=bh-16,px=me?16:W-16-ps;if(por){g.imageSmoothingEnabled=por.width>=96;g.drawImage(por,px,by+8,ps,ps);g.imageSmoothingEnabled=false;g.strokeStyle=col.m;g.lineWidth=3;g.strokeRect(px,by+8,ps,ps)}
 const tx=me?px+ps+16:px-16;g.textAlign=me?'left':'right';g.font="40px 'Yuji Syuku',serif";g.fillStyle='#ffe39a';g.strokeStyle='#000';g.lineWidth=5;g.strokeText(P.kj,tx,by+54);g.fillText(P.kj,tx,by+54);
 g.font="20px 'Suez One',serif";g.fillStyle='#fff';g.fillText(sjL(P.he,P.en),tx,by+84);g.font="13px Rubik,sans-serif";g.fillStyle='#e8dcc0';const words=sjL(P.dh,P.de);const mw=W-ps-60;let line='',ly=by+106;for(const wd of words.split(' ')){const tl=line?line+' '+wd:wd;if(g.measureText(tl).width>mw){g.fillText(line,tx,ly);ly+=16;line=wd}else line=tl}g.fillText(line,tx,ly);
 g.textAlign='left';g.restore()}
/* ---------- the screen around the map ---------- */
function sjBuildUI(){const ov=document.createElement('div');ov.id='sjOv';ov.setAttribute('dir',TX('rtl','ltr'));
 ov.innerHTML=`<div class="sjwrap"><div class="sjtop"><div class="sjco me" id="sjCoMe"><canvas width="96" height="96"></canvas><div class="sjcoi"><b></b><div class="sjmeter"><i></i></div><small></small></div></div>
 <div class="sjday"><b id="sjDay"></b><small id="sjWx"></small></div>
 <div class="sjco foe" id="sjCoFoe"><canvas width="96" height="96"></canvas><div class="sjcoi"><b></b><div class="sjmeter"><i></i></div><small></small></div></div></div>
 <div class="sjstr"><div class="sjbar me"><i id="sjBarMe"></i><span id="sjNMe"></span></div><div class="sjbar foe"><i id="sjBarFoe"></i><span id="sjNFoe"></span></div></div>
 <div class="sjcvw"><canvas id="sjCv"></canvas></div>
 <div class="sjcards"><div class="sjcard"><canvas id="sjTc" width="128" height="128"></canvas><div id="sjTt"></div></div><div class="sjcard"><canvas id="sjUc" width="128" height="128"></canvas><div id="sjUt"></div></div></div>
 <div class="sjinfo" id="sjInfo"></div>
 <div class="sjpad"><button class="sjb gold" id="sjEnd"></button><button class="sjb" id="sjPow"></button><button class="sjb" id="sjAct"></button><button class="sjb" id="sjCan"></button><button class="sjb" id="sjAuto"></button><button class="sjb ghost" id="sjRet"></button><button class="sjb ghost" id="sjHelp">?</button></div></div>`;
 document.body.append(ov);const cv=ov.querySelector('#sjCv');const dpr=Math.min(2,window.devicePixelRatio||1);cv.width=SJ_C*SJ_TS*2;cv.height=SJ_R*SJ_TS*2;SJ.cv=cv;SJ.g=cv.getContext('2d');void dpr;
 const tile=e=>{const r=cv.getBoundingClientRect();const x=Math.floor((e.clientX-r.left)/r.width*SJ_C),y=Math.floor((e.clientY-r.top)/r.height*SJ_R);return sjIn(x,y)?[x,y]:null};
 cv.addEventListener('pointerdown',e=>{e.preventDefault();if(!SJ)return;if(SJ.vs){sjSkipVS();return}if(SJ.cut)return;const p=tile(e);if(p)sjTap(p[0],p[1])});
 cv.addEventListener('pointermove',e=>{if(!SJ||e.pointerType!=='mouse')return;const p=tile(e);if(p&&(!SJ.hover||SJ.hover[0]!==p[0]||SJ.hover[1]!==p[1])){SJ.hover=p;sjInfo()}});
 const on=(id,f)=>{const b=ov.querySelector(id);if(b)b.onclick=e=>{e.preventDefault();try{f()}catch(er){console.warn(er)}}};
 on('#sjEnd',sjEndTurn);on('#sjPow',sjPowBtn);on('#sjAuto',sjAutoTog);on('#sjRet',sjRetreat);on('#sjHelp',sjHelp);
 on('#sjAct',()=>{if(!SJ||!SJ.sel||SJ.busy)return;if(SJ.st==='aim')sjConfirm();else sjDone(SJ.sel.u)});
 on('#sjCan',sjCancel);
 SJ.key=e=>{if(!SJ||!document.getElementById('sjOv'))return;if(e.key==='Escape')sjCancel();else if(e.key==='Enter'&&SJ.st==='aim')sjConfirm();else if(e.key==='e'||e.key==='E')sjEndTurn()};document.addEventListener('keydown',SJ.key);
 for(const s of['me','foe']){const el=ov.querySelector(s==='me'?'#sjCoMe canvas':'#sjCoFoe canvas');const p=sjPortrait(s);if(el&&p){const g=el.getContext('2d');g.imageSmoothingEnabled=p.width>=96;g.drawImage(p,0,0,96,96)}}
 sjHud()}
function sjFlash(t){SJ&&(SJ.flash={t,until:Date.now()+2600});sjInfo();setTimeout(()=>{try{sjInfo()}catch(e){}},2700)}
function sjUnitLine(u){const U=SJU[u.t];const strong=Object.keys(SJB[u.t]||{}).filter(k=>SJB[u.t][k]>=80&&!SJU[k].st).map(k=>SJU[k].kj),weak=Object.keys(SJB).filter(k=>SJB[k][u.t]>=80&&!SJU[k].st).map(k=>SJU[k].kj);
 return `<b style="color:${SJ_COL[u.side].m}">${U.kj} ${sjName(u.t)} ${sjHPd(u)}</b> <span class="muted">· ${sjL(U.sh,U.se)}${strong.length?' · '+sjL('חזק מול ','strong vs ')+strong.join(' '):''}${weak.length?' · '+sjL('חלש מול ','weak vs ')+weak.join(' '):''}</span>`}
function sjTileLine(x,y){const k=sjTile(x,y),T=SJT[k];const mv=T.mv,cs=SJ.sea?`⛵ ${mv.ship||'✕'}`:`👣 ${mv.foot||'✕'} · 🐎 ${mv.horse||'✕'}`;return `<span>${T.kj} ${sjTName(k)} · ${'★'.repeat(T.st)||'☆'} · ${cs}${T.dhe?' · '+sjL(T.dhe,T.den):''}</span>`}
function sjInfo(){const el=document.getElementById('sjInfo');if(!el||!SJ)return;let h='';
 if(SJ.flash&&Date.now()<SJ.flash.until)h=`<div class="sjflash">${esc(SJ.flash.t)}</div>`;
 else if(SJ.turn!=='me'||SJ.auto.me)h=`<div class="muted">${SJ.turn==='me'?sjL('הבינה המלאכותית מנהלת את הצבא שלך. לחץ ⏸ כדי לחזור לפיקוד.','The AI is leading your army. Tap ⏸ to take command.'):sjL('האויב זז…','The enemy is moving…')}</div>`;
 else if(SJ.st==='aim'&&SJ.sel&&SJ.sel.aim){const a=SJ.sel.aim,u=SJ.sel.u;h=`<div><b>${SJU[u.t].kj} → ${SJU[a.d.t].kj} ${sjName(a.d.t)}</b> · ⚔ <b style="color:#ffb35a">${a.f.h}%</b> · ↩ <b style="color:#ff8a6a">${a.f.c}%</b>${a.f.first?' · '+sjL('הם מכים ראשונים!','they strike first!'):''}</div><div class="muted">${sjL('לחץ שוב על המטרה, או ⚔, כדי לתקוף','Tap the target again, or ⚔, to attack')}</div>`}
 else if(SJ.sel){const u=SJ.sel.u;h=`<div>${sjUnitLine(u)}</div><div class="muted">${SJ.st==='moved'?sjL('בחר מטרה (אדום), או המתן','Pick a target (red), or wait'):sjL('לאן לזוז (כחול)? אפשר גם ללחוץ ישר על מטרה אדומה','Where to? (blue) Or tap a red target directly')}</div>`}
 else if(SJ.peek&&SJ.peek.u.hp>0){h=`<div>${sjUnitLine(SJ.peek.u)}</div><div class="muted">${sjL('באדום: כל מה שהיחידה הזאת יכולה לתקוף בתור הבא שלה','In red: everything this unit can strike on its next turn')}</div>`}
 else{const p=SJ.hover;if(p){const o=sjAt(p[0],p[1]);h=(o?`<div>${sjUnitLine(o)}</div>`:'')+`<div class="muted">${sjTileLine(p[0],p[1])}</div>`}else h=`<div class="muted">${sjL('בחר יחידה שלך. היחידות שלך משמאל, האויב מימין.','Pick one of your units. Yours are on the left, the enemy on the right.')}</div>`}
 el.innerHTML=h;sjCards()}
function sjCards(){const ov=document.getElementById('sjOv');if(!ov||!SJ||!SJ.tc)return;const sel=SJ.sel,a=sel&&sel.aim;let u=a?a.d:sel?sel.u:SJ.peek?SJ.peek.u:null,p=null;
 if(!u&&SJ.hover){p=SJ.hover;u=sjAt(p[0],p[1])}if(u)p=[u.x,u.y];if(!p&&SJ.hq)p=SJ.hq.me;if(!p)return;const k=sjTile(p[0],p[1]),T=SJT[k];
 const tc=ov.querySelector('#sjTc'),tg=tc.getContext('2d');tg.imageSmoothingEnabled=false;tg.clearRect(0,0,128,128);tg.drawImage(SJ.tc,p[0]*SJ_TS*2,p[1]*SJ_TS*2,SJ_TS*2,SJ_TS*2,0,0,128,128);
 ov.querySelector('#sjTt').innerHTML=`<b>${T.kj} ${sjTName(k)}</b><span class="sjst">${'★'.repeat(T.st)}${'☆'.repeat(Math.max(0,4-T.st))}</span><small>${SJ.sea?`⛵ ${T.mv.ship||'✕'}`:`👣 ${T.mv.foot||'✕'} · 🐎 ${T.mv.horse||'✕'}`}${T.heal?' · ✚2':''}</small>`;
 const uc=ov.querySelector('#sjUc'),ug=uc.getContext('2d');ug.setTransform(1,0,0,1,0,0);ug.clearRect(0,0,128,128);const ut=ov.querySelector('#sjUt');
 if(!u){ug.fillStyle='rgba(0,0,0,.25)';ug.fillRect(0,0,128,128);ut.innerHTML=`<small>${sjL('אין יחידה','No unit')}</small>`;return}
 const col=SJ_COL[u.side]||SJ_COL.foe,U=SJU[u.t],t=performance.now()/1000;const gr=ug.createLinearGradient(0,0,0,128);gr.addColorStop(0,u.side==='me'?'#1e3a6a':'#5a1a14');gr.addColorStop(1,'#120c08');ug.fillStyle=gr;ug.fillRect(0,0,128,128);
 ug.save();if(SJ.sea||U.st){ug.translate(64,70);ug.scale(2.2,2.2);ug.translate(-u.px*SJ_TS-SJ_TS/2,-u.py*SJ_TS-SJ_TS/2);sjDrawUnit(ug,{...u,done:false},t)}else{ug.translate(64,104);if(u.side!=='me')ug.scale(-1,1);const kind=u.t==='ozutsu'?'cannon':u.t;try{twMan(ug,u.gen||u.t==='kiba'?-6:-14,0,u.gen||u.t==='kiba'?3.4:3.6,col.b,u.gen||u.t==='yari'||u.t==='sam'?col.f:null,t,u.gen?'gen':kind,1,false);if(!u.gen&&u.t!=='kiba')twMan(ug,16,-4,3.2,col.b,null,t,kind,2,false)}catch(e){}}ug.restore();
 const hd=sjHPd(u);if(!(SJ.sea||U.st)){ug.fillStyle='rgba(0,0,0,.75)';ug.fillRect(86,94,38,30);ug.font="bold 26px 'Suez One',serif";ug.textAlign='center';ug.fillStyle=hd>=7?'#fff':hd>=4?'#ffe08a':'#ff9a7a';ug.fillText(String(hd),105,118);ug.textAlign='left'}
 const strong=Object.keys(SJB[u.t]||{}).filter(x=>SJB[u.t][x]>=80&&!SJU[x].st).map(x=>SJU[x].kj).join(' '),weak=Object.keys(SJB).filter(x=>SJB[x][u.t]>=80&&!SJU[x].st).map(x=>SJU[x].kj).join(' ');
 ut.innerHTML=`<b style="color:${col.m}">${U.kj} ${sjName(u.t)}</b><small>${sjL(U.sh,U.se)}</small><small>👣 ${U.mv} · 🎯 <span dir="ltr">${U.r[0]===U.r[1]?U.r[1]:U.r[0]+'–'+U.r[1]}</span></small>${strong?`<small class="sjgood">▲ ${strong}</small>`:''}${weak?`<small class="sjbad">▼ ${weak}</small>`:''}`}
function sjHud(){if(!SJ)return;const ov=document.getElementById('sjOv');if(!ov)return;const q=s=>ov.querySelector(s);
 q('#sjDay').textContent=sjL(`יום ${Math.min(SJ.day,SJ_DAYS)}/${SJ_DAYS}`,`Day ${Math.min(SJ.day,SJ_DAYS)}/${SJ_DAYS}`);try{q('#sjWx').textContent=wxLabel()}catch(e){}
 for(const s of['me','foe']){const el=q(s==='me'?'#sjCoMe':'#sjCoFoe'),P=SJCO[SJ.co[s]];el.querySelector('b').textContent=s==='me'?((typeof playerName==='function'&&playerName())||S.name||''):(SJ.ctx.fd&&SJ.ctx.fd.name||'');
  el.querySelector('.sjmeter i').style.width=(SJ.pow[s]?100:Math.round(SJ.meter[s]/SJ_PMAX*100))+'%';el.classList.toggle('sjfull',SJ.meter[s]>=SJ_PMAX||!!SJ.pow[s]);el.classList.toggle('sjon',!!SJ.pow[s]);
  const known=s==='me'||!WAR.docKey||docKnown(WAR.docKey)||SJ.pow[s];el.querySelector('small').textContent=known?`${P.kj} ${sjL(P.he,P.en)}`:sjL('כוח לא ידוע','Unknown power')}
 const fm=sjSum('me'),ff=sjSum('foe');q('#sjBarMe').style.width=Math.round(fm/SJ.start.me*100)+'%';q('#sjBarFoe').style.width=Math.round(ff/SJ.start.foe*100)+'%';
 q('#sjNMe').textContent=fmtN(Math.round(WAR.my.max*fm/SJ.start.me));q('#sjNFoe').textContent=fmtN(Math.round(WAR.foe.max*ff/SJ.start.foe));
 const my=SJ.turn==='me'&&!SJ.auto.me&&!SJ.over,P=SJCO[SJ.co.me];
 const e=q('#sjEnd');e.textContent=sjL('סיים תור','End turn');e.disabled=!my||SJ.busy;
 const pb=q('#sjPow');pb.textContent=`⚡ ${P.kj}`;pb.disabled=!my||SJ.busy||SJ.meter.me<SJ_PMAX||!!SJ.pow.me;pb.classList.toggle('glow',!pb.disabled);
 const a=q('#sjAct');a.textContent=SJ.st==='aim'?sjL('⚔ תקוף','⚔ Attack'):sjL('המתן','Wait');a.disabled=!my||!SJ.sel||SJ.busy;
 const c=q('#sjCan');c.textContent=sjL('בטל','Cancel');c.disabled=!my||!SJ.sel||SJ.busy;
 q('#sjAuto').textContent=SJ.auto.me?'⏸':'⏩';q('#sjRet').textContent=sjL('🏳 נסיגה','🏳 Retreat');q('#sjRet').disabled=SJ.over;
 sjInfo()}
function sjHelp(){if(!SJ)return;const old=document.getElementById('sjHelpOv');if(old){old.remove();return}const d=document.createElement('div');d.id='sjHelpOv';d.setAttribute('dir',TX('rtl','ltr'));
 const tk=SJ.sea?['atake','seki','kobaya','flag']:['yari','yumi','teppo','kiba','sam','ozutsu','gen'];
 const rows=tk.map(k=>{const s=Object.keys(SJB[k]||{}).filter(x=>SJB[k][x]>=80&&!SJU[x].st),w=Object.keys(SJB).filter(x=>SJB[x][k]>=80&&!SJU[x].st);return `<tr><td><b>${SJU[k].kj}</b> ${sjName(k)}</td><td>${SJU[k].mv}</td><td dir="ltr">${SJU[k].r[0]===SJU[k].r[1]?SJU[k].r[1]:SJU[k].r[0]+'–'+SJU[k].r[1]}</td><td>${s.map(x=>SJU[x].kj).join(' ')||'–'}</td><td>${w.map(x=>SJU[x].kj).join(' ')||'–'}</td></tr>`}).join('');
 const ter=(SJ.sea?['sea','shoal','port']:['plain','paddy','forest','hill','ford','village','castle','tenshu']).map(k=>`<span class="sjchip">${SJT[k].kj} ${sjTName(k)} ${'★'.repeat(SJT[k].st)||'☆'}</span>`).join(' ');
 const P=SJCO[SJ.co.me];
 d.innerHTML=`<div class="sjhelp"><h3>${sjL('戦場 · איך נלחמים','戦場 · How to fight')}</h3>
 <p>${sjL('בחר יחידה, ואז משבצת כחולה כדי לזוז או מטרה אדומה כדי לתקוף. כל יחידה פועלת פעם אחת בתור. הנזק תלוי בכוח (המספר), בסוג היחידה ובשטח. כוכבים מגינים.','Pick a unit, then a blue square to move or a red target to attack. Each unit acts once per turn. Damage depends on strength (the number), the unit type and the ground. Stars protect.')}</p>
 <p>${sjL('ניצחון: הפל את המפקד שלהם (将), או שבור את הצבא שלהם. אחרי היום השמיני, מי שנשאר לו יותר כוח (באחוזים) מנצח, ובשוויון המגן מחזיק.','Victory: bring down their commander (将), or break their army. After the eighth day the side with more strength left (in percent) wins, and in a tie the defender holds.')}</p>
 <table class="sjtab"><tr><th></th><th>👣</th><th>🎯</th><th>${sjL('חזק מול','Strong vs')}</th><th>${sjL('חלש מול','Weak vs')}</th></tr>${rows}</table>
 <p>${ter}</p><p>${sjL('טפו ואוזוטסו לא יורים אחרי תנועה ולא מחזירים מכה. מגשם, הפתילים נרטבים.','Teppō and ōzutsu cannot fire after moving and never strike back. In rain, the matches get wet.')}</p>
 <p><b>⚡ ${P.kj} ${sjL(P.he,P.en)}</b>: ${sjL(P.dh,P.de)}. ${sjL('המד מתמלא מנזק שאתם נותנים וסופגים.','The meter fills from damage you deal and take.')}</p>
 <button class="sjb gold" id="sjHelpX">${sjL('לקרב!','To battle!')}</button></div>`;
 document.body.append(d);d.onclick=e=>{if(e.target===d||e.target.id==='sjHelpX')d.remove()}}
document.head.insertAdjacentHTML('beforeend',`<style>
#sjOv{position:fixed;inset:0;z-index:85;background:radial-gradient(ellipse at 50% 0%,#2a1c14,#0d0806 70%);display:flex;justify-content:center;overflow-y:auto;-webkit-user-select:none;user-select:none;touch-action:manipulation}
#sjOv .sjwrap{width:min(780px,100%,max(560px,calc((100vh - 310px) * 1.25)));min-height:100%;display:flex;flex-direction:column;gap:6px;padding:6px 6px max(10px,env(safe-area-inset-bottom));box-sizing:border-box}
#sjOv .sjpad{margin-top:auto}
#sjOv .sjtop{direction:ltr;display:grid;grid-template-columns:1fr auto 1fr;gap:6px;align-items:center}
#sjOv .sjco{display:flex;gap:6px;align-items:center;min-width:0;padding:4px;border-radius:10px;background:rgba(0,0,0,.35);border:1px solid #3a2a20}
#sjOv .sjco.foe{flex-direction:row-reverse;text-align:end}
#sjOv .sjco canvas{width:54px;height:54px;border-radius:8px;border:2px solid #5aa0ff;image-rendering:auto;flex:none;background:#1a1010}
#sjOv .sjco.foe canvas{border-color:#ff6a4a}
#sjOv .sjcoi{min-width:0;flex:1;display:flex;flex-direction:column;gap:2px}
#sjOv .sjcoi b{font:14px var(--display);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#sjOv .sjcoi small{font-size:10px;color:var(--paper-dim,#b8a890);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#sjOv .sjmeter{height:7px;border-radius:4px;background:#2a1a14;overflow:hidden;border:1px solid #000}
#sjOv .sjmeter i{display:block;height:100%;background:linear-gradient(90deg,#a8792a,#ffe39a);transition:width .3s}
#sjOv .sjco.foe .sjmeter{transform:scaleX(-1)}
#sjOv .sjco.sjfull .sjmeter i{animation:sjglow .7s infinite alternate}
#sjOv .sjco.sjon{box-shadow:0 0 0 2px var(--gold) inset}
@keyframes sjglow{from{filter:brightness(1)}to{filter:brightness(1.6)}}
#sjOv .sjday{text-align:center;display:flex;flex-direction:column}#sjOv .sjday b{font:16px var(--display);color:var(--gold)}#sjOv .sjday small{font-size:10px;color:#cdbfa4;max-width:90px}
#sjOv .sjstr{display:grid;grid-template-columns:1fr 1fr;gap:6px;direction:ltr}
#sjOv .sjbar{position:relative;height:14px;background:#2a1410;border:1px solid #000;border-radius:3px;overflow:hidden}
#sjOv .sjbar i{position:absolute;inset:0 auto 0 0;background:linear-gradient(180deg,#6ab0ff,#2a5aa8);transition:width .4s}
#sjOv .sjbar.foe i{inset:0 0 0 auto;background:linear-gradient(180deg,#ff8a6a,#a8291a)}
#sjOv .sjbar span{position:absolute;inset:0;font:10px/14px Rubik,sans-serif;text-align:center;color:#fff;text-shadow:0 1px 2px #000}
#sjOv .sjcvw{direction:ltr;border:2px solid #000;border-radius:6px;overflow:hidden;box-shadow:0 0 0 1px #4a3a30}
#sjOv canvas#sjCv{display:block;width:100%;height:auto;aspect-ratio:${SJ_C}/${SJ_R};image-rendering:pixelated;touch-action:none;cursor:pointer}
#sjOv .sjcards{display:grid;grid-template-columns:1fr 1fr;gap:6px}
#sjOv .sjcard{display:flex;gap:6px;align-items:center;padding:5px;border-radius:10px;background:rgba(0,0,0,.3);border:1px solid #3a2a20;min-width:0}
#sjOv .sjcard canvas{width:clamp(56px,21vw,96px);height:clamp(56px,21vw,96px);border-radius:7px;border:1px solid #000;image-rendering:pixelated;flex:none}
#sjOv .sjcard>div{display:flex;flex-direction:column;gap:1px;min-width:0;font-size:12px}
#sjOv .sjcard b{font:15px var(--display);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#sjOv .sjcard small{font-size:12px;color:#cdbfa4;line-height:1.25}
#sjOv .sjst{color:var(--gold);font-size:12px;letter-spacing:1px}
#sjOv .sjgood{color:#9ef08a!important}#sjOv .sjbad{color:#ff9a7a!important}
#sjOv .sjinfo{min-height:44px;font-size:13px;line-height:1.35;padding:4px 8px;border-radius:8px;background:rgba(236,228,210,.08);border:1px solid #3a2a20}
#sjOv .sjinfo .muted{color:#cdbfa4;font-size:12px}
#sjOv .sjflash{color:#ffe39a}
#sjOv .sjpad{display:grid;grid-template-columns:repeat(4,1fr);gap:5px}
#sjOv .sjb{min-height:42px;border-radius:9px;border:1px solid #4a3a30;background:linear-gradient(180deg,#2e2219,#17110f);color:var(--paper,#f0e6d2);font:14px var(--body);cursor:pointer;padding:2px 4px}
#sjOv .sjb:disabled{opacity:.4;cursor:default}
#sjOv .sjb.gold{background:linear-gradient(180deg,#e6b450,#a8792a);color:#1a0e06;border-color:#000;font-weight:600;grid-column:span 2}
#sjOv .sjb.ghost{background:rgba(0,0,0,.25)}
#sjOv .sjb.glow{border-color:var(--gold);box-shadow:0 0 10px rgba(230,180,80,.7);animation:sjglow .7s infinite alternate}
body:has(#sjOv) #helpFab,body:has(#sjOv) #quickBar{display:none!important}
#sjHelpOv{position:fixed;inset:0;z-index:86;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;padding:10px}
#sjHelpOv .sjhelp{max-width:520px;max-height:90vh;overflow:auto;background:#1e1510;border:2px solid var(--gold);border-radius:12px;padding:12px 14px;font-size:13px;line-height:1.45}
#sjHelpOv h3{margin:0 0 6px;font:20px var(--display);color:var(--gold)}
#sjHelpOv .sjtab{width:100%;border-collapse:collapse;font-size:12px}#sjHelpOv .sjtab td,#sjHelpOv .sjtab th{border-bottom:1px solid #3a2a20;padding:3px;text-align:center}#sjHelpOv .sjtab td:first-child{text-align:start}
#sjHelpOv .sjchip{display:inline-block;padding:1px 6px;margin:2px;border-radius:8px;background:#2e2219;font-size:11px}
#sjHelpOv .sjb{min-height:40px;width:100%;margin-top:6px;border-radius:9px;border:1px solid #000;background:linear-gradient(180deg,#e6b450,#a8792a);color:#1a0e06;font:600 15px var(--body)}
</style>`);
/* a battle abandoned halfway (the page closed or reloaded) counts as a disorderly retreat, so it cannot be dodged and retried */
setInterval(()=>{try{if(!S||!S.sjPend||SJ||(WAR&&WAR.sj&&!WAR.over))return;const P=S.sjPend;delete S.sjPend;const lost=Math.round((S.est.soldiers||0)*.15);S.est.soldiers=Math.max(0,(S.est.soldiers||0)-lost);S.streak=0;S.est.mor=clamp((S.est.mor||50)-5,0,100);save();
 try{feed(TX(`${P.p}: הצבא עזב את שדה הקרב באמצע · −${lost} חיילים`,`${P.p}: the army left the field mid-battle · −${lost} soldiers`))}catch(e){}toast(TX(`הקרב ב${P.p} ננטש באמצע: נסיגה בלי סדר, ${lost} חיילים אבדו.`,`The battle at ${P.p} was abandoned: a disorderly retreat, ${lost} soldiers lost.`))}catch(e){}},2500);
/* ---------- the hooks into the old war ---------- */
/* the core sets the war up; the battle replaces the three rounds as soon as the war screen first settles */
{const o=refreshWar;refreshWar=function(){const r=o.apply(this,arguments);try{if(WAR&&!WAR.sj&&!WAR.over&&WAR.round===0&&!WAR.busy&&!SJ){WAR.sj=1;WAR.busy=true;setTimeout(()=>{try{if(WAR&&WAR.sj&&!WAR.over)sjStart()}catch(e){console.warn('senjo start',e);WAR.busy=false;WAR.sj=0}},30)}}catch(e){}return r}}
{const o=warRound;warRound=async function(t){if(WAR&&WAR.sj){if(t==='retreat'&&SJ)return sjRetreat();return}return o.apply(this,arguments)}}
{const o=autoWar;autoWar=function(){if(WAR&&WAR.sj){try{if(SJ&&!SJ.over&&S.autoFight&&!SJ.auto.me)sjAutoTog();if(SJ&&S.autoFight)SJ.spd=14}catch(e){}return}return o.apply(this,arguments)}}
/* the old siege mini-battle (ladders against direct assault) is now the siege map itself */
{const o=startWar;startWar=async function(ctx){SJ_SKIPSG++;try{S.seenHelp=S.seenHelp||{};S.seenHelp.war=1}catch(e){}try{return await o.apply(this,arguments)}finally{SJ_SKIPSG=Math.max(0,SJ_SKIPSG-1)}}}
{const o=choice;choice=function(html,opts){try{if(SJ_SKIPSG&&Array.isArray(opts)&&opts.length===2&&opts[0].key==='sg'&&opts[1].key==='go')return Promise.resolve('go')}catch(e){}return o.apply(this,arguments)}}
try{HELP.war=[TX('戦場 · שדה הקרב','戦場 · The battlefield'),TX('קרב טקטי בתורות על מפת משבצות. בחר יחידה, הזז אותה (כחול) ותקוף (אדום). כל יחידה מראה את הכוח שלה מ־1 עד 10. חניתות עוצרות פרשים, פרשים דורסים קשתים וטפו, קשתים וטפו קוצרים חניתות. יער, גבעות, כפרים וטירות מגינים. הפל את המפקד של האויב (将) או שבור את הצבא שלו. מד המפקד מתמלא בקרב ומשחרר כוח מיוחד.','A turn-based battle on a map of squares. Pick a unit, move it (blue) and attack (red). Every unit shows its strength from 1 to 10. Pikes stop cavalry, cavalry rides down archers and teppō, archers and teppō cut down pikes. Forest, hills, villages and castles protect. Bring down the enemy commander (将) or break his army. The commander meter fills in battle and unleashes a special power.')]}catch(e){}
/* the board: each realm keeps a small war record, and its generals fight by it */
{const o=rkSnap;rkSnap=function(){const r=o.apply(this,arguments);try{if(r&&S){const sjw=SJ;SJ={sea:false,kind:'field',keepSide:null,ctx:{fd:{}}};let w;try{w=sjWeights('me')}finally{SJ=sjw}
  const m={};for(const k of['yari','yumi','teppo','kiba','sam','ozutsu'])if(w[k])m[k]=Math.min(20,Math.round(w[k]*2)/2);r.wr={...m,ag:+clamp((S.sjRec&&S.sjRec.ag)||.6,0,1).toFixed(2)}}}catch(e){}return r}}
{const o=rkFoe;rkFoe=function(t){const f=o.apply(this,arguments);try{const e=(t&&t.emp)||{},w=e.wr;if(w&&typeof w==='object'){const c={};let any=0;for(const k of['yari','yumi','teppo','kiba','sam','ozutsu']){const v=+w[k];if(isFinite(v)&&v>0){c[k]=clamp(v,0,20);any=1}}if(any){c.ag=clamp(isFinite(+w.ag)?+w.ag:.6,0,1);f.sjWr=c}}
  const hi=e.hero!=null?e.hero|0:(t.h|0);if(HEROES[hi]){f.sjHero=SJCO[HEROES[hi].id]?HEROES[hi].id:null;f.sjHeroIdx=hi}}catch(er){}return f}}
if(false)window.__sj={get SJ(){return SJ},cityFoe:c=>cityFoe(c),armyPower:()=>armyPower(),navyPower:()=>navyPower(),rkFoe:t=>rkFoe(t),sjStart:()=>sjStart(),sjTap:(x,y)=>sjTap(x,y),sjEndTurn:()=>sjEndTurn(),sjConfirm:()=>sjConfirm(),sjAutoTog:()=>sjAutoTog(),sjRetreat:()=>sjRetreat(),sjBudget,sjFinish:r=>sjFinish(r),get last(){return SJ_LAST},sjAITurn:s=>sjAITurn(s),sjAttack:(a,b)=>sjAttack(a,b),sjActivate:x=>sjActivate(x),SJU,SJB,SJT};
