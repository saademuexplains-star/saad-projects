// "Two Bombs" — Tsutomu Yamaguchi, Hiroshima and Nagasaki, August 1945. 54.0 s, 1080x1920, 30 fps, no captions.
// Relit (flat + normal passes → deferred lights + post). Every shot moves; whips, zoom-throughs, white flashes and a dip
// to black between scenes (no crossfades). The first frame and the last frame are the same summer sky.

// ---------- camera with motion blur from its own velocity ----------
function camF(t, fn, mbK = 1) {
  const c = fn(t), c0 = fn(t - 1 / 60), C = camT(t, c[0], c[1], c[2], c[3] || {});
  if (mbK) window.__MBk[window.__shot] = { dx: (c0[0] - c[0]) * c[2] * mbK, dy: (c0[1] - c[1]) * c[2] * mbK, z: (c[2] - c0[2]) / c[2] * mbK, cx: 540, cy: 960 };
  return C;
}
const expo = p => p <= 0 ? 0 : p >= 1 ? 1 : 1 - Math.pow(2, -10 * p);
const snap = (t, t0, d = .22) => expo(seg(t, t0, t0 + d));
const kick = (t, t0, d = .5) => t < t0 ? 0 : Math.exp(-(t - t0) / (d * .3)) * Math.sin((t - t0) * 38);
const SHK = (t, hits) => { const [x, y] = shakeXY(t, hits); return { sx: x, sy: y }; };
const flashK = (op, col = '#fff8ec') => { if (!window.__FLASH || window.__FLASH.op < op) window.__FLASH = { op, col }; };
const ab = v => { window.__CA = Math.max(window.__CA || 0, v); };
const ease = easeInOut;
// a camera move that is under way almost at once: a short speed ramp, then a long settle (u, result 0..1)
const GLIDE = (() => { const N = 400, a = .12, pw = 1.5, c = [0]; for (let i = 1; i <= N; i++) { const x = (i - .5) / N, r = Math.min(1, x / a);
  c.push(c[i - 1] + r * r * (3 - 2 * r) * Math.pow(1 - x, pw)); } return c.map(v => v / c[N]); })();
const glide = u => { const f = clamp(u) * 400, i = Math.floor(f); return i >= 400 ? 1 : lerp(GLIDE[i], GLIDE[i + 1], f - i); };

// a figure at P = [x, y, s] (world), leaning `lean` deg about its waist; `top` = extra drawing in its local coordinates
function who(ch, t, P, pose = {}, { top = '', lean = 0, ph = 0, rate = 1, still = 0, tex = 1 } = {}) {
  const [x, y, s] = P, b = still ? 0 : brS(t, ph, rate) * .8;
  const inner = manb(x, y, s, ch, { breath: b, ...pose }) + (top ? atb(x, y, s, top, b) : '');
  const body = lean ? `<g transform="rotate(${F1(lean)} ${F1(x)} ${F1(y - 640 * s)})">${inner}</g>` : inner;
  return outlined(tex ? textured(body) : body, 0, { px: 1.3, col: '#1a120c', op: .5 });
}
// a whole figure rotated about a pivot (lying, falling)
const rotFig = (svg, a, cx, cy) => `<g transform="rotate(${F1(a)} ${F1(cx)} ${F1(cy)})">${svg}</g>`;

// ---------- light rigs ----------
const RIG_DAY = (t, o = {}) => ({ lights: [ { pos: [-800, 200, 800], col: '#fff2dc', int: 1.6, rad: 6000, shin: 20 }, { pos: [1500, 700, -300], col: '#ffe6c4', int: 1.1, rad: 2200, shin: 22 },
    { pos: [540, 2400, 1200], col: '#9ab4d8', int: .35, rad: 5000, shin: 12 }, ...(o.extra || []) ],
  amb: '#7a8cac', ambGround: '#6a5a48', ambInt: .42, bgLight: .95, exposure: 1.06, bloom: .35, bloomThresh: .82, white: 2.4, tonemap: 'soft', normalStrength: 1.4, specScale: .25,
  vignette: .42, grain: .014, shadowTint: '#1a3050', highTint: '#fff0d8', shadowAmt: .2, highAmt: .08, sat: .96, contrast: 1.07, ...(o.rays ? { rays: o.rays } : {}) });
const RIG_BLAST = (t, k = 1) => ({ lights: [ { pos: [-600, 900, 500], col: '#ffd8a0', int: 2.6 * k, rad: 4000, shin: 18 }, { pos: [1400, 600, -300], col: '#ff9a50', int: 1.0, rad: 2000, shin: 20 },
    { pos: [540, 2400, 1200], col: '#8a6a5a', int: .3, rad: 5000, shin: 12 } ],
  amb: '#6a5040', ambGround: '#3a2a20', ambInt: .36, bgLight: .9, exposure: 1.05, bloom: .55, bloomThresh: .72, white: 2.2, tonemap: 'soft', emisGain: 1.7, normalStrength: 1.3, specScale: .2,
  vignette: .55, grain: .02, shadowTint: '#2a1a14', highTint: '#ffe0b8', shadowAmt: .25, highAmt: .12, sat: .9, contrast: 1.1,
  rays: { center: [160, 1000], thresh: .55, srcRad: 500, samples: 40, step: .016, decay: .965, col: '#ffcf94', int: .9 * k } });
const RIG_ASH = (t, o = {}) => ({ lights: [ { pos: [-500, 700, 600], col: '#ffb070', int: 1.5, rad: 3600, shin: 18 }, { pos: [1500, 500, -300], col: '#d08a60', int: .9, rad: 2200, shin: 20 },
    { pos: [540, 2400, 1200], col: '#7a6a70', int: .3, rad: 5000, shin: 12 } ],
  amb: '#5a4a48', ambGround: '#2e2420', ambInt: .34, bgLight: .85, exposure: 1.08, bloom: .45, bloomThresh: .74, white: 2.2, tonemap: 'soft', emisGain: 1.6, normalStrength: 1.35, specScale: .2,
  vignette: .6, grain: .022, shadowTint: '#241820', highTint: '#ffd8b0', shadowAmt: .28, highAmt: .1, sat: .82, contrast: 1.12, ...(o.rays ? { rays: o.rays } : {}) });
const RIG_CLOUD = (t, g = .6) => ({ lights: [ { pos: [-600, -300, 800], col: '#ffe8c8', int: 1.3, rad: 6000, shin: 20 }, { pos: [540, 900, 300], col: '#ff9a50', int: 1.4 * g, rad: 1400, shin: 18 },
    { pos: [540, 2400, 1200], col: '#9a8a90', int: .3, rad: 5000, shin: 12 } ],
  amb: '#7a6e70', ambGround: '#3a2a26', ambInt: .4, bgLight: .9, exposure: 1.02, bloom: .5, bloomThresh: .72, white: 2.4, tonemap: 'soft', emisGain: 1.5, normalStrength: 1.3, specScale: .2,
  vignette: .55, grain: .018, shadowTint: '#2a2030', highTint: '#ffe0c0', shadowAmt: .22, highAmt: .1, sat: .86, contrast: 1.1,
  rays: { center: [540, 600], thresh: .55, srcRad: 500, samples: 40, step: .016, decay: .965, col: '#ffb070', int: .35 * g } });
const RIG_NIGHT = (t, { cx = 250, cy = 1560 } = {}) => ({ lights: [ { pos: [cx, cy, 200], col: '#ffc890', int: 2.2 * (.93 + .07 * flkSeam(t, 2)), rad: 900, shin: 24 },
    { pos: [540, 900, -260], col: '#f0705a', int: 1.5, rad: 1100, shin: 22 }, { pos: [540, 1600, 1600], col: '#4a5a90', int: .22, rad: 5000, shin: 12 } ],
  amb: '#20283c', ambGround: '#181210', ambInt: .22, bgLight: .5, exposure: 1.2, bloom: .5, bloomThresh: .7, white: 2.2, tonemap: 'soft', emisGain: 1.8, normalStrength: 1.3, specScale: .3,
  vignette: .66, grain: .024, shadowTint: '#0e1626', highTint: '#ffd8a8', shadowAmt: .3, highAmt: .1, sat: .9, contrast: 1.12 });
