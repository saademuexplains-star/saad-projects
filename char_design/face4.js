// Character 4 head: the champion. Most realistic of the four: lineless painterly shapes,
// soft overcast key from top-front-left, cool sky speculars, warm sand bounce, subtle cool rim.
'use strict';
const L = require('./lib');
const K = require('./facekit');
const { path, taper, P, inside, soft, crescent, ellipse, lerp } = L;

const C = {
  base: '#6c4331', mid: '#7c4f3a', light: '#8f5d44', hi: '#c9b2b0', spec: '#e4d8dc', shadow: '#3f2520', shadow2: '#55322a', deep: '#241310',
  red: '#7d3a2c', bounce: '#a8643c', rim: '#a9bccc',
  lipU: '#4a2826', lipL: '#653833', lipHi: '#b48c8c',
  hair: '#120d0c', hairMid: '#2a1f1c', hairSheen: '#6a6470',
  white: '#e2d6ce', iris: '#3a2014', irisDark: '#140906', irisLight: '#6a3e22',
  gold: '#d9a441', goldHi: '#fff0b0', goldDark: '#7a4e14',
};

function face4(doc, e = {}, opt = {}) {
  const E = K.expr(e);
  const d0 = doc.defs.length;
  const sc = opt.sc || 0.19;
  const lw = (px) => px / sc;
  const J = (p) => K.jawPt(p, E.jaw, 770, 1010, 10);
  const JJ = (a) => a.map(J);
  let s = '';
  const skinPts = JJ([
    [-60, 60], [110, 50], [226, 110], [290, 220], [314, 330], [326, 410], [312, 466], [318, 520], [336, 568], [326, 636],
    [306, 706], [304, 780], [306, 850], [296, 920], [272, 975], [222, 1004], [150, 1010], [60, 990], [-50, 940],
    [-150, 870], [-196, 800], [-214, 720], [-316, 690], [-420, 540], [-440, 350], [-370, 170], [-230, 80],
  ]);
  const skin = path(skinPts, true);
  s += P(skin, C.base);
  let sh = '';
  // soft top-front light: big gentle value structure
  sh += soft(doc, ellipse(60, 330, 230, 200), C.light, 60, 0.85);
  sh += soft(doc, ellipse(40, 600, 180, 110), C.mid, 40, 0.7);
  sh += crescent(doc, skin, [-36, -96], C.shadow, 30, 0.9);
  sh += crescent(doc, skin, [-50, -20], C.shadow2, 30, 0.5);
  // planes: side plane turning toward the ear
  sh += soft(doc, path([[-330, 330], [-190, 300], [-170, 470], [-190, 640], [-300, 690], [-420, 540]], true), C.shadow2, 40, 0.55);
  // eye sockets (soft, overhead light)
  sh += soft(doc, path([[-50, 460], [40, 444], [150, 450], [222, 476], [232, 520], [180, 530], [100, 524], [30, 528], [-30, 516]], true), C.deep, 12, 0.75);
  sh += soft(doc, path([[238, 458], [326, 458], [330, 528], [256, 530]], true), C.deep, 12, 0.6);
  // cheekbone: hard-edged light accent on the high zygoma, soft hollow beneath
  sh += soft(doc, path([[-170, 566], [-60, 540], [60, 548], [150, 584], [60, 598], [-80, 600]], true), C.light, 6, 0.9);
  sh += soft(doc, path([[-190, 640], [-60, 630], [80, 660], [160, 710], [80, 740], [-60, 720], [-190, 700]], true), C.shadow2, 22, 0.55);
  // nasolabial + cast shadow of the nose (soft, short — light is high)
  sh += soft(doc, path(JJ([[206, 726], [184, 756], [156, 806], [140, 834], [160, 834], [182, 794], [206, 756], [224, 728]]), true), C.shadow, 6, 0.7);
  sh += soft(doc, path(JJ([[220, 730], [300, 730], [304, 760], [262, 770], [228, 760]]), true), C.shadow, 6, 0.85);
  // under the lower lip, under the chin and jaw
  const lo = E.open * 120;
  sh += soft(doc, path(JJ([[170, 862 + lo], [240, 878 + lo], [296, 868 + lo], [292, 898 + lo], [236, 906 + lo], [176, 888 + lo]]), true), C.shadow, 8, 0.8);
  sh += crescent(doc, skin, [0, -36], C.deep, 10, 0.7);
  // red undertone (warm) on cheeks, nose, ears zone; temple
  sh += soft(doc, ellipse(80, 660, 120, 70), C.red, 40, 0.35);
  // speculars from the overcast sky (cool, soft) — what makes dark skin read as real
  sh += soft(doc, path([[-30, 210], [80, 186], [190, 206], [210, 250], [100, 252], [-20, 250]], true), C.hi, 18, 0.7);
  sh += soft(doc, path([[-20, 214], [70, 200], [140, 212], [70, 222]], true), C.spec, 6, 0.6);
  sh += soft(doc, path([[-120, 560], [-30, 546], [50, 556], [-20, 566], [-100, 572]], true), C.hi, 8, 0.65);
  sh += soft(doc, path([[40, 410], [140, 404], [210, 420], [140, 418], [50, 424]], true), C.hi, 5, 0.55);
  sh += soft(doc, ellipse(216, 948 + E.jaw, 34, 18, -0.3), C.hi, 10, 0.45);
  // sand bounce (warm) along the undersides and a cool sky rim on the far contour
  sh += crescent(doc, skin, [4, -16], C.bounce, 6, 0.55);
  sh += crescent(doc, skin, [-10, 0], C.rim, 3, 0.55);
  // paint texture
  sh += `<rect x="-600" y="-200" width="1200" height="1400" filter="${doc.paintTex(0.03, 12, true)}" opacity="0.16" style="mix-blend-mode:soft-light"/>`;
  s += inside(doc, skin, sh);

  s += earSvg(doc, E, lw);
  s += noseSvg(doc, E, lw);
  s += eyesSvg(doc, E, lw);
  s += mouthSvg(doc, E, lw, J);
  s += hairSvg(doc, E, lw);
  // lineless: only a soft dark edge on the shadow-side jaw to separate it from the neck
  s += soft(doc, taper(JJ([[-214, 720], [-196, 800], [-150, 870], [-50, 940], [60, 990], [150, 1010], [222, 1004]]), [0, lw(2.4), lw(3), lw(3), lw(2.6), lw(1.6), 0]), C.deep, 2, 0.6);
  const wf = L.compressX(110, 0.86, 90);
  for (let i = d0; i < doc.defs.length; i++) doc.defs[i] = L.warpSvg(doc.defs[i], wf);
  return L.warpSvg(s, wf);
}

