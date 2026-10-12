/* ================= 絵 the art we already have, on every face it fits =================
   Characters that were still drawn by code but already have a fitting illustration: the saga's heroes and yokai who have
   their own art, the castle guards of the provinces, the market toughs and the bounty hunters (ronin), Ōtakemaru (an oni).
   The same picture shows in the arena, in the HUD portrait and in the close-ups. */
const AMAP_SG={tadakatsu:'tadakatsu',tamamo:'tamamo',kojiro:'kojiro',musashi:'musashi',yukimura:'yukimura',shingen:'shingen',kenshin:'kenshin',nobunaga:'nobunaga'};
const AMAP_HUNT={otakemaru:'oni_red'};
AMAP_SG.shadow='kitsune';
/* the great oni stand a head above a man, as the drawn ones did; set only where the art has no scale of its own */
for(const[id,s]of[['oni_red',1.1],['oni_blue',1.1],['shuten',1.14],['ushioni',1.08]])try{if(ART[id]&&!ART[id]._sc)ART[id]._sc=s}catch(e){}
const AMAP_NAME={};
function amapId(src){try{if(!src)return null;
  if(src.sgid&&AMAP_SG[src.sgid])return AMAP_SG[src.sgid];
  if(src.id&&AMAP_HUNT[src.id])return AMAP_HUNT[src.id];
  const nm=String(src.name||'');
  if(/^(שומר |Guard of |Warden of )/.test(nm))return'guard';

 }catch(e){}return null}

{const o=artPorId;artPorId=function(look,key){const r=o.apply(this,arguments);if(r)return r;try{if(S&&S.artOff||INKM)return null;const k=String(key==null?'':key);let m=/^x50h(\d+)$/.exec(k);if(m&&HEROES[+m[1]]){const id=HEROES[+m[1]].id;if(ART[id]&&ART[id].por)return id}
 m=/^x50f(\d+)$/.exec(k);if(m&&typeof LADDER_ART!=='undefined'){const id=LADDER_ART[+m[1]];if(id&&ART[id]&&ART[id].por)return id}
 const id=AMAP_NAME[k];if(id&&ART[id]&&ART[id].por)return id}catch(e){}return null}}
/* the Ushi-oni of the sea routes rises in its own picture, facing the ship, its legs under the waves */
const AM_SEA={ushioni:'ushioni',umibozu:'v_umibozu',bakekujira:'v_bakekujira'};
function amSeaArt(id){const a=AM_SEA[id];if(!a)return null;if(a.startsWith('v_'))amVariant(a,AMV[a.slice(2)]);return a}
{const o=seaMon;seaMon=function(g,m,x,y,t,pose,hurt,sc){try{const aid=m&&!(S&&S.artOff)&&!INKM&&amSeaArt(m.id);if(aid){const a=artReady(aid,'idle');if(a){sc=sc||1;
 const up=pose==='rise'?-26:pose==='deep'?70:0,b=Math.sin(t*1.6)*4,H=215,W=H*a.img.naturalWidth/a.img.naturalHeight;
 g.save();g.translate(x,y+up*sc+b);g.scale(-sc,sc);if(hurt>0){g.translate(Math.sin(t*70)*4,0);g.globalAlpha=.85}
 g.drawImage(a.img,-W*a.ax,-H+62,W,H);g.restore();return}}}catch(e){}return o.apply(this,arguments)}}
/* the court and the market: a person who already has an illustrated face shows it in their portrait, over their own
   scene (shoji, sea, castle). The same people the player meets in the arena keep the same face here. Tamamo stays drawn:
   as 'the lady in white' her fox ears would give her away. */
const AMAP_CAST={nobunaga:'nobunaga',yukimura:'yukimura',gonbei:'guard',kumagoro:'ronin2',ryuzan:'ronin',mitsuhide:'v_mitsuhide',kansuke:'v_kansuke',goemon:'v_goemon'};
{const o=drawCast;drawCast=function(g,id,t,talk){try{const aid=AMAP_CAST[id],C=CAST[id];if(aid&&aid.startsWith('v_')&&typeof amVariant==='function')amVariant(aid,AMV[aid.slice(2)]);if(aid&&C&&!(S&&S.artOff)&&!INKM){const a=artReady(aid,'por');if(a){const cv=g.canvas;
 if(cv&&cv.width===64&&cv.height===72){cv.width=192;cv.height=216;g.setTransform(3,0,0,3,0,0)}
 const ph=(id.charCodeAt(0)*7+id.length*13)%10,br=Math.sin(t*2.1+ph)*.6;g.save();castBg(g,C.L.bg,t+ph);
 const iw=a.img.naturalWidth,ih=a.img.naturalHeight,W=66,H=W*ih/iw;g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
 g.drawImage(a.img,32-W/2,72-H+1+br*.5+(talk?Math.sin(t*14)*.4:0),W,H);g.restore();return}}}catch(e){}return o.apply(this,arguments)}}
/* the smithy and the stables: every blade grade, armour and horse in the shop gets its picture, in a small lacquer frame
   whose edge shows the grade (iron, village steel, tamahagane, Muramasa's red, Masamune's gold, the blue of Kusanagi) */
const AM_FR=['#6b5a48','#8f8a80','#c0c4cc','#b0402a','#e6b450','#7fd3ff','#b48aff','#ffe38a'];
let AM_RR=0;
function amThumb(key,col,flt,w,h){const im=itm(key);if(!im){try{const e=ITM[key];if(e&&!e._amw){e._amw=1;e.img.addEventListener('load',()=>{clearTimeout(AM_RR);AM_RR=setTimeout(()=>{try{if(!$('#scr-shop').hidden)renderShop()}catch(x){}},60)})}}catch(x){}return null}
 w=w||64;h=h||64;const c=document.createElement('canvas');c.width=w*2;c.height=h*2;c.className='amth';c.style.cssText=`width:${w}px;height:${h}px;border-color:${col||'#a8792a'}`;
 const g=c.getContext('2d');g.scale(2,2);const bg=g.createRadialGradient(w/2,h*.45,4,w/2,h/2,w*.7);bg.addColorStop(0,'#2e221b');bg.addColorStop(1,'#0d0a09');g.fillStyle=bg;g.fillRect(0,0,w,h);
 if(flt)g.filter=flt;itmFit(g,im,w/2,h/2,w-8,h-8);g.filter='none';return c}
