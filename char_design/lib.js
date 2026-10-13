// Shared drawing toolkit: splines, tapered strokes, SVG defs registry, shading helpers.
'use strict';

const f = (n) => (Math.round(n * 10) / 10).toString();

// ---------- geometry ----------
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const mul = (a, k) => [a[0] * k, a[1] * k];
const len = (a) => Math.hypot(a[0], a[1]);
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const norm = (a) => { const l = len(a) || 1; return [a[0] / l, a[1] / l]; };
const perp = (a) => [-a[1], a[0]];

// Cardinal spline through points -> list of cubic segments [p0,c1,c2,p1].
// A point may carry a 3rd element 'c' to make it a sharp corner.
function segments(pts, closed = false, k = 1) {
  const n = pts.length, segs = [];
  const P = (i) => closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))];
  const tan = (i) => {
    const p = P(i);
    if (p[2] === 'c') return [0, 0];
    return mul(sub(P(i + 1), P(i - 1)), k / 6);
  };
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = P(i), p1 = P(i + 1);
    segs.push([p0, add(p0, tan(i)), sub(p1, tan(i + 1)), p1]);
  }
  return segs;
}

function path(pts, closed = false, k = 1) {
  if (pts.length < 2) return '';
  const s = segments(pts, closed, k);
  let d = `M${f(s[0][0][0])},${f(s[0][0][1])}`;
  for (const [, c1, c2, p1] of s) d += `C${f(c1[0])},${f(c1[1])} ${f(c2[0])},${f(c2[1])} ${f(p1[0])},${f(p1[1])}`;
  return d + (closed ? 'Z' : '');
}

function bez(p0, c1, c2, p1, t) {
  const u = 1 - t;
  return [
    u * u * u * p0[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * p1[0],
    u * u * u * p0[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * p1[1],
  ];
}

// Dense polyline sampled from the spline.
function sample(pts, closed = false, step = 2, k = 1) {
  const out = [];
  for (const [p0, c1, c2, p1] of segments(pts, closed, k)) {
    const L = len(sub(p1, p0)) + len(sub(c1, p0)) + len(sub(c2, p1));
    const n = Math.max(2, Math.ceil(L / step));
    for (let i = 0; i < n; i++) out.push(bez(p0, c1, c2, p1, i / n));
  }
  if (!closed) out.push(pts[pts.length - 1].slice(0, 2));
  return out;
}

// Width profile: number, function(t), or array of widths spread evenly over t in [0,1].
function profile(w) {
  if (typeof w === 'function') return w;
  if (typeof w === 'number') return (t) => w * Math.min(1, Math.sin(Math.PI * Math.min(t, 1 - t) * 1.0 + 0.0001) * 3);
  const a = w;
  return (t) => {
    const x = t * (a.length - 1), i = Math.min(a.length - 2, Math.floor(x)), r = x - i;
    const s = r * r * (3 - 2 * r);
    return a[i] + (a[i + 1] - a[i]) * s;
  };
}

// Variable-width stroke as a filled outline (deliberate line weight).
function taper(pts, w, opts = {}) {
  const step = opts.step || 1.5;
  const P = sample(pts, false, step, opts.k || 1);
  if (P.length < 2) return '';
  const W = profile(w);
  // cumulative length for t
  const cum = [0];
  for (let i = 1; i < P.length; i++) cum.push(cum[i - 1] + len(sub(P[i], P[i - 1])));
  const T = cum[cum.length - 1] || 1;
  const L = [], R = [];
  for (let i = 0; i < P.length; i++) {
    const a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)];
    const nn = norm(perp(sub(b, a)));
    const hw = Math.max(0, W(cum[i] / T)) / 2;
    L.push(add(P[i], mul(nn, hw)));
    R.push(sub(P[i], mul(nn, hw)));
  }
  const all = L.concat(R.reverse());
  return 'M' + all.map((p) => f(p[0]) + ',' + f(p[1])).join('L') + 'Z';
}

// ---------- document / defs ----------
class Doc {
  constructor(W, H) { this.W = W; this.H = H; this.defs = []; this.n = 0; this.cache = {}; }
  id(p = 'i') { return p + (this.n++); }
  blur(sd) {
    sd = Math.round(sd * 10) / 10;
    const key = 'b' + sd;
    if (!this.cache[key]) {
      const id = this.id('bl');
      this.defs.push(`<filter id="${id}" filterUnits="userSpaceOnUse" x="-4000" y="-4000" width="10000" height="10000" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="${sd}"/></filter>`);
      this.cache[key] = id;
    }
    return `url(#${this.cache[key]})`;
  }
  lin(x1, y1, x2, y2, stops) {
    const id = this.id('lg');
    this.defs.push(`<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}">${stopsXml(stops)}</linearGradient>`);
    return `url(#${id})`;
  }
  rad(cx, cy, r, stops, fx, fy, extra = '') {
    const id = this.id('rg');
    this.defs.push(`<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fx="${f(fx ?? cx)}" fy="${f(fy ?? cy)}" ${extra}>${stopsXml(stops)}</radialGradient>`);
    return `url(#${id})`;
  }
  clip(d, transform = '') {
    const id = this.id('cp');
    this.defs.push(`<clipPath id="${id}"><path d="${d}" ${transform ? `transform="${transform}"` : ''}/></clipPath>`);
    return `url(#${id})`;
  }
  mask(inner) {
    const id = this.id('mk');
    this.defs.push(`<mask id="${id}" maskUnits="userSpaceOnUse" x="-4000" y="-4000" width="10000" height="10000">${inner}</mask>`);
    return `url(#${id})`;
  }
  raw(def) { this.defs.push(def); }
  grain(freq = 0.85, seed = 3) {
    const key = 'g' + freq + '_' + seed;
    if (!this.cache[key]) {
      const id = this.id('gr');
      this.defs.push(`<filter id="${id}" x="0" y="0" width="100%" height="100%" filterUnits="userSpaceOnUse"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="2" seed="${seed}" result="n"/><feColorMatrix type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  1.6 0 0 0 -0.55"/></filter>`);
      this.cache[key] = id;
    }
    return `url(#${this.cache[key]})`;
  }
  paintTex(freq = 0.012, seed = 8, local = false) {
    const key = 'p' + freq + '_' + seed + (local ? 'L' : '');
    if (!this.cache[key]) {
      const id = this.id('pt');
      this.defs.push(`<filter id="${id}" filterUnits="userSpaceOnUse" ${local ? 'x="-3000" y="-3000" width="6000" height="6000"' : 'x="0" y="0" width="1080" height="1920"'}><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="3" seed="${seed}"/><feColorMatrix type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 1.4 -0.45"/></filter>`);
      this.cache[key] = id;
    }
    return `url(#${this.cache[key]})`;
  }
  svg(body) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.W} ${this.H}" width="${this.W}" height="${this.H}"><defs>${this.defs.join('')}</defs>${body}</svg>`;
  }
}

