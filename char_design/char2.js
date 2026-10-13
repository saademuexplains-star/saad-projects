// IMAGE 2 — "Cassius the Showman": fine ink lines, crisp cel shading, golden-hour sun from the right/back.
'use strict';
const L = require('./lib');
const F = require('./figure');
const { face2, C: FC } = require('./face2');
const { path, soft } = L;

const cfg = {
  number: 2,
  st: { light: [0.94, -0.33], rimDir: [0.9, -0.15], cel: 1, lineW: 2.1, lineMode: 'ink', lineColor: '#2a1512', neckLineR: '#8a4520', rimW: 9, shadowOp: 0.93, formBlur: 10, lineContrast: 0.6, formEdge: 4 },
  SKIN: { base: FC.base, light: FC.light, hi: FC.hi, shadow: FC.shadow, deep: FC.deep, rim: FC.rim, rimHot: FC.rimHot, bounce: FC.bounce, line: '#2a1512', nail: '#e9b59a', nailHi: '#fff1e2', nailTip: '#f8e4d2', vein: '#7a5868' },
  CLOTH: { base: '#ecdcbc', light: '#fff2d6', hi: '#fff8e6', shadow: '#9b8a9e', deep: '#5f5170', rim: '#ffd27a', rimHot: '#fff6d8', bounce: '#e9b27c', line: '#2a1512' },
  LEATHER: { base: '#6b3f25', light: '#a8693c', hi: '#d7975a', shadow: '#2f1a16', deep: '#1a0e0c', rim: '#ffb34d', bounce: '#9a5a34', line: '#1d0f0b' },
  LEATHER2: { base: '#8f5b33', light: '#c48a52', hi: '#e8b070', shadow: '#43281f', deep: '#24140f', rim: '#ffbf5a', bounce: '#b07040', line: '#1d0f0b' },
  BRONZE: { base: '#b8863a', light: '#f0c26a', hi: '#fff0b8', shadow: '#5a3a1e', deep: '#2a1a0e', rim: '#fff1b0', line: '#24140a' },
  IRON: { base: '#7c8088', light: '#c9ccd2', hi: '#ffffff', shadow: '#33343c', deep: '#1a1a20', rim: '#ffd890', line: '#16161c' },
  WOOD: { base: '#94653a', light: '#d29a5c', hi: '#f0c48a', shadow: '#4e321f', deep: '#2a1a10', rim: '#ffc160', line: '#1d0f0b' },
  trim: '#b5602d',
  params: { heads: 7.1, headPx: 216, shoulder: 0.96, hip: 0.92, cx: 10, foreLen: 1.06, torsoLong: -0.012 },
  widths: { arm: 1.0, fore: 1.02, thigh: 1.0, calf: 1.04, chest: 0.98, waist: 0.86, foot: 0.98 },
  face: face2,
  prop: 'spear',
  exprA: { lidN: 0.9, lidF: 0.9, browN: [-3, 2], browF: [-3, 2], cornN: 2, gaze: [-4, 0] },
  exprB: { browF: [30, 48], browN: [-6, 4], lidN: 0.6, lidF: 0.58, cornN: 28, cornF: -4, open: 0.22, teeth: 'upper', cheekN: 14, lowN: 8, lowF: 6, gaze: [-7, 2] },
  wrap: { color: '#ffd58a', blur: 18, op: 0.8 },
  backdrop(doc, J) {
    const W = 1080, HH = 1920;
    let s = `<rect width="${W}" height="${HH}" fill="${doc.lin(0, 0, 0, HH, [[0, '#2d4560'], [0.28, '#6d6a78'], [0.46, '#d58a56'], [0.56, '#f4b565'], [0.62, '#e9a35d'], [1, '#a8683e']])}"/>`;
    s += `<circle cx="980" cy="1000" r="700" fill="${doc.rad(980, 1000, 700, [[0, '#fff1c0', 0.95], [0.18, '#ffd37a', 0.6], [0.5, '#f0a050', 0.18], [1, '#f0a050', 0]])}"/>`;
    let arches = '';
    for (let x = -20; x < 1100; x += 74) {
      arches += `M${x + 14},1166V1112A23,23 0 0 1 ${x + 60},1112V1166Z`;
      arches += `M${x + 18},1080V1052A19,19 0 0 1 ${x + 56},1052V1080Z`;
    }
    s += `<g filter="${doc.blur(2.2)}" opacity="0.8"><path d="M0,1010H1080V1166H0Z" fill="#b0705a"/><path d="${arches}" fill="#6e4048"/><path d="M0,1006H1080V1016H0Z M0,1086H1080V1094H0Z" fill="#d79a6c"/></g>`;
    s += `<rect y="990" width="1080" height="190" fill="${doc.lin(0, 990, 0, 1180, [[0, '#f6b866', 0.0], [0.5, '#f6b866', 0.25], [1, '#ffd08a', 0.55]])}"/>`;
    s += `<rect y="1160" width="${W}" height="${HH - 1160}" fill="${doc.lin(0, 1160, 0, HH, [[0, '#d99d5e'], [0.4, '#c98a52'], [1, '#9c6238']])}"/>`;
    s += soft(doc, path([[0, 1160], [1080, 1160], [1080, 1200], [0, 1200]], true), '#ffd890', 10, 0.5);
    const f = J.AN, f2 = J.AF;
    s += soft(doc, path([[f[0] - 40, 1850], [f2[0] + 120, 1866], [f2[0] - 60, 1890], [-400, 1990], [-500, 1930]], true), '#5e4a6a', 6, 0.55);
    s += soft(doc, path([[f[0] - 20, 1856], [f2[0] + 60, 1868], [f[0] - 160, 1890]], true), '#3a2a40', 3, 0.5);
    return s;
  },
  insetBg(doc, ix, iy, iw, ih) {
    return `<rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" fill="${doc.lin(0, iy, 0, iy + ih, [[0, '#4a5a72'], [0.6, '#d8915a'], [1, '#f2b46a']])}"/>` +
      `<circle cx="${ix + iw}" cy="${iy + ih * 0.7}" r="300" fill="${doc.rad(ix + iw, iy + ih * 0.7, 300, [[0, '#fff0c0', 0.8], [1, '#ffc070', 0]])}"/>`;
  },
};

if (require.main === module) F.image(cfg, process.argv[2] || 'out/char2.svg');
module.exports = { cfg };
