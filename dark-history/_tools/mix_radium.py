#!/usr/bin/env python3
"""The Radium Girls mix: VO + one-shot SFX (each placed by the time of its loudest moment, or its start) + ambience
beds (looped, crossfaded), 48 kHz stereo, every stem exactly the video length (2829 frames at 60 fps). The shots are
timed to the voice itself (_vo19/vo_trim.wav, pauses capped at 0.2 s): no time warp. The ambiences duck under the
voice (-9 dB), the SFX a little less (-7 dB). The loop seam: the studio bed of frame 0 fades in under the last 0.5 s.
No music (the user decides on music credits); a music stem of silence is written so the stems stay three.

  python3 -I _tools/mix_radium.py <out dir>

Writes radium_voiceover.wav, radium_sfx.wav, radium_music.wav, radium_mix.wav and prints the speech-band check.
"""
import sys, os, wave
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
FRAMES, FPS = 2829, 60
N = int(round(FRAMES / FPS * SR))
DUR = N / SR
SFX = os.path.join(ROOT, '_sfx19', 'wav')


def read(path):
    with wave.open(path, 'rb') as w:
        ch, sw, sr, n = w.getnchannels(), w.getsampwidth(), w.getframerate(), w.getnframes()
        raw = w.readframes(n)
    assert sr == SR and sw == 2, (path, sr, sw)
    x = np.frombuffer(raw, dtype='<i2').astype(np.float32) / 32768.0
    x = x.reshape(-1, ch)
    if ch == 1:
        x = np.repeat(x, 2, axis=1)
    return x


def write(path, x):
    y = np.clip(x, -1.0, 1.0)
    y = (y * 32767.0).astype('<i2')
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(y.tobytes())


def db(v):
    return 10.0 ** (v / 20.0)


def fade(x, a, b):
    """fade in over a seconds, out over b seconds (raised cosine)"""
    n = len(x)
    na, nb = min(n, int(a * SR)), min(n, int(b * SR))
    if na > 1:
        x[:na] *= (0.5 - 0.5 * np.cos(np.linspace(0, np.pi, na)))[:, None]
    if nb > 1:
        x[n - nb:] *= (0.5 + 0.5 * np.cos(np.linspace(0, np.pi, nb)))[:, None]
    return x


