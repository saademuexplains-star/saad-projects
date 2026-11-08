// "The Rabies Boy" part 1: the needle -> the drying spinal cords -> the man who isn't a doctor -> nine years old ->
// the mad dog on the village road -> the ward where everyone bitten dies.
// The laboratory is one world whose occupants are a function of time (lab()), so every angle on it agrees.
// Rules kept: arms over furniture only while resting on it; tools rigid in the fist with exact tips (rigTool);
// no pose snaps; hand paths off faces; every scene change hidden in a matched move.
(function (G) {
  const X = G.ENG, Q = G.QCAST, S = G.SETS, PR = G.PROPS, C = G.CINE, R = G.RIG;
  const { track: TK, ss, clamp, lerp, EZ } = X;
  const { f, mix, rng } = R;
  const TAU = Math.PI * 2, D2R = Math.PI / 180;
  // ---- helper header
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
  const HAND = { you: 74, youAdult: 116, sci: 112, doc: 114, mother: 104, patient: 116, sister: 104 };
  const SH = { you: [104, -606], youAdult: [162, -1150], sci: [158, -1150], doc: [160, -1150], mother: [136, -1118], patient: [156, -1150], sister: [136, -1118] };
  const gripAt = (o, who, Gw, dW, extra = {}) => { const dl = nrm(R.dirLocal(o, dW)), gl = R.toLocal(o, Gw), gy = 0.33 * HAND[who]; return Object.assign({ hand: [gl[0] - dl[0] * gy, gl[1] - dl[1] * gy], dir: dl, pose: 'grip', facing: 'back' }, extra); };
  const armsOver = (p, L, which = 'RL') => C.lit({ svg: (which.includes('R') ? p.armRsvg : '') + (which.includes('L') ? p.armLsvg : ''), info: p.info }, Object.assign({ view: X.viewRect(1) }, L)).body;
  const handsLit = (p, L, which = 'RL') => C.lit({ svg: (which.includes('R') ? p.handR || '' : '') + (which.includes('L') ? p.handL || '' : ''), info: p.info }, Object.assign({ view: X.viewRect(1) }, L)).body;
  const CAM = (pk, zk) => { const P = TK(pk), Z = TK(zk); return t => { const p = P(t); return [p[0], p[1], Z(t), p[2]]; }; };
  const thumbSign = (side, facing) => (side === 'R' ? -1 : 1) * (facing === 'palm' ? 1 : -1);
  const closeGrip = (tip, beta, side, facing, size, hr, tipLen) => {
    const d = dirA(beta + thumbSign(side, facing) * (90 - hr)), b = dirA(beta), slot = [tip[0] - b[0] * tipLen, tip[1] - b[1] * tipLen];
    return { wrist: [slot[0] - d[0] * 0.33 * size, slot[1] - d[1] * 0.33 * size], dir: d, slot };
  };
  // tools in rig hands: fingers laid along the forearm (shoulder -> wrist) so the rig's wrist clamp never turns the hand;
  // the tool keeps a fixed hold angle hr and its tip lands exactly on tipW
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
  // the world point of a head-local point (eye, mouth) of a placed character
  const headW = (o, kind, p) => R.toWorld(o, R.headPt(o, kind, p));
  const LT = {
    labDay: { from: [-0.75, -0.5], shadow: '#140c06', shadowOp: 0.48, floor: '#2a1c10', floorOp: 0.32, contactOp: 0.42, key: '#f0f2f4', keyAdd: 0.06, rims: [{ from: [1, -0.2], col: '#ffc070', w: 6, op: 0.42 }, { from: [-1, -0.5], col: '#d8e4ee', w: 4, op: 0.32 }], face: { col: '#ffe8d0', op: 0.13 } },
    labNight: { from: [0.65, -0.45], shadow: '#0c0806', shadowOp: 0.55, floor: '#1a120a', floorOp: 0.38, contactOp: 0.45, key: '#ffcf90', keyAdd: 0.07, rims: [{ from: [1, -0.2], col: '#ffb060', w: 7, op: 0.55 }, { from: [-1, -0.5], col: '#9ab0d8', w: 4, op: 0.28 }], face: { col: '#ffcf98', op: 0.14 } },
    road: { from: [0.8, -0.6], shadow: '#2a1c10', shadowOp: 0.4, floor: '#4a3a20', floorOp: 0.3, contactOp: 0.4, key: '#fff0d0', keyAdd: 0.07, rims: [{ from: [1, -0.4], col: '#ffe0a0', w: 7, op: 0.55 }], face: { col: '#fff0d8', op: 0.1 } },
    ward: { from: [-0.5, -0.85], shadow: '#1a1814', shadowOp: 0.42, floor: '#2a2620', floorOp: 0.32, contactOp: 0.4, key: '#eef0f0', keyAdd: 0.05, rims: [{ from: [-1, -0.4], col: '#e8eef4', w: 5, op: 0.35 }, { from: [1, 0], col: '#ffc890', w: 4, op: 0.2 }], face: { col: '#f4ece4', op: 0.1 } },
  };
  G.SHOTS_K = { wave, env, bump, idle, hh, scr, nrm, L2, add, dirA, HAND, gripAt, armsOver, handsLit, CAM, closeGrip, toolPose, rigTool, thumbSign, headW, LT };
  const ST = {};
  G.RABIES = ST;

  // ======================================================= the laboratory world (time -> everyone's pose)
  const LAB = S.LAB, YS = LAB.YS, CX = LAB.CX, SEAT = LAB.TABLE[2] - 24, FLOOR = LAB.FLOOR;
  const YOU0 = [CX, SEAT + 250 * YS], DOC0 = [770, FLOOR], DOC_S = 0.86, SCI0 = [140, FLOOR], SCI_S = 0.84, MOM0 = [270, FLOOR + 14], MOM_S = 0.86;
  const SCI_N = 40, HOLD_W = [310, 1090];   // the tenth night: the scientist stands further back; your hand in your mother's
  const INJ = [66, -330];    // the injection point on your belly (person-local)
  // the syringe is held by the back of its barrel, so the glass with the dose and the needle stand clear of the fist
  const SYRS = 110, SYRTIP = 168 * SYRS / 116;
  const SYR = (o2 = {}) => `<g transform="translate(${f(30 * SYRS / 116)},0)">${PR.syringeG(Object.assign({ size: SYRS }, o2))}</g>`;
  ST.LABW = { YOU0, INJ, SEAT };
  // the doctor's syringe at time t: { tip, fill, col, hr } or null; one injection morning (0 - 4.2), the tenth night (26.9 - 29.6)
  const shot = (t, night) => {
    const t0 = night ? 27.85 : 2.65;   // the moment the needle touches the skin
    const app = EZ.io(ss(t0 - (night ? 1.0 : 3.6), t0, t)), push = ss(t0 + 0.25, t0 + 1.25, t), out = EZ.io(ss(t0 + 1.4, t0 + 1.9, t));
    const inj = R.toWorld({ x: YOU0[0], y: YOU0[1], s: YS }, INJ);
    const hover = [inj[0] + 66, inj[1] - 28], back = [inj[0] + 110, inj[1] - 70];
    let tip = L2(hover, inj, app);
    const press = ss(t0, t0 + 0.2, t) * (1 - out);
    tip = add(tip, [-1, 0.2], 4 * press);
    if (t > t0 + 1.4) tip = L2(add(inj, [-1, 0.2], 4), back, out);
    return { tip, fill: lerp(0.92, 0.14, push), col: night ? '#8a1e1a' : '#c8a890', press, inj, out };
  };
  ST.shot = shot;
  // everyone in the lab. o: youFace, docFace, sciFace, momOn, night, youSway, youTilt, extra
  const labCast = (t, o = {}) => {
    const L = o.night ? LT.labNight : LT.labDay, nt = !!o.night;
    // ---------------- you, on the table, shirt lifted on your left side for the needle
    const yo = Object.assign(idle(t, 3, 0.5), { x: YOU0[0], y: YOU0[1], s: YS });
    yo.sway = (o.youSway ? o.youSway(t) : 0) + yo.sway * 0.4;
    const yf = o.youFace ? o.youFace(t) : { expr: 'fear', look: [0.65, 0.35], lid: 0.14, mouth: 'tight', brows: [-11, 1], sweat: 0.3 };
    const sh = shot(t, nt);
    // by day your right hand holds the shirt up and your left rests on the blanket; on the tenth night your left hand
    // holds the shirt and your right reaches out to your mother, who holds it in both of hers
    const armsYou = nt
      ? { armR: { hand: R.toLocal(yo, HOLD_W), dir: nrm(R.dirLocal(yo, [-1, 0.12])), pose: 'relaxed', facing: 'back', detachHand: true },
          armL: gripAt(yo, 'you', R.toWorld(yo, [40, -432]), [-0.25, 1], { detachHand: true }) }
      : { armR: gripAt(yo, 'you', R.toWorld(yo, [-6, -420]), [0.35, 1], { detachHand: true }),
          armL: { hand: R.toLocal(yo, [CX + 112, SEAT - 124]), dir: nrm(R.dirLocal(yo, [-0.1, 1])), pose: 'fist', facing: 'back', detachHand: true } };
    const Y = Q.you(Object.assign(yo, { outfit: 'shirt', noLegs: true, tilt: o.youTilt ? o.youTilt(t) : 2, face: yf }, armsYou));
    // the lifted shirt: bare belly and flank on your left, the hem rolled up under your hand; the needle mark
    const bx = (p) => R.toWorld(yo, p);
    const [b0, b1, b2, b3] = [bx([-10, -420]), bx([96, -430]), bx([108, -250]), bx([-14, -250])];
    let belly = `<path d="M${f(b0[0])},${f(b0[1])} L${f(b1[0])},${f(b1[1])} C${f(b1[0] + 8)},${f((b1[1] + b2[1]) / 2)} ${f(b2[0] + 6)},${f(b2[1] - 40)} ${f(b2[0])},${f(b2[1])} L${f(b3[0])},${f(b3[1])}Z" fill="#f0caa8" stroke="#3a1a0c" stroke-width="1.6"/>`;
    belly += `<path d="M${f(bx([30, -400])[0])},${f(bx([30, -400])[1])} q14,40 4,110" stroke="#c89070" stroke-width="3" fill="none" opacity="0.5"/><ellipse cx="${f(bx([20, -300])[0])}" cy="${f(bx([20, -300])[1])}" rx="5" ry="3" fill="#b8805a" opacity="0.6"/>`;
    belly += `<path d="M${f(b0[0] - 6)},${f(b0[1] + 2)} C${f(b0[0] + 40)},${f(b0[1] - 18)} ${f(b1[0] - 30)},${f(b1[1] - 16)} ${f(b1[0] + 8)},${f(b1[1] + 2)}" stroke="#ece6d8" stroke-width="22" stroke-linecap="round" fill="none"/><path d="M${f(b0[0] - 6)},${f(b0[1] + 8)} C${f(b0[0] + 40)},${f(b0[1] - 10)} ${f(b1[0] - 30)},${f(b1[1] - 8)} ${f(b1[0] + 8)},${f(b1[1] + 8)}" stroke="#a8a090" stroke-width="3" fill="none"/>`;
    // earlier needle marks (one per day) and the skin pinching around the needle while it is in
    const days = o.marks ?? 1, rm = rng(41);
    for (let i = 0; i < days; i++) { const p = bx([22 + rm() * 64, -396 + rm() * 120]), r0 = 2.2 + rm() * 1.4; belly += `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="${f(r0 * 2.2)}" fill="#d88a70" opacity="0.22"/><circle cx="${f(p[0])}" cy="${f(p[1])}" r="${f(r0)}" fill="#b83a2c" opacity="0.75"/>`; }
    if (sh.press > 0.01) belly += `<circle cx="${f(sh.inj[0])}" cy="${f(sh.inj[1])}" r="${f(6 + 3 * sh.press)}" fill="none" stroke="#b87a5a" stroke-width="2" opacity="${f(0.7 * sh.press)}"/>`;
    // bandages on both hands (the bites), drawn over the hands
    // a linen wrap around the wrist and the back of the hand, its turns crossing, a rust stain where the bite was
    const bandage = (W, d) => { const a = Math.atan2(d[1], d[0]) / D2R, hs = HAND.you * YS;
      return `<g transform="translate(${f(W[0])},${f(W[1])}) rotate(${f(a)})" opacity="0.94"><path d="M${f(-0.2 * hs)},${f(-0.27 * hs)} C${f(-0.02 * hs)},${f(-0.33 * hs)} ${f(0.12 * hs)},${f(-0.32 * hs)} ${f(0.2 * hs)},${f(-0.26 * hs)} L${f(0.2 * hs)},${f(0.26 * hs)} C${f(0.12 * hs)},${f(0.32 * hs)} ${f(-0.02 * hs)},${f(0.33 * hs)} ${f(-0.2 * hs)},${f(0.27 * hs)}Z" fill="#ece6d8" stroke="#8a8478" stroke-width="1.4"/>` +
        [-0.1, 0.02, 0.13].map(k => `<path d="M${f(k * hs)},${f(-0.3 * hs)} Q${f((k + 0.05) * hs)},0 ${f((k + 0.03) * hs)},${f(0.3 * hs)}" stroke="#b8b2a4" stroke-width="1.3" fill="none"/>`).join('') + `<path d="M${f(-0.2 * hs)},${f(0.12 * hs)} L${f(0.2 * hs)},${f(0.2 * hs)} L${f(0.2 * hs)},${f(0.26 * hs)} L${f(-0.2 * hs)},${f(0.27 * hs)}Z" fill="#000" opacity="0.08"/><ellipse cx="${f(0.06 * hs)}" cy="${f(-0.06 * hs)}" rx="${f(0.06 * hs)}" ry="${f(0.09 * hs)}" fill="#a8604a" opacity="0.3"/></g>`; };
    const fore = j => { const W = R.toWorld(yo, j.W), E = R.toWorld(yo, j.E); return [W, nrm([W[0] - E[0], W[1] - E[1]])]; };
    const bands = bandage(...fore(Y.jR)) + bandage(...fore(Y.jL));
    // ---------------- your mother at the end of the table (the tenth night), holding your hand in both of hers
    let momBody = '', momOver = '';
    if (nt) {
      const mo = Object.assign(idle(t, 17, 0.4), { x: MOM0[0], y: MOM0[1], s: MOM_S });
      mo.sway += o.momSway ? o.momSway(t) : 0;
      const sq = o.squeeze ? o.squeeze(t) : 0;
      const M = Q.mother(Object.assign(mo, { tilt: 5, face: o.momFace ? o.momFace(t) : { expr: 'grief', look: [0.7, 0.45], lid: 0.4, mouth: 'tight', brows: [-10, 2], tears: true },
        armR: { hand: R.toLocal(mo, [HOLD_W[0] - 26 + 3 * sq, HOLD_W[1] + 4]), dir: nrm(R.dirLocal(mo, [1, 0.25])), pose: 'relaxed', facing: 'back', detachHand: true },
        armL: { hand: R.toLocal(mo, [HOLD_W[0] + 4, HOLD_W[1] - 20 + 3 * sq]), dir: nrm(R.dirLocal(mo, [-0.35, 1])), pose: 'relaxed', facing: 'back', detachHand: true } }));
      momBody = lit(M, L); momOver = armsOver(M, L, 'RL') + handsLit(M, L);
    }
    // ---------------- the doctor with the syringe
    const D = Object.assign(idle(t, 7, 0.4), { x: DOC0[0], y: DOC0[1], s: DOC_S });
    D.sway += o.docSway ? o.docSway(t) : 0;
    const docFace = o.docFace ? o.docFace(t) : { expr: 'stern', look: [-0.7, 0.55], lid: 0.2, mouth: 'tight', brows: [7, -3] };
    const armR = rigTool(D, 'doc', 'R', 'back', sh.tip, 150, SYR({ fill: sh.fill, col: sh.col, drop: t < (nt ? 27.85 : 2.65) ? 0.9 : 0, glint: o.glint ? o.glint(t) : null }), SYRTIP, { detachHand: true });
    ST.dbgTip = sh.tip;
    const Dp = Q.doc(Object.assign(D, { tilt: -6, face: docFace, armR, armL: { hand: [110, -800], dir: [-0.2, 1], pose: 'relaxed', facing: 'back' } }));
    // ---------------- the scientist on his cane, his weak left hand curled at his waist
    const so = Object.assign(idle(t, 11, 0.3), { x: nt ? SCI_N : SCI0[0], y: SCI0[1], s: SCI_S });
    so.sway += o.sciSway ? o.sciSway(t) : 0;
    const caneTop = R.toWorld(so, [-170, -690]), caneFoot = [caneTop[0] - 18, FLOOR - 4];
    const sciFace = o.sciFace ? o.sciFace(t) : { expr: 'stern', look: [0.75, 0.4], lid: 0.16, mouth: 'tight', brows: [-4, 3] };
    const Sp = Q.sci(Object.assign(so, { tilt: o.sciTilt ? o.sciTilt(t) : 3, face: sciFace,
      armR: gripAt(so, 'sci', caneTop, [0.05, 1], { detachHand: true }), armL: { hand: [90, -830], dir: [-0.4, 1], pose: 'fist', facing: 'back' } }));
    const cane = `<path d="M${f(caneTop[0])},${f(caneTop[1] - 14)} L${f(caneFoot[0])},${f(caneFoot[1])}" stroke="#1a120a" stroke-width="12" stroke-linecap="round"/><path d="M${f(caneTop[0])},${f(caneTop[1] - 14)} L${f(caneFoot[0])},${f(caneFoot[1])}" stroke="#5a3a1e" stroke-width="7" stroke-linecap="round"/><path d="M${f(caneTop[0] - 6)},${f(caneTop[1] - 14)} q-10,-26 14,-30" stroke="#c8a040" stroke-width="8" fill="none" stroke-linecap="round"/>`;
    // ---------------- assemble: the scientist, your mother, the table, your torso and legs, your arms, the doctor
    const youTorso = `<g clip-path="url(#lbSeat)">${lit(Y, L)}</g>`;
    const legs = PR.kidLegs(CX, SEAT + 6, SEAT + 300 * YS, YS, { breeches: '#6a5844', stock: '#cfc8b8', swing: o.legSwing ? o.legSwing(t) : 0 });
    const defs = `<defs><clipPath id="lbSeat"><rect x="-2000" y="-2000" width="6000" height="${f(SEAT + 8 + 2000)}"/></clipPath></defs>`;
    ST.last = { yo, Y, D, Dp, so, Sp, sh };
    // ?dbg: the needle tip target (green) and the injection point (cyan)
    const dbg = G.DBG.dbg ? [[sh.tip, '#0f0'], [sh.inj, '#0ff']].map(([q, col]) => `<circle cx="${f(q[0])}" cy="${f(q[1])}" r="3" fill="none" stroke="${col}" stroke-width="1.5"/>`).join('') : '';
    return defs + lit(Sp, L) + cane + handsLit(Sp, L, 'R') + momBody + S.labTable(t) + youTorso + belly + legs + armsOver(Y, L, 'RL') + handsLit(Y, L) + bands + momOver + lit(Dp, L) + armsOver(Dp, L, 'R') + handsLit(Dp, L, 'R') + (o.extra ? o.extra(t) : '') + dbg;
  };
  ST.labCast = labCast;
  const labScene = (t, c, o = {}) => X.compose(X.stage(S.lab(t, { night: o.night ? 0.55 : 0 }), labCast(t, o)), c);
  ST.labScene = labScene;
  // world points used by cameras and transitions
  const youW = p => R.toWorld({ x: YOU0[0], y: YOU0[1], s: YS }, p);
  const YOU_EYE = R.toWorld({ x: YOU0[0], y: YOU0[1], s: YS }, R.headPt({ tilt: 2 }, 'kid', [-28, 8]));
  const YOU_FACE = youW([0, -700]), SCI_FACE = R.toWorld({ x: SCI0[0], y: SCI0[1], s: SCI_S }, [0, -1290]);
  ST.PTS = { YOU_EYE, YOU_FACE, SCI_FACE };

  // ======================================================= NEEDLE: the needle goes in (-0.8 - 4.55)
  // "Every day for ten days a needle filled with rabies is pushed into your stomach,"
  {
    const inj = shot(0, false).inj;
    // the camera rides the syringe toward the skin from frame 0 (already pushing in), jolts on the stab, cranes up to
    // your face, then eases back to show the room as the focus racks away
    const cam = t => {
      const s0 = shot(t, false).tip, follow = 1 - ss(2.7, 3.5, t), up = EZ.io(ss(2.85, 3.7, t)), back = EZ.io(ss(3.65, 4.55, t));
      // open on your frightened face above the needle and its dose; push down onto the needle as it closes on the skin
      const near = EZ.io(ss(-0.8, 2.6, t)), mid = [(s0[0] + 54 + YOU_FACE[0]) / 2 + 10, (s0[1] + YOU_FACE[1]) / 2 + 40];
      const p = L2(L2(mid, [s0[0] + 40, s0[1] - 10], near * follow), [inj[0] + 30, inj[1] - 8], 1 - follow);
      const q = L2(L2(p, [YOU_FACE[0] + 10, YOU_FACE[1] + 10], up), [CX + 120, 1060], back);
      const z = lerp(lerp(lerp(2.45, 4.3, Math.pow(near, 1.3)), 3.0, up), 2.0, back) * (1 + 0.025 * bump(t, 2.66, 1, 0.22));
      return [q[0], q[1], z, lerp(-1.5, 0.5, ss(-0.8, 4.5, t))];
    };
    ST.needleCam = cam;
    const youFace = t => { const stab = ss(2.62, 2.78, t), ease = ss(3.6, 4.4, t); return { expr: stab > 0.5 ? 'grief' : 'fear', mouth: stab > 0.5 ? 'snarl' : 'tight', look: stab > 0.5 ? [0.2, 0.2] : [0.6, 0.55], lid: lerp(lerp(0.14, 0.82, stab), 0.4, ease), brows: [-12, 2], sweat: 0.4, tears: t > 2.9 }; };
    const fn = t => {
      const c = hh(cam(t), t, 0.25, 1);
      return labScene(t, c, { youFace, youSway: t => -1.2 * bump(t, 2.66, 1, 0.5), youTilt: t => 2 - 5 * bump(t, 2.66, 1, 0.6), marks: 3, glint: t => env(t, 0.6, 0.65, 1.3, 1.4) > 0 ? clamp((t - 0.6) / 0.8) : null }) + C.vignette(0.55);
    };
    X.shot('NEEDLE', -0.8, 4.55, fn, { grade: 'gHall' });
  }

  // ======================================================= CORD: the spinal cords drying, the dose ground (3.75 - 9.55)
  // "each dose made from the spinal cord of a rabbit that died of the disease, stronger than the day before,"
  {
    const B = S.BENCH;
    const flaskX = i => -200 + i * 180;
    // the mortar on the bench: back rim, the pestle and the hand, then the bowl's front
    const MX = 820, MY = B.TOP + 150, MS = 1.5;
    // a heavy grey marble mortar: thick rim, a pouring lip, speckled stone, a broad foot
    const speck = (() => { const r = rng(17); let s2 = ''; for (let i = 0; i < 40; i++) { const x = -70 + r() * 140, y = -60 + r() * 60; if (Math.abs(x) > 74 - (y + 60) * 0.5) continue; s2 += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(0.8 + r() * 1.6)}" fill="${r() > 0.5 ? '#8a8680' : '#f4f2ec'}" opacity="0.6"/>`; } return s2; })();
    const mortarBack = `<g transform="translate(${MX},${MY}) scale(${MS})"><ellipse cx="0" cy="-70" rx="82" ry="18" fill="#d8d4cc" stroke="#5a5852" stroke-width="2"/><path d="M78,-74 L96,-78 L94,-70 L80,-66Z" fill="#d0ccc4" stroke="#5a5852" stroke-width="1.6"/><ellipse cx="0" cy="-68" rx="66" ry="12" fill="#9a948a"/><ellipse cx="0" cy="-66" rx="50" ry="7" fill="#b89a8a" opacity="0.85"/></g>`;
    const mortarFront = `<g transform="translate(${MX},${MY}) scale(${MS})"><ellipse cx="0" cy="8" rx="96" ry="15" fill="#000" opacity="0.45" filter="url(#b4)"/><path d="M-50,-4 L-56,8 L56,8 L50,-4Z" fill="#b8b4ac" stroke="#5a5852" stroke-width="1.6"/><path d="M-82,-70 C-78,-10 -46,-2 0,-2 C46,-2 78,-10 82,-70 C64,-58 -64,-58 -82,-70Z" fill="#cfcbc3" stroke="#5a5852" stroke-width="2"/>${speck}<path d="M-64,-50 C-46,-16 -20,-10 0,-10" stroke="#fff" stroke-width="5" fill="none" opacity="0.4"/><path d="M40,-12 C60,-20 72,-36 76,-58" stroke="#6a665e" stroke-width="6" fill="none" opacity="0.35"/></g>`;
    const pestleG = (k) => `<g transform="scale(${f(k)})"><path d="M-80,-8 C-20,-8 40,-7 64,-10 L64,10 C40,7 -20,8 -80,8Z" fill="#cfcbc3" stroke="#5a5852" stroke-width="1.5"/><ellipse cx="80" cy="0" rx="22" ry="18" fill="#cfcbc3" stroke="#5a5852" stroke-width="1.5"/><path d="M-76,-3 L62,-4" stroke="#fff" stroke-width="2" opacity="0.5"/><ellipse cx="-80" cy="0" rx="5" ry="8" fill="#b8b4ac" stroke="#5a5852" stroke-width="1.2"/></g>`;
    const HS = 330, PK = HS / 116;
    const docArm = (wrist, dir, hold, hr) => {
      const back = dirA(Math.atan2(dir[1], dir[0]) / D2R + 8), from = add(wrist, back, -1100), n = [-back[1], back[0]], w0 = HS * 0.62, w1 = HS * 0.46, cuff = add(wrist, back, -HS * 0.1);
      let g = `<path d="M${f(from[0] + n[0] * w0 / 2)},${f(from[1] + n[1] * w0 / 2)} L${f(cuff[0] + n[0] * w1 / 2)},${f(cuff[1] + n[1] * w1 / 2)} L${f(cuff[0] - n[0] * w1 / 2)},${f(cuff[1] - n[1] * w1 / 2)} L${f(from[0] - n[0] * w0 / 2)},${f(from[1] - n[1] * w0 / 2)}Z" fill="#16161a" stroke="#050506" stroke-width="3"/>`;
      g += `<path d="M${f(cuff[0] + n[0] * w1 * 0.52)},${f(cuff[1] + n[1] * w1 * 0.52)} L${f(cuff[0] - n[0] * w1 * 0.52)},${f(cuff[1] - n[1] * w1 * 0.52)}" stroke="#f2efe6" stroke-width="34"/><path d="M${f(cuff[0] + n[0] * w1 * 0.52 - back[0] * 16)},${f(cuff[1] + n[1] * w1 * 0.52 - back[1] * 16)} L${f(cuff[0] - n[0] * w1 * 0.52 - back[0] * 16)},${f(cuff[1] - n[1] * w1 * 0.52 - back[1] * 16)}" stroke="#a8a49a" stroke-width="2"/>`;
      g += R.hand({ x: wrist[0], y: wrist[1], dir, side: 'R', facing: 'back', pose: 'grip', size: HS, skin: '#e8c0a0', hold, holdRot: hr });
      return `<g filter="url(#skinS)">${g}</g>`;
    };
    // camera centres that frame a flask (shelf layer p 0.88) and the dead rabbit in its cage (far wall, p 0.7)
    const onP = (w, p) => [540 + (w[0] - 540) / p, 960 + (w[1] - 960) / p];
    const FL = i => onP([flaskX(i), B.SHELF - 120], 0.88), RAB = onP([290, 640], 0.7);
    const cam = CAM(
      [[3.75, [FL(5)[0] + 20, FL(5)[1] + 10, 0]], [4.55, [FL(5)[0], FL(5)[1], 0], 'sine'], [5.5, [MX + 30, MY - 90, -0.5], 'io'], [6.2, [MX - 10, MY - 70, 0], 'sine'], [7.1, [RAB[0], RAB[1], 0.5], 'io'], [7.45, [RAB[0] + 30, RAB[1] + 24, 0], 'sine'], [9.55, [FL(7)[0], FL(7)[1], 0], 'sine']],
      [[3.75, 2.4], [4.55, 2.6, 'sine'], [5.5, 2.2, 'io'], [6.2, 2.35, 'sine'], [7.1, 2.4, 'io'], [7.6, 2.3, 'sine'], [9.55, 2.1, 'sine']]);
    ST.cordCam = cam;
    const fn = t => {
      const c = hh(cam(t), t, 0.25, 3);
      const set = S.bench(t, { glow: ss(7.6, 9.2, t) });
      // the pestle grinds a piece of cord in broth: small circles, the hand rides with it
      const grind = env(t, 4.6, 4.9, 7.2, 7.5), a = (t - 4.6) * 7.5;
      // the pestle head works in small circles inside the bowl (hidden by its front wall); the fist rides with it
      const tip = [MX + 24 * Math.cos(a) * grind, MY - 52 * MS + 8 * Math.sin(a) * grind];
      // a low hold angle brings the forearm in from the right edge instead of down across the shelf of flasks
      const g = closeGrip(tip, 98 + 6 * Math.cos(a) * grind, 'R', 'back', HS, 50, 82 * PK * 0.7);
      const bits = (() => { let s2 = ''; const rb = rng(3); for (let i = 0; i < 10; i++) { const ang = rb() * TAU + a * 0.3, rr = 14 + rb() * 40; s2 += `<ellipse cx="${f(MX + Math.cos(ang) * rr * MS)}" cy="${f(MY - 67 * MS + Math.sin(ang) * rr * 0.16 * MS)}" rx="${f(6 + rb() * 6)}" ry="3" fill="#e0a49a" opacity="0.85"/>`; } return s2; })();
      // once the camera has risen to the rabbit, the arm draws back up out of the shot (its sleeve would cross the shelf)
      const ret = EZ.io(ss(7.15, 8.0, t)), bk = dirA(Math.atan2(g.dir[1], g.dir[0]) / D2R + 8);
      const arm = ret < 1 ? `<g transform="translate(${f(-bk[0] * 1700 * ret)},${f(-bk[1] * 1700 * ret)})">${docArm(g.wrist, g.dir, pestleG(PK * 0.7), 50)}</g>` : '';
      const chars = mortarBack + bits + arm + mortarFront;
      return X.compose(X.stage(set, chars), c) + C.vignette(0.6, '#080402', 0.4);
    };
    X.shot('CORD', 3.75, 9.55, fn, { grade: 'gHall' });
  }

  // ======================================================= LAB2: the man who isn't a doctor; nine years old (8.75 - 13.3)
  // "and the man ordering it isn't even a doctor. You're nine years old, and two days before the first shot"
  {
    const cam = CAM(
      [[8.75, [SCI_FACE[0] - 150, SCI_FACE[1] + 90, 0]], [9.7, [SCI_FACE[0] + 40, SCI_FACE[1] + 50, 0], 'out2'], [10.6, [SCI_FACE[0] + 20, SCI_FACE[1] + 40, 1], 'sine'], [11.5, [YOU_FACE[0], YOU_FACE[1] + 40, 0], 'io'], [12.5, [YOU_FACE[0] - 10, YOU_FACE[1] + 10, -0.5], 'sine'], [13.3, [YOU_EYE[0], YOU_EYE[1], 0], 'in2']],
      [[8.75, 2.1], [9.7, 2.5, 'out2'], [10.6, 2.8, 'sine'], [11.5, 2.6, 'io'], [12.5, 3.0, 'sine'], [13.3, 4.4, 'in2']]);
    ST.lab2Cam = cam;
    const sciFace = t => { const nod = bump(t, 9.95, 1, 0.5); return { expr: 'stern', look: L2([0.75, 0.4], [0.6, 0.55], nod), lid: lerp(0.14, 0.3, nod), mouth: 'tight', brows: [-6, 4] }; };
    const docFace = t => ({ expr: 'stern', look: t < 9.4 ? [-0.7, 0.55] : t < 10.6 ? [-0.9, -0.15] : [-0.7, 0.55], lid: 0.2, mouth: 'tight', brows: [5, -2] });
    const youFace = t => ({ expr: 'grief', mouth: 'tight', look: t < 11.6 ? [0.5, 0.5] : L2([0.5, 0.5], [0.02, 0.05], ss(11.6, 12.1, t)), lid: 0.3, brows: [-12, 3], tears: true, sweat: 0.3 });
    const fn = t => {
      const c = hh(cam(t), t, 0.3, 5);
      return labScene(t, c, { youFace, docFace, sciFace, sciTilt: t => 3 + 4 * bump(t, 9.95, 1, 0.5), marks: 3 }) + C.vignette(0.55);
    };
    X.shot('LAB2', 8.75, 13.2, fn, { grade: 'gHall' });
    ST.lab2Eye = tt => scr(YOU_EYE, cam(tt));
  }

  // ======================================================= ROAD: two days earlier, the mad dog (12.4 - 17.25)
  // "a mad dog ripped into you fourteen times,"
  {
    const RD = S.ROAD, WALL = RD.WALL, FY = RD.FY, BS = 0.8;
    // you walk to school behind the wall; the dog runs along the verge in front of it, leaps over it onto you
    const WP = 1.08, VERGE = 1880, BX = 470, DS = 1.25;
    const boyX = t => lerp(170, BX, ss(12.0, 14.35, t));
    const hit = t => EZ.io(ss(14.98, 15.3, t));   // knocked back by the dog's weight
    // a world point at the boy's depth (p 1) re-expressed on the wall layer (p 1.08) so it lands on the same screen point
    const toWall = (w, c) => { const s = scr(w, c, 1), zp = Math.pow(c[2], WP), px = 540 + (c[0] - 540) * WP, py = 960 + (c[1] - 960) * WP; return [px + (s[0] - 540) / zp, py + (s[1] - 960) / zp]; };
    // the dog lives on the wall layer: it gallops along the verge in front of the wall, leaps it (passing behind the
    // wall at the top of the arc, where no part of it overlaps the stones) and rears up onto you, hind feet hidden behind
    // the wall, jaws in your arm. Its position is the point between its hind feet.
    const PIV = [BX + 195, 1596];
    const dogP = (t, c) => {
      const run = (t - 13.95) / 0.65, u = clamp((t - 14.6) / 0.45);
      if (t < 14.6) return { x: lerp(1500, 950, run), y: VERGE + 20, rot: 0, behind: false, u: 0 };
      const P2 = toWall(PIV, c), P1 = [(950 + P2[0]) / 2, 1080];
      const x = (1 - u) * (1 - u) * 950 + 2 * u * (1 - u) * P1[0] + u * u * P2[0], y = (1 - u) * (1 - u) * (VERGE + 20) + 2 * u * (1 - u) * P1[1] + u * u * P2[1];
      return { x, y, rot: 34 * EZ.io(u), behind: u > 0.6, u };
    };
    ST.dogP = dogP;
    const cam = t => {
      const bx2 = boyX(t);
      const toDog = EZ.io(ss(13.95, 14.45, t)), back = EZ.io(ss(14.55, 15.05, t)), push = EZ.io(ss(15.1, 16.9, t));
      let p = L2([bx2 + 40, 1300], [lerp(1230, 1080, ss(14.0, 14.55, t)), 1640], toDog);
      p = L2(p, [BX + 30, 1330], back);
      p = L2(p, [BX - 10, 1236], push);
      const shake = 8 * env(t, 15.0, 15.12, 16.5, 16.85) * (Math.sin(t * 37) * 0.6 + Math.sin(t * 53) * 0.4) + 16 * bump(t, 14.98, 1, 0.3);
      const z = lerp(lerp(lerp(lerp(1.7, 1.82, ss(12.0, 13.95, t)), 1.5, toDog), 1.62, back), 2.15, push);
      return [p[0] + shake, p[1] + shake * 0.6, z, lerp(0.5, -1.5, ss(12, 14.5, t)) + 2.5 * push + shake * 0.06];
    };
    ST.roadCam = cam;
    ST.roadHead = tt => scr([boyX(tt), FY - 715 * BS], cam(tt));
    const fn = t => {
      const c = hh(cam(t), t, 0.45, 9), L = LT.road;
      const set = S.road(t);
      // you: walking to school with a bob; you stop at the growl, turn to it, raise your arms, are knocked back and
      // shoved about as the dog worries your arm
      const step = Math.cos(t * 9), bx2 = boyX(t), walking = 1 - ss(14.25, 14.55, t), hk = hit(t);
      const bite = env(t, 15.1, 15.3, 16.6, 16.95), snap = Math.pow(Math.max(0, Math.sin(t * 19)), 2), jerk = bite * Math.sin(t * 19 + 0.6);
      const yo = Object.assign(idle(t, 5, 0.6), { x: bx2 - 24 * hk + 5 * jerk, y: FY - 5 * (0.5 + 0.5 * step) * walking + 18 * hk, s: BS });
      yo.sway += 1.5 * Math.sin(t * 4.5) * walking - 13 * hk - 3 * jerk;
      const scared = ss(14.2, 14.45, t), guard = ss(14.5, 14.82, t), push2 = ss(15.0, 15.3, t);
      const sw = Math.sin(t * 9) * walking;
      const yFace = { expr: scared > 0.5 ? 'fear' : 'neutral', look: scared > 0.5 ? L2([0.85, 0.3], [0.8, -0.1], hk) : [0.45, 0.05], lid: lerp(lerp(0.2, 0.05, scared), 0.7, hk * (0.5 + 0.5 * snap)), mouth: guard > 0.5 ? 'shout' : scared > 0.5 ? 'parted' : 'closed', open: guard > 0.5 ? 0.85 : 0.3, brows: [lerp(0, -13, scared), 2], wide: scared > 0.5 && hk < 0.5, sweat: 0.2 * scared, tears: hk > 0.5 };
      const Y = Q.you(Object.assign(yo, { outfit: 'smock', tilt: lerp(-3, 8, scared) - 8 * hk + 3 * jerk, face: yFace,
        armR: { hand: L2(L2([-112 - 18 * sw, -378], [-140, -590], guard), [-190, -600 + 30 * Math.sin(t * 13)], push2), dir: nrm(L2(L2([0.1, 1], [0.35, -1], guard), [-0.3, -1], push2)), pose: guard > 0.5 ? 'open' : 'relaxed', facing: guard > 0.5 ? 'palm' : 'back' },
        armL: { hand: L2(L2([112 + 18 * sw, -378], [176, -600], guard), [226, -540 + 16 * Math.sin(t * 19)], push2), dir: nrm(L2(L2([-0.1, 1], [0.2, -1], guard), [0.75, -0.65], push2)), pose: guard > 0.5 ? 'open' : 'relaxed', facing: 'palm' } }));
      // the satchel on your hip, flung off as you are knocked back
      const hip = R.toWorld(yo, [104, -330]), sf = ss(14.95, 15.75, t);
      const satch = PR.satchel(hip[0] - 260 * sf, hip[1] - 230 * Math.sin(Math.PI * Math.min(1, sf * 1.2)) + 90 * sf, 0.62, -12 + 8 * sw - 320 * sf);
      // dust kicked up behind the wall
      const dust = (() => { const k = env(t, 14.98, 15.15, 16.5, 17.1); if (k <= 0) return ''; let s2 = ''; const rd = rng(5); for (let i = 0; i < 14; i++) { const a = rd() * Math.PI, r0 = 60 + rd() * 150 + 40 * Math.sin(t * 2 + i); s2 += `<circle cx="${f(BX + 40 + Math.cos(a) * r0 * 1.9)}" cy="${f(WALL - 4 - Math.sin(a) * r0 * 0.4)}" r="${f(34 + rd() * 44)}" fill="#c8b48a" opacity="${f(0.22 * k)}" filter="url(#b8)"/>`; } return s2; })();
      // the dog (on the wall layer), mirrored to run left, pivoting on its hind feet as it rears
      const d = dogP(t, c), u = d.u;
      const lunge = t < 14.6 ? 0 : u < 0.5 ? 0.95 * Math.sin(Math.PI * u) : lerp(0.95, 0.7, (u - 0.5) * 2);
      const dogSvg = PR.dog(0, 0, 1, t, { gait: t < 14.6 ? 1 : lerp(1, 0, u), run: (t - 13.95) * 2.6, lunge, jaw: t > 15.05 ? 0.3 + 0.7 * snap : lerp(0.4, 1, ss(14.4, 14.8, t)), foam: 1, mad: 1, col: '#4a3a2a', headA: t > 15.0 ? -6 + 18 * snap * bite : -12 * Math.sin(Math.PI * u) });
      const dog = `<g transform="translate(${f(d.x + 8 * bite * Math.sin(t * 26))},${f(d.y + 6 * bite * Math.sin(t * 31))}) rotate(${f(d.rot + 4 * jerk)}) scale(${-DS},${DS}) translate(65,0)">${dogSvg}</g>`;
      const wallClip = `<defs><clipPath id="rdW"><rect x="-3000" y="-3000" width="8000" height="${WALL + 3000}"/></clipPath></defs>`;
      const layers = X.stage(set, dust + satch + lit(Y, L));
      const wi = layers.findIndex(Lr => Lr.p === WP);
      layers[wi] = { p: WP, svg: (d.behind ? wallClip + `<g clip-path="url(#rdW)">${dog}</g>` : '') + layers[wi].svg + verge(t) + (d.behind ? '' : dog) };
      return X.compose(layers, c) + C.vignette(0.5);
    };
    // the grass verge in front of the wall, the dog's track
    const verge = t => { let g = `<rect x="-3000" y="${VERGE}" width="8000" height="1200" fill="#5a7a3a" filter="url(#ground)"/><rect x="-3000" y="${VERGE - 6}" width="8000" height="14" fill="#3a2a1a" opacity="0.5" filter="url(#b4)"/>`;
      const rg = rng(57); for (let i = 0; i < 120; i++) { const x = -1600 + rg() * 4800, h = 26 + rg() * 50, a = (rg() - 0.5) * 0.6 + Math.sin(t * 1.6 + x * 0.01) * 0.08; g += `<path d="M${f(x)},${f(VERGE + 30 + rg() * 200)} q${f(Math.sin(a) * h * 0.5)},${f(-h * 0.6)} ${f(Math.sin(a) * h)},${f(-h)}" stroke="${['#4a6a2a', '#3a5a22', '#6a8a3a'][i % 3]}" stroke-width="${f(3 + rg() * 3)}" fill="none" stroke-linecap="round"/>`; }
      return g; };
    X.shot('ROAD', 12.25, 17.2, fn, { grade: 'gDay' });
  }

  // ======================================================= WARD: everyone bitten dies the same way (16.35 - 24.9)
  // "and in your world every person bitten by a rabid dog dies the same way, burning with fever, foaming at the mouth,
  //  screaming at the sight of water."
  {
    const W = S.WARD, PM0 = [560, 1060 + 1308 * 0.82], PMS = 0.82, SIS0 = [930, W.FY], SIS_S = 0.82;
    const sickHead = t => R.toWorld({ x: PM0[0], y: PM0[1], s: PMS }, [0, -1300]);
    // glide along the rows of beds to the dying man; close on the fever and the foam; at the scream hold his face and
    // the glass together; drift right after the spilt water into the curtain wipe
    const cam = CAM(
      [[16.35, [1150, 900, 0]], [18.2, [950, 960, 0], 'sine'], [20.4, [640, 1100, 0], 'io'], [21.4, [565, 1090, 0], 'sine'], [22.6, [585, 1075, -1], 'sine'], [23.3, [628, 1085, 0.5], 'io'], [24.85, [690, 1150, 0], 'sine']],
      [[16.35, 1.05], [18.2, 1.15, 'sine'], [20.4, 1.75, 'io'], [21.4, 2.6, 'sine'], [22.6, 2.9, 'sine'], [23.3, 2.45, 'io'], [24.85, 2.3, 'sine']]);
    ST.wardCam = cam;
    // the nursing sister comes along the ward with the glass while he burns with fever
    const sisX = t => lerp(1330, 930, EZ.io(ss(20.4, 21.9, t))), sisWalk = t => env(t, 20.4, 20.6, 21.7, 21.9);
    // the glass: offered at 22.5, he recoils screaming at 22.85, the glass tips and spills at 23.7
    // (all within the sister's reach: her right shoulder is at about (818, 863))
    const glassAt = t => { const off = EZ.io(ss(22.1, 22.75, t)), flinch = EZ.io(ss(23.45, 23.85, t)); return { p: L2(L2([sisX(t) - 50, 1120 - 3 * (1 - Math.cos(t * 13)) * sisWalk(t)], [726, 1066], off), [804, 1010], flinch), tilt: lerp(0, -62, flinch) }; };
    ST.wardSpill = tt => { const g = glassAt(tt); return scr([g.p[0] - 30, g.p[1] - 40], cam(tt)); };
    const fn = t => {
      const c = hh(cam(t), t, 0.3, 13), L = LT.ward;
      const set = S.ward(t);
      // the dying man, strapped down: fever (flushed, sweating, shaking), foam, then the scream and thrash at the water
      const fever = ss(20.6, 21.0, t), foam = ss(21.4, 22.0, t), scream = ss(22.8, 23.0, t), thrash = env(t, 22.85, 23.0, 24.6, 25.0);
      const po = Object.assign(idle(t, 21, 0.3), { x: PM0[0], y: PM0[1], s: PMS });
      po.x += (fever * 1.4 + thrash * 5) * (Math.sin(t * 31) + 0.6 * Math.sin(t * 47 + 1)); po.sway += thrash * 1.6 * Math.sin(t * 13) - 1.5 * scream;
      const Pp = Q.patient(Object.assign(po, { tilt: -6 - 10 * scream + 6 * thrash * Math.sin(t * 9) + 7 * Math.sin(t * 4.2) * fever * (1 - scream), face: { expr: scream > 0.5 ? 'fear' : fever > 0.5 ? 'grief' : 'tired', mouth: scream > 0.5 ? 'shout' : foam > 0.3 ? 'parted' : 'tight', open: scream > 0.5 ? 0.9 : 0.2, look: scream > 0.5 ? [0.85, 0.2] : [0.1, 0.4], lid: scream > 0.5 ? 0.04 : lerp(0.5, 0.65, fever), brows: [-12, 3], sweat: 0.3 + 0.7 * fever, blush: 0.2 + 0.6 * fever, wide: scream > 0.5 },
        armR: { hand: [-150, -800], dir: [0.1, 1], pose: 'fist', facing: 'back' }, armL: { hand: [150, -800], dir: [-0.1, 1], pose: 'fist', facing: 'back' } }));
      // foam at his mouth (head-local mouth point carried with the head's tilt)
      const mw = headW(po, 'man', [0, 92]);
      // the froth gathers on the lips; when he screams it clings to the corners of the open mouth and runs down the chin
      let froth = '';
      if (foam > 0) { const rf = rng(7), open = scream, mwid = lerp(14, 22, open) * PMS;
        for (let i = 0; i < 18; i++) { const side = i % 2 ? 1 : -1, r0 = (1.6 + rf() * 4) * foam * PMS * 1.3, cx = lerp(mw[0] - 18 + rf() * 36, mw[0] + side * (mwid + rf() * 6), open), cy = lerp(mw[1] - 2 + rf() * 12, mw[1] - 6 + rf() * 22, open);
          froth += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r0)}" fill="#fbfbf6" stroke="#c8c8c0" stroke-width="0.6" opacity="0.92"/>`; }
        froth += `<path d="M${f(mw[0] - mwid * lerp(0.5, 1, open))},${f(mw[1] + 8)} q-4,${f(30 * foam)} 2,${f(54 * foam)}" stroke="#f4f4ee" stroke-width="4" fill="none" opacity="0.8"/>`; }
      // the nursing sister offers the glass, then flinches back
      const so = Object.assign(idle(t, 23, 0.4), { x: sisX(t), y: SIS0[1] - 3 * (1 - Math.cos(t * 13)) * sisWalk(t), s: SIS_S });
      so.sway += -3 * ss(23.4, 23.8, t) + 1.2 * Math.sin(t * 6.5) * sisWalk(t);
      const gl = glassAt(t);
      const Sp = Q.sister(Object.assign(so, { tilt: -4, face: { expr: 'anxious', look: [-0.8, 0.2], lid: 0.2, mouth: scream > 0.5 ? 'parted' : 'closed', brows: [-8, 2] },
        armR: gripAt(so, 'sister', gl.p, nrm([-1, 0.15]), { detachHand: true }), armL: { hand: [90, -820], dir: [-0.3, 1], pose: 'relaxed', facing: 'back' } }));
      // the glass sits in her fist (its middle at the grip), so it moves rigidly with her hand; tipped, it pours out
      const GS = 0.8, base = R.toWorld({ x: gl.p[0], y: gl.p[1], sway: gl.tilt, s: 1 }, [0, 60 * GS]);
      const glass = PR.waterGlass(base[0], base[1], GS, { level: 0.75 - 0.45 * ss(23.6, 24.1, t), tilt: gl.tilt, slosh: Math.sin(t * 12) * env(t, 22.2, 22.5, 24.4, 24.8) });
      let spill = ''; const sp = ss(23.6, 24.6, t);
      if (sp > 0) {
        const lip = R.toWorld({ x: base[0], y: base[1], sway: gl.tilt, s: 1 }, [-34 * GS, -118 * GS]), pour = env(t, 23.6, 23.75, 24.1, 24.4);
        if (pour > 0) spill += `<path d="M${f(lip[0])},${f(lip[1])} C${f(lip[0] - 50)},${f(lip[1] + 10)} ${f(lip[0] - 80)},${f(lip[1] + 90)} ${f(lip[0] - 96)},${f(lip[1] + 260)}" stroke="#d8eef6" stroke-width="${f(12 * pour)}" fill="none" opacity="0.75" stroke-linecap="round"/><path d="M${f(lip[0])},${f(lip[1])} C${f(lip[0] - 50)},${f(lip[1] + 10)} ${f(lip[0] - 80)},${f(lip[1] + 90)} ${f(lip[0] - 96)},${f(lip[1] + 260)}" stroke="#ffffff" stroke-width="${f(3 * pour)}" fill="none" opacity="0.8"/>`;
        const rs = rng(19); for (let i = 0; i < 22; i++) { const t0 = rs() * 0.5, q = clamp((sp - t0) / (1 - t0)); if (q <= 0) continue; const vx = -40 - rs() * 200, vy = -60 - rs() * 140, x = lip[0] + vx * q, y = lip[1] + vy * q + 700 * q * q; spill += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(4 + rs() * 7)}" ry="${f(4 + rs() * 6)}" fill="#cfe8f2" opacity="${f(0.85 * (1 - q * 0.6))}" stroke="#ffffff" stroke-width="1.2"/>`; }
      }
      const clip = `<defs><clipPath id="wdP"><rect x="-2000" y="-2000" width="6000" height="${W.QUILT + 50 + 2000}"/></clipPath></defs>`;
      const chars = clip + S.wardBedBack() + `<g clip-path="url(#wdP)">${lit(Pp, L)}</g>` + froth + S.wardSheet(t, { thrash }) + S.wardBedFront() + lit(Sp, L) + glass + handsLit(Sp, L, 'R') + spill;
      let out = X.compose(X.stage(set, chars), c);
      out += `<rect width="1080" height="1920" fill="#5a6a7a" opacity="0.12" style="mix-blend-mode:multiply"/>`;
      const fp = scr(sickHead(t), c); out += C.radial(fp[0], fp[1], 240 * c[2], '#ff6a3a', 0.16 * fever, 'screen');
      return out + C.vignette(0.6);
    };
    X.shot('WARD', 16.4, 24.85, fn, { grade: 'gDusk' });
  }
})(window);
