// Base figure geometry (realistic ~7.8 heads, head = 190px, floor y = 1850) in the shared pose:
// standing, 3/4 turn to screen-right, weight on the near (screen-left) leg with the pelvis tilted up on that side,
// free (far) leg bent with the heel lifted, near hand open, far hand holding a prop.
// Every part is a point list bound to a skeleton region so other characters can warp it to their proportions.
'use strict';
const L = require('./lib');

const J0 = {
  head: [548, 386], headS: 0.19,
  NP: [596, 655], C7: [478, 608],
  SN: [452, 654], SF: [722, 640],
  shN: [450, 680], shF: [724, 666],
  EN: [400, 946], WN: [394, 1168],
  EF: [764, 920], WF: [794, 1124],
  waN: [480, 958], waF: [716, 950],
  hpN: [464, 1076], hpF: [730, 1104],
  hjN: [522, 1092], hjF: [672, 1124],
  KN: [548, 1462], AN: [574, 1794],
  KF: [697, 1478], AF: [721, 1786],
  floor: 1850,
};

const cN = ['chain', 'shN', 'EN', 'WN', 'arm', 'fore'], cF = ['chain', 'shF', 'EF', 'WF', 'arm', 'fore'];
const lN = ['chain', 'hjN', 'KN', 'AN', 'thigh', 'calf'], lF = ['chain', 'hjF', 'KF', 'AF', 'thigh', 'calf'];

const BASE = {
  neck: { bind: ['neck'], pts: [[496, 512], [492, 548], [482, 578], [462, 602], [436, 622], [414, 640], [404, 660], [440, 684], [520, 680], [572, 668], [596, 658], [622, 662], [680, 650], [730, 654], [736, 642], [702, 630], [652, 620], [618, 610], [604, 596], [594, 580], [580, 566], [540, 556], [520, 530]] },
  torso: { bind: ['torso'], pts: [[424, 668], [408, 730], [418, 796], [440, 848], [458, 906], [472, 958], [468, 1010], [460, 1076], [520, 1130], [608, 1144], [694, 1130], [734, 1104], [732, 1032], [718, 958], [724, 890], [742, 820], [754, 758], [750, 700], [730, 656], [680, 648], [596, 656], [520, 662]] },
  armN: { bind: cN, pts: [[450, 654], [416, 658], [392, 680], [380, 720], [380, 770], [390, 812], [380, 846], [374, 888], [376, 926], [384, 950], [380, 980], [368, 1024], [366, 1076], [370, 1126], [372, 1166], [418, 1172], [420, 1124], [426, 1066], [434, 1010], [436, 976], [442, 952], [454, 912], [466, 862], [474, 812], [478, 772], [476, 726], [470, 690]] },
  armF: { bind: cF, pts: [[722, 644], [754, 652], [776, 678], [788, 720], [792, 770], [790, 810], [798, 850], [800, 890], [794, 922], [800, 956], [812, 1010], [816, 1064], [812, 1108], [814, 1130], [774, 1134], [766, 1090], [756, 1040], [748, 990], [744, 950], [742, 920], [740, 880], [732, 830], [726, 780], [720, 730], [712, 700]] },
  legN: { bind: lN, pts: [[466, 1068], [448, 1120], [442, 1186], [448, 1264], [462, 1344], [480, 1414], [490, 1452], [488, 1490], [478, 1536], [476, 1590], [488, 1648], [506, 1704], [522, 1752], [528, 1796], [604, 1800], [602, 1752], [596, 1690], [594, 1610], [596, 1532], [594, 1500], [602, 1476], [608, 1448], [604, 1418], [610, 1374], [616, 1300], [620, 1220], [624, 1150], [614, 1104]] },
  legF: { bind: lF, pts: [[636, 1124], [618, 1192], [620, 1280], [632, 1370], [642, 1440], [648, 1484], [642, 1532], [640, 1592], [648, 1656], [666, 1716], [684, 1762], [690, 1790], [752, 1796], [748, 1750], [738, 1680], [732, 1600], [732, 1528], [736, 1504], [746, 1480], [744, 1448], [742, 1390], [742, 1300], [740, 1210], [728, 1136]] },
  ftN: { bind: ['foot', 'N'], pts: [[528, 1782], [514, 1826], [524, 1850], [584, 1854], [644, 1860], [680, 1860], [692, 1846], [668, 1828], [624, 1812], [602, 1792]] },
  ftF: { bind: ['foot', 'F'], pts: [[694, 1780], [684, 1818], [700, 1842], [762, 1858], [818, 1866], [848, 1864], [850, 1850], [818, 1832], [776, 1812], [752, 1786]] },
};

