// Props for "The Cells That Never Died": the glass culture dish, test tubes and George Gey's roller drum, a 1950s
// microscope and its slide, the living cells (dying, glowing, dividing), a modern culture flask labelled HeLa, the
// school nurse's syringe, vials on a line, baby Joe in his blanket, the radio, the red nail polish, an incubator.
(function (G) {
  const P = G.PROPS, R = G.RIG, { f, uid, shade, mix, rng } = R;
  const TAU = Math.PI * 2;
  const olp = (w = 2) => `stroke="#20140c" stroke-width="${w}" stroke-linejoin="round"`;
  const glass = (id, tint = '#dfe9ee', op = 0.28) => `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${tint}" stop-opacity="${op * 1.6}"/><stop offset="0.3" stop-color="#ffffff" stop-opacity="${op * 0.6}"/><stop offset="0.7" stop-color="${tint}" stop-opacity="${op * 0.3}"/><stop offset="1" stop-color="${tint}" stop-opacity="${op * 1.8}"/></linearGradient>`;
  const MEDIUM = '#d66a7a';   // culture medium: warm pink

  // ======================================================= the glass culture dish (side view; (x,y) = base centre)
  // o.lid 0..1 (on), o.tissue 0..1 (a small dark-red piece lying in the pink medium), o.fill (medium level 0..1)
  P.cultureDish = (x, y, s, t, o = {}) => {
    const id = uid('cd'), w = 110, h = 34, lid = o.lid ?? 1, fill = o.fill ?? 0.7;
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><defs>${glass(id)}</defs>`;
    g += `<ellipse cx="0" cy="0" rx="${w}" ry="16" fill="#000" opacity="0.18" filter="url(#b4)"/>`;
    g += `<path d="M${-w},${-h} L${-w},-4 Q${-w},6 ${-w + 12},6 L${w - 12},6 Q${w},6 ${w},-4 L${w},${-h}" fill="url(#${id})" ${olp(1.6)}/>`;
    if (fill > 0.01) g += `<path d="M${-w + 4},${f(-h * fill)} L${w - 4},${f(-h * fill)} L${w - 4},-2 Q${w - 4},4 ${w - 14},4 L${-w + 14},4 Q${-w + 4},4 ${-w + 4},-2Z" fill="${MEDIUM}" opacity="0.62"/><ellipse cx="0" cy="${f(-h * fill)}" rx="${w - 4}" ry="5" fill="${shade(MEDIUM, 0.25)}" opacity="0.55"/>`;
    if ((o.tissue ?? 0) > 0.01) g += `<g opacity="${f(Math.min(1, o.tissue))}"><path d="M-16,-6 C-20,-18 -4,-24 10,-20 C22,-16 24,-6 14,-2 C4,2 -12,2 -16,-6Z" fill="#7a1e24" ${olp(1.2)}/><path d="M-6,-14 C0,-17 8,-16 12,-12" stroke="#c8606a" stroke-width="2" fill="none" opacity="0.7"/></g>`;
    g += `<path d="M${-w + 8},${-h + 4} L${-w + 8},-6" stroke="#fff" stroke-width="5" opacity="0.5" stroke-linecap="round"/>`;
    if (lid > 0.01) { const ly = -h - 4 - (1 - lid) * 60; g += `<g opacity="${f(Math.min(1, lid * 1.4))}"><path d="M${-w - 6},${f(ly)} L${-w - 6},${f(ly + 14)} L${w + 6},${f(ly + 14)} L${w + 6},${f(ly)}Z" fill="url(#${id})" ${olp(1.6)}/><path d="M${-w},${f(ly + 4)} L${w - 20},${f(ly + 4)}" stroke="#fff" stroke-width="3" opacity="0.55"/></g>`; }
    return g + '</g>';
  };
  // ======================================================= a test tube in a rack slot ((x,y) = bottom, rot deg); o.level, o.col,
  // o.label (text on a paper label), o.glow (the living culture glows faintly warm), o.dead (grey, cloudy)
  P.testTube = (x, y, s, rot = 0, o = {}) => {
    const id = uid('tt'), L = 180, w = 22, lev = o.level ?? 0.45, col = o.dead ? mix(MEDIUM, '#8a8a84', o.dead) : (o.col || MEDIUM);
    let g = `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)}) scale(${f(s)})"><defs>${glass(id)}</defs>`;
    g += `<path d="M${-w},${-L} L${-w},-${w} A${w},${w} 0 0 0 ${w},-${w} L${w},${-L}" fill="url(#${id})" ${olp(1.4)}/>`;
    g += `<path d="M${-w + 3},${f(-L * lev)} L${w - 3},${f(-L * lev)} L${w - 3},-${w} A${w - 3},${w - 3} 0 0 1 ${-w + 3},-${w}Z" fill="${col}" opacity="${o.dead ? 0.5 : 0.72}"/>`;
    if (o.glow) g += `<circle cx="0" cy="${f(-L * lev * 0.5)}" r="${f(w * 1.6)}" fill="#ffb0a0" opacity="${f(0.25 * o.glow)}" filter="url(#b4)"/>`;
    g += `<rect x="${-w - 4}" y="${-L - 26}" width="${(w + 4) * 2}" height="30" rx="6" fill="#e8e0c8" ${olp(1.4)}/><path d="M${-w + 4},${-L - 20} l${(w - 4) * 2},0" stroke="#fff" stroke-width="3" opacity="0.4"/>`;
    if (o.label) g += `<rect x="${-w + 1}" y="${f(-L * 0.86)}" width="${(w - 1) * 2}" height="44" fill="#f6f2e4" opacity="0.92" stroke="#8a8270" stroke-width="1"/><text x="0" y="${f(-L * 0.86 + 30)}" text-anchor="middle" font-family="'Segoe Script','Bradley Hand','Comic Sans MS',cursive" font-size="17" fill="#1a2a5a" transform="rotate(-90 0 ${f(-L * 0.86 + 22)})">${o.label}</text>`;
    g += `<path d="M${-w + 6},${-L + 10} L${-w + 6},-${w + 6}" stroke="#fff" stroke-width="4" opacity="0.45" stroke-linecap="round"/>`;
    return g + '</g>';
  };
  // ======================================================= George Gey's roller drum: a slowly turning wheel with test tubes
  // set round its rim like spokes ((x,y) = hub, r = radius); o.n tubes, o.glow 0..1 for the living ones (every k-th)
  P.rollerDrum = (x, y, s, t, o = {}) => {
    const id = uid('rd'), r = 300, n = o.n || 24, ang = t * 6;
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><defs><radialGradient id="${id}" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#b8bcbc"/><stop offset="1" stop-color="#5a5e60"/></radialGradient></defs>`;
    g += `<path d="M-40,${r + 140} L40,${r + 140} L22,40 L-22,40Z" fill="#3a3e40" ${olp(1.6)}/><rect x="-160" y="${r + 130}" width="320" height="40" rx="8" fill="#2e3234" ${olp(1.6)}/>`;
    g += `<g transform="rotate(${f(ang)})">`;
    for (let i = 0; i < n; i++) { const a = i / n * 360; g += `<g transform="rotate(${f(a)}) translate(0,${-r + 30})">${P.testTube(0, 0, 0.9, 180, { level: 0.5, glow: o.glow && i % (o.every || 3) === 0 ? o.glow : 0, dead: o.deadAll ? o.deadAll : 0 })}</g>`; }
    g += `<circle r="${r - 10}" fill="none" stroke="url(#${id})" stroke-width="26"/><circle r="${r - 60}" fill="none" stroke="url(#${id})" stroke-width="12"/>`;
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; g += `<path d="M${f(Math.cos(a) * 40)},${f(Math.sin(a) * 40)} L${f(Math.cos(a) * (r - 60))},${f(Math.sin(a) * (r - 60))}" stroke="#7a7e80" stroke-width="10"/>`; }
    g += `<circle r="48" fill="url(#${id})" ${olp(2)}/><circle r="14" fill="#2a2e30"/></g>`;
    return g + '</g>';
  };
  // ======================================================= a 1950s microscope (side view; (x,y) = base centre)
  P.microscope = (x, y, s, o = {}) => {
    const id = uid('ms');
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1a1a1c"/><stop offset="0.45" stop-color="#4a4a50"/><stop offset="1" stop-color="#121214"/></linearGradient><linearGradient id="${id}b" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7a5a20"/><stop offset="0.45" stop-color="#e8c870"/><stop offset="1" stop-color="#6a4a14"/></linearGradient></defs>`;
    g += `<path d="M-120,0 L120,0 L100,-36 L-60,-40Z" fill="url(#${id})" ${olp(1.6)}/><path d="M40,-38 C40,-120 70,-200 60,-300 L20,-300 C24,-200 0,-120 0,-38Z" fill="url(#${id})" ${olp(1.6)}/>`;
    g += `<rect x="-90" y="-130" width="150" height="16" rx="4" fill="url(#${id})" ${olp(1.4)}/><rect x="-60" y="-138" width="70" height="8" fill="#e8eef2" opacity="0.8" ${olp(1)}/>`;
    g += `<g transform="rotate(-18 -20 -300)"><rect x="-44" y="-430" width="48" height="200" rx="8" fill="url(#${id}b)" ${olp(1.6)}/><rect x="-36" y="-500" width="32" height="76" rx="6" fill="url(#${id})" ${olp(1.4)}/><rect x="-40" y="-512" width="40" height="16" rx="5" fill="#2a2a2e" ${olp(1)}/>`;
    g += `<rect x="-34" y="-236" width="28" height="40" rx="4" fill="url(#${id})" ${olp(1.2)}/><rect x="-28" y="-200" width="16" height="24" rx="3" fill="#c8c8cc" ${olp(1)}/></g>`;
    g += `<circle cx="72" cy="-210" r="22" fill="url(#${id})" ${olp(1.4)}/><circle cx="72" cy="-210" r="8" fill="#8a8a90"/><ellipse cx="-30" cy="-70" rx="26" ry="10" fill="#c8d8e8" opacity="0.7" ${olp(1)}/>`;
    return g + '</g>';
  };
  // ======================================================= cells under the microscope
  // one cell: an irregular soft blob with a nucleus; k = life (1 healthy pink, 0 dead grey and shrunken), phase = mitosis
  // 0..1 (the cell stretches, pinches and parts into two along axis a)
  const cellPath = (cx, cy, r, seed, wob, t) => {
    const rr = rng(seed), N = 12; let d = '';
    const ph = rr() * TAU;
    for (let i = 0; i <= N; i++) {
      const a = i / N * TAU, k = 1 + wob * (0.18 * Math.sin(a * 3 + ph + t * 0.8) + 0.1 * Math.sin(a * 5 - ph * 2 + t * 1.3)) + (rr() - 0.5) * 0.08 * wob;
      d += (i ? ' L' : 'M') + f(cx + Math.cos(a) * r * k) + ',' + f(cy + Math.sin(a) * r * k);
    }
    return d + 'Z';
  };
  P.cell = (cx, cy, r, t, o = {}) => {
    const seed = o.seed || 1, life = o.life ?? 1, glow = o.glow || 0, ph = o.phase || 0, a = o.axis || 0;
    const cyto = mix('#8a8680', '#e48aa0', life), nuc = mix('#4a4846', '#7a3a8a', life), rr = r * (0.72 + 0.28 * life);
    let g = '';
    const blob = (x, y, rad, sd) => `<path d="${cellPath(x, y, rad, sd, 0.4 + 0.6 * life, t)}" fill="${cyto}" fill-opacity="${f(0.55 + 0.25 * life)}" stroke="${shade(cyto, -0.35)}" stroke-width="2"/>` +
      `<ellipse cx="${f(x - rad * 0.08)}" cy="${f(y - rad * 0.06)}" rx="${f(rad * 0.34)}" ry="${f(rad * 0.28)}" fill="${nuc}" opacity="${f(0.6 + 0.3 * life)}"/><circle cx="${f(x - rad * 0.12)}" cy="${f(y - rad * 0.1)}" r="${f(rad * 0.07)}" fill="${shade(nuc, -0.3)}"/>`;
    if (ph < 0.02) g += blob(cx, cy, rr, seed);
    else {
      // mitosis: stretch, a waist, then two daughters drifting apart
      const d = r * 0.9 * Math.min(1, ph * 1.3), ax = Math.cos(a), ay = Math.sin(a), sh = 1 - 0.25 * Math.sin(Math.PI * Math.min(1, ph));
      const p1 = [cx - ax * d * 0.5, cy - ay * d * 0.5], p2 = [cx + ax * d * 0.5, cy + ay * d * 0.5];
      if (ph < 0.55) g += `<path d="M${f(p1[0])},${f(p1[1])} L${f(p2[0])},${f(p2[1])}" stroke="${cyto}" stroke-opacity="0.7" stroke-width="${f(rr * 1.2 * (1 - ph * 1.6))}" stroke-linecap="round"/>`;
      g += blob(p1[0], p1[1], rr * sh, seed) + blob(p2[0], p2[1], rr * sh, seed + 7);
    }
    if (glow > 0.01) g = `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 2.2)}" fill="#ffb0c0" opacity="${f(0.35 * glow)}" filter="url(#b8)"/>` + g;
    if (life < 0.4) { const r2 = rng(seed + 3); for (let i = 0; i < 6; i++) { const aa = r2() * TAU, dd = r * (0.9 + r2() * 0.9 * (1 - life)); g += `<circle cx="${f(cx + Math.cos(aa) * dd)}" cy="${f(cy + Math.sin(aa) * dd)}" r="${f(3 + r2() * 5)}" fill="#5a5854" opacity="${f(0.6 * (1 - life))}"/>`; } }
    return g;
  };
  // a whole field of cells that double: generation tree laid out from the centre; L = generations so far (fraction =
  // the mitosis in progress), R = field radius
  // continuous across generations: while a cell divides (q 0..1) its two daughters slide from its centre to their own
  // places in the next generation and shrink to their size, and the parent's outline fades out over them in the first
  // quarter; at q = 1 the picture is exactly the next generation at rest, so nothing jumps when L passes an integer
  P.doublingCells = (cx, cy, R, t, L, o = {}) => {
    const g0 = Math.min(8, Math.floor(L)), q = Math.min(1, Math.max(0, ((L - g0) - 0.12) / 0.76)), e = q * q * (3 - 2 * q), r0 = o.r0 || 70;
    const tree = [[[cx, cy]]];
    for (let gN = 1; gN <= g0 + 1; gN++) {
      const prev = tree[gN - 1], cur = [], rr = rng(100 + gN), step = r0 * 1.25 * Math.pow(0.86, gN);
      prev.forEach((p, i) => { const a = rr() * TAU + i; cur.push([p[0] - Math.cos(a) * step, p[1] - Math.sin(a) * step], [p[0] + Math.cos(a) * step, p[1] + Math.sin(a) * step]); });
      cur.forEach(p => { const dx = p[0] - cx, dy = p[1] - cy, d = Math.hypot(dx, dy), lim = R - r0 * 0.5; if (d > lim) { p[0] = cx + dx / d * lim; p[1] = cy + dy / d * lim; } });
      tree.push(cur);
    }
    const rad = gN => r0 * Math.pow(0.9, gN), sd = (gN, i) => 1 + i * 13 + gN * 101, gl = o.glow || 0;
    let g = '';
    tree[g0].forEach((p, i) => {
      const c1 = tree[g0 + 1][i * 2], c2 = tree[g0 + 1][i * 2 + 1], a1 = [p[0] + (c1[0] - p[0]) * e, p[1] + (c1[1] - p[1]) * e], a2 = [p[0] + (c2[0] - p[0]) * e, p[1] + (c2[1] - p[1]) * e];
      const rr = rad(g0) + (rad(g0 + 1) - rad(g0)) * e, rd = rr * (0.86 + 0.14 * e);
      if (q > 0.02 && q < 0.7) g += `<path d="M${f(a1[0])},${f(a1[1])} L${f(a2[0])},${f(a2[1])}" stroke="#e48aa0" stroke-opacity="${f(0.7 * Math.min(1, q / 0.15))}" stroke-width="${f(rr * 1.1 * (1 - q / 0.7))}" stroke-linecap="round"/>`;
      const kids = P.cell(a1[0], a1[1], rd, t, { seed: sd(g0 + 1, i * 2), life: 1, glow: gl }) + P.cell(a2[0], a2[1], rd, t, { seed: sd(g0 + 1, i * 2 + 1), life: 1, glow: gl });
      g += q < 0.1 ? `<g opacity="${f(q / 0.1)}">${kids}</g>` : kids;
      if (q < 0.25) g += `<g opacity="${f(1 - q / 0.25)}">${P.cell(p[0], p[1], rad(g0), t, { seed: sd(g0, i), life: 1, glow: gl })}</g>`;
    });
    return g;
  };
  P.doublingCellsOld = (cx, cy, R, t, L, o = {}) => {
    const maxG = Math.min(9, Math.floor(L)), ph = L - Math.floor(L), r0 = o.r0 || 70;
    // positions of every cell in generation gN (deterministic tree)
    const tree = [[[cx, cy]]];
    for (let gN = 1; gN <= maxG + 1; gN++) {
      const prev = tree[gN - 1], cur = [], rr = rng(100 + gN), step = r0 * 1.25 * Math.pow(0.86, gN);
      prev.forEach((p, i) => { const a = rr() * TAU + i; cur.push([p[0] - Math.cos(a) * step, p[1] - Math.sin(a) * step], [p[0] + Math.cos(a) * step, p[1] + Math.sin(a) * step]); });
      // keep them inside the field
      cur.forEach(p => { const dx = p[0] - cx, dy = p[1] - cy, d = Math.hypot(dx, dy), lim = R - r0 * 0.5; if (d > lim) { p[0] = cx + dx / d * lim; p[1] = cy + dy / d * lim; } });
      tree.push(cur);
    }
    const gen = tree[maxG], rad = r0 * Math.pow(0.9, maxG), rr2 = rng(77);
    let g = '';
    gen.forEach((p, i) => {
      const nxt = tree[maxG + 1], c1 = nxt[i * 2], c2 = nxt[i * 2 + 1], a = Math.atan2(c2[1] - c1[1], c2[0] - c1[0]);
      const mid = [(c1[0] + c2[0]) / 2, (c1[1] + c2[1]) / 2], q = ph < 0.25 ? 0 : (ph - 0.25) / 0.75;
      const pos = [p[0] + (mid[0] - p[0]) * q, p[1] + (mid[1] - p[1]) * q];
      g += P.cell(pos[0], pos[1], rad, t, { seed: 1 + i * 13 + maxG * 101, life: 1, phase: q, axis: a, glow: o.glow || 0 });
    });
    return g;
  };
  // ======================================================= a modern culture flask (T-75: a tilted neck and a vented cap;
  // (x,y) = bottom centre, rot deg); o.label text (hand-written), o.level
  P.flask = (x, y, s, rot = 0, o = {}) => {
    const id = uid('fk'), lev = o.level ?? 0.32;
    let g = `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)}) scale(${f(s)})"><defs>${glass(id, '#e8f0f4', 0.34)}<clipPath id="${id}c"><path d="M-110,0 L-110,-200 L60,-200 L110,-150 L110,0Z"/></clipPath></defs>`;
    g += `<ellipse cx="0" cy="4" rx="120" ry="12" fill="#000" opacity="0.2" filter="url(#b4)"/>`;
    g += `<g clip-path="url(#${id}c)"><rect x="-110" y="${f(-200 * lev)}" width="220" height="${f(200 * lev)}" fill="${MEDIUM}" opacity="0.8"/><path d="M-110,${f(-200 * lev)} L110,${f(-200 * lev)}" stroke="${shade(MEDIUM, 0.3)}" stroke-width="5" opacity="0.6"/></g>`;
    g += `<path d="M-110,0 L-110,-200 L60,-200 L110,-150 L110,0Z" fill="url(#${id})" ${olp(2)}/>`;
    g += `<path d="M60,-200 L70,-226 L118,-206 L110,-150" fill="url(#${id})" ${olp(1.6)}/><path d="M64,-222 L74,-252 L134,-228 L120,-204Z" fill="#e6e2d8" ${olp(1.6)}/><path d="M72,-246 L128,-226" stroke="#b8b4aa" stroke-width="3"/>`;
    for (let i = 0; i < 5; i++) g += `<path d="M${-100 + i * 6},-188 L${100 - i * 4},-188" stroke="#fff" stroke-width="1" opacity="0.15"/>`;
    if (o.label) g += `<rect x="-96" y="-182" width="132" height="70" rx="3" fill="#fbf9f2" opacity="0.96" stroke="#9a9484" stroke-width="1.5"/><text x="-30" y="-134" text-anchor="middle" font-family="'Segoe Script','Bradley Hand','Ink Free',cursive" font-size="40" font-weight="bold" fill="#1a2a6a">${o.label}</text>`;
    g += `<path d="M-100,-186 L-100,-12" stroke="#fff" stroke-width="5" opacity="0.35" stroke-linecap="round"/>`;
    return g + '</g>';
  };
  // ======================================================= a glass syringe (grip frame: needle along +x... held like a pen)
  P.syringe = (k = 1) => `<g transform="scale(${f(k)})"><rect x="-150" y="-12" width="190" height="24" rx="5" fill="#eef4f6" fill-opacity="0.55" ${olp(1.4)}/><rect x="-140" y="-8" width="150" height="16" fill="#e8a0a8" opacity="0.55"/>` +
    `<path d="M40,-6 L62,-3 L62,3 L40,6Z" fill="#c8c8cc" ${olp(1.2)}/><path d="M62,0 L150,0" stroke="#b8b8bc" stroke-width="3"/><rect x="-196" y="-6" width="50" height="12" fill="#d8d8dc" ${olp(1.2)}/><rect x="-204" y="-20" width="10" height="40" rx="3" fill="#d8d8dc" ${olp(1.2)}/>` +
    `<path d="M-120,-12 L-120,-4 M-90,-12 L-90,-4 M-60,-12 L-60,-4 M-30,-12 L-30,-4" stroke="#6a6a70" stroke-width="2"/></g>`;
  // ======================================================= a small glass vial with an aluminium cap ((x,y) = base)
  P.vial = (x, y, s, o = {}) => `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><rect x="-22" y="-80" width="44" height="80" rx="8" fill="#eef4f6" fill-opacity="0.4" ${olp(1.4)}/><rect x="-19" y="-46" width="38" height="44" rx="6" fill="${o.col || MEDIUM}" opacity="0.75"/>` +
    `<rect x="-16" y="-96" width="32" height="18" fill="#c8ccd0" ${olp(1.2)}/><rect x="-20" y="-104" width="40" height="12" rx="3" fill="${o.cap || '#b8323a'}" ${olp(1.2)}/><path d="M-14,-74 L-14,-10" stroke="#fff" stroke-width="4" opacity="0.45" stroke-linecap="round"/>` +
    (o.label ? `<rect x="-20" y="-60" width="40" height="22" fill="#f8f6ee"/><path d="M-14,-52 l28,0 M-14,-44 l20,0" stroke="#5a6a8a" stroke-width="3"/>` : '') + `</g>`;
  // ======================================================= baby Joe asleep in a blanket ((x,y) = centre); o.awake, o.cry
  P.baby = (x, y, s, t, o = {}) => {
    const id = uid('bb'), br = Math.sin(t * 2.4) * 2, skin = '#7a4e34';
    let g = `<g transform="translate(${f(x)},${f(y)}) rotate(${f(o.rot || -12)}) scale(${f(s)})"><defs><radialGradient id="${id}" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#f6f2ea"/><stop offset="1" stop-color="#cfc6b6"/></radialGradient><radialGradient id="${id}f" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="${shade(skin, 0.12)}"/><stop offset="1" stop-color="${shade(skin, -0.16)}"/></radialGradient></defs>`;
    g += `<path d="M-150,${f(30 + br)} C-160,-40 -110,-96 -40,-100 C40,-104 150,-70 160,0 C164,60 110,${f(96 + br)} 0,${f(98 + br)} C-90,${f(96 + br)} -144,80 -150,${f(30 + br)}Z" fill="url(#${id})" ${olp(2)}/>`;
    for (let i = 0; i < 5; i++) g += `<path d="M${-120 + i * 50},${-60 + i * 8} C${-90 + i * 50},0 ${-80 + i * 50},40 ${-100 + i * 50},80" stroke="#bdb2a0" stroke-width="3" fill="none" opacity="0.6"/>`;
    g += `<path d="M-140,-10 C-120,-80 -30,-96 20,-70 C-30,-60 -90,-30 -140,-10Z" fill="#e8c8cc" ${olp(1.4)}/>`;
    g += `<ellipse cx="-76" cy="-30" rx="54" ry="50" fill="url(#${id}f)" ${olp(1.6)}/><path d="M-118,-56 C-100,-86 -60,-88 -36,-66" stroke="#2a1a12" stroke-width="10" fill="none" stroke-linecap="round"/>`;
    if (o.cry) g += `<path d="M-100,-36 q10,-6 18,0 M-66,-36 q10,-6 18,0" stroke="#2a1a12" stroke-width="3.5" fill="none"/><ellipse cx="-74" cy="-6" rx="${f(9 + 3 * Math.sin(t * 9))}" ry="${f(8 + 2 * Math.sin(t * 9))}" fill="#4a1e1e"/>`;
    else g += `<path d="M-100,-34 q9,6 18,0 M-66,-34 q9,6 18,0" stroke="#2a1a12" stroke-width="3" fill="none"/><path d="M-82,-8 q8,4 16,0" stroke="#5a2e22" stroke-width="3" fill="none"/>`;
    g += `<ellipse cx="-104" cy="-14" rx="10" ry="6" fill="#c86a5a" opacity="0.25"/><ellipse cx="-46" cy="-14" rx="10" ry="6" fill="#c86a5a" opacity="0.25"/>`;
    g += `<path d="M-20,16 C-10,6 10,6 16,18 C10,28 -10,30 -20,16Z" fill="url(#${id}f)" ${olp(1.4)}/>`;
    return g + '</g>';
  };
  // ======================================================= a 1950s table radio ((x,y) = base centre)
  P.radio50 = (x, y, s, t, on = 1) => {
    const id = uid('rr');
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a5a32"/><stop offset="1" stop-color="#4a2a14"/></linearGradient></defs>`;
    g += `<path d="M-130,0 L130,0 L130,-150 C130,-190 90,-200 0,-200 C-90,-200 -130,-190 -130,-150Z" fill="url(#${id})" ${olp(2)}/><rect x="-110" y="-170" width="140" height="130" rx="10" fill="#d8c8a0" ${olp(1.6)}/>`;
    for (let i = 0; i < 7; i++) g += `<path d="M-104,${-160 + i * 18} L24,${-160 + i * 18}" stroke="#8a7a5a" stroke-width="3"/>`;
    g += `<rect x="46" y="-170" width="64" height="40" rx="5" fill="${on > 0.5 ? '#f0c870' : '#7a6a40'}" ${olp(1.4)}/><path d="M${f(56 + ((t * 3) % 1) * 0)},-152 l40,0" stroke="#5a3a14" stroke-width="2"/><circle cx="62" cy="-80" r="18" fill="#3a2a1a" ${olp(1.4)}/><circle cx="96" cy="-80" r="18" fill="#3a2a1a" ${olp(1.4)}/>`;
    return g + '</g>' + (on > 0.5 ? G.CINE.bloom(x + 78 * s, y - 150 * s, 50 * s, '#ffc860', 0.4) : '');
  };
  // ======================================================= a little bottle of red nail polish ((x,y) = base)
  P.nailPolish = (x, y, s) => `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><path d="M-26,0 L26,0 L30,-50 C30,-62 -30,-62 -30,-50Z" fill="#b8141e" ${olp(1.6)}/><path d="M-20,-12 L-22,-46" stroke="#ff8a8a" stroke-width="4" opacity="0.6" stroke-linecap="round"/>` +
    `<rect x="-10" y="-112" width="20" height="56" rx="4" fill="#1a1a1c" ${olp(1.4)}/><rect x="-6" y="-108" width="5" height="44" fill="#4a4a50"/></g>`;
  // ======================================================= a modern CO2 incubator ((x,y) = foot centre); o.open 0..1 door
  P.incubator = (x, y, s, t, o = {}) => {
    const id = uid('ic'), W = 300, H = 420, open = o.open || 0;
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d8dcde"/><stop offset="0.5" stop-color="#f2f4f4"/><stop offset="1" stop-color="#c4c8ca"/></linearGradient></defs>`;
    g += `<rect x="${-W / 2}" y="${-H}" width="${W}" height="${H}" rx="10" fill="url(#${id})" ${olp(2)}/>`;
    g += `<rect x="${-W / 2 + 20}" y="${-H + 60}" width="${W - 40}" height="${H - 80}" fill="#c8d0d4" ${olp(1.4)}/>`;
    for (let k = 0; k < 3; k++) { const sy = -H + 150 + k * 110; g += `<path d="M${-W / 2 + 24},${sy} L${W / 2 - 24},${sy}" stroke="#9aa2a6" stroke-width="5"/>`; for (let i = 0; i < 3; i++) g += P.flask(-80 + i * 80, sy - 4, 0.3, 0, { level: 0.32 }); }
    g += C_light(-W / 2 + 20, -H + 60, W - 40, H - 80, 0.2);
    g += `<rect x="${-W / 2 + 30}" y="${-H + 16}" width="120" height="30" rx="4" fill="#1a2a2a" ${olp(1)}/><text x="${-W / 2 + 44}" y="${-H + 38}" font-family="Consolas,monospace" font-size="20" fill="#5ae0a0">37.0°C</text><circle cx="${W / 2 - 40}" cy="${-H + 31}" r="8" fill="#5ae0a0"/>`;
    // the glass door swings toward us (it narrows as it opens)
    const dw = (W - 30) * Math.cos(open * Math.PI * 0.45);
    g += `<rect x="${-W / 2 + 15}" y="${-H + 54}" width="${f(dw)}" height="${H - 70}" fill="#e8f2f6" fill-opacity="${f(0.22 + 0.2 * open)}" ${olp(1.6)}/><path d="M${f(-W / 2 + 30)},${-H + 70} l${f(dw * 0.3)},${H - 110}" stroke="#fff" stroke-width="6" opacity="0.25"/><rect x="${f(-W / 2 + 15 + dw - 26)}" y="${-H + 200}" width="12" height="80" rx="5" fill="#9aa0a4"/>`;
    return g + '</g>';
  };
  const C_light = (x, y, w, h, op) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff8e8" opacity="${op}"/>`;
  P.MEDIUM = MEDIUM;
})(window);
