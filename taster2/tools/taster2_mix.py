#!/usr/bin/env python3
"""Sound for "The Taster" v2 (re-cut: whips, zoom-throughs, lightning): the voiceover, the hall (a murmuring feast that goes dead silent when every eye turns),
heartbeats, and low, bassy effects (thumps, whoomphs, creaks and knocks pitched down; never thin clinks).
Everything that crosses the loop seam is built on a circular timeline, so 55.8 s flows into 0 s without a click.
    taster_mix.py <project dir>   ->  audio/mix.wav (VO + FX), audio/sfx.wav (FX only)"""
import sys, subprocess, wave, os
import numpy as np
P = sys.argv[1]
RAW = os.path.join(P, '..', 'spartan2', 'sfx_raw')
SR = 48000; DUR = 55.8; N = int(round(DUR * SR))
rng = np.random.default_rng(31)
T = np.arange(N) / SR
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
    """add x at t0 on the circular timeline (tails wrap into the start)"""
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


def thump(f0=70, f1=34, dur=.6, decay=.18, g=-8):
    t = np.arange(int(dur * SR)) / SR; f = f1 + (f0 - f1) * np.exp(-t / .05)
    return fade(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / decay), .002, .05) * db(g)


def whoomph(dur=.8, f0=70, f1=260, g=-12, rev=False):
    n = int(dur * SR); x = rng.standard_normal(n); t = np.arange(n) / SR
    y = np.zeros(n); fc = f0 + (f1 - f0) * (t / dur) ** 1.5; a = np.exp(-2 * np.pi * fc / SR)
    for i in range(1, n): y[i] = a[i] * y[i - 1] + (1 - a[i]) * x[i]
    y = y / (np.abs(y).max() + 1e-9) * (np.sin(np.pi * t / dur) ** 1.4 if not rev else (t / dur) ** 2.2 * np.exp(-((t - dur) / .03) ** 2 * 0 + 0))
    if rev: y = y * np.minimum(1, (dur - t) / .02)
    return y * db(g)


def boom(dur=2.4, f0=60, f1=28, decay=.7, g=-6):
    t = np.arange(int(dur * SR)) / SR; f = f1 + (f0 - f1) * np.exp(-t / .12)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / decay)
    rumble = band(rng.standard_normal(len(t)), lo=25, hi=110) * np.exp(-t / (decay * .8)); rumble /= np.abs(rumble).max() + 1e-9
    return fade(body + .35 * rumble, .003, .3) * db(g)


def knock(g=-18, f=120):                                   # a knuckle / a cup bottom on thick wood
    t = np.arange(int(.18 * SR)) / SR
    return fade(np.sin(2 * np.pi * (f + 40 * np.exp(-t / .01)) * t) * np.exp(-t / .03) + band(rng.standard_normal(len(t)), lo=80, hi=700) * np.exp(-t / .012) * .5, .001, .03) * db(g)


def heart(t0, g=-12):                                      # lub-dub
    place(FX, thump(62, 34, .32, .07, 0), t0, g); place(FX, thump(54, 30, .3, .06, 0), t0 + .2, g - 4)


VO = np.zeros(N); FX = np.zeros(N); AMB = np.zeros(N)
vo = load(os.path.join(P, 'audio', 'vo_orig.wav'), lo=20, hi=20000, norm=False); place(VO, vo[:N], 0.0)

def thunder(t0, g=-9, far=False):
    """a lightning strike: a dark crack (low-mid noise burst, no fizz) and a long rolling sub rumble"""
    n = int(3.2 * SR); t = np.arange(n) / SR
    crack = band(rng.standard_normal(n), lo=60, hi=1400) * np.exp(-t / (.05 if not far else .12)) * (0 if far else 1)
    roll = band(rng.standard_normal(n), lo=25, hi=160) * (np.exp(-t / 1.1) * (1 + .6 * np.sin(2 * np.pi * 1.7 * t) * np.exp(-t / .8)))
    roll /= np.abs(roll).max() + 1e-9; crack /= np.abs(crack).max() + 1e-9
    place(FX, fade(crack * .8 + roll * (1.0 if not far else .8), .004, .4), t0, g)
    place(FX, boom(2.4, 50, 26, .9, 0), t0, g - 4)
