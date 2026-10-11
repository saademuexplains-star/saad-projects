# Character recipe

## Contents
1. Coordinate system & framing
2. Using `person()`
3. Layer order and which finishing filter goes where
4. Adding a garment, prop or hairstyle
5. Custom rigs and creatures
6. Expressions & poses (animation parameters)
7. Model sheet checklist

## 1. Coordinates & framing
- Local units, **feet at y = 0**, head centre ≈ y −1075, top of a hat ≈ −1275, shoulders ≈ −950,
  hips ≈ −605, knees ≈ −380, ankles ≈ −70. x = 0 is the centre line; the screen-left side is negative x.
- Place with `translate(x y) scale(s)`. `FRAMING` presets for a 1080×1920 canvas:
  `wide {y:1800,s:1.3}` full body · `medium {y:2440,s:1.5}` knees up · `close {y:3420,s:2.6}` head &
  shoulders · `extreme {y:4300,s:3.6}` face.
- `placePerson(x, y, s, look, pose, t)` adds the ground shadow, breathing and lighting for you.

## 2. `person(look, pose, variant)`
```js
const DARWIN = { hair: 'bald', hairColor: 'white', beard: 'full', top: 'jacket', coat: '#2e2a26',
                 under: '#e8e0cc', tie: '#2a2a2a', legs: 'trousers', pants: '#3a3632', foot: 'shoes' };
svg += placePerson(540, FRAMING.wide.y, FRAMING.wide.s, DARWIN, { smirk: 1.2, look: 3 }, t);
// close-up with custom framing:
svg += `<g transform="translate(540 ${FRAMING.close.y}) scale(${FRAMING.close.s})">${lit(person(DARWIN, { shock: 1 }))}</g>`;
```
Look options (fixed per character): `skin` light|medium|deep · `hair` short|forelock|long|bald ·
`hairColor` brown|black|blonde|grey|white|red · `beard` none|stubble|mustache|full ·
`hat` none|bicorne|tophat|cap|crown (+ `hatColor`, `hatBand`) · `top` military|jacket|vest|robe ·
`legs` breeches|trousers · `foot` boots|shoes|sandals · colours `coat accent under pants robe trim tie` ·
`hands` gloves|bare · `armLeft` hanging|tucked · `necklace` · `buckles` · `eyeColor` · `id`.
Give each character in the same frame a different `id` prefix only if you build custom defs yourself;
`person()` already makes its gradient ids unique per call.

Always wrap in `lit()` (or use `placePerson`). Without it the character looks flat.

## 3. Layer order & filters
Back → front: long back hair · coat tails · legs (ground shadow, thigh, crease lines, boots/stockings,
shoes, soles) · torso under-layer (vest/shirt) · coat panels · fold shading · lapels · buttons · arms
(sleeve stroke, highlight, cuff, hand) · neck/collar/neckwear · epaulettes → then the head group
(rotates with `tilt`): back hair · ears · face · face shading (clipped to face, blurred) · hair top /
sideburns / fringe · beard · eyes, brows · nose · mouth · mustache · hat.

Filters (defined in engine.js):
| filter | use for |
|---|---|
| `pc` | large pieces that sit at the back (legs, coat tails, boots, shoes, face-level skin uses `pk_*`) |
| `pcl` | large pieces that lie ON something — casts a soft shadow (vest over breeches, coat panels, hats) |
| `pcs` / `pcsl` | small pieces / small lifted pieces (lapels, cuffs, collar, buttons, epaulettes, hair locks) |
| `pk_<tone>` / `pks_<tone>` | skin (face, ears, neck, hands) — warm rim instead of the cool clothing rim |
| `pclA` / `pcsA` | anything drawn as a **stroke** (arms, cuffs): user-space filter region, otherwise the stroke gets clipped |
| `tex` | wraps the whole body group and the head group (paper grain) |
| `soft` / `soft2` | blurred shading shapes, highlights, creases, contact shadows |

## 4. Extending
- Author shapes for the **screen-left** side with negative x, then draw both sides with
  `[-1, 1].map(k => ... mx(k, 'M -100 -608 C ...') ...)`. `mx` needs plain "x y" pairs in the path.
  (A sign bug here once drew each leg's details on the opposite leg — check buckles/highlights land
  on the correct side.)
- Colour a new garment with a 3-stop gradient: `lighten(c,.18)` → `c` → `darken(c,.45)` left→right.
- Give it a finishing filter by role (table above), add 1–3 blurred fold strokes, and a crease or
  seam line at low opacity.
- New hat or prop: keep it inside the head group if it should tilt with the head; add a soft shadow
  ellipse on the face under any brim.
- Keep silhouettes believable: tapers, curves, overlaps. If something reads as a rectangle, round it,
  taper it, or break its edge (hair ends in small points, robes have folds).

## 5. Custom rigs & creatures
For animals or non-human figures write a function returning SVG in the same local system (feet at
0) and follow the same rules: radial gradient body fill, `fur`/`tex` texture, belly/face highlights,
a soft shadow ellipse on the shadow side, contact shadow on the ground, realistic eyes (dark iris,
white glint, optional coloured glint for mood). See `rabbit()` in `examples/napoleon-hook/project.js`.
Crowds: reuse one rig with varied scale, mirroring (`scale(-s s)`), stagger and hop phase.

## 6. Expression & pose parameters (per frame)
`lid` 0 open · .35–.55 smug/suspicious · 2 closed (blink) — use `blinkAt(t,[...])` for natural blinks
`look`, `lookY` pupil offset (−6…6) · `browL`, `browR` raise in px (negative = frown) · `smirk` 0–1.6 ·
`shock` 0/1 (wide eyes, open mouth, brows up) · `talk` 0–1 mouth open (flap with |sin| for speech) ·
`tilt` head rotation in degrees · `raiseLeft`, `raiseRight` arm raise in degrees (screen sides) ·
`sweat` 0/1 and `sweatY` slide distance.
Body life: always wrap in `breathe(t)`; add slow `Math.sin(t*1.6)*1.2` head sway when idle.

## 7. Model sheet checklist (send before animating)
- Full body in the main setting (and alternatives if the user must choose, e.g. boots vs shoes).
- Close-ups: neutral, smug, shocked, talking. Details: hands, feet, any signature prop.
- Look for: flat rectangles, missing feet/hands, hair that reads as blocks, pieces that look pasted
  on (fix with filters/cast shadows), mirrored details on the wrong side, clipped strokes.
