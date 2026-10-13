// Reusable facial feature builders. Everything is in head-local units (head height = 1000).
'use strict';
const L = require('./lib');
const { path, taper, P, G, inside, soft, crescent, ellipse, lerp, mix } = L;

// Expression defaults
function expr(e = {}) {
  return Object.assign({
    browN: [0, 0], browF: [0, 0], // [inner raise, outer raise]
    furrow: 0,
    lidN: 1, lidF: 1, lowN: 0, lowF: 0,
    gaze: [0, 0], pupil: 1,
    open: 0, wide: 1, cornN: 0, cornF: 0, teeth: 'none',
    jaw: 0, cheekN: 0, cheekF: 0, tilt: 0,
    sweat: false, extra: null,
  }, e);
}

// Shift a point for jaw drop (points below `y0` move down progressively).
function jawPt(p, jaw, y0 = 760, y1 = 1000, dx = 0) {
  if (!jaw) return p;
  const t = Math.max(0, Math.min(1, (p[1] - y0) / (y1 - y0)));
  const s = t * t * (3 - 2 * t);
  return [p[0] - dx * s * jaw / 100, p[1] + jaw * s, p[2]];
}

// Eye: corners a (outer) & b (inner), upper lid apex height, lower lid depth.
// o = {a,b,up,low,upSkew,lowSkew,iris:[cx,cy],ir,pupil, lidOpen}
// style = {line, lineW, white, whiteShadow, iris, irisDark, pupil, lash, lidSkin, lidShadow, catch, soft}
function eye(doc, o, st) {
  const { a, b } = o;
  const mid = lerp(a, b, 0.5);
  const open = o.open ?? 1;
  const upH = o.up * open, lowH = o.low;
  const sk = o.upSkew ?? 0.45, lsk = o.lowSkew ?? 0.5;
  const upApex = [lerp(a, b, sk)[0], lerp(a, b, sk)[1] - upH];
  const lowApex = [lerp(a, b, lsk)[0], lerp(a, b, lsk)[1] + lowH];
  const up = [a, lerp(a, upApex, 0.5).map((v, i) => i ? v - upH * 0.18 : v), upApex, lerp(upApex, b, 0.55).map((v, i) => i ? v - upH * 0.12 : v), b];
  const low = [b, lerp(b, lowApex, 0.5).map((v, i) => i ? v + lowH * 0.12 : v), lowApex, lerp(lowApex, a, 0.5).map((v, i) => i ? v + lowH * 0.2 : v), a];
  const ap = up.concat(low.slice(1, -1));
  const aperture = path(ap, true, 0.9);
  let s = '';
  // sclera (never pure white: shaded by the lid)
  s += P(aperture, st.white);
  const irisR = o.ir;
  const ic = o.iris;
  s += inside(doc, aperture,
    // lid cast shadow on eyeball
    soft(doc, path([[a[0] - 20, a[1] - upH * 1.6], [mid[0], mid[1] - upH * 1.8], [b[0] + 20, b[1] - upH * 1.6], [b[0] + 20, b[1] - upH * 0.2], [mid[0], mid[1] - upH * 0.15 + (st.lidCast || 10)], [a[0] - 20, a[1] - upH * 0.2]], true), st.whiteShadow, st.soft ? 3 : 1.5, 0.9) +
    // corner shading (eyeball roundness)
    soft(doc, ellipse(a[0], a[1], 22, 30), st.whiteShadow, 6, 0.7) +
    soft(doc, ellipse(b[0], b[1], 16, 26), st.whiteShadow, 6, 0.5) +
    // iris
    `<ellipse cx="${ic[0]}" cy="${ic[1]}" rx="${irisR * (o.irx || 1)}" ry="${irisR}" fill="${st.iris}"/>` +
    soft(doc, ellipse(ic[0] + irisR * 0.1 * (o.irx || 1), ic[1] + irisR * 0.4, irisR * 0.6 * (o.irx || 1), irisR * 0.42), st.irisLight || st.iris, irisR * 0.12, 0.9) +
    `<ellipse cx="${ic[0]}" cy="${ic[1]}" rx="${irisR * (o.irx || 1) * 0.92}" ry="${irisR * 0.92}" fill="none" stroke="${st.irisDark}" stroke-width="${irisR * 0.2}"/>` +
    `<ellipse cx="${ic[0]}" cy="${ic[1]}" rx="${irisR * 0.4 * (o.pupil || 1) * (o.irx || 1)}" ry="${irisR * 0.4 * (o.pupil || 1)}" fill="${st.pupil}"/>` +
    // upper lid shadow over iris
    soft(doc, path([[a[0] - 30, a[1] - upH * 2], [b[0] + 30, b[1] - upH * 2], [b[0] + 30, b[1] - upH * 0.55], [mid[0], mid[1] - upH * 0.55 + (st.lidCast || 10) * 1.6], [a[0] - 30, a[1] - upH * 0.55]], true), st.irisDark, 2, 0.55) +
    // catchlight
    `<ellipse cx="${ic[0] + (st.catchOff?.[0] ?? -irisR * 0.35)}" cy="${ic[1] + (st.catchOff?.[1] ?? -irisR * 0.35)}" rx="${irisR * 0.26 * (o.irx || 1)}" ry="${irisR * 0.22}" fill="${st.catch}"/>` +
    `<circle cx="${ic[0] + irisR * 0.38}" cy="${ic[1] + irisR * 0.3}" r="${irisR * 0.09}" fill="${st.catch}" opacity="0.6"/>`
  );
  // caruncle (pink inner corner)
  s += soft(doc, ellipse(b[0] - 6, b[1] + 1, 9, 8), st.caruncle, 1, 0.9);
  // upper lash line: heavy, tapered toward inner corner
  s += P(taper(up, (t) => st.lashW * (0.35 + 0.65 * Math.sin(Math.PI * Math.min(1, t * 1.1 + 0.05)) ) * (t < 0.08 ? t / 0.08 : 1)), st.lash);
  // outer lash flick
  s += P(taper([a, [a[0] - 14, a[1] - 4], [a[0] - 22, a[1] - 12]], [st.lashW * 0.8, st.lashW * 0.4, 0]), st.lash);
  // lower lid line: thin, broken in the middle
  if (st.lowLine) s += P(taper(low.slice(1, 4).reverse().concat([]), [0, st.lowW, st.lowW * 0.8, 0]), st.lowLine, 'opacity="0.85"');
  // lower lid rim (waterline highlight)
  s += P(taper([lerp(b, lowApex, 0.3), lowApex, lerp(lowApex, a, 0.6)].map((p) => [p[0], p[1] + 4]), [0, 3, 0]), st.rimLow || '#f0c0a8', 'opacity="0.6"');
  return { svg: s, up, low, upApex, lowApex, aperture };
}

