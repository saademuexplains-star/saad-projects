// Sets for "The Leech Collector": a cold misty swamp at dawn, the town doctor's apothecary.
(function (G) {
  const { f, shade, mix, rng, uid, OUT, ol } = G.RIG, C = G.CINE, E = G.ENV, S = G.SETS, P = G.PROPS;
  const lg = S.lg;
  // soft mist blob as an elliptical radial gradient (no blur filter, so it stays cheap and never drops out)
  const mist = (cx, cy, rx, ry, col, op) => { const id = uid('ms'); return `<defs><radialGradient id="${id}"><stop offset="0" stop-color="${col}" stop-opacity="${f(op)}"/><stop offset="0.55" stop-color="${col}" stop-opacity="${f(op * 0.55)}"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></radialGradient></defs><ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx)}" ry="${f(ry)}" fill="url(#${id})"/>`; };
  S.mist = mist;
  // drifting mist bank: n blobs travelling sideways, wrapping smoothly inside [x0, x1]
  const mistBank = (x0, x1, y, ry, n, seed, t, col, op, speed = 14) => {
    const r = rng(seed), W = x1 - x0; let g = '';
    for (let i = 0; i < n; i++) {
      const bx = r() * W, rx = 300 + r() * 420, by = y + (r() - 0.5) * ry * 1.6, ph = r() * 6.28, sp = speed * (0.6 + r() * 0.8);
      const x = x0 + ((bx + t * sp) % W + W) % W, fade = Math.min(1, Math.min(x - x0, x1 - x) / 260);
      g += mist(x, by + Math.sin(t * 0.4 + ph) * 10, rx, ry * (0.7 + r() * 0.6), col, op * (0.5 + r() * 0.5) * Math.max(0, fade));
    }
    return g;
  };
  // a reed or bulrush: stem, two blades, optional cattail head; sways about its base
  const reed = (x, y, h, sway, col, head, w = 6) => {
    const tx = x + sway, ty = y - h;
    let g = `<path d="M${f(x)},${f(y)} Q${f(x + sway * 0.3)},${f(y - h * 0.5)} ${f(tx)},${f(ty)}" stroke="${col}" stroke-width="${f(w)}" fill="none" stroke-linecap="round"/>`;
    g += `<path d="M${f(x)},${f(y)} Q${f(x - h * 0.12 + sway * 0.4)},${f(y - h * 0.45)} ${f(x - h * 0.2 + sway * 0.8)},${f(y - h * 0.78)}" stroke="${shade(col, 0.1)}" stroke-width="${f(w * 1.3)}" fill="none" stroke-linecap="round"/>`;
    g += `<path d="M${f(x)},${f(y)} Q${f(x + h * 0.1 + sway * 0.4)},${f(y - h * 0.4)} ${f(x + h * 0.16 + sway * 0.7)},${f(y - h * 0.66)}" stroke="${shade(col, -0.12)}" stroke-width="${f(w * 1.1)}" fill="none" stroke-linecap="round"/>`;
    if (head) { const hx = x + sway * 0.86, hy = y - h * 0.86; g += `<rect x="${f(hx - w * 1.6)}" y="${f(hy - h * 0.13)}" width="${f(w * 3.2)}" height="${f(h * 0.15)}" rx="${f(w * 1.6)}" fill="#4a2e18" ${ol(1)}/><path d="M${f(hx - w * 0.6)},${f(hy - h * 0.11)} l0,${f(h * 0.1)}" stroke="#7a5030" stroke-width="${f(w * 0.6)}" opacity="0.6"/>`; }
    return g;
  };
  const reedBed = (x0, x1, y, hMin, hMax, n, seed, t, cols, amp = 8) => {
    const r = rng(seed); let g = '';
    for (let i = 0; i < n; i++) { const x = x0 + r() * (x1 - x0), h = hMin + r() * (hMax - hMin), ph = r() * 6.28; g += reed(x, y + r() * 14, h, Math.sin(t * 1.1 + ph) * amp * h / 400, cols[i % cols.length], r() > 0.55, 4 + r() * 4); }
    return g;
  };
  // a crow flapping slowly across the sky (wings on a smooth sine)
  const crow = (x, y, s, t, ph) => {
    const k = Math.sin(t * 7 + ph), wy = -k * 26;
    return `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})" fill="#16181c"><ellipse cx="0" cy="0" rx="22" ry="8"/><circle cx="20" cy="-4" r="7"/><path d="M26,-4 l10,3 l-10,2Z"/><path d="M-6,-2 Q-24,${f(wy - 10)} -52,${f(wy)} Q-24,${f(wy * 0.3 + 4)} 6,2Z"/><path d="M-4,-2 Q14,${f(wy - 14)} 40,${f(wy - 4)} Q14,${f(wy * 0.3 + 2)} 8,2Z" opacity="0.85"/><path d="M-20,0 l-16,6 l2,-8Z"/></g>`;
  };

  // ============================================== THE SWAMP AT DAWN. Returns named layers so shots can slot the people in.
  S.swamp = (t, o = {}) => {
    const WY = o.waterY ?? 1530;
    // overcast dawn: dark heavy cloud above, paling only towards the treeline; darker cloud banks break up the grey
    const sky = lg('swS', [[0, '#2c3642'], [0.5, '#56626c'], [0.84, '#a2a49e'], [1, '#b8b0a0']]) + `<rect x="-1500" y="-1700" width="4200" height="3400" fill="url(#swS)"/>` +
      mistBank(-1300, 2400, 150, 200, 8, 3, t, '#262e38', 0.45, 5) + mistBank(-1300, 2400, 640, 160, 7, 5, t, '#3e4852', 0.35, 7) +
      C.radial(-280, 1150, 950, '#e8ccaa', 0.16) + mistBank(-1300, 2400, 1000, 120, 6, 9, t, '#c8c8c0', 0.16, 9) +
      crow(-200 + t * 70, 520 + Math.sin(t * 0.7) * 20, 0.9, t, 0) + crow(-420 + t * 64, 600 + Math.sin(t * 0.6 + 1) * 24, 0.7, t, 2.1);
    let far = `<g transform="translate(-1000,0)">${E.ridge(3200, 1370, 60, 31, '#5c6468', 110)}</g>`;
    for (const [x, h, s] of [[-760, 520, 7], [-420, 380, 9], [-60, 300, 4], [700, 360, 12], [1080, 560, 15], [1500, 420, 18], [1880, 330, 21]]) far += E.bareTree(x, 1380, h, s, '#454e54');
    far += lg('swV', [[0, '#c8c8c0', 0], [1, '#c8c8c0', 0.75]]) + `<rect x="-1000" y="900" width="3200" height="520" fill="url(#swV)"/>`;
    const farWater = `<rect x="-1200" y="1360" width="3500" height="260" fill="#8e9690"/>` +
      [[-600, 0.2], [-200, 0.12], [700, 0.15], [1100, 0.22], [1500, 0.16]].map(([x, op]) => `<rect x="${x - 20}" y="1362" width="40" height="${f(90 + (x % 70))}" fill="#3a4448" opacity="${op}"/>`).join('') +
      mistBank(-1200, 2300, 1385, 60, 8, 11, t, '#dadcd4', 0.5, 16);
    const mid = reedBed(-760, 160, 1480, 240, 520, 46, 13, t, ['#3e4a2a', '#4e5834', '#2e3820']) + reedBed(860, 1900, 1480, 220, 480, 44, 17, t, ['#3a4628', '#505a36', '#2a341e']) +
      E.bareTree(1330, 1490, 640, 5, '#262a26');
    // near water: murky green-brown, sky sheen at the far edge, drifting ripples, lily pads, duckweed, the muddy bank on the left
    let water = lg('swW', [[0, '#68726a'], [0.05, '#4c5848'], [0.16, '#34402f'], [0.5, '#1e271b'], [1, '#121810']]) + `<rect x="-1500" y="1440" width="4200" height="2600" fill="url(#swW)"/>`;
    water += `<rect x="-1500" y="1440" width="4200" height="70" fill="#a8b0a6" opacity="0.18"/>`;
    for (let i = 0; i < 46; i++) {
      const y = 1452 + i * i * 0.55 + i * 9, sp = 0.5 + (i % 5) * 0.12, len = 70 + (i % 4) * 40 + i * 2;
      for (const k of [0, 1, 2]) { const x = -900 + ((i * 337 + k * 911) % 2600) + Math.sin(t * sp + i + k) * 26; water += `<path d="M${f(x)},${f(y)} q${f(len / 2)},-6 ${f(len)},0" stroke="#c8d2c4" stroke-width="${f(1.6 + i * 0.05)}" fill="none" opacity="${f(Math.max(0.05, 0.3 - i * 0.005))}"/>`; }
    }
    const pads = [[150, 1600, 70], [860, 1640, 62], [1040, 1590, 48], [260, 1790, 90], [820, 1860, 84], [-120, 1700, 74], [680, 2020, 110]];
    for (const [x, y, r] of pads) { const b = Math.sin(t * 1.2 + x) * 3; water += `<path d="M${f(x)},${f(y + b)} L${f(x + r)},${f(y + b - r * 0.12)} A${r},${f(r * 0.32)} 0 1 1 ${f(x + r * 0.95)},${f(y + b + r * 0.12)}Z" fill="#40562c" ${ol(1.2)}/><path d="M${f(x - r * 0.6)},${f(y + b - r * 0.08)} q${f(r * 0.5)},-6 ${f(r)},-2" stroke="#7a9050" stroke-width="2" fill="none" opacity="0.5"/>`; }
    const dr = rng(23);
    for (let i = 0; i < 160; i++) { const x = -700 + dr() * 2400, y = 1470 + Math.pow(dr(), 1.6) * 700; water += `<ellipse cx="${f(x + Math.sin(t * 0.3 + i) * 4)}" cy="${f(y)}" rx="${f(2 + dr() * 4)}" ry="${f(1 + dr() * 1.6)}" fill="#7a8c3a" opacity="${f(0.35 + dr() * 0.3)}"/>`; }
    water += `<path d="M-1500,1470 L-120,1470 C60,1474 180,1500 250,1560 C290,1600 250,1650 120,1680 L-1500,1720Z" fill="#3a2e22" filter="url(#ground)" ${ol(1.6)}/>` +
      `<path d="M-1500,1470 L-120,1470 C60,1474 180,1500 250,1560" stroke="#6a5a44" stroke-width="5" fill="none" opacity="0.6"/>` + E.tufts(-1000, 180, 1470, 1520, 70, 7, '#5a6234') +
      reedBed(-900, 120, 1488, 120, 260, 24, 29, t, ['#4a5430', '#5a6438']);
    const lowMist = mistBank(-1200, 2300, 1488, 70, 9, 19, t, '#d8dad2', 0.42, 18);
    const fg = reedBed(-330, 90, 2380, 900, 1350, 18, 41, t, ['#141a10', '#1c2414', '#10140c'], 14) + reedBed(990, 1420, 2380, 860, 1300, 16, 43, t, ['#141a10', '#1a2212', '#0e120a'], 14);
    return {
      sky: { p: 0.2, svg: sky }, far: { p: 0.45, svg: `<g filter="url(#dof2)">${far}</g>` }, farWater: { p: 0.6, svg: `<g filter="url(#dof1)">${farWater}</g>` },
      mid: { p: 0.8, svg: `<g filter="url(#dof1)">${mid}</g>` }, water: { p: 1, svg: water }, lowMist: { p: 1.06, svg: lowMist, light: true }, fg: { p: 1.32, svg: `<g filter="url(#dof3)">${fg}</g>` }, WY,
    };
  };
  // the same swamp as a soft backdrop for close-ups (one blurred layer + a wet mud bank)
  S.swampBack = (t, groundY) => {
    let g = lg('swB', [[0, '#6a7680'], [0.55, '#a6aaa4'], [0.75, '#8a948a'], [1, '#4a5646']]) + `<rect x="-1500" y="-1500" width="4200" height="4600" fill="url(#swB)"/>`;
    g += reedBed(-900, 2000, groundY - 280, 300, 700, 50, 51, t, ['#3e4a2a', '#4e5834', '#2e3820'], 6) + mistBank(-1200, 2300, groundY - 380, 120, 8, 53, t, '#dcdcd4', 0.5, 14);
    const ground = `<path d="M-1500,${groundY} Q300,${groundY - 30} 2700,${groundY + 10} L2700,${groundY + 1600} L-1500,${groundY + 1600}Z" fill="#3a2e20" filter="url(#ground)"/>` +
      `<ellipse cx="760" cy="${groundY + 70}" rx="340" ry="36" fill="#6e7a72" opacity="0.5"/><ellipse cx="760" cy="${groundY + 74}" rx="300" ry="22" fill="#2a2a20" opacity="0.4"/>` + E.tufts(-800, 2000, groundY - 10, groundY + 200, 90, 61, '#4a5230');
    return { back: { p: 0.55, svg: `<g filter="url(#dof3)">${g}</g>` }, ground: { p: 1, svg: ground } };
  };

  // ============================================== THE APOTHECARY: candle-lit shop, cold dawn at the window
  S.apothecary = (t, o = {}) => {
    let w = `<rect x="-1000" y="-900" width="3200" height="3000" fill="#4a3424" filter="url(#woodV)"/>`;
    for (let x = -1000; x < 2200; x += 180) w += `<path d="M${x},-900 L${x},2100" stroke="#24180e" stroke-width="6" opacity="0.6"/>`;
    w += `<rect x="-1000" y="30" width="3200" height="60" fill="#2a1c12" ${ol(1.5)}/>`;   // ceiling beam
    // the window: cold misty dawn outside, reeds faint behind the glass
    w += lg('apW', [[0, '#9aa6b0'], [1, '#c8ccc4']]) + `<rect x="-90" y="220" width="400" height="560" fill="url(#apW)"/>` + reedBed(-80, 300, 780, 80, 200, 14, 71, t, ['#7a8478', '#6a7468'], 4) +
      C.radial(110, 470, 420, '#e8eef2', 0.35) + `<rect x="-90" y="220" width="400" height="560" fill="none" stroke="#1e140c" stroke-width="26"/><path d="M110,220 L110,780 M-90,500 L310,500" stroke="#1e140c" stroke-width="14"/>`;
    // shelves of jars and bottles
    const r = rng(81);
    for (const sy of [430, 690, 950]) {
      w += `<rect x="430" y="${sy}" width="1300" height="20" fill="#2a1c10" ${ol(1.4)}/><rect x="430" y="${sy + 20}" width="1300" height="12" fill="#000" opacity="0.35"/>`;
      for (let x = 480; x < 1700; x += 90 + r() * 50) w += r() > 0.5 ? P.jar(x, sy, 0.38 + r() * 0.18, ['#8a5030', '#6a4a3a', '#a0603a', '#5a4a3a'][(r() * 4) | 0]) : P.bottle(x, sy, 0.7 + r() * 0.4, ['#3a5a3a', '#5a3a1e', '#2a3a4a', '#6a5a2a'][(r() * 4) | 0]);
    }
    for (const [hx, s] of [[-420, 3], [-260, 5], [360, 7], [520, 9], [1500, 11], [1660, 13]]) w += E.herbs(hx, 90, 170, ['#6a7a3a', '#7a6a3a', '#5a6a40'][s % 3], s);
    w += `<rect x="-1000" y="-900" width="3200" height="3000" fill="#140a10" opacity="0.3" style="mix-blend-mode:multiply"/>`;
    const flick = 1 + Math.sin(t * 13) * 0.05 + Math.sin(t * 21) * 0.04;
    const light = `<path d="M-90,230 L310,230 L860,1700 L240,1700Z" fill="#cdd8e2" opacity="0.07" filter="url(#b14)"/>` + C.radial(930, 1080, 1000, '#ffb060', 0.3 * flick) + S.dust(560, 900, 520, 520, 40, 9, t, '#fff0d8', 2, 0.45);
    return { wall: { p: 0.6, svg: `<g filter="url(#dof1)">${w}</g>` }, light: { p: 0.8, svg: light, light: true } };
  };
  // the counter in front of the people (p 1), with the leech jar, a candle, a mortar and bottles
  S.counter = (t, o = {}) => {
    const CT = o.top ?? 1190;
    let g = `<rect x="-1200" y="${CT + 22}" width="3500" height="1400" fill="#3e2818" filter="url(#woodH)"/>`;
    for (const x of [-200, 260, 720, 1180]) g += `<rect x="${x}" y="${CT + 90}" width="380" height="600" fill="none" stroke="#24160c" stroke-width="10" opacity="0.7"/>`;
    g += `<rect x="-1200" y="${CT}" width="3500" height="30" fill="#5e3e24" filter="url(#woodH)" ${ol(1.6)}/><rect x="-1200" y="${CT}" width="3500" height="6" fill="#fff" opacity="0.08"/><rect x="-1200" y="${CT + 30}" width="3500" height="24" fill="#000" opacity="0.35"/>`;
    g += P.bottle(110, CT + 8, 1.1, '#3a5a3a') + P.bottle(200, CT + 8, 0.8, '#5a3a1e') + P.mortar(1190, CT + 8, 0.9);
    g += P.candle(1065, CT + 8, 90, t, 1.2) + C.radial(1065, CT - 140, 260, '#ffc070', 0.45 * (1 + Math.sin(t * 13) * 0.06));
    g += P.leechJar(o.jarX ?? 560, CT + 8, o.jarS ?? 0.8, t, {});
    return g;
  };
  S.shopFg = t => `<g filter="url(#dof3)">${E.herbs(1180, -200, 520, '#2a2a14', 3)}${E.herbs(1290, -260, 600, '#22220e', 6)}${P.bottle(-40, 2150, 3.2, '#141a10')}</g>`;
})(window);
