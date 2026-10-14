#!/usr/bin/env python3
"""Quick facts per audio file: duration, peak/RMS dBFS, spectral centroid, low-end share, loud-region timing."""
import sys, subprocess
import numpy as np
for f in sys.argv[1:]:
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", f, "-ac", "1", "-ar", "22050", "-f", "f32le", "-"], capture_output=True).stdout
    x = np.frombuffer(raw, np.float32)
    if not len(x): print(f, "EMPTY"); continue
    sr = 22050; spec = np.abs(np.fft.rfft(x * np.hanning(len(x)))) ; fr = np.fft.rfftfreq(len(x), 1 / sr)
    cen = (spec * fr).sum() / spec.sum(); low = spec[fr < 200].sum() / spec.sum()
    hop = sr // 20; env = np.array([np.sqrt(np.mean(x[i:i + hop] ** 2)) for i in range(0, len(x) - hop, hop)])
    db = 20 * np.log10(env + 1e-6); strip = "".join(" .:-=+*#%@"[min(9, max(0, int((v + 60) / 6)))] for v in db)
    print(f"{f.split('/')[-1]:14s} {len(x)/sr:5.2f}s peak {20*np.log10(np.abs(x).max()+1e-9):6.1f} rms {20*np.log10(np.sqrt(np.mean(x**2))+1e-9):6.1f}  centroid {cen:5.0f}Hz  <200Hz {low*100:4.1f}%  |{strip[:80]}|")
