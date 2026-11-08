// Sets for "The Worm": ancient market, the micro world in a cup of water, the village courtyard through a year,
// his room at dawn, the river (above and below the surface), the healer's hut, a modern street at night.
(function (G) {
  const { f, shade, mix, rng, uid, OUT, ol } = G.RIG, C = G.CINE, E = G.ENV, S = G.SETS, P = G.PROPS;
  const lg = S.lg;
  const RGd = (id, stops, cx = 0.5, cy = 0.5, r = 0.5) => `<defs><radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a !== undefined ? ` stop-opacity="${a}"` : ''}/>`).join('')}</radialGradient></defs>`;
  // a mud-brick building facade
  const mudHouse = (x, y, w, h, col, seed, o = {}) => {
    const r = rng(seed);
    let g = `<rect x="${f(x)}" y="${f(y - h)}" width="${f(w)}" height="${f(h)}" fill="${col}" filter="url(#plaster)" ${ol(2)}/>`;
    g += `<rect x="${f(x - 8)}" y="${f(y - h - 18)}" width="${f(w + 16)}" height="22" fill="${shade(col, -0.15)}" ${ol(1.5)}/>`;
    for (let i = 0; i < 4; i++) g += `<rect x="${f(x + 10 + r() * (w - 60))}" y="${f(y - h + 20 + r() * (h - 80))}" width="${f(30 + r() * 30)}" height="10" fill="${shade(col, -0.2)}" opacity="0.5"/>`;
    if (o.door) g += `<path d="M${f(x + w * 0.35)},${y} L${f(x + w * 0.35)},${f(y - h * 0.55)} Q${f(x + w * 0.5)},${f(y - h * 0.7)} ${f(x + w * 0.65)},${f(y - h * 0.55)} L${f(x + w * 0.65)},${y}Z" fill="#2a1a10" ${ol(1.5)}/>`;
    if (o.window) g += `<rect x="${f(x + w * 0.15)}" y="${f(y - h * 0.8)}" width="${f(w * 0.18)}" height="${f(h * 0.16)}" fill="#1a1008" ${ol(1.2)}/>`;
    // wooden poles sticking out of the wall (typical Sahel / Nile architecture)
    for (let i = 0; i < 4; i++) g += `<path d="M${f(x + 20 + i * (w - 40) / 3)},${f(y - h * 0.62)} l-6,0 l0,10 l26,0 l0,-10Z" fill="#5a3a20"/>`;
    return g;
  };
  // striped market awning, swaying
  const awning = (x, y, w, h, c1, c2, t, ph) => {
    const sw = Math.sin(t * 1.4 + ph) * 8, n = 8;
    let g = `<path d="M${x},${y} L${x + w},${y} L${f(x + w + sw)},${f(y + h)} L${f(x + sw)},${f(y + h)}Z" fill="${c1}" ${ol(1.6)}/>`;
    for (let i = 0; i < n; i += 2) g += `<path d="M${f(x + i * w / n)},${y} L${f(x + (i + 1) * w / n)},${y} L${f(x + (i + 1) * w / n + sw)},${f(y + h)} L${f(x + i * w / n + sw)},${f(y + h)}Z" fill="${c2}"/>`;
    for (let i = 0; i <= n; i++) g += `<path d="M${f(x + i * w / n + sw)},${f(y + h)} q${f(w / n / 2)},20 ${f(w / n)},0" fill="${c1}" stroke="${OUT}" stroke-width="1.2"/>`;
    return g + `<path d="M${x},${y + 4} L${x + w},${y + 4}" stroke="#3a2414" stroke-width="10"/>`;
  };

  // ============================================== THE MARKET (bright afternoon)
  S.market = (t, o = {}) => {
    const L = [];
    let sky = lg('mks', [[0, '#7ab0d8'], [0.6, '#cfe0e8'], [1, '#f0e2c4']]) + `<rect x="-1500" y="-900" width="4200" height="2000" fill="url(#mks)"/>`;
    sky += `<circle cx="1500" cy="-300" r="90" fill="#fff8e0"/>` + C.bloom(1500, -300, 300, '#fff4d0', 0.4);
    L.push({ p: 0.2, svg: sky });
    let far = '';
    for (const [x, w, h, c, s] of [[-1300, 520, 900, '#c8a878', 3], [-760, 460, 1100, '#d0b080', 5], [-260, 600, 820, '#c09868', 7], [380, 520, 1050, '#caa676', 9], [920, 480, 880, '#d4b486', 11], [1420, 560, 1000, '#c4a070', 13], [1980, 520, 860, '#d0aa7a', 15]]) far += mudHouse(x, 1200, w, h, c, s, { window: true, door: s % 3 === 0 });
    far += `<path d="M580,300 L580,-200 L640,-260 L700,-200 L700,300Z" fill="#c8a070" ${ol(1.5)}/><circle cx="640" cy="-280" r="34" fill="#c8a070" ${ol(1.5)}/>`; // a minaret-like tower
    L.push({ p: 0.45, svg: `<g filter="url(#dof2)">${far}<rect x="-1500" y="-900" width="4200" height="2200" fill="#f0d8a8" opacity="0.18"/></g>` });
    // stalls and awnings at mid depth
    let mid = '';
    const stalls = [[-1100, '#b8402a', '#e8d8b0'], [-500, '#2a5a8a', '#e8d8b0'], [100, '#3a6a3a', '#e8c890'], [700, '#a0302a', '#f0e0b8'], [1300, '#6a3a7a', '#e8d8b0'], [1900, '#b86a2a', '#f0e0c0']];
    stalls.forEach(([x, c1, c2], i) => {
      mid += `<rect x="${x - 10}" y="1000" width="14" height="560" fill="#4a2e18"/><rect x="${x + 420}" y="1000" width="14" height="560" fill="#4a2e18"/>`;
      mid += awning(x - 30, 980, 500, 120, c1, c2, t, i);
      mid += `<rect x="${x}" y="1380" width="430" height="180" fill="#6a4426" filter="url(#woodH)" ${ol(1.5)}/>`;
      const r = rng(30 + i);
      if (i % 3 === 0) for (let k = 0; k < 5; k++) mid += P.jar(x + 50 + k * 80, 1380, 0.45 + r() * 0.2, ['#a0603a', '#8a5030', '#b07040'][k % 3]);
      else if (i % 3 === 1) for (let k = 0; k < 4; k++) mid += P.spiceCone(x + 60 + k * 100, 1380, 0.7, ['#d8a020', '#b8402a', '#7a8a2a', '#c86a20'][k]);
      else for (let k = 0; k < 12; k++) mid += `<circle cx="${f(x + 40 + r() * 350)}" cy="${f(1370 - r() * 40)}" r="${f(16 + r() * 8)}" fill="${['#e8a020', '#c83020', '#6a8a2a'][k % 3]}" ${ol(1)}/>`;
    });
    L.push({ p: 0.75, svg: `<g filter="url(#dof1)">${mid}</g>` });
    L.push({ p: 1, svg: lg('mkg', [[0, '#c8a878'], [1, '#8a6a44']]) + `<rect x="-1500" y="1500" width="4200" height="1400" fill="url(#mkg)" filter="url(#ground)"/>` + E.straw(-1400, 2600, 1520, 2400, 120, 21, '#a08050') });
    // dust in the sun
    L.push({ p: 0.9, svg: S.dust(540, 900, 1400, 800, 60, 23, t, '#fff4d8', 2.2, 0.5), light: true });
    return L;
  };
  // hanging cloth strips in the near foreground (the camera cranes down through them)
  S.hangingCloth = (t, x0, y0) => {
    let g = '';
    const cols = ['#b8402a', '#2a5a8a', '#d8a020', '#6a3a7a', '#3a6a3a'];
    for (let i = 0; i < 9; i++) { const x = x0 + i * 170, sw = Math.sin(t * 1.2 + i) * 18; g += `<path d="M${x},${y0} L${x + 120},${y0} L${f(x + 120 + sw)},${f(y0 + 700 + (i % 3) * 120)} L${f(x + sw)},${f(y0 + 700 + (i % 3) * 120)}Z" fill="${cols[i % 5]}" opacity="0.95" filter="url(#cloth)"/>`; }
    return g;
  };

  // ============================================== THE MICRO WORLD inside a drop of water
  S.micro = (t, o = {}) => {
    const L = [];
    let g = RGd('mcw', [[0, '#5a8a6a'], [0.6, '#2a4a3a'], [1, '#0a1410']], 0.5, 0.45, 0.75) + `<rect x="-1500" y="-1500" width="4200" height="5000" fill="url(#mcw)"/>`;
    const r = rng(7);
    for (let i = 0; i < 70; i++) { const x = -600 + r() * 2300, y = -400 + r() * 2800, rr = 3 + r() * 10; g += `<circle cx="${f(x + Math.sin(t * 0.5 + i) * 20)}" cy="${f(y - t * 12 * (0.5 + r()))}" r="${f(rr)}" fill="#c8e0b8" opacity="${f(0.1 + r() * 0.25)}" filter="url(#b2)"/>`; }
    for (let i = 0; i < 12; i++) { const x = -400 + r() * 1900, y = r() * 1920; g += `<path d="M${f(x)},${f(y)} q40,${f(30 + Math.sin(t + i) * 20)} 90,10 q40,-20 80,10" stroke="#7aa86a" stroke-width="5" fill="none" opacity="0.35" filter="url(#b2)"/>`; }
    L.push({ p: 0.6, svg: `<g filter="url(#dof2)">${g}</g>` });
    return L;
  };

  // ============================================== THE VILLAGE COURTYARD over a year. o.day 0..1 (0 = night, 1 = noon), o.season 0..1 (crop growth)
  S.courtyard = (t, o = {}) => {
    const L = [], day = o.day ?? 1, sun = o.sunA ?? 0.5;
    const top = mix('#0a1022', '#6aa0d0', day), bot = mix('#1a2238', '#f0d8b0', day);
    let sky = lg('cys', [[0, top], [1, bot]]) + `<rect x="-1500" y="-900" width="4200" height="2400" fill="url(#cys)"/>`;
    // stars at night
    if (day < 0.6) { const r = rng(5); for (let i = 0; i < 80; i++) sky += `<circle cx="${f(-1200 + r() * 3800)}" cy="${f(-800 + r() * 1500)}" r="${f(1 + r() * 2)}" fill="#fff" opacity="${f((1 - day / 0.6) * (0.4 + r() * 0.6))}"/>`; }
    // sun / moon travelling on an arc
    const ax = lerpA(-900, 2000, sun), ay = 700 - Math.sin(sun * Math.PI) * 1200;
    if (day > 0.35) sky += `<circle cx="${f(ax)}" cy="${f(ay)}" r="80" fill="#fff6d8" opacity="${f(Math.min(1, (day - 0.35) * 3))}"/>` + C.bloom(ax, ay, 260, '#fff0c0', 0.5 * day);
    else sky += `<circle cx="${f(ax)}" cy="${f(ay)}" r="60" fill="#e8ecf4" opacity="${f(Math.min(1, (0.35 - day) * 4))}"/><circle cx="${f(ax - 20 * (o.moon || 0.5))}" cy="${f(ay - 6)}" r="58" fill="${top}" opacity="${f(Math.min(1, (0.35 - day) * 4) * 0.9)}"/>`;
    L.push({ p: 0.2, svg: sky });
    let far = E.ridge(4200, 1150, 90, 9, mix('#1a1a24', '#b89a6a', day), 140).replace('M-50', 'M-1550');
    far = `<g transform="translate(-1500,0)">${E.ridge(4200, 1150, 90, 9, mix('#14141c', '#b89a6a', day), 140)}</g>`;
    // palm trees swaying
    for (const [px, ph, s] of [[-700, 0, 1.0], [1700, 2, 1.15], [2200, 4, 0.9]]) {
      const sw = Math.sin(t * 0.9 + ph) * 6;
      far += `<path d="M${px},1250 Q${px + 20},900 ${f(px + 40 + sw)},${f(600)}" stroke="${mix('#1a140e', '#6a4a2a', day)}" stroke-width="${f(28 * s)}" fill="none"/>`;
      for (let k = 0; k < 7; k++) { const a = -Math.PI / 2 + (k - 3) * 0.5 + Math.sin(t + k) * 0.05; far += `<path d="M${f(px + 40 + sw)},600 q${f(Math.cos(a) * 180 * s)},${f(Math.sin(a) * 100 * s - 60)} ${f(Math.cos(a) * 320 * s)},${f(Math.sin(a) * 160 * s + 80)}" stroke="${mix('#0e140c', '#3a6a2a', day)}" stroke-width="${f(22 * s)}" fill="none" stroke-linecap="round"/>`; }
    }
    L.push({ p: 0.45, svg: `<g filter="url(#dof1)">${far}</g>` });
    // his house and a field of crops growing through the seasons
    let mid = mudHouse(-300, 1450, 900, 700, mix('#3a3028', '#c8a678', day), 41, { door: true, window: true });
    const grow = o.season ?? 0.5, r = rng(9);
    for (let i = 0; i < 60; i++) { const x = 700 + i * 22 + r() * 10, h = 40 + grow * 200 * (0.7 + r() * 0.3); mid += `<path d="M${f(x)},1500 q${f(Math.sin(t * 1.5 + i) * 6)},${f(-h / 2)} ${f(Math.sin(t * 1.5 + i) * 10)},${f(-h)}" stroke="${mix(mix('#1a2a14', '#5a8a2a', day), mix('#2a2410', '#c8a030', day), Math.max(0, grow - 0.6) * 2.5)}" stroke-width="5" fill="none"/>`; }
    if (o.lamp) mid += P.candle(220, 1280, 50, t, 1.2) + C.radial(220, 1200, 500, '#ffa850', 0.4 * (1 - day));
    L.push({ p: 0.75, svg: mid });
    L.push({ p: 1, svg: `<rect x="-1500" y="1480" width="4200" height="1400" fill="${mix('#14100c', '#a8865a', day)}" filter="url(#ground)"/>` + E.straw(-1400, 2600, 1500, 2400, 120, 25, mix('#2a2014', '#8a6a40', day)) });
    L.push({ p: 1, svg: `<rect x="-1500" y="-900" width="4200" height="3800" fill="#0a1030" opacity="${f(0.45 * (1 - day))}" style="mix-blend-mode:multiply"/>`, light: true });
    return L;
  };
  const lerpA = (a, b, u) => a + (b - a) * u;

  // ============================================== HIS ROOM AT DAWN (sleeping mat, small window)
  S.room = (t, o = {}) => {
    const L = [];
    let w = `<rect x="-1200" y="-800" width="3600" height="2600" fill="#8a6a48" filter="url(#plaster)"/>`;
    w += `<rect x="580" y="300" width="300" height="240" fill="#ffd8a0"/>` + C.bloom(730, 420, 300, '#ffc880', 0.5) + `<rect x="580" y="300" width="300" height="240" fill="none" stroke="#3a2414" stroke-width="20"/><path d="M730,300 L730,540" stroke="#3a2414" stroke-width="10"/>`;
    w += P.jar(-300, 1420, 0.9, '#8a5030') + P.jar(-130, 1420, 0.7, '#a0603a') + `<rect x="1000" y="900" width="500" height="20" fill="#4a2e18"/>` + P.jar(1100, 900, 0.5) + P.jar(1260, 900, 0.45, '#6a4a3a');
    w += `<rect x="-1200" y="-800" width="3600" height="2600" fill="#1a1020" opacity="0.35" style="mix-blend-mode:multiply"/>`;
    L.push({ p: 0.6, svg: `<g filter="url(#dof1)">${w}</g>` });
    // the dawn beam
    L.push({ p: 0.8, svg: `<path d="M580,300 L880,300 L1300,1800 L400,1800Z" fill="#ffd8a0" opacity="0.12" filter="url(#b14)"/>` + S.dust(800, 1100, 300, 600, 30, 4, t, '#fff0d0', 2, 0.6), light: true });
    L.push({ p: 1, svg: `<rect x="-1200" y="1450" width="3600" height="1400" fill="#5a4030" filter="url(#ground)"/>` + P.mat(400, 1560, 1300, 120, '#b89a5a') });
    return L;
  };

  // ============================================== THE RIVER. o.under: camera below the surface; o.waterY: surface line
  S.river = (t, o = {}) => {
    const L = [], wy = o.waterY ?? 1500;
    let sky = lg('rvs', [[0, '#8ab8d8'], [1, '#f0e0c0']]) + `<rect x="-1500" y="-900" width="4200" height="2400" fill="url(#rvs)"/>` + `<circle cx="-300" cy="-100" r="80" fill="#fff8e0"/>` + C.bloom(-300, -100, 300, '#fff4d0', 0.4);
    L.push({ p: 0.2, svg: sky });
    let far = `<g transform="translate(-1500,0)">${E.ridge(4200, 1300, 80, 13, '#9a8a6a', 160)}</g>`;
    for (const [px, ph] of [[-500, 0], [1500, 3], [1900, 1]]) { const sw = Math.sin(t * 0.9 + ph) * 5; far += `<path d="M${px},1350 Q${px + 20},1050 ${f(px + 40 + sw)},800" stroke="#5a4a30" stroke-width="22" fill="none"/>`; for (let k = 0; k < 7; k++) { const a = -Math.PI / 2 + (k - 3) * 0.5; far += `<path d="M${f(px + 40 + sw)},800 q${f(Math.cos(a) * 150)},${f(Math.sin(a) * 80 - 50)} ${f(Math.cos(a) * 260)},${f(Math.sin(a) * 130 + 70)}" stroke="#3a6a2a" stroke-width="18" fill="none" stroke-linecap="round"/>`; } }
    L.push({ p: 0.45, svg: `<g filter="url(#dof1)">${far}</g>` });
    // reeds along the bank
    let reeds = ''; const r = rng(19);
    for (let i = 0; i < 70; i++) { const x = -1300 + r() * 3600, h = 120 + r() * 220, sw = Math.sin(t * 1.3 + i) * 10; reeds += `<path d="M${f(x)},${f(wy + 10)} q${f(sw * 0.5)},${f(-h / 2)} ${f(sw)},${f(-h)}" stroke="${['#4a6a2a', '#6a8a3a', '#3a5a24'][i % 3]}" stroke-width="${f(4 + r() * 4)}" fill="none"/>`; }
    L.push({ p: 0.8, svg: reeds });
    // the water: above-surface view shows the band with ripples; under view fills the frame
    let water = lg('rvw', [[0, '#5a8a9a'], [1, '#1a3a4a']]) + `<rect x="-1500" y="${wy}" width="4200" height="2400" fill="url(#rvw)"/>`;
    for (let i = 0; i < 26; i++) { const y = wy + 20 + i * 26, x = -1400 + ((i * 337) % 900) + Math.sin(t * 1.5 + i) * 40; water += `<path d="M${f(x)},${f(y)} q120,-8 240,0 M${f(x + 1200)},${f(y + 8)} q120,-8 240,0" stroke="#e8f4f8" stroke-width="3" opacity="${f(0.35 - i * 0.01)}" fill="none"/>`; }
    // underwater: light shafts, sand, pebbles, floating motes
    water += `<rect x="-1500" y="${wy + 700}" width="4200" height="1800" fill="#3a5a4a" opacity="0.5"/>`;
    for (let i = 0; i < 6; i++) { const x = -400 + i * 380 + Math.sin(t * 0.6 + i) * 60; water += `<path d="M${f(x)},${wy} L${f(x + 120)},${wy} L${f(x + 380)},${wy + 1600} L${f(x + 160)},${wy + 1600}Z" fill="#c8f0f0" opacity="0.08" filter="url(#b8)"/>`; }
    water += `<rect x="-1500" y="${wy + 1450}" width="4200" height="900" fill="#8a7a5a" filter="url(#ground)"/>`;
    for (let i = 0; i < 30; i++) water += `<ellipse cx="${f(-1300 + r() * 3500)}" cy="${f(wy + 1460 + r() * 60)}" rx="${f(20 + r() * 30)}" ry="${f(10 + r() * 12)}" fill="${['#6a6050', '#8a8070', '#5a5040'][i % 3]}" ${ol(1)}/>`;
    L.push({ p: 1, svg: water, id: 'water' });
    return L;
  };
  // the surface seen from just below: bright wavy line with caustics (drawn in front when the camera dips)
  S.surface = (t, y) => { let d = `M-1500,${y}`; for (let x = -1500; x <= 2700; x += 60) d += ` L${x},${f(y + Math.sin(x * 0.01 + t * 3) * 10)}`; return `<path d="${d} L2700,${y - 1400} L-1500,${y - 1400}Z" fill="#cfe8ec" opacity="0.35"/><path d="${d}" stroke="#ffffff" stroke-width="6" fill="none" opacity="0.8"/>`; };

  // ============================================== THE HEALER'S HUT. o.light 0..1 day light through the window; o.tally count
  S.hut = (t, o = {}) => {
    const L = [], day = o.light ?? 1;
    let w = `<rect x="-1200" y="-800" width="3600" height="2600" fill="${mix('#2a1c12', '#7a5a3a', day)}" filter="url(#plaster)"/>`;
    for (let x = -1200; x < 2400; x += 46) w += `<path d="M${x},-800 L${x + 10},1800" stroke="${mix('#140c06', '#5a3e24', day)}" stroke-width="5" opacity="0.6"/>`; // woven reed wall
    w += `<rect x="-100" y="200" width="360" height="300" fill="${mix('#1a2440', '#ffe8b8', day)}"/>` + (day > 0.3 ? C.bloom(80, 350, 300, '#fff0c8', 0.5 * day) : `<circle cx="160" cy="280" r="26" fill="#e8ecf4"/>`) + `<rect x="-100" y="200" width="360" height="300" fill="none" stroke="#2a1a0c" stroke-width="22"/>`;
    // herbs and gourds hanging, shelf of jars
    for (const hx of [-700, -600, -500, 500, 620]) w += E.herbs(hx, -100, 180, '#6a7a3a', hx);
    w += `<rect x="700" y="700" width="700" height="18" fill="#3a2414"/>` + [760, 880, 1000, 1120, 1240].map((x, i) => P.jar(x, 700, 0.42 + (i % 2) * 0.1, ['#8a5030', '#a0603a', '#6a4a3a'][i % 3])).join('');
    w += P.tally(360, 640, o.tally || 0, 1.4);
    w += `<rect x="-1200" y="-800" width="3600" height="2600" fill="#100810" opacity="${f(0.3 + 0.4 * (1 - day))}" style="mix-blend-mode:multiply"/>`;
    L.push({ p: 0.6, svg: `<g filter="url(#dof1)">${w}</g>` });
    // oil lamp glow (always on, stronger at night) and the window beam
    L.push({ p: 0.8, svg: C.radial(-400, 1200, 900, '#ffa850', 0.25 + 0.35 * (1 - day)) + `<path d="M-100,200 L260,200 L700,1800 L200,1800Z" fill="#fff0c8" opacity="${f(0.1 * day)}" filter="url(#b14)"/>` + S.dust(200, 1000, 400, 600, 26, 8, t, '#fff0d0', 2, 0.5 * day), light: true });
    L.push({ p: 1, svg: `<rect x="-1200" y="1500" width="3600" height="1400" fill="${mix('#1a120a', '#5a4028', day)}" filter="url(#ground)"/>` + P.mat(500, 1600, 1600, 140, mix('#3a2e1a', '#a08850', day)) + P.candle(-400, 1560, 60, t, 1.4) });
    return L;
  };

  // ============================================== A MODERN STREET AT NIGHT, wet asphalt, rain
  S.city = (t, o = {}) => {
    const L = [];
    let g = lg('cty', [[0, '#05070e'], [1, '#141a2a']]) + `<rect x="-2000" y="-1200" width="5200" height="2800" fill="url(#cty)"/>`;
    const r = rng(17);
    for (let i = 0; i < 14; i++) { const x = -1800 + i * 360, h = 900 + r() * 900; g += `<rect x="${x}" y="${f(1400 - h)}" width="320" height="${f(h)}" fill="#0c1018"/>`; for (let k = 0; k < 40; k++) if (r() > 0.55) g += `<rect x="${f(x + 20 + (k % 5) * 60)}" y="${f(1400 - h + 40 + Math.floor(k / 5) * 90)}" width="34" height="50" fill="${['#ffd890', '#a8c8ff', '#ffe8c0'][k % 3]}" opacity="${f(0.3 + r() * 0.5)}"/>`; }
    for (let i = 0; i < 30; i++) g += `<circle cx="${f(-1500 + r() * 4000)}" cy="${f(600 + r() * 800)}" r="${f(20 + r() * 50)}" fill="${['#ffb050', '#ff5040', '#80a8ff', '#fff0c0'][i % 4]}" opacity="${f(0.15 + r() * 0.25)}" filter="url(#b4)"/>`;
    L.push({ p: 0.4, svg: `<g filter="url(#dof2)">${g}</g>` });
    // wet road with reflections
    let road = lg('cyr', [[0, '#1a1e28'], [1, '#08090e']]) + `<rect x="-2000" y="1400" width="5200" height="1600" fill="url(#cyr)"/>`;
    for (let i = 0; i < 8; i++) road += `<rect x="${-1800 + i * 600}" y="1700" width="260" height="14" fill="#e8e0c0" opacity="0.5"/>`;
    road += `<rect x="-2000" y="1400" width="5200" height="1600" fill="#3a4a6a" opacity="0.15" filter="url(#tex)"/>`;
    L.push({ p: 1, svg: road });
    // rain streaks
    let rain = ''; const rr = rng(3);
    for (let i = 0; i < 160; i++) { const x = -1500 + rr() * 4000, y0 = rr() * 2600, y = ((y0 + t * 2200 * (0.8 + rr() * 0.4)) % 2600) - 400; rain += `<path d="M${f(x)},${f(y)} l-8,46" stroke="#c8d8f0" stroke-width="2" opacity="${f(0.15 + rr() * 0.3)}"/>`; }
    L.push({ p: 1.15, svg: rain, light: true });
    return L;
  };
})(window);
