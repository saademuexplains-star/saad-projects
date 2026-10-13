// IMAGE 3 — "Old Varro": thin coloured lines, soft volumetric shading (Klaus-like),
// cold moonlight key from high upper-left, warm brazier bounce from low right, pale cyan rim.
'use strict';
const L = require('./lib');
const F = require('./figure');
const { face3, C: FC } = require('./face3');
const { path, P, soft, ellipse } = L;

const cfg = {
  number: 3,
  st: { light: [-0.45, -0.89], rimDir: [0.92, -0.2], bounceDir: [-0.6, -0.8], cel: 9, lineW: 1.7, lineMode: 'thin', lineColor: '#2e2638', rimW: 5, rimBlur: 1.4, rimOp: 0.55, shadowOp: 0.9, formBlur: 26, formInset: 18, formOp: 0.42, lineContrast: 0.45, lineMin: 0.5, formEdge: 20, formSop: 0.26, bounceOp: 0.55, bounceBlur: 8, handLW: 1.4, propLW: 1.4 },
  SKIN: { base: FC.base, light: FC.light, hi: FC.hi, shadow: FC.shadow, deep: FC.deep, rim: FC.rim, bounce: FC.bounce, line: '#3a2f45', nail: '#c8b0b0', nailHi: '#f2ecf4', nailTip: '#e4dce4', vein: '#6a5a7a' },
  CLOTH: { base: '#3e4860', light: '#62729a', hi: '#7f90b6', shadow: '#1c2232', deep: '#0e121c', rim: '#7aa8c8', bounce: '#b06a3e', line: '#141824' },
  LEATHER: { base: '#3a2a26', light: '#6a5a62', hi: '#9a8a96', shadow: '#1a1218', deep: '#0c080c', rim: '#a6e6ff', bounce: '#a0603a', line: '#120c10' },
  LEATHER2: { base: '#56403a', light: '#8a7a84', hi: '#b8aab4', shadow: '#241a1e', deep: '#120c10', rim: '#a6e6ff', bounce: '#b06a40', line: '#120c10' },
  BRONZE: { base: '#8a6a48', light: '#c8b8a8', hi: '#f4f0ff', shadow: '#3a2a22', deep: '#1a120e', rim: '#c8f4ff', line: '#160e0c' },
  METAL: { base: '#7a8494', light: '#c8d2e4', hi: '#ffffff', shadow: '#2c303c', deep: '#16181e', rim: '#d8f6ff', line: '#14161c' },
  WOOD: { base: '#5a4434', light: '#8a7a80', hi: '#b0a4aa', shadow: '#241a16', deep: '#120c0a', rim: '#a6e6ff', line: '#120c0a' },
  trim: '#8a3a34',
  params: { heads: 6.95, headPx: 222, shoulder: 1.04, hip: 1.1, cx: -16, foreLen: 1.02, torsoLong: 0.012, farOut: 44, nearOut: 8 },
  widths: { arm: 1.16, fore: 1.16, thigh: 1.16, calf: 1.12, chest: 1.12, waist: 1.24, foot: 1.05 },
  shade: 0.7,
  formK: 1.0,
  insetFx: 170, insetFy: 590,
  face: face3,
  prop: 'gladius',
  exprA: { lidN: 0.88, lidF: 0.88, browN: [-4, -4], browF: [-4, -4], cornN: -2, gaze: [-4, 0] },
  exprB: { browN: [34, -4], browF: [34, -4], lidN: 1.4, lidF: 1.4, pupil: 0.5, open: 0.34, wide: 1.3, teeth: 'both', cornN: -12, cornF: -8, gaze: [-6, 0], sweat: true },
  texOp: 0.14, grainOp: 0.12,
  falloff: { y0: 720, y1: 1860, color: '#161c30', op: 0.44 },
  armNLine: [1, 22], deltLineOp: 0.22, foldHi: 0.35, formMul: { trapN: 0, calfN: 0, calfF: 0, vlN: 0, vlF: 0, vmN: 0, vmF: 0, patN: 0, patF: 0, shinN: 0.5, shinF: 0.5, bicN: 0.6, triN: 0.5, foreN: 0.6 }, neckRidge: 0.22,
  neckShadow: 0, neckBounce: false, neckForm: false, torsoFormOp: 0.25, skirtShadow: 34, sandalSimple: true,
  numPos: [1012, 1858],
  backdrop(doc, J) {
    const W = 1080, HH = 1920;
    const R = require('./facekit').rng(9);
    let s = `<rect width="${W}" height="${HH}" fill="${doc.lin(0, 0, 0, HH, [[0, '#0b1424'], [0.35, '#1a2842'], [0.55, '#283856'], [0.62, '#1a2234'], [1, '#10141e']])}"/>`;
    // moon glow (key light source, upper-left beyond the frame)
    s += `<circle cx="-60" cy="360" r="980" fill="${doc.rad(-60, 360, 980, [[0, '#dcefff', 0.5], [0.22, '#8eb2e2', 0.24], [1, '#2a3a58', 0]])}"/>`;
    // stars, slightly soft (out of focus)
    let st = '';
    for (let i = 0; i < 80; i++) st += `<circle cx="${(R() * W).toFixed(0)}" cy="${(R() * 920).toFixed(0)}" r="${(0.9 + R() * 1.6).toFixed(1)}" fill="#e8f0ff" opacity="${(0.2 + R() * 0.5).toFixed(2)}"/>`;
    s += `<g filter="${doc.blur(0.7)}">${st}</g>`;
    // faint moon shaft falling across the scene (volumetric, very subtle)
    s += `<path d="M-200,180 L260,120 L1180,1700 L640,1900 Z" fill="${doc.lin(0, 200, 700, 1500, [[0, '#cfe4ff', 0.10], [1, '#cfe4ff', 0]])}" filter="${doc.blur(40)}"/>`;
    // arena wall: deep out-of-focus colonnade
    let arches = '';
    for (let x = -30; x < 1100; x += 92) arches += `M${x + 16},1180V1090A30,30 0 0 1 ${x + 76},1090V1180Z`;
    s += `<g filter="${doc.blur(6)}"><path d="M0,996H1080V1180H0Z" fill="#2e3b56"/><path d="${arches}" fill="#121828"/><path d="M0,992H1080V1008H0Z" fill="#5e7298"/></g>`;
    // ground (far edge melts into the haze)
    s += `<rect y="1170" width="${W}" height="${HH - 1170}" fill="${doc.lin(0, 1170, 0, HH, [[0, '#353d54'], [1, '#161a28']])}"/>`;
    // low moonlit haze where the ground meets the wall
    s += soft(doc, path([[0, 1150], [1080, 1150], [1080, 1192], [0, 1192]], true), '#2e3850', 10, 0.9);
    s += soft(doc, path([[0, 1100], [1080, 1080], [1080, 1290], [0, 1300]], true), '#6a7ea6', 40, 0.28);
    // brazier further back on the right (smaller, softly out of focus)
    const bx = 990, by = 1430, k = 0.78;
    s += soft(doc, ellipse(bx - 60, by + 300, 420, 150), '#c0602e', 70, 0.45);
    s += `<circle cx="${bx}" cy="${by - 60}" r="520" fill="${doc.rad(bx, by - 60, 520, [[0, '#ffb060', 0.55], [0.2, '#ff8030', 0.28], [0.6, '#a04020', 0.07], [1, '#a04020', 0]])}"/>`;
    let br = '';
    br += `<path d="M-54,50L-86,300L-70,300L-28,70Z M54,50L86,300L70,300L28,70Z M-8,60L-6,300L8,300L10,60Z" fill="#14100f"/>`;
    br += `<path d="M-54,50L-86,300" stroke="#7a8aa8" stroke-width="2" opacity="0.6"/>`;
    br += `<path d="M-96,14Q0,34 96,14L76,62Q0,86 -76,62Z" fill="${doc.lin(bx - 96, 0, bx + 96, 0, [[0, '#3a4258'], [0.5, '#1a1414'], [1, '#5a2a14']])}"/>`;
    br += `<path d="M-96,14Q0,34 96,14" stroke="#ffb060" stroke-width="3" fill="none"/>`;
    br += `<path d="M-70,22C-84,-40 -30,-70 -16,-150C14,-90 40,-120 46,-170C70,-100 92,-40 70,22Z" fill="#e8501a"/>`;
    br += `<path d="M-50,22C-60,-30 -20,-50 -8,-110C14,-60 34,-80 36,-120C56,-70 64,-20 50,22Z" fill="#ff9a30"/>`;
    br += `<path d="M-26,22C-30,-10 -6,-20 4,-64C18,-22 34,-10 28,22Z" fill="#ffe8a0"/>`;
    s += `<g transform="translate(${bx},${by}) scale(${k})" filter="${doc.blur(2.4)}">${br}</g>`;
    let sp = '';
    for (let i = 0; i < 18; i++) sp += `<circle cx="${(bx - 50 + R() * 110).toFixed(0)}" cy="${(by - 110 - R() * 280).toFixed(0)}" r="${(1 + R() * 1.8).toFixed(1)}" fill="#ffc070" opacity="${(0.35 + R() * 0.5).toFixed(2)}"/>`;
    s += `<g filter="${doc.blur(0.8)}">${sp}</g>`;
    // moon shadow cast to the lower right, long and soft
    const f = J.AN, f2 = J.AF;
    s += soft(doc, path([[f[0] - 30, 1852], [f2[0] + 90, 1864], [1060, 1990], [860, 2010]], true), '#060810', 12, 0.55);
    s += soft(doc, ellipse((f[0] + f2[0]) / 2 + 20, 1858, 190, 18), '#05060a', 6, 0.5);
    return s;
  },
  post(doc, J, silMask) {
    const W = 1080, HH = 1920;
    const bx = 990, by = 1430;
    let s = '';
    // warm brazier light wrapping onto the figure's right/lower side
    s += `<rect width="${W}" height="${HH}" mask="${silMask}" fill="${doc.rad(bx, by - 40, 700, [[0, '#ff9a4a', 0.5], [0.45, '#ff8a3a', 0.14], [1, '#ff8a3a', 0]])}" style="mix-blend-mode:screen"/>`;
    // cool moon top-light on the head and shoulders
    s += `<rect width="${W}" height="${HH}" mask="${silMask}" fill="${doc.rad(J.head[0] - 160, J.head[1] - 60, 700, [[0, '#bcd4ff', 0.10], [1, '#bcd4ff', 0]])}" style="mix-blend-mode:screen"/>`;
    // a few out-of-focus embers drifting in front (shallow depth of field)
    for (const [x, y, r, o] of [[930, 1240, 9, 0.35], [1010, 1150, 6, 0.3], [880, 1330, 5, 0.25], [1040, 1300, 12, 0.22], [965, 1080, 4, 0.3]]) s += `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffb060" opacity="${o}" filter="${doc.blur(r * 0.45)}"/>`;
    // fire bloom
    s += `<circle cx="${bx}" cy="${by - 50}" r="260" fill="${doc.rad(bx, by - 50, 260, [[0, '#ffd08a', 0.45], [0.35, '#ff9040', 0.18], [1, '#ff9040', 0]])}" style="mix-blend-mode:screen"/>`;
    // vignette + gentle teal/orange grade
    s += `<rect width="${W}" height="${HH}" fill="${doc.rad(540, 1000, 1150, [[0.55, '#000', 0], [1, '#000', 0.55]])}"/>`;
    s += `<rect width="${W}" height="${HH}" fill="${doc.lin(0, 0, W, HH, [[0, '#2a5a8a', 0.10], [1, '#c06a30', 0.08]])}" style="mix-blend-mode:soft-light"/>`;
    return s;
  },
  insetPost(doc, ix, iy, iw, ih) {
    // same light as the main shot: warm fire spill from lower right, cool moon from upper left, soft vignette
    return `<rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" fill="${doc.rad(ix + iw * 1.05, iy + ih * 1.05, iw * 0.95, [[0, '#ff9a4a', 0.32], [1, '#ff9a4a', 0]])}" style="mix-blend-mode:screen"/>` +
      `<rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" fill="${doc.rad(ix - 40, iy - 40, iw * 0.9, [[0, '#bcd4ff', 0.12], [1, '#bcd4ff', 0]])}" style="mix-blend-mode:screen"/>` +
      `<rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" fill="${doc.rad(ix + iw / 2, iy + ih / 2, iw * 0.78, [[0.6, '#000', 0], [1, '#000', 0.45]])}"/>`;
  },
  insetBg(doc, ix, iy, iw, ih) {
    return `<rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" fill="${doc.lin(ix, iy, ix + iw, iy + ih, [[0, '#5a6e96'], [0.5, '#1e2a44'], [1, '#3a2a2a']])}"/>` +
      `<circle cx="${ix + iw}" cy="${iy + ih}" r="300" fill="${doc.rad(ix + iw, iy + ih, 300, [[0, '#ff9a50', 0.5], [1, '#ff9a50', 0]])}"/>`;
  },
  frame: '#dfe8ff', numColor: '#dfe8ff',
};

if (require.main === module) F.image(cfg, process.argv[2] || 'out/char3.svg');
module.exports = { cfg };
