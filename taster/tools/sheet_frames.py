#!/usr/bin/env python3
"""sheet_frames.py <framesdir> <out.jpg> <t0> <t1> <step_s> [cols] — labelled contact sheet of rendered frames"""
import sys, os
from PIL import Image, ImageDraw
d, out, t0, t1, st = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4]), float(sys.argv[5])
cols = int(sys.argv[6]) if len(sys.argv) > 6 else 12
idx = []
t = t0
while t <= t1 + 1e-6:
    idx.append(int(round(t * 30))); t += st
w, h = 135, 240
rows = (len(idx) + cols - 1) // cols
W = Image.new('RGB', (w * cols, (h + 16) * rows)); D = ImageDraw.Draw(W)
for k, i in enumerate(idx):
    f = os.path.join(d, '%05d.jpg' % i)
    if not os.path.exists(f): continue
    x = (k % cols) * w; y = (k // cols) * (h + 16)
    W.paste(Image.open(f).convert('RGB').resize((w, h)), (x, y + 16)); D.text((x + 3, y + 2), '%.2f' % (i / 30), fill=(255, 255, 0))
W.save(out, quality=85)
