# Late-game autopilot: rank 100, every province, endless, overseas rule|invade, 3 losses in a row, no gold.
# Usage: python3 late.py he|en PAGE SECONDS rule|invade
import asyncio,sys,json
from playwright.async_api import async_playwright
LANG=sys.argv[1]; FILE=sys.argv[2] if len(sys.argv)>2 else 'game.html'; OV=sys.argv[4] if len(sys.argv)>4 else 'rule'
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
                o=await E("()=>{const ov=document.querySelector('#overlay');const xs=[...document.querySelectorAll('.x50ov,.v40ov,#march,#intro,.clipov')];if(ov&&!ov.hidden){const bs=[...ov.querySelectorAll('button')].filter(b=>b.offsetParent&&!b.disabled);const fc=bs.filter(b=>b.classList.contains('fcard'));if(fc.length&&!document.querySelector('.fcard.picked')){fc[0].click();return 'card'}const nb=bs.filter(b=>!b.classList.contains('fcard')&&!b.classList.contains('ovx'));const ch=nb.filter(b=>b.classList.contains('choice'));const pick=ch[0]||nb[nb.length-1];if(pick){pick.click();return 'ov'}}for(const x of xs){const c=x.querySelector('.bar .btn')||x.querySelector('button');if(c){c.click();return 'x'}x.click();return 'xc'}return null}")
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
        await E("(ov)=>{const S=window.__v31.S,T=window.__t;S.level=100;S.wins=900;S.meiyo=1000;try{S.clan.cities=T.CITIES.map(c=>c.id)}catch(e){};S.clan.unified=true;S.clan.shogun=true;S.endless=1;S.overseas=ov;S.lossStreak=3;S.gold=0;try{window.__v31.save()}catch(e){}}",OV)
        print('late save',await E("()=>{const S=window.__v31.S;return [S.level,S.clan.cities.length,S.endless,S.overseas,S.lossStreak,S.gold]}"))
        await E("()=>{const S=window.__v31.S;S.auto=true;S.autoFight=true;try{window.__v31.renderHub()}catch(e){console.error('rh',e)}}")
        import time
        t0=time.time();last=None
        while time.time()-t0<int(sys.argv[3]) if len(sys.argv)>3 else 240:
            await pg.wait_for_timeout(5000)
            await clear()
            st=await E("()=>{const S=window.__v31.S;return S?[S.level,S.wins,S.clan.cities.length,Math.round(S.gold),[...document.querySelectorAll('.screen')].filter(s=>!s.hidden).map(s=>s.id).join(),S.auto,S.autoFight]:null}")
            ab=await E("()=>{const b=document.querySelector('#autoStop');return b?[b.hidden,b.textContent]:null}")
            if st!=last or int(time.time()-t0)%30<5: print(round(time.time()-t0),st,ab);last=st
        print('live doc',await E("()=>JSON.stringify(window.__store.live&&window.__store.live.me123)"))
        print('ach',await E("()=>localStorage.getItem('bushido-ach')"))
        print('fights done',await E('()=>window.__v31.S.wins'));print('ERRORS',len(errs)); print('\n'.join(errs[:40]))
        await b.close()
asyncio.run(main())
