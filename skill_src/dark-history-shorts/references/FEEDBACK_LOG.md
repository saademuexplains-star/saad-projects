# Everything the user has corrected so far (never repeat these)

The user's words are paraphrased; the fix that worked follows each item.

## Before the first video (sample frames)

- **"Make it cinematic and adult, not cartoony; no AI look."**
  - No cartoon "o" mouths, no flailing hands, no cute oversized eyes.
  - No dreamy bloom, heavy glow, god rays or centred symmetrical sun, and no yellow cast. Use a neutral, realistic grade.
- **Hands looked pasted on.** They must grow out of the sleeve (wrist plus cuff shadow), share the body's shading, curl naturally, never be inverted, and never hide behind the belly. Arms are drawn in front of the body.
- **Backgrounds need crafted detail:** textured walls, props, workers, smoke, light falloff.

## The Messenger (first cut)

- **Every VO line needs a zoom or pan.** Nothing static, building momentum.
- **Transitions should be smooth and varied, and not feel like transitions.** Never the same twice in a row.
- **Remove the voiceover gaps.** The voice ends on the last frame, and the end loops into frame 0.
- **Sound:**
  - They hated thin hissy whooshes and SFX with no beat.
  - They want bassy, beat-driven scoring (kicks, risers, impacts, braams), SFX fitting each moment, and character sounds (laughs, sobs, gasps).
- **Transitions:** 0.3 s whips felt forced, repetitive and too fast. Use 0.5–0.7 s momentum carries (matched camera speed through the cut).
- **Motion:** "tik tik" jitter is unacceptable. Render at 60 fps with smooth easing only; poses never snap.
- **Hands:** no physics-defying prop rotation, no elbow flips.

## The Whipping Boy

- **"Give me VO and SFX separately, remove that music."** Since then, always deliver separate stems.
- **"Use more motion in scenes and more backgrounds."**

## Before The Royal Taster (third round)

1. **New cast, and every face different.** Vary the bone structure through `fx`, not just colours.
2. **"Hand mistakes again, in both previous videos."**
   - Props are rigid in the fist, with the grip derived from the prop's pose.
   - Hands on a table are drawn over the tabletop.
   - Wrists never flip.
   - A waiting hand is held at chest height, so the wrist clamp doesn't hang a spoon downward.
3. **"Scenes were static."** They want fast, constant motion momentum: dollies, cranes, vertigo pushes, foreground parallax, and characters always doing something.
4. **Transitions:** liked, but must be even smoother, so the scene change isn't felt.
   - Don't copy the same transition set from the earlier videos, and don't repeat much.
   - Prefer long continuous moves in one set and shape match cuts (plate, flame, glint, iris, liquid).
5. **"Most important: music and SFX from ElevenLabs."**

## The Worm (first cut)

- **"The 12-month part where he works is very static and doesn't look good, nor the blue transition coming and going."**
  - Problem: a man hoeing in place with a near-still camera, plus cyan x-ray scan bands sweeping in and out.
  - Fix:
    - a time-lapse with a crane down from the racing sky and a whip-pan between two moments of his life (the time jump happens off-screen)
    - a zoom-match dive into his belly
    - a warm organic inside-the-body world with the camera following the worm
- **"The leg is separated, come on, don't make visual mistakes."**
  - Problem: a separate side-view leg drawing placed beside the seated body. While auditing, three more errors turned up: ghosting when the rig leg crossfaded into the art leg, a figure with three legs, and rig feet poking out beside the art leg.
  - Fix:
    - wounds drawn on the rig's own leg (`legFx`)
    - `noLegs` under blankets, with the art leg emerging from under the blanket edge
    - seated pose: torso clipped at the hips, a thigh-shaped lap, the lower leg continuing out of its hem
    - extreme close-ups composed with no body in frame (underwater view, arms entering from off-frame)
- **"Add more zooms and pannings, and change the blue x-ray to something better."**
  - Fix: whip-pans inside the hut (twig → grimace), a tilt to the tally wall, follow-cam through the body, pull-back reveals.
  - Inside-body views use warm flesh (intestines, spindle muscles with tendons, vessels, bone), never blue x-ray.
- **"No loop needed in this one; use visuals according to what he's saying; I want the best video."** End on the reveal with music running to the last frame.

## The Leech Collector (10 s sample, approved)

The sample was locked. These rules apply to every video from now on (the user supplies the script and VO):

- **Transitions: varied, soft and good.** Never similar or repetitive. Not just plain fades, but also not flashy and not fast, so the viewer's momentum never breaks.
  - Prefer cuts hidden inside a camera move or a shape match: `carry`, `zmatch`, `organic` noise dissolve, `push`, `wipe`, `iris`, `liquid`, `eyelid`, `surface`, `bokeh`, `sweep`, at 0.5–0.9 s.
  - Avoid `flash`, `glint`, `negative`, `whip` and `spin`. Never repeat a type back to back.
- **SFX must be good and cinematic:** deep, bassy, punchy hits, swells and risers on transitions, rich foley on every action, character vocals.
- **More camera motion, matched to the voiceover, always smooth.**
  - Open with a zoom-in style move that is already moving on frame 0.
  - Key every push, pan or crane to the word times so moves land on the spoken beats.
  - No long near-static holds (the sample's 2.5 s leg close-up on a slow push was too still).
- **Backgrounds more defined:** clearer shapes and texture, more crafted detail, less flat fog and less heavy depth blur on the back layers (use `dof1` rather than `dof2`/`dof3` on mid layers; keep mist thin and local).
- **New cast every video, side characters and main character alike.** The user confirmed that side characters get fresh faces each time, and the protagonist ("you") is also rebuilt to fit each new role. Never reuse an earlier video's faces, the Leech Collector's included.

## The Blind Harpist (delivered, then the user found glitches at the end)

- **"There were glitches in the end, don't make mistakes in this one."** None of them showed up in `glitch.ps1`/`scan.ps1`:
  - GPU raster tile blocks that lasted several frames inside heavy transitions (zmatch, liquid, full-frame blur).
  - Arms drawn with `armsOver` floating on a table after the body had sunk behind it.
  - Hands crossing the face while lowering a crown.
- Fixes that are now the standard (see the QA list below): render twice and diff, the longer page wait, screen-pinned blur filters, `armsOver` only while hands actually rest on the furniture, hand paths kept off faces, dense contact sheets of every action and every transition.
- **"I want an outstanding video with very good and detailed visuals."** First-pass sets read as plain boxes. What lifted them: carved detail (linenfold panels, cusped arches, crocketed pinnacles, brass fittings, velvet), coloured window light falling across surfaces, light shafts with patterns, haze, smoke, and props on every shelf. Faces must read at a glance (beards and short hair for men who could read as women; open eyes, not sleepy lids).

## The First Vaccine (lessons found in our own review before delivery)

- **Tools in rig hands miss their target if you ignore the wrist clamp.** The rig clamps the hand ~75 deg off the forearm, so a requested finger direction can be rotated and the held tool swings with it. Use `toolPose`/`rigTool` from `shots_j.js`: the fingers are laid along the forearm (shoulder -> wrist) and the tool angle follows from a fixed hold angle, so the tool stays rigid and its tip lands exactly. Verify with the `?dbg` overlay (target circles) before trusting a contact.
- **Tools at real scale.** A lancet's blade is about the width of a child's forearm; first drafts drew it sword-sized. Hold props get their own size (`PR.lancetG({ size })`), independent of the hand.
- **Close-up limbs in a tall frame:** run the limb on a steep diagonal and keep the hand (and the other person's fist) inside the frame, or it reads as a pale plank. Give it a narrow wrist, muscle swell, groove and edge shadow.
- **Hair styles carry period meaning:** `curls` in grey reads as an 18th-century periwig (good for a doctor, wrong for a boy); `messy` tufts read as spikes on a child, so use `short`.
- **Faces:** keep lids around 0.15-0.25 for anyone meant to read as alert; 0.35+ looks sleepy at medium scale.

## The Rabies Boy (lessons found in our own review before delivery)

- **Small props vanish behind the fist.** A syringe drawn at hand scale disappeared inside the doctor's fist. Hold it by the back of the barrel (shift the prop forward inside its grip frame) so the dose and the needle stand clear, and size it so the barrel is longer than the fist is wide.
- **Open on a face, not just an object.** The first frame showed a needle over a bare belly and read as abstract. Frame the frightened face above the needle and push down onto the needle as it closes in. The hook needs a person in it.
- **Animals need anatomy.** Stick legs plus triangle hackles read as an insect. Use a deep chest, a tucked belly, a haunch, tapered two-segment legs that grow out of a shoulder or thigh muscle, a thick tapering tail, and fur tufts instead of spikes.
- **Never hide the key action.** A dog attack that happened behind a wall showed only an arm and a dog lying on the wall top. Stage the struggle above the occluder: the dog rears up with its hind feet hidden, its jaws on the raised arm, and the victim is pushed back but stays in view.
- **Moving an object between parallax layers jumps.** Keep it native to one layer and convert its targets into that layer's coordinates each frame (`toWall` in `shots_k.js`). Switch draw order only at a moment when nothing overlaps.
- **Iris transitions draw a black hole on the face** unless the push into the eye is deep. The darkness grows faster than the pupil. A morph (zoom into the eye while the next shot opens from a matching point) is smoother.
- **A foreground wipe with a black object is a dip to black.** It has to cover the frame at the switch, so make it something the viewer recognises (a linen curtain between ward beds), not an anonymous dark blur.
- **Night scenes go too dark fast.** Overlapping night multiplies plus a night grade crushed the kennels to black. Use a lower night value (about 0.55), add a practical light (a lantern pool) where the action is, and check the darkest frames at full size.
- **Period headwear can read as a cartoon.** The Alsatian black bow read as mouse ears; a kerchief kept the period without the joke. A kepi has to sit low on the brow; a gap above the forehead looks pasted on.
- **Long-path tool output:** saved `creative_get_flow_run_status` results live under a path longer than 260 characters. Copy them with `Copy-Item -LiteralPath ('\\?\' + $path)`. Query 15-20 sessions per call so the result goes to a file instead of flooding the context.

- **No golden bokeh bubbles (user, after delivery).** The bokeh rise read as cheap; a slow match dissolve (the dead rabbit's shut eye into the boy's open eye, morph with no glow) replaced it. Drop `bokeh` from the palette.
- **The ending must keep changing (user, after delivery): "add another visual scenes in last part ... so viewer dont drop away".** A pull-back plus one long crane up a facade lost viewers. The fix gave the last line four beats in one continuous move: the years passing around the hero at his post (autumn leaves, snow on the spears and his cap, blossom, his moustache greying), the mentor at a lit window nodding down to him, the name over the door, and a gilded spire that dives into frame 0.
- **Check foreground occluders when craning across parallax layers.** A gate pillar on the near layer hid the window on the far layer. Move the camera sideways until the near object slides out of frame.

## QA lessons learned the hard way

- **Render the film twice and diff every frame.** Raster glitches are random, so a frame that differs between two passes is a glitch: re-render it until two passes agree. Single-frame detectors miss multi-frame glitches during fast motion.
- **Page wait:** 4 animation frames plus 120 ms before the screenshot (3 + 40 ms let heavy frames slip).
- **Screen-space blur filters** must use `filterUnits="userSpaceOnUse"` sized to the screen; `objectBoundingBox` on world-sized groups gets dropped by Chrome on random frames.
- **Draw order with furniture:** arms that rest on a kneeler, table or door are drawn after it only while they rest there, and they get the same clip as the body (a curtain or wall that hides the body must hide them too). Moving characters keep their hands relative to their own body, never pinned to fixed world points.
- **Contact sheets:** every 4–8 frames over every action (entrances, exits, hand-offs, falls) and every transition, plus the last 3 seconds.

- **Parallel renderers cause raster glitches.** Use one renderer and a 3-rAF + 40 ms wait.
- **Giant blur filters break in Chrome.** Use radial gradients for big soft darkness, and cull long shapes to the view.
- **Transition curves need zero slope at both ends** (e.g. `pow(sin, 0.7)` popped), and must dissolve A→B inside the effect rather than hard-swapping.
- **A shot whose `t1` runs past its outgoing transition re-appears for a frame or two.** Trim `t1` to the transition end.
- **Lighting presets switching on screen pop.** Keep one preset and darken through the set's overlay layer.
- **Path sampling must stay anchored** when culling to the view, or shapes shimmer as the camera moves.
- **Generated music cues have silent intros and decaying outros.** Check envelopes and overlap passes so the music never drops out by accident.

## The King's Decoy (lessons found in our own review before delivery)

- **Set the camera before lighting anyone.** `X.lit` culls characters against `X.CAM`; a shot that calls `hh()` after building its characters culls them against the previous shot's camera, so they vanish inside transitions (the loop's zmatch showed an empty room). Every shot computes `c = hh(cam(t), ...)` first.
- **The light box clips anything held outside the body.** A crown lifted above the head (crownLift) was cut to a sliver by `C.lit`'s bounding box. Draw it separately with `R.crownArt` under the same transforms (person, head, the face's (fx.w, fx.len) scale) and it lines up exactly with the worn one. Same for torches: draw the torch in world space between the lit body and its detached hand.
- **`sway` rotates the whole rig about its feet.** Four degrees swung a seated passenger's head 100 units sideways out of his window. Lean with scale and position, not sway, when the feet are off-screen.
- **Cut-out horses:** draw all legs before the body so their tops disappear under it, lay the neck over the shoulder without an outline at its base (one continuous animal, not a sausage plus planks), and bend the neck with a weighted rotation (0 at the withers, 1 at the poll) so the head can nod without tearing the crest.
- **People seen through a window:** clip them to the opening and draw them behind the shell; when they lean out, widen the clip and draw them over the frame, sill under the waist; an arm reaching past someone in front is redrawn over that person in the same frame.

