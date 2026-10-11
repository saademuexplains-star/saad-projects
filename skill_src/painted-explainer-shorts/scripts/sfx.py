#!/usr/bin/env python3
"""Synthesize a sound-effects track from a cue list, aligned to the voiceover.

    python sfx.py cues.json out.wav

cues.json: {"duration": 5.45, "cues": [{"type": "whoosh", "t": 0.0, "d": 0.4, ...}, ...]}
Types: whoosh (d, gain, rise), pop (f, gain), pops (n, every, f, step, gain), thump (gain, f0),
sparkle (gain), swell (d, gain), riser (d, gain), tick (gain).
Keep SFX under the voice: they are mixed at 0.55 volume by render_video.cjs. Needs numpy.
"""
import json, sys, wave
import numpy as np

SR = 44100
spec = json.load(open(sys.argv[1]))
out = np.zeros(int(SR * spec["duration"]))
rng = np.random.default_rng(3)


def add(t0, sig):
    i = int(t0 * SR)
    if i >= len(out):
        return
    n = min(len(sig), len(out) - i)
    out[i:i + n] += sig[:n]


def lowpass(x, k):
    return np.convolve(x, np.ones(k) / k, mode="same")


def whoosh(t, d=.25, gain=.35, rise=True, **_):
    n = int(d * SR); tt = np.linspace(0, 1, n); nz = rng.standard_normal(n)
    lo, hi = lowpass(nz, 60), nz - lowpass(nz, 6)
    mixp = tt if rise else 1 - tt
    add(t, gain * np.sin(np.pi * tt) ** 2 * (lo * 3 * (1 - mixp) + hi * .5 * mixp))


def pop(t, f=900, gain=.22, **_):
    n = int(.07 * SR); tt = np.arange(n) / SR
    add(t, gain * np.sin(2 * np.pi * np.cumsum(np.linspace(f, f * .45, n)) / SR) * np.exp(-tt / .018))


def pops(t, n=10, every=.1, f=700, step=60, gain=.22, **_):
    for i in range(n):
        pop(t + i * every, f + i * step, gain)


def thump(t, gain=.6, f0=95, **_):
    n = int(.35 * SR); tt = np.arange(n) / SR
    body = np.sin(2 * np.pi * np.cumsum(np.linspace(f0, 38, n)) / SR) * np.exp(-tt / .09)
    add(t, gain * (body + rng.standard_normal(n) * np.exp(-tt / .006) * .4))


def sparkle(t, gain=.12, **_):
    for k, f in enumerate([1760, 2350, 2960, 3520]):
        n = int(.35 * SR); tt = np.arange(n) / SR
        add(t + k * .045, gain * np.sin(2 * np.pi * f * tt) * np.exp(-tt / .09))


def swell(t, d=.9, gain=.25, **_):
    n = int(d * SR); tt = np.arange(n) / SR
    add(t, gain * np.sin(np.pi * tt / d) ** 2 * (np.sin(2 * np.pi * 70 * tt) + .5 * np.sin(2 * np.pi * 105 * tt)))


def riser(t, d=.6, gain=.2, **_):
    n = int(d * SR); tt = np.linspace(0, 1, n)
    add(t, gain * tt ** 2 * np.sin(2 * np.pi * np.cumsum(200 + 900 * tt ** 2) / SR))


def tick(t, gain=.2, **_):
    n = int(.02 * SR); tt = np.arange(n) / SR
    add(t, gain * rng.standard_normal(n) * np.exp(-tt / .003))


FX = dict(whoosh=whoosh, pop=pop, pops=pops, thump=thump, sparkle=sparkle, swell=swell, riser=riser, tick=tick)
for c in spec["cues"]:
    c = dict(c); kind = c.pop("type"); c.pop("note", None)
    FX[kind](**c)

out = np.tanh(out * 1.2) * .8
fade = int(.08 * SR); out[-fade:] *= np.linspace(1, 0, fade)
pcm = (np.stack([out, out], 1) * 32767).astype(np.int16)
with wave.open(sys.argv[2], "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print(f"wrote {sys.argv[2]} ({len(spec['cues'])} cues, {spec['duration']} s)")
