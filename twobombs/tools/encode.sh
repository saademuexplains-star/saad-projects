#!/usr/bin/env bash
# two-pass H.264 at ~4.9 Mb/s (under 30 MB for 44 s), light sharpening, AAC 192k; + an SFX-only mp3
cd "$(dirname "$0")/.."
set -e
VF="unsharp=5:5:0.35:5:5:0,format=yuv420p"
ffmpeg -hide_banner -loglevel error -y -framerate 30 -i frames/%05d.jpg -vf "$VF" -c:v libx264 -preset slow -profile:v high -b:v 4900k -pass 1 -passlogfile logs/x264 -an -f mp4 /dev/null
ffmpeg -hide_banner -loglevel error -y -framerate 30 -i frames/%05d.jpg -i audio/mix_norm.wav -map 0:v -map 1:a -vf "$VF" -c:v libx264 -preset slow -profile:v high -b:v 4900k -pass 2 -passlogfile logs/x264 \
  -c:a aac -b:a 192k -ar 48000 -movflags +faststart -shortest out.mp4
ffmpeg -hide_banner -loglevel error -y -i audio/sfx.wav -c:a libmp3lame -b:a 192k out_sfx.mp3
ls -la out.mp4 out_sfx.mp3
ffprobe -v error -show_entries format=duration,bit_rate -show_entries stream=codec_name,width,height,r_frame_rate -of compact out.mp4
