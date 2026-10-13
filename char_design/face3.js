// Character 3 head: the veteran. Thin coloured lines, soft volumetric shading.
// Cold moonlight key from high upper-left, warm brazier bounce from low right, pale cyan rim.
'use strict';
const L = require('./lib');
const K = require('./facekit');
const { path, taper, P, inside, soft, crescent, ellipse, lerp } = L;

const C = {
  base: '#94776f', light: '#c2c4d6', hi: '#eaeefb', shadow: '#40323f', shadow2: '#664f5a', deep: '#211a28',
  rim: '#8ec2e0', rimHot: '#cfeefc', bounce: '#e08a4e', blush: '#b8706a',
  beard: '#7c7884', beardLight: '#b4b6c4', beardDark: '#46424e', beardDeep: '#2a2834',
  line: '#3a2f45', lineLight: '#6a6080',
  white: '#d8d6de', iris: '#6f8496', irisDark: '#2a3440', irisLight: '#a8bccc',
};

function face3(doc, e = {}, opt = {}) {
  const E = K.expr(e);
  const d0 = doc.defs.length;
  const sc = opt.sc || 0.19;
  const lw = (px) => px / sc;
  const J = (p) => K.jawPt(p, E.jaw, 770, 1020, 10);
  const JJ = (a) => a.map(J);
  let s = '';
  const skinPts = JJ([
    [-80, 22], [100, 14], [226, 80], [296, 200], [322, 320], [334, 404], [318, 462], [322, 520], [338, 572], [328, 640],
    [316, 720], [318, 800], [316, 880], [300, 950], [262, 1000], [190, 1022], [100, 1014], [0, 982], [-110, 922],
    [-190, 852], [-214, 770], [-226, 700], [-330, 680], [-430, 540], [-452, 340], [-382, 150], [-240, 50],
  ]);
  const skin = path(skinPts, true);
  s += P(skin, C.base);
  let sh = '';
  // soft volumetric moonlight from high upper-left: dome and top planes glow, the form turns away below/right
  sh += soft(doc, ellipse(-60, 160, 330, 220), C.light, 60, 0.85);
  sh += soft(doc, ellipse(-90, 90, 170, 90), C.hi, 40, 0.6);
  sh += crescent(doc, skin, [-70, -110], C.shadow, 30, 0.75);
  sh += crescent(doc, skin, [-30, -50], C.deep, 18, 0.45);
  // deep eye sockets under the heavy brow (moon is high)
  sh += soft(doc, path([[-60, 450], [40, 436], [150, 444], [222, 470], [236, 520], [190, 534], [120, 526], [40, 530], [-30, 520]], true), C.shadow, 10, 0.9);
  sh += soft(doc, path([[236, 452], [330, 450], [334, 530], [258, 530]], true), C.deep, 10, 0.75);
  // brow ridge, cheekbone tops, nose bridge lit
  sh += soft(doc, path([[-60, 420], [60, 398], [180, 404], [236, 428], [180, 418], [60, 414], [-50, 436]], true), C.hi, 6, 0.75);
  sh += soft(doc, path([[-200, 560], [-90, 540], [40, 548], [130, 574], [40, 584], [-100, 590]], true), C.light, 12, 0.7);
  // hollow under the cheekbone and the side plane turning toward the ear
  sh += soft(doc, path([[-210, 630], [-80, 618], [60, 640], [150, 690], [80, 720], [-60, 700], [-200, 690]], true), C.shadow2, 22, 0.55);
  sh += soft(doc, path([[-340, 420], [-220, 400], [-200, 560], [-230, 690], [-330, 680]], true), C.shadow2, 30, 0.5);
  // nose cast shadow down-right across the far cheek, under-nose
  sh += soft(doc, path([[282, 600], [330, 620], [348, 700], [320, 760], [290, 740], [280, 680]], true), C.shadow, 8, 0.75);
  // age: forehead creases, crow's feet, eye bags
  for (const [y, a] of [[262, 0.5], [300, 0.6], [338, 0.5]]) {
    sh += P(taper([[-90, y + 10], [20, y - 6], [130, y - 2], [210, y + 10]], [0, lw(1.4), lw(1.4), 0]), C.shadow, `opacity="${a}"`);
    sh += P(taper([[-90, y + 3], [20, y - 13], [130, y - 9], [210, y + 3]], [0, lw(1.2), lw(1.2), 0]), C.hi, `opacity="${a * 0.7}"`);
  }
  // warm brazier bounce on the low right edges, cyan rim on the far contour
  sh += crescent(doc, skin, [-10, -16], C.bounce, 6, 0.55);
  sh += crescent(doc, skin, [-11, 3], C.rim, 1.5, 0.7);
  sh += crescent(doc, skin, [-4, 1], C.rimHot, 0.8, 0.35);
  // scalp sheen (moon specular on the bald dome)
  sh += soft(doc, path([[-200, 70], [-80, 40], [40, 46], [-40, 74], [-170, 98]], true), '#ffffff', 10, 0.7);
  s += inside(doc, skin, sh);

  s += P(taper(JJ([[226, 80], [296, 200], [322, 320], [334, 404], [318, 462], [322, 520], [338, 572], [328, 640], [316, 720]]), [lw(0.3), lw(0.8), lw(1.2), lw(1.4), lw(1.2), lw(1.2), lw(1), lw(0.9), lw(0.6)]), C.line);
  s += earSvg(doc, E, lw);
  s += beardSvg(doc, E, lw, J);
  s += noseSvg(doc, E, lw);
  s += eyesSvg(doc, E, lw);
  s += mouthSvg(doc, E, lw, J);
  s += scarSvg(doc, E, lw);
  // thin coloured contour: darker in shadow, fades on the lit dome
  s += P(taper(JJ([[-226, 700], [-214, 770], [-190, 852], [-110, 922], [0, 982]]), [lw(0.6), lw(1.6), lw(1.8), lw(1.8), lw(1.2)]), C.beardDeep, 'opacity="0.8"');
  s += P(taper([[-330, 680], [-430, 540], [-452, 340], [-382, 150], [-240, 50], [-80, 22], [100, 14], [226, 80]], [lw(1.6), lw(1.6), lw(1.2), lw(0.7), lw(0.4), lw(0.3), lw(0.4), lw(0.3)]), C.line, 'opacity="0.85"');
  if (E.sweat) s += sweat(doc, lw);
  const wf = L.compressX(110, 0.8, 90);
  for (let i = d0; i < doc.defs.length; i++) doc.defs[i] = L.warpSvg(doc.defs[i], wf);
  return L.warpSvg(s, wf);
}

