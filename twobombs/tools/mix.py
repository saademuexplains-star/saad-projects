#!/usr/bin/env python3
"""Sound for "Two Bombs": the voiceover, ambience beds per scene, and low, bassy effects (thumps, whoomphs, booms,
rumbles; creaks and steps pitched down; never thin clinks). Everything sits on a circular timeline so 54.0 s flows
into 0 s without a click.   mix.py <project dir>  ->  audio/mix.wav (VO + FX), audio/sfx.wav (FX only)"""
import sys, subprocess, wave, os
import numpy as np
P = sys.argv[1]
RAW = os.path.join(P, '..', 'spartan2', 'sfx_raw')
SR = 48000; DUR = 54.0; N = int(round(DUR * SR))
rng = np.random.default_rng(45)
db = lambda d: 10 ** (d / 20)


def load(name, ss=0.0, dur=None, pitch=1.0, lo=40, hi=6000, norm=True):
    src = name if os.path.sep in name else os.path.join(RAW, name + '.mp3')
    af = (f'asetrate={int(44100 * pitch)},aresample={SR},' if pitch != 1 else f'aresample={SR},') + f'highpass=f={lo},lowpass=f={hi}'
    cmd = ['ffmpeg', '-v', 'error', '-ss', str(ss)] + (['-t', str(dur)] if dur else []) + ['-i', src, '-ac', '1', '-af', af, '-f', 'f32le', '-']
    x = np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32).astype(np.float64)
    if norm and np.abs(x).max() > 0: x = x / np.abs(x).max()
    return x


def fade(x, fi=.01, fo=.05):
    x = x.copy(); n = len(x); a = min(n, int(fi * SR)); b = min(n, int(fo * SR))
    if a: x[:a] *= np.linspace(0, 1, a)
    if b: x[n - b:] *= np.linspace(1, 0, b)
    return x


def place(bus, x, t0, g=0.0):
    x = x * db(g); i0 = int(round(t0 * SR)) % N; k = 0
    while k < len(x):
        a = (i0 + k) % N; m = min(len(x) - k, N - a); bus[a:a + m] += x[k:k + m]; k += m


def band(x, lo=None, hi=None, order=4):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR) + 1e-9
    if hi: X *= 1 / (1 + (f / hi) ** order)
    if lo: X *= 1 / (1 + (lo / f) ** order)
    return np.fft.irfft(X, len(x))


def periodic_noise(n, lo=None, hi=None, color=0):
    X = rng.standard_normal(n // 2 + 1) + 1j * rng.standard_normal(n // 2 + 1); f = np.fft.rfftfreq(n, 1 / SR) + 1e-3
    X *= f ** (-color / 2)
    if hi: X *= 1 / (1 + (f / hi) ** 4)
    if lo: X *= 1 / (1 + (lo / f) ** 4)
    x = np.fft.irfft(X, n); return x / (np.abs(x).max() + 1e-9)


def env(keys, n=N):
    k = np.array(keys, float); return np.interp(np.arange(n) / SR, k[:, 0], k[:, 1])


def thump(f0=70, f1=34, dur=.6, decay=.18, g=0):
    t = np.arange(int(dur * SR)) / SR; f = f1 + (f0 - f1) * np.exp(-t / .05)
    return fade(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / decay), .002, .05) * db(g)


def whoomph(dur=.8, f0=70, f1=260, g=0, rev=False):
    n = int(dur * SR); x = rng.standard_normal(n); t = np.arange(n) / SR
    y = np.zeros(n); fc = f0 + (f1 - f0) * (t / dur) ** 1.5; a = np.exp(-2 * np.pi * fc / SR)
    for i in range(1, n): y[i] = a[i] * y[i - 1] + (1 - a[i]) * x[i]
    y = y / (np.abs(y).max() + 1e-9) * (np.sin(np.pi * t / dur) ** 1.4 if not rev else (t / dur) ** 2.2)
    if rev: y = y * np.minimum(1, (dur - t) / .02)
    return y * db(g)


def boom(dur=2.4, f0=60, f1=28, decay=.7, g=0):
    t = np.arange(int(dur * SR)) / SR; f = f1 + (f0 - f1) * np.exp(-t / .12)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / decay)
    rumble = band(rng.standard_normal(len(t)), lo=25, hi=110) * np.exp(-t / (decay * .8)); rumble /= np.abs(rumble).max() + 1e-9
    return fade(body + .35 * rumble, .003, .3) * db(g)


