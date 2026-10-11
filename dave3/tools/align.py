# Forced alignment with pocketsphinx 5: python3 align.py audio.wav "text" > words.json
import sys, json, re, subprocess
from pocketsphinx import Decoder
wav, text = sys.argv[1], sys.argv[2]
raw = subprocess.run(['ffmpeg','-v','error','-i',wav,'-ac','1','-ar','16000','-f','s16le','-'],capture_output=True).stdout
words = [re.sub(r"[^a-z]", "", w.lower()) for w in text.split()]
words = [w for w in words if w]
d = Decoder(samprate=16000, bestpath=False)
d.set_align_text(" ".join(words))
d.start_utt(); d.process_raw(raw, full_utt=True); d.end_utt()
d.set_alignment(); d.start_utt(); d.process_raw(raw, full_utt=True); d.end_utt()
out=[]
for w in d.get_alignment():
    if w.name in ('<sil>','<s>','</s>','(NULL)'): continue
    out.append([round(w.start/100,3), round((w.start+w.duration)/100,3), w.name.upper()])
print(json.dumps(out))
