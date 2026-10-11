#!/usr/bin/env python3
"""The Lullaby — background score with risers. 44.0 s, 48 kHz stereo, locked to the picture, loops seamlessly
(everything is placed on a circular timeline, reverb tails wrap from the end into the start).
Key of the lullaby (A minor), its tempo (beat .75 s) and its bar grid, so it sits under her singing and his humming.
  score.py <project dir>  ->  audio/score.wav
Cues: 0-13.3 music-box lullaby over a soft pad (the box winds down into RISER 1, hit at 13.31 into the snow);
13.3 winter glass; 16.65 warm pad for him; 20.4 his hum; 23.3 everything stops (the house went quiet);
24.65 sub dread; RISER 2 into the floor's groan (28.25); 29.2 the slow heavy swell (a sleeper turning over);
32.58 stinger as her eyes open; RISER 3 on her surge, cut dead at 34.4 (silent, white-faced); 35.97 the clamp hit;
tremolo dread; 39.0 one fragile note on the children; RISER 4 (shepard) into the reveal; 40.17 the big hit;
41.6 the lullaby returns, low and dark, and carries round into the start."""
import sys, os, json, wave
import numpy as np

P = sys.argv[1]
SR = 48000; DUR = 44.0; N = int(round(DUR * SR))
rng = np.random.default_rng(11)
mel = json.load(open(os.path.join(P, 'audio', 'melody.json'))); BEAT = mel['beat']; NOTES = mel['notes']
hz = lambda m: 440.0 * 2 ** ((m - 69) / 12)
db = lambda d: 10 ** (d / 20)

DRY = np.zeros((2, N)); WET = np.zeros((2, N))        # WET = reverb send (also heard dry via DRY when wanted)

def place(bus, x, t0, gain=1.0):
    """add a mono (n,) or stereo (2, n) segment at time t0 on the circular timeline"""
    if x.ndim == 1: x = np.stack([x, x])
    i0 = int(round(t0 * SR)) % N; n = x.shape[1]; k = 0
    while k < n:
        a = (i0 + k) % N; m = min(n - k, N - a)
        bus[:, a:a + m] += x[:, k:k + m] * gain; k += m

def env(keys, n):
    ks = np.array(keys, float); return np.interp(np.arange(n) / SR, ks[:, 0], ks[:, 1])

def band(x, lo=None, hi=None, order=4):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); m = np.ones_like(f)
    if lo: m = m / (1 + (lo / np.maximum(f, 1e-3)) ** order)
    if hi: m = m / (1 + (f / hi) ** order)
    return np.fft.irfft(X * m, len(x))

def phase_of(f, n):
    return 2 * np.pi * (f * np.arange(n) / SR if np.isscalar(f) else np.cumsum(f) / SR)

def saw(f, n, K=30, cutoff=1200.0, ph0=0.0):
    """band-limited, softly low-passed saw (additive). f scalar or per-sample array"""
    ph = phase_of(f, n) + ph0; f0 = f if np.isscalar(f) else float(np.mean(f)); out = np.zeros(n)
    for k in range(1, K + 1):
        if k * f0 > 14000: break
        out += np.sin(k * ph) / k / (1 + (k * f0 / cutoff) ** 4)
    return out

def fade_edges(x, a=.01, b=.02):
    n = x.shape[-1]; e = np.ones(n); na, nb = int(a * SR), int(b * SR)
    if na: e[:na] = np.linspace(0, 1, na)
    if nb: e[-nb:] = np.minimum(e[-nb:], np.linspace(1, 0, nb))
    return x * e

# ---------------------------------------------------------------- instruments
def pad(notes, dur, att=.6, rel=.9, cutoff=1000.0, bass=None, level=-24):
    """soft string/organ pad: 3 detuned voices per note spread in stereo + a sine sub on the bass note"""
    n = int((dur + rel) * SR); out = np.zeros((2, n))
    for m in notes:
        for v, c in enumerate((-7, 0, 6)):
            x = saw(hz(m) * 2 ** (c / 1200), n, cutoff=cutoff, ph0=rng.uniform(0, 6.28))
            p = (v - 1) * .55; out[0] += x * (1 - p); out[1] += x * (1 + p)
    out /= (3 * len(notes)) ** .5 * 1.6
    if bass is not None: out += .3 * np.sin(phase_of(hz(bass), n) + rng.uniform(0, 6.28))
    e = env([(0, 0), (att, 1), (dur, 1), (dur + rel, 0)], n)
    return out * e * db(level)

