// "Coca-Cola", part 3, and the loop. Times from _vo18/words.txt.
// FOUNT (31.32 .. 35.75) "mix it with fizzy water, and sell it as a brain tonic, five cents a glass."  the soda tap
//                       fizzing into the syrup, the clerk sets the glass down, the BRAIN TONIC card, the nickel spins
//                       down, you watching from the back
// ROOM3 (35.05 .. 43.4)  "It never cures you. But when you die two years later, still hooked on morphine, after selling
//                       your share of the business, you never find out what your drink becomes."  the bottle clutched
//                       to your chest, the head going down, the lamp guttering out, the calendar flying to 1888, the
//                       empty chair, the bottle, the bill of sale, the last glass of the drink, its bubbles rising
// MAP   (42.8 .. 46.2)   "Today it's sold in almost every country on earth,"  the old map; from Atlanta the lights
// NAME  (45.6 .. 47.333) "and it's called Coca-Cola."  the card on the mirror: BRAIN TONIC fades, the name is written
//                       in; the glass in front; its bubbles become the embers over the burning town of frame 0
(function (G) {
  const X = G.ENG, Q = G.QCAST, S = G.SETS, C = G.CINE, R = G.RIG, ST = G.STAGE, PR = G.PROPS, V = G.CCV;
  const { ss, lerp } = X, { f, rng } = R;
  const { up, behind, gripAt, clipTop, nrm, fingersFor, still } = ST;
  const { cl, env, bump, idle, hh, scr, camOn, L2 } = V;
  const faceW = o => R.toWorld(o, R.headPt(o, 'man', [0, 0]));

  // ======================================================= FOUNT
  const LF = { from: [1, -0.35], shadow: '#2a1a10', shadowOp: 0.42, floor: '#3a2a1a', floorOp: 0.38, contactOp: 0, key: '#fff0dc', keyAdd: 0.08,
    rims: [{ from: [1, -0.3], col: '#fff2dc', w: 6, op: 0.45 }, { from: [-1, -0.2], col: '#ffc890', w: 4, op: 0.22 }], face: { col: '#fff0e0', op: 0.12 } };
  const HAZE = `<defs><filter id="sfHaze2" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0.74 0 0 0 0.15  0 0.74 0 0 0.12  0 0 0.74 0 0.09  0 0 0 1 0"/></filter></defs>`;
  // (restaged after the second review: the tap stands in front of him on the marble, the glass under its nozzle with its
  // foot on the marble in front of the counter's far edge - it was cut off at that edge and stood behind the counter -
  // and his left elbow stays at his side, the forearm coming forward to the glass, the hand round its front. The hand
  // was asked to point back over a forearm that went up and out, and the forearm hid behind the counter: a floating hand)
  const TAPX = 922, TAPY = 1404, NOZ = [TAPX + S.TAP_NOZ[0], TAPY + S.TAP_NOZ[1]], HG = 180;
  // the glass (its grip point): held under the nozzle while it fills, then slid a little along the marble toward you
  V.ftGlass = t => L2([NOZ[0], 1318], [690, 1352], ss(32.75, 33.45, t));
  // you, at the back on the left under your BRAIN TONIC card, looking across at the glass (moved from behind the tap: your
  // hands, hanging at your sides, showed over the counter's edge right beside the clerk's hand on the glass - set lower
  // now, they are behind the counter)
  const PO = { x: 250, y: 2045, s: 0.9 };
  V.ftPemb = t => { const id = idle(t, 51, 0.4); return Object.assign({}, PO, { sway: id.sway * 0.5, tilt: 3 - 2 * ss(34.6, 35.3, t), breath: id.breath, blink: t > 34.9 ? 0 : id.blink }); };
  const NICK = [560, 1472];
  X.shot('FOUNT', 31.32, 35.75, t => {
    const c = hh(V.ftCam(t), t, 0.8, 11);
    const po = V.ftPemb(t);
    const PP = up(Q.pembOldCoat(Object.assign({}, po, { noLegs: true, face: V.faceAt(t, [[31.3, { expr: 'anxious', look: [0.7, 0.35], lid: 0.3, mouth: 'closed', brows: [-6, 2], bags: 0.6, age: true }], [34.8, { expr: 'tired', look: [0.4, 0.5], lid: 0.5, mouth: 'tight', brows: [-10, 5], bags: 0.7, age: true }]], 0.5),
      armR: { hand: [-140, -610], dir: [0, 1], pose: 'relaxed', facing: 'back' }, armL: { hand: [140, -610], dir: [0, 1], pose: 'relaxed', facing: 'back' } })), po);
    const cid = idle(t, 53, 0.4), co = { x: 600, y: 2324, s: 1.15, sway: cid.sway * 0.5 + 1.2 * ss(32.7, 33.4, t), tilt: -3, breath: cid.breath, blink: cid.blink };
    const gG = V.ftGlass(t);
    const CP = up(Q.clerk(Object.assign(co, { noLegs: true, face: V.faceAt(t, [[31.3, { expr: 'neutral', mouth: 'closed', look: [0.4, -0.2], lid: 0.12, brows: [4, 2] }], [33.0, { expr: 'neutral', mouth: 'smile', open: 0.06, look: [-0.05, 0.05], lid: 0.12, brows: [5, 3] }]], 0.4),
      // (elbowM 1: the outer of the two elbows - the elbow a little out from his side, the forearm coming down into the hand;
      // the elbow under the shoulder ran the forearm out to the right and the hand folded back over it)
      armL: gripAt(co, Q.HAND.clerk, gG, [-1, 0.15], { facing: 'back', detachHand: true, elbowM: 1, elbowMK: 1 }),
      armR: { hand: R.toLocal(co, [372, 1424]), dir: [0.25, 1], pose: 'relaxed', facing: 'back' } })), co);
    // the soda: the lever pulled, the jet into the glass, the syrup turning brown, the head rising
    const pull = 0.6, flow = env(t, 31.2, 31.45, 32.5, 32.75), lev = 0.12 + 0.82 * ss(31.45, 32.6, t), mixk = ss(31.6, 32.7, t), foam = ss(31.9, 32.7, t);
    const gy = gG[1] + HG * S.GLASS_GRIP, liq = gy - 14 * HG / 160 - (128 - 14) * HG / 160 * lev;
    // (the stream inside the glass is drawn with the glass, behind its front wall and the hand; above the rim on its own)
    const glassS = S.fillGlass(gG[0], gy, HG, t, lev, mixk, foam, { id: 'ft', jet: { flow, t } });
    const jetS = S.jet(NOZ[0], NOZ[1], gy - HG + 2, t, flow);
    // the nickel drops at the right of the glass, bounces, spins down flat
    const nt = t - 34.38;
    let nick = '';
    if (nt > -0.22) {
      // falling (tumbling on its edge), two small bounces, then spinning down flat on the marble
      const y = nt < 0 ? NICK[1] - 420 * (nt / 0.22) ** 2 : NICK[1] - (nt < 0.34 ? Math.abs(Math.sin(nt * 9.24)) * 44 * Math.exp(-nt * 6) : 0);
      const spin = nt < 0 ? 1 : Math.exp(-Math.max(0, nt - 0.08) * 3.4);
      nick = S.nickel(NICK[0], y, Math.min(1, spin), t * (12 + 34 * spin), NICK[1]);
    }
    const back = HAZE + clipTop('ftTop1', S.SF.TOP, `<g filter="url(#sfHaze2)">${Q.litHair(PP, po, Q.pembOldArt(), LF)}</g>`);
    // the clerk is cut off at the counter's far edge - his body and the arms' shadow on it - but not the glass standing on
    // the marble in front of that edge nor the hand round it; all in one light pass. The tap stands in front of him.
    const clerk = Q.litHair(CP, co, Q.clerkArt(), LF, glassS + CP.handL, [gG[0] - 90, gG[1] - 150, gG[0] + 130, gy + 30], { id: 'ftTop2', y: S.SF.TOP, under: Q.armAO(CP, co, 'RL', LF) });
    const layers = S.fountainBack(t);
    layers.push({ p: 1, svg: back + S.counter(t, { noNickel: true, trayX: 1190 }) + clerk + S.tap(TAPX, TAPY, t, pull) + jetS + nick }, { p: 1.02, svg: S.fountLight(t) }, { p: 1.25, svg: S.fountFg(t) });
    return X.compose(layers, c) + C.vignette(0.45, '#060302', 0.45);
  }, { grade: 'gHall' });
  V.ftCam = (() => { const card = camOn([250, 564], 0.86), pf = faceW(PO); return V.cam([
    [31.2, [NOZ[0] + 10, 1240, 2.1, 0.4]], [32.1, [NOZ[0] + 14, 1254, 2.15, 0.2]],    // the tap fizzing into the syrup
    [32.9, [620, 1170, 1.5, -0.2]],                                            // pull back with the glass
    [33.65, [card[0] + 20, card[1] + 30, 1.86, -0.5]],                          // "brain tonic": the card
    [34.1, [330, 960, 1.36, -0.3]],                                             // (wider on the way down)
    [34.62, [NICK[0] + 30, NICK[1] - 60, 1.6, -0.2]],                          // "five cents": the nickel lands
    [35.3, [pf[0] - 10, pf[1] + 30, 1.95, 0.3]], [35.8, [pf[0], pf[1] + 10, 2.4, 0.4]]]); })();
  V.ftFace = t => { const po = V.ftPemb(t), c = V.ftCam(t), w = faceW(po); return { p: scr(w, c), s: po.s * c[2], r: (po.sway || 0) + (po.tilt || 0) }; };

  // ======================================================= ROOM3
  // (BOT: the morphine bottle's base, standing on the bench in front of him - and left there when he is gone)
  const R3 = { BOT: [640, 1470], SALE: [870, 1452], GLASS: [330, 1482], CHAIR: [560, 1322], CAL: [180, 795] };
  V.r3Gone = 37.75;
  V.r3O = t => { const id = idle(t, 61, 0.4), die = ss(36.55, 37.05, t); return { x: 560, y: 2430, s: 1.2, sway: id.sway * 0.4 * (1 - die) + 3 * die, tilt: 4 + 18 * die, breath: id.breath * (1 - 0.85 * die), blink: 0 }; };
  X.shot('ROOM3', 35.05, 43.4, t => {
    const c = hh(V.r3Cam(t), t, 0.75, 12);
    const lampK = 1 - ss(36.75, 37.35, t) * 0.97 - ss(37.35, 37.5, t) * 0.03, lampOut = t > 37.5 ? t - 37.5 : -1, flip = 2 * ss(37.15, 37.95, t);
    const gone = t >= V.r3Gone;
    let body = '';
    if (!gone) {
      const o = V.r3O(t), F = V.faceAt(t, [
        [35.0, { expr: 'grief', look: [0.1, 0.6], lid: 0.9, mouth: 'tight', brows: [-16, 8], sweat: 0.28, bags: 0.8, age: true }],
        [36.0, { expr: 'grief', look: [0.0, 0.7], lid: 0.96, mouth: 'parted', open: 0.05, brows: [-12, 6], sweat: 0.24, bags: 0.8, age: true }],
        [36.8, { expr: 'hollow', look: [0, 0.8], lid: 1, mouth: 'parted', open: 0.04, brows: [-2, 0], sweat: 0.1, bags: 0.8, age: true }]], 0.5);
      // the bottle standing on the bench in front of you, your hand round its neck, slipping down it as you die
      // (after the review: held up at the chest or the belly, the forearm folded back over the upper arm, and the sleeve
      // - one shape from the shoulder to the cuff - showed the upper arm's folds and a pale patch through it: a grey,
      // see-through forearm. Now the upper arm hangs and the forearm reaches forward to the bottle, no fold.
      // The other arm hangs at his side behind the bench: a hand left on the bench away from the lamp was almost black)
      const die = ss(36.55, 37.05, t), gB = L2([R3.BOT[0], R3.BOT[1] - 190 * S.MORPH_GRIP], [R3.BOT[0] + 6, R3.BOT[1] - 190 * S.MORPH_GRIP + 18], die);
      const P = up(Q.pembOld(Object.assign(o, { noLegs: true, face: F,
        armR: gripAt(o, Q.HAND.pembOld, gB, [1, 0.04], { facing: 'back', detachHand: true }),
        armL: { hand: R.toLocal(o, L2([748, 1500], [744, 1508], die)), dir: [-0.05, 1], pose: 'relaxed', facing: 'back' } })), o);
      const bot = S.morphineBottle(R3.BOT[0], R3.BOT[1], 190);
      body = clipTop('r3Top', S.BR.NEAR, Q.litHair(P, o, Q.pembOldArt(), V.LR2, bot + P.handR, [gB[0] - 90, gB[1] - 80, gB[0] + 90, gB[1] + 230]));
      body += V.behindAlso(P, 'r3bt', S.benchTop(t, { morph: false, coca: false, kola: false, flask: false, notebook: false, mortar: false, sale: { x: R3.SALE[0], y: R3.SALE[1] }, glass: { x: R3.GLASS[0], y: R3.GLASS[1], h: 170, lit: 0.7 }, lampK, lampOut }), P.handR + bot, 'R');
    } else body = S.benchTop(t, { morph: false, coca: false, kola: false, flask: false, notebook: false, mortar: false, sale: { x: R3.SALE[0], y: R3.SALE[1] }, glass: { x: R3.GLASS[0], y: R3.GLASS[1], h: 170, lit: 0.7 }, lampK, lampOut }) + S.morphineBottle(R3.BOT[0], R3.BOT[1], 190);
    // the dark coming down over the bench as the lamp dies, the street lamp's glow from the window left on it
    const dk = 1 - lampK;
    // (the dark falls on the bench and on him through a filter on this layer only - a dark rectangle here also covered
    // the wall behind and hid the calendar)
    const k = 1 - 0.5 * dk, dkF = dk > 0.01 ? `<defs><filter id="r3dk" filterUnits="userSpaceOnUse" x="-1000" y="-500" width="3200" height="3000" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="${f(k)} 0 0 0 0  0 ${f(k)} 0 0 0  0 0 ${f(k)} 0 0  0 0 0 1 0"/></filter></defs>` : '';
    const dark = dk > 0.01 ? C.radial(260, 1180, 820, '#c8a07a', 0.3 * dk) + C.radial(R3.GLASS[0], R3.GLASS[1] - 90, 160, '#e8b880', 0.22 * dk) : '';
    const layers = S.backroom(t);
    layers.push({ p: 0.75, svg: S.roomWall(t, { cal: [['1886', 'JULY'], ['1887', 'MARCH'], ['1888', 'AUGUST']], flip, lampK }) });
    const near = S.chair(...R3.CHAIR) + body + S.benchFront(t, { lampK });
    layers.push({ p: 1, svg: (dkF ? dkF + `<g filter="url(#r3dk)">${near}</g>` : near) + dark }, { p: 1.02, svg: dk < 0.99 ? `<g opacity="${f(1 - dk)}">${S.roomLight(t)}</g>` : '' }, { p: 1.25, svg: `<g opacity="${f(1 - 0.7 * dk)}">${S.roomFg(t)}</g>` });
    return X.compose(layers, c) + C.vignette(0.6, '#030101', 0.38);
  }, { grade: 'gHall' });
  V.r3Cam = (() => { const cal = camOn(R3.CAL, 0.75); return V.cam([
    [35.0, [560, 900, 2.4, 0.2]], [35.9, [552, 940, 2.15, 0]],          // the facepush lands; "It never cures you"
    [36.6, [520, 960, 1.72, -0.2]],                                     // the bottle at his chest; "die": his head goes down
    [37.1, [380, 1040, 1.36, -0.4]],                                    // the lamp gutters out beside him
    [37.75, [cal[0] + 10, cal[1] + 20, 1.9, -0.6]],                     // "two years later": the calendar flies to 1888
    [38.9, [R3.BOT[0] - 20, R3.BOT[1] - 120, 1.8, -0.2]],               // the empty chair, the bottle ("morphine")
    [40.35, [R3.SALE[0], R3.SALE[1] - 20, 2.3, 0.2]],                   // "selling your share": the bill of sale
    [42.0, [R3.GLASS[0] + 10, R3.GLASS[1] - 100, 2.3, 0.3]],            // "your drink"
    [43.45, [R3.GLASS[0] + 2, R3.GLASS[1] - 82, 3.7, 0.2]]]); })();
  V.r3Face = t => { const o = V.r3O(t), c = V.r3Cam(t), w = faceW(o); return { p: scr(w, c), s: o.s * c[2], r: (o.sway || 0) + (o.tilt || 0) }; };

  // ======================================================= MAP
  X.shot('MAP', 42.8, 46.2, t => {
    const c = hh(V.mpCam(t), t, 0.6, 13);
    const layers = S.worldMap(t, ss(43.35, 45.85, t));
    return X.compose(layers, c) + C.vignette(0.55, '#060302', 0.4);
  }, { grade: 'gHall' });
  V.mpCam = (() => { const a = S.mapPt('atlanta'); return V.cam([[42.7, [a[0], a[1], 2.75, 0.3]], [43.6, [a[0] + 30, a[1] + 10, 2.3, 0]], [44.6, [380, 900, 1.3, -0.3]], [45.5, [540, 960, 0.8, -0.2]], [46.3, [548, 970, 0.74, 0]]]); })();

  // ======================================================= NAME
  const CARD = camOn([250, 564], 0.86);
  // the glass of the drink in front, close to the lens (foreground layer, p 1.25): where it is on that layer
  const NG = [236, 652];
  // (after the review: the name holds - written in by 47.02, it stays ~2 s on the screen before the loop morph; it was on
  // for a fraction of a second. The shot runs to the end of the film, X.T_END)
  X.shot('NAME', 45.6, X.T_END + 0.01, t => {
    const c = hh(V.nmCam(t), t, 0.6, 14);
    const k = 0.4 * ss(46.36, 46.58, t) + 0.6 * ss(46.54, 47.02, t);
    const layers = S.fountainBack(t);
    layers[1] = { p: 0.86, svg: S.card2(k) + (k > 0.4 ? C.radial(250, 548, 260, '#ffd8a0', 0.18 * ss(46.6, 47.0, t)) : '') };
    layers.push({ p: 1.02, svg: S.fountLight(t) }, { p: 1.25, svg: `<g filter="url(#dof2)">${S.drinkGlass(NG[0], NG[1], 170, t, 1, { id: 'n', seed: 21 })}</g>` });
    return X.compose(layers, c) + C.vignette(0.5, '#060302', 0.42);
  }, { grade: 'gHall' });
  V.nmCam = V.cam([[45.5, [CARD[0] + 40, CARD[1] + 120, 1.45, -0.4]], [46.25, [CARD[0] + 6, CARD[1] + 20, 2.05, -0.2]], [46.95, [CARD[0], CARD[1] + 4, 2.45, 0]],
    [47.5, [CARD[0] + 4, CARD[1] + 12, 2.56, 0.05]], [X.T_END, [CARD[0] + 14, CARD[1] + 40, 2.9, 0.25]]]);   // the slow push on the name, held
  V.nmBubbles = t => scr([NG[0], NG[1] - 90], V.nmCam(t), 1.25);

  // ---------------------------------------------------------------- transitions (part 3) and the loop
  // the syrup turning in the kettle becomes the syrup in the glass under the tap
  X.tr('zmatch', 31.62, 0.6, 'SYRUP', 'FOUNT', { fa: scr([S.KT.CX, S.KT.RIM + 6], V.syCam(31.62)), fb: scr([NOZ[0], V.ftGlass(31.62)[1] + HG * S.GLASS_GRIP - 20], V.ftCam(31.62)), za: 2.6, zb: 0.6, plain: true, fade: [0.44, 0.56], blur: 7, bpow: 4 });
  // your face at the fountain becomes your face in the dark, two years on
  X.tr('facepush', 35.4, 0.7, 'FOUNT', 'ROOM3', { faceA: V.ftFace, faceB: V.r3Face, za: 2.6, fade: [0.43, 0.57], blur: 5, bpow: 4 });
  // the camera dives into the drink and comes up in the map
  X.tr('surface', 43.1, 0.6, 'ROOM3', 'MAP', { dir: 1, seed: 23, tint: '#e8a868', line: '#f0c890', core: '#fff0d8', bub: '#f8d8a8' });
  // the light of Atlanta opens onto the card
  X.tr('radial', 45.9, 0.6, 'MAP', 'NAME', { fa: scr(S.mapPt('atlanta'), V.mpCam(45.9)), fb: scr([250, 548], V.nmCam(45.9), 0.86), za: 1.12, zb: 1.16, soft: 0.5, ring: '#ffd8a0', ringOp: 0.5 });
  // the loop: the drink's rising bubbles become the embers rising over the burning town at frame 0
  X.tr('morph', X.T_END, 0.5, 'NAME', 'SLASH', { end: true, bOff: -X.T_END, fa: V.nmBubbles(X.T_END - 0.25), fb: [560, 1180], za: 1.3, zb: 1.2, fade: [0.45, 0.55], blur: 5, bpow: 6, col: '#ffb070' });
})(window);
