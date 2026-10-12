/* ================= 戦場 Senjō: the battlefield, in real time =================
   Army wars are fought in real time on a map of squares, in the manner of WARNO, with the troops and the arts of war of
   old Japan and no firearms: ashigaru pikes, archers, stone throwers, mounted samurai and horse archers, samurai,
   warrior monks, shinobi scouts, command riders (母衣衆), gate breakers and the supply train; the eight formations
   (八陣) and the stratagems (計略); fog of war, morale and stress, supply, flag zones taken only by
   command riders, and reinforcements called from the reserve.
   Everything the realm has built goes to war with it (arms, armour, retainers, stables, horses, spies, walls, rice,
   research, morale, training, the commander's own stats, weather, night, doctrines, luck).
   The core startWar still sets the war up, and the battle hands its result back to warEnd. */
const SJ_C=10,SJ_R=8,SJ_TS=48,SJ_PMAX=260;
let SJ=null,SJ_SKIPSG=0,SJ_LAST=null;
const sjL=(h,e)=>TX(h,e);
/* ---------- the ground ---------- */
const SJT={
 plain:{kj:'野',he:'שדה פתוח',en:'Open field',st:1,mv:{foot:1,horse:1,heavy:1}},
 paddy:{kj:'田',he:'שדות אורז',en:'Rice paddies',st:0,mv:{foot:2,horse:3,heavy:3},dhe:'בוץ ומים: מאט פרשים, בלי מחסה',den:'Mud and water: slows cavalry, no cover'},
 forest:{kj:'林',he:'יער',en:'Forest',st:2,mv:{foot:2,horse:3,heavy:3},cover:1},
 hill:{kj:'丘',he:'גבעה',en:'Hill',st:3,mv:{foot:2,horse:2,heavy:3},cover:1,high:1,dhe:'קשתים ומטילי אבנים יורים מכאן משבצת אחת רחוק יותר, ורואים רחוק',den:'Archers and stone throwers shoot one square farther from here, and see far'},
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
/* ---------- the men and the ships: the troops of the warring provinces, no firearms ---------- */
const SJU={
 yari:{kj:'槍',he:'אשיגרו',en:'Ashigaru',sh:'חניתות ארוכות',se:'long pikes',mt:'foot'},
 yumi:{kj:'弓',he:'קשתים',en:'Archers',sh:'מטחי חצים, גם חיצי אש',se:'arrow volleys, fire arrows too',mt:'foot'},
 ishi:{kj:'石',he:'מטילי אבנים',en:'Stone throwers',sh:'זולים, שוברים מורל',se:'cheap, break morale',mt:'foot'},
 kiba:{kj:'騎',he:'פרשים',en:'Cavalry',sh:'הסתערות מהירה',se:'fast charge',mt:'horse'},
 kisha:{kj:'騎射',he:'קשתים רכובים',en:'Horse archers',sh:'יורים תוך כדי רכיבה',se:'shoot on the move',mt:'horse'},
 sam:{kj:'侍',he:'סמוראים',en:'Samurai',sh:'עילית',se:'elite',mt:'foot'},
 monk:{kj:'僧',he:'נזירים לוחמים',en:'Warrior monks',sh:'נגינאטה',se:'naginata',mt:'foot'},
 shinobi:{kj:'忍',he:'שינובי',en:'Shinobi',sh:'סיירים נסתרים, רואים רחוק',se:'hidden scouts, see far',mt:'foot'},
 horo:{kj:'母衣',he:'הורו־שו',en:'Horo-shū',sh:'רוכבי הפיקוד: רק הם והמפקד כובשים אזורים',se:'command riders: only they and the commander take zones',mt:'horse'},
 kake:{kj:'掛矢',he:'שוברי שערים',en:'Gate breakers',sh:'פטישי עץ ענקיים',se:'giant wooden mallets',mt:'foot'},
 konida:{kj:'荷駄',he:'שיירת אספקה',en:'Supply train',sh:'ממלאת חצים ומרפאה',se:'refills arrows and heals',mt:'foot'},
 gen:{kj:'将',he:'המפקד',en:'Commander',sh:'אם הוא נופל, הקרב אבוד',se:'if he falls, the battle is lost',mt:'horse'},
 atake:{kj:'安宅',he:'אטקבונה',en:'Atakebune',sh:'מבצר צף של קשתים',se:'floating fortress of archers',mt:'hship'},
 seki:{kj:'関',he:'סקיבונה',en:'Sekibune',sh:'ספינת מלחמה, עולה לסיפון',se:'war galley, boards',mt:'ship'},
 kobaya:{kj:'小早',he:'קובאיה',en:'Kobaya',sh:'מהירה, חיצי אש',se:'fast, fire arrows',mt:'ship'},
 flag:{kj:'旗艦',he:'ספינת הדגל',en:'Flagship',sh:'אם היא טובעת, הקרב אבוד',se:'if she sinks, the battle is lost',mt:'hship'},
 gate:{kj:'門',he:'שער',en:'Gate',sh:'שוברים אותו כדי להיכנס',se:'break it to get in',mt:'none',st:1},
 yagura:{kj:'櫓',he:'מגדל יגורה',en:'Yagura',sh:'קשתים על החומה',se:'archers on the wall',mt:'none',st:1}};
/* damage at full strength, before ground and morale: who beats whom */
const SJB={
 yari:{yari:55,yumi:65,ishi:70,kiba:85,kisha:70,sam:40,monk:50,shinobi:55,horo:80,kake:70,konida:80,gen:45,gate:30,yagura:20},
 yumi:{yari:70,yumi:50,ishi:60,kiba:40,kisha:45,sam:45,monk:70,shinobi:50,horo:50,kake:75,konida:70,gen:40,gate:14,yagura:22},
 ishi:{yari:45,yumi:45,ishi:40,kiba:35,kisha:35,sam:25,monk:45,shinobi:40,horo:40,kake:55,konida:60,gen:25,gate:4,yagura:10},
 kiba:{yari:30,yumi:90,ishi:90,kiba:60,kisha:75,sam:50,monk:45,shinobi:70,horo:75,kake:85,konida:95,gen:55,gate:6,yagura:8},
 kisha:{yari:55,yumi:55,ishi:65,kiba:45,kisha:50,sam:40,monk:55,shinobi:50,horo:60,kake:65,konida:70,gen:40,gate:6,yagura:15},
 sam:{yari:65,yumi:80,ishi:85,kiba:65,kisha:70,sam:55,monk:70,shinobi:75,horo:75,kake:85,konida:85,gen:60,gate:35,yagura:30},
 monk:{yari:60,yumi:65,ishi:70,kiba:65,kisha:65,sam:45,monk:55,shinobi:60,horo:70,kake:75,konida:80,gen:45,gate:30,yagura:22},
 shinobi:{yari:35,yumi:55,ishi:55,kiba:30,kisha:40,sam:30,monk:35,shinobi:50,horo:60,kake:55,konida:85,gen:45,gate:20,yagura:25},
 horo:{yari:30,yumi:50,ishi:55,kiba:40,kisha:45,sam:35,monk:35,shinobi:50,horo:45,kake:55,konida:70,gen:35,gate:5,yagura:5},
 kake:{yari:35,yumi:45,ishi:45,kiba:25,kisha:30,sam:25,monk:30,shinobi:35,horo:35,kake:40,konida:50,gen:25,gate:120,yagura:60},
 gen:{yari:55,yumi:65,ishi:65,kiba:60,kisha:60,sam:50,monk:55,shinobi:60,horo:60,kake:70,konida:75,gen:50,gate:30,yagura:25},
 yagura:{yari:50,yumi:50,ishi:55,kiba:55,kisha:55,sam:40,monk:50,shinobi:45,horo:55,kake:60,konida:60,gen:35},
 atake:{atake:55,seki:70,kobaya:85,flag:50},
 seki:{atake:40,seki:55,kobaya:75,flag:40},
 kobaya:{atake:75,seki:40,kobaya:55,flag:60},
 flag:{atake:50,seki:65,kobaya:75,flag:45}};
const sjFam=t=>t==='yumi'||t==='ishi'||t==='kisha'?'arrows':t==='kiba'?'charge':t==='yari'||t==='sam'||t==='monk'?'pikes':null;
/* ---------- the commanders and their powers ---------- */
const SJCO={
 musashi:{kj:'二天一流',he:'שתי השמיים',en:'Niten Ichi-ryū',dh:'בקרב פנים אל פנים האויב מכה בחצי כוח, ואתם ב־+10%',de:'Hand to hand the enemy strikes at half strength, and you at +10%',noc:1,atk:1.1},
 kojiro:{kj:'燕返し',he:'הסנונית החוזרת',en:'Swallow Cut',dh:'בקרב פנים אל פנים +30%',de:'Hand to hand +30%',ctr:1.3},
 tomoe:{kj:'巴の騎',he:'פרשי טומואה',en:'Tomoe’s Riders',dh:'פרשים מהירים יותר ו־+35% התקפה',de:'Cavalry faster and +35% attack',mvT:{kiba:2,kisha:2,gen:1},atkT:{kiba:1.35,kisha:1.35}},
 benkei:{kj:'立往生',he:'עומד עד המוות',en:'Standing Death',dh:'כל היחידות מתרפאות 2, ואף אחת לא נופלת',de:'All units heal 2, and none can fall',heal:20,undying:1},
 masamune:{kj:'独眼竜',he:'הדרקון בעל העין האחת',en:'One-Eyed Dragon',dh:'קשתים וקשתים רכובים: +1 טווח ו־+30% התקפה',de:'Archers and horse archers: +1 range and +30% attack',rngT:{yumi:1,kisha:1},atkT:{yumi:1.3,kisha:1.3}},
 tadakatsu:{kj:'蜻蛉切',he:'חותך השפיריות',en:'Dragonfly Cutter',dh:'הנזק שאתם סופגים −35%, אשיגרו +25%',de:'Damage taken −35%, ashigaru +25%',def:.65,atkT:{yari:1.25}},
 yoshitsune:{kj:'鵯越',he:'הירידה מהצוק',en:'Hiyodori Descent',dh:'מהירים יותר, וכל שטח עביר כמו שדה פתוח',de:'Faster, and any ground is as easy as open field',mv:1,terr1:1,atk:1.1},
 yukimura:{kj:'真田丸',he:'מבצר סנאדה',en:'Sanada-maru',dh:'מרפא 1. יחידות במחסה: +2 כוכבים ו־+20% התקפה',de:'Heal 1. Units in cover: +2 stars and +20% attack',heal:10,coverSt:2,coverAtk:1.2},
 takeda:{kj:'風林火山',he:'רוח, יער, אש, הר',en:'Fūrinkazan',dh:'מהירים יותר, פרשים +30%',de:'Faster, cavalry +30%',mv:1,atkT:{kiba:1.3,kisha:1.3,gen:1.2}},
 odaPike:{kj:'長槍衾',he:'יער החניתות הארוכות',en:'Long-Pike Wall',dh:'אשיגרו +40% והנזק שהם סופגים −15%',de:'Ashigaru +40% and the damage they take −15%',atkT:{yari:1.4},def:.85},
 uesugi:{kj:'車懸り',he:'גלגל הקרון',en:'Kuruma-gakari',dh:'כל היחידות מתרפאות 1 ו־+20% התקפה',de:'All units heal 1 and +20% attack',heal:10,atk:1.2},
 shimazu:{kj:'釣り野伏せ',he:'מארב בנסיגה',en:'Tsuri-nobuse',dh:'יחידות ביער ובכפר +45% התקפה',de:'Units in forest and villages +45% attack',coverAtk:1.45},
 ikko:{kj:'南無阿弥陀仏',he:'תפילת הנאמנים',en:'Namu Amida Butsu',dh:'כל היחידות מתרפאות 2 ו־+10% התקפה',de:'All units heal 2 and +10% attack',heal:20,atk:1.1},
 hojo:{kj:'籠城',he:'מתבצרים',en:'Rōjō',dh:'הנזק שהם סופגים −35%',de:'Damage they take −35%',def:.65},
 date:{kj:'騎射',he:'קשתות מהסוס',en:'Kisha',dh:'פרשים +25%, קשתים רכובים +35%',de:'Cavalry +25%, horse archers +35%',atkT:{kiba:1.25,kisha:1.35,yumi:1.2}},
 sanada:{kj:'奇策',he:'תחבולה',en:'Kisaku',dh:'מלכודות: כל יחידה שלכם מאבדת 1',de:'Traps: every unit of yours loses 1',trap:10},
 tokugawa:{kj:'忍耐',he:'סבלנות',en:'Endurance',dh:'מתרפאים 1, והנזק שהם סופגים −30%',de:'Heal 1, damage they take −30%',heal:10,def:.7},
 mori:{kj:'火矢',he:'חיצי אש',en:'Fire arrows',dh:'ספינות +35% התקפה ומהירות',de:'Ships +35% attack and speed',atk:1.35,mv:1},
 mongol:{kj:'蒙古騎射',he:'רוכבי הערבות',en:'Steppe riders',dh:'מהירים יותר ו־+30% התקפה',de:'Faster and +30% attack',mv:1,atk:1.3},
 ming:{kj:'弩',he:'קשתות הצלב של מינג',en:'Ming crossbows',dh:'יחידות טווח +40%',de:'Ranged units +40%',atkT:{yumi:1.4,ishi:1.4,kisha:1.4,atake:1.4}},
 wako:{kj:'倭寇',he:'שודדי הים',en:'Wakō raid',dh:'מהירים יותר ו־+15% התקפה',de:'Faster and +15% attack',mv:2,atk:1.15},
 kachi:{kj:'鬨の声',he:'זעקת הקרב',en:'War Cry',dh:'+25% התקפה לכל היחידות',de:'+25% attack for all units',atk:1.25}};
function sjCoKey(side){try{if(side==='me'){const h=HEROES[S.hero];return h&&SJCO[h.id]?h.id:'kachi'}const fd=SJ&&SJ.ctx.fd;if(fd&&fd.sjHero&&SJCO[fd.sjHero])return fd.sjHero;
 const k=WAR&&WAR.docKey;if(k==='oda')return'odaPike';if(k&&SJCO[k])return k;if(SJ&&SJ.sea)return'mori';return'kachi'}catch(e){return'kachi'}}
/* ---------- the formations, 八陣: chosen before the battle, they shape the line and how it fights ---------- */
const SJ_FORM={
 gyorin:{kj:'魚鱗',he:'קשקשי הדג',en:'Fish Scales',dh:'המרכז דחוס ופורץ: קרב פנים אל פנים +15%, אבל סופגים +5%',de:'A dense, driving centre: hand to hand +15%, but you take +5%',atkM:1.15,def:1.05,lay:'center'},
 kakuyoku:{kj:'鶴翼',he:'כנפי העגור',en:'Crane Wings',dh:'אגפים פרושים: מי שתוקף אויב שכבר נלחם ביחידה אחרת שלכם +25%',de:'Spread wings: striking a foe already fighting another of your units +25%',flank:1.25,lay:'wings'},
 hoshi:{kj:'鋒矢',he:'ראש החץ',en:'Arrowhead',dh:'הסתערות: +15% מהירות, והמכה הראשונה אחרי תנועה +40%',de:'The charge: +15% speed, and the first blow after moving +40%',sp:1.15,charge:1.4,def:1.08,lay:'point'},
 engetsu:{kj:'偃月',he:'חצי הסהר',en:'Half Moon',dh:'המפקד מוביל: הוא +30%, וההשראה שלו מגיעה רחוק פי 1.5',de:'The commander leads: he fights at +30%, and his presence reaches 1.5× as far',genAtk:1.3,aura:1.5,lay:'center'},
 ganko:{kj:'雁行',he:'מעוף האווזים',en:'Wild Geese',dh:'קו מדורג: יחידות טווח +15% ורואים רחוק יותר',de:'A staggered line: ranged units +15% and you see farther',atkR:1.15,vis:.4,lay:'line'},
 choda:{kj:'長蛇',he:'הנחש הארוך',en:'Long Snake',dh:'טור גמיש: +15% מהירות, והמורל יורד לאט יותר',de:'A flexible column: +15% speed, and morale falls more slowly',sp:1.15,sup:.9,lay:'line'},
 koyaku:{kj:'衡軛',he:'העול',en:'Yoke',dh:'שורות צמודות: המורל יורד ב־25% פחות',de:'Locked ranks: morale falls 25% less',sup:.75,lay:'line'},
 hoen:{kj:'方円',he:'המעגל',en:'Circle',dh:'הגנה מכל הכיוונים: סופגים −12%, אבל −10% מהירות',de:'Defence on every side: take −12%, but −10% speed',def:.88,sp:.9,lay:'ring'}};
/* ---------- the stratagems, 計略: one each battle ---------- */
const SJ_KEI={
 yoshu:{kj:'夜襲',he:'פשיטת לילה',en:'Night raid',dh:'25 שניות: האויב רואה חצי, והמורל שלו נפגע',de:'25 seconds: the enemy sees half as far, and his morale is shaken'},
 kakei:{kj:'火計',he:'מתקפת אש',en:'Fire attack',dh:'מציתים יער וכפרים: כל אויב שמסתתר בהם נפגע ונשבר',de:'Set forest and villages alight: every foe hiding in them is hurt and shaken'},
 fukuhei:{kj:'伏兵',he:'כוח מארב',en:'Ambush',dh:'25 שניות: היחידות שלך ביער ובכפר נעלמות ומכות +40%',de:'25 seconds: your units in forest and villages vanish and strike +40%'},
 giho:{kj:'偽報',he:'ידיעה כוזבת',en:'False report',dh:'שליח מזויף: כל יחידות האויב עוצרות ל־8 שניות',de:'A forged messenger: every enemy unit halts for 8 seconds'}};
/* ---------- small helpers ---------- */
const sjK=(x,y)=>x+y*SJ_C;
const sjIn=(x,y)=>x>=0&&y>=0&&x<SJ_C&&y<SJ_R;
const sjTile=(x,y)=>SJ.map[clamp(Math.floor(y),0,SJ_R-1)][clamp(Math.floor(x),0,SJ_C-1)];
const sjFoe=side=>side==='me'?'foe':'me';
const sjHPd=u=>Math.max(0,Math.ceil(u.hp/10));
const sjName=t=>sjL(SJU[t].he,SJU[t].en);
const sjTName=k=>sjL(SJT[k].he,SJT[k].en);
function sjPow(side){const p=SJ.pow[side];return p?SJCO[p]:null}
function sjForm(side){return SJ&&SJ.form&&SJ_FORM[SJ.form[side]]||null}

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
/* power decides the numbers: the side with more men brings more and fuller units, never past ten */
function sjBudget(my,foe){const r=clamp(my/Math.max(1,foe),.2,5);let a=70*Math.sqrt(r),b=70/Math.sqrt(r);const top=Math.max(a,b);if(top>100){a*=100/top;b*=100/top}return[clamp(Math.round(a/5)*5,20,100),clamp(Math.round(b/5)*5,20,100)]}
function sjCost(u,tk){const U=SJU[u.t],T=SJT[tk];if(!U||!T||!U.mt||U.mt==='none')return 99;const c=T.mv[U.mt];if(c==null)return 99;const p=SJ&&SJ.pow&&sjPow(u.side);return p&&p.terr1?1:c}
function sjLuck(){try{return clamp(1+(LK().dmg||0)-.08*curse()+.05*goodKarma(),.7,1.3)}catch(e){return 1}}
function sjAtkMul(a,ax,ay){let m=1;const D=WAR&&WAR.doc,f=sjFam(a.t),w=WX();
 if(!SJ.sea){if(a.t==='yumi'||a.t==='ishi'||a.t==='kisha')m*=w.arrows;else if(a.t==='kiba')m*=w.charge}
 if(a.side==='me'){if(f)m*=Math.min(1.45,Math.sqrt(tacBonus(f)));m*=SJ.luck;if(D){if(D.gunWeak&&a.t==='yumi')m*=1.25;if(D.flank&&a.t==='kiba')m*=1.2;if(D.tough)m*=D.tough}}
 else if(D){if(f&&D.mul&&D.mul[f])m*=Math.sqrt(D.mul[f]);if(D.grow)m*=1+D.grow*.5*(SJ.day-1);if(D.first&&SJ.day===1)m*=Math.sqrt(D.first);if(D.feint)m*=SJ.day===1?.8:SJ.day===2?1.3:1;if(D.naval&&SJ.sea)m*=Math.sqrt(D.naval)}
 const p=sjPow(a.side);if(p){m*=p.atk||1;if(p.atkT&&p.atkT[a.t])m*=p.atkT[a.t];if(p.coverAtk&&SJT[sjTile(ax,ay)].cover)m*=p.coverAtk}
 return m}
function sjWallMul(d){const T=SJT[sjTile(d.x,d.y)];if(!T.keep||SJ.keepSide!==d.side)return 1;try{return Math.sqrt(clamp(defMul(d.side),.4,1))}catch(e){return .87}}
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
const SJ_PORC={};
function sjPortrait(side){try{if(side==='me')return portrait(S.look||HEROES[S.hero].look,'lvl'+S.hero);const fd=SJ.ctx.fd||{};if(fd.sjHeroIdx!=null&&HEROES[fd.sjHeroIdx])return portrait(fd.look||HEROES[fd.sjHeroIdx].look,HEROES[fd.sjHeroIdx].id);return portrait(fd.look||{},fd.name||'foe')}catch(e){return null}}
function sjDrawCut(g,W,H,dt){const c=SJ.cut;c.life-=dt*.75*(SJ.spd>1?2:1);const k=clamp(Math.min(c.life*3,(1-c.life)*6),0,1);const P=SJCO[c.k],me=c.side==='me',col=SJ_COL[c.side];
 g.save();g.globalAlpha=k;g.fillStyle='rgba(0,0,0,.55)';g.fillRect(0,0,W,H);const bh=150,by=H/2-bh/2;const gr=g.createLinearGradient(0,by,W,by);gr.addColorStop(0,me?'#1a2a5a':'#0a0606');gr.addColorStop(1,me?'#0a0606':'#5a1410');
 g.fillStyle=gr;g.fillRect(0,by,W,bh);g.fillStyle='#e6b450';g.fillRect(0,by,W,3);g.fillRect(0,by+bh-3,W,3);
 const por=sjPortrait(c.side);const ps=bh-16,px=me?16:W-16-ps;if(por){g.imageSmoothingEnabled=por.width>=96;g.drawImage(por,px,by+8,ps,ps);g.imageSmoothingEnabled=false;g.strokeStyle=col.m;g.lineWidth=3;g.strokeRect(px,by+8,ps,ps)}
 const tx=me?px+ps+16:px-16;g.textAlign=me?'left':'right';g.font="40px 'Yuji Syuku',serif";g.fillStyle='#ffe39a';g.strokeStyle='#000';g.lineWidth=5;g.strokeText(P.kj,tx,by+54);g.fillText(P.kj,tx,by+54);
 g.font="20px 'Suez One',serif";g.fillStyle='#fff';g.fillText(sjL(P.he,P.en),tx,by+84);g.font="13px Rubik,sans-serif";g.fillStyle='#e8dcc0';const words=sjL(P.dh,P.de);const mw=W-ps-60;let line='',ly=by+106;for(const wd of words.split(' ')){const tl=line?line+' '+wd:wd;if(g.measureText(tl).width>mw){g.fillText(line,tx,ly);ly+=16;line=wd}else line=tl}g.fillText(line,tx,ly);
 g.textAlign='left';g.restore()}
/* ---------- real time, in the manner of WARNO, with the troops and the arts of war of old Japan ---------- */
const SJ_COST={yari:10,yumi:12,ishi:7,kiba:16,kisha:15,sam:18,monk:11,shinobi:9,horo:12,kake:10,konida:8,seki:12,kobaya:9,atake:22};
/* sp tiles per second · rg range in tiles (0 = hand to hand) · rl reload · k damage per blow · vis sight · sm shock to morale · ammo volleys · cmd takes zones */
const SJ_RT={
 yari:{sp:.55,rg:0,rl:1.6,k:.15,vis:2.6,sm:.9},
 yumi:{sp:.55,rg:2.6,rl:3,k:.2,vis:2.8,sm:1,ammo:24},
 ishi:{sp:.55,rg:1.9,rl:2.2,k:.12,vis:2.6,sm:2.1,ammo:30},
 kiba:{sp:1.05,rg:0,rl:1.5,k:.17,vis:3.3,sm:1.15},
 kisha:{sp:1,rg:2.2,rl:2.6,k:.17,vis:3.3,sm:1.1,ammo:16,mf:.85},
 sam:{sp:.6,rg:0,rl:1.4,k:.17,vis:2.8,sm:1},
 monk:{sp:.55,rg:0,rl:1.6,k:.15,vis:2.6,sm:.9},
 shinobi:{sp:.75,rg:0,rl:1.5,k:.14,vis:4.2,sm:.8,stealth:1},
 horo:{sp:1,rg:0,rl:1.6,k:.12,vis:3.4,sm:.8,cmd:1},
 kake:{sp:.42,rg:0,rl:2.4,k:.2,vis:2.2,sm:.7},
 konida:{sp:.45,rg:0,rl:99,k:0,vis:2.2,sm:0,supply:1},
 gen:{sp:.7,rg:0,rl:1.5,k:.15,vis:3.2,sm:.6,cmd:1},
 seki:{sp:.6,rg:0,rl:1.6,k:.17,vis:3,sm:1},
 kobaya:{sp:.95,rg:0,rl:1.5,k:.15,vis:3.2,sm:1.1},
 atake:{sp:.42,rg:2.6,rl:4,k:.28,vis:3,sm:1.4,ammo:40,mf:.7},
 flag:{sp:.45,rg:2.6,rl:4,k:.24,vis:3.2,sm:1,ammo:40,mf:.7,cmd:1},
 gate:{sp:0,rg:0,rl:99,k:0,vis:1.5,sm:0},
 yagura:{sp:0,rg:2.6,rl:3.5,k:.2,vis:3.2,sm:0}};
const SJ_STEP=.05,SJ_SCORE=120,SJ_MAXU=14;
let SJ_ID=0;
function sjMk(side,t,x,y,hp){const R=SJ_RT[t]||{};return{id:++SJ_ID,side,t,x,y,hp,sup:0,st:'ok',ord:null,path:null,cd:Math.random(),stillT:9,mvT:9,rev:0,hitT:9,vis:{me:0,foe:0},last:{},face:side==='me'?1:-1,gen:t==='gen'||t==='flag',ph:Math.random()*6,arr:0,ammo:R.ammo?Math.round(R.ammo*((SJ&&SJ.mods&&SJ.mods[side]&&SJ.mods[side].ammo)||1)):0}}
const sjAtt=()=>WAR.defender==='foe'?'me':WAR.defender==='me'?'foe':null;
const sjRT=u=>SJ_RT[u.t]||SJ_RT.yari;
const sjDist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const sjCover=k=>k==='forest'||k==='village';
const sjEf=(side,k)=>SJ.ef[side]&&SJ.ef[side][k]>SJ.t;
function sjStr(side){let s=SJ.budget[side]-SJ.spent[side];for(const u of SJ.units)if(u.side===side&&u.hp>0&&!u.gen&&!SJU[u.t].st)s+=u.hp/100*(SJ_COST[u.t]||10);return Math.max(0,s)}
/* ---------- everything the realm has built goes to war with it ---------- */
function sjMods(side){const M={dmg:{},sp:{},rl:1,sup:1,def:1,sdef:1,aura:1,vis:0,ammo:1,genAtk:1,list:[]};const add=(ic,h,e)=>M.list.push({ic,h,e});const pct=v=>(v>=1?'+':'−')+Math.round(Math.abs(v-1)*100)+'%';
 try{if(side==='me'){const A=S.arm||{},ar=a=>clamp(a,0,10);
  if(A.yari){M.dmg.yari=1+.07*ar(A.yari);add('槍',`חניתות משופרות: אשיגרו ${pct(M.dmg.yari)}`,`Better pikes: ashigaru ${pct(M.dmg.yari)}`)}
  const bow=.07*ar(A.yumi||0)+.04*ar(A.gun||0);if(bow){M.dmg.yumi=M.dmg.kisha=1+bow;add('弓',`קשתות משובחות: קשתים ${pct(1+bow)}`,`Fine bows: archers ${pct(1+bow)}`)}
  if(A.gusoku){M.def=Math.max(.7,1-.04*ar(A.gusoku));add('具足',`שריון: נזק שסופגים ${pct(M.def)}`,`Armour: damage taken ${pct(M.def)}`)}
  const ret=(S.clan&&S.clan.ret)||[];if(ret.length){const lv=ret.reduce((a,r)=>a+(r.level||1),0)/ret.length;M.dmg.sam=Math.min(1.3,1+.03*lv);add('侍',`${ret.length} שומרי ראש ברמה ${Math.round(lv)}: סמוראים ${pct(M.dmg.sam)}`,`${ret.length} retainers at level ${Math.round(lv)}: samurai ${pct(M.dmg.sam)}`)}
  if(bl('stables')){M.sp.kiba=M.sp.kisha=M.sp.horo=Math.min(1.2,1+.04*bl('stables'));add('厩',`אורוות: פרשים ${pct(M.sp.kiba)} מהירות`,`Stables: cavalry ${pct(M.sp.kiba)} speed`)}
  if(fa('horse')>0){const h=1+Math.min(.2,fa('horse')/60);M.dmg.kiba=(M.dmg.kiba||1)*h;add('馬',`סוסים מהחווה: הסתערות ${pct(h)}`,`Horses from the farm: charge ${pct(h)}`)}
  const mor=S.est&&S.est.mor!=null?S.est.mor:50;M.sup=clamp(1.2-mor/250,.75,1.2);add('士気',`מורל הצבא ${Math.round(mor)}: לחץ ${pct(M.sup)}`,`Army morale ${Math.round(mor)}: stress ${pct(M.sup)}`);
  const trn=S.est&&S.est.tr!=null?S.est.tr:40;M.rl=clamp(1.1-trn/400-Math.min(.1,(S.drill||0)*.01),.78,1.1);add('調練',`אימון ${Math.round(trn)}: קצב מכות ${pct(2-M.rl)}`,`Training ${Math.round(trn)}: blow rate ${pct(2-M.rl)}`);
  const st=S.stats||{};M.genAtk=1+((st.str||0)+(st.atk||0))*.006;M.aura=Math.min(1.6,1+(st.cha||0)*.02);add('将',`המפקד (כוח ${(st.str||0)+(st.atk||0)}, כריזמה ${st.cha||0}): ${pct(M.genAtk)} והשראה ${pct(M.aura)}`,`The commander (might ${(st.str||0)+(st.atk||0)}, charisma ${st.cha||0}): ${pct(M.genAtk)} and presence ${pct(M.aura)}`);
  if(dl('spies')){M.vis=Math.min(1,.25*dl('spies'));add('忍',`רשת מרגלים: רואים +${M.vis.toFixed(2)} משבצות, ושינובי זמינים`,`Spy network: sight +${M.vis.toFixed(2)} squares, and shinobi ready`)}
  if(dl('wall')){M.sdef=Math.max(.6,1-.06*dl('wall'));if(SJ.keepSide==='me')add('石垣',`חומות מחוזקות: השערים והמגדלים סופגים ${pct(M.sdef)}`,`Strong walls: gates and towers take ${pct(M.sdef)}`)}
  const rice=(S.mat&&S.mat.rice)||0;M.ammo=rice>=200?1.25:rice<40?.8:1;if(M.ammo!==1)add('兵糧',M.ammo>1?`מחסני אורז מלאים: חצים ${pct(M.ammo)}`:`מעט אורז: חצים ${pct(M.ammo)}`,M.ammo>1?`Full rice stores: arrows ${pct(M.ammo)}`:`Little rice: arrows ${pct(M.ammo)}`);
  const sg=tv('siege');if(sg){M.dmg.kake=1+sg;add('攻城',`מחקר מצור: שוברי שערים ${pct(M.dmg.kake)}`,`Siege research: gate breakers ${pct(M.dmg.kake)}`)}
  if(SJ.luck!==1)add('運',`מזל וכבוד: ${pct(SJ.luck)}`,`Luck and honour: ${pct(SJ.luck)}`)}
 else{const L=(SJ.ctx.fd&&SJ.ctx.fd.level)||1,q=1+Math.min(.25,L*.005);for(const k of Object.keys(SJ_RT))M.dmg[k]=q;if(WAR.docKey==='ikko')M.sup=.7;if(SJ.ctx.kind==='empire'||SJ.ctx.kind==='foreign')M.def=.92}
 const tk=typeof todK==='function'?todK():'day',w=S&&S.wx;if(tk==='night'){M.visMul=.7;if(side==='me')add('夜',`לילה: רואים פחות`,`Night: sight is short`)}if(w==='fog'){M.visMul=(M.visMul||1)*.75;if(side==='me')add('霧',`ערפל: רואים פחות`,`Fog: sight is short`)}if(w==='rain'&&side==='me')add('雨',`גשם: מיתרי הקשתות נרטבים`,`Rain: the bowstrings get wet`)}catch(e){console.warn('sj mods',e)}
 return M}
function sjRg(u){let r=sjRT(u).rg;if(!r)return 0;if(sjRT(u).ammo&&u.ammo<=0)return 0;if(!SJ.sea&&SJT[sjTile(u.x,u.y)].high)r+=1;const p=sjPow(u.side);if(p&&p.rngT&&p.rngT[u.t])r+=p.rngT[u.t];return r}
function sjSpd(u){let s=sjRT(u).sp*((SJ.mods[u.side].sp[u.t])||1);const f=sjForm(u.side);if(f&&f.sp)s*=f.sp;if(u.st==='pin')s*=.55;if(u.st==='rout')s*=1.15;const p=sjPow(u.side);if(p){s*=1+.18*((p.mv||0)+((p.mvT&&p.mvT[u.t])||0))}if(S&&S.wx==='snow'&&(u.t==='kiba'||u.t==='kisha'))s*=.8;return s}
function sjVis(v){const M=SJ.mods[v.side],f=sjForm(v.side);let r=sjRT(v).vis+M.vis+(f&&f.vis||0);if(SJT[sjTile(v.x,v.y)].high)r+=1.4;r*=M.visMul||1;if(sjEf(v.side,'blind'))r*=.5;return r}
/* ---------- the ground underfoot ---------- */
function sjPassT(u,tx,ty){if(!sjIn(tx,ty))return 99;const c=sjCost(u,SJ.map[ty][tx]);if(c>=99)return 99;for(const g of SJ.units)if(g.t==='gate'&&g.hp>0&&g.side!==u.side&&Math.floor(g.x)===tx&&Math.floor(g.y)===ty)return 99;return c}
function sjPathTo(u,fx,fy){const sx=clamp(Math.floor(u.x),0,SJ_C-1),sy=clamp(Math.floor(u.y),0,SJ_R-1);let tx=clamp(Math.floor(fx),0,SJ_C-1),ty=clamp(Math.floor(fy),0,SJ_R-1);
 if(sjPassT(u,tx,ty)>=99){let best=null;for(let y=0;y<SJ_R;y++)for(let x=0;x<SJ_C;x++){if(sjPassT(u,x,y)>=99)continue;const d=Math.hypot(x+.5-fx,y+.5-fy);if(!best||d<best[0])best=[d,x,y]}if(!best)return null;tx=best[1];ty=best[2];fx=tx+.5;fy=ty+.5}
 const N=SJ_C*SJ_R,dist=new Float32Array(N).fill(1e9),prev=new Int16Array(N).fill(-1),q=[[0,sx,sy]];dist[sjK(sx,sy)]=0;
 while(q.length){let bi=0;for(let i=1;i<q.length;i++)if(q[i][0]<q[bi][0])bi=i;const[c,x,y]=q.splice(bi,1)[0];if(c>dist[sjK(x,y)])continue;if(x===tx&&y===ty)break;
  for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,cc=sjPassT(u,nx,ny);if(cc>=99)continue;const k=sjK(nx,ny),nc=c+cc;if(nc<dist[k]){dist[k]=nc;prev[k]=sjK(x,y);q.push([nc,nx,ny])}}}
 if(dist[sjK(tx,ty)]>=1e9)return null;const p=[];let k=sjK(tx,ty);const s0=sjK(sx,sy);while(k>=0&&k!==s0){p.unshift([k%SJ_C+.5,((k/SJ_C)|0)+.5]);k=prev[k]}
 if(p.length)p[p.length-1]=[fx,fy];else p.push([fx,fy]);return p}
