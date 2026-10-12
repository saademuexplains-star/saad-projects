#!/usr/bin/env python3
"""Sound design + mix for "The Spartan boy" (44.7 s voiceover, 45.4 s video).

    mix.py <project dir>   ->  audio/sfx.wav, audio/mix.wav (voice + SFX, before loudness normalisation),
                               audio/sfx_stem.wav + audio/vo_stem.wav (exact levels in the mix)

Dark and bassy: every clip is low-passed (no hiss, no 'tings'), lows boosted, no whoosh transitions.
A low drone, sub thumps, heartbeats, risers and reverse booms glue the cuts; beds duck under the voice.
The film ends in the same lamp-lit room it starts in (same fire bed, no fade), so the loop has no seam.
"""

import sys, subprocess, wave, os
import numpy as np
P = sys.argv[1]
RAW = os.path.join(P, 'sfx_raw')
SR = 44100
DUR = 45.4
N = int(DUR * SR)
rng = np.random.default_rng(11)


def load(name, ss=0.0, dur=None, af='', gain_db=0.0, norm=True):
    """Decode a clip (mono, 44.1k), optional ffmpeg filter chain, peak-normalise, apply gain."""
    cmd = ['ffmpeg', '-v', 'error', '-ss', str(ss)]
    if dur: cmd += ['-t', str(dur)]
    cmd += ['-i', os.path.join(RAW, name + '.mp3') if not name.endswith('.wav') else name, '-ac', '1', '-ar', str(SR)]
    if af: cmd += ['-af', af]
    cmd += ['-f', 'f32le', '-']
    x = np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32).astype(np.float64)
    if norm and np.abs(x).max() > 0: x = x / np.abs(x).max()
    return x * 10 ** (gain_db / 20)


def fade(x, fi=0.01, fo=0.05):
    x = x.copy(); n = len(x); a = int(fi * SR); b = int(fo * SR)
    if a: x[:a] *= np.linspace(0, 1, min(a, n))[:n] if a <= n else np.linspace(0, 1, n)
    if b: x[max(0, n - b):] *= np.linspace(1, 0, min(b, n))
    return x


def place(bus, x, t0):
    i = int(round(t0 * SR))
    if i >= N: return
    if i < 0: x = x[-i:]; i = 0
    n = min(len(x), N - i)
    bus[i:i + n] += x[:n]


def lowpass_fft(x, fc):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / (1 + (f / fc) ** 4)
    return np.fft.irfft(X, len(x))


def automation(keys):
    """piecewise-linear gain curve from [(t, gain), ...]"""
    t = np.arange(N) / SR
    ks = np.array(keys, dtype=float)
    return np.interp(t, ks[:, 0], ks[:, 1])


def loop_to(x, n, xf=.3):
    """loop a clip to n samples with short crossfades so the seams don't dip or click"""
    xf = int(xf * SR); ramp = np.linspace(0, 1, xf); out = x.copy()
    while len(out) < n:
        out = np.concatenate([out[:-xf], out[-xf:] * (1 - ramp) + x[:xf] * ramp, x[xf:]])
    return out[:n]


def thump(f0=88, f1=32, dur=.7, decay=.2, gain_db=-8):
    n = int(dur * SR); t = np.arange(n) / SR
    ph = 2 * np.pi * np.cumsum(np.linspace(f0, f1, n)) / SR
    env = np.exp(-t / decay) * (1 - np.exp(-t / .004))
    body = np.sin(ph) * env + .25 * np.sin(2 * ph) * env * np.exp(-t / .05)
    return body * 10 ** (gain_db / 20)


def heartbeat(gain_db=-12):
    return thump(70, 38, .45, .09, gain_db) + np.concatenate([np.zeros(int(.27 * SR)), thump(64, 36, .45, .08, gain_db - 3)])[:int(.45 * SR)]


def riser(dur, gain_db=-12, f0=38, f1=78):
    """bassy build-up that peaks on its last sample: swelling sub rumble + rising sub/octave tone (no hiss)"""
    n = int(dur * SR); tt = np.arange(n) / SR
    nz = lowpass_fft(rng.standard_normal(n), 170); nz /= np.abs(nz).max()
    ph = 2 * np.pi * np.cumsum(np.geomspace(f0, f1, n)) / SR
    tone = np.sin(ph) + .45 * np.sin(2 * ph + .3)
    env = (tt / dur) ** 2.4
    return (0.55 * nz + 0.55 * tone) * env * 10 ** (gain_db / 20)


