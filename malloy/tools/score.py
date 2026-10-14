#!/usr/bin/env python3
"""The Man Who Wouldn't Die — background score (a dark, sly 1930s noir: pizzicato walking bass, music box, low strings). (Header from the Taster score; cues below are this film's.)
The Taster v2 — background score with risers (re-timed to the v2 cut). 55.8 s, 48 kHz stereo, locked to the picture, loops seamlessly (every
part sits on a circular timeline; reverb tails wrap from the end into the start). D minor, 84 bpm (beat .714 s).
  taster_score.py <project dir>  ->  audio/score.wav
Cues: 0 a harp motif over a low D pad (the court; something is off); 1.42 hit; 10.16 the meat drops; 10.68 the floor:
drone + glass; 13.05 the cell, the motif softly; 15.35 sting; 16.4 the feast: big pad + drum pulse; 20.0 "wrong": the
music stops dead, braam; dread tremolo; RISER 1 into 22.55 (every eye); 24.38 the queen's minor second; RISER 2 into the
gallows (30.25); SHEPARD from 31.6 while she waits for him to fall, cut dead at 36.6 "But you don't."; 37.26 the
flashback: a sad pad and the motif slow, one high note on the drop; 41.45 resolve: a low pulse; 44.4 near silence under
"My lady…"; 47.3 braam swell; 48.62 the king's laugh: an ironic major stab; 51.92 everything cuts → boom, a dread cluster
that holds to the end and wraps into the start."""
import sys, os, wave
import numpy as np

P = sys.argv[1]
SR = 48000; DUR = 51.0; N = int(round(DUR * SR))
rng = np.random.default_rng(13)
hz = lambda m: 440.0 * 2 ** ((m - 69) / 12)
db = lambda d: 10 ** (d / 20)
B = 60 / 100

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

def harp(m, dur=2.2, level=-15):
    """plucked harp / lute: harmonic partials, fast attack, each partial decaying faster than the one below"""
    n = int(dur * SR); t = np.arange(n) / SR; out = np.zeros((2, n))
    for ch, c in enumerate((-3, 3)):
        f = hz(m) * 2 ** (c / 1200)
        out[ch] = sum(a * np.exp(-t / d) * np.sin(2 * np.pi * f * k * t + rng.uniform(0, 6.28)) for k, a, d in ((1, 1, 1.1), (2, .55, .7), (3, .3, .4), (4, .16, .25), (5, .08, .15)) if f * k < 12000)
    out *= np.minimum(1, t / .004)
    return out * db(level)

def motif(t0, notes, step, level=-15, wet=.6, oct=0):
    for i, m in enumerate(notes):
        if m is None: continue
        x = harp(m + 12 * oct, 2.2, level); place(DRY, x, t0 + i * step); place(WET, x * wet, t0 + i * step)


C2, G2, Ab2, Bb2, C3, D3, Eb3, F3, G3, Ab3, Bb3, B3, C4, D4, Eb4, F4, G4, Ab4, A4, Bb4, C5 = 36, 43, 44, 46, 48, 50, 51, 53, 55, 56, 58, 59, 60, 62, 63, 65, 67, 68, 69, 70, 72
def pluck(m, level=-14, dur=.7):
    """a pizzicato double bass: low harp partials with a short decay and a woody thump"""
    n = int(dur * SR); t = np.arange(n) / SR; out = np.zeros((2, n))
    for ch, c in enumerate((-2, 2)):
        f = hz(m) * 2 ** (c / 1200)
        out[ch] = sum(a * np.exp(-t / d) * np.sin(2 * np.pi * f * k * t) for k, a, d in ((1, 1, .38), (2, .45, .2), (3, .2, .1), (4, .08, .06)))
    out += band(rng.standard_normal(n), 60, 400) * np.exp(-t / .012) * .25
    return out * np.minimum(1, t / .003) * db(level)
def walk(t0, t1, notes, level=-14, step=B):
    k = 0; t = t0
    while t < t1 - .05:
        x = pluck(notes[k % len(notes)], level - (0 if k % 2 == 0 else 2)); place(DRY, x, t); place(WET, x * .25, t); k += 1; t += step
