// "The Stoker" part 1: shoveling coal -> crane up through the ship to the ballroom -> the iceberg -> the breach and the bell
// -> the captain's switch -> the door drops, the sprint and the dive -> underwater, the door pins the boot.
// Props that touch hands are animated first; grips and finger directions are derived from them.
(function (G) {
  const X = G.ENG, Q = G.QCAST, S = G.SETS, PR = G.PROPS, C = G.CINE, R = G.RIG;
  const { track: TK, ss, clamp, lerp, EZ } = X;
  const { f, mix } = R;
  const TAU = Math.PI * 2, D2R = Math.PI / 180;
  // ---- helper header (as in shots_e.js)
  const wave = (t, hz, ph = 0) => Math.sin(TAU * hz * t + ph);
  const sbob = (t, hz) => 0.5 - 0.5 * Math.cos(TAU * 2 * hz * t);
  const env = (t, a, b, c, d) => ss(a, b, t) * (1 - ss(c, d, t));
  const bump = (t, t0, a = 1, len = 0.35) => (t < t0 || t > t0 + len) ? 0 : a * Math.pow(Math.sin(Math.PI * (t - t0) / len), 2);
  const idle = (t, seed, amp = 1) => ({ blink: Q.blink(t, seed), breath: Q.breath(t * 1.1 + seed) * 0.6, sway: X.noise(t * 0.45, seed) * 0.5 * amp });
  const hh = (c, t, amp = 1, seed = 0) => { const h = X.hand(t, amp, seed); return (X.CAM = [c[0] + h[0], c[1] + h[1], c[2], (c[3] || 0) + h[2]]); };
  const scr = (w, c, p = 1) => { const [cx, cy, z] = c, zp = Math.pow(z, p), px = 540 + (cx - 540) * p, py = 960 + (cy - 960) * p; return [540 + (w[0] - px) * zp, 960 + (w[1] - py) * zp]; };
  const lit = X.lit, blur = (svg, id) => `<g filter="url(#${id})">${svg}</g>`;
  const nrm = v => { const n = Math.hypot(v[0], v[1]) || 1; return [v[0] / n, v[1] / n]; };
  const L2 = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
  const HAND = { you: 118, stokerA: 116, stokerB: 116, stokerC: 125.3, captain: 116, officer: 116, richMan: 116, richMan2: 116, richWoman: 104, richWoman2: 104 };
  const gripAt = (o, who, Gw, dW, extra = {}) => { const dl = nrm(R.dirLocal(o, dW)), gl = R.toLocal(o, Gw), gy = 0.33 * HAND[who]; return Object.assign({ hand: [gl[0] - dl[0] * gy, gl[1] - dl[1] * gy], dir: dl, pose: 'grip', facing: 'back' }, extra); };
  const gripPt = (o, who, side, arm, px, py = 0) => { const d = nrm(arm.dir), t = (side === 'R' ? -1 : 1) * (arm.facing === 'palm' ? 1 : -1), gy = 0.33 * HAND[who]; return R.toWorld(o, [arm.hand[0] + d[1] * t * px + d[0] * (gy + py), arm.hand[1] - d[0] * t * px + d[1] * (gy + py)]); };
  const fingersFor = (side, facing, thumb) => { const t = (side === 'R' ? -1 : 1) * (facing === 'palm' ? 1 : -1); return [-thumb[1] * t, thumb[0] * t]; };
  const armsOver = (p, L, which = 'RL') => C.lit({ svg: (which.includes('R') ? p.armRsvg : '') + (which.includes('L') ? p.armLsvg : ''), info: p.info }, Object.assign({ view: X.viewRect(1) }, L)).body;
  const handsLit = (p, L) => C.lit({ svg: (p.handR || '') + (p.handL || ''), info: p.info }, Object.assign({ view: X.viewRect(1) }, L)).body;
  // camera = position track [x, y, roll] + its own zoom track (zoom dips never kink the travel)
  const CAM = (pk, zk) => { const P = TK(pk), Z = TK(zk); return t => { const p = P(t); return [p[0], p[1], Z(t), p[2]]; }; };
  const shake = (t, t0, len, amp, hz = 40) => (t < t0 || t > t0 + len) ? [0, 0] : (() => { const k = amp * Math.pow(1 - (t - t0) / len, 2) * ss(t0, t0 + 0.04, t); return [Math.sin(t * hz * 1.3) * k, Math.cos(t * hz) * k * 0.7]; })();
  const LT = {
    boil: { from: [0.8, 0.15], shadow: '#2a1008', shadowOp: 0.6, floor: '#3a1a0a', floorOp: 0.5, contactOp: 0.5, key: '#ffb070', keyAdd: 0.12, rims: [{ from: [1, 0.2], col: '#ff9a40', w: 7, op: 0.6 }, { from: [-1, -0.4], col: '#8aa0c0', w: 5, op: 0.22 }], face: { col: '#ffc890', op: 0.2 } },
    ball: { from: [0.1, -1], shadow: '#3a2010', shadowOp: 0.45, floor: '#4a2e18', floorOp: 0.35, contactOp: 0.4, key: '#ffe0b0', keyAdd: 0.08, rims: [{ from: [0, -1], col: '#fff0d0', w: 6, op: 0.4 }], face: { col: '#ffe8c8', op: 0.15 } },
    red: { from: [0.6, -0.5], shadow: '#1a0606', shadowOp: 0.6, floor: '#2a0a06', floorOp: 0.45, contactOp: 0.4, key: '#ff9070', keyAdd: 0.08, rims: [{ from: [-1, -0.3], col: '#ff4020', w: 7, op: 0.55 }], face: { col: '#ffb090', op: 0.15 } },
    bridge: { from: [-0.6, -0.6], shadow: '#0a1020', shadowOp: 0.6, floor: '#1a1410', floorOp: 0.4, contactOp: 0.4, key: '#ffd8a0', keyAdd: 0.04, rims: [{ from: [1, -0.5], col: '#8ab0e0', w: 6, op: 0.5 }], face: { col: '#ffe0c0', op: 0.06 } },
  };
  G.SHOTS_G = { wave, sbob, env, bump, idle, hh, scr, nrm, L2, HAND, gripAt, gripPt, fingersFor, armsOver, handsLit, CAM, shake, blur };
  const ST = {};   // shared shot data (focus points for transitions)
  G.STOKER = ST;

  // ======================================================= OPEN: shoveling coal; the push-in; the crane up through the ship (-0.7 - 6.1)
  // "You're at the very bottom of the Titanic, shoveling coal in your underwear while rich people dance sixty feet above your head."
  {
    const YX = 430, YY = 1700, YS = 0.66, LEN = 360;
    // the shovel cycle (1.4 s): dig into the heap, lift, throw into the furnace mouth (lands on 0.73 and 2.13: "coal"), swing back
    const SC = [470, 1080, 66], LI = [440, 1170, 18], TH = [474, 1180, 8];
    const pose = (t, ph = 0) => {
      const u = (((t - 0.05 - ph) % 1.4) + 1.4) % 1.4;
      let p, coal;
      if (u < 0.3) { const k = EZ.sine(u / 0.3); p = [SC[0] + 10 * k, SC[1] + 12 * k, SC[2]]; }
      else if (u < 0.62) { const k = EZ.io((u - 0.3) / 0.32); p = SC.map((v, i) => lerp(v + (i < 2 ? (i ? 12 : 10) : 0), LI[i], k)); }
      else if (u < 0.74) { const k = EZ.out2((u - 0.62) / 0.12); p = LI.map((v, i) => lerp(v, TH[i], k)); }
      else { const k = EZ.io((u - 0.74) / 0.66); p = TH.map((v, i) => lerp(v, SC[i], k)); }
      coal = ss(0.16, 0.28, u) * (1 - ss(0.64, 0.72, u));
      return { p, coal, spark: u > 0.64 ? Math.pow(Math.sin(Math.PI * clamp((u - 0.64) / 0.4)), 2) : 0, u };
    };
    // one stoker shoveling with a given shovel pose; returns { svg, hands } (hands drawn after the shovel)
    const shoveler = (t, who, x, s, ph, L, faceO) => {
      const dx = x - YX, { p, coal, spark } = pose(t, ph), sh = PR.shovel(p[0] + dx, p[1], p[2], LEN * s / YS, { coal, seed: 7 + ph * 10 });
      const o = Object.assign(idle(t, 3 + ph * 7), { x, y: YY, s, sway: lerp(-2, 3, ss(1150, 1180, p[1])) + X.noise(t * 0.45, 1) * 0.4 });
      const thumb = sh.dir, aR = gripAt(o, who, sh.at(0.04), fingersFor('R', 'back', thumb), { detachHand: true }), aL = gripAt(o, who, sh.at(0.4), fingersFor('L', 'back', thumb), { detachHand: true });
      const P = Q[who](Object.assign(o, { face: faceO, armR: aR, armL: aL }));
      return { body: lit(P, L), shovel: sh.svg, hands: handsLit(P, L), spark, tip: sh.tip };
    };
    // the dancers upstairs: two couples turning a slow waltz
    const couple = (t, xm, xw, who, whoW, ph, L) => {
      const y = -2360, s = 0.6, sw = Math.sin(TAU * 0.6 * t + ph), dx = sw * 34, rot = Math.sin(TAU * 1.2 * t + ph) * 2.5;
      const mO = Object.assign(idle(t, ph * 3), { x: xm + dx, y: y + sbob(t + ph, 0.6) * 6, s, sway: rot }), wO = Object.assign(idle(t, ph * 3 + 1), { x: xw + dx, y: y + sbob(t + ph + 0.3, 0.6) * 6, s: s * 0.97, sway: rot });
      const back = [xw + dx - 30, y - 760], sho = [xm + dx + 50, y - 820];
      const man = Q[who](Object.assign(mO, { face: { mouth: 'smile', look: [0.6, 0.05], lid: 0.42 }, armL: { hand: R.toLocal(mO, back), pose: 'open', facing: 'back', dir: [0.3, 1] }, armR: { hand: [-210, -880], pose: 'relaxed', facing: 'back', dir: [-0.2, 1] } }));
      const wom = Q[whoW](Object.assign(wO, { face: { mouth: 'smile', look: [-0.6, 0.05], lid: 0.5 }, armR: { hand: R.toLocal(wO, sho), pose: 'open', facing: 'back', dir: [-0.4, 1] }, armL: { hand: [190, -860], pose: 'relaxed', facing: 'back', dir: [0.2, 1] } }));
      return lit(man, L) + lit(wom, L);
    };
    const cam = CAM(
      [[-0.7, [570, 1040, 0]], [2.0, [470, 1160, 0], 'io'], [3.0, [470, 1090, 0], 'sine'], [5.2, [520, -2850, 0], 'sine'], [6.1, [540, -3400, 0], 'sine']],
      [[-0.7, 0.78], [2.0, 1.28, 'io'], [3.0, 1.45, 'sine'], [4.1, 0.95, 'sine'], [5.2, 1.15, 'sine'], [6.1, 1.45, 'sine']]);
    const fn = t => {
      const c = hh(cam(t), t, 0.4, 1), L = LT.boil, set = S.boiler(t), dk = S.decks(t);
      const faceY = { expr: 'grim', sweat: true, lid: 0.46, look: [0.55, 0.3], mouth: 'tight', brows: [6, -2] };
      const me = shoveler(t, 'you', YX, YS, 0, L, faceY);
      const b = shoveler(t, 'stokerB', -420, 0.64, 0.55, L, { expr: 'tired', sweat: true, look: [0.6, 0.3] });
      // stoker A leans on his planted shovel, catching his breath
      const aO = Object.assign(idle(t, 9), { x: 1250, y: YY, s: 0.64 }), aSh = PR.shovel(1300, 1190, 86, LEN * 0.64 / YS, {});
      const aP = Q.stokerA(Object.assign(aO, { face: { expr: 'tired', sweat: true, lid: 0.55, look: [-0.4, 0.2], mouth: 'parted', open: 0.08 }, armR: gripAt(aO, 'stokerA', aSh.at(0.02), fingersFor('R', 'back', aSh.dir), { detachHand: true }), armL: gripAt(aO, 'stokerA', aSh.at(0.12), fingersFor('L', 'back', aSh.dir), { detachHand: true }) }));
      const fire = (sp, x) => sp > 0.01 ? C.radial(x, 1260, 260, '#ffb040', 0.55 * sp) + Array.from({ length: 10 }, (_, i) => `<circle cx="${f(x + Math.cos(i * 2.4) * 90 * sp)}" cy="${f(1250 - Math.abs(Math.sin(i * 1.7)) * 160 * sp)}" r="3" fill="#ffd070" opacity="${f(sp)}"/>`).join('') : '';
      const chars = b.body + b.shovel + b.hands + lit(aP, L) + aSh.svg + handsLit(aP, L) + me.body + me.shovel + me.hands + fire(me.spark, 830) + fire(b.spark, -20);
      // embers drifting up from the furnaces; sweat-steam haze
      let fx = ''; const r = R.rng(5);
      for (let i = 0; i < 30; i++) { const ph = ((t * 0.25 + r()) % 1); fx += `<circle cx="${f(-400 + r() * 2100 + Math.sin(t + i) * 20)}" cy="${f(1500 - ph * 1200)}" r="${f(1.5 + r() * 2.5)}" fill="#ffb050" opacity="${f(0.8 * Math.sin(Math.PI * ph))}"/>`; }
      const dancers = couple(t, 320, 470, 'richMan', 'richWoman', 0, LT.ball) + couple(t, 760, 910, 'richMan2', 'richWoman2', 1.7, LT.ball);
      const layers = [set.back, set.mid, set.boilers, set.floor, { p: 1, svg: chars + fx, chars: true }, dk.cab, dk.cor, dk.ball, { p: 1, svg: dancers }, dk.chand];
      return X.compose(layers, c) + C.vignette(0.35, '#080402', 0.5);
    };
    X.shot('OPEN', 0, 6.1, fn, { grade: 'gFeast' });
    ST.openCam = cam;
  }

  // ======================================================= ICE: midnight, the iceberg grinds along the hull, the plates tear (5.4 - 8.9)
  {
    const cam = CAM(
      [[5.4, [540, -560, 0]], [6.1, [540, -620, 0], 'out2'], [7.0, [600, 640, 0], 'sine'], [7.6, [470, 1220, 0], 'sine'], [8.9, [330, 1560, 0], 'io']],
      [[5.4, 1.0], [6.1, 1.0, 'sine'], [7.0, 0.85, 'sine'], [7.6, 1.1, 'sine'], [8.9, 2.3, 'in2']]);
    const fn = t => {
      const sh = [Math.sin(t * 47) * 5 * env(t, 7.2, 7.35, 8.4, 8.9), Math.cos(t * 39) * 4 * env(t, 7.2, 7.35, 8.4, 8.9)];
      const c0 = cam(t), c = hh([c0[0] + sh[0], c0[1] + sh[1], c0[2], c0[3]], t, 0.3, 2);
      const set = S.ocean(t, { rip: ss(7.25, 7.6, t), tc: 7.25 });
      const tint = `<rect x="-1500" y="${set.WL}" width="4200" height="2000" fill="#06141e" opacity="0.4"/>`;
      const layers = [set.sky, set.hull, set.under, set.berg, { p: 1, svg: tint }, set.surface];
      return X.compose(layers, c) + C.vignette(0.45, '#000208', 0.45);
    };
    X.shot('ICE', 5.4, 8.9, fn, { grade: 'gNight' });
    ST.iceCam = cam; ST.iceSpur = () => S.ocean(0, {}).spur;
  }

  // ======================================================= FLOOD: the wall bursts, black water blasts in; the red bell (8.3 - 13.6)
  {
    const YX = 430, YY = 1700, YS = 0.66, BELL = [980, 300];
    const cam = CAM(
      [[8.3, [-30, 1330, 0]], [9.3, [80, 1250, 0], 'out2'], [10.4, [300, 1150, -2], 'sine'], [11.4, [420, 1000, 0], 'sine'], [12.4, [800, 520, 2], 'io'], [13.6, [860, 160, 0], 'in2']],
      [[8.3, 2.0], [9.3, 1.1, 'out2'], [10.4, 1.05, 'sine'], [11.4, 1.8, 'sine'], [12.4, 1.65, 'sine'], [13.6, 1.5, 'sine']]);
    ST.floodCam = cam;
    const fn = t => {
      const blast = shake(t, 8.55, 0.8, 14), c0 = cam(t), c = hh([c0[0] + blast[0], c0[1] + blast[1], c0[2], c0[3]], t, 0.4, 3);
      const gash = ss(8.45, 8.8, t), jet = ss(8.6, 9.0, t), level = lerp(1780, 1630, ss(9.0, 13.6, t));
      const ring = ss(11.9, 12.05, t), red = ring * (0.55 + 0.45 * Math.sin(TAU * 2.2 * t));
      const L = LT.boil, set = S.boiler(t, { gash });
      // you: the blast turns you; arms up against the spray; "before you can run" a step toward the far door; the bell
      const recoil = bump(t, 8.6, 1, 0.6), step = EZ.io(clamp((t - 10.95) / 0.9));
      const yO = Object.assign(idle(t, 1), { x: YX + step * 50, y: YY + sbob(t, 1.3) * 6 * step, s: YS, sway: -3 * recoil + 2 * step, tilt: -6 * recoil });
      const look = TK([[8.3, [-0.2, 0.2]], [8.7, [-0.85, 0.05]], [10.9, [-0.8, 0.05]], [11.3, [0.65, -0.1]], [12.0, [0.7, -0.6]]])(t);
      const guard = ss(8.6, 8.85, t) * (1 - ss(10.6, 11.2, t));
      const you = Q.you(Object.assign(yO, {
        face: { expr: 'fear', wide: true, mouth: 'parted', open: 0.14, look, brows: [-14, 6], sweat: true },
        armR: { hand: L2([-200, -640], [-140, -1180], guard), pose: guard > 0.5 ? 'open' : 'relaxed', facing: 'palm', dir: nrm(L2([0.1, 1], [-0.3, -1], guard)) },
        armL: { hand: L2([200, -640], [130, -1050], guard), pose: guard > 0.5 ? 'open' : 'relaxed', facing: 'palm', dir: nrm(L2([-0.1, 1], [0.3, -1], guard)) },
      }));
      const bO = Object.assign(idle(t, 4), { x: -330 - recoil * 40, y: YY, s: 0.64, sway: -6 * recoil });
      const sB = Q.stokerB(Object.assign(bO, { face: { expr: 'fear', wide: true, mouth: 'parted', open: 0.2, look: [-0.7, 0.1] }, armR: { hand: [-120, -1200], pose: 'open', facing: 'palm', dir: [-0.2, -1] }, armL: { hand: [140, -1150], pose: 'open', facing: 'palm', dir: [0.2, -1] } }));
      const aO = Object.assign(idle(t, 9), { x: 1250, y: YY, s: 0.64, tilt: -4 });
      const sA = Q.stokerA(Object.assign(aO, { face: { expr: 'fear', look: [-0.8, 0], mouth: 'parted', open: 0.12 } }));
      const chars = lit(sB, L) + lit(sA, L) + lit(you, L);
      const front = S.waterJet(t, jet) + S.flood(t, level) + PR.alarm(BELL[0], BELL[1], 1.0, t, ring, red);
      const wash = red > 0.01 ? `<rect x="-1500" y="-1000" width="4200" height="4000" fill="#ff1a0a" opacity="${f(0.22 * red)}" style="mix-blend-mode:multiply"/>` + C.radial(BELL[0] + 125, BELL[1] + 50, 1400, '#ff2010', 0.25 * red) : '';
      const layers = [set.back, set.mid, set.boilers, set.breach, set.floor, { p: 1, svg: chars, chars: true }, { p: 1, svg: front + wash }];
      return X.compose(layers, c) + C.vignette(0.4, '#080202', 0.5);
    };
    X.shot('FLOOD', 8.3, 13.6, fn, { grade: 'gHall' });
  }

  // ======================================================= BRIDGE: the captain flips the switch (12.9 - 15.75)
  {
    const CX = 620, CY = 1720, CS = 0.62, PIV = [740, 1120], PS = 0.75;
    const lev = TK([[12.9, -55], [14.85, -55], [15.15, 35, 'in2'], [15.75, 38]]);
    const cam = CAM(
      [[12.9, [600, 1360, 0]], [13.6, [600, 1150, 0], 'out2'], [14.4, [560, 720, 0], 'sine'], [15.2, [760, 1120, 0], 'io'], [15.75, [800, 1170, 0], 'in2']],
      [[12.9, 1.55], [13.6, 1.5, 'out2'], [14.4, 1.05, 'sine'], [15.2, 1.95, 'io'], [15.75, 2.4, 'in2']]);
    ST.bridgeKnob = tt => { const p = PR.leverPanel(PIV[0], PIV[1], PS, lev(tt), tt); return scr(p.knob, cam(tt)); };
    const fn = t => {
      const c = hh(cam(t), t, 0.35, 4), L = LT.bridge, set = S.bridge(t);
      const panel = PR.leverPanel(PIV[0], PIV[1], PS, lev(t), t, { lamps: ss(15.0, 15.4, t) });
      const cO = Object.assign(idle(t, 6), { x: CX, y: CY, s: CS, tilt: 3 * ss(14.6, 15.1, t) });
      const armL = gripAt(cO, 'captain', panel.knob, fingersFor('L', 'back', panel.dir), { detachHand: true });
      const look = TK([[12.9, [0.1, 0.25]], [13.8, [0.1, 0.2]], [14.1, [0.15, -0.55]], [14.5, [0.2, -0.5]], [14.75, [0.6, 0.35]]])(t);
      const cap = Q.captain(Object.assign(cO, { face: { expr: 'grim', look, lid: 0.42, brows: TK([[12.9, [4, -2]], [14.6, [10, -4]]])(t), mouth: 'tight' }, armL, armR: { hand: [-160, -660], pose: 'relaxed' } }));
      const lamp = ss(15.0, 15.4, t) ? `<rect x="-1500" y="-1000" width="4200" height="4000" fill="#ff2a10" opacity="${f(0.1 * ss(15.0, 15.4, t))}" style="mix-blend-mode:screen"/>` : '';
      const layers = [set.out, set.frame, set.props, { p: 1, svg: panel.svg + lit(cap, L) + handsLit(cap, L) + lamp, chars: true }];
      return X.compose(layers, c) + C.vignette(0.45, '#02040a', 0.45);
    };
    X.shot('BRIDGE', 12.9, 15.75, fn, { grade: 'gNight' });
  }

  // ======================================================= SEC: the bulkhead in section: the door drops, water rises, sprint, dive (15.15 - 21.4)
  {
    const { BX0, FY, DTOP } = S.SEC, YS = 0.58;
    const doorY = TK([[15.15, DTOP], [15.5, DTOP + 6], [21.4, 1575, 'sine']]);
    const wl = TK([[15.15, 1520], [19.4, 1170, 'sine'], [21.4, 1150]]);
    const cam = CAM(
      [[15.15, [620, 760, 0]], [17.3, [480, 980, 0], 'sine'], [18.6, [380, 1080, 0], 'sine'], [19.7, [330, 1120, 0], 'sine'], [20.8, [470, 1240, 0], 'io'], [21.4, [560, 1440, 0], 'in2']],
      [[15.15, 2.0], [17.3, 1.2, 'sine'], [18.6, 0.92, 'sine'], [19.7, 1.1, 'sine'], [20.8, 1.35, 'io'], [21.4, 1.65, 'in2']]);
    ST.secCam = cam; ST.secDoorTop = tt => scr([620, doorY(tt) - 900 + 40], cam(tt));
    // your waist path: wading, the sprint to the door, then the dive (the body tips to horizontal around the waist)
    const waist = TK([[15.15, [200, 1700 - 476 * YS / 0.66]], [19.6, [210, 1700 - 476 * YS / 0.66]], [20.8, [470, 1700 - 476 * YS / 0.66], 'io'], [21.4, [600, 1600], 'in2']]);
    const tip = t => 90 * EZ.io(clamp((t - 20.8) / 0.45));
    const fn = t => {
      const c = hh(cam(t), t, 0.4, 5), L = LT.red, ring = ss(15.3, 15.5, t), red = 0.6 + 0.4 * Math.sin(TAU * 2.2 * t);
      const set = S.section(t, { doorY: doorY(t), red, ring, spill: ss(16.5, 18.5, t) });
      // you: from the waist, the feet are found by rotating the waist offset with the dive
      const sw = tip(t), a = sw * D2R, wv = waist(t), off = 476 * YS / 0.66, run = env(t, 19.6, 19.8, 20.7, 20.85);
      const yO = Object.assign(idle(t, 1), { x: wv[0] - off * Math.sin(a), y: wv[1] + off * Math.cos(a) + sbob(t, 2.2) * 10 * run, s: YS, sway: sw + Math.sin(t * 9) * 2 * run });
      const look = TK([[15.15, [0.6, -0.6]], [18.0, [0.6, -0.55]], [18.6, [0.2, 0.1]], [19.5, [0.75, -0.1]]])(t);
      const you = Q.you(Object.assign(yO, { face: { expr: 'fear', wide: true, mouth: t > 19.6 ? 'snarl' : 'parted', open: 0.12, look, brows: [-14, 6], sweat: true },
        armR: { hand: L2([-180, -1000], [-260, -1250], run), pose: 'open', facing: 'palm', dir: [-0.3, -1] }, armL: { hand: L2([180, -1000], [300, -1200], run), pose: 'open', facing: 'palm', dir: [0.4, -1] } }));
      // the crew: hands clutching his head in despair, reaching toward the door, bracing against the bulkhead
      const ARMS = {
        stokerA: [{ hand: [-95, -1300], pose: 'open', facing: 'back', dir: [0.45, -1] }, { hand: [95, -1300], pose: 'open', facing: 'back', dir: [-0.45, -1] }],
        stokerB: [{ hand: [-170, -880], pose: 'fist', facing: 'back', dir: [0, 1] }, { hand: [330, -1060], pose: 'open', facing: 'palm', dir: [1, -0.25] }],
        stokerC: [{ hand: [-130, -980], pose: 'fist', facing: 'back', dir: [0.2, 1] }, { hand: [300, -1160], pose: 'open', facing: 'palm', dir: [0.9, -0.45] }],
      };
      const men = [['stokerA', -330, 7, [-0.1, -0.8]], ['stokerB', -70, 4, [0.6, -0.5]], ['stokerC', 380, 8, [0.8, -0.4]]].map(([w, x, sd, lk]) => {
        const o = Object.assign(idle(t, sd), { x: x + Math.sin(t * 0.8 + sd) * 14, y: FY, s: 0.56 });
        const talk = w === 'stokerB' ? { mouth: 'talk', open: Q.talk(t, 0.25, 9) } : { mouth: 'parted', open: 0.14 };
        return lit(Q[w](Object.assign(o, { face: Object.assign({ expr: 'fear', wide: true, look: lk, brows: [-14, 6] }, talk), armR: ARMS[w][0], armL: ARMS[w][1] })), L);
      }).join('');
      const youSvg = sw > 2 ? `<g filter="url(#skinS)">${you.svg}</g>` : lit(you, L);
      const splash = env(t, 20.85, 20.95, 21.1, 21.4);
      let fx = ''; for (let i = 0; i < 14; i++) fx += `<circle cx="${f(wv[0] + Math.cos(i * 1.9) * 120 * (0.5 + splash))}" cy="${f(wl(t) - Math.abs(Math.sin(i * 2.3)) * 140 * splash)}" r="${f(5 + (i % 3) * 3)}" fill="#d8e8ea" opacity="${f(splash)}"/>`;
      const water = `<g clip-path="url(#secL)">${S.flood(t, wl(t), { x0: -1500, x1: BX0 + 4 })}</g><defs><clipPath id="secL"><rect x="-1500" y="-1000" width="${BX0 + 1500}" height="4000"/></clipPath></defs>`;
      const layers = [set.left, set.right, set.floor, { p: 1, svg: men + youSvg, chars: true }, { p: 1, svg: water + fx + set.slab }, set.wall];
      return X.compose(layers, c) + C.vignette(0.45, '#080202', 0.45);
    };
    X.shot('SEC', 15.15, 21.4, fn, { grade: 'gHall' });
  }

  // ======================================================= PIN: underwater, side view at the gap: the door comes down on the boot (20.9 - 25.4)
  // no body in frame: his lower leg (trousers, boot) trails through the gap from the right; the door slab descends onto the heel.
  {
    const A = [600, 1300], LS = 0.9, ROT = 80, DX0 = 480, DX1 = 660, SILL = 1640, PIN_Y = 1152;
    const doorB = TK([[20.9, 860], [22.0, 900, 'sine'], [23.95, PIN_Y, 'in2'], [24.1, PIN_Y + 22, 'out2'], [24.5, PIN_Y + 16, 'sine']]);
    const cam = CAM(
      [[20.9, [560, 1260, 0]], [22.0, [560, 1150, 0], 'sine'], [23.6, [580, 1240, 0], 'sine'], [24.1, [590, 1250, 2], 'out2'], [25.4, [610, 1270, 0], 'sine']],
      [[20.9, 1.0], [22.0, 1.05, 'sine'], [23.6, 1.3, 'sine'], [24.1, 1.55, 'out2'], [25.4, 1.7, 'sine']]);
    ST.pinCam = cam;
    const r0 = R.rng(31), DEB = Array.from({ length: 26 }, () => [r0() * 1400 - 200, r0() * 1500 + 300, 3 + r0() * 8, r0()]);
    const fn = t => {
      const imp = shake(t, 23.95, 0.5, 16), c0 = cam(t), c = hh([c0[0] + imp[0], c0[1] + imp[1], c0[2], c0[3]], t, 0.3, 6);
      const red = 0.55 + 0.45 * Math.sin(TAU * 2.2 * t), pinned = t > 23.95;
      const tug = pinned ? Math.sin((t - 23.95) * 9) * 10 * ss(24.2, 24.5, t) : -Math.max(0, (22.5 - t)) * 30;
      const a = [A[0] + tug, A[1]];
      // backgrounds: the flooded side (left, under water) and the safe side (right, air above a rushing shallow flow)
      let back = `<rect x="-1500" y="-1500" width="${DX0 + 1500}" height="4000" fill="#0e2228"/>` + `<rect x="${DX1}" y="-1500" width="2500" height="4000" fill="#2a2c30"/>` + S.plates(DX1, 0, 2200, 1650, 240, 170, '#2e3034', 61);
      back += `<rect x="-1500" y="${SILL}" width="4200" height="600" fill="#1a1816"/>` + C.radial(100, 600, 900, '#ff2010', 0.3 * red);
      const leg = `<g transform="translate(${f(a[0])},${f(a[1])}) rotate(${ROT}) scale(${LS})">${PR.legClose({ skin: '#b8886a' })}${PR.trouserLeg('#4a443e', -260)}${PR.boot({ crush: pinned ? 0.18 : 0 })}</g>`;
      // water: everything left of the door; on the right only the shallow flow along the floor
      let water = `<rect x="-1500" y="-1500" width="${DX0 + 1500}" height="4000" fill="#0a2a34" opacity="0.5"/>` + `<rect x="${DX1}" y="1540" width="2500" height="200" fill="#1c3a44" opacity="0.6"/>`;
      let wl = `M${DX1},1540`; for (let x = DX1; x <= 2700; x += 30) wl += ` L${x},${f(1540 + Math.sin(x * 0.02 - t * 9) * 8)}`; water += `<path d="${wl}" stroke="#cfe8f0" stroke-width="5" fill="none" opacity="0.7"/>`;
      for (const [x, y, rr, k] of DEB) { const yy = ((y + t * 40 * (0.3 + k)) % 1500) + 200; if (x < DX0) water += `<circle cx="${f(x + Math.sin(t + k * 9) * 20)}" cy="${f(yy)}" r="${f(rr)}" fill="${k > 0.5 ? '#1a1a1c' : '#cfe8f0'}" opacity="${f(k > 0.5 ? 0.7 : 0.35)}"/>`; }
      // bubbles and the current racing through the gap
      for (let i = 0; i < 20; i++) { const ph = ((t * 1.3 + i / 20) % 1), y = doorB(t) + 20 + (i % 5) * ((SILL - doorB(t)) / 5); water += `<ellipse cx="${f(DX0 - 200 + ph * 700)}" cy="${f(y)}" rx="${f(10 + ph * 20)}" ry="4" fill="#cfe8f0" opacity="${f(0.45 * Math.sin(Math.PI * ph))}"/>`; }
      if (pinned) for (let i = 0; i < 16; i++) { const ph = clamp((t - 23.95 - i * 0.02) / 0.6); if (ph > 0 && ph < 1) water += `<circle cx="${f(560 + Math.cos(i * 1.7) * 160 * ph)}" cy="${f(PIN_Y + 10 - Math.abs(Math.sin(i * 2.1)) * 200 * ph)}" r="${f(4 + (i % 4) * 3)}" fill="none" stroke="#e8f8ff" stroke-width="2" opacity="${f(0.8 * (1 - ph))}"/>`; }
      const slab = `<rect x="${DX0}" y="${f(doorB(t) - 2400)}" width="${DX1 - DX0}" height="2400" fill="#56585c" filter="url(#tex)" ${R.ol(3)}/><rect x="${DX0}" y="${f(doorB(t) - 30)}" width="${DX1 - DX0}" height="30" fill="#2a2c30"/>` + Array.from({ length: 10 }, (_, i) => `<circle cx="${(DX0 + DX1) / 2}" cy="${f(doorB(t) - 80 - i * 150)}" r="9" fill="#76787c"/>`).join('') + `<rect x="${DX0 - 30}" y="${SILL}" width="${DX1 - DX0 + 60}" height="40" fill="#2a2624" ${R.ol(2)}/>`;
      const layers = [{ p: 1, svg: back }, { p: 1, svg: `<g filter="url(#skinS)">${leg}</g>` }, { p: 1, svg: water + slab }];
      return X.compose(layers, c) + C.vignette(0.55, '#02080a', 0.42);
    };
    X.shot('PIN', 20.9, 25.4, fn, { grade: 'gNight' });
    ST.pinBoot = tt => scr([A[0] - 40, A[1] + 120], cam(tt));
  }
})(window);
