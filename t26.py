# Weekly season board (場所): points earned this week count across journeys, a new journey resets only "this journey",
# a new week starts at zero with last week's podium, forged rows are ignored. Usage: python3 t26.py he|en
import asyncio,sys,json
from playwright.async_api import async_playwright
LANG=sys.argv[1] if len(sys.argv)>1 else 'he'
PAGE=sys.argv[2] if len(sys.argv)>2 else 'game_test.html'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':390,'height':844})
        await pg.add_init_script(path='mock.js')
        await pg.add_init_script("localStorage.setItem('bushido-clips','0');localStorage.setItem('bushido-lang','%s')"%LANG)
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
        await pg.goto('file:///home/claude/bushido/'+PAGE+'?dbg=1');await pg.wait_for_timeout(1500)
        E=pg.evaluate
        CL="()=>{const s=document.querySelector('#selGo');if(s&&s.offsetParent)s.click();const ov=document.querySelector('#overlay');if(ov&&!ov.hidden){const b=[...ov.querySelectorAll('button')].filter(b=>b.offsetParent&&!b.disabled);(b.find(x=>x.classList.contains('choice'))||b[b.length-1])?.click();return 1}for(const x of document.querySelectorAll('.x50ov,.v40ov,#march,#intro,.clipov')){(x.querySelector('button')||x).click();return 1}return 0}"
        await E("()=>document.querySelector('#btnNew').click()");await pg.wait_for_timeout(800)
        for i in range(40):
            await E(CL);await pg.wait_for_timeout(300)
            v=await E("()=>[...document.querySelectorAll('.screen')].filter(s=>!s.hidden).map(s=>s.id)")
            if v==['scr-hub'] and i>6: break
        N=window="window.__sn"
        st=lambda: E("()=>{const n=window.__sn;n.snTick();return {s:n.snNow(),v:n.snMine(),st:n.snLoad()}}")
        a=await st();print('start',a['v'])
        await E("()=>{const S=window.__v31.S;S.level=12;S.wins=30}");b1=await st();print('after gains',b1['v'],'>0',b1['v']>a['v'])
        await E("()=>{const S=window.__v31.S;S.level=8}");b2=await st();print('after a loss, season kept',b2['v']==b1['v'])
        await E("()=>{const S=window.__v31.S;S.level=12}");b3=await st();print('recovering does not count twice',b3['v']==b1['v'])
        await E("()=>{const S=window.__v31.S;S.runId='newrun';S.level=1;S.wins=0}");c=await st();print('new journey keeps the season',c['v']==b1['v'])
        await E("()=>{const S=window.__v31.S;S.level=5;S.wins=3}");d=await st();print('new journey adds',d['v']>c['v'],d['v'])
        await E("()=>window.__v31.save&&window.__v31.save()");await pg.wait_for_timeout(3500)
        row=await E("()=>window.__store.live.me123||null");print('row ss/sp',row and row.get('ss'),row and row.get('sp'),'pts',row and row.get('pts'))
        # forged rows from others
        await E("""(s)=>{const L=window.__store.live;L.cheat={name:'Cheat',h:1,lv:2,wins:1,ss:s,sp:1999999,hp:0,ts:1};L.good={name:'Rival',h:2,lv:20,wins:40,ss:s,sp:%d,ts:1};L.old={name:'Old',h:2,lv:9,ss:s-1,sp:999,lss:s-1,ts:1}}"""%(d['v']+500),d['s'])
        for k in range(6):
            n=await E("()=>{const o=[...document.querySelectorAll('.x50ov')].filter(x=>x.offsetParent||getComputedStyle(x).display!=='none');o.forEach(x=>{const c=[...x.querySelectorAll('button')].find(b=>/סגור|Close|אחר כך|Later/.test(b.textContent));c?c.click():x.remove()});return o.length}")
            await pg.wait_for_timeout(300)
            if not n: break
        await E("()=>window.__sn.openBoard()")
        await pg.wait_for_timeout(2500)
        txt=await E("()=>{const b=[...document.querySelectorAll('#x50bd')].pop();return b?b.innerText:''}")
        print('board shows season',('עונה' in txt) or ('Season' in txt),'rival',('Rival' in txt),'cheat hidden',('Cheat' not in txt),'old-week row hidden',('Old' not in txt))
        print(json.dumps(await E('async()=>{const r=await window.__sn.fetchLive();return r&&r.map(x=>[x.id,x.ss,x.sp,x.name])}')),json.dumps(await E('()=>{const r=window.__sn.liveRow();return [r.ss,r.sp,r.pts,r.name]}')));print(txt[:300]);print('snOk',json.dumps(await E('async()=>{const r=await window.__sn.fetchLive();const s=window.__sn.snNow();return r.map(x=>[x.id,window.__sn.snOk(x,s)])}')));print('n boards',await E("()=>document.querySelectorAll('#x50bd').length"));print('tbl',await E("()=>[...[...document.querySelectorAll('#x50bd')].pop().querySelectorAll('tr')].map(t=>t.innerText).join(' | ')"));print(json.dumps(await E('()=>Object.fromEntries(Object.entries(window.__store.live).map(([k,v])=>[k,[v.ss,v.sp]]))')))
        print('chase line',[l for l in txt.split('\n') if 'Rival' in l][:2])
        await E("()=>{for(const b of document.querySelectorAll('button'))if(b.offsetParent&&/^(אחר כך|Later|Not now)$/.test(b.textContent.trim()))b.click()}");await pg.wait_for_timeout(600)
        await pg.screenshot(path=f'sn_{LANG}_season.png')
        for t in ['run','live','daily','speed','end','season']:
            await E("(t)=>{const c=[...document.querySelectorAll('.x50tabs .chip[data-t='+t+']')].pop();c&&c.click()}",t);await pg.wait_for_timeout(1300)
            x=await E("()=>{const b=[...document.querySelectorAll('#x50bd')].pop();return b?b.innerText.slice(0,60):''}");print('tab',t,repr(x[:50]))
        await pg.screenshot(path=f'sn_{LANG}_season2.png',full_page=True)
        # next week: everyone at zero, podium of last week
        await E("()=>{window.__sn.setOff(6048e5)}");e=await st();print('next week starts at zero',e['v']==0,'last',e['st'].get('last'))
        await E("()=>{const S=window.__v31.S;S.level=13}");f=await st();print('this week counts new gains',f['v']>0,f['v'])
        print('ERRORS',len(errs),errs[:5])
        await b.close()
asyncio.run(main())
