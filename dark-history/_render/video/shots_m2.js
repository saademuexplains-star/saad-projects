// "The King's Decoy" part 2: the brother on the ridge -> your hand by the brake -> the last decoy on the gibbet ->
// your village burning -> the pass: you lean out, point at the wheel, send the king ahead; he gallops onto the bridge,
// the fuse runs, the barrels go up, he falls burning into the canyon -> the fire becomes the crown (loop).
(function (G) {
  const X = G.ENG, Q = G.QCAST, S = G.SETS, PR = G.PROPS, C = G.CINE, R = G.RIG, M = G.SHOTS_M, ST = G.DECOY;
  const { track: TK, ss, clamp, lerp, EZ } = X;
  const { f, mix, rng, shade } = R;
  const { wave, env, bump, idle, hh, scr, toP1, nrm, L2, add, dirA, gripAt, handAt, armsOver, handsLit, CAM, LT, litN, seated } = M;
  const lit = X.lit;
  const TAU = Math.PI * 2;

  // ---------------- the fireball: a rolling core of flame inside billowing smoke, rising as it ages
  // (x,y) centre, R full radius, age seconds since ignition, k overall strength
  const fireball = (x, y, R0, age, t, seed, k = 1) => {
    if (age < 0 || k <= 0.01) return '';
    const r = rng(seed), grow = 1 - Math.exp(-age * 5.5), Rr = R0 * (0.25 + 0.75 * grow) * (1 + 0.08 * age), rise = 120 * age, cy = y - rise;
    const heat = Math.exp(-age * 0.9), id = 'fb' + seed;
    let g = `<defs><radialGradient id="${id}h"><stop offset="0" stop-color="#fffbe8"/><stop offset="0.25" stop-color="#ffe9a0"/><stop offset="0.5" stop-color="#ffb040"/><stop offset="0.75" stop-color="#e05a14"/><stop offset="1" stop-color="#8a1e08" stop-opacity="0"/></radialGradient>` +
      `<radialGradient id="${id}s"><stop offset="0" stop-color="#3a2a24"/><stop offset="0.7" stop-color="#2a201c" stop-opacity="0.85"/><stop offset="1" stop-color="#2a201c" stop-opacity="0"/></radialGradient></defs>`;
    // smoke billows around and above (darker as the fire cools)
    for (let i = 0; i < 16; i++) { const a = r() * TAU, d = Rr * (0.55 + r() * 0.6), sr = Rr * (0.35 + r() * 0.3) * (1 + 0.3 * age), bx = x + Math.cos(a) * d * 1.1, by = cy + Math.sin(a) * d * 0.8 - age * 60 * r(); g += `<circle cx="${f(bx)}" cy="${f(by)}" r="${f(sr)}" fill="url(#${id}s)" opacity="${f(clamp(0.2 + age * 0.4) * k)}"/>`; }
    // the flame body: overlapping hot lobes that churn
    for (let i = 0; i < 12; i++) { const a = r() * TAU + t * (0.6 + r()), d = Rr * 0.45 * r(), lr = Rr * (0.4 + r() * 0.35); g += `<circle cx="${f(x + Math.cos(a) * d)}" cy="${f(cy + Math.sin(a) * d * 0.8)}" r="${f(lr)}" fill="url(#${id}h)" opacity="${f(clamp(heat * 1.2) * k)}"/>`; }
    g += `<circle cx="${f(x)}" cy="${f(cy)}" r="${f(Rr * 0.5)}" fill="url(#${id}h)" opacity="${f(clamp(heat * 1.4) * k)}"/>`;
    return `<g filter="url(#b2)">${g}</g>` + C.radial(x, cy, Rr * 2.6, '#ffb060', 0.55 * heat * k, 'screen');
  };
  ST.fireball = fireball;

  // ======================================================= RIDGE: the king's brother (24.85 - 31.6)
  // "...holding a flaming torch, staring dead at you from the ridge. He wired the bridge to blow,"
  {
    const RG = S.RG11, BO = { x: RG.BRO[0], y: RG.BRO[1], s: RG.BS };
    const face = t => t < 27.7 ? { expr: 'stern', look: [0.55, 0.5], lid: 0.32, brows: [8, -3], mouth: 'tight' }
      : t < 29.6 ? { expr: 'stern', look: [0.25, 0.28], lid: 0.38, brows: [11, -5], mouth: 'tight', blink: 0 }
      : { expr: 'stern', look: [0.6, 0.6], lid: 0.34, brows: [9, -4], mouth: 'smirk' };
    // his cloak streams in the wind (drawn behind him in his local frame)
    const cloak = (t, bo) => {
      const w = k => 40 * Math.sin(t * 3.2 + k) + 20 * Math.sin(t * 5.1 + k * 2);
      const d = `M-150,-1160 C-200,-900 -190,-500 -170,-120 C-40,${f(-90 + w(1) * 0.3)} 200,${f(-140 + w(2))} ${f(420 + w(3))},${f(-260 + w(4))} C${f(330 + w(5))},-600 ${f(260 + w(6) * 0.5)},-900 150,-1160Z`;
      return `<g transform="translate(${f(bo.x)},${f(bo.y)}) scale(${f(bo.s)}) rotate(${f(bo.sway || 0)})"><path d="${d}" fill="#141012" stroke="#050404" stroke-width="3" filter="url(#clothS)"/><path d="M-120,-1100 C-140,-700 -130,-400 -110,-160" stroke="#3a3436" stroke-width="10" fill="none" opacity="0.5"/></g>`;
    };
    const merc = (t, x, y, s, seed, lookX) => { const mo = Object.assign(idle(t, seed, 0.3), { x, y, s }); return lit(Q.merc(Object.assign({}, mo, { face: { expr: 'grim', look: [lookX, 0.3], lid: 0.4 }, armR: { hand: [-120, -900], dir: [0.4, 1], pose: 'fist', facing: 'back' }, armL: { hand: [120, -900], dir: [-0.4, 1], pose: 'fist', facing: 'back' } })), LT.ridge); };
    const fn = (t, c) => {
      const bo = Object.assign(idle(t, 41, 0.25), BO);
      const tw = R.toWorld(bo, [-250, -1230]);
      const B = Q.brother(Object.assign({}, bo, { face: face(t), armR: gripAt(bo, 'brother', tw, [1, 0], { detachHand: true, thumb: 'up' }), armL: { hand: [130, -820], dir: [-0.15, 1], pose: 'fist', facing: 'back' } }));
      const L = LT.ridge;
      // two mercenaries crouched behind a boulder at his left, watching the road
      const mercs = `<defs><clipPath id="rgmc"><rect x="-3000" y="-3000" width="6000" height="${3000 + 1400}"/></clipPath></defs><g clip-path="url(#rgmc)">${merc(t, -330, 2050, 0.62, 61, 0.6)}${merc(t, -90, 2010, 0.58, 67, 0.7)}</g>` + S.rockMass(-220, 1440, 620, 220, 991, { col: '#7a6a56' });
      const torch = G.DECOY.torchW(tw, BO.s, t, 9, 4 * Math.sin(t * 2.2));
      const chars = mercs + cloak(t, bo) + lit(B, L) + torch + handsLit(B, L, 'R');
      ST.ridgeTw = tw;
      return X.compose(X.stage(S.ridge(t), chars), c) + C.vignette(0.55);
    };
    const face0 = R.toWorld(BO, [0, -1300]);
    const cam = CAM(
      [[24.85, [440, 770, 0]], [26.1, [430, 820, 0], 'sine'], [27.7, [360, 700, 0.6], 'io'], [29.5, [face0[0], face0[1] + 10, 0], 'sine'], [30.8, [820, 1350, 0], 'io'], [31.6, [1962, 2849, 0], 'sine']],
      [[24.85, 1.2], [26.1, 1.35, 'sine'], [27.7, 1.75, 'io'], [29.5, 3.1, 'sine'], [30.8, 1.2, 'io'], [31.6, 1.0, 'sine']]);
    ST.ridgeCam = cam; ST.ridgeFace = face0;
    X.shot('RIDGE', 24.85, 31.6, t => fn(t, hh(cam(t), t, t > 28 && t < 29.6 ? 0.15 : 0.3, 12)), { grade: 'gDusk' });
  }

  // ======================================================= BRAKE: your hand by the brake (30.8 - 39.05)
  // "and he's waiting to see if you pull the emergency brake. Your mouth goes completely dry, and you don't dare yell
  // for the driver to stop, because you know what happens to decoys who ruin an ambush."
  {
    const I = S.IN11, YO = ST.insideYou, FLOOR = 1800, HND = [872, 1176], PIV = [902, 1440];
    const lever = () => { const d = nrm([HND[0] - PIV[0], HND[1] - PIV[1]]), n = [-d[1], d[0]]; return `<path d="M${f(PIV[0] + n[0] * 10)},${PIV[1]} L${f(HND[0] + n[0] * 8)},${HND[1]} L${f(HND[0] - n[0] * 8)},${HND[1]} L${f(PIV[0] - n[0] * 10)},${PIV[1]}Z" fill="#b8902e" stroke="#4a3410" stroke-width="2.4"/><path d="M${f(HND[0] - d[0] * 10)},${f(HND[1] - d[1] * 10)} L${f(HND[0] + d[0] * 70)},${f(HND[1] + d[1] * 70)}" stroke="#8a1a1a" stroke-width="26" stroke-linecap="round"/><path d="M${f(HND[0] - d[0] * 4 - 6)},${f(HND[1] + 6)} L${f(HND[0] + d[0] * 60 - 6)},${f(HND[1] + d[1] * 60 + 4)}" stroke="#d8606a" stroke-width="5" opacity="0.6" stroke-linecap="round"/><circle cx="${PIV[0]}" cy="${PIV[1]}" r="16" fill="#8a6a1e" stroke="#4a3410" stroke-width="2"/>`; };
    ST.brakeHandle = HND;
    const fn = (t, c) => {
      // the left hand rises from your lap to hover by the grip, trembling; it nearly closes on "pull", then hangs back
      const up = EZ.io(ss(30.9, 31.9, t)), near = bump(t, 31.95, 1, 1.2), down = EZ.io(ss(37.9, 38.8, t));
      const trem = [3 * Math.sin(t * 31) + 2 * Math.sin(t * 47), 2 * Math.sin(t * 37)];
      const yoB = Object.assign(idle(t, 3, 0.3), YO);
      const swallow = bump(t, 33.55, 1, 0.5) + bump(t, 37.3, 1, 0.5);
      yoB.tilt = 3 * swallow - 2 * env(t, 35.6, 36.1, 37.2, 37.6) + 1.2 * Math.sin(t * 4.1);
      const hover = add(add(HND, [-38 + 16 * near, 40 - 10 * near]), trem, 1 - down);
      const lap = R.toWorld(yoB, [118, -650]);
      const wL = L2(L2(lap, hover, up), lap, down);
      const armL = handAt(yoB, wL, L2([0.55, 0.6], [-0.1, 1], 1 - up + down * 0), { pose: up > 0.5 && down < 0.5 ? (near > 0.6 ? 'relaxed' : 'open') : 'relaxed' });
      const face = t < 33.3 ? { expr: 'fear', look: [0.7, 0.55], lid: 0.14, brows: [-13, 4], sweat: 0.55, mouth: 'tight' }
        : t < 35.5 ? { expr: 'fear', look: [0.15, 0.2], lid: lerp(0.16, 0.7, swallow), brows: [-12, 4], sweat: 0.6, mouth: 'tight' }
        : t < 37.7 ? { expr: 'fear', look: [-0.12, -0.85], lid: 0.12, brows: [-14, 6], sweat: 0.6, mouth: t > 36.2 && t < 37.15 ? 'parted' : 'tight', open: 0.1 + 0.04 * Math.sin(t * 9) }
        : { expr: 'grief', look: [0.2, 0.45], lid: 0.42, brows: [-12, 4], sweat: 0.55, mouth: 'tight' };
      const Y = Q.you(Object.assign({}, yoB, { face, armR: { hand: [-118, -650], dir: [0.1, 1], pose: 'fist', facing: 'back' }, armL }));
      const L = LT.inside, st = seated(yoB, FLOOR, '#6a1020', 'bklap');
      // a bead of sweat running down from the temple
      const sw = (((t - 33.4) % 2.6) + 2.6) % 2.6 / 2.6, sp = R.toWorld(yoB, R.headPt(yoB, 'man', [74, -40 + 160 * sw]));
      const bead = t > 33.4 ? `<ellipse cx="${f(sp[0])}" cy="${f(sp[1])}" rx="4" ry="6" fill="#e8f4ff" opacity="${f(0.75 * (1 - sw))}"/>` : '';
      const chars = lever() + st.clip + `<g clip-path="url(#bklap)">${lit(Y, L)}</g>` + st.lap + armsOver(Y, L) + handsLit(Y, L) + bead;
      const set = S.inside(t, { view: { cliff: 1 }, hole: 1, fresh: true });
      return X.compose(X.stage(set, chars), c) + C.vignette(0.6);
    };
    const faceW = R.toWorld(YO, [0, -1300]);
    const cam = CAM(
      [[30.8, [870, 1225, 0]], [31.6, [866, 1215, 0], 'sine'], [33.1, [842, 1195, 0.4], 'sine'], [33.95, [faceW[0] + 40, faceW[1] + 20, 0], 'io'], [35.4, [faceW[0] + 15, faceW[1] + 5, 0], 'sine'], [36.6, [545, 640, 0], 'io'], [37.6, [560, 790, 0], 'io'], [39.05, [faceW[0] + 10, faceW[1] + 15, 0], 'sine']],
      [[30.8, 2.3], [31.6, 2.42, 'sine'], [33.1, 2.6, 'sine'], [33.95, 2.5, 'io'], [35.4, 2.95, 'sine'], [36.6, 2.0, 'io'], [37.6, 2.2, 'io'], [39.05, 2.65, 'sine']]);
    ST.brakeCam = cam; ST.brakeFace = faceW;
    X.shot('BRAKE', 30.8, 39.05, t => fn(t, hh(cam(t), t, 0.2, 14)), { grade: 'gHall' });
  }

  // ======================================================= GIBBET: what happens to decoys (38.15 - 41.4)
  {
    const GB = S.GB11, TOP = GB.ROPE, RL = 400, DS = 0.55;
    const neck = [TOP[0], TOP[1] + RL];
    const DO = { x: neck[0], y: neck[1] + 1150 * DS, s: DS };
    const fn = (t, c) => {
      const swing = 2.4 * Math.sin(t * 1.15) + 0.8 * Math.sin(t * 2.3);
      // the last decoy: your face, the tin crown askew, the purple gone to rags, hands bound before him
      const D = Q.you(Object.assign({}, DO, { tilt: 26, crown: '#8a8a86', crownRot: 14, crownLift: -8, tunic: '#3a1018', mantle: '#2a1430', face: { expr: 'hollow', lid: 1, mouth: 'parted', open: 0.04, look: [0, 0.4] },
        armR: { hand: [-26, -770], dir: [0.3, 1], pose: 'fist', facing: 'back' }, armL: { hand: [26, -770], dir: [-0.3, 1], pose: 'fist', facing: 'back' } }));
      const rope = `<path d="M${TOP[0]},${TOP[1]} L${neck[0] + 6},${neck[1] - 30}" stroke="#9a8660" stroke-width="10"/><ellipse cx="${neck[0]}" cy="${neck[1] - 10}" rx="44" ry="16" fill="none" stroke="#9a8660" stroke-width="10"/>` + `<path d="M${DO.x - 22 * DS},${DO.y - 770 * DS} L${DO.x + 22 * DS},${DO.y - 770 * DS}" stroke="#5a4a30" stroke-width="9"/>`;
      // rags: a torn hem fluttering
      const rr = rng(4); let rags = ''; for (let i = 0; i < 7; i++) { const x = DO.x + (-150 + i * 50) * DS, y0 = DO.y - 480 * DS, L2v = (40 + rr() * 80) * DS; rags += `<path d="M${f(x)},${f(y0)} l${f(10 * Math.sin(t * 3 + i))},${f(L2v)} l14,-6Z" fill="#2a0a12"/>`; }
      const fig = `<g transform="rotate(${f(swing)} ${TOP[0]} ${TOP[1]})">${rope}${litN(D, LT.gibbet)}${rags}</g>`;
      ST.gibDecoy = { DO, swing };
      return X.compose(X.stage(S.gibbet(t, { fly: ss(40.0, 41.2, t) }), fig), c) + C.vignette(0.65);
    };
    const head = R.toWorld(DO, R.headPt({ tilt: 26 }, 'man', [0, -60]));
    const cam = CAM([[38.15, [640, 960, 0]], [39.5, [700, 930, 0.5], 'sine'], [41.4, [head[0] - 20, head[1] + 140, -0.8], 'sine']], [[38.15, 0.95], [39.5, 1.2, 'sine'], [41.4, 1.55, 'sine']]);
    ST.gibCam = cam; ST.gibHead = head;
    X.shot('GIBBET', 38.15, 41.4, t => fn(t, hh(cam(t), t, 0.25, 16)), { grade: 'gDusk' });
  }

  // ======================================================= VILLAGE: your wife and daughter, the torches (40.6 - 45.4)
  // "The brother's mercenaries will burn your entire village to ash before sundown."
  {
    const WO = { x: 500, y: 1720, s: 0.72 }, DO = { x: 612, y: 1734, s: 0.86 };
    const fn = (t, c) => {
      const wo = Object.assign(idle(t, 51, 0.4), WO), dd = Object.assign(idle(t, 57, 0.4), DO);
      const fire = ss(42.5, 44.7, t);
      const head = R.toWorld(dd, R.headPt(dd, 'kid', [0, -96]));
      const W = Q.wife(Object.assign({}, wo, { face: { expr: 'fear', look: t < 41.9 ? [0.2, -0.3] : [0.35, -0.75], lid: 0.12, brows: [-13, 5], mouth: t > 43.3 ? 'cry' : 'tight', tears: t > 43.5 },
        armL: handAt(wo, add(head, [-6, 8 + 3 * Math.sin(t * 2)]), [0.1, 1], { pose: 'relaxed', detachHand: true }), armR: { hand: [-60, -900], dir: [0.5, 0.6], pose: 'fist', facing: 'back' } }));
      const Dg = Q.daughter(Object.assign({}, dd, { face: { expr: 'anxious', look: t < 42.0 ? [-0.55, -0.6] : [0.3, -0.8], lid: 0.12, brows: [-10, 3], mouth: 'tight', tears: t > 43.8 },
        armR: handAt(dd, R.toWorld(wo, [60, -560]), [-0.3, 1], { pose: 'fist' }), armL: { hand: [60, -380], dir: [0, 1], pose: 'relaxed', facing: 'back' } }));
      const L = LT.village;
      // the fire's glow on the family
      const glow = fire > 0 ? C.radial(560, 1100, 900, '#ff8a40', 0.22 * fire, 'screen') : '';
      ST.vil = { head };
      return X.compose(X.stage(S.village(t, { fire }), lit(W, L) + lit(Dg, L) + handsLit(W, L, 'L') + glow), c) + C.vignette(0.55);
    };
    const wf = R.toWorld(WO, [0, -1268]);
    const cam = CAM(
      [[40.6, [565, 960, 0]], [41.9, [560, 930, 0], 'sine'], [43.0, [620, 560, 0], 'io'], [44.3, [600, 820, 0], 'io'], [45.4, [720, 840, 0], 'sine']],
      [[40.6, 1.65], [41.9, 1.8, 'sine'], [43.0, 1.15, 'io'], [44.3, 0.9, 'io'], [45.4, 0.88, 'sine']]);
    ST.vilCam = cam; ST.vilFace = wf;
    X.shot('VILLAGE', 40.6, 45.4, t => fn(t, hh(cam(t), t, 0.3, 18)), { grade: 'gDusk' });
  }

  // ======================================================= PASS2: the order, the gallop, the blast (44.6 - end)
  // "So you lean out the carriage window, point at the front wheel, and order the disguised king to gallop ahead and
  // secure the bridge. The king spurs his horse onto the stones just as the barrels explode, sending him plunging
  // into the canyon in a ball of fire."
  {
    const PS = S.PASS, CS = 0.3, CY = PS.ROAD, T = X.T_END, TB = 53.65, TF = 51.9;
    const runC = PR.horseRun([[44.6, 'walk'], [47.0, 'walk'], [48.6, 'stand']], 43, 59, 0.2);
    const runK = PR.horseRun([[44.6, 'walk'], [47.0, 'walk'], [48.6, 'stand'], [50.75, 'stand'], [51.4, 'gallop']], 43, 59, 0.57);
    const X0 = 1300 - runC(44.6).x * CS, door = t => X0 + runC(t).x * CS;
    const K0 = 1300 + 158 - runK(44.6).x * CS, kx = t => K0 + runK(t).x * CS;
    ST.p2door = door; ST.p2kx = kx;
    const lean = t => EZ.io(ss(44.95, 45.85, t));
    // the fall: from the deck where the blast catches him, thrown up and over, tumbling into the ravine
    const xb = kx(TB);
    const fallAt = t => { const u = t - TB; return u <= 0 ? null : { dx: 260 * u, dy: -440 * u + 0.5 * 1150 * u * u, rot: 48 * u + 14 * u * u }; };
    const passenger = t => () => {
      const ln = lean(t), pt = env(t, 46.45, 46.75, 47.45, 47.75), ord = env(t, 47.8, 48.1, 50.5, 50.8), ahead = env(t, 48.9, 49.15, 49.75, 50.0);
      // leaning out toward us: bigger (nearer), the waist kept on the sill (no sway: it would swing the head aside)
      const sc = 1 + 0.18 * ln, po = Object.assign(idle(t, 5, 0.3), { x: -10 + 20 * ln, y: PR.COACH.SEAT + 820 * sc, s: sc, sway: 0 });
      // hands come up onto the sill as you lean; the left points down past the king at the front wheel
      const toW = nrm([PR.COACH.FW[0] - (po.x + 166 * sc), PR.COACH.FW[1] - (po.y - 1150 * sc)]);
      const sh = [166, -1150], ptW = add(sh, toW, 330), rest = L2([130, -900], [150, -1075], ln);
      const hL = L2(rest, ptW, pt), dL = L2(L2([-0.1, 1], [-0.2, 1], ln), toW, pt);
      const pose = pt > 0.5 ? 'point' : 'relaxed';
      const face = t < 46.4 ? { expr: 'fear', look: [0.6, 0.1], lid: 0.12, brows: [-12, 4], sweat: 0.5, mouth: 'tight' }
        : t < 47.75 ? { expr: 'fear', look: [0.55, 0.8], lid: 0.14, brows: [-12, 4], sweat: 0.5, mouth: 'talk', open: Q.talk(t, 0.22, 6) }
        : t < 50.75 ? { expr: 'anxious', look: [0.85, 0.15], lid: 0.12, brows: [-10, 5], sweat: 0.55, mouth: 'talk', open: Q.talk(t, 0.26, 6.5) }
        : t < TB ? { expr: 'fear', look: [0.95, 0], lid: 0.1, brows: [-14, 5], sweat: 0.55, mouth: 'tight' }
        : { expr: 'fear', wide: true, look: [0.95, 0.1], lid: 0.08, brows: [-15, 6], sweat: 0.6, mouth: 'parted', open: 0.16 };
      const P = Q.you(Object.assign({}, po, { face, armL: { hand: hL, dir: dL, pose, facing: 'back' }, armR: { hand: L2([-110, -1000], [-150, -1075], ln), dir: L2([0.4, 0.8], [0.2, 1], ln), pose: ln > 0.5 ? 'relaxed' : 'fist', facing: 'back' } }));
      ST.p2P = { P, ln };
      return litN(P, LT.pass);
    };
    const driver = t => () => {
      const pull = EZ.io(ss(46.9, 47.6, t)) * (1 - EZ.io(ss(49.5, 50.3, t)) * 0.5), look = env(t, 46.6, 46.9, 47.9, 48.3);
      return `<g clip-path="url(#p2drv)"><defs><clipPath id="p2drv"><rect x="0" y="-4000" width="3000" height="${-1650 + 4000}"/></clipPath></defs>${litN(Q.driver(Object.assign(idle(t, 13, 0.3), { x: 840, y: -850, s: 1, tilt: -8 * look, face: { expr: t > TB ? 'fear' : 'anxious', look: look > 0.3 ? [-0.3, 0.8] : [0.7, 0], lid: 0.28, mouth: t > TB ? 'parted' : 'tight', open: 0.12 }, armR: { hand: [140 - 80 * pull, -720 - 90 * pull], dir: [0.6, 0.5], pose: 'fist', facing: 'back' }, armL: { hand: [190 - 80 * pull, -740 - 90 * pull], dir: [0.6, 0.5], pose: 'fist', facing: 'back' } })), LT.pass)}</g>`;
    };
    const kingFace = t => t < 47.75 ? { expr: 'stern', look: [-0.6, 0.35], lid: 0.3, brows: [7, -3], mouth: 'tight' }
      : t < 50.2 ? { expr: 'stern', look: [-0.75, -0.12], lid: lerp(0.3, 0.44, ss(48.0, 48.8, t)), brows: [11, -5], mouth: 'tight' }
      : { expr: 'stern', look: [0.85, 0], lid: 0.3, brows: [9, -4], mouth: 'tight' };
    const kingRider = (t, o = {}) => { const r = runK(t), spur = bump(t, 50.85, 1, 0.35); return PR.rider(Object.assign({ who: 'king', x: kx(t), y: CY + 40, s: CS, g: r.g, c: r.c, t, lit: P => litN(P, LT.pass), spur, lean: 5 * ss(51.0, 51.6, t), pose: { outfit: 'guard', face: kingFace(t), tilt: 5 * bump(t, 49.85, 1, 0.5) }, leg: { legs: '#2e2a26', boot: '#1e1610', hem: '#5a4630' }, horse: { col: '#5a3a24', low: '#2a1a10', rear: 9 * bump(t, 50.9, 1, 0.7), eyeWhite: t > TB ? 1 : 0, ears: t > 50.8 ? 25 : 0, tack: { bridle: true, saddle: '#3a2414' } } }, o)); };
    // the brother on the ridge stoops the torch to the fuse (TF), then straightens to watch
    const brother = (t, L) => {
      const bo = Object.assign(idle(t, 41, 0.3), { x: PS.RIDGE[0] - 20, y: PS.RIDGE[1] + 8, s: CS }), dn = env(t, TF - 0.45, TF - 0.1, TF + 0.25, TF + 0.7);
      const tw = R.toWorld(bo, [lerp(-250, -120, dn), lerp(-1230, -620, dn)]);
      const B = Q.brother(Object.assign({}, bo, { face: { expr: 'stern', look: [-0.6, 0.6], lid: 0.32, mouth: t > TB ? 'smirk' : 'tight' }, armR: gripAt(bo, 'brother', tw, [1, 0], { detachHand: true, thumb: 'up' }), armL: { hand: [120, -780], dir: [-0.1, 1], pose: 'fist', facing: 'back' } }));
      return lit(B, L) + ST.torchW(tw, CS, t, 5, -40 * dn) + handsLit(B, L, 'R');
    };
    // flying stones from the blast (ballistic, tumbling) and the deck's broken blocks falling
    const debris = t => {
      const u = t - TB; if (u <= 0 || u > 3.5) return '';
      const r = rng(17); let g = '';
      for (let i = 0; i < 46; i++) {
        const a = -Math.PI * (0.1 + r() * 0.8), v = 900 + r() * 1700, sz = 18 + r() * 46, x = PS.BOOM[0] + (r() - 0.5) * 500 + Math.cos(a) * v * u, y = PS.BOOM[1] - 200 + Math.sin(a) * v * u + 0.5 * 1500 * u * u;
        g += `<g transform="translate(${f(x)},${f(y)}) rotate(${f((r() - 0.5) * 720 * u)})"><path d="M${f(-sz)},${f(-sz * 0.6)} L${f(sz * 0.8)},${f(-sz * 0.7)} L${f(sz)},${f(sz * 0.5)} L${f(-sz * 0.7)},${f(sz * 0.7)}Z" fill="${['#a89a84', '#8a7e6c', '#6a5e50'][i % 3]}" stroke="#2a221a" stroke-width="3"/></g>`;
      }
      for (let i = 0; i < 9; i++) { const x0 = PS.PIERS[0] + 120 + i * 100, y = PS.ROAD + 20 + 0.5 * 1300 * Math.pow(Math.max(0, u - 0.15 - r() * 0.2), 2), rot = (r() - 0.5) * 80 * u; g += `<g transform="translate(${f(x0)},${f(y)}) rotate(${f(rot)})"><rect x="-55" y="-40" width="110" height="80" fill="#9a8c76" stroke="#3a3026" stroke-width="3"/><path d="M-55,-40 L55,-40" stroke="#c8bca6" stroke-width="5"/></g>`; }
      return g;
    };
    const fn = (t, c) => {
      const rC = runC(t), boom = t >= TB ? 1 : 0;
      // the clip corridor lets the pointing arm reach down over the door, clear of the body below the sill
      const W3 = PR.COACH.WIN[3], corridor = `M250,${W3} L760,${W3} L980,${W3 + 700} L360,${W3 + 700}Z`;
      const co = PR.coach({ x: door(t), y: CY, s: CS, t, run: rC, glass: 0, lean: lean(t), clipExtra: lean(t) > 0.001 ? corridor : null, passenger: passenger(t), driver: driver(t), farLight: '#c8c0b0', horses: t > TB ? { near: { ears: 30, eyeWhite: 1, head: -6 }, far: { ears: 30, head: -6 } } : {} });
      let kg = '';
      const fa = fallAt(t);
      if (!fa) kg = kingRider(t).svg;
      else {
        // falling: the rider and horse frozen mid-stride, tumbling, wrapped in fire
        const k = kingRider(TB, { c: runK(TB).c + (t - TB) * 0.6, t });
        const cx = xb + fa.dx, cy = CY - 220 + fa.dy;
        kg = `<g transform="translate(${f(fa.dx)},${f(fa.dy)}) rotate(${f(fa.rot)} ${f(xb)} ${f(CY - 220)})">${k.svg}${S.flames(xb - 30, CY - 100, 340, 360, t, 77, 1)}</g>` + E2.smokeTrail(t, xb, CY - 220, fa);
      }
      const set = S.pass(t, { boom, fuse: clamp((t - TF) / (TB - TF)) });
      let fx = '';
      if (t >= TB) {
        fx += fireball(PS.BOOM[0], PS.BOOM[1], 900, t - TB, t, 3, 1) + debris(t);
        // the deck's broken edges burn
        fx += S.flames(PS.PIERS[0] - 100, PS.ROAD + 20, 260, 220, t, 31, clamp(1.5 - (t - TB) * 0.2)) + S.flames(PS.PIERS[1] + 100, PS.ROAD + 20, 260, 220, t, 33, clamp(1.5 - (t - TB) * 0.2));
      }
      // the second ball of fire where he strikes the ravine floor
      const TH = TB + 2.35;
      if (t >= TH - 0.05) fx += fireball(xb + 260 * 2.35, PS.FLOOR - 60, 1100, t - TH, t, 5, 1);
      // leaning right out, your left arm comes in front of the king to point at the wheel (drawn again over him, in
      // the coach's frame; it is the same arm, so nothing changes where nothing covers it)
      const pp = ST.p2P;
      const armOver = pp && pp.ln > 0.99 ? `<g transform="translate(${f(door(t))},${CY}) scale(${CS})"><g transform="translate(0,${f(co.bob)}) rotate(${f(co.rock)} -100 -880)">${armsOver(pp.P, LT.pass, 'L', false)}</g></g>` : '';
      const chars = co.svg + kg + armOver + brother(t, LT.pass) + fx;
      ST.p2 = { co };
      return X.compose(X.stage(set, chars), c) + C.vignette(0.45);
    };
    const E2 = { smokeTrail: (t, x0, y0, fa) => { let g = ''; for (let i = 1; i <= 10; i++) { const u = (t - TB) * (1 - i / 11), dx = 260 * u, dy = -440 * u + 0.5 * 1150 * u * u; g += `<circle cx="${f(x0 + dx)}" cy="${f(y0 + dy - 60)}" r="${f(60 + i * 18)}" fill="#2a2420" opacity="${f(0.5 * (1 - i / 11))}" filter="url(#b8)"/>`; } return g; } };
    // camera: on the window as you lean out; down to the wheel; the two of you; the king's face; then out after him
    // onto the stones, wide for the fuse and the ridge, into the blast, down with the fall, into the fire
    const D = (t, dx, y) => [door(t) + dx, y];
    const kX = t => kx(t);
    const fallC = t => { const fa = fallAt(t) || { dx: 0, dy: 0 }; return [xb + fa.dx, CY - 220 + fa.dy]; };
    const fb2 = [xb + 260 * 2.35, PS.FLOOR - 160];
    const cam = CAM(
      [[44.6, [...D(44.6, 40, 1078), 0]], [45.95, [...D(45.95, 80, 1050), 0], 'io'], [47.2, [...D(47.2, 150, 1240), 0], 'io'], [48.4, [...D(48.4, 92, 1065), 0], 'io'], [50.45, [...D(50.45, 125, 1058), 0], 'sine'], [51.35, [kX(51.35) + 60, 1150, 0], 'io'], [52.3, [kX(52.3) + 120, 1320, 0], 'io'], [53.4, [5650, 820, 0], 'io'], [54.3, [5300, 1650, 1.2], 'io'], [56.1, [...fallC(56.1), -0.6], 'io'], [T, [fb2[0], fb2[1], 0], 'sine']],
      [[44.6, 2.2], [45.95, 2.45, 'io'], [47.2, 1.7, 'io'], [48.4, 2.5, 'io'], [50.45, 2.75, 'sine'], [51.35, 1.6, 'io'], [52.3, 0.75, 'io'], [53.4, 0.43, 'io'], [54.3, 0.56, 'io'], [56.1, 0.78, 'io'], [T, 1.35, 'sine']]);
    // the blast shakes the camera
    const camS = t => { const c = cam(t), s = bump(t, TB, 1, 1.1); return [c[0] + 40 * s * Math.sin(t * 47), c[1] + 30 * s * Math.sin(t * 53), c[2] * (1 + 0.05 * bump(t, TB, 1, 0.5)), c[3] + 2.5 * s * Math.sin(t * 31)]; };
    ST.p2Cam = camS; ST.p2Fire = fb2;
    X.shot('PASS2', 44.6, T + 0.01, t => fn(t, hh(camS(t), t, t > 47.8 && t < 50.6 ? 0.15 : 0.3, 20)), { grade: 'gDay' });
  }

  // ======================================================= the transitions
  {
    const T = X.T_END, PS = S.PASS, I = S.IN11;
    // CROWN -> GATE: the camera keeps tilting down the robes and arrives tilting down the gate towers
    X.tr('carry', 4.8, 0.8, 'CROWN', 'GATE', { mode: 'pan', dir: [0, 1], dist: 0.42 });
    // GATE -> INSIDE: push into the arrow in the door, settle out of its head through the panel inside
    const a2 = R.toWorld({ x: ST.gateDoor(9.0), y: S.GT11.ROAD, s: 0.36 }, [-40, -1452]);
    X.tr('push', 9.0, 0.8, 'GATE', 'INSIDE', { fa: scr(a2, ST.gateCam(9.0)), fb: scr(I.FRESH, ST.insideCam(9.0)), za: 3.0, zb: 0.5 });
    // INSIDE -> PASS1: through the window into the mountains
    X.tr('carry', 12.6, 0.8, 'INSIDE', 'PASS1', { mode: 'zoom', k: 2.2, fa: scr(I.WINC, ST.insideCam(12.6)), fb: [540, 820] });
    // PASS1 -> RIDGE: push into the tiny figure on the ridge, out of the brother's face
    X.tr('push', 25.25, 0.8, 'PASS1', 'RIDGE', { fa: scr(ST.pass1BrW, ST.pass1Cam(25.25)), fb: scr(ST.ridgeFace, ST.ridgeCam(25.25)), za: 3.2, zb: 0.5 });
    // RIDGE -> BRAKE: rack from the bridge far below to your hand by the brake
    X.tr('rack', 31.2, 0.8, 'RIDGE', 'BRAKE', { fa: [760, 1300], fb: scr(ST.brakeHandle, ST.brakeCam(31.2)), blur: 12 });
    // BRAKE -> GIBBET: your face dissolves into the last decoy's, hanging at the crossroads
    X.tr('organic', 38.6, 0.9, 'BRAKE', 'GIBBET', { fa: scr(ST.brakeFace, ST.brakeCam(38.6)), fb: scr(ST.gibHead, ST.gibCam(38.6)), za: 1.12, zb: 0.92, seed: 7 });
    // GIBBET -> VILLAGE: the village opens out of the dead man's face into your wife's
    X.tr('radial', 41.0, 0.8, 'GIBBET', 'VILLAGE', { fa: scr(ST.gibHead, ST.gibCam(41.0)), fb: scr(ST.vilFace, ST.vilCam(41.0)), soft: 0.5 });
    // VILLAGE -> PASS2: a pine trunk crosses the lens as both shots truck
    const pine = (x, u) => {
      const r = rng(5); let g = `<g filter="url(#dof1)"><rect x="${f(x - 460)}" y="-200" width="920" height="2320" fill="#3a2a1e"/>`;
      for (let i = 0; i < 26; i++) { const bx = x - 440 + r() * 880, by = -200 + r() * 2300, h = 140 + r() * 260; g += `<path d="M${f(bx)},${f(by)} q${f((r() - 0.5) * 30)},${f(h / 2)} ${f((r() - 0.5) * 20)},${f(h)}" stroke="${r() > 0.5 ? '#241a12' : '#5a4430'}" stroke-width="${f(10 + r() * 18)}" fill="none" stroke-linecap="round"/>`; }
      g += `<rect x="${f(x - 460)}" y="-200" width="70" height="2320" fill="#c88050" opacity="0.35"/><rect x="${f(x + 380)}" y="-200" width="80" height="2320" fill="#000" opacity="0.4"/>`;
      // a broken branch stub and a bough of needles reaching out from the trunk
      g += `<path d="M${f(x + 380)},420 C${f(x + 600)},380 ${f(x + 860)},430 ${f(x + 1150)},390" stroke="#2a1e14" stroke-width="44" fill="none" stroke-linecap="round"/>`;
      for (let i = 0; i < 18; i++) { const bx = x + 500 + i * 36, by = 400 + Math.sin(i) * 20; g += `<path d="M${f(bx)},${f(by)} l${f(-30 + (i % 3) * 20)},${f(70 + (i % 4) * 16)} M${f(bx)},${f(by)} l${f(20 + (i % 3) * 14)},${f(-60 - (i % 4) * 12)}" stroke="#1e2a18" stroke-width="12" stroke-linecap="round"/>`; }
      return g + `</g>`;
    };
    X.tr('wipe', 45.0, 0.8, 'VILLAGE', 'PASS2', { dir: 1, truck: 200, obj: pine });
    // PASS2 -> CROWN (the loop): the ball of fire becomes the gold of the crown at frame 0
    const yo = Object.assign({}, ST.CROWN_YOU, { tilt: 0 });
    const crownW = R.toWorld(yo, R.headPt(yo, 'man', [0, -150 - 205]));
    X.tr('zmatch', T, 0.9, 'PASS2', 'CROWN', { end: true, bOff: -T, fa: scr(ST.p2Fire, ST.p2Cam(T - 0.45)), fb: scr(crownW, ST.crownCam(-0.45)), za: 2.4, zb: 2.6, leak: '#ffb060', leakOp: 0.45, seed: 4 });
  }
})(window);