/* which item a card is: by its name, so it holds however the shop lists, filters or reorders them */
function amWhich(d,list){const nm=(d.querySelector('.nm')||{}).textContent||'';let bi=-1,bl=0;list.forEach((x,i)=>{const n=String(x.n||'');if(n&&nm.includes(n)&&n.length>bl){bi=i;bl=n.length}});return bi}
const AM_HK=['h_dosanko','h_kiso','h_kiso','h_war','h_war','h_white'],AM_HF=['','','brightness(.7) saturate(.9)','','saturate(.5) brightness(.78)',''];
const AM_AK=[null,'a_light','a_tosei','a_oyoroi','a_tosei','a_oyoroi','a_black'],AM_AF=['','','','','brightness(.75) sepia(.35)','sepia(.6) saturate(1.6) brightness(1.1)','hue-rotate(150deg) saturate(1.2)'];
{const o=renderShop;renderShop=function(){const r=o.apply(this,arguments);try{if(S&&!S.artOff&&!INKM){const el=$('#shopItems'),cards=[...el.querySelectorAll('.card.item')].filter(d=>!d.querySelector('.amth'));
 if(shopTab==='w'){const k=ITM_W[myWk()];if(k)cards.forEach(d=>{const i=amWhich(d,FORGE);if(i<0)return;const it=FORGE[i],th=amThumb(k,AM_FR[Math.min(AM_FR.length-1,i)],it.glow?`drop-shadow(0 0 4px ${it.glow})`:i>=3?'saturate(1.15) contrast(1.05)':i===0?'saturate(.6) brightness(.8)':'',96,56);if(th){if(i===S.forge)th.classList.add('on');d.prepend(th)}})}
 else if(shopTab==='h'){cards.forEach(d=>{const i=amWhich(d,HORSES);if(i<0){/* a foal of your own stable: the small northern pony, a little brighter */const cv=d.querySelector(':scope > canvas');if(cv&&/סייח|foal/i.test(d.textContent)){const th=amThumb('h_dosanko','#a8792a','brightness(1.12) saturate(.85)',120,72);if(th){th.classList.add('amwide');cv.replaceWith(th)}}return}const cv=d.querySelector(':scope > canvas');const th=amThumb(AM_HK[i]||'h_war',AM_FR[Math.min(7,i+1)],AM_HF[i]||'',120,72);if(!th)return;th.classList.add('amwide');if(S.horse===i)th.classList.add('on');if(cv)cv.replaceWith(th);else{const tp=d.querySelector('.top');tp?tp.after(th):d.prepend(th)}})}
 else if(shopTab==='a'){cards.forEach(d=>{const i=amWhich(d,ARMORS);const k=i>=0&&AM_AK[i];if(!k)return;const th=amThumb(k,AM_FR[Math.min(7,i)],AM_AF[i]||'');if(th){if(i===S.armor)th.classList.add('on');d.prepend(th)}})}}}catch(e){console.warn('amShop',e)}return r}}
document.head.insertAdjacentHTML('beforeend',`<style>.amth{float:inline-start;margin-inline-end:10px;margin-bottom:4px;border:2px solid;border-radius:8px;box-shadow:0 0 0 1px #000,inset 0 0 0 1px rgba(255,255,255,.06)}.amth.on{box-shadow:0 0 0 1px #000,0 0 10px rgba(230,180,80,.55)}.amht{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:inherit}.amwanted{image-rendering:auto}.amth.amwide{float:none;display:block;margin:6px 0}.card.item:has(> .amth:not(.amwide)){min-height:76px}.card.item > .amth + .top{margin-top:2px}</style>`);
/* faces that small screens draw once (the daily challenge, the duel picker, the board): load just the portraits early,
   in the background, so the first look already shows the illustration */
setTimeout(()=>{try{const ids=new Set([...(typeof LADDER_ART!=='undefined'?LADDER_ART:[]),...HEROES.map(h=>h.id),...Object.values(AMAP_CAST).filter(x=>!x.startsWith('v_'))]);let n=0;
 try{artLoad('ushioni');HEROES.forEach(h=>{const a=ART[h.id]&&ART[h.id].idle;if(a&&a.d&&!a.img){const im=new Image();im.src=a.d.src;a.img=im}})}catch(e){}
 for(const id of ids){const a=ART[id]&&ART[id].por;if(a&&a.d&&!a.img){const im=new Image();im.decoding='async';setTimeout(()=>{im.src=a.d.src},n++*120);a.img=im}}}catch(e){}},2500);
/* screens that draw a picture once: if the illustration was still loading, draw them again when it arrives */
let AM_STALE={};
{const o=seaMon;seaMon=function(g,m){try{const aid=m&&!(S&&S.artOff)&&!INKM&&amSeaArt(m.id);if(aid&&!artReady(aid,'idle'))AM_STALE.sea=aid}catch(e){}return o.apply(this,arguments)}}
setInterval(()=>{try{if(AM_STALE.sea&&artReady(AM_STALE.sea,'idle')&&!$('#scr-sea').hidden&&!(typeof SB!=='undefined'&&SB)){AM_STALE.sea=0;renderSea()}
 if(AM_STALE.bh&&!$('#scr-hub').hidden){const id=HEROES[S.hero]&&HEROES[S.hero].id;if(id&&artReady(id,'por')){AM_STALE.bh=0;amPoster()}}amHeroTile()}catch(e){}},1000);
/* the wanted poster: your own illustrated face, inked onto the paper */
function amPoster(){try{const fr=document.querySelector('#bhSlot .bhfr');if(!fr||!S)return;const id=HEROES[S.hero]&&HEROES[S.hero].id;if(!id||!ART[id]||!ART[id].por||S.artOff||INKM)return;
 const a=artReady(id,'por');if(!a){AM_STALE.bh=1;return}const N=192,c=document.createElement('canvas');c.width=c.height=N;c.className='bhpic amwanted';const g=c.getContext('2d');
 g.fillStyle='#e9dcc0';g.fillRect(0,0,N,N);const im=a.img,iw=im.naturalWidth,ih=im.naturalHeight,side=Math.min(iw,ih)*.8;g.filter='sepia(.7) contrast(1.15) saturate(.8)';g.drawImage(im,(iw-side)/2,ih*.04,side,side,0,0,N,N);g.filter='none';
 g.globalCompositeOperation='multiply';const gr=g.createRadialGradient(N/2,N/2,N*.3,N/2,N/2,N*.75);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(1,'rgba(120,80,30,.55)');g.fillStyle=gr;g.fillRect(0,0,N,N);g.globalCompositeOperation='source-over';
 const old=fr.querySelector('canvas');if(old){c.style.cssText=old.style.cssText;old.replaceWith(c)}else fr.append(c)}catch(e){}}