function sjMoveStep(u,dt){if(!u.path||!u.path.length)return false;if(sjEf(u.side,'halt')&&u.st!=='rout')return false;const[wx,wy]=u.path[0],dx=wx-u.x,dy=wy-u.y,d=Math.hypot(dx,dy);
 const p=sjPow(u.side),tc=sjCost(u,sjTile(u.x,u.y)),c=p&&p.terr1?1:clamp(tc>=99?1:tc,1,4);const sp=sjSpd(u)/c*dt;
 if(d<=sp){u.x=wx;u.y=wy;u.path.shift()}else{u.x+=dx/d*sp;u.y+=dy/d*sp}if(Math.abs(dx)>.02)u.face=dx>0?1:-1;u.mvT=0;return true}
/* ---------- orders ---------- */
function sjGo(u,tx,ty,flee){if(u.ord&&u.ord.k==='move'&&Math.hypot(u.ord.x-tx,u.ord.y-ty)<.45&&u.path)return;const p=sjPathTo(u,tx,ty);if(!p)return;u.ord={k:'move',x:tx,y:ty,flee:!!flee};u.path=p}
function sjAtk(u,e){if(u.ord&&u.ord.k==='atk'&&u.ord.tg===e)return;u.ord={k:'atk',tg:e};u.path=null;u.rp=-9}
function sjHalt(u){u.ord=null;u.path=null}
/* ---------- seeing ---------- */
function sjVision(){for(const s of['me','foe']){const vw=SJ.units.filter(u=>u.hp>0&&u.side===s);
  for(const e of SJ.units){if(e.hp<=0||e.side===s)continue;if(SJU[e.t].st){e.vis[s]=1;continue}const tk=sjTile(e.x,e.y),R=sjRT(e);
   const amb=sjEf(e.side,'amb')&&sjCover(tk),hid=e.rev<=0&&(R.stealth||sjCover(tk)),close=R.stealth||amb?1.2:1.6;let seen=0;
   for(const v of vw){const r=sjVis(v);if(sjDist(v,e)<=(hid||amb?Math.min(close,r):r)){seen=1;break}}
   if(seen)e.last[s]={x:e.x,y:e.y,t:SJ.t};e.vis[s]=seen}}
 const g=SJ.fog||(SJ.fog=new Uint8Array(SJ_C*SJ_R));g.fill(0);for(const v of SJ.units){if(v.hp<=0||v.side!=='me')continue;const r=sjVis(v)+.35;for(let y=0;y<SJ_R;y++)for(let x=0;x<SJ_C;x++)if(Math.hypot(x+.5-v.x,y+.5-v.y)<=r)g[sjK(x,y)]=1}}
