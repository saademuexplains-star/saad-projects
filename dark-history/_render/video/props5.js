// Props for "The Leech Collector": medicinal leeches, the glass leech jar, counter dressing.
(function (G) {
  const { f, shade, mix, rng, uid, OUT, ol } = G.RIG, C = G.CINE;
  const P = G.PROPS;
  const LG = (id, stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a !== undefined ? ` stop-opacity="${a}"` : ''}/>`).join('')}</linearGradient>`;

  // ---------------- a medicinal leech along a polyline from the front sucker (pts[0]) to the rear sucker (last point).
  // w = thickest width; o.fat 0..1 engorged with blood; o.stretch 0..1 thins the front half; o.op opacity
  P.leech = (pts, w, o = {}) => {
    if (pts.length < 2) return '';
    const n = pts.length, fat = o.fat || 0, st = o.stretch || 0;
    // body profile: narrower head, widest in the rear third, broad rounded tail with the rear sucker
    const prof = u => { const base = 0.5 + 0.5 * Math.sin(Math.PI * Math.min(1, u / 1.3)); return base * (1 + fat * 0.45 * Math.sin(Math.PI * u)) * (1 - st * 0.6 * (1 - u) * (1 - u)); };
    const L = [], R = [], mid = [];
    for (let i = 0; i < n; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], k = Math.hypot(dx, dy) || 1, nx = -dy / k, ny = dx / k;
      const r = w * 0.5 * prof(i / (n - 1));
      L.push([pts[i][0] + nx * r, pts[i][1] + ny * r]); R.push([pts[i][0] - nx * r, pts[i][1] - ny * r]); mid.push([nx, ny, r]);
    }
    const P0 = pts[0], P1 = pts[n - 1], r0 = mid[0][2], r1 = mid[n - 1][2];
    let d = `M${f(L[0][0])},${f(L[0][1])}`;
    for (let i = 1; i < n; i++) d += ` L${f(L[i][0])},${f(L[i][1])}`;
    // round caps: both arcs bulge outward (sweep 0 with this winding)
    d += ` A${f(r1)},${f(r1)} 0 0 0 ${f(R[n - 1][0])},${f(R[n - 1][1])}`;
    for (let i = n - 2; i >= 0; i--) d += ` L${f(R[i][0])},${f(R[i][1])}`;
    d += ` A${f(r0)},${f(r0)} 0 0 0 ${f(L[0][0])},${f(L[0][1])}Z`;
    const line = k => { let s = ''; for (let i = 0; i < n; i++) { const [nx, ny, r] = mid[i]; s += `${i ? 'L' : 'M'}${f(pts[i][0] + nx * r * k)},${f(pts[i][1] + ny * r * k)} `; } return s; };
    const base = mix('#2e3218', '#3a1410', fat * 0.55), id = uid('lc'), sw = k => f(Math.max(0.8, w * k));
    let g = `<defs><clipPath id="${id}"><path d="${d}"/></clipPath></defs><path d="${d}" fill="${base}" ${ol(Math.max(1, w * 0.06))}/>`;
    let inner = `<path d="${line(-0.6)}" stroke="${shade(base, -0.5)}" stroke-width="${sw(0.42)}" fill="none" opacity="0.75"/>`;   // shaded belly side
    inner += `<path d="${line(0.05)}" stroke="${mix(base, '#7a8040', 0.45)}" stroke-width="${sw(0.34)}" fill="none" opacity="0.7"/>`;    // lighter olive back
    inner += `<path d="${line(0.42)}" stroke="#c4743a" stroke-width="${sw(0.07)}" fill="none" opacity="0.8"/><path d="${line(-0.3)}" stroke="#b0602a" stroke-width="${sw(0.06)}" fill="none" opacity="0.65"/>`;
    // faint annulations
    for (let i = 2; i < n - 1; i += 2) { const [nx, ny, r] = mid[i]; inner += `<path d="M${f(pts[i][0] + nx * r)},${f(pts[i][1] + ny * r)} L${f(pts[i][0] - nx * r)},${f(pts[i][1] - ny * r)}" stroke="#0a0a04" stroke-width="${sw(0.03)}" opacity="0.14"/>`; }
    // wet highlight
    inner += `<path d="${line(0.6)}" stroke="#f4f0d8" stroke-width="${sw(0.09)}" fill="none" opacity="0.5" stroke-linecap="round"/>`;
    g += `<g clip-path="url(#${id})">${inner}</g>`;
    // rear sucker: a slightly darker rim on the tail
    g += `<circle cx="${f(P1[0])}" cy="${f(P1[1])}" r="${f(r1 * 0.6)}" fill="${shade(base, -0.2)}" opacity="0.8"/>`;
    return o.op !== undefined && o.op < 1 ? `<g opacity="${f(o.op)}">${g}</g>` : g;
  };
  // a swimming leech: undulating ribbon of length len, head at (x,y) heading along angle ang (deg). 13 points, head first.
  P.leechSwimPts = (x, y, len, ang, t, ph = 0) => {
    const a = ang * Math.PI / 180, ux = Math.cos(a), uy = Math.sin(a), pts = [];
    for (let i = 0; i <= 12; i++) { const u = i / 12, wv = Math.sin(t * 9 + ph - u * 6.5) * len * 0.09 * (0.3 + u); pts.push([x - ux * len * u - uy * wv, y - uy * len * u + ux * wv]); }
    return pts;
  };
  P.leechSwim = (x, y, len, w, ang, t, ph = 0, o = {}) => P.leech(P.leechSwimPts(x, y, len, ang, t, ph), w, o);
  // a latched leech: front sucker fixed at (x,y), body hanging along angle ang (deg, 90 = straight down), slow pulsing. 13 points.
  P.leechHangPts = (x, y, len, ang, t, ph = 0, curl = 0.25) => {
    const a = ang * Math.PI / 180, ux = Math.cos(a), uy = Math.sin(a), pts = [], pulse = 1 + Math.sin(t * 3.2 + ph) * 0.06;
    for (let i = 0; i <= 12; i++) { const u = i / 12, wv = Math.sin(u * Math.PI) * len * curl * 0.3 * Math.sin(ph + t * 0.8) + u * u * len * curl * 0.25; pts.push([x + ux * len * u * pulse - uy * wv, y + uy * len * u * pulse + ux * wv]); }
    return pts;
  };
  P.leechHang = (x, y, len, w, ang, t, ph = 0, o = {}) => P.leech(P.leechHangPts(x, y, len, ang, t, ph, o.curl ?? 0.25), w, o);
  // the bite: a tiny three-pointed mark with a bead of blood that runs downward (k 0..1)
  P.bite = (x, y, s, k = 1) => {
    if (k <= 0) return '';
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><path d="M0,0 L0,-7 M0,0 L-6,4 M0,0 L6,4" stroke="#6a0c0a" stroke-width="2.4" stroke-linecap="round"/>`;
    const run = Math.min(1, k * 1.4);
    g += `<path d="M0,2 C1,${f(10 + run * 20)} -1,${f(20 + run * 34)} 0,${f(8 + run * 52)}" stroke="#8a0c0c" stroke-width="${f(5 + run * 1.5)}" fill="none" stroke-linecap="round" opacity="${f(Math.min(1, k * 3))}"/>`;
    g += `<circle cx="0" cy="${f(8 + run * 52)}" r="${f(3.4 + run * 1.6)}" fill="#a01010" opacity="${f(Math.min(1, k * 3))}"/><circle cx="-1" cy="${f(6 + run * 52)}" r="1.2" fill="#ffd0c0" opacity="${f(0.6 * Math.min(1, k * 3))}"/></g>`;
    return g;
  };

  // ---------------- the glass leech jar on the counter: bottom centre (x,y), s scale. Leeches swim inside.
  // A muslin cloth tied over the mouth (leech jars were kept covered so they could not crawl out).
  P.leechJar = (x, y, s, t, o = {}) => {
    const id = uid('lj'), w = 190, h = 300, n = o.n ?? 7;
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><defs>${LG(id + 'w', [[0, '#5a6a44', 0.85], [1, '#2a3418', 0.95]])}${LG(id + 'g', [[0, '#ffffff', 0.25], [0.2, '#ffffff', 0.05], [0.8, '#ffffff', 0.02], [1, '#ffffff', 0.2]], 0, 0, 1, 0)}<clipPath id="${id}c"><path d="M${-w / 2 + 8},-26 L${w / 2 - 8},-26 L${w / 2 - 8},${-h + 70} L${-w / 2 + 8},${-h + 70}Z"/></clipPath></defs>`;
    g += `<ellipse cx="0" cy="4" rx="${w * 0.62}" ry="16" fill="#000" opacity="0.45" filter="url(#b8)"/>`;
    // water and the leeches inside
    let inside = `<rect x="${-w}" y="${-h}" width="${w * 2}" height="${h}" fill="url(#${id}w)"/>`;
    const r = rng(o.seed || 41);
    for (let i = 0; i < n; i++) {
      const bx = (r() - 0.5) * (w - 60), by = -50 - r() * (h - 140), ph = r() * 6.28, sp = 0.5 + r() * 0.6;
      const xx = bx + Math.sin(t * sp + ph) * 30, yy = by + Math.cos(t * sp * 0.8 + ph) * 22, ang = Math.sin(t * sp + ph) > 0 ? 10 + Math.sin(t + ph) * 25 : 190 + Math.sin(t + ph) * 25;
      inside += P.leechSwim(xx, yy, 62 + r() * 24, 14 + r() * 4, ang, t, ph);
    }
    for (let i = 0; i < 10; i++) { const ph = ((t * 0.3 + i / 10) % 1); inside += `<circle cx="${f((r() - 0.5) * w * 0.8)}" cy="${f(-30 - ph * (h - 100))}" r="${f(2 + r() * 3)}" fill="none" stroke="#e0f0d0" stroke-width="1.2" opacity="${f(0.5 * (1 - ph))}"/>`; }
    g += `<g clip-path="url(#${id}c)">${inside}</g>`;
    // glass body: walls, base, shoulder, neck
    g += `<path d="M${-w / 2},-10 Q${-w / 2},0 ${-w / 2 + 14},0 L${w / 2 - 14},0 Q${w / 2},0 ${w / 2},-10 L${w / 2},${-h + 60} Q${w / 2},${-h + 30} ${w / 2 - 40},${-h + 22} L${w / 2 - 40},${-h} L${-w / 2 + 40},${-h} L${-w / 2 + 40},${-h + 22} Q${-w / 2},${-h + 30} ${-w / 2},${-h + 60}Z" fill="url(#${id}g)" stroke="#1a2014" stroke-width="2.4"/>`;
    g += `<path d="M${-w / 2 + 16},-24 L${-w / 2 + 16},${-h + 70}" stroke="#ffffff" stroke-width="8" opacity="0.28" stroke-linecap="round"/><path d="M${w / 2 - 22},-40 L${w / 2 - 22},${-h + 90}" stroke="#ffffff" stroke-width="3" opacity="0.2"/>`;
    g += `<ellipse cx="0" cy="${-h + 72}" rx="${w / 2 - 10}" ry="8" fill="#9ab07a" opacity="0.35"/>`;   // water surface line
    // cloth cover tied with string
    g += `<path d="M${-w / 2 + 30},${-h + 4} C${-w / 2 + 20},${-h - 34} ${w / 2 - 20},${-h - 34} ${w / 2 - 30},${-h + 4} L${w / 2 - 22},${-h + 30} Q0,${-h + 40} ${-w / 2 + 22},${-h + 30}Z" fill="#d8ccb0" filter="url(#cloth)" ${ol(1.4)}/>`;
    g += `<path d="M${-w / 2 + 34},${-h + 14} Q0,${-h + 22} ${w / 2 - 34},${-h + 14}" stroke="#6a4a2a" stroke-width="5" fill="none"/><path d="M${w / 2 - 40},${-h + 16} q8,16 -2,30 M${w / 2 - 40},${-h + 16} q14,10 12,26" stroke="#6a4a2a" stroke-width="3" fill="none"/>`;
    return g + `</g>`;
  };

  // a stone mortar with a pestle, bottom centre (x,y)
  P.mortar = (x, y, s) => `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><ellipse cx="0" cy="2" rx="80" ry="12" fill="#000" opacity="0.4" filter="url(#b4)"/><path d="M-74,-70 Q-70,0 -40,0 L40,0 Q70,0 74,-70Z" fill="#8a8478" ${ol(1.6)}/><ellipse cx="0" cy="-70" rx="74" ry="16" fill="#5a564e" ${ol(1.4)}/><path d="M-10,-74 L46,-170" stroke="#3a2e22" stroke-width="20" stroke-linecap="round"/><path d="M-10,-74 L46,-170" stroke="#7a6a54" stroke-width="13" stroke-linecap="round"/><path d="M-60,-56 Q-58,-20 -36,-12" stroke="#fff" stroke-width="4" opacity="0.2" fill="none"/></g>`;
  // a small glass medicine bottle, bottom centre (x,y)
  P.bottle = (x, y, s, col = '#3a5a3a') => `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><path d="M-30,0 L30,0 L30,-90 Q30,-110 12,-116 L12,-140 L-12,-140 L-12,-116 Q-30,-110 -30,-90Z" fill="${col}" opacity="0.9" ${ol(1.4)}/><rect x="-14" y="-156" width="28" height="18" rx="3" fill="#8a6a44" ${ol(1)}/><path d="M-20,-14 L-20,-86" stroke="#fff" stroke-width="5" opacity="0.25" stroke-linecap="round"/></g>`;
})(window);
