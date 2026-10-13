// IMAGE 4 — "Juba the Champion": most realistic. Lineless painterly shapes, soft overcast top light,
// cool sky rim, warm sand bounce. Athletic real-world proportions.
'use strict';
const L = require('./lib');
const F = require('./figure');
const { face4, C: FC } = require('./face4');
const { path, P, soft, ellipse } = L;

const cfg = {
  number: 4,
  st: { light: [-0.35, -0.94], rimDir: [0.92, -0.3], cel: 7, lineW: 0, lineMode: 'none', rimW: 6, rimBlur: 3, rimOp: 0.6, shadowOp: 0.85, formBlur: 22, formEdge: 26, formSop: 0.22, sheen: 22, sheenOp: 0.28, bounceOp: 0.5, bounceBlur: 7, handLW: 0.01, propLW: 0.01, deepBlur: 8 },
  SKIN: { base: FC.base, light: FC.light, hi: FC.hi, shadow: FC.shadow, deep: FC.deep, rim: FC.rim, bounce: FC.bounce, line: FC.deep, nail: '#a8786a', nailHi: '#e0c8c0', nailTip: '#c8a49a', vein: '#3a2420' },
  CLOTH: { base: '#7d7a5a', light: '#a9a782', hi: '#d0ceaa', shadow: '#3e3d2c', deep: '#22211a', rim: '#bccad2', bounce: '#9a7a50', line: '#22211a' },
  LEATHER: { base: '#4e3222', light: '#7e5a40', hi: '#b08a6a', shadow: '#22140e', deep: '#120a06', rim: '#aabccc', bounce: '#8a5a34', line: '#120a06' },
  LEATHER2: { base: '#6a452c', light: '#9a7050', hi: '#c8a07a', shadow: '#2c1a10', deep: '#160c08', rim: '#aabccc', bounce: '#9a6a40', line: '#160c08' },
  BRONZE: { base: '#9a6e34', light: '#d8aa62', hi: '#fff2cc', shadow: '#3e2a14', deep: '#1e140a', rim: '#cddce4', line: '#1e140a' },
  CREST: { base: '#7a2a24', light: '#a8443a', hi: '#d4705e', shadow: '#3a1210', deep: '#1e0808', rim: '#c4d0d8', bounce: '#8a4a34', line: '#1e0808' },
  METAL: { base: '#9a6e34', light: '#d8aa62', hi: '#fff2cc', shadow: '#3e2a14', deep: '#1e140a', rim: '#cddce4', line: '#1e140a' },
  WOOD: { base: '#7a5a3a', light: '#a8845e', hi: '#d0ae86', shadow: '#3a2a1a', deep: '#1e140a', rim: '#bccad2', line: '#1e140a' },
  trim: '#5a3a22',
  params: { heads: 7.6, headPx: 206, shoulder: 1.0, hip: 0.97, cx: -4, foreLen: 1.04 },
  widths: { arm: 1.04, fore: 1.04, thigh: 1.06, calf: 1.06, chest: 1.0, waist: 0.92, foot: 1.0 },
  shade: 0.55,
  formK: 1.15,
  insetFx: 190, insetFy: 580,
  face: face4,
  prop: 'helmet',
  exprA: { lidN: 0.92, lidF: 0.92, browN: [-3, 0], browF: [-3, 0], cornN: 1, gaze: [-4, 0] },
  exprB: { browN: [38, 30], browF: [42, 34], lidN: 1.32, lidF: 1.32, pupil: 0.8, jaw: 36, open: 0.32, teeth: 'upper', gaze: [-6, 0] },
  wrap: { color: '#dfe8f0', blur: 20, op: 0.35 },
  texOp: 0.12, grainOp: 0.09,
  backdrop(doc, J) {
    const W = 1080, HH = 1920;
    let s = `<rect width="${W}" height="${HH}" fill="${doc.lin(0, 0, 0, HH, [[0, '#9aa6b0'], [0.4, '#c4c8c8'], [0.56, '#d8d2c6'], [1, '#bfae92']])}"/>`;
    // soft overcast cloud masses
    for (const [x, y, rx, ry, o] of [[200, 220, 520, 140, 0.35], [860, 360, 460, 120, 0.3], [520, 560, 600, 110, 0.25]]) s += soft(doc, ellipse(x, y, rx, ry), '#e6e8e8', 40, o);
    // pale stone arena wall, out of focus
    let arches = '';
    for (let x = -40; x < 1100; x += 110) arches += `M${x + 20},1170V1070A35,35 0 0 1 ${x + 90},1070V1170Z`;
    s += `<g filter="${doc.blur(3)}"><path d="M0,960H1080V1170H0Z" fill="#c8b8a0"/><path d="${arches}" fill="#8a7a66"/><path d="M0,956H1080V972H0Z M0,1020H1080V1028H0Z" fill="#e2d6c2"/>` +
      `<path d="M0,1000H1080V1016H0Z" fill="#7a2a24" opacity="0.5"/></g>`;
    s += `<rect y="1160" width="${W}" height="${HH - 1160}" fill="${doc.lin(0, 1160, 0, HH, [[0, '#d6c4a4'], [1, '#b49a76']])}"/>`;
    s += soft(doc, path([[0, 1160], [1080, 1160], [1080, 1190], [0, 1190]], true), '#efe4cc', 8, 0.6);
    // soft overcast contact shadow
    const f = J.AN, f2 = J.AF;
    s += soft(doc, ellipse((f[0] + f2[0]) / 2 + 30, 1860, 230, 34), '#5a4a3a', 18, 0.45);
    s += soft(doc, ellipse((f[0] + f2[0]) / 2 + 30, 1858, 150, 14), '#3a2e24', 6, 0.4);
    return s;
  },
  insetBg(doc, ix, iy, iw, ih) {
    return `<rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" fill="${doc.lin(0, iy, 0, iy + ih, [[0, '#a8b2ba'], [1, '#d8cebc']])}"/>`;
  },
  frame: '#ffffff', numColor: '#ffffff',
};

if (require.main === module) F.image(cfg, process.argv[2] || 'out/char4.svg');
module.exports = { cfg };