def whoomph(dur=.9, f0=110, f1=38, att=.12, gain_db=-12):
    """bassy swell: low noise blooming in with a falling sub tone (no hiss)"""
    n = int(dur * SR); tt = np.arange(n) / SR
    nz = lowpass_fft(rng.standard_normal(n), 260); nz /= np.abs(nz).max()
    ph = 2 * np.pi * np.cumsum(np.linspace(f0, f1, n)) / SR
    env = (1 - np.exp(-tt / att)) * np.exp(-np.maximum(0, tt - att) / (dur * .35))
    return (0.8 * nz + 0.6 * np.sin(ph)) * env * 10 ** (gain_db / 20)


def footfall(gain_db=-14, f0=95):
    """one heavy step: a short sub knock plus a dull low-passed scuff"""
    n = int(.22 * SR); tt = np.arange(n) / SR
    nz = lowpass_fft(rng.standard_normal(n), 500); nz /= np.abs(nz).max()
    knock = np.sin(2 * np.pi * np.cumsum(np.linspace(f0, 45, n)) / SR) * np.exp(-tt / .045)
    return (knock + .35 * nz * np.exp(-tt / .03)) * 10 ** (gain_db / 20)


def drip(gain_db=-14):
    """a thick drop landing: a short falling 'blup', low and round"""
    n = int(.18 * SR); tt = np.arange(n) / SR
    return np.sin(2 * np.pi * np.cumsum(np.linspace(420, 140, n)) / SR) * np.exp(-tt / .035) * (1 - np.exp(-tt / .002)) * 10 ** (gain_db / 20)


def shatter(gain_db=-10):
    """a clay jug hitting packed earth: dull crack, a burst of crunchy low fragments"""
    n = int(.7 * SR); tt = np.arange(n) / SR
    nz = lowpass_fft(rng.standard_normal(n), 2200); nz /= np.abs(nz).max()
    crack = nz * np.exp(-tt / .035) * (1 - np.exp(-tt / .0015))
    frag = np.zeros(n)
    for k in range(9):
        t0 = int((.03 + rng.random() * .32) * SR); L = int(.03 * SR)
        g = lowpass_fft(rng.standard_normal(L), 1600); g = g / np.abs(g).max() * np.exp(-np.arange(L) / SR / .008) * (.5 - k * .04)
        frag[t0:t0 + L] += g[:max(0, min(L, n - t0))]
    return (crack + .6 * frag) / 1.4 * 10 ** (gain_db / 20)


beds = np.zeros(N)
hits = np.zeros(N)
LP = lambda fc, g=5: f'lowpass=f={fc},lowpass=f={fc},bass=g={g}:f=110:w=0.8'
t = np.arange(N) / SR


def splash(dur=.7, gain_db=-12):
    """water thrown up: a low noise burst with a soft tail (no hiss)"""
    n = int(dur * SR); tt = np.arange(n) / SR
    nz = lowpass_fft(rng.standard_normal(n), 1400); nz /= np.abs(nz).max()
    return nz * np.exp(-tt / .16) * (1 - np.exp(-tt / .006)) * 10 ** (gain_db / 20)


def clank(gain_db=-10):
    """bronze helmet seating: a few low inharmonic partials over a sub knock"""
    n = int(1.4 * SR); tt = np.arange(n) / SR
    x = sum(a * np.sin(2 * np.pi * f * tt + p) * np.exp(-tt / d) for f, a, d, p in
            ((142, 1, .5, 0), (331, .55, .3, 1), (547, .3, .18, 2), (803, .16, .1, .5)))
    x = x * (1 - np.exp(-tt / .002))
    return x / np.abs(x).max() * 10 ** (gain_db / 20)


beds = np.zeros(N)
hits = np.zeros(N)
LP = lambda fc, g=5: f'lowpass=f={fc},lowpass=f={fc},bass=g={g}:f=110:w=0.8'
t = np.arange(N) / SR
marks = []                                              # times that already carry a hit (for the punch kicks)

