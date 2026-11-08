"""Forced alignment of a known script to a voiceover (Linux stand-in for align2.ps1): PocketSphinx's en-US model aligns
every script word; writes words.txt in the skill's format (word start end punct, header comments with the speech
chunks). Out-of-dictionary words get pronunciations from --add 'word=PH ONES;word2=...'.
  python3 -I align.py vo_tight.wav script.txt words.txt [--add 'coca=K OW K AH']
"""
import re, sys, wave, argparse
import numpy as np
from pocketsphinx import Decoder

ap = argparse.ArgumentParser(); ap.add_argument('wav'); ap.add_argument('script'); ap.add_argument('out'); ap.add_argument('--add', default='')
o = ap.parse_args()
with wave.open(o.wav, 'rb') as w:
    ch, rate, n = w.getnchannels(), w.getframerate(), w.getnframes()
    a = np.frombuffer(w.readframes(n), dtype='<i2').reshape(-1, ch).astype(np.float64).mean(axis=1)
# resample to 16 kHz (linear interpolation is enough for recognition features)
t16 = np.arange(0, len(a) / rate, 1 / 16000.0)
a16 = np.interp(t16, np.arange(len(a)) / rate, a).astype(np.int16)
total = len(a) / rate
txt = open(o.script, encoding='utf-8').read()
toks = re.findall(r"[A-Za-z']+|[,.:;!?—\-]+", txt.replace('’', "'"))
words, punct = [], {}
for tk in toks:
    if re.match(r"^[A-Za-z']+$", tk): words.append(tk.lower())
    elif words: punct[len(words) - 1] = tk
d = Decoder(samprate=16000, bestpath=False)
for pair in filter(None, o.add.split(';')):
    w_, ph = pair.split('='); d.add_word(w_.strip(), ph.strip(), True)
oov = [w_ for w_ in dict.fromkeys(words) if d.lookup_word(w_) is None]
if oov: sys.exit('out of dictionary: ' + ' '.join(oov))
d.set_align_text(' '.join(words))
d.start_utt(); d.process_raw(a16.tobytes(), full_utt=True); d.end_utt()
segs = [(s.word, s.start_frame / 100.0, (s.end_frame + 1) / 100.0) for s in d.seg()]
al = [(w_, s, e) for w_, s, e in segs if w_ not in ('<s>', '</s>', '<sil>', '[NOISE]', '(NULL)')]
al = [(re.sub(r'\(\d+\)$', '', w_), s, e) for w_, s, e in al]
if [w_ for w_, _, _ in al] != words: sys.exit(f'alignment mismatch: {len(al)} aligned vs {len(words)} script words')
chunks, cur = [], [al[0]]
for prev, nxt in zip(al, al[1:]):
    if nxt[1] - prev[2] > 0.08: chunks.append(cur); cur = []
    cur.append(nxt)
chunks.append(cur)
lines = [f'# total {total:.3f}s; aligned by PocketSphinx (forced); chunks:'] + [f'# {c[0][1]:6.2f}-{c[-1][2]:6.2f} ' + ' '.join(w_ for w_, _, _ in c) for c in chunks]
lines += [f'{w_} {s:.3f} {e:.3f} {punct.get(i, "")}'.rstrip() for i, (w_, s, e) in enumerate(al)]
open(o.out, 'w', encoding='utf-8').write('\n'.join(lines) + '\n')
print(f'aligned {len(al)} words -> {o.out}')
