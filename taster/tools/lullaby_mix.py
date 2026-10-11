#!/usr/bin/env python3
"""Sound for "The Lullaby": the voiceover, the hummed lullaby (Elsbeth's cracked voice, then her husband's low hum) on
the same melody that drives the animation, and bassy, low effects. Everything that runs across the loop seam is
generated so that 44.0 s flows into 0 s without a click.   lullaby_mix.py <project dir>"""
import sys, subprocess, wave, os, json
import numpy as np
P = sys.argv[1]
RAW = os.path.join(P, '..', 'spartan2', 'sfx_raw')
SR = 48000
DUR = 44.0
N = int(DUR * SR)
rng = np.random.default_rng(23)
T = np.arange(N) / SR


def load(name, ss=0.0, dur=None, af='', gain_db=0.0, norm=True):
    cmd = ['ffmpeg', '-v', 'error', '-ss', str(ss)]
    if dur: cmd += ['-t', str(dur)]
    src = name if name.endswith('.wav') or name.endswith('.mp3') and os.path.sep in name else os.path.join(RAW, name + '.mp3')
    cmd += ['-i', src, '-ac', '1', '-ar', str(SR)]
    if af: cmd += ['-af', af]
    cmd += ['-f', 'f32le', '-']
    x = np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32).astype(np.float64)
    if norm and np.abs(x).max() > 0: x = x / np.abs(x).max()
    return x * 10 ** (gain_db / 20)


def fade(x, fi=0.01, fo=0.05):
    x = x.copy(); n = len(x); a = min(n, int(fi * SR)); b = min(n, int(fo * SR))
    if a: x[:a] *= np.linspace(0, 1, a)
    if b: x[n - b:] *= np.linspace(1, 0, b)
    return x


def place(bus, x, t0):
    i = int(round(t0 * SR))
    if i >= N: return
    if i < 0: x = x[-i:]; i = 0
    n = min(len(x), N - i)
    bus[i:i + n] += x[:n]


def band_fft(x, lo=None, hi=None, order=4):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR) + 1e-9
    if hi: X *= 1 / (1 + (f / hi) ** order)
    if lo: X *= 1 / (1 + (lo / f) ** order)
    return np.fft.irfft(X, len(x))


