#!/usr/bin/env bash
# Render a list of frames (comma-separated, in a file) in N parallel CPU renderers. Usage: render_list.sh <out dir> <list file> [workers=3]
set -u
OUT=$1; LISTF=$2; N=${3:-3}
cd "$(dirname "$0")/.."
mkdir -p "$OUT/logs"
python3 - "$LISTF" "$N" "$OUT" <<'PY'
import sys
fr=[int(x) for x in open(sys.argv[1]).read().strip().split(',') if x]
n=int(sys.argv[2]); out=sys.argv[3]
for w in range(n):
    open(f'{out}/logs/list{w}.txt','w').write(','.join(map(str,fr[w::n])))
PY
for ((w = 0; w < N; w++)); do
  L=$(cat "$OUT/logs/list$w.txt"); [ -z "$L" ] && continue
  node _tools/cdp.cjs --page _render/video/main20.html --list "$L" --out "$OUT" --quality 98 > "$OUT/logs/r$w.log" 2>&1 &
done
wait
echo "done: $(ls "$OUT"/f*.jpg | wc -l) frames in $OUT"
