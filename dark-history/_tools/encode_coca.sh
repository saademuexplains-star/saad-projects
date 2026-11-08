#!/usr/bin/env bash
# Encode the frames + the mix: H.264 1080x1920 60 fps ~20 Mbps, AAC 320k 48 kHz. Usage: encode_coca.sh <frames dir> <mix.wav> <out.mp4>
set -e
FR=$1; WAV=$2; OUT=$3
ffmpeg -v error -y -framerate 60 -i "$FR/f%05d.jpg" -i "$WAV" -map 0:v -map 1:a -c:v libx264 -preset slow -b:v 20M -maxrate 24M -bufsize 40M \
  -pix_fmt yuv420p -profile:v high -level 4.2 -r 60 -c:a aac -b:a 320k -ar 48000 -movflags +faststart -shortest "$OUT"
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,nb_frames,sample_rate,channels -show_entries format=duration,bit_rate -of compact "$OUT"
