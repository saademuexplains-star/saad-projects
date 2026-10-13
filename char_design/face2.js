// Character 2 head: lean showman. Fine ink lines + crisp cel shadows, golden-hour backlight (sun back-right), cool sky fill front-left.
'use strict';
const L = require('./lib');
const K = require('./facekit');
const { path, taper, P, inside, soft, crescent, ellipse, lerp } = L;

const C = {
  base: '#d0956a', light: '#ecb680', hi: '#ffdcae', shadow: '#8c5c55', shadow2: '#a26c5e', deep: '#56343a',
  rim: '#ffc35a', rimHot: '#fff3c8', bounce: '#e8995c', blush: '#cf7462',
  lip: '#a5605a', lipDark: '#6b3537', lipLight: '#c98476',
  hair: '#24181a', hairMid: '#3f2c29', hairLight: '#6a5157', hairSheen: '#a796a6', hairRim: '#ffb84f',
  line: '#2a1512', lineWarm: '#8a4520', band: '#b45a2b', bandDark: '#6c2c16', bandLight: '#e08a4a',
  white: '#ebe0d6', whiteShadow: '#a48c88', iris: '#6f4a22', irisDark: '#2a190d', irisLight: '#c99a45',
};

function face2(doc, e = {}, opt = {}) {
  const E = K.expr(e);
  const sc = opt.sc || 0.19;
  const lw = (px) => px / sc;
  const J = (p) => K.jawPt(p, E.jaw, 770, 1000, 10);
  const JJ = (arr) => arr.map(J);
  let s = '';

  // skin silhouette
  const skinPts = JJ([
    [-40, 40], [120, 52], [236, 130], [292, 248], [314, 352], [320, 408], [311, 462], [317, 505], [331, 552],
    [323, 615], [303, 686], [299, 760], [301, 826], [291, 886], [271, 946], [240, 990], [192, 1008], [112, 1002],
    [24, 972], [-84, 910], [-168, 852], [-198, 776], [-220, 700], [-318, 690], [-420, 520], [-430, 330], [-320, 120], [-160, 44],
  ]);
  const skin = path(skinPts, true);

  // back hair (behind skull)
  const hairBack = path([[-140, -40], [80, -50], [230, 10], [290, 130], [-120, 330], [-300, 560], [-340, 690], [-430, 650], [-500, 470], [-500, 250], [-410, 40]], true);
  s += P(hairBack, C.hair);

  // ---------- skin ----------
  s += P(skin, C.base);
  let sh = '';
  // light-side form: warm sun on the front planes, soft core toward the terminator
  sh += soft(doc, ellipse(250, 420, 170, 330), C.light, 50, 0.7);
  sh += soft(doc, ellipse(120, 600, 90, 120), C.light, 40, 0.35);
  // ===== cel shadow (cool sky fill) — short lighting: the near side plane turns away from the sun =====
  const side = path(JJ([[-640, -200], [-70, -200], [-74, 140], [-66, 260], [-58, 360], [-46, 420], [-34, 500], [-34, 590], [4, 676], [64, 738],
    [108, 792], [126, 862], [146, 942], [176, 1004], [210, 1040], [-640, 1200]]), true);
  const socket = path([[-46, 404], [60, 430], [140, 440], [206, 466], [224, 506], [200, 514], [150, 508], [120, 524], [60, 526], [0, 518], [-40, 502]], true);
  const noseSh = path([[200, 500], [224, 506], [220, 580], [216, 662], [202, 704], [150, 718], [90, 708], [46, 692], [60, 680], [110, 690], [158, 680], [186, 640], [194, 580], [190, 520]], true);
  const under = path(JJ([[176, 838 + E.open * 120], [244, 856 + E.open * 120], [296, 844 + E.open * 120], [292, 870 + E.open * 120], [236, 880 + E.open * 120], [184, 860 + E.open * 120]]), true);
  const philtrum = path(JJ([[226, 712], [270, 716], [262, 744], [236, 752], [214, 738]]), true);
  let cel = P(side, C.shadow) + P(socket, C.shadow) + P(noseSh, C.shadow) + P(under, C.shadow) + P(philtrum, C.shadow);
  sh += `<g opacity="0.93">${cel}</g>`;
  // subsurface glow: saturated warm band on the shadow side of the terminator
  const term = JJ([[-74, 140], [-66, 260], [-58, 360], [-46, 420], [-34, 500], [-34, 590], [4, 676], [64, 738], [108, 792], [126, 862], [146, 942], [176, 1004]]);
  sh += soft(doc, taper(term.map((p) => [p[0] - 14, p[1]]), lw(5)), '#b8644a', 6, 0.55);
  // shadow gets darker toward the back of the head and the jaw angle, lighter on the cheek (sky fill)
  sh += soft(doc, ellipse(-60, 590, 110, 150), '#a37769', 40, 0.45);
  // second layer in the shadow: deeper occlusion (eye corner, jaw angle, under ear, nostril area)
  sh += soft(doc, path([[150, 470], [210, 476], [222, 520], [190, 530], [158, 512]], true), C.deep, 6, 0.6);
  sh += soft(doc, path(JJ([[-220, 690], [-160, 700], [-120, 800], [-150, 860], [-210, 790]]), true), C.deep, 14, 0.45);
  sh += soft(doc, path(JJ([[-170, 852], [24, 972], [192, 1008], [200, 1030], [-200, 900]]), true), C.deep, 6, 0.55);
  // cool sky fill on upward planes inside the shadow (top of cheekbone, brow ridge side)
  sh += soft(doc, path([[-160, 560], [-60, 540], [-36, 570], [-120, 600]], true), '#b48a96', 12, 0.5);
  sh += soft(doc, path([[-300, 300], [-120, 260], [-80, 330], [-260, 380]], true), '#a98290', 18, 0.35);
  // warm bounce from the sand on the undersides inside the shadow
  sh += crescent(doc, skin, [6, -18], C.bounce, 5, 0.5);
  sh += soft(doc, path(JJ([[-150, 860], [-40, 920], [60, 960], [20, 990], [-90, 940]]), true), C.bounce, 10, 0.35);
  // cheek hollow (lean) on the lit part + nasolabial fold
  sh += soft(doc, path([[40, 690], [120, 720], [150, 770], [110, 760], [60, 730]], true), C.shadow2, 8, 0.45);
  sh += soft(doc, path(JJ([[226, 714], [204, 744], [176, 790], [158, 824], [174, 822], [198, 784], [220, 748], [240, 718]]), true), C.shadow, 2, 0.6);
  // highlights where the sun hits squarely (crisp)
  sh += soft(doc, path([[90, 200], [200, 210], [270, 280], [250, 340], [150, 320], [60, 280]], true), C.hi, 14, 0.55);
  sh += P(taper([[30, 400], [120, 392], [200, 408], [258, 432]], [0, lw(2.6), lw(2.8), 0]), C.hi, 'opacity="0.8"');
  sh += soft(doc, path([[240, 540], [300, 520], [326, 556], [300, 600], [250, 600]], true), C.hi, 8, 0.6);
  sh += soft(doc, path([[30, 560], [100, 550], [150, 590], [100, 640], [50, 620]], true), C.hi, 10, 0.4);
  sh += soft(doc, ellipse(225, 950 + E.jaw * 0.9, 30, 22, -0.3), C.hi, 6, 0.55);
  // blush (subtle): nose zone, cheek, ear
  sh += soft(doc, ellipse(120, 640, 90, 50), C.blush, 26, 0.25);
  // 5 o'clock shadow: flat cool tint, soft edge
  const stub = path(JJ([[-198, 770], [-110, 712], [20, 728], [150, 776], [230, 748], [300, 742], [305, 840], [292, 920], [242, 990], [112, 1002], [-84, 910], [-168, 852]]), true);
  sh += soft(doc, stub, '#4f4a66', 14, 0.22);
  // hot golden rim on the far contour (sun back-right)
  sh += crescent(doc, skin, [-16, 3], C.rim, 1, 1);
  sh += crescent(doc, skin, [-6, 1], C.rimHot, 0.6, 1);
  s += inside(doc, skin, sh);

  // far contour line (drawn before the nose so the nose overlaps it)
  const farLine = JJ([[236, 130], [292, 248], [314, 352], [320, 408], [311, 462], [317, 505], [331, 552], [323, 615], [303, 686], [299, 760], [301, 826], [291, 886], [271, 946], [240, 990]]);
  s += P(taper(farLine, [lw(0.4), lw(1), lw(1.4), lw(1.1), lw(1.3), lw(1.2), lw(0.8), lw(1), lw(0.7)]), C.lineWarm);
  const jawLine = JJ([[-220, 700], [-200, 780], [-168, 852], [-84, 910], [24, 972], [112, 1002], [192, 1008], [240, 990]]);
  s += P(taper(jawLine, [lw(1), lw(2), lw(2.4), lw(2.3), lw(1.9), lw(1.4), lw(0.8), lw(0.3)]), C.line);

  s += earSvg(doc, E, lw);
  s += noseSvg(doc, E, lw);
  s += eyesSvg(doc, E, lw);
  s += mouthSvg(doc, E, lw, J);
  s += beardSvg(doc, E, lw, J);
  s += hairFront(doc, E, lw);
  if (E.sweat) s += sweatSvg(doc, lw);
  return s;
}

