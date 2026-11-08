// "The Royal Fool": the council room and the courtyard below it, rebuilt (same world and constants as sets22b, so the
// WAR and LORDS shots keep their staging). The room: coursed ashlar walls lit by a roaring fire in a hooded stone
// fireplace on the left and by cold storm light from a leaded window streaming with rain; lightning that flashes in
// it; heavy beams on carved corbels and a wrought-iron chandelier over the map table; a rack of spears and halberds, a
// row of heraldic shields and a war banner; flagstones; the oak table on trestles with the map, candles, an inkwell,
// scrolls. Below the window: a storm-dark castle, the gatehouse with round towers and torches, the keep and the chapel
// with lit windows, wet cobbles with puddles that hold the torchlight and the gibbet, rain in layers, mist, a bolt.
(function (G) {
  const T = G.ST3, { f, rng, shade } = G.RIG, C = G.CINE, PR = G.PROPS, Q = G.QCAST, P17 = G.P17, HL = G.HALL;
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t;
  const ss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  const TAU = Math.PI * 2;
  const { plane, bb } = HL, RM = HL.RM, TB = RM.TAB;
  const poly = (cam, pts, fill, x = '') => { const d = T.path(cam, pts); return d ? `<path d="${d}" fill="${fill}" ${x}/>` : ''; };
  const OL = (w = 1.2, op = 0.55) => `stroke="#140c06" stroke-width="${w}" stroke-opacity="${op}" stroke-linejoin="round"`;
  const pxw = (cam, P, cm, lo = 0.3, hi = 90) => { const c = cam.toC(P); return c[2] > cam.near ? clamp(cm * cam.fl / c[2], lo, hi) : lo; };
  const line = (cam, pts, col, wcm, x = '') => { const d = T.lineD(cam, pts); if (!d) return ''; return `<path d="${d}" stroke="${col}" stroke-width="${f(pxw(cam, pts[Math.floor(pts.length / 2)], wcm))}" fill="none" stroke-linecap="round" ${x}/>`; };
  // clip the 2D segment a-b to the box [x0,x1] x [y0,y1] (Liang-Barsky); null when it misses
  const clipSeg = (a, b, x0, x1, y0, y1) => {
    let t0 = 0, t1 = 1; const dx = b[0] - a[0], dy = b[1] - a[1];
    for (const [p, q] of [[-dx, a[0] - x0], [dx, x1 - a[0]], [-dy, a[1] - y0], [dy, y1 - a[1]]]) {
      if (Math.abs(p) < 1e-9) { if (q < 0) return null; continue; }
      const r = q / p; if (p < 0) { if (r > t1) return null; if (r > t0) t0 = r; } else { if (r < t0) return null; if (r < t1) t1 = r; }
    }
    return t1 - t0 > 1e-6 ? [[a[0] + dx * t0, a[1] + dy * t0], [a[0] + dx * t1, a[1] + dy * t1]] : null;
  };
  // 2D convex hull (monotone chain) and its path
  const hull2 = P => { const p = P.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], up = []; for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); } for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); } return lo.slice(0, -1).concat(up.slice(0, -1)); };
  const pd2 = P => P.length > 2 ? 'M' + P.map(p => f(p[0]) + ',' + f(p[1])).join(' L') + 'Z' : '';
  // lightning: quick double flashes at fixed moments (deterministic), 0..1
  // (one soft swell each - up in 0.1 s, fading over half a second - no hard double-flash: that read as blinking)
  const FLASH = [14.95, 23.92, 26.62];
  const flashAt = t => FLASH.reduce((m, t0) => { const u = t - t0; if (u < 0 || u > 1.2) return m; const v = ss(0, 0.1, u) * Math.exp(-Math.max(0, u - 0.1) * 5.5) * 0.75; return Math.max(m, v); }, 0);
  HL.flashAt = flashAt;
  // a light whose glow is projected from its point fades in over the first 120 units in front of the lens: bb() drops
  // the point at the near plane, where its glow is huge, so the hearth's warmth switched on and off across the whole
  // room in one frame as the camera turned past it
  const nearFade = (cam, b) => ss(0, 120, b.vd - cam.near - 10);
  // the map over the table top in affine tiles over a base copy (so near tiles keep their perspective, no seams)
  const tiled = (cam, O, U, V, w, h, n, m, svg, id) => {
    const Wp = (a, b) => [O[0] + U[0] * a + V[0] * b, O[1] + U[1] * a + V[1] * b, O[2] + U[2] * a + V[2] * b], qd = T.path(cam, [Wp(0, 0), Wp(w, 0), Wp(w, h), Wp(0, h)]);
    let g = n * m > 1 && qd ? `<defs><clipPath id="${id}B"><path d="${qd}"/></clipPath></defs><g clip-path="url(#${id}B)">${plane(cam, O, U, V, svg, w / 2, h / 2, Math.min(w, h) / 4)}</g>` : '';
    // (each tile passes its cell as ext: a tile whose cell is off screen, near the lens, was drawn up to 100 px away from
    // it, map showing past the table's edge for a frame or two; plane() leaves it out or clips it to the cell)
    for (let j = 0; j < m; j++) for (let i = 0; i < n; i++) {
      const x0 = i * w / n, y0 = j * h / m, ox = w / n * 0.06, oy = h / m * 0.06, cid = `${id}${i}_${j}`;
      g += plane(cam, O, U, V, `<defs><clipPath id="${cid}"><rect x="${f(x0 - ox)}" y="${f(y0 - oy)}" width="${f(w / n + 2 * ox)}" height="${f(h / m + 2 * oy)}"/></clipPath></defs><g clip-path="url(#${cid})">${svg}</g>`, x0 + w / n / 2, y0 + h / m / 2, Math.min(w / n, h / m) / 2, [x0 - ox, y0 - oy, x0 + w / n + ox, y0 + h / m + oy]);
    }
    return g;
  };
  // coursed ashlar on a wall plane: blocks in a few tones (grouped), mortar joints, cut round openings (holes: [u0,u1,v0,v1])
  const ashlar = (cam, E, W, u0, u1, v0, v1, base, seed, holes = [], bh = 42, bw = 74) => {
    const r = rng(seed), groups = [[], [], [], []], dRef = cam.dist(W((u0 + u1) / 2, (v0 + v1) / 2));
    for (let v = v0, row = 0; v < v1; v += bh, row++) for (let u = u0 - (row % 2) * bw / 2; u < u1; u += bw) {
      const a = Math.max(u0, u) + 2, b = Math.min(u1, u + bw) - 2, c = v + 2, d = Math.min(v1, v + bh) - 2; if (b <= a + 4) continue;
      if (holes.some(([h0, h1, h2, h3]) => b > h0 && a < h1 && d > h2 && c < h3)) continue;
      // (the block's tone is drawn before asking whether it is on screen: a block leaving the frame must never reshuffle
      // the tones of all the others)
      const gi = Math.floor(r() * 4), dd = T.path(cam, [W(a, c), W(b, c), W(b, d), W(a, d)]); if (dd) groups[gi].push(dd);
    }
    return groups.map((g, i) => g.length ? `<path d="${g.join('')}" fill="${T.tone(E, shade(base, (i - 1.5) * 0.07), dRef, 's')}"/>` : '').join('');
  };

  // ======================================================= THE COUNCIL ROOM
  const roomEnv = k => ({ shade: '#1c1420', shadeK: 0.26, haze: shade('#241814', -0.2 * k), hazeD: 4200, hazeNear: 250, hazeMax: 0.18 });
  const yardEnv = { shade: '#2c3446', shadeK: 0.28, haze: '#566074', hazeD: 3600, hazeNear: 400, hazeMax: 0.55 };
  HL.roomDraw = (cam, t, o = {}) => {
    const E = roomEnv(o.dim || 0), tone = (c, d, k = 's') => T.tone(E, c, d, k), D = p => cam.dist(p), items = [];
    const YE = yardEnv, ytone = (c, d, k = 'g') => T.tone(YE, c, d, k), fl = flashAt(t);
    const hazeKY = d => clamp(1 - Math.exp(-Math.max(0, d - YE.hazeNear) / YE.hazeD)) * YE.hazeMax;
    let yard = '', shell = '', glow = '';
    const X = RM.X, Z1 = RM.Z1, Hh = RM.H, Wn = RM.WIN, Dr = RM.DOOR, Y = RM.YARD;
    // ---------------- outside: the storm sky, the bolt, the castle, the wet courtyard, the gibbet
    const hz = cam.dir([0, 0, 1]), hy = hz ? hz[1] : -2000;
    yard += `<defs><linearGradient id="ySky" gradientUnits="userSpaceOnUse" x1="0" y1="${f(hy - 1600)}" x2="0" y2="${f(hy + 300)}"><stop offset="0" stop-color="${G.RIG.mix('#1a1e30', '#a8b4d8', fl * 0.6)}"/><stop offset="0.55" stop-color="${G.RIG.mix('#3a4258', '#c8d0e8', fl * 0.6)}"/><stop offset="1" stop-color="${G.RIG.mix('#5a6070', '#dde2f0', fl * 0.5)}"/></linearGradient></defs><rect x="-60" y="-60" width="1200" height="2040" fill="url(#ySky)"/>`;
    // (clouds drift right and wrap round well off both edges of the frame, never in view)
    { const r = rng(331); for (let i = 0; i < 12; i++) { const w = 280 + r() * 380, cx = ((r() * 2700 + t * (10 + r() * 14)) % 2700) - 780, cy = hy - 120 - r() * 1100; yard += `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(w)}" ry="${f(46 + r() * 50)}" fill="${G.RIG.mix('#20242e', '#6a7290', fl * 0.5)}" opacity="${f(0.5 + r() * 0.3)}" filter="url(#b14)"/><ellipse cx="${f(cx + w * 0.1)}" cy="${f(cy - 30)}" rx="${f(w * 0.7)}" ry="22" fill="#8a90a8" opacity="${f(0.12 + 0.3 * fl)}" filter="url(#b8)"/>`; } }
    if (fl > 0.05) { // the bolt, from the clouds down behind the keep
      const r = rng(Math.floor(t * 2) + 9), bx = 760; let d = `M${bx},${f(hy - 1500)}`, x = bx, yy = hy - 1500; for (let i = 0; i < 9; i++) { x += (r() - 0.5) * 90; yy += 120; d += ` L${f(x)},${f(yy)}`; }
      yard += `<path d="${d}" stroke="#e8f0ff" stroke-width="5" fill="none" opacity="${f(fl)}" filter="url(#b2)"/><path d="${d}" stroke="#ffffff" stroke-width="1.6" fill="none" opacity="${f(fl)}"/>`;
    }
    const WZ = 3600, wd = D([0, 0, WZ]);
    // the keep and the chapel spire behind the curtain wall, their windows lit
    yard += poly(cam, [[-1500, Y, WZ + 900], [-700, Y, WZ + 900], [-700, 1500, WZ + 900], [-1500, 1500, WZ + 900]], ytone('#3a3e4a', wd + 900, 's')) + poly(cam, [[-1560, 1500, WZ + 900], [-640, 1500, WZ + 900], [-640, 1580, WZ + 900], [-1560, 1580, WZ + 900]], ytone('#2e3240', wd + 900, 's'));
    for (const [wx, wy] of [[-1300, 900], [-1000, 900], [-1150, 1200], [-850, 600]]) yard += poly(cam, [[wx, wy, WZ + 898], [wx + 60, wy, WZ + 898], [wx + 60, wy + 110, WZ + 898], [wx, wy + 110, WZ + 898]], '#ffb860', 'opacity="0.85"');
    { // the keep's battlements and the royal standard streaming in the gale on its roof
      let mr = ''; for (let x = -1560; x < -660; x += 92) { const dd = T.path(cam, [[x, 1580, WZ + 900], [x + 52, 1580, WZ + 900], [x + 52, 1650, WZ + 900], [x, 1650, WZ + 900]]); if (dd) mr += dd; }
      if (mr) yard += `<path d="${mr}" fill="${ytone('#2e3240', wd + 900, 's')}"/>`;
      yard += line(cam, [[-1100, 1650, WZ + 900], [-1100, 1990, WZ + 900]], ytone('#1a1c24', wd + 900, 'd'), 9);
      const top = [], bot = []; for (let i = 0; i <= 10; i++) { const u = i / 10, fl2 = 22 * u * Math.sin(t * 7 - u * 6), x = -1100 + u * 300; top.push([x, 1980 - u * 18 + fl2, WZ + 900]); bot.push([x, 1860 - u * 6 + fl2 * 1.2, WZ + 900]); }
      yard += poly(cam, [...top, ...bot.reverse()], ytone('#1e2a6a', wd + 900, 's'));
    }
    yard += poly(cam, [[800, Y, WZ + 600], [1300, Y, WZ + 600], [1300, 700, WZ + 600], [1050, 1500, WZ + 600], [800, 700, WZ + 600]], ytone('#363a46', wd + 600, 's'));
    { // slates on the chapel's spire and its cross
      let sl = ''; for (let y = 760; y < 1460; y += 64) { const hw = 250 * (1500 - y) / 800, dd = T.lineD(cam, [[1050 - hw, y, WZ + 599], [1050 + hw, y, WZ + 599]]); if (dd) sl += dd; }
      if (sl) yard += `<path d="${sl}" stroke="${ytone('#22262e', wd + 600, 's')}" stroke-width="${f(pxw(cam, [1050, 1000, WZ + 600], 7, 0.3, 3))}" fill="none" opacity="0.7"/>`;
      yard += line(cam, [[1050, 1500, WZ + 600], [1050, 1640, WZ + 600]], ytone('#2a2e38', wd + 600, 's'), 10) + line(cam, [[1000, 1590, WZ + 600], [1100, 1590, WZ + 600]], ytone('#2a2e38', wd + 600, 's'), 10);
    }
    for (const wx of [880, 1100]) yard += poly(cam, [[wx, 200, WZ + 598], [wx + 70, 200, WZ + 598], [wx + 70, 420, WZ + 598], [wx, 420, WZ + 598]], '#ffb050', 'opacity="0.75"');
    // the curtain wall: ashlar, crenellations, arrow slits; the gatehouse with two round towers and a portcullis
    yard += poly(cam, [[-3200, Y, WZ], [3200, Y, WZ], [3200, 420, WZ], [-3200, 420, WZ]], ytone('#4e525e', wd, 's'));
    yard += ashlar(cam, YE, (u, v) => [u, Y + v, WZ - 1], -3200, 3200, 0, 920, '#565a66', 41, [[-420, 260, 0, 760]], 60, 110);
    let cr = ''; for (let x = -3200; x < 3200; x += 130) cr += poly(cam, [[x, 420, WZ], [x + 80, 420, WZ], [x + 80, 500, WZ], [x, 500, WZ]], ytone('#4e525e', wd, 's'));
    yard += cr;
    { // rain running black down the stone from every crenel; two soaked banners of France hanging from the wall-walk
      const r = rng(62); let st = ''; for (let i = 0; i < 34; i++) { const x = -3000 + r() * 6000, w = 18 + r() * 46, y1 = 410 - 160 - r() * 520; if (Math.abs(x) < 430) continue; const dd = T.path(cam, [[x, 412, WZ - 2], [x + w, 412, WZ - 2], [x + w * 0.66, y1, WZ - 2], [x + w * 0.34, y1, WZ - 2]]); if (dd) st += dd; }
      if (st) yard += `<path d="${st}" fill="${ytone('#1c2028', wd, 's')}" opacity="0.38"/>`;
      for (const bx of [-860, 760]) {
        const sw2 = 2.2 * Math.sin(t * 1.3 + bx), L = 430, lil = [[-34, 80], [34, 80], [0, 170], [-34, 260], [34, 260]].map(([x, y]) => Q.lily(x, y, 0.55, '#8a6c2a')).join('');
        const art = `<g transform="skewX(${f(sw2)})"><path d="M-76,0 L76,0 L76,${L} L0,${L + 44} L-76,${L}Z" fill="#16204e"/>${lil}<path d="M-76,0 L76,0 L76,${L} L0,${L + 44} L-76,${L}Z" fill="#0a0c18" opacity="0.35"/><path d="M-60,4 L-60,${L - 6} M-20,4 L-20,${L + 10} M24,4 L24,${L + 12} M58,4 L58,${L - 8}" stroke="#0a0c16" stroke-width="5" opacity="0.4"/></g><rect x="-86" y="-8" width="172" height="12" rx="5" fill="#241a14"/>`;
        yard += `<g opacity="${f(1 - hazeKY(wd) * 0.6)}">${plane(cam, [bx, 400, WZ - 4], [1, 0, 0], [0, -1, 0], art, 0, 200, 120)}</g>`;
      }
    }
    for (const sx of [-380, 220]) {
      const tz = WZ - 120, td = D([sx + 80, 0, tz]);
      yard += poly(cam, [[sx, Y, tz], [sx + 160, Y, tz], [sx + 150, 700, tz], [sx + 10, 700, tz]], ytone('#5a5e6a', td, 's'));
      yard += line(cam, [[sx + 30, Y, tz - 1], [sx + 30, 700, tz - 1]], ytone('#3a3e4a', td, 's'), 18, 'opacity="0.6"') + line(cam, [[sx + 130, Y, tz - 1], [sx + 130, 700, tz - 1]], ytone('#6e727e', td, 's'), 14, 'opacity="0.6"');
      yard += poly(cam, [[sx - 20, 700, tz], [sx + 180, 700, tz], [sx + 80, 1050, tz]], ytone('#2e3446', td, 's'));
      { let sl = ''; for (let y = 750; y < 1020; y += 52) { const hw = 100 * (1050 - y) / 350, dd = T.lineD(cam, [[sx + 80 - hw, y, tz - 1], [sx + 80 + hw, y, tz - 1]]); if (dd) sl += dd; } if (sl) yard += `<path d="${sl}" stroke="${ytone('#1c2030', td, 's')}" stroke-width="${f(pxw(cam, [sx + 80, 850, tz], 6, 0.3, 3))}" fill="none" opacity="0.7"/>`; }
      for (const wy of [100, 380]) yard += poly(cam, [[sx + 70, wy, tz - 2], [sx + 90, wy, tz - 2], [sx + 90, wy + 70, tz - 2], [sx + 70, wy + 70, tz - 2]], '#14161e');
    }
    yard += poly(cam, [[-220, Y, WZ - 60], [220, Y, WZ - 60], [220, 180, WZ - 60], [0, 300, WZ - 60], [-220, 180, WZ - 60]], ytone('#16141a', wd, 'd'));
    let pc = ''; for (let x = -200; x <= 200; x += 40) { const dd = T.lineD(cam, [[x, 80, WZ - 62], [x, 260 - Math.abs(x) * 0.5, WZ - 62]]); if (dd) pc += dd; } for (let y = 100; y < 250; y += 40) { const dd = T.lineD(cam, [[-210, y, WZ - 62], [210, y, WZ - 62]]); if (dd) pc += dd; }
    if (pc) yard += `<path d="${pc}" stroke="#2a2a30" stroke-width="${f(pxw(cam, [0, 0, WZ], 6, 0.4, 6))}" fill="none"/>`;
    const torches = [[-260, -330, WZ - 140], [260, -330, WZ - 140], [-1250, -300, 1800], [1250, -290, 2300]];
    for (const tp of torches) { const b = bb(cam, tp); if (b) yard += PR.flame(b.x, b.y, 0.55 * b.k, t + tp[0]) + C.radial(b.x, b.y, 300 * b.k, '#ffa040', 0.55, 'screen'); }
    // the side ranges: walls with windows (some lit, spilling light), a timber gallery on the right
    const lits = [];
    for (const sd of [-1, 1]) {
      const x = sd * 1300;
      yard += poly(cam, [[x, Y, 800], [x, Y, WZ], [x, 400, WZ], [x, 400, 800]], ytone(sd < 0 ? '#40444e' : '#4a4e58', 2000, 's'));
      yard += ashlar(cam, YE, (u, v) => [x - sd, Y + v, u], 800, WZ, 0, 900, sd < 0 ? '#444852' : '#4e525c', 50 + sd, [], 56, 100);
      for (let z = 1100; z < WZ - 200; z += 420) { const lit = ((z / 420) | 0) % 3 === 0, q = [[x - sd * 2, -240, z], [x - sd * 2, -240, z + 110], [x - sd * 2, -60, z + 110], [x - sd * 2, -60, z]]; yard += poly(cam, q, lit ? '#ffb050' : '#16161e', lit ? 'opacity="0.85"' : ''); if (lit) { lits.push(q); const wc = bb(cam, [x - sd * 4, -150, z + 55]); if (wc) yard += C.radial(wc.x, wc.y, clamp(190 * wc.k, 10, 260), '#ffa040', 0.3, 'screen'); } else yard += line(cam, [[x - sd * 3, -240, z + 55], [x - sd * 3, -60, z + 55]], '#2a2a30', 3, 'opacity="0.6"'); }
      if (sd > 0) { yard += poly(cam, [[1290, -120, 1200], [1290, -120, 3200], [1180, -120, 3200], [1180, -120, 1200]], ytone('#3a2a1e', 2000, 'd')); for (let z = 1200; z <= 3200; z += 250) yard += line(cam, [[1185, -120, z], [1185, -400, z]], ytone('#3a2a1e', 2000, 'd'), 12); }
    }
    // the courtyard floor (between the walls): wet cobbles, torchlight pooled on them and streaked down the wet stone, the
    // sheen of the storm sky toward the far wall; puddles holding the sky, the lit windows and the torches; rain rings
    yard += poly(cam, [[-1300, Y, 800], [1300, Y, 800], [1300, Y, WZ], [-1300, Y, WZ]], ytone('#22242c', 1800));
    { const r = rng(91); let cb = ['', '', '', '']; for (let z = 820; z < WZ - 40; z += 46) for (let x = -1290; x < 1222; x += 56) { const gi = Math.floor(r() * 4), o2 = (Math.floor(z / 46) % 2) * 28, dd = T.path(cam, [[x + o2 + 4, Y + 0.5, z + 4], [x + o2 + 50, Y + 0.5, z + 4], [x + o2 + 50, Y + 0.5, z + 40], [x + o2 + 4, Y + 0.5, z + 40]]); if (dd) cb[gi] += dd; } yard += cb.map((g, i) => g ? `<path d="${g}" fill="${ytone(shade('#3c3e48', (i - 1.5) * 0.09), 1600)}"/>` : '').join(''); }
    { const flD = T.path(cam, [[-1300, Y, 800], [1300, Y, 800], [1300, Y, WZ], [-1300, Y, WZ]]);
      if (flD) {
        let wet = '';
        for (const tp of torches) {
          wet += poly(cam, T.ring([tp[0] * 0.96, Y + 1, tp[2] - 60], [260, 0, 0], [0, 0, 170], 16), '#ff9a40', `opacity="${f(0.22 * (0.9 + 0.1 * Math.sin(t * 9 + tp[0])))}" filter="url(#b8)"`);
          const B = [tp[0], Y, tp[2]], pb = cam.proj(B), pm = cam.proj([tp[0], 2 * Y - tp[1], tp[2]]);
          if (pb && pm) { const kk = cam.fl / Math.max(200, cam.dist(B)); wet += `<ellipse cx="${f(pm[0])}" cy="${f(pb[1] + (pm[1] - pb[1]) * 0.6)}" rx="${f(clamp(26 * kk, 4, 44))}" ry="${f(Math.max(10, Math.abs(pm[1] - pb[1]) * 0.8))}" fill="#ffb060" opacity="0.26" filter="url(#b8)"/>`; }
        }
        for (const q of lits) { const c3 = [(q[0][0] + q[2][0]) / 2, -150, (q[0][2] + q[2][2]) / 2], pb = cam.proj([c3[0], Y, c3[2]]), pm = cam.proj([c3[0], 2 * Y + 150, c3[2]]); if (pb && pm) { const kk = cam.fl / Math.max(200, cam.dist(c3)); wet += `<ellipse cx="${f(pm[0])}" cy="${f(pb[1] + (pm[1] - pb[1]) * 0.6)}" rx="${f(clamp(40 * kk, 4, 50))}" ry="${f(Math.max(10, Math.abs(pm[1] - pb[1]) * 0.7))}" fill="#ffa850" opacity="0.15" filter="url(#b8)"/>`; } }
        const pW = cam.proj([cam.x, Y, WZ - 20]);
        if (pW) wet += `<defs><linearGradient id="yWet" gradientUnits="userSpaceOnUse" x1="0" y1="${f(pW[1] - 20)}" x2="0" y2="${f(pW[1] + 520)}"><stop offset="0" stop-color="${G.RIG.mix('#a0aac4', '#ffffff', fl)}" stop-opacity="${f(0.15 + 0.3 * fl)}"/><stop offset="1" stop-color="#a0aac4" stop-opacity="0"/></linearGradient></defs><rect x="-60" y="${f(pW[1] - 20)}" width="1200" height="540" fill="url(#yWet)"/>`;
        yard += `<defs><clipPath id="yFl"><path d="${flD}"/></clipPath></defs><g clip-path="url(#yFl)" style="mix-blend-mode:screen">${wet}</g>`;
      }
    }
    const puddles = [[200, 1500, 170], [700, 2300, 230], [-300, 1900, 150], [520, 1950, 120], [-780, 2900, 210], [980, 3200, 170], [-80, 2650, 130]];
    let pud = '';
    const smoothD = P => { const n = P.length; let d = `M${f(P[0][0])},${f(P[0][1])}`; for (let i = 0; i < n; i++) { const p0 = P[(i - 1 + n) % n], p1 = P[i], p2 = P[(i + 1) % n], p3 = P[(i + 2) % n]; d += ` C${f(p1[0] + (p2[0] - p0[0]) / 6)},${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)},${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])},${f(p2[1])}`; } return d + 'Z'; };
    for (const [px, pz, rw] of puddles) {
      const ring = T.ring([px, Y + 0.8, pz], [rw, 0, 0], [0, 0, rw * 0.55], 22).map((q, i) => { const w = 1 + 0.13 * Math.sin(i * 1.9 + px * 0.01) + 0.07 * Math.sin(i * 4.1 + pz * 0.01); return [px + (q[0] - px) * w, q[1], pz + (q[2] - pz) * w]; });
      const pp = ring.map(q => cam.proj(q));
      if (pp.every(p => p)) { if (pp.some(p => p[0] > -300 && p[0] < 1380 && p[1] > -300 && p[1] < 2220)) pud += smoothD(pp); }
      else { const dd = T.path(cam, ring); if (dd) pud += dd; }
    }
    const hasPud = !!pud;
    if (hasPud) {
      // the water mirrors the storm sky at the same angle above the horizon as the ray comes down to it (dark overhead,
      // greyer toward the far wall), over the black wet stone beneath
      const mx = G.RIG.mix;
      yard += `<defs><linearGradient id="yPudG" gradientUnits="userSpaceOnUse" x1="0" y1="${f(hy + 1600)}" x2="0" y2="${f(hy - 300)}"><stop offset="0" stop-color="${mx('#10131c', '#6a7290', fl * 0.7)}"/><stop offset="0.55" stop-color="${mx('#252b3a', '#9aa4c4', fl * 0.7)}"/><stop offset="1" stop-color="${mx('#384050', '#c8d0e8', fl * 0.7)}"/></linearGradient><clipPath id="yPud"><path d="${pud}"/></clipPath></defs>`;
      yard += `<path d="${pud}" fill="url(#yPudG)" opacity="0.94"/>`;
      let rf = '';
      for (const q of lits) rf += poly(cam, q.map(p => [p[0], 2 * Y - p[1], p[2]]), '#ffb050', 'opacity="0.7"');
      for (const tp of torches) { const m = cam.proj([tp[0], 2 * Y - tp[1], tp[2]]); if (m) { const kk = cam.fl / Math.max(200, cam.dist(tp)); rf += `<ellipse cx="${f(m[0])}" cy="${f(m[1])}" rx="${f(clamp(26 * kk, 3, 40))}" ry="${f(clamp(70 * kk, 6, 110))}" fill="#ffc878" opacity="0.75" filter="url(#b4)"/>`; } }
      // the wet glossy rim where the water meets the stones (catching the sky)
      yard += `<g clip-path="url(#yPud)">${rf}</g><path d="${pud}" fill="none" stroke="${G.RIG.mix('#9aa4bc', '#e8eeff', fl)}" stroke-width="1.4" opacity="${f(0.22 + 0.4 * fl)}"/>`;
    }
    for (const [px, pz, rw] of puddles) for (let i = 0; i < 3; i++) { const ph = ((t * 1.4 + i * 0.33 + px * 0.001) % 1), rr = ph * rw * 0.5, ri = T.ring([px + (i - 1) * rw * 0.4, Y + 1, pz + (i % 2 ? 20 : -20)], [rr, 0, 0], [0, 0, rr * 0.5], 12), dd = T.lineD(cam, [...ri, ri[0]]); if (dd) yard += `<path d="${dd}" stroke="#c8d0e0" stroke-width="1" fill="none" opacity="${f(0.5 * (1 - ph))}"/>`; }
    // ---------------- yard props: a well under its little roof, a cart against the right range, barrels and crates
    const cylP = (x, z, y0, y1, r0, r1, side, top) => {
      const rings = [[y0, r0], [(y0 + y1) / 2, r1], [y1, r0]].map(([y, r]) => T.ring([x, y, z], [r, 0, 0], [0, 0, r], 16)), pts = [];
      for (const Rg of rings) for (const q of Rg) { const p = cam.proj(q); if (!p) return ''; pts.push(p); }
      const tp = cam.y > y1 ? T.path(cam, rings[2]) : null;
      return `<path d="${pd2(hull2(pts))}" fill="${side}"/>` + (tp ? `<path d="${tp}" fill="${top}"/>` : '');
    };
    const arcF = (x, z, y, r) => { const a0 = Math.atan2(cam.z - z, cam.x - x), pts = []; for (let i = 0; i <= 12; i++) { const a = a0 - Math.PI / 2 + Math.PI * i / 12; pts.push([x + r * Math.cos(a), y, z + r * Math.sin(a)]); } return T.lineD(cam, pts); };
    const boxP = (x0, x1, y0, y1, z0, z1, c, d) => {
      let s = ''; const q = (pts, col) => { s += poly(cam, pts, col); };
      if (cam.x < x0) q([[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]], ytone(c, d, 's'));
      if (cam.x > x1) q([[x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0]], ytone(c, d, 's'));
      if (cam.z < z0) q([[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]], ytone(shade(c, 0.08), d, 's'));
      if (cam.z > z1) q([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], ytone(shade(c, 0.08), d, 's'));
      if (cam.y > y1) q([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], ytone(shade(c, 0.16), d, 's'));
      return s;
    };
    { const wx = -560, wz = 2500, wd2 = D([wx, Y, wz]), olw = pxw(cam, [wx, Y, wz], 2.2, 0.4, 3);
      yard += cylP(wx, wz, Y, Y + 86, 82, 84, ytone('#4c505a', wd2, 's'), ytone('#60646e', wd2, 's'));
      for (const yy of [Y + 29, Y + 58]) { const dd = arcF(wx, wz, yy, 84); if (dd) yard += `<path d="${dd}" stroke="${ytone('#2a2e38', wd2, 's')}" stroke-width="${f(olw)}" fill="none"/>`; }
      if (cam.y > Y + 86) yard += poly(cam, T.ring([wx, Y + 86.5, wz], [64, 0, 0], [0, 0, 64], 16), '#0a0c12');
      for (const sx of [-1, 1]) yard += line(cam, [[wx + sx * 72, Y + 82, wz], [wx + sx * 72, Y + 236, wz]], ytone('#3a2a1e', wd2, 'd'), 10);
      yard += line(cam, [[wx - 78, Y + 196, wz], [wx + 78, Y + 196, wz]], ytone('#4a3424', wd2, 'd'), 9) + line(cam, [[wx + 12, Y + 196, wz], [wx + 12, Y + 128, wz]], '#14100c', 1.6) + poly(cam, [[wx - 4, Y + 130, wz], [wx + 28, Y + 130, wz], [wx + 24, Y + 100, wz], [wx, Y + 100, wz]], ytone('#4a3424', wd2, 'd'));
      for (const sz of (cam.z < wz ? [1, -1] : [-1, 1])) yard += poly(cam, [[wx - 108, Y + 226, wz + sz * 74], [wx + 108, Y + 226, wz + sz * 74], [wx + 108, Y + 292, wz], [wx - 108, Y + 292, wz]], ytone(sz < 0 ? '#2e242a' : '#3a2e34', wd2, 's'));
    }
    { const cx0 = 960, cx1 = 1080, cz0 = 2620, cz1 = 2880, cd = D([1020, Y, 2750]);
      for (const xx of [972, 1068]) yard += line(cam, [[xx, Y + 98, cz0 + 10], [xx - 6, Y + 6, cz0 - 230]], ytone('#3a2818', cd, 'd'), 7);
      yard += boxP(cx0, cx1, Y + 64, Y + 128, cz0, cz1, '#4a3424', cd);
      for (const yy of [Y + 84, Y + 106]) yard += line(cam, [[cx0 - 0.5, yy, cz0], [cx0 - 0.5, yy, cz1]], ytone('#241810', cd, 'd'), 2);
      { const b = bb(cam, [1020, Y + 128, 2750]); if (b) yard += `<g transform="${b.tr}">` + [[-40, 0, 52, 30], [18, -4, 46, 34], [60, 2, 40, 26], [-10, -26, 44, 26]].map(([x, y, rx, ry], i) => `<ellipse cx="${x}" cy="${y - ry * 0.5}" rx="${rx}" ry="${ry}" fill="${ytone(['#6a5a42', '#5e503a', '#726048', '#665640'][i], cd, 's')}"/>`).join('') + `</g>`; }
      const wc = [cx0 - 8, Y + 70, 2760], rim = T.ring(wc, [0, 70, 0], [0, 0, 70], 24), hub = T.ring(wc, [0, 12, 0], [0, 0, 12], 10);
      const rd = T.lineD(cam, [...rim, rim[0]]); if (rd) yard += `<path d="${rd}" stroke="${ytone('#2a1c10', cd, 'd')}" stroke-width="${f(pxw(cam, wc, 9, 0.6, 12))}" fill="none"/>`;
      let sp = ''; for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + 0.2, dd = T.lineD(cam, [wc, [wc[0], wc[1] + 66 * Math.sin(a), wc[2] + 66 * Math.cos(a)]]); if (dd) sp += dd; }
      if (sp) yard += `<path d="${sp}" stroke="${ytone('#2a1c10', cd, 'd')}" stroke-width="${f(pxw(cam, wc, 4, 0.4, 6))}" fill="none"/>`;
      yard += poly(cam, hub, ytone('#1a120a', cd, 'd'));
    }
    for (const [bx2, bz2, by2] of [[1210, 2210, 0], [1120, 2170, 0], [1190, 2080, 0], [1170, 2150, 96]]) { const bd = D([bx2, Y, bz2]), y0 = Y + by2; yard += cylP(bx2, bz2, y0, y0 + 94, 36, 42, ytone('#4e3826', bd, 's'), ytone('#6a5038', bd, 's')); for (const yy of [y0 + 16, y0 + 78]) { const dd = arcF(bx2, bz2, yy, 38.5); if (dd) yard += `<path d="${dd}" stroke="${ytone('#1e1a18', bd, 'd')}" stroke-width="${f(pxw(cam, [bx2, yy, bz2], 4, 0.4, 5))}" fill="none"/>`; } }
    yard += boxP(1150, 1250, Y, Y + 80, 2330, 2430, '#5a4430', D([1200, Y, 2380])) + boxP(1170, 1240, Y + 80, Y + 136, 2346, 2414, '#624a34', D([1200, Y, 2380]));
    // the gibbet, and its reflection in the puddles (foreshortened as the lens looks down on it)
    const GB = [560, Y, 1900], gb = bb(cam, GB);
    if (gb) items.push({ z: gb.d, out: 1, svg: () => { const b = bb(cam, GB); if (!b) return ''; const g = P17.gibbet(b.x, b.y, b.k * 0.45, t, { fly: o.crowFly || 0 }); const pT = cam.proj([GB[0], Y + 260, GB[2]]), pR = cam.proj([GB[0], Y - 260, GB[2]]), rr = pT && pR && b.y - pT[1] > 1 ? clamp((pR[1] - b.y) / (b.y - pT[1]), 0.2, 1.5) : 1; return (hasPud ? `<g clip-path="url(#yPud)"><g transform="translate(0,${f(b.y * (1 + rr))}) scale(1,${(-rr).toFixed(4)})" opacity="0.55" filter="url(#b2)">${g}</g></g>` : '') + g; } });
    // ---------------- the room shell
    const winPts = [[Wn.x0, Wn.sill], [Wn.x1, Wn.sill], [Wn.x1, Wn.spring]]; for (let i = 1; i < 12; i++) { const a = i / 12; winPts.push([lerp(Wn.x1, Wn.x0, a), Wn.spring + (Wn.apex - Wn.spring) * Math.sin(Math.PI * a) ** 0.7]); } winPts.push([Wn.x0, Wn.spring]);
    const drPts = [[Dr.x0, 0], [Dr.x1, 0], [Dr.x1, Dr.h]]; for (let i = 1; i < 12; i++) { const a = i / 12; drPts.push([lerp(Dr.x1, Dr.x0, a), Dr.h + (Dr.apex - Dr.h) * Math.sin(Math.PI * a) ** 0.7]); } drPts.push([Dr.x0, Dr.h]);
    const bw = D([0, 300, Z1]);
    const outer = T.path(cam, [[-X, 0, Z1], [X, 0, Z1], [X, Hh, Z1], [-X, Hh, Z1]]), wh = T.path(cam, winPts.map(([x, y]) => [x, y, Z1])), dh = T.path(cam, drPts.map(([x, y]) => [x, y, Z1]));
    // the stair beyond the door, climbing into torchlight
    shell += poly(cam, [[Dr.x0 - 30, 0, Z1 + 400], [Dr.x1 + 30, 0, Z1 + 400], [Dr.x1 + 30, Dr.apex + 40, Z1 + 400], [Dr.x0 - 30, Dr.apex + 40, Z1 + 400]], tone('#4a3020', bw, 'd'));
    for (let i = 0; i < 6; i++) shell += poly(cam, [[Dr.x0, i * 30, Z1 + 30 + i * 50], [Dr.x1, i * 30, Z1 + 30 + i * 50], [Dr.x1, i * 30 + 30, Z1 + 30 + i * 50], [Dr.x0, i * 30 + 30, Z1 + 30 + i * 50]], tone('#5a3e28', bw, 's'));
    { const tb = bb(cam, [Dr.x0 + 30, 230, Z1 + 260]); if (tb) shell += PR.flame(tb.x, tb.y, 0.6 * tb.k, t) + C.radial(tb.x, tb.y, 320 * tb.k, '#ffa040', 0.3, 'screen'); }
    if (outer) shell += `<path d="${outer}${wh ? ' ' + wh : ''}${dh ? ' ' + dh : ''}" fill-rule="evenodd" fill="${tone('#4a3c30', bw)}"/>`;
    shell += ashlar(cam, E, (u, v) => [u, v, Z1 - 1], -X, X, 0, Hh, '#56463a', 7, [[Dr.x0 - 6, Dr.x1 + 6, 0, Dr.apex + 6], [Wn.x0 - 6, Wn.x1 + 6, Wn.sill - 6, Wn.apex + 6]]);
    // the window: leaded diamond panes of grey-blue glass, the rain running down them, the storm and the lightning
    { // the glass and its leading fade away as the lens closes on the window (the camera passes out through it)
      const gF = clamp((Z1 - cam.z - 80) / 280);
      // a diamond lattice of lead cames: two families of parallel lines, each clipped exactly to the window's frame
      let lead = '';
      if (gF > 0.01) { const span = Wn.x1 - Wn.x0, rise = span * 1.55; for (let k = -16; k <= 16; k++) { const y0 = Wn.sill + k * 46; for (const [a, b] of [[[Wn.x0, y0], [Wn.x1, y0 + rise]], [[Wn.x0, y0 + rise], [Wn.x1, y0]]]) { const c = clipSeg(a, b, Wn.x0, Wn.x1, Wn.sill, Wn.apex); if (c) { const dd = T.lineD(cam, [[c[0][0], c[0][1], Z1 - 3], [c[1][0], c[1][1], Z1 - 3]]); if (dd) lead += dd; } } } }
      const wpath = T.path(cam, winPts.map(([x, y]) => [x, y, Z1 - 3]));
      if (wpath && gF > 0.01) {
        shell += `<defs><clipPath id="rmW"><path d="${wpath}"/></clipPath></defs><g clip-path="url(#rmW)" opacity="${f(gF)}"><path d="${wpath}" fill="#8a98b4" opacity="${f(0.14 + 0.3 * fl)}"/>`;
        if (lead) shell += `<path d="${lead}" stroke="#1a1a22" stroke-width="${f(pxw(cam, [240, 300, Z1], 2.4, 0.4, 3))}" fill="none" opacity="0.75"/>`;
        const r = rng(19); for (let i = 0; i < 26; i++) { const u = lerp(Wn.x0, Wn.x1, r()), v0 = Wn.apex - (((r() * 600 + t * (60 + r() * 50)) % 600)), a = cam.proj([u, v0, Z1 - 4]), b = cam.proj([u + 2, v0 - 40, Z1 - 4]); if (a && b) shell += `<path d="M${f(a[0])},${f(a[1])} L${f(b[0])},${f(b[1])}" stroke="#d8e4f8" stroke-width="1.4" opacity="0.55"/>`; }
        shell += `</g>`;
      }
      const rv = T.lineD(cam, [...winPts, winPts[0]].map(([x, y]) => [x, y, Z1 - 1])); if (rv) shell += `<path d="${rv}" stroke="${tone('#8a7a64', bw)}" stroke-width="${f(pxw(cam, [240, 300, Z1], 16))}" fill="none" stroke-linejoin="round"/>`;
      // (a single wide light, no stone mullion: the camera flies out through the middle of it)
      const wc = cam.proj([240, 320, Z1]); if (wc) glow += C.radial(wc[0], wc[1], pxw(cam, [240, 320, Z1], 520, 40, 2200), '#a8b8e0', 0.08 + 0.5 * fl, 'screen');
    }
    const dfr = T.lineD(cam, drPts.map(([x, y]) => [x, y, Z1 - 1])); if (dfr) shell += `<path d="${dfr}" stroke="${tone('#8a7a64', bw)}" stroke-width="${f(pxw(cam, [-260, 200, Z1], 16))}" fill="none"/>`;
    const op = o.door || 0, ang = op * 1.5, hx = Dr.x0, w = Dr.x1 - Dr.x0, ex = hx + w * Math.cos(ang), ez = Z1 - 3 - w * Math.sin(ang), ld = D([(hx + ex) / 2, 150, (Z1 + ez) / 2]);
    items.push({ z: ld, svg: () => { let s = poly(cam, [[hx, 0, Z1 - 3], [ex, 0, ez], [ex, Dr.h, ez], [hx, Dr.h, Z1 - 3]], tone('#5a3a20', ld), OL(f(pxw(cam, [hx, 0, Z1], 1.2, 0.3, 2)), 0.6)); for (const yy of [50, 150, 250]) s += line(cam, [[hx, yy, Z1 - 4], [lerp(hx, ex, 0.9), yy, lerp(Z1 - 4, ez, 0.9)]], '#1a1612', 6); for (let k = 1; k < 5; k++) s += line(cam, [[lerp(hx, ex, k / 5), 4, lerp(Z1 - 4, ez, k / 5)], [lerp(hx, ex, k / 5), Dr.h - 4, lerp(Z1 - 4, ez, k / 5)]], '#000', 1.4, 'opacity="0.35"'); return s; } });
    // a war banner on the pier between the door and the window
    shell += plane(cam, [-30, 560, Z1 - 4], [1, 0, 0], [0, -1, 0], `<path d="M-60,0 L60,0 L60,250 L22,226 L0,262 L-22,226 L-60,250Z" fill="#1f3288" ${OL(2, 0.6)}/>` + [[-30, 50], [30, 50], [0, 110], [-30, 170], [30, 170]].map(([x, y]) => Q.lily(x, y, 0.5, '#d8b040')).join('') + `<path d="M-60,250 L-22,226 L0,262 L22,226 L60,250" stroke="#d8b040" stroke-width="5" fill="none"/><rect x="-68" y="-6" width="136" height="12" rx="5" fill="#5a3a1e"/>`, 0, 130, 100, [-70, -8, 70, 266]);
    // the side walls: ashlar; on the left the fireplace, on the right the shields and the weapon rack
    for (const sd of [-1, 1]) {
      const x = sd * X, sdd = D([x, 300, 300]);
      shell += poly(cam, [[x, 0, RM.Z0], [x, 0, Z1], [x, Hh, Z1], [x, Hh, RM.Z0]], tone(sd < 0 ? '#463a2e' : '#4e4034', sdd));
      shell += ashlar(cam, E, (u, v) => [x - sd, v, u], RM.Z0, Z1, 0, Hh, sd < 0 ? '#4a3c30' : '#524436', 11 + sd, sd < 0 ? [[170, 590, 0, 520]] : []);
    }
    {
      // the fireplace: a firebox, jambs, a hood rising to the ceiling, the arms of France carved on it
      const x = -X, z0 = 200, z1 = 560, d = D([x, 200, 380]);
      shell += poly(cam, [[x + 1, 0, z0 + 40], [x + 1, 0, z1 - 40], [x + 1, 170, z1 - 40], [x + 1, 170, z0 + 40]], '#120a06');
      const fb = bb(cam, [x + 40, 2, 380]); if (fb) { const fk = (0.85 + 0.15 * Math.sin(t * 7) * Math.sin(t * 3.1)) * nearFade(cam, fb); shell += C.radial(fb.x, fb.y - 60 * fb.k, 260 * fb.k, '#ff7a2a', 0.8 * fk, 'screen') + P17.fire(fb.x - 40 * fb.k, fb.y, 0.9 * fb.k, t, 3) + P17.fire(fb.x + 30 * fb.k, fb.y, 0.8 * fb.k, t + 0.5, 5) + P17.fire(fb.x, fb.y, 1.1 * fb.k, t + 1.1, 8); glow += C.radial(fb.x, fb.y - 80 * fb.k, 900 * fb.k, '#ff9a48', 0.26 * fk, 'screen'); }
      for (const zz of [z0, z1 - 40]) shell += poly(cam, [[x, 0, zz], [x + 60, 0, zz], [x + 60, 190, zz], [x, 190, zz]], tone('#7a6650', d)) + poly(cam, [[x + 60, 0, zz], [x + 60, 0, zz + 40], [x + 60, 190, zz + 40], [x + 60, 190, zz]], tone('#8a7660', d));
      shell += poly(cam, [[x + 70, 190, z0 - 10], [x + 70, 190, z1 + 10], [x + 70, 240, z1 + 10], [x + 70, 240, z0 - 10]], tone('#8a7660', d), OL(1, 0.5));
      shell += poly(cam, [[x + 64, 240, z0], [x + 64, 240, z1], [x + 20, Hh, z1 - 40], [x + 20, Hh, z0 + 40]], tone('#6e5c4a', d), OL(1, 0.5));
      shell += plane(cam, [x + 50, 400, 380], [0, 0, 1], [0, -1, 0], `<path d="M-50,-60 L50,-60 L50,10 C50,50 20,64 0,72 C-20,64 -50,50 -50,10Z" fill="#1f3288" stroke="#c8a040" stroke-width="5"/>` + [[-22, -30], [22, -30], [0, 12]].map(([a, b]) => Q.lily(a, b, 0.5, '#d8b040')).join(''), 0, 0, 40, [-54, -64, 54, 76]);
    }
    {
      const x = X, d = D([x, 400, 300]);
      for (let i = 0; i < 4; i++) { const zz = 40 + i * 140, cols = [['#b8221a', '#e8e0d0'], ['#1f3288', '#d8b040'], ['#2a6a3a', '#e8e0d0'], ['#d8b040', '#7a1a14']][i], W = (u, v) => [x - 3, 470 - v, zz - u], shp = [[-44, -52], [44, -52], [44, 8], [30, 40], [0, 64], [-30, 40], [-44, 8]].map(([u, v]) => W(u, v)); shell += poly(cam, shp, tone(cols[0], d), OL(1.4, 0.7)) + (i % 2 ? poly(cam, [W(-44, -18), W(44, -18), W(44, -2), W(-44, -2)], tone(cols[1], d)) : poly(cam, [W(-8, -52), W(8, -52), W(8, 62), W(-8, 62)], tone(cols[1], d))); }
      for (let i = 0; i < 6; i++) { const zz = 120 + i * 50, top = 520 + (i % 2) * 30; shell += line(cam, [[x - 10, 30, zz], [x - 10, top, zz]], tone('#5a3a1e', d), 5) + (i % 2 ? poly(cam, [[x - 10, top, zz - 8], [x - 10, top, zz + 8], [x - 10, top + 40, zz]], tone('#a8acb4', d)) : poly(cam, [[x - 10, top - 40, zz], [x - 10, top - 40, zz + 34], [x - 10, top - 10, zz + 30], [x - 10, top, zz]], tone('#9aa0a8', d))); }
      shell += line(cam, [[x - 12, 120, 100], [x - 12, 120, 400]], tone('#3a2614', d), 8) + line(cam, [[x - 12, 380, 100], [x - 12, 380, 400]], tone('#3a2614', d), 8);
    }
    // the ceiling: planks between heavy beams on carved corbels
    shell += poly(cam, [[-X, Hh, RM.Z0], [X, Hh, RM.Z0], [X, Hh, Z1], [-X, Hh, Z1]], tone('#24170e', D([0, Hh, 300]), 'd'));
    for (let z = -200; z < Z1; z += 140) { const dz = D([0, Hh, z]); shell += poly(cam, [[-X, Hh - 34, z], [X, Hh - 34, z], [X, Hh - 34, z + 32], [-X, Hh - 34, z + 32]], tone('#1a1008', dz, 'd')) + poly(cam, [[-X, Hh - 34, z], [X, Hh - 34, z], [X, Hh, z], [-X, Hh, z]], tone('#4a301a', dz)); for (const sd of [-1, 1]) shell += poly(cam, [[sd * X, Hh - 34, z], [sd * (X - 40), Hh - 34, z], [sd * X, Hh - 90, z]], tone('#5a4a3a', dz)); }
    // the floor of flagstones, large and uneven
    shell += poly(cam, [[-X, 0, RM.Z0], [X, 0, RM.Z0], [X, 0, Z1], [-X, 0, Z1]], tone('#261e17', D([0, 0, 300]), 'g'));
    { const fr = rng(41), gp = [[], [], [], [], []]; for (let z = RM.Z0, row = 0; z < Z1; z += 70 + (row % 3) * 10, row++) for (let x = -X; x < X; x += 80 + ((row * 7) % 3) * 16) { const ox = (row % 2) * 40, j1 = fr() * 3, j2 = fr() * 3, gi = Math.floor(fr() * 5), dd = T.path(cam, [[x + ox + 3 + j1, 0.3, z + 3], [x + ox + 84 - j2, 0.3, z + 3 + j1], [x + ox + 84 - j1, 0.3, z + 66 - j2], [x + ox + 3 + j2, 0.3, z + 66]]); if (dd) gp[gi].push(dd); } shell += gp.map((g, i) => g.length ? `<path d="${g.join('')}" fill="${tone(shade('#4e4032', (i - 2) * 0.09), D([0, 0, 300]), 'g')}"/>` : '').join(''); }
    // the firelight on the floor and the left wall (flickering)
    { const fp = bb(cam, [-X + 80, 0, 380]); if (fp) { const fk = (0.8 + 0.2 * Math.sin(t * 6.3) * Math.sin(t * 2.7)) * nearFade(cam, fp); glow += `<ellipse cx="${f(fp.x)}" cy="${f(fp.y)}" rx="${f(520 * fp.k)}" ry="${f(520 * fp.k * clamp(cam.y / Math.max(100, fp.vd), 0.1, 1))}" fill="#ff8a3a" opacity="${f(0.22 * fk)}" style="mix-blend-mode:screen" filter="url(#b8)"/>`; } }
    // ---------------- the table, the map, candles, an inkwell, scrolls; the chandelier over it
    const td = D([0, TB.y, (TB.z0 + TB.z1) / 2]);
    items.push({ z: td, svg: () => {
      let s = poly(cam, [[-TB.x - 16, TB.y, TB.z0 - 16], [TB.x + 16, TB.y, TB.z0 - 16], [TB.x + 16, TB.y, TB.z1 + 16], [-TB.x - 16, TB.y, TB.z1 + 16]], tone('#5a3a20', td), OL(f(pxw(cam, [0, TB.y, TB.z0], 1.2, 0.3, 2)), 0.6));
      s += poly(cam, [[-TB.x - 16, TB.y, TB.z0 - 16], [TB.x + 16, TB.y, TB.z0 - 16], [TB.x + 16, TB.y - 12, TB.z0 - 16], [-TB.x - 16, TB.y - 12, TB.z0 - 16]], tone('#3a2412', td));
      for (const sd of [-1, 1]) { const xx = sd * (TB.x - 34); s += poly(cam, [[xx - 12, TB.y - 12, TB.z0 + 10], [xx + 12, TB.y - 12, TB.z0 + 10], [xx + 26, 0, TB.z0 + 10], [xx - 26, 0, TB.z0 + 10]], tone('#3a2412', td)) + poly(cam, [[xx - 30, 0, TB.z0 + 10], [xx + 30, 0, TB.z0 + 10], [xx + 30, 10, TB.z0 + 10], [xx - 30, 10, TB.z0 + 10]], tone('#2a1a0c', td)); }
      { const md = cam.dist([0, TB.y, 380]), sl = Math.abs(cam.y - TB.y) / Math.max(1, md), nn = md > 520 && sl > 0.5 ? 2 : md > 320 ? 5 : 9; s += tiled(cam, RM.MAP.O, RM.MAP.U, RM.MAP.V, P17.MAP.W, P17.MAP.H, nn, Math.max(2, Math.round(nn * 0.75)), P17.channelMap(t, { tokens: o.tokens || [] }), 'mp'); }
      if (o.letter) { const L = o.letter, lp = L.p, lsv = plane(cam, [lp[0], TB.y + 1.2, lp[2]], [L.k || 0.12, 0, 0], [0, 0, -(L.k || 0.12)], P17.letter(0, 0, 1, L.rot || 0, { wet: 0.6 }), 0, 0, 40); s += (L.op ?? 1) < 0.999 ? `<g opacity="${f(L.op)}">${lsv}</g>` : lsv; }
      // an inkwell and quill, two rolled maps at the near corners - truly projected: drawn as flat art with one affine map
      // taken at the anchor, close over the table they were drawn far from where they lie (LORDS 1340-1369: a dark disc
      // and a pale roll at the edges of the frame where nothing is)
      {
        const O = [TB.x - 26, TB.y + 1, TB.z0 - 4], Wp = (u, v) => [O[0] + u, O[1], O[2] - v];
        s += poly(cam, Array.from({ length: 20 }, (_, i) => Wp(9 * Math.cos(i * TAU / 20), 9 * Math.sin(i * TAU / 20))), '#1a1410');
        const q = Array.from({ length: 13 }, (_, i) => { const u = i / 12, m = 1 - u; return Wp(m * m * m * 4 + 3 * m * m * u * 30 + 3 * m * u * u * 44 + u * u * u * 50, -(m * m * m * 2 + 3 * m * m * u * 20 + 3 * m * u * u * 34 + u * u * u * 50)); }), qd = T.lineD(cam, q);
        if (qd) s += `<path d="${qd}" stroke="#f0ece0" stroke-width="${f(pxw(cam, q[6], 3))}" fill="none"/>`;
      }
      for (const [sx, rot] of [[-TB.x + 40, 8], [TB.x - 70, -14]]) {
        const O = [sx, TB.y + 3, TB.z0 + 8], ca = Math.cos(rot * Math.PI / 180), sa = Math.sin(rot * Math.PI / 180), Wp = (u, v) => [O[0] + u * ca - v * sa, O[1], O[2] - (u * sa + v * ca)], out = [];
        for (let i = 0; i <= 8; i++) { const a = -Math.PI / 2 + i * Math.PI / 8; out.push(Wp(34 + 6 * Math.cos(a), 6 * Math.sin(a))); }
        for (let i = 0; i <= 8; i++) { const a = Math.PI / 2 + i * Math.PI / 8; out.push(Wp(-34 + 6 * Math.cos(a), 6 * Math.sin(a))); }
        s += poly(cam, out, '#e0d0a8', `stroke="#6a5a3a" stroke-width="${f(pxw(cam, O, 1.5))}" stroke-linejoin="round"`) + poly(cam, Array.from({ length: 14 }, (_, i) => Wp(-40 + 3 * Math.cos(i * TAU / 14), 6 * Math.sin(i * TAU / 14))), '#c8b488');
      }
      return s;
    } });
    for (const [x, z] of [[-TB.x + 16, TB.z0 + 10], [TB.x - 16, TB.z0 + 10], [-TB.x + 16, TB.z1 - 14], [TB.x - 16, TB.z1 - 14]]) {
      const P0 = [x, TB.y, z], b0 = bb(cam, P0); if (!b0) continue;
      items.push({ z: b0.d - 2, svg: () => { const b = bb(cam, P0); if (!b) return ''; return `<g transform="${b.tr}"><path d="M-7,0 L7,0 L2.5,-4 L2.5,-28 L-2.5,-28 L-2.5,-4Z" fill="#2a2420"/><rect x="-2.6" y="-44" width="5.2" height="16" rx="1.5" fill="#efe6cc"/><path d="M2.6,-40 q2,4 0,9" stroke="#e8dcc0" stroke-width="1.4" fill="none"/></g>` + PR.flame(b.x, b.y - 45 * b.k, 0.24 * b.k, t + x * 0.1) + C.radial(b.x, b.y - 48 * b.k, Math.min(230, 120 * b.k), '#ffb860', 0.3, 'screen'); } });
    }
    { const P0 = [0, 500, 380], b0 = bb(cam, P0); if (b0) items.push({ z: b0.d, svg: () => { const b = bb(cam, P0); if (!b) return ''; return line(cam, [[0, Hh - 34, 380], [0, 510, 380]], '#1a1410', 2.5, 'stroke-dasharray="5 3"') + PR.chandelier(b.x, b.y, b.k * 0.72, t + 3, 10) + C.radial(b.x, b.y - 10 * b.k, 380 * b.k, '#ffb860', 0.18, 'screen'); } }); }
    return { yard, shell, items, E, glow, flash: fl };
  };
  // the rain in the courtyard: three layers (near streaks long and fast, far ones fine), splashes at the bottom
  const rain = (t, k, fl) => { if (k < 0.01) return ''; const r = rng(77); let g = ''; for (const [n, len, sp, w, op] of [[50, 70, 1500, 1.8, 0.3], [70, 40, 1100, 1.2, 0.26], [90, 22, 800, 0.9, 0.22]]) for (let i = 0; i < n; i++) { const x = r() * 1200 - 60, y = ((r() * 2100 + t * sp) % 2100) - 100; g += `<path d="M${f(x)},${f(y)} l${f(-len * 0.14)},${f(len)}" stroke="${fl > 0.1 ? '#f0f4ff' : '#c8d0e0'}" stroke-width="${w}" opacity="${f(op * k * (1 + fl))}"/>`; } return g; };
  HL.roomRender = (cam, t, o = {}, actors = []) => {
    const H = HL.roomDraw(cam, t, o);
    const all = H.items.concat(actors).sort((a, b) => b.z - a.z);
    const outside = cam.z > RM.Z1 - 40;
    let yardItems = '', roomItems = '';
    for (const it of all) { const s = it.svg(); if (!s) continue; if (it.out) yardItems += s; else roomItems += s; }
    const mist = `<defs><linearGradient id="yMist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a90a0" stop-opacity="0"/><stop offset="0.7" stop-color="#8a90a0" stop-opacity="0.07"/><stop offset="1" stop-color="#9aa0b0" stop-opacity="0.12"/></linearGradient></defs><rect x="-60" y="-60" width="1200" height="2040" fill="url(#yMist)"/>`;
    const flashRoom = H.flash > 0.02 ? `<rect x="-60" y="-60" width="1200" height="2040" fill="#c8d4f0" opacity="${f(0.16 * H.flash)}" style="mix-blend-mode:screen"/>` : '';
    return `${H.yard}${yardItems}${mist}${rain(t, o.rain ?? 1, H.flash)}${outside ? '' : H.shell + H.glow}${outside ? '' : roomItems}${outside ? '' : flashRoom}`;
  };
})(window);
