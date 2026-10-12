/* ================= 道具 illustrated things =================
   Companion beasts, horses, ships and every forged weapon, armour and helmet are drawn from hand-illustrated
   pixel art when it exists; the code-drawn versions stay as the fallback. Images load lazily on first use. */
const ITM={};
function itm(k){const d=typeof ITEM_DATA!=='undefined'&&ITEM_DATA[k];if(!d||INKM||(S&&S.artOff))return null;let e=ITM[k];if(!e){e=ITM[k]={img:new Image(),d};e.img.decoding='async';e.img.src=d.src}return e.img.complete&&e.img.naturalWidth?e.img:null}
function itmFit(g,im,cx,cy,w,h,flip){const s=Math.min(w/im.naturalWidth,h/im.naturalHeight),dw=im.naturalWidth*s,dh=im.naturalHeight*s;g.save();g.translate(cx,cy);if(flip)g.scale(-1,1);g.imageSmoothingEnabled=true;g.drawImage(im,-dw/2,-dh/2,dw,dh);g.restore();return[dw,dh]}
/* companion beasts */
{const o=drawBeastSpirit;drawBeastSpirit=function(g,id,x,y,sc,t){const im=itm('b_'+id);if(!im)return o.apply(this,arguments);const bob=Math.sin((t||0)*2.2)*4,H0=(['ryu','hoo','kirin','hakutaku','genbu'].includes(id)?82:66)*sc;
 const s=H0/im.naturalHeight,w=im.naturalWidth*s;g.save();g.translate(x,y+bob);g.imageSmoothingEnabled=true;g.drawImage(im,-w/2,-H0*.72,w,H0);g.restore()}}
/* horses: the tier picks the breed (pony, Kiso horse, armoured war horse, the white sacred horse) */
const ITM_HORSE=t=>t>=5?'h_white':t>=3?'h_war':t>=2?'h_kiso':'h_dosanko';
{const o=horseSide;horseSide=function(g,x,y,s,col,tier,t){const im=itm(ITM_HORSE(tier||1));if(!im)return o.apply(this,arguments);const H0=112*s,w=im.naturalWidth*H0/im.naturalHeight;
 g.save();g.fillStyle='rgba(0,0,0,.28)';g.beginPath();g.ellipse(x+4*s,y+1,52*s,6*s,0,0,7);g.fill();const rtl=g.direction==='rtl';g.translate(x+9*s,y);g.imageSmoothingEnabled=true;g.drawImage(im,-w/2,-H0,w,H0);g.restore()}}
/* ships: small boats, the oared sekibune, the great atakebune */
{const o=drawShip;drawShip=function(c,x,y,dir,col,t,i,size){const k=size>=.9?'s_atake':size>=.5?'s_sekibune':'s_kobaya',im=itm(k);if(!im)return o.apply(this,arguments);const W0=110*size,h=im.naturalHeight*W0/im.naturalWidth;
 c.save();c.translate(x,y+Math.sin(t*2+i)*3);c.scale(dir,1);c.rotate(Math.sin(t*1.5+i)*.04);c.imageSmoothingEnabled=true;c.drawImage(im,-W0/2,16*size-h,W0,h);c.restore()}}
/* forged gear */
const ITM_W={katana:'w_katana',dual:'w_katana',nodachi:'w_nodachi',odachi:'w_nodachi',naginata:'w_naginata',nagamaki:'w_naginata',bisento:'w_naginata',yari:'w_yari',jumonji:'w_jumonji',kanabo:'w_kanabo',tetsubo:'w_kanabo',otsuchi:'w_kanabo',claw:'w_claw',fan:'w_fan',bokken:'w_bokken',bo:'w_bokken',tachi:'w_tachi',wakizashi:'w_wakizashi',tanto:'w_tanto',kama:'w_tanto',jitte:'w_tanto',sai:'w_tanto'};
const ITM_A={light:'a_light',mid:'a_tosei',heavy:'a_oyoroi'};
const ITM_H={kuwagata:'k_kuwagata',crescent:'k_crescent',antler:'k_antler',sun:'k_kuwagata'};
function itmGearKey(it){if(!it)return null;if(it.s==='w')return ITM_W[it.kind]||null;if(it.s==='a'){let ri=0;try{ri=c43rar(it.lv)}catch(e){}return it.kind==='heavy'&&ri>=4?'a_black':ITM_A[it.kind]||null}if(it.s==='h')return ITM_H[it.kind]||null;return null}
function itmGear(c,it,W0,H0){try{const k=itmGearKey(it),im=k&&itm(k);if(!im)return c;W0=W0||c.width;H0=H0||c.height;const g=c.getContext('2d');g.save();g.setTransform(c.width/W0,0,0,c.height/H0,0,0);let ri=0,R=null;try{ri=c43rar(it.lv);R=C43R[ri]}catch(e){}
 const bg=g.createLinearGradient(0,0,W0,H0);bg.addColorStop(0,'#120c0a');bg.addColorStop(1,shade((R&&R.c)||'#5a4a40',-.78));g.fillStyle=bg;g.fillRect(0,0,W0,H0);
 if(ri>=3&&R){g.save();g.globalAlpha=.25+ri*.05;g.translate(W0/2,H0/2);for(let i=0;i<12;i++){g.rotate(Math.PI/6);g.fillStyle=R.c;g.beginPath();g.moveTo(0,0);g.lineTo(W0,-8);g.lineTo(W0,8);g.fill()}g.restore()}
 if(ri>=2&&R){g.save();g.shadowColor=R.c;g.shadowBlur=14}else g.save();itmFit(g,im,W0/2,H0/2,W0*.92,H0*.86);g.restore();
 if(ri>=3&&R){g.font=`${Math.round(H0*.15)}px 'Yuji Syuku',serif`;g.fillStyle=R.c;g.textAlign='left';g.fillText(R.jp,6,H0*.2)}g.fillStyle=ri===0?'#9a8e80':((R&&R.c)||'#ccc');g.font=`${Math.round(H0*.12)}px system-ui,sans-serif`;g.textAlign='left';g.fillText(`Lv ${it.lv}`,8,H0-8);g.restore()}catch(e){}return c}
{const o=c43art;c43art=function(it,W0,H0){return itmGear(o.apply(this,arguments),it,W0,H0)}}
if(typeof v41art==='function'){const o=v41art;v41art=function(it,W0,H0){return itmGear(o.apply(this,arguments),it,W0||300,H0||110)}}
/* preload what the player will see first */
setTimeout(()=>{try{if(!S)return;(S.beasts&&S.beasts.on||[]).forEach(id=>itm('b_'+id));if(S.horse!=null)itm(ITM_HORSE(S.horse===-2?5:(S.horse||0)+1));const cf=S.cf;if(cf)for(const sl of['w','a','h']){const id=cf.eq[sl],it=id&&cf.inv.find(x=>x.id===id);const k=itmGearKey(it);if(k)itm(k)}}catch(e){}},800);
if(false)window.__itm={itm,ITEM_DATA:()=>ITEM_DATA,c43art:(a,b,c)=>c43art(a,b,c),c43make:(...a)=>c43make(...a),beastCanvas:id=>beastCanvas(id),horseSide:(...a)=>horseSide(...a),drawShip:(...a)=>drawShip(...a),mk:(w,h)=>mkCanvas(w,h)};
