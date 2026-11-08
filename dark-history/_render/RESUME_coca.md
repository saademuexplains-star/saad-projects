# Coca-Cola video: where the production stands (resume from here after any reset)

**Status 8 Nov 23:35 UTC: DELIVERED without music** (`deliver/coca_cola.mp4` + `coca_voiceover.wav` + `coca_sfx.wav`,
all gitignored). Pass A final; pass B identical (worst block diff 3.82, 0 over 6); 0 spikes; loop seam 1.56 < median
3.25. Only the music is left: when the user chooses, generate it (step 5), run `_tools/mix_coca.py full|cues
deliver/final`, then swap the audio without re-encoding the picture:
`ffmpeg -i deliver/coca_cola.mp4 -i deliver/final/coca_mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k -ar 48000
-movflags +faststart -shortest deliver/coca_cola_music.mp4`, and send the MP4 + the three stems.

Page `_render/video/main20.html` (2840 frames, 60 fps). Code committed on `claude/fervent-heisenberg-pfyq1p`.
Fonts must be installed first: `mkdir -p ~/.fonts && cp _render/fonts/*.ttf ~/.fonts/ && fc-cache -f`.
VO: `_vo18/vo_tight.wav` (gitignored; rebuild from `_vo18/vo.mp3` with `_tools/audiotool.py trim` if missing).
SFX: `_sfx18/wav/*.wav` (gitignored; the ElevenLabs session ids are in `_sfx18/sessions.txt` - fetch again from
flow MfGFpNLswxYkaOy8BAHR with creative_get_flow_run_status if the files are gone; the environment allows
elevenlabsusercontent.com).

## Unattended chain
`_tools/chain_coca.sh` (started detached at 19:16 UTC on 8 Nov) finishes pass A, re-renders the WINE frames, scans
pass A, renders pass B and compares the two; its log and reports are in `_render/qa20/` (`chain.log`, `scanA.txt`,
`cmpAB.txt`, `chain_done` when finished). If it is not running and `chain_done` is missing, start it again the same
way: `nohup setsid _tools/chain_coca.sh > _render/qa20/chain.out 2>&1 < /dev/null &` (each step skips work done).

## Steps (tick as done)
1. [x] Pass A: every frame 0..2839 in `_render/frames20a` (resume missing ones:
   `python3 -c` list the missing numbers into a file, then `_tools/render_list.sh _render/frames20a <file> 3`,
   run in the background with a 2-hour timeout).
2. [x] Re-render the WINE frames 1389..1706 in pass A (the stirring arm was fixed after they were rendered).
3. [x] QA pass A: `python3 -I _tools/qa.py scan _render/frames20a` (spikes, loop seam) + dense contact sheets
   (`_tools/sheet.py`) of every transition and the last 3 s; fix and re-render what is wrong.
4. [x] Pass B: `_tools/render_coca.sh _render/frames20b 3` (2-hour timeout), then
   `python3 -I _tools/qa.py cmp _render/frames20a _render/frames20b` - every frame worst block diff < 6.
5. [ ] Music: the user must choose (ElevenLabs had < 720 credits): "try again" (music node rBCvOl11fTxIhYNBOUUb,
   1 take, 48 s), "use cheaper cues" (nodes cue_war zuKtKew4avuXgm97tSrl, cue_parlour mpOXxRSJN0LSrqayR9a4, cue_build
   JJa63DKLO5DCw8ePgl5C, cue_lament prhZW5hHQpJVNrnTYZYp, cue_swell Rb8l9wsMY195mMeWSQ4m, 1 take each), or "no music".
   Downloads go to `_sfx18/mp3` -> `_sfx18/wav` (48 kHz stereo; the full score as `score_main.wav`).
6. [x] Mix: `python3 -I _tools/mix_coca.py <full|cues|none> deliver` -> coca_voiceover.wav, coca_sfx.wav,
   coca_music.wav, coca_mix.wav (exactly 2272000 samples each).
7. [x] Encode: `_tools/encode_coca.sh _render/frames20a deliver/coca_mix.wav deliver/coca_cola.mp4`; check ffprobe
   (1080x1920, 60 fps, 2840 frames, AAC 48 kHz) and decode the audio back to compare with the mix.
8. [ ] Deliver with SendUserFile: the MP4 and the three stems; say what was checked; commit the code; update
   FEEDBACK_LOG / PRODUCTIONS in the skill (`~/.claude/skills/dark-history-shorts` and `skill_src/`).