function earSvg(doc, E, lw) {
  // big ear (age), sits in the half-shadow of the side plane
  const pts = [[-236, 610], [-232, 520], [-252, 452], [-300, 424], [-352, 442], [-378, 500], [-372, 580], [-350, 650], [-322, 712], [-290, 742], [-262, 734], [-250, 690]];
  const outer = path(pts, true);
  let s = soft(doc, path([[-250, 460], [-226, 600], [-250, 740], [-290, 760], [-262, 650]], true), C.deep, 8, 0.4);
  s += P(outer, C.base);
  let sh = '';
  sh += soft(doc, ellipse(-330, 470, 46, 40), C.light, 14, 0.7);
  sh += crescent(doc, outer, [-20, -24], C.shadow, 8, 0.6);
  sh += P(taper([[-262, 462], [-304, 446], [-346, 466], [-360, 530], [-354, 600], [-334, 660]], [0, lw(4), lw(6), lw(5.5), lw(4), 0]), C.shadow2, 'opacity="0.8"');
  sh += soft(doc, path([[-262, 560], [-292, 542], [-318, 572], [-312, 632], [-280, 652], [-258, 618]], true), C.shadow, 5, 0.8);
  sh += soft(doc, path([[-268, 580], [-290, 570], [-302, 592], [-296, 622], [-276, 630]], true), C.deep, 4, 0.6);
  sh += P(taper([[-302, 486], [-326, 530], [-324, 590], [-306, 638], [-288, 662]], [0, lw(2.8), lw(3), lw(2), 0]), C.light, 'opacity="0.8"');
  sh += soft(doc, ellipse(-290, 714, 26, 22), C.blush, 8, 0.5);
  sh += crescent(doc, outer, [-6, -10], C.bounce, 3, 0.4);
  s += inside(doc, outer, sh);
  s += P(taper(pts.concat([pts[0]]), [lw(0.4), lw(0.6), lw(0.8), lw(0.9), lw(1.1), lw(1.3), lw(1.4), lw(1.4), lw(1.4), lw(1.3), lw(1.1), lw(0.8), lw(0.4)]), C.line);
  s += P(taper([[-262, 558], [-292, 544], [-316, 572], [-312, 628]], [0, lw(1), lw(0.9), 0]), C.line, 'opacity="0.8"');
  return s;
}