function earSvg(doc, E, lw) {
  const pts = [[-238, 600], [-232, 520], [-246, 462], [-288, 440], [-334, 462], [-354, 525], [-348, 600], [-326, 660], [-302, 712], [-276, 726], [-256, 706], [-246, 662]];
  const outer = path(pts, true);
  let s = '';
  s += soft(doc, path([[-250, 470], [-230, 600], [-250, 720], [-290, 740], [-260, 650]], true), C.deep, 6, 0.35);
  // the ear sits on the shadow side: shadow tone, with sky fill on its top/back rim and warm bounce on the lobe
  s += P(outer, C.shadow);
  let sh = '';
  sh += soft(doc, ellipse(-310, 520, 36, 80), '#a77d86', 12, 0.7);
  sh += P(taper([[-258, 470], [-296, 456], [-332, 478], [-341, 535], [-334, 600], [-314, 652]], [0, lw(4), lw(6), lw(5), lw(3.5), 0]), C.deep, 'opacity="0.75"');
  sh += P(path([[-258, 560], [-286, 544], [-308, 572], [-302, 624], [-274, 644], [-254, 612]], true), C.deep, 'opacity="0.9"');
  sh += P(taper([[-296, 490], [-316, 530], [-314, 584], [-298, 628], [-282, 652]], [0, lw(2.4), lw(2.8), lw(1.8), 0]), '#b08690', 'opacity="0.85"');
  sh += soft(doc, ellipse(-290, 694, 26, 22), '#b56a62', 8, 0.6);
  sh += crescent(doc, outer, [5, -10], C.bounce, 2, 0.5);
  s += inside(doc, outer, sh);
  s += P(taper([[-246, 662], [-238, 600], [-232, 520], [-246, 462], [-288, 440], [-334, 462], [-354, 525], [-348, 600], [-326, 660], [-302, 712], [-276, 726], [-256, 706]], [lw(0.5), lw(0.8), lw(1), lw(1.3), lw(1.5), lw(1.7), lw(1.7), lw(1.6), lw(1.5), lw(1.4), lw(1.2), lw(0.8)]), C.line);
  s += P(taper([[-296, 492], [-318, 534], [-316, 590], [-300, 632], [-280, 650]], [0, lw(0.9), lw(1), lw(0.7), 0]), C.line, 'opacity="0.8"');
  s += P(taper([[-258, 560], [-286, 546], [-306, 574]], [0, lw(0.9), 0]), C.line, 'opacity="0.8"');
  return s;
}

