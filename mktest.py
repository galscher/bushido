# Local test copy only: re-enable debug hooks that the published build disables.
s=open('game.html',encoding='utf8').read()
n=s.count('if(false)window.__')
s=s.replace('if(false)window.__','if(true)window.__')
open('game_test.html','w',encoding='utf8').write(s)
print('hooks re-enabled',n)
