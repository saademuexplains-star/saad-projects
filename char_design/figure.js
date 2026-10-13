// Shared full-figure assembly. Each character supplies a config: style, materials, proportions, head, prop, backdrop.
'use strict';
const L = require('./lib');
const B = require('./body');
const O = require('./outfit');
const PT = require('./paint');
const H = require('./handkit');
const K = require('./facekit');
const { path, P, taper, inside, soft, crescent, ellipse, lerp } = L;
let M = null; // active config (materials + style)

function rotate(v, a) { const c = Math.cos(a), s = Math.sin(a); return [v[0] * c - v[1] * s, v[0] * s + v[1] * c]; }

function forms(doc, g, name, k = 14) {
  let s = '';
  const kk = Object.assign({ vmN: 0.5, vmF: 0.5, patN: 0.55, patF: 0.55, scmN: 0, trapN: 0.7, calfN: 0.8, calfF: 0.8 }, M.formMul || {});
  for (const [key, f] of Object.entries(g.forms)) if (f.on === name && kk[key] !== 0) s += PT.form(doc, M.st, M.SKIN, f.pts, k * (M.formK ?? 1) * (kk[key] ?? 1), { blur: (M.st.formEdge ?? 6) * (kk[key] ? 1.6 : 1) });
  return s;
}

function tunic(doc, o, T, J, g) {
  let s = '';
  const ld = L.norm(M.st.light);
  // skirt: soft linen, irregular folds hanging from the belt
  const sk = o.skirt;
  const R = K.rng(7);
  const hemA = sk[4], hemB = sk[11];
  const hemPts = [];
  for (let i = 0; i <= 12; i++) {
    const t = i / 12, p = lerp(hemA, hemB, t);
    hemPts.push([p[0] + (R() - 0.5) * 6, p[1] + Math.sin(t * Math.PI * 5.3 + 0.6) * 7 + (R() - 0.5) * 5]);
  }
  const skirtPts = sk.slice(0, 4).concat(hemPts, sk.slice(12));
  let det = '';
  const foldX = [470, 498, 540, 566, 606, 640, 676, 712];
  foldX.forEach((x, i) => {
    const top = T([[x, 1050]])[0];
    const hp = hemPts[Math.min(12, Math.round((i + 0.5) * 12 / foldX.length))];
    const mid = lerp(top, hp, 0.55);
    const wv = 8 + (i % 3) * 6;
    const f = [top, [mid[0] + (i % 2 ? 4 : -4), mid[1]], [hp[0], hp[1] - 4]];
    det += soft(doc, taper(f, [2, wv, wv * 1.4]), M.CLOTH.shadow, 3, 0.55);
    det += soft(doc, taper(f.map((p) => [p[0] + wv * 0.9, p[1]]), [1, wv * 0.5, wv * 0.7]), M.CLOTH.hi, 2, 0.5);
  });
  // shadow of the belt onto the skirt top + sag between the legs
  det += soft(doc, path(T([[560, 1120], [600, 1140], [640, 1240], [620, 1300], [590, 1220]]), true), M.CLOTH.shadow, 12, 0.45);
  // ochre border following the hem
  det += P(taper(hemPts.map((p) => [p[0], p[1] - 18]), 8), M.trim, 'opacity="0.95"');
  det += P(taper(hemPts.map((p) => [p[0], p[1] - 33]), 3), M.trim, 'opacity="0.9"');
  if (M.skirtShadow) {
    const legs = path(g.legN, true) + path(g.legF, true);
    const band = hemPts.map((p) => [p[0], p[1] - 10]).concat(hemPts.slice().reverse().map((p) => [p[0] - 6, p[1] + M.skirtShadow]));
    s += inside(doc, legs, soft(doc, path(band, true), M.SKIN.deep, M.skirtShadow * 0.45, 0.55));
  }
  const hz = Math.abs(L.norm(M.st.light)[0]) * 0.8 + 0.2;
  s += PT.part(doc, M.st, M.CLOTH, skirtPts, { shadowAmt: 110 * hz, details: det, rim: 10, formOp: 0.4 });
  for (let i = 1; i < hemPts.length - 1; i += 2) s += P(taper([hemPts[i], [hemPts[i][0] + 1, hemPts[i][1] - 20]], [2, 0]), M.CLOTH.line, 'opacity="0.45"');

  // upper tunic (exomis), knotted on the far shoulder
  let d2 = '';
  // tension folds fanning from the shoulder knot toward the opposite hip (soft, curved, light-aware)
  const ldc = L.norm(M.st.light), fb = Math.max(1.5, (M.st.cel ?? 1) * 0.6);
  const fans = [[[728, 676], [700, 744], [650, 820], [586, 900], [530, 952], 13], [[738, 684], [722, 770], [686, 850], [640, 930], 10], [[720, 672], [672, 726], [606, 790], [536, 850], [492, 880], 9], [[746, 700], [744, 790], [722, 880], 7]];
  for (const fa of fans) {
    const w = fa.pop();
    d2 += soft(doc, taper(T(fa), [1, w, w * 0.9, w * 0.5, 0].slice(0, fa.length)), M.CLOTH.shadow, fb, 0.5);
    d2 += soft(doc, taper(T(fa).map((p) => [p[0] - ldc[0] * w * 0.9, p[1] - ldc[1] * w * 0.9]), [0, w * 0.45, w * 0.4, w * 0.2, 0].slice(0, fa.length)), M.CLOTH.hi, fb, 0.45 * (M.foldHi ?? 1));
  }
  // sag folds under the chest edge
  d2 += soft(doc, taper(T([[470, 850], [520, 868], [580, 860]]), [0, 8, 0]), M.CLOTH.shadow, Math.max(2, (M.st.cel ?? 1)), 0.4);
  // ochre trim on the top edge
  d2 += P(taper(T([[672, 662], [646, 694], [618, 742], [574, 790], [524, 820], [482, 826], [452, 816]]).map((p) => [p[0], p[1] + 10]), 7), M.trim, 'opacity="0.95"');
  // sleeve hem trim
  d2 += P(taper(T([[748, 790], [772, 800], [798, 790]]).map((p) => [p[0], p[1] - 9]), 6), M.trim, 'opacity="0.95"');
  s += PT.part(doc, M.st, M.CLOTH, o.tunicTop, { shadowAmt: 120 * (Math.abs(L.norm(M.st.light)[0]) * 0.6 + 0.4), details: d2, rim: 10, formOp: 0.45 });
  // shoulder knot
  const kn = T([[724, 668]])[0];
  s += PT.part(doc, M.st, M.CLOTH, circlePts(kn[0], kn[1], 16, 13), { shadowAmt: 12, rim: 4 });
  // cast shadow of the tunic edge onto the chest skin is implicit; belt cast onto skirt:
  s += soft(doc, path(o.beltBot.concat(o.beltBot.slice().reverse().map((p) => [p[0] - 10, p[1] + 16])), true), M.CLOTH.deep, 4, 0.45);

  // strap (baldric) from the near shoulder across the chest
  const strap = o.strap;
  const band = strapBand(strap, 26);
  s += soft(doc, path(strapBand(strap.map((p) => [p[0] - 7, p[1] + 5]), 26), true), M.SKIN.deep, 3, 0.45);
  s += PT.part(doc, M.st, M.LEATHER2, band, { shadowAmt: 10, rim: 4, lineW: 1.8,
    details: P(taper(strap.map((p) => [p[0] + 9, p[1] - 4]), 1.4), M.LEATHER2.hi, 'opacity="0.5"') + stitch(strap, 8, '#e8c28a') });
  const ring = lerp(strap[2], strap[3], 0.55);
  s += PT.part(doc, M.st, M.BRONZE, circlePts(ring[0], ring[1], 15, 15), { shadowAmt: 8, rim: 3, lineW: 1.6, details: P(ellipse(ring[0], ring[1], 7, 7), M.BRONZE.shadow) });

  // belt
  const belt = o.beltTop.concat(o.beltBot);
  let bd = '';
  bd += P(taper(o.beltTop.map((p) => [p[0], p[1] + 8]), 2), M.LEATHER.hi, 'opacity="0.5"');
  bd += P(taper(o.beltBot.map((p) => [p[0], p[1] - 8]), 2), M.LEATHER.deep, 'opacity="0.6"');
  s += PT.part(doc, M.st, M.LEATHER, belt, { shadowAmt: 60, details: bd, rim: 5 });
  // bronze studs + buckle plate
  for (let i = 1; i < 7; i++) {
    const t = i / 7;
    const a = lerp(o.beltTop[Math.floor(t * 4)], o.beltTop[Math.ceil(t * 4)], t * 4 - Math.floor(t * 4));
    const b = lerp(o.beltBot[4 - Math.floor(t * 4)], o.beltBot[4 - Math.ceil(t * 4)], t * 4 - Math.floor(t * 4));
    const c = lerp(a, b, 0.5);
    if (Math.abs(c[0] - o.beltTop[2][0]) < 40) continue;
    s += PT.part(doc, M.st, M.BRONZE, circlePts(c[0], c[1], 7, 7), { shadowAmt: 5, rim: 2, lineW: 1.2 });
  }
  const bc = lerp(o.beltTop[2], o.beltBot[2], 0.5);
  const plate = [[bc[0] - 30, bc[1] - 26], [bc[0] + 26, bc[1] - 28], [bc[0] + 28, bc[1] + 26], [bc[0] - 28, bc[1] + 28]];
  s += PT.part(doc, M.st, M.BRONZE, plate.map((p, i) => i % 1 === 0 ? [p[0], p[1], 'c'] : p), { shadowAmt: 18, rim: 4, k: 1,
    details: P(ellipse(bc[0], bc[1], 13, 13), M.BRONZE.shadow, 'opacity="0.7"') + P(ellipse(bc[0] + 2, bc[1] - 2, 9, 9), M.BRONZE.light) + soft(doc, ellipse(bc[0] + 6, bc[1] - 6, 4, 3), M.BRONZE.hi, 1, 1) });
  return s;
}