/* ---------- blows ---------- */
function sjReachD(u,e){const d=sjDist(u,e),rg=sjRg(u);if(rg>0)return d<=rg+(SJU[e.t].st?.45:0)&&d>=(sjRT(u).mn||0);return d<=.85+(SJU[e.t].st?.3:0)}
function sjDmgRT(a,d){const B=SJB[a.t]&&SJB[a.t][d.t];if(B==null)return 0;const R=sjRT(a),melee=!sjRg(a),Ma=SJ.mods[a.side],Md=SJ.mods[d.side],fa=sjForm(a.side),fd=sjForm(d.side);
 let v=B*R.k*Math.ceil(a.hp/10)/10*sjAtkMul(a,Math.floor(a.x),Math.floor(a.y))*(Ma.dmg[a.t]||1);if(a.gen)v*=Ma.genAtk*(fa&&fa.genAtk||1);
 if(fa){v*=melee?(fa.atkM||1):(fa.atkR||1);if(melee&&fa.flank&&SJ.units.some(o=>o!==a&&o.side===a.side&&o.hp>0&&!sjRg(o)&&sjDist(o,d)<.95))v*=fa.flank;if(melee&&fa.charge&&a.mvT<1)v*=fa.charge}
 if(sjEf(a.side,'amb')&&sjCover(sjTile(a.x,a.y)))v*=1.4;
 const pd=sjPow(d.side),pa=sjPow(a.side);if(!SJU[d.t].st){const T=SJT[sjTile(d.x,d.y)];let st=T.st;if(pd&&pd.coverSt&&T.cover)st+=pd.coverSt;v*=(1-.09*st)*Md.def*(fd&&fd.def||1)}else v*=Md.sdef;
 v*=sjWallMul(d);if(d.gen)v*=d.t==='flag'?.4:.55;if(a.st==='pin')v*=.6;if(d.st==='rout')v*=1.25;if(pd&&pd.def)v*=pd.def;if(melee&&pa&&pa.ctr)v*=pa.ctr;if(melee&&pd&&pd.noc)v*=.5;return v*rnd(.88,1.12)}
function sjApply(a,d,v,sh){if(v<=0||d.hp<=0)return;const p=sjPow(d.side),h0=d.hp;let hp=d.hp-v;if(p&&p.undying&&!SJU[d.t].st)hp=Math.max(10,hp);d.hp=Math.max(0,hp);const dealt=h0-d.hp;
 if(!SJU[d.t].st){const f=sjForm(d.side);d.sup=Math.min(d.gen?80:100,d.sup+dealt*(sh||sjRT(a).sm)*.75*SJ.mods[d.side].sup*(f&&f.sup||1));d.hitT=0}
 for(const[s,f]of[[a.side,.5],[d.side,.7]])if(!SJ.pow[s])SJ.meter[s]=Math.min(SJ_PMAX,SJ.meter[s]+dealt*f);
 SJ.loss[d.side]+=dealt;if(Math.ceil(h0/10)!==Math.ceil(d.hp/10)&&!SJ.fast)sjFx(d.x,d.y-.2,'-'+(Math.ceil(h0/10)-Math.ceil(d.hp/10)),d.side==='me'?'#ff8a6a':'#ffb35a');
 if(d.hp<=0){if(!SJ.fast)sjFx(d.x,d.y,d.gen?sjL('נפל!','Fallen!'):'✕','#fff');if(d.t==='gate'){SJ.map[Math.floor(d.y)][Math.floor(d.x)]='castle';sjTerrainCache();SJ.ban={t:sjL('門 השער נפרץ!','門 The gate is broken!'),c:'#ffe39a',life:1.4}}}}
function sjFire(u,e,moving){const R=sjRT(u),rg=sjRg(u)>0;u.cd=R.rl*SJ.mods[u.side].rl*(u.st==='pin'?1.4:1)*rnd(.9,1.1);if(rg){u.rev=2;if(R.ammo)u.ammo=Math.max(0,u.ammo-1)}else u.rev=Math.max(u.rev,1);
 sjApply(u,e,sjDmgRT(u,e)*(moving?(R.mf||.6):1));
 if(e.x!==u.x)u.face=e.x>u.x?1:-1;if(SJ.fast)return;
 const fire=rg&&e.t==='gate',kind=!rg?'melee':u.t==='ishi'?'stone':'arrow';SJ.proj.push({k:kind,fire,x0:u.x,y0:u.y,x1:e.x,y1:e.y,t:0,d:kind==='arrow'?.7:kind==='stone'?.5:.3,side:u.side});
 const now=performance.now();if(now-(SJ.sfxT||0)>180){SJ.sfxT=now;try{sfx(kind==='melee'?'clang':'swish')}catch(e){}}}
function sjBestTg(u){let best=null,bs=-1e9;for(const e of SJ.units){if(e.hp<=0||e.side===u.side||!e.vis[u.side])continue;const B=SJB[u.t]&&SJB[u.t][e.t];if(B==null||!sjReachD(u,e))continue;const s=B*(1.6-e.hp/100)+(e.gen?25:0)+(e.st==='rout'?-20:0)-(SJU[e.t].st&&u.t!=='kake'?30:0);if(s>bs){bs=s;best=e}}return best}
/* ---------- one beat of the battle ---------- */
function sjAuraR(side){const f=sjForm(side);return 2.6*SJ.mods[side].aura*(f&&f.aura||1)}
function sjUnit(u,dt){const R=sjRT(u);u.cd-=dt;u.rev-=dt;u.hitT+=dt;u.mvT+=dt;
 if(!SJU[u.t].st){if(u.hitT>1.5){let dec=7;if(!u.gen){const g=SJ.units.find(v=>v.gen&&v.side===u.side&&v.hp>0);if(g&&sjDist(g,u)<=sjAuraR(u.side))dec+=7}if(SJT[sjTile(u.x,u.y)].cover)dec+=2;u.sup=Math.max(0,u.sup-dec*dt)}
  if(u.st==='rout'){if(u.sup<35){u.st='ok';u.path=null;if(!SJ.fast)sjFx(u.x,u.y,sjL('מתאוששים','Rallied'),'#9ef08a')}}
  else if(u.sup>=92&&!u.gen){u.st='rout';sjHalt(u);if(!SJ.fast)sjFx(u.x,u.y,sjL('敗走 בורחים!','敗走 Routing!'),'#ffb0a0')}else u.st=u.sup>=55?'pin':'ok';
  /* the supply train and the field HQ refill quivers and tend the wounded */
  if(u.hitT>2){const h=SJ.hq[u.side],atHQ=Math.hypot(u.x-h[0]-.5,u.y-h[1]-.5)<1.6,cart=SJ.units.some(c=>c.t==='konida'&&c.side===u.side&&c.hp>0&&c!==u&&sjDist(c,u)<1.6);
   if(atHQ||cart){if(R.ammo&&u.ammo<R.ammo){u.rs=(u.rs||0)+dt;if(u.rs>=1){u.rs=0;u.ammo++}}if(u.hp<100&&!u.gen)u.hp=Math.min(100,u.hp+(cart?1.5:1)*dt)}}}
 if(u.st==='rout'){const h=SJ.hq[u.side];if(!u.path||!u.path.length){if(Math.hypot(u.x-h[0]-.5,u.y-h[1]-.5)>.7)u.path=sjPathTo(u,h[0]+.5,h[1]+.5)}sjMoveStep(u,dt);u.stillT=0;return}
 let tg=null,moved=false;const o=u.ord;
 if(!SJB[u.t]){if(o&&o.k==='move'){moved=sjMoveStep(u,dt);if(!u.path||!u.path.length)u.ord=null}return}
 if(o&&o.k==='atk'){const e=o.tg,L=e&&e.last[u.side];if(!e||e.hp<=0||(!e.vis[u.side]&&(!L||SJ.t-L.t>4))){sjHalt(u)}
  else if(e.vis[u.side]&&sjReachD(u,e)){tg=e;u.path=null}
  else if(R.sp>0){if(!u.path||!u.path.length||SJ.t-(u.rp||0)>.8){u.rp=SJ.t;const P=e.vis[u.side]?e:L;u.path=sjPathTo(u,P.x,P.y);if(!u.path)sjHalt(u)}if(u.path)moved=sjMoveStep(u,dt)}}
 else if(o&&o.k==='move'){moved=sjMoveStep(u,dt);if(!u.path||!u.path.length)u.ord=null}
 if(!tg){tg=sjBestTg(u);
  if(!tg&&!u.ord&&R.sp>0&&!sjRg(u)&&!R.cmd&&u.t!=='shinobi'&&!(u.side==='me'&&!SJ.auto.me&&u.hold)){let best=null,bd=1.5;for(const e of SJ.units){if(e.hp<=0||e.side===u.side||!e.vis[u.side]||SJU[e.t].st)continue;const B=SJB[u.t][e.t];if(B==null||B<50)continue;const d=sjDist(u,e);if(d<bd){bd=d;best=e}}if(best)u.ord={k:'atk',tg:best,auto:1}}}
 u.stillT=moved?0:u.stillT+dt;
 if(tg&&u.cd<=0)sjFire(u,tg,moved&&sjRg(u)>0)}
function sjSep(){const us=SJ.units.filter(u=>u.hp>0&&!SJU[u.t].st);for(let i=0;i<us.length;i++)for(let j=i+1;j<us.length;j++){const a=us[i],b=us[j];let dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);const m=a.side===b.side?.42:.55;if(d>=m)continue;if(d<1e-4){dx=Math.random()-.5;dy=Math.random()-.5;d=Math.hypot(dx,dy)}
  const p=(m-d)/2;for(const[u,s]of[[a,-1],[b,1]]){const nx=u.x+dx/d*p*s,ny=u.y+dy/d*p*s;if(sjPassT(u,Math.floor(nx),Math.floor(ny))<99&&nx>.05&&ny>.05&&nx<SJ_C-.05&&ny<SJ_R-.05){u.x=nx;u.y=ny}}}}
/* a zone is taken by command riders (or the commander), and held while no enemy stands in it; at sea every ship can take one */
function sjZonesTick(dt){const att=sjAtt();for(const z of SJ.zones){let m=0,f=0,cm=0,cf=0;for(const u of SJ.units){if(u.hp<=0||u.st==='rout'||SJU[u.t].st)continue;if(Math.hypot(u.x-z.x,u.y-z.y)<1.05){const c=SJ.sea||sjRT(u).cmd;if(u.side==='me'){m++;if(c)cm++}else{f++;if(c)cf++}}}
  z.cm=m;z.cf=f;z.km=cm;z.kf=cf;if(cm&&!f)z.cap=Math.min(100,z.cap+45*dt);else if(cf&&!m)z.cap=Math.max(-100,z.cap-45*dt);
  const was=z.own;if(z.cap>=100)z.own='me';else if(z.cap<=-100)z.own='foe';else if(z.own==='me'&&z.cap<=0||z.own==='foe'&&z.cap>=0)z.own=null;
  if(z.own!==was&&!SJ.fast&&z.own){SJ.ban={t:z.own==='me'?sjL(`⚑ ${z.kj} בידיך`,`⚑ ${z.kj} is yours`):sjL(`⚑ האויב כבש את ${z.kj}`,`⚑ The enemy took ${z.kj}`),c:z.own==='me'?'#8fd0ff':'#ff9a7a',life:1.2};try{sfx('banner')}catch(e){}}
  if(z.own&&!(z.only&&z.own!==att)&&!(z.own==='me'?f:m))SJ.score[z.own]+=z.v*dt}}
function sjStep(dt){if(!SJ||SJ.over||SJ.phase!=='battle')return;SJ.t+=dt;SJ.day=1+Math.floor(SJ.t/30);if(WAR)WAR.round=Math.min(2,Math.floor(SJ.t/60));
 for(const s of['me','foe'])if(SJ.pow[s]){SJ.powT[s]-=dt;if(SJ.powT[s]<=0)SJ.pow[s]=null}
 for(const q of SJ.queue.filter(q=>q.at<=SJ.t)){SJ.queue.splice(SJ.queue.indexOf(q),1);const h=SJ.hq[q.side],p=sjFreeNear(q.side,q.t,h[0],h[1]);if(p){const u=sjMk(q.side,q.t,p[0]+.5,p[1]+.5,100);u.arr=1;SJ.units.push(u);if(q.side==='me'&&!SJ.fast)sjFx(u.x,u.y,sjL('תגבורת!','Reinforcements!'),'#8fd0ff')}else{SJ.spent[q.side]-=SJ_COST[q.t]||0;const c=SJ.cards[q.side].find(c=>c.t===q.t);if(c)c.used--}}
 SJ.vt=(SJ.vt||0)-dt;if(SJ.vt<=0){SJ.vt=.25;sjVision()}
 for(const s of['me','foe']){if(!SJ.auto[s]||sjEf(s,'halt'))continue;SJ.ait[s]=(SJ.ait[s]||0)-dt;if(SJ.ait[s]<=0){SJ.ait[s]=.9+Math.random()*.3;sjAI(s)}}
 for(const u of SJ.units)if(u.hp>0)sjUnit(u,dt);sjSep();sjZonesTick(dt);SJ.units=SJ.units.filter(u=>u.hp>0||SJ.t-(u.dt||(u.dt=SJ.t))<1.5);sjCheckRT()}
function sjCheckRT(){if(SJ.over)return;const att=sjAtt(),def=att?sjFoe(att):null;
 for(const s of['me','foe']){const g=SJ.units.find(u=>u.side===s&&u.gen);if(!g||g.hp<=0)return sjFinish({win:s==='foe',why:'gen'})}
 for(const s of['me','foe']){const th=s==='foe'&&WAR.doc&&WAR.doc.norout?.05:.15,onField=SJ.units.some(u=>u.side===s&&u.hp>0&&!u.gen&&!SJU[u.t].st&&u.t!=='konida'),cheap=Math.min(...SJ.cards[s].map(c=>c.cost));
  if(sjStr(s)<=SJ.budget[s]*th||(!onField&&!SJ.queue.some(q=>q.side===s)&&SJ.budget[s]-SJ.spent[s]<cheap&&SJ.t>3))return sjFinish({win:s==='foe',why:'rout'})}
 for(const s of['me','foe'])if(SJ.score[s]>=SJ_SCORE)return sjFinish({win:s==='me',why:'zones'});
 if(SJ.t>=SJ.limit){if(SJ.kind==='siege'&&att)return sjFinish({win:def==='me',why:'time'});const d=SJ.score.me-SJ.score.foe;if(Math.abs(d)>=5)return sjFinish({win:d>0,why:'time'});
  const fm=sjStr('me')/SJ.budget.me,ff=sjStr('foe')/SJ.budget.foe;if(Math.abs(fm-ff)>.03)return sjFinish({win:fm>ff,why:'time'});return sjFinish({win:def==='me',why:'time'})}}
/* ---------- the commanders and the stratagems ---------- */
function sjActivate(side){const k=SJ.co[side],P=SJCO[k];if(!P||SJ.pow[side]||SJ.meter[side]<SJ_PMAX)return;SJ.meter[side]=0;SJ.pow[side]=k;SJ.powT[side]=20;
 for(const u of SJ.units)if(u.side===side&&u.hp>0&&!SJU[u.t].st){u.sup=0;if(u.st==='rout'){u.st='ok';u.path=null}if(P.heal){u.hp=Math.min(100,u.hp+P.heal);if(!SJ.fast)sjFx(u.x,u.y,'+'+P.heal/10,'#9ef08a')}}
 if(P.trap)for(const u of SJ.units)if(u.side!==side&&u.hp>0&&!SJU[u.t].st){u.hp=Math.max(10,u.hp-P.trap);if(!SJ.fast)sjFx(u.x,u.y,'-'+P.trap/10,'#ff8a6a')}
 if(!SJ.fast){SJ.cut={side,k,life:1};try{sfx('gong')}catch(e){}}sjHud()}
function sjKei(side){const k=SJ.kei[side];if(!k||SJ.keiUsed[side]||SJ.phase!=='battle')return false;SJ.keiUsed[side]=1;const o=sjFoe(side),ef=SJ.ef;ef[side]=ef[side]||{};ef[o]=ef[o]||{};
 if(k==='yoshu'){ef[o].blind=SJ.t+25;for(const u of SJ.units)if(u.side===o&&u.hp>0&&!SJU[u.t].st)u.sup=Math.min(u.gen?80:100,u.sup+25)}
 else if(k==='kakei'){for(const u of SJ.units){if(u.side!==o||u.hp<=0||SJU[u.t].st)continue;const tk=sjTile(u.x,u.y);if(SJ.sea?SJ.units.some(m=>m.side===side&&m.hp>0&&sjDist(m,u)<2.2):sjCover(tk)){u.hp=Math.max(SJ.sea?5:1,u.hp-(SJ.sea?12:18));u.sup=Math.min(u.gen?80:100,u.sup+45);u.hitT=0;u.rev=4;SJ.fires.push({x:u.x,y:u.y,l:1})}}if(!SJ.sea)for(let y=0;y<SJ_R;y++)for(let x=0;x<SJ_C;x++)if(sjCover(SJ.map[y][x])&&SJ.units.some(u=>u.side===o&&u.hp>0&&Math.floor(u.x)===x&&Math.floor(u.y)===y))SJ.fires.push({x:x+.5,y:y+.5,l:1.6})}
 else if(k==='fukuhei')ef[side].amb=SJ.t+25;
 else if(k==='giho'){ef[o].halt=SJ.t+8;for(const u of SJ.units)if(u.side===o&&u.hp>0&&u.ord&&u.ord.k==='move'){u.path=null;u.ord=null}}
 if(!SJ.fast){const K=SJ_KEI[k];SJ.ban={t:`${K.kj} ${sjL(K.he,K.en)}${side==='me'?'':sjL(' · של האויב!',' · by the enemy!')}`,c:side==='me'?'#ffe39a':'#ff9a7a',life:1.8};try{sfx('gong')}catch(e){}}sjVision();sjHud();return true}
