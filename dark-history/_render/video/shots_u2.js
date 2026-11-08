// "The Pied Piper" (third cut), shot 2 (the hook before it is shadow theatre: shots_uh.js).
// SQUARE (5.6 .. 10.35): high over the market square the camera tilts down onto the children at play. The tune
// reaches them: they stop, turn their eyes toward us (the music is behind the camera) and come walking after it; the
// Piper's coat sweeps past the lens.
(function (G) {
  const X = G.ENG, T = G.ST3, H3 = G.H3, Q = G.QCAST, C = G.CINE, R = G.RIG, PR = G.PROPS, SH = G.SH;
  const { ss, clamp, lerp } = X, { f } = R, LT = SH.LT;

  // ======================================================= 2. SQUARE
  const sqCam = SH.CAM3([
    [5.5, [385, 1100, 1190, 0, -64, 1100]],
    [5.6, [380, 1050, 1150, 0, -62, 1100]],
    [6.4, [300, 520, 760, -0.5, -26, 1100]],
    [6.95, [210, 180, 420, -1, -4, 1120]],
    [7.8, [150, 140, 440, -1.5, -1, 1150]],
    [8.6, [110, 128, 430, -1, 0, 1200]],
    [9.4, [90, 124, 330, 0, 0.5, 1200]],
    [10.35, [80, 122, 200, 1, 1, 1200]]
  ], 0.6, 2);
  const T_HEAR = 6.95, T_STOP = 7.35, T_LOOK = 7.8, T_GO = 8.5;
  const KS = [
    { mk: () => Q.kids[0], art: () => Q.kidArt[0], x: 10, z: 960, h: 122, play: 'ball', who: 0, fx: -40 },
    { mk: () => Q.kids[1], x: 330, z: 1090, h: 126, play: 'ball', who: 1, fx: 60 },
    { mk: () => Q.son, art: () => Q.sonArt, x: -560, z: 740, h: 118, play: 'hoop', fx: -10 },
    { mk: () => Q.kids[4], x: 720, z: 1500, h: 120, play: 'hens', fx: 120 },
    { mk: () => Q.kids[5], x: -640, z: 1420, h: 116, play: 'skip', fx: -120 },
    { mk: () => Q.kids[2], x: 430, z: 1240, h: 124, play: 'stand', fx: 90 },
    { mk: () => Q.kids[6], x: -230, z: 1900, h: 118, play: 'skip', fx: -60 },
    { mk: () => Q.kids[7], x: 280, z: 2050, h: 121, play: 'stand', fx: 30 }
  ];
  // the ball tossed between the first two (world positions of their hands, at the chest and out to the side, clear of
  // the face), then dropped and bouncing away
  const handW = k => { const K = KS[k]; return [K.x + (k ? -22 : 22), 74, K.z - 14]; };
  const ballAt = t => {
    if (t < T_STOP) {
      const P = 1.25, u = (((t - 5.0) / P) % 1 + 1) % 1, fwd = u < 0.5, k = fwd ? u / 0.5 : (u - 0.5) / 0.5, a = handW(fwd ? 0 : 1), b = handW(fwd ? 1 : 0);
      const e = ss(0.08, 0.92, k);
      return { p: [lerp(a[0], b[0], e), lerp(a[1], b[1], e) + 95 * 4 * e * (1 - e), lerp(a[2], b[2], e)], held: k < 0.08 ? (fwd ? 0 : 1) : k > 0.92 ? (fwd ? 1 : 0) : -1, thr: fwd ? 0 : 1, rcv: fwd ? 1 : 0, k };
    }
    // falls from where it was, bounces twice and rolls toward the front of the square
    const p0 = ballAt(T_STOP - 1e-4).p, tau = t - T_STOP, v = [-70, 0, -150];
    let y = p0[1], tt = tau, vy = 0, g = 980;
    const t1 = Math.sqrt(2 * p0[1] / g);
    if (tt < t1) y = p0[1] - 0.5 * g * tt * tt;
    else { let v1 = g * t1 * 0.5; tt -= t1; const t2 = 2 * v1 / g; if (tt < t2) y = v1 * tt - 0.5 * g * tt * tt; else { tt -= t2; v1 *= 0.45; const t3 = 2 * v1 / g; y = tt < t3 ? v1 * tt - 0.5 * g * tt * tt : 0; } }
    const roll = Math.min(tau, 1.8) - Math.max(0, Math.min(tau, 1.8) - 0.6) ** 2 * 0.5;
    return { p: [p0[0] + v[0] * roll, Math.max(0, y) + 12, p0[2] + v[2] * roll], held: -1 };
  };
  // the hoop the son is chasing: rolls across, runs on after he stops, slows, topples and falls flat (gathering speed
  // as it goes over, like a hoop does)
  const hoopX = t => t < T_STOP ? -520 + 420 * (t - 5.6) : (() => { const tau = Math.min(t - T_STOP, 0.55); return 215 + 420 * tau - 380 * tau * tau; })();
  // the son runs on a few steps after the tune catches him and stops (his speed eases off, it never cuts)
  const sonX = t => t < T_STOP ? hoopX(t) - 80 : 135 + 73.5 * (1 - (1 - clamp((t - T_STOP) / 0.35)) ** 2);
  const hoopSvg = (cam, E, t) => {
    const u = clamp((t - 7.85) / 0.45), x = hoopX(t), z = 780, r = 40, fall = u * u * Math.PI / 2;
    const c = [x, r * Math.cos(fall) + 2, z + r * Math.sin(fall)], ax = [r, 0, 0], ay = [0, r * Math.cos(fall), r * Math.sin(fall)];
    const ring = T.ring(c, ax, ay, 28), d = T.lineD(cam, [...ring, ring[0]]); if (!d) return null;
    // a pale binding wrapped round the rim turns with it, so it reads as rolling
    const dd = Math.max(cam.near + 1, cam.toC(c)[2]), k = cam.fl / dd, ang = x / r, rim = a => [0, 1, 2].map(j => c[j] + Math.cos(a) * ax[j] + Math.sin(a) * ay[j]), wrap = T.lineD(cam, [rim(ang - 0.17), rim(ang), rim(ang + 0.17)]);
    return SH.actor(cam.dist(c), () => `<path d="${d}" stroke="${T.tone(E, '#7a5230', dd, 'g')}" stroke-width="${f(Math.max(1, 5 * k))}" fill="none"/><path d="${d}" stroke="#20140c" stroke-width="${f(Math.max(0.5, 0.8 * k))}" fill="none" opacity="0.6"/>` + (wrap ? `<path d="${wrap}" stroke="${T.tone(E, '#d8c098', dd, 'g')}" stroke-width="${f(Math.max(1, 6 * k))}" fill="none" stroke-linecap="round"/>` : ''));
  };
  // hens pecking round the girl with the grain (well clear of the well), scattering when the music comes in smooth hops
  const hensAt = (cam, E, t) => [[690, 1430, 1], [790, 1570, -1], [660, 1610, 1]].map(([x0, z0, dir], i) => {
    const run = ss(T_STOP, T_STOP + 0.9, t), x = x0 + dir * 260 * run, z = z0 - 80 * run, c = cam.toC([x, 0, z]); if (c[2] < cam.near + 20) return null;
    const p = cam.scr(c), s = cam.fl / c[2] * 40 / 120, hop = run > 0 && run < 1 ? Math.sin(t * 9 + i) ** 2 * Math.sin(Math.PI * run) : 0;
    return SH.actor(cam.dist([x, 20, z]), () => `<ellipse cx="${f(p[0])}" cy="${f(p[1])}" rx="${f(50 * s)}" ry="${f(10 * s)}" fill="#0a0610" opacity="0.3"/>` + PR.hen(p[0], p[1] - 14 * s * hop, s, t * (1 + run * 3) + i, dir, i));
  }).filter(Boolean);
  const kidAt = (cam, E, t, K, i) => {
    const tgo = T_GO + i * 0.12, walkD = Math.max(0, t - tgo) * 105, go = ss(tgo, tgo + 0.5, t);
    const freeze = ss(T_STOP, T_STOP + 0.25, t), look = ss(T_LOOK + i * 0.05, T_LOOK + 0.55 + i * 0.05, t), hear = ss(T_HEAR, T_STOP, t);
    let x = K.x, z = K.z;
    if (K.play === 'hoop') x = sonX(t);
    z -= walkD; x = lerp(x, K.fx, ss(tgo, tgo + 1.8, t));
    const st = SH.at(cam, x, z, K.h, 'kid'); if (!st) return null;
    const idle = SH.idle(t, i * 3 + 1), o = { x: st.x, y: st.y, s: st.s, blink: idle.blink, breath: idle.breath, sway: idle.sway };
    // play (fades out when they stop)
    const pk = 1 - freeze;
    let face = { mouth: 'smile', lid: 0.15 }, arms = SH.swingArms('kid', 0, 0);
    if (K.play === 'ball') {
      // hands ready at the chest; the catcher's reach out to meet the ball and close round it, the thrower's follow it
      // away and come back, so they never jump; when the music stops them the hands stay where they were, then sink
      const b = ballAt(Math.min(t, T_STOP - 1e-4)), bw = cam.proj(b.p), bn = ballAt(t), bnw = cam.proj(bn.p);
      const wgt = b.rcv === K.who ? ss(0.55, 0.92, b.k) : b.thr === K.who ? 1 - ss(0.08, 0.35, b.k) : 0;
      const loc = bw ? R.toLocal(o, bw) : [0, -500], tgt = [lerp(0, loc[0], wgt), lerp(-500, loc[1], wgt)];
      arms = { armR: { hand: [lerp(-150, tgt[0] - 50, pk), lerp(-330, tgt[1] + 10, pk)], dir: [0.4, -1], pose: 'open', facing: 'palm' }, armL: { hand: [lerp(150, tgt[0] + 50, pk), lerp(-330, tgt[1] + 10, pk)], dir: [-0.4, -1], pose: 'open', facing: 'palm' } };
      face = { mouth: 'grin', lid: 0.1, look: [bnw ? clamp((bnw[0] - st.x) / 300, -1, 1) * pk : 0, -0.3 * pk] };
    } else if (K.play === 'hoop') {
      // a real running stride (about three and a half steps a second), easing to a stand as he pulls up
      const fr2 = ss(T_STOP + 0.1, T_STOP + 0.5, t), r = SH.walk(sonX(t) + 600, { stride: 118, lift: 130, depth: 22, bob: 50 });
      o.steps = SH.mixSteps(r.steps, fr2); o.y += r.bob * st.s * (1 - fr2); o.sway += r.sway * 1.5 * (1 - fr2);
      // running after it, the near hand held out to slap it along (on the hoop's side, never across the face)
      const sw = SH.swingArms('kid', r.swing * pk, 2.2);
      arms = { armR: sw.armR, armL: Object.assign({}, sw.armL, { hand: [lerp(sw.armL.hand[0], 215 + 12 * r.swing, pk), lerp(sw.armL.hand[1], -450 - 14 * r.swing, pk)] }) };
      face = { mouth: 'grin', lid: 0.1, look: [0.8 * pk, 0.2 * pk] };
    } else if (K.play === 'hens') {
      const w = Math.sin(t * 5), out = Math.max(0, w);
      arms = { armR: { hand: [lerp(-150, -150 - 170 * out, pk), lerp(-330, -500 - 60 * out, pk)], dir: [-0.6, 0.4], pose: 'open', facing: 'palm' }, armL: { hand: [lerp(150, 60, pk), lerp(-330, -470, pk)], dir: [-0.3, 1], pose: 'grip', facing: 'back' } };
      face = { mouth: 'smile', lid: 0.3, look: [-0.4 * pk, 0.6 * pk] };
    } else if (K.play === 'skip') {
      const sk = SH.skip(t, i * 0.37, { rate: 1.8 });
      o.steps = SH.mixSteps(sk.steps, freeze); o.y += sk.bob * st.s * pk; o.sway += sk.sway * pk;
      arms = { armR: { hand: [lerp(-150, sk.armR.hand[0], pk), lerp(-330, sk.armR.hand[1], pk)], dir: sk.armR.dir, pose: 'open', facing: 'palm' }, armL: { hand: [lerp(150, sk.armL.hand[0], pk), lerp(-330, sk.armL.hand[1], pk)], dir: sk.armL.dir, pose: 'open', facing: 'palm' } };
      face = { mouth: 'grin', lid: 0.1 };
    } else face = { mouth: 'smile', lid: 0.25, look: [Math.sin(t * 0.7 + i), 0.1] };
    // the tune: they lift their heads to it, freeze, and turn their eyes to us, gone dreamy; then they walk
    if (hear > 0) face = Object.assign({}, face, { brows: [-3 * hear * (1 - look), 0], mouth: hear > 0.5 && look < 0.5 ? 'parted' : face.mouth, open: 0.15 });
    if (look > 0) face = { mouth: 'smile', cd: -2, lid: lerp(face.lid ?? 0.15, 0.5, look), look: [lerp((face.look || [0, 0])[0], 0, look), lerp((face.look || [0, 0])[1], 0.05, look)], brows: [0, 0] };
    if (walkD > 0 || go > 0) {
      const w = SH.walk(walkD + 30, { stride: 46, lift: 70, depth: 26, bob: 24 });
      o.steps = SH.mixSteps(w.steps, 1 - go); o.y += w.bob * st.s * go; o.sway += w.sway * go;
      // the hands keep their shape (no wrist flip); a raised hand's fingers turn down with the arm as it drops
      const sw = SH.swingArms('kid', w.swing * go, 0.8), toWalk = (a, s) => Object.assign({}, a, { hand: [lerp(a.hand[0], s.hand[0], go), lerp(a.hand[1], s.hand[1], go)] }, a.dir ? { dir: [lerp(a.dir[0], 0, go), lerp(a.dir[1], 1, go)] } : {});
      arms = { armR: toWalk(arms.armR, sw.armR), armL: toWalk(arms.armL, sw.armL) };
    }
    o.tilt = (K.play === 'ball' ? 4 * Math.sin(t * 3) * pk : 0) + 3 * hear * (1 - look);
    Object.assign(o, arms, { face });
    const P = K.mk()(o);
    return SH.actor(st.d, () => SH.draw(P, o, K.art || null, LT.sun, '', { cast: [0.35, -0.3], castOp: 0.26 }));
  };
  SH.cam.SQUARE = sqCam;
  // the baker at his door and an old woman with her basket: they look round at the music too, and stay
  const ADULTS = [{ mk: () => Q.baker, x: -1060, z: 1350, h: 176, kind: 'man', seed: 41 }, { mk: () => Q.oldWoman, x: 930, z: 1700, h: 156, kind: 'woman', seed: 43 }];
  const adultAt = (cam, t, A0) => {
    const st = SH.at(cam, A0.x, A0.z, A0.h, A0.kind); if (!st) return null;
    const look = ss(T_LOOK, T_LOOK + 0.8, t), idle = SH.idle(t, A0.seed);
    const o = { x: st.x, y: st.y, s: st.s, sway: idle.sway, blink: idle.blink, breath: idle.breath, tilt: 3 * look,
      face: { expr: look > 0.5 ? 'anxious' : 'neutral', look: [lerp(A0.x < 0 ? 0.5 : -0.5, 0, look), lerp(0.2, 0, look)], lid: lerp(0.3, 0.14, look) } };
    if (A0.kind === 'man') { o.armR = { hand: [-160, -760], dir: [0.4, 1], pose: 'relaxed' }; o.armL = { hand: [170, -760], dir: [-0.4, 1], pose: 'relaxed' }; }
    else { o.armR = { hand: [-70, -760], dir: [0.6, 0.5], pose: 'grip', facing: 'back', detachHand: true }; }
    const P = A0.mk()(o);
    const basket = A0.kind === 'woman' ? (() => { const hw = R.toWorld(o, [-70, -760]), k = st.s * 1.6; return `<g transform="translate(${f(hw[0])},${f(hw[1])}) scale(${Math.round(k * 1e5) / 1e5})"><path d="M-60,20 C-62,90 62,90 60,20Z" fill="#a8803a" stroke="#20140c" stroke-width="2"/><path d="M-52,30 L52,30 M-56,52 L56,52" stroke="#6a4a20" stroke-width="3"/><path d="M-50,22 C-50,-40 50,-40 50,22" stroke="#7a5a2a" stroke-width="7" fill="none"/><circle cx="-20" cy="14" r="14" fill="#c84a2a"/><circle cx="10" cy="12" r="13" fill="#d8a030"/></g>`; })() : '';
    return SH.actor(st.d, () => SH.draw(P, o, null, LT.sun, basket, { cast: [0.35, -0.3], castOp: 0.24 }));
  };
  X.shot('SQUARE', 5.5, 10.35, t => {
    SH.still();
    const cam = sqCam(t), E = H3.SUN;
    const A = [...KS.map((K, i) => kidAt(cam, E, t, K, i)), ...ADULTS.map(a => adultAt(cam, t, a))].filter(Boolean);
    const b = ballAt(t), bc = cam.toC(b.p);
    if (bc[2] > cam.near + 10) { const p = cam.scr(bc), s = cam.fl / bc[2] * 20 / 68; A.push(SH.actor(cam.dist(b.p) - 1, () => PR.ball(p[0], p[1] + 34 * s, s))); }
    const hp = hoopSvg(cam, E, t); if (hp) A.push(hp);
    A.push(...hensAt(cam, E, t));
    return H3.square(cam, t, A);
  }, { grade: 'gDay' });

  // the Piper's coat sweeping past the lens (the wipe into the next shot): his back, out of focus, red and yellow
  // halves with their lozenges, the green dagged capelet across the top
  SH.coatWipe = (x, u) => {
    const lz = (cx, cy, c) => `<path d="M${f(cx)},${f(cy - 120)} L${f(cx + 90)},${f(cy)} L${f(cx)},${f(cy + 120)} L${f(cx - 90)},${f(cy)}Z" fill="${c}"/>`;
    let g = `<rect x="${f(x - 700)}" y="-200" width="700" height="2400" fill="#c8a028"/><rect x="${f(x)}" y="-200" width="700" height="2400" fill="#a82822"/>`;
    g += lz(x - 380, 620, '#2e6a4a') + lz(x - 200, 1250, '#2a4a8a') + lz(x + 260, 820, '#f2ece0') + lz(x + 420, 1500, '#2e6a4a') + lz(x - 460, 1700, '#b02a26') + lz(x + 160, 300, '#d8a428');
    let dag = `M${f(x - 760)},-200 L${f(x + 760)},-200 L${f(x + 760)},260 `;
    for (let i = 0; i <= 20; i++) { const xx = x + 760 - i * 76; dag += `L${f(xx - 38)},${f(300 + (i % 2) * 70)} L${f(xx - 76)},260 `; }
    g += `<path d="${dag}Z" fill="#2e6a4a"/>`;
    g += `<rect x="${f(x - 760)}" y="-200" width="1520" height="2400" fill="#000" opacity="0.18"/>`;
    return `<g filter="url(#dof4)">${g}</g>`;
  };
})(window);
