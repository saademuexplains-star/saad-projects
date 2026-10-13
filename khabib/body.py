#!/usr/bin/env python3
"""Full-body poses for the Khabib character.

    python3 build.py bake                 # once: bake the lit head layers (see build.py)
    python3 body.py                       # all poses -> poses/*.png + khabib_poses.png
    python3 body.py A_crossed B_guard     # only these
    PREVIEW=1 python3 body.py B_guard     # fast flat preview, no cast shadows

A tiny orthographic 3D scene (a torso loft, tapered limbs, ellipsoid hands/feet, 2-bone IK for the arms and
legs) is rasterised into the same kind of data the portrait uses: a height field + albedo + material maps.
The baked head is warped on top, then the whole figure is lit with the same studio lights, so shadows
(arm over chest, chin on neck, fist near the face) are computed, not painted.
"""
import os, sys, time
import numpy as np
from PIL import Image
import engine as E
E.W, E.H = 1200, 1800                      # full-body canvas (set before anything allocates)
from engine import *
import build as B

W, H = E.W, E.H
HERE = os.path.dirname(os.path.abspath(__file__))
SCR = B.SCR
OUT = os.path.join(HERE, 'poses')
S_CM = 8.2                                  # pixels per centimetre
GROUND_Y = 1745
HEAD_SCALE = 1.1
ZOFF = 420                                  # keep every body z positive (wall behind is z = 0)
SKIN, SHIRT, SHORTS, GLOVE, SHOE, SOLE, COLLAR, WAIST = 1, 2, 3, 4, 5, 6, 7, 8

COL = {SKIN: rgb(193, 151, 126), SHIRT: rgb(34, 34, 38), SHORTS: rgb(27, 27, 32), GLOVE: rgb(150, 26, 30),
       SHOE: rgb(44, 44, 50), SOLE: rgb(205, 205, 210), COLLAR: rgb(26, 26, 30), WAIST: rgb(104, 104, 112)}
GLOSS = {SKIN: .22, SHIRT: .12, SHORTS: .24, GLOVE: .40, SHOE: .28, SOLE: .22, COLLAR: .10, WAIST: .20}
SHIN = {SKIN: 34., SHIRT: 9., SHORTS: 14., GLOVE: 40., SHOE: 22., SOLE: 20., COLLAR: 9., WAIST: 12.}


def norm(v): return np.asarray(v, np.float64) / np.linalg.norm(v)
def sm01(t): t = np.clip(t, 0, 1); return t * t * (3 - 2 * t)