/* ---------- the enemy general thinks ---------- */
function sjCentroid(us){if(!us.length)return null;let x=0,y=0;for(const u of us){x+=u.x;y+=u.y}return{x:x/us.length,y:y/us.length}}
function sjAI(side){const foe=sjFoe(side),ag=sjAg(side),hq=SJ.hq[side],hx=hq[0]+.5,hy=hq[1]+.5;
 if(SJ.meter[side]>=SJ_PMAX&&!SJ.pow[side]&&SJ.units.some(u=>u.side===side&&u.hp>0&&u.hitT<3))sjActivate(side);
 if(!SJ.keiUsed[side]&&SJ.kei[side]&&SJ.t>=SJ.keiAt[side]){const k=SJ.kei[side],en=SJ.units.filter(e=>e.side===foe&&e.hp>0&&!SJU[e.t].st);
  const ok=k==='kakei'?(SJ.sea?SJ.units.some(m=>m.side===side&&m.hp>0&&en.some(e=>sjDist(m,e)<2.2)):en.filter(e=>sjCover(sjTile(e.x,e.y))).length>=1):k==='fukuhei'?SJ.units.some(u=>u.side===side&&u.hp>0&&sjCover(sjTile(u.x,u.y))&&en.some(e=>sjDist(u,e)<2.5)):k==='giho'?SJ.zones.some(z=>en.some(e=>Math.hypot(e.x-z.x,e.y-z.y)<2)):true;
  if(ok||SJ.t>SJ.limit*.75)sjKei(side)}
 if(SJ.t>6&&SJ.t-(SJ.callT[side]||0)>7){const c=sjBestCard(side);if(c){sjCall(side,c.t);SJ.callT[side]=SJ.t}}
 const us=SJ.units.filter(u=>u.side===side&&u.hp>0&&!SJU[u.t].st&&u.st!=='rout'),vis=SJ.units.filter(e=>e.side===foe&&e.hp>0&&e.vis[side]&&!SJU[e.t].st);
 const keepMine=SJ.kind==='siege'&&SJ.keepSide===side,keepTheirs=SJ.kind==='siege'&&SJ.keepSide===foe;
 const gates=SJ.units.filter(g=>g.t==='gate'&&g.hp>0&&g.side===foe),yag=SJ.units.filter(g=>g.t==='yagura'&&g.hp>0&&g.side===foe),myGates=SJ.units.filter(g=>g.t==='gate'&&g.side===side);
 const load=SJ.zones.map(()=>0),late=clamp((SJ.t/SJ.limit-.45)*2,0,1),behind=SJ.score[side]<SJ.score[foe]-5||(sjAtt()===side);
 const pickZ=u=>{let bi=-1,bs=-1e9;SJ.zones.forEach((z,i)=>{if(z.only&&sjAtt()!==side&&z.own===side&&!keepMine)return;let s=(z.own===side?(z.cf?30:4):24)*z.v-Math.hypot(u.x-z.x,u.y-z.y)*(3-ag*1.5)-load[i]*7-Math.hypot(hx-z.x,hy-z.y)*(1-ag)*(1-late)*2.2+(behind?late*12:0);if(s>bs){bs=s;bi=i}});if(bi<0)bi=0;load[bi]++;return SJ.zones[bi]};
 const army=us.filter(u=>!u.gen),cmds=army.filter(u=>sjRT(u).cmd),supply=SJ.units.filter(c=>c.t==='konida'&&c.side===side&&c.hp>0);
 const flee=(u,from,dd)=>{const dx=u.x-from.x,dy=u.y-from.y,d=Math.hypot(dx,dy)||1;sjGo(u,clamp(u.x+dx/d*dd,.3,SJ_C-.3),clamp(u.y+dy/d*dd,.3,SJ_R-.3),1)};
 for(const u of us){const rg=sjRg(u),R=sjRT(u),d2=e=>sjDist(u,e),near=k=>vis.filter(e=>(k==='melee'?!sjRg(e):1)&&d2(e)<1.5).sort((a,b)=>d2(a)-d2(b))[0];
  if(u.gen){let tx=hx,ty=hy;const c=sjCentroid(army);if(c&&SJ.t>12&&!keepMine){tx+=(c.x-tx)*.35;ty+=(c.y-ty)*.35}if(vis.some(e=>d2(e)<1.8)&&u.hp<70){tx=hx;ty=hy}sjGo(u,tx,ty);continue}
  if(u.t==='konida'){const c=sjCentroid(army.filter(v=>v!==u&&v.t!=='konida'));const th=vis.find(e=>d2(e)<2);if(th){flee(u,th,1.8);continue}if(c){const dx=hx-c.x,dy=hy-c.y,dd=Math.hypot(dx,dy)||1;sjGo(u,clamp(c.x+dx/dd*1.2,.3,SJ_C-.3),clamp(c.y+dy/dd*1.2,.3,SJ_R-.3))}continue}
  if(R.ammo&&u.ammo<=2){const src=[{x:hx,y:hy},...supply].sort((a,b)=>d2(a)-d2(b))[0];if(d2(src)>1.2){sjGo(u,src.x,src.y);continue}}
  if(R.cmd){const th=near('melee');if(th&&!SJ.units.some(v=>v.side===side&&v!==u&&v.hp>0&&!sjRT(v).cmd&&sjDist(v,u)<1.1)){flee(u,th,1.6);continue}const z=pickZ(u);sjGo(u,z.x,z.y);continue}
  if(u.t==='shinobi'){const th=vis.find(e=>d2(e)<1.6&&(SJB[e.t]&&SJB[e.t].shinobi||0)>=50);if(th){flee(u,th,1.8);continue}
   const prey=vis.filter(e=>(e.t==='konida'||sjRT(e).cmd&&!e.gen||e.st==='rout')&&d2(e)<3).sort((a,b)=>d2(a)-d2(b))[0];if(prey){sjAtk(u,prey);continue}
   const z=SJ.zones[(u.id+Math.floor(SJ.t/20))%SJ.zones.length],dir=side==='me'?1:-1;sjGo(u,clamp(z.x+dir*1.2,.3,SJ_C-.3),clamp(z.y+(u.id%2?1:-1)*.8,.3,SJ_R-.3));continue}
  if(keepMine){const brk=myGates.filter(g=>g.hp<=0),dir=side==='me'?1:-1;
   if(rg>0){if(vis.some(e=>d2(e)<=rg)){if(u.ord&&u.ord.k==='move')sjHalt(u);continue}const g=myGates[u.id%Math.max(1,myGates.length)];if(g)sjGo(u,g.x+dir*1.05,clamp(g.y+((u.id%3)-1),.5,SJ_R-.5));continue}
   let best=null,bs=0;for(const e of vis){const d=d2(e);if(d>2.2)continue;const s=(SJB[u.t][e.t]||0)-d*8;if(s>bs){bs=s;best=e}}if(best){sjAtk(u,best);continue}
   const pool=brk.length?brk:myGates,g=pool[u.id%Math.max(1,pool.length)];if(g)sjGo(u,g.x+dir*(brk.length?.2:1.05),g.y);continue}
  if(u.t==='kake'){if(keepTheirs&&gates.length){sjAtk(u,gates.sort((a,b)=>d2(a)-d2(b))[0]);continue}}
  if(rg>0){const th=near('melee');if(th&&u.t!=='atake'&&u.t!=='flag'){flee(u,th,1.6);continue}
   if(keepTheirs&&yag.length){sjAtk(u,yag.sort((a,b)=>d2(a)-d2(b))[0]);continue}
   if(vis.some(e=>d2(e)<=rg)){if(u.ord&&u.ord.k==='move'&&!u.ord.flee)sjHalt(u);continue}
   const z=pickZ(u),cont=vis.some(e=>Math.hypot(e.x-z.x,e.y-z.y)<3);let tx=z.x,ty=z.y;if(cont){const dx=hx-z.x,dy=hy-z.y,dd=Math.hypot(dx,dy)||1;tx+=dx/dd*rg*.7;ty+=dy/dd*rg*.7}sjGo(u,clamp(tx,.3,SJ_C-.3),clamp(ty,.3,SJ_R-.3));continue}
  let best=null,bs=0;for(const e of vis){const d=d2(e);if(d>2.2+ag*2.2)continue;const s=(SJB[u.t][e.t]||0)-((SJB[e.t]&&SJB[e.t][u.t])||0)*.55+(sjRg(e)>0?15:0)+(e.gen?20:0)+(sjRT(e).cmd?12:0)+(e.st!=='ok'?12:0)-d*7+ag*10;if(s>bs){bs=s;best=e}}
  if(best){sjAtk(u,best);continue}
  if(keepTheirs&&gates.length&&u.t!=='kiba'){sjAtk(u,gates.sort((a,b)=>d2(a)-d2(b))[0]);continue}
  const esc=cmds.length?cmds[u.id%cmds.length]:null;if(esc&&Math.random()<.5&&!SJ.sea){sjGo(u,clamp(esc.x+((u.id%3)-1)*.5,.3,SJ_C-.3),clamp(esc.y+(((u.id/3)|0)%3-1)*.5,.3,SJ_R-.3));continue}
  const z=pickZ(u);sjGo(u,clamp(z.x+((u.id%3)-1)*.35,.3,SJ_C-.3),clamp(z.y+(((u.id/3)|0)%3-1)*.35,.3,SJ_R-.3))}}
/* ---------- the army is mustered: cards, points, reserves ---------- */
function sjWeights(side){const w={};const add=(k,v)=>{if(v>0)w[k]=(w[k]||0)+v};
 if(SJ.sea){if(side==='me'){const n=S.navy||0;add('seki',1+.6*n);add('kobaya',1+.3*Math.min(10,S.boats||0));if(n>=2)add('atake',.35*n)}
  else{const k=WAR.docKey;if(k==='wako'){add('kobaya',3);add('seki',2);add('atake',.5)}else if(k==='mori'){add('seki',3);add('kobaya',2);add('atake',1.5)}else if(SJ.ctx.kind==='foreign'){add('atake',2);add('seki',2);add('kobaya',1)}else{add('seki',2);add('kobaya',2);add('atake',1)}}
  return w}
 const siegeAtk=SJ.kind==='siege'&&SJ.keepSide===sjFoe(side);
 if(side==='me'){const A=S.arm||{};add('yari',3+.6*(A.yari||0)+.4*(A.gusoku||0));add('yumi',2+.6*(A.yumi||0)+.3*(A.gun||0));add('ishi',.8);
  const cav=bl('stables')>0||fa('horse')>4;if(cav){add('kiba',1+.5*bl('stables')+Math.min(3,fa('horse')/6));add('kisha',.4+.3*bl('stables')+.2*(A.yumi||0))}
  add('sam',Math.min(3,(S.clan.ret||[]).length)*.9+(S.level>=10?.5:0)+(typeof mercPow==='function'&&mercPow(false)>0?1:0));
  if(dl('spies'))add('shinobi',.5+.3*dl('spies'));add('horo',1.2);add('konida',.7);if(siegeAtk)add('kake',1.2);
  return w}
 const fd=SJ.ctx.fd||{};if(fd.sjWr){const r=fd.sjWr;for(const k of['yari','yumi','ishi','kiba','kisha','sam','shinobi'])add(k,r[k]||0);if(!Object.keys(w).length)add('yari',3)}
 else{const k=WAR.docKey,pool=k==='takeda'||k==='date'?'kkyky skkyy':k==='oda'||k==='spain'?'ppyyp kspyp':k==='ikko'?'mmymm ympmy':k==='siam'?'ppppp ypspp':k==='ming'?'pypyp ykpyp':k==='joseon'?'yypyy pkyps':k==='mongol'?'kykpk ykskk':'pypks ypkyp';
  const map={p:'yari',y:'yumi',k:'kiba',s:'sam',m:'monk'};for(const ch of pool)if(map[ch])add(map[ch],1);add('ishi',.6);if(k==='takeda'||k==='date'||k==='mongol')add('kisha',1.2);if(k==='sanada'||k==='hojo'||(fd.level||0)>25)add('shinobi',.5)}
 add('horo',1);add('konida',.5);if(siegeAtk)add('kake',1.2);return w}
function sjMkCards(side){const w=sjWeights(side),keys=Object.keys(w).filter(k=>w[k]>0&&SJ_COST[k]);if(!keys.length){keys.push(SJ.sea?'seki':'yari');w[keys[0]]=1}const tot=keys.reduce((a,k)=>a+w[k],0),cap={sam:3,atake:3,shinobi:2,horo:3,kake:2,konida:2,kisha:4},lo={horo:2,kake:2};
 return keys.map(k=>({t:k,w:w[k]/tot,cost:SJ_COST[k],max:clamp(Math.max(lo[k]||1,Math.round(w[k]/tot*12)),1,cap[k]||7),used:0})).sort((a,b)=>a.cost-b.cost)}
function sjDZ(side){const out=[],M=SJ.map,keep=SJ.kind==='siege'&&SJ.keepSide===side,X=c=>side==='me'?c:SJ_C-1-c,rows=[3,4,2,5,1,6,0,7];
 if(keep){for(const c of[1,0])for(const y of rows){const x=X(c);if(M[y][x]==='castle'||M[y][x]==='tenshu')out.push([x,y])}return out}
 for(const c of[2,1,0])for(const y of rows)out.push([X(c),y]);return out}
function sjFreeAt(x,y){return!SJ.units.some(u=>u.hp>0&&Math.floor(u.x)===x&&Math.floor(u.y)===y)}
function sjFreeNear(side,t,hx,hy){const fake={t,side};let best=null;for(let y=0;y<SJ_R;y++)for(let x=0;x<SJ_C;x++){if(sjPassT(fake,x,y)>=99||!sjFreeAt(x,y))continue;const d=Math.hypot(x-hx,y-hy);if(d<=3&&(!best||d<best[0]))best=[d,x,y]}return best?[best[1],best[2]]:null}
function sjPlace(side,t,x,y){const c=SJ.cards[side].find(c=>c.t===t);if(!c||c.used>=c.max||SJ.spent[side]+c.cost>SJ.budget[side])return null;if(sjPassT({t,side},x,y)>=99||!sjFreeAt(x,y))return null;c.used++;SJ.spent[side]+=c.cost;const u=sjMk(side,t,x+.5,y+.5,100);SJ.units.push(u);return u}
function sjUnplace(u){const c=SJ.cards[u.side].find(c=>c.t===u.t);if(c)c.used--;SJ.spent[u.side]-=SJ_COST[u.t]||0;SJ.units.splice(SJ.units.indexOf(u),1)}
/* the formation decides where each kind of troop stands */
function sjSpot(side,t,tiles){const R=SJ_RT[t]||{},ranged=R.rg>0,X=c=>side==='me'?c:SJ_C-1-c,front=X(2),mid=X(1),back=X(0),lay=(sjForm(side)||{}).lay||'line',hq=SJ.hq[side],fake={t,side};
 const s=p=>{const fc=Math.abs(p[0]-front),dy=Math.abs(p[1]-3.5);if(t==='konida'||R.cmd)return Math.abs(p[0]-back)*3+dy*(R.cmd?.5:1);if(t==='shinobi')return fc*2-dy;
  if(lay==='center')return(ranged?Math.abs(p[0]-mid):fc)*3+dy*2;if(lay==='wings')return ranged?Math.abs(p[0]-mid)*3+dy:fc*3-dy*1.5;if(lay==='point')return(ranged?Math.abs(p[0]-mid):fc)*2+dy*(ranged?.6:2.5);
  if(lay==='ring')return Math.abs(Math.hypot(p[0]-hq[0],p[1]-hq[1])-1.5)*3;return(ranged?Math.abs(p[0]-mid):fc)*3+(t==='kiba'||t==='kisha'?-dy:dy*.4)};
 return tiles.slice().sort((a,b)=>s(a)-s(b)).find(p=>sjPassT(fake,p[0],p[1])<99&&sjFreeAt(p[0],p[1]))||null}
function sjAutoDeploy(side,frac){const tiles=sjDZ(side),cards=SJ.cards[side];
 for(const[t,n]of[['horo',SJ.budget[side]>=90?2:1],['konida',1],['kake',SJ.kind==='siege'&&SJ.keepSide===sjFoe(side)?2:0]]){const c=cards.find(c=>c.t===t);if(!c||SJ.sea)continue;while(c.used<Math.min(n,c.max)&&SJ.spent[side]+c.cost<=SJ.budget[side]*frac){const p=sjSpot(side,t,tiles);if(!p||!sjPlace(side,t,p[0],p[1]))break}}
 for(let g=0;g<40;g++){const left=SJ.budget[side]-SJ.spent[side];if(SJ.spent[side]>=SJ.budget[side]*frac)break;
  const can=cards.filter(c=>c.used<c.max&&c.cost<=left);if(!can.length)break;can.sort((a,b)=>(a.used+1)/a.w-(b.used+1)/b.w);let ok=false;for(const c of can){const p=sjSpot(side,c.t,tiles);if(p&&sjPlace(side,c.t,p[0],p[1])){ok=true;break}}if(!ok)break}}
function sjRedeploy(side){const keep=SJ.units.filter(u=>u.side===side&&!u.gen&&!SJU[u.t].st).map(u=>u.t);for(const u of SJ.units.filter(u=>u.side===side&&!u.gen&&!SJU[u.t].st))sjUnplace(u);const tiles=sjDZ(side);
 keep.sort((a,b)=>((SJ_RT[a]||{}).rg>0)-((SJ_RT[b]||{}).rg>0));for(const t of keep){const p=sjSpot(side,t,tiles);if(p)sjPlace(side,t,p[0],p[1])}}
function sjBestCard(side){const left=SJ.budget[side]-SJ.spent[side],n=SJ.units.filter(u=>u.side===side&&u.hp>0&&!SJU[u.t].st).length+SJ.queue.filter(q=>q.side===side).length;if(n>=SJ_MAXU)return null;
 const can=SJ.cards[side].filter(c=>c.used<c.max&&c.cost<=left&&!(c.t==='kake'&&!(SJ.kind==='siege'&&SJ.keepSide===sjFoe(side))));if(!can.length)return null;if(!SJ.sea&&!SJ.units.some(u=>u.side===side&&u.hp>0&&u.t==='horo')&&!SJ.queue.some(q=>q.side===side&&q.t==='horo')){const h=can.find(c=>c.t==='horo');if(h)return h}can.sort((a,b)=>(a.used+1)/a.w-(b.used+1)/b.w);return can[0]}
function sjCall(side,t){const c=SJ.cards[side].find(c=>c.t===t);if(!c||c.used>=c.max||SJ.spent[side]+c.cost>SJ.budget[side])return false;const n=SJ.units.filter(u=>u.side===side&&u.hp>0&&!SJU[u.t].st).length+SJ.queue.filter(q=>q.side===side).length;if(n>=SJ_MAXU)return false;
 c.used++;SJ.spent[side]+=c.cost;SJ.queue.push({side,t,at:SJ.t+6});return true}
/* the enemy general's choice of formation and stratagem follows his school of war */
function sjFoeArts(){const k=WAR.docKey,h=Math.abs(hashStr(String(SJ.ctx.place||'')+(SJ.ctx.fd&&SJ.ctx.fd.name||''))),keys=Object.keys(SJ_FORM),kk=Object.keys(SJ_KEI);
 const F={takeda:'gyorin',uesugi:'gyorin',tokugawa:'kakuyoku',shimazu:'kakuyoku',hojo:'hoen',oda:'koyaku',ikko:'hoshi',date:'hoshi',sanada:'engetsu',mongol:'hoshi',ming:'ganko',joseon:'ganko',wako:'choda',mori:'choda'}[k];
 const K={shimazu:'fukuhei',sanada:'giho',takeda:'yoshu',uesugi:'yoshu',mori:'kakei',wako:'kakei',hojo:'giho',oda:'kakei',tokugawa:'fukuhei'}[k];
 let f=F||keys[h%keys.length];if(SJ.kind==='siege'&&SJ.keepSide==='foe')f=F==='hoen'||!F?'hoen':F;return{f,k:K||kk[(h>>3)%kk.length]}}
