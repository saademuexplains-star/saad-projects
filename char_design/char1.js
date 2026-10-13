// IMAGE 1 — "Brutus the Bull": most stylized. Bold outlines, hard cel shading, harsh torch key from the left,
// teal night rim from behind-right. Heavy brawler proportions.
'use strict';
const L = require('./lib');
const F = require('./figure');
const { face1, C: FC } = require('./face1');
const { path, P, taper, soft, ellipse } = L;

const cfg = {
  number: 1,
  st: { light: [-0.9, -0.42], rimDir: [0.86, -0.3], cel: 0.6, lineW: 4.4, lineMode: 'bold', lineColor: '#170a08', rimW: 10, shadowOp: 0.96, formBlur: 6, lineContrast: 0.5, lineMin: 0.45, formEdge: 0.8, formSop: 0.6, handLW: 3.2, propLW: 3.2, rimBlur: 0.6 },
  SKIN: { base: FC.base, light: FC.light, hi: FC.hi, shadow: FC.shadow, deep: FC.deep, rim: FC.rim, rimHot: FC.rimHot, bounce: FC.bounce, line: '#170a08', nail: '#f0b090', nailHi: '#fff0d8', nailTip: '#ffe0c0', vein: '#8a4a48' },
  CLOTH: { base: '#b0282c', light: '#e8533c', hi: '#ff8a5a', shadow: '#4a1630', deep: '#26081a', rim: '#4fd2cb', rimHot: '#bff8f2', bounce: '#c4673c', line: '#170a08' },
  LEATHER: { base: '#4a2a1c', light: '#8a5030', hi: '#c27a48', shadow: '#1e0f10', deep: '#0e0606', rim: '#4fd2cb', bounce: '#7a3a22', line: '#100606' },
  LEATHER2: { base: '#6a3a22', light: '#b0683a', hi: '#e09a5a', shadow: '#2a1414', deep: '#140808', rim: '#4fd2cb', bounce: '#8a4a2a', line: '#100606' },
  BRONZE: { base: '#b07a38', light: '#ffc46a', hi: '#fff0c0', shadow: '#4a2a1a', deep: '#22120a', rim: '#6ff0e6', line: '#140a06' },
  METAL: { base: '#b07a38', light: '#ffc46a', hi: '#fff0c0', shadow: '#4a2a1a', deep: '#22120a', rim: '#6ff0e6', line: '#140a06' },
  WOOD: { base: '#7a4a2a', light: '#c07a44', hi: '#eaa868', shadow: '#2e1a14', deep: '#160c08', rim: '#4fd2cb', line: '#100606' },
  trim: '#e2a848',
  params: { heads: 6.6, headPx: 234, shoulder: 1.1, hip: 1.02, cx: 0, foreLen: 1.04, torsoLong: 0.015 },
  widths: { arm: 1.32, fore: 1.34, thigh: 1.22, calf: 1.22, chest: 1.16, waist: 1.08, neckTop: 0.86, foot: 1.1 },
  handK: 1.2,
  shade: 0.62,
  insetFx: 150, insetFy: 600, insetZoom: 1.95,
  formK: 1.1,
  face: face1,
  prop: 'trident',
  exprA: { lidN: 0.9, lidF: 0.9, browN: [-10, 2], browF: [-10, 2], cornN: -3, cornF: -3, gaze: [-4, 0] },
  exprB: { browN: [44, 30], browF: [44, 30], lidN: 1.4, lidF: 1.4, pupil: 0.45, jaw: 70, open: 0.55, teeth: 'upper', gaze: [-4, -2], sweat: true },
  wrap: { color: '#3fc6c0', blur: 22, op: 0.3 },
  armDetail(doc, g, side) {
    if (side !== 'N') return '';
    // old arena scars on the upper arm
    const w = (a) => a.map((p) => g.warp(p, ['chain', 'shN', 'EN', 'WN', 'arm', 'fore']));
    return P(taper(w([[400, 740], [424, 760], [446, 772]]), [0, 4, 0]), '#e9a07a', 'opacity="0.9"') + P(taper(w([[392, 860], [410, 870]]), [0, 3.4, 0]), '#e9a07a', 'opacity="0.8"');
  },
  torsoDetail(doc, g, T) {
    // chest hair on the bare pec
    const R = require('./facekit').rng(5);
    let s = '';
    for (let i = 0; i < 70; i++) {
      const u = 0.1 + R() * 0.8, v = R();
      const p = T([[500 + u * 100, 700 + v * 100]])[0];
      const a = 1.2 + (R() - 0.5) * 0.8;
      s += P(taper([p, [p[0] + Math.cos(a) * 10, p[1] + Math.sin(a) * 10]], [0, 1.8, 0]), '#2a1410', 'opacity="0.55"');
    }
    return s;
  },
  backdrop(doc, J) {
    const W = 1080, HH = 1920;
    let s = `<rect width="${W}" height="${HH}" fill="${doc.lin(0, 0, 0, HH, [[0, '#0b1418'], [0.45, '#1a1a1e'], [0.62, '#2a1a16'], [1, '#3a2014']])}"/>`;
    // arena wall: big stone blocks, warm near the torch, cold teal toward the right
    let blocks = '';
    for (let r = 0; r < 9; r++) {
      const y = 560 + r * 70, off = (r % 2) * 60;
      for (let x = -120 + off; x < 1100; x += 120) blocks += `M${x + 3},${y + 3}h114v64h-114Z`;
    }
    s += `<path d="${blocks}" fill="#2c2420" opacity="0.9"/>`;
    s += `<rect y="540" width="${W}" height="${1200 - 540}" fill="${doc.lin(0, 0, W, 0, [[0, '#ff8a3a', 0.35], [0.45, '#ff8a3a', 0.06], [1, '#2a9a9a', 0.12]])}"/>`;
    s += `<rect y="1150" width="${W}" height="40" fill="#120c0a" opacity="0.8"/>`;
    // night sky + moon glow behind the wall top (source of the teal rim)
    s += `<circle cx="990" cy="300" r="520" fill="${doc.rad(990, 300, 520, [[0, '#5fd8d0', 0.35], [0.4, '#2a7a80', 0.15], [1, '#0b1418', 0]])}"/>`;
    // wall-mounted torch on the left: bracket, flame, glow
    const tx = 92, ty = 840;
    s += `<circle cx="${tx}" cy="${ty - 30}" r="520" fill="${doc.rad(tx, ty - 30, 520, [[0, '#ffcf70', 0.75], [0.12, '#ff9a40', 0.5], [0.45, '#d0501a', 0.16], [1, '#d0501a', 0]])}"/>`;
    s += `<path d="M${tx - 14},${ty}L${tx + 14},${ty}L${tx + 8},${ty + 110}L${tx - 8},${ty + 110}Z" fill="#2a1a12" stroke="#0a0505" stroke-width="3"/>`;
    s += `<path d="M${tx - 20},${ty - 6}h40v14h-40Z" fill="#5a3a20" stroke="#0a0505" stroke-width="3"/>`;
    s += `<path d="M${tx},${ty - 120} C${tx + 34},${ty - 70} ${tx + 30},${ty - 20} ${tx},${ty - 8} C${tx - 30},${ty - 20} ${tx - 34},${ty - 64} ${tx},${ty - 120}Z" fill="#ff8a2a"/>`;
    s += `<path d="M${tx},${ty - 84} C${tx + 18},${ty - 54} ${tx + 16},${ty - 22} ${tx},${ty - 12} C${tx - 16},${ty - 22} ${tx - 18},${ty - 52} ${tx},${ty - 84}Z" fill="#ffe08a"/>`;
    // sand floor lit by the torch, cold on the right
    s += `<rect y="1190" width="${W}" height="${HH - 1190}" fill="${doc.lin(0, 1190, 0, HH, [[0, '#5a3420'], [1, '#2a160e']])}"/>`;
    s += soft(doc, ellipse(260, 1760, 620, 230), '#c86a34', 90, 0.5);
    s += `<rect y="1190" width="${W}" height="${HH - 1190}" fill="${doc.lin(0, 0, W, 0, [[0.55, '#2a8a8a', 0], [1, '#2a8a8a', 0.18]])}"/>`;
    // cast shadow thrown to the right by the torch
    const f = J.AN, f2 = J.AF;
    s += soft(doc, path([[f[0] - 30, 1852], [f2[0] + 100, 1866], [1300, 1790], [1300, 1700]], true), '#0a0606', 8, 0.6);
    return s;
  },
  insetBg(doc, ix, iy, iw, ih) {
    return `<rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" fill="${doc.lin(ix, 0, ix + iw, 0, [[0, '#6a3018'], [0.6, '#2a1a1a'], [1, '#123034']])}"/>` +
      `<circle cx="${ix}" cy="${iy + ih * 0.4}" r="320" fill="${doc.rad(ix, iy + ih * 0.4, 320, [[0, '#ffb060', 0.6], [1, '#ff8040', 0]])}"/>`;
  },
  frame: '#ffd9a0',
};

if (require.main === module) F.image(cfg, process.argv[2] || 'out/char1.svg');
module.exports = { cfg };
