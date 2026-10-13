// Hands in local coordinates (px at base scale). Caller places them with a transform and passes a local light dir.
'use strict';
const L = require('./lib');
const { path, P, taper, inside, soft, crescent, ellipse } = L;
const PT = require('./paint');

// closed contour around a joint chain with widths (rounded tip, open root hidden under the hand)
function chain(c, w, rootExt = 6) {
  const n = c.length, left = [], right = [];
  for (let i = 0; i < n; i++) {
    const a = c[Math.max(0, i - 1)], b = c[Math.min(n - 1, i + 1)];
    const t = L.norm(L.sub(b, a)), nn = L.perp(t);
    left.push(L.add(c[i], L.mul(nn, w[i] / 2)));
    right.push(L.sub(c[i], L.mul(nn, w[i] / 2)));
  }
  const t0 = L.norm(L.sub(c[1], c[0])), te = L.norm(L.sub(c[n - 1], c[n - 2]));
  const tip = L.add(c[n - 1], L.mul(te, w[n - 1] * 0.5));
  const tipL = L.add(left[n - 1], L.mul(te, w[n - 1] * 0.32)), tipR = L.add(right[n - 1], L.mul(te, w[n - 1] * 0.32));
  const root = L.sub(c[0], L.mul(t0, rootExt));
  return [root].concat(left, [tipL, tip, tipR], right.reverse());
}

function nail(dip, tip, w, m, lw) {
  const t = L.norm(L.sub(tip, dip)), nn = L.perp(t);
  const len = L.len(L.sub(tip, dip));
  const c0 = L.lerp(dip, tip, 0.34), c1 = L.add(tip, L.mul(t, w * 0.28));
  const hw = w * 0.32;
  const pts = [L.add(c0, L.mul(nn, hw * 0.9)), L.add(L.lerp(c0, c1, 0.6), L.mul(nn, hw)), L.add(c1, L.mul(nn, hw * 0.7)), L.add(c1, L.mul(t, hw * 0.35)), L.sub(c1, L.mul(nn, hw * 0.7)), L.sub(L.lerp(c0, c1, 0.6), L.mul(nn, hw)), L.sub(c0, L.mul(nn, hw * 0.9))];
  const d = path(pts, true);
  let s = P(d, m.nail);
  s += P(taper([L.add(L.lerp(c0, c1, 0.15), L.mul(nn, hw * 0.3)), L.add(L.lerp(c0, c1, 0.7), L.mul(nn, hw * 0.35))], [0, hw * 0.45, 0]), m.nailHi, 'opacity="0.6"');
  s += P(taper([L.add(c1, L.mul(nn, hw * 0.7)), L.add(c1, L.mul(t, hw * 0.35)), L.sub(c1, L.mul(nn, hw * 0.7))], [0, hw * 0.3, 0]), m.nailTip, 'opacity="0.5"');
  // cuticle
  s += P(taper([L.add(c0, L.mul(nn, hw)), L.sub(c0, L.mul(t, hw * 0.25)), L.sub(c0, L.mul(nn, hw))], [0, lw * 0.8, 0]), m.line, 'opacity="0.55"');
  return s;
}

