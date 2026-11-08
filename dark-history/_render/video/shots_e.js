// "The Worm" part 1: market -> micro world -> a year inside -> the burning morning.
// Props that touch hands are animated first; grips and finger directions are derived from them.
(function (G) {
  const X = G.ENG, Q = G.QCAST, S = G.SETS, PR = G.PROPS, C = G.CINE, R = G.RIG;
  const { track: TK, ss, clamp, lerp, EZ } = X;
  const { f, mix } = R;
  const TAU = Math.PI * 2, D2R = Math.PI / 180;
  const wave = (t, hz, ph = 0) => Math.sin(TAU * hz * t + ph);
  const sbob = (t, hz) => 0.5 - 0.5 * Math.cos(TAU * 2 * hz * t);
  const env = (t, a, b, c, d) => ss(a, b, t) * (1 - ss(c, d, t));
  const bump = (t, t0, a = 1, len = 0.35) => (t < t0 || t > t0 + len) ? 0 : a * Math.pow(Math.sin(Math.PI * (t - t0) / len), 2);
  const idle = (t, seed, amp = 1) => ({ blink: Q.blink(t, seed), breath: Q.breath(t * 1.1 + seed) * 0.6, sway: X.noise(t * 0.45, seed) * 0.5 * amp });
  const hh = (c, t, amp = 1, seed = 0) => { const h = X.hand(t, amp, seed); return (X.CAM = [c[0] + h[0], c[1] + h[1], c[2], (c[3] || 0) + h[2]]); };
  const scr = (w, c, p = 1) => { const [cx, cy, z] = c, zp = Math.pow(z, p), px = 540 + (cx - 540) * p, py = 960 + (cy - 960) * p; return [540 + (w[0] - px) * zp, 960 + (w[1] - py) * zp]; };
  const lit = X.lit, blur = (svg, id) => `<g filter="url(#${id})">${svg}</g>`;
  const rot = (v, a) => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)];
  const nrm = v => { const n = Math.hypot(v[0], v[1]) || 1; return [v[0] / n, v[1] / n]; };
  const L2 = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
  const HAND = { you: 112, seller: 125.3, healer: 112, merchant: 116, wife: 104 };
  const gripAt = (o, who, Gw, dW, extra = {}) => { const dl = nrm(R.dirLocal(o, dW)), gl = R.toLocal(o, Gw), gy = 0.33 * HAND[who]; return Object.assign({ hand: [gl[0] - dl[0] * gy, gl[1] - dl[1] * gy], dir: dl, pose: 'grip', facing: 'back' }, extra); };
  const gripPt = (o, who, side, arm, px, py = 0) => { const d = nrm(arm.dir), t = (side === 'R' ? -1 : 1) * (arm.facing === 'palm' ? 1 : -1), gy = 0.33 * HAND[who]; return R.toWorld(o, [arm.hand[0] + d[1] * t * px + d[0] * (gy + py), arm.hand[1] - d[0] * t * px + d[1] * (gy + py)]); };
  // thumb axis (world) of a hand for a world finger direction: left hand back = (-dy, dx), right hand back = (dy, -dx); palm flips
  const thumbAxis = (side, facing, d) => { const t = (side === 'R' ? -1 : 1) * (facing === 'palm' ? 1 : -1); return [d[1] * t, -d[0] * t]; };
  const fingersFor = (side, facing, thumb) => { const t = (side === 'R' ? -1 : 1) * (facing === 'palm' ? 1 : -1); return [-thumb[1] * t, thumb[0] * t]; };
  const place = (svg, p, a, s) => `<g transform="translate(${f(p[0])},${f(p[1])}) rotate(${f(a)}) scale(${f(s)})">${svg}</g>`;
  const armsOver = (p, L, which = 'RL') => C.lit({ svg: (which.includes('R') ? p.armRsvg : '') + (which.includes('L') ? p.armLsvg : ''), info: p.info }, Object.assign({ view: X.viewRect(1) }, L)).body;
  const L5 = {
    market: { from: [-0.6, -0.8], shadow: '#5a3a2a', shadowOp: 0.42, mid: 0.45, floor: '#6a4a30', floorOp: 0.35, contactOp: 0.45, cast: [0.4, 0.12], castOp: 0.25, key: '#fff0d8', keyAdd: 0.08, rims: [{ from: [1, -0.4], col: '#fff4e0', w: 6, op: 0.5 }], face: { col: '#fff0dc', op: 0.15 } },
    dayY: { from: [-0.5, -0.8], shadow: '#4a3a2e', shadowOp: 0.45, floor: '#5a4630', floorOp: 0.35, contactOp: 0.45, key: '#fff0d8', keyAdd: 0.06, rims: [{ from: [1, -0.4], col: '#fff0d8', w: 6, op: 0.45 }], face: { col: '#fff0dc', op: 0.12 } },
    nightY: { from: [0.6, -0.6], shadow: '#0e1020', shadowOp: 0.65, floor: '#14141c', floorOp: 0.35, contactOp: 0.5, key: '#a8b8e8', keyAdd: 0.04, rims: [{ from: [-1, -0.4], col: '#8aa0e0', w: 6, op: 0.5 }], face: { col: '#c8d4ff', op: 0.08 } },
    dawn: { from: [0.8, -0.6], shadow: '#2a1c1a', shadowOp: 0.55, floor: '#3a2a20', floorOp: 0.35, contactOp: 0.5, key: '#ffc890', keyAdd: 0.1, rims: [{ from: [1, -0.5], col: '#ffc080', w: 7, op: 0.6 }], face: { col: '#ffd8a8', op: 0.18 } },
  };
  G.SHOTS_E = { wave, sbob, env, bump, idle, hh, scr, rot, nrm, L2, HAND, gripAt, gripPt, thumbAxis, fingersFor, place, armsOver, L5, blur };

  // ======================================================= W1  the market: a cup of cool water (0 - 3.15)
  {
    const YX = 420, YY = 1660, YS = 0.66, SX = 760, SY = 1660, SS = 0.66;
    const cam = TK([[0, [560, 430, 0.6, 0]], [1.15, [520, 1000, 0.95, 0], 'out2'], [2.05, [455, 930, 1.6, 0], 'sine'], [3.15, [432, 875, 2.6, 0], 'in2']]);
    const mouth = [YX + 6, YY - 1308 * YS + 96 * YS];
    // the cup: thumb axis = rim direction. Held upright at the chest, then tipped up to the lips
    const cupSlot = TK([[0, [506, 1120]], [0.95, [506, 1118]], [1.65, [mouth[0] + 34, mouth[1] + 26], 'io'], [3.2, [mouth[0] + 30, mouth[1] + 20]]]);
    const rimAng = TK([[0, -90], [0.95, -90], [1.65, -140, 'io'], [2.4, -158], [3.2, -160]]);   // world angle of the rim direction
    const tip = TK([[0, -26], [0.25, -18], [0.85, -14], [1.0, -40, 'io']]);                       // goatskin tilt while pouring
    X.shot('W1', 0, 3.15, t => {
      const c = hh(cam(t), t, 0.45, 1);
      const L = L5.market;
      const set = S.market(t);
      // YOU holding the cup (left hand: fingers wrap round the cup, back of the hand to camera)
      const yO = Object.assign(idle(t, 1), { x: YX, y: YY, s: YS, breath: 0, sway: 0, tilt: lerp(0, -7, ss(1.6, 2.1, t)) });
      const ra = rimAng(t) * D2R, thumb = [Math.cos(ra), Math.sin(ra)], dir = fingersFor('L', 'back', thumb);
      const water = 0.9 - ss(1.8, 2.7, t) * 0.6;
      const yArm = gripAt(yO, 'you', cupSlot(t), dir, { hold: PR.cup({ water: t < 1.6 ? lerp(0.2, 0.9, ss(0.1, 0.85, t)) : water }) });
      const drink = env(t, 1.7, 1.9, 2.6, 3.1);
      const you = Q.you(Object.assign(yO, { face: { expr: 'neutral', look: t < 1.0 ? [0.5, 0.55] : [0.1, 0.3], lid: drink > 0.5 ? 0.62 : 0.2, mouth: drink > 0.3 ? 'parted' : 'closed', open: 0.12 }, armL: yArm, armR: { hand: [-150, -600], pose: 'relaxed' } }));
      const rim = gripPt(yO, 'you', 'L', yArm, 42 * 1, 0);
      // the water seller pouring from his goatskin (mirrored so the spout points at the cup)
      const sO = Object.assign(idle(t, 3), { x: SX, y: SY, s: SS, breath: 0, sway: 0, tilt: -4 });
      const gA = tip(t), gs = 0.62, gc = [SX - 70, 1060 + (1 - ss(0.85, 1.2, t)) * 0];
      const bagPt = (lx, ly) => { const a = -gA * D2R, x = lx * gs, y = ly * gs, p = [gc[0] + x * Math.cos(a) - y * Math.sin(a), gc[1] + x * Math.sin(a) + y * Math.cos(a)]; return [2 * gc[0] - p[0], p[1]]; };
      const spout = bagPt(170, -84), neck = bagPt(132, -58);
      const bag = `<g transform="translate(${f(2 * gc[0])},0) scale(-1,1)">${PR.goatskin(gc[0], gc[1], gs, -gA).svg}</g>`;
      const sArmR = gripAt(sO, 'seller', neck, [0.25, 1]);
      const sArmL = { hand: R.toLocal(sO, [gc[0] + 40, gc[1] + 60]), pose: 'open', facing: 'palm', dir: [-0.3, -1] };
      const seller = Q.seller(Object.assign(sO, { face: { look: [-0.7, 0.5], mouth: 'smile', lid: 0.3 }, armR: sArmR, armL: sArmL }));
      const pouring = t < 0.95;
      const stream = pouring ? PR.stream(spout, [rim[0], rim[1] - 4], 9, t) : (t < 1.1 ? `<circle cx="${f(spout[0])}" cy="${f(spout[1] + (t - 0.95) * 600)}" r="5" fill="#b8d4d8"/>` : '');
      // market life
      const walkers = [[1500, -600, 0, 3.15, 'basketWoman', 0.6], [-700, 1500, 0, 3.15, 'kid', 0.75]].map(([x0, x1, t0, t1, who, s]) => {
        const x = lerp(x0, x1, (t - t0) / (t1 - t0)), o = Object.assign(idle(t, x0 % 7), { x, y: 1560 + sbob(t, who === 'kid' ? 2.2 : 1.1) * 8, s, face: { look: [x1 > x0 ? 0.6 : -0.6, 0.2] } });
        if (who === 'basketWoman') o.props = `<ellipse cx="0" cy="-1420" rx="120" ry="50" fill="#a07a40" stroke="#1f140c" stroke-width="2"/><circle cx="-40" cy="-1460" r="26" fill="#d8a020"/><circle cx="20" cy="-1470" r="24" fill="#c83020"/>`;
        if (who === 'basketWoman') { o.armR = { hand: [-60, -1380], pose: 'open', facing: 'palm' }; }
        return lit(Q[who](o), L);
      }).join('');
      const merchant = lit(Q.merchant(Object.assign(idle(t, 5), { x: -260, y: 1560, s: 0.6, face: { mouth: 'talk', open: Q.talk(t, 0.25, 7), look: [0.6, 0.1] }, armR: { hand: [-200, -1000 + wave(t, 1.3) * 40], pose: 'open', facing: 'palm' } })), L);
      const layers = [...set.slice(0, 3), { p: 0.88, svg: blur(walkers + merchant, 'dof1') }, ...set.slice(3, 4), { p: 1, svg: lit(seller, L) + bag + lit(you, L) + stream + armsOver(seller, L, 'RL'), chars: true }, set[4], { p: 1.32, svg: blur(S.hangingCloth(t, -260, -520), 'dof3') }];
      return X.compose(layers, c);
    }, { grade: 'gDay' });
    G.W1_RIM = () => { const c = cam(2.8); return [432, 875, c[2]]; };
  }

  // ======================================================= W2  the micro world: a predator in the water (2.45 - 6.05)
  {
    const cam = TK([[2.45, [540, 960, 0.85, 0]], [4.0, [545, 955, 1.05, 4], 'sine'], [4.9, [540, 940, 1.7, -3], 'io'], [6.05, [540, 1000, 2.4, 8], 'in2']]);
    const gulp = t => EZ.in2(clamp((t - 5.0) / 0.9));
    X.shot('W2', 2.45, 5.85, t => {
      const c = hh(cam(t), t, 0.4, 2);
      const set = S.micro(t);
      const sink = gulp(t) * 1600;
      let bugs = '';
      for (const [x, y, s, a, sp] of [[180, 620, 0.9, -30, 1], [860, 1320, 1.1, 150, 0.7], [300, 1500, 0.7, 40, 1.3], [880, 520, 0.8, -140, 0.9]]) bugs += PR.copepod(x + Math.sin(t * sp) * 60, y + Math.cos(t * sp * 0.8) * 50 + sink * 0.8, s, a + Math.sin(t * 2 * sp) * 10, t + x, {});
      const wr = 1 + ss(4.75, 4.95, t) * 2;
      const hero = PR.copepod(540 + Math.sin(t * 0.7) * 20, 960 + Math.cos(t * 0.6) * 16 + sink, 2.2, 8 + Math.sin(t * 1.3) * 6, t * wr, { larva: true });
      const glow = ss(3.9, 4.6, t) + bump(t, 4.8, 0.8, 0.5);
      let g = X.compose([...set, { p: 1, svg: bugs + C.radial(540, 975 + sink, 220, '#f4ffe0', 0.5 * glow, 'screen') + hero }], c);
      // swallowed: a dark red throat closes in around the frame
      const th = gulp(t);
      if (th > 0) g += `<rect width="1080" height="1920" fill="#2a0408" opacity="${f(th * 0.6)}" style="mix-blend-mode:multiply"/>` + C.vignette(0.9 * th, '#1a0204', lerp(0.6, 0.1, th));
      g += C.vignette(0.55, '#020806', 0.5) + `<circle cx="540" cy="960" r="1150" fill="none" stroke="#020403" stroke-width="420" opacity="0.65" filter="url(#b14)"/>`;
      return g;
    }, { grade: 'gNight' });
  }
  X.tr('lens', 2.8, 0.7, 'W1', 'W2', { fa: [432 + 20, 875 - 10], fb: [540, 960], za: 1.5 });

  // ======================================================= W3a  twelve months fly by: a time-lapse of his ordinary life (5.25 - 8.20)
  // the camera cranes down out of the racing sky, swings past him (eating at the door, proud by the ripening field), then dives into his belly
  {
    const YS = 0.62;
    // two places far enough apart that, mid-pan, neither is in frame (the time jump happens off-screen)
    const SPOT = [[300, 1650], [1400, 1665]], JUMP = 6.72;
    const day = t => 0.56 + 0.44 * Math.cos(TAU * (t - 5.25) / 1.2), sunA = t => (((t - 5.25) / 1.2 + 0.5) % 1 + 1) % 1;
    const belly = [SPOT[1][0] - 14, SPOT[1][1] - 1000 * YS];
    const cam = TK([[5.25, [560, 430, 0.95, 5]], [6.05, [370, 1170, 1.22, -2], 'io'], [6.4, [390, 1175, 1.25, -1], 'sine'], [7.05, [1330, 1185, 1.3, 2], 'io'], [7.55, [1392, 1200, 1.5, 0], 'sine'], [8.2, [belly[0], belly[1], 3.6, 0], 'in2']]);
    const mouthOf = o => [o.x + 6 * YS / 0.66, o.y - 1308 * YS + 96 * YS];
    // one of his three moments; k = which, a = opacity (time-lapse dissolve)
    const him = (t, k) => {
      const [x, y] = SPOT[k];
      const yO = Object.assign(idle(t, 1 + k), { x, y, s: YS });
      if (k === 0) {
        // eating flatbread at his door
        const mouth = mouthOf(yO), chew = Math.sin(t * 16) * 0.5 + 0.5;
        const thumb = nrm([0.5, -0.86]), dir = fingersFor('R', 'back', thumb);
        const armR = gripAt(yO, 'you', [mouth[0] - 46, mouth[1] + 62], dir, { hold: PR.bread() });
        return Q.you(Object.assign(yO, { face: { expr: 'neutral', look: [0.3, 0.2], mouth: 'parted', open: 0.06 + chew * 0.08, lid: 0.3 }, armR, armL: { hand: [150, -620], pose: 'relaxed' } }));
      }
      // proud by the ripened field, fists on his hips; then his right hand slides to his belly: "you feel nothing"
      const m = EZ.io(clamp((t - 7.12) / 0.34)), d = nrm(L2([0.15, 1], [1, 0.12], m));
      const armR = { hand: L2([-150, -800], [-40, -905], m), pose: m < 0.5 ? 'fist' : 'open', facing: 'back', dir: d };
      return Q.you(Object.assign(yO, { face: { expr: 'neutral', mouth: 'smile', look: L2([-0.75, 0.05], [0, 0.15], m), lid: 0.26 }, armR, armL: { hand: [150, -800], pose: 'fist', facing: 'back' } }));
    };
    // time-lapse passers-by, smeared sideways
    const ghosts = [['wife', 5.35, 6.05, -500, 1600, 1600, 0.6], ['kid', 6.3, 6.85, 1650, -500, 1700, 0.5], ['merchant', 6.95, 7.6, -500, 1600, 1610, 0.58], ['basketWoman', 7.3, 7.95, 1650, -400, 1640, 0.56]];
    X.shot('W3a', 5.25, 8.2, t => {
      const c = hh(cam(t), t, 0.35, 3);
      const dv = day(t);
      const set = S.courtyard(t, { day: dv, sunA: sunA(t), season: ss(5.3, 7.7, t), lamp: true, moon: sunA(t) });
      let g = `<defs><filter id="tlBlur" x="-40%" y="-5%" width="180%" height="110%"><feGaussianBlur stdDeviation="30 0"/></filter></defs>`;
      for (const [who, t0, t1, x0, x1, y, s] of ghosts) {
        if (t < t0 || t > t1) continue;
        const u = (t - t0) / (t1 - t0), o = Object.assign(idle(t, 9), { x: lerp(x0, x1, u), y: y + sbob(t, 2.4) * 8, s, face: { look: [x1 > x0 ? 0.7 : -0.7, 0.1] } });
        if (who === 'basketWoman') o.armR = { hand: [-60, -1380], pose: 'open', facing: 'palm' };
        g += `<g filter="url(#tlBlur)" opacity="${f(0.5 * Math.sin(Math.PI * u))}">${Q[who](o).svg}</g>`;
      }
      // at the door, then (after the off-screen time jump) out by the field
      const me = lit(him(t, t < JUMP ? 0 : 1), L5.dayY);
      // people go in front of the ground but under the set's day/night overlay (its last layer), so night darkens them too
      const layers = [...set.slice(0, -1), { p: 1, svg: g + me, chars: true }, set[set.length - 1]];
      return X.compose(layers, c) + C.vignette(0.45, '#0a0604', 0.5);
    }, { grade: 'gDusk' });
    G.W3A_BELLY = () => scr(belly, cam(7.95));
  }
  X.tr('iris', 5.55, 0.6, 'W2', 'W3a', { fa: [540, 980], k: 5 });

  // ======================================================= W3b  inside his body: the worm grows in the gut, then eats its way down the leg (7.70 - 13.40)
  {
    const RT = S.FLESH_ROUTE, RL = S.routeLen(RT), WIN = 0.4;
    const uH = t => t < 10.75 ? lerp(0.03, WIN, EZ.io(clamp((t - 7.7) / 3.05))) : lerp(WIN, 0.996, EZ.io(clamp((t - 10.75) / 2.0)));
    const head = t => S.routeAt(RT, RL, uH(t));
    const kf = TK([[7.7, [430, 330, 1.7, -8]], [8.8, [520, 470, 1.3, -3], 'sine'], [10.0, [560, 700, 0.98, 3], 'sine'], [10.75, [600, 960, 1.02, 0], 'sine']]);
    const cam = t => {
      const a = kf(t), h = head(t), k = ss(10.55, 11.2, t), z = lerp(1.12, 2.1, ss(12.5, 13.4, t));
      const b = [lerp(560, h[0], 0.45), h[1] - 70 * (1 - ss(12.4, 13.0, t)), z, Math.sin(t * 0.9) * 2];
      return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k), lerp(a[3], b[3], k)];
    };
    // the worm: a sliding window of the route, gently undulating
    const wormPts = (t, u0, u1, w) => {
      const pts = S.routeSlice(RT, RL, u0, u1);
      return pts.map((p, i) => {
        const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], n = nrm([-(b[1] - a[1]), b[0] - a[0]]), k = Math.sin(t * 3.2 - i * 0.35) * w * 0.35 * Math.min(1, i / 6);
        return [p[0] + n[0] * k, p[1] + n[1] * k];
      });
    };
    X.shot('W3b', 7.7, 13.4, t => {
      const c = hh(cam(t), t, 0.3, 4);
      const u1 = uH(t), u0 = Math.max(0, u1 - WIN), w = lerp(12, 30, ss(7.75, 10.4, t));
      const set = S.flesh(t, {});
      const h = head(t);
      const worm = PR.worm(wormPts(t, u0, u1, w), w, { head: true, shadow: 1 }) + C.radial(h[0], h[1], 220, '#ffb49a', 0.16, 'screen');
      const layers = [...set, { p: 1, svg: worm }, S.fleshSkin(t, { press: ss(12.55, 13.05, t), heat: ss(12.75, 13.4, t), at: 560 }), S.fleshNear(t), S.fleshDust(t)];
      return X.compose(layers, c) + C.radial(300, 300, 1400, '#ff9070', 0.12, 'screen') + C.vignette(0.65, '#0a0204', 0.42);
    });
    G.W3B_HEAD = tt => scr(head(tt), cam(tt));
  }
  X.tr('zmatch', 7.95, 0.5, 'W3a', 'W3b', { fa: G.W3A_BELLY(), fb: G.W3B_HEAD(7.95), za: 3.2, zb: 2.4, leak: '#ff7050', leakOp: 0.35 });

  // ======================================================= W4  the burning morning, the blister (12.80 - 19.40)
  {
    // lying on the mat: head at the left, body under a blanket, the lower leg (close-up art) sticking out at the right
    const PX = 1290, PY = 1520, PS = 0.8, ANK = [1480, 1476], LS = 0.8;
    const cam = TK([[12.8, [330, 1450, 2.6, -18]], [13.9, [345, 1455, 2.7, -16], 'sine'], [14.35, [360, 1450, 2.75, -14]], [15.3, [1450, 1400, 1.7, -4], 'io'], [16.6, [1470, 1440, 2.1, 0], 'sine'], [19.4, [1478, 1452, 3.4, 0], 'in2']]);
    X.shot('W4', 12.8, 19.4, t => {
      const c = hh(cam(t), t, 0.35, 4);
      const L = L5.dawn;
      const set = S.room(t);
      const wake = ss(13.5, 13.75, t), pain = ss(14.0, 14.2, t);
      const jerk = bump(t, 14.0, 1, 0.3) + bump(t, 15.6, 0.6, 0.3) + bump(t, 16.4, 0.5, 0.3);
      const yO = Object.assign(idle(t, 1, 0.2), { x: PX, y: PY, s: PS, sway: -90 + jerk * 3, breath: 0, tilt: -6 - pain * 6 });
      const lid = wake < 1 ? lerp(1, 0.25, wake) : 0.25;
      // his own legs stay hidden under the blanket; the lower leg comes out from under its edge
      const you = Q.you(Object.assign(yO, { noLegs: true, face: pain > 0.3 ? { expr: 'grief', mouth: 'snarl', lid: 0.75 + Math.sin(t * 20) * 0.05, brows: [-12, 4] } : { expr: 'tired', lid, look: [0, -0.3] }, armR: { hand: [-120, -760], pose: 'relaxed' }, armL: { hand: [120, -760], pose: 'relaxed' } }));
      // blanket covering him from the shoulders to the knee
      const blanket = `<path d="M${PX - 1150 * PS + 40},${PY - 110} C${PX - 600},${PY - 190} ${ANK[0] - 520},${PY - 150} ${ANK[0] - 420},${PY - 90} C${ANK[0] - 390},${PY - 20} ${ANK[0] - 420},${PY + 70} ${ANK[0] - 520},${PY + 100} L${PX - 1150 * PS + 30},${PY + 110}Z" fill="#7a3a2a" stroke="#1f140c" stroke-width="2.5" filter="url(#cloth)"/>` +
        [0.2, 0.4, 0.6, 0.8].map(k => `<path d="M${f(lerp(PX - 900, ANK[0] - 450, k))},${PY - 150} q20,120 0,240" stroke="#3a140c" stroke-width="10" opacity="0.4" fill="none" filter="url(#b4)"/>`).join('') + `<path d="M${PX - 920},${PY - 100} L${ANK[0] - 470},${PY - 80}" stroke="#d8a040" stroke-width="6" opacity="0.5"/>`;
      // the ankle burns: heat pulses, a ghostly red-hot iron presses, then the blister rises
      const heat = ss(14.1, 15.0, t) * (0.75 + 0.25 * Math.sin(t * 9)), blister = ss(17.0, 18.9, t), iron = env(t, 15.1, 15.4, 16.3, 16.7);
      const leg = `<g transform="translate(${ANK[0]},${ANK[1]}) rotate(-90) scale(${LS})">${PR.legClose({ skin: '#9c6a46', heat, blister: blister + Math.sin(t * 14) * 0.02 * blister })}</g>`;
      let fx = '';
      if (iron > 0.01) {
        const ip = [ANK[0] + 20, ANK[1] - 70 - (1 - iron) * 120];
        fx += `<g opacity="${f(iron * 0.85)}"><rect x="${f(ip[0] - 120)}" y="${f(ip[1] - 46)}" width="240" height="46" rx="8" fill="#ff5a1a" filter="url(#b2)"/><rect x="${f(ip[0] - 100)}" y="${f(ip[1] - 40)}" width="200" height="30" rx="6" fill="#ffd060"/><path d="M${f(ip[0])},${f(ip[1] - 46)} L${f(ip[0] + 40)},${f(ip[1] - 420)}" stroke="#3a2a20" stroke-width="22"/></g>` + C.radial(ip[0], ip[1], 260, '#ff6020', 0.7 * iron);
        for (let i = 0; i < 6; i++) { const ph = (t * 1.6 + i / 6) % 1; fx += `<ellipse cx="${f(ip[0] - 80 + i * 32 + Math.sin(t * 3 + i) * 10)}" cy="${f(ip[1] - 60 - ph * 260)}" rx="${f(20 + ph * 40)}" ry="${f(30 + ph * 50)}" fill="#e8e4e0" opacity="${f(0.35 * iron * Math.sin(Math.PI * ph))}" filter="url(#b8)"/>`; }
      }
      if (blister > 0.1) for (let i = 0; i < 5; i++) { const ph = (t * 1.3 + i * 0.37) % 1; fx += `<circle cx="${f(ANK[0] + 30 + Math.cos(i * 2.2) * 50 * LS)}" cy="${f(ANK[1] - 30 - Math.sin(i * 2.2) * 40 * LS)}" r="${f(4 + ph * 10 * blister)}" fill="none" stroke="#fff4e0" stroke-width="2" opacity="${f((1 - ph) * blister)}"/>`; }
      const youSvg = `<g filter="url(#skinS)">${you.svg}</g>`;
      const layers = [...set, { p: 1, svg: youSvg + leg + blanket + fx, chars: true }];
      return X.compose(layers, c) + C.vignette(0.5, '#0a0404', 0.45) + `<rect width="1080" height="1920" fill="#ff2a10" opacity="${f(0.12 * heat * (0.6 + 0.4 * Math.sin(t * 9)))}" style="mix-blend-mode:overlay"/>`;
    }, { grade: 'gDusk' });
  }
  X.tr('eyelid', 13.1, 0.6, 'W3b', 'W4', {});
})(window);
