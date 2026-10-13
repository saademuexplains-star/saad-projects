// Animation + lighting helpers for "The Lullaby" (loaded before project.js).
const DUR = 54.0;

// camera: put world point (fx, fy) at the screen centre, zoomed by s; plus a gentle handheld drift (zero at the loop seam)
const HH = t => { const w = seg(t, 0, .7) * (1 - seg(t, DUR - .8, DUR)); return [(Math.sin(t * .63) * 4 + Math.sin(t * 1.7 + 1) * 1.5) * w, (Math.cos(t * .51) * 3 + Math.sin(t * 1.3) * 1.5) * w]; };
const view = (fx, fy, s, { r = 0, sx = 0, sy = 0 } = {}) => cam({ cx: fx, cy: fy, s, r, x: 540 - fx + sx, y: 960 - fy + sy });
const vw = (fx, fy, s, { sx = 0, sy = 0, r = 0 } = {}) => ({ fx, fy, s, sx, sy, r });
// camera: world point (fx, fy) at the frame centre, zoom s; o.r = Dutch angle (deg), o.hh = handheld amount, o.sx/sy = shake
const camT = (t, fx, fy, s, o = {}) => { const [hx, hy] = HH(t), h = o.hh ?? 1, sx = (o.sx || 0) + hx * h, sy = (o.sy || 0) + hy * h, r = o.r || 0;
  if (typeof window !== 'undefined') { window.__Z = s;    // outlines read the current zoom; big set pieces clip themselves to the view
    const m = 1.08 + Math.abs(r) * .025, hw = 540 / s * m + 16, hh = 960 / s * m + 16; window.__VIEW = [fx - hw, fy - hh, fx + hw, fy + hh]; }
  return { tf: view(fx, fy, s, { r, sx, sy }), v: vw(fx, fy, s, { sx, sy, r }), s }; };
// motion that returns to rest at the loop seam (0 s and DUR)
const seamW = t => seg(t, 0, .8) * (1 - seg(t, DUR - .8, DUR));

const sway = (t, k = 0, a = 1.5) => Math.sin(t * 1.3 + k) * a + Math.sin(t * .7 + k * 2) * a * .5;
const blink = (t, list) => blinkAt(t, list);
const tremble = (t, amt) => Math.sin(t * 47) * amt + Math.sin(t * 31 + 1) * amt * .6;
const br = (t, ph = 0, rate = 1) => Math.sin(t * 2.5 * rate + ph);                    // breathing
const spring = (t, t0, f = 3, d = .22) => t < t0 ? 0 : Math.exp(-(t - t0) / d) * Math.sin((t - t0) * f * 2 * Math.PI);
const OLV = SKIN_TONES.olive;
const darkRect = (op, col = '#05060a') => op > .002 ? `<rect x="-400" y="-400" width="1880" height="2720" fill="${col}" opacity="${op.toFixed(3)}"/>` : '';
const tint = (col, op, mode = 'multiply') => `<rect x="-400" y="-400" width="1880" height="2720" fill="${col}" opacity="${op}" style="mix-blend-mode:${mode}"/>`;

// keyframes: kf(t, [[t0, v0], [t1, v1], ...]) — numbers or [x, y]; eased between keys
function kf(t, keys, ease = easeInOut) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) {
    const [t0, a] = keys[i - 1], [t1, b] = keys[i], p = ease((t - t0) / (t1 - t0));
    return Array.isArray(a) ? a.map((v, j) => lerp(v, b[j], p)) : lerp(a, b, p);
  }
  return keys[keys.length - 1][1];
}

// placement with breathing (a tiny stretch about the placement origin)
const atb = (x, y, s, svg, b = 0) => `<g transform="translate(${F1(x)} ${F1(y)}) scale(${s} ${(s * (1 + .008 * b)).toFixed(4)})">${svg}</g>`;
const kidb = (x, y, s, look, pose = {}) => atb(x, y + 300 * s, s, P(look, pose), pose.breath || 0);
const manb = (x, y, s, look, pose = {}) => atb(x, y, s, P(look, pose), pose.breath || 0);

