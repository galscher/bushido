import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':390,'height':844},device_scale_factor=2)
        await pg.add_init_script(path='mock.js')
        await pg.add_init_script("try{localStorage.setItem('bushido-lang','he')}catch(e){}")
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto('file:///home/claude/bushido/game_test.html?dbg=1'); await pg.wait_for_timeout(1800)
        print(await pg.evaluate("()=>[...document.querySelectorAll('button')].filter(b=>/דיווח|תמיכה|פנייה|מידע|support|legal|cr-legal/i.test(b.textContent+b.className)).map(b=>b.className+':'+b.textContent.trim().slice(0,30))"))
        print('btn',await pg.evaluate("()=>{const b=[...document.querySelectorAll('.x50entry button')].pop();b.click();return b.textContent}")); await pg.wait_for_timeout(600)
        tabs=await pg.evaluate("()=>[...document.querySelectorAll('#lgOv .lgt button')].map(b=>b.dataset.k)")
        print('tabs',tabs)
        await pg.evaluate("()=>document.querySelector('#lgOv .lgt button[data-k=support]').click()"); await pg.wait_for_timeout(500)
        await pg.fill('#lgMsg','בדיקה: הכפתור לא עובד אחרי דו־קרב')
        await pg.evaluate("()=>document.querySelector('#lgOv form .lgs').click()"); await pg.wait_for_timeout(1200)
        print('result',await pg.evaluate("()=>document.querySelector('#lgOv .lgr').textContent"))
        print('stored',await pg.evaluate("()=>JSON.stringify(Object.keys(window.__store).filter(k=>k.startsWith('tickets')))"))
        await pg.screenshot(path='s16_support.png',full_page=True)
        print(errs)
        await b.close()
asyncio.run(main())