# ------------------------------------------------------------------------------------------------ scene
class Scene:
    def __init__(self):
        self.Hm = np.zeros((H, W), np.float32)
        self.Im = np.zeros((H, W), np.uint8)
        self.cov = np.zeros((H, W), np.float32)

    def _win(self, cx, cy, r):
        x0, x1 = int(max(0, np.floor(cx - r))), int(min(W, np.ceil(cx + r) + 1))
        y0, y1 = int(max(0, np.floor(cy - r))), int(min(H, np.ceil(cy + r) + 1))
        return x0, x1, y0, y1

    def _put(self, x0, y0, z, valid, ident):
        h, w = z.shape
        sub = self.Hm[y0:y0 + h, x0:x0 + w]
        upd = valid & (z > sub)
        sub[upd] = z[upd]
        self.Im[y0:y0 + h, x0:x0 + w][upd] = ident
        self.cov[y0:y0 + h, x0:x0 + w][valid] = 1

    def sphere(self, c, r, ident):
        x0, x1, y0, y1 = self._win(c[0], c[1], r)
        if x1 <= x0 or y1 <= y0: return
        xs = (np.arange(x0, x1, dtype=np.float32) - c[0])[None, :]
        ys = (np.arange(y0, y1, dtype=np.float32) - c[1])[:, None]
        d2 = xs * xs + ys * ys
        valid = d2 < r * r
        z = c[2] + np.sqrt(np.clip(r * r - d2, 0, None))
        self._put(x0, y0, z.astype(np.float32), valid, ident)

    def ellipsoid(self, c, rad, basis, ident):
        x0, x1, y0, y1 = self._win(c[0], c[1], max(rad))
        if x1 <= x0 or y1 <= y0: return
        xs = (np.arange(x0, x1, dtype=np.float32) - c[0])[None, :]
        ys = (np.arange(y0, y1, dtype=np.float32) - c[1])[:, None]
        saa = sab = sbb = 0
        for b, rr in zip(basis, rad):
            a = (b[0] * xs + b[1] * ys) / rr
            be = b[2] / rr
            saa = saa + a * a; sab = sab + a * be; sbb = sbb + be * be
        disc = sab * sab - sbb * (saa - 1)
        valid = disc >= 0
        z = c[2] + (-sab + np.sqrt(np.clip(disc, 0, None))) / sbb
        self._put(x0, y0, z.astype(np.float32), valid, ident)

    def sweep(self, p0, p1, rfun, idfun, dense=.11):
        p0 = np.asarray(p0, np.float64); p1 = np.asarray(p1, np.float64)
        L = np.linalg.norm(p1 - p0)
        rmin = min(rfun(0), rfun(.5), rfun(1))
        n = int(max(6, L / max(1.2, rmin * dense)))
        for t in np.linspace(0, 1, n):
            self.sphere(p0 + (p1 - p0) * t, rfun(t), idfun(t))

    def loft(self, P, u_t, st, th0, th1, idfun):
        """torso: analytic elliptical cross-sections, one per screen row (smooth, no scalloping)"""
        s_cm, rx, rf = st[:, 0], st[:, 1] * S_CM, st[:, 2] * S_CM
        uy = u_t[1] * S_CM
        ya, yb = P[1] + uy * s_cm[0], P[1] + uy * s_cm[-1]
        rows = np.arange(int(max(0, np.floor(min(ya, yb)))), int(min(H - 1, np.ceil(max(ya, yb)))) + 1)
        s = (rows - P[1]) / uy
        ok = (s >= s_cm[0]) & (s <= s_cm[-1])
        rows, s = rows[ok], s[ok]
        def sm1(a, sig):
            k = np.exp(-.5 * (np.arange(-3 * sig, 3 * sig + 1) / sig) ** 2); k /= k.sum()
            return np.convolve(np.pad(a, 3 * sig, mode='edge'), k, 'valid')
        rxr = sm1(np.interp(s, s_cm, rx), 14); rfr = sm1(np.interp(s, s_cm, rf), 14)
        cx = P[0] + u_t[0] * S_CM * s; cz = P[2] + u_t[2] * S_CM * s
        th = np.deg2rad(th0 + (th1 - th0) * sm01((s - s_cm[0]) / (s_cm[-1] - s_cm[0])))
        X = np.arange(W, dtype=np.float32)[None, :]
        dx = X - cx[:, None].astype(np.float32)
        c, sn = np.cos(th)[:, None], np.sin(th)[:, None]
        irx, irf = 1 / rxr[:, None] ** 2, 1 / rfr[:, None] ** 2
        a2 = sn * sn * irx + c * c * irf
        b = dx * sn * c * (irx - irf)
        c0 = dx * dx * (c * c * irx + sn * sn * irf) - 1
        disc = b * b - a2 * c0
        valid = disc >= 0
        z = cz[:, None] + (-b + np.sqrt(np.clip(disc, 0, None))) / a2
        ids = np.where(s < 15, np.where(s > 13.6, WAIST, SHORTS), SHIRT).astype(np.uint8)
        sub = self.Hm[rows[0]:rows[-1] + 1]
        zz = z.astype(np.float32)
        upd = valid & (zz > sub)
        sub[upd] = zz[upd]
        im = self.Im[rows[0]:rows[-1] + 1]
        im[upd] = np.broadcast_to(ids[:, None], upd.shape)[upd]
        self.cov[rows[0]:rows[-1] + 1][valid] = 1