function noseSvg(doc, E, lw) {
  const fl = E.flare || 0;
  // big nose, broad bridge, bulbous tip with an old crook
  const pts = [[234, 470], [256, 520], [278, 562], [300, 606], [332, 640], [362, 664], [374, 696], [360, 724], [318, 734], [276, 732], [242, 734], [204 - fl, 718], [196 - fl, 678], [206, 640], [204, 560], [214, 500]];
  const nose = path(pts, true);
  let s = P(nose, C.base);
  let sh = '';
  sh += soft(doc, path([[210, 480], [244, 480], [272, 550], [310, 616], [352, 660], [330, 676], [270, 640], [222, 570]], true), C.light, 6, 0.8);
  sh += P(taper([[246, 500], [268, 548], [296, 598], [330, 638], [354, 660]], [0, lw(2), lw(3), lw(2.6), lw(1)]), C.hi, 'opacity="0.85"');
  sh += soft(doc, ellipse(340, 668, 18, 13, -0.4), C.hi, 4, 0.9);
  sh += soft(doc, path([[256, 470], [278, 562], [302, 606], [334, 640], [366, 668], [380, 700], [420, 700], [420, 460]], true), C.shadow, 6, 0.75);
  sh += soft(doc, path([[274, 714], [328, 708], [370, 700], [360, 728], [318, 736], [272, 736]], true), C.deep, 4, 0.8);
  sh += soft(doc, path([[198 - fl, 678], [212, 666], [232, 674], [236, 712], [210, 720], [200 - fl, 708]], true), C.shadow2, 5, 0.55);
  sh += soft(doc, path([[200, 690], [260, 720], [360, 726], [360, 740], [200, 740]], true), C.bounce, 6, 0.35);
  sh += inside(doc, path([[300, 600], [440, 600], [440, 760], [300, 760]], true), crescent(doc, nose, [-11, 4], C.rim, 1, 0.95));
  s += inside(doc, nose, sh);
  s += P(path([[248, 722], [268, 710], [296, 714], [306, 724], [282, 730], [256, 730]], true), C.deep);
  s += P(taper([[278, 556], [290, 570]], [0, lw(1.4), 0]), C.line, 'opacity="0.6"');
  s += P(taper([[330, 640], [362, 664], [374, 696], [360, 724], [330, 734]], [0, lw(1), lw(1.3), lw(1.2), 0]), C.line);
  s += P(taper([[216, 654], [198 - fl, 678], [204 - fl, 714], [234, 732]], [0, lw(1.3), lw(1.4), 0]), C.line);
  return s;
}

