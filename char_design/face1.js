// Character 1 head: the brawler. Most stylized of the four: bold outlines, hard cel shadows,
// harsh torch key from front-left (slightly above), teal night rim from back-right.
'use strict';
const L = require('./lib');
const K = require('./facekit');
const { path, taper, P, inside, soft, crescent, ellipse, lerp } = L;

const C = {
  base: '#d98a55', light: '#f4ad6d', hi: '#ffd9a0', shadow: '#6e3b42', shadow2: '#8f4f45', deep: '#3a1c25',
  rim: '#4fd2cb', rimHot: '#c8fff7', bounce: '#c4673c', blush: '#d0603f',
  hair: '#1a1210', hairMid: '#2e221e', hairLight: '#5a4038',
  line: '#170a08', white: '#efe0cc', iris: '#4a3018', irisDark: '#1a0f08', irisLight: '#9a6a30',
};

const SC = (pts, c, k, ky = k) => pts.map((p) => [c[0] + (p[0] - c[0]) * k, c[1] + (p[1] - c[1]) * ky, p[2]]);
const NC = [270, 640], NK = 1.22;

function face1(doc, e = {}, opt = {}) {
  const E = K.expr(e);
  const d0 = doc.defs.length;
  const sc = opt.sc || 0.2;
  const lw = (px) => px / sc;
  const J = (p) => K.jawPt(p, E.jaw, 780, 1040, 14);
  const JJ = (a) => a.map(J);
  let s = '';
  // massive square head: small flat-top cranium, huge lower face, low jaw angle
  const skinPts = JJ([
    [-60, 74], [110, 70], [228, 136], [290, 248], [318, 350], [344, 410], [320, 470], [326, 528], [342, 580], [332, 650],
    [320, 722], [328, 800], [332, 880], [324, 952], [304, 1012], [252, 1044], [150, 1046], [40, 1016], [-80, 966],
    [-196, 904], [-232, 822], [-248, 724], [-330, 696], [-410, 560], [-420, 380], [-330, 180], [-200, 96],
  ]);
  const skin = path(skinPts, true);
  s += P(skin, C.base);
  let sh = '';
  sh += soft(doc, ellipse(-80, 420, 240, 300), C.light, 50, 0.6);
  // split lighting: torch from the left side; terminator runs down the front plane through the nose bridge,
  // the nose throws a hard shadow across the far cheek
  const far = path(JJ([[150, 90], [170, 300, 'c'], [196, 418], [222, 470, 'c'], [236, 540], [262, 610], [312, 676], [350, 712, 'c'], [300, 748], [262, 770, 'c'],
    [252, 822], [246, 900, 'c'], [226, 984], [200, 1048, 'c'], [420, 1100], [420, 90]]), true);
  const sock = path([[-50, 462], [40, 450], [140, 452], [214, 470], [232, 512], [196, 518], [140, 508], [70, 514], [0, 518], [-44, 502]], true);
  const under = path(JJ([[150, 852 + E.open * 140], [240, 870 + E.open * 140], [300, 860 + E.open * 140], [300, 890 + E.open * 140], [236, 898 + E.open * 140], [160, 878 + E.open * 140]]), true);
  const jawU = path(JJ([[-248, 724], [-232, 822], [-196, 904], [-80, 966], [40, 1016], [150, 1046], [252, 1044], [252, 1100], [-260, 1100]]), true);
  sh += `<g opacity="0.95">${P(far, C.shadow)}${P(sock, C.shadow)}${P(under, C.shadow)}</g>`;
  sh += inside(doc, jawU, crescent(doc, skin, [0, -38], C.shadow, 0.8, 0.95));
  // reflected teal fill inside the shadow on the far cheek (keeps features readable)
  sh += P(path(JJ([[270, 560], [320, 560], [330, 660], [300, 690], [276, 640]]), true), '#7e5a6a', 'opacity="0.6"');
  // occlusion
  sh += P(path([[150, 476], [212, 480], [228, 520], [196, 530], [160, 512]], true), C.deep, 'opacity="0.55"');
  sh += P(path(JJ([[-196, 904], [-80, 966], [40, 1016], [150, 1046], [150, 1062], [-200, 930]]), true), C.deep, 'opacity="0.6"');
  // side plane under the cheekbone (graphic plane change) + nasolabial + cleft chin
  sh += P(path(JJ([[-240, 690, 'c'], [-110, 664], [10, 690], [96, 780, 'c'], [0, 772], [-120, 752], [-232, 770, 'c']]), true), C.shadow2, 'opacity="0.55"');
  sh += P(taper(JJ([[204, 720], [176, 768], [140, 830], [126, 862]]), [0, lw(4), lw(3), 0]), C.shadow, 'opacity="0.85"');
  sh += P(taper(JJ([[218, 960], [222, 994], [228, 1034]]), [0, lw(3.5), 0]), C.shadow, 'opacity="0.9"');
  // core shadow: darker band right at the terminator; light2 on planes facing the torch squarely
  const termF = JJ([[170, 300], [196, 418], [222, 470], [236, 540], [262, 610], [312, 676]]);
  sh += P(taper(termF.map((p) => [p[0] + 10, p[1]]), lw(7)), C.deep, 'opacity="0.35"');
  sh += P(path([[-210, 330], [-120, 300], [-40, 330], [-30, 420], [-90, 520], [-180, 560], [-230, 470]], true), C.light, 'opacity="0.55"');
  // plane-following torch highlights
  sh += P(path([[-170, 300], [-60, 250], [80, 232], [150, 246], [80, 262], [-60, 280], [-160, 330]], true), C.hi, 'opacity="0.7"');
  sh += P(taper([[-60, 418], [40, 402], [140, 408], [196, 428]], [0, lw(5), lw(5), 0]), C.hi, 'opacity="0.85"');
  sh += P(path([[-210, 560, 'c'], [-90, 548], [40, 562], [118, 596, 'c'], [20, 606], [-110, 600]], true), C.hi, 'opacity="0.75"');
  
  // heavy beard shadow: flat graphic tone with a crisp edge
  const stub = path(JJ([[-244, 740, 'c'], [-140, 760], [-20, 786], [80, 836, 'c'], [150, 800], [240, 780], [326, 780], [330, 880], [320, 960], [290, 1020], [150, 1046], [-80, 966], [-200, 900]]), true);
  sh += P(stub, '#3b3350', 'opacity="0.34"');
  // teal rim on the far contour + warm floor bounce under the jaw
  sh += crescent(doc, skin, [-15, 8], C.rim, 0.6, 1);
  sh += crescent(doc, skin, [-5, 3], C.rimHot, 0.5, 0.9);
  sh += crescent(doc, skin, [6, -14], C.bounce, 3, 0.45);
  s += inside(doc, skin, sh);

  s += earSvg(doc, E, lw);
  s += noseSvg(doc, E, lw);
  s += eyesSvg(doc, E, lw);
  s += mouthSvg(doc, E, lw, J);
  // bold contour: heavy on the jaw/shadow side
  s += P(taper(JJ([[-248, 724], [-232, 822], [-196, 904], [-80, 966], [40, 1016], [150, 1046], [252, 1044], [304, 1012], [324, 952]]), [lw(2), lw(4.4), lw(5.2), lw(5.2), lw(4.8), lw(4.4), lw(4), lw(3.4), lw(2.6)]), C.line);
  s += P(taper(JJ([[228, 136], [290, 248], [318, 350], [344, 410], [320, 470], [326, 528], [342, 580], [332, 650], [320, 722], [328, 800], [332, 880], [324, 952]]), [lw(1.6), lw(2.6), lw(3), lw(3.4), lw(2.6), lw(2.8), lw(3), lw(2.6), lw(2.4), lw(2.8), lw(3), lw(2.6)]), C.line);
  s += hairSvg(doc, E, lw);
  if (E.sweat) s += sweat(doc, lw);
  // stylize: compress the side plane so the features dominate the head
  const wf = L.compressX(120, 0.74, 90);
  for (let i = d0; i < doc.defs.length; i++) doc.defs[i] = L.warpSvg(doc.defs[i], wf);
  return L.warpSvg(s, wf);
}

