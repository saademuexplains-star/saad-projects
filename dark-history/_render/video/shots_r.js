// "The Pied Piper" part 1: a stranger walks out of the sunlit town gate playing a pipe -> the children in the square
// freeze, turn and follow -> you knead bread in your kitchen and look up -> from your window you watch your son pass in
// the dancing line, smiling, and you scream his name -> outside the walls the line climbs the road; you run after it ->
// a hundred and thirty children dance up the hill behind the music.
// Rules kept: the camera moves on every line, the procession always travels to screen left, feet that would slide are
// hidden (mist, the grassy bank, the frame edge), hands are rigid on what they hold, no cut is felt.
(function (G) {
  const X = G.ENG, Q = G.QCAST, S = G.SETS, PR = G.PROPS, C = G.CINE, R = G.RIG;
  const { track: TK, ss, clamp, lerp, EZ } = X;
  const { f, mix, rng, shade } = R;
  const TAU = Math.PI * 2, D2R = Math.PI / 180;
  // ---- helper header
  const env = (t, a, b, c, d) => ss(a, b, t) * (1 - ss(c, d, t));
  const idle = (t, seed, amp = 1) => ({ blink: Q.blink(t, seed), breath: Q.breath(t * 1.1 + seed) * 0.6, sway: X.noise(t * 0.45, seed) * 0.5 * amp });
  const hh = (c, t, amp = 1, seed = 0) => { const h = X.hand(t, amp, seed); return (X.CAM = [c[0] + h[0], c[1] + h[1], c[2], (c[3] || 0) + h[2]]); };
  const scr = (w, c, p = 1) => { const [cx, cy, z] = c, zp = Math.pow(z, p), px = 540 + (cx - 540) * p, py = 960 + (cy - 960) * p; return [540 + (w[0] - px) * zp, 960 + (w[1] - py) * zp]; };
  const nrm = v => { const n = Math.hypot(v[0], v[1]) || 1; return [v[0] / n, v[1] / n]; };
  const L2 = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
  const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k];
  const HAND = Q.HAND;
  const gripAt = (o, who, Gw, dW, extra = {}) => { const dl = nrm(R.dirLocal(o, dW)), gl = R.toLocal(o, Gw), gy = 0.33 * (typeof who === 'number' ? who : HAND[who]); return Object.assign({ hand: [gl[0] - dl[0] * gy, gl[1] - dl[1] * gy], dir: dl, pose: 'grip', facing: 'back' }, extra); };
  const fingersFor = (side, facing, thumb) => { const t = (side === 'R' ? -1 : 1) * (facing === 'palm' ? 1 : -1); return [-thumb[1] * t, thumb[0] * t]; };
  const handAt = (o, Ww, dW, extra = {}) => Object.assign({ hand: R.toLocal(o, Ww), dir: nrm(R.dirLocal(o, dW)), pose: 'relaxed', facing: 'back' }, extra);
  // the depth of the layer the characters being drawn sit on: their light is clipped to that layer's view, so a figure on
  // a p 0.8 layer must be drawn inside atP(0.8, ...) or the close-ups lose his head
  let VP = 1;
  const atP = (p, fn) => { const o = VP; VP = p; try { return fn(); } finally { VP = o; } };
  const handsLit = (p, L, which = 'RL') => C.lit({ svg: (which.includes('R') ? p.handR || '' : '') + (which.includes('L') ? p.handL || '' : ''), info: p.info }, Object.assign({ view: X.viewRect(VP) }, L)).body;
  const CAM = (pk, zk) => { const P = TK(pk), Z = TK(zk); return t => { const p = P(t); return [p[0], p[1], Z(t), p[2]]; }; };
  // a camera that puts the world point (x, y) of layer p at the screen centre
  const camOn = (x, y, p = 1) => [540 + (x - 540) / p, 960 + (y - 960) / p];
  const lit = (P, L) => X.lit(P, L, VP);
  const mixArm = (a, b, k) => Object.assign({}, k < 0.5 ? a : b, { hand: L2(a.hand, b.hand, k), dir: nrm(L2(a.dir || [0, 1], b.dir || [0, 1], k)) });
  const dith = t => { const r = rng(Math.round(t * 60) * 7 + 5); return `<rect x="${-Math.floor(r() * 300)}" y="${-Math.floor(r() * 300)}" width="1380" height="2220" filter="url(#grain)" opacity="0.045"/>`; };
  // a screen-space depth-of-field blur (user-space region, so it never drops out on big layers)
  let bid = 0;
  const sBlur = (svg, sd) => { const id = 'sbr' + (bid++ % 997); return `<defs><filter id="${id}" filterUnits="userSpaceOnUse" x="-120" y="-120" width="1320" height="2160"><feGaussianBlur stdDeviation="${f(sd)}" edgeMode="duplicate"/></filter></defs><g filter="url(#${id})">${svg}</g>`; };
  const litBody = (P, L) => C.lit(P, Object.assign({ view: X.viewRect(VP) }, L)).body;
  const armsOver = (P, L, which = 'RL') => C.lit({ svg: (which.includes('R') ? P.armRsvg : '') + (which.includes('L') ? P.armLsvg : ''), info: P.info }, Object.assign({ view: X.viewRect(VP) }, L)).body;
  const drawP = (P, o, art, L) => Q.withArt(P, o, art, lit(P, L));
  const bodyP = (P, o, art, L) => Q.withArt(P, o, art, litBody(P, L));
  // insert characters into a set's layer list before the layer with the given tag (or before light / foreground)
  const insertAt = (set, chars, tag, p = 1) => { let i = tag ? set.findIndex(L => L.tag === tag) : -1; if (i < 0) i = set.findIndex(L => L.light || L.p > 1.05); const c = { p, svg: chars, chars: true }; return i < 0 ? [...set, c] : [...set.slice(0, i), c, ...set.slice(i)]; };
  // the Piper playing: the pipe from his lips down and out to his left, both fists on it (drawn: body, pipe, hands)
  const piperPlaying = (o, t, L, art, extra = {}) => {
    const s = o.s, d = nrm([0.36, 1]), M = R.toWorld(o, [4, -1196]), k = 1.36 * s, Lp = PR.PIPE_L * k;
    const g1 = add(M, d, Lp * 0.36), g2 = add(M, d, Lp * 0.66), up = [-d[0], -d[1]];
    const oo = Object.assign({}, o, { armR: gripAt(o, 'piper', g1, fingersFor('R', 'back', up), { detachHand: true }), armL: gripAt(o, 'piper', g2, fingersFor('L', 'back', up), { detachHand: true }) }, extra);
    const P = Q.piper(oo), rot = Math.atan2(-d[0], d[1]) / D2R;
    const pipe = `<g transform="translate(${f(M[0])},${f(M[1])}) rotate(${f(rot)})">${PR.pipe(k, t)}</g>`;
    return { P, o: oo, svg: Q.withArt(P, oo, art, lit(P, L)) + pipe + handsLit(P, L), mouth: M };
  };
  const LT = {
    // dawn behind him through the gate: a cool front, a hot rim
    dawn: { from: [0.15, -0.9], shadow: '#0e0a14', shadowOp: 0.3, floor: '#140c10', floorOp: 0.2, contactOp: 0.35, key: '#c8d0e8', keyAdd: 0.03, rims: [{ from: [0, -1], col: '#ffe0a8', w: 10, op: 0.85 }, { from: [1, -0.3], col: '#ffc890', w: 7, op: 0.6 }, { from: [-1, -0.3], col: '#ffc890', w: 7, op: 0.6 }], face: { col: '#ffd8b0', op: 0.08 } },
    // the summer morning in the square: sun from the upper left
    day: { from: [-0.75, -0.6], shadow: '#1a140c', shadowOp: 0.36, floor: '#22180e', floorOp: 0.26, contactOp: 0.36, key: '#fff4e0', keyAdd: 0.05, rims: [{ from: [-1, -0.3], col: '#fff0d0', w: 7, op: 0.5 }, { from: [1, -0.2], col: '#c8d4e8', w: 4, op: 0.3 }], face: { col: '#fff0e0', op: 0.12 } },
    // the kitchen: the hearth at the right, the window at the left
    hearth: { from: [0.8, -0.3], shadow: '#100804', shadowOp: 0.45, floor: '#180c06', floorOp: 0.3, contactOp: 0.4, key: '#ffc890', keyAdd: 0.07, rims: [{ from: [1, -0.2], col: '#ff9a50', w: 8, op: 0.6 }, { from: [-1, -0.4], col: '#e8f0ff', w: 6, op: 0.45 }], face: { col: '#ffd0a0', op: 0.15 } }
  };
  G.SHOTS_R = { env, idle, hh, scr, nrm, L2, add, gripAt, fingersFor, handAt, handsLit, CAM, camOn, mixArm, dith, sBlur, litBody, armsOver, drawP, bodyP, insertAt, piperPlaying, atP, LT };

  // ======================================================= GATE: the stranger walks out of the sunlit arch (-0.7 - 6.5)
  // "On a summer morning, a stranger in a coat of many colours walks into your town playing a strange tune on a pipe,"
  const GATE_Y = TK([[-0.7, 1336], [4.3, 2470, 'lin'], [5.2, 2600, 'out']]);
  const gateS = y => 0.000385 * (y - S.HG.VPY);
  {
    const P8 = S.HG.P;
    const tgt = (x, y) => camOn(x, y, P8);
    const cam = CAM([[-0.7, [...tgt(540, 1132), 0]], [1.0, [...tgt(540, 1196), 0], 'sine'], [3.2, [...tgt(540, 1945), 0.2], 'io'], [5.0, [...tgt(542, 2040), 0.3], 'io'], [6.6, [...tgt(548, 1968), 0.4], 'sine']],
      [[-0.7, 0.9], [1.0, 1.0, 'sine'], [3.2, 1.9, 'io'], [5.0, 3.4, 'io'], [6.6, 4.6, 'sine']]);
    // he walks with a lazy sway and a little bounce on the street's own layer (right after it, before the light and
    // the mist); his pale eyes come up to us at the end
    const fn2 = t => {
      const c = hh(cam(t), t, 0.25 * ss(0.2, 1.4, t), 3);
      // as the camera closes on him the street behind goes soft and the glare through the arch eases off his face
      const close = ss(1.7, 3.4, c[2]);
      const set = S.hgate(t, { lightK: 1 - 0.7 * close }), y = GATE_Y(t), s = gateS(y), walk = 1 - ss(4.9, 5.3, t), step = t * 4.2;
      const look = t < 5.4 ? [0.05, 0.05] : [0, -0.02];
      const o = { x: 540 + 8 * Math.sin(step * 0.5) * walk, y: y - 6 * Math.sin(step) ** 2 * walk * s / 0.4, s, sway: 1.6 * Math.sin(step * 0.5) * walk, breath: 0.4 * Math.sin(t * 2), blink: Q.blink(t, 9), tilt: 3 * Math.sin(t * 2.2), face: { mouth: 'closed', lid: t < 5.6 ? 0.36 : 0.3, look, brows: [3, -2] } };
      const pp = atP(P8, () => piperPlaying(o, t, LT.dawn, Q.piperArt(0.3 * Math.sin(t * 1.4))));
      const i = set.findIndex(L => L.p === P8 && !L.light && !L.tag) + 1;
      const back = X.compose(set.slice(0, i), c), front = X.compose([{ p: P8, svg: pp.svg, chars: true }, ...set.slice(i)], c);
      return (close > 0.01 ? sBlur(back, 9 * close) : back) + front + C.vignette(0.55) + dith(t);
    };
    X.shot('GATE', -0.7, 6.5, fn2, { grade: 'gDusk' });
    G.GATE_CAM = cam;
    G.GATE_PIPER = tt => { const y = GATE_Y(tt), s = gateS(y); return scr([540, y - 760 * s], cam(tt), P8); };
    G.GATE_FACE = tt => { const y = GATE_Y(tt), s = gateS(y); return scr([540, y - 1290 * s], cam(tt), P8); };
  }

  // ======================================================= KIDS: the children in the square stop, turn, follow (5.9 - 10.11)
  // "and every child who hears it stops what they're doing and starts to follow him."
  {
    const B = S.HS;
    // [kid, x, y, scale]: spread in depth, far ones by the well, near ones big at the edges of the frame
    const KID = [[6, 1690, 1750, 0.68], [2, 640, 1760, 0.72], [3, 380, 1800, 0.78], [7, 1000, 1850, 0.86], [0, 1400, 1975, 1.0], [1, 210, 2030, 1.08]];
    const cam = CAM([[5.9, [940, 1500, 0]], [7.6, [860, 1520, 0.3], 'sine'], [10.2, [560, 1480, -0.4], 'io']], [[5.9, 0.82], [7.6, 0.88, 'sine'], [10.2, 0.95, 'io']]);
    const stop = t => ss(6.55, 6.85, t), go = t => EZ.in2(ss(8.1, 10.2, t));
    // the ball: tossed from the far girl's raised hand toward the boy's, who never catches it; it drops and bounces away
    const ballAt = t => {
      if (t < 6.55) { const u = clamp((t - 5.9) / 0.65); return [lerp(575, 923, u), lerp(1256, 1248, u) - 220 * Math.sin(Math.PI * u)]; }
      const td = t - 6.55, Gv = 9000, yg = 1856, H0 = yg - 1248, t1 = Math.sqrt(2 * H0 / Gv), v1 = Math.sqrt(2 * Gv * H0) * 0.45, t2 = 2 * v1 / Gv, v2 = v1 * 0.4, t3 = 2 * v2 / Gv;
      let h = 0;
      if (td < t1) h = H0 - 0.5 * Gv * td * td; else if (td < t1 + t2) { const s2 = td - t1; h = v1 * s2 - 0.5 * Gv * s2 * s2; } else if (td < t1 + t2 + t3) { const s3 = td - t1 - t2; h = v2 * s3 - 0.5 * Gv * s3 * s3; }
      return [923 + 280 * (1 - Math.exp(-td * 1.3)), yg - Math.max(0, h)];
    };
    const fn = t => {
      const c = hh(cam(t), t, 0.28, 11), L = LT.day;
      const set = S.hstreet(t);
      // everything in the square, drawn far to near
      const items = [];
      // the hoop rolls on beside the near boy and falls; the hens peck on
      const hx = 330 + 270 * ss(5.9, 7.6, t) + 30 * EZ.out(ss(7.6, 8.2, t)), fall = EZ.in2(ss(7.3, 7.9, t));
      items.push([2034, `<g transform="rotate(${f(-80 * fall)} ${f(hx)} 2034)">${PR.hoop(hx, 2034, 1.05, t * 6 * (1 - ss(7.3, 7.9, t)))}</g>`]);
      { const [bx, by] = ballAt(t); items.push([1857, PR.ball(bx, by, 0.8)]); }
      items.push([1930, PR.hen(1700, 1930, 0.7, t, -1, 0)], [1960, PR.hen(1820, 1960, 0.66, t, 1, 2)]);
      KID.forEach(([k, x0, y0, s], i) => {
        let chars = '';
        const st = stop(t), mv = go(t) * (140 + i * 20) * s / 0.9, bob = Math.sin((t - 8.1) * 7 + i) * 6 * ss(8.1, 8.4, t);
        const o = Object.assign(idle(t, 21 + i * 7, 0.5), { x: x0 - mv, y: y0 - Math.abs(bob) * 0, s, face: { mouth: st > 0.5 ? 'smile' : (i % 2 ? 'grin' : 'smile'), lid: lerp(0.12, 0.52, st), look: st > 0.5 ? [-0.92, -0.08] : [i % 2 ? -0.6 : 0.6, 0.1], brows: [lerp(0, -4, st), 0] }, tilt: lerp(0, -5, st) });
        // what each was doing: the hoop stick, the throw, hugging the doll
        // (the same hand pose and facing on both ends of each blend, so nothing flips)
        if (k === 1) o.armL = mixArm({ hand: [150, -360], dir: [0.6, 0.8], pose: 'fist', facing: 'back' }, { hand: [96, -330], dir: [0.1, 1], pose: 'fist', facing: 'back' }, st);
        if (k === 2 || k === 7) o.armR = mixArm({ hand: [-90, -700], dir: [0.2, -1], pose: 'open', facing: 'palm' }, { hand: [-130, -380], dir: [-0.1, -1], pose: 'open', facing: 'palm' }, EZ.io(st));
        if (k === 0) { o.armR = { hand: [-20, -470], dir: [1, 0.2], pose: 'relaxed', facing: 'back', detachHand: true }; o.armL = { hand: [30, -450], dir: [-1, 0.3], pose: 'relaxed', facing: 'back', detachHand: true }; }
        o.y = y0 - Math.abs(Math.sin((t - 8.1) * 7 + i)) ** 2 * 10 * ss(8.1, 8.5, t);
        const P = Q.kids[k](o);
        chars += drawP(P, o, Q.kidArt[k], L);
        if (k === 0) { const d = R.toWorld(o, [6, -420]); chars += PR.ragDoll(d[0], d[1], 0.9 * s, -6) + handsLit(P, L); }
        if (k === 1) { const hp = R.toWorld(o, o.armL.hand); chars += `<path d="M${f(hp[0])},${f(hp[1])} L${f(hp[0] + 90 * (1 - st) * s)},${f(hp[1] + 120 * s)}" stroke="#7a5a34" stroke-width="${f(7 * s)}" stroke-linecap="round"/>`; }
        items.push([y0, chars]);
      });
      const chars = items.sort((a, b) => a[0] - b[0]).map(it => it[1]).join('');
      return X.compose(insertAt(set, chars, null), c) + C.vignette(0.5) + dith(t);
    };
    X.shot('KIDS', 5.9, 10.11, fn, { grade: 'gDay' });
    G.KIDS_CAM = cam;
  }
  X.tr('sweep', 6.2, 0.6, 'GATE', 'KIDS', { col: '#fff0c8', dir: -1 });

  // ======================================================= MOTHER: you knead bread by the fire and look up (9.51 - 12.36)
  // "You're a mother in a small German town,"
  {
    const B = S.HK2, MO = { x: 540, y: 1900, s: 0.62 };
    // (opens wide enough to see the window light, the herbs on the beam and the hearth fire, then closes on her)
    const cam = CAM([[9.5, [600, 1280, 0]], [11.0, [560, 1220, 0.3], 'sine'], [12.4, [470, 1160, 0.5], 'io']], [[9.5, 0.92], [11.0, 1.15, 'sine'], [12.4, 1.42, 'io']]);
    const fn = t => {
      const c = hh(cam(t), t, 0.28, 13), L = LT.hearth;
      const set = S.hkitchen(t);
      // kneading: both heels of the hands push into the dough and roll back; she stops, listens, looks to the window
      const knead = 1 - ss(10.5, 10.9, t), push = Math.sin(t * 5.2) * 0.5 + 0.5, look = ss(11.2, 11.5, t);
      const dough = [560, 1352];
      const hr = add(dough, [-56 + 14 * push * knead, -8 - 6 * push * knead]), hl = add(dough, [52 + 14 * push * knead, -10 - 6 * push * knead]);
      const o = Object.assign(idle(t, 31, 0.3), MO, { tilt: 6 * knead - 4 * look, face: { expr: look > 0.5 ? 'anxious' : 'neutral', mouth: look > 0.5 ? 'parted' : 'closed', open: 0.05 * look, look: look > 0.5 ? [-0.92, -0.25] : t > 10.6 ? [0.1, -0.3] : [0, 0.8], lid: knead > 0.5 ? 0.42 : 0.16, brows: [-6 * look, 1 * look] } });
      o.armR = handAt(o, hr, [0.5, 0.86], { pose: 'open', facing: 'back' });
      o.armL = handAt(o, hl, [-0.5, 0.86], { pose: 'open', facing: 'back' });
      const P = Q.mother(o);
      // the dough under her hands
      const doughSvg = `<path d="M${dough[0] - 110},${dough[1] + 6} C${dough[0] - 100},${f(dough[1] - 50 - 6 * push * knead)} ${dough[0] + 100},${f(dough[1] - 52 + 6 * push * knead)} ${dough[0] + 110},${dough[1] + 6}Z" fill="#f2e2c4" stroke="#20140c" stroke-width="2"/><path d="M${dough[0] - 60},${dough[1] - 30} q40,-12 90,0" stroke="#d8c4a0" stroke-width="4" fill="none"/>`;
      const back = bodyP(P, o, Q.motherArt, L), front = doughSvg + armsOver(P, L);
      const i = set.findIndex(l => l.tag === 'table');
      const layers = [...set.slice(0, i), { p: 1, svg: back, chars: true }, set[i], { p: 1, svg: front, chars: true }, ...set.slice(i + 1)];
      return X.compose(layers, c) + C.vignette(0.55) + dith(t);
    };
    X.shot('MOTHER', 9.51, 12.36, fn, { grade: 'gFeast' });
  }
  X.tr('wipe', 9.81, 0.6, 'KIDS', 'MOTHER', { dir: -1, truck: 200, obj: (x, u) => `<g filter="url(#dof2)"><path d="M${f(x - 640)},-200 L${f(x + 640)},-200 C${f(x + 600 + 30 * Math.sin(u * 9))},700 ${f(x + 660 - 30 * Math.sin(u * 7))},1500 ${f(x + 620)},2200 L${f(x - 620)},2200 C${f(x - 660 + 30 * Math.sin(u * 8))},1500 ${f(x - 600)},700 ${f(x - 640)},-200Z" fill="#f2ede2"/><path d="M${f(x - 200)},-200 C${f(x - 180)},800 ${f(x - 240)},1400 ${f(x - 210)},2200 M${f(x + 260)},-200 C${f(x + 280)},800 ${f(x + 230)},1400 ${f(x + 250)},2200" stroke="#d8d0c0" stroke-width="40" fill="none"/></g>` });

  // ======================================================= WINDOW: your son walks past, smiling; you scream his name (11.76 - 18.7)
  // "and from your window you watch your own son walk past, smiling, not even turning his head when you scream his name."
  {
    const B = S.HS, [wx, wy, ww, wh] = B.MW, MO = { x: wx + ww / 2, y: 1400, s: 0.56 };
    // the line passing under the window, right to left, close to us: [kid index or 'son', start x, scale]
    const LINE = [[4, 3300, 0.86], [2, 3640, 0.88], ['son', 3980, 0.9], [7, 4330, 0.86], [1, 4660, 0.88], [5, 5000, 0.84], [0, 5330, 0.86], [6, 5640, 0.78]];
    const V = 330, Y0 = 2330;
    // (the last two keys centre her face, which sits on the house front's layer, p 0.86)
    const cam = CAM([[11.7, [2520, 1260, 0]], [13.6, [2460, 1320, -0.3], 'sine'], [15.6, [2330, 1360, -0.5], 'sine'], [17.2, [...camOn(wx + ww / 2, 740, 0.86), 0.3], 'io'], [18.75, [...camOn(wx + ww / 2, 716, 0.86), 0.4], 'sine']],
      [[11.7, 0.92], [13.6, 0.98, 'sine'], [15.6, 1.04, 'sine'], [17.2, 2.0, 'io'], [18.75, 2.3, 'sine']]);
    const fn = t => {
      const c = hh(cam(t), t, 0.3, 17), L = LT.day;
      const set = S.hstreet(t);
      // you at the window: watching, seeing him, calling, screaming
      const see = ss(13.7, 13.9, t), call = env(t, 15.0, 15.2, 16.2, 16.4), scream = ss(16.9, 17.1, t);
      const lookX = lerp(-0.2, -0.55, ss(13.6, 16.0, t));
      // (the scream: the jaw wide open and straining, brows up and drawn together, eyes wide on him, leaning out)
      const o = Object.assign(idle(t, 31, 0.3), MO, { tilt: -4 - 5 * scream, face: { expr: scream > 0.5 ? 'fear' : see > 0.5 ? 'anxious' : 'neutral', wide: see > 0.5, mouth: scream > 0.5 ? 'shout' : call > 0.5 ? 'talk' : 'tight', open: scream > 0.5 ? 0.8 + 0.08 * Math.sin(t * 6.5) : call > 0.5 ? Q.talk(t, 0.32, 8) : 0, look: [lookX, 0.75 - 0.3 * scream], lid: scream > 0.5 ? 0.02 : lerp(0.18, 0.04, see), brows: [-lerp(2, 10, see) - 2 * scream, lerp(0, -3, scream)] } });
      const sillY = wy + wh - 4;
      o.armR = handAt(o, [wx + 40, sillY + 6], [0.2, 1], { pose: 'relaxed', facing: 'back', detachHand: true });
      o.armL = handAt(o, [wx + ww - 40, sillY + 6], [-0.2, 1], { pose: 'relaxed', facing: 'back', detachHand: true });
      const P = Q.mother(o);
      const her = `<defs><clipPath id="mwin"><rect x="${wx}" y="${wy}" width="${ww}" height="${wh}"/></clipPath></defs><g clip-path="url(#mwin)">${atP(0.86, () => bodyP(P, o, Q.motherArt, L))}</g>`;
      // the procession below, heads and shoulders crossing the frame (their feet are below its edge)
      let line = '';
      LINE.forEach(([k, x0, s], i) => {
        const x = x0 - V * (t - 11.7), ph = t * 6.5 + i * 1.3, y = Y0 - Math.sin(ph) ** 2 * 18;
        if (x < 1500 || x > 3600) return;
        const dream = { mouth: 'smile', lid: 0.5, look: [-0.9, -0.05], brows: [-3, 0] };
        const o2 = Object.assign(idle(t, 51 + i * 5, 0.3), { x, y, s, sway: 2.2 * Math.sin(ph * 0.5), tilt: -4 + 3 * Math.sin(ph * 0.5), face: dream, armR: { hand: [-150, -560], dir: [-0.4, -0.9], pose: 'open', facing: 'palm' }, armL: { hand: [120, -330], dir: [0.1, 1], pose: 'relaxed', facing: 'back' } });
        line += k === 'son' ? drawP(Q.son(o2), o2, Q.sonArt, L) : drawP(Q.kids[k](o2), o2, Q.kidArt[k], L);
      });
      const iS = set.findIndex(l => l.tag === 'sill');
      const layers = [...set.slice(0, iS), { p: 0.86, svg: her, chars: true }, set[iS], { p: 0.86, svg: atP(0.86, () => handsLit(P, L)), chars: true }, ...set.slice(iS + 1)];
      return X.compose(insertAt(layers, line, null), c) + C.vignette(0.52) + dith(t);
    };
    X.shot('WINDOW', 11.76, 18.7, fn, { grade: 'gDay' });
    G.WINDOW_FACE = tt => scr([wx + ww / 2, wy + 120], cam(tt), 0.86);
  }
  X.tr('carry', 12.06, 0.6, 'MOTHER', 'WINDOW', { mode: 'pan', dir: [-1, 0], dist: 0.42, blur: 12 });

  // ======================================================= OUTGATE: outside the walls the line climbs the road; you run out after
  // it (18.1 - 22.78)
  // "You run after them, but they're already through the town gate and climbing toward the hills,"
  {
    const B = S.HO2, P8 = 0.8;
    // the road as a polyline (layer p 0.8) from the gate (u 0) to the hills (u 1)
    const RD = [[1500, 1520], [1100, 1490], [700, 1420], [300, 1300], [-100, 1150], [-400, 1010], [-800, 860], [-1200, 790], [-1700, 750], [-2200, 700]];
    const RL = [0]; for (let i = 1; i < RD.length; i++) RL.push(RL[i - 1] + Math.hypot(RD[i][0] - RD[i - 1][0], RD[i][1] - RD[i - 1][1]));
    const at = u => { const d = clamp(u) * RL[RL.length - 1]; let i = 1; while (i < RL.length - 1 && RL[i] < d) i++; const k = (d - RL[i - 1]) / (RL[i] - RL[i - 1]); return [lerp(RD[i - 1][0], RD[i][0], k), lerp(RD[i - 1][1], RD[i][1], k)]; };
    const sAt = u => 0.36 - 0.2 * u;
    const KIDS = [1, 4, 7, 2, 'son', 5, 0, 6, 3, 1, 7, 4];
    const cam = CAM([[18.1, [...camOn(1150, 1260, P8), 0]], [19.6, [...camOn(900, 1220, P8), -0.3], 'sine'], [22.8, [...camOn(-150, 1000, P8), -0.6], 'io']], [[18.1, 0.95], [19.6, 0.92, 'sine'], [22.8, 0.78, 'io']]);
    const fn = t => {
      const c = hh(cam(t), t, 0.3, 19), L = LT.day;
      const set = S.houtside(t);
      let g = '';
      // the line (far to near order so nearer walkers overlap farther ones), the Piper leading near the top
      const ul = u => u;
      const items = [];
      items.push({ u: 0.7 + 0.022 * (t - 18.1), piper: true });
      KIDS.forEach((k, i) => items.push({ u: 0.62 - i * 0.045 + 0.022 * (t - 18.1), k, i }));
      // you burst out of the gate and run after them
      const run = ss(18.45, 18.7, t);
      if (run > 0) items.push({ u: -0.02 + 0.05 * EZ.out(ss(18.45, 19.2, t)) + 0.045 * (t - 19.2) * ss(19.2, 19.3, t), mom: true });
      atP(P8, () => items.sort((a, b) => b.u - a.u).forEach(it => {
        if (it.u < -0.02 || it.u > 1) return;
        const p = at(Math.max(0, it.u)), s = sAt(it.u);
        if (it.piper) {
          const o = { x: p[0], y: p[1] + 4, s: s * 1.05, breath: 0, blink: Q.blink(t, 9), sway: 1.2 * Math.sin(t * 2.2), face: { mouth: 'closed', lid: 0.36, look: [-0.6, 0] } };
          g += piperPlaying(o, t, L, Q.piperArt(0.3 * Math.sin(t * 1.4))).svg;
        } else if (it.mom) {
          const ph = t * 9;
          const o = Object.assign(idle(t, 31, 0.3), { x: p[0], y: p[1] + 4 - Math.sin(ph) ** 2 * 10, s: s * 1.08, sway: -4 + 2 * Math.sin(ph), face: { expr: 'fear', mouth: 'cry', open: 0.3, look: [-0.9, -0.2], lid: 0.05, brows: [-10, -2] }, armR: { hand: [-210, -1050], dir: [-0.6, -0.8], pose: 'open', facing: 'palm' }, armL: { hand: [130, -820], dir: [0.3, 1], pose: 'relaxed', facing: 'back' } });
          g += drawP(Q.mother(o), o, Q.motherArt, L);
        } else {
          const ph = t * 6.5 + it.i * 1.7, o = Object.assign(idle(t, 61 + it.i * 3, 0.3), { x: p[0], y: p[1] + 4 - Math.sin(ph) ** 2 * 14 * s, s, sway: 3 * Math.sin(ph * 0.5), tilt: -4, face: { mouth: 'smile', lid: 0.5, look: [-0.9, 0] }, armR: { hand: [-150, -560], dir: [-0.4, -0.9], pose: 'open', facing: 'palm' } });
          g += it.k === 'son' ? drawP(Q.son(o), o, Q.sonArt, L) : drawP(Q.kids[it.k](o), o, Q.kidArt[it.k], L);
        }
      }));
      return X.compose(insertAt(set, g, 'bank', P8), c) + C.vignette(0.5) + dith(t);
    };
    X.shot('OUTGATE', 18.1, 22.78, fn, { grade: 'gDay' });
    G.OUT_GATE = tt => scr([S.HO2.GATE[0], S.HO2.GATE[1] - 200], cam(tt), P8);
    G.OUT_HILLS = tt => scr(at(0.9), cam(tt), P8);
  }
  X.tr('radial', 18.4, 0.6, 'WINDOW', 'OUTGATE', { fa: G.WINDOW_FACE(18.4), fb: G.OUT_GATE(18.4), za: 1.15, zb: 1.2, soft: 0.45, leak: '#fff4dc', leakOp: 0.25 });

  // ======================================================= HILL: a hundred and thirty children dancing up the hill (22.18 - 26.0)
  // "a hundred and thirty children dancing behind the music."
  {
    const B = S.HH, P7 = 0.7, RT = B.ROUTE, RL = [0];
    for (let i = 1; i < RT.length; i++) RL.push(RL[i - 1] + Math.hypot(RT[i][0] - RT[i - 1][0], RT[i][1] - RT[i - 1][1]));
    const TOT = RL[RL.length - 1], at = d => { const dd = clamp(d, 0, TOT); let i = 1; while (i < RL.length - 1 && RL[i] < dd) i++; const k = (dd - RL[i - 1]) / (RL[i] - RL[i - 1]); return [lerp(RT[i - 1][0], RT[i][0], k), lerp(RT[i - 1][1], RT[i][1], k)]; };
    const COLS = ['#a8642a', '#4a5a7a', '#7a3a2a', '#6a7a4a', '#c8a050', '#3a5a5a', '#8a7a5a', '#5a7a3a', '#9a5a3a', '#4a3a5a'], HAIRS = ['#6a4222', '#141010', '#b8582a', '#d8b060', '#4a3020', '#e8c878'];
    const cam = CAM([[22.1, [...camOn(1150, 1560, P7), 0.4]], [24.0, [...camOn(640, 1360, P7), 0], 'sine'], [26.05, [...camOn(-80, 1020, P7), -0.4], 'io']], [[22.1, 0.78], [24.0, 0.74, 'sine'], [26.05, 0.86, 'io']]);
    const fn = t => {
      const c = hh(cam(t), t, 0.28, 23);
      const set = S.hhill(t);
      // 130 small dancers along the path, spaced along it and moving up; the Piper at the head
      const head = 2600 + 120 * (t - 22.1), N = 130;
      let g = '';
      for (let i = N - 1; i >= 0; i--) {
        const d = head - 70 - i * 19; if (d < 0) continue;
        const p = at(d), s = 0.42 * (0.55 + 0.45 * (p[1] - 880) / 840), side = (i % 3 - 1) * 10;
        g += PR.kidSil(p[0] + side, p[1] + (i % 2) * 6, s, t, COLS[i % COLS.length], HAIRS[i % HAIRS.length], i * 1.37, ['#e8c0a0', '#d8a888', '#f0d0b8', '#c89878'][i % 4]);
      }
      const pp = at(head), o = { x: pp[0], y: pp[1], s: 0.05, breath: 0, blink: 0, sway: 2 * Math.sin(t * 3), face: { mouth: 'closed', lid: 0.36 } };
      g += atP(P7, () => piperPlaying(o, t, LT.day, Q.piperArt(0)).svg);
      const i = set.findIndex(l => l.p === P7) + 1;
      const layers = [...set.slice(0, i), { p: P7, svg: g, chars: true }, ...set.slice(i)];
      return X.compose(layers, c) + C.vignette(0.48) + dith(t);
    };
    X.shot('HILL', 22.18, 26.0, fn, { grade: 'gDay' });
    G.HILL_CAM = cam;
  }
  X.tr('push', 22.48, 0.6, 'OUTGATE', 'HILL', { fa: G.OUT_HILLS(22.48), fb: [540, 1100], za: 2.2, zb: 0.65, blur: 7 });
})(window);
