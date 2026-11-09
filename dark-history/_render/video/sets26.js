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
    g += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(34 * s)}" ry="${f(8 * s)}" fill="${por2}" ${ol(1)}/><ellipse cx="${f(x)}" cy="${f(y - 1.5 * s)}" rx="${f(28 * s)}" ry="${f(5.5 * s)}" fill="${por}"/>`;
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
  S.RG = { TOP: 1440, NEAR: 1660 };
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
    w += `<rect x="560" y="880" width="110" height="110" fill="${mix('#efe6d0', '#16140e', dark)}" ${ol(1.1)}/><rect x="560" y="880" width="110" height="30" fill="${mix('#8a2a1a', '#140a08', dark)}"/>` + TXT(615, 903, 20, mix('#f4e8cc', '#2a2418', dark), '1917', { w: 'bold' });
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
  // world: the diggers stand behind the spoil heap on the far side (its crest about y 1160, hiding them below the
  // waist); the hole below it, its far wall from y 1290 down to the coffin; the casket lying in it across the frame, its
  // top's far edge (the lid's hinge) at y 1420, near edge 1500; the near lip of the hole in the foreground at y 1640.
  // o.lid 0..1 how far the lid has swung up (1: standing on its hinge, its satin lining toward us), o.glow 0..1 the
  // light inside
  S.CM = { HEAP: 1160, FAR: 1290, HINGE: 1400, NEARC: 1530, LIP: 1660, X0: 236, X1: 844 };
  S.cemeteryBack = (t, o = {}) => {
    const L = [], r = rng(401);
    let w = lg('cmSky', [[0, '#0a0a12'], [0.55, '#16141a'], [1, '#221c16']], 0, 0, 0, 1) + `<rect x="-900" y="-600" width="2900" height="2800" fill="url(#cmSky)"/>`;
    w += `<circle cx="830" cy="250" r="54" fill="#e8e2cc" opacity="0.55" filter="url(#b8)"/><circle cx="830" cy="250" r="46" fill="#f2ecd8" opacity="0.5"/>` + C.radial(830, 250, 320, '#c8c4b0', 0.14);
    // clouds drifting over the moon
    for (let i = 0; i < 4; i++) { const x = -200 + ((i * 420 + t * 12) % 1600), y = 180 + i * 70; w += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(260 + i * 40)}" ry="${f(26 + i * 6)}" fill="#2a2830" opacity="0.5" filter="url(#b14)"/>`; }
    // bare trees, then the rows of headstones on the rise, a little mist between them
    for (let i = 0; i < 5; i++) { const x = -200 + i * 360 + r() * 80, h = 520 + r() * 320, b = 1060; w += `<path d="M${f(x)},${b} L${f(x + 6)},${f(b - h)} M${f(x + 3)},${f(b - h * 0.62)} L${f(x + 96)},${f(b - h * 0.86)} M${f(x + 3)},${f(b - h * 0.45)} L${f(x - 84)},${f(b - h * 0.7)} M${f(x + 50)},${f(b - h * 0.76)} L${f(x + 80)},${f(b - h * 0.98)}" stroke="#08080a" stroke-width="${f(9 + r() * 8)}" fill="none" stroke-linecap="round"/>`; }
    w += `<path d="M-900,1050 Q400,1000 2000,1060 L2000,2200 L-900,2200Z" fill="#141210"/>`;
    for (let i = 0; i < 10; i++) { const x = -320 + i * 190 + r() * 60, y = 1040 + r() * 50, s = 0.55 + r() * 0.45; w += `<path d="M${f(x - 40 * s)},${f(y)} L${f(x - 40 * s)},${f(y - 120 * s)} Q${f(x)},${f(y - 172 * s)} ${f(x + 40 * s)},${f(y - 120 * s)} L${f(x + 40 * s)},${f(y)}Z" fill="#2a2824" stroke="#0a0806" stroke-width="2"/><path d="M${f(x - 30 * s)},${f(y - 118 * s)} Q${f(x)},${f(y - 160 * s)} ${f(x + 30 * s)},${f(y - 118 * s)}" stroke="#4a4840" stroke-width="2" fill="none" opacity="0.6"/>`; }
    w += `<rect x="-900" y="980" width="2900" height="140" fill="#3a3a40" opacity="0.18" filter="url(#b14)"/>`;
    L.push({ p: 0.7, svg: `<g filter="url(#dof1)">${w}</g>` });
    return L;
  };
  // the ground the diggers stand on (drawn before them)
  S.graveGround = (t, o = {}) => `<path d="M-300,1080 Q540,1060 1380,1080 L1380,1400 L-300,1400Z" fill="#1c1610"/>`;
  // the spoil heap in front of them, the two lanterns on it (drawn over the diggers)
  S.graveHeap = (t, o = {}) => {
    const { HEAP, FAR } = S.CM, r = rng(421);
    let g = `<path d="M-300,${HEAP + 30} Q-120,${HEAP - 30} 60,${HEAP + 6} Q240,${HEAP - 24} 420,${HEAP + 2} Q620,${HEAP - 28} 800,${HEAP + 4} Q980,${HEAP - 30} 1180,${HEAP + 8} L1380,${HEAP + 20} L1380,${FAR + 40} L-300,${FAR + 40}Z" fill="#3a2a1a" ${ol(1.4)}/>`;
    g += lg('cmHeap', [[0, '#000', 0], [1, '#000', 0.5]], 0, 0, 0, 1) + `<path d="M-300,${HEAP + 30} Q-120,${HEAP - 30} 60,${HEAP + 6} Q240,${HEAP - 24} 420,${HEAP + 2} Q620,${HEAP - 28} 800,${HEAP + 4} Q980,${HEAP - 30} 1180,${HEAP + 8} L1380,${HEAP + 20} L1380,${FAR + 40} L-300,${FAR + 40}Z" fill="url(#cmHeap)"/>`;
    for (let i = 0; i < 46; i++) { const x = -280 + r() * 1640, y = HEAP + 10 + r() * (FAR - HEAP); g += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(4 + r() * 10)}" ry="${f(3 + r() * 6)}" fill="${r() > 0.5 ? '#5a4430' : '#22180e'}" opacity="0.7"/>`; }
    // a spade stuck in the heap at the right
    g += `<path d="M1010,${HEAP - 300} L1024,${HEAP + 10}" stroke="#2a1a0c" stroke-width="12" stroke-linecap="round"/><path d="M996,${HEAP - 312} L1030,${HEAP - 314}" stroke="#2a1a0c" stroke-width="12" stroke-linecap="round"/><path d="M1000,${HEAP - 6} L1050,${HEAP - 8} L1046,${HEAP + 40} Q1026,${HEAP + 60} 1006,${HEAP + 40}Z" fill="#4a4a48" ${ol(1.2)}/>`;
    for (const [lx, ly] of [[110, HEAP - 4], [930, HEAP - 2]]) g += C.radial(lx, ly - 50, 300, '#ffb060', 0.3) + `<path d="M${lx - 24},${ly} L${lx - 28},${ly - 74} L${lx + 28},${ly - 74} L${lx + 24},${ly}Z" fill="#ffd890" opacity="0.92" ${ol(1.2)}/><path d="M${lx - 20},${ly - 70} L${lx + 20},${ly - 70} M${lx},${ly - 74} L${lx},${ly}" stroke="#3a2a14" stroke-width="3"/><path d="M${lx - 32},${ly - 74} L${lx + 32},${ly - 74} L${lx},${ly - 100}Z" fill="#2a2016" ${ol(1)}/><path d="M${lx - 10},${ly - 100} Q${lx},${ly - 124} ${lx + 10},${ly - 100}" stroke="#2a2016" stroke-width="4" fill="none"/>`;
    return g;
  };
  // the hole: its far wall, the casket in it (the lid swinging up on its hinge along the far edge: its free edge runs
  // from the near edge, closed, up past the hinge, open; the satin lining shows once it is past edge-on), the light
  // inside, the near lip of the hole in the foreground
  S.grave = (t, o = {}) => {
    const { FAR, HINGE, NEARC, LIP, X0, X1 } = S.CM, lid = o.lid || 0, gl = o.glow ?? lid, r = rng(431);
    let g = `<path d="M-300,${FAR} L1380,${FAR} L1380,${LIP + 40} L-300,${LIP + 40}Z" fill="#120c08"/>`;
    g += lg('cmWall', [[0, '#2a1e14'], [1, '#0a0604']], 0, 0, 0, 1) + `<path d="M150,${FAR} L930,${FAR} L960,${HINGE + 40} L120,${HINGE + 40}Z" fill="url(#cmWall)"/>`;
    for (let i = 0; i < 30; i++) { const x = 160 + r() * 760, y = FAR + r() * (HINGE - FAR); g += `<path d="M${f(x)},${f(y)} l${f(6 + r() * 20)},${f(2 + r() * 6)}" stroke="#3a2a1a" stroke-width="2" opacity="0.6"/>`; }
    // the casket: the near side panel, then the top (the lid closed, or the open box and the lining)
    g += `<path d="M${X0 - 10},${NEARC} L${X1 + 10},${NEARC} L${X1 + 6},${NEARC + 64} L${X0 - 6},${NEARC + 64}Z" fill="#3a2414" ${ol(1.3)}/><path d="M${X0},${NEARC + 30} L${X1},${NEARC + 30}" stroke="#7a5a34" stroke-width="3" opacity="0.5"/>` + [X0 + 90, (X0 + X1) / 2, X1 - 90].map(x => `<rect x="${x - 26}" y="${NEARC + 20}" width="52" height="14" rx="5" fill="#8a7448" ${ol(1)}/>`).join('');
    const th = lid * Math.PI / 2, yF = HINGE + (NEARC - HINGE) * Math.cos(th) - 230 * Math.sin(th);
    // the quilted satin: diamonds of stitching with a button at each crossing, inside a box (x0..x1 along the top edge
    // at y0, the bottom edge at y1, dx the bottom's overhang), lit by the glow (k)
    const quilt = (x0, x1, y0, y1, dx, k, id) => {
      let q = `<defs><clipPath id="${id}"><path d="M${x0},${f(y0)} L${x1},${f(y0)} L${x1 + dx},${f(y1)} L${x0 - dx},${f(y1)}Z"/></clipPath>` + `<linearGradient id="${id}g" gradientUnits="userSpaceOnUse" x1="0" y1="${f(y0)}" x2="0" y2="${f(y1)}"><stop offset="0" stop-color="${mix('#3a3428', '#9ac880', k * 0.7)}"/><stop offset="1" stop-color="${mix('#4a4436', '#e0f8c8', k)}"/></linearGradient></defs>`;
      q += `<path d="M${x0},${f(y0)} L${x1},${f(y0)} L${x1 + dx},${f(y1)} L${x0 - dx},${f(y1)}Z" fill="url(#${id}g)"/><g clip-path="url(#${id})">`;
      const h = Math.abs(y1 - y0), n = Math.max(2, Math.round(h / 40)), st = 52;
      for (let xx = x0 - h; xx < x1 + h; xx += st) q += `<path d="M${f(xx)},${f(y0)} L${f(xx + h * 0.9)},${f(y1)} M${f(xx + h * 0.9)},${f(y0)} L${f(xx)},${f(y1)}" stroke="${mix('#2a2418', '#6a9a58', k)}" stroke-width="2" opacity="0.55"/>`;
      for (let xx = x0 - h; xx < x1 + h; xx += st) for (let r2 = 0; r2 <= n; r2++) { const yy = y0 + (y1 - y0) * (r2 / n); q += `<circle cx="${f(xx + (r2 % 2 ? st / 2 : 0))}" cy="${f(yy)}" r="3" fill="${mix('#1a1610', '#4a7a3a', k)}" opacity="0.7"/>`; }
      return q + `</g>`;
    };
    if (gl > 0.01 || lid > 0.01) {
      // the open box: its rim, the quilted lining, the pillow, you in your dress - the bones glowing through
      g += `<path d="M${X0 - 8},${HINGE - 6} L${X1 + 8},${HINGE - 6} L${X1 + 20},${NEARC + 4} L${X0 - 20},${NEARC + 4}Z" fill="#2a1a0e" ${ol(1.3)}/>`;
      g += quilt(X0 + 4, X1 - 4, HINGE + 4, NEARC - 6, 10, gl, 'cmQb');
      const by = (HINGE + NEARC) / 2, hx = X0 + 112, k = 0.62;
      g += `<ellipse cx="${X0 + 84}" cy="${by - 6}" rx="62" ry="${f(46 * k)}" fill="${mix('#4a463c', '#f0ffe4', 0.8 * gl)}" ${ol(1)}/>`;
      // you in your best dress (dusty rose silk gone dark): shoulders, the waist, the skirt flaring to the hem, the toes of
      // your shoes; a lace shawl over the arms crossed at the waist (no hands); the bones glow through
      const dr = mix('#4a3230', mix('#9a6e68', GLOW, 0.22), gl), drD = shade(dr, -0.35), X = (u, v) => `${f(u)},${f(by + v * k)}`;
      const sh0 = hx + 70, wa = hx + 230, hip = hx + 280, hem = X1 - 74;
      g += `<path d="M${X(sh0 - 14, -30)} C${X(sh0, -54)} ${X(sh0 + 30, -58)} ${X(sh0 + 60, -54)} C${X(wa - 50, -42)} ${X(wa, -36)} ${X(hip, -46)} C${X(hip + 120, -54)} ${X(hem - 60, -60)} ${X(hem, -62)} Q${X(hem + 12, 0)} ${X(hem, 62)} C${X(hem - 60, 60)} ${X(hip + 120, 54)} ${X(hip, 46)} C${X(wa, 36)} ${X(wa - 50, 42)} ${X(sh0 + 60, 54)} C${X(sh0 + 30, 58)} ${X(sh0, 54)} ${X(sh0 - 14, 30)}Z" fill="${dr}" ${ol(1.2)}/>`;
      for (const v of [-40, -16, 10, 34]) g += `<path d="M${X(hip + 10, v * 0.85)} C${X(hip + 120, v)} ${X(hem - 80, v * 1.15)} ${X(hem - 6, v * 1.25)}" stroke="${drD}" stroke-width="2.4" fill="none" opacity="0.6"/>`;
      g += `<path d="M${X(wa - 10, -38)} Q${X(wa + 6, 0)} ${X(wa - 10, 38)}" stroke="${drD}" stroke-width="3" fill="none" opacity="0.7"/>`;
      for (const v of [-22, 22]) g += `<path d="M${X(hem + 2, v - 10)} C${X(hem + 24, v - 12)} ${X(hem + 36, v - 4)} ${X(hem + 36, v)} C${X(hem + 36, v + 6)} ${X(hem + 20, v + 10)} ${X(hem + 2, v + 10)}Z" fill="${mix('#1a1410', '#3a5a30', gl * 0.6)}" ${ol(1)}/>`;
      const lc = mix('#5a564a', '#e8f8d8', 0.7 * gl);
      g += `<path d="M${X(sh0 + 70, -52)} C${X(sh0 + 96, -20)} ${X(sh0 + 96, 20)} ${X(sh0 + 70, 52)} L${X(wa - 6, 40)} C${X(wa + 14, 14)} ${X(wa + 14, -14)} ${X(wa - 6, -40)}Z" fill="${lc}" opacity="0.92" ${ol(1)}/>`;
      for (let i = 0; i < 6; i++) g += `<circle cx="${f(sh0 + 96 + i * 14)}" cy="${f(by + (i % 2 ? 16 : -16) * k)}" r="5" fill="none" stroke="${shade(lc, -0.35)}" stroke-width="1.6" opacity="0.7"/>`;
      g += `<path d="M${X(sh0 - 10, -26)} Q${X(sh0 + 30, -6)} ${X(sh0 + 64, -30)} M${X(sh0 - 10, 26)} Q${X(sh0 + 30, 6)} ${X(sh0 + 64, 30)}" stroke="${mix('#3a3a30', '#c8f0a8', gl)}" stroke-width="3" fill="none" opacity="0.7"/>`;
      // the skull on the pillow, lying with its crown toward the head of the coffin: the bone itself glows
      const sk = mix('#6a6a58', GLOW, 0.9 * gl), sd = mix('#14160e', '#2a4a20', gl);
      g += `<g transform="translate(${hx},${f(by)}) scale(1.18,${f(k * 1.18)})"><path d="M-36,0 C-36,-34 -10,-44 10,-40 C30,-36 40,-24 44,-12 L54,-12 C60,-6 60,6 54,12 L44,12 C40,24 30,36 10,40 C-10,44 -36,34 -36,0Z" fill="${sk}" ${ol(1.2)}/>` +
        `<ellipse cx="22" cy="-16" rx="9" ry="11" fill="${sd}"/><ellipse cx="22" cy="16" rx="9" ry="11" fill="${sd}"/><path d="M36,-4 L42,0 L36,4Z" fill="${sd}"/>` +
        `<path d="M48,-10 L48,10" stroke="${sd}" stroke-width="2.4"/>${[-6, -2, 2, 6].map(yy => `<path d="M44,${yy} L54,${yy}" stroke="${sd}" stroke-width="1.4" opacity="0.8"/>`).join('')}</g>`;
      g += glow(hx, by, 130, 0.55 * gl, '#eaffd0') + glow((X0 + X1) / 2, by, 520, 0.42 * gl) + glow((X0 + X1) / 2, by - 220, 760, 0.22 * gl);
    }
    // the lid: closed it covers the top; past edge-on (yF above the hinge) its quilted lining faces us, lit from inside
    if (yF > HINGE + 1) g += `<path d="M${X0 - 6},${HINGE} L${X1 + 6},${HINGE} L${X1 + 22},${f(yF)} L${X0 - 22},${f(yF)}Z" fill="#4a2e18" ${ol(1.4)}/><path d="M${X0 + 30},${f((HINGE + yF) / 2)} L${X1 - 30},${f((HINGE + yF) / 2)}" stroke="#7a5030" stroke-width="3" opacity="0.6"/>`;
    else if (yF < HINGE - 1) {
      g += `<path d="M${X0 - 8},${HINGE - 2} L${X1 + 8},${HINGE - 2} L${X1 + 2},${f(yF)} L${X0 - 2},${f(yF)}Z" fill="#3a2414" ${ol(1.4)}/>`;
      g += quilt(X0 + 14, X1 - 14, yF + 14, HINGE - 14, -2, gl * 0.85, 'cmQl');
      g += `<path d="M${X0 + 14},${f(yF + 14)} L${X1 - 14},${f(yF + 14)} L${X1 - 12},${HINGE - 14} L${X0 + 12},${HINGE - 14}Z" fill="none" stroke="#1a0e06" stroke-width="2" opacity="0.7"/>`;
    }
    // the near lip of the hole (the foreground), grass at its edge
    g += `<path d="M-300,${LIP} Q140,${LIP - 26} 540,${LIP - 10} Q920,${LIP + 6} 1380,${LIP - 20} L1380,2300 L-300,2300Z" fill="#1a120a" ${ol(1.3)}/>`;
    for (let i = 0; i < 60; i++) { const x = -260 + r() * 1600, y = LIP - 14 + r() * 20, h = 14 + r() * 26; g += `<path d="M${f(x)},${f(y)} q${f(-3 + r() * 6)},${f(-h * 0.6)} ${f(-6 + r() * 12)},${f(-h)}" stroke="#141a0e" stroke-width="3" fill="none"/>`; }
    if (gl > 0.01) g += `<path d="M-300,${LIP} Q140,${LIP - 26} 540,${LIP - 10} Q920,${LIP + 6} 1380,${LIP - 20}" stroke="${GLOW}" stroke-width="4" fill="none" opacity="${f(0.35 * gl)}" filter="url(#b2)"/>`;
    return g;
  };
})(window);
