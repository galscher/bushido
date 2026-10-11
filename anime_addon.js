/* ================= アニメ the game becomes an anime =================
   Cel-shaded cinematics drawn live from the game's own warriors: an opening film on the title screen and a
   "VS" cut-in before every great duel. Bold outlines, speed lines, impact frames, falling maple leaves and brush kanji,
   in the spirit of 1990s samurai anime. Tap anywhere to skip. */
const AN={busy:false,last:0,n:0};
const anR=(i)=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)};
function anFig(src,me){try{const s2={level:10,forge:0,armor:0,stats:{str:10,atk:10,def:10,vit:10,agi:10,end:10,cha:5},wk:'katana',...src};s2.look={...(HEROES[0].look||{}),...(src.look||{})};return makeFighter(s2,!!me)}catch(e){try{console.warn('anFig',e)}catch(_){}return null}}
function anHeroFig(i){const H=HEROES[i]||HEROES[0];return anFig({name:H.name,level:30,stats:H.stats,wk:H.wk,forge:2,armor:2,look:{...H.look}},true)}
function anPlayerFig(){try{return anFig(playerSrc(),true)}catch(e){return anHeroFig((S&&S.hero)|0)}}
/* a warrior with a thick ink outline, the way cels were inked */
let AN_OFF=null,AN_OFF2=null;
function anDraw(g,f,x,y,sc,pose,t,face,ink){if(!f)return;const W=g.canvas.width,H=g.canvas.height;if(!AN_OFF||AN_OFF.width!==W||AN_OFF.height!==H){AN_OFF=mkCanvas(W,H);AN_OFF2=mkCanvas(W,H)}
 const o=AN_OFF.getContext('2d'),o2=AN_OFF2.getContext('2d');o.setTransform(1,0,0,1,0,0);o.clearRect(0,0,W,H);f.facing=face||1;try{drawFighter(o,f,x,y,sc,t,pose||POSES.idle,true)}catch(e){}
 o2.setTransform(1,0,0,1,0,0);o2.globalCompositeOperation='source-over';o2.clearRect(0,0,W,H);o2.drawImage(AN_OFF,0,0);o2.globalCompositeOperation='source-in';o2.fillStyle=ink||'#0a0608';o2.fillRect(0,0,W,H);o2.globalCompositeOperation='source-over';
 const k=Math.max(2,sc*3.2);for(const[dx,dy]of[[k,0],[-k,0],[0,k],[0,-k],[k*.7,k*.7],[-k*.7,k*.7],[k*.7,-k*.7],[-k*.7,-k*.7]])g.drawImage(AN_OFF2,dx,dy);g.drawImage(AN_OFF,0,0)}
