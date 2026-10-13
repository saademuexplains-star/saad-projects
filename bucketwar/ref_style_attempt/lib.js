// lib.js — math, easing, colour and drawing helpers for the War of the Bucket short.
// Look target: the "four dumbest wars" reference — flat cartoon puppets with ink outlines on the faces,
// soft gradient shading, paper grain, bold yellow numbering / captions.
'use strict';
const W = 1080, H = 1920;
const INK = '#1c1412';

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const lerp = (a, b, p) => a + (b - a) * p;
const easeOut = p => 1 - Math.pow(1 - p, 3);
const easeIn = p => p * p * p;
const easeInOut = p => (p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const backOut = (p, c = 1.8) => 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2);
const pop = (t, t0, d = .2) => backOut(seg(t, t0, t0 + d));
const bell = (t, a, b) => Math.sin(seg(t, a, b) * Math.PI);
const decay = (t, t0, tau) => (t < t0 ? 0 : Math.exp(-(t - t0) / tau));
const wob = (t, f, a, ph = 0) => Math.sin(t * f * 2 * Math.PI + ph) * a;
const srand = seed => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const deg = d => d * Math.PI / 180;

// ---------- colour ----------
function hex(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); }
const toHex = c => '#' + c.map(v => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('');
const mix = (a, b, p) => { const A = hex(a), B = hex(b); return toHex(A.map((v, i) => lerp(v, B[i], p))); };
const lighten = (c, p) => mix(c, '#ffffff', p);
const darken = (c, p) => mix(c, '#000000', p);
const rgba = (c, a) => { const [r, g, b] = hex(c); return `rgba(${r},${g},${b},${a})`; };

// ---------- gradients (local coordinates) ----------
function vgrad(ctx, y0, y1, stops) { const g = ctx.createLinearGradient(0, y0, 0, y1); stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c)); return g; }
function hgrad(ctx, x0, x1, stops) { const g = ctx.createLinearGradient(x0, 0, x1, 0); stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c)); return g; }
function lgrad(ctx, x0, y0, x1, y1, stops) { const g = ctx.createLinearGradient(x0, y0, x1, y1); stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c)); return g; }
function rgrad(ctx, x, y, r, stops, x2 = x, y2 = y, r2 = 0) { const g = ctx.createRadialGradient(x2, y2, r2, x, y, r); stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c)); return g; }

// ---------- the shaded, outlined piece ----------
// d: SVG path string or Path2D.  Dark rim toward the lower right, light rim toward the upper left, ink outline.
const _p2d = new Map();
const P2 = d => (typeof d !== 'string' ? d : (_p2d.get(d) || (_p2d.set(d, new Path2D(d)), _p2d.get(d))));
function piece(ctx, d, o = {}) {
  const p = P2(d);
  const { fill = '#888', lw = 4, ink = INK, shade = .32, hi = .28, sw = 30, k = 9 } = o;
  ctx.save();
  ctx.fillStyle = fill; ctx.fill(p);
  if (shade > 0 || hi > 0) {
    ctx.save(); ctx.clip(p); ctx.lineJoin = 'round';
    if (shade > 0) {
      ctx.save(); ctx.translate(-k * .5, -k * .5); ctx.filter = `blur(${sw * .5}px)`;
      ctx.strokeStyle = `rgba(30,10,24,${shade})`; ctx.lineWidth = sw; ctx.stroke(p); ctx.restore();
    }
    if (hi > 0) {
      ctx.save(); ctx.translate(k, k); ctx.filter = `blur(${sw * .4}px)`;
      ctx.strokeStyle = `rgba(255,250,235,${hi})`; ctx.lineWidth = sw * .8; ctx.stroke(p); ctx.restore();
    }
    ctx.restore();
  }
  if (lw > 0) { ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.strokeStyle = ink; ctx.lineWidth = lw; ctx.stroke(p); }
  ctx.restore();
}
// flat piece: fill + outline only (cheap — used for crowds and small details)
function flat(ctx, d, fill, lw = 3, ink = INK) {
  const p = P2(d); ctx.save(); ctx.fillStyle = fill; ctx.fill(p);
  if (lw > 0) { ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.strokeStyle = ink; ctx.lineWidth = lw; ctx.stroke(p); } ctx.restore();
}
function ell(ctx, x, y, rx, ry, fill, lw = 0, ink = INK, rot = 0) {
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill();
  if (lw) { ctx.strokeStyle = ink; ctx.lineWidth = lw; ctx.stroke(); }
}
function rrect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2); const p = new Path2D();
  p.moveTo(x + r, y); p.arcTo(x + w, y, x + w, y + h, r); p.arcTo(x + w, y + h, x, y + h, r); p.arcTo(x, y + h, x, y, r); p.arcTo(x, y, x + w, y, r); p.closePath(); return p;
}
function line(ctx, pts, color, lw, cap = 'round') {
  ctx.save(); ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = cap; ctx.lineJoin = 'round'; ctx.stroke(); ctx.restore();
}
function soft(ctx, px, fn) { ctx.save(); ctx.filter = `blur(${px}px)`; fn(); ctx.restore(); }
function shadowEll(ctx, x, y, rx, ry, a = .32) { soft(ctx, 14, () => ell(ctx, x, y, rx, ry, `rgba(10,5,15,${a})`)); }

// ---------- text ----------
function text(ctx, s, x, y, { font = '800 100px Poppins', fill = '#fff', stroke = INK, lw = 10, align = 'center', base = 'middle', shadow = true, rot = 0, scale = 1, sy = 1, alpha = 1, spacing = 0 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(scale, scale * sy);
  ctx.font = font; ctx.textAlign = align; ctx.textBaseline = base; ctx.lineJoin = 'round'; ctx.miterLimit = 2; ctx.globalAlpha = alpha;
  if ('letterSpacing' in ctx) ctx.letterSpacing = spacing + 'px';
  if (shadow) { ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 6; ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.strokeText(s, 0, 0); ctx.restore(); }
  if (lw) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.strokeText(s, 0, 0); }
  ctx.fillStyle = fill; ctx.fillText(s, 0, 0);
  ctx.restore();
}

// ---------- paper grain (static overlay) ----------
let _grain = null;
function grainCanvas() {
  if (_grain) return _grain;
  const c = document.createElement('canvas'); c.width = 540; c.height = 960; const g = c.getContext('2d');
  const id = g.createImageData(540, 960), r = srand(7);
  for (let i = 0; i < id.data.length; i += 4) { const v = 128 + (r() - .5) * 150; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
  g.putImageData(id, 0, 0); _grain = c; return c;
}
function grain(ctx, a = .16) {
  ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = a; ctx.drawImage(grainCanvas(), 0, 0, W, H); ctx.restore();
}
function vignette(ctx, a = .38) {
  ctx.save(); const g = ctx.createRadialGradient(W / 2, H * .45, H * .3, W / 2, H * .45, H * .75);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(10,5,20,${a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
}
