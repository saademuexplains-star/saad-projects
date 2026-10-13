#!/usr/bin/env python3
"""Khabib - realistic 2D character, studio-lit.

    python3 build.py clay      # form check: grey clay material, same lights
    python3 build.py           # full render -> khabib.png + khabib_cutout.png

Everything is authored in head-local pixels (u right, v down, origin at the middle of the head) and
mapped onto the canvas, so the head can be tilted a touch without redoing any feature.

Pipeline:  sculpt()  -> height field + masks
           paint()   -> albedo (flat colour, no light) + material maps (gloss, skin, ...) + micro bump
           light()   -> studio lights (key / fill / rim / kicker) with cast shadows, AO, skin subsurface
           finish()  -> bloom, filmic tonemap, grade, vignette, grain
"""
import os, sys, time
import numpy as np
from PIL import Image, ImageDraw
from engine import *

HERE = os.path.dirname(os.path.abspath(__file__))
SCR = os.environ.get('KHABIB_SCRATCH', os.path.join(HERE, '_scratch'))
os.makedirs(SCR, exist_ok=True)

F = Frame(600, 500, -2.0)                     # head frame: centre of the head, slight tilt
Y_, X_ = np.mgrid[0:H, 0:W].astype(np.float32)
Z_HEAD = 85                                   # how far the head sits in front of the neck / shoulders


def gc(cx, cy, sx, sy, amp=1.0, rot=0.0):     # gaussian in canvas pixels
    dx, dy = X_ - cx, Y_ - cy
    if rot:
        c, s = np.cos(rot), np.sin(rot); dx, dy = c * dx + s * dy, -s * dx + c * dy
    return amp * np.exp(-.5 * ((dx / sx) ** 2 + (dy / sy) ** 2)).astype(np.float32)


def both(cx, cy, sx, sy, amp, rot=0.0, asym=1.0):
    return F.gauss(cx, cy, sx, sy, amp, rot) + F.gauss(-cx, cy, sx, sy, amp * asym, -rot)


def sym(rp, asym=0.0):
    """right half outline (top->bottom, first/last on the axis) -> closed polygon, left half mirrored"""
    rp = [tuple(p) for p in rp]
    return rp + [(-u * (1 + asym), v) for u, v in reversed(rp[1:-1])]


def mir(pts, k=1.0, du=0.0):
    return [(-u * k + du, v) for u, v in pts]


def fit(pts, ku=1.05, kv=.93, v0=140):
    """widen a head-local outline and shorten everything below v0 (rounder head, shorter beard)"""
    return [(u * ku, v if v < v0 else v0 + (v - v0) * kv) for u, v in pts]


# ------------------------------------------------------------------------------------ outlines (head-local)
SKULL = fit(sym([(0, -240), (70, -231), (130, -203), (168, -152), (184, -86), (188, -20), (183, 50), (168, 115),
                 (140, 180), (95, 232), (0, 256)], .012))

# beard: outer edge round the jaw, trimmed cheek line across the top, ends at the top of the moustache
BEARD_R_OUT = [(173, -8), (185, 18), (181, 74), (168, 140), (146, 202), (108, 258), (58, 295), (0, 306)]
BEARD_L_OUT = [(-175, -6), (-186, 16), (-182, 72), (-166, 138), (-144, 200), (-106, 256), (-56, 294)]
BEARD_TRIM_L = [(-157, 12), (-143, 30), (-124, 47), (-100, 71), (-84, 91), (-60, 98), (0, 103)]
BEARD_TRIM_R = [(60, 97), (84, 90), (100, 70), (124, 46), (141, 30), (155, 12)]
BEARD = fit(BEARD_R_OUT + list(reversed(BEARD_L_OUT)) + BEARD_TRIM_L + BEARD_TRIM_R)

MOUSTACHE = sym([(0, 103), (40, 99), (72, 98), (98, 108), (116, 128), (112, 151), (84, 147), (58, 141), (30, 138),
                 (0, 141)], .01)

EAR_R = [(176, -64), (199, -68), (218, -50), (225, -14), (215, 23), (197, 36), (180, 28)]
EAR_L = mir(EAR_R, 1.0)

# eye opening, relative to the eye centre, x positive toward the outer corner
EYE_PTS = [(x * 1.12, y * 1.12) for x, y in [(-33, 3), (-22, -6), (-6, -14), (12, -18), (28, -16), (39, -8), (31, -1), (15, 6), (-4, 8), (-20, 8)]]
EYE_C = [(68, -16), (-68, -15)]                # image-right eye, image-left eye (head-local)
IRIS_R, PUPIL_R = 16.5, 6.6

