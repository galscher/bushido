# Balance simulation for the real-time battlefield: AI against AI at several power ratios. Usage: python3 sim24.py N [kind]
import asyncio,sys,json,time
from playwright.async_api import async_playwright
N=int(sys.argv[1]) if len(sys.argv)>1 else 6
KIND=sys.argv[2] if len(sys.argv)>2 else 'mix'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':390,'height':844})
        await pg.add_init_script(path='mock.js')
        await pg.add_init_script("localStorage.setItem('bushido-clips','0');localStorage.setItem('bushido-lang','he')")
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
        await pg.goto('file:///home/claude/bushido/game_test.html?dbg=1');await pg.wait_for_timeout(1500)
        E=pg.evaluate
        CL="()=>{const s=document.querySelector('#selGo');if(s&&s.offsetParent)s.click();const ov=document.querySelector('#overlay');if(ov&&!ov.hidden){const b=[...ov.querySelectorAll('button')].filter(b=>b.offsetParent&&!b.disabled);const fc=b.filter(x=>x.classList.contains('fcard'));if(fc.length&&!document.querySelector('.fcard.picked')){fc[0].click();return 1}(b.find(x=>x.classList.contains('choice'))||b[b.length-1])?.click();return 1}for(const x of document.querySelectorAll('.x50ov,.v40ov,#march,#intro,.clipov')){(x.querySelector('button')||x).click();return 1}return 0}"
        await E("()=>document.querySelector('#btnNew').click()");await pg.wait_for_timeout(1000)
        for i in range(40):
            await E(CL);await pg.wait_for_timeout(400)
            v=await E("()=>[...document.querySelectorAll('.screen')].filter(s=>!s.hidden).map(s=>s.id)")
            if v==['scr-hub'] and i>6: break
        await E("()=>{const S=window.__v31.S;S.est.soldiers=500;S.arm.yumi=2;S.arm.yari=2;S.clan.day=60;S.level=8;S.navy=3;S.seenHelp=S.seenHelp||{};S.seenHelp.senjoRT=1;window.__base=JSON.stringify(S)}")
        tally={}
        for ratio in [0.6,0.8,1.0,1.25,1.6]:
            for k in range(N):
                kind=KIND if KIND!='mix' else ['field','siege','sea','rank'][k%4]
                await E("()=>{const S=window.__v31.S,B=JSON.parse(window.__base);for(const k of Object.keys(S))if(!(k in B))delete S[k];Object.assign(S,B);S.autoFight=true;S.auto=false;try{window.__v31.renderHub()}catch(e){}}")
                await E("""([r,kind])=>{const T=window.__t,H=window.__sj;const c=T.CITIES[(Math.random()*8)|0];window.__sjl=H.last;
                  const ap=H.armyPower();let ctx;
                  if(kind==='sea')ctx={kind:'trade',id:c.id,fd:H.cityFoe(c),def:Math.round(H.navyPower()/r),naval:1,place:'X',banner:'x'};
                  else if(kind==='rank')ctx={kind:'rank',def:Math.round(ap/r),fd:H.rkFoe({id:'zz',name:'T',hp:100,emp:{ap:300,gm:1.1,lv:8,hero:2,wr:{yari:3,kiba:3,yumi:2,ag:.7}}}),rkT:{id:'zz',name:'T',hp:100,gain:5},place:'Z',banner:'r'};
                  else ctx={kind:'city',id:c.id,fd:H.cityFoe(c),def:Math.round(ap/r),place:c.castle,banner:'x',sgStorm:kind==='siege'?1:0};
                  T.startFight(ctx)}""",[ratio,kind])
                t0=time.time();l=None
                for t in range(400):
                    await pg.wait_for_timeout(250)
                    l=await E("()=>{const L=window.__sj.last;return L&&L!==window.__sjl?L:null}")
                    if l: break
                    if not await E("()=>!!document.querySelector('#sjOv')"): await E(CL)
                for i in range(12): await pg.wait_for_timeout(250);await E(CL)
                if l:
                    key=(ratio,l['kind']);tally.setdefault(key,[0,0]);tally[key][0]+=1;tally[key][1]+=1 if l['win'] else 0
                    print(ratio,kind,json.dumps(l),round(time.time()-t0,1),flush=True)
        print('SUMMARY (ratio = my power / enemy power)')
        for k in sorted(tally): print(k,'wins %d/%d'%(tally[k][1],tally[k][0]))
        print('ERRORS',len(errs),errs[:5])
        await b.close()
asyncio.run(main())
