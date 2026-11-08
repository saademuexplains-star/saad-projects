// Props for "The Stoker" (Titanic). Hand-held props use the RIG grip frame (+x = thumb side, +y = fingers);
// two-handed or pivoting props (shovel, lever, gate) are drawn in world space and the hands are derived from them.
(function (G) {
  const { f, shade, mix, rng, uid, OUT, ol } = G.RIG, C = G.CINE;
  const P = G.PROPS;
  const LG = (id, stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a !== undefined ? ` stop-opacity="${a}"` : ''}/>`).join('')}</linearGradient>`;

  // ---------------- coal
  P.coalLumps = (x, y, w, h, n, seed, op = 1) => {
    const r = rng(seed); let g = '';
    for (let i = 0; i < n; i++) {
      const u = r(), v = r(), px = x + (u - 0.5) * w * (1 - v * 0.6), py = y - v * h * Math.sin(Math.PI * (0.15 + u * 0.7)), rr = 6 + r() * 14, k = r();
      g += `<path d="M${f(px - rr)},${f(py)} L${f(px - rr * 0.4)},${f(py - rr * 0.9)} L${f(px + rr * 0.7)},${f(py - rr * 0.7)} L${f(px + rr)},${f(py + rr * 0.2)} L${f(px + rr * 0.1)},${f(py + rr * 0.8)}Z" fill="${mix('#0c0c0e', '#2a2a30', k)}" stroke="#050506" stroke-width="1.2"/>`;
      if (k > 0.6) g += `<path d="M${f(px - rr * 0.3)},${f(py - rr * 0.6)} l${f(rr * 0.6)},${f(rr * 0.1)}" stroke="#9aa0b0" stroke-width="1.6" opacity="${f(0.5 * op)}"/>`;
    }
    return g;
  };
  // a heap of coal: a low irregular mound (not a ball) covered in lumps, with a few spilled pieces around its foot
  P.coalPile = (x, y, w, h, seed) => {
    const r = rng(seed + 100); let d = `M${f(x - w * 0.62)},${f(y)}`;
    for (let i = 1; i < 12; i++) { const u = i / 12, px = x - w * 0.62 + u * w * 1.24, py = y - h * Math.pow(Math.sin(Math.PI * u), 0.9) * (0.85 + r() * 0.25); d += ` L${f(px)},${f(py)}`; }
    d += ` L${f(x + w * 0.62)},${f(y)}Z`;
    return `<ellipse cx="${f(x)}" cy="${f(y + 4)}" rx="${f(w * 0.7)}" ry="18" fill="#000" opacity="0.45" filter="url(#b8)"/><path d="${d}" fill="#121214"/>` + P.coalLumps(x, y, w * 1.1, h * 0.95, Math.round(w / 6), seed) + P.coalLumps(x, y + 6, w * 1.5, 14, 12, seed + 7);
  };

  // ---------------- the coal shovel in world space: grip end (x,y), shaft along angle ang (deg), shaft length len.
  // returns { svg, at(u) world point along the shaft (0 = grip end, 1 = blade neck), dir }
  P.shovel = (x, y, ang, len, o = {}) => {
    const a = ang * Math.PI / 180, d = [Math.cos(a), Math.sin(a)], n = [-d[1], d[0]], w = o.w || 14, at = u => [x + d[0] * len * u, y + d[1] * len * u];
    const nk = at(1), bl = o.blade || 110, bw = o.bladeW || 92, bt = [nk[0] + d[0] * bl, nk[1] + d[1] * bl];
    const q = (p, s, k) => `${f(p[0] + n[0] * s + d[0] * k)},${f(p[1] + n[1] * s + d[1] * k)}`;
    let g = `<path d="M${q([x, y], -w / 2, -8)} L${q(nk, -w / 2, 0)} L${q(nk, w / 2, 0)} L${q([x, y], w / 2, -8)}Z" fill="#6a4426" ${ol(1.4)}/><path d="M${q([x, y], -w * 0.15, -4)} L${q(nk, -w * 0.15, 0)}" stroke="#a87a4a" stroke-width="${f(w * 0.25)}" opacity="0.5"/>`;
    g += `<path d="M${q([x, y], -w * 0.9, -26)} L${q([x, y], w * 0.9, -26)} L${q([x, y], w * 0.6, 4)} L${q([x, y], -w * 0.6, 4)}Z" fill="#3a2a1a" ${ol(1.2)}/>`;   // D-grip cap
    g += `<path d="M${q(nk, -w * 0.7, -6)} L${q(bt, -bw / 2, 0)} Q${q(bt, 0, 10)} ${q(bt, bw / 2, 0)} L${q(nk, w * 0.7, -6)}Z" fill="#5a5c62" ${ol(1.6)}/>`;
    g += `<path d="M${q(nk, -w * 0.3, 8)} L${q(bt, -bw * 0.32, -8)}" stroke="#b8bcc4" stroke-width="3" opacity="0.5"/>`;
    if (o.coal > 0) g += P.coalLumps((nk[0] + bt[0]) / 2, (nk[1] + bt[1]) / 2 + 6, bw * 0.8, 26 * o.coal, Math.round(10 * o.coal), o.seed || 5);
    return { svg: g, at, dir: d, tip: bt };
  };

  // ---------------- a furnace mouth in a boiler front: (x,y) = centre of the opening, s scale, t time
  // o.heat 0..1 fire strength, o.steam 0..1 steam bursting out, o.doorOpen 0..1
  P.furnace = (x, y, s, t, o = {}) => {
    const id = uid('fu'), heat = o.heat ?? 1, r = rng(o.seed || 3);
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><defs><radialGradient id="${id}"><stop offset="0" stop-color="#fff2b0"/><stop offset="0.35" stop-color="#ffb030"/><stop offset="0.75" stop-color="#d0400c"/><stop offset="1" stop-color="#3a0a04"/></radialGradient></defs>`;
    g += `<rect x="-120" y="-110" width="240" height="210" rx="18" fill="#26201c" ${ol(2)}/>`;   // cast-iron surround
    for (const [px, py] of [[-100, -90], [100, -90], [-100, 80], [100, 80]]) g += `<circle cx="${px}" cy="${py}" r="7" fill="#3a3430" ${ol(1)}/>`;
    g += `<path d="M-82,70 L-82,-30 A82,70 0 0 1 82,-30 L82,70Z" fill="#120806"/>`;
    g += `<path d="M-76,66 L-76,-28 A76,64 0 0 1 76,-28 L76,66Z" fill="url(#${id})" opacity="${f(heat)}"/>`;
    // flames licking up inside the mouth
    for (let i = 0; i < 7; i++) { const fx = -60 + i * 20 + Math.sin(t * 7 + i) * 6, h = (50 + Math.sin(t * 11 + i * 1.7) * 16) * heat; g += `<path d="M${f(fx - 14)},66 Q${f(fx - 10)},${f(66 - h * 0.6)} ${f(fx + Math.sin(t * 9 + i) * 8)},${f(66 - h)} Q${f(fx + 10)},${f(66 - h * 0.5)} ${f(fx + 14)},66Z" fill="${['#ffd060', '#ff9030', '#ffe8a0'][i % 3]}" opacity="${f(0.85 * heat)}"/>`; }
    g += P.coalLumps(0, 70, 150, 26, 12, 9, heat);
    // the hinged door, swung open to the left
    const dop = o.doorOpen ?? 1;
    g += `<path d="M-120,-100 L${f(-120 - 70 * dop)},-80 L${f(-120 - 70 * dop)},90 L-120,100Z" fill="#1e1814" ${ol(1.6)}/>`;
    g += `</g>`;
    if (heat > 0.05) g += C.radial(x, y + 20 * s, 380 * s, '#ff8a30', 0.38 * heat * (0.9 + 0.1 * Math.sin(t * 13)));
    // steam blasting out when cold water reaches it
    if (o.steam > 0.01) for (let i = 0; i < 9; i++) { const ph = ((t * 1.1 + i / 9) % 1), sx = x + (r() - 0.5) * 120 * s, sy = y - ph * 520 * s * (0.6 + r() * 0.6); g += `<ellipse cx="${f(sx + Math.sin(t * 2 + i) * 30 * s)}" cy="${f(sy)}" rx="${f((60 + ph * 160) * s)}" ry="${f((50 + ph * 130) * s)}" fill="#e8e6e2" opacity="${f(0.55 * o.steam * Math.sin(Math.PI * ph))}" filter="url(#b14)"/>`; }
    return g;
  };

  // ---------------- alarm bell with a red lamp: (x,y) = mount point on the wall
  P.alarm = (x, y, s, t, ring = 0, lamp = 0) => {
    const sh = ring * Math.sin(t * 60) * 3;
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">`;
    g += `<rect x="-14" y="-10" width="28" height="40" fill="#2a2420" ${ol(1.4)}/>`;
    g += `<g transform="translate(${f(sh)},0)"><path d="M-62,90 Q-62,24 0,20 Q62,24 62,90Z" fill="#b8902e" ${ol(1.6)}/><path d="M-44,80 Q-40,40 -6,34" stroke="#f0d888" stroke-width="7" fill="none" opacity="0.6"/><rect x="-66" y="88" width="132" height="10" rx="5" fill="#8a6a1e" ${ol(1.2)}/></g>`;
    g += `<rect x="90" y="10" width="70" height="80" rx="10" fill="#1a1412" ${ol(1.4)}/><circle cx="125" cy="50" r="27" fill="${mix('#3a0806', '#ff2a10', lamp)}" ${ol(1.2)}/><circle cx="117" cy="42" r="8" fill="#fff" opacity="${f(0.2 + 0.4 * lamp)}"/>`;
    g += `</g>`;
    if (lamp > 0.02) g += C.radial(x + 125 * s, y + 50 * s, 520 * s, '#ff2010', 0.55 * lamp);
    return g;
  };

  // ---------------- the watertight-door switch on the bridge: pivot (x,y), lever angle ang (deg, 0 = pointing right)
  P.leverPanel = (x, y, s, ang, t, o = {}) => {
    const a = ang * Math.PI / 180, L = 150 * s, knob = [x + Math.cos(a) * L, y + Math.sin(a) * L];
    let g = `<rect x="${f(x - 120 * s)}" y="${f(y - 260 * s)}" width="${f(240 * s)}" height="${f(420 * s)}" rx="${f(10 * s)}" fill="#3a2a1c" filter="url(#woodV)" ${ol(1.8)}/>`;
    g += `<rect x="${f(x - 96 * s)}" y="${f(y - 236 * s)}" width="${f(192 * s)}" height="${f(110 * s)}" fill="#1a1612" ${ol(1.2)}/>`;
    for (let i = 0; i < 4; i++) { const lx = x + (-66 + i * 44) * s, ly = y - 181 * s, on = (o.lamps ?? 0) > i / 4; g += `<circle cx="${f(lx)}" cy="${f(ly)}" r="${f(13 * s)}" fill="${on ? '#ff3018' : '#4a0e08'}" ${ol(1)}/>` + (on ? C.radial(lx, ly, 70 * s, '#ff3018', 0.6) : ''); }
    g += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(40 * s)}" fill="#8a6a2a" ${ol(1.4)}/><circle cx="${f(x)}" cy="${f(y)}" r="${f(16 * s)}" fill="#c8a050" ${ol(1)}/>`;
    g += `<path d="M${f(x)},${f(y)} L${f(knob[0])},${f(knob[1])}" stroke="${OUT}" stroke-width="${f(24 * s)}" stroke-linecap="round"/><path d="M${f(x)},${f(y)} L${f(knob[0])},${f(knob[1])}" stroke="#c8a050" stroke-width="${f(18 * s)}" stroke-linecap="round"/>`;
    g += `<circle cx="${f(knob[0])}" cy="${f(knob[1])}" r="${f(24 * s)}" fill="#2a1a12" ${ol(1.4)}/>`;
    return { svg: g, knob, dir: [Math.cos(a), Math.sin(a)] };
  };

  // ---------------- a watertight door seen face-on: box (x0,y0)-(x1,y1). o.bulge 0..1 bends it toward the camera
  P.wtDoor = (x0, y0, x1, y1, o = {}) => {
    const id = uid('wd'), w = x1 - x0, h = y1 - y0, b = o.bulge || 0, cx = (x0 + x1) / 2, cy = y0 + h * 0.62;
    let g = `<defs>${LG(id, [[0, '#4a4c50'], [0.5, '#5e6064'], [1, '#3a3c40']], 0, 0, 1, 0)}<clipPath id="${id}c"><rect x="${f(x0)}" y="${f(y0)}" width="${f(w)}" height="${f(h)}"/></clipPath></defs>`;
    g += `<rect x="${f(x0)}" y="${f(y0)}" width="${f(w)}" height="${f(h)}" fill="url(#${id})" filter="url(#tex)" ${ol(2.2)}/>`;
    let inner = '';
    for (let yy = y0 + 120; yy < y1; yy += 240) inner += `<rect x="${f(x0)}" y="${f(yy)}" width="${f(w)}" height="12" fill="#2a2c30" opacity="0.7"/>`;
    for (let yy = y0 + 40; yy < y1; yy += 60) for (const xx of [x0 + 26, x1 - 26]) inner += `<circle cx="${f(xx)}" cy="${f(yy)}" r="7" fill="#6a6c70" stroke="#1a1a1c" stroke-width="1.2"/>`;
    // the bulge: a big rounded dent pushed toward us, lit from above, with popped rivets and stress cracks
    if (b > 0.01) {
      // a dent pushed toward us: dark falloff all round it, a hard specular crescent along its upper rim (no glow in the middle)
      inner += C.radial(cx, cy, w * 0.6, '#000000', 0.6 * b, 'multiply') + `<path d="M${f(cx - w * 0.34)},${f(cy - h * 0.06)} A${f(w * 0.36)},${f(h * 0.22)} 0 0 1 ${f(cx + w * 0.34)},${f(cy - h * 0.06)}" stroke="#c8ccd4" stroke-width="${f(6 + 8 * b)}" fill="none" opacity="${f(0.45 * b)}"/>` +
        `<path d="M${f(cx - w * 0.3)},${f(cy + h * 0.14)} A${f(w * 0.34)},${f(h * 0.18)} 0 0 0 ${f(cx + w * 0.3)},${f(cy + h * 0.14)}" stroke="#08080a" stroke-width="${f(10 + 10 * b)}" fill="none" opacity="${f(0.5 * b)}"/>`;
      for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + 0.4; inner += `<path d="M${f(cx + Math.cos(a) * w * 0.12)},${f(cy + Math.sin(a) * h * 0.08)} l${f(Math.cos(a) * w * 0.3 * b)},${f(Math.sin(a) * h * 0.2 * b)}" stroke="#141416" stroke-width="${f(3 + 3 * b)}" opacity="${f(0.8 * b)}"/>`; }
    }
    g += `<g clip-path="url(#${id}c)">${inner}</g>`;
    // the door's edges bow out with the bulge
    if (b > 0.01) g += `<path d="M${f(x0)},${f(y0)} Q${f(cx)},${f(y0 - 40 * b)} ${f(x1)},${f(y0)} M${f(x0)},${f(y1)} Q${f(cx)},${f(y1 + 30 * b)} ${f(x1)},${f(y1)}" stroke="#2a2c30" stroke-width="10" fill="none"/>`;
    return g;
  };

  // ---------------- a leather work boot over legClose's foot (leg-local units: ankle (0,0), toes +x, sole y ~150)
  // o.crush 0..1 flattens it under a door edge; o.empty: the foot is gone (dark opening at the top)
  P.boot = (o = {}) => {
    const k = 1 - 0.7 * (o.crush || 0), id = uid('bt'), sy = y => 150 - (150 - y) * k;
    const d = `M-170,${f(sy(-330))} L60,${f(sy(-330))} C66,${f(sy(-200))} 70,${f(sy(-60))} 120,${f(sy(10))} C220,${f(sy(40))} 330,${f(sy(70))} 340,${f(sy(120))} L340,160 L-170,160 C-176,${f(sy(0))} -180,${f(sy(-200))} -170,${f(sy(-330))}Z`;
    let g = `<defs>${LG(id, [[0, '#2a1608'], [0.4, '#5a3418'], [1, '#2a1608']], 0, 0, 1, 0)}</defs><path d="${d}" fill="url(#${id})" ${ol(2.2)}/>`;
    g += `<rect x="-180" y="148" width="530" height="26" rx="8" fill="#140a04" ${ol(1.6)}/>`;
    for (let i = 0; i < 5; i++) g += `<path d="M${-40 + i * 16},${f(sy(-300 + i * 50))} l46,8" stroke="#c8a878" stroke-width="5" opacity="0.8"/>`;   // laces
    g += `<path d="M-150,${f(sy(-300))} C-150,${f(sy(-150))} -140,${f(sy(-40))} -120,${f(sy(60))}" stroke="#8a5a30" stroke-width="10" fill="none" opacity="0.45"/>`;
    if (o.empty) g += `<ellipse cx="-55" cy="${f(sy(-330))}" rx="115" ry="${f(26 * k)}" fill="#0a0604" ${ol(1.6)}/>`;
    return g;
  };
  // dark wool trouser leg over a legClose shin (leg-local), from the knee region down to the boot top
  P.trouserLeg = (col = '#4a443e', y1 = -300) => `<path d="M-190,-1900 L110,-1900 C100,-1300 86,-700 78,${y1} L-182,${y1} C-178,-700 -184,-1300 -190,-1900Z" fill="${col}" filter="url(#cloth)" ${ol(2)}/>` +
    [-120, -40, 30].map((x, i) => `<path d="M${x},-1800 C${x + 10},-1300 ${x - 6},-800 ${x + 4},${y1 + 20}" stroke="${shade(col, -0.45)}" stroke-width="16" fill="none" opacity="0.4" filter="url(#b4)"/>`).join('');

  // ---------------- a revolver in the grip frame: handle across the fist, barrel along the fingers (+y) on the thumb side
  P.revolver = () => `<rect x="-36" y="-16" width="68" height="32" rx="10" fill="#4a2c18" ${ol(1.2)}/>` +
    `<path d="M26,-30 L60,-30 L60,52 L26,52Z" fill="#2a2c30" ${ol(1.2)}/><circle cx="44" cy="36" r="20" fill="#3a3c42" ${ol(1.2)}/>` +
    `<rect x="35" y="40" width="18" height="150" rx="4" fill="#26282c" ${ol(1.2)}/><rect x="38" y="186" width="12" height="8" fill="#16181a"/><path d="M40,50 L40,180" stroke="#8a8e96" stroke-width="3" opacity="0.6"/>`;
  P.REVOLVER_MUZZLE = [44, 194];
  // muzzle flash and smoke at (x,y) along angle ang (deg), k 0..1 (short-lived)
  P.muzzle = (x, y, ang, k, smoke = 0) => {
    let g = '';
    if (k > 0.01) { const a = ang * Math.PI / 180, L = 70 * k; g += `<g transform="translate(${f(x)},${f(y)}) rotate(${f(ang)})"><path d="M0,-14 L${f(L)},0 L0,14 L${f(L * 0.4)},0Z" fill="#fff4c0" opacity="${f(k)}"/><path d="M0,-8 L${f(L * 0.6)},0 L0,8Z" fill="#ffffff" opacity="${f(k)}"/></g>` + C.radial(x + Math.cos(a) * 20, y + Math.sin(a) * 20, 160, '#ffd890', 0.6 * k); }
    if (smoke > 0.01) for (let i = 0; i < 5; i++) g += `<ellipse cx="${f(x + i * 8 * smoke)}" cy="${f(y - 20 - smoke * 90 * (0.4 + i * 0.25))}" rx="${f(16 + smoke * 40)}" ry="${f(12 + smoke * 30)}" fill="#c8c8cc" opacity="${f(0.4 * (1 - smoke) * (1 - i * 0.15))}" filter="url(#b8)"/>`;
    return g;
  };

  // ---------------- sliding iron lattice gate: fixed post at xFix, leading edge at xEdge, rails yTop..yBot
  P.gate = (xFix, xEdge, yTop, yBot, o = {}) => {
    const x0 = Math.min(xFix, xEdge), x1 = Math.max(xFix, xEdge), w = x1 - x0, n = Math.max(2, Math.round(w / 70));
    let g = `<rect x="${f(x0)}" y="${f(yTop)}" width="${f(w)}" height="14" fill="#1e2024" ${ol(1.2)}/><rect x="${f(x0)}" y="${f(yBot - 14)}" width="${f(w)}" height="14" fill="#1e2024" ${ol(1.2)}/>`;
    for (let i = 0; i <= n; i++) { const x = x0 + i * w / n; g += `<rect x="${f(x - 6)}" y="${f(yTop)}" width="12" height="${f(yBot - yTop)}" fill="#26282e" ${ol(1)}/><path d="M${f(x - 2)},${f(yTop + 10)} L${f(x - 2)},${f(yBot - 10)}" stroke="#7a7e88" stroke-width="2" opacity="0.5"/>`; }
    for (let i = 0; i < n; i++) { const xa = x0 + i * w / n, xb = x0 + (i + 1) * w / n, ym = (yTop + yBot) / 2; g += `<path d="M${f(xa)},${f(yTop + 14)} L${f(xb)},${f(ym)} L${f(xa)},${f(yBot - 14)} M${f(xb)},${f(yTop + 14)} L${f(xa)},${f(ym)} L${f(xb)},${f(yBot - 14)}" stroke="#2a2c32" stroke-width="7" fill="none"/>`; }
    g += `<rect x="${f(xFix - 14)}" y="${f(yTop - 40)}" width="28" height="${f(yBot - yTop + 60)}" fill="#141518" ${ol(1.4)}/>`;   // fixed post
    if (o.lock > 0) { const lx = xEdge, ly = (yTop + yBot) / 2; g += `<g transform="translate(${f(lx)},${f(ly)}) scale(${f(o.lock)})"><path d="M-16,0 L-16,-26 A16,16 0 0 1 16,-26 L16,0" stroke="#8a8e96" stroke-width="7" fill="none"/><rect x="-24" y="-4" width="48" height="40" rx="6" fill="#6a5a2a" ${ol(1.4)}/><circle cx="0" cy="14" r="5" fill="#1a1408"/></g>`; }
    return g;
  };

  // ---------------- a wooden lifeboat, side view: (x,y) = keel centre, s scale; o.ropes: davit ropes up to y - o.ropes
  P.lifeboat = (x, y, s, o = {}) => {
    const id = uid('lb');
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><defs>${LG(id, [[0, '#f2f0ea'], [0.6, '#d8d4ca'], [1, '#9a968c']])}</defs>`;
    if (o.ropes) for (const rx of [-300, 300]) g += `<path d="M${rx},-120 L${rx},${-o.ropes}" stroke="#c8b890" stroke-width="5"/>`;
    g += `<path d="M-420,-130 Q-400,10 -200,40 L200,40 Q400,10 420,-130Z" fill="url(#${id})" ${ol(2)}/>`;
    g += `<path d="M-420,-130 L420,-130" stroke="#8a5a30" stroke-width="16"/><path d="M-400,-80 Q0,-60 400,-80" stroke="#b8b0a0" stroke-width="3" fill="none"/><path d="M-330,-10 Q0,10 330,-10" stroke="#b8b0a0" stroke-width="3" fill="none"/>`;
    g += `</g>`;
    return g;
  };

  // ---------------- a caged bulkhead lamp on a wall
  P.cageLamp = (x, y, s, on = 1, col = '#ffd890') => `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><rect x="-22" y="-40" width="44" height="14" fill="#2a2420" ${ol(1)}/><ellipse cx="0" cy="0" rx="26" ry="34" fill="${on > 0.1 ? col : '#3a3428'}" opacity="0.95"/><path d="M-26,0 L26,0 M0,-34 L0,34 M-18,-24 L18,24 M18,-24 L-18,24" stroke="#1a1410" stroke-width="4"/><ellipse cx="0" cy="0" rx="26" ry="34" fill="none" ${ol(2)}/></g>` + (on > 0.1 ? C.radial(x, y, 240 * s, col, 0.4 * on) : '');
})(window);