function strapBand(c, w) {
  const S = L.sample(c, false, 4);
  const l = [], r = [];
  for (let i = 0; i < S.length; i++) {
    const a = S[Math.max(0, i - 1)], b = S[Math.min(S.length - 1, i + 1)];
    const n = L.perp(L.norm(L.sub(b, a)));
    l.push(L.add(S[i], L.mul(n, w / 2))); r.push(L.sub(S[i], L.mul(n, w / 2)));
  }
  return l.concat(r.reverse()).filter((_, i) => i % 2 === 0);
}

function stitch(c, off, col) {
  const S = L.sample(c, false, 9);
  let s = '';
  for (let i = 1; i < S.length - 1; i += 2) {
    const n = L.perp(L.norm(L.sub(S[i + 1], S[i - 1])));
    for (const k of [-1, 1]) {
      const p = L.add(S[i], L.mul(n, off * k));
      const q = L.add(S[i + 1], L.mul(n, off * k));
      s += `<line x1="${p[0].toFixed(1)}" y1="${p[1].toFixed(1)}" x2="${lerp(p, q, 0.55)[0].toFixed(1)}" y2="${lerp(p, q, 0.55)[1].toFixed(1)}" stroke="${col}" stroke-width="1.3" opacity="0.6"/>`;
    }
  }
  return s;
}

function circlePts(cx, cy, rx, ry) {
  const pts = [];
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); }
  return pts;
}

