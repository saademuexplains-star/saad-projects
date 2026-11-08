"""Contact sheets and crops (Linux / macOS stand-in for sheet.ps1 / sheetr.ps1).

  python3 -I _tools/sheet.py --dir _render/test --out /tmp/sheet.jpg [--cols 4] [--tile 270x480] [--frames 30,90]
  python3 -I _tools/sheet.py --crop _render/test/f00030.jpg --box 300,900,780,1500 --out /tmp/crop.jpg [--scale 1]

Tiles every .jpg/.png in --dir (or only the listed frames) in name order, each labelled with its file name.
"""
import argparse
import os
import sys

from PIL import Image, ImageDraw


def sheet(a):
    names = sorted(n for n in os.listdir(a.dir) if n.lower().endswith(('.jpg', '.png')))
    if a.frames:
        want = {f'f{int(x):05d}' for x in a.frames.split(',')}
        names = [n for n in names if os.path.splitext(n)[0] in want]
    if not names:
        sys.exit('no frames')
    tw, th = (int(v) for v in a.tile.split('x'))
    cols = min(a.cols, len(names))
    rows = (len(names) + cols - 1) // cols
    pad = 6
    out = Image.new('RGB', (cols * (tw + pad) + pad, rows * (th + pad + 18) + pad), (24, 20, 18))
    d = ImageDraw.Draw(out)
    for i, n in enumerate(names):
        im = Image.open(os.path.join(a.dir, n)).convert('RGB').resize((tw, th), Image.LANCZOS)
        x = pad + (i % cols) * (tw + pad)
        y = pad + (i // cols) * (th + pad + 18)
        out.paste(im, (x, y))
        d.text((x + 4, y + th + 3), os.path.splitext(n)[0], fill=(220, 210, 190))
    out.save(a.out, quality=92)
    print(a.out, out.size)


def crop(a):
    im = Image.open(a.crop).convert('RGB')
    x0, y0, x1, y1 = (int(v) for v in a.box.split(','))
    c = im.crop((x0, y0, x1, y1))
    if a.scale != 1:
        c = c.resize((int(c.width * a.scale), int(c.height * a.scale)), Image.LANCZOS)
    c.save(a.out, quality=94)
    print(a.out, c.size)


p = argparse.ArgumentParser()
p.add_argument('--dir')
p.add_argument('--out', required=True)
p.add_argument('--cols', type=int, default=4)
p.add_argument('--tile', default='270x480')
p.add_argument('--frames')
p.add_argument('--crop')
p.add_argument('--box')
p.add_argument('--scale', type=float, default=1.0)
a = p.parse_args()
crop(a) if a.crop else sheet(a)
