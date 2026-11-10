// The Radium Girls, part 2 of the sets (2026-11-10): the props and rooms of the shots after the look test - the jar of
// Undark and the company's "harmless" card, a soldier's trench watch and helmet, the shipping crate, the supply desk,
// the dance hall, the washstand, the dentist's chair, the company lab behind its lead glass, the bed, the death
// certificate, the 1927 newspaper with the friends' portraits, the title. The radium glow: S.GLOW (sets26.js).
(function (G) {
  const S = G.SETS, C = G.CINE, { f, rng, ol, shade, mix, uid } = G.RIG, lg = S.lg, TXT = S.TXT, FONT = S.FONT;
  const GLOW = S.GLOW, glow = S.radGlow;
  const lerp = (a, b, u) => a + (b - a) * u, cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));

  // ======================================================= the jar of UNDARK (base centre x, y; s scale; o.lum the
  // paint's glow 0..1; o.dark 0..1 the room's light off, the label then lit only by the paint)
  S.undarkJar = (x, y, s = 1, o = {}) => {
    const lum = o.lum ?? 0.4, dk = o.dark || 0, id = uid('uj');
    const gl = mix('#d8e8c8', '#1c2418', dk), wd = 100, h = 230;
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">`;
    g += `<ellipse cx="0" cy="6" rx="${wd + 16}" ry="18" fill="#000" opacity="0.35" filter="url(#b8)"/>`;
    // the glass: the green paint inside up to its shoulder, the highlights
    g += `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${mix('#7a9a6a', '#1a3014', dk)}"/><stop offset="0.35" stop-color="${mix('#c8e0b0', GLOW, 0.3 + 0.5 * lum)}"/><stop offset="0.7" stop-color="${mix('#a8c890', GLOW, 0.2 + 0.5 * lum)}"/><stop offset="1" stop-color="${mix('#5a7a4a', '#14240e', dk)}"/></linearGradient></defs>`;
    g += `<path d="M${-wd},0 L${-wd},${-h + 40} Q${-wd},${-h + 10} ${-wd + 30},${-h + 6} L${wd - 30},${-h + 6} Q${wd},${-h + 10} ${wd},${-h + 40} L${wd},0Z" fill="url(#${id})" ${ol(1.6)}/>`;
    g += `<path d="M${-wd + 14},-10 L${-wd + 14},${-h + 46}" stroke="#fff" stroke-width="7" opacity="${f(0.35 * (1 - dk) + 0.1)}" stroke-linecap="round"/>`;
    // the stopper: a ground-glass lid with a knob
    g += `<path d="M${-wd + 22},${-h + 6} L${wd - 22},${-h + 6} L${wd - 30},${-h - 14} L${-wd + 30},${-h - 14}Z" fill="${gl}" ${ol(1.3)}/><ellipse cx="0" cy="${-h - 18}" rx="${wd - 30}" ry="10" fill="${shade(gl, 0.1)}" ${ol(1.2)}/><path d="M-18,${-h - 20} Q-18,${-h - 46} 0,${-h - 46} Q18,${-h - 46} 18,${-h - 20}" fill="${gl}" ${ol(1.2)}/>`;
    // the label: cream paper, a radiant sun, UNDARK, the small print
    const lc = mix('#efe6cc', '#2a3022', dk * 0.8), ink = mix('#1a1410', '#a8e080', dk * 0.6);
    g += `<rect x="${-wd + 12}" y="${-h + 60}" width="${2 * wd - 24}" height="132" fill="${lc}" ${ol(1.2)}/><rect x="${-wd + 18}" y="${-h + 66}" width="${2 * wd - 36}" height="120" fill="none" stroke="${ink}" stroke-width="1.6" opacity="0.7"/>`;
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; g += `<path d="M${f(Math.cos(a) * 12)},${f(-h + 92 + Math.sin(a) * 12)} L${f(Math.cos(a) * 22)},${f(-h + 92 + Math.sin(a) * 22)}" stroke="${mix('#b8862e', GLOW, dk)}" stroke-width="2.4"/>`; }
    g += `<circle cx="0" cy="${-h + 92}" r="9" fill="${mix('#d8a040', GLOW, dk)}"/>`;
    g += TXT(0, -h + 140, 38, ink, 'UNDARK', { font: FONT.abril, len: 160 }) + TXT(0, -h + 160, 10.5, ink, 'RADIUM LUMINOUS MATERIAL', { ls: 1, len: 150, w: 'bold' }) + TXT(0, -h + 178, 9, ink, 'U.S. RADIUM CORP. · ORANGE, N.J.', { len: 150 });
    if (lum > 0.02) g += glow(0, -h * 0.5, 220, 0.3 * lum) + glow(0, -h + 20, 120, 0.25 * lum, '#eaffd0');
    return g + `</g>`;
  };
  // the company's card leaning on the jar: PERFECTLY HARMLESS, by hand (x, y its foot)
  S.harmlessCard = (x, y, s = 1, rot = -6) => {
    let g = `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)}) scale(${f(s)})">`;
    g += `<rect x="-86" y="-120" width="172" height="120" fill="#000" opacity="0.3" filter="url(#b4)" transform="translate(6,4)"/><rect x="-86" y="-120" width="172" height="120" fill="#f4ecd8" ${ol(1.3)}/><rect x="-80" y="-114" width="160" height="108" fill="none" stroke="#8a2a1a" stroke-width="1.6"/>`;
    g += TXT(0, -80, 24, '#8a2a1a', 'Perfectly', { font: FONT.script, len: 120 }) + TXT(0, -46, 28, '#1a1410', 'HARMLESS', { font: FONT.abril, len: 140 }) + TXT(0, -22, 10, '#1a1410', '- THE MANAGEMENT -', { ls: 1, len: 120 });
    return g + `</g>`;
  };

  // ======================================================= a soldier's trench watch (x, y the dial's centre; r the dial's
  // radius; lum the numerals' glow): a nickel case, the shrapnel guard over the glass, wire lugs and the leather strap
  S.trenchWatch = (x, y, r, lum = 0.6, o = {}) => {
    const k = o.flat || 1;
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(1,${k})">`;
    for (const sd of [-1, 1]) g += `<path d="M${f(-r * 0.55)},${f(sd * r * 1.02)} L${f(-r * 0.6)},${f(sd * r * 3.2)} L${f(r * 0.6)},${f(sd * r * 3.2)} L${f(r * 0.55)},${f(sd * r * 1.02)}Z" fill="#5a3a1e" ${ol(1.3)}/>` + [0.5, 1.6, 2.4].map(v => `<path d="M${f(-r * 0.5)},${f(sd * r * (1.1 + v * 0.8))} L${f(r * 0.5)},${f(sd * r * (1.1 + v * 0.8))}" stroke="#3a2410" stroke-width="2" opacity="0.6"/>`).join('') + `<path d="M${f(-r * 0.46)},${f(sd * r * 1.06)} L${f(-r * 0.46)},${f(sd * r * 3.1)}" stroke="#8a6a44" stroke-width="2" opacity="0.5"/>`;
    g += `<rect x="${f(-r * 0.32)}" y="${f(r * 2.3)}" width="${f(r * 0.64)}" height="${f(r * 0.34)}" rx="3" fill="none" stroke="#b8b0a0" stroke-width="${f(r * 0.06)}"/>`;
    g += `</g>` + S.dial(x, y, r, 12, lum, { flat: k, case: true }) + `<g transform="translate(${f(x)},${f(y)}) scale(1,${k})">`;
    // the guard: a pierced cover of crossing bars over the glass
    g += `<circle r="${f(r * 1.08)}" fill="none" stroke="#9a9a92" stroke-width="${f(r * 0.07)}"/>`;
    for (const a of [-0.55, 0, 0.55]) g += `<path d="M${f(-r * Math.sqrt(1 - a * a))},${f(r * a)} L${f(r * Math.sqrt(1 - a * a))},${f(r * a)} M${f(r * a)},${f(-r * Math.sqrt(1 - a * a))} L${f(r * a)},${f(r * Math.sqrt(1 - a * a))}" stroke="#8a8a84" stroke-width="${f(r * 0.06)}" opacity="0.92"/>`;
    g += `<rect x="${f(-r * 0.12)}" y="${f(-r * 1.32)}" width="${f(r * 0.24)}" height="${f(r * 0.22)}" fill="#a8a8a0" ${ol(1)}/>`;
    return g + `</g>`;
  };
  // a soldier's steel helmet (the British/American "tin hat"), its crown and wide brim (x, y the brim's centre)
  S.helmet = (x, y, s = 1) => {
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><ellipse cx="10" cy="14" rx="200" ry="48" fill="#000" opacity="0.4" filter="url(#b8)"/>`;
    g += `<ellipse cx="0" cy="0" rx="190" ry="52" fill="#4a4c34" ${ol(1.6)}/><path d="M-120,-6 C-120,-120 120,-120 120,-6 Q0,12 -120,-6Z" fill="#5a5c40" ${ol(1.5)}/>`;
    g += `<path d="M-90,-50 C-60,-92 40,-96 70,-70" stroke="#8a8c68" stroke-width="10" fill="none" opacity="0.5" stroke-linecap="round"/><ellipse cx="0" cy="0" rx="190" ry="52" fill="none" stroke="#2a2c1c" stroke-width="4" opacity="0.6"/>`;
    for (let i = 0; i < 30; i++) { const a = i / 30 * Math.PI * 2; g += `<circle cx="${f(Math.cos(a) * 150)}" cy="${f(Math.sin(a) * 40 - 30)}" r="1.6" fill="#2a2c1c" opacity="0.4"/>`; }
    return g + `</g>`;
  };
  // a wooden shipping crate, its side stencilled (x, y its foot's centre)
  S.crate = (x, y, s = 1) => {
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><rect x="-200" y="-260" width="400" height="260" fill="#8a6a42" filter="url(#woodH)" ${ol(1.6)}/>`;
    for (const yy of [-200, -130, -60]) g += `<path d="M-200,${yy} L200,${yy}" stroke="#4a3418" stroke-width="3"/>`;
    g += `<rect x="-200" y="-260" width="26" height="260" fill="#6a4e2e" ${ol(1)}/><rect x="174" y="-260" width="26" height="260" fill="#6a4e2e" ${ol(1)}/>`;
    g += TXT(0, -176, 30, '#1e1612', 'U.S. RADIUM CORP.', { font: FONT.old, w: 'bold', len: 300, op: 0.85 }) + TXT(0, -120, 40, '#1e1612', 'ORANGE, N.J.', { font: FONT.old, w: 'bold', len: 300, op: 0.85 }) + TXT(0, -72, 16, '#1e1612', 'LUMINOUS DIALS · WAR DEPARTMENT', { len: 300, op: 0.8 });
    return g + `</g>`;
  };

  // ======================================================= the supply desk at the front of the studio: the counter the
  // boss stands behind (its top's far edge y TOP), the shelves of jars and dial boxes behind him
  S.DK = { TOP: 1500, NEAR: 1600 };
  S.supplyBack = (t, o = {}) => {
    const L = S.studioBack(t, o);
    let g = '';
    // the shelves behind the desk (on the wall layer's depth)
    for (const [y0, n] of [[700, 6], [900, 6]]) {
      g += `<rect x="20" y="${y0}" width="1040" height="18" fill="#5a3e24" ${ol(1.3)}/><rect x="20" y="${y0 + 18}" width="1040" height="10" fill="#000" opacity="0.3" filter="url(#b4)"/>`;
      for (let i = 0; i < n; i++) { const x = 90 + i * 170; g += i % 2 ? `<rect x="${x - 60}" y="${y0 - 70}" width="120" height="70" fill="#c8b48e" ${ol(1.2)}/><rect x="${x - 54}" y="${y0 - 52}" width="108" height="24" fill="#8a2a1a" opacity="0.8"/>` + TXT(x, y0 - 34, 12, '#f4e8cc', 'DIALS', { w: 'bold', ls: 2, len: 70 }) : S.undarkJar(x, y0, 0.4, { lum: 0.15 }); }
    }
    L.push({ p: 0.86, svg: `<g filter="url(#dof1)">${g}</g>` });
    return L;
  };
  S.supplyDesk = (t, o = {}) => {
    const { TOP, NEAR } = S.DK;
    let g = `<path d="M-300,${TOP} L1380,${TOP} L1400,${NEAR} L-320,${NEAR}Z" fill="#6a4a2c" filter="url(#woodH)" ${ol(1.3)}/>` + lg('dkTop', [[0, '#000', 0.25], [1, '#fff', 0.06]], 0, 0, 0, 1) + `<path d="M-300,${TOP} L1380,${TOP} L1400,${NEAR} L-320,${NEAR}Z" fill="url(#dkTop)"/>`;
    g += `<rect x="-320" y="${NEAR}" width="1720" height="26" fill="#4a3018" ${ol(1.3)}/><rect x="-320" y="${NEAR + 26}" width="1720" height="600" fill="#3a2614" filter="url(#woodV)"/>`;
    for (const x of [-60, 380, 820]) g += `<rect x="${x}" y="${NEAR + 60}" width="320" height="220" rx="4" fill="none" stroke="#24160a" stroke-width="4"/><rect x="${x + 6}" y="${NEAR + 66}" width="308" height="5" fill="#fff" opacity="0.08"/>`;
    g += lg('dkFr', [[0, '#000', 0.1], [1, '#000', 0.6]]) + `<rect x="-320" y="${NEAR + 26}" width="1720" height="600" fill="url(#dkFr)"/>`;
    // a ledger and a pen on the desk's right
    g += `<path d="M760,${TOP + 30} L1000,${TOP + 22} L1016,${TOP + 76} L770,${TOP + 86}Z" fill="#2a3a4a" ${ol(1.2)}/><path d="M776,${TOP + 34} L996,${TOP + 27}" stroke="#e8e0cc" stroke-width="4"/>`;
    return g;
  };

  // ======================================================= the studio's clock (on the back wall; hours h)
  S.studioClock = (x, y, s, t, h) => G.PROPS.wallClock(x, y, s, t, { hour: h % 12, min: (h % 1) * 60 });

  // ======================================================= THE DANCE HALL (night): a dark hall, the band's stand far
  // back in a warm dim light, paper lanterns strung across, couples dancing as silhouettes
  S.danceBack = (t, o = {}) => {
    const L = [], r = rng(501), k = o.k ?? 1;
    let w = lg('dhBg', [[0, '#07060a'], [0.6, '#120e10'], [1, '#1a1410']], 0, 0, 0, 1) + `<rect x="-900" y="-600" width="2900" height="2900" fill="url(#dhBg)"/>`;
    // the band's stand: a warm pool far back, the players' shapes, a trumpet's glint
    w += C.radial(540, 860, 520, '#ffb070', 0.22) + `<path d="M180,980 L900,980 L940,1040 L140,1040Z" fill="#2a1a10"/>`;
    for (let i = 0; i < 5; i++) { const x = 260 + i * 140, hh = 150 + (i % 2) * 20; w += `<path d="M${x - 30},980 L${x - 26},${980 - hh * 0.62} Q${x},${980 - hh} ${x + 26},${980 - hh * 0.62} L${x + 30},980Z" fill="#0c0806"/><circle cx="${x}" cy="${980 - hh - 12}" r="22" fill="#0c0806"/>`; }
    w += `<path d="M560,880 L640,860" stroke="#ffd890" stroke-width="5" opacity="0.6"/>`;
    // the lanterns on their strings
    for (const [y0, ph] of [[300, 0], [420, 1.3]]) { let d = `M-200,${y0}`; for (let x = -200; x <= 1300; x += 50) d += ` L${x},${f(y0 + 40 * Math.sin((x + 200) / 1500 * Math.PI))}`; w += `<path d="${d}" stroke="#1a1410" stroke-width="2" fill="none"/>`; for (let x = -150; x <= 1250; x += 150) { const yy = y0 + 40 * Math.sin((x + 200) / 1500 * Math.PI) + 26, col = ['#ff9a5a', '#ffd070', '#ff6a5a', '#ffe0a0'][(x / 150 + 10) % 4 | 0]; w += C.radial(x, yy, 70, col, 0.35) + `<ellipse cx="${x}" cy="${f(yy)}" rx="18" ry="24" fill="${col}" opacity="0.85"/>`; } }
    w += `<rect x="-900" y="1040" width="2900" height="1200" fill="#100c0a"/>` + lg('dhFl', [[0, '#3a2818', 0.5], [1, '#000', 0]], 0, 0, 0, 1) + `<rect x="-900" y="1040" width="2900" height="400" fill="url(#dhFl)"/>`;
    L.push({ p: 0.7, svg: `<g filter="url(#dof2)" opacity="${f(k)}">${w}</g>` });
    // the dancing couples (silhouettes): two heads close together, swaying in a slow circle
    let cpl = '';
    for (let i = 0; i < 6; i++) { const x0 = -60 + i * 230 + r() * 60, y0 = 1260 + (i % 2) * 70, s2 = 0.85 + (i % 2) * 0.25, ph2 = t * (1.2 + r() * 0.4) + i; const x = x0 + 30 * Math.sin(ph2), sw = 6 * Math.sin(ph2 * 1.3);
      cpl += `<g transform="translate(${f(x)},${f(y0)}) rotate(${f(sw)}) scale(${f(s2)})"><path d="M-110,0 L-100,-250 Q-80,-300 -40,-310 L40,-310 Q80,-300 100,-250 L110,0Z" fill="#050404"/><circle cx="-34" cy="-350" r="40" fill="#050404"/><circle cx="36" cy="-360" r="44" fill="#050404"/><path d="M-120,0 Q-140,-120 -90,-200 L-20,-200 Q-60,-100 -40,0Z" fill="#0a0808"/></g>`; }
    L.push({ p: 0.9, svg: `<g filter="url(#dof1)" opacity="${f(k)}">${cpl}</g>` });
    return L;
  };

  // ======================================================= THE WASHSTAND: your room in the morning - faded wallpaper, the
  // window's light, a towel on its rail; the porcelain bowl in front of you (its rim y RIM); a tooth on its way down
  S.WS = { RIM: 1560 };
  S.washBack = (t, o = {}) => {
    const L = [], r = rng(521);
    let w = `<rect x="-900" y="-600" width="2900" height="2900" fill="#b8a888"/>`;
    for (let x = -880; x < 2000; x += 90) for (let y = -560; y < 2200; y += 120) w += `<path d="M${x + ((y / 120) % 2 ? 45 : 0)},${y} q8,-14 16,0 q-8,14 -16,0" fill="#9a8a6a" opacity="0.45"/><circle cx="${x + ((y / 120) % 2 ? 45 : 0) + 8}" cy="${y + 20}" r="3" fill="#8a6a4a" opacity="0.4"/>`;
    for (let x = -880; x < 2000; x += 180) w += `<path d="M${x},-600 L${x},2300" stroke="#a89878" stroke-width="10" opacity="0.4"/>`;
    w += `<rect x="760" y="200" width="300" height="560" fill="#f4ead2" ${ol(1.4)}/>` + C.radial(910, 480, 520, '#fff4dc', 0.4) + `<path d="M910,200 L910,760 M760,480 L1060,480" stroke="#6a5a42" stroke-width="10"/>`;
    w += `<path d="M720,180 Q760,480 720,800 L760,800 Q790,480 760,180Z" fill="#c8a8a0" opacity="0.9"/>`;
    w += `<rect x="40" y="600" width="12" height="260" fill="#5a4a32"/><rect x="40" y="600" width="220" height="12" fill="#5a4a32"/><path d="M80,612 L80,820 Q130,840 180,820 L180,612Z" fill="#ece6d8" ${ol(1.2)}/><path d="M80,780 L180,780" stroke="#8a2a2a" stroke-width="6" opacity="0.7"/>`;
    w += lg('wsFall', [[0, '#000', 0.1], [1, '#000', 0.5]], 0, 0, 0, 1) + `<rect x="-900" y="-600" width="2900" height="2900" fill="url(#wsFall)"/>`;
    L.push({ p: 0.8, svg: `<g filter="url(#dof1)">${w}</g>` });
    return L;
  };
  // the bowl (drawn over you): its rim, the white glaze, the teeth that have fallen in it (n, the newest landing at
  // land 0..1), the jug beside it
  S.washBowl = (t, o = {}) => {
    const { RIM } = S.WS, cx = o.cx ?? 540;
    let g = `<rect x="-300" y="${RIM + 40}" width="1680" height="800" fill="#4a3420" filter="url(#woodH)"/><rect x="-300" y="${RIM + 40}" width="1680" height="14" fill="#2a1a0c"/>`;
    g += `<ellipse cx="${cx}" cy="${RIM + 30}" rx="340" ry="74" fill="#000" opacity="0.35" filter="url(#b8)"/>`;
    g += `<path d="M${cx - 300},${RIM} Q${cx - 300},${RIM + 150} ${cx},${RIM + 160} Q${cx + 300},${RIM + 150} ${cx + 300},${RIM}Z" fill="#f2efe8" ${ol(1.6)}/><ellipse cx="${cx}" cy="${RIM}" rx="300" ry="58" fill="#e2ddd2" ${ol(1.5)}/><ellipse cx="${cx}" cy="${RIM + 8}" rx="256" ry="42" fill="#cfc8ba"/>`;
    g += `<path d="M${cx - 284},${RIM + 20} Q${cx - 276},${RIM + 112} ${cx - 160},${RIM + 140}" stroke="#fff" stroke-width="8" fill="none" opacity="0.6"/><ellipse cx="${cx}" cy="${RIM}" rx="300" ry="58" fill="none" stroke="#2a5a7a" stroke-width="5" opacity="0.5"/>`;
    // the teeth lying in the bowl; and the one falling (y from the mouth to the bowl)
    const tooth = (x, y, s2, rot) => `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)}) scale(${f(s2)})"><path d="M-9,-10 Q0,-14 9,-10 L8,2 Q6,14 3,16 Q1,6 0,6 Q-1,6 -3,16 Q-6,14 -8,2Z" fill="#f0eadc" stroke="#6a5a48" stroke-width="1.4"/><path d="M-5,-8 Q0,-10 5,-8" stroke="#fff" stroke-width="2" fill="none"/></g>`;
    for (let i = 0; i < (o.n || 0); i++) g += tooth(cx - 30 + i * 46, RIM + 14 - i * 4, 1.5, [30, -50][i % 2]);
    for (const F of o.falling || []) { const k = cl(F.k); if (k <= 0 || k >= 1) continue; const yy = lerp(F.from[1], RIM + 14, k * k), xx = lerp(F.from[0], F.to, k); g += tooth(xx, yy, 1.5, F.rot * k); }
    g += `<path d="M${cx + 350},${RIM + 20} L${cx + 370},${RIM - 230} Q${cx + 440},${RIM - 280} ${cx + 510},${RIM - 230} L${cx + 530},${RIM + 20}Z" fill="#ece6d8" ${ol(1.5)}/><path d="M${cx + 370},${RIM - 228} Q${cx + 320},${RIM - 250} ${cx + 340},${RIM - 280}" stroke="#ece6d8" stroke-width="14" fill="none"/>`;
    return g;
  };
  S.tooth = (x, y, s2 = 1, rot = 0) => `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)}) scale(${f(s2)})"><path d="M-9,-10 Q0,-14 9,-10 L8,2 Q6,14 3,16 Q1,6 0,6 Q-1,6 -3,16 Q-6,14 -8,2Z" fill="#f0eadc" stroke="#6a5a48" stroke-width="1.4"/><path d="M-5,-8 Q0,-10 5,-8" stroke="#fff" stroke-width="2" fill="none"/></g>`;

  // ======================================================= THE DENTIST'S: the surgery behind you (the cabinet of
  // drawers, the spittoon, the window), the chair's headrest behind your head, the bracket lamp
  S.dentBack = (t, o = {}) => {
    const L = [];
    let w = `<rect x="-900" y="-600" width="2900" height="2900" fill="#c8c4b0"/><rect x="-900" y="1100" width="2900" height="1400" fill="#8a8470"/><rect x="-900" y="1090" width="2900" height="16" fill="#5a5444"/>`;
    w += `<rect x="640" y="380" width="380" height="700" fill="#5a4a34" ${ol(1.4)}/>`;
    for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) w += `<rect x="${660 + j * 120}" y="${400 + i * 110}" width="104" height="94" fill="#6a5840" ${ol(1)}/><circle cx="${712 + j * 120}" cy="${447 + i * 110}" r="6" fill="#c8a860"/>`;
    w += `<rect x="-120" y="160" width="420" height="600" fill="#e8eef0" ${ol(1.4)}/>` + C.radial(90, 460, 500, '#ffffff', 0.35) + `<path d="M90,160 L90,760 M-120,460 L300,460" stroke="#5a5a52" stroke-width="10"/>`;
    w += lg('dnFall', [[0, '#000', 0.05], [1, '#000', 0.45]], 0, 0, 0, 1) + `<rect x="-900" y="-600" width="2900" height="2900" fill="url(#dnFall)"/>`;
    L.push({ p: 0.78, svg: `<g filter="url(#dof2)">${w}</g>` });
    return L;
  };
  // the headrest (behind your head, x, y its centre) and the lamp on its arm (a reflector whose light falls on you)
  S.headrest = (x, y, s = 1) => `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><rect x="-150" y="-130" width="300" height="230" rx="60" fill="#5a2a22" ${ol(1.6)}/><rect x="-128" y="-110" width="256" height="190" rx="48" fill="#6e342a"/><path d="M-110,-90 Q0,-120 110,-90" stroke="#a85a48" stroke-width="8" fill="none" opacity="0.5"/><rect x="-20" y="100" width="40" height="300" fill="#8a8a84" ${ol(1.2)}/></g>`;
  S.dentLamp = (x, y, s = 1, on = 1) => `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><path d="M300,-300 L60,-60" stroke="#6a6a64" stroke-width="16"/><circle cx="60" cy="-60" r="14" fill="#4a4a44"/><path d="M60,-60 L0,0" stroke="#6a6a64" stroke-width="12"/><path d="M-70,-40 Q0,-110 70,-40 Q40,20 0,30 Q-40,20 -70,-40Z" fill="#d8d4c8" ${ol(1.4)}/><ellipse cx="0" cy="-4" rx="50" ry="22" fill="${mix('#8a8a7a', '#fff8e0', on)}"/></g>` + (on > 0.02 ? C.radial(x, y + 20 * s, 380 * s, '#fff4dc', 0.4 * on) : '');
  // the dentist's mouth mirror: a knurled steel handle from A (out of frame) to the little round mirror at B
  S.dentalMirror = (A, B, s = 1) => {
    const dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
    const P = (k, w) => `${f(A[0] + ux * k + nx * w)},${f(A[1] + uy * k + ny * w)}`, sh = L - 40 * s;
    let g = `<path d="M${P(0, 7 * s)} L${P(sh, 4 * s)} L${P(sh, -4 * s)} L${P(0, -7 * s)}Z" fill="#a8acb0" stroke="#2a2c2e" stroke-width="${f(1.2 * s)}"/><path d="M${P(4, -3 * s)} L${P(sh - 4, -2 * s)}" stroke="#f0f2f4" stroke-width="${f(1.8 * s)}" opacity="0.8"/>`;
    for (let k = 20; k < sh * 0.55; k += 9 * s) g += `<path d="M${P(k, 6.5 * s)} L${P(k + 4 * s, -6.5 * s)}" stroke="#5a5c5e" stroke-width="${f(1 * s)}" opacity="0.5"/>`;
    g += `<path d="M${P(sh, 3 * s)} L${P(L - 14 * s, 1.6 * s)} L${P(L - 14 * s, -1.6 * s)} L${P(sh, -3 * s)}Z" fill="#c8ccd0" stroke="#2a2c2e" stroke-width="${f(1 * s)}"/>`;
    g += `<circle cx="${f(B[0])}" cy="${f(B[1])}" r="${f(15 * s)}" fill="#d8dee4" stroke="#2a2c2e" stroke-width="${f(1.6 * s)}"/><circle cx="${f(B[0])}" cy="${f(B[1])}" r="${f(11 * s)}" fill="#8a98a8"/><path d="M${f(B[0] - 7 * s)},${f(B[1] - 4 * s)} q${f(5 * s)},${f(-5 * s)} ${f(10 * s)},${f(-2 * s)}" stroke="#fff" stroke-width="${f(2 * s)}" fill="none"/>`;
    return g;
  };
  // the dentist's extraction forceps: two steel handles from A (out of frame) to the joint, the curved beaks closing
  // on B (open 0..1)
  S.forceps = (A, B, s = 1, open = 0) => {
    const dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
    const P = (k, w) => `${f(A[0] + ux * k + nx * w)},${f(A[1] + uy * k + ny * w)}`, hj = L - 78 * s, sp = 34 * s, bo = (6 + 8 * open) * s;
    let g = '';
    for (const sd of [-1, 1]) {
      const d = `M${P(0, sd * sp)} Q${P(hj * 0.5, sd * sp * 0.9)} ${P(hj, sd * 4 * s)} Q${P(hj + 40 * s, sd * (bo + 6 * s))} ${P(L, sd * bo)}`;
      g += `<path d="${d}" stroke="#1e2022" stroke-width="${f(15 * s)}" fill="none" stroke-linecap="round"/><path d="${d}" stroke="#b8bcc0" stroke-width="${f(10 * s)}" fill="none" stroke-linecap="round"/><path d="${d}" stroke="#f0f2f4" stroke-width="${f(2.5 * s)}" fill="none" opacity="0.7" transform="translate(${f(-nx * 2 * s)},${f(-ny * 2 * s)})"/>`;
    }
    g += `<circle cx="${f(A[0] + ux * hj)}" cy="${f(A[1] + uy * hj)}" r="${f(8 * s)}" fill="#7a7e82" stroke="#1e2022" stroke-width="${f(1.5 * s)}"/>`;
    return g;
  };
  // the piece of jaw (held in his forceps): a curved bar of bone broken at both ends (jagged), stained where it rotted, three
  // molars standing on its upper edge (crowns with cusps, never two round blobs that read as eyes), the paint's faint
  // glow in the bone
  S.jawPiece = (x, y, s = 1, rot = 0, lum = 0.4) => {
    const bone = mix('#d4c8ac', GLOW, 0.18 * lum), dk = '#4a3a26';
    let g = `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)}) scale(${f(s)})">`;
    g += `<ellipse cx="2" cy="30" rx="78" ry="12" fill="#000" opacity="0.3" filter="url(#b4)"/>`;
    g += `<path d="M-72,4 C-58,-8 -24,-12 18,-10 C44,-9 64,-4 74,4 L68,8 L76,13 L70,18 L74,24 C40,30 -16,32 -56,28 L-64,24 L-70,27 L-68,19 L-76,14 L-70,10Z" fill="${bone}" stroke="${dk}" stroke-width="2"/>`;
    g += `<path d="M-60,22 C-20,26 30,24 66,18" stroke="#8a7a5a" stroke-width="2" fill="none" opacity="0.6"/><path d="M-48,14 Q-30,10 -12,13" stroke="#b8a888" stroke-width="2.4" fill="none" opacity="0.8"/>`;
    for (const [sx, sy, rx, ry] of [[-50, 18, 8, 4], [6, 22, 10, 4], [44, 14, 7, 3]]) g += `<ellipse cx="${sx}" cy="${sy}" rx="${rx}" ry="${ry}" fill="#6a5034" opacity="0.55"/>`;
    for (const tx of [-34, -4, 26]) g += `<g transform="translate(${tx},-8)"><path d="M-13,2 L-13,-12 Q-10,-19 -5,-15 Q0,-21 5,-15 Q10,-19 13,-12 L13,2Z" fill="#ece4d0" stroke="${dk}" stroke-width="1.6"/><path d="M-9,-11 Q-5,-14 -1,-11 M3,-11 Q6,-14 9,-11" stroke="#b0a488" stroke-width="1.3" fill="none"/><path d="M-11,-2 L11,-2" stroke="#c8b898" stroke-width="1.2" opacity="0.7"/></g>`;
    return g + `</g>` + (lum > 0.02 ? glow(x, y, 80 * s, 0.25 * lum) : '');
  };

  // ======================================================= THE COMPANY LAB (behind the lead glass): the bench (its top's
  // far edge y TOP), shelves of bottles, the fume hood; the lead "pig" the vial is kept in; the screen's frame and glass
  S.LB = { TOP: 1500, NEAR: 1600 };
  S.labBack = (t, o = {}) => {
    const L = [], r = rng(541);
    let w = `<rect x="-900" y="-600" width="2900" height="2900" fill="#7a7a70"/><rect x="-900" y="1060" width="2900" height="1400" fill="#4a4a44"/>`;
    w += `<rect x="-180" y="200" width="560" height="620" fill="#3a3a36" ${ol(1.4)}/><rect x="-160" y="220" width="520" height="500" fill="#1e2420"/>` + C.radial(100, 480, 320, '#c8e8b0', 0.15) + `<rect x="-180" y="700" width="560" height="22" fill="#5a5a52"/>`;
    for (const y0 of [360, 560, 760]) { w += `<rect x="520" y="${y0}" width="600" height="14" fill="#3a3024" ${ol(1)}/>`; for (let i = 0; i < 9; i++) { const x = 540 + i * 64, h = 60 + r() * 60, c = ['#5a7a8a', '#8a6a3a', '#3a5a3a', '#7a7a7a'][i % 4]; w += `<rect x="${x}" y="${y0 - h}" width="40" height="${f(h)}" rx="6" fill="${c}" opacity="0.85" ${ol(1)}/><rect x="${x + 8}" y="${f(y0 - h * 0.7)}" width="24" height="${f(h * 0.3)}" fill="#e8e0cc" opacity="0.8"/>`; } }
    w += `<rect x="560" y="880" width="260" height="120" fill="#e8dcc0" ${ol(1.3)}/>` + TXT(690, 920, 22, '#8a1a10', 'DANGER', { font: FONT.abril, len: 140 }) + TXT(690, 952, 16, '#1a1410', 'RADIUM', { w: 'bold', ls: 3, len: 110 }) + TXT(690, 980, 12, '#1a1410', 'HANDLE WITH TONGS ONLY', { len: 200 });
    w += lg('lbFall', [[0, '#000', 0.15], [1, '#000', 0.55]], 0, 0, 0, 1) + `<rect x="-900" y="-600" width="2900" height="2900" fill="url(#lbFall)"/>`;
    L.push({ p: 0.8, svg: `<g filter="url(#dof1)">${w}</g>` });
    return L;
  };
  // the bench top and front, the lead pig (open, its lid beside it), racks of vials, a lead brick wall on the bench
  S.labBench = (t, o = {}) => {
    const TOP = o.top ?? S.LB.TOP, NEAR = o.near ?? S.LB.NEAR, pig = o.pig || [420, 1560];
    let g = `<path d="M-300,${TOP} L1380,${TOP} L1400,${NEAR} L-320,${NEAR}Z" fill="#1e1e1c" ${ol(1.3)}/><path d="M-300,${TOP + 4} L1380,${TOP + 4}" stroke="#5a5a56" stroke-width="3" opacity="0.6"/>`;
    g += `<rect x="-320" y="${NEAR}" width="1720" height="700" fill="#3a3a36"/>` + lg('lbFr', [[0, '#000', 0.1], [1, '#000', 0.6]]) + `<rect x="-320" y="${NEAR}" width="1720" height="700" fill="url(#lbFr)"/>`;
    // the low wall of lead bricks the work is done behind
    for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) g += `<rect x="${f(-60 + i * 80 + (j ? 40 : 0))}" y="${TOP + 10 - (j + 1) * 46}" width="80" height="46" fill="#6a6c6e" stroke="#3a3c3e" stroke-width="2"/>`;
    // the lead pig: a heavy grey pot, its lid off and lying beside it
    const [px, py] = pig;
    g += `<ellipse cx="${px}" cy="${py + 4}" rx="80" ry="16" fill="#000" opacity="0.4" filter="url(#b4)"/><path d="M${px - 66},${py} L${px - 70},${py - 110} L${px + 70},${py - 110} L${px + 66},${py}Z" fill="#7a7c7e" ${ol(1.5)}/><ellipse cx="${px}" cy="${py - 110}" rx="70" ry="16" fill="#5a5c5e" ${ol(1.3)}/><ellipse cx="${px}" cy="${py - 110}" rx="34" ry="8" fill="#14140e"/>`;
    g += `<path d="M${px - 58},${py - 12} L${px - 62},${py - 100}" stroke="#a8aaac" stroke-width="6" opacity="0.5"/>`;
    g += `<ellipse cx="${px + 150}" cy="${py - 4}" rx="76" ry="18" fill="#6a6c6e" ${ol(1.3)}/><rect x="${px + 134}" y="${py - 26}" width="32" height="18" rx="4" fill="#5a5c5e" ${ol(1)}/>`;
    // a rack of stoppered vials on the right
    g += `<rect x="860" y="${TOP + 20}" width="280" height="30" fill="#5a3a22" ${ol(1.2)}/>`;
    for (let i = 0; i < 6; i++) g += `<rect x="${874 + i * 44}" y="${TOP - 70}" width="22" height="100" rx="8" fill="#c8d8c8" opacity="0.8" ${ol(1)}/><rect x="${874 + i * 44}" y="${TOP - 82}" width="22" height="16" fill="#6a4a2a"/><rect x="${876 + i * 44}" y="${TOP - 20}" width="18" height="46" rx="6" fill="${mix('#9ab890', GLOW, 0.5)}"/>`;
    g += glow(990, TOP - 10, 160, 0.25);
    return g;
  };
  // the lead pig's mouth (the vial inside it is hidden below this line)
  S.pigMouth = pig => pig[1] - 110;
  // the vial of radium (x, y its centre; held in the tongs' jaws) and the tongs themselves from the fist (F) to the jaws (J)
  S.vial = (x, y, s = 1, lum = 1) => `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><rect x="-13" y="-46" width="26" height="92" rx="10" fill="#d8e8d8" opacity="0.85" ${ol(1.1)}/><rect x="-13" y="-58" width="26" height="16" fill="#6a4a2a" ${ol(1)}/><rect x="-10" y="-6" width="20" height="48" rx="8" fill="${mix('#9ab890', GLOW, 0.9)}"/></g>` + glow(x, y + 18 * s, 120 * s, 0.6 * lum) + glow(x, y + 18 * s, 34 * s, 0.7 * lum, '#eaffd0');
  S.tongs = (F, J, open = 0) => {
    const dx = J[0] - F[0], dy = J[1] - F[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = -uy, ny = ux, sp = 18 + 14 * open;
    const P = (k, w) => `${f(F[0] + ux * k + nx * w)},${f(F[1] + uy * k + ny * w)}`;
    let g = '';
    for (const sd of [-1, 1]) g += `<path d="M${P(-70, sd * 5)} L${P(L * 0.55, sd * 7)} L${P(L - 10, sd * sp)} L${P(L + 6, sd * (sp - 6))}" stroke="#2a2a2a" stroke-width="12" fill="none" stroke-linejoin="round" stroke-linecap="round"/><path d="M${P(-70, sd * 5)} L${P(L * 0.55, sd * 7)} L${P(L - 10, sd * sp)} L${P(L + 6, sd * (sp - 6))}" stroke="#a8aaac" stroke-width="7" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`;
    g += `<circle cx="${f(F[0] + ux * L * 0.55)}" cy="${f(F[1] + uy * L * 0.55)}" r="7" fill="#5a5a5a" ${ol(1)}/>`;
    return g;
  };
  // the screen of lead glass we look through: a thick yellow-green pane with its riveted lead frame round the frame
  S.leadGlass = (t, o = {}) => {
    let g = `<rect x="-400" y="-400" width="1880" height="2720" fill="#c8d0a0" opacity="0.08"/>`;
    g += `<path d="M-400,-400 L1480,-400 L1480,2320 L-400,2320Z M70,170 L1010,170 L1010,1750 L70,1750Z" fill="#3a3c3e" fill-rule="evenodd"/>`;
    g += `<path d="M70,170 L1010,170 L1010,1750 L70,1750Z" fill="none" stroke="#1a1a1c" stroke-width="10"/><path d="M80,180 L1000,180" stroke="#8a8c8e" stroke-width="4" opacity="0.5"/>`;
    for (let i = 0; i < 12; i++) for (const [xx, yy] of [[30 + 0, 200 + i * 130], [1050, 200 + i * 130]]) g += `<circle cx="${xx}" cy="${yy}" r="8" fill="#6a6c6e" ${ol(1)}/>`;
    for (let i = 0; i < 8; i++) for (const yy of [120, 1800]) g += `<circle cx="${120 + i * 120}" cy="${yy}" r="8" fill="#6a6c6e" ${ol(1)}/>`;
    // reflections on the glass
    g += `<path d="M200,170 L460,170 L160,1750 L-100,1750Z" fill="#ffffff" opacity="0.05"/><path d="M600,170 L660,170 L360,1750 L300,1750Z" fill="#ffffff" opacity="0.06"/>`;
    return g;
  };

  // ======================================================= THE BED: your pillow (you lie with your head on it), the quilt
  // over you to the chin, the iron bedhead; the oil lamp on the night table (lamp 0..1 its flame)
  S.bedBack = (t, o = {}) => {
    const L = [];
    let w = `<rect x="-900" y="-600" width="2900" height="2900" fill="#4a3e34"/>`;
    for (let x = -880; x < 2000; x += 120) w += `<path d="M${x},-600 L${x},2300" stroke="#5a4c40" stroke-width="40" opacity="0.4"/>`;
    w += lg('bdFall', [[0, '#000', 0.2], [1, '#000', 0.6]], 0, 0, 0, 1) + `<rect x="-900" y="-600" width="2900" height="2900" fill="url(#bdFall)"/>`;
    L.push({ p: 0.85, svg: `<g filter="url(#dof1)">${w}</g>` });
    return L;
  };
  S.pillow = (x, y, s = 1) => `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><path d="M-420,-200 Q-460,0 -420,220 Q0,260 420,220 Q460,0 420,-200 Q0,-240 -420,-200Z" fill="#e8e2d4" ${ol(1.6)}/><path d="M-380,-150 Q-200,-60 -300,150 M300,-160 Q200,0 340,160 M-100,-190 Q0,-140 100,-190" stroke="#b8b0a0" stroke-width="5" fill="none" opacity="0.6"/></g>`;
  S.quilt = (x, y, s = 1, col = '#7a3a34') => {
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><path d="M-700,0 Q-200,-40 0,-30 Q200,-40 700,0 L700,1400 L-700,1400Z" fill="${col}" ${ol(1.6)}/>`;
    g += `<path d="M-700,0 Q-200,-40 0,-30 Q200,-40 700,0 L700,70 Q0,40 -700,70Z" fill="#ece6d8" ${ol(1.3)}/>`;
    for (let i = -6; i <= 6; i++) g += `<path d="M${i * 110},60 L${i * 110 + i * 10},1400" stroke="${shade(col, -0.35)}" stroke-width="3" opacity="0.5"/>`;
    for (let j = 1; j < 8; j++) g += `<path d="M-700,${60 + j * 170} Q0,${40 + j * 170} 700,${60 + j * 170}" stroke="${shade(col, -0.35)}" stroke-width="3" opacity="0.5"/>`;
    return g + `</g>`;
  };
  S.oilLamp = (x, y, s = 1, flame = 1, t = 0) => {
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><ellipse cx="0" cy="0" rx="70" ry="18" fill="#6a4a2a" ${ol(1.3)}/><path d="M-50,-10 Q-70,-80 0,-90 Q70,-80 50,-10Z" fill="#8a6a3a" ${ol(1.3)}/><path d="M-26,-90 L-30,-120 L30,-120 L26,-90Z" fill="#5a4a2a" ${ol(1.2)}/>`;
    g += `<path d="M-30,-120 Q-46,-200 -24,-280 L24,-280 Q46,-200 30,-120Z" fill="#e8f0e8" opacity="0.35" ${ol(1.2)}/>`;
    if (flame > 0.01) { const fl = 1 + 0.06 * Math.sin(t * 23) + 0.04 * Math.sin(t * 37); g += `<path d="M0,-128 Q-14,${f(-150 - 20 * flame * fl)} 0,${f(-170 - 40 * flame * fl)} Q14,${f(-150 - 20 * flame * fl)} 0,-128Z" fill="#ffd070" opacity="${f(flame)}"/>`; }
    g += `</g>`;
    if (flame > 0.01) g += C.radial(x, y - 160 * s, 600 * s, '#ffb060', 0.45 * flame);
    return g;
  };

  // ======================================================= THE DEATH CERTIFICATE (x, y its centre; stamp 0..1 the word
  // SYPHILIS stamped across the cause of death; the paper W x H)
  S.CERT = { W: 820, H: 1120 };
  S.certificate = (x, y, s = 1, rot = 0, o = {}) => {
    const { W, H } = S.CERT, r = rng(561), ink = '#1e1a16', st = o.stamp || 0;
    let g = `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)}) scale(${f(s)})">`;
    g += `<rect x="${-W / 2 + 20}" y="${-H / 2 + 26}" width="${W}" height="${H}" fill="#000" opacity="0.45" filter="url(#b14)"/>`;
    g += lg('ctP', [[0, '#ede4cc'], [1, '#ddd0b0']], 0, 0, 1, 1) + `<rect x="${-W / 2}" y="${-H / 2}" width="${W}" height="${H}" fill="url(#ctP)" ${ol(1.3)}/><rect x="${-W / 2 + 24}" y="${-H / 2 + 24}" width="${W - 48}" height="${H - 48}" fill="none" stroke="${ink}" stroke-width="2.4"/><rect x="${-W / 2 + 32}" y="${-H / 2 + 32}" width="${W - 64}" height="${H - 64}" fill="none" stroke="${ink}" stroke-width="1"/>`;
    g += TXT(0, -H / 2 + 100, 26, ink, 'STATE OF NEW JERSEY', { font: FONT.old, w: 'bold', ls: 4, len: 420 }) + TXT(0, -H / 2 + 160, 40, ink, 'Certificate and Record of Death', { font: FONT.play, it: true, len: 640 });
    g += `<path d="M${-W / 2 + 60},${-H / 2 + 190} L${W / 2 - 60},${-H / 2 + 190}" stroke="${ink}" stroke-width="2"/>`;
    const row = (y, label, val, hand = true) => TXT(-W / 2 + 70, y, 20, ink, label, { font: FONT.old, a: 'start' }) + `<path d="M${-W / 2 + 70 + label.length * 10.5 + 16},${y + 6} L${W / 2 - 70},${y + 6}" stroke="${ink}" stroke-width="1" opacity="0.6"/>` + (val ? TXT(-W / 2 + 90 + label.length * 10.5 + 30, y - 2, 30, '#22304a', val, { font: hand ? FONT.script : FONT.old, a: 'start' }) : '');
    g += row(-H / 2 + 260, 'Place of death:', 'Orange, Essex County') + row(-H / 2 + 330, 'Full name:', '') + row(-H / 2 + 400, 'Sex:', 'Female') + row(-H / 2 + 470, 'Occupation:', 'Dial painter') + row(-H / 2 + 540, 'Age:', '24 years') + row(-H / 2 + 610, 'Date of death:', '1922');
    g += TXT(-W / 2 + 70, -H / 2 + 700, 22, ink, 'THE CAUSE OF DEATH WAS AS FOLLOWS:', { font: FONT.old, w: 'bold', a: 'start', len: 470 });
    for (let i = 0; i < 3; i++) g += `<path d="M${-W / 2 + 70},${-H / 2 + 780 + i * 60} L${W / 2 - 70},${-H / 2 + 780 + i * 60}" stroke="${ink}" stroke-width="1" opacity="0.6"/>`;
    g += TXT(W / 2 - 220, H / 2 - 90, 26, '#22304a', 'J. Hartley, M.D.', { font: FONT.script, len: 220 }) + `<path d="M${W / 2 - 330},${H / 2 - 80} L${W / 2 - 80},${H / 2 - 80}" stroke="${ink}" stroke-width="1"/>`;
    // the stamp: SYPHILIS in red, landing (scale from big to its size, ink squashed out at the edges)
    if (st > 0) { const k = cl(st), sc = 1 + 0.6 * (1 - k) * (1 - k), op = cl(k * 3); const cy = -H / 2 + 800;
      g += `<g transform="translate(0,${cy}) rotate(-7) scale(${f(sc)})" opacity="${f(op)}"><rect x="-260" y="-64" width="520" height="128" rx="8" fill="none" stroke="#a81c14" stroke-width="10"/><rect x="-246" y="-50" width="492" height="100" rx="4" fill="none" stroke="#a81c14" stroke-width="3"/>` + TXT(0, 30, 84, '#a81c14', 'SYPHILIS', { font: FONT.abril, len: 440 }) + `</g>`;
      g += `<rect x="-300" y="${cy - 90}" width="600" height="180" fill="#ede4cc" opacity="${f(0.25 * (1 - k))}" filter="url(#tex)"/>`; }
    return g + `</g>`;
  };

  // ======================================================= THE 1927 NEWSPAPER: the masthead, the date, the headline and
  // the portraits (o.portraits: svg drawn in two oval frames in the middle columns - the friends)
  S.NP27 = { W: 900, H: 1240 };
  S.paper1927 = (x, y, s = 1, rot = 0, o = {}) => {
    const { W, H } = S.NP27, r = rng(581), ink = '#14100c';
    let g = `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)}) scale(${f(s)})">`;
    g += `<rect x="${-W / 2 + 18}" y="${-H / 2 + 26}" width="${W}" height="${H}" fill="#000" opacity="0.45" filter="url(#b14)"/>`;
    g += lg('n27P', [[0, '#e4d8bc'], [0.5, '#dccfb0'], [1, '#d0c09c']], 0, 0, 1, 1) + `<rect x="${-W / 2}" y="${-H / 2}" width="${W}" height="${H}" fill="url(#n27P)" ${ol(1.2)}/>`;
    const X0 = -W / 2 + 40, X1 = W / 2 - 40, Y0 = -H / 2;
    g += TXT(0, Y0 + 92, 62, ink, 'The Orange Daily Courier', { font: FONT.script, len: 680 });
    g += `<path d="M${X0},${Y0 + 112} L${X1},${Y0 + 112} M${X0},${Y0 + 140} L${X1},${Y0 + 140}" stroke="${ink}" stroke-width="2.4"/>` + TXT(0, Y0 + 131, 15, ink, 'ORANGE, NEW JERSEY, FRIDAY EVENING, JUNE 10, 1927 · PRICE TWO CENTS', { font: FONT.old, len: 720 });
    g += TXT(0, Y0 + 250, 104, '#0e0a08', 'DIAL PAINTERS', { font: FONT.abril, len: 800 }) + TXT(0, Y0 + 360, 104, '#0e0a08', 'DYING', { font: FONT.abril, len: 420 });
    g += `<path d="M${X0},${Y0 + 390} L${X1},${Y0 + 390}" stroke="${ink}" stroke-width="2"/>`;
    g += TXT(0, Y0 + 428, 28, ink, 'RADIUM POISON SUSPECTED IN DEATHS OF FACTORY GIRLS', { font: FONT.play, w: 'bold', len: 780 }) + TXT(0, Y0 + 462, 20, ink, 'Bodies of Former Workers to be Exhumed · Company Denies All Blame', { font: FONT.old, it: true, len: 640 });
    g += `<path d="M${X0},${Y0 + 482} L${X1},${Y0 + 482}" stroke="${ink}" stroke-width="1.2"/>`;
    const cols = 4, cw = (X1 - X0) / cols;
    for (let c = 0; c < cols; c++) { const cx0 = X0 + c * cw + 8, cx1 = X0 + (c + 1) * cw - 8; if (c) g += `<path d="M${X0 + c * cw},${Y0 + 500} L${X0 + c * cw},${H / 2 - 40}" stroke="${ink}" stroke-width="1"/>`; for (let yy = Y0 + 510; yy < H / 2 - 50; yy += 14) { if ((c === 1 || c === 2) && yy > Y0 + 520 && yy < Y0 + 860) continue; g += `<path d="M${cx0},${yy} L${f(cx1 - r() * 30)},${yy}" stroke="${ink}" stroke-width="5" opacity="0.32"/>`; } }
    // the two portraits with their captions
    const pw = 150, ph = 190;
    [[X0 + cw * 1.5 - 4, 'MISS M. -, 21'], [X0 + cw * 2.5 + 4, 'MISS K. -, 23']].forEach(([cx, cap], i) => {
      const cy = Y0 + 680;
      g += `<defs><clipPath id="n27c${i}"><ellipse cx="${f(cx)}" cy="${cy}" rx="${pw / 2}" ry="${ph / 2}"/></clipPath></defs><ellipse cx="${f(cx)}" cy="${cy}" rx="${pw / 2 + 6}" ry="${ph / 2 + 6}" fill="${ink}"/><ellipse cx="${f(cx)}" cy="${cy}" rx="${pw / 2}" ry="${ph / 2}" fill="#b8a888"/>`;
      if (o.portraits && o.portraits[i]) g += `<g clip-path="url(#n27c${i})"><g filter="url(#n27sep)">${o.portraits[i](cx, cy)}</g></g>`;
      g += TXT(cx, cy + ph / 2 + 34, 14, ink, cap, { font: FONT.old, w: 'bold', len: 120 });
      if (o.ribbon) g += `<path d="M${f(cx + pw / 2 - 36)},${cy - ph / 2 - 6} L${f(cx + pw / 2 + 6)},${cy - ph / 2 + 36}" stroke="#0a0806" stroke-width="16" opacity="${f(o.ribbon)}"/>`;
    });
    g += `<defs><filter id="n27sep" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0.36 0.62 0.16 0 0  0.32 0.56 0.14 0 0  0.25 0.44 0.11 0 0  0 0 0 1 0"/></filter></defs>`;
    g += `<rect x="${-W / 2}" y="${-H / 2}" width="${W}" height="${H}" fill="#000" opacity="0.05" filter="url(#tex)"/>`;
    return g + `</g>`;
  };

  // ======================================================= THE TITLE (the hold at the end): THE RADIUM GIRLS, glowing
  S.title = (cx, cy, k = 1, t = 0) => {
    if (k <= 0.001) return '';
    const fl = 0.92 + 0.08 * Math.sin(t * 3.1);
    let g = `<g opacity="${f(cl(k))}">`;
    g += glow(cx, cy - 20, 520, 0.22 * k * fl) + `<g filter="url(#b8)" opacity="0.8">` + TXT(cx, cy - 70, 54, GLOW, 'THE', { font: FONT.abril, ls: 14, len: 200 }) + TXT(cx, cy + 50, 132, GLOW, 'RADIUM GIRLS', { font: FONT.abril, len: 900 }) + `</g>`;
    g += TXT(cx, cy - 70, 54, '#eaffd8', 'THE', { font: FONT.abril, ls: 14, len: 200 }) + TXT(cx, cy + 50, 132, '#eaffd8', 'RADIUM GIRLS', { font: FONT.abril, len: 900 });
    g += TXT(cx, cy + 110, 24, '#b8d8a0', 'ORANGE, NEW JERSEY · 1917 - 1927', { font: FONT.old, ls: 4, len: 560 });
    return g + `</g>`;
  };
})(window);
