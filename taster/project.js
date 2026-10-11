// "The Taster" — 55.8 s, 1080x1920, 30 fps, no captions. Relit (flat + normal passes → deferred lights).
// Hard cuts, two dips to black (into the past and into the flashback). The last frame is the first frame.

const brS = (t, ph = 0, rate = 1) => br(t, ph, rate) * seamW(t), swayS = (t, k = 0, a = 1.5) => sway(t, k, a) * seamW(t);
const aim = (A, theta) => ({ ...A, hrot: theta - Math.atan2(A.wr[1] - A.el[1], A.wr[0] - A.el[0]) * 180 / Math.PI });
const wristFor = (tip, theta, len) => [tip[0] - Math.cos(theta * Math.PI / 180) * len, tip[1] - Math.sin(theta * Math.PI / 180) * len];
const redraw = (k, A, S, sk, hs) => A.hand && A.hand !== 'none' ? HANDS[A.hand](k, A.wr[0], A.wr[1] - 3, A.hs ?? hs, handAng(A), { S, sk, curl: A.curl || 0, spread: A.spread ?? (A.hand === 'palm' ? 1 : 0) }) : '';
const fistAt = (A, hs) => { const d = unit(A.el, A.wr); return [A.wr[0] + d[0] * 20 * hs, A.wr[1] + d[1] * 20 * hs]; };
// lip flap on the spoken words between a and b (the boy's line, the king's shout)
const talkW = (t, a, b, amp = .26) => { for (const [s, w, e] of WORDS) if (s >= a - .02 && e <= b + .02 && t >= s && t < e) { const n = Math.max(1, Math.round((e - s) / .17)), u = (t - s) / (e - s); return .07 + amp * Math.abs(Math.sin(u * Math.PI * n)); } return 0; };
const lidB = (t, base, list) => Math.max(base, blinkAt(t, list));
const SKBt = SKIN_TONES.fair;

// ---------- placements on the dais (world): [x, y, scale] of each body's local origin ----------
const K0 = [560, 1864, .62], B0 = [830, 1860, .6], Q0 = [1100, 1850, .6];
function boyFig(t, pose = {}, { at = B0, top = '' } = {}) {
  const b = brS(t, 1.1, 1.2), [x, y, s] = at;
  return outlined(manb(x, y, s, TASTER, { breath: b, bust: 1, ...pose }) + (top ? atb(x, y, s, top, b) : ''));
}
function kingFig(t, pose = {}, top = '') { const [x, y, s] = K0, b = brS(t, .4, .9); return outlined(manb(x, y, s, KING, { breath: b, ...pose }) + (top ? atb(x, y, s, top, b) : '')); }
function queenFig(t, pose = {}, top = '', { lean = 0 } = {}) {
  const [x, y, s] = Q0, b = brS(t, 2.1, .8), s2 = s * (1 + .07 * lean), y2 = y + 40 * lean;
  return outlined(manb(x - 14 * lean, y2, s2, QUEEN, { breath: b, ...pose }) + (top ? atb(x - 14 * lean, y2, s2, top, b) : ''));
}
// both of the boy's hands round the bowl of a goblet whose rim centre is c (boy-local); arms keep one IK side each
function boyCup(c, gs = .8, { tilt = 0, wine = .8, grip = .45, gap = 14 } = {}) {
  const yb = c[1] + 40 * gs, len = 64 * 1.05;
  const L = aim(tArm(-1, wristFor([c[0] - gap, yb], -4, len), 'back', { bend: 1, curl: grip }), -4);
  const R = aim(tArm(1, wristFor([c[0] + gap, yb], 184, len), 'back', { bend: -1, curl: grip }), 184);
  return { armL: L, armR: R, top: goblet(c[0], c[1], gs, { tilt, wine }) + redraw(-1, L, SKBt, 'fair', 1.05) + redraw(1, R, SKBt, 'fair', 1.05) };
}
// table dressing (world; everything stands on the cloth at y ≈ 1428)
function items(t, o = {}) {
  return `${jug(400, 1436, .48)}${tableCandle(310, 1428, t, .78, 1)}${tableCandle(1330, 1428, t, .78, 2)}
    ${platter(530, 1424, .52, { leg: o.leg ?? 1, bite: o.bite || 0 })}${o.kcup === 0 ? '' : pewterCup(680, 1428 - 105 * .46, .46)}
    ${breadLoaf(1240, 1420, .42)}${grapes(1290, 1404, .5)}${o.qcup ? goblet(o.qcup[0], o.qcup[1], .48, { wine: .75, tilt: o.qcup[2] || 0 }) : pewterCup(1190, 1428 - 105 * .44, .44)}
    ${o.extra || ''}`;
}
// the whole dais (for the establishing shot)
function daisAll(t, o = {}) {
  const C = boyCup([0, -890], .8);
  return `${daisBack(t)}${kingFig(t, { look: 8, turn: .2, lid: .2, smirk: .4 })}${queenFig(t, { look: -6, lookY: 3, turn: -.2, lid: .3, smirk: .2 })}
    ${boyFig(t, { armL: C.armL, armR: C.armR, look: 0, lookY: 2, lid: .2 }, { top: C.top })}${daisTable(items(t))}`;
}

