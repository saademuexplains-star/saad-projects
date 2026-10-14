#!/usr/bin/env python3
"""Sound for "The Man Who Wouldn't Die": the voiceover, ambience beds per scene, and low, bassy effects (thumps, whoomphs, booms,
rumbles; creaks and steps pitched down; never thin clinks). Everything sits on a circular timeline so 51.0 s flows
into 0 s without a click.   mix.py <project dir>  ->  audio/mix.wav (VO + FX), audio/sfx.wav (FX only)"""
import sys, subprocess, wave, os
import numpy as np
P = sys.argv[1]
RAW = os.path.join(P, '..', 'spartan2', 'sfx_raw')
SR = 48000; DUR = 51.0; N = int(round(DUR * SR))
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


VO = np.zeros(N); FX = np.zeros(N); AMB = np.zeros(N); LAUGH = np.zeros(N)
vo = load(os.path.join(P, 'audio', 'vo.wav'), lo=20, hi=20000, norm=False); place(VO, vo[:N], 0.0)
T = np.arange(N) / SR

# ---------------- ambience beds (circular) ----------------
wind = periodic_noise(N, lo=35, hi=380, color=.9)                     # winter wind, low
city = periodic_noise(N, lo=25, hi=140, color=1.2)                    # the far city: a low hum of traffic
murmur = np.concatenate([fade(load(n, pitch=.78, lo=70, hi=850), .3, .3) for n in ('crowd_1', 'feast_1', 'crowd_2', 'feast_2')])
murmur = np.tile(murmur, int(np.ceil(N / len(murmur))) + 1)[:N + SR]; xf = SR
murmur[:xf] = murmur[:xf] * np.linspace(0, 1, xf) + murmur[N:N + xf] * np.linspace(1, 0, xf); murmur = murmur[:N]
room = periodic_noise(N, lo=30, hi=150, color=1)
hum = np.sin(2 * np.pi * 60 * T) * .25 + np.sin(2 * np.pi * 120 * T) * .08     # the back-room lamp
S = lambda a, b, lv=1, r=.04: (a, b, lv, r)
def E(*spans):                                                          # a sum of trapezoids (circular edges stay open)
    out = np.zeros(N)
    for a, b, lv, r in spans: out += lv * np.clip((T - (a - r)) / r, 0, 1) * np.clip(((b + r) - T) / r, 0, 1)
    return out
outside = [S(35.93, 39.36), S(39.36, 40.35, .6)]
AMB += wind * E(*outside) * db(-24)
AMB += city * E(*outside) * db(-27)
bar = [S(3.85, 6.12), S(8.21, 19.38, .8), S(22.19, 23.6, .5), S(23.6, 26.67, .3), S(31.27, 34.02, .8), S(40.35, 43.21, .7), S(46.08, 48.5, 1.3)]
LAUGH += murmur * E(S(46.08, 48.5, 1.3)) * db(-26)
AMB += murmur * E(*bar[:-1]) * db(-26)
AMB += room * E(*bar, S(19.38, 22.19, .6), S(26.67, 31.27, .6)) * db(-27)
AMB += (room + hum) * E(S(2.6, 3.85), S(6.12, 8.21), S(34.02, 35.93)) * db(-25)
AMB += room * E(S(43.21, 46.08, 1.2)) * db(-25) + wind * E(S(43.21, 46.08, .4)) * db(-30)
AMB += room * E(S(48.5, 49.25, .8)) * db(-26)                         # the room after the laughter stops
AMB += room * E(S(0, 2.6, .9), S(49.25, 51.0, .9)) * db(-27)            # the desk, the front page

# ---------------- effects ----------------
def clack(t0, g=-20):                                                   # a rail joint on the El, deep
    place(FX, thump(80, 40, .2, .05), t0, g); place(FX, knock(0, 70), t0 + .01, g - 3)
