#!/usr/bin/env python3
"""Small relighting engine for painted 2D characters.

The character is stored as two things:  an albedo (flat painted colour, no light baked in)  and a height
field (how far each pixel sticks out toward the camera).  From the height field we get real normals, real
cast shadows and real ambient occlusion, so the lights below behave like lights in a studio.

Only numpy + Pillow are needed (no scipy / opencv).
"""
import numpy as np
from PIL import Image, ImageDraw

W, H = 1200, 1400
SS = 3                                   # supersampling for anti-aliased vector shapes


# ----------------------------------------------------------------------------------------------- colour
def smoothstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


def s2l(c):
    c = np.asarray(c, np.float32)
    return np.where(c <= .04045, c / 12.92, ((c + .055) / 1.055) ** 2.4).astype(np.float32)


def l2s(c):
    c = np.clip(c, 0, 1)
    return np.where(c <= .0031308, c * 12.92, 1.055 * c ** (1 / 2.4) - .055).astype(np.float32)


def rgb(r, g, b):
    """sRGB 0-255 -> linear float triple"""
    return s2l(np.array([r, g, b], np.float32) / 255)


def lum(x):
    return (x * np.array([.2126, .7152, .0722], np.float32)).sum(-1)


# ---------------------------------------------------------------------------------------------- filters
def _fast(n):
    while True:
        m = n
        for p in (2, 3, 5):
            while m % p == 0: m //= p
        if m == 1: return n
        n += 1


def gblur(a, s):
    """Gaussian blur through the FFT (exact, any sigma).  Works on HxW or HxWxC."""
    a = np.asarray(a, np.float32)
    if s < .35: return a
    if a.ndim == 3: return np.dstack([gblur(a[..., i], s) for i in range(a.shape[2])])
    pad = int(3.2 * s) + 2
    h, w = a.shape
    hh, ww = _fast(h + 2 * pad), _fast(w + 2 * pad)
    p = np.pad(a, ((pad, hh - h - pad), (pad, ww - w - pad)), mode='edge')
    fy = np.fft.fftfreq(hh)[:, None]; fx = np.fft.rfftfreq(ww)[None, :]
    g = np.exp(-2 * (np.pi * s) ** 2 * (fx * fx + fy * fy)).astype(np.float32)
    out = np.fft.irfft2(np.fft.rfft2(p) * g, s=p.shape)
    return out[pad:pad + h, pad:pad + w].astype(np.float32)


def noise(sigma, seed, shape=None):
    """unit-variance band-limited noise"""
    rng = np.random.default_rng(seed)
    n = gblur(rng.standard_normal(shape or (H, W)).astype(np.float32), sigma)
    return n / (n.std() + 1e-9)


def edt(mask, scale=2):
    """exact Euclidean distance (px) from every True pixel to the nearest False pixel (computed at 1/scale)"""
    m = np.asarray(mask > .5)
    h0, w0 = m.shape
    m = m[:h0 - h0 % scale, :w0 - w0 % scale].reshape(h0 // scale, scale, w0 // scale, scale).mean(axis=(1, 3)) > .5
    h, w = m.shape
    ys = np.arange(h, dtype=np.float32)[:, None]
    up = np.maximum.accumulate(np.where(~m, ys, -1e5), axis=0)
    dn = np.minimum.accumulate(np.where(~m, ys, 1e5)[::-1], axis=0)[::-1]
    g = np.minimum(np.minimum(ys - up, dn - ys), 3000).astype(np.float32) ** 2
    xs = np.arange(w, dtype=np.float32)
    D = (xs[:, None] - xs[None, :]) ** 2
    d = np.empty((h, w), np.float32)
    for y in range(h):
        d[y] = np.sqrt((g[y][None, :] + D).min(axis=1))
    d = np.where(m, d, 0)
    im = Image.fromarray(d, 'F').resize((w * scale, h * scale), Image.BILINEAR)
    a = np.asarray(im, np.float32) * scale
    out = np.zeros((h0, w0), np.float32)
    out[:a.shape[0], :a.shape[1]] = a
    out[a.shape[0]:] = out[a.shape[0] - 1:a.shape[0]]
    out[:, a.shape[1]:] = out[:, a.shape[1] - 1:a.shape[1]]
    return out


def bevel(mask, R, c, smooth=14):
    """inflate a mask into a rounded pillow: 0 at the edge, c deep inside, quarter-circle profile.
    The signed distance is smoothed first so the medial axis does not leave a crease."""
    m = np.asarray(mask > .5)
    sd = edt(m) - edt(~m)
    sd = gblur(sd, smooth)
    t = 1 - np.clip(sd / R, 0, 1)
    return (c * np.sqrt(np.clip(1 - t * t, 0, 1)) * (sd > 0)).astype(np.float32)


# --------------------------------------------------------------------------------------------- shapes
def spline(pts, closed=True, n=14):
    P = np.asarray(pts, np.float64)
    N = len(P)
    out = []
    for i in range(N if closed else N - 1):
        g = lambda k: P[k % N] if closed else P[min(max(k, 0), N - 1)]
        p0, p1, p2, p3 = g(i - 1), g(i), g(i + 1), g(i + 2)
        for t in np.linspace(0, 1, n, endpoint=False):
            out.append(.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t
                             + (-p0 + 3 * p1 - 3 * p2 + p3) * t ** 3))
    if not closed: out.append(P[-1])
    return np.array(out)


