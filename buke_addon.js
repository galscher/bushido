/* ================= 武家 The warrior house: everything a samurai house was made of =================
   Kamon on the banners and on the map (the great clans of the age, each in its own years),
   the kamae of the sword (jōdan, chūdan, gedan), shuriken of the Iga and Kōga schools,
   the pieces of the tōsei-gusoku, the kabuto crest, the menpō and the hair of the age,
   footwear (ashinaka, waraji, geta, yuki-geta), the torii of your shrine,
   the hilt wrap, the bokken, and the ladder of society from peasant to shōgun. */
const BK=()=>{if(!S)return{g:{},shu:{}};S.buke=S.buke||{g:{},shu:{}};S.buke.g=S.buke.g||{};S.buke.shu=S.buke.shu||{};return S.buke};
const bkCost=(base,l)=>Math.round(base*Math.pow(2,l)*(1+(S.level||1)/40));
/* ---------- 家紋 kamon ---------- */
function monDraw(g,id,x,y,r,fg,bg){g.save();g.translate(x,y);if(bg){g.fillStyle=bg;g.beginPath();g.arc(0,0,r,0,7);g.fill()}g.fillStyle=fg;g.strokeStyle=fg;g.lineWidth=Math.max(1,r*.12);
 const ring=(k)=>{g.beginPath();g.arc(0,0,r*(k||.86),0,7);g.stroke()},dot=(a,b,c)=>{g.beginPath();g.arc(a*r,b*r,c*r,0,7);g.fill()},dia=(a,b,w,h)=>{g.beginPath();g.moveTo(a*r,(b-h)*r);g.lineTo((a+w)*r,b*r);g.lineTo(a*r,(b+h)*r);g.lineTo((a-w)*r,b*r);g.closePath();g.fill()},leaf=(ang,len,wd)=>{g.save();g.rotate(ang);g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(wd*r,-len*r*.5,0,-len*r);g.quadraticCurveTo(-wd*r,-len*r*.5,0,0);g.fill();g.restore()};
 switch(id){
  case'takeda':for(const[a,b]of[[0,-.36],[-.36,0],[.36,0],[0,.36]])dia(a,b,.3,.3);break;
  case'shimazu':ring(.82);g.lineWidth=r*.2;g.beginPath();g.moveTo(-.62*r,0);g.lineTo(.62*r,0);g.moveTo(0,-.62*r);g.lineTo(0,.62*r);g.stroke();break;
  case'hojo':for(const[a,b]of[[0,-.42],[-.42,.3],[.42,.3]]){g.beginPath();g.moveTo(a*r,(b-.38)*r);g.lineTo((a+.4)*r,(b+.3)*r);g.lineTo((a-.4)*r,(b+.3)*r);g.closePath();g.fill()}break;
  case'mori':g.fillRect(-.7*r,-.6*r,1.4*r,.22*r);dot(0,-.02,.24);dot(-.3,.42,.24);dot(.3,.42,.24);break;
  case'oda':for(let i=0;i<5;i++){const a=i/5*Math.PI*2-Math.PI/2;dot(Math.cos(a)*.45,Math.sin(a)*.45,.32)}if(bg){g.fillStyle=bg;dot(0,0,.22);g.fillStyle=fg}dot(0,0,.12);break;
  case'imagawa':case'futatsu':ring(.82);g.fillRect(-.7*r,-.32*r,1.4*r,.2*r);g.fillRect(-.7*r,.12*r,1.4*r,.2*r);break;
  case'chosokabe':for(let i=0;i<3;i++)leaf(i/3*Math.PI*2,.8,.42);dot(0,0,.1);break;
  case'tokugawa':ring(.86);for(let i=0;i<3;i++){g.save();g.rotate(i/3*Math.PI*2);g.beginPath();g.moveTo(0,-.05*r);g.bezierCurveTo(.5*r,-.3*r,.35*r,-.75*r,0,-.68*r);g.bezierCurveTo(-.35*r,-.75*r,-.5*r,-.3*r,0,-.05*r);g.fill();g.restore()}break;
  case'uesugi':ring(.86);leaf(-.6,.75,.25);leaf(.6,.75,.25);leaf(Math.PI,.6,.22);dot(0,.1,.14);break;
  case'date':ring(.86);for(let i=0;i<4;i++)leaf(i/4*Math.PI*2+.4,.65,.2);dot(0,0,.14);break;
  case'otomo':leaf(-.5,.85,.32);leaf(.5,.85,.32);g.fillRect(-.05*r,0,.1*r,.6*r);break;
  case'ouchi':dia(0,0,.75,.75);if(bg){g.fillStyle=bg;for(const[a,b]of[[0,-.3],[-.3,0],[.3,0],[0,.3]])dia(a,b,.16,.16);g.fillStyle=fg}break;
  case'amako':for(const[a,b]of[[0,-.38],[-.38,0],[.38,0],[0,.38]]){g.save();g.translate(a*r,b*r);g.rotate(Math.PI/4);g.strokeRect(-.2*r,-.2*r,.4*r,.4*r);g.restore()}break;
  case'asakura':case'kikko':for(const[a,b]of[[0,-.36],[-.33,.2],[.33,.2]]){g.beginPath();for(let i=0;i<6;i++){const t=i/6*Math.PI*2;g[i?'lineTo':'moveTo'](a*r+Math.cos(t)*.32*r,b*r+Math.sin(t)*.32*r)}g.closePath();g.stroke()}break;
  case'hosokawa':case'kuyo':dot(0,0,.24);for(let i=0;i<8;i++){const a=i/8*Math.PI*2;dot(Math.cos(a)*.6,Math.sin(a)*.6,.17)}break;
  case'miyoshi':dia(0,-.42,.42,.2);dia(0,0,.42,.2);dia(0,.42,.42,.2);break;
  case'satomi':ring(.82);g.fillRect(-.7*r,-.1*r,1.4*r,.22*r);break;
  case'tomoe':for(let i=0;i<3;i++){g.save();g.rotate(i/3*Math.PI*2);g.beginPath();g.arc(0,-.36*r,.26*r,0,7);g.fill();g.beginPath();g.moveTo(.26*r,-.36*r);g.quadraticCurveTo(.5*r,.1*r,.05*r,.2*r);g.lineTo(0,-.1*r);g.fill();g.restore()}break;
  case'kikyo':for(let i=0;i<5;i++){g.save();g.rotate(i/5*Math.PI*2);g.beginPath();g.moveTo(0,0);g.lineTo(-.28*r,-.55*r);g.lineTo(0,-.78*r);g.lineTo(.28*r,-.55*r);g.closePath();g.stroke();g.restore()}break;
  case'ume':dot(0,0,.2);for(let i=0;i<5;i++){const a=i/5*Math.PI*2-Math.PI/2;dot(Math.cos(a)*.55,Math.sin(a)*.55,.24)}break;
  case'taka':ring(.86);for(const s of[-1,1]){g.save();g.rotate(s*.5);g.beginPath();g.ellipse(0,0,.16*r,.7*r,0,0,7);g.fill();g.restore()}break;
  default:dot(0,0,.5)}g.restore()}
