# Handoff: where things stand (8 November 2026, after the Semmelweis test)

## Newest: the Coca-Cola video (8 November 2026)

Built from the user's voiceover (`_vo18`: trimmed to 47.320 s, 2840 frames; `words.txt` force-aligned on Linux with
PocketSphinx) in `main20.html`: `cast21.js` (the cast20 faces on the new standard), `sets25.js` / `sets25b.js` (new sets),
`map18.js` (Natural Earth outlines), `shots_x.js` / `shots_x2.js` / `shots_x3.js` (14 shots, 14 transitions, the loop).
Beats in `_vo18/beats.md`. Sound in `_sfx18` (`sessions.txt` lists every ElevenLabs session), mixed by
`_tools/mix_coca.py`. Mid-production the user flagged the arms and hands three times; the fixes are in the rig and in
FEEDBACK_LOG ("The Coca-Cola video, arms and hands"): an arm contact shadow (`Q.armAO`), no arm across a face, 45-degree
grips, fanned fists, matching outline and skin, round sleeves with a buttoned cuff. Fonts: install `_render/fonts`.

## Newest: the Semmelweis test and its fixes (approved: "ok perfect")

In another account the skill was tested on a new topic (Vienna 1847, Ignaz Semmelweis and handwashing: `castT1.js`,
`setsT1.js`, `shotsT1.js`, `lookT1.html`, `rigT1.html`; frames in `references/frames_2026-11-08/`). The user corrected
three things, and the fixes are now part of the shared code and the standard for every video:
1. Hands and arms "look like cutted pngs": arms stay in the body's one light pass (`ST.behind` for furniture they rest
   on or reach into, `ST.litWith` for a held prop and its fist); the clean rig's wrist curves from the cuff into the
   hand (`wristBridge`, `joinWrist`); no glassy sleeve-opening disc.
2. Clothes and hair "uneven ... not detailed": cloth weave (`o.weave`), finished tailoring (`T.jacket` velvet collar,
   stitching, buttonhole, weave; `T.vest`; silk bow; pressed pleats), and the hair kit (`hairkit.js`).
3. Hair "cutted at some points ... not matching": hair lit inside the figure's light pass (`Q.litHair`), no straight
   cut ends, one gradient per head.
Details: FEEDBACK_LOG (the last three entries), RIG_API (the last two sections).

Read this first in a new account or a new session. Then read `SKILL.md`, `references/STYLE.md` and **all** of
`references/FEEDBACK_LOG.md` (every correction the user has ever made) before doing anything.

## The user

- Makes "You are a ___" dark-history YouTube Shorts (1080x1920, 60 fps, about 45-50 s). They write or approve the
  script, make the voiceover in ElevenLabs themselves and send the mp3. Never generate a voiceover unless asked.
- Writes short, casual messages, often without punctuation. Read them for intent; when a request is clear enough to
  act on, act.
- Wants:
  - zero glitches;
  - strong momentum;
  - soft, varied transitions;
  - the warm, candle-lit house look of their favourites (The Royal Taster, The Tomb Builder, The First Vaccine);
  - very good, detailed sets;
  - very good characters: finishing, emotion, movement.
- Watches usage closely: one video once used about 80% of a week's allowance.
  - Review with a few well-chosen images (contact sheets and crops), not dozens.
  - Don't re-render more than needed.
  - Fix a problem at its root in the rig rather than shot by shot.
- **Show the look first.** Before animating a new video, send a few stills of different scenes and wait for an OK.
  This was the Coca-Cola look test.
- Delivery: the MP4 plus three WAV stems (voiceover, sfx, music).

## The rig (approved: "Rig is good")

- **Clean rig:**
  - in the page, `window.RIG_CRISP = true` before `rig3.js`, then load `tailor.js` and `stage.js`;
  - `ENG.GRAIN = 0.025`;
  - render with `-Quality 98`.

  Everything is explained in `RIG_API.md`, section "Clean rig".
- **Clothes:** dress every character with `tailor.js` (shirt, collar and tie, jacket with lapels, waistcoat, uniform,
  apron), set `tailored: true` and give each garment its real length (`dims.hemY`). Never draw lapels or seams as bare
  lines.
