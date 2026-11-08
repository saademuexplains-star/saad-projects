# Character rig (`_render/lib/rig3.js`)

`G.RIG.person(o)` draws one front-facing puppet as SVG.

**Coordinates.** Units are *person-local*: the origin is between the feet and **-y is up**. A man is about 1450 units tall:

| Point | Local y |
|---|---|
| Head | -1308 |
| Shoulders | -1150 |
| Waist | -820 |
| Tunic hem | -470 |

World placement uses `o.x`, `o.y` (the feet), `o.s` (scale, usually 0.55–0.7) and `o.sway` (degrees of whole-body rotation about the feet; -90 = lying, head left).

**Returns** `{ svg, handR, handL, armRsvg, armLsvg, D, shR, shL, info }`. Always light it before drawing: `X.lit(P, LIGHT)`, which returns cast shadow + body.

Exports (in `G.RIG`): `defs, person, hand, shade, mix, rng, uid, DIMS, OUT, OW, NS, ol, restHand, f, cylGrad, vGrad, EXPR, FACE, faceP, crownArt, toWorld, toLocal, dirLocal, headPt, woundPt, limb`.

## Cast files

Each video has a `castN.js` that builds `G.QCAST = Q` with a maker:

```js
const mk = (base, faceBase) => p => person(Object.assign({}, base, p, { fx: Object.assign({}, base.fx, p.fx || {}), face: face(faceBase, p) }));
Q.you = mk({ kind: 'man', dims: {...}, skin: '#9c6a46', hair: '#18110c', hairStyle: 'curls', hairSeed: 52, stubble: 0.9,
  tunic: '#d9ceb2', sleeve: '#d2c6a8', legs: null, feet: '#8e5e3e', belt: '#7a4a24', lightX: -1,
  fx: { w: 1.03, cheek: 1.05, jaw: 1.1, chinW: 1.08, nose: 'broad', noseS: 1.05, browT: 1.3, browArch: -1, lipT: 1.25 } },
  { expr: 'neutral', iris: '#3a2a1a' });
Q.blink = K0.blink; Q.talk = K0.talk; Q.breath = K0.breath;   // from cast.js
```

In shots you call `Q.you(Object.assign(idle(t, seed), { x, y, s, face: {...}, armR: {...}, armL: {...} }))`. Use `cast4.js` (The Worm) and `cast3.js` (The Royal Taster) as models, and make a **new** cast file for each video.

## Body options

| Option | Values / meaning |
|---|---|
| `kind` | `'man'`, `'woman'`, `'kid'` (DIMS: H, headY, shY, shX, wY, wX, hemY, hemX, legX, legW, foot, ua, fa, sw, hand) |
| `dims` | Per-character overrides of DIMS, e.g. `{ shX: 160, wX: 128, hemX: 150, sw: 80, hand: 112 }` |
| `build` | `'fat'` (wider body, belly) |
| `robe` | Long robe to the feet (no legs drawn) |
| `skin, tunic, sleeve, belt, legs, feet` | Colours. `legs: null` means bare legs; `feet` is the foot colour (bare feet get toes) |
| `apron, mantle (+ mantleW, mantleDrop, ermine), tabard {col, trim}, cape, mail, hood, coif, veil, wimple, kerchief, turban, cap, circlet, crown (+ crownLift, crownRot), helmet` | Costume |
| `stripes, patch, dirt, pouch, strap, leatherBelt, buckle, paint, scar` | Detail |
| `hair, hairStyle ('curls' / 'messy' / 'bald' / receding / slick / short / bob / long), hairSeed, brow, beard, beardStyle ('short' / 'pointed' / 'goatee' / 'long' / 'braided' / 'full'), mustache, mstyle ('walrus'), stubble, noSideburns` | Hair |
| `tilt` | Head tilt in degrees (does not move the body) |
| `breath`, `blink` | Set by `idle(t, seed)` |
| `headScale` | Head size |
| `lightX` | -1 or 1: which side the key light is on |
| `props` / `frontProps` | Extra SVG drawn behind or in front, in local units (e.g. a basket on the head) |
| `noLegs: true` | Don't draw legs (blanket covers them; seated lap cloth) |
| `hideLeg: 1 / -1` | Hide one leg (+1 = the screen-right leg) |
| `legFx: { s, heat, blister, wound, wet, under }` | Draw burning, blister, open sore or wet sheen **on the rig's own leg** `s`. `R.woundPt(D, s)` returns the local point of the sore, so worms and hands can be placed with `R.toWorld(o, R.woundPt(D, 1))` |

