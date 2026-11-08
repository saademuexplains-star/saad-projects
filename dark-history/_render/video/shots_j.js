// "The First Vaccine" part 1: tied to the chair -> the cut -> the milkmaid's pus -> into the wound -> the window ->
// the plague street -> you pull your arm back as the doctor forces the cow sickness in.
// The surgery is one world whose occupants are a function of time (surg()), so every angle on it agrees.
// Rules: arms are drawn over the furniture only while the hands rest on it; hand paths never cross a face;
// tools sit rigidly in the fist, their tips placed exactly (rigTool / closeGrip).
(function (G) {
  const X = G.ENG, Q = G.QCAST, S = G.SETS, PR = G.PROPS, C = G.CINE, R = G.RIG;
  const { track: TK, ss, clamp, lerp, EZ } = X;
  const { f, mix, rng } = R;
  const TAU = Math.PI * 2, D2R = Math.PI / 180;
  // ---- helper header (as in shots_i.js)
  const wave = (t, hz, ph = 0) => Math.sin(TAU * hz * t + ph);
  const env = (t, a, b, c, d) => ss(a, b, t) * (1 - ss(c, d, t));
  const bump = (t, t0, a = 1, len = 0.35) => (t < t0 || t > t0 + len) ? 0 : a * Math.pow(Math.sin(Math.PI * (t - t0) / len), 2);
  const idle = (t, seed, amp = 1) => ({ blink: Q.blink(t, seed), breath: Q.breath(t * 1.1 + seed) * 0.6, sway: X.noise(t * 0.45, seed) * 0.5 * amp });
  const hh = (c, t, amp = 1, seed = 0) => { const h = X.hand(t, amp, seed); return (X.CAM = [c[0] + h[0], c[1] + h[1], c[2], (c[3] || 0) + h[2]]); };
  const scr = (w, c, p = 1) => { const [cx, cy, z] = c, zp = Math.pow(z, p), px = 540 + (cx - 540) * p, py = 960 + (cy - 960) * p; return [540 + (w[0] - px) * zp, 960 + (w[1] - py) * zp]; };
  const lit = X.lit;
  const nrm = v => { const n = Math.hypot(v[0], v[1]) || 1; return [v[0] / n, v[1] / n]; };
  const L2 = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
  const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k];
  const dirA = a => [Math.cos(a * D2R), Math.sin(a * D2R)];
  const HAND = { you: 74, doctor: 114, milkmaid: 104, mother: 104, dying: 116, sickWoman: 104, digger: 116, sickMan: 116, villagerW: 104 };
  const gripAt = (o, who, Gw, dW, extra = {}) => { const dl = nrm(R.dirLocal(o, dW)), gl = R.toLocal(o, Gw), gy = 0.33 * HAND[who]; return Object.assign({ hand: [gl[0] - dl[0] * gy, gl[1] - dl[1] * gy], dir: dl, pose: 'grip', facing: 'back' }, extra); };
  const fingersFor = (side, facing, thumb) => { const t = (side === 'R' ? -1 : 1) * (facing === 'palm' ? 1 : -1); return [-thumb[1] * t, thumb[0] * t]; };
  const armsOver = (p, L, which = 'RL') => C.lit({ svg: (which.includes('R') ? p.armRsvg : '') + (which.includes('L') ? p.armLsvg : ''), info: p.info }, Object.assign({ view: X.viewRect(1) }, L)).body;
  const handsLit = (p, L, which = 'RL') => C.lit({ svg: (which.includes('R') ? p.handR || '' : '') + (which.includes('L') ? p.handL || '' : ''), info: p.info }, Object.assign({ view: X.viewRect(1) }, L)).body;
  const CAM = (pk, zk) => { const P = TK(pk), Z = TK(zk); return t => { const p = P(t); return [p[0], p[1], Z(t), p[2]]; }; };
  const tipArm = (o, who, tipW, dirW, extra = {}) => { const d = nrm(dirW), k = 0.78 * HAND[who] * o.s; return Object.assign({ hand: R.toLocal(o, [tipW[0] - d[0] * k, tipW[1] - d[1] * k]), dir: nrm(R.dirLocal(o, d)), pose: 'open', facing: 'back' }, extra); };
  // a fist holding a tool by its grip frame so the tool's tip sits exactly on `tip`, the tool pointing along beta (deg).
  // tt = thumb side sign; the fingers then point along beta + tt*(90 - holdRot). For close-up arms (world = hand units).
  const thumbSign = (side, facing) => (side === 'R' ? -1 : 1) * (facing === 'palm' ? 1 : -1);
  const closeGrip = (tip, beta, side, facing, size, hr, tipLen) => {
    const d = dirA(beta + thumbSign(side, facing) * (90 - hr)), b = dirA(beta), slot = [tip[0] - b[0] * tipLen, tip[1] - b[1] * tipLen];
    return { wrist: [slot[0] - d[0] * 0.33 * size, slot[1] - d[1] * 0.33 * size], dir: d, slot };
  };
  // the same for a rig arm (armR = 'R', armL = 'L'). The rig clamps the wrist (~75 deg off the forearm), so the fingers are
  // laid along the forearm (approximated by shoulder -> wrist, plus bias) and the tool angle follows from the fixed hold
  // angle hr: the tool stays rigid in the fist and its tip lands exactly on tipW. tipLocal = tip distance from the grip slot.
  const SH = { doctor: [160, -1150], dying: [150, -1150], digger: [168, -1150], sickMan: [168, -1150], milkmaid: [136, -1118], mother: [136, -1118], villagerW: [136, -1118], you: [104, -606] };
  const toolPose = (o, who, side, facing, tipW, hr, tipLocal, bias = 0) => {
    const tt = thumbSign(side, facing), sh = R.toWorld(o, [(side === 'R' ? -1 : 1) * SH[who][0], SH[who][1]]), L0 = tipLocal * o.s, gy = 0.33 * HAND[who] * o.s;
    let phi = Math.atan2(tipW[1] - sh[1], tipW[0] - sh[0]) / D2R + bias, slot = tipW, beta = 0;
    for (let k = 0; k < 4; k++) { beta = phi - tt * (90 - hr); const b = dirA(beta); slot = [tipW[0] - b[0] * L0, tipW[1] - b[1] * L0]; const d = dirA(phi), wr = [slot[0] - d[0] * gy, slot[1] - d[1] * gy]; phi = Math.atan2(wr[1] - sh[1], wr[0] - sh[0]) / D2R + bias; }
    beta = phi - tt * (90 - hr); const b = dirA(beta); slot = [tipW[0] - b[0] * L0, tipW[1] - b[1] * L0];
    return { slot, phi, beta };
  };
  const rigTool = (o, who, side, facing, tipW, hr, hold, tipLocal, extra = {}, bias = 0) => {
    const tp = toolPose(o, who, side, facing, tipW, hr, tipLocal, bias);
    return gripAt(o, who, tp.slot, dirA(tp.phi), Object.assign({ hold, holdRot: hr, facing }, extra));
  };
  const LT = {
    surg: { from: [-0.8, -0.45], shadow: '#140c06', shadowOp: 0.5, floor: '#2a1a10', floorOp: 0.35, contactOp: 0.4, key: '#eef2f6', keyAdd: 0.06, rims: [{ from: [1, -0.2], col: '#ffb060', w: 6, op: 0.45 }, { from: [-1, -0.5], col: '#cfdce8', w: 4, op: 0.3 }], face: { col: '#ffe4c8', op: 0.12 } },
    street: { from: [0.25, -1], shadow: '#1a1c1e', shadowOp: 0.38, floor: '#2a2620', floorOp: 0.3, contactOp: 0.45, key: '#d8dce0', keyAdd: 0.03, rims: [{ from: [-1, -0.3], col: '#b8c0c8', w: 4, op: 0.3 }, { from: [1, -0.1], col: '#ff9a50', w: 4, op: 0.18 }], face: { col: '#eceae4', op: 0.07 } },
  };
  // shared with part 2
  G.SHOTS_J = { wave, env, bump, idle, hh, scr, nrm, L2, add, dirA, HAND, gripAt, fingersFor, armsOver, handsLit, CAM, tipArm, closeGrip, rigTool, toolPose, thumbSign, LT };
  const ST = {};
  G.VACCINE = ST;

  // ======================================================= the surgery world (time -> everyone's pose)
  const SG = S.SG, YS = SG.YS, CX = SG.CX, SEAT = SG.SEAT, TOP = SG.TOP, FLOOR = SG.FLOOR;
  const YOU0 = [CX, SEAT + 250 * YS], DOC_S = 0.8, DOC_Y = 1040 + 1150 * DOC_S, MAID_S = 0.8, MAID0 = [1210, 1040 + 1118 * MAID_S];
  const WRIST_L = [628, 1336], WRIST_R = [214, 1342];
  ST.SURG = { YOU0, WRIST_L, WRIST_R, DOC_S, DOC_Y };
  const docX = t => 860 + 140 * EZ.io(ss(4.5, 5.3, t)) * (1 - EZ.io(ss(8.7, 9.7, t)));
  const maidIn = t => t > 3 && t < 10.3;
  // the lancet is a small tool: drawn at 60 hand-units, its blade about the width of the boy's forearm
  const LANCET = (o2 = {}) => PR.lancetG(Object.assign({ size: 60 }, o2));
  const LTIP = 128 * 60 / 116;
  const CASE_LANCET = [782, TOP - 28];
  const MAID_WRIST = [1080, TOP - 27], MAID_DIR = nrm([-1, 0.25]);
  const blisterOf = mw => { const md = MAID_DIR, lx = [md[1], -md[0]], hs = HAND.milkmaid * MAID_S; return [mw[0] + md[0] * 0.42 * hs + lx[0] * -4, mw[1] + md[1] * 0.42 * hs + lx[1] * -4]; };
  const BLISTER = blisterOf(MAID_WRIST);
  ST.LANCET = LANCET; ST.LTIP = LTIP;
  // the pose of the lancet standing in its case where the doctor's fist closes on it (so the pick-up is seamless)
  const PICK = toolPose({ x: 860, y: DOC_Y, s: DOC_S, sway: 0, breath: 0 }, 'doctor', 'R', 'back', CASE_LANCET, 85, LTIP);
  // the strap-tying move (CHAIR at 0, TIEBACK at 30.45): returns { fist, tail (strap end in the fist), lancet, tip, beta }
  const tieMove = (tt, cut) => {
    const P1 = [690, 1300], P2 = [726, 1284], P3 = [652, 1320];
    if (tt < 1.5) {
      const a = EZ.io(ss(0, 0.75, tt)), b = EZ.io(ss(0.75, 1.25, tt)), c = ss(1.25, 1.5, tt);
      const p = L2(L2(P1, P2, a), P3, b), fist = [p[0] + 3 * c, p[1] + 5 * Math.sin(Math.PI * c)];
      return { fist, tail: tt < 1.3 ? fist : null };
    }
    // to the instrument case (grip at 1.95), lift the lancet, carry it to hover over the cut
    const go = EZ.io(ss(1.5, 1.95, tt)), lift = EZ.io(ss(1.95, 2.85, tt));
    if (tt < 1.95) return { fist: L2([655, 1316], PICK.slot, go), dir: nrm(L2([-0.35, 1], dirA(PICK.phi), go)), tail: null };
    const hover = [cut[0] + 18, cut[1] - 46];
    return { lancet: true, tip: L2(CASE_LANCET, hover, lift), beta: lerp(180, 115, EZ.io(ss(1.95, 2.6, tt))) };
  };
  ST.tieMove = tieMove;
  // the doctor's two arms at time t (D = his rig placement, ctx = the boy's forearm points E, W and the cut point)
  const docArms = (t, D, ctx, o) => {
    const restL = { hand: R.toLocal(D, [D.x + 110, TOP - 14]), dir: [-0.15, 1], pose: 'relaxed', facing: 'back', detachHand: true }, onL = true;
    const ret = (armR, armL, over = { R: true, L: true }, inHand = true) => ({ armR, armL, over, inHand });
    const lanArm = (tip, hr = 85, lo = {}) => (ST.dbgTip = tip, rigTool(D, 'doctor', 'R', 'back', tip, hr, LANCET(lo), LTIP, { detachHand: true }));
    if (o.docArms) return o.docArms(t, D, ctx, { restL, lanArm, ret });
    // CHAIR / TIEBACK: tying the strap, then taking up the lancet
    const tie0 = t < 3 ? 0 : (t > 30.3 && t < 33.7 ? 30.25 : null);
    if (tie0 !== null) {
      const m = tieMove(t - tie0, ctx.cut);
      if (!m.lancet) return Object.assign(ret(gripAt(D, 'doctor', m.fist, m.dir || [-0.35, 1], { detachHand: true }), restL, undefined, false), { tail: m.tail });
      // TIEBACK: the lancet catches the light as he holds it over your arm ("something crazy")
      if (tie0 > 0) return ret(lanArm(m.tip, 85, { glint: env(t, 32.75, 32.8, 33.2, 33.3) > 0 ? clamp((t - 32.75) / 0.55) : null }), restL, undefined, true);
      return ret(lanArm(m.tip, 85), restL, undefined, true);
    }
    // MILK: his left hand holds her wrist, the lancet scoops pus from her blister
    if (t >= 3 && t < 10.3 && ctx.maidWrist) {
      const mw = ctx.maidWrist, B0 = ctx.blister;
      // his left fist holds her wrist, then moves back to rest on the table (smoothly, staying a fist: no pose snap)
      const rel = EZ.io(ss(7.85, 8.45, t)), holdPt = [mw[0] + 34, mw[1] - 8], restPt = [D.x + 110, TOP - 18];
      const hold = gripAt(D, 'doctor', L2(holdPt, restPt, rel), nrm(L2([0.25, 1], [-0.15, 1], rel)), { detachHand: true });
      const hover = [B0[0] - 30, B0[1] - 60], scoop = EZ.io(ss(5.6, 6.4, t));
      let tip = L2(hover, B0, EZ.io(ss(5.2, 5.6, t)));
      if (t >= 5.6) tip = L2(B0, [B0[0] + 10, B0[1] - 3], scoop);
      if (t >= 6.4) tip = L2([B0[0] + 10, B0[1] - 3], [B0[0] - 20, B0[1] - 60], EZ.io(ss(6.4, 6.9, t)));
      if (t >= 8.0) tip = L2([B0[0] - 20, B0[1] - 60], [B0[0] - 150, B0[1] - 30], EZ.io(ss(8.0, 8.9, t)));
      const lo = { pus: ss(5.8, 6.4, t) };
      return ret(lanArm(tip, 103, lo), hold);
    }
    // POV: leaning in, his pocket watch up in his left hand, the lancet low in his right
    if (t > 38.5 && t < 40.8) {
      return ret(lanArm([D.x - 150, 1330], 116, { matter: 0.5 }), { hand: R.toLocal(D, [D.x + 70, 1150]), dir: [-0.2, -1], pose: 'grip', facing: 'palm', detachHand: true, hold: o.watch || '' }, { R: true, L: false });
    }
    // ALIVE: two fingers on your pulse; the watch in the other hand
    if (t > 48 && t < 51) {
      const pulse = tipArm(D, 'doctor', [WRIST_L[0] - 4, WRIST_L[1] - 8], [-0.45, 1], { detachHand: true });
      return ret(pulse, { hand: R.toLocal(D, [D.x + 80, 1170]), dir: [-0.2, -1], pose: 'grip', facing: 'palm', detachHand: true, hold: o.watch || '' }, { R: true, L: false });
    }
    // WINDOW / PULL: the lancet worked back and forth in the cut; his left hand rests on the table
    const rub = Math.sin((t - 9.6) * 9) * 7 * env(t, 9.6, 10, 21.2, 21.6) + (o.press ? o.press(t) : 0);
    const along = nrm([ctx.W[0] - ctx.E[0], ctx.W[1] - ctx.E[1]]);
    return ret(lanArm(add(ctx.cut, along, rub), 85, { pus: 0.35, blood: 0.5 }), restL);
  };
  // the pocket watch held up in a fist (grip frame: the bow in the fist, the open case out of the thumb side)
  ST.watchG = (t) => `<g transform="translate(64,0) rotate(-90)"><circle r="34" fill="#c8a040" stroke="#3a2a0a" stroke-width="2"/><circle r="28" fill="#f2ecdc"/>${[...Array(12)].map((_, i) => { const a = i / 12 * TAU; return `<path d="M${f(Math.sin(a) * 23)},${f(-Math.cos(a) * 23)} L${f(Math.sin(a) * 26)},${f(-Math.cos(a) * 26)}" stroke="#2a2018" stroke-width="1.6"/>`; }).join('')}<path d="M0,0 L${f(Math.sin(t * TAU / 60) * 24)},${f(-Math.cos(t * TAU / 60) * 24)}" stroke="#8a1a12" stroke-width="1.2"/><path d="M0,0 L10,-12 M0,0 L-2,-20" stroke="#1a1410" stroke-width="2.2" stroke-linecap="round"/><ellipse cx="-12" cy="-14" rx="12" ry="5" fill="#fff" opacity="0.35"/><circle cx="0" cy="-38" r="6" fill="none" stroke="#c8a040" stroke-width="3"/></g>`;

  // marks on the boy's forearm in the medium shots: the cut (with pus and blood), the healed pock, later the scars
  const foreMarks = (E, W, st) => {
    const a = Math.atan2(W[1] - E[1], W[0] - E[0]), u = [Math.cos(a), Math.sin(a)], n = [-u[1], u[0]];
    let g = '';
    const at = (k, v) => [lerp(E[0], W[0], k) + n[0] * v, lerp(E[1], W[1], k) + n[1] * v];
    if (st.scab) { const p = at(0.62, -3); g += `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="7" fill="#d87a6a" opacity="0.5" filter="url(#b2)"/><circle cx="${f(p[0])}" cy="${f(p[1])}" r="4.2" fill="#6a2a14"/>`; }
    for (let i = 0; i < (st.scars || 0); i++) { const k = 0.2 + (i % 7) * 0.1, v = -6 + Math.floor(i / 7) * 5, p = at(k, v); g += `<path d="M${f(p[0] - u[0] * 5)},${f(p[1] - u[1] * 5)} L${f(p[0] + u[0] * 5)},${f(p[1] + u[1] * 5)}" stroke="#d88a7a" stroke-width="2.2" stroke-linecap="round" opacity="0.85"/>`; }
    if (st.cut) { const p0 = at(0.42 - 0.07, -2), p1 = at(0.42 + 0.07, -2); g += `<path d="M${f(p0[0])},${f(p0[1])} L${f(p1[0])},${f(p1[1])}" stroke="#7a0a08" stroke-width="3.5" stroke-linecap="round"/>`;
      if (st.pus) g += `<ellipse cx="${f((p0[0] + p1[0]) / 2)}" cy="${f((p0[1] + p1[1]) / 2)}" rx="8" ry="3.5" transform="rotate(${f(a / D2R)} ${f((p0[0] + p1[0]) / 2)} ${f((p0[1] + p1[1]) / 2)})" fill="#d8bc48" opacity="${f(st.pus)}"/>`;
      if (st.blood) { const m = at(0.42, 4); g += `<path d="M${f(m[0])},${f(m[1])} q${f(n[0] * 6)},${f(n[1] * 6 + 4)} ${f(n[0] * 10)},${f(n[1] * 14 * st.blood)}" stroke="#8a0a08" stroke-width="3" stroke-linecap="round" fill="none"/>`; } }
    return g;
  };
  ST.foreMarks = foreMarks;

  // the whole surgery cast and furniture. o: youFace, docFace, maidFace, youSway, youLwrist (override), marks, noYou, extra
  const surg = (t, o = {}) => {
    const L = LT.surg;
    // ---------------- you, in the chair
    const yo = Object.assign(idle(t, 3, 0.5), { x: YOU0[0], y: YOU0[1], s: YS });
    yo.sway = (o.youSway ? o.youSway(t) : 0) + yo.sway * 0.4;
    const shiver = o.youShiver ? o.youShiver(t) : 0;
    yo.x += shiver * (1.6 * Math.sin(t * 31) + 1.1 * Math.sin(t * 47 + 1));
    const yf = o.youFace ? o.youFace(t) : { expr: 'fear', look: [0.75, 0.35], lid: 0.12, mouth: 'tight', brows: [-10, 0], sweat: 0.3 };
    const wl = o.youLwrist ? o.youLwrist(t) : WRIST_L;
    const Y = Q.you(Object.assign(yo, { noLegs: true, tilt: o.youTilt ? o.youTilt(t) : 3, face: yf,
      armR: { hand: R.toLocal(yo, WRIST_R), dir: [0.05, 1], pose: 'relaxed', facing: 'back', detachHand: true },
      armL: { hand: R.toLocal(yo, wl), dir: [1, 0.12], pose: o.youFist && o.youFist(t) ? 'fist' : 'relaxed', facing: 'palm', detachHand: true } }));
    const E = R.toWorld(yo, Y.jL.E), W = R.toWorld(yo, Y.jL.W);
    const cut = (() => { const k = 0.42, a = Math.atan2(W[1] - E[1], W[0] - E[0]); return [lerp(E[0], W[0], k) + Math.sin(a) * 2, lerp(E[1], W[1], k) - Math.cos(a) * 2]; })();
    // ---------------- the milkmaid behind the right end of the table, her blistered hand held out on it
    let maidBody = '', maidOver = '', ctx = { E, W, cut };
    let M = null, mo = null;
    if (maidIn(t) && !o.noMaid) {
      mo = Object.assign(idle(t, 11, 0.4), { x: MAID0[0], y: MAID0[1], s: MAID_S });
      const mf = o.maidFace ? o.maidFace(t) : { expr: 'anxious', look: [-0.6, 0.6], lid: 0.3, mouth: 'closed' };
      M = Q.milkmaid(Object.assign(mo, { tilt: o.maidTilt ? o.maidTilt(t) : -4, face: mf,
        armR: { hand: R.toLocal(mo, MAID_WRIST), dir: MAID_DIR, pose: 'open', facing: 'back', detachHand: true },
        armL: { hand: [120, -800], dir: [-0.2, 1], pose: 'relaxed', facing: 'back' } }));
      const mw = R.toWorld(mo, M.jR.W), md = MAID_DIR, lx = [md[1], -md[0]], hs = HAND.milkmaid * MAID_S;
      const B0 = blisterOf(mw);
      ctx.maidWrist = mw; ctx.blister = B0;
      const burst = ss(5.7, 6.4, t);
      let bl = '';
      for (const [k, v, r0, main] of [[0.42, -4, 5.2, 1], [0.24, 9, 3.6, 0], [0.5, 12, 3.2, 0], [0.12, -10, 3.8, 0], [-0.1, 4, 3.4, 0]]) {
        const p = [mw[0] + md[0] * k * hs + lx[0] * v, mw[1] + md[1] * k * hs + lx[1] * v], r1 = main ? r0 * (1 - 0.45 * burst) : r0;
        bl += `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="${f(r1 * 1.9)}" fill="#c8402e" opacity="0.5" filter="url(#b05)"/><circle cx="${f(p[0])}" cy="${f(p[1])}" r="${f(r1)}" fill="${main && burst > 0.3 ? '#d8b848' : '#f0e2b4'}" stroke="#8a2a1a" stroke-width="0.8"/><circle cx="${f(p[0] - r1 * 0.3)}" cy="${f(p[1] - r1 * 0.35)}" r="${f(r1 * 0.32)}" fill="#fff" opacity="0.65"/>`;
        if (main && burst > 0.2) bl += `<path d="M${f(p[0])},${f(p[1] + r1)} q2,5 -1,${f(8 * burst)}" stroke="#d8b848" stroke-width="2.4" stroke-linecap="round" fill="none"/>`;
      }
      maidBody = `<g clip-path="url(#sgTop)">${lit(M, L)}</g>`;
      maidOver = armsOver(M, L, 'R') + handsLit(M, L, 'R') + bl;
    }
    // ---------------- the doctor behind the table (his body hidden below the table top)
    const D = Object.assign(idle(t, 7, 0.5), { x: docX(t), y: DOC_Y, s: DOC_S });
    D.sway = (o.docSway ? o.docSway(t) : 0) + D.sway * 0.4;
    const da = docArms(t, D, ctx, o);
    const df = o.docFace ? o.docFace(t) : { expr: 'stern', look: [-0.6, 0.55], lid: 0.2, mouth: 'tight' };
    const Dp = Q.doctor(Object.assign(D, { tilt: o.docTilt ? o.docTilt(t) : -5, face: df, armR: da.armR, armL: da.armL }));
    const docBody = `<g clip-path="url(#sgTop)">${lit(Dp, L)}</g>`;
    const caseLancet = da.inHand ? '' : `<g transform="translate(${CASE_LANCET[0]},${CASE_LANCET[1]}) rotate(${f(PICK.beta)}) scale(0.8) translate(${f(-LTIP)},0)">${LANCET()}</g>`;
    const docOver = (da.over.R ? armsOver(Dp, L, 'R') : '') + (da.over.L ? armsOver(Dp, L, 'L') : '') + handsLit(Dp, L);
    // the strap's free end running from the buckle to his fist while he pulls it tight
    const ang = Math.atan2(W[1] - E[1], W[0] - E[0]) / D2R;
    const strapAt = L2(W, E, 0.1);
    let tail = '';
    if (da.tail) { const b = [strapAt[0] + 10, strapAt[1] - 10]; tail = `<path d="M${f(b[0])},${f(b[1])} Q${f((b[0] + da.tail[0]) / 2)},${f(Math.min(b[1], da.tail[1]) - 14)} ${f(da.tail[0])},${f(da.tail[1])}" stroke="#2a1608" stroke-width="13" fill="none" stroke-linecap="round"/><path d="M${f(b[0])},${f(b[1])} Q${f((b[0] + da.tail[0]) / 2)},${f(Math.min(b[1], da.tail[1]) - 14)} ${f(da.tail[0])},${f(da.tail[1])}" stroke="#6a3c1a" stroke-width="9" fill="none" stroke-linecap="round"/>`; }
    const straps = PR.strap(strapAt[0], strapAt[1], 46, 15, ang + 90, { tail: da.tail ? 0 : 0.5 }) + PR.strap(WRIST_R[0], WRIST_R[1] + 6, 54, 16, 0, { tail: 0.4 });
    // ---------------- assemble: table and people behind it, the chair around you, your arms on the armrest and board
    const youTorso = o.noYou ? '' : `<g clip-path="url(#sgSeat)">${lit(Y, L)}</g>`;
    const legs = o.noYou ? '' : PR.kidLegs(CX, SEAT + 6, FLOOR, YS, { swing: o.legSwing ? o.legSwing(t) : 0 });
    const youArms = o.noYou ? '' : armsOver(Y, L, 'RL') + straps + tail + foreMarks(E, W, o.marks ? o.marks(t) : {}) + handsLit(Y, L);
    const defs = `<defs><clipPath id="sgTop"><rect x="-2000" y="-2000" width="6000" height="${f(TOP + 2 + 2000)}"/></clipPath><clipPath id="sgSeat"><rect x="-2000" y="-2000" width="6000" height="${f(SEAT + 8 + 2000)}"/></clipPath></defs>`;
    ST.last = { E, W, cut, Y, Dp, D, yo, M, mo, ctx };
    // ?dbg: mark the points the hands and tools aim at
    const dbg = G.DBG.dbg ? [ctx.cut, ctx.blister, ST.dbgTip].filter(Boolean).map((q, i) => `<circle cx="${f(q[0])}" cy="${f(q[1])}" r="3" fill="none" stroke="${['#0f0', '#0ff', '#f0f'][i]}" stroke-width="1.5"/>`).join('') : '';
    return defs + maidBody + docBody + S.surgTable(t, { caseOpen: true }) + caseLancet + (o.noYou ? '' : PR.chairBack(CX, SEAT, FLOOR, 1)) + youTorso + PR.chairFront(CX, SEAT, FLOOR, 1) + legs + youArms + maidOver + docOver + (o.extra ? o.extra(t) : '') + dbg;
  };
  ST.surg = surg;
  const surgScene = (t, c, o = {}) => X.compose(X.stage(S.surgery(t, { dim: o.dim || 0 }), surg(t, o)), c);
  ST.surgScene = surgScene;

  // ======================================================= the close-up of your forearm on the arm board
  // world: wrist at (820, 760), the arm running steeply down-left to the elbow off-frame (ang -58), palm up, so the cut,
  // the boy's hand and the doctor's fist all fit the tall frame
  const AW = { wrist: [820, 760], ang: -58, w: 120, L: 1250, hand: 290, doc: 360, tool: 190 };
  ST.AW = AW;
  const armU = dirA(AW.ang), armN = [-armU[1], armU[0]];
  const hwA = s => (AW.w / 2) * (1 + 0.42 * s + 0.1 * Math.sin(Math.PI * Math.min(1, s * 1.3)));
  const armPt = (uf, v) => [AW.wrist[0] - armU[0] * uf * AW.L + armN[0] * v * 2 * hwA(uf), AW.wrist[1] - armU[1] * uf * AW.L + armN[1] * v * 2 * hwA(uf)];
  ST.armPt = armPt; ST.armU = armU; ST.armN = armN;
  // a cut's ends in world (the blade draws from the elbow end to the wrist end)
  const cutEnds = (c) => { const m = armPt(c.u, c.v); return [add(m, armU, -c.len / 2), add(m, armU, c.len / 2), m]; };
  ST.cutEnds = cutEnds;
  const C1 = { u: 0.38, v: -0.06, len: 130, a: 0 };
  ST.C1 = C1;
  // the doctor's close-up arm: navy coat sleeve, a white shirt ruffle at the wrist, the fist on the lancet
  const DOC_SKIN = '#e8c4a8';
  const docCloseArm = (wrist, dir, o2 = {}) => {
    const Sz = AW.doc, back = dirA(Math.atan2(dir[1], dir[0]) / D2R + 10), from = [wrist[0] - back[0] * 1100, wrist[1] - back[1] * 1100];
    const id = 'dca' + Math.round(wrist[0]), n = [-back[1], back[0]], w0 = Sz * 0.62, w1 = Sz * 0.46;
    let g = `<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${f(wrist[0] + n[0] * w1 / 2)}" y1="${f(wrist[1] + n[1] * w1 / 2)}" x2="${f(wrist[0] - n[0] * w1 / 2)}" y2="${f(wrist[1] - n[1] * w1 / 2)}"><stop offset="0" stop-color="#0e121c"/><stop offset="0.45" stop-color="#2e3a52"/><stop offset="1" stop-color="#0a0e16"/></linearGradient></defs>`;
    const cuff = add(wrist, back, -Sz * 0.12);
    g += `<path d="M${f(from[0] + n[0] * w0 / 2)},${f(from[1] + n[1] * w0 / 2)} L${f(cuff[0] + n[0] * w1 / 2)},${f(cuff[1] + n[1] * w1 / 2)} L${f(cuff[0] - n[0] * w1 / 2)},${f(cuff[1] - n[1] * w1 / 2)} L${f(from[0] - n[0] * w0 / 2)},${f(from[1] - n[1] * w0 / 2)}Z" fill="url(#${id})" stroke="#05070a" stroke-width="3"/>`;
    g += `<path d="M${f(cuff[0] + n[0] * w1 * 0.55 - back[0] * 60)},${f(cuff[1] + n[1] * w1 * 0.55 - back[1] * 60)} L${f(cuff[0] - n[0] * w1 * 0.55 - back[0] * 60)},${f(cuff[1] - n[1] * w1 * 0.55 - back[1] * 60)}" stroke="#141c2c" stroke-width="40"/>` + [0.3, -0.3].map(k => `<circle cx="${f(cuff[0] + n[0] * w1 * k - back[0] * 60)}" cy="${f(cuff[1] + n[1] * w1 * k - back[1] * 60)}" r="9" fill="#c8a040"/>`).join('');
    // the ruffle: soft white frills around the wrist
    let rf = ''; for (let i = 0; i < 7; i++) { const k = (i / 6 - 0.5) * 1.2, p = add(add(cuff, n, k * w1 * 0.55), back, 14 + 10 * Math.sin(i * 1.7)); rf += `<ellipse cx="${f(p[0])}" cy="${f(p[1])}" rx="${f(26)}" ry="${f(40)}" transform="rotate(${f(Math.atan2(back[1], back[0]) / D2R)} ${f(p[0])} ${f(p[1])})" fill="#f4f2ec" stroke="#b8b4aa" stroke-width="2"/>`; }
    g += rf;
    g += R.hand({ x: wrist[0], y: wrist[1], dir, side: 'R', facing: 'back', pose: 'grip', size: Sz, skin: DOC_SKIN, hold: o2.hold, holdRot: o2.hr });
    return `<g filter="url(#skinS)">${g}</g>`;
  };
  ST.docCloseArm = docCloseArm;
  // a lancet in the doctor's close-up fist, tip on `tip`, pointing along beta
  const closeLancet = (tip, beta, lo = {}, hr = 55) => {
    const k = AW.tool / 116, g = closeGrip(tip, beta, 'R', 'back', AW.doc, hr, 128 * k);
    // the hand-shadow falls on the board and the arm, down-right of the hand
    const sh = `<ellipse cx="${f(g.wrist[0] + 70)}" cy="${f(g.wrist[1] + 160)}" rx="${f(AW.doc * 0.45)}" ry="${f(AW.doc * 0.3)}" fill="#120804" opacity="0.28" filter="url(#b14)"/>`;
    return sh + docCloseArm(g.wrist, g.dir, { hold: PR.lancetG(Object.assign({ size: AW.tool }, lo)), hr });
  };
  ST.closeLancet = closeLancet;
  // the board under the arm (oak planks along the arm), a dark stain, light from the window and the candle
  const boardCU = (t) => {
    let g = `<g transform="rotate(${AW.ang} 540 1200)"><rect x="-1400" y="-400" width="3800" height="3200" fill="#5a3418" filter="url(#woodH)"/>`;
    for (let i = 0; i < 14; i++) g += `<path d="M-1400,${-300 + i * 230} L2400,${-300 + i * 230}" stroke="#1e1006" stroke-width="5" opacity="0.7"/><path d="M-1400,${-296 + i * 230} L2400,${-296 + i * 230}" stroke="#c89a60" stroke-width="2" opacity="0.18"/>`;
    const rg = rng(8); for (let i = 0; i < 60; i++) { const x = -1300 + rg() * 3600, y = -300 + rg() * 3000; g += `<path d="M${f(x)},${f(y)} c${f(90 + rg() * 120)},${f(rg() * 14 - 7)} ${f(200 + rg() * 200)},${f(rg() * 14 - 7)} ${f(330 + rg() * 300)},${f(rg() * 10 - 5)}" stroke="#8a5a30" stroke-width="2.5" fill="none" opacity="0.35"/>`; }
    for (const [x, y, r0] of [[200, 1600, 70], [1300, 800, 50], [-200, 900, 40]]) g += `<ellipse cx="${x}" cy="${y}" rx="${r0}" ry="${r0 * 0.6}" fill="#2a0e06" opacity="0.4" filter="url(#b4)"/>`;
    g += `</g>`;
    g += C.radial(1300, 700, 1100, '#ffb060', 0.25 * (0.9 + 0.1 * Math.sin(t * 9))) + C.radial(-200, 1200, 1000, '#dfe8f0', 0.18);
    return g;
  };
  ST.boardCU = boardCU;
  // the close-up scene: st = { cuts, marks, scab, sore, tool: {tip, beta, lo}, tremble, strap }
  const armScene = (t, c, st) => {
    const trem = (st.tremble || 0) * (Math.sin(t * 23) * 1.4 + Math.sin(t * 37) * 0.8);
    let g = boardCU(t);
    g += PR.foreClose({ x: AW.wrist[0], y: AW.wrist[1], ang: AW.ang, w: AW.w, L: AW.L, skin: '#f0c8a8', sleeve: '#e8e2d2', cuts: st.cuts || [], marks: st.marks || [], scab: st.scab, sore: st.sore, strap: st.strap !== false, hand: { size: AW.hand, rot: -6 + trem, pose: st.pose || 'relaxed' } });
    if (st.drops) g += st.drops;
    if (st.tool) g += closeLancet(st.tool.tip, st.tool.beta, st.tool.lo || {}, st.tool.hr ?? 55);
    if (st.over) g += st.over;
    return X.compose([{ p: 1, svg: g }], c) + C.vignette(0.55, '#080402', 0.45);
  };
  ST.armScene = armScene;

  // ======================================================= CHAIR: tied to the wooden chair (-0.8 - 2.75)
  // "A village doctor ties you to a wooden chair,"
  {
    const cam = CAM(
      [[-0.8, [566, 1236, 0]], [0.69, [598, 1262, -0.4], 'sine'], [1.49, [520, 1300, 0.4], 'sine'], [2.2, [585, 1318, 0], 'io'], [2.75, [592, 1324, 0], 'in2']],
      [[-0.8, 0.95], [0.69, 1.22, 'sine'], [1.49, 1.34, 'sine'], [2.2, 1.85, 'io'], [2.75, 2.3, 'in2']]);
    ST.chairCam = cam;
    const youFace = t => { const yank = bump(t, 0.55, 1, 0.5); return { expr: 'fear', look: L2([0.75, 0.4], [0.2, 0.1], yank), lid: lerp(0.12, 0.4, yank), mouth: yank > 0.4 ? 'snarl' : 'tight', brows: [-10, 0], sweat: 0.25, wide: yank < 0.4 }; };
    const docFace = t => ({ expr: 'stern', look: t < 1.5 ? [-0.6, 0.6] : L2([0.4, 0.6], [-0.65, 0.55], ss(1.9, 2.3, t)), lid: 0.22, mouth: 'tight', brows: [6, -3] });
    const fn = t => {
      const c = hh(cam(t), t, 0.35, 1);
      return surgScene(t, c, { youFace, docFace, youSway: t => -1.5 * bump(t, 0.55, 1, 0.5), youTilt: t => 3 - 4 * bump(t, 0.55, 1, 0.5), marks: () => ({}) }) + C.vignette(0.5);
    };
    X.shot('CHAIR', -0.8, 2.75, fn, { grade: 'gHall' });
  }

  // ======================================================= ARM: the cut (2.15 - 5.8)
  // "cuts your healthy arm wide open with a sharp knife,"
  {
    const [c0, c1, cm] = cutEnds(C1);
    const side = armN;
    const hover = add(add(c0, side, 220), [0, -1], 60), lift = add(add(c1, side, 260), [0, -1], 220);
    const cam = CAM(
      [[2.15, [cm[0] + 60, cm[1] - 120, 0]], [2.6, [c0[0] + 90, c0[1] - 130, -1], 'sine'], [3.55, [c1[0] + 70, c1[1] - 110, 0], 'sine'], [4.2, [cm[0] + 50, cm[1] - 60, 1], 'io'], [5.2, [lift[0] - 80, lift[1] + 60, 0], 'io'], [5.8, [lift[0] - 70, lift[1] + 20, 0], 'sine']],
      [[2.15, 1.3], [2.6, 1.42, 'sine'], [3.55, 1.55, 'sine'], [4.2, 1.95, 'io'], [5.2, 1.55, 'io'], [5.8, 1.5, 'sine']]);
    ST.armCam = cam;
    ST.armCutScr = tt => scr(cm, cam(tt));
    const fn = t => {
      const c = hh(cam(t), t, 0.3, 3);
      const down = EZ.io(ss(2.15, 2.6, t)), draw = EZ.sine(ss(2.6, 3.55, t)), up = EZ.io(ss(4.2, 5.2, t));
      let tip = L2(hover, c0, down);
      if (t >= 2.6) tip = L2(c0, c1, draw);
      if (t >= 3.55) tip = add(c1, side, -4 * Math.sin(Math.PI * ss(3.55, 4.2, t)));
      if (t >= 4.2) tip = L2(c1, lift, up);
      const beta = lerp(160, 140, up);
      const open = EZ.out(ss(3.55, 4.2, t)), blood = ss(3.7, 5.6, t) * 0.75;
      const cuts = [Object.assign({}, C1, { draw: t < 2.6 ? 0 : draw, open, blood })];
      const glint = env(t, 4.5, 4.55, 4.95, 5.0) > 0 ? clamp((t - 4.5) / 0.5) : null;
      // a drop of blood falls from the blade tip as it lifts
      const dropT = ss(4.6, 5.0, t);
      const drops = t > 4.6 ? `<circle cx="${f(lerp(lift[0] * 0.3 + c1[0] * 0.7, c1[0] + 20, dropT))}" cy="${f(lerp(lift[1] * 0.3 + c1[1] * 0.7, c1[1] + 30, EZ.in2(dropT)))}" r="7" fill="#8a0a08" opacity="${f(1 - ss(4.98, 5.05, t))}"/>` : '';
      return armScene(t, c, { cuts, tool: { tip, beta, hr: 70, lo: { blood: ss(2.8, 3.6, t) * 0.8, glint } }, tremble: ss(2.6, 2.9, t) });
    };
    X.shot('ARM', 2.15, 5.8, fn, { grade: 'gHall' });
  }

  // ======================================================= MILK: the milkmaid's blister (5.2 - 8.85)
  // "and rubs thick yellow pus from a sick farm girl's blister"
  {
    const cam = CAM(
      [[5.2, [1080, 1300, 0]], [5.6, [1062, 1308, 0], 'sine'], [6.5, [1058, 1306, 0.5], 'sine'], [7.25, [1160, 1050, 0], 'io'], [7.9, [1180, 980, -0.5], 'sine'], [8.55, [985, 1290, 0], 'io'], [8.85, [950, 1300, 0], 'sine']],
      [[5.2, 3.0], [5.6, 3.5, 'sine'], [6.5, 3.85, 'sine'], [7.25, 2.4, 'io'], [7.9, 2.55, 'sine'], [8.55, 3.0, 'io'], [8.85, 3.2, 'sine']]);
    ST.milkCam = cam;
    const maidFace = t => { const sting = bump(t, 5.65, 1, 0.6); return { expr: sting > 0.3 ? 'grief' : 'anxious', mouth: sting > 0.3 ? 'tight' : 'closed', look: t < 7.4 ? [-0.55, 0.65] : L2([-0.55, 0.65], [-0.9, 0.15], ss(7.4, 7.8, t)), lid: lerp(0.3, 0.55, sting), brows: [-9, 2], blush: 0.15, sweat: 0.2 }; };
    const docFace = t => ({ expr: 'stern', look: [0.55, 0.6], lid: 0.22, mouth: 'tight', brows: [7, -3] });
    const fn = t => {
      const c0 = cam(t);
      // the camera holds on the real blister point (the rig's computed hand), not a guess
      const bp = BLISTER, k = env(t, 5.2, 5.25, 6.6, 7.0);
      const c = hh([lerp(c0[0], bp[0] + 6, k), lerp(c0[1], bp[1] - 6, k), c0[2], c0[3]], t, 0.25, 5);
      const out = surgScene(t, c, { maidFace, docFace, maidTilt: t => -4 + 3 * bump(t, 5.65, 1, 0.6), marks: () => ({}) });
      return out + C.vignette(0.55);
    };
    X.shot('MILK', 5.2, 8.85, fn, { grade: 'gHall' });
  }

  // ======================================================= WOUND: the pus rubbed into the cut (8.25 - 11.05)
  // "straight into your bleeding wound."
  {
    const [c0, c1, cm] = cutEnds(C1);
    const enter = add(add(cm, armN, 300), [0, -1], 120);
    const cam = CAM(
      [[8.25, [cm[0] + 70, cm[1] - 90, 0]], [9.2, [cm[0] + 50, cm[1] - 70, -1], 'sine'], [10.3, [cm[0] + 30, cm[1] - 40, 1], 'sine'], [11.05, [cm[0] + 20, cm[1] - 70, 0], 'sine']],
      [[8.25, 1.5], [9.2, 1.75, 'sine'], [10.3, 2.15, 'sine'], [11.05, 2.0, 'sine']]);
    ST.woundCam = cam;
    ST.woundScr = tt => scr(cm, cam(tt));
    const fn = t => {
      const c = hh(cam(t), t, 0.3, 7);
      const inn = EZ.io(ss(8.5, 9.2, t)), rub = env(t, 9.2, 9.35, 10.15, 10.35), out = EZ.io(ss(10.3, 11.0, t));
      let tip = L2(enter, c0, inn);
      if (t > 9.2) tip = add(cm, armU, -60 * Math.cos((t - 9.2) * 7.2) * rub + (1 - rub) * (t < 9.8 ? -60 : 0));
      if (t > 10.3) tip = L2(add(cm, armU, -60 * Math.cos((10.3 - 9.2) * 7.2) * rub), enter, out);
      const pusIn = ss(9.25, 10.2, t), blood = lerp(0.75, 1, ss(9.8, 10.8, t));
      const cuts = [Object.assign({}, C1, { draw: 1, open: 1, blood, pus: pusIn })];
      return armScene(t, c, { cuts, tool: t < 10.95 ? { tip, beta: 160, hr: 70, lo: { pus: 1 - 0.7 * pusIn, blood: 0.5 } } : null, tremble: 0.6 + 0.6 * rub });
    };
    X.shot('WOUND', 8.25, 11.05, fn, { grade: 'gHall' });
  }

  // ======================================================= WINDOW: you look to the window (10.45 - 12.05)
  // "Outside your window,"
  {
    const WC = [(SG.WIN[0] + SG.WIN[2]) / 2, (SG.WIN[1] + SG.WIN[3]) / 2];
    // camera centre that puts the window's centre (wall layer p 0.78) on screen centre
    const winCam = [540 + (WC[0] - 540) / SG.WP, 960 + (WC[1] - 960) / SG.WP];
    const cam = CAM(
      [[10.45, [410, 1110, 0]], [10.95, [400, 1100, 0], 'sine'], [11.6, [lerp(400, winCam[0], 0.85), lerp(1100, winCam[1], 0.85), -1], 'io'], [12.05, [winCam[0], winCam[1], -1.5], 'in2']],
      [[10.45, 2.5], [10.95, 2.55, 'sine'], [11.6, 2.0, 'io'], [12.05, 2.35, 'in2']]);
    ST.winCam = cam;
    ST.winScr = tt => scr(WC, cam(tt), SG.WP);
    const youFace = t => { const turn = EZ.io(ss(10.75, 11.15, t)); return { expr: 'fear', look: L2([0.55, 0.3], [-0.95, -0.25], turn), lid: 0.14, mouth: 'tight', brows: [-11, 1], sweat: 0.35, tears: true }; };
    const fn = t => {
      const c = hh(cam(t), t, 0.3, 9);
      return surgScene(t, c, { youFace, youTilt: t => lerp(3, -6, EZ.io(ss(10.75, 11.2, t))), marks: () => ({ cut: 1, pus: 1, blood: 0.6 }) }) + C.vignette(0.5);
    };
    X.shot('WINDOW', 10.45, 12.05, fn, { grade: 'gHall' });
  }

  // ======================================================= STREET: the plague street (11.45 - 17.05)
  // "every third person on your street is dying from a deadly plague that covers their skin in painful sores,"
  {
    const FY = S.STREET.FY, [tx0, tx1, ty] = S.STREET.TROUGH;
    const SMAN = [962, 1990], SM_S = 0.62;
    // the dying man's head point for the camera (computed from his rig placement each frame; this is the fallback)
    const cam = CAM(
      [[11.45, [600, 1180, 0]], [11.9, [470, 1300, 0], 'out2'], [12.3, [640, 1320, 0], 'sine'], [12.75, [900, 1300, 0], 'sine'], [13.35, [760, 1130, 0], 'io'], [13.9, [930, 1230, 0], 'sine'], [15.0, [955, 1220, 0], 'io'], [16.0, [940, 1215, 1], 'sine'], [16.6, [1010, 1360, 0], 'io'], [17.05, [1020, 1380, 0], 'sine']],
      [[11.45, 1.0], [11.9, 1.18, 'out2'], [12.3, 1.22, 'sine'], [12.75, 1.28, 'sine'], [13.35, 1.08, 'io'], [13.9, 1.5, 'sine'], [15.0, 2.9, 'io'], [16.0, 3.6, 'sine'], [16.6, 3.3, 'io'], [17.05, 3.4, 'sine']]);
    ST.streetCam = cam;
    const fn = t => {
      const c = hh(cam(t), t, 0.4, 11), L = LT.street;
      const set = S.street9(t);
      // the sick woman in the doorway of the house across (in the mid layer): pox, coughing, leaning on the frame
      { const wo = Object.assign(idle(t, 21, 0.6), { x: 205, y: 1430, s: 0.42 }); const cough = bump(t, 12.0, 1, 0.5) + bump(t, 14.2, 1, 0.5);
        wo.sway = 3 + cough * 2;
        const SW = Q.sickWoman(Object.assign(wo, { tilt: 6 + cough * 6, face: { expr: 'grief', look: [0.6, 0.2], lid: lerp(0.45, 0.8, cough), mouth: cough > 0.3 ? 'cry' : 'closed', sweat: 0.4 },
          armR: { hand: [-150, -1000], dir: [0.2, -1], pose: 'open', facing: 'palm' }, armL: { hand: [100, -840], dir: [-0.6, 0.5], pose: 'relaxed', facing: 'back' } }));
        const mid = set.find(Lr => Lr.p === 0.62); if (mid) mid.svg += lit(SW, L, 0.62); }
      // the villager hurrying past with her basket (skirt to the ground, walking right to left with a bob)
      const vx = lerp(470, 130, ss(11.5, 13.6, t)), step = Math.cos(t * 9);
      const vo = Object.assign(idle(t, 31, 0.6), { x: vx, y: FY + 10 - 5 * (0.5 + 0.5 * step), s: 0.6 });
      vo.sway += 1.6 * Math.sin(t * 4.5);
      const basketAt = R.toWorld(vo, [-170, -760]);
      const V = Q.villagerW(Object.assign(vo, { tilt: -4, face: { expr: 'fear', look: [0.85, 0.05], lid: 0.15, mouth: 'tight', brows: [-10, 2] },
        armR: gripAt(vo, 'villagerW', basketAt, [0.15, 1], { detachHand: true }), armL: { hand: [150, -830], dir: [-0.3, 1], pose: 'relaxed', facing: 'back' } }));
      const basket = `<g transform="translate(${f(basketAt[0])},${f(basketAt[1] + 14)})"><path d="M-62,0 L62,0 L50,70 L-50,70Z" fill="#a8844a" stroke="#3a2a10" stroke-width="2"/>${[0, 1, 2, 3].map(i => `<path d="M-60,${12 + i * 16} L60,${12 + i * 16}" stroke="#6a4a20" stroke-width="3"/>`).join('')}<path d="M-56,0 Q0,-70 56,0" stroke="#6a4a20" stroke-width="7" fill="none"/><ellipse cx="-14" cy="-6" rx="26" ry="10" fill="#d8c8a0"/></g>`;
      // the digger leaning on his spade by the cart, watching the dying man
      const go = Object.assign(idle(t, 41, 0.6), { x: 640, y: FY, s: 0.62 });
      const spadeTop = [go.x - 14, 1300];
      const Dg = Q.digger(Object.assign(go, { tilt: 4, face: { expr: 'grim', look: t < 13.3 ? [-0.4, 0.05] : [0.85, 0.15], lid: 0.32, mouth: 'tight' },
        armR: gripAt(go, 'digger', [spadeTop[0] - 6, spadeTop[1] + 8], [0.3, 1], { detachHand: true }), armL: gripAt(go, 'digger', [spadeTop[0] + 22, spadeTop[1] + 4], [-0.4, 1], { detachHand: true, facing: 'back' }) }));
      const spade = `<path d="M${spadeTop[0] - 24},${spadeTop[1]} L${spadeTop[0] + 24},${spadeTop[1]}" stroke="#3a2614" stroke-width="12" stroke-linecap="round"/><path d="M${spadeTop[0]},${spadeTop[1]} L${spadeTop[0] + 20},${FY - 90}" stroke="#5a3a1e" stroke-width="13"/><path d="M${spadeTop[0] - 18},${FY - 100} L${spadeTop[0] + 58},${FY - 96} L${spadeTop[0] + 50},${FY + 10} L${spadeTop[0] - 6},${FY + 6}Z" fill="#5a5a58" stroke="#1a1a1a" stroke-width="2"/>`;
      // the dying man sitting behind the trough, his sore-covered hand on its edge; at "dying" his head drops
      const die = EZ.io(ss(13.55, 14.05, t)), breathe = (1 - die) * 1.5 * Math.sin(t * 5);
      const so = Object.assign(idle(t, 51, 0.3), { x: SMAN[0], y: SMAN[1] + 24 * die, s: SM_S });
      so.sway = -2 + 7 * die + breathe * 0.3;
      const edgeHand = [1046, ty - 214];
      const SMp = Q.sickMan(Object.assign(so, { tilt: lerp(-4, 22, die), face: { expr: die > 0.5 ? 'hollow' : 'tired', look: die > 0.5 ? [0.2, 0.6] : [-0.55, 0.0], lid: lerp(0.62, 0.97, die), mouth: die > 0.5 ? 'parted' : 'closed', open: 0.1 + 0.08 * (1 - die) * (0.5 + 0.5 * Math.sin(t * 5)), sweat: 0.7 },
        armR: { hand: [-120, -700], dir: [0.2, 1], pose: 'relaxed', facing: 'back' }, armL: { hand: R.toLocal(so, edgeHand), dir: [0.15, 1], pose: 'relaxed', facing: 'back', detachHand: true } }));
      // sores on the back of his hand
      const hw2 = R.toWorld(so, SMp.jL.W);
      let sores = ''; const rs = rng(77); for (let i = 0; i < 7; i++) { const p = [hw2[0] - 14 + rs() * 30, hw2[1] + 6 + rs() * 46], r0 = 2.4 + rs() * 2.4; sores += `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="${f(r0 * 1.8)}" fill="#b8402e" opacity="0.5"/><circle cx="${f(p[0])}" cy="${f(p[1])}" r="${f(r0)}" fill="#ecd89a" stroke="#7a2a1a" stroke-width="0.7"/>`; }
      const manBody = `<defs><clipPath id="trC"><rect x="-2000" y="-2000" width="6000" height="${f(ty - 200 + 2000)}"/></clipPath></defs><g clip-path="url(#trC)">${lit(SMp, L)}</g>`;
      const chars = S.cart(560, FY - 40, 0.5, t) + lit(Dg, L) + spade + handsLit(Dg, L) + manBody + S.trough(t) + armsOver(SMp, L, 'L') + handsLit(SMp, L, 'L') + sores + lit(V, L) + basket + handsLit(V, L, 'R');
      return X.compose(X.stage(set, chars), c) + `<rect width="1080" height="1920" fill="#6a7a8a" opacity="0.14" style="mix-blend-mode:multiply"/>` + C.vignette(0.6);
    };
    X.shot('STREET', 11.45, 17.05, fn, { grade: 'gNight' });
  }

  // ======================================================= PULL: you try to pull your arm back (16.55 - 21.6)
  // "yet you still try to pull your arm back as the doctor forces a nasty sickness from a farm cow"
  {
    const cam = CAM(
      [[16.55, [470, 1180, 0]], [17.4, [450, 1170, 0], 'sine'], [18.4, [520, 1230, -1.5], 'io'], [19.3, [480, 1190, 1], 'sine'], [19.95, [800, 1020, 0], 'io'], [20.6, [790, 1010, 0], 'sine'], [21.3, [640, 1290, 0], 'io'], [21.6, [630, 1300, 0], 'sine']],
      [[16.55, 1.95], [17.4, 2.1, 'sine'], [18.4, 1.75, 'io'], [19.3, 1.9, 'sine'], [19.95, 2.5, 'io'], [20.6, 2.7, 'sine'], [21.3, 2.3, 'io'], [21.6, 2.45, 'sine']]);
    ST.pullCam = cam;
    // the tugs: your body leans away, the wrist strains against the strap (a few px), the fist clenches
    const tug = t => bump(t, 17.9, 1, 0.55) + bump(t, 18.55, 0.8, 0.5) + bump(t, 19.1, 0.6, 0.45);
    const youFace = t => { const k = tug(t); return { expr: k > 0.3 ? 'grief' : 'fear', mouth: k > 0.3 ? 'snarl' : 'tight', look: k > 0.3 ? [0.3, 0.2] : [0.7, 0.4], lid: k > 0.3 ? 0.55 : 0.15, brows: [-12, 2], sweat: 0.55, tears: true }; };
    const docFace = t => { const force = env(t, 19.3, 19.6, 21.0, 21.3); return { expr: 'stern', look: L2([-0.6, 0.55], [-0.45, 0.62], force), lid: lerp(0.2, 0.28, force), mouth: 'tight', cd: lerp(3, 5, force), brows: [lerp(6, 12, force), -4] }; };
    const fn = t => {
      const c = hh(cam(t), t, 0.4, 13);
      const k = tug(t);
      return surgScene(t, c, { youFace, docFace, youSway: t => -4 * tug(t), youTilt: t => 3 - 6 * tug(t), youLwrist: t => [WRIST_L[0] - 6 * tug(t), WRIST_L[1] - 3 * tug(t)], youFist: () => true,
        docSway: t => 1.5 * env(t, 19.3, 19.7, 21.0, 21.4), press: t => 4 * Math.sin((t - 19.3) * 6) * env(t, 19.3, 19.6, 21.0, 21.3), marks: () => ({ cut: 1, pus: 1, blood: 0.8 }) }) + C.vignette(0.5);
    };
    X.shot('PULL', 16.55, 21.6, fn, { grade: 'gHall' });
  }

  // ======================================================= transitions, part 1
  X.tr('zmatch', 2.45, 0.6, 'CHAIR', 'ARM', { fa: [540, 960], fb: [540, 960], za: 2.2, zb: 2.0, seed: 4 });
  X.tr('wipe', 5.5, 0.6, 'ARM', 'MILK', { dir: 1, truck: 160, obj: (x, u) => { const g = `<defs><linearGradient id="wpo" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0a0c12" stop-opacity="0"/><stop offset="0.2" stop-color="#0a0c12"/><stop offset="0.8" stop-color="#0a0c12"/><stop offset="1" stop-color="#0a0c12" stop-opacity="0"/></linearGradient></defs>`; return g + `<rect x="${f(x - 760)}" y="-100" width="1520" height="2120" fill="url(#wpo)"/><rect x="${f(x - 420)}" y="-100" width="120" height="2120" fill="#1e2638" opacity="0.6"/>`; } });
  X.tr('liquid', 8.55, 0.6, 'MILK', 'WOUND', { fa: [540, 960], fb: [540, 960], col: '#b89430', seed: 12 });
  X.tr('bokeh', 10.75, 0.6, 'WOUND', 'WINDOW', { dir: [0, -1], dist: 0.35, blur: 14, seed: 7 });
  X.tr('carry', 11.75, 0.6, 'WINDOW', 'STREET', { mode: 'zoom', k: 1.9, fa: [540, 960], fb: [540, 900], blur: 3 });
  X.tr('organic', 16.8, 0.5, 'STREET', 'PULL', { fa: [540, 960], fb: [540, 960], za: 1.1, zb: 0.92, seed: 9, freq: 0.004 });
  X.tr('push', 21.3, 0.6, 'PULL', 'COW', { fa: [540, 960], fb: [540, 1000], za: 1.8, zb: 0.7, fade: [0.4, 0.6], blur: 6 });
})(window);
