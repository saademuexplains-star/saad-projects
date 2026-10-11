#!/usr/bin/env python3
"""Word-level timings for a voiceover, fully offline.

    python transcribe.py voice.wav words.json [--start 0] [--end 60]

Uses pocketsphinx (pip install pocketsphinx — the English model ships inside the package, so it works
even when model hosts like Hugging Face are blocked). Its WORDS are often wrong ("west won" for
"worst one") but its TIMINGS are good: read the printed transcript, fix the words by ear/context or
ask the user for the script, and keep the times. If faster-whisper and its model download work in
the environment, prefer it for the words (pass --whisper).
Output: [{"w": "word", "s": start, "e": end}, ...]  plus a readable table on stdout.
"""
import json, subprocess, sys

args = sys.argv[1:]
src, dst = args[0], args[1]
opt = lambda k, d: float(args[args.index(k) + 1]) if k in args else d
start, end = opt("--start", 0.0), opt("--end", 0.0)

if "--whisper" in args:
    from faster_whisper import WhisperModel
    m = WhisperModel("small.en", device="cpu", compute_type="int8")
    segs, _ = m.transcribe(src, word_timestamps=True)
    words = [{"w": w.word.strip(), "s": round(w.start, 2), "e": round(w.end, 2)} for s in segs for w in s.words]
else:
    from pocketsphinx import Decoder
    cmd = ["ffmpeg", "-v", "error", "-i", src, "-ac", "1", "-ar", "16000", "-f", "s16le"]
    if start: cmd[3:3] = ["-ss", str(start)]
    if end: cmd += ["-t", str(end - start)]
    raw = subprocess.run(cmd + ["-"], capture_output=True, check=True).stdout
    words = []
    # decode in ~20 s chunks so long files stay accurate; offsets keep absolute times
    chunk = 16000 * 2 * 20
    for off in range(0, len(raw), chunk):
        d = Decoder(samprate=16000)
        d.start_utt(); d.process_raw(raw[off:off + chunk], full_utt=True); d.end_utt()
        base = start + off / 32000
        for sg in d.seg():
            w = sg.word.split("(")[0]
            if w in ("<s>", "</s>", "<sil>", "[NOISE]"):
                continue
            words.append({"w": w, "s": round(base + sg.start_frame / 100, 2), "e": round(base + sg.end_frame / 100, 2)})

json.dump(words, open(dst, "w"), indent=0)
print(" ".join(w["w"] for w in words))
for w in words:
    print(f'{w["s"]:7.2f}-{w["e"]:6.2f}  {w["w"]}')