def glug(t0, dur, g=-20, rate=9):                                       # liquid: low bubbling
    n = int(dur * SR); tt = np.arange(n) / SR
    x = band(rng.standard_normal(n), lo=90, hi=650) * (.4 + .6 * np.abs(np.sin(np.pi * rate * tt))) ** 2
    place(FX, fade(x / (np.abs(x).max() + 1e-9), .05, .15), t0, g)
def tap(t0, g=-19, f=150):                                              # glass / wood set down: a low tock, never a clink
    place(FX, knock(0, f), t0, g); place(FX, thump(120, 60, .12, .025), t0, g - 4)
def step(t0, g=-22, k=0):
    place(FX, load('v_steps_1', ss=.05 + (k % 3) * .4, dur=.24, pitch=.72, hi=1300), t0, g); place(FX, thump(85, 45, .14, .03), t0, g - 2)
def engine(t0, dur, f0, f1, g=-14):                                     # an old car's engine: a low saw-like growl that rises
    n = int(dur * SR); tt = np.arange(n) / SR; f = f0 * (f1 / f0) ** (tt / dur)
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) + .6 * np.sin(2 * ph + .3) + .35 * np.sin(3 * ph) + .25 * band(rng.standard_normal(n), lo=30, hi=300)
    x *= (1 + .3 * np.sin(4 * ph))
    place(FX, fade(x / np.abs(x).max() * (.2 + .8 * (tt / dur) ** 1.6), .1, .05), t0, g)

# 1 the front page: a low rush as we punch in, a deep stamp on the year, a rush down the page, a flashbulb pop on each of
#   the five photographs (low thumps, never thin)
place(FX, whoomph(.6, 40, 260, rev=True), 0.0, -18)
place(FX, thump(70, 28, 1.0, .3), 0.62, -8); place(FX, boom(1.6, 52, 26, .45), 0.62, -16)
place(FX, whoomph(.55, 50, 300), 1.26, -19)
for k, tp in enumerate((1.52, 1.68, 1.84, 1.99, 2.14)):
    place(FX, thump(130 - 6 * k, 55, .22, .045), tp, -12); place(FX, whoomph(.14, 200, 700), tp - .03, -26)
# 2 the policy lifted; 3 the glass raised, the gulp
place(FX, whoomph(.35, 60, 240), 2.62, -26)
place(FX, whoomph(.4, 60, 220), 3.98, -27)
place(FX, load('eat_1', ss=.1, dur=.5, pitch=.7, hi=1200), 5.4, -22); place(FX, load('breath_2', ss=.2, dur=.5, pitch=.78, hi=1300), 5.95, -25)
# 4 the back room: a chair creaks as they lean in; a low chuckle
place(FX, load('v_creak_1', ss=.3, dur=.6, pitch=.6, hi=1100), 6.35, -23)
place(FX, load('v_chuckle_1', ss=0, dur=1.0, pitch=.76, hi=1400), 7.35, -25)
# 5 the register: the key, the drawer slamming out on nothing; a sigh
tap(8.85, -18, 110); place(FX, thump(70, 36, .35, .1), 8.97, -15); place(FX, whoomph(.25, 70, 200), 8.93, -22)
place(FX, load('breath_3', ss=.1, dur=.7, pitch=.72, hi=1300), 9.45, -22)
# 6 the bottle slides down the bar and stops
n = int(.75 * SR); sl = band(rng.standard_normal(n), lo=70, hi=500) * np.sin(np.pi * np.arange(n) / n) ** .7
place(FX, sl / np.abs(sl).max(), 10.48, -20); tap(11.22, -17, 95)
# 7 a low snigger between the two
place(FX, load('v_chuckle_2', ss=0, dur=1.0, pitch=.74, hi=1300), 13.55, -23)
# 8 glass after glass: gulps and the empties set down; then a big contented 'ahh' and a laugh
per = .8
for k in range(3):
    t0 = 14.45 + k * per
    place(FX, load('eat_2', ss=.05 + k * .3, dur=.3, pitch=.7, hi=1100), t0 + .3, -23); tap(t0 + per * .85, -18, 105 + 8 * k)