# ---------------------------------------------------------------- beds (ducked under the voice)
# the lamp-lit room: fire crackle. Same level at 0 s and at the end so the loop has no seam; louder once the door
# opens (torches); again on the guard's torch, the dusk handover and the torch at the door
fire = loop_to(load('v_fire_1', af=LP(2200, 6)), N)
beds += fire * automation([(0, .08), (.95, .08), (1.05, .16), (4.0, .14), (4.15, 0), (19.55, 0), (19.65, .18), (26.6, .14), (26.7, 0),
                           (39.6, 0), (39.75, .1), (42.6, .1), (42.75, .08), (45.4, .08)])

# deep drone that carries the piece (A1 + fifth + octave, slow beating) + sub rumble; it tightens toward the fox
# and the altar, empties on the eyes, and swells again for the man he becomes
drone = (np.sin(2 * np.pi * 55 * t) + .7 * np.sin(2 * np.pi * 55.35 * t + 1) + .5 * np.sin(2 * np.pi * 82.4 * t + 2) + .35 * np.sin(2 * np.pi * 110.2 * t)
         + .3 * np.sin(2 * np.pi * 41.2 * t + .5))
drone *= (1 + .25 * np.sin(2 * np.pi * .13 * t))
rum = lowpass_fft(rng.standard_normal(N), 90); rum /= np.abs(rum).max()
drone = drone / np.abs(drone).max() * .8 + rum * .45
beds += drone * automation([(0, .06), (.95, .06), (1.05, .12), (2.2, .1), (4.1, .07), (7.3, .09), (9.9, .1), (10.0, .06), (13.1, .07), (17.3, .09),
                            (19.6, .12), (21.9, .13), (24.9, .17), (25.0, .07), (26.5, .05), (26.66, .1), (29.1, .14), (31.45, .17), (33.2, .12),
                            (34.5, .08), (37.2, .11), (39.6, .13), (41.4, .16), (42.7, .1), (44.2, .14), (45.0, .07), (45.4, .06)])

# night wind: under the home scenes, the cold hill (rising into the rain), the hunt and the house at night
wind = lowpass_fft(rng.standard_normal(N), 380); wind /= np.abs(wind).max()
wind *= (1 + .5 * np.sin(2 * np.pi * .21 * t + 1)) / 1.5
beds += wind * automation([(0, .05), (2.2, .05), (2.3, .03), (4.0, .02), (4.1, .06), (5.3, .04), (7.3, .08), (8.6, .12), (9.9, .14), (9.99, 0),
                           (34.5, 0), (36.3, .05), (37.2, .07), (39.6, .07), (42.6, .06), (42.75, .05), (45.4, .05)])

# rain on the hill as the year turns (low, a soft roar rather than hiss)
rainb = lowpass_fft(rng.standard_normal(N), 1100); rainb /= np.abs(rainb).max()
beds += rainb * automation([(0, 0), (8.6, 0), (9.3, .12), (9.95, .14), (10.05, 0), (45.4, 0)])

# the river at dusk: low churn + lapping
riv = lowpass_fft(rng.standard_normal(N), 650); riv /= np.abs(riv).max()
riv *= (1 + .45 * np.sin(2 * np.pi * .7 * t) * np.sin(2 * np.pi * .23 * t + 2)) / 1.45
beds += riv * automation([(0, 0), (9.95, 0), (10.05, .16), (11.8, .16), (11.9, .1), (13.0, .1), (13.1, 0), (45.4, 0)])

# the march to camp, the creep along the fence (ducked steps live in the hits)
place(beds, fade(load('march_2', af=LP(1600, 7), gain_db=-6), .2, .3), 4.0)

# the farm at night: breeze in dry grass + faint, dark crickets
nb = loop_to(load('night_2', af=LP(1800, 6)), N)
ncr = loop_to(load('night_1', af=LP(2600, 3)), N)
night = automation([(0, 0), (17.2, 0), (17.35, .2), (26.6, .18), (26.66, 0), (37.1, 0), (37.25, .2), (42.7, .18), (42.75, 0), (45.4, 0)])
beds += nb * night + ncr * night * .35

# the altar: the crowd, tense and muttering; it gasps on the whip
crowd = loop_to(load('crowd_1', ss=.2, dur=2.4, af=LP(2200, 5)), N)
beds += crowd * automation([(0, 0), (26.66, 0), (26.75, .14), (29.1, .16), (31.4, .16), (31.6, .06), (33.2, .04), (33.3, 0), (45.4, 0)])

