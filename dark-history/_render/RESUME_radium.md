# The Radium Girls: where the production stands (resume from here after any reset)

**Status 10 Nov 04:25 UTC: DELIVERED without music** (`deliver/radium_girls.mp4`, 2829 frames, 47.15 s, +
`radium_voiceover.wav` + `radium_sfx.wav`; all gitignored). Pass A `_render/frames33a`: 0 spikes, loop seam 2.01 against
a median step 1.88; every 10th frame re-rendered into `frames33b` (worst block diff 0.73); hands proved by difference
(`?dbghands` + `_tools/handdiff.py`): only HOOK, GLOW and LAB show a hand. Only the music is left, if the user wants it:
run node `score_radium` (zWDWM2MwtBh8zmFW6JAH, 48 s, 1,200 credits) on flow lkJRXXhmBoq4Gnozfr9M, save it as
`_sfx19/wav/score_main.wav`, add it to `_tools/mix_radium.py` (M, ducked -9 dB under the voice, about -4 dB), re-mix
and swap the audio without re-encoding the picture: `ffmpeg -i deliver/radium_girls.mp4 -i deliver/radium_mix.wav -map
0:v -map 1:a -c:v copy -c:a aac -b:a 320k -ar 48000 -movflags +faststart -shortest deliver/radium_girls_music.mp4`.
The look was approved ("KEEP GOING"; the coffin redesigned - six-sided, seen down the grave - after "JUST THE COFFIN
DONT LOOK OK ... LOOK LIKE A BOX").

Page `_render/video/main21.html`: **2829 frames** (47.15 s, 60 fps). Voice `_vo19/vo_trim.wav` (44.64 s, every pause
over 0.22 s cut to 0.2 s - the user: no long gaps); shots timed to it directly (no time warp). Files: `cast22.js`,
`sets26.js` (studio, glow pass `S.emissive`, cemetery), `sets27.js` (jar, card, trench watch, desk, dance hall,
washstand, dentist, lab, bed, certificate, 1927 paper, title), `shots_y1.js` (HOOK .. BOSS), `shots_y2.js` (GLOW ..
PALM), `shots_y3.js` (LAB .. END + loop). Look test: `look21.html` + `shots_y0.js`; cast sheet `rig21.html`.
Fonts first: `mkdir -p ~/.fonts && cp _render/fonts/*.ttf ~/.fonts/ && fc-cache -f`.
SFX: ElevenLabs flow lkJRXXhmBoq4Gnozfr9M ("Radium Girls - SFX"), 24 nodes one take each (`_sfx19/sessions.txt`);
wavs in `_sfx19/wav` (gitignored). Mix: `python3 -I _tools/mix_radium.py deliver` -> radium_voiceover/sfx/music/mix.wav.

## Steps (tick as done)
1. [x] Pass A complete: `ls _render/frames33a/*.jpg | wc -l` = 2829. Missing frames: list them (range(2829) minus the
   files present) into a file, then `PAGE=_render/video/main21.html _tools/render_list.sh _render/frames33a <file> 3`.
2. [x] QA: `python3 -I _tools/qa.py scan _render/frames33a` (spikes, loop seam); contact sheets of every transition.
3. [x] Hand audit from the final frames: `node _tools/jseval.cjs --page _render/video/main21.html --js
   _tools/handaudit.js > hands.json`, then `_tools/handcrops.py` tiles every wrist; look at every tile.
4. [x] Determinism spot check: every 10th frame into `_render/frames33b`, `qa.py cmp` (worst block < 6).
5. [x] Mix: `python3 -I _tools/mix_radium.py deliver`.
6. [x] Encode: `_tools/encode_coca.sh _render/frames33a deliver/radium_mix.wav deliver/radium_girls.mp4`; ffprobe.
7. [x] Deliver (SendUserFile) the MP4 + radium_voiceover.wav + radium_sfx.wav; commit; PRODUCTIONS.md entry.
