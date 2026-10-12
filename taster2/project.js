// "The Taster" v2 — 55.8 s, 1080x1920, 30 fps, no captions. Relit (flat + normal passes → deferred lights + post).
// Every shot moves: snap zooms on the key words, whips and zoom-throughs between scenes (no crossfades), lightning on
// the beats, a dolly-zoom on "wrong". The last frame is the first frame (the boy's eyes over the rim of the cup).

// ---------- camera: a function of time; its velocity becomes motion blur (180° shutter) ----------
function camF(t, fn, mbK = 1) {
  const c = fn(t), c0 = fn(t - 1 / 60), C = camT(t, c[0], c[1], c[2], c[3] || {});
  if (mbK) window.__MBk[window.__shot] = { dx: (c0[0] - c[0]) * c[2] * mbK, dy: (c0[1] - c[1]) * c[2] * mbK, z: (c[2] - c0[2]) / c[2] * mbK, cx: 540, cy: 960 };
  return C;
}
const expo = p => p <= 0 ? 0 : p >= 1 ? 1 : 1 - Math.pow(2, -10 * p);
const snap = (t, t0, d = .22) => expo(seg(t, t0, t0 + d));
const ob = p => { p = clamp(p); return 1 + 2.4 * Math.pow(p - 1, 3) + 1.4 * Math.pow(p - 1, 2); };      // a small overshoot
const kick = (t, t0, d = .5) => t < t0 ? 0 : Math.exp(-(t - t0) / (d * .3)) * Math.sin((t - t0) * 38);  // impact jolt
const SHK = (t, hits) => { const [x, y] = shakeXY(t, hits); return { sx: x, sy: y }; };
const lerp3 = (a, b, p) => a.map((v, i) => lerp(v, b[i], p));
const flashK = (op, col = '#fff6e8') => { if (!window.__FLASH || window.__FLASH.op < op) window.__FLASH = { op, col }; };
const ab = v => { window.__CA = Math.max(window.__CA || 0, v); };

// ---------- placements on the dais (world) ----------
const K0 = [560, 1864, .62], B0 = [830, 1860, .6], Q0 = [1100, 1850, .6];
const SKB2 = [SKIN_TONES.fair, 'fair'], SKR2 = [SKIN_TONES.ruddy, 'ruddy'], SKQ2 = [SKIN_TONES.porcelain, 'porcelain'];
// a figure at P = [x, y, s], leaning `lean` degrees about its waist; `top` is drawn in its own local coordinates
function fig(ch, t, P, pose, { top = '', lean = 0, dx = 0, dy = 0, ph = 0, rate = 1, ds = 0 } = {}) {
  const [x, y, s0] = P, s = s0 * (1 + ds), b = brS(t, ph, rate), X = x + dx, Y = y + dy;
  const inner = manb(X, Y, s, ch, { breath: b, ...pose }) + (top ? atb(X, Y, s, top, b) : '');
  return outlined(lean ? `<g transform="rotate(${F1(lean)} ${F1(X)} ${F1(Y - 640 * s)})">${inner}</g>` : inner);
}
const boy = (t, pose, o = {}) => fig(TASTER, t, o.at || B0, { bust: 1, ...pose }, { ph: 1.1, rate: 1.2, ...o });
const king = (t, pose, o = {}) => fig(KING, t, o.at || K0, pose, { ph: .4, rate: .9, ...o });
const queen = (t, pose, o = {}) => fig(QUEEN, t, o.at || Q0, pose, { ph: 2.1, rate: .8, ...o });
// the boy's goblet poses (right hand, k = +1): at the chest, at the lips (rim on the mouth), held out to the queen
const LIPS = [2, -1012];
const gobChest = (dy = 0, dx = 0) => gripArm(tArm, 1, [34 + dx, -846 + dy], { hs: 1.05, bend: 'down', upright: 0 });
const gobLips = (tiltK = 1, lip = LIPS) => gripTo(tArm, 1, [lip[0] + 2, lip[1] - 4], { hs: 1.05, s: .8, gy: 120, py: 8, bend: 'down', upright: -38 * tiltK });
const gobBlend = (A0, A1, p) => p <= 0 ? A0 : p >= 1 ? A1 : { ...A1, el: lerp2(A0.el, A1.el, p), wr: lerp2(A0.wr, A1.wr, p), hrot: lerp(A0.hrot || 0, A1.hrot || 0, p), flip: p < .5 ? A0.flip : A1.flip };

