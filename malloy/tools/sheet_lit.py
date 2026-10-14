import sys, glob
from PIL import Image, ImageDraw
d, out = sys.argv[1], sys.argv[2]; cols = int(sys.argv[3]) if len(sys.argv) > 3 else 8
fs = sorted(glob.glob(f'{d}/lit_*.jpg'), key=lambda f: float(f.split('lit_')[1][:-4]))
w, h = 180, 320; rows = (len(fs) + cols - 1) // cols
W = Image.new('RGB', (w * cols, (h + 18) * rows), (16, 16, 16)); D = ImageDraw.Draw(W)
for i, f in enumerate(fs):
    x, y = (i % cols) * w, (i // cols) * (h + 18)
    W.paste(Image.open(f).resize((w, h)), (x, y + 18)); D.text((x + 4, y + 3), f.split('lit_')[1][:-4], fill=(255, 220, 0))
W.save(out, quality=88)
