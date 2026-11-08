// Shots 1-12: throne room, cottage, the warlord's hall, the axe, the seal, the letter.
// Motion rule: every movement is a smooth curve (eased keyframes, sines, 0.5-0.5cos bounces). No |sin| kinks,
// no instant jumps of position/rotation; hand-offs happen at one shared world point.
(function (G) {
  const X = G.ENG, K = G.CAST, S = G.SETS, PR = G.PROPS, C = G.CINE, R = G.RIG;
  const { track: TK, ss, clamp, lerp, EZ } = X;
  const { f, shade, mix } = R;
  const TAU = Math.PI * 2;
  const wave = (t, hz, ph = 0) => Math.sin(TAU * hz * t + ph);            // smooth oscillation
  const bob = (t, hz, ph = 0) => 0.5 - 0.5 * Math.cos(TAU * hz * t + ph);  // smooth 0..1 bounce (no kink)
  const env = (t, a, b, c, d) => ss(a, b, t) * (1 - ss(c, d, t));          // smooth on/off window
  X.wave = wave; X.bob = bob; X.env = env;
  const idle = (t, seed, amp = 1) => ({ blink: K.blink(t, seed), breath: K.breath(t * 1.1 + seed), sway: X.noise(t * 0.45, seed) * 0.5 * amp });
  const bump = (t, t0, a = 1, len = 0.35) => (t < t0 || t > t0 + len) ? 0 : a * Math.pow(Math.sin(Math.PI * (t - t0) / len), 2);
  X.bump = bump; X.idle = idle;
  const hh = (c, t, amp = 1, seed = 0) => { const h = X.hand(t, amp, seed); return (X.CAM = [c[0] + h[0], c[1] + h[1], c[2], (c[3] || 0) + h[2]]); };
  X.hh = hh;
  // world -> screen for a camera (rotation ignored)
  X.scr = (wx, wy, c, p = 1) => { const [cx, cy, z] = c, zp = Math.pow(z, p), px = 540 + (cx - 540) * p, py = 960 + (cy - 960) * p; return [540 + (wx - px) * zp, 960 + (wy - py) * zp]; };
  // world point -> a character's local (unscaled) coordinates
  const loc = (p, x, y, s) => [(p[0] - x) / s, (p[1] - y) / s];
  X.loc = loc;

  const LT = X.LT = {
    throne: { from: [-0.9, -0.6], shadow: '#3a3848', shadowOp: 0.5, mid: 0.45, floor: '#4a4250', floorOp: 0.4, contactOp: 0.45, cast: [0.3, 0.1], castOp: 0.22, keyAdd: 0.07, key: '#fff4e6', rims: [{ from: [1, -0.4], col: '#dfe8ff', w: 6, op: 0.55 }], face: { col: '#fff1e0', op: 0.16 } },
    day: { from: [-1, -0.5], shadow: '#3e4250', shadowOp: 0.45, floor: '#4a4a52', floorOp: 0.4, contactOp: 0.45, cast: [0.45, 0.1], castOp: 0.28, rims: [{ from: [1, -0.5], col: '#eef2ff', w: 5, op: 0.45 }], face: { col: '#fffaf0', op: 0.12 } },
    hall: { from: [0.15, 1], shadow: '#241a2a', shadowOp: 0.58, mid: 0.4, floor: '#3a2a2a', floorOp: 0.3, key: '#ff9a50', keyAdd: 0.14, contactOp: 0.5, rims: [{ from: [-1, -0.5], col: '#ff9040', w: 7, op: 0.65 }, { from: [1, -0.7], col: '#7a9ae0', w: 5, op: 0.4 }], face: { col: '#ffb070', op: 0.24 } },
    study: { from: [1, 0.15], shadow: '#1c2034', shadowOp: 0.62, mid: 0.42, floor: '#2a2430', floorOp: 0.3, key: '#ffb060', keyAdd: 0.14, contactOp: 0.3, rims: [{ from: [-1, -0.6], col: '#8aa4e0', w: 6, op: 0.55 }], face: { col: '#ffc080', op: 0.28 } },
    dusk: { from: [1, -0.25], shadow: '#3a2e48', shadowOp: 0.5, floor: '#4a3a48', floorOp: 0.35, key: '#ffb880', keyAdd: 0.12, contactOp: 0.45, cast: [-0.6, 0.08], castOp: 0.3, rims: [{ from: [1, -0.4], col: '#ffc890', w: 8, op: 0.75 }], face: { col: '#ffd0a0', op: 0.2 } },
    corridor: { from: [0, -0.4], shadow: '#221c2a', shadowOp: 0.55, floor: '#2a2228', floorOp: 0.35, key: '#ffa060', keyAdd: 0.1, contactOp: 0.5, rims: [{ from: [-1, -0.3], col: '#ff9a50', w: 7, op: 0.7 }, { from: [1, -0.3], col: '#ff9a50', w: 7, op: 0.7 }], face: { col: '#ffb070', op: 0.2 } },
  };
  const lit = X.lit;

  // ======================================================= S1  throne room (0 - 2.03), also the loop landing
  {
    const cam = TK([[0, [655, 1175, 1.42, 0]], [2.4, [705, 1120, 1.66, 0], 'sine']]);
    const KX = 480, KY0 = 1450, KSc = 0.6, MX = 800, MY = 1880, MSc = 0.7;
    const W0 = [612, 1002];                                   // the hand-off point (world)
    const kRest = [570, 862], mRest = [713, 1365], mChest = [758, 1210];
    const kW = TK([[0, kRest], [0.25, kRest], [0.9, W0, 'io'], [1.52, W0], [2.05, [575, 900], 'io']]);
    const mW = TK([[0, mRest], [0.8, mRest], [1.38, [W0[0] + 6, W0[1] + 4], 'io'], [1.52, [W0[0] + 6, W0[1] + 4]], [2.1, mChest, 'io']]);
    const kLook = TK([[0, [0.7, 0.4]], [0.85, [0.7, 0.4]], [1.0, [0.05, 0.0], 'out'], [1.4, [0.05, 0]], [1.55, [0.6, 0.45], 'out']]);
    const kBrow = TK([[0, [4, -6]], [0.9, [4, -6]], [1.1, [5, -12], 'out'], [1.45, [5, -12]], [1.7, [6, -8]]]);
    const gOff = TK([[0, 0], [0.25, 0], [0.95, 340, 'in2']]);
    const gGrip = TK([[0, 1], [0.15, 1], [0.5, 0, 'io']]);
    const scrollAt = t => (t < 1.52 ? kW(t) : mW(t));
    X.shot('S1', 0, 2.03, t => {
      const c = hh(cam(t), t, 0.5, 1);
      const set = S.throne(t);
      let ch = '';
      const handed = t >= 1.52, sp = scrollAt(t);
      const kh = loc(kW(t), KX, KY0, KSc), mh = loc(mW(t), MX, MY, MSc);
      const give = env(t, 0.5, 0.95, 1.5, 1.9);
      const king = K.king(Object.assign(idle(t, 2), {
        x: KX, y: KY0, s: KSc, sway: give * 1.6 + X.noise(t * 0.45, 2) * 0.4, tilt: -2 + wave(t, 0.2) * 1.2 + env(t, 0.9, 1.1, 1.4, 1.6) * 4,
        face: { mouth: t > 0.95 && t < 1.95 ? 'grin' : 'smirk', look: kLook(t), brows: kBrow(t), lid: lerp(0.42, 0.52, env(t, 0.9, 1.05, 1.4, 1.6)) },
        armL: { hand: kh, pose: handed ? 'relaxed' : 'fist', facing: 'back', thumb: handed ? 'auto' : 'up' },
        props: handed ? '' : PR.scroll(...loc([sp[0] + 4, sp[1] + 10], KX, KY0, KSc), 230, 52, -14),
      }));
      ch += lit(king, LT.throne);
      // the messenger: at t=0 he has just been shoved in (loop landing); he steadies, then bows to take the scroll
      const shove = TK([[0, 5], [0.7, 0, 'out']])(t);
      const calm = ss(0.15, 0.9, t);
      const gd = gGrip(t), off = gOff(t);
      const guards = [], gHands = [];
      if (t < 0.98) {
        const gx = 1040 + off, grip = [882, 1185];
        const lc = loc(grip, gx, 1900, 0.72), rest = [-150, -760];
        const arm = { hand: [lerp(rest[0], lc[0], gd), lerp(rest[1], lc[1], gd)], pose: gd > 0.5 ? 'fist' : 'relaxed', facing: 'back', detachHand: true };
        const g = K.guard(Object.assign(idle(t, 8), { x: gx, y: 1900, s: 0.72, sway: -2 * gd, face: { look: [-0.6, 0.2] }, armR: arm }));
        guards.push(lit(g, LT.throne)); gHands.push(g.handR);
      }
      const bow = env(t, 1.25, 1.5, 1.75, 2.1);
      const mes = K.messenger(Object.assign(idle(t, 1), {
        x: MX, y: MY, s: MSc, sway: shove + X.noise(t * 0.45, 1) * 0.4 - bow * 1.5, tilt: bow * 7,
        face: { expr: 'anxious', brows: [lerp(-10, -6, calm), lerp(-2, 1, calm)], lid: lerp(0.06, 0.2, calm), wide: calm < 0.5, look: handed ? [-0.3, 0.6] : (t < 0.9 ? [-0.75, -0.55] : [-0.6, -0.2]), sweat: 0.35, mouth: calm < 0.5 ? 'parted' : (t > 1.5 ? 'tight' : 'closed') },
        armR: { hand: mh, pose: t > 1.35 ? 'fist' : 'relaxed', facing: 'back', thumb: t > 1.35 ? 'up' : 'auto' },
        props: handed ? PR.scroll(...loc([sp[0] - 2, sp[1] + 10], MX, MY, MSc), 230, 52, -14 + ss(1.52, 2.0, t) * 6) : '',
      }));
      ch += guards.join('') + lit(mes, LT.throne) + gHands.join('');
      return X.compose(X.stage(set, ch), c);
    }, { grade: 'gDay' });
  }
  X.tr('carry', 2.03, 0.7, 'S1', 'S2', { dir: [1, 0], dist: 0.5, blur: 12 });

  // ======================================================= S2  cottage: the herald pays the mother (2.03 - 4.06)
  {
    const cam = TK([[1.85, [590, 1290, 1.58, 0]], [3.45, [640, 1265, 1.62, 0], 'sine'], [4.25, [1010, 1230, 1.5, 0], 'io']]);
    const HX = 760, HY = 1720, HS = 0.64, MoX = 450, MoY = 1700, MoS = 0.62;
    const W1 = [612, 1182];
    const hW = TK([[1.6, [700, 1240]], [2.3, W1, 'io'], [3.05, W1], [3.55, [684, 1235], 'io']]);
    const moW = TK([[1.6, [540, 1230]], [2.45, [540, 1230]], [2.95, [W1[0] + 6, W1[1] + 2], 'io'], [3.08, [W1[0] + 6, W1[1] + 2]], [3.7, [470, 1080], 'io']]);
    X.shot('S2', 2.03, 4.06, t => {
      const c = hh(cam(t), t, 0.6, 2);
      const set = S.cottage(t, { mode: 'day' });
      const taken = t >= 3.05, pp = taken ? moW(t) : hW(t);
      const hl = loc(hW(t), HX, HY, HS), ml = loc(moW(t), MoX, MoY, MoS);
      const indiff = ss(3.1, 3.5, t);
      const herald = K.herald(Object.assign(idle(t, 3), {
        x: HX, y: HY, s: HS, tilt: indiff * -3,
        face: { look: [lerp(-0.6, 0.55, indiff), lerp(0.3, -0.15, indiff)], lid: 0.45, mouth: 'closed', brows: [3, -2] },
        armR: { hand: hl, pose: taken ? 'relaxed' : 'fist', facing: 'back', thumb: taken ? 'auto' : 'up' },
        props: taken ? '' : PR.purse(...loc([pp[0], pp[1] + 17], HX, HY, HS), 0.85, 0),
      }));
      // sobbing: a slow smooth heave, the purse is clutched to her chest
      const sob = bob(t, 1.4);
      const mom = K.mother(Object.assign(idle(t, 4), {
        x: MoX, y: MoY, s: MoS, tilt: 3 + wave(t, 1.4) * 1.2, breath: (sob - 0.5) * 3,
        face: { expr: 'grief', tears: true, look: taken ? [0.1, 0.6] : [0.5, 0.25], mouth: 'cry', open: 0.15 + sob * 0.2 },
        armR: { hand: [-20, -985], pose: 'relaxed', facing: 'back' },
        armL: { hand: ml, pose: t > 2.9 ? 'fist' : 'relaxed', facing: 'back', thumb: 'up' },
        props: taken ? PR.purse(...loc([pp[0], pp[1] + 15], MoX, MoY, MoS), 0.82, 4) : '',
      }));
      const ch = lit(mom, LT.day) + lit(herald, LT.day);
      return X.compose(X.stage(set, ch), c);
    }, { grade: 'gDay' });
  }
  X.tr('wipe', 4.06, 0.62, 'S2', 'S3', { dir: 1, truck: 300 });

  // ======================================================= S3+S4  the longhall; the warlord can't read (4.06 - 6.70)
  {
    const cam = TK([[3.85, [540, 1320, 0.7, 0]], [5.55, [540, 1150, 1.12, 0], 'sine'], [6.75, [540, 1010, 2.25, 0], 'in2']]);
    const WS = 0.55, WY = 1560 + 138 * WS;
    X.WS = WS; X.WY = WY;
    X.seatedWarlord = (t, o) => {
      const w = K.warlord(Object.assign(idle(t, 6), { x: 540, y: WY, s: WS }, o));
      return lit(Object.assign({}, w, { info: Object.assign({}, w.info, { feet: 1560 }) }), LT.hall);
    };
    // the scroll is held by both ends: lap -> up to his eyes -> squint closer -> lowered in frustration
    const sY = TK([[4.0, -880], [4.75, -880], [5.45, -1150, 'io'], [5.9, -1190, 'io'], [6.3, -1170, 'sine'], [6.75, -1010, 'io']]);
    const headT = TK([[4.0, 0], [5.5, 0], [5.85, 7, 'io'], [6.15, -6, 'io'], [6.4, 0, 'io']]);
    const squint = TK([[4.0, 0], [5.4, 0], [5.7, 1, 'io'], [6.3, 1], [6.55, 0.4, 'io']]);
    X.shot('S3', 4.06, 6.70, t => {
      const c = hh(cam(t), t, 0.5, 3);
      const set = S.hall(t);
      let ch = S.warThroneBack(540, 1560, WS, 1250);
      // raiders flanking the throne; their eyes follow the newcomer, then the warlord
      for (const [x, sd] of [[170, 8], [910, 9]]) {
        const lk = TK([[4.0, [x < 540 ? -0.2 : -0.7, 0.4]], [5.2, [x < 540 ? 0.5 : -0.5, 0.2], 'io']])(t);
        const spear = (sx) => `<path d="M${sx},-1650 L${sx},0" stroke="#4a3220" stroke-width="16"/><path d="M${sx},-1650 l-18,40 l18,-110 l18,110Z" fill="#8a9098" stroke="#1f140c" stroke-width="2"/>`;
        ch += lit(K.raider(Object.assign(idle(t, sd), { x, y: 1620, s: 0.5, face: { look: lk },
          armR: x < 540 ? { hand: [-210, -900], pose: 'fist', facing: 'back', thumb: 'up' } : undefined,
          armL: x > 540 ? { hand: [210, -900], pose: 'fist', facing: 'back', thumb: 'up' } : undefined,
          props: spear(x < 540 ? -210 : 210) })), LT.hall);
      }
      const sy = sY(t), sq = squint(t), frust = ss(6.3, 6.6, t);
      ch += X.seatedWarlord(t, {
        tilt: headT(t),
        face: { expr: 'stern', look: [0, lerp(0.45, 0.8, ss(4.8, 5.4, t))], lid: lerp(0.42, 0.72, sq), brows: [lerp(5, 11, Math.max(sq, frust)), lerp(-1, -4, sq)], mouth: frust > 0.5 ? 'snarl' : (sq > 0.5 ? 'tight' : 'closed') },
        armR: { hand: [-152, sy + 8], pose: 'fist', facing: 'back', thumb: 'up' },
        armL: { hand: [152, sy + 8], pose: 'fist', facing: 'back', thumb: 'up' },
        props: PR.scroll(0, sy, 330, 58, 0),
      });
      ch += S.warThroneFront(540, 1560, WS, t);
      const layers = X.stage(set, ch);
      // over-the-shoulder silhouette of the messenger walking in (smooth step rhythm)
      const walk = ss(4.06, 5.6, t), stp = bob(t, 1.7);
      const mes = K.messenger({ x: 210 + walk * 60, y: 2380 - stp * 12, s: 1.05, sway: wave(t, 0.85) * 1.1, face: { expr: 'anxious' } });
      layers.push({ p: 1.32, svg: `<g filter="url(#silh)">${mes.svg}</g>` });
      return X.compose(layers, c);
    }, { grade: 'gHall' });
  }
  X.tr('carry', 6.70, 0.55, 'S3', 'S5', { mode: 'zoom', k: 1.55, fade: [0.4, 0.62], blur: 5 });

  // ======================================================= S5+S6  the axe at the throat, "read it out loud" (6.70 - 10.30)
  {
    const cam = TK([[6.55, [440, 1030, 1.9, 0]], [8.75, [455, 1005, 2.15, 0], 'sine'], [9.35, [880, 900, 1.72, 0], 'io'], [9.85, [900, 920, 1.85, 0], 'sine'], [10.4, [560, 1300, 2.25, 0], 'io']]);
    const shake = t => bump(t, 7.6, 1, 0.5) + bump(t, 9.4, 0.5, 0.4);
    const mLook = TK([[6.6, [0.65, 0.55]], [7.3, [0.65, 0.55]], [7.45, [0.85, -0.15], 'out'], [7.9, [0.85, -0.15]], [8.05, [0.6, 0.6], 'out'], [8.7, [0.6, 0.6]], [8.85, [0.85, -0.2], 'out']]);
    X.shot('S5', 6.70, 10.30, t => {
      let c = cam(t); const sk = shake(t); c = hh(c, t, 0.6 + sk * 2.5, 5);
      const set = S.hall(t, { fire: false, pillars: false });
      set.splice(1, 0, { p: 0.72, svg: `<g filter="url(#dof2)">${S.warThroneBack(700, 1560, 0.55, 1250)}</g>` });
      const press = ss(7.55, 7.95, t), talk = env(t, 8.85, 9.0, 10.15, 10.3), gulp = bump(t, 8.1, 1, 0.45);
      const mes = K.messenger(Object.assign(idle(t, 1), {
        x: 420, y: 2050, s: 0.95, tilt: -3 - press * 5 + gulp * 3, sway: X.noise(t * 1.2, 2) * 0.6,
        face: { expr: 'fear', look: mLook(t), sweat: 1, mouth: press > 0.5 ? 'tight' : 'parted', brows: [-10, -1], lid: 0.08 + gulp * 0.3 },
        armR: { hand: [-205 + wave(t, 2.1) * 4, -1335 + wave(t, 1.7) * 3], pose: 'open', facing: 'palm' },
        armL: { hand: [130, -760], pose: 'fist', facing: 'back', thumb: 'up' },
        props: PR.scroll(130, -744, 230, 52, 76),
      }));
      const grip = [-330 - press * 14, -960 - press * 6];
      const point = ss(9.55, 9.8, t);
      const war = K.warlord(Object.assign(idle(t, 6), {
        x: 1000, y: 2080, s: 1.0, sway: -press * 1.5, tilt: -2 + talk * (wave(t, 0.7) * 2.5 + 1),
        face: { expr: 'stern', mouth: talk > 0.3 ? 'talk' : 'snarl', open: talk * K.talk(t, 0.85, 8.5), look: [-0.85, 0.15], brows: [10, -4] },
        armR: { hand: grip, pose: 'fist', facing: 'back', thumb: 'up' },
        armL: { hand: [lerp(240, 40, point), lerp(-800, -900, point)], pose: point > 0.5 ? 'point' : 'fist', facing: 'back' },
        props: `<g transform="translate(${grip[0]},${grip[1]}) scale(-1,1)">${PR.axe(0, 0, 0.75, 21, 1)}</g>` + C.bloom(grip[0] - 250, grip[1] - 250, 26, '#ffffff', 0.5 * (0.5 + 0.5 * Math.sin(t * 3))),
      }));
      const ch = lit(mes, LT.hall) + lit(war, LT.hall);
      return X.compose(X.stage(set, ch), c);
    }, { grade: 'gHall' });
  }
  X.tr('carry', 10.30, 0.62, 'S5', 'S7', { mode: 'zoom', k: 2.2, fa: [505, 1050], fb: [540, 960], blur: 5 });

  // ======================================================= S7+S8  POV: break the seal, unroll, the first line (10.30 - 12.83)
  const povBg = t => {
    let g = `<rect x="-600" y="-600" width="2300" height="3200" fill="#2a1e16" filter="url(#ground)"/>` + C.radial(540, 2300, 1400, '#ff8a3a', 0.5) + S.embers(540, 2400, 1500, 2400, t, 22, 13);
    return { p: 0.55, svg: `<g filter="url(#dof4)">${g}</g>` };
  };
  X.povBg = povBg;
  {
    const cam = TK([[10.1, [540, 1060, 1.12, 0]], [10.9, [540, 1010, 1.3, 0], 'sine'], [11.6, [540, 1360, 1.02, 0], 'io'], [12.15, [330, 1222, 2.05, 0], 'io'], [12.95, [780, 1228, 2.2, 0], 'sine']]);
    X.shot('S7', 10.30, 12.83, t => {
      const c = hh(cam(t), t, 0.7, 7);
      const open = t >= 10.95;
      const pov = S.pov(t, {
        y: 1000, mode: open ? 'open' : 'closed', broken: ss(10.45, 10.85, t), unroll: ss(10.95, 11.6, t), sealFade: 1 - ss(10.95, 11.25, t), shake: 0.15 + ss(12.2, 12.8, t) * 0.5,
        r: { first: 1, small: 1 },
      });
      return X.compose([povBg(t), { p: 1, svg: pov }], c);
    }, { grade: 'gHall' });
  }
  X.tr('carry', 12.83, 0.6, 'S7', 'S9', { dir: [0, -1], dist: 0.5, blur: 14 });

  // ======================================================= S9  your stomach drops (12.83 - 14.20)
  {
    const camF = TK([[12.6, [540, 905, 1.78, 0]], [13.2, [540, 915, 1.9, 0], 'sine'], [13.42, [540, 975, 2.02, 0], 'out'], [14.35, [540, 935, 2.2, 0], 'sine']]);
    const camB = TK([[12.6, [540, 905, 1.25, 0]], [13.2, [540, 915, 1.2, 0]], [14.35, [540, 935, 0.92, 0], 'out']]);
    X.shot('S9', 12.83, 14.20, t => {
      const cf = hh(camF(t), t, 0.7, 9), cb = [cf[0], cf[1], camB(t)[2], cf[3]];
      const pale = ss(12.95, 13.8, t), gulp = bump(t, 13.85, 1, 0.4);
      const set = S.hall(t, { fire: false, pillars: false });
      const bgWar = K.warlord(Object.assign(idle(t, 6), { x: 830, y: 1800, s: 0.62, face: { expr: 'stern', look: [-0.6, 0.2], brows: [10, -4] } }));
      X.CAM = cb; const bgLit = lit(bgWar, LT.hall, 0.6); X.CAM = cf;
      set.splice(1, 0, { p: 0.6, svg: `<g filter="url(#dof3)">${bgLit}</g>` });
      const back = `<rect x="-190" y="-930" width="380" height="640" fill="#d8c6a0" filter="url(#plaster)"/><g opacity="0.12" transform="translate(0,-610) scale(-0.5,0.5)">${S.doodle(0, 0, 0.7, 1)}</g><rect x="-190" y="-930" width="380" height="640" fill="none" stroke="#1f140c" stroke-width="2" vector-effect="non-scaling-stroke"/>` + PR.scroll(0, -955, 420, 60, 0, { seal: false });
      const tremble = wave(t, 5.5) * 2.5 * ss(13.0, 13.4, t);
      const mes = K.messenger(Object.assign(idle(t, 1), {
        x: 540, y: 2250, s: 1.1, tilt: -gulp * 4, breath: K.breath(t * 3) * 1.5,
        skin: mix('#efc3a4', '#c9cdb8', pale * 0.55),
        face: { expr: 'fear', wide: true, mouth: 'parted', open: lerp(0.18, 0.32, ss(13.2, 13.5, t)) - gulp * 0.15, look: [0, lerp(0.5, 0.1, ss(12.85, 13.1, t))], sweat: 1, lid: 0.04 + gulp * 0.4, brows: [-11, -2] },
        armR: { hand: [-175, -960 + tremble], pose: 'fist', facing: 'back', thumb: 'up' },
        armL: { hand: [175, -960 + tremble], pose: 'fist', facing: 'back', thumb: 'up' },
        props: `<g transform="translate(0,${f(tremble)})">${back}</g>`,
      }));
      const bg = X.compose(set, cb), fg = X.compose([{ p: 1, svg: lit(mes, LT.hall) }], cf);
      return bg + fg;
    }, { grade: 'gHall' });
  }
  X.tr('unroll', 14.20, 0.72, 'S9', 'S10');

  // ======================================================= S10  the king's study: "didn't write a peace treaty" (14.20 - 16.00)
  const KS = 0.7, KY = 1974;
  X.studyKing = (t, o) => K.king(Object.assign(idle(t, 2), { x: 540, y: KY, s: KS }, o));
  {
    const cam = TK([[14.0, [540, 1160, 1.55, 0]], [15.55, [515, 1225, 1.9, 0], 'sine'], [16.15, [482, 1318, 2.6, 0], 'in2']]);
    const kLook = TK([[14.0, [-0.25, 0.75]], [15.1, [-0.25, 0.75]], [15.3, [0.15, 0.05], 'out'], [15.65, [0.15, 0.05]], [15.8, [-0.25, 0.75], 'out']]);
    X.shot('S10', 14.20, 16.00, t => {
      const c = hh(cam(t), t, 0.5, 10);
      const set = S.study(t);
      // a chuckle: smooth shoulder bounce, strongest when he glances up at us
      const chk = (0.55 + 0.45 * env(t, 15.1, 15.3, 15.65, 15.85)) * bob(t, 2.3);
      const scrib = [wave(t, 3.2) * 9 + wave(t, 1.1) * 5, wave(t, 4.4) * 3];
      const qx = 466 + scrib[0], qy = 1340 + scrib[1];
      const king = X.studyKing(t, {
        sway: chk * 0.9 - 0.4, tilt: -3 + chk * 1.6 + env(t, 15.1, 15.3, 15.65, 15.85) * 4,
        face: { mouth: 'grin', lid: 0.55, brows: [8, -10], look: kLook(t), open: 0.08 + chk * 0.22 },
        armR: { hand: [(qx - 540) / KS, (qy + 10 - KY) / KS], pose: 'fist', facing: 'back', thumb: 'up', detachHand: true },
        armL: { hand: [(652 - 540) / KS, (1352 - KY) / KS], pose: 'relaxed', facing: 'back', detachHand: true },
      });
      const ch = lit(king, LT.study) + S.desk(t) + PR.quill(qx - 4, qy + 26, 0.95, 18 + wave(t, 3.2) * 3) + `<g>${king.handR}${king.handL}</g>`;
      return X.compose(X.stage(set, ch), c);
    }, { grade: 'gNight' });
  }
  X.tr('carry', 16.00, 0.62, 'S10', 'S11', { mode: 'zoom', k: 2.4, blur: 5 });

  // ======================================================= S11+S12  the letter: FAT, BALD, COWARD, the doodle (16.00 - 20.95)
  {
    const OX = 90, OY = 100;
    const rev = { small: TK([[16.0, 0.55], [16.95, 1, 'lin']]), fat: TK([[17.78, 0], [18.12, 1, 'sine']]), bald: TK([[18.3, 0], [18.58, 1, 'sine']]), coward: TK([[18.76, 0], [19.18, 1, 'sine']]), doodle: TK([[19.45, 0], [20.65, 1, 'lin']]) };
    const camB = TK([[15.8, [540, 400, 1.55, 0]], [17.0, [560, 520, 1.42, 0], 'sine'], [17.7, [540, 650, 1.24, 0], 'io'], [18.4, [540, 860, 1.24, 0], 'io'], [19.0, [540, 1180, 1.22, 0], 'io'], [19.45, [540, 1330, 1.12, 0], 'sine'], [19.95, [540, 1930, 1.24, 0], 'io'], [21.1, [540, 1960, 1.4, 0], 'sine']]);
    const wordX = (k, w) => 450 - w / 2 + w * k;
    // the quill nib: writes each word with ~2 up-down strokes per letter, glides between words
    const pen = t => {
      const sm = rev.small(t), wl = S.WORDS;
      if (t < 16.95) return [70 + 690 * (sm - 0.55) / 0.45, 318 + wave(t, 5) * 10];
      if (t < 17.78) { const u = ss(16.95, 17.78, t); return [lerp(760, wordX(0, wl[0][4]), u), lerp(318, wl[0][2] - 80, u) - Math.sin(u * Math.PI) * 120]; }
      for (let i = 0; i < 3; i++) {
        const [key, txt, y, , w] = wl[i], v = rev[key](t);
        const t0 = [17.78, 18.3, 18.76][i], t1 = [18.12, 18.58, 19.18][i];
        if (t >= t0 && t <= t1) return [wordX(v, w), y - 80 - Math.sin(v * Math.PI * 2 * (txt.length - 1) * 0.9) * 50];
        if (i < 2 && t > t1 && t < [18.3, 18.76][i]) { const u = ss(t1, [18.3, 18.76][i], t), nw = wl[i + 1]; return [lerp(wordX(1, w), wordX(0, nw[4]), u), lerp(y - 80, nw[2] - 80, u) - Math.sin(u * Math.PI) * 100]; }
      }
      if (t < 19.45) { const u = ss(19.18, 19.45, t); return [lerp(wordX(1, 780), 620, u), lerp(1070, 1850, u) - Math.sin(u * Math.PI) * 120]; }
      const d = ss(19.45, 20.65, t), a = d * 18;
      return [450 + Math.cos(a) * 170 * (1 - d * 0.3), 1850 + Math.sin(a * 1.3) * 230];
    };
    X.camS11 = camB;
    X.shot('S11', 16.00, 20.95, t => {
      let c = camB(t);
      const pz = bump(t, 18.0, 0.06, 0.4) + bump(t, 18.5, 0.05, 0.4) + bump(t, 18.95, 0.07, 0.45);
      c = hh([c[0], c[1], c[2] * (1 + pz), c[3]], t, 0.4, 11);
      const r = { first: 1, small: rev.small(t), fat: rev.fat(t), bald: rev.bald(t), coward: rev.coward(t), doodle: rev.doodle(t) };
      const desk = `<rect x="-800" y="-600" width="2700" height="3400" fill="#3a2414" filter="url(#woodH)"/>` + C.radial(1100, 300, 1600, '#ffb060', 0.35) + `<rect x="-800" y="-600" width="2700" height="3400" fill="#101428" opacity="0.35" style="mix-blend-mode:multiply"/>`;
      const sheet = `<rect x="${OX + 14}" y="${OY + 18}" width="${S.PW}" height="2620" fill="#000" opacity="0.4" filter="url(#b14)"/><g transform="translate(${OX},${OY})">${S.sheet(2620, { r })}</g>`;
      const [px, py] = pen(t), nib = [OX + px, OY + py + 60];
      const hpos = [nib[0] + 70, nib[1] - 120];
      const sleeve = (() => { const A = [nib[0] + 520, nib[1] + 900], B = [hpos[0] + 40, hpos[1] + 70]; const dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L, w1 = 300, w2 = 200; return `<path d="M${f(A[0] + nx * w1 / 2)},${f(A[1] + ny * w1 / 2)} L${f(B[0] + nx * w2 / 2)},${f(B[1] + ny * w2 / 2)} A${w2 / 2},${w2 / 2} 0 0 0 ${f(B[0] - nx * w2 / 2)},${f(B[1] - ny * w2 / 2)} L${f(A[0] - nx * w1 / 2)},${f(A[1] - ny * w1 / 2)}Z" fill="#6e1824" stroke="#1f140c" stroke-width="2" vector-effect="non-scaling-stroke"/><path d="M${f(B[0] + nx * w2 / 2)},${f(B[1] + ny * w2 / 2)} A${w2 / 2},${w2 / 2} 0 0 0 ${f(B[0] - nx * w2 / 2)},${f(B[1] - ny * w2 / 2)}" stroke="#d8ab40" stroke-width="14" fill="none"/>`; })();
      const quill = PR.quill(nib[0], nib[1], 1.25, 28);
      const handSvg = `<g filter="url(#skinS)">${R.hand({ x: hpos[0], y: hpos[1], dir: [-0.55, -1], side: 'R', facing: 'back', thumb: 'auto', pose: 'fist', size: 250, skin: '#e9bf9f' })}</g>`;
      const handLayer = `<g filter="url(#clothN)">${sleeve}</g>` + quill + handSvg + `<ellipse cx="${nib[0] + 40}" cy="${nib[1] + 40}" rx="160" ry="60" fill="#000" opacity="0.25" filter="url(#b14)"/>`;
      const layers = [{ p: 0.92, svg: desk }, { p: 1, svg: sheet }];
      const away = ss(20.6, 20.95, t);
      if (t < 21.0) layers.push({ p: 1.06, svg: `<g transform="translate(${f(away * 420)},${f(-away * 320)})">${handLayer}</g>` });
      return X.compose(layers, c);
    }, { grade: 'gPage' });
  }
  X.tr('push', 20.95, 0.4, 'S11', 'S13', { za: 1, zb: 1, blur: 2, fade: [0.15, 0.85] });

  G.LT = LT;
})(window);


