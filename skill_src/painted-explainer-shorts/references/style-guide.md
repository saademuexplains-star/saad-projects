# Style guide

The look was developed iteratively with the user on a Napoleon short. This file records *what* the
look is and *why* each choice was made, including what the user rejected, so a new project lands in
the right place on the first try. Look at `assets/reference/` alongside this.

## Contents
1. The idea in one paragraph
2. Inspiration (the user's reference videos)
3. Characters
4. Faces & expressions
5. Backgrounds
6. Light, colour, texture
7. Text: captions, labels, pop-ups
8. Variants A and B
9. Approved vs rejected — the decision log

## 1. The idea
Realistic-looking subjects + simple, slightly crude expressions + blurry real-world backgrounds +
fast, beat-synced cutting. Realism makes it feel grounded and watchable for all ages (the user
explicitly wants elders to enjoy it too); the crude, simple face drawing gives it personality and
humour; the blur keeps the eye on the character; the sync makes it feel alive and "edited".

## 2. Inspiration
The user pointed at two styles of viral shorts:
- **Animal/dinosaur facts**: photoreal 3D subjects with crude 2D cartoon eyes and mouths pasted on
  (big white eyes, heavy grey lids, drawn smiles), a presenter cutout, one bold uppercase word as a
  caption at the top, red WordArt titles, a measuring line ("1.5 ft"), crude red scribbles.
- **"Crows never forget"**: photo crows on a branch with googly-ish eyes and angry brows, blurred
  park background, lower-third sentence-case captions in white with a soft shadow, cut-ins on punchlines.
Common thread: realistic subject + simple expressive face + depth-of-field background + quick cuts.
We cannot generate photoreal images in code, so we get *close* with painted vector characters that
have real proportions, soft volume lighting and texture — never flat cartoon shapes with outlines.

## 3. Characters
- **Proportions:** ~7 heads tall, realistic anatomy. Legs are shaped (thigh → knee → calf), feet are
  real feet/shoes (the user flagged "he has no feet" — never end legs in flat columns), hands have a
  thumb and finger hints, hair has real shape (no flat side rectangles — they read as "blinders").
- **No outlines.** Edges come from colour/value contrast, the dark rim on the shadow side, and cast
  shadows between overlapping pieces.
- **Every piece is finished** (`pc/pcl/pcs/pcsl/pk/pks` filters): slightly rounded corners, a soft
  dark rim toward the lower-right, a faint warm rim on the upper-left, and pieces that sit on top of
  others (coats over vests, lapels, arms, collars, hats, hair fringes) cast a soft shadow. The user's
  words: make "the edges a little round, shady … so it don't look cutted pieces".
- **Texture:** the `tex` filter adds a fine paper/canvas grain — part of the "crude" charm.
- **Lighting:** wrap every character in `lit()` — warm key light from the upper-left, cool shadow on
  the lower-right, applied only inside the silhouette.
- **Palette:** muted, slightly historical; saturated only in small accents (a red collar, gold buttons).
- **Iconic accuracy:** keep the one or two details that make a figure recognisable (Napoleon:
  bicorne worn sideways, hand in the vest, epaulettes, white breeches, riding boots). Research the
  period lightly; do not invent heraldry or uniforms that are clearly wrong.
- Creatures follow the same recipe (gradient fur, `fur` filter, soft contact shadows, realistic eyes
  with a small glint — e.g. red glints for "menacing" rabbits).

## 4. Faces & expressions
- Realistic-but-simple: almond eyes with iris, pupil and highlight; soft blurred brows; nose built
  from shading + nostrils; a line mouth with a lip shadow; cheek blush; a soft shadow under hat brims.
- The user said the face and "crudeness" were *perfect* — keep faces simple and slightly naive; do
  not add detail until they look like illustrations.
- Expressions are driven by a few parameters (`lid`, `look`, `browL/browR`, `smirk`, `shock`, `talk`,
  `tilt`, `sweat`). Exaggerate with *pose and timing* (head tilt snap, brow pop, eye dart), not detail.
- Useful reads: smug = lid .5 + smirk 1.5 + one brow up + chin tilt; shocked = shock 1 + brows up +
  sweat drop + head jolt; scheming = eyes dart sideways and back; talking = `talk` 0.3–0.8 flapping.

## 5. Backgrounds
- Paint simple shapes (sky gradient, turbulence clouds, a treeline, ground with grass/plank texture,
  a few props like tents, flags, windows) and **blur them heavily** (`dof`, `dofHeavy` for close-ups).
  It should read like a portrait-mode photo. Add a few bokeh dots.
- Match the mood with presets: `day`, `golden`, `dusk` (bad news), `night`, `desert`; `interior()` for rooms.
- Darken/cool the background for "bad" beats (dusk preset + a dark overlay rect) — mood change is
  part of storytelling.
- Keep props period-plausible and generic enough not to distract.

## 6. Light, colour, texture
- One light direction everywhere: upper-left. Shadows fall down-right (cast-shadow offsets, ground
  shadow ellipse slightly right of the feet).
- Vignette on every frame. Film grain/paper texture is subtle — never posterised or noisy.
- Do not use flat neon colours, pure white or pure black fills on characters.

## 7. Text
**Captions (default, the user's chosen style — matches their "four dumbest scams" reference):**
- **One word at a time**, appearing exactly when it is spoken and staying until the next word
  (at most ~1.2 s through a pause). No word lists, no multi-word lines.
- Written **as spoken**: normal casing, punctuation kept — "First," "1925," "Napoleon." "defence?"
  "worked..." — not ALL CAPS.
- **Poppins ExtraBold (800), ~80 px**, centred horizontally, baseline a little below the middle of
  the frame (top ≈ 1215 px of 1920) — over the character's chest in most framings, fixed position.
- **White** (#fffdf5) for ordinary words, **yellow** (#ffd21f) for key words: the subject's name,
  numbers and dates, the hook words, the punchline / most surprising word of a sentence. Function
  words and filler stay white ("the", "to", "was", "first", "next", "just", "so", "one?").
  Roughly a third to a half of words end up yellow — it is an editorial choice, set per word.
- Thin dark outline (~5 px) + soft drop shadow so it reads on any background; no boxes, no banners.
- Entrance: essentially a cut, with a tiny 0.07 s settle (90% → 100%). No bouncing, no sliding.
- Optional alternative only if the user asks: short phrase in the lower third (`captions: 'phrase'`).

- **Labels:** small white text (e.g. "Napoléon Bonaparte", "July 1807") fading in near a corner —
  factual context, not decoration.
- **No numbering on screen.** The user explicitly removed it: no "1." "2." countdown markers in a
  corner, no numbered teaser badges, no "#3" stamps, no item counters — even for list videos.
  Tease the payoff with visuals instead (e.g. the rabbit that peeks in on "things" in the example).
- **Rejected:** gold metal plates, a big red "L" in a starburst, parchment cards with ink stamps,
  mixed decorative fonts (the user found these "not suiting"); one big UPPERCASE word at the top;
  numbered badges / list numbers.

## 8. Variants
- **B — clean (approved default).** Realistic eyes/mouth, minimal labels.
- **A — punchy.** Big white cartoon eyes with dark lids and a drawn mouth on the realistic face,
  optional red marker circles. Offer it only if the user asks for more meme energy; render both A
  and B side by side when the direction is unclear. Captions are identical in both variants.

## 9. Decision log (in order)
1. Flat cartoon with outlines + meme pop-ups → "popups not suiting; too cartoonish; make it crude
   with vibes and lighting so elders enjoy it; transitions not just sliding".
2. Ink/parchment period look with sketchy lines → the user shared the photo+crude-eyes references.
3. Semi-realistic painted characters, A vs B sheets → "this works".
4. Motion v1 (actions at shot starts, hard cuts) → "motions not syncing, transitions not dissolving".
5. Motion v3 (word kicks, stressed-syllable hits, layered dissolves, SFX) + variant B → "2nd one is great;
   face and crudeness perfect".
6. Character fixes: shaped legs, feet/boots (shoes as an option), real hair, gloves, tucked hand.
7. Finishing pass (rounded, shaded edges, cast shadows) → approved; 5 s sample rendered.
8. Captions → the user pointed at the word-by-word white/yellow captions of a "four dumbest scams"
   short and asked to drop "the fact number type … the numbering stuff". Word captions became the
   default; all on-screen numbering (countdown markers, numbered badges) was removed.