def mbox(m, dur=2.8, level=-16, det=2.5):
    """music box / celesta: inharmonic tine partials, hard little attack, long ring; slight L/R detune"""
    n = int(dur * SR); t = np.arange(n) / SR; out = np.zeros((2, n))
    parts = [(1.0, 1.0, 1.9), (2.0, .3, 1.0), (4.07, .15, .5), (6.27, .09, .28), (9.93, .04, .15)]
    for ch, c in enumerate((-det, det)):
        f = hz(m) * 2 ** (c / 1200)
        out[ch] = sum(a * np.exp(-t / d) * np.sin(2 * np.pi * f * r * t + rng.uniform(0, 6.28)) for r, a, d in parts if f * r < 16000)
    out *= np.minimum(1, t / .002)
    out += rng.standard_normal(n) * np.exp(-t / .003) * .12
    return out * db(level)

def strings(notes, dur, keys, trem=None, cutoff=2200.0, glide=None, depth=.65, det=(-8, 0, 7)):
    """bowed string cluster (detuned saws). keys: amplitude envelope (s, linear); trem: [(s, Hz)] tremolo rate;
    glide: [(s, semitones)] pitch bend for the whole cluster"""
    n = int(dur * SR); t = np.arange(n) / SR; out = np.zeros((2, n))
    bend = 2 ** (env(glide, n) / 12) if glide else 1.0
    for m in notes:
        for v, c in enumerate(det):
            vib = 1 + .0035 * np.sin(2 * np.pi * (5.1 + v * .4) * t + rng.uniform(0, 6.28))
            x = saw(hz(m) * 2 ** (c / 1200) * vib * bend, n, K=26, cutoff=cutoff, ph0=rng.uniform(0, 6.28))
            p = (v - 1) * .6; out[0] += x * (1 - p); out[1] += x * (1 + p)
    out /= (len(det) * len(notes)) ** .5 * 1.4
    if trem:
        ph = 2 * np.pi * np.cumsum(env(trem, n)) / SR
        out *= (1 - depth) + depth * (.5 + .5 * np.sin(ph))
    return out * env(keys, n)

def noise_riser(dur, f0, f1, curve=2.4, width=.9, level=-12):
    """filtered-noise riser: a band that sweeps f0 -> f1 (log) while it swells; ends at full level"""
    n = int(dur * SR); u = np.arange(n) / n; white = rng.standard_normal((2, n)); out = np.zeros((2, n))
    fc = f0 * (f1 / f0) ** (u ** 1.25); edges = np.geomspace(60, 14000, 19)
    for i in range(18):
        lo, hi = edges[i], edges[i + 1]; w = np.exp(-.5 * (np.log2(np.sqrt(lo * hi) / fc) / width) ** 2)
        if w.max() < 1e-3: continue
        out += np.stack([band(white[c], lo, hi, 6) for c in range(2)]) * w
    return out / (np.abs(out).max() + 1e-9) * (u ** curve) * db(level)

def shepard(dur, level=-12, center=330.0, octs=7, rate0=.25, rate1=1.6):
    """endless-rise illusion: octave-spaced tones gliding up (faster and faster), faded in/out at the edges"""
    n = int(dur * SR); u = np.arange(n) / n; out = np.zeros((2, n))
    rise = np.cumsum(rate0 + (rate1 - rate0) * u ** 1.5) / SR          # octaves risen so far
    base = 40.0
    for i in range(octs):
        o = (i + rise) % octs; f = base * 2 ** o
        w = np.exp(-.5 * (np.log2(f / center) / 1.25) ** 2)
        ph = 2 * np.pi * np.cumsum(f) / SR
        x = (np.sin(ph) + .35 * np.sin(2 * ph) + .12 * np.sin(3 * ph)) * w
        out[0] += x; out[1] += np.roll(x, 37)
    return out / (np.abs(out).max() + 1e-9) * (.25 + .75 * u ** 1.4) * db(level)

def kick(f0=80, f1=40, dur=.5, decay=.15, level=-10, click=.12):
    n = int(dur * SR); t = np.arange(n) / SR; f = f1 + (f0 - f1) * np.exp(-t / .045)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / decay) + rng.standard_normal(n) * np.exp(-t / .0025) * click
    return x * db(level)

