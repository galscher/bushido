/* ================= 舞台 the stage comes alive =================
   The arenas move like the great arcade stages of the 1990s: villagers crowd the shore to watch, war banners snap
   in the wind, gulls wheel over the water, ashigaru line the ridge below the keep, torches flicker, fireflies drift
   through the spirit wood and ghost-fires rise at the gates of Yomi. Every bout opens with a brush-stroke 勝負,
   the finishing cut freezes the world in red with both warriors in black silhouette under a great 斬,
   and the verdict is written in ink: 勝負あり, or 無念. */
const BT={ko:null,kj:null};
const btR=i=>{const x=Math.sin(i*91.7+13.1)*43758.5453;return x-Math.floor(x)};
function btPerson(g,x,y,h,col,t,i,wave){const bob=Math.abs(Math.sin(t*2.6+i*1.9))*h*.05;g.fillStyle=col;g.beginPath();g.moveTo(x-h*.3,y);g.lineTo(x-h*.22,y-h*.62-bob);g.lineTo(x+h*.22,y-h*.62-bob);g.lineTo(x+h*.3,y);g.closePath();g.fill();g.beginPath();g.arc(x,y-h*.78-bob,h*.17,0,7);g.fill();
 if(wave){const a=Math.sin(t*7+i)*.5;g.strokeStyle=col;g.lineWidth=Math.max(2,h*.09);g.lineCap='round';g.beginPath();g.moveTo(x+h*.18,y-h*.58-bob);g.lineTo(x+h*.18+Math.sin(a+.4)*h*.42,y-h*.58-bob-Math.cos(a+.4)*h*.42);g.stroke()}}
function btBanner(g,x,y,h,col,t,i,mon){g.fillStyle='#2a1a10';g.fillRect(x-1.5,y-h,3,h);const w=h*.28,top=y-h+6;g.fillStyle=col;g.beginPath();g.moveTo(x+1,top);for(let k=0;k<=8;k++){const yy=top+k*(h*.62/8),wv=Math.sin(t*5+i+k*.7)*3;g.lineTo(x+1+w+wv,yy)}g.lineTo(x+1,top+h*.62);g.closePath();g.fill();
 if(mon){g.fillStyle=mon;g.beginPath();g.arc(x+1+w*.5+Math.sin(t*5+i+3)*1.5,top+h*.2,w*.22,0,7);g.fill()}}
function btFlame(g,x,y,s,t,i){const f=Math.sin(t*23+i*3)*.5+Math.sin(t*37+i)*.5;g.save();g.globalCompositeOperation='lighter';const gr=g.createRadialGradient(x,y-s*.6,1,x,y-s*.6,s*2.6);gr.addColorStop(0,'rgba(255,170,60,.55)');gr.addColorStop(1,'rgba(255,90,20,0)');g.fillStyle=gr;g.fillRect(x-s*2.6,y-s*3.2,s*5.2,s*5.2);g.restore();
 g.fillStyle='#ff7a1a';g.beginPath();g.moveTo(x-s*.5,y);g.quadraticCurveTo(x-s*.6,y-s*.9,x+f*s*.2,y-s*(1.6+f*.2));g.quadraticCurveTo(x+s*.6,y-s*.9,x+s*.5,y);g.fill();
 g.fillStyle='#ffd34a';g.beginPath();g.moveTo(x-s*.25,y);g.quadraticCurveTo(x-s*.3,y-s*.6,x+f*s*.1,y-s*(1+f*.15));g.quadraticCurveTo(x+s*.3,y-s*.6,x+s*.25,y);g.fill()}
