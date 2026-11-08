// "The King's Decoy" sets part 2: the royal dressing chamber, the castle gate street, the coach interior (with the
// world passing in its windows), the brother's ridge, the gibbet at dusk, your village at sundown. Plus fire.
(function (G) {
  const S = G.SETS, { f, shade, mix, rng, uid } = G.RIG, C = G.CINE, E = G.ENV, PR = G.PROPS;
  const lg = S.lg;
  const lerp = (a, b, t) => a + (b - a) * t, cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const ss = (a, b, x) => { const t = cl((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  const OUTC = '#1a120c';
  const olr = (w = 2, op = 0.7) => `stroke="${OUTC}" stroke-width="${w}" stroke-opacity="${op}" stroke-linejoin="round"`;
  const cache = {}, once = (k, fn) => cache[k] || (cache[k] = fn());

  // ---------------- fire: licking tongues in four heat colours, flickering; (x,y) = base centre, w wide, h tall
  const flames = (x, y, w, h, t, seed, k = 1) => {
    if (k <= 0.01) return '';
    const r = rng(seed); let g = '';
    const layers = [['#8a1e0a', 1, 0.95], ['#d8481a', 0.84, 0.95], ['#f4882a', 0.64, 0.9], ['#ffc85a', 0.42, 0.9], ['#fff4c0', 0.22, 0.85]];
    const n = Math.max(3, Math.round(w / 40));
    for (const [c, sc, op] of layers) for (let i = 0; i < n; i++) {
      const u = (i + 0.5) / n, fx = x + (u - 0.5) * w * 0.9 * sc, ph = r() * 6.28, sp = 7 + r() * 6;
      const hh = h * k * sc * (0.55 + 0.45 * Math.sin(Math.PI * u)) * (0.8 + 0.2 * Math.sin(t * sp + ph)) * (0.8 + r() * 0.4), ww = w / n * 0.9 * (0.7 + sc * 0.6), lean = (Math.sin(t * 3.1 + ph) * 0.18 + (r() - 0.5) * 0.2) * hh;
      g += `<path d="M${f(fx - ww)},${f(y)} C${f(fx - ww)},${f(y - hh * 0.45)} ${f(fx + lean * 0.3 - ww * 0.35)},${f(y - hh * 0.75)} ${f(fx + lean)},${f(y - hh)} C${f(fx + lean * 0.5 + ww * 0.3)},${f(y - hh * 0.72)} ${f(fx + ww)},${f(y - hh * 0.4)} ${f(fx + ww)},${f(y)}Z" fill="${c}" opacity="${op}"/>`;
    }
    // rising embers
    for (let i = 0; i < Math.round(n * 1.5); i++) { const ph = (t * (0.5 + r() * 0.6) + r()) % 1, ex = x + (r() - 0.5) * w + Math.sin(t * 2 + i) * 20, ey = y - h * k * (0.4 + ph * 1.3); g += `<circle cx="${f(ex)}" cy="${f(ey)}" r="${f(2 + r() * 3)}" fill="#ffd27a" opacity="${f(0.9 * (1 - ph))}"/>`; }
    return `<g filter="url(#b1)">${g}</g>` + C.radial(x, y - h * k * 0.4, Math.max(w, h * k) * 1.3, '#ff9a40', 0.45 * k, 'screen');
  };
  S.flames = flames;
  // a crowd figure (townsfolk, seen to the chest or waist): body, head, hair or hood, waving arms
  const folk = (x, y, s, seed, t, o = {}) => {
    const r = rng(seed), body = o.body || ['#7a5a3a', '#5a6a4a', '#8a3a2a', '#4a5a7a', '#9a8a6a', '#6a4a5a', '#3a4a3a'][Math.floor(r() * 7)], skin = ['#e8c0a0', '#d8a888', '#c89070', '#f0d0b0'][Math.floor(r() * 4)];
    const hair = ['#3a2414', '#1a1410', '#8a6a3a', '#5a3a1e', '#c8b090', '#6a6460'][Math.floor(r() * 6)], hat = r() < 0.4 ? ['#5a3a1e', '#8a7a5a', '#3a4a5a', '#ece4d4'][Math.floor(r() * 4)] : null;
    const wave = (o.wave ?? 1) * (r() < 0.75 ? 1 : 0), ph = r() * 6.28, sp = 5 + r() * 4;
    let g = '';
    // arms: raised and waving (behind the head), or one hand up
    const arm = (side, up) => { const a = side * (up ? 30 + 18 * Math.sin(t * sp + ph + side) : 160), sx = side * 46, sy = -150; const ex = sx + Math.sin(a * Math.PI / 180) * 70, ey = sy - Math.cos(a * Math.PI / 180) * 70, hx = ex + Math.sin(a * Math.PI / 180 + side * 0.4) * 60, hy = ey - Math.cos(a * Math.PI / 180 + side * 0.4) * 60; return `<path d="M${sx},${sy} L${f(ex)},${f(ey)} L${f(hx)},${f(hy)}" stroke="${shade(body, -0.12)}" stroke-width="30" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="${f(hx)}" cy="${f(hy)}" r="15" fill="${skin}" ${olr(1.6)}/>`; };
    if (wave) g += arm(-1, r() < 0.7) + arm(1, true);
    g += `<path d="M-70,40 C-70,-90 -56,-160 0,-166 C56,-160 70,-90 70,40Z" fill="${body}" ${olr(2)}/><path d="M-30,-160 L0,-120 L30,-160" stroke="${shade(body, -0.25)}" stroke-width="5" fill="none"/>`;
    g += `<rect x="-14" y="-196" width="28" height="36" fill="${shade(skin, -0.1)}"/><ellipse cx="0" cy="-226" rx="38" ry="46" fill="${skin}" ${olr(2)}/>`;
    g += `<ellipse cx="-13" cy="-228" rx="4" ry="5" fill="#1a120c"/><ellipse cx="13" cy="-228" rx="4" ry="5" fill="#1a120c"/><path d="M-12,${wave ? -200 : -204} Q0,${wave ? -192 : -202} 12,${wave ? -200 : -204}" stroke="#5a2a1a" stroke-width="3.5" fill="${wave ? '#5a1a14' : 'none'}"/>`;
    g += hat ? `<path d="M-48,-246 C-46,-292 46,-292 48,-246 L56,-240 L-56,-240Z" fill="${hat}" ${olr(2)}/>` : `<path d="M-40,-224 C-44,-284 44,-284 40,-224 C30,-252 -30,-252 -40,-224Z" fill="${hair}" ${olr(1.6)}/>`;
    return `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">${g}</g>`;
  };
  S.folk = folk;
  // a banner hanging from a pole, rippling
  const banner = (x, y, w, h, t, ph, col = '#8a1424') => {
    let d = `M${x},${y}`; const n = 8;
    for (let i = 0; i <= n; i++) { const v = i / n; d += ` L${f(x + w + Math.sin(t * 3 + v * 5 + ph) * 10 * v)},${f(y + h * v)}`; }
    d += ` L${f(x + w / 2 + Math.sin(t * 3 + 5 + ph) * 10)},${f(y + h * 0.86)}`;
    for (let i = n; i >= 0; i--) { const v = i / n; d += ` L${f(x + Math.sin(t * 3 + v * 5 + ph + 0.6) * 10 * v)},${f(y + h * v)}`; }
    return `<path d="${d}Z" fill="${col}" ${olr(2)}/><path d="M${x + 12},${y + 10} L${x + 12},${f(y + h * 0.8)} M${x + w - 12},${y + 10} L${x + w - 12},${f(y + h * 0.8)}" stroke="#c9a040" stroke-width="5"/>` + S.crownEmblem(x + w / 2 + Math.sin(t * 3 + 2 + ph) * 5, y + h * 0.36, w / 110) + `<rect x="${x - 10}" y="${y - 10}" width="${w + 20}" height="14" fill="#3a2a1a"/>`;
  };
  // a crow: perched (o.fly 0) or flying (wings beating)
  const crow = (x, y, s, t, o = {}) => {
    const fly = o.fly || 0, ph = o.ph || 0;
    if (!fly) return `<g transform="translate(${f(x)},${f(y)}) scale(${f(s * (o.dir || 1))},${f(s)})"><path d="M-30,0 C-30,-26 -6,-36 14,-30 C26,-40 42,-38 46,-30 L56,-26 L44,-22 C40,-6 24,4 6,4 L-30,10 L-56,22 L-40,4Z" fill="#141216" ${olr(1.6)}/><circle cx="34" cy="-30" r="3" fill="#c8b070"/><path d="M0,4 L-4,20 M12,4 L10,20" stroke="#141216" stroke-width="3"/></g>`;
    const b = Math.sin(t * 9 + ph);
    return `<g transform="translate(${f(x)},${f(y)}) scale(${f(s * (o.dir || 1))},${f(s)})"><path d="M-30,0 C-20,-8 20,-8 36,-4 L50,-2 L36,4 C20,8 -20,8 -30,0Z" fill="#141216"/><path d="M-6,-2 C-20,${f(-40 * b)} -50,${f(-60 * b)} -70,${f(-50 * b + 4)} C-50,${f(-20 * b)} -24,${f(-6 * b + 4)} 6,2Z" fill="#141216"/><path d="M-36,0 L-56,-8 L-56,8Z" fill="#141216"/></g>`;
  };
  S.crow = crow;

  // ======================================================= THE ROYAL DRESSING CHAMBER (late afternoon light)
  // world: floor 1800; you at x 560 (s 0.8); the king behind your right shoulder at x 330 (s 0.76); the valet at
  // 880; the chamberlain at 150. A tall arched window at the left throws warm light across the room.
  S.CH11 = { FY: 1800, YOU: [560, 1800], YS: 0.8, KING: [318, 1760], KS: 0.78, VAL: [890, 1810], VS: 0.78, CHAM: [130, 1800], CS: 0.78 };
  S.chamber = (t, o = {}) => {
    const L = [];
    L.push({ p: 0.7, svg: once('chW', () => {
      let g = `<rect x="-1400" y="-800" width="3800" height="3200" fill="#8a7a64" filter="url(#plaster)"/>`;
      // dressed-stone dado and wall panelling
      g += `<rect x="-1400" y="1150" width="3800" height="900" fill="#6a4a30" filter="url(#woodV)"/>` + Array.from({ length: 22 }, (_, i) => `<rect x="${-1360 + i * 170}" y="1190" width="140" height="300" rx="8" fill="none" stroke="#3a2414" stroke-width="5"/><path d="M${-1340 + i * 170},1210 L${-1340 + i * 170},1470" stroke="#9a7048" stroke-width="3" opacity="0.6"/>`).join('') + `<rect x="-1400" y="1140" width="3800" height="22" fill="#c9a040"/>`;
      for (let y = -760; y < 1140; y += 90) g += `<path d="M-1400,${y} L2400,${y}" stroke="#6a5a46" stroke-width="2" opacity="0.4"/>`;
      // the tall arched window, leaded diamond panes, sky and a distant tower beyond
      const wx = -520, wy = -300, ww = 460, wh = 1300;
      g += `<path d="M${wx - 40},${wy + wh + 40} L${wx - 40},${wy + 200} Q${wx + ww / 2},${wy - 200} ${wx + ww + 40},${wy + 200} L${wx + ww + 40},${wy + wh + 40}Z" fill="#5a4a38" ${olr(3)}/>`;
      g += `<defs><clipPath id="chwin"><path d="M${wx},${wy + wh} L${wx},${wy + 210} Q${wx + ww / 2},${wy - 140} ${wx + ww},${wy + 210} L${wx + ww},${wy + wh}Z"/></clipPath></defs><g clip-path="url(#chwin)">${lg('chsky', [[0, '#8ab0d0'], [1, '#f4dcb0']])}<rect x="${wx}" y="${wy - 200}" width="${ww}" height="${wh + 300}" fill="url(#chsky)"/><path d="M${wx},${wy + wh - 250} L${wx + 120},${wy + wh - 330} L${wx + 300},${wy + wh - 290} L${wx + ww},${wy + wh - 360} L${wx + ww},${wy + wh}L${wx},${wy + wh}Z" fill="#7a8a9a"/><rect x="${wx + 280}" y="${wy + wh - 600}" width="80" height="320" fill="#8a909a"/><path d="M${wx + 270},${wy + wh - 600} L${wx + 320},${wy + wh - 700} L${wx + 370},${wy + wh - 600}Z" fill="#6a5060"/>`;
      for (let k = -14; k < 20; k++) g += `<path d="M${wx + k * 60},${wy - 200} l${wh + 300},${wh + 300} M${wx + k * 60},${wy - 200} l${-(wh + 300)},${wh + 300}" stroke="#4a3a2a" stroke-width="4" opacity="0.8"/>`;
      g += `</g><path d="M${wx + ww / 2},${wy - 80} L${wx + ww / 2},${wy + wh} M${wx},${wy + wh * 0.55} L${wx + ww},${wy + wh * 0.55}" stroke="#4a3a2a" stroke-width="14"/>`;
      g += `<rect x="${wx - 70}" y="${wy + wh + 30}" width="${ww + 140}" height="40" fill="#9a8a72" ${olr(2)}/>`;
      // the tapestry: deep blue field, a gold border, a stag hunt in faded colours
      const tx = 650, ty = 120, tw = 620, th = 900;
      g += `<rect x="${tx}" y="${ty}" width="${tw}" height="${th}" fill="#23365a" filter="url(#cloth)" ${olr(2.4)}/><rect x="${tx + 24}" y="${ty + 24}" width="${tw - 48}" height="${th - 48}" fill="none" stroke="#b8923a" stroke-width="18"/><rect x="${tx + 52}" y="${ty + 52}" width="${tw - 104}" height="${th - 104}" fill="none" stroke="#8a2a2a" stroke-width="6"/>`;
      const rt = rng(5); for (let i = 0; i < 40; i++) g += `<circle cx="${f(tx + 80 + rt() * (tw - 160))}" cy="${f(ty + 80 + rt() * (th - 160))}" r="${f(6 + rt() * 10)}" fill="${['#3a6a3a', '#c8a04a', '#8a3a2a', '#2a4a2a'][i % 4]}" opacity="0.6"/>`;
      g += `<g transform="translate(${tx + tw / 2},${ty + th * 0.55}) scale(1.6)" fill="#c8a04a" opacity="0.8"><path d="M-60,20 C-40,-10 20,-12 50,0 L70,-30 L66,-60 M70,-30 L90,-56 M-50,20 L-56,60 M-30,22 L-28,60 M30,10 L34,58 M44,6 L52,56" stroke="#c8a04a" stroke-width="7" fill="none"/></g>`;
      g += `<rect x="${tx - 30}" y="${ty - 30}" width="${tw + 60}" height="26" rx="12" fill="#5a3a1e" ${olr(2)}/>` + [tx - 30, tx + tw + 30].map(x => `<circle cx="${x}" cy="${ty - 17}" r="20" fill="#c9a040" ${olr(2)}/>`).join('');
      // wall sconces with candles
      for (const x of [-150, 1250]) g += `<path d="M${x - 30},620 L${x + 30},620 L${x + 14},680 L${x - 14},680Z" fill="#b8902e" ${olr(2)}/><rect x="${x - 10}" y="560" width="20" height="62" fill="#efe6d0" ${olr(1.4)}/>`;
      return g; }) });
    // candle flames and their glow (animated)
    let cf = ''; for (const x of [-150, 1250]) cf += PR.flame(x, 562, 1.2, t + x);
    L.push({ p: 0.7, svg: cf });
    // a gilded clothes stand with a spare robe, a crimson curtain swag
    L.push({ p: 0.85, svg: once('chM', () => {
      let g = `<path d="M1120,-200 C1180,300 1150,900 1240,1600 L1600,1600 L1600,-200Z" fill="#7a1424" filter="url(#cloth)" ${olr(2.4)}/><path d="M1140,-200 C1200,300 1170,900 1260,1600" stroke="#4a0a14" stroke-width="16" fill="none" opacity="0.5"/><path d="M1180,-200 C1230,300 1210,900 1300,1600" stroke="#a83444" stroke-width="10" fill="none" opacity="0.4"/>`;
      g += `<path d="M1100,700 C1180,760 1300,760 1380,700" stroke="#c9a040" stroke-width="16" fill="none"/>`;
      g += `<path d="M-200,1700 L-200,700 M-280,700 L-120,700" stroke="#c9a040" stroke-width="14"/><path d="M-280,700 C-300,900 -320,1300 -300,1640 L-100,1640 C-80,1300 -100,900 -120,700Z" fill="#2a4a3a" filter="url(#cloth)" ${olr(2)}/><path d="M-290,1600 L-110,1600" stroke="#c9a040" stroke-width="10"/>`;
      return g; }) });
    // the floor: dark oak boards and a crimson-and-gold carpet
    L.push({ p: 1, svg: once('chF', () => {
      let g = `<rect x="-1400" y="1680" width="3800" height="900" fill="#4a2e1c" filter="url(#woodH)"/>`;
      for (let y = 1700; y < 2500; y += 46) g += `<path d="M-1400,${y} L2400,${y}" stroke="#2a1a10" stroke-width="2.5" opacity="0.6"/>`;
      g += `<path d="M-200,1760 L1300,1760 L1500,2300 L-400,2300Z" fill="#7a1424" filter="url(#cloth)" ${olr(2)}/><path d="M-160,1790 L1260,1790 L1440,2260 L-340,2260Z" fill="none" stroke="#c9a040" stroke-width="12"/><path d="M-110,1830 L1210,1830 L1370,2220 L-270,2220Z" fill="none" stroke="#c9a040" stroke-width="4" stroke-dasharray="20 12"/>`;
      return g; }) });
    // the window's light: a warm shaft falling across the room, motes drifting in it
    L.push({ p: 1.02, light: true, svg: `<path d="M-560,-300 L-60,-300 L1500,1900 L600,1900Z" fill="#ffe6b0" opacity="0.13" style="mix-blend-mode:screen" filter="url(#b14)"/>` + S.dust(300, 900, 600, 700, 40, 33, t, '#fff4d8', 2.4, 0.55) });
    return L;
  };

  // ======================================================= THE CASTLE GATE STREET (bright day)
  // world: road 1560..1820 (coach wheels at 1700); the gatehouse behind (layer p 0.55); town houses on the right with
  // the archer's dormer; crowds behind the road (p 0.9) and in front of it (p 1.18)
  S.GT11 = { ROAD: 1700, ARCHER: [1830, 520], AP: 0.8 };
  S.gate11 = (t, o = {}) => {
    const L = [];
    let sky = once('gtS', () => `${lg('gtsk', [[0, '#6a94c4'], [0.7, '#b8cce0'], [1, '#e8e0cc']])}<rect x="-3000" y="-3000" width="7000" height="6000" fill="url(#gtsk)"/>`);
    for (const [cx, cy, w2, sd] of [[-600, -100, 800, 3], [700, -300, 900, 5], [1900, 0, 700, 8]]) sky += E.cloud(cx + t * 18, cy, w2, w2 * 0.27, sd, { op: 0.9 });
    sky += E.birds(200 + t * 40, 100, 7, 4, 1.3, '#2a2a30');
    L.push({ p: 0.08, svg: sky });
    // the keep's towers far behind
    L.push({ p: 0.3, svg: once('gtK', () => { let g = ''; for (const [x, w, h] of [[-200, 260, 1300], [300, 340, 1600], [900, 240, 1200]]) { g += `<rect x="${x}" y="${1500 - h}" width="${w}" height="${h + 600}" fill="#9aa0a8" filter="url(#tex)" ${olr(2)}/>`; for (let k = 0; k < w / 50; k++) g += `<rect x="${x + k * 50}" y="${1460 - h}" width="30" height="44" fill="#9aa0a8" ${olr(1.5)}/>`; g += `<rect x="${x + w / 2 - 20}" y="${1600 - h}" width="40" height="80" rx="20" fill="#2a2a30"/><path d="M${x + w / 2},${1460 - h} L${x + w / 2},${1260 - h}" stroke="#3a3a3a" stroke-width="6"/>`; } return g; }) + [[-70, 1300], [470, 1600], [1020, 1200]].map(([x, h], i) => `<path d="M${x},${1260 - h} L${f(x + 110 + Math.sin(t * 4 + i) * 10)},${f(1280 - h + Math.sin(t * 5 + i) * 6)} L${x},${1320 - h}Z" fill="#a8182a"/>`).join('') });
    // the gatehouse: curtain wall, two drum towers, the arch with the portcullis raised, banners
    L.push({ p: 0.55, svg: once('gtG', () => {
      let g = `<rect x="-2600" y="500" width="6000" height="1400" fill="#a8a294" filter="url(#tex)" ${olr(2.4)}/>`;
      for (let y = 540; y < 1900; y += 60) g += `<path d="M-2600,${y} L3400,${y}" stroke="#7a766a" stroke-width="2" opacity="0.5"/>`;
      for (let x = -2600; x < 3400; x += 90) g += `<rect x="${x}" y="440" width="56" height="70" fill="#a8a294" ${olr(1.8)}/>`;
      // drum towers
      for (const x of [140, 860]) {
        g += `<rect x="${x - 170}" y="-100" width="340" height="2000" fill="#b4ae9e" filter="url(#tex)" ${olr(2.6)}/>${lg('gtt' + x, [[0, '#000', 0.25], [0.3, '#fff', 0.12], [0.6, '#000', 0], [1, '#000', 0.35]], 0, 0, 1, 0)}<rect x="${x - 170}" y="-100" width="340" height="2000" fill="url(#gtt${x})"/>`;
        for (let k = 0; k < 6; k++) g += `<rect x="${x - 190 + k * 66}" y="-170" width="44" height="80" fill="#b4ae9e" ${olr(1.8)}/>`;
        g += `<rect x="${x - 200}" y="-100" width="400" height="26" fill="#8a8678" ${olr(1.6)}/>`;
        for (const y of [150, 520]) g += `<rect x="${x - 14}" y="${y}" width="28" height="110" rx="12" fill="#1a1a20"/>`;
      }
      // the arch, the dark passage, the raised portcullis teeth
      g += `<path d="M300,1900 L300,900 Q500,640 700,900 L700,1900Z" fill="#141218" ${olr(3)}/><path d="M300,900 Q500,640 700,900" stroke="#8a8478" stroke-width="40" fill="none"/>`;
      for (let x = 320; x < 690; x += 46) g += `<path d="M${x},780 L${x},940 L${x + 10},970 L${x + 20},940 L${x + 20},780" fill="#2a2a2e" ${olr(1.6)}/>`;
      g += `<path d="M310,930 L690,930" stroke="#2a2a2e" stroke-width="14"/>`;
      // a sunlit glimpse of the inner bailey through the arch
      g += `<path d="M330,1900 L330,1200 L670,1200 L670,1900Z" fill="#c8b890" opacity="0.35"/>`;
      return g; }) + banner(30, 120, 220, 560, t, 0) + banner(750, 120, 220, 560, t, 1.3) });
    // town houses along the right of the street (timber frames, jetties, flower boxes); the archer's dormer
    L.push({ p: 0.8, svg: once('gtH', () => {
      let g = '';
      const hs = [[1150, 520, '#e6dcc4', '#8a3a2a'], [1700, 600, '#efe4cc', '#6a4a3a'], [2330, 520, '#e2d6bc', '#9a4a2a'], [-1500, 560, '#ece2ca', '#7a3a2a'], [-900, 520, '#e4d8be', '#8a4a2a']];
      for (const [x, w, wall, roof] of hs) {
        g += `<rect x="${x}" y="760" width="${w}" height="1100" fill="${wall}" filter="url(#plaster)" ${olr(2.4)}/>`;
        g += `<path d="M${x - 50},780 L${x + w / 2},260 L${x + w + 50},780Z" fill="${roof}" filter="url(#tex)" ${olr(2.4)}/>`;
        for (const k of [0, 0.25, 0.5, 0.75, 1]) g += `<path d="M${f(x + w * k)},760 L${f(x + w * k)},1860" stroke="#3a2414" stroke-width="16"/>`;
        for (const y of [760, 1180, 1500]) g += `<path d="M${x},${y} L${x + w},${y}" stroke="#3a2414" stroke-width="16"/>`;
        g += `<path d="M${x},760 L${x + w * 0.25},1180 M${x + w * 0.5},760 L${x + w * 0.25},1180 M${x + w * 0.5},760 L${x + w * 0.75},1180 M${x + w},760 L${x + w * 0.75},1180" stroke="#3a2414" stroke-width="12"/>`;
        for (const k of [0.08, 0.58]) { g += `<rect x="${f(x + w * k)}" y="1230" width="${f(w * 0.34)}" height="200" fill="#2e3a48" ${olr(1.6)}/><path d="M${f(x + w * k + w * 0.17)},1230 L${f(x + w * k + w * 0.17)},1430 M${f(x + w * k)},1330 L${f(x + w * k + w * 0.34)},1330" stroke="#3a2414" stroke-width="6"/><rect x="${f(x + w * k - 8)}" y="1430" width="${f(w * 0.34 + 16)}" height="26" fill="#6a4424"/>` + [0, 1, 2, 3].map(i => `<circle cx="${f(x + w * k + 14 + i * w * 0.09)}" cy="1426" r="12" fill="${['#d83040', '#f0a030', '#e04860', '#f4f0e8'][i]}"/>`).join(''); }
      }
      // the dormer on the second house where the archer hides
      g += `<path d="M1310,620 L1400,470 L1490,620Z" fill="#6a4a3a" ${olr(2)}/><rect x="1330" y="560" width="140" height="160" fill="#1a1416" ${olr(2)}/>`;
      // bunting strung across
      return g; }) + (() => { let b = ''; for (let i = 0; i < 18; i++) { const u = i / 17, x = 1000 + u * 1600, y = 760 + Math.sin(u * Math.PI) * 120 + Math.sin(t * 3 + i) * 6; b += `<path d="M${f(x - 24)},${f(y)} L${f(x + 24)},${f(y)} L${f(x)},${f(y + 50)}Z" fill="${['#a8182a', '#c9a040', '#2a4a8a'][i % 3]}"/>`; } return `<path d="M1000,760 Q1800,1000 2600,760" stroke="#3a2a1a" stroke-width="3" fill="none"/>${b}`; })() });
    // the far crowd behind the road: three rows, waving, cheering
    let fc = '';
    for (let row = 0; row < 3; row++) for (let i = 0; i < 26; i++) { const x = -1400 + i * 150 + (row % 2) * 70, y = 1520 + row * 40; fc += folk(x, y, 0.62 + row * 0.04, 100 + row * 40 + i, t); }
    fc += `<rect x="-2000" y="1540" width="5000" height="60" fill="#5a4a3a" opacity="0.3"/>`;
    L.push({ p: 0.9, svg: fc });
    // the street: worn cobbles, gutters, straw
    L.push({ p: 1, svg: once('gtR', () => {
      let g = `<rect x="-2500" y="1580" width="6000" height="1200" fill="#8a8070" filter="url(#ground)"/>`;
      const r = rng(9); for (let row = 0; row < 14; row++) for (let x = -2500 + (row % 2) * 30; x < 3500; x += 60 + r() * 10) { const y = 1590 + row * 24 + row * row * 0.9; g += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(26 + row)}" ry="${f(8 + row * 0.6)}" fill="${['#9a9080', '#7a7262', '#a8a090'][Math.floor(r() * 3)]}" stroke="#4a4438" stroke-width="1.5"/>`; }
      g += E.straw(-2500, 3500, 1600, 1900, 200, 13);
      return g; }) });
    // the near crowd: backs of heads and raised arms at the bottom of the frame (soft focus)
    let nc = '';
    for (let i = 0; i < 16; i++) { const x = -1500 + i * 330 + (i % 3) * 40, y = 2140 + (i % 2) * 40; nc += folk(x, y, 1.35 + (i % 3) * 0.1, 400 + i, t, { wave: 1 }); }
    L.push({ p: 1.18, svg: `<g filter="url(#dof1)">${nc}</g>` });
    L.push({ p: 1.02, light: true, svg: `<path d="M-1000,-400 L-300,-400 L1600,2000 L800,2000Z" fill="#fff4d8" opacity="0.08" style="mix-blend-mode:screen" filter="url(#b14)"/>` });
    return L;
  };

  // ======================================================= THE COACH INTERIOR
  // We sit on the rear bench looking forward: you on the front bench, your back to the driver. The front wall is
  // x 120..960, y 380..1500; the side walls slant away to the frame edges; a hatch over your head shows the
  // coachman's back and the horses; the right door's window shows the world passing. o.view: 'town' | 'mount' |
  // 'cliff' blend weights {town, mount, cliff}; o.hole: 0..1 the new arrow punching through (11.7 s); o.bump
  S.IN11 = { SEAT: 1390, YOU: [540, 1390], YS: 0.66, WINR: [[1000, 560], [1250, 470], [1250, 1230], [1000, 1130]], WINC: [1125, 850], HATCH: [430, 480, 650, 640], FRESH: [1100, 1300], LEVER: [902, 1440], HANDLE: [872, 1170], NEWHOLE: [760, 860] };
  const outside = (t, v) => {
    // the strip seen through the windows, scrolling right as the coach rolls; three moods blended
    let g = '';
    const sx = (t * 260) % 2400;
    if ((v.town || 0) > 0.01) {
      let s2 = `<rect x="-200" y="-200" width="2000" height="2000" fill="#a8c0d8"/>`;
      for (let i = -2; i < 6; i++) { const x = i * 420 + sx * 0.5 - 600; s2 += `<rect x="${f(x)}" y="700" width="300" height="800" fill="${['#e2d6bc', '#efe4cc', '#d8ccb0'][((i % 3) + 3) % 3]}" ${olr(2)}/><path d="M${f(x - 30)},700 L${f(x + 150)},480 L${f(x + 330)},700Z" fill="#8a3a2a" ${olr(2)}/><path d="M${f(x)},950 L${f(x + 300)},950 M${f(x + 150)},700 L${f(x + 150)},1500" stroke="#3a2414" stroke-width="10"/>`; }
      for (let i = -2; i < 8; i++) { const x = i * 300 + sx * 1.6 - 1200; s2 += S.folk(x, 1260, 0.9, 700 + ((i % 9) + 9) % 9, t); }
      g += `<g opacity="${f(v.town)}">${s2}</g>`;
    }
    if ((v.mount || 0) > 0.01) {
      let s2 = `${lg('inmsk', [[0, '#7a9ac0'], [1, '#e8dcc4']])}<rect x="-200" y="-200" width="2000" height="2000" fill="url(#inmsk)"/>`;
      s2 += `<g transform="translate(${f(sx * 0.08 - 200)},0)">${S.peak(400, 1000, 560, 380, 31)}${S.peak(900, 1000, 680, 420, 32)}${S.peak(1400, 1000, 520, 360, 33)}</g><rect x="-200" y="990" width="2000" height="900" fill="#34444a"/>`;
      for (let i = -2; i < 7; i++) s2 += S.pine(i * 330 + (sx * 1.4) % 330 - 300, 1450, 520, 900 + i, { col: '#1e2a1e', lit: '#3a5030' });
      g += `<g opacity="${f(v.mount)}">${s2}</g>`;
    }
    if ((v.cliff || 0) > 0.01) {
      let s2 = `${lg('incsk', [[0, '#6a8ab0'], [1, '#e4d8c0']])}<rect x="-200" y="-200" width="2000" height="2000" fill="url(#incsk)"/>`;
      s2 += `<g transform="translate(${f(sx * 0.05 - 300)},0)">${S.peak(400, 1100, 620, 420, 34)}${S.peak(1000, 1100, 720, 460, 35)}</g><rect x="-200" y="1090" width="2000" height="900" fill="#4a4e58"/>`;
      for (let i = -2; i < 6; i++) s2 += S.rockMass(i * 380 + (sx * 1.8) % 380 - 200, 1500, 420, 320, 950 + i, {});
      g += `<g opacity="${f(v.cliff)}">${s2}</g>`;
    }
    return g;
  };
  S.inside = (t, o = {}) => {
    const L = [], I = S.IN11, v = o.view || { town: 1 }, bump = o.bump || 0;
    // everything rocks gently with the road
    const rk = 0.4 * Math.sin(t * 4.1) + 0.25 * Math.sin(t * 7.3) + bump;
    let g = once('inBox', () => {
      let s = '';
      // ceiling and floor
      s += `<path d="M-400,-200 L1480,-200 L960,380 L120,380Z" fill="#3a0e16" filter="url(#cloth)" ${olr(2)}/><path d="M120,380 L960,380" stroke="#c9a040" stroke-width="14"/>`;
      for (const k of [0.25, 0.5, 0.75]) s += `<path d="M${f(lerp(-400, 1480, k))},-200 L${f(lerp(120, 960, k))},380" stroke="#c9a040" stroke-width="8" opacity="0.8"/>`;
      s += `<path d="M120,1500 L960,1500 L1480,2400 L-400,2400Z" fill="#2a1c14" filter="url(#woodH)"/>`;
      // the front wall: buttoned crimson velvet
      s += `<rect x="120" y="380" width="840" height="1120" fill="#6a1220" filter="url(#cloth)" ${olr(2.4)}/>`;
      for (let y = 430; y < 1380; y += 90) for (let x = 160 + ((y / 90) % 2) * 45; x < 940; x += 90) s += `<circle cx="${x}" cy="${y}" r="6" fill="#c9a040"/><path d="M${x},${y} l45,45 M${x},${y} l-45,45" stroke="#3a0810" stroke-width="3" opacity="0.6"/>`;
      // the side walls in perspective, with door panels and gilt mouldings
      s += `<path d="M-400,-200 L120,380 L120,1500 L-400,2400Z" fill="#4a0c16" filter="url(#cloth)" ${olr(2.4)}/><path d="M1480,-200 L960,380 L960,1500 L1480,2400Z" fill="#560e18" filter="url(#cloth)" ${olr(2.4)}/>`;
      s += `<path d="M1000,1250 L1250,1360 L1250,1900 L1000,1700Z" fill="none" stroke="#c9a040" stroke-width="10"/><path d="M80,1250 L-170,1360 L-170,1900 L80,1700Z" fill="none" stroke="#c9a040" stroke-width="10"/>`;
      // the bench you sit on: a deep cushion and its gilded front
      s += `<path d="M110,1330 C110,1300 970,1300 970,1330 L980,1420 L100,1420Z" fill="#7a1828" filter="url(#cloth)" ${olr(2.4)}/><rect x="100" y="1420" width="880" height="150" fill="#3a0a10" ${olr(2.4)}/><path d="M100,1440 L980,1440" stroke="#c9a040" stroke-width="10"/>`;
      // the brake: an iron quadrant on the wall by the door, the lever with a red leather grip
      const [lx, ly] = I.LEVER;
      s += `<path d="M${lx - 70},${ly - 10} A90,90 0 0 1 ${lx + 40},${ly - 80}" stroke="#2a2a2e" stroke-width="16" fill="none"/>` + Array.from({ length: 7 }, (_, i) => { const a = -170 + i * 20; return `<circle cx="${f(lx + Math.cos(a * Math.PI / 180) * 90)}" cy="${f(ly + Math.sin(a * Math.PI / 180) * 90)}" r="5" fill="#8a8a90"/>`; }).join('');
      s += `<rect x="${lx - 40}" y="${ly - 20}" width="80" height="60" rx="10" fill="#b8902e" ${olr(2)}/>`;
      return s;
    });
    // windows: the right door's window and the hatch over your head show the world outside
    const W = I.WINR, wpath = `M${W.map(p => p.join(',')).join(' L')}Z`, [hx0, hy0, hx1, hy1] = I.HATCH;
    g += `<defs><clipPath id="inwin"><path d="${wpath}"/></clipPath><clipPath id="inhat"><rect x="${hx0}" y="${hy0}" width="${hx1 - hx0}" height="${hy1 - hy0}"/></clipPath></defs>`;
    g += `<g clip-path="url(#inwin)"><g transform="translate(1000,470) scale(0.25) translate(0,${f(rk * 8)})">${outside(t, v)}</g><path d="M1000,560 L1250,470 L1250,700 L1000,760Z" fill="#fff" opacity="0.08"/></g>`;
    g += `<path d="${wpath}" fill="none" stroke="#c9a040" stroke-width="16"/><path d="M1125,515 L1125,1180" stroke="#c9a040" stroke-width="8"/>`;
    // the hatch: the coachman's broad green back, his cap, the reins, the horses' heads bobbing beyond
    const bob = Math.sin(t * 7.2) * 5, hb = (o.hatchOpen ?? 1);
    let hv = `${lg('inhs', [[0, '#9ab4cc'], [1, '#e8dcc4']])}<rect x="${hx0}" y="${hy0}" width="${hx1 - hx0}" height="${hy1 - hy0}" fill="url(#inhs)"/>`;
    // (drawn for a hatch spanning y 600..760, shifted to where the hatch is)
    hv += `<g transform="translate(0,${f(hy0 - 600)})"><g transform="translate(0,${f(Math.sin(t * 5.4) * 6)})"><path d="M500,790 L520,705 C530,690 560,690 580,705 L640,790Z" fill="#d8d4cc" ${olr(1.6)}/><path d="M560,700 C566,672 590,668 596,690 L606,720 Z" fill="#d8d4cc" ${olr(1.4)}/><path d="M520,790 L480,700 C470,690 450,690 440,705 L420,790Z" fill="#c8c4bc" ${olr(1.6)}/><path d="M590,682 l8,-30 l8,30 M444,700 l-4,-28 l10,24" stroke="#a8182a" stroke-width="10" stroke-linecap="round"/></g>`;
    hv += `<g transform="translate(0,${f(bob)})"><path d="M450,780 C450,690 470,668 540,664 C610,668 630,690 630,780Z" fill="#2e4a32" ${olr(2)}/><ellipse cx="540" cy="650" rx="44" ry="34" fill="#8a8478" ${olr(1.6)}/><path d="M492,640 C496,600 584,600 588,640 L600,650 L480,650Z" fill="#3a3020" ${olr(1.6)}/><path d="M470,720 L420,700 M610,720 L660,700" stroke="#1e1410" stroke-width="5"/></g></g>`;
    g += `<g clip-path="url(#inhat)">${hv}</g><rect x="${hx0 - 14}" y="${hy0 - 14}" width="${hx1 - hx0 + 28}" height="${hy1 - hy0 + 28}" fill="none" stroke="#5a3a1e" stroke-width="22" ${olr(2)}/><rect x="${hx0 - 14}" y="${hy0 - 14}" width="${f((hx1 - hx0) * (1 - hb) + 4)}" height="${hy1 - hy0 + 28}" fill="#5a3a1e" filter="url(#woodV)" ${olr(2)}/>`;
    // the swinging lantern
    const la = 6 * Math.sin(t * 2.3) + 3 * Math.sin(t * 4.1);
    g += `<g transform="rotate(${f(la)} 540 380)"><path d="M540,380 L540,300" stroke="#2a2a2a" stroke-width="5"/><path d="M510,300 L570,300 L560,250 L520,250Z" fill="#b8902e" ${olr(1.6)}/><rect x="514" y="300" width="52" height="64" fill="#ffe8a8" opacity="0.8" ${olr(1.6)}/><path d="M506,364 L574,364 L560,384 L520,384Z" fill="#b8902e" ${olr(1.6)}/></g>`;
    // old arrow holes in the velvet, broken heads still poking through; o.hole adds the new one
    const holes = [[220, 520], [880, 470], [300, 1180], [830, 1250], [1080, 1320], [-60, 900], [700, 420]];
    if ((o.hole || 0) > 0) holes.push(I.NEWHOLE);
    for (const [x, y] of holes) g += `<circle cx="${x}" cy="${y}" r="13" fill="#fff4d8"/><circle cx="${x}" cy="${y}" r="20" fill="none" stroke="#3a0810" stroke-width="7"/>` + [0, 72, 144, 216, 288].map(a => `<path d="M${x},${y} l${f(Math.cos(a * Math.PI / 180) * 30)},${f(Math.sin(a * Math.PI / 180) * 30)}" stroke="#d8b888" stroke-width="3"/>`).join('');
    // broken arrowheads poking out of two old holes
    for (const [x, y, a] of [[880, 470, 200], [300, 1180, -20]]) g += `<g transform="translate(${x},${y}) rotate(${a})"><path d="M0,-8 L44,0 L0,8Z" fill="#5a5a60" ${olr(1.6)}/><path d="M-6,0 L4,0" stroke="#7a5a3a" stroke-width="10"/></g>`;
    // the arrow that just struck the door outside: its iron head through the panel, the wood split round it
    if (o.fresh) { const [x, y] = I.FRESH; g += `<circle cx="${x}" cy="${y}" r="22" fill="#1a0406"/>` + [10, 80, 150, 220, 290].map(a => `<path d="M${x},${y} l${f(Math.cos(a * Math.PI / 180) * 46)},${f(Math.sin(a * Math.PI / 180) * 46)}" stroke="#e0c090" stroke-width="5"/>`).join('') + `<g transform="translate(${x},${y}) rotate(200)"><path d="M0,0 L70,0" stroke="#6a4424" stroke-width="12"/><path d="M60,-18 L130,0 L60,18Z" fill="#7a7a82" ${olr(2)}/><path d="M66,-8 L118,0" stroke="#d8d8e0" stroke-width="3" opacity="0.7"/></g>`; }
    // the new arrow punches through beside your head: its head and a length of shaft, splinters flying
    if ((o.hole || 0) > 0) {
      const [x, y] = I.NEWHOLE, k = cl(o.hole), L2 = 160 * Math.min(1, k * 3);
      g += `<g transform="translate(${x},${y}) rotate(160)"><path d="M0,0 L${f(L2)},0" stroke="#5a3a20" stroke-width="12"/><path d="M${f(L2)},-14 L${f(L2 + 54)},0 L${f(L2)},14Z" fill="#6a6a70" ${olr(1.8)}/></g>`;
      const r = rng(77); for (let i = 0; i < 12; i++) { const a = r() * 6.28, d = 40 + 260 * Math.min(1, k * 2) * r(); g += `<path d="M${f(x + Math.cos(a) * d)},${f(y + Math.sin(a) * d + 400 * k * k * r())} l${f(Math.cos(a) * 18)},${f(Math.sin(a) * 18)}" stroke="#d8b888" stroke-width="4" opacity="${f(1 - k)}"/>`; }
    }
    L.push({ p: 1, svg: `<g transform="rotate(${f(rk)} 540 960)">${g}</g>` });
    // light beams through the holes (screen blend), dust turning in them
    let lb = '';
    for (const [x, y] of holes) { const len = 1500, a = 115 + (x - 540) * 0.02; const e = [x + Math.cos(a * Math.PI / 180) * len, y + Math.sin(a * Math.PI / 180) * len]; lb += `<path d="M${x - 8},${y} L${x + 8},${y} L${f(e[0] + 60)},${f(e[1])} L${f(e[0] - 60)},${f(e[1])}Z" fill="#fff0c8" opacity="${f(0.14 * (o.beams ?? 1))}" style="mix-blend-mode:screen"/>`; }
    lb += `<path d="M1000,560 L1250,470 L1250,1230 L1000,1130 L300,1900 L-200,1900Z" fill="#fff0d0" opacity="${f(0.05 * (o.beams ?? 1))}" style="mix-blend-mode:screen" filter="url(#b14)"/>`;
    L.push({ p: 1.02, light: true, svg: `<g transform="rotate(${f(rk)} 540 960)">${lb}${S.dust(600, 1000, 500, 600, 36, 41, t, '#fff4d8', 2.2, 0.55)}</g>` });
    // the near edge of the rear bench (soft, in the foreground)
    L.push({ p: 1.22, svg: `<g filter="url(#dof2)"><path d="M-600,2050 C-200,1990 1300,1990 1700,2050 L1700,2600 L-600,2600Z" fill="#5a1018"/><path d="M-600,2060 C-200,2000 1300,2000 1700,2060" stroke="#c9a040" stroke-width="16" fill="none"/></g>` });
    return L;
  };

  // ======================================================= THE BROTHER'S RIDGE (late afternoon, wind)
  // world: the cliff top at y 1500 from x -1600 to the edge at 860, where it drops away; the brother at x 420;
  // far below to the right (layer p 0.45) the pass in miniature: the road, the bridge, the coach crawling
  S.RG11 = { FY: 1500, EDGE: 860, BRO: [420, 1510], BS: 0.66, DP: 0.45, BRIDGE: [1500, 2900] };
  S.ridge = (t, o = {}) => {
    const L = [];
    let sky = once('rgS', () => `${lg('rgsk', [[0, '#4a6a94'], [0.5, '#a8b8c8'], [0.85, '#f0d0a0'], [1, '#f4b880']])}<rect x="-3000" y="-3000" width="7000" height="7000" fill="url(#rgsk)"/>` + C.radial(-300, 1300, 900, '#ffe8b8', 0.6, 'screen') + `<circle cx="-300" cy="1300" r="64" fill="#fff4d8"/>`);
    for (const [cx, cy, w2, sd] of [[-500, 300, 900, 13], [700, 100, 1000, 17], [1700, 420, 800, 19]]) sky += E.cloud(cx + t * 24, cy, w2, w2 * 0.25, sd, { op: 0.9, sun: [-1, 0.2], lit: '#ffe4c0', body: '#c8bcc0', dark: '#7a7488' });
    L.push({ p: 0.06, svg: sky });
    L.push({ p: 0.15, svg: once('rgP', () => { let g = ''; [[-1600, 900, 700], [-800, 1100, 800], [0, 900, 700], [800, 1200, 900], [1700, 1000, 800], [2600, 900, 700]].forEach(([x, h, w], i) => g += S.peak(x, 1800, h, w, 140 + i, { lit: '#9a9aac', dark: '#5a5a74', snowL: '#f8ece0', snowD: '#a8acc0' })); return g + `<rect x="-3000" y="1790" width="7000" height="3000" fill="#5a5a74"/>`; }) });
    // the pass far below, in miniature: the canyon, the road ledge, the bridge, the coach (time-driven position)
    let dp = once('rgD', () => {
      const r = rng(401);
      // the far rim of the canyon: forested ridges in the haze, warm light on their crests
      let g = '';
      for (const [y0, col, lt, amp, sd] of [[1820, '#6a7488', '#a8a8b0', 120, 3], [1930, '#55606e', '#9a9488', 100, 5], [2040, '#46505a', '#8a8070', 80, 7]]) {
        let d = `M-2400,${y0}`; for (let x = -2400; x <= 4400; x += 160) d += ` L${x},${f(y0 - amp * (0.3 + 0.7 * Math.abs(Math.sin(x * 0.0021 + sd))) - r() * 30)}`;
        g += `<path d="${d} L4400,${y0 + 900} L-2400,${y0 + 900}Z" fill="${col}"/><path d="${d}" stroke="${lt}" stroke-width="5" fill="none" opacity="0.6"/>`;
        for (let i = 0; i < 60; i++) { const x = -2400 + r() * 6800, h = 30 + r() * 30; g += `<path d="M${f(x)},${f(y0 + 40 + r() * 120 - h)} l${f(-h * 0.3)},${f(h)} l${f(h * 0.6)},0Z" fill="${shade(col, -0.25)}"/>`; }
      }
      // the canyon's far wall in shadow, banded with strata, falling to the river
      g += `${lg('rgdp', [[0, '#4a4e5a'], [1, '#22242c']])}<rect x="-2400" y="2120" width="6800" height="2400" fill="url(#rgdp)"/>`;
      for (let y = 2160; y < 3600; y += 70 + r() * 60) g += `<path d="M-2400,${f(y)} C-600,${f(y - 30)} 1400,${f(y + 30)} 4400,${f(y - 10)}" stroke="#2a2c34" stroke-width="${f(4 + r() * 6)}" fill="none" opacity="0.6"/>`;
      // the near cliff with the road ledge cut along it, either side of the bridge
      g += `<path d="M-2400,2500 L1100,2500 L1080,4400 L-2400,4400Z" fill="#6a5a48"/><path d="M1900,2500 L4400,2500 L4400,4400 L1920,4400Z" fill="#6a5a48"/>`;
      for (let i = 0; i < 70; i++) { const left = i < 40, x = left ? -2300 + r() * 3300 : 1950 + r() * 2400, y = 2560 + r() * 1700; g += S.rockMass(x, y, 140 + r() * 160, 100 + r() * 80, 4000 + i, { col: mix('#7a6a56', '#3a3836', (y - 2560) / 1700), ow: 1.4 }); }
      g += `<path d="M-2400,2500 L1100,2500 L1100,2530 L-2400,2530Z" fill="#b0a084"/><path d="M1900,2500 L4400,2500 L4400,2530 L1900,2530Z" fill="#b0a084"/>`;
      // the bridge: deck, three arches, the powder kegs as dark dots on the piers
      g += `<path d="M1080,2500 L1920,2500 L1920,3600 L1840,3600 L1840,2760 Q1780,2580 1700,2580 Q1620,2580 1560,2760 L1560,3600 L1500,3600 L1500,2760 Q1440,2580 1360,2580 Q1280,2580 1220,2760 L1220,3600 L1160,3600 L1160,2760 Q1130,2640 1080,2620Z" fill="#b4a690" stroke="#3a3026" stroke-width="3"/>`;
      for (const x of [1190, 1530]) g += `<rect x="${x - 30}" y="2724" width="60" height="38" rx="6" fill="#2a1e14"/>`;
      // the fuse from the barrels up the far wall toward the ridge
      g += `<path d="M1560,2740 C1700,2700 1880,2600 1960,2400 C2040,2200 2100,1980 2200,1800" stroke="#141010" stroke-width="4" fill="none"/>`;
      // pines along the ledge, the river far below with white water
      for (let i = 0; i < 34; i++) { const x = r() < 0.55 ? -2300 + r() * 3300 : 1950 + r() * 2400; g += S.pine(x, 2500, 70 + r() * 50, 500 + i, { col: '#24321f', lit: '#4a6a3a' }); }
      g += `<path d="M-2400,4000 C-600,3960 1400,4040 4400,3990 L4400,4500 L-2400,4500Z" fill="#2a3a44"/><path d="M-2400,4010 C-600,3970 1400,4050 4400,4000" stroke="#d8e8ee" stroke-width="16" fill="none" opacity="0.7"/>`;
      return g;
    });
    // the coach crawling along the ledge toward the bridge
    const cx = lerp(560, 960, cl((t - 24.5) / 8));
    dp += `<g transform="translate(${f(cx)},2500) scale(0.08)">${PR.coach({ x: 0, y: 0, s: 1, t, run: { x: t * 533, c: t / 1.15, g: PR.GAIT.walk } }).svg}</g>`;
    for (let i = 0; i < 3; i++) dp += `<ellipse cx="${f(1500 + Math.sin(t * 0.3 + i) * 300)}" cy="${3200 + i * 220}" rx="1300" ry="120" fill="#dfe4e8" opacity="0.32" filter="url(#b14)"/>`;
    // (drawn with the bridge at 1500,2950; shifted up so a look over the edge finds it)
    L.push({ p: 0.45, svg: `<g transform="translate(-100,-700)">${dp}</g>` });
    // the cliff top: weathered rock, dry grass whipping in the wind, a dead pine, the fuse coil and its run to the edge
    L.push({ p: 1, svg: once('rgG', () => {
      let g = `<path d="M-2000,1480 C-1200,1440 -400,1500 300,1480 C600,1470 760,1490 860,1520 L900,1640 L880,1900 L940,2300 L900,3600 L-2000,3600Z" fill="#6a5a48" ${olr(3)}/>`;
      let m = ''; const r = rng(55);
      for (let y = 1600; y < 3600; y += 200) for (let x = -2000; x < 900; x += 260) if (x < 900 - (y - 1500) * 0.02) m += S.rockMass(x + (r() - 0.5) * 80, y, 320 + r() * 160, 220 + r() * 100, 600 + x + y, { col: mix('#8a7660', '#3a3632', (y - 1600) / 2000) });
      g += `<g filter="url(#texC)">${m}</g>`;
      g += `<path d="M-2000,1480 C-1200,1440 -400,1500 300,1480 C600,1470 760,1490 860,1520" stroke="#c8b48c" stroke-width="10" fill="none" opacity="0.7"/>`;
      g += S.rockMass(-300, 1440, 420, 220, 77, { col: '#8a7862' }) + S.rockMass(1020, 1440, 320, 180, 79, { col: '#7a6a56' });
      g += E.bareTree(-900, 1490, 900, 21, '#2a2018');
      return g; }) + (() => { let gr = ''; const r = rng(66); for (let i = 0; i < 120; i++) { const x = -2000 + r() * 2860, h = 40 + r() * 70, a = 0.35 + 0.25 * Math.sin(t * 3.5 + x * 0.02); gr += `<path d="M${f(x)},${f(1486 + r() * 10)} q${f(Math.sin(a) * h * 0.4)},${f(-h * 0.6)} ${f(Math.sin(a) * h)},${f(-h * Math.cos(a))}" stroke="${['#b8a46a', '#a8945a', '#c8b47a'][i % 3]}" stroke-width="${f(2.5 + r() * 2.5)}" fill="none" stroke-linecap="round"/>`; } return gr; })() +
      // the fuse: a coil at his feet, then out to the edge and over it
      `<ellipse cx="560" cy="1500" rx="70" ry="18" fill="none" stroke="#141010" stroke-width="9"/><ellipse cx="560" cy="1494" rx="52" ry="13" fill="none" stroke="#141010" stroke-width="9"/><path d="M610,1500 C700,1506 800,1510 870,1530 C900,1560 905,1640 896,1760" stroke="#141010" stroke-width="9" fill="none"/>` });
    // foreground grass blowing (soft)
    let fg = ''; const r2 = rng(88); for (let i = 0; i < 40; i++) { const x = -800 + r2() * 2400, h = 160 + r2() * 160, a = 0.4 + 0.3 * Math.sin(t * 3.2 + x * 0.01); fg += `<path d="M${f(x)},2400 q${f(Math.sin(a) * h * 0.4)},${f(-h * 0.6)} ${f(Math.sin(a) * h)},${f(-h * Math.cos(a))}" stroke="#7a6a3a" stroke-width="${f(8 + r2() * 8)}" fill="none" stroke-linecap="round"/>`; }
    L.push({ p: 1.25, svg: `<g filter="url(#dof2)">${fg}</g>` });
    return L;
  };

  // ======================================================= THE GIBBET AT THE CROSSROADS (dusk)
  S.GB11 = { FY: 1650, POST: 470, BEAM: [400, 900, 560], ROPE: [800, 580] };
  S.gibbet = (t, o = {}) => {
    const L = [];
    L.push({ p: 0.06, svg: once('gbS', () => `${lg('gbsk', [[0, '#2a2440'], [0.45, '#6a3a4a'], [0.75, '#c8603a'], [1, '#f0a050']])}<rect x="-3000" y="-3000" width="7000" height="7000" fill="url(#gbsk)"/>` + C.radial(820, 1480, 700, '#ffb060', 0.6, 'screen') + `<circle cx="820" cy="1480" r="90" fill="#ffd090" opacity="0.9"/>`) + [[-400, 500, 900, 3], [900, 300, 1000, 7]].map(([x, y, w, s]) => E.streak(x + t * 14, y, w, 30, '#3a2030', 0.6)).join('') });
    // distant hills with the castle on its crag, black against the sky
    L.push({ p: 0.3, svg: once('gbH', () => `<path d="M-2000,1500 C-1200,1300 -600,1420 0,1350 C400,1300 700,1380 1100,1320 C1600,1260 2200,1400 3000,1360 L3000,3000 L-2000,3000Z" fill="#2a1e24"/><path d="M-200,1360 L-200,1180 L-170,1180 L-170,1150 L-140,1150 L-140,1180 L-80,1180 L-80,1060 L-40,1060 L-40,1180 L20,1180 L20,1130 L50,1130 L50,1360Z" fill="#1e161c"/><path d="M-60,1060 L-60,1000" stroke="#1e161c" stroke-width="5"/>`) });
    // bare trees, the signpost
    L.push({ p: 0.6, svg: once('gbT', () => E.bareTree(-500, 1650, 1300, 31, '#1a1216') + E.bareTree(1500, 1650, 1000, 37, '#1a1216') + `<path d="M1180,1650 L1180,1200 M1100,1260 L1300,1290 M1120,1340 L1280,1310" stroke="#1a1216" stroke-width="20" stroke-linecap="square"/>` + `<rect x="-3000" y="1640" width="7000" height="2000" fill="#1e161a"/>`) });
    // the ground and the gibbet: a tall post, a braced arm, iron straps, the rope
    const [b0, b1, by] = S.GB11.BEAM;
    L.push({ p: 1, svg: once('gbG', () => `<path d="M-2000,1640 C-600,1600 600,1660 3000,1620 L3000,3200 L-2000,3200Z" fill="#2a2024"/><path d="M-2000,1700 C-600,1680 600,1720 3000,1700" stroke="#4a3a3a" stroke-width="40" fill="none" opacity="0.6"/>` +
      `<rect x="${S.GB11.POST - 34}" y="${by - 40}" width="68" height="${S.GB11.FY - by + 60}" fill="#2a1c16" ${olr(3)}/><rect x="${b0}" y="${by - 30}" width="${b1 - b0}" height="56" fill="#2a1c16" ${olr(3)}/><path d="M${S.GB11.POST + 30},${by + 230} L${S.GB11.POST + 230},${by + 24}" stroke="#2a1c16" stroke-width="40"/>` +
      [S.GB11.POST, S.GB11.POST + 200].map(x => `<rect x="${x - 40}" y="${by - 34}" width="20" height="64" fill="#4a4a50"/>`).join('') + `<path d="M${S.GB11.POST - 60},${S.GB11.FY} L${S.GB11.POST + 60},${S.GB11.FY} L${S.GB11.POST + 30},${S.GB11.FY - 60} L${S.GB11.POST - 30},${S.GB11.FY - 60}Z" fill="#3a3030"/>` +
      // rim light along the top edges from the low sun behind
      `<path d="M${b0},${by - 30} L${b1},${by - 30}" stroke="#ff9a50" stroke-width="5" opacity="0.7"/><path d="M${S.GB11.POST + 34},${by} L${S.GB11.POST + 34},${S.GB11.FY}" stroke="#ff9a50" stroke-width="4" opacity="0.5"/>`) });
    // crows: two on the beam (they take off at o.fly), more circling
    const fl = o.fly || 0;
    let cr = '';
    if (fl < 1) for (const [x, d] of [[480, 1], [640, -1]]) cr += crow(x, by - 30 - fl * 200, 1.1, t, { dir: d, fly: fl > 0.02 ? 1 : 0, ph: x });
    for (let i = 0; i < 6; i++) { const a = t * 0.5 + i * 1.05, x = 650 + Math.cos(a) * (360 + i * 30), y = 200 + Math.sin(a) * 120 + i * 30; cr += crow(x, y, 0.6 + (i % 3) * 0.15, t, { fly: 1, dir: Math.sin(a) > 0 ? -1 : 1, ph: i }); }
    if (fl > 0) for (const [x, d] of [[480, -1], [640, 1]]) cr += crow(x + d * -fl * 500, by - 60 - fl * 700, 1.1, t, { fly: 1, dir: -d, ph: x });
    L.push({ p: 1, svg: cr });
    L.push({ p: 1.02, light: true, svg: C.radial(820, 1480, 1600, '#ff9050', 0.15, 'screen') });
    return L;
  };

  // ======================================================= YOUR VILLAGE AT SUNDOWN
  // world: your cottage door at x 560 (the wife and daughter stand before it, feet at 1720); thatched cottages
  // along the lane (p 0.75); the hill behind (p 0.4) with the mercenaries' torches; o.fire 0..1 sets the roofs alight
  S.VL11 = { FY: 1720, WIFE: [470, 1720], DAU: [640, 1730], HILL: 0.4, MERC: [[200, 700], [420, 680], [640, 690], [860, 675], [1060, 690]] };
  S.village = (t, o = {}) => {
    const L = [], fire = o.fire || 0;
    L.push({ p: 0.06, svg: once('vlS', () => `${lg('vlsk', [[0, '#3a2a48'], [0.4, '#8a3a3a'], [0.75, '#e0603a'], [1, '#f8a050']])}<rect x="-3000" y="-3000" width="7000" height="7000" fill="url(#vlsk)"/>` + C.radial(1250, 1250, 800, '#ffb070', 0.6, 'screen') + `<circle cx="1250" cy="1250" r="120" fill="#ffc88a" opacity="0.92"/>`) + [[-300, 520, 1200, 3], [700, 360, 900, 5]].map(([x, y, w]) => E.streak(x + t * 16, y, w, 34, '#5a2a30', 0.55)).join('') });
    // the hill and the mercenaries on its crest, black against the burning sky, torches held high
    let hill = once('vlH', () => `<path d="M-2000,740 C-1000,640 -200,720 400,680 C900,650 1400,700 2600,640 L2600,3000 L-2000,3000Z" fill="#24161c"/>`);
    for (const [i, [x, y]] of S.VL11.MERC.entries()) {
      const sx = 0.42, sw = Math.sin(t * 1.3 + i) * 1.5;
      hill += `<g transform="translate(${x},${y}) scale(${sx}) rotate(${f(sw)})"><path d="M-70,0 L-60,-220 C-60,-300 -30,-330 0,-330 C30,-330 60,-300 60,-220 L70,0Z" fill="#100a0c"/><path d="M-40,-300 C-40,-380 40,-380 40,-300 L46,-250 L-46,-250Z" fill="#100a0c"/><path d="M40,-230 L110,-340" stroke="#100a0c" stroke-width="24" stroke-linecap="round"/><path d="M110,-340 L130,-460" stroke="#3a2414" stroke-width="12"/></g>`;
      hill += flames(x + 130 * sx * 1.05, y - 460 * sx, 30, 70, t, 600 + i, 1);
    }
    L.push({ p: 0.4, svg: hill });
    // the cottages along the lane; their thatch catches fire with o.fire
    L.push({ p: 0.75, svg: once('vlC', () => E.cottage(-900, 1600, 420, 280, 1, 3, { roof: '#8a7240', window: '#ffb060' }) + E.cottage(-300, 1580, 380, 260, 1, 5, { roof: '#7a6438', side: -1 }) + E.cottage(1000, 1600, 400, 280, 1, 7, { roof: '#8a7444', window: '#ffb060' }) + E.cottage(1600, 1590, 360, 250, 1, 9, { roof: '#7a6a40' }) + `<rect x="-3000" y="1590" width="7000" height="2000" fill="#3a2a22"/>` + E.fence(-1200, 1800, 1640, 60, 7, '#3a2a1e')) +
      (fire > 0 ? [[-690, 1290, 0], [-110, 1300, 0.25], [1200, 1290, 0.1], [1780, 1310, 0.4]].map(([x, y, d], i) => flames(x, y, 300, 260, t, 700 + i, cl((fire - d) / 0.5)) + (fire > d ? E.smoke(x, y - 260, 700, 4 + i, '#2a2024', 0.55 * cl((fire - d) / 0.4)) : '')).join('') : '') });
    // your cottage: whitewashed daub, a low thatch, the door, a bench, a well
    L.push({ p: 1, svg: once('vlY', () => {
      let g = `<rect x="160" y="980" width="900" height="760" fill="#cfc2a4" filter="url(#plaster)" ${olr(3)}/>`;
      g += `<path d="M80,1010 C300,640 860,640 1140,1010 L1100,1060 L120,1060Z" fill="#8a7240" filter="url(#thatch)" ${olr(3)}/>`;
      for (let x = 120; x < 1100; x += 40) g += `<path d="M${x},1056 l${(x - 600) * 0.03},28" stroke="#6a5630" stroke-width="5"/>`;
      g += `<path d="M420,1740 L420,1300 Q560,1210 700,1300 L700,1740Z" fill="#3a2414" filter="url(#woodV)" ${olr(3)}/><path d="M440,1740 L440,1320 Q560,1240 680,1320 L680,1740" fill="#140c08" opacity="0.6"/>`;
      g += `<rect x="820" y="1240" width="160" height="150" fill="#2a2218" ${olr(2)}/><rect x="830" y="1250" width="140" height="130" fill="#ffb060" opacity="0.5"/><path d="M900,1240 L900,1390 M820,1315 L980,1315" stroke="#3a2414" stroke-width="10"/>`;
      g += `<rect x="-2000" y="1700" width="5000" height="1600" fill="#4a3a2a" filter="url(#ground)"/><path d="M300,1740 C400,1900 300,2200 200,2600 L900,2600 C800,2200 720,1900 760,1740Z" fill="#6a5640" opacity="0.6"/>`;
      g += `<ellipse cx="-260" cy="1700" rx="150" ry="40" fill="#5a5048" ${olr(2)}/><rect x="-410" y="1560" width="300" height="140" fill="#6a6058" filter="url(#tex)" ${olr(2)}/><path d="M-400,1420 L-400,1560 M-120,1420 L-120,1560 M-430,1420 L-90,1420" stroke="#3a2414" stroke-width="16"/>`;
      return g; }) + (fire > 0.5 ? flames(600, 860, 800, 380, t, 801, cl((fire - 0.5) / 0.5)) + E.smoke(600, 600, 900, 6, '#2a2024', 0.6 * cl((fire - 0.5) / 0.5)) : '') });
    L.push({ p: 1.02, light: true, svg: C.radial(1250, 1250, 1800, '#ff8040', 0.18 + 0.15 * fire, 'screen') + (fire > 0 ? S.dust(560, 900, 900, 700, 40, 17, t, '#ffb050', 3, 0.8 * fire) : '') });
    return L;
  };
})(window);
