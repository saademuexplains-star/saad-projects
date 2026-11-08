// "The Blind Harpist" part 1: the hot iron in the cell -> the golden harp -> the secret war room -> the night the
// bandages slip -> what your blurred eyes see: the brother poisoning the royal wine.
// The war room is one world whose state is a function of time (room()), so every angle on it agrees.
// Props that touch hands are animated first; grips and finger directions are derived from them.
(function (G) {
  const X = G.ENG, Q = G.QCAST, S = G.SETS, PR = G.PROPS, C = G.CINE, R = G.RIG;
  const { track: TK, ss, clamp, lerp, EZ } = X;
  const { f, mix } = R;
  const TAU = Math.PI * 2, D2R = Math.PI / 180;
  // ---- helper header (as in shots_g.js)
  const wave = (t, hz, ph = 0) => Math.sin(TAU * hz * t + ph);
  const env = (t, a, b, c, d) => ss(a, b, t) * (1 - ss(c, d, t));
  const bump = (t, t0, a = 1, len = 0.35) => (t < t0 || t > t0 + len) ? 0 : a * Math.pow(Math.sin(Math.PI * (t - t0) / len), 2);
  const idle = (t, seed, amp = 1) => ({ blink: Q.blink(t, seed), breath: Q.breath(t * 1.1 + seed) * 0.6, sway: X.noise(t * 0.45, seed) * 0.5 * amp });
  const hh = (c, t, amp = 1, seed = 0) => { const h = X.hand(t, amp, seed); return (X.CAM = [c[0] + h[0], c[1] + h[1], c[2], (c[3] || 0) + h[2]]); };
  const scr = (w, c, p = 1) => { const [cx, cy, z] = c, zp = Math.pow(z, p), px = 540 + (cx - 540) * p, py = 960 + (cy - 960) * p; return [540 + (w[0] - px) * zp, 960 + (w[1] - py) * zp]; };
  const lit = X.lit;
  const nrm = v => { const n = Math.hypot(v[0], v[1]) || 1; return [v[0] / n, v[1] / n]; };
  const L2 = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
  const HAND = { you: 110, emperor: 127.4, brother: 112, general1: 120, general2: 116, guard: 124 };
  const gripAt = (o, who, Gw, dW, extra = {}) => { const dl = nrm(R.dirLocal(o, dW)), gl = R.toLocal(o, Gw), gy = 0.33 * HAND[who]; return Object.assign({ hand: [gl[0] - dl[0] * gy, gl[1] - dl[1] * gy], dir: dl, pose: 'grip', facing: 'back' }, extra); };
  const fingersFor = (side, facing, thumb) => { const t = (side === 'R' ? -1 : 1) * (facing === 'palm' ? 1 : -1); return [-thumb[1] * t, thumb[0] * t]; };
  const armsOver = (p, L, which = 'RL') => C.lit({ svg: (which.includes('R') ? p.armRsvg : '') + (which.includes('L') ? p.armLsvg : ''), info: p.info }, Object.assign({ view: X.viewRect(1) }, L)).body;
  const handsLit = (p, L) => C.lit({ svg: (p.handR || '') + (p.handL || ''), info: p.info }, Object.assign({ view: X.viewRect(1) }, L)).body;
  // camera = position track [x, y, roll] + its own zoom track
  const CAM = (pk, zk) => { const P = TK(pk), Z = TK(zk); return t => { const p = P(t); return [p[0], p[1], Z(t), p[2]]; }; };
  // a hand placed by its fingertip: wrist sits back along the finger direction (world), returned in person-local
  const tipArm = (o, who, tipW, dirW, extra = {}) => { const d = nrm(dirW), k = 0.78 * HAND[who] * o.s; return Object.assign({ hand: R.toLocal(o, [tipW[0] - d[0] * k, tipW[1] - d[1] * k]), dir: nrm(R.dirLocal(o, d)), pose: 'open', facing: 'back' }, extra); };
  const LT = {
    cell: { from: [0.35, 0.7], shadow: '#1a0804', shadowOp: 0.6, floor: '#2a1208', floorOp: 0.5, contactOp: 0.5, key: '#ff9a50', keyAdd: 0.14, rims: [{ from: [1, 0.2], col: '#ff7a2a', w: 8, op: 0.6 }, { from: [-1, -0.6], col: '#7a90c0', w: 4, op: 0.22 }], face: { col: '#ffb070', op: 0.22 } },
    ante: { from: [-0.7, -0.5], shadow: '#2a1810', shadowOp: 0.5, floor: '#3a2a1a', floorOp: 0.35, contactOp: 0.4, key: '#ffd8a0', keyAdd: 0.08, rims: [{ from: [-1, -0.3], col: '#ffc070', w: 6, op: 0.45 }, { from: [1, -0.5], col: '#a0a8d0', w: 4, op: 0.2 }], face: { col: '#ffe0b0', op: 0.1 } },
    war: { from: [0.15, -1], shadow: '#1a0c08', shadowOp: 0.5, floor: '#2a1a10', floorOp: 0.35, contactOp: 0.45, key: '#ffcf90', keyAdd: 0.07, rims: [{ from: [-0.2, -1], col: '#ffd8a0', w: 5, op: 0.35 }, { from: [1, -0.3], col: '#9ab0e0', w: 5, op: 0.32 }], face: { col: '#ffd8a8', op: 0.1 } },
  };
  G.SHOTS_H = { wave, env, bump, idle, hh, scr, nrm, L2, HAND, gripAt, fingersFor, armsOver, handsLit, CAM, tipArm, LT };
  const ST = {};
  G.HARPIST = ST;

  // ======================================================= CELL: the hot iron (-0.7 - 2.06)
  // "Your Emperor blinds you with hot iron,"
  {
    const YOU = [230, 1760], GU = [230, 1700], EM = [840, 1760], sY = 0.66, sE = 0.64, sG = 0.68, BZ = S.CELL.BZ;
    // the iron's tip: resting in the coals, lifted out on "Emperor", carried to your eyes on "hot iron"
    const tipT = TK([[-0.7, [412, 1160]], [0.55, [380, 1060], 'sine'], [1.3, [290, 918], 'io'], [1.76, [268, 904], 'out2'], [2.1, [264, 901], 'out2']]);
    const angT = TK([[-0.7, 164], [0.55, 170], [1.3, 182], [2.1, 183]]);
    const cam = CAM(
      [[-0.7, [520, 1320, 0]], [0.6, [570, 1130, 0], 'sine'], [1.15, [330, 960, -1], 'io'], [1.76, [262, 908, 1.5], 'sine'], [2.1, [258, 902, 2], 'sine']],
      [[-0.7, 0.86], [0.6, 1.38, 'sine'], [1.05, 1.6, 'sine'], [1.76, 3.1, 'in2'], [2.1, 3.6, 'sine']]);
    ST.cellCam = cam;
    ST.cellTip = tt => scr(tipT(tt), cam(tt));
    const fn = t => {
      const c = hh(cam(t), t, 0.4, 3), L = LT.cell, set = S.cell(t);
      const tip = tipT(t), a = angT(t) * D2R, dir = [Math.cos(a), Math.sin(a)], rod = PR.IRON_TIP[0] * sE, grip = [tip[0] - dir[0] * rod, tip[1] - dir[1] * rod];
      const near = ss(0.7, 1.5, t);
      // the Emperor: stern, lit from below by the iron, leaning in as he pushes it to your eyes
      const eo = Object.assign(idle(t, 17), { x: EM[0], y: EM[1], s: sE });
      eo.sway = eo.sway - 3 * ss(0.6, 1.4, t);
      const em = Q.emperor(Object.assign(eo, { face: { expr: 'stern', look: [-0.8, lerp(0.3, 0.05, ss(0, 0.8, t))], lid: 0.22, mouth: 'tight', brows: [9, -4] },
        armR: gripAt(eo, 'emperor', grip, fingersFor('R', 'back', dir), { hold: PR.ironG(1) }), armL: { hand: [190, -820], pose: 'fist', facing: 'back', dir: [0.2, 1] } }));
      // you: held by the guard, leaning away, eyes on the glowing point, squeezing shut as it arrives
      const yo = Object.assign(idle(t, 5), { x: YOU[0], y: YOU[1], s: sY });
      yo.sway = yo.sway - 1 - 5 * EZ.sine(ss(0.4, 1.6, t)) + bump(t, 1.62, -1.2, 0.3);
      const squeeze = ss(1.52, 1.7, t);
      const you = Q.you(Object.assign(yo, { tilt: -3 - 9 * EZ.sine(ss(0.5, 1.7, t)), face: { expr: 'fear', wide: squeeze < 0.5, look: [0.65, 0.1], lid: lerp(0.12, 0.96, squeeze), brows: [lerp(-12, -16, near), 3], mouth: 'snarl', open: lerp(0.08, 0.36, ss(0.9, 1.7, t)), sweat: 0.9 },
        armR: { hand: [-205, -700], pose: 'fist', facing: 'back', dir: [-0.1, 1] }, armL: { hand: [205, -705], pose: 'fist', facing: 'back', dir: [0.1, 1] } }));
      // the guard behind you, hands clamped on your shoulders
      const go = Object.assign(idle(t, 29, 0.6), { x: GU[0], y: GU[1], s: sG });
      const shR = R.toWorld(yo, [-158, -990]), shL = R.toWorld(yo, [158, -990]);
      const gd = Q.guard(Object.assign(go, { face: { expr: 'stern', look: [0.45, 0.4], lid: 0.25, mouth: 'tight' },
        armR: { hand: R.toLocal(go, [shR[0] - 6, shR[1] - 50]), pose: 'grip', facing: 'back', dir: [0.35, 1], detachHand: true }, armL: { hand: R.toLocal(go, [shL[0] + 6, shL[1] - 50]), pose: 'grip', facing: 'back', dir: [-0.35, 1], detachHand: true } }));
      const bz = PR.brazier(BZ[0], BZ[1], S.CELL.BZS, t, { seed: 4 });
      // embers burst as the iron leaves the coals
      const burst = env(t, -0.1, 0.1, 0.4, 0.9);
      let ch = bz.back + bz.front;
      if (burst > 0) ch += `<g opacity="${f(burst)}">${S.embers(BZ[0] + 40, 1430, 260, 520, t + 3, 22, 77)}</g>`;
      ch += lit(gd, L) + lit(you, L) + handsLit(gd, L) + lit(em, L);
      // the glow of the point on your face and on the Emperor's
      ch += C.radial(tip[0], tip[1], 260 + 120 * near, '#ff7a2a', 0.38 + 0.3 * near, 'screen') + C.radial(tip[0], tip[1], 60, '#fff2c0', 0.7, 'screen');
      const steam = env(t, 1.55, 1.7, 2.0, 2.1);
      if (steam > 0) ch += `<g opacity="${f(steam)}">${G.ENV.smoke(tip[0] - 10, tip[1] - 10, 180, 3 + Math.floor(t * 8) % 3, '#e8e0d8', 0.4)}</g>`;
      return X.compose(X.stage(set, ch), c) + C.vignette(0.55);
    };
    X.shot('CELL', -0.7, 2.06, fn, { grade: 'gNight' });
  }

  // ======================================================= HARP: the golden harp (1.46 - 3.97)
  // "gives you a golden harp,"
  {
    const YOU = [420, 1760], HP = [500, 1776], HS = 0.74, EM = [860, 1712], sY = 0.66, sE = 0.62;
    const cam = CAM(
      [[1.46, [520, 1330, 0]], [2.6, [600, 1210, 0], 'sine'], [3.3, [470, 1250, 0], 'io'], [3.97, [440, 1250, 0], 'sine']],
      [[1.46, 1.95], [2.6, 1.15, 'sine'], [3.3, 1.5, 'io'], [3.97, 1.7, 'sine']]);
    ST.harpCam = cam;
    ST.harpFocus = tt => scr([HP[0] - 10, HP[1] - 420], cam(tt));
    const fn = t => {
      const c = hh(cam(t), t, 0.35, 8), L = LT.ante, set = S.ante(t);
      const touch = ss(2.3, 2.95, t), play = ss(2.95, 3.3, t);
      const hp = PR.harp(HP[0], HP[1], HS, t, { vib: i => play * ((i === 5 || i === 6 || i === 13 || i === 14) ? 0.7 : 0.15), glow: 1 });
      // fingertips on the strings: the hands rise from your sides, feel for the strings, then pluck softly
      const pr = (i, v, ph) => { const p = hp.pt(i, v); return [p[0] + play * 6 * wave(t, 1.4, ph), p[1] - play * 8 * Math.pow(0.5 + 0.5 * wave(t, 1.4, ph), 3)]; };
      const yo = Object.assign(idle(t, 9), { x: YOU[0], y: YOU[1], s: sY, tilt: 5 + 2 * wave(t, 0.4) });
      const restR = R.toWorld(yo, [-150, -640]), restL = R.toWorld(yo, [150, -640]);
      const tR = L2(restR, pr(5, 0.42, 0), EZ.io(touch)), tL = L2(restL, pr(13, 0.3, 1.7), EZ.io(touch));
      const you = Q.you(Object.assign(yo, { bandage: { stain: 1 }, burn: 1, face: { expr: 'anxious', mouth: 'tight', brows: [-6, 1], lid: 0.8 },
        armR: tipArm(yo, 'you', tR, [lerp(0.1, 0.4, touch), -lerp(0.4, 1, touch)], { detachHand: true }), armL: tipArm(yo, 'you', tL, [-lerp(0.1, 0.4, touch), -lerp(0.4, 1, touch)], { detachHand: true }) }));
      // the Emperor presents it with an open hand
      const eo = Object.assign(idle(t, 21), { x: EM[0], y: EM[1], s: sE });
      const em = Q.emperor(Object.assign(eo, { face: { expr: 'stern', look: [-0.75, 0.2], lid: 0.24, mouth: 'closed', brows: [7, -3] },
        armR: { hand: R.toLocal(eo, [lerp(760, 700, ss(1.6, 2.4, t)), lerp(1250, 1180, ss(1.6, 2.4, t))]), pose: 'open', facing: 'palm', dir: [-1, -0.15] }, armL: { hand: [180, -800], pose: 'relaxed', facing: 'back', dir: [0.1, 1] } }));
      const ch = lit(em, L) + lit(you, L) + hp.svg + handsLit(you, L);
      return X.compose(X.stage(set, ch), c) + C.vignette(0.5);
    };
    X.shot('HARP', 1.46, 3.97, fn, { grade: 'gHall' });
  }

  // ======================================================= the war room world (time -> everyone's pose)
  const WR = S.WR;
  const POS = { you: [170, 1730], harp: [250, 1742], guard: [-170, 1640], emp: [1040, 1330], bro: [1440, 1332], g1: [610, 1322], g2: [820, 1326], bz: [-480, 1650] };
  const SC = { you: 0.64, emp: 0.6, bro: 0.59, g1: 0.58, g2: 0.58, guard: 0.64, harp: 0.72 };
  ST.POS = POS; ST.SC = SC;
  const tableAt = (t, o = {}) => PR.mapTable(WR.TX0, WR.TX1, WR.TFAR, WR.TNEAR, WR.TFLOOR, t, o);
  const T0 = tableAt(0);   // only for its map -> world mapping
  const MP = (mx, my) => T0.pt(mx, my);
  ST.MP = MP;
  const GOB = MP(930, 200), GS = 0.42;            // the royal goblet on the table (foot)
  ST.GOB = GOB;
  // the block the Emperor moves on "battle maps"
  const blockAt = t => L2([600, 150], [700, 236], EZ.io(ss(7.35, 8.0, t)));
  const blocks = t => [[180, 320, '#8a1a14'], [250, 390, '#8a1a14', 0.95], [330, 300, '#8a1a14'], [760, 330, '#1a1a1c'], [820, 280, '#1a1a1c'], [880, 360, '#1a1a1c'], [...blockAt(t), '#8a1a14']];
  // you: plucking, with a playing level that drops when you freeze
  const playLevel = t => 1 - env(t, 21.95, 22.05, 28.4, 29.7);
  ST.playLevel = playLevel;
  const youHands = (t, hp, yo, amp) => {
    const iR = 5 + 1.6 * Math.sin(t * 2.3), iL = 14 + 1.8 * Math.sin(t * 1.9 + 1.2);
    const at = (fi, v) => { const a = Math.floor(fi), b = Math.min(hp.n - 1, a + 1), u = fi - a; return L2(hp.pt(a, v), hp.pt(b, v), u); };
    const pR = at(iR, 0.42), pL = at(iL, 0.3), fl = (ph) => -8 * amp * Math.pow(0.5 + 0.5 * wave(t, 2.2, ph), 4);
    // the flinch: both hands jump off the strings and hang there, frozen
    const jump = ss(21.98, 22.12, t) * (1 - ss(25.6, 27.0, t));
    return { R: [pR[0] - 34 * jump, pR[1] + fl(0) - 30 * jump], L: [pL[0] + 30 * jump, pL[1] + fl(1.9) - 26 * jump], iR, iL, jump };
  };
  // the world at time t. o.noYou (the POV), o.brotherCrowned (later night)
  const room = (t, o = {}) => {
    const L = LT.war, later = !!o.later;
    const spillU = later ? 1 : ss(31.7, 33.4, t);
    const tb = tableAt(t, { blocks: blocks(t), spill: spillU > 0 ? { u: spillU * 0.75, at: [820, 230], seed: 5 } : null });
    let back = '', top = '', front = '';
    const bz = PR.brazier(POS.bz[0], POS.bz[1], 0.62, t, { seed: 6 });
    back += bz.back + bz.front;
    // the generals study the map, talk, and recoil when the Emperor chokes
    const choke = later ? 0 : ss(31.75, 32.1, t);
    const g1o = Object.assign(idle(t, 33), { x: POS.g1[0], y: POS.g1[1], s: SC.g1 });
    g1o.sway += -2 * choke;
    const talk1 = env(t, 3.9, 4.0, 5.0, 5.1) + env(t, 9.1, 9.2, 9.9, 10.0) + env(t, 19.0, 19.1, 20.0, 20.1) + (later ? env(t, 33.6, 33.7, 34.3, 34.4) : 0);
    back += lit(Q.general1(Object.assign(g1o, { tilt: 3 * wave(t, 0.3) + bump(t, 5.2, 3, 0.5), face: choke > 0 ? { expr: 'fear', wide: true, look: [0.9, -0.1], mouth: 'parted', open: 0.2 } : { expr: 'grim', look: [0.25, 0.45], mouth: talk1 > 0.5 ? 'talk' : 'closed', open: Q.talk(t, 0.25, 6) } })), L);
    const g2o = Object.assign(idle(t, 41), { x: POS.g2[0], y: POS.g2[1], s: SC.g2 });
    g2o.sway += -3 * choke;
    const talk2 = env(t, 4.6, 4.7, 5.6, 5.7) + env(t, 15.2, 15.3, 16.2, 16.3) + env(t, 24.0, 24.1, 24.9, 25.0);
    back += lit(Q.general2(Object.assign(g2o, { tilt: -2 + bump(t, 6.4, -3, 0.5), face: choke > 0 ? { expr: 'fear', wide: true, look: [0.85, 0.05], mouth: 'parted', open: 0.25 } : { expr: 'neutral', look: [0.1, 0.45], mouth: talk2 > 0.5 ? 'talk' : 'closed', open: Q.talk(t, 0.25, 6) } })), L);
    // --- the Emperor (or, on a later night, the brother in his place)
    let E = null, B = null, cup = '', cupFront = '';
    if (!later) {
      const eo = Object.assign(idle(t, 11), { x: POS.emp[0], y: POS.emp[1], s: SC.emp });
      const sink = EZ.in2(ss(32.25, 33.3, t)), stag = ss(31.8, 32.2, t);
      eo.y += 420 * sink; eo.sway += stag * (-4 + 3 * Math.sin((t - 31.8) * 7)) - 8 * sink;
      // right hand: points at the map while he talks, rests on the map, moves the block on "battle maps"
      const point = env(t, 3.4, 3.7, 6.0, 6.4) + env(t, 13.0, 13.4, 14.8, 15.2) + env(t, 23.2, 23.6, 25.0, 25.4);
      const mv = env(t, 7.15, 7.35, 8.0, 8.2), bk = blockAt(t);
      let tR = L2(MP(520, 110), MP(560, 230), point), dR = L2([0.25, 1], [-0.35, 0.9], point);
      tR = L2(tR, MP(bk[0] + 8, bk[1] - 40), mv); dR = L2(dR, [0.05, 1], mv);
      const thr = ss(31.65, 31.95, t);
      // left hand: rests by the goblet; takes it 26.4, drinks 27.8 - 28.6, sets it down 29.4; knocks it over at 31.7
      const cupHold = env(t, 26.55, 26.65, 29.35, 29.45), lift = env(t, 26.75, 27.8, 28.7, 29.3);
      const head = R.toWorld(eo, [10, -1210]);
      const cupFoot = L2(GOB, [head[0] + 34, head[1] + 150], EZ.io(lift)), cupTip = -lerp(0, 58, env(t, 27.6, 27.95, 28.45, 28.8)) - 6 * lift;
      const reach = ss(26.2, 26.6, t) * (1 - ss(29.4, 29.8, t));
      const stem = [cupFoot[0], cupFoot[1] - 42 * GS];
      let tL = L2(MP(860, 90), stem, reach), dL = L2([-0.2, 1], [-0.95, 0.3], reach);
      const neckR = R.toWorld(eo, [-46, -1160]), neckL = R.toWorld(eo, [46, -1150]);
      tR = L2(tR, neckR, thr); dR = L2(dR, [0.55, -0.85], thr); tL = L2(tL, neckL, thr); dL = L2(dL, [-0.55, -0.85], thr);
      const armR = (mv > 0.5 ? gripAt(eo, 'emperor', [tR[0], tR[1] + 30 * SC.emp], dR, { detachHand: true }) : { hand: R.toLocal(eo, tR), dir: nrm(R.dirLocal(eo, dR)), pose: thr > 0.5 ? 'grip' : point > 0.5 ? 'point' : 'open', facing: 'back', detachHand: true });
      const armL = cupHold > 0.5 ? gripAt(eo, 'emperor', stem, fingersFor('L', 'back', [Math.sin(cupTip * D2R), -Math.cos(cupTip * D2R)]), { detachHand: true }) : { hand: R.toLocal(eo, tL), dir: nrm(R.dirLocal(eo, dL)), pose: thr > 0.5 ? 'grip' : 'open', facing: 'back', detachHand: true };
      const glanceYou = env(t, 8.7, 9.0, 9.7, 10.0) + env(t, 15.8, 16.0, 16.8, 17.0);
      const talkE = env(t, 3.6, 3.7, 5.8, 5.9) + env(t, 13.0, 13.1, 14.9, 15.0) + env(t, 23.1, 23.2, 25.2, 25.3);
      const faceE = thr > 0.3 ? { expr: 'fear', wide: true, look: [0, -0.4], mouth: 'snarl', open: 0.3 + 0.1 * Math.sin(t * 9), brows: [-14, 4], sweat: 1, blush: 0.5, lid: 0.05 }
        : { expr: 'stern', look: L2([0.15, 0.55], [-0.85, 0.15], glanceYou), lid: lerp(0.24, 0.16, glanceYou), mouth: talkE > 0.5 ? 'talk' : 'closed', open: Q.talk(t, 0.28, 6), brows: [6, -2] };
      E = Q.emperor(Object.assign(eo, { tilt: thr > 0 ? -8 * thr + 4 * Math.sin(t * 6) * thr : 2 * wave(t, 0.25), face: faceE, armR, armL }));
      back += lit(E, L);
      // the goblet: on the table, in his hand, knocked over at 31.7
      const knock = ss(31.66, 31.86, t);
      if (cupHold > 0.5) cupFront += PR.goblet(cupFoot[0], cupFoot[1], GS, { tip: cupTip, wine: lift > 0.5 && t > 28.5 ? 0.2 : 0.8 });
      else cup += PR.goblet(GOB[0] - 50 * knock, GOB[1] + 6 * knock, GS, { tip: -95 * knock, wine: t > 29 ? 0.25 : 0.8 });
    } else {
      // a later night: the brother wears the purple and the crown at the head of the table
      const bo = Object.assign(idle(t, 51), { x: POS.emp[0], y: POS.emp[1], s: SC.bro });
      const crownOn = 1 - EZ.io(ss(33.15, 34.0, t)), turn = ss(34.2, 34.7, t), pointY = env(t, 34.6, 35.0, 36.2, 36.5);
      const raise = 1 - ss(34.0, 34.4, t);
      const cL = R.toWorld(bo, [-92, -1430 - 80 * crownOn]), cR = R.toWorld(bo, [92, -1430 - 80 * crownOn]);
      const armR = raise > 0.02 ? { hand: R.toLocal(bo, L2(MP(560, 120), cL, raise)), dir: nrm(L2([0.25, 1], [0.75, -0.6], raise)), pose: 'open', facing: raise > 0.5 ? 'palm' : 'back', detachHand: true }
        : { hand: R.toLocal(bo, L2(MP(560, 120), [700, 980], pointY)), dir: nrm(L2([0.25, 1], [-1, 0.1], pointY)), pose: pointY > 0.5 ? 'point' : 'open', facing: 'back', detachHand: true };
      const armL = { hand: R.toLocal(bo, L2(MP(820, 110), cR, raise)), dir: nrm(L2([-0.2, 1], [-0.75, -0.6], raise)), pose: 'open', facing: raise > 0.5 ? 'palm' : 'back', detachHand: true };
      E = Q.brother(Object.assign(bo, { tunic: '#4c1842', sleeve: '#43153a', crown: '#d8b048', pendilia: true, crownLift: 80 * crownOn, pendSway: 6 * Math.sin(t * 5) * (1 - ss(34.0, 34.8, t)),
        face: { expr: 'neutral', look: L2([0.1, -0.2], [-0.95, 0.1], turn), lid: 0.24, mouth: turn > 0.5 ? 'smirk' : 'closed', brows: [6, -3] }, armR, armL }));
      back += lit(E, L);
      cup += PR.goblet(GOB[0], GOB[1], GS, { wine: 0.8 });
    }
    // --- the brother at the table's end (before the later night)
    let vial = '';
    if (!later) {
      const bo = Object.assign(idle(t, 47), { x: POS.bro[0], y: POS.bro[1], s: SC.bro });
      const DG = [-112, -800], DA = 14;
      const dagger = PR.dagger(DG[0], DG[1], 1, 0, DA);
      // the pour: the vial comes up out of his sleeve, tips over the goblet, rights, goes away
      const up = env(t, 17.6, 18.55, 21.3, 22.4), tipV = env(t, 18.75, 19.3, 20.85, 21.3), freeze = ss(22.75, 22.95, t), toDag = ss(23.55, 24.25, t);
      const mouth = [GOB[0] + 12, GOB[1] - 150 * GS - 26];
      const va = lerp(-95, -228, EZ.io(tipV)) * D2R, vdir = [Math.cos(va), Math.sin(va)];
      const vgrip = [mouth[0] - vdir[0] * 54 * SC.bro, mouth[1] - vdir[1] * 54 * SC.bro - 30 * (1 - tipV)];
      const waistR = R.toWorld(bo, [-40, -830]), waistL = R.toWorld(bo, [34, -822]);
      const dgw = R.toWorld(bo, PR.daggerGrip(DG[0], DG[1], 1, 0, DA)), dax = [Math.sin(DA * D2R), -Math.cos(DA * D2R)];
      let armR;
      if (toDag > 0.01) { const w = L2(waistR, dgw, EZ.io(toDag)); armR = gripAt(bo, 'brother', w, fingersFor('R', 'back', dax), { pose: toDag > 0.6 ? 'grip' : 'open', detachHand: true }); }
      else if (up > 0.01) armR = gripAt(bo, 'brother', L2(waistR, vgrip, EZ.io(up)), fingersFor('R', 'back', vdir), { hold: PR.vial({ col: '#5aa83a', level: lerp(0.8, 0.15, ss(19.3, 20.9, t)), open: true }), detachHand: true });
      else armR = { hand: R.toLocal(bo, waistR), dir: [0.6, 0.8], pose: 'relaxed', facing: 'back', detachHand: true };
      const armL = { hand: R.toLocal(bo, L2(waistL, R.toWorld(bo, [196, -700]), Math.max(up, freeze))), dir: [-0.5, 0.85], pose: 'relaxed', facing: 'back', detachHand: true };
      const watchYou = Math.max(env(t, 9.2, 9.5, 10.2, 10.5), ss(22.3, 22.7, t));
      const narrow = ss(24.9, 25.6, t);
      B = Q.brother(Object.assign(bo, { props: dagger, tilt: -3 * watchYou + 2 * wave(t, 0.2) * (1 - freeze),
        face: { expr: watchYou > 0.5 ? 'stern' : 'neutral', look: L2(L2([-0.55, 0.45], [-0.4, 0.7], up), [-0.95, 0.06], watchYou), lid: lerp(0.22, 0.4, narrow), mouth: 'tight', brows: [lerp(2, 11, freeze), -4] }, armR, armL }));
      back += lit(B, L);
      if (tipV > 0.35) {
        const vm = [vgrip[0] + vdir[0] * 54 * SC.bro, vgrip[1] + vdir[1] * 54 * SC.bro], rim = [GOB[0], GOB[1] - 150 * GS], k = ss(19.3, 19.5, t) * (1 - ss(20.7, 20.9, t));
        if (k > 0) vial += `<path d="M${f(vm[0])},${f(vm[1])} Q${f(vm[0] - 4)},${f((vm[1] + rim[1]) / 2)} ${f(rim[0] + 6)},${f(rim[1])}" stroke="#6ad04a" stroke-width="${f(5 * k)}" fill="none" opacity="0.9"/>` + C.radial(rim[0], rim[1], 40, '#9aff70', 0.35 * k, 'screen');
      }
    }
    // --- table: top, things on it, arms reaching over it, the skirt
    top += tb.top + PR.candelabra(MP(50, 70)[0], MP(50, 70)[1], 0.42, t, 1) + PR.candelabra(MP(470, 40)[0], MP(470, 40)[1], 0.36, t, 2) + PR.ewer(MP(990, 470)[0], MP(990, 470)[1], 0.5) + cup;
    top += armsOver(E, L) + cupFront + handsLit(E, L);
    if (B) top += armsOver(B, L, 'R') + handsLit(B, L) + vial;
    front += tb.front;
    // --- the guard behind you, axe upright in his left hand, blade towards you
    const go = Object.assign(idle(t, 61, 0.6), { x: POS.guard[0], y: POS.guard[1], s: SC.guard });
    const axeG = R.toWorld(go, [206, -760]);
    const gd = Q.guard(Object.assign(go, { face: { expr: 'stern', look: L2([0.55, 0.15], [1, -0.05], choke), lid: 0.25, mouth: 'tight' },
      armL: gripAt(go, 'guard', axeG, fingersFor('L', 'back', [0, -1]), { detachHand: true }), armR: { hand: [-200, -720], pose: 'relaxed', facing: 'back', dir: [-0.1, 1] } }));
    front += lit(gd, L) + PR.axe(axeG[0], axeG[1], SC.guard, 0, 0) + handsLit(gd, L);
    // --- you and the golden harp
    if (!o.noYou) {
      const hp = PR.harp(POS.harp[0], POS.harp[1], SC.harp, t, { vib: i => 0, glow: 0.6 });
      const yo = Object.assign(idle(t, 9), { x: POS.you[0], y: POS.you[1], s: SC.you });
      const amp = playLevel(t), Hh = youHands(t, hp, yo, amp);
      const hp2 = PR.harp(POS.harp[0], POS.harp[1], SC.harp, t, { vib: i => Math.max(amp * (Math.abs(i - Hh.iR) < 1.5 || Math.abs(i - Hh.iL) < 1.5 ? 0.6 : 0.08), (i > 2 && i < 9 ? 1 : 0) * env(t, 21.98, 22.05, 22.6, 23.4)), glow: 0.6 });
      yo.sway += 1.2 * wave(t, 0.45) * amp + bump(t, 21.98, 2.2, 0.4);
      const fl = bump(t, 21.98, 1, 0.45);
      const fy = o.youFace ? o.youFace(t) : {};
      const you = Q.you(Object.assign(yo, { tilt: 2 * wave(t, 0.45) * amp + 6 * fl + (fy.tilt || 0), bandage: fy.bandage, burn: 1,
        face: Object.assign({ iris: Q.IRIS_HEALED }, fy.face || {}),
        armR: tipArm(yo, 'you', Hh.R, [0.42, -1], { detachHand: true }), armL: tipArm(yo, 'you', Hh.L, [-0.42, -1], { detachHand: true }) }));
      front += lit(you, L) + hp2.svg + handsLit(you, L);
    }
    return back + top + front;
  };
  ST.room = room;

  // your face through the war-room nights
  const youFace = t => {
    const slip = EZ.io(ss(11.55, 12.45, t)), sweat = ss(8.4, 9.4, t);
    const bandage = { slip: 24 * slip, drop: 46 * slip, stain: 1 };
    if (t < 12.5) return { bandage, face: { expr: t > 8.4 ? 'anxious' : 'neutral', mouth: 'tight', brows: [lerp(-2, -7, sweat), 1], lid: 0.85, sweat } };
    // the eyes open under the slipped band: realisation
    const open = ss(12.55, 13.2, t), flinch = ss(21.98, 22.1, t), blank = ss(28.3, 29.3, t);
    let look = L2([0.05, 0.1], [0.12, -0.12], open), lid = lerp(0.85, 0.28, open), brows = [lerp(-4, -11, open), 2], expr = 'anxious', mouth = 'tight', wide = false;
    if (t > 21.3) { look = L2([0.75, -0.08], [0.95, -0.06], flinch); lid = lerp(0.3, 0.1, flinch); brows = [lerp(-8, -15, flinch), 3]; expr = 'fear'; wide = flinch > 0.5; mouth = flinch > 0.5 ? 'parted' : 'tight'; }
    if (blank > 0) { look = L2(look, [0.02, 0.07], blank); lid = lerp(lid, 0.44, blank); brows = [lerp(brows[0], -1, blank), lerp(brows[1], 0, blank)]; if (blank > 0.5) { expr = 'neutral'; wide = false; mouth = 'closed'; } }
    return { bandage, face: { expr, look, lid, brows, mouth, open: mouth === 'parted' ? 0.14 : 0, wide, sweat: Math.max(sweat, ss(21.3, 22.5, t)) } };
  };
  ST.youFace = youFace;
  const NIGHT_TINT = `<rect x="-20" y="-20" width="1120" height="1960" fill="#0c0618" opacity="0.22" style="mix-blend-mode:multiply"/>`;
  ST.NIGHT_TINT = NIGHT_TINT;

  // ======================================================= WAR: the secret war room (3.27 - 10.9)
  // "and makes you play inside his secret war room because a blind man can't read his battle maps.
  //  Every song is a game of survival,"
  {
    const cam = CAM(
      [[3.27, [880, -620, 0]], [5.9, [820, 1020, 0], 'io'], [6.12, [805, 1035, 0], 'sine'], [7.0, [270, 1050, -1], 'io'], [8.05, [925, 925, 0], 'io'], [8.45, [905, 935, 0], 'sine'], [9.45, [215, 1060, 1], 'io'], [10.9, [190, 1010, 0], 'sine']],
      [[3.27, 0.86], [4.6, 0.8, 'sine'], [5.9, 0.74, 'sine'], [6.12, 0.75, 'sine'], [6.55, 0.92, 'sine'], [7.0, 1.3, 'sine'], [7.55, 1.02, 'sine'], [8.05, 1.62, 'sine'], [8.45, 1.55, 'sine'], [8.9, 1.12, 'sine'], [9.45, 1.65, 'sine'], [10.9, 2.15, 'sine']]);
    ST.warCam = cam;
    const fn = t => {
      const c = hh(cam(t), t, 0.4, 13), set = S.warRoom(t);
      return X.compose(X.stage(set, room(t, { youFace })), c) + C.vignette(0.5);
    };
    X.shot('WAR', 3.27, 10.9, fn, { grade: 'gHall' });
  }

  // ======================================================= NIGHT: the bandages slip (10.2 - 13.9)
  // "until one night your bandages slip and you realize your eyes"
  {
    const head = [POS.you[0], POS.you[1] - 1300 * SC.you];
    const cam = CAM(
      [[10.2, [215, 1010, 0]], [11.5, [200, 945, 0], 'sine'], [12.5, [185, 905, -1], 'sine'], [13.9, [182, 896, 0], 'sine']],
      [[10.2, 1.9], [11.5, 2.35, 'sine'], [12.5, 2.85, 'sine'], [13.9, 3.7, 'in2']]);
    ST.nightCam = cam;
    const fn = t => {
      const c = hh(cam(t), t, 0.35, 19), set = S.warRoom(t, { dark: 1 });
      return X.compose(X.stage(set, room(t, { youFace })), c) + NIGHT_TINT + C.vignette(0.6);
    };
    X.shot('NIGHT', 10.2, 13.9, fn, { grade: 'gHall' });
  }

  // ======================================================= POV: blurred shapes; the brother pours poison (13.1 - 21.65)
  // "have healed just enough to see blurred shapes. You look up mid-song and see the Emperor's own brother
  //  pouring poison into the royal wine,"
  {
    const cam = CAM(
      [[13.1, [640, 1480, 0]], [16.15, [660, 1440, 0], 'sine'], [17.1, [880, 1000, 0], 'io'], [18.6, [1290, 930, 0], 'sine'], [20.0, [1262, 860, 0], 'sine'], [21.65, [1256, 852, 0], 'sine']],
      [[13.1, 1.15], [16.15, 1.25, 'sine'], [17.1, 1.0, 'io'], [18.6, 1.55, 'sine'], [20.0, 2.7, 'sine'], [21.65, 3.0, 'sine']]);
    ST.povCam = cam;
    ST.povFocus = tt => scr([ST.GOB[0], ST.GOB[1] - 60], cam(tt));
    // focus: very soft, hunting, sharpening as you look at the pour (never fully sharp)
    const blurT = TK([[13.1, 22], [14.6, 15, 'sine'], [15.4, 18, 'sine'], [16.2, 13, 'sine'], [17.2, 10, 'sine'], [18.6, 7, 'sine'], [19.4, 3.6, 'sine'], [21.65, 3.2, 'sine']]);
    // your own hands on the strings, seen from above: golden strings and two forearms entering from the bottom
    const fg = t => {
      const off = 1500 * EZ.io(ss(16.15, 17.1, t));
      let g = `<g transform="translate(0,${f(off)})">`;
      for (let i = 0; i < 9; i++) { const x = 110 + i * 110, a = 6 * Math.sin(t * (60 + i * 7)) * (0.4 + 0.6 * ((i + Math.floor(t * 2.2)) % 3 === 0)); g += `<path d="M${x},-100 Q${f(x + a)},800 ${x},2100" stroke="#3a2a10" stroke-width="12" fill="none" opacity="0.5"/><path d="M${x},-100 Q${f(x + a)},800 ${x},2100" stroke="${i % 3 === 1 ? '#c8503a' : '#f0dc98'}" stroke-width="7" fill="none"/>`; }
      g += `<path d="M-80,1960 L1160,1240 L1160,1500 L-80,2200Z" fill="#b88a2e" stroke="#2a1a08" stroke-width="5"/><path d="M-80,1990 L1160,1270" stroke="#fff0b0" stroke-width="10" opacity="0.4"/>`;
      const pl = (ph) => 26 * Math.pow(0.5 + 0.5 * wave(t, 2.2, ph), 3);
      g += PR.closeArm({ from: [-150, 2300], wrist: [300 + 20 * Math.sin(t * 2.3), 1160 - pl(0)], dir: [0.35, -1], side: 'R', facing: 'back', pose: 'open', size: 420, skin: '#c69472', sleeve: '#c6b894' });
      g += PR.closeArm({ from: [1250, 2300], wrist: [790 + 20 * Math.sin(t * 1.9 + 1), 1080 - pl(1.9)], dir: [-0.35, -1], side: 'L', facing: 'back', pose: 'open', size: 420, skin: '#c69472', sleeve: '#c6b894' });
      return g + `</g>`;
    };
    const fn = t => {
      const c = hh(cam(t), t, 0.5, 23), set = S.warRoom(t, { dark: 1 }), b = blurT(t) + 1.2 * Math.sin(t * 2.7);
      const scene = X.compose(X.stage(set, room(t, { noYou: true })), c) + (t < 17.2 ? fg(t) : '');
      const id = 'povb' + Math.round(t * 60), dx = b * 1.6;
      // double vision: a faint offset copy that converges as the eyes focus
      return `<defs><filter id="${id}" filterUnits="userSpaceOnUse" x="-60" y="-60" width="1200" height="2040"><feGaussianBlur stdDeviation="${f(Math.max(0.5, b))}" edgeMode="duplicate"/></filter></defs><g filter="url(#${id})">${scene}${b > 4.5 ? `<g opacity="${f(0.32 * Math.min(1, (b - 4.5) / 3))}" transform="translate(${f(dx)},${f(-dx * 0.4)})">${scene}</g>` : ''}</g>` + NIGHT_TINT + C.vignette(0.75);
    };
    X.shot('POV', 13.1, 21.65, fn, { grade: 'gHall' });
  }
})(window);
