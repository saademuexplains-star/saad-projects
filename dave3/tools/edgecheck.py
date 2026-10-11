# composite cutouts on black + zoomed edge crops so halos are obvious
import sys, os, numpy as np
from PIL import Image
out=sys.argv[1]; fs=sys.argv[2:]
tiles=[]
for f in fs:
    im=Image.open(f).convert('RGBA'); a=np.array(im)
    bg=Image.new('RGBA',im.size,(0,0,0,255)); bg.alpha_composite(im)
    full=bg.copy(); full.thumbnail((380,380))
    # zoom crop around the edge pixel with most partial alpha in a window
    al=a[...,3].astype(float)/255; part=((al>0.05)&(al<0.95)).astype(float)
    import cv2
    dens=cv2.boxFilter(part,-1,(60,60)); y,x=np.unravel_index(dens.argmax(),dens.shape)
    x0=max(0,min(x-60,im.width-120)); y0=max(0,min(y-60,im.height-120))
    crop=bg.crop((x0,y0,x0+120,y0+120)).resize((380,380),Image.NEAREST)
    t=Image.new('RGB',(760,400),(0,0,0)); t.paste(full.convert('RGB'),(0,0)); t.paste(crop.convert('RGB'),(380,0)); tiles.append(t)
H=Image.new('RGB',(1520,400*((len(tiles)+1)//2)))
for i,t in enumerate(tiles): H.paste(t,((i%2)*760,(i//2)*400))
H.save(out,quality=90)