function earSvg(doc, E, lw) {
  const pts = [[-236, 606], [-230, 520], [-248, 458], [-292, 434], [-340, 452], [-364, 512], [-358, 590], [-338, 652], [-312, 704], [-284, 728], [-258, 720], [-246, 682]];
  const outer = path(pts, true);
  let s = soft(doc, path([[-246, 470], [-226, 600], [-246, 730], [-288, 752], [-260, 650]], true), C.deep, 8, 0.45);
  s += P(outer, C.base);
  let sh = '';
  sh += soft(doc, ellipse(-318, 520, 46, 70), C.light, 16, 0.8);
  sh += P(taper([[-258, 466], [-298, 452], [-336, 474], [-348, 532], [-342, 596], [-322, 650]], [0, lw(4), lw(6), lw(5.5), lw(4), 0]), C.shadow, 'opacity="0.85"');
  sh += soft(doc, path([[-258, 560], [-288, 544], [-312, 572], [-306, 628], [-276, 648], [-254, 614]], true), C.shadow, 5, 0.75);
  sh += P(taper([[-298, 488], [-320, 530], [-318, 588], [-300, 634], [-284, 656]], [0, lw(2.6), lw(3), lw(2), 0]), C.mid, 'opacity="0.9"');
  sh += soft(doc, ellipse(-322, 476, 14, 8), C.hi, 4, 0.6);
  sh += crescent(doc, outer, [4, -10], C.bounce, 3, 0.5);
  s += inside(doc, outer, sh);
  // gold hoop earring through the lobe
  const hc = [-286, 760];
  s += `<ellipse cx="${hc[0]}" cy="${hc[1]}" rx="${lw(5.2)}" ry="${lw(6.6)}" fill="none" stroke="${C.goldDark}" stroke-width="${lw(2.2)}"/>`;
  s += `<ellipse cx="${hc[0]}" cy="${hc[1]}" rx="${lw(5.2)}" ry="${lw(6.6)}" fill="none" stroke="${C.gold}" stroke-width="${lw(1.4)}"/>`;
  s += P(taper([[hc[0] - lw(4.6), hc[1] - lw(2.4)], [hc[0] - lw(3.4), hc[1] - lw(5.4)], [hc[0] - lw(1), hc[1] - lw(6.4)]], [0, lw(0.9), 0]), C.goldHi);
  return s;
}

