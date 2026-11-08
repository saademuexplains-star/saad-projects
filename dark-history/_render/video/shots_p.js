// "The Heroin Bottle" part 1: your hand takes the bottle down from the kitchen shelf while your daughter coughs in the
// next room -> through its amber glass to a globe where the bans spread from country to country -> the red show globe
// in a sunny pharmacy window: the pharmacist holds up the most trusted cough medicine, a mother pays, and the cheerful
// cherub carton is set beside a skull-labelled morphine bottle that he slides away.
// Rules kept: the camera moves on every line, the bottle's word stays hidden until the very end (turned away or under a
// fist), hands are rigid on what they hold and drawn over what they rest on, no cut is felt.
(function (G) {
  const X = G.ENG, Q = G.QCAST, S = G.SETS, PR = G.PROPS, C = G.CINE, R = G.RIG;
  const { track: TK, ss, clamp, lerp, EZ } = X;
  const { f, mix, rng, shade } = R;
  const TAU = Math.PI * 2, D2R = Math.PI / 180;
  // ---- helper header
  const wave = (t, hz, ph = 0) => Math.sin(TAU * hz * t + ph);
  const env = (t, a, b, c, d) => ss(a, b, t) * (1 - ss(c, d, t));
  const bump = (t, t0, a = 1, len = 0.35) => (t < t0 || t > t0 + len) ? 0 : a * Math.pow(Math.sin(Math.PI * (t - t0) / len), 2);
  const idle = (t, seed, amp = 1) => ({ blink: Q.blink(t, seed), breath: Q.breath(t * 1.1 + seed) * 0.6, sway: X.noise(t * 0.45, seed) * 0.5 * amp });
  const hh = (c, t, amp = 1, seed = 0) => { const h = X.hand(t, amp, seed); return (X.CAM = [c[0] + h[0], c[1] + h[1], c[2], (c[3] || 0) + h[2]]); };
  const scr = (w, c, p = 1) => { const [cx, cy, z] = c, zp = Math.pow(z, p), px = 540 + (cx - 540) * p, py = 960 + (cy - 960) * p; return [540 + (w[0] - px) * zp, 960 + (w[1] - py) * zp]; };
  const nrm = v => { const n = Math.hypot(v[0], v[1]) || 1; return [v[0] / n, v[1] / n]; };
  const L2 = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
  const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k];
  const HAND = Q.HAND;
  const gripAt = (o, who, Gw, dW, extra = {}) => { const dl = nrm(R.dirLocal(o, dW)), gl = R.toLocal(o, Gw), gy = 0.33 * (typeof who === 'number' ? who : HAND[who]); return Object.assign({ hand: [gl[0] - dl[0] * gy, gl[1] - dl[1] * gy], dir: dl, pose: 'grip', facing: 'back' }, extra); };
  const fingersFor = (side, facing, thumb) => { const t = (side === 'R' ? -1 : 1) * (facing === 'palm' ? 1 : -1); return [-thumb[1] * t, thumb[0] * t]; };
  const handAt = (o, Ww, dW, extra = {}) => Object.assign({ hand: R.toLocal(o, Ww), dir: nrm(R.dirLocal(o, dW)), pose: 'relaxed', facing: 'back' }, extra);
  const handsLit = (p, L, which = 'RL', view = true) => C.lit({ svg: (which.includes('R') ? p.handR || '' : '') + (which.includes('L') ? p.handL || '' : ''), info: p.info }, Object.assign(view ? { view: X.viewRect(1) } : {}, L)).body;
  const CAM = (pk, zk) => { const P = TK(pk), Z = TK(zk); return t => { const p = P(t); return [p[0], p[1], Z(t), p[2]]; }; };
  const lit = X.lit;
  const mixArm = (a, b, k) => Object.assign({}, k < 0.5 ? a : b, { hand: L2(a.hand, b.hand, k), dir: nrm(L2(a.dir || [0, 1], b.dir || [0, 1], k)) });
  const dith = t => { const r = rng(Math.round(t * 60) * 7 + 5); return `<rect x="${-Math.floor(r() * 300)}" y="${-Math.floor(r() * 300)}" width="1380" height="2220" filter="url(#grain)" opacity="0.045"/>`; };
  // the body without its cast shadow (people whose feet are hidden behind furniture), and arms redrawn over furniture
  const litBody = (P, L) => C.lit(P, Object.assign({ view: X.viewRect(1) }, L)).body;
  const armsOver = (P, L, which = 'RL') => C.lit({ svg: (which.includes('R') ? P.armRsvg : '') + (which.includes('L') ? P.armLsvg : ''), info: P.info }, Object.assign({ view: X.viewRect(1) }, L)).body;
  // the bottle drawn in the world on its axis a (unit vector base -> neck), its grip point (118 local units up the
  // axis, the middle of the body) at Gp; the syrup stays level with the tilt; the fist is drawn over it
  const bottleAt = (Gp, a, s, t, o = {}) => { const lie = Math.atan2(a[0], -a[1]) / D2R, b = add(Gp, a, -118 * s); return PR.heroinBottle(b[0], b[1], s, t, Object.assign({}, o, { lie, tilt: lie })); };
  const MOUTH = 182, BASEUP = 118;   // the mouth's and the grip's distances up the bottle's axis from its grip / base
  // a point of a prop held in the grip frame: slot + thumb axis * px + finger axis * py (prop units * person scale)
  const holdPt = (Gp, thumb, fing, s, px, py) => [Gp[0] + thumb[0] * px * s + fing[0] * py * s, Gp[1] + thumb[1] * px * s + fing[1] * py * s];
  const LT = {
    // the oil lamp on the kitchen table, from the right; the window's blue night on the left
    kitchen: { from: [0.85, -0.3], shadow: '#0c0806', shadowOp: 0.45, floor: '#140c06', floorOp: 0.3, contactOp: 0.4, key: '#ffcf90', keyAdd: 0.07, rims: [{ from: [1, -0.3], col: '#ffb060', w: 7, op: 0.55 }, { from: [-1, -0.2], col: '#7a8ab8', w: 4, op: 0.3 }], face: { col: '#ffd0a0', op: 0.15 } },
    // the bedside candle from the left, moonlight from the right
    bed: { from: [-0.85, -0.25], shadow: '#0c0806', shadowOp: 0.42, floor: '#140c06', floorOp: 0.3, contactOp: 0.4, key: '#ffc890', keyAdd: 0.07, rims: [{ from: [-1, -0.2], col: '#ffa860', w: 7, op: 0.55 }, { from: [1, -0.4], col: '#a8b8e8', w: 6, op: 0.45 }], face: { col: '#ffd8b0', op: 0.14 } },
    // daylight through the shop window on the left
    shop: { from: [-0.8, -0.5], shadow: '#1a120c', shadowOp: 0.38, floor: '#22160e', floorOp: 0.28, contactOp: 0.38, key: '#fff4e0', keyAdd: 0.05, rims: [{ from: [-1, -0.2], col: '#fff0d0', w: 7, op: 0.5 }, { from: [1, -0.3], col: '#ffc890', w: 4, op: 0.3 }], face: { col: '#ffeedd', op: 0.12 } },
    // gaslight from above at night
    gas: { from: [0.2, -0.9], shadow: '#08060a', shadowOp: 0.5, floor: '#0c0806', floorOp: 0.32, contactOp: 0.42, key: '#ffc880', keyAdd: 0.07, rims: [{ from: [-1, -0.3], col: '#7a90c8', w: 6, op: 0.45 }, { from: [1, -0.4], col: '#ffb060', w: 6, op: 0.5 }], face: { col: '#ffcf9a', op: 0.15 } },
    // the green-shaded lamp from the right and the fire from the left
    docs: { from: [0.7, -0.5], shadow: '#06060a', shadowOp: 0.5, floor: '#0a0806', floorOp: 0.3, contactOp: 0.42, key: '#ffe0a8', keyAdd: 0.06, rims: [{ from: [-1, -0.1], col: '#ff8a3a', w: 7, op: 0.55 }, { from: [1, -0.4], col: '#d8e8c8', w: 5, op: 0.35 }], face: { col: '#ffd8a8', op: 0.13 } },
  };
  G.SHOTS_P = { wave, env, bump, idle, hh, scr, nrm, L2, add, gripAt, fingersFor, handAt, handsLit, CAM, mixArm, dith, litBody, armsOver, bottleAt, holdPt, MOUTH, BASEUP, LT };
  const up = [0, -1];

  // ======================================================= KIT1: the bottle on the kitchen shelf (-0.7 - 3.35)
  // "The bottle on your kitchen shelf has one word printed on it,"
  {
    const B = S.HM, MO = { x: -10, y: 1900, s: 0.82 }, BW = 0.45;
    const SHELF_G = [B.BOTTLE[0], B.BOTTLE[1] - BASEUP * BW];
    // her hand closes on the bottle (GRAB), lifts it off the shelf (LIFT) and brings it up beside her face
    const GRAB = 0.16, LIFT = 0.42;
    // off the shelf (up over its lip first), then down to her chest where she can look at it
    const gp = TK([[-0.7, SHELF_G], [LIFT, SHELF_G], [0.66, [SHELF_G[0] - 14, SHELF_G[1] - 22], 'out2'], [1.45, [96, 1034], 'io'], [3.4, [102, 1028], 'sine']]);
    // the bottle turns in her fingers to read it: 180 (label to the wall) -> 230 (label toward her face, only its plain
    // margin catches the light from our side)
    const rot = t => 180 + 50 * EZ.io(ss(1.55, 2.25, t));
    const cam = CAM([[-0.7, [126, 906, 0]], [1.45, [56, 948, 0], 'sine'], [2.3, [66, 952, 0], 'sine'], [3.35, [96, 1010, 0], 'in2']],
      [[-0.7, 2.52], [1.45, 2.1, 'sine'], [2.3, 2.36, 'sine'], [3.35, 3.1, 'in2']]);
    const fn = t => {
      const c = hh(cam(t), t, 0.28, 3), L = LT.kitchen;
      const set = S.home(t, { cal: 0 });
      const mO = Object.assign(idle(t, 3, 0.35), MO, { lightX: 1 });
      const g = gp(t);
      const gA = gripAt(mO, 'you', g, fingersFor('L', 'back', up), { detachHand: true });
      let armL;
      if (t < GRAB) { const reach = EZ.io(clamp((t + 0.7) / (GRAB + 0.7))); armL = mixArm({ hand: [150, -800], dir: [-0.1, 1], pose: 'relaxed', facing: 'back', detachHand: true }, Object.assign({}, gA, { pose: 'relaxed' }), reach); }
      else armL = gA;
      // the cough from the next room: her eyes flick toward the door, then back to the bottle; then she reads it
      const glance = env(t, 0.12, 0.3, 0.62, 0.85), read = ss(1.55, 2.0, t);
      const look = glance > 0.5 ? [0.95, -0.05] : t < 0.9 ? [0.62, 0.05] : [0.42, 0.62];
      const face = { expr: 'anxious', look, lid: lerp(0.14, 0.3, ss(0.9, 1.4, t)), mouth: read > 0.5 ? 'parted' : 'tight', open: 0.05 * read, brows: [lerp(8, 5, read), lerp(-1, 1, read)] };
      const P = Q.you(Object.assign({}, mO, { tilt: 5 * ss(0.9, 1.5, t) - 3 * glance + 2, face, armL, armR: { hand: [-150, -790], dir: [0.1, 1], pose: 'relaxed', facing: 'back' } }));
      // the bottle goes between her arm and her fingers: drawn under the body it sank behind her shoulder once she held it up
      const bottle = bottleAt(g, up, BW, t, { rot: rot(t), level: 0.82, light: 1 });
      const chars = Q.withArt(P, mO, Q.youArt(mO), lit(P, L)) + bottle + handsLit(P, L, 'L');
      return X.compose(X.stage(set, chars), c) + C.vignette(0.52) + dith(t);
    };
    X.shot('KIT1', -0.7, 3.35, fn, { grade: 'gNight' });
    G.KIT1_BOTTLE = tt => scr(add(gp(tt), [0, 14]), cam(tt));
    G.KIT1_SHELF = SHELF_G; G.KIT1_CAM = cam;
  }

  // ======================================================= GLOBE: the bans spread over the earth (2.65 - 6.35)
  // "a word that almost every country on earth will one day ban, but"
  {
    const B = S.GS, [gx, gy, gsc] = B.GLOBE;
    // continents redden one after another (groups: 0 N.America, 1 Europe, 2 Asia, 3 S.America, 4 Africa, 5 Australia, 6 Greenland)
    const ORDER = [[1, 3.12], [0, 3.5], [2, 3.85], [3, 4.2], [4, 4.5], [5, 4.85], [6, 5.0]];
    const redAt = t => { const r = [0, 0, 0, 0, 0, 0, 0]; for (const [k, t0] of ORDER) r[k] = EZ.io(ss(t0, t0 + 0.5, t)); return r; };
    // the globe spins under the camera; at "ban" it lurches on (as if struck)
    const lon = t => -70 + 24 * (t - 2.65) + 28 * EZ.io(ss(5.05, 6.2, t));
    const cam = CAM([[2.65, [548, 1236, 0]], [4.25, [600, 1212, 1.4], 'sine'], [5.45, [548, 1232, -0.6], 'io'], [6.35, [540, 1246, 0], 'in2']],
      [[2.65, 1.28], [4.25, 1.6, 'sine'], [5.45, 1.88, 'io'], [6.35, 2.65, 'in2']]);
    const fn = t => {
      const c0 = cam(t), jolt = bump(t, 5.5, 1, 0.28);
      const c = hh([c0[0], c0[1] + 9 * jolt, c0[2], c0[3]], t, 0.25, 31), red = redAt(t);
      const set = S.globeRoom(t, { red });
      const globe = PR.globe(gx, gy, gsc, t, { lon: lon(t), red });
      return X.compose(X.stage(set, globe), c) + C.vignette(0.5) + dith(t);
    };
    X.shot('GLOBE', 2.65, 6.35, fn, { grade: 'gHall' });
    G.GLOBE_C = tt => scr([gx, gy], cam(tt));
  }
  X.tr('lens', 3.0, 0.7, 'KIT1', 'GLOBE', { fa: G.KIT1_BOTTLE(3.0), fb: G.GLOBE_C(3.0), za: 1.5 });

  // ======================================================= PHARM: the most trusted cough medicine (5.75 - 12.15)
  // "right now it's the most trusted cough medicine money can buy, the label swears it's safer than morphine,"
  {
    const B = S.PH, PO = { x: 790, y: 2150, s: 0.84 }, CO = { x: 330, y: 2280, s: 0.86 }, DO = { x: -130, y: 2340, s: 0.9 };
    const BW = 0.84 * 0.55, CART = [620, 1452, 0.7], MORPH = 760;
    // the show globe's bulb sits on the window layer (p 0.88); the camera centre that puts it mid-screen
    const p = 0.88, sgx = 540 + (B.GLOBE_RED[0] - 540) / p, sgy = 960 + (B.GLOBE_RED[1] - 960) / p;
    const cam = CAM([[5.75, [sgx, sgy, 0]], [6.95, [-420, 1180, 0], 'sine'], [8.2, [520, 1182, 0], 'io'], [9.3, [570, 1250, 0], 'sine'], [10.3, [700, 1362, 0], 'io'], [11.85, [648, 1374, 0], 'sine'], [12.2, [646, 1374, 0], 'sine']],
      [[5.75, 2.9], [6.95, 1.2, 'sine'], [8.2, 1.32, 'io'], [9.3, 1.6, 'sine'], [10.3, 2.5, 'io'], [11.85, 3.0, 'sine'], [12.2, 3.05, 'sine']]);
    // his bottle stands on the counter; he lifts it up beside his face, shows it off and sets it back down
    const BOT0 = [520, 1452 - BASEUP * BW];
    const bp = TK([[5.75, BOT0], [6.6, BOT0], [7.1, [640, 1128], 'io'], [8.3, [634, 1120], 'sine'], [8.85, BOT0, 'io'], [12.2, BOT0]]);
    // the coins she lays down; the morphine bottle he slides away; his finger tapping the carton
    const coinK = t => ss(8.5, 8.62, t), slide = t => EZ.io(ss(10.55, 11.15, t));
    const fn = t => {
      const c = hh(cam(t), t, 0.25, 41), L = LT.shop;
      const set = S.pharmacy(t, {});
      // ---- the pharmacist behind the counter: his hands stay above it (clasped at rest), so they are always drawn
      // over the counter, arms and all
      const pO = Object.assign(idle(t, 5, 0.3), PO);
      const g = bp(t), gA = gripAt(pO, 'pharmacist', g, fingersFor('R', 'back', up), { detachHand: true });
      const restR = { hand: [-34, -930], dir: [0.75, 0.45], pose: 'relaxed', facing: 'back', detachHand: true };
      const restL = { hand: [34, -930], dir: [-0.75, 0.45], pose: 'relaxed', facing: 'back', detachHand: true };
      // tapping the carton's top edge with his forefinger (the wrist above it, the finger pointing down)
      const tapY = 1205 + 12 * (bump(t, 10.0, 1, 0.18) + bump(t, 10.24, 1, 0.18));
      const tapArm = handAt(pO, [CART[0] + 18, tapY], [-0.15, 1], { pose: 'point', facing: 'back', detachHand: true });
      let armR;
      if (t < 6.6) armR = mixArm(restR, Object.assign({}, gA, { pose: 'relaxed' }), EZ.io(ss(6.25, 6.6, t)));
      else if (t < 8.9) armR = gA;
      // his finger stays on the carton into the morph: bringing the hand back to his chest swings the elbow from out at
      // his side to under the shoulder, a flip of a few frames however slow the blend
      else armR = mixArm(mixArm(Object.assign({}, gA, { pose: 'relaxed' }), restR, EZ.io(ss(8.9, 9.3, t))), tapArm, EZ.io(ss(9.45, 9.9, t)));
      // his left hand takes the morphine bottle by its neck and slides it away
      const mx = MORPH + 120 * slide(t), mGrip = [mx, 1452 - 80];
      const slideArm = gripAt(pO, 'pharmacist', mGrip, fingersFor('L', 'back', up), { detachHand: true });
      const onM = EZ.io(ss(10.2, 10.5, t)) * (1 - EZ.sine(ss(11.25, 11.75, t)));
      const armL = mixArm(restL, Object.assign({}, slideArm, { pose: t > 10.45 && t < 11.3 ? 'grip' : 'relaxed' }), onM);
      const talking = t > 6.9 && t < 8.35, proud = ss(6.6, 7.0, t);
      const pFace = { expr: 'neutral', look: t < 8.4 ? [-0.55, 0.05] : t < 9.4 ? [-0.6, 0.35] : [-0.35, 0.7], lid: 0.3, mouth: talking ? 'talk' : 'smile', open: Q.talk(t, 0.2, 6), brows: [-2 * proud, 3 * proud] };
      const PP = Q.pharmacist(Object.assign({}, pO, { tilt: -3 * proud + 2 * Math.sin(t * 1.3), face: pFace, armR, armL }));
      // ---- the mother at the counter, coins in her hand; the man in the bowler waiting by the door
      const cO = Object.assign(idle(t, 7, 0.3), CO);
      const coinPt = [462, 1440];
      const payK = EZ.io(ss(8.2, 8.55, t)) * (1 - EZ.io(ss(8.75, 9.2, t)));
      const cArmL = mixArm({ hand: [120, -900], dir: [-0.3, 0.9], pose: 'fist', facing: 'back' }, handAt(cO, add(coinPt, [-22, -30]), [0.5, 0.8], { pose: 'relaxed', facing: 'back' }), payK);
      const hope = ss(8.6, 9.1, t);
      const cFace = { expr: 'anxious', look: t < 7.0 ? [0.6, -0.25] : t < 8.6 ? [0.75, -0.3] : [0.7, 0.15], lid: 0.16, mouth: hope > 0.5 ? 'smile' : 'tight', brows: [lerp(7, 3, hope), 0] };
      const CP = Q.parents[2].mk(Object.assign({}, cO, { tilt: 3 * hope - 2, face: cFace, armL: cArmL, armR: { hand: [-150, -790], dir: [0.15, 1], pose: 'relaxed', facing: 'back' } }));
      const dO = Object.assign(idle(t, 9, 0.3), DO);
      const DP = Q.parents[3].mk(Object.assign({}, dO, { face: { expr: 'tired', look: t < 8.9 ? [0.8, -0.1] : [0.9, 0.05], lid: 0.3 }, armR: { hand: [-140, -800], dir: [0.1, 1], pose: 'relaxed', facing: 'back' }, armL: { hand: [140, -800], dir: [-0.1, 1], pose: 'relaxed', facing: 'back' } }));
      // ---- draw: him (body only; the counter hides his legs), his bottle, the counter and what is on it, his hands,
      // then the customers in front of the counter
      const bottle = bottleAt(g, up, BW, t, { rot: 180, level: 0.85, light: -1 });
      const morph = PR.morphineBottle(mx, 1452, 0.62);
      const carton = PR.carton(CART[0], CART[1], CART[2]);
      const coins = coinK(t) > 0.01 ? [0, 1, 2].map(i => `<ellipse cx="${coinPt[0] + i * 4}" cy="${coinPt[1] + 8 - i * 7}" rx="17" ry="6" fill="#c8a040" stroke="#5a4010" stroke-width="1.5" opacity="${f(coinK(t))}"/>`).join('') : '';
      let chars = Q.withArt(PP, pO, Q.pharmArt, litBody(PP, L)) + S.counter17(t, {}) + carton + morph + coins + bottle;
      chars += armsOver(PP, L, 'RL') + handsLit(PP, L, 'RL');
      chars += Q.withArt(DP, dO, Q.parents[3].art, lit(DP, L)) + Q.withArt(CP, cO, Q.parents[2].art, lit(CP, L));
      return X.compose(X.stage(set, chars), c) + C.vignette(0.45) + dith(t);
    };
    X.shot('PHARM', 5.75, 12.15, fn, { grade: 'gDay' });
    G.PHARM_SG = tt => scr(B.GLOBE_RED, cam(tt), p);
    G.PHARM_CHERUB = tt => scr([CART[0], CART[1] - 120 * CART[2]], cam(tt));
  }
  X.tr('zmatch', 6.05, 0.6, 'GLOBE', 'PHARM', { fa: G.GLOBE_C(6.05), fb: G.PHARM_SG(6.05), za: 2.4, zb: 2.2, seed: 17, blur: 4 });
})(window);
