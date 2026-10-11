/* ================= 16-bit arcade look =================
   Fighters get the shading of the classic arcade fighting games: a dark outline around every sprite,
   a rim of light from the upper left, a shadowed lower-right edge and richer colours. A new arena,
   the cedar forest, is painted in the same dense, dithered style. All characters stay the game's own. */
function arcadeShade(ctx,W0,H0){try{const full=ctx.getImageData(0,0,W0,H0).data;let x0=W0,x1=-1,y0=H0,y1=-1;
 for(let y=0;y<H0;y+=2){const r=y*W0*4;for(let x=0;x<W0;x+=2)if(full[r+x*4+3]){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}}
 if(x1<0)return;x0=Math.max(0,x0-4);y0=Math.max(0,y0-4);x1=Math.min(W0-1,x1+4);y1=Math.min(H0-1,y1+4);const w=x1-x0+1,h=y1-y0+1;
 const id=ctx.getImageData(x0,y0,w,h),d=id.data,N=w*h,A=new Uint8Array(N);for(let i=0;i<N;i++)A[i]=d[i*4+3]>0?1:0;
 const o=new Uint8ClampedArray(d);
 const F=new Float32Array(N).fill(1);
 for(let y=0;y<h;y++){let x=0;const yw=y*w;while(x<w){if(!A[yw+x]){x++;continue}let e=x;while(e<w&&A[yw+e])e++;const L=e-x;if(L>=5)for(let k=x;k<e;k++){const t=(k-x)/(L-1);F[yw+k]=t<.2?1.13:t<.32?1.05:t>.8?.78:t>.66?.88:1}x=e}}
 for(let x=0;x<w;x++){let y=0;while(y<h){if(!A[y*w+x]){y++;continue}let e=y;while(e<h&&A[e*w+x])e++;const L=e-y;if(L>=6)for(let k=y;k<e;k++){const t=(k-y)/(L-1);F[k*w+x]*=t<.15?1.08:t>.85?.86:1}y=e}}
 for(let y=0;y<h;y++){const yw=y*w;for(let x=0;x<w;x++){const i=yw+x,p=i*4;
  if(A[i]){let r=d[p],g=d[p+1],b=d[p+2];const l=r*.3+g*.59+b*.11,f=F[i];r=(l+(r-l)*1.22)*f;g=(l+(g-l)*1.22)*f;b=(l+(b-l)*1.22)*f;
   const up=y>0&&A[i-w],lf=x>0&&A[i-1],dn=y<h-1&&A[i+w],rt=x<w-1&&A[i+1],ul=y>0&&x>0&&A[i-w-1];
   if(!up||!lf||!ul){r+=(255-r)*.34;g+=(255-g)*.34;b+=(255-b)*.30}
   else if(!dn||!rt){r*=.66;g*=.66;b*=.74}
   else if(y>1&&!A[i-2*w]){r+=(255-r)*.15;g+=(255-g)*.15;b+=(255-b)*.13}
   else if(y<h-2&&!A[i+2*w]){r*=.84;g*=.84;b*=.88}
   o[p]=r;o[p+1]=g;o[p+2]=b;o[p+3]=255}
  else{let j=-1;if(y>0&&A[i-w])j=i-w;else if(x>0&&A[i-1])j=i-1;else if(x<w-1&&A[i+1])j=i+1;else if(y<h-1&&A[i+w])j=i+w;
   if(j>=0){const q=j*4;o[p]=d[q]*.18+6;o[p+1]=d[q+1]*.16+4;o[p+2]=d[q+2]*.2+10;o[p+3]=255}}}}
 id.data.set(o);ctx.putImageData(id,x0,y0)}catch(e){}}
