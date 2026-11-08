# Style Bible: "You Are a ___" dark-history shorts

Built from a frame-by-frame study of `the_serf.mp4`, `groom_of_the_stool.mp4` and `sin_eater.mp4`
(frames sampled every 0.1s, motion measured between frames, audio loudness and a rough local transcript).
Contact sheets and transition strips are in `_frames/<video>/` (`sheet_*.jpg`, `tr_*.jpg`).

---

## 1. Format and story formula

| Spec | Value |
|---|---|
| Canvas | 1080×1920 vertical, 30 fps |
| Length | 42.6s to 46.6s |
| Narration | **Second person, present tense** ("You're a serf…", "Each morning King Henry…", "You eat every crumb…"). Continuous, no pauses, about 2.7 words/s, so roughly 115–130 words per video |
| Audio | Voiceover over a music bed, loudness steady with no silences. Serf and Groom fade out over the last ~1.5s; Sin Eater stays loud to the end |
| On-screen text | None (clean frames) |
| Visual beats | About 30–33 per video, so a new beat every **1.3–1.6s** on average (range 0.7–5s) |
| Ending | **Seamless loop.** The last 0.5–1s rebuilds frame 0 exactly, and the last line hands off into the first |

**Story arc (all three follow it):**

| Time | Act | Serf | Groom of the Stool | Sin Eater |
|---|---|---|---|---|
| 0–3s | **Hook:** who "you" are | Father and son in the wheat field | Doors open, groom walks out covering his nose | Snowy village at night, then the sin eater in the street |
| 3–15s | **Rules of the world:** the job/life and its gross or cruel details | Lord on horseback, harvest till night, black bread, can't leave the village, winter starvation, lord takes the grain | Wiping the king, water and towels, carrying the pot, keeping secrets, holding keys and money | Death in the house, a knock at the door, bread and ale on the corpse, eating the sins |
| 15–30s | **Incident and escalation** | Poaching in the King's forest, men with torches, hands over hot coals, poachers' eyes burned | King's friend (portrait hug), joust, Anne accused, groom arrested | Sins enter him, paid with a thrown coin, doors and shutters close, mothers pull children away, priest shuts the church |
| 30–40s | **Time jump and the toll** | Seasons pass and the boy becomes a man, father dies in the mud, lord takes the ox (death tax) | Refuses the king's offer, executed at the Tower, the queen two days later | Ages, graves multiply, tally marks, dying alone |
| 40–46s | **Twist and loop** | He pulls the plough himself, his son appears, cut back to the father-and-son frame | King unmoved, a new groom, doors close back to frame 0 | Nobody comes, his arm drops, pull back to the opening village shot |

The theme is always **a cycle**: the role passes to the next person, and the loop ending makes that literal.

---

## 2. Rendering look (2.5D multiplane cut-out)

- **Characters are flat 2D vector puppets**, not 3D: a thin dark outline (about 2–3px at 1080w), soft airbrushed gradient shading (darker at edges, under the chin and on fabric folds), matte surfaces, no hard specular highlights.
- **The set is 2.5D:** flat painted layers placed at different depths, so camera moves give parallax. Far layers have strong depth-of-field blur.
- **Proportions:** big heads (kids' heads are about ⅓ of body height, adults' about ¼–⅕), short limbs, simple mitten hands with basic fingers, stubby feet (bare for peasants, shoes for nobles).
- **Faces:**
  - Almond or round eyes with a **thick black upper-lid line**, white sclera, a brown/grey/green iris, and one white catchlight.
  - Thin brow strokes and a small button nose.
  - Small mouth that's often an open **"o"** (worry or shock).
  - Hairline cut as a **zig-zag fringe**.
  - Freckles as orange dots, wrinkles as fine lines.
  - **Tears as white teardrop streaks.**
  - Beards are solid dark shapes with a few strand lines.
- **Overlays are always on:** particle layers (snow, rain streaks, embers and sparks, dust motes), soft vignette, bloom on light sources (candle, torch, moon, sun), god rays through doors and windows, and light grain.

## 3. Characters and acting

- **The protagonist anchors the frame:** centred or on the centre-third line, and usually facing camera. They get the most contrast and light.
- **Staging is a front-facing diorama.** Casts stand in rows facing the lens, like a stage. Background extras fill doorways and windows.
- **Idle life never stops:** breathing sway, blinks, small head tilts, eye darts. There are almost no walk cycles. Characters drift or advance toward the camera, or the camera moves to them.
- **One readable gesture per beat:**
  - pointing, a hand on the chest, covering the nose, a "shh" finger with a wink, a shrug
  - arms up, pouring, holding up the object the narration names (bread, keys, money chest, coin)
  - raising a stick, axe or sword, crossing arms against the cold, reaching a hand up
  - a hand dropping limp (death)
