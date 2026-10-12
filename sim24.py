# Balance simulation for the tactical battle: AI against AI at several power ratios. Usage: python3 sim24.py N
import asyncio,sys,json,time
from playwright.async_api import async_playwright
N=int(sys.argv[1]) if len(sys.argv)>1 else 6
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':390,'height':844})
        await pg.add_init_script(path='mock.js')
        await pg.add_init_script("localStorage.setItem('bushido-clips','0');localStorage.setItem('bushido-lang','he')")
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
        await pg.goto('file:///home/claude/bushido/game_test.html?dbg=1');await pg.wait_for_timeout(1500)
        E=pg.evaluate
        CL="()=>{const s=document.querySelector('#selGo');if(s&&s.offsetParent)s.click();const ov=document.querySelector('#overlay');if(ov&&!ov.hidden){const b=[...ov.querySelectorAll('button')].filter(b=>b.offsetParent&&!b.disabled);const fc=b.filter(x=>x.classList.contains('fcard'));if(fc.length&&!document.querySelector('.fcard.picked')){fc[0].click();return 1}(b.find(x=>x.classList.contains('choice'))||b[b.length-1])?.click();return 1}for(const x of document.querySelectorAll('.x50ov,.v40ov,#march,#intro,.clipov')){(x.querySelector('button')||x).click();return 1}return 0}"
        await E("()=>document.querySelector('#btnNew').click()");await pg.wait_for_timeout(1000)
        for i in range(40):
            await E(CL);await pg.wait_for_timeout(400)
            v=await E("()=>[...document.querySelectorAll('.screen')].filter(s=>!s.hidden).map(s=>s.id)")
            if v==['scr-hub'] and i>6: break
        print('hub',v,flush=True)
        await E("()=>{const S=window.__v31.S;S.est.soldiers=500;S.arm.yumi=2;S.arm.yari=2;S.clan.day=60;S.level=8;S.seenHelp=S.seenHelp||{};S.seenHelp.senjo=1;S.seenHelp.war=1;window.__base=JSON.stringify(S)}")
        res=[]
        for ratio in [0.5,0.6,0.7]:
            for k in range(N):
                await E("()=>{const S=window.__v31.S,B=JSON.parse(window.__base);for(const k of Object.keys(S))if(!(k in B))delete S[k];Object.assign(S,B);S.autoFight=false;S.auto=false;try{window.__v31.renderHub()}catch(e){}}")
                await E("""(r)=>{const T=window.__t,H=window.__sj;const c=T.CITIES[(Math.random()*8)|0];window.__sjl=H.last;T.startFight({kind:'city',id:c.id,fd:H.cityFoe(c),def:Math.round(H.armyPower()*r),place:c.castle,banner:'x',sgStorm:1})}""",ratio)
                t0=time.time()
                for t in range(300):
                    await pg.wait_for_timeout(300)
                    l=await E("()=>{const L=window.__sj.last;return L&&L!==window.__sjl?L:null}")
                    if l: print('found after',round(time.time()-t0,1),flush=True); break
                    if not await E("()=>!!document.querySelector('#sjOv')"): await E(CL)
                    else: await E("()=>{const J=window.__sj.SJ;if(J){J.auto.me=true;J.spd=30;if(J.turn==='me'&&J.endP){const r=J.endP;J.endP=null;window.__sj.sjAITurn('me').then(r)}}}")
                for i in range(8): await pg.wait_for_timeout(300);await E(CL)
                if l: res.append((ratio,l)); print(ratio,json.dumps(l),round(time.time()),flush=True)
        print('ERRORS',len(errs),errs[:5])
        await b.close()
asyncio.run(main())
