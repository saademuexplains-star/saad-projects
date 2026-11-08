// "The Confessor" part 2: the King leaves, the kitchen boy confesses and slides the vial through the grate ->
// you forgive him -> you pour the poison into the communion wine -> the King chokes and falls at your feet ->
// the village wakes, saved (loops into the booth).
(function (G) {
  const X = G.ENG, Q = G.QCAST, S = G.SETS, PR = G.PROPS, C = G.CINE, R = G.RIG;
  const { track: TK, ss, lerp, EZ } = X;
  const { f, mix } = R;
  const D2R = Math.PI / 180;
  const { wave, env, bump, idle, hh, scr, nrm, L2, gripAt, fingersFor, armsOver, handsLit, CAM, tipArm, LT } = G.SHOTS_I;
  const ST = G.CONFESSOR, POS = ST.POS, SC = ST.SC, CH = S.CH, lit = X.lit;
  const VS = 0.62, VLEN = 70 * VS;
  const youEye = [POS.you[0] - 14, POS.you[1] - 1300 * SC.you];

  // ======================================================= BOY (23.71 - 37.77)
  // "Ten minutes after the King leaves, his young kitchen boy kneels on the other side of the screen trembling and
  //  confesses that he bought rat poison to kill the King, but lost his nerve and slides the glass vial through the
  //  grate for you to destroy. You tell the boy his sins are forgiven,"
  {
    const VY = (CH.GRILLE[3] + CH.SLOT_Y) / 2 - 2;   // the vial's height as it slides through the slot
    // the vial: world position of its grip point and its angle, through the whole scene; who holds it
    const vialPath = TK([[28.9, [322, 1150]], [29.6, [372, 1062], 'io'], [31.4, [384, 1050], 'sine'], [32.5, [366, 1100], 'io'], [33.25, [452, VY], 'io'], [33.85, [535, VY], 'sine'], [34.3, [632, VY], 'out2'], [34.85, [705, 1095], 'io'], [35.2, [776, 1112], 'io'], [37.8, [790, 1118], 'sine']]);
    const vialAng = TK([[28.9, -60], [29.6, -28], [32.5, -18], [33.25, 0], [34.3, 0], [34.85, -12], [35.2, -70], [37.8, -72]]);
    const vialAt = t => { const p = vialPath(t); return [p[0] + (t < 33.2 ? 1.6 * Math.sin(t * 29) * ss(29, 29.4, t) : 0), p[1]]; };
    ST.vialAt = vialAt;
    const vial = (t, glint) => ST.vialSvg(vialAt(t), vialAng(t), { level: 0.85, glint });
    const boyArms = (t, bo) => {
      const p = vialAt(t), a = vialAng(t) * D2R, ax = [Math.cos(a), Math.sin(a)];
      // praying hands follow the boy's body as he comes in (never pinned to fixed points while he moves)
      const prayR = [bo.x - 16, CH.KNEEL_TOP - 32], prayL = [bo.x + 18, CH.KNEEL_TOP - 32];
      const show = ss(28.6, 29.0, t), give = t > 33.85 ? 1 - ss(33.85, 34.4, t) : 1, back = ss(35.6, 36.0, t);
      // right hand: praying with the left, then resting on the rail while the left hand holds the vial
      const armR = { hand: R.toLocal(bo, L2(prayR, [bo.x - 4, CH.KNEEL_TOP - 8], show * (1 - back))), dir: nrm(L2([0.22, -1], [0.6, 0.75], show * (1 - back))), pose: show > 0.5 && back < 0.5 ? 'relaxed' : 'open', facing: show > 0.5 && back < 0.5 ? 'back' : 'palm', detachHand: true };
      let armL, vialUnder = '';
      if (t < 28.6 || t > 35.6) armL = { hand: R.toLocal(bo, prayL), dir: [-0.22, -1], pose: 'open', facing: 'palm', detachHand: true };
      else if (t < 33.25) { armL = gripAt(bo, 'boy', p, fingersFor('L', 'back', [-ax[0], -ax[1]]), { detachHand: true }); vialUnder = vial(t, env(t, 29.4, 29.7, 30.6, 31.0)); }
      else if (t < 33.85) { armL = tipArm(bo, 'boy', [p[0] - 34 * VS, p[1] + 4], [1, 0.06], { pose: 'open', facing: 'back', detachHand: true }); vialUnder = vial(t, 0); }
      else { const home = L2([p[0] - 34 * VS, p[1] + 4], prayL, EZ.io(ss(33.85, 34.5, t))); armL = tipArm(bo, 'boy', home, L2([1, 0.06], [-0.22, -1], ss(33.9, 34.5, t)), { pose: 'open', facing: ss(33.9, 34.5, t) > 0.5 ? 'palm' : 'back', detachHand: true }); }
      return { R: armR, L: armL, over: true, vialUnder };
    };
    const boyFace = t => {
      const talk = env(t, 28.95, 29.05, 31.3, 31.4), nerve = env(t, 31.5, 31.6, 32.5, 32.6), relief = ss(35.8, 36.2, t);
      const look = t < 32.6 ? [0.8, 0.05] : t < 34.4 ? [0.5, 0.45] : [0.85, 0.0];
      return { tilt: 6 * Math.sin(t * 6.2) * nerve + 9 * relief, face: { expr: 'fear', look: relief > 0.5 ? [0.3, 0.6] : look, lid: lerp(0.12, 0.82, relief), tears: true, mouth: talk > 0.5 ? 'cry' : nerve > 0.5 ? 'cry' : 'tight', open: talk > 0.5 ? 0.12 + 0.12 * Math.abs(Math.sin(t * 7)) * 0 + Q.talk(t, 0.2, 6) * 0.6 : 0.1, brows: [-14, 2], blush: 0.35 } };
    };
    const youArms = (t, yo) => {
      const p = vialAt(t), restR = [768, CH.DOOR_TOP - 12], restL = [812, CH.DOOR_TOP - 8];
      const reach = ss(33.5, 33.95, t), mine = t >= 33.85, bless = env(t, 35.45, 35.95, 36.85, 37.25);
      let armR, armL, vialW = '';
      // right hand: reaches into the slot for the vial, carries it to your chest, then lifts in blessing
      if (t < 33.95) armR = tipArm(yo, 'you', L2(L2(restR, [restR[0] - 20, restR[1] - 6], 0), [p[0] + VLEN + 6, p[1] + 2], reach), L2([1, 0.25], [-1, 0.1], reach), { pose: reach > 0.5 ? 'open' : 'relaxed', facing: 'back', detachHand: true });
      else if (t < 35.15) armR = gripAt(yo, 'you', [p[0] + 16 * VS, p[1]], fingersFor('R', 'back', [Math.cos(vialAng(t) * D2R), Math.sin(vialAng(t) * D2R)]), { detachHand: true });
      else { const up = L2([760, 1120], [662, 955], EZ.io(bless)); armR = { hand: R.toLocal(yo, L2(up, restR, ss(37.2, 37.7, t))), dir: nrm(L2([0.6, 0.6], [0.12, -1], bless)), pose: bless > 0.5 ? 'point' : 'open', facing: 'palm', detachHand: true }; }
      // left hand: rests on the door until it takes the vial from the right at your chest
      const take = ss(34.85, 35.2, t);
      if (t < 34.85) armL = { hand: R.toLocal(yo, restL), dir: [-1, 0.3], pose: 'relaxed', facing: 'back', detachHand: true };
      else armL = gripAt(yo, 'you', L2(L2(restL, [p[0] + 30, p[1] + 6], take), [p[0] - 4, p[1] + 2], take), fingersFor('L', 'back', [-Math.cos(vialAng(t) * D2R), -Math.sin(vialAng(t) * D2R)]), { detachHand: true });
      if (mine) vialW = vial(t, 0);
      return { R: armR, L: armL, over: true, vial: vialW };
    };
    const youFace = t => {
      const slot = env(t, 33.2, 33.5, 34.6, 34.9), forgive = ss(35.6, 35.9, t), talkY = env(t, 35.75, 35.85, 37.25, 37.35);
      const look = slot > 0.5 ? [-0.55, 0.4] : t > 34.6 && t < 35.5 ? [-0.2, 0.5] : [-0.85, 0.04];
      return { expr: 'grim', look, lid: lerp(0.32, 0.4, forgive), mouth: talkY > 0.5 ? 'talk' : 'tight', open: Q.talk(t, 0.18, 5), brows: [lerp(-4, -7, forgive), 1], tears: forgive > 0.5 };
    };
    const kingFace = t => ({ expr: 'neutral', look: L2([0.85, 0.0], [-0.6, 0.0], ss(24.3, 24.7, t)), lid: 0.24, mouth: 'closed' });
    const cam = CAM(
      [[23.71, [320, 880, 0]], [25.0, [300, 860, 0], 'sine'], [25.7, [312, 920, 0], 'sine'], [26.6, [330, 975, 0], 'sine'], [28.6, [352, 990, 0], 'sine'], [29.4, [372, 1040, 0], 'io'], [31.4, [392, 1046, 0], 'sine'], [32.2, [420, 1010, 0], 'sine'], [33.1, [500, 988, 0], 'io'], [34.25, [585, 990, 0], 'sine'], [35.1, [690, 1000, 0], 'io'], [35.75, [565, 935, 0], 'io'], [37.77, [600, 915, 0], 'sine']],
      [[23.71, 1.45], [25.0, 1.3, 'sine'], [25.7, 1.35, 'sine'], [26.6, 1.7, 'sine'], [28.6, 2.15, 'sine'], [29.4, 2.3, 'io'], [31.4, 2.6, 'sine'], [32.2, 2.35, 'sine'], [33.1, 2.9, 'io'], [34.25, 3.1, 'sine'], [35.1, 2.4, 'io'], [35.75, 1.55, 'io'], [37.77, 1.45, 'sine']]);
    ST.boyCam = cam;
    const fn = t => {
      const c = hh(cam(t), t, 0.35, 21);
      return ST.boothScene(t, c, { kingFace, boyFace, boyArms, youArms, youFace, youTilt: t => -4 + 3 * env(t, 33.2, 33.5, 34.6, 34.9) }) + C.vignette(0.6);
    };
    X.shot('BOY', 23.71, 37.77, fn, { grade: 'gNight' });
  }

  // ======================================================= POUR: the poison goes into the communion wine (37.07 - 41.65)
  // "pour the entire vial into the sacred communion wine the King takes before sleep,"
  {
    const YO = [2030, 1680], sY = 0.64, CHA = [1990, CH.ALTAR[2]], CS = 0.62;
    const rimY = CHA[1] - PR.CHALICE_RIM * CS;
    const cam = CAM(
      [[37.07, [1990, 990, 0]], [39.6, [1992, 1012, 0], 'sine'], [40.6, [2010, 930, 0], 'io'], [41.65, [2000, 960, 0], 'sine']],
      [[37.07, 2.25], [39.6, 3.2, 'sine'], [40.6, 1.8, 'io'], [41.65, 2.1, 'sine']]);
    ST.pourCam = cam;
    ST.pourCup = tt => scr([CHA[0], rimY + 10], cam(tt));
    const fn = t => {
      const c = hh(cam(t), t, 0.3, 25), L = LT.altar;
      const pourA = TK([[37.07, 64], [37.45, 72, 'io'], [39.5, 96, 'sine'], [39.9, 40, 'io'], [41.65, 30]])(t);
      const away = EZ.io(ss(39.65, 40.3, t));
      const va = pourA * D2R, vdir = [Math.cos(va), Math.sin(va)];
      const mouth = L2([CHA[0] - 6, rimY - 42], [1880, 1060], away), grip = [mouth[0] - vdir[0] * 66 * VS, mouth[1] - vdir[1] * 66 * VS];
      const yo = Object.assign(idle(t, 31), { x: YO[0], y: YO[1], s: sY });
      const stem = [CHA[0], CHA[1] - 108 * CS];
      const armR = gripAt(yo, 'you', grip, fingersFor('R', 'palm', vdir), { facing: 'palm', detachHand: true });
      const armL = gripAt(yo, 'you', stem, fingersFor('L', 'back', [0, -1]), { detachHand: true });
      const Y = Q.you(Object.assign(yo, { tilt: -3, face: { expr: 'grim', look: [-0.15, 0.6], lid: 0.42, mouth: 'tight', brows: [-3, 0], sweat: 0.6 }, armR, armL }));
      const level = lerp(0.9, 0, ss(37.45, 39.55, t)), stream = env(t, 37.4, 37.55, 39.45, 39.65), dark = ss(37.6, 39.8, t);
      let ch = lit(Y, L) + S.altarFront(t) + S.altarCandles(t) + armsOver(Y, L);
      ch += PR.chalice(CHA[0], CHA[1], CS, { wine: 0.8, dark, swirl: t * 2.2 });
      if (stream > 0) { const w = 7 * stream; ch += `<path d="M${f(mouth[0])},${f(mouth[1])} Q${f(mouth[0] + 3)},${f((mouth[1] + rimY) / 2)} ${f(CHA[0] - 2)},${f(rimY + 8)}" stroke="#1e2c14" stroke-width="${f(w)}" fill="none" opacity="0.92"/><path d="M${f(mouth[0] - 1)},${f(mouth[1] + 6)} L${f(CHA[0] - 3)},${f(rimY + 4)}" stroke="#6a8a4a" stroke-width="${f(w * 0.25)}" opacity="0.6"/>`; for (let i = 0; i < 3; i++) { const u = ((t * 2.4 + i / 3) % 1); ch += PR.dropC(lerp(mouth[0], CHA[0], u), lerp(mouth[1], rimY, u), 4, '#22301a'); } }
      ch += `<g transform="translate(${f(grip[0])},${f(grip[1])}) rotate(${f(pourA)}) scale(${VS})">${PR.poisonG({ level, open: true })}</g>` + handsLit(Y, L);
      return X.compose(X.stage(S.chapel(t), ch), c) + C.vignette(0.6);
    };
    X.shot('POUR', 37.07, 41.65, fn, { grade: 'gNight' });
  }

  // ======================================================= CHOKE: the King drinks and falls at your feet (41.05 - 45.9)
  // "and watch the tyrant choke to death at your feet, trading your own soul to save a thousand innocent lives."
  {
    const YO = [2080, 1650], sY = 0.66, KO = [1100, 1780], sK = 0.64, CS = 0.62;
    const cam = CAM(
      [[41.05, [1112, 985, 0]], [41.6, [1118, 1000, 0], 'sine'], [42.3, [1110, 1010, 0], 'sine'], [42.75, [1300, 1150, 0], 'io'], [43.3, [1560, 1480, 0], 'sine'], [43.7, [1900, 1600, 0], 'sine'], [45.0, [2080, 905, 0], 'io'], [45.9, [2078, 892, 0], 'sine']],
      [[41.05, 2.1], [41.6, 1.9, 'sine'], [42.3, 2.2, 'sine'], [42.75, 1.5, 'io'], [43.3, 1.0, 'sine'], [43.7, 1.35, 'sine'], [45.0, 1.75, 'io'], [45.9, 2.0, 'sine']]);
    ST.chokeCam = cam;
    const fall = t => EZ.in2(ss(42.72, 43.24, t)) - 0.03 * bump(t, 43.24, 1, 0.25);
    // the chalice: at his lips, lowered, dropped (it falls, bounces once, lies on its side)
    const cupAt = t => {
      if (t < 42.27) { const lift = 1 - ss(41.55, 42.1, t); return { p: L2([1128, 1140], [1132, 1000], lift), tip: -38 * lift }; }
      const u = ss(42.27, 42.62, t), b = bump(t, 42.62, 1, 0.18);
      // it bounces away to the left, clear of where his body will land
      return { p: [lerp(1128, 960, u), lerp(1140, 1828, u * u) - 26 * b], tip: lerp(0, -96, ss(42.27, 42.7, t)) };
    };
    ST.chokeCup = tt => { const k = cupAt(tt); return scr([k.p[0], k.p[1] - PR.CHALICE_RIM * CS], cam(tt)); };
    const fn = t => {
      const c = hh(cam(t), t, 0.35, 27), L = LT.altar;
      // you, on the altar step: still; at the end your hand goes to the cross on your chest
      const yo = Object.assign(idle(t, 35), { x: YO[0], y: YO[1], s: sY });
      const cross = EZ.io(ss(43.95, 44.6, t));
      const Y = Q.you(Object.assign(yo, { tilt: lerp(-6, -10, ss(42.7, 43.4, t)), face: { expr: cross > 0.5 ? 'grief' : 'grim', look: L2([-0.75, 0.3], [-0.5, 0.75], ss(42.7, 43.4, t)), lid: lerp(0.36, 0.8, ss(44.2, 45.2, t)), mouth: 'tight', brows: [-8, 1], tears: t > 44.3 },
        armR: { hand: R.toLocal(yo, L2(R.toWorld(yo, [-150, -650]), R.toWorld(yo, [-18, -990]), cross)), dir: nrm(L2([0.05, 1], [0.6, 0.6], cross)), pose: cross > 0.5 ? 'fist' : 'relaxed', facing: 'back' },
        armL: { hand: [150, -650], pose: 'relaxed', facing: 'back', dir: [-0.05, 1] } }));
      // the King: drinks, chokes, falls (drawn raw: the whole body rotates about his feet)
      const ko = Object.assign(idle(t, 37), { x: KO[0], y: KO[1], s: sK });
      const choke = ss(42.27, 42.45, t), fa = fall(t), cup = cupAt(t);
      ko.sway = 88 * fa + (1 - fa) * (choke * (3 * Math.sin((t - 42.3) * 9) - 2) + ko.sway);
      const holding = t < 42.27;
      const stem = [cup.p[0], cup.p[1] - 108 * CS];
      const neckR = R.toWorld(ko, [-44, -1165]), neckL = R.toWorld(ko, [44, -1158]);
      // the hands leave the cup and travel to the throat over a fifth of a second (never a one-frame snap)
      const rel = EZ.io(ss(42.27, 42.47, t));
      const cupR = gripAt(ko, 'king', [1128, 1140 - 108 * CS], fingersFor('R', 'back', [0, -1]), { detachHand: true });
      const cupLh = R.toLocal(ko, [1148, 1154]);
      const neckRl = R.toLocal(ko, neckR), neckLl = R.toLocal(ko, neckL), dRn = nrm(R.dirLocal(ko, [0.6, -0.8])), dLn = nrm(R.dirLocal(ko, [-0.6, -0.8]));
      const armR = holding ? gripAt(ko, 'king', stem, fingersFor('R', 'back', [Math.sin(cup.tip * D2R), -Math.cos(cup.tip * D2R)]), { detachHand: true })
        : { hand: L2(cupR.hand, neckRl, rel), dir: nrm(L2(cupR.dir, dRn, rel)), pose: 'grip', facing: 'back', detachHand: true };
      const armL = holding ? { hand: R.toLocal(ko, [cup.p[0] + 20, cup.p[1] + 14]), dir: [-0.6, -0.6], pose: 'open', facing: 'palm', detachHand: true }
        : { hand: L2(cupLh, neckLl, rel), dir: nrm(L2([-0.6, -0.6], dLn, rel)), pose: rel > 0.4 ? 'grip' : 'open', facing: rel > 0.4 ? 'back' : 'palm', detachHand: true };
      const dead = ss(43.3, 43.6, t);
      const K = Q.king(Object.assign(ko, { tilt: -6 * choke * (1 - fa) + 10 * fa, face: choke > 0.5 ? { expr: 'fear', wide: dead < 0.5, look: dead > 0.5 ? [0.2, -0.2] : [0, -0.5], lid: lerp(0.05, 0.4, dead), mouth: 'snarl', open: lerp(0.32 + 0.08 * Math.sin(t * 10), 0.25, dead), brows: [lerp(-14, -4, dead), 3], sweat: 1, blush: lerp(0.6, 0.1, dead) } : { expr: 'neutral', look: [0.6, 0.1], lid: 0.24, mouth: 'closed' }, armR, armL }));
      let ch = S.altarFront(t) + S.altarCandles(t) + lit(Y, L);
      // a soft floor shadow that stretches as he falls
      ch += `<ellipse cx="${f(KO[0] + 460 * fa)}" cy="${f(KO[1] + 6)}" rx="${f(90 + 420 * fa)}" ry="${f(20 + 14 * fa)}" fill="#000" opacity="0.4" filter="url(#b8)"/>`;
      ch += P_spill(t);
      ch += `<g filter="url(#skinS)">${K.svg}</g>`;
      ch += PR.chalice(cup.p[0], cup.p[1], CS, { wine: holding ? 0.4 : 0.15, dark: 1, tip: cup.tip });
      ch += `<g filter="url(#skinS)">${K.handR}${K.handL}</g>`;
      return X.compose(X.stage(S.chapel(t), ch), c) + C.vignette(0.62);
    };
    const P_spill = t => PR.wineSpill(1010, 1836, ss(42.6, 44.2, t) * 0.9, 5, 1);
    X.shot('CHOKE', 41.05, 45.9, fn, { grade: 'gNight' });
    ST.chokeYouEye = tt => scr([YO[0] - 14, YO[1] - 1300 * sY], cam(tt));
  }

  // ======================================================= DAWN: your mother's door in the morning, the village saved (45.2 - end; loops)
  {
    const { MO, SM } = ST.MOTHER;
    const cam = CAM(
      [[45.2, [548, 1250, 0]], [46.3, [560, 1300, 0], 'io'], [47.25, [600, 1150, 0], 'sine']],
      [[45.2, 2.4], [46.3, 1.45, 'io'], [47.25, 1.0, 'sine']]);
    ST.dawnCam = cam;
    ST.motherEye = tt => ST.motherFace(tt, cam);
    const fn = t => {
      const c = hh(cam(t), t, 0.3, 29), L = LT.dawn, set = S.cottageDoor(t, { dawn: 1 });
      return X.compose(X.stage(set, ST.mother(t, L, true)), c) + C.vignette(0.45);
    };
    X.shot('DAWN', 45.2, X.T_END + 0.01, fn, { grade: 'gDay' });
  }
  // ======================================================= transitions: nine scene changes, nine different types
  const pillarWipe = (x, u) => `<g filter="url(#dof2)"><rect x="${f(x - 520)}" y="-300" width="1040" height="2600" fill="#16120f"/><rect x="${f(x - 430)}" y="-300" width="90" height="2600" fill="#4a443e" opacity="0.5"/><rect x="${f(x + 200)}" y="-300" width="40" height="2600" fill="#2a2420" opacity="0.6"/></g>`;
  X.tr('zmatch', 7.72, 0.7, 'BOOTH', 'PUNISH', { fa: scr([CH.CANDLE[0], CH.CANDLE[1] - 30], ST.boothCam(7.72)), fb: ST.punTorch(7.72), za: 2.6, zb: 2.4, leak: '#ff9a40', leakOp: 0.45, seed: 21, blur: 4 });
  X.tr('dip', 10.42, 0.6, 'PUNISH', 'CRIMES', { fa: ST.punFire(10.3), fb: scr(youEye, ST.crimesCam(10.6)), za: 0.18, zb: 0.12 });
  X.tr('sweep', 14.1, 0.7, 'CRIMES', 'KING2', { col: '#ffd8a0', dir: 1 });
  X.tr('organic', 18.75, 0.7, 'KING2', 'VALLEY', { fa: ST.youEye(18.75), fb: ST.valTorch(18.75), za: 1.12, zb: 0.92, seed: 23, freq: 0.004, soft: 4, leak: '#ff8a3a', leakOp: 0.3 });
  X.tr('lens', 21.75, 0.8, 'VALLEY', 'MOTHER', { fa: ST.valHome(21.75), fb: ST.motherFace(21.75), za: 1.6 });
  X.tr('carry', 24.06, 0.7, 'MOTHER', 'BOY', { mode: 'pan', dir: [-1, 0], dist: 0.45, blur: 12 });
  X.tr('wipe', 37.42, 0.7, 'BOY', 'POUR', { dir: 1, truck: 240, obj: pillarWipe });
  X.tr('push', 41.35, 0.6, 'POUR', 'CHOKE', { fa: ST.pourCup(41.35), fb: ST.chokeCup(41.35), za: 2.2, zb: 0.6, fade: [0.4, 0.6], blur: 6 });
  X.tr('morph', 45.55, 0.7, 'CHOKE', 'DAWN', { fa: ST.chokeYouEye(45.55), fb: ST.motherEye(45.55), za: 1.3, zb: 1.3, col: '#ffe8c0' });
  // the loop: the morning light softens into floating candle bokeh and refocuses on the booth (no shimmer that could read as a glitch)
  X.tr('bokeh', X.T_END, 0.7, 'DAWN', 'BOOTH', { end: true, bOff: -X.T_END, dir: [0, 1], dist: 0.22, blur: 14, seed: 11 });
})(window);