def two_bone(A, T, l1, l2, pole):
    d = T - A
    L = min(np.linalg.norm(d), (l1 + l2) * .995)
    dn = d / np.linalg.norm(d)
    a = (l1 * l1 - l2 * l2 + L * L) / (2 * L)
    h = np.sqrt(max(l1 * l1 - a * a, 0))
    p = np.asarray(pole, np.float64)
    p = p - dn * np.dot(p, dn)
    p = p / np.linalg.norm(p)
    return A + dn * a + p * h, A + dn * L


# ------------------------------------------------------------------------------------------------ poses
POSES = {
    # arms crossed, calm, front-on
    'A_crossed': dict(yaw=5, pelvis=(0, 93.5, 0), lean=0, tilt=0, twist=-6, roll=1.5,
                      foot_p=(15.5, 1.5, -20), foot_n=(-15.5, 1.5, 20),
                      arm_p=dict(wrist=(-5, 127, 20), pole=(.2, -1, .6), hand='tuck'),
                      arm_n=dict(wrist=(5, 121, 30), pole=(-.2, -1, .6), hand='tuck'), glove=False),
    # orthodox fighting stance, hands up, body turned
    'B_guard': dict(yaw=32, pelvis=(0, 85, 0), lean=7, tilt=0, twist=14, roll=-2,
                    foot_n=(-11, 26, 6), foot_p=(13, -24, -45),
                    arm_n=dict(wrist=(-9, 6, 34), pole=(-.6, -1, 0), hand='fist', chest=True),
                    arm_p=dict(wrist=(7, 4, 21), pole=(.8, -1, -.2), hand='fist', chest=True), glove=True),
    # hand raised, other hand on hip
    'C_victory': dict(yaw=10, pelvis=(0, 91, 0), lean=-2, tilt=-3, twist=0, roll=-3,
                      foot_p=(23, 0, -18), foot_n=(-23, 0, 18),
                      arm_p=dict(wrist=(31, 189, 8), pole=(0, 0, -1), hand='fist'),
                      arm_n=dict(wrist=(-23, 99, 7), pole=(-1, -.2, -.4), hand='fist'), glove=False),
    # lead straight punch
    'D_jab': dict(cx=745, yaw=48, pelvis=(0, 80, 0), lean=6, tilt=0, twist=20, roll=0,
                  foot_n=(-10, 38, 0), foot_p=(14, -30, -50),
                  arm_n=dict(wrist=(-15, 1, 64), pole=(0, -1, 0), hand='fist', chest=True),
                  arm_p=dict(wrist=(8, 3, 21), pole=(.8, -1, -.2), hand='fist', chest=True), glove=True),
}

TORSO = np.array([  # distance along the spine from the hip joints (cm), half width, half depth
    [-9, 12.5, 8.5], [-5, 15.8, 10.6], [3, 17.5, 12], [11, 16, 10.8], [21, 16.8, 11.6],
    [30, 21.3, 13.4], [38, 23.2, 13], [44, 22, 11.4], [48.5, 16.5, 8.8], [50.5, 10, 6.2]])


def basis(yaw, lean=0, tilt=0):
    t = np.deg2rad(yaw)
    f0 = np.array([-np.sin(t), 0, np.cos(t)]); r0 = np.array([np.cos(t), 0, np.sin(t)]); u0 = np.array([0, -1., 0])
    l = np.deg2rad(lean)
    u = np.cos(l) * u0 + np.sin(l) * f0; f = np.cos(l) * f0 - np.sin(l) * u0
    k = np.deg2rad(tilt)
    u2 = np.cos(k) * u + np.sin(k) * r0; r = np.cos(k) * r0 - np.sin(k) * u
    return norm(r), norm(u2), norm(f)