function noseSvg(doc, E, lw) {
  const fl = E.flare || 0;
  const nosePts = [[232, 470], [262, 522], [298, 575], [330, 624], [357, 657], [367, 680], [355, 704], [323, 714], [286, 716], [262, 714], [240, 716], [214 - fl, 700], [214 - fl, 668], [210, 610], [205, 540], [215, 490]];
  const nose = path(nosePts, true);
  let s = P(nose, C.base);
  let sh = '';
  // lit front/top of the nose (sun from the right)
  sh += soft(doc, path([[232, 470], [262, 522], [298, 575], [334, 628], [366, 680], [330, 690], [270, 640], [236, 560]], true), C.light, 4, 0.9);
  // near side plane of the nose: shadow (merges with the face's socket/nose shadow)
  sh += P(path([[200, 470], [228, 480], [236, 560], [262, 630], [290, 676], [300, 700], [262, 716], [200, 716], [196, 560]], true), C.shadow, 'opacity="0.93"');
  // bridge highlight along the hump and a hot tip highlight
  sh += P(taper([[244, 494], [270, 534], [300, 580], [328, 622], [350, 652]], [0, lw(1.8), lw(2.8), lw(2.4), lw(0.8)]), C.hi, 'opacity="0.95"');
  sh += soft(doc, ellipse(342, 668, 13, 10, -0.4), '#fff0d6', 2, 1);
  // underside of the tip + columella
  sh += P(path([[288, 706], [330, 700], [364, 690], [356, 712], [322, 718], [286, 718]], true), C.shadow, 'opacity="0.9"');
  // ala: rounded wing (in shadow), sky fill on its top
  sh += soft(doc, path([[218 - fl, 662], [240, 652], [258, 664], [246, 676], [224, 676]], true), '#a98290', 4, 0.6);
  sh += P(path([[212 - fl, 664], [222, 656], [226, 690], [218, 708], [208 - fl, 700]], true), C.deep, 'opacity="0.7"');
  // rim only where the nose forms the silhouette
  sh += inside(doc, path([[300, 590], [420, 590], [420, 760], [300, 760]], true), crescent(doc, nose, [-12, 4], C.rim, 0.8, 1) + crescent(doc, nose, [-5, 2], C.rimHot, 0.5, 1));
  s += inside(doc, nose, sh);
  s += P(path([[250, 708], [266, 700], [288, 703], [298, 712], [278, 717], [256, 716]], true), C.deep);
  s += P(taper([[318, 606], [334, 630], [357, 657], [367, 680], [358, 702], [338, 712]], [0, lw(0.7), lw(1), lw(1.2), lw(1.1), lw(0.4)]), C.lineWarm);
  s += P(taper([[226, 648], [212 - fl, 668], [214 - fl, 698], [236, 714], [258, 715]], [0, lw(1.3), lw(1.6), lw(1.2), 0]), C.line);
  s += P(taper([[268, 701], [288, 703], [302, 712], [324, 717]], [0, lw(0.9), lw(1.1), 0]), C.line, 'opacity="0.8"');
  return s;
}