- **The emotion range is small and iconic:** worried "o" mouth with raised brows, a sideways glance, a slow blink, a wink, a wince with gritted teeth and tears, laughing with eyes shut, wide-eyed horror. Emotion comes from **eyes and brows plus one gesture**, never big body acting.
- **Reactions tell the consequences:** crowds cover their faces, onlookers point, ladies whisper behind a hand, mothers drag children away, men shut doors.
- **Ageing and time happen in-shot:** the boy morphs into a man across the seasons, the sin eater's hair goes dark to grey to white, and the king's robe colour cycles to show successive kings.
- **Colour signals class:** peasants wear beige, brown and olive. Authority figures wear one strong saturated colour (the lord in **royal blue**, the reeve and guards in **red**, the steward in **green**, the king in **purple** or **red and gold**), so they read instantly.

## 4. Backgrounds

- **Simple geometric period sets:**
  - triangular thatched roofs, box houses, a church spire or square tower
  - half-timbered houses with snowy roofs, a white Norman keep with grey cone turrets
  - a Tudor hall with striped wall panels, Tudor roses, a coat of arms, gold trim and a checkered floor
- **One-point perspective almost everywhere:** a road, field furrows, a street or a hall converges to a centre vanishing point, with a **landmark parked there** (church, manor, castle, throne, door).
- **Depth layers, front to back:**
  - **FG:** wheat stalks, posts, candle, fence, the over-the-shoulder silhouette of the hero
  - **MG:** characters
  - **BG:** buildings
  - **Far:** blurred blue hills, a sky gradient, a sun or moon disc
- Interiors are framed by beams, door frames, hanging herbs, a cauldron and a hearth. The cross on the wall marks a religious or death scene.

## 5. Colour script

| Video | Base palette (measured means) | Moments |
|---|---|---|
| **Serf** | Earthy sepia and ochre, about `#8E7255` | Golden wheat `#A2815A`; dusk orange to purple night in-shot; hut interior `#513824`; winter night navy `#384155` with blue-white snow; rain field desaturated grey `#4A4A4A`; plough field warm brown `#826950`. The lord's blue and the reeve's red pop against the beige peasants |
| **Groom** | Bright, saturated Tudor palace | Crimson banners, emerald and white stripes, gold trim, a red and blue coat of arms, red and cream checker floor, purple king's robe. Exteriors have cartoon blue sky and green fields. **The palette stays cheerful through grim facts (the irony is deliberate)**; the execution happens under a blue sky |
| **Sin Eater** | Low-key night: navy `#1E2A4A`, moonlight, pale blue snow | Candle-lit amber interiors with deep black falloff, faces lit from the side or below. **Sin is shown as dark purple smoke, tendrils and veins, plus a spreading red-black stain.** Daytime scenes are cold overcast grey-white |

## 6. Camera language

- **Nothing is ever static.** The default is a **slow push-in of about 5–15% scale per second**, often with gentle lateral drift. Measured examples:
  - Serf hot-coals hold: +49% over 3.4s
  - Serf village-square punishment: +62% over 4.1s
  - Serf plough: +52% over 5.2s with a sideways drift
  - Groom execution: +52% over 2.8s
  - Sin Eater tally-to-bed move: +47% over 3.3s
- **Holds of 3–5s are reserved for emotional peaks** (coals, punishment, seasons, plough, the overhead stain, tally marks). Information beats last 0.7–1.5s.
- **Punch-in cuts:** wide to medium to close on the same subject in quick hard cuts (Groom 5.4, 6.2, 10.5, 13.5, 18.9, 20.1).
- **Crash zoom:** a 0.2–0.3s rush into a face at a revelation (Serf 32.3; Sin Eater 13.2, 19.2, 30.1).
- **Fast pull-back reveal:** Serf 0.9–1.5 (from medium close-up to the whole field); the loop endings pull back too.
- **Lateral truck to reveal** who's next in a row (Groom 27.6 and 29.8: whispering ladies, then the groom).
- **Crane up to top-down:** the god's-eye isolation shot (Sin Eater 27.2–30.0). Also a **rotating overhead** that settles vertical (corpse at 7.7–8.2).
- **Dutch or upside-down extreme close-up** for dying or disorientation (Sin Eater 36.1).
- **Tilt to sky or ground** as a bridge (Groom 39.4 birds; Serf 35.7 puddle).

