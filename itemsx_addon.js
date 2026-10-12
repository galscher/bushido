/* ================= 絵 more illustrated pieces =================
   Soldiers on the battlefield (pikes, archers, teppō, cavalry, the commander with his banner bearer and drummer),
   the right picture for each ship type, the Portuguese carrack at Fukuda Bay and on nanban trade voyages,
   the shinobi over the shadow-war page, the jingasa for plain helmets, the jūmonji yari and the paired swords. */
const ITX_U={yari:'u_yari',yumi:'u_yumi',teppo:'u_teppo',kiba:'u_cav',gen:'u_taisho'};
const ITX_H={u_yari:19,u_yumi:22,u_teppo:15,u_cav:30,u_taisho:20,u_nobori:27,u_drum:19};
let ITX_SIDE=null,ITX_SHIP=null,ITX_VOY=null,ITX_DUAL=false;
function itxGenKey(ph){if(ITX_SIDE==null)return'u_taisho';const i=ph-ITX_SIDE;return i===0?'u_taisho':i===1?'u_nobori':i===2?'u_drum':'u_cav'}
{const o=twMan;twMan=function(c,x,y,s,col,flag,t,kind,ph,move){try{if(s>=.05&&ITX_U[kind]){const k=kind==='gen'?itxGenKey(ph):ITX_U[kind],im=itm(k);if(im){
   const H0=ITX_H[k]*s,w=im.naturalWidth*H0/im.naturalHeight,yy=y-(move?Math.abs(Math.sin(t*12+ph))*1.5:0)*s;
   c.save();c.globalAlpha*=.55;c.fillStyle=col||'#444';c.beginPath();c.ellipse(x,y,w*.32,Math.max(1,1.4*s),0,0,7);c.fill();c.restore();
   c.save();c.imageSmoothingEnabled=true;c.drawImage(im,x-w/2,yy-H0,w,H0);
   if(flag&&k!=='u_nobori'){c.fillStyle='#2a1a12';c.fillRect(x-w*.22,yy-H0*1.05,Math.max(1,s*.8),H0*.55);c.fillStyle=flag;c.fillRect(x-w*.22,yy-H0*1.05,4*s,5*s)}
   c.restore();return}}}catch(e){}return o.apply(this,arguments)}}
/* ships: the ship type decides the picture, not its drawn size */
function itxNanbanWar(){try{const c=WAR&&WAR.ctx;if(!c||c.kind!=='foreign')return false;const f=FOREIGN.find(x=>x.id===c.id);return!!(f&&f.nanban)}catch(e){return false}}
function itxShipKey(i){if(ITX_SHIP){const u=ITX_SHIP;if(u.side!=='me'&&(u.t==='flag'||u.t==='atake')&&itxNanbanWar())return's_nanban';return{atake:'s_atake',flag:'s_atake',seki:'s_sekibune',kobaya:'s_kobaya'}[u.t]||null}
 if(ITX_VOY&&i===0)return's_nanban';return null}
{const o=drawShip;drawShip=function(c,x,y,dir,col,t,i,size){try{const k=itxShipKey(i),im=k&&itm(k);if(im){let W0=110*size*(k==='s_nanban'?1.15:1);if(ITX_SHIP&&size<.6)W0=Math.min(W0,46);const h=im.naturalHeight*W0/im.naturalWidth;
  c.save();c.translate(x,y+Math.sin(t*2+i)*3);c.scale(dir,1);c.rotate(Math.sin(t*1.5+i)*.04);c.imageSmoothingEnabled=true;c.drawImage(im,-W0/2,16*size-h,W0,h);c.restore();return}}catch(e){}return o.apply(this,arguments)}}
