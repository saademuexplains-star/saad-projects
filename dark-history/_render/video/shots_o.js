// "The Royal Astrologer" part 1: the king hands you his purse in your tower, points you to his future in the stars
// (a crown of stars in the oculus), shows you the golden instruments, and warns you: one wrong prediction and your head
// goes the way of the last astrologer's (on the pike over the gate) -> night after night of charts under wheeling stars,
// until the doom planet falls into the house of death -> the feast: his favourite will die within eight days -> trapped
// -> the shadow play on your wall: if she lives you're a fraud, if she dies you're a murderer.
// Rules kept: the camera moves on every line, hands are rigid on what they hold, hand paths stay off faces, no cut is
// felt (every change hides in a matched move).
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
  const fingersFor = (side, facing, thumb) => { const t = (side === 'R' ? -1 : 1) * (facing === 'palm' ? 1 : -1); return [-thumb[1] * t, thumb[0] * t]; };
  const handAt = (o, Ww, dW, extra = {}) => Object.assign({ hand: R.toLocal(o, Ww), dir: nrm(R.dirLocal(o, dW)), pose: 'relaxed', facing: 'back' }, extra);
  const handsLit = (p, L, which = 'RL', view = true) => C.lit({ svg: (which.includes('R') ? p.handR || '' : '') + (which.includes('L') ? p.handL || '' : ''), info: p.info }, Object.assign(view ? { view: X.viewRect(1) } : {}, L)).body;
  const CAM = (pk, zk) => { const P = TK(pk), Z = TK(zk); return t => { const p = P(t); return [p[0], p[1], Z(t), p[2]]; }; };
  const lit = X.lit;
  const mixArm = (a, b, k) => Object.assign({}, k < 0.5 ? a : b, { hand: L2(a.hand, b.hand, k), dir: nrm(L2(a.dir || [0, 1], b.dir || [0, 1], k)) });
  // fine moving noise under the grade so big dark gradients dither instead of banding
  const dith = t => { const r = rng(Math.round(t * 60) * 7 + 5); return `<rect x="${-Math.floor(r() * 300)}" y="${-Math.floor(r() * 300)}" width="1380" height="2220" filter="url(#grain)" opacity="0.045"/>`; };
  const LT = {
    tower: { from: [-0.8, -0.3], shadow: '#120a06', shadowOp: 0.45, floor: '#1a0e08', floorOp: 0.3, contactOp: 0.4, key: '#ffd8a8', keyAdd: 0.05, rims: [{ from: [1, -0.4], col: '#9ab0e0', w: 6, op: 0.5 }, { from: [-1, -0.2], col: '#ffb870', w: 5, op: 0.35 }], face: { col: '#ffd8b0', op: 0.12 } },
    hall: { from: [-0.4, -0.7], shadow: '#140a06', shadowOp: 0.42, floor: '#1a0e08', floorOp: 0.3, contactOp: 0.4, key: '#ffdcae', keyAdd: 0.05, rims: [{ from: [1, -0.3], col: '#ffb870', w: 6, op: 0.5 }, { from: [-1, -0.2], col: '#9ab0e0', w: 4, op: 0.3 }], face: { col: '#ffd8b0', op: 0.12 } },
    candle: { from: [-0.7, 0.45], shadow: '#100804', shadowOp: 0.5, floor: '#140a04', floorOp: 0.3, contactOp: 0.4, key: '#ffb870', keyAdd: 0.08, rims: [{ from: [-1, 0.4], col: '#ffa050', w: 8, op: 0.6 }, { from: [1, -0.3], col: '#6a7aa8', w: 3, op: 0.2 }], face: { col: '#ffc890', op: 0.18 } },
  };
  // the lady and the lady-in-waiting draw their hennins outside the light box (veil behind, cone in front)
  const withHennin = (P, o, H, body) => Q.headArt(P, o, H.back) + body + Q.headArt(P, o, H.front);
  G.SHOTS_O = { wave, env, bump, idle, hh, scr, nrm, L2, add, gripAt, fingersFor, handAt, handsLit, CAM, mixArm, dith, LT, withHennin };
  const ST = {};
  G.ASTRO = ST;

  // ======================================================= OBS: the tower (-0.7 - 8.35)
  // "Your king pays you a fortune to read his future in the stars, gives you a tower full of golden instruments,
  //  and warns you that one wrong prediction costs your head."
  {
    const KO = { x: 330, y: 1860, s: 0.82 }, YO = { x: 690, y: 1880, s: 0.84 };
    // the purse knot: in the king's left fist; your right fist takes it (TAKE), he lets go (LET); you lift it to your chest
    const pursePt = TK([[-0.7, [452, 1214]], [0.42, [508, 1176], 'sine'], [1.25, [585, 1240], 'io'], [2.7, [596, 1296], 'sine'], [8.5, [592, 1304], 'sine']]);
    const TAKE = 0.34, LET = 0.52;
    const pSwing = t => 5 * Math.sin(t * 3.2) * Math.exp(-Math.max(0, t - 0.5) * 0.9) + 1.5 * Math.sin(t * 1.4);
    // the armillary turns slowly, and spins on when your hand pushes its ring (3.5 - 5.1)
    const armRot = t => 0.35 * t + 2.6 * EZ.io(clamp((t - 3.5) / 1.6));
    const ringPt = t => L2([872, 1172], [818, 1196], EZ.io(clamp((t - 3.45) / 0.55)));
    const cam = CAM(
      [[-0.7, [520, 1170, 0]], [0.9, [520, 1150, 0], 'sine'], [1.7, [470, 520, 0], 'io'], [2.75, [540, -830, 0], 'io'], [3.95, [610, 950, 0], 'io'], [5.0, [770, 1190, 0], 'sine'],
        [6.05, [380, 860, 0], 'io'], [7.3, [345, 875, 1.5], 'sine'], [7.9, [688, 905, -1], 'io'], [8.4, [690, 908, 0], 'sine']],
      [[-0.7, 1.22], [0.9, 1.45, 'sine'], [1.7, 1.15, 'io'], [2.75, 1.05, 'io'], [3.95, 1.0, 'io'], [5.0, 1.32, 'sine'], [6.05, 2.0, 'io'], [7.3, 2.45, 'sine'], [7.9, 2.55, 'io'], [8.4, 2.7, 'sine']]);
    ST.obsCam = cam;
    const fn = t => {
      const c = hh(cam(t), t, 0.3, 3), L = LT.tower;
      const set = S.tower(t, { crown: EZ.io(ss(1.85, 2.75, t)), armRot: armRot(t) });
      const kO = Object.assign(idle(t, 7, 0.35), KO), yO = Object.assign(idle(t, 3, 0.35), YO);
      const pp = pursePt(t), up = [0, -1];
      // ---- the king
      const kRest = { hand: [140, -720], dir: [-0.1, 1], pose: 'relaxed', facing: 'back' };
      const kRestR = { hand: [-150, -720], dir: [0.1, 1], pose: 'relaxed', facing: 'back' };
      let kL;
      if (t < LET) kL = gripAt(kO, 'king', pp, fingersFor('L', 'back', up), { detachHand: true });
      else {
        // presenting the room (2.9 - 5.0): the left arm sweeps out, open palm up
        const present = { hand: [330, -860], dir: [0.8, -0.3], pose: 'open', facing: 'palm' };
        const back = { hand: [150, -800], dir: [0.1, 1], pose: 'relaxed', facing: 'back' };
        kL = mixArm(mixArm(back, kRest, EZ.io(clamp((t - LET) / 0.5))), present, EZ.io(ss(2.9, 3.5, t)) * (1 - EZ.io(ss(4.9, 5.5, t))));
      }
      // right arm: points up and out at the stars (clear of his head), then the warning: one finger up, the slash at the throat
      const sh = R.toWorld(kO, [-112, -1110]), pd = nrm([-0.45, -0.89]), pw = add(sh, pd, 275 * KO.s);
      const kPoint = Object.assign(handAt(kO, pw, pd), { pose: 'point' });
      const kOne = { hand: [-150, -1060], dir: [0.05, -1], pose: 'point', facing: 'back' };
      const slashK = EZ.io(ss(7.0, 7.55, t));
      const kSlash = { hand: [lerp(-170, 70, slashK), -1102], dir: [1, 0.02], pose: 'point', facing: 'back' };
      const pointK = EZ.io(ss(0.8, 1.25, t)) * (1 - EZ.io(ss(2.25, 2.85, t)));
      const oneK = EZ.io(ss(5.55, 5.95, t)), toSlash = EZ.io(ss(6.65, 7.0, t)), slashOut = EZ.io(ss(7.75, 8.2, t));
      let kR = mixArm(kRestR, kPoint, pointK);
      if (t > 5.4) kR = mixArm(mixArm(mixArm(kRestR, kOne, oneK), kSlash, toSlash), kRestR, slashOut);
      const kLook = t < 0.9 ? [0.55, 0.25] : t < 2.6 ? [-0.3, -0.85] : t < 5.1 ? [0.6, 0.05] : [0.75, 0.05];
      const kFace = t < 5.1 ? { expr: 'neutral', look: kLook, lid: 0.28, mouth: t < 1 ? 'smile' : 'tight', brows: [1, 1] }
        : { expr: 'stern', look: kLook, lid: lerp(0.3, 0.42, ss(6.9, 7.5, t)), mouth: t < 6.9 ? 'talk' : t < 7.9 ? 'tight' : 'smile', open: Q.talk(t, 0.22, 6), brows: [6, -3] };
      const K = Q.king(Object.assign({}, kO, { tilt: bump(t, 6.9, 4, 0.7) - 3 * ss(5.3, 5.9, t), face: kFace, armL: kL, armR: kR }));
      // ---- you
      let yR;
      if (t < TAKE) { const reach = EZ.io(clamp((t + 0.7) / (TAKE + 0.7))); yR = mixArm({ hand: [-170, -740], dir: [0.1, 1], pose: 'relaxed', facing: 'back' }, handAt(yO, add(pp, [8, 34]), [-0.35, -1], { pose: 'open', facing: 'palm' }), reach); }
      else yR = gripAt(yO, 'you', pp, fingersFor('R', 'back', up), { detachHand: true });
      const yRestL = { hand: [160, -760], dir: [-0.1, 1], pose: 'relaxed', facing: 'back' };
      const onRing = EZ.io(ss(3.05, 3.45, t)) * (1 - EZ.io(ss(5.0, 5.5, t)));
      const yL = mixArm(yRestL, handAt(yO, ringPt(t), [0.45, 0.85], { pose: 'open', facing: 'back' }), onRing);
      const awe = ss(1.0, 1.5, t) * (1 - ss(2.7, 3.2, t)), dread = ss(6.6, 7.4, t);
      const yLook = t < 1.0 ? [-0.2, 0.45] : t < 3.0 ? [-0.25, -0.95] : t < 5.1 ? [0.55, 0.3] : [-0.8, -0.05];
      const yFace = dread > 0.01 ? { expr: 'fear', wide: dread > 0.5, look: yLook, lid: 0.06, mouth: 'tight', brows: [8 * dread, -3 * dread], sweat: 0.6 * dread }
        : { expr: 'neutral', look: yLook, lid: lerp(0.2, 0.08, awe), mouth: t < 1.0 ? 'smile' : awe > 0.5 ? 'parted' : 'closed', open: 0.08 * awe, brows: [4 * awe, 3 * awe] };
      const Y = Q.you(Object.assign({}, yO, { tilt: -6 * awe + bump(t, 7.65, -5, 0.4), face: yFace, armR: yR, armL: yL }));
      ST.obs = { K, kO, Y, yO };
      // order: the people, the purse, then the fists that hold it
      const purse = PR.purse(pp[0], pp[1], 0.62, t, { swing: pSwing(t) });
      const chars = lit(K, L) + lit(Y, L) + purse + handsLit(K, L, 'L') + handsLit(Y, L, 'R');
      return X.compose(X.stage(set, chars), c) + C.vignette(0.5) + dith(t);
    };
    X.shot('OBS', -0.7, 8.346, fn, { grade: 'gNight' });
    G.OBS_PURSE = tt => scr(pursePt(tt), cam(tt));
    G.OBS_YOUFACE = tt => scr([YO.x, YO.y - 1250 * YO.s], cam(tt));
  }

  // ======================================================= GATE: the last astrologer's head, the gate, up to your window (7.75 - 12.25)
  // "The last astrologer's head still hangs above the castle gate. Every night is a gamble,"
  {
    const B = S.GT;
    const cam = CAM(
      [[7.6, [574, -82, 0]], [9.25, [568, -92, -1], 'sine'], [10.55, [540, 640, 0], 'io'], [11.75, [976, -1284, 0], 'io'], [12.3, [978, -1300, 0], 'in2']],
      [[7.6, 2.55], [9.25, 2.85, 'sine'], [10.55, 0.92, 'io'], [11.75, 1.45, 'io'], [12.3, 1.7, 'in2']]);
    // the moon placed exactly behind the head at the close-up (sky layer p 0.18)
    const fn = t => {
      const c = hh(cam(t), t, 0.28, 5);
      const set = S.gateNight(t, { moon: [487, 638, 126] });
      return X.compose(set, c) + C.vignette(0.55) + dith(t);
    };
    X.shot('GATE', 7.75, 12.246, fn, { grade: 'gNight' });
    G.GATE_HEAD = tt => scr([532, -120], cam(tt));
    G.GATE_WIN = tt => scr([B.WIN[0], B.WIN[1] + B.WIN[3] / 2], cam(tt), 0.78);
  }
  X.tr('morph', 8.05, 0.6, 'OBS', 'GATE', { fa: G.OBS_YOUFACE(8.05), fb: G.GATE_HEAD(8.05), za: 1.35, zb: 1.35, col: '#000000' });

  // ======================================================= DESK: night after night of charts, the doom planet (11.55 - 13.75)
  // "Every night is a gamble, until you foretell"
  {
    // you write standing at a tall desk: its top at your hands (DY), its legs running out of frame (nothing floats), a
    // smaller candelabrum kept clear of your face; both hands drawn over the desk
    const YO = { x: 250, y: 1700, s: 0.86 }, DY = 1080, SH = DY - S.OB.DESK[2], CAND = [40, 0.6];
    const cam = CAM([[11.55, [300, 1000, 0]], [12.6, [262, 1060, 0], 'sine'], [13.75, [205, 1060, 0], 'io']], [[11.55, 1.45], [12.6, 1.65, 'sine'], [13.75, 2.45, 'io']]);
    // the quill nib writes small loops across the chart, then stops dead when the black planet appears
    const nib = t => { const w = 1 - ss(12.75, 12.95, t), k = t * 7; return [190 + 34 * Math.sin(k * 0.9) * w + 20 * ss(12.95, 13.45, t), 1436 + SH + 9 * Math.sin(k * 1.7) * w]; };
    const fn = t => {
      const c = hh(cam(t), t, 0.25, 9), L = LT.tower;
      const doom = EZ.io(ss(12.7, 13.2, t)), cross = EZ.io(ss(13.0, 13.45, t));
      const set = S.tower(t, { spin: 70 * (t - 11.2), trail: 26, desk: 'front', armRot: 0.35 * t });
      const yO = Object.assign(idle(t, 11, 0.25), YO);
      const thumb = nrm([0.55, -0.84]), np = nib(t), gp = add(np, thumb, 40 * YO.s);
      const yR = gripAt(yO, 'you', gp, fingersFor('R', 'back', thumb), { hold: PR.quillG(), detachHand: true });
      // the other hand rests on the hourglass's top (it stands 112 tall)
      const yL = handAt(yO, [404, DY - 140], [0.15, 1], { pose: 'relaxed', facing: 'back', detachHand: true });
      const shock = ss(12.7, 13.0, t);
      const face = shock > 0.01 ? { expr: 'fear', wide: shock > 0.5, look: [-0.35, 0.7], lid: 0.05, mouth: 'parted', open: 0.06, brows: [8 * shock, -2], sweat: 0.4 * shock }
        : { expr: 'neutral', look: [-0.35, 0.75], lid: 0.32, mouth: 'tight', brows: [2, 0] };
      const Y = Q.you(Object.assign({}, yO, { tilt: 6 - 4 * shock, face, armR: yR, armL: yL }));
      const desk = S.towerDesk(t, { doom, cross, quill: false, chartK: lerp(0.35, 0.62, ss(12.4, 13.4, t)), sand: 0.25 + 0.6 * ss(11.6, 13.6, t), dy: DY, legY: 2400, cand: CAND });
      return X.compose(X.stage(set, lit(Y, L) + desk + handsLit(Y, L)), c) + C.vignette(0.55) + dith(t);
    };
    X.shot('DESK', 11.55, 13.746, fn, { grade: 'gNight' });
    // the radial opens from the candelabrum's middle flame
    G.DESK_CANDLE = tt => scr([CAND[0] + 1, DY - 512 * CAND[1] + 20], cam(tt));
  }
  X.tr('carry', 11.9, 0.7, 'GATE', 'DESK', { mode: 'zoom', k: 1.7, fa: G.GATE_WIN(11.9), fb: [560, 980], blur: 4 });

  // ======================================================= HALL: the prediction at the feast; trapped (13.05 - 17.65)
  // "that his favorite lady will die within eight days, and suddenly you're trapped:"
  {
    const B = S.HL, FY = 1640;
    const KO = { x: 540, y: FY, s: 0.66 }, LO = { x: 770, y: FY, s: 0.64 }, DO = { x: 140, y: FY, s: 0.66 }, WO = { x: 990, y: FY, s: 0.62 }, YO = { x: 300, y: 2080, s: 0.86 };
    const YF = [300, 2080 - 1250 * 0.86];
    const cam = CAM(
      [[13.05, [560, 1060, 0]], [14.4, [705, 960, 0], 'io'], [15.05, [730, 950, 0], 'sine'], [15.95, [545, 930, 0], 'io'], [16.35, [YF[0], YF[1], 0], 'io'], [17.7, [YF[0], YF[1], 0], 'sine']],
      [[13.05, 0.98], [14.4, 1.55, 'io'], [15.05, 1.75, 'sine'], [15.95, 1.75, 'io'], [16.35, 2.15, 'io'], [17.7, 2.25, 'sine']]);
    const fn = t => {
      const c = hh(cam(t), t, 0.25, 13), L = LT.hall;
      const shock = EZ.io(ss(14.5, 14.85, t)), glare = EZ.io(ss(15.0, 15.5, t));
      // the lady: laughing, her goblet raised; at "will die" the laugh dies and the wine slops over
      const lO = Object.assign(idle(t, 17, 0.3), LO, { tilt: (1 - shock) * (3 * Math.sin(t * 5)) - 4 * shock });
      const gob = add(R.toWorld(lO, [-150, -980]), [0, 30 * shock]), gT = nrm([Math.sin(-0.35 * shock), -Math.cos(0.35 * shock)]);
      const lR = gripAt(lO, 'lady', gob, fingersFor('R', 'back', gT), { hold: `<g transform="rotate(90) translate(0,45)">${PR.goblet(0, 0, 0.6, { wine: 0.8, spill: shock * 0.6, tip: shock * 18 })}</g>` });
      const lFace = shock < 0.5 ? { expr: 'neutral', look: [-0.6, -0.1], lid: 0.18, mouth: 'smile', open: 0.05 + 0.06 * Math.max(0, Math.sin(t * 9)) }
        : { expr: 'fear', wide: true, look: [-0.75, 0.3], lid: 0.04, mouth: 'parted', open: 0.12, brows: [9, -2] };
      const LP = Q.lady(Object.assign({}, lO, { face: lFace, armR: lR, armL: { hand: [150, -760], dir: [-0.1, 1], pose: 'relaxed', facing: 'back' } }));
      const lady = withHennin(LP, lO, Q.LADY_HENNIN(Math.sin(t * 1.4) * 0.5), lit(LP, L));
      // the king: amused at her, then his eyes turn on you and stay there
      const kO = Object.assign(idle(t, 19, 0.3), KO);
      const kFace = glare < 0.01 ? { expr: 'neutral', look: [0.6, -0.05], lid: 0.3, mouth: shock > 0.5 ? 'tight' : 'smile' } : { expr: 'stern', look: L2([0.6, -0.05], [-0.55, 0.45], glare), lid: 0.38, mouth: 'tight', brows: [7, -3] };
      const K = Q.king(Object.assign({}, kO, { face: kFace, armL: { hand: [150, -800], dir: [-0.2, 1], pose: 'relaxed', facing: 'back' }, armR: { hand: [-150, -800], dir: [0.2, 1], pose: 'relaxed', facing: 'back' } }));
      // the court: the lord stops laughing; the lady-in-waiting draws back
      const dO = Object.assign(idle(t, 23, 0.3), DO), wO = Object.assign(idle(t, 29, 0.3), WO);
      const D = Q.lord(Object.assign({}, dO, { tilt: (1 - shock) * 2 * Math.sin(t * 4.3), face: shock < 0.5 ? { look: [0.7, 0], mouth: 'smile', lid: 0.3 } : { expr: 'fear', wide: true, look: [0.3, 0.45], lid: 0.06, mouth: 'parted', open: 0.1 } }));
      const WP = Q.waiting(Object.assign({}, wO, { face: shock < 0.5 ? { look: [-0.7, 0], mouth: 'smile', lid: 0.16 } : { expr: 'fear', wide: true, look: [-0.8, 0.35], lid: 0.04, mouth: 'tight', brows: [8, -1] }, armR: { hand: [-90, -980], dir: [0.3, -0.8], pose: 'open', facing: 'palm' } }));
      const waiting = withHennin(WP, wO, Q.WAIT_HENNIN(Math.sin(t * 1.2 + 1) * 0.5), lit(WP, L));
      // you: telling it, one open hand lifted, eyes on the king; then the fear
      const yO = Object.assign(idle(t, 31, 0.3), YO);
      const trap = ss(16.15, 16.6, t);
      const yR = mixArm({ hand: [-190, -760], dir: [0.1, 1], pose: 'relaxed', facing: 'back' }, { hand: [-260, -960], dir: [-0.3, -0.9], pose: 'open', facing: 'palm' }, EZ.io(ss(13.4, 13.9, t)) * (1 - EZ.io(ss(15.6, 16.2, t))));
      const yFace = trap > 0.01 ? { expr: 'fear', wide: trap > 0.5, look: [0.2 * Math.sin(t * 5), 0.1], lid: 0.04, mouth: 'tight', brows: [9 * trap, -3], sweat: 0.7 * trap }
        : { expr: 'neutral', look: [0.6, -0.4], lid: 0.2, mouth: t > 13.4 && t < 15.95 ? 'talk' : 'closed', open: Q.talk(t, 0.18, 7), brows: [3, 1] };
      const Y = Q.you(Object.assign({}, yO, { tilt: bump(t, 16.2, -4, 0.5), face: yFace, armR: yR, armL: { hand: [180, -760], dir: [-0.1, 1], pose: 'relaxed', facing: 'back' } }));
      const court = lit(D, L) + lit(K, L) + lady + waiting + S.hallTable(t);
      // "trapped": a vertigo zoom - the room falls away behind you while your face holds its size
      const dz = EZ.io(ss(16.3, 17.4, t));
      if (dz < 0.001) return X.compose(X.stage(S.hall(t), court + lit(Y, L)), c) + C.vignette(0.5) + dith(t);
      const cBg = [c[0], c[1], c[2] * lerp(1, 0.62, dz), c[3]];
      return X.compose(X.stage(S.hall(t), court), cBg) + X.compose([{ p: 1, svg: lit(Y, L), chars: true }], c) + C.vignette(0.5 + 0.2 * dz) + dith(t);
    };
    X.shot('HALL', 13.05, 17.646, fn, { grade: 'gHall' });
    G.HALL_YOUFACE = tt => scr(YF, cam(tt));
  }
  X.tr('radial', 13.4, 0.7, 'DESK', 'HALL', { fa: G.DESK_CANDLE(13.4), fb: G.DESK_CANDLE(13.4), za: 1.1, zb: 1.12 });

  // ======================================================= SHADOW: the visions on your wall (16.95 - 21.45)
  // "if she lives, you're a fraud, and if she dies, you're a murderer."
  {
    const YO = { x: 830, y: 2070, s: 1.0 }, CN = [170, 2010];
    const cam = CAM([[16.95, [520, 1180, 0]], [18.2, [430, 1240, 0], 'sine'], [19.6, [400, 1290, 0], 'sine'], [20.6, [560, 1260, 0], 'io'], [21.45, [800, 920, 0], 'io']],
      [[16.95, 1.0], [18.2, 1.18, 'sine'], [19.6, 1.24, 'sine'], [20.6, 1.18, 'io'], [21.45, 2.2, 'io']]);
    const shadow = svg => `<g filter="url(#silhS)">${svg}</g>`;
    const fn = t => {
      const c = hh(cam(t), t, 0.3, 17);
      const wall = S.towerWall(t, { lx: 240, ly: 1900 });
      // your own shadow, huge on the wall, flinching with you
      const yO = Object.assign(idle(t, 37, 0.4), YO);
      const flinch = bump(t, 18.35, 1, 0.5) + bump(t, 20.35, 1, 0.5);
      let sh = `<g opacity="0.7">${shadow(Q.you(Object.assign({}, yO, { x: 660, y: 2080, s: 1.02, tilt: -6 * flinch })).svg)}</g>`;
      // if she lives: the lady dances in shadow (her hennin unmistakable)
      const live = env(t, 17.05, 17.4, 19.35, 19.95), fall = EZ.in2(ss(19.45, 19.95, t));
      if (live > 0.01) {
        const lO = { x: 330, y: 1960 + fall * 120, s: 0.8, sway: Math.sin(t * 3.4) * 9 * (1 - fall) - 70 * fall, tilt: Math.sin(t * 3.4 + 1) * 6 };
        const a = Math.sin(t * 3.4);
        const LP = Q.lady(Object.assign({}, lO, { armR: { hand: [-250 + a * 40, -1250], dir: [-0.3, -1], pose: 'open', facing: 'palm' }, armL: { hand: [260 - a * 40, -1200], dir: [0.3, -1], pose: 'open', facing: 'palm' } }));
        sh += `<g opacity="${f(0.86 * live)}">${shadow(withHennin(LP, lO, Q.LADY_HENNIN(a), LP.svg))}</g>`;
      }
      // you're a fraud: the king's shadow tears your chart in two
      const fraud = env(t, 18.2, 18.5, 19.5, 19.9), tear = EZ.io(ss(18.55, 18.95, t));
      if (fraud > 0.01) {
        const kO = { x: 110, y: 1980, s: 0.86 };
        const kp = R.toWorld(kO, [0, -980]);
        const KP = Q.king(Object.assign({}, kO, { armR: gripAt(kO, 'king', add(kp, [-40 - tear * 120, -10 + tear * 30]), [0, 1]), armL: gripAt(kO, 'king', add(kp, [40 + tear * 120, -10 + tear * 30]), [0, 1]) }));
        const piece = (dx, rot) => `<g transform="translate(${f(kp[0] + dx)},${f(kp[1] + 20 + tear * 40)}) rotate(${f(rot)})"><rect x="-60" y="-40" width="120" height="100" fill="#000"/></g>`;
        sh += `<g opacity="${f(0.86 * fraud)}">${shadow(KP.svg + piece(-40 - tear * 90, -tear * 20) + piece(40 + tear * 90, tear * 20))}</g>`;
      }
      // you're a murderer: the mob rises with torches and forks, and flames climb around your shadow
      const mob = ss(20.1, 20.5, t);
      if (mob > 0.01) {
        let m = '';
        for (let i = 0; i < 7; i++) { const x = -80 + i * 150 + (i % 2) * 34, y = 2230 - 330 * EZ.out(mob) + (i % 3) * 30, s2 = 1.35; m += S.folk(x, y, s2, 400 + i, t, { wave: 1 }); m += `<path d="M${x + 52},${y - 220} L${x + 78},${y - 480}" stroke="#000" stroke-width="14"/><path d="M${x + 65},${y - 480} l-24,-52 M${x + 78},${y - 480} l0,-58 M${x + 91},${y - 480} l24,-52" stroke="#000" stroke-width="9"/>`; }
        m += S.flames(700, 2060, 760, 560 * mob, t, 501, 1);
        sh += `<g opacity="${f(0.86 * mob)}">${shadow(m)}</g>`;
      }
      // you, in front, lit from below by the candle
      const look = t < 19.3 ? [-0.75, -0.3] : [-0.6, -0.15];
      const Y = Q.you(Object.assign({}, yO, { tilt: -4 * flinch + 2 * Math.sin(t * 1.3), face: { expr: 'fear', wide: true, look, lid: 0.04, mouth: 'tight', brows: [9, -3], sweat: 0.8 }, armR: { hand: [-150, -860], dir: [0.2, 1], pose: 'fist', facing: 'back' }, armL: { hand: [170, -820], dir: [-0.2, 1], pose: 'relaxed', facing: 'back' } }));
      const candle = `<rect x="${CN[0] - 22}" y="${CN[1] - 40}" width="44" height="200" fill="#efe6cc" stroke="#3a2a1a" stroke-width="2"/>` + PR.flame(CN[0], CN[1] - 40, 1.6, t) + C.radial(CN[0], CN[1] - 80, 700, '#ffb060', 0.45, 'screen');
      const layers = [...wall, { p: 0.92, svg: sh }, { p: 1, svg: lit(Y, LT.candle), chars: true }, { p: 1.15, svg: `<g filter="url(#dof1)">${candle}</g>` }];
      return X.compose(layers, c) + C.vignette(0.65, '#000', 0.4) + dith(t);
    };
    X.shot('SHADOW', 16.95, 21.446, fn, { grade: 'gNight' });
    G.SHADOW_EYES = tt => scr([YO.x, YO.y - 1270 * YO.s], cam(tt));
  }
  X.tr('organic', 17.3, 0.7, 'HALL', 'SHADOW', { fa: G.HALL_YOUFACE(17.3), fb: [540, 960], za: 1.1, zb: 0.94, seed: 9 });
})(window);
