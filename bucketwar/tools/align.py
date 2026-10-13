#!/usr/bin/env python3
"""Word timings for a voiceover, offline (pocketsphinx). python align.py voice.mp3 -> prints "start end word"."""
import subprocess, sys
from pocketsphinx import Decoder
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", sys.argv[1], "-ac", "1", "-ar", "16000", "-f", "s16le", "-"],
                     capture_output=True, check=True).stdout
d = Decoder(samprate=16000)
d.start_utt(); d.process_raw(raw, full_utt=True); d.end_utt()
for s in d.seg():
    w = s.word.split("(")[0]
    if w in ("<s>", "</s>", "<sil>", "[NOISE]"): continue
    print(f"{s.start_frame/100:6.2f} {s.end_frame/100:6.2f} {w}")