function anRadial(g,w,h,cx,cy,col,n,t){g.save();g.fillStyle=col;for(let i=0;i<n;i++){const a=i/n*Math.PI*2+t*.15,wd=.012+anR(i)*.02,r0=Math.min(w,h)*(.18+anR(i+9)*.12),r1=Math.max(w,h)*1.4;g.beginPath();g.moveTo(cx+Math.cos(a-wd)*r0,cy+Math.sin(a-wd)*r0);g.lineTo(cx+Math.cos(a)*r1,cy+Math.sin(a)*r1);g.lineTo(cx+Math.cos(a+wd)*r0,cy+Math.sin(a+wd)*r0);g.fill()}g.restore()}
function anSpeed(g,w,h,t,dir,col){g.save();g.strokeStyle=col;for(let i=0;i<46;i++){const y=anR(i)*h,len=w*(.2+anR(i+3)*.5),x=((anR(i+7)*w*2+t*w*2.4*dir)%(w*2)+w*2)%(w*2)-w*.5;g.lineWidth=1+anR(i+5)*4;g.beginPath();g.moveTo(x,y);g.lineTo(x-len*dir,y);g.stroke()}g.restore()}
function anLeaves(g,w,h,t,cols,n){for(let i=0;i<(n||26);i++){const s=6+anR(i)*12,x=(anR(i+1)*w+Math.sin(t*1.3+i)*40+t*30)%(w+40)-20,y=((anR(i+2)*h+t*(60+anR(i+3)*90))%(h+40))-20;g.save();g.translate(x,y);g.rotate(t*2+i);g.fillStyle=cols[i%cols.length];g.beginPath();for(let k=0;k<5;k++){const a=k/5*Math.PI*2;g.lineTo(Math.cos(a)*s,Math.sin(a)*s);g.lineTo(Math.cos(a+.6)*s*.45,Math.sin(a+.6)*s*.45)}g.fill();g.restore()}}
function anBrush(g,txt,x,y,size,col,k,stroke){g.save();g.translate(x,y);const s=k<1?1+(1-k)*2.2:1;g.scale(s,s);g.globalAlpha=Math.min(1,k*1.6);g.font=`${size}px 'Yuji Syuku','Hiragino Mincho ProN','Noto Serif JP',serif`;g.textAlign='center';g.textBaseline='middle';if(stroke){g.lineWidth=size*.12;g.strokeStyle=stroke;g.lineJoin='round';g.strokeText(txt,0,0)}g.fillStyle=col;g.fillText(txt,0,0);g.restore()}
function anText(g,txt,x,y,size,col,a){g.save();g.globalAlpha=a==null?1:a;g.font=`700 ${size}px system-ui,-apple-system,sans-serif`;g.textAlign='center';g.textBaseline='middle';g.lineWidth=size*.22;g.strokeStyle='#000';g.lineJoin='round';g.strokeText(txt,x,y);g.fillStyle=col;g.fillText(txt,x,y);g.restore()}
function anGrain(g,w,h,t){g.save();g.globalAlpha=.07;for(let i=0;i<160;i++){g.fillStyle=i%2?'#fff':'#000';g.fillRect(anR(i+t*97|0)*w,anR(i*3+t*53|0)*h,2,2)}g.restore()}
function anBars(g,w,h,k){const b=h*.085*k;g.fillStyle='#000';g.fillRect(0,0,w,b);g.fillRect(0,h-b,w,b)}
/* the player: a full-screen canvas, scene after scene, tap to skip */
function anPlay(scenes,opt){opt=opt||{};if(AN.busy)return Promise.resolve();AN.busy=true;return new Promise(res=>{const cv=document.createElement('canvas');cv.id='anCine';cv.style.cssText='position:fixed;inset:0;width:100vw;height:100dvh;z-index:99990;background:#000;touch-action:none;cursor:pointer';document.body.append(cv);
 const dpr=Math.min(2,window.devicePixelRatio||1);const size=()=>{cv.width=Math.round(innerWidth*dpr);cv.height=Math.round(innerHeight*dpr)};size();const g=cv.getContext('2d');
 const skip=document.createElement('button');skip.type='button';skip.textContent=TX('דלג ⏭','Skip ⏭');skip.style.cssText='position:fixed;z-index:99991;bottom:calc(14px + env(safe-area-inset-bottom));inset-inline-end:14px;padding:8px 14px;border-radius:20px;border:1px solid rgba(255,255,255,.5);background:rgba(0,0,0,.55);color:#fff;font:600 14px system-ui';document.body.append(skip);
 const total=scenes.reduce((a,s)=>a+s.d,0),t0=performance.now();let done=false,shake=0,fired=new Set();
 const end=()=>{if(done)return;done=true;cv.remove();skip.remove();AN.busy=false;removeEventListener('resize',size);res()};
 cv.onclick=end;skip.onclick=e=>{e.stopPropagation();end()};addEventListener('resize',size);
 const loop=now=>{if(done)return;const T=(now-t0)/1000;if(T>=total){end();return}const w=cv.width,h=cv.height;let acc=0,i=0;while(i<scenes.length-1&&T>acc+scenes[i].d){acc+=scenes[i].d;i++}const sc=scenes[i],t=T-acc,k=Math.min(1,t/sc.d);
  if(sc.sfx&&!fired.has(i)&&t>=(sc.sfxAt||0)){fired.add(i);try{sfx(sc.sfx)}catch(e){}if(sc.shake)shake=sc.shake}
  g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';g.fillStyle='#000';g.fillRect(0,0,w,h);
  if(shake>0){g.translate((Math.random()-.5)*shake*dpr,(Math.random()-.5)*shake*dpr);shake*=.86;if(shake<.4)shake=0}
  try{sc.draw(g,w,h,t,k,T,dpr)}catch(e){}g.setTransform(1,0,0,1,0,0);anBars(g,w,h,1);anGrain(g,w,h,T);
  if(sc.flash&&t<.12){g.fillStyle=`rgba(255,255,255,${1-t/.12})`;g.fillRect(0,0,w,h)}requestAnimationFrame(loop)};requestAnimationFrame(loop)})}