# the barracks: a dull room tone of sleeping boys
room = lowpass_fft(rng.standard_normal(N), 220); room /= np.abs(room).max()
beds += room * automation([(0, 0), (13.0, 0), (13.15, .1), (16.1, .1), (16.2, 0), (33.27, 0), (33.35, .08), (34.45, .08), (34.55, 0), (45.4, 0)])

# ---------------------------------------------------------------- hits (ducked less)
def hit(name, t0, gain_db, ss=0.0, dur=None, af=None, fi=.005, fo=.08, bus=None):
    place(hits if bus is None else bus, fade(load(name, ss=ss, dur=dur, af=af or LP(4000, 5), gain_db=gain_db), fi, fo), t0)

def voc(name, t0, gain_db, ss=0.0, dur=None, lp=3000, bass=5, pitch=1.0, fi=.02, fo=.12, echo=''):
    """a voice / creature clip: optional pitch shift, low-passed, bass-warmed"""
    pf = f'asetrate={int(SR * pitch)},aresample={SR},' if pitch != 1.0 else ''
    x = load(name, ss=ss, dur=dur, af=pf + f'lowpass=f={lp},lowpass=f={lp},bass=g={bass}:f=140:w=0.8' + echo, gain_db=gain_db)
    place(hits, fade(x, fi, fo), t0)

def kick(t0, f0=80, f1=32, dur=.8, decay=.22, gain_db=-10):
    place(hits, thump(f0, f1, dur, decay, gain_db), t0); marks.append(t0)

_boom = load('v_boom_1', af='lowpass=f=1100,lowpass=f=1100,bass=g=6:f=90:w=0.8')
def rev_boom(dur, gain_db=-12):
    x = _boom[:int(dur * SR)][::-1].copy()
    x *= np.linspace(0, 1, len(x)) ** 1.5
    return x / (np.abs(x).max() + 1e-9) * 10 ** (gain_db / 20)

def into(t_hit, x):
    place(hits, fade(x, .03, .005), t_hit - len(x) / SR)

