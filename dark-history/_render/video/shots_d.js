// "The Royal Taster": 10 shots, long continuous camera moves inside each location, 9 different joins.
// Hands that touch props are solved from the prop: the prop's pose is animated, the grip point and finger
// direction are derived from it, so nothing can slide, float or spin inside a fist.
(function (G) {
  const X = G.ENG, T = G.TCAST, S = G.SETS, PR = G.PROPS, C = G.CINE, R = G.RIG;
  const { track: TK, ss, clamp, lerp, EZ } = X;
  const { f, mix } = R;
  const TAU = Math.PI * 2, D2R = Math.PI / 180;
  const wave = (t, hz, ph = 0) => Math.sin(TAU * hz * t + ph);
  const env = (t, a, b, c, d) => ss(a, b, t) * (1 - ss(c, d, t));
  const sbob = (t, hz) => 0.5 - 0.5 * Math.cos(TAU * 2 * hz * t), spos = (t, hz) => Math.pow(0.5 + 0.5 * Math.sin(TAU * hz * t), 2);
  const bump = (t, t0, a = 1, len = 0.35) => (t < t0 || t > t0 + len) ? 0 : a * Math.pow(Math.sin(Math.PI * (t - t0) / len), 2);
  const idle = (t, seed, amp = 1) => ({ blink: T.blink(t, seed), breath: T.breath(t * 1.1 + seed) * 0.7, sway: X.noise(t * 0.45, seed) * 0.5 * amp });
  const hh = (c, t, amp = 1, seed = 0) => { const h = X.hand(t, amp, seed); return (X.CAM = [c[0] + h[0], c[1] + h[1], c[2], (c[3] || 0) + h[2]]); };
  const scr = (w, c, p = 1) => { const [cx, cy, z] = c, zp = Math.pow(z, p), px = 540 + (cx - 540) * p, py = 960 + (cy - 960) * p; return [540 + (w[0] - px) * zp, 960 + (w[1] - py) * zp]; };
  const wor = (s, c) => [c[0] + (s[0] - 540) / c[2], c[1] + (s[1] - 960) / c[2]];
  const lit = X.lit, blur = (svg, id) => `<g filter="url(#${id})">${svg}</g>`;
  const rot = (v, a) => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)];
  const nrm = v => { const n = Math.hypot(v[0], v[1]) || 1; return [v[0] / n, v[1] / n]; };
  const L2 = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
  const stageBF = (set, chars, extraBack = [], extraFront = []) => [...set.back, ...extraBack, { p: 1, svg: chars, chars: true }, ...set.front, ...extraFront];
  // hand sizes (person-local units) of the cast, needed to put a fist exactly on a world point
  const HAND = { taster: 106, king: 125.3, brother: 110, guard: 116, server: 104, thug: 116, lady: 104, wife: 104, lord: 116 };
  // arm spec whose fist closes on world point Gw with the fingers pointing along world direction dW
  const gripAt = (o, who, Gw, dW, extra = {}) => {
    const dl = nrm(R.dirLocal(o, dW)), gl = R.toLocal(o, Gw), gy = 0.33 * HAND[who];
    return Object.assign({ hand: [gl[0] - dl[0] * gy, gl[1] - dl[1] * gy], dir: dl, pose: 'grip', facing: 'back' }, extra);
  };
  // world position of a point given in an arm's grip frame (+x = thumb side, +y = fingers)
  const gripPt = (o, who, side, arm, px, py = 0) => {
    const d = nrm(arm.dir), t = (side === 'R' ? -1 : 1) * (arm.facing === 'palm' ? 1 : -1), gy = 0.33 * HAND[who];
    return R.toWorld(o, [arm.hand[0] + d[1] * t * px + d[0] * (gy + py), arm.hand[1] - d[0] * t * px + d[1] * (gy + py)]);
  };
  // a prop placed in the world: translate / rotate (deg) / scale
  const place = (svg, p, a, s) => `<g transform="translate(${f(p[0])},${f(p[1])}) rotate(${f(a)}) scale(${f(s)})">${svg}</g>`;
  const ptOn = (p, a, s, lx, ly = 0) => { const v = rot([lx * s, ly * s], a * D2R); return [p[0] + v[0], p[1] + v[1]]; };
  // finger direction perpendicular to a rod at angle a (deg); side +1 / -1 picks which way the fingers wrap
  const perp = (a, k = 1) => [-Math.sin(a * D2R) * k, Math.cos(a * D2R) * k];
  // light presets
  const L4 = {
    day: { from: [-0.9, -0.6], shadow: '#3a3444', shadowOp: 0.5, mid: 0.45, floor: '#4a4250', floorOp: 0.38, contactOp: 0.45, cast: [0.35, 0.1], castOp: 0.22, keyAdd: 0.08, key: '#fff4e6', rims: [{ from: [1, -0.5], col: '#eef2ff', w: 6, op: 0.45 }], face: { col: '#fff4e8', op: 0.15 } },
    hall: { from: [-0.3, -0.8], shadow: '#2a1a16', shadowOp: 0.56, mid: 0.4, floor: '#2a1c14', floorOp: 0.3, key: '#ffd8a0', keyAdd: 0.13, contactOp: 0.5, rims: [{ from: [1, -0.3], col: '#ff9a50', w: 7, op: 0.65 }, { from: [-1, -0.5], col: '#ffd8a8', w: 5, op: 0.3 }], face: { col: '#ffe0b0', op: 0.2 } },
    hallB: { from: [0.2, -0.8], shadow: '#1e1a26', shadowOp: 0.58, mid: 0.4, floor: '#22202a', floorOp: 0.3, key: '#ffd0a0', keyAdd: 0.1, contactOp: 0.5, rims: [{ from: [-1, -0.4], col: '#9ab0e0', w: 7, op: 0.55 }, { from: [1, -0.3], col: '#ff9a50', w: 6, op: 0.45 }], face: { col: '#ffd8b0', op: 0.18 } },
    kit: { from: [0.8, -0.5], shadow: '#141c0c', shadowOp: 0.62, key: '#ffb070', keyAdd: 0.1, contactOp: 0.5, rims: [{ from: [-1, -0.3], col: '#ff8a3a', w: 7, op: 0.7 }], face: { col: '#d8f0a0', op: 0.1 } },
    night: { from: [0.6, -0.7], shadow: '#140c14', shadowOp: 0.66, key: '#ffa060', keyAdd: 0.12, contactOp: 0.5, rims: [{ from: [0.9, -0.5], col: '#ff8a3a', w: 8, op: 0.8 }, { from: [-1, -0.6], col: '#8aa0d0', w: 5, op: 0.4 }], face: { col: '#ffb080', op: 0.25 } },
  };
  const GW = 0.79; // spoon scale shared by the hand-over shots

  // ============================================================== the hand-over (opening + loop landing)
  // Choreography in SCREEN space so the last shot can land exactly on the first one. tau < 0.62 the giver holds
  // the spoon by the handle end, bowl pointing at the taster; at 0.55 its shaft settles in the taster's open
  // fingers, 0.55-0.62 his fist closes, 0.62-0.70 the giver lets go.
  const HO = {
    pos: TK([[-1.7, [820, 2100]], [-1.0, [612, 948], 'io'], [0.55, [520, 985], 'out2'], [1.5, [520, 985]]]),   // spoon origin (handle centre), screen px
    ang: TK([[-1.7, 200], [-1.0, 188], [0.55, 181, 'out2'], [1.5, 181]]),
    zs: 1.45,                    // spoon screen scale at the hand-over (world scale 0.62 at zoom 2.35)
  };
  // returns world-space spoon pose for a camera
  const hoSpoon = (tau, c) => { const sp = HO.pos(tau); return { p: wor(sp, c), a: HO.ang(tau), s: HO.zs / c[2] }; };

  // ============================================================== DIN  the private dining room (0 - 5.75)
  {
    const TX = 330, TS = 0.78, TY = 1700 + 820 * TS, KX = 850, KS = 0.8, KY = 1700 + 820 * KS;
    const cam = TK([[-2.4, [600, 1430, 2.2, 0]], [0.7, [585, 1455, 2.35, 0], 'sine'], [2.3, [640, 1360, 1.08, 0]], [3.3, [600, 1330, 1.22, 0], 'sine'], [4.5, [575, 1320, 1.5, 0]], [5.75, [620, 1300, 1.95, 0], 'in2']]);
    // after the hand-over: offset of the taster's fist from where he took the spoon, and the spoon angle
    const tHand = TK([[0.62, [0, 0]], [1.4, [-40, -70]], [2.3, [-30, -40]], [2.75, [40, 170]], [3.0, [34, 162]], [3.45, [-158, -70]], [4.2, [-150, -64]], [5.0, [-70, 10]]]);
    const tAng = TK([[0.62, 181], [1.4, 196], [2.3, 192], [2.75, 228], [3.0, 226], [3.45, 181], [4.2, 183], [5.0, 190]]);
    const srvX = TK([[1.0, 1600], [2.15, 570, 'out2'], [2.75, 570], [3.9, 1650, 'in2']]);
    const srvDip = t => env(t, 2.05, 2.4, 2.55, 2.95);
    const kLean = TK([[3.3, 0], [4.3, 1, 'sine'], [4.95, 1], [5.5, 0.4, 'sine']]);
    const BS = 0.5, L = L4.day;
    G.DIN_CAM = cam;
    X.shot('DIN', 0, 5.75, t => {
      const c = hh(cam(t), t, 0.35, 1);
      const set = S.dining(t, { tableY: 1820 });
      // ---- spoon: screen choreography until the taster's fist closes, then rigidly carried by that fist
      const h0 = hoSpoon(0.62, cam(0.62)), g0 = ptOn(h0.p, h0.a, h0.s, 55);
      let sp;
      if (t <= 0.62) sp = hoSpoon(t, c);
      else { const d = tHand(t), a = tAng(t), g = [g0[0] + d[0], g0[1] + d[1]]; sp = { p: ptOn(g, a, h0.s, -55), a, s: h0.s }; }
      const gTaster = ptOn(sp.p, sp.a, sp.s, 55), gKing = ptOn(sp.p, sp.a, sp.s, -42);
      // ---- the taster: left fist on the shaft (fingers up, palm to camera); open while he waits
      const close = ss(0.55, 0.62, t);
      const tO = Object.assign(idle(t, 1), { x: TX, y: TY, s: TS, breath: 0, sway: 0, tilt: lerp(-2, 4, ss(0.7, 1.4, t)) });
      const tLook = t < 0.7 ? [0.6, 0.55] : t < 1.6 ? [0.35, 0.5] : t < 2.6 ? [0.55, 0.5] : t < 3.4 ? [0.3, 0.3] : [0.75, -0.05];
      const chew = t > 3.45 && t < 4.25 ? 0.1 + 0.1 * spos(t, 2.6) : 0;
      const gulp = bump(t, 4.25, 1, 0.3);
      const tFace = { expr: 'anxious', look: tLook, mouth: t > 3.05 && t < 3.45 ? 'parted' : chew ? 'talk' : 'closed', open: t > 3.05 && t < 3.4 ? 0.3 : chew, brows: [-6 - gulp * 4, -2], lid: 0.12 + gulp * 0.3 };
      const tDir = rot([0, -1], (sp.a - 181) * D2R * 0.9);
      const tArm = gripAt(tO, 'taster', gTaster, tDir, { pose: close >= 1 ? 'grip' : 'open', facing: 'palm', detachHand: true });
      const taster = T.taster(Object.assign({}, tO, { face: tFace, armL: tArm }));
      let tHands = '';
      if (close < 1) tHands += `<g opacity="${f(1 - close)}">${lit({ svg: close > 0 ? T.taster(Object.assign({}, tO, { face: tFace, armL: Object.assign({}, tArm, { pose: 'open' }) })).handL : taster.handL, info: taster.info }, L)}</g>`;
      if (close > 0) tHands += `<g opacity="${f(close)}">${lit({ svg: T.taster(Object.assign({}, tO, { face: tFace, armL: Object.assign({}, tArm, { pose: 'grip' }) })).handL, info: taster.info }, L)}</g>`;
      // ---- the King: right fist on the handle end until 0.62, lets go, sits back, then presents the boar
      const rel = ss(0.62, 0.7, t), kl = kLean(t);
      const kO = Object.assign(idle(t, 2), { x: KX - kl * 110, y: KY, s: KS, breath: 0, sway: -kl * 2, tilt: 3 - kl * 8 + bump(t, 4.95, 6, 0.5) });
      const kGrip = gripAt(kO, 'king', t < 0.62 ? gKing : ptOn(h0.p, h0.a, h0.s, -42), rot([0, -1], (Math.min(sp.a, 200) - 181) * D2R));
      const away = ss(0.7, 1.5, t), present = env(t, 1.85, 2.3, 3.1, 3.6);
      const kRest = [-10, -770], kPoint = R.toLocal(kO, [700, 1500]);
      let kHand = L2(kGrip.hand, kRest, away);
      kHand = L2(kHand, kPoint, present);
      const kArmR = { hand: kHand, dir: away < 1 ? kGrip.dir : (present > 0.3 ? nrm(R.dirLocal(kO, [-1, 0.25])) : undefined), pose: rel < 0.5 ? 'grip' : present > 0.3 ? 'open' : 'relaxed', facing: present > 0.3 ? 'palm' : 'back', detachHand: true };
      const laugh = env(t, 4.95, 5.1, 5.6, 6);
      const kFace = { expr: 'neutral', mouth: laugh > 0.2 ? 'grin' : kl > 0.3 ? 'tight' : 'smile', open: laugh * (0.25 + 0.3 * spos(t, 5.5)), look: t < 1.2 ? [-0.6, 0.6] : t < 3.2 ? [-0.7, 0.35] : [-0.85, 0.05], lid: lerp(0.16, 0.4, kl) * (1 - laugh) + laugh * 0.42, brows: [lerp(0, 7, kl), lerp(0, -4, kl)] };
      const kArmL = { hand: [190, -600], pose: 'relaxed' };
      const king = T.king(Object.assign({}, kO, { face: kFace, armR: kArmR, armL: kArmL }));
      let kHands = '';
      if (rel > 0 && rel < 1) {
        kHands += `<g opacity="${f(1 - rel)}">${lit({ svg: T.king(Object.assign({}, kO, { face: kFace, armR: Object.assign({}, kArmR, { pose: 'grip' }), armL: kArmL })).handR, info: king.info }, L)}</g>`;
        kHands += `<g opacity="${f(rel)}">${lit({ svg: T.king(Object.assign({}, kO, { face: kFace, armR: Object.assign({}, kArmR, { pose: 'relaxed' }), armL: kArmL })).handR, info: king.info }, L)}</g>`;
      } else kHands = lit({ svg: king.handR, info: king.info }, L);
      // ---- the serving woman carries in the roast boar at chest height and crouches to set it down
      const sx = srvX(t), dip = srvDip(t), carry = t < 2.45, walk = (t > 1.0 && t < 2.15) || t > 2.8;
      const sY = 1905 + dip * 447 + (walk ? sbob(t, 1.1) * 9 : 0);
      const sO = Object.assign(idle(t, 6), { x: sx, y: sY, s: 0.64, sway: 0, breath: 0, tilt: dip * 5 });
      const boarAt = carry ? [sx, sY - 600] : [570, 1752];
      const sArmR = carry ? { hand: R.toLocal(sO, [boarAt[0] - 300 * BS, boarAt[1] + 14]), pose: 'open', facing: 'palm', dir: [0.5, -0.86] } : { hand: [-110, -560], pose: 'relaxed' };
      const sArmL = carry ? { hand: R.toLocal(sO, [boarAt[0] + 300 * BS, boarAt[1] + 14]), pose: 'open', facing: 'palm', dir: [-0.5, -0.86] } : { hand: [110, -560], pose: 'relaxed' };
      const server = T.server(Object.assign({}, sO, { face: { look: carry ? [-0.3, 0.45] : [-0.6, 0.2], mouth: 'closed', lid: 0.3 }, armR: sArmR, armL: sArmL }));
      const guard = T.guard(Object.assign(idle(t, 9), { x: 1320, y: 1760, s: 0.52, face: { look: [-0.5, 0.2], lid: 0.4 } }), 1);
      // ---- compose
      const spoonSvg = place(PR.spoon({ food: t > 2.95 && t < 3.6, glint: bump(t, -0.4, 1, 0.7) + bump(t, 1.0, 0.8, 0.6) }), sp.p, sp.a, sp.s);
      const items = PR.goblet(1010, 1760, 0.6, {}) + PR.goblet(120, 1770, 0.55, {}) + PR.bread(-60, 1760, 0.8) + PR.apples(1200, 1770, 0.8);
      const boar = PR.boar(boarAt[0], boarAt[1], BS, { t, carved: ss(2.6, 2.9, t) });
      const chars = lit(server, L) + lit(king, L) + lit(taster, L);
      const layers = [...set.back, { p: 0.86, svg: blur(lit(guard, L), 'dof1') }, { p: 1, svg: chars, chars: true }, ...set.front,
        { p: 1, svg: items + boar + G.SHOTS_D.armsOver(king, L, 'R') + spoonSvg + kHands + tHands }];
      return X.compose(layers, c);
    }, { grade: 'gDay' });
  }  X.tr('spin', 5.35, 0.8, 'DIN', 'ROU', { rot: 110, k: 1.45, fa: [560, 900], blur: 6 });

  // ============================================================== ROU  Russian roulette with the dishes (4.95 - 8.25)
  {
    const cam = TK([[4.9, [540, 960, 0.92, 0]], [7.3, [540, 960, 1.06, 0], 'sine'], [8.3, [540, 900, 1.22, 0], 'in2']]);
    // the ring clicks round in 60-degree steps like a revolver cylinder, slowing toward "roulette"
    const steps = [5.55, 5.88, 6.2, 6.53, 6.88, 7.28];
    const ringRot = t => { let r = 0; for (let i = 0; i < steps.length; i++) { const d = i < 4 ? 0.2 : 0.3; r += 60 * EZ.io(clamp((t - steps[i]) / d)); } return r; };
    const spin = TK([[4.9, 0], [6.4, 1400, 'out2'], [7.42, 1710, 'out']]);
    X.shot('ROU', 4.95, 8.25, t => {
      const c = hh(cam(t), t, 0.25, 4);
      const rr = ringRot(t);
      // the dish the spoon stops at is lifted (index 0 ends at the top after 6 steps = 360 deg)
      const L = S.roulette(t, { rot: rr - 90 + 90, spin: spin(t), liftIdx: 0, lift: ss(7.45, 7.95, t) * 0.55, glint: bump(t, 7.42, 1, 0.4) });
      return X.compose(L, [c[0], c[1], c[2], c[3] + lerp(-6, 4, ss(4.9, 8.2, t))]);
    }, { grade: 'gHall' });
  }
  X.tr('organic', 7.85, 0.8, 'ROU', 'HALL', { fa: [540, 960], fb: [540, 960], za: 1.08, zb: 0.94, seed: 11, freq: 0.004, soft: 3, leak: '#ffb860', leakOp: 0.3 });

  G.SHOTS_D = { cam0: null, HO, hoSpoon, gripAt, gripPt, place, ptOn, perp, L4, scr, wor, idle, wave, env, bump, hh, nrm, rot, L2, stageBF, GW };
})(window);
