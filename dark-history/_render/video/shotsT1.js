// Test stills (an any-topic test of the skill): Vienna, 1847, Ignaz Semmelweis and the washing of hands.
// WARD  (0-1 s): "In your ward, the mothers are dying of fever" - a young mother sits up in bed by one candle, afraid
// BASIN (1-2 s): "so you set a bowl of chlorine water by the door, and wash" - you, your hands plunged in the bowl
// KLEIN (2-3 s): "Your chief calls it nonsense" - Professor Klein in front, sneering; you at the bowl behind him
// The clean rig (G.RIG_CRISP), the cast dressed with tailor.js, the shot helpers of stage.js, the rig's own hands.
(function (G) {
  const X = G.ENG, Q = G.QCAST, S = G.SETS, C = G.CINE, R = G.RIG, ST = G.STAGE, { f, ol } = G.RIG;
  const { lit, up, behind, litWith, gripAt, still, clipTop } = ST;

  // ======================================================= WARD: the mother, the candle at her right
  const LW = { from: [1, 0.05], shadow: '#0a0604', shadowOp: 0.6, floor: '#140c06', floorOp: 0.5, contactOp: 0, key: '#ffd8a0', keyAdd: 0.12,
    rims: [{ from: [1, -0.1], col: '#ffb060', w: 6, op: 0.5 }, { from: [-0.8, -0.6], col: '#b0b2b0', w: 4, op: 0.12 }], face: { col: '#ffd0a0', op: 0.2 } };
  X.shot('WARD', 0, 1, t => {
    const cam = [540, 960, 1, 0]; X.CAM = cam;
    // sitting up against the pillows, the blanket to her waist, both hands resting on the turned-down sheet, the fingers
    // over its fold; her eyes on the door at the right, where the doctors come in
    const o = still(500, 2330, 1.2, { tilt: 4, breath: 0.5 });
    const hR = [-70, -836], hL = [92, -846], dR = [0.22, 0.97], dL = [-0.18, 0.98];
    const P = up(Q.mother(Object.assign(o, { noLegs: true, face: { expr: 'fear', look: [0.55, -0.04], lid: 0.12, brows: [-10, -2], mouth: 'parted', open: 0.1, sweat: 0.18, blush: 0.22, bags: 0.4 },
      armR: { hand: hR, dir: dR, pose: 'relaxed', facing: 'back' },
      armL: { hand: hL, dir: dL, pose: 'relaxed', facing: 'back' } })), o);
    const art = Q.motherArt();
    // the blanket goes over her body but never over her forearms and hands (they stay in the body's one light pass);
    // a soft contact shadow under each hand on the sheet, toward the dark side
    const Lh = Q.HAND.mother * R.HAND_K * o.s, sh = [[hR, dR], [hL, dL]].map(([h, d]) => { const w = R.toWorld(o, h), c = [w[0] + d[0] * Lh * 0.5 - 8, w[1] + d[1] * Lh * 0.5 + 10]; return `<ellipse cx="${f(c[0])}" cy="${f(c[1])}" rx="${f(Lh * 0.36)}" ry="${f(Lh * 0.5)}" fill="#1a0c04" opacity="0.32" filter="url(#b8)"/>`; }).join('');
    const chars = Q.litHair(P, o, art, LW) + behind(P, 't1wq', S.t1Quilt(t) + sh);
    const layers = S.t1Ward(t);
    layers.push({ p: 1, svg: S.t1WardBed(t) + chars }, { p: 1.02, svg: S.t1WardLight(t) }, { p: 1.25, svg: S.t1WardFg(t) });
    return X.compose(layers, cam) + C.vignette(0.55, '#060302', 0.4);
  }, { grade: 'gHall' });

  // ======================================================= BASIN: you at the washstand, the lantern at your left
  const LB = { from: [1, -0.45], shadow: '#0a0604', shadowOp: 0.6, floor: '#140c06', floorOp: 0.5, contactOp: 0, key: '#ffd8a0', keyAdd: 0.12,
    rims: [{ from: [1, -0.3], col: '#ffb868', w: 6, op: 0.5 }, { from: [-1, -0.2], col: '#c8a888', w: 4, op: 0.16 }], face: { col: '#ffd0a0', op: 0.2 } };
  // the whole scene as layers (KLEIN draws it again, small and hazed, behind the professor)
  const basinScene = (t, opts = {}) => {
    // (a little lower than the first draft, so the arms reach down far enough for the cuffs to go into the water: no bare
    // wrist between the sleeve and the waterline)
    const o = still(540, 2380, 1.2, { tilt: -3 });
    // both wrists under the waterline, the hands down in the chlorine water, backs to camera
    const wR = [452, 1430], wL = [628, 1430];
    const P = up(Q.semm(Object.assign(o, { noLegs: true, face: { expr: 'grim', look: [0.05, 0.5], lid: 0.22, brows: [7, -3], mouth: 'tight', sweat: 0.1 },
      armR: { hand: R.toLocal(o, wR), dir: [0.12, 1], pose: 'open', facing: 'back' },
      armL: { hand: R.toLocal(o, wL), dir: [-0.12, 1], pose: 'open', facing: 'back' } })), o);
    const body = clipTop('t1bTop' + (opts.id || ''), S.T1B.TOP, Q.litHair(P, o, Q.semmArt(), LB));
    // the bowl's far side and the far half of the water go over the body but never over the forearms (one light pass
    // for the whole figure); the near half of the water and the bowl's front wall then go over the arms
    const wr = [[wR[0] - 2, 0], [wL[0] + 2, 9]];
    const front = S.t1Stand(t) + behind(P, 't1bb' + (opts.id || ''), S.t1BowlBack() + S.t1Water(t, wr, 'back')) + S.t1Water(t, wr, 'front') + S.t1BowlFront() + S.t1StandProps(t) + S.t1Towel();
    const layers = S.t1Door(t, opts);
    layers.push({ p: 1, svg: body + front }, { p: 1.02, svg: S.t1DoorLight(t) });
    if (!opts.noFg) layers.push({ p: 1.25, svg: S.t1DoorFg(t) });
    return layers;
  };
  X.shot('BASIN', 1, 2, t => {
    const cam = [540, 960, 1, 0]; X.CAM = cam;
    return X.compose(basinScene(t), cam) + C.vignette(0.55, '#060302', 0.4);
  }, { grade: 'gHall' });

  // ======================================================= KLEIN: the professor in front, you at the bowl behind him
  const LK = { from: [1, -0.4], shadow: '#080402', shadowOp: 0.65, floor: '#120a06', floorOp: 0.5, contactOp: 0, key: '#ffd0a0', keyAdd: 0.12,
    rims: [{ from: [1, -0.35], col: '#ffb060', w: 7, op: 0.6 }, { from: [-1, -0.3], col: '#c8a888', w: 4, op: 0.14 }], face: { col: '#ffc890', op: 0.22 } };
  const HAZE = `<defs><filter id="t1Haze" filterUnits="userSpaceOnUse" x="-500" y="-500" width="2100" height="2900" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0.5 0 0 0 0.06  0 0.5 0 0 0.045  0 0 0.5 0 0.03  0 0 0 1 0"/><feGaussianBlur stdDeviation="3.6"/></filter></defs>`;
  // his cane (x = the shaft, gy = the grip): polished dark wood, a silver collar above the fist, the crook curling
  // away from his body, the shaft down to the floor
  const cane = (x, gy) => {
    let g = `<path d="M${x - 9},${gy - 40} L${x - 7},2100 L${x + 7},2100 L${x + 9},${gy - 40}Z" fill="#2a1a12" ${ol(1.3)}/><path d="M${x + 4},${gy} L${x + 5},2100" stroke="#c08a58" stroke-width="2.5" opacity="0.5"/>`;
    const crook = `M${x},${gy - 44} C${x},${gy - 96} ${x - 20},${gy - 118} ${x - 52},${gy - 118} C${x - 84},${gy - 118} ${x - 100},${gy - 96} ${x - 100},${gy - 70} C${x - 100},${gy - 60} ${x - 98},${gy - 52} ${x - 94},${gy - 46}`;
    g += `<path d="${crook}" stroke="#120a06" stroke-width="22" fill="none" stroke-linecap="round"/><path d="${crook}" stroke="#3a2416" stroke-width="16" fill="none" stroke-linecap="round"/><path d="M${x - 3},${gy - 60} C${x - 4},${gy - 96} ${x - 22},${gy - 112} ${x - 50},${gy - 112}" stroke="#d8a070" stroke-width="3" fill="none" opacity="0.6" stroke-linecap="round"/>`;
    g += `<rect x="${x - 11}" y="${gy - 50}" width="22" height="14" rx="3" fill="#a8a8a2" ${ol(1.1)}/><path d="M${x + 4},${gy - 48} L${x + 4},${gy - 38}" stroke="#fff" stroke-width="2.5" opacity="0.7"/>`;
    return g;
  };
  X.shot('KLEIN', 2, 3, t => {
    const cam = [540, 960, 1, 0]; X.CAM = cam;
    const back = `<rect x="-200" y="-200" width="1480" height="2320" fill="#120a06"/>` + HAZE +
      `<g filter="url(#t1Haze)"><g transform="translate(-60,340) scale(0.64)">${X.compose(basinScene(t + 0.4, { noLantern: true, noFg: true, id: 'k' }), cam)}</g></g>`;
    X.CAM = cam;
    // heavy and at ease: his right fist on the cane in front of him, the left hand on his hip; the chin up, a smirk,
    // his eyes on you at the bowl
    const o = still(735, 2400, 1.3, { tilt: 3 });
    const gC = [578, 1452];
    const P = up(Q.klein(Object.assign(o, { noLegs: true, face: { expr: 'stern', mouth: 'closed', cd: -1.4, look: [-0.62, 0.1], lid: 0.42, brows: [10, -4], bags: 0.5 },
      armR: gripAt(o, Q.HAND.klein, gC, [1, 0.04], { facing: 'back', detachHand: true }),
      armL: { hand: [172, -840], dir: [-0.7, 0.7], pose: 'relaxed', facing: 'back', fs: 1, elbow: 'free' } })), o);
    // body, hair, cane and the fist on it lit in ONE pass (a hand or hair lit on its own gets a rim round its own
    // outline and reads as pasted on); the light's box widened to take in the crook and the shaft
    const chars = Q.litHair(P, o, Q.kleinArt(), LK, cane(gC[0], gC[1]) + P.handR, [gC[0] - 130, gC[1] - 140, gC[0] + 40, 2100]);
    const light = C.radial(1180, 520, 900, '#ffb060', 0.2) + `<rect x="-200" y="-200" width="1480" height="2320" fill="url(#t1kFall)"/>`;
    const fall = S.lg('t1kFall', [[0, '#000', 0.35], [0.4, '#000', 0.12], [1, '#000', 0]], 0, 0, 1, 0);
    return back + X.compose([{ p: 1, svg: fall + chars }, { p: 1.02, svg: light }], cam) + C.vignette(0.55, '#060302', 0.4);
  }, { grade: 'gHall' });
})(window);
