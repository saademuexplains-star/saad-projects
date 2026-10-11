#!/usr/bin/env python3
"""Coarse loudness envelope (10 bins/s as ' .:-=+*#%@') and spectral centroid per clip, to pick variants."""
import sys, subprocess
import numpy as np
chars = ' .:-=+*#%@'
for f in sys.argv[1:]:
    x = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", f, "-ac", "1", "-ar", "22050", "-f", "f32le", "-"], capture_output=True).stdout, np.float32)
    sr = 22050; hop = sr // 10
    rms = np.array([np.sqrt(np.mean(x[i:i + hop] ** 2)) for i in range(0, len(x) - hop + 1, hop)])
    db = 20 * np.log10(rms + 1e-7); top = db.max()
    s = ''.join(chars[int(np.clip((d - top + 36) / 36 * 9, 0, 9))] for d in db)
    X = np.abs(np.fft.rfft(x)); fr = np.fft.rfftfreq(len(x), 1 / sr)
    cen = (X * fr).sum() / (X.sum() + 1e-9)
    lo = X[fr < 250].sum() / (X.sum() + 1e-9)
    print(f"{f.split('/')[-1]:15s} cen {cen:5.0f}Hz low {lo:4.2f} |{s}|")
