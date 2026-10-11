#!/usr/bin/env bash
# dl2.sh name session gen date sig [name session gen date sig ...] — ElevenLabs signed-URL download into sfx_raw/
B='https://storage.googleapis.com/xi-backend/database/workspace/deefe5a9216546bcb35fbd04231dd8d3/content_generation'
while [ $# -ge 5 ]; do n=$1; ss=$2; g=$3; d=$4; sg=$5; shift 5
  u="$B/$ss/$g/content.mp3?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=xi-backend-prod%40xi-labs.iam.gserviceaccount.com%2F$(echo $d | cut -c1-8)%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=$d&X-Goog-Expires=7200&X-Goog-SignedHeaders=host&X-Goog-Signature=$sg"
  curl -sS -f --max-time 90 -o "sfx_raw/$n.mp3" "$u" && echo "ok $n $(ffprobe -v error -show_entries format=duration -of csv=p=0 sfx_raw/$n.mp3)s" || echo "FAIL $n"
done
