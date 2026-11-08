// Tailoring for rig3 (use with G.RIG_CRISP = true): costume overlays drawn like real garments cut from a pattern -
// filled lapels that cast a soft shadow, a lapped front edge with a lit seam, buttons with their own shadow, pocket
// welts, gentle pull folds - never bare lines (the user: clothes must not look "un patterned"). Each returns SVG in
// person-local units for an adult (neck x +-46 at y -1180, shoulders y -1150, waist y -820). The rig cuts a costume
// to the torso, under the torso's shading and outline. Set the garment's length with the character's dims.hemY.
// Build a costume in the cast file, layered bottom to top:
//   white jacket   costume: T.shirt({ col: '#f8f6f0', placket: true }) + T.collar({ type: 'stand' }) + T.jacket()
//   waistcoat      costume: T.shirt({ pleats: true, studs: 2 }) + T.waistcoat() + T.collar({ type: 'wing', y: -1160 })
//   uniform        costume: T.uniform() (+ T.wound() for a sabre cut)       apron: costume: T.apron()
(function (G) {
  const { rng, shade, mix } = G.RIG;
  const f = v => Math.round(v * 10) / 10;
  const T = {};
  let nid = 0;
  const OUTL = 'stroke="#1a120c" stroke-width="2" stroke-linejoin="round"';
  T.OUTL = OUTL;
  const poly = (A, B) => 'M' + A.map(p => f(p[0]) + ',' + f(p[1])).join(' L') + ' L' + B.slice().reverse().map(p => f(p[0]) + ',' + f(p[1])).join(' L') + 'Z';

  // ---------------- buttons, stars
  T.brassDefs = () => `<defs><radialGradient id="tlBrass" cx="0.35" cy="0.3" r="0.8"><stop offset="0" stop-color="#fff0b0"/><stop offset="0.45" stop-color="#c8963a"/><stop offset="1" stop-color="#5a3a10"/></radialGradient></defs>`;
  // kind: 'cloth' (covered, with its little shadow), 'brass' (needs T.brassDefs() once in the costume), 'horn'
  T.button = (x, y, kind = 'cloth', r = 8.5, col = '#f8f6f1') => {
    if (kind === 'brass') return `<circle cx="${f(x)}" cy="${f(y)}" r="${r}" fill="url(#tlBrass)" stroke="#2a1a06" stroke-width="1.4"/><circle cx="${f(x - r * 0.3)}" cy="${f(y - r * 0.3)}" r="${f(r * 0.3)}" fill="#fff6d0" opacity="0.8"/>`;
    if (kind === 'horn') return `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r * 0.76)}" fill="#1a1614" stroke="#000" stroke-width="1.4"/><circle cx="${f(x - 2)}" cy="${f(y - 2)}" r="2" fill="#8a8078" opacity="0.7"/>`;
    return `<ellipse cx="${f(x + 2)}" cy="${f(y + 4)}" rx="${f(r + 0.5)}" ry="${f(r - 0.5)}" fill="#3a3428" opacity="0.18" filter="url(#b2)"/><circle cx="${f(x)}" cy="${f(y)}" r="${r}" fill="${col}" stroke="${shade(col, -0.32)}" stroke-width="1.3"/><circle cx="${f(x - 2.5)}" cy="${f(y - 2.5)}" r="2.6" fill="#fff"/><path d="M${f(x - 3.5)},${f(y + 3)} Q${f(x)},${f(y + 5)} ${f(x + 3.5)},${f(y + 3)}" stroke="${shade(col, -0.2)}" stroke-width="1" fill="none"/>`;
  };
  T.star = (x, y, r, col = '#d8b050') => { let d = ''; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.42 : r; d += (i ? ' L' : 'M') + f(x + Math.cos(a) * rr) + ',' + f(y + Math.sin(a) * rr); } return `<path d="${d}Z" fill="${col}" stroke="#4a3208" stroke-width="0.8"/>`; };

  // ---------------- the shirt front seen in an opening (col: fill the V in that colour; null = the tunic is the shirt)
  T.shirt = (o = {}) => {
    const vy = o.vy ?? -1000;
    let g = o.col ? `<path d="M-46,-1182 L46,-1182 L20,-1036 L0,${vy} L-20,-1036Z" fill="${o.col}"/>` : '';
    if (o.placket) g += `<path d="M-6,-1150 L-5,${vy - 10} M6,-1150 L5,${vy - 10}" stroke="#dcd8ce" stroke-width="1.4"/>`;
    if (o.pleats) g += `<path d="M-24,-1170 L-24,-990 M24,-1170 L24,-990 M-12,-1170 L-12,-990 M12,-1170 L12,-990" stroke="#b8b0a0" stroke-width="1.6" opacity="0.6"/>`;
    for (let i = 0; i < (o.studs || 0); i++) g += `<circle cx="0" cy="${-1120 + i * 60}" r="5" fill="#f4f0e8" stroke="#8a8478" stroke-width="1.2"/>`;
    return g;
  };
  // ---------------- the collar and tie (type 'stand' | 'wing'; tie 'bow' | 'none'; y = the knot's height)
  T.collar = (o = {}) => {
    const type = o.type || 'stand', y = o.y ?? -1168, tc = o.tieCol || '#161414';
    let g = type === 'wing'
      ? `<path d="M-46,-1192 L-6,-1166 L-30,-1150 L-58,-1176Z M46,-1192 L6,-1166 L30,-1150 L58,-1176Z" fill="#f2eee6" stroke="#8a8478" stroke-width="1.4"/>`
      : `<path d="M-40,-1198 L40,-1198 L37,-1160 L-37,-1160Z" fill="#fbfaf6" stroke="#a8a49a" stroke-width="1.3"/>`;
    if ((o.tie || 'bow') === 'bow') g += `<path d="M0,${y} L-34,${y - 18} Q-42,${y + 2} -34,${y + 20}Z M0,${y} L34,${y - 18} Q42,${y + 2} 34,${y + 20}Z" fill="${tc}" stroke="#000" stroke-width="1.4"/><rect x="-8" y="${y - 9}" width="16" height="18" rx="4" fill="${shade(tc, 0.1)}" stroke="#000" stroke-width="1.2"/><path d="M-30,${y - 10} Q-20,${y - 3} -10,${y - 4} M30,${y - 10} Q20,${y - 3} 10,${y - 4}" stroke="${shade(tc, 0.4)}" stroke-width="1.5" fill="none" opacity="0.8"/>`;
    return g;
  };

  // ---------------- a jacket (the body is the tunic colour col): notched lapels, the left front lapped over the right,
  // buttons, a breast-pocket welt (pocket: 'pencil' | 'plain' | null), pull folds
  T.jacket = (o = {}) => {
    const col = o.col || '#efebe2', E2 = `stroke="${shade(col, -0.36)}" stroke-width="1.5" stroke-linejoin="round"`, fc = shade(col, -0.3);
    let g = '';
    if (o.folds !== false) g += [-1, 1].map(s => `<path d="M${s * 10},-996 Q${s * 62},-1036 ${s * 124},-1102" stroke="${fc}" stroke-width="7" fill="none" opacity="0.22" filter="url(#b4)"/><path d="M${s * 150},-900 Q${s * 120},-880 ${s * 96},-840" stroke="${fc}" stroke-width="6" fill="none" opacity="0.2" filter="url(#b4)"/>`).join('');
    if ((o.lapel || 'notch') === 'notch') {
      const lap = s => `M${s * 46},-1182 L${s * 96},-1156 L${s * 106},-1120 L${s * 90},-1110 L${s * 114},-1084 L${s * 14},-1002 L${s * 22},-1044Z`;
      g += [-1, 1].map(s => `<path d="M${s * 114},-1082 L${s * 16},-998" stroke="${shade(col, -0.65)}" stroke-width="12" opacity="0.16" filter="url(#b4)" transform="translate(${s * 5},7)"/>`).join('');
      g += [-1, 1].map(s => `<path d="${lap(s)}" fill="${shade(col, s < 0 ? -0.03 : 0.02)}" ${E2}/><path d="M${s * 50},-1176 L${s * 24},-1050" stroke="#ffffff" stroke-width="2.2" opacity="0.75"/>`).join('');
    }
    if (o.edge !== false) g += `<path d="M14,-1002 C17,-900 19,-700 21,-470" fill="none" stroke="${shade(col, -0.36)}" stroke-width="1.6"/><path d="M19,-1000 C22,-900 24,-700 26,-470" fill="none" stroke="#ffffff" stroke-width="2.4" opacity="0.65"/>`;
    for (const y of (o.buttons || [-986, -910, -834])) g += T.button(0, y, o.bkind || 'cloth', 8.5, shade(col, 0.05));
    if (o.pocket !== null) {
      if ((o.pocket || 'pencil') === 'pencil') g += `<path d="M76,-1016 L96,-1078 L104,-1076 L86,-1014Z" fill="#d8a83a" stroke="#6a4a10" stroke-width="1.1"/><path d="M96,-1078 L99,-1088 L104,-1076Z" fill="#2a2420"/><path d="M82,-1028 L86,-1040" stroke="#c0c4c8" stroke-width="5"/>`;
      g += `<path d="M66,-1018 L150,-1026 L151,-1014 L67,-1006Z" fill="${shade(col, -0.02)}" ${E2}/><path d="M67,-1004 L151,-1012" stroke="${shade(col, -0.65)}" stroke-width="5" opacity="0.18" filter="url(#b2)"/><path d="M67,-1017 L150,-1025" stroke="#ffffff" stroke-width="1.6" opacity="0.8"/>`;
    }
    return g;
  };

  // ---------------- a waistcoat over the shirt: two fronts to the torso's edges (a light shirt's shaded sides never
  // show beside the dark wool), a pinstripe, lit edges, a soft fold under the chest, welt pockets, horn buttons, a
  // gold watch chain from a buttonhole to the left pocket
  T.waistcoat = (o = {}) => {
    const col = o.col || '#26221e', id = 'tlW' + (nid++), st = o.stripe || '#6a625a';
    const fronts = 'M-300,-1160 L-60,-1172 L-2,-990 L-2,-770 L-74,-742 L-300,-760Z M300,-1160 L60,-1172 L2,-990 L2,-770 L74,-742 L300,-760Z';
    let g = `<defs><linearGradient id="${id}g" gradientUnits="userSpaceOnUse" x1="-230" y1="0" x2="230" y2="0"><stop offset="0" stop-color="${shade(col, -0.45)}"/><stop offset="0.38" stop-color="${shade(col, 0.06)}"/><stop offset="0.62" stop-color="${col}"/><stop offset="1" stop-color="${shade(col, -0.55)}"/></linearGradient><clipPath id="${id}c"><path d="${fronts}"/></clipPath></defs>`;
    g += `<path d="${fronts}" fill="url(#${id}g)" ${OUTL}/>`;
    if (st !== 'none') g += `<g clip-path="url(#${id}c)" opacity="${o.stripeOp ?? 0.24}">` + Array.from({ length: 40 }, (_, i) => `<path d="M${-300 + i * 15},-1200 l0,500" stroke="${st}" stroke-width="1.2"/>`).join('') + `</g>`;
    g += `<path d="M-60,-1172 L-3,-990 L-3,-772 M60,-1172 L3,-990 L3,-772" stroke="${shade(col, 0.32)}" stroke-width="1.6" fill="none" opacity="0.75"/>`;
    g += [-1, 1].map(s => `<path d="M${s * 150},-930 Q${s * 90},-910 ${s * 30},-930" stroke="#000" stroke-width="10" fill="none" opacity="0.18" filter="url(#b4)"/>`).join('');
    g += `<path d="M-160,-884 L-86,-880 M86,-880 L160,-884" stroke="${shade(col, -0.7)}" stroke-width="5"/><path d="M-160,-888 L-86,-884 M86,-884 L160,-888" stroke="${shade(col, 0.22)}" stroke-width="1.6" opacity="0.6"/>`;
    for (let i = 0; i < (o.buttons ?? 6); i++) g += T.button(0, -972 + i * 38, 'horn');
    if (o.chain !== false) g += T.brassDefs() + `<path d="M2,-896 Q-60,-842 -122,-882" stroke="#5a3a10" stroke-width="5" fill="none"/><path d="M2,-896 Q-60,-842 -122,-882" stroke="${o.chain || '#e0b450'}" stroke-width="3" fill="none" stroke-dasharray="4 2.5"/><rect x="-4" y="-904" width="16" height="6" rx="2" fill="url(#tlBrass)"/><circle cx="-60" cy="-848" r="6" fill="url(#tlBrass)" stroke="#3a2a0a" stroke-width="1"/>`;
    return g;
  };

  // ---------------- an officer's shell jacket (the body is the tunic colour): a faint twill, the edge of the
  // double-breasted front, two rows of brass buttons, a standing collar faced in a colour with stars, the sword belt
  // and its plate, soot and mud from a seed (soil: 0 = clean)
  T.uniform = (o = {}) => {
    const n = o.buttons ?? 7, r = rng(o.soil || 1);
    let g = T.brassDefs();
    if (o.twill !== false) for (let i = -30; i < 30; i++) g += `<path d="M${i * 22 - 400},-1300 l500,700" stroke="#000" stroke-width="2" opacity="0.05"/>`;
    g += `<path d="M66,-1176 C70,-1000 70,-900 72,-470" stroke="#26221c" stroke-width="3.5" fill="none"/><path d="M70,-1176 C74,-1000 74,-900 76,-470" stroke="#9a948a" stroke-width="1.6" fill="none" opacity="0.45"/>`;
    for (let i = 0; i < n; i++) { const y = -1104 + i * (294 / Math.max(1, n)); g += T.button(-40 + i * 1.2, y, 'brass') + ((o.rows ?? 2) > 1 ? T.button(44 + i * 1.2, y, 'brass') : ''); }
    const cc = o.collar || '#a8843a';
    g += `<path d="M-78,-1200 L78,-1200 L72,-1150 Q0,-1136 -72,-1150Z" fill="${cc}" ${OUTL}/><path d="M-72,-1190 L72,-1190" stroke="${shade(cc, 0.4)}" stroke-width="2" opacity="0.5"/>`;
    if ((o.stars ?? 2) > 0) g += T.star(-46, -1168, 10) + T.star(46, -1168, 10);
    if (o.belt !== false) g += `<rect x="-280" y="-848" width="560" height="32" fill="${o.belt || '#16100b'}" ${OUTL}/><path d="M-280,-842 L280,-842" stroke="#4a3a2a" stroke-width="2" opacity="0.6"/><rect x="-28" y="-853" width="56" height="42" rx="5" fill="url(#tlBrass)" ${OUTL}/><path d="M-16,-840 L16,-840 M-16,-830 L16,-830" stroke="#5a3a10" stroke-width="2"/>`;
    if (o.soil) for (let i = 0; i < 16; i++) { const x = -200 + r() * 400, y = -820 + r() * 330; g += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(8 + r() * 24)}" ry="${f(5 + r() * 12)}" fill="#1e1610" opacity="${f(0.25 + r() * 0.3)}" filter="url(#b4)"/>`; }
    return g;
  };

  // ---------------- a sabre cut from a (one shoulder) to b, the wool torn open: blood soaked unevenly into the cloth
  // (heavier below), a narrow jagged gash with torn flaps lifting and the wet red inside, drips of different lengths
  T.wound = (o = {}) => {
    const a = o.a || [-178, -1104], b = o.b || [158, -868], r = rng(o.seed || 2011), dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
    let g = '';
    for (let i = 0; i < 16; i++) { const u = r(), px = a[0] + dx * u + (r() - 0.5) * 26, py = a[1] + dy * u + 8 + r() * 46, rx = 12 + r() * 30, ry = 8 + r() * 22; g += `<ellipse cx="${f(px)}" cy="${f(py)}" rx="${f(rx)}" ry="${f(ry)}" transform="rotate(${f(r() * 180)} ${f(px)} ${f(py)})" fill="#2a0604" opacity="${f(0.3 + r() * 0.35)}" filter="url(#b4)"/>`; }
    for (let i = 0; i < 6; i++) { const u = 0.2 + r() * 0.75, px = a[0] + dx * u, py = a[1] + dy * u + 8, len = 40 + r() * 170, w = 4 + r() * 5; g += `<path d="M${f(px)},${f(py)} C${f(px + 3)},${f(py + len * 0.4)} ${f(px - 4)},${f(py + len * 0.7)} ${f(px + 1)},${f(py + len)}" stroke="#3a0604" stroke-width="${f(w)}" stroke-linecap="round" fill="none" opacity="0.85"/><circle cx="${f(px + 1)}" cy="${f(py + len)}" r="${f(w * 0.8)}" fill="#3a0604" opacity="0.85"/>`; }
    const N = 24, top = [], bot = [], mid = [];
    for (let i = 0; i <= N; i++) {
      const u = i / N, w = 1.5 + 7 * Math.pow(Math.sin(Math.PI * u), 0.6), px = a[0] + dx * u, py = a[1] + dy * u;
      top.push([px + nx * (w + r() * 3), py + ny * (w + r() * 3)]); bot.push([px - nx * (w + r() * 2), py - ny * (w + r() * 2)]); mid.push([px + nx * w * 0.1, py + ny * w * 0.1]);
    }
    g += `<path d="${poly(top, bot)}" fill="#1a0302" stroke="#2a0604" stroke-width="2" stroke-linejoin="round"/>`;
    g += `<path d="M${mid.slice(2, N - 1).map(p => f(p[0]) + ',' + f(p[1])).join(' L')}" stroke="#8a140c" stroke-width="3.2" fill="none" stroke-linecap="round"/><path d="M${top.slice(3, N - 2).map(p => f(p[0] - nx * 2) + ',' + f(p[1] - ny * 2)).join(' L')}" stroke="#d86848" stroke-width="1.2" fill="none" opacity="0.55"/>`;
    for (let i = 3; i < N - 2; i += 3) { const p = top[i], q = top[i + 1], k = 8 + r() * 8; g += `<path d="M${f(p[0])},${f(p[1])} L${f(q[0])},${f(q[1])} L${f((p[0] + q[0]) / 2 + nx * k)},${f((p[1] + q[1]) / 2 + ny * k)}Z" fill="${o.cloth || '#6e695f'}" stroke="#2a2620" stroke-width="1"/>`; }
    for (let i = 2; i < N - 2; i += 4) { const p = bot[i], q = bot[i + 1], k = 6 + r() * 6; g += `<path d="M${f(p[0])},${f(p[1])} L${f(q[0])},${f(q[1])} L${f((p[0] + q[0]) / 2 - nx * k)},${f((p[1] + q[1]) / 2 - ny * k)}Z" fill="#5a1410" stroke="#2a0604" stroke-width="1"/>`; }
    return g;
  };

  // ---------------- a worn leather bib apron over shirt and braces: neck strap, creases, a pocket of instruments
  // (tools), blood smeared from a seed (blood: 0 = clean) and a wiped handprint
  T.apron = (o = {}) => {
    const col = o.col || '#4a3424', r = rng(o.blood || 7);
    let g = `<path d="M-110,-1180 L-96,-820 M110,-1180 L96,-820" stroke="${o.braces || '#3a2a1e'}" stroke-width="16"/>`;
    g += `<path d="M-130,-1090 L130,-1090 L150,-850 L250,-820 L250,-300 L-250,-300 L-250,-820 L-150,-850Z" fill="${col}" ${OUTL}/>`;
    g += `<path d="M-120,-1090 L-70,-1196 M120,-1090 L70,-1196" stroke="${shade(col, -0.4)}" stroke-width="10" stroke-linecap="round"/>`;
    for (let i = 0; i < 14; i++) { const x = -220 + r() * 440, y = -1050 + r() * 700; g += `<path d="M${f(x)},${f(y)} q${f(10 + r() * 20)},${f(-4 + r() * 8)} ${f(30 + r() * 40)},${f(-2 + r() * 4)}" stroke="${mix(col, '#c89a70', 0.4)}" stroke-width="2" fill="none" opacity="0.45"/>`; }
    if (o.tools !== false) g += `<rect x="-62" y="-1010" width="124" height="96" rx="6" fill="${shade(col, -0.15)}" ${OUTL}/><path d="M-30,-1010 L-38,-1080 M-18,-1010 L-22,-1084 M22,-1012 L30,-1090" stroke="#b8bcc0" stroke-width="5" stroke-linecap="round"/><circle cx="-38" cy="-1084" r="7" fill="none" stroke="#b8bcc0" stroke-width="3"/><circle cx="-22" cy="-1088" r="7" fill="none" stroke="#b8bcc0" stroke-width="3"/>`;
    if (o.blood) {
      for (let i = 0; i < 9; i++) { const x = -190 + r() * 380, y = -900 + r() * 520; g += `<path d="M${f(x)},${f(y)} c${f(20 + r() * 40)},${f(-10 + r() * 20)} ${f(50 + r() * 50)},${f(r() * 30)} ${f(70 + r() * 60)},${f(10 + r() * 20)}" stroke="#4a0806" stroke-width="${f(8 + r() * 14)}" stroke-linecap="round" fill="none" opacity="${f(0.55 + r() * 0.3)}"/>`; }
      g += `<g transform="translate(120,-760) rotate(-20)" fill="#4a0806" opacity="0.7">` + [-24, -8, 8, 24].map((x, i) => `<rect x="${x - 6}" y="${f(-60 + Math.abs(i - 1.5) * 6)}" width="12" height="70" rx="6"/>`).join('') + `<ellipse cx="0" cy="20" rx="40" ry="34"/></g>`;
    }
    return g;
  };
  G.TAILOR = T;
})(window);