const FORMS = {
  deltN: { bind: cN, on: 'armN', pts: [[450, 656], [416, 660], [392, 682], [380, 722], [382, 772], [392, 812], [412, 792], [440, 752], [466, 712], [472, 684]] },
  bicN: { bind: cN, on: 'armN', pts: [[476, 776], [470, 824], [460, 876], [448, 926], [436, 946], [426, 914], [430, 856], [446, 804]] },
  triN: { bind: cN, on: 'armN', pts: [[390, 826], [378, 876], [380, 920], [392, 944], [404, 904], [404, 856]] },
  foreN: { bind: cN, on: 'armN', pts: [[390, 968], [372, 1006], [366, 1056], [384, 1068], [408, 1026], [428, 986]] },
  deltF: { bind: cF, on: 'armF', pts: [[722, 648], [754, 656], [776, 682], [788, 724], [790, 782], [772, 804], [754, 764], [736, 716], [718, 684]] },
  bicF: { bind: cF, on: 'armF', pts: [[722, 768], [730, 818], [738, 868], [744, 912], [760, 914], [762, 866], [750, 808]] },
  foreF: { bind: cF, on: 'armF', pts: [[800, 962], [814, 1020], [810, 1080], [792, 1046], [788, 990]] },
  vlN: { bind: lN, on: 'legN', pts: [[452, 1140], [446, 1200], [452, 1280], [468, 1360], [496, 1340], [496, 1240], [482, 1160]] },
  vmN: { bind: lN, on: 'legN', pts: [[612, 1344], [618, 1396], [608, 1430], [584, 1422], [578, 1384], [594, 1354]] },
  patN: { bind: lN, on: 'legN', pts: [[564, 1422], [596, 1420], [610, 1448], [598, 1476], [568, 1478], [554, 1452]] },
  calfN: { bind: lN, on: 'legN', pts: [[494, 1488], [480, 1536], [480, 1596], [496, 1648], [520, 1656], [530, 1596], [524, 1534], [512, 1492]] },
  shinN: { bind: lN, on: 'legN', pts: [[588, 1504], [598, 1580], [596, 1664], [580, 1684], [574, 1600], [576, 1530]] },
  vlF: { bind: lF, on: 'legF', pts: [[622, 1190], [622, 1280], [634, 1372], [658, 1350], [658, 1250], [642, 1190]] },
  vmF: { bind: lF, on: 'legF', pts: [[740, 1360], [744, 1410], [736, 1442], [714, 1434], [710, 1394], [724, 1366]] },
  patF: { bind: lF, on: 'legF', pts: [[708, 1440], [740, 1438], [750, 1466], [738, 1492], [710, 1494], [698, 1468]] },
  calfF: { bind: lF, on: 'legF', pts: [[646, 1494], [638, 1544], [640, 1604], [656, 1658], [680, 1664], [686, 1604], [676, 1540], [662, 1496]] },
  shinF: { bind: lF, on: 'legF', pts: [[730, 1514], [738, 1590], [736, 1668], [720, 1688], [716, 1606], [718, 1532]] },
  pecN: { bind: ['torso'], on: 'torso', pts: [[600, 672], [540, 674], [490, 688], [466, 726], [462, 776], [488, 808], [530, 820], [572, 814], [606, 796]] },
  trapN: { bind: ['neck'], on: 'neck', pts: [[484, 580], [462, 604], [436, 624], [404, 650], [446, 664], [482, 632], [500, 596]] },
  scmN: { bind: ['neck'], on: 'neck', pts: [[498, 546], [518, 572], [552, 616], [588, 652], [578, 658], [540, 628], [508, 590], [490, 560]] },
};

