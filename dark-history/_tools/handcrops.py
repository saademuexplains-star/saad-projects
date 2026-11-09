"""Hand audit, step 3: every hand from _tools/handaudit.js, cropped from the rendered frames (wrist to elbow plus a
margin), labelled with frame and shot, 20 to a sheet, for a full-size review of every hand before a delivery.
  python3 -I _tools/handcrops.py hands.json <frames dir> <out dir>
"""
import json, sys, os
from PIL import Image, ImageDraw
AUD, FR, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
d = json.load(open(AUD))
crops = []
for n, sid, hands in d:
    p = f'{FR}/f{n:05d}.jpg'
    if not os.path.exists(p) or not hands: continue
    im = Image.open(p)
    for i, (wx, wy, ex, ey, L) in enumerate(hands):
        if not (-L * 0.3 < wx < 1080 + L * 0.3 and -L * 0.3 < wy < 1920 + L * 0.3): continue
        x0, x1 = min(wx, ex) - 0.8 * L, max(wx, ex) + 0.8 * L
        y0, y1 = min(wy, ey) - 0.8 * L, max(wy, ey) + 0.8 * L
        # square-ish
        cx, cy, half = (x0 + x1) / 2, (y0 + y1) / 2, max(x1 - x0, y1 - y0) / 2
        b = [int(max(0, cx - half)), int(max(0, cy - half)), int(min(1080, cx + half)), int(min(1920, cy + half))]
        if b[2] - b[0] < 40 or b[3] - b[1] < 40: continue
        c = im.crop(b)
        sc = 300 / max(c.size)
        c = c.resize((max(1, int(c.width * sc)), max(1, int(c.height * sc))))
        crops.append((f'{n} {sid} #{i}', c))
cols, cw, ch = 5, 300, 320
per = 20
os.makedirs(OUT, exist_ok=True)
for k in range(0, len(crops), per):
    page = crops[k:k + per]
    rows = (len(page) + cols - 1) // cols
    sheet = Image.new('RGB', (cols * cw, rows * ch), (30, 30, 30))
    dr = ImageDraw.Draw(sheet)
    for j, (lab, c) in enumerate(page):
        x, y = (j % cols) * cw, (j // cols) * ch
        sheet.paste(c, (x, y + 20)); dr.text((x + 4, y + 3), lab, fill=(255, 255, 0))
    sheet.save(f'{OUT}/hands_{k // per:02d}.jpg', quality=88)
print(len(crops), 'crops')
