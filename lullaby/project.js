// "The Lullaby" — 44.0 s, 1080x1920, 30 fps, no captions. Relit (flat + normal passes → deferred lights).
// Hard cuts and two dips to black (never a crossfade, so no two images ever mix). The last frame is the first frame.

const brS = (t, ph = 0, rate = 1) => br(t, ph, rate) * seamW(t), swayS = (t, k = 0, a = 1.5) => sway(t, k, a) * seamW(t);
const aim = (A, theta) => ({ ...A, hrot: theta - Math.atan2(A.wr[1] - A.el[1], A.wr[0] - A.el[0]) * 180 / Math.PI });
// the place a fingertip lands for a hand of length len aimed at theta, back to the wrist position
const wristFor = (tip, theta, len) => [tip[0] - Math.cos(theta * Math.PI / 180) * len, tip[1] - Math.sin(theta * Math.PI / 180) * len];
const headAt = (x, y, s, rot, look, pose, b = 0) => `<g transform="translate(${F1(x)} ${F1(y)}) rotate(${F1(rot)}) scale(${s} ${(s * (1 + .006 * b)).toFixed(4)}) translate(0 1075)">${P(look, pose)}</g>`;

// ---------- the song: one melody drives her mouth (and the hummed audio track) ----------
const SONG_T0 = 41.6;                                         // she starts singing again here; the loop carries it into 0 s
const songPos = t => (t >= 40 ? t - SONG_T0 : t - SONG_T0 + DUR);
const VERSE = MELODY.notes.reduce((a, n) => a + n[1], 0) * MELODY.beat;
function noteAt(m) {
  m = ((m % VERSE) + VERSE) % VERSE; let acc = 0;
  for (let i = 0; i < MELODY.notes.length; i++) { const d = MELODY.notes[i][1] * MELODY.beat; if (m < acc + d) return { i, u: (m - acc) / d, d }; acc += d; }
  return { i: 0, u: 0, d: MELODY.beat };
}
// mouth while singing a note: opens on the onset, holds, eases off at the end; vowel size varies note to note
const singMouth = (m, amp = .3) => { const n = noteAt(m), env = Math.min(1, n.u * n.d / .08) * (1 - .4 * seg(n.u, .8, 1)); return .08 + amp * env * (.8 + .2 * ((n.i * 5) % 3) / 2); };

