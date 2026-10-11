/* ================= 絵 illustrated warriors =================
   Hand-illustrated 16-bit arcade sprites replace the drawn warriors where art exists: breathing in the stance,
   raising the blades, the full cut with its arc, the guard, the stagger of a hit, the fall. They are drawn at full
   screen resolution above the pixel world, and the anime portraits take over the close-ups of the cinematics. */
const ART={};
try{for(const id in ART_DATA){ART[id]={};for(const k in ART_DATA[id]){const d=ART_DATA[id][k];if(k[0]==='_'){ART[id][k]=d;continue}ART[id][k]={d,img:null,ax:d.ax||.5,w:d.w||1,h:d.h||1,hs:d.hs||1,keyed:!!d.keyed}}}}catch(e){}
/* art loads only when a warrior who needs it appears, so the game stays light on phones */
function artLoad(id){const A=ART[id];if(!A||A._loaded)return;A._loaded=1;for(const k in A){const a=A[k];if(!a||typeof a!=='object'||!a.d)continue;const im=new Image();im.decoding='async';im.onload=()=>{try{if(S&&!$('#scr-hub').hidden&&$('#overlay').hidden)renderHub()}catch(e){}};im.src=a.d.src;a.img=im}}
const artReady=(id,k)=>{artLoad(id);const a=ART[id]&&ART[id][k];return a&&a.img&&a.img.complete&&a.img.naturalWidth>0?a:null};
setTimeout(()=>{try{if(S&&HEROES[S.hero])artLoad(HEROES[S.hero].id)}catch(e){}},400);
function artAnyId(f){try{if(!f||(S&&S.artOff)||INKM)return null;if(f.artId)return ART[f.artId]?f.artId:null;if(f.isPlayer&&S&&HEROES[S.hero]){const id=HEROES[S.hero].id;return ART[id]?id:null}}catch(e){}return null}
function artIdOf(f){const id=artAnyId(f);return id&&ART[id]&&ART[id].idle?id:null}
const LADDER_ART=['ronin','kappa','ronin2','tengu','yukionna','jorogumo','kitsune','oni_red','guard','kenshin','shingen','nobunaga','raijin','fujin','oni_blue','shuten'];
{const o=makeFighter;makeFighter=function(src,isPlayer){const f=o.apply(this,arguments);try{if(src&&src.artId)f.artId=src.artId;else if(!isPlayer&&typeof LADDER!=='undefined'){const i=LADDER.findIndex(x=>x.n===src.name);const key=i>=0?LADDER_ART[i]:null;if(key&&ART[key]){f.artId=key;artLoad(key);return f}}if(src&&src.artId){}else if(!isPlayer||!S){const H=HEROES.find(h=>h.name===src.name);if(H&&ART[H.id]){f.artId=H.id;artLoad(H.id)}}}catch(e){}return f}}
/* which drawing the pose is closest to */
const ART_GROUPS={idle:['idle','walkA','walkB'],wind:['windup','pWind','qWind'],strike:['strike','pStrike','qStrike','p45smash','p45spin','p45thrust'],block:['block'],hit:['hit']};
const ART_K=['lean','crouch','fu','fl','sw','ff','bf'];
function artPose(f,p){if(f.dead)return'down';if(f.flash>.18)return'hit';let best='idle',bd=1e9;for(const g in ART_GROUPS)for(const n of ART_GROUPS[g]){const q=POSES[n];if(!q)continue;let d=0;for(const k of ART_K){const v=(p[k]||0)-(q[k]||0);d+=v*v}if(d<bd){bd=d;best=g}}return best}
const ART_IMG={idle:'idle',wind:'blk',strike:'atk',block:'blk',hit:'idle',down:'idle'};
const ART_BLACK=new Map();
function artBlack(a){let c=ART_BLACK.get(a);if(c)return c;c=mkCanvas(a.img.naturalWidth,a.img.naturalHeight);const g=c.getContext('2d');g.drawImage(a.img,0,0);g.globalCompositeOperation='source-in';g.fillStyle='#0a0406';g.fillRect(0,0,c.width,c.height);ART_BLACK.set(a,c);return c}
const ART_WHITE=new Map();
function artWhite(a){let c=ART_WHITE.get(a);if(c)return c;c=mkCanvas(a.img.naturalWidth,a.img.naturalHeight);const g=c.getContext('2d');g.drawImage(a.img,0,0);g.globalCompositeOperation='source-in';g.fillStyle='#fff';g.fillRect(0,0,c.width,c.height);ART_WHITE.set(a,c);return c}
function artDims(f,sc,p,id,maxH){const cls=artPose(f,p);const a=artReady(id,ART_IMG[cls])||artReady(id,'idle');if(!a)return null;
 const bulk=clamp(1+((f.look&&f.look.build||1)-1)*.35,.9,1.15);let Ht=190*sc*(a.hs||1)*((ART[id]&&ART[id]._sc)||1);if(maxH&&Ht>maxH*(a.hs||1))Ht=maxH*(a.hs||1);
 const Wd=Ht*a.img.naturalWidth/a.img.naturalHeight*bulk,face=f.facing||1;return{cls,a,Ht,Wd,face,L:face>0?a.ax*Wd:(1-a.ax)*Wd,R:face>0?(1-a.ax)*Wd:a.ax*Wd}}
