// Sets for "The Calf's Blood" (Paris, 1667): the Paris street outside the doctor's house (night, day, dusk), the
// doctor's study, the transfusion room (evening, night), your home (night -> dawn, day, the flashback), the court.
// Every set returns layers [{p, svg}] (p = parallax depth); furniture that people sit in or behind is drawn by the shots.
(function (G) {
  const S = G.SETS, { f, shade, mix, rng, uid } = G.RIG, C = G.CINE, E = G.ENV, PR = G.PROPS;
  const lg = S.lg;
  const lerp = (a, b, t) => a + (b - a) * t, cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const OUTC = '#1a120c';
  const olr = (w = 2, op = 0.7) => `stroke="${OUTC}" stroke-width="${w}" stroke-opacity="${op}" stroke-linejoin="round"`;
  const cache = {}, once = (k, fn) => cache[k] || (cache[k] = fn());

  // ---------------- pieces
  // a casement window: frame, mullion and transom, leaded panes; lit (warm glow) or dark glass; shutters
  const casement = (x, y, w, h, lit, o = {}) => {
    const glass = lit > 0 ? mix('#2a3448', '#ffc870', lit) : (o.glass || '#2a3448');
    let g = `<rect x="${x - 14}" y="${y - 14}" width="${w + 28}" height="${h + 28}" fill="${o.frame || '#d8ccb0'}" ${olr(2)}/>`;
    g += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${glass}" ${olr(2)}/>`;
    if (lit > 0) g += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff4c8" opacity="${f(0.25 * lit)}" filter="url(#b8)"/>`;
    else g += `<path d="M${x},${y + h * 0.7} L${x + w * 0.6},${y}" stroke="#fff" stroke-width="${f(w * 0.12)}" opacity="0.07"/>`;
    for (let k = 1; k < 4; k++) g += `<path d="M${f(x + w * k / 4)},${y} L${f(x + w * k / 4)},${y + h} M${x},${f(y + h * k / 4)} L${x + w},${f(y + h * k / 4)}" stroke="#2a2a2e" stroke-width="2" opacity="0.6"/>`;
    g += `<path d="M${x + w / 2},${y} L${x + w / 2},${y + h} M${x},${y + h * 0.4} L${x + w},${y + h * 0.4}" stroke="${o.frame || '#d8ccb0'}" stroke-width="10"/>`;
    if (o.shutters) for (const s of [-1, 1]) { const sx = s < 0 ? x - 14 - w * 0.5 : x + w + 14; g += `<rect x="${f(sx)}" y="${y - 14}" width="${f(w * 0.5)}" height="${h + 28}" fill="${o.shutters}" filter="url(#woodV)" ${olr(2)}/><path d="M${f(sx + 10)},${y + 20} L${f(sx + w * 0.5 - 10)},${y + 20} M${f(sx + 10)},${y + h - 20} L${f(sx + w * 0.5 - 10)},${y + h - 20}" stroke="${shade(o.shutters, -0.4)}" stroke-width="6"/>`; }
    g += `<rect x="${x - 26}" y="${y + h + 12}" width="${w + 52}" height="20" fill="${shade(o.frame || '#d8ccb0', -0.15)}" ${olr(1.6)}/>`;
    return g;
  };
  // a steep slate roof with dormers and chimneys (Paris): x0..x1 eaves at y, ridge height h
  const roof = (x0, x1, y, h, seed, o = {}) => {
    const r = rng(seed), col = o.col || '#4a5058';
    let g = `<path d="M${x0 - 30},${y} L${x0 + 60},${y - h} L${x1 - 60},${y - h} L${x1 + 30},${y}Z" fill="${col}" filter="url(#tex)" ${olr(2.4)}/>`;
    for (let yy = y - 24; yy > y - h; yy -= 26) g += `<path d="M${f(lerp(x0 - 30, x0 + 60, (y - yy) / h))},${yy} L${f(lerp(x1 + 30, x1 - 60, (y - yy) / h))},${yy}" stroke="${shade(col, -0.35)}" stroke-width="2" opacity="0.6"/>`;
    const nd = Math.max(1, Math.floor((x1 - x0) / 280));
    for (let i = 0; i < nd; i++) { const dx = x0 + (i + 0.5) * (x1 - x0) / nd - 60, dy = y - h * 0.62; g += `<path d="M${f(dx - 10)},${f(dy + 150)} L${f(dx - 10)},${f(dy + 20)} L${f(dx + 60)},${f(dy - 50)} L${f(dx + 130)},${f(dy + 20)} L${f(dx + 130)},${f(dy + 150)}Z" fill="${o.wall || '#d8ccb4'}" ${olr(2)}/><path d="M${f(dx - 26)},${f(dy + 26)} L${f(dx + 60)},${f(dy - 62)} L${f(dx + 146)},${f(dy + 26)}" stroke="${col}" stroke-width="22" fill="none"/>` + `<rect x="${f(dx + 18)}" y="${f(dy + 40)}" width="84" height="96" fill="${o.lit && r() < 0.6 ? '#f0b860' : '#2a3040'}" ${olr(1.6)}/>`; }
    for (let i = 0; i < 2; i++) { const cx = x0 + 80 + r() * (x1 - x0 - 160); g += `<rect x="${f(cx)}" y="${f(y - h - 120)}" width="70" height="160" fill="${o.chim || '#b8a890'}" filter="url(#tex)" ${olr(2)}/><rect x="${f(cx - 8)}" y="${f(y - h - 130)}" width="86" height="20" fill="${shade(o.chim || '#b8a890', -0.2)}" ${olr(1.6)}/>` + [0, 1].map(k => `<rect x="${f(cx + 12 + k * 26)}" y="${f(y - h - 150)}" width="18" height="24" fill="#8a6a50" ${olr(1.2)}/>`).join(''); }
    return g;
  };
  // a Paris town house front: stone ground floor (arch or door), plastered upper floors with timber, windows
  const house = (x, w, top, floorY, seed, o = {}) => {
    const r = rng(seed), wall = o.wall || '#d8ccb4', stone = o.stone || '#a89c88', gf = floorY - (o.gfH || 520);
    let g = `<rect x="${x}" y="${top}" width="${w}" height="${floorY - top}" fill="${wall}" filter="url(#plaster)" ${olr(2.4)}/>`;
    g += S.stoneWall(x, gf, x + w, floorY, stone, seed + 3, 64) + `<rect x="${x}" y="${gf}" width="${w}" height="${floorY - gf}" fill="none" ${olr(2.4)}/>`;
    g += `<rect x="${x - 10}" y="${gf - 24}" width="${w + 20}" height="30" fill="${shade(stone, -0.1)}" ${olr(2)}/>`;
    // floors: a string course per storey and two windows each
    const nf = o.floors || 3, fh = (gf - 24 - top) / nf;
    for (let i = 0; i < nf; i++) {
      const fy = top + i * fh;
      if (i) g += `<path d="M${x},${f(fy)} L${x + w},${f(fy)}" stroke="#5a4030" stroke-width="12"/>`;
      if (o.timber) for (const k of [0.02, 0.5, 0.98]) g += `<path d="M${f(x + w * k)},${f(fy)} L${f(x + w * k)},${f(fy + fh)}" stroke="#4a3020" stroke-width="12"/>`;
      const ww = Math.min(150, w * 0.26), wh = fh * 0.56;
      for (const k of [0.27, 0.73]) { const lit = o.lit ? (r() < (o.litP ?? 0.5) ? o.lit : 0) : 0; g += casement(x + w * k - ww / 2, fy + fh * 0.22, ww, wh, lit, { shutters: o.shutters, frame: o.frame }); }
    }
    // the ground floor: an arched shop opening with a wooden shutter, or a door
    const aw = Math.min(260, w * 0.42), ax = x + w * (o.doorAt ?? 0.3) - aw / 2;
    g += `<path d="M${f(ax)},${floorY} L${f(ax)},${f(gf + 150)} Q${f(ax + aw / 2)},${f(gf + 40)} ${f(ax + aw)},${f(gf + 150)} L${f(ax + aw)},${floorY}Z" fill="${o.lit ? '#3a2416' : '#2a1e16'}" ${olr(2.4)}/>`;
    g += `<path d="M${f(ax + 16)},${floorY} L${f(ax + 16)},${f(gf + 170)} L${f(ax + aw - 16)},${f(gf + 170)} L${f(ax + aw - 16)},${floorY}" fill="#5a3a22" filter="url(#woodV)" ${olr(1.6)}/>`;
    if (o.sign) { const sx = x + w - 30, sy = gf - 10; g += `<path d="M${sx},${sy} L${sx + 150},${sy}" stroke="#1a1410" stroke-width="8"/><path d="M${sx + 20},${sy} C${sx + 60},${sy - 40} ${sx + 110},${sy - 30} ${sx + 150},${sy}" stroke="#1a1410" stroke-width="4" fill="none"/>`; }
    g += roof(x, x + w, top, o.roofH || 300, seed + 7, { col: o.roof, lit: !!o.lit, wall });
    return g;
  };
  S.house15 = house; S.casement = casement;
  // a hanging iron sign that swings (drawn on its own so it can move): x,y = hinge on the bracket
  const sign = (x, y, t, ph, art) => { const a = 4 * Math.sin(t * 1.3 + ph); return `<g transform="rotate(${f(a)} ${x} ${y})"><path d="M${x - 50},${y} L${x - 50},${y + 30} M${x + 50},${y} L${x + 50},${y + 30}" stroke="#1a1410" stroke-width="4"/><rect x="${x - 70}" y="${y + 30}" width="140" height="110" rx="10" fill="#6a4a2a" ${olr(2)}/><rect x="${x - 60}" y="${y + 40}" width="120" height="90" rx="6" fill="#8a6a3a"/>${art(x, y + 85)}</g>`; };
  // Notre-Dame's west front in silhouette (two square towers, the rose, the spire between)
  const notreDame = (x, y, s, col, lit) => `<g transform="translate(${x},${y}) scale(${s})"><path d="M-300,0 L-300,-560 L-130,-560 L-130,-330 L130,-330 L130,-560 L300,-560 L300,0Z" fill="${col}"/>` +
    [-215, 215].map(cx => `<rect x="${cx - 60}" y="-540" width="36" height="140" rx="18" fill="${lit}"/><rect x="${cx + 4}" y="-540" width="36" height="140" rx="18" fill="${lit}"/>`).join('') +
    `<circle cx="0" cy="-220" r="70" fill="none" stroke="${lit}" stroke-width="10"/><path d="M-12,-330 L0,-820 L12,-330Z" fill="${col}"/><path d="M-260,-560 L-260,-590 M-170,-560 L-170,-590 M170,-560 L170,-590 M260,-560 L260,-590" stroke="${col}" stroke-width="16"/>` +
    [-210, 0, 210].map(cx => `<path d="M${cx - 50},0 L${cx - 50},-120 Q${cx},-190 ${cx + 50},-120 L${cx + 50},0Z" fill="${shade(col, -0.25)}"/>`).join('') + `</g>`;
  // the far roofscape of Paris: roofs, chimneys with smoke, a church spire, Notre-Dame
  const city = (mode, t) => {
    const night = mode === 'night', dusk = mode === 'dusk';
    const col = night ? '#2a3044' : dusk ? '#5a4a5a' : '#8a94a4', lit = night ? '#f0b860' : dusk ? '#e89a58' : '#a8b0bc';
    let g = once('pcity' + mode, () => {
      const r = rng(77); let s = notreDame(260, 1260, 0.9, shade(col, -0.08), night ? '#4a5068' : lit);
      s += `<path d="M1500,1260 L1500,700 L1520,560 L1540,700 L1540,1260Z" fill="${col}"/>`;
      let x = -1400; while (x < 2800) { const w = 140 + r() * 200, h = 120 + r() * 220; s += `<path d="M${f(x)},1400 L${f(x)},${f(1400 - h)} L${f(x + w * 0.5)},${f(1400 - h - 90 - r() * 60)} L${f(x + w)},${f(1400 - h)} L${f(x + w)},1400Z" fill="${shade(col, (r() - 0.5) * 0.12)}"/>`; if (r() < 0.6) s += `<rect x="${f(x + w * 0.3)}" y="${f(1400 - h + 30)}" width="22" height="30" fill="${night || dusk ? lit : shade(col, -0.2)}" opacity="${night ? 0.85 : 0.6}"/>`; x += w - 10; }
      return s + `<rect x="-1400" y="1390" width="4200" height="900" fill="${col}"/>`;
    });
    // chimney smoke drifting
    for (const [x, y, ph] of [[-500, 1150, 0], [700, 1120, 2], [1900, 1180, 4]]) { let d = `M${x},${y}`; for (let k = 1; k <= 8; k++) d += ` L${f(x + k * 34 + Math.sin(t * 0.8 + k * 0.7 + ph) * 14)},${f(y - k * 40)}`; g += `<path d="${d}" stroke="${night ? '#5a6074' : '#c8c4c0'}" stroke-width="30" fill="none" opacity="0.28" filter="url(#b8)" stroke-linecap="round"/>`; }
    return g;
  };

  // ======================================================= THE STREET OUTSIDE THE DOCTOR'S HOUSE
  // o.mode 'night' | 'day' | 'dusk'; o.crowd 0..1 (day: the cheering crowd); o.winLit 0..1 the doctor's window.
  // world: street level 1800; the doctor's house x 420..1250 with its door (570..950, 900..1780) and the upper window
  S.PA = { FY: 1800, DOOR: [760, 1780], DOORX: [570, 950], DOORTOP: 900, WIN: [760, 470], WINR: [640, 360, 240, 240], LAMP: [1180, 1000] };
  S.paris = (t, o = {}) => {
    const mode = o.mode || 'night', night = mode === 'night', dusk = mode === 'dusk', L = [];
    // sky
    let sky = once('pS' + mode, () => {
      const st = night ? [[0, '#0a1024'], [0.6, '#1e2a48'], [1, '#3a4058']] : dusk ? [[0, '#2a2a4a'], [0.45, '#8a5a6a'], [0.8, '#e89a68'], [1, '#f4c088']] : [[0, '#6a94c4'], [0.7, '#b8cce0'], [1, '#e8e0cc']];
      let s = `${lg('pask' + mode, st)}<rect x="-3000" y="-3000" width="7000" height="7000" fill="url(#pask${mode})"/>`;
      if (night) { const r = rng(5); for (let i = 0; i < 120; i++) s += `<circle cx="${f(-1400 + r() * 4000)}" cy="${f(-1600 + r() * 2600)}" r="${f(1 + r() * 2.4)}" fill="#fff" opacity="${f(0.3 + r() * 0.6)}"/>`; s += C.radial(-150, 200, 700, '#c8d8ff', 0.4, 'screen') + `<circle cx="-150" cy="200" r="80" fill="#f4f0e0"/><circle cx="-170" cy="185" r="16" fill="#d8d4c4" opacity="0.6"/><circle cx="-125" cy="225" r="10" fill="#d8d4c4" opacity="0.5"/>`; }
      if (dusk) s += C.radial(1600, 1300, 1100, '#ffc890', 0.55, 'screen');
      return s;
    });
    const cc = night ? { body: '#2a3044', lit: '#6a7898', dark: '#141a2a', sun: [-1, 0.4] } : dusk ? { body: '#8a6a7a', lit: '#ffb888', dark: '#4a3a5a', sun: [1, 0.3] } : { sun: [-1, -0.3] };
    for (const [cx, cy, w2, sd] of [[-700, -200, 900, 3], [600, -500, 1000, 5], [1800, -100, 800, 8]]) sky += E.cloud(cx + t * 16, cy, w2, w2 * 0.26, sd, Object.assign({ op: night ? 0.75 : 0.9 }, cc));
    if (!night) sky += E.birds(300 + t * 50, -100, 7, 4, 1.3, '#2a2a30');
    L.push({ p: 0.05, svg: sky });
    L.push({ p: 0.3, svg: city(mode, t) });
    // the houses either side (p 0.8)
    L.push({ p: 0.8, svg: once('pH' + mode, () => {
      const lit = night ? 1 : dusk ? 0.75 : 0;
      let g = house(-1500, 520, 100, 1800, 11, { lit, wall: '#d4c8ae', timber: true, shutters: '#4a5a4a', litP: 0.45 }) + house(-960, 560, -40, 1800, 13, { lit, wall: '#e0d4bc', shutters: '#6a3a2a', floors: 4, litP: 0.4 }) + house(-380, 520, 160, 1800, 17, { lit, wall: '#cfc0a4', timber: true, sign: true, litP: 0.55 });
      g += house(1260, 540, 60, 1800, 19, { lit, wall: '#d8ccb0', shutters: '#3a4a5a', floors: 4, litP: 0.5 }) + house(1820, 560, 180, 1800, 23, { lit, wall: '#cabda0', timber: true, sign: true, litP: 0.4 });
      return g; }) + sign(-110, 1180, t, 0, (x, y) => `<path d="M${x - 30},${y + 20} L${x},${y - 30} L${x + 30},${y + 20}Z" fill="#c9a040"/>`) + sign(2090, 1220, t, 2, (x, y) => `<circle cx="${x}" cy="${y}" r="28" fill="#c9a040"/><path d="M${x - 14},${y} L${x + 14},${y}" stroke="#5a3a1e" stroke-width="6"/>`) });
    // the doctor's house (p 1): an ashlar ground floor, the tall door with a fanlight, the upper floor with the
    // window he watches from, a brass plate, a lantern on an iron bracket
    L.push({ p: 1, svg: once('pD' + mode, () => {
      const W0 = 420, W1 = 1250, wl = night ? 1 : dusk ? 0.6 : 0;
      let g = `<rect x="${W0}" y="-260" width="${W1 - W0}" height="2060" fill="#e2d8c4" filter="url(#plaster)" ${olr(2.6)}/>`;
      g += S.stoneWall(W0, 760, W1, 1800, '#b8ae9a', 41, 70) + `<rect x="${W0}" y="760" width="${W1 - W0}" height="1040" fill="none" ${olr(2.6)}/>`;
      g += `<rect x="${W0 - 14}" y="730" width="${W1 - W0 + 28}" height="36" fill="#a89e88" ${olr(2)}/>`;
      for (const x of [W0, W1 - 60]) g += `<rect x="${x}" y="-260" width="60" height="990" fill="#cfc4ae" filter="url(#plaster)" ${olr(2)}/>`;
      // the upper floor: three windows (the middle one his)
      g += casement(450, 340, 140, 260, wl * 0.8, { frame: '#e8e0cc' });
      g += casement(1000, 340, 140, 260, wl * 0.6, { frame: '#e8e0cc' });
      g += roof(W0, W1, -260, 340, 51, { col: '#454c56', lit: !!wl, wall: '#e2d8c4' });
      // the door: stone surround, a fanlight, two leaves of dark oak with brass studs; a step
      g += `<path d="M540,1800 L540,980 Q760,820 980,980 L980,1800Z" fill="#cfc4ae" ${olr(2.4)}/>`;
      g += `<path d="M570,1790 L570,1000 Q760,860 950,1000 L950,1790Z" fill="#1a120c"/>`;
      g += `<path d="M590,1000 Q760,880 930,1000 L930,1030 L590,1030Z" fill="${wl ? '#e8b060' : '#2a3040'}" ${olr(1.6)}/>` + [0.2, 0.4, 0.6, 0.8].map(k => `<path d="M760,1030 L${f(lerp(590, 930, k))},${f(1000 - 110 * Math.sin(Math.PI * k))}" stroke="#2a2018" stroke-width="5"/>`).join('');
      g += `<rect x="520" y="1780" width="480" height="40" fill="#a89e88" ${olr(2)}/>`;
      g += `<rect x="1020" y="1260" width="90" height="60" rx="6" fill="#c9a040" ${olr(1.6)}/><path d="M1034,1280 L1096,1280 M1034,1298 L1080,1298" stroke="#5a4010" stroke-width="4"/>`;
      // the lantern bracket
      g += `<path d="M1250,880 L1170,880 L1170,920 M1250,940 C1220,900 1200,890 1170,884" stroke="#1a1410" stroke-width="10" fill="none"/>`;
      return g; }) + doorLeaves(o.doorOpen || 0, mode) + upperWin(mode, o) + lantern(t, mode) });
    // the street: cobbles, a central gutter with water catching the light, straw and refuse
    L.push({ p: 1, svg: once('pR' + mode, () => {
      const c1 = night ? '#3a3a44' : dusk ? '#6a5a58' : '#8a8070';
      let g = `<rect x="-2600" y="1790" width="6400" height="1400" fill="${c1}" filter="url(#ground)"/>`;
      const r = rng(9); for (let row = 0; row < 16; row++) for (let x = -2600 + (row % 2) * 30; x < 3800; x += 58 + r() * 12) { const y = 1806 + row * 26 + row * row * 0.9; g += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(25 + row)}" ry="${f(8 + row * 0.6)}" fill="${shade(c1, (r() - 0.3) * 0.3)}" stroke="${shade(c1, -0.45)}" stroke-width="1.5"/>`; }
      g += `<path d="M-2600,2120 C-800,2110 1200,2130 3800,2115 L3800,2160 C1200,2175 -800,2155 -2600,2165Z" fill="${night ? '#1a2234' : '#4a4a48'}" opacity="0.85"/><path d="M-2600,2130 C-800,2120 1200,2140 3800,2125" stroke="${night ? '#8a9ac8' : '#c8c4b8'}" stroke-width="4" fill="none" opacity="0.5"/>`;
      g += E.straw(-2600, 3800, 1800, 2400, 260, 13);
      return g; }) + (night ? `<ellipse cx="${f(1180 + Math.sin(t * 2) * 6)}" cy="2140" rx="60" ry="10" fill="#ffc870" opacity="0.4" filter="url(#b4)"/>` : '') });
    // the crowd for the miracle (behind the speakers): rows of townsfolk cheering
    if (o.crowd) {
      let fc = ''; for (let row = 0; row < 3; row++) for (let i = 0; i < 22; i++) { const x = -1300 + i * 170 + (row % 2) * 80, y = 1820 + row * 50; fc += S.folk(x, y, 0.72 + row * 0.05, 300 + row * 30 + i, t, { wave: o.crowd }); }
      L.push({ p: 0.95, svg: fc });
      let nc = ''; for (let i = 0; i < 12; i++) nc += S.folk(-1300 + i * 330 + (i % 3) * 30, 2380 + (i % 2) * 40, 1.45 + (i % 3) * 0.08, 600 + i, t, { wave: o.crowd });
      L.push({ p: 1.2, svg: `<g filter="url(#dof2)">${nc}</g>` });
    } else {
      // a stone bollard and a barrel in the near foreground (soft)
      L.push({ p: 1.22, svg: once('pF', () => `<g filter="url(#dof2)"><path d="M-260,2600 L-260,1980 Q-180,1900 -100,1980 L-100,2600Z" fill="#4a4844"/><path d="M1300,2600 L1300,2040 C1300,1990 1520,1990 1520,2040 L1520,2600Z" fill="#4a3424"/><path d="M1300,2120 L1520,2120 M1300,2300 L1520,2300" stroke="#2a2a2a" stroke-width="16"/></g>`) });
    }
    // light: moonlight from the upper left at night, lamp pools; sun shafts by day; a warm low sun at dusk
    const lt = night ? `<path d="M-900,-200 L-300,-200 L900,2400 L-200,2400Z" fill="#a8b8e8" opacity="0.07" style="mix-blend-mode:screen" filter="url(#b14)"/>` + C.radial(1180, 1060, 700, '#ffb860', 0.35, 'screen')
      : dusk ? `<path d="M2400,200 L2400,900 L-600,2400 L-600,1700Z" fill="#ffb070" opacity="0.1" style="mix-blend-mode:screen" filter="url(#b14)"/>` + C.radial(1180, 1060, 500, '#ffb860', 0.25, 'screen')
      : `<path d="M-1000,-400 L-300,-400 L1600,2400 L800,2400Z" fill="#fff4d8" opacity="0.09" style="mix-blend-mode:screen" filter="url(#b14)"/>`;
    L.push({ p: 1.02, light: true, svg: lt + S.dust(600, 1500, 900, 500, night ? 26 : 34, 61, t, night ? '#c8d0f0' : '#fff4d8', 2.2, 0.4) });
    return L;
  };
  // the door's two oak leaves (open 0..1: the right leaf swings inward, showing the candlelit hall)
  const doorLeaves = (k, mode) => {
    let g = '';
    if (k > 0.01) g += `<path d="M570,1790 L570,1000 Q760,860 950,1000 L950,1790Z" fill="#7a5030"/>` + C.radial(760, 1300, 420, '#ffc070', 0.5 * k, 'screen') + `<rect x="600" y="1500" width="320" height="290" fill="#3a2414" opacity="0.6"/>`;
    const leaf = (x0, x1, s) => { let d = `<path d="M${x0},1790 L${x0},1040 L${x1},1040 L${x1},1790Z" fill="#3a2416" filter="url(#woodV)" ${olr(2)}/>`; for (const y of [1120, 1400, 1660]) d += `<rect x="${Math.min(x0, x1) + 22}" y="${y}" width="${Math.abs(x1 - x0) - 44}" height="${y === 1120 ? 220 : 200}" fill="none" stroke="#1e140c" stroke-width="6"/>`; for (let i = 0; i < 6; i++) d += `<circle cx="${Math.min(x0, x1) + 16 + i * (Math.abs(x1 - x0) - 32) / 5}" cy="1062" r="5" fill="#c9a040"/>`; d += `<circle cx="${x1 - s * 30}" cy="1450" r="12" fill="#c9a040" ${olr(1.4)}/>`; return d; };
    g += leaf(570, 760, 1);
    const w = 190 * (1 - 0.82 * k);
    g += leaf(950 - w, 950, -1).replace(/<circle cx="[\d.]+" cy="1450"[^>]*>/, '');
    if (k > 0.01) g += `<rect x="${f(950 - w - 4)}" y="1040" width="6" height="750" fill="#000" opacity="0.4"/>`;
    return g;
  };
  // the doctor's own upper window (centre): lit, a curtain he can hold aside (o.curtain 0..1); the shot draws him in it
  const upperWin = (mode, o) => {
    const lit = mode === 'night' ? 1 : mode === 'dusk' ? 0.6 : 0, [x, y, w, h] = S.PA.WINR;
    let g = `<rect x="${x - 18}" y="${y - 18}" width="${w + 36}" height="${h + 36}" fill="#e8e0cc" ${olr(2)}/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${lit ? '#8a5a30' : '#2a3448'}"/>`;
    if (lit) g += C.radial(x + w / 2, y + h * 0.4, 220, '#ffc870', 0.8, 'screen');
    return g;
  };
  // the glazing, mullions and the curtain over whoever stands in the doctor's window (drawn by the shot after him)
  S.paWinFront = (mode, curtain, t) => {
    const [x, y, w, h] = S.PA.WINR, lit = mode === 'night' ? 1 : 0;
    const cw = w * lerp(0.48, 0.12, curtain);
    let g = `<path d="M${x},${y} L${f(x + cw)},${y} C${f(x + cw + 10)},${y + h * 0.5} ${f(x + cw - 6 + Math.sin(t * 1.4) * 4)},${y + h * 0.8} ${f(x + cw * 0.7)},${y + h} L${x},${y + h}Z" fill="#7a2a24" filter="url(#cloth)" opacity="0.95"/><path d="M${x + w},${y} L${f(x + w - w * 0.2)},${y} C${f(x + w - w * 0.22)},${y + h * 0.5} ${f(x + w - w * 0.2)},${y + h * 0.8} ${f(x + w - w * 0.14)},${y + h} L${x + w},${y + h}Z" fill="#7a2a24" filter="url(#cloth)" opacity="0.95"/>`;
    for (let k = 1; k < 4; k++) g += `<path d="M${f(x + w * k / 4)},${y} L${f(x + w * k / 4)},${y + h} M${x},${f(y + h * k / 4)} L${x + w},${f(y + h * k / 4)}" stroke="#2a2a2e" stroke-width="2.4" opacity="0.7"/>`;
    g += `<path d="M${x + w / 2},${y} L${x + w / 2},${y + h} M${x},${y + h * 0.4} L${x + w},${y + h * 0.4}" stroke="#e8e0cc" stroke-width="10"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff" opacity="${lit ? 0.05 : 0.12}"/>`;
    g += `<rect x="${x - 34}" y="${y + h + 16}" width="${w + 68}" height="24" fill="#cfc4ae" ${olr(1.6)}/>`;
    return g;
  };
  const lantern = (t, mode) => {
    const [x, y] = S.PA.LAMP, a = 3 * Math.sin(t * 1.7);
    let g = `<g transform="rotate(${f(a)} ${x} 884)"><path d="M${x},884 L${x},${y - 60}" stroke="#1a1410" stroke-width="5"/><path d="M${x - 40},${y - 60} L${x + 40},${y - 60} L${x + 30},${y - 100} L${x - 30},${y - 100}Z" fill="#2a2420" ${olr(1.6)}/>`;
    g += `<path d="M${x - 36},${y - 60} L${x + 36},${y - 60} L${x + 30},${y + 30} L${x - 30},${y + 30}Z" fill="${mode === 'day' ? '#8a8a7a' : '#ffd890'}" opacity="0.85" ${olr(2)}/><path d="M${x},${y - 60} L${x},${y + 30}" stroke="#2a2420" stroke-width="4"/>`;
    if (mode !== 'day') g += PR.flame(x, y + 10, 1.1, t);
    g += `<path d="M${x - 40},${y + 30} L${x + 40},${y + 30} L${x + 20},${y + 54} L${x - 20},${y + 54}Z" fill="#2a2420" ${olr(1.6)}/></g>`;
    return g;
  };

  // ======================================================= THE DOCTOR'S STUDY (candlelit, night)
  // the doctor stands at x 300 (s 0.82); the drawing pinned on a board to his left (screen right) at BOARD;
  // the desk across the front (p 1.06) with books, an inkwell, a skull, the candelabra
  S.ST15 = { FY: 1800, DOC: [300, 1800], DS: 0.82, BOARD: [760, 1010], BS: 0.92, BR: -2, DESK: 1500, WIN: [-430, 760], CANDLE: [-40, 1330] };
  S.study = (t, o = {}) => {
    const L = [], SB = S.ST15;
    L.push({ p: 0.72, svg: once('stW', () => {
      let g = `<rect x="-1500" y="-800" width="4000" height="3400" fill="#5a4636" filter="url(#plaster)"/>`;
      g += `<rect x="-1500" y="1250" width="4000" height="700" fill="#3a2618" filter="url(#woodV)"/>` + Array.from({ length: 24 }, (_, i) => `<rect x="${-1460 + i * 170}" y="1290" width="140" height="300" rx="6" fill="none" stroke="#1e140c" stroke-width="5"/>`).join('');
      // bookcases behind the doctor, packed shelves of leather spines, a jar with a pickled thing, an hourglass
      for (const [x0, x1] of [[-120, 470], [1220, 1800]]) {
        g += `<rect x="${x0}" y="-100" width="${x1 - x0}" height="1400" fill="#2a1a10" filter="url(#woodV)" ${olr(2.4)}/>`;
        const r = rng(x0 + 999);
        for (let y = 0; y < 1250; y += 210) {
          g += `<rect x="${x0}" y="${y + 180}" width="${x1 - x0}" height="24" fill="#4a3020" ${olr(1.6)}/>`;
          let x = x0 + 14; while (x < x1 - 40) { const w = 24 + r() * 26, h = 120 + r() * 50, c = ['#6a1a14', '#2a3a2a', '#5a3a1a', '#3a2a4a', '#7a5a2a', '#1a2a3a'][Math.floor(r() * 6)]; if (r() < 0.12) { g += `<path d="M${f(x)},${y + 180} L${f(x + h * 0.7)},${f(y + 180 - w)} L${f(x + h * 0.7 + w * 0.4)},${y + 180}Z" fill="${c}" ${olr(1.2)}/>`; x += h * 0.7 + 8; continue; } g += `<rect x="${f(x)}" y="${f(y + 180 - h)}" width="${f(w)}" height="${f(h)}" fill="${c}" ${olr(1.2)}/><path d="M${f(x + 4)},${f(y + 180 - h + 20)} L${f(x + w - 4)},${f(y + 180 - h + 20)} M${f(x + 4)},${f(y + 170)} L${f(x + w - 4)},${f(y + 170)}" stroke="#c9a040" stroke-width="2.4" opacity="0.7"/>`; x += w + 2; }
        }
        g += `<rect x="${x0 - 20}" y="-120" width="${x1 - x0 + 40}" height="40" fill="#4a3020" ${olr(2)}/>`;
      }
      // jars on the shelf: a pickled snake, a heart
      g += `<g transform="translate(320,600)"><rect x="-40" y="-150" width="90" height="150" rx="16" fill="#a8b888" opacity="0.6" ${olr(1.6)}/><path d="M-20,-30 C-30,-80 30,-60 10,-110 C0,-130 20,-140 26,-120" stroke="#6a5a3a" stroke-width="12" fill="none"/><rect x="-46" y="-164" width="102" height="20" rx="6" fill="#5a3a1e"/></g>`;
      g += `<g transform="translate(1500,390)"><rect x="-44" y="-150" width="96" height="150" rx="16" fill="#c8a888" opacity="0.6" ${olr(1.6)}/><path d="M4,-30 C-40,-60 -20,-110 4,-90 C28,-110 48,-60 4,-30Z" fill="#8a2a2a"/><rect x="-50" y="-164" width="108" height="20" rx="6" fill="#5a3a1e"/></g>`;
      // the window at the left: night, the moon on the roofs, glass panes
      const [wx, wy] = SB.WIN;
      g += `<rect x="${wx - 220}" y="${wy - 420}" width="440" height="840" fill="#3a2a1e" ${olr(2.4)}/><rect x="${wx - 190}" y="${wy - 390}" width="380" height="780" fill="#1a2238"/>` + C.radial(wx - 60, wy - 200, 260, '#c8d4f0', 0.4, 'screen') + `<circle cx="${wx - 60}" cy="${wy - 200}" r="34" fill="#eeeadc"/>`;
      g += `<path d="M${wx - 190},${wy + 300} L${wx - 120},${wy + 200} L${wx - 40},${wy + 250} L${wx + 30},${wy + 140} L${wx + 110},${wy + 230} L${wx + 190},${wy + 180} L${wx + 190},${wy + 390} L${wx - 190},${wy + 390}Z" fill="#141a2a"/>`;
      g += `<defs><clipPath id="stwin"><rect x="${wx - 190}" y="${wy - 390}" width="380" height="780"/></clipPath></defs><g clip-path="url(#stwin)">`;
      for (let k = -12; k < 12; k++) g += `<path d="M${wx - 190 + k * 70},${wy - 390} l780,780 M${wx - 190 + k * 70},${wy - 390} l-780,780" stroke="#2a2018" stroke-width="3" opacity="0.8"/>`;
      g += `</g><path d="M${wx},${wy - 390} L${wx},${wy + 390} M${wx - 190},${wy} L${wx + 190},${wy}" stroke="#3a2a1e" stroke-width="16"/>`;
      // an anatomical chart pinned on the wall: a figure with its veins
      g += `<g transform="translate(1050,420)"><rect x="-120" y="-200" width="240" height="380" fill="#e0d4b4" filter="url(#tex)" ${olr(2)}/><g stroke="#2a1a10" stroke-width="3" fill="none"><circle cx="0" cy="-140" r="26"/><path d="M0,-114 L0,40 M-50,-80 L50,-80 M-50,-80 L-70,20 M50,-80 L70,20 M0,40 L-36,150 M0,40 L36,150"/></g><path d="M0,-100 L0,30 M0,-80 L-60,0 M0,-80 L60,0 M0,30 L-30,140 M0,30 L30,140" stroke="#a82020" stroke-width="3" fill="none"/><path d="M-4,-70 C-14,-82 -2,-92 0,-80 C2,-92 14,-82 4,-70 L0,-62Z" fill="#a82020"/></g>`;
      return g; }) });
    // the drawing board on its easel (p 1, behind the doctor's arm): the drawing pinned on it
    L.push({ p: 1, svg: once('stB', () => {
      const [bx, by] = SB.BOARD;
      let g = `<path d="M${bx - 260},1800 L${bx - 120},${by - 300} M${bx + 260},1800 L${bx + 120},${by - 300} M${bx},1800 L${bx},${by + 260}" stroke="#4a3020" stroke-width="22" stroke-linecap="round"/>`;
      g += `<rect x="${bx - 330}" y="${by - 260}" width="660" height="490" fill="#6a4a2a" filter="url(#woodV)" ${olr(2.4)}/><rect x="${bx - 340}" y="${by + 226}" width="680" height="30" fill="#4a3020" ${olr(2)}/>`;
      return g; }) + PR.drawing(SB.BOARD[0], SB.BOARD[1], SB.BS, { tubeDash: o.tubeDash || 'none', rot: SB.BR }) + [[-290, -205], [290, -215], [-286, 205], [292, 196]].map(([x, y]) => `<circle cx="${f(SB.BOARD[0] + x * SB.BS)}" cy="${f(SB.BOARD[1] + y * SB.BS)}" r="8" fill="#c9a040" ${olr(1.2)}/>`).join('') });
    // the floor
    L.push({ p: 1, svg: once('stF', () => `<rect x="-1500" y="1790" width="4000" height="900" fill="#3a2414" filter="url(#woodH)"/>` + Array.from({ length: 18 }, (_, i) => `<path d="M-1500,${1800 + i * 44} L2500,${1800 + i * 44}" stroke="#1e120a" stroke-width="2.5" opacity="0.6"/>`).join('') + `<path d="M-300,1840 L1300,1840 L1500,2400 L-500,2400Z" fill="#5a1a1a" filter="url(#cloth)" opacity="0.85"/>`) });
    // the desk in front (p 1.06): papers, an inkwell with a quill, a skull, an open book, the candelabra
    const desk = once('stD', () => {
      const y = SB.DESK;
      let g = `<rect x="-700" y="${y}" width="1300" height="40" fill="#5a3a20" filter="url(#woodH)" ${olr(2.4)}/><rect x="-680" y="${y + 40}" width="1260" height="700" fill="#3a2414" filter="url(#woodV)" ${olr(2.4)}/>`;
      g += `<path d="M-500,${y} L-300,${y - 14} L-120,${y} Z" fill="#e8dcbc" ${olr(1.4)}/><path d="M-260,${y} L-120,${y - 18} L40,${y - 4} L-80,${y + 4}Z" fill="#efe4c8" ${olr(1.4)}/>`;
      g += `<g transform="translate(-560,${y})"><path d="M-60,0 C-70,-70 -30,-110 0,-110 C30,-110 70,-70 60,0Z" fill="#e8e0cc" ${olr(2)}/><ellipse cx="-22" cy="-60" rx="16" ry="18" fill="#2a1a10"/><ellipse cx="22" cy="-60" rx="16" ry="18" fill="#2a1a10"/><path d="M-4,-36 L4,-36 L0,-26Z" fill="#2a1a10"/><path d="M-30,-10 L30,-10" stroke="#2a1a10" stroke-width="3" stroke-dasharray="6 4"/></g>`;
      g += `<g transform="translate(160,${y})"><path d="M-30,0 L-24,-40 L24,-40 L30,0Z" fill="#1a1a20" ${olr(1.6)}/><path d="M0,-40 C10,-120 40,-200 60,-260" stroke="#ece4d4" stroke-width="5" fill="none"/><path d="M40,-180 C70,-220 80,-250 60,-262 C50,-230 40,-210 40,-180Z" fill="#ece4d4" ${olr(1.2)}/></g>`;
      return g;
    });
    const [cx, cy] = SB.CANDLE;
    let cand = `<path d="M${cx - 70},${cy + 170} L${cx + 70},${cy + 170} L${cx + 20},${cy + 150} L${cx + 10},${cy + 20} L${cx - 10},${cy + 20} L${cx - 20},${cy + 150}Z" fill="#b8902e" ${olr(1.6)}/><path d="M${cx - 110},${cy + 20} Q${cx},${cy + 80} ${cx + 110},${cy + 20}" stroke="#b8902e" stroke-width="12" fill="none"/>`;
    for (const dx of [-110, 0, 110]) cand += `<rect x="${cx + dx - 12}" y="${cy - (dx ? 60 : 90)}" width="24" height="${dx ? 80 : 110}" fill="#efe6d0" ${olr(1.4)}/>`;
    for (const dx of [-110, 0, 110]) cand += PR.flame(cx + dx, cy - (dx ? 62 : 92), 1.2, t + dx);
    L.push({ p: 1.06, svg: desk + cand });
    // candle glow and warm haze; dust in the air
    L.push({ p: 1.02, light: true, svg: C.radial(cx, cy - 80, 900, '#ffb860', 0.32, 'screen') + C.radial(SB.WIN[0], SB.WIN[1], 600, '#8aa0d0', 0.12, 'screen') + S.dust(400, 1100, 700, 600, 30, 71, t, '#ffe8c0', 2.2, 0.4) });
    return L;
  };

  // ======================================================= THE TRANSFUSION ROOM
  // o.mode 'eve' (candles, dusk window) | 'night' (moon, one candle; colder)
  // the calf lies bound on a table at the left (TABLE top 1430, calf origin CALF); you sit strapped in a chair at
  // the right (YOU, s 0.78) with your right arm out along a board toward the calf; the tube runs between
  S.SU = { FY: 1800, TABLE: [-560, 300, 1430], CALF: [-60, 1430], CS: 0.74, YOU: [860, 1985], YS: 0.78, BOARD: [360, 760, 1222], WIN: [380, 560] };
  S.surgery = (t, o = {}) => {
    const L = [], night = o.mode === 'night', U = S.SU;
    L.push({ p: 0.72, svg: once('suW' + o.mode, () => {
      let g = S.stoneWall(-1600, -800, 2600, 1900, night ? '#5a5a62' : '#8a7c68', 81, 80);
      // the tall window: dusk sky and roofs, or the night with a moon; iron bars
      const [wx, wy] = U.WIN;
      g += `<path d="M${wx - 200},${wy + 520} L${wx - 200},${wy - 300} Q${wx},${wy - 520} ${wx + 200},${wy - 300} L${wx + 200},${wy + 520}Z" fill="#4a4038" ${olr(2.4)}/>`;
      g += `<defs><clipPath id="suwin${o.mode}"><path d="M${wx - 170},${wy + 500} L${wx - 170},${wy - 290} Q${wx},${wy - 480} ${wx + 170},${wy - 290} L${wx + 170},${wy + 500}Z"/></clipPath></defs><g clip-path="url(#suwin${o.mode})">`;
      g += night ? `${lg('suns', [[0, '#0e1428'], [1, '#2a3450']])}<rect x="${wx - 200}" y="${wy - 520}" width="400" height="1040" fill="url(#suns)"/>` + C.radial(wx + 60, wy - 200, 200, '#d0dcff', 0.5, 'screen') + `<circle cx="${wx + 60}" cy="${wy - 200}" r="40" fill="#f0ece0"/>`
        : `${lg('suds', [[0, '#3a3a5a'], [0.6, '#b0707a'], [1, '#f0a868']])}<rect x="${wx - 200}" y="${wy - 520}" width="400" height="1040" fill="url(#suds)"/>`;
      g += `<path d="M${wx - 200},${wy + 360} L${wx - 120},${wy + 250} L${wx - 40},${wy + 300} L${wx + 40},${wy + 170} L${wx + 120},${wy + 280} L${wx + 200},${wy + 230} L${wx + 200},${wy + 520} L${wx - 200},${wy + 520}Z" fill="${night ? '#0a0e1a' : '#3a2a3a'}"/>`;
      g += `</g>` + [-90, 0, 90].map(dx => `<path d="M${wx + dx},${wy - 420} L${wx + dx},${wy + 500}" stroke="#1a1410" stroke-width="10"/>`).join('') + `<path d="M${wx - 170},${wy + 80} L${wx + 170},${wy + 80}" stroke="#1a1410" stroke-width="10"/><rect x="${wx - 230}" y="${wy + 500}" width="460" height="40" fill="#6a5e50" ${olr(2)}/>`;
      // shelves at the right: jars, bowls, instruments hanging from hooks (saw, knives, a lancet case)
      g += `<rect x="900" y="300" width="560" height="26" fill="#4a3020" ${olr(2)}/><rect x="900" y="560" width="560" height="26" fill="#4a3020" ${olr(2)}/>`;
      const r = rng(83); for (const y of [300, 560]) for (let i = 0; i < 6; i++) { const x = 930 + i * 88 + r() * 10, h = 80 + r() * 60, c = ['#7a8a6a', '#a89878', '#5a6a7a', '#c8b898'][Math.floor(r() * 4)]; g += r() < 0.5 ? `<rect x="${f(x)}" y="${f(y - h)}" width="60" height="${f(h)}" rx="12" fill="${c}" opacity="0.75" ${olr(1.4)}/><rect x="${f(x - 4)}" y="${f(y - h - 12)}" width="68" height="14" rx="4" fill="#5a3a1e"/>` : `<path d="M${f(x - 10)},${y} C${f(x - 10)},${f(y - h * 0.6)} ${f(x + 70)},${f(y - h * 0.6)} ${f(x + 70)},${y}Z" fill="${c}" ${olr(1.4)}/>`; }
      g += `<path d="M900,700 L1460,700" stroke="#2a2018" stroke-width="8"/>` + [960, 1080, 1200, 1330].map((x, i) => `<path d="M${x},700 L${x},720" stroke="#2a2018" stroke-width="5"/>` + [`<path d="M${x - 14},720 L${x + 14},720 L${x + 10},900 L${x - 10},900Z" fill="#9a9aa0" ${olr(1.4)}/><rect x="${x - 16}" y="900" width="32" height="70" fill="#5a3a1e"/>`, `<path d="M${x},720 L${x - 30},880 L${x + 10},880Z" fill="#b8b8c0" ${olr(1.4)}/><rect x="${x - 34}" y="876" width="48" height="60" fill="#4a3020"/>`, `<rect x="${x - 50}" y="720" width="100" height="140" rx="6" fill="#5a2a1a" ${olr(1.4)}/><path d="M${x - 30},760 L${x + 30},760 M${x - 30},800 L${x + 30},800" stroke="#c9a040" stroke-width="3"/>`, `<path d="M${x - 40},720 L${x + 40},720 L${x + 40},760 L${x + 60},760 L${x + 40},900 L${x - 40},900Z" fill="#a8a8b0" ${olr(1.4)}/><path d="M${x - 40},860 L${x + 40},860" stroke="#5a5a60" stroke-width="3" stroke-dasharray="6 6"/>`][i]).join('');
      // the anatomical chart at the left: the heart and the great vessels
      g += `<g transform="translate(-300,420)"><rect x="-150" y="-220" width="300" height="420" fill="#d8ccac" filter="url(#tex)" ${olr(2)}/><path d="M-6,-20 C-60,-80 -100,0 -6,80 C88,0 48,-80 -6,-20Z" fill="#9a2a24" ${olr(2)}/><path d="M-20,-50 L-30,-170 M10,-50 L30,-170 M-6,80 L-6,170 M-60,0 L-120,-60 M48,0 L110,-40" stroke="#5a2a7a" stroke-width="10" fill="none" opacity="0.8"/><path d="M-16,-50 L-24,-170 M14,-50 L36,-170" stroke="#a82020" stroke-width="8" fill="none"/></g>`;
      g += `<rect x="-1600" y="1720" width="4200" height="90" fill="${night ? '#3a3a40' : '#5a4e40'}" opacity="0.5"/>`;
      return g; }) });
    // tall iron candle stands (p 0.9); at night only the left one burns low
    let cs = '';
    for (const [x, on] of [[-980, 1], [1450, night ? 0 : 1]]) {
      cs += `<path d="M${x - 70},1800 L${x},1720 L${x + 70},1800 M${x},1720 L${x},900" stroke="#1a1410" stroke-width="12" fill="none"/><path d="M${x - 50},900 L${x + 50},900 L${x + 30},930 L${x - 30},930Z" fill="#2a2420" ${olr(1.6)}/>`;
      cs += `<rect x="${x - 18}" y="${on ? 760 : 820}" width="36" height="${on ? 140 : 80}" fill="#ece2c8" ${olr(1.4)}/>`;
      if (on) cs += PR.flame(x, 758, 1.6, t + x);
      else cs += `<path d="M${x},818 C${x - 10},${780 + Math.sin(t * 2) * 6} ${x + 14},740 ${x + Math.sin(t) * 10},690" stroke="#c8c4c0" stroke-width="5" fill="none" opacity="0.4" filter="url(#b2)"/>`;
    }
    L.push({ p: 0.9, svg: cs });
    // the floor: worn flagstones, straw, a dark old stain
    L.push({ p: 1, svg: once('suF' + o.mode, () => {
      const c1 = night ? '#4a4a50' : '#6a5e50';
      let g = `<rect x="-1800" y="1790" width="4600" height="1200" fill="${c1}" filter="url(#ground)"/>`;
      for (let row = 0; row < 8; row++) { const y = 1800 + row * 70 + row * row * 6; g += `<path d="M-1800,${y} L2800,${y}" stroke="${shade(c1, -0.4)}" stroke-width="3"/>`; for (let x = -1800 + (row % 2) * 120; x < 2800; x += 240 + row * 20) g += `<path d="M${x},${y} L${x - row * 6},${y + 70 + row * 12}" stroke="${shade(c1, -0.4)}" stroke-width="3"/>`; }
      g += `<ellipse cx="600" cy="1960" rx="180" ry="40" fill="#3a1410" opacity="0.4" filter="url(#b8)"/>` + E.straw(-1800, 2800, 1800, 2400, 160, 23);
      return g; }) });
    // near foreground: a copper basin on a stool with a stained cloth (soft)
    L.push({ p: 1.2, svg: once('suN', () => `<g filter="url(#dof2)"><path d="M1260,2600 L1290,2160 L1560,2160 L1590,2600Z" fill="#3a2414"/><ellipse cx="1425" cy="2150" rx="200" ry="44" fill="#a8683a"/><ellipse cx="1425" cy="2142" rx="170" ry="30" fill="#5a1a14"/><path d="M1240,2150 C1260,2260 1300,2340 1330,2400" stroke="#c8b8a0" stroke-width="40" fill="none"/></g>`) });
    // light: warm candle pools, the window's cool light; dust in the air
    const lt = (night ? C.radial(-980, 800, 900, '#ffb060', 0.22, 'screen') + `<path d="${`M${U.WIN[0] - 170},${U.WIN[1] - 300} L${U.WIN[0] + 170},${U.WIN[1] - 300} L${U.WIN[0] + 600},2200 L${U.WIN[0] - 100},2200Z`}" fill="#a8b8e8" opacity="0.08" style="mix-blend-mode:screen" filter="url(#b14)"/>`
      : C.radial(-980, 800, 1000, '#ffb060', 0.3, 'screen') + C.radial(1450, 800, 900, '#ffb060', 0.28, 'screen') + `<path d="${`M${U.WIN[0] - 170},${U.WIN[1] - 300} L${U.WIN[0] + 170},${U.WIN[1] - 300} L${U.WIN[0] + 500},2200 L${U.WIN[0] - 200},2200Z`}" fill="#f0b8a8" opacity="0.07" style="mix-blend-mode:screen" filter="url(#b14)"/>`);
    L.push({ p: 1.02, light: true, svg: lt + S.dust(500, 1100, 800, 600, 32, 91, t, night ? '#c8d0f0' : '#ffe8c0', 2.2, 0.4) });
    return L;
  };
  // the table the calf lies on, the board your arm rests on, your chair (drawn by the shots in order)
  S.suTable = () => { const [x0, x1, y] = S.SU.TABLE; return `<rect x="${x0}" y="${y}" width="${x1 - x0}" height="36" fill="#6a4a2a" filter="url(#woodH)" ${olr(2.4)}/><rect x="${x0 + 10}" y="${y + 36}" width="${x1 - x0 - 20}" height="40" fill="#4a3020" ${olr(2)}/>` + [x0 + 40, x1 - 70].map(x => `<rect x="${x}" y="${y + 76}" width="34" height="${1800 - y - 76}" fill="#4a3020" filter="url(#woodV)" ${olr(2)}/>`).join('') + `<path d="M${x0 + 20},${y + 6} C${(x0 + x1) / 2},${y + 20} ${(x0 + x1) / 2},${y + 20} ${x1 - 20},${y + 6}" stroke="#d8ccb4" stroke-width="10" fill="none" opacity="0.6"/>`; };
  S.suBoard = () => { const [x0, x1, y] = S.SU.BOARD; return `<path d="M${x0},${y} L${x1},${y} L${x1},${y + 30} L${x0},${y + 30}Z" fill="#7a5a36" filter="url(#woodH)" ${olr(2)}/><path d="M${x0 + 40},${y + 30} L${x0 + 60},1800" stroke="#4a3020" stroke-width="20"/>` + `<path d="M${x0 + 90},${y - 4} L${x0 + 90},${y + 34} M${x0 + 120},${y - 4} L${x0 + 120},${y + 34}" stroke="#3a2414" stroke-width="10"/>`; };
  S.suChairBack = (x, y0) => `<path d="M${x - 190},${y0 + 520} L${x - 190},${y0 - 30} C${x - 190},${y0 - 90} ${x - 150},${y0 - 120} ${x - 100},${y0 - 120} L${x + 100},${y0 - 120} C${x + 150},${y0 - 120} ${x + 190},${y0 - 90} ${x + 190},${y0 - 30} L${x + 190},${y0 + 520}Z" fill="#4a3020" filter="url(#woodV)" ${olr(2.4)}/><path d="M${x - 150},${y0 - 60} L${x + 150},${y0 - 60} L${x + 150},${y0 + 480} L${x - 150},${y0 + 480}Z" fill="#5a2a1a" filter="url(#cloth)"/>`;
  S.suChairArms = (x, y) => `<rect x="${x - 220}" y="${y}" width="90" height="30" rx="10" fill="#5a3a20" ${olr(2)}/><rect x="${x + 130}" y="${y}" width="90" height="30" rx="10" fill="#5a3a20" ${olr(2)}/><path d="M${x - 200},${y + 30} L${x - 200},1800 M${x + 200},${y + 30} L${x + 200},1800" stroke="#4a3020" stroke-width="26"/>`;

  // ======================================================= YOUR HOME
  // o.mode 'night' | 'day' | 'flash'; o.dawn 0..1 (the window goes from night to morning; light floods in)
  // world: floor 1800; the bed at x -950..-150 (the shot draws it), the window above it at WIN; the table at
  // x 100..760; the hearth at x 950..1350 with the soup pot; the door at x 1640..1900
  S.HM = { FY: 1800, WIN: [-560, 700], BED: [-950, -150], TABLE: [100, 760, 1440], FIRE: [1150, 1770], POT: [1150, 1560], DOOR: [1640, 1900] };
  S.home = (t, o = {}) => {
    const L = [], H = S.HM, dawn = cl(o.dawn ?? (o.mode === 'night' ? 0 : 1)), night = o.mode === 'night';
    const wallC = o.mode === 'flash' ? '#9a7a58' : '#8a7660';
    // the window: night sky (stars, roofs) cross-fading to dawn (gold on the roofs)
    const [wx, wy] = H.WIN;
    let win = `<rect x="${wx - 190}" y="${wy - 230}" width="380" height="460" fill="#3a2a1e" ${olr(2.4)}/>`;
    win += `<defs><clipPath id="hmwin"><rect x="${wx - 160}" y="${wy - 200}" width="320" height="400"/></clipPath></defs><g clip-path="url(#hmwin)">`;
    win += `<rect x="${wx - 160}" y="${wy - 200}" width="320" height="400" fill="#141c34"/>`;
    if (dawn > 0) win += `<rect x="${wx - 160}" y="${wy - 200}" width="320" height="400" fill="#f0c890" opacity="${f(dawn)}"/>` + C.radial(wx + 80, wy + 120, 300, '#fff0c0', 0.8 * dawn, 'screen');
    win += `<path d="M${wx - 160},${wy + 120} L${wx - 100},${wy + 40} L${wx - 20},${wy + 90} L${wx + 40},${wy + 10} L${wx + 110},${wy + 70} L${wx + 160},${wy + 30} L${wx + 160},${wy + 200} L${wx - 160},${wy + 200}Z" fill="${mix('#0a0e1a', '#7a5a4a', dawn)}"/></g>`;
    win += `<path d="M${wx},${wy - 200} L${wx},${wy + 200} M${wx - 160},${wy} L${wx + 160},${wy}" stroke="#3a2a1e" stroke-width="14"/><rect x="${wx - 210}" y="${wy + 230}" width="420" height="30" fill="#5a4030" ${olr(2)}/>`;
    // the shutters swing open with the morning
    const sh = 1 - 0.85 * dawn;
    for (const s of [-1, 1]) { const w = 170 * sh, x0 = s < 0 ? wx - 160 : wx + 160 - w; win += `<rect x="${f(x0)}" y="${wy - 200}" width="${f(w)}" height="400" fill="#4a3020" filter="url(#woodV)" ${olr(2)}/>`; }
    L.push({ p: 0.78, svg: once('hmW' + o.mode, () => {
      let g = `<rect x="-1700" y="-700" width="4400" height="3000" fill="${wallC}" filter="url(#plaster)"/>`;
      // the timber frame: posts, a rail, braces
      for (const x of [-1100, -200, 860, 1500, 2100]) g += `<rect x="${x - 26}" y="-700" width="52" height="2600" fill="#3a2414" filter="url(#woodV)" ${olr(2)}/>`;
      g += `<rect x="-1700" y="1180" width="4400" height="40" fill="#3a2414" filter="url(#woodH)" ${olr(2)}/>`;
      // a crucifix above the bed, a shelf with jugs and bread, bunches of herbs and garlic from the beam
      g += `<g transform="translate(-780,520)"><path d="M0,-90 L0,110 M-50,-30 L50,-30" stroke="#3a2414" stroke-width="18"/><path d="M0,-30 L-6,60 L6,60Z" fill="#c8b090"/></g>`;
      g += `<rect x="150" y="760" width="560" height="24" fill="#4a3020" ${olr(2)}/>` + [[200, '#8a5a3a', 90], [300, '#c8b090', 120], [420, '#6a4a3a', 80], [520, '#a87a4a', 110], [630, '#e8dcc0', 60]].map(([x, c, h]) => `<path d="M${x - 34},760 C${x - 40},${760 - h * 0.7} ${x - 20},${760 - h} ${x},${760 - h} C${x + 20},${760 - h} ${x + 40},${760 - h * 0.7} ${x + 34},760Z" fill="${c}" ${olr(1.4)}/>`).join('');
      g += `<path d="M-1700,-120 L2700,-120" stroke="#2a1a10" stroke-width="60"/>` + [-600, -300, 300, 600].map((x, i) => `<path d="M${x},-90 L${x},20" stroke="#5a4a2a" stroke-width="3"/><path d="M${x - 30},20 C${x - 34},90 ${x + 34},90 ${x + 30},20Z" fill="${['#5a6a3a', '#e8e0cc', '#6a7a3a', '#d8d0b8'][i]}" ${olr(1.4)}/>`).join('');
      // the door at the right
      const [d0, d1] = H.DOOR;
      g += `<rect x="${d0 - 30}" y="900" width="${d1 - d0 + 60}" height="900" fill="#2a1a10" ${olr(2.4)}/><rect x="${d0}" y="930" width="${d1 - d0}" height="870" fill="#5a3a22" filter="url(#woodV)" ${olr(2)}/>` + [1050, 1550].map(y => `<rect x="${d0 + 10}" y="${y}" width="${d1 - d0 - 20}" height="34" fill="#2a2420"/>`).join('') + `<circle cx="${d0 + 40}" cy="1360" r="14" fill="#2a2420"/>`;
      g += `<rect x="-1700" y="1700" width="4400" height="110" fill="#000" opacity="0.18"/>`;
      return g; }) + win });
    // the hearth (p 0.9): the stone chimney breast, the fire, a pot of soup on its chain, logs, tools
    const [fx, fy] = H.FIRE;
    let hearth = once('hmH', () => {
      let g = S.stoneWall(930, -700, 1370, 1800, '#8a8070', 93, 60) + `<rect x="930" y="-700" width="440" height="2500" fill="none" ${olr(2.4)}/>`;
      g += `<path d="M990,1800 L990,1380 L1310,1380 L1310,1800Z" fill="#1a1210" ${olr(2.4)}/><rect x="960" y="1340" width="380" height="50" fill="#6a5e50" ${olr(2)}/>`;
      g += `<path d="M1040,1790 L1260,1760 M1050,1760 L1250,1790" stroke="#4a2e18" stroke-width="30" stroke-linecap="round"/>`;
      g += `<path d="M1150,1390 L1150,1500" stroke="#2a2420" stroke-width="6"/>`;
      return g;
    });
    hearth += S.flames(fx, fy - 10, 190, 170, t, 31, 1);
    // the pot: an iron cauldron, broth showing at its lip, steam rising
    const [px, py] = H.POT;
    hearth += `<path d="M${px - 100},${py - 50} C${px - 110},${py + 50} ${px - 60},${py + 90} ${px},${py + 92} C${px + 60},${py + 90} ${px + 110},${py + 50} ${px + 100},${py - 50}Z" fill="#2a2624" ${olr(2.4)}/><ellipse cx="${px}" cy="${py - 50}" rx="104" ry="20" fill="#3a3430" ${olr(2)}/><ellipse cx="${px}" cy="${py - 48}" rx="88" ry="13" fill="#a8783a"/><path d="M${px - 100},${py - 50} Q${px},${py - 160} ${px + 100},${py - 50}" stroke="#2a2420" stroke-width="5" fill="none"/>`;
    for (let i = 0; i < 4; i++) { const ph = (t * 0.35 + i * 0.25) % 1; hearth += `<path d="M${px - 50 + i * 34},${f(py - 60 - ph * 160)} q-16,-34 0,-68 q16,-34 0,-68" stroke="#f4f0e8" stroke-width="12" fill="none" opacity="${f(0.22 * Math.sin(ph * Math.PI))}" filter="url(#b4)"/>`; }
    L.push({ p: 0.9, svg: hearth });
    // the floor: wide boards and scattered rushes
    L.push({ p: 1, svg: once('hmF', () => `<rect x="-1800" y="1790" width="4600" height="1200" fill="#4a3220" filter="url(#woodH)"/>` + Array.from({ length: 16 }, (_, i) => `<path d="M-1800,${1800 + i * 50} L2800,${1800 + i * 50}" stroke="#24160c" stroke-width="2.5" opacity="0.6"/>`).join('') + E.straw(-1800, 2800, 1800, 2400, 200, 33, '#8a7a4a')) });
    // light: firelight from the hearth (flickers), the candle by the bed at night, morning sun through the window
    const fl = 0.85 + 0.15 * Math.sin(t * 9) * Math.sin(t * 5.3);
    let lt = C.radial(fx, fy - 120, 1100, '#ff9a40', 0.3 * fl * (1 - 0.5 * dawn), 'screen');
    if (dawn > 0) lt += `<path d="M${wx - 160},${wy - 200} L${wx + 160},${wy - 200} L${wx + 900},2300 L${wx + 200},2300Z" fill="#fff0c8" opacity="${f(0.16 * dawn)}" style="mix-blend-mode:screen" filter="url(#b14)"/>` + S.dust(wx + 380, 1300, 300, 700, 30, 101, t, '#fff4d8', 2.4, 0.6 * dawn);
    if (night) lt += `<rect x="-2000" y="-1000" width="5000" height="4000" fill="#0a1030" opacity="${f(0.25 * (1 - dawn))}" style="mix-blend-mode:multiply"/>`;
    L.push({ p: 1.02, light: true, svg: lt });
    return L;
  };
  // the bed (head at the left): the headboard behind you, the straw mattress; the blanket is drawn over you
  S.hmBedBack = () => { const [x0, x1] = S.HM.BED; return `<rect x="${x0}" y="1080" width="70" height="720" fill="#4a3020" filter="url(#woodV)" ${olr(2.4)}/><rect x="${x0 - 10}" y="1060" width="90" height="40" rx="10" fill="#5a3a22" ${olr(2)}/><rect x="${x1 - 50}" y="1400" width="60" height="400" fill="#4a3020" filter="url(#woodV)" ${olr(2.4)}/><path d="M${x0 + 60},1520 L${x1},1520 L${x1},1640 L${x0 + 60},1640Z" fill="#5a3a22" ${olr(2)}/><path d="M${x0 + 60},1440 C${x0 + 300},1420 ${x1 - 200},1420 ${x1 - 10},1440 L${x1 - 10},1530 L${x0 + 60},1530Z" fill="#c8b890" filter="url(#cloth)" ${olr(2)}/><path d="M${x0 + 70},1430 C${x0 + 70},1360 ${x0 + 260},1350 ${x0 + 280},1420 L${x0 + 280},1470 L${x0 + 70},1470Z" fill="#e8e0cc" filter="url(#cloth)" ${olr(2)}/>`; };
  S.hmBlanket = (x0, x1, top, sit = 0) => `<path d="M${f(x0)},${f(top)} C${f(x0 + 40)},${f(top - 30)} ${f((x0 + x1) / 2)},${f(top - 50 - 30 * sit)} ${f(x1)},${f(top - 10)} L${f(x1 + 20)},1560 C${f((x0 + x1) / 2)},1580 ${f(x0 + 60)},1580 ${f(x0 - 10)},1560Z" fill="#6a3a2a" filter="url(#cloth)" ${olr(2.4)}/><path d="M${f(x0 + 80)},${f(top + 10)} C${f(x0 + 200)},${f(top + 60)} ${f(x0 + 300)},1500 ${f(x0 + 330)},1550 M${f((x0 + x1) / 2 + 60)},${f(top - 20)} C${f((x0 + x1) / 2 + 100)},${f(top + 80)} ${f((x0 + x1) / 2 + 120)},1500 ${f((x0 + x1) / 2 + 140)},1550" stroke="#3a1a10" stroke-width="10" fill="none" opacity="0.4" filter="url(#b4)"/><path d="M${f(x0)},${f(top)} C${f(x0 + 40)},${f(top - 30)} ${f((x0 + x1) / 2)},${f(top - 50 - 30 * sit)} ${f(x1)},${f(top - 10)}" stroke="#e8dcc0" stroke-width="18" fill="none"/>`;
  // the table (front edge y; legs to the floor; a bench behind)
  // (a deep apron board under the top hides whoever sits behind it from the waist down)
  S.hmTable = () => { const [x0, x1, y] = S.HM.TABLE; return `<rect x="${x0}" y="${y}" width="${x1 - x0}" height="40" fill="#6a4a2a" filter="url(#woodH)" ${olr(2.4)}/><rect x="${x0 + 10}" y="${y - 70}" width="${x1 - x0 - 20}" height="72" fill="#7a5a36" filter="url(#woodH)" opacity="0.9"/>` + `<rect x="${x0 + 14}" y="${y + 40}" width="${x1 - x0 - 28}" height="200" fill="#4a3020" filter="url(#woodV)" ${olr(2)}/><path d="M${x0 + 14},${y + 120} L${x1 - 14},${y + 120}" stroke="#2a1a10" stroke-width="5" opacity="0.6"/>` + [x0 + 30, x1 - 64].map(x => `<rect x="${x}" y="${y + 40}" width="34" height="${1800 - y - 40}" fill="#4a3020" filter="url(#woodV)" ${olr(2)}/>`).join('') + `<rect x="${x0 + 64}" y="${y + 240}" width="${x1 - x0 - 128}" height="${1800 - y - 240}" fill="#120a06" opacity="0.55"/>`; };

  // ======================================================= THE COURT
  // a high bench across the back with the three judges behind it (BENCH: x0, x1, top, bottom; judges stand on 1560
  // so the bench hides them below the waist), blue hangings with gold lilies, the crowd in the gallery, the floor
  // where the accused is dragged (front, y 1950); the clerk at his desk at the right front
  S.CT = { FY: 1950, BENCH: [-260, 1340, 1000, 1600], J: [[550, 1420], [210, 1420], [890, 1420]], JS: 0.55 };
  const lily = (x, y, s, col) => `<g transform="translate(${x},${y}) scale(${s})" fill="${col}"><path d="M0,-40 C14,-24 14,-6 0,10 C-14,-6 -14,-24 0,-40Z"/><path d="M-6,4 C-30,-10 -44,4 -34,20 C-26,12 -16,10 -6,14Z M6,4 C30,-10 44,4 34,20 C26,12 16,10 6,14Z"/><rect x="-18" y="12" width="36" height="8"/><path d="M-4,20 L0,34 L4,20Z"/></g>`;
  S.court = (t, o = {}) => {
    const L = [];
    L.push({ p: 0.7, svg: once('ctW', () => {
      let g = `<rect x="-1800" y="-800" width="4600" height="3000" fill="#3a2418" filter="url(#woodV)"/>`;
      for (let x = -1800; x < 2800; x += 220) g += `<rect x="${x + 16}" y="900" width="188" height="600" rx="8" fill="none" stroke="#1e120a" stroke-width="7"/><rect x="${x + 16}" y="160" width="188" height="640" rx="8" fill="none" stroke="#1e120a" stroke-width="7" opacity="0.6"/>`;
      // the blue hanging behind the bench, gold fleurs-de-lis, a gilt fringe; the royal arms above
      g += `<rect x="-60" y="-100" width="1220" height="1260" fill="#1e2e6a" filter="url(#cloth)" ${olr(2.4)}/>`;
      for (let y = -40; y < 1120; y += 150) for (let x = -10 + ((y + 40) / 150 % 2) * 75; x < 1140; x += 150) g += lily(x, y, 0.9, '#c9a040');
      g += `<path d="M-60,1160 L1160,1160" stroke="#c9a040" stroke-width="18" stroke-dasharray="10 6"/>`;
      g += `<g transform="translate(550,-60)"><path d="M-120,-100 L120,-100 L120,60 Q0,170 -120,60Z" fill="#1e2e6a" stroke="#c9a040" stroke-width="12"/>${lily(-50, -40, 1, '#c9a040')}${lily(50, -40, 1, '#c9a040')}${lily(0, 50, 1, '#c9a040')}${S.crownEmblem(0, -150, 1.6, '#c9a040')}</g>`;
      // tall windows each side with daylight
      for (const x of [-900, 1700]) g += `<rect x="${x - 160}" y="-300" width="320" height="1100" fill="#c8d4dc" ${olr(2.4)}/>` + [-80, 0, 80].map(d => `<path d="M${x + d},-300 L${x + d},800" stroke="#3a2a1e" stroke-width="8"/>`).join('') + `<path d="M${x - 160},250 L${x + 160},250" stroke="#3a2a1e" stroke-width="8"/>` + C.radial(x, 200, 400, '#fff8e8', 0.4, 'screen');
      return g; }) });
    // the gallery crowd behind the rails at the sides (they lean, point, murmur)
    let gc = ''; for (let row = 0; row < 2; row++) for (let i = 0; i < 9; i++) { gc += S.folk(-1500 + i * 150 + row * 70, 1700 + row * 50, 0.7, 800 + row * 20 + i, t, { wave: o.crowdWave ?? 0.3 }); gc += S.folk(1350 + i * 150 + row * 70, 1700 + row * 50, 0.7, 900 + row * 20 + i, t, { wave: o.crowdWave ?? 0.3 }); }
    gc += [[-1600, -280], [1300, 2800]].map(([a, b]) => `<rect x="${a}" y="1640" width="${b - a}" height="24" fill="#5a3a20" ${olr(2)}/>` + Array.from({ length: Math.floor((b - a) / 60) }, (_, i) => `<rect x="${a + 20 + i * 60}" y="1664" width="18" height="200" fill="#4a3020"/>`).join('') + `<rect x="${a}" y="1860" width="${b - a}" height="24" fill="#5a3a20" ${olr(2)}/>`).join('');
    L.push({ p: 0.88, svg: gc });
    // the floor: black and white stone squares
    L.push({ p: 1, svg: once('ctF', () => { let g = `<rect x="-2000" y="1590" width="5000" height="1400" fill="#a89c88" filter="url(#ground)"/>`; for (let row = 0; row < 10; row++) { const y = 1600 + row * 34 + row * row * 6, h = 34 + row * 12, w = 200 + row * 20; for (let i = -14; i < 22; i++) if ((i + row) % 2) g += `<path d="M${f(540 + (i - 0.5) * w - (540 + (i - 0.5) * w - 540) * 0.0)},${y} L${f(540 + (i + 0.5) * w)},${y} L${f(540 + (i + 0.5) * (w + 20))},${y + h} L${f(540 + (i - 0.5) * (w + 20))},${y + h}Z" fill="#4a423a" opacity="0.85"/>`; g += `<path d="M-2000,${y} L3000,${y}" stroke="#2a2420" stroke-width="2" opacity="0.5"/>`; } return g + `<rect x="-2000" y="1590" width="5000" height="1400" fill="#3a2a1a" opacity="0.3"/>`; }) });
    // the bar of the court in the near foreground: a dark oak balustrade the accused is dragged along behind
    L.push({ p: 1.1, svg: once('ctBar', () => { let g = `<rect x="-1600" y="1640" width="4200" height="40" rx="10" fill="#4a2e18" filter="url(#woodH)" ${olr(2.4)}/><rect x="-1600" y="1680" width="4200" height="20" fill="#2a1a10"/>`; for (let x = -1580; x < 2600; x += 110) g += `<path d="M${x + 20},1700 C${x + 4},1760 ${x + 36},1800 ${x + 20},1860 C${x + 4},1920 ${x + 36},1960 ${x + 20},2400 L${x + 70},2400 C${x + 56},1960 ${x + 86},1920 ${x + 70},1860 C${x + 56},1800 ${x + 86},1760 ${x + 70},1700Z" fill="#3a2414" ${olr(1.6)}/>`; return g + `<rect x="-1600" y="1940" width="4200" height="600" fill="#2a1a10"/><rect x="-1600" y="1930" width="4200" height="30" fill="#4a2e18" ${olr(2)}/>`; }) });
    // light shafts from the windows, dust
    L.push({ p: 1.02, light: true, svg: `<path d="M-1060,-300 L-740,-300 L700,2400 L-100,2400Z" fill="#fff4e0" opacity="0.08" style="mix-blend-mode:screen" filter="url(#b14)"/><path d="M1540,-300 L1860,-300 L1200,2400 L400,2400Z" fill="#fff4e0" opacity="0.06" style="mix-blend-mode:screen" filter="url(#b14)"/>` + S.dust(500, 1200, 900, 700, 34, 111, t, '#fff4d8', 2.2, 0.45) });
    return L;
  };
  // the bench front (drawn over the judges): carved panels, a gilt rail, papers and an inkwell on the ledge
  S.ctBench = () => { const [x0, x1, y0, y1] = S.CT.BENCH; let g = `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="40" fill="#5a3a20" filter="url(#woodH)" ${olr(2.4)}/><rect x="${x0 + 20}" y="${y0 + 40}" width="${x1 - x0 - 40}" height="${y1 - y0 - 40}" fill="#3a2414" filter="url(#woodV)" ${olr(2.4)}/>`; for (let x = x0 + 60; x < x1 - 120; x += 200) g += `<rect x="${x}" y="${y0 + 90}" width="160" height="${y1 - y0 - 160}" rx="10" fill="none" stroke="#1e120a" stroke-width="7"/><rect x="${x + 20}" y="${y0 + 110}" width="120" height="${y1 - y0 - 200}" rx="8" fill="#2e1c10"/>`; g += `<path d="M${x0},${y0} L${x1},${y0}" stroke="#c9a040" stroke-width="8"/><path d="M80,${y0} L200,${y0 - 10} L260,${y0}Z M700,${y0} L860,${y0 - 8} L900,${y0}Z" fill="#e8dcbc" ${olr(1.4)}/><path d="M440,${y0} L446,${y0 - 30} L476,${y0 - 30} L482,${y0}Z" fill="#1a1a20"/>`; g += `<rect x="${x0}" y="${y1}" width="${x1 - x0}" height="30" fill="#2a1a10"/>`; return g; };
  // the clerk's desk at the right front (drawn over the clerk's legs)
  S.ctDesk = (x, y) => `<rect x="${x - 220}" y="${y}" width="440" height="34" fill="#5a3a20" filter="url(#woodH)" ${olr(2.4)}/><rect x="${x - 200}" y="${y + 34}" width="400" height="${S.CT.FY + 20 - y - 34}" fill="#3a2414" filter="url(#woodV)" ${olr(2.4)}/><path d="M${x - 160},${y} L${x - 40},${y - 10} L${x},${y}Z" fill="#e8dcbc" ${olr(1.4)}/>`;
})(window);