function earSvg(doc, E, lw) {
  // cauliflower ear: thickened, slightly lumpy helix but correct structure
  const pts = [[-238, 610], [-234, 520], [-252, 462], [-292, 438], [-340, 454], [-366, 506], [-362, 560], [-366, 604], [-350, 652], [-326, 700], [-298, 728], [-268, 724], [-254, 690]];
  const outer = path(pts, true);
  let s = P(outer, C.base);
  let sh = '';
  // helix fold (thick rim) in shadow
  sh += P(taper([[-262, 470], [-300, 458], [-338, 478], [-350, 530], [-346, 590], [-334, 640], [-312, 676]], [0, lw(7), lw(9), lw(8), lw(8), lw(6), 0]), C.shadow2, 'opacity="0.8"');
  // concha bowl
  sh += P(path([[-262, 560], [-288, 544], [-312, 570], [-308, 626], [-280, 646], [-258, 614]], true), C.deep, 'opacity="0.9"');
  // antihelix ridge lit
  sh += P(taper([[-300, 492], [-320, 534], [-318, 588], [-302, 630], [-286, 654]], [0, lw(4), lw(4.4), lw(3), 0]), C.hi, 'opacity="0.85"');
  sh += P(ellipse(-332, 520, 9, 13), C.hi, 'opacity="0.6"');
  sh += P(ellipse(-284, 704, 16, 12), C.blush, 'opacity="0.5"');
  s += inside(doc, outer, sh);
  s += P(taper(pts.concat([pts[0]]), [lw(1.2), lw(2), lw(2.8), lw(3.4), lw(3.6), lw(3.6), lw(3.2), lw(3.6), lw(3.6), lw(3.4), lw(3), lw(2.4), lw(1.6), lw(1)]), C.line);
  s += P(taper([[-262, 556], [-290, 544], [-312, 568], [-308, 622]], [0, lw(2.2), lw(2), 0]), C.line);
  s += P(taper([[-300, 492], [-322, 534], [-320, 590], [-304, 632]], [0, lw(1.6), lw(1.4), 0]), C.line, 'opacity="0.8"');
  return s;
}

