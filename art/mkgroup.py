"""Slice a 2x2 group sheet (four different subjects) into four keyed WebP icons.
usage: python3 mkgroup.py SHEET name_tl,name_tr,name_bl,name_br [--tight]"""
import sys, json, os
import numpy as np
from PIL import Image
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import mksheet
HERE=os.path.dirname(os.path.abspath(__file__))
src,names=sys.argv[1],sys.argv[2].split(',')
mksheet.TIGHT='--tight' in sys.argv
a=np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
H,W,_=a.shape
fg,bg=mksheet.key_mask(a)
rgba=np.dstack([np.clip(a,0,255),fg*255.0]).astype(np.uint8)
ys=mksheet.split(fg.mean(1),int(H*.3),int(H*.7))
cells=[]
for y0,y1 in ((0,ys),(ys,H)):
    xs=mksheet.split(fg[y0:y1].mean(0),int(W*.25),int(W*.75))
    cells+=[(0,xs,y0,y1),(xs,W,y0,y1)]
man_path=os.path.join(HERE,'items.json')
man=json.load(open(man_path)) if os.path.exists(man_path) else {}
for n,(x0,x1,y0,y1) in zip(names,cells):
    if n=='-':continue
    im=Image.fromarray(rgba[y0:y1,x0:x1],'RGBA');bb=im.getbbox();im=im.crop(bb)
    f=min(1,360/max(im.size));im=im.resize((max(1,round(im.width*f)),max(1,round(im.height*f))),Image.LANCZOS)
    fn=f'i_{n}.webp';im.save(os.path.join(HERE,fn),'WEBP',quality=88,method=6,alpha_quality=100)
    man[n]={'src':'art/'+fn,'w':im.width,'h':im.height}
json.dump(man,open(man_path,'w'),indent=1)
print('ok',names)
