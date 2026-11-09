---
name: dark-history-shorts
description: Make "You are a ___" dark-history vertical shorts (1080x1920, 60 fps, ~45-50 s) from the user's script and ElevenLabs voiceover, in the exact house style. Animated SVG cut-out puppets rendered frame by frame in headless Chrome, with a moving multiplane camera on every line, invisible transitions, expressive faces, correct hands and limbs, ElevenLabs music and SFX, and separate voice/SFX/music stems. Use whenever the user sends a script or voiceover for "the next video", asks to change one of these videos, or asks for a YouTube title and description for one.
---

# Dark-history shorts

**Start here in a new account or session:** read `references/HANDOFF.md` first. It covers where things stand, the user, the approved rig and look, and the next video's script. Then read the mandatory references listed below.

This skill reproduces a finished production pipeline. Eighteen videos were made with it, plus the Coca-Cola look test, and every one is bundled as working code:

| Page | Video | Page | Video |
|---|---|---|---|
| `main.html` | The Messenger | `main7.html` | The Blind Harpist |
| `main2.html` | The Whipping Boy | `main8.html` | The Confessor |
| `main3.html` | The Royal Taster | `main9.html` | The First Vaccine (cowpox) |
| `main4.html` | The Worm (no loop) | `main10.html` | The Rabies Boy |
| `main5.html` | The Leech Collector (10 s sample) | `main11.html` | The King's Decoy (horses, coach, explosion) |
| `main6.html` | The Titanic Stoker | `main12.html` | The Calf's Blood |
| | | `main13.html` | The Royal Astrologer |
| | | `main14.html` | The Heroin Bottle |
| | | `main15.html` | The Cells That Never Died (Henrietta Lacks) |
| | | `main16.html` | The Pied Piper, first cut (rejected; keep only as a reference) |
| | | `main18.html` | The Pied Piper, third cut (our cast with rig fixes in a true 3D perspective Hamelin: `street3d.js`, `terrain3d.js`, `hamelin3d.js`, `shots_u*.js`; latest rig: copy its rig fixes, **not its look or its 3D sets**. For the look copy `main3` (Taster), `main9` (First Vaccine) and the Tomb Builder: FEEDBACK_LOG 2026-11-08) |
| | | `main19.html` | The Royal Fool: V2 hands and one-piece sleeves, face-locked transitions. The user rejected its look (3D sets, bright blue, wide shots), so copy only its rig work |
| | | `look20.html`, `rig20.html` | The Coca-Cola look test (three stills) and the rig sheet: **the clean rig** (`RIG_CRISP`, `tailor.js`, `stage.js`) in the house look. **The model to copy for every new video** |
| | | `lookT1.html`, `rigT1.html` | The Semmelweis test (Vienna 1847, three stills and the cast sheet, approved "perfect" on 2026-11-08): the fixes that came after the Coca-Cola test - arms and hands in the body's one light pass (`ST.behind`, `ST.litWith`), the curved wrist, woven and finished garments, and the hair kit lit with the head (`hairkit.js`, `Q.litHair`). **The model for characters, hands and hair** (`castT1.js`, `shotsT1.js`) |

- `project/` is a ready-to-run workspace. It holds the rig, engine, sets, props and casts, every production above as working code, and the PowerShell tools for VO prep, rendering, QA, mixing and encoding. `project/examples/_voN/` holds each video's script and word timings.
- `references/` holds the rules. Read them before building anything.

| File | Read it for |
|---|---|
| `references/HANDOFF.md` | Where things stand now: the user, the approved clean rig and look, the next video (Coca-Cola) and what's built. **Read first.** |
| `references/STYLE.md` | The look, camera language, transitions, acting, hook and ending rules. **Mandatory.** |
| `references/FEEDBACK_LOG.md` | Every correction the user has made so far. **Mandatory.** Never repeat one of these mistakes. |
| `references/RIG_API.md` | Characters: faces, expressions, arms, grips, props in hand, legs, lying and seated poses |
| `references/ENGINE_API.md` | Shots, camera tracks, parallax layers, the transition catalogue, grades |
| `references/PIPELINE.md` | Exact commands for every step, from mp3 to delivered MP4 and stems |
| `references/PRODUCTIONS.md` | The shipped videos, beat by beat, as models to copy from |
| `references/REFERENCE_STUDY.md` | Frame-by-frame study of the user's reference shorts (The Serf, Groom of the Stool, Sin Eater) |

## Setup (once per machine)

