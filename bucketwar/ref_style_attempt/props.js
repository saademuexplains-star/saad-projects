// props.js — the bucket (hero prop), well, spear, banners, tower, houses, trees, clouds, rays, mini soldiers, fx.
'use strict';

// ---------- the bucket ----------
// origin = centre of the rim; the handle arcs above it.  s scales; rot rotates around the rim centre.
function drawBucket(ctx, { s = 1, rot = 0, glow = 0, handle = true } = {}) {
  ctx.save(); ctx.scale(s, s); ctx.rotate(rot);
  const xl = y => 108 - 26 * (y / 175);
  if (glow > 0) soft(ctx, 40, () => ell(ctx, 0, 90, 190 * (1 + glow * .2), 190 * (1 + glow * .2), `rgba(255,226,120,${.75 * glow})`));
  if (handle) { line(ctx, [[-104, 0]].concat(Array.from({ length: 13 }, (_, i) => { const a = Math.PI - (i / 12) * Math.PI; return [Math.cos(a) * 104, -Math.sin(a) * 150]; })).concat([[104, 0]]), INK, 20);
    line(ctx, [[-104, 0]].concat(Array.from({ length: 13 }, (_, i) => { const a = Math.PI - (i / 12) * Math.PI; return [Math.cos(a) * 104, -Math.sin(a) * 150]; })).concat([[104, 0]]), '#8d96a0', 11);
    line(ctx, Array.from({ length: 6 }, (_, i) => { const a = Math.PI * (.75 - i * .04); return [Math.cos(a) * 100, -Math.sin(a) * 146]; }), 'rgba(255,255,255,.55)', 4); }
  // body
  const body = 'M -108 0 L -82 175 Q 0 205 82 175 L 108 0 Q 0 30 -108 0 Z';
  piece(ctx, body, { fill: hgrad(ctx, -108, 108, ['#e0a862', '#c4893f', '#93602a', '#6e4420']), lw: 5, shade: .36, hi: .3, sw: 36, k: 10 });
  // staves
  ctx.save(); ctx.clip(P2(body)); ctx.strokeStyle = 'rgba(60,30,10,.42)'; ctx.lineWidth = 3;
  for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(i * 27, 8); ctx.quadraticCurveTo(i * 25, 90, i * 21, 205); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(60,30,10,.18)'; ctx.lineWidth = 2; for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(i * 27 + 10, 12); ctx.lineTo(i * 27 + 9, 60); ctx.stroke(); }
  ctx.restore();
  // iron hoops
  for (const y0 of [34, 126]) {
    const a = xl(y0) + 1, b = xl(y0 + 22) + 1;
    piece(ctx, `M ${-a} ${y0} Q 0 ${y0 + 32} ${a} ${y0} L ${b} ${y0 + 22} Q 0 ${y0 + 56} ${-b} ${y0 + 22} Z`, { fill: hgrad(ctx, -a, a, ['#b4bcc6', '#6d7783', '#3f4650']), lw: 4, shade: .3, hi: .45, sw: 14, k: 4 });
  }
  // open rim + dark inside
  ell(ctx, 0, 0, 110, 29, '#d9a258', 5); ell(ctx, 0, 2, 96, 21, '#3e2412', 0);
  soft(ctx, 5, () => ell(ctx, -20, -2, 62, 8, 'rgba(0,0,0,.45)'));
  ctx.beginPath(); ctx.ellipse(0, 0, 110, 29, 0, Math.PI * .08, Math.PI * .92); ctx.strokeStyle = 'rgba(255,240,200,.45)'; ctx.lineWidth = 4; ctx.stroke();
  // ears for the handle
  ell(ctx, -106, -2, 9, 9, '#8d96a0', 3); ell(ctx, 106, -2, 9, 9, '#8d96a0', 3);
  ctx.restore();
}

