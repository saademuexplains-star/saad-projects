// Detailed environment pieces: textured, hand-crafted looking medieval sets.
(function (G) {
  const { f, shade, mix, rng, uid, OUT, NS } = G.RIG;
  const E = {};
  const ol = (w = 1.6, c = '#1a120c', op = 0.75) => `stroke="${c}" stroke-width="${w}" ${NS} stroke-opacity="${op}" stroke-linejoin="round"`;

  const texF = (id, freq, oct, lo, seed, hi = 1.0) => `<filter id="${id}" x="0%" y="0%" width="100%" height="100%" color-interpolation-filters="sRGB">
 <feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="${oct}" seed="${seed}" result="n"/>
 <feColorMatrix in="n" type="matrix" values="0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0 0 0 0 1" result="g"/>
 <feComponentTransfer in="g" result="m"><feFuncR type="linear" slope="${f((hi - lo) * 2)}" intercept="${f(lo - 0.5 * (hi - lo))}"/><feFuncG type="linear" slope="${f((hi - lo) * 2)}" intercept="${f(lo - 0.5 * (hi - lo))}"/><feFuncB type="linear" slope="${f((hi - lo) * 2)}" intercept="${f(lo - 0.5 * (hi - lo))}"/></feComponentTransfer>
 <feBlend in="SourceGraphic" in2="m" mode="multiply" result="t"/><feComposite in="t" in2="SourceAlpha" operator="in"/></filter>`;
  E.defs = () => texF('tex', '0.85', 3, 0.84, 11) + texF('texC', '0.012', 3, 0.78, 5) + texF('plaster', '0.08 0.1', 4, 0.86, 8) +
    `<filter id="cloudF" x="-30%" y="-60%" width="160%" height="220%"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.03" numOctaves="4" seed="21" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="60" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="9"/></filter>` +
    texF('woodV', '0.9 0.012', 2, 0.68, 3) + texF('woodH', '0.012 0.9', 2, 0.7, 4) + texF('thatch', '0.7 0.03', 3, 0.62, 6) + texF('leaf', '0.18', 3, 0.66, 9) + texF('ground', '0.04 0.12', 4, 0.72, 12) +
    `<filter id="smokeF" x="-50%" y="-50%" width="200%" height="200%"><feTurbulence type="fractalNoise" baseFrequency="0.015 0.04" numOctaves="3" seed="2"/><feDisplacementMap in="SourceGraphic" scale="40" xChannelSelector="R" yChannelSelector="G"/><feGaussianBlur stdDeviation="6"/></filter>`;

  // ---------- sky ----------
  E.sky = (W, hz, stops) => { const id = uid('sky'); return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</linearGradient></defs><rect width="${W}" height="${hz + 40}" fill="url(#${id})"/>`; };

  // cumulus cluster with sun-lit edges and flat base
  E.cloud = (x, y, w, h, seed, o = {}) => {
    const r = rng(seed), id = uid('cl'), sun = o.sun || [1, -0.3];
    const body = o.body || '#c7c4c8', lit = o.lit || '#fff1dc', dark = o.dark || '#8d8a98';
    const puffs = [];
    const n = o.n || 9;
    for (let i = 0; i < n; i++) { const t = i / (n - 1), px = (t - 0.5) * w * (0.85 + r() * 0.1), rr = h * (0.32 + Math.sin(t * Math.PI) * 0.45 + r() * 0.15); puffs.push([px, -rr * (0.55 + r() * 0.2), rr]); }
    for (let i = 0; i < 4; i++) { const px = (r() - 0.5) * w * 0.5, rr = h * (0.4 + r() * 0.3); puffs.push([px, -h * 0.6 - rr * 0.3, rr]); }
    const set = (dx, dy, k, col, op = 1) => puffs.map(([px, py, rr]) => `<circle cx="${f(px + dx * rr)}" cy="${f(py + dy * rr)}" r="${f(rr * k)}" fill="${col}" opacity="${op}"/>`).join('');
    return `<g transform="translate(${x},${y})" opacity="${o.op ?? 1}"><defs><clipPath id="${id}"><rect x="${-w}" y="${-h * 3}" width="${w * 2}" height="${h * 3 + h * 0.2}"/></clipPath></defs>` +
      `<g filter="url(#cloudF)"><g clip-path="url(#${id})">${set(0, 0.12, 1, dark)}${set(sun[0] * 0.08, sun[1] * 0.08, 0.95, body)}${set(sun[0] * 0.24, sun[1] * 0.24, 0.72, lit, 0.85)}</g>` +
      `<rect x="${-w * 0.55}" y="${-h * 0.08}" width="${w * 1.1}" height="${h * 0.2}" fill="${dark}" opacity="0.45"/></g></g>`;
  };
  // thin high stratus streaks
  E.streak = (x, y, w, h, col, op) => `<ellipse cx="${x}" cy="${y}" rx="${w}" ry="${h}" fill="${col}" opacity="${op}" filter="url(#cloudF)"/>`;
  // light falloff: multiply the set by a radial map (white at the source, dark away from it)
  E.lightmap = (W, H, x, y, r, dark, op = 1) => { const id = uid('lm'); return `<defs><radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${x}" cy="${y}" r="${r}"><stop offset="0" stop-color="#ffffff"/><stop offset="0.45" stop-color="${mix('#ffffff', dark, 0.45)}"/><stop offset="1" stop-color="${dark}"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#${id})" style="mix-blend-mode:multiply" opacity="${op}"/>`; };

  E.birds = (x, y, n, seed, s = 1, col = '#2a2a30') => { const r = rng(seed); let g = ''; for (let i = 0; i < n; i++) { const bx = x + (r() - 0.5) * 220 * s, by = y + (r() - 0.5) * 90 * s, w = (6 + r() * 6) * s; g += `<path d="M${f(bx - w)},${f(by - w * 0.3)} Q${f(bx - w * 0.4)},${f(by - w * 0.6)} ${f(bx)},${f(by)} Q${f(bx + w * 0.4)},${f(by - w * 0.6)} ${f(bx + w)},${f(by - w * 0.35)}" stroke="${col}" stroke-width="${f(1.6 * s)}" fill="none"/>`; } return g; };

  // ---------- terrain ----------
  E.ridge = (W, y, amp, seed, col, step = 120) => { const r = rng(seed); let d = `M-50,${y}`; for (let x = -50; x <= W + 150; x += step) d += ` Q${f(x + step / 2)},${f(y - amp * (0.3 + r() * 0.9))} ${x + step},${f(y - amp * r() * 0.5)}`; return `<path d="${d} L${W + 150},${y + 900} L-50,${y + 900}Z" fill="${col}"/>`; };
  // patchwork of distant fields on a slope
  E.patchwork = (x0, x1, y0, y1, seed, cols) => {
    const r = rng(seed); let g = ''; const rows = 5;
    for (let j = 0; j < rows; j++) { const ya = y0 + (y1 - y0) * j / rows, yb = y0 + (y1 - y0) * (j + 1) / rows; let x = x0; while (x < x1) { const w = 60 + r() * 140, c = cols[Math.floor(r() * cols.length)]; g += `<path d="M${f(x)},${f(ya)} L${f(x + w)},${f(ya + (r() - 0.5) * 6)} L${f(x + w * 1.05)},${f(yb)} L${f(x - 4)},${f(yb)}Z" fill="${c}"/>`; x += w; } }
    for (let j = 1; j < rows; j++) { const ya = y0 + (y1 - y0) * j / rows; g += `<path d="M${x0},${f(ya)} Q${(x0 + x1) / 2},${f(ya - 4)} ${x1},${f(ya + 2)}" stroke="#3e4a2a" stroke-width="3" opacity="0.6"/>`; }
    return g;
  };
  E.hedge = (x0, x1, y, h, seed, col = '#45512e') => { const r = rng(seed); let g = ''; for (let x = x0; x < x1; x += h * (0.5 + r() * 0.4)) { const rr = h * (0.45 + r() * 0.35); g += `<circle cx="${f(x)}" cy="${f(y - rr * 0.6)}" r="${f(rr)}" fill="${shade(col, (r() - 0.5) * 0.25)}"/>`; } return `<g filter="url(#leaf)">${g}</g>`; };

  // ---------- vegetation ----------
  E.oak = (x, y, s, seed, o = {}) => {
    const r = rng(seed), sun = o.sun ?? 1, dark = o.dark || '#33402a', mid = o.mid || '#4f6136', lit = o.lit || '#7d8a4a', trunk = o.trunk || '#3e3024';
    let g = `<path d="M${f(x - 9 * s)},${y} C${f(x - 7 * s)},${f(y - 60 * s)} ${f(x - 4 * s)},${f(y - 90 * s)} ${f(x - 22 * s)},${f(y - 130 * s)} L${f(x - 14 * s)},${f(y - 134 * s)} C${f(x)},${f(y - 100 * s)} ${f(x + 4 * s)},${f(y - 110 * s)} ${f(x + 26 * s)},${f(y - 140 * s)} L${f(x + 32 * s)},${f(y - 134 * s)} C${f(x + 12 * s)},${f(y - 100 * s)} ${f(x + 10 * s)},${f(y - 60 * s)} ${f(x + 11 * s)},${y}Z" fill="${trunk}"/>`;
    const blobs = []; for (let i = 0; i < 13; i++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()); blobs.push([x + Math.cos(a) * d * 70 * s, y - 170 * s + Math.sin(a) * d * 48 * s, (26 + r() * 22) * s]); }
    g += blobs.map(([bx, by, br]) => `<circle cx="${f(bx)}" cy="${f(by)}" r="${f(br)}" fill="${dark}"/>`).join('');
    g += blobs.map(([bx, by, br]) => `<circle cx="${f(bx + sun * br * 0.15)}" cy="${f(by - br * 0.18)}" r="${f(br * 0.82)}" fill="${mid}"/>`).join('');
    g += blobs.filter((b, i) => i % 2 === 0).map(([bx, by, br]) => `<circle cx="${f(bx + sun * br * 0.32)}" cy="${f(by - br * 0.32)}" r="${f(br * 0.5)}" fill="${lit}" opacity="0.85"/>`).join('');
    return `<g filter="url(#leaf)">${g}</g>`;
  };
  E.wheatBand = (x0, x1, yBase, hMin, hMax, n, seed, o = {}) => {
    const r = rng(seed), stalk = o.stalk || '#a07e44', head = o.head || '#c9a45c', lit = o.lit || '#ead29a', sun = o.sun ?? 1, w = o.w || 1;
    let g = '';
    for (let i = 0; i < n; i++) {
      const x = x0 + (x1 - x0) * r(), hh = hMin + (hMax - hMin) * r(), lean = (r() - 0.5) * hh * 0.25 + (o.wind || 0) * hh, tx = x + lean, ty = yBase - hh;
      const c = shade(head, (r() - 0.5) * 0.25);
      g += `<path d="M${f(x)},${yBase + 6} Q${f(x + lean * 0.2)},${f(yBase - hh * 0.5)} ${f(tx)},${f(ty)}" stroke="${shade(stalk, (r() - 0.5) * 0.3)}" stroke-width="${f(2.4 * w)}" fill="none"/>`;
      const ang = Math.atan2(lean, hh) * 180 / Math.PI;
      g += `<g transform="translate(${f(tx)},${f(ty)}) rotate(${f(ang * 1.3)}) scale(${w})"><path d="M0,0 C-7,-10 -7,-30 0,-44 C7,-30 7,-10 0,0Z" fill="${c}"/>` +
        `<path d="M${sun * 1},-4 C${sun * 6},-14 ${sun * 5},-30 ${sun * 1},-40" stroke="${lit}" stroke-width="2" fill="none" opacity="0.8"/>` +
        [-36, -26, -16].map(yy => `<path d="M-4,${yy} l-5,-6 M4,${yy} l5,-6" stroke="${shade(c, -0.25)}" stroke-width="1"/>`).join('') + `<path d="M0,-44 L0,-62" stroke="${c}" stroke-width="1" opacity="0.7"/></g>`;
    }
    return g;
  };
  E.stook = (x, y, s, seed, o = {}) => {
    const r = rng(seed), c = o.col || '#c9a35a', sh = o.shade || '#7a5a2c', sun = o.sun ?? 1;
    let g = `<ellipse cx="${f(x - sun * 26 * s)}" cy="${f(y + 2 * s)}" rx="${f(40 * s)}" ry="${f(8 * s)}" fill="#2a2010" opacity="0.4" filter="url(#b2)"/>`;
    g += `<path d="M${f(x - 26 * s)},${y} L${f(x - 12 * s)},${f(y - 70 * s)} L${f(x - 18 * s)},${f(y - 96 * s)} L${f(x + 18 * s)},${f(y - 96 * s)} L${f(x + 12 * s)},${f(y - 70 * s)} L${f(x + 26 * s)},${y}Z" fill="${c}"/>`;
    g += `<path d="M${f(x - sun * 26 * s)},${y} L${f(x - sun * 12 * s)},${f(y - 70 * s)} L${f(x)},${f(y - 70 * s)} L${f(x)},${y}Z" fill="${sh}" opacity="0.55"/>`;
    for (let i = 0; i < 9; i++) { const xx = x + (i - 4) * 5 * s; g += `<path d="M${f(xx)},${y} L${f(xx * 0.4 + x * 0.6)},${f(y - 70 * s)}" stroke="${shade(c, -0.35)}" stroke-width="${f(1.2 * s)}" opacity="0.5"/>`; }
    g += `<rect x="${f(x - 13 * s)}" y="${f(y - 74 * s)}" width="${f(26 * s)}" height="${f(7 * s)}" fill="${shade(c, -0.4)}"/>`;
    for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * 0.22; g += `<path d="M${f(x)},${f(y - 92 * s)} l${f(Math.cos(a) * 24 * s)},${f(Math.sin(a) * 24 * s)}" stroke="${shade(c, 0.15)}" stroke-width="${f(5 * s)}" stroke-linecap="round"/>`; }
    return g;
  };
  E.tufts = (x0, x1, y0, y1, n, seed, col = '#5a6234') => { const r = rng(seed); let g = ''; for (let i = 0; i < n; i++) { const x = x0 + (x1 - x0) * r(), y = y0 + (y1 - y0) * r(), h = (6 + r() * 10) * (0.5 + (y - y0) / (y1 - y0 + 1)); for (let k = -2; k <= 2; k++) g += `<path d="M${f(x)},${f(y)} q${f(k * 2)},${f(-h * 0.6)} ${f(k * 4)},${f(-h)}" stroke="${shade(col, (r() - 0.5) * 0.3)}" stroke-width="1.6" fill="none"/>`; } return g; };

  // tiny distant workers (silhouettes) bending over with sickles
  E.worker = (x, y, s, col = '#3a3028', bend = 1) => `<g transform="translate(${x},${y}) scale(${s})" fill="${col}"><rect x="-5" y="-18" width="4" height="18"/><rect x="2" y="-18" width="4" height="18"/><path d="M-8,-18 L8,-18 L${6 + bend * 10},-40 L${-6 + bend * 10},-42Z"/><circle cx="${12 + bend * 10}" cy="-40" r="6"/><path d="M${bend * 10},-34 L${18 + bend * 8},-22" stroke="${col}" stroke-width="3"/><path d="M${18 + bend * 8},-22 q8,-6 6,-14" stroke="${col}" stroke-width="2" fill="none"/></g>`;

  // ---------- buildings ----------
  E.smoke = (x, y, h, seed, col = '#cfcac4', op = 0.35) => { const r = rng(seed); let d = `M${x},${y}`; let cx = x, cy = y; for (let i = 0; i < 6; i++) { const nx = cx + 10 + r() * 30, ny = cy - h / 6; d += ` Q${f(cx + (r() - 0.3) * 40)},${f((cy + ny) / 2)} ${f(nx)},${f(ny)}`; cx = nx; cy = ny; } return `<path d="${d}" stroke="${col}" stroke-width="${f(h * 0.12)}" fill="none" stroke-linecap="round" opacity="${op}" filter="url(#smokeF)"/>`; };

  // timber-framed cottage, 3/4 view. side = +1 shows the side wall on the right
  E.cottage = (x, y, w, h, s, seed, o = {}) => {
    const r = rng(seed), side = o.side ?? 1, sun = o.sun ?? 1, d = w * 0.75 * s, rise = d * 0.12;
    const wall = o.wall || '#d8ccb0', timber = o.timber || '#3a2a1e', roof = o.roof || '#9a7a46', lit = sun * side > 0;
    const X = x, Y = y, Wd = w * s, Hh = h * s, rh = Wd * 0.62;
    const xr = side > 0 ? X + Wd : X, front = `M${X},${Y} L${X + Wd},${Y} L${X + Wd},${Y - Hh} L${X + Wd / 2},${Y - Hh - rh} L${X},${Y - Hh}Z`;
    const sw = `M${xr},${Y} L${f(xr + side * d)},${f(Y - rise)} L${f(xr + side * d)},${f(Y - Hh - rise)} L${xr},${Y - Hh}Z`;
    const apex = [X + Wd / 2, Y - Hh - rh], apexB = [apex[0] + side * d, apex[1] - rise];
    const eaveF = [xr + side * Wd * 0.08, Y - Hh + Hh * 0.12], eaveB = [xr + side * (d + Wd * 0.08), Y - Hh + Hh * 0.12 - rise];
    const roofP = `M${f(apex[0] - side * Wd * 0.05)},${f(apex[1] - 8 * s)} L${f(apexB[0])},${f(apexB[1] - 8 * s)} L${f(eaveB[0])},${f(eaveB[1])} L${f(eaveF[0])},${f(eaveF[1])}Z`;
    const fwCol = lit ? shade(wall, -0.12) : wall, swCol = lit ? wall : shade(wall, -0.3);
    let g = `<path d="${sw}" fill="${swCol}" filter="url(#plaster)"/><path d="${front}" fill="${fwCol}" filter="url(#plaster)"/>`;
    const tw = Math.max(2, 5 * s);
    let t = `<path d="${front}" fill="none" stroke="${timber}" stroke-width="${tw * 1.4}"/>`;
    t += `<path d="M${X},${f(Y - Hh * 0.5)} L${X + Wd},${f(Y - Hh * 0.5)} M${X},${Y - Hh} L${X + Wd},${Y - Hh}" stroke="${timber}" stroke-width="${tw}"/>`;
    for (const k of [0.25, 0.75]) t += `<path d="M${f(X + Wd * k)},${Y} L${f(X + Wd * k)},${Y - Hh}" stroke="${timber}" stroke-width="${tw}"/>`;
    t += `<path d="M${X},${f(Y - Hh * 0.5)} L${f(X + Wd * 0.25)},${Y - Hh} M${X + Wd},${f(Y - Hh * 0.5)} L${f(X + Wd * 0.75)},${Y - Hh} M${f(X + Wd / 2)},${Y - Hh} L${f(X + Wd / 2)},${f(Y - Hh - rh * 0.8)}" stroke="${timber}" stroke-width="${tw}"/>`;
    for (const k of [0.33, 0.66]) t += `<path d="M${f(xr + side * d * k)},${f(Y - rise * k)} L${f(xr + side * d * k)},${f(Y - Hh - rise * k)}" stroke="${timber}" stroke-width="${tw}"/>`;
    t += `<path d="M${xr},${f(Y - Hh * 0.5)} L${f(xr + side * d)},${f(Y - Hh * 0.5 - rise)}" stroke="${timber}" stroke-width="${tw}"/>`;
    g += `<g filter="url(#woodV)">${t}</g>`;
    if (o.door !== false) g += `<path d="M${f(X + Wd * 0.38)},${Y} L${f(X + Wd * 0.38)},${f(Y - Hh * 0.62)} Q${f(X + Wd * 0.5)},${f(Y - Hh * 0.72)} ${f(X + Wd * 0.62)},${f(Y - Hh * 0.62)} L${f(X + Wd * 0.62)},${Y}Z" fill="${o.doorCol || '#2a1d14'}"/>`;
    if (o.window) g += `<rect x="${f(xr + side * d * 0.4 - 8 * s)}" y="${f(Y - Hh * 0.72 - rise * 0.5)}" width="${f(16 * s)}" height="${f(14 * s)}" fill="${o.window}"/>`;
    // thatch roof with rounded thick eave
    g += `<g filter="url(#thatch)"><path d="${roofP}" fill="${roof}"/>`;
    for (let i = 1; i < 10; i++) { const k = i / 10; g += `<path d="M${f(apex[0] + (apexB[0] - apex[0]) * k)},${f(apex[1] + (apexB[1] - apex[1]) * k - 6 * s)} L${f(eaveF[0] + (eaveB[0] - eaveF[0]) * k)},${f(eaveF[1] + (eaveB[1] - eaveF[1]) * k)}" stroke="${shade(roof, -0.25)}" stroke-width="${f(1.2 * s + 0.5)}" opacity="0.5"/>`; }
    g += `<path d="M${f(eaveF[0])},${f(eaveF[1])} L${f(eaveB[0])},${f(eaveB[1])}" stroke="${shade(roof, -0.35)}" stroke-width="${f(10 * s)}" stroke-linecap="round"/>`;
    g += `<path d="M${f(apex[0] - side * Wd * 0.05)},${f(apex[1] - 8 * s)} L${f(apexB[0])},${f(apexB[1] - 8 * s)}" stroke="${shade(roof, 0.15)}" stroke-width="${f(8 * s)}" stroke-linecap="round"/>`;
    g += `<path d="M${f(X - Wd * 0.06)},${f(Y - Hh + Hh * 0.1)} L${f(apex[0])},${f(apex[1] - 10 * s)} L${f(X + Wd * 1.06)},${f(Y - Hh + Hh * 0.1)}" stroke="${roof}" stroke-width="${f(12 * s)}" fill="none" stroke-linejoin="round"/>`;
    g += `<path d="M${f(X - Wd * 0.06)},${f(Y - Hh + Hh * 0.1)} L${f(apex[0])},${f(apex[1] - 10 * s)} L${f(X + Wd * 1.06)},${f(Y - Hh + Hh * 0.1)}" stroke="${shade(roof, -0.3)}" stroke-width="${f(3 * s)}" fill="none" transform="translate(0,${f(5 * s)})"/></g>`;
    g += `<path d="M${X},${Y - Hh} L${X + Wd},${Y - Hh} L${X + Wd},${f(Y - Hh + 14 * s)} L${X},${f(Y - Hh + 14 * s)}Z" fill="#000" opacity="0.25" filter="url(#b2)"/>`;
    if (o.smoke) g += E.smoke(apex[0] + side * d * 0.5, apex[1] - rise * 0.5, o.smoke, seed + 3, o.smokeCol, o.smokeOp);
    return g;
  };

  E.church = (x, y, s, o = {}) => {
    const st = o.stone || '#bdb5a6', roof = o.roof || '#5d5650', sun = o.sun ?? 1;
    const tw = 70 * s, th = 210 * s, nw = 200 * s, nh = 90 * s;
    let g = `<rect x="${x}" y="${y - nh}" width="${nw}" height="${nh}" fill="${shade(st, -0.12)}" filter="url(#tex)"/>`;
    g += `<path d="M${x - 6 * s},${y - nh} L${x + 20 * s},${y - nh - 60 * s} L${x + nw - 10 * s},${y - nh - 60 * s} L${x + nw + 6 * s},${y - nh}Z" fill="${roof}" filter="url(#tex)"/>`;
    for (let i = 0; i < 4; i++) g += `<path d="M${x + 30 * s + i * 45 * s},${y - nh * 0.3} l0,${-nh * 0.35} q${6 * s},${-10 * s} ${12 * s},0 l0,${nh * 0.35}Z" fill="#2a2620"/>`;
    g += `<rect x="${x - tw * 0.6}" y="${y - th}" width="${tw}" height="${th}" fill="${st}" filter="url(#tex)"/>`;
    g += `<rect x="${x - tw * 0.6 + (sun > 0 ? tw * 0.55 : 0)}" y="${y - th}" width="${tw * 0.45}" height="${th}" fill="#000" opacity="0.12"/>`;
    for (let i = 0; i < 4; i++) g += `<rect x="${x - tw * 0.6 + i * tw / 3.5}" y="${y - th - 12 * s}" width="${tw / 6}" height="${12 * s}" fill="${st}"/>`;
    g += `<path d="M${x - tw * 0.1 - 6 * s},${y - th * 0.7} l0,${-24 * s} q${6 * s},${-10 * s} ${12 * s},0 l0,${24 * s}Z" fill="#1e1a16"/>`;
    for (let j = 0; j < 9; j++) g += `<path d="M${x - tw * 0.6},${y - th + j * th / 9} l${tw},0" stroke="${shade(st, -0.25)}" stroke-width="${f(0.8 * s + 0.3)}" opacity="0.5"/>`;
    return g;
  };

  E.manor = (x, y, s, o = {}) => {
    const st = o.stone || '#a49c90', roof = o.roof || '#4e4844';
    let g = `<rect x="${x - 110 * s}" y="${y - 80 * s}" width="${220 * s}" height="${80 * s}" fill="${shade(st, -0.1)}"/>`;
    for (const [tx, tw, th] of [[-130, 46, 150], [100, 50, 170], [-26, 56, 200]]) {
      g += `<rect x="${x + tx * s}" y="${y - th * s}" width="${tw * s}" height="${th * s}" fill="${st}"/><path d="M${x + (tx - 4) * s},${y - th * s} L${x + (tx + tw / 2) * s},${y - (th + 46) * s} L${x + (tx + tw + 4) * s},${y - th * s}Z" fill="${roof}"/>`;
      g += `<rect x="${x + (tx + tw * 0.4) * s}" y="${y - th * 0.6 * s}" width="${tw * 0.2 * s}" height="${12 * s}" fill="#1a1612"/>`;
    }
    g += `<path d="M${x - 40 * s},${y - 200 * s} l0,${-40 * s} l${24 * s},${10 * s} l${-24 * s},${10 * s}" fill="#7a2a24" stroke="#2a2420" stroke-width="1"/>`;
    return `<g filter="url(#tex)">${g}</g>`;
  };

  // ---------- interior ----------
  E.daubWall = (x0, y0, x1, y1, seed, o = {}) => {
    const r = rng(seed), daub = o.daub || '#8a7458', timber = o.timber || '#2a1c12';
    let g = `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="${daub}" filter="url(#plaster)"/>`;
    for (let i = 0; i < 14; i++) { const cx = x0 + r() * (x1 - x0), cy = y0 + r() * (y1 - y0); g += `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(30 + r() * 90)}" ry="${f(20 + r() * 60)}" fill="${r() > 0.5 ? '#3a2a1a' : '#b8a488'}" opacity="${f(0.08 + r() * 0.12)}" filter="url(#b14)"/>`; }
    let cr = ''; for (let i = 0; i < 10; i++) { let cx = x0 + r() * (x1 - x0), cy = y0 + r() * (y1 - y0), d = `M${f(cx)},${f(cy)}`; for (let k = 0; k < 5; k++) { cx += (r() - 0.5) * 40; cy += 8 + r() * 22; d += ` L${f(cx)},${f(cy)}`; } cr += `<path d="${d}" stroke="#2a1c10" stroke-width="1.3" fill="none" opacity="0.45"/>`; }
    g += cr;
    let t = '';
    const posts = o.posts || [x0 + (x1 - x0) * 0.33, x0 + (x1 - x0) * 0.7];
    for (const px of posts) t += `<rect x="${px - 26}" y="${y0}" width="52" height="${y1 - y0}" fill="${timber}"/><rect x="${px - 26}" y="${y0}" width="12" height="${y1 - y0}" fill="#fff" opacity="0.05"/>`;
    if (o.rail) t += `<rect x="${x0}" y="${o.rail - 22}" width="${x1 - x0}" height="44" fill="${timber}"/>`;
    for (const [ax, ay, bx, by] of (o.braces || [])) t += `<path d="M${ax},${ay} L${bx},${by}" stroke="${timber}" stroke-width="34"/>`;
    g += `<g filter="url(#woodV)">${t}</g>`;
    return g;
  };
  E.pot = (x, y, w, h, col, o = {}) => {
    const id = uid('pt');
    return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${shade(col, -0.4)}"/><stop offset="0.35" stop-color="${shade(col, 0.15)}"/><stop offset="1" stop-color="${shade(col, -0.5)}"/></linearGradient></defs>` +
      `<path d="M${x - w * 0.28},${y - h} Q${x - w * 0.3},${y - h * 0.86} ${x - w * 0.42},${y - h * 0.72} Q${x - w * 0.6},${y - h * 0.35} ${x - w * 0.36},${y} L${x + w * 0.36},${y} Q${x + w * 0.6},${y - h * 0.35} ${x + w * 0.42},${y - h * 0.72} Q${x + w * 0.3},${y - h * 0.86} ${x + w * 0.28},${y - h}Z" fill="url(#${id})" ${ol(1.2)} filter="url(#tex)"/>` +
      `<ellipse cx="${x}" cy="${y - h}" rx="${w * 0.28}" ry="${h * 0.05}" fill="${shade(col, -0.6)}"/>` + (o.band ? `<path d="M${x - w * 0.48},${y - h * 0.55} Q${x},${y - h * 0.5} ${x + w * 0.48},${y - h * 0.55}" stroke="${shade(col, -0.35)}" stroke-width="3" fill="none"/>` : '');
  };
  E.herbs = (x, y, len, col = '#5e6a3c', seed = 1) => { const r = rng(seed); let g = `<path d="M${x},${y} L${x},${y + len * 0.3}" stroke="#2a1c10" stroke-width="2"/>`; for (let i = 0; i < 12; i++) { const a = (r() - 0.5) * 0.7; g += `<path d="M${x},${f(y + len * 0.3)} l${f(Math.sin(a) * len)},${f(Math.cos(a) * len * 0.7)}" stroke="${shade(col, (r() - 0.5) * 0.4)}" stroke-width="${f(3 + r() * 3)}" stroke-linecap="round"/>`; } return g; };
  E.fire = (x, y, s, seed) => {
    const r = rng(seed); let g = '';
    for (let i = 0; i < 4; i++) g += `<path d="M${f(x - 70 * s + i * 40 * s)},${f(y + 6)} l${f(60 * s)},${f(-14 * s)}" stroke="#2a1a10" stroke-width="${f(16 * s)}" stroke-linecap="round"/>`;
    const layers = [['#a8300c', 1, 1], ['#e2541a', 0.82, 0.9], ['#f8902c', 0.62, 0.8], ['#ffd27a', 0.38, 0.6]];
    for (const [c, k, op] of layers) { for (let i = 0; i < 5; i++) { const fx = x + (r() - 0.5) * 80 * s * k, hh = (90 + r() * 120) * s * k, ww = (26 + r() * 16) * s * k, lean = (r() - 0.5) * 30 * s; g += `<path d="M${f(fx - ww)},${y} C${f(fx - ww)},${f(y - hh * 0.4)} ${f(fx + lean - ww * 0.3)},${f(y - hh * 0.7)} ${f(fx + lean)},${f(y - hh)} C${f(fx + lean + ww * 0.3)},${f(y - hh * 0.7)} ${f(fx + ww)},${f(y - hh * 0.4)} ${f(fx + ww)},${y}Z" fill="${c}" opacity="${op}"/>`; } }
    return `<g filter="url(#b1)">${g}</g>`;
  };
  E.straw = (x0, x1, y0, y1, n, seed, col = '#a08a58') => { const r = rng(seed); let g = ''; for (let i = 0; i < n; i++) { const x = x0 + (x1 - x0) * r(), y = y0 + (y1 - y0) * r(), l = 8 + r() * 22 * (0.4 + (y - y0) / (y1 - y0)), a = (r() - 0.5) * 3; g += `<path d="M${f(x)},${f(y)} l${f(Math.cos(a) * l)},${f(Math.sin(a) * l * 0.3)}" stroke="${shade(col, (r() - 0.5) * 0.5)}" stroke-width="${f(1 + r() * 1.5)}" opacity="0.7"/>`; } return g; };

  // leafless winter tree with recursive branches (optional snow along the top of branches)
  E.bareTree = (x, y, h, seed, col = '#141a26', snow = null) => {
    const r = rng(seed); let g = '';
    const branch = (x0, y0, ang, len, w, depth) => {
      const x1 = x0 + Math.cos(ang) * len, y1 = y0 + Math.sin(ang) * len, mx = (x0 + x1) / 2 + (r() - 0.5) * len * 0.15, my = (y0 + y1) / 2;
      g += `<path d="M${f(x0)},${f(y0)} Q${f(mx)},${f(my)} ${f(x1)},${f(y1)}" stroke="${col}" stroke-width="${f(w)}" stroke-linecap="round" fill="none"/>`;
      if (snow && w > 2.5 && Math.cos(ang) !== 0) g += `<path d="M${f(x0)},${f(y0 - w * 0.45)} Q${f(mx)},${f(my - w * 0.45)} ${f(x1)},${f(y1 - w * 0.45)}" stroke="${snow}" stroke-width="${f(w * 0.32)}" stroke-linecap="round" fill="none" opacity="0.75"/>`;
      if (depth <= 0 || len < 10) return;
      const n = 2 + (r() < 0.35 ? 1 : 0);
      for (let i = 0; i < n; i++) branch(x1, y1, ang + (i - (n - 1) / 2) * (0.5 + r() * 0.35) + (r() - 0.5) * 0.2, len * (0.62 + r() * 0.18), w * 0.6, depth - 1);
    };
    g += `<path d="M${f(x - h * 0.035)},${y} L${f(x - h * 0.02)},${f(y - h * 0.5)} L${f(x + h * 0.02)},${f(y - h * 0.5)} L${f(x + h * 0.035)},${y}Z" fill="${col}"/>`;
    branch(x, y - h * 0.48, -Math.PI / 2 + (r() - 0.5) * 0.15, h * 0.2, h * 0.04, 6);
    for (let i = 0; i < 3; i++) branch(x, y - h * (0.3 + i * 0.07), -Math.PI / 2 + (i % 2 ? 0.9 : -0.9), h * 0.12, h * 0.018, 4);
    return g;
  };
  E.puddle = (x, y, w, h, sky) => `<ellipse cx="${x}" cy="${y}" rx="${w}" ry="${h}" fill="${sky}" opacity="0.55"/><ellipse cx="${x}" cy="${y + h * 0.3}" rx="${w * 0.9}" ry="${h * 0.5}" fill="#000" opacity="0.15" filter="url(#b2)"/>`;
  E.fence = (x0, x1, y, h, seed, col = '#4a3a28') => { const r = rng(seed); let g = ''; for (let x = x0; x <= x1; x += 26 + r() * 8) g += `<path d="M${f(x)},${y} L${f(x + (r() - 0.5) * 4)},${f(y - h * (0.85 + r() * 0.3))}" stroke="${col}" stroke-width="5" stroke-linecap="round"/>`; for (let k = 0; k < 3; k++) g += `<path d="M${x0},${f(y - h * (0.25 + k * 0.22))} Q${(x0 + x1) / 2},${f(y - h * (0.28 + k * 0.22))} ${x1},${f(y - h * (0.24 + k * 0.22))}" stroke="${shade(col, 0.1)}" stroke-width="7" fill="none"/>`; return `<g filter="url(#woodH)">${g}</g>`; };

  G.ENV = E;
})(window);