# 1 the room at night: a heartbeat while he listens; footsteps outside (the shadow under the door); the door bursts
for tb in (.47, .69): place(hits, lowpass_fft(footfall(-15, 70), 600), tb)
place(hits, whoomph(.5, 90, 40, .08, -17), 1.36); kick(1.72, 110, 46, .3, .06, -15)
place(hits, heartbeat(-15), .12); place(hits, heartbeat(-14), .62)
into(.98, riser(.75, -11)); into(.98, rev_boom(.5, -12))
hit('door_2', .98 - .04, -5, af=LP(1500, 8), fo=.6)
hit('v_boom_1', .98, -11, af=LP(1300, 7), fo=.8)
kick(.98, 62, 24, 1.4, .45, -5)
voc('v_gasp_2', 1.06, -15, lp=2400, bass=4, pitch=1.15, fo=.15)
for i, tb in enumerate((1.5, 1.98)): place(hits, footfall(-12, 85), tb); marks.append(tb)
into(2.19, rev_boom(.3, -16))
# 2 the mother: a held-back sob that breaks on CRY; the boy's hand slips away
kick(2.87, 100, 42, .35, .08, -13); voc('v_gasp_2', 3.0, -21, lp=2200, bass=3, pitch=1.22, fo=.12); voc('v_gasp_2', 3.3, -23, lp=2200, bass=3, pitch=1.25, fo=.12)
voc('sob_1', 3.56 - 1.98, -15, lp=2400, bass=4, fi=.3, fo=.4)
kick(3.56, 70, 30, .9, .3, -11)
place(hits, whoomph(.8, 80, 34, .15, -16), 3.0)
# 3 the march to camp (steps in the bed); he stumbles; a low swell into the razor
kick(4.9, 95, 40, .4, .1, -14)
into(5.31, riser(.5, -13)); into(5.31, rev_boom(.35, -14))
# 4 the razor: two hard scrapes, the head jolts on each
hit('shave_1', 5.31, -10, ss=.1, dur=.45, af=LP(2600, 6), fi=.01, fo=.1)
hit('shave_2', 5.73, -10, ss=1.0, dur=.5, af=LP(2600, 6), fi=.01, fo=.15)
kick(5.33, 95, 40, .5, .12, -10); kick(5.75, 95, 40, .5, .12, -10)
# 5 sandals dropped on the pile, bare feet walk past
into(6.62, rev_boom(.25, -16))
kick(6.62, 110, 45, .45, .1, -8)
place(hits, splash(.4, -20), 6.62)
for tb in (6.92, 7.2): place(hits, footfall(-19, 70), tb)
# 6 alone on the hill: a cold gust blooms; heartbeats as the year turns
place(hits, whoomph(1.4, 70, 32, .4, -13), 7.3); place(hits, whoomph(.35, 110, 44, .05, -15), 7.38); kick(7.62, 85, 36, .5, .12, -13)
for tb in (8.32, 9.05): place(hits, heartbeat(-13), tb); marks.append(tb)
into(9.43, riser(.5, -15)); kick(9.45, 70, 30, .8, .25, -12)
# 7 the river: straining, then the reeds rip out on RIPPED with a burst of water
into(11.02, riser(.9, -10)); into(11.02, rev_boom(.5, -12))
hit('reeds_2', 11.02 - .22, -8, ss=1.2, dur=1.1, af=LP(2400, 7), fi=.01, fo=.3)
place(hits, splash(.8, -9), 11.03)
kick(11.02, 70, 28, 1.1, .35, -7)
# 8 bare hands: stems squeal and snap, the knuckles split, blood drips
hit('reeds_1', 12.15 - .23, -11, ss=1.65, dur=1.2, af=LP(2200, 7), fi=.01, fo=.3)
for tc in (12.1, 12.25, 12.42, 12.58): kick(tc, 125, 52, .28, .05, -12)
place(hits, drip(-15), 12.62); place(hits, drip(-17), 12.98)
kick(12.5, 75, 32, .6, .18, -14)
# 9 eyes snap open; the stomach growls; he folds
kick(13.29, 100, 44, .4, .09, -11)
voc('growl_1', 13.6, -6, dur=1.4, lp=900, bass=9, fi=.01, fo=.3)
kick(13.62, 60, 26, 1.0, .3, -9)
into(14.35, rev_boom(.3, -16))
# 10 the trainer chews; the cruel grin on PURPOSE
hit('eat_3', 14.4 - .5, -12, af=LP(2200, 8), fi=.05, fo=.2)
hit('eat_1', 14.5 - .44, -13, dur=.9, af=LP(2200, 8), fi=.02, fo=.2); kick(14.5, 110, 50, .25, .05, -16)
voc('v_chuckle_1', 15.32, -13, dur=1.1, lp=2200, bass=6, pitch=.82, fo=.3)
kick(15.44, 70, 30, .8, .25, -11)
# 11 he points out into the world on STEAL, laughing
place(hits, whoomph(.6, 80, 36, .1, -16), 16.15)
kick(16.77, 85, 34, .6, .16, -9)
voc('v_laugh_2', 16.95, -15, ss=.1, dur=1.2, lp=2200, bass=6, pitch=.8, fo=.35)
# 12 creeping along the fence; the fox snarls as he snatches it
for tb in (17.42, 17.8): place(hits, footfall(-21, 70), tb)
into(18.15, riser(.45, -13))
voc('fox_2', 18.15 - .16, -8, ss=1.2, dur=1.3, lp=3000, bass=5, fi=.01, fo=.3)
kick(18.15, 80, 32, .8, .22, -8)
voc('fox_1', 18.5, -14, ss=.54, dur=1.0, lp=2400, bass=5, fi=.02, fo=.3)
# 13 the barn door bangs, the torch flares, the guard's boots; the fox vanishes under the cloak on HIDE
into(19.6, rev_boom(.35, -12))
hit('door_1', 19.58, -9, af=LP(1400, 8), fo=.5)
place(hits, whoomph(.8, 120, 40, .06, -11), 19.6)
kick(19.6, 66, 26, 1.1, .35, -8)
for tb in (19.85, 20.3): place(hits, footfall(-14, 85), tb); marks.append(tb)
into(20.72, riser(.4, -14))
place(hits, whoomph(.3, 120, 50, .04, -14), 20.58); kick(20.72, 90, 36, .7, .18, -8)
voc('fox_1', 20.74, -16, ss=.6, dur=.9, lp=700, bass=7, fo=.3)
# 14 the questioning: a low voice barking; the fox gnaws under the cloth; the heart races; EATING tears in
kick(22.45, 105, 44, .3, .07, -15); kick(23.15, 105, 44, .3, .07, -15)
voc('v_growl_1', 21.95, -19, dur=1.6, lp=1200, bass=6, pitch=.85, fi=.05, fo=.3)
voc('fox_1', 22.4, -17, ss=.4, dur=2.5, lp=650, bass=8, fi=.2, fo=.4)
voc('fox_2', 23.5, -15, ss=.2, dur=1.5, lp=650, bass=8, fi=.1, fo=.3)
for i in range(6):                                      # the heart speeds up under the questioning
    place(hits, heartbeat(-13 + .6 * i), 22.3 + i * .45 - i * i * .015)