// ---------- the well ----------
function drawWell(ctx, { s = 1, bucket = true, bucketY = -330, bucketRot = 0, rope = true, ropeSnap = 0, t = 0 } = {}) {
  ctx.save(); ctx.scale(s, s);
  shadowEll(ctx, 20, 6, 290, 36, .3);
  // back posts + beam + roof
  for (const x of [-190, 190]) piece(ctx, `M ${x - 24} -240 L ${x + 24} -240 L ${x + 22} -690 L ${x - 22} -690 Z`, { fill: hgrad(ctx, x - 24, x + 24, ['#b88650', '#8a5c30', '#5f3b1c']), lw: 4.5, shade: .3, sw: 18, k: 6 });
  piece(ctx, 'M -250 -690 L 250 -690 L 250 -640 L -250 -640 Z', { fill: vgrad(ctx, -690, -640, ['#b88650', '#7a4f26']), lw: 4.5, shade: .3, sw: 14, k: 4 });
  // roof (terracotta tiles)
  piece(ctx, 'M -300 -684 L 0 -850 L 300 -684 Z', { fill: lgrad(ctx, -300, -850, 300, -684, ['#e07a52', '#c25a3a', '#8e3a26']), lw: 5, shade: .3, sw: 24, k: 8 });
  ctx.save(); ctx.clip(P2('M -300 -684 L 0 -850 L 300 -684 Z')); ctx.strokeStyle = 'rgba(70,20,10,.4)'; ctx.lineWidth = 3;
  for (let i = -6; i <= 6; i++) { ctx.beginPath(); ctx.moveTo(i * 24, -852); ctx.lineTo(i * 50, -680); ctx.stroke(); }
  for (const y of [-720, -756, -792]) { ctx.beginPath(); ctx.moveTo(-300, y); ctx.lineTo(300, y); ctx.stroke(); } ctx.restore();
  // crank axle
  line(ctx, [[-215, -600], [235, -600]], INK, 24); line(ctx, [[-215, -600], [235, -600]], '#8a5c30', 15);
  line(ctx, [[235, -600], [262, -570], [262, -526]], INK, 18); line(ctx, [[235, -600], [262, -570], [262, -526]], '#6d4624', 10); ell(ctx, 262, -520, 14, 14, '#4a3018', 3);
  // stone base
  const base = 'M -230 -250 L -230 -40 Q 0 28 230 -40 L 230 -250 Z';
  piece(ctx, base, { fill: hgrad(ctx, -230, 230, ['#d9d2c0', '#b3ab97', '#7d7666']), lw: 5, shade: .3, hi: .3, sw: 36, k: 10 });
  ctx.save(); ctx.clip(P2(base)); ctx.strokeStyle = 'rgba(60,50,40,.45)'; ctx.lineWidth = 3.5;
  [-190, -128, -66, -4].forEach((y, r) => { ctx.beginPath(); ctx.moveTo(-232, y); ctx.quadraticCurveTo(0, y + 46, 232, y); ctx.stroke();
    for (let i = -4; i <= 4; i++) { const x = i * 60 + (r % 2 ? 30 : 0); ctx.beginPath(); ctx.moveTo(x, y + 22 * (1 - (x / 232) ** 2) * 1.0); ctx.lineTo(x, y + 62 * (1 - (x / 232) ** 2 * .9)); ctx.stroke(); } });
  ctx.restore();
  // rim + dark water hole
  ell(ctx, 0, -250, 244, 62, '#cfc7b3', 5); ell(ctx, 0, -246, 206, 46, '#1d2a38', 0);
  ell(ctx, -30, -240, 120, 16, 'rgba(90,150,200,.35)');
  ctx.beginPath(); ctx.ellipse(0, -250, 244, 62, 0, Math.PI * .06, Math.PI * .94); ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 4; ctx.stroke();
  // rope + bucket hanging from the axle
  if (bucket) {
    if (rope) { const top = [0, -600], bot = [0, bucketY - 150 * 1]; line(ctx, [top, [4 * Math.sin(t * 2), (top[1] + bot[1]) / 2], bot], INK, 12); line(ctx, [top, [4 * Math.sin(t * 2), (top[1] + bot[1]) / 2], bot], '#c9a766', 6); }
    ctx.save(); ctx.translate(0, bucketY); drawBucket(ctx, { s: 1, rot: bucketRot }); ctx.restore();
  }
  // front posts overlap the bucket slightly (depth)
  ctx.restore();
}

