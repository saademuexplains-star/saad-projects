# Locked standards for the next video (agreed after Spartan v3)

Pipeline to reuse: `scratchpad/spartan2/` (engine.js, rigs.js with the arm-side fix, anim.js with
gripHand / toWorld / toLocal / fistC, tools/render_passes.cjs, tools/shade.py, tools/shade_frames.py,
tools/mix.py, tools/pops.py).

## Locked look and format (approved; keep as is)
- 1080x1920, 30 fps; two-pass H.264 at about 4.9 Mb/s (under 30 MB); audio at -14 LUFS, peaks at or below -1.5 dBTP.
- Refined 2D painted characters (the v3 cast style). No 3D rebuild.
- Lighting: the deferred relight pipeline (flat + normal passes, shaded in shade.py) with the soft
  hue-preserving tonemap, neutral lights and healthy ambient. Never burnt or orange.
- No captions and no names on screen.
- Sound effects are bassy (kicks, whoomphs, thumps), never thin "shoosh" or "tin tin" sounds. Keep pauses in the voiceover few.
- Transitions are crisp: cuts, whips, quick zooms, short dims, brief clean flashes. No orange burn and no blurry smoke.
- Animation is acting rather than a string of still scenes. Every shot performs its line, with breathing,
  blinks, eye darts and handheld drift. The video loops: the last frame is the first frame.

## New quality bar (every frame must pass before delivery)
1. Edges. Each character reads as one complete, solid figure, not separate PNGs:
   - no seams or gaps at the shoulder, elbow, wrist, neck or hips, and none between sleeve and arm;
   - no background pixels inside a silhouette;
   - one defined edge around the whole figure (not around each piece), the same on body, clothes, hair and props;
   - nothing semi-transparent except deliberate fades.
2. Hands are correct and aligned:
   - exactly two hands per person, each on its own side;
   - the wrist sits exactly at the end of the forearm, and the hand points along it;
   - grips are computed from world positions: the handle runs through the fist, and the hand is drawn on top of what it holds;
   - contacts (shoulder grabs, holding hands, handovers) stay locked to the other body on every frame;
   - no hand floats, is hidden behind a body by accident, or crosses another character.
3. Clothes and hair cover properly:
   - they are opaque and drawn in the right order (hair, cloak, sleeves, body);
   - the background never shows through them, and they never blend into the background or into another character;
   - no crossfades between bodies whose limbs are in different places; use push-ins or cuts instead.
4. Composition has no confusing overlaps:
   - characters are either separated or clearly layered by depth;
   - limbs and props never cross another body unless it is a deliberate contact;
   - faces are never cut by the frame edge or covered by another character.
5. Cinematic look:
   - shot grammar runs from establishing shot to medium shot to close-up, with motivated camera moves (push-in, dolly);
   - parallax between foreground, midground and background layers, and consistent screen direction;
   - depth from a shallow depth of field on backgrounds, foreground occluders, and atmospheric haze or light shafts;
   - motivated key and rim lights with stronger contrast and deeper shadows, still never burnt;
   - one grade per scene, subtle film grain, a soft vignette, and motion blur on fast moves.

## QA gate (run on every video)
- **Limb audit:** for each character on each frame, check the arm and hand count, which side each is on, wrist-to-forearm alignment, and the distance from each grip to its target.
- **Gap check:** render characters over magenta and flag any magenta inside a silhouette.
- **Contact sheets:** review every shot at 0.25 s steps, and look closely at every hand contact and every overlap.
- **Motion checks:** look for frame-difference spikes outside transitions, and check the loop seam.
