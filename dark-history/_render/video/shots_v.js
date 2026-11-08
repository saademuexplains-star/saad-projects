// "The Royal Fool" part 1 (France, 1340), shared helpers and the first three shots.
// CAP (-0.7 .. 5.62) "Your King gives you a cap with bells, makes you his royal fool, and grants you one strange right:"
//   frame 0 an extreme close-up of your eyes (a long lens from across the hall), pushing in; the lens zooms out as the
//   King's hands lower the belled cap onto your hood (it lands on "bells", the bells swing and ring); out wide: you
//   kneel before him in the great hall, the court applauds; we crane up to the King, who lifts one finger.
// FEAST (5.3 .. 8.15) "you're the only man in France allowed to tell him the truth."  Night, the high table: from the
//   King's face we draw back to find you at his ear, whispering, then glide along the lords who keep their mouths shut.
// JUGGLE (7.95 .. 12.8) "Every joke is a game of survival, because if he stops laughing, you stop breathing."  You juggle
//   three daggers before the high table and the King roars with laughter; the camera rises to him... the laugh dies;
//   down to you: two daggers caught, the third sticks in the floor at your feet; you hold your breath.
(function (G) {
  const X = G.ENG, T = G.ST3, Q = G.QCAST, C = G.CINE, R = G.RIG, PR = G.PROPS, SH = G.SH, HL = G.HALL, P17 = G.P17;
  const { ss, clamp, lerp, EZ } = X, { f } = R;
  const D2R = Math.PI / 180, TAU = Math.PI * 2;
  const V = G.FV = {};
  const env = (t, a, b, c, d) => ss(a, b, t) * (1 - ss(c, d, t));
  const nrm = v => { const n = Math.hypot(v[0], v[1]) || 1; return [v[0] / n, v[1] / n]; };
  const L2 = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
  const bump = (t, t0, a = 1, len = 0.35) => (t < t0 || t > t0 + len) ? 0 : a * Math.pow(Math.sin(Math.PI * (t - t0) / len), 2);
  V.env = env; V.nrm = nrm; V.L2 = L2; V.bump = bump;
  // one expression easing into the next (k 0..1): every number (gaze, lids, brows, mouth opening, sweat) slides; only
  // the named shapes (expr, mouth) change at the middle - a face never snaps from one frame to the next
  const FACE0 = { sweat: 0, open: 0, tears: 0 };
  V.faceMix = (a, b, k) => {
    if (k <= 0) return a; if (k >= 1) return b;
    const o = Object.assign({}, k < 0.5 ? a : b);
    for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
      let va = a[key], vb = b[key];
      if (va === undefined && key in FACE0) va = FACE0[key];
      if (vb === undefined && key in FACE0) vb = FACE0[key];
      if (typeof va === 'number' && typeof vb === 'number') o[key] = va + (vb - va) * k;
      else if (Array.isArray(va) && Array.isArray(vb) && va.length === vb.length) o[key] = va.map((x, i) => x + (vb[i] - x) * k);
    }
    // (expression and mouth are presets that switched at the half-way point - the face snapped in one frame - so the jaw,
    // the mouth corners, the mouth width and the widened eyes they set are resolved to numbers and blended)
    const res = F => { const X = R.EXPR[F.expr || 'neutral'] || {}, M = R.MOUTH[F.mouth || X.mouth] || R.MOUTH.closed, wv = F.wide ?? M.wide ?? 1; return { open: Math.max(0, F.open ?? M.open ?? 0), cd: F.cd ?? (M.cd !== undefined ? M.cd : X.cd ?? 1), mw: typeof wv === 'number' ? wv : (wv ? 1 : 0), eyeW: (F.wide || X.wide) ? 1 : 0 }; };
    const ra = res(a), rb = res(b);
    for (const key of ['open', 'cd', 'mw', 'eyeW']) o[key] = ra[key] + (rb[key] - ra[key]) * k;
    return o;
  };
  // a value that switches at t0 eased over w seconds either side
  V.at2 = (t, t0, w = 0.12) => ss(t0 - w, t0 + w, t);
  V.lerp2 = (a, b, k) => a.map((x, i) => x + (b[i] - x) * k);

  // ---------------------------------------------------------------- camera
  // keys [t, [x, y, z], [tx, ty, tz], fl, 'stop'?]: position and aim point -> yaw/pitch, splined; hand-held drift scaled
  // by the focal length (a long lens never shakes more on screen than a short one)
  V.aim = (p, q, fl) => { const dx = q[0] - p[0], dy = q[1] - p[1], dz = q[2] - p[2]; return [p[0], p[1], p[2], Math.atan2(dx, dz) / D2R, Math.atan2(dy, Math.hypot(dx, dz)) / D2R, fl]; };
  V.CAM = (keys, hand = 1, seed = 0) => {
    // (headings unwrapped key to key, so a camera facing back down the hall never spins the long way round)
    const ks = keys.map(k => [k[0], V.aim(k[1], k[2], k[3]), k[4]]);
    for (let i = 1; i < ks.length; i++) { const p = ks[i - 1][1][3]; while (ks[i][1][3] - p > 180) ks[i][1][3] -= 360; while (ks[i][1][3] - p < -180) ks[i][1][3] += 360; }
    const tr = SH.spline(ks);
    const fn = t => { const v = tr(t), hk = hand * 1200 / v[5]; return T.cam({ x: v[0], y: v[1], z: v[2], yaw: v[3] + X.noise(t * 0.8, seed) * 0.16 * hk, pitch: v[4] + X.noise(t * 0.7, seed + 7) * 0.12 * hk, fl: v[5] }); };
    fn.raw = tr; return fn;
  };

  // ---------------------------------------------------------------- lights
  V.LT = {
    day: { from: [0.7, -0.6], shadow: '#2a2030', shadowOp: 0.34, floor: '#2a2018', floorOp: 0.22, contactOp: 0.42, key: '#fff0d8', keyAdd: 0.06, rims: [{ from: [1, -0.4], col: '#fff0d0', w: 7, op: 0.55 }, { from: [-1, -0.3], col: '#a8b8e0', w: 4, op: 0.3 }], face: { col: '#fff0e0', op: 0.14 } },
    night: { from: [-0.6, -0.5], shadow: '#140a06', shadowOp: 0.46, floor: '#140a06', floorOp: 0.3, contactOp: 0.42, key: '#ffd0a0', keyAdd: 0.06, rims: [{ from: [-1, -0.3], col: '#ffb870', w: 7, op: 0.6 }, { from: [1, -0.3], col: '#ffa860', w: 5, op: 0.42 }], face: { col: '#ffd8b0', op: 0.15 } },
    room: { from: [0.55, -0.55], shadow: '#1a1218', shadowOp: 0.44, floor: '#1a120c', floorOp: 0.28, contactOp: 0.4, key: '#e8e4ec', keyAdd: 0.03, rims: [{ from: [1, -0.3], col: '#c8d0e8', w: 6, op: 0.5 }, { from: [-1, -0.2], col: '#ffb070', w: 6, op: 0.5 }], face: { col: '#ffd8b8', op: 0.12 } },
    candle: { from: [0, 0.9], shadow: '#140a06', shadowOp: 0.5, floor: '#140a06', floorOp: 0.3, contactOp: 0.4, key: '#ffc890', keyAdd: 0.1, rims: [{ from: [-1, -0.2], col: '#ffb070', w: 6, op: 0.55 }, { from: [1, -0.2], col: '#ffb070', w: 6, op: 0.5 }], face: { col: '#ffc890', op: 0.2 } }
  };

  // ---------------------------------------------------------------- people in the 3D sets
  V.idle = (t, seed, amp = 1) => ({ blink: Q.blink(t, seed), breath: Q.breath(t * 1.1 + seed) * 0.6, sway: X.noise(t * 0.45, seed) * 0.5 * amp });
  // a person standing at (x, z) with feet at y0 (cm); returns the rig placement or null
  V.at = (cam, x, z, hCm, kind = 'man', y0 = 0) => SH.at(cam, x, z, hCm, kind, y0);
  // head-local point (face centre 0,0) -> screen, through the same transform the rig gives the head
  V.headPt = (P, o, uv) => {
    const s = o.s || 1, b = o.breath || 0, sx = s * (1 - b * 0.0015), sy = s * (1 + b * 0.004), hsc = o.headScale ?? 1, tl = (o.tilt || 0) * D2R, sw = (o.sway || 0) * D2R;
    let x = uv[0] * hsc, y = uv[1] * hsc; [x, y] = [x * Math.cos(tl) - y * Math.sin(tl), x * Math.sin(tl) + y * Math.cos(tl)];
    y += P.D.headY + (1 - hsc) * 110; x *= sx; y *= sy; [x, y] = [x * Math.cos(sw) - y * Math.sin(sw), x * Math.sin(sw) + y * Math.cos(sw)];
    return [x + (o.x || 0), y + (o.y || 0)];
  };
  // a face as the rig draws it - screen centre, scale, turn (deg) - for the face-locked transitions
  V.headOf = o => ({ p: V.headPt({ D: { headY: R.DIMS.man.headY } }, o, [0, 0]), s: o.s, r: (o.sway || 0) + (o.tilt || 0) });
  V.gripK = (o, hand, Gw, dW, extra = {}) => SH.gripK(o, hand, Gw, dW, extra);
  V.handAt = (o, Ww, dW, extra = {}) => Object.assign({ hand: R.toLocal(o, Ww), dir: nrm(R.dirLocal(o, dW)), pose: 'relaxed', facing: 'back' }, extra);
  // (the hand direction turns through the angle between the two, at an even rate: averaging the two vectors swung a
  // hand that goes from hanging down to raised - nearly opposite directions - through half a turn in one frame)
  V.turnDir = (a, b, k) => { if (k <= 0) return nrm(a); if (k >= 1) return nrm(b); const a0 = Math.atan2(a[1], a[0]); let d = Math.atan2(b[1], b[0]) - a0; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return [Math.cos(a0 + d * k), Math.sin(a0 + d * k)]; };
  // (a change of hand pose or facing dissolves over the middle of the move - pose2 / facing2 drawn over the first with
  // opacity poseK - instead of switching at the half-way point: the true-size hands showed the switch as a snap)
  V.mixArm = (a, b, k) => {
    const o = Object.assign({}, k < 0.5 ? a : b, { hand: L2(a.hand, b.hand, k), dir: V.turnDir(a.dir || [0, 1], b.dir || [0, 1], k) });
    const pa = a.pose || 'relaxed', pb = b.pose || 'relaxed', fa = a.facing || 'back', fb = b.facing || 'back';
    delete o.pose2; delete o.facing2; delete o.poseK;
    if (pa !== pb || fa !== fb) { const flat = q => q === 'relaxed' || q === 'open', [k0, k1] = flat(pa) && flat(pb) && fa === fb ? [0.15, 0.85] : [0.42, 0.58]; if (k > k0 && k < k1) Object.assign(o, { pose: pa, facing: fa, pose2: pb, facing2: fb, poseK: ss(k0, k1, k) }); }
    return o;
  };
  V.rest = (side, D = R.DIMS.man, sp = 0) => ({ hand: [side * (D.shX - D.sw * 0.35 + sp), D.shY + D.sw * 0.55 + (D.ua + D.fa) * 0.975], dir: [-side * 0.05, 1], pose: 'relaxed', facing: 'back' });
  // the lit arms redrawn on top (over a table)
  V.armsOver = (P, L, which = 'RL') => C.lit({ svg: (which.includes('R') ? P.armRsvg : '') + (which.includes('L') ? P.armLsvg : ''), info: P.info }, L).body;
  V.handsLit = (P, L, which = 'RL') => C.lit({ svg: (which.includes('R') ? P.handR || '' : '') + (which.includes('L') ? P.handL || '' : ''), info: P.info }, L).body;
  V.actor = (d, fn) => ({ z: d, actor: true, svg: fn });
  // kneeling: lowered by drop cm, cut at the floor line (screen y of the floor under them)
  V.kneelClip = (id, floorY) => ({ defs: `<defs><clipPath id="${id}"><rect x="-3000" y="-6000" width="7000" height="${f(floorY + 6000 + 2)}"/></clipPath></defs>`, open: `<g clip-path="url(#${id})">`, close: '</g>' });
  // a seated figure in a long robe, front view (rig clipped at the hips; the robe falls over the knees to the floor)
  V.seated = (o, floorY, robe, id, hem = '#c9a040') => {
    const fl = (floorY - o.y) / o.s, cut = o.y - 745 * o.s, sh = R.shade;
    const clip = `<defs><clipPath id="${id}"><rect x="${f(o.x - 2000)}" y="${f(cut - 4000)}" width="4000" height="4000"/></clipPath></defs>`;
    const d = `M-186,-772 L186,-772 C200,-706 206,-648 198,-606 C204,-590 214,-560 220,-520 C232,${f(fl - 260)} 246,${f(fl - 90)} 262,${f(fl - 16)} C130,${f(fl + 8)} -130,${f(fl + 8)} -262,${f(fl - 16)} C-246,${f(fl - 90)} -232,${f(fl - 260)} -220,-520 C-214,-560 -204,-590 -198,-606 C-206,-648 -200,-706 -186,-772Z`;
    let lap = [-70, 70].map(x => `<path d="M${x - 52},${f(fl - 8)} C${x - 52},${f(fl - 34)} ${x + 52},${f(fl - 34)} ${x + 56},${f(fl - 8)} C${x + 30},${f(fl + 6)} ${x - 30},${f(fl + 6)} ${x - 52},${f(fl - 8)}Z" fill="#1a1208" stroke="#140808" stroke-width="2"/>`).join('');
    lap += `<defs><linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${sh(robe, -0.35)}"/><stop offset="0.3" stop-color="${sh(robe, 0.16)}"/><stop offset="0.5" stop-color="${robe}"/><stop offset="0.7" stop-color="${sh(robe, 0.06)}"/><stop offset="1" stop-color="${sh(robe, -0.4)}"/></linearGradient></defs><path d="${d}" fill="url(#${id}g)" stroke="#140808" stroke-width="3" stroke-linejoin="round"/>`;
    lap += `<path d="M-180,-760 C-100,-748 100,-748 180,-760 C190,-700 196,-640 190,-610 C120,-596 -120,-596 -190,-610 C-196,-640 -190,-700 -180,-760Z" fill="#fff" opacity="0.1"/>`;
    for (const [x, k] of [[-170, 0.2], [-110, 0.14], [-40, 0.2], [30, 0.12], [100, 0.18], [168, 0.22]]) lap += `<path d="M${x},-590 C${x * 1.02},${f((fl - 590) / 2 - 290)} ${x * 1.1},${f(fl - 160)} ${x * 1.32},${f(fl - 12)}" stroke="#000" stroke-width="${f(5 + k * 20)}" fill="none" opacity="${k}" stroke-linecap="round"/>`;
    for (const [lx, ly] of [[-120, -500], [110, -420], [-60, -300], [60, -200], [-130, -160]]) if (ly < fl - 40) lap += Q.lily(lx, ly, 0.6, '#d8b040');
    lap += `<path d="M-262,${f(fl - 16)} C-130,${f(fl + 8)} 130,${f(fl + 8)} 262,${f(fl - 16)}" stroke="${hem}" stroke-width="14" fill="none"/>`;
    return { clip, cut, lap: `<g transform="translate(${f(o.x)},${f(o.y)}) scale(${Math.round(o.s * 1e5) / 1e5})" filter="url(#clothS)">${lap}</g>` };
  };
  // a guard's halberd held upright in the right fist, its butt on the floor (world screen points from the rig)
  V.halberdArm = (o, hand, groundY, lean = 0) => {
    const gw = R.toWorld(o, [-150, -900]), ax = nrm([Math.sin(lean * D2R), -Math.cos(lean * D2R)]);
    const arm = V.gripK(o, hand, gw, SH.fingersFor('R', 'back', ax), { detachHand: true });
    const len = (groundY - gw[1]) / Math.max(0.2, -ax[1] * -1) ;
    const s = o.s, Lp = 2100 * s, b = [gw[0] - ax[0] * (groundY - gw[1]) / ax[1] * -1, groundY];
    const rot = Math.atan2(ax[1], ax[0]) / D2R;
    // the shaft from the floor up through the fist, the axe head and spike above
    const svg = `<g transform="translate(${f(gw[0])},${f(gw[1])}) rotate(${f(rot)}) scale(${Math.round(s * 1e5) / 1e5})"><rect x="${f(-(groundY - gw[1]) / s)}" y="-9" width="${f((groundY - gw[1]) / s + 900)}" height="18" rx="6" fill="#4a3018" stroke="#140c06" stroke-width="2"/><path d="M800,-12 L1010,-4 L1010,4 L800,12Z" fill="#c8ccd2" stroke="#140c06" stroke-width="2"/><path d="M760,-14 C760,-120 830,-170 900,-176 C870,-110 870,-60 860,-14Z" fill="#b8bec6" stroke="#140c06" stroke-width="2"/><path d="M760,14 L800,60 L820,14Z" fill="#9aa0a8" stroke="#140c06" stroke-width="2"/></g>`;
    return { arm, svg };
  };

  // ---------------------------------------------------------------- the cast in the hall (standard placements)
  const LORDS = [
    { mk: () => Q.chancellor, h: 174, seed: 11 }, { mk: () => Q.fatLord, h: 172, seed: 13 }, { mk: () => Q.youngLord, h: 178, seed: 17 }, { mk: () => Q.scarLord, h: 181, seed: 19 }
  ];
  V.LORDS = LORDS;
  // a standing courtier: face reaction by time, arms by mode ('rest' | 'clap' | 'cower' | 'point' | 'push')
  V.courtier = (cam, t, L, def, x, z, y0 = 0, mode = 'rest', face = {}, x2 = {}) => {
    const st = V.at(cam, x, z, def.h, 'man', y0); if (!st) return null;
    const id = V.idle(t, def.seed), o = { x: st.x, y: st.y, s: st.s, blink: id.blink, breath: id.breath, sway: id.sway + (x2.sway || 0), tilt: x2.tilt || 0 };
    const D = R.DIMS.man;
    let aR = V.rest(-1), aL = V.rest(1);
    // (x2.clapK 0..1 eases the hands up from the sides into the clapping and back down: no snap into it)
    const ck = x2.clapK ?? (mode === 'clap' ? 1 : 0);
    if (ck > 0) { const c = Math.sin(t * 15 + def.seed) * 0.5 + 0.5, gap = 10 + 34 * c, e = ss(0, 1, ck); aR = V.mixArm(aR, { hand: [-gap, -1000], dir: [0.35, -1], pose: 'open', facing: 'palm' }, e); aL = V.mixArm(aL, { hand: [gap, -1000], dir: [-0.35, -1], pose: 'open', facing: 'palm' }, e); }
    if (mode === 'cower') { aR = { hand: [-150, -1040], dir: [0.3, -1], pose: 'open', facing: 'palm' }; aL = { hand: [150, -1040], dir: [-0.3, -1], pose: 'open', facing: 'palm' }; }
    if (x2.arms) { if (x2.arms.R) aR = x2.arms.R; if (x2.arms.L) aL = x2.arms.L; }
    o.armR = aR; o.armL = aL;
    o.face = Object.assign({ expr: 'neutral', lid: 0.24 }, face);
    const P = def.mk()(o);
    return V.actor(st.d, () => SH.draw(P, o, null, L, '', { castOp: 0.24 }));
  };

  // ======================================================= 1. CAP
  {
    const FZ = 2520, KZ = 2565, KNEEL = 52, FH = 172, KH = 182;
    const faceY = FH * 1308 / 1450 - KNEEL, kFace = KH * 1308 / 1450;
    const cam = V.CAM([
      [-0.7, [0, faceY + 6, FZ - 430], [0, faceY - 3, FZ], 15500],
      [0.0, [0, faceY + 6, FZ - 430], [0, faceY - 2, FZ], 17000],
      [0.42, [2, faceY + 7, FZ - 430], [0, faceY - 1, FZ], 17600, 'stop'],
      [1.35, [4, faceY + 9, FZ - 440], [0, faceY + 8, FZ], 6800],
      [1.85, [6, faceY + 10, FZ - 450], [0, faceY + 9, FZ], 5900, 'stop'],
      [3.0, [80, 158, 2000], [0, 122, FZ + 40], 1150],
      [3.6, [70, 166, 2070], [0, 132, FZ + 40], 1250],
      [4.6, [44, 190, 2300], [0, kFace + 2, KZ], 1900],
      [5.8, [34, 192, 2350], [0, kFace + 4, KZ], 2150]
    ], 0.7, 3);
    V.capCam = cam;
    // the cap: lifted above your head in the King's hands, then lowered onto the hood (it lands at 1.42 on "bells")
    const LAND = 1.42, ARMS_SW = 2.05;
    // (the cap is already on your hood at frame 0 - the end of the film matches it - the King's hands come down and settle
    // it, a press, then his fingertip flicks the bell on 'bells')
    const lift = t => -5 * Math.sin(Math.PI * clamp((t - 0.82) / 0.3));
    const capK = t => t < LAND ? 0.25 * ss(0.8, 1.1, t) * Math.sin((t - 0.8) * 7) * (1 - ss(1.2, 1.4, t)) : 0.9 * Math.exp(-(t - LAND) * 1.6) * Math.sin((t - LAND) * 9);
    // (the jingle: a short soft shiver of the horns, slow enough to read as cloth and not as a judder)
    const capJ = t => t < LAND ? 0 : 0.6 * Math.exp(-(t - LAND) * 3.4) * Math.sin((t - LAND) * 21);
    V.capFace = tt => { const c = cam(tt), p = c.proj([0, faceY, FZ]); return p || [540, 960]; };
    // (the fool's and the King's faces exactly as fn below poses them)
    V.capFoolHead = tt => { const c = cam(tt), st = V.at(c, 0, FZ, FH, 'man', -KNEEL); if (!st) return null; const id = V.idle(tt, 3, 0.4); return V.headOf({ x: st.x, y: st.y, s: st.s, breath: id.breath, sway: id.sway * 0.4, tilt: -2 + 2 * Math.sin(Math.max(0, tt - 0.5) * 0.9) + bump(tt, LAND - 0.05, 3, 0.4) }); };
    V.capKingHead = tt => { const c = cam(tt), st = V.at(c, 0, KZ, KH, 'man', 0); if (!st) return null; const kid = V.idle(tt, 9, 0.4), kb1 = ss(1.85, 2.2, tt), kb2 = ss(3.25, 3.6, tt); return V.headOf({ x: st.x, y: st.y, s: st.s, breath: kid.breath, sway: kid.sway * 0.5, tilt: lerp(lerp(4, -3, kb1), 2, kb2) }); };
    const fn = t => {
      SH.still();
      const c = cam(t), L = V.LT.day, A = [];
      // ---- you, kneeling: eyes up at the King, a hopeful nervous grin, then the grin of the fool
      const fst = V.at(c, 0, FZ, FH, 'man', -KNEEL);
      if (fst) {
        const id = V.idle(t, 3, 0.4), fo = { x: fst.x, y: fst.y, s: fst.s, blink: id.blink * (1 - env(t, 0.5, 0.6, 1.2, 1.3)), breath: id.breath, sway: id.sway * 0.4 };
        const landed = ss(LAND, LAND + 0.3, t), k33 = V.at2(t, 3.3);
        fo.tilt = -2 + 2 * Math.sin(Math.max(0, t - 0.5) * 0.9) + bump(t, LAND - 0.05, 3, 0.4);
        fo.face = V.faceMix({ expr: 'anxious', look: [0.02, -0.75], lid: 0.1, brows: [-7, 2], mouth: 'tight' },
          V.faceMix({ expr: 'neutral', look: [0.1, -0.7], lid: 0.2, brows: [-3, 5], mouth: 'grin' }, { expr: 'neutral', look: [0.05, -0.8], lid: 0.2, brows: [-3, 5], mouth: 'smile' }, k33), landed);
        fo.armR = { hand: [-120, -880], dir: [0.4, 0.8], pose: 'relaxed', facing: 'back' }; fo.armL = { hand: [120, -880], dir: [-0.4, 0.8], pose: 'relaxed', facing: 'back' };
        const FP = Q.fool(fo);
        const floorP = c.proj([0, 0, FZ]);
        // the cap (in the fool's head space, lifted, swinging)
        const lu = lift(t), rot = t < LAND ? 4 * Math.sin(t * 1.7) * (lu / 170) : 0;
        const capSvg = `<g transform="${Q.headT(FP, fo)} translate(0,${f(-lu)}) rotate(${f(rot)},0,-150)">${Q.FOOLCAP('fcA', capK(t), capJ(t))}</g>`;
        // the King behind you: his hands on the cap's band until it lands, then away, presenting you; one finger up
        const kst = V.at(c, 0, KZ, KH, 'man', 0);
        let kingSvg = '', kTop = '';
        if (kst) {
          const kid = V.idle(t, 9, 0.4), ko = { x: kst.x, y: kst.y, s: kst.s, blink: kid.blink, breath: kid.breath, sway: kid.sway * 0.5 };
          // his hands come down over the top of the cap and settle it by the crown (palms on the dome either side of the
          // red horn, fingers down: never reaching through the side horns' loops), a fingertip flicks the right bell,
          // then both hands lift clear above the cap before they go anywhere else
          const hp = s => V.headPt(FP, fo, [s * 94, -180 - lu]);
          const down = EZ.io(ss(0.35, 0.85, t)), above = s => V.handAt(ko, V.headPt(FP, fo, [s * 130, -640]), [s * 0.2, 1], { pose: 'open', facing: 'back' });
          // (no bell flick: the bell hangs at the far tip of the green horn, so a fingertip reaching for it came down
          // past the horn and showed beside your ear - both palms stay on the dome until the cap has landed)
          // (they come down outside his shoulders and close in over the cap only at the end: a straight path from above
          // passed through his shoulders on screen, where the arm solver threw each hand to the other side in one frame)
          // (straight down beside the cap, then in onto the dome, the corner rounded: the hand stays a forearm's length
          // from his shoulder, so the arm turns round it at an even pace)
          const kD = ss(0.35, 1.0, t), hold = s => { const x = lerp(210, 94, EZ.io(clamp((kD - 0.55) / 0.45))), y = lerp(-600, -232 - lu, EZ.io(clamp(kD / 0.75))); return Object.assign(V.handAt(ko, V.headPt(FP, fo, [s * x, y]), [s * 0.2, 1], { pose: 'open', facing: 'back' }), { detachHand: true }); };
          const rel = ss(LAND + 0.08, LAND + 0.55, t);
          const present = { hand: [-360, -980], dir: [-0.6, -0.5], pose: 'open', facing: 'palm' };
          const restL = { hand: [150, -800], dir: [-0.1, 1], pose: 'relaxed', facing: 'back' };
          const one = { hand: [210, -1240], dir: [0.05, -1], pose: 'point', facing: 'palm' };
          // (clear of the cap: up and out over the side horns to beside his shoulders, never across his own face)
          const up = s => V.handAt(ko, V.headPt(FP, fo, [s * 350, -262]), [s * 0.3, 0.95], { pose: 'open', facing: 'back' });
          let aR = hold(-1), aL = hold(1);
          // (the release goes out before it goes up, so the hands never swing close past his shoulders)
          const mixXY = (a, b, kx, ky) => Object.assign({}, ky < 0.5 ? a : b, { hand: [lerp(a.hand[0], b.hand[0], kx), lerp(a.hand[1], b.hand[1], ky)], dir: nrm(V.lerp2(a.dir, b.dir, ky)) });
          if (rel > 0) { const kx = EZ.io(rel), ky = rel * rel; aR = mixXY(aR, up(-1), kx, ky); aL = mixXY(aL, up(1), kx, ky); }
          const pk = EZ.io(ss(2.05, 2.65, t)) * (1 - EZ.io(ss(3.6, 4.1, t))), lk = EZ.io(ss(2.05, 2.65, t));
          // (the raised finger swings out round his shoulder on its way up: straight up, the hand passed over the shoulder
          // joint on screen, where the elbow swung half a turn in two frames)
          if (t > LAND + 0.55) { aR = V.mixArm(up(-1), present, pk); aR = V.mixArm(aR, V.rest(-1), EZ.io(ss(3.6, 4.1, t))); aL = V.mixArm(up(1), restL, lk); const k1 = EZ.io(ss(3.95, 4.6, t)); aL = V.mixArm(aL, one, k1); aL.hand = [aL.hand[0] + 90 * Math.sin(Math.PI * k1), aL.hand[1]]; }
          aR.detachHand = true; aL.detachHand = true;
          // (his palms point down onto the dome while his forearms come up towards the camera from the elbows: the wrist
          // limit flipped each hand from one side to the other in a frame as the cap settled - so they are drawn free)
          aR.wristFree = aL.wristFree = true;
          // (his hands rest on the cap only a hand's breadth below his shoulders, so on the way down the arm solver's
          // nearest-to-rest elbow switched sides: hold the elbows out, as they rest on the cap, until the hands are clear)
          // (each elbow is directed through the whole shot and rolls over half a second when the pose calls for the other
          // side: out on the cap, down as he presents you, out again at rest; the left out on the cap, then the other way
          // as the arm lowers, ready for the raised finger)
          // (the hold is let go while the hands still rest on the cap, where it puts the elbows where the arm would anyway;
          // then, the arms folded flat with the hands by the shoulders, each elbow crosses to the other solution where the
          // two meet (a narrow zone): held through the lift, the elbows were dragged round the far side in a few frames)
          aR.elbowM = 0; aL.elbowM = 1; aR.elbowMK = aL.elbowMK = EZ.io(ss(0.8, 1.05, t)) * (1 - EZ.io(ss(1.2, 1.45, t)));
          aR.elbowSoft = aL.elbowSoft = 1 - 0.85 * env(t, 1.3, 1.5, 2.1, 2.45);
          // (they reach forward to the cap: both halves of each arm come toward the lens and are drawn short - with the hands
          // a hand's breadth below the shoulders an arm at full length folded flat, and a small move of the hand swung the
          // elbow round in a frame. Eased in as the hands come down, out as they lift away)
          { const fk = ss(0.4, 0.85, t) * (1 - ss(1.6, 2.0, t)); if (fk > 0) { aR.us = aL.us = 1 - 0.5 * fk; aR.fs = aL.fs = 1 - 0.5 * fk; } }
          // (as the hands slide out past the shoulders each elbow turns to the other side of the arm: timed over a seventh
          // of a second, not left to the solver's switch, which turned it in one frame)
          { const xk = ss(1.54, 1.58, t) * (1 - ss(1.76, 1.8, t)), xm = EZ.io(ss(1.58, 1.76, t)); if (xk > 0) { aR.elbowM = xm; aL.elbowM = 1 - xm; aR.elbowMK = aL.elbowMK = xk; } }
          aR.dbgTag = 'kR'; aL.dbgTag = 'kL';
          // (his head, gaze and face ease from one beat to the next over a quarter second: no snaps)
          const kb1 = ss(1.85, 2.2, t), kb2 = ss(3.25, 3.6, t);
          ko.tilt = lerp(lerp(4, -3, kb1), 2, kb2);
          const talkK = env(t, 4.25, 4.35, 5.15, 5.25);
          ko.face = V.faceMix(V.faceMix({ expr: 'neutral', look: [0, 0.85], lid: 0.36, mouth: 'smile', brows: [2, 0] }, { expr: 'neutral', look: [-0.5, 0.2], lid: 0.32, mouth: 'grin', brows: [-2, 3] }, kb1),
            { expr: 'stern', look: [0, 0.55], lid: lerp(0.32, 0.4, ss(4.2, 4.8, t)), mouth: talkK > 0.5 ? 'talk' : 'smile', open: Q.talk(t, 0.18, 5) * talkK, brows: [5, -3] }, kb2);
          ko.armR = aR; ko.armL = aL;
          const KP = Q.king(ko);
          kingSvg = SH.draw(KP, ko, null, L, '', { castOp: 0.2 });
          // while he holds the cap his arms and hands are drawn over it (they come down over its top); once they have
          // lifted clear above it they go back behind you with his body
          if (t < ARMS_SW) kTop = V.armsOver(KP, L) + V.handsLit(KP, L); else kingSvg += V.handsLit(KP, L);
        }
        const kn = V.kneelClip('fkA', floorP ? floorP[1] : 4000);
        // the tunic spread on the floor round the knees (green on your right, saffron on your left)
        let pool = '';
        if (floorP) { const y = floorP[1], s = fo.s, x = fo.x; pool = `<g filter="url(#clothS)"><path d="M${f(x - 236 * s)},${f(y + 2)} C${f(x - 226 * s)},${f(y - 46 * s)} ${f(x - 60 * s)},${f(y - 52 * s)} ${f(x)},${f(y - 50 * s)} L${f(x)},${f(y + 24 * s)} C${f(x - 110 * s)},${f(y + 26 * s)} ${f(x - 200 * s)},${f(y + 16 * s)} ${f(x - 236 * s)},${f(y + 2)}Z" fill="#2e6b3a" stroke="#140c08" stroke-width="2"/><path d="M${f(x + 236 * s)},${f(y + 2)} C${f(x + 226 * s)},${f(y - 46 * s)} ${f(x + 60 * s)},${f(y - 52 * s)} ${f(x)},${f(y - 50 * s)} L${f(x)},${f(y + 24 * s)} C${f(x + 110 * s)},${f(y + 26 * s)} ${f(x + 200 * s)},${f(y + 16 * s)} ${f(x + 236 * s)},${f(y + 2)}Z" fill="#c8961e" stroke="#140c08" stroke-width="2"/><path d="M${f(x - 150 * s)},${f(y - 30 * s)} C${f(x - 160 * s)},${f(y - 6 * s)} ${f(x - 180 * s)},${f(y + 6 * s)} ${f(x - 205 * s)},${f(y + 9 * s)} M${f(x + 130 * s)},${f(y - 30 * s)} C${f(x + 145 * s)},${f(y - 6 * s)} ${f(x + 165 * s)},${f(y + 6 * s)} ${f(x + 195 * s)},${f(y + 9 * s)}" stroke="#000" stroke-width="${f(6 * s)}" fill="none" opacity="0.25"/></g>`; }
        A.push(V.actor(fst.d - 10, () => kn.defs + kn.open + SH.draw(FP, fo, null, L, '', { noCast: 1 }) + kn.close + pool + capSvg + kTop));
        if (kst) A.push(V.actor(kst.d, () => kingSvg));
      }
      // ---- the court: the Queen and the guards on the dais, the lords along the nave, applauding
      const clapK = env(t, 1.9, 2.2, 3.5, 3.9);
      const qst = V.at(c, -210, 2780, 164, 'woman', 40);
      if (qst) { const qi = V.idle(t, 23), qo = { x: qst.x, y: qst.y, s: qst.s, blink: qi.blink, breath: qi.breath, sway: qi.sway, face: { expr: 'neutral', look: [0.6, 0.4], lid: 0.32, mouth: clapK > 0.3 ? 'smile' : 'closed' }, armR: { hand: [-60, -860], dir: [0.6, 0.6], pose: 'relaxed', facing: 'back' }, armL: { hand: [60, -870], dir: [-0.6, 0.6], pose: 'relaxed', facing: 'back' } }; const QP = Q.queen(qo); A.push(V.actor(qst.d, () => SH.draw(QP, qo, null, L, '', { castOp: 0.2 }))); }
      for (const [gx, mk, sd] of [[-360, () => Q.guardA, 31], [360, () => Q.guardB, 37]]) {
        const gst = V.at(c, gx, 2900, 184, 'man', 60); if (!gst) continue;
        const gi = V.idle(t, sd, 0.3), go = { x: gst.x, y: gst.y, s: gst.s, blink: gi.blink, breath: gi.breath, sway: gi.sway * 0.3, face: { expr: 'stern', look: [gx < 0 ? 0.3 : -0.3, 0.3], lid: 0.3 } };
        const gy = c.proj([gx, 60, 2900]), hb = V.halberdArm(go, 120, gy ? gy[1] : gst.y, 0);
        go.armR = hb.arm; go.armL = V.rest(1);
        const GP = mk()(go);
        A.push(V.actor(gst.d, () => SH.draw(GP, go, null, L, hb.svg, { castOp: 0.2 }) + V.handsLit(GP, L, 'R')));
      }
      const lp = [[-95, 2290], [150, 2320], [-260, 2630], [265, 2650]];
      LORDS.forEach((def, i) => { const [x, z] = lp[i]; const a = V.courtier(c, t, L, def, x, z, 0, 'rest', { expr: 'neutral', look: [x < 0 ? 0.45 : -0.45, 0.1], lid: 0.26, mouth: clapK > 0.3 ? (i % 2 ? 'grin' : 'smile') : 'closed' }, { clapK }); if (a) A.push(a); });
      const dofK = clamp((c.fl - 1500) / 9000);
      return HL.render(c, t, { night: 0, dof: 6 * dofK + 1.2 * (1 - dofK), focus: 520 }, A) + C.vignette(0.35);
    };
    X.shot('CAP', -0.7, 5.75, fn, { grade: 'gHall' });
  }

  // ======================================================= 2. FEAST: the whisper at the high table (night)
  // the King sits in his throne behind the high table; you lean in at his right; the Queen at his left; the lords
  const FEAST = V.FEAST = { KX: 0, KZ: 3022, KY0: 18, TZ: 2900, TOP: 136, SEATS: [[-230, 3000], [235, 3002], [-360, 2995], [365, 2998]] };
  // the King seated (shared by FEAST and JUGGLE): mood 0 laugh .. returns { svg, hands, P, o, st }
  V.seatedKing = (c, t, L, face, arms, x2 = {}) => {
    const kst = V.at(c, FEAST.KX, FEAST.KZ, 182, 'man', FEAST.KY0); if (!kst) return null;
    // x2.table: his hands rest on the high table's top (or slap it) - { R: [x, lift, dir, pose], L: [...] } in cm from his
    // middle - and his forearms and hands are drawn on the table's cloth under its plates (K.front, given to HL.render as
    // feastHands). He sits behind
    // its back edge, so hands at the table's height there ran under its edge and vanished, his arms cut off at the cloth
    let armsT = arms;
    if (x2.table) {
      const o0 = { x: kst.x, y: kst.y, s: kst.s }, yH = FEAST.TOP + 2, zH = 2966;
      const on = (sd, sp, base) => { if (!sp) return base; const p = c.proj([FEAST.KX + sp[0], yH + (sp[1] || 0), zH]); return p ? V.handAt(o0, p, sp[2] || [-sd * 0.15, 1], { pose: sp[3] || 'relaxed', facing: 'back', wristFree: true }) : base; };
      armsT = { R: on(-1, x2.table.R, arms.R), L: on(1, x2.table.L, arms.L) };
    }
    const kid = V.idle(t, 9, 0.4), ko = { x: kst.x, y: kst.y, s: kst.s, blink: kid.blink, breath: kid.breath + (x2.breath || 0), sway: kid.sway * 0.4 + (x2.sway || 0), tilt: x2.tilt || 0, face, armR: armsT.R, armL: armsT.L };
    const KP = Q.king(ko), fp = c.proj([FEAST.KX, 60, FEAST.KZ]);
    const st = V.seated(ko, fp ? fp[1] : ko.y, '#22348a', 'kgLap' + (x2.id || ''));
    return { st: kst, P: KP, o: ko, svg: st.clip + `<g clip-path="url(#kgLap${x2.id || ''})">${SH.draw(KP, ko, null, L, '', { noCast: 1 })}</g>` + st.lap + (x2.over ? V.armsOver(KP, L) : ''), hands: V.handsLit(KP, L),
      front: x2.table ? V.armsOver(KP, L) : '', frontZ: x2.table ? c.dist([0, FEAST.TOP, FEAST.TZ - 14]) : 0 };
  };
  // a lord seated at the high table (only above the table shows)
  V.seatedLord = (c, t, L, def, x, z, face, arms = {}, x2 = {}) => {
    const st = V.at(c, x, z, def.h, 'man', FEAST.KY0); if (!st) return null;
    const id = V.idle(t, def.seed), o = { x: st.x, y: st.y, s: st.s, blink: id.blink, breath: id.breath, sway: id.sway + (x2.sway || 0), tilt: x2.tilt || 0, face, armR: arms.R || { hand: [-150, -930], dir: [0.5, 0.7], pose: 'relaxed', facing: 'back' }, armL: arms.L || { hand: [150, -930], dir: [-0.5, 0.7], pose: 'relaxed', facing: 'back' } };
    const P = def.mk()(o);
    return V.actor(st.d, () => SH.draw(P, o, null, L, '', { noCast: 1 }));
  };
  {
    const F = FEAST, kFace = [0, F.KY0 + 182 * 1308 / 1450, F.KZ];
    const cam = V.CAM([
      [5.0, [8, kFace[1] + 22, F.KZ - 240], [0, kFace[1] + 2, F.KZ], 2300],
      [5.6, [10, kFace[1] + 20, F.KZ - 262], [-22, kFace[1], F.KZ], 2150],
      [6.6, [-60, 178, F.KZ - 420], [-40, 168, F.KZ], 1500],
      [7.4, [60, 176, F.KZ - 470], [150, 160, F.KZ], 1450],
      [8.4, [190, 175, F.KZ - 470], [290, 158, F.KZ], 1520]
    ], 0.6, 5);
    V.feastCam = cam;
    V.feastKingFace = tt => cam(tt).proj(kFace) || [540, 960];
    V.feastKingHead = tt => { const c = cam(tt), st = V.at(c, F.KX, F.KZ, 182, 'man', F.KY0); if (!st) return null; const kid = V.idle(tt, 9, 0.4); return V.headOf({ x: st.x, y: st.y, s: st.s, breath: kid.breath, sway: kid.sway * 0.4, tilt: -4 + 2 * ss(6.8, 7.4, tt) }); };
    const fn = t => {
      SH.still();
      const c = cam(t), L = V.LT.night, A = [];
      // the King: listening, eyes sliding to you, a slow smile; his hands resting on the table
      const kFaceO = { expr: 'neutral', look: [-0.55, 0.05], lid: 0.38, mouth: t > 6.9 ? 'smile' : 'closed', brows: [lerp(3, -2, V.at2(t, 6.9)), 2] };
      const K = V.seatedKing(c, t, L, kFaceO, { R: { hand: [-160, -930], dir: [0.6, 0.6], pose: 'relaxed', facing: 'back' }, L: { hand: [160, -930], dir: [-0.6, 0.6], pose: 'relaxed', facing: 'back' } }, { tilt: -4 + 2 * ss(6.8, 7.4, t), id: 'B', table: { R: [-27, 0, [1, 0.3]], L: [27, 0, [-1, 0.3]] } });
      if (K) A.push(V.actor(K.st.d, () => K.svg));
      // you: leaning in at his ear (crouched behind the table), a hand cupped beside your mouth on his side
      const yst = V.at(c, -78, F.KZ - 30, 172, 'man', 42);
      if (yst) {
        const yi = V.idle(t, 3, 0.3), yo = { x: yst.x, y: yst.y, s: yst.s, blink: yi.blink, breath: yi.breath, sway: 7 + yi.sway * 0.3, tilt: 9 };
        yo.face = { expr: 'neutral', look: [0.6, 0.1], lid: 0.3, mouth: 'talk', open: Q.talk(t, 0.12, 8), brows: [-3, 4] };
        yo.armL = { hand: [120, -1170], dir: [-0.1, -1], pose: 'open', facing: 'back' }; yo.armR = { hand: [-140, -940], dir: [0.5, 0.6], pose: 'relaxed', facing: 'back' };
        const YP = Q.fool(yo);
        A.push(V.actor(yst.d, () => SH.draw(YP, yo, Q.foolArt(0.15 * Math.sin(t * 1.3), 0, 'fcB'), L, '', { noCast: 1 })));
      }
      // the Queen and the lords: lips pressed shut, eyes going to each other and away
      const qst = V.at(c, 105, F.KZ - 10, 164, 'woman', F.KY0);
      if (qst) { const qi = V.idle(t, 23), qo = { x: qst.x, y: qst.y, s: qst.s, blink: qi.blink, breath: qi.breath, sway: qi.sway, face: { expr: 'neutral', look: [-0.7, 0], lid: 0.34, mouth: 'tight' }, armR: { hand: [-120, -900], dir: [0.6, 0.6], pose: 'relaxed', facing: 'back' }, armL: { hand: [120, -900], dir: [-0.6, 0.6], pose: 'relaxed', facing: 'back' } }; const QP = Q.queen(qo); A.push(V.actor(qst.d, () => SH.draw(QP, qo, null, L, '', { noCast: 1 }))); }
      // (their eyes slide to each other and back - eased, never a jump from one look to the other)
      V.LORDS.forEach((def, i) => { const [x, z] = F.SEATS[i]; const glance = ss(0.05, 0.45, Math.sin(t * 1.3 + i * 2)); const a = V.seatedLord(c, t, L, def, x, z, { expr: 'anxious', look: [glance * (x < 0 ? 0.6 : -0.6), 0.3], lid: 0.28, mouth: 'tight', brows: [-5, 1] }); if (a) A.push(a); });
      return HL.render(c, t, { night: 1, feast: true, feastHands: K ? K.front : '', dof: 2.2, focus: 450 }, A) + C.vignette(0.45);
    };
    X.shot('FEAST', 5.05, 8.31, fn, { grade: 'gFeast' });
  }

  // ======================================================= 3. JUGGLE
  {
    const F = FEAST, YZ = 2560, YH = 172, kFace = [0, F.KY0 + 182 * 1308 / 1450, F.KZ], yFace = [0, YH * 1308 / 1450, YZ];
    const cam = V.CAM([
      [7.75, [-26, 108, 2420], [8, 116, YZ], 1450],
      [8.4, [-22, 110, 2428], [8, 116, YZ], 1460],
      [9.6, [-8, 122, 2448], [10, 120, YZ], 1520],
      [10.55, [118, 176, 2468], kFace, 4000],
      [10.95, [124, 177, 2472], kFace, 4400, 'stop'],
      [11.6, [-6, 152, 2420], yFace, 1900],
      [12.85, [-4, 153, 2442], [0, yFace[1] + 1, YZ], 2150]
    ], 0.6, 7);
    V.juggleCam = cam;
    V.juggleFace = tt => cam(tt).proj(yFace) || [540, 960];
    // a three-dagger cascade: a throw every P from alternate hands, each flight 2P (so it lands in the other hand at the
    // outside of its scoop), arcs peaking at the top of the chest - below the chin, and every blade turns point-down at
    // the top of its arc, so no blade ever passes in front of your face
    const STOP = 10.45, P = 0.27, FL = 2 * P, T0 = 7.6, ARC = 300, TILT = 32, DS = 0.75;
    // hand loops (person-local): a clear scoop - each hand throws on the inside going up (phase 0) and catches on the
    // outside coming down (phase 0.5), then carries the dagger in along the bottom
    const handP = (side, t) => { const ph = ((t - T0 - (side < 0 ? 0 : P)) / (2 * P)) % 1, a = TAU * ((ph + 1) % 1); return [side * (112 - 62 * Math.cos(a)), -800 - 50 * Math.sin(a)]; };
    // a held dagger leans out from its fist (blade up and away from the body, never straight up the chest)
    const rotH = sd => -90 + sd * TILT;
    // the last throw before the stop is fumbled (it sails over and sticks in the floor)
    const lastK = Math.floor((STOP - 0.1 - T0) / P), MISS = lastK;
    const dState = (j, t, o, P0) => {
      // throws of dagger j at T0 + (j + 3m) P; thrower: (j + 3m) % 2 (0: right hand, screen left)
      let m = Math.floor((t - T0 - j * P) / (3 * P)); const tk = n => T0 + n * P;
      for (;;) { const n = j + 3 * m; if (n > lastK && m > 0) { m--; continue; } break; }
      const n = j + 3 * m, ts = tk(n), side = (n % 2) ? 1 : -1;
      // (a dagger sits in the fist's grip, a grip slot along the hand from the wrist: the new rig's hands are true size,
      // so the middle of the fist is well beyond the wrist the arm reaches for)
      const GS = R.gripSlot(Q.HAND.fool) / Math.hypot(0.5, 1);
      const handW = (sd, tt) => { const h = handP(sd, Math.min(tt, STOP)); return R.toWorld(o, [h[0] + sd * 0.5 * GS, h[1] - GS]); };
      if (t < ts) return { held: side, p: handW(side, t), rot: rotH(side) };
      if (n === MISS) {
        // the fumble: up, over your left hand, down to the floor point beside your foot, blade first
        const u = clamp((t - ts) / 1.05), a = handW(side, ts), b = [P0[0], P0[1] - 105 * o.s];
        const p = [lerp(a[0], b[0], u), lerp(a[1], b[1], u) - 4 * u * (1 - u) * 260 * o.s];
        return { held: 0, p, rot: lerp(rotH(side), 90 + 360, EZ.in2(u)), stuck: u >= 1 };
      }
      if (t < ts + FL) { const u = (t - ts) / FL, a = handW(side, ts), b = handW(-side, ts + FL); return { held: 0, p: [lerp(a[0], b[0], u), lerp(a[1], b[1], u) - 4 * u * (1 - u) * ARC * o.s], rot: lerp(rotH(side), rotH(-side) - 360 * side, u) }; }
      return { held: -side, p: handW(-side, t), rot: rotH(-side) };
    };
    const fn = t => {
      SH.still();
      const c = cam(t), L = V.LT.night, A = [];
      const laughK = env(t, 8.3, 8.8, STOP - 0.1, STOP + 0.35), cold = ss(STOP, STOP + 0.5, t);
      // the King: roaring with laughter, slapping the table; then the laugh dies, cold eyes on you
      const slap = laughK * Math.max(0, Math.sin(t * 6.5)) ** 2;
      const coldK = ss(0.3, 0.7, cold);
      const K = V.seatedKing(c, t, L, V.faceMix({ expr: 'neutral', look: [0, 0.5], lid: lerp(0.3, 0.62, laughK), mouth: laughK > 0.2 ? 'grin' : 'smile', open: 0.18 * laughK, brows: [-4 * laughK, 4 * laughK] }, { expr: 'stern', look: [0, 0.6], lid: lerp(0.3, 0.45, cold), mouth: 'tight', brows: [7, -3] }, coldK),
        { R: { hand: [-170, lerp(-930, -1010, slap)], dir: [0.4, 0.8], pose: 'open', facing: 'back' }, L: { hand: [170, -940], dir: [-0.6, 0.6], pose: 'relaxed', facing: 'back' } }, { tilt: -6 * laughK * (0.6 + 0.4 * Math.sin(t * 5)), breath: 4 * laughK * Math.sin(t * 11), id: 'C', table: { R: [-27, 24 * slap, [1, 0.3], 'open'], L: [27, 0, [-1, 0.3]] } });
      if (K) A.push(V.actor(K.st.d, () => K.svg));
      // the Queen and the lords laugh with him, and stop when he stops
      const qst = V.at(c, 105, F.KZ - 10, 164, 'woman', F.KY0);
      if (qst) { const qi = V.idle(t, 23), qo = { x: qst.x, y: qst.y, s: qst.s, blink: qi.blink, breath: qi.breath, sway: qi.sway, face: V.faceMix({ expr: 'neutral', look: [-0.2, 0.5], lid: 0.32, mouth: laughK > 0.3 ? 'smile' : 'tight' }, { expr: 'anxious', look: [-0.7, 0], lid: 0.32, mouth: 'tight' }, coldK), armR: { hand: [-120, -900], dir: [0.6, 0.6], pose: 'relaxed', facing: 'back' }, armL: { hand: [120, -900], dir: [-0.6, 0.6], pose: 'relaxed', facing: 'back' } }; const QP = Q.queen(qo); A.push(V.actor(qst.d, () => SH.draw(QP, qo, null, L, '', { noCast: 1 }))); }
      V.LORDS.forEach((def, i) => { const [x, z] = F.SEATS[i]; const a = V.seatedLord(c, t, L, def, x, z, V.faceMix({ expr: 'neutral', look: [0, 0.6], lid: 0.4, mouth: laughK > 0.3 ? 'grin' : 'smile', open: 0.1 * laughK, brows: [0, 0] }, { expr: 'fear', look: [x < 0 ? 0.6 : -0.6, 0.1], lid: 0.12, mouth: 'tight', brows: [-8, -1] }, ss(0.2, 0.6, cold)), {}, { tilt: -3 * laughK * Math.sin(t * 6 + i) }); if (a) A.push(a); });
      // a guard behind the throne
      const gst = V.at(c, 240, 3140, 184, 'man', 60);
      if (gst) { const gi = V.idle(t, 31, 0.3), go = { x: gst.x, y: gst.y, s: gst.s, blink: gi.blink, breath: gi.breath, sway: gi.sway * 0.3, face: { expr: 'stern', look: [-0.3, 0.6], lid: 0.3 } }; const gy = c.proj([240, 60, 3140]), hb = V.halberdArm(go, 120, gy ? gy[1] : gst.y); go.armR = hb.arm; go.armL = V.rest(1); const GP = Q.guardA(go); A.push(V.actor(gst.d, () => SH.draw(GP, go, null, L, hb.svg, { noCast: 1 }) + V.handsLit(GP, L, 'R'))); }
      // you, juggling three daggers; the fumble; frozen, holding your breath
      const yst = V.at(c, 0, YZ, YH, 'man', 0);
      if (yst) {
        // (the freeze at the fumble eases in over a quarter second: the bob, the sway, the breath and the tilt settle,
        // nothing snaps)
        const sk = ss(STOP - 0.05, STOP + 0.25, t);
        const yi = V.idle(t, 3, 0.5), bob = (1 - sk) * Math.sin((t - T0) / P * Math.PI) * 6;
        const yo = { x: yst.x, y: yst.y, s: yst.s, blink: yi.blink * (1 - sk), breath: yi.breath * (1 - sk), sway: (1 - sk) * 1.2 * Math.sin((t - T0) / P * Math.PI / 2) + yi.sway * 0.3, tilt: lerp(3 * Math.sin(t * 2.6), -2, sk) };
        yo.y += bob * yo.s;
        const fear = ss(STOP + 0.05, STOP + 0.4, t);
        const floorPt = c.proj([34, 0, YZ - 26]) || [yo.x + 40, yo.y];
        const ds = [0, 1, 2].map(j => dState(j, t, yo, floorPt));
        // (the fumbled one is cut at the floor line, so its point goes into the boards)
        const fcl = `<defs><clipPath id="dgF"><rect x="-2000" y="-4000" width="5000" height="${f(floorPt[1] + 4000)}"/></clipPath></defs>`;
        const mid = fcl + ds.filter(d => !(d.held)).map(d => `<g clip-path="url(#dgF)">${P17.dagger(d.p[0], d.p[1], yo.s * DS, d.rot)}</g>`).join('');
        const heldIn = sd => ds.find(d => d.held === sd);
        // (the hands keep one loose grip all through the juggling - switching open/fist at every catch flickered - and
        // open only once a hand has nothing left to hold; the fist leans out with the blade it holds)
        // (the fists are drawn free of the wrist limit: as the scoop carried a forearm round to point straight away from
        // the raised blade, the limit flipped the fist to the other side of the wrist in one frame at every catch)
        const arm = sd => { const k = heldIn(sd) ? 0 : ss(STOP + 0.2, STOP + 0.45, t); return Object.assign({ hand: handP(sd, Math.min(t, STOP)), dir: [sd * 0.5, -1], pose: k < 1 ? 'fist' : 'relaxed', facing: 'back', detachHand: true, wristFree: true }, k > 0 && k < 1 ? { pose2: 'relaxed', facing2: 'back', poseK: k } : {}); };
        yo.armR = arm(-1); yo.armL = arm(1);
        yo.face = V.faceMix({ expr: 'neutral', look: [0, -0.35 + 0.2 * Math.sin(t * 3.3)], lid: 0.16, mouth: 'grin', brows: [-2, 5] }, { expr: 'fear', look: V.lerp2([0.35, 0.55], [0, 0.1], V.at2(t, 11.5, 0.15)), lid: 0.04, mouth: 'tight', brows: [-9, -2], sweat: 0.7 * fear, wide: true }, ss(0.25, 0.75, fear));
        const YP = Q.fool(yo);
        const held = ds.filter(d => d.held).map(d => P17.dagger(d.p[0], d.p[1], yo.s * DS, d.rot)).join('');
        const tS = Math.max(0, t - STOP), ringK = lerp(0.5 * Math.sin((t - T0) / P * Math.PI), 0.4 * Math.exp(-tS * 2) * Math.sin(tS * 8), sk);
        // every dagger, flying or held, goes between the body and the fists: a catch lands inside the fingers (it never
        // passes over the hand and then jumps under it), and in flight they arc above the hands in front of the chest
        const ext = [yo.x - 700 * yo.s, yo.y - 1500 * yo.s, yo.x + 700 * yo.s, Math.max(yo.y, floorPt[1]) + 40];
        A.push(V.actor(yst.d, () => SH.draw(YP, yo, Q.foolArt(ringK, (1 - sk) * 0.25 * Math.sin(t * 18), 'fcC'), L, held + mid, { ext }) + V.handsLit(YP, L)));
      }
      // (focus pulls are eased: the depth blur of the set never jumps from one frame to the next)
      const focus = lerp(lerp(600, 900, ss(9.8, 10.2, t)), 300, ss(11.1, 11.5, t));
      return HL.render(c, t, { night: 1, feast: true, feastHands: K ? K.front : '', dof: 2.4, focus }, A) + C.vignette(0.45);
    };
    X.shot('JUGGLE', 7.81, 12.85, fn, { grade: 'gFeast' });
  }
  // the King's face by day becomes the King's face by candlelight: the two faces aligned, the swap a few frames inside
  // a soft defocus (the old soft radial showed both halls through each other for a third of a second)
  // (after delivery: the morph slid A to line the faces up inside A's zoom margin, and the slide stopped dead where the margin
  // caught up with it - a jolt just before 'the only man in France' - then swapped two different halls in three frames.
  // Now the camera pushes into the King's face and comes back out of his face at the feast, the two faces exactly on each
  // other at the swap)
  X.tr('facepush', 5.4, 0.8, 'CAP', 'FEAST', { faceA: V.capKingHead, faceB: V.feastKingHead, za: 2.8, fade: [0.43, 0.57], blur: 5, bpow: 4 });
  X.tr('carry', 8.06, 0.5, 'FEAST', 'JUGGLE', { mode: 'tilt', dir: [0, 1], dist: 0.32, fade: [0.46, 0.54], blur: 6 });
})(window);
