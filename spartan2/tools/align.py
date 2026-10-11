#!/usr/bin/env python3
"""Forced alignment of a known script with pocketsphinx.  align.py voice.wav script.txt out.json"""
import sys, json, re, subprocess
from pocketsphinx import Decoder
wav, txt, dst = sys.argv[1:4]
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", wav, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True, check=True).stdout
display = open(txt).read().split()
norm = []
for w in display:
    t = w.lower().replace("’", "'")
    t = {"5": "five", "a.m.": "aym"}.get(t, t)
    t = re.sub(r"[^a-z0-9']", "", t)
    norm.append(t)
d = Decoder(samprate=16000)
extra = {"berserkers": "B ER S ER K ER Z", "aym": "EY EH M", "helmet's": "HH EH L M AH T S"}
for k, v in extra.items():
    try: d.add_word(k, v, True)
    except Exception as ex: print("add_word", k, ex)
for t in norm:
    if d.lookup_word(t) is None: print("OOV:", t)
d.set_align_text(" ".join(norm))
d.start_utt(); d.process_raw(raw, full_utt=True); d.end_utt()
segs = [(s.word, s.start_frame / 100, (s.end_frame + 1) / 100) for s in d.seg()]
words = [s for s in segs if s[0] not in ("<s>", "</s>", "<sil>", "[NOISE]")]
print(len(words), "aligned of", len(display))
out = []
for disp, (w, s, e) in zip(display, words):
    out.append({"w": disp, "s": round(s, 2), "e": round(e, 2)})
    print(f"{s:6.2f}-{e:6.2f}  {disp:12s} ({w})")
sil = [(round(s, 2), round(e - s, 2)) for w, s, e in segs if w == "<sil>" and e - s > .08]
print("silences:", sil)
json.dump(out, open(dst, "w"), indent=0)
