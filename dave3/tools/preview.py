import sys, os
from PIL import Image, ImageDraw
out=sys.argv[1]; fs=sys.argv[2:]
W=400; cols=4; rows=(len(fs)+cols-1)//cols
sheet=Image.new('RGB',(cols*W,rows*W),(40,90,140)); d=ImageDraw.Draw(sheet)
for i,f in enumerate(fs):
    im=Image.open(f).convert('RGBA'); im.thumbnail((W-10,W-30))
    x=(i%cols)*W; y=(i//cols)*W
    bgc=(40,90,140) if i%2==0 else (200,160,90)
    tile=Image.new('RGBA',(W,W),bgc+(255,)); tile.alpha_composite(im,((W-im.width)//2,(W-30-im.height)//2))
    sheet.paste(tile.convert('RGB'),(x,y)); d.text((x+4,y+W-20),os.path.basename(f),fill='white')
sheet.save(out,quality=88)