function artDraw(g,f,ox,oy,sc,t,p,id,maxH,shift){const cls=artPose(f,p);const a=artReady(id,ART_IMG[cls])||artReady(id,'idle');if(!a)return false;ox+=shift||0;
 /* height comes from the art itself; the body type only widens or narrows the frame a little, as it does for the drawn warriors */
 const bulk=clamp(1+((f.look&&f.look.build||1)-1)*.35,.9,1.15);let Ht=190*sc*(a.hs||1)*((ART[id]&&ART[id]._sc)||1);if(maxH&&Ht>maxH*(a.hs||1))Ht=maxH*(a.hs||1);
 const Wd=Ht*a.img.naturalWidth/a.img.naturalHeight*bulk,face=f.facing||1;
 if(f._artCls!==cls){f._artCls=cls;f._artT=t}const since=t-(f._artT||t);
 g.save();g.translate(ox,oy);g.scale(face,1);if(p.fall)g.rotate(p.fall*D2R);
 let rot=0,dx=0,sy=1,sx=1;
 if(cls==='idle'){sy=1+Math.sin(t*2.4+(f.phase||0))*.014;sx=1-Math.sin(t*2.4+(f.phase||0))*.006;rot=(p.lean||0)*.004}
 else if(cls==='wind'){rot=-.05;dx=-6*sc;sy=1.02}
 else if(cls==='strike'){const k=Math.min(1,since*6);rot=.06*(1-k*.5);dx=(14-k*4)*sc;sx=1.04;sy=.98}
 else if(cls==='block'){dx=-4*sc;sy=.99}
 else if(cls==='hit'){rot=-.14;dx=-14*sc;sx=.98}
 else if(cls==='down'){const k=Math.min(1,since*3);rot=-.2*k;dx=-16*sc*k;sy=1-.16*k;sx=1+.03*k}
 sy*=1-Math.max(0,(p.crouch||0))*.0012;
 g.translate(dx,0);g.rotate(rot);g.scale(sx,sy);g.imageSmoothingEnabled=false;
 g.drawImage(a.img,-a.ax*Wd,-Ht,Wd,Ht);
 if(f.flash>.04){g.globalAlpha=Math.min(.85,f.flash*1.4);g.drawImage(artWhite(a),-a.ax*Wd,-Ht,Wd,Ht);g.globalAlpha=1}
 if(cls==='down'){const ga=g.globalAlpha;g.globalAlpha=ga*Math.min(.45,since*.9);g.drawImage(artBlack(a),-a.ax*Wd,-Ht,Wd,Ht);g.globalAlpha=ga}
 if(cls==='strike'&&since<.22){const k=since/.22;let claw=false;try{claw=famOf(f.wk)==='claw'}catch(e){}g.globalAlpha=(1-k)*.85;g.lineCap='round';
  if(claw){for(let i=-1;i<=1;i++){g.strokeStyle='#fff';g.lineWidth=6*sc;g.beginPath();g.arc(Wd*.18,-Ht*(.5+i*.09),Ht*.3,-1.1+k*.5,.6+k*.8);g.stroke();g.strokeStyle='rgba(255,120,120,.85)';g.lineWidth=2.5*sc;g.stroke()}}
  else{g.strokeStyle='#fff';g.lineWidth=10*sc;g.beginPath();g.arc(Wd*.1,-Ht*.55,Ht*.42,-1.4+k*.6,.5+k*.9);g.stroke();g.strokeStyle='rgba(160,220,255,.9)';g.lineWidth=4*sc;g.stroke()}g.globalAlpha=1}
 g.restore();return true}