BROW_R = [(16, -80), (42, -94), (78, -103), (112, -98), (144, -80), (141, -67), (112, -77), (80, -78), (46, -66),
          (16, -53)]
BROW_L = [(-18, -79), (-44, -93), (-80, -101), (-113, -97), (-142, -80), (-139, -67), (-112, -77), (-80, -77),
          (-47, -65), (-18, -52)]

TY = -64                                       # raise the whole torso (shorter neck)


def ty(pts): return [(x, y + TY) for x, y in pts]


def sx(pts, k=.80): return [(600 + (x - 600) * k, y) for x, y in pts]


NECK = ty([(484, 600), (480, 740), (470, 820), (452, 890), (440, 1010), (760, 1010), (748, 890), (730, 820),
           (720, 740), (716, 600)])
TORSO_L = ty([(448, 872), (400, 880), (340, 898), (280, 920), (220, 944), (160, 972), (112, 1006), (72, 1048),
              (44, 1100), (28, 1170), (18, 1300), (14, 1500)])
NECKLINE = ty([(446, 876), (462, 912), (510, 950), (600, 978), (690, 950), (738, 912), (754, 876)])
HOLE = [(446, 600 + TY)] + NECKLINE + [(754, 600 + TY)]

HAIRZONE = [(-196, -52), (-174, -96), (-132, -136), (-82, -158), (0, -166), (82, -158), (132, -136), (174, -96),
            (196, -52), (230, -300), (-230, -300)]
LIP = [(-42, 150), (-22, 146), (0, 148), (22, 146), (42, 150), (36, 163), (18, 172), (0, 175), (-18, 172), (-36, 163)]
LIP_UP = [(-46, 138), (0, 135), (46, 138), (50, 148), (0, 150), (-50, 148)]


def poly(pts, smooth=True):
    return Paint().poly(pts, smooth=smooth).get()


def lpoly(pts, smooth=True):                       # local polygon -> mask
    return F.poly(Paint(), pts, smooth=smooth).get()


def eye_pts(i):
    ec = EYE_C[i]; sgn = 1 if i == 0 else -1
    return [(ec[0] + sgn * x, ec[1] + y) for x, y in EYE_PTS]


def iris_c(i):
    ec = EYE_C[i]; sgn = 1 if i == 0 else -1
    return (ec[0] + sgn * 3, ec[1] - 4)