1. Copy `project/` into the working folder. Keep its layout (`_render/lib`, `_render/video`, `_tools`), because all commands are run from that folder.
   - When the skill is installed in the usual place: `Copy-Item "$HOME\.claude\skills\dark-history-shorts\project\*" -Destination . -Recurse`
   - Otherwise copy from wherever this SKILL.md lives.
   - If the working folder already has `_render`, keep it: an earlier video may have extended the rig.
2. Requirements:
   - Windows 10/11 with Windows PowerShell 5.1.
   - Google Chrome at `C:\Program Files\Google\Chrome\Application\chrome.exe`. If it's installed elsewhere, edit line 55 of `_tools/cdp.ps1`.
   - No ffmpeg is needed: encoding uses Windows' built-in media transcoder.
3. For sound, use the ElevenLabs connector ("creative" tools). Its sound-effects model (`eleven_text_to_sound_v2`) makes the SFX and ambiences. With the user's full account connected, the music model (`eleven_music_v2_5`, about 15 credits per second) makes the music; if its takes hang or fail with "Timed out while processing" (it happened for an hour on 2026-10-30), add the same prompt as an `eleven_music_v2` node, which came back in about a minute. Without it, generate music with the sound-effects model, using musical prompts and `loop: true`.
4. Smoke test: `.\_tools\cdp.ps1 -Page _render\video\main12.html -List '600,1500,2400' -OutDir _render\smoke -Port 9362 -Gpu` should write three JPEGs.
   - In a Linux cloud session (no PowerShell, Chromium and Playwright preinstalled): `node _tools/cdp.cjs --page _render/video/look20.html --list 30,90,150 --out _render/smoke --quality 98` (same page contract and output names as `cdp.ps1`), and `python3 -I _tools/sheet.py` for contact sheets and crops. ffmpeg stands in for the Windows media tools there; the audio, mixing and encoding scripts are not ported yet.
5. Number the new video's files after the highest existing ones so earlier productions keep working. Check `main*.html` for the names already taken before writing any file.
   - The Coca-Cola video continues `cast20.js`, `sets24.js` and `shots_w*.js` in `main20.html`, with `props18.js`, `_vo18` and `_sfx18`.
   - After it: `cast21.js`, `props19.js`, `sets25.js`, `shots_x.js`, `main21.html`, `_vo19`, `_sfx19`.
   - Old pages set `window.RIG_HANDS = 1` (the old hands). New pages leave it unset and use the clean rig (RIG_API.md, "Clean rig").

## Workflow for a new video

Work in this order and don't skip the review steps. The user values momentum, emotion and zero visual mistakes over speed.

1. **VO prep.**
   - Convert the mp3 to 48 kHz WAV, then trim only the lead-in, the tail and pauses over 0.6 s (`audiotool trim
     --maxgap 0.5 --mingap 0.6`). **Keep the narrator's own pauses (0.15-0.5 s)**: cut to 0.11 s the user found the
     voice "too rigid ... he ends one word and other appear instantly" (FEEDBACK_LOG 2026-11-09).
   - Word-align it against the script (`align2.ps1`).
   - The trimmed VO length sets the frame count: `frames = ceil(seconds * 60)`. The voice ends inside the last frame.
2. **Beat sheet.**
   - Split the script into 15–25 beats, one per clause, pinned to word times from `words.txt`.
   - For each beat, write down what is literally on screen (the noun or verb being spoken), the emotion, and one camera move.
   - Mark 2–4 emotional peaks for longer, slower holds.
3. **Ending decision.** By default the video **loops**: the last line hands off to the first and the final frame recomposes frame 0. If the user says no loop (like The Worm), end on a strong reveal with the music running to the last frame.
4. **Cast** (`castN.js`).
   - New characters every video, and **every face different**: vary jaw, cheeks, eyes, nose type, lips, ears, hair and headwear through `fx` (see RIG_API).
   - The main character should match the vibe of the role.
   - Render a cast sheet with full-size close-ups and finish every character to the checklist in FEEDBACK_LOG 2026-11-08 (faces, eyes, hair, costume, hands, light on the figure) before building any shot.
   - Dress and light them like `castT1.js`: hair from `hairkit.js` (rig `hairStyle: 'bald'`) drawn inside the figure's light pass (`Q.litHair`), `weave` on every garment, finished tailoring (`T.jacket({ weave, velvet })`, `T.vest`, pressed pleats). Review hair and hands at 2.5x (a page rendered with a device scale of 2.5); flaws there do not show on 1080 crops.