function guard(doc, pts, g) {
  let s = '';
  let det = '';
  const A = (t, side) => { // point along guard at fraction t (0 top .. 1 bottom), side 0 left/1 right
    const l = lerp(pts[0], pts[4], t), r = lerp(pts[9], pts[5], t);
    return side ? r : l;
  };
  // laced straps with bronze buckles
  for (const t of [0.14, 0.5, 0.84]) {
    const a = A(t, 0), b = A(t, 1);
    det += P(path([[a[0] - 4, a[1] - 9], [b[0] + 4, b[1] - 11], [b[0] + 4, b[1] + 9], [a[0] - 4, a[1] + 11]], true), M.LEATHER.base);
    det += P(taper([[a[0], a[1] + 9], [b[0], b[1] + 7]], 2), M.LEATHER.deep, 'opacity="0.8"');
    det += P(taper([[a[0], a[1] - 8], [b[0], b[1] - 10]], 1.5), M.LEATHER.hi, 'opacity="0.6"');
    const bk = lerp(a, b, 0.8);
    det += P(path([[bk[0] - 7, bk[1] - 11], [bk[0] + 7, bk[1] - 12], [bk[0] + 7, bk[1] + 10], [bk[0] - 7, bk[1] + 11]], true), M.BRONZE.base) + P(taper([[bk[0] + 3, bk[1] - 9], [bk[0] + 3, bk[1] + 8]], 2), M.BRONZE.hi);
  }
  // edge stitching + embossed line
  det += stitch([A(0.02, 0), A(0.98, 0)], 0, '#e6c08a').replace(/opacity="0.6"/g, 'opacity="0.35"');
  s += PT.part(doc, M.st, M.LEATHER2, pts, { shadowAmt: 34, details: det, rim: 6, lineW: 2 });
  return s;
}

function sandalFoot(doc, ft, side, g, J) {
  if (M.sandalSimple) return sandalFoot2(doc, ft, side, g, J);
  let s = '';
  // sole
  const sole = ft.slice(1, 7).map((p) => [p[0], p[1] + 6]).concat(ft.slice(1, 7).reverse().map((p) => [p[0], p[1] - 4]));
  // foot skin with toes at the front
  const toesFront = side === 'N' ? ft[5] : ft[6];
  let det = '';
  // toe separations near the front + nails
  const front = side === 'N' ? [ft[4], ft[5], ft[6]] : [ft[5], ft[6], ft[7]];
  for (let i = 0; i < 4; i++) {
    const t = 0.25 + i * 0.18;
    const p = lerp(front[0], front[2], t);
    det += P(taper([[p[0] - 4, p[1] - 12], [p[0], p[1] + 2]], [0, 1.8, 0]), M.SKIN.line, 'opacity="0.55"');
  }
  const nl = lerp(front[1], front[2], 0.3);
  det += P(ellipse(nl[0] - 4, nl[1] - 6, 7, 4.5, -0.15), M.SKIN.nail) + P(ellipse(nl[0] - 5, nl[1] - 7, 3, 1.6, -0.15), M.SKIN.nailHi);
  const nl2 = lerp(front[0], front[1], 0.6);
  det += P(ellipse(nl2[0] - 2, nl2[1] - 4, 4.5, 3, -0.15), M.SKIN.nail);
  // ankle bone
  const ank = side === 'N' ? J.AN : J.AF;
  det += soft(doc, ellipse(ank[0] - 4, ank[1] + 6, 11, 9), M.SKIN.hi, 3, 0.5);
  s += PT.part(doc, M.st, M.SKIN, ft, { shadowAmt: 30, details: det, rim: 5, bounceAmt: 6 });
  // sole under the foot
  s += PT.part(doc, M.st, M.LEATHER, sole, { shadowAmt: 4, rim: 3, lineW: 1.6, bounce: false });
  // straps wrap over the foot (arched bands), ankle wraps and a heel strap
  const band = (a, b, bulge, w = 9) => {
    const m = lerp(a, b, 0.5), n = L.perp(L.norm(L.sub(b, a)));
    const c = L.add(m, L.mul(n, bulge));
    const C = [a, c, b];
    const S = L.sample(C, false, 3, 1);
    const l = [], r = [];
    for (let i = 0; i < S.length; i++) {
      const p0 = S[Math.max(0, i - 1)], p1 = S[Math.min(S.length - 1, i + 1)];
      const nn = L.perp(L.norm(L.sub(p1, p0)));
      l.push(L.add(S[i], L.mul(nn, w / 2))); r.push(L.sub(S[i], L.mul(nn, w / 2)));
    }
    const pts = l.concat(r.reverse()).filter((_, i) => i % 2 === 0);
    return soft(doc, path(pts.map((p) => [p[0] - 3, p[1] + 3]), true), M.SKIN.deep, 1.5, 0.45) +
      PT.part(doc, M.st, M.LEATHER, pts, { shadowAmt: 3, rim: 2.5, lineW: 1.3, bounce: false, details: P(taper(C.map((p) => [p[0], p[1] - w * 0.18]), [0, 1.2, 0]), M.LEATHER.hi, 'opacity="0.6"') });
  };
  const heel = ft[1], toe = side === 'N' ? ft[5] : ft[6];
  const topF = lerp(ft[0], ft[9], 0.5);
  const sideA = (t) => lerp(ft[2], ft[4], t), topB = (t) => lerp(ft[9], ft[7], t);
  if (M.sandalSimple) {
    // classic T-strap: toe band, one instep band, a centre strap up to the ankle
    const toeA = lerp(ft[3], ft[4], 0.62), toeB = lerp(ft[8], ft[7], 0.72);
    s += band(toeA, toeB, -9, 7);
    s += band(sideA(0.22), topB(0.28), -11, 7);
    s += band(lerp(toeA, toeB, 0.82), [ft[9][0] - 4, ft[9][1] + 4], 3, 7);
  } else {
    s += band(lerp(ft[3], ft[4], 0.4), topB(0.95), -10, 8);
    s += band(sideA(0.25), topB(0.55), -12, 9);
    s += band(sideA(0.65), topB(0.2), -10, 9);
  }
  s += band([heel[0] + 4, heel[1] + 10], [ft[0][0] - 2, ft[0][1] + 6], 4, 8);
  return s;
}