/* in the arena the warrior is drawn sharp, above the pixel world */
let ART_Q=[];
{const o=drawFighter;drawFighter=function(g,f,ox,oy,sc,T0,PO,ghost){const id=artIdOf(f);if(!id||f.riding||f.giant)return o.apply(this,arguments);
 const p={...(PO||f.pose)},t=T0==null?T:T0;
 if(typeof flg!=='undefined'&&g===flg&&!ghost){ART_Q.push({f,ox,oy,sc,t,p,id});return}
 if(ghost&&g.canvas&&g.canvas.width===LW&&g.canvas.height===LH)return;
 if(!artDraw(g,f,ox,oy,sc,t,p,id))return o.apply(this,arguments)}}
{const o=hud;hud=function(g){try{if(ART_Q.length&&typeof cv!=='undefined'){const asp=cv.width/cv.height;let vh=H/CAM.z,vw=vh*asp;if(vw>W){vw=W;vh=W/asp}const cx0=clamp(CAM.x-vw/2,0,W-vw),cy0=(H-vh)*.9,ks=cv.width/vw;
  let sx=0,sy=0;if(shake>0){const n=performance.now(),a=Math.min(shake,18)*.8;sx=a*(Math.sin(n*.075)*.62+Math.sin(n*.131+1.7)*.38);sy=a*.55*(Math.sin(n*.089+.6)*.6+Math.sin(n*.157+2.9)*.4)}
  g.save();g.setTransform(ks,0,0,ks,(-cx0+sx)*ks,(-cy0+sy)*ks);
  for(const q of ART_Q){const d=artDims(q.f,q.sc,q.p,q.id);let sh=0;if(d){const mn=cx0+6,mx=cx0+vw-6,l=q.ox-d.L,r=q.ox+d.R;if(l<mn)sh=mn-l;if(r+sh>mx)sh=(r-l>mx-mn)?((mn+mx)/2-(l+r)/2):mx-r}
   q.f._artSh=(q.f._artSh==null?sh:q.f._artSh+(sh-q.f._artSh)*.35);
   if(q.f.ghostOn&&q.f.ghosts&&q.f.ghosts.length){for(const gh of q.f.ghosts){const al=clamp(gh.life,0,1)*.28;if(al<=.02)continue;g.globalAlpha=al;artDraw(g,q.f,gh.x,q.oy,q.sc,gh.T,gh.pose,q.id,0,q.f._artSh)}g.globalAlpha=1}
   artDraw(g,q.f,q.ox,q.oy,q.sc,q.t,q.p,q.id,0,q.f._artSh)}
  g.restore()}}catch(e){}ART_Q=[];return o.apply(this,arguments)}}
/* the ground shadow follows the illustrated warrior */
{const o=drawShadow;drawShadow=function(g,f,ox,oy,sc){try{if(f&&f._artSh&&artIdOf(f)&&!f.riding)ox+=f._artSh}catch(e){}return o.call(this,g,f,ox,oy,sc)}}
/* the portrait in the hub, at full resolution */
{const o=previewFighter;previewFighter=function(cvs,f,bg1,bg2){const id=artIdOf(f);if(!id)return o.apply(this,arguments);try{cvs.lw=300;cvs.lh=260;
 pixelPaint(cvs,150,130,c=>{const gr=c.createLinearGradient(0,0,0,260);gr.addColorStop(0,bg1);gr.addColorStop(1,bg2);c.fillStyle=gr;c.fillRect(0,0,300,260);c.fillStyle='rgba(255,240,210,.1)';c.beginPath();c.arc(150,110,92,0,7);c.fill();c.fillStyle='rgba(0,0,0,.35)';c.fillRect(0,232,300,28);drawShadow(c,f,150,240,.95)});
 const tg=cvs.getContext('2d'),k=cvs.width/300;tg.save();tg.setTransform(k,0,0,k,0,0);artDraw(tg,f,f.facing>0?140:160,244,.95,(performance.now()/1000),POSES.idle,id,214);tg.restore()}catch(e){return o.apply(this,arguments)}}}