function eyesSvg(doc, E, lw) {
  let s = '';
  const st = {
    white: '#d9cbc6', whiteShadow: '#8f7a80', iris: C.iris, irisDark: C.irisDark, irisLight: C.irisLight, pupil: '#120a08',
    catch: '#fffaf0', caruncle: '#b56f6c', lash: C.line, lashW: lw(2.7), lowLine: C.line, lowW: lw(0.9), rimLow: '#c99a8e', lidCast: 12, soft: true,
  };
  // NEAR eye (in the socket shadow, iris catches the warm bounce)
  const oN = E.lidN, rN = E.lowN;
  const nE = K.eye(doc, {
    a: [-8, 497 - E.cheekN * 0.3], b: [142, 491], up: 38, low: 14 - rN, open: oN, upSkew: 0.5, lowSkew: 0.46,
    iris: [60 + E.gaze[0], 491 + E.gaze[1]], ir: 29, irx: 0.88, pupil: E.pupil,
  }, st);
  s += nE.svg;
  const ly = (y, k) => y - k * (oN - 1);
  s += P(taper([[-14, 478], [26, ly(448, 24)], [78, ly(438, 28)], [132, ly(450, 18)], [162, 476]], [0, lw(1), lw(1.3), lw(1), 0]), C.line, 'opacity="0.75"');
  s += P(taper([[30, 528 - rN * 0.6], [80, 536 - rN * 0.7], [128, 524 - rN * 0.6]], [0, lw(0.8), 0]), C.deep, 'opacity="0.8"');
  // FAR eye (lit by the sun), clipped by the bridge
  const oF = E.lidF, rF = E.lowF;
  const fE = K.eye(doc, {
    a: [314, 500], b: [242, 494], up: 32, low: 11 - rF, open: oF, upSkew: 0.4, lowSkew: 0.5,
    iris: [266 + E.gaze[0] * 0.6, 494 + E.gaze[1]], ir: 27, irx: 0.55, pupil: E.pupil,
  }, Object.assign({}, st, { white: '#f1e6da', whiteShadow: '#b4978a', lashW: lw(2.3), catchOff: [-5, -9], irisLight: '#e8b552' }));
  const bridgeClip = path([[236, 300], [400, 300], [400, 700], [262, 700], [248, 560], [236, 470]], true);
  s += inside(doc, bridgeClip, fE.svg + P(taper([[250, 468], [282, 450 - 18 * (oF - 1)], [316, 472]], [0, lw(1), 0]), C.line, 'opacity="0.7"'));

  const bn = E.browN, bf = E.browF;
  const nb = [[198, 452 - bn[0]], [150, 434 - bn[0] * 0.8], [92, 412 - (bn[0] + bn[1]) / 2], [26, 412 - bn[1] * 0.9], [-46, 432 - bn[1]]];
  const fb = [[266, 446 - bf[0]], [294, 428 - (bf[0] + bf[1]) / 2], [322, 432 - bf[1]]];
  s += P(taper(nb, [lw(6), lw(6.6), lw(5.4), lw(3.4), lw(0.8)]), C.hair);
  s += K.hairBand(doc, nb.map((p, i) => [p, [14, 16, 13, 8, 3][i]]), { count: 90, color: [C.hairMid, C.hairLight, '#160d0c'], width: lw(0.9), len: 34, angle: (t) => -0.05 - t * 0.35, jitter: 0.35, seed: 4 });
  s += P(taper(fb, [lw(5), lw(5), lw(1.8)]), C.hair);
  s += K.hairBand(doc, fb.map((p, i) => [p, [9, 8, 4][i]]), { count: 26, color: [C.hairMid, '#7a5a50'], width: lw(0.9), len: 24, angle: -0.25, jitter: 0.3, seed: 7 });
  s += P(taper([[296, 424 - bf[1]], [322, 432 - bf[1]]], [0, lw(1.6), 0]), C.rim);
  return s;
}