// ---------- spear ----------
function drawSpear(ctx, len = 1250) {
  piece(ctx, `M -9 40 L 9 40 L 8 ${-len} L -8 ${-len} Z`, { fill: hgrad(ctx, -9, 9, ['#b98a52', '#8a5c30', '#5a3a1c']), lw: 3.5, shade: .3, sw: 8, k: 3 });
  piece(ctx, `M 0 ${-len - 120} C 26 ${-len - 70} 28 ${-len - 24} 10 ${-len + 6} L -10 ${-len + 6} C -28 ${-len - 24} -26 ${-len - 70} 0 ${-len - 120} Z`, { fill: hgrad(ctx, -28, 28, ['#eef3f7', '#9aa8b5', '#5e6b78']), lw: 3.5, shade: .25, hi: .5, sw: 10, k: 3 });
  line(ctx, [[-12, -len + 14], [12, -len + 14]], '#b0381f', 12);
}

// ---------- banner on a pole ----------
function drawBanner(ctx, { w = 250, h = 330, c1 = '#c9262b', c2 = '#f2eddf', cross = true, t = 0, dir = 1, poleH = 900 } = {}) {
  piece(ctx, `M -9 40 L 9 40 L 8 ${-poleH} L -8 ${-poleH} Z`, { fill: hgrad(ctx, -9, 9, ['#b98a52', '#8a5c30', '#5a3a1c']), lw: 3.5, shade: .3, sw: 8, k: 3 });
  ell(ctx, 0, -poleH - 10, 16, 16, '#e8c04a', 3.5);
  const top = -poleH + 20, wv = x => Math.sin(t * 5 - x * .028) * 10 * (x / w);
  const pts = [], n = 12;
  for (let i = 0; i <= n; i++) { const x = (i / n) * w; pts.push([dir * (x + 8), top + wv(x)]); }
  for (let i = n; i >= 0; i--) { const x = (i / n) * w; pts.push([dir * (x + 8), top + h + wv(x) * 1.2]); }
  const d = 'M ' + pts.map(p => p.join(' ')).join(' L ') + ' Z';
  piece(ctx, d, { fill: c2, lw: 4.5, shade: .22, hi: .2, sw: 30, k: 8 });
  if (cross) { // red cross following the wave
    ctx.save(); ctx.clip(P2(d));
    const cx = dir * (w * .5 + 8), cy = top + h * .5;
    ctx.fillStyle = c1; ctx.fillRect(cx - 28, top - 10, 56, h + 30); ctx.fillRect(Math.min(dir * 8, dir * (w + 8)) - 4, cy - 28, w + 20, 56); ctx.restore();
    ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 4.5; ctx.lineJoin = 'round'; ctx.stroke(P2(d)); ctx.restore();
  } else { // Modena: stripes
    ctx.save(); ctx.clip(P2(d)); ctx.fillStyle = c1; ctx.fillRect(Math.min(dir * 8, dir * (w + 8)), top + h * .5 - 70, w + 20, 140);
    ctx.fillStyle = '#e0ac33'; ctx.fillRect(Math.min(dir * 8, dir * (w + 8)), top + h * .5 - 14, w + 20, 28); ctx.restore();
    ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 4.5; ctx.lineJoin = 'round'; ctx.stroke(P2(d)); ctx.restore();
  }
}

