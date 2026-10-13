#!/usr/bin/env bash
# shots.sh outdir t1,t2,... : render chosen times of the real project (flat + normal + shade) and a contact sheet
cd "$(dirname "$0")/.."
B=$1; TIMES=$2
mkdir -p $B
NODE_PATH=$(npm root -g) node tools/errs.cjs index.html
NODE_PATH=$(npm root -g) node tools/test_times.cjs index.html $B $TIMES 2>&1 | grep -v "^\s*$" | tail -3
python3 tools/test_shade.py $B > /dev/null
python3 - "$B" "$TIMES" <<'PY'
import sys
from PIL import Image, ImageDraw
B, T = sys.argv[1], sys.argv[2].split(',')
ims = [Image.open(f'{B}/lit_{float(t):.2f}.jpg').resize((270, 480)) for t in T]
cols = min(6, len(ims)); rows = (len(ims) + cols - 1) // cols
sheet = Image.new('RGB', (cols * 270, rows * 480), 'black'); d = ImageDraw.Draw(sheet)
for i, (im, t) in enumerate(zip(ims, T)):
    x, y = (i % cols) * 270, (i // cols) * 480; sheet.paste(im, (x, y)); d.text((x + 6, y + 6), t, fill='yellow')
sheet.save(f'{B}/sheet.jpg', quality=88)
PY
