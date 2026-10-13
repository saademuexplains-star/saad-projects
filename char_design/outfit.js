// Shared outfit geometry in base coordinates (same pose for every character) + small builders.
'use strict';
const L = require('./lib');

const OUT = {
  tunicTop: { bind: ['torso'], pts: [[732, 652], [700, 648], [672, 662], [646, 694], [618, 742], [574, 790], [524, 820], [482, 826], [452, 816], [438, 846], [454, 900], [474, 960], [472, 990], [600, 1004], [724, 996], [718, 940], [722, 880], [734, 820], [746, 794], [768, 802], [790, 794], [794, 760], [786, 718], [768, 686], [750, 664]] },
  beltTop: { bind: ['torso'], pts: [[464, 962], [540, 980], [620, 992], [690, 990], [728, 982]] },
  beltBot: { bind: ['torso'], pts: [[730, 1040], [690, 1048], [620, 1052], [540, 1044], [462, 1026]] },
  skirt: { bind: ['torso'], pts: [[462, 1026], [444, 1090], [432, 1170], [424, 1250], [428, 1288], [470, 1296], [530, 1304], [600, 1308], [660, 1316], [720, 1320], [762, 1308], [770, 1240], [760, 1160], [744, 1090], [730, 1040]] },
  strap: { bind: ['torso'], pts: [[448, 674], [486, 694], [540, 744], [600, 806], [656, 872], [700, 930], [726, 964]] },
  guard: { bind: ['limb', 'EN', 'WN', 'fore'], pts: [[371, 1002], [364, 1060], [360, 1112], [362, 1160], [368, 1186], [420, 1186], [424, 1152], [432, 1086], [444, 1020], [446, 1000]] },
};

function warpOut(g) {
  const o = {};
  for (const [k, v] of Object.entries(OUT)) o[k] = v.pts.map((p) => g.warp(p, v.bind));
  return o;
}

// wavy hem between two points (fold ends)
function hem(a, b, n, amp, seed = 1) {
  const R = require('./facekit').rng(seed);
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const p = L.lerp(a, b, t);
    pts.push([p[0], p[1] + (i % 2 ? amp * (0.6 + R() * 0.8) : -amp * 0.3 * R())]);
  }
  return pts;
}

module.exports = { OUT, warpOut, hem };
