# Real-time battlefield (戦場) test: deploy, formations and stratagems, orders by touch, field/siege/sea/board battles,
# auto mode, retreat, zones, bloodlust. Usage: python3 t24.py he|en
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
        CL="()=>{const s=document.querySelector('#selGo');if(s&&s.offsetParent)s.click();const ov=document.querySelector('#overlay');if(ov&&!ov.hidden){const b=[...ov.querySelectorAll('button')].filter(b=>b.offsetParent&&!b.disabled);const fc=b.filter(x=>x.classList.contains('fcard'));if(fc.length&&!document.querySelector('.fcard.picked')){fc[0].click();return 1}(b.find(x=>x.classList.contains('choice'))||b[b.length-1])?.click();return 1}for(const x of document.querySelectorAll('.x50ov,.v40ov,#march,#intro,.clipov')){(x.querySelector('button')||x).click();return 1}return 0}"
        await E("()=>document.querySelector('#btnNew').click()"); await pg.wait_for_timeout(1000)
        for i in range(40):
            await E(CL); await pg.wait_for_timeout(400)
            v=await E("()=>[...document.querySelectorAll('.screen')].filter(s=>!s.hidden).map(s=>s.id)")
            if v==['scr-hub'] and i>6: break
        print('hub reached',v)
        await E("()=>{const S=window.__v31.S;S.est.soldiers=400;S.arm.yumi=2;S.arm.yari=2;S.clan.day=80;S.gold+=5000;S.est.b.stables=2;S.def=S.def||{};S.def.spies=1;window.__base=JSON.stringify(S)}")
        async def war(kind,auto=False):
            await E("()=>{const S=window.__v31.S,B=JSON.parse(window.__base);const keep=S.seenHelp;for(const k of Object.keys(S))if(!(k in B))delete S[k];Object.assign(S,B);S.seenHelp=keep||S.seenHelp;try{window.__v31.renderHub()}catch(e){}}")
            await E("(a)=>{window.__v31.S.autoFight=a}",auto)
            js="""(k)=>{const T=window.__t,H=window.__sj;const c=T.CITIES[3];let ctx;
             if(k==='sea')ctx={kind:'trade',id:c.id,fd:H.cityFoe(c),def:Math.round(H.navyPower()*1.1+60),naval:1,place:'X',banner:'sea'};
             else if(k==='def')ctx={kind:'foreign',id:'mongol',mongol:1,fd:H.cityFoe(c),def:Math.round(H.armyPower()*1.1),place:'Y',banner:'def'};
             else if(k==='rank')ctx={kind:'rank',def:Math.round(H.armyPower()),fd:H.rkFoe({id:'zz',name:'Tester',hp:100,emp:{ap:300,gm:1.1,lv:8,hero:2,wr:{yari:3,kiba:4,teppo:'x',kisha:2,ag:0.9}}}),rkT:{id:'zz',name:'Tester',hp:100,gain:5},place:'Z',banner:'rank'};
             else ctx={kind:'city',id:c.id,fd:H.cityFoe(c),def:Math.round(H.armyPower()*1.05),place:c.castle,banner:'city',sgStorm:1};
             T.startFight(ctx);return ctx.kind}"""
            await E(js,kind)
            for _ in range(30):
                await pg.wait_for_timeout(400)
                if await E("()=>!!document.querySelector('#sjOv')"): break
                await E(CL)
            await pg.wait_for_timeout(500)
            if await E("()=>!!document.querySelector('#sjHelpOv')"):
                print('help shown'); await pg.screenshot(path=f'sj_{LANG}_help0.png'); await E("()=>document.querySelector('#sjHelpX').click()")
            st=await E("()=>{const J=window.__sj.SJ;if(!J)return null;return {kind:J.kind,phase:J.phase,budget:J.budget,cards:J.cards.me.map(c=>c.t+':'+c.max).join(','),foe:J.units.filter(u=>u.side==='foe').map(u=>u.t).join(','),zones:J.zones.length,keep:J.keepSide,form:J.form,kei:J.kei}}")
            print(kind,'battle',st)
            return st
        async def finish(n=240):
            for _ in range(n):
                await pg.wait_for_timeout(500)
                if not await E("()=>!!document.querySelector('#sjOv')"): break
            await E(CL); await pg.wait_for_timeout(600)
            for _ in range(10): await E(CL); await pg.wait_for_timeout(300)
            print('  result',await E("()=>JSON.stringify(window.__sj.last)"))
        # 1) manual: formation, stratagem, deploy by touch, orders by touch, pause, power, stratagem, then auto to the end
        st=await war('city')
        await E("()=>{window.__sj.sjSetForm('kakuyoku');window.__sj.sjSetKei('fukuhei')}")
        box=await pg.locator('#sjCv').bounding_box()
        tap=lambda x,y: pg.touchscreen.tap(box['x']+x*box['width']/10,box['y']+y*box['height']/8)
        await E("()=>{const b=[...document.querySelectorAll('#sjCards .sjcardb')].find(b=>!b.disabled);b&&b.click()}"); await pg.wait_for_timeout(200)
        dz=await E("()=>{const J=window.__sj.SJ;for(const x of [2,1,0])for(const y of [3,4,2,5])if(!J.units.some(u=>Math.floor(u.x)===x&&Math.floor(u.y)===y))return [x,y];return null}")
        await tap(dz[0]+.5,dz[1]+.5); await pg.wait_for_timeout(300)
        print('placed by touch',await E("()=>window.__sj.SJ.units.filter(u=>u.side==='me'&&!u.gen).length"))
        await E("()=>document.querySelector('#sjAutoD').click()"); await pg.wait_for_timeout(300)
        await pg.screenshot(path=f'sj_{LANG}_deploy.png')
        print('deployed',await E("()=>window.__sj.SJ.units.filter(u=>u.side==='me'&&!u.gen).map(u=>u.t).join(',')"),'spent',await E("()=>window.__sj.SJ.spent.me"))
        await E("()=>document.querySelector('#sjGo').click()"); await pg.wait_for_timeout(2500)
        u=await E("()=>{const J=window.__sj.SJ;const u=J.units.find(u=>u.side==='me'&&u.t==='horo')||J.units.find(u=>u.side==='me'&&!u.gen);return [u.x,u.y,u.t]}")
        await tap(u[0],u[1]); await pg.wait_for_timeout(300)
        print('touch select',await E("()=>window.__sj.SJ.sel.map(u=>u.t)"))
        z=await E("()=>{const z=window.__sj.SJ.zones[1]||window.__sj.SJ.zones[0];return [z.x,z.y]}")
        await tap(z[0],z[1]); await pg.wait_for_timeout(300)
        print('order',await E("()=>{const u=window.__sj.SJ.sel[0];return u&&u.ord&&u.ord.k}"))
        await E("()=>document.querySelector('#sjAll').click()"); await pg.wait_for_timeout(200)
        print('select all',await E("()=>window.__sj.SJ.sel.length"))
        await E("()=>document.querySelector('#sjPause').click()"); await pg.wait_for_timeout(200)
        t0=await E("()=>window.__sj.SJ.t"); await pg.wait_for_timeout(800); t1=await E("()=>window.__sj.SJ.t")
        print('paused holds time',t0==t1)
        await E("()=>document.querySelector('#sjPause').click()")
        await pg.wait_for_timeout(9000)
        await pg.screenshot(path=f'sj_{LANG}_battle.png')
        await E("()=>{const J=window.__sj.SJ;J.meter.me=999;document.querySelector('#sjPow').click()}"); await pg.wait_for_timeout(600)
        await pg.screenshot(path=f'sj_{LANG}_power.png')
        await pg.wait_for_timeout(1500)
        await E("()=>document.querySelector('#sjKei').click()"); await pg.wait_for_timeout(500)
        print('stratagem used',await E("()=>window.__sj.SJ.keiUsed.me"))
        await E("()=>{const h=document.querySelector('#sjHelp');h&&h.click()}"); await pg.wait_for_timeout(300)
        await pg.screenshot(path=f'sj_{LANG}_help.png')
        await E("()=>{const h=document.querySelector('#sjHelpX');h&&h.click()}")
        await E("()=>document.querySelector('#sjAuto').click()")
        await E("()=>{const J=window.__sj.SJ;J.spd=3}")
        await finish()
        await pg.screenshot(path=f'sj_{LANG}_after.png')
        # 2) sea, auto
        await E("()=>{const B=JSON.parse(window.__base);B.navy=3;window.__base=JSON.stringify(B)}")
        await war('sea',True); await finish()
        # 3) defending the castle by hand, then retreat
        await war('def'); await E("()=>{window.__sj.sjBegin()}"); await pg.wait_for_timeout(3000); await pg.screenshot(path=f'sj_{LANG}_def.png')
        await E("()=>{window.__sj.sjRetreat();window.__sj.sjRetreat()}"); await finish(20)
        # 4) board challenge, auto
        await war('rank',True); await finish()
        print('screens',await E("()=>[...document.querySelectorAll('.screen')].filter(s=>!s.hidden).map(s=>s.id)"))
        print('ERRORS',len(errs)); print('\n'.join(errs[:30]))
        await b.close()
asyncio.run(main())
