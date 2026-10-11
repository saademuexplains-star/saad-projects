#!/usr/bin/env python3
"""Sound design + mix for the Viking raid short.

    mix.py <project dir>   ->  audio/sfx.wav (SFX bus), audio/mix.wav (voice + SFX, before loudness normalisation)

Everything is kept dark and bassy: clips are low-passed (no hiss, no 'tings'), lows boosted, no whoosh
transitions. A synthesized low drone, sub thumps and heartbeats glue the cuts. Beds duck under the voice.
"""
import sys, subprocess, wave, os
import numpy as np

P = sys.argv[1]
RAW = os.path.join(P, 'sfx_raw')
SR = 44100
DUR = 42.1
N = int(DUR * SR)
rng = np.random.default_rng(7)


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
    n = len(x); a = int(fi * SR); b = int(fo * SR)
    if a: x[:a] *= np.linspace(0, 1, a)
    if b: x[max(0, n - b):] *= np.linspace(1, 0, min(b, n))
    return x


def place(bus, x, t0):
    i = int(t0 * SR)
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
    ks = np.array(keys)
    return np.interp(t, ks[:, 0], ks[:, 1])


def thump(f0=88, f1=32, dur=.7, decay=.2, gain_db=-8):
    n = int(dur * SR); t = np.arange(n) / SR
    ph = 2 * np.pi * np.cumsum(np.linspace(f0, f1, n)) / SR
    env = np.exp(-t / decay) * (1 - np.exp(-t / .004))
    body = np.sin(ph) * env + .25 * np.sin(2 * ph) * env * np.exp(-t / .05)
    return body * 10 ** (gain_db / 20)


def heartbeat(gain_db=-12):
    return thump(70, 38, .45, .09, gain_db) + np.concatenate([np.zeros(int(.27 * SR)), thump(64, 36, .45, .08, gain_db - 3)])[:int(.45 * SR)]


def rumble_riser(dur, gain_db=-14):
    n = int(dur * SR); t = np.arange(n) / SR
    nz = lowpass_fft(rng.standard_normal(n), 140)
    nz /= np.abs(nz).max()
    glide = np.sin(2 * np.pi * np.cumsum(np.linspace(38, 62, n)) / SR)
    env = (t / dur) ** 2.2
    return (0.7 * nz + 0.5 * glide) * env * 10 ** (gain_db / 20)


# ---------------------------------------------------------------- beds (ducked under the voice)
beds = np.zeros(N)
hits = np.zeros(N)

LP_BASS = lambda fc, g=5: f'lowpass=f={fc},lowpass=f={fc},bass=g={g}:f=110:w=0.8'

# dawn sea: 0 - 17 s (louder around the ship shots), and again on the ship 33 - 38 s
sea = load('sea_3', af=LP_BASS(2200, 6))
sea2 = load('sea_4', af=LP_BASS(2200, 6))
sea_full = np.concatenate([sea, sea2, sea])[:N]
sea_gain = automation([(0, .06), (.2, .13), (1.0, .12), (1.25, .05), (2.4, .05), (2.6, .03), (4.25, .05), (4.6, .16), (10.5, .16), (13.1, .08), (14.5, .05), (17.0, .0), (33.2, 0), (33.6, .06), (37.7, .08), (38.0, 0), (39.3, 0), (39.8, .05), (42.1, .05)])
beds += sea_full * sea_gain

# deep low drone that carries the whole piece (A1 + fifth + octave, slow beating) + sub rumble noise
t = np.arange(N) / SR
drone = (np.sin(2 * np.pi * 55 * t) + .7 * np.sin(2 * np.pi * 55.35 * t + 1) + .5 * np.sin(2 * np.pi * 82.4 * t + 2) + .35 * np.sin(2 * np.pi * 110.2 * t)
         + .3 * np.sin(2 * np.pi * 41.2 * t + .5))