const MONCLAN=[
 {id:'hosokawa',n:TX('הוסוקאווה','Hosokawa'),seat:'settsu',yr:[1460,1549],col:'#e8e0cc'},{id:'ouchi',n:TX('אוצ׳י','Ōuchi'),seat:'suo',yr:[1460,1557],col:'#5a5a8a'},
 {id:'amako',n:TX('אמאקו','Amako'),seat:'izumo',yr:[1460,1566],col:'#2a2a2a'},{id:'imagawa',n:TX('אימאגאווה','Imagawa'),seat:'suruga',yr:[1460,1569],col:'#e8e0cc'},
 {id:'asakura',n:TX('אסאקורה','Asakura'),seat:'echizen',yr:[1460,1573],col:'#e8e0cc'},{id:'miyoshi',n:TX('מיושי','Miyoshi'),seat:'awas',yr:[1530,1575],col:'#1a1a1a'},
 {id:'takeda',n:TX('טאקדה','Takeda'),seat:'kai',yr:[1460,1582],col:'#8a1c1c'},{id:'hojo',n:TX('הוג׳ו','Hōjō'),seat:'sagami',yr:[1495,1590],col:'#2a3a8a'},
 {id:'uesugi',n:TX('אוסוגי','Uesugi'),seat:'echigo',yr:[1460,1615],col:'#1a3a8a'},{id:'oda',n:TX('אודה','Oda'),seat:'owari',yr:[1460,1582],col:'#c8a030'},
 {id:'tokugawa',n:TX('טוקוגאווה','Tokugawa'),seat:'mikawa',yr:[1560,1615],col:'#1a1a1a'},{id:'date',n:TX('דאטה','Date'),seat:'rikuzen',yr:[1460,1615],col:'#e8e0cc'},
 {id:'mori',n:TX('מורי','Mōri'),seat:'aki',yr:[1555,1615],col:'#8a1c1c'},{id:'chosokabe',n:TX('צ׳וסוקאבה','Chōsokabe'),seat:'tosa',yr:[1560,1600],col:'#1a1a1a'},
 {id:'otomo',n:TX('אוטומו','Ōtomo'),seat:'bungo',yr:[1460,1593],col:'#c8a030'},{id:'shimazu',n:TX('שימאזו','Shimazu'),seat:'satsuma',yr:[1460,1615],col:'#1a6a3a'},
 {id:'satomi',n:TX('סאטומי','Satomi'),seat:'awab',yr:[1460,1614],col:'#e8e0cc'}];
const MONMINE=[['tomoe',TX('מיצודומואה, שלושה פסיקים','Mitsudomoe, three commas')],['kikyo',TX('קיקיו, פרח הפעמון','Kikyō, the bellflower')],['ume',TX('אומהבאצ׳י, פריחת השזיף','Umebachi, the plum blossom')],['kikko',TX('קיקו, שריון הצב','Kikkō, the tortoise shell')],['taka',TX('טאקה־נו־הא, נוצות הנץ','Taka-no-ha, hawk feathers')],['kuyo',TX('קויו, תשעת הכוכבים','Kuyō, the nine stars')],['futatsu',TX('פוטאצוביקי, שני הקווים','Futatsubiki, two lines')]];
const myMon=()=>{try{return BK().mon||null}catch(e){return null}};
{const o=drawProvMap;drawProvMap=function(){const r=o.apply(this,arguments);try{const cv=$('#provMap');if(!cv||!MAPD||!S)return r;const g=cv.getContext('2d'),sc=cv.width/MAPW,kf=cv.width/(cv.clientWidth||cv.width),y=tYear();g.save();g.setTransform(1,0,0,1,0,0);
  for(const c of MONCLAN){if(y<c.yr[0]||y>c.yr[1])continue;const i=CITIES.findIndex(x=>x.id===c.seat);if(i<0||S.clan.cities.includes(c.seat))continue;const p=MAPD.pts[i];if(!p)continue;const R=6.5*kf,X=p.x*sc,Y=p.y*sc-11*kf;
   g.fillStyle='rgba(0,0,0,.5)';g.beginPath();g.arc(X+1.5*kf,Y+1.5*kf,R+1.5*kf,0,7);g.fill();g.fillStyle=c.col;g.beginPath();g.arc(X,Y,R+1.5*kf,0,7);g.fill();monDraw(g,c.id,X,Y,R,c.col==='#e8e0cc'?'#1a1a1a':'#f4efe4',null)}
  const m=myMon();if(m&&S.clan.cities.length){const i=CITIES.findIndex(x=>x.id===S.clan.cities[0]);const p=i>=0&&MAPD.pts[i];if(p){const R=7.5*kf,X=p.x*sc,Y=p.y*sc-13*kf;g.fillStyle='#1a5a9a';g.beginPath();g.arc(X,Y,R+2*kf,0,7);g.fill();monDraw(g,m,X,Y,R,'#ffffff',null)}}
  g.restore()}catch(e){}return r}}
/* ---------- 構え kamae ---------- */
const KAM={jodan:{kj:'上段',sh:TX('גבוה','High'),n:TX('ג׳ודאן, האש','Jōdan, fire'),d:TX('החרב מעל הראש: +20% נזק, אבל חשוף: +15% נזק נגדך. מנצח את הגדאן.','Sword above the head: +20% damage, but open: +15% damage taken. Beats gedan.'),dmg:1.2,tk:1.15,hit:0,beats:'gedan'},
 chudan:{kj:'中段',sh:TX('אמצע','Mid'),n:TX('צ׳ודאן, המים','Chūdan, water'),d:TX('החוד מול הגרון: +6 לפגיעה, מאוזן. מנצח את הג׳ודאן.','Point at the throat: +6 to hit, balanced. Beats jōdan.'),dmg:1,tk:1,hit:6,beats:'jodan'},
 gedan:{kj:'下段',sh:TX('נמוך','Low'),n:TX('גדאן, האדמה','Gedan, earth'),d:TX('החרב נמוכה: −20% נזק נגדך, −15% נזק שלך. מנצח את הצ׳ודאן.','Sword low: −20% damage taken, −15% damage dealt. Beats chūdan.'),dmg:.85,tk:.8,hit:0,beats:'chudan'}};
