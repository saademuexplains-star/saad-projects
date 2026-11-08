// Sets for "The Cells That Never Died" part 1 (Baltimore, 1951): Henrietta's front room in Turner Station, the clinic
// at Johns Hopkins, the hospital's domed front at dusk with the side door for Black patients (and the same front at
// night, from the car park), the operating theatre seen from above, the corridor to the lab, the ward by the window.
(function (G) {
  const S = G.SETS, { f, shade, mix, rng } = G.RIG, C = G.CINE, PR = G.PROPS;
  const { boards, frame, motes, shaft, darkPool, LG, olr } = S.H17;
  const lerp = (a, b, t) => a + (b - a) * t, cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const TAU = Math.PI * 2;
  const cache = {}, once = (k, fn) => cache[k] || (cache[k] = fn());
  // a window frame with panes ((x,y) top left)
  const panes = (x, y, w, h, nx, ny, col = '#f4f2ea', bw = 14) => {
    let g = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${col}" stroke-width="${bw}"/>`;
    for (let i = 1; i < nx; i++) g += `<path d="M${f(x + w * i / nx)},${y} L${f(x + w * i / nx)},${y + h}" stroke="${col}" stroke-width="${bw * 0.6}"/>`;
    for (let j = 1; j < ny; j++) g += `<path d="M${x},${f(y + h * j / ny)} L${x + w},${f(y + h * j / ny)}" stroke="${col}" stroke-width="${bw * 0.6}"/>`;
    return g + `<rect x="${x - bw}" y="${y - bw}" width="${w + bw * 2}" height="${h + bw * 2}" fill="none" ${olr(2)}/>`;
  };
  S.H18 = { panes };

  // ======================================================= HENRIETTA'S FRONT ROOM (Turner Station, a winter morning, 1951)
  // floor 1640; the window 640-1020 (y 520-1080) onto the row houses across the street; the kitchen doorway at the left
  // (-560..-260); the sofa -200..520 (seat 1500); the side table with the radio at 1250; the photos over the sofa
  const H = S.HO = { FY: 1640, WIN: [640, 520, 380, 560], DOOR: [-560, 640, 300, 1000], SOFA: [-200, 520, 1500], RADIO: [1250, 1470], LAMP: [1440, 1640], CAL: [-120, 820] };
  S.home51 = (t, o = {}) => {
    const L = [], [wx, wy, ww, wh] = H.WIN, day = o.day ?? 1;
    // through the window: a pale winter sky, the brick row houses across the street with white marble steps, a bare tree
    L.push({ p: 0.45, svg: once('hoout', () => {
      let g = `<defs>${LG('hosky', [[0, '#a8bccc'], [1, '#e4e2da']])}</defs><rect x="200" y="-200" width="1400" height="1600" fill="url(#hosky)"/>`;
      const r = rng(41);
      for (let i = 0; i < 6; i++) {
        const x = 260 + i * 210, top = 640 + (i % 2) * 20;
        g += `<rect x="${x}" y="${top}" width="206" height="700" fill="${['#8a4a36', '#7a4232', '#94523c'][i % 3]}" stroke="#3a1e14" stroke-width="2"/>`;
        for (let k = 0; k < 2; k++) for (let j = 0; j < 2; j++) g += `<rect x="${x + 30 + k * 96}" y="${top + 50 + j * 150}" width="56" height="96" fill="#3a4a5a"/><rect x="${x + 30 + k * 96}" y="${top + 50 + j * 150}" width="56" height="96" fill="none" stroke="#e8e0d0" stroke-width="6"/>`;
        g += `<rect x="${x + 70}" y="${top + 360}" width="60" height="110" fill="#3a2418"/><path d="M${x + 56},${top + 470} l90,0 l10,24 l-110,0Z M${x + 50},${top + 494} l100,0 l10,24 l-120,0Z" fill="#ece8e0" stroke="#9a948a" stroke-width="2"/>`;
        g += `<rect x="${x - 4}" y="${top - 24}" width="214" height="26" fill="#5a2a1e"/>`;
        for (let k = 0; k < 14; k++) g += `<path d="M${x},${top + 20 + k * 48 + (r() * 6)} l206,0" stroke="#5a2a1e" stroke-width="2" opacity="0.4"/>`;
      }
      g += `<path d="M200,1180 L1600,1180 L1600,1400 L200,1400Z" fill="#8a8680"/><path d="M200,1176 L1600,1176" stroke="#c8c4bc" stroke-width="8"/>`;
      // a bare street tree and a parked rounded sedan
      g += `<path d="M560,1180 C556,1000 572,880 560,700 M560,900 C620,840 680,800 720,760 M562,820 C500,760 470,720 430,690 M560,760 C590,700 600,650 640,620" stroke="#2a2018" stroke-width="16" fill="none" stroke-linecap="round"/>`;
      g += `<path d="M700,1180 C700,1120 740,1100 800,1096 C830,1060 900,1050 960,1060 C1000,1070 1030,1096 1060,1100 C1110,1104 1130,1130 1130,1180Z" fill="#2a3a3a" stroke="#141c1c" stroke-width="3"/><circle cx="780" cy="1180" r="30" fill="#141414"/><circle cx="1060" cy="1180" r="30" fill="#141414"/><path d="M830,1090 L880,1066 L960,1068 L990,1092Z" fill="#9ab0b8" opacity="0.8"/>`;
      return g;
    }) + motes(640, 520, 1020, 1100, 14, 41, t, '#fff8e8', 0.35 * day) });
    // the wall: soft sage paper with a faint stripe and sprigs, a picture rail, the window with sheer curtains, the
    // doorway into the kitchen, framed photographs, the calendar, a mirror
    L.push({ p: 0.88, svg: once('howall', () => {
      let g = `<defs><clipPath id="howc"><path d="M-1600,-600 L2800,-600 L2800,2400 L-1600,2400Z M${wx},${wy} L${wx + ww},${wy} L${wx + ww},${wy + wh} L${wx},${wy + wh}Z M${H.DOOR[0]},${H.DOOR[1]} L${H.DOOR[0] + H.DOOR[2]},${H.DOOR[1]} L${H.DOOR[0] + H.DOOR[2]},${H.FY} L${H.DOOR[0]},${H.FY}Z" clip-rule="evenodd"/></clipPath>${LG('howp', [[0, '#c9d3b8'], [1, '#b2bea0']])}</defs>`;
      g += `<g clip-path="url(#howc)"><rect x="-1600" y="-600" width="4400" height="3000" fill="url(#howp)"/>`;
      for (let x = -1600; x < 2800; x += 64) g += `<path d="M${x},-600 L${x},${H.FY}" stroke="#a8b494" stroke-width="10" opacity="0.35"/>`;
      const r = rng(43);
      for (let i = 0; i < 260; i++) { const x = -1580 + (i % 26) * 170 + (Math.floor(i / 26) % 2) * 85, y = -560 + Math.floor(i / 26) * 230; g += `<path d="M${x},${y} c6,-14 18,-16 22,-4 M${x + 11},${y - 4} l0,18" stroke="#8a9a78" stroke-width="3" fill="none" opacity="0.5"/><circle cx="${x + 4}" cy="${y - 10}" r="4" fill="#c88a8a" opacity="0.5"/>`; }
      g += `<rect x="-1600" y="420" width="4400" height="16" fill="#8a6a44"/><rect x="-1600" y="1560" width="4400" height="80" fill="#e4dcc8"/><rect x="-1600" y="1556" width="4400" height="8" fill="#c8bea8"/></g>`;
      // window trim and sill; the doorway trim; a radiator under the window
      g += `<rect x="${wx - 30}" y="${wy - 30}" width="${ww + 60}" height="${wh + 60}" fill="none" stroke="#f0ece2" stroke-width="30"/>` + panes(wx, wy, ww, wh, 2, 3, '#f0ece2', 12) + `<rect x="${wx - 50}" y="${wy + wh + 14}" width="${ww + 100}" height="26" fill="#f2eee4" ${olr(1.6)}/>`;
      g += `<rect x="${wx + 20}" y="${wy + wh + 120}" width="${ww - 40}" height="200" rx="8" fill="#d8d4c8" ${olr(1.6)}/>` + Array.from({ length: 12 }, (_, i) => `<rect x="${wx + 34 + i * 27}" y="${wy + wh + 130}" width="16" height="180" rx="6" fill="#e4e0d4" stroke="#a8a498" stroke-width="2"/>`).join('');
      g += `<rect x="${H.DOOR[0] - 26}" y="${H.DOOR[1] - 26}" width="${H.DOOR[2] + 52}" height="${H.FY - H.DOOR[1] + 26}" fill="none" stroke="#f0ece2" stroke-width="26"/>`;
      // photographs over the sofa (family portraits in silhouette), a calendar for February 1951, a round mirror
      const ph = (x, y, w, h, k) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#2a2018" ${olr(1.6)}/><rect x="${x + 8}" y="${y + 8}" width="${w - 16}" height="${h - 16}" fill="#c8b898"/><ellipse cx="${x + w / 2}" cy="${y + h * 0.42}" rx="${w * 0.16}" ry="${h * 0.17}" fill="#4a3426"/><path d="M${x + w * 0.22},${y + h - 8} C${x + w * 0.26},${y + h * 0.62} ${x + w * 0.74},${y + h * 0.62} ${x + w * 0.78},${y + h - 8}Z" fill="#3a2a20"/>` + (k ? `<ellipse cx="${x + w * 0.72}" cy="${y + h * 0.52}" rx="${w * 0.1}" ry="${h * 0.12}" fill="#4a3426"/>` : '');
      g += ph(-60, 820, 150, 190, 1) + ph(130, 860, 120, 150, 0) + ph(290, 800, 170, 210, 1);
      g += `<rect x="${H.CAL[0] - 60}" y="${H.CAL[1]}" width="120" height="150" fill="#f6f2e8" ${olr(1.4)}/><rect x="${H.CAL[0] - 60}" y="${H.CAL[1]}" width="120" height="40" fill="#a8282e"/><text x="${H.CAL[0]}" y="${H.CAL[1] + 29}" text-anchor="middle" font-family="Georgia,serif" font-size="22" font-weight="bold" fill="#fff">FEB 1951</text>` +
        Array.from({ length: 20 }, (_, i) => `<rect x="${H.CAL[0] - 52 + (i % 5) * 21}" y="${H.CAL[1] + 50 + Math.floor(i / 5) * 22}" width="15" height="14" fill="#d8d0c0"/>`).join('');
      g += `<circle cx="1260" cy="900" r="120" fill="#c8a860" ${olr(2)}/><circle cx="1260" cy="900" r="100" fill="#a8b8c0"/><path d="M1200,840 C1230,820 1270,816 1300,830" stroke="#fff" stroke-width="10" opacity="0.4" fill="none"/>`;
      return g;
    }) });
    // through the kitchen doorway: the white enamel range and a checked tablecloth
    L.push({ p: 0.8, svg: once('hokit', () => `<rect x="-760" y="560" width="560" height="1080" fill="#d8d0b8"/><rect x="-700" y="1180" width="300" height="460" fill="#f2f0ea" ${olr(1.6)}/><rect x="-690" y="1200" width="280" height="40" fill="#2a2a2a"/>` +
      `<circle cx="-640" cy="1220" r="10" fill="#c8c8c8"/><circle cx="-600" cy="1220" r="10" fill="#c8c8c8"/><rect x="-680" y="1290" width="260" height="200" rx="8" fill="#e8e6e0" ${olr(1.2)}/><path d="M-390,1360 L-200,1360 L-210,1640 M-380,1360 L-386,1640" stroke="#8a6a44" stroke-width="14"/>` +
      `<path d="M-400,1340 L-180,1340 L-170,1420 L-410,1420Z" fill="#c83a3a"/>` + Array.from({ length: 8 }, (_, i) => `<rect x="${-404 + i * 30}" y="1342" width="15" height="${i % 2 ? 76 : 38}" fill="#fff" opacity="0.6"/>`).join('')) });
    // the furniture against the wall: a floral sofa with a doily, the side table and the radio, a floor lamp
    L.push({ p: 0.95, svg: once('hosofa', () => {
      const [x0, x1, sy] = H.SOFA;
      let g = `<path d="M${x0},${sy} L${x0},${sy - 240} C${x0},${sy - 290} ${x0 + 40},${sy - 300} ${x0 + 80},${sy - 300} L${x1 - 80},${sy - 300} C${x1 - 40},${sy - 300} ${x1},${sy - 290} ${x1},${sy - 240} L${x1},${sy}Z" fill="#7a3a3a" ${olr(2)}/>`;
      g += `<rect x="${x0 - 40}" y="${sy - 120}" width="${x1 - x0 + 80}" height="170" rx="30" fill="#8a4242" ${olr(2)}/><rect x="${x0 - 60}" y="${sy - 200}" width="80" height="250" rx="34" fill="#7a3838" ${olr(2)}/><rect x="${x1 - 20}" y="${sy - 200}" width="80" height="250" rx="34" fill="#7a3838" ${olr(2)}/>`;
      const r = rng(47); for (let i = 0; i < 40; i++) { const x = x0 + r() * (x1 - x0), y = sy - 280 + r() * 300; g += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(6 + r() * 6)}" fill="#e8b8a0" opacity="0.4"/>`; }
      g += `<path d="M${x0 + 200},${sy - 300} l120,0 l-10,60 l-100,0Z" fill="#f8f4ea" opacity="0.9"/>` + Array.from({ length: 8 }, (_, i) => `<circle cx="${x0 + 206 + i * 15}" cy="${sy - 238}" r="6" fill="#f8f4ea"/>`).join('');
      g += `<path d="M${x0},${sy + 50} l20,90 M${x1},${sy + 50} l-20,90" stroke="#3a2418" stroke-width="12"/>`;
      // side table + radio, the floor lamp
      g += `<rect x="1120" y="1480" width="260" height="22" fill="#6a4228" ${olr(1.6)}/><path d="M1140,1502 L1150,1640 M1360,1502 L1350,1640" stroke="#5a3820" stroke-width="12"/>`;
      g += `<path d="M1440,1640 L1440,1060" stroke="#8a7a50" stroke-width="10"/><ellipse cx="1440" cy="1640" rx="60" ry="14" fill="#5a4a30"/><path d="M1370,1060 L1510,1060 L1480,960 L1400,960Z" fill="#efe2c0" ${olr(1.6)}/>`;
      return g;
    }) + PR.radio50(H.RADIO[0], H.RADIO[1], 0.95, t, o.radio ?? 1) + PR.nailPolish(1330, 1478, 0.5) });
    // the floor: varnished boards and an oval braided rug
    L.push({ p: 1, svg: once('hofloor', () => `<rect x="-1600" y="${H.FY}" width="4400" height="1200" fill="#7a5232"/>` + boards(-1600, 2800, H.FY, 2800, 540, 900, '#7a5232', 49, 170) +
      // a worn braided rag rug: muted rings, each a braid of short slanted strands
      `<ellipse cx="520" cy="1990" rx="640" ry="176" fill="#000" opacity="0.25" filter="url(#b8)"/><ellipse cx="520" cy="1980" rx="630" ry="170" fill="#5a3e2c"/>` +
      Array.from({ length: 8 }, (_, i) => { const c = ['#6e4a36', '#7a6a50', '#5e5040', '#84583e', '#6a6048', '#7a4c38', '#625444', '#8a6a4a'][i], rx = 610 - i * 72, ry = 164 - i * 19.5; return `<ellipse cx="520" cy="1980" rx="${rx}" ry="${f(ry)}" fill="none" stroke="${c}" stroke-width="36"/><ellipse cx="520" cy="1980" rx="${rx}" ry="${f(ry)}" fill="none" stroke="${shade(c, 0.18)}" stroke-width="22" stroke-dasharray="9 13" opacity="0.6"/><ellipse cx="520" cy="1980" rx="${rx + 17}" ry="${f(ry + 5)}" fill="none" stroke="#2a1a10" stroke-width="2" opacity="0.4"/>`; }).join('') +
      `<ellipse cx="420" cy="1950" rx="300" ry="60" fill="#fff" opacity="0.05"/>`) });
    // window light: a warm slanted shaft and motes, on the window's own layer
    L.push({ p: 0.88, light: true, svg: `<g opacity="${f(0.85 * day)}">${shaft([[wx + 10, wy + 40], [wx + ww - 10, wy + 40], [1300, 2600], [500, 2600]], '#fff2d8', 0.28, 'hosun', 0.16)}</g>` });
    return L;
  };

  // ======================================================= THE CLINIC (an examining room, Johns Hopkins, 1951)
  // floor 1700; the X-ray viewing box 300-760 (y 520-900) glowing on the wall; venetian blinds 920-1300; a glass cabinet
  const CL = S.CL = { FY: 1700, BOX: [300, 680, 460, 380], BLIND: [920, 420, 380, 600] };
  S.clinic = (t, o = {}) => {
    const L = [], [bx, by, bw, bh] = CL.BOX, [lx, ly, lw, lh] = CL.BLIND;
    L.push({ p: 0.9, svg: once('clwall', () => {
      let g = `<defs>${LG('clw', [[0, '#c4cfc0'], [1, '#aebaa8']])}${LG('clbox', [[0, '#f4f8fa'], [1, '#dce8ee']])}</defs><rect x="-1200" y="-400" width="3600" height="2300" fill="url(#clw)"/>`;
      // white tiles below the dado
      for (let y = 1150; y < CL.FY; y += 40) for (let x = -1200; x < 2400; x += 40) g += `<rect x="${x}" y="${y}" width="38" height="38" fill="#eceee8" stroke="#c8ccc4" stroke-width="2"/>`;
      g += `<rect x="-1200" y="1136" width="3600" height="16" fill="#3a5a4a"/>`;
      // the X-ray viewing box (lit), clips along its top
      g += `<rect x="${bx - 20}" y="${by - 20}" width="${bw + 40}" height="${bh + 40}" rx="8" fill="#5a5e60" ${olr(2)}/><rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="url(#clbox)"/>`;
      for (let i = 0; i < 3; i++) g += `<rect x="${bx + 30 + i * 140}" y="${by - 26}" width="40" height="18" rx="3" fill="#8a8e90" ${olr(1)}/>`;
      // the blinds: slats with bright light between them
      g += `<rect x="${lx}" y="${ly}" width="${lw}" height="${lh}" fill="#fff8e8"/>` + Array.from({ length: 24 }, (_, i) => `<rect x="${lx}" y="${ly + i * 25}" width="${lw}" height="17" fill="#d8d0b8" stroke="#a8a088" stroke-width="1.2"/>`).join('') + `<rect x="${lx - 16}" y="${ly - 16}" width="${lw + 32}" height="${lh + 32}" fill="none" stroke="#e8e4da" stroke-width="16"/>`;
      // a glass-fronted instrument cabinet with bottles and steel trays
      g += `<rect x="-420" y="560" width="440" height="980" fill="#e8e8e2" ${olr(2)}/><rect x="-396" y="590" width="390" height="560" fill="#c8d4d8" opacity="0.6" ${olr(1.4)}/>`;
      for (const sy of [760, 950, 1140]) { g += `<path d="M-396,${sy} L-6,${sy}" stroke="#a8acaa" stroke-width="6"/>`; for (let k = 0; k < 5; k++) g += `<rect x="${-380 + k * 74}" y="${sy - 70 - (k % 2) * 20}" width="40" height="${70 + (k % 2) * 20}" rx="6" fill="${['#8a5a2a', '#e8e8e0', '#3a5a7a'][k % 3]}" opacity="0.85" ${olr(1)}/>`; }
      // two framed diplomas, an eye chart by the window, a steel sink with a mirror, a coat hook with a white coat
      for (const [x, y] of [[90, 600], [90, 800]]) g += `<rect x="${x}" y="${y}" width="170" height="130" fill="#3a2a1a" ${olr(1.4)}/><rect x="${x + 12}" y="${y + 12}" width="146" height="106" fill="#f2ead6"/><path d="M${x + 30},${y + 40} l110,0 M${x + 40},${y + 60} l90,0 M${x + 50},${y + 80} l70,0" stroke="#5a4a3a" stroke-width="3" opacity="0.6"/><circle cx="${x + 125}" cy="${y + 98}" r="10" fill="#b8302a" opacity="0.8"/>`;
      g += `<rect x="1380" y="560" width="150" height="230" fill="#f6f4ec" ${olr(1.4)}/>` + [40, 28, 20, 14, 10, 7].map((s, i) => `<text x="1455" y="${600 + i * 32 + s * 0.4}" text-anchor="middle" font-family="Arial,sans-serif" font-weight="bold" font-size="${s}" fill="#1a1a1a">${['E', 'F P', 'T O Z', 'L P E D', 'P E C F D', 'E D F C Z P'][i]}</text>`).join('');
      g += `<rect x="1640" y="1180" width="260" height="70" fill="#e8eaea" ${olr(1.6)}/><path d="M1660,1250 L1700,1420 L1840,1420 L1880,1250" fill="#d8dcdc" ${olr(1.4)}/><path d="M1770,1180 L1770,1130 L1800,1130" stroke="#9aa0a4" stroke-width="10" fill="none"/><rect x="1660" y="860" width="220" height="260" rx="10" fill="#c8d4d8" ${olr(1.6)}/><path d="M1690,900 L1760,980" stroke="#fff" stroke-width="10" opacity="0.4"/>`;
      g += `<circle cx="1220" cy="1060" r="10" fill="#8a8a84"/><path d="M1190,1066 C1150,1200 1160,1400 1180,1520 L1290,1520 C1300,1400 1300,1200 1252,1066Z" fill="#f2f2ee" ${olr(1.4)}/><path d="M1220,1080 L1222,1500" stroke="#d8d8d0" stroke-width="4"/>`;
      return g;
    }) + (o.film ? (() => {
      // an X-ray film clipped to the viewing box: the pelvis in warm greys, a dense shadow ringed in red grease pencil
      const k = o.film, cx = bx + bw / 2, cy = by + bh / 2;
      let g = `<g opacity="${f(k)}"><rect x="${bx + 24}" y="${by + 14}" width="${bw - 48}" height="${bh - 28}" fill="#1e1c1a"/><g filter="url(#b2)" fill="#d8d0c2">`;
      // lumbar vertebrae, the sacrum, the two iliac wings, the pubic ring and the heads of the thigh bones
      for (let i = 0; i < 2; i++) g += `<rect x="${cx - 34}" y="${cy - 168 + i * 42}" width="68" height="34" rx="10" opacity="0.62"/>`;
      g += `<path d="M${cx - 56},${cy - 82} L${cx + 56},${cy - 82} C${cx + 50},${cy - 20} ${cx + 20},${cy + 40} ${cx},${cy + 62} C${cx - 20},${cy + 40} ${cx - 50},${cy - 20} ${cx - 56},${cy - 82}Z" opacity="0.55"/>`;
      for (const s of [-1, 1]) g += `<path d="M${cx + s * 56},${cy - 74} C${cx + s * 110},${cy - 150} ${cx + s * 186},${cy - 150} ${cx + s * 192},${cy - 74} C${cx + s * 196},${cy - 20} ${cx + s * 160},${cy + 36} ${cx + s * 112},${cy + 66} C${cx + s * 96},${cy + 30} ${cx + s * 74},${cy - 10} ${cx + s * 56},${cy - 30}Z" opacity="0.58"/>` +
        `<ellipse cx="${cx + s * 58}" cy="${cy + 118}" rx="36" ry="28" fill="none" stroke="#d8d0c2" stroke-width="14" opacity="0.6"/><circle cx="${cx + s * 150}" cy="${cy + 86}" r="32" opacity="0.66"/><path d="M${cx + s * 160},${cy + 110} L${cx + s * 178},${cy + 170}" stroke="#d8d0c2" stroke-width="40" opacity="0.6"/>`;
      g += `</g><ellipse cx="${cx + 8}" cy="${cy + 26}" rx="${f(38 + 5 * Math.sin(t * 2))}" ry="32" fill="#efe4d4" opacity="0.5" filter="url(#b4)"/>`;
      const rk = o.ring ?? 1;
      if (rk > 0.01) g += `<path d="M${cx + 8 + 70},${cy + 30} A70,58 0 1 1 ${f(cx + 8 + 70 * Math.cos(rk * TAU * 0.97))},${f(cy + 30 + 58 * Math.sin(rk * TAU * 0.97))}" stroke="#d8261e" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.9"/>`;
      return g + `</g>`;
    })() : '') });
    // an examining table with a white sheet (p 0.96) and a steel stool
    L.push({ p: 0.96, svg: once('cltable', () => `<rect x="640" y="1440" width="560" height="60" rx="10" fill="#f4f4f0" ${olr(2)}/><rect x="660" y="1500" width="520" height="140" fill="#d8dcd8" ${olr(1.6)}/><path d="M680,1640 L680,${CL.FY} M1160,1640 L1160,${CL.FY}" stroke="#6a6e70" stroke-width="12"/>` +
      `<path d="M640,1450 C700,1430 780,1470 860,1446 C940,1424 1020,1470 1200,1446" stroke="#dcdcd4" stroke-width="5" fill="none"/>`) });
    L.push({ p: 1, svg: once('clfloor', () => `<rect x="-1200" y="${CL.FY}" width="3600" height="1200" fill="#d8d2c2"/>` + Array.from({ length: 120 }, (_, i) => { const c = i % 12, r = Math.floor(i / 12); return (c + r) % 2 ? `<rect x="${-1200 + c * 300}" y="${CL.FY + r * 100}" width="300" height="100" fill="#8a9488" opacity="0.7"/>` : ''; }).join('') + `<rect x="-1200" y="${CL.FY}" width="3600" height="50" fill="#000" opacity="0.2"/>`) });
    L.push({ p: 0.9, light: true, svg: C.radial(bx + bw / 2, by + bh / 2, 520, '#e8f4ff', 0.2, 'screen') + `<g opacity="0.7">${shaft([[lx, ly + 60], [lx + lw, ly + 60], [1500, 2400], [700, 2400]], '#fff4dc', 0.2, 'clsun', 0.2)}</g>` });
    return L;
  };

  // ======================================================= JOHNS HOPKINS (the domed front at dusk; o.night 0..1 for the car
  // park at night with the ward window lit, o.wardOff 0..1 when its light goes out, o.rain 0..1)
  // world: the dome's top at about (540, -260) on its layer (p 0.62); the side door 520-760 at p 1 (sill 1640) with the sign
  const HK = S.HK = { DOME: [540, -250], DOOR: [520, 1060, 240, 580], SIGN: [640, 960], FY: 1640, WARDWIN: [880, 640] };
  S.hopkins = (t, o = {}) => {
    const L = [], nt = o.night || 0;
    L.push({ p: 0.2, svg: `<defs>${LG('hksky', [[0, mix('#1c2846', '#06081a', nt)], [0.5, mix('#5a5a78', '#141a34', nt)], [0.8, mix('#b88a7a', '#1e2236', nt)], [1, mix('#e8a874', '#2a2a40', nt)]])}</defs><rect x="-2000" y="-2000" width="5200" height="4600" fill="url(#hksky)"/>` +
      (nt > 0.05 ? `<g opacity="${f(nt)}">${S.H17.starsW(-800, -1600, 2000, 300, 90, 7, t)}</g>` : '') +
      once('hkcloud', () => Array.from({ length: 7 }, (_, i) => `<ellipse cx="${-900 + i * 520}" cy="${-500 + (i % 3) * 160}" rx="${300 + (i % 2) * 160}" ry="40" fill="#e8b8a0" opacity="0.18"/>`).join('')) });
    // the hospital: red-brick wings with tall windows, the central pavilion and its white dome with a lantern
    L.push({ p: 0.62, svg: (() => {
      let g = once('hkbld', () => {
        let s = `<defs>${LG('hkbr', [[0, '#9a4a36'], [1, '#6a2e22']])}${LG('hkdm', [[0, '#e8e4dc'], [1, '#9a968e']], 1, 0)}</defs>`;
        s += `<rect x="-1400" y="420" width="3900" height="1400" fill="url(#hkbr)" ${olr(2)}/>`;
        // tall sash windows: a stone arch and sill, dark glass with a glazing bar
        for (let k = 0; k < 4; k++) for (let i = 0; i < 26; i++) { const x = -1360 + i * 150, y = 560 + k * 300; if (x > 200 && x < 820) continue; s += `<path d="M${x - 8},${y + 150} L${x - 8},${y + 30} C${x - 8},${y - 14} ${x + 78},${y - 14} ${x + 78},${y + 30} L${x + 78},${y + 150}Z" fill="#d8c8b0" opacity="0.85"/><path d="M${x},${y + 146} L${x},${y + 32} C${x},${y} ${x + 70},${y} ${x + 70},${y + 32} L${x + 70},${y + 146}Z" fill="#1c222c"/><path d="M${x + 35},${y + 10} L${x + 35},${y + 146} M${x},${y + 80} L${x + 70},${y + 80}" stroke="#8a8478" stroke-width="3" opacity="0.7"/><rect x="${x - 12}" y="${y + 146}" width="94" height="10" fill="#d8ccb6"/>`; }
        for (let y = 470; y < 1820; y += 22) s += `<path d="M-1400,${y} L2500,${y}" stroke="#4a2018" stroke-width="1.5" opacity="0.3"/>`;
        // the central pavilion, steps of cornices, the drum, the dome, the lantern and a spire
        s += `<rect x="240" y="120" width="600" height="1700" fill="#a85440" ${olr(2)}/><rect x="220" y="100" width="640" height="40" fill="#e8e0d0"/><rect x="300" y="-60" width="480" height="180" fill="#b05c46" ${olr(1.6)}/><rect x="290" y="-80" width="500" height="30" fill="#ece4d4"/>`;
        s += `<path d="M330,-80 C330,-300 750,-300 750,-80Z" fill="url(#hkdm)" ${olr(2)}/>` + Array.from({ length: 7 }, (_, i) => `<path d="M${360 + i * 60},-80 C${380 + i * 50},-200 ${500 + (i - 3) * 6},-250 540,-262" stroke="#a8a49a" stroke-width="3" fill="none"/>`).join('');
        s += `<rect x="500" y="-330" width="80" height="80" fill="#e8e4dc" ${olr(1.4)}/><path d="M490,-330 L540,-400 L590,-330Z" fill="#c8c4bc" ${olr(1.4)}/><path d="M540,-400 L540,-460" stroke="#3a3a3a" stroke-width="5"/>`;
        s += `<path d="M380,1820 L380,1480 C380,1380 700,1380 700,1480 L700,1820Z" fill="#2a1e18"/>`;
        return s;
      });
      // lit windows (warmer as the night comes); the ward window on the second floor stays the brightest
      const r = rng(61); let lit = '';
      for (let k = 0; k < 4; k++) for (let i = 0; i < 26; i++) { const x = -1360 + i * 150, y = 560 + k * 300; if (x > 200 && x < 820) continue; if (r() < 0.45 + 0.3 * nt) lit += `<path d="M${x + 4},${y + 142} L${x + 4},${y + 34} C${x + 4},${y + 6} ${x + 66},${y + 6} ${x + 66},${y + 34} L${x + 66},${y + 142}Z" fill="#ffd890" opacity="${f(0.3 + 0.45 * nt)}"/>`; }
      // people passing along the far pavement
      for (const [x0, sp, h] of [[-700, 60, 1], [900, -45, 0.92], [1500, 52, 1.05]]) { const x = x0 + t * sp, b = 2 * Math.sin(t * 10 + x0); lit += `<g transform="translate(${f(x)},${f(1810 + b)}) scale(${h})"><ellipse cx="0" cy="-150" rx="14" ry="17" fill="#141218"/><path d="M-20,-132 C-26,-90 -22,-40 -14,0 L14,0 C22,-40 26,-90 20,-132Z" fill="#1a1820"/><path d="M-14,-170 L14,-170 L18,-160 L-18,-160Z" fill="#1a1820"/></g>`; }
      const [wx, wy] = HK.WARDWIN, on = 1 - (o.wardOff || 0);
      lit += `<rect x="${wx}" y="${wy}" width="70" height="140" fill="#ffe2a0" opacity="${f(on * (0.6 + 0.4 * nt))}"/>` + (on > 0.05 ? C.radial(wx + 35, wy + 70, 140, '#ffd890', 0.35 * on * nt, 'screen') : '');
      return g + lit;
    })() });
    // bare winter trees and a street lamp in the middle distance
    L.push({ p: 0.82, svg: once('hktree', () => {
      let g = '';
      for (const [x, h] of [[-300, 900], [1320, 980]]) {
        g += `<path d="M${x},1700 C${x - 6},${1700 - h * 0.5} ${x + 8},${1700 - h * 0.7} ${x},${1700 - h}" stroke="#1a1410" stroke-width="30" fill="none"/>`;
        const r = rng(x); for (let i = 0; i < 9; i++) { const y = 1700 - h * (0.45 + r() * 0.5), s = r() < 0.5 ? -1 : 1, l = 160 + r() * 220; g += `<path d="M${x},${f(y)} C${f(x + s * l * 0.4)},${f(y - l * 0.3)} ${f(x + s * l * 0.8)},${f(y - l * 0.5)} ${f(x + s * l)},${f(y - l * 0.9)}" stroke="#1a1410" stroke-width="${f(10 + r() * 6)}" fill="none" stroke-linecap="round"/>`; }
      }
      g += `<path d="M960,1700 L960,1120" stroke="#141414" stroke-width="14"/><path d="M930,1120 L990,1120 L980,1060 L940,1060Z" fill="#2a2a2a"/>`;
      return g;
    }) + C.radial(960, 1100, 160, '#ffd890', 0.4 + 0.3 * nt, 'screen') });
    // the side door for Black patients: brick, a lamp, a lit glass door and the sign over it; a parked sedan
    L.push({ p: 1, svg: once('hkdoor', () => {
      const [dx, dy, dw, dh] = HK.DOOR;
      let g = `<defs>${LG('hkbr2', [[0, '#8a4232'], [1, '#5a281c']])}</defs><rect x="260" y="560" width="760" height="1100" fill="url(#hkbr2)" ${olr(2)}/>`;
      for (let y = 580; y < 1660; y += 26) g += `<path d="M260,${y} L1020,${y}" stroke="#4a2018" stroke-width="2" opacity="0.5"/>`;
      g += `<rect x="${dx - 24}" y="${dy - 24}" width="${dw + 48}" height="${dh + 24}" fill="#e8e0d0" ${olr(1.6)}/><rect x="${dx}" y="${dy}" width="${dw}" height="${dh}" fill="#3a2a1e" ${olr(1.6)}/>`;
      g += `<rect x="${dx + 24}" y="${dy + 24}" width="${dw / 2 - 36}" height="${dh * 0.5}" fill="#ffd890" opacity="0.85"/><rect x="${dx + dw / 2 + 12}" y="${dy + 24}" width="${dw / 2 - 36}" height="${dh * 0.5}" fill="#ffd890" opacity="0.85"/>`;
      // the sign: COLORED, white on black enamel
      const [sx, sy] = HK.SIGN;
      g += `<rect x="${sx - 150}" y="${sy - 40}" width="300" height="72" rx="6" fill="#141414" stroke="#e8e8e0" stroke-width="5"/><text x="${sx}" y="${sy + 14}" text-anchor="middle" font-family="'Franklin Gothic Medium','Arial Narrow',Arial,sans-serif" font-size="44" font-weight="bold" letter-spacing="4" fill="#f4f2ea">COLORED</text>`;
      g += `<path d="M${dx + dw + 60},${dy - 80} l30,0 l0,40 l-30,0Z" fill="#2a2a2a"/><path d="M${dx - 40},${HK.FY} l${dw + 80},0 l20,30 l${-dw - 120},0Z" fill="#b8b0a4" ${olr(1.4)}/>`;
      g += `<rect x="-800" y="${HK.FY}" width="2800" height="900" fill="#5a5856"/><path d="M-800,${HK.FY + 4} L2000,${HK.FY + 4}" stroke="#8a8884" stroke-width="10"/>`;
      // a 1950s sedan at the kerb
      g += `<path d="M-480,1720 C-480,1640 -420,1610 -340,1604 C-300,1540 -200,1520 -100,1534 C-40,1546 0,1590 30,1604 C110,1610 150,1650 150,1720Z" fill="#1e2a2a" ${olr(2)}/><path d="M-300,1600 L-240,1550 L-120,1552 L-70,1600Z" fill="#7a9098" opacity="0.8"/><circle cx="-360" cy="1720" r="44" fill="#0e0e0e"/><circle cx="40" cy="1720" r="44" fill="#0e0e0e"/><path d="M-470,1680 L140,1680" stroke="#c8c8c0" stroke-width="5"/>`;
      return g;
    }) + C.radial(HK.DOOR[0] + HK.DOOR[2] / 2, HK.DOOR[1] + 140, 360, '#ffd890', 0.45, 'screen') + C.radial(HK.SIGN[0], HK.SIGN[1], 200, '#ffe8b0', 0.25, 'screen') });
    if ((o.rain || 0) > 0.01) { const r = rng(3); let g = ''; for (let i = 0; i < 150; i++) { const x = -600 + r() * 2400, sp = 900 + r() * 500, y = -400 + ((r() * 2600 + t * sp) % 2600); g += `<path d="M${f(x)},${f(y)} l-8,${f(40 + r() * 30)}" stroke="#c8d4e8" stroke-width="${f(1.5 + r() * 1.5)}" opacity="${f(0.4 * o.rain)}"/>`; } L.push({ p: 1.15, svg: g }); }
    if (nt > 0.01) L.push({ p: 1, light: true, svg: `<rect x="-3000" y="-3000" width="8000" height="8000" fill="#05081a" opacity="${f(0.5 * nt)}"/>` + C.radial(HK.WARDWIN[0] + 35, HK.WARDWIN[1] + 70, 500, '#ffd890', 0.12 * nt * (1 - (o.wardOff || 0)), 'screen') });
    return L;
  };

  // ======================================================= THE OPERATING THEATRE, from above
  // the table runs down the frame (360-720, y 500-1900), the head at the top; the instrument tray at the right; green tile
  // floor; the round surgical lamp hangs in the foreground over the table
  const OR = S.OR = { TABLE: [360, 500, 360, 1400], TRAY: [800, 1080, 320, 300], LAMP: [540, 900] };
  S.or51 = (t, o = {}) => {
    const L = [];
    L.push({ p: 0.8, svg: once('orfloor', () => {
      let g = `<rect x="-1400" y="-1200" width="3800" height="4400" fill="#4a6a5a"/>`;
      for (let y = -1200; y < 3200; y += 90) for (let x = -1400; x < 2400; x += 90) g += `<rect x="${x + 2}" y="${y + 2}" width="86" height="86" fill="#567a68" stroke="#3a5648" stroke-width="2"/>`;
      return g + `<ellipse cx="540" cy="1100" rx="900" ry="1200" fill="#000" opacity="0.25" filter="url(#b14)"/>`;
    }) });
    // the table, the sheet, the pillow; green drapes at the sides
    L.push({ p: 0.95, svg: once('ortable', () => {
      const [x, y, w, h] = OR.TABLE;
      let g = `<rect x="${x - 30}" y="${y - 40}" width="${w + 60}" height="${h + 80}" rx="18" fill="#2a2e30" ${olr(2)}/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="#e8ece8" ${olr(1.6)}/>`;
      g += `<path d="M${x - 80},${y + 300} L${x + w + 80},${y + 300} L${x + w + 120},${y + h + 60} L${x - 120},${y + h + 60}Z" fill="#7aa08a" ${olr(1.6)}/>` + [0.25, 0.5, 0.75].map(k => `<path d="M${f(x - 60 + k * (w + 120))},${y + 320} L${f(x - 100 + k * (w + 200))},${y + h + 40}" stroke="#5a806a" stroke-width="6" opacity="0.6"/>`).join('');
      g += `<rect x="${x + 50}" y="${y + 20}" width="${w - 100}" height="200" rx="40" fill="#f6f8f6" ${olr(1.4)}/>`;
      return g;
    }) });
    // the instrument tray: scalpels, forceps, clamps, gauze, a glass dish waiting
    L.push({ p: 0.97, svg: once('ortray', () => {
      const [x, y, w, h] = OR.TRAY;
      let g = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="#b8bec0" ${olr(1.6)}/><rect x="${x + 12}" y="${y + 12}" width="${w - 24}" height="${h - 24}" rx="6" fill="#dfe4e6"/>`;
      for (let i = 0; i < 5; i++) g += `<path d="M${x + 30 + i * 22},${y + 40} L${x + 30 + i * 22},${y + 190}" stroke="#8a9094" stroke-width="7" stroke-linecap="round"/><path d="M${x + 26 + i * 22},${y + 40} l8,-20 l2,22Z" fill="#e8ecee" ${olr(1)}/>`;
      g += `<path d="M${x + 170},${y + 60} L${x + 260},${y + 200} M${x + 190},${y + 50} L${x + 270},${y + 190}" stroke="#7a8084" stroke-width="7"/><circle cx="${x + 172}" cy="${y + 56}" r="12" fill="none" stroke="#7a8084" stroke-width="5"/>`;
      g += `<path d="M${x + 40},${y + 230} C${x + 80},${y + 210} ${x + 130},${y + 250} ${x + 170},${y + 226} L${x + 170},${y + 280} L${x + 40},${y + 280}Z" fill="#f4f4ee" ${olr(1)}/>`;
      return g;
    }) });
    // the anaesthetist at the head end and the surgeon and nurse at the sides, seen from above: capped heads, shoulders
    const topPerson = (x, y, rot, cap, gown) => `<g transform="translate(${x},${y}) rotate(${rot})"><ellipse cx="0" cy="40" rx="150" ry="70" fill="${gown}" ${olr(2)}/><circle cx="0" cy="0" r="62" fill="${cap}" ${olr(2)}/>` +
      `<path d="M-40,-20 C-20,-40 20,-40 40,-20" stroke="${shade(cap, -0.2)}" stroke-width="4" fill="none"/></g>`;
    L.push({ p: 1.02, svg: topPerson(540, 300, 180, '#c4d6c0', '#9ab49a') + topPerson(900, 760, -90, '#c4d6c0', '#9ab49a') + topPerson(130, 1180, 90, '#d4e2d0', '#a8c0a4') });
    // the round lamp over the table (near the camera, soft) and its pool of light
    L.push({ p: 1, light: true, svg: C.radial(OR.TABLE[0] + OR.TABLE[2] / 2, 760, 520, '#fff6e0', 0.35, 'screen') + darkPool('ordk', 540, 900, 500, 1500, 0.55, '#020604', -3000, 4000) });
    L.push({ p: 1.6, svg: `<g filter="url(#dof2)"><circle cx="${OR.LAMP[0]}" cy="${OR.LAMP[1]}" r="380" fill="#c8ccc8" ${olr(4)}/><circle cx="${OR.LAMP[0]}" cy="${OR.LAMP[1]}" r="300" fill="#f8f6ee"/>` +
      Array.from({ length: 7 }, (_, i) => { const a = i / 7 * TAU; return `<circle cx="${f(OR.LAMP[0] + Math.cos(a) * 180)}" cy="${f(OR.LAMP[1] + Math.sin(a) * 180)}" r="70" fill="#fffef8"/>`; }).join('') + `<circle cx="${OR.LAMP[0]}" cy="${OR.LAMP[1]}" r="80" fill="#fffef8"/></g>` + C.radial(OR.LAMP[0], OR.LAMP[1], 700, '#fff8e8', 0.5, 'screen') });
    return L;
  };

  // ======================================================= THE CORRIDOR (seen from the side as the dish is carried along)
  // the far wall runs along x (-1500..5600) with doors; pillars pass close to the lens; the lab door at 5200
  const CR = S.CR = { FY: 1500, LABDOOR: 5100 };
  S.corr51 = (t, o = {}) => {
    const L = [];
    L.push({ p: 0.8, svg: once('crwall', () => {
      let g = `<defs>${LG('crw', [[0, '#cfd8c4'], [1, '#b4c0a8']])}</defs><rect x="-2000" y="-400" width="9000" height="${CR.FY + 400}" fill="url(#crw)"/><rect x="-2000" y="1060" width="9000" height="${CR.FY - 1060}" fill="#4a6a54"/><rect x="-2000" y="1052" width="9000" height="14" fill="#2e4a38"/>`;
      for (let i = 0; i < 9; i++) {
        const x = -1400 + i * 780;
        if (Math.abs(x - CR.LABDOOR) < 300) continue;
        g += `<rect x="${x}" y="600" width="260" height="${CR.FY - 600}" fill="#5a3e28" ${olr(2)}/><rect x="${x + 30}" y="640" width="200" height="300" fill="#e4ece6" opacity="0.85" ${olr(1.4)}/><text x="${x + 130}" y="820" text-anchor="middle" font-family="Georgia,serif" font-size="48" fill="#2a2a2a" opacity="0.7">${210 + i * 2}</text><circle cx="${x + 230}" cy="1120" r="12" fill="#c8a040"/>`;
        g += `<path d="M${x + 420},300 l0,-60" stroke="#3a3a3a" stroke-width="5"/><circle cx="${x + 420}" cy="330" r="50" fill="#f8f4e4" ${olr(1.4)}/>`;
        if (i % 3 === 1) g += `<rect x="${x + 330}" y="1160" width="220" height="200" rx="8" fill="#d8d4c8" ${olr(1.4)}/>` + Array.from({ length: 8 }, (_, k) => `<rect x="${x + 340 + k * 26}" y="1170" width="16" height="180" rx="5" fill="#e4e0d4"/>`).join('');
        if (i % 3 === 2) g += `<rect x="${x + 320}" y="1290" width="300" height="24" fill="#6a4a2a" ${olr(1.4)}/><path d="M${x + 340},1314 L${x + 340},${CR.FY} M${x + 600},1314 L${x + 600},${CR.FY}" stroke="#4a3220" stroke-width="10"/>`;
        // a window between the doors (daylight), a notice board, a fire bucket on its hook
        if (i % 2 === 0) g += `<rect x="${x + 330}" y="560" width="240" height="380" fill="#f4f8f2" ${olr(1.6)}/><path d="M${x + 450},560 L${x + 450},940 M${x + 330},750 L${x + 570},750" stroke="#c8d0c4" stroke-width="10"/><rect x="${x + 318}" y="940" width="264" height="16" fill="#e8e6dc"/>`;
        else g += `<rect x="${x + 360}" y="660" width="200" height="150" fill="#8a6a44" ${olr(1.4)}/>` + [0, 1, 2].map(k => `<rect x="${x + 376 + k * 60}" y="${676 + (k % 2) * 16}" width="48" height="64" fill="${['#f4f0e4', '#e8e0c8', '#f8f4ea'][k]}" transform="rotate(${(k - 1) * 4} ${x + 400 + k * 60} 700)"/>`).join('') + `<path d="M${x + 610},1040 l0,40" stroke="#3a3a3a" stroke-width="4"/><path d="M${x + 584},1080 l52,0 l-8,70 l-36,0Z" fill="#c82a22" ${olr(1.2)}/>`;
      }
      // the ceiling: a band of pipes along the top of the wall
      g += `<rect x="-2000" y="-400" width="9000" height="560" fill="#e8ece2"/><path d="M-2000,160 L7000,160" stroke="#9aa69a" stroke-width="12"/><path d="M-2000,120 L7000,120" stroke="#b8beb4" stroke-width="22"/><path d="M-2000,84 L7000,84" stroke="#8a948a" stroke-width="8"/>`;
      // a gurney parked against the wall with a folded blanket, a wheelchair
      g += `<rect x="1740" y="1250" width="520" height="40" rx="8" fill="#e8eae6" ${olr(1.4)}/><path d="M1780,1290 L1780,1460 M2220,1290 L2220,1460 M1780,1380 L2220,1380" stroke="#8a9296" stroke-width="10"/><circle cx="1780" cy="1474" r="18" fill="#2a2a2a"/><circle cx="2220" cy="1474" r="18" fill="#2a2a2a"/><rect x="1820" y="1218" width="200" height="34" rx="8" fill="#a8b4c4" ${olr(1.2)}/>`;
      g += `<circle cx="3640" cy="1400" r="80" fill="none" stroke="#5a5e62" stroke-width="10"/><path d="M3600,1180 L3600,1330 L3740,1330 L3740,1250 M3600,1330 L3560,1470" stroke="#4a4e52" stroke-width="10" fill="none"/><rect x="3600" y="1300" width="140" height="34" fill="#6a4a3a"/>`;
      // the lab door: frosted glass lit from inside, lettering
      const dx = CR.LABDOOR;
      g += `<rect x="${dx - 160}" y="560" width="320" height="${CR.FY - 560}" fill="#4a3222" ${olr(2)}/><rect x="${dx - 130}" y="600" width="260" height="400" fill="#fff4dc" ${olr(1.4)}/>` + Array.from({ length: 30 }, (_, i) => { const r = rng(i + 900); return `<circle cx="${f(dx - 120 + r() * 240)}" cy="${f(610 + r() * 380)}" r="${f(8 + r() * 14)}" fill="#fff" opacity="0.18"/>`; }).join('') +
        `<text x="${dx}" y="740" text-anchor="middle" font-family="Georgia,serif" font-size="36" font-weight="bold" letter-spacing="2" fill="#1a120a">TISSUE</text><text x="${dx}" y="792" text-anchor="middle" font-family="Georgia,serif" font-size="36" font-weight="bold" letter-spacing="2" fill="#1a120a">CULTURE</text><path d="M${dx - 90},812 L${dx + 90},812" stroke="#1a120a" stroke-width="3"/><text x="${dx}" y="850" text-anchor="middle" font-family="Georgia,serif" font-size="24" fill="#1a120a">LABORATORY</text><circle cx="${dx + 120}" cy="1120" r="13" fill="#c8a040"/>`;
      return g;
    }) + C.radial(CR.LABDOOR, 800, 380, '#fff0c8', 0.45, 'screen') });
    L.push({ p: 1, svg: once('crfloor', () => `<rect x="-2000" y="${CR.FY}" width="9000" height="900" fill="#a8a294"/>` + Array.from({ length: 200 }, (_, i) => { const r = rng(i * 7 + 1); return `<circle cx="${f(-2000 + r() * 9000)}" cy="${f(CR.FY + 20 + r() * 860)}" r="${f(3 + r() * 6)}" fill="${r() < 0.5 ? '#7a7468' : '#cac4b6'}" opacity="0.6"/>`; }).join('') + `<rect x="-2000" y="${CR.FY}" width="9000" height="60" fill="#fff" opacity="0.08"/>`) });
    // pillars and door jambs sweeping past close to the lens
    // (only the pillars in view, so the blur's filter region stays small)
    { const v = G.ENG && G.ENG.viewRect ? G.ENG.viewRect(1.35) : null; let g = ''; for (let i = 0; i < 7; i++) { const x = -1200 + i * 1100; if (v && (x + 150 < v[0] - 100 || x > v[2] + 100)) continue; g += `<g filter="url(#dof2)"><rect x="${x}" y="${v ? f(v[1] - 100) : -600}" width="150" height="${v ? f(v[3] - v[1] + 200) : 3200}" fill="#d4dac6"/><rect x="${x + 112}" y="${v ? f(v[1] - 100) : -600}" width="38" height="${v ? f(v[3] - v[1] + 200) : 3200}" fill="#a8b29a"/><rect x="${x + 20}" y="${v ? f(v[1] - 100) : -600}" width="26" height="${v ? f(v[3] - v[1] + 200) : 3200}" fill="#f4f6ec" opacity="0.7"/></g>`; } L.push({ p: 1.35, svg: g }); }
    return L;
  };

  // ======================================================= THE WARD (her bed by the window; o.day 0..1 day/night, o.season 0..1
  // summer green to autumn bare, o.cal month index 1..10, o.clock hours)
  const WD = S.WD = { FY: 1700, WIN: [240, 300, 640, 760], BL: 1420, BED: [200, 1000], CAL: [1080, 700], CLOCK: [-120, 520] };
  S.ward51 = (t, o = {}) => {
    const L = [], [wx, wy, ww, wh] = WD.WIN, day = o.day ?? 1, se = o.season || 0;
    // outside: the sky and the trees across the street turning with the season
    L.push({ p: 0.45, svg: (() => {
      let g = `<defs>${LG('wdsky', [[0, mix('#0a1024', '#9ab4cc', day)], [1, mix('#1a2238', '#e8e4d8', day)]])}</defs><rect x="-400" y="-400" width="2000" height="2200" fill="url(#wdsky)"/>`;
      if (day < 0.5) g += `<g opacity="${f(1 - day * 2)}">${S.H17.starsW(200, 200, 1000, 900, 40, 9, t)}</g>`;
      g += `<rect x="-400" y="900" width="2000" height="600" fill="${mix('#141a22', '#7a7a74', day)}"/>`;
      const leaf = mix(mix('#4a7a3a', '#c8701e', cl(se * 2)), '#5a4a3a', cl(se * 2 - 1)), r = rng(71);
      for (let i = 0; i < 5; i++) {
        const x = 160 + i * 200, y = 980;
        g += `<path d="M${x},1300 L${x},${y - 100}" stroke="#2a2018" stroke-width="18"/>`;
        const n = Math.round(14 * (1 - cl(se * 2 - 1)));
        for (let k = 0; k < 14; k++) { const lx = x + (r() - 0.5) * 220, ly = y - 140 - r() * 200, rr = 40 + r() * 40; if (k < n) g += `<circle cx="${f(lx)}" cy="${f(ly)}" r="${f(rr)}" fill="${mix(leaf, '#0a0e14', 1 - day)}" opacity="0.9"/>`; else g += `<path d="M${x},${f(y - 100)} L${f(lx)},${f(ly)}" stroke="${mix('#2a2018', '#0a0a0e', 1 - day)}" stroke-width="5"/>`; }
      }
      return g;
    })() });
    // the wall: pale green, a dado, the big window, the calendar, the clock, the next bed's curtain
    L.push({ p: 0.9, svg: once('wdwall', () => {
      let g = `<defs><clipPath id="wdwc"><path d="M-1600,-600 L2800,-600 L2800,2400 L-1600,2400Z M${wx},${wy} L${wx + ww},${wy} L${wx + ww},${wy + wh} L${wx},${wy + wh}Z" clip-rule="evenodd"/></clipPath>${LG('wdw', [[0, '#dfe4cc'], [1, '#c4ccb0']])}</defs>`;
      g += `<g clip-path="url(#wdwc)"><rect x="-1600" y="-600" width="4400" height="3000" fill="url(#wdw)"/><rect x="-1600" y="1180" width="4400" height="${WD.FY - 1180}" fill="#8aa08a"/><rect x="-1600" y="1172" width="4400" height="14" fill="#5a705a"/></g>`;
      g += panes(wx, wy, ww, wh, 3, 4, '#f2f0e8', 14) + `<rect x="${wx - 40}" y="${wy + wh + 10}" width="${ww + 80}" height="24" fill="#f2f0e8" ${olr(1.4)}/>`;
      // a long curtain on a rail at the left (the next bed), a steel locker at the right
      g += `<path d="M-1400,120 L-140,120" stroke="#8a8a84" stroke-width="10"/><path d="M-1400,130 C-1300,600 -1360,1100 -1340,${WD.FY} L-200,${WD.FY} C-220,1100 -160,600 -200,130Z" fill="#dce4dc" ${olr(1.6)}/>` + Array.from({ length: 8 }, (_, i) => `<path d="M${-1340 + i * 150},140 C${-1330 + i * 150},700 ${-1350 + i * 150},1200 ${-1320 + i * 150},${WD.FY}" stroke="#b8c4b8" stroke-width="6" fill="none"/>`).join('');
      g += `<rect x="1240" y="880" width="260" height="820" fill="#c8ccc8" ${olr(2)}/><path d="M1370,880 L1370,1700" stroke="#9a9e9a" stroke-width="4"/>`;
      return g;
    }) + (() => {
      // the calendar (months turn in the time-lapse) and the clock (its hands race)
      const mon = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT'][cl(Math.floor(o.cal || 1) - 1, 0, 9)], [cx, cy] = WD.CAL;
      let g = `<rect x="${cx - 70}" y="${cy}" width="140" height="170" fill="#f6f2e8" ${olr(1.4)}/><rect x="${cx - 70}" y="${cy}" width="140" height="44" fill="#2a4a6a"/><text x="${cx}" y="${cy + 32}" text-anchor="middle" font-family="Georgia,serif" font-size="28" font-weight="bold" fill="#fff">${mon}</text>` +
        Array.from({ length: 20 }, (_, i) => `<rect x="${cx - 60 + (i % 5) * 24}" y="${cy + 56 + Math.floor(i / 5) * 26}" width="18" height="16" fill="#d8d0c0"/>`).join('');
      const [kx, ky] = WD.CLOCK, hr = (o.clock ?? 10) * TAU / 12, mn = (o.clock ?? 10) * TAU;
      g += `<circle cx="${kx}" cy="${ky}" r="70" fill="#f8f6ee" stroke="#3a3a3a" stroke-width="8"/>` + Array.from({ length: 12 }, (_, i) => { const a = i / 12 * TAU; return `<path d="M${f(kx + Math.sin(a) * 56)},${f(ky - Math.cos(a) * 56)} L${f(kx + Math.sin(a) * 64)},${f(ky - Math.cos(a) * 64)}" stroke="#3a3a3a" stroke-width="4"/>`; }).join('') +
        `<path d="M${kx},${ky} L${f(kx + Math.sin(hr) * 34)},${f(ky - Math.cos(hr) * 34)}" stroke="#1a1a1a" stroke-width="7" stroke-linecap="round"/><path d="M${kx},${ky} L${f(kx + Math.sin(mn) * 52)},${f(ky - Math.cos(mn) * 52)}" stroke="#1a1a1a" stroke-width="4" stroke-linecap="round"/>`;
      return g;
    })() });
    // her iron bed: the white-painted headboard bars behind her (p 0.97); the blanket and the foot come with the shot
    L.push({ p: 0.97, svg: once('wdbed', () => {
      const [x0, x1] = WD.BED;
      let g = `<path d="M${x0},${WD.FY} L${x0},1080 C${x0},1020 ${x1},1020 ${x1},1080 L${x1},${WD.FY}" fill="none" stroke="#f2f2ec" stroke-width="22"/><path d="M${x0},${WD.FY} L${x0},1080 C${x0},1020 ${x1},1020 ${x1},1080 L${x1},${WD.FY}" fill="none" ${olr(1.6)}/>`;
      for (let i = 1; i < 9; i++) g += `<path d="M${x0 + i * (x1 - x0) / 9},1060 L${x0 + i * (x1 - x0) / 9},1340" stroke="#ecece6" stroke-width="10"/>`;
      g += `<path d="M${x0 + 30},1300 C${x0 + 60},1220 ${x1 - 60},1220 ${x1 - 30},1300 L${x1 - 30},1360 L${x0 + 30},1360Z" fill="#f8f8f4" ${olr(1.4)}/>`;
      return g;
    }) });
    L.push({ p: 1, svg: once('wdfloor', () => `<rect x="-1600" y="${WD.FY}" width="4400" height="1000" fill="#8a8a7a"/>` + Array.from({ length: 48 }, (_, i) => `<rect x="${-1600 + (i % 12) * 380}" y="${WD.FY + Math.floor(i / 12) * 110}" width="190" height="110" fill="#7a7a6c" opacity="0.6"/>`).join('')) });
    L.push({ p: 0.9, light: true, svg: `<g opacity="${f(0.8 * day)}">${shaft([[wx, wy + 40], [wx + ww, wy + 40], [1300, 2600], [300, 2600]], '#fff4dc', 0.22, 'wdsun', 0.18)}</g>` + (day < 0.6 ? `<rect x="-3000" y="-3000" width="8000" height="8000" fill="#060a18" opacity="${f(0.55 * (1 - day / 0.6))}"/>` + C.radial(600, 1250, 600, '#ffd8a0', 0.2 * (1 - day), 'screen') : '') });
    return L;
  };
})(window);
