// Sets for "The First Vaccine" (Gloucestershire, 1796): the doctor's surgery (window onto the plague street, shelves of
// specimen jars, a long-case clock), the plague street, the cow barn, your sickroom with its day-and-night window,
// the dying man's hovel, the world inside your blood, and the doctor's desk. Something always moves.
(function (G) {
  const S = G.SETS, { f, shade, mix, rng, uid, ol } = G.RIG, C = G.CINE, E = G.ENV, PR = G.PROPS;
  const lg = S.lg;
  const lerp = (a, b, t) => a + (b - a) * t, cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const fl = (t, seed) => 0.86 + 0.08 * Math.sin(t * 9 + seed) + 0.06 * Math.sin(t * 23 + seed * 2);

  // ======================================================= the surgery
  // world (p 1): floor 1780; the chair centred at x 400 (seat top 1520); the arm board to x 684 and the baize-covered
  // table x 690..1440 share the top line 1345. The back wall is a p 0.78 layer: the window x 70..430, y 330..900.
  S.SG = { FLOOR: 1780, CX: 400, SEAT: 1520, YS: 0.86, TOP: 1345, TABLE: [690, 1440], WIN: [70, 330, 430, 900], WP: 0.78, CANDLE: [1180, 1240] };
  const SG = S.SG;
  // a timber-framed house front: whitewash between dark oak, a jettied upper floor, leaded windows, a plank door
  // (o.cross paints a red cross on it), a stone plinth. x0..x1, ground y, height h
  const facade = (x0, x1, y, h, seed, o = {}) => {
    const r = rng(seed), w = x1 - x0, wall = o.wall || '#cfc6b2', tim = o.tim || '#2a1c12', jet = y - h * 0.48, dk = o.dark || 0;
    let g = `<rect x="${x0}" y="${f(y - h)}" width="${w}" height="${f(h)}" fill="${wall}" filter="url(#plaster)"/>`;
    g += `<rect x="${x0}" y="${f(y - h * 0.16)}" width="${w}" height="${f(h * 0.16)}" fill="#7a7266" filter="url(#tex)"/>` + [0.3, 0.62].map(k => `<path d="M${x0},${f(y - h * 0.16 * k)} L${x1},${f(y - h * 0.16 * k)}" stroke="#4a443c" stroke-width="2" opacity="0.6"/>`).join('');
    const bw = Math.max(8, w * 0.035);
    // posts, rails and braces
    for (let i = 0; i <= 4; i++) { const x = x0 + w * i / 4; g += `<path d="M${f(x)},${f(y - h)} L${f(x)},${f(y - h * 0.16)}" stroke="${tim}" stroke-width="${f(bw)}"/>`; }
    for (const k of [1, 0.74, 0.5, 0.46, 0.24]) g += `<path d="M${x0},${f(y - h * k)} L${x1},${f(y - h * k)}" stroke="${tim}" stroke-width="${f(bw * (k === 0.48 ? 1.3 : 1))}"/>`;
    for (let i = 0; i < 4; i++) { const xa = x0 + w * i / 4, xb = x0 + w * (i + 1) / 4; if (i % 2) g += `<path d="M${f(xa)},${f(y - h * 0.74)} L${f(xb)},${f(y - h)}" stroke="${tim}" stroke-width="${f(bw * 0.8)}"/>`; else g += `<path d="M${f(xa)},${f(y - h)} L${f(xb)},${f(y - h * 0.74)}" stroke="${tim}" stroke-width="${f(bw * 0.8)}"/>`; }
    g += `<rect x="${x0 - 10}" y="${f(jet - 14)}" width="${w + 20}" height="22" fill="${tim}"/><rect x="${x0 - 10}" y="${f(jet + 8)}" width="${w + 20}" height="18" fill="#000" opacity="0.25" filter="url(#b4)"/>`;
    // leaded windows upstairs and down
    const win = (wx, wy, ww, wh, lit) => { let q = `<rect x="${f(wx)}" y="${f(wy)}" width="${f(ww)}" height="${f(wh)}" fill="${lit ? '#d8a860' : '#2a2e30'}" ${ol(1.4)}/>`; for (let k = -6; k < 8; k++) q += `<path d="M${f(wx + k * ww / 5)},${f(wy)} l${f(wh * 0.6)},${f(wh)} M${f(wx + k * ww / 5 + wh * 0.6)},${f(wy)} l${f(-wh * 0.6)},${f(wh)}" stroke="#141414" stroke-width="1.5" opacity="0.7"/>`; return `<g>${q}<rect x="${f(wx)}" y="${f(wy)}" width="${f(ww)}" height="${f(wh)}" fill="none" stroke="${tim}" stroke-width="${f(bw * 0.7)}"/><rect x="${f(wx + 3)}" y="${f(wy + 3)}" width="${f(ww * 0.3)}" height="${f(wh - 6)}" fill="#fff" opacity="0.08"/></g>`; };
    g += win(x0 + w * 0.1, y - h * 0.7, w * 0.3, h * 0.17, false) + win(x0 + w * 0.6, y - h * 0.7, w * 0.3, h * 0.17, o.lit);
    if (o.door !== false) { const dx = x0 + w * (o.doorAt ?? 0.55), dw = w * 0.24, dh = h * 0.36;
      g += `<rect x="${f(dx)}" y="${f(y - dh)}" width="${f(dw)}" height="${f(dh)}" fill="${o.open ? '#0e0806' : '#4a3020'}" ${ol(1.6)}/>`;
      if (!o.open) g += [0.25, 0.5, 0.75].map(k => `<path d="M${f(dx + dw * k)},${f(y - dh)} l0,${f(dh)}" stroke="#2a1a0e" stroke-width="2"/>`).join('') + `<circle cx="${f(dx + dw * 0.8)}" cy="${f(y - dh * 0.5)}" r="${f(Math.max(3, w * 0.008))}" fill="#1a1a1a"/>`;
      if (o.cross) g += `<path d="M${f(dx + dw / 2)},${f(y - dh * 0.88)} L${f(dx + dw / 2)},${f(y - dh * 0.3)} M${f(dx + dw * 0.18)},${f(y - dh * 0.66)} L${f(dx + dw * 0.82)},${f(y - dh * 0.66)}" stroke="#9a1a12" stroke-width="${f(dw * 0.12)}" stroke-linecap="round" opacity="0.9" filter="url(#inkF)"/>`;
      g += `<rect x="${f(dx - 8)}" y="${f(y - dh - 12)}" width="${f(dw + 16)}" height="14" fill="${tim}"/>`; }
    if (o.win2 !== false) g += win(x0 + w * 0.08, y - h * 0.4, w * 0.36, h * 0.16, o.lit);
    // weathering: streaks of damp and a green stain at the foot
    for (let i = 0; i < 6; i++) { const sx = x0 + r() * w; g += `<path d="M${f(sx)},${f(y - h * (0.3 + r() * 0.5))} l${f(r() * 6 - 3)},${f(h * 0.2)}" stroke="#5a5040" stroke-width="${f(4 + r() * 6)}" opacity="0.15" filter="url(#b4)"/>`; }
    g += `<rect x="${x0}" y="${f(y - h * 0.08)}" width="${w}" height="${f(h * 0.08)}" fill="#3a4a2a" opacity="0.25" filter="url(#b4)"/>`;
    // the eave and thatch/tile line above
    g += `<path d="M${x0 - 30},${f(y - h)} L${x1 + 30},${f(y - h)} L${x1 + 10},${f(y - h - h * 0.22)} L${x0 - 10},${f(y - h - h * 0.22)}Z" fill="${o.roof || '#5a4a3a'}" filter="url(#tex)"/><path d="M${x0 - 30},${f(y - h)} L${x1 + 30},${f(y - h)}" stroke="#1a1410" stroke-width="6"/>`;
    if (dk) g += `<rect x="${x0 - 40}" y="${f(y - h * 1.3)}" width="${w + 80}" height="${f(h * 1.3)}" fill="#141822" opacity="${f(dk)}" style="mix-blend-mode:multiply"/>`;
    return g;
  };
  S.facade = facade;
  // the street seen through the window: grey sky, the house opposite with a red cross on its door, a cart with a shrouded
  // body crossing slowly, smoke from burning bedding
  const winView = (t, x0, y0, x1, y1) => {
    const w = x1 - x0, h = y1 - y0;
    let g = `${lg('wvs', [[0, '#8e969c'], [0.6, '#b8bab4'], [1, '#d2cec0']])}<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="url(#wvs)"/>`;
    g += E.cloud(x0 + 80 + t * 4, y0 + 120, 260, 70, 3, { body: '#9a9ea2', lit: '#c8c8c4', dark: '#6a7076', op: 0.8 });
    g += `<path d="M${x0},${y0 + h * 0.42} L${x0 + w * 0.2},${y0 + h * 0.36} L${x0 + w * 0.32},${y0 + h * 0.4} L${x0 + w * 0.5},${y0 + h * 0.3} L${x0 + w * 0.7},${y0 + h * 0.38} L${x1},${y0 + h * 0.34} L${x1},${y1} L${x0},${y1}Z" fill="#6a6a66"/>`;
    g += E.smoke(x0 + w * 0.3, y0 + h * 0.36, 160, 5 + Math.floor(t * 0.8) % 3, '#7a7672', 0.45);
    g += facade(x0 - 40, x1 + 40, y0 + h * 1.02, h * 0.6, 11, { cross: true, doorAt: 0.42, lit: false, win2: false });
    g += `<rect x="${x0}" y="${y0 + h * 0.92}" width="${w}" height="${h * 0.1}" fill="#5a5044"/>`;
    // the cart passes right to left, a man in a hat pulling it
    const cx = x1 + 140 - ((t * 38) % (w + 420));
    g += `<g transform="translate(${f(cx)},${f(y0 + h * 0.97)}) scale(0.32)">${cartArt(t, 0.4)}</g>`;
    g += `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="#c8d0d4" opacity="0.22"/>`;
    return g;
  };
  // the body cart (side view): two spoked wheels, plank bed, two shrouded bodies, the shafts, a man pulling (local units)
  const cartArt = (t, roll) => {
    let g = '';
    const wheel = (wx) => { let w2 = `<circle cx="${wx}" cy="-120" r="118" fill="none" stroke="#2a1a0e" stroke-width="16"/><circle cx="${wx}" cy="-120" r="20" fill="#2a1a0e"/>`; for (let i = 0; i < 10; i++) { const a = i / 10 * 6.28 + t * roll; w2 += `<path d="M${wx},-120 L${f(wx + Math.cos(a) * 112)},${f(-120 + Math.sin(a) * 112)}" stroke="#3a2614" stroke-width="8"/>`; } return w2; };
    g += `<path d="M-300,-250 L300,-250 L300,-200 L-300,-200Z" fill="#5a3a20" ${ol(2)}/><path d="M-300,-250 L-300,-330 M300,-250 L300,-330" stroke="#4a2e18" stroke-width="12"/>`;
    g += `<path d="M-280,-252 C-270,-320 -60,-330 -20,-300 C10,-330 220,-330 270,-252Z" fill="#d8d0bc" ${ol(2)}/><path d="M-250,-262 C-150,-300 -60,-300 -30,-280 M0,-280 C60,-310 180,-300 250,-262" stroke="#9a9280" stroke-width="5" fill="none"/>`;
    g += `<path d="M-160,-300 L-170,-270 M-120,-306 L-128,-268 M120,-308 L114,-266" stroke="#7a7262" stroke-width="7"/>`;
    g += wheel(-120) + wheel(170);
    g += `<path d="M-300,-226 L-560,-190" stroke="#4a2e18" stroke-width="14"/>`;
    // the carter, bent forward
    g += `<g fill="#2a2420"><path d="M-600,-196 C-620,-300 -610,-420 -560,-480 L-500,-470 C-490,-400 -520,-300 -540,-196Z"/><circle cx="-540" cy="-520" r="42"/><path d="M-600,-540 L-480,-540 L-500,-570 L-580,-570Z"/><path d="M-590,-196 L-610,0 M-540,-196 L-520,0" stroke="#2a2420" stroke-width="30"/></g>`;
    return g;
  };
  S.cartArt = cartArt;

  S.surgery = (t, o = {}) => {
    const L = [], k = fl(t, 5), [wx0, wy0, wx1, wy1] = SG.WIN, dim = o.dim || 0;
    // back wall: limewashed plaster above an oak wainscot; the window, an engraving, the shelves, the clock
    let w = `<rect x="-900" y="-400" width="3400" height="2400" fill="#b8aa8e" filter="url(#plaster)"/>`;
    const rs = rng(5); for (let i = 0; i < 9; i++) { const sx = -800 + rs() * 3200, sy = -200 + rs() * 1000; w += `<ellipse cx="${f(sx)}" cy="${f(sy)}" rx="${f(80 + rs() * 160)}" ry="${f(60 + rs() * 120)}" fill="#7a6a4e" opacity="0.12" filter="url(#b14)"/>`; }
    for (let i = 0; i < 5; i++) { const sx = -700 + rs() * 3000, sy = 100 + rs() * 700; w += `<path d="M${f(sx)},${f(sy)} l${f(rs() * 30 - 15)},${f(30 + rs() * 40)} l${f(rs() * 30 - 15)},${f(20 + rs() * 30)}" stroke="#5a4a36" stroke-width="2" fill="none" opacity="0.5"/>`; }
    // the beam along the ceiling
    w += `<rect x="-900" y="60" width="3400" height="90" fill="#3a2414" filter="url(#woodH)"/><rect x="-900" y="150" width="3400" height="30" fill="#000" opacity="0.25" filter="url(#b8)"/>`;
    // wainscot: raised and fielded panels, chair rail, skirting
    w += `<rect x="-900" y="1110" width="3400" height="700" fill="#4a2c16" filter="url(#woodV)"/>`;
    for (let x = -880; x < 2500; x += 230) w += `<rect x="${x + 20}" y="1160" width="190" height="320" rx="4" fill="#5a3820" ${ol(1.4)}/><path d="M${x + 20},1160 L${x + 50},1190 L${x + 180},1190 L${x + 210},1160" fill="#7a5030" opacity="0.6"/><path d="M${x + 20},1480 L${x + 50},1450 L${x + 180},1450 L${x + 210},1480" fill="#2a180a" opacity="0.5"/><rect x="${x + 50}" y="1190" width="130" height="260" fill="#6a4426" opacity="0.6"/>`;
    w += `<rect x="-900" y="1096" width="3400" height="28" fill="#6a4426" ${ol(1.3)}/><rect x="-900" y="1096" width="3400" height="6" fill="#fff" opacity="0.12"/><rect x="-900" y="1500" width="3400" height="60" fill="#2a180a"/>`;
    // the sash window: deep reveal, frame, twelve panes, sill, the view, reflections; a damask curtain tied back
    w += `<rect x="${wx0 - 46}" y="${wy0 - 46}" width="${wx1 - wx0 + 92}" height="${wy1 - wy0 + 92}" fill="#8a7a60" ${ol(1.5)}/><path d="M${wx0 - 46},${wy0 - 46} L${wx0},${wy0} L${wx0},${wy1} L${wx0 - 46},${wy1 + 46}Z" fill="#6a5a44"/>`;
    w += `<defs><clipPath id="sgwin"><rect x="${wx0}" y="${wy0}" width="${wx1 - wx0}" height="${wy1 - wy0}"/></clipPath></defs><g clip-path="url(#sgwin)">${winView(t, wx0, wy0, wx1, wy1)}</g>`;
    const pw = (wx1 - wx0) / 3, ph = (wy1 - wy0) / 4;
    for (let i = 1; i < 3; i++) w += `<rect x="${f(wx0 + pw * i - 5)}" y="${wy0}" width="10" height="${wy1 - wy0}" fill="#e8e0cc" ${ol(1)}/>`;
    for (let j = 1; j < 4; j++) w += `<rect x="${wx0}" y="${f(wy0 + ph * j - (j === 2 ? 9 : 5))}" width="${wx1 - wx0}" height="${j === 2 ? 18 : 10}" fill="#e8e0cc" ${ol(1)}/>`;
    w += `<rect x="${wx0}" y="${wy0}" width="${wx1 - wx0}" height="${wy1 - wy0}" fill="none" stroke="#e8e0cc" stroke-width="22"/><rect x="${wx0 - 11}" y="${wy0 - 11}" width="${wx1 - wx0 + 22}" height="${wy1 - wy0 + 22}" fill="none" stroke="#2a2016" stroke-width="2"/>`;
    w += `<path d="M${wx0 + 20},${wy0 + 20} L${wx0 + 90},${wy0 + 20} L${wx0 + 20},${wy0 + 140}Z M${wx0 + pw + 30},${wy0 + ph + 30} L${wx0 + pw + 70},${wy0 + ph + 30} L${wx0 + pw + 30},${wy0 + ph + 100}Z" fill="#fff" opacity="0.16"/>`;
    w += `<rect x="${wx0 - 60}" y="${wy1 + 8}" width="${wx1 - wx0 + 120}" height="34" fill="#9a8a70" ${ol(1.4)}/><rect x="${wx0 - 60}" y="${wy1 + 8}" width="${wx1 - wx0 + 120}" height="6" fill="#fff" opacity="0.2"/>`;
    w += PR.curtain(wx1 + 4, wx1 + 150, wy0 - 70, wy1 + 120, '#4a5a3a', t, 7, 1, 0);
    // the light from the window: a cool glow around it
    w += C.radial((wx0 + wx1) / 2, (wy0 + wy1) / 2, 520, '#dfe6ea', 0.28);
    // the engraving: a skeleton in a black frame
    { const ex = 520, ey = 420, ew = 170, eh = 250; w += `<rect x="${ex - 12}" y="${ey - 12}" width="${ew + 24}" height="${eh + 24}" fill="#1a120c" ${ol(1.2)}/><rect x="${ex}" y="${ey}" width="${ew}" height="${eh}" fill="#e2d6b8"/>`;
      const sx = ex + ew / 2, sy = ey + 30; w += `<g stroke="#4a3a28" stroke-width="2.4" fill="none" opacity="0.85"><circle cx="${sx}" cy="${sy}" r="14"/><path d="M${sx},${sy + 14} L${sx},${sy + 110} M${sx - 34},${sy + 34} L${sx + 34},${sy + 34} M${sx - 34},${sy + 34} L${sx - 46},${sy + 110} M${sx + 34},${sy + 34} L${sx + 46},${sy + 110} M${sx - 22},${sy + 118} L${sx - 26},${sy + 200} M${sx + 22},${sy + 118} L${sx + 26},${sy + 200}"/>${[0, 1, 2, 3, 4].map(i => `<path d="M${sx - 26},${sy + 46 + i * 12} q26,8 52,0"/>`).join('')}<ellipse cx="${sx}" cy="${sy + 118}" rx="26" ry="12"/></g><text x="${sx}" y="${ey + eh - 8}" font-family="Palatino Linotype, Georgia, serif" font-size="13" text-anchor="middle" fill="#4a3a28">TAB. I.</text>`; }
    // the shelves: specimen jars, bottles, books, a skull, scales, a brass microscope, rolled bandages
    { const sx0 = 760, sx1 = 1260; const rows = [420, 690, 960];
      for (const y of rows) w += `<rect x="${sx0}" y="${y}" width="${sx1 - sx0}" height="22" fill="#4a2c16" ${ol(1.3)}/><rect x="${sx0}" y="${y}" width="${sx1 - sx0}" height="5" fill="#fff" opacity="0.12"/><rect x="${sx0}" y="${y + 22}" width="${sx1 - sx0}" height="30" fill="#000" opacity="0.2" filter="url(#b4)"/>` + [sx0 + 30, sx1 - 30].map(bx => `<path d="M${bx - 14},${y + 22} L${bx + 14},${y + 22} L${bx},${y + 70}Z" fill="#3a2010"/>`).join('');
      const jar = (x, y, s, liq, thing) => `<g transform="translate(${x},${y}) scale(${s})"><rect x="-38" y="-130" width="76" height="130" rx="10" fill="${liq}" opacity="0.55" stroke="#2a2a26" stroke-width="2"/>${thing}<rect x="-42" y="-142" width="84" height="18" rx="4" fill="#6a5a40" ${ol(1)}/><rect x="-30" y="-120" width="10" height="100" fill="#fff" opacity="0.25"/><rect x="-26" y="-70" width="52" height="30" fill="#e8dcc0" opacity="0.8"/><path d="M-20,-60 l40,0 M-18,-50 l30,0" stroke="#4a3a28" stroke-width="2"/></g>`;
      w += jar(800, 420, 0.9, '#c8c098', `<path d="M-20,-30 C-30,-60 -10,-100 10,-96 C30,-90 24,-50 6,-30Z" fill="#d8b0a0" opacity="0.8"/>`) + jar(880, 420, 1.0, '#b8c0a0', `<ellipse cx="0" cy="-62" rx="22" ry="30" fill="#c89a8a" opacity="0.75"/><path d="M0,-32 L0,-6" stroke="#c89a8a" stroke-width="5"/>`);
      w += jar(1180, 690, 0.95, '#c8b890', `<path d="M-18,-20 C-28,-50 -6,-96 14,-80 C26,-60 10,-40 4,-20Z" fill="#e0c0a8" opacity="0.8"/>`);
      // books with gilt bands
      { let bx = 960; const rb = rng(9); for (let i = 0; i < 9; i++) { const bw2 = 22 + rb() * 18, bh = 110 + rb() * 50, col = ['#5a1e16', '#2a3a2a', '#4a2a10', '#6a4a20', '#3a2a3a'][i % 5]; w += `<rect x="${f(bx)}" y="${f(420 - bh)}" width="${f(bw2)}" height="${f(bh)}" fill="${col}" ${ol(1.2)}/><path d="M${f(bx)},${f(420 - bh + 16)} l${f(bw2)},0 M${f(bx)},${f(420 - 18)} l${f(bw2)},0" stroke="#c8a040" stroke-width="2.5"/><rect x="${f(bx + 3)}" y="${f(420 - bh + 4)}" width="4" height="${f(bh - 8)}" fill="#fff" opacity="0.12"/>`; bx += bw2 + 2; }
        w += `<g transform="rotate(-12 ${bx + 20} 420)"><rect x="${bx + 4}" y="290" width="30" height="130" fill="#5a1e16" ${ol(1.2)}/></g>`; }
      // a skull, a mortar, bottles
      w += `<g transform="translate(860,690)"><path d="M-46,-6 C-56,-60 -30,-104 6,-104 C44,-104 62,-62 52,-12 L38,-8 L38,8 L-30,8 L-30,-4Z" fill="#e2d8bc" ${ol(1.4)}/><ellipse cx="-14" cy="-50" rx="14" ry="16" fill="#2a2018"/><ellipse cx="26" cy="-50" rx="14" ry="16" fill="#2a2018"/><path d="M6,-28 l-6,14 l12,0Z" fill="#2a2018"/>${[-20, -8, 4, 16, 28].map(x => `<rect x="${x}" y="-6" width="8" height="12" fill="#efe6cc" stroke="#6a5a40" stroke-width="1"/>`).join('')}</g>`;
      w += PR.mortar(980, 690, 0.8) + PR.bottle(1060, 690, 0.9, '#3a5a3a') + PR.bottle(1110, 690, 0.75, '#6a3a1a');
      // brass balance on the bottom shelf, a brass microscope, rolled linen bandages
      w += `<g transform="translate(860,960)" stroke="#a8862e" fill="none" stroke-width="4"><path d="M0,0 L0,-150 M-80,-140 L80,-140"/><path d="M-80,-140 L-100,-80 M-80,-140 L-60,-80 M80,-140 L60,-80 M80,-140 L100,-80"/><path d="M-110,-80 Q-80,-60 -50,-80 M50,-80 Q80,-60 110,-80" stroke-width="5"/><rect x="-40" y="-6" width="80" height="6" fill="#a8862e"/></g>`;
      w += `<g transform="translate(1000,960)"><rect x="-40" y="-14" width="80" height="14" fill="#8a6a24" ${ol(1)}/><path d="M-6,-14 L-10,-80 L10,-80 L6,-14Z" fill="#c8a040" ${ol(1)}/><g transform="rotate(-24 0 -80)"><rect x="-12" y="-190" width="24" height="120" rx="4" fill="#d8b050" ${ol(1)}/><rect x="-16" y="-200" width="32" height="18" fill="#a8862e" ${ol(1)}/><rect x="-6" y="-186" width="5" height="100" fill="#fff4c0" opacity="0.6"/></g><ellipse cx="0" cy="-72" rx="30" ry="6" fill="#a8862e" ${ol(1)}/></g>`;
      w += [1110, 1160, 1210].map((x, i) => `<g transform="translate(${x},960)"><ellipse cx="0" cy="-34" rx="22" ry="34" fill="#ece6d6" ${ol(1.2)}/><path d="M-22,-34 a22,10 0 0 0 44,0" stroke="#b8b0a0" stroke-width="2" fill="none"/><path d="M-12,-60 q12,26 0,52" stroke="#c8c0b0" stroke-width="2" fill="none"/></g>`).join('');
      w += C.radial(1010, 700, 520, '#ffb860', 0.18 * k); }
    // the long-case clock with its pendulum swinging behind the trunk glass
    { const cx = 1420, top = 260; const sw = Math.sin(t * Math.PI) * 12;
      w += `<rect x="${cx - 80}" y="${top}" width="160" height="200" rx="8" fill="#3a2010" ${ol(1.5)}/><circle cx="${cx}" cy="${top + 100}" r="62" fill="#ece2c8" ${ol(1.4)}/>`;
      for (let i = 0; i < 12; i++) { const a = i / 12 * 6.28; w += `<path d="M${f(cx + Math.sin(a) * 50)},${f(top + 100 - Math.cos(a) * 50)} L${f(cx + Math.sin(a) * 58)},${f(top + 100 - Math.cos(a) * 58)}" stroke="#2a2018" stroke-width="3"/>`; }
      const hm = 4.2 + t / 600, mm = (t / 60) * 6.28 + 2.1; w += `<path d="M${cx},${top + 100} L${f(cx + Math.sin(hm) * 30)},${f(top + 100 - Math.cos(hm) * 30)} M${cx},${top + 100} L${f(cx + Math.sin(mm) * 46)},${f(top + 100 - Math.cos(mm) * 46)}" stroke="#1a1410" stroke-width="4" stroke-linecap="round"/>`;
      w += `<path d="M${cx - 90},${top} L${cx},${top - 60} L${cx + 90},${top}Z" fill="#3a2010" ${ol(1.4)}/><circle cx="${cx}" cy="${top - 64}" r="10" fill="#c8a040"/>`;
      w += `<rect x="${cx - 60}" y="${top + 200}" width="120" height="900" fill="#3a2010" ${ol(1.5)} filter="url(#woodV)"/><rect x="${cx - 36}" y="${top + 260}" width="72" height="420" fill="#120a06" ${ol(1)}/>`;
      w += `<g transform="rotate(${f(sw)} ${cx} ${top + 230})"><path d="M${cx},${top + 230} L${cx},${top + 600}" stroke="#a8862e" stroke-width="4"/><circle cx="${cx}" cy="${top + 620}" r="26" fill="#d8b050" ${ol(1)}/><circle cx="${cx - 8}" cy="${top + 612}" r="8" fill="#fff4c0" opacity="0.6"/></g>`;
      w += `<rect x="${cx - 36}" y="${top + 260}" width="20" height="420" fill="#fff" opacity="0.07"/><rect x="${cx - 80}" y="${top + 1100}" width="160" height="200" fill="#3a2010" ${ol(1.4)}/>`; }
    // a pewter wall sconce with a candle between the window and the engraving
    w += `<path d="M470,800 l0,-40 q10,-12 20,0 l0,40Z" fill="#8a8a86" ${ol(1)}/><rect x="474" y="720" width="12" height="40" fill="#ece2c8"/>` + PR.flame(480, 718, 0.7, t + 2) + C.radial(480, 700, 200, '#ffb860', 0.22 * fl(t, 7));
    if (dim) w += `<rect x="-900" y="-400" width="3400" height="2400" fill="#0a0806" opacity="${f(dim)}" style="mix-blend-mode:multiply"/>`;
    L.push({ p: SG.WP, svg: w });
    // floor: wide oak boards, a worn red rug under the chair, the window's light lying across it
    let fl0 = `<rect x="-1200" y="1470" width="3800" height="1400" fill="#4a3018" filter="url(#woodH)"/>`;
    for (let i = 0; i < 16; i++) { const y = 1490 + i * 34 + i * i * 2.4; fl0 += `<path d="M-1200,${f(y)} L2600,${f(y)}" stroke="#1e1208" stroke-width="3" opacity="0.6"/>`; const rb = rng(40 + i); for (let j = 0; j < 4; j++) { const x = -1100 + rb() * 3600; fl0 += `<path d="M${f(x)},${f(y)} l0,${f(34 + i * 4.8)}" stroke="#1e1208" stroke-width="2.5" opacity="0.5"/>`; } }
    fl0 += `<rect x="-1200" y="1470" width="3800" height="60" fill="#000" opacity="0.3" filter="url(#b8)"/>`;
    { const rx0 = 60, rx1 = 760, ry0 = 1700, ry1 = 1920; fl0 += `<path d="M${rx0 + 40},${ry0} L${rx1 - 40},${ry0} L${rx1},${ry1} L${rx0},${ry1}Z" fill="#7a1e16" ${ol(1.2)}/><path d="M${rx0 + 70},${ry0 + 18} L${rx1 - 70},${ry0 + 18} L${rx1 - 32},${ry1 - 22} L${rx0 + 32},${ry1 - 22}Z" fill="none" stroke="#c8a050" stroke-width="6"/><path d="M${rx0 + 100},${ry0 + 40} L${rx1 - 100},${ry0 + 40} L${rx1 - 70},${ry1 - 44} L${rx0 + 70},${ry1 - 44}Z" fill="#2a3a5a" opacity="0.5"/>`;
      for (let i = 0; i < 7; i++) fl0 += `<path d="M${rx0 + 130 + i * 70},${ry0 + 70} l20,40 l-20,40 l-20,-40Z" fill="#c8a050" opacity="0.55"/>`;
      fl0 += `<rect x="${rx0}" y="${ry0}" width="${rx1 - rx0}" height="${ry1 - ry0}" fill="#000" opacity="0.15" filter="url(#tex)"/>`; }
    fl0 += `<path d="M-200,1500 L380,1500 L980,2200 L120,2200Z" fill="#e8eef0" opacity="0.1" filter="url(#b14)"/>`;
    fl0 += C.radial(SG.CANDLE[0], SG.CANDLE[1], 700, '#ffa850', 0.22 * k);
    if (dim) fl0 += `<rect x="-1200" y="1400" width="3800" height="1500" fill="#0a0806" opacity="${f(dim)}" style="mix-blend-mode:multiply"/>`;
    L.push({ p: 1, svg: fl0 });
    // the window's light falling diagonally through the room, with dust drifting in it (screen-blended, above the cast)
    L.push({ p: 1.02, light: true, svg: `<path d="M-60,300 L380,300 L1100,2000 L380,2000Z" fill="#e8eef2" opacity="${f(0.07 * (1 - dim))}" style="mix-blend-mode:screen" filter="url(#b14)"/>` + S.dust(380, 1100, 360, 640, 34, 9, t, '#f4f0e6', 2.2, 0.5 * (1 - dim)) });
    // foreground: dried herbs hanging from the beam, out of focus
    let fg = `<g filter="url(#dof1)">`;
    for (let i = 0; i < 3; i++) { const x = -150 + i * 70, sw = Math.sin(t * 0.9 + i) * 4; fg += `<path d="M${x},-200 L${f(x + sw)},${20 + i * 30}" stroke="#2a1a0c" stroke-width="5"/>` + E.herbs(x + sw, 10 + i * 30, 170, ['#3a4a2a', '#4a4a2a', '#3a3a22'][i], i + 5); }
    fg += `</g>`;
    L.push({ p: 1.3, svg: fg });
    return L;
  };
  // the side table: green baize to the floor, the brass candlestick, the open instrument case, a dish, a bottle, the
  // closed case book with the quill and inkpot. Drawn in the character layer, in front of the doctor and the milkmaid.
  S.surgTable = (t, o = {}) => {
    const [x0, x1] = SG.TABLE, top = SG.TOP, fy = SG.FLOOR, k = fl(t, 5);
    let g = `${lg('baize', [[0, '#2e4a32'], [0.4, '#22382a'], [1, '#121e16']])}`;
    g += `<path d="M${x0},${top - 32} L${x1},${top - 32} L${x1 + 18},${top} L${x0 - 6},${top}Z" fill="#3a5a40" ${ol(1.3)}/>`;
    g += `<path d="M${x0 - 6},${top} L${x1 + 18},${top} L${x1 + 30},${fy + 6} L${x0 - 16},${fy + 6}Z" fill="url(#baize)" ${ol(1.5)}/>`;
    for (let i = 1; i < 9; i++) { const x = x0 + (x1 - x0) * i / 9; g += `<path d="M${f(x)},${top + 10} C${f(x - 8)},${top + 200} ${f(x + 10)},${fy - 200} ${f(x + 4 + i)},${fy}" stroke="#0a120c" stroke-width="10" fill="none" opacity="0.35" filter="url(#b4)"/><path d="M${f(x + 18)},${top + 14} C${f(x + 10)},${top + 220} ${f(x + 28)},${fy - 220} ${f(x + 24 + i)},${fy}" stroke="#5a7a5a" stroke-width="5" fill="none" opacity="0.18"/>`; }
    g += `<path d="M${x0 - 6},${top} L${x1 + 18},${top}" stroke="#c8a040" stroke-width="4" stroke-dasharray="3 7" opacity="0.6"/><rect x="${x0 - 16}" y="${fy - 30}" width="${x1 - x0 + 46}" height="40" fill="#000" opacity="0.4" filter="url(#b8)"/>`;
    // the instrument case, open: wine velvet, three lancets and a probe in their slots
    if (o.caseOpen !== false) { const cx = 790, cy = top - 30; g += `<path d="M${cx - 70},${cy - 4} L${cx + 70},${cy - 4} L${cx + 76},${cy + 10} L${cx - 76},${cy + 10}Z" fill="#3a1a10" ${ol(1.2)}/><path d="M${cx - 64},${cy - 2} L${cx + 64},${cy - 2} L${cx + 68},${cy + 6} L${cx - 68},${cy + 6}Z" fill="#6a1420"/>` + [-40, 20].map(dx => `<path d="M${cx + dx - 18},${cy + 2} L${cx + dx + 18},${cy}" stroke="#c8ccd0" stroke-width="3"/>`).join('') + `<path d="M${cx - 70},${cy - 4} L${cx - 60},${cy - 60} L${cx + 80},${cy - 60} L${cx + 70},${cy - 4}Z" fill="#4a2414" ${ol(1.2)}/><path d="M${cx - 62},${cy - 10} L${cx - 54},${cy - 54} L${cx + 74},${cy - 54} L${cx + 64},${cy - 10}Z" fill="#7a1a26"/>`; }
    // a porcelain dish with a folded cloth, a brown bottle, the case book with quill and inkpot
    g += `<ellipse cx="960" cy="${top - 26}" rx="54" ry="12" fill="#ece8e0" ${ol(1.2)}/><ellipse cx="960" cy="${top - 28}" rx="40" ry="7" fill="#d8d4cc"/><path d="M936,${top - 34} l40,-4 l8,8 l-40,4Z" fill="#f4f0e6" ${ol(0.8)}/>`;
    g += PR.bottle(1060, top - 22, 0.8, '#5a2e12');
    g += `<path d="M1260,${top - 26} L1400,${top - 30} L1408,${top - 12} L1266,${top - 8}Z" fill="#4a1e12" ${ol(1.2)}/><path d="M1262,${top - 22} L1402,${top - 26}" stroke="#ecdfbf" stroke-width="6"/>`;
    g += `<rect x="1300" y="${top - 70}" width="34" height="44" rx="6" fill="#2a2a30" ${ol(1)}/><path d="M1316,${top - 70} C1330,${top - 140} 1350,${top - 200} 1380,${top - 250} C1366,${top - 196} 1346,${top - 140} 1322,${top - 70}Z" fill="#efe8da" ${ol(1)}/>`;
    // the brass candlestick, the candle burning, its warm light on the cloth
    const [ccx, ccy] = SG.CANDLE;
    g += `<path d="M${ccx - 40},${top - 26} L${ccx + 40},${top - 26} L${ccx + 24},${top - 44} L${ccx + 8},${top - 46} L${ccx + 8},${top - 92} L${ccx + 20},${top - 98} L${ccx - 20},${top - 98} L${ccx - 8},${top - 92} L${ccx - 8},${top - 46} L${ccx - 24},${top - 44}Z" fill="#b8862e" ${ol(1.2)}/><path d="M${ccx - 3},${top - 90} L${ccx - 3},${top - 48}" stroke="#fff0b0" stroke-width="2" opacity="0.6"/>`;
    g += `<rect x="${ccx - 10}" y="${ccy - 130}" width="20" height="${top - 98 - ccy + 130}" fill="#ece2c8" ${ol(1)}/>` + PR.flame(ccx, ccy - 132, 1.0, t);
    g += C.radial(ccx, ccy - 140, 420, '#ffb050', 0.4 * k, 'screen');
    return g;
  };

  // ======================================================= the plague street (overcast; the church at the end of it)
  S.STREET = { FY: 1790, TROUGH: [820, 1110, 1610] };
  S.street9 = (t, o = {}) => {
    const L = [], FY = S.STREET.FY;
    let sky = `${lg('st9s', [[0, '#5a6066'], [0.5, '#8a8e8e'], [1, '#b4b0a4']])}<rect x="-1400" y="-1200" width="4000" height="2600" fill="url(#st9s)"/>`;
    for (const [cx, cy, w2, sd] of [[-200, 300, 700, 3], [700, 160, 800, 6], [1500, 380, 640, 9]]) sky += E.cloud(cx + t * 10, cy, w2, w2 * 0.3, sd, { op: 0.85, lit: '#a8aaa8', body: '#7a7e82', dark: '#4a5056' });
    sky += E.birds(200 + t * 30, 420, 7, 3, 1.4, '#1a1a1e') + E.birds(800 + t * 22, 300, 5, 8, 1.1, '#1a1a1e');
    L.push({ p: 0.15, svg: sky });
    // the end of the street: the church tower in the mist, distant roofs, smoke
    let far = E.church(560, 1180, 2.1, { stone: '#8a8a84', roof: '#4a4a48', sun: -1 });
    for (let i = 0; i < 8; i++) far += E.cottage(-300 + i * 220, 1210, 300, 170, 0.6, 30 + i, { side: i < 4 ? 1 : -1, sun: -1, wall: '#a8a49a', timber: '#3a3632', roof: '#5a5650', window: '#2a2a2a' });
    far += E.smoke(300, 1100, 420, 3 + Math.floor(t * 0.6) % 3, '#5a5652', 0.4) + E.smoke(820, 1080, 360, 6 + Math.floor(t * 0.5) % 3, '#6a6662', 0.35);
    far += `<rect x="-1400" y="900" width="4000" height="400" fill="#b8b4aa" opacity="0.32" filter="url(#b14)"/>`;
    L.push({ p: 0.35, svg: far });
    // mid houses, both sides, converging
    let mid = '';
    mid += facade(-700, -240, 1460, 520, 21, { roof: '#4a4038', door: true, lit: false }) + facade(-240, 160, 1430, 470, 22, { roof: '#5a4a3a', cross: true });
    mid += facade(900, 1300, 1430, 470, 23, { roof: '#4a4038', cross: false, doorAt: 0.2 }) + facade(1300, 1800, 1460, 520, 24, { roof: '#5a4a3a', cross: true, doorAt: 0.3 });
    mid += `<rect x="-1400" y="1100" width="4000" height="420" fill="#a8a49a" opacity="0.18" filter="url(#b14)"/>`;
    L.push({ p: 0.62, svg: mid });
    // the near houses at the frame edges; the left one's door stands open where the sick woman leans
    let near = facade(-900, -120, FY - 10, 900, 31, { roof: '#3a3028', open: true, doorAt: 0.62 }) + facade(1180, 2000, FY - 10, 900, 32, { roof: '#3a3028', cross: true, doorAt: 0.15 });
    // a hanging inn sign creaking on its bracket
    { const sw = Math.sin(t * 1.3) * 6; near += `<path d="M1180,880 L1020,880" stroke="#1a1410" stroke-width="12"/><g transform="rotate(${f(sw)} 1060 884)"><path d="M1040,884 l0,40 M1080,884 l0,40" stroke="#1a1410" stroke-width="4"/><rect x="1010" y="922" width="100" height="130" fill="#4a3020" ${ol(1.4)}/><circle cx="1060" cy="986" r="34" fill="#c8a040" opacity="0.7"/></g>`; }
    L.push({ p: 0.86, svg: near });
    // the ground: mud with ruts, puddles holding the grey sky, straw, a lost shoe; the bedding fire smoking
    let gd = `<path d="M-1400,1500 L2600,1500 L2600,2800 L-1400,2800Z" fill="#4a4034" filter="url(#ground)"/>`;
    for (const [x, y, w2, h2] of [[200, 1640, 140, 18], [760, 1700, 200, 24], [-200, 1760, 160, 20], [1100, 1820, 240, 30]]) gd += E.puddle(x, y, w2, h2, '#9aa0a2');
    gd += `<path d="M-1400,1620 C-400,1600 400,1640 1400,1620 C1900,1610 2300,1630 2600,1640 M-1400,1700 C-300,1680 500,1720 1500,1700 C2000,1690 2400,1710 2600,1720" stroke="#2a2218" stroke-width="10" fill="none" opacity="0.5"/>`;
    gd += E.straw(-1000, 2200, 1560, 1900, 90, 7, '#8a7a50');
    gd += `<path d="M450,1690 q30,-26 70,-6 q10,14 -10,20 l-54,0Z" fill="#2a1a10" ${ol(1)}/>`;
    // the burning pile of the dead's bedding (left), smoke drifting across the street
    gd += `<path d="M-520,1640 C-560,1560 -400,1530 -300,1560 C-220,1540 -120,1580 -160,1640Z" fill="#3a3026" ${ol(1.2)}/>`;
    for (let i = 0; i < 3; i++) gd += G.SETS.fireMorph(-420 + i * 70, 1610, 0.55 + 0.1 * i, 17 + i * 5, 6, t * 7 + i);
    gd += C.radial(-340, 1560, 360, '#ff8a3a', 0.35 * fl(t, 3), 'screen') + E.smoke(-360, 1480, 700, 2 + Math.floor(t * 0.7) % 4, '#6a645e', 0.45);
    // the water trough the sick man sinks behind
    const [tx0, tx1, ty] = S.STREET.TROUGH;
    L.push({ p: 1, svg: gd });
    // foreground: a weathered post and drifting smoke
    L.push({ p: 1.28, svg: `<g filter="url(#dof1)"><rect x="-260" y="-400" width="120" height="3200" fill="#2a2018"/><rect x="-240" y="-400" width="20" height="3200" fill="#5a4a38" opacity="0.6"/></g>` + E.smoke(200 + t * 40, 1900, 900, 11, '#8a8682', 0.18) });
    return L;
  };
  // the trough (in front of the collapsing man): weathered planks, water with the sky in it
  S.trough = (t) => {
    const [x0, x1, y] = S.STREET.TROUGH;
    let g = `<path d="M${x0},${y - 210} L${x1},${y - 210} L${x1 - 14},${y} L${x0 + 14},${y}Z" fill="#5a4630" ${ol(1.6)} filter="url(#woodH)"/>`;
    for (let i = 1; i < 4; i++) g += `<path d="M${x0 + 4},${y - 210 + i * 52} L${x1 - 4},${y - 210 + i * 52}" stroke="#2a1e12" stroke-width="3"/>`;
    g += `<path d="M${x0 - 10},${y - 222} L${x1 + 10},${y - 222} L${x1 + 4},${y - 200} L${x0 - 4},${y - 200}Z" fill="#6a5438" ${ol(1.3)}/><path d="M${x0 + 10},${y - 214} L${x1 - 10},${y - 214}" stroke="#a8b0b2" stroke-width="6" opacity="0.7"/>`;
    for (const x of [x0 + 30, x1 - 30]) g += `<rect x="${x - 10}" y="${y - 230}" width="20" height="240" fill="#2a2a2c" opacity="0.8"/>`;
    g += `<path d="M${x0 + 40},${y - 150} q30,40 0,90" stroke="#3a5a2a" stroke-width="10" fill="none" opacity="0.5"/>`;
    return g;
  };
  // the body cart standing in the street (world units)
  S.cart = (x, y, s, t) => `<g transform="translate(${f(x)},${f(y)}) scale(${f(-s)},${f(s)})">${cartArt(0, 0).replace(/<g fill="#2a2420">[\s\S]*<\/g>$/, '')}</g>`;

  // ======================================================= the cow barn
  S.barn = (t, o = {}) => {
    const L = [];
    let w = `<rect x="-1000" y="-600" width="3200" height="2600" fill="#3a2a1a"/>`;
    // vertical boards with gaps of daylight
    for (let x = -1000; x < 2200; x += 64) { const r2 = rng(Math.floor(x + 2000)); w += `<rect x="${x}" y="-600" width="60" height="2600" fill="${['#4a3420', '#523a24', '#44301c'][Math.floor(r2() * 3)]}" filter="url(#woodV)"/>`; if (r2() > 0.55) w += `<rect x="${x + 60}" y="-600" width="4" height="2600" fill="#fff0c8" opacity="${f(0.35 + r2() * 0.4)}"/>`; }
    w += `<rect x="-1000" y="200" width="3200" height="40" fill="#2a1a0e"/><rect x="-1000" y="900" width="3200" height="34" fill="#2a1a0e"/>`;
    // tools on the wall: a pitchfork, a hay rake, a coiled rope, a horse collar
    w += `<path d="M-60,1500 L60,300" stroke="#6a4a28" stroke-width="12"/><path d="M40,320 L60,300 M60,300 L52,240 M60,300 L78,246 M60,300 L96,256" stroke="#5a5a5a" stroke-width="6" fill="none"/>`;
    w += `<g transform="translate(1400,620)"><circle r="60" fill="none" stroke="#a8905a" stroke-width="16"/><circle r="40" fill="none" stroke="#8a7848" stroke-width="12"/><circle r="22" fill="none" stroke="#a8905a" stroke-width="10"/></g>`;
    w += `<path d="M1660,420 C1600,420 1580,560 1600,640 C1640,700 1720,700 1740,640 C1760,560 1740,420 1680,420Z" fill="none" stroke="#3a2a1a" stroke-width="30"/><path d="M1660,420 C1600,420 1580,560 1600,640 C1640,700 1720,700 1740,640 C1760,560 1740,420 1680,420Z" fill="none" stroke="#7a5030" stroke-width="22"/>`;
    w += `<rect x="-1000" y="-600" width="3200" height="2600" fill="#120a04" opacity="0.35" style="mix-blend-mode:multiply"/>`;
    L.push({ p: 0.7, svg: w });
    // the loft above with hay spilling over its edge, a lantern hanging from the beam
    let loft = `<rect x="-1200" y="-200" width="3600" height="420" fill="#2a1a0e" filter="url(#woodH)"/><rect x="-1200" y="200" width="3600" height="40" fill="#1a0e06"/>`;
    const rh = rng(17); for (let i = 0; i < 160; i++) { const x = -1100 + rh() * 3400, y = 220 + rh() * 40; loft += `<path d="M${f(x)},${f(y - 30)} q${f(rh() * 10 - 5)},${f(30)} ${f(rh() * 16 - 8)},${f(50 + rh() * 60)}" stroke="${['#c8a858', '#a88a40', '#e0c070'][i % 3]}" stroke-width="3" fill="none" opacity="0.85"/>`; }
    { const lx = 300, sw = Math.sin(t * 1.1) * 4; loft += `<g transform="rotate(${f(sw)} ${lx} 240)"><path d="M${lx},240 L${lx},420" stroke="#1a1410" stroke-width="4"/>${PR.lantern(lx, 470, 1.0, t, 0)}</g>` + C.radial(lx, 500, 520, '#ffb050', 0.4 * fl(t, 4), 'screen'); }
    L.push({ p: 0.85, svg: loft });
    // the straw floor, the manger with hay in front of the cow, a stall post
    let fl0 = `<rect x="-1200" y="1500" width="3600" height="1400" fill="#6a5430" filter="url(#ground)"/>` + E.straw(-1100, 2300, 1520, 2300, 260, 9, '#c8a858') + E.straw(-1100, 2300, 1520, 2300, 160, 10, '#8a7040');
    fl0 += `<path d="M-460,1300 L-60,1300 L-90,1560 L-430,1560Z" fill="#5a3a20" ${ol(1.6)} filter="url(#woodH)"/>`;
    const rm = rng(23); for (let i = 0; i < 60; i++) { const x = -450 + rm() * 380, y = 1300; fl0 += `<path d="M${f(x)},${f(y + 10)} q${f(rm() * 30 - 15)},${f(-40 - rm() * 40)} ${f(rm() * 40 - 20)},${f(-70 - rm() * 40)}" stroke="${['#c8a858', '#a88a40'][i % 2]}" stroke-width="3" fill="none"/>`; }
    fl0 += `<rect x="1300" y="400" width="70" height="1300" fill="#3a2414" ${ol(1.5)} filter="url(#woodV)"/>`;
    L.push({ p: 1, svg: fl0 });
    // light shafts through the board gaps (screen blend), dust in them
    L.push({ p: 1.04, light: true, svg: `<g style="mix-blend-mode:screen">${[[900, 0.1], [1150, 0.08], [1500, 0.12]].map(([x, op]) => `<path d="M${x},-400 L${x + 60},-400 L${x - 600},2000 L${x - 760},2000Z" fill="#ffe8b0" opacity="${op}" filter="url(#b8)"/>`).join('')}</g>` + S.dust(700, 1000, 600, 700, 40, 13, t, '#fff0c8', 2.4, 0.6) });
    L.push({ p: 1.3, svg: `<g filter="url(#dof1)">${E.straw(-600, 1800, 2080, 2400, 120, 31, '#a88a40')}</g>` });
    return L;
  };

  // ======================================================= your sickroom
  // bed centred at x 520 (headboard top 1000, quilt line ~1390, footboard 1610..1800); the window (p 0.8) x 640..900.
  // o.night 0..1 darkens the room and turns the window to a moonlit night; o.dawn 0..1 the warm morning sun
  S.SICK = { BED: [230, 830], QUILT: 1395, FOOT: 1610, FY: 1800, WIN: [640, 420, 900, 760], DOOR: [-260, 360, 60, 1640] };
  S.sickroom = (t, o = {}) => {
    const L = [], nt = o.night || 0, dw = o.dawn || 0, [wx0, wy0, wx1, wy1] = S.SICK.WIN;
    const day = 1 - nt;
    let w = `<rect x="-900" y="-400" width="2900" height="2400" fill="#c8b898" filter="url(#plaster)"/>`;
    // studs and a sloping ceiling beam
    for (const x of [-500, 200, 1000, 1500]) w += `<rect x="${x}" y="-400" width="44" height="2400" fill="#3a2414" filter="url(#woodV)"/>`;
    w += `<path d="M-900,200 L2000,-100 L2000,0 L-900,300Z" fill="#3a2414" filter="url(#woodH)"/><path d="M-900,300 L2000,0 L2000,40 L-900,340Z" fill="#000" opacity="0.25" filter="url(#b8)"/>`;
    // the casement window with diamond leading; sky by day, the moon by night, sunrise at the end
    const skyTop = mix(mix('#9aaabb', '#0e1430', nt), '#f0b878', dw), skyBot = mix(mix('#d8dcd8', '#2a2e4a', nt), '#ffe2a8', dw);
    w += `<defs><linearGradient id="skw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${skyTop}"/><stop offset="1" stop-color="${skyBot}"/></linearGradient><clipPath id="skc"><rect x="${wx0}" y="${wy0}" width="${wx1 - wx0}" height="${wy1 - wy0}"/></clipPath></defs>`;
    let view = `<rect x="${wx0}" y="${wy0}" width="${wx1 - wx0}" height="${wy1 - wy0}" fill="url(#skw)"/>`;
    if (nt > 0.05) { view += `<g opacity="${f(nt)}"><circle cx="${wx0 + 190}" cy="${wy0 + 90}" r="30" fill="#f4eed8"/><circle cx="${wx0 + 202}" cy="${wy0 + 84}" r="26" fill="${skyTop}"/>${[[30, 60], [90, 140], [220, 200], [60, 220], [150, 40]].map(([x, y]) => `<circle cx="${wx0 + x}" cy="${wy0 + y}" r="2" fill="#fff" opacity="0.7"/>`).join('')}</g>`; }
    view += E.cloud(wx0 + 60 + t * 6, wy0 + 140, 200, 50, 4, { op: 0.7 * (1 - nt * 0.6), lit: mix('#f0f0ec', '#ffe8c0', dw), body: mix('#b8bcc0', '#3a3e5a', nt), dark: mix('#8a9098', '#1e2238', nt) });
    view += `<path d="M${wx0},${wy1 - 60} L${wx0 + 60},${wy1 - 90} L${wx0 + 120},${wy1 - 70} L${wx0 + 200},${wy1 - 100} L${wx1},${wy1 - 70} L${wx1},${wy1} L${wx0},${wy1}Z" fill="${mix(mix('#5a6a4a', '#0a0e14', nt), '#7a6a3a', dw)}"/>`;
    if (dw > 0) view += C.radial(wx1 - 40, wy1 - 70, 220, '#fff0b0', 0.8 * dw, 'screen');
    w += `<rect x="${wx0 - 30}" y="${wy0 - 30}" width="${wx1 - wx0 + 60}" height="${wy1 - wy0 + 60}" fill="#7a6a50" ${ol(1.4)}/><g clip-path="url(#skc)">${view}`;
    for (let k = -8; k < 10; k++) w += `<path d="M${wx0 + k * 40},${wy0} l${(wy1 - wy0) * 0.6},${wy1 - wy0} M${wx0 + k * 40 + (wy1 - wy0) * 0.6},${wy0} l${-(wy1 - wy0) * 0.6},${wy1 - wy0}" stroke="#2a2a2a" stroke-width="2.5"/>`;
    w += `</g><rect x="${wx0}" y="${wy0}" width="${wx1 - wx0}" height="${wy1 - wy0}" fill="none" stroke="#3a2a1a" stroke-width="14"/><path d="M${(wx0 + wx1) / 2},${wy0} L${(wx0 + wx1) / 2},${wy1}" stroke="#3a2a1a" stroke-width="12"/><rect x="${wx0 - 40}" y="${wy1 + 20}" width="${wx1 - wx0 + 80}" height="28" fill="#6a5438" ${ol(1.2)}/>`;
    // a needlework sampler, a coat on a peg, a shelf with a jug and a bible
    w += `<rect x="-200" y="560" width="220" height="260" fill="#3a2414" ${ol(1.2)}/><rect x="-186" y="574" width="192" height="232" fill="#e6dcc4"/><text x="-90" y="620" font-family="Palatino Linotype, Georgia, serif" font-size="22" text-anchor="middle" fill="#7a2a20">A B C D E F</text><text x="-90" y="650" font-family="Palatino Linotype, Georgia, serif" font-size="22" text-anchor="middle" fill="#2a4a6a">G H I K L M</text>${[0, 1, 2, 3].map(i => `<path d="M${-160 + i * 44},760 l12,-24 l12,24Z" fill="${['#3a6a3a', '#7a2a20'][i % 2]}"/>`).join('')}<text x="-90" y="790" font-family="Palatino Linotype, Georgia, serif" font-size="16" text-anchor="middle" fill="#3a2a1a">Mary. 1794</text>`;
    w += `<rect x="1080" y="600" width="18" height="18" fill="#2a1a0e"/><path d="M1060,612 C1020,680 1010,900 1040,1080 L1170,1080 C1190,900 1160,680 1110,612Z" fill="#4a3a2a" ${ol(1.4)} filter="url(#cloth)"/>`;
    w += `<rect x="1180" y="840" width="300" height="20" fill="#4a2e18" ${ol(1.2)}/>` + PR.jug(1260, 840, 0.7) + `<rect x="1360" y="780" width="70" height="60" fill="#2a1a10" ${ol(1)}/>`;
    // the doorway at the left: a dim landing beyond, the door swung open
    { const [dx0, dy0, dx1, dy1] = S.SICK.DOOR; w += `<rect x="${dx0 - 30}" y="${dy0 - 30}" width="${dx1 - dx0 + 60}" height="${dy1 - dy0 + 30}" fill="#3a2414" ${ol(1.4)}/><rect x="${dx0}" y="${dy0}" width="${dx1 - dx0}" height="${dy1 - dy0}" fill="${mix('#3a2e22', '#120c08', nt)}"/>` + C.radial(dx0 + 140, dy0 + 600, 420, '#ffcf90', 0.2 * day, 'screen') +
      `<path d="M${dx1},${dy0} L${dx1 + 120},${dy0 + 50} L${dx1 + 120},${dy1 + 30} L${dx1},${dy1}Z" fill="#5a3a20" ${ol(1.4)}/>`; }
    // the window light on the wall: a soft patch that slides with the sun; dark at night; gold at dawn
    const sun = (o.sunX ?? 0);
    w += `<path d="M${f(wx0 + 300 + sun)},${f(wy0 + 380)} L${f(wx1 + 420 + sun)},${f(wy0 + 380)} L${f(wx1 + 560 + sun)},${f(wy1 + 600)} L${f(wx0 + 360 + sun)},${f(wy1 + 600)}Z" fill="${mix('#f4f4ee', '#ffd890', dw)}" opacity="${f(0.16 * day + 0.12 * dw)}" filter="url(#b14)"/>`;
    w += `<rect x="-900" y="-400" width="2900" height="2400" fill="#0a0e1e" opacity="${f(0.62 * nt * (1 - dw))}" style="mix-blend-mode:multiply"/>`;
    L.push({ p: 0.8, svg: w });
    // floor
    let fl0 = `<rect x="-1000" y="1600" width="3000" height="1200" fill="#4a3420" filter="url(#woodH)"/>`;
    for (let i = 0; i < 10; i++) fl0 += `<path d="M-1000,${1620 + i * 40 + i * i * 3} L2000,${1620 + i * 40 + i * i * 3}" stroke="#1e1208" stroke-width="3" opacity="0.6"/>`;
    fl0 += `<rect x="-1000" y="1600" width="3000" height="1200" fill="#0a0e1e" opacity="${f(0.55 * nt * (1 - dw))}" style="mix-blend-mode:multiply"/>`;
    L.push({ p: 1, svg: fl0 });
    // dawn: a warm shaft of morning sun across the room
    if (dw > 0) L.push({ p: 1.02, light: true, svg: `<path d="M900,400 L1000,400 L300,2000 L-100,2000Z" fill="#ffe0a0" opacity="${f(0.16 * dw)}" style="mix-blend-mode:screen" filter="url(#b14)"/>` + S.dust(500, 1200, 400, 600, 30, 21, t, '#fff0c8', 2.2, 0.6 * dw) });
    return L;
  };
  // the bed, in pieces so the people sit inside it: the headboard and pillows (behind), the quilt (over the boy's body),
  // the footboard (in front). o.k = how tumbled the quilt is (fever)
  S.bedBack = () => {
    const [x0, x1] = S.SICK.BED;
    let g = `<rect x="${x0 - 30}" y="980" width="${x1 - x0 + 60}" height="620" fill="#4a2e16" ${ol(1.6)} filter="url(#woodV)"/>`;
    g += `<path d="M${x0 - 30},980 C${x0 + 100},900 ${x1 - 100},900 ${x1 + 30},980" fill="#4a2e16" ${ol(1.5)}/>`;
    for (const x of [x0 - 40, x1 + 40]) g += `<rect x="${x - 26}" y="920" width="52" height="880" fill="#3a2010" ${ol(1.5)}/><circle cx="${x}" cy="910" r="30" fill="#4a2e16" ${ol(1.3)}/>`;
    g += `<path d="M${x0 + 30},1180 C${x0 + 40},1080 ${x1 - 40},1080 ${x1 - 30},1180 L${x1 - 20},1300 L${x0 + 20},1300Z" fill="#ece8dc" ${ol(1.4)} filter="url(#cloth)"/><path d="M${x0 + 60},1170 C${x0 + 160},1120 ${x1 - 160},1120 ${x1 - 60},1170" stroke="#b8b0a0" stroke-width="5" fill="none" opacity="0.7"/>`;
    return g;
  };
  S.bedQuilt = (t, o = {}) => {
    const [x0, x1] = S.SICK.BED, q = S.SICK.QUILT, fb = S.SICK.FOOT, sh = o.shiver || 0;
    const wob = sh * 3 * Math.sin(t * 29);
    const top = `M${x0 - 20},${q + 30} C${x0 + 60},${q - 6 + wob} ${x0 + 200},${q - 30} ${(x0 + x1) / 2},${q - 24 - wob} C${x1 - 200},${q - 30} ${x1 - 60},${q - 4} ${x1 + 20},${q + 30}`;
    let g = `<defs><clipPath id="qlt"><path d="${top} L${x1 + 50},${fb + 40} L${x0 - 50},${fb + 40}Z"/></clipPath></defs>`;
    g += `<path d="${top} L${x1 + 50},${fb + 40} L${x0 - 50},${fb + 40}Z" fill="#8a3a2a" ${ol(1.6)}/>`;
    // patchwork squares, shaded by the folds
    let pt = ''; const rq = rng(5), cols = ['#8a3a2a', '#c8a050', '#3a5a6a', '#6a7a4a', '#e0d4b8', '#5a2a3a'];
    for (let j = 0; j < 7; j++) for (let i = 0; i < 9; i++) pt += `<rect x="${x0 - 50 + i * 80}" y="${q - 40 + j * 80}" width="80" height="80" fill="${cols[Math.floor(rq() * cols.length)]}" stroke="#2a1a10" stroke-width="2" stroke-dasharray="6 4"/>`;
    pt += [0.25, 0.5, 0.75].map(k => `<path d="M${f(lerp(x0, x1, k))},${q - 20} C${f(lerp(x0, x1, k) - 30)},${q + 100} ${f(lerp(x0, x1, k) + 20)},${fb - 100} ${f(lerp(x0, x1, k) - 10)},${fb + 20}" stroke="#1a0a06" stroke-width="40" fill="none" opacity="0.28" filter="url(#b8)"/>`).join('');
    pt += `<path d="${top}" stroke="#fff" stroke-width="16" fill="none" opacity="0.15" filter="url(#b4)"/>`;
    g += `<g clip-path="url(#qlt)">${pt}</g>`;
    // the turned-down sheet edge
    g += `<path d="${top}" stroke="#ece8dc" stroke-width="26" fill="none"/><path d="${top}" stroke="#b8b0a0" stroke-width="3" fill="none" transform="translate(0,12)"/>`;
    return g;
  };
  S.bedFront = (t, o = {}) => {
    const [x0, x1] = S.SICK.BED, fb = S.SICK.FOOT, fy = S.SICK.FY;
    let g = `<rect x="${x0 - 40}" y="${fb}" width="${x1 - x0 + 80}" height="${fy - fb}" fill="#5a3418" ${ol(1.6)} filter="url(#woodH)"/><rect x="${x0 - 40}" y="${fb}" width="${x1 - x0 + 80}" height="8" fill="#fff" opacity="0.12"/>`;
    for (const x of [x0 - 50, x1 + 50]) g += `<rect x="${x - 28}" y="${fb - 70}" width="56" height="${fy - fb + 80}" fill="#3a2010" ${ol(1.5)}/><circle cx="${x}" cy="${fb - 80}" r="30" fill="#4a2e16" ${ol(1.3)}/><circle cx="${x - 8}" cy="${fb - 88}" r="8" fill="#c89a60" opacity="0.5"/>`;
    g += [0.33, 0.66].map(k => `<rect x="${f(lerp(x0, x1, k) - 60)}" y="${fb + 40}" width="120" height="110" rx="6" fill="#4a2a12" ${ol(1)}/>`).join('');
    // the bedside stool with the candle (its height burns down over the days) and the basin with a cloth
    const h = o.candle ?? 1;
    g += `${PR.stool(1000, fy, 0.5)}<rect x="975" y="${f(fy - 75 - 120 * h)}" width="20" height="${f(120 * h)}" fill="#ece2c8" ${ol(1)}/><path d="M960,${fy - 75} L1010,${fy - 75}" stroke="#8a8a86" stroke-width="8"/>`;
    if (o.lit !== false) g += PR.flame(985, fy - 77 - 120 * h, 0.85, t) + C.radial(985, fy - 100 - 120 * h, 520, '#ffb050', 0.38 * fl(t, 2) * (o.candleGlow ?? 1), 'screen');
    else g += G.ENV.smoke(985, fy - 80 - 120 * h, 140, 2, '#c8c0b0', 0.25);
    g += `<ellipse cx="1060" cy="${fy - 78}" rx="40" ry="10" fill="#d8d4cc" ${ol(1)}/><path d="M1040,${fy - 84} q20,-10 36,0 l-6,14 l-24,0Z" fill="#ece8dc"/>`;
    return g;
  };

  // ======================================================= the dying man's hovel (dark, smoky, a rush light)
  S.HOV = { FY: 1780, PALLET: [180, 1000, 1430] };
  S.hovel = (t, o = {}) => {
    const L = [], k = fl(t, 8);
    let w = E.daubWall ? E.daubWall(-900, -400, 2000, 1800, 41, { daub: '#6a5a44', posts: [-420, 420, 1480] }) : `<rect x="-900" y="-400" width="2900" height="2200" fill="#6a5a44" filter="url(#plaster)"/>`;
    // fallen daub showing the lath behind
    for (const [x, y, ww, hh] of [[60, 420, 220, 180], [880, 760, 160, 240], [-300, 1100, 260, 160]]) { w += `<path d="M${x},${y} q${ww * 0.5},-30 ${ww},10 q20,${hh * 0.5} -10,${hh} q-${ww * 0.5},20 -${ww},-10Z" fill="#2a1e14"/>`; for (let i = 0; i < 5; i++) w += `<path d="M${x + 10},${y + 20 + i * hh / 5} L${x + ww - 10},${y + 26 + i * hh / 5}" stroke="#6a4a2a" stroke-width="10"/>`; }
    // a small shuttered window with a grey shaft
    w += `<rect x="720" y="300" width="200" height="180" fill="#9aa0a4"/><path d="M720,300 L720,480 L660,500 L660,280Z M920,300 L920,480 L980,500 L980,280Z" fill="#3a2a1a" ${ol(1.2)}/><rect x="712" y="292" width="216" height="196" fill="none" stroke="#2a1a0e" stroke-width="16"/>`;
    w += `<rect x="-900" y="-400" width="2900" height="2200" fill="#0a0604" opacity="0.32" style="mix-blend-mode:multiply"/>`;
    w += C.radial(900, 1300, 800, '#ff9a40', 0.32 * k, 'screen') + C.radial(820, 390, 360, '#c8d0d4', 0.25);
    L.push({ p: 0.8, svg: w });
    let fl0 = `<rect x="-1000" y="1450" width="3000" height="1400" fill="#3a2e20" filter="url(#ground)"/>` + E.straw(-900, 1900, 1480, 2200, 120, 3, '#6a5a3a');
    fl0 += `<rect x="-1000" y="1450" width="3000" height="1400" fill="#0a0604" opacity="0.25" style="mix-blend-mode:multiply"/>`;
    L.push({ p: 1, svg: fl0 });
    L.push({ p: 1.02, light: true, svg: `<path d="M700,480 L940,480 L760,1900 L280,1900Z" fill="#d8dce0" opacity="0.08" style="mix-blend-mode:screen" filter="url(#b14)"/>` + S.dust(640, 1100, 260, 500, 26, 5, t, '#e8e8e0', 2.0, 0.45) });
    return L;
  };
  // the straw pallet and ragged blanket in front of the dying man, the rush light on its stool, flies
  S.pallet = (t) => {
    const [x0, x1, y] = S.HOV.PALLET, fy = S.HOV.FY;
    let g = `<path d="M${x0 - 120},${fy} C${x0 - 140},${y + 60} ${x0 - 40},${y - 10} ${x0 + 80},${y} L${x1 - 40},${y - 20} C${x1 + 80},${y - 10} ${x1 + 160},${y + 80} ${x1 + 140},${fy}Z" fill="#7a6438" ${ol(1.4)}/>` + E.straw(x0 - 120, x1 + 140, y, fy, 120, 13, '#b8a060');
    // the blanket: coarse, patched, torn edge
    g += `<path d="M${x0 - 60},${y + 30} C${x0 + 100},${y - 40} ${x1 - 200},${y - 70} ${x1 + 40},${y + 10} L${x1 + 70},${fy - 20} L${x0 - 80},${fy - 10}Z" fill="#5a5040" ${ol(1.5)} filter="url(#cloth)"/>`;
    g += `<path d="M${x0 + 60},${y + 40} L${x0 + 200},${y + 20} L${x0 + 210},${y + 140} L${x0 + 70},${y + 160}Z" fill="#6a5a3a" ${ol(1.1)}/>` + [0.3, 0.55, 0.8].map(q => `<path d="M${f(lerp(x0, x1, q))},${y} C${f(lerp(x0, x1, q) - 20)},${y + 100} ${f(lerp(x0, x1, q) + 30)},${fy - 120} ${f(lerp(x0, x1, q))},${fy - 20}" stroke="#2a2418" stroke-width="22" fill="none" opacity="0.35" filter="url(#b4)"/>`).join('');
    // the rush light: a clip on a stick, a thin smoky flame
    g += `<path d="M1330,${fy} L1330,${fy - 300}" stroke="#3a2a1a" stroke-width="10"/><path d="M1330,${fy - 300} L1300,${fy - 330}" stroke="#2a2a2a" stroke-width="5"/>` + PR.flame(1296, fy - 338, 0.7, t) + G.ENV.smoke(1296, fy - 380, 260, 4, '#8a8478', 0.3);
    // flies circling
    for (let i = 0; i < 5; i++) { const a = t * (2.2 + i * 0.4) + i * 1.7, fx = 560 + Math.cos(a) * (60 + i * 14) + Math.sin(a * 2.3) * 20, fy2 = 1100 + Math.sin(a * 1.3) * (40 + i * 8); g += `<circle cx="${f(fx)}" cy="${f(fy2)}" r="3" fill="#120c08"/><ellipse cx="${f(fx - 2)}" cy="${f(fy2 - 3)}" rx="3" ry="1.5" fill="#c8c8c8" opacity="0.5"/>`; }
    return g;
  };

  // ======================================================= inside your blood: a warm vessel the camera flies down
  // flight(t) = distance travelled. Cells are 3D points that stream toward us; the vessel wall streams outward.
  // o.extra(t, proj) draws particles in the same 3D space; proj(x, y, z) -> [sx, sy, scale] (z in depth units)
  S.vessel = (t, o = {}) => {
    const d = o.dist ? o.dist(t) : t * 5, cx = 540 + (o.cx || 0), cy = 960 + (o.cy || 0), F = 900, ZN = 0.6, ZF = 14;
    const proj = (x, y, z) => [cx + x / z * F, cy + y / z * F, F / z];
    let g = `<defs>${PR.rbcDefs()}<radialGradient id="vsl" cx="${f(cx / 10.8)}%" cy="${f(cy / 19.2)}%" r="75%"><stop offset="0" stop-color="#ff9a5a"/><stop offset="0.12" stop-color="#e05a34"/><stop offset="0.4" stop-color="#9a2216"/><stop offset="0.8" stop-color="#4a0806"/><stop offset="1" stop-color="#1e0202"/></radialGradient></defs>`;
    g += `<rect x="-60" y="-60" width="1200" height="2040" fill="url(#vsl)"/>`;
    // the vessel wall: cobbled lining cells on a cylinder, streaming outward
    const RW = 1.25, rw = rng(7), wall = [];
    for (let i = 0; i < 140; i++) { const a = rw() * 6.28, z0 = rw() * ZF; let z = ((z0 - d) % ZF + ZF) % ZF + ZN; wall.push([a, z, rw()]); }
    wall.sort((p, q) => q[1] - p[1]);
    for (const [a, z, rr] of wall) { const [sx, sy, sc] = proj(Math.cos(a) * RW * 1.0, Math.sin(a) * RW * 1.55, z), fade = cl((ZF - z) / 3) * cl((z - ZN) / 0.4);
      const ln = sc * 0.36, wd = sc * 0.16, ang = Math.atan2(sy - cy, sx - cx) * 180 / Math.PI;
      g += `<g transform="translate(${f(sx)},${f(sy)}) rotate(${f(ang)})" opacity="${f(0.75 * fade)}"><ellipse rx="${f(ln)}" ry="${f(wd)}" fill="${rr > 0.5 ? '#a8301e' : '#8a2216'}" stroke="#d85a3a" stroke-width="${f(Math.max(1, sc * 0.012))}"/><ellipse cx="${f(-ln * 0.2)}" rx="${f(ln * 0.28)}" ry="${f(wd * 0.4)}" fill="#6a1410" opacity="0.6"/></g>`; }
    g += `<radialGradient id="vsl2" cx="${f(cx / 10.8)}%" cy="${f(cy / 19.2)}%" r="60%"><stop offset="0" stop-color="#ffb070" stop-opacity="0.55"/><stop offset="0.3" stop-color="#ff7040" stop-opacity="0.12"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient><rect x="-60" y="-60" width="1200" height="2040" fill="url(#vsl2)"/>`;
    // the red cells, far to near; the nearest go soft
    const rc = rng(11), cells = [];
    for (let i = 0; i < (o.n || 64); i++) { const x = (rc() - 0.5) * 2.0, y = (rc() - 0.5) * 3.0, z0 = rc() * ZF, sp = 0.8 + rc() * 0.5; let z = ((z0 - d * sp) % ZF + ZF) % ZF + ZN; cells.push([x, y, z, rc() * 360, 0.35 + rc() * 0.65, rc() * 6.28]); }
    const items = cells.map(c => ({ z: c[2], draw: () => { const [x, y, z, rot, sq, ph] = c, [sx, sy, sc] = proj(x, y, z), fade = cl((ZF - z) / 3) * cl((z - ZN) / 0.35);
      const s2 = `${PR.rbc(sx, sy, sc * 0.14, rot + t * 30 * Math.sin(ph), Math.abs(Math.cos(ph + t * 0.8)) * 0.7 + 0.3 * sq, fade)}`;
      return z < 1.3 ? `<g filter="url(#b4)">${s2}</g>` : s2; } }));
    if (o.extra) for (const it of o.extra(t, proj)) items.push(it);
    items.sort((p, q) => q.z - p.z);
    g += items.map(it => it.draw()).join('');
    // plasma haze and drifting specks
    g += S.dust(540, 960, 520, 900, 40, 4, t * 3, '#ffd0a0', 2.6, 0.35);
    return g;
  };

  // ======================================================= the doctor's desk, close (top-down, candlelit)
  S.desk9 = (t, o = {}) => {
    const L = [], k = fl(t, 6);
    let d = `<rect x="-900" y="-600" width="2900" height="3200" fill="#3a2010" filter="url(#woodH)"/>`;
    for (let i = 0; i < 18; i++) d += `<path d="M-900,${-560 + i * 180} C-300,${-540 + i * 180} 600,${-580 + i * 180} 2000,${-555 + i * 180}" stroke="#1e1006" stroke-width="3" opacity="0.5"/>`;
    const rg = rng(4); for (let i = 0; i < 40; i++) { const x = -800 + rg() * 2700, y = -500 + rg() * 3000; d += `<path d="M${f(x)},${f(y)} c${f(80 + rg() * 120)},${f(rg() * 20 - 10)} ${f(160 + rg() * 200)},${f(rg() * 20 - 10)} ${f(280 + rg() * 300)},${f(rg() * 16 - 8)}" stroke="#6a4020" stroke-width="2" fill="none" opacity="0.35"/>`; }
    // scattered papers, spectacles, a pocket watch ticking, the inkwell, the sand shaker
    d += `<g transform="rotate(-8 140 1500)"><rect x="-160" y="1300" width="420" height="540" fill="#e2d4b0" ${ol(1)}/>${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<path d="M-120,${1360 + i * 50} q100,-6 180,0 t160,0" stroke="#3a2a1a" stroke-width="3" fill="none" opacity="0.5"/>`).join('')}</g>`;
    d += `<g transform="translate(860,1640) rotate(12)"><circle cx="-60" cy="0" r="46" fill="none" stroke="#8a7a50" stroke-width="7"/><circle cx="60" cy="0" r="46" fill="none" stroke="#8a7a50" stroke-width="7"/><path d="M-14,-4 q14,-14 28,0" stroke="#8a7a50" stroke-width="6" fill="none"/><path d="M-106,0 L-200,30 M106,0 L200,30" stroke="#8a7a50" stroke-width="5"/><ellipse cx="-70" cy="-12" rx="20" ry="8" fill="#fff" opacity="0.3"/><ellipse cx="50" cy="-12" rx="20" ry="8" fill="#fff" opacity="0.3"/></g>`;
    { const wx = 1010, wy = 300, sa = t * 6.28 / 60; d += `<path d="M${wx},${wy - 90} C${wx - 40},${wy - 200} ${wx - 160},${wy - 240} ${wx - 260},${wy - 230}" stroke="#c8a040" stroke-width="5" fill="none"/><circle cx="${wx}" cy="${wy}" r="86" fill="#c8a040" ${ol(1.5)}/><circle cx="${wx}" cy="${wy}" r="70" fill="#f2ecdc"/>` + [...Array(12)].map((_, i) => { const a = i / 12 * 6.28; return `<path d="M${f(wx + Math.sin(a) * 58)},${f(wy - Math.cos(a) * 58)} L${f(wx + Math.sin(a) * 66)},${f(wy - Math.cos(a) * 66)}" stroke="#2a2018" stroke-width="3"/>`; }).join('') + `<path d="M${wx},${wy} L${f(wx + Math.sin(sa) * 60)},${f(wy - Math.cos(sa) * 60)}" stroke="#8a1a12" stroke-width="2"/><path d="M${wx},${wy} L${wx + 30},${wy - 30} M${wx},${wy} L${wx - 6},${wy - 50}" stroke="#1a1410" stroke-width="4" stroke-linecap="round"/><circle cx="${wx}" cy="${wy - 92}" r="14" fill="none" stroke="#c8a040" stroke-width="5"/><ellipse cx="${wx - 30}" cy="${wy - 40}" rx="30" ry="10" fill="#fff" opacity="0.35"/>`; }
    d += `<g transform="translate(240,240)"><ellipse cx="0" cy="20" rx="110" ry="30" fill="#000" opacity="0.4" filter="url(#b8)"/><circle r="90" fill="#3a3a40" ${ol(1.5)}/><circle r="56" fill="#121014"/><circle r="40" fill="#0a080a"/><ellipse cx="-30" cy="-40" rx="30" ry="12" fill="#fff" opacity="0.2"/></g>`;
    d += `<g transform="translate(-140,560)"><circle r="60" fill="#8a7a5a" ${ol(1.3)}/><circle r="44" fill="#6a5a3a"/>${[...Array(9)].map((_, i) => `<circle cx="${f(Math.cos(i * 0.7) * 26)}" cy="${f(Math.sin(i * 0.7) * 26)}" r="4" fill="#2a2018"/>`).join('')}</g>`;
    // the candle in its brass stick, top right; warm light falling across the book
    d += `<g transform="translate(1160,840)"><circle r="110" fill="#b8862e" ${ol(1.5)}/><circle r="70" fill="#d8a848"/><circle r="34" fill="#ece2c8" ${ol(1)}/><circle r="10" fill="#2a1a0e"/></g>` + PR.flame(1160, 820, 1.2, t);
    d += C.radial(1160, 820, 1300, '#ffb050', 0.2 * k, 'screen') + `<rect x="-900" y="-600" width="2900" height="3200" fill="#0a0604" opacity="0.3" style="mix-blend-mode:multiply"/>`;
    L.push({ p: 1, svg: d });
    return L;
  };
})(window);