drone *= (1 + .25 * np.sin(2 * np.pi * .13 * t))
rum = lowpass_fft(rng.standard_normal(N), 90); rum /= np.abs(rum).max()
drone = drone / np.abs(drone).max() * .8 + rum * .45
drone_gain = automation([(0, 0), (.15, .05), (2.4, .06), (2.6, .1), (4.4, .1), (4.6, .06), (13.1, .07), (14.5, .09), (17.0, .1), (18.9, .1), (20.5, .2), (20.7, .14),
                         (23.1, .1), (24.9, .12), (26.8, .14), (30.0, .1), (32.3, .12), (35.8, .1), (37.8, .07), (40.6, .08), (42.1, 0)])
beds += drone * drone_gain

# fire: flash-forward (2.5-4.4), then the raid from 17 s on (muffled indoors), distant from the ship
fire = load('fire_1', af=LP_BASS(3200, 6))
fire_full = np.concatenate([fire] * 4)[:N]
fire_gain = automation([(0, 0), (1.0, 0), (1.3, .05), (2.36, .05), (2.7, .3), (3.9, .34), (4.1, .42), (4.42, .25), (4.6, 0), (17.0, 0), (17.2, .08), (18.25, .1), (18.4, .2), (20.5, .2), (21.5, .24),
                        (24.9, .2), (26.8, .3), (30.0, .22), (33.2, .12), (35.8, .08), (37.3, .14), (37.8, .02), (38.0, 0), (42.1, 0)])
fire_lp = lowpass_fft(fire_full, 900)  # extra-dark version for the far shots
far = automation([(0, 1), (2.38, 1), (2.56, 0), (33.0, 0), (33.4, 1), (37.8, 1), (38, 0)])
beds += fire_full * fire_gain * (1 - far) + fire_lp * fire_gain * far * 1.6

# rowing: distant while the ship glides in, close at water level
row = load('row_1', af=LP_BASS(3500, 5))
row2 = load('row_2', af=LP_BASS(3000, 5))
place(beds, fade(row2[int(.0 * SR):int(6.1 * SR)] * .22, .4, .5), 4.45)
place(beds, fade(row[int(1.0 * SR):int(2.7 * SR)] * .55, .08, .3), 7.25)
place(beds, fade(row2[:int(1.8 * SR)] * .14, .2, .4), 8.9)
place(beds, fade(row[int(3.0 * SR):int(4.3 * SR)] * .4, .08, .25), 10.45)

# screams heard from inside (muffled), then outside
place(beds, fade(load('scream_1', af='lowpass=f=1600,lowpass=f=1600,bass=g=4:f=120', gain_db=-15), .05, .3), 17.0)
place(beds, fade(load('scream_2', af='lowpass=f=3200,bass=g=3:f=120', gain_db=-17), .05, .6), 18.3)
place(beds, fade(load('scream_1', ss=2.0, af='lowpass=f=2600,bass=g=3:f=120', gain_db=-22), .3, .6), 21.5)

# rope / footsteps on sand while you're dragged
place(beds, fade(load('drag_1', af=LP_BASS(3000, 6), gain_db=-12), .2, .4), 33.25)

# horses arriving, then the empty wind over the ruins
place(beds, fade(load('horses_2', af=LP_BASS(3500, 6), gain_db=-11), .9, .7), 38.0)
after = load('after_1', af=LP_BASS(2600, 4))
place(beds, fade(after * .32, 1.0, .9), 39.1)

# ---------------------------------------------------------------- hits (not ducked as hard)
def hit(name, t0, gain_db, ss=0.0, dur=None, af=None, fi=.005, fo=.08):
    place(hits, fade(load(name, ss=ss, dur=dur, af=af or LP_BASS(5000, 5), gain_db=gain_db), fi, fo), t0)