def knock(g=0, f=120):
    t = np.arange(int(.18 * SR)) / SR
    return fade(np.sin(2 * np.pi * (f + 40 * np.exp(-t / .01)) * t) * np.exp(-t / .03) + band(rng.standard_normal(len(t)), lo=80, hi=700) * np.exp(-t / .012) * .5, .001, .03) * db(g)


def rumble(dur, lo=25, hi=160, att=.05, decay=1.0, g=0):
    n = int(dur * SR); t = np.arange(n) / SR; x = band(rng.standard_normal(n), lo=lo, hi=hi); x /= np.abs(x).max() + 1e-9
    return fade(x * np.minimum(1, t / max(att, 1e-3)) * np.exp(-t / decay), .005, .2) * db(g)


def heart(t0, g=-12):
    place(FX, thump(62, 34, .32, .07), t0, g); place(FX, thump(54, 30, .3, .06), t0 + .2, g - 4)


def whip(tc, g=-13, dur=.34):
    place(FX, whoomph(dur, 70, 320), tc - dur * .62, g); place(FX, thump(70, 36, .35, .08), tc + .02, g - 5)


def zoomin(tc, g=-12, dur=.55):
    place(FX, whoomph(dur, 50, 380, rev=True), tc - dur, g); place(FX, thump(80, 34, .6, .16), tc, g - 2)


def blast(tc, g=-2):
    """an atomic blast heard from 3 km: a long sub boom, a deep tearing rumble, a pressure 'whump'"""
    place(FX, boom(4.5, 70, 22, 1.6), tc, g)
    place(FX, rumble(4.0, 22, 140, .02, 1.4), tc, g - 3)
    place(FX, thump(110, 30, 1.2, .3), tc, g - 1)


VO = np.zeros(N); FX = np.zeros(N); AMB = np.zeros(N)
vo = load(os.path.join(P, 'audio', 'vo.wav'), lo=20, hi=20000, norm=False); place(VO, vo[:N], 0.0)

# ---------------- ambience beds (circular) ----------------
wind = periodic_noise(N, lo=40, hi=420, color=.8)
town = np.concatenate([fade(load(n, pitch=.8, lo=80, hi=900), .3, .3) for n in ('crowd_1', 'feast_1', 'crowd_2')])
town = np.tile(town, int(np.ceil(N / len(town))) + 1)[:N + SR]; xf = SR
town[:xf] = town[:xf] * np.linspace(0, 1, xf) + town[N:N + xf] * np.linspace(1, 0, xf); town = town[:N]
water = band(periodic_noise(N, lo=60, hi=500), hi=500) * (1 + .4 * np.sin(2 * np.pi * .4 * np.arange(N) / SR))
fireb = np.tile(load('v_fire_1', pitch=.7, lo=50, hi=1800), 30)[:N]
room = periodic_noise(N, lo=30, hi=140, color=1)

# morning (0–9.5 and the loop tail 52.3–54): breeze, a far town, the river
AMB += wind * env([(0, .9), (9.3, .9), (9.45, 0), (52.3, 0), (52.5, .9), (54, .9)]) * db(-27)
AMB += band(town, hi=900) * env([(0, .5), (2.5, .6), (2.62, 1), (4.95, 1), (5.0, .5), (8.0, .4), (9.3, 0), (54, 0)]) * db(-24)
AMB += water * env([(0, 1), (2.6, 1), (2.65, 0), (52.3, 0), (52.5, 1), (54, 1)]) * db(-28)
# after the blast: fire and wind (12.4–21.1)
AMB += band(fireb, hi=1800) * env([(0, 0), (11.4, 0), (11.6, .5), (13.9, .4), (14.0, 1), (21.0, 1), (21.15, 0), (54, 0)]) * db(-25)
AMB += wind * env([(0, 0), (11.4, 0), (11.8, 1.4), (21.0, 1.4), (21.15, 0), (54, 0)]) * db(-26)
# shelter: low room, far fires
AMB += room * env([(0, 0), (21.1, 0), (21.3, 1), (23.25, 1), (23.35, 0), (54, 0)]) * db(-24)
AMB += band(fireb, hi=700) * env([(0, 0), (21.1, 0), (21.3, .6), (23.25, .6), (23.35, 0), (54, 0)]) * db(-28)
# station + train + carriage + harbour
AMB += band(town, hi=800) * env([(0, 0), (23.28, 0), (23.35, .9), (25.9, .9), (25.95, 0), (54, 0)]) * db(-25)
AMB += wind * env([(0, 0), (25.9, 0), (25.95, 1.2), (27.18, 1.2), (27.22, .3), (28.95, .3), (29.0, 1), (30.7, 1), (30.75, 0), (54, 0)]) * db(-27)
AMB += water * env([(0, 0), (28.95, 0), (29.0, 1), (30.7, 1), (30.75, 0), (54, 0)]) * db(-27)
# office (room tone + fan), the wreck (dust settling), spring, the ceremony room, the hill, the lecture
fan = np.sin(2 * np.pi * 58 * np.arange(N) / SR) * (1 + .3 * np.sin(2 * np.pi * 4 * np.arange(N) / SR)) * .3 + room
AMB += fan * env([(0, 0), (30.7, 0), (30.8, 1), (40.3, 1), (40.35, 0), (54, 0)]) * db(-30)
AMB += room * env([(0, 0), (40.4, 0), (40.5, 1.5), (41.8, 1.2), (41.9, 0), (44.25, 0), (44.35, .8), (47.35, .8), (47.42, 0), (49.85, 0), (49.9, .8), (52.25, .8), (52.3, 0), (54, 0)]) * db(-25)
AMB += wind * env([(0, 0), (41.85, 0), (42.0, .7), (44.25, .7), (44.3, 0), (47.4, 0), (47.5, 1.1), (49.85, 1.1), (49.9, 0), (54, 0)]) * db(-27)