function stopsXml(stops) {
  return stops.map((s) => {
    const [o, c, a] = s;
    return `<stop offset="${o}" stop-color="${c}"${a !== undefined ? ` stop-opacity="${a}"` : ''}/>`;
  }).join('');
}

// ---------- element helpers ----------
function P(d, fill, extra = '') { return `<path d="${d}" fill="${fill}" ${extra}/>`; }
function G(inner, extra = '') { return `<g ${extra}>${inner}</g>`; }
function op(a) { return `opacity="${a}"`; }

// Shade the side of a shape facing away from a direction: crescent = shape minus shape shifted toward light.
// dir = [dx,dy] shift (pointing toward the light), soft = blur of the edge.
function crescent(doc, d, dir, color, soft = 0, opacity = 1, extra = '') {
  const m = doc.mask(
    `<path d="${d}" fill="#fff"/>` +
    `<path d="${d}" fill="#000" transform="translate(${f(dir[0])},${f(dir[1])})" ${soft ? `filter="${doc.blur(soft)}"` : ''}/>`
  );
  return `<path d="${d}" fill="${color}" mask="${m}" opacity="${opacity}" ${extra}/>`;
}

// Fill everything inside clip shape d with given inner content.
function inside(doc, d, inner, transform = '') {
  return `<g clip-path="${doc.clip(d, transform)}">${inner}</g>`;
}

function soft(doc, d, fill, blur, opacity = 1, extra = '') {
  return `<path d="${d}" fill="${fill}" ${blur ? `filter="${doc.blur(blur)}"` : ''} opacity="${opacity}" ${extra}/>`;
}

function ellipse(cx, cy, rx, ry, rot = 0) {
  const pts = [];
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const x = Math.cos(a) * rx, y = Math.sin(a) * ry;
    const c = Math.cos(rot), s = Math.sin(rot);
    pts.push([cx + x * c - y * s, cy + x * s + y * c]);
  }
  return path(pts, true);
}

// colour utils
function hex2rgb(h) { h = h.replace('#', ''); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); }
function rgb2hex(r) { return '#' + r.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join(''); }
function mix(a, b, t) { const A = hex2rgb(a), B = hex2rgb(b); return rgb2hex(A.map((v, i) => v + (B[i] - v) * t)); }

module.exports = { f, add, sub, mul, len, lerp, norm, perp, segments, path, sample, taper, profile, Doc, P, G, op, crescent, inside, soft, ellipse, mix, hex2rgb, rgb2hex };

// Post-warp an SVG fragment's geometry: fn([x,y]) -> [x,y]. Handles absolute M/L/C/Q/Z paths and cx/cy, x1/y1/x2/y2.
function warpSvg(svg, fn) {
  const num = '(-?\\d+(?:\\.\\d+)?)';
  svg = svg.replace(/ d="([^"]*)"/g, (m, d) => {
    const out = d.replace(new RegExp(num + ',' + num, 'g'), (mm, x, y) => { const p = fn([+x, +y]); return f(p[0]) + ',' + f(p[1]); });
    return ` d="${out}"`;
  });
  svg = svg.replace(new RegExp('cx="' + num + '" cy="' + num + '"', 'g'), (m, x, y) => { const p = fn([+x, +y]); return `cx="${f(p[0])}" cy="${f(p[1])}"`; });
  svg = svg.replace(new RegExp('x1="' + num + '" y1="' + num + '" x2="' + num + '" y2="' + num + '"', 'g'), (m, a, b, c, d) => { const p = fn([+a, +b]), q = fn([+c, +d]); return `x1="${f(p[0])}" y1="${f(p[1])}" x2="${f(q[0])}" y2="${f(q[1])}"`; });
  return svg;
}
// Smooth compression of x below x0 by factor k (narrows the side plane of a 3/4 head).
function compressX(x0, k, soft = 80) {
  return ([x, y]) => {
    if (x >= x0 + soft) return [x, y];
    if (x <= x0 - soft) return [x0 + (x - x0) * k - soft * (1 - k) * 0.0, y];
    const t = (x - (x0 - soft)) / (2 * soft), s = t * t * (3 - 2 * t);
    const a = x0 + (x - x0) * k, b = x;
    return [a + (b - a) * s, y];
  };
}
module.exports.warpSvg = warpSvg;
module.exports.compressX = compressX;