def brush(t0, t1, level=-30):
    """brushes on a snare, soft and low (swish on 2 and 4)"""
    t = t0; k = 0
    while t < t1 - .05:
        n = int(.22 * SR); tt = np.arange(n) / SR
        x = band(rng.standard_normal(n), 150, 1800) * np.exp(-tt / (.07 if k % 2 else .03))
        place(DRY, x * db(level - (0 if k % 2 else 5)), t); k += 1; t += B
SLY = [C4, Eb4, G4, Ab4, G4, None, Eb4, D4, C4, None, B3, D4, C4, None, None, None]
def mbm(t0, notes, step, level=-18, wet=.7, oct=0):
    for i, m in enumerate(notes):
        if m is None: continue
        x = mbox(m + 12 * oct, 2.4, level); place(DRY, x, t0 + i * step); place(WET, x * wet, t0 + i * step)
def hp(t0, notes, step, level=-17, wet=.6):
    for i, m in enumerate(notes):
        if m is None: continue
        x = harp(m, 2.0, level); place(DRY, x, t0 + i * step); place(WET, x * wet, t0 + i * step)
def padc(ch, a, b, level=-25, cutoff=800, bass=None, wet=.5):
    x = pad(ch, b - a, att=.4, rel=.3, cutoff=cutoff, bass=bass, level=level); place(DRY, x, a); place(WET, x * wet, a)