place(FX, load('breath_1', ss=.2, dur=.7, pitch=.76, hi=1300), 16.95, -21)
place(FX, load('v_laugh_2', ss=0, dur=.9, pitch=.78, hi=1400), 17.25, -24)
# 9 the can comes up; 10 the antifreeze glugs in; 11 the spoon, the powder
place(FX, whoomph(.4, 50, 200), 18.35, -22); place(FX, thump(75, 40, .3, .08), 18.85, -19)
glug(19.4, 1.4, -17, 7)
tap(21.05, -22, 140); n = int(.8 * SR); pw = band(rng.standard_normal(n), lo=100, hi=900) * np.exp(-np.arange(n) / SR / .25)
place(FX, pw / np.abs(pw).max(), 21.3, -28); place(FX, rumble(.9, 30, 120, .2, .5), 21.4, -24)
# 12 he nods off: a slow, deep snore; he slumps against the bar
place(FX, load('breath_1', ss=.1, dur=.8, pitch=.6, hi=900), 22.55, -22); place(FX, thump(70, 36, .4, .1), 23.25, -18)
# 13 morning: a snore — he jolts awake — taps his glass for more
place(FX, load('breath_1', ss=.1, dur=.8, pitch=.58, hi=900), 23.75, -23)
place(FX, whoomph(.3, 70, 260), 24.62, -22); place(FX, load('v_gasp_1', ss=0, dur=.5, pitch=.8, hi=1400), 24.7, -24)
for k in range(3): tap(25.95 + k * .2, -19, 120)
# 14 the drawer on two coins; a moth flutters up
place(FX, thump(70, 36, .35, .1), 26.78, -16); place(FX, whoomph(.22, 70, 200), 26.74, -22)
n = int(.7 * SR); fl = band(rng.standard_normal(n), lo=90, hi=600) * (.5 + .5 * np.sin(2 * np.pi * 14 * np.arange(n) / SR)) * np.sin(np.pi * np.arange(n) / n)
place(FX, fl / np.abs(fl).max(), 26.9, -28)
# 15 flies over the fish; the tacks rattle down; the lid of bread
n = int(3.6 * SR); tt = np.arange(n) / SR
buzz = (np.sin(2 * np.pi * 118 * tt + 3 * np.sin(2 * np.pi * 2.3 * tt)) + .5 * np.sin(2 * np.pi * 236 * tt)) * (.5 + .5 * np.sin(2 * np.pi * .9 * tt) ** 2)
place(FX, fade(band(buzz, hi=500), .2, .3), 27.65, -31)
for k in range(16): tap(30.0 + rng.random() * .85, -26 - rng.random() * 5, 150 + rng.integers(0, 50))
place(FX, thump(90, 40, .3, .07), 31.06, -18)
# 16 the bites, the chewing, a happy 'mm'; the finger: one more
for b in (31.45, 31.95, 32.45): place(FX, load('eat_3', ss=.1 + (b - 31.45), dur=.35, pitch=.72, hi=1200), b, -20); place(FX, thump(100, 50, .12, .03), b + .05, -24)
place(FX, load('eat_1', ss=.4, dur=.5, pitch=.7, hi=1100), 32.15, -25)
place(FX, load('v_chuckle_1', ss=.1, dur=.8, pitch=.8, hi=1300), 33.3, -24)
# 17 they give up: a sigh, a fist on the table
place(FX, load('breath_3', ss=.2, dur=.8, pitch=.7, hi=1300), 34.25, -21); place(FX, thump(80, 38, .4, .1), 34.95, -16)
# 18 the cab idles at the kerb; the bills; the driver's chuckle
n = int(1.15 * SR); tt = np.arange(n) / SR
idle = np.sin(2 * np.pi * 34 * tt) * (.6 + .4 * np.sin(2 * np.pi * 11 * tt)) + .3 * band(rng.standard_normal(n), lo=30, hi=180)
place(FX, fade(idle / np.abs(idle).max(), .05, .05), 35.93, -19)
place(FX, whoomph(.3, 80, 260), 36.05, -25); place(FX, load('v_chuckle_2', ss=.1, dur=.8, pitch=.72, hi=1300), 36.4, -23)
# 19–20 the engine roars up, the old horn, the rush — and the white
engine(37.0, 2.4, 30, 92, -12)
place(FX, fade(load('v_horn_2', ss=0, dur=.7, pitch=.6, hi=1500), .03, .2), 37.25, -21)
place(FX, whoomph(1.0, 40, 500, rev=True), 38.4, -12)
place(FX, thump(95, 28, 1.2, .35), 39.36, -6); place(FX, boom(2.2, 55, 24, .6), 39.36, -14)
# 22 the door, the wind, his steps across the boards; the gang's gasp
place(FX, load('v_door_1', ss=0, dur=1.0, pitch=.68, hi=1300), 40.42, -19); place(FX, whoomph(.6, 40, 200), 40.5, -22)
for k in range(6): step(40.95 + k * .25, -21 - 3 * (k % 2), k)
place(FX, load('v_gasp_3', ss=0, dur=.6, pitch=.78, hi=1400), 41.0, -23); tap(42.45, -18, 100)
# 23 the gas cock turns; a low breath of gas; the door creaks behind; he sleeps
place(FX, load('v_creak_2', ss=.2, dur=.5, pitch=.55, hi=1000), 43.3, -21)
n = int(2.6 * SR); hs = band(rng.standard_normal(n), lo=120, hi=1100) * np.minimum(1, np.arange(n) / SR / .3)
place(FX, fade(hs / np.abs(hs).max(), .1, .3), 43.45, -30)
place(FX, load('v_creak_1', ss=.4, dur=.6, pitch=.55, hi=1000), 44.4, -26)
place(FX, load('breath_1', ss=.1, dur=.9, pitch=.56, hi=800), 44.9, -27)
# 24 the gang roar and toast — the door — the laughter dies
for i, nm in enumerate(('v_laugh_1', 'v_laugh_3', 'v_laugh_4')): place(LAUGH, fade(load(nm, ss=0, dur=2.2, pitch=.78 - .03 * i, hi=1500), .05, .3), 46.12 + .2 * i, -22 - 2 * i)
tap(46.62, -16, 95); tap(46.66, -19, 110)
place(FX, load('v_door_2', ss=0, dur=.8, pitch=.66, hi=1200), 47.78, -20); place(FX, whoomph(.4, 40, 180), 47.8, -24)
for k in range(2): step(48.0 + k * .28, -21, k)
place(FX, thump(60, 28, 1.2, .4), 48.5, -12)
# 25 the paper spins in out of the dark and slaps down on the desk
place(FX, whoomph(1.15, 35, 420, rev=True), 49.28, -14)
n = int(1.1 * SR); tt = np.arange(n) / SR; fl = band(rng.standard_normal(n), lo=80, hi=600) * (.5 + .5 * np.sin(2 * np.pi * (6 + 10 * tt) * tt)) * (tt / 1.1) ** 1.5
place(FX, fl / np.abs(fl).max(), 49.32, -24)
place(FX, thump(95, 30, .9, .2), 50.42, -6); place(FX, rumble(.6, 30, 200, .005, .2), 50.42, -14)
fx_gate = np.ones(N); a_, b_ = int(48.48 * SR), int(48.55 * SR); fx_gate[a_:b_] = np.linspace(1, 0, b_ - a_); fx_gate[b_:int(49.25 * SR)] = 0
# ---------------- mix ----------------
# the effects duck ~6 dB under the voice (fast attack, slow release) and pass a soft limiter, so the narration stays on top
fx = FX + LAUGH * fx_gate + AMB
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
