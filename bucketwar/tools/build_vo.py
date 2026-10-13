#!/usr/bin/env python3
"""Cut the long ElevenLabs take down to a 7.000 s brisk narration and emit word times in output time.

    python build_vo.py audio/takes/c.mp3 audio/vo.wav audio/words.json

Raw word times come from tools/align.py (pocketsphinx timings, words corrected by hand from the script).
The take has ~0.5-0.8 s pauses between sentences; each sentence is cut out, sped up by SPEED, and re-joined
with short gaps, so the whole read fits the 7 s short without sounding rushed.
"""
import json, subprocess, sys

SRC, OUT, WORDS_OUT = sys.argv[1:4]
SPEED = 1.17
DUR = 7.0
# (raw start, raw end) of each sentence in the take, and the gap (output seconds) that follows it
SEGS = [(0.00, 2.92, .12), (3.52, 5.22, .12), (5.40, 6.80, .16), (7.14, 8.80, 0)]
# raw word timings (take c): word, start, end
RAW = [("In", .03, .25), ("thirteen", .25, .65), ("twenty-five,", .66, 1.48), ("soldiers", 1.66, 2.17), ("stole", 2.18, 2.40),
       ("a", 2.40, 2.50), ("bucket.", 2.50, 2.85), ("Two", 3.61, 3.83), ("cities", 3.84, 4.30), ("went", 4.31, 4.54),
       ("to", 4.55, 4.65), ("war.", 4.66, 5.02), ("Two", 5.50, 5.73), ("thousand", 5.74, 6.28), ("died.", 6.38, 6.65),
       ("Modena", 7.27, 7.75), ("kept", 7.76, 8.13), ("the", 8.14, 8.22), ("bucket.", 8.23, 8.76)]

parts, labels, out_start, offs = [], [], 0.0, []
for i, (a, b, gap) in enumerate(SEGS):
    parts.append(f"[0:a]atrim={a}:{b},asetpts=PTS-STARTPTS,atempo={SPEED},afade=t=in:d=0.006,afade=t=out:st={(b - a) / SPEED - 0.012:.4f}:d=0.012[s{i}]")
    labels.append(f"[s{i}]")
    offs.append(out_start)
    out_start += (b - a) / SPEED
    if gap:
        parts.append(f"anullsrc=r=44100:cl=mono,atrim=0:{gap}[g{i}]"); labels.append(f"[g{i}]"); out_start += gap
parts.append("".join(labels) + f"concat=n={len(labels)}:v=0:a=1,apad,atrim=0:{DUR},aformat=sample_rates=44100:channel_layouts=stereo[a]")
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", SRC, "-filter_complex", ";".join(parts), "-map", "[a]", OUT], check=True)

def to_out(t):
    for (a, b, _), off in zip(SEGS, offs):
        if a - .25 <= t <= b + .25:
            return off + (min(max(t, a), b) - a) / SPEED
    raise ValueError(t)
words = [{"w": w, "s": round(to_out(s), 3), "e": round(to_out(e), 3)} for w, s, e in RAW]
json.dump(words, open(WORDS_OUT, "w"), indent=1)
print(f"speech ends at {out_start:.2f} s (video {DUR} s)")
for w in words: print(f'{w["s"]:6.2f} {w["e"]:6.2f} {w["w"]}')