function noseSvg(doc, E, lw) {
  const fl = E.flare || 0;
  const pts = [[234, 470], [254, 522], [272, 572], [294, 616], [324, 646], [350, 664], [358, 690], [346, 716], [310, 728], [276, 728], [244, 730], [206 - fl, 722], [184 - fl, 700], [184 - fl, 668], [204, 640], [206, 560], [216, 500]];
  const nose = path(pts, true);
  let s = P(nose, C.base);
  let sh = '';
  sh += soft(doc, path([[208, 486], [244, 484], [268, 560], [300, 620], [340, 656], [310, 672], [254, 640], [220, 572]], true), C.light, 8, 0.8);
  sh += soft(doc, path([[254, 470], [272, 572], [296, 616], [328, 648], [356, 668], [364, 700], [420, 700], [420, 460]], true), C.shadow2, 10, 0.6);
  // bridge + tip speculars
  sh += soft(doc, taper([[244, 506], [264, 552], [288, 600], [316, 636], [338, 656]], [0, lw(2.4), lw(3.4), lw(2.6), 0]), C.hi, 2, 0.75);
  sh += soft(doc, ellipse(326, 664, 16, 11, -0.4), C.spec, 4, 0.8);
  // wings: broad, rounded alae with a soft crease and the nostril
  sh += soft(doc, path([[186 - fl, 670], [210, 652], [236, 662], [244, 704], [216, 722], [188 - fl, 708]], true), C.red, 8, 0.4);
  sh += soft(doc, path([[184 - fl, 664], [200, 654], [206, 700], [196, 720], [180 - fl, 704]], true), C.shadow, 5, 0.7);
  sh += soft(doc, path([[262, 712], [320, 706], [356, 696], [346, 722], [306, 732], [258, 732]], true), C.shadow, 4, 0.8);
  s += inside(doc, nose, sh);
  s += soft(doc, path([[236, 718], [258, 706], [288, 710], [300, 722], [272, 730], [244, 728]], true), C.deep, 1.5, 0.95);
  s += soft(doc, taper([[210, 650], [190 - fl, 670], [192 - fl, 706], [214, 722]], [0, lw(1.6), lw(1.6), 0]), C.deep, 1.5, 0.55);
  return s;
}