# ------------------------------------------------------------------------------------------------ geometry
def sculpt():
    t0 = time.time()
    u, v = F.u, F.v
    S = {}

    skull = lpoly(SKULL)
    cut = Paint(); F.ellipse(cut, 0, 161, 47, 23)
    lipcut = cut.get(1.0)
    beard_raw = np.clip(lpoly(BEARD) + lpoly(MOUSTACHE) - lipcut, 0, 1)
    edge = noise(4, 11) * .55 + noise(1.6, 12) * .30
    beard = smoothstep(.44, .56, gblur(beard_raw, 1.4) + .10 * edge)
    sil = np.maximum(skull, beard)
    S.update(skull=skull, beard=beard, sil=sil, lipcut=lipcut)

    # ---- head: a rounded pillow from the silhouette, then facial relief on top
    Hh = bevel(sil, 195, 205, smooth=16)
    Hh += both(72, -74, 62, 18, 27, -.10) + F.gauss(0, -64, 27, 22, 12)             # brow ridge
    Hh += F.gauss(0, -142, 130, 56, 7) + both(160, -96, 26, 50, -10)               # forehead, temples
    Hh += both(67, -17, 48, 26, -32)                                               # eye sockets
    eyes = np.zeros((H, W), np.float32)
    for i in (0, 1): eyes = np.maximum(eyes, lpoly(eye_pts(i)))
    S['eyes'] = eyes
    Hh += gblur(eyes, 5) * 16 + both(67, -31, 36, 6, 5) + both(67, 5, 36, 5, 5) + both(66, 24, 40, 9, 4)
    # cornea: a small sphere over each iris so the key light leaves a real catch-light
    R_sph = 42.0
    for i in (0, 1):
        c = F.pt(*iris_c(i))
        r2 = (X_ - c[0]) ** 2 + (Y_ - c[1]) ** 2
        cor = np.sqrt(np.clip(R_sph ** 2 - r2, 0, None)) - np.sqrt(R_sph ** 2 - (IRIS_R + 1) ** 2)
        Hh += np.clip(cor, 0, None) * smoothstep(0, 2, cor) * eyes
    # nose
    amp = 8 + 44 * smoothstep(-52, 66, v) ** 1.3
    wid = 21 + 13 * smoothstep(-40, 70, v)
    fade = smoothstep(-72, -42, v) * (1 - smoothstep(88, 106, v))
    Hh += amp * np.exp(-.5 * (u / wid) ** 2) * fade
    Hh += F.gauss(0, 85, 23, 19, 17) + both(35, 81, 14, 13, 13) + both(21, 99, 11, 7, -14) + F.gauss(0, 103, 24, 9, -9)
    # cheeks, jaw, mouth, chin
    Hh += both(118, 36, 48, 36, 15) + both(106, 78, 52, 46, 9) + both(152, 82, 28, 62, 6)
    Hh += F.gauss(0, 126, 56, 22, 11) + F.gauss(0, 149, 47, 3.2, -10) + F.gauss(0, 163, 34, 11, 9)
    Hh += F.gauss(0, 188, 38, 5, -8) + F.gauss(0, 224, 58, 34, 13)
    nl = Paint()                                                                   # nasolabial folds
    for sg in (1, -1): F.line(nl, [(sg * 44, 84), (sg * 56, 108), (sg * 74, 138)], 7)
    Hh -= gblur(nl.get(), 4) * 12
    fl = Paint()                                                                   # forehead lines
    F.line(fl, [(-80, -122), (-30, -126), (30, -126), (80, -122)], 3)
    F.line(fl, [(-70, -150), (0, -154), (70, -150)], 3)
    Hh -= gblur(fl.get(), 3) * 3.0
    Hh += gblur(beard, 5) * 8 + bevel(beard, 50, 9, smooth=6) + gblur(lpoly(MOUSTACHE), 5) * 8   # beard volume
    brow = np.maximum(lpoly(BROW_R), lpoly(BROW_L))
    S['brow'] = brow
    Hh += gblur(brow, 2) * 6

    # ---- ears (behind the head)
    ears = np.maximum(lpoly(EAR_R), lpoly(EAR_L))
    Hear = bevel(ears, 16, 30) + both(208, -12, 6, 14, -8) + both(207, -34, 5, 10, 5)
    S['ears'] = ears

    # ---- neck + shoulders
    neck = poly(NECK)
    Lp = spline(TORSO_L, closed=False, n=10)
    Rp = spline([(1200 - x, y) for x, y in TORSO_L][::-1], closed=False, n=10)
    torso = Paint().poly(np.vstack([Lp, Rp]), smooth=False).get()
    hole = poly(HOLE)
    shirt = np.clip(torso - hole, 0, 1)
    S.update(neck=neck, shirt=shirt, hole=hole)
    Hn = 92 * np.sqrt(np.clip(1 - ((X_ - 599) / 150) ** 2, 0, 1)) * neck
    scm = Paint()
    for sg in (-1, 1):
        scm.line(ty([(600 + sg * 130, 770), (600 + sg * 80, 890), (600 + sg * 30, 970)]), 32)
    Hn += gblur(scm.get(), 11) * 13 + gc(600, 935 + TY, 40, 40, -9)
    Hs = bevel(shirt, 260, 170, smooth=30)
    Hs += gc(478, 1100, 118, 70, 24) + gc(722, 1100, 118, 70, 24) + gc(600, 1110, 16, 90, -3.5)
    band = Paint().line(NECKLINE, 40).get() * shirt
    S['collar'] = band
    Hs += gblur(band, 2) * 9
    for sg in (-1, 1): Hs += gc(600 + sg * 170, 950 + TY, 80, 12, 5, sg * .22)
    Hb = Hs * shirt + Hn * (1 - shirt)
    Hb = np.where(shirt + neck > .02, Hb, 0).astype(np.float32)

    Hf = np.where(ears > .5, 55 + Hear, Hb)
    Hf = Hf * (1 - sil) + (Z_HEAD + Hh) * sil
    S['H'] = Hf.astype(np.float32)
    S['alpha'] = np.clip(np.maximum.reduce([sil, shirt, neck, ears]), 0, 1)
    print('sculpt %.1fs' % (time.time() - t0))
    return S


# -------------------------------------------------------------------------------------------------- paint
def to_local(x, y):
    dx, dy = x - F.cx, y - F.cy
    c, s = np.cos(F.a), np.sin(F.a)
    return c * dx + s * dy, -s * dx + c * dy


def loc_dir_to_canvas(dx, dy):
    c, s = np.cos(F.a), np.sin(F.a)
    return c * dx - s * dy, s * dx + c * dy


