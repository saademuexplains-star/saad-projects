// "The Calf's Blood" part 2: Paris calls it a miracle -> weeks later the madness is back, your wife drags you out ->
// the doctor hesitates at his door, she begs on her knees -> the second transfusion at night: the shaking, your death,
// the candle going out -> the doctor dragged into court, charged with murder; the paper of white powder held up ->
// your wife at the hearth, pouring it into your soup, looking up at us -> (loop) you, mad in the street.
(function (G) {
  const X = G.ENG, Q = G.QCAST, S = G.SETS, PR = G.PROPS, C = G.CINE, R = G.RIG;
  const { ss, clamp, lerp, EZ } = X;
  const { f } = R;
  const D2R = Math.PI / 180;
  const { env, bump, idle, hh, scr, nrm, L2, add, fist, handAt, armsOver, handsLit, CAM, headW, LT, kneel, seatedSheet, mixArm } = G.SHOTS_N;
  const lit = X.lit, ST = G.CALF, T = X.T_END;
  const LT2 = {
    day: { from: [-0.7, -0.6], shadow: '#2a2014', shadowOp: 0.4, floor: '#4a4030', floorOp: 0.28, contactOp: 0.4, key: '#fff4e0', keyAdd: 0.07, rims: [{ from: [-1, -0.4], col: '#fff0c8', w: 6, op: 0.45 }], face: { col: '#fff0e0', op: 0.1 } },
    homeDay: { from: [-0.8, -0.4], shadow: '#1e140c', shadowOp: 0.42, floor: '#2a1a10', floorOp: 0.28, contactOp: 0.4, key: '#fff0d8', keyAdd: 0.06, rims: [{ from: [-1, -0.3], col: '#fff0c8', w: 6, op: 0.45 }, { from: [1, -0.1], col: '#ff9a50', w: 5, op: 0.35 }], face: { col: '#ffe8d0', op: 0.1 } },
    dusk: { from: [0.9, -0.3], shadow: '#1a0a08', shadowOp: 0.45, floor: '#2a1810', floorOp: 0.3, contactOp: 0.4, key: '#ffb890', keyAdd: 0.06, rims: [{ from: [1, -0.2], col: '#ff8a50', w: 8, op: 0.6 }, { from: [-1, -0.3], col: '#6a4a8a', w: 4, op: 0.25 }], face: { col: '#ffc8a0', op: 0.12 } },
    night: { from: [0.8, -0.3], shadow: '#0a0608', shadowOp: 0.5, floor: '#100a0a', floorOp: 0.32, contactOp: 0.42, key: '#ffc890', keyAdd: 0.03, rims: [{ from: [1, -0.2], col: '#ffb060', w: 7, op: 0.55 }, { from: [-1, -0.4], col: '#8aa0d8', w: 5, op: 0.45 }], face: { col: '#ffd0a8', op: 0.09 } },
    court: { from: [-0.5, -0.7], shadow: '#1a120a', shadowOp: 0.42, floor: '#2a2018', floorOp: 0.28, contactOp: 0.4, key: '#fff0dc', keyAdd: 0.06, rims: [{ from: [-1, -0.3], col: '#fff0d0', w: 6, op: 0.45 }, { from: [1, -0.3], col: '#fff0d0', w: 5, op: 0.35 }], face: { col: '#ffe8d0', op: 0.1 } },
    hearth: { from: [0.4, 0.2], shadow: '#140804', shadowOp: 0.45, floor: '#1a0c06', floorOp: 0.3, contactOp: 0.4, key: '#ffb878', keyAdd: 0.06, rims: [{ from: [0.6, 0.6], col: '#ff8a40', w: 9, op: 0.65 }, { from: [-1, -0.4], col: '#d8c8b0', w: 4, op: 0.3 }], face: { col: '#ffb880', op: 0.16 } },
  };

  // ======================================================= MIRACLE: Paris by day, the crowd at the doctor's door (26.45 - 29.1)
  // "and Paris calls it a miracle."
  {
    const CR = { x: 330, y: 1705, s: 0.66 }, DO = { x: 760, y: 1790, s: 0.58 };
    const crate = `<path d="M200,1810 L200,1700 L460,1700 L460,1810Z" fill="#7a5632" filter="url(#woodH)" stroke="#1a120c" stroke-width="2.4"/><path d="M200,1736 L460,1736 M200,1772 L460,1772 M210,1700 L450,1810 M450,1700 L210,1810" stroke="#4a3018" stroke-width="5" opacity="0.7"/>`;
    const fn = t => {
      const c = hh(cam(t), t, 0.28, 51);
      const L = LT2.day, set = S.paris(t, { mode: 'day', crowd: 1, doorOpen: 1 });
      // the crier on his crate waves the pamphlet (a woodcut of the calf and the man) over his head, shouting
      const co = Object.assign(idle(t, 61, 0.4), CR), wv = Math.sin(t * 5.2), ang = 12 * wv;
      const gW = R.toWorld(co, [-205 + 32 * wv, -1430]);
      const pam = `<g transform="translate(${f(gW[0])},${f(gW[1])}) rotate(${f(ang)}) translate(0,-118)">${PR.pamphlet()}</g>`;
      const Cr = Q.crier(Object.assign({}, co, { face: { expr: 'neutral', mouth: 'talk', open: 0.12 + Q.talk(t, 0.26, 8), lid: 0.08, brows: [-7, 3], look: [0.35, 0.15] }, armR: fist(co, 'crier', gW, [Math.sin(ang * D2R) * 0.3 + 0.25, -1]), armL: { hand: [268, -1010], dir: [0.8, -0.3], pose: 'open', facing: 'palm' } }));
      // the doctor on his step: a small bow, a smug smile, a lifted hand to the crowd
      const bow = env(t, 27.3, 27.6, 27.85, 28.2), wave2 = EZ.io(ss(28.0, 28.5, t));
      const dO = Object.assign(idle(t, 67, 0.3), DO, { y: DO.y + 10 * bow });
      const D = Q.doctor(Object.assign({}, dO, { tilt: -5 * bow, face: { expr: 'stern', mouth: 'smile', lid: 0.42, brows: [3, -2], look: L2([-0.2, 0.55], [-0.5, 0.2], wave2) }, armR: { hand: [-150, -770], dir: [0.1, 1], pose: 'relaxed', facing: 'back' }, armL: mixArm({ hand: [150, -770], dir: [-0.1, 1], pose: 'relaxed', facing: 'back' }, { hand: [250, -1240], dir: [0.15, -1], pose: 'open', facing: 'palm' }, wave2) }));
      ST.mir = { D, Cr };
      return X.compose(X.stage(set, crate + lit(D, L) + lit(Cr, L) + pam + handsLit(Cr, L)), c) + C.vignette(0.45);
    };
    // arrive low in the cheering crowd; crane up past the crier's waving pamphlet to the doctor bowing at his door
    const cam = CAM([[26.45, [560, 1400, 0]], [27.6, [600, 1180, 0], 'io'], [29.1, [640, 1000, 0], 'sine']], [[26.45, 1.25], [27.6, 1.08, 'io'], [29.1, 1.0, 'sine']]);
    ST.mirCam = cam;
    X.shot('MIRACLE', 26.45, 29.1, fn, { grade: 'gDay' });
  }

  // ======================================================= RELAPSE: the madness comes back; dragged out (28.3 - 32.7)
  // "Weeks later the madness comes back, so your wife drags you in for a second dose."
  {
    const HM = S.HM, YS = 0.74, HIPY = 1432, BOWL = [452, 1396];
    const rise = t => EZ.io(ss(30.4, 30.95, t)), go = t => EZ.io(ss(30.85, 32.7, t));
    const youX = t => lerp(430, 1000, go(t));
    const swp = t => EZ.out2(ss(29.38, 29.62, t));
    const fly = t => clamp((t - 29.55) / 0.42);
    const LAND = 0.86, landT = 29.55 + 0.42 * LAND;
    const bowlAt = u => [BOWL[0] + 700 * u, BOWL[1] - 300 * u + 900 * u * u];
    const fn = t => {
      const c = hh(cam(t), t, 0.3, 57);
      const L = LT2.homeDay, set = S.home(t, { mode: 'day' });
      const r = rise(t), x = youX(t), mad = ss(28.75, 29.2, t);
      const yo = Object.assign(idle(t, 63, 0.4), { x, y: lerp(HIPY + 745 * YS, 1800, r), s: YS, sway: 1.5 * Math.sin(t * 7) * mad * (1 - r) - 4 * go(t) * (1 - go(t)) * 4, tilt: 7 * bump(t, 28.9, 1, 0.35) - 6 * bump(t, 29.25, 1, 0.3) + 4 * Math.sin(t * 6) * mad });
      // arms: resting either side of the bowl; the left sweeps it off the table; then the wife has your left wrist
      const tabR = { hand: R.toLocal(yo, [330, 1402]), dir: nrm(R.dirLocal(yo, [0.6, 0.8])), pose: mad > 0.5 ? 'open' : 'relaxed', facing: 'back' };
      const tabL = { hand: R.toLocal(yo, [580, 1402]), dir: nrm(R.dirLocal(yo, [-0.6, 0.8])), pose: mad > 0.5 ? 'open' : 'relaxed', facing: 'back' };
      const swpL = { hand: R.toLocal(yo, [770, 1230]), dir: nrm(R.dirLocal(yo, [0.9, -0.3])), pose: 'open', facing: 'back' };
      const hang = { hand: [262, -880], dir: [0.6, 0.8], pose: 'open', facing: 'back' };
      // your wife comes in from the right, takes your wrist and pulls you up and out of the door
      const wIn = EZ.out2(ss(30.1, 30.55, t)), wx = lerp(1250, x + 360, wIn);
      const wo = Object.assign(idle(t, 71, 0.3), { x: wx, y: 1800, s: 0.72, sway: -2.5 * go(t) * (1 - go(t)) * 4 });
      const yourWrist = add(R.toWorld(yo, [80, -1000]), [235, 0]);
      const held = ss(30.4, 30.6, t);
      let armL = swp(t) < 1 ? mixArm(tabL, swpL, swp(t)) : mixArm(swpL, hang, ss(29.7, 30.2, t));
      if (held > 0) armL = mixArm(armL, Object.assign(handAt(yo, yourWrist, [1, 0.15], { pose: 'relaxed' })), held);
      const armR = r > 0.01 ? mixArm(tabR, { hand: [-206, -660], dir: [0.06, 1], pose: 'relaxed', facing: 'back' }, r) : tabR;
      const yf = t < 28.7 ? { expr: 'tired', mouth: 'closed', lid: 0.42, look: [0.1, 0.6], brows: [-2, 1] }
        : t < 29.75 ? { expr: 'fear', mouth: 'snarl', lid: 0.02, brows: [8, -5], look: [0.5 * Math.sin(t * 9), 0.1], wide: true, redEyes: 0.8, bags: 0.6, sweat: 0.4 }
        : t < 30.4 ? { expr: 'fear', mouth: 'grin', lid: 0.0, brows: [8, -5], look: [0.6, 0.5], wide: true, redEyes: 0.85, bags: 0.6, sweat: 0.5 }
        : { expr: 'fear', mouth: 'talk', open: 0.06 + Q.talk(t, 0.2, 9), lid: 0.03, brows: [7, -4], look: [0.75, -0.1], wide: true, redEyes: 0.85, bags: 0.6, sweat: 0.5 };
      const Y = Q.you(Object.assign({}, yo, { face: yf, armR, armL }));
      const wf = { expr: 'grief', mouth: 'tight', lid: 0.3, brows: [-8, 2], look: [-0.8, 0.1], tears: 0.6 };
      const Wf = Q.wife(Object.assign({}, wo, { face: wf, armR: fist(wo, 'wife', add(yourWrist, [26, 2]), [0.15, 1]), armL: { hand: [250, -900], dir: [0.6, 0.6], pose: 'relaxed', facing: 'back' } }));
      // the bowl: on the table, swept off, tumbling, smashing on the boards; soup across the floor
      let bowl = '';
      const u = fly(t);
      if (t < 29.55) bowl = PR.soupBowl(BOWL[0], BOWL[1], 0.9, t, {});
      else if (t < landT) { const p = bowlAt(u); bowl = `<g transform="rotate(${f(420 * u)} ${f(p[0])} ${f(p[1])})">${PR.soupBowl(p[0], p[1], 0.9, t, { steam: false })}</g>`; for (let i = 0; i < 10; i++) { const q = bowlAt(Math.max(0, u - 0.04 * i)); bowl += `<circle cx="${f(q[0] - 20 + i * 7)}" cy="${f(q[1] - 10 + i * 9)}" r="${f(9 - i * 0.6)}" fill="#b8843a" opacity="${f(0.85 - i * 0.06)}"/>`; } }
      else {
        const k = clamp((t - landT) / 0.35), r2 = R.rng(9), [lx] = bowlAt(LAND);
        bowl = `<ellipse cx="${f(lx)}" cy="1800" rx="${f(60 + 140 * EZ.out(k))}" ry="${f(10 + 22 * EZ.out(k))}" fill="#a8783a" opacity="0.85"/>`;
        for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI - Math.PI, d = 40 + 160 * EZ.out(k) * (0.5 + r2()); bowl += `<path d="M${f(lx + Math.cos(a) * d)},${f(1795 + Math.sin(a) * d * 0.15)} l${f(20 + r2() * 30)},${f(-6 - r2() * 10)} l${f(-10 + r2() * 10)},${f(14)}Z" fill="#7a5032" stroke="#1a120c" stroke-width="2" transform="rotate(${f(r2() * 360)} ${f(lx + Math.cos(a) * d)} 1795)"/>`; }
      }
      // (drawn clipped above the table's apron: whoever sits behind it is hidden from the waist down)
      const clip = `<defs><clipPath id="rlclip"><rect x="-2000" y="-2000" width="5000" height="3640"/></clipPath></defs>`;
      ST.rel = { Y, yo, Wf, wo };
      return X.compose(X.stage(set, clip + `<g clip-path="url(#rlclip)">${lit(Y, L)}</g>` + S.hmTable() + (t < 29.55 ? bowl : '') + armsOver(Y, L) + handsLit(Y, L) + (t >= 29.55 ? bowl : '') + lit(Wf, L) + handsLit(Wf, L)), c) + C.vignette(0.5);
    };
    // on your still face over the soup; the twitch; follow the bowl off the table to the floor; truck right with
    // her as she drags you to the door
    const cam = CAM(
      [[28.3, [470, 1060, 0]], [29.15, [470, 1040, 0.3], 'sine'], [30.05, [640, 1260, 0], 'sine'], [30.65, [650, 1040, 0], 'io'], [32.7, [1180, 990, 0], 'sine']],
      [[28.3, 1.9], [29.15, 2.12, 'sine'], [30.05, 1.35, 'sine'], [30.65, 1.8, 'io'], [32.7, 2.1, 'sine']]);
    ST.relCam = cam;
    X.shot('RELAPSE', 28.3, 32.7, fn, { grade: 'gDay' });
  }

  // ======================================================= DOOR: dusk; the doctor hesitates; she begs (31.9 - 35.0)
  // "The doctor hesitates. But your wife begs,"
  {
    const DO = { x: 760, y: 1790, s: 0.58 }, WF = { x: 400, y: 1990, s: 0.74 }, YO = { x: 170, y: 1960, s: 0.78 };
    const door = t => 1 - 0.32 * env(t, 32.85, 33.4, 34.15, 34.7);
    const kn = t => EZ.io(ss(33.6, 34.15, t));
    const fn = t => {
      const c = hh(cam(t), t, 0.28, 73);
      const L = LT2.dusk, set = S.paris(t, { mode: 'dusk', doorOpen: door(t) });
      // the doctor in his doorway: looks at her, at you, away, his hand on the door frame
      const dO = Object.assign(idle(t, 79, 0.25), DO), away = env(t, 32.85, 33.15, 33.55, 33.85);
      const D = Q.doctor(Object.assign({}, dO, { face: { expr: 'anxious', mouth: 'tight', lid: 0.3, brows: [-7, 2], look: L2(L2([-0.5, 0.55], [0.65, 0.15], away), [-0.4, 0.7], ss(34.0, 34.4, t)) }, armR: { hand: [-150, -770], dir: [0.1, 1], pose: 'relaxed', facing: 'back' }, armL: handAt(dO, [902 - 40 * (1 - door(t)), 1330], [0.15, 1], { pose: 'open' }) }));
      // your wife sinks to her knees, hands pressed together, pleading up at him
      const k = kn(t), wO = Object.assign(idle(t, 83, 0.3), WF), kw = kneel(wO, WF.y, '#4e4842', 'drkneel', 0.28 * k);
      const lift = [10 * k, 60 * k];
      const Wf = Q.wife(Object.assign({}, kw.o, { face: { expr: 'grief', mouth: 'talk', open: 0.06 + Q.talk(t, 0.18, 7), lid: 0.18, brows: [-12, 4], look: [0.55, -0.7], tears: 1 }, armR: mixArm({ hand: [-150, -760], dir: [0.1, 1], pose: 'relaxed', facing: 'back' }, { hand: add([-20, -1070], lift), dir: [0.15, -1], pose: 'open', facing: 'palm' }, ss(33.7, 34.1, t)), armL: mixArm({ hand: [150, -760], dir: [-0.1, 1], pose: 'relaxed', facing: 'back' }, { hand: add([20, -1070], lift), dir: [-0.15, -1], pose: 'open', facing: 'palm' }, ss(33.7, 34.1, t)) }));
      // you, behind her, swaying, grinning at nothing
      const yo = Object.assign(idle(t, 89, 0.5), YO, { sway: 2 * Math.sin(t * 1.3), tilt: 5 * Math.sin(t * 1.7) });
      const Y = Q.you(Object.assign({}, yo, { face: { expr: 'fear', mouth: 'grin', lid: 0.02, brows: [8, -5], look: [0.5 * Math.sin(t * 2.3), -0.3], wide: true, redEyes: 0.8, bags: 0.6, sweat: 0.4 }, armR: { hand: [-206, -660], dir: [0.06, 1], pose: 'relaxed', facing: 'back' }, armL: { hand: [230, -720], dir: [0.3, 0.9], pose: 'open', facing: 'back' } }));
      ST.door = { D, dO, Wf, wo: kw.o };
      return X.compose(X.stage(set, lit(D, L) + lit(Y, L) + kw.clip + `<g clip-path="url(#drkneel)">${lit(Wf, L)}</g>` + kw.pool), c) + C.vignette(0.5);
    };
    // on the doctor in his doorway; he hesitates; down to her on her knees, pushing in on her face
    const cam = CAM([[31.9, [640, 1170, 0]], [32.65, [700, 1250, 0], 'io'], [33.55, [720, 1240, 0.3], 'sine'], [34.25, [450, 1390, 0], 'io'], [35.0, [420, 1340, 0], 'sine']],
      [[31.9, 1.35], [32.65, 1.6, 'io'], [33.55, 1.75, 'sine'], [34.25, 1.7, 'io'], [35.0, 1.95, 'sine']]);
    ST.doorCam = cam;
    X.shot('DOOR', 31.9, 35.0, fn, { grade: 'gDusk' });
  }

  // ======================================================= TRANS2: the second dose, at night; you die (34.2 - 40.4)
  // "and the silver tube slides back into your arm. Your body starts to shake and this time you die."
  {
    const U = S.SU, CF = { x: U.CALF[0], y: U.CALF[1], s: U.CS, dir: -1 };
    const YO = { x: 860, y: 1985, s: 0.78 }, DO = { x: 420, y: 1760, s: 0.72 }, SG = { x: -660, y: 1760, s: 0.72 }, PB = { x: 862, y: 1640, s: 0.8 };
    const WR = [470, 1196], LW = [1036, 1384], SAG = 70, CND = [1150, 1160];
    ST.candleSmoke = [CND[0] + 20, CND[1] - 300];
    const outD = t => lerp(44, 0, EZ.io(ss(35.25, 36.1, t)));
    const flow = t => EZ.sine(ss(35.95, 37.0, t));
    const shake = t => ss(37.15, 37.45, t) * (1 - ss(38.5, 38.95, t));
    const dead = t => EZ.io(ss(38.7, 39.3, t));
    const out = t => ss(39.1, 39.35, t);
    const youAt = t => { const i = idle(t, 11, 0.3), sh = shake(t), d = dead(t); return Object.assign(i, YO, { sway: i.sway * (1 - d) + 1.0 * sh * Math.sin(t * 44) + 0.6 * sh * Math.sin(t * 29), tilt: 8 * sh * Math.sin(t * 34) + 14 * d, y: YO.y - 8 * sh * Math.sin(t * 57) + 8 * d }, d > 0.5 ? { blink: 0, breath: 0 } : {}); };
    const calfAt = t => PR.calf(Object.assign({}, CF, { t, blink: bump(t, 35.6, 1, 0.22) + bump(t, 39.8, 1, 0.22), fear: 0.4 + 0.6 * ss(36.8, 37.4, t), eyeWet: 0.8, head: 2 * Math.sin(t * 0.8) + 5 * shake(t) * Math.sin(t * 31) }));
    const fn = t => {
      const sh = shake(t), d = dead(t);
      const c = hh(cam(t), t, 0.25 + 1.2 * sh, 13);
      const L = LT2.night, set = S.surgery(t, { mode: 'night' });
      const yo = youAt(t);
      const st = seatedSheet(yo, U.FY, '#c8c0ac', 'tr2lap');
      const armR = { hand: R.toLocal(yo, WR), dir: nrm(R.dirLocal(yo, [-1, 0.04])), pose: sh > 0.3 ? 'fist' : 'open', facing: 'palm', bare: true };
      const armL = { hand: R.toLocal(yo, add(LW, [3 * sh * Math.sin(t * 50), 0])), dir: nrm(R.dirLocal(yo, [0.25, 1])), pose: d > 0.5 ? 'relaxed' : 'fist', facing: 'back' };
      const yf = t < 37.15 ? { expr: 'fear', mouth: 'parted', lid: 0.05, brows: [-12, 5], look: [-0.8, 0.5], wide: true, redEyes: 0.6, bags: 0.6, sweat: 0.6 }
        : d < 0.5 ? { expr: 'fear', mouth: 'snarl', open: 0.2, lid: 0.32, brows: [-14, 7], look: [0.05, -1], redEyes: 1, bags: 0.7, sweat: 1 }
        : { expr: 'hollow', mouth: 'parted', open: 0.1, lid: 0.55, brows: [-2, 1], look: [0.15, 0.35], bags: 0.8, sweat: 0.8 };
      const Y = Q.you(Object.assign({}, yo, { face: yf, armR, armL }));
      const E = R.toWorld(yo, Y.jR.E), W = R.toWorld(yo, Y.jR.W), fd = nrm([W[0] - E[0], W[1] - E[1]]);
      const site = L2(E, W, 0.34), into = nrm([fd[0] * 0.6, fd[1] * 0.6 + 0.8]);
      const can = PR.cannula(site, into, outD(t) + 3, 0.95), cf = calfAt(t);
      const tube = PR.tube(cf.neck, can.end, t, { fill: flow(t), sag: SAG, w: 10 });
      // the doctor: steady hands; then frozen by the shaking; he lets go when you go still
      const dO = Object.assign(idle(t, 17, 0.25), DO), tp = PR.tubePt(cf.neck, can.end, SAG, 0.8), let_ = EZ.io(ss(39.05, 39.6, t));
      const D = Q.doctor(Object.assign({}, dO, {
        face: t < 37.2 ? { expr: 'stern', look: [0.75, 0.75], lid: 0.36, brows: [5, -2], mouth: 'tight' } : { expr: 'fear', look: [0.8, 0.15], lid: 0.04, brows: [-11, 4], mouth: 'parted', wide: true },
        armR: mixArm(fist(dO, 'doctor', tp, [0.05, 1]), { hand: [-160, -780], dir: [0.1, 1], pose: 'relaxed', facing: 'back', detachHand: true }, let_),
        armL: mixArm(fist(dO, 'doctor', add(can.end, into, 14), [0.35, 1]), { hand: [180, -900], dir: [0.3, 0.8], pose: 'open', facing: 'palm', detachHand: true }, let_) }));
      const sO = Object.assign(idle(t, 23, 0.3), SG), poll = (lx, ly) => [CF.x - lx * CF.s, CF.y + ly * CF.s];
      const SGn = Q.surgeon(Object.assign({}, sO, { face: { expr: sh > 0.2 || d > 0.2 ? 'fear' : 'anxious', look: d > 0.3 ? [0.9, 0.1] : [0.55, 0.4], lid: 0.2, mouth: d > 0.3 ? 'parted' : 'closed', wide: d > 0.3 }, armL: handAt(sO, add(poll(340, -540), [4 * sh * Math.sin(t * 31), 0]), [-0.6, 0.6], { pose: 'open', detachHand: true }), armR: { hand: [-170, -790], dir: [0.1, 1], pose: 'relaxed', facing: 'back' } }));
      // the porter bears down through the fit; when you go still he stares down at you, his hands still on you
      const pbO = Object.assign(idle(t, 29, 0.2), PB);
      const shR = add(R.toWorld(yo, [-190, -1060]), [0, -6]), shL = add(R.toWorld(yo, [190, -1060]), [0, -6]), press = 8 * sh * Math.sin(t * 44);
      const PBn = Q.porterB(Object.assign({}, pbO, { face: d > 0.3 ? { expr: 'fear', look: [0.05, 0.85], lid: 0.06, mouth: 'parted', wide: true } : { expr: 'grim', look: [-0.2, 0.75], lid: 0.3, mouth: 'tight' },
        armR: handAt(pbO, add(shR, [0, press]), [0.05, 1], { pose: 'open' }), armL: handAt(pbO, add(shL, [0, -press]), [-0.05, 1], { pose: 'open' }) }));
      // the candle at your side: shaken by the fit, guttering out as you die; its smoke curling up
      const [cx, cy] = CND, cl0 = 1 - out(t);
      let cnd = `<path d="M${cx - 60},1800 L${cx},1740 L${cx + 60},1800 M${cx},1740 L${cx},${cy + 10}" stroke="#1a1410" stroke-width="10" fill="none"/><path d="M${cx - 40},${cy + 10} L${cx + 40},${cy + 10} L${cx + 26},${cy + 34} L${cx - 26},${cy + 34}Z" fill="#2a2420" stroke="#140c08" stroke-width="2"/><rect x="${cx - 15}" y="${cy - 80}" width="30" height="90" fill="#ece2c8" stroke="#140c08" stroke-width="1.6"/>`;
      if (cl0 > 0.02) cnd += `<g transform="translate(${f(cx + 6 * sh * Math.sin(t * 40))},${cy - 82}) scale(${f(cl0)}) translate(${-cx},${-(cy - 82)})">${PR.flame(cx, cy - 82, 1.5, t)}</g>` + C.radial(cx, cy - 120, 700, '#ffb050', 0.4 * cl0, 'screen');
      const sm = ss(39.15, 39.4, t);
      if (sm > 0) { let dd = `M${cx},${cy - 84}`; for (let i = 1; i <= 12; i++) { const v = i / 12; dd += ` L${f(cx + Math.sin(v * 7 + t * 2.2) * 24 * v + v * 30)},${f(cy - 84 - v * 420 * Math.min(1, (t - 39.15) * 1.6 + 0.2))}`; } cnd += `<path d="${dd}" stroke="#d8d4d0" stroke-width="10" fill="none" stroke-linecap="round" opacity="${f(0.55 * sm)}" filter="url(#b4)"/>`; }
      const chars = lit(SGn, L) + S.suTable() + cf.svg + handsLit(SGn, L) + lit(D, L) + lit(PBn, L) + S.suChairBack(YO.x, 1080) + st.clip + `<g clip-path="url(#tr2lap)">${lit(Y, L)}</g>` + S.suChairArms(YO.x, 1400) + st.lap + S.suBoard() + armsOver(Y, L) + handsLit(Y, L) + armsOver(PBn, L) + cnd + tube + can.svg + handsLit(D, L);
      ST.tr2 = { Y, yo, site };
      return X.compose(X.stage(set, chars), c) + C.vignette(0.55);
    };
    // the arm again (the same framing as the first time): the tube slides in, the blood runs; pull back as the fit
    // shakes you; settle in on your still face; rise with the candle's smoke
    const cam = CAM([[34.2, [602, 1176, 0]], [36.9, [592, 1180, 0], 'sine'], [37.95, [840, 1070, 0], 'sine'], [38.6, [850, 1045, 0], 'sine'], [39.4, [862, 990, 0], 'sine'], [40.4, [1110, 900, 0], 'in2']],
      [[34.2, 2.5], [36.9, 2.85, 'sine'], [37.95, 1.75, 'sine'], [38.6, 1.8, 'sine'], [39.4, 2.35, 'sine'], [40.4, 2.7, 'in2']]);
    ST.tr2Cam = cam;
    X.shot('TRANS2', 34.2, 40.4, fn, { grade: 'gNight' });
  }

  // ======================================================= COURT: dragged in, charged; the powder (39.6 - 44.5)
  // "The doctor is dragged into court, charged with murder... until the court finds out your wife had been feeding you"
  {
    const CT = S.CT, JS = CT.JS;
    const drag = t => EZ.io(ss(39.7, 41.35, t)), docX = t => lerp(1420, 200, drag(t));
    const point = t => EZ.io(ss(41.55, 41.95, t)) * (1 - EZ.io(ss(43.05, 43.5, t)));
    const lift = t => EZ.io(ss(42.75, 43.3, t));
    const pkW = t => { const o = { x: CT.J[2][0], y: CT.J[2][1], s: JS }; return add(R.toWorld(o, [215, -1260]), [5 * Math.sin(t * 2), 0]); };
    ST.packetCourt = t => add(pkW(t), [0, -34]);
    const fn = t => {
      const c = hh(cam(t), t, 0.28, 91);
      const L = LT2.court, set = S.court(t, { crowdWave: t < 42.8 ? 1 : 0.15 });
      const x = docX(t), dg = drag(t), gasp = ss(42.9, 43.3, t);
      // the doctor between two guards, his periwig knocked askew, protesting; then terror; then the powder
      const dO = Object.assign(idle(t, 97, 0.3), { x, y: 1985, s: 0.74, sway: -4 * dg * (1 - dg) * 4, tilt: 6 });
      const df = t < 41.6 ? { expr: 'fear', mouth: 'talk', open: 0.1 + Q.talk(t, 0.22, 8), lid: 0.05, brows: [-12, 4], look: [-0.3, -0.7], wide: true, sweat: 0.6 }
        : t < 42.9 ? { expr: 'fear', mouth: 'parted', open: 0.16, lid: 0.0, brows: [-14, 6], look: [0.2, -0.75], wide: true, sweat: 0.8 }
        : { expr: 'anxious', mouth: 'parted', open: 0.08, lid: 0.12, brows: [-10, 3], look: [0.75, -0.65], sweat: 0.8 };
      const D = Q.doctor(Object.assign({}, dO, { face: df, armR: { hand: [-176, -780], dir: [0.15, 1], pose: 'open', facing: 'back' }, armL: { hand: [176, -780], dir: [-0.15, 1], pose: 'open', facing: 'back' } }));
      const g1 = Object.assign(idle(t, 101, 0.3), { x: x - 205, y: 1995, s: 0.76 }), g2 = Object.assign(idle(t, 103, 0.3), { x: x + 205, y: 1995, s: 0.76 });
      const upR = R.toWorld(dO, [-150, -980]), upL = R.toWorld(dO, [150, -980]);
      const G1 = Q.guard(Object.assign({}, g1, { face: { expr: 'grim', look: [0.5, -0.3], lid: 0.34, mouth: 'tight' }, armL: fist(g1, 'guard', upR, [0.2, 1]), armR: { hand: [-170, -780], dir: [0.1, 1], pose: 'fist', facing: 'back' } }));
      const G2 = Q.guard2(Object.assign({}, g2, { face: { expr: 'grim', look: [-0.5, -0.3], lid: 0.36, mouth: 'tight' }, armR: fist(g2, 'guard2', upL, [-0.2, 1]), armL: { hand: [170, -780], dir: [-0.1, 1], pose: 'fist', facing: 'back' } }));
      // the judges behind the bench: the presiding judge points at him; the third holds up the paper of powder
      const jo = CT.J.map((p, i) => Object.assign(idle(t, 107 + i * 4, 0.2), { x: p[0], y: p[1], s: JS }));
      const dFace = headW(dO);
      const sh0 = R.toWorld(jo[0], [-139, -1107]), pd = nrm([dFace[0] - sh0[0], dFace[1] - 170 - sh0[1]]);
      const J0 = Q.judge(Object.assign({}, jo[0], { face: { expr: 'stern', mouth: t > 41.6 && t < 42.9 ? 'talk' : 'tight', open: Q.talk(t, 0.2, 7), lid: 0.38, brows: [10, -3], look: L2([-0.6, 0.5], [0.85, -0.2], gasp) }, armR: mixArm({ hand: [-120, -860], dir: [0.6, 0.7], pose: 'relaxed', facing: 'back' }, Object.assign(handAt(jo[0], add(sh0, pd, 372 * JS), pd), { pose: 'point', elbow: 'free' }), point(t)), armL: { hand: [120, -860], dir: [-0.6, 0.7], pose: 'relaxed', facing: 'back' } }));
      const J1 = Q.judge2(Object.assign({}, jo[1], { face: { expr: 'stern', mouth: gasp > 0.5 ? 'parted' : 'tight', lid: 0.3, brows: [8, -2], look: L2([0.3, 0.6], [0.9, -0.2], gasp) }, armR: { hand: [-120, -860], dir: [0.6, 0.7], pose: 'relaxed', facing: 'back' }, armL: { hand: [120, -860], dir: [-0.6, 0.7], pose: 'relaxed', facing: 'back' } }));
      const pk = pkW(t), lk = lift(t);
      const J2 = Q.judge3(Object.assign({}, jo[2], { face: { expr: 'grim', mouth: 'tight', lid: 0.3, brows: [6, -2], look: L2([-0.6, 0.6], [0.3, -0.75], lk) }, armR: { hand: [-120, -860], dir: [0.6, 0.7], pose: 'relaxed', facing: 'back' }, armL: mixArm({ hand: [120, -860], dir: [-0.6, 0.7], pose: 'relaxed', facing: 'back' }, fist(jo[2], 'judge3', pk, [0.1, -1]), lk) }));
      const packet = lk > 0.05 ? `<g transform="translate(${f(pk[0])},${f(pk[1] - 34)}) scale(${f(0.95 * lk)})">${PR.packet({ open: ss(43.0, 43.3, t), t })}</g>` : '';
      ST.court = { D, dO };
      const chars = lit(J1, L) + lit(J0, L) + lit(J2, L) + S.ctBench() + packet + handsLit(J2, L) + lit(G1, L) + lit(G2, L) + lit(D, L) + handsLit(G1, L) + handsLit(G2, L);
      return X.compose(X.stage(set, chars), c) + C.vignette(0.5);
    };
    // out of the smoke into the court; truck with the guards dragging him to the bar; up to the presiding judge
    // pointing; across to the paper held up, pushing in on it
    const cam = CAM([[39.6, [880, 1120, 0]], [41.35, [430, 1180, 0], 'io'], [42.35, [410, 910, 0], 'io'], [43.35, [900, 790, 0], 'io'], [44.5, [ST.packetCourt(44.5)[0], ST.packetCourt(44.5)[1], 0], 'in2']],
      [[39.6, 1.15], [41.35, 1.3, 'io'], [42.35, 1.85, 'io'], [43.35, 2.1, 'io'], [44.5, 3.1, 'in2']]);
    ST.courtCam = cam;
    X.shot('COURT', 39.6, 44.5, fn, { grade: 'gHall' });
  }

  // ======================================================= ARSENIC: the wife at the hearth, the whole time (43.7 - T)
  // "...arsenic the whole time."
  {
    const WO = { x: 1000, y: 1800, s: 0.8 }, BOWL = [1000, 1416];
    const pour = t => env(t, 44.45, 44.75, 45.25, 45.5), stir = t => env(t, 45.2, 45.35, 45.85, 46.0);
    const lookUp = t => EZ.io(ss(45.55, 45.95, t));
    const grip1 = t => [880 - 10 * pour(t), 1255 - 20 * pour(t)];
    const pkAng = t => -55 * pour(t);
    ST.packetHome = t => { const g = grip1(t), a = pkAng(t) * D2R; return [g[0] + Math.cos(a) * 46, g[1] - 44 + Math.sin(a) * 46]; };
    const stand = `<path d="M830,1430 L1170,1430 L1170,1462 L830,1462Z" fill="#6a4a2a" filter="url(#woodH)" stroke="#1a120c" stroke-width="2.4"/><rect x="850" y="1462" width="300" height="260" fill="#4a3020" filter="url(#woodV)" stroke="#1a120c" stroke-width="2.4"/><path d="M850,1600 L1150,1600" stroke="#2a1a10" stroke-width="5"/><rect x="860" y="1722" width="40" height="80" fill="#3a2414"/><rect x="1100" y="1722" width="40" height="80" fill="#3a2414"/>`;
    const fn = t => {
      const c = hh(cam(t), t, 0.22, 113);
      const L = LT2.hearth, set = S.home(t, { mode: 'flash' });
      const wo = Object.assign(idle(t, 117, 0.25), WO), lu = lookUp(t), p = pour(t), sr = stir(t);
      // the packet tipping over the bowl in her right hand, the white powder running into the soup
      const g1 = grip1(t), a = pkAng(t);
      const packet = `<g transform="translate(${f(g1[0])},${f(g1[1])}) rotate(${f(a)}) translate(46,-44)">${PR.packet({ open: 1, t: p > 0.3 ? undefined : t })}</g>`;
      const ar = a * D2R, lip = [g1[0] + Math.cos(ar) * 124 + Math.sin(ar) * 52, g1[1] + Math.sin(ar) * 124 - Math.cos(ar) * 52];
      const fall = p > 0.35 ? PR.powderFall(lip[0], lip[1] + 6, BOWL[0] - 10, BOWL[1] - 6, t, (p - 0.35) / 0.65) : '';
      // the wooden spoon in her left hand, stirring it in
      const ph = t * 9, g2 = sr > 0 ? [1088 + 22 * Math.cos(ph) * sr, 1318 + 7 * Math.sin(ph) * sr] : [1100, 1408];
      const spoonTip = [BOWL[0] + 10 + 34 * Math.cos(ph) * sr, BOWL[1] - 4 + 6 * Math.sin(ph) * sr];
      const spoon = sr > 0.02 ? `<path d="M${f(g2[0])},${f(g2[1] - 40)} L${f(spoonTip[0])},${f(spoonTip[1])}" stroke="#8a6a3a" stroke-width="12" stroke-linecap="round"/><ellipse cx="${f(spoonTip[0])}" cy="${f(spoonTip[1])}" rx="18" ry="8" fill="#8a6a3a" opacity="${f(sr)}"/>` : '';
      const armR = fist(wo, 'wife', g1, [Math.cos((a + 70) * D2R), Math.sin((a + 70) * D2R)]);
      const armL = sr > 0.02 ? fist(wo, 'wife', g2, [-0.3, 1]) : handAt(wo, g2, [-0.2, 1], { pose: 'relaxed' });
      const face = lu < 0.5 ? { expr: 'neutral', mouth: 'closed', lid: 0.48, brows: [2, -1], look: [0, 0.85] } : { expr: 'stern', mouth: t > 45.8 ? 'smile' : 'closed', lid: 0.4, brows: [10, -5], look: [0, 0.02] };
      const Wf = Q.wife(Object.assign({}, wo, { face, armR, armL }));
      const bowl = PR.soupBowl(BOWL[0], BOWL[1], 0.9, t, { powder: ss(44.7, 45.3, t), swirl: ss(45.25, 45.9, t), stir: ph });
      // you, behind at the table, waiting for your soup (soft focus)
      const yo = Object.assign(idle(t, 121, 0.2), { x: 660, y: 1432 + 745 * 0.62, s: 0.62 });
      const Y = Q.you(Object.assign({}, yo, { face: { expr: 'neutral', mouth: 'smile', lid: 0.3, look: [0.8, 0.1] }, armR: { hand: R.toLocal(yo, [600, 1402]), dir: [0.5, 0.8], pose: 'relaxed', facing: 'back' }, armL: { hand: R.toLocal(yo, [720, 1402]), dir: [-0.5, 0.8], pose: 'relaxed', facing: 'back' } }));
      const back = `<g filter="url(#dof2)" opacity="0.92"><defs><clipPath id="arclip"><rect x="-2000" y="-2000" width="5000" height="3640"/></clipPath></defs><g clip-path="url(#arclip)">${lit(Y, LT2.homeDay)}</g>${S.hmTable()}${armsOver(Y, LT2.homeDay)}${handsLit(Y, LT2.homeDay)}</g>`;
      ST.ars = { Wf, wo };
      const chars = back + lit(Wf, L) + stand + bowl + packet + fall + spoon + handsLit(Wf, L);
      return X.compose(X.stage(set, chars), c) + C.vignette(0.6) + C.radial(1000, 1500, 900, '#ff9a40', 0.12, 'screen');
    };
    // out of the paper in her fingers; her hands at the bowl; up to her face as she lifts her eyes to us
    const pk0 = ST.packetHome(44.1);
    const cam = CAM([[43.7, [pk0[0], pk0[1], 0]], [44.65, [905, 1310, 0], 'out'], [45.3, [925, 1275, 0], 'sine'], [46.15, [1000, 880, 0], 'io'], [T, [1000, 800, 0], 'in2']],
      [[43.7, 3.2], [44.65, 2.0, 'out'], [45.3, 2.05, 'sine'], [46.15, 2.45, 'io'], [T, 2.85, 'in2']]);
    ST.arsCam = cam;
    X.shot('ARSENIC', 43.7, T, fn, { grade: 'gFeast' });
  }

  // ======================================================= transitions
  {
    const sheet = (x, u) => `<g filter="url(#dof3)"><path d="M${f(x - 640)},-200 C${f(x - 560)},400 ${f(x - 700)},1100 ${f(x - 600)},2120 L${f(x + 600)},2120 C${f(x + 680)},1200 ${f(x + 560)},500 ${f(x + 640)},-200Z" fill="#d8ccb2"/>` + [-420, -180, 60, 300, 520].map((d, i) => `<path d="M${f(x + d)},-200 C${f(x + d + 40)},500 ${f(x + d - 30)},1200 ${f(x + d + 20)},2120" stroke="${i % 2 ? '#a89c84' : '#efe6d4'}" stroke-width="${60 + i * 6}" fill="none" opacity="0.55"/>`).join('') + `</g>`;
    const youF = t => headW(ST.streetYou(t), [0, 12]);
    X.tr('carry', 3.9, 0.8, 'STREET', 'STUDY', { mode: 'pan', dir: [0, -1], dist: 0.42 });
    X.tr('morph', 7.55, 0.8, 'STUDY', 'TRANS1', { fa: scr(ST.drawEye, ST.studyCam(7.55)), fb: scr(ST.calfEye(7.55), ST.tr1Cam(7.55)), za: 1.5, zb: 1.35, col: '#fff0d8' });
    X.tr('liquid', 19.7, 0.7, 'TRANS1', 'BED', { fa: [560, 1000], fb: scr(ST.POT, ST.bedCam(19.7)), col: '#1a0608', seed: 8 });
    X.tr('radial', 26.85, 0.8, 'BED', 'MIRACLE', { fa: scr(S.HM.WIN, ST.bedCam(26.85), 0.78), fb: scr(S.HM.WIN, ST.bedCam(26.85), 0.78), soft: 0.5, leak: '#fff0c8', leakOp: 0.22 });
    X.tr('organic', 28.7, 0.8, 'MIRACLE', 'RELAPSE', { fa: [540, 900], fb: [540, 800], za: 1.12, zb: 0.92, seed: 5 });
    X.tr('wipe', 32.3, 0.8, 'RELAPSE', 'DOOR', { dir: 1, truck: 200, obj: sheet });
    X.tr('rack', 34.6, 0.8, 'DOOR', 'TRANS2', { fa: [540, 900], fb: [540, 960], blur: 12 });
    X.tr('carry', 40.0, 0.8, 'TRANS2', 'COURT', { mode: 'zoom', k: 1.8, fa: scr(ST.candleSmoke, ST.tr2Cam(40.0)), fb: [540, 900], leak: '#fff4e0', leakOp: 0.2 });
    X.tr('push', 44.1, 0.8, 'COURT', 'ARSENIC', { fa: scr(ST.packetCourt(44.1), ST.courtCam(44.1)), fb: scr(ST.packetHome(44.1), ST.arsCam(44.1)), za: 3.0, zb: 0.5 });
    X.tr('zmatch', T, 0.9, 'ARSENIC', 'STREET', { end: true, bOff: -T, fa: scr(headW({ x: 1000, y: 1800, s: 0.8, kind: 'woman' }, [0, 10]), ST.arsCam(T - 0.45)), fb: scr(youF(-0.45), ST.streetCam(-0.45)), za: 2.4, zb: 2.6, seed: 4 });
  }
})(window);