function mouthSvg(doc, E, lw, J) {
  let s = '';
  const open = E.open, cN = E.cornN, cF = E.cornF;
  const nC = [138 - E.cheekN * 0.8, 797 - cN];
  const fC = [305, 798 - cF];
  const lo = open * 120;
  const upper = [nC, [190, 784 - cN * 0.45], [240, 774], [262, 767], [272, 772], [283, 768], [298, 782 - cF * 0.5], fC];
  const mid = [fC, [292, 793 - cF * 0.4], [270, 792], [220, 792 - cN * 0.25], [175, 793 - cN * 0.6], nC];
  const lowerOuter = [fC, [298, 816 + lo * 0.8], [272, 834 + lo], [222, 830 + lo * 0.95], [172, 816 + lo * 0.6 - cN * 0.3], nC].map(J);
  const innerLow = [[172, 806 + lo * 0.55 - cN * 0.3], [220, 816 + lo * 0.85], [270, 818 + lo * 0.9], [297, 806 + lo * 0.75]].map(J);
  if (open > 0.02) {
    const innerUp = [nC, [180, 797 - cN * 0.5], [240, 792], [290, 793], fC];
    const mi = path(innerUp.concat(innerLow.slice().reverse()), true);
    s += P(mi, '#2e1214');
    let ins = '';
    if (E.teeth === 'upper' || E.teeth === 'both') {
      const ty = 788, tH = 30;
      const teeth = path([[150, ty - 6], [306, ty - 6], [302, ty + tH], [272, ty + tH + 3], [226, ty + tH + 1], [178, ty + tH - 6], [150, ty + 8]], true);
      ins += P(teeth, '#eadfcd');
      ins += inside(doc, teeth,
        soft(doc, path([[140, ty - 8], [320, ty - 8], [320, ty + 8], [140, ty + 8]], true), '#9a7d6e', 3, 0.6) +
        soft(doc, path([[140, ty - 8], [200, ty - 8], [186, ty + 50], [140, ty + 50]], true), '#6e4f52', 6, 0.75) +
        soft(doc, path([[292, ty], [320, ty], [320, ty + 50], [296, ty + 50]], true), '#7a5a52', 4, 0.4));
      for (const x of [204, 230, 252]) ins += P(taper([[x, ty + 2], [x + 1, ty + tH - 4]], [lw(0.5), lw(0.7), 0]), '#a08070', 'opacity="0.8"');
      ins += P(path([[264, ty - 2], [271, ty - 2], [270.5, ty + tH + 2], [265, ty + tH + 1]], true), '#2e1214');
    }
    ins += soft(doc, ellipse(235, 836 + lo, 60, 16 + lo * 0.15), '#7e3436', 3, 0.9);
    s += inside(doc, mi, ins);
  }
  const up = path(upper.concat(mid.slice(1, -1)), true);
  s += P(up, '#8f5458');
  s += inside(doc, up, soft(doc, path([[250, 762], [300, 762], [312, 800], [270, 800]], true), '#b46e5e', 3, 0.7) +
    crescent(doc, up, [-5, 2], C.rim, 0.5, 0.8));
  const lowD = path(lowerOuter.concat(open > 0.02 ? innerLow : mid.slice(1, -1)), true);
  s += P(lowD, '#b9705f');
  s += inside(doc, lowD,
    soft(doc, path([[130, 790], [210, 790], [200, 850 + lo], [130, 850 + lo]], true), '#8a5560', 4, 0.75) +
    soft(doc, ellipse(244, 814 + lo * 0.9, 30, 7), '#f0b998', 3, 0.85) +
    crescent(doc, lowD, [0, -9], '#8d4f4f', 3, 0.6) +
    crescent(doc, lowD, [-5, 2], C.rim, 0.5, 0.8));
  s += P(taper(mid, [lw(1.4), lw(1.3), lw(1.1), lw(1.4), lw(1.9), lw(2.3)]), C.line);
  s += P(taper([[nC[0] + 4, nC[1] - 14], [nC[0] - 6, nC[1] - 2], [nC[0] - 1, nC[1] + 12]], [0, lw(1.2), 0]), C.line, 'opacity="0.7"');
  // smile: cheek bulge line beside the near corner
  if (cN > 8) s += P(taper([[nC[0] + 30, nC[1] - 60], [nC[0] - 14, nC[1] - 26], [nC[0] - 22, nC[1] + 6]], [0, lw(1.2), 0]), C.line, `opacity="${Math.min(0.75, cN / 30)}"`);
  if (open > 0.02) s += P(taper(innerLow, [0, lw(0.8), lw(0.9), 0]), C.line, 'opacity="0.6"');
  return s;
}

