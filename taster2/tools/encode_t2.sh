#!/usr/bin/env bash
# The Taster v2: two-pass H.264 at 3.9 Mb/s (55.8 s stays under 30 MB), light sharpening, AAC 192k; + SFX-only mp3 + music (wav + mp3)
cd "$(dirname "$0")/.."
set -e
mkdir -p logs out
VF="unsharp=5:5:0.35:5:5:0,format=yuv420p"
ffmpeg -hide_banner -loglevel error -y -framerate 30 -i frames/%05d.jpg -vf "$VF" -c:v libx264 -preset slow -profile:v high -b:v 3900k -pass 1 -passlogfile logs/x264 -an -f mp4 /dev/null
ffmpeg -hide_banner -loglevel error -y -framerate 30 -i frames/%05d.jpg -i audio/mix_norm.wav -map 0:v -map 1:a -vf "$VF" -c:v libx264 -preset slow -profile:v high -b:v 3900k -pass 2 -passlogfile logs/x264 \
  -c:a aac -b:a 192k -ar 48000 -movflags +faststart -shortest out/the_taster_v2.mp4
ffmpeg -hide_banner -loglevel error -y -i audio/sfx.wav -c:a libmp3lame -b:a 192k out/the_taster_v2_sfx.mp3
cp audio/score_norm.wav out/the_taster_v2_music.wav && ffmpeg -hide_banner -loglevel error -y -i audio/score_norm.wav -c:a libmp3lame -b:a 192k out/the_taster_v2_music.mp3
ls -la out
ffprobe -v error -show_entries format=duration,bit_rate -show_entries stream=codec_name,width,height,r_frame_rate -of compact out/the_taster_v2.mp4
