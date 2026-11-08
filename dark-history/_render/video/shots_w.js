// Look test for the Coca-Cola video: three stills, three different scenes (no camera move, no transitions yet).
// BATTLE (0-1 s): "A sword slices open your chest, and the doctors give you the only painkiller they have, morphine"
// ROOM   (1-2 s): "So you start mixing medicines in your back room"
// FOUNT  (2-3 s): "sell it as a brain tonic, five cents a glass"
// The clean rig (G.RIG_CRISP), the cast dressed with tailor.js, the shot helpers of stage.js. The rig's own hands;
// held things that must stay level (the bottle's label, the glass) stand upright in the world and the fist is a
// detached hand whose grip slot sits on the bottle's neck / the glass's middle, drawn over it.
(function (G) {
  const X = G.ENG, Q = G.QCAST, S = G.SETS, C = G.CINE, R = G.RIG, ST = G.STAGE;
  const { lit, up, armsOver, handsLit, gripAt, fingersFor, still, clipTop, nrm } = ST;

  // ======================================================= BATTLE: cut down at Columbus; the surgeon's morphine
  const LB = { from: [1, 0.12], shadow: '#0c0604', shadowOp: 0.6, floor: '#1a0e08', floorOp: 0.5, contactOp: 0, key: '#ffc890', keyAdd: 0.12,
    rims: [{ from: [1, -0.15], col: '#ff8a3a', w: 7, op: 0.7 }, { from: [-0.4, -1], col: '#ffb070', w: 5, op: 0.3 }], face: { col: '#ffc088', op: 0.2 } };
  X.shot('BATTLE', 0, 1, t => {
    const cam = [540, 960, 1, 0]; X.CAM = cam;
    // you, sitting against the broken wheel, a hand pressed to the cut, looking up at the surgeon
    const yo = still(372, 2543, 1.18, { sway: -2, tilt: -9 });
    const YP = up(Q.pembYoungHurt(Object.assign(yo, { noLegs: true, face: { expr: 'fear', mouth: 'cry', open: 0.16, lid: 0.46, brows: [-16, 4], look: [0.8, -0.3], sweat: 0.2 },
      armR: { hand: [18, -958], dir: [0.92, -0.25], pose: 'open', facing: 'back' },
      armL: { hand: [178, -690], dir: [0.15, 1], pose: 'relaxed', facing: 'back' } })), yo);
    // the surgeon kneels at your side and holds the bottle out to you across his body (his left fist round its neck)
    const so = still(948, 2414, 1.22, { sway: -6, tilt: -8 }), gB = [606, 1328], hB = 210;
    const SP = up(Q.surgeon(Object.assign(so, { noLegs: true, face: { expr: 'grim', look: [-0.85, 0.25], lid: 0.34, mouth: 'tight', brows: [8, -4], sweat: 0.12 },
      armL: gripAt(so, Q.HAND.surgeon, gB, [-1, 0.06], { facing: 'back', detachHand: true }),
      armR: { hand: [-160, -730], dir: [-0.1, 1], pose: 'relaxed', facing: 'back' } })), so);
    const chars = lit(YP, LB) + Q.headArt(YP, yo, Q.SOOT) + lit(SP, LB) + S.morphineBottle(gB[0], gB[1] + hB * S.MORPH_GRIP, hB) + handsLit(SP, LB, 'L');
    const layers = S.battle(t);
    layers.push({ p: 1, svg: chars + S.battleFront(t) }, { p: 1.02, svg: S.battleLight(t) }, { p: 1.3, svg: S.battleFg(t) });
    return X.compose(layers, cam) + C.vignette(0.55, '#060302', 0.4);
  }, { grade: 'gHall' });

  // ======================================================= ROOM: the back room by lamplight, grinding the coca leaves
  const LR = { from: [-1, 0.25], shadow: '#0a0604', shadowOp: 0.62, floor: '#140c06', floorOp: 0.5, contactOp: 0, key: '#ffd8a0', keyAdd: 0.12,
    rims: [{ from: [-1, 0.1], col: '#ffb060', w: 6, op: 0.55 }, { from: [0.8, -0.8], col: '#b8a890', w: 4, op: 0.16 }], face: { col: '#ffd0a0', op: 0.2 } };
  X.shot('ROOM', 1, 2, t => {
    const cam = [540, 850, 1, 0]; X.CAM = cam;
    const o = still(560, 2430, 1.2, { tilt: 5 });
    // the pestle: its porcelain head down in the bowl, the handle leaning back to your right hand
    const [mx, my] = S.BR.MORTAR, H = [mx + 14, my + 52], u = nrm([-106, -198]), gp = [H[0] + u[0] * 83 * o.s, H[1] + u[1] * 83 * o.s];
    const P = up(Q.pembOld(Object.assign(o, { noLegs: true, face: { expr: 'grim', look: [0.08, 0.85], lid: 0.4, mouth: 'tight', brows: [-9, 5], sweat: 0.15, bags: 0.6, age: true },
      armR: gripAt(o, Q.HAND.pembOld, gp, fingersFor('R', 'back', u), { hold: G.PROPS.pestleG() }),
      armL: { hand: R.toLocal(o, [756, 1334]), dir: [-0.45, 0.9], pose: 'open', facing: 'back' } })), o);
    const body = clipTop('rmTop', S.BR.TOP, lit(P, LR));
    const front = S.bench(t) + armsOver(P, LR, 'R') + S.mortarFront() + armsOver(P, LR, 'L');
    const layers = S.backroom(t);
    layers.push({ p: 1, svg: body + front }, { p: 1.02, svg: S.roomLight(t) }, { p: 1.25, svg: S.roomFg(t) });
    return X.compose(layers, cam) + C.vignette(0.55, '#060302', 0.4);
  }, { grade: 'gHall' });

  // ======================================================= FOUNT: the clerk sets a glass down for you; you watch from the back
  const LF = { from: [1, -0.35], shadow: '#2a1a10', shadowOp: 0.42, floor: '#3a2a1a', floorOp: 0.38, contactOp: 0, key: '#fff0dc', keyAdd: 0.08,
    rims: [{ from: [1, -0.3], col: '#fff2dc', w: 6, op: 0.45 }, { from: [-1, -0.2], col: '#ffc890', w: 4, op: 0.22 }], face: { col: '#fff0e0', op: 0.12 } };
  const HAZE = `<defs><filter id="sfHaze" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0.74 0 0 0 0.15  0 0.74 0 0 0.12  0 0 0.74 0 0.09  0 0 0 1 0"/></filter></defs>`;
  X.shot('FOUNT', 2, 3, t => {
    const cam = [540, 900, 1, 0]; X.CAM = cam;
    // you, at the back by the mirror: your hands down at your sides, below the counter's edge
    const po = still(905, 1937, 0.9, { tilt: -3 });
    const PP = up(Q.pembOld(Object.assign(po, { noLegs: true, face: { expr: 'anxious', look: [-0.7, 0.35], lid: 0.3, mouth: 'closed', brows: [-6, 2], bags: 0.6, age: true },
      armR: { hand: [-140, -610], dir: [0, 1], pose: 'relaxed', facing: 'back' }, armL: { hand: [140, -610], dir: [0, 1], pose: 'relaxed', facing: 'back' } })), po);
    // the clerk sets the glass down on the marble in front of you (his left hand round it, back to camera)
    const co = still(600, 2324, 1.15, { tilt: -3 }), gG = [548, 1302], hG = 180;
    const CP = up(Q.clerk(Object.assign(co, { noLegs: true, face: { expr: 'neutral', mouth: 'smile', open: 0.06, look: [-0.05, 0.05], lid: 0.12, brows: [5, 3] },
      armL: gripAt(co, Q.HAND.clerk, gG, [-1, 0.05], { facing: 'back', detachHand: true }),
      armR: { hand: R.toLocal(co, [300, 1420]), dir: [0.25, 1], pose: 'relaxed', facing: 'back' } })), co);
    const back = HAZE + clipTop('sfTop1', S.SF.TOP, `<g filter="url(#sfHaze)">${lit(PP, LF)}</g>`);
    const clerk = clipTop('sfTop2', S.SF.TOP, lit(CP, LF));
    const onCounter = armsOver(CP, LF, 'RL') + S.sodaGlass(gG[0], gG[1] + hG * S.GLASS_GRIP, hG) + handsLit(CP, LF, 'L');
    const layers = S.fountainBack(t);
    layers.push({ p: 1, svg: back + clerk + S.counter(t) + onCounter }, { p: 1.02, svg: S.fountLight(t) }, { p: 1.25, svg: S.fountFg(t) });
    return X.compose(layers, cam) + C.vignette(0.45, '#060302', 0.45);
  }, { grade: 'gHall' });
})(window);