function noseSvg(doc, E, lw) {
  const fl = E.flare || 0;
  // broken boxer's nose: low crooked bridge with a bump, wide fleshy tip, flared wings
  const pts = SC([[236, 472], [254, 520], [272, 552], [286, 598], [318, 638], [350, 662, 'c'], [356, 690], [338, 714], [302, 722], [262, 722], [228, 724], [196 - fl, 710], [190 - fl, 676], [204, 640], [204, 560], [216, 500]], NC, NK, 1.1);
  const nose = path(pts, true);
  const Z = (a) => SC(a, NC, NK, 1.1);
  let s = P(nose, C.base);
  let sh = '';
  sh += P(path(Z([[236, 472], [254, 520], [272, 552], [286, 598], [318, 640], [350, 666], [360, 700], [420, 700], [420, 440]]), true), C.shadow, 'opacity="0.95"');
  sh += P(path(Z([[206, 500], [234, 490], [248, 540], [262, 600], [300, 650], [276, 668], [234, 640], [212, 580]]), true), C.hi, 'opacity="0.75"');
  sh += P(ellipse(...Z([[306, 662]])[0], 20, 13, -0.3), C.hi, 'opacity="0.9"');
  sh += P(path(Z([[262, 706], [320, 704], [356, 696], [342, 720], [302, 726], [258, 724]]), true), C.shadow, 'opacity="0.95"');
  sh += P(path(Z([[192 - fl, 672], [206, 662], [226, 670], [230, 706], [204, 714], [190 - fl, 702]]), true), C.shadow2, 'opacity="0.5"');
  sh += inside(doc, path([[300, 600], [440, 600], [440, 760], [300, 760]], true), crescent(doc, nose, [-12, 6], C.rim, 0.6, 1));
  s += inside(doc, nose, sh);
  s += P(path(Z([[238, 714], [258, 704], [286, 708], [296, 718], [270, 724], [244, 722]]), true), C.deep);
  s += P(taper(Z([[262, 548], [272, 556], [284, 598]]), [0, lw(2.6), 0]), C.line, 'opacity="0.85"');
  s += P(taper(Z([[316, 638], [350, 662], [356, 690], [338, 714], [314, 722]]), [lw(1), lw(2.8), lw(3.4), lw(3), lw(1)]), C.line);
  s += P(taper(Z([[214, 654], [196 - fl, 676], [200 - fl, 708], [226, 722]]), [0, lw(3), lw(3), 0]), C.line);
  return s;
}