function eyesSvg(doc, E, lw) {
  let s = '';
  const st = {
    white: C.white, whiteShadow: '#7a6460', iris: C.iris, irisDark: C.irisDark, irisLight: C.irisLight, pupil: '#080404',
    catch: '#f6f6ff', caruncle: '#8a4a44', lash: '#0e0807', lashW: lw(2.4), lowLine: null, rimLow: '#9a6a5a', lidCast: 12, soft: true,
  };
  const oN = E.lidN, oF = E.lidF;
  const nE = K.eye(doc, { a: [4, 502 - E.cheekN * 0.3], b: [138, 496], up: 31, low: 13 - E.lowN, open: oN, upSkew: 0.5, lowSkew: 0.46, iris: [62 + E.gaze[0], 499 + E.gaze[1]], ir: 26, irx: 0.88, pupil: E.pupil }, st);
  s += nE.svg;
  // heavy upper lid (soft form, no line) + lower lid soft shadow
  s += soft(doc, path([[-8, 494], [30, 466 - 20 * (oN - 1)], [86, 458 - 22 * (oN - 1)], [140, 468 - 14 * (oN - 1)], [158, 490], [140, 476 - 12 * (oN - 1)], [86, 468 - 20 * (oN - 1)], [30, 476 - 18 * (oN - 1)]], true), C.deep, 2, 0.55);
  s += soft(doc, path([[40, 470 - 18 * (oN - 1)], [90, 462 - 20 * (oN - 1)], [130, 470], [90, 468], [44, 476]], true), C.hi, 3, 0.4);
  s += soft(doc, taper([[24, 522 - E.lowN * 0.5], [80, 532 - E.lowN * 0.6], [130, 520 - E.lowN * 0.5]], [0, lw(1.6), 0]), C.shadow, 2, 0.6);
  const fE = K.eye(doc, { a: [318, 505], b: [246, 499], up: 27, low: 11 - E.lowF, open: oF, upSkew: 0.42, lowSkew: 0.5, iris: [270 + E.gaze[0] * 0.6, 502 + E.gaze[1]], ir: 24, irx: 0.55, pupil: E.pupil }, Object.assign({}, st, { lashW: lw(2.1), white: '#b8a8a0', catchOff: [-4, -8] }));
  const bridgeClip = path([[236, 300], [400, 300], [400, 700], [262, 700], [250, 560], [238, 470]], true);
  s += inside(doc, bridgeClip, fE.svg);
  // strong straight brows (dense, dark)
  const bn = E.browN, bf = E.browF;
  const nb = [[202, 456 - bn[0]], [150, 442 - bn[0] * 0.8], [90, 432 - (bn[0] + bn[1]) / 2], [24, 434 - bn[1] * 0.9], [-46, 448 - bn[1]]];
  const fb = [[268, 452 - bf[0]], [300, 440 - (bf[0] + bf[1]) / 2], [330, 446 - bf[1]]];
  s += soft(doc, taper(nb, [lw(5.6), lw(6.4), lw(5.6), lw(4), lw(1)]), C.hair, 1.2, 0.95);
  s += K.hairBand(doc, nb.map((p, i) => [p, [12, 14, 12, 9, 3][i]]), { count: 90, color: [C.hairMid, '#3a2c28', C.hair], width: lw(0.8), len: 28, angle: (t) => -0.1 - t * 0.35, jitter: 0.3, seed: 52 });
  s += soft(doc, taper(fb, [lw(5), lw(5), lw(1.6)]), C.hair, 1.2, 0.95);
  return s;
}

function mouthSvg(doc, E, lw, J) {
  let s = '';
  const open = E.open, cN = E.cornN, cF = E.cornF;
  const nC = [128 - E.cheekN * 0.6, 806 - cN], fC = [306, 808 - cF];
  const lo = open * 120;
  const upper = [nC, [190, 784 - cN * 0.4], [246, 772], [262, 763], [272, 770], [284, 764], [300, 780 - cF * 0.4], fC];
  const mid = [fC, [292, 802 - cF * 0.4], [270, 800], [210, 801 - cN * 0.3], [165, 803 - cN * 0.6], nC];
  const lowerOuter = [fC, [302, 830 + lo * 0.8], [272, 852 + lo], [212, 852 + lo * 0.95], [160, 832 + lo * 0.6], nC].map(J);
  const innerLow = [[160, 816 + lo * 0.55], [212, 828 + lo * 0.85], [270, 830 + lo * 0.9], [300, 818 + lo * 0.7]].map(J);
  if (open > 0.02) {
    const innerUp = [nC, [170, 804], [240, 800], [292, 802], fC];
    const mi = path(innerUp.concat(innerLow.slice().reverse()), true);
    s += P(mi, '#1e0e0e');
    let ins = '';
    if (E.teeth !== 'none') {
      const ty = 800;
      ins += P(path([[150, ty - 4], [302, ty - 4], [298, ty + 20], [262, ty + 24], [200, ty + 22], [150, ty + 12]], true), '#ece2d4');
      ins += soft(doc, path([[140, ty - 6], [196, ty - 6], [186, ty + 40], [140, ty + 40]], true), '#4a2a2a', 6, 0.75);
      for (const x of [200, 228, 252, 276]) ins += soft(doc, taper([[x, ty], [x + 1, ty + 20]], [lw(0.5), lw(0.8), 0]), '#a08878', 0.6, 0.8);
    }
    ins += soft(doc, ellipse(232, 846 + lo, 60, 18 + lo * 0.15), '#6a2a2c', 4, 0.9);
    s += inside(doc, mi, ins);
  }
  const up = path(upper.concat(mid.slice(1, -1)), true);
  s += P(up, C.lipU);
  s += inside(doc, up, soft(doc, path([[230, 760], [300, 762], [310, 800], [250, 800]], true), '#5a3230', 6, 0.7) +
    soft(doc, taper([[180, 784], [246, 772], [262, 766]], [0, lw(1.4), 0]), C.lipHi, 2, 0.5));
  const lowD = path(lowerOuter.concat(open > 0.02 ? innerLow : mid.slice(1, -1)), true);
  s += P(lowD, C.lipL);
  s += inside(doc, lowD,
    soft(doc, ellipse(228, 830 + lo * 0.9, 40, 9), C.lipHi, 5, 0.8) +
    soft(doc, ellipse(232, 826 + lo * 0.9, 16, 4), C.spec, 2, 0.7) +
    crescent(doc, lowD, [0, -12], C.shadow, 5, 0.6));
  // vermilion border: soft light ridge above the upper lip (realistic lip edge)
  s += soft(doc, taper([nC, [190, 780 - cN * 0.4], [246, 768], [262, 759]], [0, lw(1.6), lw(1.6), 0]), C.light, 2, 0.6);
  // small scar through the upper lip (near side)
  s += soft(doc, taper([[200, 744], [204, 772], [208, 798]], [0, lw(2.2), 0]), '#a07068', 1, 0.8);
  // mouth line: soft dark, no ink line
  s += soft(doc, taper(mid, [lw(1.6), lw(1.6), lw(1.4), lw(1.8), lw(2.2), lw(2.4)]), '#1a0c0c', 1.2, 0.9);
  return s;
}