function beardSvg(doc, E, lw, J) {
  let s = '';
  const cN = E.cornN, cF = E.cornF;
  // thin moustache with upturned ends (the showman's signature)
  const mo = path([[124, 786 - cN * 0.9], [138, 794 - cN], [162, 780 - cN * 0.6], [212, 760], [256, 744], [282, 746], [302, 760], [314, 788 - cF], [310, 790 - cF], [298, 772], [266, 762], [222, 774], [170, 792 - cN * 0.6], [142, 802 - cN], [128, 796 - cN * 0.9]], true);
  s += P(mo, C.hair);
  s += inside(doc, mo,
    K.hairBand(doc, [[[140, 792 - cN], 5], [[210, 770], 8], [[262, 754], 7], [[304, 768], 5]], { count: 60, color: [C.hairMid, C.hairLight, C.hair], width: lw(0.8), len: 24, angle: (t) => 2.75 - t * 0.7, jitter: 0.25, seed: 11 }) +
    crescent(doc, mo, [-5, 3], C.hairRim, 0.6, 0.9));
  // small soul patch under the lip
  const sp = path(([[238, 852], [258, 850], [262, 880], [250, 900], [238, 880]]).map((p) => J([p[0], p[1] + E.open * 120])), true);
  s += soft(doc, sp, C.hairMid, 4, 0.6);
  return s;
}