const kamOf=f=>{try{return f&&f._kam&&KAM[f._kam]?f._kam:'chudan'}catch(e){return'chudan'}};
{const o=skMul;skMul=function(a,d,k){let m=o.apply(this,arguments);try{if(a&&d&&P&&E&&!(FF&&FF.war)){const A=KAM[kamOf(a)],D=KAM[kamOf(d)];m*=A.dmg*D.tk;if(A.beats===kamOf(d))m*=1.1;
  if(a.isPlayer){const B=BK();if(B.torii==='hachiman')m*=1.05;if(B.mask==='raiju')m*=1.03}}}catch(e){}return m}}
{const o=hitChance;hitChance=function(a,d,k){let h=o.apply(this,arguments);try{if(a&&d&&P&&E&&!(FF&&FF.war)&&k!=='special'){const A=KAM[kamOf(a)];h+=A.hit+(A.beats===kamOf(d)?10:0);
  if(a.isPlayer){const B=BK();h+=1.5*(B.g.kote||0)+2*(B.tsuka||0)+(B.foot==='ashinaka'?3:0)+(B.foot==='geta'?-4:0)+(B.foot==='yuki'?Math.max(0,-((WX()||{}).hit||0)):0)}
  if(d.isPlayer&&BK().mask==='moryo')h-=3;h=Math.round(clamp(h,8,99))}}catch(e){}return h}}
function kamBar(){try{let b=$('#kamBar');const pad=$('#pad');if(!pad)return;if(!b){b=document.createElement('div');b.id='kamBar';b.style.cssText='display:flex;gap:6px;align-items:center;flex-wrap:wrap;justify-content:center;margin:4px 0';pad.before(b)}
 if(!P||!E||(FF&&FF.war)||XV){b.hidden=true;return}b.hidden=false;const mk=kamOf(P),ek=kamOf(E),B=BK(),stock=Object.values(B.shu).reduce((s,v)=>s+(v|0),0),canT=!busy&&!fightOver&&stock>0&&dist()>reachOf(P)&&P.sta>=6;
 const key=mk+ek+stock+canT+busy;if(b.dataset.k===key)return;b.dataset.k=key;
 b.innerHTML=`<span class="muted" style="font-size:12px">${TX('עמידה','Guard')}</span>`+Object.keys(KAM).map(k=>`<button class="chip" data-km="${k}" aria-pressed="${k===mk}" title="${KAM[k].d}">${KAM[k].sh}</button>`).join('')+`<span class="muted" style="font-size:12px">${TX('יריב','Foe')}: <b style="color:${KAM[ek].beats===mk?'#ff8a6a':'var(--gold)'}">${KAM[ek].sh}</b></span>`+(stock?`<button class="chip" data-shu="1" ${canT?'':'disabled'}>${TX('שוריקן','Shuriken')} ×${stock}</button>`:'');
 b.querySelectorAll('[data-km]').forEach(x=>x.onclick=()=>{if(fightOver)return;P._kam=x.dataset.km;sfx('step');floatText(P.x,GROUND-300,KAM[P._kam].sh,'#ffe39a',28);b.dataset.k='';kamBar();try{refreshPad()}catch(e){}});
 const t=b.querySelector('[data-shu]');if(t)t.onclick=()=>{if(!t.disabled)playerAct('shuriken')}}catch(e){}}
{const o=refreshPad;refreshPad=function(){const r=o.apply(this,arguments);kamBar();return r}}
/* the foe changes his guard, and the clever ones answer yours */
{const o=doAction;doAction=async function(a,d,k){try{if(a&&!a.isPlayer&&P&&!(FF&&FF.war)&&Math.random()<.3){const pk=kamOf(P),cnt=Object.keys(KAM).find(x=>KAM[x].beats===pk);const iq=(a.tier?.35:a.champ?.25:.12);a._kam=Math.random()<iq?cnt:Object.keys(KAM)[Math.floor(Math.random()*3)];floatText(a.x,GROUND-300,KAM[a._kam].sh,'#ffb0a0',24)}}catch(e){}
 if(k==='shuriken'){try{await bkThrow(a,d)}catch(e){console.warn('shuriken',e)}return}return o.apply(this,arguments)}}
/* ---------- 手裏剣 shuriken ---------- */
const SHU=[{k:'bo',kj:'棒手裏剣',n:TX('בו־שוריקן, מסמר זריקה','Bō-shuriken, the throwing spike'),m:1.1,hit:70,p:120,d:TX('הכבד והחזק. נזרק ביד שטוחה, החוד קדימה.','Heaviest and strongest. Thrown from a flat hand, point first.')},
 {k:'juji',kj:'十字手裏剣',n:TX('ג׳וג׳י, צלב של ארבעה חודים','Jūji, the four-pointed cross'),m:.9,hit:80,p:110,d:TX('של אסכולות איגה וקוגה. קל לכוון.','Of the Iga and Kōga schools. Easy to aim.')},
 {k:'happo',kj:'八方手裏剣',n:TX('האפו, כוכב של שמונה חודים','Happō, the eight-pointed star'),m:.75,hit:86,p:140,d:TX('תמיד פוגע בחוד. גוזל גם אנרגיה מהיריב.','Always lands on a point. Also drains the foe’s stamina.')},
 {k:'sanpo',kj:'三方手裏剣',n:TX('סאנפו, שלושה חודים','Sanpō, three points'),m:1,hit:76,p:120,d:TX('מאוזן בין משקל לדיוק.','Balanced between weight and aim.')}];
