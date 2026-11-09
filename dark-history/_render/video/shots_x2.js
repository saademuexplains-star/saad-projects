// "Coca-Cola", part 2. Times from _vo18/words.txt.
// ROOM2 (11.02 .. 19.08) "a respected man with a secret, desperate to find a substitute. So you start mixing medicines
//                       in your back room, and you find two strange ingredients:"  the diploma -> grinding -> the
//                       glance at the hidden bottle -> desperate over the notebook -> mixing -> he looks up at the sack
// MACRO (18.48 .. 23.75) "leaves of the coca plant, the same plant cocaine comes from, and a nut packed with caffeine."
// WINE  (23.15 .. 28.43) "You blend them with wine and sell it as a cure for headaches, nerves, and even morphine
//                       addiction."  the jar filling, the bottles, the handbill line by line, his guilty face
// BAN   (27.87 .. 29.83) "When the city bans alcohol,"  the newspaper slaps down on the bench: ATLANTA GOES DRY
// SYRUP (29.27 .. 31.92) "you swap the wine for sweet brown syrup,"  the copper kettle over the fire in the yard
(function (G) {
  const X = G.ENG, Q = G.QCAST, S = G.SETS, C = G.CINE, R = G.RIG, ST = G.STAGE, PR = G.PROPS, V = G.CCV;
  const { ss, lerp } = X, { f, rng, mix } = R;
  const { up, behind, gripAt, clipTop, nrm, fingersFor } = ST;
  const { cl, env, bump, idle, hh, scr, camOn, L2 } = V;
  // ST.behind with more in the mask than the arms (a detached fist, a rod, a paddle)
  const behindAlso = (P, id, svg, extraMask, which = 'RL') => {
    const E = P.info && P.info.ext, m = 160, [x0, y0, x1, y1] = E ? [E[0] - m, E[1] - m, E[2] + m, E[3] + m] : [-1500, -1500, 4000, 4000];
    const Rr = `x="${Math.round(x0)}" y="${Math.round(y0)}" width="${Math.round(x1 - x0)}" height="${Math.round(y1 - y0)}"`;
    return `<defs><filter id="${id}k" filterUnits="userSpaceOnUse" ${Rr} color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 3 -1"/></filter>` +
      `<mask id="${id}" maskUnits="userSpaceOnUse" x="-1500" y="-1500" width="5500" height="5500"><rect x="-1500" y="-1500" width="5500" height="5500" fill="#fff"/><g filter="url(#${id}k)">${which.includes('R') ? P.armRsvg : ''}${which.includes('L') ? P.armLsvg : ''}${extraMask || ''}</g></mask></defs><g mask="url(#${id})">${svg}</g>`;
  };
  V.behindAlso = behindAlso;
  const OLD = { X: 560, Y: 2430, S: 1.2 };
  const oldAt = (t, seed, extra = {}) => { const id = idle(t, seed, 0.5); return Object.assign({ x: OLD.X, y: OLD.Y, s: OLD.S, sway: id.sway * 0.6, tilt: 5, breath: id.breath, blink: id.blink }, extra); };

  // ======================================================= ROOM2
  const DIP = [-164, 352];          // the diploma (wall layer, p 0.75)
  const SACK = [1200, 875];         // the COCA sack on the shelf (wall layer)
  // the pestle grinding round the bowl (amp 0 = resting); its head H and the handle's direction u
  const grind = (t, amp) => { const a = t * 7.2, [mx, my] = S.BR.MORTAR; return { H: [mx + 14 + 22 * amp * Math.cos(a), my + 52 + 6 * amp * Math.sin(a)], u: nrm([-106 + 14 * amp * Math.cos(a), -198]) }; };
  V.r2Grind = t => env(t, 10.6, 11.0, 12.45, 12.7) * 1 + env(t, 14.65, 15.0, 16.85, 17.15) * 1.15;
  X.shot('ROOM2', 11.02, 19.08, t => {
    const c = hh(V.r2Cam(t), t, 0.85, 6);
    const lean = env(t, 12.95, 13.4, 14.5, 14.95), look = ss(16.8, 17.5, t);
    const o = oldAt(t, 21, { tilt: 5 + 5 * lean - 9 * look, sway: idle(t, 21).sway * 0.6 + 1.5 * lean, blink: (t > 12.5 && t < 13.05) || t > 16.9 ? 0 : idle(t, 21).blink });
    const { H, u } = grind(t, V.r2Grind(t)), gp = [H[0] + u[0] * 83 * o.s, H[1] + u[1] * 83 * o.s];
    const F = V.faceAt(t, [
      [11.0, { expr: 'grim', look: [0.08, 0.85], lid: 0.4, mouth: 'tight', brows: [-9, 5], sweat: 0.12, bags: 0.6, age: true }],
      [12.62, { expr: 'anxious', look: [-0.75, 0.55], lid: 0.26, mouth: 'tight', brows: [-12, 6], sweat: 0.18, bags: 0.6, age: true }],
      [12.86, { expr: 'anxious', look: [0.85, -0.05], lid: 0.22, mouth: 'tight', brows: [-12, 6], sweat: 0.2, bags: 0.6, age: true }],
      [13.2, { expr: 'anxious', look: [0.42, 0.82], lid: 0.32, mouth: 'tight', brows: [-16, 8], sweat: 0.34, bags: 0.7, age: true }],
      [14.1, { expr: 'fear', look: [0.15, -0.2], lid: 0.2, mouth: 'parted', open: 0.06, brows: [-18, 10], sweat: 0.38, bags: 0.7, age: true }],
      [14.8, { expr: 'grim', look: [0.06, 0.85], lid: 0.36, mouth: 'tight', brows: [-10, 6], sweat: 0.28, bags: 0.6, age: true }],
      [17.1, { expr: 'anxious', look: [0.7, -0.62], lid: 0.12, mouth: 'parted', open: 0.06, brows: [6, 8], sweat: 0.22, bags: 0.6, age: true }]], 0.22);
    const P = up(Q.pembOld(Object.assign(o, { noLegs: true, face: F,
      armR: gripAt(o, Q.HAND.pembOld, gp, fingersFor('R', 'back', u), { hold: G.PROPS.pestleG() }),
      // (the other arm hangs at his side behind the bench: the hand on the mortar's far side, away from the lamp, was
      // shaded almost black)
      armL: { hand: R.toLocal(o, L2([748, 1500], [742, 1494], lean)), dir: [-0.05, 1], pose: 'relaxed', facing: 'back' } })), o);
    const body = clipTop('r2Top', S.BR.NEAR, Q.litHair(P, o, Q.pembOldArt(), V.LR2, Q.armAO(P, o, 'RL', V.LR2)));
    const top = behind(P, 'r2bt', S.benchTop(t, { morph: [290, 1408], steam: true }), 'R');
    const layers = S.backroom(t);
    layers.push({ p: 0.75, svg: S.roomWall(t, {}) });
    layers.push({ p: 1, svg: body + top + S.mortarFront() + S.benchFront(t) }, { p: 1.02, svg: S.roomLight(t) }, { p: 1.25, svg: S.roomFg(t) });
    return X.compose(layers, c) + C.vignette(0.55, '#060302', 0.4);
  }, { grade: 'gHall' });
  V.r2Cam = (() => { const d = camOn(DIP, 0.75), sk = camOn(SACK, 0.75); return V.cam([
    [10.9, [d[0] - 14, d[1] - 8, 2.2, -0.6]], [11.4, [d[0] + 30, d[1] + 22, 2.08, -0.4]],
    [12.05, [150, 560, 1.42, -0.2]],                 // "respected": down from the diploma (wider on the way) ...
    [12.62, [510, 830, 1.8, 0]],                     // ... to his face
    [13.1, [420, 1060, 1.72, 0.3]],                 // "secret": his glance to the bottle by the lamp
    [14.0, [566, 900, 2.25, 0.4]],                  // "desperate ... substitute": in close
    [15.6, [560, 1130, 1.28, 0]],                   // "mixing medicines": back to the bench
    [16.7, [640, 1060, 1.18, -0.3]],                // "back room"
    [17.6, [900, 900, 1.42, -0.5]],                 // "find": his look up toward the shelf
    [18.6, [sk[0] - 60, sk[1] + 40, 1.86, -0.6]], [19.2, [sk[0] - 30, sk[1] + 60, 2.05, -0.6]]]); })();
  V.r2Sack = t => scr(SACK, V.r2Cam(t), 0.75);
  V.r2Dip = t => scr(DIP, V.r2Cam(t), 0.75);

  // ======================================================= MACRO
  X.shot('MACRO', 18.48, 23.75, t => {
    const c = hh(V.mcCam(t), t, 0.8, 7);
    const spill = ss(18.6, 20.1, t), split = ss(22.32, 22.82, t);
    const layers = S.macroBack(t);
    // the darker beat on "cocaine": the light pulls in round the vial
    const dark = env(t, 20.7, 21.0, 21.5, 21.9);
    layers.push({ p: 1, svg: S.macroTable(t, { spill, split }) + (dark > 0 ? C.radial(S.MC.VIAL[0], S.MC.VIAL[1] - 200, 900, '#000000', 0, 'normal') + `<rect x="-900" y="0" width="3500" height="2600" fill="#000" opacity="${f(0.38 * dark)}" style="mix-blend-mode:multiply"/>` + C.radial(S.MC.VIAL[0], S.MC.VIAL[1] - 220, 420, '#ffe0b0', 0.16 * dark) : '') },
      { p: 1.02, svg: S.dust(700, 1300, 900, 400, 26, 41, t, '#ffe0b0', 1.6, 0.5) }, { p: 1.3, svg: S.macroFg(t) });
    return X.compose(layers, c) + C.vignette(0.6, '#060302', 0.36);
  }, { grade: 'gHall' });
  V.mcCam = (() => { const [vx, vy] = S.MC.VIAL, [kx, ky] = S.MC.KOLA; return V.cam([
    [18.4, [300, 1430, 1.26, 0.6]], [19.4, [400, 1470, 1.4, 0.3]],             // the leaves spilling ("coca plant")
    [20.3, [760, 1440, 1.48, 0]], [21.2, [vx, vy - 238, 1.92, -0.3]],           // the cocaine
    [21.95, [kx - 280, ky - 120, 1.52, -0.2]], [22.8, [kx, ky - 30, 1.86, 0.2]], // the nut ("packed with caffeine")
    [23.8, [kx + 6, ky - 10, 2.2, 0.4]]]); })();
  V.mcSack = t => scr([S.MC.SACK[0] + 150, S.MC.SACK[1] + 20], V.mcCam(t), 1);

  // ======================================================= WINE
  // (restaged after the review, 2026-11-08: the stirring fist had crossed his face) the jar at his left side, the wine
  // running into it from the tap of a cask beside it; he stirs with his left hand out at his side, the right hand resting
  // on the bench; the bottles and the handbill to the right
  const JAR = [566, 1458, 196];     // the jar on the bench, in front of him: x, base, height
  const CASK = [1018, 1336];        // the cask's cradle on the bench (behind the jar, to its right)
  const WC = [[1120, 1440], [1210, 1446], [1300, 1440], [1390, 1436]];
  const HBP = [1250, 1500];         // the handbill's foot
  const hbLine = i => [HBP[0], HBP[1] - S.HB.H + [360, 432, 510][i] - 20];
  X.shot('WINE', 23.15, 28.43, t => {
    const c = hh(V.wnCam(t), t, 0.85, 8);
    const guilt = ss(27.2, 27.9, t);
    const o = oldAt(t, 31, { x: 520, tilt: 4 + 6 * guilt, sway: idle(t, 31).sway * 0.6 - 1.2 * guilt });
    // (restaged after the review: the jar in front of him and his right hand stirring at chest height - the arm the
    // same as the approved pestle pose; a jar at his side folded the arm into a pinched V)
    const a = t * 3.4, [jx, jb, jh] = JAR, mouth = [jx, jb - jh + 10], top = [jx - 34 + 16 * Math.cos(a), mouth[1] - 58 + 5 * Math.sin(a)];
    const rodDir = nrm([mouth[0] + 10 * Math.cos(a + Math.PI) - top[0], mouth[1] + 30 - top[1]]), rodLen = jh + 40, rodEnd = [top[0] + rodDir[0] * rodLen, top[1] + rodDir[1] * rodLen];
    const F = V.faceAt(t, [
      [23.2, { expr: 'grim', look: [0.1, 0.8], lid: 0.42, mouth: 'tight', brows: [-8, 4], sweat: 0.1, bags: 0.6, age: true }],
      [24.9, { expr: 'grim', look: [0.85, 0.3], lid: 0.32, mouth: 'closed', brows: [-4, 3], sweat: 0.1, bags: 0.6, age: true }],
      [27.6, { expr: 'tired', look: [-0.55, 0.62], lid: 0.62, mouth: 'tight', brows: [-15, 8], sweat: 0.2, bags: 0.7, age: true }]], 0.5);
    const P = up(Q.pembOld(Object.assign(o, { noLegs: true, face: F,
      armR: gripAt(o, Q.HAND.pembOld, top, fingersFor('R', 'back', [-rodDir[0], -rodDir[1]]), { facing: 'back', detachHand: true }),
      // (the other arm hangs at his side behind the bench - a hand left on the bench's far side, away from the lamp, was
      // shaded almost black and seemed to hover over the leaves)
      armL: { hand: R.toLocal(o, [790, 1500]), dir: [-0.05, 1], pose: 'relaxed', facing: 'back' } })), o);
    const rodTop = `<path d="M${f(top[0] - rodDir[0] * 34)},${f(top[1] - rodDir[1] * 34)} L${f(mouth[0] + rodDir[0] * 4)},${f(mouth[1] + rodDir[1] * 4)}" stroke="#e8f0ec" stroke-width="9" stroke-linecap="round" opacity="0.75"/><path d="M${f(top[0] - rodDir[0] * 34 - 2)},${f(top[1] - rodDir[1] * 34)} L${f(mouth[0] - 2)},${f(mouth[1])}" stroke="#fff" stroke-width="2.5" opacity="0.8"/>`;
    const body = clipTop('wnTop', S.BR.NEAR, Q.litHair(P, o, Q.pembOldArt(), V.LR2, Q.armAO(P, o, 'RL', V.LR2) + rodTop + P.handR, [top[0] - 90, top[1] - 90, top[0] + 90, top[1] + 90]));
    // the jar: red wine with the leaves and kola turning in it as he stirs; the cask beside it (its tap shut)
    const lev = 0.82, swirl = t * 1.2;
    const ck = S.cask(CASK[0], CASK[1], 0);
    let jarS = S.wineJar(jx, jb, jh, t, lev, swirl) + `<path d="M${f(mouth[0] + rodDir[0] * 4)},${f(mouth[1] + rodDir[1] * 4)} L${f(rodEnd[0])},${f(rodEnd[1])}" stroke="#d8c0c0" stroke-width="8" stroke-linecap="round" opacity="0.45"/>`;
    const front = behindAlso(P, 'wnbt', S.benchTop(t, { morph: false, coca: true, kola: false, flask: false, notebook: false, mortar: false }) + ck.svg + jarS, P.handR + rodTop, 'R');
    const hi = [env(t, 25.4, 25.65, 26.1, 26.4), env(t, 26.15, 26.35, 26.8, 27.1), env(t, 26.95, 27.2, 28.2, 28.6)];
    const bills = WC.map(([x, y], i) => S.wcBottle(x, y, 300 + (i % 2) * 10, i)).join('') + S.handbill(HBP[0], HBP[1], { hi });
    const rk = ss(27.55, 28.1, t), bl = 7 * rk;
    const billsS = bl > 0.3 ? `<defs><filter id="wnRk" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${f(bl)}"/></filter></defs><g filter="url(#wnRk)">${bills}</g>` : bills;
    const layers = S.backroom(t);
    layers.push({ p: 0.75, svg: S.roomWall(t, {}) });
    layers.push({ p: 1, svg: body + front + S.benchFront(t) }, { p: 1.04, svg: billsS }, { p: 1.02, svg: S.roomLight(t) });
    return X.compose(layers, c) + C.vignette(0.55, '#060302', 0.4);
  }, { grade: 'gHall' });
  V.wnCam = (() => { const l = [0, 1, 2].map(hbLine), lc = i => camOn(l[i], 1.04); return V.cam([
    [23.0, [JAR[0] + 40, JAR[1] - 190, 2.1, 0.6]], [24.0, [JAR[0] + 30, JAR[1] - 200, 1.95, 0.3]],   // the cask running into the jar
    [24.9, [900, 1150, 1.3, -0.2]],                                                                 // pull back: him stirring, the bottles
    [25.6, [lc(0)[0], lc(0)[1], 2.1, -0.4]], [26.3, [lc(1)[0], lc(1)[1], 2.15, -0.3]], [27.1, [lc(2)[0], lc(2)[1], 2.2, -0.1]],
    [28.1, [520, 900, 1.9, 0.4]], [28.5, [510, 890, 1.95, 0.5]]]); })();

  // ======================================================= BAN: the newspaper slaps down
  const NPC = [540, 1000];
  X.shot('BAN', 27.87, 29.83, t => {
    const fall = ss(27.9, 28.42, t), land = t >= 28.42, jolt = land ? Math.exp(-(t - 28.42) * 7) : 0;
    const c0 = V.banCam(t), shake = bump(t, 28.42, 1, 0.3), c = hh([c0[0] + 8 * shake * Math.sin(t * 70), c0[1] + 14 * shake, c0[2] * (1 + 0.02 * shake), c0[3] + 0.8 * shake], t, 0.7, 9);
    const s = lerp(1.75, 1, fall * fall), rot = lerp(-15, -3.5, fall), sh = lerp(3.2, 1, fall);
    const g = S.banTable(t, jolt) + S.newspaper(NPC[0] + 60 * (1 - fall), NPC[1] - 80 * (1 - fall), s, rot, sh) + C.radial(260, 400, 1400, '#ffb060', 0.1);
    return X.compose([{ p: 1, svg: g }, { p: 1.1, svg: S.dust(540, 900, 700, 800, 22, 51, t, '#ffe8c0', 1.6, 0.4 * (0.5 + jolt)) }], c) + C.vignette(0.55, '#060302', 0.42);
  }, { grade: 'gHall' });
  V.banCam = V.cam([[27.8, [560, 980, 0.94, -1.0]], [28.42, [548, 990, 0.98, -0.6]], [29.0, [536, 860, 1.18, -0.2]], [29.9, [524, 760, 1.42, 0.3]]]);

  // ======================================================= SYRUP: the kettle over the fire in the yard
  const LK = { from: [0.12, 1], shadow: '#0a0402', shadowOp: 0.5, floor: '#120804', floorOp: 0.4, contactOp: 0, key: '#ffb878', keyAdd: 0.14,
    rims: [{ from: [0.25, 1], col: '#ff8a3a', w: 7, op: 0.65 }, { from: [-0.9, -0.4], col: '#c89878', w: 4, op: 0.14 }], face: { col: '#ffb07a', op: 0.26 } };
  V.LK = LK;
  X.shot('SYRUP', 29.27, 31.92, t => {
    const c = hh(V.syCam(t), t, 0.9, 10);
    const id = idle(t, 41, 0.5), ph = t * 2.6, o = { x: 540, y: 2290, s: 1.15, sway: id.sway * 0.5 + 1.4 * Math.sin(ph), tilt: 6, breath: id.breath, blink: id.blink };
    // the paddle: its blade down in the syrup at B, the shaft up past your left shoulder to T; both fists on it
    const { RIM, CX } = S.KT, B = [CX - 40 + 110 * Math.cos(ph), RIM + 12 + 16 * Math.sin(ph)], T0 = [CX + 250 + 40 * Math.cos(ph), 1000 + 12 * Math.sin(ph)];
    // (after the review: the hands lower on the shaft, both at the belly - the upper fist up under the left shoulder
    // folded that forearm flat back over the upper arm, and the sleeve showed its crease through it)
    const ax = nrm([T0[0] - B[0], T0[1] - B[1]]), hL = L2(B, T0, 0.62), hR = L2(B, T0, 0.4);
    const P = up(Q.pembOld(Object.assign(o, { noLegs: true, face: V.faceAt(t, [[29.2, { expr: 'grim', look: [-0.1, 0.8], lid: 0.42, mouth: 'tight', brows: [-8, 5], sweat: 0.3, bags: 0.6, age: true }], [30.6, { expr: 'grim', look: [0.0, 0.9], lid: 0.48, mouth: 'tight', brows: [-11, 6], sweat: 0.35, bags: 0.6, age: true }]], 0.5),
      armR: gripAt(o, Q.HAND.pembOld, hR, fingersFor('R', 'back', ax), { facing: 'back', detachHand: true }),
      armL: gripAt(o, Q.HAND.pembOld, hL, fingersFor('L', 'back', ax), { facing: 'back', detachHand: true }) })), o);
    const shaft = `<path d="M${f(B[0])},${f(B[1])} L${f(T0[0] + ax[0] * 40)},${f(T0[1] + ax[1] * 40)}" stroke="#2a1608" stroke-width="20" stroke-linecap="round"/><path d="M${f(B[0])},${f(B[1])} L${f(T0[0] + ax[0] * 40)},${f(T0[1] + ax[1] * 40)}" stroke="#8a5a2e" stroke-width="13" stroke-linecap="round"/><path d="M${f(B[0] - 3)},${f(B[1])} L${f(T0[0] + ax[0] * 40 - 3)},${f(T0[1] + ax[1] * 40)}" stroke="#e8a868" stroke-width="3" opacity="0.6"/>`;
    const body = Q.litHair(P, o, Q.pembOldArt(), LK, Q.armAO(P, o, 'RL', LK) + shaft + P.handR + P.handL, [Math.min(B[0], T0[0]) - 80, T0[1] - 120, Math.max(B[0], T0[0]) + 80, B[1] + 40]);
    const ripple = `<ellipse cx="${f(B[0])}" cy="${f(B[1] + 2)}" rx="34" ry="9" fill="none" stroke="#d88a40" stroke-width="3" opacity="0.6"/><ellipse cx="${f(B[0])}" cy="${f(B[1] + 2)}" rx="${f(52 + 8 * Math.sin(t * 6))}" ry="13" fill="none" stroke="#a8622a" stroke-width="2" opacity="0.4"/>`;
    const kb = behindAlso(P, 'sykb', S.kettleBack(t, ph * 0.5), P.handR + P.handL + shaft);
    const layers = S.yard(t);
    layers.push({ p: 1, svg: body + kb + ripple + S.kettleFront(t) }, { p: 1.02, svg: S.yardLight(t) });
    return X.compose(layers, c) + C.vignette(0.55, '#060302', 0.4);
  }, { grade: 'gHall' });
  // low on the fire, up to his face lit from below, back down into the turning syrup
  V.syCam = V.cam([[29.2, [540, 1720, 1.3, 0.4]], [30.35, [556, 880, 1.48, -0.2]], [31.05, [540, 1240, 1.56, -0.3]], [31.62, [540, 1330, 1.95, -0.1]], [32.0, [540, 1342, 2.2, 0]]]);

  // ---------------------------------------------------------------- transitions (part 2)
  // through the shop window into the back room, landing on the diploma
  X.tr('push', 11.32, 0.6, 'STREET', 'ROOM2', { fa: V.stFace(11.32), fb: V.r2Dip(11.32), za: 2.5, zb: 0.62, fade: [0.47, 0.53], blur: 6 });
  // the sack on the shelf becomes the sack spilling its leaves on the bench
  X.tr('organic', 18.78, 0.6, 'ROOM2', 'MACRO', { fa: V.r2Sack(18.78), fb: V.mcSack(18.78), za: 1.14, zb: 0.9, seed: 7, freq: 0.004, soft: 5, leak: '#ffb060', leakOp: 0.3 });
  // the split nut floods with red wine
  X.tr('liquid', 23.45, 0.6, 'MACRO', 'WINE', { fa: scr(S.MC.KOLA, V.mcCam(23.45)), fb: scr([JAR[0], JAR[1] - JAR[2] * 0.5], V.wnCam(23.45)), col: '#4a0610', seed: 12 });
  // the newspaper flies across the lens
  const paperWipe = (x, u) => {
    let g = `<g transform="translate(${f(x)},960) rotate(-8)"><path d="M-700,-1200 L700,-1140 C720,-400 690,500 720,1240 L-690,1200 C-720,500 -690,-400 -700,-1200Z" fill="#e4d6b4"/>`;
    g += `<path d="M700,-1140 C720,-400 690,500 720,1240" stroke="#a8946a" stroke-width="40" fill="none" opacity="0.6"/>`;
    g += `<rect x="-560" y="-1040" width="1120" height="120" fill="#2a2018" opacity="0.5"/>`;
    for (let i = 0; i < 4; i++) g += `<rect x="${-560 + i * 290}" y="-860" width="250" height="1900" fill="#2a2018" opacity="0.18"/>`;
    g += S.TXT(0, -560, 230, '#14100c', 'ATLANTA', { font: S.FONT.abril, len: 1100, op: 0.8 }) + S.TXT(0, -330, 230, '#14100c', 'GOES DRY!', { font: S.FONT.abril, len: 1100, op: 0.8 }) + `</g>`;
    return `<g filter="url(#dof3)">${g}</g>`;
  };
  X.tr('wipe', 28.15, 0.56, 'WINE', 'BAN', { dir: 1, truck: 130, obj: paperWipe });
  // a pan out of the shop to the yard
  X.tr('carry', 29.55, 0.56, 'BAN', 'SYRUP', { mode: 'pan', dir: [1, 0], dist: 0.42, fade: [0.46, 0.54], blur: 11 });
})(window);
