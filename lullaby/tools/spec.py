#!/usr/bin/env python3
"""spec.py in.wav out.png [marks...] — log-frequency spectrogram + loudness strip (QC only)"""
import sys, wave, numpy as np
from PIL import Image, ImageDraw
f, out = sys.argv[1], sys.argv[2]; marks = [float(m) for m in sys.argv[3:]]
w = wave.open(f); sr = w.getframerate(); ch = w.getnchannels()
x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32).reshape(-1, ch).mean(1) / 32768
hop, nfft = 480, 4096; nfr = (len(x) - nfft) // hop
win = np.hanning(nfft); S = np.empty((nfr, nfft // 2 + 1), np.float32)
for i in range(nfr): S[i] = np.abs(np.fft.rfft(x[i * hop:i * hop + nfft] * win))
fr = np.fft.rfftfreq(nfft, 1 / sr); H = 360
logf = np.geomspace(25, 14000, H); idx = np.searchsorted(fr, logf)
D = 20 * np.log10(S[:, idx] + 1e-6); D = np.clip((D + 30) / 70, 0, 1)          # -30..+40 dB window
W = 1760; cols = np.linspace(0, nfr - 1, W).astype(int); img = D[cols].T[::-1]
r = (np.clip(img * 1.6, 0, 1) * 255); g = (np.clip(img * 1.6 - .5, 0, 1) * 255); b = (np.clip(.4 + img - img ** 2 * 1.4, 0, 1) * 255)
spec = Image.fromarray(np.stack([r, g, b], -1).astype(np.uint8))
# loudness strip: 400 ms RMS in dBFS
n = len(x); dur = n / sr; t = np.linspace(0, dur, W); rms = []
for tt in t:
    a = int(max(0, (tt - .2) * sr)); b2 = int(min(n, (tt + .2) * sr)); rms.append(20 * np.log10(np.sqrt(np.mean(x[a:b2] ** 2)) + 1e-9))
rms = np.array(rms); Hs = 140
strip = Image.new('RGB', (W, Hs), (12, 12, 16)); d = ImageDraw.Draw(strip)
for k, v in enumerate(rms):
    y = int(np.clip((-(v) / 60), 0, 1) * (Hs - 1)); d.line([(k, Hs - 1), (k, y)], fill=(90, 160, 220))
for lv in (-10, -20, -30, -40, -50):
    y = int(-lv / 60 * (Hs - 1)); d.line([(0, y), (W, y)], fill=(60, 60, 60)); d.text((2, y - 11), f'{lv}', fill=(150, 150, 150))
img = Image.new('RGB', (W, H + Hs + 24), (0, 0, 0)); img.paste(spec, (0, 0)); img.paste(strip, (0, H + 24)); D2 = ImageDraw.Draw(img)
for s in range(0, int(dur) + 1, 2):
    xx = int(s / dur * (W - 1)); D2.line([(xx, H), (xx, H + 6)], fill=(200, 200, 200)); D2.text((xx + 2, H + 6), str(s), fill=(200, 200, 200))
for m in marks:
    xx = int(m / dur * (W - 1)); D2.line([(xx, 0), (xx, H + Hs + 24)], fill=(255, 220, 0)); D2.text((xx + 2, 2), f'{m:g}', fill=(255, 220, 0))
for hzv in (50, 100, 200, 500, 1000, 2000, 5000, 10000):
    yy = H - 1 - int(np.searchsorted(logf, hzv) / H * H); D2.text((W - 44, yy - 6), f'{hzv}', fill=(170, 170, 170))
img.save(out)
