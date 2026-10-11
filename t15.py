import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':390,'height':844},device_scale_factor=2)
        await pg.add_init_script(path='mock.js')
        await pg.add_init_script("try{localStorage.setItem('bushido-clips','0');localStorage.setItem('bushido-lang','he')}catch(e){}")
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto('file:///home/claude/bushido/game_test.html?dbg=1'); await pg.wait_for_timeout(1500)
        E=pg.evaluate
        CL="()=>{const ov=document.querySelector('#overlay');if(ov&&!ov.hidden){if(ov.querySelector('input.hs-name'))return 'NAME';const bs=[...ov.querySelectorAll('button')].filter(b=>b.offsetParent&&!b.disabled);const fc=bs.filter(b=>b.classList.contains('fcard'));if(fc.length&&!document.querySelector('.fcard.picked')){fc[0].click();return 1}const nb=bs.filter(b=>!b.classList.contains('fcard')&&!b.classList.contains('ovx'));if(nb[0]){nb[0].click();return 1}}for(const x of document.querySelectorAll('.x50ov,.v40ov,#march,#intro')){const c=x.querySelector('.bar .btn')||x.querySelector('button');(c||x).click();return 1}return 0}"
        await E("()=>document.querySelector('#btnNew').click()"); await pg.wait_for_timeout(1000)
        got=False
        for i in range(60):
            v=await E("()=>[...document.querySelectorAll('.screen')].filter(s=>!s.hidden).map(s=>s.id).join()")
            if v=='scr-select': await E("()=>document.querySelector('#selGo').click()")
            c=await E(CL)
            if c=='NAME': got=True;break
            await pg.wait_for_timeout(700)
        print('name prompt shown',got)
        await pg.screenshot(path='s15_name.png')
        await pg.fill('#ovCard input.hs-name','דני')
        await E("()=>document.querySelector('#ovCard button.gold').click()"); await pg.wait_for_timeout(1500)
        print(await E("()=>[localStorage.getItem('bushido-player2'),JSON.stringify(window.__store.live.me123&&window.__store.live.me123.name)]"))
        await E("()=>window.__v31.renderHub()"); await pg.wait_for_timeout(2500)
        print('asked again?', await E("()=>!document.querySelector('#overlay').hidden&&!!document.querySelector('#ovCard input.hs-name')"))
        print('errors',errs)
        await b.close()
asyncio.run(main())