class Paint:
    """anti-aliased mask painter; draw shapes then .get()"""

    def __init__(self, ss=SS):
        self.ss = ss
        self.im = Image.new('L', (W * ss, H * ss), 0)
        self.d = ImageDraw.Draw(self.im)

    def _p(self, P): return [(float(x) * self.ss, float(y) * self.ss) for x, y in P]

    def poly(self, pts, v=255, smooth=True):
        P = spline(pts) if smooth else np.asarray(pts)
        self.d.polygon(self._p(P), fill=v)
        return self

    def ellipse(self, cx, cy, rx, ry, rot=0, v=255, n=72):
        t = np.linspace(0, 2 * np.pi, n, endpoint=False)
        x, y = rx * np.cos(t), ry * np.sin(t)
        c, s = np.cos(rot), np.sin(rot)
        self.d.polygon(self._p(np.c_[cx + c * x - s * y, cy + s * x + c * y]), fill=v)
        return self

    def line(self, pts, w, v=255, smooth=True):
        P = spline(pts, closed=False) if smooth and len(pts) > 2 else np.asarray(pts)
        self.d.line(self._p(P), fill=v, width=max(1, int(round(w * self.ss))), joint='curve')
        r = w * .5 * self.ss
        for x, y in (self._p(P[:1])[0], self._p(P[-1:])[0]):
            self.d.ellipse((x - r, y - r, x + r, y + r), fill=v)
        return self

    def get(self, blur=0):
        a = np.asarray(self.im.resize((W, H), Image.BOX), np.float32) / 255
        return gblur(a, blur) if blur else a


# ---------------------------------------------------------------------------------------- local frame
class Frame:
    """a rotated + translated coordinate frame (the head) so features are authored in head-local px"""

    def __init__(self, cx, cy, deg):
        self.cx, self.cy, self.a = cx, cy, np.deg2rad(deg)
        Y, X = np.mgrid[0:H, 0:W].astype(np.float32)
        dx, dy = X - cx, Y - cy
        c, s = np.cos(self.a), np.sin(self.a)
        self.u = (c * dx + s * dy).astype(np.float32)
        self.v = (-s * dx + c * dy).astype(np.float32)

    def to_canvas(self, pts):
        P = np.asarray(pts, np.float64)
        c, s = np.cos(self.a), np.sin(self.a)
        return np.c_[self.cx + c * P[:, 0] - s * P[:, 1], self.cy + s * P[:, 0] + c * P[:, 1]]

    def pt(self, u, v): return self.to_canvas([(u, v)])[0]

    def gauss(self, cx, cy, sx, sy, amp=1.0, rot=0.0):
        du, dv = self.u - cx, self.v - cy
        if rot:
            c, s = np.cos(rot), np.sin(rot)
            du, dv = c * du + s * dv, -s * du + c * dv
        return amp * np.exp(-.5 * ((du / sx) ** 2 + (dv / sy) ** 2)).astype(np.float32)

    def poly(self, p, pts, v=255, smooth=True): return p.poly(self.to_canvas(pts), v, smooth)

    def ellipse(self, p, cx, cy, rx, ry, rot=0, v=255):
        c = self.to_canvas([(cx, cy)])[0]
        return p.ellipse(c[0], c[1], rx, ry, rot + self.a, v)

    def line(self, p, pts, w, v=255, smooth=True): return p.line(self.to_canvas(pts), w, v, smooth)


# ------------------------------------------------------------------------------------------- lighting
def normals(Hf, bump=None, soft=1.0):
    Hs = gblur(Hf, soft)
    gy, gx = np.gradient(Hs)
    if bump is not None: gx = gx + bump[0]; gy = gy + bump[1]
    n = np.dstack([-gx, -gy, np.ones_like(gx)])
    return (n / np.linalg.norm(n, axis=2, keepdims=True)).astype(np.float32)


def occlusion(Hf, scales=((3, .22), (9, .26), (26, .28), (70, .24)), k=1.0):
    """ambient occlusion from the height field: concavities are darker, contact edges get a shadow"""
    a = 0
    for s, w in scales:
        a = a + w * np.clip((gblur(Hf, s) - Hf) / (s * .75 / k), 0, 1)
    return (1 - np.clip(a, 0, 1) * .78).astype(np.float32)


def cast_shadow(Hf, L, reach=260, stride=2.5, soft=.10, samples=9, penumbra=12.0, seed=0):
    """soft shadow from an area light.  L = unit vector surface->light (x right, y down, z to viewer)"""
    L = np.asarray(L, np.float64); L /= np.linalg.norm(L)
    rng = np.random.default_rng(seed)
    pad = int(reach) + 2
    P = np.pad(Hf, ((pad, pad), (pad, pad)), mode='edge')
    vis = np.zeros_like(Hf)
    for k in range(samples):
        j = L + soft * rng.standard_normal(3) * np.array([1, 1, .5])
        j /= np.linalg.norm(j)
        lxy = np.hypot(j[0], j[1]) + 1e-6
        ux, uy, slope = j[0] / lxy, j[1] / lxy, j[2] / lxy
        mx = np.full_like(Hf, -1e4)
        s = stride
        while s <= reach:
            sx, sy = int(round(ux * s)), int(round(uy * s))
            sh = P[pad + sy:pad + sy + H, pad + sx:pad + sx + W]
            np.maximum(mx, sh - Hf - s * slope, out=mx)
            s += stride
        vis += 1 - smoothstep(0, penumbra, mx)
    return gblur(vis / samples, 1.2)


def unit(v):
    v = np.asarray(v, np.float32)
    return v / np.linalg.norm(v)


def tonemap(x):
    a, b, c, d, f = 2.51, .03, 2.43, .59, .14
    return np.clip((x * (a * x + b)) / (x * (c * x + d) + f), 0, 1)
