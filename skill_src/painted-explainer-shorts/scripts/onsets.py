#!/usr/bin/env python3
"""Find syllable onsets / loudness hits in a voiceover — the moments motion should land on.

    python onsets.py voice.wav [--start 0] [--end 6]

Prints onset times and a coarse loudness strip (one char = 50 ms, ' ' quiet → '@' loud).
Use it together with the word timings: the STRESSED syllable of a key word (na-PO-leon, RAB-bits)
is where the big action goes, and it is often 0.1–0.4 s after the word starts. Needs numpy + ffmpeg.
"""
import subprocess, sys
import numpy as np

args = sys.argv[1:]
src = args[0]
opt = lambda k, d: float(args[args.index(k) + 1]) if k in args else d
start, end = opt("--start", 0.0), opt("--end", 0.0)
cmd = ["ffmpeg", "-v", "error", "-ss", str(start), "-i", src, "-ac", "1", "-ar", "16000", "-f", "s16le"]
if end: cmd += ["-t", str(end - start)]
x = np.frombuffer(subprocess.run(cmd + ["-"], capture_output=True, check=True).stdout, dtype=np.int16).astype(np.float32) / 32768
hop = 160
rms = np.array([np.sqrt(np.mean(x[i:i + 320] ** 2)) for i in range(0, max(1, len(x) - 320), hop)])
db = 20 * np.log10(rms + 1e-5)
sm = np.convolve(db, np.ones(3) / 3, mode="same")
on = [i for i in range(3, len(sm) - 1) if sm[i] - sm[i - 3] > 6 and sm[i] > -38 and sm[i] >= sm[i + 1] - 1]
merged = []
for i in on:
    if not merged or i - merged[-1] > 8:
        merged.append(i)
print("onsets:", " ".join(f"{start + i / 100:.2f}" for i in merged))
strip = "".join(" .:-=+*#%@"[min(9, max(0, int((v + 50) / 4)))] for v in db[::5])
for k in range(0, len(strip), 40):
    print(f"{start + k * .05:6.2f} {strip[k:k + 40]}")
