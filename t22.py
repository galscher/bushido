import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for fn in ['live_latest.html','game.html']:
            pg=await b.new_page(viewport={'width':390,'height':844})
            await pg.add_init_script(path='mock.js')
            await pg.add_init_script("try{localStorage.setItem('bushido-clips','0');localStorage.removeItem('bushido-lang')}catch(e){}")
            errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
            await pg.goto(f'file:///home/claude/bushido/{fn}'); await pg.wait_for_timeout(800)
            # attacker plants handles before the game boots
            await pg.evaluate("()=>{window.__v32={};window.__v31={};window.__x50={}}")
            await pg.evaluate("()=>document.querySelector('button[data-l=he]').click()"); await pg.wait_for_timeout(1800)
            leak=await pg.evaluate("()=>({v32S:Object.getOwnPropertyDescriptor(window.__v32,'S')?'LEAK':'none',v32keys:Object.keys(window.__v32).length,fairOdds:typeof window.fairOdds,garr:typeof window.garrTotal})")
            print(fn,'planted-handle test:',leak)
            # rollback test via save code API
            await pg.evaluate("()=>document.querySelector('#btnNew').click()"); await pg.wait_for_timeout(1000)
            for i in range(30):
                v=await pg.evaluate("()=>[...document.querySelectorAll('.screen')].filter(s=>!s.hidden).map(s=>s.id).join()")
                if v=='scr-select': await pg.evaluate("()=>document.querySelector('#selGo').click()")
                c=await pg.evaluate("()=>{const ov=document.querySelector('#overlay');if(ov&&!ov.hidden){const b=[...ov.querySelectorAll('button')].filter(b=>b.offsetParent&&!b.classList.contains('ovx'))[0];if(b){b.click();return 1}}for(const x of document.querySelectorAll('.x50ov,.v40ov,#march,#intro')){((x.querySelector('.bar .btn')||x.querySelector('button'))||x).click();return 1}return 0}")
                if v=='scr-hub' and not c: break
                await pg.wait_for_timeout(500)
            r=await pg.evaluate("""()=>{const A=window.BSD_API;A.save();const code=A.state();const g0=code.gold;
               const live=A.state();  // simulate: lose gold at the gambling den, game saves
               return {gold:g0,info:A.info().gold}}""")
            # spend gold through the real game: use the state handle? it's a copy, so simulate a loss by saving after time passes
            await pg.wait_for_timeout(300)
            res=await pg.evaluate("""async()=>{const A=window.BSD_API;A.save();const code=JSON.parse(JSON.stringify(A.state()));A.save();A.save();const ok=A.restore(code);return {restoredOld:ok}}""")
            res2=await pg.evaluate("""()=>{const A=window.BSD_API;const c=A.state();c.gold=999999;return {forgedRestore:A.restore(c),flagged:!!A.state()._t,gold:A.info().gold}}""")
            print(fn,'rollback:',res,'forged:',res2,'errors',errs[:3])
            await pg.close()
        await b.close()
asyncio.run(main())
