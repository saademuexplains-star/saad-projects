# The four shipped productions (use them as models)

All of them are in `project/_render/video/`. Open the shot files next to this sheet: every shot has a header comment with its time range, and every transition is a single `X.tr(...)` line.

---

## 1. The Messenger: `main.html` + `shots_a.js`, `shots_b.js` (2743 frames, 45.7 s, loops)

**Script:** "Your king hands you a scroll for the enemy warlord, and pays your mother in advance for your funeral… they write an even worse letter, drag you back to the castle AND" (the final "AND" loops into the opening).

| Time | Shot | Transition out |
|---|---|---|
| 0–2.03 | S1 throne room: the king hands over the scroll (also the loop landing) | carry pan |
| 2.03–4.06 | S2 cottage: the herald pays the mother | wipe (foreground pillar) |
| 4.06–6.70 | S3/S4 longhall: the warlord can't read | carry zoom |
| 6.70–10.30 | S5/S6 axe at the throat: "read it out loud" | carry zoom into the scroll |
| 10.30–12.83 | S7/S8 POV: break the seal, unroll, the first line | carry tilt |
| 12.83–14.20 | S9 the stomach drops | unroll (parchment) |
| 14.20–16.00 | S10 the king's study: no peace treaty | carry zoom |
| 16.00–20.95 | S11/S12 the letter: FAT, BALD, COWARD and the doodle | push |
| 20.95–23.94 | S13/S14 POV: hands shake, lower the page, the warlord waits | carry pan |
| 23.94–26.95 | S15 trophy wall | carry zoom with orange leak |
| 26.95–30.34 | S16 shadow-play: pinned, molten silver | dip |
| 30.34–36.33 | S17–S19 dead into his eyes, the forced smile, the poem | carry pan with roll |
| 36.33–38.01 | S20 the warlord blushes | carry zoom-out |
| 38.01–42.18 | S21–S23 bag of gold, spared, home at sunset "safe now" | push through the sun |
| 42.18–43.80 | S24 the king writes an even worse letter | carry tilt |
| 43.80–45.71 | S25 dragged back… AND | carry with `end: true` → S1 (loop) |

**Sound:** synthesised score (`_tools/score.ps1`, `sfx.ps1`). The user later required ElevenLabs instead, so don't reuse this.

---

## 2. The Whipping Boy: `main2.html` + `shots_c.js` (3002 frames, 50.0 s, loops)

**Script:** "You're 8 when the King brings you into the palace…" through to "…hands you a bag of gold to find a poor kid on the streets" (which loops back to the castle gate).

**Shots:**

| Shots | Content |
|---|---|
| S1 | Castle gate (also the loop landing) |
| S2 | Dressed in silk |
| S3 | The Prince's best friend |
| S5 | Chapel ("sacred blood") |
| S6 | Garden |
| S7 | Classroom (window breaks) |
| S8 | Guards drag you in |
| S9 | Prince eats grapes |
| S10 | Tutor draws the leather rod |
| S11 | Shadow-play swing |
| S12 | You scream |
| S13 | The scream echoes down the corridor |
| S14 | The sick rule |
| S15 | Isn't allowed to stop |
| S16 | Until the Prince cries |
| S17 | Some days he laughs |
| S18 | You bleed on the marble |
| S19 | You turn 18 |
| S20 | The Prince's spoiled son |
| S21 | Bag of gold |
| S22 | A poor kid on the streets → loop |

**Transitions:** mostly `carry` (pan, tilt, zoom; with leaks and roll), two foreground `wipe`s, one `dip`, and the loop close is `carry` zoom with `end: true`.

**Sound:** `_tools/score_whip.ps1`, delivered as separate VO and SFX without music, at the user's request.

---

## 3. The Royal Taster: `main3.html` + `shots_d.js`, `shots_d2.js`, `shots_d3.js` (2876 frames, 47.9 s, loops)

**Script:** "he gives you a golden spoon, feeds you the most expensive meat in the castle…" through to "…makes you his personal taster" (which loops into the opening hand-over).

| Time | Shot | Transition out |
|---|---|---|
| 0–5.75 | DIN private dining room: the King hands you the golden spoon (choreographed rigid spoon), the serving woman brings the boar (also the loop landing) | — |
| 4.95–8.25 | ROU Russian roulette with the dishes | organic noise dissolve with warm leak |
| 7.45–13.40 | HALL crane from the ceiling along the feast, the bite, the tongue goes numb | bokeh (tilt into candle bokeh) |
| 12.50–17.75 | BRO across the table: the King's brother, hand on his dagger | glint (dagger glint → kitchen) |
| 17.20–18.95 | KIT flashback: he poisons the plate | zmatch (plate → plate) |
| 18.35–26.90 | TAS throat burns, sweat, don't drop the spoon | wipe (a servant crosses the lens) |
| 26.20–29.55 | EYE what happens to tasters who ruin a coup | iris (into the pupil) |
| 28.65–33.10 | VIL traitors bar the door and burn the house | zmatch (fire → candle with leak) |
| 32.40–41.50 | KING "delicious", the laugh, the bite, he chokes | liquid (spilled wine) |
| 40.70–47.93 | CHAOS guards panic, the antidote, the crown, "his personal taster" | organic plain with `end: true` → DIN (loop) |

