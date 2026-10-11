import json,sys,re,os
cfg=open('config.js',encoding='utf8').read().strip() if os.path.exists('config.js') else 'window.BUSHIDO_FIREBASE=null;window.BUSHIDO_ADMIN=[];'
shim=open('shim.js',encoding='utf8').read()
g=open('../game.html',encoding='utf8').read()
V='10.12.2'
inj=f"""<script>{cfg}</script>
<script src="https://www.gstatic.com/firebasejs/{V}/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/{V}/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/{V}/firebase-firestore-compat.js"></script>
<script>{shim}</script>
<meta name="description" content="בושידו: משחק סמוראים חינמי בדפדפן. דו־קרבות, כיבוש מחוזות ביפן של תקופת סנגוקו (1460–1615), בניית שושלת דור אחרי דור, טבלת שיאים חיה ומלחמות אימפריה. Bushido: a free samurai browser game – duels, Sengoku conquest, dynasties and a live leaderboard.">
<meta name="keywords" content="משחק סמוראים,משחק חינמי,משחק דפדפן,יפן,סנגוקו,שושלת,samurai game,free browser game,sengoku,bushido,dynasty,strategy,RPG,mobile game">
<link rel="canonical" href="https://galscher.github.io/bushido/"><link rel="manifest" href="manifest.json"><link rel="apple-touch-icon" href="icon-192.png"><link rel="icon" href="icon-192.png">
<meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="Bushido">
<meta property="og:type" content="website"><meta property="og:url" content="https://galscher.github.io/bushido/"><meta property="og:site_name" content="Bushido">
<meta property="og:title" content="Bushido · בושידו – משחק סמוראים חינמי"><meta property="og:description" content="דו־קרבות, כיבוש יפן של סנגוקו, שושלת שעוברת מדור לדור וטבלת שיאים חיה. חינם, בלי הורדה."><meta property="og:image" content="https://galscher.github.io/bushido/og.png"><meta property="og:locale" content="he_IL"><meta property="og:locale:alternate" content="en_US">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="Bushido · בושידו"><meta name="twitter:description" content="A free samurai browser game: duels, Sengoku conquest, dynasties, live leaderboard."><meta name="twitter:image" content="https://galscher.github.io/bushido/og.png">
<meta name="theme-color" content="#0d0a09">
<script type="application/ld+json">{{"@context":"https://schema.org","@type":"VideoGame","name":"Bushido · בושידו","url":"https://galscher.github.io/bushido/","image":"https://galscher.github.io/bushido/og.png","description":"A free samurai browser game set in Sengoku Japan (1460–1615): duels, province conquest, dynasties passed from generation to generation, and a live leaderboard.","genre":["Strategy","RPG","Fighting"],"gamePlatform":["Web browser","Mobile"],"applicationCategory":"Game","operatingSystem":"Any","inLanguage":["he","en"],"offers":{{"@type":"Offer","price":"0","priceCurrency":"USD"}},"author":{{"@type":"Organization","name":"Bushido Dojo"}}}}</script>
"""
i=g.find('<head>')
assert i>0
out=g[:i+6]+inj+g[i+6:]
os.makedirs('out',exist_ok=True)
open('out/index.html','w',encoding='utf8').write(out)
print('built out/index.html',len(out))