function eyesSvg(doc, E, lw) {
  let s = '';
  const st = {
    white: C.white, whiteShadow: '#6e6a80', iris: C.iris, irisDark: C.irisDark, irisLight: C.irisLight, pupil: '#0e1218',
    catch: '#f4fbff', caruncle: '#a86a70', lash: C.line, lashW: lw(2.2), lowLine: C.line, lowW: lw(0.9), rimLow: '#c8a8a8', lidCast: 12, soft: true,
  };
  const oN = E.lidN, oF = E.lidF;
  const nE = K.eye(doc, { a: [6, 504 - E.cheekN * 0.3], b: [134, 498], up: 27, low: 12 - E.lowN, open: oN, upSkew: 0.5, lowSkew: 0.46, iris: [62 + E.gaze[0], 501 + E.gaze[1]], ir: 23, irx: 0.88, pupil: E.pupil }, st);
  s += nE.svg;
  // hooded lid fold overhanging the lash line + eye bags + crow's feet
  s += P(taper([[-10, 488], [30, 466 - 18 * (oN - 1)], [86, 460 - 20 * (oN - 1)], [140, 470 - 12 * (oN - 1)], [160, 488]], [0, lw(1.4), lw(1.6), lw(1.2), 0]), C.line, 'opacity="0.8"');
  s += soft(doc, path([[-6, 486], [60, 470 - 16 * (oN - 1)], [150, 482], [140, 476], [60, 460 - 18 * (oN - 1)], [0, 476]], true), C.light, 3, 0.55);
  s += P(taper([[20, 532 - E.lowN * 0.5], [76, 542 - E.lowN * 0.6], [128, 530 - E.lowN * 0.5]], [0, lw(1), 0]), C.line, 'opacity="0.6"');
  s += P(taper([[30, 556], [86, 566], [134, 552]], [0, lw(0.9), 0]), C.line, 'opacity="0.4"');
  for (const [dy, l] of [[-10, 34], [6, 40], [22, 30]]) s += P(taper([[-6, 500 + dy * 0.3], [-6 - l, 500 + dy]], [lw(1), 0]), C.line, 'opacity="0.55"');
  const fE = K.eye(doc, { a: [318, 506], b: [246, 500], up: 24, low: 10 - E.lowF, open: oF, upSkew: 0.42, lowSkew: 0.5, iris: [270 + E.gaze[0] * 0.6, 503 + E.gaze[1]], ir: 22, irx: 0.55, pupil: E.pupil }, Object.assign({}, st, { lashW: lw(2), white: '#a8a4b4', catchOff: [-4, -8] }));
  const bridgeClip = path([[236, 300], [400, 300], [400, 700], [262, 700], [250, 560], [238, 470]], true);
  s += inside(doc, bridgeClip, fE.svg + P(taper([[250, 476], [284, 462 - 16 * (oF - 1)], [322, 480]], [0, lw(1.2), 0]), C.line, 'opacity="0.75"'));
  // bushy grey brows, tails drooping
  const bn = E.browN, bf = E.browF;
  const nb = [[200, 456 - bn[0]], [150, 438 - bn[0] * 0.8], [90, 426 - (bn[0] + bn[1]) / 2], [26, 432 - bn[1] * 0.9], [-46, 454 - bn[1]]];
  const fb = [[268, 452 - bf[0]], [296, 441 - (bf[0] + bf[1]) / 2], [322, 447 - bf[1]]];
  s += P(taper(nb, [lw(6), lw(7), lw(6.4), lw(5), lw(2)]), C.beardDark, 'opacity="0.9"');
  s += K.hairBand(doc, nb.map((p, i) => [p, [16, 18, 16, 13, 6][i]]), { count: 110, color: [C.beard, C.beardLight, C.beardDark], width: lw(1), len: 36, angle: (t) => -0.1 - t * 0.5, jitter: 0.5, seed: 31 });
  s += P(taper(fb, [lw(5), lw(5), lw(2)]), C.beardDark);
  s += K.hairBand(doc, fb.map((p, i) => [p, [10, 9, 5][i]]), { count: 30, color: [C.beard, C.beardDark], width: lw(1), len: 26, angle: -0.3, jitter: 0.4, seed: 32 });
  return s;
}

