/* ================= 国盗り Kunitori: the living front ================= */
/* A strategy-map style for the province map:
   - the front line: every border between your land and a rival's burns as a marching line,
   - garrison counters on every province you can attack, gold if your army can take it, red if not,
   - a flag badge with your share of Japan,
   - and when a province falls, your colour floods into it pixel by pixel from the border,
     behind a burning edge and your army's banner. */
const KT={known:null,flood:null,frontKey:'',front:[]};
function ktOwnIdx(){return S.clan.cities.map(id=>CITIES.findIndex(c=>c.id===id)).filter(i=>i>=0)}
function ktCol(c){const h=mapPol&&FACT[c.reg]?FACT[c.reg][0]:REGIONS[c.reg].col;return hexRGB(h)}
function ktStartFlood(pi,ownSet){const D=MAPD,W=MAPW,H=MAPH,N=W*H,dist=new Int16Array(N).fill(-1),q=[];let cnt=0;
 for(let k=0;k<N;k++){if(D.owner[k]!==pi)continue;cnt++;const x=k%W,y=(k/W)|0;
  for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy;if(X<0||Y<0||X>=W||Y>=H)continue;const o=D.owner[Y*W+X];if(o>=0&&o!==pi&&ownSet.has(o)){dist[k]=0;q.push(k);break}}}
 if(!q.length){const p=D.pts[pi],k=Math.round(p.y)*W+Math.round(p.x);if(D.owner[k]===pi){dist[k]=0;q.push(k)}else for(let j=0;j<N;j++)if(D.owner[j]===pi){dist[j]=0;q.push(j);break}}
 let h=0,mx=0;while(h<q.length){const k=q[h++],x=k%W,y=(k/W)|0;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]]){const X=x+dx,Y=y+dy;if(X<0||Y<0||X>=W||Y>=H)continue;const j=Y*W+X;if(D.owner[j]!==pi||dist[j]>=0)continue;dist[j]=dist[k]+1;if(dist[j]>mx)mx=dist[j];q.push(j)}}
 const px=[];for(let k=0;k<N;k++)if(D.owner[k]===pi)px.push(k);
 KT.flood={pi,dist,mx:Math.max(1,mx),px,t0:performance.now(),dur:2600+Math.min(1800,mx*80),men:Math.max(10,Math.round((typeof armyMen==='function'?armyMen():0)||((S.est&&S.est.soldiers)||100))),col:ktCol(CITIES[pi]),cnt}}
function ktFront(own){const key=own.slice().sort((a,b)=>a-b).join(',');if(key===KT.frontKey)return KT.front;const D=MAPD,W=MAPW,H=MAPH,set=new Set(own),out=[];
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const k=y*W+x,o=D.owner[k];if(o<0||!set.has(o))continue;
  for(const[dx,dy]of[[1,0],[0,1],[-1,0],[0,-1]]){const X=x+dx,Y=y+dy;if(X<0||Y<0||X>=W||Y>=H)continue;const p=D.owner[Y*W+X];if(p>=0&&!set.has(p)){out.push([X,Y]);break}}}
 KT.frontKey=key;KT.front=out;return out}
