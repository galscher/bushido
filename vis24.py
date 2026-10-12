# Screenshots of the tactical battle's split-screen clash and commander power. Usage: python3 vis24.py he|en [kind]
import asyncio,sys
from playwright.async_api import async_playwright
LANG=sys.argv[1] if len(sys.argv)>1 else 'he';KIND=sys.argv[2] if len(sys.argv)>2 else 'city'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();DESK=len(sys.argv)>3
        pg=await b.new_page(viewport={'width':1280,'height':820} if DESK else {'width':390,'height':844},device_scale_factor=1 if DESK else 2)
        await pg.add_init_script(path='mock.js')
        await pg.add_init_script("localStorage.setItem('bushido-clips','0');localStorage.setItem('bushido-lang','%s')"%LANG)
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
        await pg.goto('file:///home/claude/bushido/game_test.html?dbg=1');await pg.wait_for_timeout(1500)
        E=pg.evaluate
        CL="()=>{const s=document.querySelector('#selGo');if(s&&s.offsetParent)s.click();const ov=document.querySelector('#overlay');if(ov&&!ov.hidden){const b=[...ov.querySelectorAll('button')].filter(b=>b.offsetParent&&!b.disabled);(b.find(x=>x.classList.contains('choice'))||b[b.length-1])?.click();return 1}for(const x of document.querySelectorAll('.x50ov,.v40ov,#march,#intro,.clipov')){(x.querySelector('button')||x).click();return 1}return 0}"
        await E("()=>document.querySelector('#btnNew').click()");await pg.wait_for_timeout(1000)
        for i in range(40):
            await E(CL);await pg.wait_for_timeout(400)
            v=await E("()=>[...document.querySelectorAll('.screen')].filter(s=>!s.hidden).map(s=>s.id)")
            if v==['scr-hub'] and i>6: break
        await E("()=>{const S=window.__v31.S;S.seenHelp=S.seenHelp||{};S.seenHelp.senjo=1;S.arm.gun=2;S.clan.day=90;S.navy=4}")
        await E("""(k)=>{const T=window.__t,H=window.__sj;const c=T.CITIES[4];T.startFight(k==='sea'?{kind:'trade',id:c.id,fd:H.cityFoe(c),def:Math.round(H.navyPower()),naval:1,place:'X',banner:'x'}:{kind:'city',id:c.id,fd:H.cityFoe(c),def:Math.round(H.armyPower()),place:c.castle,banner:'x',sgStorm:1})}""",KIND)
        for i in range(30):
            await pg.wait_for_timeout(500)
            if await E("()=>!!(window.__sj.SJ&&window.__sj.SJ.turn==='me')"): break
            if not await E("()=>!!document.querySelector('#sjOv')"): await E(CL)
        await pg.screenshot(path=f'vis_{LANG}_{KIND}{"_d" if DESK else ""}_map.png')
        # tap an enemy to show its threat zone
        await E("()=>{const J=window.__sj.SJ;const e=J.units.find(u=>u.side==='foe'&&!u.gen&&u.t!=='gate'&&u.t!=='yagura');window.__sj.sjTap(e.x,e.y)}");await pg.wait_for_timeout(400)
        await pg.screenshot(path=f'vis_{LANG}_{KIND}{"_d" if DESK else ""}_peek.png')
        await E("()=>{const J=window.__sj.SJ;window.__sj.sjTap(0,0);J.peek=null}")
        # aim at a target to show the forecast
        r=await E("""()=>{const J=window.__sj.SJ;const u=J.units.find(u=>u.side==='me'&&!u.gen);const e=J.units.find(v=>v.side==='foe'&&!v.gen&&(J.sea||['yari','yumi','kiba','sam','teppo','monk'].includes(v.t)));
          u.x=u.px=e.x-1;u.y=u.py=e.y;if(J.map[e.y][e.x-1]==='wall'||J.map[e.y][e.x-1]==='moat'||J.map[e.y][e.x-1]==='river'){J.map[e.y][e.x-1]=J.sea?'sea':'plain'}window.__sj.sjTap(u.x,u.y);window.__sj.sjTap(e.x,e.y);return [u.t,e.t,J.st]}""")
        print('aim',r);await pg.wait_for_timeout(400);await pg.screenshot(path=f'vis_{LANG}_{KIND}{"_d" if DESK else ""}_aim.png')
        await E("()=>{window.__vsl=[];window.__sj.sjConfirm();const t0=performance.now();const iv=setInterval(()=>{const J=window.__sj.SJ;window.__vsl.push([Math.round(performance.now()-t0),J&&J.vs?+J.vs.t.toFixed(2):null]);if(performance.now()-t0>2500)clearInterval(iv)},100)}")
        for i,t in enumerate([450,450,500]):
            await pg.wait_for_timeout(t);await pg.screenshot(path=f'vis_{LANG}_{KIND}{"_d" if DESK else ""}_clash{i}.png')
            import base64
            d=await E("()=>{const c=document.querySelector('#sjCv');return c.toDataURL('image/png')+'|'+(window.__sj.SJ.vs?window.__sj.SJ.vs.t:'none')}")
            u,vt=d.split('|');print('vs.t',vt);open(f'vis_cv{i}.png','wb').write(base64.b64decode(u.split(',')[1]))
        await pg.wait_for_timeout(1500)
        await E("()=>{const J=window.__sj.SJ;J.meter.me=999;window.__sj.sjActivate('me')}");await pg.wait_for_timeout(700)
        await pg.screenshot(path=f'vis_{LANG}_{KIND}{"_d" if DESK else ""}_power.png')
        print('VSL',await E('()=>JSON.stringify(window.__vsl)'));print('ERR',errs)
        await b.close()
asyncio.run(main())
