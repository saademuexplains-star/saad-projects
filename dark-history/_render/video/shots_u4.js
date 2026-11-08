// "The Pied Piper" (third cut), shots 5-7.
// OUTGATE (19.9 .. 22.95): outside the walls the last children skip out of the east gate toward us and past us; the
// camera rises and turns to follow them up the path, and they go dark against the morning sun, the whole line climbing.
// HILL (22.4 .. 25.95): over their heads and up: a hundred and thirty children dancing up the hill behind the music.
// TOP (25.6 .. 31.45): you reach the top, out of breath. The music has stopped. Nothing is there; the camera climbs
// away from you until you are a speck on the bare summit.
(function (G) {
  const X = G.ENG, T = G.ST3, H3 = G.H3, TR = G.TR3, Q = G.QCAST, C = G.CINE, R = G.RIG, PR = G.PROPS, SH = G.SH;
  const { ss, clamp, lerp } = X, { f } = R, LT = SH.LT;
  const gh = (x, z) => TR.h(x, z);

  // ---------------------------------------------------------------- the far procession: small dancing children on the
  // path (dark against the sun, a warm rim along their tops), the Piper at their head
  const COLS = ['#a8642a', '#4a5a7a', '#7a3a2a', '#6a7a4a', '#8a7a5a', '#4a3a5a', '#9a5a3a', '#3a5a5a', '#5a7a3a'];
  SH.procession = (cam, t, o) => {
    let rim = '', dark = '';
    const n = o.n || 130, v = o.v ?? 105, s0 = o.s0, gap = o.gap ?? 118;
    for (let i = 0; i < n; i++) {
      const s = s0 + i * gap + v * (t - (o.t0 || 0)) + 30 * Math.sin(i * 1.7);
      if (s < 0 || s > TR.pathLen - 300) continue;
      const q = TR.pathAt(s), side = (i % 2 ? 1 : -1) * (20 + (i * 37) % 50), x = q.x + q.dir[1] * side, z = q.z - q.dir[0] * side;
      const c = cam.toC([x, gh(x, z), z]); if (c[2] < cam.near + 60) continue;
      // culled only when the whole figure is off screen; the farthest thin away by size instead of popping out
      const p = cam.scr(c), k = cam.fl / c[2] * (105 + (i * 13) % 25) / 152;
      if (p[0] + 60 * k < 0 || p[0] - 60 * k > 1080 || p[1] - 170 * k > 1920 || p[1] + 10 * k < 0) continue;
      const op = ss(0.012, 0.03, k); if (op <= 0) continue;
      const ph = i * 0.9, wrap = s2 => op < 0.996 ? `<g opacity="${f(op)}">${s2}</g>` : s2;
      rim += wrap(PR.kidSil(p[0], p[1] - 1.6, k, t, '#ffdca0', '#ffdca0', ph, '#ffdca0'));
      dark += wrap(PR.kidSil(p[0], p[1], k, t, COLS[i % COLS.length], '#2a1a14', ph, '#e8c0a0'));
    }
    // the Piper at the head of the line, tall, hat and feather, the pipe at his lips
    const sp = Math.min(TR.pathLen - 260, s0 + n * gap + 260 + v * (t - (o.t0 || 0)));
    const q = TR.pathAt(sp), c = cam.toC([q.x, gh(q.x, q.z), q.z]);
    if (c[2] > cam.near + 200) {
      const p = cam.scr(c), k = cam.fl / c[2] * 190 / 300, sw = Math.sin(t * 2.2) * 4;
      const fig = col => `<g transform="translate(${f(p[0])},${f(p[1])}) scale(${Math.round(k * 1e5) / 1e5})"><path d="M-14,-150 L${f(-22 + sw)},0 M14,-150 L${f(22 - sw)},0" stroke="${col}" stroke-width="14" stroke-linecap="round"/><path d="M-34,-252 L34,-252 L46,-130 L-46,-130Z" fill="${col}"/><circle cx="0" cy="-272" r="20" fill="${col}"/><path d="M-30,-286 L30,-286 L22,-310 L-18,-312Z" fill="${col}"/><path d="M14,-306 Q60,-340 80,-300" stroke="${col}" stroke-width="6" fill="none"/><path d="M8,-262 L40,-196" stroke="${col}" stroke-width="7"/><path d="M-30,-240 L20,-226 M30,-240 L34,-210" stroke="${col}" stroke-width="12" stroke-linecap="round"/></g>`;
      rim += fig('#ffdca0').replace(`translate(${f(p[0])},${f(p[1])})`, `translate(${f(p[0])},${f(p[1] - 1.6)})`); dark += fig('#1a1218');
    }
    return `<g opacity="0.95">${rim}</g><g filter="url(#silhS)">${dark}</g>`;
  };

  // ======================================================= 5. OUTGATE
  // (the turn to follow them is spread over two and a half seconds, so the wall's crenels never strobe as it pans)
  const ogCam = SH.CAM3([
    [19.5, [-165, 210, -1600, 1, 5.6, 1150]],
    [19.9, [-160, 225, -1500, 2, 6, 1150]],
    [20.4, [-155, 260, -1420, 6, 6.6, 1130]],
    [21.2, [-147, 360, -1310, 40, 7.5, 1100]],
    [22.0, [-138, 500, -1235, 100, 8, 1070]],
    [22.65, [-130, 630, -1195, 150, 7, 1050]],
    [23.1, [-124, 710, -1180, 168, 6, 1050]]
  ], 0.8, 5);
  const OGK = [
    { mk: () => Q.kids[3], s0: 1300, h: 117 }, { mk: () => Q.kids[7], s0: 1050, h: 121 }, { mk: () => Q.kids[1], s0: 820, h: 126 },
    { mk: () => Q.kids[5], s0: 560, h: 116 }, { mk: () => Q.kids[0], art: () => Q.kidArt[0], s0: 330, h: 122 }, { mk: () => Q.kids[6], s0: 80, h: 118 }
  ];
  X.shot('OUTGATE', 19.9, 22.95, t => {
    SH.still();
    const cam = ogCam(t), back = ss(50, 130, cam.yaw), A = [];
    OGK.forEach((K, i) => {
      const s = K.s0 + 175 * (t - 19.9), q = TR.pathAt(Math.max(0, s)), side = (i % 2 ? 1 : -1) * 45, x = q.x + q.dir[1] * side, z = q.z - q.dir[0] * side, y0 = gh(x, z);
      const st = SH.at(cam, x, z, K.h, 'kid', y0); if (!st) return;
      const far = 1 - ss(7600, 9200, st.d); if (far <= 0) return;   // far up the path they thin into the glare
      const sk = SH.skip(t, i * 0.41, { rate: 2.0, hop: 54, lift: 110 }), idle = SH.idle(t, i * 7);
      const o = { x: st.x, y: st.y + sk.bob * st.s, s: st.s, steps: sk.steps, sway: sk.sway, tilt: 3 * Math.sin(t * 2 + i), blink: idle.blink, armR: sk.armR, armL: sk.armL, face: { mouth: 'smile', cd: -3, lid: 0.45, look: [0, 0.05] } };
      const P = K.mk()(o), L = SH.mixL(LT.out, LT.backlit, back);
      A.push(SH.actor(st, () => { const s2 = SH.draw(P, o, K.art || null, L, '', back < 0.5 ? { cast: [-0.1, -0.35], castOp: 0.25 } : { noCast: 1 }); return far < 0.996 ? `<g opacity="${f(far)}">${s2}</g>` : s2; }));
    });
    const extra = TR.tufts(cam, H3.OUT, cam.x, cam.z - 300, 900, t);
    let g = H3.outside(cam, t, A, { extra, sunX: -0.4 });
    if (back > 0.05) g += `<g opacity="${f(back)}">${SH.procession(cam, t, { s0: 2400, n: 120, t0: 19.9 })}</g>`;
    return g;
  }, { grade: 'gDay' });
  SH.cam.OUTGATE = ogCam;

  // ======================================================= 6. HILL
  const hk = (x, z, dy) => gh(x, z) + dy;
  // (behind the children and well above them, craning up as it drifts after them: nobody passes close under the lens)
  const hillCam = SH.CAM3([
    [22.2, [560, hk(560, -3080, 600), -3080, 159, -9, 1050]],
    [22.4, [600, hk(600, -3190, 650), -3190, 160, -10, 1050]],
    [23.5, [760, hk(760, -3700, 1200), -3700, 165, -12, 1050]],
    [24.7, [950, hk(950, -4250, 1900), -4250, 175, -14, 1070]],
    [26.2, [1100, hk(1100, -4900, 2700), -4900, 185, -15, 1100]]
  ], 0.6, 6);
  const HK = [{ mk: () => Q.son, art: () => Q.sonArt, ds: 520, h: 118 }, { mk: () => Q.kids[2], ds: 760, h: 124 }, { mk: () => Q.kids[4], ds: 980, h: 120 }, { mk: () => Q.kids[3], ds: 1240, h: 117 }];
  X.shot('HILL', 22.4, 25.95, t => {
    SH.still();
    const cam = hillCam(t), A = [];
    HK.forEach((K, i) => {
      const s = 3900 + K.ds + 120 * (t - 22.4), q = TR.pathAt(s), side = (i % 2 ? 1 : -1) * 40, x = q.x + q.dir[1] * side, z = q.z - q.dir[0] * side;
      const st = SH.at(cam, x, z, K.h, 'kid', gh(x, z)); if (!st) return;
      const sk = SH.skip(t, i * 0.53, { rate: 1.9, hop: 56, lift: 112 });
      const o = { x: st.x, y: st.y + sk.bob * st.s, s: st.s, steps: sk.steps, sway: sk.sway, armR: sk.armR, armL: sk.armL, face: { mouth: 'smile', lid: 0.45 } };
      const P = K.mk()(o);
      A.push(SH.actor(st, () => SH.draw(P, o, K.art || null, LT.backlit, '', { noCast: 1 })));
    });
    const extra = TR.tufts(cam, H3.OUT, cam.x, cam.z - 500, 900, t, { dens: 0.5 });
    let g = H3.outside(cam, t, A, { extra, sunX: -0.4, env: { hazeD: 22000 } });
    g += SH.procession(cam, t, { s0: 5400, n: 130, t0: 22.4 });
    return g;
  }, { grade: 'gDay' });
  SH.cam.HILL = hillCam;

  // ======================================================= 7. TOP
  const S_TOP = TR.pathLen - 250;
  const topCam = SH.CAM3([
    [25.4, [-2702, hk(-2702, -23920, 118), -23920, 8.3, -2.2, 1150]],
    [25.6, [-2700, hk(-2700, -23900, 120), -23900, 8, -2, 1150]],
    [26.9, [-2690, hk(-2690, -23800, 130), -23800, 6, -1, 1250]],
    [27.9, [-2660, hk(-2660, -23700, 150), -23700, 4, 0, 1500]],
    [28.7, [-2652, hk(-2652, -23850, 330), -23850, 6, -9, 1300]],
    [29.6, [-2610, hk(-2610, -24300, 900), -24300, 8, -22, 1150]],
    [31.7, [-2545, hk(-2545, -25750, 2900), -25750, 10, -37, 1100]]
  ], 0.7, 7);
  X.shot('TOP', 25.6, 31.45, t => {
    SH.still();
    const cam = topCam(t), A = [];
    // you: up the last of the path, then still
    const climb = ss(25.6, 27.05, t), s = lerp(S_TOP - 1300, S_TOP, climb), q = TR.pathAt(s), x = q.x, z = q.z;
    const st = SH.at(cam, x, z, 166, 'woman', gh(x, z));
    if (st) {
      const rn = SH.run(t, { rate: 1.5, bob: 40 }), mv = 1 - ss(26.8, 27.2, t);
      const listen = ss(27.0, 27.5, t), dread = ss(28.1, 28.6, t), numb = ss(28.9, 29.5, t);
      const o = { x: st.x, y: st.y + rn.bob * st.s * mv, s: st.s, sway: rn.sway * 0.6 * mv + X.noise(t * 0.6, 3) * 0.6, breath: Q.breath(t * 2.6) * lerp(2.2, 1.0, numb), blink: Q.blink(t, 9) * (1 - dread),
        tilt: lerp(-4, 3, listen) - 3 * dread * Math.sin(t * 3),
        armR: { hand: [lerp(-120, -150, listen), lerp(-950, -330, listen)], dir: [0.3, 1], pose: mv > 0.5 ? 'fist' : 'relaxed' }, armL: { hand: [lerp(80, 60, listen), lerp(-1000, -1010, listen)], dir: [-0.3, 1], pose: 'relaxed', facing: 'palm' } };
      o.face = { expr: 'anxious', brows: [-6, 1], lid: 0.2, mouth: 'parted', open: 0.35 * mv + 0.1, look: [0, 0.1] };
      if (listen > 0) o.face = Object.assign(o.face, { brows: [lerp(-6, -9, listen), -2], lid: lerp(0.2, 0.04, listen), mouth: 'parted', open: 0.12, look: [0.2 * Math.sin(t * 2.4) * (1 - numb), lerp(0.1, -0.4, listen)] });
      if (dread > 0) o.face = Object.assign(o.face, { look: [lerp(o.face.look[0], 0.9 * Math.sin(t * 1.6), dread * (1 - numb)), -0.2], brows: [-10, 3], tears: numb * 0.8 });
      if (numb > 0) o.face = Object.assign(o.face, { expr: 'grief', lid: lerp(0.04, 0.38, numb), mouth: 'cry', open: 0.2 });
      const P = Q.mother(o);
      A.push(SH.actor(st, () => SH.draw(P, o, null, LT.out, '', { cast: [-0.1, -0.35], castOp: 0.26 })));
    }
    // the bare top: a hawthorn, a grey stone, the grass leaning in the wind
    A.push(TR.tree(cam, H3.OUT, -3100, -24500, { h: 620, col: '#4a5a30', seed: 33, sunX: -0.6 }), TR.rock(cam, H3.OUT, -2300, -24600, { w: 160, h: 90 }), TR.rock(cam, H3.OUT, -2950, -23900, { w: 70, h: 40 }));
    const extra = TR.tufts(cam, H3.OUT, -2650, -23950, 900, t * 1.6, { dens: 0.55 });
    return H3.outside(cam, t, A.filter(Boolean), { extra, sunX: -0.6, town: ss(260, 560, cam.y - gh(cam.x, cam.z)) });
  }, { grade: 'gDay' });
  SH.cam.TOP = topCam;
})(window);