# ---------------- effects ----------------
# 1 → 2: the dive into the town
place(FX, rumble(2.2, 30, 140, .6, 2.0), .4, -26)                                                     # the tram across the bridge
zoomin(2.62, -14)
for k in range(8):                                                                                       # footsteps (stride .62 s, two per cycle)
    ts = 2.62 + .155 + k * .31
    if ts < 4.95: place(FX, load('v_steps_1', ss=.05 + (k % 3) * .4, dur=.25, pitch=.75, hi=1500), ts, -24); place(FX, thump(90, 50, .15, .03), ts, -26)
place(FX, thump(64, 32, .3, .08), 4.98, -17)                                                          # punch-in
place(FX, load('breath_2', ss=.15, dur=.6, pitch=.78, hi=1600), 5.3, -26)                              # a breath out in the heat
zoomin(6.60, -15)
for ts, g in ((6.95, -19), (7.30, -13), (7.65, -19), (8.0, -20)):                                     # the watch: low tocks, the minute clunk on "fifteen"
    place(FX, knock(0, 150 if g < -15 else 110), ts, g); place(FX, thump(120, 60, .12, .025), ts, g - 4)
whip(8.02, -15)
# the B-29: a far, low, beating drone; then the light — a rising suck — and nothing
n = int(1.7 * SR); tt = np.arange(n) / SR
drone = (np.sin(2 * np.pi * 57 * tt) + .8 * np.sin(2 * np.pi * 59.3 * tt) + .4 * np.sin(2 * np.pi * 114 * tt) + .25 * band(rng.standard_normal(n), lo=60, hi=240)) * np.minimum(1, tt / .5)
place(FX, fade(drone / np.abs(drone).max(), .3, .1), 8.0, -24)
place(FX, whoomph(.75, 40, 600, rev=True), 8.75, -14)
# 9.62 the blast; 10.33 the shockwave; 11.32 he lands
blast(9.62, -1)
n = int(1.3 * SR); tt = np.arange(n) / SR
roar = band(rng.standard_normal(n), lo=35, hi=420) * np.minimum(1, tt / .06) * np.exp(-tt / .9); roar /= np.abs(roar).max()
place(FX, fade(roar, .01, .3), 10.28, -4)
place(FX, thump(90, 30, .8, .22), 10.33, -3)
for k in range(16): place(FX, knock(0, 70 + rng.integers(0, 60)), 10.4 + rng.random() * .7, -20 - rng.random() * 6)     # debris
place(FX, thump(95, 32, .7, .16), 11.32, -4); place(FX, rumble(.8, 40, 300, .005, .25), 11.32, -10)                     # he hits the ground
for k in range(10): place(FX, knock(0, 60 + rng.integers(0, 40)), 11.5 + rng.random() * .9, -26 - rng.random() * 6)     # grit raining down
# 12.42 the eardrums: a low muffled pulse, the heartbeat, a soft low ring
heart(12.55, -12); heart(13.25, -13)
n = int(1.6 * SR); tt = np.arange(n) / SR
ring = np.sin(2 * np.pi * 640 * tt) * (1 + .3 * np.sin(2 * np.pi * 5 * tt)) * np.sin(np.pi * tt / 1.6) ** 2
place(FX, ring, 12.42, -34)
place(FX, rumble(1.6, 25, 90, .1, 1.2), 12.42, -18)
# 13.98 he pushes up, the pain
place(FX, load('v_gasp_2', ss=0, dur=.9, pitch=.74, hi=1500), 14.15, -21)
place(FX, load('breath_3', ss=.1, dur=.8, pitch=.72, hi=1400), 15.2, -25)
# 16.38 → 21.1 the cloud: a sub swell that climbs, a braam on the tilt
place(FX, thump(60, 30, .5, .14), 16.38, -16)
n = int(4.7 * SR); tt = np.arange(n) / SR
sw = np.sin(2 * np.pi * np.cumsum(30 + 12 * tt / 4.7) / SR) * (tt / 4.7) ** 1.2 + .5 * band(rng.standard_normal(n), lo=25, hi=90) * (tt / 4.7)
place(FX, fade(sw / np.abs(sw).max(), .2, .4), 16.4, -10)
whip(17.42, -15); place(FX, boom(3.6, 48, 24, 1.3), 17.45, -8)
# 21.12 the dip to black; the shelter
place(FX, whoomph(.5, 50, 160), 20.9, -17); place(FX, thump(46, 26, 1.0, .35), 21.12, -14)
place(FX, load('breath_1', ss=.2, dur=.5, pitch=.7, hi=1300), 21.9, -27)                             # someone coughs in the dark
place(FX, load('sob_1', ss=0, dur=1.2, pitch=.82, hi=1500), 22.3, -32)
# 23.3 the station: steam, the locomotive breathing
whip(23.30, -14)
place(FX, fade(band(rng.standard_normal(int(1.0 * SR)), lo=80, hi=900), .05, .6), 23.35, -20)        # a gust of steam (low)
for k in range(4): place(FX, thump(70, 40, .25, .06), 23.45 + k * .26, -18)
place(FX, knock(0, 70), 24.0, -18)
# 24.24 he hauls himself up
place(FX, load('breath_2', ss=.2, dur=.6, pitch=.74, hi=1500), 24.35, -21); place(FX, knock(0, 90), 24.45, -19)
place(FX, load('breath_2', ss=.9, dur=.6, pitch=.72, hi=1500), 25.15, -22); place(FX, thump(80, 40, .3, .07), 25.6, -19)
# 25.92 the train: a chuff rhythm, rail joints
whip(25.92, -14)
for k in range(10): place(FX, thump(64, 36, .22, .05), 26.0 + k * .13, -19 - (k % 2) * 3)
for k in range(3): place(FX, knock(0, 80), 26.1 + k * .42, -21); place(FX, knock(0, 76), 26.24 + k * .42, -22)
place(FX, fade(load('v_horn_2', ss=0, dur=1.0, pitch=.62, hi=1800), .05, .3), 26.25, -24)           # the whistle, pitched low
# 27.2 the carriage: muffled joints under the photo
for k in range(4): place(FX, band(knock(0, 70), hi=300), 27.3 + k * .42, -24); place(FX, band(knock(0, 66), hi=300), 27.44 + k * .42, -25)
# 28.98 Nagasaki: a ship's horn across the harbour
whip(28.98, -14)
place(FX, fade(load('v_horn_1', ss=0, dur=1.6, pitch=.5, hi=1200), .1, .5), 29.1, -19)
# 30.72 the office: he limps in; a chair creaks as they look up
zoomin(30.72, -15)
for k, ts in enumerate((31.15, 31.5, 31.85, 32.2, 32.55, 32.9, 33.25)): place(FX, load('v_steps_2', ss=.1 + (k % 4) * .3, dur=.25, pitch=.72, hi=1400), ts, -23 - 4 * (k % 2))   # a limp: one foot heavier
place(FX, load('v_creak_1', ss=.3, dur=.6, pitch=.6, hi=1200), 31.25, -24)
place(FX, thump(64, 32, .3, .08), 33.42, -17)
place(FX, whoomph(.5, 60, 220), 33.62, -22)                                                            # the sweep of his hand
place(FX, load('v_creak_2', ss=.3, dur=.7, pitch=.55, hi=1100), 34.95, -22)                            # the boss leans back
# 36.32 the clock ticks it down; the window goes white — a suck of air — and the second blast
for ts in (36.5, 37.5, 38.5): place(FX, knock(0, 110), ts, -21); place(FX, thump(100, 50, .12, .03), ts, -25)
place(FX, whoomph(1.0, 40, 700, rev=True), 39.3, -12)
blast(40.40, -1)
for k in range(14): place(FX, knock(0, 60 + rng.integers(0, 50)), 40.5 + rng.random() * 1.2, -21 - rng.random() * 6)    # falling debris
place(FX, load('breath_3', ss=.2, dur=.7, pitch=.72, hi=1400), 40.95, -21)                             # he coughs
place(FX, load('breath_1', ss=.4, dur=.5, pitch=.7, hi=1400), 41.4, -23)
# 41.86 decades pass
whip(41.86, -16)
# 44.3 the ceremony: flash bulbs (soft low pops), a ripple of applause
for ts in (44.55, 45.25, 46.3, 46.9): place(FX, thump(140, 70, .14, .03), ts, -19); place(FX, whoomph(.12, 300, 900), ts - .02, -30)
place(FX, fade(load('crowd_1', ss=1.0, dur=1.4, pitch=.86, lo=100, hi=1500), .2, .5), 46.1, -27)
# the official's hand-claps (on screen 44.3-45.9): warm, low-passed, a little room
def clap():
    n = int(.09 * SR); t = np.arange(n) / SR; x = rng.standard_normal(n); y = np.zeros(n); a = np.exp(-2 * np.pi * 1300 / SR)
    for i in range(1, n): y[i] = a * y[i - 1] + (1 - a) * x[i]
    y = y / (np.abs(y).max() + 1e-9) * np.exp(-t / .022) * np.minimum(1, t / .0015)
    y = y + .6 * thump(220, 120, .09, .03)
    out = np.zeros(n + int(.08 * SR))
    for d, gn in ((0, 1), (.023, .35), (.041, .22), (.067, .12)): k = int(d * SR); out[k:k + n] += y * gn
    return out