if(typeof bhPoster==='function'){const o=bhPoster;bhPoster=function(){const d=o.apply(this,arguments);try{setTimeout(amPoster,0)}catch(e){}return d}}
/* the warrior tile in the camp: your warrior, illustrated, in the dojo light */
let AM_HT='';
function amHeroTile(){try{const b=$('#toHero');if(!b||!S||$('#scr-hub').hidden)return;const id=HEROES[S.hero]&&HEROES[S.hero].id;if(!id||!ART[id]||S.artOff||INKM)return;const a=artReady(id,'idle');if(!a)return;
 const key=id+'|'+(b.offsetWidth|0);if(AM_HT===key&&b.querySelector('canvas.amht'))return;AM_HT=key;
 if(!b.classList.contains('tile')){const lbl=document.createElement('span');lbl.className='lbl';lbl.textContent=b.textContent.trim();b.textContent='';b.className='btn tile';b.append(lbl)}
 let c=b.querySelector('canvas.amht');if(!c){c=document.createElement('canvas');c.className='amht';b.prepend(c)}const W=400,H=200;c.width=W;c.height=H;const g=c.getContext('2d');
 const bg=g.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#3a2418');bg.addColorStop(1,'#120c0a');g.fillStyle=bg;g.fillRect(0,0,W,H);
 g.fillStyle='rgba(230,180,80,.10)';for(let i=0;i<7;i++)g.fillRect(20+i*56,0,26,H);const gl=g.createRadialGradient(W/2,H*.7,10,W/2,H*.7,W*.5);gl.addColorStop(0,'rgba(255,200,120,.35)');gl.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gl;g.fillRect(0,0,W,H);
 g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(W/2,H-14,90,9,0,0,7);g.fill();
 const im=a.img,h=H-18,w=h*im.naturalWidth/im.naturalHeight;g.imageSmoothingEnabled=true;g.drawImage(im,W/2-w*a.ax,H-14-h,w,h)}catch(e){}}
{const o=renderHub;renderHub=function(){const r=o.apply(this,arguments);try{AM_HT='';amHeroTile()}catch(e){}return r}}
/* ================= 絵師 the variant studio: an original illustrated figure for every face still drawn by code ==========
   Built in the browser from our own illustrations, never copied from outside: a body that fits the person (the one-eyed
   strategist on the one-eyed body, the Uesugi general on the Uesugi frame, monks on the monk), recoloured selectively —
   armour and cloth take the house colour, skin and gold lacing are kept, dark lacquer is tinted, a beast's fur darkened.
   Each recoloured pose is made once, cached as an image, and drawn by the same art code as every other illustration. */
/* b: base art · c: colour · s/v: saturation/value · d: tint of the dark lacquer · w: value of pale fur/cloth · m: monster (no skin to keep) */
const AMV={
 kiyomasa:{b:'guard',c:'#1d1d24',d:.15,g:1},naomasa:{b:'tadakatsu',c:'#c0261c',d:.55},naotaka:{b:'yukimura',c:'#e04a1a'},
 yamagata:{b:'guard',c:'#c8301e',d:.6},baba:{b:'shingen',c:'#2f6a3a'},kansuke:{b:'masamune',c:'#6a4a2a',d:.3},
 kakizaki:{b:'kenshin',c:'#2a3f7a',d:.35},shibata:{b:'nobunaga',c:'#4a5a2a'},mitsuhide:{b:'nobunaga',c:'#2a5ab0'},
 hidemitsu:{b:'guard',c:'#5a8ad0',d:.5},otani:{b:'benkei',c:'#8a8a8a',s:.4,w:1.05},ukon:{b:'kojiro',c:'#1f3a6a'},
 yoshimoto:{b:'yoshitsune',c:'#7a3a9a'},ranmaru:{b:'yoshitsune',c:'#d0407a'},shinsuke:{b:'ronin2',c:'#3a6a6a',d:.35},
 kajiwara:{b:'guard',c:'#3a7a3a',d:.5},akaho:{b:'yukimura',c:'#ff5a1a',v:1.08},raider:{b:'ronin2',c:'#6a3a1a',d:.4,w:.8},
 gonta:{b:'ronin',c:'#5a4a3a',s:.6},junkai:{b:'benkei',c:'#d08a1a'},gokei:{b:'benkei',c:'#5a2a6a',w:.75},
 noshadow:{b:'kenshin',c:'#6a6a7a',s:.3,w:1.1},goemon:{b:'ronin2',c:'#6a2a8a',d:.45},
 foxman:{b:'kitsune',c:'#5a4a8a',w:.62,m:1},kasha:{b:'kitsune',c:'#ff6a10',w:.32,v:1.1,m:1},
 raiju:{b:'kamaitachi',c:'#3aa0ff',w:1,v:1.1,m:1},umibozu:{b:'oni_blue',c:'#1a2030',s:.25,v:.32,w:.3,m:1,all:1},
 bunei:{b:'guard',c:'#3a5a8a',d:.45},imjin:{b:'nobunaga',c:'#b8862a',g:0},sacheon:{b:'shingen',c:'#2a7a7a'},koan:{b:'ronin',c:'#202020',s:.5},bakekujira:{b:'gasha',c:'#8fe0ff',m:1,all:1,s:.7,v:1.12},
 ryukyu:{b:'kojiro',c:'#d0a020'},joseon:{b:'guard',c:'#2a4a9a',d:.5},manila:{b:'ronin',c:'#6a6a7a',s:.5},ayutthaya:{b:'yoshitsune',c:'#d08a1a'},ming:{b:'nobunaga',c:'#9a1c1c'}};
