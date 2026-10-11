#!/usr/bin/env bash
# full render: 3 pass workers + a 1-core shader that keeps up; when the passes finish, the rest is shaded on 4 cores
cd "$(dirname "$0")/.."
A=${1:-0}; B=${2:-1320}
pids=()
for k in 0 1 2; do NODE_PATH=$(npm root -g) node tools/render_passes.cjs index.html $((A+k)) $B 3 > logs/rp$k.log 2>&1 & pids+=($!); done
python3 tools/shade_frames.py $A $B 1 --wait > logs/shade.log 2>&1 & spid=$!
wait "${pids[@]}"
echo "passes done $(date)"
kill $spid 2>/dev/null; wait $spid 2>/dev/null
python3 tools/shade_frames.py $A $B 4 > logs/shade4.log 2>&1
echo "shading done $(date)"; ls frames | grep -c '^[0-9]*\.jpg$'; grep -h "ERROR\|Error" logs/rp?.log | head -3
