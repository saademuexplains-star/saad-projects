// Shots 13-25: the glare, the trophy wall, the shadow-play, the poem, the blush, the gold, home, the worse letter, the loop.
// Same motion rule as shots_a: eased tracks and smooth oscillations only, hands never jump between targets.
(function (G) {
  const X = G.ENG, K = G.CAST, S = G.SETS, PR = G.PROPS, C = G.CINE, R = G.RIG, LT = X.LT;
  const { track: TK, ss, clamp, lerp, EZ, idle, hh, bump, wave, bob, env } = X;
  const { f, shade, mix } = R;
  const lit = X.lit;
  const FULL = { first: 1, small: 1, fat: 1, bald: 1, coward: 1, doodle: 1 };
  const mirrorAxe = (gx, gy, s, rot, blood = 1) => `<g transform="translate(${f(gx)},${f(gy)}) scale(-1,1)">${PR.axe(0, 0, s, rot, blood)}</g>`;
  const lerp2 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];

  // ======================================================= S13+S14  POV: hands shake; lower the page -> the warlord waits (20.95 - 23.94)
  {
    const lock = t => { const a = X.camS11(t); return [a[0], a[1] - 380, a[2], a[3]]; };
    const after = TK([[21.1, lock(21.1)], [21.75, [540, 1270, 0.97, 0], 'out'], [22.6, [540, 1050, 1.04, 0], 'io'], [24.1, [540, 985, 1.24, 0], 'sine']]);
    const cam = t => t < 21.1 ? lock(t) : after(t);
    const lower = TK([[21.95, 0], [22.6, 1, 'io']]);
    X.shot('S13', 20.95, 23.94, t => {
      const c = hh(cam(t), t, 0.4 + ss(21.1, 21.5, t) * 0.5, 11), lw = lower(t);
      const set = S.hall(t, { fire: false });
      set.splice(1, 0, { p: 0.75, svg: `<g filter="url(#dof2)">${S.warThroneBack(540, 1560, 0.55, 1250)}</g>` });
      const lean = ss(22.75, 23.85, t), talk = env(t, 23.02, 23.1, 23.48, 23.58), tap = wave(t, 1.6) * 10 * env(t, 22.55, 22.9, 23.6, 23.85);
      const war = K.warlord(Object.assign(idle(t, 6), {
        x: 540, y: 2620 + lean * 40, s: 1.32 + lean * 0.12, tilt: -5 * lean + talk * 2,
        face: { expr: 'stern', look: [0, 0.05], brows: [9, -9 - lean * 4], mouth: talk > 0.2 ? 'talk' : 'tight', open: talk * K.talk(t, 0.7, 9), lid: 0.32 },
        armR: { hand: [-190, -1110 + tap], pose: 'fist', facing: 'back', thumb: 'up' },
        armL: { hand: [255, -800], pose: 'fist', facing: 'back' },
        props: mirrorAxe(-190, -1110 + tap, 0.8, -28, 1),
      }));
      X.CAM = c;
      const warLit = lit(war, LT.hall, 0.92);
      const pov = S.pov(t, { y: 1000 + EZ.in2(lw) * 1500, mode: 'open', unroll: 1, shake: ss(21.1, 21.35, t) * (1 - lw * 0.4), scrollY: 1300, r: FULL });
      const layers = X.stage(set, '', 0.92);
      layers.splice(layers.findIndex(L => L.chars), 1, { p: 0.92, svg: warLit, chars: true });
      layers.push({ p: 1, svg: pov });
      return X.compose(layers, c);
    }, { grade: 'gHall' });
  }
  X.tr('carry', 23.94, 0.7, 'S13', 'S15', { dir: [-1, 0], dist: 0.5, blur: 12 });

  // ======================================================= S15  the trophy wall (23.94 - 26.95)
  {
    const cam = TK([[23.75, [1980, 800, 1.32, 0]], [25.95, [430, 810, 1.36, 0], 'sine'], [27.15, [95, 900, 1.58, 0], 'io']]);
    X.shot('S15', 23.94, 26.95, t => {
      const c = hh(cam(t), t, 0.6, 15);
      return X.compose(S.trophy(t), c);
    }, { grade: 'gHall' });
  }
  X.tr('carry', 26.95, 0.62, 'S15', 'S16', { mode: 'zoom', k: 1.4, blur: 4, leak: '#ff9a50', leakOp: 0.75, leakAt: [540, 1250] });

  // ======================================================= S16  shadow-play: pinned, molten silver (26.95 - 30.34)
  {
    const cam = TK([[26.75, [490, 1150, 1.0, 0]], [28.4, [450, 1200, 1.12, 0], 'sine'], [30.5, [320, 1320, 1.55, -2], 'io']]);
    const PX = 540, PY = 1520, SX = 1.06, SY = 1.08, SK = Math.tan(-5 * Math.PI / 180);
    const proj = ([x, y]) => [PX + SX * ((x - PX) + SK * (y - PY)), PY + SY * (y - PY)];
    const tip = TK([[29.15, 0], [29.85, 1, 'io']]), raise = TK([[27.9, 0], [28.7, 1, 'io']]);
    const VX = 950, VY = 1430, VS = 0.55;
    X.shot('S16', 26.95, 30.34, t => {
      const c = hh(cam(t), t, 0.7, 16);
      const k = tip(t), rz = raise(t), struggle = 1 - ss(29.55, 30.05, t);
      const fl = (hz, ph) => struggle * wave(t, hz, ph);
      const vic = K.messenger({ x: 0, y: 0, s: VS, face: { expr: 'fear' },
        armR: { hand: [-120 + fl(1.4, 0) * 60, -1000 + fl(1.1, 1) * 80] }, armL: { hand: [330 + fl(1.3, 2) * 50, -1000 + fl(1.6, 3) * 80] } });
      let sil = `<g transform="translate(${VX},${VY}) rotate(${f(-90 + fl(1, 0) * 2)})">${vic.svg}</g>`;
      const push = wave(t, 1.25) * 8 * struggle;
      sil += K.guard({ x: 540, y: 1520, s: 0.6, sway: -30 + push * 0.2, armR: { hand: [-70, -380 + push] }, armL: { hand: [90, -400 + push] } }).svg;
      sil += K.guard({ x: 900, y: 1520, s: 0.58, sway: -22 + wave(t, 1.1, 1) * 0.8 * struggle, armR: { hand: [-60, -400] }, armL: { hand: [80, -420] } }).svg;
      const hx = 260, hy = -760 - rz * 120, ang = 28 + k * 55;
      const ladle = `<g transform="translate(${hx},${hy}) rotate(${f(ang)})"><path d="M0,-8 L300,-14 L300,6 L0,8Z"/><path d="M280,-30 Q300,70 380,70 Q460,70 470,-30Z"/></g>`;
      sil += K.warlord({ x: -20, y: 1520, s: 0.62, sway: 3 - k * 5, armL: { hand: [hx, hy], pose: 'fist', facing: 'back' }, props: ladle }).svg;
      const a = ang * Math.PI / 180, lipL = [hx + Math.cos(a) * 470 - Math.sin(a) * -30, hy + Math.sin(a) * 470 + Math.cos(a) * -30];
      const lip = proj([-20 + lipL[0] * 0.62, 1520 + lipL[1] * 0.62]), mouth = proj([VX - 1220 * VS, VY]);
      const shadows = `<g filter="url(#silh)" opacity="0.9" transform="translate(${PX},${PY}) scale(${SX},${SY}) skewX(-5) translate(${-PX},${-PY})">${sil}</g>`;
      return X.compose(S.shadowWall(t, k, { shadows, lip, mouth }), c);
    }, { grade: 'gHall' });
  }
  X.tr('dip', 30.34, 0.62, 'S16', 'S17', { za: 0.25, zb: 0.12 });

  // ======================================================= S17-S19  dead into his eyes, the forced smile, the poem (30.34 - 36.33)
  {
    const MX = 540, MY = 2400, MS = 1.2, EYE = MY - 1308 * MS - 2;
    const cam = TK([[30.1, [540, EYE + 20, 3.6, 0]], [32.1, [540, EYE + 20, 4.0, 0], 'sine'], [32.55, [540, EYE + 90, 2.35, 0], 'out'], [33.2, [540, EYE + 120, 2.1, 0], 'sine'], [34.05, [570, 1290, 1.16, 0], 'io'], [36.5, [515, 1250, 1.3, 0], 'sine']]);
    // continuous face tracks: fear -> steel -> forced smile -> the theatrical poem
    const brows = TK([[30.3, [-9, -2]], [30.8, [-9, -2]], [31.4, [7, -2], 'io'], [32.25, [7, -2]], [32.6, [-6, 0], 'io'], [34.95, [-6, 0]], [35.2, [-9, -6], 'out'], [35.7, [-9, -6]], [36.0, [-6, 0], 'io']]);
    const lid = TK([[30.3, 0.06], [30.8, 0.06], [31.4, 0.3, 'io'], [32.25, 0.3], [32.6, 0.22, 'io'], [34.95, 0.22], [35.2, 0.1, 'out'], [35.7, 0.1], [36.0, 0.22, 'io']]);
    const hand = TK([[33.15, [-150, -985]], [33.75, [-330, -1290], 'io'], [34.25, [-300, -1330], 'sine'], [34.6, [-250, -1520], 'io'], [34.95, [-240, -1500], 'sine'], [35.25, [-300, -1420], 'io'], [35.7, [-320, -1360], 'sine'], [36.5, [-200, -1180], 'io']]);
    X.shot('S17', 30.34, 36.33, t => {
      const c = hh(cam(t), t, 0.6 + bump(t, 34.3, 1, 0.45) + bump(t, 35.05, 1.4, 0.5), 17);
      const set = S.hall(t, { fire: false });
      const rb = TK([[34.2, [6, -3]], [34.45, [-6, -8], 'out']])(t);
      set.splice(1, 0, { p: 0.7, svg: `<g filter="url(#dof3)">${lit(K.raider(Object.assign(idle(t, 12), { x: 960, y: 1700, s: 0.55, tilt: ss(34.3, 34.7, t) * 4, face: { look: [-0.6, 0.1], brows: rb, mouth: t > 34.9 ? 'parted' : 'tight' } })), LT.hall, 0.7)}</g>` });
      const poem = env(t, 33.15, 33.35, 36.1, 36.3), grin = ss(32.35, 32.75, t), chuckle = env(t, 32.45, 32.6, 32.95, 33.15) * bob(t, 3.2);
      const dart = 1 - ss(30.75, 31.2, t);
      const mouth = t < 31.0 ? 'parted' : t < 32.35 ? 'tight' : poem > 0.5 ? 'talk' : 'grin';
      const mes = K.messenger(Object.assign(idle(t, 1), {
        x: MX, y: MY, s: MS, tilt: poem * wave(t, 0.42) * 3 + chuckle * 1.5, sway: poem * wave(t, 0.21) * 1.2 + chuckle * 0.6,
        face: { expr: 'anxious', brows: brows(t), lid: lid(t), wide: t < 31.0 || (t > 35.05 && t < 35.75), mouth, open: mouth === 'talk' ? 0.15 + K.talk(t, 0.75, 8) : mouth === 'grin' ? grin * 0.25 + chuckle * 0.12 : 0,
          look: [dart * (wave(t, 1.1) * 0.45 - 0.2), poem > 0.5 ? -0.1 : 0], sweat: 1 },
        armR: { hand: hand(t), pose: t < 33.3 ? 'fist' : (t > 35.0 && t < 35.7 ? 'fist' : 'open'), facing: t < 33.3 ? 'back' : 'palm', thumb: t < 33.3 ? 'up' : 'auto' },
        armL: { hand: [150, -985], pose: 'fist', facing: 'back', thumb: 'up' },
        props: `<rect x="-170" y="-960" width="340" height="560" fill="#d8c6a0" filter="url(#plaster)"/><g opacity="0.12" transform="translate(0,-620) scale(-0.45,0.45)">${S.doodle(0, 0, 0.7, 1)}</g><rect x="-170" y="-960" width="340" height="560" fill="none" stroke="#1f140c" stroke-width="2" vector-effect="non-scaling-stroke"/>` + PR.scroll(0, -985, 380, 56, 0, { seal: false }),
      }));
      return X.compose(X.stage(set, lit(mes, LT.hall)), c);
    }, { grade: 'gHall' });
  }
  X.tr('carry', 36.33, 0.62, 'S17', 'S20', { dir: [1, 0], dist: 0.42, blur: 10, roll: 2.5 });

  // ======================================================= S20  the warlord blushes (36.33 - 38.01)
  {
    const cam = TK([[36.15, [540, 960, 1.85, 0]], [37.2, [540, 930, 2.05, 0], 'sine'], [38.1, [545, 905, 2.35, 0], 'sine']]);
    const brows = TK([[36.0, [8, -3]], [36.7, [8, -3]], [36.95, [-6, -10], 'out'], [37.15, [-6, -10]], [37.55, [-5, 2], 'io']]);
    const lid = TK([[36.0, 0.38], [36.7, 0.38], [36.95, 0.12, 'out'], [37.15, 0.12], [37.55, 0.52, 'io']]);
    const look = TK([[36.0, [0, 0]], [37.2, [0, 0]], [37.55, [-0.45, 0.65], 'io']]);
    X.shot('S20', 36.33, 38.01, t => {
      const c = hh(cam(t), t, 0.5, 20);
      const set = S.hall(t, { fire: false });
      set.splice(1, 0, { p: 0.75, svg: `<g filter="url(#dof2)">${S.warThroneBack(540, 1560, 0.55, 1250)}</g>` });
      const blush = ss(37.1, 37.6, t), gig = env(t, 37.6, 37.75, 38.1, 38.3) * bob(t, 2.6);
      const war = K.warlord(Object.assign(idle(t, 6), {
        x: 540, y: 2450, s: 1.2, tilt: blush * 6 + gig * 1.6, sway: gig * 1.0,
        face: { expr: 'neutral', mouth: t < 36.8 ? 'tight' : t < 37.2 ? 'parted' : 'bashful', blush: 0.08 + blush * 0.85, look: look(t), lid: lid(t) + gig * 0.25, brows: brows(t) },
        armL: { hand: [lerp(255, 95, blush), lerp(-800, -1120, blush) + wave(t, 1) * 10 * blush], pose: blush > 0.5 ? 'relaxed' : 'fist', facing: 'back' },
        armR: { hand: [-250, -820], pose: 'fist', facing: 'back', thumb: 'up' },
        props: mirrorAxe(-250, -820, 0.8, -8, 1),
      }));
      return X.compose(X.stage(set, lit(war, LT.hall)), c);
    }, { grade: 'gHall' });
  }
  X.tr('carry', 38.01, 0.55, 'S20', 'S21', { mode: 'zoom', k: 0.66, blur: 4 });

  // ======================================================= S21+S22  a bag of gold; spared (38.01 - 40.04)
  const cam21 = TK([[37.9, [800, 1330, 1.42, 0]], [38.42, [700, 1290, 1.42, 0], 'io'], [39.0, [-120, 1270, 1.4, 0], 'io'], [39.35, [-140, 1300, 1.38, 0], 'sine'], [40.2, [260, 1170, 0.84, 0], 'io']]);
  {
    const WX = 900, WY2 = 2150, WSs = 0.85, MX = -250;
    const rel = 38.42, cat = 39.02;
    const catchW = [MX, WY2 - 1000 * WSs];
    const flight = t => { const u = clamp((t - rel) / (cat - rel)); return [lerp(WX - 380 * WSs, catchW[0], u), lerp(WY2 - 1150 * WSs, catchW[1], u) - Math.sin(Math.PI * u) * 260, u * 600]; };
    const tHand = TK([[37.8, [-150, -960]], [38.25, [-40, -1260], 'io'], [38.44, [-390, -1150], 'in2'], [38.9, [-330, -1120], 'out']]);
    const wHand = TK([[39.1, [-330, -1120]], [39.35, [-300, -1180], 'io']]);
    const wTilt = TK([[38.0, -2], [38.3, -4, 'io'], [38.5, 3, 'out'], [39.2, 2]]);
    const mHandR = TK([[38.4, [-124, -735]], [38.95, [-68, -1008], 'io']]), mHandL = TK([[38.4, [124, -735]], [38.95, [68, -1008], 'io']]);
    const mBrows = TK([[38.0, [-9, -2]], [38.95, [-9, -2]], [39.25, [-4, -4], 'io']]);
    X.shot('S21', 38.01, 40.04, t => {
      const c = hh(cam21(t), t, 0.6, 21);
      const set = S.hall(t, { fire: false, door: [0, 360], pillars: false });
      const thrown = t >= rel, caught = t >= cat;
      const waveK = ss(39.2, 39.4, t), wv = wave(t, 2.1) * 40 * waveK;
      const th = tHand(t), wh = wHand(t);
      const war = K.warlord(Object.assign(idle(t, 6), {
        x: WX, y: WY2, s: WSs, tilt: wTilt(t),
        face: { expr: 'neutral', mouth: t > 39.2 ? 'smirk' : 'bashful', blush: 0.55 - ss(39.0, 40.0, t) * 0.25, look: [-0.8, 0.1], lid: 0.45, brows: [-3, 0] },
        armR: { hand: waveK > 0 ? [lerp(th[0], wh[0], waveK) + wv, lerp(th[1], wh[1], waveK)] : th, pose: thrown ? 'open' : 'fist', facing: waveK > 0.5 ? 'palm' : 'back', thumb: thrown ? 'auto' : 'up' },
        armL: { hand: [255, -800], pose: 'fist', facing: 'back' },
        props: thrown ? '' : PR.purse(th[0], th[1] + 30, 1.1, 0),
      }));
      const back = ss(39.4, 40.04, t), bow = bump(t, 39.3, 1, 0.5) + bump(t, 39.72, 0.75, 0.5);
      const mes = K.messenger(Object.assign(idle(t, 1), {
        x: MX - back * 150, y: WY2, s: WSs, tilt: bow * 9, sway: -bow * 2.5,
        face: { expr: 'anxious', brows: mBrows(t), wide: !caught, mouth: !caught ? 'parted' : t > 39.3 ? 'grin' : 'smile', look: caught ? (t > 39.3 ? [0.6, 0] : [0.2, 0.5]) : [0.7, -0.3], lid: caught ? 0.25 : 0.08, sweat: 0.6 },
        armR: { hand: mHandR(t), pose: caught ? 'fist' : 'open', facing: caught ? 'back' : 'palm', thumb: caught ? 'up' : 'auto' },
        armL: { hand: mHandL(t), pose: caught ? 'fist' : 'open', facing: caught ? 'back' : 'palm', thumb: caught ? 'up' : 'auto' },
        props: caught ? PR.purse(0, -985, 1.0, wave(t, 0.8) * 4) : '',
      }));
      let fly = '';
      if (thrown && !caught) {
        const [px, py, pr] = flight(t);
        fly += PR.purse(px, py, 0.85, pr);
        for (let i = 0; i < 4; i++) { const tt = t - rel - i * 0.05; if (tt > 0) fly += PR.coin(px + (i - 1.5) * 40 + tt * 120 * (i - 1.5), py + tt * tt * 900 - 40, 14, t * 14 + i); }
      }
      if (caught) for (let i = 0; i < 3; i++) { const tt = t - cat; const y = Math.min(WY2 - 20, WY2 - 980 * WSs + tt * tt * 2400 + i * 10); fly += PR.coin(MX + 60 + i * 40 + tt * 120, y, 13, t * 12 + i); }
      return X.compose(X.stage(set, lit(war, LT.hall) + lit(mes, LT.hall) + fly), c);
    }, { grade: 'gHall' });
  }
  const camS23 = TK([[39.85, [580, 1260, 1.34, 0]], [41.7, [610, 1220, 1.22, 0], 'sine'], [42.4, [650, 1160, 1.25, 0], 'sine']]);
  { const door = X.scr(0, 1060, cam21(40.04), 0.5); X.tr('carry', 40.04, 0.72, 'S21', 'S23', { mode: 'zoom', k: 1.8, fa: door, fb: X.scr(840, 820, camS23(40.04), 0.4), blur: 4, leak: '#fff4e2', leakOp: 0.85, leakAt: door }); }

  // ======================================================= S23  home at sunset, "safe now" (40.04 - 42.18)
  {
    const momTilt = TK([[39.8, 3], [40.6, 7, 'io'], [41.6, 8], [42.3, 5, 'io']]);
    const mesLook = TK([[39.8, [0.2, 0.55]], [40.75, [0.2, 0.55]], [41.0, [-0.35, 0], 'io']]);
    X.shot('S23', 40.04, 42.18, t => {
      const c = hh(camS23(t), t, 0.5, 23);
      const set = S.yard(t);
      const sigh = ss(41.3, 41.7, t), lift = ss(40.3, 40.7, t) - ss(41.2, 41.6, t) * 0.7;
      const laughSoft = env(t, 40.4, 40.6, 41.0, 41.2) * bob(t, 2.2);
      const mom = K.mother(Object.assign(idle(t, 4), {
        x: 360, y: 1700, s: 0.64, tilt: momTilt(t) + laughSoft * 1.5,
        face: { expr: 'tired', mouth: 'smile', tears: true, brows: [-5, 1], lid: 0.4 + laughSoft * 0.2, look: [0.6, -0.1] },
        armL: { hand: [272, -1040], pose: 'relaxed', facing: 'back' },
        armR: { hand: [-30, -990], pose: 'relaxed', facing: 'back' },
      }));
      const mes = K.messenger(Object.assign(idle(t, 1), {
        x: 610, y: 1710, s: 0.66, breath: K.breath(t * 1.1) + sigh * 2.5, tilt: -sigh * 4 + laughSoft * 1.2,
        face: { expr: 'neutral', mouth: laughSoft > 0.3 ? 'grin' : 'smile', open: laughSoft * 0.15, lid: lerp(0.3, 0.85, sigh), brows: [-3, -2], look: mesLook(t) },
        armL: { hand: [lerp(124, 175, lift), lerp(-735, -1060, lift)], pose: 'fist', facing: 'back', thumb: 'up' },
        props: PR.purse(lerp(124, 175, lift), lerp(-735, -1060, lift) + 28, 0.95, wave(t, 0.7) * 3),
      }));
      return X.compose(X.stage(set, lit(mom, LT.dusk) + lit(mes, LT.dusk)), c);
    }, { grade: 'gDusk' });
  }

  // ======================================================= S24  the king writes an even worse letter (42.18 - 43.80)
  const KS = 0.7, KY = 1974;
  const SUN = X.scr(840, 820, camS23(42.18), 0.4), FLAME = [960, 1082];
  const camS24 = TK([[42.18, [FLAME[0] - (SUN[0] - 540) / 1.3, FLAME[1] - (SUN[1] - 960) / 1.3, 1.3, 0]], [42.95, [575, 1250, 1.45, 0], 'out'], [43.35, [560, 1330, 1.38, 0], 'sine'], [43.95, [560, 1720, 1.3, 0], 'in2']]);
  {
    X.shot('S24', 42.18, 43.80, t => {
      const c = hh(camS24(t), t, 0.5, 24);
      const set = S.study(t);
      // a full cackle: head thrown back, shoulders bouncing smoothly
      const back = env(t, 42.2, 42.5, 43.6, 43.9), laugh = back * bob(t, 2.7);
      const scrib = [wave(t, 4.2) * 10 + wave(t, 1.3) * 6, wave(t, 5.6) * 3];
      const qx = 466 + scrib[0], qy = 1340 + scrib[1];
      const herald = K.herald(Object.assign(idle(t, 3), { x: 880, y: 1820, s: 0.62, tilt: 5 + bob(t, 2.4, 1) * 2.5, face: { mouth: 'grin', lid: 0.7, brows: [-4, -3], look: [-0.6, 0.3] }, armR: { hand: [-40, -1235], pose: 'relaxed', facing: 'back' } }));
      const king = K.king(Object.assign(idle(t, 2), {
        x: 540, y: KY, s: KS, sway: laugh * 1.4 - 0.6, tilt: -3 - back * 5 - laugh * 2,
        face: { mouth: 'grin', open: 0.3 + laugh * 0.4, lid: 0.88, brows: [-4, -8], look: [0, 0.3] },
        armR: { hand: [(qx - 540) / KS, (qy + 10 - KY) / KS], pose: 'fist', facing: 'back', thumb: 'up', detachHand: true },
        armL: { hand: [(660 - 540) / KS, (1352 - KY) / KS], pose: 'relaxed', facing: 'back', detachHand: true },
      }));
      const ls = ss(42.3, 43.6, t);
      const ch = `<g filter="url(#dof1)">${lit(herald, LT.study)}</g>` + lit(king, LT.study) + S.desk(t, { longScroll: 0.15 + ls * 0.85 }) + PR.quill(qx - 4, qy + 26, 0.95, 18 + wave(t, 4.2) * 5) + king.handR + king.handL;
      return X.compose(X.stage(set, ch), c);
    }, { grade: 'gNight' });
  }
  X.tr('push', 42.18, 0.62, 'S23', 'S24', { fa: SUN, za: 9, fb: SUN, zb: 9, fade: [0.42, 0.58], blur: 7, easeA: 'in', easeB: 'out' });
  X.tr('carry', 43.80, 0.6, 'S24', 'S25', { dir: [0, 1], dist: 0.5, blur: 14 });

  // ======================================================= S25  dragged back to the castle... AND (43.80 - 45.71) -> loops to S1
  {
    const cam = TK([[43.6, [540, 1225, 1.1, 0]], [45.75, [540, 1300, 1.22, 0], 'sine']]);
    X.shot('S25', 43.80, 45.71, t => {
      const c = hh(cam(t), t, 0.9, 25);
      const set = S.corridor(t, { ph: (t - 43.8) * 1.15 });
      const app = ss(43.8, 45.7, t), step = bob(t, 1.9), ms = 0.82 + app * 0.12, my = 2040 + app * 60;
      const pull = wave(t, 1.0);
      const mes = K.messenger(Object.assign(idle(t, 1), {
        x: 540, y: my - step * 7, s: ms, tilt: pull * 2.2, sway: wave(t, 0.95, 1) * 1.4,
        face: { expr: 'fear', mouth: 'parted', open: 0.36 + wave(t, 1.2) * 0.05, brows: [-11, 3], wide: true, tears: true, sweat: 1, look: [wave(t, 0.5) * 0.5, -0.1] },
        armR: { hand: [-205 + pull * 8, -770 - pull * 10], pose: 'relaxed', facing: 'back' },
        armL: { hand: [205 + pull * 8, -770 + pull * 10], pose: 'relaxed', facing: 'back' },
      }));
      const gs = ms * 1.02, gHands = [];
      let ch = '';
      for (const sd of [-1, 1]) {
        const gy = my - bob(t, 1.9, sd > 0 ? Math.PI : 0) * 8;
        const gx = 540 + sd * 300 * ms / 0.82, grip = [540 + sd * 118 * ms, my - step * 7 - 1050 * ms];
        const arm = { hand: [(grip[0] - gx) / gs, (grip[1] - gy) / gs], pose: 'fist', facing: 'back', detachHand: true };
        const g = K.guard(Object.assign(idle(t, 7 + sd), { x: gx, y: gy, s: gs, sway: -sd * 1.5, face: { look: [sd * -0.3, 0], brows: [9, -4] } }, sd < 0 ? { armL: arm } : { armR: arm }));
        ch += lit(g, LT.corridor); gHands.push(sd < 0 ? g.handL : g.handR);
      }
      ch += lit(mes, LT.corridor) + gHands.join('');
      return X.compose(X.stage(set, ch), c);
    }, { grade: 'gHall' });
  }
  // the loop: carry into frame 0 of S1, finishing exactly on the last frame
  X.tr('carry', X.T_END, 0.62, 'S25', 'S1', { dir: [1, 0], dist: 0.5, blur: 12, end: true, bOff: -X.T_END });
})(window);

