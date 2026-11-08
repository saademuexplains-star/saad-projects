// "The Calf's Blood" part 1: you, mad in the night street, watched from a window -> the king's doctor at his drawing
// of a calf joined to a man -> the transfusion (the calf's gentle eye, the silver tube, the blood running, the burn,
// the arching back, the pounding heart, the doctor who doesn't stop) -> the sickbed: the black urine, the vigil, the
// dawn, you waking calm.
// Rules kept: hands rigid on what they hold, hand paths off faces, camera moving on every line, every cut hidden in a
// matched move.
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
  const gripAt = (o, who, Gw, dW, extra = {}) => { const dl = nrm(R.dirLocal(o, dW)), gl = R.toLocal(o, Gw), gy = 0.33 * HAND[who]; return Object.assign({ hand: [gl[0] - dl[0] * gy, gl[1] - dl[1] * gy], dir: dl, pose: 'grip', facing: 'back' }, extra); };
  const fist = (o, who, Gw, dW, extra = {}) => gripAt(o, who, Gw, dW, Object.assign({ detachHand: true }, extra));
  const handAt = (o, Ww, dW, extra = {}) => Object.assign({ hand: R.toLocal(o, Ww), dir: nrm(R.dirLocal(o, dW)), pose: 'relaxed', facing: 'back' }, extra);
  const armsOver = (p, L, which = 'RL', view = true) => C.lit({ svg: (which.includes('R') ? p.armRsvg : '') + (which.includes('L') ? p.armLsvg : ''), info: p.info }, Object.assign(view ? { view: X.viewRect(1) } : {}, L)).body;
  const handsLit = (p, L, which = 'RL', view = true) => C.lit({ svg: (which.includes('R') ? p.handR || '' : '') + (which.includes('L') ? p.handL || '' : ''), info: p.info }, Object.assign(view ? { view: X.viewRect(1) } : {}, L)).body;
  const CAM = (pk, zk) => { const P = TK(pk), Z = TK(zk); return t => { const p = P(t); return [p[0], p[1], Z(t), p[2]]; }; };
  const headW = (o, p = [0, 0]) => R.toWorld(o, R.headPt(o, o.kind || 'man', p));
  const lit = X.lit;
  // a pose blend: two local hand targets / directions mixed by k
  const mixArm = (a, b, k) => Object.assign({}, k < 0.5 ? a : b, { hand: L2(a.hand, b.hand, k), dir: nrm(L2(a.dir || [0, 1], b.dir || [0, 1], k)) });
  const LT = {
    night: { from: [0.75, -0.5], shadow: '#080a16', shadowOp: 0.5, floor: '#10141e', floorOp: 0.32, contactOp: 0.42, key: '#c8d4f0', keyAdd: 0.02, rims: [{ from: [1, -0.3], col: '#ffb870', w: 7, op: 0.6 }, { from: [-1, -0.4], col: '#8aa0d8', w: 5, op: 0.5 }], face: { col: '#ffd8b0', op: 0.08 } },
    candle: { from: [-0.8, -0.3], shadow: '#140a04', shadowOp: 0.48, floor: '#1a0e08', floorOp: 0.3, contactOp: 0.4, key: '#ffd8a8', keyAdd: 0.05, rims: [{ from: [-1, -0.2], col: '#ffc070', w: 7, op: 0.6 }, { from: [1, -0.3], col: '#8a7aa8', w: 3, op: 0.22 }], face: { col: '#ffd8b0', op: 0.12 } },
    surgery: { from: [-0.6, -0.5], shadow: '#140a06', shadowOp: 0.46, floor: '#1a100a', floorOp: 0.3, contactOp: 0.4, key: '#ffdcb0', keyAdd: 0.05, rims: [{ from: [-1, -0.3], col: '#ffc078', w: 7, op: 0.55 }, { from: [1, -0.3], col: '#ffb070', w: 5, op: 0.4 }], face: { col: '#ffd8b8', op: 0.1 } },
    home: { from: [0.8, -0.2], shadow: '#140804', shadowOp: 0.48, floor: '#1a0c06', floorOp: 0.3, contactOp: 0.4, key: '#ffc890', keyAdd: 0.05, rims: [{ from: [1, -0.1], col: '#ff9a50', w: 8, op: 0.6 }, { from: [-1, -0.4], col: '#c8c0e0', w: 4, op: 0.3 }], face: { col: '#ffc8a0', op: 0.12 } },
  };
  // a woman kneeling: lowered by k of her height (the dress is clipped at the floor and pools there)
  const kneel = (o, floorY, col, id, k = 0.28) => {
    const oy = o.y + 1400 * k * o.s;
    return { o: Object.assign({}, o, { y: oy }), clip: `<defs><clipPath id="${id}"><rect x="${f(o.x - 1500)}" y="${f(floorY - 3000)}" width="3000" height="3000"/></clipPath></defs>`,
      pool: `<path d="M${f(o.x - 260 * o.s)},${f(floorY + 4)} C${f(o.x - 250 * o.s)},${f(floorY - 60 * o.s)} ${f(o.x + 250 * o.s)},${f(floorY - 60 * o.s)} ${f(o.x + 260 * o.s)},${f(floorY + 4)} C${f(o.x + 120 * o.s)},${f(floorY + 30 * o.s)} ${f(o.x - 120 * o.s)},${f(floorY + 30 * o.s)} ${f(o.x - 260 * o.s)},${f(floorY + 4)}Z" fill="${col}" stroke="#140c08" stroke-width="2.5" filter="url(#clothS)"/><path d="M${f(o.x - 140 * o.s)},${f(floorY - 30 * o.s)} C${f(o.x - 150 * o.s)},${f(floorY - 6)} ${f(o.x - 170 * o.s)},${f(floorY + 6)} ${f(o.x - 200 * o.s)},${f(floorY + 10)} M${f(o.x + 120 * o.s)},${f(floorY - 30 * o.s)} C${f(o.x + 140 * o.s)},${f(floorY - 6)} ${f(o.x + 160 * o.s)},${f(floorY + 6)} ${f(o.x + 190 * o.s)},${f(floorY + 10)}" stroke="#000" stroke-width="6" fill="none" opacity="0.25"/>` };
  };
  // a figure seated in a chair, front view, a pale linen sheet over the lap to the floor (the sheet catches the blood)
  const seatedSheet = (o, floorY, col, id) => {
    const fl = (floorY - o.y) / o.s, cut = o.y - 745 * o.s;
    const clip = `<defs><clipPath id="${id}"><rect x="${f(o.x - 2000)}" y="${f(cut - 4000)}" width="4000" height="4000"/></clipPath></defs>`;
    const d = `M-176,-772 L176,-772 C196,-706 204,-648 198,-606 C210,-560 226,-520 234,-480 C246,${f(fl - 260)} 256,${f(fl - 90)} 270,${f(fl - 10)} C120,${f(fl + 6)} -120,${f(fl + 6)} -270,${f(fl - 10)} C-256,${f(fl - 90)} -246,${f(fl - 260)} -234,-480 C-226,-520 -210,-560 -198,-606 C-204,-648 -196,-706 -176,-772Z`;
    let lap = `<defs><linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${shade(col, -0.32)}"/><stop offset="0.35" stop-color="${shade(col, 0.1)}"/><stop offset="0.6" stop-color="${col}"/><stop offset="1" stop-color="${shade(col, -0.38)}"/></linearGradient></defs><path d="${d}" fill="url(#${id}g)" stroke="#140c08" stroke-width="3" stroke-linejoin="round"/>`;
    lap += `<path d="M-170,-760 C-90,-746 90,-746 170,-760 C182,-700 190,-640 186,-612 C110,-598 -110,-598 -186,-612 C-190,-640 -182,-700 -170,-760Z" fill="#fff" opacity="0.12"/>`;
    for (const [x, k] of [[-170, 0.2], [-100, 0.14], [-30, 0.18], [40, 0.12], [110, 0.18], [176, 0.22]]) lap += `<path d="M${x},-590 C${x * 1.02},${f((fl - 590) / 2 - 290)} ${x * 1.1},${f(fl - 160)} ${x * 1.3},${f(fl - 12)}" stroke="#000" stroke-width="${f(5 + k * 18)}" fill="none" opacity="${k}" stroke-linecap="round"/>`;
    return { clip, cut, lap: `<g transform="translate(${f(o.x)},${f(o.y)}) scale(${f(o.s)})" filter="url(#clothS)">${lap}</g>` };
  };
  G.SHOTS_N = { wave, env, bump, idle, hh, scr, nrm, L2, add, gripAt, fist, handAt, armsOver, handsLit, CAM, headW, LT, kneel, seatedSheet, mixArm };
  const ST = {};
  G.CALF = ST;

  // ======================================================= STREET: night; you wander mad; the doctor watches (-1.0 - 4.3)
  // "It's 1667, you're a madman wandering the streets of Paris,"
  {
    const PA = S.PA, FY = 1880, YS = 0.84;
    const yx = t => 360 + 24 * Math.sin(t * 0.9 + 0.4) + 10 * Math.sin(t * 2.1);
    const drop = t => EZ.io(ss(1.7, 2.5, t));
    const youAt = t => { const i = idle(t, 5, 0.6); return Object.assign(i, { x: yx(t), y: FY, s: YS, sway: i.sway + 2.4 * Math.sin(t * 1.15) + 1.6 * Math.sin(t * 2.6), tilt: 4 * Math.sin(t * 1.3) + 8 * bump(t, 0.3, 1, 0.35) - 7 * bump(t, 1.25, 1, 0.35) + 5 * bump(t, 2.6, 1, 0.5) }); };
    ST.streetYou = youAt;
    const curtain = t => EZ.io(ss(2.55, 3.3, t));
    const fn = t => {
      const c = hh(cam(t), t, 0.32, 4);
      const yo = youAt(t), k = drop(t), L = LT.night;
      const tr = [3 * Math.sin(t * 13), 2 * Math.sin(t * 11.3)];
      // one fist twisting the shirt at his chest, the other hand clawing at the air; then lurching on, arms loose
      const rA = { hand: add([-70, -1010], tr), dir: [0.55, -0.6], pose: 'fist', facing: 'back' }, rB = { hand: [-206, -650], dir: [0.06, 1], pose: 'relaxed', facing: 'back' };
      const lA = { hand: add([285, -1060], tr, -1), dir: [0.55, -0.75], pose: 'open', facing: 'palm' }, lB = { hand: [262, -770], dir: [0.7, 0.6], pose: 'open', facing: 'back' };
      // the madness: a fixed manic grin under angry brows, burning red-rimmed eyes darting; then muttering, lurching
      const look = [0.55 * Math.sin(t * 2.7) + 0.2 * Math.sin(t * 5.1), 0.15 * Math.sin(t * 1.9) - 0.05];
      const face = k < 0.5 ? { expr: 'fear', mouth: 'grin', lid: 0.0, brows: [8, -5], look, redEyes: 0.85, bags: 0.65, sweat: 0.5, wide: true }
        : { expr: 'fear', mouth: 'talk', open: 0.05 + Q.talk(t, 0.14, 9), lid: 0.04, brows: [7, -4], look: L2(look, [0.6, -0.1], 0.6), redEyes: 0.85, bags: 0.65, sweat: 0.5, wide: true };
      const Y = Q.you(Object.assign({}, yo, { face, armR: mixArm(rA, rB, k), armL: mixArm(lA, lB, k) }));
      // the doctor in his lit window, holding the curtain aside, watching you
      const dO = Object.assign(idle(t, 31, 0.2), { x: 760, y: 925, s: 0.34 });
      const D = Q.doctor(Object.assign({}, dO, { face: { expr: 'stern', look: [-0.75, 0.62], lid: 0.3, brows: [7, -2] }, armR: { hand: [-150, -760], dir: [0.1, 1], pose: 'relaxed', facing: 'back' }, armL: { hand: [236, -1230], dir: [0.15, -1], pose: 'open', facing: 'back' } }));
      const [wx, wy, ww, wh] = PA.WINR;
      const win = `<defs><clipPath id="stdwin"><rect x="${wx}" y="${wy}" width="${ww}" height="${wh}"/></clipPath></defs><g clip-path="url(#stdwin)">${C.radial(wx + ww / 2, wy + wh * 0.4, 260, '#ffb860', 0.7, 'screen')}${lit(D, LT.candle)}</g>` + S.paWinFront('night', curtain(t), t);
      // a crow on the lamp bracket takes off as you lurch past
      const fly = ss(1.9, 2.1, t), cu = clamp((t - 1.95) / 2.2);
      const crow = S.crow(lerp(1215, 2100, EZ.in2(cu)), lerp(870, 200, EZ.out2(cu)) + 30 * Math.sin(cu * 6), 1.3, t, { fly, dir: 1 });
      ST.street = { Y, yo };
      return X.compose(X.stage(S.paris(t, { mode: 'night' }), win + crow + lit(Y, L)), c) + C.vignette(0.5);
    };
    // frame 0 already pushing in on the wild face; pull back and crane over the street at "streets of Paris";
    // tilt up to the doctor's lit window and keep rising through the cut
    const cam = CAM(
      [[-1.0, [372, 800, 0]], [1.0, [368, 806, 0.5], 'sine'], [1.65, [376, 826, -0.3], 'io'], [3.05, [560, 1170, 0], 'sine'], [3.5, [700, 820, 0], 'io'], [4.3, [748, 470, 0], 'in2']],
      [[-1.0, 2.0], [1.0, 2.45, 'sine'], [1.65, 2.6, 'out2'], [3.05, 0.92, 'sine'], [3.5, 1.06, 'io'], [4.3, 1.34, 'in2']]);
    ST.streetCam = cam;
    X.shot('STREET', -1.0, 4.3, fn, { grade: 'gNight' });
  }

  // ======================================================= STUDY: the king's doctor and his drawing (3.5 - 7.95)
  // "and the king's doctor decides to cure you by putting calf's blood into your veins."
  {
    const SB = S.ST15, DO = { x: SB.DOC[0], y: SB.DOC[1], s: SB.DS };
    const eyeD = PR.drawingPt(SB.BOARD[0], SB.BOARD[1], SB.BS, SB.BR, PR.DRAWING_CALF);
    ST.drawEye = eyeD;
    const fn = t => {
      const c = hh(cam(t), t, 0.25, 7);
      const ink = EZ.io(ss(5.8, 7.0, t));
      const set = S.study(t, { tubeDash: ink > 0.999 ? 'none' : `${f(132 * ink)} 400` });
      const turn = EZ.io(ss(4.35, 4.95, t)), pt = EZ.io(ss(4.75, 5.35, t)) * (1 - EZ.io(ss(6.6, 7.3, t)));
      const o = Object.assign(idle(t, 13, 0.3), DO);
      // he points across at the drawing (the arm reaches toward the man in the chair), a cold small smile at "cure you"
      const sh = R.toWorld(o, [107, -1107]), tgt = PR.drawingPt(SB.BOARD[0], SB.BOARD[1], SB.BS, SB.BR, [150, -40]);
      const pd = nrm([tgt[0] - sh[0], tgt[1] - sh[1]]), pw = add(sh, pd, 270 * DO.s);
      const lRest = { hand: [150, -760], dir: [-0.1, 1], pose: 'relaxed', facing: 'back' };
      const lPt = Object.assign(handAt(o, pw, pd), { pose: 'point' });
      const face = { expr: 'stern', look: L2([-0.7, 0.05], [0.85, 0.25], turn), lid: 0.3, brows: [7, -2], mouth: t > 5.15 && t < 6.9 ? 'smile' : 'tight', turn: lerp(-0.25, 0.3, turn) };
      const D = Q.doctor(Object.assign({}, o, { face, armL: mixArm(lRest, lPt, pt), armR: { hand: [-158, -790], dir: [0.1, 1], pose: 'relaxed', facing: 'back' } }));
      ST.study = { D, o };
      return X.compose(X.stage(set, lit(D, LT.candle)), c) + C.vignette(0.55);
    };
    // arrives tilting up from the candles to his face; follows his look across to the drawing; pushes in on the drawn
    // calf, accelerating into its eye
    const cam = CAM(
      [[3.5, [330, 1240, 0]], [4.6, [320, 770, 0], 'out2'], [5.5, [470, 820, 0], 'io'], [6.7, [680, 950, 0], 'io'], [7.95, [eyeD[0], eyeD[1], 0], 'in2']],
      [[3.5, 1.45], [4.6, 1.85, 'out2'], [5.5, 1.5, 'io'], [6.7, 2.3, 'io'], [7.95, 3.9, 'in2']]);
    ST.studyCam = cam;
    X.shot('STUDY', 3.5, 7.95, fn, { grade: 'gHall' });
  }

  // ======================================================= TRANS1: the first transfusion (7.15 - 20.05)
  // "He thinks a gentle animal's blood will make you gentle too, so he pushes a silver tube into your arm, and warm
  //  animal blood pours in. Your arm burns. Pain tears through your back and your heart pounds, but he doesn't stop."
  {
    const U = S.SU, CF = { x: U.CALF[0], y: U.CALF[1], s: U.CS, dir: -1 };
    const YO = { x: 860, y: 1985, s: 0.78 }, DO = { x: 420, y: 1760, s: 0.72 }, SG = { x: -660, y: 1760, s: 0.72 }, PB = { x: 862, y: 1640, s: 0.8 };
    const WR = [470, 1196], LW = [1036, 1384], SAG = 70;
    // the cannula's travel: held clear over the vein, then pushed in
    const outD = t => lerp(46, 0, EZ.io(ss(10.85, 11.7, t))) + 26 * (1 - ss(10.2, 10.85, t));
    const flow = t => EZ.sine(ss(12.85, 14.35, t));
    const burn = t => ss(14.55, 15.2, t);
    const arch = t => env(t, 15.85, 16.25, 16.8, 17.35);
    const beat = t => bump(t, 16.98, 1, 0.26) + bump(t, 17.33, 0.85, 0.26) + bump(t, 17.68, 0.7, 0.26);
    const strug = t => env(t, 8.7, 9.2, 10.5, 10.95);
    const youAt = t => { const i = idle(t, 11, 0.4), a = arch(t); return Object.assign(i, YO, { sway: i.sway + 1.2 * strug(t) * Math.sin(t * 6.3) - 1.0 * a + 0.8 * Math.sin(t * 9) * burn(t) * (1 - ss(17.9, 19, t)), tilt: 5 * strug(t) * Math.sin(t * 4.7 + 1) - 6 * bump(t, 11.0, 1, 0.5) - 5 * a, y: YO.y - 22 * a - 5 * beat(t) }); };
    const calfAt = t => PR.calf(Object.assign({}, CF, { t, blink: bump(t, 8.05, 1, 0.22) + bump(t, 9.05, 1, 0.22) + bump(t, 13.3, 1, 0.22) + bump(t, 16.4, 1, 0.22), fear: 0.65 * ss(12.9, 14.0, t), eyeWet: 0.7, head: 2 * Math.sin(t * 0.8) }));
    ST.calfEye = t => calfAt(t).eye;
    const fn = t => {
      const c = hh(cam(t), t, 0.26 + 0.25 * burn(t) * (1 - ss(17.9, 19, t)), 11);
      const L = LT.surgery, set = S.surgery(t, { mode: 'eve' });
      const yo = youAt(t), b = burn(t), a = arch(t);
      // ---- you, seated and held: the right arm strapped out on the board (sleeve rolled back), the left on the chair arm
      const st = seatedSheet(yo, U.FY, '#d8d0bc', 'tr1lap');
      const armR = { hand: R.toLocal(yo, WR), dir: nrm(R.dirLocal(yo, [-1, 0.04])), pose: b > 0.35 ? 'fist' : 'open', facing: 'palm', bare: true };
      const armL = { hand: R.toLocal(yo, add(LW, [2 * Math.sin(t * 14) * (strug(t) + b), 0])), dir: nrm(R.dirLocal(yo, [0.25, 1])), pose: 'fist', facing: 'back' };
      const yf = t < 10.9 ? { expr: 'fear', mouth: 'snarl', lid: 0.04, brows: [-12, 6], look: [-0.75, 0.35], wide: true, redEyes: 0.6, bags: 0.5, sweat: 0.5 }
        : t < 12.7 ? { expr: 'fear', mouth: 'cry', lid: 0.55 - 0.45 * ss(11.6, 12.2, t), brows: [-12, 6], look: [-0.8, 0.5], redEyes: 0.6, bags: 0.5, sweat: 0.6 }
        : t < 14.65 ? { expr: 'fear', mouth: 'parted', lid: 0.05, brows: [-12, 5], look: [-0.85, 0.55], wide: true, redEyes: 0.6, bags: 0.5, sweat: 0.7 }
        : t < 15.9 ? { expr: 'fear', mouth: 'snarl', lid: 0.42, brows: [-14, 8], look: [-0.7, 0.4], redEyes: 0.8, bags: 0.5, sweat: 1 }
        : t < 16.9 ? { expr: 'fear', mouth: 'snarl', open: 0.36, lid: 0.74, brows: [-15, 9], look: [0.1, -0.8], redEyes: 0.9, sweat: 1, bags: 0.6 }
        : t < 17.95 ? { expr: 'fear', mouth: 'parted', open: 0.22, lid: 0.02, brows: [-12, 6], look: [0.05, 0], wide: true, redEyes: 0.8, sweat: 1 }
        : { expr: 'grief', mouth: 'parted', open: 0.12 + 0.06 * Math.sin(t * 9), lid: 0.4, brows: [-10, 5], look: [-0.5, 0.3], redEyes: 0.8, sweat: 1, tears: 0.6 };
      const Y = Q.you(Object.assign({}, yo, { face: yf, armR, armL }));
      // the cannula site: a third of the way down the forearm from the elbow
      const E = R.toWorld(yo, Y.jR.E), W = R.toWorld(yo, Y.jR.W), fd = nrm([W[0] - E[0], W[1] - E[1]]);
      const site = L2(E, W, 0.34), into = nrm([fd[0] * 0.6, fd[1] * 0.6 + 0.8]);
      const can = PR.cannula(site, into, outD(t) + 3, 0.95);
      const cf = calfAt(t);
      const tube = PR.tube(cf.neck, can.end, t, { fill: flow(t), sag: SAG, w: 10 });
      // ---- the doctor behind the board: right hand on the tube, left hand on the cannula
      const dO = Object.assign(idle(t, 17, 0.25), DO);
      const tp = PR.tubePt(cf.neck, can.end, SAG, 0.8);
      const D = Q.doctor(Object.assign({}, dO, {
        face: t < 17.9 ? { expr: 'stern', look: [0.75, 0.75], lid: 0.38, brows: [7, -2], mouth: 'tight' } : { expr: 'stern', look: [0.7, 0.7], lid: 0.42, brows: [9, -3], mouth: 'tight' },
        armR: fist(dO, 'doctor', tp, [0.05, 1]), armL: fist(dO, 'doctor', add(can.end, into, 14), [0.35, 1]) }));
      // ---- the surgeon strokes the calf's head (gentle), then holds it as it panics
      const sO = Object.assign(idle(t, 23, 0.3), SG);
      const poll = (lx, ly) => [CF.x - lx * CF.s, CF.y + ly * CF.s];
      const stroke = 0.5 + 0.5 * Math.sin(t * 2.4);
      const sg = L2(poll(372, -578), poll(300, -500), stroke * (1 - ss(12.8, 13.4, t)));
      const SGn = Q.surgeon(Object.assign({}, sO, { face: { expr: t < 12.9 ? 'neutral' : 'anxious', look: [0.55, 0.4], lid: 0.3, mouth: 'closed' }, armL: Object.assign(handAt(sO, sg, [-0.6, 0.6], { pose: 'open', detachHand: true })), armR: { hand: [-170, -790], dir: [0.1, 1], pose: 'relaxed', facing: 'back' } }));
      // ---- the porter behind the chair, his hands pressing your shoulders down
      const pbO = Object.assign(idle(t, 29, 0.2), PB);
      const shR = add(R.toWorld(yo, [-190, -1060]), [0, -6]), shL = add(R.toWorld(yo, [190, -1060]), [0, -6]);
      const press = 10 * a + 4 * strug(t) * Math.sin(t * 6.3);
      const PBn = Q.porterB(Object.assign({}, pbO, { face: { expr: 'grim', look: [-0.2, 0.75], lid: 0.32, mouth: 'tight' }, armR: handAt(pbO, add(shR, [0, press]), [0.05, 1], { pose: 'open' }), armL: handAt(pbO, add(shL, [0, press]), [-0.05, 1], { pose: 'open' }) }));
      // ---- the burn: heat under the skin of the arm, veins darkening toward the shoulder; the heart's glow
      const shW = R.toWorld(yo, [-108, -1104]);
      let fx = '';
      if (b > 0.01) {
        fx += `<path d="M${f(W[0])},${f(W[1])} L${f(E[0])},${f(E[1])} L${f(shW[0])},${f(shW[1])}" stroke="#ff5a20" stroke-width="${f(48 * YO.s)}" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="${f(0.55 * b * (0.85 + 0.15 * Math.sin(t * 7)))}" filter="url(#b8)" style="mix-blend-mode:screen"/>`;
        const vk = ss(14.6, 15.9, t);
        for (const [p0, p1, ph] of [[site, E, 0], [E, shW, 1.3]]) { let d = `M${f(p0[0])},${f(p0[1])}`; const n = [-(p1[1] - p0[1]), p1[0] - p0[0]], nl = Math.hypot(n[0], n[1]); for (let i = 1; i <= 10; i++) { const u = i / 10 * vk; if (u <= 0) break; const q = L2(p0, p1, u), w = 5 * Math.sin(u * 14 + ph); d += ` L${f(q[0] + n[0] / nl * w)},${f(q[1] + n[1] / nl * w)}`; } fx += `<path d="${d}" stroke="#4a0a14" stroke-width="3" fill="none" opacity="${f(0.7 * b)}"/>`; }
      }
      const hb = beat(t);
      if (hb > 0.01) fx += C.radial(...R.toWorld(yo, [36, -1000]), 120, '#d01a1a', 0.3 * hb, 'screen');
      // blood beading where the cannula enters, once it is in
      const pin = ss(11.6, 11.9, t);
      if (pin > 0) fx += `<circle cx="${f(site[0] - into[0] * 2)}" cy="${f(site[1] + 6)}" r="${f(6 * pin)}" fill="#8a0a10"/><path d="M${f(site[0])},${f(site[1] + 6)} q-2,${f(16 * ss(12.2, 13.5, t))} 2,${f(30 * ss(12.2, 13.5, t))}" stroke="#8a0a10" stroke-width="4" fill="none"/>`;
      const table = S.suTable();
      const chars = lit(SGn, L) + table + cf.svg + handsLit(SGn, L) + lit(D, L) + lit(PBn, L) + S.suChairBack(YO.x, 1080) + st.clip + `<g clip-path="url(#tr1lap)">${lit(Y, L)}</g>` + S.suChairArms(YO.x, 1400) + st.lap + S.suBoard() + armsOver(Y, L) + handsLit(Y, L) + fx + armsOver(PBn, L) + tube + can.svg + handsLit(D, L);
      ST.tr1 = { Y, yo, site, D, dO, cf };
      return X.compose(X.stage(set, chars), c) + C.vignette(0.5 + 0.15 * hb) + (hb > 0.01 ? `<rect width="1080" height="1920" fill="#5a0008" opacity="${f(0.12 * hb)}" style="mix-blend-mode:multiply"/>` : '');
    };
    // the calf's gentle eye -> its head and the surgeon's stroking hand -> along the tube to you, wild -> the arm, the
    // cannula going in -> pull back as the blood runs the length of the tube -> the burning arm -> up to your face as
    // your back arches -> the heartbeat -> across to the doctor's cold face, pushing in
    const eye0 = PR.calf(Object.assign({}, CF, { t: 7.15 })).eye;
    const cam0 = CAM(
      [[7.15, [eye0[0], eye0[1], 0]], [8.6, [-430, 1070, 0], 'sine'], [10.3, [850, 990, 0.3], 'sine'], [11.1, [600, 1170, 0], 'io'], [12.2, [588, 1178, -0.3], 'sine'], [14.25, [265, 1160, 0], 'io'], [15.45, [565, 1185, 0.4], 'sine'], [16.45, [835, 1010, -0.4], 'io'], [17.9, [845, 1080, 0], 'sine'], [18.9, [430, 845, 0], 'io'], [20.05, [575, 1150, 0], 'in2']],
      [[7.15, 4.4], [8.6, 2.1, 'sine'], [10.3, 1.75, 'sine'], [11.1, 2.7, 'io'], [12.2, 3.0, 'sine'], [14.25, 0.7, 'io'], [15.45, 2.35, 'sine'], [16.45, 1.9, 'io'], [17.9, 1.8, 'sine'], [18.9, 2.5, 'io'], [20.05, 2.9, 'in2']]);
    const cam = t => { const c = cam0(t); return [c[0], c[1], c[2] * (1 + 0.05 * beat(t)), c[3]]; };
    ST.tr1Cam = cam;
    X.shot('TRANS1', 7.15, 20.05, fn, { grade: 'gHall' });
  }

  // ======================================================= BED: the night vigil -> dawn -> you wake calm (19.35 - 27.25)
  // "That night your urine comes out black, and the whole house waits for you to die. But the next morning you're
  //  calm, quiet and clear-headed,"
  {
    const HM = S.HM, HIP = [-520, 1462], YS = 0.62, FY = HM.FY;
    const POT = [250, 1742], CND = [385, 1792];
    const dawn = t => EZ.sine(ss(23.55, 24.55, t));
    const up = t => EZ.io(ss(25.0, 25.95, t));
    const recl = t => lerp(-64, -15, up(t));
    const wakeW = t => ss(25.15, 25.55, t);
    const fn = t => {
      const c = hh(cam(t), t, 0.22, 19);
      const L = LT.home, set = S.home(t, { mode: 'night', dawn: dawn(t) });
      const dk = dawn(t), u = up(t), a = recl(t);
      // ---- you, reclined on the pillows (drawn raw, rotated about the hip), the blanket to the chest
      const yo = Object.assign(idle(t, 41, 0.15), { x: HIP[0], y: HIP[1] + 745 * YS, s: YS, sway: 0, noLegs: true });
      const opn = ss(24.45, 24.95, t);
      const yf = t < 24.45 ? { expr: 'grief', mouth: 'parted', open: 0.06 + 0.03 * Math.sin(t * 3), lid: 1, brows: [-7, 3], look: [0, 0], sweat: 0.9, bags: 0.8 }
        : { expr: 'neutral', mouth: t > 25.3 ? 'smile' : 'closed', lid: lerp(1, 0.26, opn), brows: [-1, 1], look: L2([0, -0.2], [0.7, 0.15], ss(25.2, 25.8, t)), bags: lerp(0.8, 0.3, ss(24.5, 26, t)), sweat: lerp(0.9, 0.2, ss(24.5, 26, t)) };
      const rest = { hand: [-70, -905], dir: [0.7, 0.5], pose: 'relaxed', facing: 'back' }, restL = { hand: [90, -890], dir: [-0.6, 0.6], pose: 'relaxed', facing: 'back' };
      const lap = { hand: [-60, -780], dir: [0.8, 0.3], pose: 'relaxed', facing: 'back' }, lapL = { hand: [70, -775], dir: [-0.8, 0.3], pose: 'relaxed', facing: 'back' };
      const Y = Q.you(Object.assign({}, yo, { tilt: lerp(30, 4, u), face: yf, armR: mixArm(rest, lap, u), armL: mixArm(restL, lapL, u) }));
      const torsoBlank = `<path d="M${f(HIP[0] - 200 * YS)},${f(HIP[1] + 6)} L${f(HIP[0] - 196 * YS)},${f(HIP[1] - lerp(150, 30, u) * YS)} C${f(HIP[0] - 90 * YS)},${f(HIP[1] - lerp(180, 50, u) * YS)} ${f(HIP[0] + 90 * YS)},${f(HIP[1] - lerp(180, 50, u) * YS)} ${f(HIP[0] + 196 * YS)},${f(HIP[1] - lerp(150, 30, u) * YS)} L${f(HIP[0] + 200 * YS)},${f(HIP[1] + 6)}Z" fill="#6a3a2a" stroke="#140c08" stroke-width="2.4" filter="url(#cloth)"/><path d="M${f(HIP[0] - 196 * YS)},${f(HIP[1] - lerp(150, 30, u) * YS)} C${f(HIP[0] - 90 * YS)},${f(HIP[1] - lerp(180, 50, u) * YS)} ${f(HIP[0] + 90 * YS)},${f(HIP[1] - lerp(180, 50, u) * YS)} ${f(HIP[0] + 196 * YS)},${f(HIP[1] - lerp(150, 30, u) * YS)}" stroke="#e8dcc0" stroke-width="16" fill="none"/>`;
      const youSvg = `<g transform="rotate(${f(a)} ${HIP[0]} ${HIP[1]})"><defs><clipPath id="bedhip"><rect x="${HIP[0] - 1000}" y="${HIP[1] - 2000}" width="2000" height="2004"/></clipPath></defs><g clip-path="url(#bedhip)"><g filter="url(#skinS)">${Y.svg}</g></g>${torsoBlank}<g filter="url(#skinS)">${Y.armRsvg}${Y.armLsvg}</g></g>`;
      const blanket = S.hmBlanket(HIP[0] - 30, HM.BED[1] - 30, lerp(1420, 1440, u));
      // ---- your wife kneeling at the bedside: the candle on the floor, the pot of black urine; asleep at dawn; wakes
      const asleep = env(t, 23.75, 24.3, 25.0, 25.35);
      const wO = Object.assign(idle(t, 43, 0.3), { x: -105, y: FY, s: 0.7 });
      const kw = kneel(wO, FY, '#4e4842', 'wkneel');
      const wo = Object.assign({}, kw.o, { tilt: 12 * asleep - 4 * bump(t, 25.2, 1, 0.5) });
      const wf = t < 21.6 ? { expr: 'fear', mouth: 'parted', lid: 0.05, brows: [-11, 4], look: [0.4, 0.85], wide: true, tears: 0.3 }
        : t < 25.2 ? { expr: 'grief', mouth: 'closed', lid: lerp(0.35, 1, asleep), brows: [-9, 3], look: [-0.75, -0.1], tears: 0.5 }
        : { expr: 'fear', mouth: t < 25.75 ? 'parted' : 'smile', open: 0.18, lid: 0.04, brows: [-10, 3], look: [-0.8, -0.25], wide: true, tears: 0.7 };
      const onBed = [-262, 1468 + 4 * Math.sin(t * 1.3)];
      const W = Q.wife(Object.assign({}, wo, { face: wf, armR: handAt(wo, onBed, [-0.8, 0.4], { pose: 'relaxed' }), armL: mixArm({ hand: [60, -980], dir: [-0.5, -0.6], pose: 'relaxed', facing: 'back' }, { hand: [40, -1010], dir: [-0.4, -0.8], pose: 'open', facing: 'palm' }, ss(25.25, 25.6, t)) }));
      // ---- the priest at the back praying, dozing at dawn, waking; the old neighbour wringing her hands
      const pO = Object.assign(idle(t, 47, 0.25), { x: -390, y: 1640, s: 0.6 }), doze = env(t, 23.8, 24.4, 25.3, 25.7);
      const P = Q.priest(Object.assign({}, pO, { tilt: 9 * doze, face: { expr: t < 25.4 ? 'grief' : 'fear', look: t < 25.4 ? [-0.3, 0.6] : [-0.6, 0.4], lid: t < 25.4 ? lerp(0.55, 0.95, doze) : 0.05, mouth: t < 25.4 ? 'talk' : 'parted', open: t < 25.4 ? Q.talk(t, 0.08, 6) * (1 - doze) : 0.15, wide: t > 25.4 }, armR: { hand: [-26, -940], dir: [0.1, -1], pose: 'open', facing: 'palm' }, armL: { hand: [26, -940], dir: [-0.1, -1], pose: 'open', facing: 'palm' } }));
      const nO = Object.assign(idle(t, 53, 0.25), { x: -190, y: 1610, s: 0.56 }), wr = Math.sin(t * 3.2) * 12 * (1 - ss(25.4, 25.8, t));
      const N = Q.neighbor(Object.assign({}, nO, { face: { expr: t < 25.5 ? 'grief' : 'anxious', mouth: t < 25.5 ? 'cry' : 'parted', look: [-0.8, 0.35], lid: t < 25.5 ? 0.4 : 0.1 }, armR: { hand: [-34 + wr, -860], dir: [0.8, 0.2], pose: 'relaxed', facing: 'back' }, armL: { hand: [34 + wr, -880], dir: [-0.8, 0.2], pose: 'relaxed', facing: 'back' } }));
      // ---- the pot (its black liquid catching the candle) and the candle on the floor, burning down with the night
      const burnt = ss(23.6, 24.4, t), ch = lerp(110, 26, burnt);
      let cand = `<rect x="${CND[0] - 40}" y="${CND[1] - 14}" width="80" height="18" rx="6" fill="#6a5030" stroke="#140c08" stroke-width="2"/><rect x="${CND[0] - 13}" y="${f(CND[1] - 14 - ch)}" width="26" height="${f(ch)}" fill="#ece2c8" stroke="#140c08" stroke-width="1.6"/>`;
      if (t < 24.15) cand += PR.flame(CND[0], CND[1] - 16 - ch, 1.3, t) + C.radial(CND[0], CND[1] - 60 - ch, 520, '#ffb050', 0.35 * (1 - ss(23.9, 24.15, t)), 'screen');
      else cand += `<path d="M${CND[0]},${f(CND[1] - 16 - ch)} C${CND[0] - 12},${f(CND[1] - 60 - ch)} ${CND[0] + 16},${f(CND[1] - 110 - ch)} ${f(CND[0] + 8 * Math.sin(t * 2))},${f(CND[1] - 170 - ch)}" stroke="#d8d4cc" stroke-width="6" fill="none" opacity="${f(0.45 * (1 - ss(24.4, 25.4, t)))}" filter="url(#b2)"/>`;
      const pot = PR.chamberPot(POT[0], POT[1], 0.85, { glint: 6 * Math.sin(t * 2) });
      const chars = lit(N, L) + lit(P, L) + S.hmBedBack() + youSvg + blanket + pot + cand + kw.clip + `<g clip-path="url(#wkneel)">${lit(W, L)}</g>` + kw.pool + handsLit(W, L);
      ST.bed = { Y, yo, a, W, wo };
      return X.compose(X.stage(set, chars), c) + C.vignette(0.55 - 0.1 * dk);
    };
    // looking down into the pot by the candle, tilting up to her horrified face; pulling back over the whole house
    // keeping vigil; the night passes in a breath (the window greys to gold); in on your face as your eyes open; out
    // as you sit up and she wakes
    const cam = CAM(
      [[19.35, [250, 1712, 0]], [20.3, [205, 1650, 0.3], 'sine'], [21.6, [-30, 1250, 0], 'sine'], [22.7, [-330, 1290, 0], 'io'], [23.6, [-420, 1300, 0], 'sine'], [24.55, [-700, 1310, 0], 'io'], [25.2, [-760, 1310, 0], 'sine'], [26.3, [-430, 1230, 0], 'sine'], [27.25, [-420, 1190, 0], 'sine']],
      [[19.35, 2.8], [20.3, 3.0, 'sine'], [21.6, 2.25, 'sine'], [22.7, 1.0, 'io'], [23.6, 1.06, 'sine'], [24.55, 1.75, 'io'], [25.2, 2.3, 'sine'], [26.3, 1.42, 'sine'], [27.25, 1.36, 'sine']]);
    ST.bedCam = cam;
    ST.POT = POT;
    X.shot('BED', 19.35, 27.25, fn, { grade: 'gHall' });
  }
})(window);
