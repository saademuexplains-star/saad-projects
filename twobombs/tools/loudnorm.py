#!/usr/bin/env python3
"""two-pass EBU R128 normalisation (linear when possible):  loudnorm.py in.wav out.wav [I=-14] [TP=-1.5]"""
import sys, subprocess, json, re
src, dst = sys.argv[1], sys.argv[2]; I = float(sys.argv[3]) if len(sys.argv) > 3 else -14; TP = float(sys.argv[4]) if len(sys.argv) > 4 else -1.5
r = subprocess.run(['ffmpeg', '-hide_banner', '-i', src, '-af', f'loudnorm=I={I}:TP={TP}:LRA=20:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
m = json.loads(re.search(r'\{[^{}]*"input_i"[^{}]*\}', r, re.S).group(0))
af = (f"loudnorm=I={I}:TP={TP}:LRA=20:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:"
      f"measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true:print_format=json")
r2 = subprocess.run(['ffmpeg', '-hide_banner', '-y', '-i', src, '-af', af, '-ar', '48000', '-c:a', 'pcm_s16le', dst], capture_output=True, text=True).stderr
m2 = json.loads(re.search(r'\{[^{}]*"input_i"[^{}]*\}', r2, re.S).group(0))
print('in', m['input_i'], 'LUFS', m['input_tp'], 'dBTP ->', m2['output_i'], 'LUFS', m2['output_tp'], 'dBTP', m2['normalization_type'])