def boom(dur=3.0, f0=58, f1=26, decay=.85, level=-6, body=.5):
    """cinematic impact: sub drop + a dark thud body + a short air burst"""
    n = int(dur * SR); t = np.arange(n) / SR; f = f1 + (f0 - f1) * np.exp(-t / .22)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / decay)
    thud = band(rng.standard_normal(n), 60, 700) * np.exp(-t / .09) * body
    air = band(rng.standard_normal(n), 900, 6000) * np.exp(-t / .05) * .18
    x = np.tanh((sub + thud + air) * 1.4) / 1.4
    return np.stack([x, np.roll(x, 23)]) * np.minimum(1, t / .001) * db(level)

def braam(notes, dur, keys, fc_keys, level=-9, K=40):
    """low brass-like cluster whose filter opens and closes (the 'braam'); slightly saturated"""
    n = int(dur * SR); t = np.arange(n) / SR; E = env(keys, n); FC = env(fc_keys, n); out = np.zeros((2, n))
    for m in notes:
        for v, c in enumerate((-9, 0, 8)):
            f = hz(m) * 2 ** (c / 1200); ph = 2 * np.pi * f * t + rng.uniform(0, 6.28); x = np.zeros(n)
            for k in range(1, K + 1):
                if k * f > 9000: break
                x += np.sin(k * ph) / k / (1 + (k * f / FC) ** 4)
            p = (v - 1) * .5; out[0] += x * (1 - p); out[1] += x * (1 + p)
    out /= (3 * len(notes)) ** .5
    out = np.tanh(out * 2.2) / 2.2
    return out / (np.abs(out).max() + 1e-9) * E * db(level)

def drone(m, dur, keys, level=-24, cutoff=260.0):
    n = int(dur * SR); x = saw(hz(m), n, K=12, cutoff=cutoff, ph0=rng.uniform(0, 6.28)) + .8 * np.sin(phase_of(hz(m), n))
    y = saw(hz(m) * 1.003, n, K=12, cutoff=cutoff, ph0=rng.uniform(0, 6.28)) + .8 * np.sin(phase_of(hz(m) * 1.003, n))
    return np.stack([x, y]) / 2.2 * env(keys, n) * db(level)

def glass(notes, dur, keys, level=-30):
    n = int(dur * SR); t = np.arange(n) / SR; out = np.zeros((2, n))
    for i, m in enumerate(notes):
        sh = .6 + .4 * np.sin(2 * np.pi * (.23 + .07 * i) * t + i)
        out[0] += np.sin(2 * np.pi * hz(m) * t) * sh; out[1] += np.sin(2 * np.pi * hz(m) * 1.0015 * t + 1) * sh
    return out / len(notes) * env(keys, n) * db(level)

def stab(notes, dur=.9, decay=.22, level=-10, cutoff=3000.0):
    n = int(dur * SR); t = np.arange(n) / SR
    x = strings(notes, dur, [(0, 1), (dur, 1)], cutoff=cutoff)
    return x / (np.abs(x).max() + 1e-9) * np.exp(-t / decay) * np.minimum(1, t / .004) * db(level)

# ---------------------------------------------------------------- the score
CH = {'Am': ([45, 52, 57, 60], 33), 'C': ([48, 52, 55, 60], 36), 'Dm': ([50, 53, 57, 62], 38), 'E': ([52, 56, 59, 64], 40), 'F': ([53, 57, 60, 65], 41)}

# A — the lullaby (pos 0 at 41.6, through the loop, to 13.3): pad on the song's bars + a music box doubling her tune
A0 = 41.6; A_LEN = 15.7
for k, name in enumerate(['Am', 'Am', 'C', 'Am', 'C', 'Dm', 'E']):
    t0 = k * 2.25; d = min(2.25, A_LEN - t0); notes, bass = CH[name]
    x = pad(notes, d + (.05 if t0 + d < A_LEN else 0), att=1.2 if k == 0 else .5, rel=.9 if t0 + d < A_LEN else .015, cutoff=950, bass=bass, level=-33)
    if t0 + d >= A_LEN: x = fade_edges(x, 0, .015)
    place(DRY, x, A0 + t0, .85); place(WET, x, A0 + t0, .5)
# the music box (an octave above her): it slows and sinks flat as the riser takes over (11.55 -> 13.3)
MB = np.zeros((2, int((A_LEN + 3) * SR))); acc = 0
for i, (m, b) in enumerate(NOTES):
    t0 = acc * BEAT; acc += b
    if t0 >= A_LEN - .3: break
    x = mbox(m + 12, level=-26 + 1.5 * ((i * 7) % 3 - 1) * .5)
    i0 = int(t0 * SR); MB[:, i0:i0 + x.shape[1]] += x[:, :MB.shape[1] - i0]