const RIG_GREY = (t, o = {}) => ({ lights: [ { pos: [-400, 200, 800], col: '#e8e4dc', int: 1.4, rad: 5000, shin: 20 }, { pos: [1400, 800, -300], col: '#d8d0c4', int: .9, rad: 2200, shin: 22 },
    { pos: [540, 2400, 1200], col: '#8a90a0', int: .35, rad: 5000, shin: 12 } ],
  amb: '#6a7080', ambGround: '#4a4440', ambInt: .44, bgLight: .9, exposure: 1.05, bloom: .3, bloomThresh: .82, white: 2.4, tonemap: 'soft', normalStrength: 1.35, specScale: .22,
  vignette: .5, grain: .018, shadowTint: '#1e2836', highTint: '#f0e8dc', shadowAmt: .22, highAmt: .06, sat: .78, contrast: 1.08, ...(o) });
const RIG_OFFICE = (t, { white = 0 } = {}) => ({ lights: [ { pos: [550, 680, -250], col: mix('#eef2f4', '#ffffff', white), int: 1.6 + 9 * white, rad: 1400 + 1600 * white, shin: 22 },
    { pos: [-300, 300, 800], col: '#f2e6d0', int: 1.0, rad: 4000, shin: 24 }, { pos: [540, 2400, 1200], col: '#8a90a8', int: .3, rad: 5000, shin: 12 } ],
  amb: '#7a7468', ambGround: '#4a3a2c', ambInt: .4, bgLight: .85, exposure: 1.08 + .4 * white, bloom: .4 + .5 * white, bloomThresh: .78 - .2 * white, white: 2.4, tonemap: 'soft', emisGain: 1.6, normalStrength: 1.35, specScale: .25,
  vignette: .5, grain: .016, shadowTint: '#1e2430', highTint: '#f6e8d0', shadowAmt: .2, highAmt: .08, sat: .88, contrast: 1.08,
  rays: { center: [550, 680], thresh: .6, srcRad: 420, samples: 40, step: .016, decay: .966, col: '#ffffff', int: .3 + 3 * white } });
const RIG_WRECK = t => ({ lights: [ { pos: [550, 600, -200], col: '#fff0d8', int: 2.2, rad: 1800, shin: 22 }, { pos: [-300, 400, 700], col: '#c8b8a0', int: .6, rad: 3000, shin: 20 },
    { pos: [540, 2400, 1200], col: '#7a7480', int: .3, rad: 5000, shin: 12 } ],
  amb: '#5a5248', ambGround: '#3a2e24', ambInt: .32, bgLight: .8, exposure: 1.1, bloom: .45, bloomThresh: .74, white: 2.2, tonemap: 'soft', emisGain: 1.5, normalStrength: 1.3, specScale: .2,
  vignette: .62, grain: .024, shadowTint: '#201a1a', highTint: '#f6e6cc', shadowAmt: .26, highAmt: .1, sat: .72, contrast: 1.12,
  rays: { center: [550, 680], thresh: .6, srcRad: 420, samples: 40, step: .016, decay: .966, col: '#fff0d8', int: 1.2 } });
const RIG_SPRING = t => ({ lights: [ { pos: [1300, 300, 600], col: '#fff4e4', int: 1.5, rad: 5000, shin: 22 }, { pos: [-400, 800, -200], col: '#e8eef8', int: .9, rad: 2200, shin: 20 },
    { pos: [540, 2400, 1200], col: '#9aa8c8', int: .35, rad: 5000, shin: 12 } ],
  amb: '#8a90a0', ambGround: '#6a5a4a', ambInt: .46, bgLight: .95, exposure: 1.05, bloom: .38, bloomThresh: .8, white: 2.4, tonemap: 'soft', normalStrength: 1.3, specScale: .22,
  vignette: .42, grain: .014, shadowTint: '#2a3448', highTint: '#fff4e4', shadowAmt: .18, highAmt: .08, sat: .92, contrast: 1.05 });
const RIG_ROOM = (t, o = {}) => ({ lights: [ { pos: [-300, 300, 900], col: '#fff0dc', int: 1.4, rad: 5000, shin: 22 }, { pos: [1400, 600, -200], col: '#f0e4d0', int: 1.0, rad: 2400, shin: 22 },
    { pos: [540, 2400, 1200], col: '#9aa0b8', int: .35, rad: 5000, shin: 12 }, ...(o.extra || []) ],
  amb: '#7a7870', ambGround: '#5a4a3c', ambInt: .44, bgLight: .9, exposure: 1.06, bloom: .38, bloomThresh: .8, white: 2.4, tonemap: 'soft', emisGain: 1.6, normalStrength: 1.3, specScale: .24,
  vignette: .48, grain: .014, shadowTint: '#1e2836', highTint: '#fff0d8', shadowAmt: .2, highAmt: .08, sat: .9, contrast: 1.06 });
const RIG_DUSK = t => ({ lights: [ { pos: [540, 1300, -300], col: '#ffb080', int: 2.0, rad: 2400, shin: 20 }, { pos: [-300, 400, 700], col: '#9a90c0', int: .6, rad: 3000, shin: 20 },
    { pos: [540, 2400, 1200], col: '#5a5070', int: .3, rad: 5000, shin: 12 } ],
  amb: '#4a4060', ambGround: '#2a2026', ambInt: .34, bgLight: .9, exposure: 1.08, bloom: .45, bloomThresh: .76, white: 2.2, tonemap: 'soft', normalStrength: 1.3, specScale: .2,
  vignette: .6, grain: .018, shadowTint: '#1a1430', highTint: '#ffd0a8', shadowAmt: .25, highAmt: .1, sat: .9, contrast: 1.1 });

// ---------- poses ----------
const HS = 1.5;
const blinkL = (t, list) => blinkAt(t, list);
// the briefcase in the screen-left hand (k = -1), swinging a little with the walk
const caseArm = (sw = 0) => jArm(-1, [-150 - 3 * sw, -768], [-166 - 12 * sw, -614 + 4 * Math.abs(sw)], 'hold', { hs: HS });
const withCase = (A, t, sw = 0) => { const F = fistAt(A, HS); return briefcase(F[0], F[1] - 4, .62, 4 * sw) + gripHandOn(A, -1, SKJ, 'jp', HS); };
// a sling for the burned arm (k = +1): the upper arm hangs at his side, the forearm rests across his stomach, hand a
// little raised, cradled in a triangular cloth whose two straps go up to his neck
const slingArm = () => ({ ...tArm(1, [-20, -820], 'relax', { hs: HS, bend: -1 }), front: true });
const slingCloth = (A = slingArm()) => {
  const { el: E, wr: W } = A, d = unit(E, W), nd = [d[1], -d[0]][1] > 0 ? [d[1], -d[0]] : [-d[1], d[0]];
  const P = (p, a, b) => [p[0] + d[0] * a + nd[0] * b, p[1] + d[1] * a + nd[1] * b], f = p => `${F1(p[0])} ${F1(p[1])}`;
  const a = P(E, -16, -10), b = P(W, 14, -12), c = P(W, 8, 26), m = P(lerp2(E, W, .45), 0, 70), e = P(E, -12, 34);
  const strap = (p0, p1, w0, w1) => { const u = unit(p0, p1), n = [-u[1], u[0]]; return `M${F1(p0[0] + n[0] * w0)} ${F1(p0[1] + n[1] * w0)} L${F1(p1[0] + n[0] * w1)} ${F1(p1[1] + n[1] * w1)} L${F1(p1[0] - n[0] * w1)} ${F1(p1[1] - n[1] * w1)} L${F1(p0[0] - n[0] * w0)} ${F1(p0[1] - n[1] * w0)} Z`; };
  const s1 = strap(P(W, 6, -4), [-46, -986], 16, 12), s2 = strap(P(E, -6, -6), [44, -992], 15, 12);
  const pouch = `M${f(a)} L${f(b)} Q${f(P(W, 22, 6))} ${f(c)} Q${f(m)} ${f(e)} Q${f(P(E, -26, 12))} ${f(a)} Z`;
  return `<g opacity=".32" transform="translate(-5 9)"><g filter="url(#castSh)"><path d="${pouch}"/><path d="${s1}"/><path d="${s2}"/></g></g>
    <g filter="url(#pcl)" fill="#e9e5db"><path d="${s1}"/><path d="${s2}"/></g>
    <g filter="url(#pcl)" fill="#efebe2"><path d="${pouch}"/></g>
    <g stroke="#a8a090" fill="none" stroke-linecap="round" opacity=".6">
      <path d="M${f(P(E, -4, 26))} Q${f(P(lerp2(E, W, .45), 0, 48))} ${f(P(W, 0, 18))}" stroke-width="2"/><path d="M${f(P(E, 10, 40))} Q${f(P(lerp2(E, W, .5), 0, 58))} ${f(P(W, -16, 26))}" stroke-width="1.6" opacity=".7"/>
      <path d="M${f(a)} L${f(b)}" stroke-width="2.2" opacity=".55"/></g>`;
};
// ---------- the cast placements reused across shots ----------
const LOOP_SKY_FY = -1500;   // the opening / closing frame: only sky