## Face

`face: { expr, mouth, open, lid, brows: [inner, outer], look: [x, y], wide, turn, sweat, tears, blush, bags, redEyes, age, iris }`

- **`expr`** presets: `neutral`, `anxious`, `fear` (wide), `grim`, `stern`, `tired`, `grief` (cry mouth), `hollow`. Explicit fields override the preset.
- **`mouth`**: `closed`, `tight`, `parted`, `smile`, `grin`, `talk`, `snarl`, `cry`. `open` is 0–0.4.
  - Talking: `mouth: 'talk', open: Q.talk(t, 0.3, 7)`.
  - Chewing: `open: 0.06 + 0.08 * (0.5 + 0.5 * sin(t * 16))`.
- **`look`**: eyes aim at the subject, e.g. `[0.7, 0]` = screen right. Always point the eyes at what the character reacts to.
- **`lid`**: 0 = wide open, 1 = shut. Blinks come from `idle()`.

**Face structure — `fx`** (different for every character): `w, cheek, jaw, chinW, len, chin, eyeS, eyeW, eyeH, eyeX, eyeY, irisS, eyeTilt, hooded, crow, lidAdd, browT, browArch, browOut, browIn, browLen, nose ('std' / 'hook' / 'broad' / 'button' / 'long'), noseS, noseL, mouthW, lipT, mouthY, earS, hollow, freckles, mole: [x, y], dbl`.

## Arms and hands

`armR` / `armL`: `{ hand: [x, y] (person-local wrist target), pose, facing, dir, hold, holdRot, detachHand, behind, elbow, fwd, bend, us, fs, thumb }`

- **`pose`**: `relaxed`, `open`, `fist`, `grip` (closed around `hold`), `point`.
- **`facing`**: `'back'` (back of the hand to camera) or `'palm'`.
- **`dir`**: the finger direction, in local axes. The wrist bends up to ~75°, more when the forearm is foreshortened.
- **`hold`**: SVG of the prop in the **grip frame**: origin at the grip slot, +x = thumb side, +y = fingers. Used with `pose: 'grip'`. `holdRot` rotates it.
- **`detachHand: true`**: returns the hand separately (`P.handR`) so it can be drawn over a prop.
- **`elbow`**: `'in'` / `'free'` override the IK elbow choice. The forward-elbow blend for hand-to-face is automatic.
- `R` is the character's right arm (screen left); `L` is the left (screen right).

## Helpers (`shots_e.js` exports them as `G.SHOTS_E`)

```js
gripAt(o, who, gripWorld, fingerDirWorld, extra)  // arm object whose grip slot sits exactly on a world point
gripPt(o, who, side, arm, px, py)                 // world point at offset (px along the knuckles, py along the fingers) in that grip
fingersFor(side, facing, thumbAxisWorld)          // finger dir that puts the thumb along a world axis (rims, blades)
thumbAxis(side, facing, fingerDir)
armsOver(person, light, 'RL')                     // redraw the lit arms on top (over a table, lap or blanket)
idle(t, seed, amp)                                // { blink, breath, sway } for living characters
hh(cam, t, amp, seed)                             // hand-held camera drift; also stores X.CAM for culling
scr(worldPt, cam, p)                              // where a world point lands on screen (for transition focus points)
bump(t, t0, a, len), env(t, a, b, c, d), sbob(t, hz), wave(t, hz)   // smooth envelopes (no kinks)
```