// two-bone IK: shoulder → target, upper/lower lengths, bend side (+1 / -1)
function ik(sh, T, L1, L2, bend) {
  const dx = T[0] - sh[0], dy = T[1] - sh[1], th = Math.atan2(dy, dx);
  const d = clamp(Math.hypot(dx, dy), Math.abs(L1 - L2) + 2, L1 + L2 - 2);
  const a = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
  return { el: [sh[0] + L1 * Math.cos(th + bend * a), sh[1] + L1 * Math.sin(th + bend * a)], wr: [sh[0] + d * Math.cos(th), sh[1] + d * Math.sin(th)] };
}
// arm poses by hand target (body-local coords). kid / hoplite + glad / robed person
// elbows hang down for forward / low reaches; for raised arms they point away from the body
function autoIK(k, sh, T, L1, L2, bend) {
  if (bend !== undefined) return ik(sh, T, L1, L2, bend);
  const a = ik(sh, T, L1, L2, 1), b = ik(sh, T, L1, L2, -1);
  if (T[1] < sh[1] - 60) return (a.el[0] * k > b.el[0] * k) ? a : b;
  return a.el[1] > b.el[1] ? a : b;
}
const kArm = (k, T, hand = 'relaxed', o = {}) => ({ ...autoIK(k, [k * 110, -930], T, 118, 108, o.bend), hand, ...o });
const hArm = (k, T, hand = 'relaxed', o = {}) => ({ ...autoIK(k, [k * 160, -915], T, 128, 124, o.bend), hand, ...o });
const pArm = (k, T, hand = 'relaxed', o = {}) => ({ ...autoIK(k, [k * 155, -925], T, 136, 130, o.bend), hand, ...o });
// world <-> placement-local points (b = the breathing stretch used by atb), and a point rotated about a centre (deg, SVG sense)
const toWorld = (p, x, y, s, b = 0) => [x + p[0] * s, y + p[1] * s * (1 + .008 * b)];
const toLocal = (p, x, y, s, b = 0) => [(p[0] - x) / s, (p[1] - y) / (s * (1 + .008 * b))];
const rotP = (p, a, c) => { const r = a * Math.PI / 180, dx = p[0] - c[0], dy = p[1] - c[1]; return [c[0] + dx * Math.cos(r) - dy * Math.sin(r), c[1] + dx * Math.sin(r) + dy * Math.cos(r)]; };
// the hand of a posed arm drawn again on top of what it grips (the arm itself stays behind): placement (x, y, s, b)
const gripHand = (x, y, s, A, k, hs, { S = OLV, sk = 'olive', b = 0 } = {}) => {
  const ang = Math.atan2(A.wr[1] - A.el[1], A.wr[0] - A.el[0]) * 180 / Math.PI - 90;
  return atb(x, y, s, HANDS[A.hand](k, A.wr[0], A.wr[1] - 3, hs, ang + (A.hrot || 0), { S, sk }), b); };
// centre of a posed arm's fist (world), for props held in it
const fistC = (A, x, y, s, b, hs) => { const dx = A.wr[0] - A.el[0], dy = A.wr[1] - A.el[1], L = Math.hypot(dx, dy) || 1; return toWorld([A.wr[0] + dx / L * 20 * hs, A.wr[1] + dy / L * 20 * hs], x, y, s, b); };


// a clean, defined edge around a WHOLE figure (not each piece): the solid silhouette, grown by ~px screen pixels,
// drawn behind it. zoom = on-screen pixels per world unit at this point (camera zoom), so the line holds its width.
let OLN = 0;
const outlined = (svg, zoom, { px = 2.2, col = '#120a07', op = .92 } = {}) => {
  const z = (typeof window !== 'undefined' && window.__Z) || zoom || 1, id = 'ol' + (OLN++), r = Math.max(.3, px / z).toFixed(2);
  return `<defs><filter id="${id}" x="-8%" y="-8%" width="116%" height="116%" color-interpolation-filters="sRGB">
    <feComponentTransfer in="SourceAlpha" result="a"><feFuncA type="linear" slope="3" intercept="-1.6"/></feComponentTransfer>
    <feMorphology in="a" operator="dilate" radius="${r}" result="d"/>
    <feFlood flood-color="${col}" flood-opacity="${op}"/><feComposite in2="d" operator="in" result="line"/>
    <feMerge><feMergeNode in="line"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g filter="url(#${id})">${svg}</g>`;
};

// flicker that returns to its t = 0 value at the loop seam
const flkSeam = (t, s) => { const w = seg(t, 0, .6) * (1 - seg(t, DUR - .6, DUR)); return lerp(flick(0, s), flick(t, s), w); };
const lerp2 = (a, b, p) => [lerp(a[0], b[0], p), lerp(a[1], b[1], p)];

