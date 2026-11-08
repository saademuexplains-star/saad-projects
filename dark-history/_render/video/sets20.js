// Sets for "The Pied Piper" (shadow-theatre version): layered silhouettes against a luminous sky. Every layer is one flat
// colour, lighter the farther it is (the morning haze), with a thin rim of light along its top edges from the low sun;
// lit windows, chimney smoke, birds and drifting motes keep it alive. The camera cranes and tracks through the layers.
(function (G) {
  const S = G.SETS, { f, rng } = G.RIG, C = G.CINE, U = G.SIL.util;
  const { poly, blob } = U;
  const lerp = (a, b, t) => a + (b - a) * t, TAU = Math.PI * 2;
  const cache = {}, once = (k, fn) => cache[k] || (cache[k] = fn());
  const LG = (id, stops, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('')}</linearGradient>`;
  const RG = (id, cx, cy, r, stops) => `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${cx}" cy="${cy}" r="${r}">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a ?? 1}"/>`).join('')}</radialGradient>`;
  // a silhouette with a rim of light along the edges that face the light (drawn as a shifted copy underneath)
  const sil = (d, col, rim, dx = 2.5, dy = -2.5, op = 0.9) => (rim ? `<path d="${d}" fill="${rim}" opacity="${op}" transform="translate(${dx},${dy})"/>` : '') + `<path d="${d}" fill="${col}"/>`;

  // ---------------------------------------------------------------- generators
  // a row of houses: steep gables, stepped gables, long eaves; chimneys (with their smoke points) and window spots
  const houses = (x0, x1, base, seed, o = {}) => {
    const r = rng(seed); let x = x0, d = '';
    const wins = [], chim = [];
    while (x < x1) {
      const w = (o.w ?? 150) * (0.75 + r() * 0.7), h = (o.h ?? 260) * (0.7 + r() * 0.7), roof = w * (0.6 + r() * 0.55), k = r();
      const top = base - h;
      if (k < 0.42) d += `M${f(x)},${base} L${f(x)},${f(top)} L${f(x + w / 2)},${f(top - roof)} L${f(x + w)},${f(top)} L${f(x + w)},${base}Z`;
      else if (k < 0.72) {
        const n = 4, sw = w / 2 / n, sh = roof / n; let s = `M${f(x)},${base} L${f(x)},${f(top)}`;
        for (let i = 0; i < n; i++) { const ty = top - (i + 1) * sh; s += ` L${f(x + i * sw)},${f(ty)} L${f(x + (i + 1) * sw)},${f(ty)}`; }
        s += ` L${f(x + w / 2)},${f(top - roof - sh * 0.8)}`;
        for (let i = n - 1; i >= 0; i--) { const ty = top - (i + 1) * sh; s += ` L${f(x + w - (i + 1) * sw)},${f(ty)} L${f(x + w - i * sw)},${f(ty)}`; }
        d += s + ` L${f(x + w)},${f(top)} L${f(x + w)},${base}Z`;
      } else d += `M${f(x)},${base} L${f(x)},${f(top)} L${f(x + w * 0.12)},${f(top - roof * 0.55)} L${f(x + w * 0.88)},${f(top - roof * 0.55)} L${f(x + w)},${f(top)} L${f(x + w)},${base}Z`;
      // a chimney on many roofs, and a dormer now and then
      if (r() < 0.65) { const u = 0.25 + r() * 0.5, ry = k < 0.72 ? top - roof * (1 - Math.abs(2 * u - 1)) : top - roof * 0.55, cx = x + w * u; d += `M${f(cx - 11)},${f(ry + 14)} L${f(cx - 11)},${f(ry - 46)} L${f(cx + 11)},${f(ry - 46)} L${f(cx + 11)},${f(ry + 14)}Z`; chim.push([cx, ry - 46]); }
      for (let i = 0; i < 3; i++) if (r() < (o.lit ?? 0.35)) wins.push([x + w * (0.2 + r() * 0.6), top + h * (0.15 + r() * 0.6), r()]);
      x += w + (o.gap ?? 0) * r();
    }
    return { d, wins, chim };
  };
  // lit windows: warm panes with a cross of mullions and a soft spill of light
  const windows = (wins, s, col = '#ffc87a', t = 0) => wins.map(([x, y, k], i) => {
    const w = 18 * s, h = 26 * s, on = 0.7 + 0.3 * Math.sin(t * 0.7 + i * 2.3);
    return `<rect x="${f(x - w * 2)}" y="${f(y - h * 1.2)}" width="${f(w * 4)}" height="${f(h * 2.4)}" fill="url(#wglow)" opacity="${f(0.5 * on)}"/><rect x="${f(x - w / 2)}" y="${f(y - h / 2)}" width="${f(w)}" height="${f(h)}" fill="${col}" opacity="${f(on)}"/><path d="M${f(x)},${f(y - h / 2)} L${f(x)},${f(y + h / 2)} M${f(x - w / 2)},${f(y)} L${f(x + w / 2)},${f(y)}" stroke="#1a1018" stroke-width="${f(2.5 * s)}"/>`;
  }).join('');
  // chimney smoke: soft puffs rising and drifting on the breeze
  const smoke = (pts, t, col, s = 1) => pts.map(([x, y], i) => {
    let g = '';
    for (let k = 0; k < 6; k++) { const u = ((t * 0.16 + k / 6 + i * 0.37) % 1), px = x + u * 140 * s + Math.sin(u * 5 + i) * 14 * s, py = y - u * 260 * s, rr = (14 + u * 46) * s; g += `<ellipse cx="${f(px)}" cy="${f(py)}" rx="${f(rr * 1.3)}" ry="${f(rr)}" fill="${col}" opacity="${f(0.32 * (1 - u) * Math.min(1, u * 5))}"/>`; }
    return g;
  }).join('');
  // a flock of birds wheeling across
  const birds = (x0, y0, n, t, seed, col, s = 1) => {
    const r = rng(seed); let g = '';
    for (let i = 0; i < n; i++) { const ox = r() * 260 - 130, oy = r() * 120 - 60, x = x0 + ox * s + t * 90 * s, y = y0 + oy * s + Math.sin(t * 1.3 + i) * 10 * s, fl = Math.sin(t * 11 + i * 2.1), w = (9 + r() * 5) * s; g += `<path d="M${f(x - w)},${f(y - fl * w * 0.5)} Q${f(x - w * 0.4)},${f(y - w * 0.2)} ${f(x)},${f(y + w * 0.15)} Q${f(x + w * 0.4)},${f(y - w * 0.2)} ${f(x + w)},${f(y - fl * w * 0.5)}" stroke="${col}" stroke-width="${f(2.2 * s)}" fill="none" stroke-linecap="round"/>`; }
    return g;
  };
  // motes drifting in the low light
  const motes = (x0, x1, y0, y1, n, t, seed, col = '#ffe8c0') => {
    const r = rng(seed); let g = '';
    for (let i = 0; i < n; i++) { const x = x0 + r() * (x1 - x0) + Math.sin(t * 0.5 + i) * 30, y = y0 + (((r() * (y1 - y0)) - t * 18 * (0.3 + r())) % (y1 - y0) + (y1 - y0)) % (y1 - y0); g += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(1.6 + r() * 2.4)}" fill="${col}" opacity="${f(0.25 + r() * 0.35)}"/>`; }
    return g;
  };
  // a Gothic church: nave with buttresses and a steep roof, a tall west tower with a needle spire and a weathercock,
  // a rose window, tall lancets
  const church = (x, base, s, o = {}) => {
    const T = (px, py) => `${f(x + px * s)},${f(base + py * s)}`;
    let d = `M${T(0, 0)} L${T(0, -420)} L${T(30, -440)} L${T(470, -440)} L${T(470, -420)} L${T(520, -420)} L${T(520, 0)}Z`;
    d += `M${T(10, -440)} L${T(240, -700)} L${T(490, -440)}Z`;
    for (let i = 0; i < 5; i++) d += `M${T(40 + i * 100, 0)} L${T(40 + i * 100, -360)} L${T(58 + i * 100, -400)} L${T(76 + i * 100, -360)} L${T(76 + i * 100, 0)}Z`;
    d += `M${T(-180, 0)} L${T(-180, -900)} L${T(-150, -930)} L${T(-30, -930)} L${T(0, -900)} L${T(0, 0)}Z`;
    d += `M${T(-170, -930)} L${T(-90, -1480)} L${T(-10, -930)}Z M${T(-92, -1480)} L${T(-92, -1560)} L${T(-88, -1560)} L${T(-88, -1480)}Z M${T(-108, -1545)} L${T(-72, -1545)} L${T(-72, -1539)} L${T(-108, -1539)}Z`;
    for (const [px, py] of [[-170, -930], [-10, -930]]) d += `M${T(px - 12, py)} L${T(px, py - 80)} L${T(px + 12, py)}Z`;
    const rose = [x + 260 * s, base - 330 * s, 62 * s], lancets = [[110, -250], [210, -250], [310, -250], [410, -250], [-90, -620]].map(([px, py]) => [x + px * s, base + py * s]);
    return { d, rose, lancets };
  };
  // a stained-glass rose window or a lancet glowing from inside
  const roseWin = ([x, y, r], t, cols) => {
    let g = `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r * 2.2)}" fill="url(#wglow)" opacity="0.45"/><circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="#1a1018"/>`;
    for (let i = 0; i < 12; i++) { const a0 = i / 12 * TAU, a1 = (i + 1) / 12 * TAU; g += `<path d="M${f(x)},${f(y)} L${f(x + Math.cos(a0) * r * 0.9)},${f(y + Math.sin(a0) * r * 0.9)} A${f(r * 0.9)},${f(r * 0.9)} 0 0 1 ${f(x + Math.cos(a1) * r * 0.9)},${f(y + Math.sin(a1) * r * 0.9)}Z" fill="${cols[i % cols.length]}" stroke="#1a1018" stroke-width="${f(r * 0.06)}" opacity="${f(0.85 + 0.15 * Math.sin(t + i))}"/>`; }
    return g + `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r * 0.28)}" fill="#e8b84a" stroke="#1a1018" stroke-width="${f(r * 0.06)}"/>`;
  };
  const lancet = ([x, y], s, cols, i) => `<path d="M${f(x - 12 * s)},${f(y + 60 * s)} L${f(x - 12 * s)},${f(y)} L${f(x)},${f(y - 22 * s)} L${f(x + 12 * s)},${f(y)} L${f(x + 12 * s)},${f(y + 60 * s)}Z" fill="${cols[i % cols.length]}" stroke="#1a1018" stroke-width="${f(3 * s)}" opacity="0.9"/>`;
  // a town gate: a square tower with battlements, a pointed arch passage through it (left open: the light shows through)
  const gateTower = (x, base, s) => {
    const T = (px, py) => `${f(x + px * s)},${f(base + py * s)}`;
    let d = `M${T(-210, 0)} L${T(-210, -980)} `;
    for (let i = 0; i < 5; i++) d += `L${T(-210 + i * 84, -1050)} L${T(-210 + i * 84 + 50, -1050)} L${T(-210 + i * 84 + 50, -980)} L${T(-210 + (i + 1) * 84, -980)} `;
    d += `L${T(210, -980)} L${T(210, 0)} L${T(120, 0)} L${T(120, -470)} Q${T(120, -650)} ${T(0, -730)} Q${T(-120, -650)} ${T(-120, -470)} L${T(-120, 0)}Z`;
    d += `M${T(-20, -860)} L${T(20, -860)} L${T(20, -790)} L${T(-20, -790)}Z`;
    // the wall running off outside the town (the town side is open street)
    d += `M${T(-210, 0)} L${T(-210, -560)} L${T(-1400, -560)} L${T(-1400, 0)}Z`;
    for (let i = 0; i < 14; i++) d += `M${T(-1400 + i * 85, -560)} L${T(-1400 + i * 85, -610)} L${T(-1350 + i * 85, -610)} L${T(-1350 + i * 85, -560)}Z`;
    return d;
  };
  // street-level fronts: doors, hanging signs on iron brackets (a pretzel, a boot, a key), a well, barrels
  const street = (x0, x1, base, seed) => {
    const r = rng(seed); let d = '', x = x0;
    const wins = [];
    while (x < x1) {
      const w = 260 + r() * 220, h = 620 + r() * 260;
      d += `M${f(x)},${base} L${f(x)},${f(base - h)} L${f(x + w)},${f(base - h)} L${f(x + w)},${base}Z`;
      // a door: an arched hole would show the sky, so it stays solid; a step and a lantern bracket instead
      if (r() < 0.5) { const bx = x + w * (0.3 + r() * 0.4), by = base - h * (0.55 + r() * 0.15); d += `M${f(bx)},${f(by)} L${f(bx + 110)},${f(by)} L${f(bx + 110)},${f(by + 8)} L${f(bx)},${f(by + 8)}Z M${f(bx + 20)},${f(by)} L${f(bx + 6)},${f(by - 50)} L${f(bx + 12)},${f(by - 50)} L${f(bx + 26)},${f(by)}Z`; const sx = bx + 80, sy = by + 8; const k = Math.floor(r() * 3); d += `M${f(sx - 2)},${f(sy)} L${f(sx - 2)},${f(sy + 26)} L${f(sx + 2)},${f(sy + 26)} L${f(sx + 2)},${f(sy)}Z`; d += k === 0 ? blob([[sx - 34, sy + 60], [sx, sy + 26], [sx + 34, sy + 60], [sx + 18, sy + 92], [sx, sy + 70], [sx - 18, sy + 92]]) : k === 1 ? `M${f(sx - 26)},${f(sy + 30)} L${f(sx + 4)},${f(sy + 30)} L${f(sx + 4)},${f(sy + 70)} L${f(sx + 36)},${f(sy + 78)} L${f(sx + 36)},${f(sy + 92)} L${f(sx - 26)},${f(sy + 92)}Z` : `M${f(sx - 18)},${f(sy + 30)} A18,18 0 1 1 ${f(sx + 18)},${f(sy + 30)} L${f(sx + 6)},${f(sy + 48)} L${f(sx + 6)},${f(sy + 100)} L${f(sx + 20)},${f(sy + 100)} L${f(sx + 20)},${f(sy + 108)} L${f(sx - 6)},${f(sy + 108)} L${f(sx - 6)},${f(sy + 48)} L${f(sx - 18)},${f(sy + 30)}Z`; }
      for (let i = 0; i < 2; i++) if (r() < 0.5) wins.push([x + w * (0.2 + r() * 0.6), base - h * (0.62 + r() * 0.28), r()]);
      // the gap between houses: a narrow alley showing the light
      x += w + (r() < 0.35 ? 60 + r() * 90 : 0);
    }
    return { d, wins };
  };
  // the cobbled street surface: a dark band, the setts' tops catching the light along its edge
  const ground = (x0, x1, y, seed, col, rimCol) => {
    const r = rng(seed); let d = `M${x0},${y} `, rimD = '';
    for (let x = x0; x < x1; x += 26 + r() * 12) { const h = 4 + r() * 5; d += `Q${f(x + 16)},${f(y - h)} ${f(x + 32)},${y} `; }
    d += `L${x1},${y + 1600} L${x0},${y + 1600}Z`;
    // rows of setts catching a little light, larger toward us and fading
    let cob = '';
    for (let k = 0; k < 11; k++) { const yy = y + 16 + k * 14 + k * k * 5, w = 12 + k * 4.5, h = 4 + k * 1.6; for (let x = x0 + (k % 2) * w; x < x1; x += w * 2.1 + r() * w * 0.5) cob += `M${f(x - w)},${f(yy)} Q${f(x)},${f(yy - h)} ${f(x + w)},${f(yy)}`; }
    return sil(d, col, rimCol, 0, -2.5, 0.7) + `<path d="${cob}" stroke="${rimCol}" stroke-width="2" fill="none" opacity="0.13"/>`;
  };

  // ======================================================= DAWN OVER HAMELIN: the street from the gate, the town beyond
  // world: the gate at GATE[0] on the street (p 1), ground line at FY; the Piper walks from the arch to the right.
  const TW = S.TW = { FY: 1700, GATE: 420 };
  S.silTown = (t, o = {}) => {
    const L = [], FY = TW.FY;
    const defs = `<defs>${RG('wglow', 0, 0, 1, [[0, '#ffc070', 0.9], [1, '#ffc070', 0]]).replace('gradientUnits="userSpaceOnUse" ', 'gradientUnits="objectBoundingBox" ').replace('cx="0" cy="0" r="1"', 'cx="0.5" cy="0.5" r="0.5"')}</defs>`;
    // sky: night-blue to rose to gold at the horizon, the sun low at the right behind the hills, a few last stars
    L.push({ p: 0.05, svg: defs + once('twsky', () => `<defs>${LG('twsk', [[0, '#141c38'], [0.3, '#3a3a64'], [0.5, '#8a5a78'], [0.64, '#d9837a'], [0.74, '#f4ad84'], [0.84, '#fcd8a8'], [1, '#fff0d0']])}${RG('twsun', 1500, 1180, 900, [[0, '#fff2c8', 0.75], [0.3, '#ffcf90', 0.35], [1, '#ffb070', 0]])}</defs>` +
      `<rect x="-3000" y="-2600" width="9000" height="4600" fill="url(#twsk)"/><rect x="-3000" y="200" width="9000" height="2000" fill="url(#twsun)"/>` +
      Array.from({ length: 40 }, (_, i) => { const r = rng(i + 90); return `<circle cx="${f(-1500 + r() * 4500)}" cy="${f(-2400 + r() * 1300)}" r="${f(1 + r() * 1.8)}" fill="#fff" opacity="${f(0.3 + r() * 0.5)}"/>`; }).join('') +
      [[-900, 380, 900], [700, 240, 1100], [1900, 520, 800], [-200, 640, 700]].map(([x, y, w], i) => `<ellipse cx="${x}" cy="${y}" rx="${w}" ry="${26 + i * 6}" fill="#e89a8a" opacity="0.32" filter="url(#cloudF)"/><ellipse cx="${x + 40}" cy="${y + 14}" rx="${w * 0.8}" ry="${10 + i * 3}" fill="#ffd0a8" opacity="0.45" filter="url(#cloudF)"/>`).join('')) });
    // far hills, and the hill to the east with the path the children will climb (seen from the start)
    L.push({ p: 0.14, svg: once('twhill', () => sil(`M-3000,1300 C-2000,1180 -1200,1240 -500,1200 C200,1160 700,1060 1300,1080 C1800,1100 2400,1220 3600,1180 L3600,2600 L-3000,2600Z`, '#9a7488', '#ffd8b0', 0, -3, 0.6)) });
    // the distant town and its towers
    L.push({ p: 0.24, svg: once('twfar', () => { const h = houses(-2400, 3400, 1330, 21, { w: 120, h: 170, lit: 0.1 }); const c = church(900, 1330, 0.55); return sil(h.d + c.d + `M-2400,1330 L3400,1330 L3400,2600 L-2400,2600Z`, '#7a5c74', '#ffd2a4', 2, -2, 0.55); }) });
    // the town proper: rows of gables, the church with its glowing rose window, chimneys smoking
    const mid = once('twmid', () => { const h = houses(-2000, 3600, 1480, 33, { w: 170, h: 280, lit: 0.3 }); const c = church(120, 1480, 0.95); return { h, c }; });
    L.push({ p: 0.42, svg: sil(mid.h.d + mid.c.d + `M-2000,1480 L3600,1480 L3600,2800 L-2000,2800Z`, '#523e58', '#ffc896', 2.5, -2.5, 0.75) + windows(mid.h.wins, 0.9, '#ffc87a', t) + roseWin(mid.c.rose, t, ['#c2312a', '#2b56a8', '#e0a020', '#2f7a46']) + mid.c.lancets.map((p, i) => lancet(p, 0.95, ['#c2312a', '#2b56a8', '#e0a020'], i)).join('') + smoke(mid.h.chim, t, '#d8b8c8', 1.0) + birds(-600, 500, 9, t, 4, '#2a1e2e', 1.1) });
    // the houses along the street, set back a little (lighter than anyone walking in front of them), signs and lit windows
    const st = once('twst', () => { const h = houses(TW.GATE + 380, 4800, FY + 30, 51, { w: 300, h: 560, lit: 0.55 }); return { d: h.d, wins: h.wins, chim: h.chim }; });
    L.push({ p: 0.74, svg: sil(st.d, '#33263c', '#ffcf9a', 3, -3, 0.8) + windows(st.wins, 1.6, '#ffc070', t) + smoke(st.chim, t, '#c8a8b8', 1.3) });
    // the gate tower and the town wall on the street's own layer, so he walks out of the glowing arch; the cobbles
    L.push({ p: 1, tag: 'street', svg: once('twgate', () => sil(gateTower(TW.GATE, FY, 1.0), '#120c14', '#ffcf9a', 3, -3, 0.85) + ground(-2000, 4400, FY, 61, '#100a10', '#ffcf9a') +
      // low things along the street: a mounting stone, a water butt, a post with a ring
      sil(`M${TW.GATE + 700},${FY} L${TW.GATE + 700},${FY - 70} L${TW.GATE + 820},${FY - 70} L${TW.GATE + 820},${FY}Z M${TW.GATE + 1500},${FY} L${TW.GATE + 1485},${FY - 150} Q${TW.GATE + 1560},${FY - 170} ${TW.GATE + 1635},${FY - 150} L${TW.GATE + 1620},${FY}Z M${TW.GATE + 2300},${FY} L${TW.GATE + 2300},${FY - 210} L${TW.GATE + 2322},${FY - 210} L${TW.GATE + 2322},${FY}Z`, '#100a10', '#ffcf9a', 2, -2, 0.7)) });
    // haze where the street meets the light, motes
    L.push({ p: 1, light: true, svg: `<rect x="-2000" y="${FY - 260}" width="6600" height="300" fill="url(#twhz)" opacity="0.5"/><defs>${LG('twhz', [[0, '#ffd8a8', 0], [0.7, '#ffd8a8', 0.35], [1, '#ffd8a8', 0]])}</defs>` + motes(-400, 3000, 600, 1700, 46, t, 7) });
    // the foreground: an inn sign hanging into the top of the frame, a barrel and a post at the bottom (dark, soft,
    // sliding past the lens faster than anything else)
    L.push({ p: 1.4, svg: once('twfg', () => `<g filter="url(#dof2)">${sil(`M2300,2500 L2280,2050 Q2380,2010 2480,2050 L2460,2500Z M3400,2500 L3400,1900 L3440,1900 L3440,2500Z`, '#08060a')}</g>`) });
    return L;
  };
  // ======================================================= THE MARKET SQUARE in the morning: the church and the gables round
  // it, the hill beyond the town (where it will end) far off; a well with its roof and winch, a great linden tree; the
  // children play on the cobbles at SQ.FY, the Piper crosses behind them on the far side (p 0.78, ground SQ.FY2)
  const SQ = S.SQ = { FY: 1720, FYM: 1640, FY2: 1560 };
  S.silSquare = (t, o = {}) => {
    const L = [];
    L.push({ p: 0.05, svg: once('sqsky', () => `<defs>${RG('wglow', 0, 0, 1, [[0, '#ffc070', 0.9], [1, '#ffc070', 0]]).replace('gradientUnits="userSpaceOnUse" ', 'gradientUnits="objectBoundingBox" ').replace('cx="0" cy="0" r="1"', 'cx="0.5" cy="0.5" r="0.5"')}${LG('sqsk', [[0, '#24365e'], [0.36, '#5e6690'], [0.58, '#c89090'], [0.72, '#f4bb8e'], [0.84, '#fde0b4'], [1, '#fff3dc']])}${RG('sqsun', 1900, 1100, 900, [[0, '#fff4d0', 0.38], [0.35, '#ffd498', 0.16], [1, '#ffb070', 0]])}</defs>` +
      `<rect x="-3000" y="-2600" width="9000" height="4600" fill="url(#sqsk)"/><rect x="-1000" y="-400" width="5000" height="2600" fill="url(#sqsun)"/>` +
      [[-700, 300, 1000], [900, 160, 1200], [2100, 420, 900]].map(([x, y, w], i) => `<ellipse cx="${x}" cy="${y}" rx="${w}" ry="${30 + i * 8}" fill="#f0b0a0" opacity="0.3" filter="url(#cloudF)"/><ellipse cx="${x + 40}" cy="${y + 16}" rx="${w * 0.8}" ry="${12 + i * 3}" fill="#ffe0c0" opacity="0.45" filter="url(#cloudF)"/>`).join('')) });
    // the hills beyond the walls, and on the right the bare hill with its rock where the story will end
    L.push({ p: 0.15, svg: once('sqhill', () => sil(`M-3000,1240 C-1800,1150 -900,1210 -100,1170 C500,1140 900,1100 1400,1020 C1650,980 1850,960 2050,1000 L2090,960 L2130,972 L2170,940 L2210,960 L2240,1010 C2500,1060 3000,1150 3800,1130 L3800,2600 L-3000,2600Z`, '#9c7a8e', '#ffdcb4', 0, -3, 0.6)) });
    L.push({ p: 0.3, svg: once('sqfar', () => { const h = houses(-2600, 3600, 1360, 71, { w: 130, h: 190, lit: 0.08 }); return sil(h.d + `M-2600,1360 L3600,1360 L3600,2600 L-2600,2600Z`, '#7c6078', '#ffd6aa', 2, -2, 0.5); }) });
    // round the square: the church, the gabled houses with their windows, smoke
    const mid = once('sqmid', () => { const h = houses(-1800, 3800, 1600, 77, { w: 210, h: 360, lit: 0.4 }); const c = church(260, 1600, 1.15); return { h, c }; });
    L.push({ p: 0.5, svg: sil(mid.h.d + mid.c.d + `M-1800,1600 L3800,1600 L3800,2800 L-1800,2800Z`, '#4e3a56', '#ffc896', 2.5, -2.5, 0.75) + windows(mid.h.wins, 1.1, '#ffc87a', t) + roseWin(mid.c.rose, t, ['#c2312a', '#2b56a8', '#e0a020', '#2f7a46', '#7a3a8c']) + mid.c.lancets.map((p, i) => lancet(p, 1.15, ['#c2312a', '#2b56a8', '#e0a020'], i)).join('') + smoke(mid.h.chim, t, '#d8b8c8', 1.2) + birds(200, 420, 7, t, 9, '#2a1e2e', 1.2) });
    // the far side of the square, where the Piper walks: the well with its roof and winch, the linden tree
    L.push({ p: 0.78, tag: 'far', svg: once('sqwell', () => {
      const wx = 1350, wy = SQ.FY2;
      let d = `M${wx - 110},${wy} L${wx - 110},${wy - 150} L${wx + 110},${wy - 150} L${wx + 110},${wy}Z M${wx - 96},${wy - 150} L${wx - 96},${wy - 330} L${wx - 82},${wy - 330} L${wx - 82},${wy - 150}Z M${wx + 82},${wy - 150} L${wx + 82},${wy - 330} L${wx + 96},${wy - 330} L${wx + 96},${wy - 150}Z M${wx - 150},${wy - 320} L${wx},${wy - 420} L${wx + 150},${wy - 320}Z M${wx - 82},${wy - 250} L${wx + 82},${wy - 250} L${wx + 82},${wy - 240} L${wx - 82},${wy - 240}Z M${wx - 4},${wy - 250} L${wx - 4},${wy - 200} L${wx + 4},${wy - 200} L${wx + 4},${wy - 250}Z M${wx - 18},${wy - 200} L${wx + 18},${wy - 200} L${wx + 14},${wy - 166} L${wx - 14},${wy - 166}Z`;
      // the linden: a thick trunk, limbs, a canopy of leafy clumps with gaps where the sky shows through
      const tx = 250, ty = SQ.FY2, r = rng(81);
      d += `M${tx - 40},${ty} C${tx - 30},${ty - 200} ${tx - 50},${ty - 380} ${tx - 20},${ty - 520} L${tx + 24},${ty - 520} C${tx + 40},${ty - 380} ${tx + 34},${ty - 200} ${tx + 52},${ty}Z`;
      d += `M${tx - 20},${ty - 500} C${tx - 120},${ty - 600} ${tx - 220},${ty - 640} ${tx - 300},${ty - 720} L${tx - 290},${ty - 735} C${tx - 200},${ty - 670} ${tx - 100},${ty - 630} ${tx},${ty - 540}Z M${tx + 10},${ty - 510} C${tx + 120},${ty - 620} ${tx + 210},${ty - 660} ${tx + 290},${ty - 760} L${tx + 302},${ty - 748} C${tx + 230},${ty - 650} ${tx + 130},${ty - 600} ${tx + 30},${ty - 520}Z`;
      for (let i = 0; i < 46; i++) { const a = r() * Math.PI * 2, rr = Math.sqrt(r()); const cx = tx + Math.cos(a) * rr * 420, cy = ty - 820 + Math.sin(a) * rr * 260, k = 40 + r() * 60; const pts = []; for (let j = 0; j < 9; j++) { const b = j / 9 * Math.PI * 2, q = k * (0.75 + r() * 0.4); pts.push([cx + Math.cos(b) * q, cy + Math.sin(b) * q * 0.85]); } d += blob(pts); }
      return sil(d + `M-2000,${wy} L3600,${wy} L3600,2800 L-2000,2800Z`, '#2c2234', '#ffcf9a', 3, -3, 0.8);
    }) });
    // the middle of the square (a row of children plays here too) and the near side of the cobbles
    L.push({ p: 0.88, tag: 'mid', svg: once('sqgroundm', () => ground(-2400, 4400, SQ.FYM, 85, '#1d1520', '#ffcf9a')) });
    L.push({ p: 1, tag: 'near', svg: once('sqground', () => ground(-2400, 4400, SQ.FY, 83, '#110b12', '#ffcf9a')) });
    L.push({ p: 1, light: true, svg: `<defs>${LG('sqhz', [[0, '#ffd8a8', 0], [0.7, '#ffd8a8', 0.3], [1, '#ffd8a8', 0]])}</defs><rect x="-2400" y="${SQ.FY - 300}" width="6800" height="330" fill="url(#sqhz)" opacity="0.5"/>` + motes(-600, 3000, 500, 1700, 40, t, 13) });
    return L;
  };
  // ---------------------------------------------------------------- props for the square (world units)
  S.silProps = {
    // a wooden hoop seen face-on as it rolls; falling over (toward us) it flattens onto the cobbles about its foot
    hoop: (x, y, r, fall = 0) => `<g transform="translate(${f(x)},${f(y)}) scale(1,${f(Math.max(0.03, Math.cos(fall)))}) translate(0,${f(-r)})"><circle r="${f(r)}" fill="none" stroke="#0c0a0e" stroke-width="${f(r * 0.13)}"/></g>`,
    ball: (x, y, r) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="#0c0a0e"/><circle cx="${f(x + r * 0.3)}" cy="${f(y - r * 0.3)}" r="${f(r * 0.9)}" fill="none" stroke="#ffd7a0" stroke-width="1.5" opacity="0.6"/>`,
    hen: (x, y, s, t, dir, ph) => {
      const peck = Math.max(0, Math.sin(t * 3.1 + ph)) ** 3, T = (px, py) => `${f(x + px * s * dir)},${f(y + py * s)}`;
      const hx = 52 + 20 * peck, hy = -78 + 64 * peck;
      return `<path d="M${T(-60, -40)} Q${T(-70, -100)} ${T(-40, -110)} L${T(-80, -130)} L${T(-46, -86)} Q${T(0, -100)} ${T(36, -70)} Q${T(56, -40)} ${T(30, -20)} Q${T(0, -6)} ${T(-40, -14)}Z M${T(-6, -20)} L${T(-10, 0)} L${T(-4, 0)} L${T(0, -20)}Z M${T(14, -20)} L${T(12, 0)} L${T(18, 0)} L${T(20, -20)}Z" fill="#0c0a0e"/><path d="M${T(30, -60)} Q${T(hx - 20, hy + 6)} ${T(hx - 8, hy + 8)} L${T(hx + 4, hy - 8)} L${T(hx + 22, hy + 4)} L${T(hx + 4, hy + 12)} Q${T(hx - 10, hy + 30)} ${T(36, -44)}Z" fill="#0c0a0e"/>`;
    },
    rope: (a, b, ctrl) => `<path d="M${f(a[0])},${f(a[1])} Q${f(ctrl[0])},${f(ctrl[1])} ${f(b[0])},${f(b[1])}" stroke="#0c0a0e" stroke-width="4" fill="none"/>`
  };
  S.silUtil = { houses, windows, smoke, birds, motes, church, roseWin, lancet, gateTower, street, ground, sil, LG, RG, once };
})(window);