if(typeof sjDrawUnit==='function'){const o=sjDrawUnit;sjDrawUnit=function(g,u){ITX_SHIP=SJ&&SJ.sea?u:null;try{return o.apply(this,arguments)}finally{ITX_SHIP=null}}}
if(typeof sjDrawSide==='function'){const o=sjDrawSide;sjDrawSide=function(g,x0,w,H,u){ITX_SHIP=SJ&&SJ.sea?u:null;ITX_SIDE=u&&u.gen?u.id:null;try{return o.apply(this,arguments)}finally{ITX_SHIP=null;ITX_SIDE=null}}}
/* a nanban trade voyage: a chartered Portuguese carrack leads the fleet */
{const o=seaVoyage;seaVoyage=function(ctx){let on=false;try{on=!!(ctx&&ctx.kind==='trade'&&RK().nanban)}catch(e){}if(!on)return o.apply(this,arguments);ITX_VOY=ctx;const p=o.apply(this,arguments);Promise.resolve(p).finally(()=>{ITX_VOY=null});return p}}
/* the shinobi over the clans for hire */
{const o=renderShadow;renderShadow=function(el){const r=o.apply(this,arguments);try{const d=typeof ITEM_DATA!=='undefined'&&ITEM_DATA.u_ninja;if(d&&!INKM&&!(S&&S.artOff)&&el){const b=document.createElement('div');b.className='card';b.style.cssText='display:flex;align-items:center;gap:12px;padding:8px 12px;margin:0 0 8px;background:linear-gradient(90deg,#05060f,#1a1a2e)';
  b.innerHTML=`<img src="${d.src}" alt="" style="height:96px;width:auto;flex:none"><div><div class="kanji" style="font-size:26px;color:#c9c3e6">忍</div><div style="font-size:13px;color:#d8d2f0">${TX('שבטי הצללים: איגה, קוגה ופומה מוכרים את שירותיהם למי שמשלם.','The shadow clans: Iga, Kōga and Fūma sell their arts to whoever pays.')}</div></div>`;el.prepend(b)}}catch(e){}return r}}
/* gear: plain helmets are the foot soldier's jingasa, fine spears are the cross-bladed jūmonji, paired swords show both blades */
{const o=itmGearKey;itmGearKey=function(it){const k=o(it);try{if(it&&it.s==='w'&&it.kind==='yari'&&c43rar(it.lv)>=3)return'w_jumonji';if(it&&it.s==='h'&&c43rar(it.lv)===0)return'k_jingasa'}catch(e){}return k}}
{const o=itmFit;itmFit=function(g,im,cx,cy,w,h,flip){if(!ITX_DUAL)return o.apply(this,arguments);const wk=itm('w_wakizashi');if(!wk)return o.apply(this,arguments);
 o(g,im,cx,cy-h*.2,w,h*.5,flip);return o(g,wk,cx-w*.08,cy+h*.24,w*.72,h*.4,flip)}}
{const o=c43art;c43art=function(it){ITX_DUAL=!!(it&&it.s==='w'&&it.kind==='dual');try{return o.apply(this,arguments)}finally{ITX_DUAL=false}}}
if(typeof v41art==='function'){const o=v41art;v41art=function(it){ITX_DUAL=!!(it&&it.s==='w'&&it.kind==='dual');try{return o.apply(this,arguments)}finally{ITX_DUAL=false}}}
/* the gear pictures are small: fetch them all a little after start, so the armory never shows a code-drawn fallback */
setTimeout(()=>{try{if(typeof ITEM_DATA==='undefined')return;for(const k in ITEM_DATA)if(/^[wak]_/.test(k))itm(k)}catch(e){}},2500);
if(false)window.__itx={itxShipKey,itxGenKey,itmGearKey:it=>itmGearKey(it),twMan:(...a)=>twMan(...a),itm,set:(k,v)=>{if(k==='side')ITX_SIDE=v;if(k==='ship')ITX_SHIP=v;if(k==='voy')ITX_VOY=v},shadow:el=>renderShadow(el),c43art:(a,b,c)=>c43art(a,b,c)};
