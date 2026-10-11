#!/usr/bin/env python3
"""Shorten silent gaps in a voiceover.  tighten.py in.wav out.wav [max_gap_s] [min_gap_s]
Gaps quieter than (95th-percentile level - 32 dB) and longer than max_gap are cut down to keep_gap,
removing the middle with short crossfades so no clicks. Prints each gap and the time map."""
import sys, wave, json
import numpy as np
src, dst = sys.argv[1], sys.argv[2]
MAXG = float(sys.argv[3]) if len(sys.argv) > 3 else .15
KEEP = float(sys.argv[4]) if len(sys.argv) > 4 else .10
w = wave.open(src); sr = w.getframerate(); ch = w.getnchannels()
x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
if ch > 1: x = x.reshape(-1, ch).mean(1)
hop = sr // 100; win = 2 * hop
rms = np.array([np.sqrt(np.mean(x[i:i + win] ** 2) + 1e-12) for i in range(0, len(x) - win, hop)])
db = 20 * np.log10(rms)
thr = np.percentile(db, 95) - 32
quiet = db < thr
gaps = []; i = 0
while i < len(quiet):
    if quiet[i]:
        j = i
        while j < len(quiet) and quiet[j]: j += 1
        s, e = i * hop, min(len(x), j * hop + win // 2)
        if (e - s) / sr > MAXG and s > 0 and e < len(x): gaps.append((s, e))
        i = j
    else: i += 1
fade = int(.008 * sr); keep = int(KEEP * sr)
out = []; pos = 0; tmap = [[0.0, 0.0]]; removed = 0
for s, e in gaps:
    cut_s = s + keep // 2; cut_e = e - keep // 2
    if cut_e - cut_s <= 2 * fade: continue
    a = x[pos:cut_s + fade].copy(); b = x[cut_e - fade:e].copy()
    ramp = np.linspace(1, 0, fade)
    a[-fade:] = a[-fade:] * ramp + b[:fade] * (1 - ramp)
    out.append(a); pos = cut_e - fade + fade  # continue after the crossfaded part
    out.append(x[cut_e:cut_e]); 
    removed += (cut_e - cut_s) - fade
    tmap.append([round(cut_s / sr, 3), round((cut_s - (removed - ((cut_e - cut_s) - fade))) / sr, 3)])
    tmap.append([round(cut_e / sr, 3), round((cut_e - removed) / sr, 3)])
    print(f"gap {s / sr:6.2f}-{e / sr:6.2f} ({(e - s) / sr:.2f}s) -> {KEEP:.2f}s")
out.append(x[pos:])
y = np.concatenate(out)
with wave.open(dst, 'wb') as o:
    o.setnchannels(1); o.setsampwidth(2); o.setframerate(sr); o.writeframes((np.clip(y, -1, 1) * 32767).astype(np.int16).tobytes())
json.dump(tmap, open(dst + '.map.json', 'w'))
print(f"threshold {thr:.1f} dBFS, {len(gaps)} gaps, {len(x) / sr:.2f}s -> {len(y) / sr:.2f}s")
