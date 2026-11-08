// Sets for "The King's Decoy": the mountain pass (cliff road, the ravine with its waterfall, the three-arch stone
// bridge with powder barrels and the fuse, the ridge), and helpers shared by the other worlds.
// Something always moves: clouds, the waterfall, mist, birds, dust, grass, smoke.
(function (G) {
  const S = G.SETS, { f, shade, mix, rng, uid, ol } = G.RIG, C = G.CINE, E = G.ENV, PR = G.PROPS;
  const lg = S.lg;
  const lerp = (a, b, t) => a + (b - a) * t, cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const ss = (a, b, x) => { const t = cl((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  const OUTC = '#1a120c';
  const olr = (w = 2, op = 0.7) => `stroke="${OUTC}" stroke-width="${w}" stroke-opacity="${op}" stroke-linejoin="round"`;

  // ---------------- helpers
  // a snow-capped peak lit from the left: lit face, shadow face, snow cap with a ragged lower edge, couloirs
  const peak = (x, base, h, w, seed, o = {}) => {
    const r = rng(seed), ax = x + (r() - 0.5) * w * 0.2, ay = base - h, lit = o.lit || '#8a96a8', dk = o.dark || '#4a5468', snowL = o.snowL || '#f2ece4', snowD = o.snowD || '#9aa6b8';
    const L = [], Rr = [];
    const nL = 7; for (let i = 1; i < nL; i++) { const u = i / nL; L.push([lerp(ax, x - w, u) + (r() - 0.5) * w * 0.08, lerp(ay, base, u) + (r() - 0.3) * h * 0.05]); }
    for (let i = 1; i < nL; i++) { const u = i / nL; Rr.push([lerp(ax, x + w * 1.1, u) + (r() - 0.5) * w * 0.08, lerp(ay, base, u) + (r() - 0.3) * h * 0.05]); }
    const ridge = [[ax, ay]]; for (let i = 1; i <= 6; i++) { const u = i / 6; ridge.push([ax + w * 0.18 * u + (r() - 0.5) * w * 0.06, lerp(ay, base, u)]); }
    const P = a => a.map(p => `${f(p[0])},${f(p[1])}`).join(' L');
    let g = `<path d="M${f(ax)},${f(ay)} L${P(L)} L${f(x - w)},${base} L${f(ridge[6][0])},${base} L${P(ridge.slice().reverse())}Z" fill="${lit}"/>`;
    g += `<path d="M${f(ax)},${f(ay)} L${P(Rr)} L${f(x + w * 1.1)},${base} L${f(ridge[6][0])},${base} L${P(ridge.slice().reverse())}Z" fill="${dk}"/>`;
    // snow: the top part of both faces, its lower edge ragged; streaks of snow in the gullies below it
    const sh = h * (o.snow ?? 0.34), sy = ay + sh;
    const edge = []; for (let i = 0; i <= 10; i++) { const u = i / 10; edge.push([lerp(ax - (sh / h) * w * 1.0, ax + (sh / h) * w * 1.1, u), sy + (r() - 0.5) * sh * 0.5 + (i % 2) * sh * 0.25]); }
    g += `<path d="M${f(ax)},${f(ay)} L${f(edge[0][0])},${f(edge[0][1])} L${P(edge.slice(1, 6))} L${f(ridge[2][0])},${f(sy)} L${P(ridge.slice(0, 2).reverse())}Z" fill="${snowL}"/>`;
    g += `<path d="M${f(ax)},${f(ay)} L${P(ridge.slice(1, 2))} L${f(ridge[2][0])},${f(sy)} L${P(edge.slice(5))}Z" fill="${snowD}"/>`;
    for (let i = 0; i < 6; i++) { const u = 0.15 + r() * 0.7, sx = lerp(edge[0][0], edge[10][0], u), y0 = sy + sh * 0.1, len = h * (0.15 + r() * 0.3); g += `<path d="M${f(sx)},${f(y0)} l${f((r() - 0.5) * 30)},${f(len)}" stroke="${sx < ridge[2][0] ? snowL : snowD}" stroke-width="${f(4 + r() * 8)}" stroke-linecap="round" opacity="0.8"/>`; }
    return g;
  };
  // a conifer: layered drooping branch tiers, lit on the sun side (sun = -1 from the left)
  const pine = (x, y, h, seed, o = {}) => {
    const r = rng(seed), col = o.col || '#2a3a2a', lit = o.lit || '#4a6040', w = h * (o.w || 0.32), tiers = o.tiers || 9;
    let g = `<path d="M${f(x - h * 0.02)},${y} L${f(x)},${f(y - h)} L${f(x + h * 0.02)},${y}Z" fill="#2a1e14"/>`;
    for (let i = 0; i < tiers; i++) {
      const u = i / tiers, ty = y - h * 0.12 - (h * 0.86) * u, tw = w * (1 - u * 0.92) * (0.85 + r() * 0.3), th = h * 0.16 * (1 - u * 0.4);
      const d = `M${f(x)},${f(ty - th)} C${f(x - tw * 0.3)},${f(ty - th * 0.4)} ${f(x - tw * 0.8)},${f(ty)} ${f(x - tw)},${f(ty + th * 0.18)} L${f(x - tw * 0.6)},${f(ty + th * 0.05)} L${f(x - tw * 0.4)},${f(ty + th * 0.22)} L${f(x)},${f(ty + th * 0.05)} L${f(x + tw * 0.4)},${f(ty + th * 0.22)} L${f(x + tw * 0.6)},${f(ty + th * 0.05)} L${f(x + tw)},${f(ty + th * 0.18)} C${f(x + tw * 0.8)},${f(ty)} ${f(x + tw * 0.3)},${f(ty - th * 0.4)} ${f(x)},${f(ty - th)}Z`;
      g += `<path d="${d}" fill="${col}"/>`;
      g += `<path d="M${f(x)},${f(ty - th)} C${f(x - tw * 0.3)},${f(ty - th * 0.4)} ${f(x - tw * 0.8)},${f(ty)} ${f(x - tw)},${f(ty + th * 0.18)} L${f(x - tw * 0.5)},${f(ty + th * 0.02)}Z" fill="${lit}" opacity="0.8"/>`;
    }
    return g;
  };
  S.pine = pine; S.peak = peak;
  // a rock mass with strata, cracks, ledge highlights and moss; d = outline path; box for the procedural detail
  const rockDetail = (x0, y0, x1, y1, seed, o = {}) => {
    const r = rng(seed); let g = '';
    const dk = o.dark || '#3a3026', lt = o.light || '#d8c8a8';
    // strata: long, gently tilted bands
    for (let y = y0 + 40; y < y1; y += 70 + r() * 90) { let d = `M${x0},${f(y)}`; for (let x = x0; x <= x1; x += 160) d += ` L${x + 160},${f(y + (r() - 0.5) * 30 + (x - x0) * (o.tilt ?? 0.04))}`; g += `<path d="${d}" stroke="${dk}" stroke-width="${f(3 + r() * 4)}" fill="none" opacity="0.32"/><path d="${d}" stroke="${lt}" stroke-width="2.5" fill="none" opacity="0.18" transform="translate(0,-6)"/>`; }
    // cracks and joints
    const n = Math.floor((x1 - x0) * (y1 - y0) / 90000 * (o.cracks ?? 1));
    for (let i = 0; i < n; i++) { let x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), d = `M${f(x)},${f(y)}`; const L = 3 + Math.floor(r() * 5); for (let k = 0; k < L; k++) { x += (r() - 0.5) * 50; y += 30 + r() * 50; d += ` L${f(x)},${f(y)}`; } g += `<path d="${d}" stroke="${dk}" stroke-width="${f(2 + r() * 3)}" fill="none" opacity="0.5"/>`; }
    // blocky facets: a lit top edge and a shadowed underside
    for (let i = 0; i < n * 0.6; i++) { const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), w = 60 + r() * 160; g += `<path d="M${f(x)},${f(y)} l${f(w)},${f((r() - 0.5) * 20)}" stroke="${lt}" stroke-width="4" opacity="0.28"/><path d="M${f(x + 6)},${f(y + 10)} l${f(w * 0.9)},${f((r() - 0.5) * 16)}" stroke="#000" stroke-width="10" opacity="0.14"/>`; }
    // moss and lichen patches
    if (o.moss !== false) for (let i = 0; i < n * 0.4; i++) { const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0); g += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(20 + r() * 40)}" ry="${f(6 + r() * 10)}" fill="${['#5a6a3a', '#6a7a44', '#8a8a5a'][Math.floor(r() * 3)]}" opacity="0.45"/>`; }
    return g;
  };
  S.rockDetail = rockDetail;
  // a single rock mass: an irregular rounded block with a sunlit facet toward the upper left, a shadow facet toward
  // the lower right, an edge highlight and a crack or two (all facets are the shape scaled toward one of its corners,
  // so they stay inside it)
  const rockMass = (cx, cy, w, h, seed, o = {}) => {
    const r = rng(seed), n = 10, pts = [];
    for (let i = 0; i < n; i++) { const a = -Math.PI + (i + (r() - 0.5) * 0.5) * 2 * Math.PI / n, sy = Math.sin(a); pts.push([cx + Math.cos(a) * w / 2 * (0.82 + r() * 0.22), cy + sy * h / 2 * (sy > 0 ? 0.9 + r() * 0.1 : 0.8 + r() * 0.25)]); }
    const P = a => a.map(p => `${f(p[0])},${f(p[1])}`).join(' L');
    const sc = (anchor, k) => pts.map(p => [anchor[0] + (p[0] - anchor[0]) * k, anchor[1] + (p[1] - anchor[1]) * k]);
    const tl = pts.reduce((b, p) => (p[0] + p[1] < b[0] + b[1] ? p : b)), br = pts.reduce((b, p) => (p[0] + p[1] > b[0] + b[1] ? p : b));
    const base = o.col || '#8c7a62', lit = o.lit || shade(base, 0.2), dk = o.dark || shade(base, -0.32);
    let g = `<path d="M${P(pts)}Z" fill="${base}" ${olr(o.ow ?? 2.4, 0.75)}/>`;
    g += `<path d="M${P(sc(br, 0.62))}Z" fill="${dk}" opacity="0.7"/><path d="M${P(sc(tl, 0.66))}Z" fill="${lit}" opacity="0.75"/>`;
    // a highlight along the upper-left rim and a crack
    const up = pts.filter(p => p[1] < cy - h * 0.1 && p[0] < cx + w * 0.25);
    if (up.length > 1) g += `<path d="M${P(up.map(p => [p[0] + 6, p[1] + 6]))}" stroke="${shade(lit, 0.2)}" stroke-width="${f(Math.max(3, w * 0.012))}" fill="none" opacity="0.6" stroke-linecap="round"/>`;
    if (r() < 0.7) { const x0 = cx + (r() - 0.5) * w * 0.4; g += `<path d="M${f(x0)},${f(cy - h * 0.3)} l${f((r() - 0.5) * w * 0.12)},${f(h * 0.25)} l${f((r() - 0.5) * w * 0.12)},${f(h * 0.25)}" stroke="${shade(dk, -0.3)}" stroke-width="${f(Math.max(2, w * 0.008))}" fill="none" opacity="0.7"/>`; }
    return g;
  };
  S.rockMass = rockMass;
  const shrub = (x, y, s, seed, col = '#4a5a34') => { const r = rng(seed); let g = ''; for (let i = 0; i < 7; i++) { const a = r() * Math.PI, d = r() * 24 * s; g += `<circle cx="${f(x + Math.cos(a) * d * 1.4)}" cy="${f(y - Math.sin(a) * d)}" r="${f((10 + r() * 12) * s)}" fill="${shade(col, (r() - 0.5) * 0.3)}"/>`; } return `<g filter="url(#leaf)">${g}</g>`; };
  S.shrub = shrub;

  // ======================================================= THE MOUNTAIN PASS
  // world (p 1): the road along a cliff ledge (wheels touch 1560; road 1480..1650), the cliff wall above it, the drop
  // below; the ravine from x 3400 to 6400 spanned by the bridge (three arches, piers at 4400 and 5400), powder barrels
  // on the pier ledges under the arches, the fuse up the right wall of the ravine to the ridge (6900,-260).
  // o: boom (0 intact, >0 the middle span blown away), fuse (0..1 spark progress ridge -> barrels), t
  const PS = { ROAD: 1560, RTOP: 1480, REDGE: 1650, BR0: 3400, BR1: 6400, PIERS: [4400, 5400], CROWN: 1740, SPRING: 2450, BOOM: [4900, 2250], RIDGE: [6900, -260], FLOOR: 3350 };
  S.PASS = PS;
  // the fuse path (world): from the brother's feet down the crag, along the arch soffits to the barrels on both piers
  const FUSE = [[6880, -250], [6820, -120], [6760, 60], [6700, 260], [6640, 480], [6600, 700], [6560, 950], [6520, 1200], [6470, 1460], [6430, 1800], [6390, 2150], [6340, 2440], [6100, 2300], [5850, 2260], [5620, 2350], [5520, 2440], [5420, 2470], [5300, 2440], [5150, 2300], [4900, 2240], [4650, 2300], [4520, 2440]];
  PS.FUSE = FUSE;
  const fuseLen = (() => { let L = 0; const acc = [0]; for (let i = 1; i < FUSE.length; i++) { L += Math.hypot(FUSE[i][0] - FUSE[i - 1][0], FUSE[i][1] - FUSE[i - 1][1]); acc.push(L); } return { L, acc }; })();
  PS.fuseAt = u => { const d = cl(u) * fuseLen.L; for (let i = 1; i < FUSE.length; i++) if (d <= fuseLen.acc[i]) { const k = (d - fuseLen.acc[i - 1]) / (fuseLen.acc[i] - fuseLen.acc[i - 1]); return [lerp(FUSE[i - 1][0], FUSE[i][0], k), lerp(FUSE[i - 1][1], FUSE[i][1], k)]; } return FUSE[FUSE.length - 1]; };

  // cached static layer strings (the pass is large; time-dependent parts are added per frame)
  const cache = {};
  const once = (k, fn) => cache[k] || (cache[k] = fn());

  S.pass = (t, o = {}) => {
    const L = [], boom = o.boom || 0;
    // ---- sky: a clear late-afternoon sky, the sun low on the left, clouds drifting
    let sky = once('sky', () => `${lg('pssky', [[0, '#5a7aa4'], [0.45, '#9ab4cc'], [0.8, '#e2d8c4'], [1, '#f0d6aa']])}<rect x="-4000" y="-4000" width="9000" height="7400" fill="url(#pssky)"/>`);
    sky += C.radial(-500, 820, 900, '#fff0c8', 0.55, 'screen') + `<circle cx="-500" cy="820" r="70" fill="#fff6dc" opacity="0.95"/>`;
    for (const [cx, cy, w2, sd] of [[-1400, 300, 900, 4], [300, 120, 1100, 7], [1700, 380, 800, 9], [2800, 160, 1000, 12], [-2600, 520, 800, 15]]) sky += E.cloud(cx + t * 16, cy, w2, w2 * 0.26, sd, { op: 0.85, sun: [-1, -0.3], lit: '#fff1dc', body: '#d8d2d4', dark: '#9a96a6' });
    sky += E.birds(400 + t * 30, 700, 5, 3, 1.2, '#2a2a34');
    L.push({ p: 0.06, svg: sky });
    // ---- far snowy range
    L.push({ p: 0.14, svg: once('far', () => {
      let g = `<g opacity="0.92">`;
      const pk = [[-2600, 900, 700], [-1900, 1050, 850], [-1100, 820, 640], [-400, 1100, 900], [400, 900, 700], [1100, 1150, 950], [1900, 860, 700], [2600, 1000, 820], [3400, 880, 700], [4200, 1080, 900]];
      pk.forEach(([x, h, w2], i) => g += peak(x, 1500, h, w2, 30 + i, { lit: '#8e9ab0', dark: '#58627a', snowL: '#f4eee6', snowD: '#a4b0c2' }));
      g += `<rect x="-4000" y="1500" width="9000" height="3000" fill="#58627a"/></g>` + `${lg('psh1', [[0, '#c8d0dc', 0], [1, '#c8d0dc', 0.55]])}<rect x="-4000" y="1100" width="9000" height="500" fill="url(#psh1)"/>`;
      return g; }) });
    // ---- mid ridges: forested, darker, with a thin waterfall far away
    L.push({ p: 0.28, svg: once('mid', () => {
      let g = '';
      const pk = [[-2400, 600, 900], [-1300, 760, 1000], [-200, 640, 900], [900, 820, 1000], [2000, 700, 900], [3100, 780, 1000], [4300, 640, 900], [5400, 760, 1000]];
      pk.forEach(([x, h, w2], i) => g += peak(x, 1700, h, w2, 50 + i, { lit: '#5a6e6a', dark: '#34444a', snowL: '#dcdcd8', snowD: '#8a96a0', snow: 0.12 }));
      g += `<rect x="-4000" y="1700" width="12000" height="3000" fill="#2e3c3e"/>`;
      // forest: rows of small pines up the lower slopes
      const r = rng(61);
      for (let i = 0; i < 520; i++) { const x = -3200 + r() * 9600, y = 1300 + r() * 500, h = 40 + r() * 50; g += `<path d="M${f(x)},${f(y - h)} L${f(x - h * 0.28)},${f(y)} L${f(x + h * 0.28)},${f(y)}Z" fill="${['#24342e', '#2c3e34', '#1e2c28'][i % 3]}"/>`; }
      g += `${lg('psh2', [[0, '#b8c4cc', 0], [1, '#b8c4cc', 0.5]])}<rect x="-4000" y="1500" width="12000" height="400" fill="url(#psh2)"/>`;
      return g; }) });
    // ---- the ravine's back wall (seen through the gap the ravine cuts in the cliff): shadowed rock and a waterfall
    // a V-shaped gorge receding into the mountain: its sunlit right wall, its shadowed left wall, the far end in blue
    // shade with a waterfall dropping down it in tiers (layer coords: centred on x 3900)
    let rv = once('rv', () => {
      const r = rng(71);
      let g = `${lg('psgz', [[0, '#56607a'], [1, '#262a34']])}<rect x="800" y="300" width="6400" height="4900" fill="url(#psgz)"/>`;
      // the far end: small blue masses
      for (let y = 650; y < 3700; y += 150) for (let x = 3150; x < 4700; x += 170) g += rockMass(x + (r() - 0.5) * 60, y + (r() - 0.5) * 40, 190 + r() * 80, 150 + r() * 60, 7000 + x + y, { col: mix('#5a6478', '#2a2e3a', (y - 650) / 3200), ow: 1.4 });
      // the walls: the left in shade (cool), the right in sun (warm); they close in toward the bottom
      const edgeL = y => lerp(3250, 3720, cl((y - 500) / 3100)), edgeR = y => lerp(4560, 4080, cl((y - 500) / 3100));
      for (let y = 420; y < 3800; y += 210) {
        for (let x = 800; x < edgeL(y); x += 240) g += rockMass(x + (r() - 0.5) * 70, y + (r() - 0.5) * 50, 290 + r() * 120, 230 + r() * 80, 7300 + x + y, { col: mix('#5e6474', '#2c303a', (y - 420) / 3400), ow: 1.6 });
        for (let x = 7200; x > edgeR(y); x -= 240) g += rockMass(x + (r() - 0.5) * 70, y + (r() - 0.5) * 50, 290 + r() * 120, 230 + r() * 80, 7600 + x + y, { col: mix('#a08a6c', '#3e3a38', (y - 420) / 3400), lit: '#d8c09a', ow: 1.6 });
      }
      // pines along both rims, ferns hanging from the walls
      for (let i = 0; i < 18; i++) { const left = i < 9, x = left ? 900 + r() * 2200 : 4700 + r() * 2400; g += pine(x, 420 + r() * 60, 200 + r() * 160, 7900 + i, { col: left ? '#1e2a26' : '#2a3a24', lit: left ? '#2e4034' : '#5a7a40' }); }
      // the bottom of the gorge: blue haze, boulders, the stream
      g += `${lg('psgf', [[0, '#9aa8b8', 0], [1, '#9aa8b8', 0.55]])}<rect x="800" y="2600" width="6400" height="1400" fill="url(#psgf)"/>`;
      return g;
    });
    // the waterfall: it leaps from the far rim and breaks on two ledges, white streaks running down each fall
    const wfx = 3900, tiers = [[640, 1500, 0], [1560, 2500, 26], [2560, 3700, -18]];
    for (const [y0, y1, dx] of tiers) {
      rv += `<path d="M${wfx - 46 + dx},${y0} C${wfx - 56 + dx},${(y0 + y1) / 2} ${wfx - 66 + dx},${y1 - 200} ${wfx - 90 + dx},${y1} L${wfx + 100 + dx},${y1} C${wfx + 76 + dx},${y1 - 200} ${wfx + 66 + dx},${(y0 + y1) / 2} ${wfx + 46 + dx},${y0}Z" fill="#d4dee4" opacity="0.8"/>`;
      const rw = rng(73 + y0); for (let i = 0; i < 16; i++) { const x = wfx - 40 + dx + rw() * 90, ph = ((t * (0.55 + rw() * 0.25) + rw()) % 1), y = y0 + ph * (y1 - y0 - 120); rv += `<path d="M${f(x)},${f(y)} l${f((rw() - 0.5) * 6)},${f(80 + rw() * 100)}" stroke="#fff" stroke-width="${f(3 + rw() * 5)}" opacity="${f(0.75 * Math.sin(ph * Math.PI))}" stroke-linecap="round"/>`; }
      rv += `<ellipse cx="${wfx + 5 + dx}" cy="${y1}" rx="220" ry="70" fill="#eef2f4" opacity="${f(0.45 + 0.1 * Math.sin(t * 5 + y0))}" filter="url(#b8)"/>`;
    }
    L.push({ p: 0.78, svg: rv });
    // ---- the cliff wall above the road and the drop below it (p 1), the ravine gap, the road, the bridge
    L.push({ p: 1, svg: once('cliff', cliffSvg) });
    // the road surface: packed earth, ruts, stones (static) + grass stirring at the foot of the wall
    let rd = once('road', roadSvg);
    const rg = rng(81); for (let i = 0; i < 260; i++) { const x = -6000 + rg() * 18000; if (x > PS.BR0 - 40 && x < PS.BR1 + 40) { rg(); rg(); continue; } const h = 26 + rg() * 40, a = (rg() - 0.5) * 0.5 + Math.sin(t * 1.8 + x * 0.01) * 0.12; rd += `<path d="M${f(x)},${PS.RTOP + 4} q${f(Math.sin(a) * h * 0.5)},${f(-h * 0.6)} ${f(Math.sin(a) * h)},${f(-h)}" stroke="#5a6a34" stroke-width="${f(3 + rg() * 3)}" fill="none" stroke-linecap="round"/>`; }
    L.push({ p: 1, svg: rd });
    L.push({ p: 1, svg: bridgeSvg(t, boom, o) });
    // the fuse: a black cord; once lit, a spitting spark runs along it and the burnt part goes grey
    L.push({ p: 1, svg: fuseSvg(t, o.fuse || 0, boom) });
    // ---- mist drifting in the ravine and along the canyon below the road, dust motes in the low sun
    let ms = '';
    for (let i = 0; i < 6; i++) { const x = -2000 + i * 1900 + Math.sin(t * 0.2 + i) * 200 + t * 30; ms += `<ellipse cx="${f(x % 12000)}" cy="${f(3100 + (i % 3) * 180)}" rx="1300" ry="200" fill="#dfe4e8" opacity="0.32" filter="url(#b14)"/>`; }
    ms += `<ellipse cx="${f(4900 + Math.sin(t * 0.3) * 200)}" cy="3300" rx="1800" ry="260" fill="#e4e8ec" opacity="0.4" filter="url(#b14)"/>`;
    L.push({ p: 1.02, light: true, svg: ms });
    return L;
  };
  // ---- the cliff wall (above the road) and the cliff face below (the drop), with the ravine cut between
  const cliffSvg = () => {
    const { RTOP, REDGE, BR0, BR1, RIDGE } = PS;
    const r = rng(91);
    // the bank above the road: stacked, sunlit boulder masses to a ragged skyline ~500 above the road (the mountains
    // show over it); to the right of the ravine a tall crag climbs to the ridge where the brother waits
    const P = a => a.map(p => `${f(p[0])},${f(p[1])}`).join(' L');
    const topAt = x => {
      if (x < BR0 - 300) return 980 + 90 * Math.sin(x * 0.0021) + 60 * Math.sin(x * 0.0057 + 1);
      if (x < BR0) return lerp(1000, RTOP, ss(BR0 - 300, BR0, x));
      if (x < BR1) return RTOP;
      if (x < RIDGE[0]) return lerp(RTOP, RIDGE[1] + 40, Math.pow(ss(BR1, RIDGE[0], x), 0.45));
      if (x < RIDGE[0] + 900) return lerp(RIDGE[1] + 40, 200, ss(RIDGE[0] + 250, RIDGE[0] + 900, x));
      return lerp(200, 900, ss(RIDGE[0] + 900, RIDGE[0] + 2200, x)) + 80 * Math.sin(x * 0.002);
    };
    const cols = ['#8c7a62', '#7e6c56', '#98866c', '#86745c'];
    let g = '';
    // a dark backing so no gaps show between the masses
    const backing = (x0, x1) => { let d = `M${x0},${RTOP + 20}`; for (let x = x0; x <= x1; x += 100) d += ` L${x},${f(topAt(x) + 50)}`; return `<path d="${d} L${x1},${RTOP + 20}Z" fill="#4a3e32"/>`; };
    g += backing(-6000, BR0 - 20) + backing(BR1 + 20, 12000);
    // big slabs first, smaller blocks over them, so sizes vary like a real broken cliff
    let ms = '';
    for (const pass of [0, 1]) for (let x = -6000 + pass * 140; x < 12000; x += pass ? 210 : 420) {
      if (x > BR0 - 60 && x < BR1 + 40) continue;
      const top = topAt(x);
      for (let y = RTOP - (pass ? 90 : 160); y > top + 40; y -= pass ? 170 : 320) { if (pass && r() < 0.35) continue; const k = pass ? 0.7 : 1.35, w = (260 + Math.pow(r(), 2) * 420) * k, h = (190 + r() * 180) * k; ms += rockMass(x + (r() - 0.5) * 110, y + (r() - 0.5) * 70, w, h, 1000 + x * 3 + y + pass * 77, { col: cols[Math.floor(r() * 4)] }); }
      if (pass) ms += rockMass(x + (r() - 0.5) * 80, top + 80, 300 + r() * 220, 180 + r() * 90, 2000 + x, { col: cols[Math.floor(r() * 4)], lit: '#d4c09c' });
    }
    g += `<g filter="url(#texC)">${ms}</g>`;
    // the ravine's inner edges: shadowed rock where the gap cuts back into the mountain
    g += `<path d="M${BR0 - 300},1010 C${BR0 - 200},1160 ${BR0 - 80},1320 ${BR0},${RTOP} L${BR0 + 60},${RTOP} C${BR0 - 10},1300 ${BR0 - 120},1140 ${BR0 - 230},990Z" fill="#2a2620" opacity="0.85"/>`;
    g += `<path d="M${BR1 - 50},${RTOP} C${BR1 + 20},900 ${BR1 + 160},300 ${RIDGE[0] - 180},${RIDGE[1] + 60} L${RIDGE[0] - 120},${RIDGE[1] + 90} C${BR1 + 230},320 ${BR1 + 90},900 ${BR1 + 30},${RTOP}Z" fill="#3a342c" opacity="0.85"/>`;
    // pines and shrubs along the skyline and on ledges; a few hanging roots
    for (let i = 0; i < 70; i++) { const x = -6000 + r() * 18000; if (x > BR0 - 320 && x < BR1 + 150) continue; const h = 180 + r() * 280; g += pine(x, topAt(x) + 30, h, 100 + i, { col: '#24321f', lit: '#4a6a3a' }); }
    for (let i = 0; i < 60; i++) { const x = -6000 + r() * 18000; if (x > BR0 - 300 && x < BR1 + 400) continue; const top = topAt(x), y = top + 80 + r() * (RTOP - top - 160); if (y > RTOP - 60) continue; g += shrub(x, y, 1 + r() * 1.5, 200 + i); if (r() < 0.3) g += `<path d="M${f(x)},${f(y)} q${f(10 + r() * 20)},${f(60 + r() * 60)} ${f(-10 + r() * 20)},${f(140 + r() * 120)}" stroke="#3a2a1a" stroke-width="3" fill="none" opacity="0.7"/>`; }
    // the ridge: a flat jut of rock at the crag's top, a dead tree leaning over the drop
    g += `<path d="M${RIDGE[0] - 240},${RIDGE[1] + 40} L${RIDGE[0] - 120},${RIDGE[1] + 14} L${RIDGE[0] + 80},${RIDGE[1] - 6} L${RIDGE[0] + 320},${RIDGE[1] + 50} L${RIDGE[0] + 260},${RIDGE[1] + 170} L${RIDGE[0] - 180},${RIDGE[1] + 180}Z" fill="#8a7860" ${olr(3)}/><path d="M${RIDGE[0] - 220},${RIDGE[1] + 36} L${RIDGE[0] + 300},${RIDGE[1] + 46}" stroke="#d4c09c" stroke-width="8" opacity="0.6"/>`;
    g += E.bareTree(RIDGE[0] + 250, RIDGE[1] + 50, 460, 7, '#2a2018');
    // the drop below the road: cooler, darker masses falling into the canyon, clinging pines
    let back2 = `M-6000,${REDGE} L${BR0 - 30},${REDGE} L${BR0 - 30},${PS.FLOOR + 3000} L-6000,${PS.FLOOR + 3000}Z M${BR1 + 30},${REDGE} L12000,${REDGE} L12000,${PS.FLOOR + 3000} L${BR1 + 30},${PS.FLOOR + 3000}Z`;
    g += `<path d="${back2}" fill="#2e2a28"/>`;
    let md = '';
    for (const pass of [0, 1]) for (let y = REDGE + (pass ? 120 : 220); y < PS.FLOOR + 500; y += pass ? 210 : 400) for (let x = -6000 + pass * 160; x < 12000; x += pass ? 270 : 520) {
      if (x > BR0 - 120 && x < BR1 + 120) continue;
      if (pass && r() < 0.3) continue;
      const k = cl((y - REDGE) / (PS.FLOOR - REDGE)), sz = pass ? 0.75 : 1.4;
      md += rockMass(x + (r() - 0.5) * 120, y + (r() - 0.5) * 80, (320 + Math.pow(r(), 2) * 380) * sz, (220 + r() * 160) * sz, 3000 + x * 5 + y + pass * 91, { col: mix(cols[Math.floor(r() * 4)], '#34343c', 0.25 + 0.55 * k), lit: mix('#c8b490', '#6a6a74', k) });
    }
    g += `<g filter="url(#texC)">${md}</g>`;
    for (let i = 0; i < 46; i++) { const x = -6000 + r() * 18000; if (x > BR0 - 200 && x < BR1 + 200) continue; const y = REDGE + 200 + r() * 1400; g += r() < 0.5 ? pine(x, y, 120 + r() * 160, 300 + i, { col: '#1e2a1a', lit: '#3a5030' }) : shrub(x, y, 1.2 + r(), 400 + i, '#3e4a2c'); }
    // the ravine floor far below: boulders and white water
    g += `<path d="M${BR0 - 200},${PS.FLOOR} C${BR0 + 600},${PS.FLOOR - 60} ${BR1 - 600},${PS.FLOOR + 40} ${BR1 + 160},${PS.FLOOR - 20} L${BR1 + 160},${PS.FLOOR + 3000} L${BR0 - 200},${PS.FLOOR + 3000}Z" fill="#2a2a2c"/>`;
    for (let i = 0; i < 26; i++) { const x = BR0 + r() * (BR1 - BR0), y = PS.FLOOR - 20 + r() * 200, w = 60 + r() * 120; g += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(w)}" ry="${f(w * 0.5)}" fill="${['#4a4644', '#3a3836', '#5a5652'][i % 3]}" ${olr(2)}/>`; }
    g += `<path d="M${BR0 - 200},${PS.FLOOR + 90} C${BR0 + 800},${PS.FLOOR + 60} ${BR1 - 800},${PS.FLOOR + 120} ${BR1 + 160},${PS.FLOOR + 80}" stroke="#dce6ea" stroke-width="40" fill="none" opacity="0.55"/>`;
    return g;
  };
  const roadSvg = () => {
    const { RTOP, REDGE, BR0, BR1 } = PS, r = rng(83);
    const seg = (x0, x1) => {
      let g = `<path d="M${x0},${RTOP} L${x1},${RTOP} L${x1},${REDGE} L${x0},${REDGE}Z" fill="#9c8668" filter="url(#ground)"/>`;
      g += `${lg('psrd', [[0, '#000', 0.25], [0.3, '#000', 0], [1, '#000', 0.2]])}<path d="M${x0},${RTOP} L${x1},${RTOP} L${x1},${REDGE} L${x0},${REDGE}Z" fill="url(#psrd)"/>`;
      // wheel ruts, hoof-churned dust, pebbles, the crumbling outer edge
      for (const y of [1540, 1580, 1610]) g += `<path d="M${x0},${y} C${(x0 * 2 + x1) / 3},${y - 6} ${(x0 + 2 * x1) / 3},${y + 8} ${x1},${y}" stroke="#6a5a44" stroke-width="7" fill="none" opacity="0.5"/>`;
      for (let i = 0; i < (x1 - x0) / 30; i++) { const x = x0 + r() * (x1 - x0), y = RTOP + 10 + r() * (REDGE - RTOP - 20), rr = 3 + r() * 9; g += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rr * 1.4)}" ry="${f(rr)}" fill="${['#c8b498', '#7a6a54', '#b0a088'][i % 3]}" opacity="0.85"/>`; }
      let edge = `M${x0},${REDGE}`; for (let x = x0; x < x1; x += 40) edge += ` L${x + 40},${f(REDGE + (r() - 0.3) * 16)}`;
      g += `<path d="${edge} L${x1},${REDGE + 40} L${x0},${REDGE + 40}Z" fill="#6a5a46"/>`;
      // the foot of the wall: scree and boulders along the back edge of the road
      for (let i = 0; i < (x1 - x0) / 90; i++) { const x = x0 + r() * (x1 - x0), w = 20 + r() * 50; g += `<path d="M${f(x - w)},${RTOP + 10} Q${f(x)},${f(RTOP - w * 0.9)} ${f(x + w)},${RTOP + 10}Z" fill="${['#8a7a64', '#6e604e', '#9a8a72'][i % 3]}" ${olr(1.6)}/>`; }
      return g;
    };
    return seg(-6000, BR0) + seg(BR1, 12000);
  };
  // ---- the bridge: deck, spandrels of dressed stone, three arches, piers with cutwaters; barrels on the pier ledges
  const bridgeSvg = (t, boom, o) => {
    const { RTOP, ROAD, BR0, BR1, PIERS, CROWN, SPRING } = PS;
    const id = 'psbr';
    const span = [[BR0, PIERS[0]], [PIERS[0], PIERS[1]], [PIERS[1], BR1]];
    const PW = 120;   // half pier width
    // the bridge face: a slab from the deck down to the pier feet with the three arch openings cut out
    const arch = (a, b) => { const x0 = a + (a === BR0 ? 40 : PW), x1 = b - (b === BR1 ? 40 : PW), m = (x0 + x1) / 2, hw = (x1 - x0) / 2; return `M${x0},${PS.FLOOR + 250} L${x0},${SPRING} C${x0},${f(SPRING - (SPRING - CROWN) * 1.1)} ${f(m - hw * 0.55)},${CROWN} ${m},${CROWN} C${f(m + hw * 0.55)},${CROWN} ${x1},${f(SPRING - (SPRING - CROWN) * 1.1)} ${x1},${SPRING} L${x1},${PS.FLOOR + 250}Z`; };
    const face = `M${BR0 - 60},${RTOP} L${BR1 + 60},${RTOP} L${BR1 + 60},${PS.FLOOR + 250} L${BR0 - 60},${PS.FLOOR + 250}Z ` + span.map(([a, b]) => arch(a, b)).join(' ');
    let g = `${lg(id, [[0, '#b4a690'], [0.5, '#9a8c76'], [1, '#6a5e50']])}`;
    // the broken middle span: a clip removes it once the barrels have gone off
    let clipD = `M${BR0 - 200},-500 L${BR1 + 200},-500 L${BR1 + 200},4400 L${BR0 - 200},4400Z`;
    if (boom > 0) {
      const r = rng(5); let bl = `M${PIERS[0] - 150},${RTOP - 60}`; for (let y = RTOP; y < 2600; y += 80) bl += ` L${f(PIERS[0] - 150 + (r() - 0.5) * 90 + (y - RTOP) * 0.08)},${y}`;
      let br = ''; for (let y = 2600; y > RTOP; y -= 80) br += ` L${f(PIERS[1] + 150 + (r() - 0.5) * 90 - (y - RTOP) * 0.08)},${y}`;
      clipD = `M${BR0 - 200},-500 L${BR1 + 200},-500 L${BR1 + 200},4400 L${BR0 - 200},4400Z M${bl.slice(1)} L${PIERS[0] + 40},2700 L${PIERS[1] - 40},2700 ${br} L${PIERS[1] + 150},${RTOP - 60}Z`;
    }
    g += `<defs><clipPath id="${id}c"><path d="${clipD}" clip-rule="evenodd"/></clipPath><clipPath id="${id}f"><path d="${face}" clip-rule="evenodd"/></clipPath></defs><g clip-path="url(#${id}c)">`;
    // the far parapet along the back edge of the deck, the deck road
    g += `<rect x="${BR0 - 60}" y="${RTOP - 70}" width="${BR1 - BR0 + 120}" height="74" fill="#8a7e6c" ${olr(2.4)}/>` + Array.from({ length: Math.floor((BR1 - BR0 + 120) / 120) }, (_, i) => `<path d="M${BR0 - 60 + i * 120},${RTOP - 70} l0,74" stroke="#5a5044" stroke-width="3"/>`).join('') + `<rect x="${BR0 - 70}" y="${RTOP - 86}" width="${BR1 - BR0 + 140}" height="22" rx="6" fill="#a89a86" ${olr(2)}/>`;
    g += `<rect x="${BR0 - 60}" y="${RTOP}" width="${BR1 - BR0 + 120}" height="${ROAD + 40 - RTOP}" fill="#8e8270" filter="url(#ground)"/>`;
    for (let x = BR0; x < BR1; x += 70) g += `<path d="M${x},${RTOP + 4} l${f(18)},${ROAD + 34 - RTOP}" stroke="#6a5e4e" stroke-width="2" opacity="0.5"/>`;
    // the face: dressed ashlar in courses, darker toward the water, voussoirs round each arch, a string course
    g += `<path d="${face}" fill="url(#${id})" fill-rule="evenodd" ${olr(3)}/>`;
    let jt = ''; const rr = rng(7);
    for (let y = ROAD + 60, k = 0; y < 4200; y += 64, k++) { jt += `<path d="M${BR0 - 60},${y} L${BR1 + 60},${y}" stroke="#4a4036" stroke-width="2.4" opacity="0.55"/>`; for (let x = BR0 - 60 + (k % 2) * 70; x < BR1 + 60; x += 140 + rr() * 30) jt += `<path d="M${f(x)},${y} l0,64" stroke="#4a4036" stroke-width="2.2" opacity="0.5"/><path d="M${f(x + 4)},${y + 4} l${f(100 + rr() * 30)},0" stroke="#e8dcc4" stroke-width="2" opacity="0.25"/>`; }
    // moss, damp stains and ferns
    for (let i = 0; i < 70; i++) { const x = BR0 + rr() * (BR1 - BR0), y = 1700 + rr() * 2400; jt += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(30 + rr() * 60)}" ry="${f(8 + rr() * 16)}" fill="${['#5a6a3a', '#4a5a34', '#3a3a30'][i % 3]}" opacity="0.4"/>`; }
    for (let i = 0; i < 18; i++) { const x = BR0 + rr() * (BR1 - BR0), y = 1600 + rr() * 1600; jt += `<path d="M${f(x)},${f(y)} l${f(-6 - rr() * 30)},${f(60 + rr() * 140)}" stroke="#2a2420" stroke-width="${f(6 + rr() * 10)}" opacity="0.25" stroke-linecap="round"/>`; }
    g += `<g clip-path="url(#${id}f)">${jt}</g>`;
    for (const [a, b] of span) {
      const x0 = a + (a === BR0 ? 40 : PW), x1 = b - (b === BR1 ? 40 : PW), m = (x0 + x1) / 2, hw = (x1 - x0) / 2;
      // voussoirs: wedge stones following the arch ring
      for (let i = 0; i <= 16; i++) { const u = i / 16, ang = Math.PI * u, px = m - Math.cos(ang) * hw, py = SPRING - Math.sin(ang) * (SPRING - CROWN) - (u > 0 && u < 1 ? 0 : 0), nx = -Math.cos(ang), ny = -Math.sin(ang); g += `<path d="M${f(px)},${f(py)} l${f(nx * 110)},${f(ny * 110 * 0.9)}" stroke="#4a4036" stroke-width="3" opacity="0.6"/>`; }
      g += `<path d="M${x0},${SPRING} C${x0},${f(SPRING - (SPRING - CROWN) * 1.1)} ${f(m - hw * 0.55)},${CROWN} ${m},${CROWN} C${f(m + hw * 0.55)},${CROWN} ${x1},${f(SPRING - (SPRING - CROWN) * 1.1)} ${x1},${SPRING}" stroke="#c8bca6" stroke-width="10" fill="none" opacity="0.5"/>`;
      // the soffit in shadow: the underside of the arch seen a little from below
      g += `<path d="M${x0},${SPRING} C${x0},${f(SPRING - (SPRING - CROWN) * 1.1)} ${f(m - hw * 0.55)},${CROWN} ${m},${CROWN} C${f(m + hw * 0.55)},${CROWN} ${x1},${f(SPRING - (SPRING - CROWN) * 1.1)} ${x1},${SPRING} L${x1 - 30},${SPRING} C${x1 - 30},${f(SPRING - (SPRING - CROWN) * 0.95)} ${f(m + hw * 0.5)},${CROWN + 50} ${m},${CROWN + 50} C${f(m - hw * 0.5)},${CROWN + 50} ${x0 + 30},${f(SPRING - (SPRING - CROWN) * 0.95)} ${x0 + 30},${SPRING}Z" fill="#2a241e" opacity="0.85"/>`;
    }
    // the string course under the deck and the cutwaters on the piers
    g += `<rect x="${BR0 - 70}" y="${ROAD + 40}" width="${BR1 - BR0 + 140}" height="30" fill="#b8ac96" ${olr(2.4)}/>`;
    for (const px of PIERS) g += `<path d="M${px - PW - 40},${SPRING + 30} L${px + PW + 40},${SPRING + 30} L${px + PW + 20},${SPRING + 70} L${px - PW - 20},${SPRING + 70}Z" fill="#a89a84" ${olr(2.4)}/>`;
    // the powder barrels stacked on both sides of each pier, under the arches
    for (const px of PIERS) for (const side of [-1, 1]) g += barrels(px + side * (PW + 90), SPRING + 30, side, px * 7 + side);
    g += `</g>`;
    return g;
  };
  // a stack of six black-powder kegs (iron hoops, tarred staves), resting on a ledge at y, x = stack centre
  const barrels = (x, y, side, seed) => {
    const r = rng(Math.abs(seed)); let g = '';
    const keg = (cx, cy, w, h) => `<g transform="translate(${f(cx)},${f(cy)})"><path d="M${-w / 2},${-h} C${-w * 0.62},${-h * 0.66} ${-w * 0.62},${-h * 0.34} ${-w / 2},0 L${w / 2},0 C${w * 0.62},${-h * 0.34} ${w * 0.62},${-h * 0.66} ${w / 2},${-h}Z" fill="#3a2a1c" ${olr(2.4, 0.9)}/>` +
      [0.12, 0.88].map(k => `<path d="M${f(-w * 0.53)},${f(-h * k)} L${f(w * 0.53)},${f(-h * k)}" stroke="#2a2a2c" stroke-width="10"/><path d="M${f(-w * 0.53)},${f(-h * k - 3)} L${f(w * 0.53)},${f(-h * k - 3)}" stroke="#7a7a80" stroke-width="2.5"/>`).join('') +
      [-0.3, -0.1, 0.1, 0.3].map(k => `<path d="M${f(w * k)},${-h + 4} C${f(w * k * 1.2)},${f(-h * 0.5)} ${f(w * k * 1.2)},${f(-h * 0.5)} ${f(w * k)},-4" stroke="#1e140c" stroke-width="2" fill="none" opacity="0.6"/>`).join('') +
      `<path d="M${f(-w * 0.36)},${-h + 10} C${f(-w * 0.46)},${f(-h * 0.6)} ${f(-w * 0.46)},${f(-h * 0.4)} ${f(-w * 0.36)},-10" stroke="#8a6a4a" stroke-width="7" fill="none" opacity="0.45"/>` +
      `<text x="0" y="${f(-h * 0.42)}" font-family="Georgia,serif" font-size="${f(h * 0.2)}" font-weight="bold" text-anchor="middle" fill="#c8bca0" opacity="0.6">XX</text></g>`;
    const w = 120, h = 150;
    for (let i = 0; i < 3; i++) g += keg(x + (i - 1) * w * 1.02, y, w, h);
    for (let i = 0; i < 2; i++) g += keg(x + (i - 0.5) * w * 1.02, y - h, w, h);
    g += keg(x, y - 2 * h, w, h);
    return g;
  };
  const fuseSvg = (t, u, boom) => {
    if (boom > 0.2) return '';
    const pts = PS.FUSE.map(p => `${p[0]},${p[1]}`).join(' L');
    let g = `<path d="M${pts}" stroke="#141010" stroke-width="9" fill="none" stroke-linejoin="round"/><path d="M${pts}" stroke="#4a3a2a" stroke-width="3" fill="none" stroke-dasharray="6 10"/>`;
    if (u > 0) {
      const sp = PS.fuseAt(u);
      // burnt part: grey ash line behind the spark
      let d = 'M' + PS.FUSE[0].join(','); const L = []; for (let k = 0; k <= 40; k++) { const q = PS.fuseAt(u * k / 40); L.push(q); } d = 'M' + L.map(q => `${f(q[0])},${f(q[1])}`).join(' L');
      g += `<path d="${d}" stroke="#8a8680" stroke-width="7" fill="none" opacity="0.9"/>`;
      // the spark: a hot core, spitting sparks, a thread of smoke
      const r = rng(Math.floor(t * 60));
      g += C.radial(sp[0], sp[1], 160, '#ffb050', 0.75, 'screen') + `<circle cx="${f(sp[0])}" cy="${f(sp[1])}" r="12" fill="#fff4c8"/>`;
      for (let i = 0; i < 12; i++) { const a = r() * Math.PI * 2, l = 20 + r() * 70; g += `<path d="M${f(sp[0])},${f(sp[1])} l${f(Math.cos(a) * l)},${f(Math.sin(a) * l - 10)}" stroke="${['#fff0a0', '#ffb040', '#ff7a20'][i % 3]}" stroke-width="${f(2 + r() * 3)}" stroke-linecap="round"/>`; }
      g += E.smoke(sp[0], sp[1] - 10, 220, 3 + (Math.floor(t * 3) % 3), '#d8d4ce', 0.45);
    }
    return g;
  };
})(window);