function bilinear(q, p) {
  const [a, b, c, d] = q;
  let u = 0.5, v = 0.5;
  for (let it = 0; it < 20; it++) {
    const x = (1 - u) * (1 - v) * a[0] + u * (1 - v) * b[0] + u * v * c[0] + (1 - u) * v * d[0];
    const y = (1 - u) * (1 - v) * a[1] + u * (1 - v) * b[1] + u * v * c[1] + (1 - u) * v * d[1];
    const dxu = -(1 - v) * a[0] + (1 - v) * b[0] + v * c[0] - v * d[0];
    const dyu = -(1 - v) * a[1] + (1 - v) * b[1] + v * c[1] - v * d[1];
    const dxv = -(1 - u) * a[0] - u * b[0] + u * c[0] + (1 - u) * d[0];
    const dyv = -(1 - u) * a[1] - u * b[1] + u * c[1] + (1 - u) * d[1];
    const det = dxu * dyv - dxv * dyu;
    const ex = p[0] - x, ey = p[1] - y;
    u += (ex * dyv - ey * dxv) / det;
    v += (ey * dxu - ex * dyu) / det;
  }
  return [u, v];
}
function bilerp(q, u, v) {
  const [a, b, c, d] = q;
  return [(1 - u) * (1 - v) * a[0] + u * (1 - v) * b[0] + u * v * c[0] + (1 - u) * v * d[0],
    (1 - u) * (1 - v) * a[1] + u * (1 - v) * b[1] + u * v * c[1] + (1 - u) * v * d[1]];
}

function makeWarp(J, W = {}) {
  const w = (k) => W[k] ?? 1;
  const torsoQ0 = [J0.SN, J0.SF, J0.hpF, J0.hpN], torsoQ = [J.SN, J.SF, J.hpF, J.hpN];
  const hk = J.headS / J0.headS;
  const neckQ0 = [[J0.head[0] - 60, J0.head[1] + 120], [J0.head[0] + 80, J0.head[1] + 190], J0.SF, J0.SN];
  const neckQ = [[J.head[0] - 60 * hk * (W.neckTop ?? 1), J.head[1] + 120 * hk], [J.head[0] + 80 * hk * (W.neckTop ?? 1), J.head[1] + 190 * hk], J.SF, J.SN];
  function limb(A0, B0, A, B, k, p) {
    const d0 = L.sub(B0, A0), l0 = L.len(d0), n0 = L.norm(d0), q0 = L.perp(n0);
    const r = L.sub(p, A0);
    const t = (r[0] * n0[0] + r[1] * n0[1]) / l0, s = r[0] * q0[0] + r[1] * q0[1];
    const d = L.sub(B, A), q = L.perp(L.norm(d));
    const sc = L.len(d) / l0;
    return [A[0] + d[0] * t + q[0] * s * k * Math.sqrt(sc), A[1] + d[1] * t + q[1] * s * k * Math.sqrt(sc)];
  }
  return function warp(p, bind) {
    const kind = bind[0];
    if (kind === 'torso') {
      const [u, v] = bilinear(torsoQ0, p);
      const uu = 0.5 + (u - 0.5) * (v < 0.5 ? w('chest') : w('chest') + (w('waist') - w('chest')) * Math.min(1, (v - 0.5) * 2));
      return bilerp(torsoQ, uu, v);
    }
    if (kind === 'neck') { const [u, v] = bilinear(neckQ0, p); return bilerp(neckQ, u, v); }
    if (kind === 'limb') return limb(J0[bind[1]], J0[bind[2]], J[bind[1]], J[bind[2]], w(bind[3]), p);
    if (kind === 'chain') {
      const [, a, b, c, k1, k2] = bind;
      const d1 = L.norm(L.sub(J0[b], J0[a])), d2 = L.norm(L.sub(J0[c], J0[b]));
      const bis = L.norm(L.add(d1, d2));
      const sd = (p[0] - J0[b][0]) * bis[0] + (p[1] - J0[b][1]) * bis[1];
      const t = Math.max(0, Math.min(1, (sd + 26) / 52));
      const q1 = limb(J0[a], J0[b], J[a], J[b], w(k1), p);
      const q2 = limb(J0[b], J0[c], J[b], J[c], w(k2), p);
      const tt = t * t * (3 - 2 * t);
      return [q1[0] * (1 - tt) + q2[0] * tt, q1[1] * (1 - tt) + q2[1] * tt];
    }
    if (kind === 'foot') {
      const A0 = bind[1] === 'N' ? J0.AN : J0.AF, A = bind[1] === 'N' ? J.AN : J.AF;
      const k = w('foot');
      return [A[0] + (p[0] - A0[0]) * k, J.floor - (J0.floor - p[1]) * k];
    }
    if (kind === 'head') return [J.head[0] + (p[0] - J0.head[0]) * hk, J.head[1] + (p[1] - J0.head[1]) * hk];
    return p;
  };
}

