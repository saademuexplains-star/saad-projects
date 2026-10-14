// "The Man Who Wouldn't Die" — Michael Malloy, the Bronx, winter 1932–33. 51.0 s, 1080x1920, 30 fps, no captions.
// Relit (flat + normal passes → deferred lights + post). Every shot moves; plain cuts between shots (nothing announces
// itself as a transition); the cab's headlights fade through white. The first and last frames are the same front page.

// ---------- camera with motion blur from its own velocity ----------
function camF(t, fn, mbK = 1) {
  const c = fn(t), c0 = fn(t - 1 / 60), C = camT(t, c[0], c[1], c[2], c[3] || {});
  if (mbK) window.__MBk[window.__shot] = { dx: (c0[0] - c[0]) * c[2] * mbK, dy: (c0[1] - c[1]) * c[2] * mbK, z: (c[2] - c0[2]) / c[2] * mbK, cx: 540, cy: 960 };
  return C;
}
const SHK = (t, hits) => { const [x, y] = shakeXY(t, hits); return { sx: x, sy: y }; };
const flashK = (op, col = '#fff8ec') => { if (!window.__FLASH || window.__FLASH.op < op) window.__FLASH = { op, col }; };
const ease = easeInOut;
// a camera move that is under way almost at once: a short speed ramp, then a long settle (u, result 0..1)
const GLIDE = (() => { const N = 400, a = .12, pw = 1.5, c = [0]; for (let i = 1; i <= N; i++) { const x = (i - .5) / N, r = Math.min(1, x / a);
  c.push(c[i - 1] + r * r * (3 - 2 * r) * Math.pow(1 - x, pw)); } return c.map(v => v / c[N]); })();
const glide = u => { const f = clamp(u) * 400, i = Math.floor(f); return i >= 400 ? 1 : lerp(GLIDE[i], GLIDE[i + 1], f - i); };

// a figure at P = [x, y, s] (world), leaning `lean` deg about its waist; `top` = extra drawing in its local coordinates
function who(ch, t, P, pose = {}, { top = '', lean = 0, ph = 0, rate = 1, still = 0, tex = 1 } = {}) {
  const [x, y, s] = P, b = still ? 0 : brS(t, ph, rate) * .8;
  const inner = manb(x, y, s, ch, { breath: b, ...pose }) + (top ? atb(x, y, s, top, b) : '');
  const body = lean ? `<g transform="rotate(${F1(lean)} ${F1(x)} ${F1(y - 640 * s)})">${inner}</g>` : inner;
  return outlined(tex ? textured(body) : body, 0, { px: 1.3, col: '#1a120c', op: .5 });
}
// feet y for a bust figure whose belt sits just under the bottom of the frame (camera centre fy, zoom z — the widest
// zoom of the shot), and a figure behind a counter whose top edge is at yc
const mcuY = (fy, s, z) => fy + 960 / z + 690 * s + 30;
const behindY = (yc, s) => yc + 720 * s + 20;

// ---------- light rigs ----------
const RIG_STREET = (t, o = {}) => ({ lights: [ { pos: [860, 1028, 220], col: '#ffd8a0', int: 1.5, rad: 1000, shin: 22 }, { pos: [550, 1240, 180], col: '#ffc888', int: 1.3, rad: 700, shin: 22 },
    { pos: [820, -1800, 1400], col: '#9ab0e0', int: .9, rad: 9000, shin: 14 }, ...(o.extra || []) ],
  amb: '#2a3450', ambGround: '#4a5068', ambInt: .4, bgLight: .8, exposure: 1.15, bloom: .5, bloomThresh: .72, white: 2.2, tonemap: 'soft', emisGain: 1.7, normalStrength: 1.3, specScale: .3,
  vignette: .55, grain: .02, shadowTint: '#0e1830', highTint: '#ffd8a8', shadowAmt: .28, highAmt: .1, sat: .9, contrast: 1.1 });
const RIG_SNOWDAY = t => ({ lights: [ { pos: [-300, 200, 900], col: '#e8eef4', int: 1.3, rad: 6000, shin: 20 }, { pos: [1400, 800, -200], col: '#d8dce4', int: .7, rad: 2400, shin: 20 } ],
  amb: '#8a94a4', ambGround: '#c0c4c8', ambInt: .5, bgLight: .95, exposure: 1.05, bloom: .3, bloomThresh: .84, white: 2.4, tonemap: 'soft', normalStrength: 1.3, specScale: .22,
  vignette: .45, grain: .016, shadowTint: '#2a3446', highTint: '#f0f0ec', shadowAmt: .2, highAmt: .05, sat: .8, contrast: 1.05 });
const RIG_BAR = (t, o = {}) => ({ lights: [ { pos: [100, 190, 260], col: '#ffd8a0', int: 1.5, rad: 1300, shin: 24 }, { pos: [980, 190, 260], col: '#ffd8a0', int: 1.5, rad: 1300, shin: 24 },
    { pos: [540, 1500, 1000], col: '#f0d8c0', int: .9, rad: 2600, shin: 20 }, { pos: [540, 2400, 1200], col: '#6a7090', int: .3, rad: 5000, shin: 12 }, ...(o.extra || []) ],
  amb: '#4a3a30', ambGround: '#2a1a12', ambInt: .36, bgLight: .85, exposure: 1.12, bloom: .45, bloomThresh: .74, white: 2.3, tonemap: 'soft', emisGain: 1.6, normalStrength: 1.35, specScale: .3,
  vignette: .52, grain: .018, shadowTint: '#1a1420', highTint: '#ffe0b8', shadowAmt: .24, highAmt: .1, sat: .92, contrast: 1.1 });
const RIG_ROOMB = (t, { morning = 0 } = {}) => ({ lights: [ { pos: [540, 380, 300], col: '#ffd8a0', int: 1.4 * (1 - .7 * morning), rad: 1500, shin: 24 },
    { pos: [840, 850, -80], col: morning ? '#e0e8f4' : '#8aa0d0', int: morning ? 2.2 : .7, rad: morning ? 2400 : 1200, shin: 20 },
    { pos: [560, 1700, 1100], col: morning ? '#c8d0dc' : '#f4d8b8', int: morning ? .9 : 1.1, rad: 2600, shin: 22 }, { pos: [540, 2400, 1200], col: '#6a7090', int: .3, rad: 5000, shin: 12 } ],
  amb: morning ? '#6a7080' : '#4a3a32', ambGround: '#2a1a12', ambInt: morning ? .46 : .36, bgLight: .85, exposure: 1.12, bloom: .45, bloomThresh: .74, white: 2.3, tonemap: 'soft', emisGain: 1.6,
  normalStrength: 1.35, specScale: .3, vignette: .52, grain: .018, shadowTint: morning ? '#1e2a3e' : '#1a1420', highTint: morning ? '#eef0f0' : '#ffe0b8', shadowAmt: .24, highAmt: .1,
  sat: morning ? .82 : .92, contrast: 1.1 });