function mouthSvg(doc, E, lw, J) {
  let s = '';
  const open = E.open, cN = E.cornN, cF = E.cornF;
  const nC = [126 - (E.wide - 1) * 60, 808 - cN], fC = [308 + (E.wide - 1) * 10, 810 - cF];
  const lo = open * 120;
  const mid = [fC, [294, 806 - cF * 0.4], [262, 804], [200, 805 - cN * 0.3], [150, 807 - cN * 0.6], nC];
  const lowerOuter = [fC, [300, 828 + lo * 0.8], [268, 842 + lo], [200, 840 + lo * 0.95], [150, 828 + lo * 0.6], nC].map(J);
  const innerLow = [[150, 818 + lo * 0.55], [200, 828 + lo * 0.85], [268, 830 + lo * 0.9], [300, 820 + lo * 0.7]].map(J);
  if (open > 0.02) {
    const innerUp = [nC, [160, 800 - cN * 0.4], [230, 794], [290, 796], fC];
    const mi = path(innerUp.concat(innerLow.slice().reverse()), true);
    s += P(mi, '#241418');
    let ins = '';
    if (E.teeth === 'both' || E.teeth === 'upper') {
      const ty = 796;
      ins += P(path([[124, ty - 8], [320, ty - 8], [318, ty + 6], [124, ty + 6]], true), '#8a4a50');
      ins += P(path([[130, ty], [176, ty + 2], [230, ty + 1], [316, ty - 1], [312, ty + 26], [262, ty + 27], [200, ty + 28], [130, ty + 24]], true), '#ddd4c0');
      ins += soft(doc, path([[120, ty], [170, ty], [160, ty + 40], [120, ty + 40]], true), '#5a4048', 6, 0.7);
      for (const [x, w] of [[160, 0.9], [192, 1.1], [222, 1.2], [248, 1.1], [272, 0.9], [294, 0.8]]) ins += P(taper([[x, ty + 1], [x + 1.5, ty + 25]], [lw(0.6 * w), lw(1.1 * w), lw(0.5)]), '#94887a');
    }
    if (E.teeth === 'both') {
      const ty2 = 826 + lo * 0.7;
      ins += P(path([[136, ty2 - 14], [200, ty2 - 16], [306, ty2 - 18], [304, ty2 + 30], [136, ty2 + 30]].map(J), true), '#cfc6b2');
      for (const x of [176, 204, 232, 258, 282]) ins += P(taper([[x, ty2 - 16], [x + 1, ty2 + 2]].map(J), [lw(1), lw(0.9), 0]), '#84786a');
      ins += P(taper([[128, ty2 - 15], [200, ty2 - 17], [318, ty2 - 19]].map(J), lw(2.4)), '#3a2026', 'opacity="0.85"');
      ins += soft(doc, path([[120, ty2 - 20], [168, ty2 - 20], [160, ty2 + 30], [120, ty2 + 30]].map(J), true), '#5a4048', 6, 0.7);
    }
    s += inside(doc, mi, ins);
  }
  const lowD = path(lowerOuter.concat(open > 0.02 ? innerLow : mid.slice(1, -1)), true);
  s += P(lowD, '#a07078');
  s += inside(doc, lowD, soft(doc, ellipse(206, 828 + lo * 0.9, 36, 8), C.light, 4, 0.7) + crescent(doc, lowD, [-6, -10], C.shadow, 4, 0.6));
  s += P(taper(mid, [lw(1.4), lw(1.3), lw(1.2), lw(1.4), lw(1.8), lw(2)]), C.line);
  if (open > 0.02) s += P(taper(lowerOuter.slice(1, -1), [0, lw(1), lw(1.2), lw(1), 0]), C.line, 'opacity="0.7"');
  return s;
}