def periodic_noise(n, lo=None, hi=None, color=0):
    """noise shaped in the frequency domain → exactly periodic over n samples (loops without a seam)"""
    X = (rng.standard_normal(n // 2 + 1) + 1j * rng.standard_normal(n // 2 + 1))
    f = np.fft.rfftfreq(n, 1 / SR) + 1e-3
    X *= f ** (-color / 2)
    if hi: X *= 1 / (1 + (f / hi) ** 4)
    if lo: X *= 1 / (1 + (lo / f) ** 4)
    x = np.fft.irfft(X, n); return x / (np.abs(x).max() + 1e-9)


def env_keys(keys, n=N, t0=0.0):
    t = t0 + np.arange(n) / SR; k = np.array(keys, float)
    return np.interp(t, k[:, 0], k[:, 1])


def thump(f0=70, f1=34, dur=.6, decay=.18, gain_db=-8):
    t = np.arange(int(dur * SR)) / SR
    f = f1 + (f0 - f1) * np.exp(-t / .05)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / decay)
    return fade(x, .002, .05) * 10 ** (gain_db / 20)


def whoomph(dur=.8, f0=70, f1=260, gain_db=-12):
    n = int(dur * SR); x = rng.standard_normal(n); t = np.arange(n) / SR
    y = np.zeros(n); fc = f0 + (f1 - f0) * (t / dur) ** 1.5; a = np.exp(-2 * np.pi * fc / SR)
    for i in range(1, n): y[i] = a[i] * y[i - 1] + (1 - a[i]) * x[i]
    y = y / (np.abs(y).max() + 1e-9) * np.sin(np.pi * t / dur) ** 1.4
    return y * 10 ** (gain_db / 20)


# ---------- the singing voice: additive harmonics through soft formants, vibrato, breath, rasp ----------
MEL = json.load(open(os.path.join(P, 'audio', 'melody.json')))


def note_events(m0, m1):
    """melody notes overlapping verse time [m0, m1] → [(m_start, m_end, midi)] (verse repeats)"""
    B = MEL['beat']; out = []; m = 0.0; verse = sum(n[1] for n in MEL['notes']) * B; base = np.floor(m0 / verse) * verse
    while base < m1:
        m = base
        for midi, beats in MEL['notes']:
            a, b = m, m + beats * B
            if b > m0 and a < m1: out.append((max(a, m0), min(b, m1), midi, a))
            m = b
        base += verse
    return out


def sing(m0, m1, *, octave=0, formants, tilt=1.3, breath=.18, rough=.0, vib=(5.2, .011), crack=None, gap=.06, lp=3800):
    """synthesise verse time [m0, m1] (seconds into the melody); crack = (m, dur): the voice breaks there"""
    n = int((m1 - m0) * SR); t = np.arange(n) / SR; m = m0 + t
    ev = note_events(m0, m1)
    f_t = np.zeros(n); amp = np.zeros(n)
    for a, b, midi, a_true in ev:
        i0, i1 = int((a - m0) * SR), int((b - m0) * SR)
        f_t[i0:i1] = 440 * 2 ** ((midi - 69 + 12 * octave) / 12)
        u = (m[i0:i1] - a_true); L = b - a_true if b - a_true > 0 else 1
        e = np.minimum(1, u / .07) * (1 - .25 * np.clip((u - .1) / max(L, .2), 0, 1))
        e *= 1 - np.clip((u - (L - gap)) / gap, 0, 1) * .6          # a little lift between notes (legato, not detached)
        amp[i0:i1] = e
    # glide between notes (portamento ~45 ms on log-pitch), vibrato that blooms in each note, slow jitter
    lf = np.log(np.maximum(f_t, 20)); a = np.exp(-1 / (.045 * SR)); y = np.empty(n); y[0] = lf[0]
    for i in range(1, n): y[i] = a * y[i - 1] + (1 - a) * lf[i]
    jit = band_fft(rng.standard_normal(n), hi=3) ; jit = jit / (np.abs(jit).max() + 1e-9) * .006
    f0 = np.exp(y) * (1 + vib[1] * np.sin(2 * np.pi * vib[0] * t) + jit)
    if crack:
        cm, cd = crack; c = np.exp(-((m - cm - cd / 2) / (cd / 2)) ** 4)
        f0 *= 1 + .42 * c * (m < cm + cd * .45); amp *= 1 - .65 * c * (m >= cm + cd * .45)
    ph = 2 * np.pi * np.cumsum(f0) / SR
    def formant_gain(f):
        g = np.zeros_like(f) + .02
        for fc, bw, db in formants: g += 10 ** (db / 20) / (1 + ((f - fc) / bw) ** 2)
        return g
    sig = np.zeros(n)
    for k in range(1, 18):
        fk = k * f0
        sig += np.where(fk < lp, formant_gain(fk) * k ** (-tilt), 0) * np.sin(k * ph)
    if rough: sig *= 1 + rough * np.sin(ph / 2 + 1.3) * (1 + .5 * np.sin(2 * np.pi * .7 * t))
    br = band_fft(rng.standard_normal(n), lo=350, hi=2600) * breath
    sig = sig / (np.abs(sig).max() + 1e-9) + br
    sig = band_fft(sig * amp, hi=lp)
    return sig / (np.abs(sig).max() + 1e-9)


# ---------- buses ----------
vo = load(os.path.join(P, 'audio', 'vo_orig.wav'), norm=False)
VO = np.zeros(N); place(VO, vo, 0.0)
MUS = np.zeros(N); FX = np.zeros(N); AMB = np.zeros(N)

# Elsbeth's song, rendered once as one continuous take from 41.6 s through the loop seam into 13.3 s
els_f = [(420, 110, 0), (880, 160, -5), (2500, 260, -19)]
take = sing(0.0, 15.7, formants=els_f, tilt=1.25, breath=.24, rough=.22, crack=(7.0, .42))
take = fade(take, .25, .02)
a = int((DUR - 41.6) * SR)                                     # 2.4 s that play at the end of the video…
place(MUS, take[:a] * env_keys([(0, 0), (.6, 1), (10, 1)], a), 41.6)
tail = take[a:]                                                # …and carry straight on at 0 s
tail = tail * env_keys([(0, 1), (13.12, 1), (13.28, 0), (20, 0)], len(tail))
place(MUS, tail, 0.0)
# the fever: she opens her mouth and only a breathy rasp comes
rasp = band_fft(rng.standard_normal(int(1.1 * SR)), lo=220, hi=1100) * np.sin(np.pi * np.linspace(0, 1, int(1.1 * SR))) ** 2
place(MUS, rasp / np.abs(rasp).max() * .35, 15.35)
# his hum: an octave down, lips closed
hus_f = [(255, 70, 0), (520, 120, -12), (1100, 220, -26)]
hum = sing(0.0, 2.95, octave=-1, formants=hus_f, tilt=1.7, breath=.04, rough=0, vib=(4.6, .007), lp=1600)
place(MUS, fade(hum, .2, .18) * .9, 20.4)
# a muffled "mm—" under her hand
mm = sing(0.0, .22, octave=-1, formants=hus_f, tilt=1.8, breath=.05, lp=700)
place(MUS, fade(mm, .01, .06) * .7, 35.94)

# ---------- room and weather (periodic, so the loop is seamless) ----------
room = periodic_noise(N, hi=140, color=1) * .5 + periodic_noise(N, lo=40, hi=90) * .3
quiet = env_keys([(0, 1), (23.3, 1), (23.55, .03), (24.7, .03), (26.6, 1), (44, 1)])
AMB += room * quiet * 10 ** (-30 / 20)
wind = periodic_noise(N, lo=60, hi=420, color=.5); wind_mod = .6 + .4 * np.sin(2 * np.pi * T * 3 / DUR) ** 2
AMB += wind * wind_mod * quiet * env_keys([(0, .18), (13.2, .18), (13.4, 1), (14.4, 1), (14.5, .18), (44, .18)]) * 10 ** (-24 / 20)

# ---------- effects (all low) ----------
def creak(t0, pitch=.62, dur=1.2, gain=-12, which='v_creak_1', ss=.3, hi=1200):
    x = load(which, ss=ss, dur=dur / pitch, af=f'asetrate={int(44100 * pitch)},aresample={SR},lowpass=f={hi},highpass=f=45')
    place(FX, fade(x, .02, .2) * 10 ** (gain / 20), t0)

place(FX, thump(64, 30, 1.0, .35, -14), 13.31)                 # the cut to the snow
for i, ts in enumerate((18.5, 18.77, 19.04)):                  # his boots on the boards
    place(FX, thump(95, 48, .3, .07, -17 - i), ts); creak(ts + .02, pitch=.7, dur=.25, gain=-27, ss=1.0 + i * .4)
creak(19.33, pitch=.58, dur=.7, gain=-14, which='v_creak_2', ss=.5); place(FX, thump(80, 40, .5, .12, -16), 19.36)   # he sits
# the children's breath, then the two of them breathing as one (slow, deep)
def breath(t0, dur, gain, pitch=.8):
    x = load('breath_1', ss=.2, dur=dur / pitch, af=f'asetrate={int(44100 * pitch)},aresample={SR},lowpass=f=1400,highpass=f=80')
    place(FX, fade(x, .15, .3) * 10 ** (gain / 20), t0)
breath(24.75, 1.3, -24, .9); breath(25.3, 1.2, -26, .85)
breath(25.72, 2.4, -17, .62); breath(25.74, 2.4, -19, .6)
# under the bed: a board gives; something turns over
creak(27.35, pitch=.5, dur=1.1, gain=-17, which='v_creak_2', ss=1.6)
creak(28.22, pitch=.42, dur=1.6, gain=-9, which='v_creak_1', ss=2.2, hi=900)
place(FX, thump(46, 26, 1.6, .6, -10), 28.25)
q = np.clip((T - 29.2) / 3.0, 0, 1); swell = np.sin(np.pi * q) ** 1.5 * (T > 29.2) * (T < 32.3)
FX += (periodic_noise(N, hi=70, color=1) * 1.0 + np.sin(2 * np.pi * 31 * T) * .5) * swell * 10 ** (-6 / 20)
for ts, pch, g, w in ((29.6, .38, -9, 'v_creak_2'), (30.35, .34, -8, 'v_creak_1'), (31.05, .4, -11, 'v_creak_2'), (31.7, .46, -15, 'v_creak_1')):
    creak(ts, pitch=pch, dur=1.4, gain=g, which=w, ss=.8, hi=800)
# she wrenches herself up — a low rush of air and the bed
place(FX, whoomph(.85, 60, 240, -10), 33.12); creak(33.2, pitch=.6, dur=.6, gain=-16, which='v_creak_2', ss=.2)
place(FX, thump(58, 30, 1.2, .45, -15), 34.4)                   # cut to her white face
# the clamp: a hand slammed over a mouth
place(FX, thump(72, 36, .55, .1, -9), 35.97)
# her heart, then his
for k in range(6):
    tb = 36.35 + k * .78
    place(FX, thump(60, 34, .35, .08, -15 + k * .6), tb); place(FX, thump(52, 30, .35, .08, -19 + k * .6), tb + .22)
# the children again, breathing as one, as the camera sinks down the side of the bed into the dark beneath it
breath(39.02, 1.9, -20, .6); breath(39.04, 1.9, -22, .58)
q2 = np.clip((T - 39.35) / .8, 0, 1) * (T < 40.2)
FX += periodic_noise(N, hi=60, color=1) * q2 ** 2 * 10 ** (-12 / 20)
place(FX, thump(42, 24, 1.8, .7, -9), 40.17)                    # down into the dark
# the thing beneath: one enormous slow breath, its dream settling as her song comes down to it
gr = load('v_growl_1', ss=.0, dur=4.0 / .45, af=f'asetrate={int(44100 * .45)},aresample={SR},lowpass=f=380,highpass=f=30')
gr = gr * env_keys([(0, 0), (.6, .8), (1.6, 1), (2.6, .6), (3.6, .2), (4.0, 0)], len(gr))
place(FX, gr * 10 ** (-8 / 20), 40.3)
inh = periodic_noise(int(3.0 * SR), lo=40, hi=200, color=.5) * np.sin(np.pi * np.linspace(0, 1, int(3.0 * SR))) ** 2
place(FX, inh * 10 ** (-10 / 20), 40.4)

# ---------- mix ----------
speak = np.abs(VO) > .02
sp_env = band_fft(speak.astype(float), hi=4)                    # smooth "voice present" curve
duck = 1 - .35 * np.clip(sp_env, 0, 1)
music = MUS * 10 ** (-19 / 20) * (1 - .45 * np.clip(sp_env, 0, 1))
mix = VO * 1.0 + music + FX * duck + AMB
peak = np.abs(mix).max(); mix = mix / peak * .9
st = np.stack([mix, mix], 1)
# a touch of width on the ambience / song only (VO stays centred)
side = band_fft(np.roll(music + AMB, int(.012 * SR)), lo=150) * .25 / peak * .9
st[:, 0] += side; st[:, 1] -= side
st = np.clip(st, -1, 1)
def write(path, x):
    with wave.open(path, 'wb') as w:
        w.setnchannels(2 if x.ndim == 2 else 1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())
write(os.path.join(P, 'audio', 'mix.wav'), st)
fx_only = (music + FX * duck + AMB); write(os.path.join(P, 'audio', 'sfx.wav'), np.stack([fx_only, fx_only], 1) / (np.abs(fx_only).max() + 1e-9) * .89)
print(f'peak {peak:.2f}; seam step {abs(st[-1, 0] - st[0, 0]):.4f}')
