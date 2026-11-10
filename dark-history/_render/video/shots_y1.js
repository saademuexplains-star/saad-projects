// "The Radium Girls" (Orange, New Jersey, 1917-1927), part 1: shared helpers and the shots up to "safe enough to eat".
// Times are those of the trimmed voice _vo19/vo_trim.wav (_vo19/words.txt); no time warp.
// HOOK   (0 .. 2.8)     "Your boss hands you a paintbrush dipped in glowing paint"  frame 0 already moving: the
//                       glowing tip in close-up, pulling back to the boss holding it out to you across the worktable
// MOUTH  (2.44 .. 4.5)  "and tells you to put it in your mouth"  your face; the brush comes in toward your lips
// STUDIO (4.3 .. 6.78)  "It's 1917. You're 19,"  from the calendar down the rows of girls at the dials to you
// DIALS  (6.6 .. 9.12)  "painting numbers on soldiers' watches in New Jersey."  the brush painting the 12; a trench
//                       watch, a soldier's helmet, the crate stamped ORANGE, N.J.
// LIP / DIP / PAINT (9.05 .. 10.72)  the three words, one insert each; RHYTHM (10.66 .. 12.1) "hundreds of times a day"
//                       the day racing by on the clock, the tray filling with painted dials
// BOSS   (12.0 .. 14.75) "because the company swears it's safe enough to eat."  the jar, the card, his smile
// Hands (the user: "PLEASE NO HANDS AND ARMS MISTAKES IN THIS ONE"): the boss's left forearm level across his body into
// the fist on the brush; every other arm hangs with its hand behind a table or the desk; the brush in the inserts comes
// from out of frame with no hand.
(function (G) {
  const X = G.ENG, Q = G.QCAST, S = G.SETS, C = G.CINE, R = G.RIG, ST = G.STAGE;
  const { ss, lerp } = X, { f, mix } = R;
  const { up, gripAt, fingersFor, still, nrm } = ST;
  const V = G.RGV = {};
  const GL = S.GLOW;
  const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const env = (t, a, b, c, d) => ss(a, b, t) * (1 - ss(c, d, t));
  const bump = (t, t0, a = 1, len = 0.35) => (t < t0 || t > t0 + len) ? 0 : a * Math.pow(Math.sin(Math.PI * (t - t0) / len), 2);
  const idle = (t, seed, amp = 1) => ({ blink: Q.blink(t, seed), breath: Q.breath(t * 1.1 + seed) * 0.6, sway: X.noise(t * 0.45, seed) * 0.5 * amp });
  // hand-held drift, the same on screen at any zoom
  const hh = (c, t, amp = 1, seed = 0) => { const k = amp / Math.sqrt(Math.max(1, c[2])), h = X.hand(t, k, seed); return (X.CAM = [c[0] + h[0], c[1] + h[1], c[2], (c[3] || 0) + h[2]]); };
  // a world point on layer depth p -> the screen, under camera c
  const scr = (w, c, p = 1) => { const [cx, cy, z] = c, zp = Math.pow(z, p), px = 540 + (cx - 540) * p, py = 960 + (cy - 960) * p; return [540 + (w[0] - px) * zp, 960 + (w[1] - py) * zp]; };
  const camOn = (pt, p = 1) => [540 + (pt[0] - 540) / p, 960 + (pt[1] - 960) / p];
  const L2 = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
  const rest = (kind, side) => ({ hand: R.restHand(kind, side), dir: [side === 'R' ? 0.02 : -0.02, 1], pose: 'relaxed', facing: 'back' });
  // an arm with its hand clasped behind the back (drawn behind the body: no hand in frame)
  const behind = side => ({ hand: [side === 'R' ? -40 : 40, -780], dir: [side === 'R' ? 0.45 : -0.45, 1], pose: 'relaxed', facing: 'back', behind: true });
  Object.assign(V, { cl, env, bump, idle, hh, scr, camOn, L2, rest, behind });
  // a point of a figure's face (head-local, the face centre 0,0) in the world
  V.facePt = (o, kind, p) => R.toWorld(o, R.headPt(o, kind, p));

  // ---------------------------------------------------------------- the camera: a smooth path through keys (from the
  // Coca-Cola film): a monotone cubic through every key in x, y, log(zoom) and roll; 'stop' on a key rests there
  V.cam = keys => {
    const T = keys.map(k => k[0]), P = keys.map(k => [k[1][0], k[1][1], Math.log(k[1][2]), k[1][3] || 0]), n = keys.length, M = [];
    for (let c = 0; c < 4; c++) {
      const d = [], m = new Array(n).fill(0);
      for (let i = 0; i < n - 1; i++) d.push((P[i + 1][c] - P[i][c]) / (T[i + 1] - T[i]));
      m[0] = keys[0][2] === 'stop' ? 0 : d[0]; m[n - 1] = keys[n - 1][2] === 'stop' ? 0 : d[n - 2];
      for (let i = 1; i < n - 1; i++) m[i] = keys[i][2] === 'stop' || d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] * (T[i + 1] - T[i]) + d[i] * (T[i] - T[i - 1])) / (T[i + 1] - T[i - 1]);
      for (let i = 0; i < n - 1; i++) { if (Math.abs(d[i]) < 1e-9) { m[i] = 0; m[i + 1] = 0; continue; } const a = m[i] / d[i], b = m[i + 1] / d[i], h = a * a + b * b; if (h > 9) { const k = 3 / Math.sqrt(h); m[i] = k * a * d[i]; m[i + 1] = k * b * d[i]; } }
      M.push(m);
    }
    return t => {
      if (t <= T[0]) { const dt = t - T[0]; return [P[0][0] + M[0][0] * dt, P[0][1] + M[1][0] * dt, Math.exp(P[0][2] + M[2][0] * dt), P[0][3] + M[3][0] * dt]; }
      if (t >= T[n - 1]) { const dt = t - T[n - 1]; return [P[n - 1][0] + M[0][n - 1] * dt, P[n - 1][1] + M[1][n - 1] * dt, Math.exp(P[n - 1][2] + M[2][n - 1] * dt), P[n - 1][3] + M[3][n - 1] * dt]; }
      let i = 0; while (t > T[i + 1]) i++;
      const h = T[i + 1] - T[i], u = (t - T[i]) / h, u2 = u * u, u3 = u2 * u, h00 = 2 * u3 - 3 * u2 + 1, h10 = u3 - 2 * u2 + u, h01 = -2 * u3 + 3 * u2, h11 = u3 - u2;
      const o = [0, 1, 2, 3].map(c => h00 * P[i][c] + h10 * h * M[c][i] + h01 * P[i + 1][c] + h11 * h * M[c][i + 1]);
      o[2] = Math.exp(o[2]); return o;
    };
  };

  // ---------------------------------------------------------------- faces: one expression easing into the next
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
    const res = F => { const E2 = R.EXPR[F.expr || 'neutral'] || {}, Mo = R.MOUTH[F.mouth || E2.mouth] || R.MOUTH.closed, wv = F.wide ?? Mo.wide ?? 1; return { open: Math.max(0, F.open ?? Mo.open ?? 0), cd: F.cd ?? (Mo.cd !== undefined ? Mo.cd : E2.cd ?? 1), mw: typeof wv === 'number' ? wv : (wv ? 1 : 0), eyeW: (F.wide || E2.wide) ? 1 : 0 }; };
    const ra = res(a), rb = res(b);
    for (const key of ['open', 'cd', 'mw', 'eyeW']) o[key] = ra[key] + (rb[key] - ra[key]) * k;
    return o;
  };
  V.faceAt = (t, keys, w = 0.3) => { let F = keys[0][1]; for (let i = 1; i < keys.length; i++) { const k = ss(keys[i][0] - w / 2, keys[i][0] + w / 2, t); if (k > 0) F = V.faceMix(F, keys[i][1], k); } return F; };

  // ---------------------------------------------------------------- lights
  // the studio by day: the morning through the tall windows on the left and behind
  V.LS = { from: [-1, -0.35], shadow: '#3a2a1e', shadowOp: 0.46, floor: '#3a2a1a', floorOp: 0.28, contactOp: 0, key: '#fff4e0', keyAdd: 0.08,
    rims: [{ from: [-1, -0.3], col: '#fff2dc', w: 5, op: 0.4 }, { from: [0.4, -1], col: '#ffe8c8', w: 4, op: 0.25 }], face: { col: '#fff0e0', op: 0.12 } };
  // the lights off: the paint the only light, green, from below
  V.LG = fx => ({ from: [fx, 1], shadow: '#000000', shadowOp: 0.78, ambient: '#587a50', ambientOp: 1, floor: '#000000', floorOp: 0, contactOp: 0, key: GL, keyAdd: 0.34,
    rims: [{ from: [fx, 1], col: GL, w: 6, op: 0.8 }], face: { col: '#d8ffb0', op: 0.42, r: 1.8 } });
  // a darkness over the top of the frame (screen space): op at the top, gone by y1
  V.dark = (y0, y1, op, id = 'dkTop') => `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1920" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#000" stop-opacity="${op}"/><stop offset="${f(y0 / 1920)}" stop-color="#000" stop-opacity="${f(op * 0.45)}"/><stop offset="${f(y1 / 1920)}" stop-color="#000" stop-opacity="0"/></linearGradient></defs><rect x="0" y="0" width="1080" height="1920" fill="url(#${id})"/>`;

  // ======================================================= the studio world of the look test: you at the worktable, the
  // boss behind it, two girls at the next table out of focus at the edges
  const YOU = { X: 300, Y: 2300, S: 1.0 }, BOSS = { X: 820, Y: 2350, S: 1.15 }, AX = nrm([-0.36, -0.93]);
  V.YOU = YOU; V.BOSS = BOSS;
  V.youAt = (t, extra = {}) => { const id = idle(t, 3, 0.6); return Object.assign({ x: YOU.X, y: YOU.Y, s: YOU.S, tilt: 4, sway: id.sway * 0.5, breath: id.breath, blink: id.blink }, extra); };
  V.youMouth = t => V.facePt(V.youAt(t), 'woman', [0, 80]);
  const farPair = t => {
    let far = '';
    for (const [who, art, x, look, seed] of [['friendA', 'friendAArt', 30, [0.3, 0.6], 11], ['friendB', 'friendBArt', 1060, [-0.3, 0.6], 12]]) {
      const id = idle(t, seed, 0.6), o = { x, y: 1560, s: 0.52, tilt: 6 + 3 * X.noise(t * 0.3, seed), sway: id.sway * 0.3, breath: id.breath, blink: 0 };
      const P = up(Q[who](Object.assign(o, { noLegs: true, face: { expr: 'neutral', look, lid: 0.5 }, armR: rest('woman', 'R'), armL: rest('woman', 'L') })), o);
      far += Q.litHair(P, o, Q[art](), V.LS);
    }
    return far + S.studioTable(t, { top: 1180, near: 1250, tray: [540, 1215], pot: [300, 1236], done: 8, trayDark: 0.55 });
  };
  // o.grip: the boss's fist (world) - omit to leave him out (a close shot of you); o.brush {A, B}: the brush alone,
  // its handle end A out of frame; o.youFace / o.bossFace; o.lum the paint's glow
  V.pairWorld = (t, o = {}) => {
    const yo = V.youAt(t, o.yo || {});
    const YP = up(Q.you(Object.assign(yo, { noLegs: true, face: o.youFace, armR: rest('woman', 'R'), armL: rest('woman', 'L') })), yo);
    let people = Q.litHair(YP, yo, Q.youArt(), V.LS), over = '';
    const lum = o.lum ?? 1;
    if (o.grip) {
      const id = idle(t, 7, 0.5), bo = Object.assign({ x: BOSS.X, y: BOSS.Y, s: BOSS.S, tilt: -5, sway: id.sway * 0.4, breath: id.breath, blink: id.blink }, o.bo || {});
      const BP = up(Q.boss(Object.assign(bo, { noLegs: true, face: o.bossFace, armL: gripAt(bo, Q.HAND.boss, o.grip, fingersFor('L', 'back', AX), { facing: 'back', detachHand: true }), armR: rest('man', 'R') })), bo);
      const A = [o.grip[0] - AX[0] * 50, o.grip[1] - AX[1] * 50], B = [o.grip[0] + AX[0] * 160, o.grip[1] + AX[1] * 160];
      people += Q.litHair(BP, bo, Q.bossArt(), V.LS, S.brush(A, B, lum, 1.3, { glow: false }) + BP.handL, [B[0] - 60, B[1] - 60, A[0] + 60, A[1] + 60]);
      over += S.brushGlow(A, B, lum, 1.6 + 0.4 * (o.pulse || 0));
    }
    if (o.brush) over += S.brush(o.brush.A, o.brush.B, lum, 1.3, { glow: false }) + S.brushGlow(o.brush.A, o.brush.B, lum, 1.5);
    const layers = S.studioBack(t);
    layers.push({ p: 0.9, svg: `<g filter="url(#dof1)">${farPair(t)}</g>` });
    layers.push({ p: 1, svg: people + over + S.studioTable(t, { near: 1720, tray: [790, 1630], trayS: 1.25, pot: [500, 1610], potS: 1.4, done: 5 }) }, { p: 1.02, svg: S.studioLight(t) });
    return layers;
  };

  // ======================================================= HOOK
  V.hkGrip = t => L2([748, 1306], [702, 1296], ss(0.05, 2.1, t));
  V.hkTip = t => { const g = V.hkGrip(t); return [g[0] + AX[0] * 160, g[1] + AX[1] * 160]; };
  V.hkCam = (() => { const b = V.hkTip(0); return V.cam([[0, [b[0], b[1] + 30, 3.3, 0]], [0.55, [b[0] - 6, b[1] + 40, 2.8, 0]], [1.45, [612, 1150, 1.62, 0]], [2.15, [556, 1112, 1.2, 0]], [2.85, [440, 1084, 1.42, 0]]]); })();
  const hookYou = t => V.faceAt(t, [
    [0, { expr: 'neutral', look: [0.85, -0.2], lid: 0.12, brows: [-3, 2], mouth: 'closed' }],
    [1.7, { expr: 'anxious', look: [0.8, -0.25], lid: 0.06, brows: [-6, 5], mouth: 'closed' }],
    [2.5, { expr: 'anxious', look: [0.7, -0.35], lid: 0.08, brows: [-7, 6], mouth: 'parted', open: 0.05 }]], 0.4);
  const hookBoss = t => V.faceAt(t, [
    [0, { expr: 'neutral', mouth: 'smile', look: [-0.75, 0.25], lid: 0.36, brows: [3, -2] }],
    [1.9, { expr: 'neutral', mouth: 'smirk', look: [-0.8, 0.3], lid: 0.42, brows: [6, -3] }]], 0.5);
  X.shot('HOOK', 0, 2.8, t => {
    const c = hh(V.hkCam(t), t, 0.6, 1);
    const pulse = bump(t, 1.62, 1, 0.7);
    const layers = V.pairWorld(t, { grip: V.hkGrip(t), youFace: hookYou(t), bossFace: hookBoss(t), lum: 0.9 + 0.1 * pulse, pulse });
    return S.EMIS + X.compose(layers, c) + C.vignette(0.45, '#060302', 0.4);
  }, { grade: 'gHall' });
  V.hkFace = t => scr(V.facePt(V.youAt(t), 'woman', [0, 20]), V.hkCam(t));

  // ======================================================= MOUTH: your face; the brush (alone) coming to your lips
  V.mtTip = t => { const m = V.youMouth(t); return L2(L2([620, 960], [470, 1030], ss(2.55, 3.2, t)), [m[0] + 28, m[1] - 4], ss(3.1, 3.95, t)); };
  V.mtCam = V.cam([[2.4, [330, 1060, 2.15, 0]], [3.3, [318, 1068, 2.45, 0]], [4.2, [306, 1078, 2.85, 0]], [4.55, [304, 1080, 2.95, 0]]]);
  const mouthYou = t => V.faceAt(t, [
    [2.4, { expr: 'anxious', look: [0.7, -0.35], lid: 0.08, brows: [-7, 6], mouth: 'parted', open: 0.05 }],
    [3.1, { expr: 'anxious', look: [0.6, 0.15], lid: 0.12, brows: [-9, 7], mouth: 'closed' }],
    [3.7, { expr: 'fear', look: [0.25, 0.55], lid: 0.18, brows: [-12, 8], mouth: 'parted', open: 0.08 }],
    [4.15, { expr: 'fear', look: [0.18, 0.6], lid: 0.22, brows: [-12, 8], mouth: 'parted', open: 0.12 }]], 0.35);
  X.shot('MOUTH', 2.44, 4.5, t => {
    const c = hh(V.mtCam(t), t, 0.5, 2);
    const B = V.mtTip(t), A = [B[0] + 430, B[1] - 250];
    const layers = V.pairWorld(t, { youFace: mouthYou(t), brush: { A, B } });
    return S.EMIS + X.compose(layers, c) + C.vignette(0.5, '#060302', 0.42);
  }, { grade: 'gHall' });
  V.mtFace = t => scr(V.facePt(V.youAt(t), 'woman', [0, 20]), V.mtCam(t));
  X.tr('push', 2.62, 0.36, 'HOOK', 'MOUTH', { fa: V.hkFace(2.62), fb: V.mtFace(2.62), za: 1.7, zb: 0.72, fade: [0.45, 0.55], blur: 5 });

  // ======================================================= STUDIO: the long room, the rows of girls at the dials, you
  // in the front row (all hands in laps under the tables; heads bent over the work)
  const ROWS = [
    { top: 1180, near: 1250, y: 1560, s: 0.52, p: 0.9, xs: [130, 400, 680, 950], tray: [540, 1215] },
    { top: 1300, near: 1380, y: 1918, s: 0.72, p: 0.95, xs: [150, 540, 930], tray: [340, 1340] }];
  const GIRLS = [['friendA', 'friendAArt'], ['friendB', 'friendBArt']];
  V.stYou = t => ({ x: 540, y: 2300, s: 1.0 });
  X.shot('STUDIO', 4.3, 6.78, t => {
    const c = hh(V.stCam(t), t, 0.6, 3);
    const layers = S.studioBack(t);
    ROWS.forEach((row, ri) => {
      let g = '';
      row.xs.forEach((x, i) => {
        const [who, art] = GIRLS[(i + ri) % 2], id = idle(t, 20 + ri * 5 + i, 0.6);
        const o = { x, y: row.y, s: row.s, tilt: 10 + 4 * X.noise(t * 0.4, i + ri), sway: id.sway * 0.4, breath: id.breath, blink: 0 };
        const chat = (i + ri) % 3 === 1, side = i < row.xs.length / 2 ? 1 : -1;
        const face = chat ? { expr: 'neutral', look: [0.8 * side, 0.1], lid: 0.2, mouth: X.noise(t * 3, i + ri * 7) > 0.1 ? 'talk' : 'smile', open: 0.15, brows: [4, 3] } : { expr: 'neutral', look: [0.05 * (i - 1), 0.9], lid: 0.42 };
        if (chat) { o.tilt = 2 * side; }
        const P = up(Q[who](Object.assign(o, { noLegs: true, face, armR: rest('woman', 'R'), armL: rest('woman', 'L') })), o);
        g += Q.litHair(P, o, Q[art](), V.LS);
      });
      g += S.studioTable(t, { top: row.top, near: row.near, tray: row.tray, pot: [row.tray[0] + 260, row.top + 40], potS: row.s * 1.2, trayS: row.s * 1.2, done: 8 });
      layers.push({ p: row.p, svg: `<g filter="url(#dof1)">${g}</g>` });
    });
    // the front row: a friend each side of you; you look up from the dial on "nineteen"
    let near = '';
    for (const [who, art, x, seed] of [['friendB', 'friendBArt', 170, 31], ['friendA', 'friendAArt', 910, 32]]) {
      const id = idle(t, seed, 0.6), o = { x, y: 2300, s: 1.0, tilt: 9, sway: id.sway * 0.4, breath: id.breath, blink: 0 };
      const face = x < 540 ? { expr: 'neutral', look: [0.85, 0.1], lid: 0.2, mouth: X.noise(t * 3.2, 5) > 0 ? 'talk' : 'smile', open: 0.14, brows: [4, 3] } : { expr: 'neutral', look: [-0.1, 0.9], lid: 0.42 };
      if (x < 540) o.tilt = 3;
      const P = up(Q[who](Object.assign(o, { noLegs: true, face, armR: rest('woman', 'R'), armL: rest('woman', 'L') })), o);
      near += Q.litHair(P, o, Q[art](), V.LS);
    }
    const lu = ss(5.75, 6.15, t), id = idle(t, 33, 0.6);
    const yo = { x: 540, y: 2300, s: 1.0, tilt: lerp(10, 3, lu), sway: id.sway * 0.4, breath: id.breath, blink: t > 5.7 && t < 6.2 ? 0 : id.blink };
    const YP = up(Q.you(Object.assign(yo, { noLegs: true, face: V.faceAt(t, [[4.3, { expr: 'neutral', look: [0, 0.95], lid: 0.55 }], [5.95, { expr: 'neutral', look: [0.02, 0.05], lid: 0.12, mouth: 'smile', brows: [2, 2] }]], 0.4), armR: rest('woman', 'R'), armL: rest('woman', 'L') })), yo);
    near += Q.litHair(YP, yo, Q.youArt(), V.LS) + S.studioTable(t, { near: 1720, tray: [300, 1620], trayS: 1.1, pot: [800, 1600], potS: 1.3, done: 3 });
    layers.push({ p: 1, svg: near }, { p: 1.02, svg: S.studioLight(t) });
    return S.EMIS + X.compose(layers, c) + C.vignette(0.45, '#060302', 0.4);
  }, { grade: 'gHall' });
  V.stCam = (() => { const cal = camOn(S.RG.CAL, 0.8); return V.cam([[4.25, [cal[0], cal[1] + 20, 2.3, 0.4]], [4.9, [cal[0] - 10, cal[1] + 40, 2.05, 0.2]], [5.5, [540, 1060, 1.06, 0]], [6.2, [540, 1080, 1.38, 0]], [6.8, [540, 1070, 1.62, 0]]]); })();
  V.stFace = t => scr([540, 1052], V.stCam(t));
  X.tr('push', 4.33, 0.4, 'MOUTH', 'STUDIO', { fa: scr(V.youMouth(4.33), V.mtCam(4.33)), fb: scr(S.RG.CAL, V.stCam(4.33), 0.8), za: 2.2, zb: 0.6, fade: [0.45, 0.55], blur: 6 });

  // ======================================================= DIALS: the work itself, close; the brush (from out of frame)
  // paints the 12; then the soldiers' watch, the helmet and the crate for New Jersey
  const DL = { C: [470, 1010], R: 250, FLAT: 0.62 };
  V.DL = DL;
  // the "12" being painted: the tip runs down the 1, then round the 2 (u 0..1)
  const twelve = u => {
    const [cx, cy] = DL.C, r = DL.R, fs = r * 0.24, x0 = cx - fs * 0.32, y0 = cy - r * 0.68 * DL.FLAT;
    const pts = [[x0 - fs * 0.22, y0 - fs * 0.5], [x0 - fs * 0.22, y0 + fs * 0.32], [x0 + fs * 0.18, y0 - fs * 0.38], [x0 + fs * 0.52, y0 - fs * 0.52], [x0 + fs * 0.62, y0 - fs * 0.2], [x0 + fs * 0.18, y0 + fs * 0.3], [x0 + fs * 0.66, y0 + fs * 0.3]];
    const k = cl(u) * (pts.length - 1), i = Math.min(pts.length - 2, Math.floor(k));
    return L2(pts[i], pts[i + 1], k - i);
  };
  X.shot('DIALS', 6.6, 9.12, t => {
    const c = hh(V.dlCam(t), t, 0.5, 4);
    const u = ss(6.68, 7.4, t), tip = twelve(u), lift = env(t, 6.55, 6.7, 7.45, 7.75);
    const B = [tip[0], tip[1] - 26 * (1 - lift)], A = [B[0] + 520, B[1] - 640];
    let g = `<rect x="-600" y="-400" width="2400" height="2800" fill="#6a4a2c" filter="url(#woodH)"/>` + S.lg('dlTop', [[0, '#000', 0.25], [0.5, '#000', 0], [1, '#000', 0.35]], 0, 0, 0, 1) + `<rect x="-600" y="-400" width="2400" height="2800" fill="url(#dlTop)"/>`;
    for (let i = 0; i < 14; i++) g += `<path d="M-600,${-300 + i * 190} L1800,${-280 + i * 190}" stroke="#3a2614" stroke-width="2" opacity="0.5"/>`;
    // the dial being painted: 1-11 done; the 12 revealed behind the tip
    g += `<ellipse cx="${DL.C[0] + 14}" cy="${DL.C[1] + 22}" rx="${DL.R * 1.16}" ry="${DL.R * 1.16 * DL.FLAT}" fill="#000" opacity="0.35" filter="url(#b8)"/>`;
    g += S.dial(DL.C[0], DL.C[1], DL.R, 11, 0.55, { flat: DL.FLAT, hands: false });
    { const fs = DL.R * 0.24, cx = DL.C[0], cy = DL.C[1] - DL.R * 0.68 * DL.FLAT, rv = cx - fs * 0.6 + (fs * 1.3) * cl(u * 1.05); g += `<defs><clipPath id="dl12"><rect x="${f(cx - fs)}" y="${f(cy - fs)}" width="${f(rv - cx + fs)}" height="${f(fs * 2)}"/></clipPath></defs><g clip-path="url(#dl12)"><g transform="translate(${f(cx)},${f(cy)}) scale(1,${DL.FLAT}) translate(${f(-cx)},${f(-cy)})">${S.TXT(cx, cy + fs * 0.36, fs, mix('#d8e8b0', GL, 0.55), '12', { w: 'bold' })}</g></g>` + S.radGlow(cx, cy, fs * 1.4, 0.35 * u); }
    // the tray of finished dials, the soldier's watch, the helmet, the crate
    for (let i = 0; i < 5; i++) for (let j = 0; j < 2; j++) g += S.dial(380 + i * 120 + j * 20, 1460 + j * 80, 46, 12, 0.5, { flat: 0.55, hands: false });
    g += S.trenchWatch(900, 800, 78, 0.6, { flat: 0.7 }) + S.helmet(1010, 1200, 0.9) + S.crate(1290, 960, 1.05) + S.paintPot(170, 760, 2.2, 0.8);
    g += S.brush(A, B, 1, 1.6) ;
    const layers = [{ p: 1, svg: g }, { p: 1.03, svg: S.dust(600, 900, 700, 500, 24, 61, t, '#fff0d8', 1.6, 0.4) }];
    return S.EMIS + X.compose(layers, c) + C.vignette(0.5, '#060302', 0.4);
  }, { grade: 'gHall' });
  V.dlCam = V.cam([[6.55, [420, 950, 2.2, 0.6]], [7.35, [450, 960, 1.95, 0.3]], [7.95, [820, 880, 1.55, 0]], [8.5, [1060, 900, 1.4, -0.2]], [9.15, [1180, 880, 1.5, -0.3]]]);
  X.tr('rack', 6.69, 0.42, 'STUDIO', 'DIALS', { fa: V.stFace(6.69), fb: scr(twelve(0.05), V.dlCam(6.69)), za: 1.5, zb: 0.8, fade: [0.4, 0.6], blur: 9 });

  // ======================================================= LIP / DIP / PAINT, one insert each, cut on the words
  // LIP: your lips close on the brush to point it (the brush from out of frame)
  X.shot('LIP', 9.0, 9.62, t => {
    const m = V.youMouth(t), k = ss(9.04, 9.2, t), out = ss(9.36, 9.58, t);
    const B = [m[0] + lerp(70, 8, k) + 60 * out, m[1] + 2 - 3 * out], A = [B[0] + 430, B[1] - 300];
    const face = { expr: 'neutral', look: [0.3, 0.55], lid: 0.32, brows: [-4, 3], mouth: k > 0.6 && out < 0.5 ? 'tight' : 'parted', open: k > 0.6 && out < 0.5 ? 0 : 0.06 };
    // (the camera first: a figure's light pass is clipped to the view, and a stale view drew nothing)
    const c = hh([m[0] + 26, m[1] - 6, 7.2, 0], t, 0.25, 5);
    const layers = V.pairWorld(t, { youFace: face, brush: { A, B } });
    return S.EMIS + X.compose(layers, c) + C.vignette(0.5, '#060302', 0.42);
  }, { grade: 'gHall' });
  // DIP: into the pot of glowing paint
  X.shot('DIP', 9.56, 10.12, t => {
    const P0 = [540, 1160], d = env(t, 9.62, 9.75, 9.9, 10.04);
    const B = [P0[0] + 10, P0[1] - 260 + 210 * d], A = [B[0] + 380, B[1] - 900];
    let g = `<rect x="-600" y="-400" width="2400" height="2800" fill="#6a4a2c" filter="url(#woodH)"/>` + S.paintPot(P0[0], P0[1] + 240, 7.2, 1);
    for (let i = 0; i < 3; i++) { const a = cl((t - 9.75 - i * 0.07) / 0.35); if (a > 0 && a < 1) g += `<ellipse cx="${P0[0]}" cy="${P0[1] + 86}" rx="${f(30 + 110 * a)}" ry="${f(8 + 24 * a)}" fill="none" stroke="#eaffd0" stroke-width="3" opacity="${f(0.7 * (1 - a))}"/>`; }
    g += S.brush(A, B, 1, 3.2);
    const c = hh([540, 1180, 1.25, 0], t, 0.4, 6);
    return S.EMIS + X.compose([{ p: 1, svg: g }], c) + C.vignette(0.5, '#060302', 0.45);
  }, { grade: 'gHall' });
  // PAINT: a quick stroke of the 3
  X.shot('PAINT', 10.06, 10.72, t => {
    const u = ss(10.14, 10.5, t), cx = 470, cy = 1040, r = 520;
    const fs = r * 0.24, x3 = cx + r * 0.68, y3 = cy;
    const tip = [x3 - fs * 0.2 + fs * 0.45 * Math.sin(u * Math.PI * 1.6), y3 - fs * 0.5 + fs * u];
    let g = `<rect x="-600" y="-400" width="2400" height="2800" fill="#6a4a2c" filter="url(#woodH)"/>` + S.dial(cx, cy, r, 2, 0.6, { hands: false, flat: 0.8 });
    g += `<defs><clipPath id="pt3"><rect x="${f(x3 - fs)}" y="${f(y3 - fs)}" width="${f(fs * 2)}" height="${f(fs * 2 * u)}"/></clipPath></defs><g clip-path="url(#pt3)"><g transform="translate(${f(x3)},${f(y3)}) scale(1,0.8) translate(${f(-x3)},${f(-y3)})">${S.TXT(x3, y3 + fs * 0.36, fs, mix('#d8e8b0', GL, 0.6), '3', { w: 'bold' })}</g></g>`;
    g += S.brush([tip[0] + 600, tip[1] - 700], tip, 1, 2.6);
    const c = hh([x3 - 40, y3 - 20, 1.6, 0], t, 0.4, 7);
    return S.EMIS + X.compose([{ p: 1, svg: g }], c) + C.vignette(0.5, '#060302', 0.42);
  }, { grade: 'gHall' });
  X.tr('whip', 9.59, 0.14, 'LIP', 'DIP', { dir: [0, 1] });
  X.tr('whip', 10.09, 0.14, 'DIP', 'PAINT', { dir: [1, 0] });
  X.tr('zmatch', 9.06, 0.22, 'DIALS', 'LIP', { fa: [540, 960], fb: [540, 960], za: 1.6, zb: 0.7, plain: true, fade: [0.4, 0.6], blur: 6, bpow: 4 });

  // ======================================================= RHYTHM: "hundreds of times a day" - the clock racing round,
  // the window light turning from morning to evening, the tray filling with painted dials
  const CLK = [580, 192];
  X.shot('RHYTHM', 10.66, 12.1, t => {
    const u = ss(10.7, 12.0, t), h = 7.5 + 10 * u;
    const c = hh(V.rhCam(t), t, 0.5, 8);
    const layers = S.studioBack(t);
    // the day going by: the clock's hands racing round, the light through the windows turning to evening
    const eve = `<rect x="-900" y="-600" width="2900" height="2900" fill="#ff7a2a" opacity="${f(0.32 * u)}" style="mix-blend-mode:multiply"/>` + C.radial(300, 500, 900, '#ffa050', 0.3 * u);
    layers.push({ p: 0.8, svg: S.studioClock(CLK[0], CLK[1], 1.2, t * 6, h) + eve });
    let g = S.studioTable(t, { top: 1300, near: 1700, tray: false, pot: [140, 1480], potS: 1.6 });
    const n = Math.floor(lerp(0, 24, u)), pop = (lerp(0, 24, u) % 1);
    g += `<rect x="260" y="1360" width="700" height="290" fill="#2a1e14" ${R.ol(1.3)}/>`;
    for (let i = 0; i < 24; i++) { if (i > n) break; const xx = 320 + (i % 6) * 116, yy = 1410 + Math.floor(i / 6) * 66, sc = i === n ? ss(0, 0.5, pop) : 1; if (sc > 0.01) g += S.dial(xx, yy, 44 * sc, 12, 0.55, { flat: 0.55, hands: false }); }
    layers.push({ p: 1, svg: g + `<rect x="-900" y="-600" width="2900" height="2900" fill="#ff7a2a" opacity="${f(0.18 * u)}" style="mix-blend-mode:multiply"/>` }, { p: 1.02, svg: S.studioLight(t) });
    return S.EMIS + X.compose(layers, c) + C.vignette(0.5, '#060302', 0.42);
  }, { grade: 'gHall' });
  V.rhCam = (() => { const k = camOn(CLK, 0.8); return V.cam([[10.6, [k[0], k[1] + 60, 1.75, 0]], [11.15, [k[0], k[1] + 140, 1.6, 0]], [11.7, [560, 1000, 1.12, 0]], [12.1, [560, 1200, 1.2, 0]]]); })();
  X.tr('push', 10.69, 0.3, 'PAINT', 'RHYTHM', { fa: [540, 960], fb: scr(CLK, V.rhCam(10.69), 0.8), za: 0.6, zb: 1.6, fade: [0.45, 0.55], blur: 6 });

  // ======================================================= BOSS: "because the company swears it's safe enough to eat" -
  // the jar and the card on the desk; his smile; on "eat", a wink. (His hands hang behind the desk.)
  const JAR = [300, 1540], CARD = [470, 1548];
  X.shot('BOSS', 12.0, 14.75, t => {
    const c = hh(V.bsCam(t), t, 0.5, 9);
    const id = idle(t, 41, 0.5), nod = bump(t, 13.55, 1, 0.45), lean = ss(12.7, 13.4, t);
    const bo = { x: 640, y: 2390, s: 1.15, tilt: -3 + 5 * nod - 3 * lean, sway: id.sway * 0.4 - 1.2 * lean, breath: id.breath, blink: t > 13.9 ? 0 : id.blink };
    const wink = env(t, 14.1, 14.2, 14.45, 14.6);
    const F = V.faceAt(t, [
      [12.0, { expr: 'neutral', mouth: 'smile', look: [-0.4, 0.3], lid: 0.36, brows: [4, -2] }],
      [12.8, { expr: 'neutral', mouth: 'talk', open: 0.18, look: [0, 0.05], lid: 0.3, brows: [8, 2] }],
      [13.5, { expr: 'neutral', mouth: 'smile', look: [0, 0.05], lid: 0.32, brows: [6, 2] }],
      [14.15, { expr: 'neutral', mouth: 'grin', look: [0.05, 0.05], lid: 0.3, brows: [8, 0] }]], 0.3);
    const BP = up(Q.boss(Object.assign(bo, { noLegs: true, face: Object.assign({}, F, { lid: lerp(F.lid ?? 0.3, 0.62, wink) }), armR: rest('man', 'R'), armL: rest('man', 'L') })), bo);
    const layers = S.supplyBack(t);
    // the girls laughing in the foreground on "eat" (out of focus, at the frame's lower corners)
    const laugh = ss(14.1, 14.4, t);
    let fg = '';
    for (const [who, art, x, look, seed] of [['friendA', 'friendAArt', 60, [0.6, -0.1], 51], ['friendB', 'friendBArt', 1030, [-0.6, -0.1], 52]]) {
      const id2 = idle(t, seed, 0.6), sh = laugh * 0.5 * Math.sin(t * 22 + seed);
      const o = { x, y: 2930 + 6 * sh, s: 1.3, tilt: (x < 540 ? 6 : -6) + 4 * sh, sway: id2.sway * 0.4, breath: id2.breath, blink: 0 };
      const P = up(Q[who](Object.assign(o, { noLegs: true, face: V.faceMix({ expr: 'neutral', look, lid: 0.3, mouth: 'smile' }, { expr: 'neutral', look, lid: 0.55, mouth: 'grin', brows: [6, 4] }, laugh), armR: V.behind('R'), armL: V.behind('L') })), o);
      fg += Q.litHair(P, o, Q[art](), V.LS);
    }
    layers.push({ p: 1, svg: Q.litHair(BP, bo, Q.bossArt(), V.LS) + S.supplyDesk(t) + S.undarkJar(JAR[0], JAR[1], 1.15, { lum: 0.45 }) + S.harmlessCard(CARD[0], CARD[1], 0.95, -7) }, { p: 1.02, svg: S.studioLight(t) });
    layers.push({ p: 1.2, svg: `<g filter="url(#dof2)">${fg}</g>` });
    return S.EMIS + X.compose(layers, c) + C.vignette(0.45, '#060302', 0.42);
  }, { grade: 'gHall' });
  V.bsCam = V.cam([[11.95, [JAR[0] + 20, JAR[1] - 150, 2.6, 0.3]], [12.6, [JAR[0] + 60, JAR[1] - 170, 2.3, 0.1]], [13.2, [600, 1000, 1.7, 0]], [13.9, [620, 1060, 1.42, 0]], [14.75, [600, 1180, 1.12, 0]]]);
  X.tr('whip', 12.04, 0.18, 'RHYTHM', 'BOSS', { dir: [1, 0] });
})(window);