const RIG_BACK = (t, o = {}) => ({ lights: [ { pos: [540, 664, 380], col: '#ffd8a0', int: 2.4 + .08 * Math.sin(t * 3), rad: 1300, shin: 24 }, { pos: [540, 2000, 900], col: '#c8a888', int: .5, rad: 2400, shin: 18 },
    { pos: [860, 450, -100], col: '#7a90c0', int: .4, rad: 900, shin: 16 } ],
  amb: '#2a2420', ambGround: '#1a120c', ambInt: .3, bgLight: .7, exposure: 1.15, bloom: .5, bloomThresh: .72, white: 2.2, tonemap: 'soft', emisGain: 1.7, normalStrength: 1.4, specScale: .3,
  vignette: .62, grain: .022, shadowTint: '#141018', highTint: '#ffdcb0', shadowAmt: .28, highAmt: .1, sat: .88, contrast: 1.12, ...o });
const RIG_BED = t => ({ lights: [ { pos: [-200, -300, 700], col: '#a8bce8', int: 1.6, rad: 4200, shin: 18 }, { pos: [1300, 1600, 600], col: '#5a6a9a', int: .5, rad: 2000, shin: 14 } ],
  amb: '#1e2640', ambGround: '#141828', ambInt: .3, bgLight: .7, exposure: 1.18, bloom: .4, bloomThresh: .76, white: 2.2, tonemap: 'soft', emisGain: 1.5, normalStrength: 1.4, specScale: .25,
  vignette: .66, grain: .024, shadowTint: '#0a1022', highTint: '#d8e4ff', shadowAmt: .3, highAmt: .08, sat: .78, contrast: 1.12 });
const RIG_INS = (t, o = {}) => ({ lights: [ { pos: [200, 300, 800], col: '#ffe0b8', int: 1.6, rad: 3200, shin: 26 }, { pos: [1100, 900, 300], col: '#ffc890', int: .8, rad: 1800, shin: 24 },
    { pos: [540, 2400, 1200], col: '#6a7090', int: .3, rad: 5000, shin: 12 } ],
  amb: '#4a3428', ambGround: '#2a1a12', ambInt: .4, bgLight: .85, exposure: 1.1, bloom: .45, bloomThresh: .74, white: 2.3, tonemap: 'soft', emisGain: 1.5, normalStrength: 1.4, specScale: .4,
  vignette: .55, grain: .018, shadowTint: '#1a1420', highTint: '#ffe0b8', shadowAmt: .22, highAmt: .1, sat: .92, contrast: 1.1, ...o });

const RIG_PAPER = t => ({ lights: [ { pos: [200, 200, 1100], col: '#fff0d8', int: 1.5, rad: 4200, shin: 18 }, { pos: [1100, 1600, 500], col: '#ffd0a0', int: .5, rad: 2200, shin: 16 } ],
  amb: '#5a4a3a', ambGround: '#3a2a1a', ambInt: .5, bgLight: 1.0, exposure: 1.06, bloom: .3, bloomThresh: .85, white: 2.4, tonemap: 'soft', normalStrength: 1.0, specScale: .12,
  vignette: .5, grain: .02, shadowTint: '#1e1610', highTint: '#fff0d8', shadowAmt: .2, highAmt: .06, sat: .92, contrast: 1.08 });

// ---------- hands and props ----------
const HS = 1.5;
const blinkL = (t, list) => blinkAt(t, list);
const SKN = { MALLOY: [SKI, 'ir'], MURPHY: [SKI, 'ir'], MARINO: [SKT, 'it'], W: [SKW, 'wt'] };
// a glass held upright in a fist (grip point 40 units up the glass); A from gripArm / gripTo
const GS = .85;
const glassIn = (A, k, sk, o = {}) => { const gs = o.gs || GS, [x, y, R] = propAt(A, k, HS, gs, -32);
  return `<g transform="rotate(${F1(R)} ${F1(x)} ${F1(y)})">${shotGlass(x, y, gs, { tall: 1, ...o })}</g>` + gripHandOn(A, k, sk[0], sk[1], HS); };
const gripAt = (k, P, o = {}) => gripArm(tArm, k, P, { hs: HS, upright: 0, bend: 'down', ...o });
const toMouth = (k, Q, up, o = {}) => gripTo(tArm, k, Q, { hs: HS, s: GS, gy: -32, py: -120, upright: up, bend: 'down', ...o });
// a hand shading the eyes (back of the hand toward us), as in the light of the headlamps
const shadeArm = () => ({ ...aim(tArm(1, [40, -1112], 'none', { hs: HS, bend: 1 }), 186), gh: 'back', front: true });
// the gang at their table in the speakeasy (seen past Malloy): Kriesberg and Pasqua behind a cloth-covered table
function gangTable(t, x, yF, { look = -8, turn = -.25, smirk = .3, shock = 0, lid = .2, lean = 0, s = .7 } = {}) {
  const top = yF - 280 * .95, Y = top + 5 + 690 * s;
  return `${who(KRIESBERG, t, [x - 80, Y, s], { bust: 1, armL: tHang(-1), armR: tHang(1), look, turn, smirk, shock, lid, tilt: 3 }, { lean, ph: 1 })}
    ${who(PASQUA, t, [x + 90, Y - 6, s], { bust: 1, armL: tHang(-1), armR: tHang(1), look, turn, smirk: smirk * .8, shock, lid: lid + .1 }, { lean: lean * .8, ph: 2 })}
    ${clothTable(x, yF, .95)}`;
}