// ---------- light rigs (world coordinates of each set) ----------
const RIG_DAIS = (t, { k = 1, moon = 1, map = p => p } = {}) => {
  const L = (p, o) => ({ ...o, pos: [...map(p), p[2]] });
  return {
    lights: [
      L([310, 1250, 170], { col: '#ffdcb4', int: 1.25 * k * (.94 + .06 * flkSeam(t, 1)), rad: 540, shin: 26 }),          // table candles: the key
      L([1330, 1250, 170], { col: '#ffdcb4', int: 1.15 * k * (.94 + .06 * flkSeam(t, 2)), rad: 540, shin: 26 }),
      L([830, 40, 420], { col: '#ffe4c4', int: 1.35 * k, rad: 1200, shin: 22 }),                                         // the chandelier overhead
      L([830, 760, -320], { col: '#a8bcf0', int: 1.5 * moon, rad: 900, shin: 28 }),                                       // moon through the great window: rim
      L([-20, 700, 140], { col: '#ffcf98', int: .55 * k, rad: 700, shin: 18 }), L([1680, 700, 140], { col: '#ffcf98', int: .55 * k, rad: 700, shin: 18 }),
      L([830, 1400, 1800], { col: '#8a9cd0', int: .3, rad: 5000, shin: 12 }),
    ],
    amb: '#3a4258', ambGround: '#2a2420', ambInt: .3, bgLight: .45, exposure: 1.15, bloom: .32, bloomThresh: .78, normalStrength: .95, specScale: .35,
    vignette: .55, grain: .02, shadowTint: '#141c30', highTint: '#f6e2c4', sat: .9, contrast: 1.1,
    rays: { center: map([830, 700]), thresh: .5, srcRad: 300, samples: 40, step: .016, decay: .963, col: '#b8ccff', int: .45 * moon },
  };
};
const RIG_NAVE = (t) => ({
  lights: [
    { pos: [540, 150, 500], col: '#ffe4c4', int: 1.3, rad: 1500, shin: 22 },
    ...[[200, 1440], [680, 1440], [340, 1810], [740, 1810]].map(([x, y], i) => ({ pos: [x, y, 160], col: '#ffdcb4', int: .8 * (.94 + .06 * flkSeam(t, i + 3)), rad: 460, shin: 24 })),
    { pos: [80, 420, -300], col: '#a8bcf0', int: .9, rad: 900, shin: 26 }, { pos: [1000, 420, -300], col: '#a8bcf0', int: .9, rad: 900, shin: 26 },
    { pos: [540, 1500, 1800], col: '#8a9cd0', int: .3, rad: 5000, shin: 12 },
  ],
  amb: '#3a4258', ambGround: '#2a2420', ambInt: .3, bgLight: .45, exposure: 1.15, bloom: .3, bloomThresh: .78, normalStrength: .95, specScale: .35,
  vignette: .56, grain: .02, shadowTint: '#141c30', highTint: '#f6e2c4', sat: .9, contrast: 1.1,
});
const RIG_CELL = (t, { dawn = 0 } = {}) => dawn ? {
  lights: [{ pos: [840, 500, 260], col: '#e2e8f4', int: 2.1, rad: 1500, shin: 24 }, { pos: [300, 1500, 1600], col: '#8a98b8', int: .35, rad: 5000, shin: 12 }],
  amb: '#4a5468', ambGround: '#2a2a2e', ambInt: .34, bgLight: .5, exposure: 1.12, bloom: .3, bloomThresh: .8, normalStrength: .95, specScale: .3,
  vignette: .6, grain: .024, shadowTint: '#18243a', highTint: '#eef0f4', sat: .62, contrast: 1.06,
  rays: { center: [840, 500], thresh: .5, srcRad: 220, samples: 40, step: .018, decay: .965, col: '#e8eef8', int: .6 },
} : {
  lights: [{ pos: [930, 1000, 160], col: '#ffdcb0', int: 2.2 * (.92 + .08 * flkSeam(t, 4)), rad: 620, shin: 26 }, { pos: [840, 500, -220], col: '#a8bcf0', int: .9, rad: 900, shin: 24 },
    { pos: [500, 1500, 1600], col: '#8a9cd0', int: .26, rad: 5000, shin: 12 }],
  amb: '#343c52', ambGround: '#241e1a', ambInt: .26, bgLight: .45, exposure: 1.15, bloom: .32, bloomThresh: .78, normalStrength: .95, specScale: .3,
  vignette: .6, grain: .022, shadowTint: '#121a2c', highTint: '#f6e2c4', sat: .88, contrast: 1.1,
};
const RIG_FLOOR = (t) => ({
  lights: [{ pos: [80, 800, 300], col: '#ffd8aa', int: 1.9, rad: 1200, shin: 26 }, { pos: [1050, 1500, 320], col: '#9ab0e0', int: .8, rad: 1200, shin: 26 },
    { pos: [540, 1500, 1600], col: '#8a9cd0', int: .25, rad: 5000, shin: 12 }],
  amb: '#2e3446', ambGround: '#1a1612', ambInt: .26, bgLight: .55, exposure: 1.18, bloom: .3, bloomThresh: .8, normalStrength: .95, specScale: .5,
  vignette: .62, grain: .022, shadowTint: '#101828', highTint: '#f0dcc0', sat: .85, contrast: 1.1,
});
const RIG_GALLOWS = (t) => ({
  lights: [{ pos: [300, 1100, 700], col: '#e8e6e0', int: 1.25, rad: 3000, shin: 20 }, { pos: [900, 400, -200], col: '#c8d0e0', int: .6, rad: 1500, shin: 20 }],
  amb: '#6a7488', ambGround: '#3a3c42', ambInt: .55, bgLight: .65, exposure: 1.08, bloom: .25, bloomThresh: .82, normalStrength: .9, specScale: .3,
  vignette: .62, grain: .026, shadowTint: '#1a2436', highTint: '#eef0f2', sat: .62, contrast: 1.08,
});
const RIG_WINE = (t) => ({
  lights: [{ pos: [380, 640, 420], col: '#ffe2bc', int: 2.0 * (.94 + .06 * flkSeam(t, 6)), rad: 1000, shin: 30 }, { pos: [800, 1500, 600], col: '#a8bcf0', int: .5, rad: 1200, shin: 24 }],
  amb: '#2a2a36', ambGround: '#1a1412', ambInt: .3, bgLight: .55, exposure: 1.15, bloom: .4, bloomThresh: .75, normalStrength: .95, specScale: .6,
  vignette: .6, grain: .02, shadowTint: '#141c30', highTint: '#f6e2c4', sat: .92, contrast: 1.12,
});

// ---------- recurring shots ----------
// the opening close-up = the closing close-up (the loop): the boy at the high table, watching, a ghost of a smile
const OPEN_POSE = { look: 4, lookY: 1, smirk: .3, lid: .15, bIn: 2, bOut: 0, turn: .06 };
function boyECU(t, pose, cam) {
  const C = camT(t, ...cam);
  return `<g transform="${C.tf}">${lights(C.v, RIG_DAIS(t))}${daisBack(t, { blur: 'dofHeavy' })}
    ${boyFig(t, pose)}${daisTable(items(t, { kcup: 0 }))}</g>`;
}
// the hall of nobles, heads driven by pose(i)
function naveShot(t, pose, cam) {
  const C = camT(t, ...cam);
  return `<g transform="${C.tf}">${lights(C.v, RIG_NAVE(t))}${hallNave(t, { heads: pose })}</g>`;
}

