// "The Whipping Boy": 21 shots across 11 locations. Smooth motion only (eased tracks, sines, cosine bounces).
(function (G) {
  const X = G.ENG, W = G.WCAST, K0 = G.CAST, S = G.SETS, PR = G.PROPS, C = G.CINE, R = G.RIG;
  const { track: TK, ss, clamp, lerp, EZ } = X;
  const { f, mix } = R;
  const TAU = Math.PI * 2;
  const wave = (t, hz, ph = 0) => Math.sin(TAU * hz * t + ph);
  const bob = (t, hz, ph = 0) => 0.5 - 0.5 * Math.cos(TAU * hz * t + ph);
  const env = (t, a, b, c, d) => ss(a, b, t) * (1 - ss(c, d, t));
  const idle = (t, seed, amp = 1) => ({ blink: W.blink(t, seed), breath: W.breath(t * 1.1 + seed), sway: X.noise(t * 0.45, seed) * 0.5 * amp });
  const bump = (t, t0, a = 1, len = 0.35) => (t < t0 || t > t0 + len) ? 0 : a * Math.pow(Math.sin(Math.PI * (t - t0) / len), 2);
  const hh = (c, t, amp = 1, seed = 0) => { const h = X.hand(t, amp, seed); return (X.CAM = [c[0] + h[0], c[1] + h[1], c[2], (c[3] || 0) + h[2]]); };
  const scr = (wx, wy, c, p = 1) => { const [cx, cy, z] = c, zp = Math.pow(z, p), px = 540 + (cx - 540) * p, py = 960 + (cy - 960) * p; return [540 + (wx - px) * zp, 960 + (wy - py) * zp]; };
  const loc = (p, x, y, s) => [(p[0] - x) / s, (p[1] - y) / s];
  const lit = X.lit;
  const blur = (svg, id) => `<g filter="url(#${id})">${svg}</g>`;
  // a full-height wall of hedge leaves for the garden wipe
  const E_hedgeWipe = x => { let g = ''; for (let yy = -300; yy < 2300; yy += 150) for (let k = -4; k <= 4; k++) g += `<circle cx="${f(x + k * 140 + ((yy / 150) % 2) * 70)}" cy="${yy}" r="110" fill="${k % 2 ? '#2e4a26' : '#3a5a30'}"/>`; return g; };
  const L3 = {
    day: { from: [-0.9, -0.6], shadow: '#3a3848', shadowOp: 0.48, mid: 0.45, floor: '#4a4250', floorOp: 0.38, contactOp: 0.45, cast: [0.35, 0.1], castOp: 0.25, keyAdd: 0.08, key: '#fff4e6', rims: [{ from: [1, -0.5], col: '#eef2ff', w: 6, op: 0.5 }], face: { col: '#fff4e8', op: 0.15 } },
    chapel: { from: [0, -1], shadow: '#3a2e30', shadowOp: 0.5, floor: '#4a3a30', floorOp: 0.35, key: '#ffe0a0', keyAdd: 0.16, contactOp: 0.4, rims: [{ from: [-1, -0.7], col: '#ffe8b0', w: 7, op: 0.7 }, { from: [1, -0.7], col: '#ffe8b0', w: 7, op: 0.7 }], face: { col: '#fff0c8', op: 0.25 } },
    room: { from: [-1, -0.7], shadow: '#2a2836', shadowOp: 0.52, mid: 0.42, floor: '#3a3440', floorOp: 0.35, key: '#fff0d8', keyAdd: 0.1, contactOp: 0.5, rims: [{ from: [-1, -0.6], col: '#fff0d0', w: 7, op: 0.6 }, { from: [1, -0.4], col: '#ffb070', w: 5, op: 0.35 }], face: { col: '#fff0dc', op: 0.2 } },
    dim: { from: [-1, -0.5], shadow: '#1e1c2a', shadowOp: 0.62, floor: '#2a2430', floorOp: 0.35, key: '#ffd8b0', keyAdd: 0.08, contactOp: 0.5, rims: [{ from: [-1, -0.6], col: '#d8e0ff', w: 7, op: 0.55 }, { from: [1, -0.3], col: '#ffa060', w: 6, op: 0.45 }], face: { col: '#ffe0c0', op: 0.18 } },
    attic: { from: [0, -1], shadow: '#2a2030', shadowOp: 0.55, floor: '#2a2028', floorOp: 0.35, key: '#ffe8c8', keyAdd: 0.1, contactOp: 0.45, rims: [{ from: [-0.4, -1], col: '#fff0d8', w: 9, op: 0.8 }, { from: [0.4, -1], col: '#fff0d8', w: 9, op: 0.8 }], face: { col: '#ffe8d0', op: 0.15 } },
    street: { from: [-0.5, -1], shadow: '#3a4048', shadowOp: 0.5, floor: '#3a3a40', floorOp: 0.35, contactOp: 0.5, rims: [{ from: [1, -0.6], col: '#dfe6ee', w: 5, op: 0.4 }], face: { col: '#eef2f8', op: 0.1 } },
    corr: { from: [0, -0.4], shadow: '#221c2a', shadowOp: 0.55, floor: '#2a2228', floorOp: 0.35, key: '#ffa060', keyAdd: 0.1, contactOp: 0.5, rims: [{ from: [-1, -0.3], col: '#ff9a50', w: 7, op: 0.7 }, { from: [1, -0.3], col: '#ff9a50', w: 7, op: 0.7 }], face: { col: '#ffb070', op: 0.2 } },
  };
  const spear = sx => `<path d="M${sx},-1700 L${sx},60" stroke="#4a3220" stroke-width="16"/><path d="M${sx},-1700 l-18,40 l18,-110 l18,110Z" fill="#9aa0a8" stroke="#1f140c" stroke-width="2"/>`;
  const purse = (x, y, s, r = 0) => PR.purse(x, y, s, r, '#7a4a26');
  // stage helper for classroom-style sets that return { back, front }
  const stageBF = (set, chars, extraFront = []) => [...set.back, { p: 1, svg: chars, chars: true }, ...set.front, ...extraFront];

  // ======================================================= S1  the castle gate (0 - 2.60) and loop landing
  const camS1 = TK([[0, [540, 1440, 1.18, 0]], [2.9, [545, 1360, 1.38, 0], 'sine']]);
  {
    const KX = 430, KY = 1770, KS = 0.55, BX = 600, BY = 1785, BS = 0.6;
    const headTop = [BX - 8, BY - 870 * BS + 26];
    const kHand = TK([[0, headTop], [1.15, [headTop[0] + 4, headTop[1] + 4]], [1.75, [KX + 420 * KS, KY - 1250 * KS], 'io'], [2.4, [KX + 440 * KS, KY - 1290 * KS], 'sine']]);
    const bLook = TK([[0, [-0.4, -0.85]], [0.7, [0.45, -0.8], 'io'], [1.4, [0.1, -0.9], 'io'], [1.8, [-0.6, -0.4], 'io']]);
    X.shot('S1', 0, 2.60, t => {
      const c = hh(camS1(t), t, 0.5, 1);
      const set = S.gate(t);
      let ch = '';
      // guards snap to attention, crowd watches behind the ropes
      for (const [gx, sd] of [[325, -1], [755, 1]]) {
        const up = ss(0.3, 0.6, t);
        const g = W.guard(Object.assign(idle(t, 9 + sd), { x: gx, y: 1600, s: 0.42, face: { look: [-sd * 0.4, 0.2] },
          [sd < 0 ? 'armL' : 'armR']: { hand: [sd * -150 * (1 - up * 0.3), lerp(-760, -980, up)], pose: 'fist', facing: 'back', thumb: 'up' },
          props: spear(sd * -150 * (1 - up * 0.3)) }));
        ch += blur(lit(g, L3.day, 1), 'dof1');
      }
      const kHW = kHand(t);
      const king = W.king(Object.assign(idle(t, 2), { x: KX, y: KY, s: KS, tilt: 2 + wave(t, 0.3) * 1.5,
        face: { look: t < 1.3 ? [0.6, 0.55] : [0.25, -0.3], mouth: 'smirk', lid: 0.4 + env(t, 1.6, 1.8, 2.3, 2.5) * 0.12 },
        armL: { hand: loc(kHW, KX, KY, KS), pose: t < 1.2 ? 'relaxed' : 'open', facing: t < 1.2 ? 'back' : 'palm' } }));
      const boy = W.boy(Object.assign(idle(t, 1), { rags: true, x: BX, y: BY, s: BS, tilt: -4 + wave(t, 0.4) * 2,
        face: { expr: 'anxious', mouth: 'parted', open: 0.12, look: bLook(t), brows: [-6, -7], lid: 0.12 } }));
      ch += lit(king, L3.day) + lit(boy, L3.day);
      // villagers behind the ropes at the sides
      const crowd = [[-160, 0, 'm'], [40, 1, 'c'], [1050, 2, 'c'], [1250, 3, 'm']].map(([x, i, k]) => {
        const p = Object.assign(idle(t, 20 + i), { x, y: 1930, s: 0.6, tilt: wave(t, 0.5, i) * 3, face: { look: [x < 540 ? 0.6 : -0.6, -0.3], mouth: i === 1 ? 'parted' : 'closed' } });
        if (i === 1) p.armR = { hand: [-160, -1230 + wave(t, 1.2) * 20], pose: 'point', facing: 'back' };
        return lit(k === 'm' ? K0.mother(Object.assign(p, { tunic: ['#6a5a40', '#5a6040'][i % 2], wimple: '#d8cfbd' })) : W.courtier(Object.assign(p, { tunic: ['#6a5a3e', '#5a4a3a', '#4a4a3a'][i % 3], sleeve: '#5a4a34', legs: '#3a3028' }), i), L3.day);
      }).join('');
      const layers = X.stage(set, ch);
      layers.push({ p: 1.12, svg: blur(crowd, 'dof2') + `<g filter="url(#dof2)"><path d="M-500,1720 Q-150,1760 200,1720 M880,1720 Q1200,1760 1550,1720" stroke="#c8b890" stroke-width="10" fill="none"/></g>` });
      return X.compose(layers, c);
    }, { grade: 'gDay' });
  }
  X.tr('carry', 2.60, 0.6, 'S1', 'S2', { dir: [1, 0], dist: 0.48, blur: 12 });

  // ======================================================= S2  dressed in silk (2.60 - 3.80)
  {
    const cam = TK([[2.3, [540, 1360, 1.25, 0]], [4.1, [540, 1320, 1.42, 0], 'sine']]);
    const BX = 540, BY = 1800, BS = 0.75;
    X.shot('S2', 2.60, 3.80, t => {
      const c = hh(cam(t), t, 0.5, 2);
      const set = S.dressing(t);
      const silk = t >= 3.12, wipeX = lerp(1900, -900, EZ.io(clamp((t - 2.88) / 0.5)));
      const admire = ss(3.3, 3.6, t);
      const boy = W.boy(Object.assign(idle(t, 1), { rags: !silk, x: BX, y: BY, s: BS, sway: silk ? wave(t, 0.7) * 2 * admire : 0,
        face: silk ? { expr: 'neutral', mouth: 'smile', look: [0, lerp(0.8, -0.1, ss(3.45, 3.7, t))], brows: [-5, -6], lid: 0.2 } : { expr: 'anxious', look: [0.4, 0.2], mouth: 'closed' },
        armR: { hand: [lerp(-104, -200, admire), lerp(-430, -470, admire)], pose: admire > 0.5 ? 'open' : 'relaxed', facing: admire > 0.5 ? 'palm' : 'back' },
        armL: { hand: [lerp(104, 200, admire), lerp(-430, -470, admire)], pose: admire > 0.5 ? 'open' : 'relaxed', facing: admire > 0.5 ? 'palm' : 'back' } }));
      // the tailor measures, the maid holds up a bolt of silk
      const mt = wave(t, 0.9);
      const tailor = W.courtier(Object.assign(idle(t, 4), { x: 840, y: 1850, s: 0.62, tilt: 6, sway: -3, face: { look: [-0.8, 0.4], lid: 0.45, mouth: 'tight' },
        armR: { hand: [-330, -900 + mt * 20], pose: 'fist', facing: 'back', thumb: 'up' }, armL: { hand: [-200, -980 + mt * 10], pose: 'fist', facing: 'back', thumb: 'up' } }), 2);
      const maid = W.maid(Object.assign(idle(t, 6), { x: 230, y: 1850, s: 0.62, tilt: -4, face: { expr: 'neutral', mouth: 'smile', look: [0.7, 0.2], lid: 0.35 },
        armR: { hand: [180, -1000], pose: 'fist', facing: 'back', thumb: 'up' }, armL: { hand: [300, -960], pose: 'fist', facing: 'back', thumb: 'up' },
        props: `<g transform="translate(240,-1000)"><path d="M-70,0 L70,0 L80,320 Q0,${f(340 + wave(t, 1.3) * 10)} -80,320Z" fill="#a01e30" filter="url(#cloth)" stroke="#1f140c" stroke-width="2"/></g>` }));
      const tp = loc([BX + 70, BY - 400 * BS], 840, 1850, 0.62);
      const ch = lit(maid, L3.day) + lit(boy, L3.day) + lit(tailor, L3.day) + `<g transform="translate(840,1850) scale(0.62)">${PR.tape(-330, -900 + mt * 20, tp[0], tp[1])}</g>`;
      const layers = X.stage(set, ch);
      if (t > 2.85 && t < 3.45) layers.push({ p: 1.0, svg: PR.silk(wipeX, 1250, 1500, 1500, t, '#2c6d8c') });
      return X.compose(layers, c);
    }, { grade: 'gDay' });
  }
  X.tr('carry', 3.80, 0.55, 'S2', 'S3', { mode: 'zoom', k: 0.7, blur: 4 });

  // ======================================================= S3  the Prince's best friend; "only one catch" (3.80 - 7.17)
  {
    const cam = TK([[3.6, [520, 1410, 1.24, 0]], [5.6, [530, 1400, 1.35, 0], 'sine'], [7.3, [640, 1320, 2.3, 0], 'in2']]);
    const BX = 420, PX = 640, Y = 1890, CS = 0.68;
    const shoulder = [BX + 72.6 * CS + 4, Y - 575 * CS - 12];
    const pHand = TK([[4.6, [PX - 60, Y - 380]], [5.05, shoulder, 'io']]);
    X.shot('S3', 3.80, 7.17, t => {
      const c = hh(cam(t), t, 0.5, 3);
      const set = S.palace(t, { bc: '#5a2a7a', bs: '#8e1e28' });
      const sly = ss(5.9, 6.4, t), friends = ss(4.95, 5.2, t);
      const king = W.king(Object.assign(idle(t, 2), { x: 540, y: 1450, s: 0.55, tilt: 2,
        face: { look: [0, 0.5], mouth: 'smirk', lid: 0.45 },
        armR: { hand: [-260, -1000 + wave(t, 0.6) * 15], pose: 'open', facing: 'palm' }, armL: { hand: [260, -1000 + wave(t, 0.6, 1) * 15], pose: 'open', facing: 'palm' } }));
      const boy = W.boy(Object.assign(idle(t, 1), { x: BX, y: Y, s: CS, tilt: friends * 4,
        face: { expr: 'anxious', mouth: friends > 0.5 ? 'smile' : 'closed', look: [0.7, friends > 0.5 ? 0.1 : 0.3], brows: [-6, -2], lid: 0.2 } }));
      const ph = pHand(t);
      const prince = W.prince(Object.assign(idle(t, 5), { x: PX, y: Y, s: CS, tilt: -3 - sly * 4,
        face: { mouth: friends > 0.5 && sly < 0.5 ? 'grin' : 'smirk', look: sly > 0.3 ? [0, 0] : (t < 4.9 ? [-0.7, 0.4] : [-0.2, 0]), lid: lerp(0.42, 0.6, sly), brows: [lerp(3, 9, sly), lerp(-5, -11, sly)] },
        armR: { hand: loc(ph, PX, Y, CS), pose: t > 5.0 ? 'relaxed' : 'relaxed', facing: 'back' } }));
      const dark = sly * 0.35;
      const ch = blur(lit(king, L3.day), 'dof1') + lit(boy, L3.day) + lit(prince, L3.day);
      const layers = X.stage(set, ch);
      layers.push({ p: 1, svg: `<rect x="-1000" y="-500" width="3200" height="3200" fill="#0a0814" opacity="${f(dark)}" style="mix-blend-mode:multiply"/>`, light: true });
      return X.compose(layers, c);
    }, { grade: 'gDay' });
  }
  X.tr('carry', 7.17, 0.6, 'S3', 'S5', { dir: [0, -1], dist: 0.45, blur: 12, leak: '#ffe8a0', leakOp: 0.4, leakAt: [540, 300] });

  // ======================================================= S5  the chapel: "sacred blood" (7.17 - 9.40)
  {
    const cam = TK([[7.0, [540, 1180, 1.0, 0]], [9.6, [540, 1300, 1.28, 0], 'sine']]);
    X.shot('S5', 7.17, 9.40, t => {
      const c = hh(cam(t), t, 0.4, 5);
      const set = S.chapel(t);
      const bless = env(t, 7.6, 8.0, 9.2, 9.6);
      const prince = W.prince(Object.assign(idle(t, 5), { x: 540, y: 1530, s: 0.6, tilt: -4, face: { mouth: 'smirk', lid: 0.68, look: [0, -0.2], brows: [2, -6] } }));
      const bishop = W.tutor(Object.assign(idle(t, 7), { x: 790, y: 1520, s: 0.58, tunic: '#efe6d4', sleeve: '#e8dcc6', cap: '#c9a040', hair: '#e8e4dc', beard: '#efece6', brow: '#efece6',
        face: { expr: 'neutral', lid: 0.6, look: [-0.7, 0.3], mouth: 'talk', open: 0.1 + bless * W.talk(t, 0.5, 6) },
        armR: { hand: [lerp(-150, -330, bless), lerp(-900, -1250, bless)], pose: 'open', facing: 'palm' } }));
      let kneel = '';
      for (const [x, y, i] of [[150, 2090, 0], [930, 2090, 1], [-90, 2240, 2], [1170, 2240, 0]]) {
        const bowK = 0.6 + 0.4 * bob(t, 0.35, i);
        kneel += lit(W.courtier(Object.assign(idle(t, 30 + i), { x, y, s: 0.85, tilt: 10 + bowK * 8, sway: (x < 540 ? 1 : -1) * 4 * bowK, face: { lid: 0.85, mouth: 'closed' },
          armR: { hand: [-40, -1000], pose: 'relaxed', facing: 'back' }, armL: { hand: [40, -1000], pose: 'relaxed', facing: 'back' } }), i), L3.chapel);
      }
      const ch = lit(prince, L3.chapel) + lit(bishop, L3.chapel) + C.bloom(540, 1180, 220, '#ffe8a0', 0.35 + bless * 0.2);
      const layers = X.stage(set, ch);
      layers.splice(layers.length - 1, 0, { p: 1.05, svg: blur(kneel, 'dof1') });
      return X.compose(layers, c);
    }, { grade: 'gDay' });
  }
  X.tr('carry', 9.40, 0.6, 'S5', 'S6', { dir: [-1, 0], dist: 0.45, blur: 12 });

  // ======================================================= S6  the garden: no adult may touch him (9.40 - 11.86)
  {
    const cam = TK([[9.2, [520, 1400, 1.3, 0]], [10.6, [540, 1390, 1.38, 0], 'sine'], [12.1, [580, 1370, 1.48, 0], 'sine']]);
    const PX = 400, PY = 1830, PS = 0.68, MX = 730, MY = 1850, MS = 0.62;
    const mHand = TK([[9.6, [-150, -760]], [10.25, [-260, -1420], 'out'], [11.25, [-260, -1420]], [11.86, [-150, -800], 'io']]);
    X.shot('S6', 9.40, 11.86, t => {
      const c = hh(cam(t), t, 0.5, 6);
      const set = S.garden(t);
      const kick = bump(t, 9.75, 1, 0.4), smash = clamp((t - 9.92) / 0.7), freeze = env(t, 10.25, 10.35, 11.2, 11.5);
      const prince = W.prince(Object.assign(idle(t, 5), { x: PX, y: PY - kick * 18, s: PS, sway: -kick * 6, tilt: -3 + freeze * 3,
        face: { mouth: t > 10.4 ? 'grin' : 'snarl', look: t > 10.2 ? [0.8, -0.2] : [-0.6, 0.6], lid: 0.4, brows: [6, -8] },
        armL: { hand: [150, -560], pose: 'fist', facing: 'back' }, armR: { hand: [-150 - kick * 60, -560 + kick * 40], pose: 'fist', facing: 'back' } }));
      const tremble = freeze * wave(t, 6) * 6;
      const maid = W.maid(Object.assign(idle(t, 6), { x: MX, y: MY, s: MS, tilt: -freeze * 5,
        face: { expr: 'anxious', mouth: freeze > 0.3 || t > 9.95 ? 'parted' : 'closed', look: freeze > 0.5 ? [0.8, -0.1] : [-0.7, 0.3], brows: [lerp(8, -9, freeze), lerp(-3, -2, freeze)], lid: 0.2, wide: freeze > 0.5 },
        armR: { hand: [mHand(t)[0] + tremble, mHand(t)[1]], pose: 'open', facing: 'palm' }, armL: { hand: [60, -980], pose: 'relaxed', facing: 'back' } }));
      const glare = ss(10.3, 10.7, t);
      const guard = W.guard(Object.assign(idle(t, 9), { x: 1020, y: 1760, s: 0.55, sway: -glare * 3, face: { look: [-0.9, 0], brows: [10, -4], lid: 0.38 },
        armR: { hand: [-150, -1000], pose: 'fist', facing: 'back', thumb: 'up' }, props: spear(-150) }));
      const ch = S.urn(240, 1740, 0.9, smash) + lit(guard, L3.day) + lit(prince, L3.day) + lit(maid, L3.day);
      return X.compose(X.stage(set, ch), c);
    }, { grade: 'gDay' });
  }
  X.tr('wipe', 11.86, 0.6, 'S6', 'S7', { dir: 1, truck: 260, obj: (x) => `<g filter="url(#dof3)"><rect x="${f(x - 620)}" y="-300" width="1240" height="2600" fill="#22381c"/>${E_hedgeWipe(x)}</g>` });

  // ======================================================= S7  classroom: refuses to study, breaks a window (11.86 - 15.62)
  {
    const cam = TK([[11.6, [560, 1390, 1.36, 0]], [14.5, [470, 1405, 1.46, 0], 'sine'], [15.2, [260, 1030, 1.16, 0], 'io'], [15.9, [230, 990, 1.22, 0], 'sine']]);
    const PX = 420, PY = 1768, PS = 0.66, TX = 820, TY = 1810, TS = 0.6;
    const bookP = TK([[12.85, [420, 1540, 0]], [13.15, [330, 1500, -30], 'out'], [13.75, [190, 1800, -170], 'in2']]);
    const throwT = 14.78, hitT = 15.12, win = [130, 830];
    X.shot('S7', 11.86, 15.62, t => {
      const c = hh(cam(t), t, 0.5, 7);
      const broken = ss(hitT, hitT + 0.08, t);
      const set = S.classroom(t, { tableFront: true, book: false, broken, bench: false });
      const shove = env(t, 12.75, 12.95, 13.3, 13.6), refuse = ss(13.4, 13.7, t) * (1 - ss(14.25, 14.4, t));
      const grab = env(t, 14.3, 14.55, 14.78, 14.95), wind = env(t, 14.55, 14.7, 14.78, 14.9);
      const rHand = [lerp(lerp(-150, -60, shove), 212, grab) - wind * 80, lerp(lerp(-335, -355, shove), -340, grab) - wind * 170];
      const prince = W.prince(Object.assign(idle(t, 5), { x: PX, y: PY, s: PS, tilt: refuse * 8 - 2, sway: -wind * 3,
        face: { mouth: t > hitT + 0.1 ? 'grin' : (refuse > 0.3 ? 'tight' : 'smirk'), lid: refuse > 0.4 ? 0.85 : 0.42, look: t > 14.6 ? [-0.7, -0.6] : [0.3, 0.6], brows: [5, -6] },
        armR: { hand: rHand, pose: grab > 0.4 || wind > 0.1 ? 'fist' : 'relaxed', facing: 'back' }, armL: { hand: [150, -335], pose: 'relaxed', facing: 'back' } }));
      const horror = ss(hitT, hitT + 0.15, t);
      const talking = env(t, 11.9, 12.0, 12.75, 12.9);
      const tutor = W.tutor(Object.assign(idle(t, 7), { x: TX, y: TY, s: TS, tilt: talking * wave(t, 0.8) * 2,
        face: { expr: 'stern', mouth: horror > 0.5 ? 'parted' : (talking > 0.3 ? 'talk' : 'tight'), open: horror > 0.5 ? 0.35 : talking * W.talk(t, 0.6, 7), look: horror > 0.3 ? [-0.8, -0.5] : [-0.8, 0.4], brows: horror > 0.3 ? [-8, -6] : [9, -3], wide: horror > 0.5 },
        armR: { hand: horror > 0 ? [lerp(-250, -300, horror), lerp(-1000, -1420, horror)] : [-250, -1000], pose: horror > 0.3 ? 'open' : 'point', facing: horror > 0.3 ? 'palm' : 'back' },
        armL: { hand: [lerp(150, 300, horror), lerp(-800, -1400, horror)], pose: horror > 0.3 ? 'open' : 'relaxed', facing: horror > 0.3 ? 'palm' : 'back' } }));
      let props = '';
      if (t < 13.8) { const [bx, by, br] = bookP(t); props += PR.book(bx, by, 0.75, br, true, '#3a2a5a'); } else props += PR.book(190, 1800, 0.75, -170, true, '#3a2a5a');
      if (t < 14.42) props += PR.apple(560, 1548, 20);
      else if (t < throwT) { const hp = [PX + rHand[0] * PS, PY + rHand[1] * PS + 30]; props += PR.apple(hp[0], hp[1], 20); }
      else if (t < hitT) { const u = (t - throwT) / (hitT - throwT), hp = [PX + 120, PY - 520]; props += PR.apple(lerp(hp[0], win[0], u), lerp(hp[1], win[1], u) - Math.sin(Math.PI * u) * 260, 20, u * 600); }
      if (t >= hitT) props += PR.shards(win[0], win[1], (t - hitT) * 0.9);
      const ch = lit(tutor, L3.room) + lit(prince, L3.room) + props;
      return X.compose(stageBF(set, ch), c);
    }, { grade: 'gDay' });
  }
  X.tr('carry', 15.62, 0.55, 'S7', 'S8', { mode: 'zoom', k: 1.5, blur: 4, leak: '#ffffff', leakOp: 0.55, leakAt: [300, 700] });

  // ======================================================= S8  the guards drag you in (15.62 - 17.48)
  {
    const cam = TK([[15.4, [1460, 1380, 1.28, 0]], [17.7, [1330, 1400, 1.42, 0], 'sine']]);
    X.shot('S8', 15.62, 17.48, t => {
      const c = hh(cam(t), t, 0.7, 8);
      const set = S.classroom(t, { door: 1, broken: 1, bench: false, chair: false });
      const walk = ss(15.62, 17.4, t), bx = lerp(1640, 1340, walk), by = 1790, bs = 0.68, lift = 22 + bob(t, 1.6) * 8;
      const kick = wave(t, 1.2);
      const boy = W.boy(Object.assign(idle(t, 1), { x: bx, y: by - lift, s: bs, sway: kick * 3, tilt: wave(t, 0.9) * 3,
        face: { expr: 'fear', mouth: 'parted', open: 0.3, look: [wave(t, 0.6) * 0.6, -0.2], brows: [-11, 2], wide: true, sweat: 0.6 },
        armR: { hand: [-110, -330 + kick * 10], pose: 'relaxed', facing: 'back' }, armL: { hand: [110, -330 - kick * 10], pose: 'relaxed', facing: 'back' } }));
      let ch = '', hands = '';
      for (const sd of [-1, 1]) {
        const gx = bx + sd * 185, gy = by - bob(t, 1.6, sd > 0 ? Math.PI : 0) * 7, gs = 0.6;
        const grip = [bx + sd * 50, by - lift - 330 * bs];
        const arm = { hand: loc(grip, gx, gy, gs), pose: 'fist', facing: 'back', detachHand: true };
        const g = W.guard(Object.assign(idle(t, 9 + sd), { x: gx, y: gy, s: gs, sway: -sd * 1.5, face: { look: [-sd * 0.3, 0.3], brows: [9, -4] } }, sd < 0 ? { armL: arm } : { armR: arm }));
        ch += lit(g, L3.room); hands += sd < 0 ? g.handL : g.handR;
      }
      ch += lit(boy, L3.room) + hands;
      return X.compose(stageBF(set, ch), c);
    }, { grade: 'gDay' });
  }
  X.tr('carry', 17.48, 0.7, 'S8', 'S9', { dir: [-1, 0], dist: 0.5, blur: 12 });

  // ======================================================= seated Prince helper (the corner armchair)
  const CH = { x: -330, y: 1780, s: 0.85 }, PSs = 0.66, PSY = 1584 + 300 * PSs;
  const seated = (t, o) => { const p = W.prince(Object.assign(idle(t, 5), { x: CH.x, y: PSY, s: PSs }, o)); return Object.assign({}, p, { info: Object.assign({}, p.info, { feet: 1780 }) }); };
  // eating grapes: hand cycles bunch -> mouth -> bunch (period per)
  const grapeHand = (t, per = 1.25, ph = 0) => { const u = ((t + ph) / per) % 1, k = 0.5 - 0.5 * Math.cos(u * TAU); return { k, hand: [lerp(80, -18, k), lerp(-470, -640, k)], carrying: u > 0.02 && u < 0.5, chew: u > 0.45 && u < 0.95 ? bob(t, 3.2) : 0 }; };

  // ======================================================= S9  the Prince eats grapes in the corner (17.48 - 19.85)
  {
    const cam = TK([[17.2, [-250, 1450, 1.55, 0]], [20.1, [-275, 1410, 1.82, 0], 'sine']]);
    X.shot('S9', 17.48, 19.85, t => {
      const c = hh(cam(t), t, 0.45, 9);
      const set = S.classroom(t, { broken: 1 });
      const g = grapeHand(t), feet = bob(t, 0.9);
      const p = seated(t, { tilt: wave(t, 0.3) * 2, face: { mouth: g.chew > 0.05 ? 'talk' : 'smirk', open: g.chew * 0.25, lid: 0.55, look: [0.3, 0.2], brows: [2, -4] },
        armR: { hand: g.hand, pose: 'fist', facing: 'back', thumb: 'up' },
        armL: { hand: [110, -440], pose: 'fist', facing: 'back', thumb: 'up' },
        props: PR.grapes(110, -420, 1.1, 14, 3) + (g.carrying ? PR.grape(g.hand[0] - 4, g.hand[1] - 22, 1) : '') });
      const shoes = [-1, 1].map(sd => `<ellipse cx="${f(CH.x + sd * 26)}" cy="${f(1772 - feet * (sd > 0 ? 8 : 2))}" rx="18" ry="10" fill="#4a1a12" stroke="#1f140c" stroke-width="1.5"/>`).join('');
      const ch = lit(p, L3.room);
      return X.compose(stageBF(set, ch, [{ p: 1, svg: shoes }]), c);
    }, { grade: 'gDay' });
  }
  X.tr('carry', 19.85, 0.65, 'S9', 'S10', { dir: [1, 0], dist: 0.5, blur: 12 });

  // ======================================================= S10  the tutor pulls out the heavy leather rod (19.85 - 22.30)
  {
    const cam = TK([[19.6, [1090, 1260, 1.5, 0]], [22.5, [1080, 1170, 1.85, -2], 'sine']]);
    const TX = 1100, TY = 1800, TS = 0.62;
    const grip = TK([[20.2, [1040, 1468]], [20.95, [980, 1240], 'io'], [22.4, [985, 1230]]]);
    const ang = TK([[20.2, -94], [20.95, -15, 'io']]);
    X.shot('S10', 19.85, 22.30, t => {
      const c = hh(cam(t), t, 0.4, 10);
      const held = t >= 20.2;
      const set = S.classroom(t, { deskFront: true, rod: !held, broken: 1, bench: false });
      const tap = bump(t, 21.35, 1, 0.45) + bump(t, 21.85, 1, 0.45);
      const gp = held ? grip(t) : [1040, 1468];
      const rodAng = (held ? ang(t) : -94) + tap * 40;
      const reach = env(t, 19.95, 20.2, 20.2, 20.25);
      const rH = held ? loc(gp, TX, TY, TS) : [lerp(-150, -97, ss(19.9, 20.2, t)), lerp(-760, -535, ss(19.9, 20.2, t))];
      const tutor = W.tutor(Object.assign(idle(t, 7), { x: TX, y: TY, s: TS, tilt: -2 + tap * 2,
        face: { expr: 'stern', mouth: t > 21.0 ? 'smirk' : 'tight', lid: 0.5, look: [-0.8, 0.15], brows: [10, -4] },
        armR: { hand: rH, pose: held || reach > 0.5 ? 'fist' : 'relaxed', facing: 'back', thumb: 'up' },
        armL: { hand: t > 21.1 ? [130, -1010] : [150, -760], pose: t > 21.1 ? 'open' : 'relaxed', facing: t > 21.1 ? 'palm' : 'back' },
        props: held ? PR.rod(...loc(gp, TX, TY, TS), 1, rodAng) : '' }));
      const ch = lit(tutor, L3.dim) + C.bloom(1120, 1360, 120, '#ffc070', 0.35);
      return X.compose(stageBF(set, ch), c);
    }, { grade: 'gHall' });
  }
  X.tr('carry', 22.30, 0.5, 'S10', 'S11', { mode: 'zoom', k: 1.6, blur: 5 });

  // ======================================================= shadow-play helper: the tutor swings, the boy is bent over the bench
  const shadowPlay = (t, hits, o = {}) => {
    // k: 0 = raised behind the head, 1 = struck down onto the back; small wind-up before each strike
    let k = 0, wind = 0, jolt = 0;
    for (const h of hits) {
      wind = Math.max(wind, env(t, h - 0.6, h - 0.3, h - 0.16, h - 0.12));
      if (t >= h - 0.16 && t < h + 0.55) k = t < h ? EZ.in2((t - (h - 0.16)) / 0.16) : 1 - ss(h + 0.05, h + 0.55, t);
      jolt += bump(t, h, 1, 0.3);
    }
    const hand = [lerp(-20, -280, k) + wind * 20, lerp(-1320, -980, k) - wind * 30], ang = lerp(30, -140, k) + wind * 12;
    const tutor = W.tutor({ x: 680, y: 1600, s: 0.78, sway: -2 - k * 4, armR: { hand, pose: 'fist', facing: 'back' }, armL: { hand: [60, -900], pose: 'fist', facing: 'back' }, props: PR.rod(hand[0], hand[1], 1.1, ang) });
    const boy = W.boy({ x: 470, y: 1600, s: 0.85, sway: -30 - jolt * 5, armR: { hand: [-120, -230], pose: 'fist' }, armL: { hand: [60, -200], pose: 'fist' } });
    const sil = PR.stool(300, 1600, 0.95) + boy.svg + tutor.svg;
    return `<g filter="url(#silh)" opacity="0.9" transform="translate(540,1600) scale(1.06,1.1) skewX(-6) translate(-540,-1600)">${sil}</g>`;
  };  const flashOf = (t, hits) => hits.reduce((m, h) => Math.max(m, bump(t, h, 0.5, 0.18)), 0);

  // ======================================================= S11  "He swings it across your bare back" (22.30 - 24.54)
  {
    const cam = TK([[22.1, [540, 1080, 1.0, 0]], [24.8, [520, 1060, 1.14, 0], 'sine']]);
    const hits = [22.82, 23.86];
    X.shot('S11', 22.30, 24.54, t => {
      const c = hh(cam(t), t, 0.5 + hits.reduce((m, h) => m + bump(t, h, 3, 0.35), 0), 11);
      return X.compose(S.classShadow(t, shadowPlay(t, hits), { flash: flashOf(t, hits) }), c);
    }, { grade: 'gHall' });
  }
  X.tr('carry', 24.54, 0.5, 'S11', 'S12', { mode: 'zoom', k: 1.4, blur: 5 });

  // ======================================================= S12  you don't act tough... you scream (24.54 - 26.90)
  {
    const cam = TK([[24.3, [540, 1080, 1.9, 0]], [25.95, [540, 1070, 2.06, 0], 'sine'], [26.25, [540, 1062, 2.6, 0], 'out'], [27.1, [540, 1060, 2.5, 0], 'sine']]);
    X.shot('S12', 24.54, 26.90, t => {
      const scream = ss(25.98, 26.12, t);
      const c = hh(cam(t), t, 0.5 + scream * 2.2, 12);
      const set = S.classroom(t, { broken: 1 });
      set.back.push({ p: 1, svg: `<rect x="-1400" y="-600" width="4000" height="3600" fill="#0a0814" opacity="0.4" style="mix-blend-mode:multiply"/>`, light: true });
      const qu = wave(t, 5.5) * (1 - scream);
      const boy = W.boy(Object.assign(idle(t, 1), { x: 540, y: 2420, s: 1.9, tilt: qu * 0.8 - scream * 8, breath: K0.breath(t * 3.2) * 1.2,
        face: scream > 0.5 ? { expr: 'grief', mouth: 'shout', open: 0.82 + wave(t, 3) * 0.06, lid: 0.95, brows: [-12, 4], tears: true }
          : { expr: 'grief', mouth: 'tight', open: 0, lid: 0.28, brows: [-10, 3], tears: t > 25.2, look: [0, -0.1] } }));
      return X.compose(stageBF({ back: [set.back[0], set.back[set.back.length - 1]], front: [] }, blur(lit(boy, L3.dim), 'b05')), c);
    }, { grade: 'gHall' });
  }
  X.tr('carry', 26.90, 0.55, 'S12', 'S13', { mode: 'zoom', k: 0.62, blur: 5 });

  // ======================================================= S13  the scream echoes down the corridor (26.90 - 28.55)
  {
    const cam = TK([[26.7, [540, 1340, 1.18, 0]], [28.8, [540, 1310, 1.3, 0], 'sine']]);
    X.shot('S13', 26.90, 28.55, t => {
      const flinch = ss(26.95, 27.15, t) * (1 - ss(28.1, 28.5, t) * 0.4);
      const c = hh(cam(t), t, 0.5 + flinch * 1.2, 13);
      const set = S.corridor(t, { ph: 0.3 });
      let ch = '';
      [[330, 0], [720, 1]].forEach(([x, i]) => {
        const m = W.maid(Object.assign(idle(t, 40 + i), { x, y: 1980, s: 0.72, tilt: (i ? 1 : -1) * flinch * 8, sway: (i ? 1 : -1) * flinch * 3,
          face: { expr: 'fear', mouth: 'parted', lid: flinch > 0.5 ? 0.8 : 0.2, brows: [-10, 2], look: [i ? -0.6 : 0.6, 0] },
          armR: { hand: i ? [-90, -1220] : [-150, -880], pose: 'relaxed', facing: i ? 'palm' : 'back' }, armL: { hand: i ? [150, -880] : [90, -1220], pose: 'relaxed', facing: i ? 'back' : 'palm' },
          props: `<rect x="${i ? 80 : -220}" y="-910" width="140" height="70" rx="10" fill="#efe8da" stroke="#1f140c" stroke-width="2"/>` }));
        ch += lit(m, L3.corr);
      });
      return X.compose(X.stage(set, ch), c);
    }, { grade: 'gHall' });
  }
  X.tr('carry', 28.55, 0.6, 'S13', 'S14', { dir: [-1, 0], dist: 0.45, blur: 12 });

  // ======================================================= S14  the sick rule: the Prince keeps eating (28.55 - 30.90)
  {
    const cam = TK([[28.3, [-280, 1430, 1.68, 0]], [31.1, [-300, 1400, 2.08, 0], 'sine']]);
    X.shot('S14', 28.55, 30.90, t => {
      const c = hh(cam(t), t, 0.4, 14);
      const set = S.classroom(t, { broken: 1 });
      const g = grapeHand(t, 1.4, 0.3), feet = bob(t, 0.7);
      const p = seated(t, { tilt: 3 + wave(t, 0.25) * 2, face: { mouth: g.chew > 0.05 ? 'talk' : 'closed', open: g.chew * 0.22, lid: 0.6, look: [0.4, 0.5], brows: [0, -2] },
        armR: { hand: g.hand, pose: 'fist', facing: 'back', thumb: 'up' }, armL: { hand: [110, -440], pose: 'fist', facing: 'back', thumb: 'up' },
        props: PR.grapes(110, -420, 1.1, 12, 3) + (g.carrying ? PR.grape(g.hand[0] - 4, g.hand[1] - 22, 1) : '') });
      const shoes = [-1, 1].map(sd => `<ellipse cx="${f(CH.x + sd * 26)}" cy="${f(1772 - feet * (sd > 0 ? 8 : 2))}" rx="18" ry="10" fill="#4a1a12" stroke="#1f140c" stroke-width="1.5"/>`).join('');
      return X.compose(stageBF(set, lit(p, L3.room), [{ p: 1, svg: shoes }]), c);
    }, { grade: 'gDay' });
  }
  X.tr('carry', 30.90, 0.6, 'S14', 'S15', { dir: [0, -1], dist: 0.4, blur: 12 });

  // ======================================================= S15  he isn't allowed to stop (30.90 - 33.10)
  {
    const cam = TK([[30.7, [540, 1120, 1.04, 0]], [33.3, [600, 1160, 1.22, 2], 'sine']]);
    const hits = [31.25, 32.1, 32.95];
    X.shot('S15', 30.90, 33.10, t => {
      const c = hh(cam(t), t, 0.5 + hits.reduce((m, h) => m + bump(t, h, 2.4, 0.35), 0), 15);
      const L = S.classShadow(t, shadowPlay(t, hits), { flash: flashOf(t, hits) * 0.8, dark: 0.2 });
      L.push({ p: 1.18, svg: `<g filter="url(#dof2)">${PR.hourglass(880, 1820, 1.5, ss(30.9, 33.1, t) * 0.8 + 0.1, t)}${PR.candle(1060, 1860, 180, t, 1.4)}</g>` + C.bloom(1060, 1560, 160, '#ffb860', 0.4) });
      return X.compose(L, c);
    }, { grade: 'gHall' });
  }
  X.tr('carry', 33.10, 0.6, 'S15', 'S16', { dir: [-1, 0], dist: 0.45, blur: 12 });

  // ======================================================= S16  until the Prince feels guilty enough to cry (33.10 - 35.30)
  {
    const cam = TK([[32.9, [-310, 1310, 2.2, 0]], [35.5, [-325, 1290, 2.55, 0], 'sine']]);
    X.shot('S16', 33.10, 35.30, t => {
      const c = hh(cam(t), t, 0.4, 16);
      const set = S.classroom(t, { broken: 1 });
      const guilt = ss(33.3, 34.1, t), cry = ss(34.25, 34.5, t), sob = cry * bob(t, 2.1);
      const drop = clamp((t - 34.45) / 0.45);
      const p = seated(t, { tilt: lerp(0, 6, guilt) + sob * 2, breath: (sob - 0.5) * 2 * cry,
        face: cry > 0.5 ? { expr: 'grief', mouth: 'cry', open: 0.35 + sob * 0.25, tears: true, lid: 0.65, brows: [-12, 4] }
          : { expr: 'neutral', mouth: guilt > 0.5 ? 'tight' : 'smirk', lid: lerp(0.5, 0.18, guilt), brows: [lerp(2, -9, guilt), lerp(-4, 2, guilt)], tears: guilt > 0.8, look: [lerp(0.4, -0.2, guilt), lerp(0.4, 0, guilt)] },
        armR: { hand: [lerp(80, -40, cry), lerp(-470, -600, cry)], pose: 'relaxed', facing: 'back' }, armL: { hand: [lerp(110, 60, cry), lerp(-440, -620, cry)], pose: cry > 0.5 ? 'relaxed' : 'fist', facing: 'back', thumb: 'up' },
        props: drop < 1 ? PR.grapes(lerp(110, 140, drop), -420 + 900 * drop * drop, 1.1, 12, 3) : '' });
      return X.compose(stageBF(set, lit(p, L3.room)), c);
    }, { grade: 'gDay' });
  }
  X.tr('dip', 35.30, 0.55, 'S16', 'S17', { za: 0.12, zb: 0.1 });

  // ======================================================= S17  some days the Prince just laughs (35.30 - 37.45)
  {
    const cam = TK([[35.0, [-300, 1430, 1.78, 0]], [37.7, [-300, 1400, 2.02, 0], 'sine']]);
    X.shot('S17', 35.30, 37.45, t => {
      const c = hh(cam(t), t, 0.45, 17);
      const set = S.classroom(t, { broken: 1 });
      const lgh = ss(35.5, 35.75, t), bnc = lgh * bob(t, 2.6), feet = bob(t, 1.6);
      const p = seated(t, { tilt: -6 * lgh - bnc * 3, sway: bnc * 1.2,
        face: { mouth: 'grin', open: 0.2 + bnc * 0.35, lid: lgh > 0.5 ? 0.85 : 0.5, brows: [-2, -8], look: [-0.5, 0] },
        armR: { hand: [lerp(80, -250, lgh), lerp(-470, -700, lgh)], pose: 'point', facing: 'back' }, armL: { hand: [60, -470 + bnc * 12], pose: 'fist', facing: 'back', thumb: 'up' },
        props: PR.grapes(60, -450 + bnc * 12, 1.0, 10, 3) });
      const shoes = [-1, 1].map(sd => `<ellipse cx="${f(CH.x + sd * 26)}" cy="${f(1772 - feet * 14 * (sd > 0 ? 1 : 0.4))}" rx="18" ry="10" fill="#4a1a12" stroke="#1f140c" stroke-width="1.5"/>`).join('');
      return X.compose(stageBF(set, lit(p, L3.room), [{ p: 1, svg: shoes }]), c);
    }, { grade: 'gDay' });
  }
  X.tr('carry', 37.45, 0.6, 'S17', 'S18', { dir: [0, 1], dist: 0.45, blur: 12 });

  // ======================================================= S18  you bleed onto the marble floor for an hour (37.45 - 40.20)
  {
    const cam = TK([[37.2, [540, 1020, 1.08, 0]], [40.5, [560, 980, 1.34, 3], 'sine']]);
    X.shot('S18', 37.45, 40.20, t => {
      const c = hh(cam(t), t, 0.3, 18);
      const hour = ss(37.45, 40.2, t);
      return X.compose(S.marble(t, { hour, sand: 0.1 + hour * 0.85, drops: [[520, 960, 37.85], [575, 1035, 38.75], [480, 1005, 39.55]] }), c);
    }, { grade: 'gHall' });
  }
  X.tr('carry', 40.20, 0.7, 'S18', 'S19', { mode: 'zoom', k: 0.66, blur: 5, leak: '#ffd8a0', leakOp: 0.4 });

  // ======================================================= S19  you survive, turn 18, the nightmare seems over (40.20 - 44.61)
  {
    const cam = TK([[40.0, [540, 1250, 1.05, 0]], [42.3, [540, 1150, 1.2, 0], 'sine'], [44.9, [540, 1060, 1.58, 0], 'sine']]);
    X.shot('S19', 40.20, 44.61, t => {
      const c = hh(cam(t), t, 0.35, 19);
      const season = lerp(0, 4, ss(40.4, 43.2, t)), days = env(t, 40.3, 40.5, 42.4, 42.7) * bob(t, 1.8);
      const set = S.attic(t, { season, night: days * 0.8 });
      const age = ss(41.0, 42.3, t), calm = ss(43.1, 43.6, t);
      let ch = '';
      if (age < 1) {
        const kid = W.boy(Object.assign(idle(t, 1), { x: 540, y: 1800, s: lerp(0.62, 0.82, age), face: { expr: 'tired', mouth: 'closed', look: [0, 0], lid: 0.35, brows: [-6, 2] } }));
        ch += `<g opacity="${f(1 - age)}">${lit(kid, L3.attic)}</g>`;
      }
      if (age > 0) {
        const man = W.man(Object.assign(idle(t, 3), { x: 540, y: 1800, s: lerp(0.5, 0.6, age), breath: K0.breath(t) + calm * 1.5,
          face: { expr: 'tired', mouth: calm > 0.5 ? 'smile' : 'closed', lid: lerp(0.4, 0.8, calm), brows: [lerp(-6, -2, calm), lerp(2, -2, calm)], look: [0, -0.2] } }));
        ch += `<g opacity="${f(age)}">${lit(man, L3.attic)}</g>`;
      }
      const layers = X.stage(set, ch);
      layers.push({ p: 1, svg: C.radial(540, 700, 1500, '#ffd8a0', 0.3 * calm), light: true });
      return X.compose(layers, c);
    }, { grade: 'gDusk' });
  }
  X.tr('carry', 44.61, 0.6, 'S19', 'S20', { dir: [1, 0], dist: 0.45, blur: 12, roll: 2 });

  // ======================================================= S20  the Prince's spoiled son (44.61 - 46.90)
  {
    const cam = TK([[44.4, [580, 1360, 1.2, 0]], [47.1, [560, 1330, 1.36, 0], 'sine']]);
    const KX = 660, KY = 1820, KS = 0.6, SX = 860, SY = 1845, SS = 0.66;
    X.shot('S20', 44.61, 46.90, t => {
      const c = hh(cam(t), t, 0.5, 20);
      const set = S.garden(t);
      const stomp = bob(t, 2.2), kick = bump(t, 45.25, 1, 0.4), smash = clamp((t - 45.42) / 0.7), proud = ss(45.6, 45.9, t);
      const sonHead = [SX - 6, SY - 860 * SS + 22];
      const king = W.king(Object.assign(idle(t, 2), { x: KX, y: KY, s: KS, tilt: proud * (-5 - bob(t, 2.4) * 3),
        face: { mouth: proud > 0.5 ? 'grin' : 'smirk', open: proud * bob(t, 2.4) * 0.3, lid: proud > 0.5 ? 0.75 : 0.42, look: [0.6, 0.4] },
        armL: { hand: proud > 0 ? loc([lerp(KX + 200 * KS, sonHead[0], proud) + wave(t, 2) * 8 * proud, lerp(KY - 760 * KS, sonHead[1], proud)], KX, KY, KS) : [200, -760], pose: 'relaxed', facing: 'back' } }));
      const son = W.prince(Object.assign(idle(t, 5), { x: SX, y: SY - kick * 14 - stomp * 6 * (1 - smash), s: SS, sway: wave(t, 1.1) * 3 - kick * 6,
        face: { mouth: smash > 0.3 ? 'grin' : 'snarl', lid: 0.42, brows: [8, -8], look: [0.6, 0.4] },
        armR: { hand: [-150 + wave(t, 2.2) * 30, -560], pose: 'fist', facing: 'back' }, armL: { hand: [150 - wave(t, 2.2) * 30, -560], pose: 'fist', facing: 'back' } }));
      const fall = ss(45.5, 46.2, t);
      const man = W.man(Object.assign(idle(t, 3), { x: 300, y: 1810, s: 0.6, tilt: wave(t, 0.8) * 3 * fall,
        face: { expr: 'tired', mouth: fall > 0.5 ? 'parted' : 'closed', open: 0.12, brows: [lerp(-2, -10, fall), lerp(0, 3, fall)], lid: lerp(0.35, 0.15, fall), look: [0.8, 0.2], wide: fall > 0.6 } }));
      const ch = S.urn(1010, 1760, 0.85, smash) + lit(man, L3.day) + lit(king, L3.day) + lit(son, L3.day);
      return X.compose(X.stage(set, ch), c);
    }, { grade: 'gDay' });
  }
  X.tr('carry', 46.90, 0.5, 'S20', 'S21', { mode: 'zoom', k: 1.4, blur: 4 });

  // ======================================================= S21  he hands you a bag of gold (46.90 - 48.43)
  {
    const cam = TK([[46.7, [540, 1260, 1.6, 0]], [48.7, [520, 1235, 1.82, 0], 'sine']]);
    const KX = 660, KY = 1820, KS = 0.6, MX = 420, MY = 1810, MS = 0.6;
    const W0 = [540, 1335];
    const kW = TK([[46.7, [KX + 200 * KS, KY - 760 * KS]], [47.35, W0, 'io'], [47.8, W0], [48.3, [KX + 220 * KS, KY - 800 * KS], 'io']]);
    const mW = TK([[46.7, [MX - 124 * MS, MY - 735 * MS]], [47.4, [W0[0] - 6, W0[1] + 4], 'io'], [48.6, [MX + 60 * MS, MY - 980 * MS], 'io']]);
    X.shot('S21', 46.90, 48.43, t => {
      const c = hh(cam(t), t, 0.45, 21);
      const set = S.garden(t);
      const given = t >= 47.6, pp = given ? mW(t) : kW(t), dread = ss(47.5, 47.9, t), whisper = env(t, 47.75, 47.85, 48.25, 48.35);
      const king = W.king(Object.assign(idle(t, 2), { x: KX, y: KY, s: KS, sway: -dread * 2, tilt: -3 + whisper * 3,
        face: { mouth: whisper > 0.3 ? 'talk' : 'smirk', open: whisper * W.talk(t, 0.5, 8), lid: 0.45, look: [-0.7, 0.2] },
        armL: { hand: loc(kW(t), KX, KY, KS), pose: given ? 'relaxed' : 'fist', facing: 'back', thumb: 'up' },
        props: given ? '' : purse(...loc([pp[0], pp[1] + 22], KX, KY, KS), 1.1) }));
      const man = W.man(Object.assign(idle(t, 3), { x: MX, y: MY, s: MS, tilt: dread * 4,
        face: { expr: 'tired', mouth: 'parted', open: 0.1 + dread * 0.1, brows: [lerp(-4, -11, dread), lerp(0, 3, dread)], lid: lerp(0.3, 0.12, dread), look: dread > 0.5 ? [0.6, -0.1] : [0.3, 0.6], wide: dread > 0.6 },
        armR: { hand: loc(mW(t), MX, MY, MS), pose: t > 47.3 ? 'fist' : 'relaxed', facing: 'back', thumb: 'up' },
        props: given ? purse(...loc([pp[0], pp[1] + 22], MX, MY, MS), 1.1) : '' }));
      return X.compose(X.stage(set, lit(king, L3.day) + lit(man, L3.day)), c);
    }, { grade: 'gDay' });
  }
  X.tr('wipe', 48.43, 0.6, 'S21', 'S22', { dir: 1, truck: 240 });

  // ======================================================= S22  to find a poor kid on the streets (48.43 - end) -> loop
  const camS22 = TK([[48.2, [20, 1390, 1.12, 0]], [X.T_END, [-330, 1300, 1.95, 0], 'sine']]);
  const KIDX = -380, KIDS = 0.62, KIDY = 1800;
  {
    X.shot('S22', 48.43, X.T_END, t => {
      const c = hh(camS22(t), t, 0.4, 22);
      const set = S.street(t);
      const walk = ss(48.43, 49.6, t), mx = lerp(420, 40, walk), step = bob(t, 1.7) * (1 - ss(49.4, 49.7, t));
      const hope = ss(49.4, 49.8, t);
      const kid = W.boy(Object.assign(idle(t, 1), { rags: true, x: KIDX, y: KIDY, s: KIDS, tilt: lerp(4, -6, hope),
        face: { expr: 'anxious', mouth: 'parted', open: 0.1, look: [lerp(0.3, 0.7, hope), lerp(0.4, -0.7, hope)], brows: [-7, -4], lid: 0.12, wide: true },
        armR: { hand: [-62, -420], pose: 'fist', facing: 'back', thumb: 'up' }, armL: { hand: [62, -420], pose: 'fist', facing: 'back', thumb: 'up' },
        props: `<path d="M-80,-430 Q0,-360 80,-430Z" fill="#7a5a38" stroke="#1f140c" stroke-width="2"/><ellipse cx="0" cy="-430" rx="80" ry="14" fill="#5a3e24" stroke="#1f140c" stroke-width="2"/>` }));
      const man = W.man(Object.assign(idle(t, 3), { x: mx, y: 1830 - step * 8, s: 0.62, tilt: 3,
        face: { expr: 'tired', mouth: 'closed', lid: 0.45, brows: [-7, 2], look: [-0.7, 0.5] },
        armL: { hand: [150, -760], pose: 'fist', facing: 'back', thumb: 'up' }, props: purse(150, -738, 1.1) }));
      const crate = `<rect x="${KIDX - 120}" y="1600" width="240" height="120" fill="#5a3e24" filter="url(#woodV)" stroke="#1f140c" stroke-width="2"/><path d="M${KIDX - 120},1640 L${KIDX + 120},1640 M${KIDX - 120},1680 L${KIDX + 120},1680" stroke="#2a1a0c" stroke-width="5"/>`;
      const shadow = `<ellipse cx="${f(mx - 160)}" cy="1820" rx="${f(260 * walk)}" ry="40" fill="#000" opacity="${f(0.3 * walk)}" filter="url(#b14)"/>`;
      const ch = shadow + lit(kid, L3.street) + lit(man, L3.street);
      return X.compose(X.stage(set, ch), c);
    }, { grade: 'gHall' });
  }
  // loop: push into the street kid's face and land on the same boy at the castle gate, frame 0
  {
    const kidFace = [KIDX, KIDY - 723 * KIDS];
    const fa = scr(kidFace[0], kidFace[1], camS22(X.T_END)), fb = scr(600 - 8, 1785 - 723 * 0.6, camS1(0));
    X.tr('carry', X.T_END, 0.62, 'S22', 'S1', { mode: 'zoom', k: 1.6, fa, fb, blur: 5, end: true, bOff: -X.T_END });
  }
})(window);



