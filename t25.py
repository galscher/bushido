# Bloodlust (血気) in the duel: the cup fills with hits, the frenzy can be let loose, guard is locked, the foe uses it too.
# Usage: python3 t25.py he|en
import asyncio,sys
from playwright.async_api import async_playwright
LANG=sys.argv[1] if len(sys.argv)>1 else 'he'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':390,'height':844},has_touch=True)
        await pg.add_init_script(path='mock.js')
        await pg.add_init_script("localStorage.setItem('bushido-clips','0');localStorage.setItem('bushido-lang','%s')"%LANG)
        errs=[];pg.on('pageerror',lambda e:errs.append('PAGEERR '+str(e)[:300]))
        pg.on('console',lambda m:errs.append(m.type+' '+m.text[:300]) if m.type in('error','warning') and 'ERR_TUNNEL' not in m.text and 'Failed to load resource' not in m.text else None)
        await pg.goto('file:///home/claude/bushido/game_test.html?dbg=1');await pg.wait_for_timeout(1500)
        E=pg.evaluate
        CL="()=>{const s=document.querySelector('#selGo');if(s&&s.offsetParent)s.click();const ov=document.querySelector('#overlay');if(ov&&!ov.hidden){const b=[...ov.querySelectorAll('button')].filter(b=>b.offsetParent&&!b.disabled);const fc=b.filter(x=>x.classList.contains('fcard'));if(fc.length&&!document.querySelector('.fcard.picked')){fc[0].click();return 1}(b.find(x=>x.classList.contains('choice'))||b[b.length-1])?.click();return 1}for(const x of document.querySelectorAll('.x50ov,.v40ov,#march,#intro,.clipov')){(x.querySelector('button')||x).click();return 1}return 0}"
        await E("()=>document.querySelector('#btnNew').click()");await pg.wait_for_timeout(1000)
        for i in range(40):
            await E(CL);await pg.wait_for_timeout(400)
            v=await E("()=>[...document.querySelectorAll('.screen')].filter(s=>!s.hidden).map(s=>s.id)")
            if v==['scr-hub'] and i>6: break
        await E("()=>{window.__t.startFight()}")
        for i in range(40):
            await pg.wait_for_timeout(400)
            ok=await E("()=>{const K=window.__kk;return !!(K.P&&K.E&&!document.querySelector('#scr-fight').hidden&&document.querySelector('#overlay').hidden&&document.querySelector('#kkBtn'))}")
            if ok: break
            await E(CL)
        print('button',await E("()=>{const b=document.querySelector('#kkBtn');return b?[b.disabled,b.textContent.slice(0,60)]:null}"))
        # land blows until the cup is full
        for i in range(30):
            st=await E("()=>{const K=window.__kk;return [Math.round(K.P.blood||0),K.E.hp,K.P.hp,!!document.querySelector('#scr-fight').hidden]}")
            if st[0]>=100 or st[1]<=0 or st[2]<=0 or st[3]: break
            await E("()=>{const K=window.__kk;K.P.sta=K.P.maxSta;K.E.hp=Math.max(K.E.hp,K.E.maxHp*.6);const n=document.querySelector('#pad .act[data-a=normal]');const a=document.querySelector('#pad .act[data-a=adv]');if(n&&!n.disabled)n.click();else if(a&&!a.disabled)a.click()}")
            await pg.wait_for_timeout(1600)
            await E(CL)
        print('blood after blows',st)
        await E("()=>{window.__kk.P.blood=100}")
        for i in range(20):
            await E("()=>{try{refreshPad()}catch(e){}}")
            if await E("()=>{const b=document.querySelector('#kkBtn');return b&&!b.disabled}"): break
            await pg.wait_for_timeout(400);await E(CL)
        await pg.wait_for_timeout(300)
        await pg.screenshot(path=f'kk_{LANG}_full.png')
        await E("()=>{const b=document.querySelector('#kkBtn');b&&b.click()}");await pg.wait_for_timeout(800)
        st=await E("()=>{const K=window.__kk;const blk=document.querySelector('#pad .act[data-a=block]');return [K.P.shura,blk&&blk.disabled]}")
        print('frenzy turns, guard locked',st)
        await pg.screenshot(path=f'kk_{LANG}_shura.png')
        # the foe lets his loose
        await E("()=>{window.__kk.E.blood=100}")
        for i in range(6):
            await E("()=>{const K=window.__kk;K.P.sta=K.P.maxSta;K.P.hp=Math.max(K.P.hp,K.P.maxHp*.7);K.E.hp=Math.max(K.E.hp,K.E.maxHp*.5);const n=document.querySelector('#pad .act[data-a=quick]');if(n&&!n.disabled)n.click()}")
            await pg.wait_for_timeout(1600);await E(CL)
        print('foe frenzy seen',await E("()=>{const K=window.__kk;return [K.E.shura||0,Math.round(K.E.blood||0),K.P.shura||0]}"))
        # finish the fight on auto
        await E("()=>{window.__v31.S.autoFight=true;try{refreshPad()}catch(e){}}")
        for i in range(60):
            await pg.wait_for_timeout(1000);await E(CL)
            if not await E("()=>!document.querySelector('#scr-fight').hidden"): break
        print('screens',await E("()=>[...document.querySelectorAll('.screen')].filter(s=>!s.hidden).map(s=>s.id)"))
        print('ERRORS',len(errs));print('\n'.join(errs[:20]))
        await b.close()
asyncio.run(main())