// ---------------- light rigs (world coordinates of each set) ----------------
// One candle is the key in the bedroom: warm but kept soft (no orange burn); the frosted window gives a cold blue
// moon rim from behind-right; ambient is low and cool so shadows go deep. still = 1 → the flame stops moving.
const CANDLE = [430, 1526];                     // the flame, on the bedside table (bedroom world coords)
const RIG = {
  bedroom: (t, { candle = 1, moon = 1, door = 0, still = 0, k = 1, flame = CANDLE, fill = 1 } = {}) => {
    const f = lerp(.9 + .14 * flkSeam(t, 3), 1, still);
    return {
      lights: [
        { pos: [flame[0], flame[1], 170], col: '#ffd9ae', int: 2.7 * candle * f * k, rad: 560, shin: 30 },
        { pos: [flame[0] + 40, flame[1] + 380, 90], col: '#ffcf9e', int: .3 * candle * f * k, rad: 700, shin: 20 },      // bounce off the quilt / floor
        { pos: [1240, 900, -260], col: '#a9c2ff', int: 1.5 * moon * k, rad: 950, shin: 26 },                             // moon through the window: rim
        { pos: [600, 1500, 1800], col: '#8a9cd0', int: .26 * fill * k, rad: 5000, shin: 12 },                             // faint cool fill from the camera side
        ...(door > .01 ? [{ pos: [1700, 1400, 140], col: '#ffc890', int: 1.6 * door * k, rad: 900, shin: 22 }] : []),
      ],
      amb: '#3a4560', ambGround: '#2a221e', ambInt: .2 * k, bgLight: .38, exposure: 1.18, bloom: .34, bloomThresh: .78,
      normalStrength: .95, specScale: .35, vignette: .58, grain: .02, shadowTint: '#121e36', highTint: '#f6e0c4', sat: .88, contrast: 1.12,
      rays: { center: [1110, 1170], thresh: .45, srcRad: 260, samples: 40, step: .016, decay: .963, col: '#b8ccff', int: .7 * moon * k },
    };
  },
  // outside: blue moonlight on snow, one warm window
  snow: (t) => ({
    lights: [
      { pos: [880, 120, 700], col: '#b4c8ff', int: 1.3, rad: 3600, shin: 26 },
      { pos: [470, 1250, 140], col: '#ffcf9a', int: 1.0 * (.9 + .12 * flick(t, 2)), rad: 520, shin: 20 },
    ],
    amb: '#5c6e9a', ambGround: '#8a96b4', ambInt: .5, bgLight: .55, exposure: 1.1, bloom: .32, bloomThresh: .78,
    vignette: .5, grain: .016, shadowTint: '#14243e', highTint: '#e8eeff', sat: .85, contrast: 1.05,
  }),
  // under the floor: near black; thin warm lines of candlelight leak down through the gaps between the boards
  under: (t, { k = 1 } = {}) => ({
    lights: [
      { pos: [540, 420, 520], col: '#ffd2a0', int: 1.8 * k * (.9 + .12 * flick(t, 4)), rad: 1150, shin: 24 },
      { pos: [960, 1900, 260], col: '#8ea4d8', int: .7 * k, rad: 1300, shin: 20 },
    ],
    amb: '#2a3044', ambGround: '#141414', ambInt: .3, bgLight: .8, exposure: 1.3, bloom: .25, bloomThresh: .82,
    vignette: .62, grain: .02, shadowTint: '#0c1424', highTint: '#f0d8b8', sat: .8, contrast: 1.08,
  }),
};

// falling snow (world space of the exterior set), and dust drifting in the moonbeam
const snowfall = (t, { n = 90, seed = 5, area = [-300, -200, 1680, 2400], wind = 120, op = .85 } = {}) => {
  const R = rng(seed); let s = '';
  for (let i = 0; i < n; i++) { const z = .4 + R() * .9, sp = (90 + R() * 80) * z, x0 = area[0] + R() * (area[2] - area[0]);
    const y = area[1] + ((R() * (area[3] - area[1]) + t * sp) % (area[3] - area[1])), x = x0 + Math.sin(t * .8 + i) * 30 * z + t * wind * z % 400;
    s += `<circle cx="${F1(((x - area[0]) % (area[2] - area[0]) + (area[2] - area[0])) % (area[2] - area[0]) + area[0])}" cy="${F1(y)}" r="${F1(3 + 5 * z)}" fill="#f2f6ff" opacity="${(op * (.45 + .5 * z)).toFixed(2)}"/>`; }
  return s;
};
const dust = (t, { n = 28, seed = 7, area = [700, 500, 1400, 1900], op = .55, still = 0 } = {}) => {
  const R = rng(seed); let s = ''; const tt = lerp(t, 23.4, still);
  for (let i = 0; i < n; i++) { const x = area[0] + R() * (area[2] - area[0]) + Math.sin(tt * .4 + i * 1.7) * 30, y = area[1] + R() * (area[3] - area[1]) + Math.sin(tt * .3 + i) * 40 - tt * 6;
    s += `<circle cx="${F1(x)}" cy="${F1(((y - area[1]) % (area[3] - area[1]) + (area[3] - area[1])) % (area[3] - area[1]) + area[1])}" r="${F1(2 + R() * 3)}" fill="#dfe8ff" opacity="${(op * (.3 + .7 * R())).toFixed(2)}"/>`; }
  return s;
};