# 0.00 opening sub hit
place(hits, thump(80, 30, 1.2, .35, -9), 0.0)
# 2.86 'noon' and 3.98 'ex-IST': boom
place(hits, thump(70, 32, .9, .22, -12), 2.86)
hit('boom_1', 3.96, -5, af=LP_BASS(1800, 6), fo=.6)
place(hits, thump(60, 26, 1.4, .4, -7), 3.98)
# 5.42 'ship' emerges: low swell
place(hits, thump(55, 30, 1.2, .5, -14), 5.42)
# oar strokes at water level (7.48, 8.00) + 'LOW' sub
hit('oars_1', 7.45, -13, af=LP_BASS(3500, 6))
hit('oars_4', 7.97, -12, af=LP_BASS(3500, 6))
place(hits, thump(62, 30, .8, .25, -15), 8.0)
# bow spray (10.78)
hit('splash_2', 10.74, -15, af=LP_BASS(3500, 6), fo=.4)
# 11.70 hull grinds up the beach, impact on SAND 12.74
hit('beach_2', 11.62, -10, dur=1.25, af=LP_BASS(3800, 7), fi=.15, fo=.15)
hit('door_2', 12.72, -9, af=LP_BASS(2500, 6), fo=.4)
place(hits, thump(75, 30, .9, .26, -8), 12.74)
# dog: barks at 14.22 (+ two more running into the next shot)
hit('dog_2', 14.22 - .12, -13, af='lowpass=f=4200,lowpass=f=4200,bass=g=4:f=150', fo=.3)
place(hits, thump(80, 40, .4, .1, -16), 14.22)
# 14.55 men jumping off into the shallows, charging; war drums under it
hit('splash_1', 14.53, -14, af=LP_BASS(3500, 6), fo=.3)
hit('charge_2', 14.6, -12, ss=.9, dur=2.6, af=LP_BASS(4500, 5), fi=.2, fo=.5)
hit('drums_2', 14.58, -7, af=LP_BASS(1500, 6), fo=1.0)
place(hits, thump(70, 30, .8, .22, -10), 15.98)
place(hits, thump(70, 30, .8, .22, -12), 16.5)
# 17.58 scream jolt, 18.28 door bursts open
place(hits, thump(82, 34, .8, .2, -9), 17.58)
hit('door_2', 18.27, -7, af=LP_BASS(3000, 6), fo=.3)
# 18.9 - 20.55 anticipation: heartbeat + low rumble riser into the reveal
for tb in (19.05, 19.75, 20.3):
    place(hits, heartbeat(-13), tb)
place(hits, rumble_riser(1.5, -12), 19.08)
# 20.58 VIKINGS: war horn + biggest boom
hit('horn_2', 20.5, -7, af='lowpass=f=2400,lowpass=f=2400,bass=g=7:f=90:w=0.8', fi=.08, fo=1.2)
hit('boom_1', 20.6, -3, af=LP_BASS(1600, 7), fo=.9)
place(hits, thump(58, 24, 1.8, .55, -5), 20.62)
# 22.52 silver: a soft low 'whoom' (no metallic ting)
place(hits, thump(48, 30, 1.0, .35, -17), 22.5)
# 23.1 - 24.9 fear: heartbeat speeding up, hit on SCARED
for tb in (23.2, 23.85, 24.42):
    place(hits, heartbeat(-12), tb)