let ARC_MS=0,ARC_N=0,ARC_SLOW=false;
{const oq=quant;quant=function(ctx,w,h,levels,ath,amp){let r;try{r=oq.apply(this,arguments)}catch(e){return}try{if(ath===110&&amp===.25&&!INKM&&!ARC_SLOW){const t=performance.now();arcadeShade(ctx,w,h);ARC_MS=ARC_MS*.95+(performance.now()-t)*.05;if(++ARC_N>120&&ARC_MS>14)ARC_SLOW=true}}catch(e){}return r}}
/* ---------- the cedar forest arena ---------- */
function paintForest(){const c=mkCanvas(W,H),g=c.getContext('2d'),R=rng(4242);
 let gr=g.createLinearGradient(0,0,0,380);gr.addColorStop(0,'#2c2a6a');gr.addColorStop(.5,'#4a3f8a');gr.addColorStop(1,'#6a5a9a');g.fillStyle=gr;g.fillRect(0,0,W,H);
 // far trunks, cool and hazy
 for(let i=0;i<16;i++){const x=R()*W,w=10+R()*18;g.fillStyle=i%2?'#3a3478':'#2f2a68';g.fillRect(x,0,w,380);g.fillStyle='rgba(120,110,190,.35)';g.fillRect(x+2,0,2,380)}
 // far canopy
 for(let i=0;i<70;i++){const x=R()*W,y=R()*150,r=18+R()*34;g.fillStyle=['#2d4a5a','#35566a','#24404f'][i%3];g.beginPath();g.ellipse(x,y,r*1.4,r,0,0,7);g.fill()}
 // mid trunks
 for(let i=0;i<6;i++){const x=40+i*140+R()*60,w=26+R()*20;gr=g.createLinearGradient(x,0,x+w,0);gr.addColorStop(0,'#5a3a4a');gr.addColorStop(.5,'#7a5260');gr.addColorStop(1,'#4a2e3c');g.fillStyle=gr;g.fillRect(x,0,w,370);
  g.strokeStyle='rgba(30,15,25,.45)';g.lineWidth=2;for(let k=0;k<14;k++){const yy=R()*360;g.beginPath();g.moveTo(x+3,yy);g.lineTo(x+w-3,yy+R()*10-5);g.stroke()}}
 // golden undergrowth, dense dithered leaves
 const leaf=(cx,cy,rad,cols)=>{for(let k=0;k<rad*5;k++){const a=R()*7,rr=Math.sqrt(R())*rad,x=cx+Math.cos(a)*rr*1.4,y=cy+Math.sin(a)*rr;g.fillStyle=cols[(k+((x+y)|0))%cols.length];g.fillRect(x|0,y|0,3+R()*3,2+R()*2)}};
 for(let i=0;i<12;i++){const x=R()*W,y=250+R()*90,r=40+R()*50;g.fillStyle='#4a4a1a';g.beginPath();g.ellipse(x,y,r*1.4,r,0,0,7);g.fill();leaf(x,y,r,['#c8a020','#e0c040','#8a7a18','#f0d860','#6a6a20'])}
 // big foreground cedar, right side
 {const x=560,w=120;gr=g.createLinearGradient(x,0,x+w,0);gr.addColorStop(0,'#8a5a40');gr.addColorStop(.35,'#c48a66');gr.addColorStop(.7,'#a06a4c');gr.addColorStop(1,'#5a3424');g.fillStyle=gr;g.fillRect(x,0,w,392);
  for(let k=0;k<60;k++){const yy=R()*390,xx=x+4+R()*(w-8);g.fillStyle=R()<.5?'rgba(70,35,20,.55)':'rgba(230,180,150,.35)';g.fillRect(xx,yy,2,10+R()*30)}
  g.fillStyle='#5a3424';g.beginPath();g.moveTo(x-30,396);g.quadraticCurveTo(x+10,370,x+20,360);g.lineTo(x+w-10,360);g.quadraticCurveTo(x+w+20,372,x+w+50,398);g.closePath();g.fill()}
 // left cedar, partly off screen
 {const x=-30,w=90;gr=g.createLinearGradient(x,0,x+w,0);gr.addColorStop(0,'#4a2a1e');gr.addColorStop(.6,'#9a6a4e');gr.addColorStop(1,'#5a3424');g.fillStyle=gr;g.fillRect(x,0,w,388)}
 // the clearing: warm dirt in bands
 gr=g.createLinearGradient(0,372,0,H);gr.addColorStop(0,'#9a6a40');gr.addColorStop(.4,'#c8905a');gr.addColorStop(1,'#a8743e');g.fillStyle=gr;g.beginPath();g.moveTo(0,H);g.lineTo(0,384);for(let x=0;x<=W;x+=16)g.lineTo(x,378+Math.sin(x*.02)*5);g.lineTo(W,H);g.closePath();g.fill();
 for(let i=0;i<26;i++){const y=392+R()*100,x=R()*W;g.fillStyle=R()<.5?'rgba(110,60,30,.45)':'rgba(230,180,120,.4)';g.beginPath();g.ellipse(x,y,40+R()*90,3+R()*4,0,0,7);g.fill()}
 for(let i=0;i<500;i++){g.fillStyle=R()<.5?'rgba(90,50,25,.5)':'rgba(240,200,140,.45)';g.fillRect(R()*W,386+R()*114,2,2)}
 // roots and fallen leaves
 g.strokeStyle='#6a3a24';g.lineWidth=7;for(let i=0;i<4;i++){g.beginPath();g.moveTo(560+i*30,390);g.quadraticCurveTo(540+i*40,410,500+i*60,420+i*6);g.stroke()}
 for(let i=0;i<60;i++){g.fillStyle=['#e0c040','#c8a020','#d07a30'][i%3];g.fillRect(R()*W,392+R()*104,3,2)}
 // light shafts through the canopy
 g.globalCompositeOperation='lighter';for(let i=0;i<4;i++){const x=120+i*170;gr=g.createLinearGradient(x,0,x+80,380);gr.addColorStop(0,'rgba(255,230,160,.16)');gr.addColorStop(1,'rgba(255,230,160,0)');g.fillStyle=gr;g.beginPath();g.moveTo(x,0);g.lineTo(x+40,0);g.lineTo(x+140,380);g.lineTo(x+70,380);g.closePath();g.fill()}g.globalCompositeOperation='source-over';
 const lowC=mkCanvas(LW,LH),lc=lowC.getContext('2d');lc.imageSmoothingEnabled=true;lc.drawImage(c,0,0,LW,LH);quant(lc,LW,LH,10,null);return lowC}