/* ---------- the objectives on the map ---------- */
function sjMkZones(G){const M=G.M,Z=[];const add=(x,y,v,only)=>Z.push({x:x+.5,y:y+.5,v,only:!!only,cap:0,own:null,kj:SJT[M[y][x]].kj,cm:0,cf:0});
 if(SJ.kind==='siege'){const mir=SJ.keepSide==='me',bx=mir?3:6;for(const[gx,gy]of G.gates)add(bx,gy,1,1);for(let y=0;y<SJ_R;y++)for(let x=0;x<SJ_C;x++)if(M[y][x]==='tenshu'){add(x,y,3,1);const z=Z[Z.length-1];z.own=SJ.keepSide;z.cap=SJ.keepSide==='me'?100:-100}return Z}
 const ok=SJ.sea?['island','shoal']:['village','hill','bridge','ford'];const cand=[];for(let y=0;y<SJ_R;y++)for(let x=3;x<=6;x++)if(ok.includes(M[y][x]))cand.push([x,y]);
 const fake={t:SJ.sea?'seki':'yari',side:'me'};const near=(x,y)=>{if(sjCost(fake,M[y][x])<99)return[x,y];for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(sjIn(nx,ny)&&sjCost(fake,M[ny][nx])<99)return[nx,ny]}return null};
 for(const ty of[1,3.5,6]){let best=null;for(const[x,y]of cand){const p=near(x,y);if(!p||Z.some(z=>Math.hypot(z.x-p[0]-.5,z.y-p[1]-.5)<2.2))continue;const d=Math.abs(y-ty)+Math.abs(x-4.5)*.3;if(!best||d<best[0])best=[d,p[0],p[1]]}
  if(!best){for(const x of[4,5]){const y=Math.round(ty);const p=near(x,clamp(y,0,SJ_R-1));if(p&&!Z.some(z=>Math.hypot(z.x-p[0]-.5,z.y-p[1]-.5)<2)){best=[0,p[0],p[1]];break}}}
  if(best)add(best[1],best[2],1)}
 return Z}
/* ---------- the battle ---------- */
function sjKind(ctx){if(ctx.naval)return'sea';if(ctx.kind==='rank')return'rank';const def=WAR.defender;const h=Math.abs(hashStr(String(ctx.id||ctx.place||'x')+(S.clan.day||0)));
 if(def==='foe'){if(ctx.kind==='empire')return'siege';const c=ctx.kind==='city'&&CITIES.find(x=>x.id===ctx.id);if(c&&c.fort)return'siege';return h%5<3?'siege':'field'}
 if(def==='me')return h%2?'siege':'field';return'field'}
function sjHQOwner(x,y){for(const s of['me','foe']){const h=SJ.hq[s];if(h&&h[0]===x&&h[1]===y)return s}return null}
function sjAg(side){if(side==='me')return .7;const k=WAR.docKey,fd=SJ.ctx.fd||{};if(fd.sjWr&&fd.sjWr.ag!=null)return clamp(fd.sjWr.ag,.15,1);
 let a=SJ.keepSide==='foe'?.35:.72;if(k==='takeda'||k==='shimazu'||k==='uesugi'||k==='mongol'||k==='wako')a+=.15;if(k==='hojo'||k==='tokugawa')a-=.15;return clamp(a,.15,1)}
async function sjStart(){const ctx=WAR.ctx;try{document.querySelectorAll('#sjOv').forEach(e=>e.remove())}catch(e){}
 const kind=sjKind(ctx),seed=Math.abs(hashStr(String(ctx.place||'')+(ctx.id||'')+(S.clan.day||0)+(S.wins||0)));
 SJ={ctx,kind,sea:kind==='sea',units:[],t:0,day:1,phase:'deploy',sel:[],pow:{me:null,foe:null},powT:{me:0,foe:0},meter:{me:0,foe:0},fx:[],proj:[],fires:[],queue:[],score:{me:0,foe:0},loss:{me:0,foe:0},callT:{},ait:{},ef:{me:{},foe:{}},kei:{},keiUsed:{},keiAt:{},cut:null,ban:null,over:false,spd:1,paused:false,
  auto:{me:!!S.autoFight,foe:true},fast:!!S.autoFight,rec:{a:0,n:0},t0:performance.now(),hover:null,luck:sjLuck(),dsel:null,form:{}};
 const castleSide=kind==='siege'?(WAR.defender==='me'?'me':'foe'):null;
 const G=sjGenMap(kind,seed,castleSide);SJ.map=G.M;SJ.hq=G.hq;SJ.keepSide=G.keep||null;if(kind==='rank')SJ.keepSide=null;SJ.co={me:sjCoKey('me'),foe:sjCoKey('foe')};
 SJ.mods={me:sjMods('me'),foe:sjMods('foe')};SJ.limit=kind==='siege'?240:kind==='sea'?180:210;
 const A=sjFoeArts();SJ.form.foe=A.f;SJ.kei.foe=A.k;SJ.keiAt.foe=20+(seed%40);try{const L=LSget('bushido-sjarts',{});SJ.form.me=SJ_FORM[L.f]?L.f:'gyorin';SJ.kei.me=SJ_KEI[L.k]?L.k:'yoshu'}catch(e){SJ.form.me='gyorin';SJ.kei.me='yoshu'}
 const[bm,bf]=sjBudget(WAR.my.max,WAR.foe.max);SJ.budget={me:Math.round(bm*1.45),foe:Math.round(bf*1.45)};SJ.spent={me:0,foe:0};SJ.cards={me:sjMkCards('me'),foe:sjMkCards('foe')};
 for(const s of['me','foe']){const h=SJ.hq[s];SJ.units.push(sjMk(s,SJ.sea?'flag':'gen',h[0]+.5,h[1]+.5,100))}
 for(const[x,y]of G.gates)SJ.units.push(sjMk(castleSide,'gate',x+.5,y+.5,100));for(const[x,y]of G.yagura)SJ.units.push(sjMk(castleSide,'yagura',x+.5,y+.5,100));
 SJ.zones=sjMkZones(G);sjAutoDeploy('foe',.78);
 try{S.sjPend={p:String(ctx.place||'').slice(0,40),t:Date.now()};save()}catch(e){}
 sjTerrainCache();sjBuildUI();sjVision();
 SJ.loop=setInterval(sjTick,50);SJ.last=performance.now();sjLoopDraw();
 if(S.autoFight){SJ.auto.me=true;SJ.keiAt.me=25;sjAutoDeploy('me',.85);sjBegin();return}
 SJ.ban={t:sjL('布陣 · בחר מערך והצב את הצבא באזור הירוק','布陣 · Choose a formation and deploy in the green zone'),c:'#ffe39a',life:2.6};sjHud();
 try{S.seenHelp=S.seenHelp||{};if(!S.seenHelp.senjoRT){S.seenHelp.senjoRT=1;save();setTimeout(()=>{try{sjHelp()}catch(e){}},400)}}catch(e){}}
function sjBegin(){if(!SJ||SJ.phase!=='deploy')return;if(!SJ.units.some(u=>u.side==='me'&&!u.gen&&!SJU[u.t].st))sjAutoDeploy('me',.6);SJ.phase='battle';SJ.dsel=null;SJ.start={me:SJ.budget.me,foe:SJ.budget.foe};sjVision();
 try{LSset('bushido-sjarts',{f:SJ.form.me,k:SJ.kei.me})}catch(e){}
 const F=SJ_FORM[SJ.form.foe],known=dl('spies')>0||docKnown(WAR.docKey);
 const intro=SJ.kind==='siege'?(SJ.keepSide==='foe'?sjL('城攻め · שבור שער וכבוש את הטנשו','城攻め · Break a gate and take the keep'):sjL('籠城 · החזק את הטירה עד שהזמן נגמר','籠城 · Hold the castle until time runs out')):sjL(`合戦 · כבוש אזורים (${SJ_SCORE}) או הפל את המפקד`,`合戦 · Hold zones (${SJ_SCORE}) or bring down the commander`);
 SJ.ban={t:intro+(known&&F?sjL(` · האויב ב${F.he} ${F.kj}`,` · the enemy in ${F.en} ${F.kj}`):''),c:'#ffe39a',life:2.6};try{sfx('gong')}catch(e){}if(SJ.fast){SJ.spd=60;SJ.ban=null}SJ.padK='';sjHud()}
function sjTick(){const B=SJ;if(!B||B.over){return}const now=performance.now();let el=(now-(B.last||now))/1000;B.last=now;el=Math.min(el,B.fast?3:.25);
 if(B.phase!=='battle'||B.paused||(B.cut&&!B.fast))return;B.acc=(B.acc||0)+el*B.spd;let n=0;while(B.acc>=SJ_STEP&&n<1500&&SJ===B&&!B.over){sjStep(SJ_STEP);B.acc-=SJ_STEP;n++}if(n>=1500)B.acc=0;
 B.hudT=(B.hudT||0)-el;if(B.hudT<=0){B.hudT=.25;sjHud()}}
function sjFx(x,y,t,c){if(SJ.fx.length<60)SJ.fx.push({x,y,t,c,life:1})}
let SJ_RETT=0;
function sjRetreat(){if(!SJ||SJ.over)return;if(!S.autoFight&&Date.now()-SJ_RETT>2500){SJ_RETT=Date.now();sjFlash(sjL('נסיגה מאורגנת: מצילה חיילים, אבל המלחמה אבודה. לחץ שוב.','Ordered retreat: saves soldiers, but the war is lost. Tap again.'));return}sjFinish({win:false,why:'retreat'})}
function sjAutoTog(){if(!SJ||SJ.over)return;SJ.auto.me=!SJ.auto.me;if(SJ.auto.me){SJ.sel=[];SJ.keiAt.me=SJ.t+5;if(SJ.phase==='deploy')sjBegin()}sjHud()}
/* ---------- the end ---------- */
function sjFinish(res){if(!SJ||SJ.over)return;SJ.over=true;try{delete S.sjPend}catch(e){}const fm=clamp(sjStr('me')/Math.max(1,SJ.budget.me),0,1),ff=clamp(sjStr('foe')/Math.max(1,SJ.budget.foe),0,1),rout=res.why==='gen'?.6:1;
 WAR.my.cur=Math.max(0,Math.round(WAR.my.max*fm*(!res.win&&res.why==='gen'?rout:1)));WAR.foe.cur=Math.max(0,Math.round(WAR.foe.max*ff*(res.win&&res.why==='gen'?rout:1)));
 WAR.kills=Math.max(0,Math.round((WAR.foe.max-WAR.foe.cur)*.6));WAR.round=SJ.phase==='battle'&&SJ.t>5?3:0;WAR.myT=WAR.foeT=null;
 SJ_LAST={win:!!res.win,why:res.why,t:Math.round(SJ.t),fm:+fm.toFixed(2),ff:+ff.toFixed(2),my:WAR.my.max,foe:WAR.foe.max,kind:SJ.kind,sc:[Math.round(SJ.score.me),Math.round(SJ.score.foe)],form:[SJ.form.me,SJ.form.foe],ms:Math.round(performance.now()-SJ.t0)};
 try{const R=S.sjRec=S.sjRec||{n:0,ag:.6};if(SJ.rec.a+SJ.rec.n>3){const ag=clamp(SJ.rec.a/(SJ.rec.a+SJ.rec.n*.6),0,1);R.ag=+(R.ag*.7+ag*.3).toFixed(2);R.n=Math.min(999,(R.n||0)+1)}}catch(e){}
 const W=res.why==='retreat'?null:res.win;const txt=res.why==='retreat'?sjL('נסיגה','Retreat'):res.win?(res.why==='gen'?sjL('大将討ち取ったり! ניצחון','大将討ち取ったり! Victory'):res.why==='zones'?sjL('勝利 · השטח בידיך','勝利 · The field is yours'):sjL('勝利 · ניצחון','勝利 · Victory')):(res.why==='gen'?sjL('המפקד שלך נפל','Your commander has fallen'):res.why==='zones'?sjL('敗北 · האויב שולט בשטח','敗北 · The enemy holds the field'):sjL('敗北 · תבוסה','敗北 · Defeat'));
 SJ.ban={t:txt,c:W?'#ffcf5a':'#8fa8c8',life:2.4,big:1};try{sfx(W?'win':'ko')}catch(e){}
 const B=SJ,end=()=>{clearInterval(B.loop);cancelAnimationFrame(B.raf);const o=document.getElementById('sjOv');if(o)o.remove();try{document.removeEventListener('keydown',B.key);const h=document.getElementById('sjHelpOv');if(h)h.remove()}catch(e){}
  const w=res.why==='retreat'?false:!!res.win;if(SJ===B)SJ=null;if(WAR)WAR.busy=false;try{warEnd(w,res.why==='retreat'?{retreat:1}:{})}catch(e){console.warn('senjo end',e)}};
 setTimeout(end,S.autoFight?700:2100)}
/* ---------- drawing ---------- */
function sjDrawUnit(g,u,t){const T=SJ_TS,cx=u.x*T,cy=u.y*T,col=SJ_COL[u.side]||SJ_COL.foe,me=u.side==='me',dead=u.hp<=0,R=sjRT(u);g.save();if(dead)g.globalAlpha=clamp(1-(SJ.t-(u.dt||SJ.t))/1.5,0,1)*.6;
 if(SJU[u.t].st){if(u.t==='gate'){if(dead){g.restore();return}g.fillStyle='#4a2e18';g.fillRect(cx-16,cy-12,32,26);g.fillStyle='#6a4a2a';g.fillRect(cx-14,cy-10,13,22);g.fillRect(cx+1,cy-10,13,22);g.fillStyle='#222';for(let i=0;i<4;i++){g.fillRect(cx-12,cy-7+i*6,2,2);g.fillRect(cx+10,cy-7+i*6,2,2)}g.fillStyle='#2a2a30';g.fillRect(cx-20,cy-18,40,6)}
  else{g.fillStyle=dead?'#5a5048':'#ece8dc';g.fillRect(cx-13,cy-14,26,26);g.fillStyle='#2a2a30';g.fillRect(cx-17,cy-18,34,5);g.fillRect(cx-6,cy-6,12,6)}g.fillStyle=col.m;g.fillRect(cx-16,cy+14,32*u.hp/100,3);g.restore();return}
 const sel=SJ.sel.includes(u),hidden=me&&(R.stealth||sjEf('me','amb')&&sjCover(sjTile(u.x,u.y)))&&u.rev<=0;if(hidden)g.globalAlpha*=.55;
 g.fillStyle=me?'rgba(60,120,240,.38)':'rgba(230,60,40,.38)';g.beginPath();g.ellipse(cx,cy+12,16,5,0,0,7);g.fill();if(sel){g.strokeStyle='#ffe39a';g.lineWidth=2;g.beginPath();g.ellipse(cx,cy+12,19,7,0,0,7);g.stroke()}
 const moving=u.path&&u.path.length&&!dead,act=moving||(u.cd>R.rl-.3);
 if(SJ.sea){const sz={atake:.48,seki:.4,kobaya:.32,flag:.52}[u.t]||.4;try{drawShip(g,cx,cy+6,u.face,col.b,t,u.id,sz)}catch(e){}if(u.t==='flag'||u.t==='atake'){g.fillStyle='#2a1a12';g.fillRect(cx-1,cy-24,2,18);g.fillStyle=u.t==='flag'?'#e6b450':col.b;g.fillRect(cx+(u.face>0?1:-9),cy-24,8,10)}}
 else{g.save();g.translate(cx,cy+14);if(u.face<0)g.scale(-1,1);if(dead)g.rotate(-1.2);
  const n=u.gen||u.t==='konida'||u.t==='horo'?1:u.hp>66?3:u.hp>33?2:1,xs=n===1?[0]:n===2?[-7,7]:[-12,0,12];
  const kind={kisha:'kiba',horo:'kiba'}[u.t]||u.t,nin=u.t==='shinobi'&&typeof itm==='function'&&(()=>{try{return itm('u_ninja')}catch(e){return null}})(),body=u.t==='shinobi'?'#1a1a22':col.b;
  if(u.t==='konida'){g.fillStyle='#5a3a1a';g.fillRect(-14,-14,22,10);g.fillStyle='#d8c8a0';g.fillRect(-12,-20,18,7);g.fillStyle='#2a1a12';g.beginPath();g.arc(-9,-3,3.5,0,7);g.arc(5,-3,3.5,0,7);g.fill();g.fillStyle='#4a2e18';g.fillRect(8,-14,10,6);g.fillRect(16,-18,4,6)}
  for(let i=0;i<n;i++){const s=u.gen?1.9:1.5,x0=u.t==='konida'?14:xs[i];if(nin){if(i===0){const H0=30,w=nin.naturalWidth*H0/nin.naturalHeight;g.imageSmoothingEnabled=true;g.drawImage(nin,-w/2,-H0,w,H0);g.imageSmoothingEnabled=false}continue}try{twMan(g,x0,(i%2)*2,u.t==='konida'?1.2:s,body,(i===0&&(u.gen||u.t==='yari'||u.t==='sam'||u.t==='horo'))?col.f:null,t,kind,i+u.id,act)}catch(e){}
   if(u.t==='kisha'||u.t==='yumi'&&false){g.strokeStyle='#3a2412';g.lineWidth=1.4;g.beginPath();g.arc(x0+5,-24,6,-1.2,1.2);g.stroke()}
   if(u.t==='ishi'){g.fillStyle='#8a8478';g.beginPath();g.arc(x0+5,-17+(act?Math.sin(t*14+i)*3:0),2.4,0,7);g.fill()}
   if(u.t==='kake'){g.fillStyle='#6a4a2a';g.fillRect(x0+3,-30,2,16);g.fillStyle='#8a6238';g.fillRect(x0-1,-34,10,6)}
   if(u.t==='shinobi'){g.fillStyle='#d8dee6';g.fillRect(x0+3,-20,1.2,7)}}
  if(u.t==='horo'){const wv=Math.sin(t*6+u.id)*1.5;g.fillStyle=col.m;g.beginPath();g.ellipse(-6+wv,-30,10,8,0,0,7);g.fill();g.strokeStyle='#000';g.lineWidth=1;g.stroke();g.fillStyle='#fff';g.beginPath();g.arc(-6+wv,-30,3,0,7);g.fill()}
  if(u.gen){g.fillStyle='#2a1a12';g.fillRect(-14,-38,2,30);g.fillStyle=col.b;g.fillRect(-12,-38,9,14);g.fillStyle='#e6b450';g.fillRect(-9,-34,3,3)}g.restore()}
 g.restore();if(dead)return;
 const hd=sjHPd(u);g.fillStyle='rgba(0,0,0,.78)';g.fillRect(cx+8,cy+4,14,13);g.fillStyle=hd>=7?'#fff':hd>=4?'#ffe08a':'#ff9a7a';g.font="bold 11px Rubik,sans-serif";g.textAlign='center';g.fillText(String(hd),cx+15,cy+14);
 g.fillStyle=col.m;const kj=SJU[u.t].kj;g.fillRect(cx-22,cy-22,kj.length>1?19:12,11);g.fillStyle='#fff';g.font="9px 'Yuji Syuku',serif";g.fillText(kj,cx-22+(kj.length>1?9.5:6),cy-13);
 if(!u.gen){const sw=24,sx=cx-12,sy=cy+19;g.fillStyle='rgba(0,0,0,.6)';g.fillRect(sx-1,sy-1,sw+2,4);g.fillStyle=u.sup>=92||u.st==='rout'?'#ff4a3a':u.sup>=55?'#ffb030':'#7ad070';g.fillRect(sx,sy,sw*(1-u.sup/100),2);
  if(R.ammo&&(me||SJ.over)){g.fillStyle='rgba(0,0,0,.6)';g.fillRect(sx-1,sy+3,sw+2,3);g.fillStyle=u.ammo>3?'#8fc4ff':'#ff9a7a';g.fillRect(sx,sy+3.5,sw*u.ammo/(R.ammo*SJ.mods[u.side].ammo),2)}}
 if(u.st!=='ok'){const bl=u.st==='rout'?Math.sin(t*10)>0:true;if(bl){g.font="bold 13px 'Yuji Syuku',serif";g.fillStyle=u.st==='rout'?'#ff6a5a':'#ffb030';g.strokeStyle='#000';g.lineWidth=3;const s=u.st==='rout'?'敗':'動';g.strokeText(s,cx,cy-24);g.fillText(s,cx,cy-24)}}
 else if(R.ammo&&u.ammo<=0&&me){g.font="bold 11px Rubik,sans-serif";g.fillStyle='#ff9a7a';g.fillText('0🏹',cx,cy-24)}
 if(u.arr){u.arr=Math.max(0,u.arr-.02);g.strokeStyle=`rgba(255,240,180,${u.arr})`;g.lineWidth=2;g.beginPath();g.arc(cx,cy,24*(1.5-u.arr),0,7);g.stroke()}
 g.textAlign='left'}