place(hits, thump(72, 28, .9, .28, -9), 24.08)
# 25.54 wolf snarl, 26.11 bear roar
g1 = load('growl_1', af='lowpass=f=4000,lowpass=f=4000,bass=g=6:f=120', gain_db=-9)
place(hits, fade(g1[:int(.55 * SR)].copy(), .005, .12), 25.47)
place(hits, fade(g1[int(1.25 * SR):int(3.4 * SR)].copy(), .02, .4), 26.03)
place(hits, thump(66, 30, .7, .2, -13), 25.54)
place(hits, thump(60, 28, .8, .24, -11), 26.11)
# 26.8 berserker: drums; 27.92 battle roar
hit('drums_1', 26.82, -8, af=LP_BASS(1500, 6), fo=1.0)
hit('roar_1', 27.92 - .06, -9, af='lowpass=f=4200,lowpass=f=4200,bass=g=6:f=120', fo=.35)
place(hits, thump(64, 26, 1.0, .3, -8), 27.98)
# 29.0 arrow thuds into him (deep thunk), he grins on NO PAIN
hit('arrow_1', 29.0, -6, af=LP_BASS(3000, 8), fo=.2)
place(hits, thump(90, 40, .5, .12, -9), 29.0)
place(hits, thump(52, 30, .9, .3, -16), 29.33)
# 31.3 pitchfork hits the ground, 31.93 knees down
hit('door_1', 31.32, -16, af=LP_BASS(2200, 6), fo=.2)
place(hits, thump(78, 34, .6, .16, -10), 31.93)
# 32.78 rope yanked tight
hit('drag_2', 32.7, -12, dur=.6, af=LP_BASS(3500, 6), fo=.2)
place(hits, thump(72, 32, .7, .2, -10), 32.78)
# 33.52 jerked forward; 35.25 'slave' low swell
place(hits, thump(70, 34, .5, .14, -13), 33.52)
place(hits, thump(46, 26, 1.4, .5, -14), 35.25)
# 37.24 the house collapses into flame (distant)
place(hits, thump(55, 26, 1.2, .4, -11), 37.24)
# 38.5 help arrives
place(hits, thump(50, 30, .9, .3, -17), 38.5)
# 40.7 final 'ex-ISTS': boom, long ring out
hit('boom_1', 40.66, -4, af=LP_BASS(1500, 7), fo=1.2)
place(hits, thump(52, 22, 2.0, .7, -7), 40.7)

# ---------------------------------------------------------------- v2: character sounds, boat voice, transition hits
def voc(name, t0, gain_db, ss=0.0, dur=None, lp=3000, bass=5, pitch=1.0, fi=.02, fo=.12, bus=None, echo=''):
    """a voice / creature clip: optional pitch drop (asetrate), low-passed, bass-warmed"""
    if not os.path.exists(os.path.join(RAW, name + '.mp3')): print('missing', name); return
    pf = f'asetrate={int(SR * pitch)},aresample={SR},' if pitch != 1.0 else ''
    x = load(name, ss=ss, dur=dur, af=pf + f'lowpass=f={lp},lowpass=f={lp},bass=g={bass}:f=140:w=0.8' + echo, gain_db=gain_db)
    place(hits if bus is None else bus, fade(x, fi, fo), t0)

def whoomph(dur=.9, f0=110, f1=38, att=.12, gain_db=-12):
    """bassy ignition 'fwoomp': low noise swelling in with a falling sub tone (no hiss)"""
    n = int(dur * SR); tt = np.arange(n) / SR
    nz = lowpass_fft(rng.standard_normal(n), 260); nz /= np.abs(nz).max()
    ph = 2 * np.pi * np.cumsum(np.linspace(f0, f1, n)) / SR
    env = (1 - np.exp(-tt / att)) * np.exp(-np.maximum(0, tt - att) / (dur * .35))
    return (0.8 * nz + 0.6 * np.sin(ph)) * env * 10 ** (gain_db / 20)

# shot 1: a distant owl in the dark, the old man snores on 'a.m.'
voc('owl_1', 0.02, -22, ss=.1, dur=.6, lp=900, bass=2, fo=.2, echo=',aecho=0.8:0.7:180:0.35')
voc('snore_1', 0.64, -10, ss=.15, dur=.8, lp=1600, bass=7, pitch=.9, fi=.12, fo=.2)
# shot 2: you snore softly in bed
voc('snore_2', 1.92, -13, ss=.2, dur=.7, lp=1500, bass=7, pitch=.92, fi=.1, fo=.2)
# 2.50 burn-through into the flash-forward: a low fiery whoomph
place(hits, whoomph(1.0, 120, 36, .14, -11), 2.40)
# the longship's wooden hull groaning as it glides in, close at water level, and again under you on the ship
if os.path.exists(os.path.join(RAW, 'creak_1.mp3')):
    cr = load('creak_1', ss=.4, af=LP_BASS(1800, 7))
    xf = int(.35 * SR); ramp = np.linspace(0, 1, xf); cr_full = cr.copy()
    while len(cr_full) < N:   # loop with short crossfades so the seams don't dip or click
        cr_full = np.concatenate([cr_full[:-xf], cr_full[-xf:] * (1 - ramp) + cr[:xf] * ramp, cr[xf:]])
    cr_full = cr_full[:N]
    beds += cr_full * automation([(0, 0), (4.5, 0), (5.2, .1), (7.2, .12), (7.4, .26), (8.8, .24), (8.95, .08), (10.4, .1), (10.6, .2), (12.6, .22), (12.9, 0),
                                  (33.3, 0), (33.8, .06), (35.7, .06), (35.9, .14), (37.6, .14), (37.9, 0), (42.1, 0)])
