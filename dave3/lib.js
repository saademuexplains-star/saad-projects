// ---------- core helpers ----------
const W = 1080, H = 1920;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const TAU = Math.PI * 2;
const E = {
  lin: t => t,
  in: t => t * t * t,
  out: t => 1 - Math.pow(1 - t, 3),
  out5: t => 1 - Math.pow(1 - t, 5),
  inOut: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  sine: t => -(Math.cos(Math.PI * t) - 1) / 2,
  outBack: (t, s = 1.9) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2),
  inBack: (t, s = 1.7) => (s + 1) * t * t * t - s * t * t,
};
// damped spring 0 -> 1 (overshoots)
const spring = (t, f = 3, z = .35) => t <= 0 ? 0 : 1 - Math.exp(-z * TAU * f * t) * Math.cos(TAU * f * Math.sqrt(1 - z * z) * t);
// impulse wobble 0 -> +/- -> 0
const wob = (t, f = 4, d = 6) => t <= 0 ? 0 : Math.exp(-d * t) * Math.sin(TAU * f * t);
// keyframes: kf(t, [[t0,v0],[t1,v1,ease],...]) ease applies on the way INTO that key
function kf(t, keys) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1, e] = keys[i], [t0, v0] = keys[i - 1];
    if (t <= t1) { const u = (E[e || 'inOut'] || e)((t - t0) / (t1 - t0)); return lerp(v0, v1, u); }
  }
  return keys[keys.length - 1][1];
}
function hash(n) { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
function noise(x, seed = 0) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i + seed * 71.3), hash(i + 1 + seed * 71.3), u) * 2 - 1; }
function rng(seed) { let s = seed * 9301 + 49297; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }

// ---------- assets ----------
const IMG = {};
const MANIFEST = {
  body: 'assets/body.png', legU: 'assets/legU.png', legL: 'assets/legL.png',
  clawR_hand: 'assets/clawR_hand.png', clawR_dac: 'assets/clawR_dac.png',
  clawL_hand: 'assets/clawL_hand.png', clawL_dac: 'assets/clawL_dac.png',
  barb: 'assets/larva_side2.png', bonnet: 'assets/bonnet.png',
  bg_pool: 'src/Rocky_beach_tide_pool.jpg', bg_pool2: 'src/Rocky_beach_tide_pool_2.jpg',
  bg_waves: 'src/Waves_washing_over_wet_sand.jpg', bg_pebbles: 'src/Wet_sand_and_pebbles.jpg',
  bg_under: 'src/Shallow_underwater_sea_floor.jpg', bg_pink: 'src/Soft_pink_abstract_bokeh_background_2.jpg',
  bg_macro: 'src/Crab_leg_surface_macro.jpg',
};
async function loadImg(src) {
  const r = await fetch(src); const b = await r.blob(); return await createImageBitmap(b);
}
async function loadAll() {
  await Promise.all(Object.entries(MANIFEST).map(async ([k, v]) => { IMG[k] = await loadImg(v); }));
  await document.fonts.load('800 82px Montserrat'); await document.fonts.load('900 60px Montserrat'); await document.fonts.load('700 40px Montserrat');
}
const TIDE = new Map();
async function ensureTide(idxs) {
  await Promise.all(idxs.map(async i => {
    if (TIDE.has(i)) return;
    TIDE.set(i, await loadImg(`assets/tide/${String(i).padStart(4, '0')}.jpg`));
  }));
  if (TIDE.size > 90) for (const k of [...TIDE.keys()].slice(0, TIDE.size - 90)) TIDE.delete(k);
}
const tideIdx = t => 1 + (Math.floor(t * 24) % 192 + 192) % 192;