// ---------- the tower (Modena's bell tower) ----------
function drawTower(ctx, { s = 1, glow = 0 } = {}) {
  ctx.save(); ctx.scale(s, s);
  if (glow > 0) soft(ctx, 60, () => ell(ctx, 0, -520, 240, 620, `rgba(255,220,140,${.5 * glow})`));
  // shaft
  const shaft = 'M -135 0 L -122 -900 L 122 -900 L 135 0 Z';
  piece(ctx, shaft, { fill: hgrad(ctx, -135, 135, ['#eab98a', '#d29866', '#9c6a46']), lw: 5, shade: .32, hi: .3, sw: 44, k: 12 });
  ctx.save(); ctx.clip(P2(shaft)); ctx.strokeStyle = 'rgba(110,60,30,.30)'; ctx.lineWidth = 2.5;
  for (let y = -880; y < 0; y += 34) { ctx.beginPath(); ctx.moveTo(-140, y); ctx.lineTo(140, y); ctx.stroke(); }
  for (let y = -880, r = 0; y < 0; y += 34, r++) for (let x = -130 + (r % 2) * 22; x < 140; x += 44) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 34); ctx.stroke(); }
  ctx.restore();
  // marble cornices
  for (const y of [-330, -600, -900]) piece(ctx, `M -146 ${y} L 146 ${y} L 146 ${y + 24} L -146 ${y + 24} Z`, { fill: hgrad(ctx, -146, 146, ['#f4efe3', '#d8d0bd']), lw: 4, shade: .2, sw: 10, k: 3 });
  // windows: slit, double arch, triple arch
  const arch = (x, y, w, h) => `M ${x - w / 2} ${y} L ${x - w / 2} ${y - h + w / 2} A ${w / 2} ${w / 2} 0 0 1 ${x + w / 2} ${y - h + w / 2} L ${x + w / 2} ${y} Z`;
  flat(ctx, arch(0, -120, 40, 150), '#3a2418', 4);
  for (const x of [-34, 34]) flat(ctx, arch(x, -400, 44, 130), '#3a2418', 4);
  for (const x of [-64, 0, 64]) flat(ctx, arch(x, -675, 46, 150), '#3a2418', 4);
  // octagonal marble top + spire
  piece(ctx, 'M -126 -900 L -112 -1060 L 112 -1060 L 126 -900 Z', { fill: hgrad(ctx, -126, 126, ['#f6f2e8', '#d9d1be', '#a9a18c']), lw: 5, shade: .3, sw: 30, k: 8 });
  for (const x of [-58, 0, 58]) flat(ctx, arch(x, -940, 38, 100), '#4b3a36', 3.5);
  piece(ctx, 'M -112 -1060 L 0 -1330 L 112 -1060 Z', { fill: lgrad(ctx, -112, -1330, 112, -1060, ['#cfe2e0', '#8fb3b0', '#5f8587']), lw: 5, shade: .3, hi: .4, sw: 28, k: 8 });
  line(ctx, [[0, -1330], [0, -1370]], INK, 8); ell(ctx, 0, -1378, 10, 10, '#e8c04a', 3.5);
  ctx.restore();
}