# shot 6: the watchman's big lazy yawn
voc('yawn_3', 8.96, -13, ss=.04, dur=1.05, lp=2400, bass=6, pitch=.94, fi=.05, fo=.25)
# shot 9: the dog's low growl before it barks
voc('dgrowl_3', 13.5, -11, dur=.7, lp=2600, bass=7, fi=.06, fo=.12)
# 17.05 blink: a muffled heartbeat thud in the dark, then you gasp awake on WAKE
place(hits, heartbeat(-13), 17.06)
voc('gasp_1', 17.2, -15, dur=.5, lp=2600, bass=4, fi=.01, fo=.15)
# 18.3 running out of the house
def footfall(gain_db=-14):
    """one heavy step on packed earth / boards: a short sub knock plus a dull low-passed scuff"""
    n = int(.22 * SR); tt = np.arange(n) / SR
    nz = lowpass_fft(rng.standard_normal(n), 500); nz /= np.abs(nz).max()
    knock = np.sin(2 * np.pi * np.cumsum(np.linspace(95, 45, n)) / SR) * np.exp(-tt / .045)
    return (knock + .35 * nz * np.exp(-tt / .03)) * 10 ** (gain_db / 20)
for i, tb in enumerate((18.30, 18.47, 18.63, 18.79, 18.95)):
    place(hits, footfall(-13 - 1.5 * i), tb)
# 22.5 the raider's greedy chuckle over the silver
voc('chuckle_1', 22.6, -12, ss=.1, dur=1.1, lp=2600, bass=7, pitch=.86, fi=.02, fo=.2)
# 24.9 smoke: a low swell under the cut
place(hits, whoomph(.8, 80, 34, .18, -16), 24.82)
# 29.4 the berserker laughs off the arrow
voc('laugh_1', 29.42, -11, dur=1.2, lp=2600, bass=7, pitch=.9, fi=.02, fo=.3)
# 35.8 burn-through to your burning home
place(hits, whoomph(1.1, 110, 34, .16, -11), 35.70)

# ---------------------------------------------------------------- duck beds under the voice
vo = load(os.path.join(P, 'audio', 'vo_tight.wav'), norm=True)
vo = np.concatenate([vo, np.zeros(max(0, N - len(vo)))])[:N]
fr = SR // 100
env = np.array([np.abs(vo[i:i + fr]).mean() for i in range(0, N, fr)])
gate = np.clip(env / .03, 0, 1)
sm = np.zeros_like(gate); a = 0.0
for i, g in enumerate(gate):
    a = a + (g - a) * (.5 if g > a else .04)   # fast attack, ~250 ms release
    sm[i] = a
duck_beds = 1 - .55 * np.interp(np.arange(N) / fr, np.arange(len(sm)), sm)
duck_hits = 1 - .25 * np.interp(np.arange(N) / fr, np.arange(len(sm)), sm)
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
# loudness check: voice vs SFX (RMS while the voice speaks)
speak = np.interp(np.arange(N) / fr, np.arange(len(gate)), gate) > .5
rv = np.sqrt(np.mean(vo[speak] ** 2)); rs = np.sqrt(np.mean(((beds * duck_beds + hits * duck_hits) * .9)[speak] ** 2))
print(f'voice-over-sfx while speaking: {20 * np.log10(rv * .9 / rs):.1f} dB;  sfx alone in gaps: {20 * np.log10(np.sqrt(np.mean(sfx[~speak] ** 2)) + 1e-9):.1f} dBFS')
