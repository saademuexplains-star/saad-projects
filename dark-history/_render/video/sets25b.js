// Sets for the Coca-Cola video, part 2: the street outside the shop at night (Atlanta, 1885, rain); the macro tabletop
// (coca leaves, the cocaine, the kola nuts); the newspaper landing on the bench ("ATLANTA GOES DRY"); the soda tap at
// the fountain, the glass filling, the nickel; the fountain card that becomes the name; the antique map of the world.
(function (G) {
  const S = G.SETS, PR = G.PROPS, { f, mix, rng, ol, shade } = G.RIG, C = G.CINE, E = G.ENV, M = G.MAP18;
  const lg = S.lg, TXT = S.TXT, bottle = S.bottle, FONT = S.FONT;
  const cl = v => Math.max(0, Math.min(1, v)), ss = (a, b, x) => { const u = cl((x - a) / (b - a)); return u * u * (3 - 2 * u); };
  const fl = (t, seed) => 0.86 + 0.08 * Math.sin(t * 9 + seed) + 0.06 * Math.sin(t * 23 + seed * 2);
  const rain = (t, x0, y0, w, h, n, seed, op = 0.3, len = 34) => { const r = rng(seed); let g = ''; for (let i = 0; i < n; i++) { const x = x0 + r() * w, sp = 1400 + r() * 600, y = y0 + ((r() * h + t * sp) % h); g += `<path d="M${f(x)},${f(y)} l${f(-len * 0.12)},${f(len)}" stroke="#d8c8b0" stroke-width="${f(1 + r() * 1.2)}" opacity="${f(op * (0.4 + r() * 0.6))}"/>`; } return g; };
  S.rain = rain;

  // ======================================================= THE STREET, ATLANTA, 1885: J. S. Pemberton & Co., night, rain
  // world: the sign board at y 770-930, the display window x 120-900 / y 990-1560, the door 940-1150, the counter
  // inside at y 1420, the gas lamp's lantern at (60, 640), in front of the left pilaster, the kerb at y 1660
  S.ST = { LAMP: [60, 640], WIN: [120, 990, 900, 1560], COUNTER: 1420, SIGN: [640, 850] };
  S.street = (t) => {
    const L = [], r = rng(401);
    let sky = lg('stSky', [[0, '#080606'], [0.55, '#140e0b'], [1, '#2a1c14']]) + `<rect x="-900" y="-600" width="2900" height="3000" fill="url(#stSky)"/>`;
    for (let i = 0; i < 8; i++) sky += `<ellipse cx="${f(-200 + r() * 1500 + t * 4)}" cy="${f(-100 + r() * 400)}" rx="${f(300 + r() * 300)}" ry="${f(60 + r() * 50)}" fill="#3a2a20" opacity="${f(0.25 + r() * 0.25)}" filter="url(#b14)"/>`;
    // the rooftops across the way behind: chimneys, a spire, a few lit windows
    let sk = 'M-600,700 L-600,120', x = -600;
    while (x < 1700) { const w = 90 + r() * 160, h = 40 + r() * 140; sk += ` L${f(x)},${f(120 - h)} L${f(x + w * 0.2)},${f(120 - h)} L${f(x + w * 0.2)},${f(80 - h)} L${f(x + w * 0.32)},${f(80 - h)} L${f(x + w * 0.32)},${f(120 - h)} L${f(x + w)},${f(120 - h)}`; x += w; }
    sky += `<path d="${sk} L1700,700Z" fill="#0c0807"/>`;
    for (let i = 0; i < 9; i++) sky += `<rect x="${f(-500 + r() * 2000)}" y="${f(-20 + r() * 80)}" width="10" height="14" fill="#e8a050" opacity="${f(0.4 + r() * 0.4)}"/>`;
    L.push({ p: 0.35, svg: `<g filter="url(#dof2)">${sky}</g>` });
    // the shop's facade: three storeys of red brick, cornice, sash windows, the gilt sign, the shop front
    let w = `<rect x="-380" y="60" width="1840" height="1620" fill="#4a2418"/>`;
    for (let y = 70, row = 0; y < 1680; y += 30, row++) { w += `<path d="M-380,${y} L1460,${y}" stroke="#24100a" stroke-width="2.6" opacity="0.75"/>`; for (let xx = -380 + (row % 2) * 36; xx < 1460; xx += 72) w += `<path d="M${xx},${y} L${xx},${y + 30}" stroke="#24100a" stroke-width="2.6" opacity="0.6"/><rect x="${xx + 2}" y="${y + 2}" width="68" height="26" fill="${mix('#5a2a1c', '#6e3624', r())}" opacity="0.5"/>`; }
    w += `<rect x="-380" y="40" width="1840" height="44" fill="#2a1a12" ${ol(1.3)}/><rect x="-380" y="84" width="1840" height="16" fill="#1a100a"/>` + Array.from({ length: 46 }, (_, i) => `<rect x="${-380 + i * 40}" y="100" width="20" height="16" fill="#1a100a"/>`).join('');
    for (const wx of [40, 420, 800]) { w += `<rect x="${wx - 14}" y="246" width="248" height="22" fill="#6a5a4a" ${ol(1.2)}/><rect x="${wx}" y="268" width="220" height="380" fill="#120c0a" ${ol(1.3)}/><path d="M${wx + 110},268 L${wx + 110},648 M${wx},458 L${wx + 220},458" stroke="#3a2a1e" stroke-width="9"/><rect x="${wx - 16}" y="648" width="252" height="18" fill="#6a5a4a" ${ol(1.2)}/><path d="M${wx + 10},280 L${wx + 90},280 L${wx + 10},400Z" fill="#fff" opacity="0.06"/>`; }
    w += `<rect x="434" y="282" width="82" height="164" fill="#c87a3a" opacity="0.7"/><rect x="434" y="282" width="82" height="164" fill="#ffd090" opacity="0.3" filter="url(#b8)"/>`;
    // the sign board: black, a moulded gilt frame, the gilt letters with a dark drop shadow
    w += `<rect x="70" y="756" width="1140" height="188" fill="#0e0a08" ${ol(1.6)}/>` + lg('stGilt', [[0, '#fff0b0'], [0.35, '#d8a848'], [0.6, '#8a5a1a'], [1, '#e8c070']]) + `<rect x="82" y="768" width="1116" height="164" fill="none" stroke="url(#stGilt)" stroke-width="8"/><rect x="96" y="782" width="1088" height="136" fill="none" stroke="#8a6a2a" stroke-width="1.6"/>`;
    w += TXT(643, 866, 84, '#000', 'J. S. PEMBERTON &amp; CO.', { font: FONT.play, w: 'bold', len: 1000, op: 0.7 }) + TXT(640, 862, 84, 'url(#stGilt)', 'J. S. PEMBERTON &amp; CO.', { font: FONT.play, w: 'bold', len: 1000 });
    w += TXT(641, 910, 30, '#000', 'DRUGGISTS · CHEMISTS', { font: FONT.old, w: 'bold', ls: 6, len: 520, op: 0.7 }) + TXT(640, 908, 30, '#e0b860', 'DRUGGISTS · CHEMISTS', { font: FONT.old, w: 'bold', ls: 6, len: 520 });
    // the shop front: pilasters, the stall board, the door with its transom and number
    w += `<rect x="70" y="944" width="1140" height="40" fill="#2a160c" ${ol(1.3)}/>`;
    for (const px of [70, 904, 1150]) w += `<rect x="${px}" y="984" width="60" height="700" fill="#3a2010" filter="url(#woodV)" ${ol(1.3)}/><rect x="${px + 8}" y="984" width="10" height="700" fill="#8a5a30" opacity="0.35"/>`;
    w += `<rect x="130" y="1560" width="774" height="124" fill="#2e180c" filter="url(#woodV)" ${ol(1.3)}/><rect x="150" y="1580" width="734" height="84" fill="none" stroke="#5a3418" stroke-width="4"/>`;
    w += `<rect x="964" y="984" width="186" height="700" fill="#2a160c" ${ol(1.3)}/><rect x="980" y="1050" width="154" height="320" fill="#8a4e22" opacity="0.9"/><rect x="980" y="1050" width="154" height="320" fill="#ffc070" opacity="0.25" filter="url(#b8)"/><rect x="990" y="1400" width="134" height="250" fill="#3a2010" ${ol(1.1)}/><circle cx="1124" cy="1380" r="9" fill="#c8963a" ${ol(1)}/>`;
    w += `<rect x="964" y="988" width="186" height="56" fill="#1a0e08"/>` + TXT(1057, 1028, 30, '#e0b860', 'No. 107', { font: FONT.play, it: true });
    L.push({ p: 0.9, svg: w });
    return L;
  };
  // inside the display window (drawn between the facade layer and the glass): the shop lit by its hanging lamp, the
  // shelves of bottles, the two show globes (red and green) in the window, the counter; P = you inside (lit svg)
  S.shopInside = (t, P = '') => {
    const [x0, y0, x1, y1] = S.ST.WIN, r = rng(411), k = fl(t, 4);
    let g = `<defs><clipPath id="stWin"><rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}"/></clipPath></defs><g clip-path="url(#stWin)">`;
    g += lg('stIn', [[0, '#5a3418'], [0.6, '#7a4a22'], [1, '#3a2010']]) + `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="url(#stIn)"/>`;
    for (const sy of [1060, 1180, 1300]) { g += `<rect x="${x0}" y="${sy}" width="${x1 - x0}" height="10" fill="#2a160a"/>`; let x = x0 + 10; while (x < x1 - 20) { const h = 50 + r() * 50, kind = ['round', 'tall', 'square', 'jar'][Math.floor(r() * 4)]; const wd = kind === 'jar' ? h * 0.66 : kind === 'tall' ? h * 0.3 : h * 0.44; g += bottle(x + wd / 2, sy, h, kind, kind === 'jar' ? '#e0d6c0' : ['#5a3410', '#2e4a2a', '#7a2a14', '#6a4a1a'][Math.floor(r() * 4)], r, 0.9); x += wd + 4 + r() * 8; } }
    g += C.radial(520, 1040, 520, '#ffc070', 0.45 * k);
    g += P;
    // the counter inside, in front of you
    g += `<rect x="${x0}" y="${S.ST.COUNTER}" width="${x1 - x0}" height="${y1 - S.ST.COUNTER}" fill="#3a2010" filter="url(#woodH)"/><rect x="${x0}" y="${S.ST.COUNTER}" width="${x1 - x0}" height="8" fill="#c88a50" opacity="0.5"/>`;
    // the show globes on their pedestals in the window, glowing
    for (const [gx, col] of [[230, '#b8241a'], [790, '#3a7a3a']]) {
      g += `<rect x="${gx - 30}" y="1440" width="60" height="120" fill="#c8a050" ${ol(1.2)}/><path d="M${gx - 44},1440 L${gx + 44},1440 L${gx + 30},1420 L${gx - 30},1420Z" fill="#a8803a" ${ol(1.1)}/>`;
      g += `<path d="M${gx - 14},1420 L${gx - 14},1392 C${gx - 90},1380 ${gx - 96},1230 ${gx},1210 C${gx + 96},1230 ${gx + 90},1380 ${gx + 14},1392 L${gx + 14},1420Z" fill="${col}" opacity="0.9" ${ol(1.4)}/><path d="M${gx - 8},1210 L${gx - 6},1150 L${gx + 6},1150 L${gx + 8},1210" fill="${col}" opacity="0.8" ${ol(1.1)}/><circle cx="${gx}" cy="1140" r="16" fill="${col}" ${ol(1.1)}/>`;
      g += `<ellipse cx="${gx - 34}" cy="1270" rx="14" ry="40" fill="#fff" opacity="0.35"/>` + C.radial(gx, 1300, 200, col, 0.35);
    }
    // the glass: reflections of the street, the lamp, rain running down
    g += `<path d="M${x0},${y0} L${x0 + 260},${y0} L${x0 + 60},${y1} L${x0 - 200},${y1}Z" fill="#fff" opacity="0.05"/><path d="M${x0 + 420},${y0} L${x0 + 520},${y0} L${x0 + 320},${y1} L${x0 + 220},${y1}Z" fill="#fff" opacity="0.04"/>` + C.radial(200, 1100, 160, '#ffd8a0', 0.18);
    for (let i = 0; i < 24; i++) { const rx2 = x0 + r() * (x1 - x0), sp = 30 + r() * 60, ry2 = y0 + ((r() * (y1 - y0) + t * sp) % (y1 - y0)); g += `<path d="M${f(rx2)},${f(ry2)} q2,8 0,${f(14 + r() * 18)}" stroke="#e8d8c0" stroke-width="2.4" fill="none" opacity="0.25"/><circle cx="${f(rx2)}" cy="${f(ry2 + 20)}" r="2.4" fill="#fff" opacity="0.3"/>`; }
    g += `</g><rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="none" stroke="#1a0e06" stroke-width="10"/><path d="M${(x0 + x1) / 2},${y0} L${(x0 + x1) / 2},${y1}" stroke="#2a160a" stroke-width="8"/>`;
    return g;
  };
  // the gas lamp on the kerb (in front), its lantern hissing in the rain
  S.gasLamp = (t) => {
    const [x, y] = S.ST.LAMP, k = fl(t, 9);
    let g = `<path d="M${x - 9},${y + 60} L${x - 13},1700 L${x + 13},1700 L${x + 9},${y + 60}Z" fill="#141210" ${ol(1.3)}/><path d="M${x + 4},${y + 70} L${x + 6},1690" stroke="#5a5048" stroke-width="3" opacity="0.6"/>`;
    g += `<path d="M${x - 30},${y + 70} L${x + 30},${y + 70} L${x + 22},${y + 50} L${x - 22},${y + 50}Z" fill="#1a1816" ${ol(1.2)}/><path d="M${x - 36},${y - 50} L${x + 36},${y - 50} L${x + 24},${y + 50} L${x - 24},${y + 50}Z" fill="#ffe0a0" ${ol(1.3)}/><path d="M${x},${y - 50} L${x},${y + 50} M${x - 30},${y} L${x + 30},${y}" stroke="#1a1816" stroke-width="3"/>`;
    g += `<path d="M${x - 46},${y - 50} L${x},${y - 92} L${x + 46},${y - 50}Z" fill="#1a1816" ${ol(1.3)}/><circle cx="${x}" cy="${y - 98}" r="8" fill="#1a1816"/><path d="M${x - 50},${y - 50} L${x + 50},${y - 50}" stroke="#2a2826" stroke-width="5"/>`;
    g += C.bloom(x, y, 80 * k, '#ffd090', 0.7) + C.radial(x, y, 420, '#ffb860', 0.3 * k);
    return g;
  };
  // the wet pavement and cobbles in front, the shop's light lying on them in streaks
  S.streetGround = (t) => {
    const r = rng(421);
    let g = `<rect x="-400" y="1660" width="1900" height="60" fill="#3a2e26" ${ol(1.3)}/><rect x="-400" y="1660" width="1900" height="8" fill="#8a7a6a" opacity="0.5"/>`;
    g += `<rect x="-400" y="1720" width="1900" height="700" fill="#140e0b"/>`;
    for (let row = 0; row < 12; row++) { const y = 1730 + row * 30 + row * row * 1.2, h = 22 + row * 2.4; for (let x = -400 + (row % 2) * 30; x < 1500; x += 64 + row * 3) g += `<ellipse cx="${x}" cy="${f(y)}" rx="${f(28 + row * 1.6)}" ry="${f(h * 0.45)}" fill="${mix('#2a2018', '#3a2c22', r())}" opacity="0.9"/><ellipse cx="${x - 6}" cy="${f(y - h * 0.15)}" rx="${f(12 + row)}" ry="${f(h * 0.12)}" fill="#c8a070" opacity="${f(0.06 + 0.1 * r())}"/>`; }
    // reflections: the window, the door, the gas lamp - long wobbling vertical streaks
    for (const [x, w, col, op] of [[510, 700, '#ffb060', 0.28], [1057, 160, '#ffa850', 0.2], [S.ST.LAMP[0], 70, '#ffd090', 0.35], [230, 70, '#c83a2a', 0.22], [790, 70, '#4a8a4a', 0.18]]) g += `<rect x="${x - w / 2}" y="1720" width="${w}" height="600" fill="${col}" opacity="${op}" filter="url(#b14)"/>`;
    for (let i = 0; i < 40; i++) { const x = r() * 1100, y = 1740 + r() * 500; g += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(6 + r() * 10)}" ry="1.6" fill="#f0d0a0" opacity="${f(0.15 + 0.2 * Math.sin(t * 3 + i))}"/>`; }
    return g;
  };
  S.streetFg = (t) => `<g>${rain(t, -300, -200, 1700, 2400, 90, 431, 0.32, 44)}</g>`;

  // ======================================================= THE MACRO TABLE: coca leaves, the cocaine, the kola nuts
  // world: brown paper across x -60..900 on the bench; the sack at the left; the vial at x 1060; the kola at 1560
  S.MC = { VIAL: [1060, 1600], KOLA: [1560, 1610], SACK: [60, 1330] };
  // a coca leaf: oval, a short point, the midrib and the two curved lines either side of it that mark a coca leaf
  const cocaLeaf = (x, y, s, rot, col, dry = 0) => {
    const c = mix(col, '#7a6a34', dry), dk = shade(c, -0.4), lt = shade(c, 0.35);
    return `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)}) scale(${f(s)})"><path d="M-60,0 C-52,-22 -18,-30 14,-26 C40,-22 56,-10 64,0 C56,10 40,22 14,26 C-18,30 -52,22 -60,0Z" fill="${c}" stroke="${shade(c, -0.55)}" stroke-width="1.6"/>` +
      `<path d="M-58,0 C-20,-2 30,-2 62,0" stroke="${lt}" stroke-width="2" fill="none" opacity="0.8"/><path d="M-44,-4 C-20,-14 20,-15 50,-6 M-44,4 C-20,14 20,15 50,6" stroke="${dk}" stroke-width="1.3" fill="none" opacity="0.6"/>` +
      [-34, -14, 6, 26, 44].map(vx => `<path d="M${vx},0 L${vx + 10},-${f(16 - Math.abs(vx) * 0.12)} M${vx},0 L${vx + 10},${f(16 - Math.abs(vx) * 0.12)}" stroke="${dk}" stroke-width="0.9" opacity="0.4"/>`).join('') +
      `<path d="M-50,-8 C-30,-20 0,-24 24,-20" stroke="#fff" stroke-width="2.4" fill="none" opacity="0.18" stroke-linecap="round"/><path d="M-62,0 L-80,2" stroke="${dk}" stroke-width="3" stroke-linecap="round"/></g>`;
  };
  S.cocaLeaf = cocaLeaf;
  // the leaves on the paper, and the ones still sliding out of the sack (spill 0..1)
  S.MC_LEAVES = (() => { const r = rng(501), out = []; for (let i = 0; i < 46; i++) out.push({ x: 120 + r() * 720, y: 1420 + r() * 200, s: 0.8 + r() * 0.5, rot: r() * 360, col: mix('#3e5a22', '#6a7e34', r()), dry: r() < 0.3 ? 0.6 : r() * 0.25 }); out.sort((a, b) => a.y - b.y); return out; })();
  S.MC_FALL = (() => { const r = rng(511), out = []; for (let i = 0; i < 9; i++) out.push({ t0: r() * 0.7, x1: 180 + r() * 420, y1: 1450 + r() * 140, r0: r() * 360, r1: r() * 360 + 200, s: 0.85 + r() * 0.4, col: mix('#3e5a22', '#6a7e34', r()), dry: r() * 0.3 }); return out; })();
  S.macroBack = (t) => {
    const L = [];
    // the back room far behind, out of focus: dark shelves, the lamp's warm glow at the left (no discs of light)
    let b = `<rect x="-900" y="-400" width="3400" height="2800" fill="#1a0f08"/>`;
    for (let i = 0; i < 4; i++) b += `<rect x="-900" y="${300 + i * 260}" width="3400" height="24" fill="#3a2414" opacity="0.6"/>`;
    const r = rng(521); for (let i = 0; i < 40; i++) { const x = -600 + r() * 3000, y = 140 + Math.floor(r() * 4) * 260 + 160, h = 90 + r() * 70; b += `<rect x="${f(x)}" y="${f(y - h)}" width="${f(h * 0.4)}" height="${f(h)}" rx="8" fill="${['#3a2010', '#2a3a20', '#4a2414', '#5a4020'][Math.floor(r() * 4)]}" opacity="0.6"/>`; }
    b += C.radial(80, 700, 1100, '#ffa850', 0.32) + lg('mcFall', [[0, '#000', 0], [0.5, '#000', 0.3], [1, '#000', 0.7]], 0, 0, 1, 0) + `<rect x="-900" y="-400" width="3400" height="2800" fill="url(#mcFall)"/>`;
    L.push({ p: 0.5, svg: `<g filter="url(#dof3)">${b}</g>` });
    return L;
  };
  // the tabletop: the bench's oak seen low and close, the paper, the sack, the leaves (spill), the vial, the kola nuts
  // (split 0..1: the split nut opening)
  S.macroTable = (t, o = {}) => {
    const r = rng(531), spill = o.spill ?? 1, split = o.split ?? 0;
    let g = lg('mcTop', [[0, '#2e1a0c'], [0.25, '#4a2c16'], [1, '#5a3a1e']]) + `<path d="M-900,1300 L2600,1300 L2600,2400 L-900,2400Z" fill="url(#mcTop)" filter="url(#woodH)"/>`;
    for (let i = 0; i < 16; i++) { const y = 1310 + i * i * 4.2; g += `<path d="M-900,${f(y)} L2600,${f(y + (r() - 0.5) * 8)}" stroke="#1a0c04" stroke-width="${f(1 + i * 0.15)}" opacity="0.35"/>`; }
    g += C.radial(200, 1400, 1300, '#ffb060', 0.26);
    // the brown paper
    g += `<path d="M-80,1380 L900,1360 L960,1720 L-120,1740Z" fill="#9a7a50" ${ol(1.4)}/><path d="M-80,1380 L900,1360 L960,1720 L-120,1740Z" fill="#000" opacity="0.08" filter="url(#tex)"/><path d="M300,1372 L320,1730" stroke="#7a5a34" stroke-width="2" opacity="0.5"/>`;
    for (const lf of S.MC_LEAVES) g += cocaLeaf(lf.x, lf.y, lf.s * 1.15, lf.rot, lf.col, lf.dry);
    // the sack lying on its side, its mouth open toward the paper
    const [sx, sy] = S.MC.SACK;
    g += `<path d="M${sx - 300},${sy + 150} C${sx - 330},${sy - 40} ${sx - 220},${sy - 160} ${sx - 40},${sy - 150} C${sx + 80},${sy - 140} ${sx + 150},${sy - 90} ${sx + 170},${sy - 20} C${sx + 190},${sy + 60} ${sx + 150},${sy + 150} ${sx + 60},${sy + 170} Z" fill="#8a7450" ${ol(1.5)}/>`;
    for (let i = 0; i < 12; i++) g += `<path d="M${sx - 280 + i * 36},${sy - 120 + (i % 3) * 8} q10,120 -4,260" stroke="#5a4a30" stroke-width="2" fill="none" opacity="0.4"/>`;
    g += `<ellipse cx="${sx + 150}" cy="${sy + 20}" rx="44" ry="120" fill="#3a2e1c" ${ol(1.2)}/><path d="M${sx + 120},${sy - 90} C${sx + 170},${sy - 110} ${sx + 200},${sy - 60} ${sx + 190},${sy}" stroke="#5a4a30" stroke-width="6" fill="none"/>` + `<g transform="translate(${sx - 90},${sy + 10}) rotate(-6)">` + TXT(0, 0, 40, '#3a2a14', 'COCA', { font: FONT.rye, op: 0.8 }) + TXT(0, 34, 18, '#3a2a14', 'BOLIVIA', { font: FONT.old, ls: 3, op: 0.75 }) + `</g>`;
    for (let i = 0; i < 6; i++) g += cocaLeaf(sx + 150 + (r() - 0.5) * 30, sy - 40 + i * 22, 0.9, 80 + r() * 40, mix('#3e5a22', '#5e6e2a', r()), 0.2);
    // the leaves sliding out of the sack mouth and tumbling onto the paper
    for (const lf of S.MC_FALL) { const u = ss(lf.t0, lf.t0 + 0.3, spill); if (u <= 0) continue; const x = sx + 160 + (lf.x1 - sx - 160) * u, y = sy + 10 + (lf.y1 - sy - 10) * u - Math.sin(Math.PI * u) * 60; g += cocaLeaf(x, y, lf.s * 1.15, lf.r0 + (lf.r1 - lf.r0) * u, lf.col, lf.dry); }
    // the cocaine: a stoppered glass vial of white crystals, its label, a little heap spilled beside it and a spoon
    const [vx, vy] = S.MC.VIAL;
    g += `<ellipse cx="${vx + 6}" cy="${vy + 6}" rx="96" ry="20" fill="#000" opacity="0.5" filter="url(#b8)"/>`;
    g += `<path d="M${vx - 70},${vy} L${vx - 70},${vy - 300} Q${vx - 70},${vy - 330} ${vx - 40},${vy - 340} L${vx - 36},${vy - 380} L${vx + 36},${vy - 380} L${vx + 40},${vy - 340} Q${vx + 70},${vy - 330} ${vx + 70},${vy - 300} L${vx + 70},${vy}Z" fill="#e8f0ee" fill-opacity="0.16" ${ol(1.8)}/>`;
    g += `<path d="M${vx - 64},${vy - 6} L${vx - 64},${vy - 150} Q${vx - 30},${vy - 168} ${vx},${vy - 160} Q${vx + 34},${vy - 152} ${vx + 64},${vy - 166} L${vx + 64},${vy - 6}Z" fill="#f2f0ea"/>`;
    for (let i = 0; i < 40; i++) g += `<circle cx="${f(vx - 58 + r() * 116)}" cy="${f(vy - 14 - r() * 140)}" r="${f(1.5 + r() * 2.5)}" fill="#fff" opacity="${f(0.5 + r() * 0.5)}"/><circle cx="${f(vx - 58 + r() * 116)}" cy="${f(vy - 14 - r() * 140)}" r="${f(1 + r() * 2)}" fill="#c8c4bc" opacity="0.6"/>`;
    g += `<path d="M${vx - 46},${vy - 386} L${vx + 46},${vy - 386} L${vx + 40},${vy - 440} Q${vx},${vy - 452} ${vx - 40},${vy - 440}Z" fill="#a8845a" ${ol(1.4)}/><path d="M${vx - 34},${vy - 432} L${vx + 30},${vy - 436}" stroke="#d8b888" stroke-width="3" opacity="0.6"/>`;
    g += `<rect x="${vx - 62}" y="${vy - 290}" width="124" height="108" fill="#ece2c8" ${ol(1.2)}/><rect x="${vx - 56}" y="${vy - 284}" width="112" height="96" fill="none" stroke="#5a1a10" stroke-width="2"/>`;
    g += TXT(vx, vy - 250, 22, '#1a1008', 'COCAINE', { font: FONT.play, w: 'bold', len: 100 }) + TXT(vx, vy - 228, 11, '#5a1a10', 'HYDROCHLOR.', { font: FONT.old, len: 84 }) + `<path d="M${vx - 40},${vy - 220} L${vx + 40},${vy - 220}" stroke="#5a1a10" stroke-width="1.2"/>` + TXT(vx, vy - 202, 10, '#3a2a1a', '1 oz. · POISON', { font: FONT.old, len: 80 });
    g += `<path d="M${vx - 62},${vy - 20} L${vx - 62},${vy - 320}" stroke="#fff" stroke-width="8" opacity="0.32" stroke-linecap="round"/><path d="M${vx + 58},${vy - 30} L${vx + 58},${vy - 300}" stroke="#ffd0a0" stroke-width="4" opacity="0.3"/>`;
    g += `<path d="M${vx + 90},${vy + 10} Q${vx + 150},${vy - 26} ${vx + 210},${vy + 12}Z" fill="#f4f2ec"/>` + Array.from({ length: 14 }, (_, i) => `<circle cx="${f(vx + 100 + r() * 100)}" cy="${f(vy + 6 - r() * 16)}" r="${f(1.5 + r() * 2)}" fill="#fff"/>`).join('');
    g += `<path d="M${vx + 120},${vy + 2} L${vx + 300},${vy - 34}" stroke="#a8a8a2" stroke-width="7" stroke-linecap="round"/><ellipse cx="${vx + 128}" cy="${vy}" rx="22" ry="11" fill="#c8c8c2" ${ol(1.1)}/><path d="M${vx + 140},${vy - 6} L${vx + 296},${vy - 36}" stroke="#fff" stroke-width="2" opacity="0.6"/>`;
    // the kola nuts: lumpy red-brown seeds; the one in front splitting into its two pale halves
    // a kola nut: a lumpy seed with flat faces where it pressed against the others in the pod, a groove, a matte skin
    const [kx, ky] = S.MC.KOLA, nut = (x, y, s, rot, col) => `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)}) scale(${f(s)})"><path d="M-56,14 C-62,-14 -50,-40 -22,-50 C-2,-56 26,-54 44,-38 C60,-24 62,0 54,18 L40,38 C24,52 -6,56 -28,48 C-44,42 -54,30 -56,14Z" fill="${col}" stroke="${shade(col, -0.6)}" stroke-width="2"/><path d="M54,18 L40,38 C30,30 34,16 54,18Z" fill="${shade(col, -0.25)}"/><path d="M-4,-54 C-10,-20 -6,18 -2,52" stroke="${shade(col, -0.45)}" stroke-width="2.4" fill="none"/><path d="M-38,-6 q8,-4 14,2 M12,-20 q8,-6 16,0 M-20,22 q10,-4 16,4 M18,10 q6,-4 12,2" stroke="${shade(col, -0.35)}" stroke-width="1.4" fill="none" opacity="0.6"/><ellipse cx="-18" cy="-26" rx="16" ry="9" fill="${shade(col, 0.25)}" opacity="0.35"/><path d="M-40,-20 C-30,-36 -14,-40 -4,-36" stroke="#d8a07a" stroke-width="4" fill="none" opacity="0.3" stroke-linecap="round"/><path d="M-30,10 C-20,24 0,30 18,26 M14,-30 C26,-20 34,-6 36,8" stroke="#2a0c06" stroke-width="2" fill="none" opacity="0.35"/><ellipse cx="22" cy="18" rx="14" ry="8" fill="#000" opacity="0.15"/></g>`;
    g += `<ellipse cx="${kx}" cy="${ky + 10}" rx="320" ry="40" fill="#000" opacity="0.35" filter="url(#b8)"/>`;
    // (kola is a dull maroon-brown, not a bright red: the first colours read as tomatoes)
    g += nut(kx - 210, ky - 60, 1.15, -20, '#5a2616') + nut(kx + 150, ky - 80, 1.05, 30, '#663020') + nut(kx + 250, ky - 10, 1.2, -50, '#4e2012') + nut(kx - 300, ky + 10, 1.0, 60, '#6a3420');
    const sp = split, hx = 30 * sp, hr = 18 * sp;
    for (const s2 of [-1, 1]) g += `<g transform="translate(${f(kx + s2 * hx)},${ky}) rotate(${f(s2 * hr)})"><path d="M0,-58 C${s2 * 44},-62 ${s2 * 76},-30 ${s2 * 72},6 C${s2 * 68},42 ${s2 * 30},60 0,56 Z" fill="#5e2818" stroke="#2a0c06" stroke-width="2.2"/><path d="M0,-52 C${s2 * 36},-54 ${s2 * 62},-26 ${s2 * 60},4 C${s2 * 56},36 ${s2 * 26},50 0,48 Z" fill="${mix('#5e2818', '#d49a86', ss(0, 0.5, sp))}"/><path d="M${s2 * 8},-30 C${s2 * 24},-10 ${s2 * 24},16 ${s2 * 8},34" stroke="#c88a76" stroke-width="2" fill="none" opacity="${f(sp)}"/></g>`;
    if (sp > 0.05) g += `<path d="M${kx - hx * 0.4},${ky - 54} L${kx + hx * 0.4},${ky - 54} L${kx + hx * 0.4},${ky + 52} L${kx - hx * 0.4},${ky + 52}Z" fill="#1a0804" opacity="${f(0.8 * sp)}"/>`;
    return g;
  };
  S.macroFg = (t) => `<g filter="url(#dof3)">` + cocaLeaf(120, 1900, 2.6, 20, '#3e5a22', 0.1) + cocaLeaf(1500, 1960, 2.4, -30, '#5e6e2a', 0.4) + `</g>`;

  // ======================================================= THE NEWSPAPER (BAN): the bench seen from above
  // world: the bench top fills the frame; the paper lands centred at (540, 1000)
  S.banTable = (t, jolt = 0) => {
    const r = rng(601);
    let g = `<rect x="-600" y="-500" width="2300" height="2900" fill="#4a2c16" filter="url(#woodH)"/>`;
    for (let i = 0; i < 18; i++) g += `<path d="M-600,${-480 + i * 160} L1700,${-480 + i * 160 + (r() - 0.5) * 10}" stroke="#1a0c04" stroke-width="5" opacity="0.6"/>`;
    for (let i = 0; i < 40; i++) { const x = -500 + r() * 2100, y = -400 + r() * 2700; g += `<path d="M${f(x)},${f(y)} l${f(60 + r() * 140)},${f((r() - 0.5) * 6)}" stroke="#a87a4a" stroke-width="1.4" opacity="0.25"/>`; }
    g += C.radial(240, 500, 1500, '#ffb060', 0.3);
    // bottles of the wine coca lying on the bench (seen from above they show their side), rattling
    for (const [x, y, rot, i] of [[110, 1560, -24, 0], [880, 1500, 22, 1], [520, 1760, 84, 2], [960, 560, -64, 3]]) { const jx = jolt * Math.sin(i * 7 + t * 60) * 6, jr = jolt * Math.sin(i * 5 + t * 50) * 4; g += `<g transform="translate(${f(x + jx)},${f(y)}) rotate(${f(rot + jr + 90)}) translate(0,150)"><ellipse cx="8" cy="-150" rx="48" ry="160" fill="#000" opacity="0.4" filter="url(#b8)"/>${S.wcBottle(0, 0, 300)}</g>`; }
    for (let i = 0; i < 10; i++) g += S.cocaLeaf(-80 + r() * 1300, 300 + r() * 1700, 0.9 + r() * 0.4, r() * 360, mix('#3e5a22', '#6a6a2a', r()), r() * 0.5);
    return g;
  };
  // the paper (x, y = its centre; s = scale; rot = deg; the headline the reader is shown)
  S.NP = { W: 860, H: 1180 };
  S.newspaper = (x, y, s = 1, rot = 0, shadow = 1) => {
    const W = S.NP.W, H = S.NP.H, r = rng(611);
    let g = `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)}) scale(${f(s)})">`;
    g += `<rect x="${-W / 2 + 18 * shadow}" y="${-H / 2 + 26 * shadow}" width="${W}" height="${H}" fill="#000" opacity="${f(0.45 * Math.min(1, shadow))}" filter="url(#b14)"/>`;
    g += lg('npP', [[0, '#e8dcc0'], [0.5, '#e0d2b2'], [1, '#d4c4a0']], 0, 0, 1, 1) + `<rect x="${-W / 2}" y="${-H / 2}" width="${W}" height="${H}" fill="url(#npP)" ${ol(1.2)}/>`;
    const X0 = -W / 2 + 40, X1 = W / 2 - 40, Y0 = -H / 2;
    g += TXT(0, Y0 + 92, 64, '#14100c', 'The Atlanta Daily Herald', { font: FONT.script, len: 640 });
    g += `<path d="M${X0},${Y0 + 112} L${X1},${Y0 + 112} M${X0},${Y0 + 140} L${X1},${Y0 + 140}" stroke="#14100c" stroke-width="2.4"/>` + TXT(0, Y0 + 131, 15, '#14100c', 'ATLANTA, GEORGIA, THURSDAY MORNING, NOVEMBER 26, 1885 · PRICE FIVE CENTS', { font: FONT.old, len: 740 });
    g += TXT(0, Y0 + 262, 124, '#0e0a08', 'ATLANTA', { font: FONT.abril, len: 760 }) + TXT(0, Y0 + 392, 124, '#0e0a08', 'GOES DRY!', { font: FONT.abril, len: 760 });
    g += `<path d="M${X0},${Y0 + 420} L${X1},${Y0 + 420}" stroke="#14100c" stroke-width="2"/>`;
    g += TXT(0, Y0 + 458, 28, '#14100c', 'PROHIBITION CARRIES THE CITY', { font: FONT.play, w: 'bold', len: 640 }) + TXT(0, Y0 + 494, 20, '#14100c', 'The Saloons to Close · All Sale of Liquor and Wine Forbidden', { font: FONT.old, it: true, len: 640 });
    g += `<path d="M${X0},${Y0 + 514} L${X1},${Y0 + 514}" stroke="#14100c" stroke-width="1.2"/>`;
    // the columns of small print, and an engraving of a shuttered saloon in the middle column
    const cols = 4, cw = (X1 - X0) / cols;
    for (let c = 0; c < cols; c++) { const cx0 = X0 + c * cw + 8, cx1 = X0 + (c + 1) * cw - 8; if (c) g += `<path d="M${X0 + c * cw},${Y0 + 530} L${X0 + c * cw},${H / 2 - 40}" stroke="#14100c" stroke-width="1"/>`; for (let yy = Y0 + 540; yy < H / 2 - 50; yy += 13) { if ((c === 1 || c === 2) && yy > Y0 + 560 && yy < Y0 + 820) continue; const w = (cx1 - cx0) * (0.75 + r() * 0.25); g += `<path d="M${f(cx0)},${f(yy)} L${f(cx0 + w)},${f(yy)}" stroke="#2a2018" stroke-width="3.2" opacity="${f(0.35 + r() * 0.25)}"/>`; } }
    const ex0 = X0 + cw + 10, ex1 = X0 + 3 * cw - 10, ey0 = Y0 + 566, ey1 = Y0 + 814;
    g += `<rect x="${ex0}" y="${ey0}" width="${ex1 - ex0}" height="${ey1 - ey0}" fill="#d8c8a6" stroke="#14100c" stroke-width="1.6"/>`;
    for (let i = 0; i < 30; i++) g += `<path d="M${ex0},${ey0 + i * 8.3} L${ex1},${ey0 + i * 8.3}" stroke="#2a2018" stroke-width="1" opacity="0.25"/>`;
    g += `<path d="M${ex0 + 60},${ey1} L${ex0 + 60},${ey0 + 90} L${ex1 - 60},${ey0 + 90} L${ex1 - 60},${ey1}" fill="#3a2e22" stroke="#14100c" stroke-width="2"/><rect x="${ex0 + 80}" y="${ey0 + 40}" width="${ex1 - ex0 - 160}" height="44" fill="#e0d2b2" stroke="#14100c" stroke-width="2"/>` + TXT((ex0 + ex1) / 2, ey0 + 72, 28, '#14100c', 'SALOON', { font: FONT.rye, len: 160 });
    for (let i = 0; i < 6; i++) g += `<path d="M${ex0 + 70 + i * 54},${ey0 + 100} L${ex0 + 70 + i * 54},${ey1 - 6}" stroke="#14100c" stroke-width="7"/>`;
    g += `<path d="M${ex0 + 70},${ey0 + 150} L${ex1 - 70},${ey1 - 30} M${ex1 - 70},${ey0 + 150} L${ex0 + 70},${ey1 - 30}" stroke="#14100c" stroke-width="9"/><circle cx="${(ex0 + ex1) / 2}" cy="${(ey0 + ey1) / 2 + 30}" r="16" fill="#14100c"/><path d="M${(ex0 + ex1) / 2 - 12},${(ey0 + ey1) / 2 + 30} a12,14 0 0 1 24,0" stroke="#14100c" stroke-width="5" fill="none" transform="translate(0,-22)"/>`;
    g += `<rect x="${-W / 2}" y="${-H / 2}" width="${W}" height="${H}" fill="#000" opacity="0.05" filter="url(#tex)"/><path d="M${-W / 2},0 L${W / 2},6" stroke="#a8946a" stroke-width="3" opacity="0.4"/>`;
    return g + `</g>`;
  };

  // ======================================================= THE FOUNTAIN: the soda tap on the counter, the glass, the nickel
  // the draft arm standing on the counter (x, y = its foot): a marble block, a nickel-silver column, the swan-neck
  // spout over the glass, the lever on top (pull 0..1)
  S.tap = (x, y, t, pull = 0) => {
    let g = `<defs><linearGradient id="tpN" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5a5c5e"/><stop offset="0.3" stop-color="#e8eaec"/><stop offset="0.5" stop-color="#a8acb0"/><stop offset="0.8" stop-color="#f4f6f8"/><stop offset="1" stop-color="#6a6c6e"/></linearGradient></defs>`;
    g += `<ellipse cx="${x}" cy="${y + 4}" rx="110" ry="16" fill="#000" opacity="0.3" filter="url(#b4)"/>`;
    g += `<path d="M${x - 96},${y} L${x - 96},${y - 70} L${x + 96},${y - 70} L${x + 96},${y}Z" fill="#ece6da" ${ol(1.4)}/><path d="M${x - 96},${y - 70} L${x + 96},${y - 70}" stroke="#fff" stroke-width="4" opacity="0.7"/><path d="M${x - 70},${y - 50} q40,10 90,-4 t40,12" stroke="#8a8478" stroke-width="1.5" fill="none" opacity="0.5"/>`;
    g += `<path d="M${x - 40},${y - 70} L${x - 34},${y - 360} Q${x},${y - 384} ${x + 34},${y - 360} L${x + 40},${y - 70}Z" fill="url(#tpN)" ${ol(1.5)}/>`;
    for (const yy of [y - 120, y - 300]) g += `<rect x="${x - 46}" y="${yy}" width="92" height="20" rx="6" fill="url(#tpN)" ${ol(1.2)}/>`;
    // the spout: a swan neck out to the left, the nozzle pointing down (at x - 190, y - 300)
    g += `<path d="M${x - 30},${y - 330} C${x - 90},${y - 390} ${x - 190},${y - 380} ${x - 196},${y - 300}" stroke="#1a1a1c" stroke-width="30" fill="none" stroke-linecap="round"/><path d="M${x - 30},${y - 330} C${x - 90},${y - 390} ${x - 190},${y - 380} ${x - 196},${y - 300}" stroke="url(#tpN)" stroke-width="24" fill="none" stroke-linecap="round"/><path d="M${x - 40},${y - 348} C${x - 90},${y - 384} ${x - 170},${y - 376} ${x - 184},${y - 318}" stroke="#fff" stroke-width="4" fill="none" opacity="0.7"/>`;
    g += `<rect x="${x - 208}" y="${y - 306}" width="24" height="30" rx="4" fill="url(#tpN)" ${ol(1.2)}/>`;
    // the lever: a black ball on a rod, pulled forward to pour
    const a = -70 + 50 * pull, lx2 = x + Math.cos(a * Math.PI / 180) * 120, ly2 = y - 380 + Math.sin(a * Math.PI / 180) * 120;
    g += `<path d="M${x},${y - 376} L${f(lx2)},${f(ly2)}" stroke="#2a2a2c" stroke-width="12" stroke-linecap="round"/><path d="M${x},${y - 376} L${f(lx2)},${f(ly2)}" stroke="url(#tpN)" stroke-width="7" stroke-linecap="round"/><circle cx="${f(lx2)}" cy="${f(ly2)}" r="22" fill="#141210" ${ol(1.3)}/><circle cx="${f(lx2 - 7)}" cy="${f(ly2 - 7)}" r="6" fill="#8a8680" opacity="0.7"/>`;
    g += `<circle cx="${x}" cy="${y - 376}" r="16" fill="url(#tpN)" ${ol(1.2)}/>`;
    return g;
  };
  S.TAP_NOZ = [-196, -276];
  // the jet of soda water from the nozzle down into the glass (flow 0..1)
  S.jet = (x0, y0, y1, t, flow) => {
    if (flow <= 0.01) return '';
    const w = 7 * flow, r = rng(631);
    let g = `<path d="M${x0 - w},${y0} L${x0 + w},${y0} L${x0 + w * 0.8},${y1} L${x0 - w * 0.8},${y1}Z" fill="#e8f2f0" opacity="${f(0.55 * flow)}"/><path d="M${x0 - w * 0.3},${y0} L${x0 - w * 0.2},${y1}" stroke="#fff" stroke-width="2" opacity="${f(0.8 * flow)}"/>`;
    for (let i = 0; i < 12; i++) { const u = ((t * 3 + i / 12) % 1); g += `<circle cx="${f(x0 + (r() - 0.5) * w * 1.6)}" cy="${f(y0 + (y1 - y0) * u)}" r="${f(1 + r() * 2)}" fill="#fff" opacity="${f(0.7 * flow)}"/>`; }
    return g;
  };
  // a soda glass being filled: the syrup at the bottom, the water mixing it brown, the head of foam rising (x, y =
  // base, h tall; lev 0..1 the fill, mixk 0..1 how mixed, foam 0..1)
  S.fillGlass = (x, y, h, t, lev = 1, mixk = 1, foam = 1, o = {}) => {
    const s = h / 160, r = rng(o.seed || 7), top = -128, yl = -14 + (top + 14) * lev;
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><defs><clipPath id="fgIn${o.id || ''}"><path d="M-30,-14 L-36,-130 L36,-130 L30,-14Z"/></clipPath><linearGradient id="fgW${o.id || ''}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1a0a04"/><stop offset="0.35" stop-color="#5a2a0e"/><stop offset="0.62" stop-color="#7e3c14"/><stop offset="1" stop-color="#1a0a04"/></linearGradient></defs>`;
    g += `<ellipse cx="0" cy="2" rx="44" ry="8" fill="#000" opacity="0.35" filter="url(#b4)"/>`;
    g += `<g clip-path="url(#fgIn${o.id || ''})">`;
    // the syrup layer at the bottom (always), the water above it turning brown as it mixes
    g += `<rect x="-40" y="-40" width="80" height="30" fill="url(#fgW${o.id || ''})"/>`;
    if (lev > 0.02) { g += `<rect x="-40" y="${f(yl)}" width="80" height="${f(-14 - yl)}" fill="url(#fgW${o.id || ''})" opacity="${f(0.15 + 0.85 * mixk)}"/><rect x="-40" y="${f(yl)}" width="80" height="${f(-14 - yl)}" fill="#e8f0ec" opacity="${f(0.22 * (1 - mixk))}"/>`; for (let i = 0; i < 22; i++) { const bx = -26 + r() * 52, sp = 30 + r() * 50, ph = r(), u = ((t * sp / 110 + ph) % 1 + 1) % 1, by = -18 + (yl + 18) * u; g += `<circle cx="${f(bx)}" cy="${f(by)}" r="${f(1 + r() * 1.8)}" fill="none" stroke="#f0d0a0" stroke-width="0.8" opacity="${f(0.6 * Math.sin(Math.PI * u))}"/>`; } }
    // the foam head, piling up on the surface
    if (foam > 0.02 && lev > 0.05) { const fh = 14 * foam; g += `<path d="M-38,${f(yl)} Q-30,${f(yl - fh)} -16,${f(yl - fh * 0.8)} Q-6,${f(yl - fh * 1.3)} 6,${f(yl - fh)} Q20,${f(yl - fh * 1.2)} 30,${f(yl - fh * 0.8)} Q40,${f(yl - fh * 0.5)} 38,${f(yl)}Z" fill="#dcc6a2"/><path d="M-30,${f(yl - fh * 0.6)} Q0,${f(yl - fh * 1.1)} 30,${f(yl - fh * 0.6)}" stroke="#fff4e0" stroke-width="2.4" fill="none" opacity="0.7"/>`; }
    g += `</g>`;
    g += `<path d="M-32,0 L-39,-160 L39,-160 L32,0Z" fill="#e8f0f0" fill-opacity="0.14" ${ol(1.5)}/><rect x="-32" y="-14" width="64" height="14" fill="#e8f0f0" opacity="0.3"/><path d="M-39,-160 L39,-160" stroke="#f4f8f8" stroke-width="3" opacity="0.8"/>`;
    g += `<path d="M-27,-8 L-32,-150" stroke="#fff" stroke-width="3.5" opacity="0.5" stroke-linecap="round"/><path d="M26,-10 L30,-120" stroke="#fff" stroke-width="2" opacity="0.3"/>`;
    return g + `</g>`;
  };
  // a Liberty nickel: falling (y above the counter), bouncing, spinning down flat (spin: 0 = flat .. 1 = on edge)
  S.nickel = (x, y, spin, ang, shadowY) => {
    const ry = 13 + (34 - 13) * (1 - spin) * 0 + 13 * (1 - spin), rx = 34 * Math.max(0.12, Math.abs(Math.cos(ang)) * spin + (1 - spin));
    let g = '';
    if (shadowY != null) g += `<ellipse cx="${f(x + 4)}" cy="${f(shadowY + 5)}" rx="${f(Math.max(10, rx))}" ry="12" fill="#3a3a38" opacity="0.4" filter="url(#b2)"/>`;
    g += `<g transform="translate(${f(x)},${f(y)})"><ellipse rx="${f(rx)}" ry="${f(Math.max(4, 13 * (1 - spin) + 30 * spin))}" fill="#c8ccce" ${ol(1.2)}/><ellipse rx="${f(rx * 0.8)}" ry="${f(Math.max(3, (13 * (1 - spin) + 30 * spin) * 0.73))}" fill="none" stroke="#8a8e90" stroke-width="1.5"/>`;
    if (spin < 0.3) g += `<g transform="scale(1,0.38)">` + TXT(0, 12, 32, '#6a6e72', 'V', { w: 'bold' }) + `</g>`;
    g += `<ellipse cx="${f(-rx * 0.3)}" cy="-4" rx="${f(rx * 0.35)}" ry="3" fill="#fff" opacity="0.7"/></g>`;
    return g;
  };

  // ======================================================= THE NAME: the fountain card (the S.fountainBack card, redrawn)
  // k: 0 = BRAIN TONIC .. the old words fade (0..0.4) and the name is written in, stroke by stroke (0.4..1)
  S.card2 = (k = 0) => {
    let c = `<path d="M250,346 L190,420 M250,346 L310,420" stroke="#4a3a2a" stroke-width="3"/><rect x="96" y="414" width="308" height="300" fill="#8a6a2a" ${ol(1.4)}/><rect x="106" y="424" width="288" height="280" fill="#efe4c8"/><rect x="116" y="434" width="268" height="260" fill="none" stroke="#2a1a10" stroke-width="2"/><rect x="122" y="440" width="256" height="248" fill="none" stroke="#2a1a10" stroke-width="1"/>`;
    const fade = 1 - ss(0, 0.4, k), wr = ss(0.4, 1, k);
    c += TXT(250, 478, 22, '#9a1e14', 'DRINK', { w: 'bold', ls: 6 });
    if (fade > 0.002) c += `<g opacity="${f(fade)}">` + TXT(250, 530, 46, '#1a120c', 'BRAIN', { w: 'bold', len: 200 }) + TXT(250, 578, 46, '#1a120c', 'TONIC', { w: 'bold', len: 200 }) + `</g>`;
    if (wr > 0.002) { const x0 = 118, w = 264 * wr; c += `<defs><clipPath id="nmW"><rect x="${x0}" y="480" width="${f(w)}" height="130"/></clipPath><linearGradient id="nmEdge" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs><g clip-path="url(#nmW)">` + TXT(252, 576, 82, '#b01810', 'Coca-Cola', { font: FONT.script, len: 250 }) + `</g>`; if (wr < 1) c += C.radial(x0 + w, 548, 34, '#ffd8a0', 0.6); }
    c += TXT(250, 660, 72, '#9a1e14', '5¢', { w: 'bold' }) + TXT(250, 684, 14, '#3a2a1a', 'Relieves Headache · Exhaustion', { it: true, len: 230 });
    c += `<path d="M150,592 L350,592" stroke="#2a1a10" stroke-width="1.6"/><rect x="96" y="414" width="308" height="300" fill="#fff4dc" opacity="0.1"/>`;
    return c;
  };

  // ======================================================= THE MAP OF THE WORLD (Natural Earth outlines, map18.js)
  // world: the map sheet centred at (540, 960), the map itself 1600 x 833 drawn at (MX0, MY0)
  S.MP = { X0: -260, Y0: 543, SHEET: [-420, -500, 1500, 2420] };
  S.mapPt = k => { const c = M.cities[k]; return [S.MP.X0 + c[0], S.MP.Y0 + c[1]]; };
  // order of the lights (time 0..1 of the spread at which each city lights)
  S.MAP_ORDER = ['newyork', 'havana', 'chicago', 'mexico', 'toronto', 'london', 'paris', 'losangeles', 'rio', 'madrid', 'bogota', 'berlin', 'rome', 'buenosaires', 'lima', 'santiago', 'stockholm', 'cairo', 'istanbul', 'lagos', 'moscow', 'reykjavik', 'johannesburg', 'capetown', 'nairobi', 'dubai', 'tehran', 'mumbai', 'delhi', 'anchorage', 'bangkok', 'beijing', 'shanghai', 'seoul', 'manila', 'tokyo', 'jakarta', 'perth', 'sydney'];
  S.worldMap = (t, spread = 0) => {
    const L = [], { X0, Y0, SHEET: [sx0, sy0, sx1, sy1] } = S.MP, r = rng(701);
    // the parchment sheet, its foxing and the dark room around it
    let g = `<rect x="-1200" y="-1200" width="3500" height="4400" fill="#1a1008"/>`;
    g += lg('mpP', [[0, '#d8c49a'], [0.5, '#e4d2aa'], [1, '#c8b080']], 0, 0, 1, 1) + `<rect x="${sx0}" y="${sy0}" width="${sx1 - sx0}" height="${sy1 - sy0}" fill="url(#mpP)"/>`;
    g += `<rect x="${sx0}" y="${sy0}" width="${sx1 - sx0}" height="${sy1 - sy0}" fill="#5a3a1a" opacity="0.12" filter="url(#tex)"/>`;
    for (let i = 0; i < 26; i++) g += `<circle cx="${f(sx0 + r() * (sx1 - sx0))}" cy="${f(sy0 + r() * (sy1 - sy0))}" r="${f(20 + r() * 90)}" fill="#8a6a3a" opacity="${f(0.04 + r() * 0.07)}" filter="url(#b14)"/>`;
    g += `<rect x="${sx0 + 30}" y="${sy0 + 30}" width="${sx1 - sx0 - 60}" height="${sy1 - sy0 - 60}" fill="none" stroke="#3a2412" stroke-width="5"/><rect x="${sx0 + 46}" y="${sy0 + 46}" width="${sx1 - sx0 - 92}" height="${sy1 - sy0 - 92}" fill="none" stroke="#3a2412" stroke-width="1.6"/>`;
    // the title cartouche above the map
    const tx = 540, ty = 260;
    g += `<path d="M${tx - 470},${ty - 120} Q${tx},${ty - 170} ${tx + 470},${ty - 120} L${tx + 440},${ty + 110} Q${tx},${ty + 150} ${tx - 440},${ty + 110}Z" fill="#e8d6ae" stroke="#3a2412" stroke-width="3"/><path d="M${tx - 446},${ty - 104} Q${tx},${ty - 150} ${tx + 446},${ty - 104} L${tx + 420},${ty + 94} Q${tx},${ty + 132} ${tx - 420},${ty + 94}Z" fill="none" stroke="#3a2412" stroke-width="1.2"/>`;
    g += TXT(tx, ty - 50, 34, '#2a1a0c', 'A NEW AND CORRECT', { font: FONT.old, ls: 8, len: 560 }) + TXT(tx, ty + 44, 104, '#2a1a0c', 'Map of the World', { font: FONT.script, len: 760 });
    for (const s2 of [-1, 1]) g += `<path d="M${tx + s2 * 470},${ty - 120} C${tx + s2 * 560},${ty - 160} ${tx + s2 * 600},${ty - 40} ${tx + s2 * 520},${ty} C${tx + s2 * 600},${ty + 60} ${tx + s2 * 560},${ty + 160} ${tx + s2 * 440},${ty + 110}" stroke="#3a2412" stroke-width="3" fill="#dcc89e"/>`;
    // the map: the oval of the sphere as the sea, the graticule, the land in sepia with a hatched coast
    g += `<g transform="translate(${X0},${Y0})"><defs><clipPath id="mpSph"><path d="${M.sphere}"/></clipPath></defs>`;
    g += `<path d="${M.sphere}" fill="#cdb98e" stroke="#2a1a0c" stroke-width="5"/>`;
    g += `<g clip-path="url(#mpSph)"><path d="${M.grat}" stroke="#6a4a2a" stroke-width="0.9" fill="none" opacity="0.45"/>`;
    for (const [a, d] of M.land) g += `<path d="${d}" fill="none" stroke="#5a4020" stroke-width="${a > 400 ? 14 : 8}" stroke-linejoin="round" opacity="0.16"/>`;
    for (const [a, d] of M.land) g += `<path d="${d}" fill="none" stroke="#5a4020" stroke-width="${a > 400 ? 6 : 4}" stroke-linejoin="round" opacity="0.18"/>`;
    for (const [a, d] of M.land) g += `<path d="${d}" fill="#e8d3a2" stroke="#2a1a0c" stroke-width="1.6" stroke-linejoin="round"/>`;
    g += `<path d="${M.borders}" stroke="#7a4a2a" stroke-width="1" fill="none" stroke-dasharray="3 2.4" opacity="0.7"/>`;
    g += `<path d="${M.sphere}" fill="none" stroke="#5a3a1a" stroke-width="40" opacity="0.18" filter="url(#b8)"/></g>`;
    g += `<path d="${M.sphere}" fill="none" stroke="#2a1a0c" stroke-width="4"/><path d="${M.sphere}" fill="none" stroke="#2a1a0c" stroke-width="1.4" transform="translate(800,416.5) scale(1.012) translate(-800,-416.5)"/>`;
    g += `</g>`;
    // the compass rose and a scale below the map
    const cx2 = 540, cy2 = 1700;
    g += `<circle cx="${cx2}" cy="${cy2}" r="190" fill="none" stroke="#3a2412" stroke-width="3"/><circle cx="${cx2}" cy="${cy2}" r="170" fill="none" stroke="#3a2412" stroke-width="1.2"/>`;
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, L2 = i % 4 === 0 ? 220 : i % 2 ? 120 : 160, w = i % 4 === 0 ? 28 : 16; const ax = Math.cos(a), ay = Math.sin(a), nx = -ay, ny = ax; g += `<path d="M${cx2},${cy2} L${f(cx2 + nx * w)},${f(cy2 + ny * w)} L${f(cx2 + ax * L2)},${f(cy2 + ay * L2)}Z" fill="${i % 2 ? '#e8d6ae' : '#3a2412'}" stroke="#3a2412" stroke-width="1.4"/><path d="M${cx2},${cy2} L${f(cx2 - nx * w)},${f(cy2 - ny * w)} L${f(cx2 + ax * L2)},${f(cy2 + ay * L2)}Z" fill="${i % 2 ? '#3a2412' : '#e8d6ae'}" stroke="#3a2412" stroke-width="1.4"/>`; }
    g += TXT(cx2, cy2 - 236, 44, '#2a1a0c', 'N', { font: FONT.play, w: 'bold' });
    g += `<path d="M${cx2 - 300},${cy2 + 300} L${cx2 + 300},${cy2 + 300}" stroke="#2a1a0c" stroke-width="10" stroke-dasharray="60 60"/><path d="M${cx2 - 300},${cy2 + 300} L${cx2 + 300},${cy2 + 300}" stroke="#2a1a0c" stroke-width="10" fill="none" opacity="0.15"/>`;
    L.push({ p: 1, svg: g });
    // the spread: from Atlanta, lines of light reach out and every city they reach lights up, warm red and gold
    if (spread > 0) {
      const [ax, ay] = S.mapPt('atlanta'), N = S.MAP_ORDER.length;
      let s = C.radial(ax, ay, 90, '#ffd080', 0.9 * ss(0, 0.06, spread)) + `<circle cx="${ax}" cy="${ay}" r="6" fill="#fff4d0" opacity="${f(ss(0, 0.04, spread))}"/>`;
      S.MAP_ORDER.forEach((k, i) => {
        const t0 = 0.04 + 0.8 * i / N, u = ss(t0, t0 + 0.16, spread); if (u <= 0) return;
        const [bx, by] = S.mapPt(k), mx = (ax + bx) / 2, my = (ay + by) / 2 - Math.min(260, Math.hypot(bx - ax, by - ay) * 0.28);
        // the arc as a polyline drawn up to u
        const pts = []; for (let j = 0; j <= 24; j++) { const v = j / 24 * u, a1 = 1 - v; pts.push([a1 * a1 * ax + 2 * a1 * v * mx + v * v * bx, a1 * a1 * ay + 2 * a1 * v * my + v * v * by]); }
        const d = 'M' + pts.map(p => f(p[0]) + ',' + f(p[1])).join(' L');
        s += `<path d="${d}" stroke="#b8241a" stroke-width="2.4" fill="none" opacity="${f(0.75 * (1 - 0.5 * ss(t0 + 0.2, t0 + 0.5, spread)))}"/><path d="${d}" stroke="#ffd080" stroke-width="1" fill="none" opacity="0.8"/>`;
        const h = pts[pts.length - 1]; s += `<circle cx="${f(h[0])}" cy="${f(h[1])}" r="3" fill="#fff4d0" opacity="${f(u < 1 ? 0.9 : 0)}"/>`;
        if (u >= 1) { const g2 = ss(t0 + 0.16, t0 + 0.26, spread); s += C.radial(bx, by, 46, '#ff9a40', 0.7 * g2) + `<circle cx="${f(bx)}" cy="${f(by)}" r="${f(5 * g2)}" fill="#b8241a" stroke="#fff0c0" stroke-width="1.6"/>`; }
      });
      L.push({ p: 1, svg: s });
    }
    L.push({ p: 1, svg: C.radial(ax0(), ay0(), 1400, '#ffb060', 0.16) + lg('mpVig', [[0, '#000', 0.4], [0.3, '#000', 0], [0.7, '#000', 0], [1, '#000', 0.45]]) + `<rect x="-1200" y="-1200" width="3500" height="4400" fill="url(#mpVig)"/>` });
    return L;
  };
  const ax0 = () => S.mapPt('atlanta')[0], ay0 = () => S.mapPt('atlanta')[1];
})(window);
