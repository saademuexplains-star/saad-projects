#!/usr/bin/env python3
"""QA for a rendered frame sequence (Linux port of cmpdir2.ps1 / scan.ps1 / glitch.ps1).

  python3 -I _tools/qa.py cmp  <dirA> <dirB> [--from n --to m]   two passes: worst 16x16 block mean |diff| per frame
                                                                 (every frame must be under 6)
  python3 -I _tools/qa.py scan <dir> [--from n --to m]           frame-to-frame change; flags spikes (a frame that
                                                                 differs from BOTH neighbours much more than they
                                                                 differ from each other: a one-frame glitch) and the
                                                                 loop seam (last frame -> first)
Frames are f00000.jpg ... as written by cdp.cjs.
"""
import sys, os
import numpy as np
from PIL import Image


def load(d, n, scale=4):
    im = Image.open(os.path.join(d, 'f%05d.jpg' % n)).convert('L')
    if scale > 1:
        im = im.resize((im.width // scale, im.height // scale), Image.BILINEAR)
    return np.asarray(im, dtype=np.float32)


def frames(d):
    return sorted(int(f[1:6]) for f in os.listdir(d) if f.startswith('f') and f.endswith('.jpg'))


def rng(args, fr):
    a = int(args[args.index('--from') + 1]) if '--from' in args else fr[0]
    b = int(args[args.index('--to') + 1]) if '--to' in args else fr[-1]
    return [n for n in fr if a <= n <= b]


def block_worst(x, y, b=16):
    d = np.abs(x - y)
    h, w = d.shape[0] // b * b, d.shape[1] // b * b
    d = d[:h, :w].reshape(h // b, b, w // b, b).mean(axis=(1, 3))
    return float(d.max())


def cmp(A, B, args):
    fa = frames(A); fb = set(frames(B))
    bad = []; worst = 0
    for n in rng(args, fa):
        if n not in fb:
            bad.append((n, 'missing in B')); continue
        x = np.asarray(Image.open(os.path.join(A, 'f%05d.jpg' % n)).convert('L'), dtype=np.float32)
        y = np.asarray(Image.open(os.path.join(B, 'f%05d.jpg' % n)).convert('L'), dtype=np.float32)
        w = block_worst(x, y)
        worst = max(worst, w)
        if w >= 6:
            bad.append((n, round(w, 2)))
    print('compared', len(rng(args, fa)), 'frames; worst block diff', round(worst, 2))
    print('frames over 6:', len(bad), bad[:60])


def scan(D, args):
    fr = rng(args, frames(D))
    prev = None; diffs = {}
    for n in fr:
        x = load(D, n)
        if prev is not None:
            diffs[n] = float(np.abs(x - prev).mean())
        prev = x
    vals = np.array(list(diffs.values()))
    med = float(np.median(vals)) if len(vals) else 0
    print('frames', len(fr), 'median diff', round(med, 3), 'mean', round(float(vals.mean()), 3) if len(vals) else 0, 'max', round(float(vals.max()), 3) if len(vals) else 0)
    # spike: d(n-1 -> n) and d(n -> n+1) both large while d(n-1 -> n+1) is small
    spikes = []
    for n in fr[1:-1]:
        if n not in diffs or n + 1 not in diffs:
            continue
        a, b = diffs[n], diffs[n + 1]
        if min(a, b) > max(3 * med, 1.5):
            skip = float(np.abs(load(D, n + 1) - load(D, n - 1)).mean())
            if skip < 0.5 * min(a, b):
                spikes.append((n, round(a, 2), round(b, 2), round(skip, 2)))
    print('spikes (frame, in, out, skip):', len(spikes), spikes[:40])
    big = sorted(diffs.items(), key=lambda kv: -kv[1])[:20]
    print('largest steps:', [(n, round(v, 2)) for n, v in big])
    if fr[0] == 0:
        last = fr[-1]
        seam = float(np.abs(load(D, 0) - load(D, last)).mean())
        print('loop seam (last %d -> 0):' % last, round(seam, 3), '(median step', round(med, 3), ')')


if __name__ == '__main__':
    cmd = sys.argv[1]
    if cmd == 'cmp':
        cmp(sys.argv[2], sys.argv[3], sys.argv[4:])
    elif cmd == 'scan':
        scan(sys.argv[2], sys.argv[3:])
