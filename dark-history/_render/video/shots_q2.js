// "The Cells That Never Died" part 2: the tissue culture lab at night, the assistant lifts the tube and stares -> every
// culture before yours dies, tube after tube -> under the microscope the cells shrivel, all but one: yours glows, then
// doubles and doubles -> the globe on the desk, pink threads to every continent -> a school hall on vaccination day ->
// medicines racing down endless lines -> your grave through seventy years of seasons -> a scientist today holds your
// cells to the light -> the Earth at night, pink lights everywhere -> the flask's label, HeLa -> your photograph on the
// incubator: the camera goes into it, the colour comes back, and you are standing in your front room again (frame 0).
(function (G) {
  const X = G.ENG, Q = G.QCAST, S = G.SETS, PR = G.PROPS, C = G.CINE, R = G.RIG;
  const { track: TK, ss, clamp, lerp, EZ } = X;
  const { f, mix, rng, shade } = R;
  const TAU = Math.PI * 2, D2R = Math.PI / 180;
  const { env, idle, hh, scr, nrm, L2, add, gripAt, fingersFor, handAt, handsLit, CAM, mixArm, dith, drawP, stage2, LT: LT1 } = G.SHOTS_Q;
  // a screen-space blur with a bounded filter region (big objectBoundingBox blurs drop out in Chrome)
  let bid = 0;
  const sBlur = (svg, sd) => { const id = 'sbq' + (bid++ % 997); return `<defs><filter id="${id}" filterUnits="userSpaceOnUse" x="-120" y="-120" width="1320" height="2160"><feGaussianBlur stdDeviation="${f(sd)}" edgeMode="duplicate"/></filter></defs><g filter="url(#${id})">${svg}</g>`; };
  const LT = Object.assign({}, LT1, {
    // the bench lamp at night, the city window cold on the right
    lab: { from: [-0.45, -0.8], shadow: '#0a0806', shadowOp: 0.45, floor: '#100c08', floorOp: 0.3, contactOp: 0.4, key: '#ffe2b0', keyAdd: 0.07, rims: [{ from: [-1, -0.3], col: '#ffc888', w: 7, op: 0.55 }, { from: [1, -0.3], col: '#7a90c8', w: 6, op: 0.45 }], face: { col: '#ffdcb0', op: 0.15 } },
    // the high windows of the school hall
    gym: { from: [-0.6, -0.8], shadow: '#1a140c', shadowOp: 0.34, floor: '#22180e', floorOp: 0.26, contactOp: 0.34, key: '#fff6e4', keyAdd: 0.05, rims: [{ from: [-1, -0.4], col: '#fff4dc', w: 7, op: 0.5 }, { from: [1, -0.2], col: '#ffd8a0', w: 4, op: 0.3 }], face: { col: '#fff0e0', op: 0.12 } },
    // a modern lab: cool overhead light, the window on the left
    now: { from: [0.3, -0.9], shadow: '#10141a', shadowOp: 0.32, floor: '#14181c', floorOp: 0.24, contactOp: 0.32, key: '#f4f8ff', keyAdd: 0.05, rims: [{ from: [-1, -0.3], col: '#eef4ff', w: 7, op: 0.5 }, { from: [1, -0.3], col: '#ffe8d0', w: 4, op: 0.3 }], face: { col: '#f4f8ff', op: 0.12 } }
  });

  // ======================================================= LAB: the tissue culture lab at night (22.0 - 25.43)
  // "But in that lab, something impossible is happening."
  {
    const MO = { x: 820, y: 1900, s: 0.6 };
    const cam = CAM([[22.0, [380, 1150, 0]], [23.3, [560, 1125, 0.3], 'sine'], [25.45, [720, 1150, 0.6], 'io']], [[22.0, 0.82], [23.3, 1.0, 'sine'], [25.45, 1.62, 'io']]);
    const TUBE_G = t => [MO.x - 125 + 3 * Math.sin(t * 1.3), 1200 + 4 * Math.sin(t * 1.7)];
    const fn = t => {
      const c = hh(cam(t), t, 0.28, 51), L = LT.lab;
      const glow = 0.35 + 0.65 * EZ.io(ss(23.9, 24.9, t));
      const set = S.lab51(t, { glow, drum: t * 0.6 });
      // she lifts the tube to the lamp; at "impossible" her eyes go wide
      const g = L2([MO.x - 90, 1420], TUBE_G(t), EZ.io(ss(22.3, 23.1, t)));
      const tube = PR.testTube(-54, 0, 0.9, 90, { level: 0.5, glow: 0.4 + 0.6 * glow });
      const armR = gripAt(MO, 'labGirl', g, fingersFor('R', 'back', [0, -1]), { hold: tube });
      const wow = ss(23.95, 24.25, t);
      const oM = Object.assign(idle(t, 61, 0.25), MO, { face: { expr: wow > 0.5 ? 'fear' : 'neutral', wide: wow > 0.5, mouth: wow > 0.5 ? 'parted' : 'closed', open: 0.1 * wow, look: [-0.65, 0.05], lid: lerp(0.2, 0.06, wow), brows: [lerp(2, 16, wow), lerp(0, 6, wow)] }, armR, armL: { hand: [120, -820], dir: [-0.3, 1], pose: 'relaxed', facing: 'back' } });
      const chars = drawP(Q.labGirl(oM), oM, Q.labGirlArt, L) + C.radial(g[0], g[1] - 50, 170, '#ffb0b8', 0.28 * glow, 'screen');
      return X.compose(X.stage(set, chars), c) + C.vignette(0.55) + dith(t);
    };
    X.shot('LAB', 22.0, 25.43, fn, { grade: 'gNight' });
    G.LAB_TUBE = tt => scr(add(TUBE_G(tt), [0, -40]), cam(tt));
    G.LAB_C = tt => scr([520, 1150], cam(tt));
  }
  X.tr('carry', 22.35, 0.7, 'KIDS', 'LAB', { mode: 'zoom', k: 1.7, fa: G.KIDS_PANE(22.35), fb: G.LAB_C(22.35), blur: 5 });

  // ======================================================= RACK: every culture before yours dies (24.83 - 28.33)
  // "Every human cell scientists have ever tried to grow"
  {
    const RX = -200, RY = 1380, N = 10, P = 0.97;
    const LABELS = ['HUMAN 1924', 'HUMAN 1931', 'HUMAN 1937', 'HUMAN 1940', 'HUMAN 1943', 'HUMAN 1946', 'HUMAN 1948', 'HUMAN 1949', 'HUMAN 1950', 'HUMAN 1951'];
    const cx = X0 => 540 + (X0 - 540) / P, cy = Y0 => 960 + (Y0 - 960) / P;
    const cam = CAM([[24.8, [cx(-110), cy(1270), 0]], [28.35, [cx(650), cy(1262), 0.4], 'sine']], [[24.8, 2.15], [28.35, 2.35, 'sine']]);
    const dieT = i => 25.35 + i * 0.27;
    const fn = t => {
      const c = hh(cam(t), t, 0.25, 57);
      const set = S.lab51(t, { glow: 0.25 }).filter(L => !L.light);
      const rack = PR.tubeRack(RX, RY, 1, t, { n: N, labels: LABELS, dead: i => EZ.io(ss(dieT(i), dieT(i) + 0.45, t)) });
      return sBlur(X.compose(set, c), 7) + X.compose([{ p: P, svg: rack, chars: true }, { p: 1, light: true, svg: C.radial(500, 1150, 900, '#ffe2b0', 0.25, 'screen') }], c) + C.vignette(0.55) + dith(t);
    };
    X.shot('RACK', 24.83, 28.33, fn, { grade: 'gNight' });
    G.RACK_C = tt => scr([RX + 300, RY - 90], cam(tt), P);
    G.RACK_LAST = tt => scr([RX + 40 + 9 * 92, RY - 70], cam(tt), P);
  }
  X.tr('lens', 25.13, 0.6, 'LAB', 'RACK', { fa: G.LAB_TUBE(25.13), fb: G.RACK_C(25.13), za: 1.3 });

  // ======================================================= MICRO: they die; yours don't; they double (27.73 - 33.6)
  // "dies within days. Yours don't. They double every single day, and they never stop."
  {
    const DEAD = Array.from({ length: 14 }, (_, i) => { const r = rng(400 + i), a = r() * TAU, d = 190 + r() * 520; return [540 + Math.cos(a) * d, 960 + Math.sin(a) * d * 1.1, 56 + r() * 14]; });
    const cam = CAM([[27.7, [540, 960, 0]], [29.0, [545, 965, 0.3], 'sine'], [29.9, [540, 960, 0], 'sine'], [32.2, [540, 960, -0.3], 'sine'], [33.65, [540, 960, -0.5], 'in2']],
      [[27.7, 1.05], [29.0, 1.12, 'sine'], [29.9, 1.42, 'io'], [32.2, 1.0, 'sine'], [33.65, 0.72, 'in2']]);
    const fn = t => {
      const c = hh(cam(t), t, 0.2, 61);
      const set = S.micro(t, { tint: 0.15, r: 1500 });
      // the ordinary cells shrivel and grey; the living colony later pushes them aside
      const life = 1 - EZ.io(ss(28.15, 28.95, t)), push = EZ.io(ss(30.4, 33.3, t));
      let g = '';
      DEAD.forEach(([x, y, r], i) => { const dx = x - 540, dy = y - 960, d = Math.hypot(dx, dy), sh = push * 170 * (1 - Math.min(1, d / 760)); g += `<g opacity="${f(1 - 0.65 * push)}">${PR.cell(x + dx / d * sh, y + dy / d * sh, r, t, { seed: 40 + i, life })}</g>`; });
      // yours: the cell in the middle stays alive, glows at "yours don't", then doubles and doubles
      const on = EZ.io(ss(29.25, 29.75, t));
      const Lg = t < 30.3 ? 0 : 5 * EZ.sine(ss(30.3, 32.1, t)) + 2.6 * EZ.in2(ss(32.1, 33.6, t));
      g += PR.doublingCells(540, 960, 860, t, Lg, { r0: 66, glow: 0.12 + 0.88 * on });
      // the eyepiece ring stays put on the screen while the magnification changes
      return X.compose([...set, { p: 1, svg: g, chars: true }], c) + S.microRing(900) + C.vignette(0.4) + dith(t);
    };
    X.shot('MICRO', 27.73, 33.6, fn, { grade: 'gHall' });
  }
  X.tr('zmatch', 28.03, 0.6, 'RACK', 'MICRO', { fa: G.RACK_LAST(28.03), fb: [540, 960], za: 2.6, zb: 2.4, leak: '#ffc0c8', leakOp: 0.35 });

  // ======================================================= SHIP: the globe on the desk, pink threads to every continent (33.0 - 35.6)
  // "Soon they're shipped all over the world,"
  {
    const GX = 700, GY = 1080, GS = 1.35, BALT = [-76.6, 39.3];
    const DESTS = [[-0.1, 51.5, 33.45], [-99.1, 19.4, 33.55], [2.35, 48.85, 33.62], [-43.2, -22.9, 33.75], [18.4, -33.9, 33.95], [37.6, 55.75, 34.05], [77.2, 28.6, 34.2], [139.7, 35.7, 34.35], [151.2, -33.9, 34.5], [-58.4, -34.6, 34.1], [31.2, 30.0, 34.25]];
    const cam = CAM([[33.0, [700, 1150, 0]], [35.65, [690, 1110, 0.6], 'sine']], [[33.0, 1.16], [35.65, 1.36, 'sine']]);
    const lon = t => lerp(-98, -22, EZ.sine(ss(33.0, 35.65, t)));
    const fn = t => {
      const c = hh(cam(t), t, 0.25, 67);
      const set = S.lab51(t, { glow: 0.5 }).filter(L => !L.light);
      const globe = PR.globe(GX, GY, GS, t, { lon: lon(t), overOut: PR.globeArcs(BALT, DESTS, t, 0.55) }) + C.radial(GX - 120, GY - 140, 380, '#ffe2b0', 0.22, 'screen');
      return sBlur(X.compose(set, c), 6) + X.compose([{ p: 1, svg: globe, chars: true }], c) + C.vignette(0.55) + dith(t);
    };
    X.shot('SHIP', 33.0, 35.6, fn, { grade: 'gNight' });
    G.SHIP_C = tt => scr([GX, GY], cam(tt));
  }
  X.tr('carry', 33.3, 0.6, 'MICRO', 'SHIP', { mode: 'zoom', k: 0.55, fa: [540, 960], fb: G.SHIP_C(33.3), blur: 5 });

  // ======================================================= POLIO: a school hall on vaccination day (34.94 - 37.34)
  // "helping create the polio vaccine,"
  {
    const NO = { x: 1060, y: 1900, s: 0.6 }, GO = { x: 850, y: 1960, s: 0.78 };
    const LINE = [[610, 1975, 0.74, 1], [400, 1990, 0.76, 2], [190, 2005, 0.72, 3]];
    const SITE = R.toWorld(GO, [100, -515]), AX = nrm([-1, 0.12]), SYR = 0.8;
    const cam = CAM([[34.9, [260, 1450, 0]], [36.0, [640, 1380, 0.3], 'sine'], [37.4, [830, 1330, 0.6], 'io']], [[34.9, 0.85], [36.0, 1.0, 'sine'], [37.4, 1.45, 'io']]);
    const fn = t => {
      const c = hh(cam(t), t, 0.28, 71), L = LT.gym;
      const set = S.gym51(t);
      // the needle comes in, goes in, comes out
      const inK = EZ.io(ss(35.7, 36.05, t)) - EZ.io(ss(36.55, 36.85, t)), back = 70 * (1 - inK) - 6 * inK;
      const G0 = add(SITE, AX, -(150 * SYR + back));
      const armR = gripAt(NO, 'schoolNurse', G0, fingersFor('R', 'palm', AX), { hold: PR.syringe(SYR), facing: 'palm' });
      const oN = Object.assign(idle(t, 73, 0.25), NO, { face: { expr: 'neutral', mouth: 'smile', look: [-0.9, 0.3], lid: 0.24 }, armR, armL: { hand: [130, -820], dir: [-0.3, 1], pose: 'relaxed', facing: 'back' } });
      // the girl: watches it come, squeezes her eyes shut, then a brave smile
      const ow = env(t, 35.98, 36.08, 36.55, 36.75), brave = ss(36.7, 36.9, t);
      const oG = Object.assign(idle(t, 79, 0.3), GO, { face: { expr: ow > 0.5 ? 'fear' : 'anxious', mouth: brave > 0.5 ? 'smile' : 'tight', look: ow > 0.5 ? [0, 0] : brave > 0.5 ? [0.1, 0] : [0.85, -0.1], lid: ow > 0.5 ? 0.95 : 0.16, brows: [12 * (1 - brave) + 6 * ow, 2] } });
      let chars = '';
      LINE.slice().reverse().forEach(([x, y, s, k]) => { const o = Object.assign(idle(t, 80 + k * 7, 0.3), { x, y, s, face: { expr: 'anxious', mouth: 'tight', look: [0.85, -0.05], lid: 0.16, brows: [10, 2] } }); chars += drawP(Q.polioKids[k](o), o, Q.polioKidArt[k], L); });
      chars += drawP(Q.polioKids[0](oG), oG, Q.polioKidArt[0], L) + drawP(Q.schoolNurse(oN), oN, Q.schoolNurseArt, L);
      return X.compose(X.stage(set, chars), c) + C.vignette(0.5) + dith(t);
    };
    X.shot('POLIO', 34.94, 37.34, fn, { grade: 'gDay' });
  }
  X.tr('sweep', 35.27, 0.66, 'SHIP', 'POLIO', { col: '#fff0c8', dir: 1 });

  // ======================================================= VIALS: medicines racing down endless lines (36.74 - 39.88)
  // "cancer treatments and medicines for millions."
  {
    const cam = CAM([[36.7, [520, 1420, 0]], [37.9, [545, 1260, 0.4], 'sine'], [39.9, [575, 1120, 0.8], 'io']], [[36.7, 1.32], [37.9, 0.98, 'sine'], [39.9, 0.68, 'io']]);
    const fn = t => {
      const c = hh(cam(t), t, 0.25, 77);
      return X.compose(S.vials(t, { speed: 640 }), c) + C.vignette(0.48) + dith(t);
    };
    X.shot('VIALS', 36.74, 39.88, fn, { grade: 'gDay' });
  }
  X.tr('carry', 37.04, 0.6, 'POLIO', 'VIALS', { mode: 'pan', dir: [1, 0], dist: 0.45, blur: 12 });

  // ======================================================= GRAVE: seventy years of seasons over your grave (39.24 - 42.74)
  // "And today, more than seventy years after your funeral,"
  {
    const B = S.CM;
    const cam = CAM([[39.2, [600, 1160, 0]], [42.8, [560, 1440, -0.3], 'sine']], [[39.2, 0.62], [42.8, 0.98, 'sine']]);
    const fn = t => {
      const c = hh(cam(t), t, 0.22, 83);
      const set = S.cemetery(t, { year: EZ.io(ss(40.6, 41.6, t)), season: 0.55 + 0.7 * (t - 39.24), day: 1 });
      return X.compose(set, c) + C.vignette(0.48) + dith(t);
    };
    X.shot('GRAVE', 39.24, 42.74, fn, { grade: 'gDay' });
  }
  X.tr('organic', 39.56, 0.64, 'VIALS', 'GRAVE', { seed: 7, freq: 0.0042, za: 1.08, zb: 0.94 });

  // ======================================================= ALIVE: a scientist today holds your cells to the light (42.04 - 44.43)
  // "your cells are still alive,"
  {
    const SO = { x: 900, y: 1900, s: 0.62 }, FS = 0.5;
    const cam = CAM([[42.0, [1000, 1250, 0]], [43.2, [925, 1125, 0.3], 'sine'], [44.45, [870, 1085, 0.5], 'io']], [[42.0, 0.95], [43.2, 1.4, 'sine'], [44.45, 1.85, 'io']]);
    const GRIP = t => L2([SO.x - 70, 1470], [SO.x - 132 + 3 * Math.sin(t * 1.2), 1170 + 3 * Math.sin(t * 1.5)], EZ.io(ss(42.15, 42.95, t)));
    const fn = t => {
      const c = hh(cam(t), t, 0.25, 89), L = LT.now;
      const set = S.labNow(t, { open: 0.85 });
      const g = GRIP(t);
      const armR = gripAt(SO, 'scientist', g, fingersFor('R', 'back', [0, -1]), { hold: PR.flask(-100 * FS, 110 * FS, FS, 90, { level: 0.32 }) });
      const oS = Object.assign(idle(t, 91, 0.25), SO, { face: { expr: 'neutral', mouth: t > 43.4 ? 'smile' : 'closed', look: [-0.7, -0.05], lid: 0.2, brows: [4, 0] }, armR, armL: { hand: [130, -820], dir: [-0.3, 1], pose: 'relaxed', facing: 'back' } });
      const chars = drawP(Q.scientist(oS), oS, Q.scientistArt, L) + C.radial(g[0] + 40, g[1] - 10, 200, '#ffd0d8', 0.2, 'screen');
      return X.compose(X.stage(set, chars), c) + C.vignette(0.5) + dith(t);
    };
    X.shot('ALIVE', 42.04, 44.43, fn, { grade: 'gDay' });
    G.ALIVE_FLASK = tt => scr(add(GRIP(tt), [40, -10]), cam(tt));
  }
  X.tr('carry', 42.39, 0.7, 'GRAVE', 'ALIVE', { mode: 'tilt', dir: [0, -1], dist: 0.42, blur: 12 });

  // ======================================================= WORLD: the Earth at night, pink lights everywhere (43.83 - 46.68)
  // "still growing in labs around the world,"
  const EX = 540, EY = 1000, ER = 430;
  const eLon = t => lerp(-100, -18, EZ.sine(ss(43.8, 46.7, t))), eLat = 22;
  const earthPt = (ll, t) => { const l = (ll[0] - eLon(t)) * D2R, p = ll[1] * D2R, l0 = eLat * D2R; return [EX + ER * Math.cos(p) * Math.sin(l), EY - ER * (Math.cos(l0) * Math.sin(p) - Math.sin(l0) * Math.cos(p) * Math.cos(l))]; };
  {
    const cam = CAM([[43.8, [540, 1000, 0]], [46.7, [540, 990, 0.8], 'sine']], [[43.8, 1.36], [46.7, 0.98, 'sine']]);
    const fn = t => {
      const c = hh(cam(t), t, 0.2, 97);
      const earth = PR.earthNight(EX, EY, ER, t, { lon: eLon(t), lat: eLat, dots: EZ.io(ss(44.25, 46.0, t)) });
      return X.compose([...S.space(t), { p: 1, svg: earth, chars: true }], c) + C.vignette(0.45) + dith(t);
    };
    X.shot('WORLD', 43.83, 46.68, fn, { grade: 'gHall' });
    G.WORLD_C = tt => scr([EX, EY], cam(tt));
    G.WORLD_BALT = tt => scr(earthPt([-76.6, 39.3], tt), cam(tt));
  }
  X.tr('morph', 44.13, 0.6, 'ALIVE', 'WORLD', { fa: G.ALIVE_FLASK(44.13), fb: G.WORLD_C(44.13), za: 1.4, zb: 1.35, col: '#ffd8e0' });

  // ======================================================= HELA: the label, then her photograph, then frame 0 (46.08 - end)
  // "under the name HeLa, for Henrietta Lacks."
  {
    const B = S.LN, [PX, PY, PK] = B.PHOTO, PP = 0.98, BP = 0.97;
    const FL = [930, 1340], LAB = [FL[0] - 30, FL[1] - 147];
    // the camera that puts the photograph's picture exactly on the screen
    const zEnd = Math.pow(1080 / (1080 * PK), 1 / PP), cxEnd = 540 + (PX + 540 * PK - 540) / PP, cyEnd = 960 + (PY + 960 * PK - 960) / PP;
    const cL = [540 + (LAB[0] - 540) / BP, 960 + (LAB[1] - 960) / BP];
    const cam = CAM([[46.0, [cL[0] - 6, cL[1] + 10, 0]], [47.36, [cL[0], cL[1], 0], 'sine'], [48.5, [cxEnd, cyEnd, 0], 'sine'], [50, [cxEnd, cyEnd, 0], 'lin']],
      [[46.0, 2.38], [47.36, 2.6, 'sine'], [48.5, zEnd, 'sine'], [50, zEnd, 'lin']]);
    const fn = t => {
      const c0 = cam(t);
      // the photograph holds the first shot: still until the last 0.62 s, then alive (and in colour through the cut)
      const a = scr([PX, PY], c0, PP), b = scr([PX + 1080 * PK, PY + 1920 * PK], c0, PP);
      let photo = '';
      if (b[0] > -60 && a[0] < 1140 && b[1] > -60 && a[1] < 1980) photo = PR.photo(PX, PY, PK, X.renderShot('HOME', Math.max(-0.62, t - X.T_END)), { sepia: 1 });
      const c = hh(c0, t, 0.25 * (1 - ss(47.6, 48.4, t)), 101);
      const set = S.labNow(t, { photo, bench: PR.flask(FL[0], FL[1], 1.0, 0, { label: 'HeLa', level: 0.32 }) });
      return X.compose(set, c) + C.vignette(0.5) + dith(t);
    };
    X.shot('HELA', 46.08, X.T_END + 0.1, fn, { grade: 'gDay' });
    G.HELA_LABEL = tt => scr(LAB, cam(tt), BP);
  }
  X.tr('push', 46.38, 0.6, 'WORLD', 'HELA', { fa: G.WORLD_BALT(46.38), fb: G.HELA_LABEL(46.38), za: 2.6, zb: 0.6, blur: 7 });
  // the loop: the colour seeps back into the photograph, which is frame 0
  X.tr('organic', X.T_END, 0.62, 'HELA', 'HOME', { end: true, bOff: -X.T_END, za: 1, zb: 1, seed: 9, freq: 0.004, soft: 4 });
})(window);