// ---------- placements (bedroom world) ----------
const ELS_SC = .6, ELS_POS = [300, 2089];                     // seated on the stool by the bed
const HUS_SC = .63, HUS_SEAT = [1000, 2150];                  // seated on the near edge of the children's bed
const HUS_GRIP = [-190, -610];                                // his hand braced on the mattress edge (shots 14, 16, 17)
const LAP = { armL: eArm(-1, [-28, -642], 'back', { hrot: -12 }), armR: eArm(1, [22, -660], 'back', { hrot: 12 }) };
const elsSeated = (t, pose = {}) => outlined(atb(...ELS_POS, ELS_SC, P(ELS, { ...LAP, ...pose }), brS(t, 0, 1.1)));
// the children asleep on the pillow, on their sides, faces toward us. sync (0..1): their breathing turns slow, deep and together
function kidsSide(t, { sync = 0, open = 0 } = {}) {
  const bg = brS(t, 0, 1.6) * (1 - sync) + br(t, 0, .7) * sync * 1.6, bb = brS(t, 1.7, 1.9) * (1 - sync) + br(t, 0, .7) * sync * 1.6;
  return `${headAt(592, 1668 + bg * 1.2, .4, -84, KID_GIRL, { lid: 2, smirk: 0, breathOpen: open * Math.max(0, bg) })}${headAt(742, 1690 + bb * 1.2, .36, -80, KID_BOY, { lid: 2, smirk: 0, breathOpen: open * Math.max(0, bb) })}`;
}
// the whole room. o.els / o.hus: already-placed SVG; o.bed: { lift, roll } from the thing beneath
function room(t, o = {}) {
  const { lift = 0, roll = 0 } = o.bed || {}, sync = o.sync || 0;
  const kb = (brS(t, 0, 1.6) * .5 + .5) * (1 - sync) + (br(t, 0, .7) * .5 + .5) * sync * 1.4;
  return `${bedroomBack({ t, still: o.still || 0, door: o.door || 0, snowAmt: o.snow ?? 1, hump: o.hump || null, blur: o.dof || null })}${moonBeam(o.moon ?? 1)}
    <g transform="translate(0 ${F1(-lift)}) rotate(${F1(roll)} 540 ${FLOOR_Y})">${childBedBack({ t })}${kidsSide(t, { sync })}${childBedFront({ t, breathe: kb })}</g>
    ${bedsideTable()}${candle(430, 1640, t, { still: o.still || 0, lean: o.lean || 0 })}${stool(300)}
    ${o.order === 'hus-els' ? (o.hus ?? '') + (o.els ?? '') : (o.els ?? '') + (o.hus ?? '')}
    ${dust(t, { n: 30, seed: 7, area: [500, 1000, 1300, 2000], op: .5, still: o.still || 0 })}${o.front ?? ''}`;
}
// the husband's arm reaching into an overhead frame from off-screen: rolled sleeve, forearm, the back of his hand
function husReach(e0, w0, s, { hand = 'back', hrot = 0, curl = 0 } = {}) {
  const S = SKL2, sk = 'light', d = unit(e0, w0), ang = Math.atan2(d[1], d[0]) * 180 / Math.PI - 90;
  return `<g filter="url(#pk_${sk})" fill="${S.mid}"><path d="${capsuleD(e0[0], e0[1], 31 * s, w0[0], w0[1], 22 * s)}"/></g>
    <g filter="url(#pcl)" fill="#cbbd9e"><path d="${band([e0[0] + d[0] * 30 * s, e0[1] + d[1] * 30 * s], d, 36 * s, 60 * s, 6 * s)}"/></g>
    ${HANDS[hand](1, w0[0], w0[1] - 3 * s, 1.7 * s, ang + hrot, { S, sk, curl })}`;
}
// overhead: Elsbeth on her pillow (fever / waking). o.pose: face, o.armR: the hand that rises to her throat
function elsPillow(t, o = {}) {
  const sc = o.sc || 2.3, cx = 540, cy = 860;
  return `<rect x="-300" y="-300" width="1680" height="2520" fill="#241c18"/>${pillowTop(540, 700, { w: 1300, h: 900 })}
    ${outlined(headAt(cx, cy, sc, 0, ELS_BUST, { lid: .5, ...o.pose, armL: eArm(-1, [-150, -690], 'back'), armR: o.armR || eArm(1, [150, -690], 'back') }, br(t, 0, 1.2)))}
    <path d="M-300 ${cy + 470} C100 ${cy + 420} 700 ${cy + 440} 1380 ${cy + 470} L1380 2300 L-300 2300 Z" fill="#4a2a2a" filter="url(#pcl)"/>
    <path d="M-300 ${cy + 470} C100 ${cy + 420} 700 ${cy + 440} 1380 ${cy + 470} L1380 ${cy + 560} C700 ${cy + 530} 100 ${cy + 510} -300 ${cy + 560} Z" fill="#d8ccb0" filter="url(#pcl)"/>`;
}
// overhead: the children's faces on the pillow
function kidsPillow(t, { sync = 0, open = 0 } = {}) {
  const g = br(t, 0, 1.6) * (1 - sync) + br(t, 0, .7) * sync * 1.7, b = br(t, 1.7, 1.9) * (1 - sync) + br(t, 0, .7) * sync * 1.7;
  const puff = (x, y, v, k) => v > .05 ? `<ellipse cx="${F1(x + k * 30 * v)}" cy="${F1(y + 60 * v)}" rx="${F1(30 + 50 * v)}" ry="${F1(18 + 30 * v)}" fill="#e8eef8" opacity="${(.32 * v).toFixed(2)}" filter="url(#b18)"/>` : '';
  return `<rect x="-300" y="-300" width="1680" height="2520" fill="#241c18"/>${pillowTop(540, 760, { w: 1300, h: 820 })}
    ${outlined(headAt(330, 880, 1.9, -6, KID_GIRL, { lid: 2, smirk: 0, breathOpen: open * Math.max(0, g) }, g))}${outlined(headAt(770, 930, 1.75, 8, KID_BOY, { lid: 2, smirk: 0, breathOpen: open * Math.max(0, b) }, b))}
    ${puff(330, 1060, Math.max(0, -g), -1)}${puff(770, 1100, Math.max(0, -b))}
    <path d="M-300 ${F1(1250 - 8 * (g + b))} C200 ${F1(1190 - 10 * (g + b))} 800 ${F1(1210 - 10 * (g + b))} 1380 ${F1(1230 - 8 * (g + b))} L1380 2300 L-300 2300 Z" fill="#38435c" filter="url(#pcl)"/>
    <path d="M-300 ${F1(1250 - 8 * (g + b))} C200 ${F1(1190 - 10 * (g + b))} 800 ${F1(1210 - 10 * (g + b))} 1380 ${F1(1230 - 8 * (g + b))} L1380 ${F1(1330 - 8 * (g + b))} C800 ${F1(1310 - 10 * (g + b))} 200 ${F1(1290 - 10 * (g + b))} -300 ${F1(1350 - 8 * (g + b))} Z" fill="#d8ccb0" filter="url(#pcl)"/>`;
}
const RIG_PILLOW = (t, k = 1) => ({ ...RIG.bedroom(t), lights: [{ pos: [80, 560, 420], col: '#ffd9ae', int: 2.1 * k * (.92 + .1 * flkSeam(t, 3)), rad: 1050, shin: 28 }, { pos: [1150, 160, 260], col: '#a9c2ff', int: 1.0 * k, rad: 1400, shin: 24 }, { pos: [540, 900, 1600], col: '#8a9cd0', int: .32 * k, rad: 4500, shin: 12 }], rays: undefined });

