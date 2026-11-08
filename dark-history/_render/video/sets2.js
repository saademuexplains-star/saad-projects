// Sets part 2: the warlord's longhall, trophy wall, shadow-play wall, the letter (page / doodle), POV hands.
(function (G) {
  const { shade, mix, rng, f, uid, OUT, NS, ol, hand } = G.RIG, E = G.ENV, C = G.CINE, PR = G.PROPS, S = G.SETS;
  const lg = S.lg;

  // ---------- small hall props ----------
  S.shield = (x, y, r, pat, seed = 1) => {
    const id = uid('sh'), rr = rng(seed), c1 = ['#7a1c16', '#2a3a4a', '#6a5a2a', '#3a2a1e'][seed % 4], c2 = ['#d8c8a0', '#b8a070', '#1a1612', '#8a2a1a'][seed % 4];
    let g = `<defs><clipPath id="${id}"><circle r="${r}"/></clipPath></defs><circle r="${r}" fill="${c1}" filter="url(#tex)"/>`;
    if (pat === 0) g += `<g clip-path="url(#${id})"><rect x="0" y="${-r}" width="${r}" height="${r * 2}" fill="${c2}" filter="url(#tex)"/></g>`;
    if (pat === 1) g += `<g clip-path="url(#${id})">${[0, 1, 2, 3].map(i => `<path d="M0,0 L${f(Math.cos(i * 1.57) * r * 1.5)},${f(Math.sin(i * 1.57) * r * 1.5)} L${f(Math.cos(i * 1.57 + 0.78) * r * 1.5)},${f(Math.sin(i * 1.57 + 0.78) * r * 1.5)}Z" fill="${c2}"/>`).join('')}</g>`;
    if (pat === 2) g += `<path d="M${-r * 0.5},0 C${-r * 0.5},${-r * 0.5} ${r * 0.4},${-r * 0.5} ${r * 0.4},0 C${r * 0.4},${r * 0.35} ${-r * 0.2},${r * 0.35} ${-r * 0.2},0 C${-r * 0.2},${-r * 0.2} ${r * 0.15},${-r * 0.2} ${r * 0.15},0" stroke="${c2}" stroke-width="${r * 0.12}" fill="none"/>`;
    for (let i = 0; i < 8; i++) g += `<path d="M0,0 L${f(Math.cos(i * 0.785) * r)},${f(Math.sin(i * 0.785) * r)}" stroke="#000" stroke-width="2" opacity="0.25"/>`;
    g += `<circle r="${r}" fill="none" stroke="#5a5048" stroke-width="${r * 0.09}"/><circle r="${r * 0.2}" fill="#6a625a" stroke="${OUT}" stroke-width="2"/><circle cx="${-r * 0.06}" cy="${-r * 0.06}" r="${r * 0.08}" fill="#b8b0a8"/>`;
    for (let i = 0; i < 3; i++) { const a = rr() * 6.28; g += `<path d="M${f(Math.cos(a) * r)},${f(Math.sin(a) * r)} l${f(-Math.cos(a) * r * 0.15)},${f(-Math.sin(a) * r * 0.15)}" stroke="#1a120c" stroke-width="${r * 0.08}"/>`; }
    g += `<circle r="${r}" fill="#000" opacity="0.18" transform="translate(${r * 0.15},${r * 0.15})" style="mix-blend-mode:multiply"/>`;
    return `<g transform="translate(${f(x)},${f(y)})">${g}</g>`;
  };
  S.antlers = (x, y, s, col = '#cbbd9e') => {
    let g = '';
    for (const sd of [-1, 1]) {
      g += `<path d="M0,0 C${sd * 40},-30 ${sd * 90},-80 ${sd * 110},-170" stroke="${col}" stroke-width="16" fill="none" stroke-linecap="round"/>`;
      for (const [a, b, c, d] of [[sd * 50, -50, sd * 30, -110], [sd * 85, -110, sd * 60, -170], [sd * 95, -130, sd * 150, -190], [sd * 105, -150, sd * 100, -230]]) g += `<path d="M${a},${b} Q${(a + c) / 2 + sd * 10},${(b + d) / 2} ${c},${d}" stroke="${col}" stroke-width="10" fill="none" stroke-linecap="round"/>`;
    }
    g += `<ellipse cx="0" cy="8" rx="34" ry="24" fill="#5a4a38" stroke="${OUT}" stroke-width="2"/>`;
    return `<g transform="translate(${x},${y}) scale(${s})" filter="url(#tex)">${g}</g>`;
  };
  S.skull = (x, y, s, rot = 0, horns = false) => {
    const id = uid('sk');
    let g = `<defs><radialGradient id="${id}" cx="0.4" cy="0.35" r="0.7"><stop offset="0" stop-color="#efe6d0"/><stop offset="1" stop-color="#9a8a6e"/></radialGradient></defs>`;
    if (horns) g += `<path d="M-40,-30 C-90,-40 -120,-90 -100,-140 C-90,-100 -70,-70 -30,-55Z M40,-30 C90,-40 120,-90 100,-140 C90,-100 70,-70 30,-55Z" fill="#d8ccb0" stroke="${OUT}" stroke-width="2"/>`;
    g += `<path d="M-46,-10 C-50,-60 -20,-78 0,-78 C20,-78 50,-60 46,-10 C44,10 34,18 30,30 L24,52 L-24,52 L-30,30 C-34,18 -44,10 -46,-10Z" fill="url(#${id})" stroke="${OUT}" stroke-width="2"/>`;
    g += `<ellipse cx="-19" cy="-6" rx="13" ry="15" fill="#1a120c"/><ellipse cx="19" cy="-6" rx="13" ry="15" fill="#1a120c"/><path d="M0,14 L-7,28 L7,28Z" fill="#1a120c"/>`;
    g += `<path d="M-20,40 L20,40 M-14,36 L-14,50 M-5,36 L-5,52 M5,36 L5,52 M14,36 L14,50" stroke="#3a2a1a" stroke-width="2.5"/><path d="M-36,-40 Q-20,-62 4,-64" stroke="#fff" stroke-width="4" opacity="0.35" fill="none"/>`;
    return `<g transform="translate(${f(x)},${f(y)}) rotate(${rot}) scale(${s})">${g}</g>`;
  };
  S.embers = (x, y, w, h, t, n, seed) => {
    const r = rng(seed); let g = '';
    for (let i = 0; i < n; i++) {
      const sp = 120 + r() * 160, ph = r(), k = ((t * sp / h + ph) % 1), ex = x + (r() - 0.5) * w + Math.sin(t * 2 + i) * 30 * k, ey = y - k * h;
      g += `<circle cx="${f(ex)}" cy="${f(ey)}" r="${f(1.5 + r() * 2.5)}" fill="${r() > 0.5 ? '#ffb050' : '#ffe08a'}" opacity="${f((1 - k) * 0.9)}"/>`;
    }
    return `<g style="mix-blend-mode:screen">${g}</g>`;
  };
  // flames morph smoothly between shapes (cross-fade of consecutive seeds) instead of snapping
  S.fireMorph = (x, y, s, seed0, n, ph) => { const i = Math.floor(ph), u = ph - i, w = u * u * (3 - 2 * u); return `<g opacity="${f(1 - w)}">${E.fire(x, y, s, seed0 + (i % n))}</g><g opacity="${f(w)}">${E.fire(x, y, s, seed0 + ((i + 1) % n))}</g>`; };
  S.firePit = (x, y, s, t) => {
    let g = `<ellipse cx="${x}" cy="${y}" rx="${260 * s}" ry="${70 * s}" fill="#1a120c"/>`;
    const r = rng(9);
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, sx = x + Math.cos(a) * 250 * s, sy = y + Math.sin(a) * 64 * s; if (Math.sin(a) < -0.2) g += `<ellipse cx="${f(sx)}" cy="${f(sy)}" rx="${f(46 * s)}" ry="${f(30 * s)}" fill="${shade('#6a625a', (r() - 0.5) * 0.3)}" stroke="${OUT}" stroke-width="2" filter="url(#tex)"/>`; }
    g += `<ellipse cx="${x}" cy="${y}" rx="${200 * s}" ry="${44 * s}" fill="#ff7a2a" opacity="0.6" filter="url(#b8)"/>`;
    g += S.fireMorph(x, y, 1.6 * s, 3, 7, t * 9) + S.fireMorph(x - 60 * s, y + 6, 1.1 * s, 11, 5, t * 7.5 + 0.3) + S.fireMorph(x + 70 * s, y + 4, 1.2 * s, 21, 6, t * 8.2 + 0.6);
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, sx = x + Math.cos(a) * 250 * s, sy = y + Math.sin(a) * 64 * s; if (Math.sin(a) >= -0.2) g += `<ellipse cx="${f(sx)}" cy="${f(sy)}" rx="${f(50 * s)}" ry="${f(34 * s)}" fill="${shade('#5a524a', (r() - 0.5) * 0.3)}" stroke="${OUT}" stroke-width="2" filter="url(#tex)"/><ellipse cx="${f(sx)}" cy="${f(sy - 14 * s)}" rx="${f(36 * s)}" ry="${f(14 * s)}" fill="#ff9a50" opacity="0.35"/>`; }
    g += S.embers(x, y - 120 * s, 300 * s, 900 * s, t, 26, 5);
    return g;
  };

  // ------------------------------------------------------------- WARLORD LONGHALL
  // o.throne (default true), o.fire (default true), o.pillars (default true)
  S.hall = (t, o = {}) => {
    const L = [];
    let w = `<rect x="-1500" y="-600" width="4200" height="2500" fill="#3e2c20" filter="url(#woodV)"/>`;
    for (let x = -1500; x < 2700; x += 66) w += `<path d="M${x},-600 L${x},1900" stroke="#1a100a" stroke-width="3" opacity="0.6"/>`;
    for (const y of [160, 1240]) w += `<rect x="-1500" y="${y}" width="4200" height="70" fill="#20140c" filter="url(#woodH)"/><rect x="-1500" y="${y}" width="4200" height="8" fill="#a06a3a" opacity="0.25"/>`;
    for (let x = -1300; x < 2700; x += 560) w += `<rect x="${x}" y="-600" width="90" height="2500" fill="#24170e" filter="url(#woodV)"/><rect x="${x}" y="-600" width="14" height="2500" fill="#c07a40" opacity="0.15"/>`;
    const shields = [[-1050, 520, 0], [-760, 700, 1], [-180, 520, 2], [180, 700, 3], [900, 700, 0], [1260, 520, 1], [1560, 720, 2], [1900, 520, 3]];
    shields.forEach(([x, y, p], i) => { w += S.shield(x, y, 92, p, i + 1); });
    for (const [x, y] of [[-470, 380], [1550, 380]]) w += S.antlers(x, y, 1.2);
    // crossed spears behind shields
    for (const x of [-900, 1400]) w += `<path d="M${x - 160},1150 L${x + 160},300 M${x + 160},1150 L${x - 160},300" stroke="#4a3220" stroke-width="12"/><path d="M${x + 160},300 l-14,-60 l30,10Z M${x - 160},300 l14,-60 l-30,10Z" fill="#8a9098" stroke="${OUT}" stroke-width="2"/>`;
    w += S.banner(540, 240, 380, 820, '#5c1712', t, 0.6, 'raven', '#bfb08e');
    // hanging smoke haze and cool shadows away from the fire
    w += `<rect x="-1500" y="-600" width="4200" height="2500" fill="#1c2436" opacity="0.28" style="mix-blend-mode:multiply"/>`;
    w += C.radial(540, 1500, 1500, '#ff8a3a', 0.32);
    L.push({ p: 0.5, svg: `<g filter="url(#dof2)">${w}</g>` });

    if (o.door) {
      // open doorway in the far wall, daylight pouring in
      const [dx0, dw] = o.door;
      L.push({ p: 0.5, svg: `<rect x="${dx0 - dw / 2}" y="560" width="${dw}" height="1000" fill="#fff6e6"/>` + C.bloom(dx0, 1000, 420, '#fff2dc', 0.8) + C.rays(dx0, 1000, [[150, 1], [165, 0.8], [30, 1], [15, 0.8], [90, 1.4]], 1400, 90, '#fff0d8', 0.35) + `<rect x="${dx0 - dw / 2 - 30}" y="530" width="${dw + 60}" height="40" fill="#20140c"/>`, light: true });
    }

    let fl = lg('hf', [[0, '#3a2a1e'], [0.4, '#4e3a28'], [1, '#1a120c']]) + `<rect x="-1500" y="1540" width="4200" height="1400" fill="url(#hf)" filter="url(#ground)"/>`;
    fl += E.straw(-1400, 2600, 1560, 2500, 260, 7, '#7a6440');
    fl += `<path d="M300,1560 L780,1560 L1100,2600 L-20,2600Z" fill="#6a4a30" opacity="0.4" filter="url(#tex)"/>`;
    L.push({ p: 1, svg: fl });
    if (o.fire !== false) L.push({ p: 1, svg: S.firePit(540, 1900, 1, t) + C.radial(540, 1800, 900, '#ff8a3a', 0.35), id: 'fire' });
    if (o.pillars !== false) {
      let pl = '';
      for (const x of [-420, 1500]) {
        pl += lg('hp' + x, [[0, '#1a100a'], [0.45, '#5a3c26'], [1, '#140c06']], 0, 0, 1, 0) + `<rect x="${x - 90}" y="-600" width="180" height="3200" fill="url(#hp${x})" filter="url(#woodV)"/>`;
        for (let y = 200; y < 2400; y += 260) pl += `<path d="M${x - 90},${y} Q${x},${y + 60} ${x + 90},${y} M${x - 90},${y + 30} Q${x},${y + 90} ${x + 90},${y + 30}" stroke="#120a06" stroke-width="5" fill="none"/>`;
        pl += S.skull(x, 760, 1.1, 0, true) + PR.torch(x + (x < 540 ? 130 : -130), 980, 1.5, t, x) + C.bloom(x + (x < 540 ? 130 : -130), 900, 220, '#ff9040', 0.55);
      }
      L.push({ p: 1.18, svg: `<g filter="url(#dof2)">${pl}</g>` });
    }
    return L;
  };
  // big carved throne; (x,y) = floor centre
  S.warThroneBack = (x, y, s, h = 1000) => {
    let g = lg('wt', [[0, '#1e130b'], [0.3, '#5a3a22'], [0.55, '#6e4a2c'], [1, '#1a100a']], 0, 0, 1, 0);
    g += `<path d="M${x - 300 * s},${y} L${x - 300 * s},${y - h * s} Q${x},${y - (h + 180) * s} ${x + 300 * s},${y - h * s} L${x + 300 * s},${y}Z" fill="url(#wt)" stroke="${OUT}" stroke-width="3" filter="url(#woodV)"/>`;
    for (let i = 0; i < 5 + Math.floor((h - 1000) / 110); i++) g += `<path d="M${x - 240 * s},${y - (h - 100 - i * 110) * s} Q${x},${y - (h - 20 - i * 110) * s} ${x + 240 * s},${y - (h - 100 - i * 110) * s}" stroke="#140c06" stroke-width="6" fill="none" opacity="0.7"/>`;
    // wolf pelt over the back
    g += `<path d="M${x - 260 * s},${y - (h + 20) * s} Q${x},${y - (h + 110) * s} ${x + 260 * s},${y - (h + 20) * s} L${x + 280 * s},${y - 560 * s} L${x + 230 * s},${y - 600 * s} L${x + 200 * s},${y - 540 * s} L${x - 200 * s},${y - 540 * s} L${x - 230 * s},${y - 600 * s} L${x - 280 * s},${y - 560 * s}Z" fill="#6a625a" stroke="${OUT}" stroke-width="2" filter="url(#cloth)"/>`;
    const r = rng(3); for (let i = 0; i < 70; i++) { const px = x + (r() - 0.5) * 500 * s, py = y - (580 + r() * (h - 560)) * s; g += `<path d="M${f(px)},${f(py)} l${f((r() - 0.5) * 8)},${f(18 * s)}" stroke="${r() > 0.5 ? '#8e867c' : '#3e3832'}" stroke-width="2" opacity="0.7"/>`; }
    for (const sx of [-1, 1]) g += `<rect x="${x + sx * 330 * s - 40 * s}" y="${y - (h + 150) * s}" width="${80 * s}" height="${(h + 150) * s}" rx="${12 * s}" fill="url(#wt)" stroke="${OUT}" stroke-width="3" filter="url(#woodV)"/>` + S.skull(x + sx * 330 * s, y - (h + 200) * s, 0.9 * s, 0, true);
    g += S.antlers(x, y - (h + 120) * s, 1.5 * s);
    return g;
  };
  // armrests, lap fur and seat front: drawn IN FRONT of the seated warlord
  S.warThroneFront = (x, y, s, t = 0) => {
    let g = lg('wtf', [[0, '#2a1a0e'], [0.4, '#6a4428'], [1, '#1a100a']], 0, 0, 1, 0);
    for (const sx of [-1, 1]) g += `<path d="M${x + sx * 380 * s},${y - 560 * s} L${x + sx * 250 * s},${y - 560 * s} L${x + sx * 250 * s},${y} L${x + sx * 380 * s},${y}Z" fill="url(#wtf)" stroke="${OUT}" stroke-width="3" filter="url(#woodV)"/><ellipse cx="${x + sx * 315 * s}" cy="${y - 560 * s}" rx="${80 * s}" ry="${26 * s}" fill="#4a2e1a" stroke="${OUT}" stroke-width="3"/>`;
    // bear pelt over the lap, falling to the floor
    const wv = Math.sin(t * 1.3) * 4;
    g += `<path d="M${x - 260 * s},${y - 470 * s} Q${x},${y - 520 * s} ${x + 260 * s},${y - 470 * s} L${x + 280 * s + wv},${y - 30 * s} L${x + 200 * s},${y + 10 * s} L${x + 120 * s},${y - 20 * s} L${x},${y + 14 * s} L${x - 120 * s},${y - 20 * s} L${x - 200 * s},${y + 10 * s} L${x - 280 * s - wv},${y - 30 * s}Z" fill="#4a3a2e" stroke="${OUT}" stroke-width="2.5" filter="url(#cloth)"/>`;
    const r = rng(8); for (let i = 0; i < 80; i++) { const px = x + (r() - 0.5) * 520 * s, py = y - (20 + r() * 440) * s; g += `<path d="M${f(px)},${f(py)} l${f((r() - 0.5) * 6)},${f(20 * s)}" stroke="${r() > 0.5 ? '#6a5a4a' : '#221a14'}" stroke-width="2" opacity="0.7"/>`; }
    g += `<path d="M${x - 260 * s},${y - 470 * s} Q${x},${y - 520 * s} ${x + 260 * s},${y - 470 * s}" stroke="#000" stroke-width="${30 * s}" opacity="0.25" filter="url(#b8)" fill="none"/>`;
    for (const sx of [-1, 1]) g += `<path d="M${x + sx * 110 * s},${y - 10 * s} q${sx * 20 * s},${30 * s} ${sx * 70 * s},${20 * s} l${sx * -10 * s},${-40 * s}Z" fill="#1e140c" stroke="${OUT}" stroke-width="2"/>`;
    return g;
  };

  // ------------------------------------------------------------- TROPHY WALL (dead messengers)
  S.hungTabard = (x, y, s, seed) => {
    const r = rng(seed), c = '#2b4a8a';
    let tear = ''; for (let i = 0; i <= 8; i++) tear += ` L${f(110 - i * 27.5)},${f(330 + (i % 2 ? 20 + r() * 30 : -r() * 20))}`;
    let g = `<path d="M-110,0 L110,0 L110,330${tear} L-110,330Z" fill="${c}" stroke="${OUT}" stroke-width="2" filter="url(#cloth)"/>`;
    g += `<path d="M-96,10 L96,10 L96,310 L-96,310Z" fill="none" stroke="#bf9a3c" stroke-width="7" opacity="0.8"/>` + S.crownEmblem(0, 110, 1.3, '#bf9a3c');
    g += `<path d="M${-40 + r() * 60},${150 + r() * 60} c${20},${10} ${40},${-10} ${50},${30} c${-10},${30} ${-50},${20} ${-60},${50}Z" fill="#3a0a0a" opacity="0.75" filter="url(#b2)"/>`;
    g += `<path d="M-80,20 L-60,320 M60,20 L80,320" stroke="#000" stroke-width="16" opacity="0.25" filter="url(#b4)"/>`;
    for (const sx of [-1, 1]) g += `<circle cx="${sx * 90}" cy="14" r="10" fill="#4a4440" stroke="${OUT}" stroke-width="2"/>`;
    return `<g transform="translate(${x},${y}) scale(${s}) rotate(${(r() - 0.5) * 6})">${g}</g>`;
  };
  S.trophy = (t, o = {}) => {
    const L = [];
    let w = `<rect x="-800" y="-400" width="3600" height="2600" fill="#3a2a1e" filter="url(#woodV)"/>`;
    for (let x = -800; x < 2800; x += 70) w += `<path d="M${x},-400 L${x},2200" stroke="#140c06" stroke-width="3" opacity="0.6"/>`;
    w += `<rect x="-800" y="1260" width="3600" height="60" fill="#20140c"/>`;
    L.push({ p: 0.85, svg: w });
    let tr = '';
    const xs = [-380, 60, 500, 940, 1380, 1820, 2260];
    xs.forEach((x, i) => {
      tr += `<g transform="translate(${x},${430 + (i % 2) * 40})"><rect x="-6" y="-80" width="12" height="40" fill="#3a3430"/></g>` + `<g transform="translate(${x},${330 + (i % 2) * 40})">${S.helmetHung(0, 0, 1, i)}</g>`;
      tr += S.hungTabard(x, 470 + (i % 2) * 40, 1.15, i + 3);
      tr += S.skull(x - 50, 1235, 0.9, (i % 3 - 1) * 8) + (i % 2 ? S.skull(x + 60, 1240, 0.8, 12) : `<g transform="translate(${x + 70},1230) rotate(-10)">${PR.scroll(0, 0, 150, 36, 0, { broken: 1 })}</g>`);
    });
    // chains
    for (const x of [-160, 720, 1600]) { let ch = ''; for (let y = -200; y < 900; y += 28) ch += `<ellipse cx="${x + Math.sin(t * 1.2 + y * 0.01) * 4}" cy="${y}" rx="9" ry="15" fill="none" stroke="#5a5450" stroke-width="5"/>`; tr += ch + `<path d="M${x - 20},900 q20,40 40,0" stroke="#5a5450" stroke-width="8" fill="none"/>`; }
    tr += `<rect x="-800" y="1240" width="3600" height="30" fill="#4a3220" stroke="${OUT}" stroke-width="2" filter="url(#woodH)"/>`;
    tr += PR.torch(280, 820, 1.4, t, 3) + PR.torch(1160, 820, 1.4, t, 5) + PR.torch(2040, 820, 1.4, t, 7);
    L.push({ p: 1, svg: tr });
    // torch light pools (screen) + darkness (multiply)
    let lt = `<rect x="-800" y="-400" width="3600" height="2600" fill="#1a1e2c" opacity="0.42" style="mix-blend-mode:multiply"/>`;
    for (const x of [280, 1160, 2040]) { const fl = 0.85 + Math.sin(t * 9 + x) * 0.08 + Math.sin(t * 23 + x) * 0.05; lt += C.radial(x, 760, 900, '#ff9a4a', 0.55 * fl) + C.bloom(x, 720, 120, '#ffb060', 0.6 * fl); }
    lt += S.embers(1100, 1600, 2400, 1600, t, 20, 9);
    L.push({ p: 1, svg: lt, light: true });
    let fg = `<rect x="-1000" y="1500" width="4000" height="1000" fill="#120a06"/>` + E.straw(-900, 2700, 1500, 2100, 200, 3, '#5a4a30');
    L.push({ p: 1.3, svg: `<g filter="url(#dof3)">${fg}</g>` });
    return L;
  };
  S.helmetHung = (x, y, s, seed) => `<g transform="translate(${x},${y}) scale(${s}) rotate(${(seed % 3 - 1) * 9})"><path d="M-70,10 Q-70,-80 0,-84 Q70,-80 70,10Z" fill="#7a7e84" stroke="${OUT}" stroke-width="2" filter="url(#tex)"/><path d="M-100,10 L100,10 Q90,26 0,28 Q-90,26 -100,10Z" fill="#6a6e74" stroke="${OUT}" stroke-width="2"/><path d="M-40,-60 Q-10,-76 20,-72" stroke="#fff" stroke-width="5" opacity="0.4" fill="none"/></g>`;

  // ------------------------------------------------------------- SHADOW-PLAY WALL
  // k: 0..1 how far the ladle has tipped; returns layers
  S.shadowWall = (t, k, o = {}) => {
    const L = [];
    let w = `<rect x="-800" y="-400" width="2700" height="2500" fill="#a87a52" filter="url(#plaster)"/>`;
    w += S.stoneWall(-800, -400, 1900, 1600, '#a87a52', 12, 90).replace(/opacity="0\.7"/g, 'opacity="0.3"').replace(/opacity="0\.6"/g, 'opacity="0.25"');
    const fl = 0.9 + Math.sin(t * 11) * 0.06 + Math.sin(t * 27) * 0.04;
    w += `<rect x="-800" y="-400" width="2700" height="2500" fill="#2a1410" opacity="0.55" style="mix-blend-mode:multiply"/>` + C.radial(540, 1600, 1500, '#ff8a3a', 0.6 * fl);
    L.push({ p: 0.9, svg: w });
    // silhouettes (rig figures flattened to shadow), projected larger and skewed by the low fire
    L.push({ p: 0.9, svg: o.shadows || '', id: 'shadows' });
    // the molten silver stream: real light, glowing over the shadow
    let st = '';
    if (k > 0.25) {
      const a = Math.min(1, (k - 0.25) / 0.2), [lx, ly] = o.lip || [560, 900], [mx, my] = o.mouth || [540, 1350];
      const d = `M${lx},${ly} C${lx + 10},${ly + 120} ${mx - 20},${my - 200} ${mx},${f(ly + (my - ly) * a)}`;
      st += `<path d="${d}" stroke="#ffffff" stroke-width="16" fill="none" stroke-linecap="round" opacity="0.95"/><path d="${d}" stroke="#d8e4f0" stroke-width="44" fill="none" opacity="0.5" filter="url(#b8)"/>` + C.bloom(mx, my, 160 * a, '#e8f0ff', 0.7 * a) + C.bloom(lx, ly, 120, '#ffe8c0', 0.5 * a);
      for (let i = 0; i < 10 * a; i++) { const r = rng(i + Math.floor(t * 20)); st += `<circle cx="${f(mx + (r() - 0.5) * 120)}" cy="${f(my - r() * 90)}" r="${f(2 + r() * 4)}" fill="#fff" opacity="0.9"/>`; }
    }
    L.push({ p: 0.9, svg: `<g style="mix-blend-mode:screen">${st}</g>`, light: true });
    let fg = lg('swf', [[0, '#2a1a10'], [1, '#0a0604']]) + `<rect x="-800" y="1700" width="2700" height="900" fill="url(#swf)"/>`;
    fg += S.crucible(880, 1960, 1.2, t) + S.firePit(260, 2120, 0.9, t);
    L.push({ p: 1.25, svg: fg });
    return L;
  };
  S.crucible = (x, y, s, t) => `<g transform="translate(${x},${y}) scale(${s})"><path d="M-120,-150 L120,-150 L100,0 Q0,30 -100,0Z" fill="#2a2420" stroke="${OUT}" stroke-width="3" filter="url(#tex)"/><ellipse cx="0" cy="-150" rx="120" ry="26" fill="#3a322c" stroke="${OUT}" stroke-width="3"/><ellipse cx="0" cy="-148" rx="104" ry="20" fill="#e8eef6"/><ellipse cx="${Math.sin(t * 3) * 20}" cy="-150" rx="60" ry="9" fill="#fff"/>` + C.bloom(0, -160, 160, '#e6eeff', 0.6) + `</g>`;

  // ------------------------------------------------------------- THE LETTER
  // page content in page space (0,0 top-left; PW wide). r = { first, fat, bald, coward, doodle } reveal 0..1
  const PW = 900;
  S.PW = PW;
  // the big insult words: [reveal key, text, baseline y, font size, ink width]
  S.WORDS = [['fat', 'FAT,', 640, 260, 470], ['bald', 'BALD,', 900, 260, 590], ['coward', 'COWARD!', 1150, 230, 780]];
  S.pageContent = (r = {}) => {
    let g = '';
    const ink = '#24160c';
    const clipText = (txt, x, y, size, prog, id, o = {}) => {
      if (prog <= 0) return '';
      const w = o.w || 820, x0 = o.anchor === 'middle' ? x - w / 2 : x;
      return `<defs><clipPath id="${id}"><rect x="${x0 - 20}" y="${y - size}" width="${f((w + 40) * Math.min(1, prog))}" height="${size * 1.4}"/></clipPath></defs><g clip-path="url(#${id})"><text x="${x}" y="${y}" font-family="Gabriola, 'Segoe Script', serif" font-size="${size}" fill="${ink}" stroke="${ink}" stroke-width="${o.sw || 0}" ${o.anchor ? `text-anchor="${o.anchor}"` : ''} filter="url(#inkF)" ${o.ital ? 'font-style="italic"' : ''}>${txt}</text></g>`;
    };
    // flourish header
    g += `<path d="M150,90 Q450,40 750,90" stroke="${ink}" stroke-width="3" fill="none" opacity="0.8"/><circle cx="450" cy="66" r="8" fill="${ink}"/>`;
    g += clipText('To the Warlord of the North,', 70, 190, 74, r.first ?? 1, uid('t1'));
    const small = ['whom every tavern in my kingdom', 'laugheth at, from my royal hand:'];
    small.forEach((s, i) => { g += clipText(s, 70, 270 + i * 66, 56, i === 1 ? (r.small ?? r.first ?? 1) : (r.first ?? 1), uid('t2')); });
    for (const [k, txt, y, size, w] of S.WORDS) g += clipText(txt, 450, y, size, r[k] || 0, uid('tw'), { sw: 4, anchor: 'middle', w });
    if ((r.coward || 0) > 0.9) g += `<path d="M120,1185 Q450,1215 800,1180" stroke="${ink}" stroke-width="7" fill="none" filter="url(#inkF)" opacity="${f(Math.min(1, (r.coward - 0.9) * 10))}"/>`;
    // ink blots
    g += `<circle cx="790" cy="470" r="14" fill="${ink}" opacity="${r.fat > 0.5 ? 0.85 : 0}" filter="url(#inkF)"/><circle cx="805" cy="490" r="5" fill="${ink}" opacity="${r.fat > 0.5 ? 0.85 : 0}"/>`;
    // page 2 seam
    g += `<path d="M0,1300 L${PW},1300" stroke="#8a6a40" stroke-width="3" opacity="0.6"/><path d="M0,1306 L${PW},1306" stroke="#fff" stroke-width="2" opacity="0.25"/>`;
    g += S.doodle(450, 1900, 1, r.doodle || 0);
    return g;
  };
  // crude ink drawing of the warlord crying; p = 0..1 draw-on progress
  S.doodle = (x, y, s, p) => {
    if (p <= 0) return '';
    const ink = '#24160c';
    const strokes = [
      ['M-150,-120 C-160,-300 160,-300 150,-120 C150,-20 100,40 0,44 C-100,40 -150,-20 -150,-120Z', 6], // bald head
      ['M-140,-170 C-130,-200 -100,-210 -80,-200 M140,-170 C130,-200 100,-210 80,-200', 4], // ears-ish wrinkles
      ['M-90,-150 L-30,-120 M90,-150 L30,-120', 7], // angry-sad brows
      ['M-70,-100 q15,12 30,0 M40,-100 q15,12 30,0', 6], // shut eyes
      ['M-55,-90 C-70,-40 -90,0 -100,60 M55,-90 C70,-40 90,0 100,60', 5], // tear streams
      ['M-50,-20 Q0,-60 50,-20 Q0,10 -50,-20Z', 6], // wailing mouth
      ['M-70,30 C-90,120 -60,200 -80,260 M70,30 C90,120 60,200 80,260', 6], // braids
      ['M-95,250 l30,0 M65,250 l30,0', 6],
      ['M-180,40 C-260,140 -240,360 -170,420 L170,420 C240,360 260,140 180,40', 6], // fat body
      ['M-300,470 C-200,500 -100,440 0,480 C100,520 200,450 300,480', 5], // puddle
      ['M-230,-300 l20,-30 l20,30 l20,-30 l20,30', 4],
    ];
    let g = '', n = strokes.length;
    strokes.forEach(([d, w], i) => {
      const k = Math.max(0, Math.min(1, p * n - i));
      if (k <= 0) return;
      g += `<path d="${d}" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="${f(1 - k)}" stroke="${ink}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    });
    // tear drops + label
    if (p > 0.55) { const a = Math.min(1, (p - 0.55) * 4); for (const [tx, ty] of [[-120, 120], [-130, 200], [125, 140], [140, 220], [-110, 300], [118, 310]]) g += `<path d="M${tx},${ty - 22} q14,22 0,30 q-14,-8 0,-30Z" fill="${ink}" opacity="${f(a)}"/>`; }
    if (p > 0.8) g += `<text x="0" y="-360" text-anchor="middle" font-family="Gabriola, serif" font-size="110" fill="${ink}" opacity="${f(Math.min(1, (p - 0.8) * 5))}" filter="url(#inkF)">boo hoo</text>`;
    return `<g transform="translate(${x},${y}) scale(${s})" filter="url(#inkF)">${g}</g>`;
  };
  // parchment sheet with content; h = visible (unrolled) height; o.r = reveal map
  S.sheet = (h, o = {}) => {
    const id = uid('ps');
    let g = `<defs><clipPath id="${id}"><rect x="0" y="0" width="${PW}" height="${h}"/></clipPath></defs>`;
    const sy = o.scrollY || 0;
    g += `<g clip-path="url(#${id})"><g transform="translate(0,${-sy})"><rect x="0" y="0" width="${PW}" height="2700" fill="#e4d2a8" filter="url(#plaster)"/>`;
    g += `<rect x="0" y="0" width="${PW}" height="2700" fill="none" stroke="#8a6438" stroke-width="40" opacity="0.35" filter="url(#b14)"/>`;
    for (let i = 0; i < 6; i++) g += `<ellipse cx="${100 + i * 150}" cy="${300 + (i * 397) % 2000}" rx="${60 + i * 10}" ry="${40 + i * 6}" fill="#a07a48" opacity="0.12" filter="url(#b8)"/>`;
    if (!o.back) g += S.pageContent(o.r || {});
    g += `</g></g>`;
    return g;
  };

  // POV: the messenger's own forearms + hands from the bottom of the frame holding a scroll.
  // o.mode 'closed' (rolled, sealed) | 'open' (top roller held, sheet hanging); o.unroll 0..1; o.shake; o.broken
  S.pov = (t, o = {}) => {
    const sk = '#efc3a4', sl = '#d2c6aa', sh = o.shake || 0;
    const T2 = Math.PI * 2, jx = sh * (Math.sin(T2 * 5.3 * t) * 5 + Math.sin(T2 * 7.7 * t + 1) * 2.5), jy = sh * (Math.sin(T2 * 6.1 * t + 2) * 4);
    const cx = 540 + jx, cy = (o.y ?? 1000) + jy;
    let g = '';
    const rollLen = S.PW + 150, rollD = 92;
    const hL = [cx - rollLen / 2 + 70, cy], hR = [cx + rollLen / 2 - 70, cy];
    if (o.mode === 'open') {
      const shH = 20 + (o.unroll ?? 1) * 2680;
      g += `<g transform="translate(${cx - S.PW / 2 + 0},${cy + 20}) rotate(${f(sh * Math.sin(Math.PI * 2 * 4.6 * t) * 0.5)})">${S.sheet(shH, { r: o.r, scrollY: o.scrollY })}<rect x="0" y="0" width="${S.PW}" height="40" fill="#000" opacity="0.25" filter="url(#b8)"/></g>`;
      if ((o.unroll ?? 1) < 1) g += PR.scroll(cx, cy + 20 + shH, S.PW + 30, rollD * 0.8, 0, { seal: false });
    }
    g += PR.scroll(cx, cy, rollLen, rollD, 0, { seal: o.mode !== 'open', broken: o.broken || 0 });
    if (o.mode === 'open' && o.sealFade > 0) g += `<g opacity="${f(o.sealFade)}">${PR.scroll(cx, cy, rollLen, rollD, 0, { seal: true, broken: 1 })}</g>`;
    // forearms from the bottom corners
    const arm = (side, W, lift) => {
      const sx = side === 'R' ? 1 : -1, base = [540 + sx * 700, 2350], el = [540 + sx * 610, 1640 - lift];
      const lb = (A, B, w1, w2, col) => { const dx = B[0] - A[0], dy = B[1] - A[1], Ln = Math.hypot(dx, dy), nx = -dy / Ln, ny = dx / Ln, id = uid('pa'); return `<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${f(A[0] + nx * w1 / 2)}" y1="${f(A[1] + ny * w1 / 2)}" x2="${f(A[0] - nx * w1 / 2)}" y2="${f(A[1] - ny * w1 / 2)}"><stop offset="0" stop-color="${shade(col, -0.35)}"/><stop offset="0.4" stop-color="${shade(col, 0.06)}"/><stop offset="1" stop-color="${shade(col, -0.4)}"/></linearGradient></defs><path d="M${f(A[0] + nx * w1 / 2)},${f(A[1] + ny * w1 / 2)} L${f(B[0] + nx * w2 / 2)},${f(B[1] + ny * w2 / 2)} A${w2 / 2},${w2 / 2} 0 0 0 ${f(B[0] - nx * w2 / 2)},${f(B[1] - ny * w2 / 2)} L${f(A[0] - nx * w1 / 2)},${f(A[1] - ny * w1 / 2)}Z" fill="url(#${id})" ${ol()}/>`; };
      const hd = hand({ x: W[0], y: W[1] + 70, dir: [-sx * 0.25, -1], side, facing: 'back', thumb: 'auto', pose: 'fist', size: 330, skin: sk });
      return `<g filter="url(#skinS)">${hd}</g>` + `<g filter="url(#clothN)">${lb(base, el, 330, 300, sl)}${lb(el, [W[0] + sx * 20, W[1] + 190], 290, 220, sl)}</g>` +
        `<path d="M${el[0] - 110},${el[1] + 70} q110,44 220,-10" stroke="${shade(sl, -0.5)}" stroke-width="4" fill="none" opacity="0.5" filter="url(#b2)"/>` +
        `<ellipse cx="${W[0] + sx * 10}" cy="${W[1] + 185}" rx="120" ry="40" fill="#1e0c04" opacity="0.3" filter="url(#b8)"/>`;
    };
    // hands are drawn over the roller: sleeve first (behind), then the hand on top
    const lift = o.lift || 0;
    g += arm('L', hL, lift) + arm('R', hR, lift);
    return g;
  };

  G.SETS = S;
})(window);