// cleaner sandalled foot: individual toes, dim nails, visible sole, T-strap and ankle wraps
function sandalFoot2(doc, ft, side, g, J) {
  let s = '';
  const SK = M.SKIN, LE = M.LEATHER2 || M.LEATHER;
  const sole = ft.slice(1, 7).map((p) => [p[0], p[1] + 7]).concat(ft.slice(1, 7).reverse().map((p) => [p[0], p[1] - 3]));
  s += PT.part(doc, M.st, M.LEATHER, sole, { shadowAmt: 3, rim: 2, lineW: 1.4, bounce: false, details: P(taper(ft.slice(2, 6).map((p) => [p[0], p[1] - 2]), 1.6), LE.hi, 'opacity="0.55"') });
  // foot with a scalloped toe edge (toes are part of the foot, separated by short creases)
  const ank = side === 'N' ? J.AN : J.AF;
  const front = L.sample([ft[4], ft[5], ft[6], ft[7]], false, 2);
  const nT = 5, toeEdge = [], notches = [];
  const dir = L.norm(L.sub(ft[6], ft[1]));
  const t0 = side === 'N' ? 0.18 : 0.12, t1 = side === 'N' ? 0.92 : 0.86;
  const SPT = 6;
  for (let i = 0; i <= nT * SPT; i++) {
    const t = t0 + (t1 - t0) * i / (nT * SPT);
    const k = Math.min(front.length - 2, Math.floor(t * (front.length - 1)));
    const p = front[k], q = front[k + 1];
    const nn = L.norm(L.perp(L.sub(q, p)));
    const ph = (i % SPT) / SPT;
    const bump = Math.pow(Math.sin(ph * Math.PI), 0.6) * 3.6;
    toeEdge.push([p[0] + nn[0] * bump, p[1] + nn[1] * bump]);
    if (i % SPT === 0 && i > 0 && i < nT * SPT) notches.push([p, dir]);
  }
  const footPts = ft.slice(0, 4).concat(toeEdge, ft.slice(8));
  let det = soft(doc, ellipse(ank[0] - 4, ank[1] + 8, 12, 9), SK.hi, 5, 0.25);
  det += soft(doc, path([ft[9], ft[8], ft[7], lerp(ft[7], ft[0], 0.5)], true), SK.light, 10, 0.25);
  for (const [p, d] of notches) det += soft(doc, taper([p, L.sub(p, L.mul(d, 13))], [1.6, 0]), SK.deep, 0.8, 0.7);
  // small dim nails near the toe tips
  const nailAt = side === 'N' ? [0.78, 0.6] : [0.2, 0.35];
  for (const tt of nailAt) { const p = front[Math.floor(tt * (front.length - 1))]; det += soft(doc, ellipse(p[0] - dir[0] * 6, p[1] - dir[1] * 6 - 3, 5, 3.4, Math.atan2(dir[1], dir[0])), SK.nail, 0.8, 0.28); }
  s += PT.part(doc, M.st, SK, footPts, { shadowAmt: 26, details: det, rim: 3, bounceAmt: 6, k: 0.9 });
  // straps
  const band = (a, b, bulge, w = 10) => {
    const m = lerp(a, b, 0.5), n = L.perp(L.norm(L.sub(b, a)));
    const C = [a, L.add(m, L.mul(n, bulge)), b];
    const S = L.sample(C, false, 3, 1);
    const l = [], r = [];
    for (let i = 0; i < S.length; i++) {
      const p0 = S[Math.max(0, i - 1)], p1 = S[Math.min(S.length - 1, i + 1)];
      const nn = L.perp(L.norm(L.sub(p1, p0)));
      l.push(L.add(S[i], L.mul(nn, w / 2))); r.push(L.sub(S[i], L.mul(nn, w / 2)));
    }
    const pts = l.concat(r.reverse()).filter((_, i) => i % 2 === 0);
    return soft(doc, path(pts.map((p) => [p[0] - 2, p[1] + 4]), true), SK.deep, 3, 0.5) +
      PT.part(doc, M.st, LE, pts, { shadowAmt: 4, rim: 2, lineW: 1.2, bounce: false, details: P(taper(C.map((p) => [p[0], p[1] - w * 0.22]), [0, 1.4, 0]), LE.hi, 'opacity="0.55"') });
  };
  const sideA = (t) => lerp(ft[2], ft[4], t), topB = (t) => lerp(ft[9], ft[7], t);
  const toeA = lerp(ft[3], ft[4], 0.5), toeB = lerp(ft[8], ft[7], 0.55);
  s += band(toeA, toeB, -9, 9);
  s += band(lerp(toeA, toeB, 0.85), [ft[9][0] - 2, ft[9][1] + 6], 3, 9);
  s += band([ft[0][0] - 6, ft[0][1] + 10], [ft[9][0] + 8, ft[9][1] + 4], -7, 10);
  s += band([ft[0][0] - 3, ft[0][1] - 14], [ft[9][0] + 5, ft[9][1] - 18], -7, 9);
  s += band([ft[1][0] + 4, ft[1][1] + 10], [ft[0][0] - 2, ft[0][1] + 8], 4, 9);
  return s;
}