**Sound:** `_tools/mix_taster.ps1`, using ElevenLabs music cues:
- **Music:** medieval underscore, suspense build, feast minstrels, orchestral climax.
- **Ambience:** banquet hall, night village, dining room.
- **SFX:** about 43 one-shots (spoon clinks, chewing, the king's laugh, a dagger drawn, glass cracking, hammering the door, screams, torch and roof fire, choking, body collapse, crown fall, brass fanfare…).
- Loop seam crossfaded.

---

## 4. The Worm: `main4.html` + `shots_e.js`, `shots_e2.js`, sets `sets6.js` + `sets7.js` (2941 frames, 49.0 s, **no loop**)

**Script:** "You drink a cup of cool water in an ancient market… that worm coiled around a stick became the exact symbol painted on every ambulance today."

| Time | Shot | Transition out |
|---|---|---|
| 0–3.15 | W1 market: the seller pours from a goatskin into your cup and you drink; crane down through the awnings; time-of-day market life | lens (into the water drop) |
| 2.45–5.85 | W2 micro world: copepods, the hero carries a larva; you swallow, a dark red throat closes | iris |
| 5.25–8.20 | W3a time-lapse year: crane down from the racing day/night sky; eating flatbread at the door; whip-pan to the ripening field (the time jump happens off-screen mid-pan); a hand on his belly; motion-blurred passers-by | zmatch (belly → worm) |
| 7.70–13.40 | W3b inside the body: intestine tubes, the worm grows, then the camera follows its head down past the hip bone and between the leg muscles to the ankle skin, which bulges and glows | eyelid |
| 12.80–19.40 | W4 morning: lying under a blanket, wakes in pain; the camera travels to the ankle; a ghostly red-hot iron; the blister rises | heat shimmer |
| 18.80–21.30 | W5a river: limping in, stepping into the water, steam | surface (dip under) |
| 20.80–26.65 | W5b underwater split-level close-up: the blister bursts, the worm's head, his hand plunges in and pinches it, the healer's palm slaps it away | surface (come up) |
| 26.15–27.65 | W5c two-shot: the healer lectures, pointing | liquid (blood red) |
| 26.95–31.65 | W6 inside the leg: the taut worm hums and snaps, milky burst, black venom climbs the vessels and fills the frame | organic plain |
| 31.15–32.60 | W6S sunrise silhouette: his body on a cot by a hut | sweep (warm light band) |
| 32.00–45.60 | W7 healer's hut: he sits with the leg out on a block; the healer ties the worm to a twig; turn plus a whip to his grimace; pull out; time-lapse of 30 days with tilt to the chalk tally, his beard grows, the coil thickens; the healer lifts the twig into the light | morph (twig → star of life) |
| 44.90–49.02 | W8 the Star of Life on a modern ambulance in a rainy city: pull back, lights, final flash on "today" | — |

**Sound:** `_tools/mix_worm.ps1`, all from ElevenLabs, 53 clips:
- **Music:** oud underscore, eerie micro, horror tension build (two overlapping passes), emotional resolution (runs to the last frame).
- **Ambience:** bazaar, fields, room, river, underwater, inside the body, hut, rainy city with siren.
- **SFX:** pour, gulps, lens whoosh, sting, swallow, time-lapse whoosh, bread bite, rooster, pan whoosh, flesh dive, squirm, descending whoosh, heartbeat, groan, iron sizzle, blister, heat, splash, quench, dunk, underwater pop, worm out, plunge, grunt, slap, surfacing, shout, blood gush, stretch creak, snap, venom, sunrise swell, sweep, thread, creak, whip, hiss, time-lapse ticking, morph shimmer, two final impacts.

## The King's Decoy (57.6 s, loops; cast11, props11/11b, sets14/14b, shots_m/m2, main11)

You, a peasant with the king's face, ride his coach to catch his arrows; on a mountain pass you send him onto a bridge his brother has mined.
- Scenes: CROWN (seated crowning, king's hand lowers an identical crown) -> GATE (coach out through cheering crowds, rooftop archer, two arrows) -> INSIDE (holed velvet, light beams, arrow punches through by your head) -> PASS1 (crane to the coach, the disguised king beside your window, long pull-out to the bridge, push on the powder kegs, tilt up to the ridge) -> RIDGE (brother with torch, push to his eyes, down the fuse) -> BRAKE (hand by the brake, dry swallow, eyes to the coachman's hatch) -> GIBBET (the last decoy, tin crown, crows) -> VILLAGE (wife and daughter, torches on the hill, roofs burning) -> PASS2 (lean out, point at the wheel, the order, spurs, gallop onto the bridge, fuse, blast, burning fall) -> loop.
- Transitions: carry tilt, push (arrow -> arrowhead), carry zoom (through the window), push (tiny figure -> face), rack, organic, radial (face -> face), wipe (pine trunk), zmatch (fireball -> crown).
- New reusable: side-view horse with walk/trot/gallop leg IK (P.horse, P.horseRun), royal coach with passenger window and lean-out (P.coach), mounted rider (P.rider), boulder-mass rock (S.rockMass), fireball, flames.
- QA: the loop zmatch glitched on both normal passes (12 frames); a slow page (700 ms wait) rendered it identically twice.

## The Calf's Blood (46.9 s, loops; cast12, props12, sets15, shots_n/n2, main12)

1667 Paris, the first animal-to-human transfusion. Beats: you, mad in the night street, watched from a lit window → the king's doctor points at his drawing of a calf joined to a man → the transfusion as one 13 s shot (the calf's gentle eye, the pan along the tube to you, the cannula, the blood running the whole tube in a wide, the burning arm, the arching back, the heartbeat zooms, the doctor's cold face) → the night vigil (the black urine in the pot, the priest, the dawn time-lapse, you sitting up calm) → the miracle crowd → the relapse (the bowl swept off the table, dragged out) → the doctor hesitating at his door, the wife begging on her knees → the second dose at night (the fit, death, the candle guttering out) → the court (dragged in, the judge points, the paper of white powder held up) → the wife pouring it into your soup and looking at us → zmatch back into frame 0.
Transitions: carry tilt, morph (drawn calf eye → real eye), liquid, radial from the dawn window, organic, a linen-sheet wipe, rack, carry zoom through candle smoke, push (powder paper → powder paper), zmatch loop.

## The Royal Astrologer (44.6 s, loops; cast13, props13, sets16/16b, shots_o/o2, main13)

You read the stars for a king who kills astrologers who are wrong; you foretell his favourite's death, she dies, and you save your neck by telling him you will die three days before him.
- Scenes: OBS (the purse handed over in your tower, the king points up, tilt to a crown of stars in the oculus, down to the armillary you spin, his one finger and the throat slash) -> GATE (your face morphs into the last astrologer's head silhouetted on the moon over the gate, crows, crane up to your lit window) -> DESK (carry zoom through the window: writing at a tall desk under star trails, the doom planet and the cross, your face drops) -> HALL (radial from the candelabrum: the feast, her laugh, "will die", the goblet tips, the king's glare, a vertigo zoom on "trapped") -> SHADOW (organic: shadow play on your wall: she dances, the king tears your chart on "fraud", the mob with torches and flames on "murderer") -> BED (eyelid: days and nights race past, her hand in the king's, her eyes close, the knell, the camera drifts to the bedside candle) -> CORR (zmatch: the candle flame becomes the guard's torch, then you between two guards at midnight) -> KCH (linen-curtain wipe: the king in mourning holding her veil under her portrait, the guards with halberds at the open window, his signal, his smile and the question, the music cut dead, your bow, the answer, he turns pale and the veil slips, he waves the guards back, the shutters slam) -> END (rack into daylight years later: old, under furs by the fire, the doctor's flask, the maid's soup, a sniffle and the old king's panic, a purse pressed into your hands) -> push (purse -> purse) into frame 0.
- Transitions: morph, carry zoom, radial, organic, eyelid, zmatch, wipe (linen), rack, push loop.
- Sound: six new ElevenLabs one-shots (bell, crows, lady's laugh, man's sob, tearing parchment, sniffle and sneeze) and a wind bed; the music and everything else reused from the library (Royal Taster and Worm cues). About 122 credits in all.
- New reusable: armillary sphere, astrolabe, celestial globe, quadrant, hourglass, horoscope with doom planet and cross (props13); tower observatory with an oculus constellation and star trails, the castle gate at night with a head on a pike, a canopy-bed bedroom, a perspective corridor, the king's chamber with its window, valley and shutters (sets16/16b); hennins drawn as head art; `RIG.lidProbe` with `probe13.html` and `rerender_astro.ps1` to re-render only the frames a change touches.

## The Heroin Bottle (44.3 s, loops; cast14, props14, sets17/17b, shots_p/p2, main14)

About 1900: you give your coughing child the most trusted cough medicine money can buy; one spoonful becomes two, you take it too, the bottle runs out, and the one word on its label is Heroin.
- Scenes: KIT1 (push in on the bottle on the kitchen shelf, label turned away; you lift it to your chest) -> GLOBE (lens: red spreads over the continents of a study globe on "every country on earth will one day ban") -> PHARM (zmatch: the daylight pharmacy, the pharmacist shows the bottle, taps the carton on "safer than morphine" and slides the morphine bottle aside, a parent pays in coins, another waits by the door) -> HOMEa (morph: the cherub on the advert becomes your daughter coughing in bed at night, the calendar for "a week") -> POUR (carry zoom: a close insert of the syrup pouring into the spoon over the quilt) -> HOMEb (organic: the spoon to her lips, the cough stops, she sleeps under the angel print; the next night one spoon, then two; the camera crosses the partition wall into the kitchen, where you drink from the bottle morning and night) -> DROP (eyelid: the empty bottle shaken over the spoon, the last drop, the tremor, the bottle slips) -> HOMEc (carry tilt: you hunched in pain at the table; the camera crosses back through the wall to her screaming in bed) -> QUEUE (radial from the moon to the pharmacy lamp: six parents in line at night with shaking hands and empty bottles, the grim pharmacist, no cartons left on the counter) -> DOCS (newspaper wipe: one doctor opens a paper with a bottle and skull on the front, one lowers his report, and the senior doctor bows his head over folded hands behind the bottle) -> REVEAL (rack from that bottle: back on the kitchen shelf the bottle turns, a soft light finds the label and the camera pushes in on "was Heroin") -> push (label -> the shelf at frame 0).
- Transitions: lens, zmatch, morph, carry zoom, organic, eyelid, carry tilt, radial, wipe (newspaper), rack, push loop.
- Sound: everything new from the user's full ElevenLabs account: 10 music cues (4 from the music model `eleven_music_v2_5`: parlour rag, ticking build, horror cue, dirge), 7 ambience beds and about 50 one-shots.
- New reusable: a two-room home (kitchen with range, shelf, table, lamp and clock; bedroom with bed, quilt, angel print, calendar, nightstand and candle) joined by a partition the camera crosses (sets17); a pharmacy with a perspective tile floor, show globes, counter, scales, mortar and an advert, a globe study and a doctors' room (sets17b); `handFrame`, `bottleInFrame`, `spoonInFrame`, `seatedLap` and `closeHand` (shots_p2); `speechband.ps1` for speech-band masking.

## Also made with this pipeline (full code bundled; scripts and word timings in project/examples/_voN)

### The Leech Collector (10 s approved sample): `main5.html` (582 frames, 9.7 s)
Files: cast5.js, props5.js, sets8.js, shots_f.js.
Script: "You wade into a freezing swamp... and wait. Within minutes, leeches latch onto your bare legs. You peel them off, sell them to the doctor... and tomorrow,"

### The Titanic Stoker: `main6.html` (3557 frames, 59.3 s)
Files: cast6.js, props6.js, sets9.js, shots_g.js, shots_g2.js.
Script: "You're at the very bottom of the Titanic, shoveling coal in your underwear while rich people dance sixty feet above your head. At midnight, an iceberg rips the steel wall open, and freezing black water blasts into the room. Before you can run, a red warning bell ringsâ€”and the captain on the top deck flips a switch that drops heavy iron doors from the ceiling to trap the water down here with you. You sprint through chest-deep water and dive under the gap, but the heavy iron door comes down and pins your boot to the floor. You don't wait for help, because the ten men trapped behind you are clawing at your shirt to pull you back in. So you rip your bare foot out of your leather boot right as the door slams shut. Seconds later, the freezing ocean hits the red-hot coal furnaces behind that wall, and the boilers explode like a bomb, bending the steel door right behind your back. You limp up ten flights of iron stairs with one bleeding foot, thinking you're finally safe. You burst onto the freezing top deck and run toward a half-empty lifeboatâ€”until an officer fires a warning shot into the air, points his gun at your chest, locks the iron gate so poor men can't take the rich people's lifeboats"

### The Blind Harpist: `main7.html` (2164 frames, 36.1 s)
Files: cast7.js, props7.js, sets10.js, shots_h.js, shots_h2.js.
Script: "Your Emperor blinds you with hot iron, gives you a golden harp, and makes you play inside his secret war room because a blind man can't read his battle maps. Every song is a game of survival, until one night your bandages slip and you realize your eyes have healed just enough to see blurred shapes. You look up mid-song and see the Emperor's own brother pouring poison into the royal wine, and when you accidentally flinch, he freezes with his hand on his dagger, realizing you can see and waiting to see if you warn the Emperor. You force a blank stare and keep playing without missing a single note, the Emperor chokes to death, and the brother makes you his personal war-room musician."

### The Confessor: `main8.html` (2832 frames, 47.2 s)
Files: cast8.js, props8.js, sets11.js, shots_i.js, shots_i2.js.
Script: "Your King kneels before you in a dark wooden booth every night to confess his sins, knowing the law says if you ever repeat a single word he tells you, your tongue will be cut out and you will be burned alive. You carry the darkest crimes of the empire inside your head in silence, until one evening the King coldly confesses that at dawn tomorrow, he is ordering his army to burn an entire rebellious village to the ground, including the street where your own mother lives. Ten minutes after the King leaves, his young kitchen boy kneels on the other side of the screen trembling and confesses that he bought rat poison to kill the King, but lost his nerve and slides the glass vial through the grate for you to destroy. You tell the boy his sins are forgiven, pour the entire vial into the sacred communion wine the King takes before sleep, and watch the tyrant choke to death at your feet, trading your own soul to save a thousand innocent lives."

### The First Vaccine (cowpox): `main9.html` (3265 frames, 54.4 s)
Files: cast9.js, props9.js, sets12.js, shots_j.js, shots_j2.js.
Script: "A village doctor ties you to a wooden chair, cuts your healthy arm wide open with a sharp knife, and rubs thick yellow pus from a sick farm girl's blister straight into your bleeding wound. Outside your window, every third person on your street is dying from a deadly plague that covers their skin in painful sores, yet you still try to pull your arm back as the doctor forces a nasty sickness from a farm cow straight into your blood. For three long days you shake in bed as your body burns with a high fever, and the very moment you finally get better, the doctor ties you back down and does something crazy, he scrapes the real, deadly plague straight off a dying man's skin and rubs it deep into your cut just to see if you drop dead. The cow sickness in your blood destroys the plague before a single sore can form, the doctor slices your arm and poisons you with the plague twenty more times just to be sure you can't die, and that insane test creates the world's very first vaccine."

### The Rabies Boy: `main10.html` (2569 frames, 42.8 s)
Files: cast10.js, props10.js, sets13.js, shots_k.js, shots_k2.js.
Script: "Every day for ten days a needle filled with rabies is pushed into your stomach, each dose made from the spinal cord of a rabbit that died of the disease, stronger than the day before, and the man ordering it isn't even a doctor. You're nine years old, and two days before the first shot a mad dog ripped into you fourteen times, and in your world every person bitten by a rabid dog dies the same way, burning with fever, foaming at the mouth, screaming at the sight of water. No human has ever been given these shots before, and on the tenth day he gives you the deadliest one of all, rabies so powerful it would kill an animal within a week, and then all you can do is wait. The days turn into weeks, the fever never comes, and you grow up spending your life guarding the gate of the first man ever to save a human from rabies."


## The Cells That Never Died (`main15.html`, 2947 frames, loops)

Henrietta Lacks, second person. Files: `cast15.js`, `props15.js` + `props15b.js`, `sets18.js` / `18b` / `18c`, `shots_q.js` + `shots_q2.js`, `_tools/render_cells.ps1`, `mix_cells.ps1`, `cells_arrangement.ps1`.
HOME (hands on hips, laughing; pull back to five children) -> carry -> CLINIC (doctor rings the X-ray shadow) -> zmatch -> INSIDE (warm organic womb wall, tumour grows) -> morph (tumour to dome) -> HOPKINS (crane down to the COLORED side door) -> radial -> ORa (asleep on the table, side view; masked surgeon glances round) -> push -> ORb (close-up forceps lift a piece into the dish) -> light coat wipe -> HALL (hand carries the dish to TISSUE CULTURE) -> eyelid -> WARD1 (she wakes; doctors talk, one glance) -> liquid -> SPREAD -> organic -> MONTHS (seasons, calendar FEB to OCT, clock; eyes close at "you die") -> rack -> KIDS (children at the rainy window, from outside) -> carry zoom -> LAB (1951, roller drum; assistant's eyes widen) -> lens -> RACK (labelled cultures die one by one) -> zmatch -> MICRO (cells shrivel; "yours don't": one glows, doubles to 200) -> carry out -> SHIP (desk globe, pink arcs from Baltimore) -> sweep -> POLIO (school hall, the shot, brave smile) -> carry pan -> VIALS (endless lines) -> organic -> GRAVE (seasons for seventy years, headstone) -> carry tilt -> ALIVE (scientist today holds the flask to the light) -> morph -> WORLD (Earth at night, pink lights everywhere) -> push -> HELA (label "HeLa", tilt up to her sepia photo on the incubator, push in) -> organic colour-back loop to HOME.
Music: one constant score (`eleven_music_v2`), offset 0.7 s for the loop seam; per-scene room tones; hits in the breaths.

## The Pied Piper (`main16.html`, 2979 frames, loops)

The legend of Hamelin, second person (a mother whose son follows the stranger). Files: `cast16.js`, `props16.js`, `sets19.js` + `sets19b.js` (the rebuilt hilltop, valley, tor and bed), `shots_r.js` + `shots_r2.js`, `_tools/render_piper.ps1`, `mix_piper.ps1`, `piper_arrangement.ps1`, `fetch_piper.ps1`.
GATE (one-layer perspective street at dawn; the Piper walks out of the sunlit arch playing, the camera pushes to his face as the street behind goes soft) -> sweep -> KIDS (square in depth: hoop, ball, doll, hens; all freeze, turn their heads to the tune, drift after it) -> washing-line wipe -> MOTHER (kneading by the hearth, herbs and pans; she looks up) -> carry pan -> WINDOW (the dancing line passes under her window, her son smiling in his red cap; push to her scream) -> radial -> OUTGATE (hay meadow, fence, wayside cross; the line climbs the road, she runs out of the gate) -> push -> HILL (130 small dancers winding up the hill, the Piper at the head) -> organic -> TOP (she arrives panting, hand on her chest; the music stops; eyes left, right, up; hands clasped; the camera pans off her to the empty path and the tor, then pulls back to her alone) -> zmatch -> THREE (the lame boy on his crutch, the deaf girl looking about, the blind boy reaching, the valley and the town below) -> morph -> BED (centuries later a father reads the picture book) -> liquid (the painted page melts into the real hill) -> REAL (dusk, she holds his red cap) -> carry tilt -> REVEAL (the Piper on the tor against the sunset; push to his smirk on his name) -> zmatch into his eyes -> GATE (frame 0).
Sound: the Piper's own tune (`eleven_music_v2`, 16 s solo pipe) on top of one constant score (52 s); both cut to silence just before "the music has stopped", a drone creeps in under the empty hill, a music box at bedtime, the score returns at dusk and peaks on his name, the tune swells back across the loop seam.

## The Pied Piper, third cut (`main18.html`, 2979 frames, loops; cast16 + rig3 fixes, street3d/terrain3d/hamelin3d, shots_u..u5)

The first cut was rejected; this one keeps the same cast in sets built in perspective with a real camera.
- GATE (0-6.3): frame 0 flies forward over the dawn roofs toward the west gate (sun low behind it, right of centre);
  the camera swoops down into the street as the stranger walks out of the arch's light toward us playing (backlit
  silhouette blending into colour as he leaves the glow), into a medium shot on "pipe"; pigeons burst off the roofs.
- carry tilt -> SQUARE (5.6-10.3): from high over the well the camera tilts down to the children at play (ball toss
  with real bounces, a hoop, skipping, hens); "stops": everything freezes; they turn their eyes to the lens (the music
  is behind the camera) and walk toward us; the baker and an old woman look round and stay.
- wipe (the Piper's coat past the lens) -> WINDOW (9.5-18.3): you at your open window watering geraniums (you lower the
  jug inside when you hear it); a crane back over the street, down to street level: the stranger leads the children
  toward us; your son passes under your window smiling; the crane swings up off the street and lands on your face,
  close, ON "scream" (17.08): jaw wide (`mouth: 'scream'`), tears, one fist on the sill, the other hand reaching to him.
- push into the dark window -> RUN: your door flies open and you come out of the dark doorway running, skirt gathered
  in one fist (shoes and stockings under the hem), the other arm pumping; the camera backs away and turns with you.
- carry pan -> OUTGATE: outside the east gate the last children skip out and past us; the camera rises and turns 150
  degrees to follow them up the path into the sun (lit figures become backlit silhouettes).
- radial from the sun -> HILL: aerial up the hill over 130 dancing silhouettes winding to the summit.
- sweep -> TOP: you climb onto the summit, the town far below; "the music has stopped": the tune sucked away; the
  camera cranes up until you are a speck ("Nothing.").
- rack -> THREE: the meadow under the walls: the lame boy on his crutch reaching after them in tears, the deaf girl
  looking about her with a hand at her ear, the blind boy with his stick lifting his face.
- morph (the blind boy's face into a picture) -> BED: a picture book by lamplight, father and child.
- zmatch (into the drawn children) -> REAL: your son in the morning sun, smiling, then staring at us.
- morph (his eye into the stranger's) -> REVEAL: the stranger lowers his pipe and smiles, steps back into the light
  of the gate as a silhouette; the camera rises over the roofs; zmatch into the low sun -> frame 0.
- Sound: one suspense score (pm1_score) under everything, peaking on "everywhere"; his tune (pm2_pipe) split by place
  (muffled through the window, loud as he passes, airy on the hill), sucked away at 27.1; drone, music box, the score's
  return; the tune swells across the loop seam (`piper3_arrangement.ps1`).

## The Pied Piper v3 (same `main18.html`; hook in `shots_uh.js`, silhouette rig `sil.js` + `cast17.js`, sets `sets20.js`)

v2 was rejected for glitches (FEEDBACK_LOG "Pied Piper v2") and a hook that opened too wide. Changes:
- HOOK (-1.0 .. 6.35, replaces GATE): shadow theatre. Frame 0 is close and low on the Piper's silhouette in profile,
  pipe on his shoulder, the low sun hidden behind his head (a cream rim round him), a dark arch framing the right edge;
  the camera pulls back and rises to him walking the rooftops over the town's silhouette (lit windows, a wheel of
  colour, a spire), the sun disc on its own layer, then pushes in again; carry tilt into the square.
- Transitions now: carry tilt, coat wipe, push (dark to dark), carry pan, stone-wall wipe (22.65), sweep, rack,
  page-turn wipe (38.75), zmatch (plain crossfade), morph (aligned eyes), rack from the gate's light onto the
  silhouette at the loop. Every one checked every 3rd frame for double images.
- QA tools: `pops.ps1` + `popview.ps1` (temporal pop / blink scan), `cropstrip.ps1` (one region across consecutive
  frames), `qa_piper3.ps1` (transition and loop sheets).

## The Pied Piper v4 (same pages; `piper4_arrangement.ps1`, score `_sfx16/wav/pm4_score.wav`)

Fixes from the v3 notes (FEEDBACK_LOG "Pied Piper v3"): the silhouette walk continuous at toe-off and heel strike, the
coat's glass carried by the cloth, the crutch built ground-to-armpit through the fist (`SH.crutch`, also in the
procession), the gate's stones and the birds no longer re-shuffled by visibility, the path ruts sorted with the slabs
they lie on, the bedtime pair sitting up behind the quilt with the whole book lit (`x.ext`).
- BED (38.3 .. 42.5): father and child sitting up in bed, the quilt to their waists with the sheet turned down, the
  open book held between them.
- zmatch into the drawn children -> KIDS (41.7 .. 43.85, "But the children were real."): the children stand together in
  the morning square looking straight at us, solemn; a low camera pushes in on your son in the middle of the front row.
- push (aligned on him, 43.55) -> REAL ("Your son was real."): your son alone in his street; he looks up at us.
- Music: one continuous `eleven_music_v2_5` score (52 s, instrumental) replaces the cues and the separate pipe tune; its
  quiet opening lifted ~14 dB for the hook, eased under the bedtime line.
- v5: BED restaged after "his hand is coming inside the book and the book is vibrating": a 40 cm book on his lap, centred
  in front of him (he moved toward the middle of the bed), fists on its outer edges, elbows out; prop scales no longer
  rounded (`fs` in props16.js); `_tools/trackred.ps1` measures a prop's jitter frame by frame.

## The Royal Fool (`main19.html`, 3371 frames, 56.2 s, loops; cast19, props17, sets22/22b/23/23b/23c, shots_v/v2/v3, `_vo17`)

France, 1340: the King's fool is the only man allowed to tell him the truth, so the lords push him forward to report
the fleet's destruction at Sluys. The scripted beats are in the header comments of shots_v/v2/v3.
- CAP (-0.7 .. 5.75): frame 0 is an extreme close-up of your eyes. The King's hands lower the belled cap onto your hood
  (palms down on the dome, `wristFree` arms) and lift away. The court applauds; crane up to the King's raised finger.
- FEAST: you whisper at his ear at the night high table.
- JUGGLE: a three-dagger cascade; the laugh dies; the fumbled blade sticks in the floor.
- WAR: the pointer drives the red ships across the map; the messenger bursts in and slaps the letter, which skids
  into the painted harbour.
- BATTLE: zmatch into the real harbour.
- DEAD: wrecks at dusk.
- LORDS: the letter pushed from hand to hand; out through the window to the gibbet in the rain.
- PUSH, DANCE, KING ("why?"), SANK (the hand ship and leaping fingers), JUMP (the truth: men leaping from a burning
  cog), BRAVE (hand on heart).
- DIES: long lens on the King's cold face.
- WAIT: you, frozen.
- RAGE: he turns on the cowering lords; your hand goes to your neck.
- TIME: sun pools sweep the hall.
- AGAIN: another messenger; you are pushed into the lens, frame 0's eyes.
- Transitions, in order: morph (face), carry tilt, eyelid, zmatch, carry pan, page wipe, push, rack, carry pan, morph,
  liquid, surface, push, pier wipe, carry pan, eyelid, pier wipe, and the end carry zoom into frame 0.
- QA that found what the eye missed:
  - `scan.ps1` spikes: a shot running past its transition, glows at the lens, the time-lapse thresholds.
  - `flick.ps1` plus the solver logs: elbow flips, the cap path through the shoulder, the faceMix switches.
  - Then, after two clean passes, the per-arm `__HANDLOG` scan: wrist-limit flips, `mixArm` averaging, the push
    switching arms. See FEEDBACK_LOG.
  - Re-renders were limited to the frames whose SVG hash changed (`jseval.ps1` + `nh.js`).
  - After delivery the user caught a background glitch on "the only man in France" (FEAST): a side-wall tapestry,
    out of view, drawn far off by the hall's flat-art `plane()`. `planechk.js` then checked every `plane()` call of
    the film (more tapestry strips, banners, lilies, table props, map tiles). The fix is the art's extent and its true
    outline (see FEEDBACK_LOG); 1413 frames were re-rendered in both passes.
- *The Royal Fool, second re-delivery (2026-11-08):* true-size hands (`handV2`) and one-piece sleeves (`sleeveV2`) in
  rig3; face-locked transitions `facematch` (the loop) and `facepush` (CAP->FEAST) in engine.js; the King's hands on
  the feast table (`feastHands`); the crowning arms drawn foreshortened while they reach for the cap.

## The Coca-Cola look test (`look20.html`, `rig20.html`, 2026-11-08): the clean rig

These are three stills, not a video, made to check the look before building the next video. The user asked for "few frame of different" scenes:
- BATTLE: Columbus, Georgia, 1865 at night. Pemberton sits against a broken gun wheel with a sabre cut across his chest; the field surgeon holds out a bottle labelled MORPHINE; the town burns across the river under orange-lit smoke.
- ROOM: Atlanta, 1885. The older Pemberton grinds coca leaves in a mortar by oil-lamp light, with shelves of apothecary bottles behind, a calendar for 1885, kola nuts, his own morphine bottle and spoon, and his notebook.
- FOUNT: Jacobs' Pharmacy, 1886. The clerk sets down a glass of the dark drink, a "V" nickel lies on the marble, a "Brain Tonic 5c" card hangs on the mirror, and Pemberton watches from the back.

Files: `cast20.js` (dressed with `tailor.js`), `sets24.js`, `shots_w.js` (with `stage.js`), on `G.RIG_CRISP`. Three
rounds of feedback shaped it (FEEDBACK_LOG 2026-11-08):
1. Faded clothes: crisp mode, the armhole seam, chest light.
2. Jointed hands were tried and rejected.
3. Cleaner render, tailored clothes, no kilt pleats or belt bands (`tailored: true`).

The full video continues these files in `main20.html`.
## Coca-Cola ("A sword slices open your chest...") - 8 November 2026
- Files: `main20.html`, `cast21.js`, `sets25.js`, `sets25b.js`, `map18.js`, `shots_x.js`, `shots_x2.js`, `shots_x3.js`;
  VO `_vo18` (47.320 s, 2840 frames), beats `_vo18/beats.md`, sound `_sfx18` (mixed by `_tools/mix_coca.py`).
- 14 shots: SLASH (the sabre's streak and the cut opening, frame 0 already pushing in) -> carry tilt -> BATTLE (the
  surgeon holds out MORPHINE; push to the label) -> rack on the same label -> BATTLE2 (the bottle now in your fist;
  relief, then the glassy stare) -> morph bottle to bottle -> ROOM1 (1885, the same bottle in the old hand) -> zmatch
  window lamp to street lamp -> STREET (J. S. PEMBERTON & CO., rain) -> push through the window -> ROOM2 (diploma, the
  hidden bottle, the desperate notebook, the pestle, the COCA sack) -> organic -> MACRO (leaves spilling, COCAINE, the
  kola nut splitting) -> liquid (wine red) -> WINE (the cask, the jar, the French Wine Coca handbill line by line, his
  guilty face) -> newspaper wipe -> BAN (ATLANTA GOES DRY slaps down) -> carry pan -> SYRUP (the copper kettle over
  the fire) -> zmatch swirl to glass -> FOUNT (the soda tap, BRAIN TONIC 5c, the nickel spinning) -> facepush ->
  ROOM3 (eyes shut, the bottle at his chest; the lamp gutters out; the calendar flies to 1888; the empty chair, the
  bill of sale, the last glass) -> surface dive -> MAP (lights from Atlanta over the world) -> radial -> NAME (BRAIN
  TONIC fades, the name is written in red script) -> loop morph (bubbles to the embers of frame 0).
- The user's notes during it: arms and hands (three rounds) - see FEEDBACK_LOG "The Coca-Cola video, arms and hands".
