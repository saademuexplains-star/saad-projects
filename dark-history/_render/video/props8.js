// Props for "The Confessor". Hand-held props use the RIG grip frame (+x = thumb side, +y = fingers).
(function (G) {
  const { f, shade, mix, rng, uid, OUT, ol } = G.RIG, C = G.CINE;
  const P = G.PROPS;
  const LG = (id, stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1, units = '') => `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"${units ? ` gradientUnits="${units}"` : ''}>${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a !== undefined ? ` stop-opacity="${a}"` : ''}/>`).join('')}</linearGradient>`;
  const GOLD = (id, x1 = 0, y1 = 0, x2 = 1, y2 = 0) => LG(id, [[0, '#6a4a14'], [0.3, '#f2d27a'], [0.55, '#c89a3a'], [0.8, '#8a6420'], [1, '#5a3c10']], x1, y1, x2, y2);

  // ---------------- the communion chalice. (x,y) = foot centre on the altar, s scale.
  // o.wine 0..1 level, o.dark 0..1 poison mixed in, o.swirl phase (rad) of the swirl, o.tip deg about the foot rim
  P.CHALICE_RIM = 262;   // rim height above the foot (local units)
  P.chalice = (x, y, s = 1, o = {}) => {
    const id = uid('ch'), tip = o.tip || 0, piv = tip >= 0 ? 60 : -60, lev = o.wine ?? 0.8, dk = o.dark || 0;
    let g = `<defs>${GOLD(id)}</defs><g transform="rotate(${f(tip)} ${piv} 0)">`;
    // foot: a flared hexagonal base
    g += `<path d="M-62,-4 L-48,-16 L48,-16 L62,-4 L48,4 L-48,4Z" fill="url(#${id})" ${ol(1.3)}/><path d="M-48,-16 C-40,-34 -16,-44 -12,-60 L12,-60 C16,-44 40,-34 48,-16Z" fill="url(#${id})" ${ol(1.2)}/>`;
    // stem with a jewelled knop
    g += `<rect x="-11" y="-160" width="22" height="104" fill="url(#${id})" ${ol(1.1)}/><ellipse cx="0" cy="-108" rx="27" ry="15" fill="url(#${id})" ${ol(1.2)}/>`;
    for (const [jx, c] of [[-14, '#a8202a'], [0, '#2a5aa8'], [14, '#a8202a']]) g += `<circle cx="${jx}" cy="-108" r="4.5" fill="${c}" ${ol(0.8)}/>`;
    // the bowl, with an engraved cross
    g += `<path d="M-74,-${P.CHALICE_RIM} C-74,-196 -42,-160 0,-158 C42,-160 74,-196 74,-${P.CHALICE_RIM}Z" fill="url(#${id})" ${ol(1.4)}/>`;
    g += `<path d="M-4,-232 L4,-232 L4,-214 L14,-214 L14,-206 L4,-206 L4,-182 L-4,-182 L-4,-206 L-14,-206 L-14,-214 L-4,-214Z" fill="#7a5418" opacity="0.8"/>`;
    g += `<path d="M-60,-${P.CHALICE_RIM - 10} C-58,-206 -40,-178 -16,-170" stroke="#fff6c8" stroke-width="5" fill="none" opacity="0.5"/>`;
    // rim and the wine inside it; the poison darkens it and turns in a slow spiral
    g += `<ellipse cx="0" cy="-${P.CHALICE_RIM}" rx="74" ry="14" fill="#4a3008" ${ol(1.3)}/>`;
    if (lev > 0 && Math.abs(tip) < 50) {
      const wc = mix('#6a0a18', '#1c2410', dk * 0.85), wy = -P.CHALICE_RIM + 4 + (1 - lev) * 10;
      g += `<ellipse cx="0" cy="${f(wy)}" rx="${f(66 - (1 - lev) * 8)}" ry="10" fill="${wc}"/><ellipse cx="-18" cy="${f(wy - 3)}" rx="22" ry="3.5" fill="${mix('#c03040', '#5a7a3a', dk)}" opacity="0.55"/>`;
      if (dk > 0.02) { const a = o.swirl || 0; let d = ''; for (let i = 0; i <= 40; i++) { const u = i / 40, r = 6 + u * 52, th = a + u * 7.5; d += `${i ? 'L' : 'M'}${f(Math.cos(th) * r)},${f(wy + Math.sin(th) * r * 0.16)} `; } g += `<path d="${d}" stroke="#2a3a18" stroke-width="5" fill="none" opacity="${f(0.75 * Math.min(1, dk * 2) * (1 - 0.6 * dk))}"/>`; }
    }
    g += `</g>`;
    return `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">${g}</g>`;
  };
  // wine spilled on stone (x,y centre), u 0..1
  P.wineSpill = (x, y, u, seed = 3, sc = 1) => {
    if (u <= 0) return '';
    const r = rng(seed); let d = '';
    for (let i = 0; i <= 24; i++) { const a = i / 24 * Math.PI * 2, rr = (0.7 + r() * 0.6) * u; d += `${i ? 'L' : 'M'}${f(x + Math.cos(a) * 200 * rr * sc)},${f(y + Math.sin(a) * 40 * rr * sc)} `; }
    return `<path d="${d}Z" fill="#4a0810" opacity="0.88" filter="url(#b2)"/><path d="${d}Z" fill="#8a1424" opacity="0.4" transform="translate(${f(x * 0.3)},${f(y * 0.3)}) scale(0.7)" filter="url(#b4)"/>`;
  };

  // ---------------- the rat-poison flask (grip frame): a squat glass bulb in the fist, the neck out of the thumb side.
  // o.level 0..1, o.open (no cork), o.glint
  P.POISON_MOUTH = [70, 0];
  P.poisonG = (o = {}) => {
    const id = uid('pz'), lev = o.level ?? 0.85;
    let g = `<defs><clipPath id="${id}"><path d="M-22,-26 C-46,-26 -46,26 -22,26 C0,26 14,14 26,8 L62,7 L62,-7 L26,-8 C14,-14 0,-26 -22,-26Z"/></clipPath></defs>`;
    g += `<path d="M-22,-26 C-46,-26 -46,26 -22,26 C0,26 14,14 26,8 L62,7 L62,-7 L26,-8 C14,-14 0,-26 -22,-26Z" fill="#c8dcd8" opacity="0.3"/>`;
    g += `<g clip-path="url(#${id})"><rect x="-50" y="-30" width="${f(50 + 112 * lev)}" height="60" fill="#1e2c14" opacity="0.92"/><rect x="-50" y="-30" width="${f(50 + 112 * lev)}" height="12" fill="#4a6a2a" opacity="0.5"/></g>`;
    g += `<path d="M-22,-26 C-46,-26 -46,26 -22,26 C0,26 14,14 26,8 L62,7 L62,-7 L26,-8 C14,-14 0,-26 -22,-26Z" fill="none" ${ol(1.3)}/><path d="M-30,-16 C-38,-10 -38,6 -32,12" stroke="#fff" stroke-width="3.5" fill="none" opacity="0.6"/><path d="M30,-4 L58,-4" stroke="#fff" stroke-width="2" opacity="0.5"/>`;
    g += `<path d="M28,-9 L34,-9 L34,9 L28,9Z" fill="#6a4a2a"/>`;   // twine at the neck
    if (!o.open) g += `<rect x="60" y="-6" width="16" height="12" rx="3" fill="#8a6a42" ${ol(1.1)}/>`;
    else g += `<ellipse cx="62" cy="0" rx="2.5" ry="6.5" fill="#1e2c14"/>`;
    if (o.glint) g += C.radial(-28, -12, 26, '#ffffff', 0.6 * o.glint, 'screen');
    return g;
  };

  // ---------------- a horn-paned iron lantern hanging from its bail at (x,y) (world), glowing
  P.lantern = (x, y, s, t, sw = 0) => {
    const fl = 0.85 + 0.1 * Math.sin(t * 9) + 0.05 * Math.sin(t * 23);
    let g = `<g transform="translate(${f(x)},${f(y)}) rotate(${f(sw)}) scale(${f(s)})">`;
    g += `<path d="M-26,40 Q0,-10 26,40" stroke="#1a1612" stroke-width="5" fill="none"/>`;
    g += `<path d="M-34,40 L34,40 L28,56 L-28,56Z" fill="#2a2420" ${ol(1.2)}/><rect x="-30" y="56" width="60" height="78" fill="#ffd98a" opacity="${f(0.85 * fl)}"/>`;
    g += `<path d="M-2,120 C-9,112 -8,96 0,80 C8,96 9,112 2,120Z" fill="#fff4c8"/>`;
    for (const x0 of [-30, -10, 10, 30]) g += `<path d="M${x0},56 L${x0},134" stroke="#1a1612" stroke-width="4"/>`;
    g += `<path d="M-36,134 L36,134 L30,148 L-30,148Z" fill="#2a2420" ${ol(1.2)}/></g>`;
    return g + C.bloom(x + Math.sin(sw * Math.PI / 180) * -90 * s, y + 95 * s, 170 * s, '#ffc870', 0.55 * fl);
  };
})(window);
