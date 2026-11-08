// "The Leech Collector" (10 s sample): the swamp -> peeling one off -> the doctor's counter -> loops back into the swamp.
// VO (trimmed): "You wade into a freezing swamp... and wait. | Within minutes, leeches latch onto your bare legs. |
//               You peel them off, | sell them to the doctor... | and tomorrow," -> loops to "You wade into..."
(function (G) {
  const X = G.ENG, Q = G.QCAST, S = G.SETS, PR = G.PROPS, C = G.CINE, R = G.RIG;
  const { track: TK, ss, clamp, lerp, EZ } = X;
  const { f } = R;
  const TAU = Math.PI * 2;
  // ---- helper header (as in shots_e.js)
  const env = (t, a, b, c, d) => ss(a, b, t) * (1 - ss(c, d, t));
  const bump = (t, t0, a = 1, len = 0.35) => (t < t0 || t > t0 + len) ? 0 : a * Math.pow(Math.sin(Math.PI * (t - t0) / len), 2);
  const idle = (t, seed, amp = 1) => ({ blink: Q.blink(t, seed), breath: Q.breath(t * 1.1 + seed) * 0.6, sway: X.noise(t * 0.45, seed) * 0.5 * amp });
  const hh = (c, t, amp = 1, seed = 0) => { const h = X.hand(t, amp, seed); return (X.CAM = [c[0] + h[0], c[1] + h[1], c[2], (c[3] || 0) + h[2]]); };
  const scr = (w, c, p = 1) => { const [cx, cy, z] = c, zp = Math.pow(z, p), px = 540 + (cx - 540) * p, py = 960 + (cy - 960) * p; return [540 + (w[0] - px) * zp, 960 + (w[1] - py) * zp]; };
  const lit = X.lit;
  const nrm = v => { const n = Math.hypot(v[0], v[1]) || 1; return [v[0] / n, v[1] / n]; };
  const L2 = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
  const HAND = { you: 110, doctor: 125.3 };
  const gripAt = (o, who, Gw, dW, extra = {}) => { const dl = nrm(R.dirLocal(o, dW)), gl = R.toLocal(o, Gw), gy = 0.33 * HAND[who]; return Object.assign({ hand: [gl[0] - dl[0] * gy, gl[1] - dl[1] * gy], dir: dl, pose: 'grip', facing: 'back' }, extra); };
  const gripPt = (o, who, side, arm, px, py = 0) => { const d = nrm(arm.dir), t = (side === 'R' ? -1 : 1) * (arm.facing === 'palm' ? 1 : -1), gy = 0.33 * HAND[who]; return R.toWorld(o, [arm.hand[0] + d[1] * t * px + d[0] * (gy + py), arm.hand[1] - d[0] * t * px + d[1] * (gy + py)]); };
  const armsOver = (p, L, which = 'RL') => C.lit({ svg: (which.includes('R') ? p.armRsvg : '') + (which.includes('L') ? p.armLsvg : ''), info: p.info }, Object.assign({ view: X.viewRect(1) }, L)).body;
  // camera = a position track [x, y, roll] plus its own zoom track, so a zoom dip never kinks the travel
  const CAM = (pk, zk) => { const P = TK(pk), Z = TK(zk); return t => { const p = P(t); return [p[0], p[1], Z(t), p[2]]; }; };
  const lerpPts = (a, b, k) => a.map((p, i) => L2(p, b[i], k));
  const L8 = {
    swamp: { from: [-0.7, -0.7], shadow: '#2a323c', shadowOp: 0.5, floor: '#3a4038', floorOp: 0.35, contactOp: 0.12, key: '#e8eef4', keyAdd: 0.05, rims: [{ from: [1, -0.35], col: '#f2dcc4', w: 6, op: 0.5 }], face: { col: '#f4f2ee', op: 0.12 } },
    shop: { from: [0.85, -0.35], shadow: '#1c120c', shadowOp: 0.6, floor: '#2a1c14', floorOp: 0.4, contactOp: 0, key: '#ffc890', keyAdd: 0.1, rims: [{ from: [-1, -0.5], col: '#b4c6dc', w: 6, op: 0.45 }, { from: [1, -0.25], col: '#ffb46a', w: 6, op: 0.5 }], face: { col: '#ffd8a8', op: 0.2 } },
  };
  const SKIN = '#d9a888', SLEEVE = '#766c56';

  // ======================================================= M  the swamp (0 - 6.75; also drawn at t < 0 as the loop landing)
  // crane down out of the misty sky onto you stepping in deeper; you blow into your hands, wait; the camera cranes down
  // to the waterline where the leeches swim in out of the murk and latch onto your shins one by one
  const M = {};
  {
    const YS = 0.66, WY = 1530;
    const yX = TK([[-0.7, 468], [0.95, 520, 'sine']]), yY = TK([[-0.7, 1604], [0.95, 1660, 'sine']]);
    const cam = CAM(
      [[-0.7, [610, 330, 0]], [1.1, [505, 1130, 0], 'io'], [2.2, [500, 1010, 0], 'sine'], [3.2, [506, 880, -2], 'sine'], [4.2, [518, 1548, 0], 'io'], [6.2, [512, 1560, 1.5], 'sine'], [6.75, [514, 1570, 0], 'sine']],
      [[-0.7, 0.74], [1.1, 1.12, 'io'], [2.2, 1.6, 'sine'], [3.2, 2.35, 'sine'], [3.7, 1.8, 'sine'], [4.2, 2.4, 'sine'], [6.2, 3.0, 'sine'], [6.75, 3.5, 'in2']]);
    // [leg-local attach point, hang angle, latch time, length, width, start offset from the attach point, phase]
    // all just under the waterline (local y -197) so they stay readable through the murk
    const LEECH = [
      [[30, -150], 96, 4.55, 50, 13, [230, 70], 0.3], [[-72, -178], 84, 4.85, 46, 12, [-250, 50], 1.7], [[76, -120], 100, 5.15, 48, 13, [200, 120], 2.9],
      [[-34, -132], 78, 5.45, 52, 14, [-220, 100], 4.1], [[54, -186], 90, 5.72, 42, 12, [260, 30], 5.3], [[-64, -104], 104, 5.98, 48, 13, [-180, 140], 0.9],
    ];
    const SWIM = 1.25;
    const body = t => {
      const step = Math.pow(Math.sin(Math.PI * clamp((t + 0.7) / 1.6) * 3), 2) * (1 - ss(0.6, 0.95, t));
      const shiver = Math.sin(t * TAU * 4.2) * 0.22 * ss(1.0, 1.5, t);
      const flinch = LEECH.reduce((a, L, i) => a + bump(t, L[2], i % 2 ? -1.1 : 1.1, 0.32), 0);
      return Object.assign(idle(t, 1), { x: yX(t), y: yY(t) - step * 9, s: YS, sway: X.noise(t * 0.45, 1) * 0.4 + shiver + flinch, tilt: Math.sin(t * TAU * 4.2 + 1) * 0.6 * ss(1.0, 1.5, t) - 4 * ss(2.4, 2.9, t) });
    };
    // the leeches: swim in along a curve out of the murk, then swing down and hang from the shin, swelling slowly
    const leechPts = (t, o, L) => {
      const [lp, ang, tl, len, , off, ph] = L, A = R.toWorld(o, lp), t0 = tl - SWIM;
      if (t < t0) return null;
      const S0 = [A[0] + off[0], A[1] + off[1]], Cc = [A[0] + off[0] * 0.35, A[1] + off[1] * 1.2 + 30];
      const u = EZ.out2(clamp((t - t0) / SWIM)), q = (a, b, c) => (1 - u) * (1 - u) * a + 2 * u * (1 - u) * b + u * u * c;
      const head = [q(S0[0], Cc[0], A[0]), q(S0[1], Cc[1], A[1])];
      const tu = [2 * (1 - u) * (Cc[0] - S0[0]) + 2 * u * (A[0] - Cc[0]), 2 * (1 - u) * (Cc[1] - S0[1]) + 2 * u * (A[1] - Cc[1])];
      const heading = Math.atan2(tu[1], tu[0]) * 180 / Math.PI;
      const swim = PR.leechSwimPts(head[0], head[1], len, heading, t, ph), hang = PR.leechHangPts(A[0], A[1], len * 0.92, ang, t, ph, 0.3);
      return { pts: lerpPts(swim, hang, EZ.io(clamp((t - tl) / 0.4))), op: ss(t0, t0 + 0.35, t), fat: 0.4 * ss(tl, tl + 1.8, t) };
    };
    M.leech = (t, i) => { const o = body(t), r = leechPts(t, o, LEECH[i]); return r ? r.pts[6] : R.toWorld(o, LEECH[i][0]); };
    M.cam = cam;
    // breath vapour: puffs from the mouth on each exhale (the blows into his hands are the strongest)
    const PUFFS = [[-0.6, 0.9, 0.6], [0.5, 0.9, 0.7], [1.45, 0.75, 1.0], [1.95, 0.75, 1.0], [2.6, 1.0, 0.8], [3.5, 1.0, 0.6]];
    const vapour = (m, t) => {
      let g = '';
      for (const [t0, d, k] of PUFFS) {
        const u = (t - t0) / d; if (u <= 0 || u >= 1) continue;
        for (let i = 0; i < 5; i++) { const v = clamp(u * 1.15 - i * 0.04); g += `<ellipse cx="${f(m[0] + (i % 2 ? 1 : -0.7) * v * (30 + i * 14) + 6)}" cy="${f(m[1] - 8 - v * (50 + i * 22))}" rx="${f(10 + v * (34 + i * 6))}" ry="${f(8 + v * (24 + i * 5))}" fill="#eef0f0" opacity="${f(0.3 * k * Math.sin(Math.PI * u) * (1 - i * 0.13))}" filter="url(#b8)"/>`; }
      }
      return g;
    };
    const fn = t => {
      const c = hh(cam(t), t, 0.4, 1), L = L8.swamp, set = S.swamp(t, { waterY: WY });
      const o = body(t);
      // hands: at the sides while stepping in, cupped at the mouth (blowing on them), then rubbing at the chest
      const a = EZ.io(clamp((t - 0.95) / 0.4)), b = EZ.io(clamp((t - 2.25) / 0.45)), rub = Math.sin(t * TAU * 2.2) * 14 * ss(2.6, 2.9, t);
      const hR = L2(L2([-190, -640], [-40, -1140], a), [-34 + rub, -930], b), hL = L2(L2([190, -640], [42, -1135], a), [34 + rub, -925], b);
      const dR = nrm(L2(L2([0.15, 1], [0.32, -1], a), [1, -0.15], b)), dL = nrm(L2(L2([-0.15, 1], [-0.32, -1], a), [-1, -0.15], b));
      const pose = a < 0.5 ? 'relaxed' : 'open';
      const face = {
        expr: 'anxious', mouth: t > 1.42 && t < 2.24 ? 'parted' : 'tight', open: 0.07,
        lid: TK([[0, 0.38], [1.1, 0.28], [1.5, 0.55], [2.25, 0.5], [2.7, 0.42]])(t), brows: TK([[0, [-4, 1]], [1.15, [-12, 4]], [2.7, [-14, 5]]])(t),
        look: TK([[0, [0.05, 0.35]], [1.1, [0.1, 0.05]], [1.5, [0.05, -0.05]], [2.3, [0.05, -0.05]], [2.75, [0.08, 0.75]]])(t),
      };
      const you = Q.you(Object.assign(o, { face, armR: { hand: hR, dir: dR, pose, facing: 'back' }, armL: { hand: hL, dir: dL, pose, facing: 'back' } }));
      const mouth = R.toWorld(o, R.headPt(o, 'man', [6, 100]));
      let lee = '';
      LEECH.forEach((Lc, i) => { const r = leechPts(t, o, Lc); if (r) lee += PR.leech(r.pts, Lc[4], { fat: r.fat, op: r.op }); });
      // in front: murky water tint over the submerged legs, the bright waterline, rings around the shins, stepping splashes
      const legX = [R.toWorld(o, [-54, 0])[0], R.toWorld(o, [54, 0])[0]];
      let front = `<defs><linearGradient id="mwT" gradientUnits="userSpaceOnUse" x1="0" y1="${WY}" x2="0" y2="${WY + 300}"><stop offset="0" stop-color="#2a3a26" stop-opacity="0.2"/><stop offset="0.3" stop-color="#202c1c" stop-opacity="0.55"/><stop offset="0.7" stop-color="#141c12" stop-opacity="0.9"/></linearGradient></defs><rect x="-1500" y="${WY}" width="4200" height="2400" fill="url(#mwT)"/>`;
      let wl = `M-1500,${WY}`; for (let x = -1500; x <= 2700; x += 40) wl += ` L${x},${f(WY + Math.sin(x * 0.012 + t * 2.2) * 2.5)}`;
      front += `<path d="${wl}" stroke="#d6e0d4" stroke-width="2.5" fill="none" opacity="0.5"/>`;
      for (const lx of legX) for (let k = 0; k < 3; k++) { const ph = ((t * 0.7 + k / 3) % 1 + 1) % 1; front += `<ellipse cx="${f(lx)}" cy="${WY + 2}" rx="${f(26 + ph * 90)}" ry="${f(4 + ph * 9)}" fill="none" stroke="#e4ece0" stroke-width="2" opacity="${f(0.55 * (1 - ph))}"/>`; }
      const splash = env(t, -0.15, -0.05, 0.2, 0.55);
      for (let i = 0; i < 12; i++) front += `<circle cx="${f(legX[i % 2] + Math.cos(i * 1.7) * 40 * (1 + splash))}" cy="${f(WY - Math.abs(Math.sin(i * 2.3)) * 50 * splash)}" r="3" fill="#e4ece0" opacity="${f(0.8 * splash)}"/>`;
      const layers = [set.sky, set.far, set.farWater, set.mid, set.water, { p: 1, svg: lit(you, L) + lee + vapour(mouth, t), chars: true }, { p: 1, svg: front }, set.lowMist, set.fg];
      return X.compose(layers, c);
    };
    X.shot('M', 0, 6.75, fn, { grade: 'gNight' });
  }

  // ======================================================= P  close-up: peeling one off (6.25 - 7.75)
  // no body in frame: his bare lower leg (side view, continuing up past the top of frame) and his hand reaching in.
  const P = {};
  {
    const LS = 2.0, A = [520, 1560], GY = A[1] + 150 * LS, HS = 400;
    const lp = p => [A[0] + p[0] * LS, A[1] + p[1] * LS];
    // [leg-local attach point, hang angle, length, width, phase]; K[0] is the one he peels
    const K = [[[-20, -470], 96, 270, 46, 0.4], [[-96, -680], 84, 160, 40, 1.9], [[20, -250], 104, 170, 42, 3.1], [[-80, -330], 78, 150, 38, 4.4]];
    const cam = CAM([[6.25, [560, 960, 0]], [7.0, [580, 900, 0], 'sine'], [7.75, [610, 620, 0], 'in2']], [[6.25, 1.0], [7.0, 1.12, 'sine'], [7.75, 1.2, 'in2']]);
    const T_GRIP = 6.78, T_POP = 7.02, GRIP_AT = 70;
    const anc = lp(K[0][0]), hd = [Math.cos(K[0][1] * Math.PI / 180), Math.sin(K[0][1] * Math.PI / 180)], g0 = [anc[0] + hd[0] * GRIP_AT, anc[1] + hd[1] * GRIP_AT];
    const slot = TK([[6.25, [1060, 330]], [T_GRIP, g0, 'out2'], [6.86, [g0[0] + 4, g0[1] + 4], 'sine'], [T_POP, [g0[0] + 190, g0[1] + 30], 'in2'], [7.75, [g0[0] + 300, g0[1] - 700], 'in2']]);
    P.cam = cam; P.leech = () => lp([K[0][0][0], K[0][0][1] + 80]);
    const fn = t => {
      const c = hh(cam(t), t, 0.3, 7), L = L8.swamp, bk = S.swampBack(t, GY);
      // the leg, extended upward past the knee so its end never shows, with the wet sheen
      // (drawn over legClose's flat top edge with the same horizontal gradient, so the seam never shows)
      const legUp = `<defs><linearGradient id="lgUp" gradientUnits="userSpaceOnUse" x1="-170" y1="0" x2="320" y2="0"><stop offset="0" stop-color="${R.shade(SKIN, -0.3)}"/><stop offset="0.35" stop-color="${R.shade(SKIN, 0.08)}"/><stop offset="0.7" stop-color="${SKIN}"/><stop offset="1" stop-color="${R.shade(SKIN, -0.35)}"/></linearGradient></defs>` +
        `<path d="M-150.5,-880 C-152,-1100 -160,-1500 -168,-1800 L84,-1800 C76,-1500 66,-1100 60.2,-880Z" fill="url(#lgUp)"/><path d="M-150.5,-880 C-152,-1100 -160,-1500 -168,-1800 M60.2,-880 C66,-1100 76,-1500 84,-1800" stroke="#1f140c" stroke-width="2" fill="none"/>` +
        `<path d="M-60,-1700 C-50,-1300 -40,-1000 -60,-860" stroke="${R.shade(SKIN, -0.4)}" stroke-width="18" fill="none" opacity="0.25" filter="url(#b8)"/>` +
        `<path d="M-116,-1240 C-120,-1000 -116,-760 -104,-560" stroke="#ffffff" stroke-width="5" fill="none" opacity="0.12" stroke-linecap="round"/><path d="M34,-1100 C38,-900 40,-760 36,-620" stroke="#ffffff" stroke-width="3" fill="none" opacity="0.1" stroke-linecap="round"/>`;
      const leg = `<g transform="translate(${A[0]},${A[1]}) scale(${LS})">${PR.legClose({ skin: SKIN })}${legUp}</g>`;
      // the other leeches, feeding
      let lee = '';
      for (let i = 1; i < K.length; i++) { const [p, ang, len, w, ph] = K[i], a = lp(p); lee += PR.leech(PR.leechHangPts(a[0], a[1], len, ang, t, ph, 0.28), w, { fat: 0.65 }); }
      // the peeled leech: hangs; gripped near its head; stretched; pops off and dangles from the fist
      const s = slot(t), [, ang0, len0, w0, ph0] = K[0];
      let pts;
      if (t < T_GRIP) pts = PR.leechHangPts(anc[0], anc[1], len0, ang0, t, ph0, 0.28);
      else {
        const pop = EZ.out2(clamp((t - T_POP) / 0.14)), front = L2(anc, s, pop), wig = t > T_POP ? Math.sin((t - T_POP) * 11) * 14 * (1 - ss(7.3, 7.75, t)) : 0;
        const back = PR.leechHangPts(s[0], s[1], len0 - GRIP_AT, ang0 - 6 * ss(T_GRIP, 7.2, t) + wig, t, ph0, 0.28);
        const fr = []; for (let i = 0; i < 4; i++) fr.push(L2(front, s, i / 4));
        pts = fr.concat(back);
      }
      const stretch = t < T_POP ? clamp((Math.hypot(s[0] - anc[0], s[1] - anc[1]) - GRIP_AT) / 160) : 0;
      lee += PR.leech(pts, w0, { fat: 0.65, stretch });
      // the bite left behind, bleeding
      lee += PR.bite(anc[0], anc[1], 2.2, ss(T_POP, T_POP + 0.6, t));
      // his hand reaching in from the top right (elbow far off-frame); fingers close round the leech's neck
      const dir = nrm(L2([-0.45, 0.9], [-0.22, 1], ss(7.0, 7.6, t))), wrist = PR.wristFor(s, dir, HS);
      const hand = PR.closeArm({ from: [wrist[0] - dir[0] * 900, wrist[1] - dir[1] * 900], wrist, dir, side: 'R', facing: 'back', pose: t < 6.76 ? 'open' : 'grip', size: HS, skin: SKIN, sleeve: SLEEVE });
      // water still running off the skin
      let drip = '';
      for (let i = 0; i < 5; i++) { const ph = ((t * 0.9 + i * 0.23) % 1), x = A[0] + (-120 + i * 34) * LS * 0.5; drip += `<ellipse cx="${f(x)}" cy="${f(A[1] - 700 + ph * 800 + i * 40)}" rx="4" ry="${f(6 + ph * 4)}" fill="#e8f2ee" opacity="${f(0.55 * Math.sin(Math.PI * ph))}"/>`; }
      const layers = [bk.back, bk.ground, { p: 1, svg: leg + lee + drip + hand }];
      return X.compose(layers, c) + C.vignette(0.55, '#05080a', 0.42);
    };
    X.shot('P', 6.25, 7.75, fn, { grade: 'gNight' });
  }

  // ======================================================= D  the doctor's counter (7.15 - 9.70)
  // arrive on the jar of leeches; pull back to the doctor admiring it ("doctor"); he chuckles, drops one coin into your palm;
  // "and tomorrow," your eyes go to the grey window and the camera pushes into your face as the swamp mist takes the frame
  const D = {};
  {
    const CT = 1190, FY = 1700, YX = 330, DX = 790, JX = 925;
    const cam = CAM([[7.15, [925, 1090, 0]], [7.9, [720, 980, 0], 'out2'], [8.55, [600, 960, 0], 'sine'], [9.1, [500, 950, -1], 'sine'], [9.7, [345, 885, -2], 'in2']],
      [[7.15, 2.2], [7.9, 1.5, 'out2'], [8.55, 1.35, 'sine'], [9.1, 1.45, 'sine'], [9.7, 2.3, 'in2']]);
    D.cam = cam;
    const PALM = [518, 1086], DROP = [524, 1026], T_REL = 8.78, T_LAND = 8.92;
    const fn = t => {
      const c = hh(cam(t), t, 0.35, 9), L = L8.shop, set = S.apothecary(t);
      // ---- the doctor
      const chuck = env(t, 7.95, 8.05, 8.3, 8.45);
      const dO = Object.assign(idle(t, 7), { x: DX, y: FY, s: 0.66, tilt: lerp(-6, 0, ss(8.1, 8.5, t)) + Math.sin(t * 22) * 1.2 * chuck });
      // his left hand (screen right) pats the jar of leeches; his right hand rests, then reaches over and drops one coin
      const reach = EZ.io(clamp((t - 8.25) / 0.45)), back = EZ.io(clamp((t - 8.95) / 0.5));
      const rest = [705, 1184], dSlot = L2(L2(rest, DROP, reach), rest, back), dDir = nrm(L2(L2([-1, 0.25], [-0.15, 1], reach), [-1, 0.25], back));
      const coinHeld = t < T_REL;
      const dArmR = gripAt(dO, 'doctor', dSlot, dDir, { pose: reach > 0.5 && t < T_REL + 0.02 ? 'grip' : 'open', hold: reach > 0.5 && coinHeld ? `<g transform="translate(14,6)">${PR.coin(0, 0, 16, 0.4)}</g>` : undefined });
      const pat = bump(t, 7.55, 1, 0.28) + bump(t, 7.85, 1, 0.28);
      const dArmL = gripAt(dO, 'doctor', [JX + 58, 1000 + pat * 10], [-0.45, 0.75], { pose: 'open' });
      const dFace = { expr: 'neutral', mouth: chuck > 0.3 ? 'grin' : 'smile', open: 0.1 * chuck, lid: 0.42 + 0.3 * chuck, look: TK([[7.15, [0.5, 0.55]], [8.15, [0.5, 0.5]], [8.45, [-0.85, 0.15]]])(t), brows: [2, 4] };
      const doc = Q.doctor(Object.assign(dO, { face: dFace, armR: dArmR, armL: dArmL }));
      // ---- you
      const yO = Object.assign(idle(t, 2), { x: YX, y: FY, s: 0.64, lightX: 1, tilt: 2 * ss(8.6, 9.0, t) - 3 * ss(9.0, 9.35, t) });
      const offer = EZ.io(clamp((t - 8.2) / 0.4)), weigh = bump(t, T_LAND, 1, 0.3);
      const ySlot = L2([395, 1186], [PALM[0], PALM[1] + weigh * 10], offer), yDir = nrm(L2([-1, 0.2], [0.85, -0.45], offer));
      const yArmL = gripAt(yO, 'you', ySlot, yDir, { pose: 'open', facing: offer > 0.5 ? 'palm' : 'back' });
      const yArmR = gripAt(yO, 'you', [272, 1186], [1, 0.2], { pose: 'open' });
      const yFace = { expr: 'tired', mouth: 'tight', lid: TK([[7.15, 0.4], [8.6, 0.45], [9.0, 0.5], [9.35, 0.32]])(t), brows: TK([[7.15, [-6, 2]], [9.0, [-9, 3]], [9.4, [-14, 6]]])(t),
        look: TK([[7.15, [0.75, -0.05]], [8.55, [0.75, -0.05]], [8.75, [0.55, 0.45]], [9.05, [0.55, 0.45]], [9.3, [-0.75, -0.2]]])(t) };
      const you = Q.you(Object.assign(yO, { face: yFace, armR: yArmR, armL: yArmL }));
      // ---- the coin: released over your palm, falls, bounces once, then rests in the palm
      let coin = '';
      if (!coinHeld) {
        const from = gripPt(dO, 'doctor', 'R', Object.assign({}, dArmR, { facing: 'back' }), 14, 6), to = gripPt(yO, 'you', 'L', yArmL, 0, 0);
        const u = EZ.in2(clamp((t - T_REL) / (T_LAND - T_REL))), hop = bump(t, T_LAND, 9, 0.16);
        const p = t < T_LAND ? L2(from, to, u) : [to[0], to[1] - hop];
        coin = PR.coin(p[0], p[1], 13, t < T_LAND + 0.16 ? (t - T_REL) * 18 : 0.6);
      }
      const chars = lit(you, L) + lit(doc, L);
      const layers = [set.wall, set.light, { p: 1, svg: chars, chars: true }, { p: 1, svg: S.counter(t, { top: CT, jarX: JX }) + armsOver(you, L, 'RL') + armsOver(doc, L, 'RL') + coin }, { p: 1.25, svg: S.shopFg(t) }];
      return X.compose(layers, c) + C.vignette(0.55, '#080404', 0.42);
    };
    X.shot('D', 7.15, 9.71, fn, { grade: 'gHall' });
    D.face = tt => scr([YX, FY - 1308 * 0.64], cam(tt));
  }

  // ======================================================= transitions (each a different type)
  // swamp -> close-up: zoom-match from a leech on his shin into the big leech on the close-up leg
  X.tr('zmatch', 6.5, 0.5, 'M', 'P', { fa: scr(M.leech(6.5, 0), M.cam(6.5)), fb: scr(P.leech(), P.cam(6.5)), za: 2.4, zb: 2.2, leak: '#7a1a10', leakOp: 0.28, seed: 5 });
  // close-up -> shop: the camera keeps tilting up with the lifted hand and arrives on the leech jar
  X.tr('carry', 7.45, 0.6, 'P', 'D', { mode: 'tilt', dir: [0, -1], dist: 0.42, blur: 16 });
  // loop: "and tomorrow," pushes into your face while the swamp mist dissolves back in to frame 0
  X.tr('organic', X.T_END, 0.62, 'D', 'M', { end: true, bOff: -X.T_END, fa: D.face(9.4), fb: [560, 760], za: 1.14, zb: 0.92, seed: 7, freq: 0.004, soft: 4 });
})(window);
