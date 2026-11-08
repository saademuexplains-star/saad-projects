// "The Royal Fool" part 3: the throne room.
// PUSH (27.05 .. 28.95) "So they push you forward." The great doors burst open, the lords shove you in; you stumble,
//   look up the hall, swallow, put on the grin.
// DANCE (28.6 .. 32.45) "You dance up to the throne and shout, 'The English are such cowards!'" You jig up the last of
//   the hall toward us (we back up the dais steps ahead of you, to the King's eye), arms flung wide, shouting up.
// KING (32.0 .. 34.2) "The King laughs and asks why." He roars, then leans in, palm up.
// SANK (33.8 .. 36.6) "Because when their ships sank, they didn't have the courage to jump..." Your hand is a ship,
//   tipping and going down; two fingers leap off it.
// JUMP (36.2 .. 38.0) "...into the sea..." The truth: men leaping from a burning cog into the water.
// BRAVE (37.8 .. 39.6) "...like our brave French sailors!" Hand on heart, chin up; the grin falters.
// DIES (39.1 .. 43.75) "The laughter dies on the King's face. He grips his throne, and the guards look at him," a long
//   lens pushing on his face as it goes cold (the hall stretching behind him); his fists on the throne; the guards.
// WAIT (43.2 .. 44.85) "waiting for the order." You, frozen, the court blurred behind you.
// RAGE (44.4 .. 51.9) "Then he turns on his lords, shaking with rage, because a fool was the only man brave enough to
//   tell him. You keep your head..." He rounds on the cowering lords; we drift across to you, standing alone; your
//   hand goes to your neck; you breathe out.
// TIME (51.45 .. 52.9) "and from that day on," Days pass over the hall in a breath: the sun pools sweep the floor.
// AGAIN (52.5 .. 56.25) "every time the war goes wrong, you're the one they push toward the throne." The doors open on
//   another mud-spattered messenger; the lords' eyes come to you; their hands on your back; you are pushed toward the
//   throne, into the lens: your eyes, as at the start.
(function (G) {
  const X = G.ENG, T = G.ST3, Q = G.QCAST, C = G.CINE, R = G.RIG, PR = G.PROPS, SH = G.SH, HL = G.HALL, P17 = G.P17, V = G.FV;
  const { ss, clamp, lerp, EZ } = X, { f } = R;
  const { env, nrm, L2, bump } = V;
  const D2R = Math.PI / 180, TAU = Math.PI * 2, FH = 172, FACE = FH * 1308 / 1450;
  const F = V.FEAST, KH = 182, KF = [0, F.KY0 + KH * 1308 / 1450, F.KZ];
  const LTd = V.LT.day;
  const H = { blurA: (svg, sd) => SH.blur(svg, sd) };

  // you, standing somewhere in the hall: x2 { steps, bob, sway, tilt, arms {R, L}, face, art (k, j), mid, id }
  const youAt = (c, t, x, z, face, arms, x2 = {}) => {
    const st = V.at(c, x, z, FH, 'man', x2.y0 || 0); if (!st) return null;
    const id = V.idle(t, 3, 0.4), o = { x: st.x, y: st.y + (x2.bob || 0) * st.s, s: st.s, blink: x2.noBlink ? 0 : id.blink * (x2.blinkK ?? 1), breath: id.breath + (x2.breath || 0), sway: id.sway * 0.4 + (x2.sway || 0), tilt: x2.tilt || 0 };
    if (x2.steps) o.steps = x2.steps;
    o.face = face; o.armR = arms.R || V.rest(-1); o.armL = arms.L || V.rest(1);
    const P = Q.fool(o), art = Q.foolArt(x2.k || 0, x2.j || 0, 'fc' + (x2.id || 'x'));
    return { st, P, o, actor: V.actor(st.d, () => SH.draw(P, o, art, x2.L || LTd, x2.mid || '', { castOp: 0.26 }) + (x2.hands ? V.handsLit(P, x2.L || LTd) : '') + (x2.over || '')) };
  };
  // the King standing (RAGE) or seated (KING, DIES) on the throne in daylight
  const kingSeated = (c, t, face, arms, x2 = {}) => {
    const K = V.seatedKing(c, t, x2.L || LTd, face, arms, Object.assign({ id: x2.id || 'D' }, x2));
    return K;
  };
  const guardAt = (c, t, gx, gz, mk, sd, face, L = LTd, grip = 0) => {
    const gst = V.at(c, gx, gz, 184, 'man', 60); if (!gst) return null;
    const gi = V.idle(t, sd, 0.3), go = { x: gst.x, y: gst.y, s: gst.s, blink: gi.blink, breath: gi.breath, sway: gi.sway * 0.3, face };
    const gy = c.proj([gx, 60, gz]), hb = V.halberdArm(go, 120, gy ? gy[1] : gst.y, grip * 2);
    go.armR = hb.arm; go.armL = V.rest(1);
    const GP = mk()(go);
    return V.actor(gst.d, () => SH.draw(GP, go, null, L, hb.svg, { castOp: 0.2 }) + V.handsLit(GP, L, 'R'));
  };
  // a jig toward the lens: knees up in turn with a hop, arms up and swinging, the body rocking (u: dance phase)
  const jig = (u, amp = 1) => {
    const w = u * TAU, a = Math.sin(w), up = (1 - Math.cos(2 * w)) / 2;
    return { steps: { R: [0, -90 * amp * Math.max(0, a) ** 1.5, 1.03], L: [0, -90 * amp * Math.max(0, -a) ** 1.5, 1.03] }, bob: -46 * amp * up, sway: 3.2 * a * amp,
      R: { hand: [-250 - 30 * a, -1160 - 80 * a], dir: [-0.4, -1], pose: 'open', facing: 'palm' }, L: { hand: [250 - 30 * a, -1160 + 80 * a], dir: [0.4, -1], pose: 'open', facing: 'palm' } };
  };

  // ======================================================= PUSH: through the doors
  {
    const cam = V.CAM([
      [27.0, [40, 170, 900], [0, 220, 0], 1150],
      [28.0, [26, 160, 760], [0, 190, 80], 1200],
      [28.95, [14, 152, 640], [0, 165, 160], 1250]
    ], 0.6, 23);
    V.pushCam = cam;
    const BURST = 27.4;
    const fn = t => {
      SH.still();
      const c = cam(t), A = [], L = LTd;
      const dz = BURST + 0.05, z = t < dz ? -70 : lerp(-70, 190, EZ.out(clamp((t - dz) / 0.75))), lurch = env(t, dz, dz + 0.2, dz + 0.5, dz + 0.85);
      const grin = ss(28.35, 28.65, t), look = ss(28.0, 28.3, t);
      const face = V.faceMix({ expr: 'fear', look: V.lerp2([0.2, 0.3], [0, -0.35], ss(0.3, 0.7, look)), lid: 0.06, mouth: lurch > 0.3 ? 'parted' : 'tight', open: 0.12 * lurch, brows: [-9, -2], sweat: 0.5 }, { expr: 'neutral', look: [0, -0.2], lid: 0.14, mouth: 'grin', brows: [-3, 6] }, ss(0.3, 0.7, grin));
      const arms = lurch > 0.02 ? { R: V.mixArm(V.rest(-1), { hand: [-260, -980], dir: [-0.3, 0.6], pose: 'open', facing: 'palm' }, lurch), L: V.mixArm(V.rest(1), { hand: [260, -980], dir: [0.3, 0.6], pose: 'open', facing: 'palm' }, lurch) } : {};
      const y = youAt(c, t, 0, z, face, arms, { bob: 40 * lurch, tilt: 5 * lurch, sway: 2 * Math.sin(t * 7) * lurch, k: 0.6 * lurch + 0.2 * Math.sin(t * 2), j: lurch, id: 'P' });
      if (y) A.push(y.actor);
      // the lords in the doorway, arms thrust out after you, then drawing back
      const shove = env(t, BURST - 0.1, BURST + 0.05, BURST + 0.45, BURST + 0.9);
      [[-95, -40, 0], [105, -30, 1], [-10, -120, 3]].forEach(([x, zz, i]) => {
        const arm = s => V.mixArm(V.rest(s), { hand: [s * 140, -1030], dir: [s * -0.2, -0.4], pose: 'open', facing: 'palm' }, shove);
        const a = V.courtier(c, t, L, V.LORDS[i], x, zz, 0, 'rest', { expr: 'anxious', look: [x < 0 ? 0.3 : -0.3, 0.25], lid: 0.2, mouth: 'tight', brows: [-6, 1] }, { arms: { R: arm(-1), L: arm(1) } });
        if (a) A.push(a);
      });
      return HL.render(c, t, { night: 0, doors: EZ.out(ss(BURST - 0.12, BURST + 0.25, t)), dof: 1.6, focus: 600 }, A) + C.vignette(0.4);
    };
    X.shot('PUSH', 27.05, 28.96, fn, { grade: 'gHall' });
  }

  // ======================================================= DANCE: up the hall, "The English are such cowards!"
  {
    const Z0 = 2060, Z1 = 2600, ARR = 30.3;
    const cam = V.CAM([
      [28.55, [0, 128, 2420], [0, 140, 1500], 1150],
      [29.4, [0, 140, 2760], [0, 140, 1900], 1250],
      [30.35, [10, 182, 2960], [0, 128, Z1], 1750],
      [32.5, [16, 186, 2990], [0, 134, Z1], 2150]
    ], 0.6, 29);
    V.danceCam = cam;
    const zAt = t => lerp(Z0, Z1, EZ.out(clamp((t - 28.6) / (ARR - 28.6))));
    V.danceFace = tt => cam(tt).proj([0, FACE, zAt(tt)]) || [540, 960];
    const fn = t => {
      SH.still();
      const c = cam(t), A = [], L = LTd;
      const arrive = ss(ARR - 0.15, ARR + 0.2, t), shout = env(t, 30.3, 30.45, 31.95, 32.25);
      const u = (t - 28.6) * 1.9, J = jig(u, 1 - arrive);
      const wide = { R: { hand: [-430, -1180], dir: [-1, -0.4], pose: 'open', facing: 'palm' }, L: { hand: [430, -1180], dir: [1, -0.4], pose: 'open', facing: 'palm' } };
      const arms = { R: V.mixArm(J.R, wide.R, arrive), L: V.mixArm(J.L, wide.L, arrive) };
      const face = V.faceMix({ expr: 'neutral', look: [0, -0.3], lid: 0.14, mouth: 'grin', brows: [-3, 6] }, { expr: 'neutral', look: [0, -0.55], lid: 0.08, mouth: 'talk', open: (0.1 + Q.talk(t, 0.22, 7)) * shout, brows: [-6, 8] }, ss(0.02, 0.35, shout));
      const y = youAt(c, t, 0, zAt(t), face, arms, { steps: H3steps(J.steps, arrive), bob: J.bob * (1 - arrive), sway: J.sway * (1 - arrive), tilt: -3 * shout + 3 * Math.sin(u * TAU) * (1 - arrive), k: Math.sin(u * TAU) * (1 - arrive) * 0.9 + 0.3 * arrive * Math.sin(t * 6), j: (1 - arrive) * 0.8 + shout * 0.4, id: 'D' });
      if (y) A.push(y.actor);
      // the court along the nave watching you pass
      [[-300, 2050, 0], [300, 2120, 1], [-320, 2380, 2], [330, 2420, 3]].forEach(([x, z, i]) => { const a = V.courtier(c, t, L, V.LORDS[i], x, z, 0, 'rest', { expr: 'anxious', look: [x < 0 ? 0.55 : -0.55, 0.05], lid: 0.2, mouth: 'tight', brows: [-6, 1] }); if (a) A.push(a); });
      return HL.render(c, t, { night: 0, dof: 1.6, focus: 500, throne: true }, A) + C.vignette(0.4);
    };
    function H3steps(s, k) { return SH.mixSteps(s, k); }
    X.shot('DANCE', 28.6, 32.45, fn, { grade: 'gHall' });
  }

  // ======================================================= KING: he laughs, then asks why
  {
    const cam = V.CAM([
      [31.8, [64, 156, 2600], [0, KF[1] - 30, KF[2]], 1900],
      [33.1, [40, 164, 2690], [0, KF[1] - 14, KF[2]], 2500],
      [34.25, [26, 170, 2760], [0, KF[1] - 6, KF[2]], 3100]
    ], 0.6, 31);
    V.kingCam = cam;
    V.kingFace = tt => cam(tt).proj(KF) || [540, 900];
    const fn = t => {
      SH.still();
      const c = cam(t), A = [];
      const laugh = env(t, 32.1, 32.35, 33.0, 33.3), ask = ss(33.05, 33.45, t);
      const face = V.faceMix({ expr: 'neutral', look: [0, 0.4], lid: lerp(0.3, 0.64, laugh), mouth: 'grin', open: 0.2 * laugh, brows: [-4 * laugh, 4 * laugh] }, { expr: 'neutral', look: [0, 0.55], lid: 0.24, mouth: 'talk', open: Q.talk(t, 0.14, 6), brows: [-6, 6] }, ss(0.3, 0.7, ask));
      const belly = { hand: [-60, -900], dir: [0.8, 0.3], pose: 'open', facing: 'back' }, palm = { hand: [150, -1000], dir: [0.6, -0.5], pose: 'open', facing: 'palm' };
      const arms = { R: V.mixArm({ hand: [-170, -930], dir: [0.6, 0.6], pose: 'relaxed', facing: 'back' }, belly, laugh), L: V.mixArm({ hand: [170, -930], dir: [-0.6, 0.6], pose: 'relaxed', facing: 'back' }, palm, ask) };
      const K = kingSeated(c, t, face, arms, { tilt: -7 * laugh * (0.7 + 0.3 * Math.sin(t * 9)) + 4 * ask, breath: 5 * laugh * Math.sin(t * 12), id: 'K' });
      if (K) A.push(V.actor(K.st.d, () => K.svg + K.hands));
      const ga = guardAt(c, t, -215, 3070, () => Q.guardA, 31, { expr: 'stern', look: [0.3, 0.4], lid: 0.3 }), gb = guardAt(c, t, 215, 3075, () => Q.guardB, 37, { expr: 'stern', look: [-0.3, 0.4], lid: 0.3 });
      if (ga) A.push(ga); if (gb) A.push(gb);
      return HL.render(c, t, { night: 0, dof: 2.2, focus: 450 }, A) + C.vignette(0.4);
    };
    X.shot('KING', 31.85, 34.25, fn, { grade: 'gHall' });
  }

  // a medium close-up camera on you at the dais foot (from the throne side, looking down the hall)
  const youCU = (keys, seed) => V.CAM(keys.map(([t, p, fl, aimY]) => [t, [p[0], p[1], p[2]], [0, aimY ?? FACE - 14, 2600], fl]), 0.6, seed);
  // ======================================================= SANK: the ship your hand makes
  {
    const cam = youCU([[33.6, [-60, 140, 2850], 2200], [35.2, [-10, 150, 2810], 2500], [36.65, [50, 156, 2780], 2900]], 37);
    V.sankCam = cam;
    V.sankFace = tt => cam(tt).proj([0, FACE, 2600]) || [540, 800];
    const fn = t => {
      SH.still();
      const c = cam(t), A = [];
      // the right hand flat (the ship) rocks, tips and goes down; the left hand's two fingers leap off it in an arc
      const sink = EZ.io(ss(34.3, 35.2, t)), rock = Math.sin(t * 7) * (1 - sink) * 0.25;
      const shipH = [lerp(-70, -60, sink), lerp(-1000, -860, sink)];
      const R0 = { hand: shipH, dir: nrm([1, lerp(0.05 + rock, 0.8, sink)]), pose: 'open', facing: 'back' };
      const leap = ss(35.4, 36.4, t), lx = lerp(70, 300, leap), ly = lerp(-1010, -840, leap) - 120 * Math.sin(Math.PI * leap);
      // (the leaping fingers' pose is defined all along, so the hand eases into it instead of jumping when the leap starts)
      const L0 = { hand: [lx, ly], dir: nrm([0.3 + leap, 1 - leap * 1.4]), pose: 'legs', facing: 'back' };
      // (drawn free of the wrist limit: the fingers point down off the ship while the forearm comes up from the elbow, and
      // the limit flipped the hand to the other side in one frame)
      const Lin = Object.assign(V.mixArm({ hand: [140, -880], dir: [-0.3, 0.8], pose: 'relaxed', facing: 'back' }, L0, ss(35.2, 35.45, t)), { wristFree: true });
      const face = { expr: 'neutral', look: V.lerp2([-0.45, 0.35], [0.3 * leap, 0.2 - 0.3 * leap], V.at2(t, 35.3, 0.15)), lid: 0.2, mouth: 'smile', brows: [-4, 7] };
      const y = youAt(c, t, 0, 2600, face, { R: R0, L: Lin }, { tilt: -4 + 3 * Math.sin(t * 2), k: 0.25 * Math.sin(t * 2.3), id: 'S' });
      if (y) A.push(y.actor);
      return HL.render(c, t, { night: 0, dof: 3.2, focus: 300 }, A) + C.vignette(0.42);
    };
    X.shot('SANK', 33.65, 36.6, fn, { grade: 'gHall' });
  }

  // ======================================================= JUMP: the truth, at Sluys
  {
    const SEA = HL.SEA, HERO = SEA.FRENCH[4], HP = [HERO.x, 200, HERO.z];
    const cam = V.CAM([[36.05, [HERO.x - 500, 150, HERO.z - 1550], [HERO.x - 200, 230, HERO.z], 1150], [38.25, [HERO.x - 350, 120, HERO.z - 1400], [HERO.x - 150, 200, HERO.z], 1250]], 0.6, 41);
    V.jumpCam = cam;
    V.jumpWater = tt => cam(tt).proj([HERO.x - 300, 0, HERO.z - 300]) || [540, 1300];
    const LEAPS = [[36.35, -150], [36.6, 40], [36.85, -60], [37.1, 150], [37.3, -230], [37.55, 90]];
    const fn = t => {
      SH.still();
      const c = cam(t), A = [];
      const b = HL.bb(c, [HERO.x, 0, HERO.z]);
      if (b) {
        const sc = b.k * 4, dir = HERO.dir;
        let sv = '';
        for (const [t0, lx] of LEAPS) {
          const u = (t - t0) / 0.9, rail = [b.x + dir * lx * sc, b.y - 96 * sc], water = [b.x + dir * lx * sc - 30 * sc, b.y + 40 * sc];
          // (each sailor is on the rail a moment before he leaps, fading in against the fire: he used to appear there whole
          // in one frame)
          const jop = ss(-0.4, -0.15, u);
          if (jop > 0.001 && u < 1) sv += `<g opacity="${f(jop)}">${P17.jumper(rail[0], rail[1], water[0], water[1], sc * 1.0, Math.max(u, 0.001), t0 * 10)}</g>`;
          sv += P17.splash(water[0], water[1] - 4 * sc, sc * 1.2, (t - t0 - 0.85) / 0.8);
        }
        A.push({ z: b.d - 5, svg: () => sv });
      }
      const shipFn = (S, side) => side === 'F' ? { fire: S === HERO ? 0.95 : 0.6, smoke: 1, roll: S === HERO ? 3 : 0, crew: [] } : { furl: 0.3 };
      return HL.seaRender(c, t, { dusk: 0.55, ship: shipFn, english: false }, A) + C.vignette(0.5);
    };
    X.shot('JUMP', 36.1, 38.2, fn, { grade: 'gDusk' });
  }

  // ======================================================= BRAVE: hand on heart
  {
    const cam = youCU([[37.55, [50, 138, 2860], 2400], [39.65, [-10, 156, 2790], 3100]], 43);
    V.braveCam = cam;
    V.braveFace = tt => cam(tt).proj([0, FACE, 2600]) || [540, 800];
    const fn = t => {
      SH.still();
      const c = cam(t), A = [];
      const heart = EZ.io(ss(37.85, 38.2, t)), fade = ss(38.8, 39.3, t);
      const R0 = V.mixArm(V.rest(-1), { hand: [40, -1000], dir: [0.3, -0.9], pose: 'open', facing: 'back' }, heart);
      const L0 = V.mixArm(V.rest(1), { hand: [300, -1260], dir: [0.4, -1], pose: 'open', facing: 'palm' }, heart * (1 - fade));
      const face = V.faceMix({ expr: 'neutral', look: [0, -0.45], lid: 0.2, mouth: 'grin', brows: [-2, 7] }, { expr: 'anxious', look: [0, -0.5], lid: 0.08, mouth: 'tight', brows: [-8, 0], sweat: 0.4 }, ss(0.3, 0.7, fade));
      const y = youAt(c, t, 0, 2600, face, { R: R0, L: L0 }, { tilt: -5 * heart * (1 - fade), sway: -1 * heart, k: 0.3 * Math.sin(t * 2), id: 'B' });
      if (y) A.push(y.actor);
      return HL.render(c, t, { night: 0, dof: 3.2, focus: 300 }, A) + C.vignette(0.42);
    };
    X.shot('BRAVE', 37.6, 39.55, fn, { grade: 'gHall' });
  }

  // ======================================================= DIES: the laugh dies; the fists; the guards
  {
    const ARM = s => [s * 41, 140, 3040];
    const cam = V.CAM([
      [38.9, [0, KF[1] + 2, KF[2] - 170], KF, 4200],
      [41.0, [0, KF[1] + 4, KF[2] - 420], KF, 10300],
      [41.9, [-10, 176, 2560], [-24, 132, 3040], 5200],
      [42.85, [70, 196, 2560], [215, 222, 3075], 3300],
      [43.8, [78, 198, 2575], [215, 224, 3075], 3500]
    ], 0.5, 47);
    V.diesCam = cam;
    V.diesFace = tt => cam(tt).proj(KF) || [540, 900];
    const fn = t => {
      SH.still();
      const c = cam(t), A = [];
      const die = ss(39.35, 40.9, t), grip = ss(41.25, 41.6, t);
      const face = { expr: die > 0.6 ? 'stern' : 'neutral', look: [0, 0.55], lid: lerp(0.6, 0.4, die), mouth: die < 0.3 ? 'grin' : die < 0.7 ? 'smile' : 'tight', open: 0.12 * (1 - die), brows: [lerp(-4, 9, die), lerp(4, -4, die)] };
      const fist = s => { const p = c.proj(ARM(s)); return p ? p : null; };
      let arms = { R: { hand: [-170, -930], dir: [0.6, 0.6], pose: 'relaxed', facing: 'back' }, L: { hand: [170, -930], dir: [-0.6, 0.6], pose: 'relaxed', facing: 'back' } };
      const st0 = V.at(c, F.KX, F.KZ, KH, 'man', F.KY0);
      if (st0) { const o0 = { x: st0.x, y: st0.y, s: st0.s }; for (const [s, key] of [[-1, 'R'], [1, 'L']]) { const p = fist(s); if (p) arms[key] = V.mixArm(V.handAt(o0, [p[0], p[1] - 30 * st0.s], [-s * 0.2, 1], { pose: 'relaxed', facing: 'back' }), V.handAt(o0, [p[0], p[1] - 34 * st0.s], [-s * 0.3, 0.9], { pose: 'fist', facing: 'back' }), grip); } }
      const K = kingSeated(c, t, face, arms, { tilt: lerp(-3, 2, die), id: 'X', over: true });
      if (K) A.push(V.actor(K.st.d, () => K.svg + K.hands));
      const turn = ss(42.4, 42.8, t);
      const ga = guardAt(c, t, -215, 3070, () => Q.guardA, 31, { expr: 'stern', look: [lerp(0.3, 0.9, turn), lerp(0.4, 0.1, turn)], lid: 0.24 }, LTd, turn), gb = guardAt(c, t, 215, 3075, () => Q.guardB, 37, { expr: 'stern', look: [lerp(-0.3, -0.9, turn), lerp(0.4, 0.1, turn)], lid: 0.2, brows: [6, -2] }, LTd, turn);
      if (ga) A.push(ga); if (gb) A.push(gb);
      const dk = clamp((c.fl - 3000) / 6000);
      return HL.render(c, t, { night: 0, dof: 2 + 5 * dk, focus: 380 }, A) + `<rect width="1080" height="1920" fill="#1a0e10" opacity="${f(0.12 * die)}"/>` + C.vignette(0.45 + 0.15 * die);
    };
    X.shot('DIES', 38.95, 43.76, fn, { grade: 'gHall' });
  }

  // ======================================================= WAIT: you, frozen
  {
    const cam = youCU([[43.15, [16, 150, 2380], 2600, FACE - 4], [44.9, [10, 152, 2410], 2900, FACE - 2]].map(([t, p, fl, ay]) => [t, p, fl, ay]), 53);
    // (looking from the hall toward the throne: you have your back to... no: we stand before you, the dais behind us)
    const cam2 = V.CAM([[43.15, [-90, 150, 2320], [-8, FACE - 3, 2600], 2400], [44.9, [-55, 154, 2370], [-8, FACE - 1, 2600], 3300]], 0.5, 53);
    V.waitCam = cam2;
    V.waitFace = tt => cam2(tt).proj([0, FACE, 2600]) || [540, 800];
    const fn = t => {
      SH.still();
      const c = cam2(t), A = [];
      // (the darting eyes flick across in a few frames, like a real glance, instead of jumping in one)
      const dart = [0.525 * Math.tanh(Math.sin(t * 2.2) * 9) + 0.025, -0.1];
      const face = { expr: 'fear', look: dart, lid: 0.04, mouth: 'tight', brows: [-10, -2], sweat: 0.9, wide: true };
      const y = youAt(c, t, 0, 2600, face, {}, { breath: -3, noBlink: true, tilt: -1, k: 0, id: 'W' });
      if (y) A.push(y.actor);
      // behind you, out of focus: the King gone cold on his throne, the guards with their eyes on him
      const K = kingSeated(c, t, { expr: 'stern', look: [0, 0.5], lid: 0.4, mouth: 'tight', brows: [9, -4] }, { R: { hand: [-300, -960], dir: [0.3, 0.9], pose: 'fist', facing: 'back' }, L: { hand: [300, -960], dir: [-0.3, 0.9], pose: 'fist', facing: 'back' } }, { id: 'W' });
      if (K) A.push(V.actor(K.st.d, () => H.blurA(K.svg + K.hands, 3.5)));
      for (const [gx, mk, sd, lk] of [[-215, () => Q.guardA, 31, 0.9], [215, () => Q.guardB, 37, -0.9]]) { const g = guardAt(c, t, gx, gx < 0 ? 3070 : 3075, mk, sd, { expr: 'stern', look: [lk, 0.1], lid: 0.24 }, LTd, 1); if (g) A.push(Object.assign({}, g, { svg: () => H.blurA(g.svg(), 3.5) })); }
      return HL.render(c, t, { night: 0, dof: 4, focus: 300 }, A) + C.vignette(0.5);
    };
    X.shot('WAIT', 43.2, 44.85, fn, { grade: 'gHall' });
  }

  // ======================================================= RAGE: he turns on his lords; you keep your head
  {
    const KZ = 2860, KX = -40, YX = 150, YZ = 2600;
    const cam = V.CAM([
      [44.35, [40, 150, 2250], [-110, 150, 2720], 1150],
      [46.3, [20, 156, 2300], [-130, 158, 2740], 1350],
      [47.7, [60, 158, 2300], [-20, 160, 2720], 1300],
      [49.2, [140, 160, 2320], [YX, 150, YZ], 1450],
      [50.45, [150, 158, 2410], [YX, FACE - 2, YZ], 2050],
      [51.95, [151, 157, 2470], [YX, FACE, YZ], 2700]
    ], 0.6, 59);
    V.rageCam = cam;
    V.rageYou = tt => cam(tt).proj([YX, FACE, YZ]) || [540, 800];
    const LORDPOS = [[-230, 2640], [-140, 2690], [-320, 2600], [-255, 2560]];
    const fn = t => {
      SH.still();
      const c = cam(t), A = [];
      const turn = ss(44.6, 45.2, t), shake = env(t, 46.2, 46.4, 47.8, 48.3), toYou = ss(48.4, 49.2, t);
      // the King, standing on the dais edge, turning on the lords: pointing, roaring, trembling
      const kst = V.at(c, KX, KZ, KH, 'man', 60);
      if (kst) {
        // (the rage is a slow heavy tremble of the head and the fists - a few times a second, small - never the whole
        // body buzzing sideways, which read as the picture vibrating)
        const ki = V.idle(t, 9, 0.4), tr = shake * (Math.sin(t * 17) * 0.6 + Math.sin(t * 11.3 + 1.7) * 0.4);
        const ko = { x: kst.x, y: kst.y, s: kst.s, blink: ki.blink, breath: ki.breath + 4 * shake * Math.sin(t * 7), sway: ki.sway * 0.4 + tr * 0.35, tilt: lerp(0, -6, turn) * (1 - toYou) + 3 * toYou + tr * 0.6 };
        const pointA = { hand: [-520, -1180], dir: [-1, -0.1], pose: 'point', facing: 'back' }, fistL = { hand: [160, -1040], dir: [-0.2, -1], pose: 'fist', facing: 'back' };
        const pk = EZ.io(ss(44.9, 45.4, t)) * (1 - EZ.io(ss(48.2, 48.9, t)));
        ko.armR = V.mixArm(V.rest(-1), { hand: [pointA.hand[0], pointA.hand[1] + 9 * tr], dir: pointA.dir, pose: 'point', facing: 'back' }, pk);
        ko.armL = V.mixArm(V.rest(1), { hand: [fistL.hand[0], fistL.hand[1] + 8 * shake * Math.sin(t * 14 + 0.6)], dir: fistL.dir, pose: 'fist', facing: 'back' }, EZ.io(ss(46.1, 46.4, t)) * (1 - EZ.io(ss(48.2, 48.9, t))));
        ko.face = V.faceMix({ expr: 'stern', look: [-0.85, 0.2], lid: 0.1, mouth: turn > 0.5 ? 'snarl' : 'tight', open: 0.25 * turn * (0.6 + 0.4 * Math.sin(t * 9)), brows: [12, -4], sweat: 0.3 * shake }, { expr: 'stern', look: [0.75, 0.25], lid: 0.32, mouth: 'tight', brows: [4, -2] }, ss(0.25, 0.75, toYou));
        const KP = Q.king(ko);
        A.push(V.actor(kst.d, () => SH.draw(KP, ko, null, LTd, '', { castOp: 0.24 })));
      }
      // the lords at the foot of the dais, cowering (hands up), then edging back
      // (their hands come up to cower over a third of a second, from their sides)
      const ck = ss(0.1, 0.7, turn), cowerArms = { R: V.mixArm(V.rest(-1), { hand: [-150, -1040], dir: [0.3, -1], pose: 'open', facing: 'palm' }, ck), L: V.mixArm(V.rest(1), { hand: [150, -1040], dir: [-0.3, -1], pose: 'open', facing: 'palm' }, ck) };
      LORDPOS.forEach(([x, z], i) => { const a = V.courtier(c, t, LTd, V.LORDS[i], x - 30 * shake, z - 20 * shake, 0, 'rest', { expr: 'fear', look: [0.7, -0.3], lid: 0.06, mouth: 'tight', brows: [-10, -2], sweat: 0.5 }, { tilt: 6 * turn, sway: -3 * turn, arms: cowerArms }); if (a) A.push(a); });
      // you, alone: frozen, then standing a little straighter as his eyes come to you; your hand to your neck; a breath
      const neck = EZ.io(ss(50.45, 50.85, t)), exhale = env(t, 50.9, 51.1, 51.5, 51.8);
      const face = V.faceMix(V.faceMix({ expr: 'fear', look: [-0.7, -0.15], lid: 0.08, mouth: 'tight', brows: [-9, -1], sweat: 0.6 }, { expr: 'anxious', look: [-0.6, -0.3], lid: 0.08, mouth: 'tight', brows: [-9, -1], sweat: 0.6 }, ss(0.3, 0.7, toYou)), { expr: 'neutral', look: [-0.3, -0.2], lid: lerp(0.2, 0.85, exhale), mouth: 'smile', brows: [-6, 2] }, ss(0.1, 0.5, neck));
      // (the hand comes up to the neck right beside the shoulder: the elbow eases forward towards the camera with it, so
      // when the arm solver changes sides near the end the elbow is already where the forward pose puts it - it used to
      // jump there in one frame)
      const R0 = Object.assign(V.mixArm(V.rest(-1), { hand: [-96, -1102], dir: [1, -0.16], pose: 'open', facing: 'back' }, neck), { fwd: neck });
      const y = youAt(c, t, YX, YZ, face, { R: R0 }, { breath: -4 * exhale, tilt: -2 + 3 * exhale, k: 0.1 * Math.sin(t * 2), id: 'R' });
      if (y) A.push(y.actor);
      return HL.render(c, t, { night: 0, dof: 2, focus: 450 }, A) + C.vignette(0.42);
    };
    X.shot('RAGE', 44.39, 51.92, fn, { grade: 'gHall' });
  }

  // ======================================================= TIME: days passing over the hall
  {
    const cam = V.CAM([[51.4, [-60, 760, 420], [0, 80, 2400], 1050], [52.95, [-40, 720, 620], [0, 80, 2500], 1100]], 0.4, 61);
    V.timeCam = cam;
    const fn = t => {
      SH.still();
      const c = cam(t), A = [];
      // one night passes over the hall while your eyes are open: the light sinks to night at 52.2 and comes back. The sun
      // keeps the day shots' direction (a sun swinging round flipped its shafts from one clerestory to the other and
      // dropped the shafts whose pools left the floor: both popped), and night never falls below 0.06, where the hall
      // hangs its chandeliers (they popped in and out at 0.05)
      const day = 0.5 - 0.5 * Math.cos((t - 52.2) / 0.95 * TAU);
      const sun = { dir: [-0.42, -0.85, 0.3], k: 0.1 + 0.9 * day }, night = 0.06 + 0.3 * (1 - day);
      const y = youAt(c, t, 220, 2620, { expr: 'neutral', look: [0, 0.2], lid: 0.2, mouth: 'smile' }, { R: { hand: [-150, -1000 - 60 * Math.sin(t * 12)], dir: [0.2, -1], pose: 'fist', facing: 'back' }, L: { hand: [150, -1000 + 60 * Math.sin(t * 12)], dir: [-0.2, -1], pose: 'fist', facing: 'back' } }, { id: 'T', k: Math.sin(t * 6) });
      if (y) A.push(y.actor);
      const K = V.seatedKing(c, t, LTd, { expr: 'neutral', look: [0.4, 0.3], lid: 0.3, mouth: 'smile' }, { R: { hand: [-170, -930], dir: [0.6, 0.6], pose: 'relaxed', facing: 'back' }, L: { hand: [170, -930], dir: [-0.6, 0.6], pose: 'relaxed', facing: 'back' } }, { id: 'T' });
      if (K) A.push(V.actor(K.st.d, () => K.svg + K.hands));
      return HL.render(c, t, { night, sun, candles: 0.3 + night, dof: 0.8, focus: 1500 }, A) + C.vignette(0.4);
    };
    X.shot('TIME', 51.42, 52.9, fn, { grade: 'gHall' });
  }

  // ======================================================= AGAIN: the next messenger; pushed toward the throne
  {
    const YZ0 = 1330, YZ1 = 1480, PUSHT = 54.25;
    const zAt = t => lerp(YZ0, YZ1, EZ.io(ss(PUSHT, PUSHT + 0.9, t)));
    const fy = FACE;
    // the last keys are frame 0's: the same long lens, distance and aim on your face (see CAP)
    const cam = V.CAM([
      [52.45, [30, 160, 1880], [0, 150, 700], 1300],
      [53.5, [20, 158, 1900], [0, 152, 900], 1450],
      [54.3, [8, 156, 1930], [0, fy - 4, YZ1], 2400],
      [55.5, [1, fy + 6, YZ1 + 430], [0, fy - 2.5, YZ1], 15600],
      [56.25, [0, fy + 6, YZ1 + 430], [0, fy - 2, YZ1], 17000]
    ], 0.6, 67);
    V.againCam = cam;
    V.againFace = tt => cam(tt).proj([0, fy, zAt(tt)]) || [540, 960];
    V.againFoolHead = tt => { const c = cam(tt), st = V.at(c, 0, zAt(tt), FH, 'man', 0); if (!st) return null; const id = V.idle(tt, 3, 0.4), lurch = env(tt, PUSHT - 0.15, PUSHT + 0.05, PUSHT + 0.55, PUSHT + 0.95); return V.headOf({ x: st.x, y: st.y + 30 * lurch * st.s, s: st.s, breath: id.breath, sway: id.sway * 0.4, tilt: -2 + 4 * lurch }); };
    const fn = t => {
      SH.still();
      const c = cam(t), A = [];
      // the doors open; the messenger staggers in, his letter held up
      const op = EZ.out(ss(52.6, 53.1, t)), mz = lerp(-60, 260, EZ.out(clamp((t - 52.8) / 1.2)));
      if (t > 52.65) {
        const st = V.at(c, 150, mz, 178, 'man', 0);
        if (st) { const id = V.idle(t, 71), o = { x: st.x, y: st.y, s: st.s, blink: id.blink, breath: id.breath + 3 * Math.sin(t * 8), sway: 2 * Math.sin(t * 5), tilt: 4 }; o.armL = { hand: [200, -1250], dir: [0.2, -1], pose: 'grip', facing: 'back', detachHand: true }; o.armR = V.rest(-1); o.face = { expr: 'anxious', look: [0, 0.2], lid: 0.2, mouth: 'talk', open: Q.talk(t, 0.2, 6), sweat: 0.7 }; const MP = Q.messenger2(o); const gs = R.gripSlot(Q.HAND.messenger2) / Math.hypot(0.2, 1), hw = R.toWorld(o, [200 + 0.2 * gs, -1250 - gs]); A.push(V.actor(st.d, () => SH.draw(MP, o, null, LTd, '', { castOp: 0.2 }) + P17.letter(hw[0], hw[1] - 30 * o.s, o.s * 0.8, 8, { wet: 0.5 }) + V.handsLit(MP, LTd))); }
      }
      // the lords: eyes to the messenger, then to you; two step up behind you and push
      const toYou = ss(53.95, 54.25, t), shove = env(t, PUSHT - 0.15, PUSHT + 0.05, PUSHT + 0.55, PUSHT + 0.95);
      [[-230, 1000, 0], [240, 1040, 1], [-110, YZ0 - 60, 2], [120, YZ0 - 50, 3]].forEach(([x, z, i]) => {
        const behind = i >= 2, zz = behind ? z + (zAt(t) - YZ0) * 0.8 : z;
        const look = V.lerp2([x < 0 ? 0.35 : -0.35, 0.05], [x < 0 ? 0.6 : -0.6, -0.1], ss(0.2, 0.8, toYou));
        const arm = s => V.mixArm(V.rest(s), { hand: [s * (behind ? 120 : 160), -1050], dir: [-s * 0.2, -0.5], pose: 'open', facing: 'palm' }, behind ? shove : 0);
        const a = V.courtier(c, t, LTd, V.LORDS[i], behind ? x * (1 - 0.3 * shove) : x, zz, 0, 'rest', { expr: 'anxious', look, lid: 0.2, mouth: 'tight', brows: [-6, 1] }, { arms: { R: arm(-1), L: arm(1) } });
        if (a) A.push(a);
      });
      // you: dread, then the forced grin as you're pushed toward the throne; at the very end, frame 0's face
      const end = ss(55.4, 56.0, t), lurch = shove;
      const face = V.faceMix(V.faceMix({ expr: 'anxious', look: [0, 0.2], lid: 0.15, mouth: 'tight', brows: [-7, 1] }, { expr: 'fear', look: [0, -0.3], lid: 0.05, mouth: lurch > 0.3 ? 'grin' : 'tight', brows: [-9, -1], sweat: 0.6 }, ss(0.25, 0.75, toYou)), { expr: 'anxious', look: [0.02, -0.75], lid: 0.1, brows: [-7, 2], mouth: 'tight' }, ss(0.25, 0.75, end));
      const y = youAt(c, t, 0, zAt(t), face, {}, { tilt: -2 + 4 * lurch, bob: 30 * lurch, k: 0.5 * lurch, j: lurch, id: 'A', blinkK: 1 - ss(0.15, 0.35, end) });
      if (y) A.push(y.actor);
      const dk = clamp((c.fl - 1500) / 9000);
      return HL.render(c, t, { night: 0, doors: op, dof: 6 * dk + 1.4 * (1 - dk), focus: 420 }, A) + C.vignette(0.35 + 0.1 * (1 - dk));
    };
    X.shot('AGAIN', 52.5, X.T_END + 0.05, fn, { grade: 'gHall' });
  }

  // ---- a pale stone pier crossing the lens (the light-coloured object wipe)
  V.pierWipe = (x, u) => {
    let g = `<defs><linearGradient id="pwG" gradientUnits="userSpaceOnUse" x1="${f(x - 520)}" y1="0" x2="${f(x + 520)}" y2="0"><stop offset="0" stop-color="#6a5e50"/><stop offset="0.3" stop-color="#b8aa94"/><stop offset="0.62" stop-color="#d8ccb4"/><stop offset="1" stop-color="#8a7e6c"/></linearGradient></defs><rect x="${f(x - 520)}" y="-200" width="1040" height="2400" fill="url(#pwG)"/>`;
    for (const k of [-0.6, -0.2, 0.2, 0.6]) g += `<rect x="${f(x + k * 520 - 14)}" y="-200" width="28" height="2400" fill="#000" opacity="0.1"/>`;
    return `<g filter="url(#dof3)">${g}</g>`;
  };

  // ---- transitions (all different from their neighbours; focus points from the cameras, not from drawing)
  // (every swap is two or three frames inside the blur of the move - longer crossfades showed both shots at once)
  X.tr('push', 27.35, 0.6, 'LORDS', 'PUSH', { fa: V.lordsGibbet(27.35), fb: V.pushCam(27.35).proj([0, 160, -60]) || [540, 960], za: 2.2, zb: 0.6, fade: [0.47, 0.53], blur: 6 });
  X.tr('rack', 28.78, 0.36, 'PUSH', 'DANCE', { fa: [540, 900], fb: V.danceFace(28.78), za: 1.05, zb: 0.96, blur: 9, fade: [0.44, 0.56] });
  X.tr('carry', 32.15, 0.6, 'DANCE', 'KING', { mode: 'pan', dir: [1, 0], dist: 0.42, fade: [0.47, 0.53], blur: 10 });
  X.tr('morph', 33.95, 0.6, 'KING', 'SANK', { fa: V.kingFace(33.95), fb: V.sankFace(33.95), za: 1.35, zb: 1.35, align: true, fade: [0.46, 0.54], blur: 4, bpow: 8, col: '#000000' });
  X.tr('liquid', 36.35, 0.5, 'SANK', 'JUMP', { fa: [540, 1100], fb: V.jumpWater(36.35), col: '#1e3a4a', seed: 5 });
  X.tr('surface', 37.9, 0.6, 'JUMP', 'BRAVE', { dir: -1, seed: 9 });
  X.tr('push', 39.25, 0.6, 'BRAVE', 'DIES', { fa: V.braveFace(39.25), fb: V.diesFace(39.25), za: 1.9, zb: 0.62, fade: [0.47, 0.53], blur: 5 });
  X.tr('wipe', 43.48, 0.56, 'DIES', 'WAIT', { dir: 1, truck: 140, obj: (x, u) => V.pierWipe(x, u) });
  X.tr('carry', 44.62, 0.46, 'WAIT', 'RAGE', { mode: 'pan', dir: [-1, 0], dist: 0.36, fade: [0.46, 0.54], blur: 8 });
  // your eyes close on the King's rage and open on the empty hall, days later (the soft radial showed both at once);
  // then the camera trucks past a pier into the next war council (the noise dissolve left smoky blotches)
  X.tr('eyelid', 51.67, 0.5, 'RAGE', 'TIME', {});
  X.tr('wipe', 52.7, 0.44, 'TIME', 'AGAIN', { dir: -1, truck: 120, obj: (x, u) => V.pierWipe(x, u) });
  // the loop: your face at the end becomes your face at frame 0 - the two faces locked together (position, size, turn), only
  // the hall round you dissolves (after delivery: the zoom carry pulled the two faces 4% apart in size while it crossfaded
  // them, a double face and a jolt at 55-56 s)
  X.tr('facematch', X.T_END, 0.62, 'AGAIN', 'CAP', { end: true, bOff: -X.T_END, faceA: V.againFoolHead, faceB: V.capFoolHead, fade: [0.25, 0.75] });
})(window);