def strands(mask, n, flow, length, width, tones, seed, ss=2, thresh=.5, weight=None):
    """draw n hairs seeded inside mask, following flow(u, v) -> (du, dv).  Returns (value 0..1, coverage 0..1)"""
    rng = np.random.default_rng(seed)
    iv = Image.new('L', (W * ss, H * ss), 0); dv = ImageDraw.Draw(iv)
    ia = Image.new('L', (W * ss, H * ss), 0); da = ImageDraw.Draw(ia)
    ys, xs = np.nonzero(mask > thresh)
    if len(xs) == 0: return np.zeros((H, W), np.float32), np.zeros((H, W), np.float32)
    if weight is None:
        pick = rng.integers(0, len(xs), n)
    else:
        w = weight[ys, xs].astype(np.float64) + 1e-6
        pick = rng.choice(len(xs), n, p=w / w.sum())
    step = 3.0
    for k in pick:
        x = xs[k] + rng.random(); y = ys[k] + rng.random()
        Lh = rng.uniform(*length)
        pts = [(x, y)]
        for _ in range(max(2, int(Lh / step))):
            uu, vv = to_local(x, y)
            dx, dy = flow(uu, vv)
            dx, dy = loc_dir_to_canvas(dx, dy)
            a = np.arctan2(dy, dx) + rng.normal(0, .16)
            x += step * np.cos(a); y += step * np.sin(a)
            pts.append((x, y))
        P = [(px * ss, py * ss) for px, py in pts]
        wd = max(1, int(round(width * rng.uniform(.8, 1.3) * ss)))
        dv.line(P, fill=int(rng.uniform(*tones) * 255), width=wd)
        da.line(P, fill=255, width=wd)
    val = np.asarray(iv.resize((W, H), Image.BOX), np.float32) / 255
    cov = np.asarray(ia.resize((W, H), Image.BOX), np.float32) / 255
    return val, cov


def beard_flow(u, v):
    if 88 < v < 146 and abs(u) < 125:                              # moustache: out and down from the philtrum
        d = np.array([np.clip(u / 38, -1.6, 1.6), .62])
    elif v >= 150:                                                  # jaw + chin: down, converging on the chin
        d = np.array([-u * .0075, 1.0])
    else:                                                           # cheeks / sideburns
        d = np.array([-np.sign(u) * .22, 1.0])
    return d / np.linalg.norm(d)


def brow_flow(u, v):
    t = np.clip((abs(u) - 20) / 120, 0, 1)
    a = np.deg2rad(62 * (1 - t) ** 1.6 - 14 * t)
    return np.sign(u) * np.cos(a), -np.sin(a)


def put(A, mask, col):
    m = mask[..., None] if A.ndim == 3 else mask
    return A * (1 - m) + np.asarray(col, np.float32) * m