## 7. Transition vocabulary (each about 0.2–0.4s)

| Code | Transition | How it looks | Examples |
|---|---|---|---|
| **A** | Foreground wipe | A dark, out-of-focus post, trunk or beam slides across the frame as the camera trucks, with the new scene behind it | Serf 2.1, 8.0, 17.0 |
| **B** | Body wipe | A character or animal moves into the lens until it fills the frame | Serf 4.4 (lord's horse), 40.0 (ox); Sin Eater 6.4 (lantern man); Groom 25.8 (jousting horse) |
| **C** | Whip pan or tilt | 2–3 frames of directional smear blur | Groom 8.8, 11.8, 17.5, 36.2, 41.8, 42.4; Sin Eater 7.6, 9.2, 10.8, 17.4, 18.3, 20.0, 22.7, 24.1, 25.5, 31.3, 32.6, 38.5 |
| **D** | Radial zoom burst | A crash zoom with radial blur | Groom 31.4; Sin Eater 1.1, 2.6 |
| **E** | Light flash | A glow, flare or torch-fire bloom whites or oranges out the frame | Serf 6.5 (orange), 19.1 (torch flame), 45.4 (white star flare into the loop) |
| **F** | Element wipe | Story matter fills the screen: wheat, a blizzard, smoke with embers, a flock of crows, sin smoke | Serf 12.3, 10.5, 25.1, 31.1; Sin Eater 16.5 |
| **G** | Shape-match dissolve | Defocused bokeh lights become the moon | Serf 14.2–14.6 |
| **H** | Tilt into puddle and up | Rain ripples on dark water, then the new scene | Serf 35.7–36.2 |
| **I** | In-shot time-lapse | Light or season changes, an ageing morph, a costume swap, objects multiplying | Serf 5.3 (day to night), 31.2 (winter to summer, boy to man); Groom 16.2 (kings); Sin Eater 30.4 (ageing), 31.5 (graves) |
| **J** | Door or shutter as curtain | Opening means accepted or entering; closing means rejected or the end | Groom 0.5, 14.4, 44.9; Sin Eater 5.6, 21.3, 26.6 |
| **K** | Frame within a frame | The scene becomes a portrait painting | Groom 21.2 |
| **L** | Hard cut | For punch-ins and rhythm, about a third of all cuts | |
| **M** | Loop close | The final shot recomposes frame 0 | All three |

**Mix:** Serf leans on organic wipes (A, B, E, F, G, H) for a storybook feel. Groom and Sin Eater lean on whips and punch-ins (C, L) for pace. Pick by tone: mournful or epic uses organic wipes; comedic or brisk uses whips and punch-ins.

## 8. Story ↔ picture sync rules

1. **One narration clause = one visual beat.** The noun or verb being spoken is on screen at that moment: black bread, hot coals, keys, a money chest, a coin hitting the floor, bread on the corpse's chest, tally marks.
2. **Transitions land on sentence boundaries.** Whoosh or flare hits sit on the transition (loudness spikes line up with the cuts).
3. **Facts get fast cuts; feelings get long holds** with a slow push-in on the protagonist's face or hands.
4. **Time jumps are always visual and in-shot** (seasons, ageing, costume swaps, multiplying objects), never text.
5. **Symbols:**
   - crows and the moon mean death or an omen
   - a closing door or shutter means rejection
   - light spilling from a door means belonging
   - dark purple smoke means sin or a curse
   - the crowd covering their faces means horror
6. **Visual irony:** a cheerful palette over grim facts (Groom), or a cosy hearth over torture (the Serf coals).
7. **The final line resolves the cycle**, and the picture returns to frame 0.

## 9. Shot-by-shot reference

Narration below is a rough local transcription, so wording is approximate.

### The Serf (46.6s)
| Time | Visual beat | Camera / transition |
|---|---|---|
| 0.0–2.1 | Father (beard, sickle) and freckled son in a medium close-up, wheat field and village behind. *"You're a serf…"* | Fast pull-back to a full shot at 0.9–1.5; **A** trunk wipe |
| 2.3–4.4 | Father and son on the road; the lord in blue rides from the manor toward camera | Push-in; **B** horse fills the lens |
| 4.7–6.4 | Serfs harvesting with sickles, boy in front; *"fields from sunrise to…"* | **I** day to dusk to purple night; **E** orange flash |
| 6.6–7.9 | Hut interior: boy eats black bread, mother, sister, fire | Push-in; **A** beam wipe |
| 8.3–10.4 | Boy alone on the road to the village; the reeve in red blocks him with a staff (*can't leave without permission*) | Push and drift; **F** blizzard |
| 10.9–12.3 | Winter hut with snow falling inside; family thin (*starving*) | Push; **F** wheat wipe |
| 12.8–14.0 | Tithe barn: the lord's men take the sheaves (*the lord takes the harvest*) | Slow push; **G** bokeh to moon |
| 14.6–16.8 | Night forest: hooded boy with a snare and a rabbit (*the King's forest*) | Push; **A** trunk wipe |
| 17.1–19.0 | Men with torches at the door, then the reeve | Push; **E** torch-fire flash |
| 19.3–25.0 | Hearth of hot coals: boy holds his hands over them, tears, family and lord's men watching | **Long hold, +49% push**; **F** smoke and embers |
| 25.5–31.0 | Village square by the church: crowd and hooded boy; a man raises a hot iron (*poachers' eyes burned*) | +62% push, punch-in at 29.3; **F** crows |
| 31.2–32.2 | Same road through winter, spring and summer; boy becomes a man | **I** season and age morph; crash zoom |
| 32.5–35.6 | Rain field: father ploughs with the ox and collapses dead; son kneels | Slow push; **H** puddle |
| 36.2–39.8 | Village: the lady in blue and the steward in green point and take the ox (*death tax*) | Push and drift; **B** ox wipe |
| 40.2–45.3 | Man yokes himself to the plough; his son appears with a sickle | +52% push with an arc; **E** white flare |
| 45.5–46.6 | The frame-0 father-and-son shot again (now he's the father) | **M** loop |

### Groom of the Stool (45.6s)
| Time | Visual beat | Camera / transition |
|---|---|---|
| 0.0–3.5 | Symmetrical hall: doors under the coat of arms open, the groom walks out covering his nose, courtiers lined up. *"The most disgusting job in England…"* | Push-in; **dolly through the doorway** with motion blur |
| 4.3–7.9 | Throne: Henry VIII in purple, arms up, then gestures | Punch-ins at 5.4 and 6.2, punch-out at 7.9 |
| 8.8–11.7 | Groom pours from the ewer into a basin, holds towels, hand on chest with a sideways glance | **C** whip, then punch-ins |
| 11.9–13.4 | Doorway: the groom carries the pot on his head through the courtiers | Push; punch-in |
| 13.6–14.3 | Close-up: **wink and "shh"** (*every secret*) | Hold; hard cut |
| 14.4–15.3 | Doors close in front of the groom; he shrugs | Static then cut |
| 15.4–17.4 | Two-shot at the throne: **the king's robe cycles purple, blue, red, green** | **I**; **C** whip |
| 17.6–21.1 | The king leans to whisper; groom with keys, then a chest of gold (*his keys, his money*) | Punch-ins |
| 21.2–24.2 | **Portrait frame** on blue: the king slides in, hugs him, both laugh (*calls you his friend*) | **K**; hard cut |
| 24.3–25.7 | Joust: royal stand, knights charge | Pull-out; **B** horse |
| 25.8–31.3 | Royal box: the king storms off; Queen Anne gasps; ladies whisper; a guard grabs the groom | **Lateral trucks** right; **D** radial |
| 31.5–36.1 | Riding in the countryside: the king raises a finger (the offer), the groom refuses | Cuts between riders; **C** whip |
| 36.5–39.3 | Tower scaffold: the groom prays, the executioner raises the axe, crowd in front | +52% push; tilt to sky with birds |
| 39.5–40.4 | Crowd covers their eyes | Cut |
| 40.5–41.7 | Anne and her lady with the executioner's sword (*two days later*) | Push; sword glint; **C** tilt |
| 41.9–42.3 | Tower top swarming with crows | **C** tilt |
| 42.5–43.8 | King on the throne, unmoved, lifts a finger | Push; hard cut |
| 43.9–44.8 | **New red-haired groom**, nervous, in the doorway | Push |
| 44.9–45.6 | Pull back as the doors close to frame 0 | **J** + **M** loop |

### Sin Eater (42.6s)
| Time | Visual beat | Camera / transition |
|---|---|---|
| 0.0–1.0 | Night village, snowy cottage, full moon | Slow push; crash zoom at the window |
| 1.2–2.4 | Street: the sin eater (black hood, beard) beside a villager who recoils | Hold; **D** radial |
| 2.7–5.3 | Candle-lit bed: a nun prays over the dead; a woman's profile in the dark | Push; pan to black |
| 5.6–6.3 | Door opens: a man with a lantern (*a knock on your door*) | **J**; **B** walks into the lens |
| 6.5–7.5 | Street: the lantern man leads the sin eater | Push; **C** whip |
| 7.7–9.1 | **Rotating overhead:** corpse in its shroud, bread on the chest, cup over the heart | Rotate and settle; **C** |
| 9.3–10.7 | Side view of the bread and ale | Push; **C** |
| 10.9–13.1 | The sin eater at the bedside, cross on the wall, eating bread (*every crumb*) | Push; **crash zoom** |
| 13.3–14.3 | Extreme close-up of his face: eyes widen, **purple veins** creep down | Hold, then darken |
| 14.5–16.4 | Wide: purple smoke rises from the corpse into him | Push; **F** smoke |
| 16.6–17.3 | Two men whispering, one hand at his mouth | Hold; **C** |
| 17.5–18.2 | A hand slides coins across | **C** |
| 18.4–19.1 | **Silhouette gravedigger against a moon disc** (shadow-play insert) | Hold; crash zoom |
| 19.3–20.0 | His face, sorrowful | Hold; **C** tilt |
| 20.2–21.2 | A hand **drops a coin on the floor** instead of handing it over | Static |
| 21.3–22.6 | Door light shuts on him; a shutter slams | **J** ×2; **C** |
| 22.8–24.0 | Daytime grey street: a mother drags her child away | **C** |
| 24.2–25.4 | He walks alone down the street | **C** forward |
| 25.7–27.1 | Over-the-shoulder silhouette at the church: the priest raises a hand and the **door closes** | **J** |
| 27.2–30.0 | Symmetrical street, then **crane to top-down** while a red-black stain spreads around him | Long hold; crash zoom down |
| 30.2–31.2 | Black void close-up: **ageing morph**, dark to grey to white (*40 years*) | **I**; **C** |
| 31.4–32.6 | Graveyard: graves multiply around him (*hundreds of funerals*) | **I**; **C** |
| 32.7–36.0 | Wall of **tally marks** being scratched, then tilt down to the old man in bed | +47% continuous move |
| 36.1–37.2 | Upside-down, then sideways, extreme close-up of the dying face with a candle | Dutch; **C** |
| 37.3–38.5 | Wide: in bed he raises a hand toward the ceiling | **C** |
| 38.6–39.7 | Exterior cottage: no one comes | Static |
| 39.8–40.9 | His arm falls limp beside the candle | Hold, then dip to black |
| 41.1–42.6 | Window close-up, then pull back to the opening village shot | **M** loop |

---

## 10. How I'll turn your script into a video

1. **Timecode the script** at about 2.7 words/s and split it into 28–34 beats. Mark 3–5 emotional holds (3–5s) and set every other beat to 0.7–2s.
2. **Cast sheet:** the protagonist at each age, recurring family or court members, and one saturated-colour authority figure. Fix outfits, colours and face traits, kept identical in every shot.
3. **Shot list:** for each beat, give the time, shot size, staging (front-facing diorama, hero centred), the action or gesture plus expression, the set and its depth layers, palette and lighting, the camera move (direction and % push), the transition in and out, the overlay particles, and an SFX hit.
4. **Pick the transitions by tone** (section 7), put time jumps in-shot, and use the shape matches and element wipes the script's own nouns suggest.
5. **Design the loop:** the last line hands off to the first, and the final shot recomposes frame 0.
6. **Deliver the prompts:** a still-image prompt and an image-to-video motion prompt per beat in this exact style. I can also generate the voiceover with ElevenLabs, timed to the beats.

**Base style prompt (reuse every shot):**
> 2.5D multiplane cut-out animation, flat 2D vector characters with thin dark outlines and soft airbrushed gradient shading, big round heads, almond eyes with thick black upper lid line and single catchlight, zig-zag fringe hairline, simple geometric period set in one-point perspective, layered parallax depth with strong background blur, soft vignette, bloom on light sources, floating particles, muted storybook palette, vertical 9:16, clean frame with no text