def whip(tc, g=-13, dur=.34):            # a bassy pass-by: a short low whoomph peaking at the cut, then a soft thump
    place(FX, whoomph(dur, 70, 320, 0), tc - dur * .62, g); place(FX, thump(70, 36, .35, .08, 0), tc + .02, g - 5)
def zoomin(tc, g=-12, dur=.55):          # a rising suck into the cut, then an impact
    place(FX, whoomph(dur, 50, 380, 0, rev=True), tc - dur, g); place(FX, thump(80, 34, .6, .16, 0), tc, g - 2)

# ---------- the hall: room tone always; the feast murmur on a circular loop with its own envelope ----------
room = periodic_noise(N, hi=150, color=1) * .6 + periodic_noise(N, lo=35, hi=90) * .3
AMB += room * db(-31)
mur = np.concatenate([fade(load(n, pitch=.92, lo=90, hi=2200), .3, .3) for n in ('feast_1', 'crowd_1', 'feast_2', 'crowd_2', 'feast_3')])
reps = int(np.ceil(N / len(mur))) + 1; mur = np.tile(mur, reps)[:N + SR]
xf = SR; mur[:xf] = mur[:xf] * np.linspace(0, 1, xf) + mur[N:N + xf] * np.linspace(1, 0, xf); mur = mur[:N]   # circular
mur_env = env([(0, .75), (5.1, .7), (5.12, .5), (7.2, .5), (7.22, .75), (9.05, .7), (9.4, .25), (10.7, .2), (10.72, .12), (13.0, .1), (13.06, 0), (16.38, 0), (16.42, 1.25),
               (18.6, 1.0), (19.95, .9), (20.02, .05), (22.5, .05), (22.56, 0), (41.43, 0), (41.47, .45), (48.6, .45), (48.66, .7), (50.1, .8), (50.17, 1.3), (50.78, 1.3), (50.82, .6),
               (51.9, .6), (51.93, 0), (55.13, 0), (55.2, .6), (55.8, .75)])
AMB += band(mur, hi=1800) * mur_env * db(-21)
# the cell and the gallows: wind outside; the floor hears the hall muffled above
AMB += periodic_noise(N, lo=50, hi=380, color=.6) * env([(0, 0), (13.0, 0), (13.1, 1), (16.35, 1), (16.42, 0), (30.2, 0), (30.27, 1.6), (31.55, 1.6), (31.62, 0),
                                                        (37.2, 0), (37.3, 1), (41.4, 1), (41.47, 0), (55.8, 0)]) * db(-26)

