#!/usr/bin/env python3
"""Hand audit, visible pixels: frames rendered with ?dbghands (every hand magenta) -> for every frame, the magenta blobs
(a hand that shows), with their bounding boxes. A shot whose hands should all be hidden must have none; the shots with
hands in view list theirs for a full-size look.
  python3 -I _tools/handvis.py <hands.json from handaudit.js> <dbg frames dir> [min px=40]
"""
import json, sys, os
import numpy as np
from PIL import Image
AUD, FR = sys.argv[1], sys.argv[2]
MINPX = int(sys.argv[3]) if len(sys.argv) > 3 else 40
d = json.load(open(AUD))
for n, sid, hands in d:
    p = f'{FR}/f{n:05d}.jpg'
    if not os.path.exists(p):
        continue
    a = np.asarray(Image.open(p).convert('RGB')).astype(np.int16)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    m = (r - g > 50) & (b - g > 40) & (r > 90) & (b > 70)
    cnt = int(m.sum())
    if cnt < MINPX:
        continue
    ys, xs = np.nonzero(m)
    # coarse blobs: 40 px grid cells with magenta, merged by rows
    cells = sorted({(int(y // 40), int(x // 40)) for y, x in zip(ys, xs)})
    print(f'{n:5d} {sid:8s} magenta px {cnt:6d}  box x {xs.min()}-{xs.max()} y {ys.min()}-{ys.max()}  cells {len(cells)}')