hit('eat_1', 23.69 - .5, -11, af=LP(1300, 9), fo=.2)
kick(23.69, 64, 26, 1.0, .3, -8)
voc('breath_1', 24.0, -16, ss=.3, dur=.9, lp=1600, bass=4, fo=.25)
into(24.99, riser(.8, -10)); into(24.99, rev_boom(.5, -12))
# 15 his eyes: the world drops out — only the heart, slow and huge, and the muffled gnawing
kick(24.99, 56, 22, 1.4, .45, -7)
for tb in (25.6, 26.2): place(hits, heartbeat(-9), tb); marks.append(tb)
voc('fox_1', 25.1, -24, ss=.4, dur=1.4, lp=400, bass=6, fi=.2, fo=.4)
into(26.66, riser(.5, -13)); into(26.66, rev_boom(.4, -11))
# 16 memory: a low bloom through the white flash; the priest drags the boy over stone; our boy flinches on CAUGHT
place(hits, whoomph(1.2, 70, 30, .1, -10), 26.66); marks.append(26.66)
hit('v_drag_1', 26.75, -11, ss=.3, dur=2.3, af=LP(2000, 6), fi=.1, fo=.4)
kick(28.63, 85, 36, .6, .15, -9)
into(29.2, riser(.3, -12))
# 17 the whip: three lashes on WHIPPED, FRONT, CITY; the crowd gasps; the boy cries out
for i, th in enumerate((29.2, 30.22, 30.95)):
    if i: into(th, riser(.3, -13))
    hit('whip_2', th, -6 - i, dur=.9, af=LP(2600, 7), fo=.3)
    kick(th, 70, 26, 1.0, .3, -6 - i)
place(beds, fade(load('crowd_2', ss=3.9, dur=1.1, af=LP(2200, 5), gain_db=-6), .02, .4), 29.2 - .14)
voc('pain_2', 29.26, -17, dur=.9, lp=1800, bass=4, fo=.3)
voc('pain_2', 31.0, -19, ss=1.75, dur=.9, lp=1700, bass=4, fo=.3)
into(31.45, rev_boom(.3, -15))
# 18 the stone turns red: thick drops, the small hand goes limp on RED
place(hits, whoomph(1.2, 60, 28, .3, -13), 31.5)
for tb, g in ((31.8, -12), (32.15, -14), (32.45, -15)): place(hits, drip(g), tb)
kick(32.62, 60, 24, 1.2, .4, -9)
# 19 you survive: slow heartbeats as the face hardens over the years
place(hits, heartbeat(-11), 33.3); place(hits, heartbeat(-12), 33.9); marks += [33.3, 33.9]
place(hits, whoomph(1.2, 55, 28, .4, -13), 33.5)
into(34.47, rev_boom(.3, -15))
# 20 the knife: drawn and pressed into his hand, the blade catches the light; night falls
hit('knife_2', 35.95 - 1.1, -12, af=LP(3200, 6), fi=.3, fo=.25)
kick(35.91, 75, 30, .9, .25, -8)
kick(35.26, 110, 46, .3, .06, -14)
place(hits, whoomph(1.0, 60, 28, .3, -12), 36.3)
kick(36.44, 70, 30, .7, .2, -12)
into(37.17, rev_boom(.35, -14))
# 21 the hunt: soft steps in the grass, the man looks up and gasps
for tb in (37.3, 37.62): place(hits, footfall(-20, 70), tb)
voc('v_gasp_3', 37.95, -12, lp=2000, bass=4, pitch=.95, fo=.2)
place(hits, shatter(-9), 38.42); kick(38.42, 100, 44, .4, .08, -12)
kick(37.97, 80, 32, .7, .2, -9)
into(39.23, riser(.5, -13)); kick(39.25, 66, 28, .9, .3, -9)
into(39.65, rev_boom(.35, -12))
# 22 thirty: a heavy low hit on THIRTY; the helmet slides down and seats with a bronze clank; his boots
kick(39.87, 58, 24, 1.3, .4, -8)
into(41.85, riser(.45, -12))
place(hits, clank(-21), 41.4); place(hits, clank(-11), 41.84); kick(41.85, 90, 36, .8, .2, -8)
for i, tb in enumerate((42.05, 42.32, 42.6)): place(hits, footfall(-11, 85), tb); marks.append(tb)
into(42.71, rev_boom(.3, -14))
# 23 the house: the mother gasps, his hand reaches, her grip is torn away, the build into the boy's face, the hit on SON
place(hits, whoomph(.45, 110, 44, .06, -14), 43.95); kick(44.0, 90, 38, .5, .12, -14)
voc('v_gasp_2', 42.86, -16, lp=2400, bass=4, pitch=1.18, fo=.15)
voc('sob_2', 43.3 - 2.2, -19, ss=1.5, lp=2200, bass=4, fi=.2, fo=.3)
into(44.19, riser(1.4, -9)); into(44.19, rev_boom(.6, -10))
hit('v_boom_1', 44.19, -9, af=LP(1300, 7), fo=1.0)
kick(44.19, 56, 22, 1.2, .5, -6)