const ARC_FOREST=12;
{const o=paintBG;paintBG=function(kind){if(kind===ARC_FOREST){try{return paintForest()}catch(e){return o.call(this,1)}}return o.apply(this,arguments)}}
let ARC_PICK=null;
{const o=startFight;startFight=function(ctx){ARC_PICK=ctx||null;return o.apply(this,arguments)}}
{const o=initAmbient;initAmbient=function(kind){try{if(ARC_PICK&&CUR===ARC_PICK&&!INKM){ARC_PICK=null;const c=CUR||{};const ok=(c.kind==='ladder'&&(kind===0||kind===1)&&((S&&S.wins)|0)%2===1)||(c.kind==='hunt'&&kind===1&&!(c.fd&&c.fd.tier==='boss')&&Math.random()<.5);if(ok){arenaKind=ARC_FOREST;getBG(ARC_FOREST);return o.call(this,0)}}}catch(e){}return o.apply(this,arguments)}}
if(false)window.__arc={arcadeShade,paintForest,setForest:()=>{arenaKind=ARC_FOREST;getBG(ARC_FOREST)}};
/* the warrior portraits (hub, armory, hero sheet) get the same arcade inking */
{const o=previewFighter;previewFighter=function(cvs,f,bg1,bg2){if(INKM||ARC_SLOW)return o.apply(this,arguments);try{cvs.lw=300;cvs.lh=260;
 pixelPaint(cvs,150,130,c=>{const gr=c.createLinearGradient(0,0,0,260);gr.addColorStop(0,bg1);gr.addColorStop(1,bg2);c.fillStyle=gr;c.fillRect(0,0,300,260);c.fillStyle='rgba(255,240,210,.1)';c.beginPath();c.arc(150,110,92,0,7);c.fill();c.fillStyle='rgba(0,0,0,.35)';c.fillRect(0,232,300,28);drawShadow(c,f,f.facing>0?140:160,240,.95)});
 const s=mkCanvas(150,130),c=s.getContext('2d',{willReadFrequently:true});c.setTransform(.5,0,0,.5,0,0);drawFighter(c,f,f.facing>0?140:160,240,.95);quant(c,150,130,9,110,.25);
 const tg=cvs.getContext('2d');tg.imageSmoothingEnabled=false;tg.drawImage(s,0,0,cvs.width,cvs.height)}catch(e){return o.apply(this,arguments)}}}
