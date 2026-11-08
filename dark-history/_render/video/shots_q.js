// "The Cells That Never Died" part 1: you in your Sunday suit, hands on hips, laughing (the photograph the film ends
// on), your five children around you -> the doctor rings the shadow on the X-ray -> inside you the tumour grows -> the
// dome of Johns Hopkins, down to its side door for Black patients -> asleep on the operating table, the surgeon glances
// round and takes a piece of the tumour into a glass dish -> it is carried down the corridor to the tissue culture lab ->
// you wake in the ward and nobody tells you -> the cancer spreads -> the seasons pass in the ward window and you die ->
// your children at the rainy window, waiting.
// Rules kept: the camera moves on every line, hands rigid on what they hold and drawn over what they rest on, people
// behind the table are drawn before it, nobody's name appears before the last line, no cut is felt.
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
  const litBody = (P, L) => C.lit(P, Object.assign({ view: X.viewRect(1) }, L)).body;
  const armsOver = (P, L, which = 'RL') => C.lit({ svg: (which.includes('R') ? P.armRsvg : '') + (which.includes('L') ? P.armLsvg : ''), info: P.info }, Object.assign({ view: X.viewRect(1) }, L)).body;
  const drawP = (P, o, art, L) => Q.withArt(P, o, art, lit(P, L));
  const bodyP = (P, o, art, L) => Q.withArt(P, o, art, litBody(P, L));
  const rawP = (P, o, art) => `<g filter="url(#skinS)">${Q.withArt(P, o, art, P.svg)}</g>`;
  // characters go in after the set's solid layers and before its light and foreground layers
  const stage2 = (set, chars, p = 1) => { const i = set.findIndex(L => L.light || L.p > 1.05); const c = { p, svg: chars, chars: true }; return i < 0 ? [...set, c] : [...set.slice(0, i), c, ...set.slice(i)]; };
  // a point in a close hand's hold frame (the frame P.closeArm / R.hand draw `hold` in)
  const holdW = (wrist, dir, Sz, side, facing, rot, px, py) => {
    const d = nrm(dir), O = add(wrist, d, 0.33 * Sz), tt = (side === 'R' ? -1 : 1) * (facing === 'palm' ? 1 : -1), r = rot * D2R;
    const qx = px * Math.cos(r) - py * Math.sin(r), qy = px * Math.sin(r) + py * Math.cos(r), lx = [d[1], -d[0]];
    return [O[0] + lx[0] * tt * qx + d[0] * qy, O[1] + lx[1] * tt * qx + d[1] * qy];
  };
  const scalpel = (k = 1) => `<g transform="scale(${f(k)})"><rect x="-150" y="-7" width="170" height="14" rx="5" fill="#a8b0b6" stroke="#2a2e32" stroke-width="2"/><path d="M-130,-3 L0,-3" stroke="#e8eef0" stroke-width="2" opacity="0.7"/><path d="M20,-5 L70,-4 C95,-2 112,4 118,10 C100,10 60,8 20,6Z" fill="#dfe6ea" stroke="#2a2e32" stroke-width="2"/></g>`;
  const LT = {
    // the front window on the right, morning
    home: { from: [0.8, -0.5], shadow: '#1a120c', shadowOp: 0.36, floor: '#22160e', floorOp: 0.26, contactOp: 0.36, key: '#fff2dc', keyAdd: 0.05, rims: [{ from: [1, -0.3], col: '#fff0d0', w: 7, op: 0.5 }, { from: [-1, -0.2], col: '#c8d0e0', w: 4, op: 0.25 }], face: { col: '#ffeedd', op: 0.12 } },
    // the blind and the viewing box
    clinic: { from: [0.7, -0.6], shadow: '#121418', shadowOp: 0.36, floor: '#181a1c', floorOp: 0.26, contactOp: 0.36, key: '#f4f8ff', keyAdd: 0.05, rims: [{ from: [1, -0.3], col: '#fff4e0', w: 6, op: 0.45 }, { from: [-1, -0.4], col: '#e0f0ff', w: 5, op: 0.35 }], face: { col: '#f4f8ff', op: 0.12 } },
    // the lamp over the side door, the cold dusk behind
    dusk: { from: [0.2, -0.6], shadow: '#0e0a10', shadowOp: 0.42, floor: '#120c10', floorOp: 0.3, contactOp: 0.4, key: '#ffd8a0', keyAdd: 0.07, rims: [{ from: [-1, -0.3], col: '#8aa0d8', w: 6, op: 0.45 }, { from: [1, -0.2], col: '#ffc080', w: 6, op: 0.45 }], face: { col: '#ffd8a8', op: 0.15 } },
    // the operating lamp straight above
    or: { from: [0.05, -1], shadow: '#060a08', shadowOp: 0.45, floor: '#0a0e0c', floorOp: 0.3, contactOp: 0.4, key: '#fff6e0', keyAdd: 0.08, rims: [{ from: [0, -1], col: '#fffaf0', w: 8, op: 0.55 }, { from: [-1, 0.2], col: '#8ab8a0', w: 4, op: 0.3 }], face: { col: '#fff4e4', op: 0.18 } },
    // the ward window on the left
    ward: { from: [-0.75, -0.5], shadow: '#121410', shadowOp: 0.36, floor: '#1a1a14', floorOp: 0.26, contactOp: 0.36, key: '#fff4e0', keyAdd: 0.05, rims: [{ from: [-1, -0.3], col: '#fff2d8', w: 7, op: 0.5 }, { from: [1, -0.2], col: '#c8d0e0', w: 4, op: 0.25 }], face: { col: '#ffeedd', op: 0.13 } },
    // the children at night: the street lamp cold on their faces, the room lamp warm behind them
    window: { from: [-0.3, -0.3], shadow: '#06080e', shadowOp: 0.3, floor: '#080a10', floorOp: 0.2, contactOp: 0.3, key: '#a8bce0', keyAdd: 0.03, rims: [{ from: [0.8, -0.5], col: '#ffb060', w: 9, op: 0.7 }, { from: [-0.8, -0.5], col: '#ffc070', w: 7, op: 0.5 }], face: { col: '#b8c8e8', op: 0.1 } }
  };
  // hands on hips, the full forearm (fs) so the elbows stand out
  const AKIMBO = { armR: { hand: [-120, -840], dir: [0.7, 0.7], pose: 'relaxed', facing: 'back', fs: 1, elbow: 'free' }, armL: { hand: [120, -840], dir: [-0.7, 0.7], pose: 'relaxed', facing: 'back', fs: 1, elbow: 'free' } };
  // in bed, sitting up against the pillows: the hip stays at HIP whatever the lean
  const HIP = [230, 1470];
  const bedO = (sway, extra = {}) => { const s = 0.62, a = sway * D2R, ly = -470 * s, dx = -ly * Math.sin(a), dy = ly * Math.cos(a); return Object.assign({}, extra, { x: HIP[0] - dx, y: HIP[1] - dy, s, outfit: 'gown', sway, noLegs: true }); };
  // the bed's grey wool blanket and the turned-down sheet over her from the waist (wx, wy) to the foot of the bed
  const blanket = (t, wx, wy) => {
    const top = `M${f(wx - 50)},${f(wy + 8)} C${f(wx + 40)},${f(wy - 6)} ${f(wx + 120)},1400 ${f(wx + 230)},1414 C540,1426 780,1412 920,1404 C950,1376 984,1378 996,1404 C1006,1432 1010,1466 1010,1488`;
    let g = `<path d="${top} L1012,1612 C800,1630 400,1616 ${f(wx - 60)},1604Z" fill="#aab6be" stroke="#20140c" stroke-width="2"/>`;
    for (let i = 0; i < 7; i++) { const x = wx + 120 + i * 120; g += `<path d="M${f(x)},${f(1418 + Math.sin(i) * 6)} C${f(x + 10)},1480 ${f(x - 6)},1540 ${f(x + 6)},1606" stroke="${i % 2 ? '#8e9aa2' : '#c8d2d8'}" stroke-width="${i % 2 ? 8 : 5}" fill="none" opacity="0.7"/>`; }
    g += `<path d="M${f(wx - 50)},${f(wy + 8)} C${f(wx + 40)},${f(wy - 6)} ${f(wx + 120)},1400 ${f(wx + 230)},1414 L${f(wx + 228)},1452 C${f(wx + 120)},1440 ${f(wx + 40)},${f(wy + 40)} ${f(wx - 54)},${f(wy + 52)}Z" fill="#f4f4ee" stroke="#20140c" stroke-width="1.6"/>`;
    return g + `<path d="M${f(wx + 240)},1420 C540,1432 780,1418 918,1410" stroke="#e8eef0" stroke-width="5" fill="none" opacity="0.5"/>`;
  };
  G.SHOTS_Q = { wave, env, bump, idle, hh, scr, nrm, L2, add, gripAt, fingersFor, handAt, handsLit, CAM, mixArm, dith, litBody, armsOver, drawP, bodyP, rawP, stage2, holdW, scalpel, LT, AKIMBO };
  const up = [0, -1];

  // ======================================================= HOME: you, thirty, in your Sunday suit (-0.7 - 2.61)
  // "You're thirty years old, a mother of five,"
  const HOME_O = { x: 470, y: 1960, s: 0.62, outfit: 'suit' };
  {
    const LO = { x: 110, y: 1950, s: 0.58 }, EO = { x: 880, y: 1975, s: 0.8 }, SO = { x: 200, y: 2050, s: 0.58 }, DO = { x: 760, y: 2080, s: 0.45 };
    // the push in (already moving at frame 0, and through the photograph at the end), then out to the whole family
    const cam = CAM([[-0.7, [470, 1392, 0]], [1.05, [470, 1404, 0], 'sine'], [2.4, [560, 1520, -0.6], 'io'], [2.8, [575, 1528, -0.7], 'out']],
      [[-0.7, 2.3], [1.05, 2.56, 'sine'], [2.4, 1.0, 'io'], [2.8, 0.96, 'out']]);
    const SKIRT = R.toWorld(HOME_O, [-150, -430]);
    const fn = t => {
      const c = hh(cam(t), t, 0.32, 1), L = LT.home;
      const set = S.home51(t, { day: 1, radio: 1 });
      // you: a laugh for the camera; at "mother of five" a look down to your little boy and back
      const glance = env(t, 1.15, 1.35, 1.8, 2.05);
      const oH = Object.assign(idle(t, 5, 0.4), HOME_O, AKIMBO, { tilt: 2 - 4 * glance, face: { mouth: 'grin', look: glance > 0.5 ? [-0.45, 0.6] : [0.04, 0.02], lid: 0.18, brows: [2 * glance, 0] } });
      const PH = Q.henrietta(oH);
      // Lawrence (16) with baby Joe asleep in his arms; he looks down at him, then up at us
      const oL = Object.assign(idle(t, 11, 0.3), LO, { face: { mouth: 'smile', look: t < 1.4 ? [0.2, 0.7] : [0.1, 0.05], lid: t < 1.4 ? 0.42 : 0.24 }, armR: { hand: [-20, -930], dir: [1, 0.1], pose: 'open', facing: 'back' }, armL: { hand: [60, -1020], dir: [-0.4, 0.9], pose: 'open', facing: 'back', detachHand: true } });
      const PL = Q.lawrence(oL), bp = R.toWorld(oL, [16, -1032]);
      // Elsie grinning up at her mother; Sonny reaches for her skirt; Deborah hugs her rag doll
      const oE = Object.assign(idle(t, 17, 0.4), EO, { face: { mouth: 'grin', look: t < 1.6 ? [-0.75, -0.3] : [-0.1, 0], lid: 0.12 } });
      const reach = EZ.io(ss(1.3, 1.75, t));
      const sArm = mixArm({ hand: [110, -330], dir: [0.1, 1], pose: 'relaxed', facing: 'back' }, handAt(SO, SKIRT, [0.75, 0.4], { pose: 'fist' }), reach);
      const oS = Object.assign(idle(t, 23, 0.4), SO, { face: { mouth: 'smile', look: [0.55, -0.8], lid: 0.1 }, armL: sArm });
      const oD = Object.assign(idle(t, 29, 0.3), DO, { face: { mouth: 'smile', look: [-0.2, -0.1], lid: 0.14 }, armR: { hand: [-26, -372], dir: [0.9, 0.2], pose: 'relaxed', facing: 'back', detachHand: true }, armL: { hand: [40, -360], dir: [-0.9, 0.3], pose: 'relaxed', facing: 'back', detachHand: true } });
      const PD = Q.deborah(oD), dl = R.toWorld(oD, [8, -300]);
      let chars = drawP(PL, oL, Q.lawrenceArt, L) + PR.baby(bp[0], bp[1], LO.s, t, { rot: -20 }) + handsLit(PL, L, 'L');
      chars += drawP(PH, oH, Q.henriettaArt(oH), L) + drawP(Q.elsie(oE), oE, Q.elsieArt, L) + drawP(Q.sonny(oS), oS, Q.sonnyArt, L);
      chars += drawP(PD, oD, Q.deborahArt, L) + PR.ragDoll(dl[0], dl[1], 0.62, -8) + handsLit(PD, L);
      return X.compose(X.stage(set, chars), c) + C.vignette(0.5) + dith(t);
    };
    X.shot('HOME', -0.7, 2.61, fn, { grade: 'gDay' });
    G.HOME_CAM = cam;
  }

  // ======================================================= CLINIC: the doctor rings the shadow on the X-ray (2.01 - 3.54)
  // "when doctors find"
  {
    const B = S.CL, DOC = { x: 150, y: 1930, s: 0.62 }, HEN = { x: 920, y: 1960, s: 0.6, outfit: 'coat' };
    const MASS = [B.BOX[0] + B.BOX[2] / 2 + 8, B.BOX[1] + B.BOX[3] / 2 + 26];
    const cam = CAM([[2.0, [650, 1300, 0]], [3.0, [585, 1110, 0.4], 'sine'], [3.6, [560, 1010, 0.6], 'in2']], [[2.0, 0.9], [3.0, 1.12, 'sine'], [3.6, 1.5, 'in2']]);
    const fn = t => {
      const c = hh(cam(t), t, 0.3, 7), L = LT.clinic;
      const set = S.clinic(t, { film: 1, ring: EZ.io(ss(2.5, 3.05, t)) });
      // he points at the film and draws the ring; you hold your belly and stare at it
      const oD = Object.assign(idle(t, 31, 0.3), DOC, { face: { expr: 'grim', look: [0.85, -0.45], lid: 0.3, brows: [8, -2] }, armL: { hand: [250, -1210], dir: [0.95, -0.3], pose: 'point', facing: 'back' } });
      const oH = Object.assign(idle(t, 5, 0.3), HEN, { face: { expr: 'anxious', mouth: 'tight', look: [-0.8, -0.45], lid: 0.2, brows: [10, 2] }, armR: { hand: [-10, -720], dir: [0.95, 0.3], pose: 'relaxed', facing: 'back' }, armL: { hand: [150, -760], dir: [-0.5, 1], pose: 'relaxed', facing: 'back' } });
      const chars = drawP(Q.doctor(oD), oD, Q.doctorArt, L) + drawP(Q.henrietta(oH), oH, Q.henriettaArt(oH), L);
      return X.compose(X.stage(set, chars), c) + C.vignette(0.5) + dith(t);
    };
    X.shot('CLINIC', 2.01, 3.54, fn, { grade: 'gDay' });
    G.CLINIC_MASS = tt => scr(MASS, cam(tt), 0.9);
  }
  X.tr('carry', 2.31, 0.6, 'HOME', 'CLINIC', { mode: 'pan', dir: [1, 0], dist: 0.42, blur: 12 });

  // ======================================================= INSIDE: the tumour growing inside you (2.94 - 4.97)
  // "a tumor growing inside you."
  {
    const SP = S.IN.SPOT;
    const cam = CAM([[2.9, [560, 1400, 0]], [4.0, [562, 1372, 0.5], 'sine'], [5.0, [560, 1300, 1.0], 'io']], [[2.9, 1.95], [4.0, 1.55, 'sine'], [5.0, 1.22, 'io']]);
    const fn = t => {
      const c = hh(cam(t), t, 0.3, 21);
      const set = S.inside(t);
      const tum = PR.tumor(SP[0], SP[1], 1.1, t, { grow: lerp(0.28, 1, EZ.io(ss(3.15, 4.5, t))) });
      return X.compose(stage2(set, tum), c) + C.vignette(0.6, '#1a0204') + dith(t);
    };
    X.shot('INSIDE', 2.94, 4.97, fn, { grade: 'gHall' });
    G.INSIDE_SPOT = tt => scr(SP, cam(tt));
  }
  X.tr('zmatch', 3.24, 0.6, 'CLINIC', 'INSIDE', { fa: G.CLINIC_MASS(3.24), fb: G.INSIDE_SPOT(3.24), za: 2.6, zb: 2.4, leak: '#ffb0a0', leakOp: 0.3 });

  // ======================================================= HOPKINS: the dome, down to the side door for Black patients (4.33 - 8.66)
  // "The only hospital nearby that treats Black patients is Johns Hopkins,"
  {
    const B = S.HK, HEN = { x: 560, y: 1790, s: 0.56, outfit: 'coat' }, DAY = { x: 790, y: 1800, s: 0.58 };
    const cam = CAM([[4.3, [545, 40, 0]], [5.95, [605, 1240, 0.3], 'io'], [7.95, [640, 1330, 0], 'sine'], [8.7, [652, 1310, -0.3], 'sine']], [[4.3, 0.66], [5.95, 1.0, 'io'], [7.95, 1.18, 'sine'], [8.7, 1.24, 'sine']]);
    const SH = R.toWorld(HEN, [95, -1077]);
    const fn = t => {
      const c = hh(cam(t), t, 0.3, 13), L = LT.dusk;
      const set = S.hopkins(t, {});
      // you look up at the sign over the door, then up at the building; he keeps a hand on your shoulder
      const upK = ss(6.9, 7.3, t), atSign = ss(5.6, 5.9, t);
      const oH = Object.assign(idle(t, 5, 0.3), HEN, { tilt: -4 * upK, face: { expr: 'anxious', mouth: 'tight', look: upK > 0.5 ? [0.05, -0.95] : atSign > 0.5 ? [0.35, -0.75] : [0.6, -0.1], lid: 0.2, brows: [10, 2] }, armR: { hand: [-60, -760], dir: [0.6, 0.8], pose: 'relaxed', facing: 'back' }, armL: { hand: [40, -770], dir: [-0.6, 0.8], pose: 'relaxed', facing: 'back' } });
      const oY = Object.assign(idle(t, 37, 0.3), DAY, { tilt: -3 * upK, face: { expr: 'stern', mouth: 'closed', look: upK > 0.5 ? [-0.1, -0.9] : [-0.8, -0.1], lid: 0.24 }, armR: handAt(DAY, SH, [-0.2, 1], { pose: 'relaxed' }) });
      const chars = drawP(Q.henrietta(oH), oH, Q.henriettaArt(oH), L) + drawP(Q.day(oY), oY, Q.dayArt, L);
      return X.compose(X.stage(set, chars), c) + C.vignette(0.55) + dith(t);
    };
    X.shot('HOPKINS', 4.33, 8.66, fn, { grade: 'gDusk' });
    G.HK_DOME = tt => scr(B.DOME, cam(tt), 0.62);
    G.HK_DOOR = tt => scr([B.DOOR[0] + B.DOOR[2] / 2, B.DOOR[1] + 150], cam(tt));
  }
  X.tr('morph', 4.65, 0.64, 'INSIDE', 'HOPKINS', { fa: G.INSIDE_SPOT(4.65), fb: G.HK_DOME(4.65), za: 1.5, zb: 1.4, col: '#ffe8d0' });

  // ======================================================= ORa: asleep on the table; the surgeon glances round (7.94 - 11.36)
  // "and while you lie asleep on the table, a surgeon quietly"
  const OR_HEN = { x: 821, y: 1308, s: 0.6, outfit: 'gown', sway: -90 };
  const OR_WIN = [560, 1250];
  {
    const B = S.OS, SU = { x: 560, y: 1835, s: 0.62 }, NU = { x: 905, y: 1830, s: 0.6 };
    const cam = CAM([[7.9, [410, 860, 0]], [9.0, [140, 1250, -0.4], 'io'], [9.95, [152, 1262, -0.5], 'sine'], [10.85, [520, 1110, 0.3], 'io'], [11.4, [560, 1170, 0.4], 'in2']],
      [[7.9, 1.1], [9.0, 1.78, 'io'], [9.95, 1.95, 'sine'], [10.85, 1.55, 'io'], [11.4, 1.72, 'in2']]);
    const DISH_G = [952, 1218];
    const fn = t => {
      const c = hh(cam(t), t, 0.28, 17), L = LT.or;
      const set = S.or51s(t, { lamp: 1 });
      // the surgeon: eyes left, right, then down to his work; his hands at the window in the drape
      const look = t < 10.25 ? [0, 0.85] : t < 10.55 ? [-0.85, -0.05] : t < 10.85 ? [0.85, -0.05] : [0.05, 0.9];
      const oS = Object.assign(idle(t, 41, 0.25), SU, { face: { expr: 'stern', look, lid: 0.3, brows: [6, -4] }, armR: handAt(SU, [OR_WIN[0] - 44, OR_WIN[1] - 8 + 4 * Math.sin(t * 3)], [0.35, 0.94], { pose: 'relaxed', detachHand: true }), armL: handAt(SU, [OR_WIN[0] + 40, OR_WIN[1] - 12], [-0.3, 0.95], { pose: 'relaxed', detachHand: true }) });
      const PS = Q.surgeon(oS);
      // the nurse holds the glass dish ready by its rim
      const nArm = gripAt(NU, 'orNurse', DISH_G, fingersFor('L', 'back', [-1, 0]), { hold: PR.cultureDish(116 * 0.62, 17 * 0.62, 0.62, t, { lid: 0, fill: 0.6 }) });
      const oN = Object.assign(idle(t, 43, 0.25), NU, { face: { expr: 'neutral', look: [-0.8, 0.4], lid: 0.24 }, armL: nArm, armR: { hand: [-40, -800], dir: [0.5, 0.86], pose: 'relaxed', facing: 'back' } });
      // you, asleep, breathing with the bag
      const oH = Object.assign({ breath: 0.5 + 0.5 * Math.sin(t * 1.6) }, OR_HEN, { face: { lid: 1, mouth: 'closed', expr: 'neutral' } });
      const PH = Q.henrietta(oH);
      const back = bodyP(PS, oS, Q.surgeonArt, L) + bodyP(Q.orNurse(oN), oN, Q.orNurseArt, L);
      const front = S.orTable(t) + rawP(PH, oH, Q.henriettaArt(oH)) + S.orDrape(t, OR_WIN[0]) + handsLit(PS, L);
      return X.compose(stage2(set, back + front), c) + C.vignette(0.55) + dith(t);
    };
    X.shot('ORa', 7.94, 11.36, fn, { grade: 'gHall' });
    G.OR_LAMP = tt => scr(B.LAMP, cam(tt), 0.97);
    G.OR_HANDS = tt => scr(OR_WIN, cam(tt));
  }
  X.tr('radial', 8.3, 0.72, 'HOPKINS', 'ORa', { fa: G.HK_DOOR(8.3), fb: G.OR_LAMP(8.3), za: 1.15, zb: 1.2, soft: 0.45, leak: '#fff4dc', leakOp: 0.25 });

  // ======================================================= ORb: the forceps lift a piece of the tumour into the dish (10.76 - 13.06)
  // "cuts off a piece of your tumor"
  {
    const SPOT = [520, 1250], DISH = [880, 1580], GL = '#c8b088', SL = '#b2c6ae', SZ = 230, FK = 1.25;
    // the forceps' tips: down at the spot, lifted, carried over the dish, lowered into it, then away
    const tip = TK([[10.7, [500, 1215]], [11.25, [522, 1248], 'io'], [11.85, [600, 1050], 'io'], [12.3, [870, 1360], 'io'], [12.55, [878, 1520], 'io'], [13.1, [800, 1180], 'io']]);
    const axis = TK([[10.7, [0.55, 0.84]], [11.85, [0.62, 0.78], 'io'], [12.55, [0.2, 0.98], 'io'], [13.1, [0.4, 0.9], 'io']]);
    const cam = CAM([[10.7, [540, 1190, 0]], [12.0, [640, 1260, 0.6], 'sine'], [13.1, [720, 1330, 0.8], 'sine']], [[10.7, 0.98], [12.0, 1.06, 'sine'], [13.1, 1.12, 'sine']]);
    const fn = t => {
      const c = hh(cam(t), t, 0.3, 23);
      // the drape filling the frame, the gauze window and the place the piece is taken from, the tray and the dish
      let bg = `<rect x="-800" y="-600" width="2700" height="3200" fill="#4e7a64"/>`;
      for (let i = 0; i < 16; i++) { const x = -700 + i * 170; bg += `<path d="M${x},-600 C${x + 30},400 ${x - 30},1400 ${x + 10},2600" stroke="${i % 2 ? '#3e6654' : '#6a9a80'}" stroke-width="${i % 2 ? 40 : 22}" fill="none" opacity="0.6"/>`; }
      bg += `<path d="M300,1100 L760,1120 L740,1420 L290,1400Z" fill="#f2eee4" stroke="#20140c" stroke-width="2"/>` + Array.from({ length: 8 }, (_, i) => `<path d="M${310 + i * 56},1110 L${300 + i * 56},1400" stroke="#ddd6c6" stroke-width="3"/>`).join('');
      const taken = ss(11.3, 11.6, t);
      bg += `<ellipse cx="${SPOT[0]}" cy="${SPOT[1] + 6}" rx="44" ry="20" fill="#6a1a22" opacity="${f(0.45 + 0.2 * taken)}" filter="url(#b2)"/><ellipse cx="${SPOT[0]}" cy="${SPOT[1] + 4}" rx="24" ry="10" fill="#8a2a30" opacity="${f(0.8 * (1 - taken))}"/>`;
      bg += `<path d="M640,1520 L1500,1520 L1500,2600 L600,2600Z" fill="#9aa2a6" stroke="#20140c" stroke-width="2"/><path d="M640,1520 L1500,1520" stroke="#eef2f4" stroke-width="6" opacity="0.6"/>`;
      const dropped = ss(12.52, 12.62, t);
      bg += PR.cultureDish(DISH[0], DISH[1] + 30, 1.25, t, { lid: 0, fill: 0.62, tissue: dropped }) + `<g transform="translate(1100,1560) rotate(-8)">${PR.cultureDish(0, 0, 1.1, t, { lid: 0, fill: 0 })}</g>`;
      if (t > 12.55 && t < 13.1) { const k = (t - 12.55) / 0.55; bg += `<ellipse cx="${DISH[0]}" cy="${DISH[1] - 6}" rx="${f(40 + 80 * k)}" ry="${f(6 + 10 * k)}" fill="none" stroke="#ffd0d8" stroke-width="3" opacity="${f(0.6 * (1 - k))}"/>`; }
      // the gloved hand with the forceps (the piece rides in the tips until it is let go)
      const tp = tip(t), ax = nrm(axis(t)), dir = fingersFor('R', 'back', ax), slot = add(tp, ax, -152 * FK), wrist = PR.wristFor(slot, dir, SZ);
      const held = 1 - dropped, open = 0.06 + 0.3 * ss(12.5, 12.65, t);
      const arm = PR.closeArm({ from: add(wrist, nrm(dir), -900), wrist, dir, side: 'R', facing: 'back', pose: 'grip', size: SZ, skin: GL, sleeve: SL, hold: PR.forceps(FK, { tissue: held * ss(11.25, 11.4, t), open }) });
      // the other hand with the scalpel makes the cut, then draws back
      const sOut = EZ.io(ss(11.45, 12.0, t)), sTip = L2([SPOT[0] - 24, SPOT[1] + 2 - 8 * Math.sin(Math.max(0, Math.min(1, (t - 10.9) / 0.5)) * Math.PI)], [180, 1500], sOut), sAx = nrm([0.5, 0.3]);
      const sDir = fingersFor('L', 'back', sAx), sSlot = add(sTip, sAx, -118 * 1.1), sWrist = PR.wristFor(sSlot, sDir, SZ);
      const arm2 = PR.closeArm({ from: add(sWrist, nrm(sDir), -900), wrist: sWrist, dir: sDir, side: 'L', facing: 'back', pose: 'grip', size: SZ, skin: GL, sleeve: SL, hold: scalpel(1.1) });
      const light = C.radial(560, 900, 1300, '#fff6e0', 0.3, 'screen') + C.radial(SPOT[0], SPOT[1], 500, '#fff8e8', 0.2, 'screen');
      return X.compose([{ p: 0.92, svg: bg }, { p: 1, svg: arm2 + arm, chars: true }, { p: 0.92, light: true, svg: light }], c) + C.vignette(0.55) + dith(t);
    };
    X.shot('ORb', 10.76, 13.06, fn, { grade: 'gHall' });
    G.ORB_TIP = tt => scr(tip(tt), cam(tt));
  }
  X.tr('push', 11.06, 0.6, 'ORa', 'ORb', { fa: G.OR_HANDS(11.06), fb: G.ORB_TIP(11.06), za: 2.4, zb: 0.62, fade: [0.36, 0.64], blur: 7 });

  // ======================================================= HALL: carried down the corridor to the lab (12.46 - 14.81)
  // "and sends it down the hall to a lab."
  {
    const SZ = 210, SK = '#f0caa8', SL = '#ecece6';
    const camX = TK([[12.4, 3500], [13.9, 5700, 'lin'], [14.5, 6150, 'out'], [14.9, 6205, 'out']]);
    const fn = t => {
      const c = hh([camX(t), 1130, 1.12, 0], t, 0.25, 29);
      const set = S.corr51(t, {}), back = set.filter(L => L.p <= 1.05), front = set.filter(L => L.p > 1.05);
      // the hand, a step at a time (a gentle bob), the dish level in its fingers; it slows at the lab door
      const walk = 1 - ss(14.0, 14.5, t), bobY = 8 * Math.sin(TAU * 1.9 * t) * walk, bobX = 4 * Math.sin(TAU * 0.95 * t) * walk;
      const slot = [470 + bobX, 1140 + bobY], dir = fingersFor('R', 'back', [1, 0.04]), wrist = PR.wristFor(slot, dir, SZ);
      const arm = PR.closeArm({ from: add(wrist, nrm([-0.55, -0.83]), 900), wrist, dir, side: 'R', facing: 'back', pose: 'grip', size: SZ, skin: SK, sleeve: SL, hold: PR.cultureDish(116 * 0.95, 17 * 0.95, 0.95, t, { lid: 1, fill: 0.6, tissue: 1 }) });
      return X.compose(back, c) + `<g filter="url(#skinS)">${arm}</g>` + X.compose(front, c) + C.vignette(0.5) + dith(t);
    };
    X.shot('HALL', 12.46, 14.81, fn, { grade: 'gHall' });
  }
  X.tr('wipe', 12.76, 0.6, 'ORb', 'HALL', { dir: 1, truck: 200, obj: (x, u) => `<g filter="url(#dof3)"><path d="M${f(x - 620)},-200 C${f(x - 560)},600 ${f(x - 640)},1400 ${f(x - 600)},2200 L${f(x + 600)},2200 C${f(x + 640)},1400 ${f(x + 560)},600 ${f(x + 620)},-200Z" fill="#eef0ea"/><path d="M${f(x - 200)},-200 L${f(x - 230)},2200" stroke="#c8ccc4" stroke-width="60"/></g>` });

  // ======================================================= WARD1: you wake; nobody asks, nobody tells (14.21 - 16.6)
  // "Nobody asks you. Nobody tells you."
  const BED = (t, L) => PR.bedSide(-60, 1900, 1100, 1) + PR.bedCabinet(-240, 1900, 1);
  {
    const DOC = { x: 1290, y: 1790, s: 0.52 }, NUR = { x: 1440, y: 1796, s: 0.5 };
    const cam = CAM([[14.2, [420, 1250, 0]], [15.4, [300, 1190, -0.4], 'sine'], [16.6, [760, 1300, 0.3], 'io']], [[14.2, 1.18], [15.4, 1.5, 'sine'], [16.6, 0.88, 'io']]);
    const fn = t => {
      const c = hh(cam(t), t, 0.28, 33), L = LT.ward;
      const set = S.wardS(t, { season: 0.03, cal: 2, day: 1, clock: 9 + t * 0.02 });
      // you come round: heavy lids, a look up, a hand to the dressing, then toward the doctor at the door
      const wake = EZ.io(ss(14.25, 15.1, t)), toDoc = ss(15.55, 15.75, t);
      const oH = bedO(-24, Object.assign(idle(t, 5, 0.2), { tilt: 6 - 4 * toDoc, face: { expr: 'anxious', mouth: 'parted', open: 0.04, look: toDoc > 0.5 ? [0.95, 0.05] : [0.1, -0.5], lid: lerp(0.85, 0.32, wake), brows: [12, 2] }, ill: 0.1 }));
      oH.armR = handAt(oH, [214, 1420], [0.9, 0.35], { pose: 'relaxed' });
      oH.armL = handAt(oH, L2([330, 1400], [262, 1372], EZ.io(ss(14.8, 15.3, t))), [-0.6, 0.8], { pose: 'relaxed' });
      const PH = Q.henrietta(oH), wst = R.toWorld(oH, [0, -830]);
      // the doctor and the nurse talk over her chart at the far end; one glance at her, then away
      const glance = env(t, 15.7, 15.85, 16.05, 16.2);
      const oD = Object.assign(idle(t, 47, 0.3), DOC, { face: { expr: 'neutral', mouth: 'talk', open: Q.talk(t, 0.22, 7), look: glance > 0.5 ? [-0.95, 0.05] : [0.9, 0.05], lid: 0.22 }, armR: { hand: [40, -880], dir: [0.9, 0.3], pose: 'relaxed', facing: 'back' }, armL: { hand: [130, -900], dir: [-0.6, 0.8], pose: 'relaxed', facing: 'back' } });
      const oN = Object.assign(idle(t, 53, 0.3), NUR, { face: { expr: 'neutral', mouth: 'closed', look: [-0.9, 0.05], lid: 0.24 } });
      const far = drawP(Q.wardDoc(oD), oD, null, L) + drawP(Q.wardNurse(oN), oN, Q.wardNurseArt, L) + `<rect x="${DOC.x + 30}" y="${DOC.y - 470}" width="60" height="80" fill="#f4f0e4" stroke="#6a5030" stroke-width="5" transform="rotate(-12 ${DOC.x + 60} ${DOC.y - 430})"/>`;
      // (leaning, so drawn raw: the lighting pass clips to the upright box and would cut her head off)
      const near = BED(t, L) + rawP(PH, oH, Q.henriettaArt(oH)) + blanket(t, wst[0], wst[1]) + `<g filter="url(#skinS)">${PH.armRsvg}${PH.armLsvg}</g>`;
      return X.compose(stage2(set, `${far}${near}`), c) + C.vignette(0.5) + dith(t);
    };
    X.shot('WARD1', 14.21, 16.6, fn, { grade: 'gDay' });
    G.WARD1_BELLY = tt => scr([300, 1440], cam(tt));
  }
  X.tr('eyelid', 14.51, 0.6, 'HALL', 'WARD1', {});

  // ======================================================= SPREAD: the cancer creeps outward (15.92 - 18.22)
  // "Your cancer spreads fast,"
  {
    const SP = S.IN.SPOT;
    const cam = CAM([[15.9, [560, 1420, 0]], [17.6, [560, 1330, -0.8], 'io'], [18.25, [555, 1300, -1.0], 'out']], [[15.9, 1.6], [17.6, 0.82, 'io'], [18.25, 0.78, 'out']]);
    const fn = t => {
      const c = hh(cam(t), t, 0.3, 37);
      const set = S.inside(t), sp = EZ.io(ss(16.25, 17.85, t));
      const tum = PR.tumor(SP[0], SP[1], 1.1, t, { grow: 1 + 0.25 * sp, spread: sp }) + C.radial(SP[0], SP[1], 900, '#2a0610', 0.3 * sp, 'multiply');
      return X.compose(stage2(set, tum), c) + C.vignette(0.62, '#1a0204') + dith(t);
    };
    X.shot('SPREAD', 15.92, 18.22, fn, { grade: 'gHall' });
    G.SPREAD_SPOT = tt => scr(SP, cam(tt));
  }
  X.tr('liquid', 16.26, 0.68, 'WARD1', 'SPREAD', { fa: G.WARD1_BELLY(16.26), fb: G.SPREAD_SPOT(16.26), col: '#5a0810', seed: 11 });

  // ======================================================= MONTHS: the seasons pass in the window; you die (17.58 - 21.11)
  // "and a few months later, at just thirty-one, you die,"
  {
    const ill = t => lerp(0.15, 0.95, EZ.io(ss(17.9, 20.0, t))), lean = t => lerp(-24, -30, EZ.io(ss(17.9, 20.2, t)));
    const headAt = tt => R.toWorld(bedO(lean(tt)), [0, -1268]);
    const H1 = headAt(20.4);
    const cam = CAM([[17.55, [420, 1180, 0]], [20.45, [H1[0] + 20, H1[1] + 40, -0.6], 'sine'], [21.15, [H1[0] + 18, H1[1] + 44, -0.7], 'sine']], [[17.55, 0.8], [20.45, 2.45, 'sine'], [21.15, 2.55, 'sine']]);
    const fn = t => {
      const c = hh(cam(t), t, 0.26, 39), L = LT.ward;
      // February to October: the trees in the window, the calendar pages, the clock; night falls as you go
      const m = Math.min(7.999, 8 * EZ.sine(ss(17.85, 19.95, t))), mi = Math.floor(m);
      const day = lerp(1, 0.18, EZ.io(ss(19.7, 20.65, t)));
      const set = S.wardS(t, { season: lerp(0.04, 1, EZ.sine(ss(17.85, 19.95, t))), calOld: 2 + mi, calNew: 3 + mi, flip: ss(0.45, 1, m - mi), day, clock: 9 + (t - 17.55) * 2.2 });
      // you grow thin and tired; at "you die" your eyes close and your head sinks into the pillow
      const k = ill(t), die = EZ.io(ss(20.25, 20.7, t));
      const oH = bedO(lean(t), Object.assign(idle(t, 5, 0.15 * (1 - die)), { ill: k, tilt: 6 + 7 * die, face: { expr: 'tired', mouth: 'closed', look: [0.3 * (1 - die), -0.2], lid: lerp(lerp(0.3, 0.55, k), 1, die), brows: [lerp(6, 12, k) * (1 - die), 0] } }));
      if (die > 0) oH.blink = 0;
      oH.armR = handAt(oH, [214, 1420], [0.9, 0.35], { pose: 'relaxed' });
      oH.armL = handAt(oH, [262, 1372 + 10 * die], [-0.6, 0.8], { pose: 'relaxed' });
      const PH = Q.henrietta(oH), wst = R.toWorld(oH, [0, -830]);
      // flowers by the bed, wilting with the months
      const wl = EZ.io(ss(18.2, 19.9, t));
      let fl = `<path d="M-268,1520 L-280,1440 C-278,1420 -238,1420 -236,1440 L-246,1520Z" fill="#c8d8e0" fill-opacity="0.6" stroke="#20140c" stroke-width="1.6"/>`;
      for (let i = 0; i < 5; i++) { const a = (i - 2) * 0.32 + wl * (0.9 + i * 0.1) * (i < 2 ? -1 : 1), L0 = 90 + i * 8, bx = -258 + Math.sin(a) * L0, by = 1440 - Math.cos(a) * L0; fl += `<path d="M-258,1440 Q${f(-258 + Math.sin(a) * L0 * 0.4)},${f(1440 - L0 * 0.7)} ${f(bx)},${f(by)}" stroke="${mix('#4a7a3a', '#7a6a3a', wl)}" stroke-width="4" fill="none"/><circle cx="${f(bx)}" cy="${f(by)}" r="${f(12 - 4 * wl)}" fill="${mix(['#e8c040', '#e86a7a', '#f4f0e8'][i % 3], '#8a6a4a', wl)}" stroke="#20140c" stroke-width="1.2"/>`; }
      const near = BED(t, L) + fl + rawP(PH, oH, Q.henriettaArt(oH)) + blanket(t, wst[0], wst[1]) + `<g filter="url(#skinS)">${PH.armRsvg}${PH.armLsvg}</g>`;
      return X.compose(stage2(set, near), c) + C.vignette(0.52 + 0.1 * die) + dith(t);
    };
    X.shot('MONTHS', 17.58, 21.1, fn, { grade: 'gDay' });
    G.MONTHS_FACE = tt => scr(headAt(tt), cam(tt));
    G.MONTHS_BED = tt => scr([500, 1450], cam(tt));
  }
  X.tr('organic', 17.9, 0.64, 'SPREAD', 'MONTHS', { fa: G.SPREAD_SPOT(17.9), fb: G.MONTHS_BED(17.9), za: 1.1, zb: 0.92, seed: 5, freq: 0.004 });

  // ======================================================= KIDS: your children at the rainy window, waiting (20.5 - 22.7)
  // "leaving your children behind."
  {
    const DO = { x: 300, y: 1488, s: 0.42 }, SO = { x: 430, y: 1502, s: 0.52 }, LO = { x: 600, y: 1628, s: 0.48 }, EO = { x: 765, y: 1544, s: 0.66 };
    const cam = CAM([[20.45, [540, 985, 0]], [22.75, [545, 1045, 0.4], 'sine']], [[20.45, 0.84], [22.75, 1.04, 'sine']]);
    const fn = t => {
      const c = hh(cam(t), t, 0.22, 43), L = LT.window;
      const set = S.homeWin(t, { rain: 1 });
      const oD = Object.assign(idle(t, 29, 0.3), DO, { face: { expr: 'anxious', mouth: 'closed', look: [0.1, 0], lid: 0.16, brows: [8, 0] } });
      const oS = Object.assign(idle(t, 23, 0.3), SO, { face: { expr: 'anxious', mouth: 'tight', look: [0.05, -0.05], lid: 0.2, brows: [12, 2] }, armL: { hand: [60, -560], dir: [0.1, -1], pose: 'open', facing: 'palm' } });
      const oL = Object.assign(idle(t, 11, 0.3), LO, { face: { expr: 'grief', mouth: 'closed', look: t < 21.4 ? [0.1, 0.7] : [0, 0], lid: t < 21.4 ? 0.5 : 0.3, brows: [12, 0] }, armR: { hand: [-20, -930], dir: [1, 0.1], pose: 'open', facing: 'back' }, armL: { hand: [60, -1020], dir: [-0.4, 0.9], pose: 'open', facing: 'back', detachHand: true } });
      const PL = Q.lawrence(oL), bp = R.toWorld(oL, [16, -1032]);
      const oE = Object.assign(idle(t, 17, 0.3), EO, { face: { expr: 'grief', mouth: 'tight', look: [-0.05, 0], lid: 0.26, tears: 0.6, brows: [14, 2] }, armR: { hand: [-70, -560], dir: [-0.1, -1], pose: 'open', facing: 'palm' } });
      const chars = drawP(Q.deborah(oD), oD, Q.deborahArt, L) + drawP(Q.sonny(oS), oS, Q.sonnyArt, L) + drawP(PL, oL, Q.lawrenceArt, L) + PR.baby(bp[0], bp[1], LO.s, t, { rot: -20 }) + handsLit(PL, L, 'L') + drawP(Q.elsie(oE), oE, Q.elsieArt, L);
      return X.compose(X.stage(set, chars), c) + C.vignette(0.58) + dith(t);
    };
    X.shot('KIDS', 20.5, 22.7, fn, { grade: 'gNight' });
    G.KIDS_FACES = tt => scr([560, 1060], cam(tt));
    G.KIDS_PANE = tt => scr([540, 600], cam(tt), 1.1);
  }
  X.tr('rack', 20.8, 0.6, 'MONTHS', 'KIDS', { fa: G.MONTHS_FACE(20.8), fb: G.KIDS_FACES(20.8), za: 1.06, zb: 0.95, blur: 12 });
})(window);
