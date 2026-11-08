// Sets for "The Confessor": the royal chapel (the confessional booth on the left, the altar on the right, one world),
// the shadow-play wall of the punishment, and the village at dawn. Something always moves: flames, curtains, smoke, dust.
(function (G) {
  const S = G.SETS, { f, shade, mix, rng, uid, OUT, ol } = G.RIG, C = G.CINE, E = G.ENV, PR = G.PROPS;
  const lg = S.lg;
  const X = () => G.ENG;
  const fl = (t, seed) => 0.86 + 0.08 * Math.sin(t * 9 + seed) + 0.06 * Math.sin(t * 23 + seed * 2);

  // ======================================================= the royal chapel
  // booth: x 40..1040, floor 1760. Left compartment (penitent) x 92..470 with a kneeler (armrest top 1170);
  // divider 470..610 with the grille (790..972) and the slot ledge (972..1006); right compartment (you) 610..990 with a half door from 1240.
  // altar: x 1760..2300, top 1250, steps to 1760.
  S.CH = { FY: 1760, KNEEL_TOP: 1170, DOOR_TOP: 1240, GRILLE: [486, 790, 594, 956], SLOT_Y: 1002, LEFT: [92, 470], RIGHT: [610, 990], CANDLE: [952, 1004], ALTAR: [1760, 2300, 1170] };
  const CH = S.CH;
  // stained glass: lead lines over coloured panes, moonlight behind
  const glass = (x, y, w, h, seed, lit = 1) => {
    const id = uid('gl'), r = rng(seed), cols = ['#2a4a8a', '#8a1a24', '#c8a040', '#2a6a4a', '#5a2a6a'];
    let g = `<defs><clipPath id="${id}"><path d="M${x - w / 2},${y + h} L${x - w / 2},${y + w * 0.5} Q${x - w / 2},${y} ${x},${y - w * 0.15} Q${x + w / 2},${y} ${x + w / 2},${y + w * 0.5} L${x + w / 2},${y + h}Z"/></clipPath></defs><g clip-path="url(#${id})">`;
    for (let j = 0; j < h / 46 + 2; j++) for (let i = 0; i < w / 40 + 1; i++) g += `<rect x="${f(x - w / 2 + i * 40 + (j % 2) * 20)}" y="${f(y - w * 0.15 + j * 46)}" width="40" height="46" fill="${cols[Math.floor(r() * cols.length)]}" opacity="${f(0.55 + 0.35 * lit)}"/>`;
    g += `<rect x="${x - w / 2}" y="${y - w * 0.2}" width="${w}" height="${h + w}" fill="#000" opacity="0.15" filter="url(#tex)"/>`;
    for (let j = 0; j < h / 46 + 2; j++) g += `<path d="M${x - w / 2},${f(y - w * 0.15 + j * 46)} L${x + w / 2},${f(y - w * 0.15 + j * 46)}" stroke="#1a1612" stroke-width="5"/>`;
    for (let i = 0; i < w / 40 + 2; i++) g += `<path d="M${f(x - w / 2 + i * 40)},${y - w * 0.2} L${f(x - w / 2 + i * 40)},${y + h}" stroke="#1a1612" stroke-width="4"/>`;
    g += `</g><path d="M${x - w / 2},${y + h} L${x - w / 2},${y + w * 0.5} Q${x - w / 2},${y} ${x},${y - w * 0.15} Q${x + w / 2},${y} ${x + w / 2},${y + w * 0.5} L${x + w / 2},${y + h}" fill="none" stroke="#3a342e" stroke-width="22"/>`;
    return g;
  };
  S.chapel = (t, o = {}) => {
    const L = [], dark = o.dark || 0;
    // back wall: ashlar, three tall stained-glass windows, the rose window over the altar
    let w = S.stoneWall(-1400, -1600, 3600, 1500, '#5e554c', 31, 90);
    w += glass(-330, 120, 300, 820, 3) + glass(1330, 80, 320, 860, 5) + glass(2900, 120, 300, 820, 7);
    { const cx = 2030, cy = -380, R = 280, id = uid('rw'); let rw = `<circle cx="${cx}" cy="${cy}" r="${R}" fill="#2a3a6a"/>`; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; rw += `<path d="M${cx},${cy} L${f(cx + Math.cos(a) * R)},${f(cy + Math.sin(a) * R)}" stroke="#1a1612" stroke-width="10"/><circle cx="${f(cx + Math.cos(a + 0.26) * R * 0.66)}" cy="${f(cy + Math.sin(a + 0.26) * R * 0.66)}" r="${f(R * 0.2)}" fill="${['#8a1a24', '#c8a040', '#2a6a4a'][i % 3]}" opacity="0.85"/>`; } rw += `<circle cx="${cx}" cy="${cy}" r="${R * 0.25}" fill="#c8a040" stroke="#1a1612" stroke-width="8"/><circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="#3a342e" stroke-width="30"/>`; w += rw; }
    // a carved retable behind the altar with a crucifix
    w += `<path d="M1830,1260 L1830,640 L1930,520 L2030,450 L2130,520 L2230,640 L2230,1260Z" fill="#3a2414" ${ol(2)}/><path d="M1860,1240 L1860,660 L1950,560 L2030,500 L2110,560 L2200,660 L2200,1240Z" fill="#7a1418" opacity="0.8"/>`;
    w += `<rect x="2020" y="560" width="22" height="420" fill="#c8a040" ${ol(1.4)}/><rect x="1950" y="650" width="162" height="22" fill="#c8a040" ${ol(1.4)}/>`;
    w += `<rect x="-1400" y="-1600" width="5000" height="3100" fill="#0a0608" opacity="${f(0.45 + 0.15 * dark)}" style="mix-blend-mode:multiply"/>`;
    w += C.radial(1330, 500, 520, '#9ab0e0', 0.22) + C.radial(-330, 520, 480, '#9ab0e0', 0.18) + C.radial(2030, -380, 420, '#b8c8f0', 0.2);
    L.push({ p: 0.72, svg: w });
    // clustered pillars
    let pl = '';
    for (const x of [-180, 1180, 2780]) pl += `${lg('cp' + x, [[0, '#2a2622'], [0.35, '#6a625a'], [0.6, '#4a443e'], [1, '#1e1a16']], 0, 0, 1, 0)}<rect x="${x - 70}" y="-1800" width="140" height="3700" fill="url(#cp${x})"/>` + [-40, 0, 40].map(k => `<path d="M${x + k},-1800 L${x + k},1900" stroke="#1a1612" stroke-width="3" opacity="0.6"/>`).join('');
    L.push({ p: 0.86, svg: pl });
    // floor with flagstones and coloured moon patches from the windows; the votive stand; the altar steps and candlesticks
    let fl0 = `<rect x="-1600" y="1500" width="5200" height="1500" fill="#3e3630" filter="url(#plaster)"/>`;
    for (let i = 0; i < 10; i++) fl0 += `<path d="M-1600,${1560 + i * 70 + i * i * 6} L3600,${1560 + i * 70 + i * i * 6}" stroke="#1e1a16" stroke-width="3" opacity="0.6"/>`;
    const r = rng(9); for (let i = 0; i < 60; i++) fl0 += `<path d="M${f(-1600 + r() * 5200)},${f(1560 + r() * 1000)} l0,${f(50 + r() * 60)}" stroke="#1e1a16" stroke-width="3" opacity="0.5"/>`;
    for (const [x, c] of [[1330, '#4a6ac8'], [1460, '#c8303a'], [1260, '#c8a040']]) fl0 += `<ellipse cx="${x}" cy="1900" rx="180" ry="50" fill="${c}" opacity="0.1" filter="url(#b14)"/>`;
    // votive stand: tiers of small candles
    fl0 += `<rect x="1240" y="1430" width="300" height="24" fill="#2a1e14" ${ol(1.2)}/><rect x="1270" y="1380" width="240" height="20" fill="#2a1e14" ${ol(1.2)}/><rect x="1380" y="1454" width="20" height="300" fill="#1e140c"/>`;
    for (let i = 0; i < 9; i++) { const cx = 1260 + i * 32, cy = 1430; fl0 += `<rect x="${cx - 5}" y="${cy - 24}" width="10" height="24" fill="#e8dcc0"/>` + PR.flame(cx, cy - 26, 0.5, t + i * 1.3); }
    for (let i = 0; i < 7; i++) { const cx = 1290 + i * 32, cy = 1380; fl0 += `<rect x="${cx - 5}" y="${cy - 22}" width="10" height="22" fill="#e8dcc0"/>` + PR.flame(cx, cy - 24, 0.5, t + i * 1.7 + 3); }
    fl0 += C.radial(1390, 1360, 420, '#ffb860', 0.32 * fl(t, 1));
    // altar steps
    fl0 += `<rect x="1640" y="1640" width="780" height="60" fill="#6a5e52" ${ol(1.4)}/><rect x="1600" y="1700" width="860" height="60" fill="#5e5248" ${ol(1.4)}/><rect x="1640" y="1640" width="780" height="10" fill="#fff" opacity="0.08"/>`;
    fl0 += `<rect x="-1600" y="1500" width="5200" height="1500" fill="#0a0608" opacity="${f(0.3 + 0.2 * dark)}" style="mix-blend-mode:multiply"/>`;
    fl0 += S.dust(1330, 1100, 260, 560, 26, 7, t, '#c8d8ff', 1.8, 0.45);
    L.push({ p: 1, svg: fl0 });
    // foreground: a pillar edge far left, out of focus
    L.push({ p: 1.3, svg: `<g filter="url(#dof2)"><rect x="-980" y="-1600" width="300" height="4400" fill="#1a1612"/><rect x="-900" y="-1600" width="50" height="4400" fill="#4a443e" opacity="0.6"/></g>` });
    return L;
  };

  // linenfold carving: vertical rounded folds in a panel
  const linen = (x0, y0, w, h, lit = 0.14) => {
    let g = `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" rx="6" fill="#2a1a0e" stroke="#120a04" stroke-width="3"/>`;
    const n = Math.max(3, Math.round(w / 26)), fw = w / n;
    for (let i = 0; i < n; i++) {
      const x = x0 + (i + 0.5) * fw;
      g += `<path d="M${f(x)},${y0 + 16} Q${f(x - fw * 0.42)},${y0 + 4} ${f(x)},${y0 + 26} L${f(x)},${y0 + h - 26} Q${f(x + fw * 0.42)},${y0 + h - 4} ${f(x)},${y0 + h - 16}" stroke="#5a3a20" stroke-width="${f(fw * 0.5)}" fill="none" opacity="0.6"/>` +
        `<path d="M${f(x - fw * 0.2)},${y0 + 28} L${f(x - fw * 0.2)},${y0 + h - 28}" stroke="#fff" stroke-width="2" opacity="${lit}"/><path d="M${f(x + fw * 0.28)},${y0 + 28} L${f(x + fw * 0.28)},${y0 + h - 28}" stroke="#000" stroke-width="3" opacity="0.35"/>`;
    }
    return g;
  };
  // a cusped gothic arch carved into the back of a bay
  const archPanel = (x0, y0, w, h) => {
    const cx = x0 + w / 2, r = w / 2;
    let g = `<path d="M${x0},${y0 + h} L${x0},${y0 + r} Q${x0},${y0} ${cx},${f(y0 - r * 0.2)} Q${x0 + w},${y0} ${x0 + w},${y0 + r} L${x0 + w},${y0 + h}" fill="#1c1108" stroke="#4a2e18" stroke-width="12"/>`;
    g += `<path d="M${x0 + 20},${y0 + h} L${x0 + 20},${y0 + r} Q${x0 + 20},${y0 + 24} ${cx},${y0 + 6} Q${x0 + w - 20},${y0 + 24} ${x0 + w - 20},${y0 + r} L${x0 + w - 20},${y0 + h}" fill="none" stroke="#2c1a0e" stroke-width="5"/>`;
    for (const k of [-1, 1]) g += `<circle cx="${f(cx + k * r * 0.42)}" cy="${f(y0 + r * 0.62)}" r="${f(r * 0.17)}" fill="none" stroke="#4a2e18" stroke-width="5"/>`;
    g += `<circle cx="${cx}" cy="${f(y0 + r * 0.34)}" r="${f(r * 0.18)}" fill="none" stroke="#4a2e18" stroke-width="5"/>`;
    return g;
  };
  S.linen = linen;
  // the booth's inside: carved arches and linenfold, a crucifix in each bay, your candle and missal on the shelf
  S.boothBack = (t, o = {}) => {
    const fy = CH.FY, [gx0, gy0, gx1, gy1] = CH.GRILLE;
    let g = `${lg('bbk', [[0, '#170e07'], [0.5, '#24160c'], [1, '#170e07']], 0, 0, 1, 0)}<rect x="90" y="320" width="900" height="${fy - 320}" fill="url(#bbk)"/>`;
    for (let x = 110; x < 990; x += 46) g += `<path d="M${x},330 L${x},${fy}" stroke="#0a0603" stroke-width="3" opacity="0.6"/>`;
    g += `<rect x="90" y="320" width="900" height="${fy - 320}" fill="#3a2414" opacity="0.18" filter="url(#woodV)"/>`;
    g += archPanel(130, 380, 300, 520) + archPanel(650, 380, 300, 520);
    g += linen(130, 930, 300, 700) + linen(650, 1280, 300, 400);
    // a crucifix in each arch: dark wood, a small pale corpus, a brass plaque
    for (const cx of [280, 800]) g += `<rect x="${cx - 7}" y="470" width="14" height="190" fill="#3a2414" ${ol(1.2)}/><rect x="${cx - 52}" y="515" width="104" height="13" fill="#3a2414" ${ol(1.2)}/>` +
      `<path d="M${cx},530 C${cx - 4},540 ${cx - 5},580 ${cx - 2},612 L${cx + 2},612 C${cx + 5},580 ${cx + 4},540 ${cx},530Z M${cx - 44},522 L${cx + 44},522" stroke="#cdb898" stroke-width="5" fill="#cdb898" opacity="0.8"/><circle cx="${cx}" cy="526" r="6" fill="#cdb898" opacity="0.85"/><rect x="${cx - 12}" y="488" width="24" height="12" fill="#c8a040" opacity="0.8"/>`;
    // the shelf: a brass candlestick with a dripping candle, a red missal with its ribbon
    const [cx, cy] = CH.CANDLE, k = fl(t, 3);
    g += `<rect x="884" y="${cy + 56}" width="108" height="16" fill="#3a2414" ${ol(1.2)}/><path d="M884,${cy + 72} L904,${cy + 96} L904,${cy + 72}Z" fill="#2a1a0e"/>`;
    g += `<path d="M${cx - 26},${cy + 56} L${cx + 26},${cy + 56} L${cx + 16},${cy + 46} L${cx + 6},${cy + 44} L${cx + 6},${cy + 14} L${cx + 18},${cy + 10} L${cx - 18},${cy + 10} L${cx - 6},${cy + 14} L${cx - 6},${cy + 44} L${cx - 16},${cy + 46}Z" fill="#b8862e" ${ol(1.1)}/><path d="M${cx - 3},${cy + 16} L${cx - 3},${cy + 44}" stroke="#fff0b0" stroke-width="2" opacity="0.6"/>`;
    g += `<rect x="${cx - 9}" y="${cy - 34}" width="18" height="46" fill="#e8dcc0" ${ol(1)}/><path d="M${cx - 9},${cy - 30} q-3,10 -1,18 M${cx + 9},${cy - 26} q3,8 1,14" stroke="#efe6d0" stroke-width="4" fill="none"/>` + PR.flame(cx, cy - 36, 0.95, t);
    g += G.ENV.smoke(cx + 2, cy - 90, 260, 3 + Math.floor(t * 0.7) % 4, '#c8b8a0', 0.12);
    g += `<path d="M904,${cy + 56} L956,${cy + 56} L952,${cy + 30} L900,${cy + 32}Z" fill="#6a1014" ${ol(1.1)}/><path d="M902,${cy + 34} L950,${cy + 32}" stroke="#d8c890" stroke-width="3"/><path d="M928,${cy + 56} l3,30" stroke="#c8a040" stroke-width="3"/>`;
    // light: warm pool around your candle, a cool moon wash in the King's bay from the curtain's edge, warm haze under the roof
    g += C.radial(cx - 70, cy - 60, 560, '#ffb860', 0.45 * k) + C.radial(140, 820, 420, '#8aa0d0', 0.12) + `<rect x="90" y="330" width="900" height="160" fill="#ffcf98" opacity="0.05" filter="url(#b14)"/>`;
    return g;
  };
  // warm light through the grille into the King's bay, with the lattice pattern in it
  S.grilleBeam = (t, k = 1) => {
    const [gx0, gy0, gx1, gy1] = CH.GRILLE, id = 'gbm', fk = fl(t, 3);
    let g = `<defs><linearGradient id="${id}" x1="${gx0}" y1="0" x2="${gx0 - 300}" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffcf90" stop-opacity="${f(0.28 * k * fk)}"/><stop offset="1" stop-color="#ffcf90" stop-opacity="0"/></linearGradient><clipPath id="${id}c"><path d="M${gx0},${gy0} L${gx0 - 320},${gy0 - 50} L${gx0 - 320},${gy1 + 110} L${gx0},${gy1}Z"/></clipPath></defs>`;
    g += `<path d="M${gx0},${gy0} L${gx0 - 320},${gy0 - 50} L${gx0 - 320},${gy1 + 110} L${gx0},${gy1}Z" fill="url(#${id})" style="mix-blend-mode:screen"/>`;
    let lat = ''; for (let i = -16; i < 16; i++) { const y = gy0 + i * 22; lat += `<path d="M${gx0 - 330},${f(y - 60)} L${gx0},${f(y + 60)} M${gx0 - 330},${f(y + 60)} L${gx0},${f(y - 60)}" stroke="#000" stroke-width="6"/>`; }
    // the lattice pattern only shows close to the grille, fading out before it reaches a face
    g += `<defs><linearGradient id="${id}m" x1="${gx0}" y1="0" x2="${gx0 - 160}" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient><mask id="${id}k"><rect x="${gx0 - 340}" y="${gy0 - 80}" width="360" height="${gy1 - gy0 + 220}" fill="url(#${id}m)"/></mask></defs><g clip-path="url(#${id}c)" mask="url(#${id}k)" opacity="${f(0.12 * k)}">${lat}</g>`;
    return g;
  };
  // the booth's front: curtain, fluted posts, the divider with its brass-framed grille and slot, the kneeler with its
  // velvet cushion, the half door with iron hinge straps, the carved cornice with crocketed pinnacles; coloured window light
  S.boothFront = (t, o = {}) => {
    const fy = CH.FY, [gx0, gy0, gx1, gy1] = CH.GRILLE, id = 'bf';
    let g = `${lg(id + 'w', [[0, '#2a1a0e'], [0.4, '#5a3a22'], [1, '#2a180c']], 0, 0, 1, 0)}${lg(id + 'b', [[0, '#6a4a14'], [0.35, '#e8c470'], [0.6, '#b8862e'], [1, '#5a3c10']], 0, 0, 1, 0)}`;
    // divider: linenfold panels around the grille
    g += `<path d="M470,320 L610,320 L610,${fy} L470,${fy}Z M${gx0},${gy0} L${gx1},${gy0} L${gx1},${gy1} L${gx0},${gy1}Z" fill="url(#${id}w)" fill-rule="evenodd" ${ol(1.6)}/>`;
    g += linen(486, 400, 108, 340) + linen(486, 1060, 108, 300) + linen(486, 1400, 108, 300);
    // the grille: a fine lattice in a brass frame, light glowing through it
    g += `<rect x="${gx0}" y="${gy0}" width="${gx1 - gx0}" height="${gy1 - gy0}" fill="#ffcf90" opacity="${f(0.22 * fl(t, 3))}"/>`;
    let lat = '';
    for (let k = -14; k < 9; k++) { const x = gx0 + k * 14; lat += `<path d="M${x},${gy0} L${x + (gy1 - gy0)},${gy1}" stroke="#2a180c" stroke-width="5"/><path d="M${x + (gy1 - gy0)},${gy0} L${x},${gy1}" stroke="#2a180c" stroke-width="5"/>`; }
    g += `<defs><clipPath id="grl"><rect x="${gx0}" y="${gy0}" width="${gx1 - gx0}" height="${gy1 - gy0}"/></clipPath></defs><g clip-path="url(#grl)">${lat}</g>`;
    g += `<rect x="${gx0 - 8}" y="${gy0 - 8}" width="${gx1 - gx0 + 16}" height="${gy1 - gy0 + 8}" fill="none" stroke="url(#${id}b)" stroke-width="10"/>` + [[gx0 - 4, gy0 - 4], [gx1 + 4, gy0 - 4]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#e8c470" ${ol(1)}/>`).join('');
    // the slot under the grille and its ledge
    g += `<rect x="${gx0 - 8}" y="${gy1}" width="${gx1 - gx0 + 16}" height="${CH.SLOT_Y - gy1}" fill="#0a0603"/><rect x="${gx0 - 32}" y="${CH.SLOT_Y}" width="${gx1 - gx0 + 64}" height="18" fill="#4a3018" ${ol(1.3)}/><rect x="${gx0 - 32}" y="${CH.SLOT_Y}" width="${gx1 - gx0 + 64}" height="4" fill="#fff" opacity="0.14"/>`;
    // kneeler: red velvet cushion on the armrest, linenfold front, carved quatrefoils, a plinth
    if (o.kneeler !== false) {
      const kt = CH.KNEEL_TOP;
      g += `<rect x="120" y="${kt}" width="340" height="34" rx="6" fill="#4a2e18" ${ol(1.5)}/><rect x="128" y="${kt - 16}" width="324" height="24" rx="11" fill="#7a1418" ${ol(1.3)}/><path d="M136,${kt - 10} L444,${kt - 10}" stroke="#d8a8a8" stroke-width="3" opacity="0.3"/><path d="M130,${kt + 6} L450,${kt + 6}" stroke="#c8a040" stroke-width="3" stroke-dasharray="2 5"/>`;
      g += `<rect x="140" y="${kt + 34}" width="300" height="${fy - kt - 34}" fill="url(#${id}w)" ${ol(1.4)}/>` + linen(156, kt + 300, 128, 300) + linen(296, kt + 300, 128, 300);
      for (const qx of [220, 360]) g += `<g transform="translate(${qx},${kt + 160})" fill="none" stroke="#1e1208" stroke-width="5">${[0, 90, 180, 270].map(a => `<circle cx="${f(Math.cos(a * Math.PI / 180) * 24)}" cy="${f(Math.sin(a * Math.PI / 180) * 24)}" r="24"/>`).join('')}<circle r="8" fill="#c8a040" stroke="none"/></g>`;
      g += `<rect x="120" y="${fy - 70}" width="340" height="70" fill="#3a2414" ${ol(1.3)}/><rect x="120" y="${fy - 70}" width="340" height="6" fill="#fff" opacity="0.08"/>`;
    }
    // half door: linenfold panels, iron hinge straps, a moulded top rail
    const dt = CH.DOOR_TOP;
    g += `<rect x="612" y="${dt}" width="378" height="${fy - dt}" fill="url(#${id}w)" ${ol(1.5)}/>` + linen(640, dt + 50, 150, fy - dt - 110) + linen(812, dt + 50, 150, fy - dt - 110);
    for (const hy of [dt + 90, fy - 140]) g += `<path d="M612,${hy} L740,${hy} L760,${hy + 8} L740,${hy + 16} L612,${hy + 16}Z" fill="#1a1a1c" ${ol(1)}/>` + [640, 680, 720].map(x => `<circle cx="${x}" cy="${hy + 8}" r="3.5" fill="#5a5a5e"/>`).join('');
    g += `<rect x="606" y="${dt - 8}" width="390" height="26" rx="5" fill="#4a2e18" ${ol(1.4)}/><rect x="606" y="${dt - 8}" width="390" height="6" fill="#fff" opacity="0.12"/>`;
    // curtain with a gold tie-back and tassel
    g += PR.curtain(40, 170, 330, fy - 30, '#5a1418', t, 3, -1, 0) + `<path d="M40,1060 Q110,1090 170,1050" stroke="#c8a040" stroke-width="7" fill="none"/><path d="M164,1052 l10,60 l-20,0Z" fill="#c8a040" ${ol(1)}/>`;
    // fluted posts with capitals
    for (const px of [30, 990]) g += `<rect x="${px}" y="300" width="60" height="${fy - 300}" fill="url(#${id}w)" ${ol(1.6)}/>` + [12, 30, 48].map(k => `<path d="M${px + k},360 L${px + k},${fy - 60}" stroke="#1a0e06" stroke-width="3" opacity="0.6"/>`).join('') + `<rect x="${px - 8}" y="330" width="76" height="30" fill="#4a2e18" ${ol(1.3)}/><rect x="${px - 10}" y="${fy - 60}" width="80" height="60" fill="#3a2414" ${ol(1.3)}/>`;
    // cornice: tracery band, crocketed pinnacles, a gilt crown under the cross at the top
    g += `<rect x="10" y="230" width="1060" height="100" fill="url(#${id}w)" ${ol(1.8)}/><rect x="10" y="230" width="1060" height="10" fill="#fff" opacity="0.08"/>`;
    for (let i = 0; i < 10; i++) { const x = 50 + i * 100; g += `<path d="M${x},320 L${x},272 Q${x + 50},236 ${x + 100},272 L${x + 100},320" fill="none" stroke="#1e1208" stroke-width="5"/><circle cx="${x + 50}" cy="292" r="12" fill="none" stroke="#1e1208" stroke-width="4"/>`; }
    for (const x of [60, 540, 1020]) { g += `<path d="M${x - 28},230 L${x},80 L${x + 28},230Z" fill="url(#${id}w)" ${ol(1.6)}/>`; for (let j = 0; j < 5; j++) { const yy = 210 - j * 28, ww = 28 - j * 5; g += `<path d="M${x - ww},${yy} q-14,-6 -8,-18 M${x + ww},${yy} q14,-6 8,-18" stroke="#4a2e18" stroke-width="6" fill="none" stroke-linecap="round"/>`; } g += `<circle cx="${x}" cy="76" r="11" fill="#4a2e18" ${ol(1.2)}/>`; }
    g += `<rect x="534" y="0" width="12" height="70" fill="#4a2e18" ${ol(1.2)}/><rect x="512" y="20" width="56" height="12" fill="#4a2e18" ${ol(1.2)}/><g transform="translate(540,232) scale(0.55)">${R_crown()}</g>`;
    // coloured light from the stained-glass window falling diagonally across the front, drifting slowly
    const dx = Math.sin(t * 0.3) * 24;
    g += `<defs><linearGradient id="${id}sg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3a5ad8" stop-opacity="0"/><stop offset="0.25" stop-color="#3a5ad8" stop-opacity="0.16"/><stop offset="0.5" stop-color="#d8303a" stop-opacity="0.13"/><stop offset="0.75" stop-color="#e8b040" stop-opacity="0.14"/><stop offset="1" stop-color="#e8b040" stop-opacity="0"/></linearGradient></defs>`;
    g += `<path d="M${f(-260 + dx)},0 L${f(240 + dx)},0 L${f(820 + dx)},${fy} L${f(320 + dx)},${fy}Z" fill="url(#${id}sg)" style="mix-blend-mode:screen" filter="url(#b8)"/>`;
    g += C.radial(CH.CANDLE[0] - 40, CH.CANDLE[1], 520, '#ffb060', 0.2 * fl(t, 3));
    return g;
  };
  const R_crown = () => G.RIG.crownArt('#c8a040');

  // the altar block in front of you (cloth, red frontal with a gold cross), with its two tall candlesticks
  S.altarFront = (t) => {
    const [x0, x1, top] = CH.ALTAR;
    let g = `<rect x="${x0}" y="${top}" width="${x1 - x0}" height="${1640 - top}" fill="#6a5e52" ${ol(1.6)}/>`;
    g += `<rect x="${x0 - 10}" y="${top - 6}" width="${x1 - x0 + 20}" height="30" fill="#ece6d8" ${ol(1.3)}/><rect x="${x0 + 30}" y="${top + 24}" width="${x1 - x0 - 60}" height="300" fill="#7a1418" ${ol(1.3)}/>`;
    g += `<path d="M${(x0 + x1) / 2 - 10},${top + 60} l20,0 l0,60 l50,0 l0,20 l-50,0 l0,120 l-20,0 l0,-120 l-50,0 l0,-20 l50,0Z" fill="#c8a040"/>`;
    for (let x = x0 + 40; x < x1 - 30; x += 30) g += `<path d="M${x},${top + 324} l6,18 l6,-18" fill="#c8a040"/>`;
    return g;
  };
  S.altarCandles = (t) => {
    const [x0, x1, top] = CH.ALTAR; let g = '';
    for (const x of [x0 + 50, x1 - 50]) g += `<rect x="${x - 10}" y="${top - 230}" width="20" height="230" fill="#c89a3a" ${ol(1.2)}/><ellipse cx="${x}" cy="${top - 230}" rx="30" ry="8" fill="#c89a3a" ${ol(1)}/><rect x="${x - 9}" y="${top - 330}" width="18" height="100" fill="#ece2c8" ${ol(1)}/>` + PR.flame(x, top - 332, 1.1, t + x) + C.radial(x, top - 360, 380, '#ffb860', 0.3 * fl(t, x));
    return g;
  };

  // ======================================================= the shadow-play wall (the law's punishment)
  S.shadowWall2 = (t, o = {}) => {
    const L = [], k = fl(t, 5);
    let w = S.stoneWall(-800, -800, 2000, 2400, '#9a6a44', 41, 100).replace(/opacity="0\.7"/g, 'opacity="0.35"').replace(/opacity="0\.6"/g, 'opacity="0.3"');
    w += `<rect x="-800" y="-800" width="2800" height="3200" fill="#2a0c06" opacity="0.5" style="mix-blend-mode:multiply"/>` + C.radial(540, 1900, 1500, '#ff7a2a', 0.65 * k) + C.radial(540, 600, 900, '#ffb060', 0.12 * k);
    L.push({ p: 0.92, svg: w });
    return L;
  };

  // ======================================================= the valley: the sleeping village below, the road, the hillside
  // o.dawn 0 = blue hour (lit windows, stars, the army on the hill), 1 = sunrise (chimney smoke, birds); o.fire 0..1 one roof burning
  S.VAL = { HOME: [858, 1112] };   // your mother's cottage, in the village layer (p 0.5)
  const VILLAGE = [[100, 1172, 0.58, 12, 1], [180, 1112, 0.42, 1, 1], [262, 1132, 0.5, 2, 1], [372, 1102, 0.38, 3, -1], [690, 1106, 0.4, 5, -1], [1060, 1102, 0.4, 11, -1],
    [442, 1152, 0.55, 4, 1], [780, 1140, 0.52, 6, -1], [880, 1124, 0.45, 7, -1], [962, 1162, 0.6, 8, -1], [322, 1184, 0.62, 9, 1], [600, 1188, 0.66, 10, 1]].sort((a, b) => a[1] - b[1]);
  S.valley = (t, o = {}) => {
    const L = [], dw = o.dawn || 0, fire = o.fire || 0;
    const top = mix('#0a1024', '#5a7ab8', dw), mid = mix('#26305a', '#f0c08a', dw), hz = mix('#6a4a6a', '#ffe0a0', dw);
    let sky = `${lg('vls', [[0, top], [0.6, mid], [0.9, hz], [1, mix('#8a5a6a', '#fff2c8', dw)]])}<rect x="-1400" y="-1600" width="4000" height="2900" fill="url(#vls)"/>`;
    sky += C.radial(1450, 1080, 760, mix('#c87a6a', '#ffe8b0', dw), 0.3 + 0.35 * dw);
    if (dw < 0.7) { const rs = rng(4); for (let i = 0; i < 90; i++) sky += `<circle cx="${f(-1300 + rs() * 3800)}" cy="${f(-1500 + rs() * 2200)}" r="${f(0.8 + rs() * 1.6)}" fill="#f4f0e0" opacity="${f((1 - dw / 0.7) * (0.25 + 0.5 * (0.5 + 0.5 * Math.sin(t * (1 + rs() * 2) + i))))}"/>`; sky += `<path d="M-60,180 a60,60 0 1 0 60,-60 a46,46 0 1 1 -60,60Z" fill="#f2ecd8" opacity="${f(1 - dw)}"/>` + C.radial(-40, 150, 300, '#c8d4f0', 0.25 * (1 - dw)); }
    for (const [cx, cy, w2, sd] of [[-300, 420, 620, 3], [900, 300, 700, 5], [1700, 520, 560, 8]]) sky += E.cloud(cx + t * 8, cy, w2, w2 * 0.28, sd, { op: 0.75, lit: mix('#6a6a98', '#fff0d8', dw), body: mix('#2e3054', '#e8c8b8', dw), dark: mix('#1a1c34', '#a88a8a', dw) });
    if (dw > 0.5) sky += E.birds(300 + t * 40, 700, 9, 5, 1.2, '#3a3040') + E.birds(900 + t * 30, 560, 5, 9, 1.0, '#3a3040');
    L.push({ p: 0.12, svg: sky });
    // far hills with a line of trees along the crest
    let far = `<g transform="translate(-1400,0)">${E.ridge(4200, 1010, 180, 7, mix('#161c38', '#8a92a8', dw), 220)}</g>`;
    const rt = rng(21); for (let i = 0; i < 70; i++) { const x = -1300 + i * 58 + rt() * 30, y = 1000 - 40 * Math.sin(i * 0.37) - rt() * 30; far += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(18 + rt() * 14)}" ry="${f(30 + rt() * 22)}" fill="${mix('#0e1428', '#5a6a6a', dw)}"/>`; }
    far += `<g transform="translate(-1400,0)">${E.ridge(4200, 1070, 90, 11, mix('#121830', '#6a7a6a', dw), 180)}</g>`;
    L.push({ p: 0.3, svg: far });
    // the village in the valley: fields, the road, cottages round the church; lit windows by night, smoke by morning
    let v = `<rect x="-1400" y="1050" width="4000" height="700" fill="${mix('#141c1e', '#6a7a46', dw)}"/>`;
    const rf = rng(31); for (let i = 0; i < 14; i++) { const x = -1200 + i * 270, y = 1070 + (i % 3) * 40; v += `<path d="M${x},${y} L${x + 250},${y + 6} L${x + 230},${y + 60} L${x - 20},${y + 54}Z" fill="${mix(['#18221e', '#1e2618', '#20201a'][i % 3], ['#7a8a4a', '#8a7a46', '#6a7a3a'][i % 3], dw)}"/>`; for (let k = 0; k < 6; k++) v += `<path d="M${x + k * 40},${y + 4} L${x - 20 + k * 40},${y + 56}" stroke="#000" stroke-width="2" opacity="0.2"/>`; }
    v += `<path d="M-1400,1300 C-600,1240 0,1210 300,1180 C520,1158 640,1150 760,1140" stroke="${mix('#3a3a3a', '#c8b08a', dw)}" stroke-width="26" fill="none" opacity="0.8"/>`;
    v += E.church(500, 1112, 1.0, { sun: 1 });
    VILLAGE.forEach(([x, y, s, seed, side], i) => {
      v += E.cottage(x, y, 300, 180, s, seed, { side, sun: dw > 0.5 ? 1 : -side, window: dw < 0.5 ? '#ffc070' : '#3a2a1e', smoke: dw > 0.5 ? 140 * s : 0, smokeOp: 0.4 });
      if (dw < 0.5) v += C.radial(x + 150 * s, y - 40 * s, 60 * s, '#ffb860', 0.5 * (1 - dw), 'screen');
    });
    // your mother's door glows
    v += C.radial(S.VAL.HOME[0], S.VAL.HOME[1], 70, '#ffc070', 0.7 * (1 - dw), 'screen');
    if (fire > 0) { for (let i = 0; i < 3; i++) v += `<g opacity="${f(fire)}">${G.SETS.fireMorph(170 + i * 30, 1058 + i * 6, 0.25 + 0.2 * fire, 61 + i * 5, 6, t * 8 + i)}</g>`; v += C.radial(210, 1050, 260, '#ff7a2a', 0.5 * fire, 'screen') + G.ENV.smoke(220, 1000, 260, 7, '#4a3a3a', 0.35 * fire); }
    v += `<rect x="-1400" y="1060" width="4000" height="90" fill="${mix('#4a5a7a', '#fff0d8', dw)}" opacity="0.14" filter="url(#b8)"/>`;
    v += `<rect x="-1400" y="1000" width="4000" height="700" fill="${mix('#0a0e22', '#000', dw)}" opacity="${f(0.35 * (1 - dw))}" style="mix-blend-mode:multiply"/>`;
    L.push({ p: 0.5, svg: v });
    // the dark hillside in front, the road coming down it, a fence, bushes, rocks
    let nr = `<path d="M-1400,1440 C-600,1400 200,1460 700,1450 C1200,1440 1800,1480 2600,1470 L2600,2700 L-1400,2700Z" fill="${mix('#0c120e', '#4a5a30', dw)}" filter="url(#ground)"/>`;
    nr += `<path d="M-1400,1600 C-700,1520 -100,1480 400,1460" stroke="${mix('#2a2a26', '#a8906a', dw)}" stroke-width="70" fill="none" opacity="0.7"/>`;
    for (let i = 0; i < 9; i++) { const x = 820 + i * 120; nr += `<path d="M${x},${1462 - i * 2} l0,90" stroke="#1a140e" stroke-width="12"/>`; }
    nr += `<path d="M820,1490 L1800,1474 M820,1520 L1800,1504" stroke="#1a140e" stroke-width="7"/>`;
    nr += E.hedge(-1400, -300, 1500, 70, 13, mix('#0e160e', '#3a4a26', dw)) + E.hedge(1900, 2600, 1500, 70, 17, mix('#0e160e', '#3a4a26', dw));
    L.push({ p: 0.82, svg: nr });
    // foreground grass (hides the marchers' legs) and a bare branch top-left
    let fg = ''; const rg = rng(41);
    for (let i = 0; i < 220; i++) { const x = -700 + rg() * 2600, y = 1660 + rg() * 380, h = 60 + rg() * 120, a = (rg() - 0.5) * 0.5 + Math.sin(t * 1.4 + x * 0.01) * 0.06; fg += `<path d="M${f(x)},${f(y)} q${f(Math.sin(a) * h * 0.5)},${f(-h * 0.6)} ${f(Math.sin(a) * h)},${f(-h)}" stroke="${mix('#06090a', '#2a3a1a', dw)}" stroke-width="${f(4 + rg() * 5)}" fill="none" stroke-linecap="round"/>`; }
    fg = `<rect x="-800" y="1780" width="2800" height="600" fill="${mix('#06090a', '#2a3a1a', dw)}"/>` + fg;
    L.push({ p: 1.12, svg: fg });
    return L;
  };

  // ======================================================= your mother's doorway, close (person scale)
  // doorway centre x 540, threshold 1772; o.dawn 0 = blue hour with lantern and hearth, 1 = morning sun
  S.HOUSE = { DOOR: [540, 1772], TOP: 1070 };
  S.cottageDoor = (t, o = {}) => {
    const L = [], dw = o.dawn || 0, k = fl(t, 9);
    // what lies behind: a strip of street and sky to the right
    let bg = `${lg('cds', [[0, mix('#1a2244', '#7a9ad0', dw)], [1, mix('#5a4a6a', '#ffe0b0', dw)]])}<rect x="1300" y="-400" width="1400" height="2600" fill="url(#cds)"/><rect x="1300" y="1500" width="1400" height="800" fill="${mix('#141814', '#7a6a48', dw)}"/>`;
    bg += E.cottage(1460, 1520, 300, 180, 1.4, 29, { side: -1, sun: 1, window: dw < 0.5 ? '#ffc070' : '#3a2a1e', smoke: dw > 0.5 ? 200 : 0 });
    L.push({ p: 0.6, svg: bg });
    // the house front: whitewashed daub between dark oak timbers, a thatch eave, a vine, a bench, herbs, a barrel, the window
    const wall = mix('#4a5068', '#e6d8bc', dw), tim = '#2a1a0e';
    let h = `<rect x="-600" y="180" width="1960" height="1620" fill="${wall}" filter="url(#plaster)"/>`;
    const rc = rng(7); for (let i = 0; i < 14; i++) { const x = -560 + rc() * 1880, y = 300 + rc() * 1300; h += `<path d="M${f(x)},${f(y)} l${f(rc() * 30 - 15)},${f(20 + rc() * 30)} l${f(rc() * 20 - 10)},${f(20 + rc() * 20)}" stroke="${mix('#2a2e3a', '#a89878', dw)}" stroke-width="2" fill="none" opacity="0.6"/>`; }
    h += `<rect x="-600" y="1640" width="1960" height="160" fill="#2a2018" opacity="0.25" filter="url(#b8)"/>`;
    // timber frame
    const beam = (x0, y0, x1, y1, w = 46) => `<path d="M${x0},${y0} L${x1},${y1}" stroke="${tim}" stroke-width="${w}" stroke-linecap="square"/><path d="M${x0},${y0} L${x1},${y1}" stroke="#4a2e18" stroke-width="${w * 0.35}" opacity="0.4" transform="translate(-6,0)"/>`;
    h += `<g filter="url(#woodV)">${beam(300, 260, 300, 1800, 60)}${beam(780, 260, 780, 1800, 60)}${beam(1180, 260, 1180, 1800, 50)}${beam(-600, 1030, 1360, 1030, 50)}${beam(-600, 520, 1360, 520, 44)}${beam(-200, 1030, 300, 520, 36)}${beam(780, 520, 1180, 1030, 36)}${beam(-600, 260, 1360, 260, 56)}</g>`;
    // the doorway: an arched opening, warm room behind, the plank door swung in
    const D = S.HOUSE.DOOR, top = S.HOUSE.TOP, dl = D[0] - 190, dr = D[0] + 190;
    h += `<path d="M${dl},1800 L${dl},${top + 120} Q${D[0]},${top - 40} ${dr},${top + 120} L${dr},1800Z" fill="${mix('#2a160a', '#3a2412', dw)}"/>`;
    h += C.radial(D[0] - 80, 1650, 420, '#ff9a40', (0.55 - 0.3 * dw) * k) + `<path d="M${dl + 40},1520 L${dl + 210},1520 L${dl + 210},1800 L${dl + 40},1800Z" fill="#1a0e06" opacity="0.7"/><rect x="${dl + 30}" y="1500" width="200" height="24" fill="#4a2e18"/>`;
    h += `<path d="M${dr - 70},${top + 140} L${dr},${top + 120} L${dr},1800 L${dr - 70},1780Z" fill="#4a2e18" ${ol(1.4)}/>` + [0.3, 0.7].map(u => `<path d="M${dr - 70},${f(top + 140 + u * 1500)} L${dr},${f(top + 120 + u * 1520)}" stroke="#1a1a1c" stroke-width="10"/>`).join('');
    h += `<path d="M${dl - 30},1800 L${dl - 30},${top + 120} Q${D[0]},${top - 80} ${dr + 30},${top + 120} L${dr + 30},1800" fill="none" stroke="${tim}" stroke-width="40"/>`;
    h += `<rect x="${dl - 50}" y="1770" width="${dr - dl + 100}" height="30" fill="#5a4a3a" ${ol(1.2)}/>`;
    // the window with shutters: closed with light at the seams by night, open with a flower box by morning
    const wx0 = 860, wx1 = 1100, wy0 = 760, wy1 = 980, open = dw;
    h += `<rect x="${wx0}" y="${wy0}" width="${wx1 - wx0}" height="${wy1 - wy0}" fill="${mix('#ffb860', '#2a1a0e', dw)}" opacity="${f(0.85)}"/>`;
    h += `<g transform="translate(${wx0},0) scale(${f(1 - 0.85 * open)},1)"><rect x="0" y="${wy0}" width="${(wx1 - wx0) / 2}" height="${wy1 - wy0}" fill="#3a5a4a" ${ol(1.4)}/>${[0.25, 0.5, 0.75].map(u => `<path d="M${f((wx1 - wx0) / 2 * u)},${wy0} l0,${wy1 - wy0}" stroke="#1e3028" stroke-width="3"/>`).join('')}</g>`;
    h += `<g transform="translate(${wx1},0) scale(${f(1 - 0.85 * open)},1)"><rect x="${-(wx1 - wx0) / 2}" y="${wy0}" width="${(wx1 - wx0) / 2}" height="${wy1 - wy0}" fill="#3a5a4a" ${ol(1.4)}/>${[0.25, 0.5, 0.75].map(u => `<path d="M${f(-(wx1 - wx0) / 2 * u)},${wy0} l0,${wy1 - wy0}" stroke="#1e3028" stroke-width="3"/>`).join('')}</g>`;
    if (dw < 0.5) h += C.radial((wx0 + wx1) / 2, (wy0 + wy1) / 2, 200, '#ffb860', 0.4 * k * (1 - dw), 'screen');
    h += `<rect x="${wx0 - 20}" y="${wy1}" width="${wx1 - wx0 + 40}" height="40" fill="#4a2e18" ${ol(1.3)}/>`;
    if (open > 0.4) { const rr = rng(13); for (let i = 0; i < 9; i++) { const x = wx0 + 10 + i * 26; h += `<path d="M${x},${wy1} q${f(rr() * 10 - 5)},-30 ${f(rr() * 10 - 5)},-50" stroke="#3a6a2a" stroke-width="4" fill="none"/><circle cx="${f(x + rr() * 8 - 4)}" cy="${f(wy1 - 48 - rr() * 8)}" r="${f(9 + rr() * 4)}" fill="${['#c83040', '#e8a030', '#d84060'][i % 3]}" opacity="${f(open)}"/>`; } }
    // herbs and garlic drying from the lintel, a bench with a basket, a barrel
    for (let i = 0; i < 3; i++) { const x = 820 + i * 34, sw = Math.sin(t * 1.2 + i) * 4; h += `<path d="M${x},1040 L${f(x + sw)},1120" stroke="#3a2a14" stroke-width="3"/>` + E.herbs(x + sw, 1110, 70, ['#5e6a3c', '#7a6a3a', '#6a7a4a'][i], i + 3); }
    h += `<rect x="-420" y="1560" width="560" height="34" fill="#5a3a20" ${ol(1.4)}/><rect x="-390" y="1594" width="30" height="180" fill="#3a2414"/><rect x="80" y="1594" width="30" height="180" fill="#3a2414"/><path d="M-260,1560 C-270,1500 -140,1500 -150,1560Z" fill="#8a6a3a" ${ol(1.2)}/><path d="M-260,1530 L-150,1530" stroke="#5a4020" stroke-width="3"/>`;
    h += `<path d="M1240,1520 C1220,1650 1220,1700 1240,1790 L1460,1790 C1480,1700 1480,1650 1460,1520Z" fill="#5a3a20" ${ol(1.5)}/>` + [1560, 1680].map(y => `<path d="M1226,${y} L1474,${y}" stroke="#1a1a1c" stroke-width="12"/>`).join('');
    // the vine climbing beside the door, its leaves stirring
    let vine = `<path d="M200,1800 C220,1600 160,1400 210,1200 C250,1040 190,880 240,700 C270,580 230,420 280,300" stroke="#2a3a1a" stroke-width="10" fill="none"/>`;
    const rv = rng(17); for (let i = 0; i < 44; i++) { const u = i / 44, y = 1780 - u * 1460, x = 210 + Math.sin(u * 9) * 40 + (rv() - 0.5) * 90, a = (rv() - 0.5) * 60 + Math.sin(t * 1.6 + i) * 8; vine += `<g transform="translate(${f(x)},${f(y)}) rotate(${f(a)})"><path d="M0,0 C14,-12 30,-6 34,6 C20,12 8,10 0,0Z" fill="${mix('#1e3018', '#4a7a2a', dw)}" ${ol(0.8)}/></g>`; if (dw > 0.5 && i % 5 === 2) vine += `<circle cx="${f(x + 10)}" cy="${f(y - 6)}" r="9" fill="#e86a7a" opacity="${f(dw)}"/>`; }
    h += vine;
    // the thatch eave overhead
    h += `<path d="M-700,0 L1500,0 L1500,330 C1100,370 400,380 -700,350Z" fill="${mix('#3a3428', '#a88a50', dw)}" filter="url(#thatch)"/>`;
    const rs = rng(19); for (let i = 0; i < 160; i++) { const x = -680 + rs() * 2160, y = 330 + rs() * 40; h += `<path d="M${f(x)},${f(y - 50)} l${f((rs() - 0.5) * 8)},${f(50 + rs() * 30)}" stroke="${mix('#2a241a', '#8a6a3a', dw)}" stroke-width="3" opacity="0.8"/>`; }
    h += `<rect x="-700" y="340" width="2200" height="80" fill="#000" opacity="0.35" filter="url(#b8)"/>`;
    // the ground: packed earth, straw, stones
    h += `<rect x="-700" y="1790" width="2400" height="600" fill="${mix('#1e1a16', '#7a6448', dw)}" filter="url(#ground)"/>` + E.straw(-600, 1500, 1800, 2100, 120, 3, mix('#5a5040', '#c8a868', dw));
    // light: night = blue wash with a torch glow creeping from the left; morning = low warm sun from the right
    if (dw < 1) h += `<rect x="-700" y="0" width="2400" height="2400" fill="#0a1026" opacity="${f(0.32 * (1 - dw))}" style="mix-blend-mode:multiply"/>` + C.radial(-500, 1300, 900, '#ff7a2a', (o.torch || 0) * 0.45, 'screen') + C.radial(D[0], 1500, 520, '#ffa850', 0.32 * k * (1 - dw), 'screen');
    if (dw > 0) h += C.radial(1500, 600, 1400, '#ffe0a0', 0.3 * dw, 'screen') + `<path d="M1500,0 L1500,2400 L600,2400 L1100,0Z" fill="#fff0c8" opacity="${f(0.07 * dw)}" filter="url(#b14)"/>`;
    L.push({ p: 1, svg: h });
    return L;
  };
})(window);
