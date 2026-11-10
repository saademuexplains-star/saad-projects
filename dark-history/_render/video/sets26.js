// The Radium Girls sets (2026-11-09): the dial-painting studio of the radium company, Orange, New Jersey, 1917 - by
// day (tall windows, long tables of girls at the dials) and with the lights off (only the radium glows); the
// cemetery at night, 1927. Props: a watch dial with luminous numerals, the paint pot of "Undark", the fine brush.
// The radium glow is the one cold colour in the film: a pale yellow-green (#b8ff8a .. #7ad66a), never a saturated
// blue; everything else keeps the warm house palette.
(function (G) {
  const S = G.SETS, C = G.CINE, { f, rng, ol, shade, mix } = G.RIG, lg = S.lg, TXT = S.TXT;
  const GLOW = '#b8ff8a', GLOW2 = '#7ad66a';
  S.GLOW = GLOW;
  // a soft luminous blob (screen-blended): the radium's own light
  const glow = (x, y, r, op, col = GLOW) => C.radial(x, y, r, col, op);
  S.radGlow = glow;

  // the radium's own light on a lit figure: the figure's raw drawing passed through a filter that keeps only what is
  // painted in the glow colours (teeth, nails, numerals, a dress), sharp and bloomed, screened over the lit figure - so
  // the paint stays bright in the dark while the light pass darkens everything else. S.EMIS once per frame.
  S.EMIS = `<defs><filter id="rdEmis" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  -3 4.5 -1.5 1 -1.3" result="e"/><feGaussianBlur in="e" stdDeviation="6" result="b"/><feGaussianBlur in="e" stdDeviation="20" result="b2"/><feMerge><feMergeNode in="b2"/><feMergeNode in="b"/><feMergeNode in="e"/></feMerge></filter></defs>`;
  S.emissive = svg => `<g filter="url(#rdEmis)" style="mix-blend-mode:screen">${svg}</g>`;

  // ======================================================= props
  // a watch dial (face-on): white enamel, a fine minute track, the twelve numerals painted in luminous paint (n of them
  // done so far; lum 0..1 how much they glow), the two hands; r = radius
  S.dial = (x, y, r, n = 12, lum = 0.3, o = {}) => {
    const id = 'dl' + Math.round(x) + '_' + Math.round(y);
    let g = `<defs><radialGradient id="${id}" cx="0.42" cy="0.38" r="0.7"><stop offset="0" stop-color="#fbf8f0"/><stop offset="0.8" stop-color="#e6e0d2"/><stop offset="1" stop-color="#c8c0ae"/></radialGradient></defs>`;
    if (o.case !== false) g += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r * 1.12)}" fill="#b89a5a" ${ol(1.2)}/><circle cx="${f(x)}" cy="${f(y)}" r="${f(r * 1.12)}" fill="none" stroke="#fff4c8" stroke-width="${f(r * 0.04)}" opacity="0.5"/>`;
    g += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="url(#${id})" ${ol(1.1)}/>`;
    if (o.dark) g += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="#05080a" opacity="${f(0.9 * o.dark)}"/>`;
    for (let i = 0; i < 60; i++) { const a = i * Math.PI / 30, r0 = r * (i % 5 ? 0.9 : 0.86); g += `<path d="M${f(x + Math.sin(a) * r0)},${f(y - Math.cos(a) * r0)} L${f(x + Math.sin(a) * r * 0.94)},${f(y - Math.cos(a) * r * 0.94)}" stroke="#3a3228" stroke-width="${f(r * (i % 5 ? 0.008 : 0.02))}"/>`; }
    const fs = r * 0.24;
    for (let i = 1; i <= 12; i++) {
      const a = i * Math.PI / 6, cx = x + Math.sin(a) * r * 0.68, cy = y - Math.cos(a) * r * 0.68 + fs * 0.36, done = i <= n || (n >= 12);
      const col = done ? mix('#d8e8b0', GLOW, lum) : '#2a2620';
      g += TXT(cx, cy, fs, col, String(i), { w: 'bold' });
      if (done && lum > 0.05) g += glow(cx, cy - fs * 0.35, fs * 1.1, 0.35 * lum);
    }
    if (o.hands !== false) g += `<path d="M${f(x)},${f(y)} L${f(x + r * 0.32)},${f(y - r * 0.38)}" stroke="#1a1612" stroke-width="${f(r * 0.05)}" stroke-linecap="round"/><path d="M${f(x)},${f(y)} L${f(x - r * 0.1)},${f(y - r * 0.62)}" stroke="#1a1612" stroke-width="${f(r * 0.035)}" stroke-linecap="round"/><circle cx="${f(x)}" cy="${f(y)}" r="${f(r * 0.05)}" fill="#1a1612"/>`;
    // (o.flat k: the dial lying on a table, seen at an angle - squashed to k of its height)
    return o.flat ? `<g transform="translate(${f(x)},${f(y)}) scale(1,${o.flat}) translate(${f(-x)},${f(-y)})">${g}</g>` : g;
  };
  // the small porcelain crucible of Undark on its saucer, the paint inside glowing (lum); o.dark: the room's lights off
  S.paintPot = (x, y, s = 1, lum = 0.6, o = {}) => {
    const dk = o.dark || 0, por = mix('#f2ede2', '#141a12', dk * 0.85), por2 = mix('#d8d0c0', '#0c100a', dk * 0.85);
    let g = `<ellipse cx="${f(x)}" cy="${f(y + 3 * s)}" rx="${f(40 * s)}" ry="${f(9 * s)}" fill="#000" opacity="0.35" filter="url(#b4)"/>`;
    g += `<ellipse cx="${f(x)}" cy="${f(y - 2 * s)}" rx="${f(19 * s)}" ry="${f(4 * s)}" fill="${por2}"/>`;
    g += `<path d="M${f(x - 17 * s)},${f(y - 3 * s)} C${f(x - 22 * s)},${f(y - 10 * s)} ${f(x - 23 * s)},${f(y - 18 * s)} ${f(x - 22 * s)},${f(y - 22 * s)} L${f(x + 22 * s)},${f(y - 22 * s)} C${f(x + 23 * s)},${f(y - 18 * s)} ${f(x + 22 * s)},${f(y - 10 * s)} ${f(x + 17 * s)},${f(y - 3 * s)}Z" fill="${por}" ${ol(1.1)}/>`;
    g += `<path d="M${f(x - 15 * s)},${f(y - 6 * s)} C${f(x - 19 * s)},${f(y - 11 * s)} ${f(x - 19 * s)},${f(y - 16 * s)} ${f(x - 18 * s)},${f(y - 19 * s)}" stroke="#fff" stroke-width="${f(2.4 * s)}" fill="none" opacity="${f(0.6 * (1 - dk))}"/>`;
    g += `<ellipse cx="${f(x)}" cy="${f(y - 22 * s)}" rx="${f(22 * s)}" ry="${f(5 * s)}" fill="${por}" ${ol(1)}/><ellipse cx="${f(x)}" cy="${f(y - 21.5 * s)}" rx="${f(18 * s)}" ry="${f(3.6 * s)}" fill="${mix('#b8c890', GLOW, Math.min(1, 0.4 + lum))}"/>`;
    g += `<ellipse cx="${f(x - 5 * s)}" cy="${f(y - 22.5 * s)}" rx="${f(6 * s)}" ry="${f(1.2 * s)}" fill="#f4ffe8" opacity="${f(0.6 * lum)}"/>`;
    if (lum > 0.02) g += glow(x, y - 24 * s, 60 * s, 0.45 * lum) + glow(x, y - 22 * s, 18 * s, 0.6 * lum, '#eaffd0');
    return g;
  };
  // the fine camel-hair brush from A (the end of the handle) to B (the tip), the tip wet with glowing paint (lum)
  // (o.glow false: the brush alone - when it is lit with the fist that holds it, in the figure's one light pass, the
  // glow is drawn after that pass with S.brushGlow, or the light would rim the glow's square like a solid shape)
  S.brushGlow = (A, B, lum = 0.8, s = 1) => { const dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L; return glow(B[0] - ux * 8 * s, B[1] - uy * 8 * s, 46 * s, 0.5 * lum) + glow(B[0] - ux * 4 * s, B[1] - uy * 4 * s, 16 * s, 0.7 * lum, '#eaffd0'); };
  S.brush = (A, B, lum = 0.8, s = 1, o = {}) => {
    const dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
    const P = (k, w) => `${f(A[0] + ux * k + nx * w)},${f(A[1] + uy * k + ny * w)}`;
    const ferrule = L - 34 * s;
    let g = `<path d="M${P(0, 3.2 * s)} L${P(ferrule, 2.6 * s)} L${P(ferrule, -2.6 * s)} L${P(0, -3.2 * s)}Z" fill="#7a4a22" stroke="#2a1608" stroke-width="${f(0.9 * s)}"/><path d="M${P(4, -1.2 * s)} L${P(ferrule - 4, -1 * s)}" stroke="#c8935a" stroke-width="${f(1.2 * s)}" opacity="0.7"/>`;
    g += `<path d="M${P(ferrule, 3 * s)} L${P(ferrule + 14 * s, 2.6 * s)} L${P(ferrule + 14 * s, -2.6 * s)} L${P(ferrule, -3 * s)}Z" fill="#c8c4b8" stroke="#3a3630" stroke-width="${f(0.9 * s)}"/>`;
    g += `<path d="M${P(ferrule + 14 * s, 2.6 * s)} Q${P(ferrule + 24 * s, 3.4 * s)} ${P(L, 0)} Q${P(ferrule + 24 * s, -3.4 * s)} ${P(ferrule + 14 * s, -2.6 * s)}Z" fill="${mix('#6a5a3a', GLOW, 0.4 + 0.6 * lum)}" stroke="#2a2418" stroke-width="${f(0.7 * s)}"/>`;
    if (lum > 0.02 && o.glow !== false) g += S.brushGlow(A, B, lum, s);
    return g;
  };

  // ======================================================= THE STUDIO, 1917 (day; o.dark: the lights off)
  // world: the long worktable you sit at, its far edge at y 1440, near edge 1660; the room behind: cream walls, tall
  // windows with the morning in them, rows of tables with girls at the dials (drawn by the shot), the sign and the
  // calendar; overhead, shaded lamps
  S.RG = { TOP: 1440, NEAR: 1660, CAL: [580, 634] };
  S.studioBack = (t, o = {}) => {
    const L = [], r = rng(301), dark = o.dark || 0, day = 1 - dark;
    // the far wall: plaster, three tall windows with the morning in them, a pilaster between, wainscot below
    let w = `<rect x="-900" y="-600" width="2900" height="2800" fill="${mix('#c8b89a', '#14100c', dark)}"/>`;
    w += lg('rgWall', [[0, '#000', 0.35], [0.5, '#000', 0], [1, '#000', 0.45]], 0, 0, 1, 0) + `<rect x="-900" y="-600" width="2900" height="2800" fill="url(#rgWall)"/>`;
    w += lg('rgSky', [[0, mix('#dfe6e4', '#080b10', dark)], [0.7, mix('#f8f0dc', '#10141a', dark)], [1, mix('#fff4dc', '#141820', dark)]], 0, 0, 0, 1);
    for (const wx of [-260, 300, 860]) {
      w += `<rect x="${wx - 150}" y="${80}" width="300" height="760" fill="url(#rgSky)" ${ol(1.4)}/>`;
      // across the yard: the works' brick roofs and a chimney, hazy in the morning
      w += `<path d="M${wx - 150},${640} L${wx - 90},${640} L${wx - 90},${560} L${wx + 10},${600} L${wx + 10},${620} L${wx + 60},${620} L${wx + 60},${470} L${wx + 84},${470} L${wx + 84},${620} L${wx + 150},${620} L${wx + 150},${840} L${wx - 150},${840}Z" fill="${mix('#c8b4a0', '#0a0c0e', dark)}" opacity="0.75"/>`;
      if (day > 0.02) w += `<path d="M${wx + 72},${470} q-20,-60 10,-120 q30,-60 -10,-130" stroke="#fff" stroke-width="26" fill="none" opacity="${f(0.25 * day)}" filter="url(#b14)"/>`;
      if (day > 0.02) { w += `<g opacity="${f(day)}">` + glow(wx, 380, 420, 0.5, '#fff4dc') + `</g>`; }
      for (let i = 1; i < 3; i++) w += `<path d="M${wx - 150 + i * 100},80 L${wx - 150 + i * 100},840" stroke="${mix('#5a4a36', '#0a0a08', dark)}" stroke-width="8"/>`;
      for (let j = 1; j < 4; j++) w += `<path d="M${wx - 150},${80 + j * 190} L${wx + 150},${80 + j * 190}" stroke="${mix('#5a4a36', '#0a0a08', dark)}" stroke-width="8"/>`;
      w += `<rect x="${wx - 166}" y="840" width="332" height="26" fill="${mix('#8a7458', '#141210', dark)}" ${ol(1.2)}/>`;
    }
    w += `<rect x="-900" y="1000" width="2900" height="40" fill="${mix('#7a6046', '#100c0a', dark)}" ${ol(1.2)}/><rect x="-900" y="1040" width="2900" height="1200" fill="${mix('#6a5038', '#0c0a08', dark)}"/>`;
    for (let x = -880; x < 2000; x += 120) w += `<rect x="${x}" y="1070" width="100" height="160" rx="4" fill="none" stroke="${mix('#4a3626', '#080706', dark)}" stroke-width="3" opacity="0.7"/>`;
    // the sign over the middle window and the calendar for 1917 with a war poster
    // the company's board between the windows: black, gilt letters
    w += `<rect x="468" y="430" width="224" height="118" rx="4" fill="${mix('#1e1812', '#080706', dark)}" ${ol(1.4)}/><rect x="476" y="438" width="208" height="102" fill="none" stroke="${mix('#b8964a', '#1a1810', dark)}" stroke-width="2"/>` +
      TXT(580, 478, 22, mix('#e2c47a', '#2a2618', dark), 'U.S. RADIUM', { w: 'bold', ls: 2, len: 180 }) + TXT(580, 508, 16, mix('#e2c47a', '#2a2618', dark), 'CORPORATION', { ls: 3, len: 150 }) + TXT(580, 531, 12, mix('#c8aa66', '#2a2618', dark), 'DIAL DEPARTMENT', { ls: 2, len: 130 });
    // the calendar for 1917 under the board, high on the wall where no head hides it (S.RG.CAL: its centre)
    w += `<rect x="525" y="578" width="110" height="112" fill="${mix('#efe6d0', '#16140e', dark)}" ${ol(1.1)}/><rect x="525" y="578" width="110" height="30" fill="${mix('#8a2a1a', '#140a08', dark)}"/>` + TXT(580, 601, 20, mix('#f4e8cc', '#2a2418', dark), '1917', { w: 'bold' });
    for (let i = 0; i < 4; i++) for (let j = 0; j < 7; j++) w += `<rect x="${532 + j * 14.5}" y="${618 + i * 16}" width="10" height="10" fill="${mix(i === 2 && j === 3 ? '#8a2a1a' : '#5a5040', '#14120c', dark)}" opacity="0.55"/>`;
    w += `<rect x="-40" y="880" width="120" height="150" fill="${mix('#c8a868', '#14120c', dark)}" ${ol(1.1)}/>` + TXT(20, 930, 14, mix('#3a1a10', '#1a1610', dark), 'BUY', { w: 'bold' }) + TXT(20, 960, 14, mix('#3a1a10', '#1a1610', dark), 'LIBERTY', { w: 'bold' }) + TXT(20, 990, 14, mix('#3a1a10', '#1a1610', dark), 'BONDS', { w: 'bold' });
    // the lit day: the windows' light falling, the dark corners
    if (day > 0.02) w += `<g opacity="${f(day)}">` + [-260, 300, 860].map(wx => `<path d="M${wx - 150},840 L${wx + 150},840 L${wx + 420},2200 L${wx - 60},2200Z" fill="#fff0d0" opacity="0.08" filter="url(#b14)"/>`).join('') + `</g>`;
    w += lg('rgFall', [[0, '#000', 0], [0.6, '#000', 0.2], [1, '#000', 0.6]], 0, 0, 0, 1) + `<rect x="-900" y="-600" width="2900" height="2800" fill="url(#rgFall)"/>`;
    // in the dark the radium glows everywhere it was spilt: specks on the wainscot and the floor, a smear on a sill
    if (dark > 0.02) { let d = ''; for (let i = 0; i < 70; i++) { const x = -400 + r() * 1900, y = 900 + r() * 1100; d += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(1 + r() * 2.6)}" fill="${GLOW}" opacity="${f((0.25 + r() * 0.5) * dark)}"/>`; } w += d + glow(300, 1200, 600, 0.06 * dark); }
    L.push({ p: 0.8, svg: `<g filter="url(#dof1)">${w}</g>` });
    return L;
  };
  // the long worktable you sit at: its top (from the far edge to the near edge) with dials laid out on a tray, the
  // paint pots, a box of brushes; its front edge (o.dark: the lights off; o.dials / o.pot / o.tray place things)
  S.studioTable = (t, o = {}) => {
    const TOP = o.top ?? S.RG.TOP, NEAR = o.near ?? S.RG.NEAR, dark = o.dark || 0, r = rng(331);
    let g = `<path d="M-300,${TOP} L1380,${TOP} L1420,${NEAR} L-340,${NEAR}Z" fill="${mix('#7a5636', '#120c08', dark)}" filter="url(#woodH)"/>`;
    g += lg('rgTop', [[0, '#000', 0.35], [1, '#fff', 0.08]], 0, 0, 0, 1) + `<path d="M-300,${TOP} L1380,${TOP} L1420,${NEAR} L-340,${NEAR}Z" fill="url(#rgTop)"/>`;
    for (let i = 0; i < 6; i++) { const y = TOP + 20 + i * 34; g += `<path d="M-300,${y} L1400,${y + 4}" stroke="${mix('#4a3020', '#080604', dark)}" stroke-width="1.5" opacity="0.5"/>`; }
    // the tray of dials waiting (and painted)
    if (o.tray !== false) {
      const [tx, ty] = o.tray || [760, 1520], ts = o.trayS || 1, td = Math.max(dark, o.trayDark || 0);
      g += `<path d="M${f(tx - 150 * ts)},${f(ty - 50 * ts)} L${f(tx + 150 * ts)},${f(ty - 50 * ts)} L${f(tx + 170 * ts)},${f(ty + 50 * ts)} L${f(tx - 170 * ts)},${f(ty + 50 * ts)}Z" fill="${mix('#3a2a1e', '#0a0806', dark)}" ${ol(1.2)}/>`;
      for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) g += S.dial(tx + (-110 + i * 74 + j * 12) * ts, ty + (-22 + j * 46) * ts, 26 * ts, i + j * 4 < (o.done ?? 5) ? 12 : 0, 0.3 + 0.7 * dark, { hands: false, flat: 0.5, case: true, dark: td });
    }
    if (o.pot !== false) { const [px, py] = o.pot || [300, 1560]; g += S.paintPot(px, py, o.potS || 1, 0.5 + 0.5 * dark, { dark }); }
    // the table's front edge and its apron: a long board with the drawers of brushes and pots, brass pulls
    g += `<rect x="-340" y="${NEAR}" width="1760" height="30" fill="${mix('#5a3e26', '#0c0806', dark)}" ${ol(1.3)}/><rect x="-340" y="${NEAR}" width="1760" height="5" fill="#fff" opacity="${f(0.2 * (1 - dark))}"/>`;
    g += `<rect x="-340" y="${NEAR + 30}" width="1760" height="600" fill="${mix('#3a2818', '#080604', dark)}"/>`;
    g += `<rect x="-340" y="${NEAR + 30}" width="1760" height="110" fill="${mix('#5a3c22', '#0a0704', dark)}" filter="url(#woodH)"/><path d="M-340,${NEAR + 140} L1420,${NEAR + 140}" stroke="#140c06" stroke-width="3"/>`;
    for (const dx of [-120, 300, 720, 1140]) g += `<rect x="${dx}" y="${NEAR + 46}" width="300" height="80" rx="3" fill="none" stroke="${mix('#2a1a0e', '#060402', dark)}" stroke-width="3"/><rect x="${dx + 4}" y="${NEAR + 50}" width="292" height="4" fill="#fff" opacity="${f(0.1 * (1 - dark))}"/>` +
      `<path d="M${dx + 126},${NEAR + 86} Q${dx + 150},${NEAR + 100} ${dx + 174},${NEAR + 86}" stroke="${mix('#c8a050', '#1a160c', dark)}" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="${dx + 126}" cy="${NEAR + 86}" r="4" fill="${mix('#8a6a2a', '#0a0806', dark)}"/><circle cx="${dx + 174}" cy="${NEAR + 86}" r="4" fill="${mix('#8a6a2a', '#0a0806', dark)}"/>`;
    g += lg('rgFr', [[0, '#000', 0.15], [0.25, '#000', 0.35], [1, '#000', 0.75]]) + `<rect x="-340" y="${NEAR + 30}" width="1760" height="600" fill="url(#rgFr)"/>`;
    return g;
  };
  // the room's light: the morning's haze and motes in the window light; in the dark, radium dust drifting
  S.studioLight = (t, o = {}) => {
    const dark = o.dark || 0, r = rng(341);
    let g = dark < 0.98 ? `<g opacity="${f(1 - dark)}">` + C.radial(300, 500, 900, '#fff0d0', 0.12) : '';
    if (dark < 0.98) { for (let i = 0; i < 40; i++) { const x = -100 + r() * 1300, y = 200 + r() * 1300 - (t * 8) % 60; g += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(1 + r() * 1.6)}" fill="#fff6e0" opacity="${f(0.15 + r() * 0.3)}"/>`; } g += `</g>`; }
    if (dark > 0.02) for (let i = 0; i < 40; i++) { const x = r() * 1080, y = 300 + r() * 1400 - (t * 14) % 80; g += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(1 + r() * 2)}" fill="${GLOW}" opacity="${f((0.2 + r() * 0.4) * dark)}"/>`; }
    return g;
  };

  // ======================================================= THE CEMETERY, 1927 (night)
  // (redesigned after the look test - the user: the open casket seen from the side "looks like a box") Seen from the
  // foot of the grave, looking down its length: the two diggers behind the heaps of earth at its head, your headstone
  // between them; the hole's walls; the old six-sided coffin, wide at the shoulders and narrow at the head and the feet,
  // lying in it; its lid hinged along the right side swings up and over to lean on the grave's wall; you inside in your
  // best dress, your red hair still round the skull, a posy of dried roses over your crossed hands, the bones glowing.
  // World (camera [540, 960, 1] shows it as it is): the horizon y 560; the heaps' crests about y 645, the diggers'
  // waists behind them; the hole's far rim y 780; the coffin's rim: the head end y 880 (half-width 96), the shoulders
  // y 1080 (172), the foot end y 1800 (118).  o.lid 0..1 (shut .. leaning open at 120 degrees), o.glow 0..1
  S.CM = { HOR: 560, HEAP: 645, RIM: 780, HEAD: 880, SHO: 1080, FOOT: 1800, HW: 96, SW: 172, FW: 118, CX: 540 };
  const lerp = (a, b, u) => a + (b - a) * u;
  const poly = pts => 'M' + pts.map(p => f(p[0]) + ',' + f(p[1])).join(' L') + 'Z';
  S.cemeteryBack = (t, o = {}) => {
    const L = [], r = rng(401), H = o.hor ?? S.CM.HOR;
    let w = lg('cmSky', [[0, '#08080e'], [0.5, '#14121a'], [1, '#201a16']], 0, 0, 0, 1) + `<rect x="-900" y="-900" width="2900" height="3000" fill="url(#cmSky)"/>`;
    w += `<circle cx="820" cy="120" r="50" fill="#e8e2cc" opacity="0.55" filter="url(#b8)"/><circle cx="820" cy="120" r="42" fill="#f2ecd8" opacity="0.5"/>` + C.radial(820, 120, 300, '#c8c4b0', 0.14);
    for (let i = 0; i < 4; i++) { const x = -200 + ((i * 420 + t * 12) % 1600), y = 70 + i * 60; w += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(260 + i * 40)}" ry="${f(24 + i * 6)}" fill="#2a2830" opacity="0.5" filter="url(#b14)"/>`; }
    // bare trees on the rise, the rows of headstones and crosses, mist lying between them
    for (let i = 0; i < 6; i++) { const x = -260 + i * 300 + r() * 80, h = 380 + r() * 260, b = H + 10; w += `<path d="M${f(x)},${b} L${f(x + 6)},${f(b - h)} M${f(x + 3)},${f(b - h * 0.62)} L${f(x + 90)},${f(b - h * 0.86)} M${f(x + 3)},${f(b - h * 0.45)} L${f(x - 80)},${f(b - h * 0.7)} M${f(x + 48)},${f(b - h * 0.76)} L${f(x + 76)},${f(b - h * 0.98)}" stroke="#07070a" stroke-width="${f(8 + r() * 7)}" fill="none" stroke-linecap="round"/>`; }
    w += `<path d="M-900,${H} Q400,${H - 40} 2000,${H + 10} L2000,2400 L-900,2400Z" fill="#12100e"/>`;
    for (let i = 0; i < 12; i++) { const x = -320 + i * 160 + r() * 60, y = H - 10 + r() * 30, s = 0.4 + r() * 0.3; w += r() > 0.3 ? `<path d="M${f(x - 40 * s)},${f(y)} L${f(x - 40 * s)},${f(y - 120 * s)} Q${f(x)},${f(y - 172 * s)} ${f(x + 40 * s)},${f(y - 120 * s)} L${f(x + 40 * s)},${f(y)}Z" fill="#26241f" stroke="#0a0806" stroke-width="2"/>` : `<path d="M${f(x)},${f(y)} L${f(x)},${f(y - 170 * s)} M${f(x - 46 * s)},${f(y - 120 * s)} L${f(x + 46 * s)},${f(y - 120 * s)}" stroke="#26241f" stroke-width="${f(22 * s)}"/>`; }
    w += `<rect x="-900" y="${H - 60}" width="2900" height="120" fill="#3a3a42" opacity="0.2" filter="url(#b14)"/>`;
    L.push({ p: 0.7, svg: `<g filter="url(#dof1)">${w}</g>` });
    return L;
  };
  // the ground at the head of the grave and your headstone (drawn before the diggers, who stand either side of it)
  S.graveGround = (t, o = {}) => {
    const { HOR, RIM, CX } = S.CM;
    let g = `<path d="M-300,${HOR + 20} Q540,${HOR - 10} 1380,${HOR + 20} L1380,2300 L-300,2300Z" fill="#1a1510"/>`;
    // the headstone: an arched slab, a carved border, AT REST and the years
    const sx = CX, sb = RIM - 4, st = 460;
    g += `<path d="M${sx - 98},${sb} L${sx - 98},${st + 80} Q${sx - 98},${st} ${sx},${st} Q${sx + 98},${st} ${sx + 98},${st + 80} L${sx + 98},${sb}Z" fill="#4a4842" ${ol(1.6)}/>`;
    g += `<path d="M${sx - 80},${sb - 10} L${sx - 80},${st + 86} Q${sx - 80},${st + 20} ${sx},${st + 20} Q${sx + 80},${st + 20} ${sx + 80},${st + 86} L${sx + 80},${sb - 10}" fill="none" stroke="#2e2c28" stroke-width="3" opacity="0.8"/>`;
    g += `<path d="M${sx - 92},${st + 84} Q${sx - 90},${st + 8} ${sx},${st + 6}" stroke="#8a887e" stroke-width="3" fill="none" opacity="0.45"/>`;
    g += TXT(sx, st + 108, 26, '#1e1c18', 'AT REST', { w: 'bold', ls: 3, len: 120 }) + TXT(sx, st + 150, 20, '#1e1c18', '1898 - 1922', { ls: 2, len: 130 });
    g += `<path d="M${sx - 40},${st + 176} Q${sx},${st + 190} ${sx + 40},${st + 176}" stroke="#1e1c18" stroke-width="2" fill="none" opacity="0.7"/>`;
    return g;
  };
  // the two heaps of earth in front of the diggers (drawn over them), a spade stuck in the right one, the lanterns
  S.graveHeap = (t, o = {}) => {
    const { HEAP, RIM } = S.CM, r = rng(421);
    let g = '';
    for (const [cx, w0, seed] of [[290, 250, 1], [800, 240, 2]]) {
      const d = `M${cx - w0 - 40},${RIM + 20} C${cx - w0},${HEAP + 40} ${cx - w0 * 0.5},${HEAP - 6} ${cx - 30},${HEAP - 2} C${cx + 30},${HEAP + 2} ${cx + w0 * 0.5},${HEAP - 10} ${cx + w0 * 0.8},${HEAP + 30} C${cx + w0},${HEAP + 70} ${cx + w0 + 20},${RIM - 10} ${cx + w0 + 40},${RIM + 20}Z`;
      g += `<path d="${d}" fill="#3a2a1a" ${ol(1.4)}/>` + lg('cmHp' + seed, [[0, '#000', 0], [1, '#000', 0.55]], 0, 0, 0, 1) + `<path d="${d}" fill="url(#cmHp${seed})"/>`;
      for (let i = 0; i < 22; i++) { const x = cx - w0 * 0.8 + r() * w0 * 1.6, y = HEAP + 20 + r() * (RIM - HEAP - 10); g += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(3 + r() * 8)}" ry="${f(2 + r() * 5)}" fill="${r() > 0.5 ? '#5a4430' : '#22180e'}" opacity="0.7"/>`; }
    }
    g += `<path d="M960,${HEAP - 250} L972,${HEAP + 30}" stroke="#2a1a0c" stroke-width="11" stroke-linecap="round"/><path d="M946,${HEAP - 262} L978,${HEAP - 264}" stroke="#2a1a0c" stroke-width="11" stroke-linecap="round"/><path d="M948,${HEAP + 16} L996,${HEAP + 14} L992,${HEAP + 58} Q972,${HEAP + 76} 952,${HEAP + 58}Z" fill="#4a4a48" ${ol(1.2)}/>`;
    for (const [lx, ly] of [[86, RIM + 10], [1000, RIM + 30]]) g += C.radial(lx, ly - 50, 300, '#ffb060', 0.3) + `<path d="M${lx - 24},${ly} L${lx - 28},${ly - 74} L${lx + 28},${ly - 74} L${lx + 24},${ly}Z" fill="#ffd890" opacity="0.92" ${ol(1.2)}/><path d="M${lx - 20},${ly - 70} L${lx + 20},${ly - 70} M${lx},${ly - 74} L${lx},${ly}" stroke="#3a2a14" stroke-width="3"/><path d="M${lx - 32},${ly - 74} L${lx + 32},${ly - 74} L${lx},${ly - 100}Z" fill="#2a2016" ${ol(1)}/><path d="M${lx - 10},${ly - 100} Q${lx},${ly - 124} ${lx + 10},${ly - 100}" stroke="#2a2016" stroke-width="4" fill="none"/>`;
    return g;
  };
  // the coffin's rim outline and its right edge (the lid's hinge) at height y
  const coffin = () => { const { CX, HEAD, SHO, FOOT, HW, SW, FW } = S.CM; return [[CX - HW, HEAD], [CX + HW, HEAD], [CX + SW, SHO], [CX + FW, FOOT], [CX - FW, FOOT], [CX - SW, SHO]]; };
  const hingeX = y => { const { CX, HEAD, SHO, FOOT, HW, SW, FW } = S.CM; return y <= SHO ? lerp(CX + HW, CX + SW, (y - HEAD) / (SHO - HEAD)) : lerp(CX + SW, CX + FW, (y - SHO) / (FOOT - SHO)); };
  const dense = (pts, n = 10) => { const out = []; for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; for (let k = 0; k < n; k++) out.push([lerp(a[0], b[0], k / n), lerp(a[1], b[1], k / n)]); } return out; };
  // a point of the shut lid turned th about the hinge (each slice across the coffin turns about its own hinge point; a
  // height above the rim shows on screen at 0.62 of its size, the grave seen from above at a slant)
  const lidPt = (p, th) => { const xh = hingeX(p[1]), d = xh - p[0]; return [xh - d * Math.cos(th), p[1] - d * Math.sin(th) * 0.62]; };
  S.coffinLidPt = lidPt;
  S.grave = (t, o = {}) => {
    const { RIM, HEAD, SHO, FOOT, CX } = S.CM, lid = o.lid || 0, gl = o.glow ?? lid, r = rng(431), th = lid * Math.PI * 2 / 3;
    // the hole: its far wall, the side walls slanting toward us, the floor in shadow
    const hole = [[230, RIM], [850, RIM], [1190, 2000], [-110, 2000]];
    let g = `<path d="${poly(hole)}" fill="#0c0805"/>`;
    g += `<path d="M230,${RIM} L850,${RIM} L820,${HEAD - 6} L260,${HEAD - 6}Z" fill="#2a1e14"/>` + lg('cmFw', [[0, '#000', 0], [1, '#000', 0.6]], 0, 0, 0, 1) + `<path d="M230,${RIM} L850,${RIM} L820,${HEAD - 6} L260,${HEAD - 6}Z" fill="url(#cmFw)"/>`;
    g += `<path d="M230,${RIM} L260,${HEAD - 6} L150,2000 L-110,2000Z" fill="#1e150d"/><path d="M850,${RIM} L820,${HEAD - 6} L930,2000 L1190,2000Z" fill="#1e150d"/>`;
    g += lg('cmSw', [[0, '#000', 0.15], [1, '#000', 0.7]], 0, 0, 0, 1) + `<path d="M230,${RIM} L260,${HEAD - 6} L150,2000 L-110,2000Z M850,${RIM} L820,${HEAD - 6} L930,2000 L1190,2000Z" fill="url(#cmSw)"/>`;
    // roots and stones in the walls, the spade's cuts
    for (let i = 0; i < 40; i++) { const side = i % 2 ? 1 : -1, v = r(), y = RIM + 30 + v * 1100, x = side < 0 ? lerp(230, -110, (y - RIM) / (2000 - RIM)) + 20 + r() * 110 : lerp(850, 1190, (y - RIM) / (2000 - RIM)) - 20 - r() * 110; g += r() > 0.5 ? `<path d="M${f(x)},${f(y)} q${f(-side * 14)},${f(8 + r() * 10)} ${f(-side * (20 + r() * 30))},${f(18 + r() * 20)}" stroke="#3a2a1a" stroke-width="${f(2 + r() * 3)}" fill="none" opacity="0.7"/>` : `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(5 + r() * 9)}" ry="${f(4 + r() * 6)}" fill="#3a3028" opacity="0.6"/>`; }
    // the coffin: its foot board toward us, the rim (wood), the lining, you
    const rim = coffin(), ft = [[CX - 118, FOOT], [CX + 118, FOOT], [CX + 112, FOOT + 70], [CX - 112, FOOT + 70]];
    g += `<path d="${poly(ft)}" fill="#2e1c0e" ${ol(1.4)}/><path d="M${CX - 100},${FOOT + 34} L${CX + 100},${FOOT + 34}" stroke="#5a3a1e" stroke-width="3" opacity="0.6"/>`;
    g += `<path d="${poly(rim.map(([x, y]) => [x + (x - CX) * 0.08, y + (y < SHO ? -6 : 4)]))}" fill="#2a1a0c" ${ol(1.5)}/>`;
    const fl = rim.map(([x, y]) => [CX + (x - CX) * 0.84, y + 44 * (1 - (y - HEAD) / (FOOT - HEAD))]);
    g += `<path d="${poly(rim)}" fill="${mix('#1a140e', '#5a7a46', 0.8 * gl)}"/>`;
    g += lg('cmLn', [[0, mix('#1e1a12', '#7aa866', gl)], [0.45, mix('#2a2618', '#a8d48e', gl)], [1, mix('#221e16', '#6a8a58', gl)]], 0, 0, 0, 1) + `<path d="${poly(fl)}" fill="url(#cmLn)"/>`;
    // the lining's quilting on the floor, a pleated frill round the rim
    { let q = `<defs><clipPath id="cmFl"><path d="${poly(fl)}"/></clipPath></defs><g clip-path="url(#cmFl)">`; for (let x = 200; x < 900; x += 46) q += `<path d="M${x},${HEAD} L${x + 300},${FOOT} M${x + 300},${HEAD} L${x},${FOOT}" stroke="${mix('#1a160e', '#6a9a58', gl)}" stroke-width="1.6" opacity="0.4"/>`; g += q + `</g>`; }
    g += `<path d="${poly(rim)}" fill="none" stroke="${mix('#3a3428', '#b8d8a0', 0.55 * gl)}" stroke-width="8" stroke-dasharray="6 5" opacity="0.6"/>`;
    // you: the depth u runs from the head (0) to the feet (1); nearer is bigger (ps)
    const Y = u => lerp(HEAD + 44, FOOT - 16, u), ps = u => lerp(0.84, 1.16, u), P = (u, w) => `${f(CX + w * ps(u))},${f(Y(u))}`;
    const dr = mix('#2a1a1a', mix('#8a5650', GLOW, 0.16), 0.3 + 0.6 * gl), drD = shade(dr, -0.45), lc = mix('#3a3a32', '#c8dcb8', 0.65 * gl);
    g += `<ellipse cx="${CX}" cy="${f(Y(0.04))}" rx="${f(86 * ps(0.04))}" ry="30" fill="${mix('#2a2a22', '#b8d0a4', 0.7 * gl)}" ${ol(1)}/>`;
    // your hair, still red, spread out on the pillow from under the skull: wavy locks to both sides and down past the
    // shoulders (drawn first: the skull and the collar lie over it)
    { const hc = mix('#3a1a0c', '#a04a22', 0.45 + 0.4 * gl), hl = mix('#5a2a10', '#d8804a', 0.6 * gl);
      for (const sd of [-1, 1]) {
        const W = w => w * sd;
        g += `<path d="M${P(0.02, W(10))} C${P(0.0, W(50))} ${P(0.03, W(84))} ${P(0.07, W(92))} C${P(0.1, W(104))} ${P(0.13, W(96))} ${P(0.15, W(104))} C${P(0.18, W(112))} ${P(0.2, W(100))} ${P(0.22, W(92))} C${P(0.2, W(80))} ${P(0.17, W(70))} ${P(0.15, W(44))} L${P(0.12, W(10))}Z" fill="${hc}" ${ol(1.1)}/>`;
        for (const k of [0.5, 0.75, 0.95]) g += `<path d="M${P(0.03, W(30 * k + 10))} C${P(0.06, W(70 * k + 20))} ${P(0.12, W(84 * k + 10))} ${P(0.18, W(92 * k + 6))}" stroke="${hl}" stroke-width="2" fill="none" opacity="0.55"/>`;
      } }
    // the dress: the lace collar, the bodice to the waist, the lace shawl over the crossed arms with the posy on it,
    // the skirt to the hem, the toes of your shoes
    const dress = `M${P(0.15, -30)} C${P(0.155, -62)} ${P(0.17, -86)} ${P(0.2, -90)} C${P(0.28, -86)} ${P(0.38, -70)} ${P(0.44, -66)} C${P(0.5, -84)} ${P(0.6, -92)} ${P(0.9, -110)} Q${P(0.93, 0)} ${P(0.9, 110)} C${P(0.6, 92)} ${P(0.5, 84)} ${P(0.44, 66)} C${P(0.38, 70)} ${P(0.28, 86)} ${P(0.2, 90)} C${P(0.17, 86)} ${P(0.155, 62)} ${P(0.15, 30)}Z`;
    g += `<path d="${dress}" fill="${dr}" ${ol(1.3)}/>`;
    for (const w of [-70, -36, 0, 36, 70]) g += `<path d="M${P(0.5, w * 0.8)} C${P(0.62, w * 0.95)} ${P(0.76, w * 1.05)} ${P(0.89, w * 1.15)}" stroke="${drD}" stroke-width="2.6" fill="none" opacity="0.6"/>`;
    for (let i = 0; i < 2; i++) { const w = i ? 26 : -26; g += `<path d="M${P(0.905, w - 13)} C${P(0.94, w - 14)} ${P(0.955, w - 4)} ${P(0.955, w)} C${P(0.955, w + 4)} ${P(0.94, w + 14)} ${P(0.905, w + 13)}Z" fill="${mix('#140e0a', '#2a3a20', gl * 0.6)}" ${ol(1)}/>`; }
    g += `<path d="M${P(0.15, -34)} Q${P(0.19, 0)} ${P(0.15, 34)} L${P(0.18, 38)} Q${P(0.22, 0)} ${P(0.18, -38)}Z" fill="${lc}" ${ol(1)}/>`;
    g += `<path d="M${P(0.29, -92)} C${P(0.33, -40)} ${P(0.33, 40)} ${P(0.29, 92)} L${P(0.42, 76)} C${P(0.45, 30)} ${P(0.45, -30)} ${P(0.42, -76)}Z" fill="${lc}" opacity="0.94" ${ol(1)}/>`;
    for (let i = 0; i < 7; i++) g += `<circle cx="${f(CX + (-60 + i * 20) * ps(0.36))}" cy="${f(Y(0.36) + (i % 2 ? 8 : -8))}" r="5" fill="none" stroke="${shade(lc, -0.35)}" stroke-width="1.6" opacity="0.7"/>`;
    // the posy of dried roses on your crossed hands (the hands are under it)
    { const pc = [CX, Y(0.4)]; g += `<path d="M${f(pc[0] - 10)},${f(pc[1] + 8)} L${f(pc[0] - 30)},${f(pc[1] + 60)} M${f(pc[0] + 4)},${f(pc[1] + 8)} L${f(pc[0] + 10)},${f(pc[1] + 66)} M${f(pc[0] + 14)},${f(pc[1] + 6)} L${f(pc[0] + 38)},${f(pc[1] + 56)}" stroke="${mix('#1e1a0e', '#4a6a30', gl * 0.6)}" stroke-width="4"/>`;
      for (const [dx, dy, rr] of [[-26, -6, 15], [0, -14, 17], [24, -4, 15], [-12, 12, 14], [14, 12, 14]]) g += `<circle cx="${f(pc[0] + dx)}" cy="${f(pc[1] + dy)}" r="${rr}" fill="${mix('#2a0c0a', '#6a3a2a', 0.5 * gl)}" ${ol(1)}/><path d="M${f(pc[0] + dx - rr * 0.5)},${f(pc[1] + dy)} q${f(rr * 0.5)},${f(-rr * 0.6)} ${f(rr)},0 q${f(-rr * 0.3)},${f(rr * 0.5)} ${f(-rr * 0.6)},${f(rr * 0.2)}" stroke="${mix('#140404', '#3a1a10', gl)}" stroke-width="1.6" fill="none"/>`;
      for (const [dx, dy, a] of [[-40, 0, -30], [40, 2, 30], [-4, 26, 90]]) g += `<ellipse cx="${f(pc[0] + dx)}" cy="${f(pc[1] + dy)}" rx="14" ry="6" transform="rotate(${a} ${f(pc[0] + dx)} ${f(pc[1] + dy)})" fill="${mix('#1e1e0e', '#4a5a2a', gl * 0.6)}" ${ol(0.8)}/>`; }
    // the skull, face up: the bone itself glows; collarbones at the neckline
    const sk = mix('#5a5a48', GLOW, 0.92 * gl), sd = mix('#101208', '#1e3a18', gl), sc = [CX, Y(0.095)];
    const skull = `<g transform="translate(${f(sc[0])},${f(sc[1])}) scale(${f(ps(0.095))},0.78)"><path d="M-40,-10 C-42,-46 -20,-60 0,-60 C20,-60 42,-46 40,-10 C40,8 32,20 26,26 L24,46 C16,56 -16,56 -24,46 L-26,26 C-32,20 -40,8 -40,-10Z" fill="${sk}" ${ol(1.3)}/>` +
      `<path d="M-30,-8 C-30,-22 -10,-24 -6,-12 C-4,0 -16,8 -24,6 C-30,4 -30,-2 -30,-8Z M30,-8 C30,-22 10,-24 6,-12 C4,0 16,8 24,6 C30,4 30,-2 30,-8Z" fill="${sd}"/><path d="M0,6 L-6,20 L6,20Z" fill="${sd}"/>` +
      `<path d="M-18,32 L18,32 M-18,40 L18,40" stroke="${sd}" stroke-width="2"/>${[-12, -6, 0, 6, 12].map(x => `<path d="M${x},28 L${x},44" stroke="${sd}" stroke-width="1.4"/>`).join('')}</g>`;
    g += skull;
    g += `<path d="M${P(0.2, -50)} Q${P(0.19, -18)} ${P(0.21, -4)} M${P(0.2, 50)} Q${P(0.19, 18)} ${P(0.21, 4)}" stroke="${sk}" stroke-width="4" fill="none" opacity="0.9" stroke-linecap="round"/>`;
    if (gl > 0.01) g += S.emissive(skull) + glow(sc[0], sc[1], 170, 0.5 * gl, '#eaffd0') + glow(CX, Y(0.35), 520, 0.28 * gl) + glow(CX, Y(0.2), 260, 0.2 * gl, '#eaffd0');
    // light leaking out of the shut coffin's seams before the lid is lifted
    if (lid < 0.05 && o.leak) g += `<path d="${poly(rim)}" fill="none" stroke="${GLOW}" stroke-width="5" opacity="${f(0.7 * o.leak)}" filter="url(#b2)"/>`;
    // the lid: past upright its quilted lining faces us, lit from inside; before that its dark planks and the brass plate
    const lp = dense(rim).map(p => lidPt(p, th)), plate = lidPt([CX, (HEAD + SHO) / 2 + 120], th);
    if (th < Math.PI / 2 - 0.02) {
      g += `<path d="${poly(lp)}" fill="#3a2414" ${ol(1.6)}/>` + `<path d="${poly(lp)}" fill="url(#cmLidSh)" opacity="0.5"/>` + lg('cmLidSh', [[0, '#fff', 0.08], [1, '#000', 0.3]], 0, 0, 1, 1);
      const pw = 40 * Math.cos(th) + 4; g += `<rect x="${f(plate[0] - pw)}" y="${f(plate[1] - 16)}" width="${f(pw * 2)}" height="32" fill="#a88a4a" ${ol(1)}/>`;
      for (const v of [0.3, 0.6]) { const a = lidPt([CX - 60, lerp(HEAD, FOOT, v)], th), b = lidPt([CX + 60, lerp(HEAD, FOOT, v)], th); g += `<path d="M${f(a[0])},${f(a[1])} L${f(b[0])},${f(b[1])}" stroke="#1e1208" stroke-width="2" opacity="0.6"/>`; }
    } else if (th > Math.PI / 2 + 0.02) {
      g += `<path d="${poly(lp)}" fill="${mix('#2a2418', '#7a9a62', 0.7 * gl)}" ${ol(1.6)}/>`;
      const inner = dense(rim.map(([x, y]) => [CX + (x - CX) * 0.86, lerp(HEAD + 20, FOOT - 20, (y - HEAD) / (FOOT - HEAD))])).map(p => lidPt(p, th));
      g += `<defs><clipPath id="cmLidC"><path d="${poly(inner)}"/></clipPath></defs><path d="${poly(inner)}" fill="${mix('#2a2620', '#a8c890', 0.65 * gl)}"/><g clip-path="url(#cmLidC)">`;
      for (let k = 0; k < 18; k++) { const v = k / 17, a = lidPt([CX - 160, lerp(HEAD, FOOT, v)], th), b = lidPt([CX + 160, lerp(HEAD, FOOT, v + 0.12)], th), c = lidPt([CX + 160, lerp(HEAD, FOOT, v - 0.12)], th); g += `<path d="M${f(a[0])},${f(a[1])} L${f(b[0])},${f(b[1])} M${f(a[0])},${f(a[1])} L${f(c[0])},${f(c[1])}" stroke="${mix('#141008', '#3a5a2e', gl)}" stroke-width="2.2" opacity="0.75"/>`; }
      for (let k = 0; k < 18; k++) for (const w of [-120, -40, 40, 120]) { const pp = lidPt([CX + w, lerp(HEAD, FOOT, (k + (w === -40 || w === 120 ? 0.5 : 0)) / 17)], th); g += `<circle cx="${f(pp[0])}" cy="${f(pp[1])}" r="3.2" fill="${mix('#141008', '#2a4a20', gl)}" opacity="0.8"/>`; }
      g += `</g>` + glow(...lidPt([CX, (HEAD + FOOT) / 2], th), 300, 0.3 * gl, '#eaffd0');
    }
    // the near end of the grave: the cut turf at the bottom of the frame, grass against the light
    g += `<path d="M-300,1890 Q540,1870 1380,1890 L1380,2400 L-300,2400Z" fill="#100c08" ${ol(1.3)}/>`;
    for (let i = 0; i < 70; i++) { const x = -260 + r() * 1600, y = 1882 + r() * 16, h = 14 + r() * 30; g += `<path d="M${f(x)},${f(y)} q${f(-3 + r() * 6)},${f(-h * 0.6)} ${f(-6 + r() * 12)},${f(-h)}" stroke="#0e1208" stroke-width="3" fill="none"/>`; }
    if (gl > 0.01) g += `<path d="M-300,1890 Q540,1870 1380,1890" stroke="${GLOW}" stroke-width="4" fill="none" opacity="${f(0.3 * gl)}" filter="url(#b2)"/>`;
    return g;
  };
})(window);
