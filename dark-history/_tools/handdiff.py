#!/usr/bin/env python3
"""Hand audit by difference: a frame rendered with ?dbghands (every hand magenta) against the same frame of the final
render - every pixel that differs is a visible hand pixel, whatever the scene's light does to the colour (in the green
dark of the Radium Girls the magenta itself is lost). Prints, per audit frame, the count and bounding box of what
differs; frames without a visible hand print nothing.
  python3 -I _tools/handdiff.py <hands.json from handaudit.js> <dbg frames dir> <final frames dir> [min px=80] [thr=30]
"""
import json, sys, os
import numpy as np
from PIL import Image
AUD, DBG, FIN = sys.argv[1], sys.argv[2], sys.argv[3]
MINPX = int(sys.argv[4]) if len(sys.argv) > 4 else 80
THR = int(sys.argv[5]) if len(sys.argv) > 5 else 30
d = json.load(open(AUD))
for n, sid, hands in d:
    a, b = f'{DBG}/f{n:05d}.jpg', f'{FIN}/f{n:05d}.jpg'
    if not (os.path.exists(a) and os.path.exists(b)):
        continue
    x = np.asarray(Image.open(a).convert('RGB')).astype(np.int16)
    y = np.asarray(Image.open(b).convert('RGB')).astype(np.int16)
    m = np.abs(x - y).max(axis=2) > THR
    cnt = int(m.sum())
    if cnt < MINPX:
        continue
    ys, xs = np.nonzero(m)
    print(f'{n:5d} {sid:8s} hand px {cnt:6d}  box x {xs.min()}-{xs.max()} y {ys.min()}-{ys.max()}')