function hairFront(doc, E, lw) {
  let s = '';
  // curly mass: bumpy silhouette, form-lit by the sun (right), cool on the left; covers the temple down to the ear
  const outline = [[-236, 470], [-262, 440], [-300, 380], [-380, 330], [-440, 250], [-470, 130], [-430, 10], [-330, -70], [-180, -110], [-20, -118], [130, -90], [236, -20], [296, 80], [312, 180], [298, 224], [212, 160], [60, 146], [-150, 172], [-200, 230], [-196, 330], [-200, 420]];
  const hm = K.curlyMass(doc, outline, {
    light: [0.8, -0.6], base: '#1b1214', mid: '#3a2724', lit: '#7a4a2c', sheen: '#e0a560', rim: C.hairRim, rimHot: C.rimHot,
    lw: lw(1), seed: 9, bumps: [14, 26], bumpW: 64, edgeFrom: 1, edgeTo: 15, clumps: 70, cr: 36,
    occl: soft(doc, path([[-330, 230], [-150, 168], [60, 140], [212, 150], [300, 210], [300, 240], [-330, 270]], true), '#0c0606', 10, 0.6),
  });
  s += hm.svg;
  // headband
  const band = path([[-330, 228], [-150, 164], [60, 136], [215, 144], [294, 182], [302, 226], [212, 200], [60, 196], [-140, 226], [-320, 294]], true);
  s += soft(doc, path([[-140, 228], [60, 198], [212, 202], [300, 228], [300, 250], [212, 226], [60, 224], [-140, 254]], true), C.deep, 3, 0.55);
  s += P(band, C.band);
  s += inside(doc, band,
    soft(doc, path([[-340, 180], [-60, 140], [-60, 320], [-340, 320]], true), C.bandDark, 30, 0.75) +
    soft(doc, path([[-330, 262], [300, 210], [300, 236], [-330, 304]], true), C.bandDark, 3, 0.8) +
    soft(doc, path([[0, 150], [210, 150], [290, 186], [210, 172], [0, 170]], true), C.bandLight, 4, 0.9) +
    [[-120, 172, -112, 224], [-20, 154, -12, 202], [110, 142, 118, 196], [190, 150, 198, 202]].map(([x1, y1, x2, y2]) => P(taper([[x1, y1 + 8], [(x1 + x2) / 2 + 4, (y1 + y2) / 2], [x2, y2 - 6]], [0, lw(1.2), 0]), C.bandDark, 'opacity="0.75"')).join('') +
    crescent(doc, band, [-10, 5], C.rim, 0.8, 1));
  s += P(taper([[-330, 228], [-150, 164], [60, 136], [215, 144], [294, 182]], [lw(0.6), lw(1.1), lw(1.1), lw(0.8), lw(0.3)]), C.line);
  s += P(taper([[302, 226], [212, 200], [60, 196], [-140, 226], [-320, 294]], [lw(0.5), lw(1.3), lw(1.6), lw(1.8), lw(1.2)]), C.line);
  for (const [cx, cy, r, d] of [[150, 196, 22, 1], [70, 204, 26, -1], [236, 200, 17, 1]]) {
    s += P(K.curlStroke([cx, cy + 3], r, 3.6, 1.1, d, lw(4)), '#0e0809', 'opacity="0.85"');
    s += P(K.curlStroke([cx, cy], r, 3.6, 1.1, d, lw(3.2)), C.hairMid);
    s += P(K.curlStroke([cx - 2, cy - 3], r * 0.9, 3.6 + 2.6 * d, 0.3, d, lw(1.1)), '#d79a55', 'opacity="0.7"');
  }
  return s;
}

function sampleArc(x, y, r, a0, a1) {
  const pts = [];
  for (let i = 0; i <= 8; i++) { const a = a0 + (a1 - a0) * i / 8; pts.push([x + Math.cos(a + 0.3) * r, y + Math.sin(a + 0.3) * r * 0.86]); }
  return pts;
}

function sweatSvg(doc, lw) {
  const d = path([[318, 300], [332, 330], [328, 352], [312, 352], [308, 330]], true);
  return P(d, '#bfe4f2', 'opacity="0.85"') + P(taper([[318, 300], [308, 330], [312, 352]], [0, lw(1), 0]), '#3a6a80');
}

module.exports = { face2, C };
