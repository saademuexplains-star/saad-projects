# PROJECT HANDOFF — Animated story Shorts (Gladiator / Spartan / The Lullaby style)

Paste this whole file as your first message in the new chat and attach `story_shorts_pipeline.zip`.
You (Claude) are continuing an existing project. Unzip the archive into your scratchpad and work from it.
Do not rebuild the pipeline from scratch and do not change the locked look unless I ask.

## What we make
- 2D animated vertical YouTube Shorts / Reels with a refined painted look. Each is 35–60 s long and built from an
  ElevenLabs voiceover MP3 plus a short script that I send.
- Past videos: Gladiator ("last day"), Spartan boy v1–v3 (the agoge, the fox story), and The Lullaby (a horror story
  about Elsbeth, a lullaby, and the thing under the bed).
- Deliverables for every video:
  - the final MP4 (1080x1920, 30 fps, under 30 MB);
  - an SFX-only MP3;
  - optionally a background-music track (WAV + MP3) with risers, synced from 0:00;
  - a title, a description with hashtags, and an opening "POV" text when I ask.

## How I like to work (important)
- Go straight to the full video unless I say "give me one frame first". If I ask for a frame, send ONE still and wait.
- Keep me posted in short lines while rendering; renders are long.
- Before delivering, QC every shot yourself (contact sheets at 0.25–0.5 s, pops check, loop seam).
  Fix glitches and re-render only the affected frame ranges.
- My English is casual; "okie" means OK. Things I have complained about before, never repeat them:
  - "4 hands" on a person (arms mirrored to the wrong side);
  - bad or floating hands;
  - characters that look like "cut PNGs" with pieces visibly separate;
  - looking 3D or plastic;
  - burnt orange lighting;
  - blurry smoke transitions;
  - crossfade ghosting;
  - "shoosh / tin tin" thin sound effects;
  - static scenes. I want ACTING animation, not slideshows.

## LOCKED STANDARDS (approved — keep exactly)
See `LOCKED_STANDARDS.md` in the zip. In short:

**Format**
- 1080x1920, 30 fps.
- Two-pass H.264 at about 4.9 Mb/s with `unsharp=5:5:0.35:5:5:0`; AAC 192k.
- Audio at -14 LUFS (two-pass loudnorm, linear), true peak at or below -1.5 dBTP.

**Look**
- Refined 2D painted characters with a whole-figure outline (`outlined()` filter: threshold alpha, then feMorphology
  dilate scaled by the camera zoom `window.__Z`).
- Crisp piece edges.
- Deferred relight pipeline: Chromium renders a FLAT pass and a NORMAL pass of the same SVG frame, then
  `tools/shade.py` (numpy) relights it with point lights, wrap diffuse, specular, god rays, bloom, a SOFT tonemap,
  grade, vignette, grain, and fade.
- Neutral, healthy ambient light. Never burnt or orange.

**Content**
- No captions and no names on screen.
- Bassy SFX only (kicks, whoomphs, thumps, creaks pitched down). Few pauses in the voiceover.

**Transitions**
- Hard cuts, push-ins, quick zooms, dips to black (the shader multiplies by the rig `fade`).
- Never a crossfade between two images.

**Loop**
- The last frame equals the first frame.
- Motion is windowed to zero at 0 and at DUR with `seamW`, `brS`, `swayS` and `flkSeam`.
- Audio is built on a circular buffer so it loops seamlessly too.

**Quality bar**
1. Each character reads as ONE solid figure: no seams at joints and no background visible inside the silhouette.
   - Garments are unions in one filter group.
   - Upper arms go under the garment shoulders; forearms go in front only when `A.front`.
   - Sleeve and shawl edges are redrawn over the elbow.
2. Hands:
   - exactly 2 hands, each on the correct side;
   - the wrist sits at the end of the forearm;
   - every contact is computed in world space with `toWorld`/`toLocal`, `wristFor(tip, theta, len)` and `aim(A, theta)`;
   - grips use world positions;
   - `tools/ik_audit.cjs` must report "AUDIT CLEAN".
3. Clothes and hair are opaque and in the right draw order; no background shows through.
4. No confusing overlaps:
   - no faces cut by the frame edge or peeking from behind another body;
   - no tangents (keep 25 px or more of clearance, or cut decisively);
   - a standing figure must be grounded (no floating hems).
5. Cinematic:
   - establishing shot, then medium, then close-up;
   - motivated camera moves (push-in, crane), Dutch angle on tension, DOF on close-ups;
   - motivated key and rim light;
   - one grade per scene, grain and vignette.

## Hard-won lessons (bugs we fixed — check these every time)
- **Arms hanging with the elbow tucked in front of the chest** (looks like forearms growing out of the vest).
  `autoIK` picks the "lower elbow", which flips inward for near-vertical targets. Fix: explicit `bend`. Use the
  hanging helpers `uHang(k)` / `eHang(k)` (bend = -k means the elbow goes outward) from `cast.js`.
- **A reach that starts from hanging:** keep ONE IK side through the whole motion. Elbow-down for a reach across
  the body is `bend:-1` for k=-1. Never switch bend mid-move or the elbow pops.