def build_body(sp):
    sc = Scene()
    G = np.array([float(sp.get('cx', 600)), GROUND_Y, ZOFF])
    yaw = sp['yaw']
    rg, ug, fg = basis(yaw)
    U = np.array([0, -1., 0])

    def gp(p):  # ground-frame cm (x right, y up, z forward) -> world px
        return G + (p[0] * rg + p[1] * U + p[2] * fg) * S_CM

    P = gp(sp['pelvis'])
    rc, uc, fc = basis(yaw + sp['twist'], sp['lean'], sp['tilt'])
    _, ut, _ = basis(yaw + sp['twist'] * .5, sp['lean'], sp['tilt'])
    Ctop = P + ut * 50 * S_CM
    J = {}
    J['P'], J['Ctop'] = P, Ctop

    # ---- torso
    sc.loft(P, ut, TORSO, yaw, yaw + sp['twist'], None)
    for sg in (-1, 1):                                     # pecs under the tee
        c = Ctop - ut * 12.5 * S_CM + fc * 6.2 * S_CM + rc * sg * 8.6 * S_CM
        sc.ellipsoid(c, (10.2 * S_CM, 6.2 * S_CM, 4.0 * S_CM), (rc, ut, fc), SHIRT)
    sh = {sg: Ctop + rc * sg * 21 * S_CM - ut * 1.5 * S_CM for sg in (-1, 1)}
    bar0, bar1 = Ctop - rc * 17 * S_CM - ut * 2.5 * S_CM, Ctop + rc * 17 * S_CM - ut * 2.5 * S_CM
    sc.sweep(bar0, bar1, lambda t: 5.4 * S_CM, lambda t: SHIRT)        # trapezius / shoulder line
    for sg in (-1, 1):
        sc.sphere(sh[sg] - ut * 1.6 * S_CM, 6.7 * S_CM, SHIRT)   # deltoids
        sc.sweep(Ctop + rc * sg * 6.5 * S_CM + ut * 1.0 * S_CM - fc * 1.0 * S_CM, sh[sg] + ut * 1.2 * S_CM,
                 lambda t: (6.6 - 1.2 * t) * S_CM, lambda t: SHIRT)       # trapezius

    # ---- legs
    hips = {sg: P + rg * sg * 9.5 * S_CM for sg in (-1, 1)}
    feet = {1: sp['foot_p'], -1: sp['foot_n']}
    for sg in (-1, 1):
        fx, fz, frel = feet[sg]
        ank = gp((fx, 8, fz))
        pole = fg + rg * sg * .25
        knee, ank = two_bone(hips[sg], ank, 44 * S_CM, 43 * S_CM, pole)
        sc.sweep(hips[sg], knee, lambda t: (10.6 - 3.0 * t ** 1.3 + (.9 + .7 * t if t < .62 else 0)) * S_CM, lambda t: SHORTS if t < .62 else SKIN)
        sc.sphere(knee, 6.5 * S_CM, SKIN)
        sc.sweep(knee, ank, lambda t: (6.6 + 2.0 * np.sin(min(t, .5) / .5 * np.pi / 2) * (1 - t) - 2.6 * t ** 1.3) * S_CM,
                 lambda t: SKIN)
        sc.sphere(ank, 3.9 * S_CM, SKIN)
        psi = np.deg2rad(yaw + frel)
        ff = np.array([-np.sin(psi), 0, np.cos(psi)]); fr = np.array([np.cos(psi), 0, np.sin(psi)])
        shoe_c = ank + ff * 6 * S_CM + np.array([0, 3.5 * S_CM, 0])
        sc.ellipsoid(shoe_c, (5.6 * S_CM, 5.0 * S_CM, 13.6 * S_CM), (fr, np.array([0, -1., 0]), ff), SHOE)
        sole_c = shoe_c + np.array([0, 3.7 * S_CM, 0]) + ff * .3 * S_CM
        sc.ellipsoid(sole_c, (5.8 * S_CM, 1.6 * S_CM, 13.9 * S_CM), (fr, np.array([0, -1., 0]), ff), SOLE)
        J['foot%d' % sg] = shoe_c

    # ---- arms
    for sg in (-1, 1):
        a = sp['arm_p'] if sg == 1 else sp['arm_n']
        wr = (Ctop + (a['wrist'][0] * rc + a['wrist'][1] * ut + a['wrist'][2] * fc) * S_CM) if a.get('chest') else gp(a['wrist'])
        pole_w = norm(a['pole'][0] * rg + a['pole'][1] * U + a['pole'][2] * fg)
        elb, wr = two_bone(sh[sg], wr, 31 * S_CM, 26 * S_CM, pole_w)
        sc.sweep(sh[sg], elb, lambda t: (6.6 - 2.0 * t + (.5 if t < .42 else 0)) * S_CM, lambda t: SHIRT if t < .42 else SKIN)
        sc.sphere(elb, 4.7 * S_CM, SKIN)
        sc.sweep(elb, wr, lambda t: (4.8 + .5 * np.sin(min(t, .5) / .5 * np.pi / 2) - 2.0 * t ** 1.2) * S_CM,
                 lambda t: GLOVE if (sp['glove'] and t > .9) else SKIN)
        d = norm(wr - elb)
        if a['hand'] == 'fist':
            if sp['glove']:
                sc.sweep(wr - d * 3 * S_CM, wr + d * 1.5 * S_CM, lambda t: 4.8 * S_CM, lambda t: GLOVE)
                sc.sphere(wr + d * 7.0 * S_CM, 6.3 * S_CM, GLOVE)
            else:
                sc.sphere(wr + d * 5.2 * S_CM, 4.9 * S_CM, SKIN)
        else:  # relaxed, tucked hand
            zv = np.array([0, 0, 1.])
            z2 = norm(zv - d * np.dot(d, zv)); pv = np.cross(d, z2)
            sc.ellipsoid(wr + d * 8.0 * S_CM, (8.6 * S_CM, 4.7 * S_CM, 2.9 * S_CM), (d, pv, z2), SKIN)
        J['elbow%d' % sg], J['wrist%d' % sg] = elb, wr

    # ---- neck, collar
    neck_top = Ctop + (ut * 8 + fc * 1.5) * S_CM
    nb = Ctop - ut * 2.0 * S_CM
    sc.sweep(nb, neck_top, lambda t: (8.4 - .9 * t) * S_CM, lambda t: SKIN)
    # neckline: skin shows in a U below the neck, with a ribbed collar around it
    nc = Ctop + fc * 4.0 * S_CM
    ncx, ncy = nc[0], nc[1] + 1.5 * S_CM
    cosy = abs(np.cos(np.deg2rad(yaw + sp['twist']))) * .6 + .4
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    rho = np.sqrt(((xx - ncx) / (8.6 * S_CM * cosy)) ** 2 + ((yy - ncy) / (6.6 * S_CM)) ** 2)
    low = yy > ncy - 2 * S_CM
    skin_u = (rho < 1) & (sc.Im == SHIRT)
    sc.Hm[skin_u] -= 3.0 * S_CM * (1 - rho[skin_u] ** 2)
    sc.Im[skin_u] = SKIN
    ring = (rho >= 1) & (rho < 1.16) & low & (sc.Im == SHIRT)
    sc.Im[ring] = COLLAR
    sc.Hm[ring] += 2.2 * S_CM * np.sin((rho[ring] - 1) / .16 * np.pi)

    # ---- head anchor (chin)
    chin = neck_top + np.array([0, -2.5 * S_CM, 7.5 * S_CM])
    J['chin'] = chin
    return sc, J