/* the lords of the provinces: the body by their helmet, the armour in their house colour */
const AMV_HELM={plain:'guard',kuwagata:'yukimura',crescent:'masamune',mane:'shingen',antler:'tadakatsu'};
const amHex=h=>{h=String(h||'#888').replace('#','');if(h.length===3)h=h.split('').map(x=>x+x).join('');const n=parseInt(h,16);return[(n>>16)&255,(n>>8)&255,n&255]};
function amHsv(r,g,b){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;let h=0;if(d){if(mx===r)h=((g-b)/d)%6;else if(mx===g)h=(b-r)/d+2;else h=(r-g)/d+4;h*=60;if(h<0)h+=360}return[h,mx?d/mx:0,mx]}
function amRgb(h,s,v){const c=v*s,x=c*(1-Math.abs((h/60)%2-1)),m=v-c;let r=0,g=0,b=0;if(h<60)[r,g,b]=[c,x,0];else if(h<120)[r,g,b]=[x,c,0];else if(h<180)[r,g,b]=[0,c,x];else if(h<240)[r,g,b]=[0,x,c];else if(h<300)[r,g,b]=[x,0,c];else[r,g,b]=[c,0,x];return[(r+m)*255,(g+m)*255,(b+m)*255]}
function amRecolor(img,sp){const W=img.naturalWidth,H=img.naturalHeight,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');g.drawImage(img,0,0);
 const D=g.getImageData(0,0,W,H),d=D.data,[tr,tg,tb]=amHex(sp.c),[th,ts,tv]=amHsv(tr,tg,tb),S0=sp.s==null?1:sp.s,V0=sp.v==null?1:sp.v,dk=sp.d||0,wv=sp.w==null?1:sp.w,keepGold=sp.g!==0;
 for(let i=0;i<d.length;i+=4){if(d[i+3]<8)continue;const[h,s,v]=amHsv(d[i],d[i+1],d[i+2]);let o;
  if(!sp.m&&h>=6&&h<=44&&s>.12&&s<.66&&v>.36)continue;/* skin */
  if(keepGold&&h>=38&&h<=62&&s>.38&&v>.45&&!sp.all)continue;/* gold lacing */
  if(s>.24&&v>.1){o=amRgb(th,Math.min(1,(s*.45+ts*.55)*S0),Math.min(1,v*V0*(.55+.45*Math.max(tv,.35)/.75)))}
  else if(v>.62&&wv!==1){o=amRgb(th,Math.min(1,ts*.25*S0),Math.min(1,v*wv))}
  else if(dk){o=[d[i]*(1-dk)+tr*v*dk*1.6,d[i+1]*(1-dk)+tg*v*dk*1.6,d[i+2]*(1-dk)+tb*v*dk*1.6]}
  else if(sp.all){o=amRgb(th,s*S0,v*V0)}else continue;
  d[i]=Math.min(255,o[0]);d[i+1]=Math.min(255,o[1]);d[i+2]=Math.min(255,o[2])}
 g.putImageData(D,0,0);return c}
let AMV_FAIL=false;
function amVariant(vid,sp){try{if(ART[vid])return!!ART[vid].idle;if(AMV_FAIL)return false;const B=ART[sp.b];if(!B||!B.idle)return false;const A=ART[vid]={_loaded:1,_v:sp.b};if(B._sc)A._sc=B._sc;
 for(const k in B){const e=B[k];if(!e||typeof e!=='object'||!e.d||k[0]==='_')continue;A[k]={...e,img:null}}
 artLoad(sp.b);let tries=0;const go=()=>{let wait=0;for(const k in A){const e=A[k];if(!e||typeof e!=='object'||k[0]==='_'||e.img)continue;const be=B[k];
   if(!be||!be.img||!be.img.complete||!be.img.naturalWidth){wait=1;continue}
   try{const cv=amRecolor(be.img,sp);cv.toBlob(bl=>{if(!bl)return;const im=new Image();im.onload=()=>{e.img=im;AM_VREADY++};im.src=URL.createObjectURL(bl)},'image/webp',.92)}catch(x){AMV_FAIL=true;delete ART[vid];return}}
  if(wait&&++tries<120)setTimeout(go,250)};go();return true}catch(e){return false}}

/* every other foe in every mode (all the provinces, the board, the leagues, rivals, bandits, the wider sea, Kunitori…):
   a body chosen by how the game describes them, in their own colours */
const AM_PAL=['#5a5a5a','#6a2a2a','#2a3a6a','#3a5a2a','#5a3a6a','#6a4a1a','#2a5a5a','#4a2a1a'];
function amRoninVid(src){const nm=String(src.name||''),h=Math.abs(hashStr(nm)),b=h%2?'ronin2':'ronin',c=AM_PAL[(h>>3)%AM_PAL.length],k='n_'+b+'_'+c.slice(1);if(!AMV[k])AMV[k]={b,c,d:.35,s:.8};return'v_'+k}
function amAutoVid(src,f){try{const L=src&&src.look;if(!L||f.giant)return null;let b=null;const yk=f.yokai||src.yokai;
 if(L.heads)b='orochi';else if(L.spider)b=L.female?'jorogumo':'tsuchigumo';else if(L.tiger)b='nue';else if(L.ears&&L.tails)b='kitsune';else if(L.wings||L.beak)b='tengu';else if(L.shell)b='kappa';
 else if(L.horns||L.fangs)b=(L.build||1)>1.15?'shuten':'oni_red';else if(L.female)b=yk||L.glow?'yukionna':L.armorCol?'tomoe':'jorogumo';
 else if(L.helm==='ming'||L.helm==='mongol')b=L.helm==='ming'?'nobunaga':'guard';else if(L.helm&&AMV_HELM[L.helm])b=AMV_HELM[L.helm];else if(L.helm==='nagaeboshi')b='guard';
 else if(L.helm==='tokin'||L.hat==='tokin'||L.hat==='tengai'||L.hat==='zukin')b='benkei';else if(L.hs==='hood'||L.hat==='ninja'||L.hood)b='kenshin';
 else if(L.hat==='kasa'||L.hat==='jingasa')b=L.armorCol?'guard':'ronin2';else if(L.hat==='eboshi'||L.hat==='tall'||L.hat==='kato')b='kojiro';else if(L.armorCol)b='guard';else b=(L.beard?'ronin':'ronin2');
 if(!ART[b]||!ART[b].idle)return null;const col=String(L.armorCol||L.gi||'#5a5a5a');const yb=['orochi','tsuchigumo','jorogumo','nue','kitsune','tengu','kappa','oni_red','shuten','yukionna'].includes(b);
 const vid='v_a_'+b+'_'+col.replace(/[^0-9a-f]/gi,'').slice(0,6);if(!AMV[vid.slice(2)])AMV[vid.slice(2)]={b,c:col,d:yb?0:.4,m:yb?1:0,s:yb?.8:1};return vid}catch(e){return null}}
let AM_VREADY=0;
function amVidOf(src){try{if(!src)return null;if(src.sgid&&AMV[src.sgid])return'v_'+src.sgid;if(src.id&&AMV[src.id]&&!src.sgid)return'v_'+src.id;
 if(src.id&&typeof CITIES!=='undefined'&&src.look&&src.look.armorCol){const c=CITIES.find(x=>x.id===src.id);if(c){const nm=String(src.name||'');if(/^(שומר |Guard of |Warden of )/.test(nm))return null;
   const b=AMV_HELM[src.look.helm]||'guard',col=src.look.armorCol,vid='v_'+b+'_'+String(col).replace('#','');if(!AMV[vid])AMV[vid]={b,c:col,d:.45};return vid}}}catch(e){}return null}
{const o=makeFighter;makeFighter=function(src,isPlayer){const f=o.apply(this,arguments);try{if(!isPlayer&&f.artId&&src&&!src.sgid&&typeof CITIES!=='undefined'&&CITIES.some(c=>c.id===src.id)&&HEROES.some(h=>h.id===f.artId))f.artId=null}catch(e){}try{if(!isPlayer&&!f.artId&&!(S&&S.artOff)&&!INKM){let id=amapId(src);if(id&&ART[id]&&ART[id].idle){f.artId=id;artLoad(id)}
 else{const nm=String(src.name||'');const tough=src.id==='bh-amb'||/^bh/.test(String(src.id||''))||(src.look&&typeof LOOK_YAKUZA!=='undefined'&&src.look===LOOK_YAKUZA);const vid=amVidOf(src)||(tough?amRoninVid(src):amAutoVid(src,f));const k=vid&&vid.slice(2);const sp=vid&&(AMV[k]||AMV[vid]);if(sp&&amVariant(vid,sp))id=f.artId=vid}
 if(id)AMAP_NAME[String(src.name||'')]=id}}catch(e){}return f}}