function spear(doc, b, t) {
  let s = '';
  const w = 15;
  const dir = L.norm(L.sub(t, b)), n = L.perp(dir);
  const shaft = [L.add(b, L.mul(n, w / 2)), L.add(t, L.mul(n, w / 2 * 0.9)), L.sub(t, L.mul(n, w / 2 * 0.9)), L.sub(b, L.mul(n, w / 2))];
  let det = '';
  for (let i = 0; i < 9; i++) { const p = lerp(b, t, 0.05 + i * 0.1); det += P(taper([L.add(p, L.mul(n, -2)), L.add(L.add(p, L.mul(dir, 70)), L.mul(n, -1))], [0, 1.2, 0]), M.WOOD.shadow, 'opacity="0.5"'); }
  s += PT.part(doc, M.st, M.WOOD, shaft, { shadowAmt: 8, rim: 4, lineW: 1.8, details: det });
  // iron leaf blade + socket
  const sock0 = t, sock1 = L.add(t, L.mul(dir, 46));
  const sock = [L.add(sock0, L.mul(n, 9)), L.add(sock1, L.mul(n, 6)), L.sub(sock1, L.mul(n, 6)), L.sub(sock0, L.mul(n, 9))];
  const tip = L.add(sock1, L.mul(dir, 150));
  const blade = [sock1, L.add(L.add(sock1, L.mul(dir, 40)), L.mul(n, 20)), L.add(L.add(sock1, L.mul(dir, 95)), L.mul(n, 15)), tip, L.sub(L.add(sock1, L.mul(dir, 95)), L.mul(n, 15)), L.sub(L.add(sock1, L.mul(dir, 40)), L.mul(n, 20))];
  s += PT.part(doc, M.st, M.IRON, blade, { shadowAmt: 0, rim: 3, lineW: 1.8, k: 0.8,
    shadows: [path([sock1, tip, L.sub(L.add(sock1, L.mul(dir, 95)), L.mul(n, 15)), L.sub(L.add(sock1, L.mul(dir, 40)), L.mul(n, 20))], true)],
    details: P(taper([L.add(sock1, L.mul(dir, 10)), L.sub(tip, L.mul(dir, 6))], [2.5, 1]), M.IRON.line, 'opacity="0.6"') + P(taper([L.add(L.add(sock1, L.mul(dir, 30)), L.mul(n, 6)), L.add(L.add(sock1, L.mul(dir, 100)), L.mul(n, 4))], [0, 3, 0]), M.IRON.hi, 'opacity="0.9"') });
  s += PT.part(doc, M.st, M.IRON, sock, { shadowAmt: 8, rim: 3, lineW: 1.6, details: P(taper([L.add(lerp(sock0, sock1, 0.3), L.mul(n, 8)), L.sub(lerp(sock0, sock1, 0.3), L.mul(n, 8))], 2.5), M.IRON.shadow) });
  return s;
}

function neck(doc, g, J, N, T) {
  let s = '';
  const d = g.neck;
  s += PT.part(doc, M.st, M.SKIN, d, { shadowAmt: M.neckShadow ?? 70, noLine: true, bounce: M.neckBounce ?? true, formLight: M.neckForm ?? true,
    details: (() => {
      const nb = Math.max(1, (M.st.cel ?? 1) * 0.9);
      let d = '';
      // jaw / beard cast shadow on the neck (the head blocks the key light)
      d += soft(doc, path(N([[478, 516], [520, 554], [566, 572], [612, 572], [632, 588], [624, 612], [584, 612], [536, 604], [496, 582], [472, 556]]), true), M.SKIN.shadow, nb, 0.9);
      // sternocleidomastoid: one soft ridge, no hard strings
      d += soft(doc, taper(N([[508, 556], [536, 594], [566, 628], [590, 652]]), [0, 10, 8, 2]), M.SKIN.light, nb * 1.5, (M.neckRidge ?? 0.35));
      d += soft(doc, ellipse(...N([[612, 606]])[0], 9, 14), M.SKIN.hi, 3, 0.5);
      // clavicle
      d += soft(doc, taper(T([[588, 666], [540, 676], [494, 680], [460, 684]]), [0, 4, 3, 0]), M.SKIN.hi, nb * 0.6, 0.4);
      d += soft(doc, taper(T([[586, 678], [540, 690], [494, 694]]), [0, 3.5, 0]), M.SKIN.deep, nb * 0.6, 0.3);
      return d + forms(doc, g, 'neck', 10);
    })(),
  });
  // neck silhouette lines only (back of neck -> trapezius, throat -> far trapezius)
  if (M.st.lineMode !== 'none') {
    const lx = L.norm(M.st.light)[0];
    const kl = (M.st.lineW / 2.1) * (1 + 0.45 * lx), kr = (M.st.lineW / 2.1) * (1 - 0.45 * lx);
    s += P(taper(N([[494, 530], [492, 548], [482, 578], [462, 602], [436, 622], [414, 640], [404, 660]]), [0.6, 2.6, 2.8, 2.6, 2.4, 2.0, 1.4].map((v) => v * kl)), M.st.neckLineL || M.st.lineColor);
    s += P(taper(N([[580, 568], [594, 580], [604, 596], [618, 610], [652, 620], [702, 630], [736, 642]]), [0.6, 2.0, 1.8, 1.6, 1.4, 1.1, 0.6].map((v) => v * kr)), M.st.neckLineR || M.st.lineColor);
  }
  return s;
}