// ---------- the clamp (shots 16-17) ----------
// she stands on his right (the door side), so the children's faces stay clear of her. His mouth (world) → her wrist
// target: her left palm lands on his mouth with the fingers across his cheek; the arm keeps one IK side (elbow down)
// all the way from hanging to the reach, so the elbow never flips
const CL_X = 1238, CL_Y = 1992;
function clampPair(t, { clamp, jolt, ex, hTurn, hLook, hLookY, eTilt }) {
  const hx = HUS_SEAT[0], hy = HUS_SEAT[1] + 8 * jolt, hb = br(t, 1, 2.2), eb = br(t, 0, 2.6);
  const mouth = toWorld([2 + hTurn * 15, -1010], hx, hy, HUS_SC, hb);
  const tgt = toLocal(wristFor([mouth[0] - 34, mouth[1] + 4], 182, 92 * ELS_SC), ex, CL_Y, ELS_SC, eb);
  const L = aim(eArm(-1, lerp2([-138, -622], tgt, clamp), 'back', { bend: -1, front: true, spread: .1, hs: 1.3 }), lerp(105, 182, clamp));
  const hus = outlined(manb(hx, hy, HUS_SC, HUS_SIT, { shock: clamp > .5 ? 1 : 0, bIn: 14 * clamp, bOut: 12 * clamp, look: hLook, lookY: hLookY, turn: hTurn, tilt: 3 * jolt, talk: clamp > .5 ? 0 : .12,
    armL: uArm(-1, HUS_GRIP, 'grip', { bend: 1 }), armR: uArm(1, [130, -606], 'back', { hrot: 10 }), breath: hb }));
  const els = outlined(manb(ex, CL_Y, ELS_SC, ELS_STAND, { pale: .78, bIn: 14, bOut: 10, look: -3, lookY: 9, smirk: -1, lid: .12, tilt: eTilt, turn: -.25,
    armL: L, armR: eHang(1, 4), breath: eb }));
  return { hus, els };
}

