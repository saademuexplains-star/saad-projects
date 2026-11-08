"""Port of audiotool.ps1 (scan / trim) for Linux: RMS dBFS per 10 ms; silences under ThreshDb lasting MinGap or more are
shortened to MaxGap (lead and tail special), with 6 ms fades at every cut; writes <out>.map.txt (kept original range
-> output start), like the PowerShell tool.
  python3 -I audiotool.py trim in.wav out.wav [--maxgap 0.11 --mingap 0.15 --lead 0.04 --tail 0.12 --thresh -38]
  python3 -I audiotool.py scan in.wav
"""
import argparse, wave
import numpy as np

def read(p):
    with wave.open(p, 'rb') as w:
        ch, rate, n = w.getnchannels(), w.getframerate(), w.getnframes()
        a = np.frombuffer(w.readframes(n), dtype='<i2').reshape(-1, ch)
    return a, rate

def write(p, a, rate):
    with wave.open(p, 'wb') as w:
        w.setnchannels(a.shape[1]); w.setsampwidth(2); w.setframerate(rate); w.writeframes(a.astype('<i2').tobytes())

def env(a, rate):
    fr = rate // 100; n = len(a) // fr
    x = a[:n * fr].astype(np.float64) / 32768.0
    x = x.reshape(n, fr * a.shape[1])
    return 20 * np.log10(np.sqrt((x * x).mean(axis=1)) + 1e-9)

def silences(e, thr, mingap):
    r, i, n = [], 0, len(e)
    while i < n:
        if e[i] < thr:
            j = i
            while j < n and e[j] < thr: j += 1
            s, t = i / 100.0, j / 100.0
            if t - s >= mingap or i == 0 or j == n: r.append((s, t))
            i = j
        else: i += 1
    return r

def trim(a, rate, sil, keep, lead, tail, total):
    keepR, prev = [], 0.0
    for s, t in sil:
        if s <= 0.001: prev = max(0.0, t - lead); continue
        if t >= total - 0.011: keepR.append((prev, min(total, s + tail))); prev = -1; break
        keepR.append((prev, s + keep / 2)); prev = t - keep / 2
    if prev >= 0: keepR.append((prev, total))
    fade = int(0.006 * rate); out, mp, pos = [], [], 0
    for k0, k1 in keepR:
        i0, i1 = int(round(k0 * rate)), min(len(a), int(round(k1 * rate)))
        seg = a[i0:i1].astype(np.float64)
        m = len(seg); g = np.ones(m)
        if m > 2 * fade: g[:fade] = np.arange(fade) / fade; g[m - fade:] = np.minimum(g[m - fade:], (np.arange(fade, 0, -1)) / fade)
        out.append(seg * g[:, None]); mp.append((k0, k1, pos / rate)); pos += m
    return np.round(np.concatenate(out)).astype(np.int16), mp

ap = argparse.ArgumentParser()
ap.add_argument('mode'); ap.add_argument('inp'); ap.add_argument('out', nargs='?')
ap.add_argument('--maxgap', type=float, default=0.11); ap.add_argument('--mingap', type=float, default=0.15)
ap.add_argument('--lead', type=float, default=0.04); ap.add_argument('--tail', type=float, default=0.12); ap.add_argument('--thresh', type=float, default=-38)
o = ap.parse_args()
a, rate = read(o.inp); total = len(a) / rate; e = env(a, rate)
if o.mode == 'scan':
    print(f'rate={rate} ch={a.shape[1]} dur={total:.3f}s')
    for s, t in silences(e, o.thresh, o.mingap): print(f'silence {s:6.2f} - {t:6.2f}  ({t - s:.2f}s)')
else:
    sil = silences(e, o.thresh, o.mingap)
    b, mp = trim(a, rate, sil, o.maxgap, o.lead, o.tail, total)
    write(o.out, b, rate)
    with open(o.out + '.map.txt', 'w') as f:
        for k0, k1, st in mp: f.write(f'{k0:.3f} {k1:.3f} {st:.3f}\n')
    print(f'trimmed: {total:.3f}s -> {len(b) / rate:.3f}s ({len(mp)} kept ranges)')