## The Calf's Blood (lessons found in our own review before delivery)

- **Someone standing behind a seated person** (a porter holding you down) puts their hands on the far edges of the shoulders (about ±190 of the seated rig's local units), not on the shoulder points. Hands closer in run the arms straight down across the seated face, and any sway or head tilt walks the face into them. A dead head should tilt away from the arms.
- **Pointing arms must reach well clear of the body.** A half-length point ends behind a long beard or inside the light box and reads as nothing. Aim the arm nearly straight, a little above the target so it clears whoever stands in front.
- **Shirt colours near the skin tone read as a bare chest** (the rig's torso shading looks like muscle). Use a clearly different linen colour (grey, blue, dark), and keep the `patch` stitches off the chest.
- **Radial reveals open where the light is.** Put `fb` on the bright source in A (a window at dawn). A small B-circle opening over a face or hands reads as a glowing blob.
- **Check who stands behind a close-up prop.** A background extra's apron behind a chamber pot filled the close-up like a curtain; move extras so close-ups have a clean background.
- **Animals:** a lying calf reads by its long neck, wedge head, broad muzzle, sideways ears and a blaze. A short head on a loaf body reads as a rodent. Draw the neck over the body with no outline at its base, as with the horse.
- **Check that every transition registered.** A transition whose focus point was read from a value set only while a frame is drawn (`ST.candleSmoke`) threw at page load, and every `X.tr` after it was silently dropped: three scene changes became hard cuts and the loop never closed. Define focus points statically, and after load check `ENG.trans.length` and the console for "Uncaught".

## The Royal Astrologer (lessons found in our own review before delivery)

- **Eyelids broke above `lid` 0.46 (rig3, fixed).** The lid's skin polygon started at `yc - 0.6ry`, which sinks into the eye as `lid` grows, so a closing eye re-opened under its own lash line: a dying woman's eyes opened as she died, and the middle frames of every blink in every video showed a downward twitch instead of a closed eye. `eyePair` now keeps the polygon's top above the eye (`yLt`). After a change like this, `RIG.lidProbe` (reset, draw a frame, read the highest lid) lists exactly the frames it touches: `probe13.html` → `probeLids()`, then re-render only those (`rerender_astro.ps1`).
- **A desk in front of a standing character goes at his hands, with legs running past his feet.** The tower desk at floor height left the writing hand 370 units above the chart (it could never reach it) and the desk floating at his thighs. Raise the top to the hands (`S.towerDesk` `dy`, `legY`, `cand`), shrink anything tall on it so it clears the face, and draw the hands after the desk (`detachHand` + `handsLit`). Check a hand on its prop at full size; a 12-tile sheet hid this through every review.
- **A zmatch focus point must be on screen at the transition's centre.** An `in2` pan that only reached the bedside candle after the shot ended left the flame off-frame, so the "match" was a muddy dissolve of pillows over a guard. Drift the camera onto the object just before the centre, and open B with its matching object at the same screen spot (here the corridor opens on the guard's torch, then pans to the people).
- **An arm lying on a quilt:** a hand target close to the shoulder folds the arm into a V that reads as a sheet of paper. Put the hand well out on the quilt, and clip the arm to below the turned-down sheet's edge so it comes out from under it.
- **A quill drawn with two separate vanes reads as a fan of three blades** in a fist. Draw one vane round the shaft.
- **Hits go in the breath after the key word, and the music falls silent under the punchline.** "costs your head." [boom], "murderer." [boom], "...before Your Majesty." [orchestra lands]; a boom on the word buried it. Judge masking in the speech band (>300 Hz) of the voice against the music and SFX stems: sub booms inflate plain RMS without hiding words.
- **A cue's stereo peak may be its second swell.** `PeakAt('m4_climax')` found the re-hit at 2.52 s, not the first swell at 0.71 s, and started the climax 1.8 s early, over the silence after the question. Read the envelope and place cue hits explicitly.
- **GDI+ (`Bitmap.Save`) resolves relative paths against the process directory, not PowerShell's location** (after `Push-Location`): pass absolute paths to `sheet.ps1` and image crops.

## The Heroin Bottle (lessons found in our own review before delivery)

- **rig3 clamps the wrist.** The forearm may turn at most `lim` from the line elbow→hand (1.3 rad at full stretch, opening to 0.97π as the hand nears the natural elbow point). A pour asked at arm's length bent the fist back: the bottle pointed at her own chin and the spoon stood upright in her lap. `handFrame` replays the clamp so props drawn in world space follow the real fist, and `G.HF_LOG` lists every clamped frame; keep it empty. Stage actions inside the limit (a swig with the fist under the chin and the neck up; the spoon resting on the bed edge; a small 50° → 28° turn to feed).
- **Pours and other fine hand work go in close-up inserts.** At full-body scale a bottle tipping into a spoon reads as nothing and fights the clamp. Two `closeHand`s (sleeve with creases, cuff and buttons, a tapering skin wrist, then `R.hand`) over a soft backdrop made the pour the clearest shot. Plain rectangles for close-up forearms read as planks.
- **`EZ.io` peaks at 3× its average speed** (`sine` about 1.57×). A camera key that looked gentle on average whipped at 109 px/frame in the middle. Measure the peak per frame, and use `sine` for long pans.
- **One continuous shot through two rooms:** build the bedroom and the kitchen side by side in one world, split by a partition wall (a dollhouse cutaway), and pan from one to the other without a cut. A character can't be in both rooms, so she moves rooms at the moment the camera's centre crosses the wall (`crossAt` finds it from the camera track), when neither of her places is in view; keep the zoom at 1.7 or more there so both are off-screen. The child switches to withdrawal at the same moment, out of view.
- **A long shot cut by inserts is split into segments** (HOMEa/b/c). Outside a transition the first registered shot wins, so a long shot registered first hides any insert inside its range.
- **Floors:** a black-and-white checker floor read as a giant chessboard. A perspective grid (`Y = vy + (2800 - vy) / z`) with fine grout reads as tiles. A shawl drawn as stripes on a triangle read as a fan: clip a knit texture to the shape and add crossed ends and a fringe.
- **Vocal SFX sit in the voice's band.** The first mix had 77 windows where coughs, sobs, the scream and the lullaby came within 8 dB of the voice (`speechband.ps1`). Low-pass vocal SFX that play under words (3–3.5 kHz reads as "through the wall"), lower them, move one-shots into the breaths, and duck music 9 dB under the voice. In the final mix the only windows within 4 dB of the voice are breaths (after "angel.", before "the line", before "the bottle"), and under "the bottle was Heroin" everything else sits 30 dB down. A flagged window where the voice reads below about −34 dB is a breath, not masking.
- **Someone behind a counter: clip them at the counter's foot.** The pharmacist stood with his feet below the counter's base line. That stayed hidden while the day camera was high, but the night queue's low camera showed his legs under the counter. Also draw whatever stands on the counter in front of him (the register) after his arms, and keep see-through props off his body (a glass jar of lozenges read as coloured spots on his coat).
- **Arms on a table for a push-in:** "relaxed" hands far out (±150, pointing down) bow the elbows out into the neighbours, and a colleague's hand beside his reads as a third hand. Clasped hands (±45, dir ±0.75/0.45) keep the arms inside the body. A prop that a transition focuses on (the rack's bottle) must stay in clear view: stand it in front of the hands and draw it after them.
- **An arm blended between two poses whose elbows sit on different sides of the shoulder flips in a few frames, however slow the blend.** The pharmacist's hand coming back from tapping the carton (elbow out at his side) to his clasped rest (elbow under the shoulder) snapped through in three frames with `io`, and still in three with a slow `sine`. `scan.ps1` flagged it as a spike. Leave the hand where it is (his finger stays on the carton into the morph), or route it through poses whose elbows stay on one side.
- **Check the last scenes at full size, frame by frame, before the full render.** The 0.5 s sheets at tile size hid the legs under the counter, the tangle of arms and a dim, small punchline label. At the punchline the word fills the frame and is lit: a soft light pool in screen space over the night overlay, with one continuous push-in that is fastest on the word.
- **User correction after delivery: "bottle is behind shoulder".** In the opening the bottle was drawn before her body (right while it stood on the shelf), so once she held it up at her shoulder, her arm and shoulder covered all but its neck. A prop held in front of the body is drawn after the body and before the fist: body → prop → hand.
- **User correction after delivery: "the sunshine is cut from the top".** The pharmacy's sun shaft sat on the floor layer (p 1) and the window on the wall layer (p 0.88). Parallax slid the shaft up to 140 px off the window, so a flat-topped beam at full strength started on the bare wall. Put a light shaft on its window's layer, and fade it in from the glass (`shaft(pts, col, op, id, fadeIn)`) so no edge shows where it starts.
- **User request after delivery: one constant music track that builds suspense, as its own file ("dont remix video just give me music").** Make it with the music model at the video's exact length (`duration_seconds` = VO length, instrumental), in three takes. Judge them with `bandenv.ps1` (low, high and full-band envelopes): one take held a flat loop (no build), one faded out over its last 6 s, and the keeper stepped up at the midpoint, brightened to the end and rang out on a final hit. Trim to the exact length, peak to −1 dBFS, and deliver it as a WAV.
- **Sleep pauses a background render** (cdp calls fail with "Call cancelled" and the chunk retries on wake). Ask the app to keep the computer awake (`request_keep_awake`, until the session is idle) before a long render.
- **The ElevenLabs music model** (`eleven_music_v2_5` nodes in a flow, available once the user connected the full account) makes real cues with structure: a parlour rag, a ticking build, a horror cue and a dirge. Read each envelope (`levels.ps1`) and place cues by their swells.

## The Cells That Never Died (Henrietta Lacks, 2026-10-30)

