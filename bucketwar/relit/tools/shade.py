#!/usr/bin/env python3
"""Deferred lighting for painted frames.

    shade.py flat.png normal.png out.png lights.json

flat.png   = albedo pass (painted colours, no baked directional light)
normal.png = per-piece normal map (R = Nx, G = Ny with +y down, B = material: 0 background, 64 cloth, 128 skin)
lights.json: {"lights": [{"pos": [x, y, z], "col": "#rrggbb", "int": 1.0, "rad": 900}], "amb": "#rrggbb",
              "ambInt": .4, "bgLight": .6, "exposure": 1.0, "bloom": .5, ...}
Light positions are in screen pixels; z > 0 is toward the viewer, z < 0 behind the picture plane (a back light
makes rims). Everything is computed in linear light in float, then tone-mapped and graded.
"""
import sys, json
import numpy as np
from PIL import Image

W, H = 1080, 1920


def hexf(h):
    h = h.lstrip('#'); return np.array([int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)], np.float32)


def s2l(x): return np.where(x <= .04045, x / 12.92, ((x + .055) / 1.055) ** 2.4)
def l2s(x): x = np.clip(x, 0, 1); return np.where(x <= .0031308, x * 12.92, 1.055 * x ** (1 / 2.4) - .055)


def box(a, r, axis):
    if r < 1: return a
    c = np.cumsum(a, axis=axis, dtype=np.float32)
    pad = [(0, 0)] * a.ndim; pad[axis] = (r + 1, r)
    c = np.pad(c, pad, mode='edge')
    sl1 = [slice(None)] * a.ndim; sl2 = [slice(None)] * a.ndim
    n = a.shape[axis]
    sl1[axis] = slice(2 * r + 1, 2 * r + 1 + n); sl2[axis] = slice(0, n)
    out = (c[tuple(sl1)] - c[tuple(sl2)]) / (2 * r + 1)
    return out.astype(np.float32)


