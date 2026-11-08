// Open country in perspective, with street3d's camera: a height field of meadow and hill, a chalk path winding up to the
// summit, every facet shaded by the sun (and patched with lighter and darker grass so the facets never read as facets),
// hazy with distance; bushes, trees, rocks and tufts of grass stand in it as billboards and are depth-sorted with the
// people. Outside Hamelin: the town wall runs along z = 0 (the town is at z > 0), the meadow and the hill lie at z < 0.
(function (G) {
  const T = G.ST3, { f, rng, shade } = G.RIG;
  const TR = G.TR3 = {};
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), norm = v => { const n = Math.hypot(...v); return v.map(x => x / n); }, ss = T.ss;
  const hash = (i, j) => { const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return s - Math.floor(s); };
  // smooth value noise
  const vnoise = (x, z) => { const i = Math.floor(x), j = Math.floor(z), u = x - i, v = z - j, a = hash(i, j), b = hash(i + 1, j), c = hash(i, j + 1), d = hash(i + 1, j + 1), su = u * u * (3 - 2 * u), sv = v * v * (3 - 2 * v); return a + (b - a) * su + (c - a) * sv + (a - b - c + d) * su * sv; };
  TR.vnoise = vnoise;

  // ------------------------------------------------------------ the land
  // the path: from the gate (0, 0) out across the meadow, then in long bends up to the summit
  const PATH = TR.PATH = [[0, 0], [150, -1500], [900, -3600], [1800, -6000], [900, -8600], [-900, -10800], [-2400, -12800], [-2000, -15200], [-600, -17400], [-1200, -19800], [-2400, -22000], [-2600, -23600]];
  const SUMMIT = TR.SUMMIT = [-2600, -24200];
  const pathDist = (x, z) => { let best = 1e9, along = 0, acc = 0; for (let i = 0; i < PATH.length - 1; i++) { const [ax, az] = PATH[i], [bx, bz] = PATH[i + 1], dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz, L = Math.sqrt(L2); let t = ((x - ax) * dx + (z - az) * dz) / L2; t = clamp(t); const px = ax + dx * t, pz = az + dz * t, d = Math.hypot(x - px, z - pz); if (d < best) { best = d; along = acc + L * t; } acc += L; } return [best, along]; };
  TR.pathDist = pathDist;
  // a point on the path a given distance along it (and the direction there)
  TR.pathAt = s => { let acc = 0; for (let i = 0; i < PATH.length - 1; i++) { const [ax, az] = PATH[i], [bx, bz] = PATH[i + 1], L = Math.hypot(bx - ax, bz - az); if (s <= acc + L || i === PATH.length - 2) { const t = clamp((s - acc) / L); return { x: ax + (bx - ax) * t, z: az + (bz - az) * t, dir: [(bx - ax) / L, (bz - az) / L] }; } acc += L; } };
  TR.pathLen = (() => { let a = 0; for (let i = 0; i < PATH.length - 1; i++) a += Math.hypot(PATH[i + 1][0] - PATH[i][0], PATH[i + 1][1] - PATH[i][1]); return a; })();
  // the height of the ground: the meadow rising gently from the wall, the hill (a long whaleback with the summit at its
  // east end), lesser ridges either side, the path worn a little into it
  TR.h = (x, z) => {
    const [sx, sz] = SUMMIT;
    const rise = clamp(-z / 26000), hill = 7200 * Math.exp(-(((x - sx) / 7000) ** 2) - (((z - sz) / 9000) ** 2)) + 2600 * Math.exp(-(((x + 9000) / 6000) ** 2) - (((z + 16000) / 9000) ** 2)) + 3000 * Math.exp(-(((x - 9000) / 6500) ** 2) - (((z + 20000) / 8000) ** 2));
    const roll = 160 * (vnoise(x / 2600, z / 2600) - 0.5) + 60 * (vnoise(x / 700 + 9, z / 700) - 0.5);
    const pd = pathDist(x, z)[0];
    return Math.max(0, hill * (0.25 + 0.75 * rise) + roll * (0.3 + rise)) - 18 * Math.exp(-((pd / 110) ** 2));
  };
  TR.normalAt = (x, z) => { const e = 60, hx = TR.h(x + e, z) - TR.h(x - e, z), hz = TR.h(x, z + e) - TR.h(x, z - e); return norm([-hx / (2 * e), 1, -hz / (2 * e)]); };

  // the farmland on the low ground round the town: long strip fields (wheat, barley, fallow, pasture) between hedges
  const CROPS = ['#c09a48', '#9a9a3c', '#7a5e3c', '#6a8e40', '#b09c50', '#5e8238'];
  const FW = 3600, FL = 1800;
  const fieldAt = (x, z) => {
    if ((Math.abs(x) < 4200 && z > -900 && z < 3800) || TR.h(x, z) > 900) return null;   // the meadow by the wall and the town, the hill
    const i = Math.floor(x / FW), j = Math.floor(z / FL);
    if (pathDist(x, z)[0] < 1400) return null;
    const hsh = hash(i * 3 + 1, j * 7 + 2); if (hsh < 0.18) return null;
    return CROPS[Math.floor(hash(i, j) * CROPS.length)];
  };
  TR.fieldAt = fieldAt;

  // ------------------------------------------------------------ the mesh (built once per region and cell size)
  const meshes = {};
  const meshOf = (x0, x1, z0, z1, cell) => {
    const key = [x0, x1, z0, z1, cell].join(':'); if (meshes[key]) return meshes[key];
    const nx = Math.round((x1 - x0) / cell), nz = Math.round((z1 - z0) / cell), V = [];
    for (let j = 0; j <= nz; j++) { const row = []; for (let i = 0; i <= nx; i++) { const x = x0 + (x1 - x0) * i / nx, z = z0 + (z1 - z0) * j / nz; row.push([x, TR.h(x, z), z]); } V.push(row); }
    const cells = [];
    for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
      const a = V[j][i], b = V[j][i + 1], c = V[j + 1][i + 1], d = V[j + 1][i], cx = (a[0] + c[0]) / 2, cz = (a[2] + c[2]) / 2, cy = (a[1] + b[1] + c[1] + d[1]) / 4;
      const u = [c[0] - a[0], c[1] - a[1], c[2] - a[2]], v = [d[0] - b[0], d[1] - b[1], d[2] - b[2]];
      let n = norm([u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]); if (n[1] < 0) n = n.map(q => -q);
      cells.push({ pts: [a, b, c, d], c: [cx, cy, cz], n, patch: vnoise(cx / 3200, cz / 3200), fine: vnoise(cx / 1400 + 3, cz / 1400), field: fieldAt(cx, cz) });
    }
    return (meshes[key] = cells);
  };

  // land colours: lush meadow green going gold on the sunny slopes, chalky path, darker in the folds
  TR.ground = (cam, env, regions, o = {}) => {
    const sun = env.sunDir, grassA = T.rgbOf(o.grass || '#5e8a34'), grassB = T.rgbOf(o.grass2 || '#b4a446'), grassD = T.rgbOf(o.grassDark || '#2e4a22'), pathC = T.rgbOf(o.path || '#c8b48a'), shadeC = T.rgbOf(env.shade), hazeC = T.rgbOf(env.haze);
    const items = [];
    for (const R of regions) for (const cl of meshOf(R.x0, R.x1, R.z0, R.z1, R.cell)) {
      if (R.skip && R.skip(cl.c[0], cl.c[2])) continue;
      const cc = cam.toC(cl.c); if (cc[2] < cam.near - R.cell) continue;
      items.push({ d: cc[2], cl });
    }
    // the path, the river and the hedges are strips laid on the land, sorted with it
    const zr = o.zr || [-1e9, 1e9];
    // a strip goes in the depth band of its NEAREST corner, pulled nearer by the reach of the cells it lies across (the
    // centre of a cell under it can be that much nearer than any of its corners), so the grass it lies on is always drawn
    // before it and only land that really stands in front of it, a crest, can cover it; strips reaching under the lens
    // are left out
    const reach = (x, z) => { let c = 0; for (const R of regions) if (x >= R.x0 - R.cell && x <= R.x1 + R.cell && z >= R.z0 - R.cell && z <= R.z1 + R.cell) c = Math.max(c, R.cell); return c * 0.71 + 80; };
    // (a strip running under the lens is clipped at the near plane like everything else, never dropped: dropping it
    // made the end of the path blink at the bottom of the frame)
    // A strip laid on others (`on`: a rut's own path slab and the slabs either side) goes in no farther than the nearest
    // of them, so it is always drawn after all the land it touches. (Keyed by itself, a rut fell now and then into a
    // farther band than its slab and was painted over for a few frames; keyed by its own slab alone, the next slab
    // painted over its end and the ruts went dashed.)
    const tok = {}, seen = [];
    for (const s of strips()) { if (s.c[2] < zr[0] || s.c[2] > zr[1]) continue; let dm = 1e12, dx = -1e12; for (const q of s.pts) { const dq = cam.toC(q)[2]; if (dq < dm) dm = dq; if (dq > dx) dx = dq; } if (dx < cam.near + 2) continue; dm = Math.max(cam.near + 1, dm); s._t = tok; s._d = dm - reach(s.c[0], s.c[2]); s._dm = dm; seen.push(s); }
    for (const s of seen) { let d = s._d; if (s.on) for (const q of s.on) if (q && q._t === tok) d = Math.min(d, q._d); items.push({ d, dt: s._dm, st: s }); }
    items.sort((a, b) => b.d - a.d);
    // group cells by their final colour (quantised) within depth bands, far band first: a few hundred paths, not
    // thousands, and nearer land still covers farther land
    const groups = new Map();
    const band = d => Math.floor(Math.log(Math.max(50, d)) * 9);
    for (const { d, dt, cl, st } of items) {
      if (st) {
        const p = st.line ? T.lineD(cam, st.pts) : T.path(cam, st.pts); if (!p) continue;
        let col = T.rgbOf(st.col);
        const lam = clamp(sun[1] * 0.9 + 0.1);
        col = T.cmix(col, shadeC, env.shadeK * (1 - lam) * 0.6);
        const hk = clamp(1 - Math.exp(-Math.max(0, dt - (env.hazeNear || 0)) / env.hazeD)) * (env.hazeMax ?? 0.85);
        col = T.cmix(col, hazeC, hk);
        const key = band(d) + (st.line ? 'L' + Math.round(Math.min(6, Math.max(0.6, st.w * cam.fl / dt)) * 2) : 'P') + T.hexOf(col.map(v => Math.round(v / 3) * 3));
        groups.set(key, (groups.get(key) || '') + p);
        continue;
      }
      const p = T.path(cam, cl.pts); if (!p) continue;
      const lam = clamp(cl.n[0] * sun[0] + cl.n[1] * sun[1] + cl.n[2] * sun[2]), lit = 0.42 + 0.58 * lam;
      let col = T.cmix(T.cmix(grassD, grassA, clamp(lit * 1.25 - 0.1)), grassB, clamp((lam - 0.55) * 1.6) * 0.5 + (cl.patch - 0.5) * 0.3 + 0.12);
      col = T.cmix(col, grassD, clamp(0.4 - cl.fine) * 0.35);
      if (cl.field) col = T.cmix(col, T.rgbOf(cl.field), 0.72);
      col = T.cmix(col, shadeC, env.shadeK * (1 - lam) * 0.8);
      col = col.map(v => v * (0.78 + 0.32 * lit));
      const hk = clamp(1 - Math.exp(-Math.max(0, d - (env.hazeNear || 0)) / env.hazeD)) * (env.hazeMax ?? 0.85);
      col = T.cmix(col, hazeC, hk);
      const key = band(d) + 'C' + T.hexOf(col.map(v => Math.round(v / 3) * 3));
      groups.set(key, (groups.get(key) || '') + p);
    }
    let g = '';
    // things standing on the land (people, trees, tufts: o.items) go in among the bands, each after the band of the
    // ground at its foot (pulled nearer by the cells' reach, like the strips), so only land that really stands in front
    // of it - a crest - covers it; among themselves, farthest first
    const maxReach = Math.max(...regions.map(R => R.cell)) * 0.71 + 80;
    // (the extra 2.6 m covers a path slab reaching from someone's feet toward the lens: it is drawn before them too)
    const its = (o.items || []).map(it => ({ it, b: band(Math.max(50, (it.vd ?? it.z) - (it.wx !== undefined ? reach(it.wx, it.wz) : maxReach) - 260)) })).sort((a, b) => b.b - a.b || b.it.z - a.it.z);
    let ii = 0;
    const flush = bandNow => { while (ii < its.length && its[ii].b > bandNow) g += its[ii++].it.svg(); };
    // far bands first; inside a band the land, then the strips laid on it, then the hedge and rut lines
    const rank = k => ({ C: 0, P: 1, L: 2 })[k.replace(/^\d+/, '')[0]];
    const keys = [...groups.keys()].sort((a, b) => parseInt(b) - parseInt(a) || rank(a) - rank(b));
    for (const k of keys) {
      flush(parseInt(k));
      const c = k.slice(-7), d = groups.get(k), kind = k.replace(/^\d+/, '')[0];
      if (kind === 'L') { const w = parseInt(k.replace(/^\d+L/, '')) / 2; g += `<path d="${d}" stroke="${c}" stroke-width="${f(w)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`; }
      else g += `<path d="${d}" fill="${c}" stroke="${c}" stroke-width="0.8" stroke-linejoin="round"/>`;
    }
    flush(-1e9);
    return g;
  };

  // ------------------------------------------------------------ strips laid on the land (built once)
  let STRIPS = null;
  const strips = () => {
    if (STRIPS) return STRIPS;
    STRIPS = [];
    // the path: a worn chalky ribbon with darker ruts down its edges
    const step = 160, W = 150, slabs = [];
    for (let s = 0; s < TR.pathLen - step; s += step) {
      const a = TR.pathAt(s), b = TR.pathAt(s + step), na = [-a.dir[1], a.dir[0]], nb = [-b.dir[1], b.dir[0]];
      const P = (q, n, k) => [q.x + n[0] * W / 2 * k, TR.h(q.x + n[0] * W / 2 * k, q.z + n[1] * W / 2 * k) + 3, q.z + n[1] * W / 2 * k];
      const slab = { pts: [P(a, na, -1), P(b, nb, -1), P(b, nb, 1), P(a, na, 1)], col: '#c8b48c', c: [(a.x + b.x) / 2, TR.h((a.x + b.x) / 2, (a.z + b.z) / 2), (a.z + b.z) / 2] };
      STRIPS.push(slab); slabs.push(slab);
      // (each rut is sorted with the slabs it lies on: `on` becomes [previous slab, its slab, next slab] below)
      for (const k of [-0.62, 0.62]) STRIPS.push({ line: 1, w: 9, pts: [P(a, na, k), P(b, nb, k)], col: '#9a8a68', c: [(a.x + b.x) / 2, TR.h((a.x + b.x) / 2, (a.z + b.z) / 2) + 1, (a.z + b.z) / 2], on: slabs.length - 1 });
    }
    for (const st of STRIPS) if (typeof st.on === 'number') { const i = st.on; st.on = [slabs[i - 1], slabs[i], slabs[i + 1]]; }
    // the Weser beyond the town, wide and slow, holding the sky
    const zr = x => 8600 + 1500 * Math.sin(x / 9000 + 1), RW = 2600;
    for (let x = -60000; x < 60000; x += 1200) { const z1 = zr(x), z2 = zr(x + 1200); STRIPS.push({ pts: [[x, 6, z1 - RW / 2], [x + 1200, 6, z2 - RW / 2], [x + 1200, 6, z2 + RW / 2], [x, 6, z1 + RW / 2]], col: '#a8bcd0', c: [x + 600, 6, (z1 + z2) / 2] }); }
    // hedges along the long sides of the fields
    for (let i = -12; i <= 12; i++) for (let v = -39600; v < 16200; v += 900) {
      const u = i * FW, P = vv => [u, 0, vv];
      const p0 = P(v), p1 = P(v + 900), m = P(v + 450);
      if (!fieldAt(m[0], m[2] + 1) && !fieldAt(m[0] + 300, m[2])) continue;
      p0[1] = TR.h(p0[0], p0[2]) + 60; p1[1] = TR.h(p1[0], p1[2]) + 60; m[1] = TR.h(m[0], m[2]) + 60;
      STRIPS.push({ line: 1, w: 140, pts: [p0, p1], col: '#3e5a2a', c: m });
    }
    // furrows and crop rows down the length of the nearer fields (they give the farmland its grain and its depth)
    for (let i = -5; i < 5; i++) for (let j = -18; j < 0; j++) {
      const cx = (i + 0.5) * FW, cz = (j + 0.5) * FL, fc = fieldAt(cx, cz); if (!fc) continue;
      for (let k = 1; k < 10; k++) {
        // a furrow runs only over its own field: it stops where the meadow along the path (or the hill) begins
        const z = j * FL + k * FL / 10;
        let run = [];
        const flush = () => { if (run.length > 1) { const m = run[run.length >> 1]; STRIPS.push({ line: 1, w: 26, pts: run, col: G.RIG.shade(fc, -0.28), c: [m[0], m[1], z] }); } run = []; };
        for (let q = 0; q <= 16; q++) { const x = i * FW + 60 + (FW - 120) * q / 16; if (fieldAt(x, z) !== fc) { flush(); continue; } run.push([x, TR.h(x, z) + 4, z]); }
        flush();
      }
    }
    return STRIPS;
  };

  // copses and lone trees on the farmland and the lower slopes (billboards)
  let TREES = null;
  TR.trees = (cam, env, o = {}) => {
    // (none in the meadow under the walls, where the camera walks among the children, nor near the path it flies up)
    if (!TREES) { TREES = []; const r = rng(4242); for (let i = 0; i < 170; i++) { const x = -40000 + r() * 80000, z = -36000 + r() * 50000; if (Math.abs(x) < 4400 && z > -1200 && z < 4200) continue; if (pathDist(x, z)[0] < 1600) continue; if (TR.h(x, z) > 3800) continue; const n = 1 + Math.floor(r() * 4); for (let k = 0; k < n; k++) { const tx = x + (r() - 0.5) * 900, tz = z + (r() - 0.5) * 900, th = 260 + r() * 260, tc = r() < 0.5 ? '#3e5a2c' : '#4a6430'; if (Math.abs(tx) < 5200 && tz > -4200 && tz < 4200) continue; TREES.push([tx, tz, th, tc]); } } }
    const out = [], far = o.far || 60000;
    for (const [x, z, rr, c] of TREES) {
      if (o.side && (o.side > 0) !== (z > 0)) continue;
      // far off they thin away into the haze instead of popping out
      const cc = cam.toC([x, 0, z]), op = 1 - ss(far * 0.72, far, cc[2]); if (op <= 0) continue;
      const it = TR.tree(cam, env, x, z, { h: rr * 2.6, col: c, sunX: o.sunX, seed: Math.round(x + z), op }); if (it) out.push(it);
    }
    return out;
  };

  // ------------------------------------------------------------ things in the field (billboards, depth-sorted)
  // grass tufts close to the lens (bend in the breeze), wild flowers, stones; bushes and hawthorns farther off
  TR.tuft = (cam, env, x, z, t, o = {}) => {
    const y = TR.h(x, z), c = cam.toC([x, y, z]); if (c[2] < cam.near + 5) return null;
    const p = cam.scr(c), k = cam.fl / c[2]; if (p[0] + 30 * k < -4 || p[0] - 30 * k > 1084 || p[1] - 60 * k > 1924 || p[1] < -4) return null;
    const r = rng(Math.round(x * 7 + z * 3)), H = (o.h || 34) * (0.7 + r() * 0.6), sway = Math.sin(t * 1.7 + x * 0.01) * 4 * (o.wind ?? 1), col = T.tone(env, o.col || '#4a6a2a', c[2], 'g');
    let d = '';
    for (let i = 0; i < 9; i++) { const bx = (r() - 0.5) * 24, lean = (r() - 0.5) * 14 + sway, hh = H * (0.55 + r() * 0.55); d += `M${f(p[0] + (bx - 3) * k)},${f(p[1])} Q${f(p[0] + (bx + lean * 0.4) * k)},${f(p[1] - hh * 0.6 * k)} ${f(p[0] + (bx + lean) * k)},${f(p[1] - hh * k)} Q${f(p[0] + (bx + lean * 0.3 + 2) * k)},${f(p[1] - hh * 0.5 * k)} ${f(p[0] + (bx + 3) * k)},${f(p[1])}Z`; }
    // (a darker clump at the root, the blades over it)
    let g = `<ellipse cx="${f(p[0])}" cy="${f(p[1])}" rx="${f(14 * k)}" ry="${f(3.5 * k)}" fill="${T.tone(env, '#2a3a1a', c[2], 'g')}" opacity="0.45"/><path d="${d}" fill="${col}"/>`;
    if (o.flower) g += `<circle cx="${f(p[0] + (r() - 0.5) * 16 * k)}" cy="${f(p[1] - H * 0.9 * k)}" r="${f(Math.max(0.8, 3.2 * k))}" fill="${T.tone(env, o.flower, c[2], 'n')}"/>`;
    if (o.op !== undefined && o.op < 0.996) g = `<g opacity="${f(o.op)}">${g}</g>`;
    return { z: cam.dist([x, y + 20, z]), vd: c[2], wx: x, wz: z, svg: () => g };
  };
  TR.bush = (cam, env, x, z, o = {}) => {
    const y = TR.h(x, z), c = cam.toC([x, y, z]); if (c[2] < cam.near + 20) return null;
    const p = cam.scr(c), k = cam.fl / c[2], R = (o.r || 140) * k; if (p[0] < -R * 2 || p[0] > 1080 + R * 2 || p[1] < -R * 3 || p[1] > 2100 + R) return null;
    const r = rng(Math.round(x + z * 13)), lc = o.col || '#4a6230', sunX = o.sunX ?? 0;
    let g = `<ellipse cx="${f(p[0])}" cy="${f(p[1])}" rx="${f(R * 1.2)}" ry="${f(R * 0.25)}" fill="#0a0c06" opacity="0.3" filter="url(#b4)"/>`;
    for (let i = 0; i < 9; i++) { const a = r() * Math.PI, rr = R * (0.45 + r() * 0.3), cx = p[0] + Math.cos(a) * R * 0.6, cy = p[1] - R * 0.5 - Math.sin(a) * R * 0.45; g += `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rr)}" ry="${f(rr * 0.85)}" fill="${T.tone(env, shade(lc, (cx - p[0]) / R * 0.18 * (sunX || 1) - 0.06), c[2], 'g')}"/>`; }
    if (o.blossom) for (let i = 0; i < 14; i++) g += `<circle cx="${f(p[0] + (r() - 0.5) * R * 1.6)}" cy="${f(p[1] - R * (0.3 + r() * 0.8))}" r="${f(Math.max(0.6, R * 0.05))}" fill="${T.tone(env, o.blossom, c[2], 'n')}"/>`;
    return { z: cam.dist([x, y + (o.r || 140) * 0.5, z]), vd: c[2], wx: x, wz: z, svg: () => g };
  };
  // a field tree: a trunk and a crown of smooth leaf masses held up on it, dark on the side away from the sun
  TR.tree = (cam, env, x, z, o = {}) => {
    const y = TR.h(x, z), c = cam.toC([x, y, z]); if (c[2] < cam.near + 40) return null;
    const p = cam.scr(c), k = cam.fl / c[2], H = (o.h || 900) * k; if (p[0] < -H || p[0] > 1080 + H || p[1] < -50 || p[1] > 2100 + H) return null;
    const r = rng(o.seed || 7), lc = o.col || '#4a6430', sunX = o.sunX ?? 0.4, d = c[2], col = (h, m = 'g') => T.tone(env, h, d, m);
    const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const blob = (cx, cy, s) => { const N = 9, pts = []; for (let i = 0; i < N; i++) { const a = i / N * Math.PI * 2, q = s * (0.8 + r() * 0.3); pts.push([cx + Math.cos(a) * q, cy + Math.sin(a) * q * 0.82]); } let m = mid(pts[N - 1], pts[0]), dd = `M${f(m[0])},${f(m[1])}`; for (let i = 0; i < N; i++) { const m2 = mid(pts[i], pts[(i + 1) % N]); dd += `Q${f(pts[i][0])},${f(pts[i][1])} ${f(m2[0])},${f(m2[1])}`; } return dd + 'Z'; };
    let g = `<ellipse cx="${f(p[0])}" cy="${f(p[1])}" rx="${f(H * 0.32)}" ry="${f(H * 0.06)}" fill="#0a0c06" opacity="0.28"/>`;
    // trunk and two limbs reaching up into the crown
    g += `<path d="M${f(p[0] - H * 0.035)},${f(p[1])} L${f(p[0] - H * 0.02)},${f(p[1] - H * 0.5)} L${f(p[0] + H * 0.02)},${f(p[1] - H * 0.5)} L${f(p[0] + H * 0.035)},${f(p[1])}Z M${f(p[0] - H * 0.015)},${f(p[1] - H * 0.42)} L${f(p[0] - H * 0.13)},${f(p[1] - H * 0.66)} L${f(p[0] - H * 0.11)},${f(p[1] - H * 0.67)} L${f(p[0] + H * 0.005)},${f(p[1] - H * 0.47)}Z M${f(p[0] + H * 0.012)},${f(p[1] - H * 0.45)} L${f(p[0] + H * 0.12)},${f(p[1] - H * 0.7)} L${f(p[0] + H * 0.14)},${f(p[1] - H * 0.69)} L${f(p[0] + H * 0.024)},${f(p[1] - H * 0.42)}Z" fill="${col('#3a2c22')}"/>`;
    // the crown: eleven leaf masses, a dark underside, sunlit clusters on the sun's side and a few small ones breaking
    // the outline
    const cy = p[1] - H * 0.66, R = H * 0.3, lobes = [];
    for (let i = 0; i < 11; i++) { const a = r() * Math.PI * 2, rr = Math.sqrt(r()); lobes.push([p[0] + Math.cos(a) * R * 0.8 * rr, cy + Math.sin(a) * R * 0.62 * rr, R * (0.42 + r() * 0.28)]); }
    lobes.sort((a, b) => a[1] - b[1]);
    g += `<path d="${lobes.map(q => blob(q[0], q[1] + R * 0.12, q[2] * 1.06)).join('')}" fill="${col(shade(lc, -0.35))}"/>`;
    for (const q of lobes) g += `<path d="${blob(q[0], q[1], q[2])}" fill="${col(shade(lc, Math.max(-0.25, Math.min(0.22, (q[0] - p[0]) / R * 0.2 * sunX - (q[1] - cy) / R * 0.12))))}"/>`;
    const lit = lobes.filter(q => (q[0] - p[0]) * (sunX || 0.4) > -R * 0.1 && q[1] < cy + R * 0.2);
    if (lit.length) g += `<path d="${lit.map(q => blob(q[0] + q[2] * 0.22 * Math.sign(sunX || 0.4), q[1] - q[2] * 0.25, q[2] * 0.48)).join('')}" fill="${col(shade(lc, 0.28))}" opacity="0.75"/>`;
    { let d2 = ''; for (let i = 0; i < 6; i++) { const a = r() * Math.PI * 2; d2 += blob(p[0] + Math.cos(a) * R * 1.02, cy + Math.sin(a) * R * 0.78, R * (0.12 + r() * 0.08)); } g += `<path d="${d2}" fill="${col(shade(lc, -0.12))}"/>`; }
    if (o.op !== undefined && o.op < 0.996) g = `<g opacity="${f(o.op)}">${g}</g>`;
    return { z: cam.dist([x, y + (o.h || 900) * 0.5, z]), vd: d, wx: x, wz: z, svg: () => g };
  };
  TR.rock = (cam, env, x, z, o = {}) => {
    const y = TR.h(x, z), c = cam.toC([x, y, z]); if (c[2] < cam.near + 20) return null;
    const p = cam.scr(c), k = cam.fl / c[2], w = (o.w || 120) * k, h = (o.h || 70) * k;
    const g = `<path d="M${f(p[0] - w)},${f(p[1])} C${f(p[0] - w)},${f(p[1] - h)} ${f(p[0] - w * 0.3)},${f(p[1] - h * 1.2)} ${f(p[0] + w * 0.2)},${f(p[1] - h)} C${f(p[0] + w * 0.8)},${f(p[1] - h * 0.9)} ${f(p[0] + w)},${f(p[1] - h * 0.3)} ${f(p[0] + w)},${f(p[1])}Z" fill="${T.tone(env, o.col || '#9a9488', c[2], 'g')}" stroke="${T.tone(env, '#2a2620', c[2], 'n')}" stroke-width="${f(Math.min(1.8, 1.5 * k * 10))}"/><path d="M${f(p[0] - w * 0.6)},${f(p[1] - h * 0.8)} Q${f(p[0])},${f(p[1] - h * 1.15)} ${f(p[0] + w * 0.5)},${f(p[1] - h * 0.85)}" stroke="#fff8e0" stroke-width="${f(Math.max(0.6, h * 0.08))}" opacity="0.35" fill="none"/>`;
    return { z: cam.dist([x, y + (o.h || 70) * 0.5, z]), vd: c[2], wx: x, wz: z, svg: () => g };
  };
  // a scatter of tufts (and flowers) round a point, seeded by grid cell so they stay put as the camera moves
  TR.tufts = (cam, env, cx, cz, rad, t, o = {}) => {
    const out = [], step = o.step || 60;
    for (let x = Math.floor((cx - rad) / step) * step; x < cx + rad; x += step) for (let z = Math.floor((cz - rad) / step) * step; z < cz + rad; z += step) {
      const r = rng(Math.round(x * 31 + z * 17)), xx = x + r() * step, zz = z + r() * step; if (r() > (o.dens ?? 0.6)) continue;
      if (pathDist(xx, zz)[0] < 90) continue;
      if (o.avoid && o.avoid(xx, zz)) continue;
      // the patch follows the camera, so its edge is a soft circle: tufts thin in and out there instead of popping
      const op = 1 - ss(rad * 0.6, rad * 0.97, Math.hypot(xx - cx, zz - cz)); if (op <= 0) continue;
      const it = TR.tuft(cam, env, xx, zz, t, { flower: r() < 0.3 ? ['#f0e8d0', '#e8c040', '#c86aa0', '#8a9ad8', '#f4f0e8'][Math.floor(r() * 5)] : null, h: o.h, op }); if (it) out.push(it);
    }
    return out;
  };
})(window);
