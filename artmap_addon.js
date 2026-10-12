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
  if(src.id==='bh-amb'||/^bh/.test(String(src.id||'')))return Math.abs(hashStr(nm))%2?'ronin2':'ronin';
  if(src.look&&typeof LOOK_YAKUZA!=='undefined'&&src.look===LOOK_YAKUZA)return Math.abs(hashStr(nm))%2?'ronin2':'ronin';
 }catch(e){}return null}
{const o=makeFighter;makeFighter=function(src,isPlayer){const f=o.apply(this,arguments);try{if(!isPlayer&&!f.artId&&!(S&&S.artOff)){const id=amapId(src);if(id&&ART[id]&&ART[id].idle){f.artId=id;artLoad(id);AMAP_NAME[String(src.name||'')]=id}}}catch(e){}return f}}
{const o=artPorId;artPorId=function(look,key){const r=o.apply(this,arguments);if(r)return r;try{if(S&&S.artOff||INKM)return null;const k=String(key==null?'':key);let m=/^x50h(\d+)$/.exec(k);if(m&&HEROES[+m[1]]){const id=HEROES[+m[1]].id;if(ART[id]&&ART[id].por)return id}
 m=/^x50f(\d+)$/.exec(k);if(m&&typeof LADDER_ART!=='undefined'){const id=LADDER_ART[+m[1]];if(id&&ART[id]&&ART[id].por)return id}
 const id=AMAP_NAME[k];if(id&&ART[id]&&ART[id].por)return id}catch(e){}return null}}
/* the Ushi-oni of the sea routes rises in its own picture, facing the ship, its legs under the waves */
{const o=seaMon;seaMon=function(g,m,x,y,t,pose,hurt,sc){try{if(m&&m.id==='ushioni'&&!(S&&S.artOff)){const a=artReady('ushioni','idle');if(a){sc=sc||1;
 const up=pose==='rise'?-26:pose==='deep'?70:0,b=Math.sin(t*1.6)*4,H=215,W=H*a.img.naturalWidth/a.img.naturalHeight;
 g.save();g.translate(x,y+up*sc+b);g.scale(-sc,sc);if(hurt>0){g.translate(Math.sin(t*70)*4,0);g.globalAlpha=.85}
 g.drawImage(a.img,-W*a.ax,-H+62,W,H);g.restore();return}}}catch(e){}return o.apply(this,arguments)}}
/* the court and the market: a person who already has an illustrated face shows it in their portrait, over their own
   scene (shoji, sea, castle). The same people the player meets in the arena keep the same face here. Tamamo stays drawn:
   as 'the lady in white' her fox ears would give her away. */
const AMAP_CAST={nobunaga:'nobunaga',yukimura:'yukimura',gonbei:'guard',kumagoro:'ronin2',ryuzan:'ronin'};
{const o=drawCast;drawCast=function(g,id,t,talk){try{const aid=AMAP_CAST[id],C=CAST[id];if(aid&&C&&!(S&&S.artOff)&&!INKM){const a=artReady(aid,'por');if(a){const cv=g.canvas;
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
document.head.insertAdjacentHTML('beforeend',`<style>.amth{float:inline-start;margin-inline-end:10px;margin-bottom:4px;border:2px solid;border-radius:8px;box-shadow:0 0 0 1px #000,inset 0 0 0 1px rgba(255,255,255,.06)}.amth.on{box-shadow:0 0 0 1px #000,0 0 10px rgba(230,180,80,.55)}.amth.amwide{float:none;display:block;margin:6px 0}.card.item:has(> .amth:not(.amwide)){min-height:76px}.card.item > .amth + .top{margin-top:2px}</style>`);
/* faces that small screens draw once (the daily challenge, the duel picker, the board): load just the portraits early,
   in the background, so the first look already shows the illustration */
setTimeout(()=>{try{const ids=new Set([...(typeof LADDER_ART!=='undefined'?LADDER_ART:[]),...HEROES.map(h=>h.id),...Object.values(AMAP_CAST)]);let n=0;
 for(const id of ids){const a=ART[id]&&ART[id].por;if(a&&a.d&&!a.img){const im=new Image();im.decoding='async';setTimeout(()=>{im.src=a.d.src},n++*120);a.img=im}}}catch(e){}},2500);
if(false)window.__amap={amapId,AMAP_NAME};
