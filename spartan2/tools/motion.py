#!/usr/bin/env python3
"""Frame-to-frame global motion of a video (phase correlation on downscaled luma).
Prints shake bursts (fast back-and-forth motion) and sudden jumps that are not cuts."""
import sys, subprocess, numpy as np
f = sys.argv[1]; W, H = 216, 384
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-vf', f'scale={W}:{H},format=gray', '-f', 'rawvideo', '-'], capture_output=True).stdout
V = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)
win = np.outer(np.hanning(H), np.hanning(W))
res = []
for i in range(1, len(V)):
    a, b = V[i - 1] * win, V[i] * win
    A, Bf = np.fft.fft2(a), np.fft.fft2(b)
    R = A * np.conj(Bf); R /= np.abs(R) + 1e-9
    r = np.real(np.fft.ifft2(R)); k = np.unravel_index(np.argmax(r), r.shape)
    dy, dx = [(v if v < s // 2 else v - s) for v, s in zip(k, r.shape)]
    peak = r.max(); diff = np.abs(V[i] - V[i - 1]).mean()
    res.append((i, dx * 1080 / W, dy * 1920 / H, peak, diff))
res = np.array(res)
np.save(sys.argv[2] if len(sys.argv) > 2 else 'motion.npy', res)
# shake = sign flips of the shift with magnitude > 4px at full res
sh = [(int(i), dx, dy) for i, dx, dy, pk, d in res if (abs(dx) >= 5 or abs(dy) >= 5) and pk > .08]
print('frames with >=5px global shift (t, dx, dy):')
print('  ' + '  '.join(f'{i/30:.2f}({dx:+.0f},{dy:+.0f})' for i, dx, dy in sh))
cuts = [int(i) for i, dx, dy, pk, d in res if pk < .06 and d > 12]
print('hard changes (cuts/flashes):', ' '.join(f'{i/30:.2f}' for i in cuts))
