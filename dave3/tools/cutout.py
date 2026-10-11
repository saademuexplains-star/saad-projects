# White/grey studio background removal with soft edges + color decontamination.
# python3 cutout.py src.jpg out.png [mode=solid|keepholes] [tlo] [thi]
import sys, cv2, numpy as np
src, out = sys.argv[1], sys.argv[2]
mode = sys.argv[3] if len(sys.argv) > 3 else 'solid'
tlo = float(sys.argv[4]) if len(sys.argv) > 4 else 14
thi = float(sys.argv[5]) if len(sys.argv) > 5 else 46
I = cv2.imread(src).astype(np.float32)
h, w = I.shape[:2]
L = I.mean(2); chroma = I.max(2) - I.min(2)
cand = (L > 175) & (chroma < 28)
yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
X = np.stack([np.ones_like(xx), xx/w, yy/h, (xx/w)**2, (yy/h)**2, xx*yy/(w*h)], -1)
sel = cand.copy(); sel[16:-16, 16:-16] &= (np.random.rand(h-32, w-32) < 0.15)
A = X[sel]; B = np.zeros_like(I)
for c in range(3):
    coef, *_ = np.linalg.lstsq(A, I[..., c][sel], rcond=None)
    B[..., c] = X @ coef
d = np.sqrt(((I - B) ** 2).sum(2))
if mode == 'chroma': d = chroma * 1.6
d = cv2.GaussianBlur(d, (3, 3), 0)
low = (d < tlo).astype(np.uint8)
n, lab = cv2.connectedComponents(low, connectivity=4)
border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
bg = np.isin(lab, list(border))
if mode == 'solid':   # also drop large enclosed bright pockets (gaps between legs)
    for i in range(1, n):
        if i in border: continue
        m = lab == i
        if m.sum() > 60 and L[m].mean() > 170: bg |= m
if mode == 'chroma':   # big enclosed pure-white pockets are background seen through gaps
    for i in range(1, n):
        if i in border: continue
        m = lab == i
        if m.sum() > 0.006 * h * w and L[m].mean() > 232: bg |= m
fg = ~bg
# soft alpha near the boundary only
a = np.clip((d - tlo) / (thi - tlo), 0, 1)
dist_in = cv2.distanceTransform(fg.astype(np.uint8), cv2.DIST_L2, 3)
alpha = np.where(dist_in > 3, 1.0, a) * fg
alpha = cv2.GaussianBlur(alpha.astype(np.float32), (3, 3), 0) * (cv2.dilate(fg.astype(np.uint8), np.ones((3,3)))>0)
# drop specks
m8 = (alpha > 0.5).astype(np.uint8)
n2, lab2, st, _ = cv2.connectedComponentsWithStats(m8, 8)
if n2 > 1:
    keep = np.zeros(n2, bool); big = st[1:, cv2.CC_STAT_AREA].max()
    keep[1:] = st[1:, cv2.CC_STAT_AREA] > max(80, big * 0.004)
    km = cv2.dilate(keep[lab2].astype(np.uint8), np.ones((5,5)))
    alpha *= km
ae = alpha[..., None]
C = np.where(ae > 0.03, B + (I - B) / np.maximum(ae, 0.03), I)
C = np.clip(C, 0, 255)
# --- defringe: edge pixels take colour from the solid interior, bright halo pixels are killed, alpha choked
solid = (alpha > 0.97).astype(np.float32)
solid_core = cv2.erode(solid, np.ones((3, 3)))
num = cv2.GaussianBlur(C * solid_core[..., None], (0, 0), 3)
den = cv2.GaussianBlur(solid_core, (0, 0), 3)[..., None]
interior = num / np.maximum(den, 1e-4)
gmean = C[alpha > 0.97].mean(0) if (alpha > 0.97).any() else np.array([128, 128, 128.])
far = den[..., 0] <= 0.02
interior = np.where(far[..., None], gmean[None, None, :] * (0.75 + 0.5 * (I.mean(2, keepdims=True) / 255)), interior)
edge = (alpha < 0.97) & (alpha > 0)
w_int = np.clip(1.15 - alpha, 0, 1)[..., None]           # the more transparent, the more interior colour
C = np.where(edge[..., None], C * (1 - w_int) + interior * w_int, C)
Lc = C.mean(2); Li = interior.mean(2)
halo = edge & (Lc > Li + 22) & ((C.max(2) - C.min(2)) < 30)
alpha = np.where(halo, alpha * 0.25, alpha)
alpha = np.clip((alpha - 0.12) / 0.88, 0, 1)             # choke
# 1px erosion of the outermost ring
ring = (alpha > 0) & (cv2.erode((alpha > 0).astype(np.uint8), np.ones((3, 3))) == 0)
alpha = np.where(ring, alpha * 0.5, alpha)
if mode == 'keepholes':   # translucent subject: thin parts get white->alpha so bristles never read white
    m = (alpha > 0.5).astype(np.uint8)
    thick = cv2.dilate(cv2.morphologyEx(m, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (31, 31))), np.ones((5, 5)))
    thin = (alpha > 0) & (thick == 0)
    c2a = np.clip((255 - I.min(2)) / 255 * 1.6, 0, 1)
    tw = cv2.GaussianBlur(thin.astype(np.float32), (0, 0), 2)
    alpha = alpha * (1 - tw) + np.minimum(alpha, c2a) * tw
    tint = gmean * 1.05
    whiteish = np.clip((I.min(2) - 150) / 80, 0, 1)[..., None] * tw[..., None]
    C = C * (1 - whiteish) + tint[None, None, :] * whiteish
    C = np.clip(C, 0, 255)
rgba = np.dstack([C, alpha * 255]).astype(np.uint8)
ys, xs = np.where(alpha > 0.02)
y0, y1, x0, x1 = max(ys.min()-4, 0), min(ys.max()+5, h), max(xs.min()-4, 0), min(xs.max()+5, w)
cv2.imwrite(out, rgba[y0:y1, x0:x1])
print(f"{out} bbox={x0},{y0},{x1},{y1} size={x1-x0}x{y1-y0}")