// ---------- drawing primitives ----------
// draw image with anchor (ax,ay in image px) at (x,y)
function img(ctx, im, x, y, ax, ay, s = 1, rot = 0, sx = 1, sy = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s * sx, s * sy);
  ctx.drawImage(im, -ax, -ay); ctx.restore();
}
// background in screen space with parallax relative to camera
function bgLayer(ctx, im, cam, o = {}) {
  const p = o.p ?? 1, s = o.s ?? 1.1;
  let cs = Math.max(W / im.width, H / im.height) * s;
  const z = 1 + (cam.z - 1) * p, r = (cam.r || 0) * p;
  const tx = -(cam.x - 540) * p + (o.ox || 0), ty = -(cam.y - 960) * p + (o.oy || 0);
  // auto-cover: never show an edge, whatever the camera does
  const c = Math.cos(-r), sn = Math.sin(-r);
  for (const [X, Y] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    const ux = X * (540 + Math.abs(cam.sx || 0) + 4), uy = Y * (960 + Math.abs(cam.sy || 0) + 4);
    const qx = (ux * c - uy * sn) / z - tx, qy = (ux * sn + uy * c) / z - ty;
    cs = Math.max(cs, 2 * Math.abs(qx) / im.width, 2 * Math.abs(qy) / im.height);
  }
  ctx.save();
  if (o.filter) ctx.filter = o.filter;
  ctx.translate(W / 2 + (cam.sx || 0), H / 2 + (cam.sy || 0)); ctx.rotate(r); ctx.scale(z, z);
  ctx.translate(tx, ty);
  ctx.drawImage(im, -im.width * cs / 2, -im.height * cs / 2, im.width * cs, im.height * cs);
  ctx.restore();
}
// image coords (u,v px) -> world coords for a bgLayer drawn with p=1
function bgPt(im, o, u, v) {
  const s = o.s ?? 1.1, cs = Math.max(W / im.width, H / im.height) * s;
  return [540 + (o.ox || 0) + (u - im.width / 2) * cs, 960 + (o.oy || 0) + (v - im.height / 2) * cs];
}
function applyCam(ctx, cam) {
  ctx.translate(W / 2 + (cam.sx || 0), H / 2 + (cam.sy || 0)); ctx.rotate(cam.r || 0); ctx.scale(cam.z, cam.z); ctx.translate(-cam.x, -cam.y);
}
function shake(t, amp, freq = 18, seed = 1) { return [noise(t * freq, seed) * amp, noise(t * freq, seed + 9) * amp]; }
function vignette(ctx, a = .35) {
  const g = ctx.createRadialGradient(540, 960, 500, 540, 960, 1250);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${a})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
