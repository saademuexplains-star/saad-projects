// "The Heroin Bottle" part 2: the cut-away home in one continuous camera: your daughter's cough, the week on the
// calendar, the spoonful, the sleep under the guardian angel; the next night, one spoon, then two; through the wall to
// the kitchen where you take it too, mornings and nights racing past the window until the bottle gives its last drop;
// your shaking hands, the pain; back through the wall to your daughter screaming -> the night queue at the pharmacy,
// every pair of hands shaking round an empty bottle -> the doctors who admit it too late -> the bottle on your shelf
// turns, and the word is HEROIN (loops into the first shot).
(function (G) {
  const X = G.ENG, Q = G.QCAST, S = G.SETS, PR = G.PROPS, C = G.CINE, R = G.RIG;
  const { track: TK, ss, clamp, lerp, EZ } = X;
  const { f, mix, rng, shade } = R;
  const TAU = Math.PI * 2, D2R = Math.PI / 180;
  const { wave, env, bump, idle, hh, scr, nrm, L2, add, gripAt, fingersFor, handAt, handsLit, CAM, mixArm, dith, litBody, armsOver, MOUTH, BASEUP, LT } = G.SHOTS_P;
  const lit = X.lit, up = [0, -1];
  const dirA = a => [Math.cos(a * D2R), Math.sin(a * D2R)];
  const angOf = v => Math.atan2(v[1], v[0]) / D2R;
  // ---- held props drawn in the world from the hand's ACTUAL frame (rig3 clamps the wrist ~75 deg off the forearm;
  // the same clamp is replayed here), so a bottle or a spoon stays rigid in the fist whatever the arm does
  const handFrame = (P, o, arm, side) => {
    const j = side === 'R' ? P.jR : P.jL, D = P.D, W = j.W, E = j.E;
    const fa0 = Math.atan2(W[1] - E[1], W[0] - E[0]);
    let da = Math.atan2(arm.dir[1], arm.dir[0]) - fa0;
    while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU;
    const flen = Math.hypot(W[0] - E[0], W[1] - E[1]), fsK = clamp((0.9 * D.fa - flen) / (0.4 * D.fa)), lim = 1.3 + (Math.PI * 0.97 - 1.3) * fsK;
    if (Math.abs(da) > lim + 0.03 && G.HF_LOG) G.HF_LOG.push({ side, over: Math.round((Math.abs(da) - lim) / D2R) });
    da = clamp(da, -lim, lim);
    const dl = [Math.cos(fa0 + da), Math.sin(fa0 + da)], sl = [W[0] + dl[0] * 0.33 * D.hand, W[1] + dl[1] * 0.33 * D.hand];
    const slot = R.toWorld(o, sl), tip = R.toWorld(o, [sl[0] + dl[0] * 10, sl[1] + dl[1] * 10]), fg = nrm([tip[0] - slot[0], tip[1] - slot[1]]);
    const tt = (side === 'R' ? -1 : 1) * ((arm.facing || 'back') === 'palm' ? 1 : -1);
    return { slot, fg, th: [fg[1] / tt, -fg[0] / tt] };
  };
  // the bottle in a hand frame (bottle x along the fingers, its up along the thumb), the syrup kept level in the world
  const bottleInFrame = (fr, s, t, o = {}) => {
    const { slot, th, fg } = fr, base = add(slot, th, -BASEUP * s);
    let ang = Math.atan2(fg[1], th[1]);
    if (-Math.sin(ang) * fg[1] - Math.cos(ang) * th[1] < 0) ang += Math.PI;
    const m = `matrix(${f(fg[0] * s)},${f(fg[1] * s)},${f(-th[0] * s)},${f(-th[1] * s)},${f(base[0])},${f(base[1])})`;
    return `<g transform="${m}">${PR.bottleLocal(t, Object.assign({}, o, { tilt: -ang / D2R, light: (o.light ?? -1) * Math.sign(fg[0] || 1) }))}</g>`;
  };
  const mouthOf = (fr, s) => add(fr.slot, fr.th, MOUTH * s);
  // the spoon in a hand frame (bowl toward the thumb); k its size in the grip frame
  const spoonInFrame = (fr, s, k, fill) => `<g transform="matrix(${f(fr.th[0] * s * k)},${f(fr.th[1] * s * k)},${f(fr.fg[0] * s * k)},${f(fr.fg[1] * s * k)},${f(fr.slot[0])},${f(fr.slot[1])})">${PR.spoonG({ fill })}</g>`;
  const bowlOf = (fr, s, k) => [fr.slot[0] + fr.th[0] * 148 * s * k + fr.fg[0] * 2 * s * k, fr.slot[1] + fr.th[1] * 148 * s * k + fr.fg[1] * 2 * s * k];
  // a figure seated in a chair: the rig cut at the hips, and a lap of skirt from the hips to the floor
  const seatedLap = (o, floorY, col, id) => {
    const fl = (floorY - o.y) / o.s, cut = o.y - 745 * o.s;
    const clip = `<defs><clipPath id="${id}"><rect x="${f(o.x - 2000)}" y="${f(cut - 4000)}" width="4000" height="4000"/></clipPath></defs>`;
    const d = `M-176,-772 L176,-772 C196,-706 210,-648 214,-606 C226,-560 240,-520 248,-480 C262,${f(fl - 260)} 272,${f(fl - 90)} 286,${f(fl - 10)} C120,${f(fl + 6)} -120,${f(fl + 6)} -286,${f(fl - 10)} C-272,${f(fl - 90)} -262,${f(fl - 260)} -248,-480 C-240,-520 -226,-560 -214,-606 C-210,-648 -196,-706 -176,-772Z`;
    let lap = `<defs><linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${shade(col, -0.32)}"/><stop offset="0.35" stop-color="${shade(col, 0.12)}"/><stop offset="0.6" stop-color="${col}"/><stop offset="1" stop-color="${shade(col, -0.38)}"/></linearGradient></defs><path d="${d}" fill="url(#${id}g)" stroke="#140c08" stroke-width="3" stroke-linejoin="round"/>`;
    // the apron falls over the lap
    lap += `<path d="M-120,-770 L120,-770 C130,-600 140,-420 146,${f(fl - 60)} Q0,${f(fl - 40)} -146,${f(fl - 60)} C-140,-420 -130,-600 -120,-770Z" fill="#e8e2d4" stroke="#140c08" stroke-width="2.5"/>`;
    for (const x of [-180, -90, 60, 170]) lap += `<path d="M${x},-740 C${x + 6},-500 ${x - 4},-300 ${x + 10},${f(fl - 30)}" stroke="#000" stroke-width="10" opacity="0.12" fill="none"/>`;
    return { clip, cut, lap: `<g transform="translate(${f(o.x)},${f(o.y)}) rotate(${f(o.sway || 0)}) scale(${f(o.s)})" filter="url(#clothS)">${lap}</g>` };
  };

  // ======================================================= HOME: the bedroom, the kitchen and back (11.55 - 34.65)
  {
    const B = S.HM;
    const MB = { x: 1830, y: 2050, s: 0.78 }, KO = { x: B.KIDX, y: 1790, s: 0.84 }, MK = { x: 740, y: 2104, s: 0.8 };
    const BSb = 0.55 * MB.s, BSk = 0.55 * MK.s, SPb = 0.65, SPk = 0.8;
    const KIDMOUTH = [B.KIDX, KO.y - 658 * KO.s];
    const cam = CAM(
      [[11.55, [2240, 1190, 0]], [13.1, [2080, 1205, 0], 'io'], [13.75, [1660, 990, 0], 'sine'], [14.3, [1830, 1262, 0], 'sine'], [15.5, [1845, 1270, 0], 'sine'], [16.35, [2120, 1225, 0], 'io'],
        [17.35, [2170, 1218, 0], 'sine'], [18.4, [2060, 1150, 0], 'io'], [19.35, [2240, 760, 0], 'io'], [20.4, [2200, 1185, 0], 'io'], [21.2, [2215, 1192, 0], 'sine'], [21.8, [1845, 1082, 0], 'sine'], [22.4, [2210, 1192, 0], 'sine'], [22.75, [2120, 1215, 0], 'sine'],
        [24.05, [790, 1185, 0], 'sine'], [24.6, [765, 1190, 0], 'sine'], [26.4, [750, 1172, 0], 'sine'], [27.8, [745, 1300, 0], 'io'], [29.7, [748, 1292, 0], 'sine'], [30.9, [760, 1195, 0], 'io'],
        [31.2, [780, 1190, 0], 'sine'], [32.55, [2190, 1190, 0], 'sine'], [33.7, [2215, 1196, 0], 'sine'], [34.65, [2430, 1000, 0], 'io']],
      [[11.55, 2.6], [13.1, 1.72, 'io'], [13.75, 2.05, 'sine'], [14.3, 2.45, 'sine'], [15.5, 2.72, 'sine'], [16.35, 2.35, 'io'], [17.35, 2.5, 'sine'], [18.4, 1.45, 'io'], [19.35, 1.75, 'io'],
        [20.4, 2.3, 'io'], [21.2, 2.45, 'sine'], [21.8, 2.62, 'sine'], [22.4, 2.45, 'sine'], [22.75, 2.15, 'sine'], [23.35, 1.86, 'sine'], [24.05, 1.72, 'sine'], [24.6, 1.66, 'sine'], [26.4, 1.95, 'sine'], [27.8, 2.75, 'io'], [29.7, 2.95, 'sine'],
        [30.9, 1.78, 'io'], [31.2, 1.82, 'sine'], [32.55, 2.0, 'sine'], [33.7, 2.55, 'sine'], [34.65, 1.72, 'io']]);
    // the moments the camera crosses the cut wall (no one is on screen then): who is in which room switches there
    const crossAt = (a, b) => { let lo = a, hi = b; const s0 = Math.sign(cam(a)[0] - B.SPLIT); for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (Math.sign(cam(m)[0] - B.SPLIT) === s0) lo = m; else hi = m; } return (lo + hi) / 2; };
    const X1 = crossAt(22.75, 24.05), X2 = crossAt(31.2, 32.55);
    // ---- the bedroom: her coughs (night 1 and night 2), the spoons, the sleep, the day passing in the window
    const COUGH1 = [11.62, 11.98, 12.42, 12.84, 13.32, 13.78, 14.52, 15.02], COUGH2 = [20.42, 20.74, 21.42, 21.66, 21.95, 22.7];
    const cough = t => (t < 19 ? COUGH1 : COUGH2).reduce((a, c) => a + bump(t, c, 1, 0.3), 0);
    const dayB = t => Math.pow(Math.sin(Math.PI * ss(19.45, 20.3, t)), 2);
    // spoon (her left hand, the bowl toward the child) and the bottle (upright in her right hand, on her lap). The
    // pours are close-ups (POUR); the second night's refills happen below frame while the camera holds on the child
    // the spoon rests in her hand on the edge of the bed, its bowl toward the child (her arm out, the fingers laid
    // inside the wrist's range), so feeding is only a small turn of the wrist
    const LAP_S = [2111, 1383], LAP_B = [1752, 1428];
    const FEED_TH = dirA(28), FEED_S = [KIDMOUTH[0] - 2 - FEED_TH[0] * 75, KIDMOUTH[1] + 2 - FEED_TH[1] * 75];
    const spB = TK([[11.5, LAP_S], [15.45, LAP_S], [16.2, FEED_S, 'io'], [16.45, FEED_S], [17.0, LAP_S, 'io'],
      [20.55, LAP_S], [21.12, FEED_S, 'io'], [21.32, FEED_S], [21.6, LAP_S, 'io'], [21.85, LAP_S], [22.38, FEED_S, 'io'], [22.58, FEED_S], [22.95, LAP_S, 'io'], [24, LAP_S]]);
    // the spoon's bowl dips toward her mouth as it arrives (thumb axis, deg)
    const spAng = TK([[11.5, 50], [15.45, 50], [16.2, 28, 'io'], [16.45, 28], [17.0, 50, 'io'], [20.55, 50], [21.12, 28, 'io'], [21.32, 28], [21.6, 50, 'io'], [21.85, 50], [22.38, 28, 'io'], [22.58, 28], [22.95, 50, 'io'], [24, 50]]);
    // filled in the close-up (night 1); on the second night, refilled while the camera is on her face
    const fillB = t => t < 16.25 ? ss(15.15, 15.2, t) : t < 19.45 ? 1 - ss(16.25, 16.5, t) : t < 21.22 ? ss(19.45, 19.5, t) : t < 21.7 ? 1 - ss(21.22, 21.36, t) : t < 22.46 ? ss(21.7, 21.75, t) : 1 - ss(22.46, 22.6, t);
    const sips = t => env(t, 16.05, 16.2, 16.32, 16.45) + env(t, 21.04, 21.12, 21.26, 21.34) + env(t, 22.3, 22.38, 22.52, 22.6);
    // ---- the kitchen: the first dose (the spoon already filled), the days and nights, then the close-up (DROP), the pain
    // she drinks from the bottle itself (her left hand flat on the table, the spoon lying by it)
    const T_TABLE = [880, 1395], T_HAND = [905, 1398];
    // the swig: the fist under her chin, the neck tipped up to her lips (the forearm runs up across her chest, so the
    // wrist needs no twist)
    const SW_A = -105, KB_SWIG = [MK.x - dirA(SW_A)[0] * MOUTH * BSk, MK.y - 1188 * MK.s - dirA(SW_A)[1] * MOUTH * BSk];
    const KB_TABLE = [620, 1415 - BASEUP * BSk], KB_HOLD = [700, 1292];
    const btK = TK([[23.0, KB_TABLE], [24.15, KB_TABLE], [24.42, KB_SWIG, 'io'], [24.62, KB_SWIG], [24.9, KB_TABLE, 'io'], [25.05, KB_TABLE], [25.3, KB_SWIG, 'io'], [25.48, KB_SWIG], [25.72, KB_TABLE, 'io'],
      [25.8, KB_TABLE], [26.02, KB_SWIG, 'io'], [26.18, KB_SWIG], [26.42, KB_HOLD, 'io'], [30, KB_HOLD]]);
    const axK = TK([[23.0, -90], [24.15, -90], [24.42, SW_A, 'io'], [24.62, SW_A], [24.9, -90, 'io'], [25.05, -90], [25.3, SW_A, 'io'], [25.48, SW_A], [25.72, -90, 'io'], [25.8, -90], [26.02, SW_A, 'io'], [26.18, SW_A], [26.42, -90, 'io'], [30, -90]]);
    const levelK = t => 0.62 - 0.12 * ss(24.4, 24.62, t) - 0.18 * ss(25.25, 25.5, t) - 0.18 * ss(25.98, 26.2, t) - 0.12 * ss(26.25, 26.45, t);
    const dayK = t => Math.pow(Math.sin(Math.PI * 2 * ss(24.75, 26.35, t)), 2);
    const declK = t => lerp(0.08, 0.7, ss(24.7, 26.4, t)) + 0.22 * ss(26.4, 29.9, t);
    // the close-up shows the empty bottle slip from her fingers; back here it already lies on the table
    const AFTER = 29.6, hug = t => EZ.io(ss(29.75, 30.25, t)), pain = t => ss(29.8, 30.3, t);
    const fn = t => {
      const c = hh(cam(t), t, 0.25, 51);
      const inK = t >= X1 && t < X2;
      const db = dayB(t), dk = dayK(t);
      const set = S.home(t, { cal: t < 19.9 ? 7 : 8, day: inK ? dk : db, lamp: inK ? 1 - dk : 1, candle: 1 - db, bedNight: 1 - db, moon: 1 - db, clock: 21.5 + (t - 23) / 3600 * 60 + 48 * ss(24.75, 26.35, t) });
      // ---- the child in bed (always there; in withdrawal once the camera has left her room)
      const wd = t >= X1 ? 1 : 0, cg = cough(t);
      const sleep = t < 19.45 ? EZ.io(ss(16.6, 17.4, t)) : t < 20.35 ? 1 - EZ.io(ss(19.85, 20.3, t)) : 0;
      const kO = Object.assign(idle(t, 21, 0.25), KO, { y: KO.y + 16 * sleep - 18 * wd, tilt: wd ? 7 * Math.sin(TAU * 1.5 * t) : -5 * cg + 9 * sleep });
      let kFace;
      if (wd) { const sq = 0.5 + 0.5 * Math.sin(TAU * 1.1 * t); kFace = { expr: 'grief', look: [-0.75, -0.15], lid: 0.12 + 0.35 * sq, mouth: 'cry', open: 0.2 + 0.05 * Math.sin(TAU * 2.3 * t), tears: 1, sweat: 0.8, brows: [11, -2] }; }
      else if (sleep > 0.02) kFace = { expr: 'neutral', look: [-0.2, 0.2], lid: lerp(0.4, 1, sleep), mouth: sleep > 0.6 ? 'smile' : 'closed', brows: [lerp(5, -1, sleep), 1] };
      else { const sp = sips(t); kFace = { expr: 'tired', look: sp > 0.05 || (t > 15.6 && t < 16.4) ? [-0.55, 0.35] : [-0.45, 0.05], lid: 0.32 + 0.45 * cg, mouth: 'parted', open: 0.05 + 0.15 * Math.max(cg, sp), brows: [6 + 2 * cg, 0] }; }
      const kArmR = wd ? { hand: [-330 + 14 * Math.sin(TAU * 1.5 * t), -640 + 10 * Math.sin(TAU * 2.1 * t)], dir: [-0.75, -0.45], pose: 'open', facing: 'palm' } : { hand: [-150, -470], dir: [0.25, 1], pose: 'relaxed', facing: 'back' };
      const kArmL = wd ? { hand: [130, -430], dir: [-0.2, 1], pose: 'fist', facing: 'back' } : { hand: [150, -470], dir: [-0.25, 1], pose: 'relaxed', facing: 'back' };
      const KP = Q.child(Object.assign({}, kO, { sick: 1 - wd, wd, lightX: -1, face: kFace, armR: kArmR, armL: kArmL }));
      const kidClip = `<defs><clipPath id="hmkid"><rect x="1500" y="0" width="1500" height="${B.QUILT + 20}"/></clipPath></defs>`;
      const kid = kidClip + `<g clip-path="url(#hmkid)">${Q.withArt(KP, kO, Q.childArt, litBody(KP, LT.bed))}</g>`;
      let chars = kid + S.homeQuilt17(t, { breath: 1 - wd, toss: wd });
      // ---- you: at the bedside (before the first crossing) or at the kitchen table (between the crossings)
      if (!inK && t < X1) {
        const mO = Object.assign(idle(t, 23, 0.3), MB, { lightX: -1 });
        const thS = dirA(spAng(t)), armL = gripAt(mO, 'you', spB(t), fingersFor('L', 'back', thS), { detachHand: true });
        const armR = gripAt(mO, 'you', LAP_B, fingersFor('R', 'back', up), { detachHand: true });
        const feeding = sips(t) > 0.02 || (t > 15.6 && t < 16.5) || (t > 20.75 && t < 21.4) || (t > 22.0 && t < 22.65);
        const relief = t < 19.4 ? ss(17.0, 17.6, t) : 0, worry = t > 20.35 ? 1 : 0;
        const look = feeding ? [0.8, 0.25] : t > 13.85 && t < 15.5 ? [0.35, 0.75] : [0.75, 0.1];
        const face = relief > 0.02 ? { expr: 'neutral', look: [0.7, 0.3], lid: lerp(0.18, 0.34, relief), mouth: 'smile', brows: [lerp(6, 1, relief), 1] }
          : { expr: 'anxious', look, lid: 0.15, mouth: 'tight', brows: [7 + 2 * worry, -1] };
        const MP = Q.you(Object.assign({}, mO, { tilt: (feeding ? 5 : 0) - 3 * relief, face, armL, armR }));
        const frS = handFrame(MP, mO, armL, 'L'), frB = handFrame(MP, mO, armR, 'R');
        const seat = seatedLap(mO, 2010, '#1e2438', 'hmlapB');
        chars += seat.clip + `<g clip-path="url(#hmlapB)">${Q.withArt(MP, mO, Q.youArt(mO), litBody(MP, LT.bed))}</g>` + seat.lap;
        chars += bottleInFrame(frB, BSb, t, { rot: 180, level: t < 16 ? 0.85 : 0.72, cork: false, light: -1 }) + spoonInFrame(frS, mO.s, SPb, fillB(t)) + handsLit(MP, LT.bed, 'RL');
      }
      chars += S.homeFoot17(t);
      if (inK) {
        const dcl = declK(t), hg = hug(t), pn = pain(t), after = t >= AFTER;
        const rock = pn * Math.sin(TAU * 0.8 * (t - 29.9));
        const mO = Object.assign(idle(t, 29, 0.3), MK, { y: MK.y + 38 * pn, sway: 2.5 * rock, lightX: 1 });
        const ax = dirA(axK(t));
        const armLg = handAt(mO, T_HAND, [-0.25, 1], { pose: 'relaxed', facing: 'back', detachHand: true });
        const armRg = gripAt(mO, 'you', btK(t), fingersFor('R', 'back', ax), { detachHand: true });
        // after the bottle has fallen her arms wrap round her middle
        const hugR = { hand: [-60 + 6 * rock, -950], dir: [0.85, 0.2], pose: 'relaxed', facing: 'back', detachHand: true }, hugL = { hand: [70 + 6 * rock, -930], dir: [-0.85, 0.2], pose: 'relaxed', facing: 'back', detachHand: true };
        const armR = after ? mixArm(Object.assign({}, armRg, { pose: 'open' }), hugR, hg) : armRg, armL = after ? mixArm(Object.assign({}, armLg, { pose: 'open' }), hugL, hg) : armLg;
        const gulp = env(t, 24.4, 24.44, 24.58, 24.64), swig = env(t, 25.28, 25.32, 25.44, 25.5) + env(t, 26.0, 26.04, 26.14, 26.2);
        const turn = ss(31.0, 31.3, t);
        let face;
        if (pn > 0.02 && turn < 0.5) face = { expr: 'grief', look: [0.05, 0.55], lid: lerp(0.3, 0.75, 0.5 + 0.5 * Math.sin(TAU * 0.9 * t)), mouth: 'cry', open: 0.08, brows: [10, -2], sweat: 0.9 };
        else if (turn >= 0.5) face = { expr: 'fear', wide: true, look: [0.95, -0.05], lid: 0.06, mouth: 'parted', open: 0.1, brows: [10, -1], sweat: 0.9 };
        else if (t > 26.3) face = { expr: 'fear', look: [-0.15, 0.6], lid: 0.1, mouth: 'tight', brows: [9, -1], sweat: 0.6 };
        else face = { expr: 'tired', look: gulp + swig > 0.05 ? [0.0, -0.1] : [0.0, 0.6], lid: gulp + swig > 0.05 ? 0.7 : lerp(0.28, 0.42, dcl), mouth: gulp + swig > 0.05 ? 'closed' : 'tight', brows: [5, 0], sweat: 0.3 * dcl };
        const MP = Q.you(Object.assign({}, mO, { decl: dcl, tilt: 3 * rock - 6 * pn * (1 - turn) + 4 * turn, face, armL, armR }));
        let props = '';
        props += `<g transform="translate(${f(T_TABLE[0] - 40)},${f(T_TABLE[1] + 10)}) rotate(6) scale(${f(MK.s * SPk)})"><g transform="scale(-1,1)">${PR.spoonG({ fill: 0 })}</g></g>`;
        if (!after) {
          const frB = handFrame(MP, mO, armR, 'R');
          props += bottleInFrame(frB, BSk, t, { rot: 180, level: Math.max(0, levelK(t)), cork: false, light: 1 });
        } else {
          // the empty bottle lies where it fell (label down), the spoon beside it
          const wob = 6 * Math.sin(TAU * 2.2 * (t - AFTER)) * Math.exp(-(t - AFTER) * 5), lie = 90 + wob, a = BASEUP * BSk, cc = [800, 1392 - 62 * BSk];
          props += PR.heroinBottle(cc[0] - a * Math.sin(lie * D2R), cc[1] + a * Math.cos(lie * D2R), BSk, t, { lie, rot: 180, level: 0, cork: false, light: 1 });
        }
        // the bottle standing on the table when not in her hand is the one in her hand (she never lets go before the drop)
        chars += Q.withArt(MP, mO, Q.youArt({ decl: dcl }), litBody(MP, LT.kitchen)) + S.homeTable17(t, { lamp: 1 - dk, mess: ss(24.7, 26.4, t) }) + armsOver(MP, LT.kitchen, 'RL') + props + handsLit(MP, LT.kitchen, 'RL');
      } else chars += S.homeTable17(t, { lamp: 1 });
      return X.compose(X.stage(set, chars), c) + C.vignette(0.5) + dith(t);
    };
    // one continuous world, interrupted by the two close-ups
    X.shot('HOMEa', 11.55, 14.4, fn, { grade: 'gNight' });
    X.shot('HOMEb', 15.25, 26.9, fn, { grade: 'gNight' });
    X.shot('HOMEc', 29.65, 34.65, fn, { grade: 'gNight' });
    G.HOME_KIDFACE = tt => scr([B.KIDX, KO.y - 734 * KO.s], cam(tt));
    G.HOME_MOON = tt => scr([2840, 520], cam(tt), 0.3);
    G.HOME_HANDS = tt => scr([2150, 1420], cam(tt));
    G.HOME_X = [X1, X2];
  }
  X.tr('morph', 11.85, 0.6, 'PHARM', 'HOMEa', { fa: G.PHARM_CHERUB(11.85), fb: G.HOME_KIDFACE(11.85), za: 1.4, zb: 1.35, col: '#000000' });

  // ---- the close-ups: hands only (no body in frame), the arms entering from off-frame
  const SKIN = '#efcfb4', SLEEVE = '#ddd0b8', HS = 300, KH = HS / 104;
  // a close-up forearm: the blouse sleeve (shaded round, with creases) ending in a buttoned cuff, a little bare wrist,
  // then the rig's hand; the sleeve runs back off the frame along the fingers' line
  const closeHand = (fr, side, pose, skin = SKIN) => {
    const d = fr.fg, n = [-d[1], d[0]], w = add(fr.slot, d, -0.33 * HS), cuff = add(w, d, -0.16 * HS), cuff2 = add(cuff, d, -42), from = add(w, d, -1100);
    const w0 = HS * 0.7, w1 = HS * 0.48, P = (p, k) => `${f(p[0] + n[0] * k)},${f(p[1] + n[1] * k)}`, id = R.uid('csl');
    let g = `<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${f(cuff[0] + n[0] * w1 / 2)}" y1="${f(cuff[1] + n[1] * w1 / 2)}" x2="${f(cuff[0] - n[0] * w1 / 2)}" y2="${f(cuff[1] - n[1] * w1 / 2)}"><stop offset="0" stop-color="${shade(SLEEVE, -0.42)}"/><stop offset="0.3" stop-color="${shade(SLEEVE, 0.05)}"/><stop offset="0.62" stop-color="${SLEEVE}"/><stop offset="1" stop-color="${shade(SLEEVE, -0.45)}"/></linearGradient></defs>`;
    g += `<path d="M${P(from, w0 / 2)} L${P(cuff2, w1 / 2)} L${P(cuff2, -w1 / 2)} L${P(from, -w0 / 2)}Z" fill="url(#${id})" stroke="#20140c" stroke-width="2.5"/>`;
    for (const [k, s2] of [[140, 1], [300, -1], [470, 1], [650, -1]]) { const c = add(cuff2, d, -k), wk = lerp(w1, w0, k / 1060); g += `<path d="M${P(c, s2 * wk * 0.48)} Q${P(add(c, d, 34), s2 * wk * 0.1)} ${P(add(c, d, 6), -s2 * wk * 0.3)}" stroke="${shade(SLEEVE, -0.4)}" stroke-width="6" fill="none" opacity="0.45" stroke-linecap="round"/>`; }
    g += `<path d="M${P(cuff2, w1 / 2)} L${P(from, w0 / 2)}" stroke="#000" stroke-width="16" opacity="0.12"/>`;
    g += `<path d="M${P(cuff, w1 * 0.36)} L${P(w, HS * 0.17)} L${P(w, -HS * 0.17)} L${P(cuff, -w1 * 0.36)}Z" fill="${mix(skin, '#c97a62', 0.12)}" stroke="#20140c" stroke-width="2"/>`;
    g += `<path d="M${P(cuff, w1 / 2 + 5)} L${P(cuff2, w1 / 2 + 5)} L${P(cuff2, -w1 / 2 - 5)} L${P(cuff, -w1 / 2 - 5)}Z" fill="${shade(SLEEVE, -0.06)}" stroke="#20140c" stroke-width="2.5"/>`;
    for (const k of [0.22, -0.22]) { const b = add(add(cuff, d, -21), n, k * w1); g += `<circle cx="${f(b[0])}" cy="${f(b[1])}" r="7" fill="#f4eee2" stroke="#6a5a48" stroke-width="1.5"/>`; }
    g += R.hand({ x: w[0], y: w[1], dir: d, side, facing: 'back', thumb: 'auto', pose, size: HS, skin });
    return `<g filter="url(#skinS)">${g}</g>`;
  };
  // ======================================================= POUR: the spoonful, close (13.8 - 15.85)
  // "So you pour one spoonful,"
  {
    const BSc = 0.55 * KH, SPc = 0.65 * KH;
    const mouthP = TK([[13.8, [400, 820]], [14.3, [532, 1000], 'io'], [15.25, [538, 1006], 'sine'], [15.85, [390, 790], 'io']]);
    const angP = TK([[13.8, -20], [14.3, 34, 'io'], [15.25, 37, 'sine'], [15.85, -40, 'io']]);
    const bowlP = TK([[13.8, [566, 1122]], [14.3, [546, 1094], 'io'], [15.3, [546, 1094]], [15.85, [690, 1012], 'io']]);
    const flow = t => env(t, 14.36, 14.5, 15.12, 15.28), fill = t => ss(14.42, 15.2, t);
    const cam = CAM([[13.8, [545, 1052, 0]], [15.85, [548, 1040, -1.5], 'sine']], [[13.8, 1.0], [15.85, 1.3, 'sine']]);
    // the quilt and the candle, out of focus behind the hands
    const back = (() => {
      const r = rng(141), cols = ['#5a2a2a', '#7a6a50', '#2a3a4a', '#4a5434', '#7a5440', '#8a8270', '#3a3046', '#6a3a32'];
      let g = `<rect x="-900" y="-900" width="2900" height="3700" fill="#1a1210"/>`;
      for (let j = 0; j < 6; j++) for (let i = 0; i < 7; i++) { const x = -700 + i * 330 + (j % 2) * 60, y = 900 + j * 300; g += `<rect x="${x}" y="${y}" width="330" height="300" fill="${cols[Math.floor(r() * cols.length)]}" opacity="0.9"/><rect x="${x + 8}" y="${y + 8}" width="314" height="284" fill="none" stroke="#c8b898" stroke-width="5" stroke-dasharray="18 14" opacity="0.35"/>`; }
      g += `<path d="M-900,860 C-200,800 900,820 2000,880 L2000,1000 C900,940 -200,930 -900,990Z" fill="#e8e2d6" opacity="0.75"/>`;
      g += `<rect x="-900" y="-900" width="2900" height="3700" fill="url(#hmPourV)"/><defs><linearGradient id="hmPourV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c0806" stop-opacity="0.85"/><stop offset="0.45" stop-color="#0c0806" stop-opacity="0.2"/><stop offset="1" stop-color="#0c0806" stop-opacity="0.6"/></linearGradient></defs>`;
      return g;
    })();
    const fn = t => {
      const c = hh(cam(t), t, 0.35, 91);
      const a = dirA(angP(t)), frB = { th: a, fg: fingersFor('L', 'back', a) }; frB.slot = add(mouthP(t), a, -MOUTH * BSc);
      const thS = [-1, 0], fgS = fingersFor('R', 'back', thS), bw = bowlP(t), frS = { th: thS, fg: fgS, slot: [bw[0] + 148 * SPc - fgS[0] * 2 * SPc, bw[1] - fgS[1] * 2 * SPc] };
      const mouth = mouthP(t);
      const bokeh = C.radial(170, 380, 360, '#ffb860', 0.42 + 0.04 * Math.sin(t * 9), 'screen') + C.radial(250, 330, 90, '#fff0c8', 0.35, 'screen') + C.radial(900, 300, 220, '#8aa0d0', 0.12, 'screen');
      const front = bottleInFrame(frB, BSc, t, { rot: 180, level: 0.85, cork: false, light: -1 }) + closeHand(frB, 'L', 'grip') + PR.syrupStream(mouth[0], mouth[1], bw[0], bw[1] - 10, t, flow(t)) + spoonInFrame(frS, 1, SPc, fill(t)) + closeHand(frS, 'R', 'grip');
      return X.compose([{ p: 0.55, svg: back + bokeh }, { p: 1, svg: front }], c) + C.vignette(0.55) + dith(t);
    };
    X.shot('POUR', 13.8, 15.85, fn, { grade: 'gNight' });
    G.POUR_BOWL = tt => scr(bowlP(tt), cam(tt));
  }
  X.tr('carry', 14.1, 0.6, 'HOMEa', 'POUR', { mode: 'zoom', k: 1.7, fa: G.HOME_HANDS(14.1), fb: G.POUR_BOWL(14.1), blur: 4 });
  X.tr('organic', 15.55, 0.6, 'POUR', 'HOMEb', { fa: G.POUR_BOWL(15.55), fb: G.HOME_HANDS(15.55), za: 1.12, zb: 0.92, seed: 23 });

  // ======================================================= DROP: the last drop, the shaking hands (26.3 - 30.25)
  // "until one day the bottle runs out. Your hands start shaking,"
  {
    const BSc = 0.55 * KH, SPc = 0.65 * KH, PALE = mix(SKIN, '#dccabe', 0.85);
    const BOWL = [468, 1040];
    const ang = TK([[26.3, 58], [26.95, 90, 'io'], [30.3, 90]]);
    const mouthD = TK([[26.3, [380, 800]], [26.95, [452, 900], 'io'], [28.4, [456, 912], 'sine'], [29.0, [460, 968], 'io'], [29.5, [462, 972], 'sine']]);
    const shakeY = t => 36 * Math.sin(TAU * 3.2 * (t - 26.98)) * env(t, 26.98, 27.08, 27.42, 27.56);
    const tremK = t => ss(28.3, 28.9, t), slip = t => EZ.in2(ss(29.5, 29.85, t));
    const trem = (t, ph, k) => [k * (7 * Math.sin(TAU * 8.7 * t + ph) + 4 * Math.sin(TAU * 13.1 * t + 2 * ph)), k * (5 * Math.sin(TAU * 10.3 * t + 1.7 * ph) + 3 * Math.sin(TAU * 14.7 * t + ph))];
    const cam = CAM([[26.3, [470, 965, 0]], [27.75, [462, 985, 0.8], 'io'], [29.0, [520, 995, -0.6], 'sine'], [30.3, [530, 1010, 0], 'sine']],
      [[26.3, 1.15], [27.75, 1.58, 'io'], [29.0, 1.3, 'sine'], [30.3, 1.34, 'sine']]);
    // the kitchen table top and the lamp, out of focus
    const back = (() => {
      let g = `<rect x="-900" y="-900" width="2900" height="3700" fill="#140e0a"/><defs><linearGradient id="hmDropT" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a4028"/><stop offset="1" stop-color="#8a6a44"/></linearGradient></defs>`;
      g += `<path d="M-900,1250 L2000,1180 L2000,2800 L-900,2800Z" fill="url(#hmDropT)"/>`;
      for (let i = 0; i < 14; i++) g += `<path d="M-900,${1290 + i * 70 + i * i * 6} C0,${1270 + i * 72 + i * i * 6} 900,${1260 + i * 70 + i * i * 6} 2000,${1230 + i * 70 + i * i * 6}" stroke="#3a2614" stroke-width="${3 + i * 0.4}" fill="none" opacity="0.4"/>`;
      g += `<rect x="-900" y="-900" width="2900" height="3700" fill="url(#hmDropV)"/><defs><linearGradient id="hmDropV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#080504" stop-opacity="0.85"/><stop offset="0.5" stop-color="#080504" stop-opacity="0.25"/><stop offset="1" stop-color="#080504" stop-opacity="0.55"/></linearGradient></defs>`;
      return g;
    })();
    const fn = t => {
      const c = hh(cam(t), t, 0.35, 93);
      const tk = tremK(t), sl = slip(t);
      const a = dirA(ang(t)), m0 = add(add(mouthD(t), [0, shakeY(t)]), trem(t, 0.4, tk));
      const frB = { th: a, fg: fingersFor('L', 'back', a) }; frB.slot = add(m0, a, -MOUTH * BSc);
      // the bottle slips: it drops and turns away from the open hand
      const fallB = { th: dirA(90 + 70 * sl), fg: fingersFor('L', 'back', dirA(90 + 70 * sl)) }; fallB.slot = add(frB.slot, [10 * sl, 900 * sl * sl]);
      const thS = [-1, 0], fgS = fingersFor('R', 'back', thS), bw = add(BOWL, trem(t, 2.3, tk)), frS = { th: thS, fg: fgS, slot: [bw[0] + 148 * SPc - fgS[0] * 2 * SPc, bw[1] - fgS[1] * 2 * SPc] };
      // the last drop swells at the mouth and falls into the empty spoon
      let drop = '';
      if (t > 27.3 && t < 27.92) { const u = ss(27.62, 27.88, t), sw = ss(27.3, 27.6, t), mo = add(frB.slot, a, MOUTH * BSc); drop = PR.syrupDrop(lerp(mo[0], bw[0], u), lerp(mo[1] + 10, bw[1] - 10, EZ.in2(u)), (0.6 + 0.6 * sw) * KH * 0.55); }
      const fillD = 0.14 * ss(27.86, 27.92, t);
      const lamp = C.radial(860, 360, 380, '#ffc070', 0.38 + 0.03 * Math.sin(t * 11), 'screen') + C.radial(860, 360, 110, '#fff0c0', 0.3, 'screen');
      const bottle = bottleInFrame(sl > 0.001 ? fallB : frB, BSc, t, { rot: 180, level: 0, cork: false, light: 1 });
      const front = bottle + closeHand(frB, 'L', sl > 0.15 ? 'open' : 'grip', PALE) + drop + spoonInFrame(frS, 1, SPc, fillD) + closeHand(frS, 'R', 'grip', PALE);
      return X.compose([{ p: 0.55, svg: back + lamp }, { p: 1, svg: front }], c) + C.vignette(0.6) + dith(t);
    };
    X.shot('DROP', 26.3, 30.25, fn, { grade: 'gNight' });
    G.DROP_HANDS = tt => scr([540, 1000], cam(tt));
  }
  X.tr('eyelid', 26.6, 0.6, 'HOMEb', 'DROP', {});
  X.tr('carry', 29.95, 0.6, 'DROP', 'HOMEc', { mode: 'tilt', dir: [0, -1], dist: 0.42, blur: 12 });

  // ======================================================= QUEUE: the night line at the pharmacy (34.05 - 38.9)
  // "while at the pharmacy, the line is full of parents with the same shaking hands"
  {
    const B = S.PH, PO = { x: 1440, y: 2150, s: 0.84 };
    // six parents from the front (nearest, left) to the counter (right); each holds an empty bottle, shaking
    const LINE = [[5, 150, 2640, 1.0], [2, 395, 2520, 0.95], [0, 615, 2420, 0.9], [3, 820, 2330, 0.86], [4, 1015, 2250, 0.82], [1, 1200, 2180, 0.78]];
    const BS = 0.55;
    const p = 0.88, lampW = [700, 600];
    const lcx = 540 + (lampW[0] - 540) / p, lcy = 960 + (lampW[1] + 160 - 960) / p;
    const cam = CAM([[34.05, [lcx, lcy, 0]], [35.3, [1260, 1520, 0], 'sine'], [37.45, [270, 1800, 0], 'sine'], [38.9, [150, 1905, 0], 'in2']],
      [[34.05, 1.55], [35.3, 1.32, 'sine'], [37.45, 1.42, 'sine'], [38.9, 2.7, 'in2']]);
    // each parent's bottle grip, at the chest: side, offset from the body (local), thumb up
    const HOLD = [['R', [-40, -900]], ['L', [50, -880]], ['R', [-30, -910]], ['L', [40, -920]], ['R', [-50, -890]], ['L', [30, -900]]];
    const fn = t => {
      const c = hh(cam(t), t, 0.3, 61), L = LT.gas;
      const set = S.pharmacy(t, { night: 1 });
      // the pharmacist, grim, shaking his head slowly at the counter's end; the pyramid of cartons is gone
      const pO = Object.assign(idle(t, 11, 0.3), PO, { tilt: 5 * Math.sin(TAU * 0.55 * (t - 34)) });
      const PP = Q.pharmacist(Object.assign({}, pO, { face: { expr: 'grim', look: [-0.8, 0.1], lid: 0.4, mouth: 'tight', brows: [7, -2] }, armR: { hand: [-40, -930], dir: [0.75, 0.45], pose: 'relaxed', facing: 'back', detachHand: true }, armL: { hand: [40, -930], dir: [-0.75, 0.45], pose: 'relaxed', facing: 'back', detachHand: true } }));
      // he stands behind the counter: his legs are cut at its foot (the camera sees the floor in front of it), and the
      // register on the counter hides his left arm; the lozenge jar would sit in front of his coat, so it is left out
      const legClip = `<defs><clipPath id="qphc"><rect x="-4000" y="-4000" width="9000" height="${4000 + B.COUNTER[3] - 30}"/></clipPath></defs>`;
      let chars = legClip + `<g clip-path="url(#qphc)">${Q.withArt(PP, pO, Q.pharmArt, litBody(PP, L))}</g>` + S.counter17(t, { cartons: 0, jar: false, reg: false }) + armsOver(PP, L, 'RL') + handsLit(PP, L, 'RL') + PR.register(B.REG[0], B.REG[1], 1.0, {});
      // back to front
      for (let i = LINE.length - 1; i >= 0; i--) {
        const [k, x, y, s] = LINE[i], par = Q.parents[k], [side, off] = HOLD[i];
        const o = Object.assign(idle(t, 70 + i * 7, 0.3), { x, y, s, sway: X.noise(t * 0.6, i) * 0.8 });
        const tr = [3.4 * Math.sin(TAU * (8.6 + i * 0.7) * t + i) + 2 * Math.sin(TAU * (12.8 + i) * t + 2 * i), 2.6 * Math.sin(TAU * (10.1 + i * 0.5) * t + 3 * i)];
        const gw = add(R.toWorld(o, off), tr);
        const arm = gripAt(o, Q.PARENT_HAND[k], gw, fingersFor(side, 'back', up), { detachHand: true });
        const other = side === 'R' ? { hand: [130, -820], dir: [-0.3, 1], pose: i % 2 ? 'fist' : 'relaxed', facing: 'back' } : { hand: [-130, -820], dir: [0.3, 1], pose: i % 2 ? 'fist' : 'relaxed', facing: 'back' };
        const look = i === 5 ? [0.85, 0] : i % 2 ? [0.4, 0.55] : [0.75, -0.05];
        const face = { expr: i % 3 === 0 ? 'fear' : 'anxious', look, lid: i === 3 ? 0.36 : 0.16, mouth: 'tight', brows: [8, -1], sweat: 0.6 + 0.1 * i, bags: 0.6 };
        const PPi = par.mk(Object.assign({}, o, { face, armR: side === 'R' ? arm : other, armL: side === 'L' ? arm : other }));
        const fr = handFrame(PPi, o, arm, side);
        chars += Q.withArt(PPi, o, par.art, lit(PPi, L)) + bottleInFrame(fr, BS * s, t, { rot: 180, level: 0, cork: false, light: 1 }) + handsLit(PPi, L, side);
      }
      return X.compose(X.stage(set, chars), c) + C.vignette(0.55) + dith(t);
    };
    X.shot('QUEUE', 34.05, 38.9, fn, { grade: 'gNight' });
    G.QUEUE_LAMP = tt => scr(lampW, cam(tt), p);
    const F = LINE[0], fo = { x: F[1], y: F[2], s: F[3] };
    G.QUEUE_BOTTLE = tt => scr(add(R.toWorld(fo, HOLD[0][1]), [0, -40]), cam(tt));
  }
  X.tr('radial', 34.35, 0.6, 'HOMEc', 'QUEUE', { fa: G.HOME_MOON(34.35), fb: G.QUEUE_LAMP(34.35), za: 1.1, zb: 1.15 });

  // ======================================================= DOCS: the doctors admit it (38.3 - 41.7)
  // "and by the time doctors admit what they've done, it's too late,"
  {
    const B = S.DR, AO = { x: 560, y: 2120, s: 0.82 }, BO = { x: 250, y: 2110, s: 0.84 }, CO = { x: 870, y: 2125, s: 0.8 };
    // the bottle stands near the front edge of the table, in front of his clasped hands
    const BOT = [560, 1505], BWd = 0.46;
    const cam = CAM([[38.3, [560, 1430, 0]], [39.25, [565, 1310, 0], 'io'], [40.1, [565, 1185, 0], 'io'], [40.85, [562, 1200, 0], 'sine'], [41.7, [560, 1420, 0], 'io']],
      [[38.3, 2.6], [39.25, 1.22, 'io'], [40.1, 1.95, 'io'], [40.85, 2.15, 'sine'], [41.7, 2.65, 'io']]);
    // the newspaper the young doctor opens (a front page with a bottle and a skull drawn large, no lettering)
    const paper = (cx, cy, w, h, open) => {
      const hh2 = h * (0.35 + 0.65 * open);
      let g = `<rect x="${f(cx - w / 2)}" y="${f(cy - hh2 / 2)}" width="${f(w)}" height="${f(hh2)}" fill="#e8e2d0" stroke="#4a4030" stroke-width="2"/>`;
      if (open > 0.3) {
        const k = ss(0.3, 0.8, open), x0 = cx - w / 2 + 14, y0 = cy - hh2 / 2 + 14;
        g += `<g opacity="${f(k)}"><rect x="${f(x0)}" y="${f(y0)}" width="${f(w - 28)}" height="18" fill="#2a2420"/>`;
        for (let i = 0; i < 9; i++) g += `<rect x="${f(x0)}" y="${f(y0 + 30 + i * 12)}" width="${f((w - 28) * 0.42)}" height="4" fill="#8a8270"/>`;
        const ix = cx + w * 0.06, iy = y0 + 30, iw = (w - 28) * 0.5, ih = hh2 - 64;
        g += `<rect x="${f(ix)}" y="${f(iy)}" width="${f(iw)}" height="${f(ih)}" fill="#d8d0bc" stroke="#4a4030" stroke-width="1.5"/>`;
        g += `<path d="M${f(ix + iw * 0.36)},${f(iy + ih * 0.92)} L${f(ix + iw * 0.36)},${f(iy + ih * 0.42)} C${f(ix + iw * 0.36)},${f(iy + ih * 0.3)} ${f(ix + iw * 0.44)},${f(iy + ih * 0.28)} ${f(ix + iw * 0.44)},${f(iy + ih * 0.2)} L${f(ix + iw * 0.56)},${f(iy + ih * 0.2)} C${f(ix + iw * 0.56)},${f(iy + ih * 0.28)} ${f(ix + iw * 0.64)},${f(iy + ih * 0.3)} ${f(ix + iw * 0.64)},${f(iy + ih * 0.42)} L${f(ix + iw * 0.64)},${f(iy + ih * 0.92)}Z" fill="#3a2a1e"/>`;
        g += `<circle cx="${f(ix + iw * 0.5)}" cy="${f(iy + ih * 0.6)}" r="${f(iw * 0.1)}" fill="#e8e2d0"/><circle cx="${f(ix + iw * 0.47)}" cy="${f(iy + ih * 0.59)}" r="${f(iw * 0.025)}" fill="#3a2a1e"/><circle cx="${f(ix + iw * 0.53)}" cy="${f(iy + ih * 0.59)}" r="${f(iw * 0.025)}" fill="#3a2a1e"/>`;
        g += `<path d="M${f(ix + iw * 0.4)},${f(iy + ih * 0.72)} L${f(ix + iw * 0.6)},${f(iy + ih * 0.8)} M${f(ix + iw * 0.6)},${f(iy + ih * 0.72)} L${f(ix + iw * 0.4)},${f(iy + ih * 0.8)}" stroke="#e8e2d0" stroke-width="3"/>`;
        for (let i = 0; i < 4; i++) g += `<rect x="${f(x0)}" y="${f(iy + ih - 40 + i * 10)}" width="${f((w - 28) * 0.42)}" height="4" fill="#8a8270"/>`;
        g += `</g>`;
      }
      return g;
    };
    const fn = t => {
      const c = hh(cam(t), t, 0.25, 71), L = LT.docs;
      const set = S.docRoom(t, {});
      const admit = ss(39.3, 39.9, t), late = ss(40.3, 40.9, t);
      // the senior physician: eyes on the bottle, then his head bows and his eyes close. His hands are clasped on the
      // table in front of him (arms down his sides, forearms in), clear of his colleagues' arms in the push-in
      const aO = Object.assign(idle(t, 31, 0.25), AO, { tilt: 9 * admit + 3 * late });
      const A = Q.docA(Object.assign({}, aO, { face: { expr: admit > 0.5 ? 'grief' : 'grim', look: [0, 0.75], lid: lerp(0.32, 0.85, late), mouth: 'tight', brows: [lerp(4, 10, admit), -2] }, armR: { hand: [-45, -880], dir: [0.75, 0.45], pose: 'relaxed', facing: 'back', detachHand: true }, armL: { hand: [45, -880], dir: [-0.75, 0.45], pose: 'relaxed', facing: 'back', detachHand: true } }));
      // the bearded doctor lowers his report and looks at his colleague
      const bO = Object.assign(idle(t, 33, 0.25), BO);
      const drop = ss(39.55, 39.85, t), rp = L2([BO.x + 40, 1320], [BO.x + 70, 1468], EZ.in2(drop));
      const bArm = gripAt(bO, 'docB', rp, fingersFor('L', 'back', [0.95, -0.3]), { detachHand: true });
      // then his hand comes back in front of his own chest (not out beside his colleague's hands)
      const bArmL = drop < 0.95 ? bArm : mixArm(bArm, { hand: [35, -870], dir: [-0.3, 0.9], pose: 'relaxed', facing: 'back', detachHand: true }, ss(39.85, 40.2, t));
      const B2 = Q.docB(Object.assign({}, bO, { tilt: -4 * admit, face: { expr: 'stern', look: admit > 0.5 ? [0.85, 0.1] : [0.3, 0.75], lid: 0.32, mouth: 'tight', brows: [8, -3] }, armL: bArmL, armR: { hand: [-150, -880], dir: [0.3, 0.9], pose: 'relaxed', facing: 'back', detachHand: true } }));
      // the young doctor opens the newspaper, then lowers it and looks down in shame
      const cO = Object.assign(idle(t, 37, 0.25), CO);
      const open = EZ.io(ss(38.6, 39.15, t)), lower = EZ.io(ss(40.3, 40.8, t));
      const pc = [CO.x, 1300 + 70 * lower], pw = 300, ph2 = 240;
      const cR = gripAt(cO, 'docC', [pc[0] - pw / 2 + 8, pc[1] - 20], fingersFor('R', 'back', up), { detachHand: true });
      const cL = gripAt(cO, 'docC', [pc[0] + pw / 2 - 8, pc[1] - 20], fingersFor('L', 'back', up), { detachHand: true });
      const C2 = Q.docC(Object.assign({}, cO, { tilt: 5 * lower, face: { expr: 'anxious', look: lower > 0.5 ? [0, 0.85] : [-0.7, 0.05], lid: lerp(0.2, 0.55, lower), mouth: 'tight', brows: [8, -1] }, armR: cR, armL: cL }));
      const report = `<g transform="translate(${f(rp[0])},${f(rp[1])}) rotate(${f(lerp(-8, -2, drop))})"><rect x="-6" y="-70" width="120" height="150" fill="#ece6d4" stroke="#4a4030" stroke-width="1.5"/><rect x="0" y="-64" width="120" height="150" fill="#f2ecdc" stroke="#4a4030" stroke-width="1.5"/>${[0, 1, 2, 3, 4, 5].map(i => `<rect x="12" y="${-50 + i * 16}" width="${90 - (i % 3) * 14}" height="4" fill="#8a8270"/>`).join('')}</g>`;
      const bottle = PR.heroinBottle(BOT[0], BOT[1], BWd, t, { rot: 180, level: 0, cork: false, light: 1 });
      let chars = Q.withArt(B2, bO, Q.docArt.b, litBody(B2, L)) + Q.withArt(A, aO, Q.docArt.a, litBody(A, L)) + Q.withArt(C2, cO, Q.docArt.c, litBody(C2, L));
      chars += S.docTable17(t, {}) + armsOver(A, L) + armsOver(B2, L) + armsOver(C2, L) + report + handsLit(A, L) + handsLit(B2, L) + bottle + paper(pc[0], pc[1], pw, ph2, open) + handsLit(C2, L);
      return X.compose(X.stage(set, chars), c) + C.vignette(0.55) + dith(t);
    };
    X.shot('DOCS', 38.3, 41.7, fn, { grade: 'gNight' });
    G.DOCS_BOTTLE = tt => scr([BOT[0], BOT[1] - BASEUP * BWd], cam(tt));
  }
  // the newspaper page sweeps across the lens between the queue and the doctors' table
  const pageWipe = (x, u) => {
    const rot = lerp(-8, 6, u);
    let g = `<g transform="rotate(${f(rot)} ${f(x)} 960)"><rect x="${f(x - 640)}" y="-260" width="1280" height="2440" fill="#e2dccb"/><rect x="${f(x - 640)}" y="-260" width="1280" height="2440" fill="#000" opacity="0.08" filter="url(#tex)"/>`;
    for (let col = 0; col < 4; col++) for (let i = 0; i < 70; i++) g += `<rect x="${f(x - 600 + col * 310)}" y="${f(-200 + i * 34)}" width="${f(250 - (i % 5) * 18)}" height="9" fill="#8a8270" opacity="0.55"/>`;
    g += `<rect x="${f(x - 600)}" y="${f(240)}" width="560" height="380" fill="#b8b0a0"/><path d="M${f(x - 640)},-260 L${f(x - 640)},2180" stroke="#4a4030" stroke-width="6"/><path d="M${f(x + 640)},-260 L${f(x + 640)},2180" stroke="#4a4030" stroke-width="6"/></g>`;
    return `<g filter="url(#b2)">${g}</g>`;
  };
  X.tr('wipe', 38.6, 0.6, 'QUEUE', 'DOCS', { dir: 1, truck: 160, obj: pageWipe });

  // ======================================================= REVEAL: the word on the bottle (41.0 - end)
  // "because that one word printed on the bottle was Heroin."
  {
    const B = S.HM, BW = 0.45, SB = [B.BOTTLE[0], B.BOTTLE[1]], GRIP = [SB[0], SB[1] - BASEUP * BW];
    // the camera swings round the bottle: the room behind slides one way while the label comes round the other;
    // the word faces us on "printed on the bottle" and the camera closes on it for "was Heroin"
    const rot = t => 180 + 180 * EZ.io(ss(41.55, 43.3, t));
    const orbit = t => -260 * EZ.io(ss(41.0, 43.3, t));
    // one push-in from "the bottle" on, fastest on "was Heroin" (43.68 - 43.93), the label large by the word
    const cam = CAM([[41.0, [SB[0] - 8, 912, 2]], [43.15, [SB[0] + 1, 938, 0], 'io'], [44.35, [SB[0] + 1, 950, 0], 'in2']],
      [[41.0, 2.7], [43.15, 4.3, 'io'], [44.35, 9.0, 'sine']]);
    const fn = t => {
      const c = hh(cam(t), t, 0.18, 81);
      const set = S.home(t, { cal: 8, lamp: 0, candle: 0, moon: 1, bedNight: 1 });
      // the walls and the sky slide (the orbit) while the shelf and the bottle hold
      const back = set.filter(l => l.p < 0.95), front = set.filter(l => l.p >= 0.95);
      const cb = [c[0] + orbit(t), c[1], c[2], c[3]];
      const bottle = PR.heroinBottle(SB[0], SB[1], BW, t, { rot: rot(t), level: 0, cork: true, light: 1 });
      // a cold window light swings across the glass as the camera moves round it
      const glint = C.radial(SB[0] + 40 - 120 * ss(41.0, 43.3, t), SB[1] - 120, 140, '#c8d8ff', 0.22, 'screen') + C.radial(SB[0], SB[1] - 112 * BW, 150, '#fff0d8', 0.16 * ss(42.4, 43.1, t), 'screen');
      const night = `<rect x="-1500" y="-1500" width="5000" height="5000" fill="#06080e" opacity="0.18"/>`;
      // once the word faces us, a soft pool of light picks the label out of the dark (screen space, over the night)
      const lp = scr([SB[0], SB[1] - 112 * BW], c), pool = C.radial(lp[0], lp[1], 62 * c[3], '#fff2dc', 0.32 * ss(42.4, 43.1, t), 'screen');
      return X.compose(back, cb) + X.compose(X.stage(front, bottle + glint), c) + night + pool + C.vignette(0.62, '#000', 0.36) + dith(t);
    };
    X.shot('REVEAL', 41.0, X.T_END + 0.1, fn, { grade: 'gNight' });
    G.REVEAL_LABEL = tt => scr([SB[0], SB[1] - 112 * BW], cam(tt));
  }
  X.tr('rack', 41.35, 0.7, 'DOCS', 'REVEAL', { fa: G.DOCS_BOTTLE(41.35), fb: G.REVEAL_LABEL(41.35), za: 1.08, zb: 0.96, blur: 12 });
  // the loop: push into the word, settle out of the bottle her hand is reaching for at frame 0
  X.tr('push', X.T_END, 0.55, 'REVEAL', 'KIT1', { end: true, bOff: -X.T_END, fa: G.REVEAL_LABEL(X.T_END - 0.275), fb: G.KIT1_BOTTLE(-0.275), za: 2.0, zb: 1.7, fade: [0.42, 0.66], blur: 3, easeA: 'in2', easeB: 'out' });
})(window);