def paint(S):
    t0 = time.time()
    u, v = F.u, F.v
    skull, beard, sil, eyes = S['skull'], S['beard'], S['sil'], S['eyes']

    # ---------------------------------------------------------------- skin
    SK = rgb(190, 146, 118)
    skin = np.tile(SK, (H, W, 1)).astype(np.float32)

    def mul(m, c, a=1.0):
        nonlocal skin
        skin = skin * (1 + (np.array(c, np.float32) - 1) * np.clip(m * a, 0, 1)[..., None])

    mul(both(112, 40, 48, 40, 1), (1.04, .92, .90), .45)                       # cheek flush
    mul(F.gauss(0, 80, 38, 32, 1) + both(34, 80, 16, 14, .6), (1.06, .86, .84), .55)   # nose
    mul(F.gauss(0, -125, 100, 50, 1), (1.02, 1.0, .95), .6)                   # forehead
    mul(both(68, 10, 36, 11, 1), (.92, .86, .88), .55)                        # under-eye
    mul(both(68, -33, 40, 15, 1), (.96, .90, .88), .45)                       # lids
    mul(F.gauss(0, 190, 70, 40, 1), (.92, .85, .84), .4)                      # beard shadow under mouth
    lf = noise(38, 1) * .035 + noise(9, 2) * .022
    skin = skin * (1 + np.dstack([lf, lf * .85, lf * .7]))
    # scalp: shaved, so a bluish stubble shadow across the old hairline
    hz = gblur(lpoly(HAIRZONE), 9)
    dots = smoothstep(.7, 1.5, noise(.55, 31))
    stub = np.clip(hz * (.22 + .50 * dots), 0, .8)
    skin = skin * (1 - stub[..., None] * (1 - np.array([.45, .46, .55], np.float32)))
    # transition band along the trimmed beard line
    band = np.clip(gblur(beard, 7) - beard * .6, 0, 1) * (1 - beard)
    sdots = smoothstep(.2, 1.0, noise(.8, 32))
    skin = skin * (1 - (band * (.38 + .35 * sdots))[..., None] * (1 - np.array([.55, .58, .66], np.float32)))

    A = np.zeros((H, W, 3), np.float32)
    G = np.zeros((H, W), np.float32)          # gloss amount
    SH = np.full((H, W), 20, np.float32)      # specular exponent
    SKN = np.zeros((H, W), np.float32)        # subsurface weight
    TH = np.zeros((H, W), np.float32)         # thin / translucent

    # ---------------------------------------------------------------- shirt
    shirt = S['shirt']
    cloth = np.tile(rgb(34, 34, 38), (H, W, 1)).astype(np.float32)
    weave = noise(.7, 41) * .04 + noise(2.2, 42) * .03
    cloth = cloth * (1 + weave[..., None])
    ang = np.arctan2(Y_ - (930 + TY), X_ - 600)
    ribs = .78 + .22 * np.sin(ang * 260)
    cloth = put(cloth, S['collar'], cloth * ribs[..., None] * .85)
    A = put(A, shirt, cloth)
    G = put(G, shirt, .14); SH = put(SH, shirt, 9.0)

    # ---------------------------------------------------------------- neck + chest skin
    neckskin = skin * np.array([.95, .90, .90], np.float32)
    A = put(A, np.clip(S['neck'] * (1 - shirt), 0, 1), neckskin)
    G = put(G, np.clip(S['neck'] * (1 - shirt), 0, 1), .22)
    SH = put(SH, np.clip(S['neck'] * (1 - shirt), 0, 1), 30.0)
    SKN = put(SKN, np.clip(S['neck'] * (1 - shirt), 0, 1), 1.0)

    # ---------------------------------------------------------------- ears
    ears = S['ears']
    earskin = skin * np.array([1.04, .84, .80], np.float32)
    A = put(A, ears, earskin)
    G = put(G, ears, .16); SH = put(SH, ears, 24.0); SKN = put(SKN, ears, 1.0); TH = put(TH, ears, 1.0)

    # ---------------------------------------------------------------- head skin
    A = put(A, skull, skin)
    oily = (.14 + .20 * F.gauss(0, -125, 95, 46, 1) + .38 * F.gauss(0, 20, 20, 70, 1) + .22 * F.gauss(0, 90, 30, 18, 1)
            + .14 * both(118, 38, 40, 30, 1) + .16 * F.gauss(0, -205, 110, 40, 1))
    G = put(G, sil, np.clip(oily, 0, 1))
    SH = put(SH, sil, 34.0)
    SKN = put(SKN, sil, 1.0)

    # ---------------------------------------------------------------- nostrils, lips, mouth, eyes
    for sg in (1, -1):
        m = Paint(); F.ellipse(m, sg * 15, 97, 10.5, 5.5, rot=-sg * .35)
        A = put(A, gblur(m.get(), 1.0) * .9, rgb(26, 12, 10))
    lip = gblur(lpoly(LIP), .9)
    lipup = gblur(lpoly(LIP_UP), .9)
    lipcol = rgb(150, 84, 74)
    A = put(A, lipup * (1 - beard), rgb(136, 76, 68))
    A = put(A, lip, lipcol)
    G = put(G, np.maximum(lip, lipup), .55); SH = put(SH, np.maximum(lip, lipup), 55.0)
    ml = Paint()
    F.line(ml, [(-50, 150), (-26, 148), (0, 150), (26, 148), (50, 150)], 3.4)
    A = put(A, gblur(ml.get(), 1.0) * .85 * (1 - beard), rgb(56, 26, 24))
    mc = Paint()
    F.line(mc, [(-52, 144), (-60, 140)], 3); F.line(mc, [(52, 144), (60, 140)], 3)

    # eyes
    sclera_c = rgb(190, 177, 165)
    iris_n = noise(1.2, 51)
    pol = noise(3.5, 52)
    for i in (0, 1):
        sg = 1 if i == 0 else -1
        op = lpoly(eye_pts(i))
        ic = iris_c(i)
        cc = F.pt(*ic)
        r = np.sqrt((X_ - cc[0]) ** 2 + (Y_ - cc[1]) ** 2) / IRIS_R
        th = np.arctan2(Y_ - cc[1], X_ - cc[0])
        # sclera: warmer, veined toward the corners, darker where the lids sit close
        inner = np.clip(gblur(op, 3.2), 0, 1)
        scl = np.tile(sclera_c, (H, W, 1)) * (.55 + .45 * inner[..., None] ** .8)
        veins = np.clip(noise(1.5, 53 + i), 0, 3) * .04
        scl = scl * (1 - veins[..., None] * np.array([0, 1.2, 1.4], np.float32))
        A = put(A, op, scl)
        # iris: radial fibres, amber collarette, dark limbal ring
        fib = .5 + .25 * iris_n + .22 * np.sin(th * 34 + pol * 3)
        base = np.array(rgb(66, 40, 25)) * (.55 + .9 * fib[..., None])
        collar = np.exp(-((r - .42) / .14) ** 2)[..., None] * np.array(rgb(104, 68, 36)) * .8
        iris = base + collar
        iris = iris * (1 - .70 * smoothstep(.72, 1.0, r))[..., None]
        iris = iris * (.45 + .55 * smoothstep(0, .25, r))[..., None]
        disc = np.clip((1 - r) * IRIS_R, 0, 1)                                      # anti-aliased disc
        A = put(A, op * disc, iris)
        pup = np.clip((PUPIL_R / IRIS_R - r) * IRIS_R, 0, 1)
        A = put(A, op * pup, rgb(6, 4, 4))
        # upper lid casts a soft shadow across the eyeball
        shift = np.roll(op, 8, axis=0)
        lid = gblur(np.clip(op - shift, 0, 1), 2.5)
        A = A * (1 - (lid * .62)[..., None] * op[..., None])
        # lash line, lower lid line, inner-corner caruncle
        pts = eye_pts(i)
        up = Paint(); F.line(up, pts[:6] + [(pts[5][0] + sg * 4, pts[5][1] - 3)], 3.6)
        A = put(A, gblur(up.get(), .9) * .95, rgb(22, 12, 10))
        lo = Paint(); F.line(lo, pts[6:] + [pts[0]], 1.8)
        A = put(A, gblur(lo.get(), .9) * .45, rgb(95, 52, 44))
        cr = Paint(); F.ellipse(cr, pts[0][0] + sg * 3, pts[0][1], 4.5, 3.2)
        A = put(A, gblur(cr.get(), .8) * .8, rgb(176, 96, 88))
        crease = Paint(); F.line(crease, [(EYE_C[i][0] - sg * 36, -26), (EYE_C[i][0] - sg * 8, -37),
                                          (EYE_C[i][0] + sg * 26, -37), (EYE_C[i][0] + sg * 46, -26)], 2.6)
        A = A * (1 - gblur(crease.get(), 1.2)[..., None] * .35)
        G = put(G, op, .75); SH = put(SH, op, 130.0); SKN = put(SKN, op, 0.0)
        G = put(G, op * disc, 1.0); SH = put(SH, op * disc, 420.0)

    # ---------------------------------------------------------------- hair: brows
    brow = S['brow']
    bval, bcov = strands(brow, 3000, brow_flow, (9, 16), 1.3, (.02, .22), 61)
    bcov = np.maximum(bcov * .95, gblur(brow, .8))
    A = put(A, bcov, np.array(rgb(20, 15, 12))[None, None] * (.4 + 3.6 * bval[..., None]) * (bcov[..., None] > 0))
    G = put(G, bcov, .05); SH = put(SH, bcov, 22.0); SKN = put(SKN, bcov, 0.0)

    # ---------------------------------------------------------------- hair: beard + moustache
    # the beard thins out toward its trimmed edge instead of stopping at a hard line
    dd = edt(beard)
    thin = smoothstep(0, 20, dd) ** .8
    lipsoft = np.clip(gblur(S['lipcut'], 1.2) * 1.4, 0, 1)
    area = max(1, int((beard > .5).sum()))
    n = int(area * .55)
    cv = np.zeros((H, W), np.float32); vv_ = np.zeros((H, W), np.float32)
    for k, (ln, wd, tones, seed) in enumerate([((22, 44), 1.5, (.02, .16), 71), ((14, 30), 1.3, (.05, .34), 72),
                                               ((10, 22), 1.2, (.10, .52), 73)]):
        val, cov = strands(beard, n // 3 if k else n // 2, beard_flow, ln, wd, tones, seed, weight=thin + .04)
        m = cov > .02
        vv_ = np.where(m, val, vv_); cv = np.maximum(cv, cov)
    cv = cv * (1 - lipsoft)                                    # no hair across the lips
    bfill = beard * thin
    bcol = np.array(rgb(34, 26, 23), np.float32)
    shade = (.55 + 2.1 * vv_)[..., None]
    hair = np.tile(bcol, (H, W, 1)) * shade
    hair = hair * (1 + (noise(2.0, 74) * .10)[..., None] * np.array([1.0, .7, .4], np.float32))
    # where there is no skull underneath (jaw hanging below the chin) the beard is opaque hair
    under = beard * (1 - skull)
    bcover = np.clip(np.maximum.reduce([bfill * .95, cv, under]), 0, 1)
    A = put(A, bcover, hair)
    G = put(G, bcover, .26 + .25 * vv_); SH = put(SH, bcover, 30.0); SKN = put(SKN, bcover, 0.0)
    # stubble shadow where the beard fades into bare skin
    zone = np.clip(gblur(beard, 8) * 1.5, 0, 1) * (1 - bcover)
    A = A * (1 - (zone * (.30 + .30 * dots))[..., None] * (1 - np.array([.62, .64, .72], np.float32)))
    S['alpha'] = np.clip(np.maximum.reduce([skull, S['shirt'], S['neck'], S['ears'], bfill, cv, under]), 0, 1)
    S['headalpha'] = np.clip(np.maximum.reduce([skull, S['ears'], bfill, cv, under]), 0, 1)

    # ---------------------------------------------------------------- micro relief (pores, hairs, weave)
    pores = noise(.9, 21) * .55 + noise(2.0, 22) * .45
    bumpf = (pores * 1.0 * (SKN > .5) * (1 - bcover) + gblur(vv_, .6) * 7.0 * bcover
             + (noise(.8, 23) * .35 + noise(2.5, 24) * .25) * (shirt > .5) + gblur(bval, .6) * 4 * bcov)
    gy, gx = np.gradient(bumpf.astype(np.float32))
    bump = (gx * .30, gy * .30)

    # hairs poking out past the silhouette need some height to catch light
    S['H'] = np.maximum(S['H'], cv * (Z_HEAD + 6)).astype(np.float32)
    print('paint %.1fs' % (time.time() - t0))
    return dict(albedo=A, gloss=G, shin=SH, skin=SKN, thin=TH, bump=bump)


# ------------------------------------------------------------------------------------------------ lights
LIGHTS = dict(
    key=dict(dir=(-.82, -.40, .42), col=(1.00, .91, .80), i=2.3, soft=.20),
    fill=dict(dir=(.70, -.05, .70), col=(.58, .70, 1.00), i=.40, soft=.4),
    front=dict(dir=(.05, -.18, 1.0), col=(.95, .90, .88), i=.20, soft=.5),
    rim=dict(dir=(.88, -.28, -.38), col=(.80, .90, 1.00), i=3.4, soft=.06),
    kick=dict(dir=(-.90, -.12, -.42), col=(1.00, .80, .62), i=1.4, soft=.06),
)
AMBIENT = np.array([.030, .040, .058], np.float32)
EXPOSURE = .36


def light(S, M):
    t0 = time.time()
    Hf = S['H']
    N = normals(Hf, M.get('bump'))
    ao = occlusion(Hf)
    alb = M['albedo']
    skin = M['skin'][..., None]
    gloss = M['gloss']; shin = M['shin']
    V = np.array([0, 0, 1], np.float32)
    out = alb * AMBIENT * ao[..., None] * (.6 + .4 * N[..., 2:3])
    for name, L in LIGHTS.items():
        d = unit(L['dir'])
        vis = cast_shadow(Hf, d, soft=L.get('soft', .1), seed=sum(map(ord, name)),
                          samples=9 if L['i'] > 1 else 4, reach=300 if name == 'key' else 200) if name != 'front' else np.ones_like(Hf)
        ndl = (N * d).sum(-1)
        col = np.array(L['col'], np.float32) * L['i']
        # skin: red light travels furthest under the surface, so the terminator is warm and soft
        wrap = np.array([.45, .22, .10], np.float32) * skin * {'key': 1.0, 'fill': .6, 'front': .6}.get(name, .2)
        dif = np.clip((ndl[..., None] + wrap) / (1 + wrap), 0, 1)
        if L['dir'][2] < 0:                                   # edge lights only graze the silhouette
            dif = dif * ((1 - N[..., 2]) ** 1.6)[..., None]
        aoK = ao ** (.5 if name == 'key' else .3)
        out = out + alb * dif * (vis * aoK)[..., None] * col
        # specular: broad sheen + tight highlight, Schlick fresnel
        hv = unit(d + V)
        ndh = np.clip((N * hv).sum(-1), 0, 1)
        vdh = np.clip(hv[2], 0, 1)
        fres = .03 + .97 * (1 - vdh) ** 5
        sp = (ndh ** shin * (shin + 2) / 8 + .35 * ndh ** (shin * .22) * (shin * .22 + 2) / 8) * gloss * (.5 + 4 * fres)
        sp = sp * (ndl > 0) * vis * ao
        out = out + sp[..., None] * col * .12
        # thin parts (ears) glow red when lit from behind
        if 'thin' in M and L['dir'][2] < 0:
            back = np.clip(-(N * unit((-L['dir'][0], -L['dir'][1], L['dir'][2]))).sum(-1), 0, 1)
            out = out + (M['thin'] * back * vis)[..., None] * np.array([.8, .22, .08], np.float32) * L['i'] * .35 * alb
    S['_ao'] = ao; S['_N'] = N
    print('light %.1fs' % (time.time() - t0))
    return out * EXPOSURE


def finish(lin, S, bg, grade=True, vig=True):
    t0 = time.time()
    x = lin * 1.0
    br = np.clip(x - .9, 0, None)
    x = x + (gblur(br, 5) * .25 + gblur(br, 22) * .20)
    a = S['alpha'][..., None]
    x = x * a + bg * (1 - a)
    x = tonemap(x)
    s = l2s(x)
    if grade:
        l = (s * [.299, .587, .114]).sum(-1, keepdims=True)
        s = s + (np.array([.10, .17, .24]) - .5) * .10 * (1 - l) ** 2 + (np.array([1, .85, .66]) - .5) * .08 * l ** 2
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
        r = np.sqrt(((xx - W / 2) / (W * .62)) ** 2 + ((yy - H * .45) / (H * .66)) ** 2)
        if vig: s = s * (1 - .38 * smoothstep(.5, 1.25, r))[..., None]
        rng = np.random.default_rng(5)
        s = s + (rng.standard_normal((H, W)).astype(np.float32) * .012)[..., None] * (1 - .5 * l)
    print('finish %.1fs' % (time.time() - t0))
    return np.clip(s, 0, 1)


def backdrop():
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    r = np.sqrt(((xx - 700) / 720) ** 2 + ((yy - 430) / 760) ** 2)
    k = np.exp(-r ** 2 * 1.5)[..., None]
    far = rgb(10, 13, 18); near = rgb(78, 92, 108)
    return far * (1 - k) + near * k


def save(img, path):
    Image.fromarray((np.clip(img, 0, 1) * 255 + .5).astype(np.uint8)).save(path)


def crop_view(img, box, path, scale=2):
    x0, y0, x1, y1 = box
    im = Image.fromarray((np.clip(img[y0:y1, x0:x1], 0, 1) * 255 + .5).astype(np.uint8))
    im = im.resize(((x1 - x0) * scale, (y1 - y0) * scale), Image.LANCZOS)
    im.save(path)


if __name__ == '__main__':
    mode = sys.argv[1] if len(sys.argv) > 1 else 'full'
    S = sculpt()
    if mode == 'bake':                      # head layers for the full-body poses (body.py)
        M = paint(S)
        np.savez_compressed(os.path.join(SCR, 'head_layers.npz'), H=S['H'], headalpha=S['headalpha'],
                            albedo=M['albedo'], gloss=M['gloss'], shin=M['shin'], skin=M['skin'], thin=M['thin'],
                            bx=M['bump'][0], by=M['bump'][1])
        print('baked head layers')
        sys.exit(0)
    if mode == 'clay':
        M = dict(albedo=np.dstack([np.full((H, W), .42, np.float32)] * 3) * np.array([1, .9, .8], np.float32),
                 skin=np.ones((H, W), np.float32), gloss=np.full((H, W), .5, np.float32),
                 shin=np.full((H, W), 40, np.float32))
        save(finish(light(S, M), S, backdrop()), os.path.join(SCR, 'clay.png'))
    else:
        M = paint(S)
        save(np.clip(l2s(M['albedo']), 0, 1), os.path.join(SCR, 'albedo.png'))
        lin = light(S, M)
        img = finish(lin, S, backdrop())
        save(img, os.path.join(SCR, 'full.png'))
        crop_view(img, (330, 230, 870, 830), os.path.join(SCR, 'face.png'), 2)
        if mode == 'final':
            save(img, os.path.join(HERE, 'khabib.png'))
            cut = finish(lin, S, lin, vig=False)
            rgba = np.dstack([cut, np.clip(S['alpha'], 0, 1)])
            Image.fromarray((rgba * 255 + .5).astype(np.uint8), 'RGBA').save(os.path.join(HERE, 'khabib_cutout.png'))
            print('wrote khabib.png + khabib_cutout.png')