function beardSvg(doc, E, lw, J) {
  // short cropped grey beard: jaw, chin and moustache; cheeks clear above the line
  const cN = E.cornN, lo = E.open * 120;
  const pts = [[-224, 636], [-150, 656], [-40, 688], [80, 716], [176, 752], [206, 726], [264, 742], [318, 750], [320, 800], [316, 880], [300, 950], [262, 1000], [190, 1022], [100, 1014], [0, 982], [-110, 922], [-190, 852], [-214, 770], [-226, 700]].map(J);
  const d = path(pts, true);
  let s = P(d, C.beard);
  let sh = '';
  sh += soft(doc, ellipse(-60, 760, 220, 120), C.beardLight, 40, 0.55);
  sh += crescent(doc, d, [-60, -80], C.beardDark, 20, 0.75);
  sh += crescent(doc, d, [0, -46], C.beardDeep, 14, 0.6);
  sh += soft(doc, path(([[120, 830 + lo], [240, 850 + lo], [310, 850 + lo], [320, 900 + lo], [200, 900 + lo]]).map(J), true), C.beardDark, 10, 0.6);
  // stubble texture
  sh += K.hairBand(doc, [[[-200, 720], 70], [[-100, 830], 90], [[40, 900], 90], [[180, 930], 80], [[270, 880], 70]].map(([p, w]) => [J(p), w]), { count: 360, color: ['#9a96a2', '#7a7684', '#a8a6b2'], width: lw(0.6), len: 12, angle: (t) => 1.9 - t * 0.6, jitter: 0.5, seed: 41, op: 0.5 });
  sh += soft(doc, path([[-200, 700], [-60, 730], [80, 760], [180, 790], [100, 820], [-80, 790]].map(J), true), C.beardLight, 18, 0.35);
  sh += crescent(doc, d, [-10, -14], C.bounce, 5, 0.5);
  sh += crescent(doc, d, [-12, -4], C.rim, 1.2, 0.85);
  s += inside(doc, d, sh);
  // moustache over the upper lip
  const mo = path([[118, 812 - cN], [150, 784], [210, 760], [262, 748], [300, 754], [322, 790], [312, 812], [290, 800], [240, 798], [180, 806], [140, 820 - cN]], true);
  s += P(mo, C.beard);
  s += inside(doc, mo, soft(doc, ellipse(220, 770, 80, 18), C.beardLight, 8, 0.7) +
    K.hairBand(doc, [[[140, 800], 10], [[210, 782], 16], [[270, 770], 14], [[310, 790], 8]], { count: 90, color: [C.beardLight, C.beardDark, C.beard], width: lw(1), len: 30, angle: (t) => 2.1 - t * 0.6, jitter: 0.3, seed: 43 }) +
    crescent(doc, mo, [-8, 3], C.rim, 1, 0.8));
  // soft beard edge on the cheek (no hard line)
  // wispy edge strands where the beard meets the cheek
  s += K.hairBand(doc, [[[-220, 640], 8], [[-100, 668], 9], [[30, 700], 9], [[150, 740], 8]].map(([p, w]) => [J(p), w]), { count: 70, color: ['#7a7684', '#a8a6b2'], width: lw(0.7), len: 18, angle: 1.4, jitter: 0.5, seed: 44, op: 0.7 });
  return s;
}

function scarSvg(doc, E, lw) {
  // long scar: forehead -> through the near brow -> skips the eye -> onto the cheek
  const pA = [[54, 300], [58, 360], [62, 420], [64, 452]];
  const pB = [[66, 548], [76, 600], [96, 652]];
  let s = '';
  for (const p of [pA, pB]) {
    s += P(taper(p.map((q) => [q[0] + 4, q[1] + 2]), [0, lw(4), lw(4), 0]), C.shadow, 'opacity="0.45"');
    s += P(taper(p, [0, lw(3), lw(3.2), 0]), '#b88486');
    s += P(taper(p.map((q) => [q[0] - 2, q[1]]), [0, lw(1), lw(1), 0]), '#ecc8cc', 'opacity="0.65"');
  }
  return s;
}

function sweat(doc, lw) {
  let s = '';
  for (const [x, y, k] of [[250, 260, 1], [-60, 340, 0.8], [330, 380, 0.7]]) {
    const d = path([[x, y], [x + 16 * k, y + 34 * k], [x + 10 * k, y + 56 * k], [x - 10 * k, y + 56 * k], [x - 14 * k, y + 34 * k]], true);
    s += P(d, '#d4f2ff', 'opacity="0.9"') + P(taper([[x, y], [x - 14 * k, y + 34 * k], [x - 8 * k, y + 56 * k]], [0, lw(1.2), 0]), C.line);
  }
  return s;
}

module.exports = { face3, C };
