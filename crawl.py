import asyncio,sys,json
from playwright.async_api import async_playwright
LANG=sys.argv[1]; FILE=sys.argv[2] if len(sys.argv)>2 else 'game.html'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        pg=await b.new_page(viewport={'width':390,'height':844})
        await pg.add_init_script(path='mock.js')
        await pg.add_init_script("try{localStorage.setItem('bushido-clips','0');localStorage.setItem('bushido-lang','%s')}catch(e){}"%LANG)
        errs=[]
        pg.on('pageerror',lambda e:errs.append('PAGEERR '+str(e)[:300]))
        pg.on('console',lambda m:errs.append(m.type+' '+m.text[:300]) if m.type=='error' and 'ERR_TUNNEL' not in m.text and 'Failed to load resource' not in m.text else None)
        await pg.goto(f'file:///home/claude/bushido/{FILE}?dbg=1'); await pg.wait_for_timeout(1500)
        E=pg.evaluate
        async def clear():
            for _ in range(12):
                o=await E("()=>{const ov=document.querySelector('#overlay');const xs=[...document.querySelectorAll('.x50ov,.v40ov,#march,#intro,.clipov')];if(ov&&!ov.hidden){const bs=[...ov.querySelectorAll('button')].filter(b=>b.offsetParent&&!b.disabled);const fc=bs.filter(b=>b.classList.contains('fcard'));if(fc.length&&!document.querySelector('.fcard.picked')){fc[0].click();return 'card'}const nb=bs.filter(b=>!b.classList.contains('fcard')&&!b.classList.contains('ovx'));if(nb[0]){nb[0].click();return 'ov'}}for(const x of xs){const c=x.querySelector('.bar .btn')||x.querySelector('button');if(c){c.click();return 'x'}x.click();return 'xc'}return null}")
                if not o: return
                await pg.wait_for_timeout(700)
        await E("()=>document.querySelector('#btnNew').click()"); await pg.wait_for_timeout(1200)
        for i in range(30):
            v=await E("()=>[...document.querySelectorAll('.screen')].filter(s=>!s.hidden).map(s=>s.id)")
            if v==['scr-select']: await E("()=>document.querySelector('#selGo').click()")
            await clear(); await pg.wait_for_timeout(600)
            v=await E("()=>[...document.querySelectorAll('.screen')].filter(s=>!s.hidden).map(s=>s.id)")
            if v==['scr-hub']: break
        print('hub reached',v)
        # give gold so screens have content
        await E("()=>{const S=window.__x50.S;S.gold+=50000;S.free+=20}")
        navs=await E("()=>[...document.querySelectorAll('#scr-hub .navgrid button, #scr-hub .x50entry button')].map((b,i)=>i)")
        print('nav buttons',len(navs))
        visited=[]
        for i in navs:
            await E("()=>{if(document.querySelector('#scr-hub').hidden){const b=document.querySelector('.screen:not([hidden]) [data-back]');if(b)b.click()}}")
            await clear()
            await E("()=>{window.__x50.S&&0;try{show('hub')}catch(e){}}")
            lbl=await E("i=>{const b=[...document.querySelectorAll('#scr-hub .navgrid button, #scr-hub .x50entry button')][i];if(!b)return null;const t=b.textContent.trim().slice(0,30);b.click();return t}",i)
            await pg.wait_for_timeout(900)
            scr=await E("()=>[...document.querySelectorAll('.screen')].filter(s=>!s.hidden).map(s=>s.id).concat([...document.querySelectorAll('.x50ov,.v40ov')].map(x=>x.className))")
            # click every tab/chip in visible screen/overlay
            n=await E("()=>{const root=document.querySelector('.x50ov,.v40ov')||document.querySelector('.screen:not([hidden])');return root?root.querySelectorAll('.chip,[role=tab],.tabs button').length:0}")
            for j in range(n):
                await E("j=>{const root=document.querySelector('.x50ov,.v40ov')||document.querySelector('.screen:not([hidden])');const c=root&&root.querySelectorAll('.chip,[role=tab],.tabs button')[j];if(c&&!c.disabled)c.click()}",j)
                await pg.wait_for_timeout(500)
            await pg.screenshot(path=f'cr_{LANG}_{i:02d}.png')
            visited.append((lbl,scr,n,len(errs)))
            await clear()
            await E("()=>{const b=document.querySelector('.screen:not([hidden]) [data-back]');if(b)b.click()}")
            await pg.wait_for_timeout(500)
        for v in visited: print(v)
        print('ERRORS',len(errs)); print('\n'.join(errs[:40]))
        await b.close()
asyncio.run(main())
