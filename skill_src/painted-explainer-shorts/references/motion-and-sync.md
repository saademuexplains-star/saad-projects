# Motion & sync

## Contents
1. The rule: motion follows the voice
2. Beat sheet format
3. The hook formula (first ~5 s)
4. Camera language
5. Character acting
6. Transition catalog
7. Sound effects
8. Captions timing

## 1. The rule
The user's complaint on the first animated version was "motions are not syncing" — actions
happened at shot starts instead of on the words. Fix:
- **Every word** gives the camera a tiny kick (`beat(t)` from `makeTimeline` — +1% scale, decaying in
  ~0.1 s). This makes the picture breathe with the narration.
- **Stressed syllables of key words** get the real actions: a pop-in, a head snap, a crash zoom, a
  creature bursting in, a flash. Pick 1 hit per ~0.5–0.8 s. Put their times in `STRONG`.
- The stressed syllable is often not the word start: na-**PO**-leon landed at 2.03 s while the word
  began at 1.90 s; "rab-**BITS**" had a second hit 0.4 s after "RAB-". Use `onsets.py` to find them.
- Anticipate: a small pull-back or push just before a big hit (≈0.15 s) makes the hit read harder.

## 2. Beat sheet (write this before drawing)
| t | words | shot / framing | action on the stressed syllable | prop / label | transition in | SFX |
|---|---|---|---|---|---|---|
| 0.00 | Ten weird things | medium, camp | whip-out reveal from the face; brow pop on "weird"; rabbit peeks on "things" | — | — | whoosh + pop |
| 1.90 | about Napoleon | close, smug | chin-up + smirk at 2.03 (na-PO) | name label | zoom dissolve | sparkle |
| … | | | | | | |

## 3. Hook formula
The first half second decides whether people keep watching.
1. **Start in motion** — never on a still frame: open zoomed into the face and whip out (2.4× → 1×
   in 0.4 s with a blur that clears) or crash in.
2. **Show the promise visually** — give a 0.3–0.5 s glimpse of the payoff (a creature peeking in
   from the frame edge, a silhouette, a prop flashing past) and let the character react. Never put
   counts or list numbers on screen; the narration says the number.
3. **Name the subject on its stressed syllable** — close-up, a confident/smug expression, label fades in.
4. **Mood turn** for "the worst / weirdest one" — dip to darker, tilted framing, slow dolly-in,
   brows down, eyes dart.
5. **Payoff tease** — show the absurd thing (e.g. rabbits) in waves on the syllables, character
   reacts (shock, arm up, sweat), camera shake. End on motion, not a fade.

## 4. Camera
`cam({cx, cy, s, r, x, y})` around a focus point (usually the face). Building blocks:
- slow push: `s = 1 + 0.02…0.05 * (t - shotStart)` — every shot moves a little
- punch-in on cut: start 7–25% bigger and settle in 0.2–0.4 s
- dramatic dolly: +20% over 0.6 s with `easeInOut` for ominous lines
- crash zoom: +22% in 0.45 s with `easeOut` on impact words
- shake: `shakeXY(t, [[t0, amp, dur]])` — 10–20 px, 0.3–0.4 s, on impacts only
- slight Dutch tilt (−6°) for "bad news" shots
- pan: drift x by 30–60 px toward what the character is looking at

## 5. Acting
- Idle: `breathe(t)`, slow head sway, a blink every 2–4 s (`blinkAt`).
- Reactions: brow pop with overshoot (`backOut`), head snap/tilt 5–7°, eyes dart (±5 px) and back,
  lean-in toward camera for "you didn't know…" (scale the character ~10% around the face).
- Impact: head jolt `sin((t-t0)*32)*9*decay(t,t0,.14)`, shock face, sweat drop sliding down.
- Creatures/crowds: pop up from below with `backOut`, stagger 0.03 s, then hop with |sin|.

## 6. Transitions — always dissolves
Both shots are rendered on two layers and blended (`TRANS` entries `[cutTime, start, end, style]`).
Keep them short (0.1–0.2 s) for hooks and longer (0.3–0.5 s) for calm sections; vary the style:
| style | feel | use |
|---|---|---|
| `zoom` | outgoing zooms in + blurs, incoming settles from 1.25× | into a close-up / a reveal |
| `dim` | dip through dark | mood turns ("but the worst…") |
| `pull` | incoming settles from big while outgoing blurs | back out to a wide |
| `flash` | warm white flash + fast cross | impacts, punchlines |
| `whip` | horizontal blur slide (layers over-scaled so no edges show) | energetic jumps |
| `cross` | plain cross-dissolve | calm narration |
Never shrink a layer below 1× or slide it without over-scaling — the black page shows at the edges.
Time each cut so the incoming shot is already dominant when its key word starts.

## 7. Sound effects
Write `sfx_cues.json` from the beat sheet and run `sfx.py`. Typical set per hook: one whoosh per
transition (0.1–0.25 s, a bit before the cut), a soft pop for each pop-in or peek,
a sparkle for a name/title, a low swell for mood turns, a thump on impacts and creature waves.
They are mixed at 0.55 under the voice; the voice must stay clearly dominant (check with volumedetect).
If the user supplies real SFX or music, use those instead.

## 8. Captions
Default (`captions: 'word'`): each entry in `WORDS` is `[startTime, 'Text,', key?, end?]`. The word
appears at its start time (taken from the transcript timings), stays until the next word starts
(max ~1.2 s in pauses; pass `end` to cut it earlier), and settles from 90% to 100% in 0.07 s — no
bounce. `key: true` = yellow, `false` = white; if omitted, `autoKey()` guesses (digits and longer
content words → yellow), but set it yourself for the subject, numbers, hook and punchline words.
Captions sit in a fixed spot and do not move with the camera. Keep the word text identical to what
is said, including punctuation. Phrase captions (`captions: 'phrase'` + `PHRASES`) are an optional
alternative only.
