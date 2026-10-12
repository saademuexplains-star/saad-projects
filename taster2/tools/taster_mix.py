#!/usr/bin/env python3
"""Sound for "The Taster": the voiceover, the hall (a murmuring feast that goes dead silent when every eye turns),
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

# ---------- the hall: room tone always; a feast murmur on a circular loop with its own envelope ----------
room = periodic_noise(N, hi=150, color=1) * .6 + periodic_noise(N, lo=35, hi=90) * .3
AMB += room * db(-31)
mur = np.concatenate([fade(load(n, pitch=.92, lo=90, hi=2200), .3, .3) for n in ('feast_1', 'crowd_1', 'feast_2', 'crowd_2', 'feast_3')])
reps = int(np.ceil(N / len(mur))) + 1; mur = np.tile(mur, reps)[:N + SR]
xf = SR; mur[:xf] = mur[:xf] * np.linspace(0, 1, xf) + mur[N:N + xf] * np.linspace(1, 0, xf); mur = mur[:N]   # circular
mur_env = env([(0, 0), (.9, .55), (1.4, .8), (10.6, .8), (10.7, .25), (13.0, .2), (13.06, 0), (16.35, 0), (16.5, 1.0), (18.6, .9), (22.35, .8), (22.6, 0),
               (48.7, 0), (48.9, .0), (51.85, 0), (55.8, 0)])
AMB += band(mur, hi=1800) * mur_env * db(-21)
# the floor shot hears the hall muffled above; the cell is a quiet stone room with wind outside
AMB += periodic_noise(N, lo=50, hi=380, color=.6) * env([(0, 0), (13.0, 0), (13.1, 1), (16.35, 1), (16.45, 0), (30.2, 0), (30.3, 1.4), (31.55, 1.4), (31.65, 0),
                                                        (37.2, 0), (37.3, 1), (41.4, 1), (41.5, 0), (55.8, 0)]) * db(-27)

# ---------- effects ----------
place(FX, thump(64, 32, .7, .2, 0), 1.42, -16)                                    # cut to the high table
for i, ts in enumerate(np.arange(1.62, 3.4, .14)):                                 # the king's fingers drumming on the board
    if i % 5 != 4: place(FX, knock(0, 110 + (i % 3) * 12), ts, -24)
place(FX, knock(0, 90), 3.95, -18)                                                # the goblet comes down
b1 = load('eat_1', ss=.15, dur=.45, pitch=.78, hi=2400); place(FX, b1 * np.linspace(1, .2, len(b1)), 5.52, -14)   # the bite
place(FX, thump(90, 48, .25, .05, 0), 5.55, -16)
for k in range(3): place(FX, load('eat_2', ss=.2 + k * .25, dur=.2, pitch=.75, hi=1800), 5.75 + k * .14, -24)      # chewing
place(FX, thump(80, 42, .3, .07, 0), 6.66, -17); place(FX, load('breath_1', ss=.3, dur=.3, pitch=.7, hi=1500), 6.58, -26)   # the sip, a gulp
place(FX, load('eat_3', ss=.1, dur=.5, pitch=.8, hi=2400), 7.5, -16)               # he seizes the roast
place(FX, load('eat_1', ss=.4, dur=.5, pitch=.72, hi=2200), 8.4, -11); place(FX, thump(85, 45, .3, .06, 0), 8.42, -15)   # the big bite
for k in range(4): place(FX, load('eat_2', ss=.1 + k * .2, dur=.2, pitch=.7, hi=1600), 8.55 + k * .13, -22)
place(FX, whoomph(.6, 60, 200, -18), 9.1)                                          # he stops; the push in
place(FX, thump(70, 32, .7, .18, 0), 10.16, -8); place(FX, knock(0, 80), 10.17, -12)   # the meat drops on the platter
# the cup falls, hits the stone, rolls, rocks still (heavy, low: no ring)
place(FX, thump(95, 40, .6, .12, 0), 11.04, -7); place(FX, knock(0, 85), 11.04, -9); place(FX, thump(70, 36, .4, .1, 0), 11.2, -14)
roll = band(rng.standard_normal(int(1.5 * SR)), lo=60, hi=500); tt = np.arange(len(roll)) / SR
roll = roll / np.abs(roll).max() * (1 + .7 * np.sin(2 * np.pi * (9 - 4 * tt) * tt)) * np.exp(-tt / .7)
place(FX, fade(roll, .02, .3), 11.12, -15)
for k, ts in enumerate((11.3, 11.62, 11.95, 12.22)): place(FX, knock(0, 70 + 6 * k), ts, -20 - 2 * k)
place(FX, whoomph(.5, 50, 160, -16), 12.75); place(FX, thump(50, 28, 1.0, .35, 0), 13.06, -15)   # into the black, the cell
for k in range(3):                                                                 # three scratches with a nail on stone
    n = int(.36 * SR); u = np.arange(n) / SR; sc = band(rng.standard_normal(n), lo=140, hi=700) * (1 + .6 * np.sin(2 * np.pi * 38 * u)) * np.sin(np.pi * u / .36) ** .8
    place(FX, fade(sc / np.abs(sc).max(), .02, .08), 13.25 + k * .45, -21)
place(FX, boom(2.6, 52, 26, .9, 0), 15.35, -14)                                     # "and no one knows how"
place(FX, whoomph(1.0, 60, 240, -11), 16.0); place(FX, boom(2.0, 58, 30, .7, 0), 16.42, -11)   # into the great feast
place(FX, thump(66, 34, .5, .12, 0), 18.74, -15)                                  # cut to him drinking
place(FX, load('breath_1', ss=.6, dur=.6, pitch=.66, hi=1400), 19.2, -24)          # a long sip
place(FX, boom(2.4, 62, 28, .8, 0), 20.0, -7)                                      # "wrong" — the drink stops
place(FX, thump(110, 40, .4, .08, 0), 20.64, -10)                                 # "Bitter."
swirl = band(rng.standard_normal(int(1.5 * SR)), lo=50, hi=300); swirl = swirl / np.abs(swirl).max() * np.sin(np.pi * np.linspace(0, 1, len(swirl))) ** 2
place(FX, swirl, 21.2, -13)                                                       # the wine turning in the cup
place(FX, whoomph(.7, 50, 180, -12), 22.3); place(FX, boom(3.0, 50, 25, 1.0, 0), 22.56, -9)   # the hall goes silent; every eye
for hb in (23.2, 24.1, 25.0, 25.9, 26.8, 27.6, 28.3, 29.0, 29.6, 30.15, 31.75, 32.3, 32.85, 33.5, 34.2, 34.9, 35.6):   # heartbeat, quickening
    heart(hb, -13)
place(FX, thump(58, 30, .6, .16, 0), 24.4, -15)                                    # "except the queen"
place(FX, thump(58, 30, .8, .25, 0), 27.84, -12)                                   # "spit it out"
place(FX, whoomph(.6, 60, 220, -14), 30.0); place(FX, boom(2.2, 48, 26, .8, 0), 30.26, -10)   # the gallows
place(FX, load('v_creak_1', ss=.4, dur=1.2, pitch=.45, hi=900), 30.4, -12)         # the rope creaks on the beam
place(FX, thump(64, 32, .5, .12, 0), 31.6, -15)
place(FX, thump(78, 38, .5, .12, 0), 32.92, -9); place(FX, load('eat_3', ss=.6, dur=.4, pitch=.62, hi=1500), 32.88, -16)   # the swallow
place(FX, load('v_creak_2', ss=.3, dur=.8, pitch=.5, hi=900), 33.7, -18)           # her chair as she leans in
place(FX, thump(56, 26, 1.2, .35, 0), 36.6, -5); place(FX, knock(0, 70), 36.6, -9)   # "But you don't." — the goblet down, hard
place(FX, whoomph(.5, 50, 220, -14), 36.95); place(FX, thump(46, 26, 1.0, .35, 0), 37.27, -14)   # into the dawn
place(FX, thump(220, 90, .12, .02, 0), 38.6, -16)                                  # the cork
pl = np.arange(int(.5 * SR)) / SR; plip = np.sin(2 * np.pi * (180 + 160 * np.exp(-pl / .03)) * pl) * np.exp(-pl / .08)
place(FX, fade(plip, .001, .1), 40.6, -17)                                         # the drop lands
place(FX, boom(2.0, 54, 27, .6, 0), 40.74, -10); place(FX, load('breath_2', ss=.2, dur=.7, pitch=.6, hi=1400), 40.76, -16)   # the shudder
place(FX, thump(60, 30, .6, .2, 0), 41.46, -12)                                    # back to the feast
place(FX, whoomph(.5, 60, 200, -18), 43.3)                                         # he turns to her
place(FX, whoomph(.6, 50, 160, -20), 45.95)                                        # he holds it out
place(FX, load('v_drag_1', ss=.2, dur=.35, pitch=.6, hi=1200), 47.3, -16); place(FX, knock(0, 80), 47.6, -12)   # slid before her, set down
place(FX, boom(2.0, 46, 25, .7, 0), 47.62, -13)
lg = load('v_laugh_1', ss=0, dur=2.4, pitch=.82, hi=3000); place(FX, fade(lg, .02, .4), 48.75, -9)   # the king roars with laughter…
for k, nm in enumerate(('v_laugh_2', 'v_laugh_3', 'v_laugh_4', 'v_chuckle_1')):   # …and the hall laughs along with him
    x = load(nm, ss=0, dur=2.2, pitch=.86 + .04 * k, hi=2200); place(FX, fade(x, .2, .6), 49.0 + k * .12, -19 - k)
place(FX, knock(0, 70), 49.05, -10); place(FX, thump(70, 34, .4, .1, 0), 49.05, -13)   # his fist on the table
place(FX, whoomph(.6, 60, 260, -14), 50.0)                                         # the cup raised
place(FX, whoomph(.4, 50, 180, -18, rev=True), 51.5); place(FX, boom(3.4, 44, 24, 1.2, 0), 51.93, -6)   # silence; the hall turns to her
for hb in (52.9, 53.75, 54.6):
    heart(hb, -11)
place(FX, thump(56, 30, .5, .15, 0), 55.16, -15)                                   # cut to the boy (and round to the start)
drone = periodic_noise(N, lo=28, hi=70) + .5 * np.sin(2 * np.pi * 36 * T)          # a low dread bed under the tension
AMB += drone * env([(0, 0), (19.9, 0), (20.3, 1), (36.5, 1), (36.7, 0), (41.4, 0), (41.6, .5), (48.6, .5), (48.8, 0), (51.9, 0), (52.2, 1.2), (55.3, 1.2), (55.8, 0)]) * db(-24)

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
