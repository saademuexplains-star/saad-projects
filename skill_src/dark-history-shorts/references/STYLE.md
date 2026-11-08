# House style

This is what "exactly like the previous videos" means. Concrete numbers come from the four shipped productions. When this file and `REFERENCE_STUDY.md` disagree, this file wins, because it includes the user's later corrections.

## 1. Format

| Spec | Value |
|---|---|
| Canvas | 1080x1920 vertical, **60 fps**, frame-exact with the VO |
| Length | 46–50 s (the trimmed VO decides; `VIDEO_FRAMES = ceil(VO seconds * 60)`) |
| Narration | Second person, present tense ("You drink a cup of…"), supplied by the user as an ElevenLabs mp3. Gaps over ~0.11 s are trimmed |
| Text on screen | None. Clean frames |
| Output | MP4 (H.264 at ~20 Mbps, AAC) plus `name_voiceover.wav`, `name_sfx.wav` (SFX + ambience) and `name_music.wav`, all exactly the video length, 48 kHz stereo |

## 2. Story to picture

- **One clause = one visual beat.** The noun or verb being spoken is on screen at that moment: the cup, the scroll, the spoon, the blister, the twig, the coin.
- **Hook (0–2 s).** The very first frame is already moving.
  - Typical opening: a crane down or push out of a high or wide position onto "you" doing the first line's action.
  - Examples: the market crane from the awnings down to the cup being filled; the throne room push onto the king handing over the scroll.
  - A sound hit plus the music downbeat land on frame 0.
- **Facts get brisk beats (1–2 s); feelings get holds (3–5 s)** with a slow push on the face or the hands.
- **Show consequences as pictures, never as text:**
  - shadow-play inserts for executions and torture
  - time-lapse for months or days (day/night cycling, seasons, tally marks, a beard growing)
  - inside-the-body worlds for disease
- **Symbol finish:** if the script ends on a modern link (the ambulance symbol), match-cut the historic object into the modern one with a morph.

## 3. Endings

- **Default: a seamless loop.**
  - The last line hands off into the first. The final shot is designed to recompose frame 0.
  - The closing transition runs with `end: true, bOff: -X.T_END` so it blends the last frames into the opening shot (see ENGINE_API).
  - The audio loop seam is crossfaded in the mixer.
  - The opening shot doubles as the loop landing.
- **When the user says no loop** (The Worm), end on the biggest reveal:
  - pull back wide
  - a final impact plus a white flash on the last word
  - the resolution music still playing at the last frame, with a 0.12 s fade so it ends click-free

## 4. Camera language (the most important section)

- **Never static.** Every shot has a keyframe track `cam = TK([[t, [x, y, zoom, roll], ease], ...])` with a key at least every 1–2 s, plus hand-held drift `hh(cam(t), t, 0.3–0.45, seed)`.
- **Typical moves** (zoom 1.0 = the full 1080x1920 world framing):

  | Move | How it's built | Examples |
  |---|---|---|
  | Push in | 1.0 → 1.5 over 2–4 s (`sine`/`io`); emotional peaks go to 2.5–4.5 on a face, hand or wound | |
  | Crane / tilt | Large y travel in one second with `io` | sky → character (time-lapse); wall tally → twig |
  | Whip inside the set | A 0.5–0.7 s pan between two subjects in the same world, with a zoom dip mid-way to cap screen speed | twig → grimacing face |
  | Follow | Camera centre locked to a moving subject, blended in with `ss()` | worm head travelling down the leg |
  | Pull-back reveal | 3 → 1.3 | the healer lecturing; the ambulance |
  | Roll accents | ±2–8° on peaks, settling back to 0 | |
- Use parallax. Every set is layered: sky 0.2, far 0.45, mid 0.75, ground and characters 1.0, foreground 1.15–1.35 (blurred). Camera moves therefore produce depth.
- **Smoothness:**
  - Only use eased curves.
  - Keep the camera within ~70 screen px per frame, even in whips.
  - Big moves get `io`; drifts get `sine`.
  - Never let a value jump between frames: no pose swaps on screen, no switching light presets on screen.