5. **Sets and props** (`setsN.js`, `propsN.js`): multiplane layers with depth `p`, always something moving in the background (fire, smoke, cloth, water, motes, crowds).
   - **Look approval (the user asked for it, 2026-11-08):** before building any shot, send the user the finished cast sheet and one lit still of the main set (SendUserFile), and wait for their OK. Fix what they flag first.
6. **Shots** (`shots_x.js`). Follow STYLE.md:
   - a camera keyframe track per shot, so the camera is never still
   - hand-held drift via `hh()`
   - a readable gesture plus expression on every beat
   - props rigid in the hand, with the grip derived from the prop
   - a transition of a *different* type at every scene change, 0.5–0.9 s, hidden inside a motion
7. **Check the code before rendering anything.** Open the page in a browser (the preview pane, `render-pages` on port 8765, or any static server on `_render`) and run JavaScript that:
   - loops `ENG.svgFrame(n)` over every frame and reports exceptions and any `NaN` or `undefined` in the SVG;
   - checks `ENG.trans.length` equals the number of `X.tr` calls, and the console has no "Uncaught". A transition whose focus point reads a value only set while drawing throws at load and silently drops every transition after it;
   - measures camera speed per shot (pan px/frame + zoom change) and keeps it under about 60. Slow any key segment that exceeds it.
   Stop the preview before rendering with `cdp.ps1`.
8. **Review stills before the full render.**
   - Render 30–50 test frames at the key times (`cdp.ps1 -List`), make contact sheets (`sheet.ps1`), and look at them at full size. Then render every 0.5 s of the whole film and review all of it.
   - Check hands, limbs, faces, layering, cropping and readability. In particular: no arm crosses a face, pointing arms are fully extended and clear of beards and bodies, close-ups have a clean background, and shirt colours don't read as bare skin. Fix and re-check.
9. **Full render, twice.** Copy `_tools/render_calf.ps1` to `render_<name>.ps1`: it renders the normal page and switches to the slow page (`mainNslow.html`: 700 ms wait) for the heavy transitions (liquid, organic, zmatch). Render pass A into `_render/framesNa` and pass B into `_render/framesNb`, both in the background, one renderer at a time (parallel Chrome instances cause raster glitches). Expect 0.6–1.3 s per frame. Keep any foreground wait command shorter than its timeout: a timed-out wait has killed the background render twice.
10. **QA.**
    - `cmpdir2.ps1 -A <passA> -B <passB>`: every frame must agree (worst block diff under 6). Re-render any that differ until two passes agree.
    - `glitch.ps1` must be empty.
    - `scan.ps1` must show no unexplained spikes, and the loop seam (last frame to first) must be no bigger than the average frame diff.
    - Dense contact sheets (every 6–16 frames) of the whole film, every transition and the last 3 seconds, and every hand on a prop at full size. If you change code after pass A, re-render the affected ranges of both passes (`rerender_astro.ps1 -Ranges`); for a rig change, `probe13.html` lists the frames it touches.
11. **Sound** (ElevenLabs).
    - **Music:** 4–5 cues (an underscore, a tension build, a tender or hopeful cue, a doom or climax cue, a twist or reveal cue). Use the music model when it is available: node_type `music`, model `eleven_music_v2_5`, `duration_seconds` 24–32, instrumental `lyrics_type`, and a prompt naming instruments, key, tempo and the energy curve. Otherwise use the sound-effects model at 12–22 s with `loop: true`.
    - **Ambience:** one bed per location.
    - **SFX:** one-shots for every action and transition (about 35–40), including character vocals.
    - Workflow: `creative_create_flow`, one `creative_add_flow_node` per sound (node_type `sfx`, model `eleven_text_to_sound_v2`, `duration_seconds`, `prompt_influence`, `loop`), `creative_run_flow_nodes` in batches of up to 17 with `generations_count: 1`. Then call `creative_get_flow_run_status` with all of a batch's session ids: the big result is saved to a file. Copy it with `Copy-Item -LiteralPath ('\\?\' + path)`, then run `fetch_<name>.ps1` (copy `_tools/fetch_calf.ps1`; its map turns a prompt substring into a clip key) and `towavhq.ps1` into `_sfxN\wav`.
    - Mix: copy `_tools/mix_heroin.ps1` and `_tools/heroin_arrangement.ps1` (or the Astrologer's or the Calf's pair). Then run `speechband.ps1 -Voice <vo stem> -Others <music stem>, <sfx stem>`: no window where the voice speaks should come within about 4 dB of the rest (flagged windows where the voice reads below −34 dB are breaths). The arrangement file lists the music beds, ambiences and one-shots, each placed by start time or by peak time on a word or action. The music ducks under the voice and crossfades into the opening cue at the loop seam; start the opening cue a little into itself (`$seamOff`) so the seam crossfades into the cue's own opening and the music never jumps.
    - Check `levels.ps1` for holes in the music. Generated drum cues have their own breaks; fill them with a second pass of the same cue offset by about 11 s.
