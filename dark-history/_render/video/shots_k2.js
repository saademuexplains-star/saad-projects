// "The Rabies Boy" part 2: the tenth night, the deadliest dose -> the rabbit dead within a week -> the wait ->
// weeks pass, the fever never comes -> you grow up guarding the gate of the Institute. All transitions, and the loop.
(function (G) {
  const X = G.ENG, Q = G.QCAST, S = G.SETS, PR = G.PROPS, C = G.CINE, R = G.RIG, K = G.SHOTS_K, ST = G.RABIES;
  const { ss, clamp, lerp, EZ } = X;
  const { f, mix, rng } = R;
  const { env, bump, idle, hh, scr, nrm, L2, add, gripAt, armsOver, handsLit, CAM, LT } = K;
  const lit = X.lit, TAU = Math.PI * 2;
  // the camera centre that frames world point w of a layer at depth p
  const onP = (w, p) => [540 + (w[0] - 540) / p, 960 + (w[1] - 960) / p];

  // ======================================================= KENNEL: the tenth night (24.05 - 29.8)
  // "No human has ever been given these shots before, and on the tenth day he gives you the deadliest one of all,"
  {
    const kx = i => -1500 + i * 330 + 150;
    const cam = CAM(
      [[24.05, [...onP([kx(1) - 20, 1380], 0.9), 0]], [26.95, [470, 1060, 0], 'io'], [27.85, [520, 1090, 0], 'io'], [28.75, [500, 1000, -0.6], 'sine'], [29.8, [530, 1130, 0], 'in2']],
      [[24.05, 1.9], [25.3, 1.8, 'sine'], [26.95, 1.42, 'io'], [27.85, 2.15, 'io'], [28.75, 2.5, 'sine'], [29.8, 3.2, 'in2']]);
    ST.kennelCam = cam;
    const youFace = t => { const stab = ss(27.8, 27.95, t), after = ss(28.6, 29.2, t);
      return { expr: stab > 0.5 ? 'grief' : 'anxious', mouth: stab > 0.5 && after < 0.5 ? 'snarl' : 'tight', look: stab > 0.5 ? L2([0.1, 0.3], [-0.75, -0.1], after) : (t < 26.6 ? [-0.6, 0.1] : L2([-0.6, 0.1], [0.55, 0.6], ss(26.6, 27.2, t))), lid: lerp(lerp(0.22, 0.9, stab), 0.42, after), brows: [-12, 3], tears: t > 28.2, sweat: 0.35 }; };
    const momFace = t => { const stab = ss(27.8, 28.0, t); return { expr: 'grief', look: [0.75, 0.42], lid: lerp(0.38, 0.6, stab), mouth: 'tight', brows: [-12, 3], tears: true }; };
    const sciFace = t => ({ expr: 'grim', look: [0.85, 0.5], lid: lerp(0.3, 0.45, ss(27.9, 28.4, t)), mouth: 'tight', brows: [-5, 3] });
    const fn = t => {
      const c = hh(cam(t), t, 0.3, 17);
      let out = ST.labScene(t, c, { night: true, youFace, momFace, sciFace, marks: 9, squeeze: t => bump(t, 27.82, 1, 0.6), youSway: t => -1 * bump(t, 27.84, 1, 0.5), youTilt: t => 2 - 4 * bump(t, 27.84, 1, 0.7), momSway: t => 1.2 * bump(t, 27.9, 1, 0.7) });
      // the gaslight pools warmly on the table
      const tp = scr([470, 1150], c); out += C.radial(tp[0], tp[1], 520 * c[2], '#ff9a40', 0.12, 'screen');
      return out + C.vignette(0.62, '#040306', 0.42);
    };
    X.shot('KENNEL', 24.05, 29.8, fn, { grade: 'gNight' });
    ST.kennelTip = tt => { const s = ST.shot(tt, true); return scr(add(s.tip, [40, -12]), cam(tt)); };
  }

  // ======================================================= RABBIT: dead within a week (29.1 - 32.95)
  // "rabies so powerful it would kill an animal within a week,"
  {
    const RB = [560, 1392], RS = 1.7, CGX = 250, CGY = 1440, CGW = 600, CGH = 560;
    const dayN = t => 7 * ss(29.95, 32.2, t);
    const rabSet = t => {
      const L = [];
      let w = `<rect x="-1400" y="-800" width="3900" height="3600" fill="#5a6456" filter="url(#plaster)"/><rect x="-1400" y="1180" width="3900" height="1400" fill="#6a6a5e"/>`;
      for (let x = -1400; x < 2500; x += 60) w += `<path d="M${x},1180 L${x},2600" stroke="#3a3a32" stroke-width="2"/>`;
      for (let y = 1180; y < 2600; y += 60) w += `<path d="M-1400,${y} L2500,${y}" stroke="#3a3a32" stroke-width="2"/>`;
      w += `<rect x="-1400" y="1166" width="3900" height="16" fill="#2a2a24"/>` + S.gasLamp(-200, 300, 1.4, t, 3, 1) + S.gasLamp(1240, 300, 1.4, t, 6, 1);
      w += `<rect x="-1400" y="-800" width="3900" height="3600" fill="#0a0c14" opacity="0.12" style="mix-blend-mode:multiply"/>`;
      L.push({ p: 0.7, svg: `<g filter="url(#dof1)">${w}</g>` });
      // the neighbouring cages, one rabbit already lying still
      let n = '';
      for (const [x0, y0, sick, col] of [[-520, 1440, 0.1, '#b8a890'], [-520, 860, 0.9, '#efeae2'], [1020, 1440, 0, '#8a7a68'], [1020, 860, 0.4, '#b8a890'], [250, 860, 0.2, '#8a7a68']]) n += PR.cageBack(x0, y0, 560, 520) + PR.rabbit(x0 + 280, y0 - 40, 1.5, t + x0 * 0.01, { sick, col }) + PR.cageFront(x0, y0, 560, 520, '');
      n += `<rect x="-1400" y="-800" width="3900" height="3600" fill="#0a0c14" opacity="0.14" style="mix-blend-mode:multiply"/>`;
      L.push({ p: 0.9, svg: `<g filter="url(#dof1)">${n}</g>` });
      L.push({ p: 1, svg: `<rect x="-1400" y="${CGY}" width="3900" height="40" fill="#4a3420" filter="url(#woodH)"/><rect x="-1400" y="${CGY + 40}" width="3900" height="1400" fill="#24180e"/><rect x="-1400" y="${CGY + 40}" width="3900" height="40" fill="#000" opacity="0.35" filter="url(#b8)"/>` });
      L.push({ p: 1.02, light: true, svg: C.radial(260, 520, 1100, '#ffcf80', 0.2, 'screen') + S.dust(560, 1000, 700, 600, 30, 71, t, '#ffe8c0', 2.2, 0.4) });
      return L;
    };
    // the slate on the cage: one chalk stroke per day, the fifth across the first four
    const tally = (t, x, y) => {
      const dn = dayN(t);
      let g = `<rect x="${x - 8}" y="${y - 70}" width="16" height="10" fill="#3a3a3a"/><rect x="${x - 90}" y="${y - 60}" width="180" height="120" rx="6" fill="#20262a" stroke="#6a4a2a" stroke-width="7"/>`;
      for (let k = 0; k < 7; k++) {
        const p = clamp((dn - k) * 3); if (p <= 0) continue;
        const [x0, y0, x1, y1] = k < 4 ? [x - 66 + k * 22, y - 34, x - 62 + k * 22, y + 30] : k === 4 ? [x - 80, y + 18, x + 4, y - 22] : [x + 30 + (k - 5) * 24, y - 34, x + 34 + (k - 5) * 24, y + 30];
        g += `<path d="M${x0},${y0} L${f(lerp(x0, x1, p))},${f(lerp(y0, y1, p))}" stroke="#ece8de" stroke-width="7" stroke-linecap="round" opacity="0.9"/>`;
      }
      return g;
    };
    const cage = t => {
      const sick = ss(30.1, 31.9, t), fallR = EZ.io(ss(31.95, 32.5, t));
      let g = PR.cageBack(CGX, CGY, CGW, CGH);
      // the water dish (untouched) and wilting cabbage leaves
      g += `<ellipse cx="${CGX + 480}" cy="${CGY - 34}" rx="54" ry="13" fill="#9aa0a4" stroke="#4a4e52" stroke-width="2"/><ellipse cx="${CGX + 480}" cy="${CGY - 37}" rx="44" ry="8" fill="#b8d0dc" opacity="0.7"/>`;
      g += `<path d="M${CGX + 90},${CGY - 30} c20,-40 70,-40 80,0 Z" fill="${mix('#7a9a4a', '#8a8a4a', sick)}" stroke="#3a4a1a" stroke-width="2"/>`;
      g += PR.rabbit(RB[0], RB[1], RS, t, { sick, dead: fallR, twitch: env(t, 31.2, 31.45, 31.9, 32.1) * 0.7, col: '#d8d0c4' });
      g += PR.cageFront(CGX, CGY, CGW, CGH, 'moelle 1 j.') + tally(t, CGX + CGW - 120, CGY - CGH + 120);
      return g;
    };
    const EYE = [RB[0] - 57 * RS, RB[1] - 102 * RS];
    const cam = CAM([[29.1, [520, 1160, 0]], [31.0, [505, 1170, -0.6], 'sine'], [32.95, [480, 1180, 0.4], 'sine']], [[29.1, 1.6], [31.0, 1.8, 'sine'], [32.95, 2.1, 'sine']]);
    ST.rabbitEye = tt => scr(EYE, cam(tt));
    // where the eye lies once the rabbit has slumped dead (head lowered, body flattened)
    ST.rabbitDeadEye = tt => scr([429, 1329], cam(tt));
    const fn = t => {
      const c = hh(cam(t), t, 0.25, 19);
      return X.compose(X.stage(rabSet(t), cage(t)), c) + C.vignette(0.6, '#040306', 0.42);
    };
    X.shot('RABBIT', 29.1, 33.0, fn, { grade: 'gNight' });
  }

  // ======================================================= NIGHT: the wait, the weeks, the morning (32.15 - 37.75)
  // "and then all you can do is wait. The days turn into weeks, the fever never comes,"
  {
    const RM = S.ROOM, YS = 0.9, YOU0 = [500, 1781], MOM0 = [820, 2080], MS = 0.86;
    const YOU_FACE = R.toWorld({ x: YOU0[0], y: YOU0[1], s: YS }, [0, -712]);
    const LTR = { from: [0.8, -0.4], shadow: '#0c0a10', shadowOp: 0.45, floor: '#1a120a', floorOp: 0.3, contactOp: 0.4, key: '#ffd8a8', keyAdd: 0.06, rims: [{ from: [1, -0.2], col: '#ffb060', w: 6, op: 0.5 }, { from: [-1, -0.5], col: '#a0b4dc', w: 4, op: 0.3 }], face: { col: '#ffd8b0', op: 0.12 } };
    const TL = t => clamp((t - 34.6) / 1.4);
    const nightOf = t => { const u = TL(t); return u <= 0 ? 1 : u >= 1 ? 0 : 0.5 + 0.5 * Math.cos(TAU * 1.5 * u); };
    const dawnOf = t => ss(35.75, 36.4, t);
    // open close on your eye, wide awake in the dark (the dead rabbit's shut eye dissolves into it), then ease back
    const EYE = R.toWorld({ x: YOU0[0], y: YOU0[1], s: YS }, R.headPt({ tilt: -4 }, 'kid', [-28, 8]));
    const cam = CAM(
      [[32.1, [EYE[0] + 12, EYE[1] + 10, 0]], [33.3, [505, 1158, 0], 'out2'], [34.45, [505, 1150, -0.6], 'sine'], [35.35, [790, 1000, 0], 'io'], [36.05, [770, 1010, 0.4], 'sine'], [36.75, [600, 1230, 0], 'io'], [37.75, [505, 1140, 0], 'sine']],
      [[32.1, 3.3], [33.3, 2.5, 'out2'], [34.45, 2.7, 'sine'], [35.35, 1.25, 'io'], [36.05, 1.3, 'sine'], [36.75, 1.9, 'io'], [37.75, 2.7, 'sine']]);
    ST.nightCam = cam;
    ST.nightFace = tt => scr(YOU_FACE, cam(tt));
    ST.nightEye = tt => scr(EYE, cam(tt));
    const fn = t => {
      const c = hh(cam(t), t, 0.25, 23), nt = nightOf(t), dw = dawnOf(t), u = TL(t);
      const days = 21 * EZ.io(u), flip = u > 0 && u < 1 ? days % 1 : 0;
      const set = S.room(t, { night: nt, dawn: dw, days, flip, sunX: 240 * u });
      // you, propped on the pillows: awake in the dark, asleep through the weeks, awake in the morning sun
      const yo = Object.assign(idle(t, 29, 0.3), { x: YOU0[0], y: YOU0[1] - 14 * ss(36.1, 36.6, t), s: YS });
      const asleep = env(t, 34.8, 35.0, 35.9, 36.15);
      const yLook = t < 33.5 ? [0.1, -0.55] : t < 34.3 ? L2([0.1, -0.55], [0.9, 0.3], ss(33.5, 33.8, t)) : L2([0.9, 0.3], [0.1, -0.4], ss(34.3, 34.6, t));
      const yFace = t < 36.1 ? { expr: 'anxious', look: yLook, lid: lerp(0.25, 1, asleep), mouth: 'closed', brows: [-8, 2], sweat: 0.15 }
        : { expr: 'neutral', look: t < 36.55 ? L2([0.1, -0.4], [0.9, 0.3], ss(36.25, 36.5, t)) : L2([0.9, 0.3], [0.8, -0.2], ss(36.75, 37.0, t)), lid: lerp(1, 0.2, ss(36.1, 36.3, t)), mouth: t > 36.9 ? 'smile' : 'closed', brows: [lerp(-6, 2, ss(36.4, 37, t)), 0] };
      const Y = Q.you(Object.assign(yo, { outfit: 'night', noLegs: true, tilt: lerp(-4, -8, asleep) + 4 * ss(36.2, 36.7, t), face: yFace,
        armR: { hand: R.toLocal(yo, [410, 1388]), dir: nrm(R.dirLocal(yo, [0.15, 1])), pose: 'relaxed', facing: 'back', detachHand: true },
        armL: { hand: R.toLocal(yo, [690, 1390]), dir: nrm(R.dirLocal(yo, [-0.2, 1])), pose: 'relaxed', facing: 'back', detachHand: true } }));
      // your mother sitting on the edge of the bed: head bowed in prayer through the nights; in the morning she looks up
      // and lays her hand on yours
      const mo = Object.assign(idle(t, 31, 0.3), { x: MOM0[0], y: MOM0[1], s: MS });
      const wake = ss(36.15, 36.5, t), reach = EZ.io(ss(36.35, 36.85, t));
      const M = Q.mother(Object.assign(mo, { tilt: lerp(-12, -4, wake), face: { expr: wake > 0.5 ? 'grief' : 'tired', look: L2([-0.4, 0.8], [-0.8, 0.2], wake), lid: lerp(1, 0.35, wake), mouth: t > 36.95 ? 'smile' : 'closed', brows: [-8, 3], tears: wake > 0.5 },
        armR: { hand: R.toLocal(mo, L2([778, 1370], [698, 1382], reach)), dir: nrm(R.dirLocal(mo, L2([0.4, 1], [-0.3, 1], reach))), pose: 'relaxed', facing: 'back', detachHand: true },
        armL: { hand: R.toLocal(mo, [872, 1372]), dir: nrm(R.dirLocal(mo, [-0.5, 1])), pose: 'relaxed', facing: 'back', detachHand: true } }));
      const clip = `<defs><clipPath id="rmQ"><rect x="-2000" y="-2000" width="6000" height="${RM.QUILT + 30 + 2000}"/></clipPath></defs>`;
      const chars = clip + S.roomBedBack() + `<g clip-path="url(#rmQ)">${lit(Y, LTR)}</g>` + S.roomQuilt(t) + `<g clip-path="url(#rmQ)">${lit(M, LTR)}</g>` + armsOver(Y, LTR) + handsLit(Y, LTR) + armsOver(M, LTR) + handsLit(M, LTR) +
        S.roomBedFront(t, { candle: lerp(1, 0.32, EZ.io(u)), lit: t < 36.3, candleGlow: Math.max(0.15, nt) });
      let out = X.compose(X.stage(set, chars), c);
      out += `<rect width="1080" height="1920" fill="#0a0e1e" opacity="${f(0.22 * nt * (1 - dw))}" style="mix-blend-mode:multiply"/>`;
      if (dw > 0) { const fp = scr(YOU_FACE, c); out += C.radial(fp[0] - 120, fp[1] - 80, 700, '#ffd890', 0.16 * dw, 'screen'); }
      return out + C.vignette(0.58, '#040306', 0.42);
    };
    X.shot('NIGHT', 32.1, 37.75, fn, { grade: 'gDusk' });
  }

  // ======================================================= GATE: you grow up guarding his gate (36.85 - end)
  // "and you grow up spending your life guarding the gate of the first man ever to save a human from rabies."
  {
    const GT = S.GATE, GK = 1.6, AS = 0.6, ADULT = [420, GT.FY];
    // the gate is drawn 1.6x about its base so it stands well above a man
    const gateG = (t, o) => `<g transform="translate(540,${GT.FY}) scale(${GK}) translate(-540,${-GT.FY})">${S.gate(t, o)}</g>`;
    const SPEAR = [540, GT.FY + (GT.TOP - 30 - 24 - 14 - GT.FY) * GK];   // the gilded tip at the middle of the left leaf
    ST.SPEAR = SPEAR;
    const FACE = R.toWorld({ x: ADULT[0], y: ADULT[1], s: AS }, [0, -1300]);
    const LTG = { from: [0.7, -0.7], shadow: '#2a1c10', shadowOp: 0.4, floor: '#4a3a20', floorOp: 0.28, contactOp: 0.4, key: '#fff2d8', keyAdd: 0.07, rims: [{ from: [1, -0.4], col: '#ffe0a0', w: 6, op: 0.5 }, { from: [-1, -0.3], col: '#c8d8ec', w: 4, op: 0.25 }], face: { col: '#fff0d8', op: 0.1 } };
    // on the building layer (p 0.6): the open window where the old scientist stands, and the gilded spire on the roof
    const WP = 0.6, WIN = [130, 440, 330, 790], SPIRE = [540, -250], SCI_W = [236, 1139], SCI_WS = 0.42;
    // pull straight back from your face to the man at the gate while the years roll past him (autumn, snow, blossom, his
    // moustache greying); crane up to the window where the scientist looks down and nods to you; rise past the name over
    // the door to the gilded spire and dive into its point
    const cam = CAM(
      [[36.85, [FACE[0] + 10, FACE[1] + 6, 0]], [38.5, [480, 1030, 0], 'sine'], [38.95, [472, 1010, 0], 'sine'], [40.05, [262, 382, 0], 'io'], [40.85, [270, 372, 0.5], 'sine'], [41.95, [...onP([540, 40], WP), 0], 'io'], [X.T_END + 0.1, [...onP([540, -235], WP), 0], 'in2']],
      [[36.85, 3.35], [38.5, 1.75, 'sine'], [38.95, 1.85, 'sine'], [40.05, 2.8, 'io'], [40.85, 2.95, 'sine'], [41.95, 2.0, 'io'], [X.T_END + 0.1, 2.8, 'in2']]);
    ST.gateCam = cam;
    ST.gateFace = tt => scr(FACE, cam(tt));
    ST.gateSpire = tt => scr(SPIRE, cam(tt), WP);
    // the seasons rolling past (0..1 over 37.8 - 39.1) and the falling things each one brings
    const season = t => { const s = clamp((t - 37.8) / 1.3); return { s, A: env(s, 0, 0.1, 0.27, 0.4), W: env(s, 0.3, 0.42, 0.6, 0.72), S: env(s, 0.62, 0.74, 0.9, 1.0) }; };
    const falling = (t, n, seed, col, size, speed, sway, op, kind) => {
      if (op <= 0.001) return '';
      const r = rng(seed); let g = '';
      for (let i = 0; i < n; i++) {
        const x0 = r() * 1100 - 50, ph = r(), sp = speed * (0.7 + r() * 0.6), y = 250 + ((ph * 1700 + t * sp) % 1700), x = x0 + Math.sin(t * (1 + r()) + i) * sway, sz = size * (0.6 + r() * 0.8), rot = t * 160 * (r() - 0.5) + i * 37, c = col[i % col.length];
        g += kind === 'snow' ? `<circle cx="${f(x)}" cy="${f(y)}" r="${f(sz)}" fill="${c}" opacity="${f(op * (0.6 + 0.4 * r()))}"/>`
          : `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)})"><path d="M0,0 C${f(sz * 0.6)},${f(-sz * 0.5)} ${f(sz * 1.4)},${f(-sz * 0.2)} ${f(sz * 1.6)},${f(sz * 0.2)} C${f(sz)},${f(sz * 0.5)} ${f(sz * 0.4)},${f(sz * 0.4)} 0,0Z" fill="${c}" opacity="${f(op)}"/></g>`;
      }
      return g;
    };
    // snow caps on the gilded spear tips (gate-local units, inside the gate's scale)
    const gateSnow = (k, open) => { if (k <= 0.001) return ''; const { G0, G1, TOP } = GT, mid = (G0 + G1) / 2, sx = 1 - 0.78 * open; let g = '';
      for (let i = 0; i <= 7; i++) { const tipY = TOP - 30 - (i % 2) * 24 - 10; for (const x of [lerp(G0, mid, i / 7), G1 + (lerp(mid, G1, i / 7) - G1) * sx]) g += `<ellipse cx="${f(x)}" cy="${f(tipY)}" rx="9" ry="4.5" fill="#fbfcff"/>`; }
      return `<g transform="translate(540,${GT.FY}) scale(${GK}) translate(-540,${-GT.FY})" opacity="${f(k)}">${g}</g>`; };
    const SNOWCAP = '<path d="M-82,-146 C-44,-172 44,-172 82,-146 C60,-136 -60,-136 -82,-146Z" fill="#fbfcff"/><circle cx="-30" cy="-160" r="5" fill="#fff"/>';
    // the old scientist at his open window: warm room behind him, the casements swung open, a stone sill
    const LTI = { from: [0.6, -0.7], shadow: '#2a1c10', shadowOp: 0.35, floor: '#4a3a20', floorOp: 0.2, contactOp: 0.3, key: '#ffe8c8', keyAdd: 0.07, rims: [{ from: [-1, -0.3], col: '#ffb060', w: 5, op: 0.5 }, { from: [1, -0.3], col: '#d8e4f0', w: 4, op: 0.25 }], face: { col: '#fff0d8', op: 0.12 } };
    const windowScene = t => {
      const [x0, y0, x1, y1] = WIN, nod = bump(t, 40.2, 1, 0.55);
      const so = Object.assign(idle(t, 43, 0.3), { x: SCI_W[0], y: SCI_W[1], s: SCI_WS });
      const Sp = Q.sci(Object.assign(so, { tilt: 4 + 9 * nod, face: { expr: 'neutral', look: [0.45, 0.75], lid: lerp(0.2, 0.42, nod), mouth: 'smile', brows: [lerp(0, 3, nod), 2] },
        armR: { hand: [-150, -790], dir: [0.1, 1], pose: 'relaxed', facing: 'back' }, armL: { hand: [150, -790], dir: [-0.1, 1], pose: 'relaxed', facing: 'back' } }));
      let g = `<defs><clipPath id="gtWin"><rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}"/></clipPath></defs><g clip-path="url(#gtWin)">`;
      g += `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="#4a3020"/><rect x="${x0 + 14}" y="${y0 + 40}" width="60" height="260" fill="#2e1c10"/>` + [0, 1, 2, 3].map(k => `<rect x="${x0 + 18}" y="${y0 + 50 + k * 62}" width="52" height="8" fill="#6a4a2a"/>`).join('') + C.radial(x0 + 40, y0 + 60, 260, '#ffcf80', 0.45, 'screen');
      g += lit(Sp, LTI, WP) + `</g>`;
      // the open casements and the stone sill
      g += `<path d="M${x0},${y0} L${x0 - 34},${y0 + 16} L${x0 - 34},${y1 + 10} L${x0},${y1}Z" fill="#a8c0d0" opacity="0.55" stroke="#d8ccb0" stroke-width="6"/><path d="M${x1},${y0} L${x1 + 34},${y0 + 16} L${x1 + 34},${y1 + 10} L${x1},${y1}Z" fill="#a8c0d0" opacity="0.55" stroke="#d8ccb0" stroke-width="6"/>`;
      g += `<rect x="${x0 - 22}" y="${y1}" width="${x1 - x0 + 44}" height="24" fill="#d8ccb0" ${R.ol(1.2)}/><rect x="${x0 - 22}" y="${y1 + 24}" width="${x1 - x0 + 44}" height="12" fill="#000" opacity="0.25"/>`;
      return g;
    };
    // the big iron key ring in his fist (grip frame: the ring in the fist, the keys hanging below)
    const keyRing = t => { const sw = Math.sin(t * 2.1) * 6; return `<g transform="rotate(${f(sw)})"><circle cx="0" cy="0" r="22" fill="none" stroke="#3a3a3c" stroke-width="6"/>` + [-14, 6, 22].map((a, i) => `<g transform="rotate(${a + 90 - sw * 0.6})"><path d="M18,0 L${96 + i * 14},0" stroke="#2a2a2c" stroke-width="7" stroke-linecap="round"/><rect x="${80 + i * 14}" y="0" width="22" height="16" fill="#2a2a2c"/><circle cx="16" cy="0" r="11" fill="none" stroke="#2a2a2c" stroke-width="6"/></g>`).join('') + `</g>`; };
    const fn = t => {
      const c = hh(cam(t), t, 0.25, 29), L = LTG;
      const set = S.gateWorld(t);
      // people crossing the courtyard behind the gate: a scientist in a white coat, a mother leading a bandaged child
      let yard = '';
      { const x1 = -300 + ((t * 70) % 1800), x2 = 1300 - ((t * 55 + 400) % 1800);
        yard += `<g transform="translate(${f(x1)},1440) scale(0.42)"><path d="M-46,0 L-56,-420 C-56,-470 56,-470 56,-420 L46,0Z" fill="#ece8de"/><path d="M-30,0 L-30,-60 M30,0 L30,-60" stroke="#2a2a2c" stroke-width="20"/><circle cx="0" cy="-520" r="52" fill="#d8b090"/><path d="M-50,-540 C-40,-600 40,-600 50,-540" fill="#3a3028"/></g>`;
        yard += `<g transform="translate(${f(x2)},1440) scale(0.42)"><path d="M-60,0 L-70,-440 C-70,-490 70,-490 70,-440 L60,0Z" fill="#3a3a52"/><circle cx="0" cy="-540" r="50" fill="#e2b48e"/><path d="M-56,-560 C-50,-620 50,-620 56,-560" fill="#1a1414"/><g transform="translate(110,0)"><path d="M-34,0 L-40,-240 C-40,-270 40,-270 40,-240 L34,0Z" fill="#8a6a4a"/><circle cx="0" cy="-300" r="36" fill="#ecc8a8"/><path d="M-34,-130 L-80,-200" stroke="#f4f2ec" stroke-width="22" stroke-linecap="round"/></g></g>`; }
      const se = season(t);
      const ti = set.findIndex(Lr => Lr.p === 0.78);
      set[ti] = { p: 0.78, svg: set[ti].svg + `<g filter="url(#dof1)">${yard}</g>` + (se.W > 0 ? `<rect x="-1600" y="1400" width="4800" height="420" fill="#eef2f6" opacity="${f(0.8 * se.W)}"/>` : '') };
      // the scientist at his window, and winter's snow on the slates and the ground
      const bi = set.findIndex(Lr => Lr.p === WP);
      set.splice(bi + 1, 0, { p: WP, svg: (se.W > 0 ? `<path d="M-1500,270 L2500,270 L2300,40 L-1300,40Z" fill="#f2f5f9" opacity="${f(0.7 * se.W)}"/>` : '') + windowScene(t) });
      const gi = set.findIndex(Lr => Lr.p === 1 && !Lr.light);
      if (se.W > 0) set[gi] = { p: 1, svg: set[gi].svg + `<rect x="-2000" y="1650" width="5200" height="1200" fill="#f4f6fa" opacity="${f(0.85 * se.W)}"/>` };
      // you, grown: the gatekeeper in uniform at the gate, keys in your fist. The years pass over you (your moustache and
      // hair grey, snow settles on your cap); then you lift your eyes to the window above
      const ao = Object.assign(idle(t, 37, 0.4), { x: ADULT[0], y: ADULT[1], s: AS });
      const up = EZ.io(ss(38.85, 39.5, t)), age = 0.8 * ss(37.85, 39.1, t);
      const A = Q.youAdult(Object.assign(ao, { tilt: lerp(3, -7, up), mustache: mix('#8a6a44', '#c8c2b6', age), hair: mix('#8a7a5a', '#b4afa6', age), brow: mix('#6a5a3e', '#a8a296', age), fx: { crow: lerp(0.8, 1.7, age) },
        headProps: Q.HEADP.KEPI + (se.W > 0.01 ? `<g opacity="${f(se.W)}">${SNOWCAP}</g>` : ''),
        face: { expr: 'grim', look: L2([0.15, 0.05], [-0.35, -0.85], up), lid: lerp(0.3, 0.22, up), mouth: t > 38.3 ? 'smile' : 'closed', brows: [lerp(2, -3, up), 1], cd: -1 },
        armR: { hand: [-182, -800], dir: [0.05, 1], pose: 'grip', facing: 'back', hold: keyRing(t), holdRot: 90 },
        armL: { hand: [176, -800], dir: [-0.05, 1], pose: 'relaxed', facing: 'back' } }));
      const chars = gateG(t, { open: 0.55 }) + gateSnow(se.W, 0.55) + lit(A, L);
      const layers = X.stage(set, chars);
      // falling leaves, snow and blossom, behind the gate and in front of you
      const behind = falling(t, 40, 3, ['#d8742a', '#b8461e', '#e8a040'], 15, 260, 70, 0.9 * se.A, 'leaf') + falling(t, 60, 5, ['#ffffff'], 4.5, 320, 30, 0.85 * se.W, 'snow') + falling(t, 40, 7, ['#f8c8d8', '#ffe0ea', '#fff4f8'], 10, 170, 60, 0.9 * se.S, 'leaf');
      const front = falling(t, 22, 11, ['#c8642a', '#e09038', '#a83a1a'], 22, 330, 90, 0.95 * se.A, 'leaf') + falling(t, 38, 13, ['#ffffff'], 7, 420, 40, 0.9 * se.W, 'snow') + falling(t, 22, 17, ['#f6c0d4', '#fff0f4'], 15, 220, 80, 0.95 * se.S, 'leaf');
      layers.splice(layers.findIndex(Lr => Lr.chars), 0, { p: 0.9, svg: behind });
      layers.push({ p: 1.12, svg: `<g filter="url(#dof1)">${front}</g>` });
      let out = X.compose(layers, c);
      // each season's light
      if (se.A > 0) out += `<rect width="1080" height="1920" fill="#ff8a2a" opacity="${f(0.24 * se.A)}" style="mix-blend-mode:overlay"/>`;
      if (se.W > 0) out += `<rect width="1080" height="1920" fill="#c8d8f0" opacity="${f(0.32 * se.W)}" style="mix-blend-mode:multiply"/><rect width="1080" height="1920" fill="#ffffff" opacity="${f(0.07 * se.W)}" style="mix-blend-mode:screen"/>`;
      if (se.S > 0) out += `<rect width="1080" height="1920" fill="#ffd8e8" opacity="${f(0.1 * se.S)}" style="mix-blend-mode:screen"/>`;
      return out + C.vignette(0.5);
    };
    X.shot('GATE', 36.85, X.T_END, fn, { grade: 'gDay' });
  }

  // ======================================================= transitions (each hidden in a move; no type twice in a row)
  {
    const V = ST;
    // the needle -> its source: the boy's belly drifts out of focus while the drying cord pulls into focus
    X.tr('rack', 4.15, 0.8, 'NEEDLE', 'CORD', { fa: [540, 900], fb: [540, 960], za: 1.08, zb: 0.94, blur: 12 });
    // the truck along the flasks carries straight on into the scientist's face
    X.tr('carry', 9.15, 0.8, 'CORD', 'LAB2', { dir: [1, 0], dist: 0.42, blur: 12 });
    // the camera sinks into your wet eye and the memory of the road, two days earlier, opens out of it
    X.tr('morph', 12.75, 0.9, 'LAB2', 'ROAD', { fa: V.lab2Eye(12.75), fb: V.roadHead(12.9), za: 1.7, zb: 1.4, col: '#5a4a36' });
    // the dust thrown up by the attack becomes the haze of the ward
    X.tr('organic', 16.8, 0.8, 'ROAD', 'WARD', { fa: [540, 1000], fb: [600, 760], za: 1.1, zb: 0.92, seed: 13, freq: 0.004, soft: 4, leak: '#d8c49a', leakAt: [540, 1000], leakOp: 0.3 });
    // following the spilt water, the camera pans past the linen curtain between the beds and comes out among the kennels
    const curtain = x => { let g = `<g filter="url(#dof3)"><rect x="${f(x - 700)}" y="-200" width="1400" height="2320" fill="#e6e2d8"/>`;
      for (let i = 0; i < 9; i++) { const fx = x - 640 + i * 160; g += `<path d="M${f(fx)},-200 C${f(fx + 30)},600 ${f(fx - 20)},1300 ${f(fx + 10)},2120" stroke="#a8a294" stroke-width="46" fill="none" opacity="0.55"/><path d="M${f(fx + 60)},-200 C${f(fx + 90)},600 ${f(fx + 40)},1300 ${f(fx + 70)},2120" stroke="#ffffff" stroke-width="22" fill="none" opacity="0.5"/>`; }
      return g + '</g>'; };
    X.tr('wipe', 24.45, 0.8, 'WARD', 'KENNEL', { dir: 1, truck: 200, obj: curtain });
    // the deadliest dose: push into the dark syringe, out of the rabbit that will die of it
    X.tr('push', 29.45, 0.7, 'KENNEL', 'RABBIT', { fa: V.kennelTip(29.45), fb: V.rabbitEye(29.45), za: 2.4, zb: 0.72, blur: 6 });
    // the dead rabbit's shut eye dissolves into your eye, open in the dark: a slow match, no glow
    X.tr('morph', 32.55, 0.9, 'RABBIT', 'NIGHT', { fa: V.rabbitDeadEye(32.55), fb: V.nightEye(32.55), za: 1.6, zb: 1.35, col: '#000000' });
    // your face at nine becomes your face grown up
    X.tr('radial', 37.3, 0.9, 'NIGHT', 'GATE', { fa: V.nightFace(37.3), fb: V.gateFace(37.3), za: 1.1, zb: 1.14, soft: 0.45, leak: '#ffe0a8', leakOp: 0.16 });
    // loop: the gilded point of the spire dives into the needle of the first frame
    X.tr('zmatch', X.T_END, 0.8, 'GATE', 'NEEDLE', { end: true, bOff: -X.T_END, fa: V.gateSpire(X.T_END - 0.4), fb: scr(V.shot(-0.4, false).tip, V.needleCam(-0.4)), za: 2.4, zb: 0.72, vexp: 1.5, seed: 4, leak: '#fff0c8', leakOp: 0.3 });
  }
})(window);
