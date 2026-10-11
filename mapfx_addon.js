/* ================= the living war map: marching columns, incoming armies with countdowns, burning provinces ================= */
function mfxFlame(g,x,y,s,t){const f=Math.sin(t*9+x)*.18;g.save();g.translate(x,y);g.scale(s,s*(1+f));g.beginPath();g.moveTo(0,-14);g.quadraticCurveTo(9,-4,6,4);g.quadraticCurveTo(0,10,-6,4);g.quadraticCurveTo(-9,-4,0,-14);g.fillStyle='rgba(255,120,30,.92)';g.fill();g.beginPath();g.moveTo(0,-7);g.quadraticCurveTo(4,-1,3,3);g.quadraticCurveTo(0,6,-3,3);g.quadraticCurveTo(-4,-1,0,-7);g.fillStyle='rgba(255,230,120,.95)';g.fill();g.restore()}
function mfxTag(g,x,y,txt,bg,fg){g.font='bold 14px sans-serif';const w=g.measureText(txt).width+12;g.fillStyle=bg;g.strokeStyle='rgba(0,0,0,.7)';g.lineWidth=2;g.beginPath();if(g.roundRect)g.roundRect(x-w/2,y-11,w,21,6);else g.rect(x-w/2,y-11,w,21);g.fill();g.stroke();g.fillStyle=fg;g.textAlign='center';g.textBaseline='middle';g.fillText(txt,x,y)}
function mfxMarch(g,a,b,t,col){const dx=b.x-a.x,dy=b.y-a.y,L=Math.hypot(dx,dy)||1;g.save();g.setLineDash([10,8]);g.lineDashOffset=-t*40;g.strokeStyle=col;g.lineWidth=4;g.globalAlpha=.85;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke();g.setLineDash([]);
 for(let i=0;i<5;i++){const u=((t*.35+i/5)%1),x=a.x+dx*u,y=a.y+dy*u;g.fillStyle=col;g.beginPath();g.arc(x,y,4.5,0,7);g.fill();g.strokeStyle='#000';g.lineWidth=1.5;g.stroke()}g.restore()}
{const o=drawProvMap;drawProvMap=function(){const r=o.apply(this,arguments);try{const cv=$('#provMap');if(!cv||!MAPD||!S)return r;const g=cv.getContext('2d'),t=performance.now()/1000,K=cv.width/MAPW,P=i=>MAPD.pts[i]?{x:MAPD.pts[i].x*K,y:MAPD.pts[i].y*K}:null;
 g.save();g.setTransform(1,0,0,1,0,0);
 const own=S.clan.cities.map(id=>CITIES.findIndex(c=>c.id===id)).filter(i=>i>=0);
 /* your column marches toward the province you picked */
 if(provSel!=null&&own.length&&!S.clan.cities.includes((CITIES[provSel]||{}).id)){const tp=P(provSel);let best=null,bd=1e9;for(const i of own){const p=P(i);if(!p)continue;const d=Math.hypot(p.x-tp.x,p.y-tp.y);if(d<bd){bd=d;best=p}}
  if(best&&tp&&bd<K*70){mfxMarch(g,best,tp,t,'#28aaf5');const pu=1+Math.sin(t*5)*.12;g.strokeStyle='#ffd84a';g.lineWidth=3;g.beginPath();g.arc(tp.x,tp.y,16*pu,0,7);g.stroke();mfxTag(g,tp.x,tp.y-30,'⚔',"rgba(20,14,10,.85)",'#ffd84a')}}
 /* your strength over your seat */
 if(own.length){const p=P(own[0]);if(p)mfxTag(g,p.x,p.y+24,`🛡 ${fmtN(Math.round(S.est&&S.est.soldiers||0))}`,'rgba(20,80,140,.9)','#ffffff')}
 /* an enemy army on its way: you see it only if your spies did */
 const A=S.rv&&S.rv.atk;if(A&&!A.silent){const i=CITIES.findIndex(c=>c.id===A.target),tp=P(i);if(tp){const left=Math.max(0,(A.day||0)-(S.clan.day||0));const src={x:tp.x+Math.cos(i)*K*26,y:tp.y-Math.abs(Math.sin(i))*K*22};mfxMarch(g,src,tp,t,'#e8402a');
  const pu=1+Math.sin(t*6)*.15;g.strokeStyle='rgba(232,64,42,.9)';g.lineWidth=4;g.beginPath();g.arc(tp.x,tp.y,20*pu,0,7);g.stroke();
  if(left<=1)for(let k=0;k<3;k++)mfxFlame(g,tp.x-12+k*12,tp.y+4-(k%2)*6,1.1,t+k);
  mfxTag(g,src.x,src.y-24,`${A.kj||'⚔'} ${fmtN(A.power||0)} · ${left?TX(`${left} ימים`,`${left} days`):TX('היום!','today!')}`,'rgba(150,20,10,.92)','#ffffff')}}
 g.restore()}catch(e){}return r}}