12. **Encode and verify.**
    - Encode with `avi.ps1 -FramesDir <abs> -Wav <abs mix> -OutAvi '<relative>' -OutMp4 '<relative>' -Fps 60 -Kbps 20000` (the output paths must be relative).
    - `probe.ps1` should report 1080x1920 at 60 fps with one audio track.
    - Decode the MP4's audio to WAV with `towavhq.ps1`, then `synccheck.ps1 -Ref <mix> -Test <decoded>` should show an offset within ±5 ms and correlation above 0.99.
13. **Deliver** with SendUserFile: the MP4 plus three WAV stems (`_voiceover`, `_sfx`, `_music`). Summarise what is new, and say plainly what was checked. Then append the lessons you found to `references/FEEDBACK_LOG.md` and a beat summary to `references/PRODUCTIONS.md`.

## Rules that are never optional

- The camera moves on every VO line: pushes, pulls, pans, cranes and whips inside the set. Nothing is static. The background moves too.
- Motion must be smooth. Only use eased curves (`io`, `sine`, raised cosine) and never `Math.abs(sin)` kinks. Poses never snap, wrists never flip, and nothing jitters.
- Transitions must not be felt as cuts. Vary the type and never repeat one back to back. Don't reuse the previous video's set of transitions wholesale.
- **Hands:**
  - Fingers wrap the prop, and the prop moves rigidly with the fist.
  - The thumb is on the correct side.
  - Hands resting on tables are drawn over the tabletop: draw the table with `ST.behind(P, id, svg)` (masked round the forearms and hands), so they stay in the body's own light pass. Never relight arms on their own (`armsOver`): the rim then runs round each arm and it reads as a cut-out (2026-11-08).
  - A held prop and its detached fist are lit with the body in one pass (`ST.litWith(P, L, P.svg + prop + P.handR, ext)`).
  - The wrist (clean rig) curves from the cuff into the hand; check every hand at 2.5x where it leaves the cuff. Fists seen from the back with the fingers down read as paws: rest hands `relaxed` over an edge, with a soft contact shadow.
- **Limbs always connect to the body:**
  - Never place a separate close-up limb beside a body.
  - Never crossfade a rig limb into an art limb (this creates ghost legs).
  - Never show extra legs.
  - Use `legFx` on the rig's own leg, or hide the rig leg (`noLegs` / `hideLeg`) and run cloth continuously into the art limb, or frame a close-up with no body in it.