def blur(a, sigma):
    """gaussian-ish blur: three box passes per axis; large sigmas run on a downsampled copy"""
    if sigma < .5: return a
    f = 1
    while sigma / f > 24: f *= 2
    if f > 1:
        h, w = a.shape[:2]
        small = a[:h - h % f, :w - w % f].reshape(h // f, f, w // f, f, *a.shape[2:]).mean(axis=(1, 3))
        b = blur(small, sigma / f)
        b = np.repeat(np.repeat(b, f, 0), f, 1)
        out = np.empty_like(a); out[:b.shape[0], :b.shape[1]] = b
        out[b.shape[0]:] = b[-1:]; out[:, b.shape[1]:] = out[:, b.shape[1] - 1:b.shape[1]]
        return blur(out, f * .6)
    r = max(1, int(round(sigma * .93)))
    for _ in range(3):
        a = box(a, r, 0); a = box(a, r, 1)
    return a


def smooth(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t)


_S2L = s2l(np.arange(256, dtype=np.float32) / 255).astype(np.float32)
_U8 = (np.arange(256, dtype=np.float32) / 255).astype(np.float32)
_GRID = {}
def grid():
    if 'g' not in _GRID: _GRID['g'] = np.mgrid[0:H, 0:W].astype(np.float32)
    return _GRID['g']


def shade(flat, nrm, cfg):
    alb = _S2L[np.asarray(Image.open(flat).convert('RGB'))]
    n = _U8[np.asarray(Image.open(nrm).convert('RGB'))]
    mat = n[..., 2]
    emis = smooth(.84, .97, mat)                       # emissive pieces (flames, glass, glows): blue = 255
    char = smooth(.13, .24, mat) * (1 - emis)          # character pieces vs background
    skin = smooth(.36, .48, mat) * (1 - emis)
    k = cfg.get('normalStrength', 1.7)
    nx = (n[..., 0] - .5) * 2 * k * char; ny = (n[..., 1] - .5) * 2 * k * char
    inv = 1 / np.sqrt(nx * nx + ny * ny + 1)
    Nx, Ny, Nz = nx * inv, ny * inv, inv

    Y, X = grid()
    light = np.zeros((H, W, 3), np.float32); spec = np.zeros((H, W, 3), np.float32)
    wrap = .1 + .32 * skin
    ks = (.12 + .25 * skin) * char * cfg.get('specScale', 1.0)
    for L in cfg['lights']:
        lx, ly, lz = L['pos']; col = hexf(L['col']) * L.get('int', 1)
        dx, dy, dz = lx - X, ly - Y, lz * np.ones_like(X)
        d = np.sqrt(dx * dx + dy * dy + dz * dz) + 1e-3
        Lx, Ly, Lz = dx / d, dy / d, dz / d
        ndl = Nx * Lx + Ny * Ly + Nz * Lz
        dif = np.clip((ndl + wrap) / (1 + wrap), 0, 1)
        # background (flat wall) gets the light's falloff with a softer angular term
        dif = dif * char + (1 - char) * np.clip(.35 + .65 * Lz, 0, 1) * cfg.get('bgLight', .6)
        att = 1 / (1 + (d / L.get('rad', 900)) ** 2)
        light += (dif * att)[..., None] * col
        hx, hy, hz = Lx, Ly, Lz + 1
        hn = np.sqrt(hx * hx + hy * hy + hz * hz)
        ndh = np.clip((Nx * hx + Ny * hy + Nz * hz) / hn, 0, 1)
        spec += (ndh ** L.get('shin', 28) * ks * att * (ndl > 0))[..., None] * col
    amb = hexf(cfg.get('amb', '#404858')) * cfg.get('ambInt', .5)
    gnd = hexf(cfg.get('ambGround', '#3a2a20')) * cfg.get('ambInt', .5)
    hemi = (.5 - .5 * Ny)[..., None]
    ambient = amb * hemi + gnd * (1 - hemi)
    lin = alb * (ambient + light) + spec
    e3 = emis[..., None]
    lin = lin * (1 - e3) + alb * cfg.get('emisGain', 1.7) * e3
    return lin, char


def godrays(lin, cfg, char=None):
    g = cfg.get('rays')
    if not g or g.get('int', 0) < .01: return lin
    cx, cy = g['center']; h2, w2 = H // 2, W // 2
    lum = (lin[::2, ::2] * np.array([.2126, .7152, .0722], np.float32)).sum(-1)
    Y, X = grid(); Y2, X2 = Y[::2, ::2], X[::2, ::2]
    src = np.clip(lum - g.get('thresh', .6), 0, None) * np.exp(-((X2 - cx) ** 2 + (Y2 - cy) ** 2) / (2 * g.get('srcRad', 500) ** 2))
    if char is not None: src = src * (1 - char[::2, ::2]) ** 2          # only real light (open doors, flames, sky) streams
    mx = src.max() + 1e-6
    base = Image.fromarray((np.clip(src / mx, 0, 1) * 255).astype(np.uint8))
    acc = np.zeros((h2, w2), np.float32); wgt, tot = 1.0, 0.0
    c2x, c2y = cx / 2, cy / 2
    for i in range(g.get('samples', 48)):
        a = 1 / (1 + i * g.get('step', .014))
        im = base.transform((w2, h2), Image.AFFINE, (a, 0, c2x - a * c2x, 0, a, c2y - a * c2y), resample=Image.BILINEAR)
        acc += np.asarray(im, np.float32) * (wgt / 255); tot += wgt; wgt *= g.get('decay', .965)
    rays = np.asarray(Image.fromarray(acc / tot * 255 / max(1e-6, (acc / tot).max() or 1) if False else (acc / tot * 255).clip(0, 255).astype(np.uint8)).resize((W, H), Image.BILINEAR), np.float32) / 255 * mx
    return lin + rays[..., None] * hexf(g.get('col', '#ffb070')) * g.get('int', 1.5)


def shift_avg(a, dx, dy, n):
    """average of n copies of a shifted along (dx, dy) total, centred (a box motion blur), edge-padded"""
    L = int(np.ceil(max(abs(dx), abs(dy)) / 2)) + 2
    pad = np.pad(a, ((L, L), (L, L), (0, 0)), mode='edge')
    acc = np.zeros_like(a)
    for i in range(n):
        f = (i + .5) / n - .5
        ox, oy = int(round(dx * f)), int(round(dy * f))
        acc += pad[L + oy:L + oy + H, L + ox:L + ox + W]
    return acc / n


def zoom_avg(a, z, cx, cy, n):
    """radial (zoom) blur: average of n copies scaled about (cx, cy) by 1 + z * (f - .5); done at half resolution"""
    h2, w2 = H // 2, W // 2
    small = a.reshape(h2, 2, w2, 2, 3).mean(axis=(1, 3))
    acc = np.zeros_like(small)
    for i in range(n):
        k = 1 + z * ((i + .5) / n - .5)
        c2x, c2y = cx / 2, cy / 2
        for ch in range(3):
            im = Image.fromarray(small[..., ch])
            im = im.transform((w2, h2), Image.AFFINE, (1 / k, 0, c2x - c2x / k, 0, 1 / k, c2y - c2y / k), resample=Image.BILINEAR)
            acc[..., ch] += np.asarray(im, np.float32)
    acc /= n
    big = np.repeat(np.repeat(acc, 2, 0), 2, 1)
    # keep the centre crisp-ish: blend toward the original near the zoom centre
    Y, X = grid()
    r = np.sqrt((X - cx) ** 2 + (Y - cy) ** 2) / 700
    w = np.clip(r, 0, 1)[..., None]
    return a * (1 - w) + big * w


def motion(lin, cfg):
    mb = cfg.get('mb') or {}
    dx, dy, z = mb.get('dx', 0), mb.get('dy', 0), mb.get('z', 0)
    if abs(dx) > 2.5 or abs(dy) > 2.5:
        n = int(min(28, max(6, np.hypot(dx, dy) / 6)))
        lin = shift_avg(lin, dx, dy, n)
    if abs(z) > .012:
        lin = zoom_avg(lin, z, mb.get('cx', W / 2), mb.get('cy', H / 2), int(min(18, max(6, abs(z) * 60))))
    return lin


def aberr(s, ca):
    """chromatic aberration: red scaled out, blue scaled in, about the frame centre"""
    if ca < .0005: return s
    out = s.copy()
    for ch, k in ((0, 1 + ca), (2, 1 - ca)):
        im = Image.fromarray(s[..., ch].astype(np.float32))
        im = im.transform((W, H), Image.AFFINE, (1 / k, 0, W / 2 - W / 2 / k, 0, 1 / k, H / 2 - H / 2 / k), resample=Image.BILINEAR)
        out[..., ch] = np.asarray(im, np.float32)
    return out


def post(lin, cfg, char=None):
    lin = motion(lin, cfg)
    lin = godrays(lin, cfg, char)
    e = cfg.get('exposure', 1.0); x = lin * e
    # bloom: bright parts glow (several radii, added in linear light)
    br = np.clip(x[::2, ::2] - cfg.get('bloomThresh', .8), 0, None)
    bl = blur(br, 4) * .5 + blur(br, 13) * .35 + blur(br, 35) * .25
    bl = np.repeat(np.repeat(bl, 2, 0), 2, 1)[:H, :W]
    x = x + bl * cfg.get('bloom', .6)
    if cfg.get('tonemap') == 'soft':
        # hue-preserving: compress luminance only, so skin and cloth keep their colour instead of burning orange
        lum = (x * np.array([.2126, .7152, .0722], np.float32)).sum(-1, keepdims=True)
        wp = cfg.get('white', 2.2)
        lt = lum * (1 + lum / (wp * wp)) / (1 + lum)
        x = x * (lt / np.maximum(lum, 1e-5))
        x = np.clip(x + np.clip(x.max(-1, keepdims=True) - 1, 0, None) * .5, 0, 1)
    else:
        a, b, c, d, f = 2.51, .03, 2.43, .59, .14
        x = np.clip((x * (a * x + b)) / (x * (c * x + d) + f), 0, 1)
    s = l2s(x)
    if cfg.get('sat', 1) != 1:
        g0 = (s * [.299, .587, .114]).sum(-1, keepdims=True); s = np.clip(g0 + (s - g0) * cfg['sat'], 0, 1)
    if cfg.get('contrast', 1) != 1:
        s = np.clip(.5 + (s - .5) * cfg['contrast'], 0, 1)
    # grade: cool shadows, warm highlights
    lum = (s * [.299, .587, .114]).sum(-1, keepdims=True)
    sh = hexf(cfg.get('shadowTint', '#1d2a3a')); hi = hexf(cfg.get('highTint', '#ffd9a8'))
    s = s + (sh - .5) * cfg.get('shadowAmt', .18) * (1 - lum) ** 2 + (hi - .5) * cfg.get('highAmt', .12) * lum ** 2
    if cfg.get('tint'):
        tn = hexf(cfg['tint']); ta = cfg.get('tintAmt', .25)
        s = s * (1 - ta) + s * tn * 1.25 * ta
    if cfg.get('lift'):
        s = s + hexf(cfg['lift']) * cfg.get('liftAmt', .06) * (1 - lum)
    s = aberr(np.clip(s, 0, 1), cfg.get('ca', 0))
    # vignette
    Y, X = grid()
    r = np.sqrt(((X - W / 2) / (W * .62)) ** 2 + ((Y - H * .47) / (H * .62)) ** 2)
    s = s * (1 - cfg.get('vignette', .35) * smooth(.55, 1.25, r))[..., None]
    # grain
    rng = np.random.default_rng(cfg.get('seed', 1))
    g = rng.standard_normal((H, W)).astype(np.float32) * cfg.get('grain', .018)
    s = s + g[..., None] * (1 - .6 * lum)
    fl = cfg.get('flash') or {}
    if fl.get('op', 0) > .001:
        s = s * (1 - fl['op']) + hexf(fl.get('col', '#fff6e0')) * fl['op']
    if cfg.get('fade', 1) < .999:
        s = s * max(0., cfg['fade'])
    return np.clip(s, 0, 1)


def shade_file(flat, nrm, cfgp, out, seed=1):
    cfg = {k: v for k, v in json.load(open(cfgp)).items() if v is not None}; cfg['seed'] = seed
    lin, char = shade(flat, nrm, cfg)
    img = post(lin, cfg, char)
    Image.fromarray((img * 255 + .5).astype(np.uint8)).save(out, quality=95)


if __name__ == '__main__':
    flat, nrm, out, cfgp = sys.argv[1:5]
    cfg = json.load(open(cfgp))
    lin, char = shade(flat, nrm, cfg)
    img = post(lin, cfg)
    Image.fromarray((img * 255 + .5).astype(np.uint8)).save(out)
