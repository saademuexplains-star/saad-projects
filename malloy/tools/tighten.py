#!/usr/bin/env python3
"""Tighten a voiceover: pauses longer than MAXP are shortened to MAXP (cut from their middle, 15 ms crossfades), the
lead-in trimmed to LEAD and the tail to TAIL. Writes the wav and a time map [[t_in, t_out], ...] for word timings.
   tighten.py in.wav out.wav map.json [maxp=.22] [lead=.06] [tail=.35]"""
import sys, wave, json, numpy as np
src, dst, mp = sys.argv[1:4]; MAXP = float(sys.argv[4]) if len(sys.argv) > 4 else .22
LEAD = float(sys.argv[5]) if len(sys.argv) > 5 else .06; TAIL = float(sys.argv[6]) if len(sys.argv) > 6 else .35
w = wave.open(src); sr = w.getframerate(); a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(float) / 32768
hop = int(.01 * sr); n = len(a) // hop; e = np.array([np.sqrt((a[i * hop:(i + 1) * hop] ** 2).mean()) for i in range(n)]); db = 20 * np.log10(e + 1e-9)
sil = db < db.max() - 38
runs = []; i = 0
while i < n:
    if sil[i]:
        j = i
        while j < n and sil[j]: j += 1
        runs.append((i * hop, j * hop)); i = j
    else: i += 1
keep = []; pos = 0; first = True
for s0, s1 in runs:
    L = (s1 - s0) / sr
    if s0 == 0:                       # leading silence
        pos = max(0, s1 - int(LEAD * sr)); continue
    if s1 >= n * hop - hop:           # trailing silence
        keep.append((pos, min(len(a), s0 + int(TAIL * sr)))); pos = None; break
    if L > MAXP:
        mid = (s0 + s1) // 2; half = int(MAXP * sr / 2)
        keep.append((pos, mid - half)); pos = mid + half
if pos is not None: keep.append((pos, len(a)))
xf = int(.015 * sr); out = np.zeros(0); tmap = []
for k, (p0, p1) in enumerate(keep):
    seg = a[p0:p1].copy()
    if len(out) and xf < len(seg):
        r = np.linspace(0, 1, xf); out[-xf:] = out[-xf:] * (1 - r) + seg[:xf] * r; seg = seg[xf:]; base = len(out) - xf
    else: base = len(out)
    tmap.append([p0 / sr, base / sr]); out = np.concatenate([out, seg])
with wave.open(dst, 'wb') as o:
    o.setnchannels(1); o.setsampwidth(2); o.setframerate(sr); o.writeframes((np.clip(out, -1, 1) * 32767).astype(np.int16).tobytes())
json.dump(tmap, open(mp, 'w'))
print(f'{len(a) / sr:.2f}s -> {len(out) / sr:.2f}s, {len(keep)} pieces')
