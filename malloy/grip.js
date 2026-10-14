// grip.js — one-hand grips on props, solved in body-local coordinates. The arm reaches so the FIST CENTRE lands on P;
// the prop is placed so its grip point sits in the fist and its "up" runs along the hand's thumb side; the hand is then
// redrawn on top of the prop (the arm itself stays behind it). Never two hands on one cup: no crossing fingers.
const norm180 = a => ((a + 540) % 360) - 180;
// upright: the angle (deg) the held prop should stand at (0 = straight up); the wrist turns to get it (at most ±80°)
// bend: +1 / −1, or 'down' (the lower elbow) / 'out' (the elbow away from the body) chosen afresh for every target
function gripArm(armFn, k, P, { hs = 1.05, hrot = 0, bend, hand = 'grip', curl = 0, flip = null, upright = null } = {}) {
  let wr = P.slice(), A = null, hr = hrot, fl = flip;
  const pick = (w) => { if (typeof bend !== 'string') return armFn(k, w, 'none', { bend, hrot: hr, curl });
    const a = armFn(k, w, 'none', { bend: 1, hrot: hr, curl }), b = armFn(k, w, 'none', { bend: -1, hrot: hr, curl });
    return bend === 'down' ? (a.el[1] > b.el[1] ? a : b) : (a.el[0] * k > b.el[0] * k ? a : b); };
  for (let i = 0; i < 7; i++) {
    A = pick(wr);
    const d0 = unit(A.el, A.wr);
    if (flip == null) fl = d0[0] * k > .25 ? 1 : 0;
    A.flip = fl;
    if (upright != null) { hr = clamp(hr + norm180(upright - propRot(A, k)), -80, 80); A.hrot = hr; }
    const a = Math.atan2(d0[1], d0[0]) + hr * Math.PI / 180;
    wr = [P[0] - Math.cos(a) * 20 * hs, P[1] - Math.sin(a) * 20 * hs];
  }
  A = pick(wr); A.hrot = hr; A.gh = hand; A.flip = fl;
  return A;
}
const effK = (A, k) => A.flip ? -k : k;
// rotation (deg) that stands a prop's −y axis along the thumb side of a fist
const propRot = (A, k) => handAng(A) + (effK(A, k) < 0 ? 90 : -90);
// the gripping hand, drawn over the prop
const gripHandOn = (A, k, S, sk, hs) => HANDS[A.gh || 'grip'](effK(A, k), A.wr[0], A.wr[1] - 3, hs, handAng(A), { S, sk, curl: A.curl || 0 });
// where to draw a prop whose grip point is (0, gy) in its own units (scale s): returns [x, y, rot]
function propAt(A, k, hs, s, gy) {
  const F = fistAt(A, hs), R = propRot(A, k), r = R * Math.PI / 180;
  return [F[0] + Math.sin(r) * gy * s, F[1] - Math.cos(r) * gy * s, R];
}
// a held goblet / cup / leg / vial drawn with its hand over it.  skin: [S, sk]
function heldGoblet(A, k, hs, gs, skin, { wine = .8, extraRot = 0 } = {}) {
  const [x, y, R] = propAt(A, k, hs, gs, 120);
  return goblet(x, y, gs, { tilt: R + extraRot, wine }) + gripHandOn(A, k, skin[0], skin[1], hs);
}
function heldPewter(A, k, hs, cs, skin, { wine = .7 } = {}) {
  const [x, y, R] = propAt(A, k, hs, cs, 52);
  return pewterCup(x, y, cs, { tilt: R, wine }) + gripHandOn(A, k, skin[0], skin[1], hs);
}
function heldLeg(A, k, hs, ls, skin, { bite = 0 } = {}) {
  const [x, y, R] = propAt(A, k, hs, ls, 110);
  return roastLeg(x, y, ls, R, bite) + gripHandOn(A, k, skin[0], skin[1], hs);
}
function heldVial(A, k, hs, vs, skin, { cork = 1, fill = .6, flip = 0 } = {}) {
  const [x, y, R] = propAt(A, k, hs, vs, 8 * (flip ? -1 : 1));
  return vial(x, y, vs, { rot: R + (flip ? 180 : 0), cork, fill }) + gripHandOn(A, k, skin[0], skin[1], hs);
}
// the prop's rim / mouth point in body-local coords (for lining a cup up with lips)
function propPoint(A, k, hs, s, gy, py) {
  const F = fistAt(A, hs), R = propRot(A, k) * Math.PI / 180, d = (py - gy) * s;
  return [F[0] - Math.sin(R) * d, F[1] + Math.cos(R) * d];
}

// ---------- shared animation helpers (motion that settles at the loop seam) ----------
const brS = (t, ph = 0, rate = 1) => br(t, ph, rate) * seamW(t), swayS = (t, k = 0, a = 1.5) => sway(t, k, a) * seamW(t);
const aim = (A, theta) => ({ ...A, hrot: theta - Math.atan2(A.wr[1] - A.el[1], A.wr[0] - A.el[0]) * 180 / Math.PI });
const wristFor = (tip, theta, len) => [tip[0] - Math.cos(theta * Math.PI / 180) * len, tip[1] - Math.sin(theta * Math.PI / 180) * len];
const redraw = (k, A, S, sk, hs) => A.hand && A.hand !== 'none' ? HANDS[A.hand](k, A.wr[0], A.wr[1] - 3, A.hs ?? hs, handAng(A), { S, sk, curl: A.curl || 0, spread: A.spread ?? (A.hand === 'palm' ? 1 : 0) }) : '';
const fistAt = (A, hs) => { const d = unit(A.el, A.wr), a = Math.atan2(d[1], d[0]) + (A.hrot || 0) * Math.PI / 180; return [A.wr[0] + Math.cos(a) * 20 * hs, A.wr[1] + Math.sin(a) * 20 * hs]; };
const talkW = (t, a, b, amp = .3) => { for (const [s, w, e] of WORDS) if (s >= a - .02 && e <= b + .02 && t >= s && t < e) { const n = Math.max(1, Math.round((e - s) / .16)), u = (t - s) / (e - s); return .08 + amp * Math.abs(Math.sin(u * Math.PI * n)); } return 0; };
const lidB = (t, base, list) => Math.max(base, blinkAt(t, list));

// solve a grip so a point of the prop (py, in prop units; the goblet rim is 0, its grip 120) lands on target Q.
// rotate: the extra wrist turn (deg) that tilts the cup; returns the arm pose
function gripTo(armFn, k, Q, { hs = 1.05, s = .8, gy = 120, py = 0, hrot = 0, bend, flip = null, upright = null } = {}) {
  let P = Q.slice(), A = null;
  for (let i = 0; i < 6; i++) {
    A = gripArm(armFn, k, P, { hs, hrot, bend, flip, upright });
    const r = propPoint(A, k, hs, s, gy, py); P = [P[0] + (Q[0] - r[0]), P[1] + (Q[1] - r[1])];
  }
  return gripArm(armFn, k, P, { hs, hrot, bend, flip, upright });
}