# soft sub kicks under the camera punches (STRONG words) that have nothing else on them
strong = [float(s) for s in open(os.path.join(P, 'words_header.js')).read().split('STRONG = [')[1].split(']')[0].split(',')]
for tb in strong:
    if all(abs(tb - m) > .2 for m in marks):
        place(hits, thump(105, 42, .32, .075, -20), tb)

# ---------------------------------------------------------------- duck beds under the voice
vo = load(os.path.join(P, 'audio', 'vo_final.wav'), norm=True)
vo = np.concatenate([vo, np.zeros(max(0, N - len(vo)))])[:N]
fr = SR // 100
env = np.array([np.abs(vo[i:i + fr]).mean() for i in range(0, N, fr)])
gate = np.clip(env / .03, 0, 1)
sm = np.zeros_like(gate); a = 0.0
for i, g in enumerate(gate):
    a = a + (g - a) * (.5 if g > a else .04)
    sm[i] = a
duck_beds = 1 - .55 * np.interp(np.arange(N) / fr, np.arange(len(sm)), sm)
duck_hits = 1 - .4 * np.interp(np.arange(N) / fr, np.arange(len(sm)), sm)
sfx = beds * duck_beds + hits * duck_hits

# ---------------------------------------------------------------- stereo, write
def stereo(x, width=.0):
    d = int(.011 * SR)
    r = np.concatenate([np.zeros(d), x[:-d]]) if width else x
    return np.stack([x, x * (1 - width) + r * width], 1)

sfx_st = stereo(beds * duck_beds, .5) + stereo(hits * duck_hits)
vo_st = stereo(vo * .9)
mix = vo_st + sfx_st * .9
peak = np.abs(mix).max()
print(f'peaks: vo {np.abs(vo_st).max():.2f}  sfx {np.abs(sfx_st).max():.2f}  mix {peak:.2f}')
mix = mix / peak * .89

def write(path, x):
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())

write(os.path.join(P, 'audio', 'sfx.wav'), sfx_st / max(1e-9, np.abs(sfx_st).max()) * .89)
write(os.path.join(P, 'audio', 'mix.wav'), mix)
write(os.path.join(P, 'audio', 'sfx_stem.wav'), sfx_st * .9 * .89 / peak)
write(os.path.join(P, 'audio', 'vo_stem.wav'), vo_st * .89 / peak)
speak = np.interp(np.arange(N) / fr, np.arange(len(gate)), gate) > .5
rv = np.sqrt(np.mean(vo[speak] ** 2)); rs = np.sqrt(np.mean((sfx * .9)[speak] ** 2))
print(f'voice-over-sfx while speaking: {20 * np.log10(rv * .9 / rs):.1f} dB;  sfx alone in gaps: {20 * np.log10(np.sqrt(np.mean(sfx[~speak] ** 2)) + 1e-9):.1f} dBFS')