// ---------- light rigs ----------
const fk = (t, i) => .93 + .07 * flkSeam(t, i);
const RIG_DAIS2 = (t, { k = 1, moon = 1, cold = 0, warm = 1, map = p => p, extra = [], bcx = 950 } = {}) => {
  const fl = storm(t), L = (p, o) => ({ ...o, pos: [...map(p), p[2]] }), wc = mix('#ffd9a8', '#c8ecd8', cold);
  return {
    lights: [
      L([300, 1180, 190], { col: wc, int: 1.3 * k * fk(t, 1) * warm, rad: 620, shin: 26 }), L([1360, 1180, 190], { col: wc, int: 1.2 * k * fk(t, 2) * warm, rad: 620, shin: 26 }),
      L([bcx, 1250, 230], { col: wc, int: .7 * k * fk(t, 3) * warm, rad: 470, shin: 28 }),
      L([830, 20, 460], { col: '#ffe2b8', int: 1.15 * k * warm, rad: 1300, shin: 22 }),
      L([830, 760, -320], { col: '#a8c0ff', int: (1.6 + 4.5 * fl) * moon, rad: 1000, shin: 28 }),
      L([260, 800, -300], { col: '#ff9098', int: (.9 + 2.2 * fl) * moon, rad: 720, shin: 24 }), L([1400, 800, -300], { col: '#74f0bc', int: (.9 + 2.2 * fl) * moon, rad: 720, shin: 24 }),
      L([-60, 700, 160], { col: '#ffd098', int: .55 * k, rad: 700, shin: 18 }), L([1720, 700, 160], { col: '#ffd098', int: .55 * k, rad: 700, shin: 18 }),
      L([830, 1400, 1800], { col: '#8a9cd0', int: .26 + .7 * fl, rad: 5000, shin: 12 }), ...extra,
    ],
    amb: '#2e3a58', ambGround: '#2a2220', ambInt: .26, bgLight: .5, exposure: 1.04, bloom: .46, bloomThresh: .72, emisGain: 2.0, normalStrength: .95, specScale: .28,
    vignette: .52, grain: .022, shadowTint: '#0e1e3a', highTint: '#ffe0b0', sat: 1.06, contrast: 1.14, ...(cold > .01 ? { tint: '#a8dcc0', tintAmt: .32 * cold } : {}),
    rays: { center: map([830, 640]), thresh: .42, srcRad: 440, samples: 40, step: .016, decay: .963, col: '#b8ccff', int: (.55 + 1.8 * fl) * moon },
  };
};
const RIG_NAVE2 = (t, { k = 1 } = {}) => ({
  lights: [
    { pos: [540, 120, 500], col: '#ffe4c4', int: 1.3 * k, rad: 1500, shin: 22 },
    ...[[200, 1440], [680, 1440], [340, 1810], [740, 1810]].map(([x, y], i) => ({ pos: [x, y, 170], col: '#ffd8a8', int: .85 * fk(t, i + 3) * k, rad: 470, shin: 24 })),
    { pos: [80, 440, -300], col: '#ff9aa0', int: .9 + 2 * storm(t), rad: 900, shin: 26 }, { pos: [1000, 440, -300], col: '#7af0c0', int: .9 + 2 * storm(t), rad: 900, shin: 26 },
    { pos: [540, 1500, 1800], col: '#8a9cd0', int: .3 + .6 * storm(t), rad: 5000, shin: 12 },
  ],
  amb: '#2e3a58', ambGround: '#2a2220', ambInt: .3, bgLight: .5, exposure: 1.18, bloom: .48, bloomThresh: .7, emisGain: 1.9, normalStrength: .95, specScale: .35,
  vignette: .55, grain: .022, shadowTint: '#0e1e3a', highTint: '#ffe0b0', sat: 1.05, contrast: 1.13,
  rays: { center: [540, 480], thresh: .45, srcRad: 500, samples: 36, step: .016, decay: .962, col: '#ffe8c8', int: .5 },
});
const RIG_CELL2 = (t, { light = 0, candle = 1, season = 0 } = {}) => light > .5 || season ? {
  lights: [{ pos: [840, 500, 260], col: season === 1 ? '#e8f0ff' : season === 2 ? '#c0cce0' : '#ffe8c8', int: 2.2, rad: 1500, shin: 24 }, { pos: [300, 1500, 1600], col: '#8a98b8', int: .35, rad: 5000, shin: 12 }],
  amb: '#4a5468', ambGround: '#2a2a2e', ambInt: .34, bgLight: .55, exposure: 1.15, bloom: .45, bloomThresh: .72, emisGain: 1.9, normalStrength: .95, specScale: .3,
  vignette: .56, grain: .024, shadowTint: '#18243a', highTint: '#fff0d8', sat: .95, contrast: 1.1,
  rays: { center: [840, 500], thresh: .45, srcRad: 240, samples: 40, step: .018, decay: .966, col: season === 1 ? '#e8eeff' : '#fff0d0', int: 1.1 },
} : {
  lights: [{ pos: [930, 1000, 170], col: '#ffd9a8', int: 2.3 * candle * fk(t, 4), rad: 820, shin: 26 }, { pos: [840, 500, -220], col: '#a8bcf0', int: 1.2, rad: 950, shin: 24 },
    { pos: [500, 1500, 1600], col: '#8a9cd0', int: .26, rad: 5000, shin: 12 }],
  amb: '#2e3650', ambGround: '#221e1c', ambInt: .26, bgLight: .5, exposure: 1.18, bloom: .48, bloomThresh: .7, emisGain: 1.9, normalStrength: .95, specScale: .3,
  vignette: .58, grain: .022, shadowTint: '#0e1830', highTint: '#ffe0b8', sat: 1.0, contrast: 1.12,
  rays: { center: [840, 500], thresh: .45, srcRad: 220, samples: 40, step: .018, decay: .966, col: '#b8ccff', int: .8 },
};
const RIG_FLOOR2 = (t) => ({
  lights: [{ pos: [1180, 1400, 260], col: '#ffd9a8', int: 2.1 * fk(t, 7), rad: 1100, shin: 26 }, { pos: [200, 300, 300], col: '#a8bcf0', int: .9 + 4 * storm(t), rad: 1300, shin: 26 },
    { pos: [540, 1500, 1600], col: '#8a9cd0', int: .25, rad: 5000, shin: 12 }],
  amb: '#2a3248', ambGround: '#161210', ambInt: .26, bgLight: .55, exposure: 1.2, bloom: .45, bloomThresh: .72, emisGain: 1.9, normalStrength: .95, specScale: .5,
  vignette: .62, grain: .024, shadowTint: '#0e1830', highTint: '#e8e0d0', sat: .72, contrast: 1.12, tint: '#a8b8d8', tintAmt: .25,
});
const RIG_GALLOWS2 = (t) => ({
  lights: [{ pos: [300, 1100, 700], col: '#e8e6e0', int: 1.25 + 3 * storm(t), rad: 3000, shin: 20 }, { pos: [900, 400, -200], col: '#c8d0e0', int: .6, rad: 1500, shin: 20 }],
  amb: '#6a7488', ambGround: '#3a3c42', ambInt: .55, bgLight: .65, exposure: 1.08, bloom: .3, bloomThresh: .8, emisGain: 1.25, normalStrength: .9, specScale: .3,
  vignette: .64, grain: .028, shadowTint: '#1a2436', highTint: '#eef0f2', sat: .5, contrast: 1.12, tint: '#c0c8d8', tintAmt: .3,
});
const RIG_WINE2 = (t, { cold = 1 } = {}) => ({
  lights: [{ pos: [380, 640, 420], col: '#ffe2bc', int: 2.0 * fk(t, 6), rad: 1000, shin: 30 }, { pos: [800, 1500, 600], col: '#a8bcf0', int: .5, rad: 1200, shin: 24 }],
  amb: '#2a2a36', ambGround: '#1a1412', ambInt: .3, bgLight: .55, exposure: 1.15, bloom: .5, bloomThresh: .72, emisGain: 1.9, normalStrength: .95, specScale: .6,
  vignette: .62, grain: .02, shadowTint: '#0e1e2e', highTint: '#f6e2c4', sat: 1.0, contrast: 1.14, tint: '#b0e8c8', tintAmt: .3 * cold,
});

// ---------- the dais as one world (back wall, figures, table) ----------
function dais(t, C, { blur = null, kp = {}, bp = {}, qp = {}, kTop = '', bTop = '', qTop = '', it = {}, glow = 1, front = '', kO = {}, bO = {}, qO = {}, only = null, bcx = 950 } = {}) {
  const want = n => !only || only.includes(n);
  return `${daisBack2(t, { blur, glow })}
    ${want('k') ? king(t, kp, { top: kTop, ...kO }) : ''}${want('q') ? queen(t, qp, { top: qTop, ...qO }) : ''}${want('b') ? boy(t, bp, { top: bTop, ...bO }) : ''}
    ${daisTable(items2(t, it) + (bcx ? tableCandle(bcx, 1428, t, .74, 5) : ''))}${front}`;
}

// ================= SHOTS =================
// the opening frame = the closing frame: his eyes over the rim of the king's goblet, candlelight, a breath of a smile
const OPEN = { look: 4, lookY: -1, lid: .2, bIn: 2, bOut: 1, smirk: .2, side: .3, turn: .05, tilt: -2 };
const OPEN_CAM = [830, 1226, 5.1];
const gobOpen = () => gripTo(tArm, 1, [0, -1030], { hs: 1.05, s: .9, gy: 120, py: 0, bend: 'down', upright: -4 });
function openShot(t, w) {   // w: 0 at the seam (frame 0 / the last frame) → 1 a little into the shot
  const A = gobLips(.35, [2, -1004]);
  return { A, top: heldGoblet(A, 1, 1.05, .8, SKB2, { wine: .8 }) };
}

