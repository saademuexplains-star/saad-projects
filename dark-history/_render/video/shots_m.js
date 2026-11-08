// "The King's Decoy" part 1: the crowning in the dressing chamber -> the coach rolling out through the cheering
// crowd, arrows from a rooftop -> inside the coach (old arrow holes, a new one beside your head) -> the mountain pass:
// the disguised king beside your window, the bridge ahead, the powder under its arches, the brother on the ridge.
// Rules kept: hands rigid on what they hold, hand paths off faces, arms over furniture only while resting on it,
// camera moving on every line and capped near 60 px per frame, every cut hidden in a matched move.
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
  // a point on layer p -> the p 1 world point that lands on the same pixel (for things crossing layers)
  const toP1 = (w, c, p) => { const s = scr(w, c, p); return [c[0] + (s[0] - 540) / c[2], c[1] + (s[1] - 960) / c[2]]; };
  const nrm = v => { const n = Math.hypot(v[0], v[1]) || 1; return [v[0] / n, v[1] / n]; };
  const L2 = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
  const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k];
  const dirA = a => [Math.cos(a * D2R), Math.sin(a * D2R)];
  const HAND = Q.HAND;
  const gripAt = (o, who, Gw, dW, extra = {}) => { const dl = nrm(R.dirLocal(o, dW)), gl = R.toLocal(o, Gw), gy = 0.33 * HAND[who]; return Object.assign({ hand: [gl[0] - dl[0] * gy, gl[1] - dl[1] * gy], dir: dl, pose: 'grip', facing: 'back' }, extra); };
  // a wrist placed in world space with a world finger direction
  const handAt = (o, Ww, dW, extra = {}) => Object.assign({ hand: R.toLocal(o, Ww), dir: nrm(R.dirLocal(o, dW)), pose: 'relaxed', facing: 'back' }, extra);
  const armsOver = (p, L, which = 'RL', view = true) => C.lit({ svg: (which.includes('R') ? p.armRsvg : '') + (which.includes('L') ? p.armLsvg : ''), info: p.info }, Object.assign(view ? { view: X.viewRect(1) } : {}, L)).body;
  const handsLit = (p, L, which = 'RL', view = true) => C.lit({ svg: (which.includes('R') ? p.handR || '' : '') + (which.includes('L') ? p.handL || '' : ''), info: p.info }, Object.assign(view ? { view: X.viewRect(1) } : {}, L)).body;
  const CAM = (pk, zk) => { const P = TK(pk), Z = TK(zk); return t => { const p = P(t); return [p[0], p[1], Z(t), p[2]]; }; };
  const headW = (o, p) => R.toWorld(o, R.headPt(o, 'man', p));
  const lit = X.lit;
  // characters inside a transformed group (the coach, a falling rider) are lit without view culling
  const litN = (P, L) => { const r = C.lit(P, L); return r.cast + r.body; };
  const LT = {
    chamber: { from: [-0.85, -0.5], shadow: '#1a0e06', shadowOp: 0.45, floor: '#2a1a10', floorOp: 0.3, contactOp: 0.4, key: '#ffe8c8', keyAdd: 0.06, rims: [{ from: [-1, -0.3], col: '#ffd8a0', w: 7, op: 0.55 }, { from: [1, -0.3], col: '#c8b0d8', w: 4, op: 0.2 }], face: { col: '#ffe8d0', op: 0.13 } },
    day: { from: [-0.7, -0.6], shadow: '#2a2014', shadowOp: 0.4, floor: '#4a4030', floorOp: 0.28, contactOp: 0.4, key: '#fff4e0', keyAdd: 0.07, rims: [{ from: [-1, -0.4], col: '#fff0c8', w: 6, op: 0.45 }], face: { col: '#fff0e0', op: 0.1 } },
    pass: { from: [-0.85, -0.4], shadow: '#2a1c10', shadowOp: 0.38, floor: '#4a3a24', floorOp: 0.26, contactOp: 0.38, key: '#ffe6c0', keyAdd: 0.08, rims: [{ from: [-1, -0.3], col: '#ffd8a0', w: 7, op: 0.6 }, { from: [1, -0.2], col: '#a8b8d0', w: 3, op: 0.2 }], face: { col: '#ffe8d0', op: 0.12 } },
    inside: { from: [0.7, -0.5], shadow: '#1a0608', shadowOp: 0.45, floor: '#1a0a08', floorOp: 0.3, contactOp: 0.4, key: '#ffe0c0', keyAdd: 0.05, rims: [{ from: [1, -0.2], col: '#ffe8c0', w: 7, op: 0.5 }, { from: [-1, -0.4], col: '#c83a4a', w: 4, op: 0.25 }], face: { col: '#ffe0c8', op: 0.12 } },
    ridge: { from: [-0.9, -0.2], shadow: '#1a1010', shadowOp: 0.42, floor: '#3a2a20', floorOp: 0.28, contactOp: 0.4, key: '#ffd8a8', keyAdd: 0.07, rims: [{ from: [-1, -0.2], col: '#ffc080', w: 8, op: 0.65 }, { from: [1, -0.3], col: '#8a9ac8', w: 4, op: 0.25 }], face: { col: '#ffd8b0', op: 0.1 } },
    gibbet: { from: [0.2, -0.9], shadow: '#0a0608', shadowOp: 0.5, floor: '#1a1014', floorOp: 0.3, contactOp: 0.4, key: '#8a7080', keyAdd: 0.0, rims: [{ from: [0.3, -1], col: '#ff9a50', w: 8, op: 0.75 }, { from: [-1, -0.2], col: '#ff8a40', w: 5, op: 0.4 }], face: { col: '#c88070', op: 0.06 } },
    village: { from: [0.9, -0.3], shadow: '#1a0a08', shadowOp: 0.45, floor: '#2a1810', floorOp: 0.3, contactOp: 0.4, key: '#ffb890', keyAdd: 0.06, rims: [{ from: [1, -0.2], col: '#ff8a50', w: 8, op: 0.6 }, { from: [-1, -0.3], col: '#6a4a8a', w: 4, op: 0.25 }], face: { col: '#ffc8a0', op: 0.12 } },
  };
  // a seated figure in a long robe, front view: the rig is clipped at the hips; the robe falls over the knees to the
  // floor in deep folds with a gilt hem and the shoes peeping out. o = the placed person; returns { clip, lap }
  const seated = (o, floorY, robe, id, hem = '#c9a040') => {
    const fl = (floorY - o.y) / o.s, cut = o.y - 745 * o.s;
    const clip = `<defs><clipPath id="${id}"><rect x="${f(o.x - 2000)}" y="${f(cut - 4000)}" width="4000" height="4000"/></clipPath></defs>`;
    // one broad gown over both knees: a rounded lap, then the silk falling straight to a flared hem
    const d = `M-186,-772 L186,-772 C200,-706 206,-648 198,-606 C204,-590 214,-560 220,-520 C232,${f(fl - 260)} 246,${f(fl - 90)} 262,${f(fl - 16)} C130,${f(fl + 8)} -130,${f(fl + 8)} -262,${f(fl - 16)} C-246,${f(fl - 90)} -232,${f(fl - 260)} -220,-520 C-214,-560 -204,-590 -198,-606 C-206,-648 -200,-706 -186,-772Z`;
    let lap = [-70, 70].map(x => `<path d="M${x - 52},${f(fl - 8)} C${x - 52},${f(fl - 34)} ${x + 52},${f(fl - 34)} ${x + 56},${f(fl - 8)} C${x + 30},${f(fl + 6)} ${x - 30},${f(fl + 6)} ${x - 52},${f(fl - 8)}Z" fill="#3a0a14" stroke="#140808" stroke-width="2"/>`).join('');
    lap += `<defs><linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${shade(robe, -0.35)}"/><stop offset="0.3" stop-color="${shade(robe, 0.16)}"/><stop offset="0.5" stop-color="${robe}"/><stop offset="0.7" stop-color="${shade(robe, 0.06)}"/><stop offset="1" stop-color="${shade(robe, -0.4)}"/></linearGradient></defs><path d="${d}" fill="url(#${id}g)" stroke="#140808" stroke-width="3" stroke-linejoin="round"/>`;
    // the lap's top lit, the knees just shaping the cloth, soft folds hanging from them, the gilt hem
    lap += `<path d="M-180,-760 C-100,-748 100,-748 180,-760 C190,-700 196,-640 190,-610 C120,-596 -120,-596 -190,-610 C-196,-640 -190,-700 -180,-760Z" fill="#fff" opacity="0.1"/>`;
    lap += `<path d="M-96,-604 C-60,-614 -30,-612 -8,-600 M8,-600 C30,-612 60,-614 96,-604" stroke="#000" stroke-width="5" fill="none" opacity="0.14"/>`;
    for (const [x, k] of [[-170, 0.2], [-110, 0.14], [-40, 0.2], [30, 0.12], [100, 0.18], [168, 0.22]]) lap += `<path d="M${x},-590 C${x * 1.02},${f((fl - 590) / 2 - 290)} ${x * 1.1},${f(fl - 160)} ${x * 1.32},${f(fl - 12)}" stroke="#000" stroke-width="${f(5 + k * 20)}" fill="none" opacity="${k}" stroke-linecap="round"/>`;
    lap += `<path d="M-60,-590 C-66,${f(fl - 260)} -74,${f(fl - 100)} -84,${f(fl - 8)}" stroke="#fff" stroke-width="6" fill="none" opacity="0.12"/><path d="M-262,${f(fl - 16)} C-130,${f(fl + 8)} 130,${f(fl + 8)} 262,${f(fl - 16)}" stroke="${hem}" stroke-width="14" fill="none"/>`;
    return { clip, cut, lap: `<g transform="translate(${f(o.x)},${f(o.y)}) scale(${f(o.s)})" filter="url(#clothS)">${lap}</g>` };
  };
  G.SHOTS_M = { wave, env, bump, idle, hh, scr, toP1, nrm, L2, add, dirA, gripAt, handAt, armsOver, handsLit, CAM, headW, LT, litN, seated };
  const ST = {};
  G.DECOY = ST;
  // a torch in world space, its shaft through a fist at g (drawn between the lit body and the detached hand, so the
  // flame is never clipped by the body's light box); s = the holder's scale, lean = degrees off vertical, k = flame
  const torchW = (g, s, t, seed, lean = 0, k = 1) => {
    const d = dirA(-90 + lean), b = add(g, d, -120 * s), top = add(g, d, 430 * s), n = [-d[1], d[0]];
    let o = `<path d="M${f(b[0] + n[0] * 18 * s)},${f(b[1] + n[1] * 18 * s)} L${f(top[0] + n[0] * 20 * s)},${f(top[1] + n[1] * 20 * s)} L${f(top[0] - n[0] * 20 * s)},${f(top[1] - n[1] * 20 * s)} L${f(b[0] - n[0] * 18 * s)},${f(b[1] - n[1] * 18 * s)}Z" fill="#4a2e18" stroke="#140c06" stroke-width="${f(3 * s)}"/>`;
    const h0 = add(top, d, -70 * s);
    o += `<path d="M${f(h0[0] + n[0] * 30 * s)},${f(h0[1] + n[1] * 30 * s)} L${f(top[0] + n[0] * 34 * s)},${f(top[1] + n[1] * 34 * s)} L${f(top[0] - n[0] * 34 * s)},${f(top[1] - n[1] * 34 * s)} L${f(h0[0] - n[0] * 30 * s)},${f(h0[1] - n[1] * 30 * s)}Z" fill="#2a1a10" stroke="#140c06" stroke-width="${f(3 * s)}"/>`;
    return o + `<g transform="translate(${f(top[0])},${f(top[1])}) rotate(${f(lean)})">${S.flames(0, 0, 100 * s, 250 * s * k, t, seed, 1)}</g>`;
  };
  ST.torchW = torchW;

  // ======================================================= CROWN: the crowning (-0.8 - 5.2)
  // "He gives you a golden crown identical to his own, dresses you in his finest silk robes,"
  {
    const YOU = { x: 560, y: 1985, s: 0.8 }, KING = { x: 300, y: 1760, s: 0.78 }, FLOOR = 1800;
    const lift = t => 210 * (1 - EZ.io(ss(-0.8, 1.05, t)));
    const youTilt = t => -2 * ss(-0.8, 1.0, t) + 2 * bump(t, 1.0, 1, 0.5) - 3 * env(t, 1.5, 1.9, 2.3, 2.6);
    const youAt = t => Object.assign(idle(t, 3, 0.3), YOU, { tilt: youTilt(t) });
    ST.CROWN_YOU = YOU;
    // the crown's band ends in the world (the rig draws the crown at head-local y -112 - lift, inside the face's
    // (1.02, 1.07) scale; its band is 160 wide)
    const rimW = (o, L, s) => R.toWorld(o, R.headPt(o, 'man', [s * 84 * 1.02, (-128 - L) * 1.07]));
    // the crown drawn on its own (the rig's light box would clip a crown held above the head): same art, same place
    const crownAt = (o, L) => { const sx = o.s * (1 - (o.breath || 0) * 0.0015), sy = o.s * (1 + (o.breath || 0) * 0.004); return `<g transform="translate(${f(o.x)},${f(o.y)}) rotate(${f(o.sway || 0)}) scale(${f(sx * 1e4) / 1e4},${f(sy * 1e4) / 1e4}) translate(0,-1308) rotate(${f(o.tilt || 0)}) scale(1.02,1.07) translate(0,${f(-112 - L)})">${R.crownArt('#d6a838')}</g>`; };
    // the king stands at your side (his arm never crosses a face): his near hand holds the crown by its band and
    // lowers it onto your head, then comes to rest on your shoulder, then drops back to his side
    const kingHands = (t, yo, ko) => {
      const L = lift(t), toSh = EZ.io(ss(1.1, 1.65, t)), back = EZ.io(ss(2.45, 3.3, t));
      const onRim = add(rimW(yo, L, -1), [-30, 14]), onSh = add(R.toWorld(yo, [-150, -1140]), [-4, -14]);
      let w = add(L2(onRim, onSh, toSh), [-70, -20], Math.sin(Math.PI * toSh));
      w = L2(w, R.toWorld(ko, [150, -790]), back);
      let d = L2([1, 0.2], [0.15, 1], toSh); d = L2(d, [-0.05, 1], back);
      return { armR: { hand: [-150, -790], dir: [0.05, 1], pose: 'relaxed', facing: 'back' }, armL: handAt(ko, w, d, { detachHand: back < 0.5 }) };
    };
    const fn = t => {
      // the camera first: it is also the view the characters are culled against
      const c = hh(cam(t), t, 0.22, 2);
      const yo = youAt(t), ko = Object.assign(idle(t, 9, 0.3), KING);
      // the servants step in for "dresses you" and smooth the mantle on your upper arms
      const inn = EZ.io(ss(2.35, 3.0, t)), smooth = 8 * Math.sin(t * 5) * env(t, 3.0, 3.2, 4.4, 4.7);
      const co = Object.assign(idle(t, 21, 0.3), { x: 1010, y: FLOOR - 50, s: 0.72 }), vo = Object.assign(idle(t, 27, 0.3), { x: lerp(1120, 865, inn), y: FLOOR + 10, s: 0.78 });
      const L = LT.chamber;
      // you, seated, crowned; eyes up at the crown, then at the king, then ahead
      const yf = { expr: 'anxious', look: t < 1.2 ? [0, -0.65] : t < 2.5 ? [-0.65, -0.3] : [0.15, 0.05], lid: 0.16, brows: [-9, 2], sweat: 0.2, mouth: 'tight' };
      const restR = { hand: [-150, -735], dir: [0.15, 1], pose: 'relaxed', facing: 'back' }, restL = { hand: [150, -735], dir: [-0.15, 1], pose: 'relaxed', facing: 'back' };
      const Y = Q.you(Object.assign({}, yo, { crown: false, face: yf, armR: restR, armL: restL }));
      const K = Q.king(Object.assign({}, ko, { face: { expr: 'stern', mouth: t > 1.3 && t < 2.6 ? 'smirk' : 'tight', look: [0.55, 0.55], lid: 0.28, brows: [6, -2] } }, kingHands(t, yo, ko)));
      const hS = s => add(R.toWorld(s > 0 ? vo : co, [0, 0]), [0, 0]);
      const servantArm = (who, o, target, side) => handAt(o, add(target, [0, smooth]), [side * -0.8, 0.5], { pose: 'open' });
      const tgtC = R.toWorld(yo, [-150, -1010]), tgtV = R.toWorld(yo, [150, -1010]);
      const Ch = Q.chamberlain(Object.assign({}, co, { face: { expr: 'neutral', look: [-0.7, 0.3], lid: 0.3 }, armL: { hand: [60, -900], dir: [-0.6, 0.5], pose: 'relaxed', facing: 'back' }, armR: { hand: [-60, -880], dir: [0.6, 0.5], pose: 'relaxed', facing: 'back' } }));
      const Va = Q.valet(Object.assign({}, vo, { face: { expr: 'neutral', look: [-0.7, 0.2], lid: 0.22 }, armR: inn > 0.6 ? servantArm('valet', vo, tgtV, 1) : { hand: [-110, -760], dir: [0.1, 1], pose: 'relaxed', facing: 'back' }, armL: { hand: [110, -800], dir: [-0.1, 1], pose: 'relaxed', facing: 'back' } }));
      // the gilded chair: its velvet back behind you, its arms under your hands
      const chairBack = `<path d="M420,1400 L420,1010 C420,960 450,930 470,930 L650,930 C670,930 700,960 700,1010 L700,1400Z" fill="#6a1220" filter="url(#cloth)" stroke="#c9a040" stroke-width="16"/>` + [420, 700].map(x => `<circle cx="${x}" cy="920" r="22" fill="#c9a040" stroke="#5a4010" stroke-width="2"/>`).join('');
      const chairArms = [[380, 470], [650, 740]].map(([a, b]) => `<rect x="${a}" y="1360" width="${b - a}" height="34" rx="14" fill="#c9a040" stroke="#5a4010" stroke-width="2.4"/><path d="M${a + 8},1394 L${a + 8},1800 M${b - 8},1394 L${b - 8},1800" stroke="#b8902e" stroke-width="16"/>`).join('');
      const st = seated(yo, FLOOR, '#6a1020', 'crwlap');
      const chars = lit(Ch, L) + chairBack + lit(K, L) + st.clip + `<g clip-path="url(#crwlap)">${lit(Y, L)}</g>` + chairArms + st.lap + armsOver(Y, L) + handsLit(Y, L) + crownAt(yo, lift(t)) + handsLit(K, L) + lit(Va, L) + (inn > 0.6 ? handsLit(Va, L, 'R') : '');
      ST.crown = { Y, yo };
      return X.compose(X.stage(S.chamber(t), chars), c) + C.vignette(0.5);
    };
    // frame 0 already pushing in on the two crowned faces; drift across both at "identical"; tilt down the robes
    const cam = CAM(
      [[-0.8, [440, 800, 0]], [1.2, [452, 822, 0.4], 'sine'], [1.9, [400, 800, -0.3], 'io'], [2.5, [470, 860, 0], 'io'], [3.6, [560, 1110, 0], 'io'], [4.5, [575, 1300, 0], 'sine'], [5.2, [580, 1430, 0], 'lin']],
      [[-0.8, 1.85], [1.2, 2.2, 'sine'], [1.9, 2.3, 'io'], [2.5, 2.1, 'io'], [3.6, 1.7, 'io'], [4.5, 1.5, 'sine'], [5.2, 1.45, 'lin']]);
    ST.crownCam = cam;
    X.shot('CROWN', -0.8, 5.2, fn, { grade: 'gHall' });
  }

  // ======================================================= GATE: out through the cheering streets, arrows (4.4 - 9.4)
  // "and forces you to ride in his royal carriage to catch the arrows meant for his chest."
  {
    const GT = S.GT11, CS = 0.36, CY = GT.ROAD;
    const run = PR.horseRun([[0, 'walk']], 3, 11, 0.1);
    const X0 = 100 - run(6.4).x * CS;
    const door = t => X0 + run(t).x * CS;
    const R1 = 7.05, T1 = 7.43, R2 = 7.92, T2 = 8.29;
    const A1 = [70, -1250], A2 = [-40, -1452];   // where the arrows strike (coach-local)
    const passenger = (t) => () => {
      const fl1 = bump(t, T1, 1, 0.45), fl2 = bump(t, T2, 1, 0.6);
      const face = t < T2 ? { expr: 'anxious', look: t < 6.8 ? [0.4, 0.05] : [0.75, -0.3], lid: lerp(0.18, 0.6, fl1), brows: [-10, 2], sweat: 0.25, mouth: fl1 > 0.3 ? 'snarl' : 'tight' } : { expr: 'fear', wide: true, look: [0.2, 0.55], lid: lerp(0.08, 0.7, fl2 * (t < T2 + 0.15 ? 1 : 0)), brows: [-14, 4], sweat: 0.45, mouth: 'parted', open: 0.12 };
      return litN(Q.you(Object.assign(idle(t, 5, 0.3), { x: -10 - 30 * fl2, y: PR.COACH.SEAT + 820, s: 1, tilt: -8 * fl2 - 4 * fl1, sway: -3 * fl2, face })), LT.day);
    };
    const driver = (t) => () => `<g clip-path="url(#gtdrv)"><defs><clipPath id="gtdrv"><rect x="0" y="-4000" width="3000" height="${-1650 + 4000}"/></clipPath></defs>${litN(Q.driver(Object.assign(idle(t, 13, 0.3), { x: 840, y: -850, s: 1, tilt: 6 * bump(t, T1, 1, 0.5), face: { expr: 'anxious', look: [0.6, -0.1], lid: 0.3, mouth: 'tight' }, armR: { hand: [140, -720], dir: [0.6, 0.5], pose: 'fist', facing: 'back' }, armL: { hand: [190, -740], dir: [0.6, 0.5], pose: 'fist', facing: 'back' } })), LT.day)}</g>`;
    const coachAt = t => PR.coach({ x: door(t), y: CY, s: CS, t, run: run(t), glass: 1, passenger: passenger(t), driver: driver(t),
      arrows: [...(t >= T1 ? [[A1[0], A1[1], -40, 300, 1, t - T1]] : []), ...(t >= T2 ? [[A2[0], A2[1], -32, 280, 1, t - T2]] : [])] });
    ST.gateDoor = door; ST.gateCoach = coachAt;
    // the archer in the dormer (house layer p 0.8): a hooded man drawing a longbow; releases at R1 (and again at R2)
    const AP = 0.8, AO = { x: 1400, y: 1010, s: 0.3 };
    const archerSvg = t => {
      const drawK = 1 - EZ.out(ss(R1, R1 + 0.08, t)) + EZ.io(ss(R1 + 0.4, R2 - 0.1, t)) - EZ.out(ss(R2, R2 + 0.08, t));
      const bowW = R.toWorld(AO, [-330, -1060]), drawW = R.toWorld(AO, [lerp(-60, 70, drawK), -1240]);
      const M = Q.merc(Object.assign(idle(t, 31, 0.2), AO, { face: { expr: 'grim', look: [-0.8, 0.4], lid: 0.42, brows: [8, -4] },
        armR: { hand: [-300, -1060], dir: [-1, 0.1], pose: 'fist', facing: 'back' }, armL: { hand: R.toLocal(AO, drawW), dir: [-1, 0], pose: 'fist', facing: 'back' } }));
      const bt = add(bowW, [-14, -150]), bb = add(bowW, [-14, 150]);
      let b = `<path d="M${f(bt[0])},${f(bt[1])} Q${f(bowW[0] - 70)},${f(bowW[1])} ${f(bb[0])},${f(bb[1])}" stroke="#4a2a14" stroke-width="7" fill="none" stroke-linecap="round"/>`;
      b += `<path d="M${f(bt[0])},${f(bt[1])} L${f(drawW[0])},${f(drawW[1])} L${f(bb[0])},${f(bb[1])}" stroke="#d8d0c0" stroke-width="1.6" fill="none"/>`;
      if (drawK > 0.6) b += `<path d="M${f(drawW[0])},${f(drawW[1])} L${f(bowW[0] - 60)},${f(bowW[1] + 4)}" stroke="#a8804a" stroke-width="3.5"/>`;
      return `<defs><clipPath id="gtarc"><rect x="1330" y="560" width="140" height="160"/></clipPath></defs><g clip-path="url(#gtarc)">${C.lit(M, LT.day).body}${b}</g>`;
    };
    // the arrows in flight (drawn on the street layer; their start follows the archer's pixel)
    const flying = (t, c) => {
      let g = '';
      for (const [r0, t0, A] of [[R1, T1, A1], [R2, T2, A2]]) if (t > r0 && t < t0) {
        const u = (t - r0) / (t0 - r0), s0 = toP1([1350, 820], c, AP), tg = R.toWorld({ x: door(t), y: CY, s: CS }, A);
        const p = add(L2(s0, tg, u), [0, -90 * Math.sin(Math.PI * u)]), d = nrm([tg[0] - s0[0], tg[1] - s0[1] + 180 * Math.cos(Math.PI * u)]);
        g += PR.arrowFly(p, d, 120, 5);
      }
      return g;
    };
    const fn = t => {
      const c = hh(cam(t), t, 0.3, 4);
      const co = coachAt(t);
      // a mounted escort behind the coach
      const er = run(t), esc = PR.rider({ who: 'escort', x: door(t) - 2600 * CS, y: CY + 30, s: CS, g: er.g, c: er.c + 0.3, t, lit: P => litN(P, LT.day), pose: { face: { expr: 'grim', look: [0.6, 0], lid: 0.32 } }, leg: { legs: '#2e2a26', boot: '#1e1610', hem: '#1e3a6a' }, horse: { col: '#2a2420', low: '#141010', mane: '#0a0808', tack: { bridle: true, saddle: '#3a2414', blanket: '#1e3a6a' } } });
      const set = S.gate11(t);
      const hi = set.findIndex(L => L.p === 0.8);
      set.splice(hi + 1, 0, { p: AP, svg: archerSvg(t) });
      ST.gate = { co, c };
      return X.compose(X.stage(set, co.svg + esc.svg + flying(t, c)), c) + C.vignette(0.5);
    };
    // tilt down the gate towers to the coach; whip up to the archer's dormer as he looses; follow the arrow back
    // (a zoom dip caps the speed); push into the window as the second arrow lands by your chest
    const win = t => R.toWorld({ x: door(t), y: CY, s: CS }, [-10, -1715]);
    const D = (t, dx, dy) => { const w = win(t); return [w[0] + dx, w[1] + dy]; };
    const arch = [540 + (1400 - 540) / AP, 960 + (640 - 960) / AP];
    const cam = CAM(
      [[4.4, [690, 260, 0]], [5.4, [670, 820, 0], 'sine'], [6.15, [D(6.15, 380, 0)[0], 1250, 0], 'io'], [6.98, [arch[0] - 260, arch[1] + 230, -1], 'io'], [7.12, [arch[0] - 250, arch[1] + 232, -1], 'sine'], [7.82, [...D(7.82, 130, 110), 0.6], 'io'], [8.5, [...D(8.5, 30, 70), 0], 'io'], [9.4, [...D(9.4, 0, 80), 0], 'sine']],
      [[4.4, 0.75], [5.4, 0.7, 'sine'], [6.15, 0.68, 'io'], [6.98, 1.08, 'io'], [7.12, 1.1, 'sine'], [7.5, 0.9, 'io'], [7.82, 1.0, 'sine'], [8.5, 2.0, 'io'], [9.4, 2.45, 'sine']]);
    ST.gateCam = cam;
    X.shot('GATE', 4.4, 9.4, fn, { grade: 'gDay' });
  }

  // ======================================================= INSIDE: the coach, every trip a game of roulette (8.6 - 13.0)
  // "Every trip outside the castle walls is a game of Russian roulette. Until one afternoon,"
  {
    const I = S.IN11, YO = { x: 560, y: 2084, s: 0.9 }, FLOOR = 1800, TH = 11.72;
    const view = t => { const m = ss(11.0, 12.3, t); return { town: 1 - m, mount: m }; };
    const fn = (t, c) => {
      const jolt = bump(t, TH, 1, 0.55);
      const yo = Object.assign(idle(t, 3, 0.3), YO, { tilt: -9 * jolt + 1.5 * Math.sin(t * 4.1), sway: -2.4 * jolt + 0.4 * Math.sin(t * 4.1) });
      const blinkShut = env(t, TH, TH + 0.04, TH + 0.16, TH + 0.26);
      const face = t < 10.5 ? { expr: 'anxious', look: t < 9.6 ? [0.75, 0.25] : [0.1, 0.05], lid: 0.18, brows: [-10, 2], sweat: 0.3, mouth: 'tight' }
        : t < TH ? { expr: 'anxious', look: [0.35 * Math.sin(t * 6), 0.05], lid: 0.16, brows: [-12, 3], sweat: 0.45, mouth: 'tight' }
        : t < 12.2 ? { expr: 'fear', wide: true, look: [0.7, -0.2], lid: Math.max(0.1, blinkShut * 0.95), brows: [-14, 5], sweat: 0.55, mouth: 'parted', open: 0.14 }
        : { expr: 'fear', look: [0.9, -0.05], lid: 0.12, brows: [-12, 4], sweat: 0.5, mouth: 'tight' };
      const fist = t > TH ? 'fist' : 'relaxed';
      const Y = Q.you(Object.assign({}, yo, { face, armR: { hand: [-118, -650], dir: [0.1, 1], pose: fist, facing: 'back' }, armL: { hand: [118, -650], dir: [-0.1, 1], pose: fist, facing: 'back' } }));
      const L = LT.inside, st = seated(yo, FLOOR, '#6a1020', 'inlap');
      const chars = st.clip + `<g clip-path="url(#inlap)">${lit(Y, L)}</g>` + st.lap + armsOver(Y, L) + handsLit(Y, L);
      const set = S.inside(t, { view: view(t), fresh: true, hole: t > TH ? (t - TH) / 0.3 : 0, bump: 1.5 * jolt });
      return X.compose(X.stage(set, chars), c) + C.vignette(0.55);
    };
    // open on the arrowhead through the door; pull back across the holed velvet to you; push to your face; the jolt;
    // swing to the window, where the mountains have come
    const cam = CAM(
      [[8.6, [1085, 1280, 0]], [9.2, [1060, 1250, 0], 'sine'], [10.4, [620, 1010, 0], 'io'], [11.6, [585, 925, 0], 'sine'], [11.84, [596, 930, 0], 'sine'], [12.6, [1060, 870, 0], 'io'], [13.0, [1125, 850, 0], 'lin']],
      [[8.6, 2.3], [9.2, 2.2, 'sine'], [10.4, 1.25, 'io'], [11.6, 2.05, 'sine'], [11.84, 2.11, 'sine'], [12.6, 2.0, 'io'], [13.0, 2.15, 'lin']]);
    const camJ = t => { const c = cam(t), j = bump(t, TH, 1, 0.45); return [c[0] + 10 * j, c[1] - 8 * j, c[2] * (1 + 0.04 * j), c[3] + 2.4 * j]; };
    ST.insideCam = camJ;
    X.shot('INSIDE', 8.6, 13.0, t => fn(t, hh(camJ(t), t, 0.25, 6)), { grade: 'gHall' });
    ST.insideYou = YO;
  }

  // ======================================================= PASS1: the mountain pass (12.2 - 25.65)
  // "you're riding through a mountain pass while the real king rides disguised as a common guard right beside your
  // window. You look ahead at the stone bridge and spot barrels of black gunpowder stacked beneath the arches.
  // You glance up at the cliffside and see the king's own brother"
  {
    const PS = S.PASS, CS = 0.3, CY = PS.ROAD;
    const run = PR.horseRun([[0, 'walk']], 10, 60, 0);
    const X0 = -1600 - run(12.2).x * CS;
    const door = t => X0 + run(t).x * CS;
    ST.pass1Door = door;
    const kingX = t => door(t) + 158;
    const passenger = t => () => {
      const face = t < 15.4 ? { expr: 'anxious', look: [0.65, 0.05], lid: 0.18, brows: [-9, 2], sweat: 0.25, mouth: 'tight' }
        : t < 18.86 ? { expr: 'anxious', look: [0.8, 0.25], lid: 0.2, brows: [-11, 3], sweat: 0.3, mouth: 'tight' }
        : { expr: 'fear', look: [0.95, 0], lid: 0.12, brows: [-12, 4], sweat: 0.35, mouth: 'tight' };
      return litN(Q.you(Object.assign(idle(t, 5, 0.3), { x: -10, y: PR.COACH.SEAT + 820, s: 1, tilt: 2 * Math.sin(t * 2.2), face })), LT.pass);
    };
    const driver = t => () => `<g clip-path="url(#p1drv)"><defs><clipPath id="p1drv"><rect x="0" y="-4000" width="3000" height="${-1650 + 4000}"/></clipPath></defs>${litN(Q.driver(Object.assign(idle(t, 13, 0.3), { x: 840, y: -850, s: 1, face: { expr: 'neutral', look: [0.7, 0], lid: 0.32, mouth: 'closed' }, armR: { hand: [140, -720], dir: [0.6, 0.5], pose: 'fist', facing: 'back' }, armL: { hand: [190, -740], dir: [0.6, 0.5], pose: 'fist', facing: 'back' } })), LT.pass)}</g>`;
    ST.passPassenger = passenger; ST.passDriver = driver;
    const kingFace = t => t < 15.9 ? { expr: 'stern', look: [0.7, 0], lid: 0.3, brows: [6, -2], mouth: 'tight' }
      : t < 18.0 ? { expr: 'stern', look: [-0.75, -0.12], lid: 0.32, brows: [8, -3], mouth: 'tight' }
      : { expr: 'stern', look: [0.8, 0], lid: 0.28, brows: [6, -2], mouth: 'tight' };
    const escort = (x, t, c, seed) => PR.rider({ who: 'escort', x, y: CY + 30, s: CS, g: run(t).g, c, t, lit: P => litN(P, LT.pass), pose: { face: { expr: 'grim', look: [0.6, 0], lid: 0.32 } }, leg: { legs: '#2e2a26', boot: '#1e1610', hem: '#1e3a6a' }, horse: { col: seed ? '#2a2420' : '#4a3426', low: '#141010', mane: '#0a0808', tack: { bridle: true, saddle: '#3a2414', blanket: '#1e3a6a' } } }).svg;
    ST.passEscort = escort;
    // the brother on the ridge: tiny, black, a torch held high
    const brotherRidge = (t, L) => {
      const bo = Object.assign(idle(t, 41, 0.3), { x: PS.RIDGE[0] - 20, y: PS.RIDGE[1] + 8, s: CS });
      const tw = R.toWorld(bo, [-250, -1260]);
      const B = Q.brother(Object.assign({}, bo, { face: { expr: 'stern', look: [-0.6, 0.5], lid: 0.32 }, armR: gripAt(bo, 'brother', tw, [1, 0], { detachHand: true, thumb: 'up' }), armL: { hand: [120, -780], dir: [-0.1, 1], pose: 'fist', facing: 'back' } }));
      return lit(B, L) + torchW(tw, CS, t, 5) + handsLit(B, L, 'R');
    };
    ST.brotherRidge = brotherRidge;
    const fn = t => {
      const c = hh(cam(t), t, t > 15 && t < 18.9 ? 0.18 : 0.3, 8);
      const r = run(t), co = PR.coach({ x: door(t), y: CY, s: CS, t, run: r, glass: 1, passenger: passenger(t), driver: driver(t), farLight: '#c8c0b0' });
      const king = PR.rider({ who: 'king', x: kingX(t), y: CY + 40, s: CS, g: r.g, c: r.c + 0.37, t, lit: P => litN(P, LT.pass), pose: { outfit: 'guard', face: kingFace(t) }, leg: { legs: '#2e2a26', boot: '#1e1610', hem: '#5a4630' }, horse: { col: '#5a3a24', low: '#2a1a10', tack: { bridle: true, saddle: '#3a2414' } } });
      const chars = escort(door(t) - 760, t, r.c + 0.2, 1) + co.svg + escort(door(t) + 1480, t, r.c + 0.62, 0) + king.svg + brotherRidge(t, LT.pass);
      ST.pass1 = { co, king };
      return X.compose(X.stage(S.pass(t, {}), chars), c) + C.vignette(0.45);
    };
    // the crane down from the peaks to the coach; tracking in to the king and to you; the long pull out along the
    // road to the bridge (a zoom dip keeps it smooth); the push into the powder; the tilt up the crag to the ridge
    const D = (t, dx, y, ) => [door(t) + dx, y];
    const brW = [PS.RIDGE[0] - 20, PS.RIDGE[1] + 8 - 1150 * CS];
    const cam = CAM(
      [[12.2, [-1100, 250, 0]], [13.1, [-1060, 380, 0], 'sine'], [14.7, [...D(14.7, 520, 1180), 0], 'io'], [16.3, [...D(16.3, 140, 1068), 0], 'io'], [17.7, [...D(17.7, 125, 1062), 0], 'sine'], [18.55, [...D(18.55, 64, 1056), 0], 'io'], [20.95, [4900, 1820, 0], 'io'], [22.4, [4900, 2160, 0], 'sine'], [23.3, [4960, 2200, 0], 'sine'], [24.75, [6600, 380, -0.8], 'io'], [25.65, [brW[0] + 10, brW[1] + 30, 0], 'io']],
      [[12.2, 0.5], [13.1, 0.52, 'sine'], [14.7, 0.66, 'io'], [16.3, 2.65, 'io'], [17.7, 2.75, 'sine'], [18.35, 2.45, 'io'], [20.2, 0.38, 'io'], [20.95, 0.46, 'sine'], [22.4, 0.85, 'sine'], [23.3, 0.9, 'sine'], [24.75, 0.66, 'io'], [25.65, 1.6, 'io']]);
    ST.pass1Cam = cam; ST.pass1BrW = brW;
    X.shot('PASS1', 12.2, 25.65, fn, { grade: 'gDay' });
  }
})(window);
