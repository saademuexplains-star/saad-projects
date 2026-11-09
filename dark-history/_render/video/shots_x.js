// "Coca-Cola" (Atlanta, 1865-1888), part 1: shared helpers and the first five shots. Times from _vo18/words.txt.
// SLASH   (0 .. 2.3)    "A sword slices open your chest,"  firelight, embers rising; the sabre's streak on "slices",
//                       the cut opening behind it, the jolt, the cry, the hand to the wound; pushing in on "chest"
// BATTLE  (1.7 .. 5.2)  "and the doctors give you the only painkiller they have, morphine,"  down against the gun
//                       wheel, the surgeon holding out the MORPHINE bottle; push to the label on "morphine"
// BATTLE2 (4.7 .. 7.93) "and it works so well that you can never stop taking it."  the same bottle, now in your fist
//                       at your chest; relief (eyes close, the breath out), then the eyes fixed on it
// ROOM1   (7.33 .. 10.15) "Twenty years after the American Civil War,"  1885: the same bottle in the old man's hand
//                       in the lamplight; pull back to his face, drift to the window and its street lamp
// STREET  (9.45 .. 11.62) "you're a pharmacist in Atlanta,"  the shop front at night in the rain, crane down to him
//                       behind the window
(function (G) {
  const X = G.ENG, Q = G.QCAST, S = G.SETS, C = G.CINE, R = G.RIG, ST = G.STAGE, PR = G.PROPS;
  const { ss, lerp, EZ } = X, { f } = R;
  const { up, behind, litWith, gripAt, still, clipTop, nrm } = ST;
  const V = G.CCV = {};
  const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const env = (t, a, b, c, d) => ss(a, b, t) * (1 - ss(c, d, t));
  const bump = (t, t0, a = 1, len = 0.35) => (t < t0 || t > t0 + len) ? 0 : a * Math.pow(Math.sin(Math.PI * (t - t0) / len), 2);
  const idle = (t, seed, amp = 1) => ({ blink: Q.blink(t, seed), breath: Q.breath(t * 1.1 + seed) * 0.6, sway: X.noise(t * 0.45, seed) * 0.5 * amp });
  // hand-held drift, the same on screen at any zoom (a long lens never shakes more than a wide one)
  const hh = (c, t, amp = 1, seed = 0) => { const k = amp / Math.sqrt(Math.max(1, c[2])), h = X.hand(t, k, seed); return (X.CAM = [c[0] + h[0], c[1] + h[1], c[2], (c[3] || 0) + h[2]]); };
  const scr = (w, c, p = 1) => { const [cx, cy, z] = c, zp = Math.pow(z, p), px = 540 + (cx - 540) * p, py = 960 + (cy - 960) * p; return [540 + (w[0] - px) * zp, 960 + (w[1] - py) * zp]; };
  // the camera point that puts a point of a layer at depth p in the middle of the screen
  const camOn = (pt, p = 1) => [540 + (pt[0] - 540) / p, 960 + (pt[1] - 960) / p];
  const L2 = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
  Object.assign(V, { cl, env, bump, idle, hh, scr, camOn, L2 });

  // ---------------------------------------------------------------- the camera: a smooth path through keys
  // keys [[t, [x, y, zoom, roll]], ...]: a monotone cubic through every key in x, y, log(zoom) and roll, so the
  // camera glides through a key without stopping (piecewise eases stop dead at every key); 'stop' on a key brings it
  // to rest there
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

  // ---------------------------------------------------------------- faces
  // one expression easing into the next (k 0..1): numbers slide, the named shapes are resolved to numbers (from
  // shots_v.js): a face never snaps from one frame to the next
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
  // a face through a list of [t, face] keys, each change eased over w seconds
  V.faceAt = (t, keys, w = 0.3) => { let F = keys[0][1]; for (let i = 1; i < keys.length; i++) { const k = ss(keys[i][0] - w / 2, keys[i][0] + w / 2, t); if (k > 0) F = V.faceMix(F, keys[i][1], k); } return F; };

  // ---------------------------------------------------------------- lights (one source per shot)
  V.LB = { from: [1, 0.12], shadow: '#0c0604', shadowOp: 0.6, floor: '#1a0e08', floorOp: 0.5, contactOp: 0, key: '#ffc890', keyAdd: 0.12,
    rims: [{ from: [1, -0.15], col: '#ff8a3a', w: 7, op: 0.7 }, { from: [-0.4, -1], col: '#ffb070', w: 5, op: 0.3 }], face: { col: '#ffc088', op: 0.2 } };
  V.LR = { from: [-1, 0.25], shadow: '#0a0604', shadowOp: 0.62, floor: '#140c06', floorOp: 0.5, contactOp: 0, key: '#ffd8a0', keyAdd: 0.12,
    rims: [{ from: [-1, 0.1], col: '#ffb060', w: 6, op: 0.55 }, { from: [0.8, -0.8], col: '#b8a890', w: 4, op: 0.16 }], face: { col: '#ffd0a0', op: 0.2 } };
  // waist-up behind the bench: the same lamp, but the floor term (darker toward the feet) eased off, so the hands on
  // the bench stay in the lamplight instead of going to dark blobs
  V.LR2 = Object.assign({}, V.LR, { floorOp: 0.22, shadowOp: 0.5 });
  V.LS = { from: [-0.4, -0.9], shadow: '#140a04', shadowOp: 0.5, floor: '#2a1608', floorOp: 0.4, contactOp: 0, key: '#ffd8a0', keyAdd: 0.1,
    rims: [{ from: [-0.6, -0.8], col: '#ffc070', w: 5, op: 0.45 }], face: { col: '#ffd0a0', op: 0.18 } };

  // ======================================================= SLASH
  // you on your feet in the fight, the town burning behind you; the rider's sabre comes from the upper left
  const SL = { X: 560, Y: 2650, S: 1.3, CUT0: 0.58, CUT1: 0.7 };
  V.slashO = t => {
    const id = idle(t, 3, 0.6), hit = ss(SL.CUT0 + 0.03, SL.CUT0 + 0.11, t), rec = ss(0.72, 1.5, t), gasp = ss(0.8, 1.2, t) * Math.sin(t * 7.5) * 0.5, flinch = V.env(t, 0.3, 0.52, 0.6, 0.7);
    return { x: SL.X + 8 * hit - 4 * rec - 6 * flinch, y: SL.Y + 14 * hit - 6 * rec, s: SL.S, sway: -1 + 5.5 * hit - 4 * rec + id.sway + 2.2 * flinch, tilt: -4 - 9 * hit + 15 * rec - 5 * flinch, breath: id.breath + 0.4 * hit + gasp + 0.5 * flinch, blink: t < 0.3 ? id.blink : 0 };
  };
  const slashFace = t => V.faceAt(t, [
    [-1, { expr: 'fear', look: [-0.62, -0.42], lid: 0.04, brows: [-10, -5], mouth: 'parted', open: 0.12, sweat: 0.15 }],
    [0.42, { expr: 'fear', look: [-0.7, -0.5], lid: 0.0, brows: [-13, -7], mouth: 'parted', open: 0.2, sweat: 0.18 }],
    [SL.CUT0 + 0.08, { expr: 'fear', mouth: 'cry', open: 0.3, lid: 0.66, brows: [-18, 10], look: [0.05, 0.3], sweat: 0.25 }],
    [1.05, { expr: 'fear', mouth: 'cry', open: 0.16, lid: 0.4, brows: [-15, 8], look: [0.12, 0.78], sweat: 0.3 }],
    [1.75, { expr: 'fear', mouth: 'cry', open: 0.2, lid: 0.48, brows: [-16, 9], look: [0.2, 0.6], sweat: 0.32 }]], 0.16);
  // the sabre's path across you: from far up at the left, down through the cut, out at the lower right
  V.slashPath = o => { const a = R.toWorld(o, [-178, -1104]), b = R.toWorld(o, [158, -868]), d = [b[0] - a[0], b[1] - a[1]]; return [[a[0] - 2.2 * d[0], a[1] - 2.2 * d[1]], [b[0] + 2.4 * d[0], b[1] + 2.4 * d[1]], a, b]; };
  // the streak the blade leaves and the blade at its head (u: 0..1 along the path; the cut is at 0.39..0.61 of it)
  const sabreStreak = (P0, P1, u) => {
    if (u <= 0 || u >= 1.7) return '';
    const dx = P1[0] - P0[0], dy = P1[1] - P0[1], L = Math.hypot(dx, dy), ang = Math.atan2(dy, dx) * 180 / Math.PI;
    const hu = Math.min(1, u), tu = Math.max(0, u - 0.46), fade = 1 - ss(1, 1.7, u);
    const Tl = [P0[0] + dx * tu, P0[1] + dy * tu], len = L * (hu - tu);
    if (len < 4) return '';
    let g = `<g transform="translate(${f(Tl[0])},${f(Tl[1])}) rotate(${f(ang)})">`;
    // the streak the steel leaves in the firelight: a long arc, thin at its tail, widest at the blade, warm glow round it
    const bow = -0.08 * len, w0 = 26;
    const arc = `M0,0 Q${f(len * 0.55)},${f(bow - w0 * 0.2)} ${f(len)},${f(-w0 * 0.5)} L${f(len)},${f(w0 * 0.5)} Q${f(len * 0.55)},${f(bow + w0 * 0.2)} 0,0Z`;
    g += `<defs><linearGradient id="slG" x1="0" y1="0" x2="${f(len)}" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffb070" stop-opacity="0"/><stop offset="0.6" stop-color="#ffd8a8" stop-opacity="0.45"/><stop offset="1" stop-color="#fff6ea" stop-opacity="0.95"/></linearGradient><filter id="slB" x="-10%" y="-300%" width="120%" height="700%"><feGaussianBlur stdDeviation="10 4"/></filter><filter id="slB2" x="-10%" y="-300%" width="120%" height="700%"><feGaussianBlur stdDeviation="3 1"/></filter></defs>`;
    g += `<path d="${arc}" fill="#ff9a50" opacity="${f(0.5 * fade)}" filter="url(#slB)" transform="scale(1,2.2)"/>`;
    g += `<path d="${arc}" fill="url(#slG)" opacity="${f(0.95 * fade)}" filter="url(#slB2)"/>`;
    g += `<path d="M${f(len * 0.25)},${f(bow * 0.55)} Q${f(len * 0.62)},${f(bow * 0.9)} ${f(len)},-2" stroke="#ffffff" stroke-width="3.5" fill="none" opacity="${f(0.85 * fade)}" stroke-linecap="round"/>`;
    // the blade at the head: a curved cavalry sabre, point first, its edge catching the fire, smeared along its travel
    if (u < 1.04) g += `<g transform="translate(${f(len)},0)" filter="url(#slB2)"><path d="M-420,-15 Q-150,-22 60,-6 L84,2 Q-150,4 -420,13Z" fill="#7c8088"/><path d="M-420,-15 Q-150,-22 60,-6 L84,2" stroke="#ffe8c8" stroke-width="4" fill="none"/><path d="M-410,9 Q-150,0 70,0" stroke="#3a3c40" stroke-width="3" fill="none" opacity="0.8"/><path d="M-470,-26 Q-440,-34 -420,-18 L-420,16 Q-440,32 -470,24Z" fill="#c8963a" stroke="#4a3208" stroke-width="2"/></g>`;
    return g + `</g>`;
  };
  // the blood thrown off the cut as the blade comes through (world space; t0 = the blade at the cut's start)
  const bloodSpray = (a, b, t, t0) => {
    const r = R.rng(2077), dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
    let g = '';
    for (let i = 0; i < 16; i++) {
      const k = r(), te = t0 + 0.05 * k, age = t - te, sp = 700 + r() * 900, upk = 0.25 + r() * 0.5, sz = 3 + r() * 6;
      if (age <= 0 || age > 0.62) { r(); continue; }
      const vx = ux * sp * (0.7 + 0.3 * r()), vy = uy * sp * 0.5 - sp * upk;
      const x = a[0] + dx * k + vx * age, y = a[1] + dy * k + vy * age + 0.5 * 2600 * age * age;
      const vyn = vy + 2600 * age, ang = Math.atan2(vyn, vx) * 180 / Math.PI, st = Math.min(3.2, 1 + Math.hypot(vx, vyn) / 900), op = 0.9 * (1 - ss(0.35, 0.62, age));
      g += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(sz * st)}" ry="${f(sz * 0.7)}" transform="rotate(${f(ang)} ${f(x)} ${f(y)})" fill="#4a0604" opacity="${f(op)}"/>`;
    }
    return g;
  };
  X.shot('SLASH', 0, 2.3, t => {
    const cam = V.slashCam(t), c = hh(cam, t, 1.1, 1);
    // the hit: a punch of the camera with the cut
    const hit = bump(t, SL.CUT0 + 0.06, 1, 0.42), c2 = [c[0] + 10 * hit, c[1] + 6 * hit, c[2] * (1 + 0.035 * hit), c[3] + 1.6 * hit]; X.CAM = c2;
    const o = V.slashO(t), k = ss(SL.CUT0 + 0.025, SL.CUT1 - 0.03, t), bleed = ss(SL.CUT0 + 0.08, 1.95, t);
    const reach = ss(0.72, 1.0, t);
    const P = up(Q.pembYoung(Object.assign({}, o, { costume: Q.youngCostume(k, bleed), face: slashFace(t),
      armR: { hand: L2([-176, -770], [6, -1000], reach), dir: nrm(L2([0.05, 1], [0.32, 0.95], reach)), pose: ss(0.8, 1.05, t) >= 1 ? 'fist' : 'relaxed', pose2: 'fist', poseK: ss(0.8, 1.05, t), facing: 'back' },
      armL: { hand: L2([182, -748], [196, -842], ss(0.66, 1.0, t)), dir: [-0.1, 1], pose: 'relaxed', facing: 'back' } })), o);
    const [P0, P1] = V.slashPath(o);
    const u = (t - (SL.CUT0 - 0.07)) / 0.22;
    const [, , ca, cb] = V.slashPath(o);
    const chars = Q.litHair(P, o, Q.pembYoungArt(), V.LB, Q.armAO(P, o, 'RL', V.LB)) + Q.headArt(P, o, Q.SOOT) + bloodSpray(ca, cb, t, SL.CUT0 + 0.035) + sabreStreak(P0, P1, u);
    const layers = S.battle(t);
    layers.push({ p: 1, svg: chars }, { p: 1.02, svg: S.battleLight(t) });
    return X.compose(layers, c2) + C.vignette(0.55, '#060302', 0.4);
  }, { grade: 'gHall' });
  // the camera: already pushing in at frame 0 (and before it, for the loop back from the end), the punch on the cut,
  // on toward the wound on "chest", tilting down as you fall (the carry into BATTLE goes on down)
  V.slashCam = V.cam([[-0.8, [552, 1110, 1.16, -0.4]], [0, [556, 1140, 1.24, -0.2]], [0.6, [560, 1176, 1.36, 0.3]], [1.4, [566, 1236, 1.5, 0.6]], [2.3, [578, 1330, 1.66, 0.9]]]);

  // ======================================================= BATTLE: down against the gun wheel, the surgeon, the bottle
  const BA = { Y: [372, 2543, 1.18], S: [948, 2414, 1.22], HB: 210 };
  const morphW = (g, h) => S.morphineBottle(g[0], g[1] + h * S.MORPH_GRIP, h);
  V.labelOf = (g, h) => [g[0], g[1] + h * S.MORPH_GRIP - h * 57 / 160];
  // the bottle in the surgeon's fist, coming to you
  V.battleBottle = t => L2([716, 1300], [606, 1328], ss(1.7, 3.9, t));
  const youDown = (t, seed, extra = {}) => { const id = idle(t, seed, 0.5), pant = Math.sin(t * 6.2) * 0.35; return Object.assign({ x: BA.Y[0], y: BA.Y[1], s: BA.Y[2], sway: -2 + id.sway * 0.6, tilt: -9, breath: id.breath + pant, blink: id.blink }, extra); };
  X.shot('BATTLE', 1.7, 5.2, t => {
    const c = hh(V.battleCam(t), t, 1, 2);
    const yo = youDown(t, 5), F = V.faceAt(t, [
      [1.6, { expr: 'fear', mouth: 'cry', open: 0.2, lid: 0.5, brows: [-16, 6], look: [0.75, -0.25], sweat: 0.3 }],
      [3.2, { expr: 'fear', mouth: 'cry', open: 0.12, lid: 0.4, brows: [-14, 4], look: [0.85, -0.05], sweat: 0.3 }],
      [4.3, { expr: 'fear', mouth: 'parted', open: 0.1, lid: 0.3, brows: [-10, 6], look: [0.9, 0.25], sweat: 0.28 }]], 0.4);
    const YP = up(Q.pembYoungHurt(Object.assign(yo, { noLegs: true, face: F,
      armR: { hand: [18, -958], dir: [0.92, -0.25], pose: 'fist', facing: 'back' },
      armL: { hand: [178, -690], dir: [0.15, 1], pose: 'relaxed', facing: 'back' } })), yo);
    const sid = idle(t, 8, 0.4), so = { x: BA.S[0], y: BA.S[1], s: BA.S[2], sway: -6 + sid.sway * 0.5, tilt: -8 + 3 * ss(3.4, 4.2, t), breath: sid.breath, blink: sid.blink };
    const gB = V.battleBottle(t);
    const SP = up(Q.surgeon(Object.assign(so, { noLegs: true, face: V.faceAt(t, [[1.6, { expr: 'grim', look: [-0.85, 0.25], lid: 0.34, mouth: 'tight', brows: [8, -4], sweat: 0.12 }], [3.6, { expr: 'grim', look: [-0.8, 0.1], lid: 0.3, mouth: 'talk', open: Q.talk(t, 0.14, 6) * env(t, 3.5, 3.7, 4.1, 4.3), brows: [10, -2], sweat: 0.12 }]], 0.4),
      armL: gripAt(so, Q.HAND.surgeon, gB, [-1, 0.06], { facing: 'back', detachHand: true }),
      armR: { hand: [-160, -730], dir: [-0.1, 1], pose: 'relaxed', facing: 'back' } })), so);
    const bot = morphW(gB, BA.HB);
    const chars = Q.litHair(YP, yo, Q.pembYoungArt(), V.LB, Q.armAO(YP, yo, 'RL', V.LB)) + Q.headArt(YP, yo, Q.SOOT) + Q.litHair(SP, so, Q.surgeonArt(), V.LB, Q.armAO(SP, so, 'RL', V.LB) + bot + SP.handL, [gB[0] - 80, gB[1] - 80, gB[0] + 80, gB[1] + 240]);
    const layers = S.battle(t);
    layers.push({ p: 1, svg: chars + S.battleFront(t) }, { p: 1.02, svg: S.battleLight(t) }, { p: 1.3, svg: S.battleFg(t) });
    return X.compose(layers, c) + C.vignette(0.55, '#060302', 0.4);
  }, { grade: 'gHall' });
  V.battleCam = (() => { const lab = V.labelOf([606, 1328], BA.HB); return V.cam([[1.4, [560, 1190, 0.98, 0.6]], [2.1, [548, 1230, 1.04, 0.3]], [3.3, [570, 1270, 1.28, -0.2]], [4.2, [596, 1360, 1.9, -0.5]], [4.7, [lab[0], lab[1], 2.5, -0.6]], [5.3, [lab[0] + 2, lab[1] + 4, 2.72, -0.6]]]); })();

  // ======================================================= BATTLE2: the bottle in your own fist now, at your chest
  V.b2Bottle = t => L2([474, 1300], [452, 1286], ss(6.4, 7.4, t));
  X.shot('BATTLE2', 4.7, 7.93, t => {
    const c = hh(V.b2Cam(t), t, 0.9, 3);
    const relief = ss(5.1, 6.0, t), yo = youDown(t, 5, { tilt: -9 - 6 * relief + 3 * ss(6.4, 7.2, t), breath: idle(t, 5).breath * (1 - 0.5 * relief) + 0.8 * env(t, 5.1, 5.5, 5.9, 6.6) });
    const F = V.faceAt(t, [
      [4.7, { expr: 'fear', mouth: 'parted', open: 0.12, lid: 0.34, brows: [-12, 6], look: [0.35, 0.6], sweat: 0.3 }],
      [5.45, { expr: 'tired', mouth: 'parted', open: 0.1, lid: 0.94, brows: [4, -2], look: [0, 0.2], sweat: 0.22 }],
      [6.55, { expr: 'tired', mouth: 'closed', open: 0, lid: 0.52, brows: [-3, 2], look: [0.42, 0.66], sweat: 0.18 }],
      [7.3, { expr: 'hollow', mouth: 'parted', open: 0.05, lid: 0.46, brows: [-6, 3], look: [0.45, 0.7], sweat: 0.16 }]], 0.6);
    const gP = V.b2Bottle(t);
    const YP = up(Q.pembYoungHurt(Object.assign(yo, { noLegs: true, face: F, blink: t > 6.4 ? 0 : yo.blink,
      armR: { hand: [18, -958], dir: [0.92, -0.25], pose: 'fist', facing: 'back' },
      armL: gripAt(yo, Q.HAND.pembYoungHurt, gP, [-1, 0.06], { facing: 'back', detachHand: true }) })), yo);
    // the surgeon still kneels at your side, out at the right
    const sid = idle(t, 8, 0.4), so = { x: BA.S[0], y: BA.S[1], s: BA.S[2], sway: -5 + sid.sway * 0.5, tilt: -5, breath: sid.breath, blink: sid.blink };
    const SP = up(Q.surgeon(Object.assign(so, { noLegs: true, face: { expr: 'grim', look: [-0.8, 0.3], lid: 0.38, mouth: 'tight', brows: [6, -3], sweat: 0.1 },
      armL: { hand: [-120, -760], dir: [-0.3, 0.95], pose: 'relaxed', facing: 'back' }, armR: { hand: [-160, -730], dir: [-0.1, 1], pose: 'relaxed', facing: 'back' } })), so);
    const bot = morphW(gP, BA.HB);
    const chars = Q.litHair(YP, yo, Q.pembYoungArt(), V.LB, Q.armAO(YP, yo, 'RL', V.LB) + bot + YP.handL, [gP[0] - 80, gP[1] - 80, gP[0] + 80, gP[1] + 240]) + Q.headArt(YP, yo, Q.SOOT) + Q.litHair(SP, so, Q.surgeonArt(), V.LB);
    const layers = S.battle(t);
    layers.push({ p: 1, svg: chars + S.battleFront(t) }, { p: 1.02, svg: S.battleLight(t) }, { p: 1.3, svg: S.battleFg(t) });
    return X.compose(layers, c) + C.vignette(0.55, '#060302', 0.4);
  }, { grade: 'gHall' });
  V.b2Cam = (() => { const lab = V.labelOf([474, 1300], BA.HB), lab2 = V.labelOf([452, 1286], BA.HB); return V.cam([[4.6, [lab[0] - 1, lab[1] - 2, 2.66, -0.5]], [4.95, [lab[0], lab[1], 2.64, -0.5]], [5.2, [lab[0] - 12, lab[1] - 40, 2.6, -0.3]], [5.9, [430, 1180, 2.0, 0.2]], [6.7, [404, 1130, 1.84, 0.5]], [7.4, [424, 1230, 2.1, 0.4]], [8.0, [lab2[0], lab2[1] - 10, 2.5, 0.2]]]); })();

  // ======================================================= ROOM1: twenty years on, the same bottle in the lamplight
  // (after the review: the bottle stands on the bench in front of him, his hand round its neck - the same hold as on the
  // night he dies (ROOM3). Held up to the lamp, the solver could only fold the forearm back over the upper arm, or put the
  // elbow straight out at the side; both drew a broken arm)
  V.r1Bottle = t => [520, 1470 - BA.HB * 0.92 * S.MORPH_GRIP];
  const OLD = { X: 560, Y: 2430, S: 1.2 };
  X.shot('ROOM1', 7.33, 10.15, t => {
    const c = hh(V.r1Cam(t), t, 0.8, 4);
    const id = idle(t, 11, 0.5), o = { x: OLD.X, y: OLD.Y, s: OLD.S, sway: id.sway * 0.6, tilt: 5 - 3 * ss(8.5, 9.6, t), breath: id.breath, blink: id.blink };
    const gB = V.r1Bottle(t);
    const F = V.faceAt(t, [
      [7.3, { expr: 'tired', look: [-0.25, 0.7], lid: 0.42, mouth: 'closed', brows: [-8, 4], bags: 0.7, age: true, sweat: 0.08 }],
      [8.7, { expr: 'tired', look: [-0.2, 0.62], lid: 0.55, mouth: 'tight', brows: [-11, 5], bags: 0.7, age: true, sweat: 0.08 }],
      [9.7, { expr: 'grim', look: [-0.75, -0.5], lid: 0.4, mouth: 'closed', brows: [-6, 3], bags: 0.7, age: true }]], 0.6);
    const P = up(Q.pembOld(Object.assign(o, { noLegs: true, face: F,
      armR: gripAt(o, Q.HAND.pembOld, gB, [1, 0.04], { facing: 'back', detachHand: true }),
      // (the other arm hangs at his side behind the bench - the hand that rested on the mortar's far side, away from
      // the lamp, was shaded almost black)
      armL: { hand: R.toLocal(o, [748, 1500]), dir: [-0.05, 1], pose: 'relaxed', facing: 'back' } })), o);
    // the bottle turning in his fingers: a glint sliding across the glass
    const gl = (t * 0.6) % 1, bot = morphW(gB, BA.HB * 0.92) + `<path d="M${f(gB[0] - 30 + 60 * gl)},${f(gB[1] + 40)} l0,110" stroke="#fff4d0" stroke-width="5" opacity="${f(0.35 * Math.sin(Math.PI * gl))}" stroke-linecap="round"/>`;
    const body = clipTop('r1Top', S.BR.NEAR, Q.litHair(P, o, Q.pembOldArt(), V.LR2, Q.armAO(P, o, 'RL', V.LR2) + bot + P.handR, [gB[0] - 90, gB[1] - 80, gB[0] + 90, gB[1] + 240]));
    // (no mortar on the bench here: the bottle stands where it was; the bench top is masked round the arm, the hand and
    // the bottle standing on it)
    const top = V.behindAlso(P, 'r1bt', S.benchTop(t, { morph: false, mortar: false }), P.handR + bot, 'R');
    const layers = S.backroom(t);
    layers.push({ p: 0.75, svg: S.roomWall(t, {}) });
    layers.push({ p: 1, svg: body + top + S.benchFront(t) }, { p: 1.02, svg: S.roomLight(t) }, { p: 1.25, svg: S.roomFg(t) });
    return X.compose(layers, c) + C.vignette(0.55, '#060302', 0.4);
  }, { grade: 'gHall' });
  // from the label (the morph lands here) back to his face, then a drift up to the window and its street lamp
  V.R1WIN = [110, 347];   // the street lamp in the window, on the wall layer (p 0.75)
  V.r1Cam = (() => { const lab = V.labelOf(V.r1Bottle(7.2), BA.HB * 0.92), w = camOn(V.R1WIN, 0.75); return V.cam([[7.2, [lab[0], lab[1] + 6, 2.6, -0.4]], [7.9, [lab[0] + 30, lab[1] - 30, 2.2, -0.2]], [8.7, [470, 930, 1.62, 0.3]], [9.4, [380, 840, 1.36, 0.5]], [10.2, [w[0] * 0.55 + 380 * 0.45, w[1] * 0.55 + 840 * 0.45, 1.42, 0.6]]]); })();

  // ======================================================= STREET: the shop front at night, rain
  X.shot('STREET', 9.45, 11.62, t => {
    const c = hh(V.stCam(t), t, 0.9, 5);
    const id = idle(t, 13, 0.4), o = { x: 520, y: 1840, s: 0.5, sway: id.sway * 0.5, tilt: 8, breath: id.breath, blink: id.blink };
    const P = up(Q.pembOld(Object.assign(o, { noLegs: true, face: { expr: 'tired', look: [0.1, 0.8], lid: 0.45, mouth: 'closed', brows: [-6, 3], bags: 0.6, age: true },
      armR: { hand: [-130, -760], dir: [0.2, 1], pose: 'relaxed', facing: 'back' }, armL: { hand: [130, -760], dir: [-0.2, 1], pose: 'relaxed', facing: 'back' } })), o);
    const inside = Q.litHair(P, o, Q.pembOldArt(), V.LS);
    const layers = S.street(t);
    layers.push({ p: 0.9, svg: S.shopInside(t, inside) });
    layers.push({ p: 1, svg: S.streetGround(t) + S.gasLamp(t) }, { p: 1.2, svg: S.streetFg(t) });
    return X.compose(layers, c) + C.vignette(0.6, '#060302', 0.38);
  }, { grade: 'gHall' });
  // crane down from the sign to the window, pushing in on him (the street lamp's lantern is where the zmatch lands)
  V.stCam = V.cam([[9.3, [320, 700, 1.2, -0.6]], [9.9, [345, 762, 1.25, -0.4]], [10.7, [470, 990, 1.36, 0]], [11.62, [526, 1150, 1.72, 0.3]]]);
  V.stFace = t => { const c = V.stCam(t); return scr([520, 1840 - 1308 * 0.5], c, 0.9); };

  // ---------------------------------------------------------------- transitions (part 1)
  // the fall: the carry tilts on down with you
  X.tr('carry', 2.0, 0.6, 'SLASH', 'BATTLE', { mode: 'tilt', dir: [0, 1], dist: 0.34, fade: [0.46, 0.54], blur: 10 });
  // the label in his fist, then in yours: a soft rack on the same bottle
  X.tr('rack', 4.95, 0.5, 'BATTLE', 'BATTLE2', { fa: [540, 960], fb: [540, 960], za: 1.04, zb: 0.97, blur: 9, fade: [0.36, 0.64] });
  // twenty years in one shape: the bottle against your chest becomes the bottle in the old man's hand
  X.tr('morph', 7.63, 0.6, 'BATTLE2', 'ROOM1', { fa: scr(V.labelOf(V.b2Bottle(7.63), BA.HB), V.b2Cam(7.63)), fb: scr(V.labelOf(V.r1Bottle(7.63), BA.HB * 0.92), V.r1Cam(7.63)), za: 1.3, zb: 1.3, align: true, fade: [0.44, 0.56], blur: 4, bpow: 8, col: '#ffcc88' });
  // the street lamp in his window becomes the street lamp outside the shop
  X.tr('zmatch', 9.8, 0.7, 'ROOM1', 'STREET', { fa: scr(V.R1WIN, V.r1Cam(9.8), 0.75), fb: scr(S.ST.LAMP, V.stCam(9.8), 1), za: 2.4, zb: 0.6, plain: true, fade: [0.44, 0.56], blur: 7, bpow: 4, leak: '#ffcc80', leakOp: 0.35 });
})(window);