// Hair strokes (brows, beards): many tapered strokes following a flow along a band.
// band: array of [p, w] center points with half-heights; count strokes.
function hairBand(doc, centers, opts) {
  const { count = 18, color, width = 4, len: hl = 30, angle = -0.3, jitter = 0.3, seed = 1 } = opts;
  let r = seed * 9973;
  const rnd = () => { r = (r * 16807) % 2147483647; return r / 2147483647; };
  let s = '';
  const sm = L.sample(centers.map((c) => c[0]), false, 1);
  for (let i = 0; i < count; i++) {
    const t = (i + rnd() * 0.8) / count;
    const k = Math.min(sm.length - 1, Math.floor(t * (sm.length - 1)));
    const p = sm[k];
    const ci = Math.min(centers.length - 1, t * (centers.length - 1));
    const lo = Math.floor(ci), hi = Math.min(centers.length - 1, lo + 1);
    const hh = centers[lo][1] + (centers[hi][1] - centers[lo][1]) * (ci - lo);
    const off = (rnd() - 0.5) * 2 * hh;
    const ang = (typeof angle === 'function' ? angle(t) : angle) + (rnd() - 0.5) * jitter;
    const l = hl * (0.6 + rnd() * 0.6) * (typeof opts.lenF === 'function' ? opts.lenF(t) : 1);
    const p0 = [p[0] - Math.cos(ang) * l * 0.5, p[1] + off - Math.sin(ang) * l * 0.5];
    const p2 = [p[0] + Math.cos(ang) * l * 0.5, p[1] + off + Math.sin(ang) * l * 0.5];
    const bend = (rnd() - 0.5) * l * 0.2 + (opts.bend || 0) * l;
    const p1 = [(p0[0] + p2[0]) / 2 - Math.sin(ang) * bend, (p0[1] + p2[1]) / 2 + Math.cos(ang) * bend];
    const col = Array.isArray(color) ? color[Math.floor(rnd() * color.length)] : color;
    s += P(taper([p0, p1, p2], [width * 0.8, width, 0]), col, opts.op ? `opacity="${opts.op}"` : '');
  }
  return s;
}

// Simple seeded RNG
function rng(seed) { let r = (seed * 9301 + 49297) % 233280 || 1; return () => { r = (r * 16807) % 2147483647; return r / 2147483647; }; }

module.exports = { expr, jawPt, eye, hairBand, rng };

// Spiral curl stroke (for curly hair): centre c, radius R, start angle a0, turns, direction (+1 cw / -1 ccw)
function curlStroke(c, R, a0, turns, dir, w, squash = 0.8) {
  const pts = [];
  const n = 14;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const a = a0 + dir * t * turns * Math.PI * 2;
    const r = R * (1 - 0.68 * t);
    pts.push([c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r * squash]);
  }
  return require('./lib').taper(pts, (t) => w * (t < 0.12 ? 0.25 + t * 6 : 1 - (t - 0.12) * 0.85));
}
module.exports.curlStroke = curlStroke;

