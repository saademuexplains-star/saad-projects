// Sets for "The Heroin Bottle" part 1: your home around 1900, seen as a cut-away. The kitchen (the iron range, the
// shelf where the bottle stands, the table under the window, the oil lamp) and your daughter's bedroom (the iron bed,
// a guardian-angel print, the calendar, the lace window) stand side by side; the wall between them is cut through, so
// the camera can travel from one room into the other. Night by default; o.day 0..1 brings daylight into the kitchen.
(function (G) {
  const S = G.SETS, { f, shade, mix, rng } = G.RIG, C = G.CINE, PR = G.PROPS;
  const lerp = (a, b, t) => a + (b - a) * t, cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const TAU = Math.PI * 2;
  const OUTC = '#140c06';
  const olr = (w = 2, op = 0.7) => `stroke="${OUTC}" stroke-width="${w}" stroke-opacity="${op}" stroke-linejoin="round"`;
  const cache = {}, once = (k, fn) => cache[k] || (cache[k] = fn());
  const LG = (id, stops, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('')}</linearGradient>`;

  // ---------------- shared pieces (also used by sets17b.js)
  // floor boards in perspective: joints run toward the vanishing point (vx, vy); butt joints staggered; worn tone bands
  const boards = (x0, x1, y0, y1, vx, vy, col, seed, step = 150) => {
    const r = rng(seed); let g = `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="${col}" filter="url(#woodH)"/>`;
    const k = (y0 - vy) / (y1 - vy);
    for (let X = x0 - 1600; X <= x1 + 1600; X += step) {
      const xa = vx + (X - vx) * k;
      g += `<path d="M${f(xa)},${y0} L${f(X)},${y1}" stroke="${shade(col, -0.42)}" stroke-width="3"/><path d="M${f(xa + 4)},${y0} L${f(X + 6)},${y1}" stroke="${shade(col, 0.2)}" stroke-width="1.5" opacity="0.4"/>`;
      if (r() < 0.6) { const u = 0.15 + r() * 0.75, yy = y0 + (y1 - y0) * u * u, xl = lerp(xa, X, (yy - y0) / (y1 - y0)), w = step * lerp(k, 1, (yy - y0) / (y1 - y0)); g += `<path d="M${f(xl)},${f(yy)} L${f(xl + w)},${f(yy)}" stroke="${shade(col, -0.4)}" stroke-width="2.5"/>`; }
    }
    for (let i = 0; i < 9; i++) { const u = r(), yy = y0 + (y1 - y0) * u; g += `<rect x="${x0}" y="${f(yy)}" width="${x1 - x0}" height="${f(6 + r() * 30)}" fill="${r() < 0.5 ? '#000' : '#fff'}" opacity="0.035"/>`; }
    return g;
  };
  // tongue-and-groove wainscot with a moulded cap rail
  const beadboard = (x0, x1, y0, y1, col) => {
    let g = `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="${col}"/>`;
    for (let x = x0; x < x1; x += 34) g += `<path d="M${x},${y0 + 20} L${x},${y1}" stroke="${shade(col, -0.38)}" stroke-width="2.5"/><path d="M${x + 3},${y0 + 20} L${x + 3},${y1}" stroke="${shade(col, 0.18)}" stroke-width="1.5" opacity="0.6"/>`;
    g += `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="22" fill="${shade(col, -0.1)}"/><rect x="${x0}" y="${y0}" width="${x1 - x0}" height="5" fill="${shade(col, 0.25)}"/><rect x="${x0}" y="${y0 + 22}" width="${x1 - x0}" height="6" fill="#000" opacity="0.25"/>`;
    return g;
  };
  // a gilt (or dark wood) picture frame around inner art; (x, y) top left
  const frame = (x, y, w, h, inner, o = {}) => {
    const b = o.b ?? 22, c1 = o.c1 || '#a8843a', c2 = o.c2 || '#5a3e14';
    return `<rect x="${x - b}" y="${y - b}" width="${w + 2 * b}" height="${h + 2 * b}" fill="${c2}" ${olr(1.5)}/><rect x="${x - b + 5}" y="${y - b + 5}" width="${w + 2 * b - 10}" height="${h + 2 * b - 10}" fill="none" stroke="${c1}" stroke-width="7"/><rect x="${x - 4}" y="${y - 4}" width="${w + 8}" height="${h + 8}" fill="none" stroke="${shade(c1, 0.3)}" stroke-width="2"/>` +
      `<g>${inner}</g><path d="M${x - b},${y + h + b} L${x + w + b},${y + h + b}" stroke="#000" stroke-width="10" opacity="0.25"/>`;
  };
  // stars that twinkle (window skies)
  const starsW = (x0, y0, x1, y1, n, seed, t) => { const r = rng(seed); let g = ''; for (let i = 0; i < n; i++) { const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), b = r(), tw = 0.55 + 0.45 * Math.sin(t * (1.2 + r() * 2) + r() * 6); g += `<circle cx="${f(x)}" cy="${f(y)}" r="${b > 0.93 ? 2.6 : 1.4}" fill="#eef2ff" opacity="${f(tw * (0.35 + 0.65 * b))}"/>`; } return g; };
  // dust motes drifting in a light shaft (anchored seeds: no re-seeding while the camera moves)
  const motes = (x0, y0, x1, y1, n, seed, t, col = '#fff2d8', op = 0.5) => {
    const r = rng(seed); let g = '';
    for (let i = 0; i < n; i++) {
      const bx = x0 + r() * (x1 - x0), by = y0 + r() * (y1 - y0), vx = (r() - 0.5) * 14, vy = -4 - r() * 10, ph = r() * TAU, rr = 1 + r() * 2.6;
      const x = bx + vx * t + Math.sin(t * 0.7 + ph) * 18, h = y1 - y0, y = y0 + ((((by - y0) + vy * t) % h) + h) % h;
      g += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(rr)}" fill="${col}" opacity="${f(op * (0.4 + 0.6 * Math.sin(t * 1.3 + ph) ** 2))}"/>`;
    }
    return g;
  };
  // a soft light shaft (polygon) from a window, fading toward its far end; fadeIn (0..1 of its height) also fades it in
  // from nothing at its top, so no hard edge shows where it leaves the glass
  const shaft = (pts, col, op, id, fadeIn = 0) => `<defs>${LG(id, fadeIn > 0 ? [[0, col, 0], [fadeIn, col, op], [1, col, 0]] : [[0, col, op], [1, col, 0]])}</defs><path d="M${pts.map(p => p.map(f).join(',')).join(' L')}Z" fill="url(#${id})" style="mix-blend-mode:screen"/>`;
  // darkness with a pool of light around (cx, cy): clear inside r0, op at r1 and beyond; x0..x1 limits it to one room
  const darkPool = (id, cx, cy, r0, r1, op, col, x0, x1) => `<defs><radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${f(cx)}" cy="${f(cy)}" r="${f(r1)}"><stop offset="${f(r0 / r1)}" stop-color="${col}" stop-opacity="0"/><stop offset="0.62" stop-color="${col}" stop-opacity="${f(op * 0.72)}"/><stop offset="1" stop-color="${col}" stop-opacity="${f(op)}"/></radialGradient></defs><rect x="${f(x0)}" y="-2400" width="${f(x1 - x0)}" height="6400" fill="url(#${id})"/>`;
  S.H17 = { boards, beadboard, frame, starsW, motes, shaft, darkPool, LG, olr };

  // ======================================================= THE HOME (world at p 1)
  // floor line 1640, the walls' top 150 (a cut ceiling slab above), the cut partition 1250-1420 (the wall layers meet
  // at 1330 behind it). Kitchen: range -1010..-430, clock, the shelf 40-600 at 1000 with the bottle at 250, the window
  // 600-940 (y 600-1160), the plate rack, the table 170-1110 (top 1450, feet 1960) with the lamp at 980.
  // Bedroom: the bed 1960-2520 (pillows 1330, quilt line 1450, footboard top 1690), the angel print above it, the
  // nightstand at 1590 (top 1560) with the candle, the calendar above it, the chair at 1830, the window 2640-2940.
  const B = S.HM = {
    FY: 1640, CEIL: 150, PX: [1250, 1420], SPLIT: 1335,
    KWIN: [600, 600, 340, 560], SHELF: [40, 600, 1000], BOTTLE: [250, 1000], RANGE: [-1010, -430, 1160, 1700],
    TABLE: [170, 1110, 1450, 1960], LAMP: [980, 1404], CLOCK: [-210, 520], RACK: [990, 1210],
    BWIN: [2640, 400, 300, 560], BED: [1960, 2520], PILLOW: 1330, QUILT: 1450, FOOT: 1690, ANGEL: [2240, 640],
    CAL: [1590, 840], NS: [1590, 1560], CANDLE: [1530, 1556], CHAIR: [1830, 1470], KIDX: 2240,
  };
  B.LAMPFLAME = [B.LAMP[0], B.LAMP[1] - PR.OILLAMP_FLAME * 0.95 + 10];
  B.CANDLEFLAME = [B.CANDLE[0], B.CANDLE[1] - 150];

  // ---------------- outside the windows
  // the kitchen window looks over the yard to the back of the next street: roofs, chimneys with smoke, a lit window,
  // a gas lamp glow; o.day turns it to daylight. The bedroom window has the moon and the branch of a bare tree.
  const outsideSky = (t, day) => {
    const top = mix('#060a16', '#8aa8c8', day), bot = mix('#1a2440', '#e4e2d8', day);
    let g = `<defs>${LG('hmsky', [[0, top], [1, bot]])}</defs><rect x="-1600" y="-1200" width="6400" height="3000" fill="url(#hmsky)"/>`;
    if (day < 0.6) g += `<g opacity="${f(1 - day / 0.6)}">${starsW(100, -200, 1400, 1100, 70, 5, t)}${starsW(2200, -200, 3600, 1100, 80, 6, t)}</g>`;
    // the moon over the bedroom window, and thin clouds crossing it
    const mx = 2840, my = 520;
    g += `<g opacity="${f(1 - day)}">${C.radial(mx, my, 300, '#c8d4f0', 0.28, 'screen')}<circle cx="${mx}" cy="${my}" r="62" fill="#eef0f2"/><circle cx="${mx - 18}" cy="${my - 12}" r="13" fill="#d4d8de"/><circle cx="${mx + 20}" cy="${my + 16}" r="10" fill="#d8dce2"/><circle cx="${mx + 14}" cy="${my - 26}" r="6" fill="#dadde3"/></g>`;
    for (let i = 0; i < 4; i++) { const x = 2300 + ((t * (14 + i * 5) + i * 330) % 1100), y = 420 + i * 70; g += `<path d="M${f(x)},${y} C${f(x + 60)},${y - 26} ${f(x + 160)},${y - 30} ${f(x + 230)},${y - 4} C${f(x + 280)},${y - 18} ${f(x + 340)},${y - 6} ${f(x + 360)},${y + 8}Z" fill="${mix('#1c2440', '#f4f2ee', day)}" opacity="0.75"/><path d="M${f(x + 40)},${y - 12} C${f(x + 100)},${y - 30} ${f(x + 170)},${y - 30} ${f(x + 220)},${y - 8}" stroke="#9aa8c8" stroke-width="3" fill="none" opacity="${f(0.4 * (1 - day))}"/>`; }
    return g;
  };
  const outsideFar = (t, day) => {
    const roofs = once('hmroofs', () => {
      const r = rng(31); let g = '';
      for (let i = 0; i < 9; i++) {
        const x = 330 + i * 110 + r() * 40, w = 90 + r() * 90, y = 1000 + r() * 80, h = 50 + r() * 60;
        g += `<path d="M${f(x)},${f(y)} L${f(x + w / 2)},${f(y - h)} L${f(x + w)},${f(y)} L${f(x + w)},1400 L${f(x)},1400Z" fill="#141826" data-k="r"/>`;
        if (r() < 0.7) g += `<rect x="${f(x + w * 0.2)}" y="${f(y - h - 40)}" width="22" height="60" fill="#10131e"/><rect x="${f(x + w * 0.2 - 4)}" y="${f(y - h - 46)}" width="30" height="10" fill="#10131e"/>`;
      }
      return g;
    });
    let g = `<g opacity="${f(1 - day)}">${roofs}</g><g opacity="${f(day)}">${roofs.replace(/#141826/g, '#7a7068').replace(/#10131e/g, '#5a4e48')}</g>`;
    // lit windows in the roofs opposite and a gas lamp's glow below
    if (day < 0.8) g += `<g opacity="${f(1 - day / 0.8)}"><rect x="520" y="1090" width="18" height="24" fill="#ffc870"/><rect x="760" y="1060" width="16" height="22" fill="#ffb860" opacity="${f(0.7 + 0.3 * Math.sin(t * 0.9))}"/><rect x="930" y="1110" width="18" height="22" fill="#ffd080"/>${C.radial(700, 1180, 260, '#ffb860', 0.35, 'screen')}</g>`;
    // chimney smoke drifting
    for (let i = 0; i < 3; i++) { const x0 = 420 + i * 260; for (let k = 0; k < 4; k++) { const u = ((t * 0.12 + k / 4 + i * 0.3) % 1); g += `<circle cx="${f(x0 + u * 120 + Math.sin(t + k) * 10)}" cy="${f(930 - u * 260)}" r="${f(16 + u * 40)}" fill="${mix('#3a4058', '#d8d4cc', day)}" opacity="${f(0.3 * (1 - u))}" filter="url(#b8)"/>`; } }
    // the bare branch outside the bedroom
    g += once('hmbranch', () => `<path d="M3100,250 C2980,330 2900,360 2790,380 M2930,350 C2880,300 2850,290 2800,280 M2860,372 C2830,420 2790,440 2740,450 M3000,300 C2990,250 2960,220 2930,200" stroke="#0c0e14" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M2790,380 L2730,392 M2800,280 L2760,262 M2740,450 L2700,470" stroke="#0c0e14" stroke-width="4" fill="none"/>`);
    return g;
  };

  // ---------------- the walls (p 0.9)
  const wallsStatic = once.bind(null, 'hmwalls', () => {
    const [kx, ky, kw, kh] = B.KWIN, [bx, by, bw, bh] = B.BWIN;
    let g = `<defs><pattern id="hmKp" width="96" height="128" patternUnits="userSpaceOnUse"><rect width="96" height="128" fill="#cdbd98"/><rect x="0" width="26" height="128" fill="#c3b18a"/><rect x="26" width="3" height="128" fill="#b8a47c" opacity="0.6"/>` +
      `<g transform="translate(62,40)" fill="#9a8a5e" opacity="0.55"><path d="M0,-12 C6,-6 6,4 0,10 C-6,4 -6,-6 0,-12Z"/><path d="M0,0 C8,-2 14,2 16,8 C10,8 4,6 0,0Z"/><path d="M0,0 C-8,-2 -14,2 -16,8 C-10,8 -4,6 0,0Z"/></g><circle cx="62" cy="104" r="3" fill="#9a845a" opacity="0.5"/></pattern>` +
      `<pattern id="hmBp" width="110" height="110" patternUnits="userSpaceOnUse"><rect width="110" height="110" fill="#97a2ac"/><rect x="0" width="110" height="110" fill="#8e9aa4" opacity="0.5" transform="skewX(0)"/>` +
      `<g transform="translate(30,30)"><circle r="7" fill="#c08488"/><circle r="3.5" fill="#d8a4a6"/><path d="M5,6 C12,10 16,14 18,20 M-6,6 C-12,12 -12,18 -10,22" stroke="#6a7a5a" stroke-width="2" fill="none"/><ellipse cx="14" cy="14" rx="5" ry="2.5" fill="#6a7a5a" transform="rotate(40 14 14)"/></g>` +
      `<g transform="translate(85,85)"><circle r="6" fill="#b87a80"/><circle r="3" fill="#d4a0a2"/><path d="M-4,5 C-10,10 -14,12 -18,18" stroke="#6a7a5a" stroke-width="2" fill="none"/></g></pattern>` +
      `<clipPath id="hmWinK"><path d="M-1500,-400 L${B.SPLIT},-400 L${B.SPLIT},2100 L-1500,2100Z M${kx},${ky} L${kx + kw},${ky} L${kx + kw},${ky + kh} L${kx},${ky + kh}Z" clip-rule="evenodd"/></clipPath>` +
      `<clipPath id="hmWinB"><path d="M${B.SPLIT},-400 L3900,-400 L3900,2100 L${B.SPLIT},2100Z M${bx},${by} L${bx + bw},${by} L${bx + bw},${by + bh} L${bx},${by + bh}Z" clip-rule="evenodd"/></clipPath></defs>`;
    // ---- kitchen wall: paper, picture rail, beadboard wainscot
    g += `<g clip-path="url(#hmWinK)"><rect x="-1500" y="-400" width="${B.SPLIT + 1500}" height="2500" fill="url(#hmKp)"/><rect x="-1500" y="-400" width="${B.SPLIT + 1500}" height="2500" fill="#5a4a30" opacity="0.12" filter="url(#plaster)"/>` +
      `<rect x="-1500" y="290" width="${B.SPLIT + 1500}" height="16" fill="#5a3e22" ${olr(1, 0.5)}/>${beadboard(-1500, B.SPLIT, 1260, 2100, '#4e4a34')}</g>`;
    // water stains and soot above the range (a poor kitchen, much used)
    g += `<path d="M-1000,1160 C-1040,900 -980,600 -760,420 C-560,600 -420,880 -440,1160Z" fill="#2a2016" opacity="0.18" filter="url(#b14)"/><path d="M300,300 C320,380 290,440 330,520" stroke="#8a7a5a" stroke-width="16" fill="none" opacity="0.25" filter="url(#b4)"/>`;
    // ---- the kitchen window: casing, two sashes of four panes, the sill with a geranium, a gingham cafe curtain rod
    g += `<rect x="${kx - 30}" y="${ky - 34}" width="${kw + 60}" height="${kh + 34}" fill="none" stroke="#e8e0cc" stroke-width="26"/><rect x="${kx - 30}" y="${ky - 34}" width="${kw + 60}" height="${kh + 34}" fill="none" stroke="${OUTC}" stroke-width="2" opacity="0.6"/>` +
      `<path d="M${kx},${ky + kh / 2} L${kx + kw},${ky + kh / 2}" stroke="#e2d8c2" stroke-width="16"/><path d="M${kx + kw / 2},${ky} L${kx + kw / 2},${ky + kh}" stroke="#e2d8c2" stroke-width="10"/><path d="M${kx},${ky + kh / 4} L${kx + kw},${ky + kh / 4} M${kx},${ky + kh * 0.75} L${kx + kw},${ky + kh * 0.75}" stroke="#e2d8c2" stroke-width="7"/>` +
      `<rect x="${kx - 50}" y="${ky + kh}" width="${kw + 100}" height="26" fill="#d8ccb2" ${olr(1.4)}/><rect x="${kx - 40}" y="${ky + kh + 26}" width="${kw + 80}" height="16" fill="#8a7e66"/>`;
    g += `<path d="M${kx + 40},${ky + kh} L${kx + 30},${ky + kh - 70} L${kx + 110},${ky + kh - 70} L${kx + 100},${ky + kh}Z" fill="#a8542a" ${olr(1.2)}/>` + [[-26, -110, '#c8302a'], [10, -126, '#d83a2e'], [36, -100, '#b82a24'], [-6, -92, '#c8302a']].map(([dx, dy, c]) => `<circle cx="${kx + 70 + dx}" cy="${ky + kh + dy}" r="16" fill="${c}"/>`).join('') + `<path d="M${kx + 70},${ky + kh - 70} L${kx + 60},${ky + kh - 130} M${kx + 70},${ky + kh - 70} L${kx + 96},${ky + kh - 120}" stroke="#3a5a2a" stroke-width="5"/><ellipse cx="${kx + 40}" cy="${ky + kh - 96}" rx="20" ry="10" fill="#3e6a2e"/><ellipse cx="${kx + 104}" cy="${ky + kh - 84}" rx="18" ry="9" fill="#3e6a2e"/>`;
    g += `<path d="M${kx - 60},${ky + kh * 0.48} L${kx + kw + 60},${ky + kh * 0.48}" stroke="#b8902e" stroke-width="7"/><circle cx="${kx - 60}" cy="${ky + kh * 0.48}" r="9" fill="#c8a040"/><circle cx="${kx + kw + 60}" cy="${ky + kh * 0.48}" r="9" fill="#c8a040"/>`;
    // ---- the plate rack right of the window: two rails of blue-and-white plates, cups on hooks
    const [rx0, rx1] = B.RACK;
    g += `<rect x="${rx0}" y="560" width="${rx1 - rx0}" height="420" fill="#5a3a20" filter="url(#woodV)" ${olr(1.5)}/><rect x="${rx0 + 14}" y="580" width="${rx1 - rx0 - 28}" height="380" fill="#3a2614"/>`;
    for (const y of [740, 940]) {
      g += `<rect x="${rx0}" y="${y}" width="${rx1 - rx0}" height="16" fill="#6a4628" ${olr(1)}/>`;
      for (let i = 0; i < 4; i++) { const cx = rx0 + 40 + i * 48, cy = y - 70; g += `<ellipse cx="${cx}" cy="${cy}" rx="26" ry="70" fill="#eef0f2" ${olr(1)}/><ellipse cx="${cx}" cy="${cy}" rx="18" ry="54" fill="none" stroke="#3a5a9a" stroke-width="3"/><ellipse cx="${cx}" cy="${cy}" rx="8" ry="24" fill="#5a7ab8" opacity="0.6"/>`; }
    }
    for (let i = 0; i < 4; i++) g += `<path d="M${rx0 + 34 + i * 50},990 l0,16" stroke="#8a6a2a" stroke-width="3"/><path d="M${rx0 + 20 + i * 50},1006 L${rx0 + 48 + i * 50},1006 L${rx0 + 44 + i * 50},1040 L${rx0 + 24 + i * 50},1040Z" fill="#f2efe6" ${olr(1)}/><path d="M${rx0 + 48 + i * 50},1012 c10,0 10,18 -2,18" stroke="#f2efe6" stroke-width="4" fill="none"/>`;
    // ---- a framed oval photograph of a man in uniform (the husband, away) and a sampler, both a little crooked
    g += `<g transform="rotate(-2 -30 520)">${frame(-90, 430, 120, 160, `<ellipse cx="-30" cy="510" rx="56" ry="76" fill="#b8a888"/><ellipse cx="-30" cy="510" rx="56" ry="76" fill="#6a5a3e" opacity="0.25"/><circle cx="-30" cy="478" r="18" fill="#4a3a26"/><path d="M-62,580 C-58,524 -2,524 2,580Z" fill="#2a2a34"/><path d="M-44,530 L-30,560 L-16,530" stroke="#c8a040" stroke-width="2" fill="none"/>`, { b: 16, c1: '#6a4a26', c2: '#3a2414' })}</g>`;
    g += `<g transform="rotate(1.5 450 470)">${frame(380, 400, 150, 130, `<rect x="380" y="400" width="150" height="130" fill="#e8dcc0"/>` + Array.from({ length: 6 }, (_, i) => `<path d="M${392 + i * 22},${418} l10,0 l-5,9Z" fill="#9a2a2a"/>`).join('') + `<path d="M400,470 C430,440 470,500 510,460" stroke="#3a6a3a" stroke-width="3" fill="none"/><path d="M455,490 l6,-14 l6,14 l-6,10Z" fill="#9a2a2a"/>` + Array.from({ length: 7 }, (_, i) => `<circle cx="${395 + i * 20}" cy="515" r="3" fill="#3a4a8a"/>`).join(''), { b: 12, c1: '#7a5a30', c2: '#4a3018' })}</g>`;
    // ---- copper pans on a rail by the range
    g += `<path d="M-1000,760 L-560,760" stroke="#3a2a1a" stroke-width="8"/>` + [[-940, 70, '#b8682e'], [-820, 90, '#a85a26'], [-680, 60, '#c0703a']].map(([x, r2, c]) => `<path d="M${x},760 l0,26" stroke="#2a1a10" stroke-width="4"/><path d="M${x - 6},786 L${x + 6},786 L${x + 4},${786 + 110} L${x - 4},${786 + 110}Z" fill="${shade(c, -0.2)}"/><circle cx="${x}" cy="${786 + 110 + r2}" r="${r2}" fill="${c}" ${olr(1.4)}/><circle cx="${x - r2 * 0.3}" cy="${786 + 110 + r2 * 0.7}" r="${r2 * 0.35}" fill="#f0b880" opacity="0.4"/>`).join('');
    // ---- bedroom wall: paper, picture rail, painted wainscot
    g += `<g clip-path="url(#hmWinB)"><rect x="${B.SPLIT}" y="-400" width="${3900 - B.SPLIT}" height="2500" fill="url(#hmBp)"/><rect x="${B.SPLIT}" y="-400" width="${3900 - B.SPLIT}" height="2500" fill="#3a4250" opacity="0.1" filter="url(#plaster)"/>` +
      `<rect x="${B.SPLIT}" y="290" width="${3900 - B.SPLIT}" height="16" fill="#e4dccc" ${olr(1, 0.4)}/>${beadboard(B.SPLIT, 3900, 1290, 2100, '#d6cdb8')}</g>`;
    // the bedroom window: casing, sashes, roller blind half down, lace curtains to the sill
    g += `<rect x="${bx - 30}" y="${by - 34}" width="${bw + 60}" height="${bh + 34}" fill="none" stroke="#efe8d8" stroke-width="26"/><rect x="${bx - 30}" y="${by - 34}" width="${bw + 60}" height="${bh + 34}" fill="none" stroke="${OUTC}" stroke-width="2" opacity="0.5"/>` +
      `<path d="M${bx},${by + bh / 2} L${bx + bw},${by + bh / 2}" stroke="#e6dece" stroke-width="16"/><path d="M${bx + bw / 2},${by} L${bx + bw / 2},${by + bh}" stroke="#e6dece" stroke-width="10"/>` +
      `<rect x="${bx}" y="${by}" width="${bw}" height="120" fill="#d8cca8" ${olr(1)}/><path d="M${bx + bw / 2 - 12},${by + 120} l12,26 l12,-26" stroke="#8a7a5a" stroke-width="3" fill="none"/><circle cx="${bx + bw / 2}" cy="${by + 150}" r="8" fill="#c8b890"/>` +
      `<rect x="${bx - 50}" y="${by + bh}" width="${bw + 100}" height="26" fill="#e2dac8" ${olr(1.4)}/>`;
    // ---- the guardian-angel print above the bed (a painted angel watching over two children on a narrow bridge)
    const [ax, ay] = B.ANGEL, aw = 280, ah = 360, x0 = ax - aw / 2, y0 = ay - ah / 2;
    let art = `<defs>${LG('hmang', [[0, '#d8cca8'], [0.55, '#b8a888'], [1, '#6a6450']])}</defs><rect x="${x0}" y="${y0}" width="${aw}" height="${ah}" fill="url(#hmang)"/>`;
    art += `<path d="M${x0},${y0 + ah * 0.78} C${x0 + 80},${y0 + ah * 0.7} ${x0 + 200},${y0 + ah * 0.74} ${x0 + aw},${y0 + ah * 0.68} L${x0 + aw},${y0 + ah} L${x0},${y0 + ah}Z" fill="#4a4a3a"/><path d="M${x0 + 40},${y0 + ah * 0.8} L${x0 + aw - 40},${y0 + ah * 0.76}" stroke="#6a4a2a" stroke-width="7"/><path d="M${x0 + 40},${y0 + ah * 0.8} L${x0 + 40},${y0 + ah * 0.9} M${x0 + aw - 40},${y0 + ah * 0.76} L${x0 + aw - 40},${y0 + ah * 0.88}" stroke="#4a3018" stroke-width="5"/>`;
    // the angel: a tall white-robed figure, wings raised, arms spread over the children
    art += `<path d="M${ax - 20},${y0 + 90} C${ax - 120},${y0 + 40} ${ax - 130},${y0 + 150} ${ax - 110},${y0 + 230} C${ax - 70},${y0 + 170} ${ax - 50},${y0 + 140} ${ax - 18},${y0 + 128}Z" fill="#f2eee2" opacity="0.92"/><path d="M${ax + 20},${y0 + 90} C${ax + 120},${y0 + 40} ${ax + 130},${y0 + 150} ${ax + 110},${y0 + 230} C${ax + 70},${y0 + 170} ${ax + 50},${y0 + 140} ${ax + 18},${y0 + 128}Z" fill="#f2eee2" opacity="0.92"/>`;
    art += `<path d="M${ax - 26},${y0 + 110} C${ax - 34},${y0 + 190} ${ax - 50},${y0 + 250} ${ax - 60},${y0 + 290} L${ax + 60},${y0 + 290} C${ax + 50},${y0 + 250} ${ax + 34},${y0 + 190} ${ax + 26},${y0 + 110}Z" fill="#faf6ec"/><circle cx="${ax}" cy="${y0 + 92}" r="18" fill="#f0d8c0"/><path d="M${ax - 20},${y0 + 86} C${ax - 18},${y0 + 64} ${ax + 18},${y0 + 64} ${ax + 20},${y0 + 86}" fill="#d8b878"/>` + C.radial(ax, y0 + 92, 60, '#fff8e0', 0.5, 'screen');
    art += `<path d="M${ax - 22},${y0 + 130} C${ax - 50},${y0 + 170} ${ax - 70},${y0 + 200} ${ax - 80},${y0 + 230}" stroke="#faf6ec" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M${ax + 22},${y0 + 130} C${ax + 50},${y0 + 170} ${ax + 70},${y0 + 200} ${ax + 80},${y0 + 230}" stroke="#faf6ec" stroke-width="12" fill="none" stroke-linecap="round"/>`;
    for (const [cx, col] of [[ax - 46, '#8a3a3a'], [ax + 30, '#3a5a8a']]) art += `<path d="M${cx - 16},${y0 + ah * 0.79} L${cx - 12},${y0 + ah * 0.66} C${cx - 10},${y0 + ah * 0.62} ${cx + 10},${y0 + ah * 0.62} ${cx + 12},${y0 + ah * 0.66} L${cx + 16},${y0 + ah * 0.79}Z" fill="${col}"/><circle cx="${cx}" cy="${y0 + ah * 0.6}" r="11" fill="#f0d8c0"/>`;
    g += frame(x0, y0, aw, ah, art, { b: 24 });
    // ---- the coat hooks with a little red hooded coat, and a shelf with toys
    g += `<rect x="3020" y="760" width="220" height="22" fill="#6a4a2a" ${olr(1)}/><path d="M3060,782 l0,26 M3200,782 l0,26" stroke="#3a2a1a" stroke-width="6"/>` +
      `<path d="M3040,800 C3020,860 3010,960 3020,1080 L3120,1090 C3130,960 3110,860 3080,800Z" fill="#8a2222" ${olr(1.5)}/><path d="M3040,800 C3044,760 3076,760 3080,800" fill="#7a1a1a" ${olr(1.2)}/>`;
    g += `<rect x="2970" y="1170" width="260" height="20" fill="#7a5a36" ${olr(1)}/>`;
    return g;
  });

  // the calendar above the nightstand (n days crossed: a week by "hasn't stopped coughing")
  const calendar = n => once('hmcal' + n, () => PR.calendarX(B.CAL[0], B.CAL[1], 1.05, n));

  S.home = (t, o = {}) => {
    const L = [], day = o.day || 0;
    L.push({ p: 0.3, svg: outsideSky(t, day) });
    L.push({ p: 0.5, svg: outsideFar(t, day) });
    let wall = wallsStatic() + P_clock(t, o) + calendar(o.cal ?? 7);
    // the toy shelf items and the bedroom window's lace, swaying in a draught
    wall += PR.woodHorse(3060, 1170, 0.55) + PR.ragDoll(3170, 1170, 0.7, 4);
    wall += lace(t);
    // the kitchen's cafe curtain (gingham) gathered on its rod, a little sway
    wall += cafe(t);
    L.push({ p: 0.9, svg: wall });
    // ---- p 1: the floor, the cut slabs, the partition, the furniture against the walls
    let fl = once('hmfloor', () => {
      let g = boards(-1600, 3900, B.FY, 2700, 1335, 520, '#5a3a20', 7, 140);
      // skirting boards along the back walls (on the floor layer so they never part from it)
      g += `<rect x="-1600" y="${B.FY - 30}" width="${B.PX[0] + 1600}" height="30" fill="#3a2a18" ${olr(1)}/><rect x="${B.PX[1]}" y="${B.FY - 30}" width="${3900 - B.PX[1]}" height="30" fill="#c8bea8" ${olr(1)}/>`;
      // rag rugs: under the kitchen table, beside the bed
      g += `<ellipse cx="640" cy="2060" rx="520" ry="120" fill="#6a4a3a"/>` + [0, 1, 2, 3, 4].map(i => `<ellipse cx="640" cy="2060" rx="${500 - i * 90}" ry="${112 - i * 20}" fill="none" stroke="${['#8a5a3a', '#4a5a6a', '#9a7a4a', '#7a3a2a', '#5a6a4a'][i]}" stroke-width="16" opacity="0.8"/>`).join('');
      g += `<ellipse cx="2000" cy="2080" rx="420" ry="100" fill="#4a5a7a"/>` + [0, 1, 2, 3].map(i => `<ellipse cx="2000" cy="2080" rx="${400 - i * 90}" ry="${92 - i * 20}" fill="none" stroke="${['#8a9ab8', '#c89a7a', '#6a7a9a', '#d8c8a8'][i]}" stroke-width="14" opacity="0.7"/>`).join('');
      // the cut partition: plaster skins, studs and brick nogging in section, bevelled shading
      const [p0, p1] = B.PX;
      g += `<defs>${LG('hmpart', [[0, '#2a2018'], [0.12, '#8a7e6a'], [0.2, '#5a4a38'], [0.8, '#4a3a2a'], [0.88, '#8a8070'], [1, '#2a2018']], 1, 0)}</defs>`;
      g += `<rect x="${p0}" y="20" width="${p1 - p0}" height="2700" fill="url(#hmpart)"/>`;
      for (let y = 40, row = 0; y < 2700; y += 46, row++) g += `<path d="M${p0 + 24},${y} L${p1 - 24},${y}" stroke="#3a2a1e" stroke-width="3" opacity="0.6"/>` + `<path d="M${p0 + 24 + (row % 2) * 60 + 30},${y} L${p0 + 24 + (row % 2) * 60 + 30},${y + 46}" stroke="#3a2a1e" stroke-width="3" opacity="0.5"/>`;
      g += `<rect x="${p0}" y="20" width="${p1 - p0}" height="2700" fill="#000" opacity="0.22"/><path d="M${p0},20 L${p0},2700 M${p1},20 L${p1},2700" stroke="${OUTC}" stroke-width="4"/>`;
      // the ceiling slab (the floor of the room above), cut: joists in section
      g += `<rect x="-1600" y="10" width="5500" height="${B.CEIL - 10}" fill="#2a1c12"/>` + Array.from({ length: 46 }, (_, i) => `<rect x="${-1580 + i * 120}" y="40" width="44" height="${B.CEIL - 50}" fill="#4a3220" ${olr(1, 0.5)}/>`).join('') + `<rect x="-1600" y="${B.CEIL - 10}" width="5500" height="12" fill="#c8bca4"/><rect x="-1600" y="-1400" width="5500" height="1410" fill="#0c0806"/>`;
      return g;
    });
    // ---- the iron range: oven door, firebox (glowing), lids, warming shelf, stovepipe; coal scuttle beside it
    const [r0, r1, rt, rb] = B.RANGE;
    let range = once('hmrange', () => {
      let g = `<rect x="${r0 + 230}" y="-200" width="70" height="${rt - 60 + 200}" fill="#1c1c1e" ${olr(1.5)}/>` + [200, 520, 840].map(y => `<rect x="${r0 + 222}" y="${y}" width="86" height="16" fill="#2a2a2e"/>`).join('');
      g += `<rect x="${r0 + 40}" y="${rt - 170}" width="${r1 - r0 - 80}" height="26" fill="#2a2a2e" ${olr(1.4)}/><path d="M${r0 + 60},${rt - 144} L${r0 + 60},${rt - 10} M${r1 - 60},${rt - 144} L${r1 - 60},${rt - 10}" stroke="#2a2a2e" stroke-width="10"/>`;
      g += `<defs>${LG('hmrng', [[0, '#34343a'], [0.5, '#1c1c20'], [1, '#0c0c0e']], 1, 0)}</defs><rect x="${r0}" y="${rt}" width="${r1 - r0}" height="${rb - rt - 40}" fill="url(#hmrng)" ${olr(2)}/><rect x="${r0 - 14}" y="${rt - 18}" width="${r1 - r0 + 28}" height="30" fill="#2a2a30" ${olr(1.5)}/><rect x="${r0 - 14}" y="${rt - 18}" width="${r1 - r0 + 28}" height="6" fill="#8a8a92" opacity="0.6"/>`;
      g += `<rect x="${r0 + 30}" y="${rt + 60}" width="230" height="200" rx="10" fill="#18181c" ${olr(1.4)}/><rect x="${r0 + 44}" y="${rt + 74}" width="202" height="172" rx="6" fill="none" stroke="#9a9aa2" stroke-width="3" opacity="0.6"/><rect x="${r0 + 210}" y="${rt + 150}" width="26" height="12" rx="4" fill="#b0b0b8"/>`;
      g += `<rect x="${r0 + 300}" y="${rt + 60}" width="${r1 - r0 - 330}" height="120" rx="8" fill="#141418" ${olr(1.4)}/><rect x="${r0 + 300}" y="${rt + 210}" width="${r1 - r0 - 330}" height="200" rx="8" fill="#18181c" ${olr(1.4)}/><rect x="${r0 + 320}" y="${rt + 230}" width="${r1 - r0 - 370}" height="160" rx="6" fill="none" stroke="#9a9aa2" stroke-width="3" opacity="0.5"/>`;
      g += `<path d="M${r0 + 10},${rb - 40} L${r0 + 30},${rb} L${r0 + 70},${rb} L${r0 + 60},${rb - 40}Z M${r1 - 10},${rb - 40} L${r1 - 30},${rb} L${r1 - 70},${rb} L${r1 - 60},${rb - 40}Z" fill="#141416"/>`;
      g += `<path d="M${r1 + 40},${rb} L${r1 + 60},${rb - 140} L${r1 + 200},${rb - 140} L${r1 + 220},${rb}Z" fill="#2a2a2e" ${olr(1.4)}/><path d="M${r1 + 60},${rb - 140} C${r1 + 80},${rb - 190} ${r1 + 180},${rb - 190} ${r1 + 200},${rb - 140}" fill="#141414"/><path d="M${r1 + 70},${rb - 150} C${r1 + 100},${rb - 220} ${r1 + 160},${rb - 220} ${r1 + 190},${rb - 150}" stroke="#2a2a2e" stroke-width="8" fill="none"/>`;
      return g;
    });
    // the firebox glow through the vents (flickers), the kettle steaming on the hob
    const fk = 0.75 + 0.15 * Math.sin(t * 7.3) + 0.1 * Math.sin(t * 13.1);
    range += `<g opacity="${f(fk)}">${[0, 1, 2, 3, 4].map(i => `<rect x="${r0 + 320 + i * 26}" y="${rt + 100}" width="14" height="50" rx="4" fill="#ff7a2a"/>`).join('')}</g>` + C.radial(r0 + 380, rt + 125, 240, '#ff8a3a', 0.35 * fk, 'screen');
    range += PR.kettle(r0 + 150, rt - 18, 0.95, t, 1);
    // ---- the kitchen shelf on its brackets: preserves, a tea caddy, spice jars, the carton (cherub), the bottle
    const [s0, s1, sy] = B.SHELF;
    let shelf = once('hmshelf', () => {
      let g = `<path d="M${s0 + 40},${sy + 20} L${s0 + 40},${sy + 90} L${s0 + 110},${sy + 20}Z M${s1 - 40},${sy + 20} L${s1 - 40},${sy + 90} L${s1 - 110},${sy + 20}Z" fill="#4a2e18" ${olr(1)}/>`;
      g += `<rect x="${s0}" y="${sy}" width="${s1 - s0}" height="22" fill="#6a4426" filter="url(#woodH)" ${olr(1.4)}/><rect x="${s0}" y="${sy}" width="${s1 - s0}" height="5" fill="#9a6a3a" opacity="0.7"/>`;
      // jars and tins (left to right), the bottle's slot at 250 left empty for the shots
      g += `<rect x="${s0 + 14}" y="${sy - 120}" width="70" height="120" rx="8" fill="#8a2a1e" ${olr(1.2)}/><rect x="${s0 + 14}" y="${sy - 120}" width="70" height="24" fill="#c8a040"/><rect x="${s0 + 24}" y="${sy - 80}" width="50" height="40" fill="#e8d8b0" opacity="0.8"/>`;
      g += `<path d="M${s0 + 100},${sy} L${s0 + 100},${sy - 80} C${s0 + 100},${sy - 96} ${s0 + 160},${sy - 96} ${s0 + 160},${sy - 80} L${s0 + 160},${sy}Z" fill="#9a2a3a" opacity="0.85" ${olr(1.2)}/><rect x="${s0 + 96}" y="${sy - 100}" width="68" height="16" rx="3" fill="#e8e0cc" ${olr(1)}/><path d="M${s0 + 106},${sy - 70} L${s0 + 112},${sy - 10}" stroke="#fff" stroke-width="4" opacity="0.35"/>`;
      for (let i = 0; i < 3; i++) g += `<rect x="${s0 + 330 + i * 40}" y="${sy - 70}" width="32" height="70" rx="5" fill="#d8d0b8" opacity="0.8" ${olr(1)}/><rect x="${s0 + 330 + i * 40}" y="${sy - 50}" width="32" height="${30 + i * 6}" fill="${['#8a5a2a', '#5a6a2a', '#a8782a'][i]}" opacity="0.8"/><rect x="${s0 + 328 + i * 40}" y="${sy - 78}" width="36" height="10" rx="2" fill="#3a3a3e"/>`;
      g += PR.carton(s1 - 80, sy, 0.62);
      return g;
    });
    // the bottle on the shelf (only when the set draws it; the shots usually hold it)
    let bottle = '';
    if (o.bottle) bottle = PR.heroinBottle(B.BOTTLE[0], B.BOTTLE[1], o.bottle.s ?? 0.6, t, o.bottle);
    // ---- the bedroom: the nightstand (candle, a glass of water), the chair, the washstand, the bed's head end
    const [nx, ny] = B.NS;
    let bed = once('hmns', () => {
      let g = `<rect x="${nx - 120}" y="${ny}" width="240" height="22" fill="#7a5230" filter="url(#woodH)" ${olr(1.4)}/><rect x="${nx - 110}" y="${ny + 22}" width="220" height="90" fill="#6a4426" ${olr(1.2)}/><rect x="${nx - 90}" y="${ny + 40}" width="180" height="54" fill="none" stroke="#4a2e18" stroke-width="3"/><circle cx="${nx}" cy="${ny + 67}" r="7" fill="#c8a040"/>` +
        `<path d="M${nx - 100},${ny + 112} L${nx - 96},${ny + 330} M${nx + 100},${ny + 112} L${nx + 96},${ny + 330}" stroke="#5a3a20" stroke-width="18"/>`;
      g += `<path d="M${nx + 30},${ny} L${nx + 26},${ny - 92} L${nx + 74},${ny - 92} L${nx + 70},${ny}Z" fill="#dfe8ec" opacity="0.45" ${olr(1)}/><path d="M${nx + 29},${ny - 40} L${nx + 71},${ny - 40} L${nx + 70},${ny} L${nx + 30},${ny}Z" fill="#c8dce4" opacity="0.5"/><path d="M${nx + 34},${ny - 84} L${nx + 36},${ny - 10}" stroke="#fff" stroke-width="3" opacity="0.6"/>`;
      // the candle in its enamel chamberstick
      const [cx, cy] = B.CANDLE;
      g += `<ellipse cx="${cx}" cy="${cy - 4}" rx="44" ry="12" fill="#e8e4dc" ${olr(1.2)}/><path d="M${cx + 40},${cy - 8} c18,-2 22,-26 6,-30" stroke="#e8e4dc" stroke-width="7" fill="none"/><rect x="${cx - 13}" y="${cy - 150}" width="26" height="142" rx="3" fill="#efe6cc" ${olr(1)}/><path d="M${cx - 13},${cy - 140} q6,14 2,30 q-5,-8 -2,-30Z" fill="#e2d6b8"/>`;
      // the washstand under the window: jug in its basin, a towel
      g += `<rect x="2700" y="1500" width="300" height="24" fill="#7a5230" ${olr(1.4)}/><rect x="2712" y="1524" width="276" height="160" fill="#6a4426" ${olr(1.2)}/><path d="M2720,1684 L2716,1840 M2980,1684 L2984,1840" stroke="#5a3a20" stroke-width="16"/><rect x="2850" y="1530" width="120" height="140" fill="#f0ece4" ${olr(1)}/>` +
        `<ellipse cx="2800" cy="1490" rx="80" ry="20" fill="#f4f2ee" ${olr(1.2)}/><path d="M2770,1490 C2750,1420 2760,1380 2790,1350 L2780,1320 L2830,1320 L2822,1350 C2850,1380 2856,1420 2834,1490Z" fill="#f4f2ee" ${olr(1.2)}/><path d="M2830,1350 c26,6 30,50 6,70" stroke="#f4f2ee" stroke-width="8" fill="none"/><path d="M2780,1400 C2800,1390 2820,1390 2840,1400" stroke="#6a8ab8" stroke-width="4" fill="none"/>`;
      // the bedside chair (a plain bentwood chair; the mother sits on it)
      const [chx, chy] = B.CHAIR;
      g += `<path d="M${chx - 150},${chy} L${chx - 150},1100 C${chx - 150},1040 ${chx + 150},1040 ${chx + 150},1100 L${chx + 150},${chy}" stroke="#4a2a16" stroke-width="20" fill="none"/><path d="M${chx - 120},1180 L${chx + 120},1180" stroke="#4a2a16" stroke-width="12"/>` +
        `<rect x="${chx - 170}" y="${chy}" width="340" height="30" rx="12" fill="#5a3a20" ${olr(1.4)}/><path d="M${chx - 150},${chy + 30} L${chx - 160},2010 M${chx + 150},${chy + 30} L${chx + 160},2010" stroke="#4a2a16" stroke-width="16"/>`;
      return g;
    });
    // the candle flame (o.candle 0..1) and its glow
    const ck = o.candle ?? 1, [cfx, cfy] = B.CANDLEFLAME;
    if (ck > 0.02) bed += `<g opacity="${f(ck)}">${PR.flame(cfx, cfy + 2, 1.05, t)}</g>`;
    bed += S.bedBack17(t, o);
    L.push({ p: 1, svg: fl + range + shelf + bottle + bed });
    // ---- foreground (p 1.28): a dish towel on a line top-left in the kitchen, the bed's brass knob, blurred
    L.push({ p: 1.28, svg: `<g filter="url(#dof1)"><path d="M-900,60 L700,140" stroke="#2a2018" stroke-width="5"/><path d="M-560,80 L-560,330 C-540,350 -420,356 -400,336 L-400,96Z" fill="#d8d0c0"/><path d="M-560,140 L-400,148 M-560,180 L-400,188" stroke="#9a2a2a" stroke-width="8"/><path d="M-200,100 L-200,280 C-180,296 -100,300 -80,286 L-80,108Z" fill="#c8c0a8"/></g>` });
    // ---- light: the rooms fall into darkness away from the lamp and the candle; glows on top; day lifts it
    const lampK = o.lamp ?? (1 - day), night = 1 - day;
    const [lfx, lfy] = B.LAMPFLAME;
    let lt = darkPool('hmdk', lfx, lfy, 160 + 240 * lampK, 1500, 0.62 * night + 0.12, '#05060c', -1700, B.SPLIT) + darkPool('hmdb', cfx, cfy, 120 + 200 * ck, 1400, 0.6 * (o.bedNight ?? 1) + 0.08, '#05060c', B.SPLIT, 4000);
    if (lampK > 0.02) lt += C.radial(lfx, lfy, 520, '#ffc070', 0.42 * lampK, 'screen') + C.radial(lfx, lfy, 140, '#fff0c0', 0.3 * lampK, 'screen');
    if (ck > 0.02) lt += C.radial(cfx, cfy - 10, 460, '#ffb860', 0.4 * ck, 'screen');
    // moonlight from the bedroom window over the bed; daylight shaft through the kitchen window
    lt += shaft([[B.BWIN[0], B.BWIN[1] + 140], [B.BWIN[0] + B.BWIN[2], B.BWIN[1] + 140], [2500, 2200], [1880, 2200]], '#9ab0e0', 0.16 * (o.moon ?? 1), 'hmmoon');
    if (day > 0.01) lt += shaft([[B.KWIN[0], B.KWIN[1]], [B.KWIN[0] + B.KWIN[2], B.KWIN[1]], [1200, 2300], [180, 2300]], '#fff2d8', 0.32 * day, 'hmsun') + motes(220, 900, 1100, 2000, 40, 11, t, '#fff4dc', 0.55 * day);
    lt += motes(1900, 700, 2700, 1700, 26, 13, t, '#c8d8ff', 0.35 * (o.moon ?? 1));
    L.push({ p: 1, light: true, svg: lt });
    return L;
  };
  // the wall clock: hands from o.clock (hours, fractional); a time-lapse spins them
  const P_clock = (t, o) => { const h = o.clock ?? 9.25 + t / 3600; return PR.wallClock(B.CLOCK[0], B.CLOCK[1], 1.15, t, { hour: h % 12, min: (h % 1) * 60 }); };
  // lace curtains in the bedroom window, drawn back to each side, the hems stirring
  const lace = t => {
    const [bx, by, bw, bh] = B.BWIN;
    let g = `<defs><pattern id="hmLace" width="26" height="26" patternUnits="userSpaceOnUse"><rect width="26" height="26" fill="#f4f0e6" opacity="0.62"/><circle cx="13" cy="13" r="6" fill="#000" opacity="0.18"/><circle cx="0" cy="0" r="4" fill="#000" opacity="0.14"/><circle cx="26" cy="26" r="4" fill="#000" opacity="0.14"/></pattern></defs>`;
    for (const s2 of [-1, 1]) {
      const xa = s2 < 0 ? bx - 40 : bx + bw + 40, sw = Math.sin(t * 0.9 + s2) * 8, xin = xa - s2 * (120 + sw);
      g += `<path d="M${xa},${by - 40} L${f(xin)},${by - 40} C${f(xin + s2 * 10)},${by + 200} ${f(xin - s2 * 40)},${by + 380} ${f(xa - s2 * (60 + sw))},${by + bh + 10} L${xa},${by + bh + 10}Z" fill="url(#hmLace)" stroke="#d8d0c0" stroke-width="2"/>`;
      for (let k = 1; k < 5; k++) g += `<path d="M${f(xa - s2 * k * 26)},${by - 40} C${f(xa - s2 * k * 24)},${by + 200} ${f(xa - s2 * k * 20)},${by + 380} ${f(xa - s2 * (k * 14 + sw * 0.5))},${by + bh}" stroke="#c8c0b0" stroke-width="3" fill="none" opacity="0.5"/>`;
    }
    return g + `<rect x="${bx - 60}" y="${by - 52}" width="${bw + 120}" height="14" rx="6" fill="#c8a040"/>`;
  };
  // the kitchen window's cafe curtain: red-and-white gingham, gathered, hanging from the rod to the sill
  const cafe = t => {
    const [kx, ky, kw, kh] = B.KWIN, y0 = ky + kh * 0.48, y1 = ky + kh - 4, sw = Math.sin(t * 0.8) * 5;
    let g = `<defs><pattern id="hmGing" width="24" height="24" patternUnits="userSpaceOnUse"><rect width="24" height="24" fill="#efe8dc"/><rect width="12" height="24" fill="#b83a34" opacity="0.55"/><rect width="24" height="12" fill="#b83a34" opacity="0.55"/></pattern></defs>`;
    for (const [xa, xb] of [[kx - 30, kx + kw * 0.32], [kx + kw * 0.68, kx + kw + 30]]) {
      g += `<path d="M${xa},${y0} L${xb},${y0} L${f(xb + sw)},${y1} L${f(xa + sw)},${y1}Z" fill="url(#hmGing)" ${olr(1.2)}/>`;
      for (let x = xa + 22; x < xb; x += 26) g += `<path d="M${x},${y0} L${f(x + sw)},${y1}" stroke="#000" stroke-width="7" opacity="0.12"/>`;
    }
    return g;
  };

  // ---------------- the bed (seen from its foot): the head end against the wall (behind the child), the quilt over
  // her (drawn after her; o.breath, o.toss restless), and the footboard (drawn after whoever sits beside the bed)
  S.bedBack17 = (t, o = {}) => once('hmbedback', () => {
    const [x0, x1] = B.BED, mid = (x0 + x1) / 2;
    let g = `<path d="M${x0 - 10},${B.QUILT + 60} L${x0 - 10},1080 C${x0 + 120},1010 ${x1 - 120},1010 ${x1 + 10},1080 L${x1 + 10},${B.QUILT + 60}" fill="none" stroke="#e8e4da" stroke-width="16"/>`;
    for (let x = x0 + 50; x < x1 - 20; x += 44) { const top = 1060 - 40 * Math.sin((x - x0) / (x1 - x0) * Math.PI); g += `<path d="M${x},${f(top)} L${x},${B.PILLOW}" stroke="#e2ded4" stroke-width="7"/>`; }
    g += `<path d="M${x0 + 20},1150 L${x1 - 20},1150" stroke="#e2ded4" stroke-width="9"/><circle cx="${mid}" cy="1090" r="30" fill="none" stroke="#c8a040" stroke-width="7"/><circle cx="${mid}" cy="1090" r="12" fill="#c8a040"/>`;
    for (const x of [x0 - 10, x1 + 10]) g += `<rect x="${x - 15}" y="1030" width="30" height="${B.QUILT + 80 - 1030}" fill="#e8e4da" ${olr(1.4)}/><circle cx="${x}" cy="1020" r="22" fill="#d8b048" ${olr(1)}/><circle cx="${x - 6}" cy="1012" r="7" fill="#fff4c0" opacity="0.6"/>`;
    // the mattress edge and two plump pillows with lace edging
    g += `<rect x="${x0}" y="${B.PILLOW + 20}" width="${x1 - x0}" height="${B.QUILT - B.PILLOW + 20}" fill="#ece8de"/>`;
    g += `<path d="M${x0 + 30},${B.PILLOW + 40} C${x0 + 10},${B.PILLOW - 60} ${x0 + 60},1170 ${mid - 10},1180 C${x1 - 60},1170 ${x1 - 10},${B.PILLOW - 60} ${x1 - 30},${B.PILLOW + 40}Z" fill="#f6f4ee" ${olr(1.5)}/>` +
      `<path d="M${x0 + 30},${B.PILLOW + 40} C${x0 + 10},${B.PILLOW - 60} ${x0 + 60},1170 ${mid - 10},1180 C${x1 - 60},1170 ${x1 - 10},${B.PILLOW - 60} ${x1 - 30},${B.PILLOW + 40}" fill="none" stroke="#d8d0c0" stroke-width="10" stroke-dasharray="6 7"/>`;
    g += `<path d="M${x0 + 60},${B.PILLOW + 70} C${x0 + 40},${B.PILLOW - 10} ${x0 + 100},1230 ${mid},1236 C${x1 - 100},1230 ${x1 - 40},${B.PILLOW - 10} ${x1 - 60},${B.PILLOW + 70}Z" fill="#fbfaf6" ${olr(1.5)}/><path d="M${mid - 120},1270 C${mid - 60},1300 ${mid + 60},1300 ${mid + 120},1270" stroke="#e0dcd2" stroke-width="5" fill="none"/>`;
    return g;
  });
  S.homeQuilt17 = (t, o = {}) => {
    const [x0, x1] = B.BED, q = B.QUILT, br = Math.sin(t * 1.7) * 3 * (o.breath ?? 1) + (o.toss || 0) * (6 * Math.sin(t * 5.3) + 4 * Math.sin(t * 8.1));
    const qa = x0 - 30, qb = x1 + 30, fy = B.FOOT + 10;
    const patch = once('hmpatch', () => {
      const r = rng(41), cols = ['#8a3a3a', '#c8a878', '#3a5a7a', '#6a7a4a', '#b87a5a', '#d8ccb0', '#5a4a6a', '#a85a4a'];
      let g = '';
      for (let j = 0; j < 4; j++) for (let i = 0; i < 9; i++) { const w = (qb - qa + 80) / 9, x = qa - 40 + i * w, y = q + 40 + j * 66; g += `<rect x="${f(x)}" y="${y}" width="${f(w)}" height="66" fill="${cols[Math.floor(r() * cols.length)]}" stroke="#f4ecd8" stroke-width="2.5" stroke-dasharray="7 5"/>`; if (r() < 0.4) g += `<circle cx="${f(x + w / 2)}" cy="${y + 33}" r="12" fill="none" stroke="#f4ecd8" stroke-width="2.5" stroke-dasharray="4 4"/>`; }
      return g;
    });
    const id = 'hmqc';
    let g = `<defs><clipPath id="${id}"><path d="M${qa},${f(q + br)} C${qa + 140},${f(q - 24 + br)} ${qb - 140},${f(q - 24 + br)} ${qb},${f(q + br)} L${qb + 50},${fy} L${qa - 50},${fy}Z"/></clipPath></defs>`;
    g += `<g clip-path="url(#${id})"><rect x="${qa - 60}" y="${q - 40}" width="${qb - qa + 120}" height="${fy - q + 60}" fill="#6a4a4a"/><g transform="translate(0,${f(br * 0.6)})">${patch}</g>` +
      `<rect x="${qa - 60}" y="${q - 40}" width="${qb - qa + 120}" height="${fy - q + 60}" fill="url(#hmqsh)"/></g><defs>${LG('hmqsh', [[0, '#000', 0.05], [0.7, '#000', 0.2], [1, '#000', 0.42]])}</defs>`;
    // the turned-down sheet along the top, with its folds; the quilt edge drapes over the sides
    g += `<path d="M${qa + 4},${f(q + 6 + br)} C${qa + 140},${f(q - 18 + br)} ${qb - 140},${f(q - 18 + br)} ${qb - 4},${f(q + 6 + br)}" stroke="#f6f4ee" stroke-width="30" fill="none" stroke-linecap="round"/><path d="M${qa + 10},${f(q + 18 + br)} C${qa + 140},${f(q - 4 + br)} ${qb - 140},${f(q - 4 + br)} ${qb - 10},${f(q + 18 + br)}" stroke="#d8d4ca" stroke-width="3" fill="none"/>`;
    g += `<path d="M${qa},${f(q + br)} L${qa - 50},${fy} L${qa - 70},${fy + 40} L${qa - 20},${q + 120}Z M${qb},${f(q + br)} L${qb + 50},${fy} L${qb + 70},${fy + 40} L${qb + 20},${q + 120}Z" fill="#4a3434" opacity="0.8"/>`;
    return g;
  };
  S.homeFoot17 = (t) => once('hmfoot', () => {
    const [x0, x1] = B.BED, a = x0 - 70, b = x1 + 70, y = B.FOOT;
    let g = `<rect x="${a}" y="${y}" width="${b - a}" height="18" rx="8" fill="#e8e4da" ${olr(1.5)}/><rect x="${a}" y="${y + 190}" width="${b - a}" height="16" rx="7" fill="#dcd8ce" ${olr(1.4)}/>`;
    for (let x = a + 40; x < b - 20; x += 46) g += `<path d="M${x},${y + 18} L${x},${y + 190}" stroke="#e2ded4" stroke-width="7"/>`;
    g += `<path d="M${(a + b) / 2 - 80},${y + 100} C${(a + b) / 2 - 40},${y + 40} ${(a + b) / 2 + 40},${y + 40} ${(a + b) / 2 + 80},${y + 100} C${(a + b) / 2 + 40},${y + 160} ${(a + b) / 2 - 40},${y + 160} ${(a + b) / 2 - 80},${y + 100}Z" fill="none" stroke="#c8a040" stroke-width="6"/>`;
    for (const x of [a, b]) g += `<rect x="${x - 16}" y="${y - 40}" width="32" height="300" fill="#e8e4da" ${olr(1.4)}/><circle cx="${x}" cy="${y - 50}" r="22" fill="#d8b048" ${olr(1)}/><circle cx="${x - 6}" cy="${y - 58}" r="7" fill="#fff4c0" opacity="0.6"/><circle cx="${x}" cy="${y + 268}" r="12" fill="#3a3a3e"/>`;
    return g;
  });

  // ---------------- the kitchen table (drawn after whoever sits behind it): scrubbed top, apron with a drawer, turned
  // legs; the oil lamp (o.lamp 0..1), a bread board, a mug; o.mess 0..1 adds dirty dishes and spilt syrup as she declines
  S.homeTable17 = (t, o = {}) => {
    const [x0, x1, ty, fy] = B.TABLE, dep = 92;
    let g = once('hmtable', () => {
      let s = `<path d="M${x0 + 24},${ty - dep} L${x1 - 24},${ty - dep} L${x1},${ty} L${x0},${ty}Z" fill="#b8925e" filter="url(#woodH)" ${olr(1.6)}/><path d="M${x0 + 30},${ty - dep + 14} L${x1 - 30},${ty - dep + 14}" stroke="#d8b680" stroke-width="3" opacity="0.6"/>`;
      s += `<rect x="${x0}" y="${ty}" width="${x1 - x0}" height="26" fill="#8a6438" ${olr(1.4)}/><rect x="${x0 + 30}" y="${ty + 26}" width="${x1 - x0 - 60}" height="96" fill="#7a5430" ${olr(1.2)}/><rect x="${(x0 + x1) / 2 - 150}" y="${ty + 44}" width="300" height="60" fill="none" stroke="#4a3018" stroke-width="3"/><circle cx="${(x0 + x1) / 2}" cy="${ty + 74}" r="9" fill="#3a2414"/>`;
      for (const x of [x0 + 36, x1 - 36]) s += `<path d="M${x - 22},${ty + 122} L${x + 22},${ty + 122} L${x + 18},${ty + 170} C${x + 30},${ty + 190} ${x + 30},${ty + 220} ${x + 16},${ty + 240} L${x + 12},${fy - 40} C${x + 22},${fy - 20} ${x + 18},${fy} ${x + 10},${fy} L${x - 10},${fy} C${x - 18},${fy} ${x - 22},${fy - 20} ${x - 12},${fy - 40} L${x - 16},${ty + 240} C${x - 30},${ty + 220} ${x - 30},${ty + 190} ${x - 18},${ty + 170}Z" fill="#7a5430" ${olr(1.4)}/>`;
      // the bread board and a loaf, an enamel mug
      s += `<ellipse cx="${x0 + 150}" cy="${ty - 40}" rx="110" ry="28" fill="#9a7040" ${olr(1.2)}/><path d="M${x0 + 80},${ty - 46} C${x0 + 90},${ty - 110} ${x0 + 210},${ty - 110} ${x0 + 220},${ty - 46}Z" fill="#c8884a" ${olr(1.2)}/><path d="M${x0 + 110},${ty - 80} l20,-16 M${x0 + 150},${ty - 86} l20,-16 M${x0 + 190},${ty - 80} l14,-12" stroke="#8a5a2a" stroke-width="4"/>`;
      s += `<path d="M${x1 - 330},${ty - 34} L${x1 - 326},${ty - 110} L${x1 - 264},${ty - 110} L${x1 - 260},${ty - 34}Z" fill="#e8ecef" ${olr(1.2)}/><path d="M${x1 - 326},${ty - 104} L${x1 - 264},${ty - 104}" stroke="#2a3a6a" stroke-width="5"/><path d="M${x1 - 262},${ty - 96} c28,0 28,40 0,40" stroke="#e8ecef" stroke-width="8" fill="none"/>`;
      return s;
    });
    if (o.mess) g += `<g opacity="${f(o.mess)}"><ellipse cx="${x0 + 420}" cy="${ty - 30}" rx="70" ry="12" fill="#3a1606" opacity="0.7"/><ellipse cx="${x0 + 300}" cy="${ty - 52}" rx="64" ry="16" fill="#e8e4dc" ${olr(1)}/><ellipse cx="${x0 + 300}" cy="${ty - 54}" rx="44" ry="9" fill="#c8b890"/><path d="M${x0 + 250},${ty - 20} L${x0 + 330},${ty - 70}" stroke="#a8a8b0" stroke-width="6"/></g>`;
    const lk = o.lamp ?? 1;
    g += PR.oilLamp(B.LAMP[0], B.LAMP[1], 0.95, t, lk);
    return g;
  };
})(window);
