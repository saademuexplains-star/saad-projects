// "The Confessor" part 1: the King kneels in the booth -> the law's punishment as shadow play -> the crimes you carry
// -> the cold confession -> the village and your mother's street.
// The booth is one world whose occupants are a function of time (booth()), so every angle on it agrees.
// Rules learned the hard way: arms are drawn over the kneeler / half door only while the hands rest on it,
// and hand paths never cross a face.
(function (G) {
  const X = G.ENG, Q = G.QCAST, S = G.SETS, PR = G.PROPS, C = G.CINE, R = G.RIG;
  const { track: TK, ss, clamp, lerp, EZ } = X;
  const { f, mix, rng } = R;
  const TAU = Math.PI * 2, D2R = Math.PI / 180;
  // ---- helper header (as in shots_h.js)
  const wave = (t, hz, ph = 0) => Math.sin(TAU * hz * t + ph);
  const env = (t, a, b, c, d) => ss(a, b, t) * (1 - ss(c, d, t));
  const bump = (t, t0, a = 1, len = 0.35) => (t < t0 || t > t0 + len) ? 0 : a * Math.pow(Math.sin(Math.PI * (t - t0) / len), 2);
  const idle = (t, seed, amp = 1) => ({ blink: Q.blink(t, seed), breath: Q.breath(t * 1.1 + seed) * 0.6, sway: X.noise(t * 0.45, seed) * 0.5 * amp });
  const hh = (c, t, amp = 1, seed = 0) => { const h = X.hand(t, amp, seed); return (X.CAM = [c[0] + h[0], c[1] + h[1], c[2], (c[3] || 0) + h[2]]); };
  const scr = (w, c, p = 1) => { const [cx, cy, z] = c, zp = Math.pow(z, p), px = 540 + (cx - 540) * p, py = 960 + (cy - 960) * p; return [540 + (w[0] - px) * zp, 960 + (w[1] - py) * zp]; };
  const lit = X.lit;
  const nrm = v => { const n = Math.hypot(v[0], v[1]) || 1; return [v[0] / n, v[1] / n]; };
  const L2 = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
  const HAND = { you: 114, king: 112, boy: 74, mother: 104, soldier1: 116, soldier2: 116, soldier3: 116 };
  const gripAt = (o, who, Gw, dW, extra = {}) => { const dl = nrm(R.dirLocal(o, dW)), gl = R.toLocal(o, Gw), gy = 0.33 * HAND[who]; return Object.assign({ hand: [gl[0] - dl[0] * gy, gl[1] - dl[1] * gy], dir: dl, pose: 'grip', facing: 'back' }, extra); };
  const fingersFor = (side, facing, thumb) => { const t = (side === 'R' ? -1 : 1) * (facing === 'palm' ? 1 : -1); return [-thumb[1] * t, thumb[0] * t]; };
  const armsOver = (p, L, which = 'RL') => C.lit({ svg: (which.includes('R') ? p.armRsvg : '') + (which.includes('L') ? p.armLsvg : ''), info: p.info }, Object.assign({ view: X.viewRect(1) }, L)).body;
  const handsLit = (p, L) => C.lit({ svg: (p.handR || '') + (p.handL || ''), info: p.info }, Object.assign({ view: X.viewRect(1) }, L)).body;
  const CAM = (pk, zk) => { const P = TK(pk), Z = TK(zk); return t => { const p = P(t); return [p[0], p[1], Z(t), p[2]]; }; };
  // a hand placed by its fingertips: the wrist sits back along the finger direction (world)
  const tipArm = (o, who, tipW, dirW, extra = {}) => { const d = nrm(dirW), k = 0.78 * HAND[who] * o.s; return Object.assign({ hand: R.toLocal(o, [tipW[0] - d[0] * k, tipW[1] - d[1] * k]), dir: nrm(R.dirLocal(o, d)), pose: 'open', facing: 'back' }, extra); };
  const LT = {
    booth: { from: [0.8, -0.2], shadow: '#140a06', shadowOp: 0.55, floor: '#2a1a10', floorOp: 0.35, contactOp: 0.4, key: '#ffc890', keyAdd: 0.08, rims: [{ from: [1, -0.2], col: '#ffb060', w: 7, op: 0.5 }, { from: [-1, -0.5], col: '#8aa0d0', w: 4, op: 0.22 }], face: { col: '#ffcf98', op: 0.14 } },
    altar: { from: [0, -1], shadow: '#140a06', shadowOp: 0.5, floor: '#2a1a10', floorOp: 0.35, contactOp: 0.45, key: '#ffd8a0', keyAdd: 0.07, rims: [{ from: [-1, -0.4], col: '#ffc070', w: 6, op: 0.45 }, { from: [1, -0.4], col: '#ffc070', w: 6, op: 0.45 }], face: { col: '#ffd8a8', op: 0.12 } },
    night: { from: [-0.6, -0.4], shadow: '#05070e', shadowOp: 0.5, floor: '#101420', floorOp: 0.35, contactOp: 0.4, key: '#8aa0d0', keyAdd: 0.03, rims: [{ from: [1, -0.1], col: '#ff9a40', w: 7, op: 0.6 }, { from: [-1, -0.5], col: '#9ab0e0', w: 4, op: 0.3 }], face: { col: '#ffb070', op: 0.1 } },
    dawn: { from: [0.8, -0.5], shadow: '#3a2010', shadowOp: 0.45, floor: '#5a3a1a', floorOp: 0.35, contactOp: 0.4, key: '#ffd8a0', keyAdd: 0.08, rims: [{ from: [1, -0.3], col: '#ffd890', w: 7, op: 0.55 }], face: { col: '#ffe0b0', op: 0.12 } },
  };
  G.SHOTS_I = { wave, env, bump, idle, hh, scr, nrm, L2, HAND, gripAt, fingersFor, armsOver, handsLit, CAM, tipArm, LT };
  const ST = {};
  G.CONFESSOR = ST;
  const CH = S.CH;

  // ======================================================= the booth world (time -> everyone's pose)
  const POS = { king: [290, 1700], you: [790, 1690], boy: [300, 1540] };
  const SC = { king: 0.62, you: 0.62, boy: 0.78 };
  ST.POS = POS; ST.SC = SC;
  const VS = 0.62;   // the vial is always drawn at one world scale, so it never changes size between hands
  const vialSvg = (p, ang, o = {}) => `<g transform="translate(${f(p[0])},${f(p[1])}) rotate(${f(ang)}) scale(${VS})">${PR.poisonG(o)}</g>`;
  ST.vialSvg = vialSvg;
  // the grille's lattice shadow falling on a face near it
  const lattice = (cx, cy, r, op) => { const id = 'lat' + Math.round(cx) + Math.round(cy); let l = ''; for (let k = -8; k <= 8; k++) l += `<path d="M${f(cx - r + k * 16)},${f(cy - r)} l${f(2 * r)},${f(2 * r)} M${f(cx + r + k * 16)},${f(cy - r)} l${f(-2 * r)},${f(2 * r)}" stroke="#000" stroke-width="6"/>`; return `<defs><clipPath id="${id}"><circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}"/></clipPath></defs><g clip-path="url(#${id})" opacity="${f(op)}" filter="url(#b2)">${l}</g>`; };
  // a rosary hanging from your hands over the half door
  const rosary = (hx, hy, t) => { let g = ''; const sw = Math.sin(t * 1.3) * 4; for (let i = 0; i < 16; i++) { const u = i / 15, x = hx - 24 + 48 * u + sw * Math.sin(u * Math.PI), y = hy + 8 + Math.sin(u * Math.PI) * 70; g += `<circle cx="${f(x)}" cy="${f(y)}" r="4.5" fill="#3a1e10" stroke="#120804" stroke-width="1"/>`; } const cx = hx + sw, cy = hy + 84; return g + `<path d="M${f(cx)},${f(cy)} l0,30 M${f(cx - 10)},${f(cy + 10)} l20,0" stroke="#c8a040" stroke-width="5"/>`; };
  // the King leaves at 24.2 (his hands come off the kneeler first, then he rises and goes out behind the curtain)
  const kingGone = t => t > 25.6 && t < 41;
  const boyIn = t => t > 25.65 && t < 37.2;
  const booth = (t, o = {}) => {
    const L = LT.booth;
    let back = S.boothBack(t) + (o.backExtra ? o.backExtra(t) : '');
    // behind[] is drawn behind the booth front (kneeler, curtain); over[] is what rests on the kneeler, drawn after it
    const behind = [], over = [];
    const bay = s => s ? `<g clip-path="url(#leftBay)">${s}</g>` : '';
    // what rests on the kneeler is drawn in front of it, so it must also stay hidden behind the curtain's edge like the body
    const bayO = s => s ? `<g clip-path="url(#leftBayO)">${s}</g>` : '';
    // ---------------- the King
    if (!o.noKing && !kingGone(t)) {
      const ko = Object.assign(idle(t, 7), { x: POS.king[0], y: POS.king[1], s: SC.king });
      const unclasp = ss(24.18, 24.45, t), rise = EZ.io(ss(24.42, 24.9, t)), walk = EZ.in2(ss(24.85, 25.6, t));
      ko.y -= 230 * rise; ko.x -= 420 * walk; ko.sway += -4 * walk + 2 * (1 - rise) * (1 - unclasp);
      const talking = o.kingTalk ? o.kingTalk(t) : 0;
      // hands: palms together on the kneeler rail; they lift to the chest before he stands
      // his arms count as resting on the kneeler until he has risen clear of it (no elbow popping in front of the rail)
      const kr = CH.KNEEL_TOP, onRail = rise < 0.3;
      const pR = L2([272, kr - 34], R.toWorld(ko, [-26, -930]), unclasp), pL = L2([306, kr - 34], R.toWorld(ko, [26, -930]), unclasp);
      const kf = o.kingFace ? o.kingFace(t) : { expr: 'neutral', look: [0.85, 0.02], lid: 0.2, mouth: talking > 0.5 ? 'talk' : 'closed', open: Q.talk(t, 0.24, 6) };
      const K = Q.king(Object.assign(ko, { tilt: (5 + (o.kingTilt ? o.kingTilt(t) : 0)) * (1 - rise), face: kf,
        armR: { hand: R.toLocal(ko, pR), dir: [0.22, -1], pose: 'open', facing: 'palm', detachHand: true }, armL: { hand: R.toLocal(ko, pL), dir: [-0.22, -1], pose: 'open', facing: 'palm', detachHand: true } }));
      let kv = lit(K, L);
      if (o.kingLattice) { const hp = R.toWorld(ko, [10, -1300]); kv += lattice(hp[0] + 40, hp[1], 110, o.kingLattice(t)); }
      if (onRail) { behind.push(bay(kv)); over.push(bayO(armsOver(K, L) + handsLit(K, L))); } else behind.push(bay(kv + handsLit(K, L)));
    }
    // ---------------- the kitchen boy
    if (boyIn(t)) {
      const bo = Object.assign(idle(t, 13, 1.4), { x: POS.boy[0], y: POS.boy[1], s: SC.boy });
      const enter = EZ.out2(ss(25.7, 26.45, t)), settle = EZ.io(ss(26.4, 26.9, t)), leave = EZ.in2(ss(36.75, 37.3, t));
      bo.x += -380 * (1 - enter) - 400 * leave; bo.y += -60 * (1 - settle);
      // trembling: a small, smooth shiver (never jitter)
      const shiver = ss(26.6, 27.2, t) * (1 - ss(35.9, 36.6, t));
      bo.x += shiver * (2.2 * Math.sin(t * 31) + 1.4 * Math.sin(t * 47 + 1)); bo.sway += shiver * 0.8 * Math.sin(t * 23);
      const BF = o.boyFace ? o.boyFace(t) : {};
      const handsOn = ss(26.8, 27.1, t) * (1 - ss(28.8, 29.1, t));
      const bArms = o.boyArms ? o.boyArms(t, bo) : null;
      const B = Q.boy(Object.assign(bo, { tilt: BF.tilt || 0, face: BF.face || { expr: 'fear', look: [0.8, 0.05], lid: 0.12, tears: true, mouth: 'tight' },
        armR: bArms ? bArms.R : { hand: R.toLocal(bo, [282, CH.KNEEL_TOP - 30]), dir: [0.25, -1], pose: 'open', facing: 'palm', detachHand: true },
        armL: bArms ? bArms.L : { hand: R.toLocal(bo, [318, CH.KNEEL_TOP - 30]), dir: [-0.25, -1], pose: 'open', facing: 'palm', detachHand: true } }));
      const bv = lit(B, L), vialUnder = bArms && bArms.vialUnder || '';
      if ((bArms && bArms.over) || (!bArms && handsOn > 0.5)) { behind.push(bay(bv)); over.push(bayO(armsOver(B, L)) + vialUnder + bayO(handsLit(B, L))); }
      else behind.push(bay(bv) + vialUnder + bay(handsLit(B, L)));
    }
    // ---------------- you
    const yo = Object.assign(idle(t, 3), { x: POS.you[0], y: POS.you[1], s: SC.you });
    const yf = o.youFace ? o.youFace(t) : { expr: 'grim', look: [-0.8, 0.05], lid: 0.3, mouth: 'tight' };
    const ya = o.youArms ? o.youArms(t, yo) : null;
    const handR = [768, CH.DOOR_TOP - 12], handL = [812, CH.DOOR_TOP - 8];
    const Y = Q.you(Object.assign(yo, { tilt: o.youTilt ? o.youTilt(t) : -4, face: yf,
      armR: ya ? ya.R : { hand: R.toLocal(yo, handR), dir: [1, 0.25], pose: 'relaxed', facing: 'back', detachHand: true },
      armL: ya ? ya.L : { hand: R.toLocal(yo, handL), dir: [-1, 0.3], pose: 'relaxed', facing: 'back', detachHand: true } }));
    let yv = lit(Y, L);
    if (o.youLattice) { const hp = R.toWorld(yo, [-10, -1300]); yv += lattice(hp[0] - 40, hp[1], 110, o.youLattice(t)); }
    const onDoor = ya ? ya.over : true;
    const vialW = ya && ya.vial ? ya.vial : '';
    const yourHands = (onDoor ? armsOver(Y, L) : '') + vialW + handsLit(Y, L) + (onDoor && !ya ? rosary(790, CH.DOOR_TOP + 2, t) : '');
    // order: back boards, your body, the King / boy (behind their kneeler), the booth front, hands resting on it, your hands
    return `<defs><clipPath id="leftBay"><rect x="${CH.LEFT[0]}" y="-400" width="${CH.LEFT[1] - CH.LEFT[0]}" height="2400"/></clipPath><clipPath id="leftBayO"><rect x="174" y="-400" width="${CH.LEFT[1] - 174}" height="2400"/></clipPath></defs>` + back + yv + behind.join('') + S.grilleBeam(t, o.beam ?? 1) + S.boothFront(t) + over.join('') + yourHands + (o.extra ? o.extra(t) : '');
  };
  ST.booth = booth;
  const boothScene = (t, c, o) => X.compose(X.stage(S.chapel(t, { dark: o && o.dark }), booth(t, o)), c);
  ST.boothScene = boothScene;

  // ======================================================= BOOTH: the King confesses (-0.7 - 8.07)
  // "Your King kneels before you in a dark wooden booth every night to confess his sins, knowing the law says
  //  if you ever repeat a single word he tells you,"
  {
    const cam = CAM(
      [[-0.7, [560, 860, 0]], [1.55, [330, 925, 0], 'sine'], [2.5, [540, 760, 0], 'io'], [4.2, [540, 900, 0], 'sine'], [5.45, [770, 890, 0], 'io'], [6.7, [795, 880, 0], 'sine'], [7.4, [880, 950, 0], 'sine'], [8.07, [945, 985, 0], 'in2']],
      [[-0.7, 0.86], [1.55, 1.6, 'sine'], [2.5, 0.92, 'io'], [4.2, 1.6, 'sine'], [5.45, 1.95, 'io'], [6.7, 2.45, 'sine'], [7.4, 2.6, 'sine'], [8.07, 3.1, 'in2']]);
    ST.boothCam = cam;
    const kingTalk = t => env(t, 2.6, 2.7, 4.2, 4.3);
    const youFace = t => { const listen = env(t, 2.5, 2.9, 4.3, 4.6), seal = ss(5.6, 6.0, t); return { expr: 'grim', look: L2([-0.8, 0.05], [0.02, 0.1], ss(4.3, 4.8, t)), lid: lerp(0.3, 0.78, listen), mouth: 'tight', brows: [lerp(0, -5, seal), -1] }; };
    const fn = t => {
      const c = hh(cam(t), t, 0.35, 1);
      return boothScene(t, c, { kingTalk, youFace, kingTilt: t => bump(t, 0.3, 4, 0.9) }) + C.vignette(0.6);
    };
    X.shot('BOOTH', -0.7, 8.07, fn, { grade: 'gNight' });
  }

  // ======================================================= PUNISH: the law, as shadow play on a fire-lit wall (7.37 - 10.72)
  // "your tongue will be cut out and you will be burned alive."
  {
    const SIL = '#120604';
    const sil = svg => `<g fill="${SIL}" stroke="${SIL}" stroke-linecap="round" stroke-linejoin="round" opacity="0.92" filter="url(#b2)">${svg}</g>`;
    // a bound man kneeling, facing right; origin = knees on the floor; a = head tilt back (deg), scream 0..1 opens the jaw
    const victim = (x, y, s, a, lean, scream) => {
      let g = `<path d="M10,-8 L-200,-10 C-214,-10 -224,-2 -228,8 L-180,8" stroke-width="40" fill="none"/>`;   // shins and feet folded behind
      g += `<path d="M-20,8 C-60,-60 -70,-170 -62,-250 L10,-252 C20,-170 26,-80 30,0Z"/>`;                     // thighs
      g += `<path d="M-84,-246 C-100,-380 -76,-520 -34,-596 L48,-584 C74,-480 58,-350 40,-246Z"/>`;              // torso, hunched
      g += `<path d="M-90,-250 l14,26 l14,-20 l16,24 l14,-22 l16,26 l14,-20 l16,22 l14,-20 l12,4Z"/>`;          // ragged hem
      g += `<path d="M-30,-548 C-80,-520 -120,-460 -118,-410 C-116,-372 -90,-350 -60,-338" stroke-width="40" fill="none"/>`;   // arms bound behind
      g += [0, 1, 2].map(i => `<ellipse cx="${-64 + i * 4}" cy="${-350 + i * 9}" rx="22" ry="7" fill="none" stroke-width="6"/>`).join('');
      g += `<g transform="rotate(${f(a)},18,-588)"><path d="M10,-580 C14,-604 26,-618 34,-628 L60,-612 C52,-596 40,-584 36,-572Z"/>` +
        `<path d="M2,-664 C0,-712 40,-736 76,-722 C104,-710 112,-684 110,-662 L124,-650 L112,-642 L114,${f(-628 + 18 * scream)} L96,${f(-618 + 18 * scream)} C80,-600 46,-596 26,-612 C8,-626 2,-644 2,-664Z"/>` +
        `<path d="M2,-664 C-10,-690 -4,-720 10,-736 C14,-716 24,-730 34,-744 C34,-728 46,-738 58,-748 C54,-730 66,-736 76,-724" stroke-width="10" fill="none"/></g>`;
      return `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)}) rotate(${f(lean)})">${g}</g>`;
    };
    // the hooded executioner facing left: a peaked hood with eye holes over a short cape, a leather apron, boots;
    // one hand fists the victim's hair (grab, world), the other pushes the tongs (reach 0..1, pull 0..1)
    const executioner = (x, y, s, grab, reach, pull) => {
      const gl = [(grab[0] - x) / s, (grab[1] - y) / s];
      const hx = -150 - 150 * reach + 60 * pull, hy = -600 + 24 * pull, tx = hx - 250, ty = -646 - 12 * reach, op = 14 * (1 - reach) + 4;
      let g = `<path d="M-50,0 L-120,0 C-126,-14 -110,-24 -70,-26 L-62,-380 L-14,-380 L-24,-26 C-20,-12 -30,0 -50,0Z M42,0 L-24,2 C-28,-12 -16,-22 14,-24 L22,-380 L68,-380 L60,-24 C64,-10 60,0 42,0Z"/>`;
      g += `<path d="M-108,-360 C-110,-520 -100,-640 -84,-720 L84,-720 C100,-640 108,-520 102,-360Z"/><path d="M-96,-330 L96,-330 L80,-520 L-80,-520Z"/>`;
      g += `<path d="M-130,-650 C-120,-700 -96,-760 -60,-780 L-80,-800 C-90,-900 -40,-980 30,-1076 C40,-990 76,-920 74,-820 L96,-790 C120,-760 130,-700 124,-650Z M-50,-860 l24,-6 l-2,10Z M-14,-870 l22,-4 l-2,10Z" fill-rule="evenodd"/>`;
      g += `<path d="M-60,-700 C-90,-660 ${f((gl[0] - 60) * 0.5)},${f((gl[1] - 700) * 0.5)} ${f(gl[0] + 18)},${f(gl[1] + 8)}" stroke-width="46" fill="none"/><circle cx="${f(gl[0] + 10)}" cy="${f(gl[1] + 4)}" r="30"/>`;
      g += `<path d="M30,-690 C0,-640 ${f(hx + 70)},${f(hy + 50)} ${f(hx + 10)},${f(hy + 8)}" stroke-width="42" fill="none"/><circle cx="${f(hx)}" cy="${f(hy)}" r="28"/>`;
      g += `<path d="M${f(hx)},${f(hy - 6)} L${f(hx - 120)},${f(hy - 30)} L${f(tx)},${f(ty - op)} M${f(hx)},${f(hy + 6)} L${f(hx - 120)},${f(hy - 22)} L${f(tx)},${f(ty + op)}" stroke-width="11" fill="none"/>`;
      return `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">${g}</g>`;
    };
    // a man bound to a stake above a pile of bundled firewood, head sunk, arms behind the post
    const stake = (x, y, s) => {
      let g = `<rect x="-24" y="-1240" width="48" height="1240"/>`;
      g += `<path d="M-30,-180 L-18,-560 M30,-180 L18,-560" stroke-width="50" fill="none"/>`;
      g += `<path d="M-86,-540 C-96,-700 -84,-820 -44,-880 L44,-880 C84,-820 96,-700 86,-540Z"/><path d="M-76,-840 C-118,-760 -100,-670 -46,-630 M76,-840 C118,-760 100,-670 46,-630" stroke-width="38" fill="none"/>`;
      g += `<path d="M-18,-880 C-14,-900 -10,-912 0,-918 C10,-912 14,-900 18,-880Z"/><g transform="rotate(14,0,-920)"><ellipse cx="6" cy="-978" rx="58" ry="64"/><path d="M-50,-1000 C-60,-1040 -30,-1060 0,-1050 C30,-1062 62,-1036 58,-1000" stroke-width="14" fill="none"/></g>`;
      g += [-760, -640, -300].map(yy => `<path d="M-100,${yy} L100,${yy + 10}" stroke-width="12" fill="none"/>`).join('');
      const r = rng(7); for (let i = 0; i < 26; i++) { const a = (r() - 0.5) * 1.4, l = 160 + r() * 140, bx = (r() - 0.5) * 300; g += `<path d="M${f(bx)},0 L${f(bx + Math.sin(a) * l)},${f(-Math.cos(a) * l * 0.9 - 40)}" stroke-width="${f(14 + r() * 10)}" fill="none"/>`; }
      g += `<path d="M-260,10 C-200,-140 -120,-200 0,-230 C120,-200 200,-140 260,10Z"/>`;
      return `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">${g}</g>`;
    };
    const cam = CAM(
      [[7.37, [600, 650, 0]], [8.2, [560, 980, 0], 'out2'], [9.3, [640, 960, 0], 'sine'], [10.05, [1260, 900, -1], 'io'], [10.72, [1300, 880, -1.5], 'sine']],
      [[7.37, 2.0], [8.2, 1.05, 'out2'], [9.3, 1.15, 'sine'], [10.05, 1.2, 'sine'], [10.72, 1.4, 'sine']]);
    ST.punCam = cam;
    ST.punTorch = tt => scr([600, 560], cam(tt), 0.92);
    ST.punFire = tt => scr([1300, 1500], cam(tt), 1.04);
    const fn = t => {
      const c = hh(cam(t), t, 0.4, 5), set = S.shadowWall2(t);
      const reach = EZ.io(ss(7.8, 8.6, t)), grip = ss(8.55, 8.7, t), pull = EZ.io(ss(8.75, 9.25, t)), jerk = bump(t, 8.62, 1, 0.35);
      const vx = 400, vy = 1520, vs = 0.8, va = -8 - 18 * jerk - 22 * pull, scream = Math.max(jerk, pull * 0.8);
      // the executioner's grabbing hand stays on the back of the victim's head as it is wrenched back
      const ha = (va - 0) * D2R, hb = [vx + vs * (18 + Math.cos(ha) * (10 - 18) - Math.sin(ha) * (-700 + 588)), vy + vs * (-588 + Math.sin(ha) * (10 - 18) + Math.cos(ha) * (-700 + 588))];
      let sh = victim(vx, vy, vs, va, 3 * pull, scream) + executioner(780, 1580, 0.82, hb, reach, pull);
      sh += stake(1330, 1650, 0.8);
      // the shadows sway with the fire
      const sw = Math.sin(t * 7) * 3 + Math.sin(t * 11.3) * 2;
      const shadows = `<g transform="translate(${f(sw)},0) skewX(${f(sw * 0.15)})">${sil(sh)}</g>`;
      // the wall torch the scene opens on, and the pyre fire rising in front of the stake on "burned alive"
      let torch = PR.torch(600, 640, 1.3, t, 5);
      const burn = ss(9.35, 10.2, t);
      let fire = '';
      for (let i = 0; i < 5; i++) fire += G.SETS.fireMorph(1150 + i * 90, 1720, (0.9 + 0.9 * burn) * (0.8 + 0.25 * Math.sin(i * 2.1)), 11 + i * 7, 6, t * (7 + i * 0.6) + i);
      fire += S.embers(1330, 1500, 500, 900, t, 30, 9) + C.radial(1330, 1500, 900, '#ff7a2a', 0.25 + 0.4 * burn, 'screen');
      for (let i = 0; i < 8; i++) fire += G.SETS.fireMorph(-200 + i * 260, 2020, 1.3, 31 + i * 3, 6, t * 7.5 + i * 0.7);
      const layers = set.concat([{ p: 0.92, svg: shadows + torch }, { p: 1.04, svg: fire }]);
      return X.compose(layers, c) + C.vignette(0.65);
    };
    X.shot('PUNISH', 7.37, 10.72, fn, { grade: 'gNight' });
  }

  // ======================================================= CRIMES: the empire's sins, in your head (10.12 - 14.45)
  // "You carry the darkest crimes of the empire inside your head in silence,"
  {
    const cam = CAM(
      [[10.12, [795, 905, 0]], [12.0, [792, 888, -1], 'sine'], [14.45, [786, 878, 0.5], 'sine']],
      [[10.12, 2.2], [12.0, 2.65, 'sine'], [14.45, 3.15, 'sine']]);
    ST.crimesCam = cam;
    // shadows of crimes drifting up the dark boards behind you: a hanged man, a spearman, a burning house, a crown
    const ghosts = t => {
      const SIL = '#200806'; let g = '';
      const items = [
        [10.0, 690, (x, y) => `<path d="M${x},${y - 260} L${x},${y - 120}" stroke="${SIL}" stroke-width="5" fill="none"/><circle cx="${x}" cy="${y - 96}" r="26"/><path d="M${x - 30},${y - 66} L${x + 30},${y - 66} L${x + 22},${y + 70} L${x - 22},${y + 70}Z"/><path d="M${x - 14},${y + 70} L${x - 18},${y + 170} M${x + 14},${y + 70} L${x + 18},${y + 170}" stroke="${SIL}" stroke-width="16" fill="none"/>`],
        [10.9, 940, (x, y) => `<circle cx="${x}" cy="${y - 150}" r="24"/><path d="M${x - 34},${y - 120} L${x + 30},${y - 120} L${x + 22},${y + 40} L${x - 26},${y + 40}Z"/><path d="M${x - 10},${y + 40} L${x - 30},${y + 160} M${x + 10},${y + 40} L${x + 30},${y + 160}" stroke="${SIL}" stroke-width="16" fill="none"/><path d="M${x - 140},${y - 60} L${x + 160},${y - 140}" stroke="${SIL}" stroke-width="7" fill="none"/>`],
        [11.9, 700, (x, y) => `<path d="M${x - 90},${y + 60} L${x - 90},${y - 30} L${x},${y - 110} L${x + 90},${y - 30} L${x + 90},${y + 60}Z"/><path d="M${x - 60},${y - 70} C${x - 70},${y - 150} ${x - 20},${y - 170} ${x - 30},${y - 230} C${x + 10},${y - 170} ${x + 50},${y - 160} ${x + 40},${y - 90}Z" opacity="0.8"/>`],
        [12.8, 930, (x, y) => `<path d="M${x - 70},${y + 20} L${x - 80},${y - 50} L${x - 36},${y - 14} L${x},${y - 70} L${x + 36},${y - 14} L${x + 80},${y - 50} L${x + 70},${y + 20}Z"/>`],
      ];
      for (const [t0, x, draw] of items) { const u = (t - t0) / 3.2; if (u < 0 || u > 1) continue; const a = Math.pow(Math.sin(Math.PI * u), 1.5); g += `<g opacity="${f(0.7 * a)}" transform="translate(0,${f(-120 * u)})">${draw(x, 820)}</g>`; }
      // a dull red glow on the boards behind your head, the shadows of the crimes moving through it
      return C.radial(790, 760, 420, '#8a1a10', 0.5) + `<g fill="${SIL}" stroke="${SIL}" filter="url(#b2)">${g}</g>`;
    };
    const youFace = t => ({ expr: 'grief', look: [0.02, 0.15], lid: lerp(0.86, 0.95, ss(12.6, 13.4, t)), mouth: 'tight', brows: [-9, 1], cd: 4, sweat: 0.5 });
    const fn = t => {
      const c = hh(cam(t), t, 0.3, 9);
      const scene = X.compose(X.stage(S.chapel(t, { dark: 1 }), booth(t, { youFace, youTilt: t => -2 + 1.5 * Math.sin(t * 0.7), noKing: true, backExtra: ghosts })), c);
      return scene + `<rect x="-20" y="-20" width="1120" height="1960" fill="#1a0408" opacity="0.18" style="mix-blend-mode:multiply"/>` + C.vignette(0.75);
    };
    X.shot('CRIMES', 10.12, 14.45, fn, { grade: 'gNight' });
  }

  // ======================================================= KING2: the cold confession (13.75 - 19.1)
  // "until one evening the King coldly confesses that at dawn tomorrow, he is ordering his army to burn..."
  {
    const cam = CAM(
      [[13.75, [560, 900, 0]], [15.3, [345, 905, 0], 'io'], [17.1, [360, 892, 0], 'sine'], [17.85, [380, 890, 0], 'sine'], [18.55, [785, 882, 0], 'io'], [19.1, [792, 878, 0], 'sine']],
      [[13.75, 1.15], [15.3, 2.0, 'io'], [17.1, 2.6, 'sine'], [17.85, 2.65, 'sine'], [18.2, 1.9, 'sine'], [18.55, 2.6, 'sine'], [19.1, 2.9, 'sine']]);
    ST.king2Cam = cam;
    ST.youEye = tt => scr([POS.you[0] - 14, POS.you[1] - 1300 * SC.you], cam(tt));
    const kingTalk = t => env(t, 15.3, 15.4, 18.6, 18.7);
    const kingFace = t => ({ expr: 'neutral', look: [0.85, 0.0], lid: lerp(0.22, 0.32, ss(15.5, 16.2, t)), mouth: kingTalk(t) > 0.5 ? 'talk' : 'smirk', open: Q.talk(t, 0.2, 5), brows: [4, -3] });
    const youFace = t => { const shock = ss(17.9, 18.25, t); return { expr: shock > 0.5 ? 'fear' : 'grim', wide: shock > 0.5, look: L2([-0.8, 0.05], [-0.95, 0.0], shock), lid: lerp(0.62, 0.08, shock), mouth: shock > 0.5 ? 'parted' : 'tight', open: 0.12, brows: [lerp(-2, -14, shock), 3] }; };
    const fn = t => {
      const c = hh(cam(t), t, 0.35, 11);
      return boothScene(t, c, { kingTalk, kingFace, youFace,  youTilt: t => -4 + bump(t, 17.95, -4, 0.4) }) + C.vignette(0.62);
    };
    X.shot('KING2', 13.75, 19.1, fn, { grade: 'gNight' });
  }

  // ======================================================= VALLEY: the army on the hill above the sleeping village (18.4 - 22.15)
  // "...he is ordering his army to burn an entire rebellious village to the ground,"
  {
    const E = G.ENV;
    const cam = CAM(
      [[18.4, [540, 720, 0]], [19.7, [520, 960, 0], 'sine'], [21.0, [600, 1090, 0], 'sine'], [22.15, [700, 1120, 0], 'in2']],
      [[18.4, 0.95], [19.7, 1.0, 'sine'], [21.0, 1.08, 'sine'], [22.15, 1.25, 'in2']]);
    ST.valCam = cam;
    ST.valHome = tt => scr(S.VAL.HOME, cam(tt), 0.5);
    ST.valTorch = tt => scr([300, 1210], cam(tt));
    // soldiers march across the hillside in front of the camera, torches raised, legs lost in the grass
    const soldiers = (t, L) => {
      let g = '';
      const line = [['soldier1', -120, 0], ['soldier2', 300, 0.45], ['soldier3', 720, 0.9]];
      for (const [who, x0, ph] of line) {
        const x = x0 + 120 * (t - 18.4), y = 1830, s = 0.56, step = Math.cos((t + ph) * 5.2);
        const o = Object.assign(idle(t, x0, 0.6), { x, y: y - 6 * (0.5 + 0.5 * step), s });
        o.sway += 1.2 * Math.sin((t + ph) * 2.6);
        const tg = R.toWorld(o, [-160, -1290]);
        const arm = gripAt(o, who, tg, fingersFor('R', 'back', [-0.12, -1]), { hold: PR.torchG(t, x0) });
        const P = Q[who](Object.assign(o, { face: { expr: 'stern', look: [0.55, 0.3], lid: 0.25 }, armR: arm, armL: { hand: [190, -760 + 26 * step], pose: 'fist', facing: 'back', dir: [0, 1] } }));
        g += lit(P, L) + C.radial(tg[0], tg[1] - 70, 360, '#ff8a3a', 0.35, 'screen');
      }
      return g;
    };
    const fn = t => {
      const c = hh(cam(t), t, 0.4, 15), L = LT.night;
      const set = S.valley(t, { dawn: 0, fire: ss(20.4, 21.4, t) });
      return X.compose(X.stage(set, soldiers(t, L)), c) + C.vignette(0.55);
    };
    X.shot('VALLEY', 18.4, 22.15, fn, { grade: 'gNight' });
  }

  // ======================================================= MOTHER: your mother at her door, unaware (21.35 - 24.41)
  // "including the street where your own mother lives."
  {
    const D = S.HOUSE.DOOR, MO = [D[0] + 10, D[1]], SM = 0.44;
    const cam = CAM(
      [[21.35, [552, 1236, 0]], [22.2, [548, 1260, 0], 'sine'], [23.2, [545, 1228, 0], 'sine'], [24.41, [520, 1215, 0], 'sine']],
      [[21.35, 2.3], [22.2, 1.55, 'sine'], [23.2, 1.85, 'sine'], [24.41, 2.15, 'sine']]);
    ST.motherCam = cam;
    ST.MOTHER = { MO, SM };
    ST.motherFace = (tt, camF) => scr([MO[0] - 6, MO[1] - 1262 * SM], (camF || cam)(tt));
    ST.mother = (t, L, dawn) => {
      const mo = Object.assign(idle(t, 19, 0.6), { x: MO[0], y: MO[1], s: SM });
      if (dawn) {
        const M = Q.mother(Object.assign(mo, { tilt: -3, face: { expr: 'neutral', mouth: 'smile', look: [0.5, -0.4], lid: 0.38 }, armR: { hand: [-120, -700], pose: 'relaxed', facing: 'back', dir: [0.2, 1] }, armL: { hand: [140, -690], pose: 'relaxed', facing: 'back', dir: [-0.2, 1] } }));
        return lit(M, L);
      }
      const lanternAt = R.toWorld(mo, [215, -720]);
      const M = Q.mother(Object.assign(mo, { tilt: 3, face: { expr: 'neutral', mouth: 'smile', look: [-0.55, 0.12], lid: 0.32 }, armL: gripAt(mo, 'mother', lanternAt, [0, 1], { pose: 'grip', detachHand: true }), armR: { hand: [-150, -630], pose: 'relaxed', facing: 'back', dir: [0.1, 1] } }));
      return lit(M, L) + PR.lantern(lanternAt[0], lanternAt[1] - 14, 0.85, t, Math.sin(t * 1.4) * 3) + handsLit(M, L);
    };
    const fn = t => {
      const c = hh(cam(t), t, 0.3, 17), L = LT.night;
      const set = S.cottageDoor(t, { dawn: 0, torch: ss(21.5, 24.4, t) });
      return X.compose(X.stage(set, ST.mother(t, L, false)), c) + C.vignette(0.55);
    };
    X.shot('MOTHER', 21.35, 24.41, fn, { grade: 'gNight' });
  }
})(window);
