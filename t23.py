import asyncio,json,datetime
from playwright.async_api import async_playwright
d=datetime.date.today().isoformat()
FORGED=json.dumps({d:{"tries":1,"best":{"t":1,"hp":100}}})
FAKEENV=json.dumps({"v":{d:{"tries":1,"best":{"t":1,"hp":100}}},"__s":"deadbeef"})
async def scen(b,name,init,play=False,fn='game_test.html'):
    pg=await b.new_page(viewport={'width':390,'height':844})
    await pg.add_init_script(path='mock.js')
    await pg.add_init_script("try{localStorage.setItem('bushido-lang','he');localStorage.setItem('bushido-player2','\"Tester\"');localStorage.setItem('bushido-xvhelp','{\"duel\":1,\"daily\":1}');%s}catch(e){}"%init)
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto(f'file:///home/claude/bushido/{fn}?dbg=1'); await pg.wait_for_timeout(1500)
    if play:
        await pg.evaluate("()=>window.__x50.startDaily()"); await pg.wait_for_timeout(5000)
        for i in range(2500):
            st=await pg.evaluate("()=>{const x=window.__x50;return x.XV?[x.busy,x.fightOver]:null}")
            if not st or st[1]: break
            en=await pg.evaluate("()=>[...document.querySelectorAll('#pad .act')].filter(b=>!b.disabled).map(b=>b.dataset.a)")
            for k in ['special','power','normal','quick','adv','rest']:
                if k in en: await pg.evaluate("k=>document.querySelector(`#pad .act[data-a=\"${k}\"]`).click()",k);break
            await pg.wait_for_timeout(120)
        await pg.wait_for_timeout(4500)
    else:
        await pg.wait_for_timeout(5000)
    row=await pg.evaluate("()=>{const r=window.__store.live&&window.__store.live.me123;return r?{dd:r.dd,dt:r.dt,dhp:r.dhp,ach:r.ach}:null}")
    print(f'{name:38s} -> board row:',row,'errors',errs[:2])
    await pg.close()
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        await scen(b,'honest: plays the daily for real','',play=True)
        await scen(b,'forged raw daily record (1 turn)',f"localStorage.setItem('bushido-daily',{json.dumps(FORGED)})")
        await scen(b,'forged record + seal marker deleted',f"localStorage.removeItem('bushido-side-sealed');localStorage.setItem('bushido-daily',{json.dumps(FORGED)})")
        await scen(b,'forged record with fake signature',f"localStorage.setItem('bushido-daily',{json.dumps(FAKEENV)})")
        await scen(b,'forged achievements (all 22)',"localStorage.setItem('bushido-ach',JSON.stringify(Object.fromEntries('win1 win25 win100 lv10 lv25 lv50 lv100 champ flawless norest streak5 city1 city5 shogun rich honor speed duel1 duel10 daily1 daily3 dailyfast'.split(' ').map(k=>[k,1]))))")
        await b.close()
asyncio.run(main())
