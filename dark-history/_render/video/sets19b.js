// Sets for "The Pied Piper", second pass (loaded after sets19.js, replaces two of its sets):
// - the hilltop: a real valley below (far ridges, wooded hills, farmland in perspective with hedgerows, trees and copses,
//   the river bending round the walled town of Hamelin), a rock outcrop with ledges, strata, cracks, moss and the dark
//   seam where the hill closed, a wind-bent hawthorn, a worn path through textured grass with tufts, flowers and stones;
//   a dusk version with a violet sky, lit cloud streaks and the sun's glow off to the right, lamps in the town;
// - the bedroom: the quilt falls over the foot of the bed to a dark gap and short legs, so nothing shows under the bed.
(function (G) {
  const S = G.SETS, { f, shade, mix, rng } = G.RIG, C = G.CINE, E = G.ENV;
  const lerp = (a, b, t) => a + (b - a) * t, TAU = Math.PI * 2;
  const cache = {}, once = (k, fn) => cache[k] || (cache[k] = fn());
  const OUTC = '#20140c', olr = (w = 2, op = 0.7) => `stroke="${OUTC}" stroke-width="${w}" stroke-opacity="${op}" stroke-linejoin="round"`;
  const LG = (id, stops, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('')}</linearGradient>`;
  const P2 = p => `${f(p[0])},${f(p[1])}`;
  const L2 = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
  const poly = pts => 'M' + pts.map(P2).join(' L') + 'Z';
  const PLASTER = ['#e2d4b4', '#d8c8a6', '#e8dcc0', '#cdbd9c', '#e0cfae'];
  // a smooth path through points (Catmull-Rom as cubic Beziers), and the same curve sampled into points
  const crPath = pts => { const n = pts.length, P = i => pts[Math.max(0, Math.min(n - 1, i))]; let d = `M${P2(pts[0])}`; for (let i = 0; i < n - 1; i++) { const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2); d += ` C${f(p1[0] + (p2[0] - p0[0]) / 6)},${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)},${f(p2[1] - (p3[1] - p1[1]) / 6)} ${P2(p2)}`; } return d; };
  const crSample = (pts, m) => { const n = pts.length, P = i => pts[Math.max(0, Math.min(n - 1, i))], out = []; for (let i = 0; i < n - 1; i++) for (let s = 0; s < m; s++) { const u = s / m, u2 = u * u, u3 = u2 * u, p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2); out.push([0, 1].map(c => 0.5 * (2 * p1[c] + (-p0[c] + p2[c]) * u + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * u2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * u3))); } out.push(pts[n - 1]); return out; };
  // y on a sampled curve at x (the curve runs left to right)
  const yOn = (pts, x) => { if (x <= pts[0][0]) return pts[0][1]; for (let i = 1; i < pts.length; i++) if (pts[i][0] >= x) { const a = pts[i - 1], b = pts[i]; return lerp(a[1], b[1], (x - a[0]) / (b[0] - a[0] || 1)); } return pts[pts.length - 1][1]; };
  // a tapered limb around a polyline (width w0 at its start, w1 at its end)
  const taper = (pts, w0, w1) => { const Lf = [], Rt = [], n = pts.length; for (let i = 0; i < n; i++) { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, w = lerp(w0, w1, i / (n - 1)) / 2; Lf.push([pts[i][0] - dy / l * w, pts[i][1] + dx / l * w]); Rt.push([pts[i][0] + dy / l * w, pts[i][1] - dx / l * w]); } return 'M' + Lf.map(P2).join(' L') + ' L' + Rt.reverse().map(P2).join(' L') + 'Z'; };
  const qpts = (p0, c, p1, n = 10) => Array.from({ length: n + 1 }, (_, i) => { const u = i / n; return [(1 - u) ** 2 * p0[0] + 2 * (1 - u) * u * c[0] + u * u * p1[0], (1 - u) ** 2 * p0[1] + 2 * (1 - u) * u * c[1] + u * u * p1[1]]; });
  const ridgePts = (x0, x1, y, amp, seed, step) => { const r = rng(seed), pts = []; for (let x = x0; x <= x1 + step; x += step) pts.push([x, y - amp * (0.15 + r() * 0.85) * (0.6 + 0.4 * Math.sin(x / 900 + seed))]); return pts; };

  // ======================================================= THE VALLEY below the hill (layer p 0.4)
  const HT = S.HT = { FY: 1700, TOP: [2300, 1560], ROCK: [2700, 1580], TREE: [-600, 1660] };
  const VAL = S.HTV = { YH: 1262, YN: 1780, VX: 640, TOWN: [820, 1300] };
  const kV = y => Math.max(0.004, (y - VAL.YH + 10) / (VAL.YN - VAL.YH + 10));
  // a far tree: trunk, a dark crown, a mid crown, a lit cap (sun from the upper left)
  const farTree = (x, y, k, haze, hz) => { const s = 4 + 46 * k, dk = mix('#2c4424', haze, hz), md = mix('#466632', haze, hz), lt = mix('#7a9848', haze, hz); return `<path d="M${f(x)},${f(y)} L${f(x)},${f(y - s * 0.5)}" stroke="${mix('#3a2a1e', haze, hz)}" stroke-width="${f(Math.max(0.8, s * 0.12))}"/><ellipse cx="${f(x)}" cy="${f(y - s * 0.74)}" rx="${f(s * 0.5)}" ry="${f(s * 0.46)}" fill="${dk}"/><ellipse cx="${f(x - s * 0.08)}" cy="${f(y - s * 0.83)}" rx="${f(s * 0.36)}" ry="${f(s * 0.33)}" fill="${md}"/><ellipse cx="${f(x - s * 0.17)}" cy="${f(y - s * 0.93)}" rx="${f(s * 0.17)}" ry="${f(s * 0.15)}" fill="${lt}"/>`; };
  // farmland in perspective: rows from the horizon (thin, hazy) to the near edge (deep); every field's sides run back to
  // the vanishing point; furrows and crop rows on the nearer fields, specks on pasture; hedgerows and trees between them
  const farmland = (x0, x1, seed, haze) => {
    const r = rng(seed), n = 11, { YH, YN, VX } = VAL;
    const rowY = j => YH + (YN - YH) * Math.pow(j / n, 1.85);
    const wav = Array.from({ length: n + 1 }, () => [r() * TAU, 0.5 + r() * 1.1, (r() - 0.5) * 0.03]);
    const lineY = (j, x) => { const y = rowY(j); if (!j || j >= n) return y; const th = (rowY(j + 1) - rowY(j - 1)) / 2, [ph, fq, sl] = wav[j]; return y + Math.sin(x / 300 * fq + ph) * th * 0.2 + sl * (x - VX) * kV(y); };
    const FT = [['#8aa856', 'grass'], ['#a8b060', 'crop'], ['#7a9a4a', 'grass'], ['#c8b868', 'wheat'], ['#9a7a52', 'plough'], ['#6a8a42', 'grass'], ['#b8a858', 'wheat'], ['#94a85a', 'crop'], ['#a88a5a', 'plough']];
    let g = '', hedge = '';
    const trees = [];
    for (let j = 0; j < n; j++) {
      const ka = kV(rowY(j)), kb = kV(rowY(j + 1)), km = (ka + kb) / 2, hz = Math.pow(1 - km, 2.2) * 0.62;
      let X = VX + (x0 - VX) / ka - r() * 300;
      const Xb = VX + (x1 - VX) / ka;
      while (X < Xb) {
        const W = Math.max(280 + r() * 820, 52 / ka);
        const [c0, kind] = FT[Math.floor(r() * FT.length)], c = mix(shade(c0, (r() - 0.5) * 0.14), haze, hz);
        const xa0 = VX + (X - VX) * ka, xa1 = VX + (X + W - VX) * ka, xb0 = VX + (X - VX) * kb, xb1 = VX + (X + W - VX) * kb;
        const q = [[xa0, lineY(j, xa0)], [xa1, lineY(j, xa1)], [xb1, lineY(j + 1, xb1)], [xb0, lineY(j + 1, xb0)]];
        g += `<path d="${poly(q)}" fill="${c}"/>`;
        if (km > 0.2 && kind !== 'grass') { const m = Math.round(3 + W * km / 26); for (let i = 1; i < m; i++) { const u = i / m; g += `<path d="M${P2(L2(q[0], q[1], u))} L${P2(L2(q[3], q[2], u))}" stroke="${shade(c, kind === 'wheat' ? 0.1 : kind === 'crop' ? -0.1 : -0.18)}" stroke-width="${f(0.7 + 2.4 * km)}" opacity="0.55"/>`; } }
        else if (km > 0.2) { const m = Math.round(W * km / 12); for (let i = 0; i < m; i++) { const p = L2(L2(q[0], q[1], r()), L2(q[3], q[2], r()), 0.1 + 0.8 * r()); g += `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="${f(0.8 + 1.8 * km)}" fill="${shade(c, -0.16)}" opacity="0.55"/>`; } }
        if (r() < 0.6) hedge += `<path d="M${P2(q[0])} L${P2(q[3])}" stroke="${mix('#3a5628', haze, hz)}" stroke-width="${f(0.8 + 7 * km)}" stroke-linecap="round"/>`;
        if (r() < 0.32) { const u = r(); trees.push([lerp(q[0][0], q[3][0], u), lerp(q[0][1], q[3][1], u), lerp(ka, kb, u), hz]); }
        X += W;
      }
      if (j < n - 1) {
        let d = ''; for (let x = x0; x <= x1; x += 24) d += (d ? ' L' : 'M') + f(x) + ',' + f(lineY(j + 1, x));
        hedge += `<path d="${d}" stroke="${mix('#3a5628', haze, hz)}" stroke-width="${f(1 + 8 * kb)}" fill="none" stroke-linejoin="round"/>`;
        for (let i = 0; i < 6 + 10 * kb; i++) { const x = x0 + r() * (x1 - x0); trees.push([x, lineY(j + 1, x), kb, hz]); }
      }
      // a copse now and then
      if (j > 2 && j < n - 1 && r() < 0.7) { const cx = x0 + r() * (x1 - x0), cy = rowY(j) + r() * (rowY(j + 1) - rowY(j)); for (let i = 0; i < 6 + r() * 6; i++) { const k = kV(cy); trees.push([cx + (r() - 0.5) * 120 * k, cy + (r() - 0.5) * 22 * k, k, hz]); } }
    }
    trees.sort((a, b) => a[1] - b[1]);
    return { fields: g, hedges: hedge, trees: trees.map(([x, y, k, hz]) => farTree(x, y, k, haze, hz)).join('') };
  };
  // the river: in from the far left, round the town's east side, past its gate, and out toward us at the left
  const RIVER = [[-1700, 1265], [-900, 1267], [-200, 1269], [400, 1270], [960, 1268], [1180, 1278], [1236, 1300], [1130, 1326], [820, 1346], [300, 1372], [-300, 1420], [-800, 1500], [-1150, 1620], [-1350, 1800]];
  const river = (D) => {
    const s = crSample(RIVER, 8), Lf = [], Rt = [];
    s.forEach((p, i) => { const a = s[Math.max(0, i - 1)], b = s[Math.min(s.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, k = kV(p[1]), w = (1.4 + 66 * k) / 2, wy = w * (0.35 + 0.65 * Math.abs(dx / l)); Lf.push([p[0] - dy / l * w, p[1] + dx / l * wy]); Rt.push([p[0] + dy / l * w, p[1] - dx / l * wy]); });
    const d = 'M' + Lf.map(P2).join(' L') + ' L' + Rt.slice().reverse().map(P2).join(' L') + 'Z';
    return `<path d="${d}" fill="${D ? '#5a4a52' : '#3e5636'}" stroke="${D ? '#5a4a52' : '#3e5636'}" stroke-width="4"/><path d="${d}" fill="${D ? '#d8968a' : '#9cbccc'}"/>` +
      `<path d="${crPath(RIVER.map(([x, y]) => [x, y - 0.6]))}" stroke="${D ? '#ffd8b0' : '#e8f2f4'}" stroke-width="1.6" fill="none" opacity="0.6"/>`;
  };
  // the walled town on the river: the ring wall with towers, packed houses and their roofs, two churches with spires,
  // the gate and the bridge; returns the town and (for dusk) its lit windows separately
  const town = (D, haze) => {
    const r = rng(1284), [cx, cy] = VAL.TOWN, rx = 200, ry = 28, hz = 0.3, H = c => mix(c, haze, hz);
    let g = `<ellipse cx="${cx}" cy="${cy + 2}" rx="${rx + 10}" ry="${ry + 6}" fill="${H('#7e8064')}"/>`, lights = '';
    g += `<path d="M${cx - rx},${cy} A${rx},${ry} 0 0 1 ${cx + rx},${cy}" stroke="${H('#9a9282')}" stroke-width="7" fill="none"/>`;
    const church = (x, y, w, tall) => `<rect x="${f(x)}" y="${f(y - 11)}" width="${f(w)}" height="11" fill="${H('#bab0a0')}"/><path d="M${f(x - 1)},${f(y - 11)} L${f(x + 4)},${f(y - 20)} L${f(x + w - 4)},${f(y - 20)} L${f(x + w + 1)},${f(y - 11)}Z" fill="${H('#5a5a64')}"/>` +
      `<rect x="${f(x + w)}" y="${f(y - tall)}" width="8" height="${f(tall)}" fill="${H('#b0a696')}"/><path d="M${f(x + w - 1)},${f(y - tall)} L${f(x + w + 4)},${f(y - tall - 22)} L${f(x + w + 9)},${f(y - tall)}Z" fill="${H('#4e6a5e')}"/><rect x="${f(x + w + 3)}" y="${f(y - tall + 6)}" width="2" height="3" fill="${H('#2a2420')}"/>`;
    for (let row = 0; row < 9; row++) {
      const y = cy - ry * 0.8 + row * (ry * 1.7 / 8), half = rx * Math.sqrt(Math.max(0, 1 - ((y - cy) / (ry * 1.08)) ** 2)) - 8;
      if (row === 4) g += church(cx - 70, y, 34, 34) + church(cx + 40, y + 4, 28, 28);
      for (let x = cx - half; x < cx + half; x += 8 + r() * 5) {
        const w = 8 + r() * 6, h = 5 + r() * 4, rh = 4 + r() * 4;
        g += `<rect x="${f(x)}" y="${f(y - h)}" width="${f(w)}" height="${f(h)}" fill="${H(PLASTER[Math.floor(r() * 5)])}"/><path d="M${f(x - 1)},${f(y - h)} L${f(x + w / 2)},${f(y - h - rh)} L${f(x + w + 1)},${f(y - h)}Z" fill="${H(['#8a4430', '#6a3a2a', '#7a4a3a', '#5e4a46', '#9a5434'][Math.floor(r() * 5)])}"/>`;
        if (r() < 0.35) lights += `<rect x="${f(x + w * (0.2 + 0.4 * r()))}" y="${f(y - h * 0.72)}" width="1.8" height="1.8" fill="#ffd890"/>`;
      }
    }
    g += `<path d="M${cx - rx},${cy} A${rx},${ry} 0 0 0 ${cx + rx},${cy}" stroke="${H('#a8a090')}" stroke-width="8" fill="none"/><path d="M${cx - rx},${cy - 4} A${rx},${ry} 0 0 0 ${cx + rx},${cy - 4}" stroke="${H('#d0c8b4')}" stroke-width="1.5" fill="none" opacity="0.8"/>`;
    for (const a of [12, 48, 90, 132, 168, 205, 335]) { const t = a * Math.PI / 180, x = cx + rx * Math.cos(t), y = cy + ry * Math.sin(t) + 2, big = a === 90; g += `<rect x="${f(x - (big ? 8 : 5))}" y="${f(y - (big ? 22 : 16))}" width="${big ? 16 : 10}" height="${big ? 22 : 16}" fill="${H('#a49c8c')}"/><path d="M${f(x - (big ? 9 : 6))},${f(y - (big ? 22 : 16))} L${f(x)},${f(y - (big ? 34 : 25))} L${f(x + (big ? 9 : 6))},${f(y - (big ? 22 : 16))}Z" fill="${H('#7a3a2a')}"/>` + (big ? `<rect x="${f(x - 3)}" y="${f(y - 9)}" width="6" height="9" fill="${H('#2a2018')}"/>` : ''); }
    // the bridge from the gate over the river
    g += `<path d="M${cx - 4},${cy + ry + 3} L${cx + 6},${cy + ry + 3} L${cx + 14},${cy + ry + 34} L${cx + 2},${cy + ry + 34}Z" fill="${H('#b8b0a0')}"/><path d="M${cx + 6},${cy + ry + 3} L${cx + 14},${cy + ry + 34}" stroke="${H('#6a6458')}" stroke-width="1.4"/>`;
    // chimney smoke
    for (let i = 0; i < 4; i++) g += `<ellipse cx="${f(cx - 120 + i * 80 + 10)}" cy="${f(cy - 36 - i % 2 * 6)}" rx="${f(16 + i * 3)}" ry="5" fill="${D ? '#8a7a8a' : '#d8dcdc'}" opacity="0.4" filter="url(#b4)"/>`;
    return { g, lights };
  };
  const valley = D => {
    const haze = D ? '#b4889a' : '#c0ccd0';
    const far = ridgePts(-3200, 5200, 1252, 130, 91, 220), near = ridgePts(-3200, 5200, 1264, 44, 95, 140);
    let g = `<defs>${LG('htvh' + D, [[0, haze, 0], [0.55, haze, 0.55], [1, haze, 0]])}</defs>`;
    g += `<path d="${crPath(far)} L5400,2800 L-3200,2800Z" fill="${D ? '#7a6888' : '#90a2b4'}"/>`;
    g += `<path d="${crPath(near)} L5400,2800 L-3200,2800Z" fill="${D ? '#5a5268' : '#6e8670'}"/>`;
    { const r = rng(96); for (let i = 0; i < near.length - 1; i++) { const a = near[i], b = near[i + 1]; for (let u = 0; u < 1; u += 0.1 + r() * 0.1) g += `<circle cx="${f(lerp(a[0], b[0], u))}" cy="${f(lerp(a[1], b[1], u) + 3)}" r="${f(5 + r() * 6)}" fill="${D ? '#4a4458' : '#5a7058'}"/>`; } }
    g += `<rect x="-3200" y="${VAL.YH - 70}" width="8600" height="110" fill="url(#htvh${D})"/>`;
    g += `<rect x="-3200" y="${VAL.YH - 2}" width="8600" height="1600" fill="${mix('#7e9a50', haze, 0.3)}"/>`;
    const fm = farmland(-1500, 3000, 101, haze), tw = town(D, haze);
    g += fm.fields + fm.hedges + river(D) + fm.trees + tw.g;
    if (D) g += `<rect x="-3200" y="1100" width="8600" height="1800" fill="#2a1a3a" opacity="0.38"/>` + `<g opacity="0.95">${tw.lights}</g>`;
    return g;
  };

  // ======================================================= THE ROCK at the summit (layer p 0.85): a tor of weathered slabs stacked
  // in tiers, split by joints into rounded pillars, each tier set back and offset from the one below so its top shows as a
  // ledge; lit from the upper left by day and from the sunset at the right at dusk; runnels, grain, lichen, moss, and
  // the dark seam where the hill closed. The top slab is flat where he stands. [x0, x1, bottom, top, corner]
  const TOR = [
    [-440, -186, 0, -206, 54], [-192, 120, 0, -248, 62], [114, 430, 0, -226, 58], [424, 742, 0, -176, 52],
    [-332, -56, -192, -410, 56], [-62, 264, -232, -448, 60], [258, 550, -212, -372, 52],
    [-214, 66, -398, -570, 48], [60, 354, -436, -542, 44],
    [-112, 176, -556, -696, 42]
  ];
  const torBlock = ([x0, x1, yb, yt, rr], T) => { const w = x1 - x0, k = Math.min(rr, w / 2), dome = 7; return 'M' + [P2(T([x0, yb])), P2(T([x0, yt + k]))].join(' L') + ` Q${P2(T([x0, yt]))} ${P2(T([x0 + k, yt]))} Q${P2(T([(x0 + x1) / 2, yt - dome]))} ${P2(T([x1 - k, yt]))} Q${P2(T([x1, yt]))} ${P2(T([x1, yt + k]))} L${P2(T([x1, yb]))}Z`; };
  const rock = D => {
    const [rx, ry] = HT.ROCK, T = p => [rx + p[0], ry + p[1]], r = rng(503);
    const LIT = D ? '#5e5068' : '#bfb6a2', MID = D ? '#86767a' : '#a0988a', SHD = D ? '#c48a68' : '#6c665c';
    let g = `<defs>${LG('htrg' + D, [[0, LIT], [0.42, MID], [1, SHD]], 1, 0)}${LG('htrt' + D, [[0, D ? '#f0b080' : '#f2ead8', 0.55], [1, D ? '#f0b080' : '#f2ead8', 0]])}</defs><ellipse cx="${rx + 150}" cy="${ry + 4}" rx="700" ry="42" fill="#141008" opacity="0.32" filter="url(#b8)"/>`;
    // boulders broken off at its foot
    for (const [bx, br, sd] of [[-560, 92, 1], [860, 72, 2], [-300, 50, 3]]) { const rr = rng(sd + 40), pts = []; for (let i = 0; i < 9; i++) { const a = Math.PI + i / 8 * Math.PI, k = 0.8 + rr() * 0.3; pts.push([bx + Math.cos(a) * br * k * 1.3, Math.sin(a) * br * k * (i === 0 || i === 8 ? 0 : 1)]); } g += `<path d="${poly(pts.map(T))}" fill="url(#htrg${D})" ${olr(1.8)}/>`; }
    TOR.forEach((b, i) => {
      const [x0, x1, yb, yt] = b, d = torBlock(b, T), cid = `htb${D}_${i}`;
      g += `<defs><clipPath id="${cid}"><path d="${d}"/></clipPath></defs><path d="${d}" fill="url(#htrg${D})"/><g clip-path="url(#${cid})">`;
      // the top surface catching the light, rain runnels down the face, grain, lichen, a crack or two
      g += `<rect x="${f(rx + x0)}" y="${f(ry + yt - 10)}" width="${x1 - x0}" height="34" fill="url(#htrt${D})"/>`;
      for (let j = 0; j < 4 + (x1 - x0) / 60; j++) { const x = x0 + 14 + r() * (x1 - x0 - 28), l = 24 + r() * 70; g += `<path d="M${P2(T([x, yt + 14]))} q${f((r() - 0.5) * 8)},${f(l * 0.5)} ${f((r() - 0.5) * 6)},${f(l)}" stroke="#2e2a24" stroke-width="${f(1.6 + r() * 1.6)}" fill="none" opacity="0.32"/>`; }
      for (let j = 0; j < (x1 - x0) * (yb - yt) / -1400; j++) g += `<circle cx="${f(rx + x0 + r() * (x1 - x0))}" cy="${f(ry + yb + r() * (yt - yb))}" r="${f(1.2 + r() * 2.2)}" fill="${r() < 0.5 ? '#2e2a24' : '#f4eedc'}" opacity="0.15"/>`;
      for (let j = 0; j < 3; j++) g += `<ellipse cx="${f(rx + x0 + 20 + r() * (x1 - x0 - 40))}" cy="${f(ry + yt + 20 + r() * (yb - yt - 40))}" rx="${f(8 + r() * 16)}" ry="${f(5 + r() * 9)}" fill="${['#c8c070', '#d8a058', '#b8c890'][j]}" opacity="0.4"/>`;
      if (r() < 0.6) { let x = x0 + 30 + r() * (x1 - x0 - 60), y = yt + 10, dd = `M${P2(T([x, y]))}`; for (let j = 0; j < 4; j++) { x += (r() - 0.5) * 22; y += (yb - yt) / 4; dd += ` L${P2(T([x, y]))}`; } g += `<path d="${dd}" stroke="#221e1a" stroke-width="2.4" fill="none" opacity="0.5"/>`; }
      g += `<rect x="${f(rx + x0)}" y="${f(ry + yb - 30)}" width="${x1 - x0}" height="30" fill="#1a1612" opacity="0.18"/></g>`;
      // moss tufts on the top, the outline
      for (let j = 0; j < 2 + (x1 - x0) / 120; j++) g += `<ellipse cx="${f(rx + x0 + 24 + r() * (x1 - x0 - 48))}" cy="${f(ry + yt + 2 + r() * 6)}" rx="${f(12 + r() * 22)}" ry="${f(4 + r() * 5)}" fill="${D ? mix('#4a6a3a', '#4e4068', 0.4) : ['#5a7a3a', '#6a8a42', '#4e6e32'][j % 3]}" opacity="0.85"/>`;
      g += `<path d="${d}" fill="none" ${olr(2)}/>`;
    });
    // the seam where the hill closed: the joint between the two middle pillars of the bottom tier, black and deep
    const sm = [[116, 0], [110, -70], [122, -140], [114, -200], [118, -244]].map(T);
    g += `<path d="${taper(sm, 60, 14)}" fill="#120e0a" opacity="0.5" filter="url(#b8)"/><path d="${taper(sm, 24, 6)}" fill="#0a0806"/>`;
    // at dusk a rim of sunset light along the right-hand edges
    if (D) for (const [x0, x1, yb, yt] of TOR) g += `<path d="M${P2(T([x1 - 30, yt + 2]))} Q${P2(T([x1, yt]))} ${P2(T([x1, yt + 30]))} L${P2(T([x1, yb]))}" stroke="#ffb070" stroke-width="4" fill="none" opacity="0.75"/>`;
    // grass and stones round its foot
    for (let i = 0; i < 40; i++) { const x = rx - 600 + r() * 1540, h = 18 + r() * 30, w = 5 + r() * 5, lean = (r() - 0.5) * 14; g += `<path d="M${f(x - w)},${ry + 6} Q${f(x + lean * 0.4)},${f(ry - h * 0.5)} ${f(x + lean)},${f(ry - h)} Q${f(x + lean * 0.4 + w * 0.3)},${f(ry - h * 0.5)} ${f(x + w)},${ry + 6}Z" fill="${D ? mix('#4a6a32', '#4a3858', 0.4) : ['#4a6a32', '#6a8a42', '#5a7a3a'][i % 3]}"/>`; }
    return g;
  };

  // ======================================================= THE HILL GROUND (layer p 1): the slope's crest, the worn path
  const EDGE = crSample([[-3600, 1900], [-2400, 1846], [-1400, 1790], [-600, 1742], [200, 1700], [1000, 1652], [1700, 1606], [2300, 1578], [2800, 1566], [3400, 1566], [4400, 1580]], 10);
  const PATH = [[-3600, 1990], [-2400, 1914], [-1400, 1850], [-600, 1808], [200, 1768], [1000, 1722], [1700, 1662], [2200, 1624], [2500, 1606], [2760, 1592]];
  // a wind-bent hawthorn: tapered trunk and limbs swept east, a crown sheared flat on the windward side, late blossom
  const hawthorn = (x, y, s, seed) => {
    const r = rng(seed), T = p => [x + p[0] * s, y + p[1] * s];
    let g = `<defs>${LG('hthk', [[0, '#6a5440'], [0.5, '#4a3a2a'], [1, '#2a2018']], 1, 0)}</defs><ellipse cx="${f(x + 60 * s)}" cy="${f(y + 6)}" rx="${f(260 * s)}" ry="${f(26 * s)}" fill="#1a2410" opacity="0.35" filter="url(#b8)"/>`;
    const limbs = [[[-10, 0], [-46, -160], [60, -300], 76, 46], [[60, -300], [180, -330], [330, -436], 44, 12], [[60, -300], [36, -420], [110, -520], 40, 12], [[30, -230], [-60, -300], [-170, -392], 30, 9], [[110, -520], [190, -566], [270, -560], 14, 5], [[200, -360], [240, -420], [230, -500], 16, 5], [[-40, -280], [-40, -360], [-10, -430], 14, 5]];
    for (const [a, c, b, w0, w1] of limbs) g += `<path d="${taper(qpts(a, c, b).map(T), w0 * s, w1 * s)}" fill="url(#hthk)" ${olr(1.4, 0.5)}/>`;
    for (let i = 0; i < 6; i++) g += `<path d="M${P2(T([-14 + i * 9, -20 - i * 6]))} Q${P2(T([-30 + i * 10, -150]))} ${P2(T([40 + i * 6, -280]))}" stroke="#20160e" stroke-width="${f(2.2 * s)}" fill="none" opacity="0.35"/>`;
    // the crown
    const blobs = []; for (let i = 0; i < 44; i++) { const a = r() * TAU, d = Math.sqrt(r()); blobs.push([90 + Math.cos(a) * d * 330 + Math.max(0, Math.sin(a)) * 40, -500 + Math.sin(a) * d * 130 - Math.cos(a) * d * 40, 44 + r() * 46]); }
    blobs.sort((a, b) => a[1] - b[1]);
    let crown = blobs.map(([bx, by, br]) => `<circle cx="${f(x + bx * s)}" cy="${f(y + by * s)}" r="${f(br * s)}" fill="#2e4424"/>`).join('');
    crown += blobs.map(([bx, by, br]) => `<circle cx="${f(x + (bx - br * 0.14) * s)}" cy="${f(y + (by - br * 0.2) * s)}" r="${f(br * 0.8 * s)}" fill="#4a6a32"/>`).join('');
    crown += blobs.filter((b, i) => i % 2 === 0).map(([bx, by, br]) => `<circle cx="${f(x + (bx - br * 0.3) * s)}" cy="${f(y + (by - br * 0.36) * s)}" r="${f(br * 0.46 * s)}" fill="#7a9a48" opacity="0.9"/>`).join('');
    for (let i = 0; i < 46; i++) { const [bx, by, br] = blobs[Math.floor(r() * blobs.length)], a = r() * TAU; crown += `<circle cx="${f(x + (bx + Math.cos(a) * br * 0.7) * s)}" cy="${f(y + (by + Math.sin(a) * br * 0.6 - br * 0.2) * s)}" r="${f((3 + r() * 3) * s)}" fill="#f6eee6" opacity="0.85"/>`; }
    return g + `<g filter="url(#leaf)">${crown}</g>`;
  };
  const ground = () => {
    const r = rng(97), FY = HT.FY, top = x => yOn(EDGE, x);
    let g = `<defs>${LG('htgr', [[0, '#84a650'], [0.3, '#6a8c40'], [1, '#3e5a2a']])}<clipPath id="htgc"><path d="M${P2(EDGE[0])} ${EDGE.slice(1).map(p => 'L' + P2(p)).join(' ')} L4400,3900 L-3600,3900Z"/></clipPath></defs>`;
    g += `<path d="M${P2(EDGE[0])} ${EDGE.slice(1).map(p => 'L' + P2(p)).join(' ')} L4400,3900 L-3600,3900Z" fill="url(#htgr)"/><g clip-path="url(#htgc)">`;
    // mottled turf
    for (let i = 0; i < 220; i++) { const x = -3500 + r() * 7800, y = top(x) + 10 + r() * 1900, w = 50 + r() * 200; g += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(w)}" ry="${f(w * (0.1 + r() * 0.12))}" fill="${['#5e7e36', '#8aaa52', '#5a7a34', '#9aaa5a', '#76963e'][i % 5]}" opacity="${f(0.1 + r() * 0.12)}"/>`; }
    // the path: a dark worn border, the dusty track, a paler trodden middle, pebbles, grass creeping in at its edges
    const pd = crPath(PATH);
    g += `<path d="${pd}" stroke="#7a6a4e" stroke-width="104" fill="none" stroke-linecap="round" opacity="0.55"/><path d="${pd}" stroke="#bea47c" stroke-width="88" fill="none" stroke-linecap="round"/><path d="${pd}" stroke="#d2ba92" stroke-width="40" fill="none" stroke-linecap="round" opacity="0.55"/>`;
    const ps = crSample(PATH, 12);
    for (let i = 0; i < 90; i++) { const p = ps[Math.floor(r() * (ps.length - 1))], dy = (r() - 0.5) * 70, w = 3 + r() * 6; g += `<ellipse cx="${f(p[0] + (r() - 0.5) * 30)}" cy="${f(p[1] + dy)}" rx="${f(w)}" ry="${f(w * 0.6)}" fill="${['#8a8070', '#9a9080', '#7a7262'][i % 3]}"/><path d="M${f(p[0] - w * 0.6)},${f(p[1] + dy - w * 0.3)} q${f(w * 0.6)},${f(-w * 0.4)} ${f(w * 1.2)},0" stroke="#efe6d4" stroke-width="1.2" fill="none" opacity="0.5"/>`; }
    // tufts of grass, bigger nearer us
    const tuft = (x, y, k, seed2) => { const rr = rng(seed2); let t = ''; const n = 3 + Math.floor(rr() * 3); for (let i = 0; i < n; i++) { const h = (16 + rr() * 26) * k, w = (3.5 + rr() * 3) * k, lean = (rr() - 0.4) * 22 * k, bx = x + (i - n / 2) * 5 * k; t += `<path d="M${f(bx - w)},${f(y)} Q${f(bx + lean * 0.3)},${f(y - h * 0.55)} ${f(bx + lean)},${f(y - h)} Q${f(bx + lean * 0.3 + w * 0.4)},${f(y - h * 0.5)} ${f(bx + w)},${f(y)}Z" fill="${['#3e5e2a', '#5e8238', '#7a9e48', '#4a6e30'][(i + seed2) % 4]}"/>`; } return t; };
    for (let i = 0; i < 280; i++) { const x = -3500 + r() * 7800, y = top(x) + 6 + Math.pow(r(), 1.4) * 1500, k = 0.8 + (y - top(x)) / 500; g += tuft(x, y, Math.min(2.6, k), 300 + i); }
    // wildflowers in little clusters, stones
    for (let i = 0; i < 56; i++) { const x = -3400 + r() * 7600, y0 = top(x) + 14 + r() * 900, col = ['#f4f0e8', '#f0d050', '#b890d8', '#e8a0b8', '#f4f0e8'][i % 5], k = 0.8 + (y0 - top(x)) / 600; for (let j = 0; j < 3 + r() * 4; j++) { const fx = x + (r() - 0.5) * 70 * k, fy = y0 + (r() - 0.5) * 20 * k, fr = (3 + r() * 2.5) * k; g += `<path d="M${f(fx)},${f(fy + fr * 3)} L${f(fx)},${f(fy)}" stroke="#4a6a30" stroke-width="${f(1.2 * k)}"/><circle cx="${f(fx)}" cy="${f(fy)}" r="${f(fr)}" fill="${col}"/><circle cx="${f(fx)}" cy="${f(fy)}" r="${f(fr * 0.35)}" fill="${col === '#f0d050' ? '#c88a20' : '#e8c040'}"/>`; } }
    for (let i = 0; i < 30; i++) { const x = -3400 + r() * 7600, y = top(x) + 30 + r() * 1200, k = 0.8 + (y - top(x)) / 500, w = (10 + r() * 16) * k; g += `<ellipse cx="${f(x + 4 * k)}" cy="${f(y + 3 * k)}" rx="${f(w * 1.05)}" ry="${f(w * 0.4)}" fill="#1a2410" opacity="0.3"/><path d="M${f(x - w)},${f(y)} C${f(x - w)},${f(y - w * 0.9)} ${f(x + w)},${f(y - w * 0.9)} ${f(x + w)},${f(y)}Z" fill="${['#9a9488', '#8a8478', '#a8a294'][i % 3]}" ${olr(1.2, 0.5)}/><path d="M${f(x - w * 0.6)},${f(y - w * 0.45)} q${f(w * 0.5)},${f(-w * 0.3)} ${f(w)},0" stroke="#e8e2d2" stroke-width="${f(1.6 * k)}" fill="none" opacity="0.5"/>`; }
    // a gorse bush or two along the crest
    for (const [bx, sz, sd] of [[-1900, 1.0, 5], [1150, 0.8, 6], [3500, 1.1, 7], [-3000, 0.9, 8]]) { const by = top(bx) + 10, rr = rng(sd); let b = ''; for (let i = 0; i < 14; i++) { const a = rr() * Math.PI, d = rr(); b += `<circle cx="${f(bx + Math.cos(a) * d * 120 * sz)}" cy="${f(by - Math.sin(a) * d * 70 * sz)}" r="${f((24 + rr() * 18) * sz)}" fill="${['#33482a', '#4a6236', '#5a7240'][i % 3]}"/>`; } for (let i = 0; i < 16; i++) b += `<circle cx="${f(bx + (rr() - 0.5) * 220 * sz)}" cy="${f(by - rr() * 90 * sz)}" r="${f(3 * sz)}" fill="#f0c840"/>`; g += `<g filter="url(#leaf)">${b}</g>`; }
    g += '</g>';
    return g + hawthorn(HT.TREE[0], HT.TREE[1], 1.25, 611);
  };

  S.htop = (t, o = {}) => {
    const L = [], dk = o.dusk || 0, D = dk > 0.5 ? 1 : 0;
    // the sky: day blue with cumulus; at dusk violet to gold, cloud streaks lit from below, the sun's glow off to the right
    L.push({ p: 0.15, svg: once('htsky' + D, () => {
      let g = `<defs>${LG('htsk' + D, D ? [[0, '#1c1c40'], [0.36, '#46305e'], [0.5, '#9a4a6c'], [0.6, '#dc7652'], [0.68, '#f6a468'], [0.76, '#ffcc8a'], [1, '#ffdca4']] : [[0, '#5a8ed0'], [0.45, '#9cc0e4'], [0.66, '#d4e4ee'], [1, '#eef2ea']])}</defs><rect x="-4000" y="-2400" width="10000" height="5000" fill="url(#htsk${D})"/>`;
      if (D) {
        g += C.radial(1720, 1170, 1150, '#ffb070', 0.5, 'screen') + C.radial(1640, 1200, 360, '#fff0c4', 0.45, 'screen');
        const r = rng(77);
        for (let i = 0; i < 12; i++) { const x = -1300 + r() * 3600, y = 420 + r() * 660, w = 260 + r() * 520, h = 16 + r() * 22; g += E.streak(x, y, w, h, '#5a3a6a', 0.55) + E.streak(x + 30, y + h * 0.7, w * 0.85, h * 0.4, ['#ff9a6a', '#ffb880', '#f08aa0'][i % 3], 0.75); }
      } else g += E.cloud(-700, 260, 1000, 230, 23) + E.cloud(900, 120, 900, 200, 29) + E.cloud(2300, 300, 820, 190, 31) + E.cloud(-2100, 160, 760, 170, 37);
      return g;
    }) });
    L.push({ p: 0.4, svg: once('htvalley' + D, () => valley(D)) });
    L.push({ p: 0.85, svg: once('htrock' + D, () => rock(D)) });
    L.push({ p: 1, svg: once('htground', ground) });
    // grass in front of the lens, bending in the wind: blades fixed in the world on a grid (only the cells in view are
    // drawn), so they slide past with the parallax instead of riding along with the camera
    { const v = G.ENG && G.ENG.viewRect ? G.ENG.viewRect(1.2) : null, x0 = v ? v[0] - 200 : -2400, x1 = v ? v[2] + 200 : 3200, STEP = 70; let g = ''; for (let c = Math.floor(x0 / STEP); c * STEP < x1; c++) { const r = rng(5000 + c * 13), x = c * STEP + r() * STEP, y = 2350 + r() * 250, h = 170 + r() * 170, w = 8 + r() * 10, sw = (Math.sin(t * 2.1 + c * 0.7) * 22 + 16), i = ((c % 4) + 4) % 4; g += `<path d="M${f(x - w)},${f(y)} Q${f(x + sw * 0.4 - w * 0.3)},${f(y - h * 0.5)} ${f(x + sw * 1.4)},${f(y - h)} Q${f(x + sw * 0.4 + w * 0.3)},${f(y - h * 0.5)} ${f(x + w)},${f(y)}Z" fill="${mix(['#4a6a32', '#6a8a42', '#5a7a3a', '#7a9a4a'][i], '#4a2a3a', dk * 0.45)}"/>`; } L.push({ p: 1.2, svg: `<g filter="url(#dof2)">${g}</g>` }); }
    L.push({ p: 1, light: true, svg: dk > 0.01 ? `<rect x="-6000" y="-4000" width="14000" height="10000" fill="#3a1a3a" opacity="${f(0.28 * dk)}" style="mix-blend-mode:multiply"/>` + C.radial(3900, 1250, 2300, '#ff9a50', 0.32 * dk, 'screen') : C.radial(800, -200, 3000, '#fff8e4', 0.12, 'screen') });
    return L;
  };

  // ======================================================= THE BEDROOM, centuries later (the same layout as sets19.js; the bed
  // now has a front: the quilt falls over its foot to a hem, then a dark gap and two short legs down to the floor)
  const HB = S.HB = { FY: 1760, BED: [360, 1280, 1420], LAMP: [1260, 1300], WIN: [-420, 380, 420, 560] };
  const prevBed = S.bedroom;
  S.bedroom = (t, o = {}) => {
    const L0 = prevBed(t, o), [x0, x1, by] = HB.BED;
    const quilt = once('hbquilt2', () => {
      // (the patch colours softened toward the night so the quilt doesn't shout)
      const cols = ['#b8423a', '#e0b844', '#3a6aa8', '#4a8a5a', '#e8e2d4', '#a85a8a'].map(c => mix(c, '#7a7486', 0.24)), W = (x1 - x0 + 160) / 6;
      let g = `<rect x="${x0 - 70}" y="${by + 150}" width="${x1 - x0 + 140}" height="${HB.FY - by - 150}" fill="#160e08"/>`;
      g += [x0 - 66, x1 + 40].map(x => `<rect x="${x}" y="${by + 150}" width="26" height="${HB.FY - by - 150}" fill="#6a4426" ${olr(1.4)}/>`).join('');
      // the top of the quilt (foreshortened) and the part hanging over the foot (deeper, a little darker)
      const topD = `M${x0 - 60},${by - 200} C${x0 + 200},${by - 262} ${x1 - 200},${by - 262} ${x1 + 60},${by - 200} L${x1 + 80},${by + 30} C${x1 - 200},${by + 46} ${x0 + 200},${by + 46} ${x0 - 80},${by + 30}Z`;
      const sideD = `M${x0 - 80},${by + 30} C${x0 + 200},${by + 46} ${x1 - 200},${by + 46} ${x1 + 80},${by + 30} L${x1 + 86},${by + 196} C${x1 - 160},${by + 214} ${x0 + 160},${by + 214} ${x0 - 86},${by + 196}Z`;
      g += `<defs><clipPath id="hbqt"><path d="${topD}"/></clipPath><clipPath id="hbqs"><path d="${sideD}"/></clipPath>${LG('hbqsh', [[0, '#000', 0], [1, '#000', 0.35]])}</defs>`;
      g += `<path d="${topD}" fill="#c8a070"/><g clip-path="url(#hbqt)">`;
      for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) { const x = x0 - 80 + i * W, y = by - 262 + j * 100; g += `<rect x="${f(x + 6)}" y="${f(y + 6)}" width="${f(W - 12)}" height="88" fill="${cols[(i + j * 2) % 6]}" opacity="0.88" stroke="#f4f0e6" stroke-width="3" stroke-dasharray="8 6"/>`; }
      g += `</g><path d="${sideD}" fill="#b89060"/><g clip-path="url(#hbqs)">`;
      for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) { const x = x0 - 86 + i * (W + 2), y = by + 30 + j * 92; g += `<rect x="${f(x + 6)}" y="${f(y + 6)}" width="${f(W - 10)}" height="82" fill="${cols[(i + j * 2 + 3) % 6]}" opacity="0.85" stroke="#f4f0e6" stroke-width="3" stroke-dasharray="8 6"/>`; }
      g += `<rect x="${x0 - 100}" y="${by + 20}" width="${x1 - x0 + 200}" height="200" fill="url(#hbqsh)"/>`;
      for (let i = 1; i < 5; i++) g += `<path d="M${f(x0 - 40 + i * (x1 - x0 + 80) / 5)},${by + 44} q${f(-8 + 16 * (i % 2))},80 0,160" stroke="#3a2210" stroke-width="5" fill="none" opacity="0.25"/>`;
      g += `</g><path d="${topD}" fill="none" ${olr(2)}/><path d="${sideD}" fill="none" ${olr(2)}/><path d="M${x0 - 80},${by + 30} C${x0 + 200},${by + 46} ${x1 - 200},${by + 46} ${x1 + 80},${by + 30}" stroke="#fff4e0" stroke-width="3" fill="none" opacity="0.35"/>`;
      // the night table
      g += `<rect x="${x1 + 120}" y="${by - 220}" width="200" height="${HB.FY - by + 220}" fill="#7a5230" ${olr(1.6)}/><rect x="${x1 + 140}" y="${by - 120}" width="160" height="80" fill="#6a4426" ${olr(1)}/><circle cx="${x1 + 220}" cy="${by - 80}" r="7" fill="#c8a060"/>`;
      return g;
    });
    const [lx, ly] = HB.LAMP;
    const lamp = `<rect x="${lx + 196}" y="${ly - 200}" width="18" height="180" fill="#3a3a3e"/><path d="M${lx + 120},${ly - 200} L${lx + 290},${ly - 200} L${lx + 250},${ly - 330} L${lx + 160},${ly - 330}Z" fill="#f2dca0" ${olr(1.4)}/>` + C.radial(lx + 205, ly - 240, 520, '#ffc870', 0.26, 'screen');
    return L0.map(Lr => Lr.tag === 'quilt' ? Object.assign({}, Lr, { svg: quilt + lamp }) : Lr.light ? Object.assign({}, Lr, { svg: `<rect x="-3000" y="-3000" width="8000" height="8000" fill="#0a1024" opacity="0.3"/>` + C.radial(lx + 205, ly - 240, 1100, '#ffb860', 0.16, 'screen') }) : Lr);
  };
})(window);