async function bkThrow(a,d){const B=BK();let T=null;if(a.isPlayer){T=SHU.find(s=>(B.shu[s.k]|0)>0);if(!T)return;B.shu[T.k]--;a.sta=Math.max(0,a.sta-6)}else T=SHU[1];
 const ch=clamp(T.hit+((a.stats.agi||5)-(d.stats.agi||5))*1.5-(d.guard?25:0),10,95),ok=Math.random()*100<ch,dx=d.x;
 await play(a,[{p:'qWind',d:150,fn:()=>sfx('swish')},{p:'qStrike',d:90}]);
 for(let i=1;i<=4;i++){await wait(55);const x=a.x+(d.x-a.x)*i/4;floatText(x,GROUND-170,'✦','#cfd8e6',18)}
 if(ok){const dmg=Math.max(1,Math.round((6+a.stats.str*.5+(a.level||1)*.6)*T.m*(d.guard?.4:1)));d.hp=Math.max(0,d.hp-dmg);d.flash=.14;if(T.k==='happo')d.sta=Math.max(0,d.sta-8);sfx('hit');spark(d.x,GROUND-160,'hit',1);floatText(d.x,GROUND-240,`-${dmg}`,'#ffb35a',26);
  logMsg(TX(`${a.name} זורק ${T.kj}. פגיעה: ${dmg}.`,`${a.name} throws a ${T.kj}. It hits for ${dmg}.`));await play(d,[{p:'hit',d:120},{p:'idle',d:160,x:dx}])}
 else{floatText(d.x,GROUND-240,TX('החטאה','Miss'),'#cfd8e6',22);logMsg(TX(`${a.name} זורק ${T.kj}, ו${d.name} מתחמק.`,`${a.name} throws a ${T.kj}, and ${d.name} slips aside.`))}
 if(a.isPlayer)save()}
{const o=aiChoose;aiChoose=function(e,p){const base=o(e,p);try{if(e&&!e.isPlayer&&e.look&&e.look.hs==='hood'&&!XV&&!(FF&&FF.war)&&Math.abs(e.pos-p.pos)>reachOf(e)&&Math.random()<.35)return'shuriken'}catch(x){}return base}}
/* ---------- the house in the duel: armour pieces, footwear, menpō, hair, torii ---------- */
{const o=foeScale;foeScale=function(ctx){o(ctx);try{if(!S||!P||!E)return;const B=BK(),G=B.g;P._kam='chudan';E._kam=E.tier||E.champ?(['jodan','chudan','gedan'][Math.floor(Math.random()*3)]):'chudan';
  P.armorVal=(P.armorVal||0)+Math.round((G.do||0)*1.2+(G.sode||0)*.8+(G.kabuto||0)*.8);
  let hm=1+.03*(G.haidate||0)+(B.mask==='shachi'?.03:0)+(B.torii==='miwa'?.03:0);if(hm>1){P.maxHp=Math.round(P.maxHp*hm);P.hp=P.hpLag=P.maxHp}
  const st=3*(G.suneate||0)+(B.foot==='waraji'?4:B.foot==='ashinaka'?2:0);if(st){P.maxSta+=st;P.sta=P.maxSta}
  let ki=(B.torii==='shinmei'?8:0)+(B.hs==='bald'?6:0);if(ki)P.ki=Math.min(100,(P.ki||0)+ki);if(B.mask==='oni')E.ki=Math.max(0,(E.ki||0)-10);
  const cha=(B.foot==='geta'?2:0)+(B.mask==='ningyo'?1:0)+(bkHairOk()?1:0);if(cha)P.stats={...P.stats,cha:(P.stats.cha||0)+cha}}catch(e){}}}
{const o=kiGain;kiGain=function(f,amt){try{if(f&&!f.isPlayer&&P&&E&&f===E&&BK().mask==='onryo')amt*=.9;if(f&&!f.isPlayer&&f===E&&(BK().g.menpo||0))amt*=1-.06*BK().g.menpo}catch(e){}return o.call(this,f,amt)}}
{const o=prodRate;prodRate=function(){let r=o();try{if(S&&BK().torii==='inari')r=Math.round(r*1.06)}catch(e){}return r}}
{const o=generalMul;generalMul=function(){let m=o();try{if(S&&BK().torii==='sanno')m*=1.03}catch(e){}return m}}
{const o=luckScore;luckScore=function(){let v=o();try{if(S&&BK().torii==='ryobu')v+=4}catch(e){}return v}}
{const o=dayTick;dayTick=function(notes){o(notes);try{const B=BK();if(B.torii==='myojin')S.est.mor=clamp(S.est.mor+1,0,100);if(B.torii==='churen'&&S.est.wounded){const h=Math.ceil(S.est.wounded*.04);S.est.wounded-=h;S.est.soldiers+=h}}catch(e){}}}
{const o=resolveHit;resolveHit=function(a,d,k,sure){const h0=d?d.hp:0;const r=o.apply(this,arguments);try{if(a&&a.wk==='bokken'&&d&&d.hp<h0&&d.hp>0&&!d.yokai&&Math.random()<.15){d.stun=true;floatText(d.x,GROUND-280,TX('המום','Stunned'),'#cfd8e6',24)}}catch(e){}return r}}
/* appearance: hair of the age, the kabuto crest, the menpō */
const HAIR=[{k:'top',kj:'茶筅髷',n:TX('צ׳אסן, קוקו מברשת התה','Chasen, the tea-whisk topknot'),yr:[1460,1615]},{k:'chon',kj:'月代',n:TX('סאקאיאקי, קרחת הקסדה','Sakayaki, the helmet tonsure'),yr:[1550,1615]},{k:'tied',kj:'片わな',n:TX('קאטאוואנה, הקשר של מורומאצ׳י','Katawana, the Muromachi knot'),yr:[1460,1573]},
 {k:'pony',kj:'下げ髪',n:TX('סאגה־גאמי, שיער אסוף לאחור (הייאן)','Sage-gami, hair tied back (Heian)'),yr:[0,1200]},{k:'long',kj:'総髪',n:TX('סוהאצו, שיער ארוך של רונין ורופא','Sōhatsu, long hair of rōnin and physicians'),yr:[0,0]},{k:'bald',kj:'入道',n:TX('נְיוּדוֹ, גילוח כמו טאקדה שינגן ואוסוגי קנשין (+6 קי)','Nyūdō, the lay-monk tonsure of Takeda Shingen and Uesugi Kenshin (+6 ki)'),yr:[0,0]}];