function eyesSvg(doc, E, lw) {
  let s = '';
  const st = {
    white: C.white, whiteShadow: '#9a7a70', iris: C.iris, irisDark: C.irisDark, irisLight: C.irisLight, pupil: '#0c0605',
    catch: '#fff6e0', caruncle: '#c46a5a', lash: C.line, lashW: lw(3.2), lowLine: C.line, lowW: lw(1.4), rimLow: '#e8b090', lidCast: 10,
  };
  const oN = E.lidN, oF = E.lidF;
  const nE = K.eye(doc, { a: [0, 506 - E.cheekN * 0.3], b: [136, 500], up: 29, low: 12 - E.lowN, open: oN, upSkew: 0.52, lowSkew: 0.5, iris: [62 + E.gaze[0], 503 + E.gaze[1]], ir: 23, irx: 0.9, pupil: E.pupil }, st);
  s += nE.svg;
  s += P(taper([[-6, 488], [40, 470 - 18 * (oN - 1)], [96, 466 - 20 * (oN - 1)], [146, 482]], [0, lw(1.8), lw(1.8), 0]), C.line, 'opacity="0.8"');
  const fE = K.eye(doc, { a: [318, 507], b: [246, 501], up: 23, low: 9 - E.lowF, open: oF, upSkew: 0.42, lowSkew: 0.5, iris: [272 + E.gaze[0] * 0.6, 504 + E.gaze[1]], ir: 20, irx: 0.55, pupil: E.pupil }, Object.assign({}, st, { lashW: lw(2.8), white: '#a88a86', catchOff: [-4, -7] }));
  const bridgeClip = path([[236, 300], [400, 300], [400, 700], [262, 700], [250, 560], [238, 470]], true);
  s += inside(doc, bridgeClip, fE.svg);
  // heavy low brows (with a scar notch in the near one)
  const bn = E.browN, bf = E.browF;
  const nb = [[206, 462 - bn[0]], [150, 446 - bn[0] * 0.8], [86, 436 - (bn[0] + bn[1]) / 2], [20, 438 - bn[1] * 0.9], [-56, 452 - bn[1]]];
  const fb = [[266, 458 - bf[0]], [300, 446 - (bf[0] + bf[1]) / 2], [334, 448 - bf[1]]];
  s += P(taper(nb, [lw(8), lw(9), lw(8), lw(6.5), lw(2)]), C.hair);
  s += K.hairBand(doc, nb.map((p, i) => [p, [18, 20, 18, 14, 5][i]]), { count: 70, color: [C.hairMid, C.hairLight], width: lw(1.3), len: 30, angle: (t) => -0.05 - t * 0.3, jitter: 0.3, seed: 2, op: 0.7 });
  const notch = lerp(nb[2], nb[3], 0.4);
  s += P(path([[notch[0] - 5, notch[1] - 20], [notch[0] + 7, notch[1] - 20], [notch[0] + 3, notch[1] + 20], [notch[0] - 7, notch[1] + 20]], true), C.base);
  s += P(taper([[notch[0] - 2, notch[1] - 26], [notch[0], notch[1] + 26]], [0, lw(1.6), 0]), '#a0503c');
  s += P(taper(fb, [lw(7), lw(7), lw(2.4)]), C.hair);
  if (bn[0] < 0) { s += P(taper([[218, 400], [214, 430], [216, 450]], [0, lw(1.8), 0]), C.line, 'opacity="0.7"'); s += P(taper([[234, 404], [232, 432]], [0, lw(1.4), 0]), C.line, 'opacity="0.5"'); }
  s += P(taper([[306, 444 - bf[1]], [334, 448 - bf[1]]], [0, lw(2), 0]), C.rim);
  return s;
}

