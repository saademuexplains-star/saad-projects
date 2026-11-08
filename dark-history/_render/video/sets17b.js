// Sets for "The Heroin Bottle" part 2: the corner pharmacy (sunny and busy by day; gaslit with rain on the glass by
// night), the study where the great globe turns, and the medical society's reading room at night.
(function (G) {
  const S = G.SETS, { f, shade, mix, rng } = G.RIG, C = G.CINE, PR = G.PROPS;
  const lerp = (a, b, t) => a + (b - a) * t, cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const TAU = Math.PI * 2;
  const OUTC = '#140c06';
  const cache = {}, once = (k, fn) => cache[k] || (cache[k] = fn());
  const { boards, beadboard, frame, starsW, motes, shaft, darkPool, LG, olr } = S.H17;

  // a gas pendant lamp hanging on a chain (world): a brass fount and an etched glass globe; lit 0..1
  const pendant = (x, y0, y, s, t, on, ph = 0) => {
    const sw = Math.sin(t * 0.6 + ph) * 1.5;
    let g = `<path d="M${x},${y0} L${f(x + sw)},${y - 60 * s}" stroke="#4a3a1a" stroke-width="${f(5 * s)}" stroke-dasharray="${f(10 * s)} ${f(5 * s)}"/>`;
    g += `<g transform="translate(${f(x + sw)},${f(y)}) scale(${f(s)})"><path d="M-30,-60 L30,-60 L20,-30 L-20,-30Z" fill="#b8902e" ${olr(1.2)}/><path d="M-46,-30 C-60,10 -40,50 0,56 C40,50 60,10 46,-30Z" fill="#f4eee0" opacity="${f(0.55 + 0.35 * on)}" ${olr(1.2)}/><path d="M-46,-30 L46,-30" stroke="#b8902e" stroke-width="5"/>` +
      (on > 0.02 ? `<path d="M0,10 C-8,0 -6,-14 0,-22 C6,-14 8,0 0,10Z" fill="#fff4c8" opacity="${f(on)}"/>` : '') + `</g>`;
    if (on > 0.02) g += C.radial(x + sw, y, 380 * s, '#ffcf80', 0.36 * on, 'screen');
    return g;
  };
  // an apothecary jar (white porcelain with a blue cartouche and a gilt lid) or a coloured bottle; (x, y) base centre
  const jar = (x, y, s, k) => {
    if (k % 3 === 0) return `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><path d="M-30,0 L-34,-80 C-34,-96 34,-96 34,-80 L30,0Z" fill="#f2efe6" ${olr(1)}/><path d="M-36,-92 C-30,-112 30,-112 36,-92Z" fill="#c8a040" ${olr(1)}/><circle cx="0" cy="-118" r="7" fill="#c8a040"/><ellipse cx="0" cy="-46" rx="22" ry="16" fill="none" stroke="#2a4a8a" stroke-width="3"/><path d="M-12,-46 L12,-46" stroke="#2a4a8a" stroke-width="3"/><path d="M-24,-80 L-22,-10" stroke="#fff" stroke-width="4" opacity="0.6"/></g>`;
    const cols = ['#7a3a12', '#1e3a7a', '#2a5a3a', '#6a1a2a'], c = cols[k % 4];
    return `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><path d="M-22,0 L-22,-60 C-22,-74 -8,-78 -8,-90 L-8,-104 L8,-104 L8,-90 C8,-78 22,-74 22,-60 L22,0Z" fill="${c}" opacity="0.92" ${olr(1)}/><rect x="-10" y="-112" width="20" height="10" fill="#2a2018"/><rect x="-16" y="-50" width="32" height="26" fill="#ece6d4" opacity="0.85"/><path d="M-16,-62 L-15,-8" stroke="#fff" stroke-width="3" opacity="0.4"/></g>`;
  };
  S.pendant17 = pendant;

  // ======================================================= THE PHARMACY
  // world: floor line 1600 (checkered tiles to 2700). The shop window at the left (-980..-300, 240..1360) with three
  // show globes on its display shelf (1360), the door (-250..70); the wall of cabinets 120-1900 (jars behind glass,
  // drawers below), the cherub advertisement in the middle (840-1240, 300-760); the counter 150-1750 (top 1480, front
  // to the floor at 1990): the scale at 380, the mortar at 640, the carton pyramid at 1040, the register at 1560.
  // o.night 0..1 (gaslight, rain on the glass), o.crowd (day passers-by outside), o.cartons (how many on the pyramid)
  const B = S.PH = { FY: 1600, WIN: [-980, 240, 680, 1120], DOOR: [-250, 470, 320, 1130], COUNTER: [150, 1750, 1480, 1990],
    SCALE: [250, 1452], MORTAR: [380, 1452], PYR: [1080, 1456], REG: [1560, 1456], AD: [840, 300, 400, 460],
    GLOBES: [[-860, 1360, '#b01e2a'], [-640, 1360, '#1e6a3a'], [-420, 1360, '#1e3a9a']] };
  B.GLOBE_RED = [B.GLOBES[0][0], B.GLOBES[0][1] - 160 * 1.2];   // the red globe's bulb centre (scale 1.2)
  const street = (t, night) => {
    // day: the opposite side of the street (brick fronts, a milliner's window with an awning), people walking past;
    // night: the same in dark blue, rain streaks, a gas street lamp
    let g = once('phstreet', () => {
      const r = rng(51); let s = `<rect x="-1800" y="-300" width="2200" height="2200" fill="#8a5a46"/>`;
      for (let y = -300; y < 1500; y += 34) s += `<path d="M-1800,${y} L400,${y}" stroke="#6a4232" stroke-width="3"/>`;
      for (let i = 0; i < 5; i++) { const x = -1700 + i * 420; s += `<rect x="${x}" y="80" width="220" height="320" fill="#2a3a4a" stroke="#e8e0cc" stroke-width="14"/><path d="M${x + 110},80 L${x + 110},400 M${x},240 L${x + 220},240" stroke="#e8e0cc" stroke-width="8"/>`; }
      s += `<rect x="-1800" y="720" width="2200" height="560" fill="#3a2a22"/><rect x="-1500" y="780" width="760" height="420" fill="#c8b8a0"/><rect x="-600" y="780" width="760" height="420" fill="#b8c0b8"/>`;
      s += `<path d="M-1540,720 L-700,720 L-660,820 L-1580,820Z" fill="#2a5a3a"/>` + Array.from({ length: 12 }, (_, i) => `<path d="M${-1580 + i * 76},820 l38,0 l-19,22Z" fill="${i % 2 ? '#2a5a3a' : '#e8e0cc'}"/>`).join('');
      for (let i = 0; i < 6; i++) s += `<path d="M${-1440 + i * 110},1200 C${-1450 + i * 110},1000 ${-1400 + i * 110},960 ${-1380 + i * 110},960 C${-1360 + i * 110},960 ${-1310 + i * 110},1000 ${-1320 + i * 110},1200Z" fill="${['#8a3a5a', '#3a4a7a', '#a8885a'][i % 3]}" opacity="0.8"/>`;
      s += `<rect x="-1800" y="1280" width="2200" height="400" fill="#4a4a50"/>` + Array.from({ length: 60 }, () => `<ellipse cx="${f(-1800 + r() * 2200)}" cy="${f(1300 + r() * 360)}" rx="${f(20 + r() * 20)}" ry="${f(8 + r() * 6)}" fill="#3a3a40" stroke="#5a5a62" stroke-width="2"/>`).join('');
      return s;
    });
    // passers-by (day): dark-coated silhouettes with hats crossing the window, now and then
    if (night < 0.9) {
      let p = '';
      for (let i = 0; i < 4; i++) {
        const sp = 70 + i * 22, x = -1900 + (((t * sp + i * 640) % 2600) + 2600) % 2600, bob = Math.sin(t * 6 + i) * 6, dir = i % 2 ? 1 : -1, xx = dir > 0 ? x : 400 - (x + 1900) + -1500;
        p += `<g transform="translate(${f(xx)},${f(1320 + bob)}) scale(${f(1.1 + (i % 2) * 0.15)})"><path d="M-40,0 L-34,-240 C-34,-300 34,-300 34,-240 L40,0Z" fill="${['#2a2a32', '#4a3a2a', '#3a2a3a', '#2a3a3a'][i]}"/><circle cx="0" cy="-320" r="34" fill="#d8b498"/><path d="M-50,-338 L50,-338 L36,-350 C34,-394 -34,-394 -36,-350Z" fill="#1a1a1e"/><path d="M-60,-260 L-80,-120 M60,-260 L78,-130" stroke="${['#2a2a32', '#4a3a2a', '#3a2a3a', '#2a3a3a'][i]}" stroke-width="22" stroke-linecap="round"/></g>`;
      }
      g += `<g opacity="${f(1 - night)}">${p}</g>`;
      // a cart rolling past (day)
      const cx = -2400 + ((t * 160) % 3400);
      g += `<g opacity="${f(1 - night)}" transform="translate(${f(cx)},1330)"><rect x="-200" y="-200" width="400" height="150" fill="#5a3a20"/><circle cx="-130" cy="-40" r="56" fill="none" stroke="#2a1a10" stroke-width="12"/><circle cx="130" cy="-40" r="56" fill="none" stroke="#2a1a10" stroke-width="12"/><path d="M-120,-200 L-60,-320 L120,-320 L170,-200Z" fill="#c8b890"/></g>`;
    }
    if (night > 0.01) {
      g += `<rect x="-1800" y="-300" width="2200" height="2200" fill="#0a1020" opacity="${f(0.86 * night)}"/>`;
      g += `<g opacity="${f(night)}"><path d="M-80,-200 L-80,1300" stroke="#1a1a20" stroke-width="16"/><path d="M-120,40 L-40,40 L-50,-30 L-110,-30Z" fill="#2a2a30"/>${C.radial(-80, 10, 360, '#ffc070', 0.45, 'screen')}<path d="M-108,-28 L-52,-28 L-56,36 L-104,36Z" fill="#ffe0a0" opacity="0.8"/>${C.radial(-80, 1420, 300, '#ffb860', 0.2, 'screen')}</g>`;
    }
    return g;
  };
  // rain on glass (streaks running down, drops) inside a rect
  const rainGlass = (x0, y0, w, h, t, k, seed) => {
    if (k < 0.01) return '';
    const r = rng(seed); let g = '';
    for (let i = 0; i < 60; i++) { const x = x0 + r() * w, sp = 120 + r() * 260, len = 30 + r() * 90, y = y0 + ((r() * h + t * sp) % (h + len)) - len; g += `<path d="M${f(x)},${f(y)} l${f(-2 - r() * 3)},${f(len)}" stroke="#c8d8f0" stroke-width="${f(1.5 + r() * 1.5)}" opacity="${f(0.35 * k)}"/>`; }
    for (let i = 0; i < 46; i++) { const x = x0 + r() * w, y = y0 + r() * h, rr = 2 + r() * 5; g += `<circle cx="${f(x)}" cy="${f(y + Math.sin(t * 0.5 + i) * 2)}" r="${f(rr)}" fill="#d8e4f8" opacity="${f(0.3 * k)}"/>`; }
    return g;
  };
  S.pharmacy = (t, o = {}) => {
    const L = [], nt = o.night || 0, [wx, wy, ww, wh] = B.WIN, [dx, dy, dw, dh] = B.DOOR;
    L.push({ p: 0.35, svg: street(t, nt) });
    // ---- the shop's walls (p 0.88): window and door openings, the cabinets, the advertisement, tin ceiling, lamps
    const wall = once('phwall', () => {
      let g = `<defs><clipPath id="phOpen"><path d="M-1800,-600 L2600,-600 L2600,2300 L-1800,2300Z M${wx},${wy} L${wx + ww},${wy} L${wx + ww},${wy + wh} L${wx},${wy + wh}Z M${dx + 40},${dy + 40} L${dx + dw - 40},${dy + 40} L${dx + dw - 40},${dy + 560} L${dx + 40},${dy + 560}Z" clip-rule="evenodd"/></clipPath>` +
        `<pattern id="phTin" width="80" height="80" patternUnits="userSpaceOnUse"><rect width="80" height="80" fill="#c8bea8"/><rect x="6" y="6" width="68" height="68" fill="none" stroke="#a89c84" stroke-width="3"/><circle cx="40" cy="40" r="16" fill="none" stroke="#b0a48c" stroke-width="3"/><circle cx="40" cy="40" r="5" fill="#a89c84"/></pattern></defs>`;
      g += `<g clip-path="url(#phOpen)"><rect x="-1800" y="-600" width="4400" height="2900" fill="#3e2a1a" filter="url(#woodV)"/>`;
      // the shopfront's inner frame: mahogany pilasters, a transom of small panes over the window
      g += `<rect x="${wx - 40}" y="${wy - 60}" width="${ww + 80}" height="${wh + 100}" fill="#4a2a18" ${olr(2)}/></g>`;
      g += `<rect x="${wx}" y="${wy}" width="${ww}" height="200" fill="none" stroke="#5a3420" stroke-width="10"/>` + Array.from({ length: 5 }, (_, i) => `<path d="M${wx + (i + 1) * ww / 6},${wy} L${wx + (i + 1) * ww / 6},${wy + 200}" stroke="#5a3420" stroke-width="8"/>`).join('') + `<path d="M${wx},${wy + 200} L${wx + ww},${wy + 200}" stroke="#5a3420" stroke-width="16"/><path d="M${wx + ww / 2},${wy + 200} L${wx + ww / 2},${wy + wh}" stroke="#5a3420" stroke-width="12"/>`;
      g += `<rect x="${wx - 50}" y="${wy + wh}" width="${ww + 100}" height="40" fill="#5a3420" ${olr(1.5)}/><rect x="${wx - 50}" y="${wy + wh + 40}" width="${ww + 100}" height="260" fill="#3a2214" filter="url(#woodV)" ${olr(1.4)}/><rect x="${wx - 20}" y="${wy + wh + 70}" width="${ww + 40}" height="200" fill="none" stroke="#2a160c" stroke-width="5"/>`;
      // gold scrollwork on the glass (no lettering): an arc of filigree and a mortar-and-pestle emblem
      g += `<path d="M${wx + 80},${wy + 420} C${wx + 200},${wy + 330} ${wx + ww - 200},${wy + 330} ${wx + ww - 80},${wy + 420}" stroke="#d8b050" stroke-width="5" fill="none" opacity="0.8"/><path d="M${wx + 120},${wy + 440} C${wx + 220},${wy + 370} ${wx + ww - 220},${wy + 370} ${wx + ww - 120},${wy + 440}" stroke="#d8b050" stroke-width="2.5" fill="none" opacity="0.7"/>` +
        `<g transform="translate(${wx + ww / 2},${wy + 520})" opacity="0.85"><path d="M-46,0 L46,0 C40,50 -40,50 -46,0Z" fill="none" stroke="#d8b050" stroke-width="5"/><path d="M10,-6 L50,-70" stroke="#d8b050" stroke-width="8" stroke-linecap="round"/><circle cx="0" cy="-30" r="70" fill="none" stroke="#d8b050" stroke-width="2.5" stroke-dasharray="6 6"/></g>`;
      // the door: mahogany with a glass upper panel, brass handle, the bell on its spring above
      g += `<rect x="${dx}" y="${dy}" width="${dw}" height="${dh}" fill="#4a2414" ${olr(2)}/><rect x="${dx + 40}" y="${dy + 40}" width="${dw - 80}" height="520" fill="none" stroke="#2a140a" stroke-width="10"/><rect x="${dx + 50}" y="${dy + 620}" width="${dw - 100}" height="${dh - 680}" fill="#3a1c10" ${olr(1.4)}/><circle cx="${dx + dw - 50}" cy="${dy + 640}" r="14" fill="#c8a040" ${olr(1)}/>`;
      // the cabinets: cornice, glazed upper cases (jars on three shelves), drawers below
      g += `<rect x="100" y="120" width="1820" height="70" fill="#4a2a18" ${olr(1.5)}/><rect x="90" y="180" width="1840" height="18" fill="#6a3e22"/><rect x="100" y="-400" width="1820" height="520" fill="url(#phTin)"/><rect x="100" y="-400" width="1820" height="520" fill="#000" opacity="0.25"/>`;
      const r = rng(61);
      for (let c = 0; c < 6; c++) {
        const x0 = 120 + c * 300; if (x0 + 280 > 820 && x0 < 1260) continue;
        g += `<rect x="${x0}" y="200" width="280" height="840" fill="#2a1a10" ${olr(1.5)}/>`;
        for (const sy of [430, 650, 870]) { g += `<rect x="${x0 + 10}" y="${sy}" width="260" height="14" fill="#5a3a20"/>`; for (let k = 0; k < 4; k++) g += jar(x0 + 46 + k * 62, sy, 0.8 + r() * 0.15, Math.floor(r() * 12)); }
        g += `<rect x="${x0 + 10}" y="210" width="260" height="820" fill="#c8d8e8" opacity="0.06"/><path d="M${x0 + 30},220 L${x0 + 90},1020" stroke="#fff" stroke-width="10" opacity="0.08"/><rect x="${x0}" y="200" width="280" height="840" fill="none" stroke="#6a4226" stroke-width="12"/><path d="M${x0 + 140},200 L${x0 + 140},1040" stroke="#6a4226" stroke-width="8"/>`;
      }
      // the drawers (blank enamel plates, brass pulls) behind the counter, from 1040 down
      for (let c = 0; c < 18; c++) for (let rr = 0; rr < 4; rr++) { const x0 = 110 + c * 100, y0 = 1060 + rr * 90; g += `<rect x="${x0}" y="${y0}" width="96" height="86" fill="#4a2a18" ${olr(1)}/><rect x="${x0 + 26}" y="${y0 + 16}" width="44" height="18" fill="#ece6d4"/><path d="M${x0 + 36},${y0 + 56} C${x0 + 40},${y0 + 66} ${x0 + 56},${y0 + 66} ${x0 + 60},${y0 + 56}" stroke="#c8a040" stroke-width="5" fill="none"/>`; }
      // the clock on the cornice and the library ladder on its rail
      g += `<circle cx="1040" cy="150" r="56" fill="#c8a040" ${olr(1.5)}/><circle cx="1040" cy="150" r="44" fill="#f2ecdc"/><path d="M1040,150 L1040,118 M1040,150 L1062,160" stroke="#1a1410" stroke-width="5" stroke-linecap="round"/>`;
      g += `<path d="M100,215 L1920,215" stroke="#b8902e" stroke-width="6"/><path d="M1560,215 L1480,1440 M1680,215 L1640,1440" stroke="#5a3a20" stroke-width="14"/>` + Array.from({ length: 10 }, (_, i) => `<path d="M${f(1560 - i * 8)},${330 + i * 112} L${f(1680 - i * 4)},${330 + i * 112}" stroke="#5a3a20" stroke-width="9"/>`).join('');
      // the cherub advertisement: a gilt frame, a mother rocking her sleeping baby, the carton beside them, rays
      const [ax, ay, aw, ah] = B.AD;
      let art = `<defs>${LG('phad', [[0, '#f4e6c8'], [1, '#d8c08a']])}</defs><rect x="${ax}" y="${ay}" width="${aw}" height="${ah}" fill="url(#phad)"/>`;
      for (let k = 0; k < 14; k++) { const a = Math.PI + k * Math.PI / 13; art += `<path d="M${ax + aw / 2},${ay + ah * 0.62} L${f(ax + aw / 2 + Math.cos(a) * 400)},${f(ay + ah * 0.62 + Math.sin(a) * 400)}" stroke="#e8c870" stroke-width="10" opacity="0.5"/>`; }
      art += `<path d="M${ax + 90},${ay + ah} C${ax + 90},${ay + 300} ${ax + 120},${ay + 190} ${ax + 170},${ay + 170} C${ax + 220},${ay + 190} ${ax + 250},${ay + 300} ${ax + 250},${ay + ah}Z" fill="#7a2a3a"/><circle cx="${ax + 170}" cy="${ay + 140}" r="40" fill="#f0d0b8"/><path d="M${ax + 128},${ay + 130} C${ax + 130},${ay + 84} ${ax + 210},${ay + 84} ${ax + 212},${ay + 130} C${ax + 200},${ay + 110} ${ax + 140},${ay + 110} ${ax + 128},${ay + 130}Z" fill="#5a3420"/>` +
        `<ellipse cx="${ax + 170}" cy="${ay + 260}" rx="70" ry="40" fill="#fbf6ec"/><circle cx="${ax + 150}" cy="${ay + 250}" r="24" fill="#f6d8c4"/><path d="M${ax + 140},${ay + 250} q5,4 10,0 M${ax + 154},${ay + 250} q5,4 10,0" stroke="#5a3a2a" stroke-width="2" fill="none"/>`;
      art += PR.carton(ax + 315, ay + ah - 50, 0.95);
      g += frame(ax, ay, aw, ah, art, { b: 26 });
      return g;
    });
    let w = wall;
    // the show globes on the window's display shelf (their light through the glass at night)
    for (const [gx, gy, col] of B.GLOBES) w += PR.showGlobe(gx, gy, 1.2, t, col);
    w += rainGlass(wx, wy, ww, wh, t, nt, 71) + rainGlass(dx + 40, dy + 40, dw - 80, 520, t, nt, 73);
    // the bell on its spring over the door (o.bell: time of the ring, it swings and settles)
    const bk = o.bell != null ? Math.exp(-Math.max(0, t - o.bell) * 3) * Math.sin(Math.max(0, t - o.bell) * 22) * (t > o.bell ? 1 : 0) : 0;
    w += `<path d="M${dx + dw / 2},${dy - 10} C${dx + dw / 2 + 30},${dy - 60} ${dx + dw / 2 + 60},${dy - 40} ${dx + dw / 2 + 70},${dy - 20}" stroke="#8a6a2a" stroke-width="5" fill="none"/><g transform="rotate(${f(bk * 22)} ${dx + dw / 2 + 70} ${dy - 20})"><path d="M${dx + dw / 2 + 52},${dy + 30} C${dx + dw / 2 + 52},${dy - 14} ${dx + dw / 2 + 88},${dy - 14} ${dx + dw / 2 + 88},${dy + 30}Z" fill="#c8a040" ${olr(1)}/></g>`;
    // the hanging gas pendants and wall brackets (lit at night, cold by day)
    for (const [x, y, ph] of [[300, 520, 0], [700, 600, 1.3], [1480, 560, 2.1], [-640, 460, 0.7]]) w += pendant(x, -200, y, 1.15, t, nt, ph);
    // daylight from the window: a warm slanted shaft and its motes, on the window's own layer so it always leaves the
    // glass (on the floor layer the parallax slid it off the window, a flat-topped beam starting on the wall), fading in
    // from the glass
    if (nt < 0.99) w += `<g opacity="${f(1 - nt)}">${shaft([[wx + 20, wy + 210], [wx + ww - 10, wy + 210], [900, 2700], [-300, 2700]], '#fff0d0', 0.34, 'phsun', 0.14)}${motes(-700, 500, 700, 2100, 46, 81, t, '#fff6e0', 0.55)}</g>`;
    L.push({ p: 0.88, svg: w });
    // ---- p 1: the checkered tile floor in perspective, the counter, things on it
    let fl = once('phfloor', () => {
      // a true perspective grid: depth z runs 1 (front edge, y 2800) to the back wall; y = vy + (2800 - vy) / z
      let g = `<rect x="-1800" y="${B.FY}" width="4400" height="1300" fill="#d8ceb6"/>`;
      const vx = 560, vy = 760, Y = z => vy + (2800 - vy) / z, zb = (2800 - vy) / (B.FY - vy), dz = 0.075, W2 = 110;
      for (let j = 0, z = 1; z < zb; j++, z += dz) {
        const z2 = Math.min(zb, z + dz), y0 = Y(z), y1 = Y(z2);
        for (let i = -60; i < 60; i++) {
          if ((i + j) % 2) continue;
          const X0 = vx + i * W2, X1 = X0 + W2, a0 = vx + (X0 - vx) / z, a1 = vx + (X1 - vx) / z, b0 = vx + (X0 - vx) / z2, b1 = vx + (X1 - vx) / z2;
          if (Math.max(a0, a1) < -1900 || Math.min(a0, a1) > 2700) continue;
          g += `<path d="M${f(a0)},${f(y0)} L${f(a1)},${f(y0)} L${f(b1)},${f(y1)} L${f(b0)},${f(y1)}Z" fill="#20262a"/>`;
        }
      }
      g += `<rect x="-1800" y="${B.FY}" width="4400" height="1300" fill="#4a3220" opacity="0.22"/><rect x="-1800" y="${B.FY - 26}" width="4400" height="26" fill="#2a160c"/>`;
      return g;
    });
    L.push({ p: 1, svg: fl });
    // ---- foreground: a potted palm at the left edge and the hanging sign bracket (blurred, p 1.3)
    L.push({ p: 1.3, svg: `<g filter="url(#dof1)"><path d="M-760,2700 L-740,2380 L-560,2380 L-540,2700Z" fill="#6a3a22"/>` + Array.from({ length: 7 }, (_, i) => { const a = -150 + i * 22 + Math.sin(t * 0.8 + i) * 3, rad = a * Math.PI / 180; return `<path d="M-650,2390 Q${f(-650 + Math.cos(rad) * 240)},${f(2390 + Math.sin(rad) * 420)} ${f(-650 + Math.cos(rad) * 420)},${f(2390 + Math.sin(rad) * 300)}" stroke="#2a4a2a" stroke-width="26" fill="none" stroke-linecap="round"/>`; }).join('') + `</g>` });
    // ---- night: the shop falls dark beyond the gas pools
    if (nt > 0.01) {
      let dk = darkPool('phdk', 1000, 700, 300, 1700, 0.55 * nt, '#04050c', -2000, 3000);
      dk += `<rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" fill="#3a5a9a" opacity="${f(0.08 * nt)}" style="mix-blend-mode:screen"/>`;
      L.push({ p: 1, light: true, svg: dk });
    }
    return L;
  };
  // the counter, drawn after the pharmacist behind it (and before the customers in front of it). o.jar false leaves
  // out the lozenge jar, o.reg false the register (for a shot that draws it over the pharmacist's arms itself)
  S.counter17 = (t, o = {}) => {
    const [x0, x1, ty, fy] = B.COUNTER;
    const [base, jar] = once('phcounter', () => {
      let s = `<path d="M${x0 + 20},${ty - 80} L${x1 - 20},${ty - 80} L${x1},${ty} L${x0},${ty}Z" fill="#5a2e1a" filter="url(#woodH)" ${olr(1.6)}/><path d="M${x0 + 26},${ty - 72} L${x1 - 26},${ty - 72}" stroke="#8a5030" stroke-width="3" opacity="0.6"/>`;
      s += `<rect x="${x0}" y="${ty}" width="${x1 - x0}" height="30" fill="#4a2414" ${olr(1.5)}/><rect x="${x0}" y="${ty}" width="${x1 - x0}" height="6" fill="#c8a040" opacity="0.8"/><rect x="${x0 + 10}" y="${ty + 30}" width="${x1 - x0 - 20}" height="${fy - ty - 30}" fill="#3a1c10" filter="url(#woodV)" ${olr(1.4)}/>`;
      // the glazed display case in the middle of the front: shelves of soaps, tins, brushes, little boxes
      const gx0 = 560, gx1 = 1360;
      s += `<rect x="${gx0}" y="${ty + 50}" width="${gx1 - gx0}" height="300" fill="#1e1410" ${olr(1.2)}/>`;
      const r = rng(91);
      for (const sy of [ty + 190, ty + 330]) { s += `<rect x="${gx0 + 10}" y="${sy}" width="${gx1 - gx0 - 20}" height="10" fill="#5a3a20"/>`; for (let x = gx0 + 30; x < gx1 - 60;) { const w = 40 + r() * 50, h = 40 + r() * 70, c = ['#e8d8b8', '#8a3a3a', '#3a5a8a', '#c8a040', '#efe6d0', '#5a7a4a'][Math.floor(r() * 6)]; s += `<rect x="${f(x)}" y="${f(sy - h)}" width="${f(w)}" height="${f(h)}" rx="4" fill="${c}" ${olr(1, 0.6)}/>`; x += w + 14; } }
      s += `<rect x="${gx0}" y="${ty + 50}" width="${gx1 - gx0}" height="300" fill="#c8d8e8" opacity="0.1"/><path d="M${gx0 + 60},${ty + 50} L${gx0 + 160},${ty + 350} M${gx0 + 400},${ty + 50} L${gx0 + 470},${ty + 350}" stroke="#fff" stroke-width="16" opacity="0.08"/><rect x="${gx0}" y="${ty + 50}" width="${gx1 - gx0}" height="300" fill="none" stroke="#c8a040" stroke-width="6"/>`;
      for (const [a, b] of [[x0 + 30, gx0 - 30], [gx1 + 30, x1 - 30]]) s += `<rect x="${a}" y="${ty + 70}" width="${b - a}" height="${fy - ty - 120}" fill="none" stroke="#2a120a" stroke-width="8"/><rect x="${a + 20}" y="${ty + 90}" width="${b - a - 40}" height="${fy - ty - 160}" fill="none" stroke="#5a3020" stroke-width="3"/>`;
      s += `<rect x="${x0 - 10}" y="${fy - 30}" width="${x1 - x0 + 20}" height="30" fill="#2a120a"/><path d="M${x0},${fy - 60} L${x1},${fy - 60}" stroke="#c8a040" stroke-width="7"/>`;
      // the mortar and pestle, a tall jar of lozenges, a counter bell
      const [mx, my] = B.MORTAR;
      s += `<path d="M${mx - 60},${my - 70} L${mx + 60},${my - 70} C${mx + 56},${my - 10} ${mx + 30},${my} ${mx},${my} C${mx - 30},${my} ${mx - 56},${my - 10} ${mx - 60},${my - 70}Z" fill="#e8e2d6" ${olr(1.4)}/><ellipse cx="${mx}" cy="${my - 70}" rx="60" ry="12" fill="#b8b0a2"/><path d="M${mx + 10},${my - 80} L${mx + 60},${my - 200}" stroke="#d8d0c2" stroke-width="18" stroke-linecap="round"/>`;
      const jar = `<path d="M${x1 - 420},${ty - 40} L${x1 - 420},${ty - 230} C${x1 - 420},${ty - 260} ${x1 - 330},${ty - 260} ${x1 - 330},${ty - 230} L${x1 - 330},${ty - 40}Z" fill="#dce8ec" opacity="0.4" ${olr(1.2)}/><rect x="${x1 - 426}" y="${ty - 270}" width="102" height="24" rx="6" fill="#c8a040" ${olr(1)}/>` + Array.from({ length: 14 }, () => `<circle cx="${f(x1 - 410 + r() * 70)}" cy="${f(ty - 50 - r() * 150)}" r="11" fill="${['#c83a3a', '#e8c840', '#3a8a5a'][Math.floor(r() * 3)]}" opacity="0.85"/>`).join('');
      return [s, jar];
    });
    let g = base + (o.jar === false ? '' : jar);
    // the balance (tips gently), the register, the pyramid of cartons (o.cartons on it, top first to go)
    g += PR.balance(B.SCALE[0], B.SCALE[1], 0.85, t, o.tip || 0) + (o.reg === false ? '' : PR.register(B.REG[0], B.REG[1], 1.0, {}));
    const n = o.cartons ?? 6, [px, py] = B.PYR;
    const slots = [[-130, 0], [0, 0], [130, 0], [-65, -142], [65, -142], [0, -284]];
    for (let i = 0; i < Math.min(n, 6); i++) g += PR.carton(px + slots[i][0], py + slots[i][1], 0.64);
    return g;
  };

  // ======================================================= THE GLOBE STUDY
  // world: floor 1720; the great wall map 60-1020 (y 240-900), bookcases at the left, the tall window at the right
  // (1180-1520, 200-1320) with velvet curtains, the reading table and its green lamp at 1260; the globe (drawn by the
  // shot) stands in the middle at 540. o.red[7] tints the wall map's continents with the spreading bans.
  S.GS = { FY: 1720, MAP: [60, 240, 960, 660], WIN: [1180, 200, 340, 1120], LAMP: [1300, 1290], GLOBE: [540, 1250, 1.45] };
  S.globeRoom = (t, o = {}) => {
    const B2 = S.GS, L = [], [wx, wy, ww, wh] = B2.WIN;
    L.push({ p: 0.25, svg: once('gsky', () => `<defs>${LG('gssky', [[0, '#060a14'], [1, '#1c2440']])}</defs><rect x="-800" y="-800" width="3200" height="3000" fill="url(#gssky)"/>`) + starsW(900, -200, 1900, 900, 60, 23, t) });
    L.push({ p: 0.45, svg: once('gscity', () => { const r = rng(27); let g = ''; for (let i = 0; i < 16; i++) { const x = 900 + i * 60 + r() * 30, h = 120 + r() * 260; g += `<rect x="${f(x)}" y="${f(1260 - h)}" width="${f(50 + r() * 30)}" height="${f(h + 200)}" fill="#0c101c"/>`; for (let k = 0; k < 4; k++) if (r() < 0.45) g += `<rect x="${f(x + 10 + r() * 30)}" y="${f(1270 - h + 20 + r() * (h - 40))}" width="8" height="10" fill="#ffc870" opacity="${f(0.5 + r() * 0.5)}"/>`; } g += `<path d="M1300,1100 L1300,700 L1330,620 L1360,700 L1360,1100Z" fill="#0a0e18"/><circle cx="1330" cy="760" r="16" fill="#e8dcc0" opacity="0.6"/>`; return g; }) });
    const wall = once('gswall', () => {
      let g = `<defs><clipPath id="gsWin"><path d="M-1400,-500 L2600,-500 L2600,2200 L-1400,2200Z M${wx},${wy + 170} A170,170 0 0 1 ${wx + ww},${wy + 170} L${wx + ww},${wy + wh} L${wx},${wy + wh}Z" clip-rule="evenodd"/></clipPath>` +
        `<pattern id="gsDam" width="120" height="160" patternUnits="userSpaceOnUse"><rect width="120" height="160" fill="#1e3a2e"/><path d="M60,10 C90,40 90,70 60,90 C30,70 30,40 60,10Z M60,90 C80,110 80,140 60,152 C40,140 40,110 60,90Z" fill="#2a4a3a"/><path d="M0,80 C20,60 40,70 30,90 C20,100 6,96 0,80Z M120,80 C100,60 80,70 90,90 C100,100 114,96 120,80Z" fill="#26443a"/></pattern></defs>`;
      g += `<g clip-path="url(#gsWin)"><rect x="-1400" y="-500" width="4000" height="2700" fill="url(#gsDam)"/><rect x="-1400" y="-500" width="4000" height="2700" fill="#000" opacity="0.15" filter="url(#plaster)"/>${beadboard(-1400, 2600, 1200, 2200, '#3a2414')}</g>`;
      g += `<path d="M${wx - 24},${wy + wh} L${wx - 24},${wy + 170} A194,194 0 0 1 ${wx + ww + 24},${wy + 170} L${wx + ww + 24},${wy + wh}" fill="none" stroke="#5a3a20" stroke-width="26"/><path d="M${wx + ww / 2},${wy} L${wx + ww / 2},${wy + wh}" stroke="#4a3018" stroke-width="12"/>` + [0.35, 0.6, 0.85].map(k => `<path d="M${wx},${wy + wh * k} L${wx + ww},${wy + wh * k}" stroke="#4a3018" stroke-width="9"/>`).join('') + `<rect x="${wx - 40}" y="${wy + wh}" width="${ww + 80}" height="28" fill="#6a4a2a" ${olr(1.4)}/>`;
      // the bookcases: tall, full, a ladder of shelves at the left
      const r = rng(33);
      g += `<rect x="-900" y="60" width="900" height="1660" fill="#2a180e" ${olr(1.5)}/>`;
      for (let y = 160; y < 1700; y += 210) { g += `<rect x="-890" y="${y + 180}" width="880" height="20" fill="#4a2e18"/>`; for (let x = -880; x < -30;) { const w = 18 + r() * 26, h = 120 + r() * 56, c = ['#5a1e1e', '#1e2e4a', '#2e3e1e', '#6a4a22', '#3a1e2e', '#4a3a2a'][Math.floor(r() * 6)]; if (r() < 0.08) { g += `<path d="M${f(x)},${y + 180} L${f(x + 40)},${f(y + 180 - h * 0.9)} L${f(x + 40 + w)},${f(y + 180 - h * 0.9)} L${f(x + w)},${y + 180}Z" fill="${c}" ${olr(1, 0.6)}/>`; x += w + 40; continue; } g += `<rect x="${f(x)}" y="${f(y + 180 - h)}" width="${f(w)}" height="${f(h)}" fill="${c}" ${olr(1, 0.6)}/><path d="M${f(x + 3)},${f(y + 196 - h)} L${f(x + w - 3)},${f(y + 196 - h)} M${f(x + 3)},${f(y + 160)} L${f(x + w - 3)},${f(y + 160)}" stroke="#c8a040" stroke-width="2" opacity="0.7"/>`; x += w + 2; } }
      // a marble bust on a column between the map and the window, and a brass barometer
      g += `<rect x="1060" y="900" width="80" height="820" fill="#d8d4cc" ${olr(1.4)}/><rect x="1040" y="880" width="120" height="30" fill="#e4e0d8" ${olr(1.2)}/><path d="M1060,880 C1050,800 1070,760 1100,750 C1130,760 1150,800 1140,880Z" fill="#e8e4dc" ${olr(1.2)}/><circle cx="1100" cy="720" r="40" fill="#ece8e0" ${olr(1.2)}/>`;
      return g;
    });
    // the wall map: parchment, continents in sepia, a compass rose and a ship; the bans stain it red with the globe
    const [mx, my, mw, mh] = B2.MAP;
    const mapArt = once('gsmap', () => {
      let a = `<defs>${LG('gsparch', [[0, '#e8d8b0'], [0.5, '#d8c494'], [1, '#c4ac78']], 1, 1)}</defs><rect x="${mx}" y="${my}" width="${mw}" height="${mh}" fill="url(#gsparch)"/>`;
      for (let i = 0; i < 9; i++) a += `<path d="M${mx},${my + i * mh / 8} L${mx + mw},${my + i * mh / 8}" stroke="#a88a5a" stroke-width="1.5" opacity="0.5"/><path d="M${mx + i * mw / 8},${my} L${mx + i * mw / 8},${my + mh}" stroke="#a88a5a" stroke-width="1.5" opacity="0.5"/>`;
      a += `<g transform="translate(${mx + mw * 0.12},${my + mh * 0.78})"><circle r="44" fill="none" stroke="#7a5a2a" stroke-width="3"/>` + [0, 1, 2, 3].map(k => `<path d="M0,0 L${f(Math.cos(k * Math.PI / 2) * 60)},${f(Math.sin(k * Math.PI / 2) * 60)}" stroke="#7a5a2a" stroke-width="5"/>`).join('') + `</g>`;
      a += `<g transform="translate(${mx + mw * 0.42},${my + mh * 0.62})" fill="#6a4a2a"><path d="M-30,0 L30,0 L22,14 L-22,14Z"/><path d="M0,0 L0,-50 M0,-46 L24,-20 L0,-14Z M0,-40 L-20,-16 L0,-12Z"/></g>`;
      return a;
    });
    // continents on the wall map (an equirectangular sketch, map-local fractions, coastlines smoothed with a closed
    // spline): N.America, Europe, Asia, S.America, Africa, Australia, Greenland
    const MAPC = [
      [[0.05, 0.2], [0.1, 0.13], [0.17, 0.1], [0.24, 0.11], [0.3, 0.15], [0.29, 0.2], [0.26, 0.24], [0.27, 0.3], [0.23, 0.36], [0.21, 0.44], [0.18, 0.47], [0.15, 0.42], [0.11, 0.36], [0.08, 0.3], [0.06, 0.25]],
      [[0.46, 0.2], [0.48, 0.14], [0.52, 0.11], [0.56, 0.13], [0.58, 0.18], [0.56, 0.24], [0.57, 0.3], [0.53, 0.32], [0.5, 0.28], [0.47, 0.3], [0.45, 0.26]],
      [[0.58, 0.15], [0.64, 0.1], [0.72, 0.08], [0.82, 0.09], [0.9, 0.12], [0.93, 0.18], [0.9, 0.24], [0.86, 0.3], [0.88, 0.36], [0.82, 0.42], [0.76, 0.46], [0.72, 0.42], [0.66, 0.4], [0.62, 0.34], [0.58, 0.28]],
      [[0.25, 0.5], [0.29, 0.49], [0.33, 0.53], [0.36, 0.58], [0.34, 0.66], [0.31, 0.74], [0.29, 0.84], [0.27, 0.88], [0.26, 0.8], [0.24, 0.7], [0.23, 0.6]],
      [[0.46, 0.38], [0.5, 0.35], [0.56, 0.36], [0.6, 0.4], [0.63, 0.46], [0.61, 0.54], [0.58, 0.62], [0.56, 0.7], [0.53, 0.73], [0.51, 0.66], [0.49, 0.56], [0.45, 0.5], [0.44, 0.44]],
      [[0.8, 0.66], [0.84, 0.62], [0.88, 0.62], [0.92, 0.66], [0.92, 0.72], [0.88, 0.77], [0.84, 0.76], [0.8, 0.72]],
      [[0.31, 0.06], [0.35, 0.04], [0.39, 0.05], [0.38, 0.09], [0.35, 0.12], [0.32, 0.1]]];
    const spline = pts => { const P = pts.map(([u, v]) => [mx + u * mw, my + v * mh]), n = P.length; let d = `M${f(P[0][0])},${f(P[0][1])}`; for (let i = 0; i < n; i++) { const p0 = P[(i - 1 + n) % n], p1 = P[i], p2 = P[(i + 1) % n], p3 = P[(i + 2) % n]; d += ` C${f(p1[0] + (p2[0] - p0[0]) / 6)},${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)},${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])},${f(p2[1])}`; } return d + 'Z'; };
    const red = o.red || [];
    let mapL = mapArt;
    MAPC.forEach((pts, i) => { const d = spline(pts); mapL += `<path d="${d}" fill="#b89a62" stroke="#6a4a22" stroke-width="2.5" stroke-linejoin="round"/>`; if ((red[i] || 0) > 0.01) mapL += `<path d="${d}" fill="#9a1a16" opacity="${f(0.85 * red[i])}" stroke="#6a0a08" stroke-width="2"/>`; });
    let w = wall + frame(mx, my, mw, mh, mapL, { b: 28, c1: '#b8903e', c2: '#3a2410' });
    // curtains at the window (deep red velvet, tied back, stirring)
    for (const s2 of [-1, 1]) { const xa = s2 < 0 ? wx - 80 : wx + ww + 80, sw = Math.sin(t * 0.7 + s2) * 5; w += `<path d="M${xa},${wy - 60} L${f(xa - s2 * 150)},${wy - 60} C${f(xa - s2 * (110 + sw))},${wy + 400} ${f(xa - s2 * 60)},${wy + 640} ${f(xa - s2 * 80)},${wy + 740} C${f(xa - s2 * 120)},${wy + 900} ${f(xa - s2 * 110)},${wy + wh} ${f(xa - s2 * 130)},${wy + wh + 120} L${xa},${wy + wh + 120}Z" fill="#6a1418" ${olr(1.4)}/>` + [40, 80, 115].map(dd => `<path d="M${xa - s2 * dd},${wy - 50} C${xa - s2 * (dd - 10)},${wy + 500} ${xa - s2 * (dd - 30)},${wy + 900} ${xa - s2 * (dd - 20)},${wy + wh + 110}" stroke="#3a080a" stroke-width="12" fill="none" opacity="0.5"/>`).join('') + `<rect x="${xa - s2 * 80 - 20}" y="${wy + 730}" width="40" height="22" fill="#c8a040"/>`; }
    L.push({ p: 0.85, svg: w });
    // ---- floor: parquet and a Persian rug; the reading table with its green-shaded lamp; a wingback chair
    let fl = once('gsfloor', () => {
      let g = boards(-1400, 2600, B2.FY, 2800, 540, 600, '#4a2a16', 17, 120) + `<rect x="-1400" y="${B2.FY - 26}" width="4000" height="26" fill="#2a160a"/>`;
      g += `<ellipse cx="540" cy="2030" rx="760" ry="200" fill="#6a1a1e"/><ellipse cx="540" cy="2030" rx="700" ry="176" fill="none" stroke="#c8a050" stroke-width="10"/><ellipse cx="540" cy="2030" rx="600" ry="140" fill="#1e2a4a"/><ellipse cx="540" cy="2030" rx="520" ry="116" fill="none" stroke="#c8a050" stroke-width="6" stroke-dasharray="20 14"/><ellipse cx="540" cy="2030" rx="300" ry="64" fill="#8a2a22"/>`;
      g += `<rect x="1150" y="1500" width="330" height="22" fill="#4a2a14" ${olr(1.4)}/><path d="M1170,1522 L1180,1900 M1460,1522 L1450,1900" stroke="#3a2010" stroke-width="16"/>` + Array.from({ length: 4 }, (_, i) => `<rect x="${1180 + i * 8}" y="${1500 - 24 - i * 24}" width="${180 - i * 14}" height="24" fill="${['#5a1e1e', '#1e2e4a', '#6a4a22', '#2e3e1e'][i]}" ${olr(1, 0.6)}/>`).join('');
      g += `<path d="M-380,1960 L-380,1300 C-380,1180 -60,1180 -60,1300 L-60,1960Z" fill="#5a2a1a" ${olr(1.6)}/><path d="M-430,1960 L-430,1560 C-430,1500 -330,1500 -330,1560 L-330,1960Z M-110,1960 L-110,1560 C-110,1500 -10,1500 -10,1560 L-10,1960Z" fill="#6a321e" ${olr(1.4)}/><rect x="-380" y="1640" width="320" height="60" fill="#4a2214"/>`;
      return g;
    });
    // the green-shaded lamp on the table (lit), its pool and motes
    const [lx, ly] = B2.LAMP;
    let lamp = `<rect x="${lx - 8}" y="${ly - 150}" width="16" height="150" fill="#b8902e" ${olr(1)}/><ellipse cx="${lx}" cy="${ly}" rx="46" ry="12" fill="#b8902e" ${olr(1)}/><path d="M${lx - 90},${ly - 140} C${lx - 80},${ly - 200} ${lx + 80},${ly - 200} ${lx + 90},${ly - 140}Z" fill="#1e5a3a" ${olr(1.4)}/><path d="M${lx - 90},${ly - 140} L${lx + 90},${ly - 140}" stroke="#fff4c8" stroke-width="6" opacity="0.8"/>`;
    lamp += C.radial(lx, ly - 120, 600, '#ffcf80', 0.32, 'screen') + motes(200, 700, 1500, 1700, 34, 37, t, '#fff0d0', 0.45);
    L.push({ p: 1, svg: fl + lamp });
    // ---- foreground: books stacked at the bottom left, a curtain's edge at the right (blurred)
    L.push({ p: 1.32, svg: `<g filter="url(#dof1)"><rect x="-500" y="2240" width="480" height="70" fill="#5a1e1e"/><rect x="-470" y="2180" width="420" height="64" fill="#1e2e4a"/><rect x="-440" y="2122" width="380" height="60" fill="#6a4a22"/><path d="M1640,-600 L1900,-600 L1900,2800 L1700,2800 C1660,1800 1700,800 1640,-600Z" fill="#4a0e10"/></g>` });
    // darkness away from the lamp
    L.push({ p: 1, light: true, svg: darkPool('gsdk', lx - 300, ly - 300, 500, 1900, 0.5, '#04050a', -2000, 3200) });
    return L;
  };

  // ======================================================= THE MEDICAL SOCIETY'S READING ROOM (night)
  // world: floor 1660; the fireplace at the left (-460..120) with a portrait over it, the anatomical chart (1180-1460),
  // the bookcase behind the table, a rain-streaked window at the right (1560-1860); the long table (drawn after the
  // doctors behind it) -120..1360, top 1520: green baize, journals, a ledger, an inkwell, a microscope, the lamp at 980.
  S.DR = { FY: 1660, TABLE: [-120, 1360, 1520, 2010], LAMP: [980, 1470], BOTTLE: [560, 1478], FIRE: [-170, 1500], WIN: [1560, 300, 300, 820] };
  S.docRoom = (t, o = {}) => {
    const B3 = S.DR, L = [], [wx, wy, ww, wh] = B3.WIN;
    L.push({ p: 0.3, svg: `<rect x="1300" y="0" width="900" height="1400" fill="#0a0e1a"/>` + rainGlass(wx, wy, ww, wh, t, 1, 101) });
    const wall = once('drwall', () => {
      let g = `<defs><clipPath id="drWin"><path d="M-1400,-500 L2600,-500 L2600,2200 L-1400,2200Z M${wx},${wy} L${wx + ww},${wy} L${wx + ww},${wy + wh} L${wx},${wy + wh}Z" clip-rule="evenodd"/></clipPath>` +
        `<pattern id="drDam" width="110" height="150" patternUnits="userSpaceOnUse"><rect width="110" height="150" fill="#4a1414"/><path d="M55,8 C84,36 84,66 55,86 C26,66 26,36 55,8Z M55,86 C74,104 74,132 55,144 C36,132 36,104 55,86Z" fill="#5a1c1a"/><circle cx="0" cy="75" r="14" fill="#521818"/><circle cx="110" cy="75" r="14" fill="#521818"/></pattern></defs>`;
      g += `<g clip-path="url(#drWin)"><rect x="-1400" y="-500" width="4000" height="2700" fill="url(#drDam)"/><rect x="-1400" y="-500" width="4000" height="2700" fill="#000" opacity="0.2" filter="url(#plaster)"/>` +
        `<rect x="-1400" y="1180" width="4000" height="1000" fill="#2e1a0e" filter="url(#woodV)"/>` + Array.from({ length: 26 }, (_, i) => `<rect x="${-1380 + i * 160}" y="1220" width="130" height="400" rx="6" fill="#26140a" ${olr(1.2, 0.5)}/>`).join('') + `<rect x="-1400" y="1170" width="4000" height="20" fill="#4a2a16"/></g>`;
      g += `<rect x="${wx - 26}" y="${wy - 26}" width="${ww + 52}" height="${wh + 52}" fill="none" stroke="#3a2010" stroke-width="26"/><path d="M${wx + ww / 2},${wy} L${wx + ww / 2},${wy + wh} M${wx},${wy + wh / 2} L${wx + ww},${wy + wh / 2}" stroke="#3a2010" stroke-width="12"/>`;
      // the fireplace: marble surround, iron grate, mantel with a clock and candlesticks; a portrait above
      const [fx] = B3.FIRE;
      g += `<rect x="${fx - 300}" y="1080" width="600" height="${B3.FY - 1080}" fill="#d8d0c4" ${olr(1.6)}/><rect x="${fx - 330}" y="1050" width="660" height="40" fill="#e8e2d8" ${olr(1.4)}/><path d="M${fx - 200},${B3.FY} L${fx - 200},1260 C${fx - 200},1180 ${fx + 200},1180 ${fx + 200},1260 L${fx + 200},${B3.FY}Z" fill="#0c0806"/>`;
      g += `<path d="M${fx - 40},1050 L${fx - 46},960 C${fx - 46},900 ${fx + 46},900 ${fx + 46},960 L${fx + 40},1050Z" fill="#2a1a10" ${olr(1.2)}/><circle cx="${fx}" cy="960" r="30" fill="#efe8d8"/><path d="M${fx},960 L${fx},940 M${fx},960 L${fx + 14},966" stroke="#1a1410" stroke-width="3"/>` + [fx - 240, fx + 240].map(x => `<path d="M${x - 20},1050 L${x + 20},1050 L${x + 8},1000 L${x - 8},1000Z M${x - 4},1000 L${x - 4},900 L${x + 4},900 L${x + 4},1000Z" fill="#c8a040"/>`).join('');
      // the founder's portrait: a stern bearded physician in black against brown, gilt frame
      let por = `<rect x="${fx - 190}" y="420" width="380" height="460" fill="#2a1e14"/><path d="M${fx - 150},880 C${fx - 150},720 ${fx - 90},660 ${fx},650 C${fx + 90},660 ${fx + 150},720 ${fx + 150},880Z" fill="#0e0c0c"/><path d="M${fx - 30},690 L${fx},760 L${fx + 30},690Z" fill="#e8e0d0"/><ellipse cx="${fx}" cy="580" rx="64" ry="80" fill="#c8a080"/><path d="M${fx - 64},600 C${fx - 60},700 ${fx + 60},700 ${fx + 64},600 C${fx + 40},640 ${fx - 40},640 ${fx - 64},600Z" fill="#8a8680"/><path d="M${fx - 66},560 C${fx - 70},490 ${fx + 70},490 ${fx + 66},560 C${fx + 50},520 ${fx - 50},520 ${fx - 66},560Z" fill="#6a6660"/>`;
      g += frame(fx - 190, 420, 380, 460, por, { b: 30 });
      // the anatomical chart on rollers: a figure with arteries and veins (no lettering)
      let ch = `<rect x="1180" y="320" width="280" height="700" fill="#e8dcc0"/><circle cx="1320" cy="400" r="34" fill="none" stroke="#6a4a2a" stroke-width="4"/><path d="M1320,434 L1320,700 M1320,470 L1250,600 M1320,470 L1390,600 M1320,700 L1270,960 M1320,700 L1370,960" stroke="#6a4a2a" stroke-width="10" stroke-linecap="round"/>` +
        `<path d="M1316,460 C1300,520 1290,600 1300,680 M1316,500 L1260,590 M1300,680 L1280,940" stroke="#b8221e" stroke-width="4" fill="none"/><path d="M1324,460 C1340,520 1350,600 1340,680 M1324,500 L1380,590 M1340,680 L1362,940" stroke="#2a4a9a" stroke-width="4" fill="none"/><ellipse cx="1320" cy="520" rx="26" ry="30" fill="#c83a32" opacity="0.6"/>`;
      g += `<rect x="1170" y="300" width="300" height="24" rx="10" fill="#4a2a14"/><rect x="1170" y="1018" width="300" height="24" rx="10" fill="#4a2a14"/>` + ch;
      // the bookcase behind the table and two framed diplomas
      const r = rng(111);
      g += `<rect x="320" y="200" width="780" height="980" fill="#24140a" ${olr(1.5)}/>`;
      for (let y = 260; y < 1150; y += 200) { g += `<rect x="330" y="${y + 170}" width="760" height="18" fill="#4a2a16"/>`; for (let x = 340; x < 1070;) { const w = 20 + r() * 24, h = 110 + r() * 56; g += `<rect x="${f(x)}" y="${f(y + 170 - h)}" width="${f(w)}" height="${f(h)}" fill="${['#4a1414', '#14243a', '#2a3418', '#4a3418', '#2a1424'][Math.floor(r() * 5)]}" ${olr(1, 0.6)}/><path d="M${f(x + 3)},${f(y + 186 - h)} L${f(x + w - 3)},${f(y + 186 - h)}" stroke="#c8a040" stroke-width="2" opacity="0.6"/>`; x += w + 2; } }
      for (const [x, y] of [[180, 480], [180, 760]]) g += frame(x - 70, y - 50, 140, 100, `<rect x="${x - 70}" y="${y - 50}" width="140" height="100" fill="#f0e8d4"/><path d="M${x - 50},${y - 26} L${x + 50},${y - 26} M${x - 50},${y - 6} L${x + 40},${y - 6} M${x - 50},${y + 14} L${x + 30},${y + 14}" stroke="#8a7a5a" stroke-width="3"/><circle cx="${x + 40}" cy="${y + 30}" r="12" fill="#a8221e"/>`, { b: 10, c1: '#b8903e', c2: '#3a2410' });
      return g;
    });
    let w = wall + S.flames(B3.FIRE[0], B3.FY - 10, 300, 170, t, 121, 0.8) + C.radial(B3.FIRE[0], B3.FY - 120, 600, '#ff8a3a', 0.3, 'screen');
    // gas wall brackets either side of the bookcase
    for (const [x, ph] of [[270, 0], [1150, 1.7]]) w += `<path d="M${x},760 L${x},800 C${x},820 ${x + 30},820 ${x + 40},820" stroke="#8a6a2a" stroke-width="7" fill="none"/>` + pendant(x + 40, 800, 860, 0.8, t, 1, ph);
    L.push({ p: 0.86, svg: w });
    // the skeleton on its stand in the corner (p 0.95), lit by the fire
    L.push({ p: 0.95, svg: once('drskel', () => {
      const x = -640, y = 1700;
      let g = `<path d="M${x},${y} L${x},${y - 1100} M${x - 120},${y} L${x + 120},${y}" stroke="#2a2a2e" stroke-width="12"/><circle cx="${x}" cy="${y - 1160}" r="56" fill="#e8e0cc" ${olr(1.4)}/><circle cx="${x - 20}" cy="${y - 1166}" r="14" fill="#1a1410"/><circle cx="${x + 20}" cy="${y - 1166}" r="14" fill="#1a1410"/><path d="M${x - 24},${y - 1120} L${x + 24},${y - 1120}" stroke="#1a1410" stroke-width="4" stroke-dasharray="5 3"/><path d="M${x},${y - 1100} L${x},${y - 640}" stroke="#e0d8c4" stroke-width="14" stroke-dasharray="14 4"/>`;
      for (let i = 0; i < 6; i++) g += `<path d="M${x},${y - 1040 + i * 44} C${x - 110 + i * 6},${y - 1060 + i * 44} ${x - 110 + i * 8},${y - 990 + i * 44} ${x - 20},${y - 1000 + i * 44} M${x},${y - 1040 + i * 44} C${x + 110 - i * 6},${y - 1060 + i * 44} ${x + 110 - i * 8},${y - 990 + i * 44} ${x + 20},${y - 1000 + i * 44}" stroke="#e0d8c4" stroke-width="7" fill="none"/>`;
      g += `<path d="M${x - 90},${y - 640} C${x - 100},${y - 560} ${x + 100},${y - 560} ${x + 90},${y - 640} C${x + 40},${y - 600} ${x - 40},${y - 600} ${x - 90},${y - 640}Z" fill="#e0d8c4"/><path d="M${x - 120},${y - 1060} L${x - 160},${y - 760} L${x - 150},${y - 480} M${x + 120},${y - 1060} L${x + 160},${y - 760} L${x + 150},${y - 480} M${x - 50},${y - 590} L${x - 70},${y - 300} L${x - 60},${y - 20} M${x + 50},${y - 590} L${x + 70},${y - 300} L${x + 60},${y - 20}" stroke="#e0d8c4" stroke-width="12" fill="none" stroke-linecap="round"/>`;
      return g;
    }) });
    // ---- floor: dark boards and a rug
    L.push({ p: 1, svg: once('drfloor', () => boards(-1400, 2600, B3.FY, 2800, 560, 600, '#3a2212', 19, 120) + `<rect x="-1400" y="${B3.FY - 26}" width="4000" height="26" fill="#1e1008"/><path d="M-300,2060 L1500,2060 L1700,2500 L-500,2500Z" fill="#4a1a1a"/><path d="M-260,2080 L1460,2080 L1650,2480 L-450,2480Z" fill="none" stroke="#a88a4a" stroke-width="8"/>`) });
    // ---- foreground: the back of a leather chair at the bottom right (blurred)
    L.push({ p: 1.3, svg: `<g filter="url(#dof1)"><path d="M1100,2900 L1100,2300 C1100,2180 1600,2180 1600,2300 L1600,2900Z" fill="#3a1a10"/>` + [1160, 1260, 1360, 1460, 1540].map(x => `<circle cx="${x}" cy="2330" r="9" fill="#c8a040" opacity="0.7"/>`).join('') + `</g>` });
    // darkness away from the lamp and the fire
    const [lx, ly] = B3.LAMP;
    L.push({ p: 1, light: true, svg: darkPool('drdk', lx - 360, ly - 260, 420, 1800, 0.55, '#04050a', -2000, 3200) + C.radial(lx, ly - 70, 520, '#ffd890', 0.26, 'screen') });
    return L;
  };
  // the reading-room table (drawn after the doctors standing behind it): baize top, brass edge, journals, ledger,
  // inkwell, microscope, a folded newspaper (o.paper: its fold opening 0..1), the green banker's lamp
  S.docTable17 = (t, o = {}) => {
    const [x0, x1, ty, fy] = S.DR.TABLE, dep = 110;
    let g = once('drtable', () => {
      let s = `<path d="M${x0 + 30},${ty - dep} L${x1 - 30},${ty - dep} L${x1},${ty} L${x0},${ty}Z" fill="#1e4a32" ${olr(1.6)}/><path d="M${x0 + 30},${ty - dep} L${x1 - 30},${ty - dep}" stroke="#c8a040" stroke-width="4"/><rect x="${x0}" y="${ty}" width="${x1 - x0}" height="40" fill="#3a1e0e" filter="url(#woodH)" ${olr(1.5)}/><rect x="${x0}" y="${ty}" width="${x1 - x0}" height="6" fill="#c8a040" opacity="0.8"/>`;
      s += `<rect x="${x0 + 20}" y="${ty + 40}" width="${x1 - x0 - 40}" height="80" fill="#2a1408" ${olr(1.2)}/>` + [x0 + 60, x1 - 60].map(x => `<path d="M${x - 26},${ty + 120} L${x + 26},${ty + 120} L${x + 18},${ty + 200} C${x + 34},${ty + 240} ${x + 30},${ty + 290} ${x + 16},${ty + 320} L${x + 12},${fy} L${x - 12},${fy} L${x - 16},${ty + 320} C${x - 30},${ty + 290} ${x - 34},${ty + 240} ${x - 18},${ty + 200}Z" fill="#2a1408" ${olr(1.4)}/>`).join('');
      // stacked journals, an open ledger with ruled lines, the inkwell and pen
      s += [0, 1, 2, 3].map(i => `<rect x="${x0 + 60 + i * 4}" y="${ty - 60 - i * 26}" width="${200 - i * 10}" height="26" fill="${['#5a1e1e', '#1e2e4a', '#4a3a22', '#2e3e1e'][i]}" ${olr(1, 0.7)}/>`).join('');
      s += `<path d="M${x0 + 330},${ty - 30} L${x0 + 470},${ty - 50} L${x0 + 610},${ty - 30} L${x0 + 610},${ty - 18} L${x0 + 470},${ty - 36} L${x0 + 330},${ty - 18}Z" fill="#f2ecdc" ${olr(1)}/>` + [0, 1, 2].map(i => `<path d="M${x0 + 350},${ty - 30 + i * 4} L${x0 + 460},${ty - 46 + i * 4} M${x0 + 480},${ty - 46 + i * 4} L${x0 + 590},${ty - 30 + i * 4}" stroke="#9a8e78" stroke-width="1.5"/>`).join('');
      s += `<rect x="${x1 - 520}" y="${ty - 56}" width="50" height="40" rx="8" fill="#1a1612" ${olr(1)}/><path d="M${x1 - 500},${ty - 56} L${x1 - 450},${ty - 150}" stroke="#2a2a2e" stroke-width="5"/>`;
      // the brass microscope
      s += `<g transform="translate(${x1 - 210},${ty - 30})"><path d="M-50,0 L50,0 L40,-20 L-40,-20Z" fill="#b8902e" ${olr(1)}/><path d="M-10,-20 C-30,-80 -10,-140 20,-170 L34,-156 C10,-130 0,-80 10,-20Z" fill="#b8902e" ${olr(1)}/><rect x="10" y="-250" width="26" height="110" rx="6" fill="#c8a040" transform="rotate(-18 23 -195)" ${olr(1)}/><rect x="-30" y="-74" width="70" height="10" fill="#2a2a2e"/></g>`;
      return s;
    });
    // the folded newspaper the young doctor holds is in his hands; on the table, scattered reports
    g += `<path d="M${x0 + 720},${ty - 70} L${x0 + 880},${ty - 76} L${x0 + 900},${ty - 24} L${x0 + 730},${ty - 18}Z" fill="#ece6d6" ${olr(1)}/>` + [0, 1, 2, 3].map(i => `<path d="M${x0 + 745},${ty - 62 + i * 10} L${x0 + 880},${ty - 66 + i * 10}" stroke="#8a8270" stroke-width="2"/>`).join('');
    const [lx, ly] = S.DR.LAMP;
    g += `<rect x="${lx - 8}" y="${ly - 170}" width="16" height="170" fill="#b8902e" ${olr(1)}/><ellipse cx="${lx}" cy="${ly}" rx="50" ry="13" fill="#b8902e" ${olr(1)}/><path d="M${lx - 110},${ly - 160} C${lx - 96},${ly - 228} ${lx + 96},${ly - 228} ${lx + 110},${ly - 160}Z" fill="#1e5a3a" ${olr(1.4)}/><path d="M${lx - 110},${ly - 160} L${lx + 110},${ly - 160}" stroke="#fff4c8" stroke-width="7" opacity="0.85"/>`;
    g += `<path d="M${lx - 120},${ly - 156} L${lx + 120},${ly - 156} L${lx + 300},${ty} L${lx - 300},${ty}Z" fill="#fff0c8" opacity="0.12"/>`;
    return g;
  };
})(window);
