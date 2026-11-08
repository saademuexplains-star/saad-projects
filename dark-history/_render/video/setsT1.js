// Sets for the test (any topic): the First Obstetric Clinic, Vienna General Hospital, a winter night in 1847.
// WARD: a mother sitting up in her bed by the light of one candle; the long ward behind her falls into the dark, snow
// at the tall window, the sleeping woman in the next bed, the crucifix and the fever chart. BASIN: the washstand by the
// ward door under a tin lantern; the bowl of chlorine water, the ewer, the crock of chlorinated lime, the order nailed
// to the wall. 2.5D layers, one light source per set, detail richest where the light falls.
(function (G) {
  const S = G.SETS, PR = G.PROPS, { f, mix, rng, ol, shade } = G.RIG, C = G.CINE;
  const lg = S.lg, TXT = S.TXT;
  const fl = (t, seed) => 0.88 + 0.07 * Math.sin(t * 9 + seed) + 0.05 * Math.sin(t * 23 + seed * 2);

  // ======================================================= shared pieces
  // old plaster: the texture filter, damp stains and hairline cracks (seeded, fixed in the world)
  const plasterWall = (x0, y0, x1, y1, col, seed) => {
    const r = rng(seed);
    let g = `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="${col}" filter="url(#plaster)"/>`;
    for (let i = 0; i < 9; i++) { const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), rx = 80 + r() * 220, ry = 60 + r() * 200; g += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" fill="${shade(col, -0.35)}" opacity="${f(0.12 + r() * 0.14)}" filter="url(#b14)"/>`; }
    for (let i = 0; i < 6; i++) { let x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), d = `M${f(x)},${f(y)}`; for (let k = 0; k < 5; k++) { x += (r() - 0.5) * 50; y += 16 + r() * 34; d += ` L${f(x)},${f(y)}`; } g += `<path d="${d}" stroke="${shade(col, -0.5)}" stroke-width="1.3" fill="none" opacity="0.45"/>`; }
    return g;
  };
  // wainscot: dark oak panelling with a moulded rail and fielded panels
  const wainscot = (x0, x1, y0, y1, w = 230) => {
    let g = `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="#2a1a0e" filter="url(#woodV)"/>`;
    g += `<rect x="${x0}" y="${y0 - 26}" width="${x1 - x0}" height="30" fill="#3a2414" ${ol(1.3)}/><rect x="${x0}" y="${y0 - 26}" width="${x1 - x0}" height="5" fill="#c8945a" opacity="0.3"/><rect x="${x0}" y="${y0 + 4}" width="${x1 - x0}" height="14" fill="#000" opacity="0.35" filter="url(#b4)"/>`;
    for (let x = x0 + 30; x < x1 - 60; x += w) g += `<rect x="${x}" y="${y0 + 40}" width="${w - 40}" height="${y1 - y0 - 80}" rx="4" fill="#2e1d10" stroke="#120a04" stroke-width="2"/><path d="M${x + 4},${y1 - 44} L${x + 4},${y0 + 44} L${x + w - 44},${y0 + 44}" stroke="#b07a48" stroke-width="2" fill="none" opacity="0.35"/>`;
    return g;
  };
  // a candle in a pewter chamberstick (x, y = the foot on the table); h = the candle's height
  const chamberstick = (x, y, t, h = 150) => {
    let g = `<ellipse cx="${x}" cy="${y + 2}" rx="76" ry="15" fill="#000" opacity="0.5" filter="url(#b4)"/>`;
    g += `<path d="M${x + 58},${y - 12} C${x + 92},${y - 18} ${x + 96},${y + 10} ${x + 66},${y + 8}" stroke="#4a463c" stroke-width="9" fill="none"/><path d="M${x + 58},${y - 12} C${x + 92},${y - 18} ${x + 96},${y + 10} ${x + 66},${y + 8}" stroke="#a8a496" stroke-width="4" fill="none"/>`;
    g += `<ellipse cx="${x}" cy="${y - 6}" rx="66" ry="15" fill="#6e6a5e" ${ol(1.3)}/><ellipse cx="${x}" cy="${y - 9}" rx="56" ry="11" fill="#9a968a"/><path d="M${x - 50},${y - 12} Q${x},${y - 20} ${x + 50},${y - 12}" stroke="#e8e4d4" stroke-width="2.5" fill="none" opacity="0.6"/>`;
    g += `<path d="M${x - 17},${y - 10} L${x - 15},${y - 44} L${x + 15},${y - 44} L${x + 17},${y - 10}Z" fill="#8a867a" ${ol(1.2)}/><ellipse cx="${x}" cy="${y - 44}" rx="22" ry="6" fill="#b8b4a6" ${ol(1)}/><path d="M${x + 6},${y - 40} L${x + 8},${y - 14}" stroke="#f4f0e0" stroke-width="2.5" opacity="0.7"/>`;
    const top = y - 46 - h;
    g += lg('t1cdl', [[0, '#c8b898'], [0.55, '#f2e8d0'], [1, '#fffaf0']], 0, 0, 1, 0) + `<rect x="${x - 13}" y="${top}" width="26" height="${h}" fill="url(#t1cdl)" ${ol(1.1)}/>`;
    g += `<path d="M${x + 13},${top + 4} q5,20 0,46 q-4,-10 -3,-46Z M${x - 13},${top + 2} q-3,12 0,24 q3,-6 2,-24Z" fill="#f6eedc" ${ol(0.8)}/><ellipse cx="${x}" cy="${top + 1}" rx="13" ry="4" fill="#e8dcc0"/><path d="M${x},${top} L${x},${top - 8}" stroke="#1a1008" stroke-width="2.4"/>`;
    g += PR.flame(x, top - 6, 0.9, t);
    return g;
  };
  // a tin lantern on a wrought-iron wall bracket (hx, hy = the hook; the lantern hangs below it)
  const lantern = (hx, hy, t, wallX) => {
    const k = fl(t, 5);
    let g = `<path d="M${wallX},${hy - 40} L${hx},${hy - 40} M${wallX},${hy + 50} Q${(wallX + hx) / 2},${hy - 4} ${hx},${hy - 40}" stroke="#14100c" stroke-width="9" fill="none" stroke-linecap="round"/><rect x="${wallX - 6}" y="${hy - 64}" width="14" height="138" rx="4" fill="#1a1410" ${ol(1)}/><circle cx="${hx + 10}" cy="${hy - 44}" r="10" fill="none" stroke="#14100c" stroke-width="6"/>`;
    g += `<path d="M${hx},${hy - 40} L${hx},${hy}" stroke="#14100c" stroke-width="5"/><circle cx="${hx}" cy="${hy + 6}" r="11" fill="none" stroke="#2a2420" stroke-width="5"/>`;
    const x = hx, y = hy + 18;
    g += `<path d="M${x - 46},${y + 60} L${x},${y + 14} L${x + 46},${y + 60}Z" fill="#3a342c" ${ol(1.3)}/><path d="M${x - 30},${y + 44} L${x - 4},${y + 22}" stroke="#a89c84" stroke-width="2" opacity="0.6"/>`;
    for (let i = 0; i < 6; i++) g += `<circle cx="${f(x - 26 + i * 10.4)}" cy="${y + 48 - Math.abs(i - 2.5) * 5}" r="2.4" fill="#ffd890" opacity="${f(0.7 * k)}"/>`;
    g += `<rect x="${x - 46}" y="${y + 60}" width="92" height="12" fill="#2a2620" ${ol(1.2)}/>`;
    g += `<rect x="${x - 42}" y="${y + 72}" width="84" height="150" fill="#ffd28a" opacity="${f(0.9 * k)}"/>`;
    g += lg('t1lnG', [[0, '#fff2c8'], [0.5, '#ffc870'], [1, '#c8782a']]) + `<rect x="${x - 38}" y="${y + 76}" width="76" height="142" fill="url(#t1lnG)" opacity="${f(0.85 * k)}"/>`;
    g += `<rect x="${x - 9}" y="${y + 150}" width="18" height="62" fill="#efe4c8" ${ol(1)}/>` + PR.flame(x, y + 146, 0.7, t);
    for (const xx of [x - 44, x - 2, x + 40]) g += `<rect x="${xx}" y="${y + 70}" width="5" height="154" fill="#2a2620"/>`;
    g += `<path d="M${x - 42},${y + 120} L${x + 42},${y + 120}" stroke="#2a2620" stroke-width="3" opacity="0.8"/><rect x="${x - 50}" y="${y + 222}" width="100" height="16" fill="#2a2620" ${ol(1.2)}/><path d="M${x - 34},${y + 238} L${x - 30},${y + 252} L${x + 30},${y + 252} L${x + 34},${y + 238}" fill="#1e1a16" ${ol(1)}/>`;
    g += `<path d="M${x - 36},${y + 80} L${x - 36},${y + 210}" stroke="#fff" stroke-width="4" opacity="0.3"/>`;
    g += C.bloom(x, y + 140, 130 * k, '#ffc060', 0.5) + C.radial(x, y + 140, 330, '#ffa040', 0.3 * k);
    return g;
  };

  // ======================================================= WARD: the mother's bed by candlelight
  // world: her headboard x 300..940 (top rail y 1010), the pillows behind her back, the quilt from y ~1305 to the
  // bottom of the frame; the bedside table at the right (top y 1240..1268) with the candle; the tall window at the left
  S.T1W = { CANDLE: [928, 1262], QTOP: 1308, TABLE: [835, 1150, 1240, 1268] };
  const nightWindow = (x0, y0, x1, y1, t) => {
    const w = x1 - x0, ar = w / 2, cx = (x0 + x1) / 2, r = rng(17);
    const shape = `M${x0},${y1} L${x0},${y0 + ar} A${ar},${ar} 0 0 1 ${x1},${y0 + ar} L${x1},${y1}Z`;
    let g = `<path d="M${x0 - 34},${y1 + 30} L${x0 - 34},${y0 + ar} A${ar + 34},${ar + 34} 0 0 1 ${x1 + 34},${y0 + ar} L${x1 + 34},${y1 + 30}Z" fill="#20160e" ${ol(1.5)}/>`;
    g += `<defs><clipPath id="t1win"><path d="${shape}"/></clipPath></defs><g clip-path="url(#t1win)">`;
    g += lg('t1sky', [[0, '#121418'], [0.55, '#1c1e22'], [1, '#2a2826']]) + `<rect x="${x0}" y="${y0}" width="${w}" height="${y1 - y0}" fill="url(#t1sky)"/>`;
    // the hospital's far wing across the court: a dark roofline with three lit windows, snow on the ledges
    g += `<path d="M${x0},${y0 + (y1 - y0) * 0.62} L${x0 + w * 0.3},${y0 + (y1 - y0) * 0.55} L${x1},${y0 + (y1 - y0) * 0.58} L${x1},${y1} L${x0},${y1}Z" fill="#0e0f11"/>`;
    for (const [a, b] of [[0.18, 0.7], [0.5, 0.68], [0.78, 0.7]]) g += `<rect x="${f(x0 + w * a)}" y="${f(y0 + (y1 - y0) * b)}" width="${f(w * 0.08)}" height="${f((y1 - y0) * 0.06)}" fill="#c88a40" opacity="0.55"/><rect x="${f(x0 + w * a - 4)}" y="${f(y0 + (y1 - y0) * b - 3)}" width="${f(w * 0.08 + 8)}" height="4" fill="#d8dcdc" opacity="0.5"/>`;
    for (let i = 0; i < 60; i++) { const sx = x0 + r() * w, sy = y0 + ((r() * (y1 - y0) + t * (60 + r() * 50)) % (y1 - y0)), rr = 1.2 + r() * 2.2; g += `<circle cx="${f(sx + Math.sin(t * 1.3 + i) * 6)}" cy="${f(sy)}" r="${f(rr)}" fill="#e8ecec" opacity="${f(0.35 + r() * 0.4)}"/>`; }
    g += `<ellipse cx="${x0 + 30}" cy="${y1 - 20}" rx="90" ry="70" fill="#dfe4e6" opacity="0.16" filter="url(#b14)"/><ellipse cx="${x1 - 20}" cy="${y1 - 30}" rx="70" ry="60" fill="#dfe4e6" opacity="0.12" filter="url(#b14)"/>`;
    g += `</g>`;
    // the leading: a centre mullion, glazing bars, the arch's tracery
    g += `<path d="M${cx},${y0} L${cx},${y1}" stroke="#20160e" stroke-width="16"/>`;
    for (let y = y0 + ar + 60; y < y1 - 20; y += 150) g += `<path d="M${x0},${y} L${x1},${y}" stroke="#20160e" stroke-width="9"/>`;
    g += `<path d="M${x0 + 8},${y0 + ar} A${ar - 8},${ar - 8} 0 0 1 ${x1 - 8},${y0 + ar}" stroke="#20160e" stroke-width="7" fill="none"/>`;
    g += `<path d="M${x0 + 16},${y0 + ar + 20} L${x0 + 16},${y1 - 20}" stroke="#c8d0d4" stroke-width="3" opacity="0.18"/>`;
    // the stone sill, a little snow-light on it
    g += `<rect x="${x0 - 50}" y="${y1 + 20}" width="${w + 100}" height="34" fill="#4a3e32" ${ol(1.3)}/><rect x="${x0 - 50}" y="${y1 + 20}" width="${w + 100}" height="5" fill="#c8ccc8" opacity="0.25"/>`;
    return g;
  };
  const crucifix = (x, y, s) => `<g transform="translate(${x},${y}) scale(${s})">` +
    `<path d="M-60,10 C-80,-10 -70,-40 -50,-50 M-56,0 C-90,10 -96,40 -80,60" stroke="#4a4a26" stroke-width="5" fill="none" opacity="0.7"/>` +
    `<rect x="-11" y="-100" width="22" height="210" fill="#2a1a0c" ${ol(1.3)}/><rect x="-62" y="-60" width="124" height="20" fill="#2a1a0c" ${ol(1.3)}/><rect x="-9" y="-98" width="5" height="200" fill="#8a5a30" opacity="0.5"/>` +
    `<path d="M0,-78 C-6,-60 -8,-40 -6,-12 L-4,50 L4,50 L6,-12 C8,-40 6,-60 0,-78Z" fill="#d8ccb0" ${ol(1)}/><path d="M-6,-52 L-52,-54 M6,-52 L52,-54" stroke="#d8ccb0" stroke-width="6" stroke-linecap="round"/><circle cx="0" cy="-84" r="8" fill="#d8ccb0" ${ol(1)}/>` + `</g>`;
  // the sleeping woman in the next bed: a pillow, dark hair, a body under a grey blanket (no face: she has turned away)
  const sleeper = (x, y) => {
    let g = `<rect x="${x - 40}" y="${y - 300}" width="460" height="300" fill="#2e1c10" ${ol(1.3)}/><rect x="${x - 50}" y="${y - 330}" width="40" height="420" fill="#24160c" ${ol(1.2)}/><circle cx="${x - 30}" cy="${y - 336}" r="22" fill="#2e1c10" ${ol(1)}/>`;
    g += `<path d="M${x - 10},${y - 170} C${x - 14},${y - 250} ${x + 200},${y - 260} ${x + 230},${y - 170} C${x + 230},${y - 120} ${x},${y - 110} ${x - 10},${y - 170}Z" fill="#cfcabd" ${ol(1.2)}/>`;
    g += `<path d="M${x + 40},${y - 200} C${x + 60},${y - 250} ${x + 150},${y - 250} ${x + 160},${y - 190} C${x + 150},${y - 160} ${x + 60},${y - 160} ${x + 40},${y - 200}Z" fill="#2a1810"/>`;
    g += `<path d="M${x - 30},${y - 120} C${x + 60},${y - 200} ${x + 300},${y - 210} ${x + 430},${y - 140} L${x + 440},${y + 300} L${x - 40},${y + 300}Z" fill="#5a5048" ${ol(1.3)}/><path d="M${x - 30},${y - 120} C${x + 60},${y - 200} ${x + 300},${y - 210} ${x + 430},${y - 140}" stroke="#d8d2c6" stroke-width="22" fill="none"/><path d="M${x + 30},${y - 60} C${x + 120},${y - 90} ${x + 260},${y - 90} ${x + 400},${y - 50}" stroke="#3a322c" stroke-width="10" fill="none" opacity="0.6"/>`;
    return g;
  };
  S.t1Ward = (t) => {
    const L = [], [cx, cy] = S.T1W.CANDLE, k = fl(t, 3), r = rng(301);
    let w = plasterWall(-900, -500, 2000, 2100, '#45362a', 311);
    w += wainscot(-900, 2000, 1190, 2100);
    w += nightWindow(50, 210, 330, 1040, t);
    // a cool spill of snow-light under the window, very faint (the only other light)
    w += `<path d="M40,1080 L340,1080 L460,1700 L-80,1700Z" fill="#b8c0c4" opacity="0.06" filter="url(#b14)"/>`;
    w += crucifix(655, 520, 0.95);
    // the bed's number board
    w += `<rect x="770" y="690" width="96" height="62" rx="4" fill="#1e140c" ${ol(1.2)}/><rect x="776" y="696" width="84" height="50" rx="3" fill="#2a2016"/>` + TXT(818, 734, 30, '#d8ccb0', '17', { w: 'bold' });
    // a coat hook with a grey shawl by the window, a shelf with a basin and folded linen
    w += `<path d="M420,900 L420,930" stroke="#14100c" stroke-width="8"/><path d="M380,930 C380,1000 400,1110 390,1180 L470,1180 C462,1110 470,1000 460,930Z" fill="#5a5450" ${ol(1.2)}/><path d="M400,950 C404,1040 410,1110 404,1170" stroke="#3e3834" stroke-width="6" fill="none" opacity="0.7"/>`;
    // the candle's light on the wall and the dark the ward falls into away from it
    w += C.radial(cx - 40, cy - 330, 900, '#ffb460', 0.3 * k);
    w += lg('t1wFall', [[0, '#000', 0.62], [0.45, '#000', 0.3], [0.8, '#000', 0], [1, '#000', 0]], 0, 0, 1, 0) + `<rect x="-900" y="-500" width="2900" height="2600" fill="url(#t1wFall)"/>`;
    w += lg('t1wTop', [[0, '#000', 0.55], [0.3, '#000', 0], [1, '#000', 0]]) + `<rect x="-900" y="-500" width="2900" height="2600" fill="url(#t1wTop)"/>`;
    L.push({ p: 0.78, svg: `<g filter="url(#dof1)">${w}</g>` });
    // the next bed, a little nearer: the woman asleep with her back to us, in the dark
    L.push({ p: 0.9, svg: `<g filter="url(#dof1)" opacity="0.92">${sleeper(-150, 1500)}<rect x="-300" y="1000" width="760" height="900" fill="#0a0604" opacity="0.45"/></g>` });
    return L;
  };
  // her bed behind her: the headboard, the fever chart on its post, the pillows propping her up; the bedside table
  S.t1WardBed = (t) => {
    const [x0, x1, ty0, ty1] = S.T1W.TABLE;
    let g = `<rect x="300" y="1010" width="640" height="500" fill="#3a2414" filter="url(#woodV)" ${ol(1.5)}/><rect x="300" y="1010" width="640" height="26" fill="#4a2e18" ${ol(1.2)}/><rect x="300" y="1010" width="640" height="5" fill="#d8a068" opacity="0.35"/>`;
    for (const x of [300, 940]) g += `<rect x="${x - 22}" y="985" width="44" height="560" fill="#2e1c10" ${ol(1.4)}/><circle cx="${x}" cy="975" r="26" fill="#3a2414" ${ol(1.3)}/><circle cx="${x + 7}" cy="967" r="8" fill="#e8b070" opacity="${x > 600 ? 0.6 : 0.2}"/>`;
    // the fever chart on the right post: paper on a board, the temperature climbing for three days
    g += `<rect x="900" y="1040" width="88" height="120" fill="#2a1a0c" ${ol(1.2)}/><rect x="906" y="1046" width="76" height="108" fill="#e6dcc4"/>`;
    for (let i = 0; i < 5; i++) g += `<path d="M910,${1062 + i * 20} L978,${1062 + i * 20}" stroke="#9a8a70" stroke-width="0.8"/>`;
    g += `<path d="M912,1140 L926,1130 L938,1118 L950,1096 L962,1084 L974,1060" stroke="#8a1a12" stroke-width="2.6" fill="none"/><path d="M944,1030 L944,1046" stroke="#14100c" stroke-width="3"/>`;
    // the pillows: plump linen, the near one creased where she lies against it
    g += lg('t1pil', [[0, '#d8d0c0'], [0.6, '#b8b0a0'], [1, '#857c6e']]);
    g += `<path d="M330,1170 C320,1060 420,1040 620,1050 C820,1040 920,1060 910,1170 C918,1250 820,1270 620,1262 C420,1270 322,1250 330,1170Z" fill="url(#t1pil)" ${ol(1.4)}/>`;
    g += `<path d="M310,1290 C296,1170 400,1150 620,1160 C840,1150 942,1170 930,1290 C940,1360 840,1380 620,1372 C400,1380 300,1360 310,1290Z" fill="url(#t1pil)" ${ol(1.4)}/>`;
    g += `<path d="M380,1200 C470,1176 560,1190 620,1214 M700,1196 C760,1176 840,1180 880,1206" stroke="#7a7262" stroke-width="5" fill="none" opacity="0.55"/><path d="M800,1090 C840,1086 880,1100 892,1130" stroke="#ffe8c8" stroke-width="6" fill="none" opacity="0.35"/><path d="M820,1186 C870,1184 912,1200 922,1240" stroke="#ffe8c8" stroke-width="6" fill="none" opacity="0.35"/>`;
    g += lg('t1pilD', [[0, '#000', 0.55], [0.5, '#000', 0.25], [1, '#000', 0]], 0, 0, 1, 0) + `<path d="M310,1290 C296,1170 400,1150 620,1160 C840,1150 942,1170 930,1290 C940,1360 840,1380 620,1372 C400,1380 300,1360 310,1290Z M330,1170 C320,1060 420,1040 620,1050 C820,1040 920,1060 910,1170 C918,1250 820,1270 620,1262 C420,1270 322,1250 330,1170Z" fill="url(#t1pilD)"/>`;
    // the bedside table: oak, a cloth over it; on it the candle, a tin cup, the brown bottle of laudanum, a folded towel
    g += `<path d="M${x0},${ty0} L${x1},${ty0} L${x1 + 20},${ty1} L${x0 - 20},${ty1}Z" fill="#4a2e18" ${ol(1.3)}/><rect x="${x0 - 20}" y="${ty1}" width="${x1 - x0 + 40}" height="22" fill="#3a2212" ${ol(1.2)}/><rect x="${x0 - 20}" y="${ty1}" width="${x1 - x0 + 40}" height="4" fill="#e8b878" opacity="0.4"/>`;
    g += `<rect x="${x0}" y="${ty1 + 22}" width="${x1 - x0}" height="700" fill="#24160c" filter="url(#woodV)"/><rect x="${x0 + 30}" y="${ty1 + 50}" width="${x1 - x0 - 60}" height="130" rx="4" fill="#2e1d10" ${ol(1.2)}/><circle cx="${(x0 + x1) / 2}" cy="${ty1 + 115}" r="9" fill="#b8863a" ${ol(1)}/>`;
    g += lg('t1tbF', [[0, '#000', 0.1], [1, '#000', 0.75]]) + `<rect x="${x0}" y="${ty1 + 22}" width="${x1 - x0}" height="700" fill="url(#t1tbF)"/>`;
    g += `<path d="M1040,${ty0 + 14} l70,0 l6,14 l-82,0Z" fill="#e2dccf" ${ol(1.1)}/><path d="M1036,${ty0 + 6} l78,0 l4,10 l-86,0Z" fill="#ece6da" ${ol(1)}/>`;
    g += S.bottle(866, ty0 + 18, 92, 'round', '#4a2208', rng(7), 0.95);
    g += `<path d="M1000,${ty0 + 20} L996,${ty0 - 44} L1050,${ty0 - 44} L1046,${ty0 + 20}Z" fill="#8a8a84" ${ol(1.2)}/><ellipse cx="1023" cy="${ty0 - 44}" rx="27" ry="7" fill="#5a5a54" ${ol(1)}/><path d="M1048,${ty0 - 30} q20,4 18,22 q-2,12 -20,10" stroke="#6a6a64" stroke-width="5" fill="none"/><path d="M1004,${ty0 - 36} L1006,${ty0 + 12}" stroke="#e8e4d8" stroke-width="3" opacity="0.6"/>`;
    g += chamberstick(S.T1W.CANDLE[0], S.T1W.CANDLE[1] - 4, t, 160);
    return g;
  };
  // the quilt over her lap (drawn over her body): grey wool with two dark woven stripes, the sheet turned down over it
  S.t1Quilt = (t) => {
    const q = S.T1W.QTOP;
    const top = `M190,${q + 46} C290,${q + 10} 380,${q - 6} 500,${q - 8} C620,${q - 10} 760,${q} 1010,${q + 40}`;
    const body = `${top} L1080,2000 L120,2000Z`;
    let g = `<defs><clipPath id="t1q"><path d="${body}"/></clipPath></defs><path d="${body}" fill="#6c6156" filter="url(#cloth)" ${ol(1.6)}/>`;
    let pt = '';
    for (const [dy, w2] of [[120, 26], [168, 12]]) pt += `<path d="M120,${q + dy} C400,${q + dy - 40} 700,${q + dy - 30} 1080,${q + dy + 30}" stroke="#3e352e" stroke-width="${w2}" fill="none" opacity="0.8"/>`;
    // her legs under the blanket, running toward us from her hips: a ridge over each, lit on the candle side, the
    // hollow between them and the wool falling away at the sides in long folds
    for (const [x0, x1] of [[440, 330], [585, 735]]) pt += `<path d="M${x0 - 34},${q + 40} C${x0 - 50},${q + 260} ${x1 - 60},${q + 460} ${x1 - 70},${q + 700}" stroke="#1a120c" stroke-width="54" fill="none" opacity="0.36" filter="url(#b8)"/><path d="M${x0 + 18},${q + 40} C${x0 + 14},${q + 260} ${x1 + 30},${q + 460} ${x1 + 40},${q + 700}" stroke="#e0ccb0" stroke-width="26" fill="none" opacity="0.2" filter="url(#b8)"/>`;
    pt += `<path d="M512,${q + 60} C500,${q + 300} 520,${q + 480} 530,${q + 700}" stroke="#120a06" stroke-width="30" fill="none" opacity="0.3" filter="url(#b8)"/><path d="M250,${q + 60} C200,${q + 300} 180,${q + 500} 150,${q + 700} M860,${q + 60} C900,${q + 300} 940,${q + 500} 990,${q + 700}" stroke="#1a120c" stroke-width="36" fill="none" opacity="0.3" filter="url(#b8)"/>`;
    pt += lg('t1qL', [[0, '#000', 0.45], [0.55, '#000', 0.05], [1, '#ffb060', 0.12]], 0, 0, 1, 0) + `<rect x="100" y="${q - 40}" width="1000" height="800" fill="url(#t1qL)"/>`;
    pt += lg('t1qD', [[0, '#000', 0], [1, '#000', 0.6]]) + `<rect x="100" y="${q}" width="1000" height="700" fill="url(#t1qD)"/>`;
    g += `<g clip-path="url(#t1q)">${pt}</g>`;
    // the sheet turned down over the blanket's edge, with its hem and a shadow under it
    g += `<path d="${top}" stroke="#000" stroke-width="40" fill="none" opacity="0.28" filter="url(#b4)" transform="translate(0,22)"/>`;
    g += lg('t1sh', [[0, '#7e776a'], [0.5, '#b4ac9c'], [1, '#d4ccbc']], 0, 0, 1, 0, 'userSpaceOnUse').replace('x1="0" y1="0" x2="1" y2="0"', 'x1="190" y1="0" x2="1010" y2="0"');
    g += `<path d="${top}" stroke="url(#t1sh)" stroke-width="44" fill="none"/><path d="${top}" stroke="#8a8272" stroke-width="3" fill="none" transform="translate(0,18)"/><path d="${top}" stroke="#fff0d8" stroke-width="5" fill="none" opacity="0.3" transform="translate(0,-12)"/>`;
    return g;
  };
  S.t1WardLight = (t) => {
    const [cx, cy] = S.T1W.CANDLE, k = fl(t, 3), r = rng(91);
    let g = C.radial(cx - 60, cy - 260, 820, '#ffb060', 0.16 * k);
    for (let i = 0; i < 40; i++) { const x = cx - 640 + r() * 760, y = cy - 860 + r() * 820 - t * 14; g += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(1 + r() * 1.8)}" fill="#ffe0b0" opacity="${f(0.15 + r() * 0.35)}"/>`; }
    return g;
  };
  // the bed curtain at the right edge, close to the lens and soft
  S.t1WardFg = (t) => `<g filter="url(#dof2)"><path d="M1010,-200 C1030,400 1000,1100 1040,2100 L1300,2100 L1300,-200Z" fill="#3a2a1e"/><path d="M1060,-200 C1080,500 1050,1200 1090,2100" stroke="#1a100a" stroke-width="30" fill="none" opacity="0.6"/><path d="M1030,-200 C1050,500 1020,1200 1060,2100" stroke="#a8784a" stroke-width="10" fill="none" opacity="0.35"/></g>`;

  // ======================================================= BASIN: the washstand by the ward door, under the lantern
  // world: the stand's marble top from y 1480 (back) to 1556 (front); the bowl's rim centred at (540, 1400); the
  // lantern's hook at (905, 520) on a bracket from the wall; the open door at the left
  S.T1B = { TOP: 1480, NEAR: 1556, BOWL: [540, 1400, 232, 52], LANTERN: [905, 520] };
  S.t1Door = (t, opts = {}) => {
    const L = [], [lx, ly] = S.T1B.LANTERN, k = fl(t, 5), r = rng(401);
    let w = plasterWall(-900, -500, 2000, 2400, '#43352a', 411);
    w += wainscot(-900, 2000, 1240, 2400, 250);
    // the open door: a deep oak frame, the dark corridor beyond with a lamp far down it, the door leaf swung toward us
    w += `<rect x="20" y="170" width="330" height="1360" fill="#2a1a0e" filter="url(#woodV)" ${ol(1.6)}/><rect x="56" y="214" width="258" height="1316" fill="#070504"/>`;
    w += lg('t1cor', [[0, '#0c0806'], [0.5, '#1a120c'], [1, '#0a0705']]) + `<path d="M56,214 L314,214 L240,520 L130,520Z" fill="#0c0907"/><rect x="130" y="520" width="110" height="420" fill="url(#t1cor)"/><path d="M56,1530 L314,1530 L240,940 L130,940Z" fill="#120c08"/>`;
    w += `<rect x="172" y="640" width="26" height="34" fill="#ffb860" opacity="0.7"/>` + C.radial(185, 660, 120, '#ff9a40', 0.3) + `<path d="M150,940 L220,940 L300,1530 L70,1530Z" fill="#ffb060" opacity="0.06"/>`;
    w += `<path d="M20,170 L-80,120 L-80,1600 L20,1530Z" fill="#24160c" ${ol(1.5)}/><path d="M-40,300 L0,310 L0,780 L-40,790Z M-40,900 L0,904 L0,1400 L-40,1420Z" fill="#2e1c10" stroke="#120a04" stroke-width="2"/>`;
    w += `<rect x="30" y="180" width="310" height="22" fill="#3a2414" ${ol(1)}/><path d="M352,170 L352,1530" stroke="#c8945a" stroke-width="3" opacity="0.25"/>`;
    // the order nailed to the wall under the lantern: VERORDNUNG, a red seal, close handwriting, a signature
    w += `<g transform="translate(690,860) rotate(1.5)"><rect x="0" y="0" width="190" height="250" fill="#e6dcc2" ${ol(1.2)}/><rect x="0" y="0" width="190" height="250" fill="#5a4020" opacity="0.08" filter="url(#tex)"/>` + TXT(95, 34, 19, '#2a1a0e', 'VERORDNUNG', { w: 'bold', len: 150 }) + `<path d="M30,46 L160,46" stroke="#2a1a0e" stroke-width="1.2"/>`;
    for (let i = 0; i < 9; i++) { const yy = 66 + i * 17, ww = 140 - (i === 8 ? 70 : r() * 20); w += `<path d="M24,${yy} q${f(ww * 0.25)},-4 ${f(ww * 0.5)},0 t${f(ww * 0.5)},0" stroke="#3a2a1a" stroke-width="1.5" fill="none" opacity="0.8"/>`; }
    w += `<path d="M96,226 q12,-14 22,-2 q8,10 18,-6 q6,-8 14,2" stroke="#2a1a0e" stroke-width="1.6" fill="none"/><circle cx="46" cy="222" r="16" fill="#8a1a12" ${ol(1)}/><circle cx="43" cy="219" r="5" fill="#c84a3a" opacity="0.6"/><circle cx="95" cy="8" r="4" fill="#3a2a1a"/></g>`;
    // the lantern's light on the wall; the dark away from it
    w += C.radial(lx - 30, ly + 170, 1000, '#ffb460', 0.3 * k);
    w += lg('t1bFall', [[0, '#000', 0.55], [0.35, '#000', 0.32], [0.75, '#000', 0.04], [1, '#000', 0]], 0, 0, 1, 0) + `<rect x="-900" y="-500" width="2900" height="2900" fill="url(#t1bFall)"/>`;
    w += lg('t1bTop', [[0, '#000', 0.6], [0.28, '#000', 0], [1, '#000', 0]]) + `<rect x="-900" y="-500" width="2900" height="2900" fill="url(#t1bTop)"/>`;
    L.push({ p: 0.8, svg: `<g filter="url(#dof1)">${w}</g>` });
    // the lantern itself, sharp and nearer
    if (!opts.noLantern) L.push({ p: 0.88, svg: lantern(lx, ly, t, 1090) });
    return L;
  };
  // the washstand's marble top and cabinet (drawn before the bowl and the hands)
  S.t1Stand = (t) => {
    const { TOP, NEAR } = S.T1B, r = rng(421);
    let g = `<defs><filter id="t1Marble" x="0" y="0" width="1" height="1"><feTurbulence type="fractalNoise" baseFrequency="0.006 0.03" numOctaves="4" seed="11"/><feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.48  0 0 0 0 0.45  0 0 0 -2.6 1.5"/></filter></defs>`;
    const top = `M-140,${TOP} L1220,${TOP} L1260,${NEAR} L-180,${NEAR}Z`;
    g += `<path d="${top}" fill="#d8d2c6"/><path d="${top}" fill="#000" filter="url(#t1Marble)" opacity="0.45"/>`;
    for (let i = 0; i < 6; i++) { const x0 = -100 + r() * 1200, y0 = TOP + 8 + r() * 60; g += `<path d="M${f(x0)},${f(y0)} q${f(40 + r() * 80)},${f(6 + r() * 10)} ${f(140 + r() * 160)},${f(-4 + r() * 16)}" stroke="#8a8478" stroke-width="${f(1 + r() * 1.4)}" fill="none" opacity="0.4"/>`; }
    g += lg('t1stL', [[0, '#000', 0.45], [0.55, '#000', 0.05], [1, '#fff4e0', 0.2]], 0, 0, 1, 0) + `<path d="${top}" fill="url(#t1stL)"/>`;
    g += `<rect x="-180" y="${NEAR}" width="1440" height="26" fill="#cfc8ba" ${ol(1.3)}/><rect x="-180" y="${NEAR}" width="1440" height="5" fill="#fff" opacity="0.45"/>`;
    g += `<rect x="-180" y="${NEAR + 26}" width="1440" height="900" fill="#2e1c0e" filter="url(#woodV)"/>`;
    for (const dx of [-60, 410, 880]) g += `<rect x="${dx}" y="${NEAR + 60}" width="400" height="190" rx="5" fill="#3a2414" ${ol(1.3)}/><rect x="${dx + 16}" y="${NEAR + 76}" width="368" height="158" rx="4" fill="none" stroke="#7a4a26" stroke-width="3" opacity="0.5"/><rect x="${dx + 170}" y="${NEAR + 140}" width="60" height="16" rx="7" fill="#b8863a" ${ol(1)}/>`;
    g += lg('t1stF', [[0, '#000', 0.15], [1, '#000', 0.8]]) + `<rect x="-180" y="${NEAR + 26}" width="1440" height="900" fill="url(#t1stF)"/>`;
    return g;
  };
  // the bowl: its inside and back rim (behind the hands) ...
  S.t1BowlBack = () => {
    const [cx, cy, rx, ry] = S.T1B.BOWL;
    let g = `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#e2dccf" ${ol(1.6)}/>`;
    g += lg('t1bin', [[0, '#5e584e'], [0.6, '#a8a294'], [1, '#c8c2b4']]) + `<ellipse cx="${cx}" cy="${cy + 3}" rx="${rx - 14}" ry="${ry - 9}" fill="url(#t1bin)"/>`;
    return g;
  };
  // ... the chlorine water, in two halves split at the line where the forearms go in (S.T1B.WET): the far half is
  // drawn before the arms, the near half after them, nearly opaque and milky, so each forearm ends cleanly at the
  // waterline with rings round it and the hands are only a shadow under the surface
  S.T1B.WET = 1404;
  S.t1Water = (t, wrists = [], part = 'back') => {
    // (filled to the brim: the surface is the bowl's inner rim, so no gap between the water's edge and the rim shows
    // the forearms behind it)
    const [cx, cy, rx, ry] = S.T1B.BOWL, wy = cy + 3, wrx = rx - 14, wry = ry - 9, ye = S.T1B.WET, id = 't1wat' + part;
    const ring = (x, rr, op, w2, half) => half ? `<path d="M${f(x - rr)},${ye} A${f(rr)},${f(rr * 0.22)} 0 0 0 ${f(x + rr)},${ye}" fill="none" stroke="#f8f4e8" stroke-width="${f(w2)}" opacity="${f(op)}"/>` : `<ellipse cx="${f(x)}" cy="${ye}" rx="${f(rr)}" ry="${f(rr * 0.22)}" fill="none" stroke="#f8f4e8" stroke-width="${f(w2)}" opacity="${f(op)}"/>`;
    let g = `<defs><clipPath id="${id}"><ellipse cx="${cx}" cy="${wy}" rx="${wrx}" ry="${wry}"/></clipPath><clipPath id="${id}h"><rect x="${cx - rx}" y="${part === 'back' ? cy - ry - 10 : ye}" width="${rx * 2}" height="${part === 'back' ? ye - (cy - ry - 10) : 200}"/></clipPath></defs>`;
    g += `<g clip-path="url(#${id}h)"><g clip-path="url(#${id})">`;
    if (part === 'back') {
      g += `<rect x="${cx - rx}" y="${cy - ry}" width="${rx * 2}" height="${ry * 2}" fill="#9a9c90" opacity="0.92"/>`;
      for (const [x, ph] of wrists) for (let i = 0; i < 3; i++) { const rr = 30 + i * 20 + ((t * 30 + ph) % 20); g += ring(x, rr, 0.5 - i * 0.14, 2 - i * 0.5, false); }
    } else {
      // milky and opaque: the hands under it are only a soft shadow (seen through, their edges read as odd wedges)
      g += lg('t1wG', [[0, '#a8aa9e'], [0.6, '#bfc0b4'], [1, '#d2d2c6']]) + `<rect x="${cx - rx}" y="${ye}" width="${rx * 2}" height="${ry * 2}" fill="url(#t1wG)"/>`;
      g += `<ellipse cx="${cx + 120}" cy="${ye + 10}" rx="74" ry="10" fill="#ffd890" opacity="0.5" filter="url(#b4)"/><path d="M${cx + 66},${ye + 9} q30,-4 60,0 t50,0" stroke="#fff4d8" stroke-width="2.5" fill="none" opacity="0.7"/>`;
      for (const [x, ph] of wrists) { g += `<ellipse cx="${f(x)}" cy="${ye + 16}" rx="44" ry="15" fill="#5a5040" opacity="0.26" filter="url(#b8)"/>`; for (let i = 0; i < 3; i++) { const rr = 30 + i * 20 + ((t * 30 + ph) % 20); g += ring(x, rr, 0.7 - i * 0.18, 2.4 - i * 0.6, true); } }
    }
    g += `</g></g>`;
    return g;
  };
  // ... and its outer wall in front (over the hands): white glaze, a gilt band, the lantern's light on the right
  S.t1BowlFront = () => {
    const [cx, cy, rx, ry] = S.T1B.BOWL;
    // the near half of the rim's lip (between the outer and the inner rim) is in front of the forearms too
    let g = `<path d="M${cx - rx},${cy} A${rx},${ry} 0 0 0 ${cx + rx},${cy} L${cx + rx - 14},${cy + 3} A${rx - 14},${ry - 9} 0 0 1 ${cx - rx + 14},${cy + 3}Z" fill="#e2dccf"/>`;
    g += lg('t1bF', [[0, '#5e584e'], [0.32, '#a8a294'], [0.74, '#e2dccf'], [1, '#aaa292']], 0, 0, 1, 0);
    g += `<path d="M${cx - rx},${cy} A${rx},${ry} 0 0 0 ${cx + rx},${cy} C${cx + rx - 6},${cy + 70} ${cx + 150},${cy + 104} ${cx + 110},${cy + 112} L${cx - 110},${cy + 112} C${cx - 150},${cy + 104} ${cx - rx + 6},${cy + 70} ${cx - rx},${cy}Z" fill="url(#t1bF)" ${ol(1.6)}/>`;
    g += `<path d="M${cx - rx + 14},${cy + 26} Q${cx},${cy + 92} ${cx + rx - 14},${cy + 26}" stroke="#b8902e" stroke-width="5" fill="none" opacity="0.85"/><path d="M${cx - rx + 22},${cy + 36} Q${cx},${cy + 100} ${cx + rx - 22},${cy + 36}" stroke="#b8902e" stroke-width="1.6" fill="none" opacity="0.7"/>`;
    g += `<path d="M${cx + 120},${cy + 40} C${cx + 160},${cy + 60} ${cx + 176},${cy + 80} ${cx + 150},${cy + 100}" stroke="#fff" stroke-width="10" fill="none" opacity="0.6" stroke-linecap="round"/><path d="M${cx - rx},${cy} A${rx},${ry} 0 0 0 ${cx + rx},${cy}" stroke="#fff" stroke-width="3.5" fill="none" opacity="0.65"/>`;
    g += `<path d="M${cx - 100},${cy + 112} L${cx + 100},${cy + 112} L${cx + 112},${cy + 126} L${cx - 112},${cy + 126}Z" fill="#d8d2c6" ${ol(1.3)}/><ellipse cx="${cx}" cy="${cy + 128}" rx="130" ry="10" fill="#000" opacity="0.45" filter="url(#b4)"/>`;
    return g;
  };
  // the ewer (left), the crock of chlorinated lime (right) and the towel over the stand's end
  S.t1StandProps = (t) => {
    const { TOP } = S.T1B;
    let g = '';
    // ewer: a tall white jug with a lip and a loop handle, the same gilt band
    const ex = 200, ey = TOP + 40;
    g += `<ellipse cx="${ex}" cy="${ey + 4}" rx="86" ry="14" fill="#000" opacity="0.45" filter="url(#b4)"/>`;
    g += lg('t1ew', [[0, '#4e4840'], [0.35, '#9c9688'], [0.75, '#d6d0c2'], [1, '#9a9282']], 0, 0, 1, 0);
    g += `<path d="M${ex - 64},${ey} C${ex - 84},${ey - 80} ${ex - 92},${ey - 170} ${ex - 52},${ey - 230} C${ex - 40},${ey - 262} ${ex - 46},${ey - 282} ${ex - 58},${ey - 300} L${ex + 34},${ey - 304} C${ex + 56},${ey - 316} ${ex + 80},${ey - 330} ${ex + 96},${ey - 334} C${ex + 70},${ey - 300} ${ex + 48},${ey - 270} ${ex + 50},${ey - 232} C${ex + 92},${ey - 170} ${ex + 84},${ey - 80} ${ex + 64},${ey}Z" fill="url(#t1ew)" ${ol(1.5)}/>`;
    g += `<path d="M${ex - 76},${ey - 150} Q${ex},${ey - 128} ${ex + 78},${ey - 150}" stroke="#b8902e" stroke-width="5" fill="none" opacity="0.85"/><path d="M${ex - 58},${ey - 296} L${ex + 36},${ey - 300}" stroke="#fff" stroke-width="3" opacity="0.6"/>`;
    g += `<path d="M${ex - 60},${ey - 260} C${ex - 130},${ey - 250} ${ex - 130},${ey - 120} ${ex - 74},${ey - 100}" stroke="#20140c" stroke-width="22" fill="none"/><path d="M${ex - 60},${ey - 260} C${ex - 130},${ey - 250} ${ex - 130},${ey - 120} ${ex - 74},${ey - 100}" stroke="#e8e2d6" stroke-width="16" fill="none"/>`;
    g += `<path d="M${ex + 40},${ey - 210} C${ex + 70},${ey - 150} ${ex + 72},${ey - 80} ${ex + 50},${ey - 20}" stroke="#fff" stroke-width="9" fill="none" opacity="0.55" stroke-linecap="round"/>`;
    // the crock: brown salt-glazed stoneware, a wooden lid, a paper label: CHLORKALK (chlorinated lime)
    const jx = 860, jy = TOP + 34;
    g += `<ellipse cx="${jx}" cy="${jy + 4}" rx="84" ry="13" fill="#000" opacity="0.45" filter="url(#b4)"/>`;
    g += lg('t1jar', [[0, '#3a2210'], [0.4, '#7a4e26'], [0.7, '#a8703a'], [1, '#4a2c12']], 0, 0, 1, 0);
    g += `<path d="M${jx - 70},${jy} C${jx - 82},${jy - 60} ${jx - 82},${jy - 130} ${jx - 64},${jy - 168} L${jx + 64},${jy - 168} C${jx + 82},${jy - 130} ${jx + 82},${jy - 60} ${jx + 70},${jy}Z" fill="url(#t1jar)" ${ol(1.5)}/>`;
    g += `<rect x="${jx - 70}" y="${jy - 186}" width="140" height="22" rx="6" fill="#6a4a26" ${ol(1.3)}/><circle cx="${jx}" cy="${jy - 194}" r="12" fill="#5a3a1e" ${ol(1.1)}/><path d="M${jx + 30},${jy - 160} C${jx + 58},${jy - 120} ${jx + 60},${jy - 60} ${jx + 46},${jy - 14}" stroke="#ffd8a0" stroke-width="7" fill="none" opacity="0.4"/>`;
    g += `<rect x="${jx - 50}" y="${jy - 128}" width="100" height="70" fill="#e6dcc0" ${ol(1.1)}/><rect x="${jx - 46}" y="${jy - 124}" width="92" height="62" fill="none" stroke="#5a1a10" stroke-width="1.4"/>` + TXT(jx, jy - 96, 14, '#1a1008', 'CHLORKALK', { w: 'bold', len: 82 }) + `<path d="M${jx - 30},${jy - 88} L${jx + 30},${jy - 88}" stroke="#5a1a10" stroke-width="1"/>` + TXT(jx, jy - 72, 9, '#3a2a1a', 'Calcar. chlorin.', { it: true, len: 70 });
    return g;
  };
  // the towel over the stand's right end (in front of the cabinet), drawn after the stand
  S.t1Towel = () => `<path d="M1000,${S.T1B.NEAR - 6} L1150,${S.T1B.NEAR - 6} L1160,1880 C1120,1900 1040,1900 1000,1880Z" fill="#a49c8e" filter="url(#cloth)" ${ol(1.4)}/><path d="M1000,1800 L1160,1800 M1000,1824 L1160,1824" stroke="#8a3a2a" stroke-width="9" opacity="0.8"/><path d="M1030,${S.T1B.NEAR + 20} C1036,1700 1028,1800 1034,1880" stroke="#a8a090" stroke-width="10" fill="none" opacity="0.4" filter="url(#b4)"/><rect x="990" y="${S.T1B.NEAR - 14}" width="180" height="18" rx="6" fill="#d8d2c4" ${ol(1.2)}/>`;
  S.t1DoorLight = (t) => {
    const [lx, ly] = S.T1B.LANTERN, k = fl(t, 5), r = rng(491);
    let g = C.radial(lx - 80, ly + 300, 900, '#ffb060', 0.14 * k);
    for (let i = 0; i < 36; i++) { const x = lx - 700 + r() * 760, y = ly - 200 + r() * 1100 - t * 12; g += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(1 + r() * 1.8)}" fill="#ffe0b0" opacity="${f(0.15 + r() * 0.35)}"/>`; }
    return g;
  };
  // a corner of the door's frame close to the lens at the left, soft
  S.t1DoorFg = (t) => `<g filter="url(#dof2)"><path d="M-200,-200 L40,-200 L10,2100 L-200,2100Z" fill="#1e120a"/><path d="M40,-200 L10,2100" stroke="#a8784a" stroke-width="8" opacity="0.3"/></g>`;
})(window);
