// Sets for "The Rabies Boy" (1885): the scientist's laboratory (day, or gaslit night), the bench of drying flasks,
// the Alsatian village road, the hospital ward, your Paris room at night, and the gate of the Institute years later.
// Something always moves: gas flames, dust in light shafts, curtains, smoke, leaves, birds.
(function (G) {
  const S = G.SETS, { f, shade, mix, rng, uid, ol } = G.RIG, C = G.CINE, E = G.ENV, PR = G.PROPS;
  const lg = S.lg;
  const lerp = (a, b, t) => a + (b - a) * t, cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const fl = (t, seed) => 0.86 + 0.08 * Math.sin(t * 9 + seed) + 0.06 * Math.sin(t * 23 + seed * 2);
  const gasFlame = (x, y, s, t, seed) => { const k = fl(t, seed); return `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><path d="M0,0 C-10,-14 -9,-${f(30 * k)} 0,-${f(42 * k)} C9,-${f(30 * k)} 10,-14 0,0Z" fill="#ffe8a8" opacity="0.95"/><path d="M0,-2 C-4,-10 -4,-20 0,-26 C4,-20 4,-10 0,-2Z" fill="#9ac8ff" opacity="0.7"/></g>`; };
  S.gasFlame = gasFlame;
  // a gas wall lamp: brass arm, glass globe, the flame and its pool of light
  const gasLamp = (x, y, s, t, seed, on = 1) => `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><path d="M0,0 L0,40 C0,60 40,60 60,60" stroke="#8a6a2a" stroke-width="7" fill="none"/><circle cx="0" cy="0" r="10" fill="#b8862e" stroke="#4a3410" stroke-width="2"/>` +
    `<path d="M48,60 L72,60 L76,44 L44,44Z" fill="#b8862e" stroke="#4a3410" stroke-width="1.5"/></g>` + (on ? gasFlame(x + 60 * s, y + 44 * s, s, t, seed) : '') +
    `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><path d="M38,44 C30,10 40,-10 60,-12 C80,-10 90,10 82,44Z" fill="#f4f0e2" opacity="0.22" stroke="#d8d4c8" stroke-width="1.5"/></g>` + (on ? C.radial(x + 60 * s, y + 20 * s, 420 * s, '#ffcf80', 0.38 * fl(t, seed) * on, 'screen') : '');
  S.gasLamp = gasLamp;

  // ======================================================= the laboratory
  // world (p 1): floor 1780; the examination table x 250..700, top 1250 (the boy sits at x 470); the doctor stands at
  // x 760; the scientist at x 150. Dog kennels along the left wall (x -1300..-150), rabbit cages on the right (1150..1750).
  // o.night 0..1 (gaslit night with dark windows)
  S.LAB = { FLOOR: 1780, TABLE: [250, 700, 1250], CX: 470, YS: 0.86, WIN: [-120, 230, 300, 980], WP: 0.76 };
  const LAB = S.LAB;
  S.lab = (t, o = {}) => {
    const L = [], nt = o.night || 0, day = 1 - nt, [wx0, wy0, wx1, wy1] = LAB.WIN;
    // back wall: pale green-grey painted plaster above a tiled dado, gas pipes, shelves of glassware, an incubator, a blackboard
    let w = `<rect x="-1800" y="-400" width="4400" height="2400" fill="${mix('#a8b0a0', '#3e4438', nt)}" filter="url(#plaster)"/>`;
    w += `<rect x="-1800" y="1180" width="4400" height="420" fill="${mix('#d8d8cc', '#4a4a42', nt)}"/>`;
    for (let x = -1800; x < 2600; x += 60) w += `<path d="M${x},1180 L${x},1600" stroke="${mix('#a8a89c', '#2a2a24', nt)}" stroke-width="2"/>`;
    for (let y = 1180; y < 1600; y += 60) w += `<path d="M-1800,${y} L2600,${y}" stroke="${mix('#a8a89c', '#2a2a24', nt)}" stroke-width="2"/>`;
    w += `<rect x="-1800" y="1166" width="4400" height="18" fill="#3a3a32"/><path d="M-1800,180 L2600,180" stroke="#6a5a3a" stroke-width="10"/><path d="M-1800,196 L2600,196" stroke="#8a7444" stroke-width="5"/>`;
    // the tall arched window: Paris roofs by day, a dark sky with the moon at night
    w += `<defs><clipPath id="labwin"><path d="M${wx0},${wy1} L${wx0},${wy0 + 200} Q${wx0},${wy0} ${(wx0 + wx1) / 2},${wy0 - 40} Q${wx1},${wy0} ${wx1},${wy0 + 200} L${wx1},${wy1}Z"/></clipPath></defs>`;
    let view = `${lg('labsky', [[0, mix('#9ab4cc', '#0e1428', nt)], [1, mix('#e8e4d8', '#2a304a', nt)]])}<rect x="${wx0 - 20}" y="${wy0 - 80}" width="${wx1 - wx0 + 40}" height="${wy1 - wy0 + 100}" fill="url(#labsky)"/>`;
    for (let i = 0; i < 6; i++) { const bx = wx0 - 20 + i * 80, bh = 120 + (i * 37) % 90; view += `<rect x="${bx}" y="${wy1 - 260 - bh}" width="78" height="${bh + 300}" fill="${mix(['#b8b0a0', '#a8a090', '#c0b8a8'][i % 3], '#141824', nt)}"/><path d="M${bx},${wy1 - 260 - bh} L${bx + 39},${wy1 - 300 - bh} L${bx + 78},${wy1 - 260 - bh}Z" fill="${mix('#5a6a7a', '#0a0e18', nt)}"/><rect x="${bx + 20}" y="${wy1 - 320 - bh}" width="10" height="30" fill="${mix('#8a6a5a', '#141418', nt)}"/>`; for (let k = 0; k < 3; k++) view += `<rect x="${bx + 14 + k * 20}" y="${wy1 - 220 - bh + 30}" width="10" height="16" fill="${nt > 0.5 ? '#ffcf80' : '#3a4a5a'}" opacity="${nt > 0.5 ? 0.8 : 0.6}"/>`; }
    view += E.smoke(wx0 + 120, wy1 - 400, 220, 3 + Math.floor(t) % 3, mix('#d8d4cc', '#3a3a4a', nt), 0.35);
    if (nt > 0.3) view += `<circle cx="${wx1 - 80}" cy="${wy0 + 120}" r="34" fill="#f2ecd8" opacity="${f(nt)}"/>` + C.radial(wx1 - 80, wy0 + 120, 160, '#c8d4f0', 0.25 * nt);
    w += `<rect x="${wx0 - 40}" y="${wy0 - 80}" width="${wx1 - wx0 + 80}" height="${wy1 - wy0 + 120}" fill="#5a5444" ${ol(1.5)}/><g clip-path="url(#labwin)">${view}</g>`;
    for (let i = 1; i < 3; i++) w += `<rect x="${wx0 + (wx1 - wx0) * i / 3 - 5}" y="${wy0 - 40}" width="10" height="${wy1 - wy0 + 40}" fill="#3a3a32"/>`;
    for (let j = 1; j < 5; j++) w += `<rect x="${wx0}" y="${wy0 + (wy1 - wy0) * j / 5 - 4}" width="${wx1 - wx0}" height="8" fill="#3a3a32"/>`;
    w += `<path d="M${wx0},${wy1} L${wx0},${wy0 + 200} Q${wx0},${wy0} ${(wx0 + wx1) / 2},${wy0 - 40} Q${wx1},${wy0} ${wx1},${wy0 + 200} L${wx1},${wy1}" fill="none" stroke="#3a3a32" stroke-width="16"/><rect x="${wx0 - 50}" y="${wy1}" width="${wx1 - wx0 + 100}" height="30" fill="#6a6454" ${ol(1.3)}/>`;
    w += C.radial((wx0 + wx1) / 2, (wy0 + wy1) / 2, 560, mix('#eef2f4', '#6a7a9a', nt), 0.3 * day + 0.08 * nt);
    // shelves of glassware: flasks, retorts, bell jars, bottles of reagents; the drying flasks on the top shelf
    { const sx0 = 380, sx1 = 1080; const rows = [440, 700, 960];
      for (const y of rows) w += `<rect x="${sx0}" y="${y}" width="${sx1 - sx0}" height="20" fill="#4a3a26" ${ol(1.3)}/><rect x="${sx0}" y="${y + 20}" width="${sx1 - sx0}" height="26" fill="#000" opacity="0.22" filter="url(#b4)"/>`;
      for (let i = 0; i < 7; i++) w += PR.cordFlask(sx0 + 50 + i * 96, 440, 0.62, 1 - i / 6, 14 - i * 2, t);
      const rg = rng(4); for (let i = 0; i < 9; i++) { const x = sx0 + 40 + i * 74, kind = i % 3, h = 60 + rg() * 50, col = ['#8ab0a8', '#c8a870', '#a8b8c8'][i % 3];
        if (kind === 0) w += `<path d="M${x - 24},700 C${x - 30},${700 - h * 0.5} ${x - 8},${700 - h * 0.7} ${x - 6},${700 - h} L${x + 6},${700 - h} C${x + 8},${700 - h * 0.7} ${x + 30},${700 - h * 0.5} ${x + 24},700Z" fill="${col}" opacity="0.45" stroke="#4a5a5a" stroke-width="1.5"/><path d="M${x - 20},${700 - 12} L${x + 20},${700 - 12}" stroke="${shade(col, -0.2)}" stroke-width="10" opacity="0.5"/>`;
        else if (kind === 1) w += `<rect x="${x - 18}" y="${700 - h}" width="36" height="${h}" rx="5" fill="${col}" opacity="0.55" stroke="#4a3a2a" stroke-width="1.5"/><rect x="${x - 10}" y="${700 - h - 14}" width="20" height="14" fill="#6a5a40"/><rect x="${x - 14}" y="${700 - h * 0.6}" width="28" height="18" fill="#efe6cc"/>`;
        else w += `<path d="M${x - 26},700 L${x - 26},${700 - h * 0.6} Q${x - 26},${700 - h} ${x},${700 - h} Q${x + 26},${700 - h} ${x + 26},${700 - h * 0.6} L${x + 26},700Z" fill="#dfeeee" opacity="0.25" stroke="#5a7474" stroke-width="1.5"/><circle cx="${x}" cy="${700 - h - 6}" r="6" fill="#5a7474"/>`; }
      for (let i = 0; i < 8; i++) { const x = sx0 + 50 + i * 84; w += `<path d="M${x - 14},960 L${x - 14},900 L${x - 4},880 L${x - 4},860 L${x + 4},860 L${x + 4},880 L${x + 14},900 L${x + 14},960Z" fill="${['#5a3a1e', '#2a4a3a', '#6a5a2a'][i % 3]}" opacity="0.85" stroke="#1a1410" stroke-width="1.2"/>`; }
      w += C.radial(730, 600, 600, '#ffcf80', 0.12 + 0.2 * nt); }
    // the copper incubator with its thermometer and little door, a blackboard of notes
    w += `<rect x="1170" y="560" width="300" height="440" rx="10" fill="#9a5a2a" ${ol(1.6)}/><rect x="1196" y="600" width="248" height="300" rx="6" fill="#7a4420" ${ol(1.2)}/><circle cx="1420" cy="630" r="16" fill="#c8a040" ${ol(1)}/><rect x="1300" y="520" width="12" height="60" fill="#e8e4dc" ${ol(1)}/><rect x="1302" y="548" width="8" height="30" fill="#b81e1e"/><path d="M1180,580 L1460,580" stroke="#e8a060" stroke-width="3" opacity="0.5"/>`;
    w += `<rect x="1540" y="380" width="420" height="300" fill="#1e2420" stroke="#4a3a26" stroke-width="14"/>` + ['Rage — chien n°17', 'moelle 14 j.', 'moelle 1 j. → mort 7 j.'].map((s2, i) => `<text x="1570" y="${450 + i * 60}" font-family="Segoe Script, Brush Script MT, cursive" font-size="28" fill="#e8e8e0" opacity="0.8">${s2}</text>`).join('');
    // gas pipes and wall lamps
    w += `<path d="M-1800,300 L2600,300" stroke="#5a5a52" stroke-width="10"/>` + [-700, 340, 1120, 1980].map((x, i) => gasLamp(x, 300, 1.2, t, i * 3, 1)).join('');
    w += `<rect x="-1800" y="-400" width="4400" height="2400" fill="#0a0c14" opacity="${f(0.34 * nt)}" style="mix-blend-mode:multiply"/>`;
    L.push({ p: LAB.WP, svg: w });
    // the dog kennels along the left (p 0.88): iron-barred pens with dogs sitting, standing, one barking
    let k = '';
    for (let i = 0; i < 4; i++) { const x0 = -1500 + i * 330, y0 = 1560;
      k += `<rect x="${x0}" y="${y0 - 360}" width="300" height="360" fill="#2a2018" ${ol(1.4)}/>` + E.straw(x0 + 10, x0 + 290, y0 - 40, y0 - 4, 40, i + 3, '#a88a50');
      k += PR.dog(x0 + 150 + (i % 2 ? 0 : -20), y0 - 20, 0.78, t + i, { col: ['#7a5a3a', '#3a3028', '#a88a5a', '#5a4632'][i], jaw: i === 1 ? 0.4 + 0.3 * Math.sin(t * 7) : 0, mad: i === 1 ? 0.6 : 0, headA: i === 1 ? -8 : 14 + 6 * Math.sin(t * 1.3 + i) });
      for (let b = 1; b < 10; b++) k += `<path d="M${x0 + b * 30},${y0 - 360} L${x0 + b * 30},${y0}" stroke="#2a2a2c" stroke-width="6"/>`;
      k += `<rect x="${x0}" y="${y0 - 368}" width="300" height="16" fill="#1a1a1c"/><rect x="${x0 + 110}" y="${y0 - 404}" width="80" height="30" fill="#efe6cc" stroke="#6a5a3a" stroke-width="1"/><text x="${x0 + 150}" y="${y0 - 382}" font-family="Segoe Script, Brush Script MT, cursive" font-size="17" text-anchor="middle" fill="#2a1a10">n° ${12 + i}</text>`; }
    // the rabbit cages stacked on the right
    for (let r2 = 0; r2 < 2; r2++) for (let i = 0; i < 3; i++) { const x0 = 1220 + i * 200, y0 = 1560 - r2 * 230;
      k += PR.cageBack(x0, y0, 180, 210) + PR.rabbit(x0 + 92, y0 - 30, 0.75, t + i * 2 + r2, { sick: (i + r2) % 3 === 2 ? 0.7 : 0, col: ['#b8a890', '#efeae2', '#8a7a68'][(i + r2) % 3] }) + PR.cageFront(x0, y0, 180, 210, r2 ? '' : ['14 j.', '7 j.', '1 j.'][i]); }
    k += `<rect x="-1800" y="-400" width="4400" height="2400" fill="#0a0c14" opacity="${f(0.22 * nt)}" style="mix-blend-mode:multiply"/>`;
    // at night a lantern hangs over the kennels, pooling warm light on the pens
    if (nt > 0) k += `<path d="M-860,1020 L-860,1090" stroke="#2a2a2a" stroke-width="4"/><rect x="-878" y="1090" width="36" height="46" rx="6" fill="#ffd890" opacity="${f(0.85 * nt)}" stroke="#3a2a10" stroke-width="3"/>` + C.radial(-860, 1300, 760, '#ffb860', 0.34 * nt * fl(t, 7), 'screen');
    L.push({ p: 0.9, svg: k });
    // floor: worn parquet; the light from the window by day, the gas pools at night
    let fl0 = `<rect x="-2000" y="1540" width="4800" height="1400" fill="${mix('#6a4a2a', '#2a1c10', nt)}" filter="url(#woodH)"/>`;
    for (let i = 0; i < 14; i++) fl0 += `<path d="M-2000,${1560 + i * 40 + i * i * 3} L2800,${1560 + i * 40 + i * i * 3}" stroke="#1e1208" stroke-width="3" opacity="0.6"/>`;
    fl0 += `<rect x="-2000" y="1540" width="4800" height="60" fill="#000" opacity="0.3" filter="url(#b8)"/>`;
    fl0 += `<path d="M-200,1560 L340,1560 L900,2300 L0,2300Z" fill="#f4f0e6" opacity="${f(0.12 * day)}" filter="url(#b14)"/>`;
    L.push({ p: 1, svg: fl0 });
    // light: a shaft from the window with dust drifting in it (day); warm gas glow (night)
    L.push({ p: 1.02, light: true, svg: `<path d="M-120,250 L300,250 L1000,1900 L300,1900Z" fill="#f4f0e6" opacity="${f(0.08 * day)}" style="mix-blend-mode:screen" filter="url(#b14)"/>` + S.dust(380, 1000, 420, 620, 34, 21, t, '#f4f0e6', 2.2, 0.5 * day + 0.2 * nt) });
    // foreground: the corner of a bench with a retort stand, out of focus
    L.push({ p: 1.3, svg: `<g filter="url(#dof1)"><rect x="-700" y="1650" width="520" height="900" fill="#2a1c10"/><path d="M-260,1650 L-260,1200" stroke="#3a3a3a" stroke-width="12"/></g>` });
    return L;
  };
  // the examination table (character layer): a folded grey blanket on oak, turned legs, a drawer with a brass pull;
  // the tray with the syringe's spare needles and a basin on the right end
  S.labTable = (t, o = {}) => {
    const [x0, x1, top] = LAB.TABLE, fy = LAB.FLOOR;
    let g = `<rect x="${x0 - 10}" y="${top - 26}" width="${x1 - x0 + 20}" height="32" rx="6" fill="#8a8a84" ${ol(1.4)}/><path d="M${x0},${top - 18} L${x1},${top - 18}" stroke="#b8b8b0" stroke-width="4" opacity="0.6"/><path d="M${x0 + 30},${top - 10} L${x0 + 30},${top + 24} M${x1 - 40},${top - 10} L${x1 - 40},${top + 20}" stroke="#5a5a54" stroke-width="3" opacity="0.6"/>`;
    g += `<rect x="${x0 - 16}" y="${top}" width="${x1 - x0 + 32}" height="30" fill="#6a4426" ${ol(1.5)} filter="url(#woodH)"/><rect x="${x0}" y="${top + 30}" width="${x1 - x0}" height="80" fill="#5a3a20" ${ol(1.3)}/><rect x="${(x0 + x1) / 2 - 70}" y="${top + 46}" width="140" height="48" rx="4" fill="#4a2e18" ${ol(1)}/><circle cx="${(x0 + x1) / 2}" cy="${top + 70}" r="7" fill="#c8a040"/>`;
    for (const x of [x0 + 20, x1 - 20]) g += `<path d="M${x - 16},${top + 110} L${x + 16},${top + 110} L${x + 10},${fy - 14} L${x - 10},${fy - 14}Z" fill="#5a3a20" ${ol(1.3)}/>` + [0.3, 0.65].map(q => `<ellipse cx="${x}" cy="${f(lerp(top + 110, fy, q))}" rx="20" ry="8" fill="#6a4426" ${ol(1)}/>`).join('');
    g += `<rect x="${x0 + 30}" y="${fy - 120}" width="${x1 - x0 - 60}" height="16" fill="#4a2e18" ${ol(1)}/>`;
    // the side table with the instrument tray, a basin, a bottle of broth (right of the examination table, behind the doctor)
    if (o.tray !== false) { const tx = 1000, ty = 1330;
      g += `<rect x="${tx - 120}" y="${ty}" width="240" height="22" fill="#5a3a20" ${ol(1.3)}/><path d="M${tx - 104},${ty + 22} L${tx - 104},${fy - 10} M${tx + 104},${ty + 22} L${tx + 104},${fy - 10}" stroke="#4a2e18" stroke-width="14"/>`;
      g += `<rect x="${tx - 96}" y="${ty - 14}" width="120" height="14" rx="3" fill="#c8ccd0" ${ol(1)}/><ellipse cx="${tx + 60}" cy="${ty - 8}" rx="44" ry="10" fill="#e8e8e2" ${ol(1)}/><path d="M${tx + 40},${ty - 10} l40,0" stroke="#c8a890" stroke-width="5" opacity="0.6"/>`;
      g += `<path d="M${tx - 30},${ty - 14} L${tx - 30},${ty - 70} L${tx - 20},${ty - 84} L${tx - 20},${ty - 100} L${tx - 8},${ty - 100} L${tx - 8},${ty - 84} L${tx + 2},${ty - 70} L${tx + 2},${ty - 14}Z" fill="#e8d8b0" opacity="0.7" stroke="#6a5a3a" stroke-width="1.5"/>`; }
    return g;
  };

  // ======================================================= the bench of drying flasks (close-up world, no people)
  // a long shelf of flasks from day 14 (dry, brown) to day 1 (fresh, red) running right; below it the bench with the
  // mortar, a beaker of broth, the syringe; a rabbit cage glows behind. o.night 0..1
  S.BENCH = { SHELF: 900, TOP: 1500, FL: [-200, 2300] };
  S.bench = (t, o = {}) => {
    const L = [], nt = o.night || 0;
    let w = `<rect x="-1400" y="-500" width="5200" height="2800" fill="${mix('#8a9284', '#2a2e26', nt)}" filter="url(#plaster)"/><rect x="-1400" y="1300" width="5200" height="900" fill="${mix('#c8c8bc', '#3a3a34', nt)}"/>`;
    for (let x = -1400; x < 3800; x += 70) w += `<path d="M${x},1300 L${x},2200" stroke="#8a8a80" stroke-width="2" opacity="0.6"/>`;
    // blurred rabbit cages on the far wall, one rabbit lying still
    let cg = '';
    for (let i = 0; i < 6; i++) { const x0 = -900 + i * 520, y0 = 700; cg += PR.cageBack(x0, y0, 300, 260) + PR.rabbit(x0 + 150, y0 - 40, 0.95, t + i, { sick: 0.2 * (i % 2), dead: i === 2 ? 1 : 0, col: ['#b8a890', '#efeae2', '#8a7a68'][i % 3] }) + PR.cageFront(x0, y0, 300, 260, ''); }
    w += `<g filter="url(#dof1)" opacity="0.9">${cg}</g>`;
    w += gasLamp(-300, 200, 1.3, t, 2, 1) + gasLamp(1400, 200, 1.3, t, 5, 1) + gasLamp(2900, 200, 1.3, t, 8, 1);
    w += `<rect x="-1400" y="-500" width="5200" height="2800" fill="#0a0c14" opacity="${f(0.35 * nt)}" style="mix-blend-mode:multiply"/>`;
    L.push({ p: 0.7, svg: w });
    // the shelf of drying flasks: fourteen of them, oldest at the left; a warm light rises toward the fresh end
    let sh = `<rect x="-400" y="${S.BENCH.SHELF}" width="3000" height="34" fill="#4a3a26" ${ol(1.6)}/><rect x="-400" y="${S.BENCH.SHELF + 34}" width="3000" height="40" fill="#000" opacity="0.3" filter="url(#b8)"/>`;
    for (let i = 0; i < 14; i++) { const x = -200 + i * 180, d = 1 - i / 13; sh += PR.cordFlask(x, S.BENCH.SHELF, 1.0, d, 14 - i, t, { glow: (o.glow || 0) * (i / 13) }); }
    sh += C.radial(2200, 700, 900, '#ff9a6a', 0.15 + 0.25 * (o.glow || 0), 'screen');
    L.push({ p: 0.88, svg: sh });
    // the bench top: oak, a white cloth, the mortar, a beaker of broth, glass dishes, a scalpel
    let b = `<rect x="-1400" y="${S.BENCH.TOP}" width="5200" height="900" fill="#5a3a20" filter="url(#woodH)"/><rect x="-1400" y="${S.BENCH.TOP}" width="5200" height="14" fill="#8a6a40"/>`;
    b += `<path d="M300,${S.BENCH.TOP + 20} L1300,${S.BENCH.TOP + 10} L1340,${S.BENCH.TOP + 260} L260,${S.BENCH.TOP + 270}Z" fill="#efece4" ${ol(1.2)}/>`;
    b += `<g transform="translate(1200,${S.BENCH.TOP + 120})"><path d="M-70,-150 L70,-150 L60,0 L-60,0Z" fill="#e8dcc0" opacity="0.5" stroke="#6a6a60" stroke-width="2"/><rect x="-62" y="-90" width="124" height="88" fill="#d8c890" opacity="0.6"/><path d="M-60,-90 L60,-90" stroke="#fff" stroke-width="3" opacity="0.6"/></g>`;
    b += `<ellipse cx="520" cy="${S.BENCH.TOP + 160}" rx="110" ry="22" fill="#dfeeee" opacity="0.4" stroke="#5a7474" stroke-width="2"/><ellipse cx="380" cy="${S.BENCH.TOP + 200}" rx="80" ry="16" fill="#dfeeee" opacity="0.4" stroke="#5a7474" stroke-width="2"/>`;
    b += `<path d="M1450,${S.BENCH.TOP + 200} L1650,${S.BENCH.TOP + 170}" stroke="#c8ccd0" stroke-width="6"/><path d="M1620,${S.BENCH.TOP + 174} L1700,${S.BENCH.TOP + 160}" stroke="#2a1a10" stroke-width="10" stroke-linecap="round"/>`;
    L.push({ p: 1, svg: b });
    L.push({ p: 1.02, light: true, svg: S.dust(900, 1200, 900, 600, 40, 31, t, '#ffe8c0', 2.2, 0.4) });
    return L;
  };

  // ======================================================= the Alsatian village road (morning, two days earlier)
  // the boy walks along the road behind a low stone wall (top 1560, it hides his shins); the dog comes from the right
  S.ROAD = { FY: 1700, WALL: 1560 };
  S.road = (t, o = {}) => {
    const L = [];
    let sky = `${lg('rdsky', [[0, '#7aa0c8'], [0.6, '#c8d8e4'], [1, '#f4e6c8']])}<rect x="-1600" y="-1400" width="4800" height="2700" fill="url(#rdsky)"/>`;
    for (const [cx, cy, w2, sd] of [[-300, 200, 700, 4], [800, 80, 820, 7], [1800, 260, 640, 9]]) sky += E.cloud(cx + t * 14, cy, w2, w2 * 0.28, sd, { op: 0.9 });
    sky += E.birds(200 + t * 50, 360, 6, 4, 1.2, '#2a2a30');
    L.push({ p: 0.15, svg: sky });
    // the hills with rows of vines and a castle ruin on the ridge
    let far = `<g transform="translate(-1600,0)">${E.ridge(4800, 980, 200, 13, '#6a8a6a', 240)}</g>`;
    far += `<path d="M1300,860 L1300,800 L1320,800 L1320,780 L1340,780 L1340,800 L1380,800 L1380,760 L1400,760 L1400,800 L1420,800 L1420,860Z" fill="#7a7a6e" opacity="0.8"/>`;
    for (let r2 = 0; r2 < 9; r2++) far += `<path d="M-1600,${1000 + r2 * 22} C-600,${980 + r2 * 22} 600,${1010 + r2 * 22} 3200,${990 + r2 * 22}" stroke="#4a6a3a" stroke-width="6" stroke-dasharray="10 8" opacity="0.6"/>`;
    far += `<g transform="translate(-1600,0)">${E.ridge(4800, 1100, 90, 17, '#5a7a4a', 200)}</g>`;
    L.push({ p: 0.35, svg: far });
    // the village: half-timbered houses with steep roofs and flower boxes, the church spire, smoke
    let v = '';
    v += `<path d="M560,1180 L560,700 L600,620 L640,700 L640,1180Z" fill="#c8b8a0" ${ol(1.4)}/><path d="M548,710 L600,420 L652,710Z" fill="#5a3a2a" ${ol(1.4)}/><circle cx="600" cy="780" r="22" fill="#e8e0c8" ${ol(1)}/><path d="M600,420 L600,380 M588,396 L612,396" stroke="#3a3a3a" stroke-width="4"/>`;
    const houses = [[-700, 0.9, '#e8dcc0', '#a83a2a'], [-260, 0.8, '#f0e4c8', '#8a3a2a'], [150, 0.86, '#e2d4b8', '#9a4a2a'], [780, 0.84, '#efe2c4', '#a84a3a'], [1220, 0.92, '#e8dcbc', '#8a3a2a'], [1680, 0.86, '#f2e6cc', '#9a3a2a']];
    for (const [hx, s2, wall, roof] of houses) { const W2 = 360 * s2, H2 = 300 * s2, yb = 1260;
      v += `<rect x="${hx}" y="${yb - H2}" width="${W2}" height="${H2}" fill="${wall}" filter="url(#plaster)" ${ol(1.3)}/>`;
      v += `<path d="M${hx - 20},${yb - H2} L${hx + W2 / 2},${yb - H2 - 240 * s2} L${hx + W2 + 20},${yb - H2}Z" fill="${roof}" filter="url(#tex)" ${ol(1.4)}/>`;
      for (const xx of [0, 0.33, 0.66, 1]) v += `<path d="M${f(hx + W2 * xx)},${yb - H2} L${f(hx + W2 * xx)},${yb}" stroke="#4a2e18" stroke-width="${f(10 * s2)}"/>`;
      v += `<path d="M${hx},${f(yb - H2 * 0.5)} L${hx + W2},${f(yb - H2 * 0.5)} M${hx},${yb - H2} L${f(hx + W2 * 0.33)},${f(yb - H2 * 0.5)} M${f(hx + W2 * 0.66)},${f(yb - H2 * 0.5)} L${hx + W2},${yb - H2}" stroke="#4a2e18" stroke-width="${f(8 * s2)}"/>`;
      for (const xx of [0.12, 0.72]) { const wx = hx + W2 * xx, wy = yb - H2 * 0.9; v += `<rect x="${f(wx)}" y="${f(wy)}" width="${f(W2 * 0.16)}" height="${f(H2 * 0.24)}" fill="#3a4a5a" ${ol(1)}/><rect x="${f(wx - 4)}" y="${f(wy + H2 * 0.24)}" width="${f(W2 * 0.16 + 8)}" height="${f(14 * s2)}" fill="#6a4424"/>` + [0, 1, 2].map(i => `<circle cx="${f(wx + 8 + i * W2 * 0.05)}" cy="${f(wy + H2 * 0.24 - 4)}" r="${f(7 * s2)}" fill="${['#d83040', '#f0a030', '#e04860'][i]}"/>`).join(''); }
      v += `<rect x="${f(hx + W2 * 0.4)}" y="${f(yb - H2 * 0.42)}" width="${f(W2 * 0.18)}" height="${f(H2 * 0.42)}" fill="#5a3a20" ${ol(1)}/>`;
      v += `<rect x="${f(hx + W2 * 0.7)}" y="${f(yb - H2 - 160 * s2)}" width="${f(24 * s2)}" height="${f(70 * s2)}" fill="#7a5a4a"/>` + E.smoke(hx + W2 * 0.7 + 12 * s2, yb - H2 - 170 * s2, 160 * s2, 2 + Math.floor(t * 0.6 + hx) % 3, '#e8e4dc', 0.3); }
    L.push({ p: 0.62, svg: v });
    // the road, a cart track, a well, an orchard tree, a barn gate the dog comes out of
    let rd = `<path d="M-1600,1260 L3200,1260 L3200,2600 L-1600,2600Z" fill="#a89070" filter="url(#ground)"/><path d="M-1600,1380 C-400,1360 800,1400 3200,1370 L3200,1520 C800,1560 -400,1520 -1600,1540Z" fill="#c8b08a" opacity="0.6"/>`;
    rd += `<path d="M-1600,1430 C-400,1410 800,1450 3200,1420 M-1600,1490 C-400,1470 800,1510 3200,1480" stroke="#8a7458" stroke-width="6" fill="none" opacity="0.6"/>`;
    rd += E.oak(-500, 1300, 0.9, 7, {}) + E.oak(2300, 1290, 1.0, 11, {});
    rd += `<rect x="1500" y="1080" width="300" height="220" fill="#6a4a2a" ${ol(1.4)} filter="url(#woodV)"/><path d="M1500,1080 L1650,1000 L1800,1080Z" fill="#8a3a2a" ${ol(1.3)}/>` + [1540, 1620, 1700].map(x => `<path d="M${x},1090 L${x},1300" stroke="#3a2414" stroke-width="5"/>`).join('');
    L.push({ p: 0.9, svg: rd });
    // the low stone wall in front (hides legs), wild flowers and grass along it
    let wl = `<path d="M-1600,${S.ROAD.WALL} L3200,${S.ROAD.WALL} L3200,2400 L-1600,2400Z" fill="#9a9080"/>`;
    const rs = rng(23); for (let r2 = 0; r2 < 5; r2++) for (let x = -1600; x < 3200; x += 70 + rs() * 50) { const y = S.ROAD.WALL + r2 * 48 + rs() * 8, w2 = 60 + rs() * 50; wl += `<rect x="${f(x)}" y="${f(y)}" width="${f(w2)}" height="44" rx="12" fill="${['#a89c88', '#8a8070', '#b8ac98'][Math.floor(rs() * 3)]}" stroke="#4a443a" stroke-width="2"/>`; }
    wl += `<path d="M-1600,${S.ROAD.WALL} L3200,${S.ROAD.WALL}" stroke="#6a6458" stroke-width="10"/>`;
    const rg = rng(31); for (let i = 0; i < 160; i++) { const x = -1600 + rg() * 4800, h = 30 + rg() * 60, a = (rg() - 0.5) * 0.6 + Math.sin(t * 1.6 + x * 0.01) * 0.08; wl += `<path d="M${f(x)},${S.ROAD.WALL + 6} q${f(Math.sin(a) * h * 0.5)},${f(-h * 0.6)} ${f(Math.sin(a) * h)},${f(-h)}" stroke="#4a6a2a" stroke-width="${f(3 + rg() * 3)}" fill="none" stroke-linecap="round"/>`; if (i % 6 === 0) wl += `<circle cx="${f(x + Math.sin(a) * h)}" cy="${f(S.ROAD.WALL + 6 - h)}" r="6" fill="${['#e8e040', '#f4f4f0', '#c83a5a'][i % 3]}"/>`; }
    L.push({ p: 1.08, svg: wl });
    L.push({ p: 1.32, svg: `<g filter="url(#dof1)">${E.herbs(-400, -300, 600, '#3a5a2a', 9)}<path d="M-600,-300 C-300,100 -200,300 -260,700" stroke="#2a3a1a" stroke-width="30" fill="none"/></g>` });
    return L;
  };

  // ======================================================= the hospital ward (rows of iron beds, tall windows, sisters)
  // world: the dying man's bed in front at x 560 (quilt line 1420, foot 1600); rows of beds recede behind
  S.WARD = { BED: [300, 820], QUILT: 1420, FOOT: 1600, FY: 1780 };
  S.ward = (t, o = {}) => {
    const L = [];
    let w = `<rect x="-1800" y="-500" width="5200" height="2600" fill="#cfc6b0" filter="url(#plaster)"/><rect x="-1800" y="1050" width="5200" height="600" fill="#a89a80"/>`;
    // tall windows with light, a crucifix, a holy-water stoup, a clock
    for (let i = 0; i < 5; i++) { const x = -1500 + i * 900; w += `<rect x="${x}" y="80" width="300" height="760" fill="#e8ecee" ${ol(1.5)}/><path d="M${x},80 Q${x + 150},-40 ${x + 300},80" fill="#e8ecee" stroke="#3a3a32" stroke-width="3"/>` + [1, 2].map(k => `<path d="M${x + k * 100},40 L${x + k * 100},840" stroke="#5a5444" stroke-width="8"/>`).join('') + [1, 2, 3].map(k => `<path d="M${x},${80 + k * 190} L${x + 300},${80 + k * 190}" stroke="#5a5444" stroke-width="7"/>`).join('') + C.radial(x + 150, 460, 520, '#f4f4ee', 0.3); }
    w += `<rect x="586" y="260" width="16" height="140" fill="#3a2414"/><rect x="552" y="296" width="84" height="14" fill="#3a2414"/><path d="M594,300 l-3,40 l6,0Z" fill="#d8c8a8"/>`;
    w += PR.wallClock(1200, 300, 0.9, t, { hour: 4, min: 20 });
    L.push({ p: 0.68, svg: w });
    // the rows of beds receding: white curtains, bodies under sheets, a sister pulling a sheet over a face
    let rows = '';
    for (let i = 0; i < 7; i++) { const x = -1300 + i * 520, y = 1240, s2 = 0.62;
      rows += `<g transform="translate(${x},${y}) scale(${s2})"><rect x="-160" y="-260" width="320" height="260" fill="#f2efe6" opacity="0.7" stroke="#b8b0a0" stroke-width="2"/><path d="M-170,-40 L170,-40 L170,40 L-170,40Z" fill="#e8e4d8" stroke="#6a6a60" stroke-width="3"/><path d="M-170,40 L-170,140 M170,40 L170,140" stroke="#3a3a3c" stroke-width="10"/><path d="M-176,-140 L-176,40 M176,-110 L176,40" stroke="#3a3a3c" stroke-width="10"/>` +
        (i % 2 ? `<path d="M-140,-40 C-100,-90 60,-90 140,-50 L140,-40Z" fill="#f4f2ea" stroke="#9a968a" stroke-width="2"/><ellipse cx="-110" cy="-70" rx="34" ry="26" fill="#f4f2ea" stroke="#9a968a" stroke-width="2"/>` : `<path d="M-140,-40 C-100,-80 60,-80 140,-50 L140,-40Z" fill="#c8c4b4" stroke="#6a6a60" stroke-width="2"/><circle cx="-110" cy="-70" r="26" fill="#d8b090"/>`) + `</g>`; }
    rows += `<path d="M-1800,980 L3400,980" stroke="#8a8478" stroke-width="5"/>`;
    for (let i = 0; i < 10; i++) { const x = -1500 + i * 520 + Math.sin(t * 0.8 + i) * 8; rows += `<path d="M${x},980 C${x + 10},1100 ${x - 10},1200 ${x + 6},1260 L${x + 60},1260 C${x + 50},1180 ${x + 70},1080 ${x + 60},980Z" fill="#f4f2ec" opacity="0.75" stroke="#c8c4b8" stroke-width="2"/>`; }
    // a distant sister walking between the beds (silhouette in her cornette)
    { const sx = 1600 - ((t * 60) % 2400); rows += `<g transform="translate(${f(sx)},1250) scale(0.42)" fill="#3a4a6a"><path d="M-60,0 L-80,-500 C-80,-560 80,-560 80,-500 L60,0Z"/><circle cx="0" cy="-620" r="60" fill="#e8c8a8"/><path d="M-50,-660 C-150,-720 -230,-780 -250,-860 C-180,-800 -100,-760 -30,-700Z M50,-660 C150,-720 230,-780 250,-860 C180,-800 100,-760 30,-700Z" fill="#fbfaf6"/></g>`; }
    L.push({ p: 0.85, svg: rows });
    let fl0 = `<rect x="-2000" y="1500" width="5400" height="1300" fill="#8a7a62" filter="url(#ground)"/>`;
    for (let i = 0; i < 12; i++) fl0 += `<path d="M-2000,${1520 + i * 50 + i * i * 4} L3400,${1520 + i * 50 + i * i * 4}" stroke="#5a4e3e" stroke-width="3" opacity="0.6"/>`;
    for (let i = 0; i < 30; i++) { const x = -2000 + i * 200; fl0 += `<path d="M${x},1500 L${x - 300 + i * 20},2800" stroke="#5a4e3e" stroke-width="2" opacity="0.4"/>`; }
    L.push({ p: 1, svg: fl0 });
    L.push({ p: 1.02, light: true, svg: [-1500, -600, 300, 1200].map(x => `<path d="M${x},80 L${x + 300},80 L${x + 700},1800 L${x + 200},1800Z" fill="#f4f4ee" opacity="0.07" style="mix-blend-mode:screen" filter="url(#b14)"/>`).join('') + S.dust(600, 900, 900, 600, 34, 41, t, '#f4f4ee', 2.2, 0.45) });
    return L;
  };
  // the dying man's bed (character layer): iron headboard and pillows (behind), the sheet over him, straps, the footboard
  S.wardBedBack = () => { const [x0, x1] = S.WARD.BED; return `<path d="M${x0 - 20},1600 L${x0 - 20},980 C${x0 - 20},920 ${x1 + 20},920 ${x1 + 20},980 L${x1 + 20},1600" fill="none" stroke="#2a2a2c" stroke-width="16"/>` + [0.2, 0.4, 0.6, 0.8].map(k => `<path d="M${f(lerp(x0, x1, k))},950 L${f(lerp(x0, x1, k))},1300" stroke="#2a2a2c" stroke-width="8"/>`).join('') + `<path d="M${x0 + 20},1220 C${x0 + 40},1120 ${x1 - 40},1120 ${x1 - 20},1220 L${x1 - 10},1330 L${x0 + 10},1330Z" fill="#f2efe6" ${ol(1.4)}/>`; };
  S.wardSheet = (t, o = {}) => {
    const [x0, x1] = S.WARD.BED, q = S.WARD.QUILT, fb = S.WARD.FOOT, th = o.thrash || 0, wob = th * 6 * Math.sin(t * 23);
    const top = `M${x0 - 20},${q + 30} C${x0 + 60},${q - 6 + wob} ${x0 + 200},${q - 26} ${(x0 + x1) / 2},${q - 20 - wob} C${x1 - 200},${q - 26} ${x1 - 60},${q - 4} ${x1 + 20},${q + 30}`;
    let g = `<path d="${top} L${x1 + 40},${fb + 30} L${x0 - 40},${fb + 30}Z" fill="#ece8dc" ${ol(1.5)} filter="url(#cloth)"/>`;
    g += [0.3, 0.55, 0.8].map(k => `<path d="M${f(lerp(x0, x1, k))},${q} C${f(lerp(x0, x1, k) - 20)},${q + 80} ${f(lerp(x0, x1, k) + 16)},${fb - 80} ${f(lerp(x0, x1, k) - 6)},${fb + 20}" stroke="#a8a498" stroke-width="20" fill="none" opacity="0.35" filter="url(#b4)"/>`).join('');
    // the leather restraints across his chest and his legs, buckled to the frame
    g += PR.strap((x0 + x1) / 2, q - 80 + wob * 0.5, x1 - x0 + 60, 34, 0, { tail: 0.4 }) + PR.strap((x0 + x1) / 2, q + 90, x1 - x0 + 70, 34, 0, { tail: 0.4 });
    return g;
  };
  S.wardBedFront = () => { const [x0, x1] = S.WARD.BED, fb = S.WARD.FOOT, fy = S.WARD.FY; return `<path d="M${x0 - 40},${fy} L${x0 - 40},${fb - 40} L${x1 + 40},${fb - 40} L${x1 + 40},${fy}" fill="none" stroke="#2a2a2c" stroke-width="18"/>` + [0.15, 0.3, 0.45, 0.6, 0.75, 0.9].map(k => `<path d="M${f(lerp(x0 - 40, x1 + 40, k))},${fb - 40} L${f(lerp(x0 - 40, x1 + 40, k))},${fb + 90}" stroke="#2a2a2c" stroke-width="8"/>`).join('') + `<path d="M${x0 - 40},${fb + 90} L${x1 + 40},${fb + 90}" stroke="#2a2a2c" stroke-width="10"/><rect x="${(x0 + x1) / 2 - 60}" y="${fb - 20}" width="120" height="60" fill="#efe6cc" stroke="#5a4a30" stroke-width="2"/><text x="${(x0 + x1) / 2}" y="${fb + 18}" font-family="Segoe Script, Brush Script MT, cursive" font-size="22" text-anchor="middle" fill="#7a1a1a">Rage</text>`; };

  // ======================================================= your room in Paris (night -> mornings)
  // bed centred x 520 (quilt line 1400, foot 1610); nightstand at x 900 with the glass of water and a candle; the window
  // (p 0.8) x 620..900; o.night 0..1, o.dawn 0..1, o.days (number of days passed, for the calendar)
  S.ROOM = { BED: [240, 800], QUILT: 1400, FOOT: 1610, FY: 1790, WIN: [640, 380, 920, 760], STAND: [960, 1420] };
  S.room = (t, o = {}) => {
    const L = [], nt = o.night || 0, dw = o.dawn || 0, [wx0, wy0, wx1, wy1] = S.ROOM.WIN;
    let w = `<rect x="-900" y="-400" width="2900" height="2400" fill="#c8b48e" filter="url(#plaster)"/>`;
    // faded flowered wallpaper
    const rw = rng(9); for (let i = 0; i < 90; i++) { const x = -880 + (i % 15) * 190 + (Math.floor(i / 15) % 2) * 95, y = -360 + Math.floor(i / 15) * 210; w += `<g transform="translate(${x},${y})" opacity="0.35"><circle r="10" fill="#8a4a3a"/><path d="M0,10 q-10,30 0,50 M0,10 q10,30 0,50" stroke="#5a6a3a" stroke-width="3" fill="none"/><circle cx="-14" cy="-6" r="6" fill="#a86a4a"/><circle cx="14" cy="-6" r="6" fill="#a86a4a"/></g>`; }
    w += `<rect x="-900" y="1300" width="2900" height="40" fill="#5a3a20"/><rect x="-900" y="1340" width="2900" height="700" fill="#7a5a3a" opacity="0.8"/>`;
    // the window: Paris roofs and chimney pots; sky by day, the moon by night, gold at dawn
    const skyTop = mix(mix('#8aa4c0', '#0c1226', nt), '#f0b878', dw), skyBot = mix(mix('#e0e0d8', '#262c48', nt), '#ffe0a8', dw);
    w += `<defs><linearGradient id="rmsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${skyTop}"/><stop offset="1" stop-color="${skyBot}"/></linearGradient><clipPath id="rmwin"><rect x="${wx0}" y="${wy0}" width="${wx1 - wx0}" height="${wy1 - wy0}"/></clipPath></defs>`;
    let view = `<rect x="${wx0}" y="${wy0}" width="${wx1 - wx0}" height="${wy1 - wy0}" fill="url(#rmsky)"/>`;
    if (nt > 0.05) view += `<g opacity="${f(nt)}"><circle cx="${wx0 + 200}" cy="${wy0 + 80}" r="28" fill="#f4eed8"/>${[[30, 50], [120, 130], [240, 40], [70, 190]].map(([x, y]) => `<circle cx="${wx0 + x}" cy="${wy0 + y}" r="2" fill="#fff" opacity="0.8"/>`).join('')}</g>`;
    for (let i = 0; i < 5; i++) { const bx = wx0 - 20 + i * 64, bh = 80 + (i * 29) % 60; view += `<rect x="${bx}" y="${wy1 - 100 - bh}" width="62" height="${bh + 120}" fill="${mix(mix('#9a9488', '#121622', nt), '#b88a60', dw)}"/><path d="M${bx},${wy1 - 100 - bh} L${bx + 31},${wy1 - 130 - bh} L${bx + 62},${wy1 - 100 - bh}Z" fill="${mix(mix('#4a5a6a', '#0a0e16', nt), '#6a4a3a', dw)}"/><rect x="${bx + 40}" y="${wy1 - 150 - bh}" width="10" height="26" fill="#6a4a3a"/>`; if (nt > 0.5) view += `<rect x="${bx + 18}" y="${wy1 - 70 - bh}" width="10" height="14" fill="#ffcf80" opacity="${f(nt * 0.8)}"/>`; }
    if (dw > 0) view += C.radial(wx1 - 30, wy1 - 110, 200, '#fff0b0', 0.8 * dw, 'screen');
    w += `<rect x="${wx0 - 30}" y="${wy0 - 30}" width="${wx1 - wx0 + 60}" height="${wy1 - wy0 + 60}" fill="#e8e2d0" ${ol(1.4)}/><g clip-path="url(#rmwin)">${view}</g><path d="M${(wx0 + wx1) / 2},${wy0} L${(wx0 + wx1) / 2},${wy1} M${wx0},${(wy0 + wy1) / 2} L${wx1},${(wy0 + wy1) / 2}" stroke="#e8e2d0" stroke-width="12"/>`;
    w += PR.curtain(wx0 - 60, wx0 + 40, wy0 - 60, wy1 + 120, '#7a3a3a', t, 4, -1, 0) + PR.curtain(wx1 - 40, wx1 + 60, wy0 - 60, wy1 + 120, '#7a3a3a', t, 6, 1, 0);
    // a small crucifix, the tear-off calendar, the wall clock, a coat on a hook, a framed print of a ship
    const day = Math.min(31, 7 + Math.floor(o.days || 0)), month = (o.days || 0) > 25 ? 'AOÛT' : 'JUILLET';
    w += PR.calendar(1180, 560, 1.1, month, month === 'AOÛT' ? day - 31 + 7 : day, { flip: o.flip || 0, prevDay: day - 1 });
    w += PR.wallClock(-160, 520, 0.9, t, { hour: 3 + (o.days || 0) * 0.7, min: (t * 120) % 60 });
    w += `<rect x="1420" y="540" width="18" height="18" fill="#2a1a0e"/><path d="M1400,552 C1360,620 1350,820 1380,980 L1500,980 C1520,820 1500,620 1460,552Z" fill="#3a3a48" ${ol(1.4)} filter="url(#cloth)"/>`;
    w += `<rect x="-560" y="560" width="240" height="180" fill="#4a3424" ${ol(1.2)}/><rect x="-546" y="574" width="212" height="152" fill="#d8ccb0"/><path d="M-520,690 Q-440,660 -360,690" stroke="#3a5a7a" stroke-width="4" fill="none"/><path d="M-470,690 L-470,610 L-420,640 L-470,640" fill="#efe6cc" stroke="#3a3a3a" stroke-width="2"/>`;
    // the window light on the wall slides with the sun; night darkens the room (people too, see the shot)
    w += `<path d="M${f(wx0 + 300 + (o.sunX || 0))},${wy0 + 380} L${f(wx1 + 420 + (o.sunX || 0))},${wy0 + 380} L${f(wx1 + 560 + (o.sunX || 0))},${wy1 + 600} L${f(wx0 + 360 + (o.sunX || 0))},${wy1 + 600}Z" fill="${mix('#f4f4ee', '#ffd890', dw)}" opacity="${f(0.16 * (1 - nt) + 0.14 * dw)}" filter="url(#b14)"/>`;
    w += `<rect x="-900" y="-400" width="2900" height="2400" fill="#0a0e1e" opacity="${f(0.6 * nt * (1 - dw))}" style="mix-blend-mode:multiply"/>`;
    L.push({ p: 0.8, svg: w });
    let fl0 = `<rect x="-1000" y="1620" width="3000" height="1200" fill="#5a3e24" filter="url(#woodH)"/>`;
    for (let i = 0; i < 10; i++) fl0 += `<path d="M-1000,${1640 + i * 40 + i * i * 3} L2000,${1640 + i * 40 + i * i * 3}" stroke="#1e1208" stroke-width="3" opacity="0.6"/>`;
    fl0 += `<path d="M-200,1700 L700,1700 L760,1900 L-260,1900Z" fill="#7a2a2a" opacity="0.8"/><rect x="-1000" y="1620" width="3000" height="1200" fill="#0a0e1e" opacity="${f(0.55 * nt * (1 - dw))}" style="mix-blend-mode:multiply"/>`;
    L.push({ p: 1, svg: fl0 });
    if (dw > 0) L.push({ p: 1.02, light: true, svg: `<path d="M900,380 L1000,380 L300,2000 L-100,2000Z" fill="#ffe0a0" opacity="${f(0.16 * dw)}" style="mix-blend-mode:screen" filter="url(#b14)"/>` + S.dust(520, 1200, 420, 600, 30, 51, t, '#fff0c8', 2.2, 0.6 * dw) });
    return L;
  };
  // the brass bed in pieces (headboard and pillows behind you, the quilt over you, the footboard in front) and the nightstand
  S.roomBedBack = () => { const [x0, x1] = S.ROOM.BED; let g = `<path d="M${x0 - 30},1610 L${x0 - 30},980 M${x1 + 30},1610 L${x1 + 30},980" stroke="#b8862e" stroke-width="20"/><circle cx="${x0 - 30}" cy="970" r="22" fill="#d8b050" ${ol(1.3)}/><circle cx="${x1 + 30}" cy="970" r="22" fill="#d8b050" ${ol(1.3)}/>`;
    g += `<path d="M${x0 - 30},1010 C${x0 + 100},960 ${x1 - 100},960 ${x1 + 30},1010" stroke="#b8862e" stroke-width="12" fill="none"/>` + [0.2, 0.35, 0.5, 0.65, 0.8].map(k => `<path d="M${f(lerp(x0, x1, k))},985 L${f(lerp(x0, x1, k))},1260" stroke="#a8782a" stroke-width="7"/>`).join('');
    g += `<path d="M${x0 + 30},1190 C${x0 + 40},1090 ${x1 - 40},1090 ${x1 - 30},1190 L${x1 - 20},1300 L${x0 + 20},1300Z" fill="#f2efe6" ${ol(1.4)} filter="url(#cloth)"/>`; return g; };
  S.roomQuilt = (t, o = {}) => {
    const [x0, x1] = S.ROOM.BED, q = S.ROOM.QUILT, fb = S.ROOM.FOOT;
    const top = `M${x0 - 20},${q + 30} C${x0 + 60},${q - 6} ${x0 + 200},${q - 30} ${(x0 + x1) / 2},${q - 24} C${x1 - 200},${q - 30} ${x1 - 60},${q - 4} ${x1 + 20},${q + 30}`;
    let g = `<path d="${top} L${x1 + 50},${fb + 40} L${x0 - 50},${fb + 40}Z" fill="#3a4a7a" ${ol(1.6)}/>`;
    const rq = rng(13); for (let i = 0; i < 40; i++) { const x = x0 - 30 + rq() * (x1 - x0 + 60), y = q + 10 + rq() * (fb - q); g += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(6 + rq() * 6)}" fill="#e8d8a8" opacity="0.5"/>`; }
    g += [0.3, 0.55, 0.8].map(k => `<path d="M${f(lerp(x0, x1, k))},${q - 10} C${f(lerp(x0, x1, k) - 30)},${q + 100} ${f(lerp(x0, x1, k) + 20)},${fb - 100} ${f(lerp(x0, x1, k) - 10)},${fb + 20}" stroke="#141a30" stroke-width="40" fill="none" opacity="0.28" filter="url(#b8)"/>`).join('');
    g += `<path d="${top}" stroke="#ece8dc" stroke-width="24" fill="none"/>`;
    return g;
  };
  S.roomBedFront = (t, o = {}) => {
    const [x0, x1] = S.ROOM.BED, fb = S.ROOM.FOOT, fy = S.ROOM.FY, [sx, sy] = S.ROOM.STAND;
    let g = `<path d="M${x0 - 40},${fy} L${x0 - 40},${fb - 60} M${x1 + 40},${fy} L${x1 + 40},${fb - 60}" stroke="#b8862e" stroke-width="18"/><path d="M${x0 - 40},${fb - 50} L${x1 + 40},${fb - 50} M${x0 - 40},${fb + 60} L${x1 + 40},${fb + 60}" stroke="#a8782a" stroke-width="12"/>` + [0.2, 0.4, 0.6, 0.8].map(k => `<path d="M${f(lerp(x0, x1, k))},${fb - 50} L${f(lerp(x0, x1, k))},${fb + 60}" stroke="#a8782a" stroke-width="7"/>`).join('') + [x0 - 40, x1 + 40].map(x => `<circle cx="${x}" cy="${fb - 70}" r="20" fill="#d8b050" ${ol(1.2)}/>`).join('');
    // the nightstand with the candle (it shortens over the nights) and, unless you are holding it, the glass of water
    g += `<rect x="${sx - 90}" y="${sy}" width="180" height="${fy - sy}" fill="#5a3a20" ${ol(1.4)} filter="url(#woodV)"/><rect x="${sx - 100}" y="${sy - 14}" width="200" height="18" fill="#6a4426" ${ol(1.2)}/><rect x="${sx - 60}" y="${sy + 40}" width="120" height="60" rx="4" fill="#4a2e18" ${ol(1)}/><circle cx="${sx}" cy="${sy + 70}" r="6" fill="#c8a040"/>`;
    const ch = o.candle ?? 1;
    g += `<path d="M${sx - 60},${sy - 14} L${sx - 20},${sy - 14} L${sx - 26},${sy - 24} L${sx - 54},${sy - 24}Z" fill="#b8862e" ${ol(1)}/><rect x="${sx - 48}" y="${f(sy - 24 - 110 * ch)}" width="16" height="${f(110 * ch)}" fill="#ece2c8" ${ol(1)}/>`;
    if (o.lit !== false) g += PR.flame(sx - 40, sy - 26 - 110 * ch, 0.8, t) + C.radial(sx - 40, sy - 60 - 110 * ch, 520, '#ffb050', 0.36 * fl(t, 4) * (o.candleGlow ?? 1), 'screen');
    if (!o.glassHeld) g += PR.waterGlass(sx + 40, sy - 14, 0.62, { level: 0.75 });
    return g;
  };

  // ======================================================= the gate of the Institute (years later, morning)
  // the gate between two stone pillars: x 230..850, top spears 1080, ground 1780; the building behind with its name
  S.GATE = { G0: 230, G1: 850, TOP: 1080, FY: 1780, LOCK: [540, 1380], SPEAR: [540, 1040] };
  S.gateWorld = (t, o = {}) => {
    const L = [];
    let sky = `${lg('gtsky', [[0, '#8ab0d4'], [0.7, '#d8e4ec'], [1, '#f6ead0']])}<rect x="-1600" y="-1400" width="4800" height="2600" fill="url(#gtsky)"/>`;
    for (const [cx, cy, w2, sd] of [[-200, 100, 700, 3], [900, -40, 800, 6]]) sky += E.cloud(cx + t * 10, cy, w2, w2 * 0.28, sd, { op: 0.85 });
    sky += E.birds(100 + t * 40, 200, 7, 6, 1.1, '#2a2a30');
    L.push({ p: 0.15, svg: sky });
    // the building: red brick with stone dressings, tall windows, a slate roof, the name carved over the door
    let b = `<rect x="-1400" y="260" width="3800" height="1200" fill="#a8523a" filter="url(#tex)"/>`;
    for (let r2 = 0; r2 < 26; r2++) b += `<path d="M-1400,${300 + r2 * 46} L2400,${300 + r2 * 46}" stroke="#7a3a28" stroke-width="2" opacity="0.5"/>`;
    b += `<path d="M-1500,270 L2500,270 L2300,40 L-1300,40Z" fill="#4a5058" filter="url(#tex)" ${ol(1.5)}/><rect x="-1500" y="250" width="4000" height="30" fill="#d8ccb0" ${ol(1.2)}/>`;
    for (let i = 0; i < 8; i++) { const x = -1250 + i * 460; if (x > 200 && x < 900) continue; b += `<rect x="${x}" y="420" width="200" height="420" fill="#3a4a5a" ${ol(1.4)}/><rect x="${x - 16}" y="400" width="232" height="30" fill="#d8ccb0" ${ol(1.2)}/><rect x="${x - 16}" y="840" width="232" height="26" fill="#d8ccb0" ${ol(1.2)}/><path d="M${x + 100},420 L${x + 100},840 M${x},630 L${x + 200},630" stroke="#d8ccb0" stroke-width="10"/><rect x="${x + 10}" y="430" width="80" height="190" fill="#fff" opacity="0.12"/>`; }
    b += `<rect x="260" y="330" width="560" height="110" fill="#e2d6ba" ${ol(1.4)}/><text x="540" y="408" font-family="Palatino Linotype, Georgia, serif" font-size="58" letter-spacing="6" text-anchor="middle" fill="#3a3024">INSTITUT PASTEUR</text>`;
    b += `<path d="M380,1460 L380,640 Q540,520 700,640 L700,1460Z" fill="#2a2a2e" ${ol(1.5)}/><path d="M400,1460 L400,660 Q540,550 680,660 L680,1460" fill="none" stroke="#d8ccb0" stroke-width="14"/>`;
    b += C.radial(1600, 500, 1600, '#fff0c8', 0.22, 'screen');
    // the gilded spire on the roof ridge above the name: an iron mast, scrolls, a gold ball and a gold spear point (tip 540,-250)
    b += `<path d="M520,40 L530,10 L550,10 L560,40Z" fill="#2a2a2e" ${ol(1.2)}/><path d="M533,12 L535,-150 L545,-150 L547,12Z" fill="#1c1c20" ${ol(1.2)}/>` +
      `<rect x="526" y="-70" width="28" height="9" rx="3" fill="#d8b050" stroke="#5a4010" stroke-width="1.5"/><rect x="528" y="-112" width="24" height="7" rx="3" fill="#d8b050" stroke="#5a4010" stroke-width="1.5"/>` +
      `<circle cx="540" cy="-162" r="16" fill="#d8b050" stroke="#5a4010" stroke-width="2"/><ellipse cx="535" cy="-167" rx="6" ry="4" fill="#fff4c8" opacity="0.8"/><path d="M528,-176 L540,-250 L552,-176Z" fill="#d8b050" stroke="#5a4010" stroke-width="2"/><path d="M536,-182 L540,-238" stroke="#fff4c8" stroke-width="2.5" opacity="0.8"/>`;
    L.push({ p: 0.6, svg: b });
    // chestnut trees and a gravel courtyard behind the gate
    let ct = E.oak(-700, 1460, 1.3, 21, {}) + E.oak(1800, 1460, 1.4, 23, {});
    ct += `<rect x="-1600" y="1400" width="4800" height="400" fill="#c8b890" filter="url(#ground)"/>`;
    L.push({ p: 0.78, svg: ct });
    let gd = `<rect x="-2000" y="1650" width="5200" height="1200" fill="#9a9080" filter="url(#ground)"/>`;
    for (let i = 0; i < 10; i++) gd += `<path d="M-2000,${1670 + i * 50 + i * i * 4} L3200,${1670 + i * 50 + i * i * 4}" stroke="#6a6458" stroke-width="3" opacity="0.5"/>`;
    L.push({ p: 1, svg: gd });
    L.push({ p: 1.03, light: true, svg: `<path d="M1500,-200 L1700,-200 L700,1900 L300,1900Z" fill="#fff0c8" opacity="0.1" style="mix-blend-mode:screen" filter="url(#b14)"/>` + S.dust(600, 1100, 700, 600, 30, 61, t, '#fff4d8', 2.2, 0.5) });
    // drifting leaves in front
    let lv = ''; for (let i = 0; i < 9; i++) { const ph2 = (t * 0.25 + i * 0.13) % 1, x = -300 + i * 200 + Math.sin(t * 1.3 + i) * 60, y = -200 + ph2 * 2400; lv += `<g transform="translate(${f(x)},${f(y)}) rotate(${f(t * 90 + i * 40)})"><path d="M0,0 C14,-12 30,-6 34,6 C20,12 8,10 0,0Z" fill="${['#c88a2a', '#a8642a', '#d8a040'][i % 3]}" opacity="0.85"/></g>`; }
    L.push({ p: 1.25, svg: `<g filter="url(#dof1)">${lv}</g>` });
    return L;
  };
  // the gate itself (character layer, in front of the gatekeeper): two leaves of wrought-iron bars with gilded spear
  // tips, scrolls, the lock plate; o.open 0..1 swings the right leaf open (foreshortened on its hinge)
  S.gate = (t, o = {}) => {
    const { G0, G1, TOP, FY } = S.GATE, mid = (G0 + G1) / 2, op = cl(o.open || 0);
    const leaf = (xa, xb, flip) => { let g = ''; const n = 7;
      for (let i = 0; i <= n; i++) { const x = lerp(xa, xb, i / n), tip = TOP - 30 - (i % 2) * 24; g += `<path d="M${f(x)},${FY - 20} L${f(x)},${tip + 20}" stroke="#141416" stroke-width="12"/><path d="M${f(x - 12)},${tip + 22} L${f(x)},${tip - 14} L${f(x + 12)},${tip + 22}Z" fill="#d8b050" stroke="#5a4010" stroke-width="2"/>`; }
      for (const y of [TOP + 60, TOP + 300, FY - 120]) g += `<path d="M${f(xa)},${y} L${f(xb)},${y}" stroke="#141416" stroke-width="12"/>`;
      for (let i = 0; i < n; i++) { const x = lerp(xa, xb, (i + 0.5) / n); g += `<path d="M${f(x - 18)},${TOP + 120} c0,-40 36,-40 36,0 c0,40 -36,40 -36,80" stroke="#141416" stroke-width="5" fill="none"/>`; }
      return g; };
    let g = `<rect x="${G0 - 110}" y="${TOP - 160}" width="110" height="${FY - TOP + 160}" fill="#d8ccb0" ${ol(1.6)} filter="url(#tex)"/><rect x="${G1}" y="${TOP - 160}" width="110" height="${FY - TOP + 160}" fill="#d8ccb0" ${ol(1.6)} filter="url(#tex)"/>`;
    for (const x of [G0 - 55, G1 + 55]) g += `<rect x="${x - 70}" y="${TOP - 190}" width="140" height="40" fill="#c8bca0" ${ol(1.3)}/><path d="M${x - 30},${TOP - 190} L${x - 30},${TOP - 260} Q${x},${TOP - 300} ${x + 30},${TOP - 260} L${x + 30},${TOP - 190}Z" fill="#141416" ${ol(1.2)}/><rect x="${x - 22}" y="${TOP - 262}" width="44" height="60" fill="#ffe8a8" opacity="0.5"/>`;
    g += leaf(G0, mid, false);
    // the right leaf swings open on its hinge at G1
    g += `<g transform="translate(${G1},0) scale(${f(1 - 0.78 * op)},1) translate(${-G1},0)">${leaf(mid, G1, true)}<rect x="${mid - 34}" y="${S.GATE.LOCK[1] - 40}" width="44" height="80" fill="#2a2a2c" stroke="#d8b050" stroke-width="3"/><circle cx="${mid - 12}" cy="${S.GATE.LOCK[1]}" r="8" fill="#0a0a0a"/></g>`;
    return g;
  };
})(window);