# ----------------------------------------------------------------------------------------- head + materials
_HEAD = {}


def head_layers():
    if _HEAD: return _HEAD
    z = np.load(os.path.join(SCR, 'head_layers.npz'))
    _HEAD.update({k: z[k] for k in z.files})
    return _HEAD


def warp(chan, k, A, anchor, roll_deg, resample=Image.BICUBIC):
    """scale a source channel by k, then roll about the chin anchor and place the anchor at A"""
    chan = np.ascontiguousarray(chan, dtype=np.float32)
    h0, w0 = chan.shape
    sw, sh_ = int(round(w0 * k)), int(round(h0 * k))
    small = np.asarray(Image.fromarray(chan.astype(np.float32), 'F').resize((sw, sh_), Image.LANCZOS), np.float32)
    an = (anchor[0] * k, anchor[1] * k)
    r = np.deg2rad(roll_deg); c, s = np.cos(r), np.sin(r)
    coef = (c, s, an[0] - c * A[0] - s * A[1], -s, c, an[1] + s * A[0] - c * A[1])
    return np.asarray(Image.fromarray(small, 'F').transform((W, H), Image.AFFINE, coef, resample), np.float32)


def render_maps(sc, J, sp):
    t0 = time.time()
    Im = sc.Im
    cov = np.clip(gblur(sc.cov, .6), 0, 1)
    ids = (SKIN, SHIRT, SHORTS, GLOVE, SHOE, SOLE, COLLAR, WAIST)
    msk = {i: np.clip(gblur((Im == i).astype(np.float32) * (sc.cov > .5), .7), 0, 1) for i in ids}
    tot = np.maximum(sum(msk.values()), 1e-3)
    A = np.zeros((H, W, 3), np.float32); Gl = np.zeros((H, W), np.float32); Sh = np.zeros((H, W), np.float32)
    for i in ids:
        w = msk[i] / tot
        A += w[..., None] * COL[i]; Gl += w * GLOSS[i]; Sh += w * SHIN[i]
    skinm = msk[SKIN] / tot
    # skin: same mottling as the face; cloth: fine weave
    lf = noise(38, 101) * .035 + noise(9, 102) * .022
    A = A * (1 + (np.dstack([lf, lf * .85, lf * .7]) * skinm[..., None]))
    for key, pos, sx_, sy_, c in (('elbow', None, 30, 30, (1.0, .84, .80)), ('knee', None, 0, 0, (1, 1, 1))):
        pass
    for sg in (-1, 1):                                       # elbows a touch redder / darker
        e = J['elbow%d' % sg]
        g = np.exp(-.5 * (((np.arange(W)[None, :] - e[0]) / 22) ** 2 + ((np.arange(H)[:, None] - e[1]) / 22) ** 2))
        A = A * (1 + (np.array([1.04, .86, .82]) - 1) * (g * skinm)[..., None])
    weave = noise(.7, 111) * .04 + noise(2.2, 112) * .03
    cloth = (msk[SHIRT] + msk[SHORTS] + msk[COLLAR] + msk[WAIST]) / tot
    A = A * (1 + (weave * cloth)[..., None])
    pores = noise(.9, 121) * .55 + noise(2.0, 122) * .45
    bump = pores * skinm * .28 + (noise(.8, 123) * .10 + noise(2.5, 124) * .08) * cloth
    gy, gx = np.gradient(bump.astype(np.float32))
    M = dict(albedo=A, gloss=Gl, shin=Sh, skin=skinm.astype(np.float32), thin=np.zeros((H, W), np.float32),
             bump=(gx * .30, gy * .30))
    Hf = sc.Hm.copy()
    alpha = cov

    # ---- head
    hl = head_layers()
    k = HEAD_SCALE * 23 * S_CM / 488.0
    anchor = (600, 748)
    chin = J['chin']
    roll = sp['roll']
    z_anchor = chin[2]
    wp = lambda ch: warp(ch, k, chin[:2], anchor, roll)
    m = np.clip(wp(hl['headalpha']), 0, 1)
    Hh = wp(hl['H']) * k + (z_anchor - 33)
    body = sc.cov > .5
    m_eff = m * np.where(body, sm01((Hh - Hf) / 4 + .5), 1.0)
    # the baked head lighting maps
    Hf = Hf * (1 - m_eff) + Hh * m_eff
    for key in ('gloss', 'shin', 'skin', 'thin'):
        M[key] = M[key] * (1 - m_eff) + np.clip(wp(hl[key]), 0 if key != 'shin' else 1, None) * m_eff
    ha = np.dstack([wp(hl['albedo'][..., i]) for i in range(3)])
    M['albedo'] = M['albedo'] * (1 - m_eff[..., None]) + np.clip(ha, 0, None) * m_eff[..., None]
    bx = wp(hl['bx']) * m_eff; by = wp(hl['by']) * m_eff
    M['bump'] = (M['bump'][0] * (1 - m_eff) + bx, M['bump'][1] * (1 - m_eff) + by)
    alpha = np.clip(np.maximum(alpha, m_eff), 0, 1)
    S = dict(H=Hf.astype(np.float32), alpha=alpha)
    print('maps %.1fs' % (time.time() - t0))
    return S, M


