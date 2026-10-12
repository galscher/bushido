# Tactical battle (戦場) test: field, siege, sea and board battles; manual play, auto play, retreat. Usage: python3 t24.py he|en
import asyncio,sys
from playwright.async_api import async_playwright
LANG=sys.argv[1] if len(sys.argv)>1 else 'he'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        pg=await b.new_page(viewport={'width':390,'height':844},has_touch=True)
        await pg.add_init_script(path='mock.js')
        await pg.add_init_script("try{localStorage.setItem('bushido-clips','0');localStorage.setItem('bushido-lang','%s')}catch(e){}"%LANG)
        errs=[]
        pg.on('pageerror',lambda e:errs.append('PAGEERR '+str(e)[:300]))
        pg.on('console',lambda m:errs.append(m.type+' '+m.text[:300]) if m.type in('error','warning') and 'ERR_TUNNEL' not in m.text and 'Failed to load resource' not in m.text else None)
        await pg.goto('file:///home/claude/bushido/game_test.html?dbg=1'); await pg.wait_for_timeout(1500)
        E=pg.evaluate
        async def clear(n=12):
            for _ in range(n):
                o=await E("()=>{const ov=document.querySelector('#overlay');const xs=[...document.querySelectorAll('.x50ov,.v40ov,#march,#intro,.clipov')];if(ov&&!ov.hidden){const bs=[...ov.querySelectorAll('button')].filter(b=>b.offsetParent&&!b.disabled);const fc=bs.filter(b=>b.classList.contains('fcard'));if(fc.length&&!document.querySelector('.fcard.picked')){fc[0].click();return 'card'}const nb=bs.filter(b=>!b.classList.contains('fcard')&&!b.classList.contains('ovx'));const ch=nb.filter(b=>b.classList.contains('choice'));const pick=ch[0]||nb[nb.length-1];if(pick){pick.click();return 'ov'}}for(const x of xs){const c=x.querySelector('.bar .btn')||x.querySelector('button');if(c){c.click();return 'x'}x.click();return 'xc'}return null}")
                if not o: return
                await pg.wait_for_timeout(500)
        await E("()=>document.querySelector('#btnNew').click()"); await pg.wait_for_timeout(1200)
        for i in range(30):
            v=await E("()=>[...document.querySelectorAll('.screen')].filter(s=>!s.hidden).map(s=>s.id)")
            if v==['scr-select']: await E("()=>document.querySelector('#selGo').click()")
            await clear(); await pg.wait_for_timeout(500)
            v=await E("()=>[...document.querySelectorAll('.screen')].filter(s=>!s.hidden).map(s=>s.id)")
            if v==['scr-hub']: break
        print('hub reached',v)
        await E("()=>{const S=window.__v31.S;S.est.soldiers=400;S.arm.yumi=2;S.arm.yari=2;S.arm.gun=1;S.clan.day=80;S.gold+=5000}")
        await E("()=>{window.__base=JSON.stringify(window.__v31.S)}")
        async def war(kind,auto=False):
            await E("()=>{const S=window.__v31.S,B=JSON.parse(window.__base);const keep=S.seenHelp;for(const k of Object.keys(S))if(!(k in B))delete S[k];Object.assign(S,B);S.seenHelp=keep||S.seenHelp;try{window.__v31.renderHub()}catch(e){}}")
            if auto: await E("()=>{window.__v31.S.autoFight=true}")
            js="""(k)=>{const T=window.__t,H=window.__sj,cityFoe=H.cityFoe,navyPower=H.navyPower,armyPower=H.armyPower,rkFoe=H.rkFoe;const c=T.CITIES[3];let ctx;
             if(k==='sea')ctx={kind:'trade',id:c.id,fd:cityFoe(c),def:Math.round(navyPower()*1.1+60),naval:1,place:'X',banner:'sea'};
             else if(k==='def')ctx={kind:'foreign',id:'mongol',mongol:1,fd:cityFoe(c),def:Math.round(armyPower()*1.1),place:'Y',banner:'def'};
             else if(k==='rank')ctx={kind:'rank',def:Math.round(armyPower()),fd:rkFoe({id:'zz',name:'Tester',hp:100,emp:{ap:300,gm:1.1,lv:8,hero:2,wr:{yari:3,kiba:4,teppo:'x',ag:0.9}}}),rkT:{id:'zz',name:'Tester',hp:100,gain:5},place:'Z',banner:'rank'};
             else ctx={kind:'city',id:c.id,fd:cityFoe(c),def:Math.round(armyPower()*1.05),place:c.castle,banner:'city'};
             T.startFight(ctx);return ctx.kind}"""
            await E(js,kind)
            for _ in range(20):
                await pg.wait_for_timeout(400)
                if await E("()=>!!document.querySelector('#sjOv')"): break
                await clear(1)
            st=await E("()=>{const J=window.__sj.SJ;if(!J)return null;return {kind:J.kind,me:J.units.filter(u=>u.side==='me').map(u=>u.t+u.hp).join(','),foe:J.units.filter(u=>u.side==='foe').map(u=>u.t+u.hp).join(','),start:J.start,keep:J.keepSide,co:J.co}}")
            for _ in range(20):
                if await E("()=>!!document.querySelector('#sjHelpOv')||!!(window.__sj.SJ&&window.__sj.SJ.turn)"): break
                await pg.wait_for_timeout(250)
            if await E("()=>!!document.querySelector('#sjHelpOv')"):
                print('help shown'); await pg.wait_for_timeout(300); await pg.screenshot(path=f'sj_{LANG}_help0.png'); await E("()=>document.querySelector('#sjHelpX').click()")
            await pg.wait_for_timeout(1600)
            print(kind,'battle',st)
            return st
        # 1) field/siege: manual moves, then auto to finish
        st=await war('city')
        await pg.wait_for_timeout(2200)
        await pg.screenshot(path=f'sj_{LANG}_1.png')
        # real touch: tap a unit of ours on the canvas, it must become selected; tap it again to wait
        box=await pg.locator('#sjCv').bounding_box()
        tu=await E("()=>{const J=window.__sj.SJ;const u=J.units.find(u=>u.side==='me'&&!u.gen);return [u.x,u.y]}")
        await pg.touchscreen.tap(box['x']+(tu[0]+.5)*box['width']/10,box['y']+(tu[1]+.5)*box['height']/8); await pg.wait_for_timeout(300)
        print('touch select',await E("()=>window.__sj.SJ.st"))
        await E("()=>{const c=document.querySelector('#sjCan');c&&c.click()}"); await pg.wait_for_timeout(200)
        print('after cancel',await E("()=>window.__sj.SJ.st"))
        # select first own non-general unit and tap a reachable tile, then end turn
        r=await E("""()=>{const J=window.__sj.SJ;const u=J.units.find(u=>u.side==='me'&&!u.gen);window.__sj.sjTap(u.x,u.y);const sel=J.sel;if(!sel)return 'nosel';let best=null;for(const [k,e] of sel.reach){if(e.pass)continue;const x=k%10,y=(k/10)|0;if(!best||x>best[0])best=[x,y]}window.__sj.sjTap(best[0],best[1]);return [u.t,best,J.st]}""")
        print('move',r); await pg.wait_for_timeout(1500)
        await pg.screenshot(path=f'sj_{LANG}_2.png')
        await E("()=>{const J=window.__sj.SJ;if(J.st==='moved'){document.querySelector('#sjAct').click()}}")
        await E("()=>{window.__sj.sjEndTurn();window.__sj.sjEndTurn()}")
        await pg.wait_for_timeout(1500)
        # watch for a split-screen clash during the enemy turn
        seen=False
        for _ in range(60):
            if await E("()=>!!(window.__sj.SJ&&window.__sj.SJ.vs)"):
                seen=True; await pg.wait_for_timeout(500); await pg.screenshot(path=f'sj_{LANG}_3.png'); break
            if await E("()=>window.__sj.SJ&&window.__sj.SJ.turn==='me'"): break
            await pg.wait_for_timeout(250)
        print('clash seen',seen)
        await E("()=>{const h=document.querySelector('#sjHelp');h&&h.click()}"); await pg.wait_for_timeout(400)
        await pg.screenshot(path=f'sj_{LANG}_help.png')
        await E("()=>{const h=document.querySelector('#sjHelpOv');h&&h.remove()}")
        await E("()=>window.__sj.sjAutoTog()")
        for _ in range(240):
            await pg.wait_for_timeout(500)
            if not await E("()=>!!document.querySelector('#sjOv')"): break
        print('field done, day',await E("()=>window.__t&&0"))
        await pg.wait_for_timeout(800); await pg.screenshot(path=f'sj_{LANG}_4.png'); await clear()
        # 2) sea, auto
        await E("()=>{window.__v31.S.navy=3}")
        await war('sea'); await pg.wait_for_timeout(1800); await pg.screenshot(path=f'sj_{LANG}_sea.png')
        await E("()=>window.__sj.sjAutoTog()")
        for _ in range(240):
            await pg.wait_for_timeout(500)
            if not await E("()=>!!document.querySelector('#sjOv')"): break
        await clear()
        # 3) defending the castle, then retreat
        await war('def',True); await E("()=>{const J=window.__sj.SJ;if(J){J.auto.me=false;J.spd=1}window.__v31.S.autoFight=false}"); await pg.wait_for_timeout(1800); await pg.screenshot(path=f'sj_{LANG}_def.png')
        await E("()=>{window.__sj.sjRetreat();window.__sj.sjRetreat()}")
        await pg.wait_for_timeout(3000); await clear()
        print('after retreat ov',await E("()=>!!document.querySelector('#sjOv')"))
        # 4) board challenge (with a hostile war record), auto mode for the whole game
        st=await war('rank',True); await pg.wait_for_timeout(500)
        for _ in range(240):
            await pg.wait_for_timeout(500)
            if not await E("()=>!!document.querySelector('#sjOv')"): break
        await clear()
        print('screens',await E("()=>[...document.querySelectorAll('.screen')].filter(s=>!s.hidden).map(s=>s.id)"))
        print('ERRORS',len(errs)); print('\n'.join(errs[:30]))
        await b.close()
asyncio.run(main())
