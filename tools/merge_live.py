# Merge this chat's work onto the live published page, without touching anything else in it.
# Usage: python3 -I tools/merge_live.py LIVE.html OUT.html
#  - the 戦場 battlefield addon block is replaced by senjo_addon.js (or inserted before itemsx if absent)
#  - the 血気 duel addon (kekki_addon.js) is inserted right before the battlefield block if absent, else replaced
#  - tools/nogun.py replacements run over both language documents
import sys,json,os,subprocess,tempfile
os.chdir('/home/claude/bushido')
live,out=sys.argv[1],sys.argv[2]
s=open(live,encoding='utf8').read()
dec=json.JSONDecoder()
i=s.index('const DOCS={he:')+len('const DOCS={he:');he,j=dec.raw_decode(s,i);k=s.index('en:',j)+3;en,l=dec.raw_decode(s,k)
SEN=open('senjo_addon.js',encoding='utf8').read()+'\n';KEK=open('kekki_addon.js',encoding='utf8').read()+'\n'
assert '</script' not in SEN+KEK
SEN_H='/* ================= 戦場 Senjō';KEK_H='/* ================= 血気 Kekki';NEXT=['/* ================= 絵 more illustrated pieces','if(false)window.__t={get CAMOV()']
def block(doc,head):
  a=doc.find(head)
  if a<0:return None
  ends=[doc.find(h,a+10) for h in ['/* ================= ']+NEXT]
  ends=[e for e in ends if e>a]
  return a,min(ends)
def merge(doc):
  b=block(doc,KEK_H)
  if b:doc=doc[:b[0]]+doc[b[1]:]
  b=block(doc,SEN_H)
  if b:doc=doc[:b[0]]+KEK+SEN+doc[b[1]:]
  else:
    for h in NEXT:
      a=doc.find(h)
      if a>0:doc=doc[:a]+KEK+SEN+doc[a:];break
  assert doc.count(SEN_H)==1 and doc.count(KEK_H)==1
  return doc
# blocks this chat keeps at the very end of the addons (replaced if present, else inserted before the debug hooks)
TAIL=[('artmap_addon.js','/* ================= 絵 the art we already have'),('season_addon.js','/* ================= 場所 the weekly season')]
def merge_am(doc):
  for fn,H in TAIL:
    B=open(fn,encoding='utf8').read()+'\n';assert '</script' not in B
    a=doc.find(H)
    if a>=0:
      e=min([x for x in [doc.find('/* ================= ',a+10),doc.find('if(false)window.__t={get CAMOV()')] if x>a])
      doc=doc[:a]+doc[e:]
    m=doc.find('if(false)window.__t={get CAMOV()');doc=doc[:m]+B+doc[m:];assert doc.count(H)==1
  return doc
# another chat may have touched one of these blocks on the live page: say so loudly, so it is adopted, never erased
def drift(doc,lang):
  for fn,H in [('kekki_addon.js',KEK_H),('senjo_addon.js',SEN_H)]+TAIL:
    b=block(doc,H) if H in (KEK_H,SEN_H) else None
    if H not in (KEK_H,SEN_H):
      a=doc.find(H)
      if a<0:continue
      e=min([x for x in [doc.find('/* ================= ',a+10),doc.find('if(false)window.__t={get CAMOV()')] if x>a]);b=(a,e)
    if not b:continue
    live=doc[b[0]:b[1]].strip()
    if live!=open(fn,encoding='utf8').read().strip() and live!=subprocess.run(['git','show','HEAD:'+fn],capture_output=True,text=True).stdout.strip():print('WARNING: the live',lang,'copy of',fn,'differs from the local file: adopt the live change before merging')
drift(he,'he');drift(en,'en')
he,en=merge_am(merge(he)),merge_am(merge(en))
with tempfile.TemporaryDirectory() as d:
  ph,pe=os.path.join(d,'he.html'),os.path.join(d,'en.html')
  open(ph,'w',encoding='utf8').write(he);open(pe,'w',encoding='utf8').write(en)
  r=subprocess.run([sys.executable,'-I','tools/nogun.py',ph,pe],capture_output=True,text=True);print(r.stdout.strip())
  he=open(ph,encoding='utf8').read();en=open(pe,encoding='utf8').read()
js=lambda x:json.dumps(x,ensure_ascii=False).replace('</','<\\/')
o=s[:i]+js(he)+s[j:k]+js(en)+s[l:]
i2=o.index('const DOCS={he:')+len('const DOCS={he:');a,j2=dec.raw_decode(o,i2);b,_=dec.raw_decode(o,o.index('en:',j2)+3)
assert a==he and b==en and o.count('if(true)window.__')==0
open(out,'w',encoding='utf8').write(o)
open(out+'.he.html','w',encoding='utf8').write(he);open(out+'.en.html','w',encoding='utf8').write(en)
print('merged',len(s),'->',len(o))