# ------------------------------------------------------------------------------------------------ backdrop
def backdrop(J):
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    wall = np.exp(-(((xx - 700) / 760) ** 2 + ((yy - 800) / 1050) ** 2) * 1.5)[..., None]
    bg = rgb(8, 10, 14) * (1 - wall) + rgb(70, 84, 100) * wall
    fl = sm01((yy - (GROUND_Y - 260)) / 420)[..., None]                    # floor fades in under the feet
    pool = np.exp(-(((xx - 640) / 640) ** 2 + ((yy - (GROUND_Y + 10)) / 210) ** 2) * 1.6)[..., None]
    floor = rgb(12, 15, 20) * (1 - pool) + rgb(58, 68, 80) * pool
    bg = bg * (1 - fl) + floor * fl
    # contact + soft shadows on the floor, thrown away from the key light (to the right)
    sh = np.zeros((H, W), np.float32)
    pts = [J['foot-1'], J['foot1']]
    for p in pts:
        sh = np.maximum(sh, np.exp(-(((xx - (p[0] + 40)) / 120) ** 2 + ((yy - (GROUND_Y + 6)) / 15) ** 2)) * .85)
    cx = (pts[0][0] + pts[1][0]) / 2
    sh = np.maximum(sh, np.exp(-(((xx - (cx + 110)) / 330) ** 2 + ((yy - (GROUND_Y + 8)) / 30) ** 2)) * .75)
    sh = gblur(sh, 8)
    return bg * (1 - sh[..., None] * .85)