function flash(ctx, a, col = '255,255,255') { if (a <= 0) return; ctx.fillStyle = `rgba(${col},${a})`; ctx.fillRect(0, 0, W, H); }
function shadowEllipse(ctx, x, y, rx, ry, a = .35) {
  ctx.save(); ctx.translate(x, y); ctx.scale(1, ry / rx);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
  g.addColorStop(0, `rgba(10,8,5,${a})`); g.addColorStop(.6, `rgba(10,8,5,${a * .55})`); g.addColorStop(1, 'rgba(10,8,5,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, rx, 0, TAU); ctx.fill(); ctx.restore();
}

// ---------- cartoon eye ----------
// o: lx,ly look (-1..1); top (0 open..1 closed); tilt (+ = angry inner-down for right eye); bot; lid color; side ('L'|'R'); heart; lashes; happy (closed arc); pupil
function eye(ctx, x, y, r, o = {}) {
  const side = o.side === 'L' ? -1 : 1;
  ctx.save(); ctx.translate(x, y);
  if (o.squash) ctx.scale(1 + o.squash * .25, 1 - o.squash * .25);
  // outer grey ring
  ctx.beginPath(); ctx.arc(0, 0, r * 1.2, 0, TAU); ctx.fillStyle = '#c9cdd2'; ctx.fill();
  ctx.lineWidth = r * .07; ctx.strokeStyle = '#111'; ctx.stroke();
  if (o.happy) {
    ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fillStyle = o.lid || '#5d6b30'; ctx.fill();
    ctx.lineWidth = r * .16; ctx.strokeStyle = '#111'; ctx.stroke();
    ctx.beginPath(); ctx.arc(0, r * .35, r * .55, Math.PI * 1.15, Math.PI * 1.85); ctx.lineWidth = r * .16; ctx.lineCap = 'round'; ctx.stroke();
    ctx.restore(); return;
  }
  // white ball
  ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fillStyle = '#fff'; ctx.fill();
  ctx.save(); ctx.clip();
  // pupil
  const px = (o.lx || 0) * r * .5, py = (o.ly || 0) * r * .5;
  if (o.heart) {
    heartShape(ctx, px, py + r * .05, r * (.62 + (o.heartPulse || 0) * .12), '#ff2d6f', r * .1);
  } else {
    const pr = r * (o.pupil || .26);
    ctx.beginPath(); ctx.arc(px, py, pr, 0, TAU); ctx.fillStyle = '#111'; ctx.fill();
    ctx.beginPath(); ctx.arc(px - pr * .35, py - pr * .35, pr * .3, 0, TAU); ctx.fillStyle = '#fff'; ctx.fill();
  }
  // lids
  const top = clamp(o.top ?? .12, 0, 1), tilt = (o.tilt || 0) * side, bot = clamp(o.bot ?? 0, 0, 1);
  ctx.fillStyle = o.lid || '#5d6b30'; ctx.strokeStyle = '#111'; ctx.lineWidth = r * .13;
  if (top > 0.001) {
    const yL = -r + top * 2 * r;
    ctx.save(); ctx.rotate(tilt);
    ctx.beginPath(); ctx.moveTo(-r * 1.6, -r * 1.6); ctx.lineTo(r * 1.6, -r * 1.6); ctx.lineTo(r * 1.6, yL); ctx.quadraticCurveTo(0, yL + r * .18, -r * 1.6, yL); ctx.closePath();
    ctx.fill(); ctx.beginPath(); ctx.moveTo(r * 1.6, yL); ctx.quadraticCurveTo(0, yL + r * .18, -r * 1.6, yL); ctx.stroke(); ctx.restore();
  }
  if (bot > 0.001) {
    const yB = r - bot * 2 * r;
    ctx.beginPath(); ctx.moveTo(-r * 1.6, r * 1.6); ctx.lineTo(r * 1.6, r * 1.6); ctx.lineTo(r * 1.6, yB); ctx.quadraticCurveTo(0, yB - r * .15, -r * 1.6, yB); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(r * 1.6, yB); ctx.quadraticCurveTo(0, yB - r * .15, -r * 1.6, yB); ctx.stroke();
  }
  ctx.restore();
  ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.lineWidth = r * .16; ctx.strokeStyle = '#111'; ctx.stroke();
  if (o.lashes) {
    ctx.lineCap = 'round'; ctx.lineWidth = r * .12; ctx.strokeStyle = '#111';
    for (let i = 0; i < 3; i++) {
      const a = -Math.PI / 2 + side * (.55 + i * .32);
      const l = r * (.42 + (o.lashes - 1) * .2);
      ctx.beginPath(); ctx.moveTo(Math.cos(a) * r * 1.18, Math.sin(a) * r * 1.18); ctx.lineTo(Math.cos(a) * (r * 1.18 + l), Math.sin(a) * (r * 1.18 + l)); ctx.stroke();
    }
  }
  ctx.restore();
}
function heartShape(ctx, x, y, s, fill, lw = 0) {
  ctx.save(); ctx.translate(x, y); ctx.beginPath();
  ctx.moveTo(0, s * .35);
  ctx.bezierCurveTo(-s * .1, s * .2, -s * .55, -s * .05, -s * .5, -s * .3);
  ctx.bezierCurveTo(-s * .45, -s * .6, -s * .05, -s * .6, 0, -s * .3);
  ctx.bezierCurveTo(s * .05, -s * .6, s * .45, -s * .6, s * .5, -s * .3);
  ctx.bezierCurveTo(s * .55, -s * .05, s * .1, s * .2, 0, s * .35);
  ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
  if (lw) { ctx.lineWidth = lw; ctx.strokeStyle = '#111'; ctx.lineJoin = 'round'; ctx.stroke(); }
  ctx.restore();
}
// ---------- cartoon mouths ----------
function mouth(ctx, x, y, w, type, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = '#111'; ctx.lineWidth = w * .14;
  const open = o.open ?? 1;
  if (type === 'smile') { ctx.beginPath(); ctx.arc(0, -w * .35, w * .55, Math.PI * .2, Math.PI * .8); ctx.stroke(); }
  else if (type === 'flat') { ctx.beginPath(); ctx.moveTo(-w * .4, 0); ctx.lineTo(w * .4, 0); ctx.stroke(); }
  else if (type === 'frown') { ctx.beginPath(); ctx.arc(0, w * .45, w * .5, Math.PI * 1.22, Math.PI * 1.78); ctx.stroke(); }
  else if (type === 'wavy') { ctx.beginPath(); for (let i = 0; i <= 16; i++) { const u = i / 16; const xx = (u - .5) * w; const yy = Math.sin(u * TAU * 2) * w * .09; i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke(); }
  else if (type === 'o' || type === 'whistle') {
    const rw = type === 'o' ? w * .28 : w * .14, rh = (type === 'o' ? w * .38 : w * .16) * open;
    ctx.beginPath(); ctx.ellipse(0, 0, rw, Math.max(rh, 2), 0, 0, TAU); ctx.fillStyle = '#4a0c12'; ctx.fill(); ctx.stroke();
  } else if (type === 'grin') {
    const h = Math.max(w * .36 * open, 3);
    const D = new Path2D(); D.moveTo(-w * .5, 0); D.quadraticCurveTo(0, w * .06, w * .5, 0); D.bezierCurveTo(w * .48, h * 1.3, -w * .48, h * 1.3, -w * .5, 0); D.closePath();
    ctx.fillStyle = '#4a0c12'; ctx.fill(D);
    ctx.save(); ctx.clip(D); ctx.beginPath(); ctx.ellipse(0, h * 1.15, w * .3, h * .5, 0, 0, TAU); ctx.fillStyle = '#ff6f8a'; ctx.fill(); ctx.restore();
    ctx.stroke(D);
  }
  ctx.restore();
}
// ---------- props / fx ----------
function rrect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function nameTag(ctx, x, y, s, rot, name) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  const w = 360, h = 230;
  ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 8;
  rrect(ctx, -w / 2, -h / 2, w, h, 26); ctx.fillStyle = '#e8262e'; ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = 10; ctx.strokeStyle = '#111'; ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = '900 62px Montserrat'; ctx.fillText('HELLO', 0, -h / 2 + 48);
  ctx.font = '700 22px Montserrat'; ctx.fillText('MY NAME IS', 0, -h / 2 + 88);
  rrect(ctx, -w / 2 + 18, -h / 2 + 106, w - 36, h - 124, 10); ctx.fillStyle = '#fff'; ctx.fill();
  ctx.fillStyle = '#111'; let fs = 74; ctx.font = `900 ${fs}px Montserrat`;
  while (ctx.measureText(name).width > w - 70) { fs -= 4; ctx.font = `900 ${fs}px Montserrat`; }
  ctx.fillText(name, 0, -h / 2 + 106 + (h - 124) / 2 + 4);
  ctx.restore();
}
function note(ctx, x, y, s, rot, a = 1, dbl = false) {
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  const p = new Path2D();
  p.ellipse(0, 0, 22, 16, -.4, 0, TAU);
  if (dbl) { p.ellipse(60, -12, 22, 16, -.4, 0, TAU); p.rect(14, -88, 9, 86); p.rect(74, -100, 9, 86); p.moveTo(14, -88); p.lineTo(83, -100); p.lineTo(83, -78); p.lineTo(14, -66); p.closePath(); }
  else { p.rect(14, -92, 9, 90); p.moveTo(23, -92); p.bezierCurveTo(50, -80, 58, -60, 44, -36); p.bezierCurveTo(48, -58, 40, -66, 23, -70); p.closePath(); }
  ctx.lineJoin = 'round'; ctx.lineWidth = 14; ctx.strokeStyle = '#fff'; ctx.stroke(p); ctx.fillStyle = '#111'; ctx.fill(p);
  ctx.restore();
}
function sparkle(ctx, x, y, s, rot = 0, a = 1, col = '#fff') {
  if (s <= 0 || a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(rot);
  ctx.beginPath();
  for (let i = 0; i < 8; i++) { const r = i % 2 ? s * .22 : s; const an = i * Math.PI / 4; ctx.lineTo(Math.cos(an) * r, Math.sin(an) * r); }
  ctx.closePath(); ctx.fillStyle = col; ctx.shadowColor = 'rgba(255,255,255,.9)'; ctx.shadowBlur = s * .8; ctx.fill();
  ctx.restore();
}
function burst(ctx, x, y, s, rot = 0, a = 1, fill = '#fff6c8', spikes = 12) {
  if (s <= 0 || a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(rot); ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) { const r = i % 2 ? s * .55 : s * (0.9 + .1 * hash(i)); const an = i * Math.PI / spikes; ctx.lineTo(Math.cos(an) * r, Math.sin(an) * r); }
  ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); ctx.lineJoin = 'round'; ctx.lineWidth = s * .07; ctx.strokeStyle = '#111'; ctx.stroke();
  ctx.restore();
}
function puff(ctx, x, y, t, o = {}) { // dust/sand puff, t = seconds since impact
  const n = o.n || 9, R = o.r || 60, life = o.life || .7, col = o.col || '205,180,140';
  if (t < 0 || t > life) return;
  const rnd = rng(o.seed || 3);
  for (let i = 0; i < n; i++) {
    const a = (o.a0 ?? Math.PI) + (o.spread ?? Math.PI) * (i / (n - 1)) + (rnd() - .5) * .3;
    const sp = (o.speed || 260) * (.6 + rnd() * .6), u = t / life;
    const d = sp * (1 - Math.exp(-4 * t)) / 4 * 4;
    const px = x + Math.cos(a) * d, py = y + Math.sin(a) * d * (o.flat ?? .45) - (o.rise || 40) * u;
    const r = R * (.5 + rnd() * .6) * (.6 + u);
    const g = ctx.createRadialGradient(px, py, 0, px, py, r);
    const al = (1 - u) * (o.alpha || .55);
    g.addColorStop(0, `rgba(${col},${al})`); g.addColorStop(1, `rgba(${col},0)`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, r, 0, TAU); ctx.fill();
  }
}
function bubble(ctx, x, y, r, a = 1) {
  ctx.save(); ctx.globalAlpha *= a;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = Math.max(1.5, r * .12); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fill();
  ctx.beginPath(); ctx.arc(x - r * .35, y - r * .35, r * .25, 0, TAU); ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fill();
  ctx.restore();
}
function sweat(ctx, x, y, s, a = 1) {
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(0, -40); ctx.bezierCurveTo(10, -18, 26, 0, 26, 16); ctx.arc(0, 16, 26, 0, Math.PI); ctx.bezierCurveTo(-26, 0, -10, -18, 0, -40); ctx.closePath();
  ctx.fillStyle = '#7fd3ff'; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = '#111'; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(-9, 12, 6, 10, -.4, 0, TAU); ctx.fillStyle = '#fff'; ctx.fill();
  ctx.restore();
}
function arrow(ctx, x0, y0, x1, y1, w = 16, col = '#ffe14a', a = 1) {
  ctx.save(); ctx.globalAlpha *= a;
  const an = Math.atan2(y1 - y0, x1 - x0), L = Math.hypot(x1 - x0, y1 - y0);
  ctx.translate(x0, y0); ctx.rotate(an);
  ctx.beginPath(); ctx.moveTo(0, -w / 2); ctx.lineTo(L - w * 2.2, -w / 2); ctx.lineTo(L - w * 2.2, -w * 1.5); ctx.lineTo(L, 0); ctx.lineTo(L - w * 2.2, w * 1.5); ctx.lineTo(L - w * 2.2, w / 2); ctx.lineTo(0, w / 2); ctx.closePath();
  ctx.fillStyle = col; ctx.fill(); ctx.lineJoin = 'round'; ctx.lineWidth = w * .45; ctx.strokeStyle = '#111'; ctx.stroke(); ctx.fill();
  ctx.restore();
}
function bow(ctx, x, y, s, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.lineJoin = 'round'; ctx.lineWidth = 9; ctx.strokeStyle = '#111';
  for (const d of [-1, 1]) {
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(d * 40, -60, d * 95, -50, d * 92, 0); ctx.bezierCurveTo(d * 95, 50, d * 40, 60, 0, 0); ctx.closePath();
    ctx.fillStyle = '#ff5fa2'; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(d * 18, -10); ctx.quadraticCurveTo(d * 55, -28, d * 72, -8); ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 6; ctx.stroke(); ctx.strokeStyle = '#111'; ctx.lineWidth = 9;
  }
  ctx.beginPath(); ctx.ellipse(0, 0, 20, 26, 0, 0, TAU); ctx.fillStyle = '#ff3d8b'; ctx.fill(); ctx.stroke();
  ctx.restore();
}
function godrays(ctx, t, a = .22) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 7; i++) {
    const x = 80 + i * 170 + noise(t * .3, i) * 60, w = 70 + hash(i) * 120, al = a * (.5 + .5 * Math.sin(t * 1.3 + i * 1.7));
    const g = ctx.createLinearGradient(0, -100, 0, 1700); g.addColorStop(0, `rgba(220,255,250,${al})`); g.addColorStop(1, 'rgba(220,255,250,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x, -100); ctx.lineTo(x + w, -100); ctx.lineTo(x + w * 2.4 + 300, 1800); ctx.lineTo(x + 300, 1800); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}
function snow(ctx, t, n = 70, seed = 5, a = .7) {
  const r = rng(seed); ctx.save();
  for (let i = 0; i < n; i++) {
    const x0 = r() * W, y0 = r() * H, sp = 20 + r() * 50, sz = 1.5 + r() * 4;
    const x = (x0 + noise(t * .5, i) * 40 + W) % W, y = ((y0 - t * sp) % H + H) % H;
    ctx.globalAlpha = a * (.4 + r() * .6); ctx.fillStyle = '#e8fffb'; ctx.beginPath(); ctx.arc(x, y, sz, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

// ---------- DAVE rig (body-space px; body.png is 905x460) ----------
const RIG = {
  ground: 560,      // body-space y of the ground contact line
  cx: 452,
  legs: [            // viewer-right side, front -> rear; mirrored for left
    { bx: 700, by: 400, rot: .50, s: .66, ph: 0 },
    { bx: 735, by: 360, rot: .20, s: .70, ph: 1 },
    { bx: 750, by: 322, rot: .02, s: .64, ph: 0 },
    { bx: 742, by: 290, rot: -.16, s: .56, ph: 1 },
  ],
  legPivot: [45, 300], knee: [420, 45],
  clawR: { hand: 'clawR_hand', dac: 'clawR_dac', px: 835, py: 300, bx: 845, by: 470, rot: -.34, s: .52, dp: [250, 150], open: -.3 },
  clawL: { hand: 'clawL_hand', dac: 'clawL_dac', px: 40, py: 375, bx: 60, by: 470, rot: .34, s: .52, dp: [640, 140], open: .3 },
  eyes: [[310, 250], [595, 250]], eyeR: 86, mouth: [452, 385],
};
// o: x,y ground point; s; rot; sx,sy (squash about ground); hop (px up); walk (phase, cycles); walkAmt; dir (+1 right);
// clawUp:[L,R] rad, clawOpen:[L,R] 0..1; eye:{...shared}, eyeL/eyeR overrides; mouth:{type,open,w}; bonnet:0..1; tag:0..1; lashes; blush
function dave(ctx, o) {
  const s = o.s ?? .5;
  const walk = (o.walk || 0) * TAU, wa = o.walkAmt ?? 0;
  const bob = -Math.abs(Math.sin(walk)) * 14 * wa;
  ctx.save();
  ctx.translate(o.x, o.y);
  // contact shadow (stays on ground)
  if (o.shadow !== false) {
    const hop = o.hop || 0, k = clamp(1 - hop / 900, .3, 1);
    shadowEllipse(ctx, 0, 6, 560 * s * k * (o.sx || 1), 90 * s * k, (o.shadowA ?? .42) * k);
  }
  ctx.translate(0, -(o.hop || 0));
  ctx.rotate(o.rot || 0);
  ctx.scale(s * (o.sx || 1), s * (o.sy || 1));
  ctx.translate(-RIG.cx, -RIG.ground);
  if (o.filter) ctx.filter = o.filter;
  // bonnet behind everything
  if (o.bonnet) {
    const b = o.bonnet, bi = IMG.bonnet;
    ctx.save(); ctx.globalAlpha = clamp(b * 3);
    img(ctx, bi, 452, 250 - (1 - b) * 900, bi.width / 2, bi.height * .47, 1.72, (o.bonnetRot || 0));
    ctx.restore();
  }
  const roll = Math.sin(walk) * .03 * wa + (o.roll || 0);
  // legs: rear first; both sides
  const splay = o.splay || 0;
  for (let li = RIG.legs.length - 1; li >= 0; li--) {
    for (const side of [-1, 1]) {
      const L = RIG.legs[li];
      const phase = walk + (L.ph + (side < 0 ? 1 : 0)) * Math.PI;
      const sw = Math.sin(phase), lift = Math.max(0, sw);
      // leading side (dir) reaches, trailing pushes
      const rot = L.rot - lift * .34 * wa + Math.cos(phase) * .12 * wa * side * (o.dir || 1) + splay * .25 + (o.legRot || 0);
      const knee = -lift * .5 * wa + splay * .35 + (o.knee || 0);
      ctx.save();
      ctx.translate(RIG.cx, RIG.ground + bob); ctx.rotate(roll); ctx.translate(-RIG.cx, -RIG.ground);
      const bx = side > 0 ? L.bx : 905 - L.bx;
      ctx.translate(bx, L.by);
      if (side < 0) ctx.scale(-1, 1);
      ctx.rotate(rot); ctx.scale(L.s, L.s); ctx.translate(-RIG.legPivot[0], -RIG.legPivot[1]);
      if (li >= 2) ctx.filter = (o.filter ? o.filter + ' ' : '') + 'brightness(0.78)';
      ctx.save(); ctx.translate(RIG.knee[0], RIG.knee[1]); ctx.rotate(knee); ctx.translate(-RIG.knee[0], -RIG.knee[1]); ctx.drawImage(IMG.legL, 0, 0); ctx.restore();
      ctx.drawImage(IMG.legU, 0, 0);
      ctx.restore();
    }
  }
  // body
  ctx.save();
  ctx.translate(RIG.cx, RIG.ground + bob); ctx.rotate(roll); ctx.translate(-RIG.cx, -RIG.ground);
  const breath = 1 + Math.sin((o.t || 0) * 2.4) * .012 * (o.breath ?? 1);
  ctx.translate(452, 460); ctx.scale(1 / breath, breath); ctx.translate(-452, -460);
  const clawsBehind = o.clawUp && Math.max(o.clawUp[0], o.clawUp[1]) > 1.2;
  if (clawsBehind) drawClaws(ctx, o);
  ctx.drawImage(IMG.body, 0, 0);
  if (!clawsBehind) drawClaws(ctx, o);
  ctx.filter = 'none';
  // name tag on shell
  if (o.tag) {
    const k = o.tag;
    ctx.save(); ctx.globalAlpha *= clamp(k * 12);
    nameTag(ctx, 640, 110, .9 * (1 + (1 - spring(k, 3, .45)) * 1.4), .14 + wob(k, 3, 5) * .4, o.tagName || 'DAVE');
    ctx.restore();
  }
  // eyes
  const eo = o.eye || {};
  const blink = o.blink || 0;
  for (const [i, sd] of [[0, 'L'], [1, 'R']]) {
    const ov = Object.assign({ side: sd }, eo, (sd === 'L' ? o.eyeL : o.eyeR) || {});
    ov.top = Math.max(ov.top ?? .12, blink);
    if (o.lashes) ov.lashes = o.lashes;
    const [ex, ey] = RIG.eyes[i];
    eye(ctx, ex + (o.eyeDX || 0), ey - (o.eyePop || 0), RIG.eyeR * (o.eyeS || 1), ov);
  }
  if (o.blush) {
    for (const ex of [250, 655]) { const g = ctx.createRadialGradient(ex, 395, 0, ex, 395, 70); g.addColorStop(0, `rgba(255,90,140,${.55 * o.blush})`); g.addColorStop(1, 'rgba(255,90,140,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ex, 395, 70, 0, TAU); ctx.fill(); }
  }
  if (o.mouth) mouth(ctx, RIG.mouth[0], RIG.mouth[1], o.mouth.w || 90, o.mouth.type, o.mouth);
  ctx.restore();
  ctx.restore();
}
function drawClaws(ctx, o) {
  for (const [k, C, idx] of [['L', RIG.clawL, 0], ['R', RIG.clawR, 1]]) {
    const up = (o.clawUp ? o.clawUp[idx] : 0) || 0, op = (o.clawOpen ? o.clawOpen[idx] : 0) || 0;
    const sideSign = k === 'L' ? -1 : 1;
    const lift = clamp((up - 1.2) / .7);   // raised high: arm rises and swings out
    ctx.save(); ctx.translate(C.bx + sideSign * lift * 40, C.by - lift * 300); ctx.rotate(C.rot + up * sideSign); ctx.scale(C.s * (1 + lift * .12), C.s * (1 + lift * .12)); ctx.translate(-C.px, -C.py);
    ctx.drawImage(IMG[C.hand], 0, 0);
    ctx.translate(C.dp[0], C.dp[1]); ctx.rotate(C.open * op); ctx.translate(-C.dp[0], -C.dp[1]);
    ctx.drawImage(IMG[C.dac], 0, 0);
    ctx.restore();
  }
}
// body-space point -> world (ignores bob/roll) for attaching fx
function davePt(o, bx, by) {
  const s = o.s ?? .5; const c = Math.cos(o.rot || 0), sn = Math.sin(o.rot || 0);
  const x = (bx - RIG.cx) * s * (o.sx || 1), y = (by - RIG.ground) * s * (o.sy || 1);
  return [o.x + x * c - y * sn, o.y - (o.hop || 0) + x * sn + y * c];
}

// ---------- BARBARA (larva_side2.png 895x669, faces right) ----------
const BARB = { cx: 448, cy: 335, eye: [712, 418], eyeR: 74, mouth: [818, 548], bow: [470, 40] };
function barbara(ctx, o) {
  const im = IMG.barb, s = o.s ?? .3;
  ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(o.rot || 0);
  ctx.scale(s * (o.flip ? -1 : 1) * (o.sx || 1), s * (o.sy || 1));
  ctx.globalAlpha *= (o.a ?? 1);
  ctx.translate(-BARB.cx, -BARB.cy);
  // paddling legs: tiny shear wobble on lower half
  ctx.drawImage(im, 0, 0);
  if (o.bow !== false) bow(ctx, BARB.bow[0], BARB.bow[1], 1.15, -.15);
  const ov = Object.assign({ side: 'R', lid: '#c98b2a', top: .1 }, o.eye || {});
  ov.top = Math.max(ov.top, o.blink || 0);
  eye(ctx, BARB.eye[0], BARB.eye[1], BARB.eyeR, Object.assign({ lashes: 1.4 }, ov));
  if (o.mouth) mouth(ctx, BARB.mouth[0], BARB.mouth[1], 80, o.mouth.type, o.mouth);
  if (o.blush) { const g = ctx.createRadialGradient(650, 540, 0, 650, 540, 60); g.addColorStop(0, `rgba(255,80,130,${.6 * o.blush})`); g.addColorStop(1, 'rgba(255,80,130,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(650, 540, 60, 0, TAU); ctx.fill(); }
  ctx.restore();
}

// ---------- captions ----------
function caption(ctx, T) {
  let cur = null;
  for (let i = 0; i < WORDS.length; i++) {
    const [a, b, w] = WORDS[i]; const next = WORDS[i + 1];
    const end = next ? Math.min(next[0], b + .35) : b + .3;
    if (T >= a && T < end) { cur = [a, w]; break; }
  }
  if (!cur) return;
  const k = T - cur[0];
  const sc = 1 + .22 * Math.exp(-k * 22) * Math.cos(k * 30);
  ctx.save(); ctx.translate(540, 306); ctx.scale(sc, sc);
  ctx.font = '800 82px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round'; ctx.lineWidth = 20; ctx.strokeStyle = '#000'; ctx.strokeText(cur[1], 0, 0);
  ctx.fillStyle = '#fff'; ctx.fillText(cur[1], 0, 0);
  ctx.restore();
}
