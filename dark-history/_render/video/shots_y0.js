// Look test for The Radium Girls: three stills, three different scenes (no camera move, no transitions yet).
// STUDIO (0-1 s): "Your boss hands you a paintbrush dipped in glowing paint" - the boss holds the brush out to you
//                 across the worktable, upright in his fist, its tip glowing
// GLOW   (1-2 s): "So you paint your nails with it, your teeth" - the lights off: your hand in the foreground, the
//                 nails glowing; your friends grinning across the table, their teeth glowing
// GRAVE  (2-3 s): "they dig you up, lift the lid, and your body is still glowing" - the diggers over the open coffin
// Hands: only the proven set-ups (the user: "PLEASE NO HANDS AND ARMS MISTAKES IN THIS ONE"): a forearm level across
// the body into a fist on the held thing; arms hanging with the hands hidden behind the table or the heap; a hand in
// the foreground whose forearm leaves the frame.
(function (G) {
  const X = G.ENG, Q = G.QCAST, S = G.SETS, C = G.CINE, R = G.RIG, ST = G.STAGE;
  const { up, gripAt, fingersFor, still, nrm } = ST, { f } = R;
  const GL = S.GLOW;
  const rest = (kind, side) => ({ hand: R.restHand(kind, side), dir: [side === 'R' ? 0.02 : -0.02, 1], pose: 'relaxed', facing: 'back' });

  // ======================================================= STUDIO
  // the morning through the tall windows on the left (out of frame) and behind
  const LS = { from: [-1, -0.35], shadow: '#3a2a1e', shadowOp: 0.46, floor: '#3a2a1a', floorOp: 0.28, contactOp: 0, key: '#fff4e0', keyAdd: 0.08,
    rims: [{ from: [-1, -0.3], col: '#fff2dc', w: 5, op: 0.4 }, { from: [0.4, -1], col: '#ffe8c8', w: 4, op: 0.25 }], face: { col: '#fff0e0', op: 0.12 } };
  X.shot('STUDIO', 0, 1, t => {
    const cam = [560, 1110, 1.16, 0]; X.CAM = cam;
    // two girls at the next table, out of focus at the edges of the frame (their hands in their laps, under the table)
    let far = '';
    for (const [who, art, x, look] of [['friendA', 'friendAArt', 30, [0.3, 0.6]], ['friendB', 'friendBArt', 1060, [-0.3, 0.6]]]) {
      const o = still(x, 1560, 0.52, { tilt: 6 });
      const P = up(Q[who](Object.assign(o, { noLegs: true, face: { expr: 'neutral', look, lid: 0.5 }, armR: rest('woman', 'R'), armL: rest('woman', 'L') })), o);
      far += Q.litHair(P, o, Q[art](), LS);
    }
    far += S.studioTable(t, { top: 1180, near: 1250, tray: [540, 1215], pot: [300, 1236], done: 8, trayDark: 0.55 });
    // you, nineteen, at the worktable: hands in your lap under it, looking up at what he holds out
    const yo = still(300, 2300, 1.0, { tilt: 4 });
    const YP = up(Q.you(Object.assign(yo, { noLegs: true, face: { expr: 'anxious', look: [0.85, -0.2], lid: 0.12, brows: [-5, 4], mouth: 'closed' },
      armR: rest('woman', 'R'), armL: rest('woman', 'L') })), yo);
    // the boss behind the table: his left forearm level across his belly, the fist round the brush upright, its
    // glowing tip leaning toward you; his right arm hanging, the hand behind the table
    const bo = still(820, 2350, 1.15, { tilt: -5 });
    const ax = nrm([-0.36, -0.93]), gB = [712, 1300];
    const BP = up(Q.boss(Object.assign(bo, { noLegs: true, face: { expr: 'neutral', mouth: 'smile', look: [-0.75, 0.25], lid: 0.36, brows: [3, -2] },
      armL: gripAt(bo, Q.HAND.boss, gB, fingersFor('L', 'back', ax), { facing: 'back', detachHand: true }),
      armR: rest('man', 'R') })), bo);
    const A = [gB[0] - ax[0] * 50, gB[1] - ax[1] * 50], B = [gB[0] + ax[0] * 160, gB[1] + ax[1] * 160];
    const brush = S.brush(A, B, 1, 1.3, { glow: false });
    const people = Q.litHair(YP, yo, Q.youArt(), LS) + Q.litHair(BP, bo, Q.bossArt(), LS, brush + BP.handL, [B[0] - 60, B[1] - 60, A[0] + 60, A[1] + 60]);
    const layers = S.studioBack(t);
    layers.push({ p: 0.9, svg: `<g filter="url(#dof1)">${far}</g>` });
    layers.push({ p: 1, svg: people + S.brushGlow(A, B, 1, 1.6) + S.studioTable(t, { near: 1720, tray: [790, 1630], trayS: 1.25, pot: [500, 1610], potS: 1.4, done: 5 }) }, { p: 1.02, svg: S.studioLight(t) });
    return S.EMIS + X.compose(layers, cam) + C.vignette(0.45, '#060302', 0.4);
  }, { grade: 'gHall' });

  // ======================================================= GLOW: the lights off
  // the paint pot on the table is the only light: green, from below. (The scene's dark comes from a gradient over the
  // top of the frame and the vignette; the figures keep enough of their own light for the faces to read.)
  const LG = fx => ({ from: [fx, 1], shadow: '#000000', shadowOp: 0.78, ambient: '#587a50', ambientOp: 1, floor: '#000000', floorOp: 0, contactOp: 0, key: GL, keyAdd: 0.34,
    rims: [{ from: [fx, 1], col: GL, w: 6, op: 0.8 }], face: { col: '#d8ffb0', op: 0.42, r: 1.8 } });
  const dark = (y0, y1, op) => `<defs><linearGradient id="dkTop" x1="0" y1="0" x2="0" y2="1920" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#000" stop-opacity="${op}"/><stop offset="${f(y0 / 1920)}" stop-color="#000" stop-opacity="${f(op * 0.45)}"/><stop offset="${f(y1 / 1920)}" stop-color="#000" stop-opacity="0"/></linearGradient></defs><rect x="0" y="0" width="1080" height="1920" fill="url(#dkTop)"/>`;
  X.shot('GLOW', 1, 2, t => {
    const cam = [540, 1060, 1.04, 0]; X.CAM = cam;
    const TOPG = 1400;
    let people = '', emis = '';
    for (const [who, art, x, fx, look, tilt] of [['friendA', 'friendAArt', 280, 0.6, [0.5, 0.25], 7], ['friendB', 'friendBArt', 800, -0.6, [-0.45, 0.3], -6]]) {
      const o = still(x, TOPG + 830 * 1.1, 1.1, { tilt });
      const P = up(Q[who](Object.assign(o, { noLegs: true, face: { expr: 'neutral', mouth: 'grin', teeth: GL, look, lid: 0.28, brows: [5, 3] }, armR: rest('woman', 'R'), armL: rest('woman', 'L') })), o);
      people += Q.litHair(P, o, Q[art](), LG(fx));
      emis += S.emissive(P.svg);
    }
    // your right hand in the foreground (the forearm leaves the frame at the lower right): the back of the hand,
    // fingers spread, every nail painted
    const W = [850, 1770], dir = nrm([-0.36, -0.93]), L = 104 * 2.6;
    const hand = R.handV2({ x: W[0], y: W[1], dir, side: 'R', facing: 'back', pose: 'open', size: L, skin: '#f2cfb6', nails: GL });
    const n = [-dir[1], dir[0]], ww = 0.16 * L * 1.3, E = [W[0] - dir[0] * 520, W[1] - dir[1] * 520];
    const P2 = (p, k) => `${f(p[0] + n[0] * k)},${f(p[1] + n[1] * k)}`;
    const C0 = [W[0] - dir[0] * 30, W[1] - dir[1] * 30];
    const sleeve = `<path d="M${P2(W, ww * 1.0)} L${P2(E, ww * 1.4)} L${P2(E, -ww * 1.4)} L${P2(W, -ww * 1.0)}Z" fill="#efe9de" ${R.ol(1.4)}/>` +
      `<path d="M${P2(C0, ww * 1.06)} L${P2(C0, -ww * 1.06)}" stroke="#a8a090" stroke-width="3"/>`;
    const fg = sleeve + hand;
    const fgP = { svg: fg, info: { cx: W[0], cy: W[1], R: 420, top: W[1] - 520, feet: W[1] + 400, s: 2.6 } };
    const fgLit = ST.litWith(fgP, { from: [-0.7, -0.9], shadow: '#000000', shadowOp: 0.8, ambient: '#4a6444', ambientOp: 1, floor: '#000', floorOp: 0, contactOp: 0, key: GL, keyAdd: 0.2, rims: [{ from: [-0.7, -0.9], col: GL, w: 7, op: 0.85 }] }, fg);
    const layers = S.studioBack(t, { dark: 1 });
    layers.push({ p: 1, svg: people + emis + S.studioTable(t, { dark: 1, top: TOPG, near: 1640, tray: [770, 1500], pot: [540, 1520], potS: 1.5, done: 8 }) + S.radGlow(540, 1440, 460, 0.3) }, { p: 1.02, svg: S.studioLight(t, { dark: 1 }) });
    layers.push({ p: 1.15, svg: fgLit + S.emissive(hand) });
    return S.EMIS + X.compose(layers, cam) + dark(700, 1000, 0.8) + C.vignette(0.6, '#000000', 0.5);
  }, { grade: 'gNight' });

  // ======================================================= GRAVE
  // the light from the open coffin, green from below; the lanterns' warm rims at the sides
  const LC = fx => ({ from: [fx, 1], shadow: '#000000', shadowOp: 0.66, ambient: '#6a8466', ambientOp: 1, floor: '#000000', floorOp: 0, contactOp: 0, key: GL, keyAdd: 0.42,
    rims: [{ from: [fx, 1], col: GL, w: 6, op: 0.8 }, { from: [-fx * 2, -0.2], col: '#ffb060', w: 4, op: 0.5 }], face: { col: '#d8ffb0', op: 0.55, r: 1.9 } });
  X.shot('GRAVE', 2, 3, t => {
    const cam = [540, 960, 1, 0]; X.CAM = cam;
    let men = '';
    // the diggers stand at the head of the grave either side of your headstone, looking down into it; behind the heaps
    // of earth from the waist down (their hands too)
    for (const [who, art, x, s, fx, look, tilt, face] of [
      ['digger1', 'digger1Art', 290, 0.66, 0.35, [0.15, 0.9], 5, { expr: 'fear', mouth: 'parted', open: 0.16, brows: [-14, 8], lid: 0.08 }],
      ['digger2', 'digger2Art', 800, 0.64, -0.35, [-0.2, 0.9], -6, { expr: 'fear', mouth: 'o', open: 0.32, brows: [-16, 10], lid: 0.02 }]]) {
      const o = still(x, 662 + 820 * s, s, { tilt });
      const P = up(Q[who](Object.assign(o, { noLegs: true, face: Object.assign({ look, age: who === 'digger1' }, face), armR: rest('man', 'R'), armL: rest('man', 'L') })), o);
      men += Q.litHair(P, o, Q[art](), LC(fx));
    }
    const layers = S.cemeteryBack(t);
    layers.push({ p: 1, svg: S.graveGround(t) + men + S.graveHeap(t) + S.grave(t, { lid: 1, glow: 1 }) });
    return S.EMIS + X.compose(layers, cam) + dark(300, 560, 0.35) + C.vignette(0.55, '#000000', 0.42);
  }, { grade: 'gNight' });
})(window);