/* ---------- the VS cut-in before a great duel ---------- */
function anVS(foeSrc,label){const fastK=(autoOn&&autoOn()&&((S&&S.autoSpeed)||1)>1)?.55:1;const me=anPlayerFig(),foe=anFig(foeSrc,false);if(!foe)return Promise.resolve();const nm=String(foeSrc.name||'').slice(0,22),mine=String((S&&S.name)||'').slice(0,22),title=label||'決闘';
 const close=(g,w,h,f,t,face,bg1,bg2,lines,fromRight)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,bg1);gr.addColorStop(1,bg2);g.fillStyle=gr;g.fillRect(0,0,w,h);const u=Math.min(w,h/1.3);
  anRadial(g,w,h,w*.5,h*.42,lines,48,t);const sc=u/150,slide=Math.max(0,1-t*3.2),x=w*.5+(fromRight?1:-1)*slide*w,y=h*.42+176*sc;let por=null;try{por=typeof artPortrait==='function'?artPortrait(f):null}catch(e){}
  if(por){const im=por.img,s2=Math.max(w,h*.78)/im.naturalWidth*(1+t*.06),dw=im.naturalWidth*s2,dh=im.naturalHeight*s2,px=(w-dw)/2+(fromRight?1:-1)*slide*w,py=h*.08;g.save();g.beginPath();g.rect(0,h*.06,w,h*.82);g.clip();if(face<0&&por.keyed){g.translate(px*2+dw,0);g.scale(-1,1)}g.drawImage(im,px,py,dw,dh);g.restore();if(!por.keyed){g.strokeStyle='#000';g.lineWidth=Math.max(4,w*.01);g.strokeRect(px,py,dw,dh)}}else anDraw(g,f,x,y,sc,POSES.windup,t,face)};
 return anPlay([
  {d:1.05*fastK,sfx:'banner',draw:(g,w,h,t,k)=>{close(g,w,h,foe,t,-1,'#7a0a10','#d01c1c','rgba(0,0,0,.55)',true);anLeaves(g,w,h,t,['#ff7a1a','#ffb030','#c8321e'],18);anBrush(g,(foeSrc.yokai||foeSrc.tier==='boss')?'鬼':'敵',w*.2,h*.2,Math.min(w,h)*.2,'#fff3d6',Math.min(1,t*3),'#000');anText(g,nm,w*.5,h*.8,Math.min(w,h)*.075,'#ffd25a',Math.min(1,t*3));if(t>.55&&t<.75){g.fillStyle='rgba(255,255,255,.9)';const ex=w*.5,ey=h*.3;g.beginPath();g.moveTo(ex-w*.3,ey);g.lineTo(ex,ey-6);g.lineTo(ex+w*.3,ey);g.lineTo(ex,ey+6);g.fill()}}},
  {d:.95*fastK,sfx:'swish',draw:(g,w,h,t)=>{close(g,w,h,me,t,1,'#0a1a4a','#2a4ab0','rgba(255,255,255,.35)',false);anSpeed(g,w,h,t,1,'rgba(255,255,255,.55)');anBrush(g,'我',w*.8,h*.2,Math.min(w,h)*.2,'#fff3d6',Math.min(1,t*3),'#000');anText(g,mine,w*.5,h*.8,Math.min(w,h)*.075,'#9fd0ff',Math.min(1,t*3))}},
  {d:1.5*fastK,sfx:'gong',sfxAt:.15,shake:18,flash:1,draw:(g,w,h,t,k)=>{const u=Math.min(w,h/1.3),sc=u/250;
   g.save();g.beginPath();g.moveTo(0,0);g.lineTo(w,0);g.lineTo(0,h);g.closePath();g.clip();let gr=g.createLinearGradient(0,0,w,h);gr.addColorStop(0,'#0a1a4a');gr.addColorStop(1,'#2a4ab0');g.fillStyle=gr;g.fillRect(0,0,w,h);anSpeed(g,w,h,t,1,'rgba(255,255,255,.4)');anDraw(g,me,w*.27,h*.58,sc,POSES.strike,t,1);g.restore();
   g.save();g.beginPath();g.moveTo(w,0);g.lineTo(w,h);g.lineTo(0,h);g.closePath();g.clip();gr=g.createLinearGradient(0,0,w,h);gr.addColorStop(0,'#7a0a10');gr.addColorStop(1,'#d01c1c');g.fillStyle=gr;g.fillRect(0,0,w,h);anSpeed(g,w,h,t,-1,'rgba(0,0,0,.35)');anDraw(g,foe,w*.73,h*.97,sc,POSES.strike,t,-1);g.restore();
   g.strokeStyle='#fff';g.lineWidth=Math.max(4,w*.012);g.beginPath();const p=Math.min(1,t*4);g.moveTo(w,0);g.lineTo(w-w*p,h*p);g.stroke();
   anBrush(g,title,w*.5,h*.5,Math.min(w,h)*.26,'#fff',Math.min(1,t*2.4),'#000');anLeaves(g,w,h,t+3,['#ffb030','#ff7a1a'],14)}}
 ])}
