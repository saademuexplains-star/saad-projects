#!/usr/bin/env bash
# full render: 3 pass workers (interleaved frames) + a shader that lights frames as soon as their passes exist
A=${1:-0}; B=${2:-1362}
pids=()
for k in 0 1 2; do NODE_PATH=$(npm root -g) node tools/render_passes.cjs index.html $((A+k)) $B 3 > logs/rp$k.log 2>&1 & pids+=($!); done
python3 tools/shade_frames.py $A $B ${SP:-1} --wait > logs/shade.log 2>&1 & spid=$!
wait "${pids[@]}"
echo "passes done $(date)"
wait $spid
echo "shading done $(date)"; ls frames | wc -l; grep -h "ERROR" logs/rp?.log || true