const SHOTS = [
  // 1 "You're twelve…" (0–1.36): ECU, his eyes over the rim; lightning at .6 flares the glass behind him; his eyes come to
  //   us, then slide to the king. 1.36–5.1 "and your only job is to taste the king's food before he does.": the camera
  //   SNAPS back to reveal the king looming at his shoulder, chewing, watching him drink.
  { at: 0,
    draw(v, t) {
      const pull = snap(t, 1.34, .5), sip = easeInOut(seg(t, 2.6, 3.0)) * (1 - easeInOut(seg(t, 3.55, 3.95)));
      const lower = easeInOut(seg(t, 1.5, 1.95)) * (1 - sip);
      const Ac = gobChest(), Al = gobOpen(), As = gobLips(1.0);
      const A = lower > 0 || sip > 0 ? gobBlend(gobBlend(Al, Ac, lower), As, sip) : Al;
      const bTop = heldGoblet(A, 1, 1.05, lerp(.9, .8, Math.max(lower, sip)), SKB2, { wine: .8 - .1 * seg(t, 2.8, 3.4) });
      const look = kf(t, [[0, 4], [.5, 4], [.75, 0], [1.1, 0], [1.3, -8], [2.4, -8], [2.6, 0], [3.9, 0], [4.2, -9], [5.1, -9]]);
      const gulp = bell(t, 3.45, 3.7);
      const bp = { look, lookY: kf(t, [[0, -1], [1.3, 0], [2.6, -3], [3.9, 0]]), lid: lidB(t, lerp(.2, .9, sip), [1.05, 4.6]), bIn: lerp(2, 6, seg(t, 1.3, 1.8)) - 4 * sip, bOut: 1 + 2 * seg(t, 1.3, 1.8),
        smirk: lerp(.2, -.2, seg(t, .9, 1.4)), side: .3 * (1 - seg(t, .9, 1.4)), turn: lerp(.05, -.15, seg(t, 1.2, 1.6)), tilt: -2 - 6 * sip + 3 * gulp, grit: 0 };
      // the king: leans in over the boy, chewing, a drumstick in his fist; on "before he does" he grins, waits
      const lean = easeInOut(seg(t, 1.6, 2.4)), chew = t > 1.6 && t < 3.6 ? .12 + .14 * Math.abs(Math.sin(t * 11)) : 0;
      const KA = gripArm(kArm2, 1, lerp2([150, -760], [176, -820], lean), { hs: 1.75, bend: 'out' });
      const kTop = heldLeg(KA, 1, 1.75, .5, SKR2, { bite: 1 });
      const kp = { armR: KA, armL: kHang(-1), look: lerp(6, 10, lean), lookY: 2, turn: .25, lid: lidB(t, .35, [2.2, 4.4]), talk: chew, smirk: lerp(.4, .8, seg(t, 3.9, 4.4)), squint: .3, bIn: -3, bOut: 3, tilt: 4 * lean };
      const fl = storm(t); if (fl > .01) flashK(.18 * fl, '#dfe8ff');
      const C = camF(t, t => { const p = snap(t, 1.34, .5), d = easeInOut(seg(t, 1.9, 5.1));
        return [lerp(OPEN_CAM[0], 720 - 20 * d, p), lerp(OPEN_CAM[1], 1205, p), lerp(OPEN_CAM[2], 2.5 + .35 * d, p), { r: lerp(0, -2, p), hh: lerp(.4, 1, p) }]; });
      return `<g transform="${C.tf}">${lights(C.v, RIG_DAIS2(t))}${dais(t, C, { blur: pull < .5 ? 'dofHeavy' : 'dof', bp, bTop, kp, kTop, kO: { lean: 4 * lean, dx: 30 * lean }, it: { kcup: 0, leg: 0 } })}</g>`;
    } },

  // 2 "Every bite." — whip to him: close, three-quarter; he lifts a roll and bites it on "bite" (snap-in, crumbs)
  { at: 5.1,
    draw(v, t) {
      const up = easeInOut(seg(t, 5.12, 5.48)), bite = t > 5.6, crunch = snap(t, 5.56, .14);
      const P = lerp2([-116, -952], [-110, -1008], up), A = gripArm(tArm, -1, P, { hs: 1.05, bend: 'out', upright: 82, flip: 1 });
      const top = heldRoll(A, -1, 1.05, .62, SKB2, { bite });
      const chew = t > 5.7 ? .1 + .16 * Math.abs(Math.sin((t - 5.7) * 13)) : 0;
      const crumbs = bite ? Array.from({ length: 7 }, (_, i) => { const u = t - 5.6, R = rng(i + 5), x = -30 + (R() - .5) * 60 + (R() - .5) * 220 * u, y = -1000 + (R() - .3) * 30 + 900 * u * u - 160 * u;
        return u < .5 ? `<circle cx="${F1(x)}" cy="${F1(y)}" r="${F1(2.5 + R() * 3)}" fill="#e8c890"/>` : ''; }).join('') : '';
      const C = camF(t, t => { const s = snap(t, 5.56, .16); return [826, lerp(1222, 1214, s), lerp(4.6, 5.3, s), { r: 3, ...SHK(t, [[5.6, 9, .25]]) }]; });
      return `<g transform="${C.tf}">${lights(C.v, RIG_DAIS2(t))}${dais(t, C, { blur: 'dofHeavy', bp: { armL: A, armR: tHang(1), turn: -.3, look: lerp(-4, -8, up), lookY: lerp(2, -1, up), lid: lidB(t, bite && t < 5.75 ? 1.9 : .2, [6.0]), bIn: 3, bOut: 2, talk: chew, open: up * (1 - crunch) * .55, tilt: lerp(0, -5, up) + 3 * crunch * (t < 5.8) }, bTop: top + crumbs, only: ['b'], it: { kcup: 0 } })}</g>`;
    } },

  // 3 "Every cup." — the other side: he tips a cup and drinks, head back, a gulp
  { at: 6.15,
    draw(v, t) {
      const up = easeInOut(seg(t, 6.16, 6.5)), down = easeInOut(seg(t, 6.92, 7.15)), drink = up * (1 - down);
      const A = gobBlend(gobChest(10, 20), gripTo(tArm, 1, [4, -1016], { hs: 1.05, s: .85, gy: 52, py: -2, bend: 'down', upright: -50 }), drink);
      const top = heldPewter(A, 1, 1.05, .85, SKB2, { wine: .6 - .3 * seg(t, 6.5, 6.9) });
      const C = camF(t, t => { const s = snap(t, 6.62, .18); return [836, lerp(1236, 1222, s), lerp(4.1, 4.7, s), { r: -3 }]; });
      return `<g transform="${C.tf}">${lights(C.v, RIG_DAIS2(t))}${dais(t, C, { blur: 'dofHeavy', bp: { armR: A, armL: tHang(-1), turn: .3, look: 6, lookY: -3 * drink, lid: lidB(t, 1.6 * drink, []), bIn: 2 + 3 * drink, tilt: -9 * drink + 3 * bell(t, 6.8, 7.0) }, bTop: top, only: ['b'], it: { kcup: 0 } })}</g>`;
    } },

  // 4 "If you live, he eats. If you drop… he doesn't." — the king: points the drumstick at us and grins; rips a bite
  //   (snap-in); freezes on "drop"; the light drains, a slow push (vertigo); on "doesn't" he lets the meat fall — THUD
  { at: 7.2,
    draw(v, t) {
      const point = easeInOut(seg(t, 7.25, 7.6)) * (1 - easeInOut(seg(t, 7.95, 8.15))), toM = easeInOut(seg(t, 8.0, 8.22)) * (1 - easeInOut(seg(t, 8.55, 8.85)));
      const drop = t > 10.12, freeze = easeInOut(seg(t, 9.05, 9.4));
      const P = lerp2(lerp2([-150, -800], [-160, -900], point), [-128, -1000], toM);
      const A = gripArm(kArm2, -1, P, { hs: 1.75, bend: 'out', upright: lerp(lerp(0, 70, point), 84, toM) });
      const fall = drop ? t - 10.12 : 0, F0 = propAt(A, -1, 1.75, .5, 110);
      const leg = drop ? `<g transform="translate(0 ${F1(4200 * fall * fall)}) rotate(${F1(fall * 200)} ${F1(F0[0])} ${F1(F0[1])})">${roastLeg(F0[0], F0[1], .5, F0[2], 1)}</g>` + redraw(-1, { ...A, hand: 'open', spread: .6 }, SKR2[0], 'ruddy', 1.75)
        : heldLeg(A, -1, 1.75, .5, SKR2, { bite: t > 8.2 ? 1 : 0 });
      const chew = t > 8.3 && t < 9.1 ? .14 + .16 * Math.abs(Math.sin((t - 8.3) * 12)) : 0;
      const kp = { armL: drop ? { ...A, hand: 'none' } : A, armR: kHang(1), look: lerp(lerp(-2, 0, point), 9, freeze), lookY: lerp(2, 0, freeze), turn: lerp(.05, .2, freeze),
        smirk: lerp(lerp(.9, 1.1, point), -.35, freeze), laugh: .4 * bell(t, 7.3, 7.9), lid: lidB(t, lerp(.2, .25, freeze), [7.5]), open: .55 * toM, talk: chew + talkW(t, 7.24, 7.86, .2),
        bIn: lerp(lerp(3, 5, point), -7, freeze), bOut: lerp(5, 6, freeze), squint: lerp(.1, .45, freeze), tilt: lerp(lerp(-3, 2, point), 0, freeze) + 4 * toM };
      if (t > 10.3 && t < 10.36) flashK(.1);
      const C = camF(t, t => { const s1 = snap(t, 8.1, .2), push = easeInOut(seg(t, 9.0, 10.5)), s2 = snap(t, 10.3, .14);
        return [lerp(lerp(570, 560, s1), 570, push), lerp(lerp(1230, 1200, s1), 1186, push), lerp(2.6, 3.3, s1) + 1.3 * push - .25 * s2, { r: lerp(0, -3, push), ...SHK(t, [[8.2, 6, .3], [10.32, 14, .45]]) }]; });
      return `<g transform="${C.tf}">${lights(C.v, RIG_DAIS2(t, { warm: lerp(1, .55, freeze), cold: .6 * freeze }))}${dais(t, C, { blur: 'dof', kp, kTop: leg, only: ['k'], it: { leg: 0, kcup: 0 } })}</g>`;
    } },

  // 5 "The boy before you lasted four months." — beneath the table: lightning; on the cloth the SHADOW of the boy before him
  //   clutches his throat and drops; his goblet falls into the light and rolls to us; the wine spreads like blood
  { at: 10.7,
    draw(v, t) {
      const C = camF(t, t => { const p = easeInOut(seg(t, 10.7, 13.1)); return [lerp(560, 500, p), lerp(900, 1180, p), lerp(1.1, 1.36, p), { r: lerp(3, -2, p), ...SHK(t, [[11.32, 10, .35]]) }]; });
      return `<g transform="${C.tf}">${lights(C.v, RIG_FLOOR2(t))}${floor2(t, 11.02)}</g>`;
    } },

  // 6 "You've lasted three years… and no one knows how." — his cell. Time-lapse: the tally marks multiply across the wall
  //   while the window light wheels from night to day and back; we find him on his cot; he looks up at us, a secret smile…
  //   and blows the candle out on "how."
  { at: 13.06,
    draw(v, t) {
      const BC = [660, 2121, .95];
      const pan = easeInOut(seg(t, 13.06, 14.9)), reveal = lerp(.15, 1, easeInOut(seg(t, 13.06, 14.6)));
      const cyc = t < 14.7 ? (Math.sin((t - 13.06) * 14) * .5 + .5) : 0, light = cyc > .5 ? 1 : 0;
      const look = easeInOut(seg(t, 14.95, 15.35)), smile = easeInOut(seg(t, 15.3, 15.8)), blow = easeInOut(seg(t, 15.88, 16.02)), out = t > 16.1, die = seg(t, 15.98, 16.1);
      const pose = { armL: tHang(-1), armR: tHang(1), look: lerp(lerp(-8, 1, look), 7, blow), lookY: lerp(4, 0, look), turn: lerp(lerp(-.4, 0, look), .3, blow), tilt: lerp(-6, 2, look) + 3 * blow,
        smirk: lerp(-.1, .85, smile) * (1 - blow), side: .5 * smile * (1 - blow), lid: lidB(t, lerp(.35, .4, smile), [14.1]), bIn: lerp(4, -2, smile), bOut: lerp(0, 3, smile),
        ooh: blow * (1 - seg(t, 16.12, 16.3)), open: .25 * blow * (1 - seg(t, 16.12, 16.3)), puff: .5 * bell(t, 15.85, 16.05) };
      const swp = [lerp(-900, 1500, (t * 3.1) % 1), lerp(-1900, 500, (t * 3.1) % 1)];
      const C = camF(t, t => { const p = easeInOut(seg(t, 13.06, 14.9)), q = easeInOut(seg(t, 14.9, 16.2));
        return [lerp(220, 720, p), lerp(980, 1110, p) + 10 * q, lerp(1.7, 2.6, p) + .6 * q, { hh: .7 }]; });
      const smoke = out ? `<g filter="url(#b8)" opacity="${F2(.5 * (1 - seg(t, 16.12, 16.4)))}"><path d="M810 1094 C820 ${F1(1060 - (t - 16.1) * 300)} 790 ${F1(1030 - (t - 16.1) * 400)} 815 ${F1(980 - (t - 16.1) * 500)}" stroke="#c8ccd4" stroke-width="8" fill="none"/></g>` : '';
      const rig = RIG_CELL2(t, { light, candle: out ? 0 : 1 - .7 * die });
      rig.lights[0].pos = [810, 1090, 170];
      if (out) { rig.exposure = lerp(1.18, .5, seg(t, 16.06, 16.3)); rig.fade = 1 - seg(t, 16.15, 16.38); }
      return `<g transform="${C.tf}">${lights(C.v, rig)}${cell2(t, { light, blur: pan > .6 ? 'dofLight' : null, candle: out ? 0 : 1 - .7 * die, bend: .9 * blow, reveal, sweep: t < 14.7 ? swp : null })}
        ${fig(TASTER, t, BC, { bust: 0, ...pose }, { ph: 1.1, rate: 1.2 })}${smoke}</g>`;
    } },

  // 7 "Then one night, at the great feast," — out of the dark, the hall bursts into light: the camera flies down the length
  //   of the hall over the tables (cups raised, the chandeliers swinging) toward the high table at the far end
  { at: 16.4,
    draw(v, t) {
      const map = ([x, y]) => [250 + .54 * x, 330 + .54 * y];
      const C = camF(t, t => { const p = easeInOut(seg(t, 16.4, 18.85)); return [lerp(560, 700, p), lerp(1180, 1080, p), lerp(.82, 1.6, Math.pow(p, 1.4)), { r: lerp(-4, 0, p) }]; });
      const V = window.__VIEW, Z = window.__Z; window.__VIEW = [(V[0] - 250) / .54, (V[1] - 330) / .54, (V[2] - 250) / .54, (V[3] - 330) / .54]; window.__Z = Z * .54;
      const raise = i => Math.max(0, Math.sin((t - 16.4) * 3 + i));
      const d = `${daisBack2(t, { blur: null })}${king(t, { look: 6, turn: .2, laugh: .6 * bell(t, 16.5, 18.5), lid: 1.2, smirk: 1 })}${queen(t, { look: -6, lookY: 3, turn: -.2, lid: .3, smirk: .2 })}
        ${boy(t, { armR: gobChest(), look: 0, lookY: 2, lid: .2 }, { top: heldGoblet(gobChest(), 1, 1.05, .8, SKB2) })}${daisTable(items2(t, { kcup: 0 }) + tableCandle(950, 1428, t, .74, 5))}`;
      window.__VIEW = V; window.__Z = Z;
      const rig = RIG_DAIS2(t, { map }); rig.lights = rig.lights.map(L => ({ ...L, rad: L.rad * .6 }));
      rig.lights.push(...[1240, 1520, 1900].map((y, i) => ({ pos: [540, y - 40, 220], col: '#ffd8a8', int: 1.0, rad: 760, shin: 20 })));
      rig.rays.int = .9;
      return `<g transform="${C.tf}">${lights(C.v, rig)}${hallEstablish(t, d)}</g>`;
    } },

  // 8 "the king's wine tastes wrong." — he drinks from the king's goblet beside the roaring king… on "wrong" a dolly-zoom:
  //   the hall stretches away behind him, lightning, the warmth drains out, his eyes go wide
  { at: 18.74,
    draw(v, t) {
      const sip = easeInOut(seg(t, 18.74, 19.2)), wrong = snap(t, 19.99, .18), dz = easeInOut(seg(t, 19.99, 20.62));
      const A = gobBlend(gobChest(), gobLips(1.0), sip * (1 - .35 * wrong));
      const bTop = heldGoblet(A, 1, 1.05, .8, SKB2, { wine: .75 });
      const bp = { armR: A, armL: tHang(-1), look: lerp(0, -1, wrong), lookY: lerp(-2, 3, wrong), lid: lerp(lerp(.2, 1.0, sip), 0, wrong), shock: .9 * wrong, dilate: -.5 * wrong,
        bIn: lerp(2, 9, wrong), bOut: lerp(0, 6, wrong), tilt: lerp(-6 * sip, 0, wrong), turn: -.05 };
      const kp = { armR: kHang(1), armL: kHang(-1), laugh: (1 - dz) * (.6 + .4 * Math.sin(t * 6)), lid: 1.8, happy: 1, smirk: 1, turn: -.4, look: -8, tilt: -6 + 3 * Math.sin(t * 7) };
      if (wrong > 0) ab(.004 * (1 - seg(t, 20.1, 20.6)));
      // dolly zoom: the back wall scales up around his head while the camera holds him the same size
      const C = camF(t, t => { const w = snap(t, 19.99, .18), d = easeInOut(seg(t, 19.99, 20.62)); return [lerp(760, 830, w), lerp(1236, 1214, w), lerp(2.7, 4.2, w) + .3 * d, { r: lerp(0, 4, d) }]; });
      const bgS = 1 + .55 * dz, hx = 830, hy = 1215;
      return `<g transform="${C.tf}">${lights(C.v, RIG_DAIS2(t, { cold: .9 * dz + .3 * wrong, warm: lerp(1, .6, dz) }))}
        <g transform="translate(${F1(hx)} ${F1(hy)}) scale(${F2(1 / bgS)}) translate(${F1(-hx)} ${F1(-hy)})">${daisBack2(t, { blur: 'dofHeavy' })}</g>
        ${king(t, kp, { dx: 60 })}${boy(t, bp, { top: bTop })}${daisTable(items2(t, { kcup: 0 }) + tableCandle(950, 1428, t, .74, 5))}</g>`;
    } },

  // 9 "Bitter." — closer: he lowers the cup a hair; lips pressed, brows knot; his eyes drop to the wine
  { at: 20.62,
    draw(v, t) {
      const q = easeOut(seg(t, 20.64, 20.9)), A = gobBlend(gobLips(1.0), gobChest(-60, -6), .55 * q);
      const bTop = heldGoblet(A, 1, 1.05, .8, SKB2, { wine: .7 });
      const C = camF(t, t => { const s = snap(t, 20.64, .15); return [826, lerp(1210, 1200, s), lerp(5.6, 7.0, s), { r: -3, ...SHK(t, [[20.65, 5, .25]]) }]; });
      return `<g transform="${C.tf}">${lights(C.v, RIG_DAIS2(t, { cold: .9 }))}${dais(t, C, { blur: 'dofHeavy', bp: { armR: A, armL: tHang(-1), look: -2, lookY: lerp(3, 8, q), lid: lerp(0, .5, q), squint: .5 * q, bIn: lerp(9, -7, q), bOut: lerp(6, 5, q), furrow: q, smirk: -.5 * q, tilt: -2 }, bTop, only: ['b'], it: { kcup: 0 } })}</g>`;
    } },

  // 10 "Like crushed almonds." — into the wine: the poison's pale film spirals on the surface; green glints
  { at: 21.2,
    draw(v, t) {
      const C = camF(t, t => [540, 960, lerp(1.5, 1.9, easeInOut(seg(t, 21.2, 22.6))), { r: lerp(-6, 14, seg(t, 21.2, 22.6)), hh: .5 }]);
      return `<g transform="${C.tf}">${lights(C.v, RIG_WINE2(t))}${wine2(t, 21.2)}</g>`;
    } },

  // 11 "The whole hall is watching you." — the hall from the high table: a wave of heads turns to us; the push creeps in
  { at: 22.56,
    draw(v, t) {
      const C = camF(t, t => [540, lerp(1270, 1300, seg(t, 22.56, 24.4)), lerp(1.0, 1.16, easeInOut(seg(t, 22.56, 24.4))), { r: lerp(-2, 2, seg(t, 22.56, 24.4)) }]);
      return `<g transform="${C.tf}">${lights(C.v, RIG_NAVE2(t))}${hallNave2(t, { heads: (i, key) => { const q = easeInOut(seg(t, 22.62 + key * .08, 22.98 + key * .08)), s0 = (key % 2 ? .45 : -.45);
        return { turn: lerp(s0, 0, q), look: lerp(s0 * 18, 0, q), lookY: 0, lid: lidB(t, lerp(.3, 0, q), [23.9 + i * .05]), bIn: 6 * q, bOut: 3 * q, squint: .2 * q * (i % 2), smirk: lerp(.7, -.25, q),
          laugh: .4 * (1 - q) * (key % 3 === 0), talk: q < .5 ? .1 * Math.abs(Math.sin(t * 9 + i)) : 0 }; }, cups: (i, key) => (1 - easeInOut(seg(t, 22.62 + key * .08, 23.0 + key * .08))) * (key % 3 === 1 ? .9 : 0) })}</g>`;
    } },

  // 12 "Except the queen." — whip to her: she alone isn't looking at us; her eyes are on the king's cup; lightning; snap-in
  { at: 24.38,
    draw(v, t) {
      const C = camF(t, t => { const s = snap(t, 24.8, .2); return [1110, lerp(1236, 1222, s), lerp(2.7, 3.7, s), { r: 2 }]; });
      return `<g transform="${C.tf}">${lights(C.v, RIG_DAIS2(t, { warm: .85 }))}${dais(t, C, { blur: 'dof', qp: { look: -9, lookY: 5, turn: -.25, lid: .35, smirk: .12, bIn: -1, bOut: 3 }, only: ['q'], it: {} })}</g>`;
    } },

  // 13 "She's staring at the king's cup… waiting." — rack focus: the gold cup sharp in front, then her eyes; a slow smile
  { at: 25.38,
    draw(v, t) {
      const rack = easeInOut(seg(t, 25.7, 26.5)), nar = easeInOut(seg(t, 26.9, 27.5));
      const C = camF(t, t => [lerp(1080, 1100, seg(t, 25.38, 27.82)), lerp(1236, 1212, easeInOut(seg(t, 25.38, 27.82))), lerp(3.3, 4.6, easeInOut(seg(t, 25.38, 27.82))), { r: -3 }]);
      const gob = goblet(990, 1310, 1.0, { wine: .75, tilt: -6 }), z = window.__Z;
      const bq = 14 * rack / z, bg = 14 * (1 - rack) / z;
      const blurG = (px, inner) => { if (px < .4) return inner; const id = fid('dofRk'); return `<defs><filter id="${id}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="${F2(px)}"/></filter></defs><g filter="url(#${id})">${inner}</g>`; };
      return `<g transform="${C.tf}">${lights(C.v, RIG_DAIS2(t, { warm: .85 }))}${daisBack2(t, { blur: 'dofHeavy' })}
        ${blurG(bg, queen(t, { look: -9, lookY: 5, turn: -.25, lid: lerp(.35, .55, nar), smirk: lerp(.12, .55, nar), side: .5 * nar, squint: .3 * nar, bIn: -2 * nar, bOut: 3 }))}
        ${blurG(bq, gob)}</g>`;
    } },

  // 14 "Spit it out, and you're accusing the queen." — his cheeks full of the wine he can't swallow; sweat; his eyes dart —
  //   to her (and she is looking right back at him) — then to us
  { at: 27.82,
    draw(v, t) {
      if (t >= 29.32 && t < 29.98) {   // her eyes meet his
        const C = camF(t, t => [1104, 1224, lerp(6.8, 7.4, seg(t, 29.32, 29.98)), { r: 4 }]);
        const tn = easeOut(seg(t, 29.36, 29.6));
        return `<g transform="${C.tf}">${lights(C.v, RIG_DAIS2(t, { warm: .8, cold: .3 }))}${dais(t, C, { blur: 'dofHeavy', qp: { look: lerp(-9, -14, tn), lookY: lerp(5, 1, tn), turn: lerp(-.25, -.4, tn), lid: lerp(.4, .15, tn), smirk: lerp(.4, -.1, tn), bIn: lerp(-2, -7, tn), bOut: 5, squint: .4 * tn }, only: ['q'] })}</g>`;
      }
      const lk = kf(t, [[27.82, 0], [28.2, -2], [28.9, -2], [29.1, 9], [29.32, 9], [29.98, 9], [30.12, -1]]);
      const sh = tremble(t, .7), A = gobChest(-10);
      const C = camF(t, t => [826 + tremble(t, .7) * .3, lerp(1226, 1214, seg(t, 27.82, 30.25)), lerp(4.6, 5.6, easeInOut(seg(t, 27.82, 30.25))), { r: 5, hh: 1.8 }]);
      return `<g transform="${C.tf}">${lights(C.v, RIG_DAIS2(t, { cold: .45 }))}${dais(t, C, { blur: 'dofHeavy', bp: { armR: A, armL: tHang(-1), puff: 1, look: lk, lookY: lk < 0 ? 4 : 0, lid: lidB(t, 0, [28.7]), shock: .35, bIn: 10, bOut: 6, sweat: 1.5, sweatY: 32 * seg(t, 27.9, 30.2), tilt: sh * .5, turn: lk > 4 ? .15 : 0 },
        bTop: heldGoblet(A, 1, 1.05, .8, SKB2, { wine: .5 }), only: ['b'], it: { kcup: 0 } })}</g>`;
    } },

  // 15 "You'll hang by morning." — FLASH: dawn, the gallows, an empty noose; the crows burst off on "hang"; we rush at the noose
  { at: 30.25,
    draw(v, t) {
      const C = camF(t, t => [lerp(660, 700, seg(t, 30.25, 31.6)), lerp(860, 960, easeIn(seg(t, 30.25, 31.6))), lerp(1.0, 1.9, easeIn(seg(t, 30.25, 31.6))), { r: lerp(-3, 3, seg(t, 30.25, 31.6)), ...SHK(t, [[30.47, 8, .4]]) }]);
      return `<g transform="${C.tf}">${lights(C.v, RIG_GALLOWS2(t))}${gallows2(t, 30.25)}</g>`;
    } },

  // 16 "So you smile… and you drink." — through the noose, back to him: a forced smile round the mouthful; he swallows —
  //   eyes squeezed shut — and drinks again, deliberately
  { at: 31.58,
    draw(v, t) {
      const sm = easeInOut(seg(t, 31.75, 32.2)), gulp = easeInOut(seg(t, 32.55, 32.85)), drink = easeInOut(seg(t, 32.9, 33.3));
      const A = gobBlend(gobChest(-14), gobLips(1.0), drink);
      const bp = { armR: A, armL: tHang(-1), puff: 1 - gulp, smirk: lerp(-.2, 1.1, sm) * (1 - gulp), grin: .7 * sm * (1 - gulp), look: 0, lookY: 1, lid: Math.max(lerp(0, .3, sm), 2 * bell(t, 32.5, 32.95), 1.0 * drink), squeeze: bell(t, 32.5, 32.95) > .5 ? 1 : 0,
        bIn: lerp(10, 4, sm), bOut: 6, sweat: 1.2, sweatY: 40, tilt: 3 * bell(t, 32.55, 32.95) - 7 * drink };
      const C = camF(t, t => [826, lerp(1222, 1214, seg(t, 31.58, 33.46)), lerp(4.4, 5.0, easeInOut(seg(t, 31.58, 33.46))), { r: lerp(-2, 2, seg(t, 31.58, 33.46)), ...SHK(t, [[32.6, 4, .3]]) }]);
      return `<g transform="${C.tf}">${lights(C.v, RIG_DAIS2(t, { cold: .3 }))}${dais(t, C, { blur: 'dofHeavy', bp, bTop: heldGoblet(A, 1, 1.05, .8, SKB2, { wine: .45 }), only: ['b'], it: { kcup: 0 } })}</g>`;
    } },

  // 17 "The queen leans forward… waiting for you to fall." — she leans in over the table, eyes wide and hungry; on "fall"
  //   the world tips (the poison's dizziness): the frame rolls and sways
  { at: 33.46,
    draw(v, t) {
      const lean = easeInOut(seg(t, 33.55, 34.75)), tip = easeInOut(seg(t, 35.3, 36.2));
      const qp = { look: -6, lookY: 2, turn: -.15, lid: lidB(t, lerp(.35, 0, lean), [35.0]), smirk: lerp(.15, .6, lean), side: .4 * lean, open: .12 * lean, bIn: 4 * lean, bOut: 4, dilate: .5 * lean, shock: .15 * lean };
      const sway = Math.sin(t * 5) * 6 * tip;
      const C = camF(t, t => { const tp = easeInOut(seg(t, 35.3, 36.2)); return [1100 + Math.sin(t * 3) * 20 * tp, lerp(1240, 1250, easeInOut(seg(t, 33.55, 34.75))), lerp(3.0, 3.9, easeInOut(seg(t, 33.46, 36.22))), { r: 3 + 16 * tp + Math.sin(t * 5) * 6 * tp }]; });
      if (tip > .1) ab(.006 * tip);
      return `<g transform="${C.tf}">${lights(C.v, RIG_DAIS2(t, { warm: .8, cold: .25 * tip }))}${dais(t, C, { blur: 'dof', qp, qO: { lean: -8 * lean, dy: 30 * lean, ds: .08 * lean, dx: -20 * lean }, only: ['q'], it: {} })}</g>`;
    } },

  // 18 "But you don't." — SLAM: steady, he brings the goblet down on the board; the candles jump; lightning
  { at: 36.22,
    draw(v, t) {
      const down = easeIn(seg(t, 36.3, 36.52)), hit = t > 36.52;
      const A = gobBlend(gobLips(.6), gripArm(tArm, 1, [26, -757], { hs: 1.05, bend: 'down', upright: 0 }), down);
      const bp = { armR: A, armL: tHang(-1), look: 0, lookY: lerp(1, -1, down), lid: .1, smirk: lerp(.0, .35, seg(t, 36.7, 37.1)), side: .3, bIn: lerp(2, -3, down), bOut: 3, tilt: lerp(-4, 2, down) };
      const C = camF(t, t => { const s = snap(t, 36.52, .16); return [836, lerp(1262, 1290, s), lerp(3.6, 3.15, s), { ...SHK(t, [[36.52, 22, .5]]) }]; });
      if (hit && t < 36.62) flashK(.25);
      const slosh = hit ? `<g opacity="${F2(1 - seg(t, 36.55, 36.95))}">${[0, 1, 2, 3, 4].map(i => { const u = t - 36.52, R = rng(i + 9); return `<circle cx="${F1(846 + (R() - .5) * 60 + (R() - .5) * 300 * u)}" cy="${F1(1330 - 220 * u + 900 * u * u)}" r="${F1(3 + R() * 4)}" fill="#7a0a1c"/>`; }).join('')}</g>` : '';
      return `<g transform="${C.tf}">${lights(C.v, RIG_DAIS2(t, { k: hit ? 1 + .4 * decay(t, 36.52, .2) : 1 }))}${dais(t, C, { blur: 'dof', bp, bTop: heldGoblet(A, 1, 1.05, .8, SKB2, { wine: .4 }), it: { kcup: 0 }, only: ['k', 'b', 'q'],
        kp: { armR: kHang(1), armL: kHang(-1), laugh: .5, lid: 1.8, happy: 1, smirk: 1, turn: -.4 }, qp: { look: -10, lookY: 2, turn: -.3, lid: lidB(t, 0, [36.6]), shock: .4 * seg(t, 36.55, 36.7), smirk: -.1, bIn: 6, bOut: 2 } })}${slosh}</g>`;
    } },

  // 19 "Because every morning for three years, you've swallowed one drop of poison." — the past. Dawn in the cell: he holds
  //   a vial of green up to the window and pulls the cork; the seasons flicker past the bars; then — close — ONE drop
  //   falls onto his tongue; he swallows and shudders
  { at: 37.26,
    draw(v, t) {
      const BS = [540, 2231, .95];
      const figS = (pose, top) => fig(TASTER, t, BS, { bust: 1, armL: tHang(-1, 4, -8), ...pose }, { top, ph: 1.1, rate: 1.2 });
      if (t < 39.34) {
        const sea = t < 38.3 ? 0 : 1 + Math.floor((t - 38.3) / .26) % 4, up = easeInOut(seg(t, 37.3, 37.9));
        const A = gripArm(tArm, 1, lerp2([150, -760], [190, -1250], up), { hs: 1.05, bend: -1 });
        const top = heldVial(A, 1, 1.05, 1.15, SKB2, { cork: t < 38.1 ? 1 : 0, fill: .55 });
        const glow = `<g filter="url(#pe16)" opacity=".5">${(() => { const F = fistAt(A, 1.05); return `<circle cx="${F1(F[0])}" cy="${F1(F[1] - 40)}" r="40" fill="#7ae0a8"/>`; })()}</g>`;
        if (sea && (t - 38.3) % .26 < .05) flashK(.35, '#ffffff');
        const C = camF(t, t => [lerp(640, 660, seg(t, 37.26, 39.34)), lerp(930, 960, seg(t, 37.26, 39.34)), lerp(1.75, 1.95, easeInOut(seg(t, 37.26, 39.34)))]);
        return `<g transform="${C.tf}">${lights(C.v, RIG_CELL2(t, { light: 1, season: sea }))}${cell2(t, { light: 1, blur: 'dofLight', candle: 0, season: sea })}
          ${figS({ armR: A, look: 5, lookY: -6, tilt: 4, lid: lidB(t, .15, [38.0]), bIn: 3, bOut: 1, smirk: -.1 }, top + glow)}${cot(1520)}</g>`;
      }
      if (t < 40.78) {
        const tip = easeInOut(seg(t, 39.36, 39.75)), tongue = easeInOut(seg(t, 39.6, 39.95));
        const A = gripArm(tArm, 1, lerp2([150, -900], [24, -1150], tip), { hs: 1.05, bend: -1, flip: 0 });
        const F = fistAt(A, 1.05), top = heldVial(A, 1, 1.05, 1.15, SKB2, { cork: 0, fill: .5, flip: 1 });
        const mouthW = [0, -1150 + 200], dT = t - 40.42, form = clamp((t - 40.0) / .4);
        const tipPt = propPoint(A, 1, 1.05, 1.15, -8, 38);
        const drop = dT < 0 ? (form > 0 ? poisonDrop(tipPt[0], tipPt[1] + 4 * form, 4 + 4 * form) : '') : dT < .22 ? poisonDrop(tipPt[0], lerp(tipPt[1], -998, (dT / .22) ** 2), 8) : dT < .4 ? `<g filter="url(#pe)"><ellipse cx="${F1(tipPt[0])}" cy="-996" rx="${F1(12 * (1 - (dT - .22) / .18) + 2)}" ry="3" fill="#8af0b8" opacity="${F2(1 - (dT - .22) / .18)}"/></g>` : '';
        const C = camF(t, t => [540 + 10 * .95, 2231 - 1030 * .95, lerp(6.0, 6.8, seg(t, 39.34, 40.78)), { hh: .4 }]);
        return `<g transform="${C.tf}">${lights(C.v, RIG_CELL2(t, { light: 1 }))}${cell2(t, { light: 1, blur: 'dofHeavy', candle: 0 })}
          ${figS({ armR: A, look: 0, lookY: -7, tilt: 0, talk: .62 * tongue, tongue, lid: .1, bIn: 6, bOut: 2 }, top + `<g>${drop}</g>`)}</g>`;
      }
      const wince = easeOut(seg(t, 40.8, 41.0)), shiver = wince * tremble(t, 3.2) * (1 - seg(t, 41.2, 41.45));
      const A = gripArm(tArm, 1, [lerp(60, 140, easeInOut(seg(t, 40.78, 41.2))), lerp(-1000, -820, easeInOut(seg(t, 40.78, 41.2)))], { hs: 1.05, bend: -1 });
      if (wince > .5) ab(.008 * (1 - seg(t, 41.0, 41.4)));
      const C = camF(t, t => [552, 1190, lerp(3.5, 3.8, seg(t, 40.78, 41.45)), { r: -3, ...SHK(t, [[40.82, 9, .5]]) }]);
      return `<g transform="${C.tf}">${lights(C.v, RIG_CELL2(t, { light: 1 }))}${cell2(t, { light: 1, blur: 'dofHeavy', candle: 0 })}
        <g transform="translate(${F1(shiver)} 0)">${figS({ armR: A, look: 0, lookY: 2, tilt: 3, lid: 2 * wince, squeeze: wince > .5 ? 1 : 0, bIn: -8 * wince, bOut: 7 * wince, grit: .9 * wince, talk: 0 }, heldVial(A, 1, 1.05, 1.15, SKB2, { cork: 0, fill: .45 }))}</g></g>`;
    } },

  // 20 "Just enough to survive tonight." — back at the feast, a low hero angle: steady now; warmth back in the light; his
  //   eyes slide to the queen
  { at: 41.45,
    draw(v, t) {
      const sl = easeInOut(seg(t, 42.55, 43.0)), A = gobChest();
      const C = camF(t, t => [lerp(812, 846, seg(t, 41.45, 43.25)), lerp(1290, 1262, seg(t, 41.45, 43.25)), lerp(2.6, 3.2, easeInOut(seg(t, 41.45, 43.25))), { r: lerp(-4, -1, seg(t, 41.45, 43.25)) }]);
      return `<g transform="${C.tf}">${lights(C.v, RIG_DAIS2(t, { k: 1.1 }))}${dais(t, C, { blur: 'dof', bp: { armR: A, armL: tHang(-1), look: lerp(0, 9, sl), lookY: 0, turn: .12 * sl, lid: lidB(t, .25, [41.9]), smirk: lerp(.1, .5, sl), side: .4 * sl, bIn: -2, bOut: 2, tilt: 2 },
        bTop: heldGoblet(A, 1, 1.05, .8, SKB2, { wine: .4 }), only: ['b', 'q'], it: { kcup: 0 }, qp: { look: -8, lookY: 2, turn: -.25, lid: .3, smirk: .4, side: .4 } })}</g>`;
    } },

  // 21 "You turn to the queen." — the camera swings from him to her as he turns; her smile thins
  { at: 43.25,
    draw(v, t) {
      const tn = easeInOut(seg(t, 43.3, 43.75)), A = gobChest();
      const C = camF(t, t => { const p = easeInOut(seg(t, 43.4, 44.1)); return [lerp(840, 1010, p), lerp(1228, 1232, p), lerp(3.0, 2.5, p), { r: lerp(-1, 2, p) }]; });
      return `<g transform="${C.tf}">${lights(C.v, RIG_DAIS2(t))}${dais(t, C, { blur: 'dofLight', bp: { armR: A, armL: tHang(-1), look: 9, turn: lerp(.12, .45, tn), lid: .2, smirk: .35, side: .3 }, bTop: heldGoblet(A, 1, 1.05, .8, SKB2, { wine: .4 }),
        qp: { look: lerp(-8, -10, tn), lookY: lerp(2, 0, tn), turn: -.25, lid: lerp(.35, 0, tn), smirk: lerp(.45, -.05, tn), bIn: 5 * tn, bOut: 3 }, only: ['b', 'q'], it: { kcup: 0 } })}</g>`;
    } },

  // 22 "My lady… this wine is too fine for a servant." — he bows his head, then holds the goblet out to her (lip-sync)
  { at: 44.35,
    draw(v, t) {
      const bow = bell(t, 44.4, 45.2), off = easeInOut(seg(t, 45.6, 46.5));
      const A = gobBlend(gobChest(), gripArm(tArm, 1, [214, -900], { hs: 1.05, bend: 'down', upright: 6 }), off);
      const C = camF(t, t => [lerp(890, 920, seg(t, 44.35, 47.32)), lerp(1250, 1240, seg(t, 44.35, 47.32)), lerp(2.9, 3.15, easeInOut(seg(t, 44.35, 47.32))), { r: 1 }]);
      return `<g transform="${C.tf}">${lights(C.v, RIG_DAIS2(t, { bcx: 1250 }))}${dais(t, C, { blur: 'dof', bp: { armR: A, armL: tHang(-1), look: 9, lookY: 3 * bow, turn: .45, lid: lidB(t, .2 + .5 * bow, [46.9]), smirk: .35, talk: talkW(t, 44.4, 47.35), bIn: -1, tilt: 6 * bow },
        bTop: heldGoblet(A, 1, 1.05, .8, SKB2, { wine: .4 }), qp: { look: -10, lookY: lerp(0, 4, off), turn: -.25, lid: 0, smirk: lerp(0, -.3, off), bIn: lerp(5, 8, off), bOut: 3, shock: .2 * off }, only: ['b', 'q'], it: { kcup: 0 }, bcx: 0 })}</g>`;
    } },

  // 23 "The rest is yours." — the goblet set down before her; lightning; the blood leaves her face; snap-in on "yours"
  { at: 47.32,
    draw(v, t) {
      const slide = easeOut(seg(t, 47.32, 47.62)), pale = easeInOut(seg(t, 47.45, 48.2));
      const C = camF(t, t => { const s = snap(t, 48.03, .2); return [1104, lerp(1250, 1222, s), lerp(3.2, 4.3, s), { r: -2 }]; });
      return `<g transform="${C.tf}">${lights(C.v, RIG_DAIS2(t, { cold: .35 * pale }))}${dais(t, C, { blur: 'dof', qp: { look: -2, lookY: lerp(2, 8, pale), turn: -.1, lid: 0, smirk: lerp(0, -.7, pale), open: .32 * pale, pale: .8 * pale, bIn: 9 * pale, bOut: 2, shock: .4 * pale, sweat: pale > .5 ? 1 : 0, sweatY: 20 * pale },
        it: { qcup: [lerp(1000, 1060, slide), 1428 - 168 * .5, 3 * Math.sin(t * 14) * decay(t, 47.62, .2), .5], kcup: 0 }, only: ['q'] })}</g>`;
    } },

  // 24 "The king laughs and raises his cup. 'Drink, my love!'" — he roars, lifts his goblet high (the hall roars with him);
  //   then turns to her: "Drink, my love!"
  { at: 48.62,
    draw(v, t) {
      if (t >= 50.15 && t < 50.8) {   // the hall laughs with him, cups up
        const C = camF(t, t => [540, 1290, lerp(1.08, 1.16, seg(t, 50.15, 50.8)), { r: -2 }]);
        return `<g transform="${C.tf}">${lights(C.v, RIG_NAVE2(t))}${hallNave2(t, { heads: (i, key) => ({ laugh: .7 + .3 * Math.sin(t * 9 + i), lid: 1.6, happy: 1, smirk: 1, turn: .3 * Math.sin(i), look: 6, tilt: 4 * Math.sin(t * 7 + i) }),
          cups: (i, key) => key % 2 ? easeOut(seg(t, 50.15 + key * .02, 50.4 + key * .02)) : 0 })}</g>`;
      }
      const lg = bell(t, 48.7, 50.2), raise = easeInOut(seg(t, 49.6, 50.1)), toQ = easeInOut(seg(t, 50.82, 51.2));
      const P = lerp2(lerp2([150, -840], [230, -1180], raise), [250, -1080], toQ), A = gripArm(kArm2, 1, P, { hs: 1.75, bend: 'out', upright: lerp(0, -10, toQ) });
      const kTop = heldGoblet(A, 1, 1.75, 1.1, SKR2, { wine: .75, extraRot: lerp(0, 14, toQ) });
      const shake = Math.sin(t * 22) * 5 * lg;
      const C = camF(t, t => { const r = easeInOut(seg(t, 49.6, 50.1)), q = easeInOut(seg(t, 50.82, 51.2)); return [lerp(560, 610, r) + 30 * q, lerp(1180, 1120, r), lerp(2.4, 2.6, seg(t, 48.62, 51.92)) + .4 * snap(t, 50.82, .2), { r: lerp(2, -2, q) }]; });
      return `<g transform="${C.tf}">${lights(C.v, RIG_DAIS2(t))}${dais(t, C, { blur: 'dof', kp: { armR: A, armL: kHang(-1), laugh: lg, lid: Math.max(lidB(t, .1, [48.7]), 1.9 * lg), happy: 1, smirk: 1.2, tilt: lerp(-6 * lg, 5, toQ), turn: lerp(0, .35, toQ), look: lerp(0, 10, toQ),
        talk: talkW(t, 50.81, 51.85, .5), open: .3 * toQ * (t < 51.85), bIn: 2, bOut: 6 }, kTop, kO: { dy: shake }, only: ['k'], it: { kcup: 0 } })}</g>`;
    } },

  // 25 "And now… the whole hall is watching her." — silence; the hall turns to her as one; then her face, pale, the goblet
  //   before her, her eyes darting for a way out — the light closes in
  { at: 51.92,
    draw(v, t) {
      const C = camF(t, t => [540, 1300, lerp(1.1, 1.18, seg(t, 51.92, 52.8))]);
      return `<g transform="${C.tf}">${lights(C.v, RIG_NAVE2(t, { k: .9 }))}${hallNave2(t, { heads: (i, key) => { const q = easeInOut(seg(t, 51.98 + key * .05, 52.32 + key * .05)); return { turn: lerp(0, .38, q), look: lerp(0, 10, q), lookY: 0, lid: 0, bIn: 6, bOut: 3, smirk: lerp(.4, -.2, q), shock: .3 * q }; } })}</g>`;
    } },
  // 25b her face, pale, the goblet before her, eyes darting for a way out — the light closes in
  { at: 52.8,
    draw(v, t) {
      const p = easeInOut(seg(t, 52.8, 55.15)), dart = kf(t, [[52.8, -2], [53.4, -2], [53.55, -9], [54.1, -9], [54.25, 6], [54.8, 6], [54.95, 0]]);
      const C = camF(t, t => [1100, lerp(1230, 1216, easeInOut(seg(t, 52.8, 55.15))), lerp(3.8, 5.0, easeInOut(seg(t, 52.8, 55.15))), { r: lerp(0, -3, easeInOut(seg(t, 52.8, 55.15))) }]);
      const rig = RIG_DAIS2(t, { warm: .75, cold: .4 }); rig.vignette = lerp(.55, .85, p);
      return `<g transform="${C.tf}">${lights(C.v, rig)}${dais(t, C, { blur: 'dofHeavy', qp: { look: dart, lookY: 2, turn: -.05, lid: 0, smirk: -.7, open: .2, pale: .85, bIn: 10, bOut: 4, shock: .5, sweat: 1.4, sweatY: 50 * p, tilt: tremble(t, .6) },
        it: { qcup: [1060, 1428 - 168 * .5, 1.5 * Math.sin(t * 17), .5], kcup: 0 }, only: ['q'] })}</g>`;
    } },

  // 26 the boy again: the first frame of the film (his eyes over the rim; a breath of a smile)
  { at: 55.15,
    draw(v, t) {
      const p = easeInOut(seg(t, 55.15, 55.6)), A = gobOpen();
      const C = camF(t, t => [OPEN_CAM[0], OPEN_CAM[1], OPEN_CAM[2], { r: 0, hh: .4 }]);
      return `<g transform="${C.tf}">${lights(C.v, RIG_DAIS2(t))}${dais(t, C, { blur: 'dofHeavy', bp: { ...OPEN, look: lerp(9, OPEN.look, p), smirk: lerp(.5, OPEN.smirk, p), armR: A, armL: tHang(-1) },
        bTop: heldGoblet(A, 1, 1.05, .9, SKB2, { wine: .8 }), only: ['k', 'b'], kp: { armR: kHang(1), armL: kHang(-1), look: 6, lookY: 2, turn: .25, lid: .35, smirk: .4, squint: .3, bIn: -3, bOut: 3 }, it: { kcup: 0 } })}</g>`;
    } },
];

