import sys
from PIL import Image, ImageDraw
# usage: strip.py out.jpg w file1 file2 ...   (thumbnails of width w, side by side, labelled)
out, w, files = sys.argv[1], int(sys.argv[2]), sys.argv[3:]
h = int(w * 1920 / 1080)
W = Image.new('RGB', (w * len(files), h + 30), (20, 20, 20))
d = ImageDraw.Draw(W)
for i, f in enumerate(files):
    im = Image.open(f).convert('RGB').resize((w, h))
    W.paste(im, (i * w, 30))
    d.text((i * w + 6, 8), f.split('/')[-1], fill=(255, 255, 0))
W.save(out, quality=88)