/* the courts, the board and every small portrait reach the same variant through its name */
/* ================= 景 the four camp tiles that were still flat drawings, repainted in the 16-bit scene style =======
   They go through the same pixel painter and animation loop as the map, the shrine and the dojo, and the sea tile carries
   the illustrated atakebune and the Ushi-oni. */
const AM_SCN={
 amsea(g,w,h,t){const sy=h*.58;g.fillStyle=grd(g,0,0,0,sy,['#2a2f6a','#a8507a','#ffb070']);g.fillRect(0,0,w,sy);
  g.fillStyle='rgba(255,230,170,.9)';g.beginPath();g.arc(w*.3,sy-10,22,0,7);g.fill();
  g.fillStyle='#3a2a4a';for(const[x,ww,hh]of[[w*.05,90,18],[w*.55,140,26],[w*.82,90,14]]){g.beginPath();g.moveTo(x,sy);g.quadraticCurveTo(x+ww/2,sy-hh*2,x+ww,sy);g.fill()}
  g.fillStyle=grd(g,0,sy,0,h,['#3a4a8a','#16204a','#0a1028']);g.fillRect(0,sy,w,h-sy);
  g.strokeStyle='rgba(255,190,140,.35)';g.lineWidth=2;for(let i=0;i<14;i++){const y=sy+6+i*7,o=(t*18+i*37)%60;g.beginPath();for(let x=-60+o;x<w;x+=60){g.moveTo(x,y);g.lineTo(x+22,y)}g.stroke()}
  const mo=artReady('ushioni','idle');if(mo){const im=mo.img,H=h*.78,W=H*im.naturalWidth/im.naturalHeight,b=Math.sin(t*1.4)*3;g.save();g.beginPath();g.rect(0,0,w,sy+14);g.clip();g.translate(w*.74,sy+H*.28+b);g.scale(-1,1);g.drawImage(im,-W*mo.ax,-H,W,H);g.restore()}
  const sh=itm('s_atake');if(sh){const W=w*.38,H=W*sh.naturalHeight/sh.naturalWidth,b=Math.sin(t*2)*2;g.save();g.translate(w*.2,sy+10+b);g.rotate(Math.sin(t*1.5)*.03);g.drawImage(sh,-W/2,-H,W,H);g.restore()}
  g.fillStyle='rgba(255,255,255,.55)';for(let i=0;i<5;i++){g.fillRect(w*.6+i*14+Math.sin(t*3+i)*3,sy+10+(i%2)*3,8,2)}},
 amtown(g,w,h,t){g.fillStyle=grd(g,0,0,0,h,['#0e0c26','#2a1f48','#4a2a3a']);g.fillRect(0,0,w,h);
  g.fillStyle='#f6eac8';g.beginPath();g.arc(w*.82,h*.18,13,0,7);g.fill();g.fillStyle='rgba(255,255,255,.6)';for(let i=0;i<22;i++)g.fillRect((i*73)%w,(i*29)%(h*.45),1.5,1.5);
  /* the castle on its hill */const cx=w*.5;g.fillStyle='#1e1830';g.beginPath();g.moveTo(cx-120,h*.62);g.quadraticCurveTo(cx,h*.38,cx+120,h*.62);g.fill();
  const tier=(y,ww,hh)=>{g.fillStyle='#e8e0cc';g.fillRect(cx-ww/2,y,ww,hh);g.fillStyle='#2a2a3a';g.beginPath();g.moveTo(cx-ww/2-8,y);g.lineTo(cx,y-hh*.9);g.lineTo(cx+ww/2+8,y);g.fill();g.fillStyle='#ffd27a';for(let i=-1;i<=1;i++)g.fillRect(cx+i*ww/4-2,y+hh*.35,4,5)};
  tier(h*.40,60,16);tier(h*.31,42,13);tier(h*.24,26,10);
  /* the street of machiya */for(let i=0;i<9;i++){const x=i*w/8-14,hh=46+(i*17)%22,y=h-hh-12;g.fillStyle=['#3a2a22','#4a3428','#30241e'][i%3];g.fillRect(x,y,w/8+6,hh);g.fillStyle='#1a1414';g.beginPath();g.moveTo(x-6,y);g.lineTo(x+w/16+3,y-14);g.lineTo(x+w/8+12,y);g.fill();
   g.fillStyle='rgba(255,200,110,.85)';g.fillRect(x+8,y+14,w/8-16,10);g.fillStyle='#2a1a14';for(let k=0;k<4;k++)g.fillRect(x+10+k*((w/8-20)/3),y+14,1.5,10)}
  g.fillStyle='#2a2028';g.fillRect(0,h-12,w,12);
  for(let i=0;i<6;i++){const x=w*.08+i*w*.17,sw=Math.sin(t*2+i)*3;g.strokeStyle='#2a1a14';g.lineWidth=1.5;g.beginPath();g.moveTo(x,h*.5);g.lineTo(x+sw,h*.58);g.stroke();
   g.fillStyle='#ff5a2a';g.beginPath();g.ellipse(x+sw,h*.63,7,9,0,0,7);g.fill();g.fillStyle='rgba(255,140,60,.25)';g.beginPath();g.arc(x+sw,h*.63,18,0,7);g.fill();g.fillStyle='#1a1010';g.fillRect(x+sw-5,h*.63-9,10,2);g.fillRect(x+sw-5,h*.63+7,10,2)}},
 amtreasury(g,w,h,t){g.fillStyle=grd(g,0,0,0,h,['#1a0f08','#3a2410','#1a0f08']);g.fillRect(0,0,w,h);
  g.fillStyle='rgba(0,0,0,.35)';for(let x=0;x<w;x+=26)g.fillRect(x,0,3,h);g.fillStyle='#4a3018';g.fillRect(0,h*.34,w,6);g.fillRect(0,h*.62,w,6);
  const gl=g.createRadialGradient(w*.5,h*.62,8,w*.5,h*.62,w*.45);gl.addColorStop(0,'rgba(255,210,100,.55)');gl.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gl;g.fillRect(0,0,w,h);
  /* rice bales */for(let i=0;i<5;i++){const x=12+i*30,y=h*.34-22;g.fillStyle='#c8a860';g.beginPath();g.ellipse(x+12,y+11,14,10,0,0,7);g.fill();g.strokeStyle='#7a5a20';g.lineWidth=1.5;g.beginPath();g.moveTo(x+4,y+3);g.lineTo(x+4,y+19);g.moveTo(x+20,y+3);g.lineTo(x+20,y+19);g.stroke()}
  /* sake barrels */for(let i=0;i<3;i++){const x=w-40-i*34,y=h*.34-30;g.fillStyle='#e8dcc0';g.fillRect(x,y,28,30);g.fillStyle='#8a1c1c';g.fillRect(x+6,y+8,16,12);g.fillStyle='#3a2a1a';g.fillRect(x,y+2,28,2);g.fillRect(x,y+26,28,2)}
  /* the senryōbako chests and the koban */const chest=(x,y,s)=>{g.fillStyle='#5a2a14';g.fillRect(x,y,46*s,26*s);g.fillStyle='#2a140a';g.fillRect(x,y,46*s,6*s);g.fillStyle='#e6b450';g.fillRect(x+20*s,y+8*s,6*s,8*s);g.fillRect(x,y+12*s,46*s,2*s)};
  chest(w*.12,h*.66,1.2);chest(w*.64,h*.66,1.2);
  for(let i=0;i<18;i++){const x=w*.38+(i%6)*12+((i/6|0)%2)*6,y=h*.86-(i/6|0)*6,sh=(Math.sin(t*3+i)+1)/2;g.fillStyle=sh>.85?'#fff6c0':'#e6b450';g.beginPath();g.ellipse(x,y,6,3.5,0,0,7);g.fill();g.fillStyle='#a8792a';g.fillRect(x-3,y-.5,6,1)}
  g.fillStyle='#2a1a0a';g.fillRect(0,h-6,w,6)},
 amsumo(g,w,h,t){g.fillStyle=grd(g,0,0,0,h,['#1a1222','#2a1a2a','#3a2418']);g.fillRect(0,0,w,h);
  /* the crowd */for(let r=0;r<4;r++)for(let i=0;i<34;i++){const x=(i*w/33)+(r%2)*5,y=h*.18+r*9;g.fillStyle=['#5a3a2a','#3a2a3a','#6a4a30','#2a2a3a'][(i+r)%4];g.beginPath();g.arc(x,y+Math.sin(t*4+i+r)*.6,3.4,0,7);g.fill()}
  /* the hanging roof and its four tassels */g.fillStyle='#2a2a34';g.beginPath();g.moveTo(w*.18,h*.12);g.lineTo(w*.5,0);g.lineTo(w*.82,h*.12);g.fill();g.fillStyle='#5a2a6a';g.fillRect(w*.2,h*.12,w*.6,8);
  [['#2a8a4a',.22],['#c4372a',.78]].forEach(([c,x])=>{g.fillStyle=c;g.fillRect(w*x-3,h*.15,6,18);g.beginPath();g.arc(w*x,h*.15+20,5,0,7);g.fill()});
  /* the dohyō */g.fillStyle='#a8784a';g.beginPath();g.moveTo(w*.12,h*.9);g.lineTo(w*.24,h*.6);g.lineTo(w*.76,h*.6);g.lineTo(w*.88,h*.9);g.fill();
  g.fillStyle='#d6b07a';g.beginPath();g.ellipse(w*.5,h*.72,w*.27,h*.1,0,0,7);g.fill();g.strokeStyle='#efe0b0';g.lineWidth=3;g.stroke();
  /* two rikishi locked in the clinch */const rik=(x,dir,sk,mw)=>{const b=Math.sin(t*2.4)*1.5*dir;g.fillStyle=sk;g.beginPath();g.ellipse(x+b,h*.6,18,22,0,0,7);g.fill();g.beginPath();g.arc(x+b+dir*9,h*.42,8,0,7);g.fill();
   g.fillStyle='#141418';g.beginPath();g.arc(x+b+dir*8,h*.36,4,0,7);g.fill();g.fillStyle=mw;g.fillRect(x+b-17,h*.62,34,8);g.fillStyle=sk;g.fillRect(x+b-13,h*.68,9,14);g.fillRect(x+b+4,h*.68,9,14);
   g.strokeStyle=sk;g.lineWidth=7;g.beginPath();g.moveTo(x+b+dir*12,h*.52);g.lineTo(x+b+dir*30,h*.56);g.stroke()};
  rik(w*.43,1,'#e2ad80',  '#2a3a8a');rik(w*.57,-1,'#d39a6e','#8a1c1c');
  g.fillStyle='rgba(255,230,180,.12)';g.beginPath();g.ellipse(w*.5,h*.55,w*.3,h*.4,0,0,7);g.fill()}};