- **Hands:** use the rig's own hands. The jointed per-shot hands in `hands20.js` were tried and rejected ("they look very
  odd"). A labelled bottle or a glass stands upright in the world, with a detached fist drawn over it.
- **Waist-up shots:** light the figure from the chest (`ST.up`), otherwise the shoulders fade dark.
- **Check every new cast** full length on `rig20.html` before building shots.
- **Model pages:**
  - `look20.html`: the three approved stills;
  - `rig20.html`: the rig sheet;
  - `main19.html`: a full video page, with transitions rendered into images.
  - `lookT1.html` / `rigT1.html`: the Semmelweis test, the model for hands, cloth and hair (2026-11-08).

## The look (FEEDBACK_LOG, 2026-11-08)

- Warm, limited palette with no big areas of saturated blue.
- One light source per shot; faces brightest; the background falls into shadow.
- Faces or the story object big on screen at least 80% of the time; 1-3 locations.
- 2.5D layered sets, never 3D unless a single shot truly needs it.
- Simple, one-colour costumes that are richly finished.
- Expressive faces, breathing and body acting, with clean gestures.

## The next video: Coca-Cola

The script is final and approved; the user records the voiceover:

> A sword slices open your chest, and the doctors give you the only painkiller they have, morphine, and it works so
> well that you can never stop taking it. Twenty years after the American Civil War, you're a pharmacist in Atlanta, a
> respected man with a secret, desperate to find a substitute. So you start mixing medicines in your back room, and
> you find two strange ingredients: leaves of the coca plant, the same plant cocaine comes from, and a nut packed with
> caffeine. You blend them with wine and sell it as a cure for headaches, nerves, and even morphine addiction. When the
> city bans alcohol, you swap the wine for sweet brown syrup, mix it with fizzy water, and sell it as a brain tonic,
> five cents a glass. It never cures you. But when you die two years later, still hooked on morphine, after selling
> your share of the business, you never find out what your drink becomes. Today it's sold in almost every country on
> earth, and it's called Coca-Cola.

Already built and approved:
- `cast20.js`:
  - John Pemberton at 34 (`pembYoung`, with the sabre wound in `pembYoungHurt`);
  - Pemberton at 54 (`pembOld`);
  - the field surgeon;
  - the soda clerk.
- `sets24.js`, with three sets and their props:
  - the night battlefield at Columbus, Georgia, 1865;
  - the back room, 1885;
  - the Jacobs' Pharmacy soda fountain, 1886;
  - props: a MORPHINE bottle, the pestle, the soda glass.
- `shots_w.js`: the three approved stills.

Before the shots, bring the Coca-Cola cast up to the Semmelweis-test standard: hair from `hairkit.js` lit with the
head (`Q.litHair`; copy the helpers from `castT1.js`), `weave` on every garment, `T.jacket({ velvet: true })` on the
frock coats (not on the clerk's white jacket), and in the shots `ST.behind` / `ST.litWith` instead of `armsOver` /
`handsLit`. Re-render `rig20.html` and `look20.html` and show the user the cast sheet and stills before animating.

When the voiceover arrives, follow SKILL.md's workflow from VO prep:
- Continue these files in `main20.html`, with `props18.js`, `_vo18` and `_sfx18`.
- New beats still to build: the shop front in Atlanta; mixing the coca wine; the city banning alcohol (Atlanta, 1886);
  the syrup and fizzy water at the fountain; Pemberton ill and selling his share (1888); his death; and the reveal.
- **Keep the name "Coca-Cola" off screen until the last line.** It is the twist; the fountain card says "Brain Tonic".
- Show the user the look of any new set and cast before animating.

## Writing more scripts (when asked)

- Second person, "You are a ___", simple easy English, about 120-140 words, short punchy sentences.
- Globally known topics. Open with the year and the role, build suspense through visual beats, and land the twist in
  the last line.
- The user likes court and thriller stories and real medical firsts.
- When the user says "keep my opening", change only what they name.