- **A shawl drape over an inward elbow** draws a zigzag across the chest. Fix: natural hanging arms (outward elbows).
- **A dark overlay rect for a "go to dark" moment** makes a muddy grey see-through face because only the flat pass
  gets darkened. Use the shader `fade` (a dip to black) or just a push-in plus a hard cut.
- **A camera sink past figures** reveals floating gowns (the figure stands "behind" the bed but is drawn in front).
  Either ground the figure properly or frame so feet and hems are never shown.
- **Effects drawn under a dark gradient overlay are invisible** (the floor hump and the pale sheen under the bed).
  Put effects in the lit zone.
- **Bending seams:** build boards and their gaps from the SAME polylines so fills follow edges.
- **Jump cuts** (same angle, small zoom change) look like glitches. Make a real cut-in (~2x) or a continuous move,
  and match pose and expression values across the cut.
- **pkill patterns can kill their own shell.** Use a driver script (`tools/render_full.sh`).
- **The Chromium page loads JS once per worker.** If you edit code mid-render, delete those frames and re-render them.
- **Contact sheets:** `tools/sheet_big.py frames out.jpg t0 t1 step cols w`; zoom with `tools/zs.py out.jpg t1 t2 ...`.

## Pipeline (in the zip: `lullaby/` is the newest, cleanest template; `spartan2/` is the previous one)
**Page and engine**
- `index.html` loads, in order: `engine.js`, `fx.js`, `sets_base.js`, `rigs_base.js`, `kit.js`, `sets.js`, `rigs.js`,
  `cast.js`, the set file (`cottage.js`), `words_header.js`, `melody.js`, `anim.js`, `project.js`.
- `engine.js`: SVG person() head and emotion face (`emoFace`), piece filters (flat/normal), `lights()`, the
  timeline (`makeTimeline` with shots and transitions), and the 'black' dip transition.
- `anim.js` holds the helpers:
  - camera `camT(t, fx, fy, zoom, {r, hh, sx, sy})`;
  - `seamW`, `outlined`, `ik`, `autoIK`, `toWorld`, `toLocal`, `flkSeam`, `snowfall`, `dust`;
  - the `RIG.*` light rigs.
- `cast.js`: characters as whole garments:
  - hands `handBack`, `handPalm`, `handGrip` (fingers, thumb, one silhouette);
  - `forearm()`, `band()`, `softNeck`;
  - `eArm`/`uArm` (IK arms) and `uHang`/`eHang`.
- `project.js`: SHOTS = [{at, draw(v, t)}] synced to the VO word times, then TRANS, then makeTimeline.

**Rendering**
- `tools/render_passes.cjs index.html start end step [--force]` writes `flat/` `nrm/` `lights/`.
- `tools/shade_frames.py A B procs [--wait]` writes `frames/NNNNN.jpg`.
- `tools/render_full.sh A B` runs 3 pass workers plus a shader and skips frames that already exist; delete stale
  frames to re-render them.
- Single-frame tests: `node tools/test_times.cjs index.html dir 1.2,3.4`, then `python3 tools/test_shade.py dir`.

**QC and encode**
- `tools/ik_audit.cjs index.html 30`: hands reach their targets.
- `tools/pops.py 'frames/%05d.jpg'`: spikes outside cuts.
- `tools/encode.sh`: two-pass encode plus the SFX mp3.

**Audio**
- `tools/align.py`: word timings from the VO (pocketsphinx) into `audio/words.json`.
- `tools/lullaby_mix.py`:
  - VO, a synthesized singing/humming voice (additive formant synth), room tone and wind (FFT-periodic noise so it
    loops);
  - library SFX from `sfx_raw/` pitched down with asetrate;
  - mix to `audio/mix.wav` and `audio/sfx.wav`, then two-pass loudnorm.
- `tools/score.py`: background music score:
  - pad, music box, strings tremolo, braam, shepard riser, noise risers, booms;
  - circular reverb and a look-ahead limiter;
  - synced to the cuts; delivered at about -22 LUFS so it drops in at 100% under the -14 LUFS video audio.

**Environment needs:** node + playwright (chromium), python3 + numpy + Pillow, ffmpeg. Install anything missing.

## Workflow for a NEW video (what I'll send: an MP3 voiceover + the script)
1. Align the words. Plan a beat sheet: one acting shot per line, with the camera grammar and the light rig per scene.
2. Build the cast (reuse body builders; new costumes as garment unions) and the sets. Send me one style frame ONLY if I ask.
3. Animate all shots to the word times. Run the IK audit.
4. Do sound design (bassy) and mix to -14 LUFS.
5. Full render, then a full QC pass with contact sheets: fix and re-render ranges, then pops and seam checks.
6. Encode and deliver the MP4 + SFX mp3 (+ music if asked). Then title, description, hashtags and POV text when asked.

## Channel / posting notes
- My channel is "Ryse" (YouTube Shorts). Titles are short with a hook, the Shorts tag and one emoji.
- Descriptions retell the hook in 3–4 lines, end with a question for comments, then hashtags.
- Opening POV text, e.g. "POV: You're 7 and the soldiers just knocked on your door".