Object.assign(SCN,AM_SCN);
Object.assign(SCN,{
 amtrade(g,w,h,t){g.fillStyle=grd(g,0,0,0,h*.55,['#5a8ac8','#f0b878']);g.fillRect(0,0,w,h*.55);g.fillStyle=grd(g,0,h*.55,0,h,['#2a5a8a','#12304a']);g.fillRect(0,h*.55,w,h*.45);
  const sh=itm('s_sekibune');if(sh){const W=w*.3,H=W*sh.naturalHeight/sh.naturalWidth;g.save();g.translate(w*.8,h*.62+Math.sin(t*2)*2);g.drawImage(sh,-W/2,-H,W,H);g.restore()}
  /* the merchant house with its noren */g.fillStyle='#4a3020';g.fillRect(w*.02,h*.22,w*.58,h*.56);g.fillStyle='#2a1a14';g.beginPath();g.moveTo(-6,h*.24);g.lineTo(w*.31,h*.06);g.lineTo(w*.64,h*.24);g.fill();
  ['#1f3a6a','#8a1c1c','#2a6a3a','#5a3a1a'].forEach((c,i)=>{const x=w*.05+i*w*.135,sw=Math.sin(t*1.6+i)*1.5;g.fillStyle=c;g.fillRect(x+sw,h*.3,w*.12,h*.2);g.fillStyle='#f1e6cf';g.fillRect(x+sw+w*.05,h*.33,w*.02,h*.1)});
  /* goods on the boardwalk */g.fillStyle='#7a5a30';g.fillRect(0,h*.78,w*.66,h*.06);for(let i=0;i<6;i++){const x=w*.04+i*w*.1;g.fillStyle=i%2?'#c8a860':'#e8dcc0';g.fillRect(x,h*.68,w*.07,h*.1);g.fillStyle='#3a2a1a';g.fillRect(x,h*.71,w*.07,2)}
  for(let i=0;i<5;i++){const s=(Math.sin(t*3+i)+1)/2;g.fillStyle=s>.8?'#fff6c0':'#e6b450';g.beginPath();g.ellipse(w*.66+i*10,h*.86,5,3,0,0,7);g.fill()}},
 amtech(g,w,h,t){g.fillStyle=grd(g,0,0,0,h,['#2a1c14','#3a2818','#1a120c']);g.fillRect(0,0,w,h);
  g.fillStyle='#e8e0cc';g.fillRect(w*.06,h*.08,w*.36,h*.5);g.strokeStyle='#5a3a20';g.lineWidth=3;for(let i=1;i<4;i++){g.beginPath();g.moveTo(w*.06+i*w*.09,h*.08);g.lineTo(w*.06+i*w*.09,h*.58);g.stroke()}g.beginPath();g.moveTo(w*.06,h*.33);g.lineTo(w*.42,h*.33);g.stroke();
  /* scrolls on the shelf */g.fillStyle='#4a3018';g.fillRect(w*.5,h*.18,w*.46,5);g.fillRect(w*.5,h*.42,w*.46,5);for(let i=0;i<7;i++){g.fillStyle=['#e8dcc0','#c8a860','#d8c8a0'][i%3];g.beginPath();g.ellipse(w*.53+i*w*.062,h*.14,5,8,0,0,7);g.fill();g.fillStyle='#8a1c1c';g.fillRect(w*.53+i*w*.062-5,h*.12,10,2)}
  for(let i=0;i<5;i++){g.fillStyle=['#2a3a5a','#5a2a1a','#2a4a2a'][i%3];g.fillRect(w*.53+i*w*.085,h*.27,w*.07,h*.15);g.fillStyle='#e6b450';g.fillRect(w*.53+i*w*.085+3,h*.3,w*.07-6,2)}
  /* the desk: an open book, an abacus, a lamp */g.fillStyle='#5a3a20';g.fillRect(w*.1,h*.7,w*.8,h*.08);g.fillStyle='#3a2414';g.fillRect(w*.14,h*.78,8,h*.2);g.fillRect(w*.84,h*.78,8,h*.2);
  g.fillStyle='#f4ecd8';g.fillRect(w*.3,h*.6,w*.2,h*.1);g.fillStyle='#1a1414';for(let i=0;i<5;i++)g.fillRect(w*.32+i*7,h*.62,1.5,h*.06);
  g.fillStyle='#4a3018';g.fillRect(w*.56,h*.6,w*.18,h*.1);for(let r=0;r<3;r++)for(let i=0;i<8;i++){g.fillStyle='#c8a860';g.beginPath();g.arc(w*.575+i*w*.02,h*.625+r*7,2.5,0,7);g.fill()}
  const fl=(Math.sin(t*9)+1)/2;g.fillStyle='rgba(255,200,110,.25)';g.beginPath();g.arc(w*.2,h*.55,30+fl*3,0,7);g.fill();g.fillStyle='#e8dcc0';g.fillRect(w*.18,h*.52,w*.04,h*.18);g.fillStyle='#ffcf5a';g.fillRect(w*.19,h*.48-fl*2,w*.02,h*.05)},
 amcourt(g,w,h,t){g.fillStyle=grd(g,0,0,0,h,['#2a1a10','#4a2e18','#2a1a10']);g.fillRect(0,0,w,h);
  /* the golden screen behind the dais */g.fillStyle=grd(g,0,h*.1,0,h*.55,['#f3d27a','#b8862a']);g.fillRect(w*.1,h*.08,w*.8,h*.46);g.strokeStyle='#5a3a10';g.lineWidth=2;for(let i=1;i<6;i++){g.beginPath();g.moveTo(w*.1+i*w*.8/6,h*.08);g.lineTo(w*.1+i*w*.8/6,h*.54);g.stroke()}
  g.strokeStyle='#2a5a2a';g.lineWidth=4;g.beginPath();g.moveTo(w*.2,h*.5);g.quadraticCurveTo(w*.32,h*.2,w*.45,h*.36);g.stroke();g.fillStyle='#2a6a3a';for(let i=0;i<6;i++){g.beginPath();g.arc(w*.24+i*w*.04,h*.3+Math.sin(i)*8,7,0,7);g.fill()}
  g.fillStyle='#e8e0cc';g.beginPath();g.arc(w*.72,h*.24,12,0,7);g.fill();
  /* tatami and the dais */g.fillStyle='#b8a868';g.fillRect(0,h*.62,w,h*.38);g.strokeStyle='#5a4a20';g.lineWidth=1.5;for(let i=0;i<6;i++){g.beginPath();g.moveTo(i*w/5,h*.62);g.lineTo(i*w/5-20,h);g.stroke()}
  g.fillStyle='#3a2414';g.fillRect(w*.3,h*.54,w*.4,h*.1);g.fillStyle='#8a1c1c';g.fillRect(w*.32,h*.55,w*.36,h*.04);
  /* the lord seated, and two retainers bowing */g.fillStyle='#1a1a2a';g.beginPath();g.ellipse(w*.5,h*.5,16,14,0,0,7);g.fill();g.fillStyle='#e2ad80';g.beginPath();g.arc(w*.5,h*.37,7,0,7);g.fill();g.fillStyle='#141414';g.fillRect(w*.5-4,h*.27,8,6);
  for(const x of[.22,.78]){g.fillStyle='#2a3a5a';g.beginPath();g.ellipse(w*x,h*.8,18,9,0,0,7);g.fill();g.fillStyle='#e2ad80';g.beginPath();g.arc(w*x+(x<.5?14:-14),h*.78,5,0,7);g.fill()}},
 amkusuri(g,w,h,t){g.fillStyle=grd(g,0,0,0,h,['#1e2a1a','#2e3a24','#1a1a12']);g.fillRect(0,0,w,h);
  /* the medicine chest of a hundred drawers */g.fillStyle='#5a3a1a';g.fillRect(w*.04,h*.1,w*.44,h*.7);for(let r=0;r<6;r++)for(let c=0;c<5;c++){const x=w*.06+c*w*.084,y=h*.13+r*h*.105;g.fillStyle='#7a5228';g.fillRect(x,y,w*.074,h*.085);g.fillStyle='#e6b450';g.fillRect(x+w*.033,y+h*.035,4,3);g.fillStyle='#f1e6cf';g.fillRect(x+3,y+3,8,5)}
  g.fillStyle='#8a5a2a';g.fillRect(w*.05,h*.82,w*.42,4);g.fillStyle='#3a6a2a';for(let i=0;i<5;i++){g.beginPath();g.ellipse(w*.1+i*w*.08,h*.88,7,4,i,0,7);g.fill()}
  /* the stable door and the horse */g.fillStyle='#3a2a1a';g.fillRect(w*.54,h*.18,w*.44,h*.7);g.fillStyle='#1a120c';g.fillRect(w*.58,h*.26,w*.36,h*.62);g.fillStyle='#c8a860';for(let i=0;i<4;i++)g.fillRect(w*.6+i*w*.06,h*.8+(i%2)*3,w*.05,4);
  const hs=itm('h_kiso');if(hs){const H=h*.62,W=H*hs.naturalWidth/hs.naturalHeight;g.save();g.translate(w*.76,h*.88+Math.sin(t*1.5));g.scale(-1,1);g.drawImage(hs,-W/2,-H,W,H);g.restore()}
  g.fillStyle='#2a1a10';g.beginPath();g.moveTo(w*.5,h*.2);g.lineTo(w*.76,h*.04);g.lineTo(w*1.02,h*.2);g.fill()},
 amcraft(g,w,h,t){g.fillStyle=grd(g,0,0,0,h,['#1a100a','#3a2010','#140c08']);g.fillRect(0,0,w,h);
  const fl=(Math.sin(t*7)+1)/2,gl=g.createRadialGradient(w*.28,h*.6,6,w*.28,h*.6,w*.4);gl.addColorStop(0,`rgba(255,${140+fl*40|0},60,.75)`);gl.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gl;g.fillRect(0,0,w,h);
  /* the forge */g.fillStyle='#4a3a30';g.fillRect(w*.12,h*.5,w*.32,h*.36);g.fillStyle='#ff7a2a';g.fillRect(w*.17,h*.56,w*.22,h*.1);g.fillStyle='#ffd27a';g.fillRect(w*.21,h*.58,w*.14,h*.05);
  for(let i=0;i<9;i++){const k=(t*1.2+i*.37)%1;g.fillStyle=`rgba(255,${190+i*6},90,${1-k})`;g.fillRect(w*.2+((i*31)%60)+Math.sin(t*3+i)*6,h*.5-k*h*.45,2.5,2.5)}
  /* the anvil, the hammer */g.fillStyle='#2a2a30';g.fillRect(w*.52,h*.68,w*.2,h*.06);g.fillRect(w*.57,h*.74,w*.1,h*.14);g.fillStyle='#5a5a66';g.fillRect(w*.52,h*.66,w*.2,3);
  g.save();g.translate(w*.66,h*.6);g.rotate(-.6+Math.sin(t*4)*.35);g.fillStyle='#5a3a1a';g.fillRect(-2,-4,4,h*.22);g.fillStyle='#3a3a44';g.fillRect(-9,-10,18,10);g.restore();
  /* the blades on the rack */g.fillStyle='#3a2414';g.fillRect(w*.78,h*.16,w*.18,4);g.fillRect(w*.78,h*.5,w*.18,4);const k=itm('w_katana');for(let i=0;i<3;i++){const y=h*.2+i*h*.1;if(k){const W=w*.2,H=W*k.naturalHeight/k.naturalWidth;g.drawImage(k,w*.77,y,W,H)}else{g.fillStyle='#c0c4cc';g.fillRect(w*.79,y,w*.16,2)}}},
 amvil(g,w,h,t){g.fillStyle=grd(g,0,0,0,h*.5,['#7ab0e0','#cfe6f0']);g.fillRect(0,0,w,h*.5);
  g.fillStyle='#5a7a9a';g.beginPath();g.moveTo(0,h*.42);g.lineTo(w*.2,h*.18);g.lineTo(w*.38,h*.4);g.lineTo(w*.6,h*.14);g.lineTo(w*.85,h*.38);g.lineTo(w,h*.26);g.lineTo(w,h*.5);g.lineTo(0,h*.5);g.fill();g.fillStyle='#f4f8fc';g.beginPath();g.moveTo(w*.6,h*.14);g.lineTo(w*.55,h*.22);g.lineTo(w*.65,h*.22);g.fill();
  g.fillStyle='#3a6a2a';g.fillRect(0,h*.46,w,h*.1);
  /* terraced paddies with their shine */for(let r=0;r<4;r++){const y=h*.56+r*h*.11;g.fillStyle=r%2?'#4a8a3a':'#5a9a44';g.fillRect(0,y,w,h*.11);g.fillStyle='rgba(200,230,255,.35)';for(let i=0;i<6;i++)g.fillRect(((i*67+r*31+t*6)%w),y+4,20,2);g.fillStyle='#3a5a24';g.fillRect(0,y,w,2)}
  /* farmhouses with thatch */const house=(x,y,s)=>{g.fillStyle='#5a3a24';g.fillRect(x,y,34*s,18*s);g.fillStyle='#c8a860';g.beginPath();g.moveTo(x-6*s,y+2*s);g.lineTo(x+17*s,y-16*s);g.lineTo(x+40*s,y+2*s);g.fill();g.fillStyle='rgba(255,210,120,.8)';g.fillRect(x+12*s,y+6*s,8*s,6*s)};
  house(w*.12,h*.44,1);house(w*.62,h*.42,1.15);
  /* a water wheel turning */const cx=w*.88,cy=h*.5;g.strokeStyle='#5a3a20';g.lineWidth=3;g.beginPath();g.arc(cx,cy,13,0,7);g.stroke();for(let i=0;i<6;i++){const a=t*1.5+i*Math.PI/3;g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+Math.cos(a)*15,cy+Math.sin(a)*15);g.stroke()}
  for(let i=0;i<3;i++){const x=w*.3+i*w*.12+Math.sin(t+i)*3;g.fillStyle='#e8d070';g.beginPath();g.moveTo(x-6,h*.66);g.lineTo(x,h*.6);g.lineTo(x+6,h*.66);g.fill();g.fillStyle='#2a2a3a';g.fillRect(x-2,h*.66,4,7)}}});

function amTiles(){try{if(INKM)return;for(const[id,k]of[['toSea','amsea'],['toTown','amtown'],['toTreasury','amtreasury'],['toSumo','amsumo'],['toTrade','amtrade'],['toTech','amtech'],['toCourt','amcourt'],['toKusuri','amkusuri'],['toCraft','amcraft'],['toVil','amvil']]){const b=$('#'+id);if(!b||b.dataset.amt)continue;const old=b.querySelector(':scope > canvas');if(!old)continue;
  const c=document.createElement('canvas');c.dataset.scn=k;old.replaceWith(c);b.dataset.amt=1;b.classList.remove('v31')}}catch(e){}}
{const o=renderHub;renderHub=function(){const r=o.apply(this,arguments);try{amTiles()}catch(e){}return r}}
setTimeout(amTiles,1500);
if(false)window.__amap={amapId,AMAP_NAME,amVidOf,amVariant,AMV,get ready(){return AM_VREADY}};