function btStage(g,t){const k=arenaKind;
 if(k===0){
  for(let i=0;i<5;i++){const x=(btR(i+7)*W+t*14*(1+btR(i)))%(W+60)-30,y=70+btR(i+3)*90+Math.sin(t*2+i)*6,w=6+btR(i+1)*4,f=Math.sin(t*9+i)*.6;g.strokeStyle='#f4f4f0';g.lineWidth=2;g.beginPath();g.moveTo(x-w,y-f*w*.6);g.quadraticCurveTo(x-w*.4,y-w*.3,x,y);g.quadraticCurveTo(x+w*.4,y-w*.3,x+w,y-f*w*.6);g.stroke()}
  g.save();g.strokeStyle='#fff';g.lineWidth=1.5;for(let i=0;i<14;i++){const y=342+btR(i)*30,x=(btR(i+5)*W+t*(10+btR(i+2)*14))%W,l=8+btR(i+9)*18;g.globalAlpha=.2+.35*Math.abs(Math.sin(t*1.5+i));g.beginPath();g.moveTo(x,y);g.lineTo(x+l,y);g.stroke()}g.restore();
  const cols=['#3a2a24','#4a3a5a','#5a2a24','#2a3a4a','#6a4a2a','#3a4a3a'];for(let i=0;i<24;i++){const x=240+i*13+btR(i)*8;if(x>540)break;btPerson(g,x,392,22+btR(i+2)*8,cols[i%cols.length],t,i,i%5===2)}
  btBanner(g,300,388,58,'#c4372a',t,1,'#fff');btBanner(g,500,388,58,'#f2ead8',t,2,'#c4372a');btBanner(g,742,386,52,'#1d2a4a',t,3,'#e8c25a')}
 else if(k===2){
  for(let i=0;i<4;i++){const a=t*.5+i*1.6,x=250+Math.cos(a)*(60+i*12),y=150+Math.sin(a)*22+i*6,w=5,f=Math.sin(t*10+i);g.strokeStyle='#1a0a10';g.lineWidth=2;g.beginPath();g.moveTo(x-w,y-f*3);g.lineTo(x,y);g.lineTo(x+w,y-f*3);g.stroke()}
  for(let i=0;i<26;i++){const x=20+i*30+btR(i)*10;if(x>420&&i%3)continue;const y=362,h=20+btR(i+3)*5,bob=Math.sin(t*1.4+i)*1.2;btPerson(g,x,y,h,'#1a0e14',t*.3,i,false);g.fillStyle='#2a1a20';g.beginPath();g.moveTo(x-h*.34,y-h*.86+bob);g.lineTo(x,y-h*1.06+bob);g.lineTo(x+h*.34,y-h*.86+bob);g.fill();if(i%2){g.strokeStyle='#3a2a2a';g.lineWidth=1.5;g.beginPath();g.moveTo(x+4,y-2);g.lineTo(x+10,y-h*1.9);g.stroke()}}
  for(const [x,y] of [[60,404],[400,398],[760,404]]){g.fillStyle='#2a1a10';g.fillRect(x-2,y-34,4,40);btFlame(g,x,y-34,9,t,x)}
  btBanner(g,320,372,56,'#c4372a',t,4,'#fff');btBanner(g,470,372,56,'#111',t,5,'#fff')}
 else if(k===1||k===12){
  for(let i=0;i<26;i++){const x=(btR(i)*W+Math.sin(t*.4+i)*40+W)%W,y=180+btR(i+4)*200+Math.sin(t*.7+i*2)*24,b=Math.max(0,Math.sin(t*2.2+i*1.3));if(b<.15)continue;g.save();g.globalCompositeOperation='lighter';g.globalAlpha=b;const gr=g.createRadialGradient(x,y,0,x,y,9);gr.addColorStop(0,'rgba(240,255,150,.95)');gr.addColorStop(1,'rgba(160,255,80,0)');g.fillStyle=gr;g.fillRect(x-9,y-9,18,18);g.restore()}}
 else if(k===3){
  for(let i=0;i<12;i++){const ph=(t*.25+btR(i))%1,x=60+btR(i+2)*680+Math.sin(t*1.3+i)*14,y=410-ph*240,a=Math.sin(ph*Math.PI);g.save();g.globalCompositeOperation='lighter';g.globalAlpha=a*.9;const gr=g.createRadialGradient(x,y,0,x,y,16);gr.addColorStop(0,'rgba(200,230,255,.95)');gr.addColorStop(.5,'rgba(90,140,255,.55)');gr.addColorStop(1,'rgba(60,80,255,0)');g.fillStyle=gr;g.beginPath();g.moveTo(x-10,y);g.quadraticCurveTo(x,y+18,x+10,y);g.quadraticCurveTo(x+4,y-14,x,y-26);g.quadraticCurveTo(x-4,y-14,x-10,y);g.fill();g.restore()}}}
{const o=drawAmbient;drawAmbient=function(g,dt){try{if(!INKM)btStage(g,performance.now()/1000)}catch(e){}return o.apply(this,arguments)}}
/* ---------- brush kanji and the finishing cut ---------- */
function btView(){const asp=cv.width/cv.height;let vh=H/CAM.z,vw=vh*asp;if(vw>W){vw=W;vh=W/asp}return{cx0:clamp(CAM.x-vw/2,0,W-vw),cy0:(H-vh)*.9,ks:cv.width/vw}}
let BT_OFF=null;
function btSil(v){const w=cv.width,h=cv.height;if(!BT_OFF||BT_OFF.width!==w||BT_OFF.height!==h)BT_OFF=mkCanvas(w,h);const o=BT_OFF.getContext('2d');o.setTransform(1,0,0,1,0,0);o.globalCompositeOperation='source-over';o.clearRect(0,0,w,h);
 o.setTransform(v.ks,0,0,v.ks,-v.cx0*v.ks,-v.cy0*v.ks);for(const f of[P,E]){if(!f)continue;try{drawFighter(o,f,(f.dx??f.x)+(f._artSh||0),GROUND-(f.riding?40*SC:0),SC*(f.look.scale||1),f.dT,f.dpose,true)}catch(e){}}
 o.setTransform(1,0,0,1,0,0);o.globalCompositeOperation='source-in';o.fillStyle='#0a0406';o.fillRect(0,0,w,h);o.globalCompositeOperation='source-over';return BT_OFF}