const SHOTS = [
  // 1 "You're twelve…" — the boy's face in the candlelight; the smile goes, he swallows, his eyes come to us
  { at: 0,
    draw(v, t) {
      const p = easeInOut(seg(t, .3, 1.0));
      return boyECU(t, { ...OPEN_POSE, look: lerp(4, 0, p), smirk: lerp(.3, -.25, p), bIn: lerp(2, 7, p), bOut: lerp(0, 3, p), lid: lidB(t, lerp(.15, 0, p), [1.15]), turn: lerp(.06, 0, p) },
        [830, lerp(1222, 1226, seg(t, 0, 1.42)), lerp(6.0, 6.5, easeInOut(seg(t, .2, 1.42)))]);
    } },

  // 2 "and your only job is to taste the king's food before he does." — at the high table: he raises the king's goblet and
  //   tastes; the king watches him, drumming his fingers
  { at: 1.42,
    draw(v, t) {
      const up = easeInOut(seg(t, 2.35, 2.8)) * (1 - easeInOut(seg(t, 3.55, 4.0)));
      const C0 = boyCup(lerp2([0, -900], [0, -1004], up), .8, { tilt: 6 * up, wine: .8 });
      const tap = Math.max(0, Math.sin(t * 15)) * seg(t, 1.6, 1.7);
      const KR = aim(kArm2(1, [176, -722 + 6 * tap], 'back', { bend: -1, curl: .25 + .5 * tap }), 112);
      const lean = easeInOut(seg(t, 3.9, 4.6));
      const C = camT(t, lerp(705, 690, seg(t, 1.42, 5.12)), lerp(1215, 1200, seg(t, 1.42, 5.12)), lerp(2.0, 2.15, seg(t, 1.42, 5.12)));
      const kHand = atb(...K0, redraw(1, KR, SKR, 'ruddy', 1.75), brS(t, .4, .9));
      return `<g transform="${C.tf}">${lights(C.v, RIG_DAIS(t))}${daisBack(t, { blur: 'dofLight' })}
        ${kingFig(t, { look: lerp(7, 9, lean), lookY: 1, turn: .2 + .1 * lean, lid: lidB(t, .25 - .2 * lean, [2.1, 4.4]), smirk: lerp(.3, -.2, lean), bIn: -4 * lean, bOut: 4 * lean, tilt: 3 * lean, armR: KR })}
        ${boyFig(t, { armL: C0.armL, armR: C0.armR, look: lerp(-6, 0, up), lookY: lerp(2, -2, up), lid: lidB(t, .5 * up, [1.9]), bIn: 3, tilt: -2 * up }, { top: C0.top })}
        ${daisTable(items(t), { front: outlined(kHand) })}</g>`;
    } },

  // 3 "Every bite." — close: he bites into the bread
  { at: 5.12,
    draw(v, t) {
      const to = easeInOut(seg(t, 5.2, 5.5)), off = easeInOut(seg(t, 5.62, 5.85)), bit = t > 5.58;
      const p = lerp2(lerp2([-150, -880], [-46, -1012], to), [-150, -830], off);
      const A = tArm(-1, p, 'grip', { bend: 1 }), fc = fistAt(A, 1.05);
      const bread = `<g transform="translate(${F1(fc[0] + 34)} ${F1(fc[1] - 26)}) rotate(-24)">${breadLoaf(0, 0, .62)}${bit ? `<path d="M-60 -26 c10 8 4 22 14 30 c-6 12 -18 14 -22 4 Z" fill="#e8d6b0"/><circle cx="-50" cy="-6" r="2" fill="#c8a878"/>` : ''}</g>`;
      const chew = t > 5.7 ? .1 + .12 * Math.abs(Math.sin((t - 5.7) * 12)) : 0;
      const C = camT(t, 838, 1236, lerp(4.4, 4.6, seg(t, 5.12, 6.15)), { r: 2 });
      return `<g transform="${C.tf}">${lights(C.v, RIG_DAIS(t))}${daisBack(t, { blur: 'dofHeavy' })}
        ${boyFig(t, { armL: A, armR: tHang(1), look: -2, lookY: 3 * (1 - to), lid: lerp(.1, .6, to * (1 - off)), talk: chew, bIn: 2 }, { top: bread + redraw(-1, A, SKBt, 'fair', 1.05) })}
        ${daisTable(items(t, { kcup: 0 }))}</g>`;
    } },

  // 4 "Every cup." — a step back: he lifts a pewter cup and drinks
  { at: 6.15,
    draw(v, t) {
      const up = easeInOut(seg(t, 6.22, 6.5)) * (1 - easeInOut(seg(t, 6.9, 7.15)));
      const A = tArm(1, lerp2([150, -760], [52, -968], up), 'grip', { bend: -1 }), fc = fistAt(A, 1.05);
      const cupS = pewterCup(fc[0] - 8, fc[1] - 52, .62, { tilt: -14 * up, wine: .6 });
      const C = camT(t, 822, 1215, lerp(2.9, 3.0, seg(t, 6.15, 7.18)), { r: -2 });
      return `<g transform="${C.tf}">${lights(C.v, RIG_DAIS(t))}${daisBack(t, { blur: 'dof' })}
        ${boyFig(t, { armL: tHang(-1), armR: A, look: 2, lookY: -2 * up, lid: lidB(t, .9 * up, []), talk: 0, bIn: 2 + 3 * up }, { top: cupS + redraw(1, A, SKBt, 'fair', 1.05) })}
        ${daisTable(items(t, { kcup: 0 }))}</g>`;
    } },

  // 5 "If you live, he eats. If you drop… he doesn't." — the king seizes the roast and tears into it, grinning; then he stops
  //   chewing, his eyes come to us (the camera pushes in), and on "doesn't" the meat drops from his hand
  { at: 7.18,
    draw(v, t) {
      const grab = easeInOut(seg(t, 7.3, 7.75)), toM = easeInOut(seg(t, 7.95, 8.4)) * (1 - easeInOut(seg(t, 8.6, 8.95)) * .45), drop = t > 10.08;
      const hand = drop ? 'back' : 'grip', P0 = [-40, -706], P1 = [-160, -790], P2 = [-128, -860];
      const tgt = grab < 1 ? lerp2(P0, P1, grab) : lerp2(P1, P2, toM);
      const KL = aim(kArm2(-1, tgt, hand, { bend: 1, spread: drop ? .6 : 0 }), drop ? 70 : 40), fc = fistAt(KL, 1.75);
      const fall = drop ? (t - 10.08) : 0, legY = fall > 0 ? 4200 * fall * fall : 0;
      const leg = grab > .5 ? `<g transform="translate(0 ${F1(legY)})">${roastLeg(fc[0] + 42, fc[1] - 74, .5, 30, t > 8.42 ? 1 : 0)}</g>` : '';
      const chew = t > 8.5 && t < 9.1 ? .14 + .14 * Math.abs(Math.sin((t - 8.5) * 11)) : 0;
      const stop = easeInOut(seg(t, 9.05, 9.5)), push = easeInOut(seg(t, 9.05, 10.5));
      const C = camT(t, lerp(540, 556, push), lerp(1250, 1196, push), lerp(2.55, 4.3, push), { r: lerp(0, -2, push) });
      return `<g transform="${C.tf}">${lights(C.v, RIG_DAIS(t))}${daisBack(t, { blur: 'dof' })}
        ${kingFig(t, { armL: KL, armR: kHang(1), look: lerp(-3, 0, stop), lookY: lerp(4, 0, stop), turn: lerp(-.1, 0, stop), smirk: lerp(1.0, -.3, stop), lid: lidB(t, lerp(.35, .1, stop), [7.2]), laugh: .35 * bell(t, 7.6, 8.2),
          talk: chew, bIn: lerp(0, -5, stop), bOut: lerp(0, 5, stop) }, leg + redraw(-1, KL, SKR, 'ruddy', 1.75))}
        ${daisTable(items(t, { leg: grab > .5 ? 0 : 1 }))}</g>`;
    } },

  // 6 "The boy before you lasted four months." — the floor beneath the table: a cup falls, rolls, the wine spreads
  { at: 10.68,
    draw(v, t) {
      const C = camT(t, lerp(600, 520, seg(t, 10.68, 13.05)), lerp(1300, 1330, seg(t, 10.68, 13.05)), lerp(1.15, 1.3, seg(t, 10.68, 13.05)), { r: 2 });
      return `<g transform="${C.tf}">${lights(C.v, RIG_FLOOR(t))}${floorLow(t, 10.82)}</g>`;
    } },

  // 7 "You've lasted three years… and no one knows how." — his cell: he scratches one more mark among hundreds; then he turns
  //   to us, a small, secret smile
  { at: 13.05,
    draw(v, t) {
      const BC = [660, 2121, .95], b = brS(t, 1.1, 1.2);
      const k = clamp((t - 13.25) / .45), st = k - Math.floor(k), n = Math.floor(k), scr = t < 14.6 ? (n < 3 ? easeInOut(Math.min(1, st * 1.4)) : 1) : 1;
      const off = easeInOut(seg(t, 14.7, 15.1)), x0 = -150 + 8 * Math.min(n, 2);
      const tip = lerp2([x0, -1040], [x0 - 4, -980], scr);
      const A = off < 1 ? tArm(-1, lerp2(tip, [-122, -716], off), 'grip', { bend: 1 }) : tHang(-1);
      const fc = fistAt(A, 1.05), nail = off < .9 ? `<path d="M${F1(fc[0] - 4)} ${F1(fc[1] - 2)} L${F1(fc[0] - 42)} ${F1(fc[1] - 6)} L${F1(fc[0] - 4)} ${F1(fc[1] + 6)} Z" fill="#5a5a60"/>` : '';
      const turn = easeInOut(seg(t, 15.0, 15.4)), smile = easeInOut(seg(t, 15.35, 15.9));
      const marks = [0, 1, 2].filter(i => i < n || (i === n && t < 14.6)).map(i => { const xx = -150 + 8 * i, q = i < n ? 1 : scr; const w0 = toWorld([xx - 44, -1040], ...BC, b), w1 = toWorld([xx - 48, lerp(-1040, -980, q)], ...BC, b);
        return `<path d="M${F1(w0[0])} ${F1(w0[1])} L${F1(w1[0])} ${F1(w1[1])}" stroke="#e0d8c8" stroke-width="3.4" stroke-linecap="round" opacity=".75"/>`; }).join('');
      const pan = easeInOut(seg(t, 14.55, 15.6));
      const C = camT(t, lerp(250, 664, pan), lerp(1000, 1104, pan), lerp(1.95, 2.7, pan), { hh: .7 });
      return `<g transform="${C.tf}">${lights(C.v, RIG_CELL(t))}${cellRoom(t, { blur: pan > .5 ? 'dofLight' : null })}${marks}
        ${outlined(manb(...BC, TASTER, { armL: A, armR: tHang(1), breath: b, bust: 0, look: lerp(-8, 1, turn), lookY: lerp(-1, 0, turn), turn: lerp(-.45, 0, turn), smirk: lerp(-.1, .9, smile), lid: lidB(t, lerp(.2, .35, smile), [13.9]), bIn: lerp(4, -2, smile), bOut: lerp(0, 3, smile), tilt: lerp(-4, 2, turn) })
          + atb(...BC, nail + redraw(-1, A, SKBt, 'fair', 1.05), b))}</g>`;
    } },

  // 8 "Then one night, at the great feast," — the great hall from its far end: the nobles at their tables, the high table
  //   beyond; the camera cranes down and pushes toward the king
  { at: 16.4,
    draw(v, t) {
      const p = easeInOut(seg(t, 16.4, 18.72)), map = ([x, y]) => [250 + .54 * x, 330 + .54 * y];
      const C = camT(t, lerp(690, 700, p), lerp(900, 1110, p), lerp(.86, 1.12, p));
      const V = window.__VIEW, Z = window.__Z; window.__VIEW = [(V[0] - 250) / .54, (V[1] - 330) / .54, (V[2] - 250) / .54, (V[3] - 330) / .54]; window.__Z = Z * .54;
      const dais = daisAll(t); window.__VIEW = V; window.__Z = Z;
      const rig = RIG_DAIS(t, { map }); rig.lights = rig.lights.map(L => ({ ...L, rad: L.rad * .6 }));
      rig.lights.push(...[1240, 1520].map((y, i) => ({ pos: [540, y - 40, 200], col: '#ffdcb4', int: .9, rad: 700, shin: 20 })));
      return `<g transform="${C.tf}">${lights(C.v, rig)}${hallEstablish(t, dais)}</g>`;
    } },

  // 9 "the king's wine tastes wrong." — close: he drinks from the king's goblet… and stops
  { at: 18.72,
    draw(v, t) {
      const wrong = easeOut(seg(t, 19.95, 20.15)), C0 = boyCup([0, -1006], .8, { tilt: 5 * (1 - wrong), wine: .7 });
      const C = camT(t, 830, lerp(1238, 1232, seg(t, 18.72, 20.62)), lerp(4.3, 4.6, seg(t, 18.72, 20.62)) + .25 * wrong);
      return `<g transform="${C.tf}">${lights(C.v, RIG_DAIS(t))}${daisBack(t, { blur: 'dofHeavy' })}
        ${boyFig(t, { armL: C0.armL, armR: C0.armR, look: lerp(0, -1, wrong), lookY: lerp(-3, 4, wrong), lid: lerp(.55, 0, wrong), bIn: lerp(2, 9, wrong), bOut: lerp(0, 5, wrong), tilt: -2 }, { top: C0.top })}
        ${daisTable(items(t, { kcup: 0 }))}</g>`;
    } },

  // 10 "Bitter." — his eyes, very close: the brows pinch, the eyes drop to the cup
  { at: 20.62,
    draw(v, t) {
      const q = easeOut(seg(t, 20.66, 20.9)), C0 = boyCup([0, -1006], .8, { wine: .7 });
      const C = camT(t, 830, 1214, lerp(8.0, 8.4, seg(t, 20.62, 21.18)), { r: -3 });
      return `<g transform="${C.tf}">${lights(C.v, RIG_DAIS(t))}${daisBack(t, { blur: 'dofHeavy' })}
        ${boyFig(t, { armL: C0.armL, armR: C0.armR, look: -1, lookY: lerp(4, 7, q), lid: lerp(0, .35, q), bIn: lerp(9, -6, q), bOut: lerp(5, 7, q), tilt: -2 }, { top: C0.top })}</g>`;
    } },

  // 11 "Like crushed almonds." — inside the goblet: a pale, oily film turning on the wine, flecks drifting in it
  { at: 21.18,
    draw(v, t) {
      const C = camT(t, 540, 960, lerp(1.05, 1.3, seg(t, 21.18, 22.55)), { r: lerp(0, 8, seg(t, 21.18, 22.55)), hh: .5 });
      return `<g transform="${C.tf}">${lights(C.v, RIG_WINE(t))}${wineMacro(t, 21.18)}</g>`;
    } },

  // 12 "The whole hall is watching you." — the hall, from the high table: one by one the nobles turn to look at us
  { at: 22.55,
    draw(v, t) {
      return naveShot(t, (i, key) => { const q = easeInOut(seg(t, 22.6 + key * .07, 23.0 + key * .07)), s0 = (key % 2 ? .4 : -.4);
        return { turn: lerp(s0, 0, q), look: lerp(s0 * 18, 0, q), lookY: 0, lid: lidB(t, lerp(.3, 0, q), [23.9 + i * .05]), bIn: 5 * q, bOut: 2 * q, smirk: lerp(.6, -.2, q), talk: q < .5 ? .1 * Math.abs(Math.sin(t * 9 + i)) : 0 }; },
        [540, lerp(1280, 1300, seg(t, 22.55, 24.38)), lerp(1.0, 1.08, seg(t, 22.55, 24.38))]);
    } },

  // 13 "Except the queen." — she alone isn't looking at us; her eyes are on the king's cup
  { at: 24.38,
    draw(v, t) {
      const C = camT(t, 1122, 1226, lerp(2.9, 3.0, seg(t, 24.38, 25.38)));
      return `<g transform="${C.tf}">${lights(C.v, RIG_DAIS(t))}${daisBack(t, { blur: 'dof' })}
        ${queenFig(t, { look: -8, lookY: 4, turn: -.25, lid: lidB(t, .35, []), smirk: .15, bIn: 0, bOut: 2 })}${daisTable(items(t))}</g>`;
    } },

  // 14 "She's staring at the king's cup… waiting." — closer: the gold cup soft in the foreground, her eyes fixed on it
  { at: 25.38,
    draw(v, t) {
      const nar = easeInOut(seg(t, 27.1, 27.6));
      const C = camT(t, 1098, 1216, lerp(4.0, 4.6, easeInOut(seg(t, 25.38, 27.82))), { r: -3 });
      return `<g transform="${C.tf}">${lights(C.v, RIG_DAIS(t))}${daisBack(t, { blur: 'dofHeavy' })}
        ${queenFig(t, { look: -9, lookY: 4, turn: -.25, lid: lerp(.35, .55, nar), smirk: lerp(.15, .45, nar), lipOpen: .15 * nar, bIn: -2 * nar, bOut: 3 })}
        ${dofG('dofLight', goblet(1000, 1300, .95, { wine: .7, tilt: -6 }))}</g>`;
    } },

  // 15 "Spit it out, and you're accusing the queen." — his cheeks full of the wine; his eyes go to her, then to the king
  { at: 27.82,
    draw(v, t) {
      const lk = kf(t, [[27.82, 0], [28.3, -1], [29.1, -1], [29.35, 8], [29.85, 8], [30.05, -8]]);
      const C0 = boyCup([0, -900], .8, { wine: .5 }), sh = tremble(t, .8);
      const C = camT(t, 830 + sh * .3, 1232, lerp(4.6, 5.0, seg(t, 27.82, 30.25)), { r: 4 });
      return `<g transform="${C.tf}">${lights(C.v, RIG_DAIS(t))}${daisBack(t, { blur: 'dofHeavy' })}
        ${boyFig(t, { armL: C0.armL, armR: C0.armR, puff: 1, look: lk, lookY: lk === -1 ? 5 : 0, lid: lidB(t, 0, [28.9]), bIn: 10, bOut: 6, smirk: -.2, sweat: 1, sweatY: 30 * seg(t, 27.9, 30.2), tilt: sh * .5 }, { top: C0.top })}</g>`;
    } },

  // 16 "You'll hang by morning." — dawn: an empty rope turning on the gallows
  { at: 30.25,
    draw(v, t) {
      const C = camT(t, 660, lerp(860, 900, seg(t, 30.25, 31.58)), lerp(1.0, 1.28, easeInOut(seg(t, 30.25, 31.58))));
      return `<g transform="${C.tf}">${lights(C.v, RIG_GALLOWS(t))}${gallowsDawn(t)}</g>`;
    } },

  // 17 "So you smile… and you drink." — a forced smile around the wine; then he swallows, eyes shut
  { at: 31.58,
    draw(v, t) {
      const sm = easeInOut(seg(t, 31.9, 32.3)), gulp = easeInOut(seg(t, 32.85, 33.15)), dip = bell(t, 32.85, 33.3);
      const C0 = boyCup([0, -900 + 6 * dip], .8, { wine: .5 });
      const C = camT(t, 830, 1230, lerp(4.8, 5.0, seg(t, 31.58, 33.42)));
      return `<g transform="${C.tf}">${lights(C.v, RIG_DAIS(t))}${daisBack(t, { blur: 'dofHeavy' })}
        ${boyFig(t, { armL: C0.armL, armR: C0.armR, puff: 1 - gulp, smirk: lerp(-.2, 1.2, sm) * (1 - .6 * gulp), look: 0, lookY: 1, lid: Math.max(lerp(0, .3, sm), 1.9 * dip), bIn: lerp(10, 4, sm), bOut: 6, sweat: 1, sweatY: 40, tilt: 2 * dip }, { at: [B0[0], B0[1] + 8 * dip, B0[2]], top: C0.top })}</g>`;
    } },

  // 18 "The queen leans forward… waiting for you to fall." — she leans in over the table, eyes wide, a thin smile
  { at: 33.42,
    draw(v, t) {
      const lean = easeInOut(seg(t, 33.6, 34.7)), QL = qRest(-1, 10, -14), QR = qRest(1, 10, -14);
      const C = camT(t, 1100, lerp(1236, 1250, lean), lerp(3.1, 3.7, easeInOut(seg(t, 33.42, 36.18))), { r: 3 });
      return `<g transform="${C.tf}">${lights(C.v, RIG_DAIS(t))}${daisBack(t, { blur: 'dof' })}
        ${queenFig(t, { armL: { ...QL, hand: 'back', curl: .4 * lean }, armR: { ...QR, hand: 'back', curl: .4 * lean }, look: -6, lookY: 1, turn: -.15, lid: lidB(t, lerp(.3, 0, lean), [35.6]), smirk: lerp(.15, .55, lean), lipOpen: .25 * lean, bIn: 5 * lean, bOut: 4 }, '', { lean })}
        ${daisTable(items(t))}</g>`;
    } },

  // 19 "But you don't." — he stands straight and sets the goblet down: a thud on the board
  { at: 36.18,
    draw(v, t) {
      const down = easeIn(seg(t, 36.3, 36.6)), rel = easeOut(seg(t, 36.75, 37.1));
      const c = lerp2([0, -940], [24, -878], down), C0 = boyCup(c, .8, { wine: .4, grip: .45 * (1 - rel) });
      const L = rel > 0 ? { ...tArm(-1, lerp2(C0.armL.wr, [-122, -716], rel), 'back', { bend: 1 }), hrot: C0.armL.hrot * (1 - rel) } : C0.armL;
      const R = rel > 0 ? { ...tArm(1, lerp2(C0.armR.wr, [122, -716], rel), 'back', { bend: -1 }), hrot: C0.armR.hrot * (1 - rel) } : C0.armR;
      const top = goblet(c[0], c[1], .8, { wine: .4 }) + (rel < .3 ? redraw(-1, L, SKBt, 'fair', 1.05) + redraw(1, R, SKBt, 'fair', 1.05) : '');
      const C = camT(t, 830, lerp(1262, 1256, down), 2.7, { sy: 5 * decay(t, 36.6, .08) * Math.sin(t * 80) });
      return `<g transform="${C.tf}">${lights(C.v, RIG_DAIS(t))}${daisBack(t, { blur: 'dof' })}
        ${boyFig(t, { armL: L, armR: R, look: 0, lookY: 0, lid: .1, smirk: .1, bIn: 0, bOut: 0, tilt: 0 }, { top })}
        ${daisTable(items(t, { kcup: 0 }))}</g>`;
    } },

  // 20 "Because every morning for three years, you've swallowed one drop of poison." — dawn in his cell. (a) he holds a
  //   vial up to the window light and thumbs out the cork; (b) close on his mouth: the vial tips above his tongue, ONE drop
  //   falls; (c) he shuts his eyes hard and shudders
  { at: 37.26,
    draw(v, t) {
      const BS = [540, 2231, .95], b = brS(t, 1.1, 1.2);
      const fig = (pose, A, top) => outlined(manb(...BS, TASTER, { armL: tHang(-1, 4, -8), armR: A, breath: b, bust: 1, ...pose }) + atb(...BS, top + redraw(1, A, SKBt, 'fair', 1.05), b));
      if (t < 39.3) {
        const up = easeInOut(seg(t, 37.4, 38.1)), A = tArm(1, lerp2([150, -760], [150, -1140], up), 'grip', { bend: -1 }), fc = fistAt(A, 1.05);
        const vl = vial(fc[0] - 4, fc[1] - 8, 1.15, { rot: 0, cork: t < 38.6 ? 1 : 0, fill: .55 });
        const cp = t - 38.6, cork = cp > 0 && cp < .5 ? `<rect x="${F1(fc[0] - 12 + cp * 260)}" y="${F1(fc[1] - 64 - cp * 420 + cp * cp * 1100)}" width="16" height="16" rx="3" fill="#a8783e" transform="rotate(${F1(cp * 700)} ${F1(fc[0] - 4 + cp * 260)} ${F1(fc[1] - 56 - cp * 420 + cp * cp * 1100)})"/>` : '';
        const C = camT(t, lerp(610, 590, seg(t, 37.26, 39.3)), lerp(1180, 1160, seg(t, 37.26, 39.3)), lerp(2.25, 2.45, easeInOut(seg(t, 37.26, 39.3))));
        return `<g transform="${C.tf}">${lights(C.v, RIG_CELL(t, { dawn: 1 }))}${cellRoom(t, { dawn: 1, blur: 'dofLight' })}
          ${fig({ look: 5, lookY: -6, tilt: 4, lid: lidB(t, .15, [38.3]), bIn: 3, bOut: 1, smirk: -.1 }, A, vl + cork)}${cot(1520)}</g>`;
      }
      if (t < 40.72) {
        const tip = easeInOut(seg(t, 39.35, 39.75)), tongue = easeInOut(seg(t, 39.6, 39.95));
        const A = tArm(1, lerp2([150, -900], [40, -1094], tip), 'grip', { bend: -1 }), fc = fistAt(A, 1.05), vr = lerp(0, 205, tip) * Math.PI / 180;
        const vl = vial(fc[0] - 2, fc[1] + 4, 1.15, { rot: lerp(0, 205, tip), cork: 0, fill: .5 });
        const m = [fc[0] - 2 + Math.sin(vr) * 36 * 1.15, fc[1] + 4 - Math.cos(vr) * 36 * 1.15], dT = t - 40.42, form = clamp((t - 40.05) / .37);
        const drop = dT < 0 ? (form > 0 ? `<ellipse cx="${F1(m[0])}" cy="${F1(m[1] + 6 * form)}" rx="${F1(3 + 3 * form)}" ry="${F1(3 + 5 * form)}" fill="#9ae0b8"/>` : '')
          : dT < .2 ? `<path d="M${F1(m[0])} ${F1(lerp(m[1], -990, dT / .2) - 14)} C${F1(m[0] + 7)} ${F1(lerp(m[1], -990, dT / .2))} ${F1(m[0] + 5)} ${F1(lerp(m[1], -990, dT / .2) + 8)} ${F1(m[0])} ${F1(lerp(m[1], -990, dT / .2) + 8)} C${F1(m[0] - 5)} ${F1(lerp(m[1], -990, dT / .2) + 8)} ${F1(m[0] - 7)} ${F1(lerp(m[1], -990, dT / .2))} ${F1(m[0])} ${F1(lerp(m[1], -990, dT / .2) - 14)} Z" fill="#9ae0b8"/>`
          : dT < .35 ? `<ellipse cx="${F1(m[0])}" cy="-988" rx="${F1(10 * (1 - (dT - .2) / .15) + 2)}" ry="3" fill="#9ae0b8" opacity="${(1 - (dT - .2) / .15).toFixed(2)}"/>` : '';
        const C = camT(t, 540 + 10 * .95, 2231 - 1030 * .95, lerp(6.2, 6.7, seg(t, 39.3, 40.72)), { hh: .4 });
        return `<g transform="${C.tf}">${lights(C.v, RIG_CELL(t, { dawn: 1 }))}${cellRoom(t, { dawn: 1, blur: 'dofHeavy' })}
          ${fig({ look: 0, lookY: -7, tilt: 0, talk: .62 * tongue, tongue, lid: .1, bIn: 6, bOut: 2 }, A, vl + `<g>${drop}</g>`)}</g>`;
      }
      const wince = easeOut(seg(t, 40.74, 40.95)), shiver = wince * tremble(t, 2.6) * (1 - seg(t, 41.2, 41.45));
      const uu = easeInOut(seg(t, 40.72, 41.1)), A = tArm(1, [lerp(60, 150, uu) + 60 * Math.sin(Math.PI * uu), lerp(-1020, -800, uu)], 'grip', { bend: -1 }), fc = fistAt(A, 1.05);
      const C = camT(t, 552 + shiver * .5, 1190, lerp(3.6, 3.75, seg(t, 40.72, 41.45)), { r: -2 });
      return `<g transform="${C.tf}">${lights(C.v, RIG_CELL(t, { dawn: 1 }))}${cellRoom(t, { dawn: 1, blur: 'dofHeavy' })}
        <g transform="translate(${F1(shiver)} 0)">${fig({ look: 0, lookY: 2, tilt: 3, lid: 1.8 * wince, bIn: -8 * wince, bOut: 7 * wince, grit: .75 * wince, talk: 0 }, A, vial(fc[0] - 2, fc[1] - 6, 1.15, { rot: 20, cork: 0, fill: .45 }))}</g></g>`;
    } },

  // 21 "Just enough to survive tonight." — back at the feast: steady now; his eyes slide to the queen
  { at: 41.45,
    draw(v, t) {
      const sl = easeInOut(seg(t, 42.55, 43.0)), C0 = boyCup([0, -900], .8, { wine: .4 });
      const C = camT(t, 830, 1230, lerp(4.4, 4.7, seg(t, 41.45, 43.25)));
      return `<g transform="${C.tf}">${lights(C.v, RIG_DAIS(t))}${daisBack(t, { blur: 'dofHeavy' })}
        ${boyFig(t, { armL: C0.armL, armR: C0.armR, look: lerp(0, 8, sl), lookY: 0, turn: .1 * sl, lid: lidB(t, .25, [41.8]), smirk: lerp(.1, .45, sl), bIn: -2, bOut: 2 }, { top: C0.top })}
        ${daisTable(items(t, { kcup: 0 }))}</g>`;
    } },

  // 22 "You turn to the queen." — the two of them: he turns to her, and she stiffens
  { at: 43.25,
    draw(v, t) {
      const tn = easeInOut(seg(t, 43.3, 43.8)), C0 = boyCup([0, -900], .8, { wine: .4 });
      const C = camT(t, 972, 1262, lerp(2.0, 2.08, seg(t, 43.25, 44.35)));
      return `<g transform="${C.tf}">${lights(C.v, RIG_DAIS(t))}${daisBack(t, { blur: 'dofLight' })}
        ${boyFig(t, { armL: C0.armL, armR: C0.armR, look: 8, turn: lerp(.1, .45, tn), lid: .2, smirk: .3, bIn: 0 }, { top: C0.top })}
        ${queenFig(t, { look: lerp(-6, -9, tn), lookY: lerp(4, 1, tn), turn: -.25, lid: lerp(.4, 0, tn), smirk: lerp(.4, 0, tn), bIn: 4 * tn, bOut: 3 })}
        ${daisTable(items(t))}</g>`;
    } },

  // 23 "My lady… this wine is too fine for a servant." — he bows his head and holds the goblet out to her
  { at: 44.35,
    draw(v, t) {
      const off = easeInOut(seg(t, 45.9, 46.7)), bow = bell(t, 44.4, 45.3);
      const c = lerp2([0, -900], [0, -884], off), C0 = boyCup(c, lerp(.8, .96, off), { wine: .4 });
      const C = camT(t, 834, 1258, lerp(3.2, 3.35, seg(t, 44.35, 47.3)));
      return `<g transform="${C.tf}">${lights(C.v, RIG_DAIS(t))}${daisBack(t, { blur: 'dof' })}
        ${boyFig(t, { armL: C0.armL, armR: C0.armR, look: 8, lookY: 2 * bow, turn: .45, lid: lidB(t, .2 + .4 * bow, [46.9]), smirk: .35, talk: talkW(t, 44.4, 47.35), bIn: -1, tilt: 5 * bow }, { top: C0.top })}
        ${daisTable(items(t, { kcup: 0 }))}</g>`;
    } },

  // 24 "The rest is yours." — the goblet set down before her; the blood leaves her face
  { at: 47.3,
    draw(v, t) {
      const slide = easeOut(seg(t, 47.3, 47.6)), pale = easeInOut(seg(t, 47.5, 48.3));
      const C = camT(t, 1100, 1250, lerp(3.4, 3.6, seg(t, 47.3, 48.62)));
      return `<g transform="${C.tf}">${lights(C.v, RIG_DAIS(t))}${daisBack(t, { blur: 'dof' })}
        ${queenFig(t, { look: -2, lookY: lerp(2, 7, pale), turn: -.1, lid: 0, smirk: lerp(0, -.6, pale), lipOpen: .3 * pale, pale: .75 * pale, bIn: 8 * pale, bOut: 2 })}
        ${daisTable(items(t, { qcup: [lerp(1010, 1050, slide), 1336, 3 * Math.sin(t * 14) * decay(t, 47.6, .2)] }))}</g>`;
    } },

  // 25 "The king laughs and raises his cup. 'Drink, my love!'" — the king roars with laughter, lifts his cup to her
  { at: 48.62,
    draw(v, t) {
      const lg = bell(t, 48.8, 50.4), raise = easeInOut(seg(t, 49.6, 50.3)), toQ = easeInOut(seg(t, 50.7, 51.2));
      const KR = kArm2(1, lerp2(lerp2([176, -700], [236, -1170], raise), [270, -1070], toQ), 'grip', { bend: -1 }), fc = fistAt(KR, 1.75);
      const cupS = pewterCup(fc[0] - 6, fc[1] - 60, .9, { tilt: lerp(0, 18, toQ), wine: .7 });
      const shake = Math.sin(t * 22) * 4 * lg;
      const C = camT(t, lerp(560, 600, raise), lerp(1170, 1150, raise), lerp(2.6, 2.75, seg(t, 48.62, 51.92)));
      return `<g transform="${C.tf}">${lights(C.v, RIG_DAIS(t))}${daisBack(t, { blur: 'dof' })}
        <g transform="translate(0 ${F1(shake)})">${kingFig(t, { armR: KR, armL: kHang(-1), laugh: lg, lid: Math.max(lidB(t, .1, [48.7]), 1.1 * lg), smirk: 1.2, tilt: lerp(-5 * lg, 4, toQ), turn: lerp(0, .3, toQ), look: lerp(0, 9, toQ),
          talk: talkW(t, 50.75, 51.85, .5), bIn: 2, bOut: 6 }, cupS + redraw(1, KR, SKR, 'ruddy', 1.75))}</g>
        ${daisTable(items(t, { kcup: 0 }))}</g>`;
    } },

  // 26 "And now… the whole hall is watching her." — the hall turns to her as one; then her face, the goblet in her hands
  { at: 51.92,
    draw(v, t) {
      if (t < 52.78) return naveShot(t, (i, key) => { const q = easeInOut(seg(t, 51.95 + key * .05, 52.3 + key * .05));
        return { turn: lerp(0, -.35, q), look: lerp(0, -9, q), lookY: 0, lid: 0, bIn: 6, bOut: 3, smirk: -.2 }; }, [540, 1300, 1.1]);
      const p = easeInOut(seg(t, 52.78, 55.15)), dart = kf(t, [[52.8, -2], [53.4, -2], [53.6, -9], [54.1, -9], [54.3, 6], [54.8, 6], [55.0, 0]]);
      const gL = [0, -905];
      const QL = aim(qArm(-1, wristFor([gL[0] - 20, gL[1] + 32], -4, 64 * 1.25), 'back', { bend: 1, curl: .45 }), -4);
      const QR = aim(qArm(1, wristFor([gL[0] + 20, gL[1] + 32], 184, 64 * 1.25), 'back', { bend: -1, curl: .45 }), 184);
      const gl = goblet(gL[0], gL[1], .8, { wine: .7, tilt: 1.5 * Math.sin(t * 17) });
      const C = camT(t, 1086, 1226, lerp(3.6, 4.5, p), { r: lerp(0, -3, p) });
      return `<g transform="${C.tf}">${lights(C.v, RIG_DAIS(t))}${daisBack(t, { blur: 'dofHeavy' })}
        ${queenFig(t, { armL: QL, armR: QR, look: dart, lookY: 1, turn: -.05, lid: 0, smirk: -.7, lipOpen: .35, pale: .8, bIn: 10, bOut: 4, sweat: 1, sweatY: 50 * p }, gl + redraw(-1, QL, SKQ, 'porcelain', 1.25) + redraw(1, QR, SKQ, 'porcelain', 1.25))}
        ${daisTable(items(t, { kcup: 0 }))}</g>`;
    } },

  // 27 the boy again, watching her, the ghost of a smile — the first frame of the film
  { at: 55.15,
    draw(v, t) {
      const p = easeInOut(seg(t, 55.15, 55.55));
      return boyECU(t, { ...OPEN_POSE, look: lerp(8, OPEN_POSE.look, p), smirk: lerp(.4, OPEN_POSE.smirk, p) }, [830, 1222, 6.0]);
    } },
];

const TRANS = [
  [13.05, 12.95, 13.17, 'black'],
  [37.26, 37.15, 37.37, 'black'],
];

TL = makeTimeline({ shots: SHOTS, trans: TRANS, words: WORDS, strong: STRONG, captions: 'none', fps: 30, duration: DUR });
render(0);