function bkHairOk(){try{const h=HAIR.find(x=>x.k===BK().hs);const y=tYear();return!!(h&&y>=h.yr[0]&&y<=h.yr[1])}catch(e){return false}}
const HELM=[{k:'kuwagata',kj:'鍬形',n:TX('קוּוָגאטה, קרני העיבוד','Kuwagata, the hoe-blade horns')},{k:'crescent',kj:'三日月',n:TX('הירח הצעיר, כמו דאטה מאסאמונה','The crescent moon, like Date Masamune')},{k:'antler',kj:'鹿角',n:TX('קרני האייל, כמו הונדה טדקצו','Deer antlers, like Honda Tadakatsu')},{k:'mane',kj:'毛',n:TX('רעמת שיער יאק','A mane of yak hair')},{k:'plain',kj:'頭形',n:TX('זונארי, קסדה פשוטה','Zunari, a plain helmet')}];
const MASK=[{k:'oni',kj:'鬼',n:TX('אוני, השד','Oni, the demon'),mask:'oni',col:'#a8241c',d:TX('−10 קי ליריב בתחילת הקרב','−10 ki to the foe at the start')},{k:'moryo',kj:'魍魎',n:TX('מוריו, רוח ההרים','Mōryō, the mountain spirit'),mask:'menpo',col:'#1a1a1a',d:TX('−3 לפגיעה של היריב','−3 to the foe’s hit chance')},
 {k:'shachi',kj:'鯱',n:TX('שאצ׳יהוקו, דג הגג שמגן מאש','Shachihoko, the roof-fish that guards against fire'),mask:'oni',col:'#c8a030',d:TX('+3% חיים','+3% health')},{k:'onryo',kj:'怨霊',n:TX('אונריו, רוח הנקמה','Onryō, the vengeful ghost'),mask:'noh',col:'#e8e0d0',d:TX('היריב צובר 10% פחות קי','The foe gains 10% less ki')},
 {k:'ningyo',kj:'翁',n:TX('אוקינה, פני הזקן','Okina, the old man’s face'),mask:'noh',col:'#f0e6d0',d:TX('+1 כריזמה','+1 charisma')},{k:'raiju',kj:'雷獣',n:TX('ראיג׳ו, חיית הרעם','Raijū, the thunder beast'),mask:'oni',col:'#3a4a6a',d:TX('+3% נזק','+3% damage')}];
{const o=playerSrc;playerSrc=function(){const r=o.apply(this,arguments);try{const B=BK();if(!r||!r.look)return r;const L={...r.look};if(B.hs)L.hs=B.hs;if(B.helm&&(L.armorTier||0)>0)L.helm=B.helm;const M=MASK.find(m=>m.k===B.mask);if(M){L.mask=M.mask;L.maskCol=M.col}if(r.wk==='yumi'&&0)r.wk='tachi';return{...r,look:L}}catch(e){return r}}}
/* the bokken: Musashi carved one from an oar on the way to Ganryūjima */
try{KIND.bokken={n:TX('בוקן (חרב עץ)','Bokken (wooden sword)'),m:.8,hit:6,reach:4,len:80,fam:'blade',lv:1,price:40,d:TX('חרב עץ מעץ אלון. מוסאשי גילף אחת ממשוט בדרך לגאנריוג׳ימה ב־1612 והביס בה את קוג׳ירו. 15% להמם בכל פגיעה.','A sword of oak. Musashi carved one from an oar on the way to Ganryūjima in 1612 and beat Kojirō with it. 15% to stun on every hit.')};
 TECH.bokken={quick:TX('נקישת העץ','The knock of oak'),normal:TX('משוט הסירה','The boat oar'),power:TX('ראש מול ראש','Skull to skull'),special:['櫂',TX('המשוט של גאנריוג׳ימה','The oar of Ganryūjima')]}}catch(e){}
/* bows of the world, for the foreign wars */
try{const BW={joseon:TX('קשת הגאקגונג הקוריאנית מקרן ובמבוק: קצרה, אסימטרית ויורה רחוק.','The Korean gakgung of horn and bamboo: short, asymmetric and long-ranged.'),jurchen:TX('קשת המנצ׳ו: כבדה, עם חצים ארוכים שפורצים שריון.','The Manchu bow: heavy, with long arrows that break armour.'),banners:TX('קשת המנצ׳ו של הדגלים: כבדה, לירי מגב סוס.','The Manchu bow of the banners: heavy, shot from horseback.'),mongol:TX('הקשת המונגולית המורכבת, הכלי שכבש חצי עולם.','The Mongol composite bow, the weapon that took half the world.')};
 for(const k in BW)if(DOCS[k])DOCS[k].d=(DOCS[k].d||'')+' · '+BW[k]}catch(e){}
/* ---------- the house screen ---------- */
const GUS=[{k:'kabuto',kj:'兜',n:TX('קאבוטו, הקסדה','Kabuto, the helmet'),d:TX('+0.8 שריון לכל רמה','+0.8 armour a level')},{k:'menpo',kj:'面頬',n:TX('מנפו, מגן הפנים','Menpō, the face guard'),d:TX('היריב צובר 6% פחות קי לכל רמה','Foe gains 6% less ki a level')},{k:'do',kj:'胴',n:TX('דו, שריון החזה','Dō, the cuirass'),d:TX('+1.2 שריון לכל רמה','+1.2 armour a level')},{k:'sode',kj:'袖',n:TX('סודה, מגיני הכתפיים','Sode, the shoulder guards'),d:TX('+0.8 שריון לכל רמה','+0.8 armour a level')},
 {k:'kote',kj:'籠手',n:TX('קוטה, שרוולי השריון','Kote, the armoured sleeves'),d:TX('+1.5 לפגיעה לכל רמה','+1.5 to hit a level')},{k:'haidate',kj:'佩楯',n:TX('האידאטה, מגיני הירכיים','Haidate, the thigh guards'),d:TX('+3% חיים לכל רמה','+3% health a level')},{k:'suneate',kj:'臑当',n:TX('סונאטה, מגיני השוקיים','Suneate, the greaves'),d:TX('+3 אנרגיה לכל רמה','+3 stamina a level')}];
const FOOT=[{k:'waraji',kj:'草鞋',n:TX('וואראג׳י, סנדלי קש','Waraji, straw sandals'),d:TX('הנעל של כל צבא: +4 אנרגיה','The shoe of every army: +4 stamina'),p:20},{k:'ashinaka',kj:'足半',n:TX('אשינאקה, חצי סנדל','Ashinaka, the half-sandal'),d:TX('חצי סנדל שהעקב חשוף, של לוחמי סנגוקו: +3 לפגיעה, +2 אנרגיה','The heel-less half-sandal of Sengoku warriors: +3 to hit, +2 stamina'),p:60},
 {k:'geta',kj:'下駄',n:TX('גטה, כפכפי עץ','Geta, wooden clogs'),d:TX('מרשים בעיר: +2 כריזמה. מגושם בקרב: −4 לפגיעה','Impressive in town: +2 charisma. Clumsy in a fight: −4 to hit'),p:40},{k:'yuki',kj:'雪下駄',n:TX('יוקי־גטה, גטה לשלג','Yuki-geta, snow clogs'),d:TX('מבטל את עונש מזג האוויר על הפגיעה','Cancels the weather penalty to hit'),p:90}];