tt = np.arange(MB.shape[1]) / SR; tw = 13.95                                   # A-time where the wind-down starts
speed = np.where(tt < tw, 1.0, 1 - .085 * np.clip((tt - tw) / 1.75, 0, 1) ** 1.3)
src = np.cumsum(speed) / SR
MB = np.stack([np.interp(src, tt, MB[c]) for c in range(2)])
MB *= env([(0, 1), (tw, 1), (A_LEN - .05, .55), (A_LEN, 0), (A_LEN + 3, 0)], MB.shape[1])
place(DRY, MB, A0, .8); place(WET, MB, A0, .7)
# undercurrents: a low drone from the crack (4.0), a soft downbeat pulse from 8.85, a high minor-ninth that won't settle
place(DRY, drone(33, 9.35, [(0, 0), (2.0, 1), (9.3, 1), (9.35, 0)], level=-33), 3.95)
for ts, lv in ((8.85, -24), (11.1, -20), (12.6, -17), (12.97, -15), (13.16, -13)):
    place(DRY, kick(level=lv), ts)
x = glass([82], 3.9, [(0, 0), (1.4, 1), (3.0, 1), (3.9, 0)], level=-40); place(DRY, x, 7.75); place(WET, x, 7.75, .6)

# RISER 1 — "she stared at the floorboards": 11.55 -> 13.3, cut dead into the dip to black, hit on the snow (13.31)
d = 1.75
place(DRY, fade_edges(noise_riser(d, 250, 6500, level=-13), .3, .012), 11.55)
x = fade_edges(strings([57, 58, 64], d, [(0, 0), (.4, .25), (d, 1)], trem=[(0, 6), (d, 17)], glide=[(0, 0), (d, 2.0)], cutoff=2600), .05, .012)
place(DRY, x * db(-15), 11.55); place(WET, x * db(-15), 11.55, .4)
place(DRY, boom(level=-7), 13.31); place(WET, boom(level=-16), 13.31)

# B1 — "One winter she caught a fever": cold glass, a few falling celesta notes, a sick minor-second underneath
x = glass([81, 88], 3.9, [(0, 0), (.8, 1), (3.0, 1), (3.9, 0)], level=-36); place(DRY, x, 13.4); place(WET, x, 13.4, .8)
for ts, m in ((13.75, 88), (14.55, 84), (15.35, 81), (16.1, 83)):
    x = mbox(m, level=-33); place(DRY, x, ts, .6); place(WET, x, ts, .9)
place(DRY, drone(33, 3.9, [(0, 0), (.3, 1), (3.0, .8), (3.9, 0)], level=-33), 13.31)
x = strings([45, 46], 2.6, [(0, 0), (.9, 1), (1.9, 1), (2.6, 0)], cutoff=700, glide=[(0, 0), (1.3, -.25), (2.6, .1)])
place(DRY, x * db(-33), 14.45); place(WET, x * db(-33), 14.45, .5)

# B2 — "told her not to worry ... sat down on the bed": a warm, consoling pad (Am - F - E) leading into his hum
for t0, t1, name in ((16.65, 18.0, 'Am'), (18.0, 19.3, 'F'), (19.3, 20.4, 'E')):
    notes, bass = CH[name]; x = pad(notes, t1 - t0 + .05, att=.8 if t0 == 16.65 else .45, rel=.8, cutoff=1150, bass=bass, level=-32)
    place(DRY, x, t0, .85); place(WET, x, t0, .55)
# B3 — he hums: the pad holds the home chord; the music box answers his tune softly, two octaves up
x = pad(CH['Am'][0], 23.3 - 20.4, att=.4, rel=.02, cutoff=1150, bass=CH['Am'][1], level=-32)
place(DRY, fade_edges(x, 0, .02), 20.4, .85); place(WET, fade_edges(x, 0, .02), 20.4, .55)
acc = 0
for m, b in NOTES:
    t0 = 20.4 + acc * BEAT; acc += b
    if t0 > 23.0: break
    place(DRY, mbox(m + 12, level=-31), t0, .7); place(WET, mbox(m + 12, level=-31), t0, .7)