// ================= SHOTS =================
const SHOTS = [
  // 1 "In 1933, five men in New York" — the hook: a 1933 front page, THE MAN WHO WOULDN'T DIE. The camera punches in
  //   on the year as it's said, then drops to the strip of five photographs: each pops with a flashbulb on "five men in
  //   New York". Frame 0 = the last frame (the page settled on the desk).
  { at: 0, draw(v, t) {
      const C = camF(t, t => { const a = glide(seg(t, 0, 1.15)), b = ease(seg(t, 1.28, 1.78)), u = seg(t, 1.36, 2.4), px = u * u * (3 - 2 * u);
        const x = lerp(540, lerp(370, 710, px), b), y = lerp(lerp(960, 412, a), 1000, b), z = lerp(lerp(1.0, 2.9, a), 1.72, b) * (1 + .05 * seg(t, 1.8, 2.6));
        return [x, y, z, { hh: .4, r: lerp(0, -1.5, a) * (1 - b) }]; }, .25);
      const pops = [1.52, 1.68, 1.84, 1.99, 2.14];
      const fl = pops.map(p => t >= p ? Math.exp(-(t - p) / .09) : 0), blank = pops.map(p => t > .62 && t < p ? 1 : 0);
      pops.forEach((p, i) => { if (t >= p) flashK(.22 * Math.exp(-(t - p) / .06), '#fff8ec'); });
      return `<g transform="${C.tf}">${lights(C.v, RIG_PAPER(t))}${paperDesk(t)}${frontPage(t, 540, 960, { fl, blank, yearK: bell(t, .5, .95) })}</g>`;
    } },
  // 2 "took out life insurance" — the back room: Pasqua holds up the signed policy, a thin smile; Kriesberg leans in
  //   over his shoulder
  { at: 2.60, draw(v, t) {
      const z0 = 1.4, C = camF(t, t => [560, 1000, lerp(z0, 1.5, ease(seg(t, 2.6, 3.85))), { hh: .6 }]);
      const s = 2.0, Y = mcuY(1000, s, z0), sk = SKN.W;
      const AL = jArm(-1, [-194, -778], [-96, -838], 'hold', { hs: HS }), AR = jArm(1, [194, -778], [96, -838], 'hold', { hs: HS });
      const doc = `<g transform="rotate(-3 0 -860)">${policyDoc(0, -800, .55, { flat: 1, sig: 1 })}</g>`;
      const hands = HANDS.hold(-1, AL.wr[0], AL.wr[1] - 3, HS, handAng(AL), { S: sk[0], sk: sk[1] }) + HANDS.hold(1, AR.wr[0], AR.wr[1] - 3, HS, handAng(AR), { S: sk[0], sk: sk[1] });
      return `<g transform="${C.tf}">${lights(C.v, RIG_BACK(t))}<g filter="url(#dofHeavy)">${backRoom(t)}</g>
        <g filter="url(#dof)">${who(KRIESBERG, t, [300, mcuY(1000, 1.6, z0), 1.6], { bust: 1, armL: tHang(-1), armR: tHang(1), look: 7, lookY: 5, smirk: .5, lid: .3, turn: .25 }, { ph: 2 })}</g>
        ${who(PASQUA, t, [640, Y, s], { bust: 1, armL: AL, armR: AR, look: lerp(-2, -5, seg(t, 3.2, 3.5)), lookY: lerp(7, 1, seg(t, 3.2, 3.5)), smirk: lerp(.15, .55, seg(t, 3.0, 3.5)), lid: .35 + blinkL(t, [3.05]), tilt: -2 }, { top: doc + hands })}</g>`;
    } },
  // 3 "on a homeless drunk named Michael Malloy," — at the bar, the old drunk raises his glass to us with a red-nosed grin,
  //   then knocks it back
  { at: 3.85, draw(v, t) {
      const z0 = 1.34, C = camF(t, t => [540, 1000, lerp(z0, 1.48, ease(seg(t, 3.85, 6.12))), { hh: .6 }]);
      const s = 2.0, Y = mcuY(1000, s, z0), sk = SKN.MALLOY;
      const L = gripAt(1, [190, -600]), H = gripAt(1, [165, -1075]), M = toMouth(1, [14, -1002], -48);
      const up = ease(seg(t, 4.0, 4.45)), dr = ease(seg(t, 5.15, 5.6));
      const A = dr > 0 ? armMix(H, M, dr) : armMix(L, H, up);
      const fill = lerp(.75, .1, seg(t, 5.55, 6.05));
      return `<g transform="${C.tf}">${lights(C.v, RIG_ROOMB(t))}<g filter="url(#dofHeavy)">${barRoom(t, { tables: 0 })}${gangTable(t, 900, 1500, { look: -6, smirk: .2 })}</g>
        ${who(MALLOY_BAR, t, [520, Y, s], { bust: 1, armL: tHang(-1), armR: { ...A, hand: 'none' }, smirk: lerp(.55, .95, up) * (1 - .5 * dr), look: 2 - 4 * dr, lookY: -3 * dr, lid: lerp(.25, .9, dr) + blinkL(t, [4.7]), tilt: 3 - 9 * dr, bIn: -2 }, { top: glassIn(A, 1, sk, { fill }) })}</g>`;
    } },
  // 4 "then tried to kill him for the payout." — the five of them round a card table under one lamp, leaning in over
  //   the policy, smoke in the light
  { at: 6.12, draw(v, t) {
      const C = camF(t, t => [540, lerp(1350, 1320, seg(t, 6.12, 8.21)), lerp(1.48, 1.6, ease(seg(t, 6.12, 8.21))), { hh: .5 }]);
      const yT = 1560, row = [[MARINO, 540, .95, 0, .5], [PASQUA, 330, 1.0, 4, .35], [KRIESBERG, 750, 1.0, -4, .45], [MURPHY, 130, 1.08, 6, .3], [FIFTH, 950, 1.08, -6, .4]];
      const lean = ease(seg(t, 6.3, 7.0));
      const men = row.map(([ch, x, s, ln, sm], i) => who(ch, t, [x, behindY(yT, s), s], { bust: 1, armL: tHang(-1), armR: tHang(1), look: -ln * 1.2, lookY: 5, smirk: sm * lerp(.4, 1, seg(t, 7.0, 7.6)),
        lid: .35 + .2 * (i === 0) + blinkL(t, [6.6 + i * .37]), turn: -ln * .04, tilt: ln * .4 }, { lean: ln * lean, ph: i })).join('');
      return `<g transform="${C.tf}">${lights(C.v, RIG_BACK(t))}${backRoom(t)}${men}${cardTable(540, yT, 1300)}${policyDoc(560, yT + 30, 1.0, { rot: 4, sig: 1 })}
        <g transform="translate(400 ${yT + 40})">${shotGlass(0, 0, .8, {})}</g>${bottle(760, yT + 44, .9, { kind: 1, col: '#3a4a26' })}</g>`;
    } },
  // 5 "It started when a broke bar owner gave" — behind his bar, Marino rings the register: the drawer jumps open on next
  //   to nothing; he looks in and his shoulders drop
  { at: 8.21, draw(v, t) {
      const C = camF(t, t => [780, lerp(1180, 1160, seg(t, 8.21, 10.12)), lerp(1.3, 1.4, ease(seg(t, 8.21, 10.12))), { hh: .6 }]);
      const s = 1.3, X = 640, Y = behindY(1500, s), dr = ease(seg(t, 8.95, 9.1));
      const reach = ease(seg(t, 8.3, 8.75)) * (1 - ease(seg(t, 9.25, 9.7)));
      const A = armMix(tHang(1, 0, 0, { hs: HS }), tArm(1, [(1010 - X) / s, (1230 - Y) / s], 'openJ', { hs: HS, spread: .3 }), reach);
      const sag = ease(seg(t, 9.35, 9.9));
      return `<g transform="${C.tf}">${lights(C.v, RIG_BAR(t))}${backBar(t, { reg: 0 })}${cashRegister(1030, 1300, .95, { drawer: dr, coins: 2, flag: dr })}
        ${who(MARINO, t, [X, Y + 10 * sag, s], { bust: 1, armL: tHang(-1), armR: A, turn: .3, look: 8, lookY: lerp(2, 8, dr), lid: lerp(.2, .7, sag) + blinkL(t, [8.6]), smirk: lerp(.1, -.5, sag), tilt: -3 * sag, bIn: 4 * sag })}
        ${barCounter(1500, { depth: 150 })}</g>`;
    } },
  // 6 "Malloy an unlimited tab," — Marino brings a full bottle up from under the bar by its neck, plants it on the counter
  //   in front of us (Malloy's place, the glass waiting), lets go and opens his hands: drink all you like
  { at: 10.12, draw(v, t) {
      const C = camF(t, t => [560, lerp(1160, 1190, seg(t, 10.12, 11.9)), lerp(1.24, 1.32, ease(seg(t, 10.12, 11.9))), { hh: .6 }]);
      const s = 1.3, X = 470, Y = behindY(1500, s), sk = SKN.MARINO, bL = .95;
      const up = ease(seg(t, 10.15, 10.5)), put = ease(seg(t, 10.5, 10.8)), open = ease(seg(t, 10.95, 11.4)), hold = t < 10.85;
      const A0 = jArm(1, [180, -790], [190, -610], 'grip', { hs: HS }), A1 = jArm(1, [208, -800], [156, -905], 'grip', { hs: HS }), A2 = jArm(1, [212, -790], [140, -815], 'grip', { hs: HS });
      const G = put > 0 ? armMix(A1, A2, put) : armMix(A0, A1, up);
      const F = fistAt(hold ? G : A2, HS), bottleL = bottle(F[0], F[1] + 140 * bL, bL, { kind: 0, col: '#6a4a1a', fill: .92 });
      const OA = jArm(1, [196, -792], [276, -900], 'openJ', { hs: HS, spread: 1 }), OL = jArm(-1, [-196, -792], [-276, -900], 'openJ', { hs: HS, spread: 1 });
      const RA = hold ? { ...G, hand: 'none' } : armMix({ ...A2, hand: 'relax' }, OA, open);
      const LA = armMix(tHang(-1, 0, 0, { hs: HS }), OL, open);
      const held = atb(X, Y, s, bottleL + (hold ? gripHandOn(G, 1, sk[0], sk[1], HS) : ''));
      const after = !hold || put > 0;
      return `<g transform="${C.tf}">${lights(C.v, RIG_BAR(t))}${backBar(t)}
        ${who(MARINO, t, [X, Y, s], { bust: 1, armL: LA, armR: RA, smirk: lerp(.35, .75, seg(t, 10.9, 11.3)), look: 2, lookY: lerp(5, 0, open), lid: .25 + blinkL(t, [11.6]), tilt: 3 * open, bIn: -3 * open, bOut: 3 * open })}
        ${after ? '' : held}${barCounter(1500, { depth: 150 })}${shotGlass(745, 1588, 1.2, { fill: 0 })}${after ? held : ''}</g>`;
    } },
  // 7 "figuring he'd drink himself to death in a week." — Murphy leans to Marino's ear, polishing a glass; both look down
  //   the bar at their man and smile
  { at: 11.90, draw(v, t) {
      const C = camF(t, t => [540, 1140, lerp(1.2, 1.3, ease(seg(t, 11.9, 14.4))), { hh: .6 }]);
      const sM = 1.38, sT = 1.3, lean = ease(seg(t, 12.0, 12.6));

      return `<g transform="${C.tf}">${lights(C.v, RIG_BAR(t))}${backBar(t)}
        ${who(MARINO, t, [700, behindY(1500, sT), sT], { bust: 1, armL: tHang(-1), armR: tHang(1), look: 8, lookY: 2, smirk: lerp(.2, .7, seg(t, 13.3, 13.9)), lid: .4 + blinkL(t, [12.8]), turn: .25, tilt: -2 })}
        ${who(MURPHY, t, [360, behindY(1500, sM), sM], { bust: 1, armL: tHang(-1), armR: tHang(1), turn: .35, look: lerp(10, 6, seg(t, 13.0, 13.4)), smirk: lerp(.3, .8, seg(t, 13.4, 14.0)), lid: .3 + blinkL(t, [13.0]), talk: .25 * Math.abs(Math.sin(t * 13)) * bell(t, 12.1, 13.3), tilt: 5 * lean },
          { lean: 6 * lean })}
        ${barCounter(1500, { depth: 150 })}</g>`;
    } },
  // 8 "Instead, Malloy drank nonstop and felt great." — glass after glass: up, down, the empties lining up on the bar; then
  //   he throws his arms up, beaming
  { at: 14.40, draw(v, t) {
      const C = camF(t, t => [560, lerp(1240, 1220, seg(t, 14.4, 17.83)), lerp(1.12, 1.24, ease(seg(t, 14.4, 17.83))), { hh: .6 }]);
      const s = 1.5, X = 470, Y = behindY(1560, s), sk = SKN.MALLOY, per = .8;
      const L = gripAt(1, [205, -660]), M = toMouth(1, [14, -1002], -50);
      const q = (t - 14.45) / per, u = q - Math.floor(q), n = Math.max(0, Math.floor(q));
      const drinking = t < 16.85, joy = ease(seg(t, 16.9, 17.3));
      const p = u < .3 ? ease(u / .3) : u < .55 ? 1 : u < .85 ? 1 - ease((u - .55) / .3) : 0;
      const A = drinking ? armMix(L, M, t < 14.45 ? 0 : p) : L;
      const fill = u < .3 ? .7 : u < .55 ? lerp(.7, .05, (u - .3) / .25) : .05;
      const J = jArm(1, [206, -880], [262, -1060], 'openJ', { hs: HS, spread: 1 }), JL = jArm(-1, [-206, -880], [-262, -1060], 'openJ', { hs: HS, spread: 1 });
      const RA = joy > 0 ? armMix({ ...L, hand: 'relax' }, J, joy) : { ...A, hand: 'none' }, LA = armMix(tHang(-1, 0, 0, { hs: HS }), JL, joy);
      const empties = Math.min(7, n + (drinking && u >= .85 ? 1 : 0) + (drinking ? 0 : 3)) + 1;
      let glasses = ''; for (let i = 0; i < empties; i++) glasses += shotGlass(250 + i * 92 - (i > 3 ? 360 : 0), 1600 - (i > 3 ? 40 : 0), 1.0, { fill: .06 });
      return `<g transform="${C.tf}">${lights(C.v, RIG_ROOMB(t))}<g filter="url(#dof)">${barRoom(t, { tables: 0 })}${gangTable(t, 900, 1500, { look: -6, smirk: .25, lid: .3 })}</g>
        ${who(MALLOY_BAR, t, [X, Y, s], { bust: 1, armL: LA, armR: RA, smirk: drinking ? .7 : 1, look: 1, lookY: drinking ? -5 * p : -3 * joy, lid: drinking ? .4 + .8 * p : lerp(.4, 1.6, joy), tilt: drinking ? -7 * p : 4 * joy, bIn: -3 * joy, bOut: 4 * joy, open: .25 * joy }, { top: drinking && p > 0 ? glassIn(A, 1, sk, { fill }) : '', lean: -3 * joy })}
        ${barCounter(1560, { side: 'back' })}${glasses}</g>`;
    } },
  // 9 "So they swapped his liquor" — behind the bar Murphy glances left and right, then lifts a can of antifreeze into
  //   view
  { at: 17.83, draw(v, t) {
      const z0 = 1.4, C = camF(t, t => [560, 1000, lerp(z0, 1.5, ease(seg(t, 17.83, 19.38))), { hh: .6 }]);
      const s = 2.0, Y = mcuY(1000, s, z0), up = ease(seg(t, 18.35, 18.85));
      const L = jArm(-1, [-180, -790], [-190, -560], 'grip', { hs: HS }), H = jArm(-1, [-198, -800], [-58, -962], 'grip', { hs: HS }), A = armMix(L, H, up);
      const F = fistAt(A, HS), cx = F[0] + 4, cy = F[1] + 236, R = 0;
      const look = kf(t, [[17.83, 0], [18.0, -9], [18.3, -9], [18.45, 8], [18.75, 8], [18.95, 0]]);
      return `<g transform="${C.tf}">${lights(C.v, RIG_BAR(t))}<g filter="url(#dofHeavy)">${backBar(t)}</g>
        ${who(MURPHY, t, [560, Y, s], { bust: 1, armL: { ...A, hand: 'none' }, armR: tHang(1), look, lookY: 2 * up, turn: look * .02, lid: .3, smirk: lerp(-.1, .5, seg(t, 18.9, 19.2)), bIn: 3 },
          { top: `<g transform="rotate(${F1(R)} ${F1(cx)} ${F1(cy)})">${antifreezeCan(cx, cy, 1)}</g>` + gripHandOn(A, -1, SKI, 'ir', HS) })}</g>`;
    } },
  // 10 "for pure antifreeze," — insert: it glugs green through a tin funnel into the whisky bottle
  { at: 19.38, draw(v, t) {
      const C = camF(t, t => [540, lerp(1000, 980, seg(t, 19.38, 20.83)), lerp(1.0, 1.08, ease(seg(t, 19.38, 20.83))), { hh: .4 }]);
      return `<g transform="${C.tf}">${lights(C.v, RIG_INS(t))}${pourInsert(t, seg(t, 19.4, 20.8))}</g>`;
    } },
  // 11 "then rat poison." — insert: a spoonful of white powder tipped into a shot of whisky beside the rat-poison tin
  { at: 20.83, draw(v, t) {
      const C = camF(t, t => [560, lerp(1080, 1060, seg(t, 20.83, 22.19)), lerp(1.05, 1.14, ease(seg(t, 20.83, 22.19))), { hh: .4 }]);
      return `<g transform="${C.tf}">${lights(C.v, RIG_INS(t))}${poisonInsert(t, seg(t, 20.9, 22.1))}</g>`;
    } },
  // 12 "Every night he passed out," — his eyelids sink, his head lolls and he slumps sideways; at their table the gang
  //   watch, hopeful
  { at: 22.19, draw(v, t) {
      const z0 = 1.3, C = camF(t, t => [560, 1020, lerp(z0, 1.4, ease(seg(t, 22.19, 23.6))), { hh: .5 }]);
      const s = 2.0, Y = mcuY(1020, s, z0), sl = ease(seg(t, 22.4, 23.3));
      return `<g transform="${C.tf}">${lights(C.v, RIG_ROOMB(t))}<g filter="url(#dofHeavy)">${barRoom(t, { tables: 0 })}${gangTable(t, 900, 1500, { look: -9, smirk: lerp(.2, .6, sl), lid: .25, lean: -4 * sl })}</g>
        ${who(MALLOY_BAR, t, [520, Y, s], { bust: 1, armL: tHang(-1), armR: tHang(1), lid: lerp(.9, 2, sl), smirk: .4, tilt: lerp(4, 22, sl), look: -2, lookY: 4 * sl, open: .3 * sl }, { lean: lerp(0, -14, sl), rate: .6 })}</g>`;
    } },
  // 13 "and every morning he woke up asking for another pour." — grey morning in the window; he jerks awake, beams, and
  //   holds up his empty glass for more; the gang's faces fall
  { at: 23.60, draw(v, t) {
      const z0 = 1.3, C = camF(t, t => [560, 1020, lerp(z0, 1.42, ease(seg(t, 23.6, 26.67))), { hh: .5 }]);
      const s = 2.0, Y = mcuY(1020, s, z0), wake = ease(seg(t, 24.7, 25.05)), ask = ease(seg(t, 25.5, 25.85)), sk = SKN.MALLOY;
      const L = gripAt(1, [190, -600]), H = gripAt(1, [165, -1070]), tap = Math.sin((t - 25.9) * 16) * 10 * bell(t, 25.9, 26.6);
      const A = ask > 0 ? armMix(L, H, ask) : L;
      const AA = { ...A, wr: [A.wr[0], A.wr[1] + tap * ask], el: A.el };
      return `<g transform="${C.tf}">${lights(C.v, RIG_ROOMB(t, { morning: 1 }))}<g filter="url(#dofHeavy)">${barRoom(t, { tables: 0, morning: 1 })}${gangTable(t, 900, 1500, { look: -8, smirk: lerp(.3, -.6, seg(t, 24.8, 25.3)), shock: .5 * seg(t, 24.8, 25.2), lid: lerp(1.1, .1, seg(t, 24.75, 24.95)), lean: -5 })}</g>
        ${who(MALLOY_BAR, t, [520, Y, s], { bust: 1, armL: tHang(-1), armR: { ...AA, hand: 'none' }, lid: lerp(2, 0, wake) + blinkL(t, [25.3]), smirk: lerp(.3, 1, seg(t, 25.0, 25.4)), tilt: lerp(22, 3, wake), look: lerp(-2, 2, wake), lookY: lerp(4, -2, ask), bIn: -4 * wake, bOut: 3 * ask },
          { lean: lerp(-14, 0, wake), top: ask > 0 ? glassIn(AA, 1, sk, { fill: 0 }) : '' })}</g>`;
    } },
  // 14 "Running out of money," — the register drawer rings open on two coins; a moth flutters up out of it
  { at: 26.67, draw(v, t) {
      const C = camF(t, t => [560, lerp(1150, 1170, seg(t, 26.67, 27.61)), lerp(2.3, 2.45, ease(seg(t, 26.67, 27.61))), { hh: .4 }]);
      const dr = ease(seg(t, 26.75, 26.9));
      return `<g transform="${C.tf}">${lights(C.v, RIG_BAR(t))}${backBar(t, { reg: 0 })}${cashRegister(560, 1260, 1, { drawer: dr, coins: 2, moth: dr > .5 ? 1 : 0, t, flag: dr })}</g>`;
    } },
  // 15 "they stuffed a sandwich with rotten sardines and metal carpet tacks." — from above: the sardines on rye, flies;
  //   a box of carpet tacks tipped over it, then the lid of bread
  { at: 27.61, draw(v, t) {
      const C = camF(t, t => [540, lerp(1020, 990, seg(t, 27.61, 31.27)), lerp(1.12, 1.26, ease(seg(t, 27.61, 31.27))), { hh: .35, r: lerp(-2, 1, seg(t, 27.61, 31.27)) }]);
      const p = kf(t, [[27.61, 0], [29.85, .3], [30.05, .4], [30.75, .72], [31.2, .95]], x => x);
      return `<g transform="${C.tf}">${lights(C.v, RIG_INS(t))}${sandwichInsert(t, p)}</g>`;
    } },
  // 16 "Malloy ate the whole thing and asked for seconds." — he wolfs it down, bite after bite, chewing, delighted; then
  //   one finger up: another
  { at: 31.27, draw(v, t) {
      const z0 = 1.32, C = camF(t, t => [560, 1010, lerp(z0, 1.44, ease(seg(t, 31.27, 34.02))), { hh: .5 }]);
      const s = 2.0, Y = mcuY(1010, s, z0), sk = SKN.MALLOY, ss = .95;
      const bites = [31.45, 31.95, 32.45], bite = bites.reduce((m, b) => m + seg(t, b + .12, b + .2) / 3, 0);
      const toM = bites.reduce((m, b) => Math.max(m, bell(t, b - .1, b + .35)), 0);
      const R0 = gripArm(tArm, 1, [150, -880], { hs: HS, upright: 0, bend: 'down' }), RM = gripArm(tArm, 1, [152 - 123 * bite, -1004], { hs: HS, upright: 0, bend: 'down' });
      const done = seg(t, 32.75, 32.8) >= 1, eating = !done;
      const RA = eating ? armMix(R0, RM, toM) : null;
      const up = ease(seg(t, 32.85, 33.3)), F0 = tHang(-1, 0, 0, { hs: HS }), F1u = { ...aim(tArm(-1, [-120, -1210], 'pointF', { hs: HS }), -90) };
      const LA = up > 0 ? armMix(F0, F1u, up) : F0;
      const chew = eating ? .3 * Math.abs(Math.sin(t * 15)) * (1 - toM) : .2 * Math.abs(Math.sin(t * 15)) * (1 - seg(t, 33.0, 33.3));
      const sw = eating ? (() => { const F = fistAt(RA, HS); return sandwichHeld(F[0], F[1], ss, { bite: Math.min(1, bite) }) + gripHandOn(RA, 1, sk[0], sk[1], HS); })() : '';
      return `<g transform="${C.tf}">${lights(C.v, RIG_ROOMB(t))}<g filter="url(#dofHeavy)">${barRoom(t, { tables: 0 })}${gangTable(t, 900, 1500, { look: -8, smirk: lerp(.2, -.5, seg(t, 32.9, 33.4)), shock: .4 * seg(t, 33.0, 33.4), lid: .25 })}</g>
        ${who(MALLOY_BAR, t, [520, Y, s], { bust: 1, armL: LA, armR: eating ? { ...RA, hand: 'none' } : tHang(1), open: chew + .35 * toM, smirk: eating ? .5 : lerp(.5, 1, up), lid: eating ? .5 : .3 + blinkL(t, [33.6]), tilt: eating ? 2 - 3 * toM : 4 * up, look: eating ? 0 : 2, bIn: -2, bOut: 2 * up }, { top: sw })}</g>`;
    } },
  // 17 "So they gave up on bar tricks" — the back room again: the gang slumped round the table, heads shaking
  { at: 34.02, draw(v, t) {
      const C = camF(t, t => [540, 1320, lerp(1.62, 1.72, ease(seg(t, 34.02, 35.93))), { hh: .5 }]);
      const yT = 1560, row = [[MARINO, 540, 1.0], [PASQUA, 300, 1.05], [KRIESBERG, 790, 1.05]];
      const men = row.map(([ch, x, s], i) => { const sh = Math.sin((t - 34.1 - i * .2) * 9) * bell(t, 34.2 + i * .2, 35.3 + i * .2);
        return who(ch, t, [x, behindY(yT, s) + 14, s], { bust: 1, armL: tHang(-1), armR: tHang(1), look: (i - 1) * 4 * 0 + 6 * sh, lookY: 7, smirk: -.55, lid: .8 + blinkL(t, [34.8 + i * .3]), turn: .2 * sh, tilt: 4 * sh + (i ? (i === 1 ? 5 : -5) : 0), bIn: 6 }, { lean: (i === 1 ? 4 : i === 2 ? -4 : 0), ph: i, rate: .7 }); }).join('');
      return `<g transform="${C.tf}">${lights(C.v, RIG_BACK(t))}${backRoom(t)}${men}${cardTable(540, yT, 1200)}${antifreezeCan(420, yT + 40, .8)}${shotGlass(700, yT + 44, .8, { fill: 0 })}</g>`;
    } },
  // 18 "and paid a cab driver" — at the kerb: Pasqua, leaning on the roof of a cab, shows the driver a fold of bills; the
  //   driver grins and touches his cap
  { at: 35.93, draw(v, t) {
      const C = camF(t, t => [540, lerp(1330, 1310, seg(t, 35.93, 37.02)), lerp(1.45, 1.55, ease(seg(t, 35.93, 37.02))), { hh: .5 }]);
      const ts = 1.5, tx = 540, ty = 1880, roofY = ty - 404 * ts;
      const sP = 1.0, PX = 420, PY = roofY - 100 + 1075 * sP, show = ease(seg(t, 36.0, 36.35));
      const BA = armMix(tHang(1, 0, 0, { hs: HS }), gripAt(1, [205, -1085]), show), [bx, by] = fistAt(BA, HS);
      const cap = bell(t, 36.4, 36.95), CA = armMix(tHang(1, 0, 0, { hs: HS }), { ...aim(tArm(1, [52, -1150], 'none', { hs: HS, bend: 1 }), 200), gh: 'back' }, cap);
      const interior = `<g transform="translate(${tx} ${ty}) scale(${-ts} ${ts})"><path d="M-166 -378 L296 -378 L296 -258 L-166 -258 Z" fill="#141214"/></g>`;
      const cab = who(CABBIE, t, [tx + 96 * ts, 1410 + 1075 * .62, .62], { bust: 1, armL: tHang(-1), armR: CA, turn: -.35, look: -8, lookY: -5, smirk: lerp(.2, .9, seg(t, 36.2, 36.5)), lid: .2 }, { top: cap > .05 ? gripHandOn(CA, 1, SKW, 'wt', HS) : '' });
      return `<g transform="${C.tf}">${lights(C.v, RIG_STREET(t, { extra: [{ pos: [560, 1500, 700], col: '#ffd8b0', int: .9, rad: 1400, shin: 20 }] }))}<g filter="url(#dofHeavy)">${bronxStreet(t, C, { ts: t, snowK: 0 })}</g>
        ${who(PASQUA, t, [PX, PY, sP], { bust: 1, armL: tHang(-1), armR: { ...BA, hand: 'none' }, turn: .25, look: 7, lookY: 4, smirk: .45, lid: .35 })}
        ${atb(PX, PY, sP, bills(bx, by - 30, .9, -10) + gripHandOn(BA, 1, SKW, 'wt', HS))}
        ${interior}${cab}<g transform="translate(${tx} 0) scale(-1 1) translate(${-tx} 0)">${taxiSide(tx, ty, ts, {})}</g>
        ${snowFall(t, { op: .8 })}</g>`;
    } },
  // 19 "to run him over" — Malloy weaving down the middle of the snowy street; headlights swing onto him; he turns into
  //   the glare and squints
  { at: 37.02, draw(v, t) {
      const C = camF(t, t => [540, 1460, lerp(1.0, 1.05, seg(t, 37.02, 37.75)), { hh: .5 }]);
      const hl = ease(seg(t, 37.05, 37.5)), sway = Math.sin(t * 5) * 6;
      const glow = `<g filter="url(#pe32)"><path d="M1500 1500 L340 1900 L340 2200 L1500 2300 Z" fill="#fff0c8" opacity="${F1(.35 * hl)}"/></g><g filter="url(#pe16)"><ellipse cx="520" cy="2050" rx="${F1(300 * hl + 1)}" ry="60" fill="#fff4d8" opacity="${F1(.5 * hl)}"/></g>`;
      return `<g transform="${C.tf}">${lights(C.v, RIG_STREET(t, { extra: [{ pos: [1300, 1700, 500], col: '#fff2d8', int: 3.2 * hl, rad: 1800, shin: 24 }] }))}${bronxStreet(t, C, { ts: t })}${glow}
        ${who(MALLOY, t, [520 + sway, 2060, .58], { armL: tHang(-1), armR: hl > .5 ? shadeArm() : tHang(1), turn: lerp(-.1, .35, hl), look: lerp(-3, 8, hl), squint: hl, lid: .4 + .5 * hl, smirk: .3, tilt: sway * .4 }, { lean: sway * .5, top: hl > .5 ? gripHandOn(shadeArm(), 1, SKI, 'ir', HS) : '' })}</g>`;
    } },
  // 20 "at forty-five miles an hour." — the cab rushes at us down the dark street, its lamps swelling to white
  { at: 37.75, draw(v, t) {
      const p = seg(t, 37.75, 39.36), k = Math.pow(p, 2.2), sc = lerp(.22, 2.6, k), gl = seg(t, 38.85, 39.36);
      const C = camF(t, t => [540, 960, 1.0 + .06 * seg(t, 37.75, 39.36), { hh: .4, ...SHK(t, [[38.6, 6, .8], [39.0, 12, .4]]) }]);
      flashK(Math.pow(gl, 1.7) * .97, '#fff8ec');
      return `<g transform="${C.tf}">${lights(C.v, RIG_STREET(t, { extra: [{ pos: [540, 960, 600], col: '#fff2d8', int: 1 + 6 * k, rad: 1400, shin: 24 }] }))}${streetDepth(t)}
        ${taxiFront(540, lerp(1010, 1950, k), sc, { glare: gl })}${snowFall(t * 2.5, { op: .9, wind: 0 })}</g>`;
    } },
  // 21 "Three weeks later," — the same street in grey daylight, the snow deeper, quiet; the speakeasy door
  { at: 39.36, draw(v, t) {
      const C = camF(t, t => [560, lerp(1220, 1260, seg(t, 39.36, 40.35)), lerp(1.3, 1.42, ease(seg(t, 39.36, 40.35))), { hh: .4 }]);
      return `<g transform="${C.tf}">${lights(C.v, RIG_SNOWDAY(t))}${bronxStreet(t, C, { day: 1, ts: t, snowK: .5 })}</g>`;
    } },
  // 22 "he walked right back through the doors, thirsty again." — the door swings open on the snow: Malloy, his head
  //   bandaged, walks in grinning, comes to the bar and lifts a finger
  { at: 40.35, draw(v, t) {
      const C = camF(t, t => { const p = ease(seg(t, 40.5, 42.6)); return [lerp(500, 540, p), lerp(1130, 1180, p), lerp(1.0, 1.22, p), { hh: .5 }]; });
      const door = ease(seg(t, 40.45, 40.75)), w = ease(seg(t, 40.85, 42.35)), st = stride(t, .5, 20);
      const yF = lerp(1380, 2660, w), s = (yF - 674) / 1283, x = lerp(345, 480, w);
      const fin = ease(seg(t, 42.4, 42.75)), FA = armMix(tHang(-1, 0, 0, { hs: HS }), aim(tArm(-1, [-120, -1210], 'pointF', { hs: HS }), -90), fin);
      const walking = w > 0 && w < 1;
      return `<g transform="${C.tf}">${lights(C.v, RIG_ROOMB(t))}${barRoom(t, { tables: 0, door })}
        ${gangTable(t, 900, 1500, { look: -9, smirk: -.4, shock: .7 * seg(t, 40.9, 41.3), lid: 0 })}
        ${who(MALLOY_BAND, t, [x, yF + (walking ? st.bob * 2 * s : 0), s], { armL: FA, armR: tHang(1), ...(walking ? st : {}), smirk: .85, look: 1, lid: .3 + blinkL(t, [41.9]), tilt: walking ? 3 * Math.sin(t * 6) : 3 })}
        ${barCounter(1560, { side: 'back' })}${shotGlass(640, 1620, 1.0, { fill: 0 })}</g>`;
    } },
  // 23 "They finally killed him with a gas hose while he slept" — a cold rented room: the gas cock opens; the camera
  //   follows the rubber hose down to the pillow where he sleeps; the shadows of two men fall across the bed
  { at: 43.21, draw(v, t) {
      const C = camF(t, t => { const p = ease(seg(t, 43.25, 45.0)); return [lerp(820, 560, p), lerp(400, 960, p), lerp(1.9, 1.3, p), { hh: .4 }]; });
      const R = roomingHouse(t, { shadow: ease(seg(t, 44.4, 45.6)), hiss: ease(seg(t, 43.35, 43.7)) });
      return `<g transform="${C.tf}">${lights(C.v, RIG_BED(t))}${R.back}
        ${who(MALLOY_SLEEP, t, [540, 870 + 1075 * 1.6, 1.6], { bust: 1, armL: tHang(-1), armR: tHang(1), lid: 2, open: .15, smirk: .1, tilt: -4, lookY: 0 }, { rate: .5 })}${R.front}</g>`;
    } },
  // 24 "and only got caught because they couldn't stop bragging around town" — at the bar the gang toast and roar with
  //   laughter; behind them the door opens on two policemen; the laughter dies
  { at: 46.08, draw(v, t) {
      const C = camF(t, t => [520, lerp(1340, 1300, seg(t, 46.08, 49.25)), lerp(1.42, 1.52, ease(seg(t, 46.08, 49.25))), { hh: .5 }]);
      const door = ease(seg(t, 47.7, 48.2)), cops = ease(seg(t, 47.9, 48.5)), turn = ease(seg(t, 48.45, 48.8));
      const yc = 1560, laugh = k => .6 + .4 * Math.abs(Math.sin(t * 7 + k)), clink = ease(seg(t, 46.2, 46.6)) * (1 - ease(seg(t, 48.5, 48.9)));
      const man = (ch, x, s, k, sk, i, ph) => { const L = gripAt(k, [k * 196, -600]), H = gripAt(k, [k * 165, -960]), A = armMix(L, H, clink);
        const lt = laugh(ph) * (1 - turn);
        return who(ch, t, [x, behindY(yc, s), s], { bust: 1, armL: k < 0 ? { ...A, hand: 'none' } : tHang(-1), armR: k > 0 ? { ...A, hand: 'none' } : tHang(1), smirk: lerp(1, -.35, turn), open: .3 * lt * (1 - turn),
          lid: lerp(.9, 0, turn) * lt, tilt: (4 * Math.sin(t * 7 + ph) * (1 - turn)) + i * 2, look: lerp(-k * 6, -9, turn), turn: lerp(-k * .15, -.4, turn), shock: .6 * turn, lookY: lerp(-3, 0, turn) },
          { top: clink > .02 ? glassIn(A, k, sk, { fill: .5 }) : '', ph }); };
      const copsSVG = door > .01 ? `<clipPath id="copc"><rect x="${F1(250 + 190 * (1 - door))}" y="700" width="${F1(190 * door)}" height="740"/></clipPath><g clip-path="url(#copc)">${who(COP2, t, [395, 1385 + 12 * cops, .52], { armL: tHang(-1), armR: tHang(1), lid: .3, smirk: -.2, look: 3 })}${who(COP, t, [300, 1375 + 14 * cops, .52], { armL: tHang(-1), armR: tHang(1), lid: .2, smirk: -.3, look: 4 })}</g>` : '';
      return `<g transform="${C.tf}">${lights(C.v, RIG_ROOMB(t))}<g filter="url(#dof)">${barRoom(t, { tables: 0, door })}</g>${copsSVG}
        ${man(KRIESBERG, 120, 1.15, 1, SKN.W, 0, 0)}${man(FIFTH, 900, 1.12, -1, SKN.W, 1, 2)}${man(PASQUA, 680, 1.2, -1, SKN.W, 2, 4)}
        ${barCounter(yc, { side: 'back' })}</g>`;
    } },
  // 25 "about the man who wouldn't die." — the front page spins in out of the dark and slaps down on the desk: THE MAN WHO
  //   WOULDN'T DIE (= frame 0)
  { at: 49.25, draw(v, t) {
      const land = 50.42, e = easeOut(seg(t, 49.28, land)), bounce = t > land ? .03 * Math.exp(-(t - land) / .09) * Math.cos((t - land) * 30) * (1 - seg(t, 50.8, 50.95)) : 0;
      const sc = lerp(.04, 1, e) * (1 + bounce), rot = lerp(-820, 0, e);
      const C = camF(t, t => [540, 960, 1.0, { hh: .4, ...SHK(t, [[land, 9, .3]]) }], 0);
      const ghosts = t < land ? [1, 2, 3].map(k => { const e2 = easeOut(seg(t - k * .022, 49.28, land)); return `<g transform="translate(540 960) rotate(${F1(lerp(-820, 0, e2))}) scale(${F1(lerp(.04, 1, e2))})"><rect x="-490" y="-750" width="980" height="1500" fill="#e6dcc2" opacity="${F1(.22 / k)}"/></g>`; }).join('') : '';
      return `<g transform="${C.tf}">${lights(C.v, RIG_PAPER(t))}${paperDesk(t)}${ghosts}
        <g transform="translate(540 960) rotate(${F1(rot)}) scale(${(sc).toFixed(4)}) translate(-540 -960)">${frontPage(t, 540, 960)}</g></g>`;
    } },
];

// transitions: [cut, from, to, style, options]. Plain cuts between shots (no whips, zooms or punch-ins: nothing should
// announce itself as a transition); the cab's headlamps fade through white into the daylight street.
const CUTS = [2.60, 3.85, 6.12, 8.21, 10.12, 11.90, 14.40, 17.83, 19.38, 20.83, 22.19, 23.60, 26.67, 27.61, 31.27, 34.02, 35.93, 37.02, 37.75, 39.36, 40.35, 43.21, 46.08, 49.25];
const TRANS = CUTS.map(c => c === 39.36 ? [c, c - .06, c + .06, 'flash', { col: '#fff8ec', decay: .3 }] : [c, c - .03, c + .03, 'cut']);

TL = makeTimeline({ shots: SHOTS, trans: TRANS, words: WORDS.map(([a, w, b]) => [a, w]), strong: STRONG, captions: 'none', fps: 30, duration: DUR });
render(0);