- The user ran low on weekly usage mid-production and asked to spend it carefully. When that happens: one contact sheet of ~30 key frames instead of many review rounds, a single render pass plus `glitch.ps1` + `scan.ps1` (re-render only flagged frames) instead of two passes, and reuse earlier ElevenLabs clips (`_sfx13`, `_sfx14`) for generic hits and ambiences; generate only the new specific sounds.
- Leaning or lying people (`sway` != 0) must be drawn raw (`rawP`), also when sitting up in bed: `C.lit` clips to the upright box and cut her head off in the ward shots, leaving only the hair art.
- A shot whose `t1` is even 0.01 s past its outgoing transition's end shows for one frame after it (frame 1266 here). `scan.ps1` catches it as a lone spike; set `t1` exactly to the transition end.
- Hands on hips: give the arm `fs: 1` and `elbow: 'free'`, hand about `[±120, -840]`, `dir [±0.7, 0.7]`. Without `fs` the rig foreshortens the forearm and the arm just hangs.
- Big `objectBoundingBox` blur filters (`dof*` on wide groups, `b2` on rain over the whole frame, `dof1` on long organic folds) risk Chrome dropping them: cull to `X.viewRect` or use a `userSpaceOnUse` screen-sized blur (`sBlur` in `shots_q2.js`). The sepia filter on a frame drawn inside a photo also needs `userSpaceOnUse`.
- `P.doublingCells` was rewritten to be continuous across generations: daughters slide to their next-generation places and the parent outline fades over them; the old version jumped at every integer.
- The photograph loop: the last shot pushes into a sepia photo whose image IS the first shot (`X.renderShot('HOME', t - T_END)`), the camera lands exactly on its image rect, and an `organic` end transition with `za = zb = 1` lets the colour seep back in. It loops with a seam diff of 0.70 against an average of 3.4.
- ElevenLabs `eleven_music_v2_5` hung for over an hour, then failed with "Timed out while processing". The same prompt on `eleven_music_v2` finished in about a minute.

## The Pied Piper (legend, 2026-11-01; lessons found in our own review before delivery)