function figure(doc, cfg, E) {
  M = cfg;
  const st = cfg.st, SK = cfg.SKIN;
  const J = B.skeleton(cfg.params);
  const g = B.warped(J, cfg.widths);
  const o = O.warpOut(g);
  const wp = (arr, bind) => arr.map((p) => g.warp(p, bind));
  const T = (arr) => wp(arr, ['torso']);
  const N = (arr) => wp(arr, ['neck']);
  const sh = cfg.shade ?? 1;
  let s = '';
  const prop = propGeom(cfg, J);
  if (prop.behind) s += prop.behind(doc);
  // far leg
  s += PT.part(doc, st, SK, g.legF, { shadowAmt: 54 * sh, details: forms(doc, g, 'legF', 12) + (cfg.legDetail ? cfg.legDetail(doc, g, 'F') : '') });
  s += sandalFoot(doc, g.ftF, 'F', g, J);
  // far arm + fist
  s += PT.part(doc, st, SK, g.armF, { shadowAmt: 40 * sh, details: forms(doc, g, 'armF', 12) + P(taper(wp([[748, 946], [760, 958], [774, 954]], ['limb', 'EF', 'WF', 'fore']), [0, 2.2, 0]), SK.line, 'opacity="0.5"') + (cfg.armDetail ? cfg.armDetail(doc, g, 'F') : '') });
  {
    const ang = prop.ang;
    const loc = { ...st, light: rotate(st.light, -ang), rimDir: rotate(st.rimDir || st.light, -ang) };
    s += `<g transform="translate(${prop.grip[0]},${prop.grip[1]}) rotate(${(ang * 180 / Math.PI).toFixed(2)}) scale(${0.94 * (cfg.handK ?? 1)})">${H.fistGrip(doc, loc, SK, { lw: st.handLW ?? 1.9 })}</g>`;
  }
  if (prop.front) s += prop.front(doc);
  // torso + neck
  s += PT.part(doc, st, SK, g.torso, { shadowAmt: 150 * sh,
    shadows: [path(T([[606, 798], [570, 818], [528, 824], [488, 812], [456, 786], [452, 812], [490, 836], [530, 846], [574, 840], [610, 818]]), true)],
    formOp: cfg.torsoFormOp, details: soft(doc, path(T([[476, 692], [482, 740], [474, 790], [462, 800], [466, 740], [466, 700]]), true), SK.deep, 5, 0.45) + forms(doc, g, 'torso', 16) + (cfg.torsoDetail ? cfg.torsoDetail(doc, g, T) : '') });
  s += neck(doc, g, J, N, T);
  // near leg
  s += PT.part(doc, st, SK, g.legN, { shadowAmt: 70 * sh, details: forms(doc, g, 'legN', 14) + (cfg.legDetail ? cfg.legDetail(doc, g, 'N') : '') });
  s += sandalFoot(doc, g.ftN, 'N', g, J);
  // clothing
  s += tunic(doc, o, T, J, g);
  // head
  s += `<g transform="translate(${J.head[0]},${J.head[1]}) scale(${J.headS})">${cfg.face(doc, E, { sc: J.headS })}</g>`;
  // near arm with open hand
  {
    const wr = J.WN, el = J.EN;
    const ang = Math.atan2(-(wr[0] - el[0]), wr[1] - el[1]) * 0.6;
    const loc = { ...st, light: rotate(st.light, -ang), rimDir: rotate(st.rimDir || st.light, -ang) };
    s += `<g transform="translate(${wr[0] + 2},${wr[1] + 6}) rotate(${(ang * 180 / Math.PI).toFixed(2)}) scale(${1.08 * (cfg.handK ?? 1)})">${H.openHand(doc, loc, SK, { lw: st.handLW ?? 1.9 })}</g>`;
  }
  s += PT.part(doc, st, SK, g.armN, { shadowAmt: 54 * sh, lineOpen: cfg.armNLine,
    details: P(taper(wp([[472, 700], [458, 760], [430, 812], [408, 846]], ['limb', 'shN', 'EN', 'arm']), [0, 3, 3, 0]), SK.line, `opacity="${cfg.deltLineOp ?? 0.45}"`) +
      P(taper(wp([[452, 962], [440, 972], [430, 968]], ['limb', 'EN', 'WN', 'fore']), [0, 2.2, 0]), SK.line, 'opacity="0.5"') + forms(doc, g, 'armN', 14) + (cfg.armDetail ? cfg.armDetail(doc, g, 'N') : '') });
  s += guard(doc, o.guard, g);
  if (cfg.overlay) s += cfg.overlay(doc, g, J);
  return { svg: s, J, g };
}

// prop geometry: everything is a vertical object gripped by the far fist
function propGeom(cfg, J) {
  const wr = J.WF;
  const kind = cfg.prop;
  if (kind === 'spear' || kind === 'trident') {
    const b = [wr[0] + 52, 1868], t = [wr[0] - 6, kind === 'spear' ? 236 : 300];
    const gy = wr[1] + 54;
    const gx = lerp(b, t, (b[1] - gy) / (b[1] - t[1]))[0];
    const ang = Math.atan2(t[0] - b[0], b[1] - t[1]);
    return { grip: [gx, gy], ang, behind: (doc) => kind === 'spear' ? spear(doc, b, t) : trident(doc, b, t) };
  }
  if (kind === 'gladius') {
    const gx = wr[0] + 14, gy = wr[1] + 54;
    const ang = -0.12;
    return { grip: [gx, gy], ang, behind: (doc) => gladiusGrip(doc, [gx, gy], ang), front: (doc) => gladius(doc, [gx, gy], ang) };
  }
  if (kind === 'helmet') {
    const gx = wr[0] + 12, gy = wr[1] + 50;
    return { grip: [gx, gy], ang: 0.05, behind: (doc) => helmet(doc, [gx, gy]) };
  }
  return { grip: [wr[0], wr[1] + 50], ang: 0 };
}

function trident(doc, b, t) {
  let s = '';
  const w = 15, dir = L.norm(L.sub(t, b)), n = L.perp(dir);
  const shaft = [L.add(b, L.mul(n, w / 2)), L.add(t, L.mul(n, w / 2 * 0.9)), L.sub(t, L.mul(n, w / 2 * 0.9)), L.sub(b, L.mul(n, w / 2))];
  let det = '';
  for (let i = 0; i < 9; i++) { const p = lerp(b, t, 0.05 + i * 0.1); det += P(taper([L.add(p, L.mul(n, -2)), L.add(L.add(p, L.mul(dir, 70)), L.mul(n, -1))], [0, 1.2, 0]), M.WOOD.shadow, 'opacity="0.5"'); }
  s += PT.part(doc, M.st, M.WOOD, shaft, { shadowAmt: 8, rim: 4, lineW: M.st.propLW ?? 1.8, details: det });
  // bronze head: collar, crossbar, three barbed tines
  const at = (u, v) => L.add(L.add(t, L.mul(dir, u)), L.mul(n, v));
  const collar = [at(-10, 11), at(40, 9), at(40, -9), at(-10, -11)];
  const bar = [at(36, 48), at(58, 46), at(64, 0), at(58, -46), at(36, -48), at(46, 0)];
  const tine = (v, len) => [at(54, v + 7), at(54 + len * 0.82, v + 6), at(54 + len * 0.78, v + 15), at(54 + len, v), at(54 + len * 0.78, v - 9), at(54 + len * 0.82, v - 4), at(54, v - 7)];
  for (const [v, len] of [[-40, 120], [40, 120], [0, 150]]) s += PT.part(doc, M.st, M.METAL, tine(v, len).map((p) => [p[0], p[1], 'c']), { shadowAmt: 6, rim: 3, lineW: M.st.propLW ?? 1.7, details: P(taper([at(60, v), at(54 + len * 0.9, v)], [0, 2.4, 0]), M.METAL.hi, 'opacity="0.8"') });
  s += PT.part(doc, M.st, M.METAL, bar, { shadowAmt: 10, rim: 3, lineW: M.st.propLW ?? 1.8, k: 0.6 });
  s += PT.part(doc, M.st, M.METAL, collar.map((p) => [p[0], p[1], 'c']), { shadowAmt: 8, rim: 3, lineW: M.st.propLW ?? 1.6, details: P(taper([at(8, 11), at(8, -11)], 3), M.METAL.shadow) + P(taper([at(24, 10), at(24, -10)], 3), M.METAL.shadow) });
  return s;
}