function ktCounter(g,x,y,n,ok,kf){const t=fmtN(n);g.font=`bold ${Math.round(8.5*kf)}px Rubik,sans-serif`;const w=g.measureText(t).width+11*kf,h=12*kf;
 g.fillStyle='rgba(0,0,0,.55)';g.fillRect(x-w/2+2*kf,y-h/2+2*kf,w,h);g.fillStyle=ok?'#2a2010':'#3a0c08';g.fillRect(x-w/2,y-h/2,w,h);
 g.fillStyle=ok?'#e6b450':'#e8402a';g.fillRect(x-w/2,y-h/2,3.5*kf,h);g.strokeStyle=ok?'#e6b450':'#e8402a';g.lineWidth=1.2*kf;g.strokeRect(x-w/2,y-h/2,w,h);
 g.fillStyle='#fff3d6';g.textAlign='center';g.textBaseline='middle';g.fillText(t,x+2*kf,y+.5*kf)}
{const o=drawProvMap;drawProvMap=function(){const r=o.apply(this,arguments);try{const cv=$('#provMap');if(!cv||!MAPD||!S)return r;
 const g=cv.getContext('2d'),W=MAPW,sc=cv.width/W,kf=cv.width/(cv.clientWidth||cv.width),now=performance.now(),t=now/1000,own=ktOwnIdx(),set=new Set(own);
 g.save();g.setTransform(1,0,0,1,0,0);
 /* a province just fell: start the flood */
 if(!KT.known)KT.known=new Set(own);else{const nw=own.filter(i=>!KT.known.has(i));if(nw.length&&!KT.flood){const prev=new Set([...KT.known]);ktStartFlood(nw[nw.length-1],prev);sfx&&sfx('big')}for(const i of own)KT.known.add(i);for(const i of[...KT.known])if(!set.has(i))KT.known.delete(i)}
 /* the front line */
 const fr=ktFront(own);if(fr.length){for(let i=0;i<fr.length;i++){const[x,y]=fr[i],ph=((x+y+Math.floor(t*6))%4)<2;g.fillStyle=ph?'rgba(255,90,40,.95)':'rgba(255,214,90,.95)';g.fillRect(x*sc,y*sc,Math.ceil(sc),Math.ceil(sc))}}
 /* the flood */
 const F=KT.flood;if(F){const p=Math.min(1,(now-F.t0)/F.dur),e=p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2,fr2=e*(F.mx+2);let sx=0,sy=0,sn=0;const D=MAPD;
  for(const k of F.px){const d=F.dist[k],x=k%W,y=(k/W)|0;if(d>fr2){const sh=.72+(D.elev[k]||0)*.5;g.fillStyle=`rgb(${F.col[0]*sh|0},${F.col[1]*sh|0},${F.col[2]*sh|0})`;g.fillRect(x*sc,y*sc,Math.ceil(sc),Math.ceil(sc))}
   else if(d>fr2-2.2){const f=Math.random();g.fillStyle=f<.5?'#ffe48a':f<.8?'#ffffff':'#ff8a2a';g.fillRect(x*sc,y*sc,Math.ceil(sc),Math.ceil(sc));sx+=x;sy+=y;sn++}}
  if(sn){const cx=sx/sn*sc,cy=sy/sn*sc;for(let i=0;i<5;i++){g.fillStyle=`rgba(255,${180+Math.random()*70|0},90,${.5+Math.random()*.5})`;g.beginPath();g.arc(cx+(Math.random()-.5)*22*kf,cy+(Math.random()-.5)*22*kf,(1+Math.random()*2.5)*kf,0,7);g.fill()}
   const men=Math.max(1,Math.round(F.men*(1-.35*e)));mfxTag(g,cx,cy-20*kf,`⚔ ${fmtN(men)}`,'rgba(20,80,140,.92)','#ffffff')}
  if(p>=1){KT.flood=null;const c=CITIES[F.pi],pt=MAPD.pts[F.pi];if(c&&pt){KT.pop={x:pt.x*sc,y:pt.y*sc,t0:now,n:c.n}}}}
 if(KT.pop){const a=(now-KT.pop.t0)/1600;if(a>=1)KT.pop=null;else{g.globalAlpha=1-a;g.font=`${Math.round(16*kf)}px 'Suez One',serif`;g.textAlign='center';g.lineWidth=4*kf;g.strokeStyle='#000';const y=KT.pop.y-24*kf-a*26*kf,tx=TX(`${KT.pop.n} שלך!`,`${KT.pop.n} is yours!`);g.strokeText(tx,KT.pop.x,y);g.fillStyle='#ffd84a';g.fillText(tx,KT.pop.x,y);g.globalAlpha=1}}
 /* garrison counters on every province you can strike: gold if your army can take it, red if not */
 if(!KT.flood){let ap=0;try{ap=armyPower()*generalMul()}catch(e){}const L=[];
  CITIES.forEach((c,i)=>{if(set.has(i)||c.final||c.def==null)return;let s;try{s=provState(c).st}catch(e){return}if(s!=='open')return;const pt=MAPD.pts[i];if(pt)L.push({i,c,x:pt.x*sc,y:pt.y*sc+9*kf,ok:ap>=c.def*.95})});
  L.sort((a,b)=>(b.i===provSel)-(a.i===provSel)||(b.ok-a.ok)||(a.c.def-b.c.def));const placed=[];
  for(const q of L){const w=34*kf,h=13*kf;if(placed.some(r=>Math.abs(r.x-q.x)<w&&Math.abs(r.y-q.y)<h))continue;placed.push(q);ktCounter(g,q.x,q.y,q.c.def,q.ok,kf)}}
 /* the camera follows the front while a province falls */
 const F2=KT.flood;if(F2){const p=Math.min(1,(now-F2.t0)/F2.dur),z=1+1.6*Math.sin(Math.PI*Math.min(1,p*1.05)),pt=MAPD.pts[F2.pi];
  if(pt&&z>1.01){KT.tmp=KT.tmp||document.createElement('canvas');const T=KT.tmp;if(T.width!==cv.width||T.height!==cv.height){T.width=cv.width;T.height=cv.height}
   const tg=T.getContext('2d');tg.clearRect(0,0,T.width,T.height);tg.drawImage(cv,0,0);const vw=cv.width/z,vh=cv.height/z,cx=clamp(pt.x*sc-vw/2,0,cv.width-vw),cy=clamp(pt.y*sc-vh/2,0,cv.height-vh);
   g.imageSmoothingEnabled=false;g.drawImage(T,cx,cy,vw,vh,0,0,cv.width,cv.height);
   const c=CITIES[F2.pi];g.font=`${Math.round(15*kf)}px 'Suez One',serif`;g.textAlign='center';g.textBaseline='alphabetic';g.lineWidth=4*kf;g.strokeStyle='#000';const tx=TX(`⚔ כיבוש ${c.n}`,`⚔ Taking ${c.n}`);g.strokeText(tx,cv.width/2,cv.height-14*kf);g.fillStyle='#ffd84a';g.fillText(tx,cv.width/2,cv.height-14*kf)}}
 /* your share of Japan */
 const pc=Math.round(own.length/CITIES.length*100);mfxTag(g,40*kf,14*kf,`🚩 ${pc}%`,'rgba(150,20,10,.92)','#ffffff');
 g.restore()}catch(e){}return r}}