- **A figure on a layer other than p 1 must be lit and culled with that layer's view.** `C.lit` clips a body to `X.viewRect(p)`; with the default p 1 the Piper on the gate street (p 0.8) lost his head in the close-ups and was cut in half, then reduced to a hat and a pipe, on the rock (p 0.85). `shots_r.js` draws such figures inside `atP(p, () => ...)`, which makes `lit`, `litBody`, `armsOver` and `handsLit` use `X.viewRect(p)` / `X.lit(P, L, p)`.
- **Camera keys aimed at something on another layer go through `camOn(x, y, p)`.** The window close-up used p 1 coordinates for a mother on the house front's layer (p 0.86) and framed her off-centre and cut.
- **Brows are `[inner, outer]` and positive means DOWN.** Fear, grief and worry need the inner end up (negative); a positive inner value is an angry frown. Every fear/grief face in the first pass read as anger (the deaf girl looked furious). Copy the presets: fear `[-9, -2]`, grief `[-10, 3]`, anxious `[-6, 1]`, stern/menace `[8, -3]`. A sly villain is a smirk with lids about 0.3 and menace brows; lids near 0.46 read as sleepy and sad.
- **A one-layer perspective street fixes the camera height.** People scale with `y` (`s = 0.000385 * (y - VPY)`), so the camera looks down and a face close-up has pavement behind it. Blur everything behind him in screen space as the zoom rises (`sBlur(back, 9 * ss(1.7, 3.4, zoom))`) and ease the arch's light rays off with the zoom (`lightK`), or the face washes out.
- **Cobbles have to be packed.** Loose ellipses with gaps read as polka dots and, under a highlight, as bubble wrap. Make each course as deep as its spacing (computed from the perspective curve), stones touching, staggered by half a stone, low contrast, only a faint lit rim.
- **Distant farmland is built in perspective, never as rows of rectangles** (those read as a brick wall behind the characters). `farmland()` in `sets19b.js`: rows that thin toward the horizon, every field's sides running back to one vanishing point, furrows and crop rows on the near fields, hedgerows along every boundary with trees and copses in them, aerial haze, a river that narrows into the distance, and the walled town (wall ring, towers, packed roofs, two churches, a bridge, lit windows at dusk).
- **Rocks:** a smooth dome with strata lines read as a beehive, and a stepped outline read as a ziggurat. A tor reads as rock: rounded slabs stacked in offset tiers and split by joints, each with a lit top, rain runnels, grain, lichen and moss, a horizontal light gradient per block, outlines on every block, and boulders at its foot.
- **Beds hide what is behind them only if they reach the floor.** The quilt ended mid-air and both the child's and the father's legs showed underneath. The quilt now falls over the foot of the bed to a hem, with a dark gap and two short legs below. Check adult-to-child scale by head size (a grown man's head about 1.15x a 7-year-old's); the father at s 0.58 next to a child at 0.9 read as another child.
- **Foreground blades culled to the view must sit on a fixed world grid** (one seeded blade per 70 px cell, only the cells in view drawn). Random positions inside the current view rect ride along with the camera instead of passing with parallax.
- **Clip scattered grass strokes to the ground shape.** On the wide hill, strokes placed in a rectangle floated as specks in the sky above the crest.
- **Frame the set's best pieces inside the shot.** The kitchen had a fire, a window and herbs on a beam, all just outside the camera; moving them in (and opening the shot a little wider) turned a bare wall into a kitchen.
- **The kids' tunic prop drew a V at local y -640..-600**, which is the chin on the kid rig (the rig draws its own neck slit). It read as a split chin on every child; check props against the rig's landmarks on the cast sheet.
- **The `lens` transition draws a growing circle with a rim** and reads as an iris; use `liquid` (the story melting into the real hill) or `rack` instead.
- **Children standing in a row read as a line-up.** Spread them in depth (scale by y, far ones by the well, near ones big at the frame's edges), give each an action, and draw everything far to near; time a ball's bounces with real physics and slice the bounce SFX onto each impact.
- **Audio automation `AutoG` multiplies the event's gain** (1 = its base level). Writing absolute levels into it applied them twice: the drone came out 12 dB lower than planned.
- **"The music has stopped":** cut the score and the diegetic tune together with a reverse suck into silence, hold about a second of dead air under the line, then let a low drone creep in on the music track so the suspense stays constant (the user prefers one continuous build). The tune itself returns faintly under the reveal and swells across the loop seam into frame 0 (every music element playing at t = 0 goes into the seam's pre-roll, `$seams`).

## The Pied Piper, third cut (2026-11-02): "use our cast ... fix the shoulder glitch and the hand indifference"

The user rejected the first cut outright ("so bad set, 100 of glitches, lame visuals and sets, motions why?", "the
video should feel like video"), loved a shadow-theatre sample but did not want the whole film in silhouette, and then
rejected new profile characters: "use our cast, don't change characters, fix their bugs". The third cut keeps the cast16
puppets and rebuilds everything around them.

- **Shoulders (rig3):** the upper arm used to end in an outlined round cap drawn over the torso: a ball joint. Now the
  arm is split into `up` (upper arm) and `lo` (forearm + hand); `person()` draws the upper arms, then the top of the
  torso again over their roots through a vertical feathered mask (the "yoke", shY+0.58sw .. shY+1.3sw), so the sleeve
  grows out from under the shoulder line at any angle. The shoulder joint sits at `shX*1.02 - sw/2` so the sleeve's
  outer edge continues the shoulder's widest point. A mantle (the Piper's capelet) is drawn after the upper arms.
- **Elbows:** one continuous outline for the whole sleeve (an arc round the outside of the bend, the edge lines meeting
  in a crease inside); the forearm fill uses the upper arm's gradient (same stops, oriented outer to inner, vector
  width `sw`) and starts flat at the elbow. A round forearm cap or a mirrored gradient shows as a disc at every elbow.
- **Hand indifference** was lighting: a detached hand lit in its own `C.lit` pass gets a rim all round its own small
  silhouette and reads pale and pasted on. Light body, held prop and hands in ONE pass (`SH.draw(P, o, art, L, mid)`
  in `shots_u.js`: `P.svg + prop + P.handR + P.handL`). A detached hand now carries its wrist and the end of its cuff,
  so the sleeve still overlaps the wrist when the hand is drawn over a prop.
- **Rim width:** `C.lit` rims scaled with `s` up to 2.2x became 20+ px pale bands that read as a translucent ghost
  round dark cloth and hair in close-ups. Capped at 1.25x, blur 0.32w.
- **Costume overlays** go in `o.costume` (clipped to the torso path, drawn under its shading and outline), not in
  `o.props` (drawn after the head, over the arms): the Piper's yellow half was a flat-topped rectangle sticking out of
  his body. Long hair and a wimple's veil hang BEHIND the shoulders (`backHair()` drawn before the torso); the wimple
  is one outlined piece with a soft rounded hem over the chest (it was a flat paper bib with a hook).
- **Walking front-facing puppets:** `o.steps { R: [dx, dy, k], L }` moves each foot; `SH.walk(dist)` gives planted
  feet that drift up the screen as the body passes (walking toward the camera), a lifted swing foot, a bob highest
  over each foot, a weight-shift sway and arm swing. Stage walks TOWARD the camera; for walking away use backlit
  silhouettes (front and back look the same in silhouette).
- **Sets in perspective** (`street3d.js`, `terrain3d.js`, `hamelin3d.js`; since 2026-11-08 only for the rare shot
  that really needs a move through space, never the default set style): a real camera (x, y, z, yaw, pitch, focal
  length) through a world in centimetres; half-timbered houses built from quads (jetties, timber frames, windows,
  shutters, flower boxes, gables, roofs, chimneys, signs), the town gate, church towers, cobbles, washing lines,
  height-field hills with a path ribbon, fields with furrows, hedges, trees, the river. People stand in it as
  billboards scaled by distance (`SH.at`) and are depth-sorted with signs, barrels and wells. Camera tracks are
  Hermite splines (`SH.spline`), so velocity never jumps at a key.
- **Gotchas found on the way:** sort a strip laid on terrain by its NEAREST corner or the grass under it covers it;
  overlap two terrain grids or a crack shows the sky; a gable needs BOTH roof slopes or the far barge board floats;
  `-(x) ** 2` is a JS syntax error (write `-(x ** 2)`); PowerShell `-replace` is case-insensitive and a backtick in a
  PS double-quoted string eats a JS template backtick (use the Edit tool for JS); define camera functions before the
  `X.tr` calls that read them; never overwrite another production's file (check `main*.html` before naming).

### Review of the third cut's first full pass (what still slipped through)
- **A hand target inside the face is an arm across the face.** The son chasing his hoop had his right hand set to
  (10, -680) in kid units: that is between his nose and mouth (kid head centre -734, chin -624). Before using any
  rig-local hand target, check it against the head box (centre `headY`, chin `headY + chin`) and keep hands on the
  side where the action is: a front-facing puppet reaching toward screen right uses armL (screen right).
- **Never switch a hand target between two places in one frame.** Catching hands were `mine ? ballPos : ready`, so
  they jumped 40 px at every catch. Blend instead: the catcher's hands reach toward the incoming ball over the last
  third of its flight (`ss(0.55, 0.92, k)`), the thrower's follow it away and return (`1 - ss(0.08, 0.35, k)`); the
  weights meet at 1 and at 0 where the roles swap, so the motion is continuous.
- **Blending play arms into walk arms must keep pose and facing.** `Object.assign({}, walkArm, { hand })` replaced an
  open palm with a relaxed back-of-hand the frame the walk began (a wrist flip on every child). Keep the play arm's
  pose and facing and turn its `dir` toward [0, 1] as the arm drops.
- **A prop never vanishes in view.** The watering jug was drawn only while `pour > 0.01`: it disappeared from her
  hand with her 400 px tall in frame, and it was drawn at the pour pose while the hand slid away. Draw a held prop at
  the HAND's current target, and get rid of it by moving it out of view (she lowers it inside, below the sill clip).
- **An emotional line needs the face big on the word.** The mother screamed at 300 px tall with a 'shout' mouth that
  read as a small "o". Land the camera on a close-up (face 250-350 px) on the spoken word itself ("scream" at
  17.08 s), and use the rig's `mouth: 'scream'` (open 1.2, wide 1.4, corners down 6, lip raised; about the largest
  jaw a woman's face holds before the lower lip crosses the chin). Ease every face parameter into it from the look
  before (brows, lid, open, wide, cd) or the mouth pops wider at the onset.
- **A woman running in a long skirt reads as standing** (no legs, fists at the waist). Hitch the skirt: `legsW: 1,
  dims: { hemY: -190, legX: 34, legW: 44 }`, dark stockings and shoes, `steps` from `SH.walk` with a big lift, one
  fist gripping the skirt at the hip, the other arm pumping in time with the stride; turn the camera with her so she
  stays left of centre. Fade her in from the dark doorway rather than popping her into it.
- **Strips on terrain: nearest corner is not enough.** With 2 m grass cells, a cell's centre can be 1.4 m nearer than
  the path strip lying on it, and near the camera the log depth bands are only 0.35 m deep, so every other path slab
  vanished under the grass in a low pass along the path. Sort a strip at `nearest corner - (0.71 * cell + 80)` (keep
  the true depth for its haze and line width). Build furrows point by point and only where `fieldAt()` is that field,
  or they cross the path and the meadow beside it.
- **Close-ups expose low-poly props.** Geraniums made of 6-sided rings were fine at 300 px and turned into flat
  hexagons when the camera came in for the scream: give anything the camera can reach 14+ sided rings, a darker rim
  and a centre.

## The Pied Piper v2 (2026-11-02): "200+ glitches ... trees, house, hens, shadows, fadings, 100s of blinkings"

Two renders matched on every frame and the user still counted hundreds of glitches: they were deterministic, the same
in both passes. Find them with `_tools/pops.ps1` (a per-block temporal scan: "pop" = a block changes far more between
t-1 and t than just before and after; "blink" = frame t unlike both neighbours) and look at the strongest events per
second with `_tools/popview.ps1` (the frame boxed, then t-1 / t / t+1 crops). Fast running legs and fast pans also
score, so judge the sheets by eye. What they were, and the rules that came out of them:
- **Nothing switches at a threshold.** Houses dropped all their timbers, windows and doors past `lodD`; figures got
  their cast shadow at 620 px and lost their soft shading under 480 px; trees vanished nearer than 15 m and beyond
  600 m; the whole inner town toggled with the camera's height; procession children popped at 2 m and under 3 px.
  Fade by distance or size instead (`1 - ss(a, b, d)`), and only drop what is invisible either way (blur under 150 px).
- **Sort by straight-line distance from the lens** (`cam.dist`), not depth along the view axis: two things side by side
  have equal axis depth and swap order as the camera turns, so a neighbour's roof or end wall flickered over the house
  in front for a frame. Everything in one sort must use the same key. Trim roof overhangs that intrude into the
  neighbour's volume.
- **Clip at the near plane, never cull by a centre.** Wall faces, washing lines, signs, path strips and figures vanished
  while still half in frame because their centre (or world z) passed the camera. `T.path` / `T.lineD` already clip;
  cull only when every point is behind the lens. Off-screen culls use the object's whole extent, not its foot point.
- **Seed every small element by its own index.** The setts switched from 7 to 11 corners at 3 m, which re-randomised
  the shapes of the whole row: the cobbles blinked under every walking shot.
- **Generated scatter must not move with the camera.** Grass tufts filled a square around the camera, so they popped
  in at its edge; fade them over the outer third of a circle, and grow none along the camera's own path.
- **Speed.** Leg cycles at twice a real pace strobe (a run needs a stride of ~110-120 cm, a walk ~55); a foot that
  leaves the ground at full speed judders (lift with `sin^2`, zero speed at both ends); `Math.abs(sin)` hops jitter; a
  camera flying 11 m/s three metres over the children streaked them across the frame (fly higher and slower, crane up
  rather than skim); a camera landing on a close-up must ease to a stop (`'stop'` key); a 150-degree pan in 1.6 s
  made the crenels strobe. Fast turns now get a shutter-like blur along the pan (`SH.mblur`, applied per shot from its
  camera), only above ~13 px a frame so ordinary moves stay crisp.
- **Things on terrain are drawn among its depth bands** (`TR.ground(..., { items })`): before, every tree and figure was
  drawn over all the land, so anything behind a crest showed through it.
- **"Fadings"**: the cross-fades of push / morph / rack / carry / zmatch showed two shots through each other for 15-25
  frames. Keep the swap to a few frames at the peak of the blur or glow (`fade: [0.44, 0.56]`), and match dark to dark
  or light to light (the dark window into the dark doorway).
- **Masked transitions double the image too** (found in the v3 QA, so check every transition every 3rd frame: the pop
  scanner does not flag a slow dissolve). A radial reveal's soft band crossing a busy area showed both shots' paths
  and processions through each other for 15 frames; a lit ring on the band only looked like a soap bubble. The noise
  dissolve of `zmatch` left grey blotches of the next shot over the last, like smoke (use `plain: true`). A morph whose
  two shapes sit in different places is just a double exposure (use `align: true`, `blur`). A radial out of a sun that
  sits behind a silhouette's head opens as a black blob (the loop): check what B shows at `fb`. The cleanest swap is a
  recognisable light-coloured thing filling the lens: a corner of pale stone wall as the camera pans on, a page of the
  storybook turning (`stoneWipe` / `pageWipe` in shots_u5.js); for the loop, a rack focus from the gate's light to the
  silhouette.
- **Detail** the user missed: plaster patches and cracks, brick nogging where plaster fell, lit timber edges, leaded
  lattice glass with the sky in it, shutter boards and braces, sills, grime streaks, a stone plinth, door rings, steps
  and lanterns, roof tile joints, moss and ridges, sunlit sett tops, dirt along the walls, fuller tree crowns, puffier
  clouds, denser meadows. Each house's details use their own random stream so adding them never changes which
  windows are lit.
- **The hook**: "too much zoom out will not make viewer stop". Open close on a striking subject already moving (here
  the Piper's silhouette in the arch, the low sun behind his head), then pull back to the world.

## The Pied Piper v3 (2026-11-02): "walking glitches, his clothes glitching, the stick glitching, the bedtime actors are half, the book is half and shaking, brick glitches"

- **A walk cycle must be continuous at every phase boundary.** The silhouette gait dropped the ankle a fifth of a foot
  in one frame at toe-off (the heel lift ended with the stance) and snapped the foot 8 degrees flat at heel strike. Each
  value (x, lift, angle) has to leave one phase where the next picks it up, with zero speed at both ends (`sin^2`).
- **A pattern on clothing rides the cloth.** The coat's stained-glass panes were pinned to the hips while the skirt
  outline swung and its dags wobbled, so the pattern swam under the edge and loose fragments flickered in the dags.
  Lay the pattern out on the skirt at rest and warp it with the skirt (swing, flare, length); leave out what would reach
  into a dagged hem (decided in cloth space, so nothing comes and goes).
- **A held prop is built from the body, not placed beside it.** The crutch stood by itself at a fixed tilt with its
  foot following the swaying hand. Build it from the ground point to the armpit through the fist (`SH.crutch`): foot
  planted, pad under the arm, the hand gripping the handle.
- **Random numbers must never depend on what is visible.** `if (p) { if (rs() < 0.3) ... }` drew a number only for
  blocks on screen: one block leaving the frame re-shuffled every block's tone and width at once (the gate's stones,
  "brick glitches"); the birds did the same. Draw every number unconditionally, then test visibility.
- **The light filter clips to the character's box** (`C.lit`): a big open book held out past it was cut down its left
  page, and the cut edge moved with his breathing, so the book seemed to shake. Pass the held thing's box (`x.ext`).
- **`noLegs` figures must end under something from the camera's point of view.** The father and child stood on the
  floor cut off at the hips, floating in front of the bed ("half"). Sit them up behind the quilt: the quilt comes up to
  their waists and the figures are set low enough that the cut is always under it; the book and the hands holding it
  are drawn in front of the quilt.
- **One scene per statement.** "But the children were real. Your son was real." wanted two scenes: the children
  standing together in the square looking at us, then a push into your son among them that lands on him alone.
- **A prop's scale must not be rounded** (v4 feedback: "the book is vibrating"). `scale(${f(s)})` rounds to 0.01: a prop 640
  wide jumps 6 px at every step as the camera moves, a 1-2% pop every few frames, and a tiny far figure jumps 20%. Use
  `Math.round(s * 1e5) / 1e5` (props16's `fs`), as the rig already does. Measure, don't eyeball it: `_tools/trackred.ps1`
  tracks a red marker's centre and size per frame; steps and back-and-forth flips show up at once. Other shimmer on a
  white page: a lamp flicker at 3-5 Hz across the whole room, and live `<text>`, which snaps to the pixel grid (draw
  it as a path).
- **Check that an arm can reach what it holds.** The rig clamps the hand at full stretch, so with the book's far corner
  out of reach the hand stopped mid-page, and with the arm behind the book and the hand in front it looked like a stump
  coming out through the page. Keep held things within reach and hold them from outside: the book centred in front of
  him on his lap, fists on its outer edges, elbows out (`elbow: 'in'` takes the IK solution away from the natural one),
  so neither arm passes behind it.
- **Music: one continuous suspense score**, not cues with stops and drops. `eleven_music_v2_5` makes a whole 50 s
  instrumental in one go (describe how the energy evolves; it will not follow exact timestamps, so generate two takes
  and pick by the loudness curve, `bandenv.ps1`). A take that fades to almost nothing at its end and starts from almost
  nothing loops cleanly.

## The Royal Fool (2026-11-04): "i didnt like backgrounds ... i want better and great ones.. go creative please"

- **Backgrounds are always hand-built in code. Never use AI images.** When I began generating painted plates, the user
  stopped me: "nononno .... not these bro make ur own like we do".
  - Rebuild sets as override files (sets23.js / sets23b.js / sets23c.js over sets22*) that keep the same world
    constants, so every shot's staging, camera and transition focus point still works.
  - The rebuild added:
    - a jewel-box hall: star-sown blue vault, gilded ribs, rose window, lancets, statues, cloth of estate, sun shafts,
      floor reflections
    - a storm courtyard: wet cobbles, torch pools and streaks, banners, a well, a cart, barrels, rain stains
    - a living sea, described below
- **A reflection is a mirror about the waterline only for a level lens.**
  - Seen from above, a reflection is shorter. Scale the mirror by `rr = (y(-H) - y0) / (y0 - y(+H))` from projected
    points.
  - Break it into ripple bands with a gradient mask, fade it with depth, smear and darken it, and lay it under the
    waves.
  - Cut the ship off at its waterline with a clip-path. A sea-coloured patch under the hull showed as a hard box,
    and sinking hulls poked out below it.
  - Puddles at night are dark mirrors:
    - Mirror the sky gradient about the horizon and give the puddles smooth (Catmull-Rom) outlines and a faint light
      rim.
    - Reflect lights by mirroring their 3D point across the ground, clipped to the puddles.
    - Reflect only lights the wall doesn't hide.
- **Water texture must be fixed in the world.**
  - Swell lines and whitecaps placed at `cam.z + dz` slide along with the camera, so the sea reads as a backdrop.
    Put them on world grids, with one coarser level per doubling of distance, each fading in and out over its own
    band, so nothing pops.
  - Fade and size by the distance from the lens (`z - cam.z`), never by absolute z. One swell line drew bright right
    across the aftermath shot.
- **Leaded windows:** clip lattice lines to the frame exactly (Liang-Barsky). Clamping each endpoint changes the slope
  and fans the lines into a spider-web. When the camera flies out through a window, fade the glass and leading as it
  closes in, and keep any mullion out of its path.
- **A candle near the lens is an "AI glow".** A radial of 140 x scale at 0.5 filled a third of the frame with yellow
  haze. Clamp glow radii in pixels and keep them faint.
- **Chrome's GPU rasteriser drops whole layers when two heavy shots share a frame.** Inside the burning-fleet dissolve,
  rectangular blocks of the frame showed the wrong shot or nothing, and differed from run to run. The page's
  isolation and `-Sync` (run all compositor stages) didn't help. Each shot rendered alone was fine, and
  `purecheck19.html` proved the SVG was identical every time.
  - The cause: every mask, filter, blend mode and group opacity is an offscreen surface.
    - Each flame had a screen-blended glow: 8 per ship, doubled again by its reflection.
    - Each smoke column was a b8-blurred group whose region was its whole bounding box plus 30%, thousands of px
      off-frame.
    - Each ship had its own blurs.
  - The fixes:
    - Smoke as radial-gradient puffs with no blur (`P17.smokeDefs`, `o.grad`), with off-frame puffs culled.
    - Fleet flames with `fireGlow: 'over'`, and reflection copies with no glow.
    - One smear filter shared by all reflections.
    - Gradient-filled hull shadows.
    - The grade filter's region bounded to the frame plus 900 px (`cine.js`).
    - **Every transition window rastered on the CPU in both passes** (`render_fool.ps1`: the slow page without
      `-Gpu`, about 3.7 s per frame). On the CPU the same frame was clean.
  - To debug, `shottest19.html` renders shot A, shot B, the real frame, a plain overlay and a doubled shot.
- **Cameras that turn round** (a camera facing back down the hall): `V.CAM` unwraps the heading from key to key, so it
  never spins the long way round.

### The Royal Fool, delivered once and sent back (2026-11-05): "thousands of glitches ... blinkings ... vibrations .. frame blending ... in the opening scenes of bells ... its hands are passing through it"

- **Broken single frames inside transitions were the "blinkings" and the "frame blending".** With two heavy shots in one
  frame, Chrome saved frames before they were fully drawn: a whole room missing, a block of the other shot. This
  happened on the GPU and also on the CPU with a 700 ms wait. A longer wait didn't cure it on the GPU, which kept
  dropping layers.
  - The fix, now in `main19.html`, is never to rasterise two shots together:
    1. Lay the transition out with a measuring rectangle in each shot's place (`ENG.SHOTIMG = 'probe'`).
    2. Read off the part of each shot that will show, and at what magnification (`getScreenCTM`).
    3. Draw each shot alone into an image of just that part (SVG → img → canvas → PNG).
    4. Compose the transition from the two images.

### The Royal Fool, second review (2026-11-06): what a frame-by-frame look at full size found

- **"Frame blending" also means any transition that shows two shots at once for more than two or three frames.**
  - The soft radial (soft 0.5–0.8) showed both halls through each other for about 8 frames: two kings, one ghosted
    over the other. The noise dissolves (organic, noise zmatch) ate dark smoky blotches through the picture.
  - Keep every swap to 2–3 frames inside the blur of a move: fade windows like [0.46, 0.54] for carry, push and
    morph, and `plain: true` for zmatch. Each then shows exactly one in-between frame.
  - Use the new `bpow` (morph, zmatch) to narrow the defocus to the frames around the swap. The default broad blur
    left the face match soft for half a second.
  - Prefer swaps with no overlap at all: a face match (morph with `align`), eyelid (motivated by a character
    closing his eyes), a light-coloured object wipe, water surface, or a liquid mask.
- **Costume detail lines must be clipped to their cloth.** The hood's fold strokes sat at fixed x positions inside the
  face opening, so in close-ups two faint streaks ran down the face (rig3.js, now clipped to the hood shape).
- **A mantle over the upper arms needs `noJoin`.** The forearm's outline and elbow crease start where the upper arm's
  edges meet, which for a bent elbow is up the upper arm, under the mantle. They were drawn over the ermine as thin
  stray lines. `noJoin` (on by default for mantle wearers) stops the forearm's outline at its own elbow end.
- **A hand must actually reach what it touches, on camera.**
  - The bell "flick" sent the king's fingertip to a point beside the ear, nowhere near the bell, so the hand slid down
    past the horn: "hands passing through it". Cut a gesture whose target isn't really there.
  - The messenger's letter "slap" happened 3 m from where the letter appeared, and off camera; the letter just faded
    in. Stage the actor within arm's reach and in frame, and carry props continuously: in hand, then landing, then
    sliding. Never fade a prop from one place to another.
  - An actor standing behind a table is drawn before it, so his hand on the table top is covered. Move the reaching
    forearm, the prop and the hand to a layer just in front of the table (depth = table depth − 4), and switch layers
    only while the hand is raised clear above the table edge, so nothing pops.
- **Juggled blades must never pass the face.** Arcs peak below the chin; each dagger turns point-down at the top of its
  arc; held blades lean out from the fist, never straight up the chest. Make the hand scoops big enough to read.
- **No crude placeholder figures.** Stick figures (circle head, line limbs) beside detailed puppets read as a glitch.
  Even tiny background silhouettes get a tunic, limbs with thickness bending at knee and elbow, hands, boots, a cap and a rim
  light.
- **Smiling cartoon faces on props break the adult look.** The throne's lion knobs had closed-eye dashes and a smile;
  carve them stern (heavy brow, deep-set eyes, muzzle, set mouth).
- **A boolean switch on a face snaps the face.** `glance = sin(...) > 0.2` flipped the lords' eyes between two looks;
  ease it with `ss()`.
- **Frame the action.** A low wide view gave two thirds of the frame to the floor while the lords passed the letter in
  a thin strip at the top. Go high and close over the table.
- **Debugging aid:** `pick19.html?f=N&p=x,y&r=4` lists the SVG elements under screen points (and `&js=` evaluates an
  expression), which found the hood folds and the arm crease in minutes. Note that some script fills `window.DBG` from
  the URL's own parameter names, so a debug flag is passed as `?flag=1`.
  - It runs at about 3 s per frame on the GPU.
  - `cdp.ps1 -Stable` captures again until two captures in a row are identical.
  - Use one rasteriser for every frame. Mixing CPU-rendered transition windows with GPU frames made a pop at every
    window edge.
- **Find blinks and pops with `_tools/flick.ps1`, then look at them with `_tools/triplet.ps1`.**
  - `flick.ps1` works per 10x10 block of a 270x480 grey image:
    - blink: the block changes and changes back
    - pop: the block jumps while it moves smoothly before and after
  - It gives false alarms on thin lines moving faster than their width, so look at every hit.
  - `triplet.ps1` shows frames N-1, N and N+1 with amplified differences.
  - `sheetr.ps1` sheets any range or crop.
- **Random numbers must never depend on visibility, again.**
  - `if (dd) groups[Math.floor(r() * 4)]` drew a tone only for on-screen stones, cobbles and flagstones. Every wall
    reshuffled whenever one block crossed the frame edge.
  - Dust motes drew their last number after an off-screen test.
  - Draw every number first, then test.
- **No hard thresholds on distance or size. Fade instead.** These all popped:
  - floor lilies cut at 1100 cm, rug diamonds at 1600, runner lilies at 3800
  - vault stars under a size
  - window detail levels switching
  - pier lilies switching on at 9 px
- **No tones banded by camera distance.** Floor tiles grouped into 450 cm distance bands jumped tone in rings as the
  camera moved. Band by fixed world rows, toned by each row's own distance.
- **Never round a scale to steps.**
  - `cast19.js` rounded the lily's scale to 0.1, so a small lily jumped 30-50 % between frames.
  - `props*.js` rounded to 0.01: a far ship jumped a few percent per step.
  - Use `fs = v => Math.round(v * 1e5) / 1e5` for every `scale(...)`.
- **No buzzing.** These read as the picture vibrating:
  - a horn shiver at 40 rad/s
  - a 6 Hz whole-body rage tremble with ±30-unit hand shakes
  - a constant cap shiver at 30 rad/s while juggling
  - Keep trembles slow (2-3 Hz) and small, on the head and fists, never sliding the body.
- **Smooth everything that varies per frame:**
  - Depth-of-field blur rounded to 0.1 with a 0.3 threshold stepped as the camera moved.
  - A sun shaft vanished whenever one corner went behind the lens; clip its edges at the near plane instead.
  - Lightning was a hard double flash; make it one soft swell.
- **Hands on a prop worn on someone else's head (the King crowning you).**
  - Arms drawn behind the cap with hands on top looked threaded through the horn loops: sleeves vanishing under a horn,
    hands sliding out through it.
  - Bring the hands down over the top of the cap, onto the dome either side of the top horn, with the arms drawn over
    the cap. Release up and out over the horns.
  - Switch the arms back behind only when they are fully clear, and check the switch frame with a triplet.
  - Make sure no release pose crosses his own face.
- **Juggling.**
  - Flying daggers drawn over the hands passed through the fists, then jumped under them at the catch.
  - Draw every dagger, flying or held, between the body and the hands (SH.draw's mid slot, with `x.ext` for the lit
    box).
  - Keep one grip pose all through. Open/fist switching at every catch flickered.

### The Royal Fool, final QA of pass A (2026-11-06): what `scan.ps1` caught after all the fixes

- **A shot must end exactly where its outgoing transition ends.** The engine draws the first shot (in list order) whose
  span holds t. After moving a transition earlier, BATTLE still ran 0.05 s past it, so two frames after the carry flashed
  back to the burning ship. After any transition change, check `A.t1 <= at + d/2` for every pair.
- **Glows projected from a point must fade near the lens.** `bb()` returns nothing once the point is within `near + 10`
  of the camera, and right before that its glow (radius ∝ fl/depth) is huge. The hearth's warmth washed the whole war
  room on and off in one frame as the camera turned past the fireplace. Multiply such glows by
  `ss(0, 120, vd - near - 10)` (sets23b `nearFade`).
- **A shot that varies `night` (or any input the set thresholds) crosses the set's switches.** The time-lapse swept
  `night` through 0.05, where the hall hangs its chandeliers, and they vanished for ten frames. Its swinging sun flipped
  the shafts from one clerestory to the other when it crossed overhead and dropped shafts whose floor pools left the
  floor. For a time-lapse, keep the sun's direction and vary only strengths, with every threshold out of range.
- **Read every spike `scan.ps1` lists that isn't a transition.** Each one of the three unexplained spikes was a real glitch.
- **The arm solver flipped elbows (87 times in this film).** rig3's two-solution IK took the elbow nearest its rest place.
  When both were about as near, it switched sides in one frame and the whole arm swung round: hands vanishing and sleeves
  popping in as the King crowned you, and an elbow pop at every juggling throw.
  - rig3 now slides the elbow between the two solutions near the switch: on screen it is the elbow turning about the
    shoulder–hand axis.
  - `elbowM` / `elbowMK` hold an arm's side through a move.
  - Find flips by logging each arm's choice per frame (`window.__SOFTLOG`, `pick19.html&js=`). `flick.ps1` pops at a
    regular beat (every juggling catch) are a tell.
- **Never route a hand's target through its own shoulder on screen.** A straight path from above to a cap just below the
  King's shoulders passed within 23 units of the shoulder, where the solver's direction is undefined. Bring hands down
  outside the shoulder and in at the end, and release out before up.
- **`faceMix` must blend presets, not switch them at 0.5.** `expr`, `mouth` and `wide` are presets. Resolve the jaw
  opening, mouth corners, mouth width (`mw`) and eye width (`eyeW`) to numbers and blend them, or every mood change snaps
  the face in one frame.
- **Nothing may appear whole in one frame:**
  - Figures that start an action (the jumping sailors) must be there a moment early, fading in.
  - Shafts and glows that get culled near the lens must fade out before the cull.

### The Royal Fool, QA of both full passes (2026-11-07): hands that snapped

Both passes matched and `scan.ps1` was clean, yet `flick.ps1` still showed hand pops. A per-arm log found them all:
`window.__HANDLOG` (rig3) records, for every arm in every frame, the final hand angle, the elbow and the wrist. Flag a
hand turning more than ~14° or an elbow moving more than ~35 units in one frame while the wrist barely moves. Run it
over the whole film (`ENG.svgFrame(n)` for every n, about 30 s) after any arm change.
- **The wrist limit flips hands.** rig3 clamps an asked hand direction to the wrist's range from the forearm. When the
  asked direction passes straight back along the forearm, the clamp jumps to the other side, up to 150° in one frame.
  This hit every juggling catch, the King's hands arriving on the cap, a lord's pointer fist and the leaping fingers. It
  happens wherever a hand is asked to point back over a forearm that comes toward the camera.
  - Give such arms `wristFree: true` (no clamp: the hand points exactly as asked).
  - Don't remove the clamp globally. About 1,200 approved frames have clamped hands that would change.
- **`V.mixArm` must turn the hand direction, not average it.** Averaging two nearly opposite vectors (hanging down →
  raised) passes near zero, and the hand swings half a turn in one frame. Use `V.turnDir`. Any helper that blends a
  direction needs the same.
- **Never choose the acting arm from a moving target's side.** The pushing arm was picked by which side of the lord the
  letter was on. It switched arms mid-push as the letter slid past, so the hand teleported. Share the push between both
  hands, each kept to its own side of the body, cross-fading by the target's position.
- **An arm folded flat (hand by its own shoulder) crosses IK solutions where the two meet.** Holding an elbow side
  (`elbowMK`) through the lift dragged the elbow round the far side in three frames. End the hold while the hands
  rest, and narrow the solver zone (`elbowSoft: 0.15`) for the lift. For a hand to the neck or face, ease `fwd` with
  the gesture, so the elbow is already forward when the solver changes sides.
- **Hash the SVG of every frame before and after a fix** (normalise the global `uid` ids first). Re-render exactly the
  frames that changed, in both passes. This avoids a full re-render when one helper changes.
  - The tools are `_tools/jseval.ps1` (evaluates JavaScript in a page under headless Chrome and prints the result) and
    `_tools/nh.js` (`NH(a, b)` hashes frames a..b).
  - Make a fix exact where it changes nothing: return the old expression when the new factor is 1. Otherwise floating
    rounding changes thousands of frames that look the same.
- **Never start a test render on the port a background render is using.**
  - `render_fool.ps1` always uses port 9362. A test render on it attached to the running job's Chrome, rendered in
    parallel, then killed that Chrome on exit. The watchdog restarted the job, but the frames around the overlap are
    suspect.
  - Use `cdp.ps1 -Port 9371` (or any free port) for tests while a job runs.
  - A range also loads the JavaScript once, when it starts. Code edited while a job runs reaches only the ranges that
    start afterwards. Note the time of every edit, and re-render any range that started before the last one.
- **A stroke's width taken from one point of the line pops when that point crosses the lens.** sets23's `line()` uses
  the middle point, which for a two-point line is its second end. For the 90 px cap it went from 0.3 px behind the lens
  to 90 px just in front, so the runner's borders appeared as big gold bands in one frame. Ease the width in near the
  lens (`pxwN`). Better still, build a long floor line from short pieces, each sized at its own middle.
- **Never skip a whole surface because one of its reference points is behind the lens.** The hall's floor sheen needed
  `cam.proj()` of two points on the floor axis for its gradient. When either end passed behind the camera the sheen was
  left out, and the floor went a sixth darker (or brighter) in one frame. Fade such an effect by the reference
  point's depth (`ss(near, near + 150, depth)`) rather than testing for null.
  - Prefer the fix that changes the fewest approved frames. A gradient end that slid in front of the lens kept the
    sheen continuous too, but drew it into 990 frames that had never had it.
- **After the last fix, run `flick.ps1` on the final frames again.** The fixes of a round can uncover the next glitch
  under them: the thick border bands had hidden the edge-line and sheen pop at the same frame.

### The Royal Fool, after delivery (2026-11-07): "when he say the only man in france .. there comes a glitch in the background"
- **Flat art drawn with one affine map lies wherever that map says, even far off screen.** The hall's `plane()` draws a
  piece of art (tapestry, banner, cloth, rose window, map tile, inkwell) with the affine fit of the projection at its
  anchor. For a plane seen edge-on close to the lens, the fit is off by thousands of pixels: a side-wall tapestry that
  was wholly out of view was smeared across the cloth of estate behind the King for half a second, then swept away as
  the camera drew back. The same fault drew a tapestry's border as a strip down the frame's edge through a carry, the
  far corner's rolled map at the wrong edge of the frame, and map tiles past the table's edge.
  - Give every flat piece its extent and test its TRUE outline (corners projected, clipped at the lens): leave it out
    when that is off screen (40 px for blur; inside a transition, the larger picture it shows), and clip it to that
    outline when it is kept but still misses the frame. Art on screen is drawn exactly as before, so approved frames
    do not change.
  - Small props close to the lens (an inkwell, a quill, a rolled map on a table): draw them truly projected (`poly` /
    `T.lineD` of their outline), not as flat art.
  - Don't clip every tile of a tiled surface to its true cell to be safe: it changes which tile shows in the overlaps
    (a coastline appeared across the map). Fix only what is wrong.
- **Check every flat piece of a set in code, not by eye**: `_tools/planechk.js` (`PCHK(a, b)`) lists each `plane()`
  call drawn where it is not (ghost), crossing the lens (near) or missing while visible (vanish); `GVIS(frames)`
  rasterises a frame with and without its ghosts and counts the pixels that change. Run it on the whole film before
  the full render.
- **Never wave a flagged flick event through as "parallax" without naming the thing that moves.** flick.ps1 had flagged
  this one ("FEAST banner 346-364") and I passed it. Ask the page what is drawn there (`document.elementsFromPoint`
  on the rendered SVG, via `jseval.ps1`) and check that the object really is in that place in the set.

### The Royal Fool, second round after delivery (2026-11-07): "55 to 56 a jolt... before he says you are the only man... hands and arms bugs: half, folded weirdly, very small... they look like cut PNGs, redesign them for every shot"
- **Hands are true size and one silhouette (rig3 `handV2`, default; `G.RIG_HANDS = 1` draws the old ones).** The old
  hand was about two thirds of a real hand and narrower than its own cuff, so every hand read as small. Hand length
  (wrist joint to the tip of the middle finger) is now 1.3 x the nominal `D.hand`; the palm widens from the wrist to a
  curved knuckle line, four tapered fingers of their own lengths, a two-joint thumb joined into the same outline,
  nails, knuckle sheen and joint creases on the back, palm lines on the palm. Poses: relaxed, open, fist, point, grip,
  and `legs` (index and middle out, the rest curled: fingers walking or leaping). The grip slot moved with it:
  `R.gripSlot(Sz)` (0.56 x 1.3 x Sz from the wrist) - `gripK`, `P.slot`/`P.wristFor` use it; a prop a shot draws "in"
  a fist (daggers, a letter) must sit at the grip slot along the hand, not at the wrist point the arm reaches for.
- **One sleeve from the shoulder to the cuff (rig3 `sleeveV2`).** Two tubes each shaded across its own direction and
  pinned at the elbow read as cut-out pieces. The sleeve is one closed shape: both edges down the arm, round the
  outside of the elbow on an arc and into a crease inside, to a fitted cuff band a little short of the wrist; the
  shading runs along the arm and round the bend (an outer-side shadow, an inner-side shade and a light between),
  with folds at the crease, across the upper arm and across the forearm. Drawn whole under the body's yoke, and its
  forearm again (fading in from the elbow) over the head and body.
- **The hand is drawn in front of its own sleeve**, the wrist under the cuff, and the hand's outline is not drawn
  across the wrist. A hand bent back toward the lens over a forearm that comes at the camera then covers the sleeve's
  end instead of hiding behind it. A short (foreshortened) forearm shows a soft open end of its sleeve.
- **Keep the forearm foreshortening for a hand resting near its elbow** (lap, thighs, belt): real forearms resting
  forward are short from the front. Forcing a longer forearm pushed the elbow off its resting place and the solver
  swung it from side to side (34 new elbow flips) - the stumps were the drawing's fault, not the geometry's.
- **A hand or forearm over the body casts a soft shadow on it, cut to the body's shape** (`contactSh` in person()).
- **The light filter's box must take in the hands.** `C.lit` sized its filter region to the body: arms flung wide or
  raised high put the hands outside it and they were cut off at its edge (a hand reduced to a thumb - read as "half"
  and "very small"). person() now sets `info.ext` to cover both hands and elbows; `SH.draw` joins a shot's `ext` with
  it instead of replacing it.
- **Hands resting on a table must be ON it.** A seated figure behind a table with hands at table height but behind its
  back edge loses its hands under the cloth (arms cut off at the table). Put the hands on the top (world points on
  the cloth -> `V.handAt`), wrist free, fingers along the table, and draw the forearms inside the table's own drawing,
  over the cloth and under what stands on it (`o.feastHands`) - drawn over the whole table they covered the goblet in
  front of them.
- **A fist asked to point down while its forearm swings up is flipped half a turn by the wrist limit.** Turn the asked
  direction with the swing (run cycles), or use `wristFree` for hands whose direction is set by the world (on a table).
- **QA for arms:** `_tools/armscan.js` (`ARMSCAN(a, b)`) lists every arm whose hand turns > 14 deg or whose elbow
  moves > 30 units beyond its wrist in one frame, matched frame to frame; run it against the previous rig to see only
  what a rig change added. rig3 `window.__ARMW` gives every hand's screen point, elbow and drawn length: crop review
  sheets straight onto every visible hand (hands under ~50 px can be skipped).
- **Transitions between two shots of the same face: lock the faces, don't zoom them.** The loop's zoom carry scaled A
  by k^(u^2) and B by k^(-(1-u)^2): the two faces were 4% apart in size at the crossfade - a double face and a jolt.
  `facematch` (engine) carries A onto B's face (position, size, turn, computed from the shots' cameras and rigs - never
  read back from a drawing, so the measuring pass agrees) and dissolves only what is round it.
- **A slide held inside a zoom margin stops dead where the margin catches up.** The morph's align (`max(-margin,
  min(margin, shift * ss(u)))`) slid A at the clamp's growing speed, then switched to the smoothstep: a velocity kink
  felt as a jolt. `facepush` zooms A only; B is carried onto A's face with a carry that shrinks with B's own zoom
  margin, so nothing can clamp, and the faces lie exactly on each other at the swap.
- **A forearm copy drawn over the body must be clipped to the forearm's own outline, never to a half-plane through the
  elbow** (the half-plane swept over the upper arm when the arm folded and laid the upper sleeve over a mantle for a
  frame).
- **Hand poses never switch at the half-way point of a move.** Relaxed<->open morph (curl, spread and thumb
  interpolated); other changes dissolve over a few frames. On true-size hands the switch read as a snap.
- **An arm whose hand is held close to its own shoulder (a hand's breadth away) is near-singular in 2D IK**: a few
  pixels of hand motion swing the elbow round. When the arm really reaches toward the lens (placing a crown, a cap),
  draw both halves short (`us`/`fs` < 1, eased in and out) and time any crossing of the elbow to the other side
  (`elbowM` ramped over ~0.2 s) instead of leaving it to the solver's switch.
- **Check every eased ramp's peak rate, not just its end points**: an ease stacked on a smoothstep over a short window
  put 1% of zoom into one frame.

### The Royal Fool vs the videos the user loves (2026-11-08): "the experiment one, the king food taster (the priest who poisoned the king) and the pyramid one (he buried everyone but escaped through a tunnel he made to the emperor's room) ... such good art choice, such good cast and animation ... this one was not giving me that vibe"

The favourites are The Royal Taster (`main3.html`), The Tomb Builder (`the_tomb_builder.mp4`, built in the 2026-10-18
workspace as `_render\video\main5.html`; not bundled in this skill) and The First Vaccine (`main9.html`). A frame
every 1.5 s of each (`extract.ps1`), measured and looked at side by side:

| | Taster | Tomb Builder | First Vaccine | Royal Fool |
|---|---|---|---|---|
| saturated blue, % of screen | 0 | 0 | 0 | 23 |
| vivid pixels (S > 0.45), % | 12 | 11 | 11 | 20 |
| deep shadow (Y < 40), % | 50 | 67 | 39 | 40 |
| frames where a face or the story object is big (by eye) | ~90% | ~80% | ~90% | ~42% |

What the favourites share, and what the Fool broke:
- **A warm, earthy, limited palette:** candle amber, wood, cream, forest green, deep red, black; navy only as a dark
  costume. The Fool filled a quarter of every frame with saturated royal blue and gold (fleur-de-lis drapes, carpets,
  columns) next to a four-colour harlequin: a primary-colour toy look, not dark history.
- **One light source per shot** (candle, torch, window) falling off into shadow, with a vignette; the face is the
  brightest thing in frame. The Fool's halls are evenly lit, walls as bright as faces. Overall brightness is not the
  problem (the Vaccine is as bright as the Fool); where the light goes is.
- **Backgrounds sit behind the actor:** soft-focus, darker and lower in contrast (the Taster's blurred tapestry, the
  Tomb's black doorway), foreground blur for depth. The Fool's 3D halls are pin-sharp, with repeating patterns,
  checkered floors, banners and stained glass at full contrast: the eye has nowhere to land.
- **Character-first framing:** waist-up shots, close-ups and inserts of the story object (the spoon, the plate, the
  lancet on the arm, the tomb plan, the candle in the tunnel) fill the screen, in 1-3 locations that are revisited.
  The Fool spent more than half its frames on wide halls, fleets and maps with tiny or no people, across seven
  locations.
- **A simple, readable cast:** one muted colour per character (green taster, red king, black priest; navy builder,
  armoured guard; brown boy, navy doctor), faces and hair visible, clean silhouettes. The jester's hood and belled hat
  hid his hair and shrank his face; the king was buried in ermine, crown and robe.
- **Clean, readable acting; the camera, light flicker and inserts add the rest of the motion.** The Fool's juggling, spread arms
  and crossing hands are where its hand and arm bugs came from, and where most of its usage went.

Cause in this skill: SKILL.md called the Pied Piper third cut (`main18.html`, true 3D perspective sets) the "best
model to copy", and "backgrounds more defined" was read as sharp, detailed, evenly lit sets. Copy main18's rig fixes,
not its look. From now on:
- The look to copy is the Taster, the Tomb Builder and the First Vaccine.
- Warm, limited palette; no large areas of saturated blue or of any one bright primary; grade warm.
- One light source per shot; faces brightest; the background falls into shadow; vignette.
- Sets and backgrounds very good and detailed (next entry), lit by the shot's light: richest where the light falls,
  elsewhere darker, softer (depth blur) and lower in contrast than the actors.
- At least 80% of the screen time on a face (waist-up or closer) or an insert of the story object; at most 2-3 short
  wide shots per video; 1-3 locations.
- One main colour per character for a clean read, faces and hair visible, and richly finished (next entry).
- Expressive acting (next entry) with clean gestures; no juggling, flailing or arm choreography the 2D rig can't do
  cleanly.
- **No 3D sets by default** (the user, the same day: "we dont need to go 3d unless its a very shot that needs it"):
  build sets as 2.5D multiplane layers, as in the Taster, the Tomb Builder and the Vaccine. Use the perspective sets
  (`street3d.js`, `terrain3d.js`, `hamelin3d.js`) only for a single shot that really needs a move through space, lit
  and graded like the rest of the film.

### For 2D, the work goes into the characters and the sets (2026-11-08): "for 2d ... make sets and background very good and detailed .... we focus more on character emotions and movement ... character finishing and detailing ... alot work on these .... making very good characters"

With 3D dropped, spend the time on these, and review each at full size before any shot is built:
1. **Character finishing and detail.** Render a cast sheet with full-size close-ups and finish every character first.
   - Faces: form shading on the side away from the shot's light (under the brows, nose, lips, chin and jaw); blush on
     cheeks, nose and ears; eyes with an iris gradient, pupil, catchlight, lid crease and lash line; brows with hair
     texture; two-tone lips; skin that shows age and life (stubble, wrinkles, scars, freckles, tired eyes) to fit the
     role.
   - Hair in locks with highlight bands and a few flyaways, never one flat blob; a soft hairline.
   - Costume: folds at the shoulders, elbows and waist; fabric texture (wool weave, linen, leather grain, velvet
     sheen); trims, stitching, buttons, belts, buckles, embroidery; wear and dirt on working clothes.
   - Hands finished (knuckles, nails, creases) and sized to the body.
   - Light on the figure from the scene's source: a key side, a rim on the far edge, contact shadow under the chin,
     collar and arms, and a cast shadow on the floor or wall.
2. **Emotion and movement.**
   - Every line has a clear emotion on the face (brows, lids, eye direction, mouth, cheeks, nostrils, jaw), and it
     changes through the line instead of holding one mask.
   - The body acts it: breathing, weight shifts, leaning in or away, head tilts and turns, raised shoulders in fear, a
     slump in grief, trembling, flinches, swallowing, eye darts, natural blinks, the eyes leading each head turn.
   - Secondary motion: hair, cloth, sleeves, hat tips and bells follow with a delay; idle figures never freeze.
   - Gestures are clean and come from the line (a hand to the chest, a reach, a point, covering the mouth), with
     anticipation and a settle. Skip anything the 2D rig can't do cleanly (juggling, arms crossing near the face).
   - Background people react with their own beats.
3. **Very good, detailed sets and backgrounds:** painted texture on stone, wood, plaster and cloth; period props that
   tell the story; wear, dirt and architectural detail; several depth layers; something always moving (flames, smoke,
   dust, cloth); lit by the scene's light source, so the detail is richest where the light falls. No flat pattern
   fills.
4. **Show the look first** (the user, the same day: "Yes, show me first"): before building any shot, send the user the
   finished cast sheet and one lit still of the main set, and wait for their OK. The user asked for "few frame of
   different" scenes instead: three stills, each a different set (Coca-Cola test: `look20.html`, `cast20.js`,
   `sets24.js`, `shots_w.js`).

What the Coca-Cola look test taught (rig3):
- `beardStyle: 'goatee'` draws a thin curled Van Dyke moustache with it, which reads as comic; use `mstyle: 'walrus'`
  with no beard, or a `'short'` beard.
- `hairStyle: 'slick'` grows two points at the temples like horns, and `'messy'` reads as spiky; `'short'` is safe.
- Sweat over ~0.3 gives big cartoon drops; keep it at 0.1-0.25.
- A held thing whose text or level matters (a labelled bottle, a glass) never goes in `hold`: the wrist clamp (~75 deg)
  tilts it. Draw it upright in the world, put the fist's grip slot on its neck with `detachHand: true`, and draw the
  thing, then `handsLit` over it.
- Choose the hand so the fingers continue the forearm's direction. If they must turn back against it, the clamp swings
  the hand off the prop. A `'palm'` fist reads as a flat block, so prefer `'back'`, using the other hand if needed.
- `C.lit` people blurred with `dof1` turn see-through; to push a figure back, put it under a colour-matrix haze
  instead.
- Avoid round yellow shapes in a blurred foreground, such as a candy jar: they read as the bokeh bubbles the user
  dislikes.

### The look test, second round (2026-11-08): "his clothes that fady colors looking glitchy vibe .. no need for that and second can we go like reanimating and design hands for every shot ... so they dont give cutout png vibe?"
- **Faded clothes had three causes; all are fixed with `G.RIG_CRISP = true`, set in the page, plus one shot helper:**
  1. The rig redraws the top of the body over the sleeve roots with a feathered fade (the "yoke"). A dark waistcoat
     faded over white sleeves as a smudge. In crisp mode the yoke ends in a clean curved armhole seam instead.
  2. `C.lit` puts the key light level with the middle of the whole body. In a waist-up shot that point is below the
     frame, so the shoulders fell into a dark fade. Centre the light on the chest: in `shots_w.js`, `up(P, o)` sets
     `P.chest`, and every `lit`, `armsOver` and hand uses it.
  3. The sleeves' wide b8/b4 shading bands read as grime on light cloth. Crisp mode draws narrower bands with less blur,
     and the faded forearm copies get a short edge instead of a long fade.
- **Hands are designed per shot (`hands20.js`, `G.HANDS`).** The arm is drawn with `pose: 'none'`. `HD.hand()` draws the
  hand at the rig's wrist (`R.toWorld(o, P.jR.W)`):
  - jointed fingers: a curl, a spread or exact joint angles, foreshortened and folded out of sight;
  - three-tone form shading from the scene's light;
  - knuckles, creases, nails, tendons and a side-on thumb;
  - one warm outline round the whole silhouette, and the cuff's shadow;
  - blood as wiped streaks, not dots.

  Light each hand with the character's preset, `C.lit({ svg, info }, L)`, and give it `HD.shadow()` on whatever it rests
  on. For a grip, the held thing stands in the world and the fist's grip channel (`HD.GRIP`, local [0, 0.56]) sits on
  its axis. Use `gripW()` for the wrist and put the fingers along the forearm. Every hand in the Coca-Cola look test is
  done this way: pressing a wound, gripping a bottle, a pestle and a glass, resting on a bowl and on a counter, hanging.
  **REJECTED in the next round: see below.**

### The look test, third round (2026-11-08): "lets go with the hands before .. forget the new one they look very odd .. we are fixing rig right now .... make it cleaner .. higher quality very good quality ... make their cloths finer .... proper like they look very un patterned"
- **The designed hands are out.** Their segmented fingers read as stacked sausages, or a mitten. Keep the rig's `handV2`
  hands, with held things standing upright in the world and the fist drawn over them (detached hand).
- **Clean cloth (`G.RIG_CRISP`), the rig fixes:**
  - The cloth filters' noise multiplier went from 0.72-1.0 (a heavy speckle that read as grain) to 0.92-1.0.
  - The inner-edge shading went from sd 22 / op 0.5 to 15 / 0.3; on `clothS`, from 9 / 0.45 to 7 / 0.28.
  - The inside of the elbow is a rounded fold, not a sharp paper corner, and the sleeve fold lines are at half opacity.
  - The yoke is a clean armhole seam (second round).
  - Film grain: `X.GRAIN` (engine), 0.025 for clean frames. Render with `cdp.ps1 -Quality 98`.
- **"Un-patterned" clothes** meant garments made of bare lines (lapels drawn as strokes, a stray front line, a syrup
  stain): they read as a sketch, not as cloth cut from a pattern. Build costume overlays as real tailoring:
  - filled lapels with the notch at the collar, the far one a shade darker, a lit roll line, and the soft shadow they
    cast on the chest;
  - the shirt and tie in the opening;
  - one front edge lapped over the other, with a lit seam;
  - cloth buttons with their own little shadow;
  - a pocket welt with a highlight and a shadow under it;
  - two or three faint blurred pull folds;
  - for a waistcoat: a lit edge down both fronts and a soft fold under the chest, with fainter pinstripes.
- A figure behind a counter needs its hands **below** the counter edge, or drawn. Arms ending at the cuff with no
  hand, or sleeves cut flat on a white counter, read as blocks.

### "now make me this rig" (2026-11-08): the clean rig is installed as the standard
- `rig3.js` (with `RIG_CRISP` and `tailored`), `tailor.js` and `stage.js` are in `project/_render/lib`.
- The Royal Fool's production files and newer tools are in the skill project too.
- The files they replaced are in `project/_backup_2026-11-08`.
- The old pages (`main.html` to `main18*.html`) now set `RIG_HANDS = 1` so they keep their original hands.
- New videos: copy `look20.html` / `rig20.html`, dress the cast with `tailor.js`, and check it on the rig sheet first.
- The user approved the rig sheet and the three test frames ("Rig is good", 2026-11-08). This clean rig is the baseline: start every new video from it, and don't redesign hands or clothes unless asked.

### The any-topic test (Semmelweis, Vienna 1847; 2026-11-08): "hands and this arm part they look very off ... make them cleaner and finer so they dont look like cutted pngs"
- **Never relight arms on their own.** `ST.armsOver` lights the forearms in a separate `C.lit` pass, so the rim runs round
  each arm's own outline (its inner edge against the body too) and the arms read as cut-out pieces laid on top. Draw
  furniture the forearms must stay in front of (a quilt, a basin, a counter) with `ST.behind(P, id, svg)`: it is masked
  out wherever the forearms and hands are, so they keep the body's own light pass. Light a held prop and its detached
  fist with the body in one pass: `ST.litWith(P, L, P.svg + prop + P.handR, ext)` (ext widens the light's box).
- **The wrist (rig3, `RIG_CRISP` only).** A straight wrist capsule laid along the forearm left the corner of the hand's flat
  top edge standing out whenever the hand bent at the wrist, and the half-transparent "open end of the sleeve" read as
  a glass bubble on light cuffs. Now `wristBridge` runs from inside the cuff and curves into the hand's own line, the
  hand's top dissolves into it (`joinWrist`), and crisp mode draws no opening disc. Check every hand at 2.5x where it
  leaves the cuff. The Coca-Cola look test re-rendered with it: the grips unchanged, the wrists cleaner.
- **A fist seen from the back with the fingers down reads as a paw.** Hands resting on something: `relaxed` (or `open`)
  with the fingers over its edge, plus a soft contact shadow.
- **Hands in water:** split the water at the waterline (far half under the arms, near half over them), opaque and milky
  so the hands are only a soft shadow; put the cuffs into the water (no strip of bare wrist above it); fill the bowl to
  the brim and draw the near half of its rim's lip over the arms.
- `window.DBG_BEHIND = true` paints `ST.behind`'s mask red over the frame: use it when furniture cuts into an arm.
- Cloud sessions run Linux without PowerShell: `_tools/cdp.cjs` (Node + the preinstalled Chromium, the same
  `READY` / `renderFrame` contract and `f00000.jpg` output as `cdp.ps1`) and `_tools/sheet.py` (sheets and crops).

### The same test, detailing pass (2026-11-08): "their clothes and hairs look uneven and a bit not detailed and clean"
- **Hair is built in layers, never one flat shape with scratched lines** (`_render/lib/hairkit.js`, use with the rig's
  `hairStyle: 'bald'`): a mass shaded top to bottom and inked on its outer edge only; tapered filled locks that follow the
  flow from the parting in alternating tones, each with a fine dark parting line and a lit edge; a sheen band across the
  crown, stronger on the key-light side; a soft hairline (a thin line a shade darker than the hair, no ink) with a faint
  shadow on the brow. `HK.centrePart` (+ a night plait over a shoulder), `HK.sidePart`, `HK.baldFringe`. Shapes are drawn
  on the base head and mapped with the rig's `faceP`, so they sit on every morphed head.
- Things that read badly in hair at this scale: stray fly-aways and hairline ticks (scratches), long loose hair as
  separate ribbons (stringy), a plait of round lobes (beads: use close-set pointed lenses leaning in turn over a solid
  core, thick at the top), a fringe standing away from the skull or drawn with curls (ear-muffs, hooks), side-whiskers
  drawn as a filled block on the cheek (pasted on).
- **Cloth has a weave**: `o.weave = { kind: 'twill' | 'linen', op }` lays a fine thread texture on the torso and the
  sleeves under their shading (rig3); `T.jacket({ weave })` carries it onto the lapels. Keep it subtle (op 0.12-0.14 on
  dark wool): stronger reads as stripes.
- **Finish the garments**: pick-stitched lapels, a buttonhole, a velvet upper collar on frock coats (`T.jacket({ velvet:
  true })` - not on a white cotton jacket), a silk waistcoat in the coat's opening (`T.vest({ col, chain })`, between
  `T.shirt` and `T.collar`), a shaped silk bow with folds and sheen, pressed shirt pleats (shadow plus lit edge), and on a
  nightgown a pin-tucked yoke with a stitched seam, gathers below it and a lace-edged frill. A shirt front seen in an
  opening keeps its pleats clipped to the opening (they ran on below the waistcoat onto the coat).

### The same test, hair (2026-11-08): "hairs still look very off and cutted at some points ... not matching"
- **Light hair with the head.** Head art drawn outside the figure's light pass stays flat while the face takes the key,
  rim and face light: it reads as a cut-out laid on top. Draw back art + `P.svg` + front art (+ any held prop and its
  detached fist) through ONE `C.lit` (`Q.litHair(P, o, art, L, extra, ext)` in castT1.js, via `ST.litWith`), with the
  light's box widened to take in the hair's volume.
- **No hair ends in a straight cut**: a woman's hair comes down over the whole ear and rounds back behind it (a lobe
  peeping out under it reads as a sliver); sideburns taper to a rounded end; a bald man's fringe thins to nothing at both
  ends and lies over the side of the head above the ear as well as behind it; a parting is a soft blurred groove, never
  a drawn line.
- **One gradient per head**, shared by every hair piece (front, back, plait), in the same user space, so the pieces meet
  without a change of tone. Few, wide locks with faint lines between them, not many hairline strokes.
- Review hair at 2.5x (a page rendered with `deviceScaleFactor`): the cuts did not show on 1080 crops.

### The Coca-Cola video, arms and hands (2026-11-08): "arm is invisible and blending with shirt", "they are so obvious the cutout hands ... unmatched ... odd ... immature and irregular"
- **An arm in front of the body needs a contact shadow.** Lit in ONE pass with the body (the rule since the Semmelweis
  test), an arm crossing the torso gets no edge at all: a white sleeve on a white jacket, or grey wool on grey wool,
  disappears. `Q.armAO(P, o, 'RL', L)` (cast21.js) lays a soft dark shadow of the arms (and detached fists) on the torso,
  offset away from the light, masked to the torso and never over the arm itself; put it first in `litHair`'s `extra`.
- **No arm crosses a face, ever** - check every pose against the head at 2.5x. A seated man stirring a tall jar raised
  his fist to his chin: give him a short vessel at his side (and pour from a cask tap, not from a hand that has to reach
  across). A paddle held high put the upper fist at his cheek: keep both fists at chest height.
- **No 90-degree wrists.** A hand gripping sideways on an arm that hangs down bent the wrist piece over itself into a
  pointed tail. Grip at about 45 degrees to the forearm (`gripAt(..., [-0.78, 0.62])`); the rig now also shortens the
  wrist curve on the inside of a sharp bend.
- **Fists are not mittens**: the rig's curled fingers now fan a few degrees from the knuckles and differ in length (the
  middle finger longest), with short soft creases between them instead of four parallel blocks with slits.
- **Hands match the body**: the hand's outline is the body's weight (it was 1.5x and read as a sticker), its skin is
  the face's (it was tinted 14% red), its own shading gentle so the figure's light pass does the modelling.
- **Sleeves are not boxes**: round shading along the arm (soft and wide), the forearm's outer edge swelling a little
  and tapering into the cuff, folds gathering above the cuff, the cuff in the sleeve's own cloth (not a dark block) with
  a small button.
- A hand pressed to a wound is a fist clutching the cloth, not a flat open hand (it read as a paddle). (Rig note: with
  `pose2`/`poseK`, a poseK of exactly 1 falls back to `pose` - switch `pose` itself when the blend is done.)

### The Coca-Cola video, technical (2026-11-08)
- **Never screen-blend inside a filtered, half-transparent group.** Window-light glows drawn inside the wall's blurred
  group, over a semi-transparent dark overlay, left a coloured ring at the edge of every gradient. Draw such glows after
  the filtered group, onto the finished picture.
- **Darken a near layer with a filter, not a rectangle.** A dark rectangle on the p=1 layer also covers every layer
  behind it (the wall, the calendar that had to be read). Use a feColorMatrix filter on that layer's group.
- **Camera paths through keys** (`V.cam` in shots_x.js): a monotone cubic through every key in x, y, log(zoom) and roll.
  `X.track` eases every segment in and out, so the camera stops dead at each key. Keep the measured speed under ~60
  (pan x zoom + zoom change + roll per frame): long moves between far-apart framings get a wider key half-way.
- **Fonts**: period type (Playfair Display, Abril Fatface, Old Standard TT, Rye, Pinyon Script; `_render/fonts`) must be
  installed as system fonts: the transitions rasterise each shot into an SVG image, and images cannot use web fonts.
- **ElevenLabs on Linux**: the generated files are served from elevenlabsusercontent.com, which the cloud environment's
  network must allow. The 48 s music-model score costs 720 credits; sound effects cost about 3-4 credits a second.

### The Coca-Cola video, second review (2026-11-09): "see alll these glitches ... these hands and arm visual glitches ARE TOO MUCH .. 100 OF TIMES IVE METIONED THIS THING", "the coca cola appear just for a fraction of secand", "too rigid cut .... he ends one word and other appear instatntly"
**Before ANY delivery, audit every hand at full size** - not contact sheets, not spot checks: `_tools/handaudit.js`
(through `_tools/jseval.cjs`) lists every arm's wrist and elbow on screen every 20 frames, `_tools/render_list.sh`
renders those frames, `_tools/handcrops.py` tiles every hand wrist-to-elbow, labelled. Look at every tile. Then run
`_tools/armscan.js` over every frame for flips. What the audit found, and the rules:
- **A forearm must lead INTO its hand.** A detached hand on a prop with its fingers pointing back across the body,
  while the solver hung the elbow under the shoulder, ran the forearm away from the hand (or behind a counter): a
  floating hand. Check the hand's direction against the forearm's (log `__HANDLOG`); take the outer elbow
  (`elbowM: 1, elbowMK: 1`) so the forearm comes down into the hand, or change the hand's direction.
- **Never fold a forearm back over its upper arm.** A hand held up near the shoulder on its own side (a bottle at the
  chest, the upper fist on a paddle) makes the forearm lie on the upper arm; the sleeve is one shape and its forearm
  copy is cut from it, so the upper arm's folds, the crease and a pale patch show through: a grey, see-through forearm.
  Hold things at the belly or stand them on a surface (the hand round a bottle's neck on the bench), keep both fists on
  a pole at belly height. Rough test: the wrist must not be above the elbow by more than a third of the forearm.
  (The `fwd` elbow does not cure it: the forearm becomes a stub with skin showing beside the cuff.)
- **A hand on the far side from the key goes nearly black** (the light pass shades the far edge of the figure: a white
  cuff stays light, skin turns dark brown). Put resting hands in the light, or let that arm hang behind the furniture
  (`behind(P, id, svg, 'R')` masks only the arm in front).
- **A figure behind a counter**: cut the body at the counter edge INSIDE its light pass and leave what stands on the
  counter and the hand round it uncut (`Q.litHair(P, o, art, L, extra, ext, { id, y, under })`); a glass cut at that
  edge stood behind the counter. Draw the counter's furniture that stands in front of him (the tap) after him.
- **Nothing blurred crosses a hand**: foreground depth-of-field blades over a hanging hand read as dirt on it. Keep
  foreground clutter at the frame's sides.
- **A background figure's hands must not sit beside a foreground hand** (extra fingers next to the clerk's hand on the
  glass): move or lower the background figure so they are hidden.
- **Keep the narrator's pauses.** The voice was cut to 0.11 s at every pause (47.3 s): "too rigid". Keep the take's own
  pauses (0.15-0.5 s). When a film was timed to the tight cut, `_tools/twarp.py` maps its old times to the take
  (`window.TWARP_T`, read by `ENG.tOf(n)`; the mix uses the same map): the picture eases through each pause.
- **The last title holds.** The name was written in at the very end and the loop morph took it at once. A final title
  stays complete on screen at least 2 s before any loop transition.
- **Same review, the "fixed" frames (2026-11-09): "its still cutted and color is differebt", "??? its cutted .. not
  joined", "hand is also glitching with bowl".** Judge joints at 3x zoom, never on half-size comparisons.
  - **A light inside furniture that is masked round an arm lights only the unmasked part of the arm.** The bench's
    lamplight (a screen-blended radial in `S.benchTop`) lay over the figure; the bench is masked round his forearm,
    so the glow warmed the upper arm and stopped at the elbow: a cream sleeve above, a grey one below, a seam. Clip a
    furniture light to the furniture's own surface (or draw it over the whole picture, unmasked).
  - **Mask furniture round the WHOLE arm** (`armRfull`, shoulder to hand), not the forearm: an elbow dipping below
    the bench's far edge was covered and the forearm lay on the bench as a separate piece with a straight cut end.
  - **No forearm pointing at the lens**: drawn short, it is a grey box with the cuff on the elbow and the hand stuck
    on its end. Put the held thing where the forearm lies in the picture (across the belly, level, from an elbow
    hanging at the side). An upper arm angled out opens a gap under the arm; on a dark wall it reads see-through.
  - **The elbow crease is two thin light lines** (rig3 under RIG_CRISP) - its dark disc read as a stain on white sleeves.
  - **A tool held over a vessel**: the fist rides above the rim (a long enough handle: `PR.PESTLE_HEAD`), or the
    vessel's front wall cuts across the wrist.
  - The arms' contact shadow (`Q.armAO`) is for light-on-light only (white sleeve on a white jacket); on a white
    sleeve over a dark vest it lays a brown smudge.
