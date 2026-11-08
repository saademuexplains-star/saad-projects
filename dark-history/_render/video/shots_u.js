// "The Pied Piper" (third cut): our cast in a Hamelin built in perspective (street3d / terrain3d / hamelin3d). Helpers
// shared by every shot: camera tracks in the world, a front-view walk and a skipping dance with planted feet, the Piper
// playing (body, pipe and fists lit in one pass, so his hands match him), lights for each place and hour, depth of field.
(function (G) {
  const X = G.ENG, T = G.ST3, Q = G.QCAST, C = G.CINE, R = G.RIG, PR = G.PROPS;
  const { track: TK, ss, clamp, lerp } = X;
  const { f } = R;
  const D2R = Math.PI / 180;
  const nrm = v => { const n = Math.hypot(v[0], v[1]) || 1; return [v[0] / n, v[1] / n]; };
  const env = (t, a, b, c, d) => ss(a, b, t) * (1 - ss(c, d, t));
  const H = { cam: {} };

  // a smooth path through keys [t, [values...], 'stop'?]: cubic Hermite with tangents from the neighbours (time-aware),
  // so the camera never jerks or halts at a key; 'stop' on a key makes the motion settle there; ends drift on
  H.spline = keys => t => {
    const n = keys.length; if (t <= keys[0][0]) { const [t0, v0] = keys[0], [t1, v1] = keys[1]; return v0.map((a, j) => a + (v1[j] - a) / (t1 - t0) * (t - t0) * 0); }
    if (t >= keys[n - 1][0]) return keys[n - 1][1];
    let i = 0; while (t > keys[i + 1][0]) i++;
    const [t0, p0] = keys[i], [t1, p1, st1] = keys[i + 1], st0 = keys[i][2], h = t1 - t0, u = (t - t0) / h;
    const tan = (k, p) => { if (keys[k][2] === 'stop') return p.map(() => 0); const a = keys[Math.max(0, k - 1)], b = keys[Math.min(n - 1, k + 1)]; return p.map((_, j) => (b[1][j] - a[1][j]) / (b[0] - a[0])); };
    const m0 = st0 === 'stop' ? p0.map(() => 0) : tan(i, p0), m1 = st1 === 'stop' ? p1.map(() => 0) : tan(i + 1, p1);
    const h00 = 2 * u * u * u - 3 * u * u + 1, h10 = u * u * u - 2 * u * u + u, h01 = -2 * u * u * u + 3 * u * u, h11 = u * u * u - u * u;
    return p0.map((a, j) => h00 * a + h10 * h * m0[j] + h01 * p1[j] + h11 * h * m1[j]);
  };
  // a camera moving through the world: keys [t, [x, y, z, yaw, pitch, fl]]; a breath of hand-held drift on top
  H.CAM3 = (keys, hand = 1, seed = 0) => { const tr = H.spline(keys); return t => { const v = tr(t); return T.cam({ x: v[0], y: v[1], z: v[2], yaw: v[3] + X.noise(t * 0.8, seed) * 0.16 * hand, pitch: v[4] + X.noise(t * 0.7, seed + 7) * 0.12 * hand, fl: v[5] }); }; };
  // engine camera at rest (the 3D shots do their own camera; lights clip to the screen)
  H.still = () => { X.CAM = [540, 960, 1, 0]; };

  // ---------------------------------------------------------------- walking toward the camera (front view)
  // dist: how far the walker has come (cm); the feet are planted while they carry the weight (they drift up the screen
  // as the body passes over them) and lift as they swing through; the body is highest passing over a foot.
  // (rig units: a man is 1450 tall, a kid 860; lift / depth / bob are in those units, bob is applied as y * s)
  H.walk = (dist, o = {}) => {
    const S = o.stride || 62, ph = dist / (2 * S), lift = o.lift ?? 64, dep = o.depth ?? 30, bob = o.bob ?? 26;
    // (the swinging foot leaves the ground and comes down to it softly: its lift rises and settles with zero speed at
    // both ends, so a step never jerks the foot up or slams it down)
    const leg = p => { const u = ((p % 1) + 1) % 1; if (u < 0.5) { const k = u / 0.5; return [0, dep * (1 - 2 * k), 1 + 0.03 * (1 - 2 * k)]; } const k = (u - 0.5) / 0.5; return [0, -dep * Math.cos(Math.PI * k) - lift * Math.sin(Math.PI * k) ** 2, 1 - 0.03 * Math.cos(Math.PI * k)]; };
    return { steps: { R: leg(ph), L: leg(ph + 0.5) }, bob: -bob * (1 - Math.cos(4 * Math.PI * ph)) / 2, sway: (o.sway ?? 1.1) * Math.sin(2 * Math.PI * ph), swing: Math.sin(2 * Math.PI * ph), ph };
  };
  // standing still: feet together on the ground (so a walker can stop without a pop: blend k 0..1 toward this)
  H.mixSteps = (a, k) => ({ R: a.R.map((v, i) => lerp(v, i === 2 ? 1 : 0, k)), L: a.L.map((v, i) => lerp(v, i === 2 ? 1 : 0, k)) });
  // arms hanging, swinging with the walk (a forward swing lifts the hand a little and brings it in): rig-local targets
  H.swingArms = (kind, swing, amp = 1, x = {}) => {
    const D = R.DIMS[kind], ry = D.shY + D.sw * 0.55 + (D.ua + D.fa) * 0.975, rx = D.shX - D.sw * 0.35;
    const hR = [-rx + 8 * swing * amp, ry - 34 * Math.max(0, swing) * amp + 10 * Math.max(0, -swing) * amp], hL = [rx + 8 * swing * amp, ry - 34 * Math.max(0, -swing) * amp + 10 * Math.max(0, swing) * amp];
    return { armR: Object.assign({ hand: hR, pose: 'relaxed', facing: 'back' }, x.R || {}), armL: Object.assign({ hand: hL, pose: 'relaxed', facing: 'back' }, x.L || {}) };
  };
  // a skipping dance: knees up in turn, a hop, arms high and waving (rig-local hands for a kid)
  H.skip = (t, ph = 0, o = {}) => {
    const w = (t * (o.rate || 1.9) + ph) * 2 * Math.PI, a = Math.sin(w), up = (1 - Math.cos(2 * w)) / 2;
    const steps = { R: [0, -(o.lift ?? 120) * Math.max(0, a) ** 1.5, 1.03], L: [0, -(o.lift ?? 120) * Math.max(0, -a) ** 1.5, 1.03] };
    return { steps, bob: -(o.hop ?? 60) * up, sway: 2.4 * a, armR: { hand: [-160 - 30 * a, -800 - 50 * a], dir: [-0.3, -1], pose: 'open', facing: 'palm' }, armL: { hand: [160 - 30 * a, -800 + 50 * a], dir: [0.3, -1], pose: 'open', facing: 'palm' } };
  };
  // a run (front view) for the mother in her long skirt: quick bob, lean, arms pumping
  H.run = (t, o = {}) => { const w = t * (o.rate || 3.1) * 2 * Math.PI, a = Math.sin(w); return { bob: -(o.bob ?? 60) * (1 - Math.cos(2 * w)) / 2, sway: 3 * a, armR: { hand: [-150 + 20 * a, -900 + 130 * a], dir: [0.2, 1], pose: 'fist' }, armL: { hand: [150 + 20 * a, -900 - 130 * a], dir: [-0.2, 1], pose: 'fist' } }; };

  // ---------------------------------------------------------------- people in the world
  // where someone of height hCm standing at (x, y0, z) lands on screen, and the rig scale for that
  // (scaled by distance, not by projecting the head: a figure stays upright and whole however high the camera looks
  // down on it, the way a cut-out stands)
  // (d: straight-line distance to the figure's middle, the depth-sort key shared with everything in the sets; vd: its
  // depth along the view axis)
  H.at = (cam, x, z, hCm, kind, y0 = 0) => {
    const c = cam.toC([x, y0, z]); if (c[2] < cam.near + 5) return null;
    const p = cam.scr(c);
    return { x: p[0], y: p[1], s: cam.fl / c[2] * hCm / R.DIMS[kind].H, d: cam.dist([x, y0 + hCm * 0.5, z]), vd: c[2] };
  };
  // light and draw one person (rig output P, options o, head art); mid: what they hold, drawn between the body and the
  // detached hands and lit in the same pass; L.artIn puts the head art inside the light too (for silhouettes)
  H.draw = (P, o, art, L, mid = '', x = {}) => {
    const a = art ? (typeof art === 'function' ? art(o) : art) : null;
    // (profiling switches: ?nocast ?nocloth ?nolit)
    if (G.DBG.nocloth) { P = Object.assign({}, P, { svg: P.svg.replace(/ filter="url\(#cloth[NS]?\)"/g, ''), handR: P.handR && P.handR.replace(/ filter="url\(#cloth[NS]?\)"/g, ''), handL: P.handL && P.handL.replace(/ filter="url\(#cloth[NS]?\)"/g, '') }); }
    if (G.DBG.noactors) return '';
    // level of detail without a visible switch: the soft-shading blurs only come off figures under ~150 px (too small
    // for them to show), and the cast shadow fades in with size between ~280 and ~520 px instead of switching on
    const hpx = (P.info && P.info.s ? P.info.s : o.s || 1) * (P.D ? P.D.H : 1000);
    if (hpx < 150 && !x.keepBlur) { const nb = s => s && s.replace(/ filter="url\(#b(05|1|2|4|8|14)\)"/g, ''); P = Object.assign({}, P, { svg: nb(P.svg), handR: nb(P.handR), handL: nb(P.handL) }); }
    const castK = ss(280, 520, hpx);
    if (castK < 0.01) x = Object.assign({}, x, { noCast: 1 }); else if (castK < 1) x = Object.assign({}, x, { castOp: (x.castOp ?? 0.3) * castK });
    if (G.DBG.noblur) { const nb = s => s && s.replace(/ filter="url\(#b(05|1|2|4|8|14)\)"/g, ''); P = Object.assign({}, P, { svg: nb(P.svg), handR: nb(P.handR), handL: nb(P.handL) }); }
    if (G.DBG.nolit) return Q.withArt(P, o, a, P.svg + mid + (P.handR || '') + (P.handL || ''));
    if (G.DBG.nocast) x = Object.assign({}, x, { noCast: 1 });
    // x.ext: the screen box of what they hold, lit with them (the light filter's box is cut to the body otherwise)
    // (joined with the box the rig gives for the arms, so a held thing never narrows it back to cut a hand)
    const E0 = P.info && P.info.ext, info = x.ext ? Object.assign({}, P.info, { ext: E0 ? [Math.min(E0[0], x.ext[0]), Math.min(E0[1], x.ext[1]), Math.max(E0[2], x.ext[2]), Math.max(E0[3], x.ext[3])] : x.ext }) : P.info;
    if (L.artIn) {
      const inner = Q.withArt(P, o, a, P.svg) + mid + (P.handR || '') + (P.handL || '');
      return C.lit({ svg: inner, info }, L).body;
    }
    const lit = C.lit({ svg: P.svg + mid + (P.handR || '') + (P.handL || ''), info }, Object.assign({ cast: x.cast, castOp: x.castOp ?? 0.3, ground: o.y }, L));
    return (x.noCast ? '' : lit.cast) + Q.withArt(P, o, a, lit.body);
  };
  // an actor for the depth sort: { z: camera depth, svg() }
  H.actor = (d, fn) => (typeof d === 'object' ? { z: d.d, vd: d.vd, svg: fn } : { z: d, svg: fn });
  // motion blur for a fast turn, the way a shutter smears a pan: the turn's speed on screen (px a frame, from the camera
  // half a frame either side), a blur along it of about half a frame's travel. Under ~7 px a frame there's none, and it
  // starts too small to see, so it never switches on visibly; a fast pan can't strobe (crenels, fences, setts).
  H.mblur = (svg, camFn, t) => {
    const a = camFn(t - 1 / 120), b = camFn(t + 1 / 120), fl = (a.fl + b.fl) / 2;
    const vx = Math.abs(fl * Math.tan((b.yaw - a.yaw) * D2R)), vy = Math.abs(fl * Math.tan((b.pitch - a.pitch) * D2R));
    const sx = Math.max(0, vx - 13) * 0.55, sy = Math.max(0, vy - 13) * 0.55;
    if (sx < 0.4 && sy < 0.4) return svg;
    const id = R.uid('mb');
    return `<defs><filter id="${id}" filterUnits="userSpaceOnUse" x="-200" y="-200" width="1480" height="2320"><feGaussianBlur stdDeviation="${f(sx)} ${f(sy)}" edgeMode="duplicate"/></filter></defs><g filter="url(#${id})">${svg}</g>`;
  };
  // a screen-space blur for depth of field (user-space region so it never drops out)
  let bid = 0;
  H.blur = (svg, sd) => { if (sd < 0.35) return svg; const id = 'hdof' + (bid++ % 997); return `<defs><filter id="${id}" filterUnits="userSpaceOnUse" x="-200" y="-200" width="1480" height="2320"><feGaussianBlur stdDeviation="${f(sd)}"/></filter></defs><g filter="url(#${id})">${svg}</g>`; };

  // ---------------------------------------------------------------- the Piper playing
  // the pipe from his lips down and out to his left, both fists on it; o: rig options (x, y, s, sway...); returns
  // { P, o, svg } with the body, the pipe and the hands lit together
  H.HANDP = Q.HAND.piper;
  // an arm whose fist closes on a screen point, fingers along dW (hand: the cast's hand size)
  H.gripK = (o, hand, Gw, dW, extra = {}) => { const dl = nrm(R.dirLocal(o, dW)), gl = R.toLocal(o, Gw), gy = R.gripSlot ? R.gripSlot(hand) : 0.33 * hand; return Object.assign({ hand: [gl[0] - dl[0] * gy, gl[1] - dl[1] * gy], dir: dl, pose: 'grip', facing: 'back' }, extra); };
  H.gripAt = (o, Gw, dW, extra = {}) => H.gripK(o, H.HANDP, Gw, dW, extra);
  H.fingersFor = (side, facing, thumb) => { const t = (side === 'R' ? -1 : 1) * (facing === 'palm' ? 1 : -1); return [-thumb[1] * t, thumb[0] * t]; };
  // a crutch under a child's right arm (st: where the child stands, hand: the cast's hand size): its foot on the ground
  // out to the side, its pad in the armpit, the fist round the handle. Returns the arm to give the figure and the crutch
  // to draw behind it, so the crutch always runs from the ground into his armpit through his hand (it used to stand by
  // itself beside him at a fixed tilt, its foot riding his swaying hand).
  H.crutch = (o, st, hand) => {
    const pad = R.toWorld(o, [-84, -566]), foot = [st.x - 205 * st.s, st.y + 4 * st.s], v = [pad[0] - foot[0], pad[1] - foot[1]], len = Math.hypot(v[0], v[1]), ax = [v[0] / len, v[1] / len];
    const gw = [foot[0] + v[0] * 330 / 560, foot[1] + v[1] * 330 / 560];
    return { arm: H.gripK(o, hand, gw, H.fingersFor('R', 'back', ax), { detachHand: true }), svg: PR.crutch(foot[0], foot[1], len / 560, Math.atan2(v[0], -v[1]) / D2R) };
  };
  // x.lower 0..1: he takes the pipe from his lips and lets it hang in his right fist (the left hand lets go)
  H.piper = (o, t, L, x = {}) => {
    const s = o.s, lw = x.lower || 0, ang = lerp((x.pipeAng ?? 20) + Math.sin(t * 2.3) * 2.5 * (1 - lw), -6, lw), d = [Math.sin(ang * D2R), Math.cos(ang * D2R)];
    const M = R.toWorld(o, [lerp(4, -96, lw), lerp(-1196, -880, lw)]), k = 1.36 * s, Lp = PR.PIPE_L * k;
    const g1 = [M[0] + d[0] * Lp * 0.36, M[1] + d[1] * Lp * 0.36], g2 = [M[0] + d[0] * Lp * 0.66, M[1] + d[1] * Lp * 0.66], up = [-d[0], -d[1]];
    const D = Object.assign({}, R.DIMS.man, { shX: 150, sw: 74 }), rest = [D.shX - D.sw * 0.35, D.shY + D.sw * 0.55 + (D.ua + D.fa) * 0.975];
    const grip2 = H.gripAt(o, g2, H.fingersFor('L', 'back', up), { detachHand: true });
    const armL = lw < 0.5 ? grip2 : { hand: [lerp(grip2.hand[0], rest[0], ss(0.5, 1, lw)), lerp(grip2.hand[1], rest[1], ss(0.5, 1, lw))], dir: [0, 1], pose: 'relaxed', facing: 'back', detachHand: true };
    const oo = Object.assign({}, o, { armR: H.gripAt(o, g1, H.fingersFor('R', 'back', up), { detachHand: true }), armL });
    oo.face = Object.assign({ mouth: 'tight', lid: 0.42 }, o.face || {});
    const P = Q.piper(oo), rot = Math.atan2(-d[0], d[1]) / D2R;
    const pipe = `<g transform="translate(${f(M[0])},${f(M[1])}) rotate(${f(rot)})">${PR.pipe(k, t)}</g>`;
    return { P, o: oo, svg: H.draw(P, oo, Q.piperArt(0.3 + 0.3 * Math.sin(t * 1.7)), L, pipe, x), mouth: M, bell: [M[0] + d[0] * Lp, M[1] + d[1] * Lp] };
  };

  // ---------------------------------------------------------------- lights (C.lit)
  H.LT = {
    // dawn behind the subject (the gate): cool front, warm rims all round
    dawn: { from: [0.15, -0.9], shadow: '#1a1420', shadowOp: 0.3, floor: '#140c10', floorOp: 0.2, contactOp: 0.4, key: '#c8c0d8', keyAdd: 0.03, rims: [{ from: [0, -1], col: '#ffd8a0', w: 9, op: 0.85 }, { from: [1, -0.3], col: '#ffc890', w: 6, op: 0.6 }, { from: [-1, -0.3], col: '#ffc890', w: 6, op: 0.5 }], face: { col: '#ffd8b0', op: 0.1 } },
    // the square: the low sun behind the camera on the left
    sun: { from: [-0.6, -0.5], shadow: '#2a2030', shadowOp: 0.32, floor: '#22180e', floorOp: 0.22, contactOp: 0.42, key: '#fff0d8', keyAdd: 0.07, rims: [{ from: [-1, -0.4], col: '#fff4d8', w: 7, op: 0.55 }, { from: [1, -0.2], col: '#c8d8f0', w: 4, op: 0.3 }], face: { col: '#fff0e0', op: 0.16 } },
    // your street: the sun high on the right
    morn: { from: [0.7, -0.6], shadow: '#2a2438', shadowOp: 0.34, floor: '#1c1820', floorOp: 0.22, contactOp: 0.42, key: '#fff0dc', keyAdd: 0.06, rims: [{ from: [1, -0.3], col: '#fff0d0', w: 7, op: 0.55 }, { from: [-1, -0.3], col: '#c8d4ec', w: 4, op: 0.3 }], face: { col: '#fff0e0', op: 0.14 } },
    // outside the walls, facing the town: the sun behind the camera
    out: { from: [0.2, -0.6], shadow: '#2a2438', shadowOp: 0.3, floor: '#1c1820', floorOp: 0.2, contactOp: 0.42, key: '#fff4e0', keyAdd: 0.07, rims: [{ from: [0, -1], col: '#fff4d8', w: 6, op: 0.5 }, { from: [-1, -0.3], col: '#d8e4f4', w: 4, op: 0.3 }], face: { col: '#fff0e0', op: 0.15 } },
    // against the sun: dark figures with bright edges (the head art inside the light)
    backlit: { artIn: 1, from: [0, -1], ambient: '#2a2228', ambientOp: 1, shadow: '#100a12', shadowOp: 0.86, floor: '#0a0608', floorOp: 0.55, contactOp: 0.25, key: '#584858', rims: [{ from: [0, -1], col: '#fff0c0', w: 6, op: 0.95 }, { from: [1, -0.4], col: '#ffe0a8', w: 4, op: 0.8 }, { from: [-1, -0.4], col: '#ffe0a8', w: 4, op: 0.8 }] },
    // the bedroom: the oil lamp on the left, moonlight from the window
    lamp: { from: [-0.9, -0.3], shadow: '#140a10', shadowOp: 0.46, floor: '#140a08', floorOp: 0.3, contactOp: 0.3, key: '#ffc890', keyAdd: 0.14, rims: [{ from: [-1, -0.3], col: '#ffb870', w: 7, op: 0.65 }, { from: [1, -0.4], col: '#8a9ad8', w: 4, op: 0.35 }], face: { col: '#ffd0a0', op: 0.26 } }
  };
  // a light between two presets (k 0..1): numbers and colours are blended, rims taken from the nearer one
  H.mixL = (a, b, k) => {
    if (k <= 0) return a; if (k >= 1) return b;
    const out = {};
    for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
      const va = a[key], vb = b[key];
      if (typeof va === 'number' && typeof vb === 'number') out[key] = lerp(va, vb, k);
      else if (typeof va === 'string' && typeof vb === 'string' && va[0] === '#' && vb[0] === '#') out[key] = R.mix(va, vb, k);
      else out[key] = k < 0.5 ? (va ?? vb) : (vb ?? va);
    }
    if (a.ambient && !b.ambient) { out.ambient = a.ambient; out.ambientOp = (a.ambientOp ?? 1) * (1 - k); }
    if (!a.ambient && b.ambient) { out.ambient = b.ambient; out.ambientOp = (b.ambientOp ?? 1) * k; }
    return out;
  };

  // ---------------------------------------------------------------- small helpers
  H.env = env; H.nrm = nrm; H.D2R = D2R;
  H.idle = (t, seed, amp = 1) => ({ blink: Q.blink(t, seed), breath: Q.breath(t * 1.1 + seed) * 0.6, sway: X.noise(t * 0.45, seed) * 0.5 * amp });
  // pigeons flushed off the roofs: world points rising and scattering (drawn as small flapping birds)
  H.flock = (cam, t, t0, o) => {
    if (t < t0) return '';
    const r = R.rng(o.seed || 3); let d = '';
    for (let i = 0; i < (o.n || 14); i++) {
      const a = t - t0 - r() * 0.3; if (a < 0) { r(); r(); r(); continue; }
      const P = [o.x + (r() - 0.5) * 600 + a * (o.vx ?? -160) * (0.7 + r() * 0.6), o.y + a * 260 + a * a * 40, o.z + (r() - 0.5) * 600 + a * (o.vz ?? -120)];
      const p = cam.proj(P); if (!p) continue;
      const k = cam.fl / Math.max(100, cam.toC(P)[2]), s = 22 * k, fl = Math.sin(t * 16 + i * 2.1);
      d += `M${f(p[0] - s)},${f(p[1] - s * 0.5 * fl)} Q${f(p[0] - s * 0.4)},${f(p[1] - s * 0.2)} ${f(p[0])},${f(p[1])} Q${f(p[0] + s * 0.4)},${f(p[1] - s * 0.2)} ${f(p[0] + s)},${f(p[1] - s * 0.5 * fl)}`;
    }
    return d ? `<path d="${d}" stroke="${o.col || '#3a3040'}" stroke-width="2.2" fill="none" stroke-linecap="round"/>` : '';
  };
  G.SH = H;
})(window);
