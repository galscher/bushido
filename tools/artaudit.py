# Art audit: every fighter the game can put in the arena, whether it has illustrated art, and how tall it stands.
# Draws each fighter alone at the same scale and measures the opaque bounding box.
# Usage: python3 -I tools/artaudit.py PAGE.html OUT.json   (PAGE: a full build; hooks are turned on in a temp copy)
import asyncio,sys,json,os,tempfile
from playwright.async_api import async_playwright
os.chdir('/home/claude/bushido')
SRC,OUT=sys.argv[1],sys.argv[2]
HOOK=("window.__aud={mk:(s,p)=>makeFighter(s,p),aid:f=>artIdOf(f),dims:(f)=>{try{const id=artIdOf(f);return id?artDims(f,1,POSES.idle,id):null}catch(e){return null}},"
 "draw:(g,f,x,y,sc)=>drawFighter(g,f,x,y,sc,0,POSES.idle,false),"
 "src:()=>{const L=[];const add=(k,fd)=>{try{if(fd)L.push([k,fd])}catch(e){}};"
 "try{LADDER.forEach((x,i)=>add('ladder:'+i,foeData(i)))}catch(e){}"
 "try{HUNTS.forEach(h=>add('hunt:'+h.id,huntFoe(h)))}catch(e){}"
 "try{CITIES.forEach(c=>add('city:'+c.id,cityFoe(c)))}catch(e){}"
 "try{FOREIGN.forEach(f=>add('foreign:'+f.id,foreignFoe(f)))}catch(e){}"
 "try{Object.keys(SGF).forEach(id=>add('saga:'+id,sgFoe(id)))}catch(e){}"
 "try{HEROES.forEach((h,i)=>add('hero:'+h.id,{name:h.name,level:10,stats:h.stats,wk:h.wk,forge:2,armor:2,look:h.look}))}catch(e){}"
 "try{add('bounty',bhHunterFoe())}catch(e){}"
 "try{bhList().forEach(o=>add('bh:'+o.i,bhFoe(o)))}catch(e){}"
 "try{add('streak',streakFoe())}catch(e){}"
 "try{['yari','kiba','yumi'].forEach((w,i)=>add('rank:'+w,rkFoe({id:'zz'+i,name:'T'+i,hp:100,emp:{ap:300,gm:1.1,lv:8+i*20,hero:i,wr:{[w]:3}}})))}catch(e){}"
 "try{EMPIRES.forEach(m=>add('emp:'+m.id,foreignFoe(m)))}catch(e){}"
 "try{add('rebel',kdRebFoe({}))}catch(e){}"
 "try{['kumagoro','ryuzan','x'].forEach(w=>add('market:'+w,uwFoe(w)))}catch(e){}"
 "return L}};")
async def main():
    s=open(SRC,encoding='utf8').read().replace('if(false)window.__','if(true)window.__')
    s=s.replace('if(true)window.__t={',HOOK+'if(true)window.__t={',1)
    p='/home/claude/bushido/_aud_tmp.html';open(p,'w',encoding='utf8').write(s)  # beside art/ so relative art paths load
    async with async_playwright() as pw:
        b=await pw.chromium.launch(args=['--allow-file-access-from-files']);pg=await b.new_page(viewport={'width':390,'height':844})
        await pg.add_init_script(path='mock.js')
        await pg.add_init_script("localStorage.setItem('bushido-clips','0');localStorage.setItem('bushido-lang','he')")
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:200]))
        await pg.goto('file://'+p+'?dbg=1');await pg.wait_for_timeout(1500)
        E=pg.evaluate
        CL="()=>{const s=document.querySelector('#selGo');if(s&&s.offsetParent)s.click();const ov=document.querySelector('#overlay');if(ov&&!ov.hidden){const b=[...ov.querySelectorAll('button')].filter(b=>b.offsetParent&&!b.disabled);(b.find(x=>x.classList.contains('choice'))||b[b.length-1])?.click();return 1}for(const x of document.querySelectorAll('.x50ov,.v40ov,#march,#intro,.clipov')){(x.querySelector('button')||x).click();return 1}return 0}"
        frame=pg
        for f in pg.frames:
            pass
        await E("()=>{const b=document.querySelector('#btnNew');b&&b.click()}");await pg.wait_for_timeout(1000)
        for i in range(30):
            await E(CL);await pg.wait_for_timeout(350)
        n=await E("()=>window.__aud?window.__aud.src().length:-1")
        print('sources',n)
        # preload all art, then measure
        await E("()=>{for(const id in window.__art.ART){try{const A=window.__art.ART[id];for(const k in A){const a=A[k];if(a&&a.d&&!a.img){const im=new Image();im.src=a.d.src;a.img=im}}}catch(e){}}}")
        await pg.wait_for_timeout(4000)
        await E("()=>{for(const[k,fd] of window.__aud.src()){try{window.__aud.mk(fd,k.startsWith('hero:'))}catch(e){}}}")
        await pg.wait_for_timeout(9000)
        res=await E("""()=>{const A=window.__aud,out=[];for(const[k,fd] of A.src()){let r={k,name:fd.name};try{const f=A.mk(fd,k.startsWith('hero:'));f.facing=1;r.art=A.aid(f);
          const c=document.createElement('canvas');c.width=600;c.height=700;const g=c.getContext('2d');A.draw(g,f,300,620,1);
          const d=g.getImageData(0,0,600,700).data;let x0=600,y0=700,x1=-1,y1=-1;for(let y=0;y<700;y++)for(let x=0;x<600;x++)if(d[(y*600+x)*4+3]>40){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}
          r.h=y1>=0?y1-y0:0;r.w=x1>=0?x1-x0:0;r.top=y0;r.giant=!!f.giant;r.yokai=!!f.yokai;r.boss=fd.tier||null}catch(e){r.err=String(e).slice(0,120)}out.push(r)}return out}""")
        json.dump(res,open(OUT,'w'),ensure_ascii=False,indent=0)
        lu=await E("""()=>{const A=window.__aud,L=A.src(),per=12,cw=150,ch=290,rows=Math.ceil(L.length/per);const c=document.createElement('canvas');c.width=per*cw;c.height=rows*ch;const g=c.getContext('2d');g.fillStyle='#3a4a2a';g.fillRect(0,0,c.width,c.height);
          L.forEach(([k,fd],i)=>{try{const f=A.mk(fd,false);f.facing=1;const x=(i%per)*cw+cw/2,y=Math.floor(i/per)*ch+ch-34;g.fillStyle='#2a3a1a';g.fillRect(x-cw/2,y,cw,2);g.save();A.draw(g,f,x,y,.62);g.restore();g.fillStyle=A.aid(f)?'#9ef08a':'#ff9a7a';g.font='11px sans-serif';g.textAlign='center';g.fillText(k.slice(0,22),x,y+16);g.fillText(String(fd.name).slice(0,18),x,y+29)}catch(e){}});return c.toDataURL('image/png')}""")
        import base64;open(OUT.replace('.json','_lineup.png'),'wb').write(base64.b64decode(lu.split(',')[1]))
        art=[r for r in res if r.get('art')];code=[r for r in res if not r.get('art')]
        print('with art',len(art),'code-drawn',len(code),'errors',len([r for r in res if r.get('err')]))
        for r in sorted(res,key=lambda r:(bool(r.get('art')),r['k'])):print(('ART ' if r.get('art') else 'code')+f" {r['k']:28} {str(r.get('art') or ''):12} h={r.get('h')} w={r.get('w')} {r.get('name','')} {r.get('err','')}")
        print('page errors',errs[:5])
        await b.close()
    os.remove(p)
asyncio.run(main())
