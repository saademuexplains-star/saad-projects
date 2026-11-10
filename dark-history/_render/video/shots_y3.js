// "The Radium Girls", part 3: the lab, your death, 1927, the grave, the end and the loop.
// LAB    (24.82 .. 31.3)  "And all this time, in the company's own lab, chemists handle the same paint with lead
//                         aprons, masks and tongs."  behind the lead glass: a chemist lifts a glowing vial out of its
//                         lead pot with long tongs; the camera to the apron, the mask, the tongs on the words
// DEATH  (31.25 .. 32.76) "You die at 24,"  your face on the pillow, the eyes closing, the lamp going out
// CERT   (32.7 .. 34.9)   "and your death certificate says syphilis."  the certificate; SYPHILIS stamped across it
// NEWS   (34.84 .. 37.76) "Five years later, with your friends dying the same way,"  1927: the paper on the empty
//                         studio table, DIAL PAINTERS DYING, your friends' portraits
// GRAVE  (37.7 .. 41.14)  "they dig you up, lift the lid, and your body is still glowing,"  down the grave's length:
//                         the coffin's seams glowing, the lid swinging open, the diggers lit green, you inside
// JAR    (41.06 .. 42.52) "because the paint was radium."  the jar of Undark in the dark, its label
// END    (42.44 .. 47.15) "And you were one of the Radium Girls."  the studio in the dark, every girl glowing, you in
//                         the front row; THE RADIUM GIRLS; the hold; the loop back to the brush of frame 0
// Hands: the chemist's left forearm level across his body into the fist on the tongs (the jaws hanging below it), his
// other hand behind his back; every other hand under the quilt, behind a table or a heap, or below the frame.
(function (G) {
  const X = G.ENG, Q = G.QCAST, S = G.SETS, C = G.CINE, R = G.RIG, ST = G.STAGE, V = G.RGV;
  const { ss, lerp } = X, { f, mix } = R, { up, gripAt, fingersFor, nrm } = ST;
  const LB2 = { TOP: 1640, NEAR: 1740 }, PIG = [560, 1724];
  const { cl, env, bump, idle, hh, scr, camOn, L2, rest } = V;
  const GL = S.GLOW;
  const behind = side => ({ hand: [side === 'R' ? -40 : 40, -780], dir: [side === 'R' ? 0.45 : -0.45, 1], pose: 'relaxed', facing: 'back', behind: true });

  // ======================================================= LAB: behind the lead glass
  const LL = { from: [-0.5, -1], shadow: '#1e2420', shadowOp: 0.5, floor: '#1a1e1a', floorOp: 0.3, contactOp: 0, key: '#e8f0e0', keyAdd: 0.06,
    rims: [{ from: [0.5, 1], col: GL, w: 5, op: 0.45 }, { from: [-0.6, -0.8], col: '#e8f0e8', w: 4, op: 0.3 }], face: { col: '#e8f0e0', op: 0.1 } };
  V.lbFist = t => [560, lerp(1360, 1290, ss(27.45, 28.75, t)) + 3 * Math.sin(t * 2.1)];
  X.shot('LAB', 24.82, 31.3, t => {
    const c = hh(V.lbCam(t), t, 0.5, 21);
    const id = idle(t, 101, 0.4), o = { x: 660, y: 2420, s: 1.15, tilt: -4 + 2 * X.noise(t * 0.4, 3), sway: id.sway * 0.3, breath: id.breath, blink: id.blink };
    // the left fist round the tongs (the fingers along the forearm, toward the left); the jaws hang below it
    const F = V.lbFist(t), J = [F[0] + 4, F[1] + 262];
    const P = up(Q.chemist(Object.assign(o, { noLegs: true, face: { expr: 'neutral', look: [-0.4, 0.8], lid: 0.4 },
      armL: gripAt(o, Q.HAND.chemist, F, fingersFor('L', 'back', [0, -1]), { facing: 'back', detachHand: true }), armR: behind('R') })), o);
    const tongs = S.tongs([F[0], F[1] - 70], J, 0.2);
    const vialY = J[1] + 30, lum = 0.75 + 0.25 * ss(27.4, 28.4, t);
    const body = Q.litHair(P, o, Q.chemistArt(), LL, tongs + P.handL, [F[0] - 80, F[1] - 120, F[0] + 80, J[1] + 40]);
    // a second chemist at the hood behind, hands behind his back
    const o2 = { x: 170, y: 2150, s: 0.86, tilt: 5, sway: idle(t, 102, 0.4).sway * 0.3, breath: idle(t, 102).breath, blink: 0 };
    const P2 = up(Q.chemist(Object.assign(o2, { noLegs: true, face: { expr: 'neutral', look: [0.6, 0.6], lid: 0.4 }, armR: behind('R'), armL: behind('L') })), o2);
    const layers = S.labBack(t);
    layers.push({ p: 0.9, svg: `<g filter="url(#dof1)">${Q.litHair(P2, o2, Q.chemistArt(), LL)}</g>` });
    // the vial comes up out of the lead pot in the tongs' jaws (below the pot's mouth it is inside it)
    layers.push({ p: 1, svg: body + S.labBench(t, { pig: PIG, top: LB2.TOP, near: LB2.NEAR }) + ST.clipTop('lbVial', S.pigMouth(PIG), S.vial(J[0], vialY, 1.15, lum)) + S.radGlow(J[0], S.pigMouth(PIG) - 10, 160, 0.35 * lum) });
    layers.push({ p: 1.25, svg: S.leadGlass(t) });
    return S.EMIS + X.compose(layers, c) + C.vignette(0.5, '#020402', 0.45);
  }, { grade: 'gNight' });
  V.lbCam = V.cam([[24.8, [540, 1180, 0.98, 0]], [25.9, [550, 1150, 1.04, 0]], [27.2, [580, 1260, 1.22, 0]], [28.6, [580, 1390, 1.55, 0]], [29.2, [690, 1480, 1.5, 0]], [29.85, [690, 1300, 1.42, 0]], [30.3, [660, 1060, 2.05, 0]], [30.75, [600, 1380, 1.8, 0]], [31.3, [575, 1500, 2.0, 0]]]);
  X.tr('surface', 24.85, 0.5, 'PALM', 'LAB', { dir: 1, seed: 31, tint: '#c8d8b8', line: '#e8f0d8', core: '#f4fff0', bub: '#d8e8c8' });

  // ======================================================= DEATH: your face on the pillow; the eyes closing; the lamp out
  const LB = { from: [-1, -0.2], shadow: '#2a1a12', shadowOp: 0.6, floor: '#1a100a', floorOp: 0.3, contactOp: 0, key: '#ffd8a0', keyAdd: 0.1,
    rims: [{ from: [-1, -0.1], col: '#ffb060', w: 5, op: 0.4 }], face: { col: '#ffd0a0', op: 0.16 } };
  // (after the first full render: the lamp stood out of frame and the lab cut hard to the bed) the oil lamp on the night
  // table in the left foreground - its flame is what the lab's glowing vial becomes, and it goes out on "die"
  const LAMP = [290, 1345], FLAME = [290, 1155];
  X.shot('DEATH', 31.25, 32.76, t => {
    const c = hh(V.deCam(t), t, 0.35, 22);
    const flame = 1 - ss(32.0, 32.55, t), close = ss(31.45, 32.2, t), smoke = ss(32.42, 32.75, t);
    const o = { x: 620, y: 2260, s: 1.0, tilt: -8, sway: 0, breath: 0.2 * (1 - close), blink: 0 };
    const P = up(Q.you(Object.assign(o, { noLegs: true, face: { expr: 'tired', look: [-0.3, -0.1], lid: lerp(0.45, 1, close), brows: [-8, 4], mouth: 'parted', open: 0.06 * (1 - close), bags: 0.8, sweat: 0.2 }, armR: rest('woman', 'R'), armL: rest('woman', 'L') })), o);
    const layers = S.bedBack(t);
    const head = V.facePt(o, 'woman', [0, 0]);
    let g = S.pillow(head[0], head[1] - 30, 1.0) + Q.litHair(P, o, Q.youArt(), LB) + S.quilt(620, head[1] + 210, 1.0);
    // the night table and the lamp; the dark when the flame dies; a thread of smoke from the chimney
    g += `<path d="M-400,${LAMP[1]} L470,${LAMP[1]} L500,${LAMP[1] + 46} L-400,${LAMP[1] + 46}Z" fill="#4a3220" filter="url(#woodH)" ${R.ol(1.4)}/><rect x="-400" y="${LAMP[1] + 46}" width="900" height="900" fill="#2e1e12"/><path d="M-400,${LAMP[1] + 4} L468,${LAMP[1] + 4}" stroke="#8a6a44" stroke-width="3" opacity="0.5"/>`;
    g += S.oilLamp(LAMP[0], LAMP[1], 1.15, flame, t) + `<rect x="-900" y="-600" width="2900" height="2900" fill="#000" opacity="${f(0.62 * (1 - flame))}"/>`;
    if (smoke > 0.01) { const top = LAMP[1] - 322, rise = 240 * smoke; let d = `M${LAMP[0]},${top}`; for (let k = 1; k <= 12; k++) { const u = k / 12; d += ` L${f(LAMP[0] + 22 * u * Math.sin(u * 7 + t * 3))},${f(top - rise * u)}`; } g += `<path d="${d}" stroke="#b8b4a8" stroke-width="${f(5 + 6 * smoke)}" fill="none" opacity="${f(0.32 * smoke * (1 - 0.5 * ss(32.9, 33.3, t)))}" stroke-linecap="round" filter="url(#b4)"/>`; }
    layers.push({ p: 1, svg: g });
    return X.compose(layers, c) + C.vignette(0.55, '#000000', 0.5);
  }, { grade: 'gHall' });
  V.deCam = V.cam([[31.2, [500, 1000, 1.42, 0]], [32.0, [520, 1010, 1.56, 0]], [32.8, [530, 1015, 1.68, 0]]]);
  // the vial's glow in the tongs becomes the lamp's flame
  X.tr('radial', 31.3, 0.4, 'LAB', 'DEATH', { fa: scr([564, 1600], V.lbCam(31.3)), fb: scr(FLAME, V.deCam(31.3)), za: 1.15, zb: 1.1, soft: 0.5, ring: '#ffd8a0', ringOp: 0.4 });

  // ======================================================= CERT: the certificate; SYPHILIS stamped across it on the word
  X.shot('CERT', 32.7, 34.9, t => {
    const c = hh(V.ctCam(t), t, 0.4, 23);
    const st = ss(34.0, 34.14, t), jolt = bump(t, 34.12, 1, 0.25);
    const g = `<rect x="-600" y="-400" width="2400" height="2800" fill="#4a3826" filter="url(#woodH)"/>` + C.radial(300, 500, 1300, '#ffd8a0', 0.18) + S.certificate(540, 1000 + 6 * jolt, 1.0, -2.5, { stamp: st });
    return X.compose([{ p: 1, svg: g }, { p: 1.05, svg: S.dust(540, 900, 700, 700, 22, 81, t, '#fff0d8', 1.5, 0.35) }], c) + C.vignette(0.55, '#060302', 0.45);
  }, { grade: 'gHall' });
  V.ctCam = V.cam([[32.65, [540, 640, 1.5, -0.6]], [33.3, [530, 780, 1.42, -0.4]], [33.9, [540, 1080, 1.6, -0.2]], [34.3, [540, 1150, 1.9, 0]], [34.9, [540, 1160, 2.1, 0]]]);
  X.tr('dip', 32.72, 0.34, 'DEATH', 'CERT', { col: '#000000' });

  // ======================================================= NEWS: 1927 - the paper on the empty studio table; your
  // friends' portraits in it, the black ribbons
  const portrait = (who, art) => (cx, cy) => { const o = { x: cx, y: cy + 1268 * 0.42 + 6, s: 0.42, tilt: 0, sway: 0, breath: 0.2, blink: 0 }; const P = up(Q[who](Object.assign(o, { noLegs: true, face: { expr: 'neutral', look: [0, 0], lid: 0.2, mouth: 'smile' }, armR: rest('woman', 'R'), armL: rest('woman', 'L') })), o), A = Q[art](); return (A.back ? Q.headArt(P, o, A.back) : '') + P.svg + (A.front ? Q.headArt(P, o, A.front) : ''); };
  const PORTS = [portrait('friendA', 'friendAArt'), portrait('friendB', 'friendBArt')];
  X.shot('NEWS', 34.84, 37.76, t => {
    const c = hh(V.nwCam(t), t, 0.45, 24);
    const layers = S.studioBack(t, { dark: 0.55 });
    // the empty chairs at the dusky tables, the dials still glowing a little
    let g = S.studioTable(t, { dark: 0.55, top: 1300, near: 1380, tray: [400, 1340], trayS: 0.8, pot: [800, 1350], potS: 0.9, done: 8 });
    for (const x of [180, 540, 900]) g += `<path d="M${x - 60},1300 L${x - 64},1080 Q${x},1050 ${x + 64},1080 L${x + 60},1300" fill="#2a1e14" stroke="#120c06" stroke-width="3"/><path d="M${x - 40},1110 L${x + 40},1110 M${x - 40},1160 L${x + 40},1160" stroke="#120c06" stroke-width="5"/>`;
    layers.push({ p: 0.9, svg: `<g filter="url(#dof2)">${g}</g>` });
    const rib = ss(36.4, 36.8, t);
    const pg = `<rect x="-600" y="1400" width="2400" height="1400" fill="#3a2818" filter="url(#woodH)"/>` + S.paper1927(540, 1720, 0.78, 3, { portraits: PORTS, ribbon: rib });
    layers.push({ p: 1, svg: pg });
    return X.compose(layers, c) + C.vignette(0.55, '#060302', 0.45);
  }, { grade: 'gHall' });
  V.nwCam = V.cam([[34.8, [470, 1310, 2.2, -0.8]], [35.5, [520, 1360, 1.7, -0.4]], [36.1, [540, 1520, 1.4, 0]], [36.8, [540, 1700, 1.5, 0.3]], [37.8, [540, 1700, 1.66, 0.5]]]);
  X.tr('carry', 34.88, 0.34, 'CERT', 'NEWS', { dir: [0, -1], fade: [0.4, 0.6] });

  // ======================================================= GRAVE: down the grave's length (the new coffin)
  // the diggers' light: the lanterns at their outer sides (warm) until the lid opens (k 0 -> 1), then the coffin's green
  // from below
  const LCg = (fx, k) => ({ from: [fx - 0.8 * (1 - k) * Math.sign(fx), 1 - 0.8 * (1 - k)], shadow: '#000000', shadowOp: 0.62, ambient: mix('#7a6a58', '#6a8466', k), ambientOp: 1, floor: '#000000', floorOp: 0, contactOp: 0, key: mix('#ffb060', GL, k), keyAdd: 0.3 + 0.12 * k,
    rims: [{ from: [fx, 1], col: GL, w: 6, op: 0.8 * k }, { from: [-fx * 2, -0.2], col: '#ffb060', w: 4, op: 0.5 }], face: { col: mix('#ffc890', '#d8ffb0', k), op: 0.25 + 0.3 * k, r: 1.9 } });
  V.gvLid = t => ss(38.6, 39.36, t);
  X.shot('GRAVE', 37.7, 41.14, t => {
    const c = hh(V.gvCam(t), t, 0.5, 25);
    const lid = V.gvLid(t), gl = ss(38.62, 39.1, t), leak = ss(37.75, 38.3, t) * (1 - gl);
    let men = '';
    for (const [who, art, x, s, fx, tilt, F0, F1, seed] of [
      ['digger1', 'digger1Art', 290, 0.66, 0.35, 5, { expr: 'grim', look: [0.15, 0.9], lid: 0.36, brows: [4, -2], mouth: 'tight' }, { expr: 'fear', mouth: 'parted', open: 0.16, look: [0.15, 0.9], brows: [-14, 8], lid: 0.08 }, 111],
      ['digger2', 'digger2Art', 800, 0.64, -0.35, -6, { expr: 'grim', look: [-0.2, 0.9], lid: 0.36, brows: [4, -2], mouth: 'tight' }, { expr: 'fear', mouth: 'o', open: 0.32, look: [-0.2, 0.9], brows: [-16, 10], lid: 0.02 }, 112]]) {
      const id = idle(t, seed, 0.5), recoil = ss(38.75, 39.2, t);
      const o = { x, y: 662 + 820 * s - 6 * recoil, s, tilt: tilt - 4 * recoil * Math.sign(fx), sway: id.sway * 0.4, breath: id.breath + 0.6 * recoil, blink: t > 38.5 ? 0 : id.blink };
      const P = up(Q[who](Object.assign(o, { noLegs: true, face: Object.assign({ age: who === 'digger1' }, V.faceMix(F0, F1, ss(38.7, 39.0, t))), armR: rest('man', 'R'), armL: rest('man', 'L') })), o);
      men += Q.litHair(P, o, Q[art](), LCg(fx, gl));
    }
    const layers = S.cemeteryBack(t);
    layers.push({ p: 1, svg: S.graveGround(t) + men + S.graveHeap(t) + S.grave(t, { lid, glow: gl, leak }) });
    return S.EMIS + X.compose(layers, c) + V.dark(300, 560, 0.35, 'gvTop') + C.vignette(0.55, '#000000', 0.42);
  }, { grade: 'gNight' });
  V.gvCam = V.cam([[37.65, [540, 520, 1.45, 0]], [38.3, [540, 600, 1.32, 0]], [38.9, [540, 800, 1.08, 0]], [39.6, [540, 1150, 1.12, 0]], [40.4, [540, 1080, 1.55, 0]], [41.15, [540, 1030, 2.0, 0]]]);
  X.tr('sweep', 37.73, 0.32, 'NEWS', 'GRAVE', { dir: 1, col: '#ffb060' });

  // ======================================================= JAR: the jar of Undark in the dark: the paint was radium
  X.shot('JAR', 41.06, 42.52, t => {
    const c = hh(V.jrCam(t), t, 0.35, 26);
    const g = `<rect x="-600" y="-400" width="2400" height="2800" fill="#0a0c0a"/><rect x="-600" y="1500" width="2400" height="1200" fill="#141210" filter="url(#woodH)"/>` + S.undarkJar(540, 1520, 2.4, { lum: 1, dark: 1 });
    return S.EMIS + X.compose([{ p: 1, svg: g }], c) + C.vignette(0.6, '#000000', 0.5);
  }, { grade: 'gNight' });
  // on "radium" the camera goes in to the small print RADIUM LUMINOUS MATERIAL
  V.jrCam = V.cam([[41.0, [540, 1180, 1.35, 0]], [41.7, [540, 1210, 1.55, 0]], [42.1, [540, 1320, 2.5, 0]], [42.55, [540, 1352, 3.0, 0]]]);
  X.tr('radial', 41.1, 0.36, 'GRAVE', 'JAR', { fa: scr([540, 1015], V.gvCam(41.1)), fb: scr([540, 1300], V.jrCam(41.1)), za: 1.2, zb: 1.1, soft: 0.5, ring: '#d8ffb0', ringOp: 0.45 });

  // ======================================================= END: the studio in the dark, every girl glowing, you in the
  // front row; the title; the hold; the loop
  const ROWS = [
    { top: 1180, near: 1250, y: 1560, s: 0.52, p: 0.9, xs: [130, 400, 680, 950], tray: [540, 1215] },
    { top: 1300, near: 1380, y: 1918, s: 0.72, p: 0.95, xs: [150, 540, 930], tray: [340, 1340] }];
  const GIRLS = [['friendA', 'friendAArt'], ['friendB', 'friendBArt']];
  V.endYou = t => ({ x: 540, y: 2300, s: 1.0 });
  X.shot('END', 42.44, X.T_END + 0.01, t => {
    const c = hh(V.enCam(t), t, 0.4, 27);
    const layers = S.studioBack(t, { dark: 1 });
    ROWS.forEach((row, ri) => {
      let g = '', e = '';
      row.xs.forEach((x, i) => {
        const [who, art] = GIRLS[(i + ri) % 2], id = idle(t, 120 + ri * 5 + i, 0.5);
        const o = { x, y: row.y, s: row.s, tilt: 2 * X.noise(t * 0.3, i + ri), sway: id.sway * 0.3, breath: id.breath, blink: id.blink };
        const P = up(Q[who](Object.assign(o, { noLegs: true, face: { expr: 'neutral', look: [0, 0.05], lid: 0.2, mouth: 'grin', teeth: GL, brows: [2, 2] }, armR: rest('woman', 'R'), armL: rest('woman', 'L') })), o);
        g += Q.litHair(P, o, Q[art](), V.LG(0)); e += S.emissive(P.svg);
      });
      g += e + S.studioTable(t, { dark: 1, top: row.top, near: row.near, tray: row.tray, pot: [row.tray[0] + 260, row.top + 40], potS: row.s * 1.2, trayS: row.s * 1.2, done: 8 });
      layers.push({ p: row.p, svg: `<g filter="url(#dof1)">${g}</g>` });
    });
    let near = '', ne = '';
    for (const [who, art, x, seed] of [['friendB', 'friendBArt', 170, 131], ['friendA', 'friendAArt', 910, 132]]) {
      const id = idle(t, seed, 0.5), o = { x, y: 2300, s: 1.0, tilt: x < 540 ? 3 : -3, sway: id.sway * 0.4, breath: id.breath, blink: id.blink };
      const P = up(Q[who](Object.assign(o, { noLegs: true, face: { expr: 'neutral', look: [x < 540 ? 0.1 : -0.1, 0.05], lid: 0.2, mouth: 'grin', teeth: GL, brows: [3, 2] }, armR: rest('woman', 'R'), armL: rest('woman', 'L') })), o);
      near += Q.litHair(P, o, Q[art](), V.LG(x < 540 ? 0.4 : -0.4)); ne += S.emissive(P.svg);
    }
    const id = idle(t, 133, 0.5), yo = { x: 540, y: 2300, s: 1.0, tilt: 2, sway: id.sway * 0.4, breath: id.breath, blink: id.blink };
    const F = V.faceAt(t, [[42.4, { expr: 'neutral', look: [0, 0.4], lid: 0.3, mouth: 'smile', teeth: GL, brows: [0, 2] }], [43.3, { expr: 'neutral', look: [0, 0.02], lid: 0.14, mouth: 'grin', teeth: GL, brows: [3, 3] }]], 0.5);
    const YP = up(Q.you(Object.assign(yo, { noLegs: true, face: F, armR: rest('woman', 'R'), armL: rest('woman', 'L') })), yo);
    near += Q.litHair(YP, yo, Q.youArt(), Object.assign({}, V.LG(0), { ambient: '#8aa882', keyAdd: 0.4, face: { col: '#e8ffd0', op: 0.6, r: 2 } })); ne += S.emissive(YP.svg);
    near += ne + S.studioTable(t, { dark: 1, near: 1720, tray: [300, 1620], trayS: 1.1, pot: [800, 1600], potS: 1.3, done: 8 }) + S.radGlow(800, 1560, 300, 0.3);
    layers.push({ p: 1, svg: near }, { p: 1.02, svg: S.studioLight(t, { dark: 1 }) });
    const tk = ss(43.55, 44.3, t);
    return S.EMIS + X.compose(layers, c) + C.vignette(0.6, '#000000', 0.5) + S.title(540, 360, tk, t);
  }, { grade: 'gNight' });
  V.enCam = V.cam([[42.4, [540, 1050, 2.3, 0]], [43.2, [540, 1040, 1.85, 0]], [44.4, [540, 1012, 1.14, 0]], [46.0, [540, 1000, 1.04, 0]], [47.2, [540, 998, 1.02, 0]]]);
  X.tr('push', 42.48, 0.34, 'JAR', 'END', { fa: [540, 960], fb: scr([540, 1052], V.enCam(42.48)), za: 2.0, zb: 0.65, fade: [0.45, 0.55], blur: 6 });
  // the loop: the paint pot glowing on your table becomes the glowing brush tip of frame 0
  X.tr('morph', X.T_END, 0.5, 'END', 'HOOK', { end: true, bOff: -X.T_END, fa: scr([800, 1556], V.enCam(X.T_END - 0.25)), fb: [540, 862], za: 1.3, zb: 1.2, fade: [0.45, 0.55], blur: 5, bpow: 6, col: '#d8ffb0' });
})(window);