// Character skeleton from proportions.
function skeleton(p = {}) {
  const heads = p.heads ?? 7.8, hp = p.headPx ?? 190, floor = 1850;
  const H = heads * hp, top = floor - H;
  const base0Top = J0.floor - 7.8 * 190;
  const crotch0 = 1140;
  const crotchFrac0 = (crotch0 - base0Top) / (7.8 * 190);
  const crotchY = top + H * (crotchFrac0 + (p.torsoLong ?? 0));
  const chin0 = J0.head[1] + 1008 * J0.headS, chinY = top + (chin0 - base0Top) * hp / 190;
  const mapY = (y) => {
    if (y <= chin0) return top + (y - base0Top) * hp / 190;
    if (y <= crotch0) return chinY + (y - chin0) * (crotchY - chinY) / (crotch0 - chin0);
    return crotchY + (y - crotch0) * (floor - crotchY) / (floor - crotch0);
  };
  const mid = 596, J = {};
  const cx = p.cx ?? 0, sw = p.shoulder ?? 1, hw = p.hip ?? 1;
  for (const k of Object.keys(J0)) {
    if (k === 'headS' || k === 'floor') continue;
    const [x, y] = J0[k];
    let xm = x - mid;
    if (['SN', 'SF', 'shN', 'shF', 'EN', 'EF', 'WN', 'WF', 'C7'].includes(k)) xm *= sw;
    if (['waN', 'waF'].includes(k)) xm *= (sw + hw) / 2;
    if (['hpN', 'hpF', 'hjN', 'hjF', 'KN', 'KF', 'AN', 'AF'].includes(k)) xm *= hw;
    J[k] = [mid + xm + cx, k === 'head' ? top + (J0.head[1] - base0Top) * hp / 190 : mapY(y)];
  }
  J.head[0] = J0.head[0] + cx + (p.headDx ?? 0) - (hp - 190) * 0.12;
  J.head[1] += p.headDy ?? 8;
  J.headS = hp / 1000;
  J.floor = floor;
  if (p.armLen) {
    for (const [s, e, w] of [['shN', 'EN', 'WN'], ['shF', 'EF', 'WF']]) {
      const d1 = L.sub(J[e], J[s]), d2 = L.sub(J[w], J[e]);
      J[e] = L.add(J[s], L.mul(d1, p.armLen));
      J[w] = L.add(J[e], L.mul(d2, p.armLen));
    }
  }
  if (p.farOut) { J.EF = [J.EF[0] + p.farOut * 0.45, J.EF[1]]; J.WF = [J.WF[0] + p.farOut, J.WF[1]]; }
  if (p.nearOut) { J.EN = [J.EN[0] - p.nearOut * 0.45, J.EN[1]]; J.WN = [J.WN[0] - p.nearOut, J.WN[1]]; }
  const fl = p.foreLen ?? 1.0;
  for (const [e, w] of [['EN', 'WN'], ['EF', 'WF']]) J[w] = L.add(J[e], L.mul(L.sub(J[w], J[e]), fl));
  return J;
}

function warped(J, W) {
  const wp = makeWarp(J, W);
  const out = {};
  for (const [k, v] of Object.entries(BASE)) out[k] = v.pts.map((p) => wp(p, v.bind));
  out.forms = {};
  for (const [k, v] of Object.entries(FORMS)) out.forms[k] = { on: v.on, pts: v.pts.map((p) => wp(p, v.bind)) };
  out.warp = wp;
  out.J = J;
  return out;
}

module.exports = { J0, BASE, FORMS, makeWarp, skeleton, warped };
