#!/usr/bin/env python3
"""zs.py out.jpg t1 t2 ... — side-by-side frames at 540 px wide (from frames/)"""
import sys
from PIL import Image, ImageDraw
out, ts = sys.argv[1], [float(a) for a in sys.argv[2:]]
w = 540; h = w * 16 // 9
W = Image.new('RGB', (w * len(ts), h)); D = ImageDraw.Draw(W)
for k, t in enumerate(ts):
    i = min(1673, int(round(t * 30)))
    W.paste(Image.open('frames/%05d.jpg' % i).resize((w, h), Image.LANCZOS), (k * w, 0)); D.text((k * w + 6, 6), '%.2f' % (i / 30), fill=(255, 255, 0))
W.save(out, quality=88)