for i in range(5): place(FX, clap(), 44.30 + i * .3927 + .01, -27 - (i == 4) * 4)
# 47.4 the hill: the ghosts rise — a far, slow rumble
zoomin(47.40, -17)
place(FX, rumble(2.5, 22, 80, 1.2, 3.0), 47.5, -15)
# 52.3 the cranes: paper wings — a soft low flutter — rising into the sky
whip(52.30, -16)
n = int(1.6 * SR); tt = np.arange(n) / SR
flut = band(rng.standard_normal(n), lo=90, hi=700) * (.5 + .5 * np.sin(2 * np.pi * 11 * tt)) * np.sin(np.pi * tt / 1.6) ** 1.5
place(FX, flut / np.abs(flut).max(), 52.35, -26)

# ---------------- mix ----------------
# the effects duck ~6 dB under the voice (fast attack, slow release) and pass a soft limiter, so the narration stays on top
fx = FX + AMB
w = int(.03 * SR); ve = np.convolve(np.abs(VO), np.ones(w) / w, mode='same'); act = np.clip(ve / .04, 0, 1)
g = 1 - .5 * act; gs = g.copy(); a_att, a_rel = np.exp(-1 / (.015 * SR)), np.exp(-1 / (.25 * SR)); prev = 1.0
for i in range(N):
    c = gs[i]; prev = a_att * prev + (1 - a_att) * c if c < prev else a_rel * prev + (1 - a_rel) * c; gs[i] = prev