## 5. Transitions

- Length 0.5–0.9 s. Fast 0.3 s whips were rejected as forced.
- Every scene change uses a different type than the previous one, and each video should feature a few types the user hasn't seen yet.
- Hide the change inside motion or a shape match, so it isn't felt.
- Catalogue (parameters in ENGINE_API):

  | Type | Look | Best for |
  |---|---|---|
  | `carry` | Camera keeps travelling through the cut at matched speed (pan, tilt or zoom) | The workhorse of the first two videos. Don't overuse it now |
  | `wipe` | A dark defocused foreground object (pillar, servant, bush) crosses the lens | |
  | `push` | Push into a point and settle out of a matching point | |
  | `dip` | Through darkness | Death, night |
  | `flash` | Light flood | Torches, explosions |
  | `unroll` | A parchment roller reveals B | Letters, scrolls |
  | `organic` | Noise dissolve, or `plain: true` for a soft crossfade | Gentle shifts, loop closes |
  | `bokeh` | Defocus into floating candle bokeh | Feasts, halls |
  | `glint` | A blade or metal star-glint hides the cut | |
  | `iris` | Push into a pupil or dark centre; darkness opens on B | Swallowing, fainting |
  | `zmatch` | Zoom-match a shape: A dives into fa, B pulls back out of fb | Plate → plate, belly → inside the body |
  | `liquid` | A spreading blob (default blood red) reveals B | Wounds, poison, into the bloodstream |
  | `lens` | A glass lens opens on a magnified world | Into the micro world |
  | `scan` | A scan line sweeps | Avoid cold blue looks |
  | `eyelid` | Eyes close on A and open on B with defocus | Waking, time passing overnight |
  | `heat` | Heat-haze shimmer dissolve | Burning to cooling |
  | `negative` | Inverted x-ray flash | Use sparingly, the user dislikes x-ray looks |
  | `sweep` | A warm light band crosses the frame | |
  | `morph` | A shape morph with a bloom | Old object → modern symbol |
  | `surface` | The camera dips through a water surface | Air ↔ underwater |
  | `whip` | Directional smear | Keep ≥ 0.5 s if used at all |
  | `spin` | Rotational swap | |
- Inside one location, prefer one long continuous shot with camera moves over several cuts.

## 6. Acting and faces

