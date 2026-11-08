// Sets part 1: throne room, cottage, study, corridor. Every set returns layers [{p, svg}] (p = parallax depth).
(function (G) {
  const { shade, mix, rng, f, uid, OUT, NS, ol } = G.RIG, E = G.ENV, C = G.CINE, PR = G.PROPS;
  const S = {};
  const lg = (id, stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1, units = '') => `<defs><linearGradient id="${id}" ${units ? `gradientUnits="${units}"` : ''} x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a ?? 1}"/>`).join('')}</linearGradient></defs>`;
  S.lg = lg;
  const crownEmblem = (x, y, s, col = '#d8ab40') => `<g transform="translate(${x},${y}) scale(${s})"><path d="M-34,14 L-38,-22 L-20,-4 L0,-30 L20,-4 L38,-22 L34,14Z" fill="${col}" stroke="#3a2a10" stroke-width="2"/><rect x="-36" y="12" width="72" height="12" rx="3" fill="${shade(col, -0.15)}" stroke="#3a2a10" stroke-width="2"/><circle cx="0" cy="-34" r="5" fill="${col}"/><circle cx="-40" cy="-25" r="4" fill="${col}"/><circle cx="40" cy="-25" r="4" fill="${col}"/></g>`;
  S.crownEmblem = crownEmblem;

  // hanging banner with waving lower edge
  S.banner = (x, y, w, h, col, t, ph = 0, emblem = 'crown', trim = '#d8ab40') => {
    const id = uid('bn'), wv = k => Math.sin(t * 1.6 + ph + k * 2.2) * 10;
    const d = `M${x - w / 2},${y} L${x + w / 2},${y} L${x + w / 2 + wv(1) * 0.4},${y + h} L${x + w * 0.18 + wv(0.7)},${y + h - 60} L${x},${y + h + wv(0.5) * 0.3} L${x - w * 0.18 + wv(0.3)},${y + h - 60} L${x - w / 2 + wv(0) * 0.4},${y + h}Z`;
    let g = lg(id, [[0, shade(col, -0.35)], [0.3, shade(col, 0.12)], [0.6, col], [1, shade(col, -0.4)]], 0, 0, 1, 0) + `<path d="${d}" fill="url(#${id})" filter="url(#tex)"/>`;
    for (const k of [-0.3, 0, 0.3]) g += `<path d="M${x + k * w},${y + 10} Q${x + k * w + wv(k) * 0.6},${y + h * 0.6} ${x + k * w + wv(k + 1)},${y + h - 40}" stroke="${shade(col, -0.45)}" stroke-width="${w * 0.07}" fill="none" opacity="0.5" filter="url(#b4)"/>`;
    g += `<path d="${d}" fill="none" stroke="${trim}" stroke-width="5" transform="translate(${x * 0.05},${y * 0.04}) scale(0.95,0.96)" opacity="0.8"/>`;
    g += `<rect x="${x - w / 2 - 14}" y="${y - 14}" width="${w + 28}" height="18" rx="9" fill="#5a3a20" stroke="${OUT}" stroke-width="2"/>`;
    if (emblem === 'crown') g += crownEmblem(x + wv(0.5) * 0.2, y + h * 0.4, w / 110, trim);
    if (emblem === 'raven') g += `<g transform="translate(${x},${y + h * 0.42}) scale(${w / 120})" fill="#e8e0d0"><path d="M-40,10 C-20,-30 20,-34 46,-12 L30,-6 C20,-14 6,-14 -4,-6 L20,8 C2,16 -20,20 -40,10Z"/><circle cx="-26" cy="0" r="10"/><path d="M-36,-2 L-52,4 L-36,6Z"/><path d="M-10,12 L-20,40 M0,12 L4,40" stroke="#e8e0d0" stroke-width="5"/></g>`;
    return g;
  };

  // dust motes drifting continuously through a light shaft (no re-seeding)
  S.dust = (x, y, rx, ry, n, seed, t, col, rMax, op) => {
    const r = rng(seed); let g = '';
    for (let i = 0; i < n; i++) {
      const bx = (r() - 0.5) * 2 * rx, by = (r() - 0.5) * 2 * ry, vx = (r() - 0.5) * 18, vy = -6 - r() * 14, ph = r() * 6.28, rr = 0.8 + r() * rMax, o = op * (0.3 + r() * 0.7);
      const py = ((by + vy * t) % (2 * ry) + 3 * ry) % (2 * ry) - ry, px = bx + vx * t * 0.3 + Math.sin(t * 0.7 + ph) * 14;
      const edge = Math.min(1, (ry - Math.abs(py)) / (ry * 0.25));
      g += `<circle cx="${f(x + px)}" cy="${f(y + py)}" r="${f(rr)}" fill="${col}" opacity="${f(o * Math.max(0, edge))}"/>`;
    }
    return `<g filter="url(#b1)" style="mix-blend-mode:screen">${g}</g>`;
  };
  S.stoneWall = (x0, y0, x1, y1, col, seed, rowH = 70) => {
    const r = rng(seed); let g = `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="${col}" filter="url(#plaster)"/>`;
    for (let y = y0, row = 0; y < y1; y += rowH, row++) {
      g += `<path d="M${x0},${y} L${x1},${y}" stroke="${shade(col, -0.35)}" stroke-width="3" opacity="0.7"/>`;
      for (let x = x0 + (row % 2 ? rowH * 0.9 : 0); x < x1; x += rowH * 1.8 + r() * 20) g += `<path d="M${f(x)},${y} L${f(x)},${y + rowH}" stroke="${shade(col, -0.35)}" stroke-width="3" opacity="0.6"/><rect x="${f(x + 4)}" y="${y + 4}" width="${f(rowH * 1.6)}" height="${rowH - 8}" fill="${shade(col, (r() - 0.5) * 0.12)}" opacity="0.5"/>`;
    }
    return g;
  };

  // ------------------------------------------------------------- THRONE ROOM (our king)
  S.throne = (t, o = {}) => {
    const L = [];
    let far = S.stoneWall(-500, -400, 1580, 1500, '#a3967f', 3);
    for (const wx of [150, 930]) {
      far += `<path d="M${wx - 80},1050 L${wx - 80},420 Q${wx},300 ${wx + 80},420 L${wx + 80},1050Z" fill="#1e1a16"/>` + lg('win' + wx, [[0, '#f4f0e0'], [1, '#b8c8d8']]) +
        `<path d="M${wx - 66},1040 L${wx - 66},430 Q${wx},322 ${wx + 66},430 L${wx + 66},1040Z" fill="url(#win${wx})"/><path d="M${wx},330 L${wx},1040 M${wx - 66},640 L${wx + 66},640 M${wx - 66},850 L${wx + 66},850" stroke="#3a3028" stroke-width="8"/>`;
    }
    far += S.banner(540, 60, 330, 760, o.bc || '#8e1e28', t, 0.3) + S.banner(-120, 120, 220, 600, o.bs || '#2b4a86', t, 1.1) + S.banner(1200, 120, 220, 600, o.bs || '#2b4a86', t, 2.0);
    L.push({ p: 0.55, svg: `<g filter="url(#dof2)">${far}</g>` });
    // throne + dais
    let th = '';
    th += lg('thg', [[0, '#7a5a1a'], [0.3, '#f0cf6a'], [0.6, '#c99a30'], [1, '#6a4a12']], 0, 0, 1, 0);
    th += `<path d="M330,1440 L330,780 Q540,560 750,780 L750,1440Z" fill="url(#thg)" stroke="${OUT}" stroke-width="3"/><path d="M372,1420 L372,820 Q540,650 708,820 L708,1420Z" fill="#7e1622"/><path d="M372,1420 L372,820 Q540,650 708,820 L708,1420Z" fill="none" stroke="#3e0a10" stroke-width="10" opacity="0.5" filter="url(#b4)"/>`;
    th += crownEmblem(540, 860, 1.6) + `<circle cx="540" cy="610" r="26" fill="url(#thg)" stroke="${OUT}" stroke-width="3"/>`;
    for (const x of [300, 780]) th += `<rect x="${x - 34}" y="1180" width="68" height="260" rx="10" fill="url(#thg)" stroke="${OUT}" stroke-width="3"/><circle cx="${x}" cy="1172" r="30" fill="url(#thg)" stroke="${OUT}" stroke-width="3"/>`;
    for (let i = 0; i < 3; i++) { const y = 1440 + i * 60, w = 520 + i * 160; th += `<rect x="${540 - w / 2}" y="${y}" width="${w}" height="60" fill="${shade('#b8ab94', -i * 0.08)}" filter="url(#tex)"/><rect x="${540 - w / 2}" y="${y}" width="${w}" height="10" fill="#fff" opacity="0.18"/>`; }
    th += `<path d="M440,1440 L640,1440 L760,1640 L320,1640Z" fill="#9a1c26" filter="url(#tex)"/><path d="M440,1440 L460,1440 L346,1640 L320,1640Z M640,1440 L620,1440 L734,1640 L760,1640Z" fill="#d8ab40"/>`;
    L.push({ p: 1, svg: th });
    // floor
    let fl = lg('fl1', [[0, '#8a7c66'], [1, '#4a4034']]) + `<rect x="-600" y="1620" width="2300" height="900" fill="url(#fl1)" filter="url(#ground)"/>`;
    for (let i = -14; i <= 14; i++) fl += `<path d="M540,1300 L${540 + i * 220},2600" stroke="#2e261e" stroke-width="3" opacity="0.35"/>`;
    for (const y of [1700, 1800, 1930, 2100, 2320]) fl += `<path d="M-600,${y} L1700,${y}" stroke="#2e261e" stroke-width="3" opacity="0.35"/>`;
    fl += `<path d="M320,1640 L760,1640 L1000,2600 L80,2600Z" fill="#8e1a24" opacity="0.9" filter="url(#tex)"/>`;
    L.push({ p: 1, svg: fl });
    // light: window shafts + dust
    let lt = C.rays(150, 500, [[62, 1], [70, 0.8]], 1600, 70, '#fff2d0', 0.16) + C.rays(930, 500, [[110, 1], [118, 0.8]], 1600, 70, '#fff2d0', 0.12);
    lt += S.dust(400, 900, 500, 700, 40, 7, t, '#fff3d8', 1.6, 0.5);
    L.push({ p: 1, svg: lt, light: true });
    // foreground pillars + candelabra
    let fg = '';
    for (const [x, w] of [[-90, 190], [1170, 190]]) fg += lg('pl' + x, [[0, '#3e342a'], [0.4, '#8a7a62'], [1, '#2e261e']], 0, 0, 1, 0) + `<rect x="${x - w / 2}" y="-400" width="${w}" height="3000" fill="url(#pl${x})" filter="url(#tex)"/>`;
    fg += PR.torch(80, 700, 1.3, t, 1) + PR.torch(1000, 700, 1.3, t, 2);
    L.push({ p: 1.25, svg: `<g filter="url(#dof2)">${fg}</g>` });
    return L;
  };

  // ------------------------------------------------------------- COTTAGE (mother's home); mode 'day' | 'sunset'
  S.cottage = (t, o = {}) => {
    const sunset = o.mode === 'sunset', L = [];
    const sky = sunset ? [[0, '#3c4a6e'], [0.5, '#c87a5a'], [1, '#f2b070']] : [[0, '#8796a6'], [1, '#d4d2c8']];
    let far = E.sky(1080, 900, sky).replace('width="1080"', 'x="-500" width="2100"');
    if (sunset) far += C.bloom(900, 760, 260, '#ffb060', 0.8) + `<circle cx="900" cy="760" r="54" fill="#fff0c8"/>`;
    far += `<g filter="url(#dof3)">${E.ridge(1080, 860, 50, 4, sunset ? '#5a4a58' : '#7d8784', 160)}${E.oak(-80, 900, 0.9, 5)}${E.cottage(980, 900, 90, 52, 0.9, 7, { side: -1, smoke: 140 })}${E.church(1250, 900, 0.7)}</g>`;
    far += `<g opacity="0.6">${E.cloud(200 + t * 6, 260, 420, 90, 3, sunset ? { body: '#b07a7a', lit: '#ffcfa0', dark: '#6a5070' } : {})}${E.cloud(820 + t * 4, 180, 340, 70, 5, sunset ? { body: '#b07a7a', lit: '#ffcfa0', dark: '#6a5070' } : {})}</g>`;
    L.push({ p: 0.4, svg: far });
    // facade of the cottage, close
    let fa = E.daubWall(-500, 380, 1500, 1640, 11, { daub: sunset ? '#c4a07a' : '#b8a888', timber: '#3a2818', posts: [60, 760, 1220], rail: 800, braces: [[60, 800, -200, 1640], [1220, 800, 1450, 1640]] });
    fa += `<g filter="url(#thatch)"><path d="M-600,420 L1700,420 L1700,250 Q540,140 -600,250Z" fill="${sunset ? '#9a7a4a' : '#8e7a50'}"/>` + Array.from({ length: 40 }, (_, i) => `<path d="M${-600 + i * 58},${250 - Math.sin(i / 39 * Math.PI) * 100} L${-610 + i * 58},430" stroke="#5a4628" stroke-width="3" opacity="0.5"/>`).join('') + `<path d="M-600,420 L1700,420" stroke="#4a3a20" stroke-width="22"/></g>`;
    // door (open, dark interior) + window + herbs
    fa += `<rect x="300" y="800" width="300" height="840" fill="#120c08"/><path d="M300,800 L300,1640 L220,1700 L220,760Z" fill="#5a3c22" filter="url(#woodV)" stroke="${OUT}" stroke-width="2"/>`;
    fa += `<rect x="300" y="790" width="300" height="24" fill="#3a2818"/><rect x="0" y="1060" width="180" height="150" fill="#1a1410"/><path d="M0,1060 L180,1060 M90,1060 L90,1210 M0,1135 L180,1135" stroke="#3a2818" stroke-width="10"/>`;
    fa += E.herbs(660, 820, 90, '#6a7440', 3) + E.herbs(720, 820, 70, '#8a7a44', 4);
    fa += `<rect x="640" y="1500" width="380" height="26" fill="#5a3c22" filter="url(#woodH)"/><rect x="660" y="1526" width="24" height="120" fill="#3a2818"/><rect x="980" y="1526" width="24" height="120" fill="#3a2818"/>`;
    L.push({ p: 1, svg: fa });
    // ground
    let gr = lg('cg', [[0, sunset ? '#7a5a40' : '#6e6450'], [1, '#2e281e']]) + `<rect x="-600" y="1620" width="2400" height="900" fill="url(#cg)" filter="url(#ground)"/>` + E.straw(-400, 1500, 1640, 2200, 120, 3, '#9a8a5a') + E.tufts(-500, 1600, 1630, 1700, 50, 4, '#4e5a30');
    L.push({ p: 1, svg: gr });
    // the coffin by the wall (to the right of the door) + flowers later
    let cf = PR.coffin(1110, 1690, 1.55) + `<ellipse cx="1110" cy="1695" rx="150" ry="22" fill="#000" opacity="0.35" filter="url(#soft2)"/>`;
    if (o.flowers) cf += `<g transform="translate(1110,1320)">${[[-30, '#c8384a'], [0, '#e8d24a'], [30, '#c8384a'], [-14, '#ffffff'], [16, '#e87a3a']].map(([x, c]) => `<path d="M${x},40 L${x * 1.3},-20" stroke="#3a6a2a" stroke-width="4"/><circle cx="${x * 1.3}" cy="-24" r="12" fill="${c}"/>`).join('')}</g>`;
    L.push({ p: 1, svg: cf, id: 'coffin' });
    const fgW = E.fence(-600, 120, 2050, 260, 3) + E.tufts(-500, 300, 1950, 2100, 30, 9, '#3a4424');
    L.push({ p: 1.35, svg: `<g filter="url(#dof3)">${fgW}</g>` });
    if (sunset) L.push({ p: 0.9, svg: C.radial(900, 760, 1300, '#ff9a50', 0.35, 'screen'), light: true });
    return L;
  };

  // ------------------------------------------------------------- HOME YARD AT SUNSET (sun at 900,760 on the p=0.4 layer)
  S.flowerCoffin = (x, y, s) => {
    let g = `<ellipse cx="${x}" cy="${y + 4}" rx="${110 * s}" ry="${18 * s}" fill="#000" opacity="0.35" filter="url(#soft2)"/>` + PR.coffin(x, y, s);
    const r = rng(17);
    for (let i = 0; i < 16; i++) {
      const fx = x + (r() - 0.5) * 130 * s, fy = y - (500 + r() * 30) * s, h = (40 + r() * 70) * s, c = ['#c8384a', '#e8d24a', '#f2efe6', '#e87a3a', '#9a5ac8'][i % 5];
      g += `<path d="M${f(fx)},${f(fy + 30 * s)} L${f(fx + (r() - 0.5) * 20)},${f(fy - h)}" stroke="#3a6a2a" stroke-width="${f(4 * s)}"/><circle cx="${f(fx + (r() - 0.5) * 20)}" cy="${f(fy - h)}" r="${f((9 + r() * 6) * s)}" fill="${c}" stroke="#1f140c" stroke-width="1.2"/>`;
    }
    return g;
  };
  S.yard = (t, o = {}) => {
    const L = [];
    let far = E.sky(1080, 1000, [[0, '#2c3760'], [0.42, '#8e5a7c'], [0.72, '#e08868'], [1, '#f4b884']]).replace('width="1080"', 'x="-700" width="2500"');
    far += C.bloom(840, 820, 300, '#ffb070', 0.85) + `<circle cx="840" cy="820" r="58" fill="#fff2d6"/>` + C.bloom(840, 820, 110, '#ffffff', 0.6);
    const cl = { body: '#a8708a', lit: '#ffc49a', dark: '#5e4a6e', sun: [1, 0.2] };
    far += `<g opacity="0.75">${E.cloud(160 + t * 7, 330, 520, 100, 3, cl)}${E.cloud(760 + t * 5, 220, 380, 76, 5, cl)}${E.cloud(1400 + t * 6, 420, 460, 90, 8, cl)}</g>`;
    far += `<g filter="url(#dof2)">${E.ridge(1700, 900, 70, 4, '#5a4a62', 180).replace('M-50', 'M-700')}${E.ridge(1700, 960, 50, 9, '#4a3e50', 150).replace('M-50', 'M-700')}${E.church(1180, 940, 0.8, { stone: '#8a7a88', roof: '#4a3e4a' })}</g>`;
    far += E.birds(300 + t * 40, 520 - t * 3, 6, 3, 1.5, '#2a2030');
    L.push({ p: 0.4, svg: far });
    let mid = `<g filter="url(#dof1)">${E.oak(1300, 1180, 2.2, 5, { dark: '#2e2a30', mid: '#4a3e40', lit: '#a86a50', trunk: '#2a2024' })}${E.hedge(-600, 1800, 1200, 70, 6, '#3e3a34')}</g>`;
    L.push({ p: 0.7, svg: mid });
    let home = E.cottage(-330, 1640, 90, 52, 5.6, 7, { side: 1, sun: 1, wall: '#d8b898', roof: '#8a6a44', smoke: 400, smokeCol: '#b8a8b0', window: '#ffb060' });
    home += `<rect x="-600" y="1620" width="2400" height="900" fill="#5a4636" filter="url(#ground)"/>`;
    L.push({ p: 0.9, svg: home });
    let gr = lg('yg', [[0, '#6e5440'], [1, '#2a2018']]) + `<rect x="-700" y="1640" width="2600" height="1000" fill="url(#yg)" filter="url(#ground)"/>` + `<path d="M380,1640 L700,1640 L980,2600 L80,2600Z" fill="#8a6a50" opacity="0.5" filter="url(#tex)"/>` + E.tufts(-600, 1800, 1650, 2300, 90, 4, '#4e5030');
    gr += S.flowerCoffin(995, 1690, 1.2);
    L.push({ p: 1, svg: gr });
    L.push({ p: 1, svg: C.radial(860, 860, 1500, '#ff9a60', 0.32), light: true });
    L.push({ p: 1.35, svg: `<g filter="url(#dof3)">${E.fence(-700, 1900, 2220, 280, 3, '#2e2420')}${E.tufts(-600, 1800, 2240, 2400, 40, 9, '#2a2a18')}</g>` });
    return L;
  };

  // ------------------------------------------------------------- KING'S STUDY (night, candles)
  S.study = (t, o = {}) => {
    const L = [];
    let w = S.stoneWall(-500, -300, 1600, 1500, '#5e5244', 8, 64);
    w += `<rect x="-300" y="200" width="420" height="1100" fill="#3a2a1c" filter="url(#woodV)"/>`;
    const r = rng(4); for (let sh = 0; sh < 6; sh++) { const y = 260 + sh * 180; w += `<rect x="-300" y="${y + 150}" width="420" height="20" fill="#2a1c10"/>`; for (let x = -290; x < 110; x += 24 + r() * 14) { const bh = 90 + r() * 50, c = ['#6a2a22', '#2a3a5a', '#4a5a2a', '#7a6a3a', '#3a2a1a'][Math.floor(r() * 5)]; w += `<rect x="${f(x)}" y="${f(y + 150 - bh)}" width="${f(20 + r() * 8)}" height="${f(bh)}" fill="${c}" stroke="#140c08" stroke-width="1.5"/>`; } }
    w += `<rect x="760" y="300" width="300" height="420" rx="140" fill="#0c1426"/><circle cx="930" cy="430" r="46" fill="#dfe6f2"/>` + C.bloom(930, 430, 130, '#9ab4e0', 0.4) + `<rect x="760" y="300" width="300" height="420" rx="140" fill="none" stroke="#2a1c10" stroke-width="22"/><path d="M910,300 L910,720 M760,520 L1060,520" stroke="#2a1c10" stroke-width="10"/>`;
    w += `<rect x="300" y="160" width="400" height="300" fill="#c8b48a" filter="url(#plaster)"/><path d="M330,200 Q420,260 360,330 Q450,380 520,300 Q600,240 660,320 M340,400 Q500,350 650,420" stroke="#6a4a2a" stroke-width="5" fill="none" opacity="0.7"/><rect x="300" y="160" width="400" height="300" fill="none" stroke="#3a2818" stroke-width="10"/>`;
    L.push({ p: 0.55, svg: `<g filter="url(#dof2)">${w}</g>` });
    return L;
  };
  // desk in front of the seated king (drawn as a foreground layer)
  S.desk = (t, o = {}) => {
    let d = lg('dk', [[0, '#7a5232'], [0.12, '#4a2e1a'], [1, '#1e1208']]) + `<rect x="-200" y="1360" width="1480" height="700" fill="url(#dk)" filter="url(#woodH)"/><path d="M-200,1362 L1280,1362" stroke="#ffb070" stroke-width="4" opacity="0.6"/>`;
    // stacks of parchment, inkwell, candles
    d += `<path d="M640,1356 L900,1356 L890,1300 L650,1306Z" fill="#e2d2a8" stroke="${OUT}" stroke-width="2"/><path d="M660,1300 L880,1296 L872,1260 L668,1266Z" fill="#d8c69a" stroke="${OUT}" stroke-width="2"/>`;
    d += `<ellipse cx="200" cy="1356" rx="54" ry="14" fill="#1a1612"/><path d="M152,1356 L160,1300 L240,1300 L248,1356Z" fill="#2a2a34" stroke="${OUT}" stroke-width="2"/><ellipse cx="200" cy="1300" rx="40" ry="10" fill="#0a0a10"/>`;
    d += PR.candle(80, 1360, 160, t, 1.1) + PR.candle(960, 1360, 220, t + 0.7, 1.15) + PR.candle(1030, 1360, 130, t + 1.4, 1.0);
    if (o.longScroll) { const k = o.longScroll; d += `<path d="M380,1340 L700,1340 L720,${1360 + k * 520} Q560,${1400 + k * 560} 400,${1360 + k * 520}Z" fill="#e6d3a6" stroke="${OUT}" stroke-width="2"/>` + Array.from({ length: Math.floor(k * 16) }, (_, i) => `<path d="M420,${1380 + i * 32} q60,-8 120,0 t120,0 t100,0" stroke="#3a2a1a" stroke-width="3" fill="none" opacity="0.6"/>`).join('') + `<ellipse cx="560" cy="${f(1400 + k * 540)}" rx="170" ry="26" fill="#d8c69a" stroke="${OUT}" stroke-width="2"/>`; }
    return d;
  };

  // ------------------------------------------------------------- CORRIDOR (castle, torches)
  S.corridor = (t, o = {}) => {
    const L = [];
    // o.ph (0..1, keeps growing) slides every arch one step closer: the corridor streams past the camera
    const ph = (o.ph || 0) % 1, cx = 540, cy = 1000;
    let w = `<rect x="-600" y="-400" width="2300" height="2900" fill="#1e1a16"/>`;
    w += lg('cfl', [[0, '#2a221c'], [0.3, '#4a3e30'], [1, '#6e604c']]) + `<path d="M${cx},${cy} L1900,2600 L-820,2600Z" fill="url(#cfl)" filter="url(#ground)"/>`;
    for (let i = -10; i <= 10; i++) w += `<path d="M${cx},${cy} L${540 + i * 260},2600" stroke="#1e1812" stroke-width="3" opacity="0.4"/>`;
    for (let j = 1; j < 14; j++) { const k = Math.pow(0.72, j - ph * 1); const y = cy + 600 * k; if (y < 2600) w += `<path d="M${cx - 2200 * k},${f(y)} L${cx + 2200 * k},${f(y)}" stroke="#1e1812" stroke-width="${f(2 + 2 * k)}" opacity="0.35"/>`; }
    for (let i = 8; i >= 0; i--) {
      const d = i - ph, k = Math.pow(0.72, d), aw = 760 * k, ah = 1500 * k, top = cy - ah * 0.62, bot = cy + ah * 0.38;
      if (k > 2.6) continue;
      const col = shade('#9a8c74', -Math.min(0.85, 0.12 * Math.max(0, d)));
      w += `<path d="M${f(cx - aw * 1.6)},${f(top - 400 * k)} L${f(cx + aw * 1.6)},${f(top - 400 * k)} L${f(cx + aw * 1.6)},${f(bot)} L${f(cx + aw / 2)},${f(bot)} L${f(cx + aw / 2)},${f(top + aw * 0.5)} Q${cx},${f(top - aw * 0.1)} ${f(cx - aw / 2)},${f(top + aw * 0.5)} L${f(cx - aw / 2)},${f(bot)} L${f(cx - aw * 1.6)},${f(bot)}Z" fill="${col}" filter="url(#tex)" stroke="#1a140e" stroke-width="${f(3 * k + 1)}"/>`;
      if (k < 1.7) w += PR.torch(cx - aw * 0.75, top + ah * 0.35, 1.2 * k, t, i) + PR.torch(cx + aw * 0.75, top + ah * 0.35, 1.2 * k, t, i + 3) + C.bloom(cx - aw * 0.75, top + ah * 0.3, 160 * k + 20, '#ff9a40', 0.5) + C.bloom(cx + aw * 0.75, top + ah * 0.3, 160 * k + 20, '#ff9a40', 0.5);
    }
    L.push({ p: 0.6, svg: `<g filter="url(#dof2)">${w}</g>` });
    return L;
  };

  G.SETS = Object.assign(G.SETS || {}, S);
})(window);




