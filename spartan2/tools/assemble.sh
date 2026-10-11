#!/usr/bin/env bash
# assemble.sh <project dir> <out.mp4> — frames + loudness-normalised mix -> final MP4
set -euo pipefail
P=$1; OUT=$2
M=$(ffmpeg -hide_banner -i $P/audio/mix.wav -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
mi=$(echo "$M" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['input_i'], d['input_tp'], d['input_lra'], d['input_thresh'], d['target_offset'])")
read I TP LRA TH OFF <<< "$mi"
ffmpeg -v error -y -i $P/audio/mix.wav -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$I:measured_TP=$TP:measured_LRA=$LRA:measured_thresh=$TH:offset=$OFF:linear=true,aresample=48000" -c:a pcm_s16le $P/audio/mix_norm.wav
ffmpeg -v error -y -framerate 30 -i $P/frames/%05d.jpg -i $P/audio/mix_norm.wav -map 0:v -map 1:a \
  -vf "${VF:-null}" -c:v libx264 -preset slow -crf ${CRF:-17} -pix_fmt yuv420p -profile:v high -r 30 -c:a aac -b:a 192k -movflags +faststart -shortest "$OUT"
ffprobe -v error -show_entries format=duration:stream=codec_name,width,height,r_frame_rate -of compact "$OUT"