- **Look:**
  - Cinematic and adult: no cartoon "o" mouths, no flailing.
  - No AI glow, no yellow cast, no centred symmetrical sun.
  - Warm and organic rather than cold blue x-ray for inside-the-body views.
  - **The house look is the Taster / Tomb Builder / First Vaccine look** (the user's favourites; The Royal Fool lost it): a warm, limited palette with no large areas of saturated blue, one light source per shot with faces brightest and the background falling into shadow, faces or the story object big for at least 80% of the screen time (2–3 short wides at most, 1–3 locations), one main colour per character but richly finished, expressive acting with clean gestures, and 2.5D multiplane sets (a 3D perspective set only when one shot really needs a move through space). Details in FEEDBACK_LOG 2026-11-08.
- **Faces act:** fear, grief, stern, anxious, tired, snarl and cry, with brows, lids, look direction and sweat or tears. Background people react too.
- **Sound:**
  - Music and SFX come from ElevenLabs only.
  - Use bassy, beat-driven impacts and risers. Never use thin hissy whooshes.
  - Give characters vocal sounds (gulps, groans, gasps, laughs, shouts).
  - Always deliver the separate stems.
- **The user's latest rules** (after the approved Leech Collector sample; details in FEEDBACK_LOG):
  - Transitions are varied, soft and good: not just plain fades, but never flashy or fast. Hide each cut inside a camera move or a shape match so momentum never breaks. Use carry, zmatch, organic, push, morph (shape to shape, e.g. eye to eye), rack, radial (opening from a light source), liquid, a recognisable light-coloured object wipe, eyelid, surface or sweep, at 0.5–0.9 s, never the same type twice in a row. Never use `flash`, `glint`, `negative`, `whip`, `spin`, `bokeh` (the user disliked the golden bokeh bubbles), `iris` (it reads as a black hole) or dark-object wipes (they read as a dip to black).
  - **The ending keeps changing.** The last line gets 3–4 fresh visual beats (a reveal, a reaction, a time-lapse or flashback, then the loop match into frame 0) so viewers don't drop off before the loop.
  - **Zero mistakes.** The user has caught glitches before. Render twice and diff every frame, review dense contact sheets of every transition and of the last 3 seconds, and never let a limb float or an arm cross a face.
  - SFX are good and cinematic: deep, bassy hits and swells, rich foley, character vocals.
  - More camera motion, matched to the voiceover and always smooth. Open on a zoom-in already moving at frame 0. No long near-static holds.
  - Backgrounds are more defined: clear detail and texture where the light falls, thin local mist, light depth blur. They still stay darker, softer and lower in contrast than the actors: never evenly lit, pin-sharp, patterned halls.
  - The user supplies the script and the voiceover; don't generate a VO unless asked.
  - Brand-new cast every video, main character and side characters alike: never reuse an earlier video's faces (not even the Leech Collector's), and keep every face in a video different.
  - **In 2D the work goes into very good characters and sets:** character finishing and detail (faces, eyes, hair, costume texture and trims, hands, light on the figure), emotion and movement on every line (face, breathing, body acting, secondary motion), and very good, detailed sets and backgrounds. Checklist in FEEDBACK_LOG 2026-11-08.
  - **Hands: keep the rig's own hands** (`handV2`). The jointed per-shot hands in `hands20.js` were tried and rejected ("they look very odd"); don't use them.
  - **Clean, high-quality cloth:**
    - Set `G.RIG_CRISP = true` in the page before `rig3.js` loads. It gives a faint weave instead of a heavy speckle, light shading inside the edges, clean armhole seams instead of feathered yokes, and rounded elbows. Also set `ENG.GRAIN = 0.025` and render with `-Quality 98`.
    - Dress every costume as a real tailored garment, never bare lines: filled lapels that cast a soft shadow, a front edge with a lit seam, buttons with their own shadow, pocket welts and gentle pull folds. Use `tailor.js` (`T.shirt`, `T.collar`, `T.jacket`, `T.waistcoat`, `T.uniform`, `T.apron`), set `tailored: true` and give each garment its real length (`dims.hemY`).
    - Light waist-up figures from the chest with `stage.js` (`ST.up`).
    - Check every new cast full length on `rig20.html` before building shots. Details are in RIG_API.md ("Clean rig") and FEEDBACK_LOG 2026-11-08 (third round).
  - **Woven, finished cloth (2026-11-08, "not detailed and clean"):** `weave: { kind: 'twill' | 'linen', op: 0.12-0.14 }` on every character (the rig lays it on the torso and sleeves under their shading), the same weave on the lapels (`T.jacket({ weave, weaveOp })`), a velvet collar on frock coats (`velvet: true`), pick-stitched lapels, a silk waistcoat in the opening (`T.vest`), a shaped silk bow, pressed pleats, lace and pin tucks where the period has them.
  - **Hair (2026-11-08, "uneven", then "cutted at some points ... not matching"):** build it with `_render/lib/hairkit.js` (`HK.centrePart`, `HK.sidePart`, `HK.baldFringe`), never one flat shape with scratched lines, and draw it INSIDE the figure's light pass (`Q.litHair`), so it takes the same key and rim as the face. No hair ends in a straight cut (hair over the ears rounds back behind them; sideburns taper; a fringe thins out); one gradient per head for every piece; no fly-aways or hairline ticks.

## Writing scripts (when the user asks for ideas)

- "You are a ___" second person, about 120–140 words (about 45–50 s of VO), simple easy English, short punchy sentences with constant momentum.
- The user likes kingdom, court and thriller stories and real medical firsts (cowpox, rabies, the first blood transfusion).
- Open with the year and the role in one line. Keep the suspense in a long middle with escalating, visual beats. Land the twist in the last one or one-and-a-half lines, so the outcome isn't revealed early and viewers stay to the end.
- When the user says "don't change the script", only adjust what they named (length, ending).

## YouTube title and description

When asked:
- Give 3 title options: second person, curiosity gap, one emoji at most (💀 works).
- Then a description in a code block:
  - a 2–3 line retelling of the hook in second person
  - one line of real historical context
  - a question to drive comments
  - "Follow for more dark history where YOU are in the story."
  - about 8 hashtags (#history #darkhistory #historyfacts #youarea #storytime #shorts plus 2 topical)
