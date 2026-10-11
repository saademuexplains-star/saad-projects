#!/usr/bin/env bash
# usage: dl.sh name url [name url ...]  — downloads into cwd, prints duration
while [ $# -ge 2 ]; do n=$1; u=$2; shift 2
  curl -sS -f --max-time 90 -o "$n.mp3" "$u" && echo "ok $n $(ffprobe -v error -show_entries format=duration -of csv=p=0 "$n.mp3")s" || echo "FAIL $n"
done
