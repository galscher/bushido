import asyncio,sys,json
from playwright.async_api import async_playwright
LANG=sys.argv[1] if len(sys.argv)>1 else 'he'
async def play_fight(pg,tag,maxsteps=3000):
    for i in range(maxsteps):
        st=await pg.evaluate("()=>{const x=window.__x50;return x.XV?{busy:x.busy,over:x.fightOver,turn:x.XV.turn}:null}")
        if not st: return 'noXV'
        if st['over']: return 'over'
        await pg.evaluate("()=>{const ov=document.querySelector('#overlay');if(ov&&!ov.hidden&&/Help|עזרה/.test(ov.innerText)){const b=ov.querySelector('button.choice');if(b)b.click()}}")
        en=await pg.evaluate("()=>[...document.querySelectorAll('#pad .act')].filter(b=>!b.disabled).map(b=>b.dataset.a)")
        if not en:
            await pg.wait_for_timeout(150);continue
        for k in ['special','power','normal','quick','adv','rest']:
            if k in en:
                await pg.click(f'#pad .act[data-a="{k}"]');break
        if i==6: await pg.screenshot(path=f's_{tag}_mid.png')
        await pg.wait_for_timeout(120)
    return 'timeout'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        pg=await b.new_page(viewport={'width':390,'height':844},device_scale_factor=2)
        errs=[]
        pg.on('pageerror',lambda e:errs.append('PAGEERR '+str(e)))
        pg.on('console',lambda m:errs.append(m.type+' '+m.text) if m.type in('error','warning') and 'ERR_TUNNEL' not in m.text else None)
        await pg.goto('file:///home/claude/bushido/game_test.html?dbg=1')
        await pg.wait_for_timeout(500)
        await pg.click(f'button[data-l="{LANG}"]')
        await pg.wait_for_timeout(1500)
        await pg.click('.x50entry button:nth-child(1)')
        await pg.wait_for_timeout(500)
        await pg.screenshot(path=f's_{LANG}_duelsetup.png',full_page=True)
        await pg.fill('.x50side.p1 input','Dani'); await pg.fill('.x50side.p2 input','Yoni')
        await pg.click('.x50side.p2 .x50heroes button:nth-child(4)')
        await pg.click('.x50ov .btn.gold')
        await pg.wait_for_timeout(5500)
        await pg.evaluate("()=>{const b=document.querySelector('#overlay:not([hidden]) #ovCard button.choice');if(b)b.click()}")
        await pg.screenshot(path=f's_{LANG}_duel_start.png')
        r=await play_fight(pg,LANG+'duel')
        print('duel result',r)
        await pg.wait_for_timeout(4500)
        await pg.screenshot(path=f's_{LANG}_duel_end.png')
        txt=await pg.evaluate("()=>document.querySelector('#ovCard').innerText")
        print(txt)
        # rematch
        await pg.click('#ovCard button.choice >> nth=0')
        await pg.wait_for_timeout(5000)
        r=await play_fight(pg,LANG+'duel2'); print('duel2',r)
        await pg.wait_for_timeout(4500)
        print(await pg.evaluate("()=>document.querySelector('#ovCard').innerText"))
        await pg.click('#ovCard button.choice >> nth=-1')  # exit
        await pg.wait_for_timeout(800)
        print('screen', await pg.evaluate("()=>[...document.querySelectorAll('.screen')].filter(s=>!s.hidden).map(s=>s.id)"))
        # daily
        await pg.click('.x50entry button:nth-child(2)')
        await pg.wait_for_timeout(600)
        await pg.screenshot(path=f's_{LANG}_daily.png',full_page=True)
        await pg.click('.x50ov .x50row .btn.gold')
        await pg.wait_for_timeout(5500)
        await pg.evaluate("()=>{const b=document.querySelector('#overlay:not([hidden]) #ovCard button.choice');if(b&&/Help|עזרה/.test(document.querySelector('#ovCard').innerText))b.click()}")
        r=await play_fight(pg,LANG+'daily'); print('daily',r)
        await pg.wait_for_timeout(4500)
        await pg.screenshot(path=f's_{LANG}_daily_end.png')
        print(await pg.evaluate("()=>document.querySelector('#ovCard').innerText"))
        await pg.click('#ovCard button.choice >> nth=1')  # board
        await pg.wait_for_timeout(1500)
        await pg.screenshot(path=f's_{LANG}_board.png',full_page=True)
        await pg.click('.x50ov .bar .btn')
        await pg.wait_for_timeout(300)
        await pg.click('.x50entry button:nth-child(4)')
        await pg.wait_for_timeout(600)
        await pg.screenshot(path=f's_{LANG}_ach.png',full_page=True)
        print('\n'.join(errs[:40]))
        await b.close()
asyncio.run(main())