// Open relaxed hand, back of hand toward viewer, thumb on +x side, fingers along +y. Wrist centre at (0,0).
function openHand(doc, st, m, o = {}) {
  const lw = o.lw || 1.6;
  const ld = L.norm(st.light);
  const F = o.fingers || {
    index: [[[22, 78], [25, 118], [25, 142], [22, 160]], [19.5, 17, 15, 12.5]],
    middle: [[[5, 83], [8, 127], [7, 153], [4, 172]], [20.5, 18, 15.5, 13]],
    ring: [[[-12, 80], [-10, 122], [-11, 146], [-10, 163]], [19.5, 16.5, 14.5, 12]],
    pinky: [[[-28, 71], [-27, 104], [-29, 125], [-28, 139]], [17, 14.5, 13, 11]],
  };
  const thumb = o.thumb || [[[38, 34], [45, 60], [48, 86], [45, 107]], [26, 21, 18, 16]];
  let s = '';
  const fingerSvg = (c, w, key) => {
    const pts = chain(c, w, 10);
    let det = '';
    // PIP / DIP knuckle wrinkles on the back of the finger
    const crease = (j, k, n2) => {
      const t = L.norm(L.sub(c[k + 1] || c[k], c[k - 1])), nn = L.perp(t);
      let r = '';
      for (let i = 0; i < n2; i++) {
        const o2 = (i - (n2 - 1) / 2) * 3.2;
        const cc = L.add(c[k], L.mul(t, o2));
        r += P(taper([L.add(cc, L.mul(nn, w[k] * 0.28)), L.add(cc, L.mul(t, 1.2)), L.sub(cc, L.mul(nn, w[k] * 0.28))], [0, lw * 0.55, 0]), m.line, 'opacity="0.45"');
      }
      return r;
    };
    det += crease(c, 1, 3) + crease(c, 2, 1);
    // knuckle highlight on the PIP joint (light side)
    det += soft(doc, ellipse(c[1][0] + ld[0] * 3, c[1][1] - 2, w[1] * 0.28, w[1] * 0.22), m.hi, 2, 0.5);
    det += nail(c[2], c[3], w[3], m, lw);
    return PT.part(doc, st, m, pts, { shadowAmt: (o.fShadow ?? 0.55) * w[1], formShift: 6, formOp: 0.4, details: det, rim: 3, bounceAmt: 4, lineW: lw });
  };
  for (const k of ['pinky', 'ring', 'middle', 'index']) s += fingerSvg(F[k][0], F[k][1], k);
  // thumb lies along the index, seen from its side (nail visible), root tucked under the dorsum
  {
    const [c, w] = thumb;
    const pts = chain(c, w, 16);
    const det = nail(c[2], c[3], w[3], m, lw) + P(taper([L.add(c[2], [-w[2] * 0.3, 2]), L.add(c[2], [w[2] * 0.3, -1])], [0, lw * 0.6, 0]), m.line, 'opacity="0.4"');
    s += PT.part(doc, st, m, pts, { shadowAmt: 0.45 * w[1], formShift: 8, details: det, rim: 3.5, bounceAmt: 4, lineW: lw });
  }
  // dorsum (back of the hand)
  const dors = o.dorsum || [[-25, -6], [26, -6], [34, 10], [40, 34], [38, 58], [32, 74], [22, 85], [13, 88], [5, 90], [-4, 88], [-12, 86], [-20, 82], [-28, 76], [-35, 64], [-35, 32], [-30, 8]];
  let det = '';
  // knuckle bumps
  for (const [x, y, r] of [[22, 79, 9], [5, 84, 10], [-12, 81, 9], [-28, 72, 8]]) {
    det += soft(doc, ellipse(x + ld[0] * 2, y - 3, r * 0.8, r * 0.6), m.hi, 4, 0.32);
    det += soft(doc, ellipse(x - ld[0] * 5, y + 3, r * 0.6, r * 0.5), m.shadow, 4, 0.2);
  }
  // extensor tendons fanning from the knuckles to the wrist + a vein
  for (const [x, y] of [[20, 74], [5, 78], [-11, 75], [-26, 66]]) det += soft(doc, taper([[x * 0.3, 14], [x * 0.75, 44], [x, y]], [0, 3, 1.5]), m.hi, 2.5, 0.16);
  det += soft(doc, taper([[-14, 0], [-10, 26], [2, 44], [10, 62]], [0, 3, 2]), m.vein || m.shadow, 2, 0.16);
  // web between thumb and index (first dorsal interosseous bulge)
  det += soft(doc, ellipse(34, 40, 8, 14, -0.4), m.hi, 3, 0.4);
  s += PT.part(doc, st, m, dors, { shadowAmt: o.dShadow ?? 30, formShift: 14, details: det, rim: 4, bounceAmt: 6, lineW: lw * 1.1 });
  return s;
}

// Fist gripping a vertical shaft (shaft axis x=0). Back of hand on +x side, wrist toward -y.
function fistGrip(doc, st, m, o = {}) {
  const lw = o.lw || 1.6;
  const ld = L.norm(st.light);
  let s = '';
  // back of hand / heel
  const back = [[-10, -62], [24, -70], [42, -50], [48, -16], [46, 18], [38, 40], [20, 48], [-6, 44], [-12, 0]];
  s += PT.part(doc, st, m, back, { shadowAmt: 26, formShift: 12, rim: 4, lineW: lw,
    details: soft(doc, ellipse(40, -30, 6, 14), m.hi, 3, 0.5) + P(taper([[30, -66], [40, -40], [44, -4]], [0, lw * 1.2, 0]), m.hi, 'opacity="0.4"') });
  // finger rolls, bottom (pinky) to top (index)
  const rolls = [
    [21, -32, 14.5, -0.08], // pinky: cy, left end x, half-height, slope
    [5, -40, 16.5, -0.06],
    [-12, -43, 17.5, -0.04],
    [-30, -40, 17.5, -0.02],
  ];
  for (const [cy, lx, hh, sl] of rolls) {
    const rx = 40;
    const pts = [[rx, cy - hh], [10, cy - hh + (rx - 10) * sl * -0.2], [lx + hh * 0.9, cy - hh - (lx) * sl], [lx, cy - hh * 0.45 - lx * sl], [lx - 2, cy + hh * 0.2 - lx * sl], [lx + hh * 0.7, cy + hh - lx * sl], [10, cy + hh], [rx, cy + hh]];
    let det = '';
    // PIP knuckle at the left end: highlight + crease lines
    det += soft(doc, ellipse(lx + 6, cy - hh * 0.35 - lx * sl, 5, 4), m.hi, 1.5, 0.6);
    for (const k of [0, 1]) det += P(taper([[lx + 10 + k * 4, cy - hh * 0.7 - lx * sl], [lx + 9 + k * 4, cy + hh * 0.5 - lx * sl]], [0, lw * 0.5, 0]), m.line, 'opacity="0.4"');
    // MCP knuckle bump near the right
    det += soft(doc, ellipse(rx - 4, cy - 2, 6, hh * 0.6), m.hi, 2, 0.45);
    s += PT.part(doc, st, m, pts, { shadowAmt: hh * 0.9, formShift: 6, rim: 3, bounceAmt: 4, lineW: lw, details: det });
  }
  // thumb wrapping over the index finger, nail toward the viewer
  const tc = [[16, -60], [-2, -46], [-20, -30]], tw = [24, 20, 17];
  const tpts = chain(tc, tw, 10);
  const det = nail(tc[1], tc[2], tw[2], m, lw) + soft(doc, ellipse(4, -52, 7, 5, -0.7), m.hi, 2, 0.5);
  s += PT.part(doc, st, m, tpts, { shadowAmt: 12, formShift: 6, rim: 3, bounceAmt: 4, lineW: lw, details: det });
  return s;
}

module.exports = { openHand, fistGrip, chain, nail };
