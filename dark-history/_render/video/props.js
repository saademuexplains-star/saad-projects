// Props for "The Messenger" (local coordinates, designed around 0,0)
(function (G) {
  const { OUT, NS, ol, shade, mix, f, uid, rng } = G.RIG;
  // scales are never rounded to steps (a far prop would jump a few per cent at each step as the camera moves)
  const fs = v => Math.round(v * 1e5) / 1e5;
  const P = {};

  // rolled scroll, horizontal, centred on (x,y); len along x; seal: draw red wax seal; broken: 0..1 seal split
  P.scroll = (x, y, len, d, rot = 0, o = {}) => {
    const id = uid('sc'), c = o.col || '#e6d3a6';
    let g = `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(c, -0.3)}"/><stop offset="0.35" stop-color="${shade(c, 0.18)}"/><stop offset="0.7" stop-color="${c}"/><stop offset="1" stop-color="${shade(c, -0.38)}"/></linearGradient></defs>`;
    g += `<rect x="${-len / 2}" y="${-d / 2}" width="${len}" height="${d}" rx="${d * 0.2}" fill="url(#${id})" ${ol()}/>`;
    for (const s of [-1, 1]) g += `<ellipse cx="${s * len / 2}" cy="0" rx="${d * 0.16}" ry="${d / 2}" fill="${shade(c, -0.15)}" ${ol(1.4)}/><ellipse cx="${s * len / 2}" cy="0" rx="${d * 0.07}" ry="${d * 0.22}" fill="${shade(c, -0.45)}"/>`;
    g += `<rect x="${-d * 0.18}" y="${-d / 2}" width="${d * 0.36}" height="${d}" fill="#8e1e22"/><rect x="${-d * 0.18}" y="${-d / 2}" width="${d * 0.1}" height="${d}" fill="#c04040" opacity="0.6"/>`;
    if (o.seal !== false) {
      const br = o.broken || 0, sr = d * 0.42;
      for (const s of [-1, 1]) {
        const dx = s * br * sr * 0.9, dy = br * sr * 0.4, rr = br * s * 25;
        g += `<g transform="translate(${f(dx)},${f(d * 0.15 + dy)}) rotate(${f(rr)})"><path d="M0,${-sr} A${sr},${sr} 0 0 ${s > 0 ? 1 : 0} 0,${sr} L${s * sr * 0.12},${sr * 0.3} L${-s * sr * 0.08},0 L${s * sr * 0.1},${-sr * 0.4}Z" fill="#a5161c" ${ol(1.3)}/>` +
          `<path d="M${s * sr * 0.25},${-sr * 0.55} A${sr * 0.6},${sr * 0.6} 0 0 ${s > 0 ? 1 : 0} ${s * sr * 0.25},${sr * 0.55}" stroke="#6e0c10" stroke-width="2" fill="none"/><ellipse cx="${s * sr * 0.5}" cy="${-sr * 0.4}" rx="${sr * 0.18}" ry="${sr * 0.1}" fill="#fff" opacity="0.35"/></g>`;
      }
      if (br > 0 && br < 1) { const r = rng(4); for (let i = 0; i < 6; i++) g += `<circle cx="${f((r() - 0.5) * sr * 3 * br)}" cy="${f(d * 0.15 - r() * sr * 2 * br)}" r="${f(2 + r() * 3)}" fill="#a5161c"/>`; }
    }
    return `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)})">${g}</g>`;
  };

  // battle axe, haft along +y from the grip at (0,0); blood amount 0..1
  P.axe = (x, y, s, rot, blood = 1) => {
    const id = uid('ax');
    let g = `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5a6068"/><stop offset="0.45" stop-color="#c8ced4"/><stop offset="0.7" stop-color="#8a9098"/><stop offset="1" stop-color="#3e444a"/></linearGradient></defs>`;
    g += `<rect x="-11" y="-430" width="22" height="560" rx="9" fill="#5a3a22" ${ol()}/><rect x="-6" y="-430" width="6" height="560" fill="#8a6440" opacity="0.6"/>`;
    for (const yy of [-40, 10, 60]) g += `<rect x="-13" y="${yy}" width="26" height="14" rx="4" fill="#3a2414" ${ol(1)}/>`;
    g += `<path d="M10,-430 C120,-470 190,-420 210,-330 C215,-290 200,-240 190,-210 C150,-250 90,-300 10,-300Z" fill="url(#${id})" ${ol()}/>`;
    g += `<path d="M200,-330 C206,-290 196,-250 190,-214" stroke="#eef2f6" stroke-width="5" fill="none" opacity="0.9"/>`;
    g += `<path d="M-10,-420 C-60,-430 -80,-400 -70,-370 C-50,-380 -30,-370 -10,-330Z" fill="url(#${id})" ${ol()}/>`;
    if (blood > 0) {
      g += `<g opacity="${blood}"><path d="M196,-300 C170,-290 160,-260 175,-240 C185,-250 190,-232 186,-214 C196,-232 204,-268 196,-300Z" fill="#7a0c0c"/>` +
        `<path d="M150,-268 c-6,10 -2,28 4,34 c4,-8 8,-22 -4,-34Z M120,-286 c-4,8 -2,20 2,26 c4,-6 6,-16 -2,-26Z" fill="#8a1010"/><path d="M178,-262 c4,-6 10,-6 12,0" stroke="#ff6a6a" stroke-width="2" fill="none" opacity="0.6"/></g>`;
    }
    return `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)}) scale(${s})">${g}</g>`;
  };

  // leather coin purse, cinched top
  P.purse = (x, y, s, rot = 0, col = '#6a4426') =>
    `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)}) scale(${s})"><path d="M-46,-10 C-70,20 -64,78 0,84 C64,78 70,20 46,-10 C30,-2 -30,-2 -46,-10Z" fill="${col}" ${ol()}/>` +
    `<path d="M-34,-14 Q0,-30 34,-14 L22,-34 Q0,-44 -22,-34Z" fill="${shade(col, 0.1)}" ${ol()}/><path d="M-40,-10 Q0,4 40,-10" stroke="#c9a040" stroke-width="6" fill="none"/>` +
    `<path d="M-30,20 C-36,40 -28,62 -10,70" stroke="#fff" stroke-width="5" opacity="0.15" fill="none"/><circle cx="18" cy="-38" r="6" fill="#e8c860" ${ol(1)}/></g>`;

  P.coin = (x, y, r, t = 0) => { const sx = Math.abs(Math.cos(t)) * 0.9 + 0.1; return `<g transform="translate(${f(x)},${f(y)}) scale(${fs(sx)},1)"><circle r="${r}" fill="#e2b84a" ${ol(1.2)}/><circle r="${r * 0.72}" fill="none" stroke="#a8801e" stroke-width="2"/><circle cx="${-r * 0.3}" cy="${-r * 0.3}" r="${r * 0.25}" fill="#fff6c0" opacity="0.7"/></g>`; };

  P.quill = (x, y, s, rot) => `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)}) scale(${s})"><path d="M0,0 C10,-60 40,-170 30,-260 C60,-200 50,-90 4,-6Z" fill="#efe8da" ${ol()}/><path d="M2,-4 C20,-80 34,-180 30,-256" stroke="#b8ae9a" stroke-width="2" fill="none"/>` +
    [-40, -80, -120, -160, -200].map((yy, i) => `<path d="M${10 + i * 3},${yy} l18,-12" stroke="#c8beac" stroke-width="1.5"/>`).join('') + `<path d="M0,0 L-4,24" stroke="#1a1410" stroke-width="5" stroke-linecap="round"/></g>`;

  P.candle = (x, y, h, t, s = 1) => {
    const fl = 1 + Math.sin(t * 17) * 0.08 + Math.sin(t * 29) * 0.05, lean = Math.sin(t * 7) * 3;
    return `<g transform="translate(${f(x)},${f(y)}) scale(${s})"><rect x="-14" y="${-h}" width="28" height="${h}" rx="4" fill="#e8dcc0" ${ol()}/><rect x="-14" y="${-h}" width="9" height="${h}" fill="#fff" opacity="0.25"/>` +
      `<path d="M-14,${-h + 6} q6,14 2,26 q-4,-6 -2,-26Z" fill="#efe4c8"/><ellipse cx="0" cy="${-h + 2}" rx="18" ry="20" fill="#2a1a10" opacity="0"/>` +
      `<g transform="translate(${f(lean * 0.3)},${-h - 2}) scale(1,${f(fl)})"><path d="M0,0 C-9,-10 -6,-26 ${f(lean)},-42 C6,-26 9,-10 0,0Z" fill="#ffb84a"/><path d="M0,-2 C-4,-8 -3,-18 ${f(lean * 0.6)},-28 C3,-18 4,-8 0,-2Z" fill="#fff4c0"/></g>` +
      `<rect x="-26" y="-6" width="52" height="10" rx="5" fill="#6a5a44" ${ol(1)}/></g>`;
  };

  // flickering torch on a wall bracket
  P.torch = (x, y, s, t, seed = 0) => {
    const r = rng(seed + 1); let fl = '';
    const k = 1 + Math.sin(t * 13 + seed) * 0.1 + Math.sin(t * 23 + seed * 2) * 0.06;
    for (const [c, sc] of [['#c8401a', 1], ['#f07a26', 0.75], ['#ffc24a', 0.5], ['#fff2b0', 0.28]]) fl += `<path d="M-20,0 C-24,-30 ${f(-6 + Math.sin(t * 9 + seed) * 6)},-60 ${f(Math.sin(t * 11 + seed) * 8)},-95 C10,-60 24,-30 20,0Z" fill="${c}" transform="scale(${fs(sc)},${fs(sc * k)})"/>`;
    return `<g transform="translate(${f(x)},${f(y)}) scale(${s})"><path d="M-30,60 L30,60 L16,90 L-16,90Z" fill="#2a2420"/><rect x="-10" y="0" width="20" height="70" fill="#4a3220" ${ol(1)}/><path d="M-18,0 L18,0 L14,14 L-14,14Z" fill="#3a2a1c" ${ol(1)}/><g filter="url(#b1)">${fl}</g></g>`;
  };

  // coffin standing up, front view
  P.coffin = (x, y, s, col = '#5a3c24') => {
    const id = uid('cf');
    return `<g transform="translate(${f(x)},${f(y)}) scale(${s})"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${shade(col, -0.3)}"/><stop offset="0.4" stop-color="${shade(col, 0.1)}"/><stop offset="1" stop-color="${shade(col, -0.35)}"/></linearGradient></defs>` +
      `<path d="M-60,-520 L60,-520 L100,-360 L70,0 L-70,0 L-100,-360Z" fill="url(#${id})" ${ol()} filter="url(#woodV)"/><path d="M-50,-500 L50,-500 L84,-360 L58,-20 L-58,-20 L-84,-360Z" fill="none" stroke="${shade(col, -0.4)}" stroke-width="4"/>` +
      `<path d="M0,-440 L0,-300 M-34,-400 L34,-400" stroke="${shade(col, -0.5)}" stroke-width="10" stroke-linecap="round"/><path d="M-94,-370 L-64,-10" stroke="#fff" stroke-width="3" opacity="0.12"/></g>`;
  };

  P.dagger = () => '';
  G.PROPS = P;
})(window);
