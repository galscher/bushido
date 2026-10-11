# he.html/en.html already contain the v50 addon (merged into the live version); just wrap them.
import json
pre=open('wrap_pre.html',encoding='utf8').read();post=open('wrap_post.html',encoding='utf8').read()
js=lambda s: json.dumps(s,ensure_ascii=False).replace('</','<\\/')
he=open('he.html',encoding='utf8').read();en=open('en.html',encoding='utf8').read()
open('game.html','w',encoding='utf8').write(pre+'{he:'+js(he)+',en:'+js(en)+post)