// transitions: [cut, from, to, style, options]
const TRANS = [
  [5.1, 4.98, 5.22, 'whip', { dir: 1 }],
  [6.15, 6.07, 6.23, 'punch'],
  [7.2, 7.08, 7.32, 'whip', { dir: -1 }],
  [10.7, 10.6, 10.8, 'flash', { col: '#dfe8ff' }],
  [13.06, 12.9, 13.2, 'black'],
  [16.4, 16.36, 16.48, 'flash', { col: '#ffe6c0', decay: .16 }],
  [18.74, 18.6, 18.86, 'zoom', { at: [540, 700], big: 2.4, big2: 1.0 }],
  [20.62, 20.56, 20.68, 'punch'],
  [21.2, 21.08, 21.32, 'zoom', { at: [540, 1240], big: 3.4, big2: 1.6 }],
  [22.56, 22.44, 22.66, 'zoom', { at: [540, 960], big: 2.4, big2: 1.2 }],
  [24.38, 24.26, 24.5, 'whip', { dir: 1 }],
  [25.38, 25.32, 25.44, 'punch'],
  [27.82, 27.7, 27.94, 'whip', { dir: -1 }],
  [30.25, 30.21, 30.31, 'flash'],
  [31.58, 31.42, 31.7, 'zoom', { at: [700, 960], to: [540, 900], big: 3.2, big2: 1.4 }],
  [33.46, 33.34, 33.58, 'whip', { dir: 1 }],
  [36.22, 36.18, 36.26, 'flash', { k: .7 }],
  [37.26, 37.14, 37.38, 'spin', { rot: -40, big: 1.0, big2: .9 }],
  [41.45, 41.4, 41.5, 'flash', { col: '#ffe6c0' }],
  [43.25, 43.19, 43.31, 'punch'],
  [44.35, 44.29, 44.41, 'punch'],
  [47.32, 47.2, 47.44, 'whip', { dir: 1 }],
  [48.62, 48.5, 48.74, 'whip', { dir: -1 }],
  [51.92, 51.88, 51.96, 'cut'],
  [52.8, 52.68, 52.92, 'whip', { dir: 1 }],
  [55.15, 55.03, 55.27, 'whip', { dir: -1 }],
];

TL = makeTimeline({ shots: SHOTS, trans: TRANS, words: WORDS, strong: STRONG, captions: 'none', fps: 30, duration: DUR });
render(0);