- **Every beat has a readable gesture plus an expression.**
  - Expressions: `neutral`, `anxious`, `fear` (+ `wide: true`), `grim`, `stern`, `tired`, `grief`, `hollow`.
  - Mouths: `closed`, `tight`, `parted` (+ `open` amount), `smile`, `grin`, `talk` (animate `open: Q.talk(t, amp, hz)`), `snarl`, `cry`.
  - Add `brows: [inner, outer]`, `lid` (0 open → 1 shut), `look: [x, y]` (eyes aim at the subject they're reacting to), `sweat`, `tears`, `blush`.
- **Idle life never stops:** `idle(t, seed)` gives blinks, breathing and sway on every character in every shot.
- **Pain and fear show in the face plus a small body response:**
  - flinch bumps on tilt (head) and sway (body)
  - chewing via mouth open on a fast sine
  - talking via `Q.talk`
- **Cinematic, adult acting:**
  - no big cartoon "o" mouths
  - no flailing hands
  - no cute oversized eyes
  - emotion comes from the eyes and brows plus one gesture
- **Background people react:** guards panic, onlookers turn, the healer lectures with a pointing finger. Time-lapse passers-by are motion-blurred ghosts.
- **New cast every video, every face different.** Use the `fx` face morph (width, jaw, chin, cheeks, eye size/tilt/hooding, nose type and size, lips, ears, moles, freckles, double chin) plus hair, beard and headwear. Class and colour coding:
  - peasants: beige, brown, olive
  - authority: one saturated colour (royal blue, red, green, purple, or red and gold)

## 7. Hands, props and limbs (zero tolerance)

- A held prop lives in the hand's **grip frame** (+x = thumb side, +y = fingers). Animate the prop's world pose first, then derive the hand from it: `gripAt(o, who, gripPointWorld, fingerDirWorld, { hold })`. The prop then moves rigidly with the fist.
- Never let a wrist flip or an elbow pop between frames. Keep the waiting hands at chest height. For hand-to-mouth, the forward-elbow IK blend in the rig handles it.
- Hands on tables: draw the table, then redraw the arms over it with `armsOver(person, light, 'RL')`.
- **Close-ups of hands entering the frame** (pinching, slapping) use `PR.closeArm` with the elbow far off-frame, and only when the body is not in shot.
- **Legs:**
  - **Standing or wading:** the rig's own legs, with `legFx` for heat, blister, wound and wet.
  - **Under a blanket:** `noLegs: true`. The side-view art leg (`PR.legClose`) comes out from *under* the blanket edge (draw the leg before the blanket).
  - **Seated with the leg out:** clip the rig torso below the hips, then add a tunic "lap" shaped like a thigh and shaded like the lit torso. The art lower leg comes straight out of its hem at matching scale (rig shin ≈ 410 local units ↔ art shin 900 units).
  - **Extreme close-ups:** a dedicated close-up composition with no body in frame (e.g. underwater side view, with arms entering from off-frame).
- Lying characters: rotate the rig with `sway: -90`. `C.lit` clips to the upright bounding box, so draw rotated people raw with `filter="url(#skinS)"`.

## 8. Look and light

- **Rendering style:** 2.5D multiplane cut-out with flat vector puppets, thin dark outlines and soft airbrushed shading. Painted layered sets carry depth-of-field blur on the far layers.
- **Grades per shot:** `gDay`, `gDusk`, `gNight`, `gHall`, `gFeast`, `gSick`, `gPage`. Plus a vignette in every shot, and the engine's film grain.
- **Neutral, realistic colour:**
  - no yellow cast
  - no dreamy bloom
  - no centred symmetrical sun
  - glows only on real light sources (candles, torches, sun), kept modest
- **Backgrounds must feel crafted:** textured walls, props, people, smoke and light falloff. Something always moves: flames, smoke, cloth, reeds, water, dust motes, rain, crowds.
- **Inside the body:** warm organic macro worlds (`S.flesh`), with intestine tubes, spindle muscle bellies with tendons, vessels with flowing cells, fat cells and bone. Do **not** use cold blue x-ray scans: the user rejected them.

## 9. Sound

- **Everything comes from ElevenLabs** (sound-effects model): music cues, ambiences and one-shots. Name them `wm*` (music), `wa*` (ambience) and `ws*` (SFX).
- **Music:**
  - 3–4 cues per video: an ethnic or period underscore (oud, lute, drums), a horror/tension build, a resolution or climax, and a special-world cue (micro world, feast minstrels).
  - Generated cues often have a silent build at the start and a decay at the end, so check each one's envelope and use `Off` to skip dead air.
  - Overlap passes so there are no holes.
  - A deliberate silence is allowed only on one dramatic beat.
- **SFX:** bassy, beat-driven hits and risers on transitions, foley for every action (pour, gulp, sizzle, splash, slap, snap, creak), and character vocals (groan, gasp, hiss, shout, laugh, chew). No thin hissy whooshes.
- **Mix:**
  - The voice is the anchor (peak normalised to ~0.86).
  - Music ducks 7 dB under the voice, ambience 5 dB, SFX 2.5 dB.
  - Loudest window per clip is normalised, with a +24 dB cap.
  - Hits are aligned by their peak.
  - The music must not have holes: check `levels.ps1` second by second.
