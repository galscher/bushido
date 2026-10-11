import asyncio
from playwright.async_api import async_playwright
async def run(tamper):
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':390,'height':844})
        await pg.add_init_script(path='mock.js')
        await pg.add_init_script("try{localStorage.setItem('bushido-clips','0');localStorage.setItem('bushido-lang','he');localStorage.setItem('bushido-player2','\"Tester\"')}catch(e){}")
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto('file:///home/claude/bushido/game_test.html?dbg=1'); await pg.wait_for_timeout(1500)
        E=pg.evaluate
        CL="()=>{const ov=document.querySelector('#overlay');if(ov&&!ov.hidden){const bs=[...ov.querySelectorAll('button')].filter(b=>b.offsetParent&&!b.disabled);const fc=bs.filter(b=>b.classList.contains('fcard'));if(fc.length&&!document.querySelector('.fcard.picked')){fc[0].click();return 1}const nb=bs.filter(b=>!b.classList.contains('fcard')&&!b.classList.contains('ovx'));if(nb[0]){nb[0].click();return 1}}for(const x of document.querySelectorAll('.x50ov,.v40ov,#march,#intro')){const c=x.querySelector('.bar .btn')||x.querySelector('button');(c||x).click();return 1}return 0}"
        await E("()=>document.querySelector('#btnNew').click()"); await pg.wait_for_timeout(1000)
        for i in range(40):
            v=await E("()=>[...document.querySelectorAll('.screen')].filter(s=>!s.hidden).map(s=>s.id).join()")
            if v=='scr-select': await E("()=>document.querySelector('#selGo').click()")
            c=await E(CL)
            if v=='scr-hub' and not c: break
            await pg.wait_for_timeout(600)
        await E("()=>{delete window.__store.live.me123}")
        if tamper: await E("()=>{window.__x50.S._t=1;window.__x50.S.level=99}")
        await E("()=>{window.__x50.S.wins=(window.__x50.S.wins||0)+1;window.__v31.save()}")
        await pg.wait_for_timeout(5000)
        live=await E("()=>JSON.stringify(window.__store.live.me123||null)")
        print('tampered' if tamper else 'honest','-> live row:',live[:120],'errors',errs)
        await b.close()
async def main():
    await run(False); await run(True)
asyncio.run(main())
