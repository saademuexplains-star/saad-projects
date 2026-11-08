// "The Royal Astrologer" part 2: eight days pass at her bedside and on the eighth she dies -> the guards march you to
// the king at midnight -> his chamber: the guards at the open window, the signal held back, "when will you die?" -> your
// bow and your answer -> he turns pale, waves the guards away, the shutters close -> the rest of his life: the years
// in your tower, the old king fussing over you, one sniffle and the whole court panics -> he presses another purse into
// your hands (loops into the first one).
(function (G) {
  const X = G.ENG, Q = G.QCAST, S = G.SETS, PR = G.PROPS, C = G.CINE, R = G.RIG;
  const { track: TK, ss, clamp, lerp, EZ } = X;
  const { f, mix, rng, shade } = R;
  const { env, bump, idle, hh, scr, nrm, L2, add, gripAt, fingersFor, handAt, handsLit, CAM, mixArm, dith } = G.SHOTS_O;
  const lit = X.lit;
  const LT = Object.assign({}, G.SHOTS_O.LT, {
    bed: { from: [0.8, -0.4], shadow: '#140a06', shadowOp: 0.42, floor: '#1a0e08', floorOp: 0.3, contactOp: 0.4, key: '#ffe8c8', keyAdd: 0.05, rims: [{ from: [1, -0.3], col: '#fff0d8', w: 6, op: 0.45 }, { from: [-1, -0.2], col: '#ffb870', w: 4, op: 0.3 }], face: { col: '#ffe0c0', op: 0.12 } },
    torch: { from: [-0.5, -0.6], shadow: '#0a0604', shadowOp: 0.5, floor: '#0a0604', floorOp: 0.3, contactOp: 0.45, key: '#ffb070', keyAdd: 0.06, rims: [{ from: [-1, -0.3], col: '#ff9a40', w: 7, op: 0.6 }, { from: [1, -0.3], col: '#ff9a40', w: 6, op: 0.45 }], face: { col: '#ffc890', op: 0.16 } },
    kch: { from: [-0.9, -0.2], shadow: '#0e0604', shadowOp: 0.46, floor: '#140a06', floorOp: 0.3, contactOp: 0.42, key: '#ffb878', keyAdd: 0.07, rims: [{ from: [-1, -0.1], col: '#ff8a3a', w: 8, op: 0.6 }, { from: [1, -0.4], col: '#9ab0e0', w: 6, op: 0.5 }], face: { col: '#ffc8a0', op: 0.13 } },
    day: { from: [0.5, -0.6], shadow: '#1a120c', shadowOp: 0.4, floor: '#22160e', floorOp: 0.3, contactOp: 0.4, key: '#fff0dc', keyAdd: 0.05, rims: [{ from: [-1, -0.1], col: '#ff9a50', w: 7, op: 0.5 }, { from: [1, -0.4], col: '#e8f0ff', w: 5, op: 0.35 }], face: { col: '#ffe8d0', op: 0.12 } },
  });
  const ST = G.ASTRO;
  // a long prop drawn in world space at a fist's grip slot, its +x along the thumb (kept out of the rig's light box)
  const inWorld = (svg, p, thumb, s) => `<g transform="translate(${f(p[0])},${f(p[1])}) rotate(${f(Math.atan2(thumb[1], thumb[0]) * 180 / Math.PI)}) scale(${f(s)})">${svg}</g>`;
  // a figure seated in a chair: the rig is cut at the hips, and a lap of cloth (here fur) runs from the hips to the floor
  const seatedLap = (o, floorY, col, id) => {
    const fl = (floorY - o.y) / o.s, cut = o.y - 745 * o.s;
    const clip = `<defs><clipPath id="${id}"><rect x="${f(o.x - 2000)}" y="${f(cut - 4000)}" width="4000" height="4000"/></clipPath></defs>`;
    const d = `M-176,-772 L176,-772 C196,-706 204,-648 198,-606 C210,-560 226,-520 234,-480 C246,${f(fl - 260)} 256,${f(fl - 90)} 270,${f(fl - 10)} C120,${f(fl + 6)} -120,${f(fl + 6)} -270,${f(fl - 10)} C-256,${f(fl - 90)} -246,${f(fl - 260)} -234,-480 C-226,-520 -210,-560 -198,-606 C-204,-648 -196,-706 -176,-772Z`;
    let lap = `<defs><linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${shade(col, -0.32)}"/><stop offset="0.35" stop-color="${shade(col, 0.1)}"/><stop offset="0.6" stop-color="${col}"/><stop offset="1" stop-color="${shade(col, -0.38)}"/></linearGradient></defs><path d="${d}" fill="url(#${id}g)" stroke="#140c08" stroke-width="3" stroke-linejoin="round"/>`;
    const r = rng(7); for (let i = 0; i < 40; i++) { const px = (r() - 0.5) * 420, py = -740 + r() * (fl + 700); lap += `<path d="M${f(px)},${f(py)} q${f(4 + r() * 6)},${f(10 + r() * 8)} -2,${f(20 + r() * 10)}" stroke="${r() > 0.5 ? '#c8b494' : '#2a2016'}" stroke-width="3" fill="none" opacity="0.5"/>`; }
    return { clip, cut, lap: `<g transform="translate(${f(o.x)},${f(o.y)}) scale(${f(o.s)})" filter="url(#clothS)">${lap}</g>` };
  };

  // ======================================================= BED: the eight days; on the eighth, she dies (20.85 - 23.246)
  // "On the eighth day, she does."
  {
    const B = S.BD, LO = { x: 530, y: 2300, s: 0.8 }, KO = { x: 175, y: 2120, s: 0.74 };
    // her eyes close on her face; then the camera drifts to the candle beside her, whose flame becomes the guard's torch
    const cam = CAM([[20.85, [800, 820, 0]], [21.85, [560, 1130, 0], 'io'], [22.65, [500, 1150, 0], 'io'], [23.15, [930, 1330, 0], 'io'], [23.4, [940, 1336, 0], 'sine']],
      [[20.85, 1.3], [21.85, 1.12, 'io'], [22.65, 1.6, 'io'], [23.15, 1.45, 'io'], [23.4, 1.5, 'sine']]);
    const days = t => 2 * ss(20.95, 22.2, t);
    const dayL = t => 0.5 - 0.5 * Math.cos(Math.PI * 2 * days(t));
    const flameAt = t => { const w = ss(20.9, 22.4, t); return [B.CANDLE[0] - 48, B.CANDLE[1] - 112 + w * 60]; };
    const fn = t => {
      const c = hh(cam(t), t, 0.25, 21), L = LT.bed, dl = dayL(t), w = ss(20.9, 22.4, t);
      const die = EZ.io(ss(22.2, 22.75, t)), pale = ss(21.0, 22.5, t);
      const set = S.bedroom(t, { day: dl, sun: (days(t) % 1) });
      // the lady, propped on her pillows, growing pale; her hand on the quilt in the king's; on the eighth day her eyes close
      const lO = Object.assign(idle(t, 41, 0.2 * (1 - die)), LO, { tilt: 14 * die - 4 });
      // her hand lies out on the quilt toward the king (her arm comes from under the turned-down sheet, see armsOverQ)
      const lR = handAt(lO, [330, 1555], [-0.55, 0.6], { pose: 'relaxed', facing: 'back' });
      const LP = Q.lady(Object.assign({}, lO, { bed: true, noLegs: true, skin: mix('#f0d0b8', '#ddd6cc', pale), face: { expr: 'tired', look: [-0.6, 0.15], lid: lerp(0.45, 1, die), mouth: die > 0.5 ? 'closed' : 'parted', open: 0.04, brows: [4, 0], bags: 0.5 * pale, blush: 0 }, armR: lR, armL: { hand: [160, -820], dir: [-0.1, 1], pose: 'relaxed', facing: 'back' } }));
      const clipId = 'bdlady';
      const lady = `<defs><clipPath id="${clipId}"><rect x="0" y="0" width="1100" height="1470"/></clipPath></defs><g clip-path="url(#${clipId})">${lit(LP, L)}</g>`;
      // the king kneeling at her side, holding her hand; grief takes him at the end
      const kO = Object.assign(idle(t, 43, 0.3), KO, { tilt: 6 + 8 * die });
      const kL = handAt(kO, [345, 1545], [0.55, 0.55], { pose: 'open', facing: 'back' });
      const K = Q.king(Object.assign({}, kO, { face: die < 0.3 ? { expr: 'anxious', look: [0.7, 0.2], lid: 0.3, brows: [8, -1] } : { expr: 'grief', look: [0.65, 0.25], lid: 0.45, mouth: 'cry', open: 0.1, tears: die, brows: [10, -2] }, armL: kL, armR: { hand: [-120, -800], dir: [0.1, 1], pose: 'relaxed', facing: 'back' } }));
      const kneelClip = `<defs><clipPath id="bdking"><rect x="-500" y="0" width="1100" height="1600"/></clipPath></defs>`;
      const king = kneelClip + `<g clip-path="url(#bdking)">${lit(K, L)}</g>`;
      // order: bed back, lady, quilt, her arm over the quilt, the king and his hand over hers, the nightstand
      const quilt = S.bedQuilt16(t, { breath: 1 - die });
      // her arm over the quilt shows only below the turned-down sheet's lower edge, so it comes out from under it
      const br = Math.sin(t * 1.6) * 3 * (1 - die), q = B.QUILT, [bx0, bx1] = B.BED;
      const underSheet = `<defs><clipPath id="bdarm"><path d="M${bx0 - 400},2600 L${bx0 - 400},${f(q + 15 + br)} L${bx0 + 20},${f(q + 15 + br)} C${bx0 + 120},${f(q - 9 + br)} ${bx1 - 120},${f(q - 9 + br)} ${bx1 - 20},${f(q + 15 + br)} L${bx1 + 400},${f(q + 15 + br)} L${bx1 + 400},2600Z"/></clipPath></defs>`;
      const armsOverQ = underSheet + `<g clip-path="url(#bdarm)">${C.lit({ svg: LP.armRsvg, info: LP.info }, Object.assign({ view: X.viewRect(1) }, L)).body}</g>`;
      const chars = S.bedBack16(t) + lady + quilt + armsOverQ + king + S.nightstand16(t, { wilt: w, candle: 1 });
      const night = `<rect x="-1500" y="-1500" width="4100" height="4900" fill="#0a0c18" opacity="${f(0.32 * (1 - dl))}"/>`;
      return X.compose(X.stage(set, chars), c) + night + C.vignette(0.5) + dith(t);
    };
    X.shot('BED', 20.85, 23.346, fn, { grade: 'gHall' });
    G.BED_FLAME = tt => scr(flameAt(tt), cam(tt));
  }
  X.tr('eyelid', 21.15, 0.6, 'SHADOW', 'BED', {});

  // ======================================================= CORR: marched to the king at midnight (22.65 - 25.046)
  // "The king summons you at midnight,"
  {
    const YO = { x: 540, y: 1960, s: 0.82 }, AO = { x: 300, y: 1930, s: 0.8 }, BO = { x: 785, y: 1930, s: 0.8 };
    // it opens on the guard's torch, where the bedside flame was, then finds you between the guards
    const cam = CAM([[22.65, [72, 721, 0]], [23.15, [82, 725, 0], 'sine'], [24.1, [530, 1090, 1], 'io'], [25.05, [560, 1010, 0], 'sine']], [[22.65, 1.35], [23.15, 1.35, 'sine'], [24.1, 1.2, 'io'], [25.05, 1.1, 'sine']]);
    const step = (t, ph) => { const k = (t - 22.65) * 1.9 + ph; return { bob: 7 * (0.5 - 0.5 * Math.cos(Math.PI * 2 * k)), sw: 1.6 * Math.sin(Math.PI * k) }; };
    const torchUp = nrm([0.15, -1]);
    const torchGrip = t => { const s = step(t, 0); return [AO.x - 150 * AO.s, AO.y - 1210 * AO.s + s.bob]; };
    const torchFlame = t => add(torchGrip(t), torchUp, 196 * AO.s);
    const fn = t => {
      const c = hh(cam(t), t, 0.35, 25), L = LT.torch;
      const set = S.corridor(t, { z: 1.6 * (t - 22.65) });
      const sy = step(t, 0.5), sa = step(t, 0), sb = step(t, 0.25);
      const yO = Object.assign(idle(t, 47, 0.3), YO, { y: YO.y + sy.bob, sway: sy.sw });
      const aO = Object.assign(idle(t, 49, 0.2), AO, { y: AO.y + sa.bob, sway: sa.sw }), bO = Object.assign(idle(t, 53, 0.2), BO, { y: BO.y + sb.bob, sway: sb.sw });
      // the guards' fists on your upper arms; guard A carries the torch
      const yArmR = R.toWorld(yO, [-178, -1000]), yArmL = R.toWorld(yO, [178, -1000]);
      const aL = gripAt(aO, 'guardA', yArmR, [0.2, 1]), bR = gripAt(bO, 'guardB', yArmL, [-0.2, 1]);
      const aR = gripAt(aO, 'guardA', torchGrip(t), fingersFor('R', 'back', torchUp), { detachHand: true });
      const A = Q.guardA(Object.assign({}, aO, { face: { expr: 'grim', look: [0.1, 0], lid: 0.32 }, armL: aL, armR: aR }));
      const Bg = Q.guardB(Object.assign({}, bO, { face: { expr: 'grim', look: [-0.1, 0], lid: 0.28 }, armR: bR, armL: { hand: [160, -760], dir: [-0.1, 1], pose: 'relaxed', facing: 'back' } }));
      const Y = Q.you(Object.assign({}, yO, { face: { expr: 'fear', look: [0.15 * Math.sin(t * 1.7), -0.1], lid: 0.08, mouth: 'tight', brows: [8, -2], sweat: 0.5 }, armR: { hand: [-120, -760], dir: [0.2, 1], pose: 'relaxed', facing: 'back' }, armL: { hand: [120, -760], dir: [-0.2, 1], pose: 'relaxed', facing: 'back' } }));
      const tf = torchFlame(t);
      const torch = inWorld(PR.torchG(t, 3), torchGrip(t), torchUp, AO.s);
      const chars = lit(Y, L) + lit(A, L) + lit(Bg, L) + torch + handsLit(A, L, 'R') + C.radial(tf[0], tf[1] - 30, 520, '#ff9a40', 0.32, 'screen');
      return X.compose(X.stage(set, chars), c) + C.vignette(0.6) + dith(t);
    };
    X.shot('CORR', 22.65, 25.046, fn, { grade: 'gNight' });
    G.CORR_TORCH = tt => scr(add(torchFlame(tt), [0, -30]), cam(tt));
  }
  X.tr('zmatch', 23.05, 0.6, 'BED', 'CORR', { fa: G.BED_FLAME(23.05), fb: G.CORR_TORCH(23.05), za: 2.4, zb: 2.2, seed: 13, blur: 4 });

  // ======================================================= KCH: the king's chamber at midnight (24.35 - 41.346)
  // "sure you cursed her, and you see his guards by the open window staring dead at you, waiting for his signal to
  //  throw you out of it. He smiles and asks, "You know everything, so tell me, when will you die?" You bow and answer,
  //  "Exactly three days before Your Majesty." He turns pale, waves the guards away,"
  {
    const B = S.KC, KO = { x: 250, y: 1800, s: 0.76 }, YO = { x: 590, y: 1830, s: 0.78 }, AO = { x: 712, y: 1800, s: 0.76 }, BO = { x: 1268, y: 1800, s: 0.76 };
    const KF = [KO.x, KO.y - 1250 * KO.s], YF = [YO.x, YO.y - 1250 * YO.s];
    const cam = CAM(
      [[24.35, [300, 940, 0]], [25.55, [272, 905, 0], 'sine'], [27.0, [1000, 940, 0], 'io'], [28.1, [1010, 930, 0], 'sine'], [29.2, [250, 1060, 0], 'io'], [30.2, [YF[0], YF[1] + 8, 0], 'io'], [31.15, [YF[0] + 6, YF[1] + 10, 1], 'sine'],
        [31.75, [KF[0] + 10, KF[1] + 4, 0], 'io'], [34.4, [KF[0] + 6, KF[1] + 12, 0], 'sine'], [35.2, [YF[0] - 15, YF[1] + 70, 0], 'io'], [36.4, [YF[0] - 10, YF[1] + 50, 0], 'sine'], [38.5, [YF[0] - 8, YF[1] + 14, 0], 'sine'],
        [39.15, [KF[0] + 10, KF[1] + 12, 0], 'io'], [39.7, [KF[0] + 10, KF[1] + 14, 0], 'sine'], [40.5, [720, 1050, 0], 'io'], [41.4, [700, 1060, 0], 'sine']],
      [[24.35, 1.75], [25.55, 1.95, 'sine'], [27.0, 1.35, 'io'], [28.1, 1.5, 'sine'], [29.2, 2.3, 'io'], [30.2, 2.4, 'io'], [31.15, 2.55, 'sine'], [31.75, 2.55, 'io'], [34.4, 3.0, 'sine'],
        [35.2, 1.85, 'io'], [36.4, 2.0, 'sine'], [38.5, 2.9, 'sine'], [39.15, 2.7, 'io'], [39.7, 2.8, 'sine'], [40.5, 1.05, 'io'], [41.4, 1.1, 'sine']]);
    const veilFall = t => EZ.in2(ss(38.75, 39.35, t));
    const fn = t => {
      const c = hh(cam(t), t, 0.25, 29), L = LT.kch;
      const shut = EZ.io(ss(40.0, 40.75, t));
      const set = S.kchamber(t, { wind: 1 - 0.7 * shut, shut });
      // ---- the king
      const pale = EZ.io(ss(38.65, 39.3, t)), smile = env(t, 31.2, 31.5, 36.6, 37.2), talking = t > 32.7 && t < 35.15;
      const kO = Object.assign(idle(t, 59, 0.3), KO, { tilt: 4 * env(t, 32.6, 33.2, 35.0, 35.6) - 3 * pale });
      const vk = veilFall(t), vp = R.toWorld(kO, [150, -930]);
      const kL = vk < 0.02 ? gripAt(kO, 'king', vp, fingersFor('L', 'back', [0.15, -1]), { detachHand: true })
        : handAt(kO, add(vp, [10, -10]), [0.4, 0.8], { pose: 'open', facing: 'palm' });
      const sigK = env(t, 28.2, 28.7, 31.0, 31.5), waveK = env(t, 39.7, 39.9, 40.6, 40.9);
      const kSig = { hand: [-200, -950 - 50 * sigK], dir: [0.1, -1], pose: 'point', facing: 'back' };
      const kWave = { hand: [-300 + 70 * Math.sin(t * 19), -1060], dir: [0.15, -1], pose: 'open', facing: 'palm' };
      const kRest = { hand: [-160, -800], dir: [0.1, 1], pose: 'relaxed', facing: 'back' };
      const kR = mixArm(mixArm(kRest, kSig, EZ.io(sigK)), kWave, EZ.io(waveK));
      let kFace;
      if (pale > 0.01) kFace = { expr: 'fear', wide: true, look: [0.7, 0.05], lid: 0.03, mouth: 'parted', open: 0.12 * pale, brows: [9, 2], sweat: 0.8 * pale, redEyes: 0.5 };
      else if (smile > 0.01) kFace = { expr: 'stern', look: [0.75, 0.05], lid: 0.42, mouth: talking ? 'talk' : 'smile', open: Q.talk(t, 0.2, 6), brows: t > 34.3 && t < 35.4 ? [-4, 6] : [-1, 2], redEyes: 0.6 };
      else kFace = { expr: 'stern', look: t < 27 ? [0.75, 0.05] : [0.7, 0.1], lid: 0.36, mouth: 'tight', brows: [9, -4], redEyes: 0.7, bags: 0.5 };
      const K = Q.king(Object.assign({}, kO, { mourn: true, pale, face: kFace, armL: kL, armR: kR }));
      const veil = vk < 0.02 ? PR.veil(vp[0], vp[1], 0.78, t) : `<g opacity="${f(1 - ss(0.85, 1, vk))}">${PR.veil(vp[0] + 30 * vk, vp[1] + 560 * vk, 0.78, t, { lean: 20 * vk })}</g>`;
      // ---- you
      const bow = env(t, 35.15, 35.5, 36.25, 36.6), calm = ss(36.4, 36.8, t), afraid = 1 - calm;
      const yO = Object.assign(idle(t, 61, 0.3), YO, { y: YO.y + 34 * bow, tilt: -3 * bow + bump(t, 30.0, -4, 0.5) });
      const clasp = { hand: [-40, -830], dir: [0.6, 0.5], pose: 'relaxed', facing: 'back' }, claspL = { hand: [40, -830], dir: [-0.6, 0.5], pose: 'relaxed', facing: 'back' };
      const heart = { hand: [60, -1040], dir: [0.5, -0.3], pose: 'open', facing: 'back' };
      const yR = mixArm(clasp, heart, EZ.io(bow));
      const yLook = bow > 0.5 ? [-0.3, 0.8] : t > 29.9 && t < 30.9 ? [0.85, 0.05] : [-0.75, -0.02];
      const yFace = calm > 0.5 ? { expr: 'neutral', look: [-0.75, -0.02], lid: 0.3, mouth: t > 36.5 && t < 38.62 ? 'talk' : 'smile', open: Q.talk(t, 0.16, 6), brows: [-2, 2] }
        : { expr: 'fear', wide: afraid > 0.5 && bow < 0.5, look: yLook, lid: lerp(0.06, 0.55, bow), mouth: 'tight', brows: [8, -3], sweat: 0.7 };
      const Y = Q.you(Object.assign({}, yO, { face: yFace, armR: yR, armL: claspL }));
      // ---- the guards with their halberds, staring; they close in, then step back, and B closes the shutters
      const close = env(t, 28.6, 29.4, 39.9, 40.5), back = ss(39.9, 40.5, t);
      const aO = Object.assign(idle(t, 67, 0.2), AO, { x: AO.x - 40 * close });
      const bO = Object.assign(idle(t, 71, 0.2), BO, { x: BO.x - 70 * close + 20 * back });
      const halbA = add(R.toWorld(aO, [-150, -950]), [0, 0]), halbB = R.toWorld(bO, [150, -950]);
      const aR = gripAt(aO, 'guardA', halbA, fingersFor('R', 'back', [0, -1]), { detachHand: true });
      const bL = gripAt(bO, 'guardB', halbB, fingersFor('L', 'back', [0, -1]), { detachHand: true });
      const reachShut = EZ.io(ss(39.95, 40.3, t)) * (1 - EZ.io(ss(40.75, 41.1, t)));
      const bR = mixArm({ hand: [-150, -780], dir: [0.1, 1], pose: 'relaxed', facing: 'back' }, handAt(bO, [B.WIN[0] + B.WIN[2] - 60 - 160 * shut, 1050], [-1, 0.1], { pose: 'open', facing: 'back' }), reachShut);
      const gLookA = back > 0.5 ? [-0.2, 0.8] : [-0.75, 0.05], gLookB = back > 0.5 ? [-0.2, 0.8] : [-0.85, 0.05];
      const A = Q.guardA(Object.assign({}, aO, { tilt: -4 * back, face: { expr: 'grim', look: gLookA, lid: back > 0.5 ? 0.5 : 0.24, brows: [6, -3] }, armR: aR, armL: { hand: [150, -800], dir: [-0.1, 1], pose: 'relaxed', facing: 'back' } }));
      const Bg = Q.guardB(Object.assign({}, bO, { tilt: -4 * back, face: { expr: 'grim', look: gLookB, lid: back > 0.5 ? 0.5 : 0.22, brows: [6, -3] }, armL: bL, armR: bR }));
      const halberds = inWorld(PR.halberdG(1400), halbA, [0, -1], AO.s) + inWorld(PR.halberdG(1400), halbB, [0, -1], BO.s);
      const chars = lit(A, L) + lit(Bg, L) + halberds + handsLit(A, L, 'R') + handsLit(Bg, L, 'L') + lit(K, L) + veil + handsLit(K, L, 'L') + lit(Y, L);
      return X.compose(X.stage(set, chars), c) + C.vignette(0.55) + dith(t);
    };
    X.shot('KCH', 24.35, 41.346, fn, { grade: 'gNight' });
  }
  // the curtain wipe: a white linen curtain blows across the lens between the corridor and the chamber
  const linenWipe = (x) => {
    // a linen curtain lit only by night and firelight: warm grey, never a white flash
    let g = `<defs><linearGradient id="lnw" x1="0" x2="1"><stop offset="0" stop-color="#a89e8e" stop-opacity="0"/><stop offset="0.08" stop-color="#8e8474"/><stop offset="0.5" stop-color="#b4aa98"/><stop offset="0.92" stop-color="#7e7466"/><stop offset="1" stop-color="#7e7466" stop-opacity="0"/></linearGradient></defs>`;
    g += `<rect x="${f(x - 680)}" y="-200" width="1360" height="2320" fill="url(#lnw)"/>`;
    for (let i = 0; i < 9; i++) { const fx = x - 600 + i * 150 + Math.sin(i * 1.7) * 30; g += `<path d="M${f(fx)},-200 C${f(fx + 40)},500 ${f(fx - 30)},1300 ${f(fx + 20)},2120" stroke="#5e5648" stroke-width="${18 + (i % 3) * 8}" fill="none" opacity="0.4"/><path d="M${f(fx + 30)},-200 C${f(fx + 70)},500 ${f(fx)},1300 ${f(fx + 50)},2120" stroke="#d8d0c0" stroke-width="10" fill="none" opacity="0.3"/>`; }
    return g;
  };
  X.tr('wipe', 24.7, 0.7, 'CORR', 'KCH', { dir: 1, truck: 180, obj: linenWipe });

  // ======================================================= END: the rest of his life (40.55 - end)
  // "and for the rest of his life, he makes sure you never even catch a cold."
  {
    const FY = 1870, YO = { x: 140, y: 2170, s: 0.8 }, KO = { x: 400, y: 1880, s: 0.8 }, DO = { x: 650, y: 1890, s: 0.78 }, MO = { x: -170, y: 1900, s: 0.76 };
    const SEQ = [0, 1, 2, 1];
    const seasonAt = t => { const s = 3 * ss(40.6, 42.3, t), i = Math.min(2, Math.floor(s)); return { a: SEQ[i], b: SEQ[i + 1], k: EZ.io(clamp(s - i)) }; };
    const cam = CAM([[40.55, [200, 1240, 0]], [42.2, [210, 1220, 0], 'sine'], [43.3, [235, 1190, 0], 'io'], [44.7, [268, 1250, 0], 'in2']],
      [[40.55, 1.0], [42.2, 1.08, 'sine'], [43.3, 1.4, 'io'], [44.7, 1.95, 'in2']]);
    // the purse he presses into your hands at the very end
    const purseAt = t => L2([370, 1150], [252, 1312], EZ.io(ss(43.6, 44.25, t)));
    const fn = t => {
      const c = hh(cam(t), t, 0.25, 37), L = LT.day;
      const sea = seasonAt(t), old = EZ.io(ss(40.7, 42.1, t));
      const set = S.tower(t, { mode: 'day', season: sea.a, season2: sea.b, seasonK: sea.k, fire: 1, armRot: 0.2 * t });
      // you, seated by the fire under furs; older; a sniffle at "catch a cold"
      const sn = bump(t, 42.75, 1, 0.35), atch = bump(t, 43.08, 1, 0.22), scare = ss(43.1, 43.35, t);
      const yO = Object.assign(idle(t, 73, 0.2), YO, { tilt: 7 * sn - 9 * atch });
      const recv = EZ.io(ss(43.85, 44.3, t));
      const yHands = { hand: [-60, -800], dir: [0.6, 0.4], pose: 'relaxed', facing: 'back' };
      const yR = mixArm(yHands, { hand: [80, -900], dir: [0.6, -0.2], pose: 'open', facing: 'palm' }, recv);
      const yFace = sn + atch > 0.05 ? { expr: 'tired', look: [0.2, -0.1], lid: 0.6, mouth: 'parted', open: 0.1, brows: [5, 0] }
        : { expr: 'neutral', look: t > 43.3 ? [0.75, -0.2] : [0.6, -0.1], lid: 0.32, mouth: 'smile', brows: [-2, 2] };
      const Y = Q.you(Object.assign({}, yO, { old: 0.7 * old, noLegs: true, face: yFace, armR: yR, armL: { hand: [80, -800], dir: [-0.6, 0.4], pose: 'relaxed', facing: 'back' } }));
      const seat = seatedLap(yO, FY, '#6a1418', 'endlap');
      const chair = `<path d="M${YO.x - 200},${FY} L${YO.x - 200},1080 C${YO.x - 200},1010 ${YO.x + 200},1010 ${YO.x + 200},1080 L${YO.x + 200},${FY}Z" fill="#4a2a16" filter="url(#woodV)" stroke="#140c06" stroke-width="3"/><path d="M${YO.x - 150},1100 L${YO.x + 150},1100 L${YO.x + 150},1500 L${YO.x - 150},1500Z" fill="#7a1418" stroke="#140c06" stroke-width="2"/>`;
      const neck = R.toWorld(yO, [0, -1150]);
      const fur = PR.furWrap(neck[0], neck[1], 0.5, t);
      // the old king fusses: tucks the furs, then panics at the sniffle, then hands you the purse
      const kO = Object.assign(idle(t, 79, 0.3), KO, { tilt: -4 * scare });
      const tuck = env(t, 40.9, 41.4, 42.4, 42.9);
      const kRtuck = handAt(kO, R.toWorld(yO, [150, -1060]), [-0.7, 0.4], { pose: 'open', facing: 'back' });
      const kRest = { hand: [-150, -780], dir: [0.1, 1], pose: 'relaxed', facing: 'back' };
      const kRpanic = { hand: [-260, -1100], dir: [-0.2, -1], pose: 'open', facing: 'palm' };
      const pp = purseAt(t), give = ss(43.55, 43.7, t);
      let kR = mixArm(mixArm(kRest, kRtuck, EZ.io(tuck)), kRpanic, EZ.io(env(t, 43.1, 43.35, 43.5, 43.75)));
      if (give > 0.5) kR = gripAt(kO, 'king', pp, fingersFor('R', 'back', [0, -1]), { detachHand: true });
      const kFace = scare > 0.05 && t < 43.7 ? { expr: 'fear', wide: true, look: [-0.8, 0.2], lid: 0.03, mouth: 'parted', open: 0.14, brows: [10, 2], sweat: 0.6 }
        : { expr: 'anxious', look: [-0.8, 0.25], lid: 0.3, mouth: t > 43.7 ? 'smile' : 'tight', brows: [7, -1] };
      const K = Q.king(Object.assign({}, kO, { old, face: kFace, armR: kR, armL: { hand: [150, -800], dir: [-0.1, 1], pose: 'relaxed', facing: 'back' } }));
      // the physician holds his flask up to the light; the maid brings hot soup
      const dO = Object.assign(idle(t, 83, 0.3), DO, { x: DO.x - 60 * scare });
      const flaskP = R.toWorld(dO, [-150, -1150]);
      const D = Q.doctor(Object.assign({}, dO, { face: { expr: scare > 0.5 ? 'fear' : 'anxious', look: [-0.7, -0.3], lid: 0.2, mouth: scare > 0.5 ? 'parted' : 'tight', open: 0.1, brows: [8, 0] }, armR: gripAt(dO, 'doctor', flaskP, fingersFor('R', 'back', [0, -1]), { hold: PR.flaskG() }), armL: { hand: [150, -800], dir: [-0.1, 1], pose: 'relaxed', facing: 'back' } }));
      const mO = Object.assign(idle(t, 89, 0.3), MO, { x: MO.x + 90 * scare });
      const bowl = R.toWorld(mO, [0, -900]);
      const M = Q.maid(Object.assign({}, mO, { face: { expr: 'anxious', look: [0.8, 0.1], lid: 0.16, mouth: 'tight' }, armR: handAt(mO, add(bowl, [-70, 10]), [0.3, 1], { pose: 'open', facing: 'palm' }), armL: handAt(mO, add(bowl, [70, 10]), [-0.3, 1], { pose: 'open', facing: 'palm' }) }));
      const soup = PR.soupBowl(bowl[0], bowl[1] - 12, 0.62, t);
      const purse = give > 0.01 ? PR.purse(pp[0], pp[1], 0.6, t, { swing: 3 * Math.sin(t * 3) }) : '';
      const youSeated = chair + seat.clip + `<g clip-path="url(#endlap)">${lit(Y, L)}</g>` + seat.lap + fur;
      const chars = lit(D, L) + lit(M, L) + soup + youSeated + lit(K, L) + purse + handsLit(K, L, 'R');
      return X.compose(X.stage(set, chars), c) + C.vignette(0.45) + dith(t);
    };
    X.shot('END', 40.55, X.T_END + 0.1, fn, { grade: 'gDay' });
    G.END_PURSE = tt => scr(add(purseAt(tt), [0, 70]), cam(tt));
  }
  X.tr('rack', 40.95, 0.8, 'KCH', 'END', { fa: [540, 960], fb: [540, 960], za: 1.06, zb: 1.05, blur: 10 });
  // the loop: push into the purse in your hands, settle out of the purse the young king hands you at frame 0
  X.tr('push', X.T_END, 0.62, 'END', 'OBS', { end: true, bOff: -X.T_END, fa: G.END_PURSE(X.T_END - 0.31), fb: G.OBS_PURSE(-0.31), za: 2.2, zb: 1.9, fade: [0.4, 0.62], blur: 4, easeA: 'in2', easeB: 'out' });
})(window);