function btInk(seed,n){const a=[];for(let i=0;i<n;i++)a.push({x:btR(seed+i)-.5,y:btR(seed+i*3+1)-.5,r:.01+btR(seed+i*7+2)*.035});return a}
function btFx(g){const now=performance.now(),w=cv.width,h=cv.height,m=Math.min(w,h);
 if(BT.ko){const t=now-BT.ko.t0;if(t>1150)BT.ko=null;else{g.save();g.setTransform(1,0,0,1,0,0);
  if(t<110){g.fillStyle=`rgba(255,255,255,${1-t/110})`;g.fillRect(0,0,w,h)}else{const a=t>880?clamp((1150-t)/270,0,1):1;g.globalAlpha=a;
   const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#2a0204');gr.addColorStop(.55,'#c41a0a');gr.addColorStop(1,'#ff8a1a');g.fillStyle=gr;g.fillRect(0,0,w,h);
   g.fillStyle='rgba(255,226,170,.9)';g.beginPath();g.arc(w*.5,h*.4,m*.2,0,7);g.fill();
   const v=btView();g.drawImage(btSil(v),0,0);
   const L=BT.ko.L;if(L){const lx=((L.dx??L.x)+(L._artSh||0)-v.cx0)*v.ks,ly=(GROUND-140-v.cy0)*v.ks,k=clamp((t-110)/180,0,1);g.strokeStyle='#fff';g.lineWidth=Math.max(5,w*.014);g.lineCap='round';g.beginPath();g.moveTo(lx-w*.3,ly-h*.22);g.lineTo(lx-w*.3+w*.6*k,ly-h*.22+h*.44*k);g.stroke()}
   anBrush(g,'斬',w*.5,h*.28,m*.4,'#fff',clamp((t-80)/240,0,1),'#000')}
  g.restore()}}
 if(BT.kj){const K=BT.kj,t=now-K.t0;if(t>K.dur)BT.kj=null;else{g.save();g.setTransform(1,0,0,1,0,0);const a=t>K.dur-300?clamp((K.dur-t)/300,0,1):1,k=clamp(t/220,0,1);g.globalAlpha=a;
  for(const d of K.ink){g.fillStyle=K.col2;g.beginPath();g.arc(K.x*w+d.x*m*.9*k,K.y*h+d.y*m*.9*k,d.r*m*k,0,7);g.fill()}
  if(K.vert){const ch=[...K.txt],sz=m*K.size;ch.forEach((c,i)=>anBrush(g,c,K.x*w,K.y*h+(i-(ch.length-1)/2)*sz*.95,sz,K.col,clamp((t-i*90)/240,0,1),'#000'))}
  else anBrush(g,K.txt,K.x*w,K.y*h,m*K.size,K.col,k,'#000');
  if(K.seal&&t>260){const s=m*.09,sx=K.sx*w,sy=K.sy*h,q=clamp((t-260)/160,0,1);g.save();g.translate(sx,sy);g.rotate(-.12);g.scale(1+(1-q)*1.6,1+(1-q)*1.6);g.globalAlpha=a*q;g.fillStyle='rgba(200,40,30,.9)';g.fillRect(-s/2,-s/2,s,s);g.fillStyle='#fff3e0';g.font=`${s*.7}px 'Yuji Syuku',serif`;g.textAlign='center';g.textBaseline='middle';g.fillText(K.seal,0,2);g.restore()}
  g.restore()}}}
/* Latin banners (K.O.) read left to right even inside the Hebrew page */
{const o=drawBanners;drawBanners=function(g,dt){const d=g.direction;try{if(banners.length&&banners.every(b=>!/[\u0590-\u05FF]/.test(String(b.text))))g.direction='ltr'}catch(e){}const r=o.apply(this,arguments);g.direction=d;return r}}
{const o=drawCutin;drawCutin=function(g,dt){const r=o.apply(this,arguments);try{if(!INKM)btFx(g)}catch(e){}return r}}
{const o=announce;announce=function(text,op){try{const s=String(text),now=performance.now();op=op||{};
 if(s==='K.O.'){const L=(P&&P.dead)?P:(E&&E.dead)?E:null;BT.ko={t0:now,L}}
 else if(/^(הילחמו!|Fight!)$/.test(s))BT.kj={txt:'勝負',t0:now,dur:1150,x:.5,y:.36,size:.3,col:'#c4171a',col2:'rgba(10,4,6,.55)',ink:btInk(Math.floor(now)%97,10)};
 else if(/^(ניצחון!|Victory!)$/.test(s))BT.kj={txt:'勝負あり',vert:1,t0:now,dur:1600,x:.84,y:.44,size:.15,col:'#fff3d6',col2:'rgba(10,4,6,.5)',ink:btInk(Math.floor(now)%89,8),seal:'勝',sx:.84,sy:.78};
 else if(op.lose)BT.kj={txt:'無念',vert:1,t0:now,dur:1600,x:.84,y:.44,size:.17,col:'#c8d4e8',col2:'rgba(10,10,20,.5)',ink:btInk(Math.floor(now)%83,6)}}catch(e){}
 return o.apply(this,arguments)}}