# C — 24.65 "the children's breathing changed": sub dread + a thin, wavering high tone
place(DRY, drone(21, 4.6, [(0, 0), (1.6, 1), (4.5, 1), (4.6, .9)], level=-27, cutoff=180), 24.65)
x = glass([88], 3.7, [(0, 0), (1.5, 1), (3.7, .6)], level=-39); place(DRY, x, 24.9); place(WET, x, 24.9, .7)
for ts, lv in ((26.7, -18), (27.45, -16)):
    place(DRY, kick(f0=70, f1=36, level=lv), ts)
# RISER 2 — "beneath the bed, something began to shift": dark, slow; peaks on the floor's groan (28.25)
d = 1.62
place(DRY, fade_edges(noise_riser(d, 150, 2600, width=1.1, level=-14), .3, .015), 26.6)
x = fade_edges(strings([45, 46, 52, 53], d, [(0, 0), (.5, .3), (d, 1)], trem=[(0, 4), (d, 14)], glide=[(0, 0), (d, 1.5)], cutoff=1500), .1, .015)
place(DRY, x * db(-13), 26.6); place(WET, x * db(-13), 26.6, .4)
place(DRY, boom(f0=52, f1=24, decay=1.0, level=-6), 28.25); place(WET, boom(level=-17), 28.25)
x = band(rng.standard_normal(int(1.2 * SR)), 300, 1300) * np.exp(-np.arange(int(1.2 * SR)) / SR / .45) * db(-24)
place(DRY, x, 28.27); place(WET, x, 28.27, .8)
place(DRY, drone(33, 1.0, [(0, 0), (.15, 1), (.85, 1), (1.0, 1)], level=-28, cutoff=200), 28.25)

# D — "slow and heavy, like a sleeper turning over": one huge low swell that opens and closes with the floor (29.2-32.2)
place(DRY, drone(33, 3.3, [(0, 1), (2.8, .8), (3.3, 0)], level=-28, cutoff=200), 29.25)
x = braam([33, 40, 46], 3.25, [(0, 0), (.5, .35), (1.5, 1), (2.2, .75), (3.0, .15), (3.25, 0)], [(0, 120), (1.5, 950), (3.25, 140)], level=-13)
place(DRY, x, 29.15); place(WET, x, 29.15, .35)
place(DRY, kick(f0=62, f1=30, dur=.9, decay=.32, level=-11), 29.25); place(DRY, kick(f0=62, f1=30, dur=.9, decay=.32, level=-10), 30.7)

# E — 32.58 her eyes snap open: a stinger; RISER 3 on her surge (32.7 -> 34.4), cut dead on the white face
place(DRY, stab([76, 77, 82, 83], level=-15), 32.58); place(WET, stab([76, 77, 82, 83], level=-20), 32.58); place(DRY, kick(level=-13), 32.58)
d = 1.7
place(DRY, fade_edges(noise_riser(d, 400, 9000, curve=2.2, level=-11), .25, .01), 32.7)
x = fade_edges(strings([57, 60, 64], d, [(0, .1), (d, 1)], trem=[(0, 8), (d, 22)], glide=[(0, 0), (d, 7.0)], cutoff=3200), .06, .01)
place(DRY, x * db(-14), 32.7); place(WET, x * db(-14), 32.7, .3)
ts = 32.75
while ts < 34.36:                                              # ticks, faster and faster
    place(DRY, kick(f0=140, f1=70, dur=.12, decay=.03, level=-19, click=.3), ts); ts += .34 * (1 - (ts - 32.75) / 1.75) ** 1.5 + .055
# silent and white-faced: only a thin ringing tone; then the air is sucked in before the clamp
x = glass([93], 1.5, [(0, 0), (.4, 1), (1.3, 1), (1.5, 0)], level=-37); place(DRY, x, 34.45)
y = boom(dur=1.2, level=-14)[:, ::-1] * env([(0, 0), (1.2, 1)], int(1.2 * SR))
place(DRY, fade_edges(y, .05, .01), 35.97 - 1.2); place(WET, y * .6, 35.97 - 1.2)
# 35.97 the clamp
place(DRY, boom(f0=70, f1=34, decay=.5, level=-7, body=.9), 35.97); place(DRY, stab([45, 46, 52, 53], decay=.3, level=-12, cutoff=1800), 35.97)
place(WET, stab([45, 46, 52, 53], decay=.3, level=-16, cutoff=1800), 35.97)