# ---------- effects ----------
for b in (0.6, 10.72, 20.05, 24.45, 30.3, 36.4, 47.4): thunder(b, -10)
thunder(52.3, -15, far=True)
place(FX, whoomph(.45, 50, 300, 0, rev=True), 1.34 - .45, -14); place(FX, thump(66, 34, .6, .18, 0), 1.36, -15)        # the snap back to the king
for k in range(5): place(FX, load('eat_2', ss=.1 + k * .2, dur=.2, pitch=.72, hi=1600), 1.7 + k * .36, -25)              # the king chews at his shoulder
place(FX, load('breath_1', ss=.6, dur=.45, pitch=.68, hi=1400), 2.65, -25); place(FX, thump(78, 40, .3, .07, 0), 3.5, -17)   # the sip, the gulp
whip(5.1)
b1 = load('eat_1', ss=.15, dur=.45, pitch=.78, hi=2400); place(FX, b1 * np.linspace(1, .2, len(b1)), 5.56, -13)            # the bite
place(FX, thump(95, 48, .25, .05, 0), 5.57, -14)
for k in range(3): place(FX, load('eat_2', ss=.2 + k * .25, dur=.2, pitch=.75, hi=1800), 5.75 + k * .14, -23)
place(FX, thump(64, 34, .3, .08, 0), 6.15, -17)                                                                              # punch cut
place(FX, load('breath_1', ss=.3, dur=.3, pitch=.7, hi=1500), 6.5, -25); place(FX, thump(80, 42, .3, .07, 0), 6.86, -16)    # the sip, a gulp
whip(7.2)
place(FX, whoomph(.4, 60, 220, 0), 7.3, -20)                                                                                  # he points the drumstick
place(FX, load('eat_1', ss=.4, dur=.5, pitch=.72, hi=2200), 8.12, -10); place(FX, thump(85, 45, .3, .06, 0), 8.16, -13)      # the big rip
for k in range(5): place(FX, load('eat_2', ss=.1 + k * .2, dur=.2, pitch=.7, hi=1600), 8.32 + k * .13, -21)
place(FX, whoomph(1.2, 40, 160, 0), 9.05, -16)                                                                                # he freezes; the slow push
place(FX, thump(70, 32, .7, .18, 0), 10.32, -7); place(FX, knock(0, 80), 10.33, -11)                                         # the meat hits the platter
place(FX, load('v_gasp_2', ss=0, dur=.8, pitch=.7, hi=1600), 10.78, -24)                                                     # the shadow chokes
place(FX, thump(95, 40, .6, .12, 0), 11.32, -7); place(FX, knock(0, 85), 11.32, -9); place(FX, thump(70, 36, .4, .1, 0), 11.5, -14)   # the goblet lands
roll = band(rng.standard_normal(int(1.6 * SR)), lo=60, hi=500); tt = np.arange(len(roll)) / SR
roll = roll / np.abs(roll).max() * (1 + .7 * np.sin(2 * np.pi * (9 - 4 * tt) * tt)) * np.exp(-tt / .7)
place(FX, fade(roll, .02, .3), 11.42, -15)
for k, ts in enumerate((11.6, 11.92, 12.25, 12.52)): place(FX, knock(0, 70 + 6 * k), ts, -20 - 2 * k)
place(FX, whoomph(.5, 50, 160, -16), 12.8); place(FX, thump(50, 28, 1.0, .35, 0), 13.06, -14)                               # into the black, the cell
for k in range(9):                                                                                                            # time-lapse: scratch after scratch, faster
    ts = 13.15 + 1.45 * (k / 9) ** .8; n = int(.16 * SR); u = np.arange(n) / SR
    sc = band(rng.standard_normal(n), lo=140, hi=700) * (1 + .6 * np.sin(2 * np.pi * 38 * u)) * np.sin(np.pi * u / .16) ** .8
    place(FX, fade(sc / np.abs(sc).max(), .01, .04), ts, -22)
