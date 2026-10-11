---
name: painted-explainer-shorts
description: Make 2D animated vertical explainer shorts (TikTok / Reels / YouTube Shorts — history, facts, "N weird things about X", storytime) from a voiceover, in one signature look — semi-realistic painted characters with soft lighting and slightly crude expressive faces, photo-like blurred backgrounds, motion that lands on the stressed syllables of the narration, layered dissolves, word-by-word white/yellow captions and light sound effects (no on-screen list numbering). Includes a code engine (SVG → frames → MP4), a character builder, background builders and audio scripts. Use this skill whenever the user wants an animated video, cartoon, explainer, history or facts short, character animation, character design / model sheet, style frames or storyboard frames, animated captions for a short, or hands over a voiceover / VO / narration to animate — even if they don't name this style, and even for a brand-new topic or project.
---

# Painted Explainer Shorts

Turn a voiceover into a 2D animated short with a consistent, recognisable look. The look and the
*method* carry over to any topic; the content (characters, places, props) is always new for each project.

**North star:** realistic-looking subjects with simple, slightly crude expressive faces, sitting in
blurry "phone photo" backgrounds, cut and animated so every visual beat hits a stressed syllable of
the narration. Think of short-form history/facts channels: the image grabs you in the first half
second, then something changes on almost every word.

Before starting a new project, look at the images in `assets/reference/` (approved_* = target look,
cast_variety_* = how the look generalises, rejected_* = what the user explicitly did not want).

## What's in the box

| Path | Use |
|---|---|
| `assets/engine/engine.js` | Renderer: finishing filters, character lighting, `person()` builder, `background()`/`interior()`, camera + beat helpers, `makeTimeline()` with layered dissolves and captions, `showStill()` for frames |
| `assets/engine/template.html` | Page skeleton (1080×1920). Copy next to `engine.js` and add a `project.js` |
| `examples/napoleon-hook/` | The approved 5 s hook, fully commented — shows timing, shot design, transitions, SFX cues |
| `examples/cast-demo/` | Four unrelated characters built with `person()` — shows how to make *new* people in the same look |
| `scripts/transcribe.py` | Offline word timings (pocketsphinx; works when model hosts are blocked) |
| `scripts/onsets.py` | Syllable/loudness onsets → where the big hits go |
| `scripts/sfx.py` | Synthesizes whooshes, pops, thumps, sparkles, swells from a cue list |
| `scripts/render_stills.cjs` | Frames at given times, or named stills (model sheets, style frames) |
| `scripts/render_video.cjs` | Frame-exact video render + voice/SFX mix; supports `--from/--to` for sections |
| `scripts/make_sheet.sh` | Tile frames into a review sheet |
| `references/style-guide.md` | The aesthetic in detail + the user's approvals and rejections — read before designing |
| `references/character-recipe.md` | How characters are built, `person()` options, adding garments/creatures — read before making a cast |
| `references/motion-and-sync.md` | Beat sync, hook formula, camera, transition catalog, SFX — read before planning shots |
| `references/pipeline-and-pitfalls.md` | Setup, commands, render times, environment blockers, bugs already solved |

## Setup (once per project)

```bash
P=<project dir>; SK=<this skill dir>
mkdir -p $P && cp $SK/assets/engine/engine.js $P/ && cp $SK/assets/engine/template.html $P/index.html
# tools: node + playwright (Chromium), ffmpeg, python3 with numpy + pocketsphinx
node -e "require('playwright')" 2>/dev/null || NODE_PATH=$(npm root -g) node -e "require('playwright')" && echo playwright ok
python3 -c "import numpy, pocketsphinx" || pip install numpy pocketsphinx   # use a venv if pip is locked
```
If playwright lives in the global modules, prefix node commands with `NODE_PATH=$(npm root -g)`.
`$P/project.js` is where all project-specific work goes (see the two examples).

## Workflow — frames first, video last

The user reviews **still frames and sheets** far faster than videos, and stills cost seconds while
video renders cost many minutes. Iterate on sheets; render video only once the frames are approved.

1. **Listen.** `transcribe.py vo.wav words.json` and `onsets.py vo.wav --end <hook end>`.
   pocketsphinx timings are reliable but its words are often wrong — correct them from context (or
   from the user's script) and show the user any word you are unsure of. The corrected words, with
   normal casing and punctuation ("Napoleon,", "1925,", "one?"), become the captions; mark the key
   words (names, numbers, the hook and punchline words) as yellow. Find each key word's *stressed syllable* (na-**PO**-leon,
   **RAB**-bits); onsets near a word usually mark it. That moment is where the action goes.
2. **Plan a beat sheet** before drawing: a table of time · words · shot & framing · the character
   action on the stressed syllable · prop/label · transition into the shot · SFX cue. Apply the hook
   formula in `references/motion-and-sync.md` to the first ~5 seconds.
3. **Cast & sets → model sheet.** Build each character with `person()` (or a custom rig following
   `references/character-recipe.md`) and render a sheet: full body, close-up expressions (neutral,
   smug, shocked, talking), details (hands, feet). Get the user's OK on the character before animating.
4. **Style frames.** Render the key beats as stills (`render_stills.cjs ... --times`) and tile them
   with `make_sheet.sh`. Look at every frame yourself first — check close-ups for artifacts and
   mid-transition frames for black edges — then send the sheet.
5. **5-second sample** with voice + SFX (`sfx.py cues.json sfx.wav`, then `render_video.cjs`). Pull a
   frame strip from the MP4 to confirm, then send it. Ask for feedback on motion and sync.
6. **Full video.** Render in sections in the background (`--from/--to`; ~2–6 s per frame with the
   finishing filters, so a 60 s short is hours — warn the user and give progress), then concatenate.
7. **Deliver** the MP4 plus the latest sheets; say plainly what was checked and any guesses (unclear
   words, historical details, placeholder icons).

## Non-negotiables of the look (details in the style guide)

- Characters: painted, **no outlines**, gradients lit from the upper-left, sketchy paper texture,
  finishing filters on every piece (rounded edges, rim shading, cast shadows) so nothing looks like
  cut paper. Real anatomy (shaped legs, feet, hands); faces realistic-but-simple and expressive.
- Backgrounds: simple shapes + heavy blur (depth of field); the character is the only sharp thing.
- **Captions: one word at a time, as it is spoken** — bold rounded font, white with a thin dark
  outline and soft shadow, key words in yellow, just below the middle of the frame (`captions: 'word'`,
  the default). See "Captions" in the style guide; `assets/reference/approved_captions_closeup.jpg`.
- **No on-screen numbering, ever** — no "1. 2. 3." countdown markers, no numbered teaser badges,
  no "#1" stamps — even when the narration is a list ("ten weird things…"). The words carry the count.
- Default variant **B (clean)**: realistic eyes and mouths. Variant **A** (big cartoon eyes, drawn
  mouths) is optional; captions are the same in both.
- No meme pop-ups (gold plates, big "L" bursts), no plain slides — every cut is a dissolve, and the
  motion must follow the voice.
- 1080×1920, 30 fps, voice dominant, SFX quiet underneath.

## Verify before you claim

Render and *look* at stills before any video. After a video render, extract a frame strip
(`ffmpeg -i out.mp4 -vf "select=...,tile"`) and check transitions and hits; run
`ffmpeg -i out.mp4 -af volumedetect -f null -` to confirm no clipping. Report what you verified and
what you didn't (e.g. "checked stills, not full-speed playback").
