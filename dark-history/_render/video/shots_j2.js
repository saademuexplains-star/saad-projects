// "The First Vaccine" part 2: the cow -> into your blood -> three days of fever -> tied back down -> the dying man's
// pox -> rubbed into your cut -> the doctor watches -> the battle in your blood -> twenty more cuts -> alive -> the word.
(function (G) {
  const X = G.ENG, Q = G.QCAST, S = G.SETS, PR = G.PROPS, C = G.CINE, R = G.RIG;
  const { track: TK, ss, clamp, lerp, EZ } = X;
  const { f, mix, rng } = R;
  const TAU = Math.PI * 2, D2R = Math.PI / 180;
  const { wave, env, bump, idle, hh, scr, nrm, L2, add, dirA, HAND, gripAt, armsOver, handsLit, CAM, tipArm, closeGrip, rigTool, LT } = G.SHOTS_J;
  const ST = G.VACCINE, lit = X.lit;
  const LT2 = {
    barn: { from: [0.9, -0.6], shadow: '#1a0e06', shadowOp: 0.5, floor: '#3a2a14', floorOp: 0.3, contactOp: 0.5, key: '#ffe0b0', keyAdd: 0.06, rims: [{ from: [1, -0.4], col: '#ffd890', w: 7, op: 0.5 }], face: { col: '#ffe0b0', op: 0.1 } },
    bed: { from: [0.7, -0.5], shadow: '#1a1008', shadowOp: 0.45, floor: '#2a1a10', floorOp: 0.3, contactOp: 0.3, key: '#f4f0e8', keyAdd: 0.05, rims: [{ from: [1, 0.2], col: '#ffb060', w: 6, op: 0.45 }, { from: [-1, -0.4], col: '#c8d0e0', w: 4, op: 0.25 }], face: { col: '#ffe8d0', op: 0.12 } },
    hovel: { from: [1, -0.25], shadow: '#0e0804', shadowOp: 0.55, floor: '#1e140c', floorOp: 0.4, contactOp: 0.4, key: '#ffb870', keyAdd: 0.07, rims: [{ from: [1, -0.1], col: '#ff9a40', w: 7, op: 0.55 }, { from: [-0.4, -1], col: '#b8c4cc', w: 4, op: 0.3 }], face: { col: '#ffc890', op: 0.14 } },
  };

  // ======================================================= COW: the farm cow with cowpox (21.0 - 22.9)
  // "from a farm cow"
  {
    const CW = [560, 1760], CS = 1.0;
    const udder = [CW[0] + 266 * CS, CW[1] - 200 * CS], blister = [CW[0] + 255 * CS, CW[1] - 205 * CS];
    ST.cowBlister = blister;
    const cam = CAM(
      [[21.0, [20, 1330, 0]], [21.65, [80, 1360, 0.6], 'sine'], [22.25, [blister[0] - 20, blister[1] - 30, 0], 'io'], [22.9, [blister[0], blister[1], 0], 'in2']],
      [[21.0, 1.45], [21.65, 1.35, 'sine'], [22.25, 2.2, 'io'], [22.9, 3.4, 'in2']]);
    ST.cowCam = cam;
    ST.cowBlisterScr = tt => scr(blister, cam(tt));
    const fn = t => {
      const c = hh(cam(t), t, 0.35, 21), L = LT2.barn;
      const set = S.barn(t);
      // she lifts her head and lows at 21.6, then chews again
      const low = env(t, 21.5, 21.75, 22.1, 22.4);
      const cow = PR.cow(CW[0], CW[1], CS, t, { head: lerp(12, -14, low), chew: 1 - low, pox: 1, lit: 0.8 });
      const props = PR.milkStool(980, CW[1] + 20, 0.7) + PR.pail(820, CW[1] + 30, 0.62, 0.6);
      const chars = `<ellipse cx="${CW[0] + 40}" cy="${CW[1] + 6}" rx="560" ry="40" fill="#120804" opacity="0.5" filter="url(#b8)"/>` + `<g filter="url(#clothS)">${cow}</g>` + props;
      return X.compose(X.stage(set, chars), c) + C.vignette(0.55);
    };
    X.shot('COW', 21.0, 22.9, fn, { grade: 'gDusk' });
  }

  // ======================================================= BLOOD: the cow sickness enters your blood (22.3 - 24.25)
  // "straight into your blood."
  {
    const fn = t => {
      const roll = 3 * Math.sin(t * 0.7), steer = [40 * Math.sin(t * 0.9), 60 * Math.sin(t * 0.6 + 1)];
      const rp = rng(61), parts = [];
      for (let i = 0; i < 26; i++) parts.push({ t0: 22.45 + rp() * 0.9, a: rp() * TAU, sp: 0.25 + rp() * 0.45, rot: rp() * 360, spin: (rp() - 0.5) * 90, dz: 1.5 + rp() * 2.5 });
      const extra = (tt, proj) => parts.filter(p => tt > p.t0).map(p => {
        const age = tt - p.t0, z = Math.max(0.65, 5.5 - age * p.dz), r0 = age * p.sp, x = 0.15 + Math.cos(p.a) * r0, y = -0.1 + Math.sin(p.a) * r0 * 1.4;
        return { z, draw: () => { const [sx, sy, sc] = proj(x, y, z), op = clamp(age / 0.25) * clamp((z - 0.65) / 0.3); return `<g opacity="${f(op)}">${PR.poxV(sx, sy, sc * 0.0007, p.rot + age * p.spin, 'cow')}</g>`; } };
      });
      const v = S.vessel(t, { dist: tt => (tt - 22.3) * 5.5 + 2, cx: steer[0], cy: steer[1], extra });
      // the cut's opening seen from inside: a golden glow where the matter pours in, fading
      const glow = C.radial(540 + steer[0] + 120, 960 + steer[1] - 80, 520, '#ffd070', 0.5 * env(t, 22.3, 22.5, 23.2, 23.9), 'screen');
      return `<g transform="rotate(${f(roll)} 540 960)">${v}</g>` + glow + C.vignette(0.65, '#1a0202', 0.4);
    };
    X.shot('BLOOD', 22.3, 24.25, fn, {});
  }

  // ======================================================= BED: three days of fever, then morning (23.65 - 31.0)
  // "For three long days you shake in bed as your body burns with a high fever, and the very moment you finally get better,"
  {
    const SK = S.SICK, YB = [520, 1790], YBS = 0.9, MB = [770, 2088], MBS = 0.85;
    const night = t => t < 28.45 ? 0.5 + 0.5 * Math.cos(TAU * (t - 23.65) / 1.6) : 1 - EZ.io(ss(28.45, 29.3, t));
    const dawn = t => EZ.io(ss(28.5, 29.5, t));
    const fever = t => ss(23.8, 24.6, t) * (1 - ss(28.6, 29.6, t));
    // the doctor's silhouette in the doorway at the end (wall layer p 0.8)
    const DOORF = [-100, 1640];
    const cam = CAM(
      [[23.65, [560, 1230, 0]], [25.1, [525, 1170, 0], 'sine'], [26.0, [640, 1010, 1], 'io'], [27.15, [518, 1150, 0], 'io'], [28.4, [516, 1145, 0], 'sine'], [28.6, [560, 1150, 0], 'sine'], [29.4, [650, 1125, 0], 'io'], [30.15, [630, 1135, 0], 'sine'], [31.0, [-180, 1020, 0], 'io']],
      [[23.65, 1.1], [25.1, 1.75, 'sine'], [26.0, 1.35, 'io'], [27.15, 2.3, 'io'], [28.4, 2.75, 'sine'], [28.6, 2.6, 'sine'], [29.4, 2.05, 'io'], [30.15, 2.15, 'sine'], [31.0, 1.7, 'io']]);
    ST.bedCam = cam;
    ST.bedDoorScr = tt => scr([DOORF[0] + 10, 1040], cam(tt), 0.8);
    const fn = t => {
      const c = hh(cam(t), t, 0.3, 23), L = LT2.bed, nt = night(t), dw = dawn(t), fv = fever(t);
      const set = S.sickroom(t, { night: nt * (1 - dw), dawn: dw, sunX: 200 * Math.sin(TAU * (t - 23.65) / 1.6) });
      // the doctor appears in the doorway as a dark shape against the landing's light
      const docIn = EZ.io(ss(29.9, 30.6, t));
      if (docIn > 0) { const dO = { x: DOORF[0] - 60 + 60 * docIn, y: DOORF[1], s: 0.62, breath: 0, sway: 0 };
        const Dp = Q.doctor(Object.assign(dO, { face: { expr: 'stern', look: [0.8, 0.1], lid: 0.3 }, armR: { hand: [-120, -760], dir: [0.1, 1], pose: 'relaxed' }, armL: { hand: [130, -760], dir: [-0.1, 1], pose: 'relaxed' } }));
        set[0].svg += `<g opacity="${f(docIn)}"><g filter="url(#silh)">${Dp.svg}</g></g>`; }
      // you, propped on the pillows: shivering through the nights, then waking well at dawn
      const shiv = fv * (0.6 + 0.4 * nt);
      const yo = Object.assign(idle(t, 5, 0.4), { x: YB[0], y: YB[1], s: YBS });
      yo.x += shiv * (2.2 * Math.sin(t * 33) + 1.4 * Math.sin(t * 51 + 1)); yo.sway += shiv * 0.9 * Math.sin(t * 27);
      const better = dw, burn = env(t, 26.9, 27.3, 28.3, 28.6);
      const yFace = better > 0.5 ? { expr: 'tired', mouth: better > 0.8 ? 'smile' : 'closed', look: L2([0.1, -0.2], [0.75, -0.05], ss(29.3, 29.8, t)), lid: lerp(0.6, 0.24, ss(28.9, 29.5, t)), brows: [-3, 1], blush: 0.2 }
        : { expr: burn > 0.3 ? 'grief' : 'tired', mouth: 'parted', open: 0.12 + 0.06 * Math.sin(t * 6), look: [0.1, 0.3], lid: lerp(0.62, 0.86, nt * 0.5 + burn * 0.5), brows: [-8, 3], sweat: 0.4 + 0.6 * fv, blush: 0.25 + 0.5 * fv + 0.3 * burn };
      const handOn = [628, 1418];
      const Y = Q.you(Object.assign(yo, { noLegs: true, tilt: lerp(-7, -2, better) + 2 * Math.sin(t * 0.8) * (1 - better), face: yFace,
        armR: { hand: [-80, -330], dir: [0.1, 1], pose: 'relaxed', facing: 'back' }, armL: { hand: R.toLocal(yo, handOn), dir: [0.2, 1], pose: 'relaxed', facing: 'back', detachHand: true } }));
      // a damp cloth folded across your forehead through the fever
      const hp = R.toWorld(yo, [0, -790]), clothOp = fv;
      const cloth = clothOp > 0.01 ? `<g opacity="${f(clothOp)}" transform="rotate(${f(yo.sway + lerp(-7, -2, better))} ${f(hp[0])} ${f(hp[1])})"><path d="M${f(hp[0] - 62)},${f(hp[1] - 6)} Q${f(hp[0])},${f(hp[1] - 26)} ${f(hp[0] + 62)},${f(hp[1] - 6)} L${f(hp[0] + 58)},${f(hp[1] + 18)} Q${f(hp[0])},${f(hp[1] + 2)} ${f(hp[0] - 58)},${f(hp[1] + 18)}Z" fill="#ece8dc" stroke="#9a9080" stroke-width="2"/><path d="M${f(hp[0] - 50)},${f(hp[1] + 4)} Q${f(hp[0])},${f(hp[1] - 12)} ${f(hp[0] + 50)},${f(hp[1] + 4)}" stroke="#c8c0b0" stroke-width="3" fill="none"/></g>` : '';
      // your mother on the far side of the bed, her hand over yours on the quilt
      const mo = Object.assign(idle(t, 15, 0.5), { x: MB[0], y: MB[1], s: MBS });
      const relief = ss(29.4, 29.9, t);
      const mFace = relief > 0.3 ? { expr: 'neutral', mouth: 'smile', look: [-0.8, 0.2], lid: 0.32, brows: [-6, 2], tears: true } : { expr: 'anxious', mouth: nt > 0.5 ? 'talk' : 'closed', open: Q.talk(t, 0.1, 3) * nt, look: [-0.85, 0.25], lid: lerp(0.3, 0.55, nt), brows: [-9, 2], tears: nt > 0.6 };
      const M = Q.mother(Object.assign(mo, { tilt: -6, face: mFace, armR: { hand: R.toLocal(mo, [handOn[0] + 34, handOn[1] - 14]), dir: [-0.6, 0.8], pose: 'relaxed', facing: 'back', detachHand: true }, armL: { hand: [110, -760], dir: [-0.3, 1], pose: 'relaxed', facing: 'back' } }));
      const clipM = `<defs><clipPath id="bdM"><rect x="-2000" y="-2000" width="6000" height="${SK.QUILT + 40 + 2000}"/></clipPath><clipPath id="bdY"><rect x="-2000" y="-2000" width="6000" height="${SK.QUILT + 60 + 2000}"/></clipPath></defs>`;
      const chars = clipM + S.bedBack() + `<g clip-path="url(#bdM)">${lit(M, L)}</g><g clip-path="url(#bdY)">${lit(Y, L)}</g>${cloth}` + S.bedQuilt(t, { shiver: shiv }) + armsOver(Y, L, 'L') + handsLit(Y, L, 'L') + armsOver(M, L, 'R') + handsLit(M, L, 'R') + S.bedFront(t, { candle: lerp(1, 0.3, ss(23.65, 28.5, t)), candleGlow: 0.4 + 0.6 * nt * (1 - dw) });
      let out = X.compose(X.stage(set, chars), c);
      // night darkens everything (people too); the candle relights its corner; the fever glows hot on your face
      const cnd = scr([985, SK.FY - 200], c);
      out += `<rect width="1080" height="1920" fill="#0a0e22" opacity="${f(0.5 * nt * (1 - dw))}" style="mix-blend-mode:multiply"/>` + C.radial(cnd[0], cnd[1], 900 * c[2] * 0.6, '#ffb060', 0.3 * nt * (1 - dw), 'screen');
      const fp = scr(R.toWorld(yo, [0, -740]), c);
      out += C.radial(fp[0], fp[1], 260 * c[2], '#ff5a2a', 0.18 * fv + 0.22 * burn, 'screen');
      if (dw > 0) out += `<rect width="1080" height="1920" fill="#ffd9a0" opacity="${f(0.08 * dw)}" style="mix-blend-mode:screen"/>`;
      return out + C.vignette(0.55);
    };
    X.shot('BED', 23.65, 31.0, fn, { grade: 'gDusk' });
  }

  // ======================================================= TIEBACK: tied back down, the doctor's strange calm (30.4 - 33.6)
  // "the doctor ties you back down and does something crazy—"
  {
    const W = ST.SURG.WRIST_L;
    const cam = CAM(
      [[30.4, [600, 1290, 0]], [31.2, [590, 1280, -0.5], 'sine'], [31.85, [520, 1150, 0], 'io'], [32.5, [770, 990, 0], 'io'], [33.2, [785, 960, 0], 'sine'], [33.6, [790, 955, 0], 'sine']],
      [[30.4, 1.7], [31.2, 1.95, 'sine'], [31.85, 1.75, 'io'], [32.5, 2.3, 'io'], [33.2, 2.95, 'sine'], [33.6, 3.1, 'sine']]);
    ST.tieCam = cam;
    const youFace = t => { const plead = env(t, 30.8, 31.1, 32.2, 32.5); return { expr: 'anxious', mouth: plead > 0.4 ? 'talk' : 'tight', open: Q.talk(t, 0.18, 5) * plead, look: t < 32.2 ? [0.72, 0.15] : [0.75, -0.2], lid: 0.1, brows: [-12, 3], tears: true, sweat: 0.3 }; };
    const docFace = t => { const crazy = ss(32.1, 32.6, t); return crazy > 0.5 ? { expr: 'neutral', mouth: 'smirk', look: [-0.75, 0.12], lid: 0.12, brows: [2, 4], wide: true } : { expr: 'stern', look: [-0.6, 0.6], lid: 0.22, mouth: 'tight', brows: [6, -3] }; };
    const fn = t => {
      const c = hh(cam(t), t, 0.35, 27);
      return ST.surgScene(t, c, { youFace, docFace, youSway: t => -1.5 * bump(t, 31.0, 1, 0.5), docTilt: t => lerp(-5, 2, ss(32.0, 32.6, t)), marks: () => ({ scab: 1 }) }) + C.vignette(0.5);
    };
    X.shot('TIEBACK', 30.4, 33.6, fn, { grade: 'gHall' });
  }

  // ======================================================= DYING: the dying man's pox (33.0 - 37.75)
  // "he scrapes the real, deadly plague straight off a dying man's skin"
  {
    const HV = S.HOV, MAN = [520, 1992], MS = 0.72, DOC = [1060, 2140], DS = 0.74;
    const armTo = [712, 1418];
    const cam = CAM(
      [[33.0, [760, 1330, 0]], [33.6, [740, 1320, 0], 'sine'], [34.35, [540, 1090, 0], 'io'], [35.0, [522, 1070, -1], 'sine'], [35.6, [520, 1075, 0], 'sine'], [36.4, [660, 1330, 0], 'io'], [37.2, [690, 1390, 0], 'sine'], [37.75, [720, 1395, 0], 'in2']],
      [[33.0, 2.4], [33.6, 2.5, 'sine'], [34.35, 2.2, 'io'], [35.0, 2.9, 'sine'], [35.6, 3.2, 'sine'], [36.4, 3.0, 'io'], [37.2, 3.35, 'sine'], [37.75, 3.4, 'in2']]);
    ST.dyCam = cam;
    const fn = t => {
      const c = hh(cam(t), t, 0.35, 31), L = LT2.hovel;
      const set = S.hovel(t);
      // the dying man: propped on the wall, pox over his face and arm, each breath a rattle
      const mo = Object.assign(idle(t, 41, 0.2), { x: MAN[0], y: MAN[1], s: MS });
      mo.breath = 1.4 * Math.sin(t * 3.2);
      const Mp = Q.dying(Object.assign(mo, { tilt: 9, face: { expr: 'tired', mouth: 'parted', open: 0.14 + 0.08 * (0.5 + 0.5 * Math.sin(t * 3.2)), look: [0.5, 0.35], lid: 0.78, brows: [-4, 2], sweat: 0.8 },
        armR: { hand: [-110, -620], dir: [0.1, 1], pose: 'relaxed', facing: 'back' }, armL: { hand: R.toLocal(mo, armTo), dir: [0.6, 0.8], pose: 'relaxed', facing: 'back', detachHand: true } }));
      const E = R.toWorld(mo, Mp.jL.E), Wr = R.toWorld(mo, Mp.jL.W), ua = nrm([Wr[0] - E[0], Wr[1] - E[1]]), na = [-ua[1], ua[0]];
      // pustules along the forearm, one big one where the lancet scrapes
      const PUS = lerp(E[0], Wr[0], 0.55), PUSy = lerp(E[1], Wr[1], 0.55), scrape = ss(35.75, 37.1, t);
      let pox = ''; const rp = rng(17);
      for (let i = 0; i < 16; i++) { const k = 0.12 + rp() * 0.8, v = (rp() - 0.5) * 22, p = [lerp(E[0], Wr[0], k) + na[0] * v, lerp(E[1], Wr[1], k) + na[1] * v], r0 = 1.6 + rp() * 1.8; pox += `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="${f(r0 * 1.9)}" fill="#b03a2a" opacity="0.5"/><circle cx="${f(p[0])}" cy="${f(p[1])}" r="${f(r0)}" fill="#e8d496" stroke="#6a2a1a" stroke-width="0.8"/><circle cx="${f(p[0] - r0 * 0.3)}" cy="${f(p[1] - r0 * 0.3)}" r="${f(r0 * 0.3)}" fill="#fff" opacity="0.55"/>`; }
      { const r0 = 4.2 * (1 - 0.5 * scrape); pox += `<circle cx="${f(PUS)}" cy="${f(PUSy)}" r="${f(r0 * 2)}" fill="#b03a2a" opacity="0.55"/><circle cx="${f(PUS)}" cy="${f(PUSy)}" r="${f(r0)}" fill="${scrape > 0.3 ? '#c8b070' : '#ecd89a'}" stroke="#6a2a1a" stroke-width="1"/>` + (scrape > 0.2 ? `<path d="M${f(PUS - 6)},${f(PUSy + 2)} l12,-3" stroke="#7a1a10" stroke-width="2.5"/>` : ''); }
      // the doctor kneeling beyond him, low; the lancet scrapes the pustule onto its blade
      const dO = Object.assign(idle(t, 43, 0.3), { x: DOC[0], y: DOC[1], s: DS });
      const tipHover = [PUS + 40, PUSy - 50], tipStart = [PUS + 12, PUSy - 4], tipEnd = [PUS - 12, PUSy + 3];
      let tip = L2(tipHover, tipStart, EZ.io(ss(35.3, 35.75, t)));
      if (t > 35.75) tip = L2(tipStart, tipEnd, 0.5 - 0.5 * Math.cos(Math.PI * 3 * scrape));
      if (t > 37.1) tip = L2(tipEnd, [PUS + 120, PUSy - 30], EZ.io(ss(37.1, 37.75, t)));
      const armR = rigTool(dO, 'doctor', 'R', 'back', tip, 86, ST.LANCET({ matter: ss(35.9, 37.0, t), glint: env(t, 33.1, 33.15, 33.6, 33.7) > 0 ? clamp((t - 33.1) / 0.6) : null }), ST.LTIP, { detachHand: true });
      const Dp = Q.doctor(Object.assign(dO, { tilt: -12, face: { expr: 'stern', look: [-0.55, 0.65], lid: 0.24, mouth: 'tight', brows: [7, -3] }, armR, armL: { hand: [150, -900], dir: [-0.3, 1], pose: 'relaxed', facing: 'back' } }));
      const clip = `<defs><clipPath id="hvM"><rect x="-2000" y="-2000" width="6000" height="${f(1440 + 2000)}"/></clipPath><clipPath id="hvD"><rect x="-2000" y="-2000" width="6000" height="${f(1470 + 2000)}"/></clipPath></defs>`;
      const chars = clip + `<g clip-path="url(#hvD)">${lit(Dp, L)}</g><g clip-path="url(#hvM)">${lit(Mp, L)}</g>` + S.pallet(t) + armsOver(Mp, L, 'L') + handsLit(Mp, L, 'L') + pox + armsOver(Dp, L, 'R') + handsLit(Dp, L, 'R');
      return X.compose(X.stage(set, chars), c) + C.radial(scr([600, 1150], c)[0], scr([600, 1150], c)[1], 700 * c[2], '#ffb060', 0.12, 'screen') + C.vignette(0.6);
    };
    X.shot('DYING', 33.0, 37.75, fn, { grade: 'gDusk' });
  }

  // ======================================================= RUB: the pox rubbed deep into a new cut (37.15 - 39.2)
  // "and rubs it deep into your cut"
  {
    const AW = ST.AW, armU = ST.armU, armN = ST.armN;
    const C2 = { u: 0.6, v: 0.02, len: 120, a: 0 };
    const [c0, c1, cm] = ST.cutEnds(C2);
    const above = [-armN[0], -armN[1]], enter = add(add(cm, above, 300), armU, -260);
    ST.C2 = C2;
    const cam = CAM(
      [[37.15, [cm[0] - 160, cm[1] - 60, 0]], [37.6, [cm[0] - 20, cm[1] - 40, 0], 'out2'], [38.6, [cm[0] + 10, cm[1] - 30, 1], 'sine'], [39.2, [cm[0] + 20, cm[1] - 20, 0], 'sine']],
      [[37.15, 1.55], [37.6, 1.7, 'out2'], [38.6, 2.15, 'sine'], [39.2, 2.3, 'sine']]);
    ST.rubCam = cam;
    const fn = t => {
      const c = hh(cam(t), t, 0.3, 35);
      const inn = EZ.io(ss(37.15, 37.55, t)), rub = env(t, 37.5, 37.65, 38.55, 38.7);
      let tip = L2(enter, c0, inn);
      if (t > 37.55) tip = L2(c0, c1, 0.5 - 0.5 * Math.cos((t - 37.55) * 8.5));
      const pressK = 4 * rub * Math.sin((t - 37.5) * 17);
      tip = add(tip, armN, pressK);
      const cuts = [Object.assign({}, C2, { draw: 1, open: 0.8, blood: 0.55, matter: ss(37.6, 38.6, t) })];
      return ST.armScene(t, c, { cuts, scab: { u: ST.C1.u, v: ST.C1.v, k: 1 }, tool: { tip, beta: 60, lo: { matter: 1 - 0.6 * ss(37.6, 38.6, t), blood: 0.3 } }, tremble: 0.8 + rub, pose: 'fist' });
    };
    X.shot('RUB', 37.15, 39.2, fn, { grade: 'gHall' });
  }

  // ======================================================= POV: the doctor watches to see if you drop dead (38.7 - 40.65)
  // "just to see if you drop dead."
  {
    const cam = CAM(
      [[38.7, [830, 1000, 0]], [39.5, [838, 985, -1], 'sine'], [40.3, [845, 970, 1], 'sine'], [40.65, [848, 965, 0], 'sine']],
      [[38.7, 2.3], [39.5, 2.65, 'sine'], [40.3, 3.0, 'sine'], [40.65, 3.1, 'sine']]);
    ST.povCam = cam;
    const docFace = t => ({ expr: 'neutral', look: t < 39.4 ? [0.25, 0.55] : L2([0.25, 0.55], [-0.12, 0.02], ss(39.4, 39.7, t)), lid: lerp(0.3, 0.12, ss(39.4, 39.8, t)), mouth: 'tight', brows: [3, 2] });
    const fn = t => {
      const c0 = cam(t), beat = bump(t, 39.0, 1, 0.22) + bump(t, 39.62, 1, 0.22) + bump(t, 40.15, 1, 0.22);
      const c = hh([c0[0], c0[1], c0[2] * (1 + 0.018 * beat), c0[3]], t, 0.55, 37);
      const out = ST.surgScene(t, c, { youFace: () => ({ expr: 'fear', look: [0.8, 0.1], lid: 0.1, mouth: 'tight', brows: [-12, 2], sweat: 0.6 }), docFace, docSway: () => -3, docTilt: () => -3, watch: ST.watchG(t), marks: () => ({}) });
      // your pulse in the frame edges
      return out + `<rect width="1080" height="1920" fill="#3a0606" opacity="${f(0.1 + 0.12 * beat)}" style="mix-blend-mode:multiply"/>` + C.vignette(0.85, '#0a0202', 0.3);
    };
    X.shot('POV', 38.7, 40.65, fn, { grade: 'gHall' });
  }

  // ======================================================= BLOOD2: the cow sickness destroys the plague (39.95 - 43.75)
  // "The cow sickness in your blood destroys the plague before a single sore can form,"
  {
    const rp = rng(83), N = 22, pox = [];
    for (let i = 0; i < N; i++) pox.push({ t0: 40.25 + rp() * 0.7, x0: (rp() - 0.5) * 1.1, y0: (rp() - 0.5) * 1.7, z0: 3.4 + rp() * 2.0, vz: 0.8 + rp() * 0.5, rot: rp() * 360, spin: (rp() - 0.5) * 60, td: 41.65 + rp() * 1.2, ph: rp() * TAU });
    // the antibodies: three per particle, flying in from the edges to latch on just before it breaks apart
    const abs = []; pox.forEach((p, i) => { for (let k = 0; k < 3; k++) abs.push({ i, a: rp() * TAU, t0: 40.7 + rp() * 0.6, rot: rp() * 360 }); });
    const pPos = (p, t) => { const age = t - p.t0, z = Math.max(1.3, p.z0 - age * p.vz); return [p.x0 * (1 + 0.1 * Math.sin(t + p.ph)), p.y0 + 0.08 * Math.sin(t * 1.3 + p.ph), z]; };
    const fn = t => {
      const roll = -2 * Math.sin(t * 0.6), steer = [50 * Math.sin(t * 0.7 + 2), 50 * Math.sin(t * 0.5)];
      const extra = (tt, proj) => {
        const it = [];
        for (const p of pox) { if (tt < p.t0) continue; const cr = ss(p.td, p.td + 0.45, tt); if (cr >= 1) continue; const [x, y, z] = pPos(p, tt);
          it.push({ z, draw: () => { const [sx, sy, sc] = proj(x, y, z), op = clamp((tt - p.t0) / 0.3); return `<g opacity="${f(op)}">${PR.poxV(sx, sy, sc * 0.0019, p.rot + (tt - p.t0) * p.spin, 'small', { crumble: cr })}</g>`; } }); }
        for (const a of abs) { const p = pox[a.i]; if (tt < a.t0) continue; const cr = ss(p.td, p.td + 0.45, tt); if (cr >= 1) continue; const arrive = EZ.io(ss(a.t0, p.td - 0.05, tt));
          const [px, py, pz] = pPos(p, tt), sx0 = px + Math.cos(a.a) * 1.6, sy0 = py + Math.sin(a.a) * 2.2, dd = 0.13;
          const x = lerp(sx0, px + Math.cos(a.a) * dd, arrive), y = lerp(sy0, py + Math.sin(a.a) * dd * 1.3, arrive), z = lerp(pz + 0.6, pz - 0.05, arrive);
          it.push({ z, draw: () => { const [sx, sy, sc] = proj(x, y, z), op = clamp((tt - a.t0) / 0.25) * (1 - cr); return PR.antibody(sx, sy, sc * 0.002, a.rot * (1 - arrive) + (Math.atan2(py - y, px - x) / D2R + 90) * arrive, op); } }); }
        // a white cell crossing near the camera, reaching for the broken pieces
        const wz = lerp(3.2, 1.6, ss(41.8, 43.4, tt)), wx = lerp(-0.9, 0.2, ss(41.6, 43.4, tt));
        it.push({ z: wz, draw: () => { const [sx, sy, sc] = proj(wx, 0.5, wz); return `<g opacity="${f(ss(41.5, 41.9, tt))}">${PR.wbc(sx, sy, sc * 0.2, tt, 9, { reach: [sc * 0.06 * ss(42.2, 42.8, tt), 0] })}</g>`; } });
        return it;
      };
      const v = S.vessel(t, { dist: tt => (tt - 39.95) * 4 + 40, cx: steer[0], cy: steer[1], extra, n: 58 });
      // the battle's glow: gold where the antibodies win, then a clean warm calm
      const gl = C.radial(540, 960, 900, '#ffc860', 0.22 * env(t, 41.6, 42.0, 42.8, 43.4), 'screen');
      const dark = `<rect width="1080" height="1920" fill="#1a0614" opacity="${f(0.28 * env(t, 40.2, 40.7, 42.4, 43.2))}" style="mix-blend-mode:multiply"/>`;
      return `<g transform="rotate(${f(roll)} 540 960)">${v}</g>` + dark + gl + C.vignette(0.65, '#1a0202', 0.4);
    };
    X.shot('BLOOD2', 39.95, 43.75, fn, {});
  }

  // ======================================================= ARM2: no sore forms; then twenty more cuts (43.15 - 48.9)
  // "before a single sore can form, the doctor slices your arm and poisons you with the plague twenty more times
  //  just to be sure you can't die,"
  {
    const armU = ST.armU, armN = ST.armN, C1 = ST.C1, C2 = ST.C2;
    const C3 = { u: 0.25, v: 0.22, len: 100, a: -6 };
    const [d0, d1, dm] = ST.cutEnds(C3), above = [-armN[0], -armN[1]];
    // the twenty: positions along the forearm, each appears red and heals to a pale scar
    const rm = rng(29), MARKS = [];
    // a continuous route: up one side of the forearm, back down the other (so the flicking lancet never jumps across)
    for (let i = 0; i < 20; i++) MARKS.push({ u: 0.14 + (i < 10 ? i : 19 - i) * 0.066 + (rm() - 0.5) * 0.02, v: (i < 10 ? -0.26 : 0.27) + (rm() - 0.5) * 0.08, len: 50 + rm() * 30, a: (rm() - 0.5) * 30, t: 47.5 + i * 0.055 + 0.0275 });
    ST.MARKS20 = MARKS;
    const cam = CAM(
      [[43.15, [ST.armPt(0.62, 0)[0] + 10, ST.armPt(0.62, 0)[1] - 20, 0]], [44.6, [ST.armPt(0.62, 0)[0], ST.armPt(0.62, 0)[1] - 10, 1], 'sine'], [45.2, [dm[0], dm[1] - 40, 0], 'io'], [46.3, [dm[0] + 10, dm[1] - 30, -1], 'sine'], [47.5, [dm[0], dm[1] - 20, 0], 'sine'], [47.95, [ST.armPt(0.45, 0)[0], ST.armPt(0.45, 0)[1] - 40, 0], 'io'], [48.6, [ST.armPt(0.5, 0)[0], ST.armPt(0.5, 0)[1] - 40, 0], 'sine'], [48.9, [ST.armPt(0.5, 0)[0], ST.armPt(0.5, 0)[1] - 40, 0], 'sine']],
      [[43.15, 1.8], [44.6, 2.2, 'sine'], [45.2, 1.7, 'io'], [46.3, 2.0, 'sine'], [47.5, 2.05, 'sine'], [47.95, 1.32, 'io'], [48.6, 1.2, 'sine'], [48.9, 1.12, 'sine']]);
    ST.arm2Cam = cam;
    const fn = t => {
      const c = hh(cam(t), t, 0.3, 39);
      const sore = { u: C2.u, v: C2.v, k: 0.5 * env(t, 43.2, 43.9, 44.0, 44.6) };
      // the slice (44.9 - 46.2) and the rub (46.3 - 47.5)
      const inn = EZ.io(ss(44.75, 45.25, t)), draw = EZ.sine(ss(45.25, 45.95, t)), rub = env(t, 46.3, 46.45, 47.2, 47.4), outT = EZ.io(ss(47.35, 47.75, t));
      const enter = add(add(d0, above, 300), armU, -200);
      // the rub starts where the slice ended (d1), so the tip never jumps
      let tip = L2(enter, d0, inn);
      if (t > 45.25) tip = L2(d0, d1, draw);
      if (t > 46.2) tip = L2(d1, d0, 0.5 - 0.5 * Math.cos((t - 46.2) * 8.2));
      if (t > 47.35) tip = L2(L2(d1, d0, 0.5 - 0.5 * Math.cos((47.35 - 46.2) * 8.2)), enter, outT);
      // the time-lapse: the lancet flicks in for each new cut (smooth in and out), days flicker past. The flick path is
      // blended in from the rub-out path and, at the end, sent off past the top-left, so the lancet never pops
      const lapse = env(t, 47.45, 47.6, 48.55, 48.75);
      let tool = t > 44.75 && t < 47.45 ? { tip, beta: 60, lo: { matter: t > 46.0 ? 1 - ss(46.4, 47.3, t) : 0, blood: ss(45.3, 45.9, t) * 0.6 } } : null;
      if (t >= 47.45 && t < 48.8) {
        // between cuts the lifted tip glides on to the next mark (no jumps): it dips onto mark i at mid-step, then moves on
        const k = clamp((t - 47.5) / 0.055, 0, 19.999), i = Math.floor(k), fk = k - i, ph = 0.5 - 0.5 * Math.cos(TAU * fk);
        const m0 = ST.cutEnds(MARKS[i])[0], m1 = ST.cutEnds(MARKS[Math.min(19, i + 1)])[0];
        const off = add(add(d0, above, 900), armU, -500), flick = add(L2(m0, m1, ss(0.5, 1, fk)), above, 160 * (1 - ph));
        const lapseTip = L2(flick, off, ss(48.45, 48.75, t));
        tool = { tip: L2(tip, lapseTip, ss(47.45, 47.75, t)), beta: 60, lo: { matter: 0.6 } };
      }
      const marks = MARKS.filter(m => t > m.t).map(m => Object.assign({}, m, { age: clamp((t - m.t) / 0.5) }));
      const cuts = [Object.assign({}, C2, { draw: 1, open: lerp(0.8, 0.25, ss(43.2, 44.6, t)), blood: lerp(0.5, 0.15, ss(43.2, 44.6, t)), matter: lerp(1, 0.3, ss(43.2, 44.6, t)) })];
      if (t > 45.25) cuts.push(Object.assign({}, C3, { draw: t < 45.95 ? draw : 1, open: ss(45.6, 46.2, t) * 0.8, blood: ss(45.6, 46.6, t) * 0.6, matter: ss(46.35, 47.3, t) }));
      let out = ST.armScene(t, c, { cuts, marks, scab: { u: C1.u, v: C1.v, k: 1 }, sore, tool, tremble: 0.5 + 0.6 * rub, pose: 'fist' });
      // days passing: the light rises and falls quickly (smooth)
      if (lapse > 0) out += `<rect width="1080" height="1920" fill="#0a0c1a" opacity="${f(0.32 * lapse * (0.5 + 0.5 * Math.cos(TAU * (t - 47.5) / 0.36)))}" style="mix-blend-mode:multiply"/>`;
      return out;
    };
    X.shot('ARM2', 43.15, 48.9, fn, { grade: 'gHall' });
  }

  // ======================================================= ALIVE: you are still alive (48.3 - 50.7)
  // "just to be sure you can't die,"
  {
    const W = ST.SURG.WRIST_L;
    const cam = CAM(
      [[48.3, [600, 1320, 0]], [48.9, [560, 1260, 0], 'sine'], [49.55, [420, 1110, 0], 'io'], [50.1, [700, 1020, 0], 'io'], [50.7, [760, 990, 0], 'sine']],
      [[48.3, 2.0], [48.9, 1.8, 'sine'], [49.55, 2.4, 'io'], [50.1, 2.2, 'io'], [50.7, 2.4, 'sine']]);
    ST.aliveCam = cam;
    const youFace = t => ({ expr: 'hollow', look: [0.02, 0.05], lid: 0.3, mouth: 'closed', brows: [-4, 2], sweat: 0.2 });
    const docFace = t => { const ok = ss(49.7, 50.1, t); return { expr: ok > 0.5 ? 'neutral' : 'stern', look: t < 49.6 ? [0.35, 0.6] : [-0.7, 0.3], lid: 0.2, mouth: ok > 0.5 ? 'smirk' : 'tight', brows: [4, -1] }; };
    const fn = t => {
      const c = hh(cam(t), t, 0.3, 41);
      return ST.surgScene(t, c, { youFace, docFace, watch: ST.watchG(t), docTilt: () => -6, marks: () => ({ scab: 1, scars: 20 }) }) + C.vignette(0.5);
    };
    X.shot('ALIVE', 48.3, 50.7, fn, { grade: 'gHall' });
  }

  // ======================================================= LEDGER: the first vaccine, in the doctor's case book (50.1 - end)
  // "and that insane test creates the world's very first vaccine."
  {
    const BK = [540, 1100], BS = 0.85;
    const bw = p => [BK[0] + p[0] * BS, BK[1] + p[1] * BS];
    const write = t => EZ.sine(ss(51.85, 53.45, t));
    // the quill in the grip frame: nib out of the thumb side at +120, the feather out past the little finger
    const quillG = (k) => `<g transform="scale(${f(k)})"><path d="M120,0 L96,-3 L96,3Z" fill="#2a1a10"/><path d="M96,-3.5 L-40,-4 L-40,4 L96,3.5Z" fill="#d8ccb0" stroke="#5a4a30" stroke-width="1"/><path d="M60,-3 C10,-26 -120,-46 -300,-30 C-200,-16 -80,-8 0,-3Z" fill="#efe8da" stroke="#8a7a60" stroke-width="1.5"/><path d="M40,3 C-20,16 -130,24 -270,14 C-170,8 -60,6 0,3Z" fill="#e2d8c4" stroke="#8a7a60" stroke-width="1.2"/>${[0, 1, 2, 3, 4, 5].map(i => `<path d="M${-40 - i * 40},-4 l-30,${f(-12 - i * 2)}" stroke="#b8ac90" stroke-width="1"/>`).join('')}</g>`;
    const QS = ST.AW.doc, QK = QS / 116;
    const cam = CAM(
      [[50.1, [740, 1000, 0]], [50.9, [770, 1030, 0.5], 'sine'], [51.75, [700, 1210, 0], 'io'], [52.6, [770, 1250, -0.5], 'sine'], [53.45, [790, 1255, 0], 'sine'], [X.T_END, [600, 1140, 0], 'io']],
      [[50.1, 1.75], [50.9, 1.95, 'sine'], [51.75, 1.75, 'io'], [52.6, 2.05, 'sine'], [53.45, 2.2, 'sine'], [X.T_END, 1.4, 'io']]);
    ST.ledgerCam = cam;
    const fn = t => {
      const c = hh(cam(t), t, 0.3, 43);
      const set = S.desk9(t);
      const wr = write(t);
      let g = PR.ledger(BK[0], BK[1], BS, { tally: 20, write: wr });
      // the nib follows the writing; before and after it hovers just off the page
      const nibB = P_nib(wr, t), nib = bw(nibB);
      const lift = 1 - env(t, 51.7, 51.85, 53.45, 53.7);
      const tipW = [nib[0] + 20 * lift, nib[1] - 40 * lift];
      const gr = closeGrip(tipW, -140, 'R', 'back', QS, 95, 120 * QK);
      g += `<ellipse cx="${f(gr.wrist[0] + 90)}" cy="${f(gr.wrist[1] + 120)}" rx="260" ry="170" fill="#0a0604" opacity="0.32" filter="url(#b14)"/>`;
      g += ST.docCloseArm(gr.wrist, gr.dir, { hold: quillG(QK), hr: 95 });
      const layers = set.concat([{ p: 1, svg: g }]);
      return X.compose(layers, c) + `<rect width="1080" height="1920" fill="#8a6a3a" opacity="0.22" style="mix-blend-mode:multiply"/>` + C.radial(scr([1160, 820], c)[0], scr([1160, 820], c)[1], 900 * c[2], '#ffc070', 0.12, 'screen') + C.vignette(0.7, '#080402', 0.38);
    };
    // the nib path in book units: resting at the start of the word, writing along it, then lifting at its end
    const P_nib = (wr, t) => PR.ledgerNib(wr);
    X.shot('LEDGER', 50.1, X.T_END + 0.1, fn, { grade: 'gDusk' });
  }

  // ======================================================= transitions, part 2 and the loop
  X.tr('zmatch', 22.6, 0.6, 'COW', 'BLOOD', { fa: ST.cowBlisterScr(22.6), fb: [660, 880], za: 2.6, zb: 2.2, seed: 13, leak: '#ff8a4a', leakOp: 0.4 });
  X.tr('lens', 23.95, 0.6, 'BLOOD', 'BED', { fa: [540, 960], fb: [540, 960], za: 1.2 });
  X.tr('iris', 30.7, 0.6, 'BED', 'TIEBACK', { fa: ST.bedDoorScr(30.4), fb: [540, 980], k: 4 });
  X.tr('morph', 33.3, 0.6, 'TIEBACK', 'DYING', { fa: [540, 960], fb: [540, 960], za: 1.35, zb: 1.3, col: '#ffb060' });
  X.tr('carry', 37.45, 0.6, 'DYING', 'RUB', { mode: 'pan', dir: [1, 0], dist: 0.42, blur: 12 });
  X.tr('dip', 38.95, 0.5, 'RUB', 'POV', { fa: [540, 960], fb: [540, 900], za: 0.2, zb: 0.12, col: '#0a0302' });
  X.tr('eyelid', 40.3, 0.7, 'POV', 'BLOOD2', {});
  X.tr('organic', 43.45, 0.6, 'BLOOD2', 'ARM2', { fa: [540, 960], fb: [540, 960], za: 1.12, zb: 0.9, seed: 15, freq: 0.0042, leak: '#ffb060', leakOp: 0.25 });
  X.tr('carry', 48.6, 0.6, 'ARM2', 'ALIVE', { mode: 'zoom', k: 0.6, fa: [540, 960], fb: [540, 960], blur: 4 });
  X.tr('sweep', 50.4, 0.6, 'ALIVE', 'LEDGER', { col: '#ffe0a8', dir: 1 });
  X.tr('bokeh', X.T_END, 0.62, 'LEDGER', 'CHAIR', { end: true, bOff: -X.T_END, dir: [0, 1], dist: 0.3, blur: 14, seed: 11 });
})(window);