`HAND = { you: 112, seller: 125.3, healer: 112, merchant: 116, wife: 104 }` is the per-character hand size used by the grip maths. Add your cast's sizes.

**Recipe for a held prop.** Animate the prop's world anchor and angle first. Then:

```js
const thumb = [cos(rimAngle), sin(rimAngle)];
const dir = fingersFor('L', 'back', thumb);
const arm = gripAt(o, 'you', propAnchor(t), dir, { hold: PR.cup({...}) });
const rim = gripPt(o, 'you', 'L', arm, 42, 0);   // stream lands on the rim
```

**Close-up arms** (no body in shot): `PR.closeArm({ from, wrist, dir, side, facing, pose, size, skin, sleeve, hold })`. Put `from` about 900 px back along `-dir` so the forearm exits the frame.

## Lighting presets

Each preset is `{ from, shadow, shadowOp, floor, floorOp, contactOp, key, keyAdd, rims: [{from, col, w, op}], face: {col, op} }`. Examples in `shots_e.js` (`L5.market`, `dayY`, `nightY`, `dawn`) and `shots_e2.js` (`L6.river`, `hut`). Never switch presets on screen; darken with a set overlay instead.

## Gotchas

- `C.lit` clips to the upright bounding box, so rotated people (lying, falling) must be drawn raw: `<g filter="url(#skinS)">${P.svg}</g>`.
- **Seated characters.** Clip the torso at the hips (`clipPath` rect in world space), set `noLegs: true`, then draw:
  1. a thigh-shaped tunic lap shaded to match the lit torso;
  2. the side-view art leg `PR.legClose` (scale ≈ 0.3 for a 0.66 rig) coming out of the hem, drawn *before* the lap;
  3. `armsOver` on top.

  See W7 in `shots_e2.js`.
- `PR.legClose` is a side-view lower leg: ankle at (0,0), knee at y -900, toes at +x. Rotate -90 for an outstretched or lying leg (toes up). `PR.LEG_WOUND = [34, 46]` is where its sore sits.
- Never crossfade between a rig limb and an art limb. Never show a body and a detached close-up limb in the same frame.

## Clean rig (from 2026-11-08, the Coca-Cola look test) - use it for every new video

Page setup:
- Before `rig3.js`: `window.RIG_CRISP = true;`.
- After `env.js`: load `../lib/tailor.js` and `../lib/stage.js`.
- After `engine.js`: `ENG.GRAIN = 0.025;`.
- Render with `cdp.ps1 -Quality 98`.
- Old pages set `window.RIG_HANDS = 1` (the old hands). New pages leave it unset and get the V2 hands and sleeves.
- `look20.html` is the model page; `main19.html` shows the transition-raster `renderFrame` for full videos.

What `G.RIG_CRISP` changes:
- A faint cloth weave instead of a heavy speckle, and lighter, narrower shading inside garment edges.
- Crisp sleeve shading, with folds at half strength.
- The inside of the elbow is a rounded fold, not a paper corner.
- A clean curved armhole seam instead of a feathered yoke (a dark body faded over light sleeves read as a smudge).

Per character, `tailored: true` (jackets, shirts, aprons cut to a pattern):
- No tunic pleats (they read as a kilt), no belt-line shadow, no hem grime (unless `dirt`); a soft side fold instead.
- Give each garment its real length with `dims.hemY`: shell jacket -700, shirt under a waistcoat -760, hip-length
  jacket -640, knee apron -560.

`tailor.js` (`G.TAILOR = T`) draws costume overlays like real garments, never bare lines. Person-local units; the rig
cuts them to the torso.
- `T.shirt({ col, placket, pleats, studs, vy })`: the shirt front in an opening (`col: null` means the tunic is the shirt).
- `T.collar({ type: 'stand' | 'wing', tie: 'bow' | 'none', tieCol, y })`.
- `T.jacket({ col, lapel: 'notch' | 'none', buttons: [y...], bkind, pocket: 'pencil' | 'plain' | null, folds, edge })`:
  filled notched lapels with their shadow, the left front lapped over the right with a lit seam, cloth buttons with a
  shadow, a breast-pocket welt, pull folds.
