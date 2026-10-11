// Animation + lighting helpers for "The Spartan boy" v2 (loaded before project.js).
const DUR = 45.4;

// camera: put world point (fx, fy) at the screen centre, zoomed by s; plus a gentle handheld drift (zero at the loop seam)
const HH = t => { const w = seg(t, 0, .7) * (1 - seg(t, 44.5, 45.4)); return [(Math.sin(t * .83) * 5 + Math.sin(t * 2.1 + 1) * 2) * w, (Math.cos(t * .67) * 4 + Math.sin(t * 1.9) * 2) * w]; };
const view = (fx, fy, s, { r = 0, sx = 0, sy = 0 } = {}) => cam({ cx: fx, cy: fy, s, r, x: 540 - fx + sx, y: 960 - fy + sy });
const vw = (fx, fy, s, { sx = 0, sy = 0 } = {}) => ({ fx, fy, s, sx, sy });
const camT = (t, fx, fy, s, sx = 0, sy = 0) => { const [hx, hy] = HH(t); return { tf: view(fx, fy, s, { sx: sx + hx, sy: sy + hy }), v: vw(fx, fy, s, { sx: sx + hx, sy: sy + hy }) }; };

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

// flicker that returns to its t = 0 value at the loop seam
const flkSeam = (t, s) => { const w = seg(t, 0, .6) * (1 - seg(t, 44.8, 45.4)); return lerp(flick(0, s), flick(t, s), w); };
// ---------------- light rigs (world coordinates of each set) ----------------
const RIG = {
  // the family's room at night: oil lamp key, torches outside the door (back light), spill through it, moon window
  home: (t, { door = 0, lamp = 1, spill = 1 } = {}) => ({
    lights: [
      { pos: [215, 1180, 400], col: '#ffd2a0', int: 1.3 * lamp * (.9 + .12 * flkSeam(t, 3)), rad: 820, shin: 30 },
      { pos: [1060, 760, -240], col: '#ffae74', int: 2.4 * door * (.86 + .16 * flkSeam(t, 5)), rad: 1200, shin: 22 },
      { pos: [900, 1380, 260], col: '#ffbe88', int: .45 * door * spill, rad: 880, shin: 26 },
      { pos: [90, 330, 200], col: '#a8bcff', int: .3, rad: 900, shin: 20 },
    ],
    amb: '#9a9eb6', ambGround: '#62524a', ambInt: .6, bgLight: .55, exposure: 1.06, bloom: .26, bloomThresh: .84,
    rays: door > .04 ? { center: [1000, 860], thresh: .4, srcRad: 430, samples: 48, step: .016, decay: .966, col: '#ffc08a', int: 1.25 * door } : undefined,
  }),
  // dawn on the road / in the camp: low sun behind, pink sky fill
  dawn: (t, { sun = [760, 1000], k = 1 } = {}) => ({
    lights: [
      { pos: [sun[0], sun[1], -380], col: '#ffd09a', int: 2.1 * k, rad: 2600, shin: 24 },
      { pos: [300, -300, 700], col: '#ffd6c8', int: .55, rad: 3200, shin: 20 },
    ],
    amb: '#b0a8c0', ambGround: '#7a6050', ambInt: .78, bgLight: .22, exposure: 1.04, bloom: .3, bloomThresh: .82,
    rays: { center: sun, thresh: .55, srcRad: 380, samples: 40, step: .014, decay: .96, col: '#ffd8a0', int: .7 * k },
  }),
  // a cold hill, warm dawn turning to grey rain (season 0 → 1)
  hill: (t, season) => ({
    lights: [
      { pos: [760, 1000, -300], col: mix('#ffd09a', '#c8d4e8', season), int: lerp(1.9, .7, season), rad: 2600, shin: 22 },
      { pos: [400, -200, 800], col: mix('#ffd6c8', '#b8c4dc', season), int: lerp(.5, .9, season), rad: 3200, shin: 20 },
    ],
    amb: mix('#b0a8c0', '#8a96ac', season), ambGround: '#6a5a50', ambInt: lerp(.75, .7, season), bgLight: .22, exposure: 1.04,
    sat: lerp(1, .82, season), rays: { center: [760, 1000], thresh: .55, srcRad: 380, samples: 36, step: .014, decay: .96, col: '#ffd8a0', int: .6 * (1 - season) },
  }),
  // golden dusk at the river: low sun on the left
  dusk: (t, { sun = [300, 960], k = 1 } = {}) => ({
    lights: [
      { pos: [sun[0], sun[1], -260], col: '#ffb878', int: 2.3 * k, rad: 2600, shin: 24 },
      { pos: [900, 300, 500], col: '#c8a8d8', int: .45, rad: 3000, shin: 20 },
      { pos: [540, 1900, 300], col: '#ffc890', int: .35, rad: 1400, shin: 20 },           // warm bounce off the water
    ],
    amb: '#a090b4', ambGround: '#7a5a48', ambInt: .66, bgLight: .25, exposure: 1.05, bloom: .32, bloomThresh: .8,
    rays: { center: sun, thresh: .5, srcRad: 420, samples: 40, step: .015, decay: .962, col: '#ffc890', int: .9 * k },
  }),
  // barracks at dawn: cold window light from above-behind, a warm bounce from the floor
  barracks: (t, { k = 1 } = {}) => ({
    lights: [
      { pos: [540, 420, 120], col: '#dbe6ff', int: 1.7 * k, rad: 1900, shin: 26 },
      { pos: [-200, 900, 500], col: '#c8d4f0', int: .55, rad: 2000, shin: 20 },
      { pos: [700, 2000, 300], col: '#ffcf9a', int: .35, rad: 1400, shin: 20 },
    ],
    amb: '#8e98b4', ambGround: '#5a5040', ambInt: .62, bgLight: .3, exposure: 1.05, bloom: .25, bloomThresh: .86,
    rays: { center: [540, 450], thresh: .55, srcRad: 360, samples: 40, step: .015, decay: .962, col: '#dfe8ff', int: .9 },
  }),
  // the farm at night: moon, plus an optional torch (world position, intensity)
  farm: (t, { torch = null, torchInt = 0 } = {}) => ({
    lights: [
      { pos: [820, 260, 600], col: '#b8c8ff', int: 1.15, rad: 3200, shin: 24 },
      ...(torch && torchInt > .01 ? [{ pos: [torch[0], torch[1], torch[2] ?? 160], col: '#ffac6a', int: 2.6 * torchInt * (.82 + .2 * flick(t, 9)), rad: 1000, shin: 22 }] : []),
    ],
    amb: '#6a78a8', ambGround: '#3a3a40', ambInt: .54, bgLight: .4, exposure: 1.2, bloom: .3, bloomThresh: .8,
    shadowTint: '#1c2c48',
    rays: torch && torchInt > .05 ? { center: [torch[0], torch[1]], thresh: .45, srcRad: 300, samples: 36, step: .014, decay: .96, col: '#ffb070', int: .7 * torchInt } : undefined,
  }),
  // the altar in hard sun — a remembered scene: harsher, cooler, less colour
  altar: (t, { k = 1 } = {}) => ({
    lights: [
      { pos: [880, 160, 900], col: '#fff2d8', int: 2.0 * k, rad: 4200, shin: 28 },
      { pos: [100, 900, 600], col: '#c8d8f0', int: .4, rad: 2600, shin: 20 },
    ],
    amb: '#b4c0d4', ambGround: '#8a7a68', ambInt: .7, bgLight: .18, exposure: 1.03, bloom: .3, bloomThresh: .86,
    sat: .72, contrast: 1.06, highTint: '#f4f0e6', shadowTint: '#283444',
  }),
  // the moonlit field with the helot's hut
  field: (t) => ({
    lights: [
      { pos: [300, 300, 500], col: '#b8c8ff', int: 1.25, rad: 3200, shin: 26 },
      { pos: [840, 1115, -60], col: '#ffb060', int: 1.3 * (.85 + .15 * flick(t, 2)), rad: 700, shin: 20 },
    ],
    amb: '#5a6898', ambGround: '#2a3028', ambInt: .48, bgLight: .4, exposure: 1.1, bloom: .3, bloomThresh: .8, shadowTint: '#18284a',
  }),
  // outside the house: moon + the torch by the door
  street: (t, { torch = [1000, 1420, 160] } = {}) => ({
    lights: [
      { pos: [180, 220, 600], col: '#b8c8ff', int: 1.0, rad: 3200, shin: 26 },
      { pos: torch, col: '#ffac6a', int: 2.2 * (.85 + .18 * flick(t, 11)), rad: 1100, shin: 22 },
    ],
    amb: '#6a78a8', ambGround: '#3a3430', ambInt: .5, bgLight: .45, exposure: 1.08, bloom: .32, bloomThresh: .8,
    rays: { center: [torch[0], torch[1]], thresh: .45, srcRad: 260, samples: 32, step: .013, decay: .96, col: '#ffb070', int: .6 },
  }),
};
const lerp2 = (a, b, p) => [lerp(a[0], b[0], p), lerp(a[1], b[1], p)];
const rain = (t, amt, { seed = 3, n = 70 } = {}) => {
  if (amt <= .01) return ''; const R = rng(seed); let s = '';
  for (let i = 0; i < n; i++) { const x = R() * 1400 - 150, sp = 1800 + R() * 600, y = ((R() * 2200 + t * sp) % 2300) - 300; s += `<path d="M${F1(x)} ${F1(y)} l-18 70" stroke="#c8d4e4" stroke-width="3" opacity="${(.45 * amt).toFixed(2)}"/>`; }
  return s;
};
const leaves = (t, amt, { seed = 5, n = 18 } = {}) => {
  if (amt <= .01) return ''; const R = rng(seed); let s = '';
  for (let i = 0; i < n; i++) { const sp = 500 + R() * 400, x = ((R() * 1500 + t * sp) % 1700) - 300, y = 300 + R() * 1400 + Math.sin(t * 3 + i) * 60;
    s += `<ellipse cx="${F1(x)}" cy="${F1(y)}" rx="14" ry="7" fill="${['#b8642a', '#8a4a1e', '#c89a3a'][i % 3]}" opacity="${(.85 * amt).toFixed(2)}" transform="rotate(${F1(t * 300 + i * 40)} ${F1(x)} ${F1(y)})"/>`; }
  return s;
};
