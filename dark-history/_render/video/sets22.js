// "The Royal Fool": the King's great hall in true perspective (world units cm; x right, y up, z from the doors toward
// the throne). A pillared nave (piers every 4 m, pointed arcades, a clerestory and a timber roof with tie beams and
// arched braces), side aisles whose tall stained-glass windows throw coloured sun shafts across the floor, a chequered
// stone floor with a blue runner, the throne dais (three steps, a gilded throne, the blue cloth of estate sewn with
// lilies under a canopy, a rose window above, lancets either side, tapestries), and at the other end the great oak
// doors under the minstrels' gallery, opening onto a torch-lit antechamber. Day or night (candle stands, wheel
// chandeliers), feast tables when asked. Everything is projected every frame (street3d's camera), so every dolly,
// crane and pan has true convergence and parallax; people stand in it as billboards and are depth-sorted with the piers,
// stands, tables and banners.
(function (G) {
  const T = G.ST3, { f, rng, shade } = G.RIG, C = G.CINE, PR = G.PROPS, Q = G.QCAST;
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t;
  const ss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  const TAU = Math.PI * 2;
  const HL = G.HALL = {};
  const W2 = 560, AW = 900, LEN = 3200, PR_R = 42, SPRING = 760, APEX = 1010, PLATE = 1500, RIDGE = 2050, AISLE_H = 1020;
  const PIERS = [400, 800, 1200, 1600, 2000, 2400, 2800];
  const DAIS = { z0: 2700, x: 430, top: 60 }, THRONE = [0, 60, 3040], CLOTH = { z: 3192, x: 215, y0: 70, y1: 650, tz: 3010 };
  HL.K = { W2, AW, LEN, PIERS, DAIS, THRONE, DOOR: { x: 210, h: 540, apex: 700 }, SEAT: 48, ARM: 74, ARMX: 41 };

  // ------------------------------------------------------------ palettes (day / night mixed by k)
  const rgb = T.rgbOf, hex = T.hexOf, cm = T.cmix;
  const mixC = (a, b, k) => hex(cm(rgb(a), rgb(b), k));
  const PAL = {
    day: { stone: '#a89a84', stoneD: '#7a6e5e', stoneL: '#c8bca4', pier: '#b4a68e', wood: '#5a3e26', woodD: '#3a2616', roof: '#2e2016', tileL: '#b8aa8e', tileD: '#7a6a58', rug: '#1e2c72', gold: '#d0a440', haze: '#b8a890', shade: '#4a4048', shadeK: 0.16, glass: 1, sky: '#f4ead0' },
    night: { stone: '#5a4a3a', stoneD: '#3a2e24', stoneL: '#7a6448', pier: '#665442', wood: '#3a2616', woodD: '#24160c', roof: '#140c08', tileL: '#6a5640', tileD: '#3e3026', rug: '#16204e', gold: '#c8963a', haze: '#2a1c14', shade: '#1a1018', shadeK: 0.22, glass: 0.12, sky: '#1a2440' }
  };
  const palette = k => { const o = {}; for (const key in PAL.day) { const a = PAL.day[key], b = PAL.night[key]; o[key] = typeof a === 'string' ? mixC(a, b, k) : lerp(a, b, k); } return o; };
  HL.palette = palette;
  const envOf = (P, k) => ({ shade: P.shade, shadeK: P.shadeK, haze: P.haze, hazeD: lerp(5200, 3600, k), hazeNear: 300, hazeMax: lerp(0.5, 0.7, k) });

  // ------------------------------------------------------------ helpers
  // art drawn in local cm (origin O, local x along U, local y along V; both world vectors of length 1 cm) placed in 3D by
  // an affine fit of the projection at the art's centre (exact at that point; small pieces read perfectly)
  // (the art is drawn with ONE affine map, taken at its anchor A. For a plane seen edge-on close to the lens that map is
  // far off: in FEAST a side-wall tapestry, wholly out of view, was smeared across the cloth of estate behind the King
  // for half a second, and the Oriflammes swept over the hall in TIME. ext, the art's extent [u0, v0, u1, v1] in its own
  // units: art whose true outline, clipped at the lens, is off screen is left out - beyond 40 px (blur bleeds in); inside
  // a transition, beyond the larger picture it shows (X.VEXP) and never less than T.path keeps. Art kept whose true
  // outline still misses the frame is clipped to that outline (it showed as a strip at the frame's edge, 80 px wide
  // through the FEAST->JUGGLE carry); art on screen is drawn exactly as before)
  const extPoly = (cam, O, U, V, e) => {
    const c = [[e[0], e[1]], [e[2], e[1]], [e[2], e[3]], [e[0], e[3]]].map(([u, v]) => cam.toC([O[0] + U[0] * u + V[0] * v, O[1] + U[1] * u + V[1] * v, O[2] + U[2] * u + V[2] * v])), nr = cam.near, P = [];
    for (let i = 0; i < 4; i++) { const a = c[i], b = c[(i + 1) % 4], ia = a[2] >= nr, ib = b[2] >= nr; if (ia) P.push(cam.scr(a)); if (ia !== ib) { const u = (nr - a[2]) / (b[2] - a[2]); P.push(cam.scr([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, nr])); } }
    return P;
  };
  // a convex polygon against the box [x0, x1] x [y0, y1] (separating axes)
  const polyHits = (P, x0, y0, x1, y1) => {
    if (P.length < 3) return false;
    let a0 = 1e9, a1 = -1e9, b0 = 1e9, b1 = -1e9; for (const p of P) { if (p[0] < a0) a0 = p[0]; if (p[0] > a1) a1 = p[0]; if (p[1] < b0) b0 = p[1]; if (p[1] > b1) b1 = p[1]; }
    if (a1 < x0 || a0 > x1 || b1 < y0 || b0 > y1) return false;
    const R = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
    for (let i = 0; i < P.length; i++) {
      const p = P[i], q = P[(i + 1) % P.length], nx = q[1] - p[1], ny = p[0] - q[0]; let pm = 1e18, pM = -1e18, rm = 1e18, rM = -1e18;
      for (const s of P) { const v = s[0] * nx + s[1] * ny; if (v < pm) pm = v; if (v > pM) pM = v; }
      for (const s of R) { const v = s[0] * nx + s[1] * ny; if (v < rm) rm = v; if (v > rM) rM = v; }
      if (pM < rm || rM < pm) return false;
    }
    return true;
  };
  let pcid = 0;
  const plane = (cam, O, U, V, svg, cx = 0, cy = 0, span = 100, ext = null) => {
    const A = [O[0] + U[0] * cx + V[0] * cy, O[1] + U[1] * cx + V[1] * cy, O[2] + U[2] * cx + V[2] * cy];
    const ca = cam.toC(A), P = ext && ca[2] >= cam.near + 10 ? extPoly(cam, O, U, V, ext) : null;
    const k = (G.ENG && G.ENG.VEXP) || 1, mx = k > 1 ? Math.max(300, 540 * (k - 1) + 40) : 40, my = k > 1 ? Math.max(300, 960 * (k - 1) + 40) : 40;
    const cut = !!P && !polyHits(P, -mx, -my, 1080 + mx, 1920 + my), clip = !!P && !cut && !polyHits(P, 0, 0, 1080, 1920);
    // (debug: _tools/planechk.js checks every call; it can answer true to leave the art out, to measure what that changes)
    const dbg = typeof window !== 'undefined' && window.__PLANECHK ? window.__PLANECHK(cam, O, U, V, svg, cx, cy, span, ext, cut, clip) : false;
    if (ca[2] < cam.near + 10 || cut || dbg === true) return '';
    const p0 = cam.scr(ca), pu = cam.proj([A[0] + U[0] * span, A[1] + U[1] * span, A[2] + U[2] * span]), pv = cam.proj([A[0] + V[0] * span, A[1] + V[1] * span, A[2] + V[2] * span]);
    if (!pu || !pv) return '';
    const a = (pu[0] - p0[0]) / span, b = (pu[1] - p0[1]) / span, c = (pv[0] - p0[0]) / span, d = (pv[1] - p0[1]) / span;
    const e = p0[0] - a * cx - c * cy, g = p0[1] - b * cx - d * cy;
    const art = `<g transform="matrix(${a.toFixed(5)},${b.toFixed(5)},${c.toFixed(5)},${d.toFixed(5)},${f(e)},${f(g)})">${svg}</g>`;
    if (!clip) return art;
    const id = 'pc' + (pcid++ % 100000);
    return `<defs><clipPath id="${id}"><path d="M${P.map(p => f(p[0]) + ',' + f(p[1])).join('L')}Z"/></clipPath></defs><g clip-path="url(#${id})">${art}</g>`;
  };
  HL.plane = plane;
  // a billboard: local cm, origin at the base point P, up = -y; returns the transform (null behind the lens)
  const bb = (cam, P) => { const c = cam.toC(P); if (c[2] < cam.near + 10) return null; const p = cam.scr(c), k = cam.fl / c[2]; return { x: p[0], y: p[1], k, d: cam.dist(P), vd: c[2], tr: `translate(${f(p[0])},${f(p[1])}) scale(${k.toFixed(5)})` }; };
  HL.bb = bb;
  const poly = (cam, pts, fill, x = '') => { const d = T.path(cam, pts); return d ? `<path d="${d}" fill="${fill}" ${x}/>` : ''; };
  const OL = (w = 1.2, op = 0.55) => `stroke="#140c06" stroke-width="${w}" stroke-opacity="${op}" stroke-linejoin="round"`;
  const lw = (cam, d, k = 1) => f(clamp(k * 1.6 * 900 / Math.max(60, d) * cam.fl / 1300, 0.3, 2.4));
  // a 2D convex hull (for the sun shafts)
  const hull = pts => { const P = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]); const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); const lo = [], up = []; for (const p of P) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); } for (let i = P.length - 1; i >= 0; i--) { const p = P[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); } return lo.slice(0, -1).concat(up.slice(0, -1)); };

  // ------------------------------------------------------------ stained glass art (local cm, origin at the sill centre,
  // up = -y); g: glow 0..1 (day lit, night dark)
  const GLASS = ['#2a5ac0', '#c0242c', '#e0a828', '#2a9050', '#7a2a9a', '#3a7ad8', '#d84a2a'];
  const lancetD = (w, h) => { const r = w * 0.9; return `M${-w / 2},0 L${-w / 2},${-h} A${f(r)},${f(r)} 0 0 1 0,${f(-h - Math.sqrt(r * r - (r - w / 2) ** 2))} A${f(r)},${f(r)} 0 0 1 ${w / 2},${-h} L${w / 2},0Z`; };
  const glassArt = (id, w, h, g, seed, night) => {
    const r = rng(seed), top = h + Math.sqrt((w * 0.9) ** 2 - (w * 0.4) ** 2);
    let s = `<defs><clipPath id="${id}"><path d="${lancetD(w, h)}"/></clipPath></defs><g clip-path="url(#${id})">`;
    s += `<rect x="${-w / 2}" y="${f(-top - 4)}" width="${w}" height="${f(top + 4)}" fill="${night ? '#0c1226' : '#f4ecd0'}"/>`;
    // panes: a grid of small lozenges of colour, brighter toward the middle; a figure-like medallion in each light
    const cols = 4, rows = Math.round(h / 34);
    for (let j = 0; j < rows + 3; j++) for (let i = 0; i < cols; i++) {
      const x0 = -w / 2 + i * w / cols, y0 = -(j + 1) * 34, c = GLASS[Math.floor(r() * GLASS.length)];
      const op = night ? 0.25 + r() * 0.2 : 0.55 + r() * 0.35;
      s += `<rect x="${f(x0 + 1.5)}" y="${f(y0 + 1.5)}" width="${f(w / cols - 3)}" height="31" fill="${c}" opacity="${f(op)}"/>`;
    }
    for (const [mx, my] of [[0, -h * 0.35], [0, -h * 0.72]]) s += `<circle cx="${mx}" cy="${f(my)}" r="${f(w * 0.3)}" fill="${night ? '#2a1a3a' : '#f8e8a8'}" opacity="${night ? 0.5 : 0.75}"/><circle cx="${mx}" cy="${f(my)}" r="${f(w * 0.3)}" fill="none" stroke="#1a1410" stroke-width="3"/><path d="M${mx},${f(my - w * 0.22)} L${mx},${f(my + w * 0.22)} M${f(mx - w * 0.22)},${f(my)} L${f(mx + w * 0.22)},${f(my)}" stroke="${night ? '#5a2a2a' : '#b8222a'}" stroke-width="5" opacity="0.8"/>`;
    // lead lines and the iron saddle bars, the mullion down the middle
    for (let j = 1; j < rows + 3; j++) s += `<path d="M${-w / 2},${-j * 34} L${w / 2},${-j * 34}" stroke="#1a1410" stroke-width="${j % 3 ? 1.4 : 3}" opacity="0.85"/>`;
    for (let i = 1; i < cols; i++) s += `<path d="M${f(-w / 2 + i * w / cols)},0 L${f(-w / 2 + i * w / cols)},${f(-top)}" stroke="#1a1410" stroke-width="${i === cols / 2 ? 7 : 1.4}" opacity="0.85"/>`;
    if (!night) s += `<rect x="${-w / 2}" y="${f(-top)}" width="${w}" height="${f(top)}" fill="#fff8e0" opacity="${f(0.22 * g)}"/>`;
    s += `</g><path d="${lancetD(w, h)}" fill="none" stroke="${night ? '#3a2e24' : '#8a7c66'}" stroke-width="12"/><path d="${lancetD(w + 26, h)}" fill="none" stroke="${night ? '#2a2018' : '#6a5e4c'}" stroke-width="10"/>`;
    return s;
  };
  // a lancet in a side wall (plane x), truly projected pane by pane (the wall is seen at a grazing angle, so no flat
  // art): u along z about zc, v up from the sill y0; w wide, h to the springing, a pointed head
  const glass3D = (cam, x, zc, y0, w, h, seed, night, E) => {
    const r = rng(seed), d = cam.dist([x, y0 + h / 2, zc]), W = (u, v) => [x, y0 + v, zc + u];
    const tone = (c, k = 'n') => T.tone(E, c, d, k), lwd = lw(cam, d, 1);
    const head = []; for (let i = 0; i <= 10; i++) { const a = i / 10; head.push([lerp(w / 2, -w / 2, a), h + w * 0.62 * Math.sin(Math.PI * a) ** 0.8]); }
    const outline = [[-w / 2, 0], [w / 2, 0], ...head].map(([u, v]) => W(u, v));
    let s = poly(cam, outline, night ? '#0c1226' : tone('#f2e8c8'));
    const rows = Math.max(4, Math.round(h / 80)), cols = 3, ph = h / rows;
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const u0 = -w / 2 + i * w / cols + 2, u1 = u0 + w / cols - 4, v0 = j * ph + 2, v1 = v0 + ph - 4, c = GLASS[Math.floor(r() * GLASS.length)];
      s += poly(cam, [W(u0, v0), W(u1, v0), W(u1, v1), W(u0, v1)], c, `opacity="${f(night ? 0.22 + r() * 0.15 : 0.5 + r() * 0.35)}"`);
    }
    s += poly(cam, head.map(([u, v]) => W(u * 0.8, h + (v - h) * 0.8 + 4)), night ? '#2a1a3a' : '#e8b840', `opacity="${night ? 0.4 : 0.8}"`);
    let lead = ''; for (let j = 1; j < rows; j++) { const dd = T.lineD(cam, [W(-w / 2, j * ph), W(w / 2, j * ph)]); if (dd) lead += dd; }
    for (let i = 1; i < cols; i++) { const dd = T.lineD(cam, [W(-w / 2 + i * w / cols, 0), W(-w / 2 + i * w / cols, h)]); if (dd) lead += dd; }
    if (lead) s += `<path d="${lead}" stroke="#1a1410" stroke-width="${f(lwd * 1.4)}" fill="none" opacity="0.85"/>`;
    if (!night) s += poly(cam, outline, '#fff8e0', 'opacity="0.18"');
    const fr = T.lineD(cam, [...outline, outline[0]]); if (fr) s += `<path d="${fr}" stroke="${tone(night ? '#3a2e24' : '#8a7c66', 's')}" stroke-width="${f(clamp(12 * cam.fl / Math.max(80, cam.toC([x, y0 + h / 2, zc])[2]), 0.6, 40))}" fill="none" stroke-linejoin="round"/>`;
    return s;
  };
  // a tapestry on a side wall, projected: a deep green field with a border and a lily shield
  const tapestry3D = (cam, x, zc, yTop, w, h, night, E, sd) => {
    const d = cam.dist([x, yTop - h / 2, zc]), W = (u, v) => [x, yTop - v, zc + u * -sd], tone = (c, k = 's') => T.tone(E, c, d, k);
    let s = poly(cam, [W(-w / 2, 0), W(w / 2, 0), W(w / 2, h), W(-w / 2, h)], tone(night ? '#142a1e' : '#1e4a34'), OL(lw(cam, d, 1.2), 0.6));
    s += poly(cam, [W(-w / 2 + 14, 14), W(w / 2 - 14, 14), W(w / 2 - 14, h - 14), W(-w / 2 + 14, h - 14)], tone(night ? '#1a3424' : '#2a5a40'));
    const br = T.lineD(cam, [W(-w / 2 + 10, 10), W(w / 2 - 10, 10), W(w / 2 - 10, h - 10), W(-w / 2 + 10, h - 10), W(-w / 2 + 10, 10)]); if (br) s += `<path d="${br}" stroke="${tone('#8a2a24')}" stroke-width="${f(clamp(9 * cam.fl / Math.max(80, cam.toC(W(0, h / 2))[2]), 0.5, 30))}" fill="none"/>`;
    const sh = [[-60, 0.3], [60, 0.3], [60, 0.55], [0, 0.8], [-60, 0.55]].map(([u, k]) => W(u, h * k));
    s += poly(cam, sh, tone('#1e3a9a'), `stroke="${tone('#d8b040')}" stroke-width="${lw(cam, d, 2)}"`);
    for (const [u, k] of [[-28, 0.4], [28, 0.4], [0, 0.6]]) s += plane(cam, W(u, h * k), [0, 0, -sd], [0, -1, 0], Q.lily(0, 0, 0.55, tone('#d8b040', 'n')), 0, 0, 30);
    return s;
  };
  // the rose window: twelve petals round a centre, radiating mullions, a moulded stone ring
  const roseArt = (R, night, t) => {
    let s = `<circle r="${R}" fill="${night ? '#0c1226' : '#f4ecd0'}"/>`;
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * TAU, x = Math.cos(a) * R * 0.62, y = Math.sin(a) * R * 0.62;
      s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(R * 0.3)}" fill="${GLASS[i % GLASS.length]}" opacity="${night ? 0.3 : 0.82}"/><circle cx="${f(x)}" cy="${f(y)}" r="${f(R * 0.3)}" fill="none" stroke="#1a1410" stroke-width="4"/>`;
      s += `<circle cx="${f(Math.cos(a + TAU / 24) * R * 0.9)}" cy="${f(Math.sin(a + TAU / 24) * R * 0.9)}" r="${f(R * 0.09)}" fill="${GLASS[(i + 3) % GLASS.length]}" opacity="${night ? 0.3 : 0.8}" stroke="#1a1410" stroke-width="3"/>`;
      s += `<path d="M${f(Math.cos(a) * R * 0.26)},${f(Math.sin(a) * R * 0.26)} L${f(Math.cos(a) * R)},${f(Math.sin(a) * R)}" stroke="#1a1410" stroke-width="5"/>`;
    }
    s += `<circle r="${f(R * 0.26)}" fill="${night ? '#3a2a14' : '#f0c040'}" opacity="${night ? 0.5 : 0.95}"/>` + Q.lily(0, 4, R * 0.0026, night ? '#1a2a5a' : '#1e3a9a');
    s += `<circle r="${f(R * 0.26)}" fill="none" stroke="#1a1410" stroke-width="6"/><circle r="${R}" fill="none" stroke="${night ? '#3a2e24' : '#8a7c66'}" stroke-width="22"/><circle r="${R + 22}" fill="none" stroke="${night ? '#2a2018' : '#6a5e4c'}" stroke-width="14"/>`;
    if (!night) s += `<circle r="${R}" fill="#fff8e0" opacity="0.18"/>`;
    return s;
  };
  // a lily banner (local cm, origin at the top centre, hanging down h, swallowtail), sway: the bottom's swing in cm
  const bannerArt = (w, h, sway, col, id) => {
    const b = sway;
    let s = `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${shade(col, -0.35)}"/><stop offset="0.35" stop-color="${shade(col, 0.12)}"/><stop offset="0.7" stop-color="${col}"/><stop offset="1" stop-color="${shade(col, -0.4)}"/></linearGradient></defs>`;
    s += `<path d="M${-w / 2},0 L${w / 2},0 L${f(w / 2 + b)},${h} L${f(b)},${f(h - w * 0.45)} L${f(-w / 2 + b)},${h}Z" fill="url(#${id})" ${OL(2, 0.6)}/>`;
    for (let y = 40, row = 0; y < h - w * 0.5; y += 46, row++) for (let x = -w / 2 + 18 + (row % 2) * 16; x < w / 2 - 10; x += 32) s += Q.lily(x + b * y / h, y, 0.42, '#d8b040');
    s += `<rect x="${-w / 2 - 8}" y="-6" width="${w + 16}" height="12" rx="5" fill="#5a3a1e" ${OL(1.5)}/><path d="M${-w / 2},12 L${w / 2},12" stroke="#d8b040" stroke-width="5"/>`;
    return s;
  };
  // a tapestry (local cm, origin at the top centre): a millefleur field, a crowned shield of lilies, a border
  const tapestryArt = (w, h, seed, night) => {
    const r = rng(seed);
    let s = `<rect x="${-w / 2}" y="0" width="${w}" height="${h}" fill="${night ? '#142a1e' : '#1e4a34'}" ${OL(2, 0.6)}/>`;
    for (let i = 0; i < 140; i++) s += `<circle cx="${f(-w / 2 + 14 + r() * (w - 28))}" cy="${f(14 + r() * (h - 28))}" r="${f(2 + r() * 3)}" fill="${['#e8d8a0', '#c84a3a', '#e8e0d0', '#d8a040'][i % 4]}" opacity="${night ? 0.35 : 0.75}"/>`;
    s += `<path d="M-60,${h * 0.3} L60,${h * 0.3} L60,${h * 0.55} C60,${h * 0.7} 20,${h * 0.76} 0,${h * 0.8} C-20,${h * 0.76} -60,${h * 0.7} -60,${h * 0.55}Z" fill="#1e3a9a" stroke="#d8b040" stroke-width="5"/>`;
    for (const [x, y] of [[-28, 0.38], [28, 0.38], [0, 0.6]]) s += Q.lily(x, h * y, 0.55, '#d8b040');
    s += `<path d="M-40,${h * 0.28} L-40,${h * 0.2} L-22,${h * 0.25} L0,${h * 0.17} L22,${h * 0.25} L40,${h * 0.2} L40,${h * 0.28}Z" fill="#d8b040" ${OL(1.2)}/>`;
    s += `<rect x="${-w / 2 + 8}" y="8" width="${w - 16}" height="${h - 16}" fill="none" stroke="#8a2a24" stroke-width="10"/><rect x="${-w / 2 + 8}" y="8" width="${w - 16}" height="${h - 16}" fill="none" stroke="#d8b040" stroke-width="2.5" stroke-dasharray="10 6"/>`;
    return s;
  };
  // the throne (local cm; origin at the front of its base on the dais, up = -y): a gilded frame with a pointed back
  // panel of blue velvet sewn with lilies, lion heads on the arms, a blue cushion, a footstool
  const throneArt = (night) => {
    const gold = night ? '#b8862e' : '#d4a43c';
    let s = `<defs><linearGradient id="thG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${shade(gold, -0.4)}"/><stop offset="0.3" stop-color="${shade(gold, 0.25)}"/><stop offset="0.55" stop-color="${gold}"/><stop offset="1" stop-color="${shade(gold, -0.45)}"/></linearGradient>` +
      `<linearGradient id="thB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a3c9a"/><stop offset="1" stop-color="#141e5a"/></linearGradient></defs>`;
    // the back: gable top, pinnacles
    s += `<path d="M-50,-46 L-50,-232 L-36,-232 L0,-292 L36,-232 L50,-232 L50,-46Z" fill="url(#thG)" ${OL(1.6)}/>`;
    s += `<path d="M-38,-58 L-38,-222 L0,-270 L38,-222 L38,-58Z" fill="url(#thB)" ${OL(1.2)}/>`;
    for (let y = -78, row = 0; y > -220; y -= 26, row++) for (let x = -26 + (row % 2) * 13; x <= 26; x += 26) s += Q.lily(x, y, 0.32, '#d8b040');
    for (const x of [-50, 50]) s += `<rect x="${x - 6}" y="-262" width="12" height="34" fill="url(#thG)" ${OL(1)}/><path d="M${x - 6},-262 L${x},-282 L${x + 6},-262Z" fill="${gold}" ${OL(1)}/>` + Q.lily(x, -288, 0.3, gold);
    s += Q.lily(0, -300, 0.42, gold);
    // the seat, cushion, the arms with lion heads, the legs and an arcaded front panel
    s += `<rect x="-46" y="-52" width="92" height="10" rx="4" fill="#24348a" ${OL(1.2)}/>`;
    s += `<rect x="-52" y="-44" width="104" height="44" fill="url(#thG)" ${OL(1.4)}/>`;
    for (let i = 0; i < 5; i++) s += `<path d="M${-40 + i * 18},-6 L${-40 + i * 18},-26 Q${-31 + i * 18},-38 ${-22 + i * 18},-26 L${-22 + i * 18},-6" fill="${shade(gold, -0.45)}" opacity="0.7"/>`;
    for (const sd of [-1, 1]) {
      const x0 = sd * 34, x1 = sd * 48;
      s += `<rect x="${Math.min(x0, x1)}" y="-74" width="14" height="74" fill="url(#thG)" ${OL(1.2)}/><rect x="${Math.min(x0, x1) - 2}" y="-78" width="18" height="8" rx="3" fill="${shade(gold, 0.15)}" ${OL(1)}/>`;
      const lx = sd * 41, ly = -80;
      s += `<circle cx="${lx}" cy="${ly}" r="10" fill="${shade(gold, -0.15)}" ${OL(1)}/>` + Array.from({ length: 9 }, (_, i) => { const a = i / 9 * TAU; return `<circle cx="${f(lx + Math.cos(a) * 9)}" cy="${f(ly + Math.sin(a) * 9)}" r="3.4" fill="${shade(gold, -0.3)}"/>`; }).join('') +
        `<circle cx="${lx}" cy="${ly}" r="6.5" fill="${gold}"/><ellipse cx="${lx - 1.5}" cy="${ly - 2}" rx="2.6" ry="1.8" fill="#fff4c0" opacity="0.6"/>`;
    }
    // the footstool
    s += `<rect x="-30" y="-12" width="60" height="12" rx="3" fill="#24348a" ${OL(1.2)} transform="translate(0,14)"/>`;
    return s;
  };
  HL.throneArt = throneArt;
  // an iron candle stand (local cm; origin at its foot): a tripod, a stem, a ring of five candles
  const standArt = (t, seed, lit) => {
    let s = `<path d="M-26,0 L0,-26 L26,0 M0,-26 L0,-170" stroke="#1a1612" stroke-width="4.5" fill="none" stroke-linecap="round"/><ellipse cx="0" cy="-172" rx="30" ry="5" fill="#2a2420" ${OL(1)}/>`;
    for (let i = 0; i < 5; i++) { const x = -24 + i * 12, h = 18 + (i % 2) * 6; s += `<rect x="${x - 2.4}" y="${-172 - h}" width="4.8" height="${h}" rx="1.4" fill="#efe6cc" ${OL(0.6)}/>`; }
    return s;
  };
  const standFlames = (tr, t, seed, k) => { let s = ''; for (let i = 0; i < 5; i++) { const x = -24 + i * 12, h = 18 + (i % 2) * 6, fl = 1 + 0.12 * Math.sin(t * (9 + i) + seed + i * 2); s += `<path d="M${x},${-172 - h - 1} q-2.6,-4 0,${f(-9 * fl)} q2.6,${f(5 * fl)} 0,${f(9 * fl)}Z" fill="#ffd070"/><path d="M${x},${-172 - h - 1} q-1.2,-2.5 0,${f(-5 * fl)} q1.2,2.5 0,${f(5 * fl)}Z" fill="#fff8e0"/>`; } return `<g transform="${tr}" opacity="${f(k)}">${s}</g>`; };

  // ------------------------------------------------------------ the shell (walls, floor, roof): drawn behind everything
  // o: night 0..1; sun { dir: world direction the light travels, k }; doors 0..1 (open); feast; dof (px)
  HL.draw = (cam, t, o = {}) => {
    const nk = o.night || 0, P = palette(nk), E = envOf(P, nk), night = nk > 0.5;
    const tone = (c, d, kind = 'g') => T.tone(E, c, d, kind);
    const items = [];
    let back = '', shell = '', over = '';
    const D = p => cam.dist(p);
    // ---- the antechamber beyond the doors (only seen through the doorway)
    {
      const z1 = -760, hx = 300, hy = 620;
      const quad = (pts, c, k) => poly(cam, pts, tone(c, D(pts[0]), k));
      back += quad([[-hx, hy, 0], [hx, hy, 0], [hx, hy, z1], [-hx, hy, z1]], '#24180e', 'd') + quad([[-hx, 0, z1], [hx, 0, z1], [hx, hy, z1], [-hx, hy, z1]], '#4a3424', 'd') + quad([[-hx, 0, 0], [-hx, 0, z1], [-hx, hy, z1], [-hx, hy, 0]], '#3a281a', 'd') + quad([[hx, 0, 0], [hx, 0, z1], [hx, hy, z1], [hx, hy, 0]], '#3a281a', 'd') + quad([[-hx, 0, 0], [hx, 0, 0], [hx, 0, z1], [-hx, 0, z1]], '#2a1e16', 'g');
      const tb = bb(cam, [-160, 260, z1 + 10]);
      if (tb) back += `<g transform="${tb.tr}">${'<path d="M0,0 L0,-40" stroke="#1a1410" stroke-width="5"/>'}</g>` + PR.flame(tb.x, tb.y - 44 * tb.k, 0.6 * tb.k, t) + C.radial(tb.x, tb.y - 50 * tb.k, 260 * tb.k, '#ffa040', 0.5, 'screen');
    }
    // ---- roof slopes and purlins (the trusses come after the walls, they hang in front of them)
    const rd = D([0, 1800, cam.z + 1500]);
    {
      const zA = -60, zB = LEN + 60;
      shell += poly(cam, [[-W2, PLATE, zA], [0, RIDGE, zA], [0, RIDGE, zB], [-W2, PLATE, zB]], tone(P.roof, rd, 'd')) + poly(cam, [[W2, PLATE, zA], [0, RIDGE, zA], [0, RIDGE, zB], [W2, PLATE, zB]], tone(shade(P.roof, 0.08), rd, 'd'));
      for (const k of [0.33, 0.66]) for (const sd of [-1, 1]) { const d = T.lineD(cam, [[sd * W2 * (1 - k), lerp(PLATE, RIDGE, k) - 8, zA], [sd * W2 * (1 - k), lerp(PLATE, RIDGE, k) - 8, zB]]); if (d) shell += `<path d="${d}" stroke="${tone(P.woodD, rd, 'd')}" stroke-width="${f(lw(cam, 900, 3))}" fill="none"/>`; }
    }
    const trusses = () => {
      let s = '';
      for (let z = 400; z < LEN; z += 400) {
        const d = D([0, PLATE, z]); if (d < 60) continue;
        const wc = tone(P.wood, d, 's'), wd = tone(P.woodD, d, 'd'), wpx = y => clamp(y * cam.fl / Math.max(80, cam.toC([0, PLATE, z])[2]), 0.5, 70);
        // principal rafters, the king post, the tie beam (bottom and front faces), the arched braces from the walls
        for (const sd of [-1, 1]) { const rr = T.lineD(cam, [[sd * W2, PLATE, z - 10], [0, RIDGE - 10, z - 10]]); if (rr) s += `<path d="${rr}" stroke="${wd}" stroke-width="${f(wpx(28))}" fill="none"/>`; }
        s += poly(cam, [[-12, PLATE, z - 12], [12, PLATE, z - 12], [12, RIDGE - 16, z - 12], [-12, RIDGE - 16, z - 12]], wc);
        s += poly(cam, [[-W2, PLATE - 36, z - 16], [W2, PLATE - 36, z - 16], [W2, PLATE - 36, z + 16], [-W2, PLATE - 36, z + 16]], wd) + poly(cam, [[-W2, PLATE - 36, z - 16], [W2, PLATE - 36, z - 16], [W2, PLATE + 6, z - 16], [-W2, PLATE + 6, z - 16]], wc, OL(lw(cam, d, 0.6), 0.5));
        for (const sd of [-1, 1]) {
          const pts = []; for (let i = 0; i <= 12; i++) { const a = i / 12 * Math.PI / 2; pts.push([sd * (W2 - 250 * (1 - Math.cos(a))), PLATE - 330 + 294 * Math.sin(a), z - 14]); }
          const dd = T.lineD(cam, pts); if (dd) s += `<path d="${dd}" stroke="${wd}" stroke-width="${f(wpx(24))}" fill="none" stroke-linecap="round"/>`;
          const cb = cam.toC([sd * (W2 - 6), PLATE - 340, z - 14]); if (cb[2] > cam.near + 5) { const pp = cam.scr(cb), k = cam.fl / cb[2]; s += `<path d="M${f(pp[0] - 16 * k)},${f(pp[1])} L${f(pp[0] + 16 * k)},${f(pp[1])} L${f(pp[0] + 8 * k)},${f(pp[1] + 40 * k)} L${f(pp[0] - 8 * k)},${f(pp[1] + 40 * k)}Z" fill="${tone(P.stoneL, d, 's')}"/>`; }
        }
      }
      return s;
    };
    // ---- the aisles: outer walls with tall windows, the aisle floors
    const winOut = [];
    for (const sd of [-1, 1]) {
      const x = sd * AW, d = D([x, 500, cam.z + 1200]);
      shell += poly(cam, [[x, 0, 0], [x, 0, LEN], [x, AISLE_H, LEN], [x, AISLE_H, 0]], tone(P.stoneD, d, 's'));
      for (let y = 60; y < AISLE_H; y += 60) { const dd = T.lineD(cam, [[x, y, 0], [x, y, LEN]]); if (dd) shell += `<path d="${dd}" stroke="${tone(shade(P.stoneD, -0.3), d, 's')}" stroke-width="${lw(cam, d, 0.8)}" fill="none" opacity="0.6"/>`; }
      shell += poly(cam, [[x, AISLE_H, 0], [x, AISLE_H, LEN], [sd * W2, AISLE_H + 60, LEN], [sd * W2, AISLE_H + 60, 0]], tone(P.woodD, d, 'd'));
      for (let zb = 200; zb < LEN; zb += 400) {
        const wd = D([x, 600, zb]);
        const g = glass3D(cam, x - sd * 2, zb, 300, 170, 560, 2200 + zb + (sd > 0 ? 7 : 0), night, E);
        if (g) winOut.push({ d: wd, svg: `<g opacity="${f(1 - 0.5 * clamp((wd - 2600) / 3000))}">${g}</g>` });
        winOut.push({ d: wd + 1, svg: '' });
      }
      shell += poly(cam, [[sd * W2, 0, 0], [x, 0, 0], [x, 0, LEN], [sd * W2, 0, LEN]], tone(P.tileD, d, 'g'));
    }
    shell += winOut.sort((a, b) => b.d - a.d).map(w => w.svg).join('');
    // ---- the end walls: the throne end (rose window, lancets, the cloth of estate, its canopy), the door end (doorway,
    // tympanum, the gallery)
    {
      const z = LEN, d = D([0, 700, z]);
      const wallC = tone(P.stone, d, 's');
      const hole = [[-W2, 0], [W2, 0], [W2, PLATE], [0, RIDGE], [-W2, PLATE]];
      shell += poly(cam, hole.map(([x, y]) => [x, y, z]), wallC) + poly(cam, [[-AW, 0, z], [-W2, 0, z], [-W2, AISLE_H + 60, z], [-AW, AISLE_H, z]], tone(P.stoneD, d, 's')) + poly(cam, [[W2, 0, z], [AW, 0, z], [AW, AISLE_H, z], [W2, AISLE_H + 60, z]], tone(P.stoneD, d, 's'));
      // ashlar courses
      let crs = '';
      for (let y = 50; y < PLATE; y += 50) { const dd = T.lineD(cam, [[-W2, y, z - 1], [W2, y, z - 1]]); if (dd) crs += dd; }
      if (crs) shell += `<path d="${crs}" stroke="${tone(shade(P.stone, -0.28), d, 's')}" stroke-width="${lw(cam, d, 0.8)}" fill="none" opacity="0.55"/>`;
      const rose = plane(cam, [0, 1170, z - 2], [1, 0, 0], [0, -1, 0], roseArt(240, night, t), 0, 0, 100); shell += rose;
      for (const sd of [-1, 1]) shell += plane(cam, [sd * 420, 320, z - 2], [1, 0, 0], [0, -1, 0], glassArt('lz' + sd, 140, 560, 1, 2900 + sd * 3, night), 0, -360, 100);
      // the cloth of estate on the wall and its canopy (tester) above the throne
      const cl = `<defs><linearGradient id="coe" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#101a50"/><stop offset="0.3" stop-color="#2a3c9e"/><stop offset="0.6" stop-color="#22348a"/><stop offset="1" stop-color="#0e1648"/></linearGradient></defs><rect x="${-CLOTH.x}" y="0" width="${CLOTH.x * 2}" height="${CLOTH.y1 - CLOTH.y0}" fill="url(#coe)" ${OL(2, 0.6)}/>` +
        Array.from({ length: 9 }, (_, row) => Array.from({ length: 6 }, (_, i) => Q.lily(-CLOTH.x + 40 + i * 70 + (row % 2) * 35, 50 + row * 64, 0.42, '#a8822a')).join('')).join('') +
        [-180, -90, 0, 90, 180].map(x => `<path d="M${x},0 L${x},${CLOTH.y1 - CLOTH.y0}" stroke="#000" stroke-width="16" opacity="0.18"/>`).join('');
      shell += plane(cam, [0, CLOTH.y1, CLOTH.z], [1, 0, 0], [0, -1, 0], cl, 0, (CLOTH.y1 - CLOTH.y0) / 2, 100);
      const cd = D([0, CLOTH.y1, CLOTH.tz]);
      shell += poly(cam, [[-CLOTH.x - 30, CLOTH.y1, CLOTH.z], [CLOTH.x + 30, CLOTH.y1, CLOTH.z], [CLOTH.x + 30, CLOTH.y1, CLOTH.tz], [-CLOTH.x - 30, CLOTH.y1, CLOTH.tz]], tone('#141e5a', cd, 'd'));
      // the valance: a gold-fringed blue drop along the canopy's front edge, scalloped
      const val = `<path d="M${-CLOTH.x - 30},0 L${CLOTH.x + 30},0 L${CLOTH.x + 30},44 ${Array.from({ length: 12 }, (_, i) => { const x0 = CLOTH.x + 30 - (i + 1) * (CLOTH.x * 2 + 60) / 12; return `Q${f(x0 + (CLOTH.x * 2 + 60) / 24)},70 ${f(x0)},44`; }).join(' ')} Z" fill="#22348a" ${OL(1.6, 0.6)}/>` + Array.from({ length: 12 }, (_, i) => Q.lily(-CLOTH.x - 30 + (i + 0.5) * (CLOTH.x * 2 + 60) / 12, 26, 0.36, '#d8b040')).join('') + `<path d="M${-CLOTH.x - 30},4 L${CLOTH.x + 30},4" stroke="#d8b040" stroke-width="6"/>`;
      items.push({ z: cd - 5, svg: () => plane(cam, [0, CLOTH.y1, CLOTH.tz], [1, 0, 0], [0, -1, 0], val, 0, 30, 100) });
    }
    {
      const z = 0, d = D([0, 700, z]), Dr = HL.K.DOOR;
      // the wall with the pointed doorway cut out of it (even-odd)
      const outer = T.path(cam, [[-W2, 0, z], [W2, 0, z], [W2, PLATE, z], [0, RIDGE, z], [-W2, PLATE, z]]);
      const archP = [[-Dr.x, 0, z]]; for (let i = 0; i <= 12; i++) { const a = i / 12; archP.push([-Dr.x + 2 * Dr.x * a, Dr.h + (Dr.apex - Dr.h) * Math.sin(Math.PI * a) ** 0.7, z]); } archP.push([Dr.x, 0, z]);
      const hole = T.path(cam, archP);
      if (outer) shell += `<path d="${outer}${hole ? ' ' + hole : ''}" fill-rule="evenodd" fill="${tone(P.stone, d, 's')}"/>`;
      for (const sd of [-1, 1]) shell += poly(cam, [[sd * W2, 0, z], [sd * AW, 0, z], [sd * AW, AISLE_H, z], [sd * W2, AISLE_H + 60, z]], tone(P.stoneD, d, 's'));
      let crs = ''; for (let y = 50; y < PLATE; y += 50) for (const [x0, x1] of y < Dr.apex ? [[-W2, -Dr.x - 4], [Dr.x + 4, W2]] : [[-W2, W2]]) { const dd = T.lineD(cam, [[x0, y, z + 1], [x1, y, z + 1]]); if (dd) crs += dd; }
      if (crs) shell += `<path d="${crs}" stroke="${tone(shade(P.stone, -0.28), d, 's')}" stroke-width="${lw(cam, d, 0.8)}" fill="none" opacity="0.55"/>`;
      if (hole) { const dd = T.lineD(cam, archP.slice(1, -1).map(p => [p[0] * 1.08, p[1] * 1.04, z + 2])); if (dd) shell += `<path d="${dd}" stroke="${tone(P.stoneL, d, 's')}" stroke-width="${f(clamp(20 * cam.fl / Math.max(80, cam.toC([0, 500, z])[2]), 1, 50))}" fill="none"/>`; }
      // the two oak leaves swing into the hall (hinged at the jambs), iron straps
      const op = o.doors || 0, ang = op * 1.45;
      for (const sd of [-1, 1]) {
        const hx = sd * Dr.x, ex = hx - sd * Dr.x * Math.cos(ang), ez = Dr.x * Math.sin(ang);
        const lp = [[hx, 0, z + 4], [ex, 0, z + 4 + ez], [ex, Dr.h + 60 * (1 - op * 0), z + 4 + ez], [hx, Dr.h + 60, z + 4]];
        const ld = D([(hx + ex) / 2, 250, ez / 2]);
        const lc = tone(op > 0.02 ? shade(P.wood, -0.08 * sd) : P.wood, ld, 's');
        items.push({ z: ld, svg: () => { let s = poly(cam, lp, lc, OL(lw(cam, ld, 1), 0.6)); for (const yy of [80, 240, 400]) { const st = T.lineD(cam, [[hx, yy, z + 5], [lerp(hx, ex, 0.92), yy, z + 5 + ez * 0.92]]); if (st) s += `<path d="${st}" stroke="#1a1612" stroke-width="${f(clamp(9 * cam.fl / Math.max(80, cam.toC([hx, yy, z])[2]), 0.6, 18))}" fill="none"/>`; } for (let k = 1; k < 6; k++) { const pl = T.lineD(cam, [[lerp(hx, ex, k / 6), 0, z + 5 + ez * k / 6], [lerp(hx, ex, k / 6), Dr.h + 60, z + 5 + ez * k / 6]]); if (pl) s += `<path d="${pl}" stroke="#000" stroke-width="${lw(cam, ld, 0.8)}" opacity="0.35" fill="none"/>`; } return s; } });
      }
      // the tympanum over the doors (carved, a lily) is the arch above the leaves
      items.push({ z: D([0, Dr.h + 60, 2]) + 3, svg: () => { const pts = archP.slice(1, -1).filter(p => p[1] >= Dr.h + 60).concat([[Dr.x, Dr.h + 60, z + 2], [-Dr.x, Dr.h + 60, z + 2]]).map(p => [p[0], p[1], z + 2]); return poly(cam, [[-Dr.x, Dr.h + 60, z + 2]].concat(archP.slice(1, -1).filter(p => p[1] > Dr.h + 60).map(p => [p[0], p[1], z + 2])).concat([[Dr.x, Dr.h + 60, z + 2]]), tone(P.stoneL, d, 's'), OL(lw(cam, d), 0.6)) + plane(cam, [0, Dr.h + 105, z + 3], [1, 0, 0], [0, -1, 0], Q.lily(0, 0, 1.0, tone(P.gold, d, 'n')), 0, 0, 60); } });
      // the minstrels' gallery: a timber balustrade across the hall over the doors
      const gz = 170, gy0 = 760, gy1 = 860, gd = D([0, 700, gz]);
      items.push({ z: gd + 40, svg: () => { let s = poly(cam, [[-W2, gy0, 0], [W2, gy0, 0], [W2, gy0, gz], [-W2, gy0, gz]], tone(P.woodD, gd, 'd')) + poly(cam, [[-W2, gy0 - 40, gz], [W2, gy0 - 40, gz], [W2, gy1, gz], [-W2, gy1, gz]], tone(P.wood, gd, 's'), OL(lw(cam, gd), 0.5)); for (let x = -W2 + 40; x < W2; x += 56) { const dd = T.lineD(cam, [[x, gy0 + 6, gz + 1], [x, gy1 - 8, gz + 1]]); if (dd) s += `<path d="${dd}" stroke="${tone(P.woodD, gd, 'd')}" stroke-width="${f(clamp(7 * cam.fl / Math.max(80, cam.toC([x, gy0, gz])[2]), 0.5, 14))}"/>`; } return s; } });
      for (const sd of [-1, 1]) items.push({ z: D([sd * 300, 500, gz + 6]), svg: () => plane(cam, [sd * 300, gy0 - 40, gz + 6], [1, 0, 0], [0, -1, 0], bannerArt(110, 380, 3 * Math.sin(t * 0.7 + sd), sd > 0 ? '#22348a' : '#8a1e22', 'gb' + sd), 0, 190, 100) });
    }
    // the arcade walls (spandrels with pointed arches between the piers, the clerestory above): drawn in the shell
    for (const sd of [-1, 1]) {
      const x = sd * W2, d = D([x, 900, cam.z + 1200]);
      const outer = [[x, 0, 0], [x, 0, LEN], [x, PLATE, LEN], [x, PLATE, 0]];
      let dpath = T.path(cam, outer) || '';
      const zs = [0, ...PIERS, LEN];
      for (let i = 0; i < zs.length - 1; i++) {
        if (i === 0 || i === zs.length - 2) continue;   // the end bays are solid wall
        const za = zs[i] + PR_R * 0.7, zb2 = zs[i + 1] - PR_R * 0.7, pts = [[x, -2, za]];
        for (let j = 0; j <= 14; j++) { const a = j / 14; pts.push([x, SPRING + (APEX - SPRING) * Math.sin(Math.PI * a) ** 0.62, lerp(za, zb2, a)]); }
        pts.push([x, -2, zb2]);
        const hp = T.path(cam, pts); if (hp) dpath += ' ' + hp;
        // the clerestory window in this bay
      }
      if (dpath) shell += `<path d="${dpath}" fill-rule="evenodd" fill="${tone(P.stone, d, 's')}"/>`;
      // mouldings round each arch, the string course, clerestory lancets
      let mo = '';
      for (let i = 1; i < zs.length - 2; i++) { const za = zs[i] + PR_R * 0.5, zb2 = zs[i + 1] - PR_R * 0.5, pts = []; for (let j = 0; j <= 14; j++) { const a = j / 14; pts.push([x - sd * 2, SPRING + 14 + (APEX + 14 - SPRING) * Math.sin(Math.PI * a) ** 0.62, lerp(za, zb2, a)]); } const dd = T.lineD(cam, pts); if (dd) mo += dd; }
      if (mo) shell += `<path d="${mo}" stroke="${tone(P.stoneL, d, 's')}" stroke-width="${lw(cam, d, 3)}" fill="none"/>`;
      const sc = T.lineD(cam, [[x - sd * 3, 1080, 0], [x - sd * 3, 1080, LEN]]); if (sc) shell += `<path d="${sc}" stroke="${tone(P.stoneL, d, 's')}" stroke-width="${lw(cam, d, 2.6)}" fill="none"/>`;
      let crs = ''; for (let y = 1130; y < PLATE; y += 50) { const dd = T.lineD(cam, [[x - sd * 1, y, 0], [x - sd * 1, y, LEN]]); if (dd) crs += dd; }
      if (crs) shell += `<path d="${crs}" stroke="${tone(shade(P.stone, -0.3), d, 's')}" stroke-width="${lw(cam, d, 0.7)}" fill="none" opacity="0.5"/>`;
      for (let zb = 600; zb < LEN - 400; zb += 400) shell += glass3D(cam, x - sd * 3, zb, 1140, 90, 200, 4100 + zb + sd, night, E);
      for (const zb of [200, 3000]) shell += tapestry3D(cam, x - sd * 3, zb, 700, 300, 520, night, E, sd);
    }
    shell += trusses();
    // ---- the floor: chequered stone (dark and light, a little variation in each), grouped by tone and distance
    {
      const S = 64, rr = rng(77), groups = {};
      const cz = cam.z;
      for (let iz = 0; iz < LEN / S; iz++) for (let ix = -Math.ceil(W2 / S); ix < Math.ceil(W2 / S); ix++) {
        const x0 = ix * S, z0 = iz * S, vv = rr(), dark = (ix + iz) % 2 === 0;
        const zc = z0 + S / 2; if (Math.abs(zc - cz) > 4000) continue;
        const dd = T.path(cam, [[x0, 0, z0], [x0 + S, 0, z0], [x0 + S, 0, z0 + S], [x0, 0, z0 + S]]); if (!dd) continue;
        const band = Math.min(9, Math.floor(Math.hypot(x0 + S / 2 - cam.x, cam.y, zc - cz) / 450)), key = (dark ? 'd' : 'l') + Math.floor(vv * 3) + '_' + band;
        (groups[key] = groups[key] || []).push(dd);
      }
      let fl = '';
      for (const key in groups) { const dark = key[0] === 'd', v = +key[1], band = +key.split('_')[1]; const base = dark ? shade(P.tileD, (v - 1) * 0.08) : shade(P.tileL, (v - 1) * 0.06); fl += `<path d="${groups[key].join('')}" fill="${tone(base, band * 450 + 220, 'g')}"/>`; }
      shell += `<g>${fl}</g>`;
      // the runner up the middle, a gold border, lilies woven into it
      const r0 = 150, r1 = DAIS.z0 - 4, rd = D([0, 0, (r0 + r1) / 2]);
      shell += poly(cam, [[-120, 0.5, r0], [120, 0.5, r0], [120, 0.5, r1], [-120, 0.5, r1]], tone(P.rug, rd, 'g'));
      for (const x of [-104, 104]) { const dd = T.lineD(cam, [[x, 1, r0 + 10], [x, 1, r1]]); if (dd) shell += `<path d="${dd}" stroke="${tone(P.gold, rd, 'g')}" stroke-width="${lw(cam, 600, 2.4)}" fill="none"/>`; }
      for (let z = r0 + 120; z < r1 - 60; z += 220) { const ld = D([0, 0, z]); if (ld < 80 || ld > 3600) continue; shell += plane(cam, [0, 1, z], [1, 0, 0], [0, 0, -1], Q.lily(0, 0, 0.62, tone(P.gold, ld, 'g')), 0, 0, 40); }
      // the dais: three steps, the platform, a red carpet down the steps
      const st = [[DAIS.z0, 0, 20], [DAIS.z0 + 60, 20, 40], [DAIS.z0 + 120, 40, 60]];
      for (const [zz, y0, y1] of st) {
        const dd = D([0, y1, zz]);
        shell += poly(cam, [[-DAIS.x, y0, zz], [DAIS.x, y0, zz], [DAIS.x, y1, zz], [-DAIS.x, y1, zz]], tone(P.stoneD, dd, 's')) + poly(cam, [[-DAIS.x, y1, zz], [DAIS.x, y1, zz], [DAIS.x, y1, LEN], [-DAIS.x, y1, LEN]], tone(P.stoneL, dd, 'g'));
        shell += poly(cam, [[-140, y0 + 0.5, zz - 0.5], [140, y0 + 0.5, zz - 0.5], [140, y1 + 0.5, zz - 0.5], [-140, y1 + 0.5, zz - 0.5]], tone('#7a1a20', dd, 's')) + poly(cam, [[-140, y1 + 0.6, zz], [140, y1 + 0.6, zz], [140, y1 + 0.6, zz + 60], [-140, y1 + 0.6, zz + 60]], tone('#8a2026', dd, 'g'));
        for (const sd of [-1, 1]) shell += poly(cam, [[sd * DAIS.x, y0, zz], [sd * DAIS.x, y1, zz], [sd * DAIS.x, y1, LEN], [sd * DAIS.x, y0, LEN]], tone(shade(P.stoneD, -0.1), dd, 's'));
      }
    }
    // ---- light: sun pools on the floor and shafts through the aisle windows (day), candle pools (night)
    let light = '';
    const sun = o.sun || { dir: [-0.78, -0.55, 0.2], k: 1 - nk };
    if (sun.k > 0.01) {
      const sd = sun.dir, srcX = sd[0] < 0 ? AW : -AW;
      for (let zb = 200; zb < LEN; zb += 400) {
        const cnr = [[0, 300], [0, 860], [1, 860], [1, 300]].map(([u, y]) => [srcX, y, zb - 85 + 170 * u]);
        const hit = cnr.map(p => { const k = -p[1] / sd[1]; return [p[0] + sd[0] * k, 0, p[2] + sd[2] * k]; });
        const pd = D(hit[0]); if (pd > 5200) continue;
        const pp = T.path(cam, hit); if (pp) light += `<path d="${pp}" fill="#fff0c8" opacity="${f(0.3 * sun.k)}" style="mix-blend-mode:screen"/>` + `<path d="${pp}" fill="${GLASS[Math.floor(zb / 400) % GLASS.length]}" opacity="${f(0.05 * sun.k)}" style="mix-blend-mode:screen"/>`;
        // the shaft is only seen inside the nave: from where the light passes the arcade to the floor
        const sg = Math.sign(srcX), cross = cnr.map(p => { const k = (sg * W2 - p[0]) / sd[0]; return [sg * W2, p[1] + sd[1] * k, p[2] + sd[2] * k]; });
        const sp = cross.concat(hit).map(p => cam.proj(p)); if (sp.some(p => !p)) continue;
        const h = hull(sp); light += `<path d="M${h.map(p => f(p[0]) + ',' + f(p[1])).join('L')}Z" fill="#fff2d0" opacity="${f(0.07 * sun.k)}" style="mix-blend-mode:screen"/>`;
      }
    }
    // ---- items: piers, candle stands, banners, chandeliers, the throne, the tables
    for (const sd of [-1, 1]) for (const z of PIERS) {
      const x = sd * W2, d = D([x, 400, z]);
      items.push({ z: d, svg: () => pier(cam, x, z, d, P, E, sd) });
    }
    // candle stands along the nave
    for (const sd of [-1, 1]) for (const z of [700, 1500, 2300]) {
      const P0 = [sd * 420, 0, z], b0 = bb(cam, P0); if (!b0) continue;
      const lit = o.candles ?? (0.35 + 0.65 * nk);
      items.push({ z: b0.d, svg: () => { const b = bb(cam, P0); if (!b) return ''; const gl = C.radial(b.x, b.y - 188 * b.k, 220 * b.k, '#ffb860', 0.45 * lit, 'screen'); return `<g transform="${b.tr}" filter="url(#b05)">${standArt(t, z + sd, lit)}</g>` + standFlames(b.tr, t, z + sd, clamp(lit * 1.4)) + gl; } });
      if (nk > 0.05) { const fp = bb(cam, [sd * 420, 0, z]); if (fp) light += `<ellipse cx="${f(fp.x)}" cy="${f(fp.y)}" rx="${f(320 * fp.k)}" ry="${f(320 * fp.k * clamp(cam.y / Math.max(100, fp.vd) * 1.1, 0.08, 1))}" fill="#ffa850" opacity="${f(0.16 * nk)}" style="mix-blend-mode:screen" filter="url(#b8)"/>`; }
    }
    // banners hanging from the tie beams
    for (const sd of [-1, 1]) for (const z of [1200, 2000]) {
      const top = [sd * 320, PLATE - 40, z], d = D([sd * 320, 1150, z]);
      items.push({ z: d, svg: () => plane(cam, top, [1, 0, 0], [0, -1, 0], bannerArt(120, 560, 6 * Math.sin(t * 0.6 + z * 0.01 + sd), z === 1200 ? '#22348a' : '#8a1e22', 'bn' + sd + z), 0, 280, 100) });
    }
    // wheel chandeliers (night): iron hoops of candles on chains from the tie beams
    if (nk > 0.05) for (const z of [1200, 2000]) {
      const P0 = [0, 860, z], b0 = bb(cam, P0); if (!b0) continue;
      items.push({ z: b0.d, svg: () => { const b = bb(cam, P0); if (!b) return ''; const ch = T.lineD(cam, [[0, PLATE - 36, z], [0, 870, z]]); return (ch ? `<path d="${ch}" stroke="#1a1410" stroke-width="${f(Math.max(0.6, 2.4 * b.k))}" stroke-dasharray="${f(6 * b.k)} ${f(3 * b.k)}"/>` : '') + PR.chandelier(b.x, b.y, b.k * 1.05, t + z, 10) + C.radial(b.x, b.y - 10 * b.k, 420 * b.k, '#ffb860', 0.32 * nk, 'screen'); } });
    }
    // the throne
    if (o.throne !== false) {
      const b0 = bb(cam, THRONE);
      if (b0) items.push({ z: b0.d + 30, svg: () => { const b = bb(cam, THRONE); return b ? `<g transform="${b.tr}">${throneArt(night)}</g>` : ''; } });
    }
    // the feast: the high table across the dais (cloth to the platform), long side tables down the nave
    if (o.feast) {
      const hz0 = 2900, hz1 = 2980, y0 = DAIS.top, yT = DAIS.top + 76, hd = D([0, yT, hz0]);
      items.push({ z: hd, svg: () => feastTable(cam, t, P, E, [-390, 390], hz0, hz1, y0, yT, 'x', o) });
      for (const sd of [-1, 1]) { const x0 = sd * 300, x1 = sd * 390, td = D([sd * 345, 76, 1500]); items.push({ z: td, svg: () => feastTable(cam, t, P, E, [Math.min(x0, x1), Math.max(x0, x1)], 900, 2300, 0, 76, 'z', o) }); }
    }
    return { back, shell, light, items, P, E, over };
  };

  // a round pier: shaded shaft (projected silhouette), a moulded base and a carved capital, a torch bracket on the inner face
  const pier = (cam, x, z, d, P, E, sd) => {
    const tone = (c, k = 's') => T.tone(E, c, d, k);
    const top = cam.toC([x, SPRING, z]), bot = cam.toC([x, 0, z]);
    if (top[2] < cam.near + 5 && bot[2] < cam.near + 5) return '';
    const seg = (y0, y1, r, col, op = 1) => {
      const a = cam.toC([x, y0, z]), b = cam.toC([x, y1, z]); if (a[2] < cam.near + 5 || b[2] < cam.near + 5) return '';
      const pa = cam.scr(a), pb = cam.scr(b), ra = r * cam.fl / a[2], rb = r * cam.fl / b[2];
      const id = 'pg' + Math.round(x) + '_' + z + '_' + y0;
      return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${shade(col, -0.42)}"/><stop offset="0.35" stop-color="${shade(col, -0.12)}"/><stop offset="0.72" stop-color="${shade(col, 0.16)}"/><stop offset="1" stop-color="${shade(col, -0.25)}"/></linearGradient></defs><path d="M${f(pa[0] - ra)},${f(pa[1])} L${f(pa[0] + ra)},${f(pa[1])} L${f(pb[0] + rb)},${f(pb[1])} L${f(pb[0] - rb)},${f(pb[1])}Z" fill="url(#${id})" opacity="${op}" ${OL(lw(cam, d, 0.9), 0.45)}/>`;
    };
    const pc = tone(P.pier);
    let s = seg(0, 34, PR_R + 16, tone(P.stoneD)) + seg(34, 52, PR_R + 8, tone(P.stoneL)) + seg(52, SPRING - 60, PR_R, pc) + seg(SPRING - 60, SPRING - 40, PR_R + 6, tone(P.stoneL)) + seg(SPRING - 40, SPRING + 14, PR_R + 18, tone(P.stone)) + seg(SPRING + 14, SPRING + 30, PR_R + 24, tone(P.stoneL));
    // vertical flutes on the shaft
    // (on the face toward the lens, wherever the camera is)
    const vx = cam.x - x, vz = cam.z - z, vn = Math.hypot(vx, vz) || 1, ux = vx / vn, uz = vz / vn;
    for (const k of [-0.55, 0, 0.55]) { const ox = (-uz * k + ux * Math.sqrt(1 - k * k)) * PR_R * 0.98, oz = (ux * k + uz * Math.sqrt(1 - k * k)) * PR_R * 0.98; const dd = T.lineD(cam, [[x + ox, 60, z + oz], [x + ox, SPRING - 64, z + oz]]); if (dd) s += `<path d="${dd}" stroke="#000" stroke-width="${lw(cam, d, 1.4)}" opacity="0.14" fill="none"/>`; }
    // carved leaves on the capital
    const cap = cam.toC([x + ux * PR_R, SPRING - 12, z + uz * PR_R]); if (cap[2] > cam.near + 5) { const pp = cam.scr(cap), k = cam.fl / cap[2]; let lv = ''; for (let i = -2; i <= 2; i++) lv += `<path d="M${f(pp[0] + i * 14 * k)},${f(pp[1] + 14 * k)} q${f(-6 * k)},${f(-16 * k)} 0,${f(-28 * k)} q${f(6 * k)},${f(12 * k)} 0,${f(28 * k)}Z" fill="${tone(shade(P.stoneL, -0.15))}" opacity="0.8"/>`; s += lv; }
    return s;
  };
  // a table with a white cloth (axis 'x': across the hall at z0..z1; 'z': along the nave at x0..x1) and its tableware
  const feastTable = (cam, t, P, E, [xa, xb], za, zb, y0, yT, axis, o) => {
    const d = cam.dist([(xa + xb) / 2, yT, (za + zb) / 2]), tone = (c, k = 's') => T.tone(E, c, d, k);
    let s = '';
    const cloth = tone('#e8e0cc', 's'), clothD = tone('#b8ae98', 's');
    s += poly(cam, [[xa, yT, za], [xb, yT, za], [xb, yT, zb], [xa, yT, zb]], cloth, OL(lw(cam, d, 0.8), 0.4));
    if (axis === 'x') s += poly(cam, [[xa - 6, yT, za - 4], [xb + 6, yT, za - 4], [xb + 6, y0, za - 10], [xa - 6, y0, za - 10]], clothD, OL(lw(cam, d, 0.8), 0.4)) + poly(cam, [[xa - 6, yT - 4, za - 4.5], [xb + 6, yT - 4, za - 4.5], [xb + 6, yT - 18, za - 5], [xa - 6, yT - 18, za - 5]], tone('#22348a'));
    else { const xin = Math.abs(xa) < Math.abs(xb) ? xa : xb; s += poly(cam, [[xin, yT, za], [xin, yT, zb], [xin, y0 + 10, zb], [xin, y0 + 10, za]], clothD, OL(lw(cam, d, 0.8), 0.4)); }
    // tableware: gold plates, goblets, bread, a candelabrum every few metres (billboards on the cloth)
    const r = rng(Math.round(xa + za));
    const spots = []; if (axis === 'x') for (let x = xa + 50; x < xb - 30; x += 75) spots.push([x, (za + zb) / 2]); else for (let z = za + 60; z < zb - 40; z += 110) spots.push([(xa + xb) / 2, z]);
    const sorted = spots.map(([x, z]) => ({ x, z, d: cam.dist([x, yT, z]) })).sort((a, b) => b.d - a.d);
    for (const p of sorted) {
      const b = bb(cam, [p.x, yT, p.z]); if (!b || b.k < 0.02) continue;
      const kk = b.k, i = Math.round(p.x + p.z) % 4;
      s += `<ellipse cx="${f(b.x)}" cy="${f(b.y)}" rx="${f(16 * kk)}" ry="${f(Math.max(1, 16 * kk * clamp((cam.y - yT) / Math.max(100, b.vd), 0.05, 1)))}" fill="${tone('#d0a440', 'n')}" ${OL(Math.max(0.3, kk * 0.8), 0.5)}/>`;
      if (i === 1) s += PR.goblet(b.x, b.y, kk * 0.13, { wine: 0.7 });
      if (i === 3 && axis === 'x' && Math.abs(p.x) < 110) s += PR.goblet(b.x, b.y, kk * 0.13, { wine: 0.7 }); else if (i === 3) s += PR.candelabra(b.x, b.y, kk * 0.32, t, Math.round(p.z)) + C.radial(b.x, b.y - 40 * kk, 160 * kk, '#ffb860', 0.35 * (0.3 + 0.7 * (o.night || 0)), 'screen');
      if (i === 0) s += `<path d="M${f(b.x - 12 * kk)},${f(b.y)} C${f(b.x - 12 * kk)},${f(b.y - 10 * kk)} ${f(b.x + 12 * kk)},${f(b.y - 10 * kk)} ${f(b.x + 12 * kk)},${f(b.y)}Z" fill="${tone('#b8803a', 'n')}"/>`;
    }
    return s;
  };

  // the whole hall for a shot: shell + light + the sorted items and actors (each actor { z, svg() }); o.dof blurs the
  // shell and the far items continuously with distance beyond o.focus (cm)
  HL.render = (cam, t, o = {}, actors = []) => {
    const H = HL.draw(cam, t, o);
    const all = H.items.concat(actors).sort((a, b) => b.z - a.z);
    const dof = o.dof || 0, foc = o.focus || 600;
    let defs = '', body = '', n = 0;
    const blurFor = z => dof > 0 ? clamp((z - foc) / 1600) * dof : 0;
    for (const it of all) {
      const s = it.svg(); if (!s) continue;
      const bl = it.actor ? 0 : Math.round(blurFor(it.z) * 10) / 10;
      if (bl >= 0.3) { const id = 'hd' + (n++); defs += `<filter id="${id}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${bl}"/></filter>`; body += `<g filter="url(#${id})">${s}</g>`; } else body += s;
    }
    const sb = Math.round(dof * 10) / 10;
    const shellG = sb >= 0.3 ? `<filter id="hdS"><feGaussianBlur stdDeviation="${sb}"/></filter>` : '';
    return `<defs>${shellG}${defs}</defs><g ${sb >= 0.3 ? 'filter="url(#hdS)"' : ''}>${H.back}${H.shell}${H.light}</g>${body}`;
  };
})(window);