- `T.waistcoat({ col, stripe, stripeOp, buttons, chain })`: fronts to the torso's edges, a pinstripe, lit edges, a fold
  under the chest, welts, horn buttons, a watch chain.
- `T.uniform({ collar, stars, rows, buttons, belt, soil, twill })`: a double-breasted shell jacket with brass buttons,
  faced collar and stars, sword belt and plate, soot and mud from a seed.
- `T.wound({ a, b, seed, cloth })`: a sabre cut torn in the cloth.
- `T.apron({ col, braces, tools, blood })`.
- Helpers: `T.button(x, y, 'cloth' | 'brass' | 'horn', r, col)`, `T.star`, `T.brassDefs()` (once, for brass).
- Layer bottom to top:
  - waistcoat: `T.shirt({ pleats: true, studs: 2 }) + T.waistcoat() + T.collar({ type: 'wing', y: -1160 })`;
  - jacket: `T.shirt({ col: '#f8f6f0', placket: true }) + T.collar() + T.jacket()`.

`stage.js` (`G.STAGE = ST`) holds the shot helpers.
- `ST.up(P, o)`, then `ST.lit`, `ST.armsOver`, `ST.handsLit`: a figure framed from the waist up is lit from its chest.
  `C.lit` centres the key light on the whole body, which is below the frame, so the shoulders went dark.
- `ST.gripAt(o, handSize, gripWorld, fingerDirWorld, extra)` and `ST.fingersFor(side, facing, thumbAxisWorld)`.
- `ST.still(x, y, s, extra)` (no blink), `ST.clipTop(id, y, svg)` (cut off behind a counter or bench), `ST.nrm`.
- A labelled bottle or a glass must stay level, so never put it in `hold`: the wrist clamp (~75 deg) tilts it.
  1. Draw it upright in the world (`S.morphineBottle`, `S.sodaGlass` in `sets24.js`).
  2. Grip it with a detached fist: `armL: ST.gripAt(o, hand, neck, [-1, 0], { facing: 'back', detachHand: true })`.
  3. Draw the thing, then `ST.handsLit(P, L, 'L')`.
  Choose the hand whose fingers continue its forearm. A `'palm'` fist reads as a block.
- A figure behind a counter keeps its hands below the counter edge, or drawn on top of it.

Rig sheet: `rig20.html` (frame 30) renders the cast full length in a warm studio. Check every new cast there. The
jointed per-shot hands in `hands20.js` were rejected by the user; use the rig's hands.
Arms and furniture (2026-11-08, after "they look like cutted pngs"):
- `ST.behind(P, id, svg, which = 'RL')`: furniture drawn after the figure, masked out wherever its forearms and hands are
  (they keep the body's own light pass). Use it instead of `ST.armsOver`, which relights the arms on their own and rims
  their inner edges. `window.DBG_BEHIND = true` shows the mask in red.
- `ST.litWith(P, L, svg, ext)`: the figure lit together with what it holds, e.g. `P.svg + cane + P.handR`, in one pass.
- rig3 with `RIG_CRISP`: the wrist is one curved piece from the cuff into the hand (`wristBridge`), the hand's top
  dissolves into it (`joinWrist`), and no half-transparent sleeve-opening disc is drawn.

Detailing (2026-11-08):
- `o.weave = { kind: 'twill' | 'linen', op }`: thread texture on the torso and sleeves. `T.jacket({ weave, weaveOp, velvet })`.
- `T.vest({ col, figure, chain })`: a silk waistcoat seen in a jacket's opening (after `T.shirt`, before `T.collar`).
- `_render/lib/hairkit.js` (`G.HAIRKIT`): `centrePart({ fx, col, id, light, braid, ribbon })`, `sidePart({ fx, col, id,
  light, part })`, `baldFringe({ fx, col, id, light })`, each `{ back, front }` for `Q.withArt`; set `hairStyle: 'bald'`.
  Load it after `stage.js`.