const SHOTS = [
  // 1 "Every night, Elsbeth sang the same lullaby over her children's beds." — she sings, eyes on the floor; the camera
  //   draws back and finds the two children asleep beside her
  { at: 0,
    draw(v, t) {
      const pull = easeInOut(seg(t, .55, 3.7)), m = songPos(t);
      const C = camT(t, lerp(300, 640, pull), lerp(1430, 1690, pull), lerp(3.2, 1.06, pull));
      return `<g transform="${C.tf}">${lights(C.v, RIG.bedroom(t))}
        ${room(t, { els: elsSeated(t, { lid: .45, lookY: 7, look: 2, talk: singMouth(m), tilt: -3 + swayS(t, 0, .8), bIn: 4 }) })}</g>`;
    } },

  // 2 "Her voice was cracked and raw," — close: the note breaks on CRACKED, she winces and swallows; on RAW her hand
  //   goes to her throat and she sings on through it
  { at: 4.0,
    draw(v, t) {
      const m = songPos(t), crack = bell(t, 4.62, 5.0), hand = easeInOut(seg(t, 5.05, 5.45));
      const R0 = eArm(1, lerp2([22, -660], wristFor([4, -978], -118, 100), hand), 'back', { front: hand > .02, hs: 1.3 }), R = hand > .02 ? aim(R0, lerp(-60, -118, hand)) : { ...R0, hrot: 12 };
      const C = camT(t, 300, 1440, lerp(4.0, 4.5, seg(t, 4.0, 5.95)), { r: -1.5 });
      return `<g transform="${C.tf}">${lights(C.v, RIG.bedroom(t))}
        ${room(t, { dof: 'dofLight', els: elsSeated(t, { armR: R, lid: .45 + .9 * crack, lookY: 7, look: 1, talk: singMouth(m) * (1 - .7 * crack), bIn: 6 + 10 * crack, bOut: -2, grit: .5 * crack, tilt: -3 + 3 * crack, cracked: 1 }) })}</g>`;
    } },

  // 3 "and her husband begged her to rest." — in the warm doorway he steps in, one hand reaching toward her, pleading
  { at: 5.95,
    draw(v, t) {
      const step = easeInOut(seg(t, 6.0, 6.7)), reach = easeInOut(seg(t, 6.35, 6.95)), talk = t > 6.55 && t < 7.7 ? .22 * Math.abs(Math.sin(t * 15)) : 0;
      const L = uArm(-1, lerp2([-170, -604], [-300, -830], reach), reach > .4 ? 'palm' : 'back', { hrot: -70 * reach, spread: .6, bend: -1, curl: .3 * (1 - reach) });
      const st = stride(t, .55, 14), walking = step > 0 && step < 1;
      const sc = lerp(.58, .63, step), x = lerp(1720, 1660, step), y = lerp(1930, 1990, step) - (walking ? st.bob * sc : 0);
      const hus = outlined(manb(x, y, sc, HUS, { bIn: 12, bOut: -2, smirk: -.7, look: -9, lookY: 1, turn: -.3, talk, tilt: 4 * reach, armL: L,
        legL: walking ? st.legL : null, legR: walking ? st.legR : null, breath: br(t, 1) }));
      const C = camT(t, 1680, 1440, 2.25);
      return `<g transform="${C.tf}">${lights(C.v, RIG.bedroom(t, { door: 1 }))}
        ${bedroomBack({ t, blur: 'dofLight', door: 1 })}${hus}</g>`;
    } },

  // 4 "She refused." — she shakes her head, slowly, without lifting her eyes, and keeps singing
  { at: 7.75,
    draw(v, t) {
      const m = songPos(t), shake = Math.sin(seg(t, 7.85, 8.75) * Math.PI * 2) * .24 * (1 - seg(t, 8.5, 8.8));
      const C = camT(t, 300, 1445, lerp(4.4, 4.7, seg(t, 7.75, 8.85)), { r: 1.5 });
      return `<g transform="${C.tf}">${lights(C.v, RIG.bedroom(t))}
        ${room(t, { dof: 'dofLight', els: elsSeated(t, { lid: .5, lookY: 8, look: shake * 6, turn: shake, talk: singMouth(m), bIn: 2, bOut: -4, smirk: -.4, tilt: -2 }) })}</g>`;
    } },

  // 5 "He noticed she never looked at the children while she sang." — his eyes go from her to the children and back;
  //   then wide: she sings, eyes down, the children asleep, and she never once looks at them
  { at: 8.85,
    draw(v, t) {
      if (t < 10.2) {
        const look = kf(t, [[8.85, -9], [9.35, -9], [9.6, 6], [9.95, 6], [10.2, -6]]), frown = easeInOut(seg(t, 9.2, 9.9));
        const hus = outlined(manb(1660, 1990, .63, HUS, { bIn: -2 - 8 * frown, bOut: 6 * frown, smirk: -.5, look, lookY: look > 0 ? 3 : 0, turn: -.25 + .2 * (look > 0 ? 1 : 0), lid: .2, breath: br(t, 1) }));
        const C = camT(t, 1660, 1335, 3.6);
        return `<g transform="${C.tf}">${lights(C.v, RIG.bedroom(t, { door: 1 }))}${bedroomBack({ t, blur: 'dofLight', door: 1 })}${hus}</g>`;
      }
      const m = songPos(t), p = easeInOut(seg(t, 10.2, 11.55));
      const C = camT(t, lerp(600, 470, p), lerp(1660, 1600, p), lerp(1.12, 1.4, p));
      return `<g transform="${C.tf}">${lights(C.v, RIG.bedroom(t))}
        ${room(t, { els: elsSeated(t, { lid: .5, lookY: 8, look: 2, talk: singMouth(m), tilt: -3 + sway(t, 1, .6) }) })}</g>`;
    } },

  // 6 "She stared at the floorboards." — her eyes, fixed downward, unblinking; then the floor under the bed, and the dark
  //   gap beneath it, which we push slowly into
  { at: 11.55,
    draw(v, t) {
      if (t < 12.35) {
        const m = songPos(t), C = camT(t, 300, 1440, lerp(7.2, 7.8, seg(t, 11.55, 12.35)), { hh: .4 });
        return `<g transform="${C.tf}">${lights(C.v, RIG.bedroom(t))}${room(t, { dof: 'dofHeavy', els: elsSeated(t, { lid: .55, lookY: 9, look: 1, talk: singMouth(m), bIn: 3 }) })}</g>`;
      }
      const p = easeInOut(seg(t, 12.35, 13.4));
      const C = camT(t, lerp(820, 860, p), lerp(1940, 1925, p), lerp(2.3, 3.2, p), { hh: .5 });
      return `<g transform="${C.tf}">${lights(C.v, RIG.bedroom(t, { moon: .7 }))}${room(t, {})}
        <ellipse cx="900" cy="1915" rx="${F1(240 + 30 * Math.sin(t * .9))}" ry="40" fill="#000" opacity="${(.55 * seg(t, 12.6, 13.3)).toFixed(2)}" filter="url(#b18)"/></g>`;
    } },

  // 7 "One winter" — outside: the cottage in falling snow, one window lit; we drift toward it
  { at: 13.3,
    draw(v, t) {
      const p = easeInOut(seg(t, 13.3, 14.45)), C = camT(t, lerp(540, 470, p), lerp(1020, 1000, p), lerp(1.0, 1.25, p), { hh: .6 });
      return `<g transform="${C.tf}">${lights(C.v, RIG.snow(t))}${cottageNight({ t })}${snowfall(t, { n: 110, seed: 8, area: [-300, -300, 1400, 2300], wind: 160, op: .9 })}</g>`;
    } },

  // 8 "she caught a fever and lost her voice entirely." — overhead: flushed, sweating, eyes glassy; she tries to sing —
  //   her mouth opens and nothing comes; her hand goes to her throat
  { at: 14.45,
    draw(v, t) {
      const tryS = bell(t, 15.35, 16.4), strain = seg(t, 15.7, 16.3), hand = easeInOut(seg(t, 15.85, 16.35));
      const R0 = eArm(1, lerp2([150, -690], wristFor([6, -976], -116, 100), hand), 'back', { front: hand > .02, hs: 1.3 }), R = hand > .02 ? aim(R0, lerp(-80, -116, hand)) : R0;
      const C = camT(t, 540, 940, lerp(1.0, 1.12, seg(t, 14.45, 16.65)), { r: lerp(-3, -1, seg(t, 14.45, 16.65)) });
      return `<g transform="${C.tf}">${lights(C.v, RIG_PILLOW(t, .92))}
        ${elsPillow(t, { pose: { fever: 1, t, lid: .55 + .3 * Math.sin(t * 1.3) * (1 - tryS), lookY: -1, talk: .05 + .32 * tryS, bIn: 8 + 8 * strain, bOut: -2, grit: .35 * strain, tilt: 4 * Math.sin(t * .8) }, armR: R })}</g>`;
    } },

  // 9 "Her husband told her not to worry and sat down on the bed to sing it for her." — his hand rests on her hot
  //   forehead and her eyes close; then he crosses to the children's bed and sits on its edge
  { at: 16.65,
    draw(v, t) {
      if (t < 18.35) {
        const rest = easeOut(seg(t, 16.7, 17.25));
        const W = lerp2([1020, 380], [652, 690], rest), E = [W[0] + 520, W[1] - 470];
        const C = camT(t, 540, 940, 1.12, { r: -1 });
        return `<g transform="${C.tf}">${lights(C.v, RIG_PILLOW(t, .92))}
          ${elsPillow(t, { pose: { fever: 1, t, lid: lerp(.55, 1.7, easeInOut(seg(t, 17.3, 17.9))), lookY: -1, bIn: 6, bOut: 0, smirk: -.3, tilt: 2 } })}
          ${husReach(E, W, 2.3, { hrot: 70, curl: .3 })}</g>`;
      }
      if (t < 19.3) {
        const walk = easeInOut(seg(t, 18.35, 19.3)), st = stride(t, .52, 18), x = lerp(1520, 1080, walk), sw = Math.sin(t / .52 * Math.PI * 2);
        const hus = outlined(manb(x, 2010 - st.bob * .63, .63, HUS, { look: -7, turn: -.3, smirk: -.2, bIn: 4, legL: st.legL, legR: st.legR, breath: br(t, 1),
          armL: uHang(-1, 3 * sw, -14 * Math.max(0, -sw)), armR: uHang(1, -3 * sw, -14 * Math.max(0, sw)) }));
        const C = camT(t, lerp(1000, 900, walk), 1640, 1.18);
        return `<g transform="${C.tf}">${lights(C.v, RIG.bedroom(t))}${room(t, { hus })}</g>`;
      }
      const settle = easeOut(seg(t, 19.3, 19.62)), bounce = spring(t, 19.62, 2.2, .18), soft = easeInOut(seg(t, 19.7, 20.25));
      const hus = outlined(manb(HUS_SEAT[0], HUS_SEAT[1] - 40 * (1 - settle) + 6 * bounce, HUS_SC, HUS_SIT, { look: -8, lookY: 3, turn: -.35, smirk: lerp(.2, .35 + .1 * Math.sin(20.25), soft),
        bIn: lerp(6, 5, soft), bOut: lerp(0, 2, soft), lid: .35 * soft, armL: uArm(-1, [-120, -612], 'back', { hrot: -10 }), armR: uArm(1, [130, -606], 'back', { hrot: 10 }), breath: br(t, 1, 1.1) }));
      const C = camT(t, 860, lerp(1570, 1560, seg(t, 19.3, 20.25)), lerp(2.2, 2.3, seg(t, 19.3, 20.25)));
      return `<g transform="${C.tf}">${lights(C.v, RIG.bedroom(t))}${room(t, { hus, dof: 'dofLight' })}</g>`;
    } },

  // 10 "He knew the tune well enough, and he hummed it as best he could." — he hums to the sleeping children, swaying a
  //   little, a tender half-smile, his eyes on them
  { at: 20.25,
    draw(v, t) {
      const m = t - 20.4, n = noteAt(m), sw = Math.sin(t * 2 * Math.PI / (MELODY.beat * 3)) * 3;
      const hus = outlined(manb(HUS_SEAT[0], HUS_SEAT[1], HUS_SC, HUS_SIT, { look: -8, lookY: 3, turn: -.35, smirk: .35 + .1 * Math.sin(t), bIn: 5, bOut: 2, lid: .35, tilt: sw,
        talk: .04 * (1 - n.u), armL: uArm(-1, [-120, -612], 'back', { hrot: -10 }), armR: uArm(1, [130, -606], 'back', { hrot: 10 }), breath: br(t, 1, 1.1) }));
      const C = camT(t, lerp(860, 880, seg(t, 20.25, 23.25)), 1560, lerp(2.3, 2.6, seg(t, 20.25, 23.25)));
      return `<g transform="${C.tf}">${lights(C.v, RIG.bedroom(t))}${room(t, { hus, dof: 'dofLight' })}</g>`;
    } },

  // 11 "The house went quiet." — everything stops: the flame stands still, the snow hangs in the window, the dust stops
  //   drifting; he stops humming and slowly lifts his head
  { at: 23.25,
    draw(v, t) {
      const still = easeInOut(seg(t, 23.3, 23.7)), up = easeInOut(seg(t, 23.6, 24.4));
      const hus = outlined(manb(HUS_SEAT[0], HUS_SEAT[1], HUS_SC, HUS_SIT, { look: lerp(-8, -2, up), lookY: lerp(3, -3, up), turn: lerp(-.35, -.05, up), smirk: lerp(.3, -.4, up), bIn: lerp(5, 9, up), bOut: lerp(2, 6, up), lid: lerp(.35, 0, up),
        armL: uArm(-1, [-120, -612], 'back', { hrot: -10 }), armR: uArm(1, [130, -606], 'back', { hrot: 10 }), breath: br(t, 1, 1.1) * (1 - still * .7) }));
      const C = camT(t, 760, 1680, 1.24, { hh: 0 });
      return `<g transform="${C.tf}">${lights(C.v, RIG.bedroom(t, { still, k: 1 - .12 * still }))}${room(t, { still, hus, snow: 1 - still })}</g>`;
    } },

  // 12 "The children's breathing changed." — overhead: their breath slows and deepens, falls into step, the two of them
  //   breathing as one, mouths drifting open together, the cold air clouding over them
  { at: 24.65,
    draw(v, t) {
      const sync = easeInOut(seg(t, 25.35, 26.0)), open = easeInOut(seg(t, 25.7, 26.3));
      const C = camT(t, 540, lerp(980, 1000, seg(t, 24.65, 26.45)), lerp(1.0, 1.1, seg(t, 24.65, 26.45)), { hh: .3 });
      return `<g transform="${C.tf}">${lights(C.v, RIG_PILLOW(t, .9))}${kidsPillow(t, { sync, open })}</g>`;
    } },

  // 13 "And beneath the bed, something began to shift," — floor level, under the bed: dark; on SHIFT the boards lift
  //   and settle, dust sifts down, and something pale slides past in the gaps between the boards
  { at: 26.45,
    draw(v, t) {
      const shift = easeInOut(seg(t, 28.2, 28.8)) * (1 - .5 * easeInOut(seg(t, 28.8, 29.1))), sheen = seg(t, 27.4, 28.4);
      const C = camT(t, 540, lerp(1040, 1000, seg(t, 26.45, 29.1)), lerp(1.0, 1.14, seg(t, 26.45, 29.1)), { hh: .4, sy: 6 * decay(t, 28.3, .2) * Math.sin(t * 60) });
      const rig = { lights: [{ pos: [60, 1500, 420], col: '#ffd9ae', int: 3.4 * (.92 + .1 * flkSeam(t, 3)), rad: 1250, shin: 28 }, { pos: [900, 2000, 500], col: '#ffcf9e', int: 1.1, rad: 1100, shin: 20 }, { pos: [540, 760, -200], col: '#6a7aa8', int: .5, rad: 900, shin: 20 }],
        amb: '#2a3044', ambGround: '#141010', ambInt: .3, bgLight: .9, exposure: 1.3, vignette: .6, grain: .022, contrast: 1.1, sat: .85, shadowTint: '#0e1626' };
      return `<g transform="${C.tf}">${lights(C.v, rig)}${underBedView(t, { shift, sheen, dustAmt: seg(t, 28.25, 28.6) })}</g>`;
    } },

  // 14 "slow and heavy, like a sleeper turning over." — the floor heaves in a slow swell under the bed; the bed lifts and
  //   rolls and settles; he grips the frame; the flame bows; dust falls from the beam. The children sleep on.
  { at: 29.1,
    draw(v, t) {
      const q = seg(t, 29.2, 32.2), swell = Math.sin(Math.PI * q) * easeInOut(Math.min(1, q * 3)), roll = Math.sin(Math.PI * q) * 2.6;
      const grab = easeOut(seg(t, 29.55, 29.85)), alarm = easeOut(seg(t, 29.4, 29.8));
      const hump = { x: lerp(700, 1100, q), y: 2120, wx: 420, wy: 160, h: 46 * swell };
      const L = uArm(-1, lerp2([-120, -612], HUS_GRIP, grab), grab > .4 ? 'grip' : 'back', { hrot: lerp(-10, 0, grab), bend: 1 });
      const hus = outlined(manb(HUS_SEAT[0], HUS_SEAT[1] - 30 * swell, HUS_SC, HUS_SIT, { look: lerp(-8, 3, alarm), lookY: lerp(3, 9, alarm), turn: lerp(-.35, .05, alarm), shock: alarm > .5 ? 1 : 0, bIn: 12 * alarm, bOut: 10 * alarm,
        tilt: roll * 2.5, armL: L, armR: uArm(1, [130, -606], 'back', { hrot: 10 }), breath: br(t, 1, 2) }));
      let fall = ''; const R = rng(14);
      for (let i = 0; i < 24; i++) { const t0 = 29.6 + R() * 2.2, dt = t - t0, x = 300 + R() * 1100; if (dt > 0 && dt < 1.4) fall += `<circle cx="${F1(x + Math.sin(dt * 3 + i) * 10)}" cy="${F1(880 + dt * 260 + dt * dt * 380)}" r="${F1(2 + R() * 3)}" fill="#c8b89a" opacity="${(.7 * (1 - dt / 1.4)).toFixed(2)}"/>`; }
      const C = camT(t, 780, 1700, 1.36, { r: -roll * 1.4, sy: 4 * Math.sin(t * 23) * swell });
      return `<g transform="${C.tf}">${lights(C.v, RIG.bedroom(t, { k: 1 - .1 * swell }))}
        ${room(t, { hump, bed: { lift: 26 * swell, roll: -roll }, hus, lean: 6 * Math.sin(t * 2.2) * swell + 5 * swell, sync: 1 })}${fall}</g>`;
    } },

  // 15 "Elsbeth tore herself up from her pillow, silent and white-faced," — overhead: her eyes snap open; she wrenches
  //   herself up at us (the camera rushes in on her face); then her face in the dark — drained white, lips pressed shut
  { at: 32.35,
    draw(v, t) {
      if (t < 34.4) {
        const open = easeOut(seg(t, 32.55, 32.68)), surge = easeIn(seg(t, 33.1, 34.4));
        const C = camT(t, 540, lerp(940, 905, surge), lerp(1.12, 2.35, surge), { r: lerp(-1, 4, surge), sx: 4 * Math.sin(t * 40) * surge });
        return `<g transform="${C.tf}">${lights(C.v, RIG_PILLOW(t, .92))}
          ${elsPillow(t, { pose: { fever: .6, t, lid: lerp(1.8, 0, open), shock: open > .5 ? 1 : 0, bIn: 14 * open, bOut: 12 * open, lookY: -2, pale: .6 * open, smirk: -.8 } })}</g>`;
      }
      const p = easeOut(seg(t, 34.4, 35.7));
      const els = outlined(manb(lerp(560, 600, p), 1990, ELS_SC, ELS_STAND, { pale: .8, shock: 1, bIn: 16, bOut: 12, look: 4, lookY: 5, smirk: -1, lid: 0, tilt: -3, turn: .15,
        armL: eHang(-1, 6), armR: eHang(1, 6), breath: br(t, 0, 2.4) }));
      const C = camT(t, lerp(570, 610, p), 1355, lerp(4.1, 4.4, p), { hh: .5 });
      return `<g transform="${C.tf}">${lights(C.v, RIG.bedroom(t, { moon: 1.1 }))}${bedroomBack({ t, blur: 'dofHeavy' })}${moonBeam()}${els}</g>`;
    } },

  // 16 "and clamped her hand over his mouth." — she is at his side in one stride (on his right, the door side); her hand
  //   slams over his mouth and his head snaps round to her, eyes wide; she holds him there, staring at the floor
  { at: 35.7,
    draw(v, t) {
      const clamp = easeOut(seg(t, 35.9, 36.12)), jolt = decay(t, 36.1, .14), lean = easeOut(seg(t, 35.7, 36.1));
      const { hus, els } = clampPair(t, { clamp, jolt, ex: lerp(1300, CL_X, lean), hTurn: lerp(-.35, .12, clamp), hLook: lerp(-8, 7, clamp), hLookY: lerp(3, -1, clamp), eTilt: -6 * lean });
      const C = camT(t, lerp(1140, 1146, seg(t, 35.7, 37.7)), 1420, lerp(2.48, 2.53, seg(t, 35.7, 37.7)), { sx: 6 * jolt * Math.sin(t * 70) });
      return `<g transform="${C.tf}">${lights(C.v, RIG.bedroom(t))}${room(t, { hus, els, sync: 1, order: 'hus-els', dof: 'dofLight' })}</g>`;
    } },

  // 17 "She had never been singing the children to sleep." — the two of them frozen, her hand over his mouth; his eyes go
  //   down to the floor. Then the children, asleep, breathing as one — and the camera sinks down the side of the bed
  //   into the dark beneath it
  { at: 37.7,
    draw(v, t) {
      const down = easeInOut(seg(t, 37.9, 38.6));
      const { hus, els } = clampPair(t, { clamp: 1, jolt: 0, ex: CL_X, hTurn: .12, hLook: lerp(7, 0, down), hLookY: lerp(-1, 8, down), eTilt: -6 });
      if (t < 39.0) {
        const C = camT(t, lerp(1146, 1152, seg(t, 37.7, 39.0)), 1420, lerp(2.53, 2.58, seg(t, 37.7, 39.0)));
        return `<g transform="${C.tf}">${lights(C.v, RIG.bedroom(t))}${room(t, { hus, els, sync: 1, order: 'hus-els', dof: 'dofLight' })}</g>`;
      }
      const q = easeInOut(seg(t, 39.0, 40.15));
      const C = camT(t, lerp(664, 676, q), lerp(1700, 2050, q), lerp(3.2, 3.3, q), { hh: .4 });
      return `<g transform="${C.tf}">${lights(C.v, RIG.bedroom(t))}${room(t, { hus, els, sync: 1, order: 'hus-els' })}
        <ellipse cx="690" cy="1930" rx="${F1(230 + 20 * Math.sin(t * .9))}" ry="38" fill="#000" opacity="${(.6 * seg(t, 39.3, 40.1)).toFixed(2)}" filter="url(#b18)"/></g>`;
    } },

  // 18 "She'd been singing to the thing that slept beneath them." — beneath the floor, in the dark: an eye the size of the
  //   room, its lid twitching in a dream; her cracked song comes down through the boards and it goes still. Then she is
  //   back at the bedside, singing, eyes on the floor — the first frame of the film
  { at: 40.15,
    draw(v, t) {
      if (t < 42.75) {
        const calm = easeInOut(seg(t, 41.6, 42.4)), tw = 1 - calm, br2 = Math.sin(t * 1.1) * (1 - calm * .5);
        const C = camT(t, 540, lerp(1080, 1120, seg(t, 40.15, 42.75)), lerp(1.0, 1.16, seg(t, 40.15, 42.75)), { hh: .3 });
        return `<g transform="${C.tf}">${lights(C.v, RIG.under(t))}
          <rect x="-300" y="-300" width="1680" height="2520" fill="#050403"/>${boardsFromBelow(-300, 380, t, { seamOp: 1 })}
          ${sleeperEye(540, 1180, 1.0, t, { open: 0, twitch: tw, breathe: br2 })}</g>`;
      }
      const m = songPos(t);
      const C = camT(t, 300, 1430, 3.2);
      return `<g transform="${C.tf}">${lights(C.v, RIG.bedroom(t))}
        ${room(t, { els: elsSeated(t, { lid: .45, lookY: 7, look: 2, talk: singMouth(m), tilt: -3 + swayS(t, 0, .8), bIn: 4 }) })}</g>`;
    } },
];

const TRANS = [
  [13.3, 13.2, 13.42, 'black'],
  [40.15, 40.05, 40.27, 'black'],
];

TL = makeTimeline({ shots: SHOTS, trans: TRANS, words: WORDS, strong: STRONG, captions: 'none', fps: 30, duration: DUR });
render(0);