function mouthSvg(doc, E, lw, J) {
  let s = '';
  const open = E.open, cN = E.cornN, cF = E.cornF;
  const nC = [98 - E.cheekN * 0.6, 818 - cN], fC = [320, 820 - cF];
  const lo = open * 140;
  const upper = [nC, [170, 808 - cN * 0.4], [250, 802], [272, 798], [286, 802], [308, 808 - cF * 0.5], fC];
  const mid = [fC, [300, 816 - cF * 0.4], [270, 815], [200, 815 - cN * 0.3], [150, 816 - cN * 0.6], nC];
  const innerLow = [[150, 824 + lo * 0.55], [210, 834 + lo * 0.85], [270, 836 + lo * 0.9], [306, 826 + lo * 0.7]].map(J);
  const lowerOuter = [fC, [308, 834 + lo * 0.8], [272, 848 + lo], [204, 846 + lo * 0.95], [150, 834 + lo * 0.6], nC].map(J);
  if (open > 0.02) {
    const innerUp = [nC, [170, 818], [240, 814], [300, 815], fC];
    const mi = path(innerUp.concat(innerLow.slice().reverse()), true);
    s += P(mi, '#2a0e10');
    let ins = '';
    if (E.teeth !== 'none') {
      const ty = 814;
      const teeth = path([[140, ty - 4], [310, ty - 4], [306, ty + 26], [276, ty + 30], [230, ty + 28], [176, ty + 22], [140, ty + 10]], true);
      ins += P(teeth, '#efe2c8');
      // a missing tooth
      ins += P(path([[222, ty - 2], [244, ty - 2], [244, ty + 30], [222, ty + 30]], true), '#2a0e10');
      for (const x of [184, 204, 262, 284]) ins += P(taper([[x, ty + 2], [x + 1, ty + 22]], [lw(0.8), lw(1.1), 0]), '#a48870');
      ins += P(path([[140, ty - 6], [320, ty - 6], [320, ty + 6], [140, ty + 6]], true), '#b08070', 'opacity="0.5"');
    }
    ins += P(ellipse(230, 850 + lo, 60, 18 + lo * 0.15), '#7a2c30');
    s += inside(doc, mi, ins);
  }
  const up = path(upper.concat(mid.slice(1, -1)), true);
  s += P(up, '#9a5248');
  s += inside(doc, up, crescent(doc, up, [8, 6], '#5a2a2c', 0.6, 0.8));
  const lowD = path(lowerOuter.concat(open > 0.02 ? innerLow : mid.slice(1, -1)), true);
  s += P(lowD, '#c27258');
  s += inside(doc, lowD, P(ellipse(196, 832 + lo * 0.9, 34, 7), '#f0b090', 'opacity="0.8"') + crescent(doc, lowD, [-8, -6], '#7a3a3a', 0.6, 0.8));
  s += P(taper(mid, [lw(2.4), lw(2.2), lw(2), lw(2.4), lw(3.2), lw(3.6)]), C.line);
  if (open > 0.02) s += P(taper(lowerOuter.slice(1, -1), [0, lw(2), lw(2.2), lw(1.6), 0]), C.line, 'opacity="0.8"');
  return s;
}

function hairSvg(doc, E, lw) {
  // buzz cut with a sharp widow's peak; stipple texture; lit by the torch on the left
  const hair = path([[-418, 400], [-430, 240], [-350, 90], [-200, 20], [-20, -4], [140, 10], [250, 70], [300, 170], [292, 236], [252, 172], [190, 160], [138, 196], [80, 170], [-20, 176], [-130, 214], [-196, 270], [-214, 360], [-250, 420], [-330, 470]], true);
  let s = P(hair, C.hair);
  let hs = '';
  hs += crescent(doc, hair, [36, 30], C.hairLight, 4, 0.9);
  hs += crescent(doc, hair, [18, 14], '#8a6450', 1, 0.7);
  const R = K.rng(17);
  for (let i = 0; i < 520; i++) {
    const x = -430 + R() * 740, y = -10 + R() * 480;
    hs += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(lw(0.5) + R() * lw(0.5)).toFixed(1)}" fill="${R() > 0.5 ? '#0c0807' : '#6a4a3c'}" opacity="0.6"/>`;
  }
  // old scar through the buzz cut
  hs += P(taper([[-120, 40], [-60, 110], [-10, 150]], [0, lw(3), 0]), '#9a6a5a');
  hs += crescent(doc, hair, [-14, 8], C.rim, 0.6, 1);
  s += inside(doc, hair, hs);
  s += P(taper([[-330, 470], [-418, 400], [-430, 240], [-350, 90], [-200, 20], [-20, -4], [140, 10], [250, 70], [300, 170], [292, 236]], [lw(2), lw(3.6), lw(4), lw(4), lw(3.8), lw(3.4), lw(3), lw(2.6), lw(2.2), lw(1.4)]), C.line);
  s += P(taper([[292, 236], [252, 172], [190, 160], [138, 196], [80, 170], [-20, 176], [-130, 214], [-196, 270], [-214, 360]], [lw(1), lw(2), lw(2.2), lw(2.6), lw(2.2), lw(2), lw(2), lw(1.8), lw(1)]), C.line, 'opacity="0.9"');
  return s;
}

function sweat(doc, lw) {
  let s = '';
  for (const [x, y, k] of [[300, 300, 1], [-120, 330, 0.8]]) {
    const d = path([[x, y], [x + 16 * k, y + 34 * k], [x + 10 * k, y + 56 * k], [x - 10 * k, y + 56 * k], [x - 14 * k, y + 34 * k]], true);
    s += P(d, '#cfeff6') + P(taper([[x, y], [x - 14 * k, y + 34 * k], [x - 8 * k, y + 56 * k]], [0, lw(2), 0]), C.line);
  }
  return s;
}

module.exports = { face1, C };
