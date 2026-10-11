# Split rig parts: leg -> upper/lower at knee; claws -> hand + dactyl (moving finger). Same canvas size so they recombine.
import numpy as np, cv2
from PIL import Image
def load(n): return np.array(Image.open(f'assets/{n}.png').convert('RGBA')).astype(np.float32)
def save(a, n): Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).save(f'assets/{n}.png')
# leg: knee pivot (420,45); upper keeps x<440 (feather 425..440), lower keeps x>395
leg = load('leg'); h, w = leg.shape[:2]; xx = np.arange(w)[None, :].repeat(h, 0)
up = leg.copy(); up[..., 3] *= np.clip((440 - xx) / 15, 0, 1)
lo = leg.copy(); lo[..., 3] *= np.clip((xx - 395) / 6, 0, 1)
save(up, 'legU'); save(lo, 'legL')
def split(name, poly, out):
    a = load(name); h, w = a.shape[:2]
    m = np.zeros((h, w), np.uint8); cv2.fillPoly(m, [np.array(poly, np.int32)], 255)
    m = cv2.GaussianBlur(m.astype(np.float32), (5, 5), 0) / 255
    d = a.copy(); d[..., 3] *= m
    hnd = a.copy(); hnd[..., 3] *= (1 - m)
    for arr in (d, hnd):   # keep only the main piece, drop slivers
        mm = (arr[..., 3] > 40).astype(np.uint8)
        n, lab, st, _ = cv2.connectedComponentsWithStats(mm, 8)
        big = 1 + st[1:, cv2.CC_STAT_AREA].argmax()
        keep = cv2.dilate((lab == big).astype(np.uint8), np.ones((5, 5)))
        arr[..., 3] *= keep
    save(d, out + '_dac'); save(hnd, out + '_hand')
split('clawR', [(0,335),(0,280),(40,200),(90,140),(150,100),(220,82),(268,92),(280,150),(255,192),(215,197),(170,203),(120,233),(70,283),(30,340)], 'clawR')
split('clawL', [(620,76),(700,78),(782,101),(848,148),(880,232),(876,266),(866,270),(848,258),(824,222),(800,206),(770,197),(720,191),(670,194),(632,184)], 'clawL')
print('ok')