function gladiusGrip(doc, g, ang) {
  // ridged bone/wood grip running through the fist (drawn behind the fingers)
  const dir = [Math.sin(-ang), Math.cos(ang)], n = L.perp(dir);
  const at = (u, v) => L.add(L.add(g, L.mul(dir, u)), L.mul(n, v));
  let det = '';
  for (const u of [-62, -52, -42]) det += P(taper([at(u, 9), at(u, -9)], 2), M.WOOD.shadow, 'opacity="0.7"');
  return PT.part(doc, M.st, M.WOOD, [at(-72, 10), at(66, 11), at(66, -11), at(-72, -10)], { shadowAmt: 8, rim: 2, lineW: M.st.propLW ?? 1.6, details: det });
}

function gladius(doc, g, ang) {
  // hilt passes through the fist; blade points down past the thigh
  const dir = [Math.sin(-ang), Math.cos(ang)], n = L.perp(dir);
  const at = (u, v) => L.add(L.add(g, L.mul(dir, u)), L.mul(n, v));
  let s = '';
  const blade = [at(80, 22), at(340, 18), at(382, 0), at(340, -18), at(80, -22)];
  s += PT.part(doc, M.st, M.METAL, blade.map((p, i) => i === 2 ? [p[0], p[1], 'c'] : p), { shadowAmt: 0, rim: 3, lineW: M.st.propLW ?? 1.8, k: 0.5,
    shadows: [path([at(80, 0), at(382, 0), at(340, -18), at(80, -22)], true)],
    details: P(taper([at(86, 2), at(360, 1)], [2.4, 1]), M.METAL.line, 'opacity="0.55"') + P(taper([at(96, 9), at(330, 7)], [0, 3, 0]), M.METAL.hi, 'opacity="0.9"') });
  const guardP = [at(58, 34), at(82, 30), at(82, -30), at(58, -34)];
  s += PT.part(doc, M.st, M.BRONZE, guardP, { shadowAmt: 8, rim: 3, lineW: M.st.propLW ?? 1.7 });
  const pommel = L.ellipse(...at(-62, 0), 20, 15);
  s += PT.part(doc, M.st, M.BRONZE, circlePts(...at(-84, 0), 18, 14), { shadowAmt: 8, rim: 3, lineW: M.st.propLW ?? 1.7 });
  return s;
}

function helmet(doc, g) {
  // bronze murmillo-style helmet: tall dome, wide brim, visor pierced with round holes, crest fin with a horsehair plume.
  // The fist grips the crest fin; the helmet hangs below it, turned three-quarters.
  const c = [g[0] + 2, g[1] + 132];
  let s = '';
  const at = (x, y) => [c[0] + x, c[1] + y];
  const plume = [at(-6, -150), at(30, -190), at(84, -184), at(128, -150), at(150, -96), at(140, -60), at(118, -96), at(92, -134), at(52, -150), at(20, -136)];
  s += PT.part(doc, M.st, M.CREST || M.CLOTH, plume, { shadowAmt: 18, rim: 4, lineW: M.st.propLW ?? 1.8,
    details: (() => { let d = ''; for (let i = 0; i < 9; i++) d += P(taper([at(4 + i * 12, -150 + i * 2), at(50 + i * 11, -170 + i * 9), at(96 + i * 6, -150 + i * 10)], [0, 1.6, 0]), (M.CREST || M.CLOTH).shadow, 'opacity="0.6"'); return d; })() });
  const fin = [at(-14, -104), at(-10, -150), at(24, -160), at(30, -110)];
  s += PT.part(doc, M.st, M.BRONZE, fin, { shadowAmt: 10, rim: 3, lineW: M.st.propLW ?? 1.6 });
  const visor = [at(-60, 20), at(70, 20), at(66, 112), at(8, 136), at(-56, 112)];
  s += PT.part(doc, M.st, M.BRONZE, visor, { shadowAmt: 30, rim: 4, lineW: M.st.propLW ?? 1.8,
    details: (() => { let d = ''; for (let row = 0; row < 6; row++) for (let col = 0; col < 8; col++) { const x = -44 + col * 14 + (row % 2) * 7, y = 34 + row * 15; if (x > 60 - row * 2 || (row === 5 && Math.abs(x - 8) > 34)) continue; d += `<circle cx="${(c[0] + x).toFixed(1)}" cy="${(c[1] + y).toFixed(1)}" r="4.2" fill="${M.BRONZE.deep}"/><circle cx="${(c[0] + x + 1).toFixed(1)}" cy="${(c[1] + y + 1.4).toFixed(1)}" r="1.6" fill="${M.BRONZE.light}" opacity="0.5"/>`; } return d; })() + P(taper([at(-58, 24), at(68, 24)], 4), M.BRONZE.shadow, 'opacity="0.7"') });
  const dome = [at(-74, 12), at(-80, -44), at(-50, -100), at(4, -118), at(58, -102), at(86, -48), at(84, 12)];
  s += PT.part(doc, M.st, M.BRONZE, dome, { shadowAmt: 44, rim: 5, lineW: M.st.propLW ?? 1.8,
    details: soft(doc, L.ellipse(c[0] - 16, c[1] - 66, 20, 30, -0.3), M.BRONZE.hi, 6, 0.75) + P(taper([at(-70, -8), at(80, -8)], 4), M.BRONZE.shadow, 'opacity="0.6"') + P(taper([at(-66, -16), at(76, -16)], 2), M.BRONZE.hi, 'opacity="0.5"') });
  const brim = [at(-108, 10), at(-40, 2), at(40, 2), at(116, 8), at(124, 28), at(40, 32), at(-40, 32), at(-112, 28)];
  s += PT.part(doc, M.st, M.BRONZE, brim, { shadowAmt: 12, rim: 3, lineW: M.st.propLW ?? 1.8, details: P(taper([at(-104, 14), at(120, 14)], 1.6), M.BRONZE.hi, 'opacity="0.6"') });
  return s;
}