// ================= SHOTS =================
const SHOTS = [
  // 1 "It's August sixth, 1945." — the summer sky; the camera cranes down to the domed hall across the river; a tram
  //   crosses the bridge. Frame 0 is pure sky (= the last frame).
  { at: 0, draw(v, t) {
      const C = camF(t, t => { const p = glide(seg(t, 0, 2.62)); return [540, lerp(LOOP_SKY_FY, 820, p), lerp(1.0, 1.12, p), { hh: .6 }]; }, .45);
      return `<g transform="${C.tf}">${lights(C.v, RIG_DAY(t))}${riverView(t, C, { tram: .1 + .2 * seg(t, 0, 2.6) })}</g>`;
    } },
  // 2 "The last day of your business trip to Hiroshima." — he walks toward us down a street of wooden houses, briefcase
  //   swinging; the camera dollies back with him (the street recedes); his eyes take in the town
  { at: 2.62, draw(v, t) {
      const st = stride(t, .62, 22), sw = Math.sin(t / .62 * Math.PI);
      const C = camF(t, t => [540, 1040 - 10 * seg(t, 2.62, 4.98), lerp(1.06, 1.12, seg(t, 2.62, 4.98)), { hh: .8 }]);
      const A = caseArm(sw), RA = jArm(1, [150 + 3 * sw, -768], [166 - 14 * sw, -614 + 5 * Math.abs(sw)], 'relax', { hs: HS });
      const look = kf(t, [[2.62, -6], [3.3, -6], [3.6, 6], [4.3, 6], [4.6, 0]]);
      return `<g transform="${C.tf}">${lights(C.v, RIG_DAY(t))}${street1945(t, { cz: -(t - 2.62) * 300 })}
        ${who(TSU, t, [540, 2290 + st.bob * 2.4, 1.12], { armL: A, armR: RA, ...st, smirk: .35, look, lookY: -1, lid: blinkL(t, [3.9]), turn: look * .012 }, { top: withCase(A, t, sw) })}</g>`;
    } },
  // 3 "You're twenty-nine years old." — he stops; the free hand comes up to shade his eyes; he squints at the bright sky
  //   with a small smile. Slow push-in on his face, the street soft behind him.
  { at: 4.98, draw(v, t) {
      const up = ease(seg(t, 5.25, 5.8)), C = camF(t, t => [560, lerp(905, 880, ease(seg(t, 4.98, 6.6))), lerp(2.75, 3.05, ease(seg(t, 4.98, 6.6))), { hh: .7 }]);
      const R0 = tHang(1, 0, 0, { hs: HS }), R1 = { ...aim(tArm(1, [40, -1112], 'none', { hs: HS, bend: 1 }), 186), gh: 'back', front: true };
      const RA = up < 1 ? armMix(R0, { ...R1, hand: 'relax' }, up) : R1, A = caseArm(0);
      const top = withCase(A, t) + (up > .99 ? gripHandOn(R1, 1, SKJ, 'jp', HS) : '');
      return `<g transform="${C.tf}">${lights(C.v, RIG_DAY(t))}<g filter="url(#dofHeavy)">${street1945(t, { cz: -700 })}</g>
        ${who(TSU, t, [560, 1720, .8], { armL: A, armR: up > .99 ? R1 : RA, smirk: lerp(.3, .55, up), lookY: lerp(0, -6, up), look: 2, squint: .5 * up, lid: lerp(0, .35, up) + blinkL(t, [5.1]), tilt: lerp(0, -4, up), bIn: 3 * up }, { top })}</g>`;
    } },
  // 4 "At eight fifteen AM," — ECU of his wristwatch: the seconds sweep; on "fifteen" the minute hand clicks onto 15
  { at: 6.60, draw(v, t) {
      const tk = (t - 6.6) / .35, secs = 58 + Math.floor(tk) + snap(t, 6.6 + Math.floor(tk) * .35, .06) * 0, mClick = snap(t, 7.3, .1), hm = 8 + (14 + mClick) / 60;
      const C = camF(t, t => [560, 980, lerp(1.0, 1.1, ease(seg(t, 6.6, 8.02))), { hh: .5 }]);
      const A = { el: [-420, 1640], wr: [700, 1060] }, d = unit(A.el, A.wr), ang = Math.atan2(d[1], d[0]) * 180 / Math.PI - 90;
      const arm = `<g filter="url(#pk_jp)"><path d="${capsuleD(-420, 1640, 104, 700, 1060, 84)}" fill="${SKJ.mid}"/></g>
        <g filter="url(#softW)"><path d="M-380 1560 C0 1360 360 1170 680 1010" stroke="${SKJ.hi}" stroke-width="44" fill="none" opacity=".32"/><path d="M-360 1720 C0 1520 380 1330 700 1140" stroke="${SKJ.deep}" stroke-width="40" fill="none" opacity=".3"/></g>
        <g filter="url(#pcl)" fill="#e4ddcc"><path d="${band([-330, 1592], d, 132, 150, 8)}"/></g>`;
      const hand = normFix(ang + 6, 1, handHold(1, 720, 1050, 5.6, ang + 6, { S: SKJ, sk: 'jp' }));
      const bc = `<g filter="url(#dof)">${briefcase(760, 1180, 2.6, 6)}</g>`;
      return `<g transform="${C.tf}">${lights(C.v, RIG_DAY(t))}<g filter="url(#dofHeavy)">${street1945(t, { cz: -700 })}<rect x="-400" y="1200" width="1880" height="1200" fill="#9a8264" opacity=".85"/></g>
        ${bc}${arm}${wristWatch(330, 1290, 1.6, hm, { secs: secs % 60, glint: bell(t, 7.4, 7.9) })}${hand}</g>`;
    } },
  // 5 "the sky turns white." — low angle: he looks up, shading his eyes; a silver B-29 crosses high with a parachute
  //   drifting; the sky above him blooms to white
  { at: 8.02, draw(v, t) {
      const w = ease(seg(t, 8.85, 9.5)), C = camF(t, t => [540, lerp(660, 620, seg(t, 8.02, 9.6)), lerp(2.5, 2.75, ease(seg(t, 8.02, 9.6))), { hh: .5, r: 4 }]);
      const R1 = { ...aim(tArm(1, [40, -1112], 'none', { hs: HS, bend: 1 }), 186), gh: 'back', front: true };
      flashK(.95 * Math.pow(w, 1.6), '#fffaf0'); if (w > .2) ab(.004 * w);
      const sky = `${sky1945({ y0: -400, y1: 1600, top: '#3a74b8', mid: ['#78aad8', '#c4dcea'], haze: '#e4ecec' })}${cumulus(240, 640, 520, 200, { seed: 51 })}${cumulus(920, 420, 380, 150, { seed: 53, op: .85 })}
        ${b29(lerp(720, 560, seg(t, 8.02, 9.6)), 400, -14, 1.6)}${parachute(640, lerp(470, 500, seg(t, 8.02, 9.6)), 1.5, Math.sin(t * 2) * 6)}
        <g filter="url(#pe32)"><circle cx="640" cy="440" r="${F1(40 + 700 * w)}" fill="#ffffff" opacity="${F1(.95 * w)}"/></g>`;
      return `<g transform="${C.tf}">${lights(C.v, RIG_DAY(t, { extra: [{ pos: [760, 300, 400], col: '#ffffff', int: 9 * w, rad: 2400, shin: 20 }] }))}${sky}
        ${who(TSU, t, [500, 1740, .82], { armL: caseArm(0), armR: R1, smirk: lerp(.2, -.4, w), lookY: -10, look: 5, squint: lerp(.4, 1, w), lid: lerp(.3, 1.2, w), tilt: -9, bIn: 4 + 4 * w, shock: .3 * w }, { top: gripHandOn(R1, 1, SKJ, 'jp', HS) })}</g>`;
    } },
  // 6 "The shockwave throws you" — out of the white: the field, the fireball over the city; a wall of dust races in from
  //   the left with debris; it lifts him off his feet and throws him
  { at: 9.62, draw(v, t) {
      const q = t - 9.62, front = lerp(-700, 1700, ease(seg(t, 9.75, 10.95))), hit = 10.33, fly = clamp((t - hit) / .7);
      const C = camF(t, t => [560, 1180, 1.0, { hh: .6, ...SHK(t, [[10.33, 34, .9]]) }]);
      const x = 600 + 760 * easeIn(fly), y = 1560 - 300 * Math.sin(fly * Math.PI) + 60 * fly, rot = 95 * ease(fly);
      const fl = t * 13, arms = fly > 0 ? { armL: tArm(-1, [-230 + 50 * Math.sin(fl), -1090 + 90 * Math.cos(fl * .8)], 'openJ', { hs: HS, spread: 1 }), armR: tArm(1, [240 + 60 * Math.cos(fl * 1.1), -1000 + 100 * Math.sin(fl * .9)], 'openJ', { hs: HS, spread: 1 }) } : { armL: tHang(-1), armR: tHang(1) };
      const man = rotFig(who(TSU, t, [x, y, .42], { ...arms, turn: -.3, look: -8, shock: fly > 0 ? .8 : .3, grit: fly > 0 ? .5 : 0, lid: 0, legL: { lift: 120 * Math.sin(Math.min(1, fly * 2) * Math.PI / 2) }, legR: { lift: 40 * fly + 30 * Math.sin(fl) * fly } }), rot, x, y - 260);
      return `<g transform="${C.tf}">${lights(C.v, RIG_BLAST(t, 1 - .5 * seg(t, 9.62, 11.1)))}
        ${sky1945({ y0: -400, y1: 1200, top: '#8a7a70', mid: ['#c8a888', '#e8c8a0'], haze: '#f0d8b0' })}
        ${fireball(170, 1060, 140 + 120 * seg(t, 9.62, 11.1), 1 - .4 * seg(t, 9.62, 11.1))}${mushroomCloud(170, 1080, q, { s: .22, age: .05 + .2 * seg(t, 9.62, 11.1), glow: 1 })}
        ${cityHorizon(1090, t, { burn: 1, col: '#2a2420' })}
        ${potatoField(t, { hy: 1090, rows: 12, near: 2300, wind: clamp((front - 300) / 600), sky: '#c8a080', dust: .5 })}
        ${man}${dustWall(front, 1700, 900, t, { col: '#a88a6c', lightC: '#f4dcb4' })}${debris(t, seg(t, 9.9, 11.1), { n: 90, y0: 500, y1: 1900 })}</g>`;
    } },
  // 7 "into a potato field." — low among the plants: he slams down into the furrow; dust bursts; grit rains down
  { at: 11.10, draw(v, t) {
      const land = 11.32, f = clamp((t - 11.1) / (land - 11.1)), after = t > land;
      const C = camF(t, t => [540, 1260, 1.0, { hh: .6, r: lerp(-3, 0, seg(t, 11.3, 12.4)), ...SHK(t, [[11.32, 40, .7]]) }]);
      const x = lerp(80, 540, ease(f)), y = lerp(700, 1560, easeIn(f)), rot = lerp(50, 84, f);
      const curl = ease(seg(t, land, land + .5));
      const man = rotFig(who(TSU_BURNT, t, [x, y + 640 * .6, .6], { armL: tArm(-1, [-150, -1230], 'relax', { hs: HS }), armR: tHang(1, 0, 0, { hs: HS }), legL: { lift: 160 * curl + 40 }, legR: { lift: 90 * curl + 20 }, lid: 2, squeeze: 1, grit: .6, soot: .5, burn: .4, tilt: 12 }, { still: 1 }), rot, x, y);
      const burst = after ? `<g filter="url(#b16)" opacity="${F1(.85 * (1 - seg(t, land, land + 1)))}">${Array.from({ length: 10 }, (_, i) => `<circle cx="${F1(540 + Math.cos(i * .63) * 320 * seg(t, land, land + .6))}" cy="${F1(1560 - Math.abs(Math.sin(i * .63)) * 260 * seg(t, land, land + .6))}" r="${F1(90 + 60 * seg(t, land, land + .6))}" fill="#9a8468"/>`).join('')}</g>` : '';
      return `<g transform="${C.tf}">${lights(C.v, RIG_ASH(t))}
        ${sky1945({ y0: -400, y1: 1000, top: '#5a4a48', mid: ['#8a6a5a', '#b88a68'], haze: '#c8a07a' })}${smoke(300, 980, t, { seed: 9, n: 10, H: 900, drift: 300, r0: 120, r1: 420, col: '#7a6050', op: .35, speed: .05, blur: 'b40' })}
        ${potatoField(t, { hy: 960, rows: 9, near: 1560, sky: '#a08060', wind: .4, dust: .6 })}${man}${burst}
        <g filter="url(#pcl)">${potatoField(t + 3, { hy: 1600, rows: 4, near: 2300, seed: 9, sky: '#a08060', wind: .6, dust: .4 }).replace(/^<path[^>]*>/, '')}</g>
        ${ashFall(t, { n: 70, col: '#3a3028', size: 5, speed: .35, dark: 1 })}</g>`;
    } },
  // 8 "Your eardrums burst." — ECU: his face on its side in the dirt, eyes squeezed shut, a hand clamped over his ear;
  //   the world rings and pulses
  { at: 12.42, draw(v, t) {
      const pulse = Math.max(0, Math.sin((t - 12.42) * 9)) * (1 - seg(t, 12.42, 13.98) * .6);
      ab(.004 + .006 * pulse);
      const C = camF(t, t => [560, 960, lerp(1.5, 1.62, seg(t, 12.42, 13.98)) * (1 + .012 * Math.max(0, Math.sin((t - 12.42) * 9))), { hh: .4, r: -2 }]);
      const RA = { ...aim(tArm(1, [74, -1112], 'none', { hs: HS, bend: 1 }), -95), gh: 'back', front: true };
      const sF = 3.4, face = rotFig(who(TSU_BURNT, t, [560, 960 + 1075 * sF, sF], { armR: RA, armL: tHang(-1), lid: 2, squeeze: 1, grit: .7, soot: .7, burn: .7, bIn: 8, bust: 1, tilt: 0 }, { top: gripHandOn(RA, 1, SKJ, 'jp', HS), still: 1 }), -84, 560, 960);
      return `<g transform="${C.tf}">${lights(C.v, RIG_ASH(t))}<rect x="-400" y="-400" width="1880" height="2800" fill="#6a5440"/>
        <g fill="#4a3a2a">${Array.from({ length: 120 }, (_, i) => { const R = rng(i + 3); return `<ellipse cx="${F1(R() * 1100)}" cy="${F1(R() * 1920)}" rx="${F1(4 + R() * 14)}" ry="${F1(3 + R() * 8)}" opacity=".6"/>`; }).join('')}</g>
        ${face}<g fill="#d8c8b0" opacity=".6">${ashFall(t, { n: 40, col: '#c8b8a0', size: 3, speed: .05 })}</g>
        <g filter="url(#dofHeavy)"><path d="M-400 1300 C100 1200 600 1260 1500 1180 L1500 2400 L-400 2400 Z" fill="#4a3826" opacity=".7"/></g></g>`;
    } },
  // 9 "The left side of your body is burned raw." — he pushes up on one arm; his left arm and the left of his face are raw,
  //   the shirt scorched; he stares at the arm. Smoke drifts; ash falls. The camera arcs around him.
  { at: 13.98, draw(v, t) {
      const up = ease(seg(t, 14.0, 14.7)), tr = Math.sin(t * 26) * 4 * up;
      const C = camF(t, t => { const p = ease(seg(t, 13.98, 16.38)); return [lerp(500, 580, p), lerp(1180, 1150, p), lerp(1.5, 1.62, p), { hh: .7, r: lerp(2, -2, p) }]; });
      const LA = tArm(-1, [-200, -640], 'back', { hs: HS, bend: 1 }), RA = jArm(1, [156, -790], [44 + tr, -886 + tr], 'openJ', { hs: HS, spread: .5, curl: .35 });
      return `<g transform="${C.tf}">${lights(C.v, RIG_ASH(t))}
        ${sky1945({ y0: -400, y1: 1100, top: '#4a3c3c', mid: ['#7a5a50', '#a87a60'], haze: '#c08a64' })}${smoke(700, 1040, t, { seed: 13, n: 12, H: 1100, drift: 200, r0: 140, r1: 460, col: '#6a5248', op: .32, speed: .05, blur: 'b40' })}
        ${potatoField(t, { hy: 1040, rows: 8, near: 2000, sky: '#a07a5a', wind: .2, dust: .6 })}
        ${who(TSU_BURNT, t, [560, lerp(2860, 2720, up), 1.6], { armL: LA, armR: RA, bust: 1, burn: 1, soot: .8, look: 6, lookY: 6, lid: .2 + blinkL(t, [15.6]), tilt: lerp(4, 10, up), turn: .1, shock: .4, smirk: -.6, open: .1, bIn: 9, bOut: 2 }, { lean: -6 })}
        ${ashFall(t, { n: 60, col: '#c8bcb0', size: 4, speed: .12 })}
        <g filter="url(#dof)"><g filter="url(#pcl)">${potatoField(t + 5, { hy: 1560, rows: 4, near: 2300, seed: 11, sky: '#a07a5a', wind: .3 }).replace(/^<path[^>]*>/, '')}
          ${[[180, 1700, 1.9], [420, 1690, 2.2], [650, 1700, 2.1], [880, 1710, 2.0], [300, 1840, 2.4], [760, 1850, 2.5], [1100, 1760, 2.2], [-60, 1760, 2.2]].map(([x, y, sc], i) => leafClump(x, y, sc, t, { seed: i + 3, wind: .3 })).join('')}</g></g></g>`;
    } },
  // 10 "And above the city," — over his shoulder: the city on the horizon is burning; a dark column climbs out of it.
  //   The camera rises with the column.
  { at: 16.38, draw(v, t) {
      const C = camF(t, t => [560, lerp(1240, 1000, ease(seg(t, 16.38, 17.42))), 1.05, { hh: .5 }]);
      return `<g transform="${C.tf}">${lights(C.v, RIG_CLOUD(t, .8))}
        ${sky1945({ y0: -800, y1: 1400, top: '#5a6a84', mid: ['#8a8a94', '#c09a7a'], haze: '#d0a070' })}
        ${mushroomCloud(380, 1330, t - 14, { s: .55, age: .42 + .06 * seg(t, 16.38, 17.42), glow: .5 })}
        ${cityHorizon(1340, t, { burn: 1 })}${potatoField(t, { hy: 1340, rows: 8, near: 2200, sky: '#a88468', dust: .5 })}
        ${backBust(820, 2100, 1.05, { turn: -.2 })}</g>`;
    } },
  // 11 "a cloud climbs into the sky like nothing you've ever seen." — the cloud boils upward; we tilt up with it; he is a
  //   tiny silhouette in the field below
  { at: 17.42, draw(v, t) {
      const p = seg(t, 17.42, 21.12), age = .48 + .47 * ease(p);
      const C = camF(t, t => { const p = ease(seg(t, 17.42, 21.12)); return [540, lerp(1150, 700, p), lerp(1.0, .9, p), { hh: .5 }]; });
      return `<g transform="${C.tf}">${lights(C.v, RIG_CLOUD(t, 1 - .6 * p))}
        ${sky1945({ y0: -1400, y1: 1500, top: '#3e5a80', mid: ['#7a8aa0', '#b8a090'], haze: '#c89a74' })}
        ${mushroomCloud(560, 1480, t - 14, { s: .82, age, glow: .7 - .5 * p })}
        ${cityHorizon(1490, t, { burn: 1, col: '#2a2420' })}
        ${potatoField(t, { hy: 1500, rows: 7, near: 2500, seed: 21, sky: '#4a3830', dust: .3 })}
        ${backBust(240, 1620, .26, { turn: .1 })}
        <g filter="url(#pcl)">${[[150, 1648, .38], [215, 1655, .42], [285, 1650, .38], [345, 1645, .34], [110, 1690, .5], [250, 1700, .55], [390, 1692, .5]].map(([x, y, sc], i) => leafClump(x, y, sc, t, { seed: i + 40, wind: .2, sky: '#4a3830', haze: .25 })).join('')}</g></g>`;
    } },
  // 12 "You spend the night in an air raid shelter." — candlelight in an earthen shelter; others huddled in the dark; the
  //   city glows red through the entrance; he stares, bandaged, the flame in his eyes
  { at: 21.12, draw(v, t) {
      const C = camF(t, t => [640, lerp(1300, 1240, seg(t, 21.12, 23.3)), lerp(1.2, 1.42, ease(seg(t, 21.12, 23.3))), { hh: .4 }]);
      return `<g transform="${C.tf}">${lights(C.v, RIG_NIGHT(t))}${shelterSet(t)}
        ${huddled(560, 1580, .7, { seed: 2 })}${huddled(380, 1600, .6, { seed: 5 })}
        ${who(TSU_BAND, t, [790, 3700, 2.25], { bust: 1, burn: .6, soot: .6, look: -9, lookY: 3, lid: .35 + blinkL(t, [22.4]), smirk: -.3, tilt: 6, turn: -.2, bIn: 5 })}
        ${candle(250, 1620, t, 1)}</g>`;
    } },
  // 13 "The next day," — a ruined station in grey haze; a locomotive breathes steam; people with bundles shuffle past
  { at: 23.30, draw(v, t) {
      const C = camF(t, t => [lerp(480, 620, seg(t, 23.3, 24.24)), 1100, 1.08, { hh: .5 }]);
      return `<g transform="${C.tf}">${lights(C.v, RIG_GREY(t))}${stationSet(t, { scroll: (t - 23.3) * 120 })}${locomotive(1250, 1500, .95, { t, roll: 0 })}</g>`;
    } },
  // 14 "you drag yourself onto a train" — from inside the carriage door: he grips the door rail with his good hand and
  //   hauls himself up the steps; the burned arm rides in its sling
  { at: 24.24, draw(v, t) {
      const rise = ease(seg(t, 24.3, 25.7)), y = lerp(3560, 3330, rise);
      const C = camF(t, t => [500, lerp(1150, 1080, seg(t, 24.24, 25.92)), 1.25, { hh: .8, r: 3 }]);
      const railW = [300, 1120], P0 = [610, y, 2.15], RL = toLocal(railW, P0[0], P0[1], P0[2]);
      const RA = { ...aim(tArm(-1, RL, 'none', { hs: HS }), 0), gh: 'hold' };
      return `<g transform="${C.tf}">${lights(C.v, RIG_GREY(t))}<g filter="url(#dofHeavy)">${stationSet(t, { scroll: 300, smokeK: .6 })}</g>
        <g filter="url(#pcl)"><rect x="270" y="-400" width="60" height="2900" fill="#c8a050"/></g><path d="M282 -400 L282 2500" stroke="#fff4c8" stroke-width="6" opacity=".4"/>
        ${who(TSU_BAND, t, P0, { armL: RA, armR: slingArm(), bust: 1, burn: .6, soot: .5, grit: .5 * (1 - rise * .5), lid: .4, squint: .5, look: -3, lookY: -4, tilt: -4, bIn: 8 }, { top: slingCloth() + gripHandOn(RA, -1, SKJ, 'jp', HS) })}
        <g filter="url(#pcl)"><path d="M-400 -400 L180 -400 L180 2500 L-400 2500 Z M1000 -400 L1480 -400 L1480 2500 L1000 2500 Z" fill="#3a2a1e"/></g>
        <g filter="url(#dof)"><g filter="url(#pcl)"><path d="M-400 1830 L1480 1800 L1480 2600 L-400 2600 Z" fill="#4a3a2c"/></g><path d="M-400 1830 L1480 1800" stroke="#8a7a62" stroke-width="10"/></g></g>`;
    } },
  // 15 "and go home" — the train steams across the countryside toward the sea, the camera tracking alongside
  { at: 25.92, draw(v, t) {
      const sc = (t - 25.92) * 820, C = camF(t, t => [540, 1060, 1.0, { hh: .4 }]);
      return `<g transform="${C.tf}">${lights(C.v, RIG_DAY(t))}${countryside(t, sc + 2000, { hy: 1100 })}
        <path d="M-400 1290 L1480 1290 L1480 1420 L-400 1420 Z" fill="#6a5a48"/><path d="M-400 1290 L1480 1290" stroke="#3a3632" stroke-width="6"/>
        ${carriage(80, 1300, .72, { roll: sc })}${carriage(700, 1300, .72, { roll: sc })}${locomotive(1330, 1300, .72, { t, roll: sc })}
        <path d="M-400 1420 L1480 1420 L1480 2400 L-400 2400 Z" fill="#6a8a48"/><g filter="url(#dof)">${potatoField(t, { hy: 1700, rows: 3, near: 2500, seed: 3, sky: '#b8c8a8' })}</g></g>`;
    } },
  // 16 "to your wife and baby son in Nagasaki." — in the carriage he sits on the bench and looks at a photograph: Hisako
  //   and the baby, held in his good hand; we push in until the photo fills the frame
  { at: 27.20, draw(v, t) {
      const P0 = [420, 2233, .95], RA = jArm(-1, [-160, -786], [-24, -772], 'back', { hs: HS, curl: .4 }), W = toWorld(RA.wr, P0[0], P0[1], P0[2]);
      const C = camF(t, t => { const p = ease(seg(t, 27.4, 28.9)); return [lerp(560, W[0] + 118, p), lerp(1180, W[1] - 24, p), lerp(1.15, 2.6, p), { hh: .4 }]; });
      const bench = `<rect x="-600" y="1490" width="2400" height="100" fill="#4a5a3e"/><g filter="url(#pcl)"><path d="M-600 1588 L1800 1588 L1800 1652 L-600 1652 Z" fill="#5a6c4c"/></g>
        <path d="M-600 1591 L1800 1591" stroke="#7a8c68" stroke-width="5" opacity=".6"/><g filter="url(#pcl)"><path d="M-600 1652 L1800 1652 L1800 1880 L-600 1880 Z" fill="#3e2c1e"/></g>
        <path d="M-600 1880 L1800 1880 L1800 2600 L-600 2600 Z" fill="#2a2018"/>`;
      const thumb = `<g filter="url(#pks_jp)"><path d="${capsuleD(W[0] - 2, W[1] - 2, 10, W[0] + 20, W[1] - 14, 8)}" fill="${SKJ.mid}"/></g><ellipse cx="${F1(W[0] + 18)}" cy="${F1(W[1] - 14)}" rx="4" ry="5" fill="${SKJ.hi}" opacity=".5"/>`;
      return `<g transform="${C.tf}">${lights(C.v, RIG_ROOM(t))}${carriageInterior(t, (t - 27.2) * 900)}${bench}
        ${who(TSU_BAND, t, P0, { armL: RA, armR: { ...slingArm(), hand: 'none' }, bust: 1, sit: 1, burn: .4, soot: .3, look: 6, lookY: 5, lid: .62 + blinkL(t, [27.6]), smirk: lerp(0, .5, seg(t, 27.8, 28.6)), tilt: 10, turn: .2 }, { top: slingCloth() })}
        ${photoHisako(W[0] + 124, W[1] - 22, .78, { rot: -6 })}${thumb}</g>`;
    } },
  // 17 "Three days after Hiroshima," — Nagasaki: the harbour, the hills of houses, the shipyard cranes; a slow pan
  { at: 28.98, draw(v, t) {
      const C = camF(t, t => [lerp(420, 640, ease(seg(t, 28.98, 30.72))), 960, 1.06, { hh: .4 }]);
      return `<g transform="${C.tf}">${lights(C.v, RIG_GREY(t, { sat: .86, exposure: 1.08 }))}${nagasakiView(t, C)}</g>`;
    } },
  // 18 "you walk into your office, bandaged head to toe," — the drafting office; he limps in, bandaged; the clerks look up
  { at: 30.72, draw(v, t) {
      const p = seg(t, 30.72, 33.42), st = stride(t, .7, 16), x = lerp(170, 470, ease(p));
      const C = camF(t, t => [lerp(420, 520, ease(seg(t, 30.72, 33.42))), 1180, 1.08, { hh: .6 }]);
      const lookUp = ease(seg(t, 31.2, 31.6));
      const cols = who(COL1, t, [880, 1990, .62], { bust: 1, look: -10 * lookUp, turn: -.3 * lookUp, shock: .4 * lookUp, lid: 0 }, { ph: 1 }) + desk(880, 1600, 420, .7, { seed: 6, board: 1 });
      return `<g transform="${C.tf}">${lights(C.v, RIG_OFFICE(t))}${officeSet(t, { clockT: 10.95 + (t - 30.72) / 3600, colleagues: cols })}
        ${who(TSU_BAND, t, [x, 1740 + st.bob * 2, .78], { armL: tHang(-1), armR: slingArm(), ...st, burn: .5, soot: .3, look: 6 * lookUp, lid: .3, smirk: -.2, tilt: 3 }, { top: slingCloth() })}
        ${desk(-60, 1900, 600, 1.1, { seed: 8, board: 1, lamp: 1 })}</g>`;
    } },
  // 19 "to report what you saw." — at the boss's desk he describes it with his good hand: a flash, this big
  { at: 33.42, draw(v, t) {
      const sweep = ease(seg(t, 33.6, 34.3)), C = camF(t, t => [560, 860, lerp(1.9, 2.05, seg(t, 33.42, 34.82)), { hh: .7 }]);
      const A0 = tArm(-1, [-110, -900], 'openJ', { hs: HS, bend: 1, spread: .5 }), A1 = tArm(-1, [-250, -1180], 'openJ', { hs: HS, spread: 1.2 });
      return `<g transform="${C.tf}">${lights(C.v, RIG_OFFICE(t))}<g filter="url(#dofHeavy)">${officeSet(t, { clockT: 11.0 })}</g>
        ${who(TSU_BAND, t, [600, 1760, .8], { armL: armMix(A0, A1, sweep), armR: slingArm(), burn: .5, soot: .3, talk: talkW(t, 33.48, 34.71, .5), look: 6, lid: 0, shock: .3 + .3 * sweep, bIn: 6, turn: .25, tilt: -2 }, { top: slingCloth() })}</g>`;
    } },
  // 20 "Your boss doesn't believe you." — the boss leans back, shakes his head, waves it away
  { at: 34.82, draw(v, t) {
      const shake = Math.sin((t - 34.9) * 11) * bell(t, 34.9, 35.9), wave = bell(t, 35.2, 36.2);
      const C = camF(t, t => [560, 880, lerp(1.95, 2.1, seg(t, 34.82, 36.32)), { hh: .6 }]);
      const up = ease(seg(t, 35.1, 35.35)) * (1 - ease(seg(t, 36.0, 36.3))), sw = .5 - .5 * Math.cos(Math.max(0, t - 35.35) * 2 * Math.PI / .45);
      const A = armMix(tHang(1, 0, 0, { hs: HS }), jArm(1, [170, -792], [lerp(96, 246, sw), lerp(-884, -906, sw)], 'openJ', { hs: HS, spread: .8 }), up);
      return `<g transform="${C.tf}">${lights(C.v, RIG_OFFICE(t))}<g filter="url(#dofHeavy)">${officeSet(t, { clockT: 11.01 })}</g>
        ${who(BOSS, t, [540, 1760, .82], { armR: A, armL: tHang(-1), smirk: lerp(0, .5, seg(t, 35.4, 35.9)), side: -.5, lid: .3, turn: -.25 + .15 * shake, tilt: 4 * shake + 3, look: -6, bIn: -2, bOut: 6, talk: talkW(t, 35.4, 36.2, .25) }, { lean: -3 })}</g>`;
    } },
  // 21 "You're still insisting it's true when the window behind him turns white." — the two of them; he leans in, points
  //   back toward Hiroshima; the boss at his desk with the window behind him — and the window goes white
  { at: 36.32, draw(v, t) {
      const w = Math.pow(ease(seg(t, 39.35, 40.15)), 1.4), C = camF(t, t => [560, lerp(1000, 930, ease(seg(t, 36.32, 40.4))), lerp(1.2, 1.4, ease(seg(t, 36.32, 40.4))), { hh: .6 }]);
      flashK(.98 * Math.pow(seg(t, 39.8, 40.32), 1.5), '#ffffff'); if (w > .3) ab(.005 * w);
      const jab = Math.sin((t - 36.4) * 8) * bell(t, 36.5, 38.2);
      const PA = tArm(-1, [-420, -1010 + 26 * jab], 'pointF', { hs: HS });
      return `<g transform="${C.tf}">${lights(C.v, RIG_OFFICE(t, { white: w }))}${officeSet(t, { white: w, clockT: 11.03 })}
        ${desk(70, 1640, 640, .85, { seed: 2, lamp: 1 })}
        ${who(BOSS, t, [480, 1720, .7], { armL: tHang(-1), armR: tHang(1), turn: lerp(.25, 0, w), look: lerp(8, 0, w), lid: .2, smirk: lerp(.3, -.3, w), shock: .6 * w, bIn: 4 * w })}
        ${who(TSU_BAND, t, [900, 3150, 1.95], { armL: PA, armR: slingArm(), bust: 1, burn: .5, soot: .3, turn: -.35, look: -8, talk: talkW(t, 36.39, 38.14, .5), bIn: 8, tilt: 4, shock: .5 * w }, { top: slingCloth(), lean: -4 })}</g>`;
    } },
  // 22 "You survived that one too." — the wreck: the window blown in and, outside, the second cloud climbing; dust in the
  //   light, papers still falling; he pushes himself up out of the rubble, coughing
  { at: 40.40, draw(v, t) {
      const up = ease(seg(t, 40.6, 41.4)), C = camF(t, t => [560, 1150, lerp(1.25, 1.38, seg(t, 40.4, 41.86)), { hh: .7 }]);
      const Wk = officeWreck(t), P0 = [560, lerp(2400, 2140, up), .95], b = brS(t, 0, 1) * .8;
      const cough = ease(seg(t, 40.72, 40.98)) * (1 - ease(seg(t, 41.55, 41.8)));
      const PA = armMix(tHang(-1, 0, 0, { hs: HS }), jArm(-1, [-156, -800], [-22, -952], 'back', { hs: HS, curl: .3 }), cough);
      return `<g transform="${C.tf}">${lights(C.v, RIG_WRECK(t))}${Wk.back}
        ${who(TSU_BAND, t, P0, { bust: 1, armL: PA, armR: slingArm(), burn: .5, soot: 1, lid: lerp(1.6, .3, up), squint: .6, grit: .3 * (1 - up), talk: .3 * Math.abs(Math.sin(t * 9)) * bell(t, 40.9, 41.5), tilt: lerp(-10, 2, up), look: -3 }, { top: slingCloth() })}
        ${Wk.front}${cough > .5 ? atb(P0[0], P0[1], P0[2], redraw(-1, PA, SKJ, 'jp', HS), b) : ''}</g>`;
    } },
  // 23 "You live another sixty-five years." — spring, decades on: the old man sits on his veranda, hands on his knees, tea
  //   at his side; blossom near the lens, petals drifting
  { at: 41.86, draw(v, t) {
      const C = camF(t, t => [600, lerp(1200, 1150, seg(t, 41.86, 44.3)), lerp(1.12, 1.3, ease(seg(t, 41.86, 44.3))), { hh: .4 }]);
      const V = verandaSet(t), LA = tArm(-1, [-104, -660], 'back', { hs: HS, bend: 1, curl: .35 }), RA = tArm(1, [104, -656], 'back', { hs: HS, bend: -1, curl: .35 });
      return `<g transform="${C.tf}">${lights(C.v, RIG_SPRING(t))}${V.back}
        ${who(TSU_OLD, t, [400, 2800, 1.8], { bust: 1, lap: 1, armL: LA, armR: RA, look: 8, lookY: -3, lid: .45 + blinkL(t, [43.2]), smirk: .35, tilt: -3, turn: .2 }, { rate: .7, lean: 3 })}
        ${V.front}</g>`;
    } },
  // 24 "In 2009, Japan officially recognizes you" — before a gold screen and the flag he holds the certificate in both
  //   hands and bows; the official beside him applauds, then bows too; press cameras flash in the foreground
  { at: 44.30, draw(v, t) {
      const bow = bell(t, 45.6, 47.2), obow = bell(t, 46.1, 47.4), C = camF(t, t => [lerp(520, 600, ease(seg(t, 44.3, 47.4))), 1080, lerp(1.25, 1.35, seg(t, 44.3, 47.4)), { hh: .5 }]);
      const flA = [44.55, 46.3].reduce((m, t0) => Math.max(m, t >= t0 ? Math.exp(-(t - t0) / .07) : 0), 0), flB = [45.25, 46.9].reduce((m, t0) => Math.max(m, t >= t0 ? Math.exp(-(t - t0) / .07) : 0), 0), fl = Math.max(flA, flB);
      flashK(.25 * fl);
      const CS = ceremonySet(t);
      const cl = Math.abs(Math.sin((t - 44.3) * 8)), clap = 1 - ease(seg(t, 45.9, 46.3));
      const OL = armMix(tHang(-1, 0, 0, { hs: HS }), jArm(-1, [-150, -788], [-22 - 34 * cl, -846], 'relax', { hs: HS }), clap), OR = armMix(tHang(1, 0, 0, { hs: HS }), jArm(1, [150, -788], [22 + 34 * cl, -846], 'relax', { hs: HS }), clap);
      const TL = jArm(-1, [-154, -792], [-82, -848], 'relax', { hs: HS }), TR = jArm(1, [154, -792], [82, -848], 'relax', { hs: HS });
      const thumb = (A, k) => { const w = A.wr; return `<g filter="url(#pks_jpOld)"><path d="${capsuleD(w[0] + k * 2, w[1] - 18, 7.5, w[0] - k * 20, w[1] + 4, 6)}" fill="${SKJO.mid}"/></g><ellipse cx="${F1(w[0] - k * 18)}" cy="${F1(w[1] + 2)}" rx="3.4" ry="4" fill="${SKJO.hi}" opacity=".5"/>`; };
      const cert = `<g filter="url(#pcl)"><rect x="-88" y="-952" width="176" height="214" rx="4" fill="#5a1e1e"/></g><rect x="-77" y="-941" width="154" height="192" fill="#f4eee0"/>
        <rect x="-68" y="-932" width="136" height="174" fill="none" stroke="#b89a5a" stroke-width="3"/>
        <path d="M-46 -906 L46 -906 M-52 -888 L52 -888 M-52 -874 L36 -874 M-52 -860 L48 -860 M-52 -846 L28 -846" stroke="#8a8270" stroke-width="3" opacity=".45"/>
        <circle cx="40" cy="-782" r="15" fill="#b8242a" opacity=".85"/>${thumb(TL, -1)}${thumb(TR, 1)}`;
      return `<g transform="${C.tf}">${lights(C.v, RIG_ROOM(t, { extra: [{ pos: [100, 1800, 900], col: '#ffffff', int: 6 * fl, rad: 2000, shin: 20 }] }))}${CS.back}
        ${who(OFFICIAL, t, [300, 2250, 1.0], { bust: 1, armL: OL, armR: OR, turn: .3, look: 8, smirk: .4, lid: .2 + .4 * obow, lookY: 4 * obow }, { lean: -5 * obow })}
        ${who(TSU_OLD, t, [720, 2330, 1.1], { bust: 1, armL: TL, armR: TR, turn: -.2, look: -4, lookY: 2 + 5 * bow, smirk: .3, lid: .3 + .35 * bow, tilt: -5 * bow }, { top: cert, lean: -6 * bow })}
        ${CS.front}${pressFlash(-63, 1502, flA)}${pressFlash(1108, 1490, flB)}</g>`;
    } },
  // 25 "as the only man to survive both bombs," — dusk on a hill: the old man alone; on the horizon, the two clouds rise
  //   again like ghosts, one on either side. We pull back.
  { at: 47.40, draw(v, t) {
      const C = camF(t, t => [540, lerp(1240, 1120, ease(seg(t, 47.4, 49.88))), lerp(1.5, 1.05, ease(seg(t, 47.4, 49.88))), { hh: .4 }]);
      return `<g transform="${C.tf}">${lights(C.v, RIG_DUSK(t))}${hillGhosts(t, C, { ghost: ease(seg(t, 47.5, 48.6)) })}
        ${who(TSU_OLD, t, [540, 1372, .2], { armL: tHang(-1), armR: tHang(1), lookY: -3 }, { tex: 0 })}</g>`;
    } },
  // 26 "and you spend your last years begging the world" — he speaks to students, both hands open toward them, pleading
  { at: 49.88, draw(v, t) {
      const open = ease(seg(t, 50.0, 50.6)) * (1 - .35 * ease(seg(t, 51.8, 52.3))), beat = Math.sin((t - 50) * 6.5) * bell(t, 50.5, 52.1);
      const C = camF(t, t => [540, lerp(990, 950, seg(t, 49.88, 52.3)), lerp(1.1, 1.18, ease(seg(t, 49.88, 52.3))), { hh: .5 }]);
      const AL = armMix(tHang(-1), tArm(-1, [-240, -862 + 12 * beat], 'openJ', { hs: HS, bend: -1, spread: 1 }), open), AR = armMix(tHang(1), tArm(1, [240, -862 + 12 * beat], 'openJ', { hs: HS, bend: 1, spread: 1 }), open);
      return `<g transform="${C.tf}">${lights(C.v, RIG_ROOM(t))}${lectureSet(t)}
        ${who(TSU_OLD, t, [540, 2500, 1.6], { armL: AL, armR: AR, bust: 1, talk: talkW(t, 49.92, 52.15, .45), lid: .3, bIn: 9, bOut: 2, look: lerp(-4, 4, seg(t, 50.5, 51.5)), tilt: 3 + 2 * beat, lookY: 1 }, { rate: .8 })}
        <g filter="url(#pcl)"><path d="M300 1420 L780 1420 L740 2400 L340 2400 Z" fill="#6a4a30"/></g><path d="M300 1420 L780 1420" stroke="#8a6a48" stroke-width="10"/>
        <g filter="url(#dof)"><g filter="url(#pcl)">${studentBacks(1720, t, { n: 6, s: 1.3 })}</g></g></g>`;
    } },
  // 27 "never to use them again." — the Dome as it stands today; paper cranes rise from the river into the sky; we tilt up
  //   with them into the same summer sky the film began with
  { at: 52.30, draw(v, t) {
      const C = camF(t, t => { const p = ease(seg(t, 52.4, DUR - 1 / 30)); return [540, lerp(820, LOOP_SKY_FY, p), lerp(1.12, 1.0, p), { hh: .6 }]; }, .45);
      const q = seg(t, 52.3, 53.6);
      return `<g transform="${C.tf}">${lights(C.v, RIG_DAY(t))}${riverView(t, C, { ruin: 1, sky: 1, driftT: t - DUR })}
        ${q < 1 ? craneFlock(t, q, { y: 1500 + 600 * q }) : ''}</g>`;
    } },
];