def preview(S, M):
    N = normals(S['H'], M['bump'])
    d = unit((-.82, -.40, .42))
    lam = np.clip((N * d).sum(-1), 0, 1) * .75 + .25
    img = M['albedo'] * 2.2 * lam[..., None]
    return img


def run(name):
    t0 = time.time()
    sp = POSES[name]
    sc, J = build_body(sp)
    S, M = render_maps(sc, J, sp)
    os.makedirs(OUT, exist_ok=True)
    bg = backdrop(J)
    if os.environ.get('PREVIEW'):
        lin = preview(S, M)
        img = B.finish(lin, S, bg)
        B.save(img, os.path.join(SCR, 'pv_%s.png' % name))
        print(name, 'preview %.1fs' % (time.time() - t0))
        return img
    lin = B.light(S, M)
    img = B.finish(lin, S, bg)
    B.save(img, os.path.join(OUT, '%s.png' % name))
    cut = B.finish(lin, S, lin, vig=False)
    rgba = np.dstack([cut, np.clip(S['alpha'], 0, 1)])
    Image.fromarray((rgba * 255 + .5).astype(np.uint8), 'RGBA').save(os.path.join(OUT, '%s_cutout.png' % name))
    print(name, 'done %.1fs' % (time.time() - t0))
    return img


if __name__ == '__main__':
    names = sys.argv[1:] or list(POSES)
    imgs = [run(n) for n in names]
    if not os.environ.get('PREVIEW') and len(imgs) > 1:
        w = 600
        tiles = [Image.fromarray((np.clip(i, 0, 1) * 255 + .5).astype(np.uint8)).resize((w, int(H * w / W)), Image.LANCZOS)
                 for i in imgs]
        sheet = Image.new('RGB', (w * len(tiles), tiles[0].height))
        for k, t in enumerate(tiles): sheet.paste(t, (k * w, 0))
        sheet.save(os.path.join(HERE, 'khabib_poses.png'))
        print('wrote khabib_poses.png')
