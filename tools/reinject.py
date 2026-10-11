import os
os.chdir('/home/claude/bushido')
addon=''.join(open(f,encoding='utf8').read()+'\n' for f in ['saga_a.js','saga_b.js','saga_c.js','saga_d.js','yoroi_addon.js','mapfx_addon.js','shido_addon.js','period_addon.js','empng_addon.js','kensei_addon.js','kunitori_addon.js','career_addon.js','kura_addon.js','rank_addon.js','buke_addon.js','furyu_addon.js','katoku_addon.js','gear_addon.js','arcade_addon.js','anime_addon.js','art_data.js','art_addon.js','butai_addon.js'])
assert '</script' not in addon
for fn in ['he.html','en.html']:
  s=open(fn,encoding='utf8').read()
  a=s.find('/* ================= 物語 The Saga');b=s.find('if(false)window.__t={get CAMOV()')
  assert 0<a<b
  s=s[:a]+addon+s[b:]
  open(fn,'w',encoding='utf8').write(s)
print('reinjected')
