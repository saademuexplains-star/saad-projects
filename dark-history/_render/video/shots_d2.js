// "The Royal Taster" part 2: the feast (taster side), the brother, the poison flashback, the taster's agony.
(function (G) {
  const X = G.ENG, T = G.TCAST, S = G.SETS, PR = G.PROPS, C = G.CINE, R = G.RIG, D = G.SHOTS_D;
  const { track: TK, ss, clamp, lerp, EZ } = X;
  const { f, mix } = R;
  const { gripAt, gripPt, place, ptOn, L4, scr, wor, idle, wave, env, bump, hh, nrm, rot, L2 } = D;
  const sbob = (t, hz) => 0.5 - 0.5 * Math.cos(Math.PI * 4 * hz * t), spos = (t, hz) => Math.pow(0.5 + 0.5 * Math.sin(Math.PI * 2 * hz * t), 2);
  const D2R = Math.PI / 180, lit = X.lit, blur = (svg, id) => `<g filter="url(#${id})">${svg}</g>`;

  // ---------------------------------------------------------------- shared layout of the great hall
  const A = { LX: -320, LS: 0.6, LY: 1560 + 830 * 0.6, TX: 150, TS: 0.62, TY: 1560 + 820 * 0.62, KX: 600, KS: 0.64, KY: 1560 + 820 * 0.64, GX: 980 };
  const B = { BX: 540, BS: 0.62, BY: 1840, NX: 120, NS: 0.62, NY: 1560 + 820 * 0.62, OX: 960, OS: 0.62, OY: 1560 + 820 * 0.62 };
  D.A = A; D.B = B;
  const armsOver = (p, L, which = 'RL') => C.lit({ svg: (which.includes('R') ? p.armRsvg : '') + (which.includes('L') ? p.armLsvg : ''), info: p.info }, Object.assign({ view: X.viewRect(1) }, L)).body;
  D.armsOver = armsOver;
  const plateT = [A.TX + 20, 1600], plateK = [A.KX + 40, 1604];
  D.plateT = plateT; D.plateK = plateK;
  // the King's tall chair
  const throneBack = (x, y, s) => `<g transform="translate(${x},${y}) scale(${s})"><path d="M-230,0 L-230,-1180 Q-230,-1300 -120,-1320 L0,-1420 L120,-1320 Q230,-1300 230,-1180 L230,0Z" fill="#3a1a10" stroke="#1f140c" stroke-width="3" filter="url(#woodV)"/><path d="M-180,-60 L-180,-1150 Q-180,-1250 0,-1290 Q180,-1250 180,-1150 L180,-60Z" fill="#7a1420" stroke="#1f140c" stroke-width="2" filter="url(#cloth)"/>` +
    [-1, 1].map(k => `<circle cx="${k * 230}" cy="-1190" r="34" fill="#c9a040" stroke="#1f140c" stroke-width="2"/>`).join('') + `<path d="M0,-1420 L0,-1500" stroke="#c9a040" stroke-width="16"/><circle cx="0" cy="-1510" r="26" fill="#c9a040" stroke="#1f140c" stroke-width="2"/></g>`;
  D.throneBack = throneBack;
  // jester juggling (mid layer); drop 0..1 lets the balls fall
  const jester = (t, x, drop = 0) => {
    const o = Object.assign(idle(t, 31), { x, y: 1700, s: 0.5, tilt: wave(t, 1.5) * 3 });
    const up = k => Math.max(0, wave(t, 1.5, k * Math.PI));
    const p = T.jester(Object.assign(o, { face: { mouth: drop > 0.3 ? 'o' : 'grin', open: drop > 0.3 ? 0.4 : 0.2, look: [0, -0.6 + drop * 0.8], lid: 0.15 },
      armR: { hand: [-170, -980 - up(0) * 60 * (1 - drop)], pose: 'open', facing: 'palm' }, armL: { hand: [170, -980 - up(1) * 60 * (1 - drop)], pose: 'open', facing: 'palm' } }));
    let balls = '';
    for (let i = 0; i < 3; i++) {
      const ph = (t * 1.5 + i / 3) % 1, bx = x + Math.cos(ph * Math.PI * 2) * 70, byUp = 1700 - 1080 * 0.5 - Math.sin(ph * Math.PI) * 220;
      const by = lerp(byUp, 1700 - 40 - i * 10, EZ.in2(drop));
      balls += `<circle cx="${f(bx + i * 20 * drop)}" cy="${f(by)}" r="13" fill="${['#c8302a', '#e0b030', '#2a6ab0'][i]}" stroke="#1f140c" stroke-width="2"/>`;
    }
    return lit(p, L4.hall) + balls;
  };
  D.jester = jester;
  // a servant crossing the back of the hall with a jug
  const walker = (t, x0, x1, t0, t1, seed, who = 'page') => {
    const u = clamp((t - t0) / (t1 - t0)); if (u <= 0 || u >= 1) return '';
    const x = lerp(x0, x1, u), o = Object.assign(idle(t, seed), { x, y: 1700 + sbob(t, 1.2) * 8, s: who === 'page' ? 0.62 : 0.55 });
    const p = (who === 'page' ? T.page : T.server)(Object.assign(o, { face: { look: [x1 > x0 ? 0.6 : -0.6, 0.2] }, armR: { hand: [-120, -470], pose: 'fist', facing: 'back' } }));
    return lit(p, L4.hall) + PR.jug(x - 70 * o.s, 1700 - 400 * o.s, 0.45);
  };
  D.walker = walker;
  const lady = (t, st = {}) => {
    const o = Object.assign(idle(t, 12), { x: A.LX, y: A.LY - (st.stand || 0) * 330, s: A.LS, tilt: st.tilt ?? wave(t, 0.4) * 2 });
    return T.lady(Object.assign(o, { face: Object.assign({ look: [0.6, 0.1], mouth: 'smile', lid: 0.25 }, st.face || {}), armR: st.armR || { hand: [-60, -820], pose: 'relaxed' }, armL: st.armL || { hand: [90, -820], pose: 'relaxed' } }));
  };
  D.lady = lady;

  // ======================================================= HALL  ceiling -> along the feast -> the bite -> numb (7.45 - 13.40)
  {
    const cam = TK([[8.7, [-650, 1240, 1.0, 0]], [9.45, [120, 1280, 1.28, 0], 'out2'], [10.3, [190, 1262, 1.72, 0], 'sine'], [10.95, [165, 1262, 2.3, 0]], [11.7, [152, 1262, 3.05, 0], 'sine'], [12.3, [152, 1258, 3.2, 0]], [13.4, [165, 1080, 2.8, 0], 'in2']]);
    const ceilRot = t => 360 + (t - 7.45) * 14; // keeps turning like the dishes did
    // the taster's spoon hand: plate -> mouth -> down; fingers up, palm to camera, bowl to his mouth
    const mouth = [A.TX, A.TY - 1308 * A.TS + 100 * A.TS * 1.07];
    const bowlOff = 83 * A.TS;
    const tFist = TK([[8.7, [plateT[0] + 62, 1470]], [9.55, [plateT[0] + 62, 1470]], [9.95, [mouth[0] + bowlOff + 4, mouth[1] + 4], 'io'], [10.45, [mouth[0] + bowlOff + 2, mouth[1] + 2]], [10.9, [mouth[0] + bowlOff + 34, mouth[1] + 96], 'io'], [13.4, [mouth[0] + bowlOff + 40, mouth[1] + 104]]]);
    const kMouth = [A.KX, A.KY - 1308 * A.KS + 95 * A.KS];
    X.shot('HALL', 7.45, 13.4, t => {
      const tilt = ss(8.12, 8.78, t);
      const ceiling = () => X.compose(S.ceiling(t, { rot: ceilRot(t), r: 380 }), [540, 960, lerp(1.0, 1.12, ss(7.45, 8.3, t)), 0]);
      const hall = () => {
        const c = hh(cam(t), t, 0.45, 7);
        const set = S.feast(t, { side: 'A', tableY: 1630 });
        const L = L4.hall;
        // taster: eats, then the numbness
        const numb = ss(11.0, 11.25, t), lookUp = ss(12.25, 12.6, t);
        const chew = t > 10.4 && t < 11.05 ? 0.08 + 0.1 * spos(t, 2.8) : 0;
        const tO = Object.assign(idle(t, 1), { x: A.TX, y: A.TY, s: A.TS, breath: numb ? 0 : T.breath(t * 1.1), tilt: lerp(1, -2, numb) + lerp(0, -4, lookUp) });
        const tFace = { expr: numb > 0.5 ? 'fear' : 'anxious', look: [lerp(0.2, 0, numb), lerp(lerp(0.4, 0, numb), -0.95, lookUp)], mouth: t > 9.8 && t < 10.45 ? 'parted' : numb > 0.5 ? 'parted' : chew ? 'talk' : 'closed',
          open: t > 9.8 && t < 10.4 ? 0.32 : numb > 0.5 ? 0.12 : chew, wide: numb > 0.5, lid: numb > 0.5 ? 0.02 : undefined, brows: numb > 0.5 ? [-10, -6 - lookUp * 3] : [-6, -2] };
        const fist = tFist(t), tArm = gripAt(tO, 'taster', fist, [0, -1], { facing: 'palm', hold: `<g transform="translate(-55,0)">${PR.spoon({ food: t < 10.2 })}</g>` });
        const taster = T.taster(Object.assign(tO, { face: tFace, armL: tArm, armR: { hand: [-120, -795], pose: 'relaxed', dir: [0.3, 1] } }));
        // King: gnawing a roast leg, laughing with the lady
        const kb = spos(t, 0.9);
        const kO = Object.assign(idle(t, 2), { x: A.KX, y: A.KY, s: A.KS, tilt: 2 + wave(t, 0.9) * 2 });
        const kFist = [kMouth[0] + 74 + kb * 30, kMouth[1] + 30 + kb * 70];
        const king = T.king(Object.assign(kO, { face: { mouth: kb > 0.6 ? 'grin' : 'talk', open: kb > 0.6 ? 0.25 : 0.12 + 0.1 * spos(t, 2.4), look: [-0.6, 0.2], lid: 0.18 },
          armL: gripAt(kO, 'king', kFist, [0, -1], { facing: 'palm', hold: PR.leg({ bite: 0.6 }) }), armR: { hand: [-150, -820], pose: 'relaxed' } }));
        const guard = T.guard(Object.assign(idle(t, 9), { x: A.GX, y: 1780, s: 0.55, face: { look: [-0.5, 0.2], lid: 0.4 } }), 0);
        const ladyP = lady(t, { face: { mouth: wave(t, 0.7) > 0.4 ? 'grin' : 'smile', open: 0.12, look: [0.7, 0.05] } });
        const chars = lit(ladyP, L) + lit(guard, L) + throneBack(A.KX, 1572, 0.62) + lit(king, L) + lit(taster, L);
        const back = [{ p: 0.86, svg: blur(jester(t, -1050) + walker(t, 1700, -1400, 8.2, 13.4, 3, 'page') + walker(t, -1500, 1800, 7.5, 12.9, 5, 'server'), 'dof1') }];
        const items = PR.candelabra(380, 1592, 0.55, t) + PR.plate(plateT[0], plateT[1], 0.55, { steam: t }) + PR.plate(plateK[0], plateK[1], 0.6, { meat: true }) + PR.goblet(790, 1618, 0.6, {}) + PR.goblet(-170, 1618, 0.55, {}) +
          PR.bird(-560, 1612, 0.42, { t }) + PR.bread(1180, 1614, 0.6) + PR.boar(1500, 1612, 0.42, { t: t + 1 }) + PR.apples(-900, 1616, 0.7) + PR.jug(-260, 1618, 0.6);
        // foreground candles and goblets slide past the lens during the dolly
        let fg = ''; for (const [x, k] of [[-1100, 0], [-500, 1], [140, 2], [800, 3], [1500, 4]]) fg += k % 2 ? PR.candelabra(x, 1980, 0.9, t + k) : PR.goblet(x, 1960, 1.3, {});
        const layers = [...set.back, ...back, { p: 1, svg: chars, chars: true }, ...set.front, { p: 1, svg: items + armsOver(taster, L) + armsOver(king, L) }, { p: 1.32, svg: blur(fg, 'dof3') }];
        let out = X.compose(layers, c);
        // numbness: the colour drains, the edges close in, a faint pulse
        if (numb > 0) out += `<rect width="1080" height="1920" fill="#808080" opacity="${f(0.55 * numb * (1 - 0.6 * lookUp))}" style="mix-blend-mode:saturation"/>` + C.vignette(0.55 * numb, '#05040a', lerp(0.55, 0.32, numb));
        return out;
      };
      if (tilt <= 0) return ceiling();
      if (tilt >= 1) return hall();
      // the camera tilts down out of the ceiling into the hall with matched speed and a vertical smear
      const D0 = 1500, ua = tilt * tilt, ub = (1 - tilt) * (1 - tilt), fade = ss(0.38, 0.62, tilt), v = Math.sin(Math.PI * tilt);
      let g = '';
      if (fade < 1) g += `<g transform="translate(0,${f(-D0 * ua)})">${ceiling()}</g>`;
      if (fade > 0) g += `<g transform="translate(0,${f(D0 * ub)})" opacity="${f(fade)}">${hall()}</g>`;
      const id = 'tiltB' + Math.round(t * 60);
      return `<defs><filter id="${id}" x="-10%" y="-20%" width="120%" height="140%"><feGaussianBlur stdDeviation="${f(v * 3)} ${f(v * 26)}" edgeMode="duplicate"/></filter></defs><g filter="url(#${id})">${g}</g>`;
    }, { grade: 'gFeast' });
  }
  X.tr('bokeh', 12.95, 0.9, 'HALL', 'BRO', { dir: [0, 1], dist: 0.55, blur: 14, seed: 9 });

  // ======================================================= BRO  across the table: the King's brother (12.50 - 17.75)
  {
    const head = [B.BX, B.BY - 1308 * B.BS];
    const cam = TK([[12.5, [540, 760, 1.55, 0]], [13.4, [540, 1020, 1.75, 0], 'out2'], [15.75, [540, 1035, 1.82, 0], 'sine'], [16.9, [575, 1320, 3.0, 0], 'io'], [17.75, [582, 1336, 3.55, 0], 'in2']]);
    const vertigo = TK([[13.6, 1], [15.8, 1.42, 'io']]);
    const dg = [74, -800], ANG = 14;
    X.shot('BRO', 12.5, 17.7, t => {
      const c = hh(cam(t), t, 0.3, 8);
      const set = S.feast(t, { side: 'B', tableY: 1630 });
      const L = L4.hallB;
      const draw = ss(16.75, 17.2, t) * 0.36, smirk = ss(14.9, 15.4, t);
      const bO = Object.assign(idle(t, 3, 0.3), { x: B.BX, y: B.BY, s: B.BS, breath: 0, sway: 0, tilt: 0 });
      const gp = PR.daggerGrip(dg[0], dg[1], 1, draw, ANG), a = ANG * D2R, dir = [-Math.cos(a), -Math.sin(a)];
      const tight = ss(16.2, 16.5, t) * 3;
      const W = [gp[0] - dir[0] * (0.33 * 110 - tight), gp[1] - dir[1] * (0.33 * 110 - tight)];
      const bro = T.brother(Object.assign(bO, { face: { look: [0, 0.04], lid: lerp(0.28, 0.4, smirk), mouth: smirk > 0.5 ? 'smirk' : 'closed', brows: [lerp(2, 5, smirk), lerp(-2, -4, smirk)] },
        props: PR.dagger(dg[0], dg[1], 1, draw, ANG, bump(t, 17.2, 1, 0.4)), armL: { hand: W, pose: 'grip', dir, facing: 'back' }, armR: { hand: [-110, -800], pose: 'relaxed' } }));
      // diners keep feasting around the motionless brother
      const nO = Object.assign(idle(t, 21), { x: B.NX, y: B.NY, s: B.NS, tilt: wave(t, 1.1) * 4 });
      const baron = T.baron(Object.assign(nO, { face: { mouth: 'grin', open: 0.15 + 0.15 * spos(t, 4.5), look: [0.5, 0.1], lid: 0.2 }, armR: { hand: [-120, -900 + wave(t, 1.1) * 30], pose: 'fist' }, armL: { hand: [160, -850], pose: 'relaxed' } }));
      const oO = Object.assign(idle(t, 22), { x: B.OX, y: B.OY, s: B.OS });
      const lord = T.lord(Object.assign(oO, { face: { look: [-0.5, 0.2], mouth: 'talk', open: T.talk(t, 0.18, 6) }, armR: { hand: [-140, -860], pose: 'open', facing: 'palm' } }));
      const guard = T.guard(Object.assign(idle(t, 23), { x: 1330, y: 1780, s: 0.55, face: { look: [-0.4, 0.1], lid: 0.35 } }), 1);
      // dolly-zoom: everything but the brother swells around him
      const m = vertigo(t), hs = scr(head, c);
      const vz = svg => `<g transform="translate(${f(hs[0])},${f(hs[1])}) scale(${f(m)}) translate(${f(-hs[0])},${f(-hs[1])})">${svg}</g>`;
      const items = PR.candelabra(300, 1592, 0.55, t + 3) + PR.candelabra(800, 1592, 0.55, t + 5) + PR.plate(560, 1600, 0.55, { meat: true }) + PR.goblet(220, 1618, 0.6, {}) + PR.goblet(1080, 1618, 0.6, {}) + PR.bird(-200, 1612, 0.42, { t }) + PR.bread(1300, 1614, 0.6);
      const env1 = X.compose([...set.back, { p: 0.86, svg: blur(walker(t, -1300, 1800, 12.6, 17.7, 8, 'server'), 'dof1') }, { p: 1, svg: lit(guard, L) + lit(baron, L) + lit(lord, L), chars: true }], c);
      const front = X.compose([...set.front, { p: 1, svg: items }], c);
      const broSvg = X.compose([{ p: 1, svg: lit(bro, L), chars: true }], c);
      return vz(env1) + broSvg + vz(front);
    }, { grade: 'gFeast' });
  }
  D.broGlint = () => { const cam = [582, 1336, 3.4]; const o = { x: B.BX, y: B.BY, s: B.BS }; const gp = PR.daggerGrip(74, -800, 1, 0.36, 14); const w = R.toWorld(o, [gp[0] + 4, gp[1] + 30]); return scr(w, cam); };

  // ======================================================= KIT  flashback: he poisons the plate (17.20 - 18.95)
  {
    const BXk = 780, BSk = 0.7, BYk = 1990, plate = [540, 1610];
    const cam = TK([[17.2, [610, 1380, 2.7, 0]], [17.9, [575, 1440, 2.25, 0], 'sine'], [18.45, [548, 1555, 2.7, 0], 'io'], [18.95, [542, 1585, 3.1, 0], 'in2']]);
    const fist = TK([[17.2, [640, 1395]], [17.6, [628, 1420], 'sine'], [18.95, [626, 1426]]]);
    const tipA = TK([[17.2, -20], [17.55, 18, 'io'], [18.95, 22]]);   // finger direction swings so the vial mouth turns down
    const drops = [17.62, 17.86, 18.08, 18.27];
    X.shot('KIT', 17.2, 18.95, t => {
      const c = hh(cam(t), t, 0.3, 11);
      const set = S.kitchen(t, { tableY: 1560 });
      const L = L4.kit;
      const bO = Object.assign(idle(t, 3, 0.3), { x: BXk, y: BYk, s: BSk, breath: 0, sway: 0, tilt: -6 });
      const d = rot([-1, 0], tipA(t) * D2R);
      const arm = gripAt(bO, 'brother', fist(t), d, { facing: 'back', hold: PR.vial({ col: '#6ab83a', level: 0.55, open: true, glint: bump(t, 17.2, 1, 0.45) }) });
      const bro = T.brother(Object.assign(bO, { face: { look: [-0.5, 0.75], lid: 0.38, mouth: 'smirk' }, armR: arm, armL: { hand: [120, -820], pose: 'relaxed' } }));
      const mouthW = gripPt(bO, 'brother', 'R', arm, 58, 0);
      // drops: fall under gravity from the vial mouth to the meat, splash
      let dr = '';
      for (const t0 of drops) {
        if (t < t0) continue;
        const dt = t - t0, y = mouthW[1] + 1600 * dt * dt, hit = plate[1] - 22;
        if (y < hit) dr += PR.dropC(mouthW[0] - dt * 20, y, 7, '#7ad040');
        else { const k = clamp((y - hit) / 90); dr += `<ellipse cx="${f(mouthW[0] - 10)}" cy="${hit}" rx="${f(8 + k * 26)}" ry="${f(3 + k * 7)}" fill="none" stroke="#9ae050" stroke-width="2.5" opacity="${f(1 - k)}"/>`; }
      }
      const cook = T.cook(Object.assign(idle(t, 40), { x: 160, y: 1700, s: 0.5, face: { look: [-0.4, 0.3], lid: 0.4 }, armR: { hand: [-180, -900 + wave(t, 1) * 20], pose: 'fist' } }));
      const layers = [...set.back, { p: 0.82, svg: blur(lit(cook, L), 'dof2') }, { p: 1, svg: lit(bro, L), chars: true }, ...set.front,
        { p: 1, svg: PR.plate(plate[0], plate[1], 1.0, { poison: ss(17.7, 18.5, t) }) + dr }];
      return X.compose(layers, c) + `<rect width="1080" height="1920" fill="#1a3a0a" opacity="0.18" style="mix-blend-mode:color"/>`;
    }, { grade: 'gSick' });
  }
  D.kitGlint = () => { const cam = [610, 1380, 2.7]; const bO = { x: 780, y: 1990, s: 0.7 }; const arm = gripAt(bO, 'brother', [640, 1395], rot([-1, 0], -20 * D2R), { facing: 'back' }); return scr(gripPt(bO, 'brother', 'R', arm, -6, -6), cam); };
  X.tr('glint', 17.45, 0.5, 'BRO', 'KIT', { fa: D.broGlint(), fb: D.kitGlint(), za: 0.2, zb: 0.2, col: '#f4ffe0' });
  X.tr('zmatch', 18.65, 0.6, 'KIT', 'TAS', { fa: scr([540, 1600], [542, 1580, 2.95]), fb: scr([plateT[0], plateT[1] - 8], [170, 1590, 3.0]), za: 2.2, zb: 2.2, seed: 13, blur: 4 });

  // ======================================================= TAS  "waiting to see if you warn the King" -> throat, sweat, spoon (18.35 - 26.90)
  {
    const tHead = [A.TX, A.TY - 1308 * A.TS];
    const cam = TK([[18.35, [170, 1590, 3.0, 0]], [19.25, [330, 1385, 1.45, 0], 'out2'], [19.95, [270, 1330, 1.72, 0], 'sine'], [21.6, [168, 1318, 2.75, 0], 'io'], [22.45, [168, 1322, 3.0, 0]],
      [22.9, [205, 1205, 3.45, 0], 'io'], [23.85, [168, 1352, 3.25, 0], 'sine'], [24.75, [215, 1450, 2.7, 0], 'io'], [25.35, [205, 1440, 2.6, 0]], [26.15, [160, 1268, 2.9, 0], 'io'], [26.9, [120, 1262, 3.0, 0]]]);
    const burn = TK([[19.9, 0], [21.2, 1, 'io'], [22.3, 1], [24.5, 0.55, 'sine']]);
    const cough = t => env(t, 24.95, 25.1, 25.45, 25.7);
    X.shot('TAS', 18.35, 26.9, t => {
      const c = hh(cam(t), t, 0.4, 13);
      const set = S.feast(t, { side: 'A', tableY: 1630 });
      const L = L4.hall;
      const bn = burn(t), cg = cough(t);
      // the taster: frozen, burning throat, sweat, white-knuckle grip on the table edge, spoon held dead still
      const tO = Object.assign(idle(t, 1, 0.3), { x: A.TX, y: A.TY, s: A.TS, breath: 0, sway: 0, tilt: -1 + cg * 2 + Math.sin(t * 31) * 0.25 * bn,
        skin: mix('#dcae8a', '#e08a78', 0.45 * bn) });
      const tFace = { expr: 'fear', look: t < 19.9 ? [0.15, -0.05] : [0.1, 0.1], wide: bn < 0.5, lid: lerp(0.05, 0.3, bn) + cg * 0.45, mouth: cg > 0.3 ? 'tight' : bn > 0.3 ? 'tight' : 'closed',
        brows: [-10 - cg * 3, -4 - cg * 2], sweat: ss(22.6, 23.2, t) * 0.8 };
      const trem = [Math.sin(t * 57) * 1.2 + Math.sin(t * 83) * 0.8, Math.sin(t * 63) * 1.0];
      const fist = [plateT[0] + 62 + trem[0], 1455 + trem[1] - cg * 4];
      const tArm = gripAt(tO, 'taster', fist, [0, -1], { facing: 'palm', hold: `<g transform="translate(-55,0)">${PR.spoon({})}</g>` });
      const taster = T.taster(Object.assign(tO, { face: tFace, armL: tArm, armR: Object.assign(gripAt(tO, 'taster', [A.TX - 96, 1588], [0.2, 1]), { facing: 'back' }) }));
      // the oblivious King laughing with the lady
      const kb = spos(t, 0.75);
      const kO = Object.assign(idle(t, 2), { x: A.KX, y: A.KY + kb * 6, s: A.KS, tilt: -2 - kb * 6 });
      const king = T.king(Object.assign(kO, { face: { mouth: 'grin', open: 0.15 + kb * 0.35, look: [-0.9, 0.1], lid: 0.2 + kb * 0.15 }, armL: gripAt(kO, 'king', [A.KX + 120, 1500 - kb * 40], [0, -1], { facing: 'palm', hold: PR.leg({ bite: 0.6 }) }), armR: { hand: [-150, -820], pose: 'relaxed' } }));
      const guard = T.guard(Object.assign(idle(t, 9), { x: A.GX, y: 1780, s: 0.55, face: { look: [-0.5, 0.2], lid: 0.4 } }), 0);
      const ladyP = lady(t, { face: { mouth: 'grin', open: 0.15 + 0.1 * spos(t, 3), look: [0.8, 0.05] } });
      // throat: glowing cracks under the skin of the throat and chin
      let throat = '';
      if (bn > 0.01) {
        const tc = R.toWorld(tO, [0, -1186]), r = R.rng(5);
        let cr = '';
        for (let i = 0; i < 9; i++) { let x = 0, y = 0, d = `M0,0`; const a0 = -Math.PI / 2 + (i - 4) * 0.36; for (let k = 0; k < 4; k++) { const a = a0 + (r() - 0.5) * 0.9, l = (10 + r() * 16) * bn; x += Math.cos(a) * l; y += Math.sin(a) * l * 0.8 + 3; d += ` L${f(x)},${f(y)}`; } cr += `<path d="${d}" stroke="#ffb060" stroke-width="2.2" fill="none" stroke-linecap="round"/>`; }
        throat = `<g transform="translate(${f(tc[0])},${f(tc[1])}) scale(${f(A.TS)})" opacity="${f(0.85 * bn * (0.8 + 0.2 * Math.sin(t * 9)))}" style="mix-blend-mode:screen">${cr}<g filter="url(#b2)">${cr}</g></g>` + C.radial(tc[0], tc[1], 70 * bn, '#ff5a2a', 0.55 * bn);
      }
      // sweat running from the temple down the jaw to the collar
      let sweat = '';
      for (const [t0, side, sx] of [[22.65, 1, 70], [22.95, -1, -66], [23.25, 1, 60], [23.6, 1, 74], [24.0, -1, -70]]) {
        const u = clamp((t - t0) / 1.1); if (u <= 0 || u >= 1) continue;
        const lp = [sx * (1 - u * 0.35), lerp(-40, 175, EZ.in2(u))], hp = R.headPt(tO, 'man', [lp[0] * 0.93, lp[1] * 1.07]), w = R.toWorld(tO, hp);
        sweat += `<g opacity="${f(Math.min(1, (1 - u) * 4))}">${PR.dropC(w[0], w[1], 4.2 + u * 1.2, '#dfeefa')}</g>`;
      }
      // the brother over-the-shoulder: a dark out-of-focus silhouette in the right foreground while he watches
      let ots = '';
      const otsK = env(t, 18.5, 18.9, 19.9, 20.5);
      if (otsK > 0) ots = `<g opacity="${f(otsK)}">${blur(`<g filter="url(#silh)">${T.brother({ x: 470, y: 3040, s: 1.25, face: {} }).svg}</g>`, 'dof3')}</g>`;
      const chars = lit(ladyP, L) + lit(guard, L) + throneBack(A.KX, 1572, 0.62) + lit(king, L) + lit(taster, L);
      const back = [{ p: 0.86, svg: blur(jester(t, -1050) + walker(t, 1700, -1400, 18.4, 25.5, 4, 'server'), 'dof1') }];
      const items = PR.candelabra(380, 1592, 0.55, t) + PR.plate(plateT[0], plateT[1], 0.55, { steam: t }) + place(PR.leg({}), [plateT[0] + 6, plateT[1] - 18], -8, A.KS) + PR.plate(plateK[0], plateK[1], 0.6, { meat: true }) + PR.goblet(790, 1618, 0.6, {}) + PR.goblet(-170, 1618, 0.55, {}) + PR.bird(-560, 1640, 0.42, { t }) + PR.jug(-260, 1640, 0.6);
      const layers = [...set.back, ...back, { p: 1, svg: chars, chars: true }, ...set.front, { p: 1, svg: items + armsOver(taster, L) + armsOver(king, L) + throat + sweat }, { p: 1.4, svg: ots }];
      let out = X.compose(layers, c);
      out += C.vignette(0.35 + 0.25 * bn, '#14040a', 0.45) + `<rect width="1080" height="1920" fill="#ff3010" opacity="${f(0.06 * bn * (0.7 + 0.3 * Math.sin(t * 7)))}" style="mix-blend-mode:overlay"/>`;
      return out;
    }, { grade: 'gFeast' });
  }
  // a servant walks right across the lens: the cut hides behind her
  const servantWipe = (x, u) => `<g filter="url(#dof4)"><g transform="translate(${f(x - 540)},0)"><g filter="url(#silhS)">${T.server({ x: 540, y: 3900, s: 2.6, face: {}, armR: { hand: [-140, -900], pose: 'fist' } }).svg}</g></g></g>`;
  X.tr('wipe', 26.55, 0.75, 'TAS', 'EYE', { dir: -1, truck: 260, obj: servantWipe });
})(window);