// Complete 1080x1920 image: backdrop, rim light-wrap, figure, face inset, grain, number.
function image(cfg, outFile) {
  const W = 1080, HH = 1920;
  const doc = new L.Doc(W, HH);
  const fig = figure(doc, cfg, cfg.exprA);
  let s = cfg.backdrop(doc, fig.J);
  const g0 = fig.g;
  if (cfg.wrap) {
    const sil = ['legN', 'legF', 'armN', 'armF', 'torso', 'neck'].map((k) => `<path d="${path(g0[k], true)}"/>`).join('') + `<ellipse cx="${fig.J.head[0] + 20}" cy="${fig.J.head[1] + 90}" rx="80" ry="120"/>`;
    const rx = Math.sign((cfg.st.rimDir || cfg.st.light)[0]);
    const wm = doc.mask(`<rect width="${W}" height="${HH}" fill="${doc.lin(fig.J.NP[0] - 60 * rx, 0, fig.J.NP[0] + 260 * rx, 0, [[0, '#000'], [1, '#fff']])}"/>`);
    s += `<g mask="${wm}"><g fill="${cfg.wrap.color}" filter="${doc.blur(cfg.wrap.blur ?? 18)}" opacity="${cfg.wrap.op ?? 0.8}" transform="translate(${16 * rx},-2)">${sil}</g></g>`;
  }
  s += fig.svg;
  // exact silhouette mask of the figure (its own drawing turned white), for light that must stay on the body
  if (!doc.cache.whiteF) { const id = doc.id('wf'); doc.raw(`<filter id="${id}" x="0" y="0" width="1080" height="1920" filterUnits="userSpaceOnUse"><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0"/></filter>`); doc.cache.whiteF = id; }
  const silMask = doc.mask(`<g filter="url(#${doc.cache.whiteF})">${fig.svg}</g>`);
  if (cfg.falloff) {
    const fo = cfg.falloff;
    s += `<rect width="${W}" height="${HH}" mask="${silMask}" fill="${doc.lin(0, fo.y0, 0, fo.y1, [[0, fo.color, 0], [1, fo.color, fo.op]])}" style="mix-blend-mode:multiply"/>`;
  }
  if (cfg.post) s += cfg.post(doc, fig.J, silMask);
  // inset: same figure with the funny expression, zoomed on the head
  const fig2 = figure(doc, cfg, cfg.exprB);
  const J = fig.J;
  const fc = [J.head[0] + (cfg.insetFx ?? 200) * J.headS, J.head[1] + (cfg.insetFy ?? 560) * J.headS];
  const z = cfg.insetZoom ?? 2.05, ix = 36, iy = 64, iw = 404, ih = 470;
  const clip = doc.clip(`M${ix + 24},${iy}H${ix + iw - 24}Q${ix + iw},${iy} ${ix + iw},${iy + 24}V${iy + ih - 24}Q${ix + iw},${iy + ih} ${ix + iw - 24},${iy + ih}H${ix + 24}Q${ix},${iy + ih} ${ix},${iy + ih - 24}V${iy + 24}Q${ix},${iy} ${ix + 24},${iy}Z`);
  s += soft(doc, `M${ix + 6},${iy + 14}h${iw}v${ih}h-${iw}Z`, '#000', 12, 0.4);
  s += `<g clip-path="${clip}">${cfg.insetBg(doc, ix, iy, iw, ih)}<g transform="translate(${ix + iw / 2 + (cfg.insetDx ?? 10)},${iy + ih * 0.47}) scale(${z}) translate(${-fc[0]},${-fc[1]})">${fig2.svg}</g>${cfg.insetPost ? cfg.insetPost(doc, ix, iy, iw, ih) : ''}</g>`;
  s += `<rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" rx="24" fill="none" stroke="${cfg.frame || '#fff4dc'}" stroke-width="5"/>`;
  s += `<rect width="${W}" height="${HH}" filter="${doc.paintTex(0.010, cfg.number + 3)}" opacity="${cfg.texOp ?? 0.10}" style="mix-blend-mode:soft-light"/>`;
  s += `<rect width="${W}" height="${HH}" filter="${doc.grain(0.9, cfg.number + 6)}" opacity="${cfg.grainOp ?? 0.10}" style="mix-blend-mode:overlay"/>`;
  const np = cfg.numPos || [1012, 1858];
  s += `<g transform="translate(${np[0]},${np[1]})"><circle r="34" fill="#140e0c" opacity="0.82"/><text y="13" text-anchor="middle" font-family="Georgia, serif" font-size="38" font-weight="700" fill="${cfg.numColor || '#ffe2a8'}">${cfg.number}</text></g>`;
  require('fs').writeFileSync(outFile, doc.svg(s));
}

module.exports = { figure, image, rotate };