function sjDrawProj(g,dt){const T=SJ_TS;for(const p of SJ.proj){p.t+=dt*Math.min(3,SJ.spd||1)*(SJ.paused?0:1);const k=clamp(p.t/p.d,0,1),x=(p.x0+(p.x1-p.x0)*k)*T,y=(p.y0+(p.y1-p.y0)*k)*T;
  if(p.k==='arrow'){const h=Math.sin(k*Math.PI)*.9*T;g.strokeStyle=p.fire?'#ff8a3a':'#1a120a';g.lineWidth=1.5;for(let i=0;i<4;i++){const ox=(i-1.5)*4,oy=(i%2)*3;g.beginPath();g.moveTo(x+ox,y-h+oy);g.lineTo(x+ox-(p.x1-p.x0)*3,y-h+oy+Math.cos(k*Math.PI)*-4);g.stroke();if(p.fire){g.fillStyle='#ffd24a';g.fillRect(x+ox-1,y-h+oy-1,3,3)}}}
  else if(p.k==='stone'){const h=Math.sin(k*Math.PI)*.6*T;g.fillStyle='#7a7468';for(let i=0;i<3;i++){g.beginPath();g.arc(x+(i-1)*5,y-h+(i%2)*3,2.2,0,7);g.fill()}if(k>=1&&!p.ex){p.ex=1;SJ.puff.push({x:p.x1*T,y:p.y1*T,r:4,l:.6,c:'200,190,160'})}}
  else{if(Math.random()<.7){g.fillStyle='rgba(255,230,150,.9)';g.fillRect(p.x1*T+(Math.random()-.5)*20,p.y1*T+(Math.random()-.5)*16,3,3)}}}
 SJ.proj=SJ.proj.filter(p=>p.t<p.d+.05);
 for(const s of SJ.puff){s.l-=dt*.8;s.r+=dt*14;s.y-=dt*8;g.fillStyle=`rgba(${s.c||'225,225,230'},${.45*s.l})`;g.beginPath();g.arc(s.x,s.y,s.r,0,7);g.fill()}SJ.puff=SJ.puff.filter(s=>s.l>0).slice(-40);
 for(const f of SJ.fires){f.l-=dt*.25;const fx=f.x*T,fy=f.y*T;for(let i=0;i<6;i++){const a=performance.now()/120+i*1.7,hh=10+6*Math.sin(a);g.fillStyle=i%2?`rgba(255,140,40,${Math.min(1,f.l)})`:`rgba(255,220,90,${Math.min(1,f.l)})`;g.beginPath();g.moveTo(fx+(i-3)*5-4,fy+8);g.lineTo(fx+(i-3)*5+4,fy+8);g.lineTo(fx+(i-3)*5,fy+8-hh);g.fill()}if(Math.random()<.2)SJ.puff.push({x:fx,y:fy-10,r:5,l:1,c:'60,50,50'})}SJ.fires=SJ.fires.filter(f=>f.l>0)}
function sjDraw(){if(!SJ||!SJ.cv)return;const g=SJ.g,T=SJ_TS,W=SJ_C*T,H=SJ_R*T,t=performance.now()/1000,dt=Math.min(.05,t-(SJ.lt||t));SJ.lt=t;SJ.puff=SJ.puff||[];
 g.setTransform(SJ.cv.width/W,0,0,SJ.cv.height/H,0,0);g.imageSmoothingEnabled=false;g.lineJoin='round';g.drawImage(SJ.tc,0,0,W,H);
 for(let y=0;y<SJ_R;y++)for(let x=0;x<SJ_C;x++){const k=sjTile(x,y);if(k==='river'||k==='moat'||k==='sea'||k==='shoal'||k==='ford'){g.fillStyle='rgba(220,240,255,.22)';for(let i=0;i<2;i++){const p=((t*.35+i*.5+(x*7+y*3)%10/10)%1);g.fillRect(x*T+p*(T-10),y*T+8+i*20+Math.sin(t*2+x)*2,10,1)}}}
 if(SJ.phase==='deploy'){for(const[x,y]of sjDZ('me')){g.fillStyle='rgba(90,220,120,.22)';g.fillRect(x*T+1,y*T+1,T-2,T-2)}g.strokeStyle='rgba(255,90,60,.6)';g.lineWidth=2;for(const[x,y]of sjDZ('foe'))g.strokeRect(x*T+3,y*T+3,T-6,T-6)}
 if(SJ.fog&&!SJ.over){g.fillStyle=sjEf('me','blind')?'rgba(6,4,16,.66)':'rgba(10,8,22,.5)';for(let y=0;y<SJ_R;y++)for(let x=0;x<SJ_C;x++)if(!SJ.fog[sjK(x,y)])g.fillRect(x*T,y*T,T,T)}
 if(sjEf('foe','blind')){g.fillStyle='rgba(20,20,60,.12)';g.fillRect(0,0,W,H)}
 for(const z of SJ.zones){const zx=z.x*T,zy=z.y*T,c=z.own==='me'?'#5aa0ff':z.own==='foe'?'#ff6a4a':'#e8dcc0';g.strokeStyle='rgba(0,0,0,.5)';g.lineWidth=4;g.beginPath();g.arc(zx,zy,T*1.05,0,7);g.stroke();g.strokeStyle=c;g.lineWidth=2;g.setLineDash([5,4]);g.beginPath();g.arc(zx,zy,T*1.05,0,7);g.stroke();g.setLineDash([]);
  if(Math.abs(z.cap)>0&&Math.abs(z.cap)<100){g.strokeStyle=z.cap>0?'#5aa0ff':'#ff6a4a';g.lineWidth=4;g.beginPath();g.arc(zx,zy,T*1.05,-Math.PI/2,-Math.PI/2+Math.abs(z.cap)/100*Math.PI*2);g.stroke()}
  g.fillStyle='#2a1a12';g.fillRect(zx-1,zy-22,2,22);g.fillStyle=c;const wv=Math.sin(t*4+z.x)*2;g.beginPath();g.moveTo(zx+1,zy-22);g.lineTo(zx+14+wv,zy-19);g.lineTo(zx+1,zy-14);g.fill();g.font="10px 'Yuji Syuku',serif";g.fillStyle='#fff';g.strokeStyle='#000';g.lineWidth=3;g.textAlign='center';const lb=z.kj+(z.v>1?'×'+z.v:'');g.strokeText(lb,zx,zy+T*.75);g.fillText(lb,zx,zy+T*.75);g.textAlign='left'}
 for(const u of SJ.units)if(SJ.sel.includes(u)&&u.ord&&u.hp>0){const P=u.ord.k==='atk'?u.ord.tg:{x:u.ord.x,y:u.ord.y};if(!P)continue;g.strokeStyle=u.ord.k==='atk'?'rgba(255,90,60,.8)':'rgba(255,240,180,.7)';g.lineWidth=1.5;g.setLineDash([4,4]);g.beginPath();g.moveTo(u.x*T,u.y*T);if(u.path&&u.ord.k==='move')for(const p of u.path)g.lineTo(p[0]*T,p[1]*T);else g.lineTo(P.x*T,P.y*T);g.stroke();g.setLineDash([])}
 for(const e of SJ.units){if(e.side==='me'||e.hp<=0||e.vis.me||SJU[e.t].st)continue;const L=e.last.me;if(L&&SJ.t-L.t<6){g.globalAlpha=.5*(1-(SJ.t-L.t)/6);g.font="bold 16px 'Suez One',serif";g.fillStyle='#ff9a7a';g.textAlign='center';g.fillText('?',L.x*T,L.y*T+5);g.textAlign='left';g.globalAlpha=1}}
 const us=SJ.units.filter(u=>u.side==='me'||u.vis.me||SJU[u.t].st||SJ.over||(u.hp<=0&&u.wasSeen)).sort((a,b)=>a.y-b.y);for(const u of us){if(u.side!=='me'&&u.vis.me)u.wasSeen=1;sjDrawUnit(g,u,t)}
 sjDrawProj(g,dt);
 for(const f of SJ.fx){f.life-=dt*.9;const y=f.y*T-(1-f.life)*24;g.globalAlpha=clamp(f.life*2,0,1);g.font="bold 15px 'Suez One',serif";g.textAlign='center';g.lineWidth=4;g.strokeStyle='#000';g.strokeText(f.t,f.x*T,y);g.fillStyle=f.c;g.fillText(f.t,f.x*T,y);g.globalAlpha=1}SJ.fx=SJ.fx.filter(f=>f.life>0);g.textAlign='left';
 if(SJ.box){const b=SJ.box;g.strokeStyle='#ffe39a';g.lineWidth=1.5;g.setLineDash([4,3]);g.strokeRect(Math.min(b.x0,b.x1)*T,Math.min(b.y0,b.y1)*T,Math.abs(b.x1-b.x0)*T,Math.abs(b.y1-b.y0)*T);g.setLineDash([])}
 if(SJ.paused&&SJ.phase==='battle'){g.fillStyle='rgba(0,0,0,.25)';g.fillRect(0,0,W,H);g.font="24px 'Suez One',serif";g.textAlign='center';g.fillStyle='#ffe39a';g.strokeStyle='#000';g.lineWidth=5;const pt=sjL('⏸ עצירה · תן פקודות','⏸ Paused · give orders');g.strokeText(pt,W/2,30);g.fillText(pt,W/2,30);g.textAlign='left'}
 if(SJ.cut)sjDrawCut(g,W,H,dt);if(SJ.cut&&SJ.cut.life<=0)SJ.cut=null;
 if(SJ.ban){SJ.ban.life-=dt;if(SJ.ban.life>0){const b=SJ.ban,al=clamp(b.life*2.5,0,1);g.globalAlpha=al*.8;g.fillStyle='#000';g.fillRect(0,H/2-(b.big?34:20),W,b.big?68:40);g.globalAlpha=al;g.font=(b.big?"32px":"17px")+" 'Suez One',serif";g.textAlign='center';g.lineWidth=5;g.strokeStyle='#000';g.strokeText(b.t,W/2,H/2+(b.big?11:6));g.fillStyle=b.c;g.fillText(b.t,W/2,H/2+(b.big?11:6));g.globalAlpha=1;g.textAlign='left'}else SJ.ban=null}}
function sjLoopDraw(){if(!SJ)return;try{sjDraw()}catch(e){console.warn('senjo draw',e)}SJ.raf=requestAnimationFrame(sjLoopDraw)}
/* ---------- the player's hands ---------- */
function sjPt(e){const r=SJ.cv.getBoundingClientRect();return[(e.clientX-r.left)/r.width*SJ_C,(e.clientY-r.top)/r.height*SJ_R]}
function sjNear(side,fx,fy,r,f){let best=null,bd=r;for(const u of SJ.units){if(u.hp<=0||u.side!==side||(f&&!f(u)))continue;const d=Math.hypot(u.x-fx,u.y-fy);if(d<bd){bd=d;best=u}}return best}
let SJ_TAPT=0,SJ_TAPU=null;
function sjTapRT(fx,fy,right){if(!SJ||SJ.over)return;SJ.hover=[clamp(Math.floor(fx),0,SJ_C-1),clamp(Math.floor(fy),0,SJ_R-1)];
 if(SJ.phase==='deploy'){const[x,y]=SJ.hover;const own=sjNear('me',fx,fy,.6,u=>!u.gen&&!SJU[u.t].st);if(own){sjUnplace(own);try{sfx('step')}catch(e){}sjHud();return}
  if(!SJ.dsel){sjFlash(sjL('בחר כרטיס יחידה למטה, ואז משבצת ירוקה','Pick a unit card below, then a green square'));return}
  if(!sjDZ('me').some(p=>p[0]===x&&p[1]===y)){sjFlash(sjL('אפשר להציב רק באזור הירוק','You can deploy only in the green zone'));return}
  const c=SJ.cards.me.find(c=>c.t===SJ.dsel);if(c.used>=c.max){sjFlash(sjL('אין עוד יחידות מהסוג הזה','No more of this unit'));return}if(SJ.spent.me+c.cost>SJ.budget.me){sjFlash(sjL('אין מספיק נקודות','Not enough points'));return}
  if(!sjPlace('me',SJ.dsel,x,y))sjFlash(sjL('אי אפשר להציב כאן','Cannot deploy here'));else try{sfx('step')}catch(e){}sjHud();return}
 if(SJ.auto.me){sjFlash(sjL('הצבא בפיקוד אוטומטי. לחץ "אוטו" כדי לפקד בעצמך.','The army is on auto. Tap "Auto" to command it yourself.'));return}
 const own=!right&&sjNear('me',fx,fy,.6,u=>!SJU[u.t].st);
 if(own){const now=Date.now();if(SJ_TAPU===own&&now-SJ_TAPT<380){SJ.sel=SJ.units.filter(u=>u.side==='me'&&u.hp>0&&u.t===own.t&&!SJU[u.t].st)}else SJ.sel=[own];SJ_TAPT=now;SJ_TAPU=own;try{sfx('step')}catch(e){}sjHud();return}
 const sel=SJ.sel.filter(u=>u.hp>0);if(!sel.length){sjHud();return}
 const foe=sjNear('foe',fx,fy,.65,u=>u.vis.me||SJU[u.t].st);
 if(foe){let n=0;for(const u of sel)if(SJB[u.t]&&SJB[u.t][foe.t]!=null&&u.st!=='rout'){sjAtk(u,foe);u.hold=0;n++}if(n){SJ.rec.a++;try{sfx('banner')}catch(e){}sjFx(foe.x,foe.y-.3,'⚔','#ff9a7a')}else sjFlash(sjL('היחידות האלה לא יכולות לתקוף את זה','These units cannot attack that'));sjHud();return}
 const offs=[[0,0],[.65,0],[-.65,0],[0,.65],[0,-.65],[.65,.65],[-.65,.65],[.65,-.65],[-.65,-.65],[1.3,0],[-1.3,0],[0,1.3],[0,-1.3],[1.3,.65]];
 const order=sel.slice().sort((a,b)=>Math.hypot(a.x-fx,a.y-fy)-Math.hypot(b.x-fx,b.y-fy));let i=0,ok=0;for(const u of order){if(u.st==='rout')continue;const o=offs[i++%offs.length];const tx=clamp(fx+o[0],.2,SJ_C-.2),ty=clamp(fy+o[1],.2,SJ_R-.2);u.ord=null;sjGo(u,tx,ty);u.hold=1;if(u.ord)ok++}
 if(ok){if(fx>=SJ_C/2)SJ.rec.a+=.5;else SJ.rec.n++;sjFx(fx,fy,'◎','#ffe39a');try{sfx('step')}catch(e){}}else sjFlash(sjL('אי אפשר להגיע לשם','Cannot get there'));sjHud()}
function sjSelAll(){if(!SJ||SJ.auto.me)return;SJ.sel=SJ.units.filter(u=>u.side==='me'&&u.hp>0&&!u.gen&&!SJU[u.t].st&&u.t!=='konida');sjHud()}
function sjStop(){if(!SJ)return;for(const u of SJ.sel){sjHalt(u);u.hold=1}sjHud()}
function sjFallBack(){if(!SJ)return;const h=SJ.hq.me;let i=0;for(const u of SJ.sel){if(u.gen)continue;sjGo(u,clamp(h[0]+.5+(i%3-1)*.6+(SJ.keepSide==='me'?0:1),.3,SJ_C-.3),clamp(h[1]+.5+((i/3|0)%3-1)*.6,.3,SJ_R-.3));u.hold=1;i++}sjHud()}
function sjPowBtn(){if(!SJ||SJ.phase!=='battle'||SJ.auto.me)return;if(SJ.meter.me<SJ_PMAX||SJ.pow.me)return;sjActivate('me')}
function sjKeiBtn(){if(!SJ||SJ.phase!=='battle'||SJ.auto.me)return;if(!sjKei('me'))sjFlash(sjL('התחבולה כבר נוצלה בקרב הזה','The stratagem is already spent this battle'))}
function sjPause(){if(!SJ||SJ.phase!=='battle')return;SJ.paused=!SJ.paused;sjHud()}
function sjSpeed(){if(!SJ||SJ.fast)return;SJ.spd=SJ.spd>=3?1:SJ.spd+1;sjHud()}
function sjCardTap(t){if(!SJ||SJ.over)return;if(SJ.phase==='deploy'){SJ.dsel=SJ.dsel===t?null:t;sjHud();return}if(SJ.auto.me)return;
 if(sjCall('me',t)){sjFlash(sjL(`${SJU[t].kj} ${sjName(t)} בדרך: מגיעים למטה בעוד 6 שניות`,`${SJU[t].kj} ${sjName(t)} on the way: arriving at the HQ in 6 seconds`));try{sfx('banner')}catch(e){}}else sjFlash(sjL('אין מספיק נקודות, או שהגעת למגבלת היחידות','Not enough points, or the unit limit is reached'));sjHud()}