const TORII=[{k:'shinmei',kj:'神明',n:TX('שינמיי, כמו באיסה','Shinmei, as at Ise'),d:TX('אמאטראסו: +8 קי בתחילת דו־קרב','Amaterasu: +8 ki at the start of a duel')},{k:'myojin',kj:'明神',n:TX('מיוג׳ין, הנפוץ ביותר','Myōjin, the most common'),d:TX('+1 מורל כל יום','+1 morale a day')},{k:'inari',kj:'稲荷',n:TX('אינארי, השער האדום','Inari, the vermilion gate'),d:TX('אל האורז והסוחרים: +6% הכנסה','God of rice and merchants: +6% income')},
 {k:'hachiman',kj:'八幡',n:TX('האצ׳ימאן, אל המלחמה','Hachiman, god of war'),d:TX('+5% נזק בדו־קרב','+5% damage in duels')},{k:'sanno',kj:'山王',n:TX('סאנו, שומר הבירה (היאה)','Sannō, guardian of the capital (Hie)'),d:TX('+3% לצבא','+3% army')},{k:'ryobu',kj:'両部',n:TX('ריובו, כמו באיצוקושימה','Ryōbu, as at Itsukushima'),d:TX('+4 מזל','+4 luck')},
 {k:'miwa',kj:'三輪',n:TX('מיווה, השער המשולש העתיק','Miwa, the ancient triple gate'),d:TX('+3% חיים','+3% health')},{k:'churen',kj:'注連',n:TX('צ׳ורן, חבל קדוש בין שני עמודים','Chūren, a sacred rope between two posts'),d:TX('טיהור: 4% מהפצועים מחלימים כל יום','Purification: 4% of the wounded heal every day')}];
function toriiDraw(g,k,w,h,col){g.save();g.strokeStyle=col;g.fillStyle=col;g.lineCap='round';const lw=Math.max(2,w*.06);g.lineWidth=lw;const L=w*.28,R=w*.72,top=h*.2,bot=h*.95,lean=['kasuga','hachiman','inari','myojin','sanno','ryobu','miwa'].includes(k)?w*.025:0;
 const post=(x,s)=>{g.beginPath();g.moveTo(x-s*lean,bot);g.lineTo(x,top+h*.08);g.stroke()};
 if(k==='churen'){post(L,0);post(R,0);g.beginPath();g.moveTo(L,top+h*.12);g.quadraticCurveTo(w/2,top+h*.32,R,top+h*.12);g.lineWidth=lw*1.6;g.stroke();g.lineWidth=lw*.6;for(let i=1;i<5;i++){const x=L+(R-L)*i/5;g.beginPath();g.moveTo(x,top+h*.2+Math.sin(i/5*Math.PI)*h*.06);g.lineTo(x,top+h*.34);g.stroke()}g.restore();return}
 post(L,1);post(R,-1);if(k==='ryobu'){g.lineWidth=lw*.7;for(const x of[L,R])for(const s of[-1,1]){g.beginPath();g.moveTo(x+s*w*.09,bot);g.lineTo(x+s*w*.09,h*.6);g.stroke()}g.lineWidth=lw}
 const curve=!['shinmei'].includes(k);g.beginPath();g.moveTo(w*.1,top+(curve?0:h*.04));if(curve)g.quadraticCurveTo(w/2,top+h*.1,w*.9,top);else g.lineTo(w*.9,top+h*.04);g.lineWidth=lw*1.5;g.stroke();g.lineWidth=lw;
 if(k==='sanno'){g.beginPath();g.moveTo(w*.3,top);g.lineTo(w/2,top-h*.12);g.lineTo(w*.7,top);g.stroke()}
 const nuki=k==='shinmei'?[L,R]:[w*.18,w*.82];g.beginPath();g.moveTo(nuki[0],top+h*.18);g.lineTo(nuki[1],top+h*.18);g.stroke();
 if(!['shinmei'].includes(k)){g.beginPath();g.moveTo(w/2,top+h*.05);g.lineTo(w/2,top+h*.18);g.stroke()}
 if(k==='miwa'){g.lineWidth=lw*.8;for(const s of[-1,1]){const x0=s<0?0:w*.82,x1=s<0?w*.18:w;g.beginPath();g.moveTo(x0,top+h*.3);g.lineTo(x1,top+h*.3);g.moveTo(s<0?w*.04:w*.96,bot);g.lineTo(s<0?w*.04:w*.96,top+h*.3);g.stroke()}}
 if(k==='hachiman'||k==='sanno'){g.fillRect(L-w*.05,bot-h*.08,w*.1,h*.08);g.fillRect(R-w*.05,bot-h*.08,w*.1,h*.08)}
 g.restore()}