def peak_t(x):
    """time (s) of the clip's loudest 20 ms"""
    w = int(0.02 * SR)
    m = np.abs(x).mean(axis=1)
    if len(m) < w:
        return 0.0
    c = np.convolve(m, np.ones(w) / w, mode='valid')
    return (int(np.argmax(c)) + w // 2) / SR


def add(buf, clip, t0):
    i0 = int(round(t0 * SR))
    a, b = max(0, i0), min(N, i0 + len(clip))
    if b > a:
        buf[a:b] += clip[a - i0:b - i0]


CACHE = {}


def clip(name):
    """a clip, levelled: beds (wa_*, cue_*) to -24 dBFS RMS, one-shots to a -3 dBFS peak, so the arrangement's gains
    are relative to a common reference (ElevenLabs returns them at very different levels)"""
    if name not in CACHE:
        x = read(os.path.join(SFX, name + '.wav'))
        if name.startswith('wa_') or name.startswith('cue_'):
            r = np.sqrt((x ** 2).mean() + 1e-12); x = x * (db(-24) / r)
        else:
            pk = np.abs(x).max() + 1e-9; x = x * (db(-3) / pk)
        CACHE[name] = x.astype(np.float32)
    return CACHE[name].copy()


def shot(buf, name, t, g=0.0, at='peak', a=0.004, b=0.04, cut=None):
    """place a one-shot: its loudest moment (at='peak') or its start (at='start') on time t"""
    c = clip(name)
    if cut:
        c = c[:int(cut * SR)]
    c = fade(c, a, b) * db(g)
    add(buf, c, t - (peak_t(c) if at == 'peak' else 0.0))


def bed(buf, name, t0, t1, g=0.0, xin=0.35, xout=0.35, off=0.0):
    """a looped bed from t0 to t1, faded in/out; the loop seams crossfaded inside the clip"""
    c = clip(name)
    L = len(c); xf = int(0.5 * SR)
    # make a seamless loop: crossfade the tail into the head
    body = c[:L - xf].copy()
    ramp = np.linspace(0, 1, xf)[:, None]
    body[:xf] = c[:xf] * ramp + c[L - xf:] * (1 - ramp)
    need = int((t1 - t0 + xin + xout) * SR) + 1
    o = int(off * SR) % len(body)
    reps = (need + o) // len(body) + 2
    lp = np.tile(body, (reps, 1))[o:o + need]
    lp = fade(lp, xin, xout) * db(g)
    add(buf, lp, t0 - xin)


def limit(x, ceil):
    """a smooth peak limiter: instant attack (computed on a 2 ms look-ahead max), 60 ms release"""
    a = np.abs(x).max(axis=1)
    la = int(0.002 * SR)
    pk = np.maximum.accumulate(np.lib.stride_tricks.sliding_window_view(np.pad(a, (0, la)), la + 1).max(axis=1)[::-1])[::-1] if False else None
    w = la + 1
    pad = np.pad(a, (0, w))
    mx = np.array([pad[i:i + w].max() for i in range(0, len(a), 1)]) if len(a) < 20000 else None
    if mx is None:
        # block maximum (cheap and safe): 2 ms blocks, held one block early
        blk = la
        nb = (len(a) + blk - 1) // blk
        bm = np.zeros(nb, np.float32)
        for i in range(nb):
            bm[i] = a[i * blk:(i + 1) * blk].max()
        bm = np.maximum(bm, np.concatenate([bm[1:], bm[-1:]]))
        mx = np.repeat(bm, blk)[: len(a)]
    g = np.minimum(1.0, ceil / np.maximum(mx, 1e-9))
    # release: the gain recovers no faster than 60 ms; attack is immediate
    kr = np.exp(-1.0 / (0.06 * SR))
    out = np.empty_like(g); v = 1.0
    for i in range(len(g)):
        v = g[i] if g[i] < v else kr * v + (1 - kr) * g[i]
        out[i] = v
    return x * out[:, None]


def env_follow(x, att=0.03, rel=0.25):
    """a smoothed level (0..1) of the voice, for ducking"""
    m = np.abs(x).mean(axis=1)
    hop = int(0.005 * SR)
    m = m[: len(m) // hop * hop].reshape(-1, hop).max(axis=1)
    e = np.zeros_like(m); v = 0.0
    ka, kr = np.exp(-0.005 / att), np.exp(-0.005 / rel)
    for i, s in enumerate(m):
        v = ka * v + (1 - ka) * s if s > v else kr * v + (1 - kr) * s
        e[i] = v
    e = e / (np.percentile(e, 95) + 1e-9)
    e = np.clip(e, 0, 1)
    e = np.repeat(e, hop)
    if len(e) < len(x):
        e = np.pad(e, (0, len(x) - len(e)), mode='edge')
    return e[: len(x)]


def build():
    vo = read(os.path.join(ROOT, '_vo19', 'vo_trim.wav'))
    VO = np.zeros((N, 2), np.float32); VO[: min(N, len(vo))] = vo[:N]
    # the voice up front, its peaks held under -1.5 dBFS by a smooth limiter; the gain set from the take's speech level
    act = np.abs(VO).mean(axis=1) > 0.01
    rms = np.sqrt((VO[act] ** 2).mean()) if act.any() else 0.05
    g = db(-17) / (rms + 1e-9)
    VO = limit(VO * g, db(-1.5))
    S = np.zeros((N, 2), np.float32)    # one-shots
    A = np.zeros((N, 2), np.float32)    # ambience beds

    # ---------------- ambiences (one per place)
    bed(A, 'wa_studio', 0.0, 14.66, -8, xin=0.0, xout=0.2)
    bed(A, 'wa_dark', 14.62, 16.8, -6, xin=0.15, xout=0.35)
    bed(A, 'wa_studio', 16.8, 18.3, -10, xin=0.35, xout=0.4, off=3.0)
    bed(A, 'wa_dance', 18.1, 19.85, -6, xin=0.4, xout=0.35)
    bed(A, 'wa_room', 19.83, 24.85, -10, xin=0.3, xout=0.4)
    bed(A, 'wa_lab', 24.85, 31.3, -7, xin=0.35, xout=0.35)
    bed(A, 'wa_room', 31.25, 32.72, -11, xin=0.3, xout=0.3, off=2.5)
    bed(A, 'wa_dark', 32.72, 37.72, -12, xin=0.3, xout=0.35, off=1.0)
    bed(A, 'wa_night', 37.72, 41.1, -6, xin=0.3, xout=0.4)
    bed(A, 'wa_dark', 41.08, DUR - 0.5, -8, xin=0.35, xout=0.45, off=2.0)
    # the loop: frame 0's studio bed comes in under the last half second
    bed(A, 'wa_studio', DUR - 0.5, DUR, -8, xin=0.0, xout=0.0, off=0.0)

    # ---------------- one-shots (name, time, gain dB[, 'start'])
    E = [
        # HOOK / MOUTH / STUDIO: the paint's glow on "glowing"
        ('ws_shimmer', 1.72, -8), ('ws_shimmer', 3.8, -15), ('ws_whoosh', 4.33, -10),
        # DIALS: the brush painting the 12
        ('ws_stroke', 6.85, -6), ('ws_stroke', 7.2, -8), ('ws_whoosh', 6.69, -12),
        # LIP / DIP / PAINT / RHYTHM
        ('ws_lip', 9.22, -4), ('ws_whoosh', 9.59, -9), ('ws_dip', 9.76, -3), ('ws_whoosh', 10.09, -9),
        ('ws_stroke', 10.26, -4), ('ws_timelapse', 10.72, -6, 'start'),
        # BOSS: the girls laugh on "eat"
        ('ws_whoosh', 12.04, -8), ('ws_giggle', 14.75, -12),
        # GLOW: the lights off; the nails; the giggles
        ('ws_switch', 14.64, -3), ('ws_shimmer', 15.22, -9), ('ws_giggle', 16.66, -6),
        # DANCE: the dress lights up
        ('ws_shimmer', 18.35, -9),
        # MIRROR: two teeth fall into the bowl
        ('ws_tink', 20.48, -6), ('ws_gasp', 20.93, -14), ('ws_tink', 21.56, -5),
        # DENTIST / PALM: the jaw comes away
        ('ws_whoosh', 21.73, -9), ('ws_crack', 23.1, -7),
        # LAB: the vial out of the lead pot
        ('ws_vial', 27.55, -6, 'start'), ('ws_vial', 28.75, -10),
        # DEATH / CERT / NEWS
        ('ws_flame', 32.3, -9), ('ws_stamp', 34.12, -6), ('ws_paper', 34.86, -11),
        # GRAVE: the spade on "dig", the lid, the glow
        ('ws_spade', 37.86, -10), ('ws_lid', 38.58, -8, 'start'), ('ws_shimmer', 39.3, -10),
        # JAR / END: the title's boom on "Radium Girls"
        ('ws_shimmer', 41.15, -9), ('ws_shimmer', 43.62, -13), ('ws_riser', 45.05, -6),
        # the loop morph into the brush of frame 0
        ('ws_whoosh', DUR - 0.25, -10),
    ]
    for e in E:
        name, t, g = e[0], e[1], e[2]
        shot(S, name, t, g, at=e[3] if len(e) > 3 else 'peak')

    # ---------------- ducking under the voice
    e = env_follow(VO)
    A *= (1 - (1 - db(-9)) * e)[:, None]
    S *= (1 - (1 - db(-7)) * e)[:, None]
    A *= db(-6); S *= db(-7)
    SFXS = S + A
    M = np.zeros((N, 2), np.float32)
    mix = VO + SFXS + M
    pk = np.abs(mix).max()
    if pk > 0.97:
        k = 0.97 / pk; mix *= k; SFXS *= k; VO *= k
    return VO, SFXS, M, mix


def speechband(VO, others):
    """windows (100 ms) where the voice speaks (> -34 dBFS) but the rest comes within 4 dB of it"""
    w = int(0.1 * SR); flags = []
    for i in range(0, N - w, w):
        v = np.sqrt((VO[i:i + w] ** 2).mean() + 1e-12); o = np.sqrt((others[i:i + w] ** 2).mean() + 1e-12)
        vd, od = 20 * np.log10(v), 20 * np.log10(o)
        if vd > -34 and od > vd - 4:
            flags.append((round(i / SR, 2), round(vd, 1), round(od, 1)))
    return flags


if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, '_sfx19', 'mix')
    os.makedirs(out, exist_ok=True)
    VO, SF, MU, MIX = build()
    write(os.path.join(out, 'radium_voiceover.wav'), VO)
    write(os.path.join(out, 'radium_sfx.wav'), SF)
    write(os.path.join(out, 'radium_music.wav'), MU)
    write(os.path.join(out, 'radium_mix.wav'), MIX)
    fl = speechband(VO, SF + MU)
    rms = lambda x: round(20 * np.log10(np.sqrt((x ** 2).mean()) + 1e-12), 1)
    print('samples', N, 'seconds', round(DUR, 4), 'peak', round(float(np.abs(MIX).max()), 3), 'rms vo/sfx/mix', rms(VO), rms(SF), rms(MIX))
    print('speech-band flags', len(fl), fl[:20])
