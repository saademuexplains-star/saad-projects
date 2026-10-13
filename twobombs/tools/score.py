#!/usr/bin/env python3
"""Two Bombs — background score. (Header from the Taster score; cues below are this film's.)
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
SR = 48000; DUR = 54.0; N = int(round(DUR * SR))
rng = np.random.default_rng(13)
hz = lambda m: 440.0 * 2 ** ((m - 69) / 12)
db = lambda d: 10 ** (d / 20)
B = 60 / 72

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


D2, A2, B2, C3, D3, E3, F3, Fs3, G3, A3, Bb3, B3, C4, D4, E4, F4, Fs4, G4, A4, B4, D5 = 38, 45, 47, 48, 50, 52, 53, 54, 55, 57, 58, 59, 60, 62, 64, 65, 66, 67, 69, 71, 74
THEME = [Fs4, A4, B4, A4, Fs4, E4, D4, E4, Fs4, None, A4, Fs4, E4, D4, None, None]
THEME_MIN = [F4, A4, Bb3 + 12, A4, F4, E4, D4, E4, F4, None, A4, F4, E4, D4, None, None]
def mbmotif(t0, notes, step, level=-17, wet=.7):
    for i, m in enumerate(notes):
        if m is None: continue
        x = mbox(m, 2.6, level); place(DRY, x, t0 + i * step); place(WET, x * wet, t0 + i * step)
# A — the morning (and the coda round into it): a warm D-major pad from 52.3 that wraps through the start to the flash;
#     the theme on the harp twice; a darker colour as the plane crosses
x = pad([D3, Fs3, A3], 11.1, att=1.0, rel=.4, cutoff=1000, bass=D2, level=-24); place(DRY, x, 52.3); place(WET, x * .5, 52.3)
motif(.25, THEME, B / 2, level=-18); motif(.25 + 8 * B, THEME[:8], B / 2, level=-19)
place(DRY, glass([D4 + 12, D4 + 13], 1.5, [(0, 0), (.8, 1), (1.5, 1)], level=-33), 8.0)
place(DRY, drone(D2, 1.5, [(0, 0), (1.2, 1), (1.5, 1)], level=-25), 8.0)
# B — after the blast: nothing but a low drone under the ringing; a sorrowful cluster as he sees his arm
place(DRY, drone(D2, 4.0, [(0, 0), (1.0, 1), (3.6, 1), (4.0, 0)], level=-26), 12.4)
place(DRY, strings([D3, Eb3 := 51, A3], 2.5, [(0, 0), (.6, 1), (2.1, 1), (2.5, 0)], trem=[(0, 4), (2.5, 7)], cutoff=1400), 13.98, db(-24))
# C — the cloud: a low brass cluster that opens as it climbs; an ominous high shimmer
place(DRY, braam([D2, A2, Eb3 - 12], 4.8, [(0, 0), (1.2, .5), (4.2, 1), (4.8, .2)], [(0, 140), (4.2, 800), (4.8, 300)], level=-12), 16.4)
place(DRY, glass([A4 + 12, Bb3 + 24], 4.4, [(0, 0), (1.5, 1), (4.0, 1), (4.4, 0)], level=-33), 16.6)
place(DRY, boom(3.0, 50, 24, 1.0, level=-11), 17.45)
# D — the night: a lone low line over a dim D minor
x = pad([D3, F3, A3], 2.4, att=.5, rel=.4, cutoff=600, level=-27); place(DRY, x, 21.12); place(WET, x * .7, 21.12)
place(DRY, strings([D3 - 12], 2.3, [(0, 0), (.3, 1), (2.0, 1), (2.3, 0)], cutoff=900, glide=[(0, 0), (1.0, 0), (1.3, -2), (2.3, -2)]), 21.15, db(-22))
# E — the journey home: a soft pulse, Dm → Bb → F → C; the photo: the theme, tender, on the music box
prog = [([D3, F3, A3], 23.3), ([Bb3 - 12, D3, F3], 25.92), ([F3, A3, C4], 27.2), ([C3, E3, G3], 28.98)]
for i, (ch, t0) in enumerate(prog):
    t1 = prog[i + 1][1] if i + 1 < len(prog) else 30.72
    x = pad(ch, t1 - t0, att=.25, rel=.3, cutoff=900, level=-25); place(DRY, x, t0); place(WET, x * .5, t0)
for k in range(int((30.6 - 23.35) / B)): place(DRY, kick(62, 34, .5, .16, level=-20 + (2 if k % 4 == 0 else 0)), 23.35 + k * B)
mbmotif(27.25, THEME_MIN[:9], B / 2, level=-17, wet=.9)
# F — Nagasaki, the office: uneasy low tremolo
place(DRY, strings([D3, F3], 5.6, [(0, 0), (.8, .7), (5.2, .9), (5.6, .8)], trem=[(0, 5), (5.6, 8)], cutoff=1500), 30.72, db(-25))
# G — he insists: a rising shepard and noise into the window — cut dead before the blast
place(DRY, shepard(3.9, level=-19, rate0=.25, rate1=1.4), 36.4); place(DRY, noise_riser(2.0, 150, 4000, level=-17), 38.3)
place(DRY, strings([D3, Eb3, A3], 3.9, [(0, 0), (1, .6), (3.8, 1), (3.9, 1)], trem=[(0, 5), (3.9, 14)], cutoff=2000), 36.4, db(-23))
# H — the wreck: a low drone only
place(DRY, drone(D2, 1.6, [(0, 0), (.4, 1), (1.3, 1), (1.6, 0)], level=-26), 40.45)
# I — the elegy: D major; the theme returns, warm; G → D at the ceremony; the ghosts; the plea rises; the cranes resolve
x = pad([D3, Fs3, A3], 2.5, att=.6, rel=.3, cutoff=1000, bass=D2, level=-24); place(DRY, x, 41.86); place(WET, x * .5, 41.86)
motif(42.0, THEME[:8], B / 2, level=-18, wet=.8)
x = pad([G3, B3, D4], 1.6, att=.3, rel=.2, cutoff=1100, level=-24); place(DRY, x, 44.3); place(WET, x * .5, 44.3)
x = pad([D3, Fs3, A3, D4], 1.6, att=.3, rel=.3, cutoff=1100, bass=D2, level=-23); place(DRY, x, 45.85); place(WET, x * .5, 45.85)
mbmotif(44.5, [A4, B4, A4, Fs4, None, D4], B / 2, level=-18)
x = pad([B2, D3, Fs3], 2.5, att=.5, rel=.3, cutoff=700, level=-25); place(DRY, x, 47.4); place(WET, x * .7, 47.4)
place(DRY, glass([Fs4 + 12, B4 + 12], 2.3, [(0, 0), (.8, 1), (2.3, .4)], level=-32), 47.5)
x = pad([E3, G3, B3], 1.2, att=.3, rel=.2, cutoff=1000, level=-24); place(DRY, x, 49.88); place(WET, x * .5, 49.88)
x = pad([A2, E3, G3, Cs4 := 61], 1.25, att=.3, rel=.1, cutoff=1200, level=-23); place(DRY, x, 51.05); place(WET, x * .5, 51.05)
place(DRY, noise_riser(1.2, 200, 3000, level=-22), 51.1)
motif(52.4, THEME[8:14], B / 2, level=-17, wet=.9)
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
# dead air on the flashes, just before each blast
mix = DRY * gate([(9.42, 9.62), (40.28, 40.42)]) + wet * gate([(9.44, 9.62), (40.3, 40.42)])
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