/* ---------- the opening film on the title screen ---------- */
function anOpening(){const hi=(S&&S.hero!=null)?S.hero:0,A=anHeroFig(hi),B=anHeroFig((hi+3)%HEROES.length);
 return anPlay([
  {d:2.6,sfx:'banner',draw:(g,w,h,t,k)=>{let gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#2a0e3a');gr.addColorStop(.55,'#d8502a');gr.addColorStop(1,'#ffb050');g.fillStyle=gr;g.fillRect(0,0,w,h);
   g.fillStyle='rgba(255,230,160,.95)';g.beginPath();g.arc(w*.5,h*(.5-k*.04),Math.min(w,h)*.22,0,7);g.fill();
   const tw=Math.min(w*.8,h*.5),tx=w*.5,ty=h*.62;g.fillStyle='#1a0a10';g.fillRect(tx-tw*.36,ty-tw*.55,tw*.07,tw*.75);g.fillRect(tx+tw*.29,ty-tw*.55,tw*.07,tw*.75);g.fillRect(tx-tw*.5,ty-tw*.58,tw,tw*.07);g.beginPath();g.moveTo(tx-tw*.56,ty-tw*.6);g.quadraticCurveTo(tx,ty-tw*.66,tx+tw*.56,ty-tw*.6);g.lineTo(tx+tw*.5,ty-tw*.52);g.lineTo(tx-tw*.5,ty-tw*.52);g.fill();g.fillRect(tx-tw*.42,ty-tw*.42,tw*.84,tw*.045);
   g.fillStyle='#120608';g.fillRect(0,h*.8,w,h*.2);anLeaves(g,w,h,t,['#ff6a1a','#ffa030','#c8321e','#ffd060'],30);
   anBrush(g,'戦国',w*.5,h*.2,Math.min(w,h)*.16,'#fff3d6',Math.min(1,t*1.2),'#000');anText(g,TX('יפן, 1560. עידן המדינות הלוחמות.','Japan, 1560. The age of warring states.'),w*.5,h*.33,Math.min(w,h)*.045,'#fff3d6',Math.min(1,Math.max(0,t-.6)*2))}},
  {d:1.8,sfx:'swish',draw:(g,w,h,t,k)=>{g.fillStyle='#120608';g.fillRect(0,0,w,h);anRadial(g,w,h,w*.5,h*.4,'rgba(200,40,30,.55)',40,t);const u=Math.min(w,h/1.2),sc=u/62*(1+k*.08);let por=null;try{por=typeof artPortrait==='function'?artPortrait(A):null}catch(e){}if(por){const im=por.img,s2=Math.max(w,h*.8)/im.naturalWidth*(1.05+k*.12),dw=im.naturalWidth*s2,dh=im.naturalHeight*s2;g.drawImage(im,(w-dw)/2,(h-dh)/2,dw,dh)}else anDraw(g,A,w*.52,h*.42+176*sc,sc,POSES.idle,t,1);
   if(t>1.1&&t<1.45){g.fillStyle='#fff';const ex=w*.6,ey=h*.42;g.beginPath();g.moveTo(ex-w*.2,ey);g.lineTo(ex,ey-5);g.lineTo(ex+w*.2,ey);g.lineTo(ex,ey+5);g.fill()}}},
  {d:1.3,sfx:'clang',sfxAt:.5,draw:(g,w,h,t,k)=>{g.fillStyle='#000';g.fillRect(0,0,w,h);const y=h*.5,x=-w*.6+k*w*1.5;let gr=g.createLinearGradient(x-w*.6,0,x,0);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(1,'#e8f0ff');g.fillStyle=gr;g.beginPath();g.moveTo(x-w*.7,y-3);g.lineTo(x,y-7);g.lineTo(x+w*.05,y);g.lineTo(x,y+3);g.lineTo(x-w*.7,y+3);g.fill();
   g.fillStyle='#c8a050';g.fillRect(x-w*.74,y-14,10,28);if(k>.45){const s=(k-.45)*1.8;g.fillStyle='#fff8d0';g.save();g.translate(w*.5,y);g.rotate(t*3);for(let i=0;i<4;i++){g.rotate(Math.PI/2);g.beginPath();g.moveTo(0,0);g.lineTo(6,-6);g.lineTo(0,-Math.min(w,h)*.18*(1-Math.abs(s-.5)));g.lineTo(-6,-6);g.fill()}g.restore()}}},
  {d:1.6,sfx:'big',draw:(g,w,h,t,k)=>{let gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#1a2a6a');gr.addColorStop(1,'#6a2a6a');g.fillStyle=gr;g.fillRect(0,0,w,h);anSpeed(g,w,h,t,1,'rgba(255,255,255,.45)');const u=Math.min(w,h/1.25),sc=u/260,y=h*.72;
   for(let i=3;i>0;i--){g.globalAlpha=.15*(4-i);anDraw(g,A,w*(.05+k*.38)-i*w*.06,y,sc,POSES.strike,t,1);anDraw(g,B,w*(.95-k*.38)+i*w*.06,y,sc,POSES.strike,t,-1)}g.globalAlpha=1;anDraw(g,A,w*(.05+k*.38),y,sc,POSES.strike,t,1);anDraw(g,B,w*(.95-k*.38),y,sc,POSES.strike,t,-1)}},
  {d:1.1,sfx:'ko',shake:22,flash:1,draw:(g,w,h,t,k)=>{g.fillStyle='#fff';g.fillRect(0,0,w,h);anRadial(g,w,h,w*.5,h*.5,'#000',56,t);g.fillStyle='#c8321e';g.beginPath();g.arc(w*.5,h*.5,Math.min(w,h)*.12*(1+k),0,7);g.fill();for(let i=0;i<30;i++){const a=anR(i)*7,r=Math.min(w,h)*(.1+k*.5*anR(i+2));g.fillStyle=i%2?'#ffb030':'#fff3a0';g.fillRect(w*.5+Math.cos(a)*r,h*.5+Math.sin(a)*r,5,5)}}},
  {d:2.6,sfx:'gong',sfxAt:.25,shake:10,draw:(g,w,h,t,k)=>{g.fillStyle='#f3ead6';g.fillRect(0,0,w,h);g.fillStyle='#0a0608';for(let i=0;i<9;i++){const r=Math.min(w,h)*(.07+anR(i)*.12)*Math.min(1,t*2.5),c=i%4,x=w*(c%2?.86:.14)+(anR(i+4)-.5)*w*.2,y=h*(c<2?.16:.9)+(anR(i+8)-.5)*h*.12;g.beginPath();g.arc(x,y,r,0,7);g.fill()}
   g.fillStyle='#c8321e';g.beginPath();g.arc(w*.5,h*.42,Math.min(w,h)*.26,0,7);g.fill();anBrush(g,'武士道',w*.5,h*.42,Math.min(w,h)*.2,'#fff3d6',Math.min(1,Math.max(0,t-.2)*2.2),'#0a0608');
   anText(g,TX('בושידו','Bushido'),w*.5,h*.66,Math.min(w,h)*.09,'#c8321e',Math.min(1,Math.max(0,t-.7)*2));anText(g,TX('הדרך של הלוחם מתחילה עכשיו','The way of the warrior begins now'),w*.5,h*.74,Math.min(w,h)*.042,'#2a1a10',Math.min(1,Math.max(0,t-1.1)*2))}}
 ])}