// transitions: [cut, from, to, style, options]
const TRANS = [
  [2.62, 2.5, 2.74, 'zoom', { at: [420, 560], big: 2.6, big2: 1.3 }],
  [4.98, 4.92, 5.04, 'punch'],
  [6.60, 6.5, 6.7, 'zoom', { at: [500, 1350], big: 2.4, big2: 1.2 }],
  [8.02, 7.94, 8.1, 'whipv', { dir: -1 }],
  [9.62, 9.56, 9.68, 'flash', { col: '#fffaf0', decay: .3 }],
  [11.10, 11.07, 11.13, 'cut'],
  [12.42, 12.39, 12.45, 'cut'],
  [13.98, 13.95, 14.01, 'cut'],
  [16.38, 16.35, 16.41, 'cut'],
  [17.42, 17.32, 17.52, 'whipv', { dir: -1 }],
  [21.12, 20.94, 21.3, 'black'],
  [23.30, 23.18, 23.42, 'whip', { dir: 1 }],
  [24.24, 24.21, 24.27, 'cut'],
  [25.92, 25.82, 26.02, 'whip', { dir: 1 }],
  [27.20, 27.17, 27.23, 'cut'],
  [28.98, 28.86, 29.1, 'whip', { dir: 1 }],
  [30.72, 30.62, 30.82, 'zoom', { at: [600, 1000], big: 2.2, big2: 1.2 }],
  [33.42, 33.38, 33.46, 'punch'],
  [34.82, 34.79, 34.85, 'cut'],
  [36.32, 36.29, 36.35, 'cut'],
  [40.40, 40.34, 40.46, 'flash', { col: '#ffffff', decay: .3 }],
  [41.86, 41.72, 42.0, 'whip', { dir: 1 }],
  [44.30, 44.27, 44.33, 'cut'],
  [47.40, 47.3, 47.5, 'zoom', { at: [540, 960], big: 1.6, big2: .8 }],
  [49.88, 49.85, 49.91, 'cut'],
  [52.30, 52.18, 52.42, 'whip', { dir: -1 }],
];

TL = makeTimeline({ shots: SHOTS, trans: TRANS, words: WORDS.map(([a, w, b]) => [a, w]), strong: STRONG, captions: 'none', fps: 30, duration: DUR });
render(0);
