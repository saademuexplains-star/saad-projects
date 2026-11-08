// Props for "The Whipping Boy" (local coordinates around 0,0)
(function (G) {
  const { OUT, NS, ol, shade, mix, f, uid, rng } = G.RIG;
  const P = G.PROPS;
  const grad = (id, c, k = 1) => `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${shade(c, -0.35 * k)}"/><stop offset="0.35" stop-color="${shade(c, 0.15 * k)}"/><stop offset="1" stop-color="${shade(c, -0.4 * k)}"/></linearGradient>`;

  // a bunch of grapes hanging from (x,y); n berries
  P.grapes = (x, y, s, n = 18, seed = 3) => {
    const r = rng(seed); let g = `<path d="M0,-6 Q6,-24 -2,-36" stroke="#4a5a28" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M0,-28 q22,-14 30,4 q-16,0 -30,-4Z" fill="#5a7a30" ${ol(1)}/>`;
    const pts = []; for (let i = 0; i < n; i++) { const row = Math.floor(Math.sqrt(i * 2)), w = Math.max(1, 6 - row); pts.push([(r() - 0.5) * w * 15, row * 15 + r() * 4]); }
    pts.sort((a, b) => a[1] - b[1]);
    for (const [px, py] of pts) g += `<circle cx="${f(px)}" cy="${f(py)}" r="9.5" fill="${shade('#5a2a6a', (r() - 0.5) * 0.25)}" ${ol(1)}/><circle cx="${f(px - 3)}" cy="${f(py - 3)}" r="3" fill="#fff" opacity="0.35"/>`;
    return `<g transform="translate(${f(x)},${f(y)}) scale(${s})">${g}</g>`;
  };
  P.grape = (x, y, s = 1) => `<g transform="translate(${f(x)},${f(y)}) scale(${s})"><circle r="9.5" fill="#5e2c6e" ${ol(1)}/><circle cx="-3" cy="-3" r="3" fill="#fff" opacity="0.4"/></g>`;
  // golden fruit bowl heaped with grapes and an apple
  P.bowl = (x, y, s, grapes = 1) => {
    const id = uid('bw');
    let g = `<defs>${grad(id, '#d8a838')}</defs><path d="M-90,-20 Q-80,40 0,46 Q80,40 90,-20Z" fill="url(#${id})" ${ol()}/><ellipse cx="0" cy="-20" rx="90" ry="16" fill="${shade('#d8a838', -0.3)}" ${ol()}/><path d="M-30,46 L-40,70 L40,70 L30,46Z" fill="url(#${id})" ${ol()}/>`;
    if (grapes > 0) g += P.grapes(-30, -40, 1, Math.round(16 * grapes), 5) + P.grapes(30, -36, 0.9, Math.round(12 * grapes), 9);
    g += `<circle cx="10" cy="-30" r="20" fill="#b8302a" ${ol()}/><path d="M10,-50 q4,-8 8,-10" stroke="#4a3020" stroke-width="3" fill="none"/>`;
    return `<g transform="translate(${f(x)},${f(y)}) scale(${s})">${g}</g>`;
  };
  // the heavy leather rod: thick, leather-wrapped, stitched, with a grip and pommel. Grip at (0,0), rod along -y
  P.rod = (x, y, s, rot) => {
    const id = uid('rd');
    let g = `<defs>${grad(id, '#4a2c1a')}</defs><path d="M-12,0 L-9,-430 Q0,-446 9,-430 L12,0Z" fill="url(#${id})" ${ol()}/>`;
    for (let k = 0; k < 9; k++) g += `<path d="M-11,${-40 - k * 44} l22,-14" stroke="#2a1608" stroke-width="2.5" opacity="0.7"/>`;
    g += `<path d="M-2,-20 L-1,-420" stroke="#8a5a38" stroke-width="2" stroke-dasharray="6 6" opacity="0.7"/>`;
    g += `<rect x="-15" y="-10" width="30" height="90" rx="8" fill="#2a1a10" ${ol()}/>` + [10, 30, 50].map(yy => `<path d="M-15,${yy} l30,8" stroke="#6a4a2a" stroke-width="3"/>`).join('') + `<circle cx="0" cy="88" r="15" fill="#b08838" ${ol()}/>`;
    return `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)}) scale(${s})">${g}</g>`;
  };
  // book: open (pages up) or closed (cover facing)
  P.book = (x, y, s, rot = 0, open = true, col = '#6a2a1e') => {
    let g;
    if (open) {
      g = `<path d="M-120,-10 Q-60,-26 0,-8 Q60,-26 120,-10 L120,70 Q60,54 0,72 Q-60,54 -120,70Z" fill="${col}" ${ol()}/>` +
        `<path d="M-112,-14 Q-56,-30 0,-12 L0,64 Q-56,46 -112,62Z" fill="#ece0c4" ${ol(1.2)}/><path d="M112,-14 Q56,-30 0,-12 L0,64 Q56,46 112,62Z" fill="#e4d6b6" ${ol(1.2)}/>`;
      for (let i = 0; i < 6; i++) g += `<path d="M-100,${-4 + i * 10} Q-56,${-18 + i * 10} -12,${-2 + i * 10}" stroke="#4a3a2a" stroke-width="1.6" fill="none" opacity="0.6"/><path d="M12,${-2 + i * 10} Q56,${-18 + i * 10} 100,${-4 + i * 10}" stroke="#4a3a2a" stroke-width="1.6" fill="none" opacity="0.6"/>`;
    } else g = `<rect x="-80" y="-110" width="160" height="220" rx="8" fill="${col}" ${ol()}/><rect x="-62" y="-90" width="124" height="180" rx="4" fill="none" stroke="#d8b04a" stroke-width="5"/><circle r="22" fill="none" stroke="#d8b04a" stroke-width="5"/><rect x="72" y="-106" width="12" height="212" fill="#ece0c4" ${ol(1)}/>`;
    return `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)}) scale(${s})">${g}</g>`;
  };
  P.apple = (x, y, r = 22, rot = 0) => `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)})"><circle r="${r}" fill="#b8302a" ${ol()}/><circle cx="${-r * 0.35}" cy="${-r * 0.35}" r="${r * 0.3}" fill="#fff" opacity="0.3"/><path d="M0,${-r} q4,-10 8,-12" stroke="#4a3020" stroke-width="3" fill="none"/><path d="M2,${-r - 4} q12,-10 18,0 q-10,4 -18,0Z" fill="#5a8a30"/></g>`;
  // hourglass: sand 0 (all on top) .. 1 (all fallen)
  P.hourglass = (x, y, s, sand = 0.5, t = 0) => {
    const id = uid('hg'); const top = 1 - sand;
    let g = `<defs><clipPath id="${id}t"><path d="M-46,-120 L46,-120 Q46,-60 6,-12 L-6,-12 Q-46,-60 -46,-120Z"/></clipPath><clipPath id="${id}b"><path d="M-6,12 L6,12 Q46,60 46,120 L-46,120 Q-46,60 -6,12Z"/></clipPath></defs>`;
    g += `<g clip-path="url(#${id}t)"><rect x="-50" y="${f(-12 - top * 100)}" width="100" height="${f(top * 100 + 2)}" fill="#d8b878"/></g>`;
    g += `<g clip-path="url(#${id}b)"><path d="M-50,120 L50,120 L50,${f(120 - sand * 70)} Q0,${f(120 - sand * 108)} -50,${f(120 - sand * 70)}Z" fill="#d8b878"/></g>`;
    if (sand > 0.01 && sand < 0.99) g += `<path d="M0,-12 L0,${f(120 - sand * 100)}" stroke="#d8b878" stroke-width="2.5" opacity="0.9"/>`;
    g += `<path d="M-46,-120 Q-46,-60 -6,-12 L-6,12 Q-46,60 -46,120 M46,-120 Q46,-60 6,-12 L6,12 Q46,60 46,120" stroke="#e8f0f8" stroke-width="3" fill="none" opacity="0.8"/><path d="M-30,-100 Q-30,-60 -10,-30" stroke="#fff" stroke-width="4" opacity="0.4" fill="none"/>`;
    g += `<rect x="-62" y="-140" width="124" height="20" rx="4" fill="#5a3a20" ${ol()}/><rect x="-62" y="120" width="124" height="20" rx="4" fill="#5a3a20" ${ol()}/>`;
    for (const sx of [-1, 1]) g += `<rect x="${sx * 56 - 5}" y="-120" width="10" height="240" fill="#4a2e18" ${ol(1)}/>`;
    return `<g transform="translate(${f(x)},${f(y)}) scale(${s})">${g}</g>`;
  };
  // flying stained-glass shards (u = 0..1 since the break)
  P.shards = (x, y, u, seed = 4) => {
    const r = rng(seed); let g = '';
    const cols = ['#c83a3a', '#3a6ac8', '#e8c84a', '#3aa86a', '#9a4ac8', '#f0f0f0'];
    for (let i = 0; i < 22; i++) {
      const a = r() * 6.283, sp = 300 + r() * 600, vx = Math.cos(a) * sp, vy = Math.sin(a) * sp - 200;
      const px = x + vx * u, py = y + vy * u + 900 * u * u, rot = r() * 360 + u * 720 * (r() - 0.5), sz = 8 + r() * 16;
      g += `<path d="M0,${-sz} L${sz * 0.6},${sz * 0.4} L${-sz * 0.5},${sz * 0.7}Z" transform="translate(${f(px)},${f(py)}) rotate(${f(rot)})" fill="${cols[i % cols.length]}" opacity="${f(Math.max(0, 0.95 - u * 0.5))}" stroke="#1f140c" stroke-width="1"/>`;
    }
    return g;
  };
  // low wooden whipping bench
  P.stool = (x, y, s) => { const id = uid('st'); return `<g transform="translate(${f(x)},${f(y)}) scale(${s})"><defs>${grad(id, '#6a4428')}</defs><rect x="-170" y="-150" width="340" height="44" rx="8" fill="url(#${id})" ${ol()} filter="url(#woodH)"/>` + [-140, 140].map(xx => `<path d="M${xx - 16},-106 L${xx + 16},-106 L${xx + 22},0 L${xx - 22},0Z" fill="${shade('#5a3820', -0.1)}" ${ol()}/>`).join('') + `<rect x="-150" y="-60" width="300" height="16" fill="#4a2c18" ${ol(1)}/></g>`; };
  // velvet armchair (back part); the seat front is drawn separately in front of the sitter
  P.chairBack = (x, y, s, col = '#7a1a2a') => { const id = uid('ch'); return `<g transform="translate(${f(x)},${f(y)}) scale(${s})"><defs>${grad(id, '#c9a040')}</defs><path d="M-150,0 L-150,-560 Q0,-660 150,-560 L150,0Z" fill="url(#${id})" ${ol()}/><path d="M-120,-40 L-120,-530 Q0,-610 120,-530 L120,-40Z" fill="${col}" ${ol()}/>` + [-60, 0, 60].map(xx => `<circle cx="${xx}" cy="-380" r="6" fill="#e2b040"/>`).join('') + `<path d="M-120,-530 Q0,-610 120,-530" stroke="#fff" stroke-width="6" opacity="0.15" fill="none"/></g>`; };
  P.chairFront = (x, y, s, col = '#7a1a2a') => { const id = uid('cf'); let g = `<defs>${grad(id, '#c9a040')}</defs>` + [-1, 1].map(sx => `<rect x="${sx * 150 - 26}" y="-250" width="52" height="250" rx="10" fill="url(#${id})" ${ol()}/><circle cx="${sx * 150}" cy="-256" r="30" fill="url(#${id})" ${ol()}/>`).join('');
    g += `<path d="M-128,-230 Q0,-250 128,-230 L128,-60 Q0,-40 -128,-60Z" fill="${col}" ${ol()}/><path d="M-128,-230 Q0,-250 128,-230" stroke="#fff" stroke-width="5" opacity="0.18" fill="none"/>`;
    for (let i = 0; i < 13; i++) g += `<path d="M${-120 + i * 20},-58 l0,22" stroke="#e2b040" stroke-width="5" stroke-linecap="round"/>`;
    return `<g transform="translate(${f(x)},${f(y)}) scale(${s})">${g}</g>`; };
  // flowing silk sheet (for the costume wipe): spans w x h around (x,y), ripples with t
  P.silk = (x, y, w, h, t, col = '#2c6d8c') => {
    const id = uid('sk'); let top = '', bot = '';
    for (let i = 0; i <= 12; i++) { const u = i / 12, px = x - w / 2 + u * w; top += `${i ? 'L' : 'M'}${f(px)},${f(y - h / 2 + Math.sin(u * 7 + t * 9) * 40)} `; bot = `L${f(px)},${f(y + h / 2 + Math.sin(u * 6 + t * 8 + 1) * 50)} ` + bot; }
    let g = `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0">` + [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1].map((o, i) => `<stop offset="${o}" stop-color="${shade(col, i % 2 ? 0.28 : -0.25)}"/>`).join('') + `</linearGradient></defs>`;
    return g + `<path d="${top}${bot}Z" fill="url(#${id})" opacity="0.97"/><path d="${top}" stroke="#d8b04a" stroke-width="10" fill="none"/>`;
  };
  P.tape = (x0, y0, x1, y1) => `<path d="M${f(x0)},${f(y0)} Q${f((x0 + x1) / 2)},${f(Math.max(y0, y1) + 60)} ${f(x1)},${f(y1)}" stroke="#e8c84a" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M${f(x0)},${f(y0)} Q${f((x0 + x1) / 2)},${f(Math.max(y0, y1) + 60)} ${f(x1)},${f(y1)}" stroke="#4a3a1a" stroke-width="10" fill="none" stroke-dasharray="1.5 9"/>`;
  P.drop = (x, y, r = 7) => `<path d="M${f(x)},${f(y - r * 1.8)} Q${f(x + r)},${f(y)} ${f(x)},${f(y + r * 0.6)} Q${f(x - r)},${f(y)} ${f(x)},${f(y - r * 1.8)}Z" fill="#8a1018"/><circle cx="${f(x - r * 0.3)}" cy="${f(y - r * 0.2)}" r="${f(r * 0.22)}" fill="#fff" opacity="0.45"/>`;
})(window);
