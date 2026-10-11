#!/usr/bin/env bash
# Tile still frames into one review sheet (full colour, no palette banding).
#   make_sheet.sh <columns> <out.png> <img1> <img2> ...   (each tile is scaled to 540px wide)
# Note: very large sheets may LOOK banded in Claude's own image preview because of preview compression;
# the file itself is fine — check a crop at full size before "fixing" banding that is not there.
set -euo pipefail
cols=$1; out=$2; shift 2
n=$#; rows=$(( (n + cols - 1) / cols ))
inputs=(); filt=""
i=0
for f in "$@"; do inputs+=(-i "$f"); filt+="[$i]scale=540:-2[s$i];"; i=$((i+1)); done
# pad the last row with black tiles so xstack gets a full grid
layout=""
for ((k=0; k<n; k++)); do
  c=$((k % cols)); r=$((k / cols))
  layout+="$((c*540))_$((r*960))|"
done
layout=${layout%|}
for ((k=0; k<n; k++)); do filt+="[s$k]"; done
ffmpeg -v error -y "${inputs[@]}" -filter_complex "${filt}xstack=inputs=$n:layout=$layout:fill=black,format=rgb24" -pix_fmt rgb24 "$out"
echo "wrote $out ($n tiles, ${cols}x${rows})"