# F — held there: low tremolo dread that grows; one fragile note when we see the children (39.0); RISER 4 into the reveal
d = 40.15 - 36.05
x = fade_edges(strings([45, 46, 52], d, [(0, 0), (.6, .45), (2.6, .6), (3.2, .8), (d, 1)], trem=[(0, 5.5), (2.3, 6.5), (d, 24)], cutoff=1300), .05, .012)
place(DRY, x * db(-21), 36.05); place(WET, x * db(-21), 36.05, .4)
place(DRY, mbox(81, level=-26), 39.02, .7); place(WET, mbox(81, level=-26), 39.02, .9)
d = 1.85
place(DRY, fade_edges(shepard(d, level=-14), .2, .012), 38.3); place(WET, shepard(d, level=-22), 38.3)
place(DRY, fade_edges(noise_riser(d, 200, 10000, curve=2.6, level=-11), .3, .012), 38.3)
y = boom(dur=1.85, level=-12)[:, ::-1] * env([(0, 0), (1.85, 1)], int(1.85 * SR)); place(DRY, fade_edges(y, .05, .012), 38.3)
# 40.17 — the reveal: the biggest hit, a low braam that dies away into the dark
place(DRY, boom(dur=3.6, f0=55, f1=24, decay=1.3, level=-3, body=.8), 40.17); place(WET, boom(dur=3.6, level=-14), 40.17)
x = braam([33, 40, 45, 46], 2.9, [(0, 1), (.4, .8), (1.6, .35), (2.9, 0)], [(0, 1400), (.6, 500), (2.9, 120)], level=-9)
place(DRY, x, 40.17); place(WET, x, 40.17, .5)
# G — the thing beneath; then her song comes down through the boards (the lullaby section starts again at 41.6)
place(DRY, drone(33, 3.5, [(0, 0), (.4, 1), (2.3, .8), (3.5, 0)], level=-29, cutoff=220), 40.3)

# ---------------------------------------------------------------- reverb, silences, master
def make_ir(rt60=2.7, secs=3.4, pre=.025):
    n = int(secs * SR); t = np.arange(n) / SR; ir = np.zeros((2, n))
    for c in range(2):
        w = rng.standard_normal(n); lo = band(w, hi=2200); hi = w - lo
        ir[c] = lo * np.exp(-6.91 * t / rt60) + hi * np.exp(-6.91 * t / (rt60 * .4)) * .5
    p = int(pre * SR); ir = np.concatenate([np.zeros((2, p)), ir[:, :n - p]], 1)
    return ir / np.sqrt((ir ** 2).sum(1, keepdims=True))
IR = make_ir(); irp = np.zeros((2, N)); irp[:, :IR.shape[1]] = IR
wet = np.stack([np.fft.irfft(np.fft.rfft(band(WET[c], 120)) * np.fft.rfft(irp[c]), N) for c in range(2)]) * .55
T = np.arange(N) / SR
def gate(spans, ramp=.03):
    g = np.ones(N)
    for a, b in spans:
        g = np.minimum(g, np.clip(np.maximum((a - T) / ramp, (T - b) / ramp), 0, 1))
    return g
# "The house went quiet": dead silence 23.3-24.65. After riser 3 the reverb is choked, so the white face is silent
mix = DRY * gate([(23.32, 24.6)]) + wet * gate([(23.32, 24.6), (34.42, 35.1)])
# master: look-ahead limiter (circular), then write; loudness is set afterwards with ffmpeg
peak = np.abs(mix).max(0); win = int(.004 * SR)
padded = np.concatenate([peak[-win:], peak, peak[:win]])
from numpy.lib.stride_tricks import sliding_window_view
mx = sliding_window_view(padded, 2 * win + 1).max(1)[:N]
thr = .5; g = np.minimum(1, thr / np.maximum(mx, 1e-9))
a = np.exp(-1 / (.06 * SR)); gs = g.copy()
for _ in range(2):                                             # release smoothing (two passes round the loop)
    prev = gs[-1]
    for i in range(0, N, 4096):
        seg = gs[i:i + 4096]
        out = np.empty_like(seg)
        for j in range(len(seg)):
            prev = seg[j] if seg[j] < prev else a * prev + (1 - a) * seg[j]; out[j] = prev
        gs[i:i + 4096] = out
mix = mix * gs
mix = mix / np.abs(mix).max() * .89
with wave.open(os.path.join(P, 'audio', 'score.wav'), 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(mix.T, -1, 1) * 32767).astype(np.int16).tobytes())
print('score written; gain-reduction max %.1f dB; seam step %.4f' % (-20 * np.log10(gs.min()), np.abs(mix[:, -1] - mix[:, 0]).max()))
