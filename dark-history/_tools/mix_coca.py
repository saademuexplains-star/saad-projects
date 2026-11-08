#!/usr/bin/env python3
"""Coca-Cola mix (Linux port of the mix_*.ps1 + arrangement pattern).

VO + one-shot SFX (each placed by the time of its loudest moment) + ambience beds (looped, crossfaded) + music,
48 kHz stereo, every stem exactly the video length (2840 frames at 60 fps). The music ducks under the voice
(-8 dB), the ambiences less (-5 dB), the SFX a little (-2.5 dB). The loop seam: the battle ambience that opens the
film is faded in under the last 0.6 s, and every other bed fades out by the last frame, so the end runs into frame 0.

  python3 -I _tools/mix_coca.py <music mode: full | cues | none> <out dir>

Writes coca_voiceover.wav, coca_sfx.wav, coca_music.wav, coca_mix.wav and prints the speech-band check.
"""
import sys, os, wave
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
FRAMES, FPS = 2840, 60
N = int(round(FRAMES / FPS * SR))
DUR = N / SR
SFX = os.path.join(ROOT, '_sfx18', 'wav')


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


def build(music_mode):
    vo = read(os.path.join(ROOT, '_vo18', 'vo_tight.wav'))
    VO = np.zeros((N, 2), np.float32); VO[: min(N, len(vo))] = vo[:N]
    # the voice up front: +5 dB, its peaks held under -1.5 dBFS by a smooth limiter (the take's median speech level
    # was -25 dBFS, too low to sit over the effects)
    VO = limit(VO * db(5.0), db(-1.5))
    S = np.zeros((N, 2), np.float32)    # one-shots
    A = np.zeros((N, 2), np.float32)    # ambience beds
    M = np.zeros((N, 2), np.float32)    # music

    # ---------------- ambiences (one per place); the battle bed also fades in under the last 0.6 s for the loop
    bed(A, 'wa_battle', 0.0, 7.63, -6, xin=0.0, xout=0.5)
    bed(A, 'wa_battle', DUR - 0.6, DUR, -6, xin=0.0, xout=0.0, off=0.0)
    bed(A, 'wa_room', 7.63, 9.85, -9, xin=0.5, xout=0.4)
    bed(A, 'wa_street', 9.8, 11.4, -7, xin=0.4, xout=0.35)
    bed(A, 'wa_room', 11.32, 28.2, -9, xin=0.35, xout=0.3, off=2.0)
    bed(A, 'wa_room', 28.2, 29.6, -13, xin=0.1, xout=0.3, off=5.0)
    bed(A, 'wa_fount', 31.62, 35.45, -9, xin=0.4, xout=0.4)
    bed(A, 'wa_room', 35.4, 43.1, -12, xin=0.4, xout=0.5, off=1.0)

    # ---------------- one-shots: actions, vocals, transitions (deep hits and risers, no thin whooshes)
    E = [
        # SLASH
        ('ws_sabre', 0.62, -3), ('ws_hit', 0.64, -5), ('ws_boom', 0.66, -9), ('ws_cry', 0.70, -4),
        ('ws_whoosh', 1.98, -6), ('ws_fall', 2.08, -3),
        # BATTLE
        ('ws_groan', 2.6, -10), ('ws_bottle', 3.85, -7), ('ws_heart', 4.5, -2), ('ws_bottle', 4.96, -9),
        ('ws_relief', 5.35, -5), ('ws_heart', 6.9, -8), ('ws_riser', 7.66, -10), ('ws_hit', 7.66, -8),
        # ROOM1 / STREET
        ('ws_whoosh', 9.8, -7), ('ws_doorbell', 11.36, -8), ('ws_hit', 11.34, -10),
        # ROOM2
        ('ws_pestle', 11.4, -9, 'start'), ('ws_heart', 13.12, -6), ('ws_scratch', 13.5, -12, 'start'),
        ('ws_pestle', 14.85, -9, 'start'), ('ws_pestle', 15.95, -10, 'start'), ('ws_flask', 15.0, -14, 'start'),
        ('ws_riser', 18.8, -10), ('ws_leaves', 18.95, -4),
        # MACRO
        ('ws_leaves', 19.55, -7), ('ws_vial', 20.82, -3), ('ws_boom', 20.86, -10), ('ws_crack', 22.4, -2),
        ('ws_pour', 23.3, -4, 'start'), ('ws_whoosh', 23.45, -8),
        # WINE
        ('ws_stir', 24.55, -8, 'start'), ('ws_stir', 26.0, -10, 'start'), ('ws_hit', 27.32, -9), ('ws_paperfly', 28.12, -3),
        # BAN
        ('ws_slap', 28.43, -1), ('ws_boom', 28.45, -7), ('ws_whoosh', 29.55, -7),
        # SYRUP
        ('ws_kettle', 29.5, -6, 'start'), ('ws_kettle', 30.7, -7, 'start'), ('ws_riser', 31.64, -10),
        # FOUNT
        ('ws_soda', 31.45, -4, 'start'), ('ws_fizz', 32.4, -8, 'start'), ('ws_glass', 33.42, -4), ('ws_coin', 34.4, -3),
        ('ws_whoosh', 35.38, -6), ('ws_hit', 35.42, -9),
        # ROOM3: the score drops away; the last heartbeats, the lamp, the calendar, the pen, the bubbles, the dive
        ('ws_heart', 35.75, -4), ('ws_heart', 36.66, -2), ('ws_lampout', 37.0, -4), ('ws_calendar', 37.3, -5, 'start'),
        ('ws_sign', 39.7, -9, 'start'), ('ws_fizz', 41.4, -9, 'start'), ('ws_riser', 43.1, -9), ('ws_dive', 43.12, -3),
        # MAP / NAME
        ('ws_shimmer', 43.6, -9, 'start'), ('ws_shimmer', 44.7, -8, 'start'), ('ws_whoosh', 45.9, -7),
        ('ws_final', 46.56, -2), ('ws_fizz', 46.95, -12, 'start'), ('ws_whoosh', 47.08, -9),
    ]
    for e in E:
        name, t, g = e[0], e[1], e[2]
        shot(S, name, t, g, at=e[3] if len(e) > 3 else 'peak')

    # ---------------- music
    if music_mode == 'full':
        m = read(os.path.join(ROOT, '_sfx18', 'wav', 'score_main.wav'))
        mm = np.zeros((N, 2), np.float32); mm[: min(N, len(m))] = m[:N]
        M += fade(mm, 0.03, 0.35) * db(-4)
    elif music_mode == 'cues':
        cue = lambda n, t0, t1, g, xin=0.3, xout=0.5, off=0.0: bed(M, n, t0, t1, g, xin, xout, off)
        cue('cue_war', 0.0, 7.63, -6, xin=0.0, xout=0.6)
        cue('cue_parlour', 7.63, 28.15, -7, xin=0.4, xout=0.5)
        cue('cue_build', 28.15, 35.3, -6, xin=0.3, xout=0.25)
        cue('cue_lament', 36.2, 43.1, -6, xin=0.5, xout=0.4)
        cue('cue_swell', 43.1, DUR, -4, xin=0.3, xout=0.35)
        cue('cue_war', DUR - 0.5, DUR, -6, xin=0.0, xout=0.0)

    # ---------------- ducking under the voice
    e = env_follow(VO)
    M *= (1 - (1 - db(-9)) * e)[:, None]
    A *= (1 - (1 - db(-9)) * e)[:, None]
    S *= (1 - (1 - db(-7)) * e)[:, None]
    A *= db(-6); S *= db(-7)
    SFXS = S + A
    # the last frame runs into the first: nothing but the battle bed (and the voice's silence) at the seam
    mix = VO * db(0) + SFXS + M
    pk = np.abs(mix).max()
    if pk > 0.97:
        k = 0.97 / pk; mix *= k; SFXS *= k; M *= k; VO *= k
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
    mode = sys.argv[1] if len(sys.argv) > 1 else 'none'
    out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(ROOT, '_sfx18', 'mix')
    os.makedirs(out, exist_ok=True)
    VO, SF, MU, MIX = build(mode)
    write(os.path.join(out, 'coca_voiceover.wav'), VO)
    write(os.path.join(out, 'coca_sfx.wav'), SF)
    write(os.path.join(out, 'coca_music.wav'), MU)
    write(os.path.join(out, 'coca_mix.wav'), MIX)
    fl = speechband(VO, SF + MU)
    print('samples', N, 'seconds', round(DUR, 4), 'peak', round(float(np.abs(MIX).max()), 3))
    print('speech-band flags', len(fl), fl[:20])
