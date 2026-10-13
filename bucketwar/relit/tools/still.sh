#!/usr/bin/env bash
# One command for a finished still:  tools/still.sh out.png '{"caption":"bucket.","key":true,"label":"Italy, 1325","capTop":1120,"zs":[[130,610]]}' [time]
# flat + normal passes (Chromium) -> deferred relight (numpy) -> caption / label overlay (same CSS as the engine)
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=$(realpath -m "$1"); OPTS=${2:-'{}'}; T=${3:-0}
W=$(mktemp -d); export NODE_PATH=$(npm root -g)
node tools/test_times.cjs index.html "$W" "$T"
python3 tools/test_shade.py "$W"
LIT=$(ls "$W"/lit_*.jpg | head -1)
node tools/compose.cjs "$LIT" "$OUT" "$OPTS"
rm -rf "$W"
