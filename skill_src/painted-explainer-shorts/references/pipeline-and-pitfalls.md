# Pipeline & pitfalls

## Contents
1. Commands
2. Project file skeleton
3. Render times & long renders
4. Environment blockers seen before
5. Bugs already solved (don't reintroduce them)

## 1. Commands
```bash
SK=<skill dir>; P=<project dir>; N="NODE_PATH=$(npm root -g)"
python3 $SK/scripts/transcribe.py vo.wav $P/words.json --end 8         # word timings (fix the words!)
python3 $SK/scripts/onsets.py vo.wav --end 6                            # stressed-syllable candidates
python3 $SK/scripts/sfx.py $P/sfx_cues.json $P/sfx.wav                  # SFX track
env $N node $SK/scripts/render_stills.cjs $P/index.html $P/frames --stills          # model sheets (window.STILLS)
env $N node $SK/scripts/render_stills.cjs $P/index.html $P/frames --times 0.6,2.1   # style frames
bash $SK/scripts/make_sheet.sh 3 $P/sheet.png $P/frames/*.png
env $N node $SK/scripts/render_video.cjs $P/index.html $P/sample.mp4 --voice vo.wav --sfx $P/sfx.wav --to 5.45
ffmpeg -i $P/sample.mp4 -vf "select='not(mod(n\,15))',scale=216:-1,tile=10x1" -frames:v 1 -vsync vfr strip.png
ffmpeg -i $P/sample.mp4 -af volumedetect -f null - 2>&1 | grep -E "mean|max"
```
Sections for long videos: render `--from 0 --to 15`, `--from 15 --to 30` … (each mixes its own audio
slice), then join with ffmpeg's concat demuxer (`-f concat -safe 0 -i list.txt -c copy`).

## 2. Project skeleton (`project.js`)
```js
const WORDS = [[0.07,'Ten',true], [0.31,'weird',true], [0.67,'things',false], ...];  // caption text + yellow flag
const STRONG = [0.07, ...];
const HERO = { hair: 'short', top: 'jacket', ... };
let TL; const B = t => TL.beat(t);
const SHOTS = [
  { at: 0, draw(v, t) { return `<g transform="${cam({ cx: 540, cy: 830, s: 1 + .03 * t + B(t) })}">
      ${background({ preset: 'day', horizon: 1130 })}${placePerson(540, 2440, 1.5, HERO, { smirk: 1 }, t)}</g>`; } },
  ...
];
const TRANS = [[1.90, 1.78, 1.97, 'zoom'], ...];
TL = makeTimeline({ shots: SHOTS, trans: TRANS, words: WORDS, strong: STRONG, captions: 'word', fps: 30, duration: 5.45 });
// optional, for sheets: window.STILLS = { hero_full: () => showStill(background({...}) + placePerson(...)) };
```
`draw()` gets absolute time `t`; compute local time as `t - shotStart`. Each shot's SVG is a pure
function of `t` — no state, no randomness without a fixed seed — so any frame can be rendered alone.

## 3. Render times
With all finishing filters, one 1080×1920 frame takes roughly 2–6 s (a 5.45 s sample at 30 fps took
~15 min). Frames inside a dissolve draw two full scenes and cost about twice as much, and running two renders at once slows both. Plan for it: approve stills first, run video renders in the background, report progress,
and render long videos in sections. If speed matters more than polish, render style frames with the
filters but test motion with a faster draft (e.g. `--from/--to` on short spans).

## 4. Environment blockers seen before
- Model hosts (Hugging Face, OpenAI blob storage, alphacephei) can be blocked by the network policy
  → whisper/vosk downloads fail. pocketsphinx from PyPI includes its model and works offline.
- Uploading the user's audio to a third-party service (e.g. ElevenLabs transcription) may be blocked
  as data exfiltration — don't route around that; use the offline path or ask the user.
- `pip install` may need a venv (`python3 -m venv .venv`). Run Python on downloaded data with `-I`.
- Google Fonts may be unreachable → captions fall back to sans-serif; check a still before rendering.
- Captions need Poppins (Google Fonts). If it can't load, install a local copy or the captions fall
  back to a generic sans-serif — always check a still before rendering video.
- `cd` inside a shell command may not persist between calls — use absolute paths; stray files
  written to the wrong directory (e.g. a git repo) must be moved out.

## 5. Bugs already solved
- **Mirroring sign:** `mx(k, d)` maps x → −k·x. Paths are authored for the screen-left side; k=−1
  keeps them, k=1 mirrors. Getting this backwards draws each leg's details on the other leg (one shoe
  lost its buckle under the other shoe).
- **Stroke pieces clipped by filters:** filter regions in objectBoundingBox units ignore stroke width,
  so a 56 px sleeve drawn as a stroke along a thin path got clipped to a sliver. Use the user-space
  filters `pclA` / `pcsA` for strokes.
- **Duplicate ids across layers:** two shots on screen at once share defs ids → `url(#…)` resolves to
  the wrong layer. `makeTimeline` suffixes every id per layer; `lit()` renames ids in its mask copy.
  Keep ids unique inside custom SVG too.
- **Black edges in transitions:** never scale a layer below 1× or translate it without over-scaling.
- **ffmpeg** rejects `d=.08` — write `0.08`. Set `-pix_fmt rgb24` when tiling PNG sheets.
- **"Banding" in sheet previews:** large sheets can look posterised in Claude's own image preview due
  to compression; the PNG is fine. Crop a region at full size before chasing it.
- **Vest/hand seams:** a patch drawn over another piece must use the same `userSpaceOnUse` gradient as
  the piece underneath, or clip the overlapping piece instead (tucked hand uses a clipPath at the vest opening).
- **Blink lids** on crude eyes must be skin-coloured with a closed-eye line, not dark discs (they read as sunglasses).
