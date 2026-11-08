// "The Pied Piper" part 2: you reach the top of the hill and the music stops: nobody, no footprints, nothing -> the three
// left behind (the lame boy on his crutch, the deaf girl looking about, the blind boy reaching into the air) -> centuries
// later, a father reads the picture book at bedtime -> the real hilltop at dusk, your son's red cap in your hands -> the
// stranger stands on the rock against the sunset and smiles at us -> into his eyes, and he is walking out of the gate
// again (frame 0).
(function (G) {
  const X = G.ENG, Q = G.QCAST, S = G.SETS, PR = G.PROPS, C = G.CINE, R = G.RIG;
  const { track: TK, ss, clamp, lerp, EZ } = X;
  const { f, mix, rng, shade } = R;
  const TAU = Math.PI * 2, D2R = Math.PI / 180;
  const { env, idle, hh, scr, nrm, L2, add, gripAt, fingersFor, handAt, handsLit, CAM, camOn, mixArm, dith, sBlur, litBody, armsOver, drawP, bodyP, insertAt, atP, LT: LT1 } = G.SHOTS_R;
  const LT = Object.assign({}, LT1, {
    hill: { from: [-0.6, -0.8], shadow: '#141a0c', shadowOp: 0.34, floor: '#1a2010', floorOp: 0.26, contactOp: 0.34, key: '#fff6e4', keyAdd: 0.05, rims: [{ from: [-1, -0.4], col: '#fff4dc', w: 7, op: 0.5 }, { from: [1, -0.2], col: '#c8d8f0', w: 5, op: 0.35 }], face: { col: '#fff0e0', op: 0.12 } },
    // sunset at the right: a hot rim, a violet fill
    dusk: { from: [0.9, -0.3], shadow: '#140a18', shadowOp: 0.42, floor: '#1a0c18', floorOp: 0.3, contactOp: 0.4, key: '#ffb880', keyAdd: 0.06, rims: [{ from: [1, -0.2], col: '#ff9a50', w: 10, op: 0.8 }, { from: [-1, -0.3], col: '#8a6ab0', w: 6, op: 0.45 }], face: { col: '#ffc8a0', op: 0.14 } },
    lamp: { from: [0.8, -0.4], shadow: '#100a08', shadowOp: 0.4, floor: '#140c08', floorOp: 0.28, contactOp: 0.38, key: '#ffd8a0', keyAdd: 0.07, rims: [{ from: [1, -0.3], col: '#ffc070', w: 8, op: 0.6 }, { from: [-1, -0.3], col: '#8aa0d8', w: 5, op: 0.35 }], face: { col: '#ffdcb0', op: 0.15 } }
  });

  // ======================================================= TOP: you reach the summit; the music stops; they're gone (25.4 - 31.48)
  // "By the time you reach the top, the music has stopped, and they're gone. No bodies. No footprints. Nothing."
  {
    const B = S.HT, GY = 1612;
    const X0 = TK([[25.4, 1820], [26.6, 2120, 'out']]);
    // (on "No footprints" the camera is well clear of her, so as it pulls back she comes in whole from the left)
    const cam = CAM([[25.4, [1840, 1100, 0]], [26.7, [2120, 1110, 0.2], 'sine'], [27.9, [2140, 1100, 0.3], 'sine'], [28.9, [2380, 1180, -0.3], 'io'], [29.8, [2690, 1450, 0.3], 'io'], [30.6, [2790, 1480, 0], 'sine'], [31.5, [2350, 1180, -0.4], 'io']],
      [[25.4, 1.9], [26.7, 1.95, 'sine'], [27.9, 2.0, 'sine'], [28.9, 0.95, 'io'], [29.8, 1.35, 'io'], [30.6, 1.25, 'sine'], [31.5, 0.66, 'io']]);
    const fn = t => {
      const c = hh(cam(t), t, 0.28, 29), L = LT.hill;
      const set = S.htop(t);
      // she comes over the top panting, a hand pressed to her chest, leaning into the slope; the music stops and she
      // straightens, frozen, eyes left, right, up; it sinks in and her hands come together at her breast
      const run = 1 - ss(26.3, 26.7, t), listen = ss(27.05, 27.25, t), gone = ss(28.3, 28.7, t);
      const look = t < 27.3 ? [0.3, -0.35] : t < 27.8 ? [-0.92, -0.1] : t < 28.3 ? [0.92, -0.1] : t < 28.6 ? [0.1, -0.6] : [0.05, 0.3];
      const pant = 1 - listen;
      const o = Object.assign(idle(t, 31, 0.4), { x: X0(t), y: GY - Math.sin(t * 9) ** 2 * 12 * run, s: 0.62, breath: Math.sin(t * 5.5) * 3.2 * pant + Math.sin(t * 1.6) * 0.6, sway: -3 * run, tilt: 4 * pant * (0.6 + 0.4 * run) - 6 * gone, face: { expr: gone > 0.5 ? 'grief' : listen > 0.5 ? 'fear' : 'anxious', wide: listen > 0.5 && gone < 0.5, tears: 0.5 * ss(28.8, 29.6, t), mouth: gone > 0.5 ? 'cry' : 'parted', open: gone > 0.5 ? 0.06 : 0.16 * pant + 0.08 * pant * Math.sin(t * 5.5) + 0.05 * listen, look, lid: gone > 0.5 ? 0.4 : 0.1 * pant + 0.04, brows: [lerp(-6, -10, listen), lerp(1, -2, listen)] } });
      const side = (sx) => ({ hand: [sx * 150, -790], dir: [-sx * 0.1, 1], pose: 'relaxed', facing: 'back' }), clasp = sx => ({ hand: [sx * 16, -950], dir: [-sx * 0.88, 0.36], pose: 'relaxed', facing: 'back' });
      o.armR = mixArm(mixArm({ hand: [-26, -985], dir: [0.92, -0.25], pose: 'relaxed', facing: 'back' }, side(-1), EZ.io(ss(27.2, 27.6, t))), clasp(-1), EZ.io(ss(28.4, 28.9, t)));
      o.armL = mixArm(mixArm({ hand: [200 + 24 * Math.sin(t * 9) * run, -930], dir: [0.3, 0.9], pose: 'relaxed', facing: 'back' }, side(1), EZ.io(ss(26.2, 26.8, t))), clasp(1), EZ.io(ss(28.45, 28.95, t)));
      const chars = drawP(Q.mother(o), o, Q.motherArt, L);
      return X.compose(insertAt(set, chars, null), c) + C.vignette(0.5) + dith(t);
    };
    X.shot('TOP', 25.4, 31.48, fn, { grade: 'gDay' });
    G.TOP_SKY = tt => scr([2300, 800], cam(tt));
  }
  X.tr('organic', 25.7, 0.6, 'HILL', 'TOP', { seed: 4, freq: 0.0042, za: 1.1, zb: 0.92 });

  // ======================================================= THREE: the three left behind on the path (30.88 - 38.99)
  // "Only three are left behind: one too lame to keep up, one deaf who never heard the song, and one blind who couldn't
  // see where they went."
  {
    // close enough together that the wide frames hold all three, each on the path
    const LO = { x: -950, y: 1814, s: 0.92 }, DO = { x: -380, y: 1792, s: 0.9 }, BO = { x: 220, y: 1762, s: 0.92 };
    const cam = CAM([[30.85, [-370, 1450, 0]], [32.3, [-380, 1460, 0.2], 'sine'], [33.95, [-930, 1340, 0.4], 'io'], [35.5, [-380, 1300, -0.3], 'io'], [37.5, [220, 1260, 0.3], 'io'], [39.0, [222, 1150, 0.4], 'in2']],
      [[30.85, 0.6], [32.3, 0.66, 'sine'], [33.95, 1.35, 'io'], [35.5, 1.35, 'io'], [37.5, 1.4, 'io'], [39.0, 2.1, 'in2']]);
    const BFACE = [BO.x, BO.y - 700 * BO.s];
    // a cloth bandage wound round his left shin, its loose end hanging
    const bandage = (o, s) => {
      const c = R.toWorld(o, [34, -158]), w = 30 * s, h = 46 * s;
      let b = `<rect x="${f(c[0] - w)}" y="${f(c[1] - h)}" width="${f(2 * w)}" height="${f(2 * h)}" rx="${f(8 * s)}" fill="#e2d8c4" stroke="#20140c" stroke-width="1.4"/>`;
      for (let i = 0; i < 4; i++) { const y = c[1] - h + (i + 0.55) * h / 2; b += `<path d="M${f(c[0] - w + 1)},${f(y + 7 * s)} Q${f(c[0])},${f(y - 5 * s)} ${f(c[0] + w - 1)},${f(y - 6 * s)}" stroke="#a89a82" stroke-width="${f(2.4 * s)}" fill="none"/>`; }
      b += `<rect x="${f(c[0] - w)}" y="${f(c[1] - h)}" width="${f(w * 0.7)}" height="${f(2 * h)}" rx="${f(8 * s)}" fill="#5a4a3a" opacity="0.18"/><path d="M${f(c[0] + w * 0.5)},${f(c[1] + h * 0.3)} q${f(14 * s)},${f(22 * s)} ${f(4 * s)},${f(46 * s)}" stroke="#e2d8c4" stroke-width="${f(9 * s)}" fill="none" stroke-linecap="round"/>`;
      return b;
    };
    const fn = t => {
      const c = hh(cam(t), t, 0.28, 31), L = LT.hill;
      const set = S.htop(t);
      let g = '';
      // the lame boy: his crutch under his right arm (pad in the armpit, foot planted out to the side, fist on the
      // handle), crying, looking up the hill where they went
      {
        const s = LO.s;
        const o = Object.assign(idle(t, 41, 0.3), LO, { sway: -2, face: { expr: 'grief', tears: 0.75, look: [0.6, -0.6], lid: 0.3, brows: [-11, 3] } });
        const pad = R.toWorld(o, [-84, -566]), foot = [LO.x - 205 * s, LO.y + 4], v = [pad[0] - foot[0], pad[1] - foot[1]], len = Math.hypot(v[0], v[1]), ax = [v[0] / len, v[1] / len];
        o.armR = gripAt(o, 'lame', add(foot, v, 330 / 560), fingersFor('R', 'back', ax), { detachHand: true });
        o.armL = { hand: [130, -330], dir: [-0.1, 1], pose: 'relaxed', facing: 'back' };
        const P = Q.lame(o);
        g += PR.crutch(foot[0], foot[1], len / 560, Math.atan2(v[0], -v[1]) / D2R) + drawP(P, o, null, L) + bandage(o, s) + handsLit(P, L, 'R');
      }
      // the deaf girl: she never heard it; she looks about, puzzled, hands half raised
      {
        const look = t < 34.9 ? [0.4, -0.2] : t < 35.5 ? [-0.92, -0.1] : t < 36.1 ? [0.92, -0.1] : [0.1, -0.5];
        const o = Object.assign(idle(t, 43, 0.3), DO, { tilt: 4 * Math.sin(t * 1.3), face: { expr: 'anxious', mouth: 'parted', open: 0.05, look, lid: 0.08, brows: [-7, 1] }, armR: { hand: [-170, -420], dir: [-0.3, 0.9], pose: 'open', facing: 'palm' }, armL: { hand: [170, -420], dir: [0.3, 0.9], pose: 'open', facing: 'palm' } });
        g += drawP(Q.deaf(o), o, Q.deafArt, L);
      }
      // the blind boy: his stick on the path, his other hand feeling the empty air, his face turned up to the sun
      {
        const s = BO.s, tipW = [BO.x + 190 * s, BO.y + 4], gripW = [BO.x + 160 * s, BO.y - 330 * s], ax = nrm([tipW[0] - gripW[0], tipW[1] - gripW[1]]);
        const reach = Math.sin(t * 1.1) * 0.5 + 0.5;
        const o = Object.assign(idle(t, 47, 0.3), BO, { tilt: -7, face: { expr: 'neutral', mouth: 'parted', open: 0.04, look: [0.05, -0.75], lid: 0.42, brows: [-4, 1] } });
        o.armL = gripAt(o, 'blind', gripW, fingersFor('L', 'back', [-ax[0], -ax[1]]), { detachHand: true });
        o.armR = { hand: [-250 - 20 * reach, -540 - 30 * reach], dir: [-0.85, -0.3], pose: 'open', facing: 'palm' };
        const P = Q.blind(o), rot = Math.atan2(-ax[0], ax[1]) / D2R, kk = Math.hypot(tipW[0] - gripW[0], tipW[1] - gripW[1]) / 420;
        g += drawP(P, o, null, L) + `<g transform="translate(${f(gripW[0])},${f(gripW[1])}) rotate(${f(rot)})">${PR.stick(kk)}</g>` + handsLit(P, L, 'L');
      }
      return X.compose(insertAt(set, g, null), c) + C.vignette(0.5) + dith(t);
    };
    X.shot('THREE', 30.88, 38.99, fn, { grade: 'gDay' });
    G.THREE_PATH = tt => scr([-400, 1500], cam(tt));
    G.THREE_BFACE = tt => scr(BFACE, cam(tt));
  }
  X.tr('zmatch', 31.18, 0.6, 'TOP', 'THREE', { fa: G.TOP_SKY(31.18), fb: G.THREE_PATH(31.18), za: 2.4, zb: 2.2, leak: '#fff4dc', leakOp: 0.3 });

  // ======================================================= BED: centuries later, a father reads the story (38.39 - 42.29)
  // "Centuries later, the world turns it into a bedtime story."
  {
    // the father sits on the bed beside the child, a grown man's size (his legs are behind the quilt and the floor)
    const B = S.HB, CO = { x: 700, y: 1594, s: 0.9 }, FO = { x: 1110, y: 1872, s: 0.86 }, BK = [1110, 1110], BS = 0.5;
    const PAGE = [BK[0] - 160 * BS, BK[1] - 190 * BS];
    const cam = CAM([[38.35, [820, 1210, 0]], [39.9, [930, 1110, 0.3], 'sine'], [41.75, [PAGE[0] + 8, PAGE[1] + 4, 0.2], 'io'], [42.35, [PAGE[0] + 8, PAGE[1] + 4, 0.2], 'out']], [[38.35, 0.86], [39.9, 1.25, 'sine'], [41.75, 3.3, 'io'], [42.35, 3.6, 'out']]);
    const fn = t => {
      const c = hh(cam(t), t, 0.25, 37), L = LT.lamp;
      const set = S.bedroom(t);
      // the child, nearly asleep, watching the pictures; the father reading aloud, then glancing at the child
      const oC = Object.assign(idle(t, 51, 0.2), CO, { tilt: 8, face: { mouth: 'smile', lid: 0.55 + 0.1 * Math.sin(t * 0.8), look: [0.75, 0.15], brows: [-2, 0] }, armR: { hand: [-60, -420], dir: [0.8, 0.4], pose: 'relaxed', facing: 'back' }, armL: { hand: [60, -420], dir: [-0.8, 0.4], pose: 'relaxed', facing: 'back' } });
      const glance = env(t, 40.2, 40.4, 41.0, 41.2);
      const oF = Object.assign(idle(t, 53, 0.2), FO, { tilt: -6, face: { mouth: 'talk', open: Q.talk(t, 0.18, 6), look: glance > 0.5 ? [-0.9, 0.1] : [-0.1, 0.65], lid: 0.32 } });
      oF.armR = handAt(oF, [BK[0] - 118 * BS * 2.4, BK[1] - 6], [0.3, 1], { pose: 'relaxed', detachHand: true });
      oF.armL = handAt(oF, [BK[0] + 118 * BS * 2.4, BK[1] - 6], [-0.3, 1], { pose: 'relaxed', detachHand: true });
      const PF = Q.reader(oF);
      const g = atP(0.97, () => drawP(Q.child(oC), oC, null, L) + drawP(PF, oF, Q.readerArt, L) + PR.storybook(BK[0], BK[1], BS, t) + handsLit(PF, L));
      return X.compose(insertAt(set, g, 'quilt', 0.97), c) + C.vignette(0.55) + dith(t);
    };
    X.shot('BED', 38.39, 42.29, fn, { grade: 'gNight' });
    G.BED_CHILD = tt => scr([CO.x, CO.y - 640 * CO.s], cam(tt), 0.97);
    G.BED_PAGE = tt => scr(PAGE, cam(tt), 0.97);
  }
  X.tr('morph', 38.69, 0.6, 'THREE', 'BED', { fa: G.THREE_BFACE(38.69), fb: G.BED_CHILD(38.69), za: 1.35, zb: 1.3, col: '#ffe8c8' });

  // ======================================================= REAL: the hilltop at dusk, your son's red cap in your hands (41.69 - 45.19)
  // "But the children were real. Your son was real."
  {
    const MO = { x: 2250, y: 1612, s: 0.62 }, CAP = [2250, 1612 - 960 * 0.62];
    const cam = CAM([[41.65, [2200, 1150, 0]], [43.4, [2240, 1060, 0.2], 'sine'], [45.2, [2252, 1010, 0.3], 'io']], [[41.65, 0.9], [43.4, 1.4, 'sine'], [45.2, 2.35, 'io']]);
    const fn = t => {
      const c = hh(cam(t), t, 0.25, 41), L = LT.dusk;
      const set = S.htop(t, { dusk: 1 });
      const o = Object.assign(idle(t, 31, 0.3), MO, { tilt: 7, sway: 0.8 * Math.sin(t * 0.9), face: { expr: 'grief', tears: 0.85, mouth: 'cry', open: 0.06, look: [0, 0.75], lid: 0.48, brows: [-11, 3] } });
      o.armR = handAt(o, [CAP[0] - 62, CAP[1] - 10], [0.55, 0.84], { pose: 'relaxed', detachHand: true });
      o.armL = handAt(o, [CAP[0] + 62, CAP[1] - 10], [-0.55, 0.84], { pose: 'relaxed', detachHand: true });
      const P = Q.mother(o);
      const g = drawP(P, o, Q.motherArt, L) + PR.redCap(CAP[0], CAP[1] + 26, 0.62, 3 * Math.sin(t)) + handsLit(P, L);
      return X.compose(insertAt(set, g, null), c) + C.vignette(0.58) + dith(t);
    };
    X.shot('REAL', 41.69, 45.19, fn, { grade: 'gDusk' });
    G.REAL_CAP = tt => scr(CAP, cam(tt));
  }
  // the painted story melts into the real hill
  X.tr('liquid', 41.99, 0.6, 'BED', 'REAL', { fa: G.BED_PAGE(41.99), fb: G.REAL_CAP(41.99), col: '#e8b070', seed: 14 });

  // ======================================================= REVEAL: the stranger on the rock against the sunset (44.59 - end)
  // "And the stranger who took them is still known everywhere as the Pied Piper of Hamelin."
  {
    const P85 = 0.85, PO = { x: 2700, y: 882, s: 0.42 }, FACE = [2700, 882 - 1290 * 0.42];
    const tgt = (x, y) => camOn(x, y, P85);
    const cam = CAM([[44.55, [...tgt(2700, 660), 0]], [47.0, [...tgt(2700, 520), 0.2], 'sine'], [49.0, [...tgt(2700, FACE[1] + 18), 0.3], 'io'], [49.75, [...tgt(2700, FACE[1] + 14), 0.3], 'out']],
      [[44.55, 1.05], [47.0, 1.85, 'sine'], [49.0, 4.2, 'io'], [49.75, 4.7, 'out']]);
    const fn = t => {
      const c = hh(cam(t), t, 0.22, 43), L = LT.dusk;
      const set = S.htop(t, { dusk: 1 });
      // he holds the pipe loosely at his side, the wind in his cape and feather; his eyes find us and he smiles
      const s = PO.s, d = [0.08, 1], k = 1.36 * s, Lp = PR.PIPE_L * k, G0 = R.toWorld(PO, [-176, -720]), top = add(G0, d, -Lp * 0.46);
      // (as his name is said: a slow sly smirk, lids lowered, brows down and drawn in, eyes straight into ours)
      const sly = ss(47.0, 48.4, t);
      const o = Object.assign(idle(t, 9, 0.3), PO, { tilt: lerp(-2, 5, ss(46.5, 48.5, t)), face: { mouth: sly > 0.5 ? 'smirk' : 'smile', look: t < 46.2 ? [-0.4, 0.3] : [0, -0.08], lid: lerp(0.26, 0.3, sly), brows: [lerp(1, 7, sly), lerp(-1, -4, sly)] } });
      o.armR = gripAt(o, 'piper', G0, fingersFor('R', 'back', [-d[0], -d[1]]), { detachHand: true });
      o.armL = { hand: [150, -800], dir: [-0.2, 1], pose: 'relaxed', facing: 'back' };
      const P = Q.piper(o), rot = Math.atan2(-d[0], d[1]) / D2R;
      const g = atP(P85, () => drawP(P, o, Q.piperArt(0.5 * Math.sin(t * 1.6)), L) + `<g transform="translate(${f(top[0])},${f(top[1])}) rotate(${f(rot)})">${PR.pipe(k, t)}</g>` + handsLit(P, L, 'R'));
      const i = set.findIndex(l => l.p === P85) + 1;
      const layers = [...set.slice(0, i), { p: P85, svg: g, chars: true }, ...set.slice(i)];
      return X.compose(layers, c) + C.vignette(0.6) + dith(t);
    };
    X.shot('REVEAL', 44.59, X.T_END + 0.1, fn, { grade: 'gDusk' });
    G.REVEAL_FACE = tt => scr(FACE, cam(tt), P85);
  }
  X.tr('carry', 44.89, 0.6, 'REAL', 'REVEAL', { mode: 'tilt', dir: [0, -1], dist: 0.45, blur: 12 });
  // the loop: into his eyes, and out of the sunlit arch he comes again (frame 0)
  X.tr('zmatch', X.T_END, 0.62, 'REVEAL', 'GATE', { end: true, bOff: -X.T_END, fa: G.REVEAL_FACE(X.T_END - 0.3), fb: G.GATE_PIPER(-0.3), za: 2.6, zb: 2.6, leak: '#ffe0b0', leakOp: 0.4 });
})(window);