function bkRank(){const c=S.clan||{};return c.shogun?1:(c.cities||[]).length>=3?2:(S.level>=10||(c.cities||[]).length>=1)?3:4}
async function bkOpen(tab){sfx('step');const ov=xOverlay(TX('武家 · בית הלוחם','武家 · The warrior house'),()=>{try{renderHub()}catch(e){}});const B=ov.body;
 const TABS=[['mon','家紋',TX('סמל השבט','Clan crest')],['gus','具足',TX('שריון','Armour')],['look','兜',TX('קסדה, מסכה ושיער','Helm, mask, hair')],['foot','履物',TX('הנעלה','Footwear')],['torii','鳥居',TX('טוריי','Torii')],['shu','手裏剣',TX('שוריקן','Shuriken')],['kam','構え',TX('עמידות החרב','Sword guards')],['soc','身分',TX('סולם החברה','The ladder of society')]];
 B.innerHTML=`<div class="x50tabs" style="flex-wrap:wrap">${TABS.map(t=>`<button class="chip" data-t="${t[0]}"><span class="kanji">${t[1]}</span> ${t[2]}</button>`).join('')}</div><div id="bkBody" class="stack" style="gap:8px"></div>`;
 const body=B.querySelector('#bkBody');const go=t=>{B.querySelectorAll('[data-t]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.t===t)));bkTab(t,body,()=>go(t))};B.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{sfx('step');go(b.dataset.t)});go(tab||'mon')}
function bkRow(kj,title,sub,btn,cv){const d=document.createElement('div');d.className='row';d.style.cssText='align-items:center;gap:10px;flex-wrap:nowrap;border-bottom:1px dashed #3a2c22;padding:6px 0';const L=document.createElement('div');L.style.cssText='flex:0 0 56px;text-align:center';if(cv)L.append(cv);else L.innerHTML=`<span class="kanji" style="font-size:${(kj||'').length>2?15:24}px;line-height:1.1;color:var(--gold)">${kj}</span>`;const M=document.createElement('div');M.style.cssText='flex:1;min-width:0';M.innerHTML=`<b>${title}</b><div class="muted" style="font-size:12px">${sub}</div>`;d.append(L,M);if(btn){btn.style.flex='none';d.append(btn)}return d}
function bkPay(c,fn){if((S.gold||0)<c){toast(TX('אין מספיק זהב','Not enough gold'));return}S.gold-=c;fn();sfx('gong');save();try{updatePills()}catch(e){}}
function bkTab(t,el,re){const B=BK();el.innerHTML='';const P_=s=>{const p=document.createElement('p');p.className='muted';p.setAttribute('data-lt','1');p.style.cssText='font-size:13px;margin:0';p.innerHTML=s;el.append(p)};
 const cvs=(w,h,fn)=>{const c=document.createElement('canvas');c.width=w*2;c.height=h*2;c.style.cssText=`width:${w}px;height:${h}px`;const g=c.getContext('2d');g.scale(2,2);fn(g);return c};
 if(t==='mon'){P_(TX('הקאמון הוא הסמל של בית הלוחם: על הדגלים, על השריון ועל המפה. במפה רואים גם את הקאמון של השבטים הגדולים, כל אחד רק בשנים שבהן שלט.','The kamon is the emblem of a warrior house: on the banners, on the armour and on the map. The map also shows the crests of the great clans, each only in the years it ruled.'));
  for(const[id,n]of MONMINE){const on=B.mon===id;el.append(bkRow('',n,on?TX('הסמל שלך','Your crest'):B.mon?TX('החלפת סמל: 500 זהב','Change crest: 500 gold'):TX('בחירה ראשונה: חינם','First choice: free'),mkBtn(on?TX('נבחר','Chosen'):TX('בחר','Choose'),()=>{const f=()=>{B.mon=id};if(!B.mon){f();save();sfx('gong')}else bkPay(500,f);re()},on,on?'ghost':'gold'),cvs(44,44,g=>monDraw(g,id,22,22,20,'#f4efe4','#1a5a9a'))))}
  const y=tYear();const h=document.createElement('div');h.className='eyebrow';h.textContent=TX(`השבטים הגדולים בשנת ${y}`,`The great clans in ${y}`);el.append(h);const gr=document.createElement('div');gr.style.cssText='display:flex;flex-wrap:wrap;gap:8px';
  for(const c of MONCLAN){const live=y>=c.yr[0]&&y<=c.yr[1];const d=document.createElement('div');d.style.cssText=`text-align:center;width:64px;opacity:${live?1:.35}`;d.append(cvs(40,40,g=>monDraw(g,c.id,20,20,18,c.col==='#e8e0cc'?'#1a1a1a':'#f4efe4',c.col)));d.insertAdjacentHTML('beforeend',`<div style="font-size:11px">${c.n}</div>`);gr.append(d)}el.append(gr);return}
 if(t==='gus'){P_(TX('השריון של התקופה הוא טוסיי־גוסוקו: חלקים נפרדים, כל אחד משודרג אצל אומן השריון בנפרד.','The armour of the age is the tōsei-gusoku: separate pieces, each upgraded by the armourer on its own.'));
  for(const p of GUS){const l=B.g[p.k]|0,c=bkCost(300,l);el.append(bkRow(p.kj,`${p.n} · ${TX('רמה','level')} ${l}/5`,p.d,mkBtn(l>=5?TX('מלא','Max'):`${fmtN(c)} ${TX('זהב','gold')}`,()=>{bkPay(c,()=>{B.g[p.k]=l+1});re()},l>=5||S.gold<c,'gold')))}
  const l=B.tsuka|0,c=bkCost(500,l);el.append(bkRow('柄巻',`${TX('צוקה־מאקי, ליפוף הניצב','Tsuka-maki, the hilt wrap')} · ${l}/3`,TX('חוט משי מלופף בצלבים על עור דג הרייה: +2 לפגיעה לכל רמה','Silk cord wrapped in crosses over ray skin: +2 to hit a level'),mkBtn(l>=3?TX('מלא','Max'):`${fmtN(c)} ${TX('זהב','gold')}`,()=>{bkPay(c,()=>{B.tsuka=l+1});re()},l>=3||S.gold<c,'gold')));return}
 if(t==='look'){P_(TX('הקישוט על הקסדה נראה רק כשלובשים שריון. התספורת נותנת +1 כריזמה כשהיא מתאימה לשנה.','The helmet crest shows only when you wear armour. A haircut of the right years gives +1 charisma.'));
  const hh=document.createElement('div');hh.className='eyebrow';hh.textContent=TX('髷 תספורת · 20 זהב','髷 Hair · 20 gold');el.append(hh);
  for(const h of HAIR){const on=B.hs===h.k,y=tYear(),ok=y>=h.yr[0]&&y<=h.yr[1];el.append(bkRow(h.kj,h.n,ok?TX('מתאים לשנה: +1 כריזמה','Fits the year: +1 charisma'):TX('לא מהשנים האלה','Not of these years'),mkBtn(on?TX('נבחר','Chosen'):TX('לספר','Cut'),()=>{bkPay(20,()=>{B.hs=h.k});re()},on,on?'ghost':'')))}
  const hm=document.createElement('div');hm.className='eyebrow';hm.textContent=TX('前立 קישוט הקסדה · 300 זהב','前立 Helmet crest · 300 gold');el.append(hm);
  for(const h of HELM){const on=B.helm===h.k;el.append(bkRow(h.kj,h.n,'',mkBtn(on?TX('נבחר','Chosen'):TX('בחר','Choose'),()=>{bkPay(300,()=>{B.helm=h.k});re()},on,on?'ghost':'')))}
  const mm=document.createElement('div');mm.className='eyebrow';mm.textContent=TX('面頬 מסכת הקרב · 800 זהב','面頬 War mask · 800 gold');el.append(mm);
  for(const m of MASK){const on=B.mask===m.k;el.append(bkRow(m.kj,m.n,m.d,mkBtn(on?TX('נבחר','Chosen'):TX('בחר','Choose'),()=>{bkPay(800,()=>{B.mask=m.k});re()},on,on?'ghost':'')))}return}
 if(t==='foot'){P_(TX('בקרב נעלו וואראג׳י או אשינאקה. גטה היו לעיר.','In battle men wore waraji or ashinaka. Geta were for town.'));
  for(const f of FOOT){const on=B.foot===f.k;el.append(bkRow(f.kj,f.n,f.d,mkBtn(on?TX('נעול','Worn'):`${f.p} ${TX('זהב','gold')}`,()=>{bkPay(f.p,()=>{B.foot=f.k});re()},on,on?'ghost':'')))}return}
 if(t==='torii'){const sh=(()=>{try{return bl('shrine')}catch(e){return 0}})(),c=Math.round(1500*(1+(S.level||1)/50));P_(sh?TX(`בחר את סגנון הטוריי שעומד בשער המקדש שלך. כל סגנון שייך לאל אחר. בנייה: ${fmtN(c)} זהב.`,`Choose the torii that stands at your shrine’s gate. Each style belongs to a different kami. Building: ${fmtN(c)} gold.`):TX('קודם צריך לבנות מקדש באחוזה.','First build a shrine on your estate.'));
  for(const s of TORII){const on=B.torii===s.k;el.append(bkRow('',`<span class="kanji">${s.kj}</span> ${s.n}`,s.d,mkBtn(on?TX('עומד','Standing'):TX('בנה','Build'),()=>{bkPay(c,()=>{B.torii=s.k});re()},on||!sh||S.gold<c,on?'ghost':'gold'),cvs(52,44,g=>toriiDraw(g,s.k,52,44,s.k==='inari'||s.k==='ryobu'||s.k==='hachiman'?'#d8402a':'#c9b894'))))}return}
 if(t==='shu'){P_(TX('נזרק מרחוק, לפני שהחרבות נפגשות. בכפתור 手裏剣 בקרב, כשהיריב מחוץ לטווח. שקיק של 5.','Thrown from afar, before the swords meet. Use the 手裏剣 button in a fight when the foe is out of reach. A pouch of 5.'));
  for(const s of SHU){const n=B.shu[s.k]|0,c=s.p*5;el.append(bkRow(s.kj,`${s.n} · ${TX('יש לך','you have')} ${n}`,`${s.d} · ${TX('פגיעה','hit')} ${s.hit}%`,mkBtn(`5 · ${c} ${TX('זהב','gold')}`,()=>{bkPay(c,()=>{B.shu[s.k]=n+5});re()},S.gold<c,'gold')))}return}
 if(t==='kam'){P_(TX('שלוש עמידות של החרב, ולכל אחת יש עמידה שמנצחת אותה. בקרב בוחרים עמידה בשורת 構え מעל הכפתורים, ורואים את העמידה של היריב. יריבים חכמים יחליפו עמידה כדי לנצח את שלך.','Three guards of the sword, and each one is beaten by another. In a fight pick a guard in the 構え row above the buttons, and watch the foe’s. Clever foes switch to beat yours.'));
  el.append(cvs(300,150,g=>{g.fillStyle='#e6b450';g.strokeStyle='#c9b894';g.lineWidth=2;g.font="16px 'Yuji Syuku',serif";g.textAlign='center';const pts=[[150,26,'上段'],[60,126,'下段'],[240,126,'中段']];for(const[x,y,k]of pts){g.beginPath();g.arc(x,y,20,0,7);g.stroke();g.fillText(k,x,y+6)}
   const ar=(a,b)=>{const[x1,y1]=a,[x2,y2]=b,dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy),ux=dx/L,uy=dy/L,sx=x1+ux*24,sy=y1+uy*24,ex=x2-ux*24,ey=y2-uy*24;g.beginPath();g.moveTo(sx,sy);g.lineTo(ex,ey);g.stroke();g.beginPath();g.moveTo(ex,ey);g.lineTo(ex-ux*9-uy*5,ey-uy*9+ux*5);g.lineTo(ex-ux*9+uy*5,ey-uy*9-ux*5);g.closePath();g.fill()};ar(pts[0],pts[1]);ar(pts[1],pts[2]);ar(pts[2],pts[0])}));
  for(const k of Object.keys(KAM))el.append(bkRow(KAM[k].kj,KAM[k].n,KAM[k].d,null));return}
 if(t==='soc'){P_(TX('ב־1591 הפריד הידיושי בצו בין לוחמים לאיכרים. מאז כל אחד יודע את מקומו בסולם, חוץ ממי שמטפס עליו בחרב.','In 1591 Hideyoshi’s edict separated warriors from peasants. From then on everyone knew his place on the ladder, except those who climbed it with a sword.'));
  const me=bkRank();const L=[['天皇',TX('הקיסר','The emperor'),TX('בן האלה אמאטראסו. מלך בלי צבא, ובכל זאת כל שוגון צריך את המינוי שלו.','Descendant of Amaterasu. A king without an army, yet every shogun needs his appointment.'),'#c8b040'],
   ['将軍',TX('השוגון','The shōgun'),TX('המפקד העליון ששולט בשם הקיסר. דורש: לכבוש את קיוטו.','The supreme commander who rules in the emperor’s name. Requires: taking Kyoto.'),'#5a4a9a'],
   ['大名',TX('הדאימיו','The daimyō'),TX('אדון של מחוזות וצבאות. דורש: 3 מחוזות.','A lord of provinces and armies. Requires: 3 provinces.'),'#8a1c1c'],
   ['武士',TX('הסמוראי','The samurai'),TX('לוחם בשירות אדון, עם שתי חרבות. דורש: דרגה 10 או מחוז.','A warrior in a lord’s service, wearing two swords. Requires: level 10 or a province.'),'#2a4a8a'],
   ['足軽',TX('האשיגארו','The ashigaru'),TX('חייל רגלי עם חנית או רובה. מכאן מתחילים.','A foot soldier with spear or gun. This is where you start.'),'#5a4632'],
   ['百姓',TX('האיכרים','The peasants'),TX('רוב העם. מגדלים את האורז שמאכיל את כולם.','Most of the people. They grow the rice that feeds everyone.'),'#7a7a6a']];
  L.forEach((r,i)=>{const d=bkRow(r[0],`${r[1]}${i===me?` <span class="tag done">${TX('אתה כאן','You are here')}</span>`:''}`,r[2],null);d.style.background=i===me?'rgba(230,180,80,.12)':'';d.querySelector('.kanji').style.color=r[3];el.append(d)});return}}
/* the house door, in the hub */
{const o=renderHub;renderHub=function(){const r=o.apply(this,arguments);try{const nav=document.querySelector('#scr-hub .navgrid');if(nav&&!$('#toBuke')){const b=document.createElement('button');b.className='btn realm';b.id='toBuke';b.type='button';b.innerHTML=`<span class="kanji">武家</span> ${TX('בית הלוחם','The warrior house')}`;b.onclick=()=>bkOpen();nav.prepend(b)}}catch(e){}return r}}
if(false)window.__bk={bkOpen:t=>bkOpen(t),BK:()=>BK(),KAM,SHU,kamBar};
/* ---------- proportions: the arena comes first, the controls make room for it ---------- */
try{document.head.insertAdjacentHTML('beforeend',`<style id="bkProp">
#scr-fight .arena-wrap{min-height:min(44dvh,calc(100vw / 1.02))}
#scr-fight #log{min-height:34px;padding:4px 12px;margin:4px 10px 0;font-size:14px;line-height:1.35}
#kamBar{margin:3px 8px!important;gap:5px!important}#kamBar .chip{min-height:30px;padding:3px 12px;font-size:14px}
#scr-fight .act{min-height:clamp(46px,6.6dvh,84px)}
@media (max-height:760px){#scr-fight .act{min-height:44px;padding:2px}#scr-fight .act small{font-size:10.5px}#scr-fight #log{font-size:13px}}
</style>`)}catch(e){}