place(FX, whoomph(1.5, 40, 300, 0), 13.2, -19)                                                                                # time rushing
place(FX, boom(2.6, 52, 26, .9, 0), 15.32, -15)                                                                               # the secret smile
place(FX, load('breath_2', ss=.1, dur=.35, pitch=.7, hi=1400), 15.9, -17); place(FX, whoomph(.35, 60, 160, 0), 16.0, -18)    # he blows the candle out
place(FX, boom(2.6, 58, 28, .8, 0), 16.42, -7); place(FX, whoomph(.8, 50, 300, 0, rev=True), 16.42 - .8, -12)                # THE FEAST
place(FX, load('v_horn_1', ss=0, dur=1.8, pitch=.82, hi=2600), 16.45, -18)
place(FX, whoomph(2.0, 40, 200, 0), 16.6, -18)                                                                                # the fly-through
zoomin(18.74, -14)
place(FX, load('breath_1', ss=.6, dur=.6, pitch=.66, hi=1400), 18.95, -24)                                                   # a long sip
place(FX, whoomph(.6, 40, 200, 0, rev=True), 19.99 - .6, -14); place(FX, boom(2.6, 62, 28, .8, 0), 20.0, -6)                # "wrong"
place(FX, thump(110, 40, .4, .08, 0), 20.64, -10)                                                                             # "Bitter."
zoomin(21.2, -13)
swirl = band(rng.standard_normal(int(1.4 * SR)), lo=50, hi=300); swirl = swirl / np.abs(swirl).max() * np.sin(np.pi * np.linspace(0, 1, len(swirl))) ** 2
place(FX, swirl, 21.22, -13)
zoomin(22.56, -12); place(FX, boom(3.0, 50, 25, 1.0, 0), 22.58, -9)                                                          # every eye in the hall
place(FX, whoomph(.9, 40, 140, 0), 22.65, -21)                                                                                # the wave of heads
for hb in (23.2, 24.1, 25.0, 25.9, 26.8, 27.6, 28.3, 29.0, 29.6, 30.15, 31.75, 32.3, 32.85, 33.5, 34.2, 34.9, 35.6):        # heartbeat, quickening
    heart(hb, -13)
whip(24.38); place(FX, thump(58, 30, .6, .16, 0), 24.8, -16)                                                                  # "except the queen" — snap in
place(FX, thump(56, 30, .4, .1, 0), 25.38, -18)
whip(27.82); place(FX, thump(64, 32, .3, .08, 0), 29.32, -15); place(FX, thump(64, 32, .3, .08, 0), 29.98, -16)             # her eyes meet his
place(FX, whoomph(.6, 60, 220, -14), 30.0); place(FX, boom(2.2, 48, 26, .8, 0), 30.26, -9)                                   # FLASH: the gallows
place(FX, load('v_creak_1', ss=.4, dur=1.2, pitch=.45, hi=900), 30.4, -13)                                                    # the rope on the beam
for k in range(7): place(FX, thump(130, 70, .12, .025, 0), 30.5 + k * .09 + (k % 2) * .02, -22)                             # crows' wings: soft low beats
zoomin(31.58, -12)
place(FX, thump(78, 38, .5, .12, 0), 32.62, -9); place(FX, load('eat_3', ss=.6, dur=.4, pitch=.62, hi=1500), 32.58, -16)    # the swallow
place(FX, load('breath_1', ss=.6, dur=.45, pitch=.66, hi=1400), 32.95, -24)
whip(33.46)
place(FX, load('v_creak_2', ss=.3, dur=.8, pitch=.5, hi=900), 33.65, -18)                                                    # her chair as she leans in
wob = np.arange(int(1.0 * SR)) / SR; wb = np.sin(2 * np.pi * (48 + 10 * np.sin(2 * np.pi * 2.5 * wob)) * wob) * np.sin(np.pi * wob)
place(FX, fade(wb, .05, .1), 35.25, -17)                                                                                       # the world tips
place(FX, thump(160, 60, .2, .03, 0), 36.22, -16)
place(FX, thump(56, 26, 1.2, .35, 0), 36.52, -4); place(FX, knock(0, 70), 36.52, -8); place(FX, boom(2.4, 52, 26, .8, 0), 36.52, -10)   # SLAM
place(FX, whoomph(.6, 50, 300, 0, rev=True), 37.26 - .6, -13); place(FX, thump(46, 26, 1.0, .35, 0), 37.27, -14)            # the spin into the past
place(FX, thump(220, 90, .12, .02, 0), 38.1, -15)                                                                            # the cork
for ts in (38.3, 38.56, 38.82, 39.08): place(FX, whoomph(.22, 80, 320, 0), ts - .12, -19); place(FX, thump(70, 36, .3, .08, 0), ts, -19)   # the seasons
place(FX, thump(60, 30, .4, .1, 0), 39.34, -17)
pl = np.arange(int(.5 * SR)) / SR; plip = np.sin(2 * np.pi * (180 + 160 * np.exp(-pl / .03)) * pl) * np.exp(-pl / .08)
place(FX, fade(plip, .001, .1), 40.64, -15)                                                                                    # the drop lands
place(FX, boom(2.0, 54, 27, .6, 0), 40.8, -9); place(FX, load('breath_2', ss=.2, dur=.7, pitch=.6, hi=1400), 40.82, -16)    # the shudder
place(FX, boom(1.6, 60, 30, .5, 0), 41.45, -12)                                                                               # back to the feast
place(FX, thump(64, 32, .3, .08, 0), 43.25, -17); place(FX, whoomph(.5, 60, 200, -18), 43.35)                                # he turns to her
place(FX, thump(64, 32, .3, .08, 0), 44.35, -18); place(FX, whoomph(.8, 50, 160, -19), 45.65)                                # he holds it out
whip(47.32)
place(FX, load('v_drag_1', ss=.2, dur=.35, pitch=.6, hi=1200), 47.34, -16); place(FX, knock(0, 80), 47.62, -11)             # slid before her
place(FX, boom(2.0, 46, 25, .7, 0), 47.64, -12); place(FX, thump(64, 32, .4, .1, 0), 48.03, -15)
whip(48.62)
lg = load('v_laugh_1', ss=0, dur=2.4, pitch=.82, hi=3000); place(FX, fade(lg, .02, .4), 48.72, -8)                           # the king roars…
place(FX, whoomph(.6, 60, 260, -14), 49.6)                                                                                    # the cup raised
for k, nm in enumerate(('v_laugh_2', 'v_laugh_3', 'v_laugh_4', 'v_chuckle_1')):                                              # …the hall roars with him
    x = load(nm, ss=0, dur=1.6, pitch=.86 + .04 * k, hi=2200); place(FX, fade(x, .05, .5), 50.15 + k * .05, -15 - k)