function sjSetForm(k){if(!SJ||SJ.phase!=='deploy'||!SJ_FORM[k])return;SJ.form.me=k;sjRedeploy('me');try{sfx('step')}catch(e){}sjHud()}
function sjSetKei(k){if(!SJ||SJ.phase!=='deploy'||!SJ_KEI[k])return;SJ.kei.me=k;try{sfx('step')}catch(e){}sjHud()}
/* ---------- the screen around the map ---------- */
function sjBuildUI(){const ov=document.createElement('div');ov.id='sjOv';ov.setAttribute('dir',TX('rtl','ltr'));
 ov.innerHTML=`<div class="sjwrap"><div class="sjtop"><div class="sjco me" id="sjCoMe"><canvas width="96" height="96"></canvas><div class="sjcoi"><b></b><div class="sjmeter"><i></i></div><small></small></div></div>
 <div class="sjday"><b id="sjDay"></b><small id="sjWx"></small></div>
 <div class="sjco foe" id="sjCoFoe"><canvas width="96" height="96"></canvas><div class="sjcoi"><b></b><div class="sjmeter"><i></i></div><small></small></div></div></div>
 <div class="sjstr"><div class="sjbar me"><i id="sjBarMe"></i><span id="sjNMe"></span></div><div class="sjbar foe"><i id="sjBarFoe"></i><span id="sjNFoe"></span></div></div>
 <div class="sjscore"><span class="me" id="sjScMe"></span><span class="sjzs" id="sjZs"></span><span class="foe" id="sjScFoe"></span></div>
 <div class="sjcvw"><canvas id="sjCv"></canvas></div>
 <div class="sjinfo" id="sjInfo"></div>
 <div class="sjarts" id="sjArts"></div>
 <div class="sjres"><small id="sjResL"></small><div class="sjcardsb" id="sjCards"></div></div>
 <div class="sjpad" id="sjPad"></div></div>`;
 document.body.append(ov);const cv=ov.querySelector('#sjCv');cv.width=SJ_C*SJ_TS*2;cv.height=SJ_R*SJ_TS*2;SJ.cv=cv;SJ.g=cv.getContext('2d');
 cv.addEventListener('contextmenu',e=>e.preventDefault());
 cv.addEventListener('pointerdown',e=>{e.preventDefault();if(!SJ)return;if(SJ.cut&&!SJ.fast){SJ.cut.life=Math.min(SJ.cut.life,.15);return}const[x,y]=sjPt(e);SJ.pd={x,y,b:e.button,m:e.pointerType==='mouse'};try{cv.setPointerCapture(e.pointerId)}catch(er){}});
 cv.addEventListener('pointermove',e=>{if(!SJ)return;const[x,y]=sjPt(e);if(SJ.pd&&SJ.pd.m&&SJ.pd.b===0&&SJ.phase==='battle'&&Math.hypot(x-SJ.pd.x,y-SJ.pd.y)>.35)SJ.box={x0:SJ.pd.x,y0:SJ.pd.y,x1:x,y1:y};if(e.pointerType==='mouse'){const h=[clamp(Math.floor(x),0,SJ_C-1),clamp(Math.floor(y),0,SJ_R-1)];if(!SJ.hover||SJ.hover[0]!==h[0]||SJ.hover[1]!==h[1]){SJ.hover=h;sjInfo()}}});
 cv.addEventListener('pointerup',e=>{if(!SJ||!SJ.pd)return;const[x,y]=sjPt(e),pd=SJ.pd;SJ.pd=null;
  if(SJ.box){const b=SJ.box;SJ.box=null;if(!SJ.auto.me){SJ.sel=SJ.units.filter(u=>u.side==='me'&&u.hp>0&&!SJU[u.t].st&&u.x>=Math.min(b.x0,b.x1)&&u.x<=Math.max(b.x0,b.x1)&&u.y>=Math.min(b.y0,b.y1)&&u.y<=Math.max(b.y0,b.y1));sjHud()}return}
  sjTapRT(x,y,pd.b===2)});
 SJ.key=e=>{if(!SJ||!document.getElementById('sjOv'))return;if(e.key===' '){e.preventDefault();sjPause()}else if(e.key==='a'||e.key==='A')sjSelAll();else if(e.key==='s'||e.key==='S')sjStop();else if(e.key==='Escape'){SJ.sel=[];sjHud()}};document.addEventListener('keydown',SJ.key);
 for(const s of['me','foe']){const el=ov.querySelector(s==='me'?'#sjCoMe canvas':'#sjCoFoe canvas');const p=sjPortrait(s);if(el&&p){const g=el.getContext('2d');g.imageSmoothingEnabled=p.width>=96;g.drawImage(p,0,0,96,96)}}
 SJ.padK='';sjHud()}
function sjPadBuild(){const pad=document.getElementById('sjPad');if(!pad)return;const k=SJ.phase+(SJ.over?'o':'');if(SJ.padK===k)return;SJ.padK=k;pad.innerHTML='';
 const B=(id,txt,f,cls)=>{const b=document.createElement('button');b.className='sjb'+(cls?' '+cls:'');b.id=id;b.textContent=txt;b.onclick=e=>{e.preventDefault();try{f()}catch(er){console.warn(er)}};pad.append(b);return b};
 if(SJ.phase==='deploy'){B('sjGo',sjL('⚔ לקרב!','⚔ To battle!'),sjBegin,'gold');B('sjAutoD',sjL('פריסה אוטומטית','Auto deploy'),()=>{sjAutoDeploy('me',.85);sjHud()});B('sjClr',sjL('נקה','Clear'),()=>{for(const u of SJ.units.filter(u=>u.side==='me'&&!u.gen&&!SJU[u.t].st))sjUnplace(u);sjHud()});B('sjRet',sjL('🏳 נסיגה','🏳 Retreat'),sjRetreat,'ghost');B('sjHelp','?',sjHelp,'ghost');return}
 B('sjPause','⏸',sjPause);B('sjSpd','×1',sjSpeed);B('sjAll',sjL('全 כל הצבא','全 All'),sjSelAll);B('sjStop',sjL('止 עצור','止 Stop'),sjStop);B('sjBack',sjL('本陣 למטה','本陣 To HQ'),sjFallBack);
 B('sjPow','⚡',sjPowBtn);B('sjKei','計',sjKeiBtn);B('sjAuto',sjL('אוטו','Auto'),sjAutoTog);B('sjRet','🏳',sjRetreat,'ghost');B('sjHelp','?',sjHelp,'ghost')}
function sjFlash(t){if(!SJ)return;SJ.flash={t,until:Date.now()+2600};sjInfo();setTimeout(()=>{try{sjInfo()}catch(e){}},2700)}
function sjUnitLine(u){const U=SJU[u.t];const strong=Object.keys(SJB[u.t]||{}).filter(k=>SJB[u.t][k]>=80&&!SJU[k].st).map(k=>SJU[k].kj),weak=Object.keys(SJB).filter(k=>SJB[k][u.t]>=80&&!SJU[k].st).map(k=>SJU[k].kj);
 const st=SJU[u.t].st?'':u.st==='rout'?sjL(' · 敗走 בורחים',' · 敗走 routing'):u.st==='pin'?sjL(' · 動揺 מדוכאים',' · 動揺 suppressed'):sjL(' · מוכנים',' · steady');const R=SJ_RT[u.t]||{},am=(R.ammo&&u.ammo!=null&&u.side==='me'?` · 🏹 ${u.ammo}`:'');
 return `<b style="color:${SJ_COL[u.side]?SJ_COL[u.side].m:'#fff'}">${U.kj} ${sjName(u.t)} ${sjHPd(u)}</b><span class="muted">${st}${am} · ${sjL(U.sh,U.se)}${strong.length?' · ▲ '+strong.join(' '):''}${weak.length?' · ▼ '+weak.join(' '):''}</span>`}
function sjTileLine(x,y){const k=sjTile(x,y),T=SJT[k];const mv=T.mv,cs=SJ.sea?`⛵ ${mv.ship||'✕'}`:`👣 ${mv.foot||'✕'} · 🐎 ${mv.horse||'✕'}`;const hid=sjCover(k)?sjL(' · מסתיר',' · conceals'):'';const hi=T.high?sjL(' · רואים רחוק',' · far sight'):'';return `${T.kj} ${sjTName(k)} · ${'★'.repeat(T.st)||'☆'} · ${cs}${hid}${hi}`}
function sjInfo(){const el=document.getElementById('sjInfo');if(!el||!SJ)return;let h='';const sel=SJ.sel.filter(u=>u.hp>0);
 if(SJ.flash&&Date.now()<SJ.flash.until)h=`<div class="sjflash">${esc(SJ.flash.t)}</div>`;
 else if(SJ.phase==='deploy'){const c=SJ.dsel&&SJ.cards.me.find(c=>c.t===SJ.dsel);h=c?`<div>${sjUnitLine({t:c.t,hp:100,side:'me',st:'ok'})}</div><div class="muted">${sjL('לחץ על משבצת ירוקה כדי להציב. לחיצה על יחידה מחזירה אותה.','Tap a green square to deploy. Tap a unit to take it back.')}</div>`:`<div class="muted">${sjL('בחר מערך ותחבולה, ואז כרטיסי יחידות. מה שלא תציב נשאר במילואים לתגבורת. בלי 母衣 אי אפשר לכבוש אזורים.','Choose a formation and a stratagem, then unit cards. What you do not deploy stays in reserve. Without 母衣 you cannot take zones.')}</div>`}
 else if(SJ.auto.me)h=`<div class="muted">${sjL('הבינה המלאכותית מפקדת על הצבא שלך. לחץ "אוטו" כדי לחזור לפיקוד.','The AI commands your army. Tap "Auto" to take command.')}</div>`;
 else if(sel.length===1)h=`<div>${sjUnitLine(sel[0])}</div><div class="muted">${sjL('לחץ על המפה כדי לזוז, או על אויב כדי לתקוף. לחיצה כפולה בוחרת את כל היחידות מאותו סוג.','Tap the map to move, or an enemy to attack. Double-tap selects every unit of that type.')}</div>`;
 else if(sel.length){const cnt={};for(const u of sel)cnt[u.t]=(cnt[u.t]||0)+1;h=`<div><b>${sel.length} ${sjL('יחידות','units')}</b> · ${Object.entries(cnt).map(([t,n])=>SJU[t].kj+'×'+n).join(' ')}</div><div class="muted">${sjL('לחץ על המפה כדי לזוז במבנה, או על אויב כדי לתקוף ביחד','Tap the map to move in formation, or an enemy to attack together')}</div>`}
 else{const p=SJ.hover;if(p){const o=SJ.units.find(u=>u.hp>0&&Math.floor(u.x)===p[0]&&Math.floor(u.y)===p[1]&&(u.side==='me'||u.vis.me));h=(o?`<div>${sjUnitLine(o)}</div>`:'')+`<div class="muted">${sjTileLine(p[0],p[1])}</div>`}else h=`<div class="muted">${sjL('בחר יחידה שלך (במחשב: גרור מלבן). רואים רק מה שהיחידות שלך רואות.','Pick one of your units (on a computer: drag a box). You see only what your units see.')}</div>`}
 el.innerHTML=h}
function sjArts(){const el=document.getElementById('sjArts');if(!el||!SJ)return;const k=SJ.phase+SJ.form.me+SJ.kei.me+(SJ.keiUsed.me?1:0)+(SJ.artsOpen?1:0);if(el.dataset.k===k)return;el.dataset.k=k;
 if(SJ.phase!=='deploy'){const F=SJ_FORM[SJ.form.me],K=SJ_KEI[SJ.kei.me];el.innerHTML=`<small>${F.kj} ${sjL(F.he,F.en)} · ${K.kj} ${sjL(K.he,K.en)}${SJ.keiUsed.me?sjL(' (נוצל)',' (spent)'):''}</small>`;return}
 const fr=Object.entries(SJ_FORM).map(([k,F])=>`<button class="sjchip${SJ.form.me===k?' on':''}" data-f="${k}"><span class="kanji">${F.kj}</span>${sjL(F.he,F.en)}</button>`).join('');
 const kr=Object.entries(SJ_KEI).map(([k,K])=>`<button class="sjchip${SJ.kei.me===k?' on':''}" data-k="${k}"><span class="kanji">${K.kj}</span>${sjL(K.he,K.en)}</button>`).join('');
 const F=SJ_FORM[SJ.form.me],K=SJ_KEI[SJ.kei.me],M=SJ.mods.me;
 el.innerHTML=`<div class="sjrow"><b>${sjL('陣形 מערך','陣形 Formation')}</b><div class="sjchips">${fr}</div></div><small class="muted">${F.kj} ${sjL(F.dh,F.de)}</small>
 <div class="sjrow"><b>${sjL('計略 תחבולה','計略 Stratagem')}</b><div class="sjchips">${kr}</div></div><small class="muted">${K.kj} ${sjL(K.dh,K.de)}</small>
 <details class="sjmods"${SJ.artsOpen?' open':''}><summary>${sjL(`מה הממלכה שלך מביאה לקרב (${M.list.length})`,`What your realm brings to the battle (${M.list.length})`)}</summary>${M.list.map(x=>`<div><span class="kanji">${x.ic}</span> ${esc(sjL(x.h,x.e))}</div>`).join('')}</details>`;
 el.querySelectorAll('[data-f]').forEach(b=>b.onclick=e=>{e.preventDefault();sjSetForm(b.dataset.f)});el.querySelectorAll('[data-k]').forEach(b=>b.onclick=e=>{e.preventDefault();sjSetKei(b.dataset.k)});
 const d=el.querySelector('details');if(d)d.ontoggle=()=>{SJ.artsOpen=d.open}}
function sjHud(){if(!SJ)return;const ov=document.getElementById('sjOv');if(!ov)return;const q=s=>ov.querySelector(s);sjPadBuild();sjArts();
 const left=Math.max(0,SJ.limit-SJ.t),mm=Math.floor(left/60),ss=String(Math.floor(left%60)).padStart(2,'0');
 q('#sjDay').textContent=SJ.phase==='deploy'?sjL('布陣 פריסה','布陣 Deploy'):`⏱ ${mm}:${ss}`;try{q('#sjWx').textContent=wxLabel()}catch(e){}
 for(const s of['me','foe']){const el=q(s==='me'?'#sjCoMe':'#sjCoFoe'),P=SJCO[SJ.co[s]];el.querySelector('b').textContent=s==='me'?((typeof playerName==='function'&&playerName())||S.name||''):(SJ.ctx.fd&&SJ.ctx.fd.name||'');
  el.querySelector('.sjmeter i').style.width=(SJ.pow[s]?Math.round(SJ.powT[s]/20*100):Math.round(SJ.meter[s]/SJ_PMAX*100))+'%';el.classList.toggle('sjfull',SJ.meter[s]>=SJ_PMAX||!!SJ.pow[s]);el.classList.toggle('sjon',!!SJ.pow[s]);
  const known=s==='me'||!WAR.docKey||docKnown(WAR.docKey)||SJ.pow[s],F=SJ_FORM[SJ.form[s]],fk=s==='me'||dl('spies')>0||docKnown(WAR.docKey);el.querySelector('small').textContent=(known?`${P.kj} ${sjL(P.he,P.en)}`:sjL('כוח לא ידוע','Unknown power'))+(F&&fk&&SJ.phase==='battle'?` · ${F.kj}`:'')}
 const fm=sjStr('me')/SJ.budget.me,ff=sjStr('foe')/SJ.budget.foe;q('#sjBarMe').style.width=Math.round(clamp(fm,0,1)*100)+'%';q('#sjBarFoe').style.width=Math.round(clamp(ff,0,1)*100)+'%';
 q('#sjNMe').textContent=fmtN(Math.round(WAR.my.max*fm));q('#sjNFoe').textContent=fmtN(Math.round(WAR.foe.max*ff));
 const att=sjAtt();q('#sjScMe').textContent=SJ.kind==='siege'&&att!=='me'?sjL('מחזיקים','Holding'):`${Math.floor(SJ.score.me)}/${SJ_SCORE}`;q('#sjScFoe').textContent=SJ.kind==='siege'&&att!=='foe'?sjL('מחזיקים','Holding'):`${Math.floor(SJ.score.foe)}/${SJ_SCORE}`;
 q('#sjZs').innerHTML=SJ.zones.map(z=>`<i class="${z.own||''}">${z.kj}</i>`).join('');
 const L=SJ.budget.me-SJ.spent.me;q('#sjResL').textContent=SJ.phase==='deploy'?sjL(`נקודות: ${L} מתוך ${SJ.budget.me}`,`Points: ${L} of ${SJ.budget.me}`):sjL(`מילואים: ${L} נקודות`,`Reserve: ${L} points`);
 const cb=q('#sjCards');const ck=SJ.cards.me.map(c=>c.t+c.used+(SJ.dsel===c.t?'s':'')+(c.cost<=L?'y':'n')).join()+SJ.phase+SJ.auto.me;if(cb.dataset.k!==ck){cb.dataset.k=ck;cb.innerHTML='';
  for(const c of SJ.cards.me){const b=document.createElement('button');b.className='sjcardb'+(SJ.dsel===c.t?' on':'');b.disabled=c.used>=c.max||c.cost>L||(SJ.phase==='battle'&&SJ.auto.me);b.innerHTML=`<span class="kanji">${SJU[c.t].kj}</span><b>${sjName(c.t)}</b><small>${c.cost} · ${c.max-c.used}/${c.max}</small>`;b.onclick=e=>{e.preventDefault();sjCardTap(c.t)};cb.append(b)}}
 const my=SJ.phase==='battle'&&!SJ.over;const set=(id,f)=>{const b=q(id);if(b)f(b)};
 set('#sjPause',b=>{b.textContent=SJ.paused?'▶':'⏸';b.disabled=!my;b.classList.toggle('glow',SJ.paused)});set('#sjSpd',b=>{b.textContent=SJ.fast?'⏩':'×'+SJ.spd;b.disabled=!my||SJ.fast});
 set('#sjPow',b=>{const P=SJCO[SJ.co.me];b.textContent=`⚡ ${P.kj}`;b.disabled=!my||SJ.auto.me||SJ.meter.me<SJ_PMAX||!!SJ.pow.me;b.classList.toggle('glow',!b.disabled)});
 set('#sjKei',b=>{const K=SJ_KEI[SJ.kei.me];b.textContent=`計 ${K.kj}`;b.disabled=!my||SJ.auto.me||!!SJ.keiUsed.me;b.classList.toggle('glow',!b.disabled&&SJ.t>15)});
 set('#sjAuto',b=>{b.classList.toggle('on',SJ.auto.me);b.textContent=SJ.auto.me?sjL('⏹ אוטו','⏹ Auto'):sjL('אוטו','Auto')});
 for(const id of['#sjAll','#sjStop','#sjBack'])set(id,b=>{b.disabled=!my||SJ.auto.me});set('#sjGo',b=>{b.disabled=SJ.over});
 sjInfo()}
