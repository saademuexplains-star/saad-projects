// Props for "The Royal Astrologer": the golden instruments (armillary sphere, astrolabe, celestial globe, quadrant,
// hourglass), the horoscope chart, the king's purse, the old astrologer's head on its pike, halberds, the lady's veil,
// window shutters, the physician's flask, a quill. Hand-held props use the RIG grip frame (+x = thumb side, +y = fingers).
(function (G) {
  const { f, shade, mix, rng, uid, ol } = G.RIG, C = G.CINE;
  const P = G.PROPS;
  const TAU = Math.PI * 2;
  const GOLD = (id, dark = '#6a4410', mid = '#e8c564', lite = '#fff2b8') => `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${dark}"/><stop offset="0.35" stop-color="${mid}"/><stop offset="0.5" stop-color="${lite}"/><stop offset="0.68" stop-color="${mid}"/><stop offset="1" stop-color="${dark}"/></linearGradient>`;
  const OUT = '#2a1a06';

  // ---------------- the armillary sphere: (x,y) = foot of its stand on the floor; s scale (about 700 tall at s 1);
  // the inner rings turn about the polar axis with t * o.spin (back halves behind the little earth, front halves over it)
  P.armillary = (x, y, s, t, o = {}) => {
    const id = uid('ar'), R = 200, cy = -470, rot = (o.rot ?? t * (o.spin ?? 0.35)), w = 9;
    let back = '', front = '';
    const ring = (dEll, sweepFront, col, ww) => [dEll(0, col, ww), dEll(1, col, ww)];
    // meridian ring at azimuth a: ellipse rx = R|cos a|; the half with sin(phi)sin(a) > 0 is in front
    for (let i = 0; i < 4; i++) {
      const a = rot + i * Math.PI / 4, rx = Math.max(2, R * Math.abs(Math.cos(a))), frontRight = Math.sin(a) * Math.cos(a) >= 0;
      const half = right => `<path d="M0,${cy - R} A${f(rx)},${R} 0 0 ${right ? 1 : 0} 0,${cy + R}" fill="none" stroke="url(#${id})" stroke-width="${w}" stroke-linecap="round"/>`;
      back += half(!frontRight); front += half(frontRight);
    }
    // equator (seen a little from above) and the tilted ecliptic band with its zodiac ticks
    const flat = (tilt, ry, wid, col) => {
      const T = `rotate(${tilt} 0 ${cy})`;
      return [`<path d="M${-R},${cy} A${R},${f(ry)} 0 0 1 ${R},${cy}" transform="${T}" fill="none" stroke="${col}" stroke-width="${wid}"/>`,
        `<path d="M${-R},${cy} A${R},${f(ry)} 0 0 0 ${R},${cy}" transform="${T}" fill="none" stroke="${col}" stroke-width="${wid}"/>`];
    };
    const eq = flat(0, R * 0.26, w, `url(#${id})`), ec = flat(-23, R * 0.3, w * 2.2, `url(#${id})`);
    back += eq[0] + ec[0]; front += eq[1] + ec[1];
    let ticks = ''; for (let k = 0; k < 12; k++) { const ph = rot * 0.4 + k * TAU / 12, xx = R * Math.cos(ph), yy = R * 0.3 * Math.sin(ph); if (Math.sin(ph) > 0) ticks += `<circle cx="${f(xx)}" cy="${f(cy + yy)}" r="4" fill="#5a3a0a" transform="rotate(-23 0 ${cy})"/>`; }
    // the outer fixed meridian, horizon ring, the polar axis, and the stand
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><defs>${GOLD(id)}<radialGradient id="${id}e" cx="0.38" cy="0.35" r="0.7"><stop offset="0" stop-color="#7ab0d8"/><stop offset="0.6" stop-color="#2a5a8a"/><stop offset="1" stop-color="#0e2440"/></radialGradient></defs>`;
    g += `<path d="M-90,0 L-40,-150 L40,-150 L90,0" fill="none" stroke="${OUT}" stroke-width="16" stroke-linejoin="round"/><path d="M-90,0 L-40,-150 L40,-150 L90,0" fill="none" stroke="url(#${id})" stroke-width="10"/>`;
    g += `<ellipse cx="0" cy="0" rx="110" ry="18" fill="#3a2a10" ${ol(1.3)}/><rect x="-12" y="-260" width="24" height="120" fill="url(#${id})" ${ol(1.2)}/><ellipse cx="0" cy="-150" rx="46" ry="10" fill="url(#${id})" ${ol(1)}/>`;
    g += `<circle cx="0" cy="${cy}" r="${R + 26}" fill="none" stroke="${OUT}" stroke-width="20"/><circle cx="0" cy="${cy}" r="${R + 26}" fill="none" stroke="url(#${id})" stroke-width="14"/>`;
    g += `<ellipse cx="0" cy="${cy}" rx="${R + 60}" ry="${f((R + 60) * 0.2)}" fill="none" stroke="${OUT}" stroke-width="18"/><ellipse cx="0" cy="${cy}" rx="${R + 60}" ry="${f((R + 60) * 0.2)}" fill="none" stroke="url(#${id})" stroke-width="12"/>`;
    g += `<path d="M0,${cy - R - 60} L0,${cy + R + 60}" stroke="${OUT}" stroke-width="9"/><path d="M0,${cy - R - 60} L0,${cy + R + 60}" stroke="#f0d888" stroke-width="5"/>`;
    g += `<g filter="url(#b1)" opacity="0.9">${back}</g>`;
    g += `<circle cx="0" cy="${cy}" r="46" fill="url(#${id}e)" ${ol(1.5)}/><path d="M-30,${cy - 16} C-10,${cy - 30} 14,${cy - 4} 32,${cy - 14} M-36,${cy + 12} C-14,${cy + 4} 6,${cy + 24} 34,${cy + 14}" stroke="#6a8a4a" stroke-width="8" fill="none" opacity="0.8"/>`;
    g += front + ticks;
    g += `<circle cx="0" cy="${cy - R - 60}" r="11" fill="url(#${id})" ${ol(1)}/><circle cx="0" cy="${cy + R + 60}" r="11" fill="url(#${id})" ${ol(1)}/>`;
    g += `<path d="M-160,${cy - 170} C-120,${cy - 200} -60,${cy - 214} 0,${cy - 214}" stroke="#fff6d0" stroke-width="5" fill="none" opacity="0.5"/>`;
    return g + `</g>`;
  };

  // ---------------- a brass astrolabe hanging from its shackle: (x,y) = the ring it hangs from; the rete turns slowly
  P.astrolabe = (x, y, s, t, o = {}) => {
    const id = uid('al'), R = 120, sw = Math.sin(t * 0.9 + (o.ph || 0)) * 2.5, rr = t * 0.12 + (o.ph || 0);
    let g = `<g transform="translate(${f(x)},${f(y)}) rotate(${f(sw)}) scale(${f(s)})"><defs>${GOLD(id, '#5a3a0c', '#c99a3a', '#f8e0a0')}</defs>`;
    g += `<circle cx="0" cy="0" r="14" fill="none" stroke="url(#${id})" stroke-width="7"/><path d="M-22,16 L22,16 L14,40 L-14,40Z" fill="url(#${id})" ${ol(1.2)}/>`;
    g += `<circle cx="0" cy="${40 + R}" r="${R}" fill="url(#${id})" ${ol(1.6)}/><circle cx="0" cy="${40 + R}" r="${R - 16}" fill="#7a5a24" ${ol(1)}/>`;
    for (let k = 0; k < 72; k++) { const a = k * TAU / 72, r0 = R - 16, r1 = R - (k % 6 ? 6 : 1); g += `<path d="M${f(Math.cos(a) * r0)},${f(40 + R + Math.sin(a) * r0)} L${f(Math.cos(a) * r1)},${f(40 + R + Math.sin(a) * r1)}" stroke="#3a2408" stroke-width="2"/>`; }
    g += `<circle cx="0" cy="${40 + R}" r="${R * 0.55}" fill="none" stroke="#e8c870" stroke-width="3" opacity="0.7"/><circle cx="0" cy="${40 + R}" r="${R * 0.3}" fill="none" stroke="#e8c870" stroke-width="2" opacity="0.6"/>`;
    // the rete: an off-centre ring and star pointers
    g += `<g transform="rotate(${f(rr * 57.3)} 0 ${40 + R})"><circle cx="${f(R * 0.18)}" cy="${40 + R}" r="${R * 0.62}" fill="none" stroke="#f4d88a" stroke-width="6"/>`;
    for (let k = 0; k < 7; k++) { const a = k * TAU / 7 + 0.4, r1 = R * (0.5 + (k % 3) * 0.12); g += `<path d="M${f(Math.cos(a) * r1 * 0.5)},${f(40 + R + Math.sin(a) * r1 * 0.5)} L${f(Math.cos(a) * r1)},${f(40 + R + Math.sin(a) * r1)}" stroke="#f4d88a" stroke-width="5" stroke-linecap="round"/><path d="M${f(Math.cos(a) * r1)},${f(40 + R + Math.sin(a) * r1)} l${f(Math.cos(a + 1.3) * 12)},${f(Math.sin(a + 1.3) * 12)}" stroke="#f4d88a" stroke-width="3"/>`; }
    g += `</g><path d="M0,${40 + R - R * 0.85} L0,${40 + R + R * 0.85}" stroke="#2a1806" stroke-width="7" transform="rotate(${f(-rr * 30)} 0 ${40 + R})"/><circle cx="0" cy="${40 + R}" r="9" fill="url(#${id})" ${ol(1)}/>`;
    g += `<path d="M${-R * 0.7},${40 + R * 0.4} C${-R * 0.4},${40 + R * 0.1} ${R * 0.1},${40 + R * 0.05} ${R * 0.5},${40 + R * 0.25}" stroke="#fff8d8" stroke-width="5" fill="none" opacity="0.5"/>`;
    return g + `</g>`;
  };

  // ---------------- the celestial globe on its stand: (x,y) = the floor; the sphere's constellations drift with t
  P.celestialGlobe = (x, y, s, t, o = {}) => {
    const id = uid('cg'), R = 170, cy = -520, sh = ((t * (o.spin ?? 14)) % 400 + 400) % 400;
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><defs>${GOLD(id + 'g')}<radialGradient id="${id}" cx="0.4" cy="0.36" r="0.72"><stop offset="0" stop-color="#3a5a9a"/><stop offset="0.65" stop-color="#18284e"/><stop offset="1" stop-color="#0a1022"/></radialGradient><clipPath id="${id}c"><circle cx="0" cy="${cy}" r="${R}"/></clipPath></defs>`;
    g += `<path d="M-120,0 C-100,-120 -40,-200 0,-250 C40,-200 100,-120 120,0" fill="none" stroke="${OUT}" stroke-width="22"/><path d="M-120,0 C-100,-120 -40,-200 0,-250 C40,-200 100,-120 120,0" fill="none" stroke="url(#${id}g)" stroke-width="14"/>`;
    g += `<ellipse cx="0" cy="0" rx="140" ry="20" fill="#3a2a10" ${ol(1.3)}/><rect x="-14" y="-340" width="28" height="100" fill="url(#${id}g)" ${ol(1)}/>`;
    g += `<circle cx="0" cy="${cy}" r="${R}" fill="url(#${id})" ${ol(1.8)}/>`;
    // constellation dots and lines, scrolling across the face of the sphere
    const r = rng(7); let cons = '';
    for (let k = 0; k < 2; k++) for (let i = 0; i < 9; i++) {
      const bx = -400 + i * 90 + k * 400 + sh - 400, by = cy - 130 + r() * 260, n = 3 + Math.floor(r() * 3); let pts = [];
      for (let j = 0; j < n; j++) pts.push([bx + (r() - 0.5) * 80, by + (r() - 0.5) * 80]);
      const sq = q => { const d = q[0] / R; return [q[0] * (1 - 0.18 * d * d), q[1]]; };
      pts = pts.map(sq);
      cons += `<path d="M${pts.map(q => f(q[0]) + ',' + f(q[1])).join(' L')}" stroke="#e8c870" stroke-width="2.5" fill="none" opacity="0.75"/>` + pts.map(q => `<circle cx="${f(q[0])}" cy="${f(q[1])}" r="5" fill="#fff0b8"/>`).join('');
    }
    g += `<g clip-path="url(#${id}c)">${cons}<ellipse cx="0" cy="${cy}" rx="${R}" ry="${R * 0.3}" fill="none" stroke="#e8c870" stroke-width="3" opacity="0.6"/><circle cx="${-R * 0.35}" cy="${cy - R * 0.35}" r="${R * 0.55}" fill="#fff" opacity="0.08"/></g>`;
    g += `<circle cx="0" cy="${cy}" r="${R + 18}" fill="none" stroke="${OUT}" stroke-width="18"/><circle cx="0" cy="${cy}" r="${R + 18}" fill="none" stroke="url(#${id}g)" stroke-width="12"/>`;
    g += `<ellipse cx="0" cy="${cy + 40}" rx="${R + 46}" ry="${(R + 46) * 0.22}" fill="none" stroke="${OUT}" stroke-width="20"/><ellipse cx="0" cy="${cy + 40}" rx="${R + 46}" ry="${(R + 46) * 0.22}" fill="none" stroke="url(#${id}g)" stroke-width="14"/>`;
    return g + `</g>`;
  };

  // ---------------- a brass quadrant hanging on the wall (x,y = its corner pivot), with a swinging plumb line
  P.quadrant = (x, y, s, t) => {
    const id = uid('qd'), R = 230, sw = Math.sin(t * 1.1) * 3;
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><defs>${GOLD(id, '#5a3a0c', '#c99a3a', '#f8e0a0')}</defs>`;
    g += `<path d="M0,0 L${R},0 A${R},${R} 0 0 1 0,${R}Z" fill="url(#${id})" ${ol(1.6)}/><path d="M18,18 L${R - 34},18 A${R - 34},${R - 34} 0 0 1 18,${R - 34}Z" fill="#8a6828" ${ol(1)}/>`;
    for (let k = 0; k <= 18; k++) { const a = k * Math.PI / 36, r0 = R - 30, r1 = R - (k % 3 ? 14 : 4); g += `<path d="M${f(Math.cos(a) * r0)},${f(Math.sin(a) * r0)} L${f(Math.cos(a) * r1)},${f(Math.sin(a) * r1)}" stroke="#3a2408" stroke-width="2.5"/>`; }
    g += `<g transform="rotate(${f(sw)})"><path d="M0,0 L${f(R * 0.55)},${f(R * 0.75)}" stroke="#e8e0c8" stroke-width="2"/><circle cx="${f(R * 0.56)}" cy="${f(R * 0.77)}" r="9" fill="#5a5a5a" ${ol(1)}/></g>`;
    return g + `</g>`;
  };

  // ---------------- an hourglass: (x,y) = its base; k 0..1 = how much sand has fallen
  P.hourglass = (x, y, s, t, k = 0.5) => {
    const id = uid('hg'), H = 180, top = -H, mid = -H / 2;
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><defs><linearGradient id="${id}" x1="0" x2="1"><stop offset="0" stop-color="#ffffff" stop-opacity="0.45"/><stop offset="0.5" stop-color="#ffffff" stop-opacity="0.08"/><stop offset="1" stop-color="#ffffff" stop-opacity="0.3"/></linearGradient></defs>`;
    const sand = '#d8b070', a = 1 - k;
    g += `<path d="M-46,${top + 14} C-46,${mid - 30} -8,${mid - 8} -6,${mid} C-8,${mid + 8} -46,${mid + 30} -46,-14 L46,-14 C46,${mid + 30} 8,${mid + 8} 6,${mid} C8,${mid - 8} 46,${mid - 30} 46,${top + 14}Z" fill="#2a2016" opacity="0.35"/>`;
    if (a > 0.02) g += `<path d="M${f(-40 * Math.sqrt(a))},${f(mid - 10 - 60 * a)} L${f(40 * Math.sqrt(a))},${f(mid - 10 - 60 * a)} L4,${mid - 6} L-4,${mid - 6}Z" fill="${sand}"/>`;
    if (k > 0.02) g += `<path d="M-44,-14 C-44,${f(-14 - 70 * k)} -10,${f(-14 - 78 * k)} 0,${f(-14 - 82 * k)} C10,${f(-14 - 78 * k)} 44,${f(-14 - 70 * k)} 44,-14Z" fill="${sand}"/>`;
    if (a > 0.02 && k < 0.98) g += `<path d="M0,${mid} L0,${f(-14 - 82 * k)}" stroke="${sand}" stroke-width="3" opacity="0.9"/>`;
    g += `<path d="M-46,${top + 14} C-46,${mid - 30} -8,${mid - 8} -6,${mid} C-8,${mid + 8} -46,${mid + 30} -46,-14 L46,-14 C46,${mid + 30} 8,${mid + 8} 6,${mid} C8,${mid - 8} 46,${mid - 30} 46,${top + 14}Z" fill="url(#${id})" stroke="#c8d0d4" stroke-width="2.5" stroke-opacity="0.7"/>`;
    g += `<rect x="-60" y="${top}" width="120" height="16" rx="4" fill="#5a3a1e" ${ol(1.3)}/><rect x="-60" y="-16" width="120" height="16" rx="4" fill="#5a3a1e" ${ol(1.3)}/>`;
    for (const sx of [-54, 54]) g += `<rect x="${sx - 5}" y="${top + 14}" width="10" height="${H - 30}" fill="#6a4a26" ${ol(1)}/>`;
    return g + `</g>`;
  };

  // ---------------- the horoscope: a square chart on parchment, the twelve houses, planets, little signs; (x,y) centre.
  // o.doom 0..1 draws the dark planet sinking into one house (ink spreading), o.cross 0..1 a red ink cross beside it
  P.horoscope = (x, y, s, t, o = {}) => {
    const id = uid('hs'), W2 = 230, r = rng(31);
    let g = `<g transform="translate(${f(x)},${f(y)}) rotate(${f(o.rot || 0)}) scale(${f(s)})"><defs><radialGradient id="${id}" cx="0.5" cy="0.5" r="0.75"><stop offset="0" stop-color="#efe0b8"/><stop offset="0.75" stop-color="#d8c290"/><stop offset="1" stop-color="#a88a58"/></radialGradient></defs>`;
    g += `<path d="M${-W2},${-W2 + 8} C${-W2 + 60},${-W2 - 6} ${W2 - 60},${-W2 + 10} ${W2},${-W2} L${W2 + 6},${W2 - 6} C${W2 - 70},${W2 + 8} ${-W2 + 50},${W2 - 4} ${-W2 - 4},${W2 + 4}Z" fill="url(#${id})" ${ol(1.6)}/>`;
    g += `<rect x="${-W2 + 20}" y="${-W2 + 20}" width="${2 * W2 - 40}" height="${2 * W2 - 40}" fill="none" stroke="#5a3a1a" stroke-width="3"/>`;
    g += `<circle r="${W2 - 40}" fill="none" stroke="#5a3a1a" stroke-width="3"/><circle r="${W2 - 90}" fill="none" stroke="#5a3a1a" stroke-width="2.5"/><circle r="${W2 - 160}" fill="#e6d4a4" stroke="#5a3a1a" stroke-width="2"/>`;
    for (let k = 0; k < 12; k++) { const a = k * TAU / 12 + 0.26, c = Math.cos(a), sn = Math.sin(a); g += `<path d="M${f(c * (W2 - 160))},${f(sn * (W2 - 160))} L${f(c * (W2 - 40))},${f(sn * (W2 - 40))}" stroke="#5a3a1a" stroke-width="2"/>`;
      const am = a + TAU / 24, gx = Math.cos(am) * (W2 - 65), gy = Math.sin(am) * (W2 - 65);
      g += `<path d="M${f(gx - 9)},${f(gy + 6)} q9,-20 18,0 M${f(gx - 4)},${f(gy - 4)} l8,0" stroke="#7a2a1a" stroke-width="2.5" fill="none"/>`; }
    for (let k = 0; k < 7; k++) { const a = r() * TAU, rr = W2 - 120 + r() * 26; g += `<circle cx="${f(Math.cos(a) * rr)}" cy="${f(Math.sin(a) * rr)}" r="6" fill="#3a2410"/>`; }
    g += `<path d="M-30,-6 L30,-6 M0,-36 L0,24" stroke="#5a3a1a" stroke-width="2"/><circle r="10" fill="none" stroke="#5a3a1a" stroke-width="2"/>`;
    // the doom: a black planet in the eighth house (the house of death), its ink bleeding, and the red cross
    const dk = o.doom || 0, dA = 8 * TAU / 12 + 0.26 + TAU / 24, dx = Math.cos(dA) * (W2 - 120), dy = Math.sin(dA) * (W2 - 120);
    if (dk > 0) g += `<circle cx="${f(dx)}" cy="${f(dy)}" r="${f(26 * dk)}" fill="#1a0e08" opacity="${f(0.25 * dk)}"/><circle cx="${f(dx)}" cy="${f(dy)}" r="${f(11 * Math.min(1, dk * 2))}" fill="#0e0806"/>`;
    const ck = o.cross || 0;
    if (ck > 0) { const L = 34; g += `<path d="M${f(dx + 30)},${f(dy - 30)} l${f(L * Math.min(1, ck * 2))},${f(L * Math.min(1, ck * 2))}" stroke="#8a1010" stroke-width="7" stroke-linecap="round"/>`; if (ck > 0.5) g += `<path d="M${f(dx + 30 + L)},${f(dy - 30)} l${f(-L * (ck - 0.5) * 2)},${f(L * (ck - 0.5) * 2)}" stroke="#8a1010" stroke-width="7" stroke-linecap="round"/>`; }
    return g + `</g>`;
  };
  P.HOROSCOPE_DOOM = (x, y, s, rot = 0) => { const a = 8 * TAU / 12 + 0.26 + TAU / 24, lx = Math.cos(a) * 110 * s, ly = Math.sin(a) * 110 * s, c = Math.cos(rot * Math.PI / 180), sn = Math.sin(rot * Math.PI / 180); return [x + lx * c - ly * sn, y + lx * sn + ly * c]; };

  // ---------------- the king's purse (world space): a heavy crimson velvet bag, gold coins at its mouth, a gold cord;
  // (x,y) = the knot of the drawstring (where the fist holds it); it swings like a pendulum by o.swing (deg)
  P.purse = (x, y, s, t, o = {}) => {
    const id = uid('pu'), sw = o.swing || 0;
    let g = `<g transform="translate(${f(x)},${f(y)}) rotate(${f(sw)}) scale(${f(s)})"><defs><radialGradient id="${id}" cx="0.35" cy="0.4" r="0.75"><stop offset="0" stop-color="#b02a32"/><stop offset="0.6" stop-color="#7a141c"/><stop offset="1" stop-color="#3a060a"/></radialGradient></defs>`;
    g += `<path d="M-16,4 C-30,24 -86,50 -92,120 C-98,190 -40,214 0,214 C40,214 98,190 92,120 C86,50 30,24 16,4Z" fill="url(#${id})" ${ol(1.8)}/>`;
    g += `<path d="M-60,70 C-20,86 20,86 60,70" stroke="#3a060a" stroke-width="5" fill="none" opacity="0.6"/><path d="M-70,150 C-40,170 30,174 70,150" stroke="#3a060a" stroke-width="4" fill="none" opacity="0.4"/>`;
    for (const [cx, cy, a] of [[-26, 28, -20], [-4, 22, 10], [20, 30, 30], [8, 36, -6]]) g += `<ellipse cx="${cx}" cy="${cy}" rx="17" ry="7" transform="rotate(${a} ${cx} ${cy})" fill="#e8c050" stroke="#6a4410" stroke-width="2"/>`;
    g += `<path d="M-22,12 C-10,4 10,4 22,12" stroke="#c9a040" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M-2,8 C-10,30 -16,50 -12,72 M4,8 C10,30 18,48 16,70" stroke="#c9a040" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    g += `<circle cx="-12" cy="74" r="7" fill="#c9a040" ${ol(1)}/><circle cx="16" cy="72" r="7" fill="#c9a040" ${ol(1)}/><path d="M-50,92 C-60,110 -58,150 -40,170" stroke="#ffffff" stroke-width="7" fill="none" opacity="0.12"/>`;
    return g + `</g>`;
  };
  P.coin = (x, y, s, a = 0) => `<g transform="translate(${f(x)},${f(y)}) rotate(${f(a)}) scale(${f(s)})"><ellipse rx="22" ry="22" fill="#e2b84a" stroke="#6a4410" stroke-width="2.5"/><ellipse rx="15" ry="15" fill="none" stroke="#8a6418" stroke-width="2"/><path d="M-6,-8 L0,-12 L6,-8 L4,6 L-4,6Z" fill="#a87a20"/></g>`;

  // ---------------- the old astrologer's head on its pike above the gate: a dark silhouette against the sky, his
  // tattered pointed cap still on, a rag of his starred robe tied below; rim light from the moon (o.rim)
  P.headPike = (x, y, s, t, o = {}) => {
    const rim = o.rim || '#a8b8e0', sw = Math.sin(t * 1.3) * 3;
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">`;
    g += `<path d="M-7,0 L-7,-420 L7,-420 L7,0Z" fill="#141216"/><path d="M0,-560 L-10,-500 L10,-500Z" fill="#2a2a30"/>`;
    // the rag of starred cloth
    g += `<g transform="rotate(${f(sw)} 0 -420)"><path d="M-6,-420 C-40,-400 -56,-340 -44,-290 C-30,-310 -20,-300 -12,-320 C-6,-300 4,-296 10,-318 C16,-340 12,-390 6,-420Z" fill="#1a1e38"/><circle cx="-28" cy="-340" r="3" fill="#a8904a"/><circle cx="-6" cy="-360" r="2.5" fill="#a8904a"/></g>`;
    // the head in profile, slumped forward on the pike: brow, a long nose, the sagging open jaw, lank hair hanging
    // from the back, the tall cap bent over; all in silhouette with the moon's rim on the crown, brow and nose
    const H = `M10,-430 C40,-430 58,-452 62,-480 C66,-506 60,-528 50,-548 C40,-572 14,-590 -18,-588 C-50,-584 -66,-560 -68,-528 C-70,-500 -64,-478 -60,-470 L-84,-462 L-92,-448 L-80,-440 L-86,-428 L-66,-418 C-58,-404 -48,-396 -34,-398 C-26,-392 -20,-386 -14,-382 C-8,-394 -2,-418 10,-430Z`;
    g += `<path d="${H}" fill="#121014"/>`;
    g += `<path d="M44,-552 C62,-520 70,-480 64,-440 C60,-410 70,-370 66,-330 M30,-560 C50,-520 52,-470 46,-420 C44,-390 52,-360 48,-330 M56,-500 C74,-470 80,-430 76,-390" stroke="#121014" stroke-width="7" fill="none" stroke-linecap="round"/>`;
    g += `<path d="M-64,-552 C-60,-600 -10,-616 40,-600 C70,-640 94,-700 130,-728 C118,-690 112,-650 116,-610 C120,-588 96,-570 60,-566 C10,-560 -30,-556 -64,-552Z" fill="#1a1e36"/><path d="M-72,-552 C-30,-566 30,-570 66,-562" stroke="#2a3050" stroke-width="10" fill="none"/><circle cx="104" cy="-690" r="4" fill="#c8a85a"/><circle cx="20" cy="-590" r="3" fill="#c8a85a"/>`;
    g += `<path d="M-18,-588 C-50,-584 -66,-560 -68,-528 C-70,-500 -64,-478 -60,-470 L-84,-462" stroke="${rim}" stroke-width="5" fill="none" opacity="0.85" stroke-linejoin="round"/>`;
    g += `<path d="M-64,-552 C-60,-600 -10,-616 40,-600 C70,-640 94,-700 130,-728" stroke="${rim}" stroke-width="4" fill="none" opacity="0.75"/><path d="M-66,-418 C-58,-404 -48,-396 -34,-398" stroke="${rim}" stroke-width="3" fill="none" opacity="0.5"/>`;
    g += `<path d="M7,-400 L7,-40" stroke="${rim}" stroke-width="2.5" opacity="0.45"/>`;
    return g + `</g>`;
  };

  // ---------------- a halberd in the grip frame: shaft along x (butt at -x), the axe blade and spike at +x
  P.halberdG = (len = 1500) => `<rect x="${-len * 0.3}" y="-8" width="${len}" height="16" rx="6" fill="#4a3018" ${ol(1.2)}/>` +
    `<path d="M${len * 0.7 - 10},-12 L${len * 0.7 + 110},0 L${len * 0.7 - 10},12Z" fill="#b8bcc0" ${ol(1.1)}/>` +
    `<path d="M${len * 0.7 - 120},-10 C${len * 0.7 - 110},-90 ${len * 0.7 - 30},-110 ${len * 0.7 - 20},-104 C${len * 0.7 - 40},-70 ${len * 0.7 - 40},-40 ${len * 0.7 - 30},-10Z" fill="#a8acb0" ${ol(1.1)}/>` +
    `<path d="M${len * 0.7 - 110},10 L${len * 0.7 - 90},54 L${len * 0.7 - 70},10Z" fill="#a8acb0" ${ol(1)}/><path d="M${len * 0.7 - 118},-6 L${len * 0.7 - 24},-6" stroke="#fff" stroke-width="3" opacity="0.3"/>`;

  // ---------------- the lady's white veil hanging from a fist (world): (x,y) = the fist, cloth falling below it
  P.veil = (x, y, s, t, o = {}) => {
    const sw = Math.sin(t * 1.6) * 6 + (o.lean || 0);
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">`;
    g += `<path d="M-14,0 C-40,60 ${f(-70 + sw)},180 ${f(-60 + sw * 1.4)},300 C${f(-40 + sw)},330 ${f(-10 + sw)},310 ${f(4 + sw)},322 C${f(20 + sw)},300 ${f(50 + sw)},320 ${f(62 + sw * 1.2)},290 C${f(60 + sw)},180 40,60 14,0Z" fill="#f4f0e8" opacity="0.85" stroke="#c8c2b4" stroke-width="2"/>`;
    g += `<path d="M-6,20 C-20,100 ${f(-30 + sw)},200 ${f(-24 + sw)},300 M8,20 C16,110 ${f(24 + sw)},200 ${f(30 + sw)},300" stroke="#d8d2c4" stroke-width="3" fill="none" opacity="0.7"/>`;
    return g + `</g>`;
  };

  // ---------------- two wooden shutters closing across a window opening: x0..x1, y0..y1; k 0 open (folded to the
  // jambs, edge-on) .. 1 shut
  P.shutters = (x0, x1, y0, y1, k) => {
    const w = (x1 - x0) / 2, ww = w * Math.max(0.04, k), id = uid('sh');
    let g = `<defs><linearGradient id="${id}" x1="0" x2="1"><stop offset="0" stop-color="#3a2414"/><stop offset="0.5" stop-color="#5a3a20"/><stop offset="1" stop-color="#2a180c"/></linearGradient></defs>`;
    for (const [ax, dir] of [[x0, 1], [x1, -1]]) {
      const xa = ax, xb = ax + dir * ww;
      g += `<path d="M${f(xa)},${y0} L${f(xb)},${f(y0 + 10 * (1 - k))} L${f(xb)},${f(y1 - 10 * (1 - k))} L${f(xa)},${y1}Z" fill="url(#${id})" ${ol(1.5)}/>`;
      for (let yy = y0 + 60; yy < y1 - 20; yy += 120) g += `<path d="M${f(xa)},${yy} L${f(xb)},${yy}" stroke="#1e1208" stroke-width="5"/>`;
      g += `<path d="M${f(xa + dir * ww * 0.15)},${y0 + 40} L${f(xa + dir * ww * 0.15)},${y1 - 40}" stroke="#2a2a2a" stroke-width="6" opacity="${f(k)}"/>`;
    }
    return g;
  };

  // ---------------- the physician's flask (matula) in the grip frame: held by the neck, bulb below along +y
  P.flaskG = () => `<path d="M-12,-30 L12,-30 L12,10 C60,30 70,100 40,140 C14,170 -14,170 -40,140 C-70,100 -60,30 -12,10Z" fill="#e8e0c0" opacity="0.45" stroke="#c8c8c0" stroke-width="2.5"/>` +
    `<path d="M-46,100 C-40,140 -10,160 0,160 C10,160 40,140 46,100 C20,108 -20,108 -46,100Z" fill="#e0b030" opacity="0.8"/><path d="M-30,60 C-40,80 -40,100 -34,120" stroke="#fff" stroke-width="5" fill="none" opacity="0.5"/>`;

  // ---------------- a goose-quill in the grip frame: nib at -x (down on the page), feather toward +x (thumb side)
  // one feather: a single vane round the shaft (two separate vanes read as a fan of three blades in the fist)
  P.quillG = () => `<path d="M24,0 C60,-30 130,-38 198,-10 C134,14 62,18 24,0Z" fill="#f2ece0" ${ol(1)}/>` +
    `<path d="M70,-12 l26,-16 M110,-16 l26,-14 M150,-16 l22,-10 M80,8 l22,10 M120,6 l24,8" stroke="#cdc4b0" stroke-width="1.6" fill="none"/>` +
    `<path d="M-40,0 L-20,-3 L198,-10 L198,-7 L-20,3Z" fill="#e8e0cc" ${ol(1)}/><path d="M-40,0 L-26,-2 L-26,2Z" fill="#1a1410"/>`;

  // ---------------- a fur stole round a seated person's shoulders (world; (x,y) = the base of the neck): it lies over
  // the shoulders and falls in two broad lapels down the chest, an ermine edge along the opening
  P.furWrap = (x, y, s, t) => {
    const id = uid('fu');
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><defs><linearGradient id="${id}" x1="0" x2="1"><stop offset="0" stop-color="#4a3a2a"/><stop offset="0.45" stop-color="#9a8264"/><stop offset="1" stop-color="#3a2c1e"/></linearGradient></defs>`;
    g += `<path d="M-46,-14 C-130,-10 -210,30 -232,110 C-238,150 -226,190 -214,220 L-110,330 C-90,240 -70,120 -46,40Z M46,-14 C130,-10 210,30 232,110 C238,150 226,190 214,220 L110,330 C90,240 70,120 46,40Z" fill="url(#${id})" ${ol(2)}/>`;
    const r = rng(5); for (let i = 0; i < 46; i++) { const sd = r() > 0.5 ? 1 : -1, px = sd * (60 + r() * 160), py = 10 + r() * 250; g += `<path d="M${f(px)},${f(py)} q${f(4 + r() * 6)},${f(10 + r() * 8)} ${f(-2)},${f(18 + r() * 10)}" stroke="${r() > 0.5 ? '#d8c4a4' : '#2a2016'}" stroke-width="3" fill="none" opacity="0.5"/>`; }
    g += `<path d="M-46,-6 C-70,60 -86,160 -112,320 M46,-6 C70,60 86,160 112,320" stroke="#efe6d4" stroke-width="22" fill="none"/>`;
    for (let i = 0; i < 6; i++) { const k = i / 5; g += `<path d="M${f(-50 - 60 * k)},${f(20 + 280 * k)} l-4,14 M${f(50 + 60 * k)},${f(20 + 280 * k)} l4,14" stroke="#141010" stroke-width="5"/>`; }
    return g + `</g>`;
  };
})(window);