place(FX, thump(64, 32, .3, .08, 0), 50.15, -16); place(FX, thump(64, 32, .3, .08, 0), 50.8, -17)
place(FX, boom(3.4, 44, 24, 1.2, 0), 51.93, -5)                                                                              # silence: every eye turns to her
place(FX, whoomph(.9, 40, 140, 0), 52.0, -20)
whip(52.8, -15)
for hb in (53.1, 53.85, 54.55): heart(hb, -10)
whip(55.15, -15)
drone = periodic_noise(N, lo=28, hi=70) + .5 * np.sin(2 * np.pi * 36 * T)                                                    # a low dread bed under the tension
AMB += drone * env([(0, 0), (19.9, 0), (20.1, 1), (36.4, 1), (36.6, 0), (41.4, 0), (41.6, .5), (48.6, .5), (48.8, 0), (51.9, 0), (52.0, 1.2), (55.1, 1.2), (55.3, 0), (55.8, 0)]) * db(-24)

# ---------- mix ----------
speak = band((np.abs(VO) > .02).astype(float), hi=4); duck = 1 - .3 * np.clip(speak, 0, 1)
fx = FX * duck + AMB
mix = VO + fx
peak = np.abs(mix).max(); mix = mix / peak * .9; fx_n = fx / (np.abs(fx).max() + 1e-9) * .89
st = np.stack([mix, mix], 1)
side = band(np.roll(AMB, int(.012 * SR)), lo=150) * .25 / peak * .9; st[:, 0] += side; st[:, 1] -= side
def write(path, x):
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())
write(os.path.join(P, 'audio', 'mix.wav'), np.clip(st, -1, 1)); write(os.path.join(P, 'audio', 'sfx.wav'), np.stack([fx_n, fx_n], 1))
print(f'peak {peak:.2f}; seam step {abs(st[-1, 0] - st[0, 0]):.4f}')