fx = fx * gs
fx = .8 * np.tanh(fx / .8)
mix = VO + fx
# master limiter (look-ahead 4 ms, circular) so loudness normalisation can stay linear
from numpy.lib.stride_tricks import sliding_window_view
def limit(x, thr=.62):
    pk = np.abs(x); w = int(.004 * SR); padded = np.concatenate([pk[-w:], pk, pk[:w]])
    mx = sliding_window_view(padded, 2 * w + 1).max(1)[:N]; g = np.minimum(1, thr / np.maximum(mx, 1e-9))
    a = np.exp(-1 / (.08 * SR)); out = g.copy(); prev = g[-1]
    for i in range(N):
        prev = g[i] if g[i] < prev else a * prev + (1 - a) * g[i]; out[i] = prev
    return x * out
mix = limit(mix)
for name, x in (('mix.wav', mix), ('sfx.wav', fx)):
    y = x / max(1.0, np.abs(x).max() / .95)
    st = np.stack([y, y], 1)
    with wave.open(os.path.join(P, 'audio', name), 'wb') as o:
        o.setnchannels(2); o.setsampwidth(2); o.setframerate(SR); o.writeframes((np.clip(st, -1, 1) * 32767).astype(np.int16).tobytes())
print('peak', round(float(np.abs(mix).max()), 3), 'vo peak', round(float(np.abs(VO).max()), 3))