function sjHelp(){if(!SJ)return;const old=document.getElementById('sjHelpOv');if(old){old.remove();return}const d=document.createElement('div');d.id='sjHelpOv';d.setAttribute('dir',TX('rtl','ltr'));const wasP=SJ.paused;if(SJ.phase==='battle')SJ.paused=true;
 const tk=SJ.sea?['atake','seki','kobaya','flag']:['yari','yumi','ishi','kiba','kisha','sam','monk','shinobi','horo','kake','konida','gen'];
 const rows=tk.map(k=>{const s=Object.keys(SJB[k]||{}).filter(x=>SJB[k][x]>=80&&!SJU[x].st),w=Object.keys(SJB).filter(x=>SJB[x][k]>=80&&!SJU[x].st),R=SJ_RT[k];return `<tr><td><b>${SJU[k].kj}</b> ${sjName(k)}</td><td>${SJ_COST[k]||'–'}</td><td dir="ltr">${R.rg?R.rg:'⚔'}</td><td>${s.map(x=>SJU[x].kj).join(' ')||'–'}</td><td>${w.map(x=>SJU[x].kj).join(' ')||'–'}</td></tr>`}).join('');
 const P=SJCO[SJ.co.me];
 d.innerHTML=`<div class="sjhelp"><h3>${sjL('戦場 · קרב בזמן אמת','戦場 · Real-time battle')}</h3>
 <p><b>${sjL('1. פריסה (布陣):','1. Deploy (布陣):')}</b> ${sjL('בחר מערך (陣形) מתוך שמונת המערכים הקלאסיים, ותחבולה אחת (計略) לקרב. כוח הצבא שלך נותן נקודות: בחר כרטיסים והצב יחידות באזור הירוק. מה שלא תוציא נשאר במילואים, ובאמצע הקרב לחיצה על כרטיס שולחת תגבורת למטה.','Choose one of the eight classic formations (陣形) and one stratagem (計略). Your army’s power gives you points: pick cards and place units in the green zone. What you do not spend stays in reserve; mid-battle, tapping a card sends reinforcements to your HQ.')}</p>
 <p><b>${sjL('2. פקודות:','2. Orders:')}</b> ${sjL('לחץ על יחידה ואז על המפה כדי לזוז, או על אויב כדי לתקוף. לחיצה כפולה בוחרת את כל היחידות מאותו סוג, ו"全" בוחר את כולן. במחשב: גרירת מלבן בוחרת, לחיצה ימנית נותנת פקודה, רווח עוצר את הזמן. יחידות יורות לבד על כל אויב בטווח.','Tap a unit, then the map to move, or an enemy to attack. Double-tap selects every unit of that type; "全" selects them all. On a computer: drag a box to select, right-click to order, space pauses. Units shoot on their own at any enemy in range.')}</p>
 <p><b>${sjL('3. ערפל מלחמה:','3. Fog of war:')}</b> ${sjL('רואים רק מה שהיחידות שלך רואות. מגבעה רואים רחוק, השינובי רואים הכי רחוק ונשארים נסתרים. יער וכפר מסתירים, עד שמתקרבים או עד שיורים מהם. בלילה ובערפל רואים פחות.','You see only what your units see. From a hill you see far; shinobi see farthest and stay hidden. Forest and villages conceal, until you come close or they shoot. At night and in fog you see less.')}</p>
 <p><b>${sjL('4. מורל ואספקה:','4. Morale and supply:')}</b> ${sjL('אש מדכאת. יחידה מדוכאת (動) נלחמת וזזה לאט, ויחידה שנשברת (敗) בורחת למטה. ליד המפקד מתאוששים מהר. לקשתים יש מספר מטחים מוגבל: שיירת האספקה (荷駄) והמטה ממלאים חצים ומרפאים.','Fire suppresses. A suppressed unit (動) fights and moves slowly; a broken one (敗) runs to the HQ. Near the commander they recover fast. Archers carry limited volleys: the supply train (荷駄) and the HQ refill quivers and tend the wounded.')}</p>
 <p><b>${sjL('5. ניצחון:','5. Victory:')}</b> ${sjL(`רק רוכבי הפיקוד (母衣) והמפקד כובשים אזורי דגל ⚑. כל אזור שמוחזק נותן נקודה בשנייה, והראשון ל־${SJ_SCORE} מנצח. אפשר גם להפיל את המפקד (将) או לשבור את הצבא. במצור שוברים שער עם 掛矢 וכובשים את הטנשו, והמגן מנצח אם הזמן נגמר.`,`Only the command riders (母衣) and the commander take flag zones ⚑. Each zone held gives a point per second; first to ${SJ_SCORE} wins. You can also bring down the commander (将) or break the army. In a siege you break a gate with 掛矢 and take the keep; the defender wins when time runs out.`)}</p>
 <table class="sjtab"><tr><th></th><th>${sjL('נק׳','Pts')}</th><th>🎯</th><th>${sjL('חזק מול','Strong vs')}</th><th>${sjL('חלש מול','Weak vs')}</th></tr>${rows}</table>
 <p><b>⚡ ${P.kj} ${sjL(P.he,P.en)}</b>: ${sjL(P.dh,P.de)}. ${sjL('20 שניות, ומרגיע מיד את כל היחידות שלך.','20 seconds, and it steadies all your units at once.')}</p>
 <button class="sjb gold" id="sjHelpX">${sjL('הבנתי','Got it')}</button></div>`;
 document.body.append(d);d.onclick=e=>{if(e.target===d||e.target.id==='sjHelpX'){d.remove();if(SJ&&SJ.phase==='battle')SJ.paused=wasP}}}
document.head.insertAdjacentHTML('beforeend',`<style>
#sjOv{position:fixed;inset:0;z-index:85;background:radial-gradient(ellipse at 50% 0%,#2a1c14,#0d0806 70%);display:flex;justify-content:center;overflow-y:auto;-webkit-user-select:none;user-select:none;touch-action:manipulation}
#sjOv .sjwrap{width:min(780px,100%,max(560px,calc((100vh - 360px) * 1.25)));min-height:100%;display:flex;flex-direction:column;gap:5px;padding:6px 6px max(10px,env(safe-area-inset-bottom));box-sizing:border-box}
#sjOv .sjtop{direction:ltr;display:grid;grid-template-columns:1fr auto 1fr;gap:6px;align-items:center}
#sjOv .sjco{display:flex;gap:6px;align-items:center;min-width:0;padding:4px;border-radius:10px;background:rgba(0,0,0,.35);border:1px solid #3a2a20}
#sjOv .sjco.foe{flex-direction:row-reverse;text-align:end}
#sjOv .sjco canvas{width:50px;height:50px;border-radius:8px;border:2px solid #5aa0ff;flex:none;background:#1a1010}
#sjOv .sjco.foe canvas{border-color:#ff6a4a}
#sjOv .sjcoi{min-width:0;flex:1;display:flex;flex-direction:column;gap:2px}
#sjOv .sjcoi b{font:14px var(--display);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#sjOv .sjcoi small{font-size:10px;color:var(--paper-dim,#b8a890);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#sjOv .sjmeter{height:7px;border-radius:4px;background:#2a1a14;overflow:hidden;border:1px solid #000}
#sjOv .sjmeter i{display:block;height:100%;background:linear-gradient(90deg,#a8792a,#ffe39a);transition:width .3s}
#sjOv .sjco.foe .sjmeter{transform:scaleX(-1)}
#sjOv .sjco.sjfull .sjmeter i{animation:sjglow .7s infinite alternate}#sjOv .sjco.sjon{box-shadow:0 0 0 2px var(--gold) inset}
@keyframes sjglow{from{filter:brightness(1)}to{filter:brightness(1.6)}}
#sjOv .sjday{text-align:center;display:flex;flex-direction:column}#sjOv .sjday b{font:17px var(--display);color:var(--gold);font-variant-numeric:tabular-nums}#sjOv .sjday small{font-size:10px;color:#cdbfa4;max-width:90px}
#sjOv .sjstr{display:grid;grid-template-columns:1fr 1fr;gap:6px;direction:ltr}
#sjOv .sjbar{position:relative;height:13px;background:#2a1410;border:1px solid #000;border-radius:3px;overflow:hidden}
#sjOv .sjbar i{position:absolute;inset:0 auto 0 0;background:linear-gradient(180deg,#6ab0ff,#2a5aa8);transition:width .4s}
#sjOv .sjbar.foe i{inset:0 0 0 auto;background:linear-gradient(180deg,#ff8a6a,#a8291a)}
#sjOv .sjbar span{position:absolute;inset:0;font:10px/13px Rubik,sans-serif;text-align:center;color:#fff;text-shadow:0 1px 2px #000}
#sjOv .sjscore{direction:ltr;display:flex;align-items:center;justify-content:space-between;gap:6px;font:600 13px Rubik,sans-serif}
#sjOv .sjscore .me{color:#8fc4ff}#sjOv .sjscore .foe{color:#ff9a7a}
#sjOv .sjzs{display:flex;gap:4px}#sjOv .sjzs i{font:normal 12px 'Yuji Syuku',serif;padding:1px 6px;border-radius:6px;background:#2e2219;border:1px solid #4a3a30}
#sjOv .sjzs i.me{background:#27427a;border-color:#5aa0ff}#sjOv .sjzs i.foe{background:#7a1e1a;border-color:#ff6a4a}
#sjOv .sjcvw{direction:ltr;border:2px solid #000;border-radius:6px;overflow:hidden;box-shadow:0 0 0 1px #4a3a30}
#sjOv canvas#sjCv{display:block;width:100%;height:auto;aspect-ratio:${SJ_C}/${SJ_R};image-rendering:pixelated;touch-action:none;cursor:crosshair}
#sjOv .sjinfo{min-height:40px;font-size:13px;line-height:1.35;padding:4px 8px;border-radius:8px;background:rgba(236,228,210,.08);border:1px solid #3a2a20}
#sjOv .sjinfo .muted,#sjOv .sjarts .muted{color:#cdbfa4;font-size:12px}#sjOv .sjflash{color:#ffe39a}
#sjOv .sjarts{display:flex;flex-direction:column;gap:3px}#sjOv .sjarts>small{font-size:12px;color:#e6d4a8}
#sjOv .sjrow{display:flex;align-items:center;gap:6px}#sjOv .sjrow>b{font:12px var(--display);color:var(--gold);flex:none;white-space:nowrap}
#sjOv .sjchips{display:flex;gap:4px;overflow-x:auto;padding-bottom:2px}
#sjOv .sjchip{flex:none;display:flex;align-items:center;gap:3px;padding:3px 7px;border-radius:999px;border:1px solid #4a3a30;background:#1e1612;color:var(--paper,#f0e6d2);font:12px var(--body);cursor:pointer;white-space:nowrap}
#sjOv .sjchip .kanji{color:var(--gold);font-size:13px}#sjOv .sjchip.on{border-color:var(--gold);background:#3a2a14;box-shadow:0 0 0 1px var(--gold) inset}
#sjOv .sjmods{font-size:12px;color:#e0d2b4;background:rgba(0,0,0,.25);border:1px solid #3a2a20;border-radius:8px;padding:3px 8px}#sjOv .sjmods summary{cursor:pointer;color:var(--gold)}#sjOv .sjmods .kanji{color:var(--gold)}
#sjOv .sjres{display:flex;flex-direction:column;gap:3px}#sjOv .sjres small{font-size:11px;color:#cdbfa4}
#sjOv .sjcardsb{display:flex;gap:5px;overflow-x:auto;padding-bottom:2px}
#sjOv .sjcardb{flex:none;display:flex;flex-direction:column;align-items:center;gap:0;min-width:64px;padding:3px 5px;border-radius:8px;border:1px solid #4a3a30;background:linear-gradient(180deg,#2a2018,#17110f);color:var(--paper,#f0e6d2);cursor:pointer}
#sjOv .sjcardb .kanji{font-size:18px;color:var(--gold)}#sjOv .sjcardb b{font:500 11px var(--body);white-space:nowrap}#sjOv .sjcardb small{font-size:10px;color:#cdbfa4}
#sjOv .sjcardb.on{border-color:var(--gold);box-shadow:0 0 0 1px var(--gold) inset;background:#3a2a14}#sjOv .sjcardb:disabled{opacity:.38}
#sjOv .sjpad{display:grid;grid-template-columns:repeat(5,1fr);gap:5px;margin-top:auto}
#sjOv .sjb{min-height:42px;border-radius:9px;border:1px solid #4a3a30;background:linear-gradient(180deg,#2e2219,#17110f);color:var(--paper,#f0e6d2);font:14px var(--body);cursor:pointer;padding:2px 3px}
#sjOv .sjb:disabled{opacity:.4;cursor:default}#sjOv .sjb.on{border-color:var(--gold);color:var(--gold)}
#sjOv .sjb.gold{background:linear-gradient(180deg,#e6b450,#a8792a);color:#1a0e06;border-color:#000;font-weight:600;grid-column:span 2}
#sjOv .sjb.ghost{background:rgba(0,0,0,.25)}
#sjOv .sjb.glow{border-color:var(--gold);box-shadow:0 0 10px rgba(230,180,80,.7);animation:sjglow .7s infinite alternate}
body:has(#sjOv) #helpFab,body:has(#sjOv) #quickBar{display:none!important}
#sjHelpOv{position:fixed;inset:0;z-index:86;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;padding:10px}
#sjHelpOv .sjhelp{max-width:560px;max-height:90vh;overflow:auto;background:#1e1510;border:2px solid var(--gold);border-radius:12px;padding:12px 14px;font-size:13px;line-height:1.45}
#sjHelpOv h3{margin:0 0 6px;font:20px var(--display);color:var(--gold)}#sjHelpOv p{margin:0 0 6px}
#sjHelpOv .sjtab{width:100%;border-collapse:collapse;font-size:12px;margin:4px 0 8px}#sjHelpOv .sjtab td,#sjHelpOv .sjtab th{border-bottom:1px solid #3a2a20;padding:3px;text-align:center}#sjHelpOv .sjtab td:first-child{text-align:start}
#sjHelpOv .sjb{min-height:40px;width:100%;margin-top:6px;border-radius:9px;border:1px solid #000;background:linear-gradient(180deg,#e6b450,#a8792a);color:#1a0e06;font:600 15px var(--body)}
</style>`);

/* a battle abandoned halfway (the page closed or reloaded) counts as a disorderly retreat, so it cannot be dodged and retried */
setInterval(()=>{try{if(!S||!S.sjPend||SJ||(WAR&&WAR.sj&&!WAR.over))return;const P=S.sjPend;delete S.sjPend;const lost=Math.round((S.est.soldiers||0)*.15);S.est.soldiers=Math.max(0,(S.est.soldiers||0)-lost);S.streak=0;S.est.mor=clamp((S.est.mor||50)-5,0,100);save();
 try{feed(TX(`${P.p}: הצבא עזב את שדה הקרב באמצע · −${lost} חיילים`,`${P.p}: the army left the field mid-battle · −${lost} soldiers`))}catch(e){}toast(TX(`הקרב ב${P.p} ננטש באמצע: נסיגה בלי סדר, ${lost} חיילים אבדו.`,`The battle at ${P.p} was abandoned: a disorderly retreat, ${lost} soldiers lost.`))}catch(e){}},2500);
/* ---------- the hooks into the old war ---------- */
/* the core sets the war up; the battle replaces the three rounds as soon as the war screen first settles */
{const o=refreshWar;refreshWar=function(){const r=o.apply(this,arguments);try{if(WAR&&!WAR.sj&&!WAR.over&&WAR.round===0&&!WAR.busy&&!SJ){WAR.sj=1;WAR.busy=true;setTimeout(()=>{try{if(WAR&&WAR.sj&&!WAR.over)sjStart()}catch(e){console.warn('senjo start',e);WAR.busy=false;WAR.sj=0}},30)}}catch(e){}return r}}
{const o=warRound;warRound=async function(t){if(WAR&&WAR.sj){if(t==='retreat'&&SJ)return sjRetreat();return}return o.apply(this,arguments)}}
{const o=autoWar;autoWar=function(){if(WAR&&WAR.sj){try{if(SJ&&!SJ.over&&S.autoFight){SJ.auto.me=true;SJ.fast=true;SJ.spd=60;SJ.cut=null;if(SJ.phase==='deploy'){sjAutoDeploy('me',.85);sjBegin()}}}catch(e){}return}return o.apply(this,arguments)}}
/* the old siege mini-battle (ladders against direct assault) is now the siege map itself */
{const o=startWar;startWar=async function(ctx){SJ_SKIPSG++;try{S.seenHelp=S.seenHelp||{};S.seenHelp.war=1}catch(e){}try{return await o.apply(this,arguments)}finally{SJ_SKIPSG=Math.max(0,SJ_SKIPSG-1)}}}
{const o=choice;choice=function(html,opts){try{if(SJ_SKIPSG&&Array.isArray(opts)&&opts.length===2&&opts[0].key==='sg'&&opts[1].key==='go')return Promise.resolve('go')}catch(e){}return o.apply(this,arguments)}}
try{HELP.war=[TX('戦場 · שדה הקרב','戦場 · The battlefield'),TX('קרב בזמן אמת. לפני הקרב בוחרים מערך (陣形) ותחבולה (計略) ומציבים יחידות לפי נקודות הכוח של הצבא. בקרב: לחץ על יחידה ואז על המפה או על אויב. רואים רק מה שהיחידות רואות, אש שוברת מורל. רק רוכבי הפיקוד (母衣) והמפקד כובשים אזורי דגל, והראשון ל־120 נקודות מנצח.','A real-time battle. Before it you choose a formation (陣形) and a stratagem (計略) and deploy units with your army’s points. In battle: tap a unit, then the map or an enemy. You see only what your units see, fire breaks morale. Only the command riders (母衣) and the commander take flag zones, and the first to 120 points wins.')]}catch(e){}
/* the board: each realm keeps a small war record, and its generals fight by it */
{const o=rkSnap;rkSnap=function(){const r=o.apply(this,arguments);try{if(r&&S){const sjw=SJ;SJ={sea:false,kind:'field',keepSide:null,ctx:{fd:{}},mods:{}};let w;try{w=sjWeights('me')}finally{SJ=sjw}
  const m={};for(const k of['yari','yumi','ishi','kiba','kisha','sam','shinobi'])if(w[k])m[k]=Math.min(20,Math.round(w[k]*2)/2);r.wr={...m,ag:+clamp((S.sjRec&&S.sjRec.ag)||.6,0,1).toFixed(2)}}}catch(e){}return r}}
{const o=rkFoe;rkFoe=function(t){const f=o.apply(this,arguments);try{const e=(t&&t.emp)||{},w=e.wr;if(w&&typeof w==='object'){const c={};let any=0;for(const k of['yari','yumi','ishi','kiba','kisha','sam','shinobi']){const v=+w[k];if(isFinite(v)&&v>0){c[k]=clamp(v,0,20);any=1}}if(any){c.ag=clamp(isFinite(+w.ag)?+w.ag:.6,0,1);f.sjWr=c}}
  const hi=e.hero!=null?e.hero|0:(t.h|0);if(HEROES[hi]){f.sjHero=SJCO[HEROES[hi].id]?HEROES[hi].id:null;f.sjHeroIdx=hi}}catch(er){}return f}}
if(false)window.__sj={get SJ(){return SJ},cityFoe:c=>cityFoe(c),armyPower:()=>armyPower(),navyPower:()=>navyPower(),rkFoe:t=>rkFoe(t),sjBegin:()=>sjBegin(),sjAutoDeploy:(s,f)=>sjAutoDeploy(s,f),sjTapRT:(x,y,r)=>sjTapRT(x,y,r),sjAutoTog:()=>sjAutoTog(),sjRetreat:()=>sjRetreat(),sjActivate:x=>sjActivate(x),sjKei:x=>sjKei(x),sjSetForm:k=>sjSetForm(k),sjSetKei:k=>sjSetKei(k),sjCall:(s,t)=>sjCall(s,t),sjBudget,sjFinish:r=>sjFinish(r),get last(){return SJ_LAST},SJU,SJB,SJT,SJ_FORM,SJ_KEI};
