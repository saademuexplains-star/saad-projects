#!/usr/bin/env bash
# rr.sh FROM TO [tag] — delete frames [FROM, TO] and re-render them with 4 workers; waits on the worker PIDs
set -u
A=$1; B=$2; TAG=${3:-x}
for i in $(seq $A $B); do rm -f frames/$(printf %05d $i).jpg; done
pids=()
for k in 0 1 2 3; do NODE_PATH=$(npm root -g) node tools/render_frames.cjs index.html frames $((A+k)) $((B+1)) 4 > logs/$TAG$k.log 2>&1 & pids+=($!); done
wait "${pids[@]}"
ls frames | wc -l; grep -h "ERROR" logs/$TAG?.log || true
