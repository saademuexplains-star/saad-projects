// "The Royal Taster" part 3: the brother's eye, the burning house, the King's death, the coup and the loop.
(function (G) {
  const X = G.ENG, T = G.TCAST, S = G.SETS, PR = G.PROPS, C = G.CINE, R = G.RIG, D = G.SHOTS_D;
  const { track: TK, ss, clamp, lerp, EZ } = X;
  const { f, mix } = R;
  const { gripAt, gripPt, place, ptOn, perp, L4, scr, wor, idle, wave, env, bump, hh, nrm, rot, L2, hoSpoon, A, B, plateT, plateK, throneBack, jester, walker, lady, armsOver } = D;
  const sbob = (t, hz) => 0.5 - 0.5 * Math.cos(Math.PI * 4 * hz * t), spos = (t, hz) => Math.pow(0.5 + 0.5 * Math.sin(Math.PI * 2 * hz * t), 2);
  const D2R = Math.PI / 180, lit = X.lit, blur = (svg, id) => `<g filter="url(#${id})">${svg}</g>`;
  const crownW = (p, a, sx, sy) => `<g transform="translate(${f(p[0])},${f(p[1])}) rotate(${f(a)}) scale(${f(sx)},${f(sy)})">${R.crownArt('#d6a838')}</g>`;
  const KFX = { w: 1.13, len: 0.95 }, BFX = { w: 0.89, len: 1.11 };

  // ======================================================= EYE  "what happens to tasters who ruin a coup" (26.20 - 29.55)
  const eyeW = [B.BX + 33 * B.BS, B.BY - 1308 * B.BS - 2.2 * B.BS];
  const camE = TK([[26.2, [520, 1052, 3.3, 0]], [27.9, [548, 1036, 4.2, 0], 'sine'], [29.55, [eyeW[0], eyeW[1], 5.8, 0], 'in2']]);
  X.shot('EYE', 26.2, 29.55, t => {
    const c = hh(camE(t), t, 0.25, 17);
    const set = S.feast(t, { side: 'B', tableY: 1630 });
    const L = L4.hallB;
    const narrow = ss(27.5, 27.9, t), smirk = ss(28.1, 28.5, t);
    const bO = Object.assign(idle(t, 3, 0.2), { x: B.BX, y: B.BY, s: B.BS, tilt: lerp(-2, 1, ss(26.4, 27.4, t)) });
    const bro = T.brother(Object.assign(bO, { face: { look: [lerp(0.3, 0, ss(26.4, 27.2, t)), 0.04], lid: lerp(0.26, 0.5, narrow), mouth: smirk > 0.5 ? 'smirk' : 'closed', brows: [lerp(2, 6, narrow), lerp(-2, -6, narrow)] },
      armR: { hand: [-110, -800], pose: 'relaxed' }, armL: { hand: [110, -800], pose: 'relaxed' } }));
    const layers = [...set.back, { p: 1, svg: lit(bro, L), chars: true }, ...set.front];
    const fl = 0.5 + 0.25 * Math.sin(t * 7.3) + 0.15 * Math.sin(t * 13.1);
    return X.compose(layers, c) + C.radial(160, 900, 900, '#ff9a40', 0.22 * fl, 'screen') + C.vignette(0.55, '#06040a', 0.4);
  }, { grade: 'gFeast' });
  X.tr('iris', 29.1, 0.9, 'EYE', 'VIL', { fa: scr(eyeW, camE(28.9)), fb: [540, 900], k: 5 });

  // ======================================================= VIL  the traitors bar the door and burn the house (28.65 - 33.10)
  {
    const HX = 540, HY = 1700, HS = 1.6, PS = 0.42;
    const plank = { p: [540, 1350], w: 380, h: 40, a: -4 }, nail = [684, 1340];
    const cam = TK([[28.65, [560, 1300, 2.3, 0]], [29.4, [600, 1305, 2.35, 0], 'sine'], [30.3, [650, 1250, 2.2, 0]], [30.85, [1020, 860, 2.6, 0], 'io'], [31.3, [1000, 880, 2.5, 0]], [31.7, [640, 1110, 1.15, 0], 'io'], [32.6, [570, 900, 0.62, 0], 'out2'], [33.1, [600, 720, 0.66, 0]]]);
    const hits = [29.45, 29.85, 30.25];
    const swing = t => { let k = 0; for (const h of hits) { if (t > h - 0.4 && t < h + 0.15) k = t < h ? EZ.in2(clamp((t - (h - 0.4)) / 0.4)) : 1 - EZ.out2(clamp((t - h) / 0.15)); } return k; }; // 0 raised .. 1 impact
    const fireU = TK([[31.85, 0], [32.75, 1, 'out2']]);
    const torchT = [31.5, 31.88];
    X.shot('VIL', 28.65, 33.1, t => {
      const c = hh(cam(t), t, 0.5, 19);
      const u = fireU(t);
      const L = L4.night;
      const setL = S.village(t, { fire: Math.max(u, 0.15 * ss(30.2, 31, t)) });
      // the hammering thug
      const k = t < 30.4 ? swing(t) : 0;
      const hO = Object.assign(idle(t, 51, 0.4), { x: 830, y: 1720, s: PS, sway: -k * 3 });
      const raised = { p: [772, 1180], d: [0.7, -0.7] }, impact = { p: [nail[0] + 138 * PS * 0.98, nail[1] + 2], d: [0, -1] };
      const hp = L2(raised.p, impact.p, k), hd = nrm(L2(raised.d, impact.d, k));
      const hammerer = T.thug(Object.assign(hO, { face: { look: [-0.6, 0.2], mouth: 'tight', lid: 0.35 }, armR: gripAt(hO, 'thug', hp, hd, { hold: PR.hammer() }), armL: { hand: R.toLocal(hO, [700, 1395]), pose: 'open', facing: 'palm', dir: [-1, -0.2] } }), 0);
      // the torch bearer: holds it up, throws it on the thatch
      const tO = Object.assign(idle(t, 52, 0.4), { x: 220, y: 1720, s: PS, tilt: -env(t, 31.2, 31.45, 31.6, 31.9) * 6 });
      const throwK = ss(31.2, 31.5, t);
      const tFist = L2([300, 1230], [340, 1050], throwK), tDir = nrm(L2([-1, 0], [-0.5, -0.87], throwK));
      const holding = t < torchT[0];
      const tArm = holding ? gripAt(tO, 'thug', tFist, tDir, { hold: PR.torchG(t, 2) }) : { hand: R.toLocal(tO, L2([340, 1050], [330, 1250], ss(31.5, 32, t))), pose: 'open', facing: 'back' };
      const bearer = T.thug(Object.assign(tO, { face: { look: [0.6, -0.5], mouth: t > 31.3 ? 'snarl' : 'closed', lid: 0.3 }, armL: tArm }), 1);
      // the flying torch (released at the hand pose, arcs onto the roof)
      let flying = '';
      if (!holding && t < torchT[1] + 0.05) {
        const rel = gripPt(tO, 'thug', 'L', gripAt(tO, 'thug', [340, 1050], [-0.5, -0.87]), 0, 0), land = [420, 690], q = clamp((t - torchT[0]) / (torchT[1] - torchT[0]));
        const pos = [lerp(rel[0], land[0], q), lerp(rel[1], land[1], q) - Math.sin(Math.PI * q) * 260];
        flying = place(PR.torchG(t, 2), pos, -120 + q * 300, PS);
      }
      // the family behind the window, lit from the fire inside
      const win = [HX + 190 * HS, HY - 640 * HS, 230 * HS, 200 * HS], fear = ss(30.3, 30.6, t);
      const fam = [
        T.mother(Object.assign(idle(t, 61), { x: win[0] + 300, y: win[1] + 112 + 1268 * 0.27, s: 0.27, face: { expr: 'fear', mouth: 'shout', open: 0.5 + 0.2 * wave(t, 3), look: [-0.4, 0.2], wide: true } })),
        T.wife(Object.assign(idle(t, 62), { x: win[0] + 120, y: win[1] + 150 + 1268 * 0.3, s: 0.3, face: { expr: 'fear', mouth: 'shout', open: 0.7 + 0.2 * wave(t, 4), look: [0.2, 0], wide: true }, armL: { hand: [150, -1250], pose: 'open', facing: 'palm', dir: [0, -1] } })),
        T.daughter(Object.assign(idle(t, 63), { x: win[0] + 235, y: win[1] + 220 + 734 * 0.36, s: 0.36, face: { expr: 'grief', mouth: 'cry', look: [0, 0.1], tears: true } })),
        T.son(Object.assign(idle(t, 64), { x: win[0] + 70, y: win[1] + 250 + 734 * 0.34, s: 0.34, face: { expr: 'fear', mouth: 'shout', open: 0.6, look: [0.3, 0] } })),
      ].map(p => lit(p, L)).join('');
      const glow = mix('#3a2a1a', '#ff9a40', 0.3 + 0.7 * Math.max(fear * 0.5, u));
      const window = `<defs><clipPath id="vw"><rect x="${win[0]}" y="${win[1]}" width="${win[2]}" height="${win[3]}"/></clipPath></defs><g clip-path="url(#vw)"><rect x="${win[0]}" y="${win[1]}" width="${win[2]}" height="${win[3]}" fill="${glow}"/>${fam}<rect x="${win[0]}" y="${win[1]}" width="${win[2]}" height="${win[3]}" fill="#ff7a2a" opacity="${f(0.18 + 0.25 * u)}" style="mix-blend-mode:overlay"/></g>` +
        `<path d="M${win[0] + win[2] / 2},${win[1]} L${win[0] + win[2] / 2},${win[1] + win[3]} M${win[0]},${win[1] + win[3] * 0.5} L${win[0] + win[2]},${win[1] + win[3] * 0.5}" stroke="#2a180c" stroke-width="16"/><rect x="${win[0]}" y="${win[1]}" width="${win[2]}" height="${win[3]}" fill="none" stroke="#2a180c" stroke-width="28"/>`;
      // the plank barring the door, its nails
      const plk = PR.plank(plank.p[0], plank.p[1], plank.w, plank.h, plank.a) + (t > hits[2] ? '' : '') + C.radial(nail[0], nail[1], 60, '#ffe0a0', bump(t, hits[0], 0.6, 0.15) + bump(t, hits[1], 0.6, 0.15) + bump(t, hits[2], 0.6, 0.15));
      const layers = [...setL.slice(0, 3), { p: 1, svg: S.house(HX, HY, HS, t, Math.max(u, fear * 0.4)) + window + plk }, { p: 1, svg: lit(hammerer, L) + lit(bearer, L) + flying, chars: true }, { p: 1, svg: S.houseFire(HX, HY, HS, t, u) }];
      return X.compose(layers, c) + C.vignette(0.5, '#05030a', 0.45);
    }, { grade: 'gNight' });
  }
  X.tr('zmatch', 32.75, 0.7, 'VIL', 'KING', { fa: [500, 330], fb: scr([380, 1324], [380, 1330, 3.2]), za: 2.8, zb: 2.8, leak: '#ffb050', leakOp: 0.55, seed: 21 });

  // ======================================================= KING  "delicious" -> laugh -> the bite -> he chokes (32.40 - 41.50)
  const legRest = { p: [plateT[0] + 6, plateT[1] - 18], a: -8, s: A.KS };
  const crownFall = TK([[40.3, 0], [40.62, 1, 'in2'], [40.72, 0.93, 'out2'], [40.82, 1, 'in2']]);
  const kingFall = TK([[40.55, 0], [40.95, 80, 'in2'], [41.05, 77, 'out2'], [41.2, 80, 'sine']]);
  const crownRest = { p: [520, 1594], a: 14 };
  const kO_at = (t, extra = {}) => {
    const laugh = env(t, 36.62, 36.75, 37.45, 37.7), lb = sbob(t, 2.8);
    const lean = ss(33.2, 34.3, t) * (1 - ss(37.7, 38.0, t));
    const shake = env(t, 40.2, 40.3, 40.5, 40.6) * Math.sin(t * 56) * 3;
    return Object.assign(idle(t, 2), { x: A.KX - lean * 22 - ss(38.6, 38.9, t) * 16 * (1 - ss(39.6, 40, t)), y: A.KY + laugh * lb * 9, s: A.KS, breath: 0, sway: shake, tilt: -lean * 4 - laugh * (7 + 3 * lb) + env(t, 40.25, 40.35, 40.5, 40.6) * -8 }, extra);
  };
  // the King's crown before it falls: head-attached pose
  const crownOnHead = o => { const hp = R.headPt(o, 'man', [0, (-144 + 32) * KFX.len]), w = R.toWorld(o, hp); return { p: w, a: (o.tilt || 0) + (o.sway || 0) }; };
  const camK = TK([[32.4, [380, 1330, 3.2, 0]], [33.4, [380, 1290, 1.6, 0], 'out2'], [34.8, [370, 1285, 1.45, 0], 'sine'], [36.6, [420, 1280, 1.6, 0], 'sine'], [37.5, [520, 1250, 1.95, 0], 'io'], [38.1, [380, 1420, 1.55, 0], 'io'], [38.8, [520, 1295, 2.05, 0], 'io'], [39.7, [545, 1292, 2.1, 0]], [40.5, [610, 1330, 1.75, 0], 'sine'], [41.0, [700, 1470, 1.8, 0], 'io'], [41.5, [840, 1600, 2.35, 0], 'in2']]);
  D.camK = camK;
  const kingAt = (t, L) => {
    const o = kO_at(t);
    const choke = ss(39.75, 39.95, t), dead = ss(40.6, 40.95, t), laugh = env(t, 36.62, 36.75, 37.45, 37.7), lb = sbob(t, 2.8);
    const red = ss(39.8, 40.3, t), purple = ss(40.3, 40.8, t);
    o.skin = mix(mix('#e9b294', '#d8786e', red * 0.7), '#a87a96', purple * 0.6);
    const chew = t > 38.95 && t < 39.72 ? 0.1 + 0.14 * spos(t, 2.6) : 0;
    const bite = env(t, 38.62, 38.75, 38.85, 38.98);
    const face = dead > 0.6 ? { expr: 'neutral', lid: 0.62, look: [0.2, 0.4], mouth: 'parted', open: 0.25 }
      : choke > 0.3 ? { expr: 'fear', wide: true, lid: 0, look: [0, -0.3], mouth: 'o', open: 0.55 + 0.15 * Math.sin(t * 20), brows: [-12, -6] }
      : { expr: 'neutral', mouth: laugh > 0.2 ? 'grin' : bite > 0.1 ? 'shout' : chew ? 'talk' : 'smile', open: laugh > 0.2 ? 0.3 + 0.4 * lb : bite > 0.1 ? 0.8 * bite : chew, look: t < 36.6 ? [-0.85, 0.05] : t < 37.8 ? [-0.3, -0.4] : t < 38.6 ? [-0.8, 0.5] : [-0.3, 0.1], lid: laugh > 0.2 ? 0.45 : 0.18, brows: laugh > 0.2 ? [-3, 4] : [0, 0] };
    // right hand: reaches for the leg on the taster's plate, carries it to his mouth, drops it, clutches the throat
    const legGrip = gripAt(o, 'king', legRest.p, perp(legRest.a));
    let armR, armL = { hand: [190, -800], pose: 'relaxed' }, held = false, legBite = ss(38.8, 38.9, t);
    const toMouth = [A.KX - 96 * A.KS - 30, A.KY - 1308 * A.KS + 112 * A.KS];
    const throatR = R.toWorld(o, [-48, -1168]), throatL = R.toWorld(o, [48, -1168]);
    if (t < 37.75) armR = { hand: [-150, -820], pose: 'relaxed' };
    else if (t < 38.12) { const u = EZ.io(clamp((t - 37.75) / 0.32)); armR = Object.assign({}, legGrip, { hand: L2([-150, -820], legGrip.hand, u), pose: t < 38.05 ? 'open' : 'grip', dir: legGrip.dir }); }
    else if (t < 39.9) { const u = EZ.io(clamp((t - 38.15) / 0.5)); const fp = L2(legRest.p, toMouth, u); armR = gripAt(o, 'king', fp, perp(lerp(legRest.a, 0, u)), { hold: PR.leg({ bite: legBite }) }); held = true; }
    else { const u = EZ.out2(clamp((t - 39.92) / 0.3)); armR = gripAt(o, 'king', L2(toMouth, throatR, u), nrm(L2([0, 1], [0.6, -0.8], u))); }
    if (t > 39.95) { const u = EZ.out2(clamp((t - 39.95) / 0.3)); armL = gripAt(o, 'king', L2(R.toWorld(o, [190, -800]), throatL, u), nrm(L2([0, 1], [-0.6, -0.8], u))); }
    if (dead > 0) { armR = { hand: L2(armR.hand, [-200, -760], dead), pose: 'relaxed' }; armL = { hand: L2(armL.hand, [200, -760], dead), pose: 'relaxed' }; }
    const p = T.king(Object.assign(o, { face, armR, armL }));
    let svg = lit(p, L);
    const fall = kingFall(t);
    if (fall > 0) svg = `<g transform="rotate(${f(fall)},${A.KX},1600)">${svg}</g>`;
    return { svg, o, held, armR, p };
  };
  D.kingAt = kingAt; D.crownRest = crownRest; D.kingFall = kingFall;
  // the dropped leg: falls from the hand pose onto the table
  const legDrop = (t, o, armR) => null;
  X.shot('KING', 32.4, 41.5, t => {
    const c0 = camK(t), shake = env(t, 40.9, 40.95, 41.1, 41.4) * Math.sin(t * 60) * 10;
    const c = hh([c0[0] + shake, c0[1] + shake * 0.6, c0[2], c0[3]], t, 0.45, 23);
    const set = S.feast(t, { side: 'A', tableY: 1630 });
    const L = L4.hall;
    const K = kingAt(t, L);
    // the crown: on his head until he jerks back, then it tumbles onto the table
    const ck = crownFall(t), ch = crownOnHead(kO_at(Math.min(t, 40.3)));
    const crownP = ck <= 0 ? null : { p: L2(ch.p, crownRest.p, ck), a: lerp(ch.a, crownRest.a, ck) + Math.sin(ck * Math.PI) * 40 };
    // the leg: on the plate, in his fist, then dropped
    let legSvg = '';
    if (t < 38.12) legSvg = place(PR.leg({}), legRest.p, legRest.a, legRest.s);
    else if (t >= 39.9) { const q = clamp((t - 39.9) / 0.28), p0 = [A.KX - 96 * A.KS - 30 + 40, A.KY - 1308 * A.KS + 112 * A.KS + 20]; legSvg = place(PR.leg({ bite: 1 }), [lerp(p0[0], plateK[0] - 70, q), lerp(p0[1], 1596, EZ.in2(q)) - Math.sin(Math.PI * q) * 30], lerp(0, 24, q), A.KS); }
    // the taster beside him
    const forced = ss(33.55, 33.9, t) * (1 - ss(39.75, 39.95, t)), talk = env(t, 34.95, 35.05, 36.6, 36.7), horror = ss(39.8, 40.1, t);
    const tO = Object.assign(idle(t, 1, 0.4), { x: A.TX, y: A.TY, s: A.TS, sway: -horror * 3, tilt: talk * wave(t, 1.6) * 3 - horror * 4, skin: mix('#dcae8a', '#e08a78', 0.25) });
    const tFace = horror > 0.3 ? { expr: 'fear', wide: true, lid: 0, look: [0.8, 0.1], mouth: 'parted', open: 0.25 }
      : { expr: 'anxious', look: t < 32.9 ? [0.1, 0.1] : [0.85, 0], mouth: talk > 0.3 ? 'talk' : forced > 0.3 ? 'smile' : 'tight', open: talk > 0.3 ? T.talk(t, 0.45, 8) : 0, cd: forced > 0.3 ? -3.2 + Math.sin(t * 23) * 1.1 : undefined, brows: [-8, -3], sweat: 0.7 };
    const fist = [plateT[0] + 62 + talk * 14 * Math.sin(t * 3), 1462 - talk * 30];
    const taster = T.taster(Object.assign(tO, { face: tFace, armL: gripAt(tO, 'taster', fist, [0, -1], { facing: 'palm', hold: `<g transform="translate(-55,0)">${PR.spoon({})}</g>` }), armR: Object.assign(gripAt(tO, 'taster', [A.TX - 96, 1588], [0.2, 1]), { facing: 'back' }) }));
    const guard = T.guard(Object.assign(idle(t, 9), { x: A.GX + ss(40.6, 41.2, t) * -120, y: 1780, s: 0.55, face: { look: [-0.5, 0.2], lid: 0.4, mouth: t > 40.7 ? 'shout' : 'closed', open: 0.6 } }), 0);
    const ladyP = lady(t, { stand: ss(40.5, 40.9, t), face: t > 40.4 ? { expr: 'fear', mouth: 'shout', open: 0.8, look: [0.8, 0], wide: true } : { mouth: 'smile', look: [0.8, 0.05] } });
    const goblet = PR.goblet(790, 1618, 0.6, { tip: ss(40.88, 41.08, t) * 100, wine: t < 40.9 ? 0.8 : 0 });
    const stain = PR.stain(880, 1606, ss(40.95, 41.6, t), 4, 1.1);
    const items = PR.candelabra(380, 1592, 0.55, t) + PR.plate(plateT[0], plateT[1], 0.55, { steam: t }) + PR.plate(plateK[0], plateK[1] + bump(t, 40.95, -10, 0.2), 0.6, { meat: true }) + PR.goblet(-170, 1618, 0.55, {}) + PR.bird(-560, 1612, 0.42, { t }) + PR.jug(-260, 1618, 0.6);
    const chars = lit(ladyP, L) + lit(guard, L) + throneBack(A.KX, 1560, 0.62) + K.svg + lit(taster, L);
    const layers = [...set.back, { p: 0.86, svg: blur(jester(t, -1050, ss(40.5, 41.1, t)) + walker(t, -1500, 1700, 32.4, 40.4, 6, 'page'), 'dof1') }, { p: 1, svg: chars, chars: true }, ...set.front,
      { p: 1, svg: stain + items + legSvg + goblet + (crownP ? crownW(crownP.p, crownP.a, A.KS * KFX.w, A.KS * KFX.len) : '') + armsOver(taster, L) + (t < 40.5 ? armsOver(K.p, L) : '') }];
    return X.compose(layers, c) + C.vignette(0.4, '#08040a', 0.45);
  }, { grade: 'gFeast' });
  X.tr('liquid', 41.1, 0.8, 'KING', 'CHAOS', { fa: scr([880, 1606], camK(41.1)), fb: [540, 960], col: '#5a0810', seed: 8 });

  // ======================================================= CHAOS  guards panic, the antidote, the crown, "his personal taster" (40.70 - 47.93)
  {
    const TE = X.T_END;
    const camC = TK([[40.7, [800, 1540, 1.9, 0]], [41.3, [440, 1260, 1.05, 0], 'io'], [41.9, [300, 1250, 1.2, 0], 'sine'], [42.35, [205, 1300, 2.6, 0], 'io'], [43.1, [205, 1305, 2.9, 0]], [43.65, [285, 1045, 2.1, 0], 'io'], [44.2, [300, 1030, 2.0, 0]],
      [44.55, [470, 1420, 1.75, 0], 'io'], [45.3, [440, 1040, 1.7, 0], 'io'], [45.75, [440, 990, 2.0, 0], 'sine'], [46.3, [400, 1060, 1.9, 0]], [46.93, [260, 1250, 2.27, 0], 'io'], [TE, [262, 1262, 2.35, 0], 'sine']]);
    const TSY = 1790; // the taster standing
    const brX = TK([[41.2, 1300], [41.95, 400, 'out2'], [43.3, 400], [43.8, 345, 'sine'], [44.2, 380], [44.45, 470, 'io'], [45.4, 440, 'io'], [46.3, 410], [46.9, 420]]);
    const brY = TK([[44.2, 1840], [44.45, 2100, 'io'], [44.6, 2100], [45.2, 1840, 'io']]);
    const pouch = [B ? 0 : 0];
    // the antidote vial path (world): from his side to above the pouch, pushed in
    const vialRest = (o) => R.toWorld(o, [78, -800]);
    X.shot('CHAOS', 40.7, TE, t => {
      const tau = t - TE;
      const c = hh(camC(t), t, t < 42 ? 2.2 : 0.45, 29);
      const set = S.feast(t, { side: 'A', tableY: 1630 });
      const L = L4.hall;
      // the dead King stays slumped across the table
      const K = kingAt(41.4, L);
      // the taster stands up in the panic
      const up = ss(41.1, 41.5, t), tY = lerp(A.TY, TSY, up);
      const whisper = env(t, 43.2, 43.4, 44.1, 44.3);
      const tO = Object.assign(idle(t, 1, 0.3), { x: A.TX, y: tY, s: A.TS, breath: 0, sway: 0, tilt: whisper * 3, skin: mix('#dcae8a', '#e08a78', 0.2) });
      const tLook = t < 41.9 ? [Math.sin(t * 3) * 0.8, 0] : t < 43.2 ? [0.4, 0.8] : t < 44.3 ? [0.9, 0] : t < 46.3 ? [0.8, -0.4] : [0.6, 0.5];
      const tFace = { expr: 'fear', wide: t < 43, lid: t < 43 ? 0 : 0.12, look: tLook, mouth: t < 42 ? 'parted' : 'closed', open: 0.25, brows: [-10, -5], sweat: 0.5 };
      // brother
      const bO = Object.assign(idle(t, 3, 0.3), { x: brX(t), y: brY(t) + (t > 41.2 && t < 41.95 ? sbob(t, 1.6) * 10 : 0), s: B.BS, breath: 0, sway: 0, tilt: whisper * -8 });
      const bFace = { look: t < 43.2 ? [-0.6, 0.1] : t < 44.3 ? [-0.9, 0.2] : t < 45.6 ? [0, -0.5] : [-0.7, 0.2], lid: 0.3, mouth: whisper > 0.3 ? 'talk' : t > 45.5 ? 'smirk' : 'closed', open: whisper > 0.3 ? T.talk(t, 0.2, 9) : 0, brows: [3, -3] };
      let armRb = { hand: [-120, -760], pose: 'relaxed' }, armLb = { hand: [120, -760], pose: 'relaxed' };
      let over = '', crownSvg = '', vialWorld = '', handsB = '';
      // -- the antidote: carried in at his side, turned upright, pushed down into the taster's pouch, let go
      const pouchTop = R.toWorld(tO, [78, -800]);
      const vIn = ss(42.6, 43.0, t), rel = ss(43.0, 43.1, t);
      if (t >= 41.1 && t < 44.15) {
        const start = R.toWorld(bO, [-120, -760]), above = [pouchTop[0], pouchTop[1] - 42], inside = [pouchTop[0], pouchTop[1] + 4];
        const reach = EZ.io(clamp((t - 42.0) / 0.55)), back = EZ.io(clamp((t - 43.1) / 0.75));
        let fp = L2(L2(start, above, reach), inside, EZ.in2(vIn));
        if (rel > 0) fp = L2(inside, start, back);
        const dd = rel > 0 ? nrm(L2([-1, 0], [0.2, 1], back)) : nrm(L2([0.2, 1], [-1, 0], reach));
        const spec = gripAt(bO, 'brother', fp, dd, { facing: 'palm', detachHand: true });
        if (rel >= 0.5) spec.pose = t < 43.5 ? 'open' : 'relaxed'; else spec.hold = PR.vial({ col: '#3a7ad8', level: 0.85 });
        armRb = spec;
      }
      // -- the crown (44.24 - 45.55): hands on its sides, carried from the table onto his own head
      const cp0 = crownRest, csx = A.KS * KFX.w, csy = A.KS * KFX.len, bsx = B.BS * BFX.w, bsy = B.BS * BFX.len;
      const onHead = (o, lift) => { const hp = R.headPt(o, 'man', [0, (-144 + 32 - lift) * BFX.len]); return { p: R.toWorld(o, hp), a: (o.tilt || 0) + (o.sway || 0) }; };
      let crown;
      const lift = TK([[44.55, 0], [45.2, 1, 'io'], [45.45, 1.0]])(t), set2 = ss(45.2, 45.45, t), grab = ss(44.42, 44.52, t), letGo = ss(45.45, 45.55, t);
      if (t < 44.55) crown = { p: cp0.p, a: cp0.a, sx: csx, sy: csy };
      else {
        const hd = onHead(bO, lerp(110, 0, set2));
        crown = { p: L2(cp0.p, hd.p, lift), a: lerp(cp0.a, hd.a, lift), sx: lerp(csx, bsx, lift), sy: lerp(csy, bsy, lift) };
      }
      crownSvg = crownW(crown.p, crown.a, crown.sx, crown.sy);
      if (t > 44.2 && t < 45.9) {
        const sideR = ptOn(crown.p, crown.a, 1, -80 * crown.sx / 1, -16 * crown.sy), sideL = ptOn(crown.p, crown.a, 1, 80 * crown.sx, -16 * crown.sy);
        const ax = rot([1, 0], crown.a * D2R);
        const appr = EZ.io(clamp((t - 44.2) / 0.22)), away = EZ.io(clamp((t - 45.5) / 0.4));
        const gR = gripAt(bO, 'brother', sideR, ax), gL = gripAt(bO, 'brother', sideL, [-ax[0], -ax[1]]);
        const restR = [-120, -760], restL = [120, -760];
        const handR = L2(L2(restR, gR.hand, appr), restR, away), handL = L2(L2(restL, gL.hand, appr), restL, away);
        const pose = grab > 0.5 && letGo < 0.5 ? 'grip' : 'open';
        armRb = { hand: handR, dir: gR.dir, pose, facing: 'back', detachHand: true };
        armLb = { hand: handL, dir: gL.dir, pose, facing: 'back', detachHand: true };
      }
      // -- the golden spoon: lying on the King's plate, picked up, then the hand-over that becomes the first shot
      const restSp = hoSpoon(-1.7, camC(TE - 1.7));
      let sp = tau < -1.7 ? restSp : hoSpoon(Math.min(tau, 0.62), c);
      const spoonSvg = place(PR.spoon({ glint: bump(t, TE - 0.9, 0.9, 0.6) }), sp.p, sp.a, sp.s);
      if (t > 45.6) {
        const gK = ptOn(sp.p, sp.a, sp.s, -42), kd = rot([0, -1], (Math.min(sp.a, 200) - 181) * D2R);
        const g = gripAt(bO, 'brother', gK, kd, { detachHand: true });
        const reach = EZ.io(clamp((t - 45.6) / (TE - 1.7 - 45.6)));
        const pose = tau < -1.78 ? 'open' : 'grip';
        armRb = tau < -1.7 ? { hand: L2([-120, -760], g.hand, reach), dir: g.dir, pose, facing: 'back', detachHand: true } : Object.assign(g, { pose: 'grip' });
      }
      // taster's left hand: on the table edge, then raised, finally open and waiting for the spoon (as in the first shot)
      let armLt = { hand: [120, -760], pose: 'relaxed' };
      if (tau > -1.3) {
        const gT = ptOn(sp.p, sp.a, sp.s, 55), tDir = rot([0, -1], (sp.a - 181) * D2R * 0.9);
        const gs = gripAt(tO, 'taster', gT, tDir, { pose: 'open', facing: 'palm' });
        const u = EZ.io(clamp((tau + 1.3) / 0.6));
        armLt = Object.assign({}, gs, { hand: L2([120, -760], gs.hand, u), detachHand: true });
      }
      const taster = T.taster(Object.assign(tO, { face: tFace, armL: armLt, armR: { hand: [-120, -760], pose: 'relaxed' } }));
      const bro = T.brother(Object.assign(bO, { face: bFace, armR: armRb, armL: armLb, props: PR.dagger(74, -800, 1, 0, 14, 0) }));
      const litB = (svg, info) => C.lit({ svg, info }, Object.assign({ view: X.viewRect(1) }, L)).body;
      handsB = (bro.handR ? litB(bro.handR, bro.info) : '') + (bro.handL ? litB(bro.handL, bro.info) : '') + (taster.handL ? litB(taster.handL, taster.info) : '');
      // the antidote left in the pouch, and the pouch front redrawn over it
      if (rel >= 0.5) vialWorld = place(PR.vial({ col: '#3a7ad8', level: 0.85 }), [pouchTop[0], pouchTop[1] + 4], -90, A.TS);
      const u = 146 / 128, bw = 120, by = -812, bh = 28 * u;
      const pouchD = `M${f(bw * 0.4)},${f(by + bh / 2)} l${f(52 * u)},0 l-3,${f(72 * u)} q${f(-23 * u)},${f(14 * u)} ${f(-46 * u)},0Z`;
      if (t > 42.4 && t < 46.5) over = litB( `<g transform="translate(${f(tO.x)},${f(tO.y)}) scale(${A.TS})"><path d="${pouchD}" fill="#2e1c10" stroke="#1f140c" stroke-width="1.9" vector-effect="non-scaling-stroke"/></g>`, taster.info);
      // guards rush in, the lady screams, the jester drops everything
      const g0 = T.guard(Object.assign(idle(t, 9), { x: lerp(1500, 820, EZ.out2(clamp((t - 40.9) / 0.8))), y: 1780 + sbob(t, 2) * 10 * (t < 41.7 ? 1 : 0), s: 0.55, face: { mouth: 'shout', open: 0.7, look: [-0.7, 0.2] }, armR: { hand: [-150, -1000], pose: 'fist', thumb: 'up' } }), 0);
      const g1 = T.guard(Object.assign(idle(t, 19), { x: lerp(-900, -90, EZ.out2(clamp((t - 41.0) / 0.8))), y: 1780 + sbob(t, 2) * 10 * (t < 41.8 ? 1 : 0), s: 0.55, face: { mouth: t < 43 ? 'shout' : 'tight', open: 0.6, look: [0.7, 0.2] } }), 1);
      const kneel = ss(45.4, 45.9, t);
      const ladyP = lady(t, { stand: 1, tilt: -4, face: { expr: 'fear', mouth: t < 44 ? 'shout' : 'parted', open: 0.6, look: [0.9, 0], wide: true }, armR: { hand: [-230, -1080], pose: 'open', facing: 'palm' }, armL: { hand: [230, -1080], pose: 'open', facing: 'palm' } });
      const items = PR.candelabra(380, 1592, 0.55, t) + PR.plate(plateT[0], plateT[1], 0.55, {}) + PR.plate(plateK[0], plateK[1], 0.6, { meat: true }) + PR.stain(880, 1606, 1, 4, 1.1) + PR.goblet(790, 1618, 0.6, { tip: 100, wine: 0 }) + place(PR.leg({ bite: 1 }), [plateK[0] - 70, 1596], 24, A.KS) + PR.jug(-260, 1618, 0.6);
      const chars = `<g transform="translate(0,${f(kneel * 60)})">${lit(g0, L)}${lit(g1, L)}</g>` + lit(ladyP, L) + throneBack(A.KX, 1560, 0.62) + K.svg + lit(taster, L) + lit(bro, L);
      const layers = [...set.back, { p: 0.86, svg: blur(jester(t, -1050, 1) + walker(t, 1600, -1500, 40.7, 44.5, 9, 'server'), 'dof1') }, { p: 1, svg: chars, chars: true }, ...set.front,
        { p: 1, svg: items + vialWorld + over + (t > 44.15 && t < 45.7 ? armsOver(bro, L) : '') + crownSvg + spoonSvg + handsB }];
      return X.compose(layers, c) + C.vignette(0.42, '#08040a', 0.45);
    }, { grade: 'gFeast' });
    // loop: the last hand-over dissolves into the first one (same spoon, same place on screen)
    X.tr('organic', TE, 0.75, 'CHAOS', 'DIN', { end: true, bOff: -TE, fa: [540, 980], fb: [540, 980], za: 1.0, zb: 1.0, plain: true });
  }
})(window);