# A — night, the gang, the plan (wraps in from the coda): a dark C minor pad, the sly tune on the harp, the bass walks in
padc([C3, Eb3, G3], 49.25, 49.25 + 10.85, level=-25, cutoff=700, bass=C2)        # 49.25 → 51 → 0 → 8.1 (circular)
hp(.95, SLY[:7], B / 2, level=-19)
place(DRY, stab([C3, Eb3, G3, C4], 1.0, .35, level=-12, cutoff=2000), 0.62); place(DRY, boom(2.0, 48, 24, .7, level=-15), 0.62)
walk(2.6, 8.15, [C2 + 12, G2, Ab2, G2, C2 + 12, Bb2, Ab2, G2], level=-15)
place(DRY, drone(C2, 2.1, [(0, 0), (.5, 1), (1.8, 1), (2.1, 0)], level=-27), 6.12)
place(DRY, stab([C3, Eb3, Ab3], .8, .25, level=-17, cutoff=1600), 7.58)            # "payout"
# B — the free tab: a jaunty walk, the music box with the tune; "felt great": a bright major lift
walk(8.25, 17.8, [C2 + 12, Eb3 - 12, F3 - 12, G2, Ab2, G2, F3 - 12, Eb3 - 12], level=-14)
brush(8.25, 17.8)
mbm(10.15, SLY, B / 2, level=-19)
padc([Ab2 + 12, C4, Eb4], 14.4, 16.9, level=-27, cutoff=900)
padc([C3, E3 := 52, G3, C4], 16.93, 17.82, level=-23, cutoff=1300)
place(DRY, stab([C3, E3, G3, C4], .9, .3, level=-15, cutoff=2400), 16.93)
# C — the poisons: everything drops to a low tremolo; a sour glass shimmer
place(DRY, strings([C3, Db3 := 49, G3], 4.4, [(0, 0), (.4, .8), (4.0, 1), (4.4, .6)], trem=[(0, 5), (4.4, 9)], cutoff=1400), 17.86, db(-24))
place(DRY, glass([G4 + 12, Ab4 + 12], 2.7, [(0, 0), (.8, 1), (2.4, 1), (2.7, 0)], level=-34), 19.45)
place(DRY, kick(60, 32, .7, .25, level=-17), 20.9)
# D — he passes out: a slow descending line; morning: he wakes — a comic stab and the bass again
place(DRY, strings([G3, C3], 1.4, [(0, 0), (.2, 1), (1.2, 1), (1.4, 0)], cutoff=900, glide=[(0, 0), (.3, 0), (1.3, -5), (1.4, -5)]), 22.2, db(-23))
padc([Eb3, G3, Bb3], 23.6, 24.7, level=-28, cutoff=700)
place(DRY, stab([C3, E3, G3], .7, .2, level=-16, cutoff=2200), 24.69)
walk(24.75, 26.65, [C2 + 12, G2, A2 := 45, B2 := 47], level=-15, step=B / 2)
# E — broke: a low thud; the sandwich: the walk returns, sly; "seconds": the bright stab again
place(DRY, kick(55, 30, .8, .3, level=-15), 26.72)
walk(27.65, 33.3, [C2 + 12, Eb3 - 12, G2, Ab2, G2, Eb3 - 12, D3 - 12, B2], level=-15)
brush(27.65, 33.3, -32)
mbm(28.2, SLY[:13], B / 2, level=-20)
place(DRY, glass([D4 + 12, Eb4 + 12], 1.3, [(0, 0), (.3, 1), (1.3, 0)], level=-34), 29.9)
place(DRY, stab([C3, E3, G3, C4], .9, .28, level=-15, cutoff=2400), 33.37)
padc([F3, A4 - 12, C4], 33.37, 34.0, level=-25, cutoff=1200)
# F — they give up and hire the cab: low strings climbing, a shepard, a noise riser into the lamps; cut to silence on the white
place(DRY, strings([C3, G3], 3.4, [(0, 0), (.5, .7), (3.4, 1)], trem=[(0, 4), (3.4, 8)], cutoff=1500), 34.05, db(-25))
place(DRY, shepard(2.6, level=-20, rate0=.3, rate1=1.8), 36.75); place(DRY, noise_riser(1.7, 120, 3500, level=-18), 37.6)
place(DRY, braam([C2, G2, Db3 - 12], 2.3, [(0, 0), (1.6, .8), (2.3, 1)], [(0, 120), (2.3, 900)], level=-14), 37.05)
# G — three weeks later: quiet, a thin pad; the door — he's back: the bright stab, the walk, the music box tune
padc([Eb3, G3, C4], 39.45, 40.45, level=-28, cutoff=700)
place(DRY, stab([C3, E3, G3, C4], 1.0, .3, level=-14, cutoff=2400), 40.54)
walk(40.6, 43.15, [C2 + 12, E3 - 12, G2, A2, B2, C2 + 12, G2, E3 - 12], level=-14, step=B / 2)
mbm(41.2, [G4, A4, G4, E3 + 12, C4, None, G4, C5], B / 2, level=-20)
# H — the gas: a low drone, a slow minor cluster, the glass; nothing moves
place(DRY, drone(C2, 2.9, [(0, 0), (.6, 1), (2.6, 1), (2.9, .3)], level=-23), 43.26)
place(DRY, strings([C3, Eb3, Gb3 := 54], 2.85, [(0, 0), (1.0, .8), (2.6, 1), (2.85, .5)], cutoff=1000), 43.26, db(-26))
place(DRY, glass([C4 + 12, Db3 + 24], 2.6, [(0, 0), (1, 1), (2.6, .5)], level=-35), 43.4)
# I — bragging: the walk at its jauntiest, a kick on the one; the police: cut dead — a boom
walk(46.12, 48.48, [C2 + 12, E3 - 12, G2, A2, Bb2, A2, G2, E3 - 12], level=-13, step=B / 2)
brush(46.12, 48.48, -29)
for k in range(int((48.4 - 46.12) / B)): place(DRY, kick(68, 36, .45, .14, level=-19), 46.12 + k * B)
place(DRY, boom(2.4, 50, 24, .8, level=-12), 48.5)
place(DRY, drone(C2, .8, [(0, 0), (.3, 1), (.8, 1)], level=-26), 48.5)
hp(49.4, [G4, None, Eb4], B / 2, level=-20, wet=.9)
place(DRY, stab([C3, Eb3, G3, C4], .9, .3, level=-13, cutoff=1800), 50.42)                    # "the man who wouldn't die": the tune's last notes
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
# dead air on the white of the headlamps, and as the laughter is cut off
mix = DRY * gate([(39.3, 39.42), (48.46, 48.5)]) + wet * gate([(39.32, 39.42)])
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