// ---------- houses, trees, clouds, rays ----------
function drawHouse(ctx, x, y, w, h, wall, roof, seed = 1) {
  const r = srand(seed);
  ctx.save(); ctx.translate(x, y);
  piece(ctx, `M 0 0 L ${w} 0 L ${w} ${-h} L 0 ${-h} Z`, { fill: hgrad(ctx, 0, w, [lighten(wall, .16), wall, darken(wall, .22)]), lw: 4, shade: .25, sw: 30, k: 8 });
  piece(ctx, `M -14 ${-h} L ${w / 2} ${-h - w * .42} L ${w + 14} ${-h} Z`, { fill: lgrad(ctx, 0, -h - w * .42, w, -h, [lighten(roof, .2), roof, darken(roof, .3)]), lw: 4, shade: .3, sw: 26, k: 8 });
  const cols = Math.max(1, Math.round(w / 90)), rows = Math.max(1, Math.round(h / 150));
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
    const wx = (i + .5) * (w / cols) - 20, wy = -h + 30 + j * (h / rows) + 8;
    flat(ctx, `M ${wx} ${wy + 78} L ${wx} ${wy + 26} A 20 20 0 0 1 ${wx + 40} ${wy + 26} L ${wx + 40} ${wy + 78} Z`, '#35506b', 3.5);
    ctx.fillStyle = 'rgba(255,255,255,.2)'; ctx.fillRect(wx + 6, wy + 22, 8, 40);
    flat(ctx, `M ${wx - 14} ${wy + 8} L ${wx - 4} ${wy + 8} L ${wx - 4} ${wy + 80} L ${wx - 14} ${wy + 80} Z`, darken('#5a8a5a', r() * .2), 2.5);
    flat(ctx, `M ${wx + 44} ${wy + 8} L ${wx + 54} ${wy + 8} L ${wx + 54} ${wy + 80} L ${wx + 44} ${wy + 80} Z`, darken('#5a8a5a', r() * .2), 2.5);
  }
  ctx.restore();
}
function drawCypress(ctx, x, y, h, w = 60) {
  ctx.save(); ctx.translate(x, y);
  piece(ctx, `M 0 ${-h} C ${w} ${-h * .7} ${w * 1.1} ${-h * .25} ${w * .5} 0 L ${-w * .5} 0 C ${-w * 1.1} ${-h * .25} ${-w} ${-h * .7} 0 ${-h} Z`, { fill: hgrad(ctx, -w, w, ['#4f7a45', '#2f5a35', '#1f3f27']), lw: 3.5, shade: .3, sw: 24, k: 6 });
  ctx.restore();
}
function drawCloud(ctx, x, y, s = 1, a = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha = a;
  const blobs = [[0, 0, 90, 60], [-90, 14, 70, 48], [90, 18, 74, 50], [-40, -40, 70, 56], [46, -34, 64, 50], [150, 28, 50, 34], [-150, 30, 54, 36]];
  for (const [bx, by, rx, ry] of blobs) ell(ctx, bx, by, rx, ry, rgrad(ctx, bx, by + ry * .4, rx * 1.1, ['#ffffff', '#f4f8fc', '#cfdcea'], bx - rx * .2, by - ry * .5, 4));
  ctx.restore();
}
function drawRays(ctx, cx, cy, { n = 9, len = 2400, a = .22, rot = 0, spread = .075, color = '255,250,230' } = {}) {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < n; i++) {
    const ang = (i / n) * Math.PI * 2, w = spread * (i % 2 ? .6 : 1);
    const g = ctx.createLinearGradient(0, 0, Math.cos(ang) * len, Math.sin(ang) * len); g.addColorStop(0, `rgba(${color},${a})`); g.addColorStop(1, `rgba(${color},0)`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(ang - w) * len, Math.sin(ang - w) * len); ctx.lineTo(Math.cos(ang + w) * len, Math.sin(ang + w) * len); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

// ---------- mini soldiers for the crowds (cheap: no blur filters) ----------
function drawMini(ctx, { s = 1, side = 1, c1 = '#c9262b', c2 = '#f2eddf', hat = 'kettle', t = 0, run = 0, ph = 0, dead = 0, spear = true, flip = 1 } = {}) {
  ctx.save(); ctx.scale(s * flip, s);
  const bob = run ? Math.abs(Math.sin(t * 14 + ph)) * -26 : 0, sw = run ? Math.sin(t * 14 + ph) : 0;
  ctx.translate(0, bob);
  // legs
  for (const k of [-1, 1]) { ctx.save(); ctx.translate(k * 34, -150); ctx.rotate(deg(k * sw * 22)); flat(ctx, 'M -22 0 L 22 0 L 20 140 L -20 140 Z', '#3f4a63', 4); flat(ctx, 'M -26 120 L 30 120 L 38 158 L -28 158 Z', '#5b3a24', 4); ctx.restore(); }
  // spear behind
  if (spear) { ctx.save(); ctx.translate(120 * side, -230); ctx.rotate(deg(side * (run ? 28 : 8) + sw * 4)); flat(ctx, 'M -7 0 L 7 0 L 6 -420 L -6 -420 Z', '#9a6a3a', 3.5); flat(ctx, 'M 0 -480 C 18 -450 18 -430 8 -418 L -8 -418 C -18 -430 -18 -450 0 -480 Z', '#c7d0d9', 3.5); ctx.restore(); }
  // tunic
  flat(ctx, 'M -80 -330 L 80 -330 L 92 -130 L -92 -130 Z', c2, 4);
  flat(ctx, 'M -16 -330 L 16 -330 L 16 -130 L -16 -130 Z', c1, 0); flat(ctx, 'M -80 -250 L 80 -250 L 80 -216 L -80 -216 Z', c1, 0);
  ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.stroke(P2('M -80 -330 L 80 -330 L 92 -130 L -92 -130 Z'));
  // arms
  for (const k of [-1, 1]) { ctx.save(); ctx.translate(k * 82, -310); ctx.rotate(deg(k * (20 + (run ? -sw * k * 28 : 0)) + (run ? -50 * k : 0))); flat(ctx, 'M -22 0 L 22 0 L 20 130 L -20 130 Z', c1, 4); ell(ctx, 0, 138, 22, 22, '#f0c29a', 3.5); ctx.restore(); }
  // head
  ell(ctx, 0, -390, 56, 62, '#f0c29a', 4.5);
  if (dead) { line(ctx, [[-30, -402], [-12, -384]], INK, 5); line(ctx, [[-30, -384], [-12, -402]], INK, 5); line(ctx, [[12, -402], [30, -384]], INK, 5); line(ctx, [[12, -384], [30, -402]], INK, 5); }
  else { ell(ctx, -20, -392, 9, 11, '#fff', 2.5); ell(ctx, 20, -392, 9, 11, '#fff', 2.5); ell(ctx, -18, -391, 4, 5, INK); ell(ctx, 22, -391, 4, 5, INK); line(ctx, [[-28, -415], [-10, -408]], INK, 5); line(ctx, [[28, -415], [10, -408]], INK, 5); ctx.beginPath(); ctx.ellipse(0, -358, 16, 12, 0, 0, Math.PI); ctx.fillStyle = '#5a1618'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3.5; ctx.stroke(); }
  if (hat === 'kettle') { flat(ctx, 'M -92 -420 C -70 -440 70 -440 92 -420 C 60 -406 -60 -406 -92 -420 Z', '#8d99a5', 4); flat(ctx, 'M -58 -428 C -58 -490 -30 -508 0 -508 C 30 -508 58 -490 58 -428 Z', '#b4bec8', 4); }
  else { flat(ctx, 'M -60 -418 C -66 -480 -20 -508 20 -504 C 56 -500 68 -462 60 -418 C 30 -436 -30 -436 -60 -418 Z', '#2f8f5b', 4); line(ctx, [[30, -500], [80, -520], [100, -500]], '#c92c2c', 7); }
  ctx.restore();
}

// ---------- effects ----------
function dustPuff(ctx, x, y, r, a = .8, col = '235,215,180') {
  soft(ctx, r * .18, () => { ell(ctx, x, y, r, r * .8, `rgba(${col},${a})`); ell(ctx, x - r * .5, y + r * .1, r * .7, r * .55, `rgba(${col},${a * .9})`); ell(ctx, x + r * .55, y + r * .12, r * .65, r * .5, `rgba(${col},${a * .9})`); });
}
function starburst(ctx, x, y, r1, r2, n, rot, fill, lw = 8) {
  const p = new Path2D(); for (let i = 0; i < n * 2; i++) { const a = rot + (i / (n * 2)) * Math.PI * 2, r = i % 2 ? r1 : r2; p[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * r, y + Math.sin(a) * r); } p.closePath();
  ctx.save(); ctx.fillStyle = fill; ctx.fill(p); ctx.lineJoin = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = lw; ctx.stroke(p); ctx.restore();
}
function sparkle4(ctx, x, y, s, rot = 0, fill = '#fff6c2', a = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.globalAlpha = a;
  flat(ctx, 'M 0 -50 L 10 -10 L 50 0 L 10 10 L 0 50 L -10 10 L -50 0 L -10 -10 Z', fill, 0); ctx.restore();
}
function speedLines(ctx, cx, cy, { n = 26, r0 = 500, r1 = 1400, a = .5, seed = 3, t = 0 } = {}) {
  const r = srand(seed); ctx.save(); ctx.strokeStyle = `rgba(255,255,255,${a})`; ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) { const ang = r() * Math.PI * 2, a0 = r0 + r() * 200 + ((t * 900 + i * 71) % 300), l = 220 + r() * 300; ctx.lineWidth = 5 + r() * 9; ctx.beginPath(); ctx.moveTo(cx + Math.cos(ang) * a0, cy + Math.sin(ang) * a0); ctx.lineTo(cx + Math.cos(ang) * Math.min(a0 + l, r1), cy + Math.sin(ang) * Math.min(a0 + l, r1)); ctx.stroke(); }
  ctx.restore();
}
