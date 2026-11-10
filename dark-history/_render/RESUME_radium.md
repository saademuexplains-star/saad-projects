# The Radium Girls: where the production stands (resume from here after any reset)

**Status 10 Nov 03:20 UTC:** the look approved ("KEEP GOING"; the coffin redesigned - six-sided, seen down the grave -
after "JUST THE COFFIN DONT LOOK OK ... LOOK LIKE A BOX"). All shots written; pass A rendering into `_render/frames33a`
(started 03:14 UTC, ~40 frames/min, `nohup setsid _tools/render_film.sh _render/video/main21.html _render/frames33a 3`).
SFX generated and mixed; no music (the user decides on music credits).

Page `_render/video/main21.html`: **2829 frames** (47.15 s, 60 fps). Voice `_vo19/vo_trim.wav` (44.64 s, every pause
over 0.22 s cut to 0.2 s - the user: no long gaps); shots timed to it directly (no time warp). Files: `cast22.js`,
`sets26.js` (studio, glow pass `S.emissive`, cemetery), `sets27.js` (jar, card, trench watch, desk, dance hall,
washstand, dentist, lab, bed, certificate, 1927 paper, title), `shots_y1.js` (HOOK .. BOSS), `shots_y2.js` (GLOW ..
PALM), `shots_y3.js` (LAB .. END + loop). Look test: `look21.html` + `shots_y0.js`; cast sheet `rig21.html`.
Fonts first: `mkdir -p ~/.fonts && cp _render/fonts/*.ttf ~/.fonts/ && fc-cache -f`.
SFX: ElevenLabs flow lkJRXXhmBoq4Gnozfr9M ("Radium Girls - SFX"), 24 nodes one take each (`_sfx19/sessions.txt`);
wavs in `_sfx19/wav` (gitignored). Mix: `python3 -I _tools/mix_radium.py deliver` -> radium_voiceover/sfx/music/mix.wav.

## Steps (tick as done)
1. [ ] Pass A complete: `ls _render/frames33a/*.jpg | wc -l` = 2829. Missing frames: list them (range(2829) minus the
   files present) into a file, then `PAGE=_render/video/main21.html _tools/render_list.sh _render/frames33a <file> 3`.
2. [ ] QA: `python3 -I _tools/qa.py scan _render/frames33a` (spikes, loop seam); contact sheets of every transition.
3. [ ] Hand audit from the final frames: `node _tools/jseval.cjs --page _render/video/main21.html --js
   _tools/handaudit.js > hands.json`, then `_tools/handcrops.py` tiles every wrist; look at every tile.
4. [ ] Determinism spot check: every 10th frame into `_render/frames33b`, `qa.py cmp` (worst block < 6).
5. [ ] Mix: `python3 -I _tools/mix_radium.py deliver`.
6. [ ] Encode: `_tools/encode_coca.sh _render/frames33a deliver/radium_mix.wav deliver/radium_girls.mp4`; ffprobe.
7. [ ] Deliver (SendUserFile) the MP4 + radium_voiceover.wav + radium_sfx.wav; commit; PRODUCTIONS.md entry.