// Curly hair mass: bumpy silhouette from a base outline, form-lit, with clumps + ringlet texture.
// opt: {light:[dx,dy] unit toward light, base, mid, lit, sheen, rim, rimHot, line, lw, seed, bumps:[min,max], edgeFrom, edgeTo}
function curlyMass(doc, outline, opt) {
  const L = require('./lib');
  const R = rng(opt.seed || 5);
  const pts = [];
  const n = outline.length;
  for (let i = 0; i < n; i++) {
    const a = outline[i], b = outline[(i + 1) % n];
    pts.push(a);
    const bumpy = i >= (opt.edgeFrom ?? 0) && i < (opt.edgeTo ?? n);
    if (!bumpy) continue;
    const seg = L.len(L.sub(b, a));
    const bw = opt.bumpW || 70;
    const k = Math.max(1, Math.round(seg / bw));
    const nn = L.norm(L.perp(L.sub(b, a)));
    for (let j = 0; j < k; j++) {
      const t0 = j / k, t1 = (j + 1) / k;
      const h = (opt.bumps?.[0] || 14) + R() * ((opt.bumps?.[1] || 30) - (opt.bumps?.[0] || 14));
      const at = (t, hh) => { const m = L.lerp(a, b, t0 + (t1 - t0) * t); return [m[0] - nn[0] * hh, m[1] - nn[1] * hh]; };
      if (j > 0) pts.push([...L.lerp(a, b, t0), 'c']);
      pts.push(at(0.12, h * 0.62));
      pts.push(at(0.5, h));
      pts.push(at(0.88, h * 0.62));
    }
  }
  const d = L.path(pts, true, 1);
  const lt = opt.light;
  let s = L.P(d, opt.base);
  let sh = '';
  // big form: lit side toward the light
  sh += L.crescent(doc, d, [-lt[0] * 120, -lt[1] * 120], opt.mid, 30, 0.9);
  sh += L.crescent(doc, d, [-lt[0] * 60, -lt[1] * 60], opt.lit, 14, 0.8);
  // clumps
  const bb = outline.reduce((acc, p) => [Math.min(acc[0], p[0]), Math.min(acc[1], p[1]), Math.max(acc[2], p[0]), Math.max(acc[3], p[1])], [1e9, 1e9, -1e9, -1e9]);
  const clumps = [];
  for (let i = 0; i < (opt.clumps || 40); i++) {
    clumps.push([bb[0] + R() * (bb[2] - bb[0]), bb[1] + R() * (bb[3] - bb[1]), (opt.cr || 34) * (0.6 + R() * 0.7), R()]);
  }
  clumps.sort((p, q) => p[1] - q[1]);
  for (const [x, y, r, q] of clumps) {
    const cd = L.ellipse(x, y, r, r * 0.8, q * 3);
    // how lit is this clump (projection on light dir relative to centre of mass)
    const cx = (bb[0] + bb[2]) / 2, cy = (bb[1] + bb[3]) / 2;
    const lit = Math.max(0, Math.min(1, 0.5 + ((x - cx) * lt[0] + (y - cy) * lt[1]) / ((bb[2] - bb[0]) * 0.6)));
    sh += L.crescent(doc, cd, [lt[0] * r * 0.5, lt[1] * r * 0.5], opt.base, r * 0.15, 0.75);
    sh += L.crescent(doc, cd, [-lt[0] * r * 0.4, -lt[1] * r * 0.4], lit > 0.45 ? opt.lit : opt.mid, r * 0.1, 0.5 + lit * 0.5);
    const dir = R() > 0.5 ? 1 : -1, a0 = R() * 6.28;
    sh += L.P(curlStroke([x, y + 2], r * 0.55, a0, 1.1, dir, opt.lw * 2.2), opt.base, 'opacity="0.8"');
    if (lit > 0.35) sh += L.P(curlStroke([x - 1, y - 1], r * 0.52, a0 + 2.2 * dir, 0.4, dir, opt.lw * 1.0), opt.sheen, `opacity="${(0.3 + lit * 0.5).toFixed(2)}"`);
  }
  sh += L.crescent(doc, d, [-lt[0] * 16, -lt[1] * 16], opt.rim, 1.2, 0.95);
  if (opt.rimHot) sh += L.crescent(doc, d, [-lt[0] * 6, -lt[1] * 6], opt.rimHot, 0.6, 0.8);
  if (opt.occl) sh += opt.occl;
  s += L.inside(doc, d, sh);
  if (opt.line) s += L.P(L.taper(L.sample(pts, true, 3).filter((p, i, arr) => i < arr.length), opt.lw * 1.3), opt.line, 'opacity="0.0"');
  return { svg: s, d };
}
module.exports.curlyMass = curlyMass;
