#!/usr/bin/env bash
# Full render of a film page in N parallel CPU renderers (each its own headless Chromium; CPU raster is deterministic).
# Usage: _tools/render_film.sh <page> <out dir> [workers=3] [from=0] [to=last frame of the page]
#   _tools/render_film.sh _render/video/main21.html _render/frames33a 3
set -u
PAGE=$1; OUT=$2; N=${3:-3}; FROM=${4:-0}
cd "$(dirname "$0")/.."
TO=${5:-$(( $(grep -o 'VIDEO_FRAMES = [0-9]*' "$PAGE" | grep -o '[0-9]*$') - 1 ))}
mkdir -p "$OUT" "$OUT/logs"
# interleaved ranges (frame n goes to worker n % N) keep every worker busy on light and heavy shots alike
for ((w = 0; w < N; w++)); do
  LIST=$(seq $((FROM + w)) $N $TO | paste -sd, -)
  node _tools/cdp.cjs --page "$PAGE" --list "$LIST" --out "$OUT" --quality 98 > "$OUT/logs/w$w.log" 2>&1 &
done
wait
echo "done: $(ls "$OUT"/f*.jpg | wc -l) frames in $OUT"
