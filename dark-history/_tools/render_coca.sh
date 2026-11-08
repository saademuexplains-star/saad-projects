#!/usr/bin/env bash
# Full render of the Coca-Cola video in N parallel CPU renderers (each its own headless Chromium; CPU raster is
# deterministic, unlike the GPU raster the Windows notes warn about - checked by rendering every frame twice and
# comparing). Usage: _tools/render_coca.sh <out dir> [workers=3] [from=0] [to=2839]
set -u
OUT=$1; N=${2:-3}; FROM=${3:-0}; TO=${4:-2839}
cd "$(dirname "$0")/.."
mkdir -p "$OUT" "$OUT/logs"
# interleaved ranges (frame n goes to worker n % N) keep every worker busy on light and heavy shots alike
for ((w = 0; w < N; w++)); do
  LIST=$(seq $((FROM + w)) $N $TO | paste -sd, -)
  node _tools/cdp.cjs --page _render/video/main20.html --list "$LIST" --out "$OUT" --quality 98 > "$OUT/logs/w$w.log" 2>&1 &
done
wait
echo "done: $(ls "$OUT"/f*.jpg | wc -l) frames in $OUT"
