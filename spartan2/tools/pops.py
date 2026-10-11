#!/usr/bin/env python3
"""Smoothness check: per-frame mean abs difference (luma). Prints each transition window's profile and flags
single-frame spikes outside windows (pops)."""
import sys, subprocess, re, numpy as np
f = sys.argv[1]; W, H = 270, 480
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-vf', f'scale={W}:{H},format=gray', '-f', 'rawvideo', '-'], capture_output=True).stdout
V = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)
d = np.r_[0, np.abs(np.diff(V, axis=0)).mean(axis=(1, 2))]
src = open('project.js').read()
tr = [(float(a), float(b), float(c), s) for a, b, c, s in re.findall(r"\[(\d+\.\d+), (\d+\.\d+), (\d+\.\d+), '(\w+)'", src[src.index('const TRANS'):])]
inwin = np.zeros(len(d), bool)
for cut, a, b, s in tr:
    f0, f1 = int(np.floor(a * 30)) - 1, int(np.ceil(b * 30)) + 2
    inwin[max(0, f0):f1] = True
    print(f'{s:10s} {cut:5.2f}: ' + ' '.join(f'{d[i]:4.1f}' for i in range(f0, min(f1, len(d)))))
med = np.median(d)
spk = [i for i in range(2, len(d) - 2) if not inwin[i] and d[i] > max(6, 3 * np.median(d[i - 2:i + 3][[0, 1, 3, 4]]))]
print('median frame diff', round(float(med), 2), '| spikes outside transitions:', ' '.join(f'{i/30:.2f}({d[i]:.1f})' for i in spk))
