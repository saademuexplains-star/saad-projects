// More sets for "The Whipping Boy": castle gate exterior, chapel, palace garden, servants' attic.
(function (G) {
  const { shade, mix, rng, f, uid, OUT, NS, ol } = G.RIG, E = G.ENV, C = G.CINE, PR = G.PROPS, S = G.SETS;
  const lg = S.lg;
  const sky = (stops, h = 1100) => E.sky(1080, h, stops).replace('width="1080"', 'x="-900" width="2900"');

  // ------------------------------------------------------------- CASTLE GATE (exterior, bright day)
  S.tower = (x, y, w, h, roofCol, t, flag = '#5a2a7a') => {
    const id = uid('tw');
    let g = lg(id, [[0, '#7a7468'], [0.3, '#c8c0b0'], [0.7, '#b0a898'], [1, '#6a6458']], 0, 0, 1, 0);
    g += `<rect x="${x - w / 2}" y="${y - h}" width="${w}" height="${h}" fill="url(#${id})" filter="url(#tex)" ${ol()}/>`;
    for (let yy = y - h + 40; yy < y; yy += 46) g += `<path d="M${x - w / 2},${yy} L${x + w / 2},${yy}" stroke="#6a6458" stroke-width="2" opacity="0.5"/>`;
    for (const yy of [y - h * 0.7, y - h * 0.4]) g += `<rect x="${x - 12}" y="${yy}" width="24" height="56" rx="12" fill="#2a2420"/>`;
    g += `<path d="M${x - w / 2 - 20},${y - h} L${x},${y - h - w * 1.1} L${x + w / 2 + 20},${y - h}Z" fill="${roofCol}" filter="url(#tex)" ${ol()}/><path d="M${x},${y - h - w * 1.1} L${x + w / 2 + 20},${y - h} L${x + w / 4},${y - h}Z" fill="#000" opacity="0.18"/>`;
    const fy = y - h - w * 1.1, wv = k => Math.sin(t * 5 + k * 1.7) * 10;
    g += `<path d="M${x},${fy} L${x},${fy - 120}" stroke="#3a3430" stroke-width="5"/><path d="M${x},${fy - 120} Q${x + 50},${fy - 120 + wv(0)} ${x + 110},${fy - 110 + wv(1)} L${x + 100},${fy - 80 + wv(2)} Q${x + 50},${fy - 76 + wv(1)} ${x},${fy - 76}Z" fill="${flag}" ${ol(1.2)}/>`;
    return g;
  };
  S.gate = (t, o = {}) => {
    const L = [];
    let far = sky([[0, '#6a9ad0'], [0.6, '#a8c8e4'], [1, '#e4ecf0']]);
    far += `<g opacity="0.9">${E.cloud(100 + t * 10, 300, 520, 110, 3)}${E.cloud(820 + t * 7, 210, 420, 90, 5)}${E.cloud(1500 + t * 9, 360, 480, 100, 8)}</g>`;
    far += `<g filter="url(#dof2)">${E.ridge(1700, 1180, 80, 4, '#7a9480', 170).replace('M-50', 'M-900')}${E.ridge(1700, 1260, 60, 9, '#5e7a5a', 150).replace('M-50', 'M-900')}</g>`;
    far += E.birds(200 + t * 60, 420 - t * 6, 6, 3, 1.4, '#2a2a30') + E.birds(900 - t * 40, 300, 4, 7, 1.1, '#2a2a30');
    L.push({ p: 0.4, svg: far });
    // the castle front: curtain wall, two towers, gatehouse with raised portcullis, banners
    let cw = lg('cwl', [[0, '#b8b0a0'], [1, '#8a8274']]) + `<rect x="-900" y="620" width="2900" height="940" fill="url(#cwl)" filter="url(#tex)"/>`;
    for (let x = -900; x < 2000; x += 80) cw += `<rect x="${x}" y="580" width="48" height="50" fill="#a8a090" ${ol(1.2)}/>`;
    for (let yy = 660; yy < 1560; yy += 52) cw += `<path d="M-900,${yy} L2000,${yy}" stroke="#6a6458" stroke-width="2" opacity="0.4"/>`;
    cw += S.tower(170, 1560, 260, 1150, '#4a5a7a', t) + S.tower(910, 1560, 260, 1150, '#4a5a7a', t + 1);
    cw += S.tower(-600, 1560, 220, 1000, '#4a5a7a', t + 2) + S.tower(1680, 1560, 220, 1000, '#4a5a7a', t + 3);
    // gatehouse arch
    cw += `<rect x="330" y="520" width="420" height="1040" fill="#a49c8c" filter="url(#tex)" ${ol()}/>` + [350, 420, 490, 560, 630, 700].map(x => `<rect x="${x}" y="480" width="40" height="46" fill="#a49c8c" ${ol(1.2)}/>`).join('');
    cw += `<path d="M390,1560 L390,1080 A150,150 0 0 1 690,1080 L690,1560Z" fill="#2a2218"/>` + lg('gl', [[0, '#e8dcc0'], [1, '#c8b890']]) + `<path d="M430,1560 L430,1110 A110,110 0 0 1 650,1110 L650,1560Z" fill="url(#gl)" opacity="0.85"/>` + C.bloom(540, 1300, 220, '#fff4dc', 0.4);
    const pu = o.portcullis ?? 0.85;
    let grid = ''; for (let x = 400; x <= 680; x += 40) grid += `<path d="M${x},${930} L${x},${f(930 + 630 * (1 - pu))}" stroke="#3a3430" stroke-width="10"/><path d="M${x - 6},${f(930 + 630 * (1 - pu))} l6,18 l6,-18Z" fill="#3a3430"/>`;
    for (let y = 950; y < 930 + 630 * (1 - pu); y += 50) grid += `<path d="M390,${y} L690,${y}" stroke="#3a3430" stroke-width="8"/>`;
    cw += `<g>${grid}</g><path d="M390,1080 A150,150 0 0 1 690,1080" fill="none" stroke="#6a6458" stroke-width="30"/>`;
    cw += S.banner(270, 700, 120, 420, '#5a2a7a', t, 0.4) + S.banner(810, 700, 120, 420, '#5a2a7a', t, 1.3);
    L.push({ p: 0.8, svg: cw });
    // moat, drawbridge, cobbled road
    let gr = `<rect x="-900" y="1540" width="2900" height="90" fill="#4a6a7a"/>` + Array.from({ length: 12 }, (_, i) => `<path d="M${-800 + i * 240 + Math.sin(t * 1.5 + i) * 20},${1570 + (i % 3) * 18} q40,-8 80,0" stroke="#cfe0ea" stroke-width="3" fill="none" opacity="0.5"/>`).join('');
    gr += lg('grs', [[0, '#7a9a5a'], [1, '#4a6a3a']]) + `<rect x="-900" y="1620" width="2900" height="1300" fill="url(#grs)" filter="url(#ground)"/>`;
    gr += `<path d="M420,1540 L660,1540 L760,1640 L320,1640Z" fill="#6a4a2c" filter="url(#woodH)" ${ol()}/>` + [0, 1, 2, 3].map(i => `<path d="M${430 - i * 30},${1560 + i * 25} L${650 + i * 30},${1560 + i * 25}" stroke="#3a2414" stroke-width="3"/>`).join('');
    gr += `<path d="M320,1640 L760,1640 L1180,2900 L-100,2900Z" fill="#9a9080" filter="url(#tex)"/>`;
    const rc = rng(4); for (let i = 0; i < 160; i++) { const v = rc(), y = 1650 + v * v * 1250, hw = 220 + (y - 1640) * 0.53, x = 540 + (rc() - 0.5) * 2 * hw, sz = 10 + (y - 1640) * 0.05; gr += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(sz)}" ry="${f(sz * 0.55)}" fill="${shade('#8a8072', (rc() - 0.5) * 0.25)}" stroke="#4a443c" stroke-width="1.5" opacity="0.9"/>`; }
    gr += E.tufts(-900, 2000, 1640, 2400, 140, 6, '#4e6a32');
    L.push({ p: 1, svg: gr });
    L.push({ p: 1, svg: C.radial(700, 400, 1800, '#fff6e0', 0.18), light: true });
    L.push({ p: 1.35, svg: `<g filter="url(#dof3)">${E.tufts(-900, 2000, 2350, 2600, 80, 11, '#3a5428')}${E.fence(-900, 120, 2560, 260, 5)}</g>` });
    return L;
  };

  // ------------------------------------------------------------- CHAPEL (golden, sacred)
  S.lancet = (x, y, w, h, seed) => {
    const r = rng(seed), id = uid('ln'), d = `M${x - w / 2},${y + h} L${x - w / 2},${y + w * 0.6} Q${x - w / 2},${y} ${x},${y - w * 0.2} Q${x + w / 2},${y} ${x + w / 2},${y + w * 0.6} L${x + w / 2},${y + h}Z`;
    const cols = ['#c83a3a', '#3a6ac8', '#e8c84a', '#3aa86a', '#9a4ac8'];
    let g = `<defs><clipPath id="${id}"><path d="${d}"/></clipPath></defs><g clip-path="url(#${id})"><rect x="${x - w / 2}" y="${y - w}" width="${w}" height="${h + w}" fill="#fff4dc"/>`;
    for (let yy = y - w; yy < y + h; yy += 34) for (let xx = x - w / 2; xx < x + w / 2; xx += 34) g += `<rect x="${xx + 2}" y="${yy + 2}" width="30" height="30" fill="${cols[Math.floor(r() * 5)]}" opacity="0.8"/>`;
    g += `<circle cx="${x}" cy="${y + h * 0.35}" r="${w * 0.3}" fill="#f0d070" opacity="0.9"/></g><path d="${d}" fill="none" stroke="#4a3e30" stroke-width="16"/>`;
    return g;
  };
  S.chapel = (t, o = {}) => {
    const L = [];
    let w = `<rect x="-900" y="-600" width="2900" height="2300" fill="#8a7c66" filter="url(#plaster)"/>`;
    for (const x of [-700, -200, 300, 780, 1280, 1780]) w += `<rect x="${x - 50}" y="-600" width="100" height="2300" fill="#9a8c74" filter="url(#tex)" ${ol(1)}/><path d="M${x - 250},-200 Q${x},-520 ${x + 250},-200" stroke="#7a6c56" stroke-width="40" fill="none"/>`;
    for (const x of [-450, 50, 1030, 1530]) w += S.lancet(x, 0, 200, 800, Math.abs(x) + 3);
    // altar with gold sunburst
    w += `<path d="M540,320 L540,320" />` + Array.from({ length: 24 }, (_, i) => { const a = i / 24 * 6.283 + t * 0.2; return `<path d="M540,520 L${f(540 + Math.cos(a) * 260)},${f(520 + Math.sin(a) * 260)}" stroke="#e8c84a" stroke-width="${i % 2 ? 6 : 12}" opacity="0.7"/>`; }).join('') + `<circle cx="540" cy="520" r="90" fill="#f0d070" ${ol()}/><circle cx="540" cy="520" r="60" fill="#fff4c0"/>`;
    w += `<rect x="300" y="1160" width="480" height="300" fill="#efe9dc" ${ol()}/><rect x="300" y="1160" width="480" height="40" fill="#c9a040"/><path d="M520,1160 L520,1460 M560,1160 L560,1460" stroke="#c9a040" stroke-width="10"/>`;
    for (const x of [340, 740]) w += `<rect x="${x - 10}" y="1020" width="20" height="140" fill="#c9a040" ${ol(1)}/>` + PR.candle(x, 1020, 80, t + x, 0.8);
    w += `<path d="M150,1460 L930,1460 L1010,1540 L70,1540Z" fill="#d8d0c0" filter="url(#tex)" ${ol()}/><path d="M70,1540 L1010,1540 L1090,1620 L-10,1620Z" fill="#c8c0b0" filter="url(#tex)" ${ol()}/>`;
    L.push({ p: 0.7, svg: `<g filter="url(#dof1)">${w}</g>` });
    let fl = lg('chf', [[0, '#6a5e50'], [1, '#2a2420']]) + `<rect x="-900" y="1610" width="2900" height="1300" fill="url(#chf)" filter="url(#ground)"/><path d="M380,1610 L700,1610 L1000,2900 L80,2900Z" fill="#8a1a24" filter="url(#tex)"/>`;
    for (const sx of [-1, 1]) for (let i = 0; i < 4; i++) { const y = 1700 + i * 210, x = 540 + sx * (330 + i * 120); fl += `<rect x="${f(x - 180 - i * 30)}" y="${y}" width="${360 + i * 60}" height="${70 + i * 10}" rx="10" fill="#4a2c18" filter="url(#woodH)" ${ol()}/>`; }
    L.push({ p: 1, svg: fl });
    let lt = C.rays(-450, 300, [[60, 1.4], [70, 1]], 2200, 100, '#fff0c8', 0.22) + C.rays(1530, 300, [[110, 1.4], [120, 1]], 2200, 100, '#fff0c8', 0.22) + C.rays(540, -200, [[85, 1.6], [95, 1.6]], 2200, 120, '#fff4d0', 0.25 * (o.holy ?? 1));
    for (let i = 0; i < 3; i++) lt += E.smoke(300 + i * 240, 1160, 600, 7 + i, '#e8e0d0', 0.18).replace(/d="M/, `transform="translate(${f(Math.sin(t * 0.6 + i) * 30)},${f(-((t * 40 + i * 90) % 200))})" d="M`);
    lt += S.dust(540, 1000, 600, 700, 50, 21, t, '#ffe8a0', 2, 0.6);
    L.push({ p: 1, svg: lt, light: true });
    L.push({ p: 1.3, svg: `<g filter="url(#dof3)"><rect x="-900" y="2300" width="2900" height="800" fill="#1a1210" opacity="0.7"/>${PR.candle(-60, 2400, 220, t, 2.2)}${PR.candle(1160, 2400, 180, t + 2, 2.2)}</g>` + C.bloom(-60, 1900, 200, '#ffb860', 0.5) + C.bloom(1160, 2000, 180, '#ffb860', 0.5) });
    return L;
  };

  // ------------------------------------------------------------- PALACE GARDEN (fountain, hedges, roses)
  S.fountain = (x, y, s, t) => {
    let g = `<ellipse cx="${x}" cy="${y}" rx="${260 * s}" ry="${60 * s}" fill="#8a8274" ${ol()}/><ellipse cx="${x}" cy="${y - 12 * s}" rx="${235 * s}" ry="${48 * s}" fill="#5a8aa0"/>`;
    for (let i = 0; i < 5; i++) { const k = ((t * 0.6 + i / 5) % 1); g += `<ellipse cx="${x}" cy="${y - 12 * s}" rx="${f(40 * s + k * 190 * s)}" ry="${f(10 * s + k * 38 * s)}" fill="none" stroke="#e0f0f8" stroke-width="2" opacity="${f(0.6 * (1 - k))}"/>`; }
    g += `<rect x="${x - 24 * s}" y="${y - 260 * s}" width="${48 * s}" height="${250 * s}" fill="#a8a090" filter="url(#tex)" ${ol()}/><ellipse cx="${x}" cy="${y - 260 * s}" rx="${110 * s}" ry="${26 * s}" fill="#9a9284" ${ol()}/>`;
    for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283, ph = (t * 1.4 + i * 0.13) % 1; const ex = x + Math.cos(a) * 120 * s, ey = y - 30 * s; g += `<path d="M${x},${y - 270 * s} Q${f(x + Math.cos(a) * 70 * s)},${f(y - 400 * s)} ${f(ex)},${f(ey)}" stroke="#d8eef8" stroke-width="${f(5 * s)}" fill="none" opacity="0.7" stroke-dasharray="${f(30 * s)} ${f(18 * s)}" stroke-dashoffset="${f(-ph * 48 * s)}"/>`; }
    g += `<path d="M${x},${y - 270 * s} L${x},${y - 380 * s}" stroke="#e8f6ff" stroke-width="${f(8 * s)}" opacity="0.8"/>` + C.bloom(x, y - 300 * s, 60 * s, '#ffffff', 0.25);
    return g;
  };
  S.topiary = (x, y, s, seed) => `<g filter="url(#leaf)"><rect x="${x - 14 * s}" y="${y - 60 * s}" width="${28 * s}" height="${60 * s}" fill="#4a3220"/><path d="M${x - 70 * s},${y - 40 * s} L${x},${y - 330 * s} L${x + 70 * s},${y - 40 * s}Z" fill="#3e6a34" ${ol()}/><path d="M${x},${y - 330 * s} L${x + 70 * s},${y - 40 * s} L${x + 20 * s},${y - 40 * s}Z" fill="#000" opacity="0.15"/></g><rect x="${x - 50 * s}" y="${y - 40 * s}" width="${100 * s}" height="${50 * s}" fill="#9a6a4a" ${ol()}/>`;
  S.roses = (x0, x1, y, h, seed, t) => { const r = rng(seed); let g = E.hedge(x0, x1, y, h, seed, '#3a5a2e'); for (let i = 0; i < (x1 - x0) / 18; i++) { const x = x0 + r() * (x1 - x0), yy = y - r() * h * 1.3, sw = Math.sin(t * 1.3 + i) * 2; g += `<circle cx="${f(x + sw)}" cy="${f(yy)}" r="${f(7 + r() * 5)}" fill="${['#c8304a', '#e8607a', '#f0d0d8'][Math.floor(r() * 3)]}" stroke="#5a1a24" stroke-width="1.2"/>`; } return g; };
  S.urn = (x, y, s, broken = 0) => {
    if (broken <= 0) return `<g transform="translate(${x},${y}) scale(${s})"><path d="M-60,-200 Q-90,-120 -50,-40 L-40,0 L40,0 L50,-40 Q90,-120 60,-200Z" fill="#b8b0a0" filter="url(#tex)" ${ol()}/><ellipse cx="0" cy="-200" rx="66" ry="14" fill="#8a8274" ${ol()}/>${S.roses(-60, 60, -200, 40, 9, 0)}</g>`;
    const r = rng(12); let g = '';
    for (let i = 0; i < 9; i++) { const u = Math.min(1, broken), a = r() * 3.14 + 3.14, sp = 80 + r() * 160, px = Math.cos(a) * sp * u * 1.8 * (r() > 0.5 ? 1 : -1), py = -60 + Math.min(0, -sp * u * 2 + 600 * u * u * 1.6) + 50, rot = r() * 360 * u;
      g += `<path d="M-24,-20 L22,-26 L30,14 L-18,22Z" transform="translate(${f(px)},${f(Math.min(0, py))}) rotate(${f(rot)})" fill="#b8b0a0" ${ol(1.2)}/>`; }
    g += `<ellipse cx="0" cy="4" rx="${f(70 * Math.min(1, broken * 2))}" ry="14" fill="#5a3e28" opacity="0.8"/>`;
    return `<g transform="translate(${x},${y}) scale(${s})">${g}</g>`;
  };
  S.garden = (t, o = {}) => {
    const L = [];
    let far = sky([[0, '#5a8ac8'], [1, '#d8e8f0']]) + `<g opacity="0.85">${E.cloud(300 + t * 8, 280, 520, 100, 4)}${E.cloud(1100 + t * 6, 200, 400, 80, 6)}</g>` + E.birds(100 + t * 50, 360, 5, 9, 1.2, '#2a2a30');
    // palace facade
    let fc = `<rect x="-900" y="420" width="2900" height="900" fill="#d8ccb0" filter="url(#plaster)"/>` + [-900, -500, -100, 300, 700, 1100, 1500, 1900].map(x => `<rect x="${x + 60}" y="560" width="120" height="240" rx="60" fill="#3a4a5a" ${ol()}/><rect x="${x + 60}" y="900" width="120" height="240" rx="60" fill="#3a4a5a" ${ol()}/><path d="M${x + 120},560 L${x + 120},800 M${x + 120},900 L${x + 120},1140" stroke="#d8ccb0" stroke-width="8"/>`).join('');
    fc += `<rect x="-900" y="380" width="2900" height="50" fill="#b8ac90" ${ol()}/>` + Array.from({ length: 36 }, (_, i) => `<rect x="${-900 + i * 82}" y="330" width="40" height="52" fill="#c8bca0" ${ol(1)}/>`).join('');
    fc += `<rect x="380" y="840" width="340" height="40" fill="#b8ac90" ${ol()}/>` + Array.from({ length: 9 }, (_, i) => `<rect x="${392 + i * 36}" y="780" width="14" height="60" fill="#b8ac90"/>`).join('');
    fc += S.banner(250, 480, 110, 360, '#5a2a7a', t, 0.2) + S.banner(850, 480, 110, 360, '#5a2a7a', t, 1.4);
    L.push({ p: 0.45, svg: far + `<g filter="url(#dof2)">${fc}</g>` });
    let mid = S.roses(-900, 2000, 1335, 90, 3, t) + [-500, -150, 1600, 1900].map((x, i) => S.topiary(x, 1345, 1.1, i)).join('');

    let gr = lg('gg', [[0, '#7a9a5a'], [1, '#4a6a34']]) + `<rect x="-900" y="1320" width="2900" height="1600" fill="url(#gg)" filter="url(#ground)"/>`;
    gr += `<path d="M330,1320 L750,1320 L1150,2900 L-70,2900Z" fill="#c8b890" filter="url(#tex)"/>` + E.straw(100, 980, 1330, 2400, 120, 5, '#a89870');
    gr += S.fountain(o.fountainX ?? 1180, 1640, 1.0, t);
    gr += E.tufts(-900, 2000, 1340, 2300, 120, 7, '#5a7a3a');
    L.push({ p: 1, svg: gr });
    L.push({ p: 0.97, svg: `<g filter="url(#dof1)">${mid}</g>` });
    // drifting petals
    let pt = ''; const rp = rng(41); for (let i = 0; i < 26; i++) { const sx = rp() * 2200 - 600, sp = 40 + rp() * 60, ph = rp() * 10, y = ((t * sp + ph * 200) % 1800) + 100, x = sx + Math.sin(t * 1.2 + ph) * 40 + t * 20; pt += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="7" ry="4" fill="${rp() > 0.5 ? '#f0b0c0' : '#ffffff'}" transform="rotate(${f(t * 90 + ph * 30)} ${f(x)} ${f(y)})" opacity="0.85"/>`; }
    L.push({ p: 1.05, svg: pt, light: true });
    L.push({ p: 1, svg: C.radial(800, 300, 1800, '#fff6e0', 0.2), light: true });
    L.push({ p: 1.35, svg: `<g filter="url(#dof3)">${S.roses(-900, 2000, 2700, 200, 8, t)}</g>` });
    return L;
  };

  // ------------------------------------------------------------- SERVANTS' ATTIC (seasons pass outside)
  // o.season: 0 winter -> 1 spring -> 2 summer -> 3 autumn -> 4 dawn; o.night 0..1
  S.attic = (t, o = {}) => {
    const L = [], s = o.season ?? 0, k = Math.floor(Math.min(3.999, s)), u = s - k;
    const skies = [['#2a3a5a', '#6a7a9a'], ['#6a9ac8', '#c8e0d8'], ['#4a8ad8', '#d8ecf8'], ['#c87a4a', '#f0c890'], ['#f0a870', '#ffe0b0']];
    const a = skies[k], b = skies[Math.min(4, k + 1)];
    const top = mix(a[0], b[0], u), bot = mix(a[1], b[1], u);
    // window opening (outside view)
    let win = `<rect x="330" y="420" width="420" height="520" fill="${bot}"/>` + `<rect x="330" y="420" width="420" height="260" fill="${top}" opacity="0.8"/>`;
    win += `<path d="M330,820 Q460,760 560,800 Q660,770 750,810 L750,940 L330,940Z" fill="${mix(mix('#e8eef4', '#6a9a4a', Math.min(1, s)), '#c87a3a', Math.max(0, s - 2.5) * 2 > 1 ? 1 : Math.max(0, s - 2.5) * 2)}"/>`;
    const r = rng(7); let fall = '';
    for (let i = 0; i < 40; i++) { const x = 330 + r() * 420, sp = 60 + r() * 80, y = 420 + ((t * sp + r() * 520) % 520), snow = Math.max(0, 1 - s * 1.5), leaf = Math.max(0, 1 - Math.abs(s - 3) * 1.5), petal = Math.max(0, 1 - Math.abs(s - 1) * 1.5);
      if (snow > 0.05) fall += `<circle cx="${f(x + Math.sin(t + i) * 8)}" cy="${f(y)}" r="${f(2 + r() * 2.5)}" fill="#fff" opacity="${f(snow * 0.9)}"/>`;
      if (leaf > 0.05) fall += `<ellipse cx="${f(x + Math.sin(t * 2 + i) * 14)}" cy="${f(y)}" rx="6" ry="3.5" fill="#d8782a" opacity="${f(leaf)}" transform="rotate(${f(t * 120 + i * 40)} ${f(x)} ${f(y)})"/>`;
      if (petal > 0.05) fall += `<ellipse cx="${f(x + Math.sin(t * 1.5 + i) * 10)}" cy="${f(y)}" rx="5" ry="3" fill="#f6c0d0" opacity="${f(petal)}"/>`; }
    win += fall + `<path d="M540,420 L540,940 M330,680 L750,680" stroke="#3a2818" stroke-width="16"/><rect x="330" y="420" width="420" height="520" fill="none" stroke="#3a2818" stroke-width="30"/>`;
    // sloped roof beams, plank walls
    let w = `<rect x="-900" y="-400" width="2900" height="2100" fill="#5a3e28" filter="url(#woodV)"/>`;
    for (let x = -900; x < 2000; x += 70) w += `<path d="M${x},-400 L${x},1700" stroke="#2a1a10" stroke-width="3" opacity="0.6"/>`;
    w += win;
    w += `<path d="M-900,-100 L540,-500 L1980,-100 L1980,200 L540,-200 L-900,200Z" fill="#3a2414" filter="url(#woodH)" ${ol()}/>`;
    for (const x of [-300, 1380]) w += `<rect x="${x - 40}" y="-300" width="80" height="2000" fill="#3a2414" filter="url(#woodV)" ${ol()}/>`;
    w += `<path d="M-200,180 L-120,180 M1300,180 L1380,180" stroke="#2a1a10" stroke-width="8"/>`;
    // the old rags hanging on a peg (a callback to the street)
    w += `<circle cx="960" cy="640" r="10" fill="#2a1a10"/><path d="M930,650 L990,650 L1010,900 Q960,930 910,900Z" fill="#7d6e55" filter="url(#cloth)" ${ol()}/>`;
    L.push({ p: 0.8, svg: w });
    let fl = `<rect x="-900" y="1560" width="2900" height="1300" fill="#4a3220" filter="url(#woodH)"/>` + Array.from({ length: 20 }, (_, i) => `<path d="M540,1300 L${-900 + i * 160},2900" stroke="#2a1a10" stroke-width="3" opacity="0.5"/>`).join('');
    // straw bed with a thin blanket, a crate with a candle
    fl += `<rect x="-560" y="1620" width="560" height="120" rx="20" fill="#b8a070" filter="url(#thatch)" ${ol()}/><path d="M-520,1610 L-60,1600 L-40,1690 L-540,1700Z" fill="#6a5a7a" filter="url(#cloth)" ${ol()}/><rect x="-600" y="1600" width="40" height="160" fill="#5a3e28" ${ol(1)}/>`;
    fl += `<rect x="1080" y="1560" width="200" height="180" fill="#6a4a2c" filter="url(#woodV)" ${ol()}/>` + PR.candle(1180, 1560, 60 + 60 * (1 - Math.min(1, s / 4)), t, 1.0);
    L.push({ p: 1, svg: fl });
    // window beam + candle glow, darkened by night
    const day = 1 - (o.night ?? 0);
    L.push({ p: 1, svg: C.rays(540, 600, [[78, 1.2], [92, 1.2], [104, 1]], 1700, 110, mix('#cfe0ff', '#ffe8c0', Math.min(1, s / 2)), 0.22 * day) + C.bloom(1180, 1460, 200, '#ffb860', 0.4) + `<rect x="-900" y="-400" width="2900" height="3300" fill="#0a0c1c" opacity="${f(0.45 * (o.night ?? 0))}" style="mix-blend-mode:multiply"/>` + S.dust(540, 1200, 300, 500, 26, 9, t, '#fff0d0', 1.5, 0.4 * day), light: true });
    return L;
  };
})(window);