function hairSvg(doc, E, lw) {
  // tight cornrow braids running from a crisp hairline back over the skull
  const scalp = path([[-412, 470], [-448, 300], [-400, 140], [-280, 46], [-120, 18], [60, 24], [196, 72], [264, 156], [280, 226], [250, 198], [196, 172], [100, 162], [-10, 176], [-110, 208], [-158, 254], [-170, 318], [-214, 352], [-232, 430], [-300, 440], [-380, 500]], true);
  let s = P(scalp, '#2a1a16');
  let hs = soft(doc, ellipse(-60, 120, 260, 120), '#4a3430', 30, 0.6);
  const rows = [
    [[250, 196], [150, 120], [20, 70], [-140, 70], [-300, 120], [-420, 220]],
    [[160, 168], [60, 128], [-60, 120], [-200, 150], [-340, 220], [-440, 320]],
    [[40, 168], [-50, 160], [-150, 186], [-270, 240], [-380, 320], [-440, 420]],
    [[-80, 190], [-160, 222], [-240, 270], [-330, 340], [-410, 440]],
    [[-160, 260], [-220, 300], [-290, 360], [-360, 440]],
  ];
  for (const row of rows) {
    const S = L.sample(row, false, 22);
    for (let i = 0; i < S.length - 1; i++) {
      const a = S[i], b = S[i + 1];
      const m = L.lerp(a, b, 0.5), dir = L.norm(L.sub(b, a)), n = L.perp(dir);
      const w = lw(4.2);
      const lobe = path([L.add(a, L.mul(n, w * 0.2)), L.add(m, L.mul(n, w)), L.add(b, L.mul(n, w * 0.35)), L.sub(b, L.mul(n, w * 0.1)), L.sub(m, L.mul(n, w * 0.8)), L.sub(a, L.mul(n, w * 0.2))], true);
      hs += P(lobe, C.hair);
      hs += soft(doc, path([L.add(a, L.mul(n, w * 0.3)), L.add(m, L.mul(n, w * 0.8)), L.add(b, L.mul(n, w * 0.3)), L.add(m, L.mul(n, w * 0.2))], true), C.hairSheen, 2, 0.55);
      hs += soft(doc, taper([L.sub(a, L.mul(n, w * 0.1)), L.sub(m, L.mul(n, w * 0.7)), L.sub(b, L.mul(n, w * 0.1))], [0, lw(1.2), 0]), '#000', 1, 0.7);
    }
  }
  hs += crescent(doc, scalp, [30, 60], '#000', 20, 0.45);
  hs += crescent(doc, scalp, [-10, 4], C.rim, 3, 0.45);
  s += inside(doc, scalp, hs);
  s += soft(doc, taper([[280, 226], [250, 198], [196, 172], [100, 162], [-10, 176], [-110, 208], [-158, 254], [-170, 318], [-214, 352], [-232, 430]].map((p) => [p[0], p[1] + 4]), lw(2)), '#5a3a30', 1, 0.5);
  return s;
}

module.exports = { face4, C };