/* the cinematics use the anime portrait for the close-ups */
function artPortrait(f){const id=artAnyId(f);return id&&ART[id].por?artReady(id,'por'):null}
/* the small portraits everywhere (HUD, hero list, level-ups, boards) become the illustrated faces */
const ART_PCACHE={};
function artPorId(look,key){try{if(S&&S.artOff||INKM)return null;const k=String(key==null?'':key);for(const H of HEROES)if((H.id===k||'lvl'+HEROES.indexOf(H)===k)&&ART[H.id]&&ART[H.id].por)return H.id;
 if(S&&HEROES[S.hero]&&(k===S.name||k==='lvl'+S.hero)&&ART[HEROES[S.hero].id]&&ART[HEROES[S.hero].id].por)return HEROES[S.hero].id;
 if(typeof LADDER!=='undefined'){const i=LADDER.findIndex(x=>x.n===k);const id=i>=0?LADDER_ART[i]:null;if(id&&ART[id]&&ART[id].por)return id}}catch(e){}return null}
{const o=portrait;portrait=function(look,key){const id=artPorId(look,key),a=id?artReady(id,'por'):null;if(!a)return o.apply(this,arguments);
 if(ART_PCACHE[id])return ART_PCACHE[id];const N=128,c=mkCanvas(N,N),g=c.getContext('2d'),im=a.img,iw=im.naturalWidth,ih=im.naturalHeight;
 if(a.keyed){const gr=g.createRadialGradient(N/2,N*.45,4,N/2,N/2,N*.7);gr.addColorStop(0,'#8a1a14');gr.addColorStop(1,'#1a0606');g.fillStyle=gr;g.fillRect(0,0,N,N)}
 const side=Math.min(iw,ih)*.78,sx=(iw-side)/2+(ART[id]._px||0)*iw,sy=ih*.06+(ART[id]._py||0)*ih;g.imageSmoothingEnabled=true;g.drawImage(im,sx,sy,side,side,0,0,N,N);ART_PCACHE[id]=c;return c}}
{const o=renderTitle;renderTitle=function(){try{if(!titleA||!titleB||INKM)return o.apply(this,arguments);titleA.artId=titleA.artId||'musashi';titleB.artId=titleB.artId||'ronin2';titleB.facing=-1;titleA.facing=1;
 if(!artReady('musashi','idle')||!artReady('ronin2','idle'))return o.apply(this,arguments);const cvs=$('#cvTitle');cvs.lw=600;cvs.lh=340;
 pixelPaint(cvs,300,170,c=>{c.imageSmoothingEnabled=false;c.drawImage(getBG(2),0,0,600,375);c.fillStyle='rgba(20,5,10,.25)';c.fillRect(0,0,600,340);drawShadow(c,titleA,215,322,1);drawShadow(c,titleB,385,322,1)},10);
 const tg=cvs.getContext('2d'),k=cvs.width/600,ph=T%5.2,pa=ph<3.7?POSES.idle:ph<4.15?POSES.windup:ph<4.75?POSES.strike:POSES.idle,pb=ph<3.7?POSES.idle:ph<4.15?POSES.windup:ph<4.75?POSES.strike:POSES.idle;
 tg.save();tg.setTransform(k,0,0,k,0,0);const dx=ph>=4.15&&ph<4.75?14:0;artDraw(tg,titleA,215+dx,326,1,T,pa,'musashi',0);artDraw(tg,titleB,385-dx,326,1,T+.7,pb,'ronin2',0);
 if(ph>=4.2&&ph<4.6){const q=(ph-4.2)/.4;tg.globalCompositeOperation='lighter';tg.globalAlpha=1-q;tg.fillStyle='#fff3c0';tg.translate(300,205);tg.rotate(q*2);for(let i=0;i<4;i++){tg.rotate(Math.PI/2);tg.beginPath();tg.moveTo(0,0);tg.lineTo(5,-5);tg.lineTo(0,-70*(1-Math.abs(q-.3)));tg.lineTo(-5,-5);tg.fill()}}
 tg.restore();tg.save();tg.setTransform(k,0,0,k,0,0);for(let i=0;i<12;i++){tg.fillStyle='rgba(255,200,220,.9)';const x=(i*97+T*30)%600,y=(i*53+T*40)%340;tg.fillRect(x,y,4,3)}tg.restore()}catch(e){return o.apply(this,arguments)}}}
setTimeout(()=>{try{artLoad('musashi');artLoad('ronin2')}catch(e){}},300);
if(false)window.__art={ART,artIdOf,artPose,startFight:c=>startFight(c),foeData:i=>foeData(i),show:k=>show(k),renderHub:()=>renderHub(),armory:()=>{try{renderArmory();show('armory')}catch(e){}},sheet:()=>{try{return heroSheet()}catch(e){return String(e)}},get CUR(){return CUR},get P(){return P},get E(){return E},get CAM(){return CAM},cvs:()=>{const c=document.querySelector('#cvArena');return[c.width,c.height,c.clientWidth,c.clientHeight]},bg:k=>{try{return getBG(k).toDataURL()}catch(e){return String(e)}},endFight:w=>endFight(w)};