/* the cut-in plays before every great duel; lesser fights get it now and then */
{const o=startFight;startFight=function(ctx){try{const fd=ctx&&ctx.fd;if(fd&&!ctx.def&&!AN.busy&&!(S&&S.anOff)){const big=fd.tier==='boss'||fd.yokai||ctx.kind==='rank'||ctx.kind==='plot'||ctx.kind==='muhon'||(S&&S.progress%4===3&&ctx.kind==='ladder');AN.n++;
  const fast=autoOn&&autoOn()&&((S&&S.autoSpeed)||1)>1;if(big||(Date.now()-AN.last>(fast?180000:90000)&&AN.n%3===1)){AN.last=Date.now();anVS(fd,ctx.kind==='rank'?'国盗':ctx.kind==='muhon'?'謀反':fd.tier==='boss'?'決戦':'決闘')}}}catch(e){}return o.apply(this,arguments)}}
/* the opening film: once on the first visit, and any time from the title screen */
function anTitleBtn(){try{const host=$('#scr-title');if(!host||document.getElementById('anOpBtn'))return;const b=document.createElement('button');b.id='anOpBtn';b.type='button';b.className='btn ghost wide';b.innerHTML=`🎬 <span class="kanji">予告</span> ${TX('צפה בפתיח','Watch the opening')}`;b.onclick=()=>{try{anOpening()}catch(e){}};const ref=$('#btnNew');(ref&&ref.parentNode?ref.parentNode:host).insertBefore(b,ref?ref.nextSibling:null)}catch(e){}}
setTimeout(anTitleBtn,1200);
{let tries=0;const iv=setInterval(()=>{try{if(++tries>200){clearInterval(iv);return}if(LSget('bushido-op2',0)||navigator.webdriver){clearInterval(iv);return}
 const onTitle=!$('#scr-title').hidden,onHub=!$('#scr-hub').hidden&&$('#overlay').hidden&&!document.querySelector('.x50ov,.v40ov');if((onTitle||onHub)&&!AN.busy){clearInterval(iv);LSset('bushido-op2',1);anOpening()}}catch(e){}},1500)}
if(false)window.__an={anVS,anOpening,anPlay};
