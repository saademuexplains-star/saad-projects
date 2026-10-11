#!/usr/bin/env python3
"""Print transient onsets (time, level) for each audio file — where barks/hits/roars start."""
import sys, subprocess
import numpy as np
for f in sys.argv[1:]:
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", f, "-ac", "1", "-ar", "22050", "-f", "f32le", "-"], capture_output=True).stdout
    x = np.frombuffer(raw, np.float32); sr = 22050; hop = sr // 100
    env = np.array([np.sqrt(np.mean(x[i:i + 2 * hop] ** 2)) for i in range(0, len(x) - 2 * hop, hop)])
    db = 20 * np.log10(env + 1e-6); peak = db.max()
    ons = []
    for i in range(4, len(db)):
        if db[i] - db[i - 4] > 9 and db[i] > peak - 20 and (not ons or i - ons[-1][0] > 15):
            ons.append((i, db[i]))
    loud = np.where(db > peak - 6)[0]
    print(f"{f.split('/')[-1]:13s} peak {peak:5.1f}dB  onsets: " + " ".join(f"{i/100:.2f}" for i, _ in ons[:8]) + f"   loud region {loud[0]/100:.2f}-{loud[-1]/100:.2f}s")
