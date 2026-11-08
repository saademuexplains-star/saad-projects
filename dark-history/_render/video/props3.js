// Props for "The Royal Taster". Hand-held props are drawn in the GRIP frame used by RIG hand pose 'grip':
// origin = centre of the fist, +x = out of the thumb side (the business end), +y = toward the fingertips.
(function (G) {
  const { f, shade, mix, rng, uid, OUT, NS, ol } = G.RIG, C = G.CINE;
  // scales are never rounded to steps (a far prop would jump a few per cent at each step as the camera moves)
  const fs = v => Math.round(v * 1e5) / 1e5;
  const P = G.PROPS;
  const LG = (id, stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a !== undefined ? ` stop-opacity="${a}"` : ''}/>`).join('')}</linearGradient>`;
  const RG = (id, stops, cx = 0.5, cy = 0.5, r = 0.5) => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a !== undefined ? ` stop-opacity="${a}"` : ''}/>`).join('')}</radialGradient>`;
  const GOLD = '#d6a836';
  const goldV = id => LG(id, [[0, '#fff2b0'], [0.25, '#e8be4c'], [0.6, '#b8862a'], [1, '#6a4612']]);
  const goldH = id => LG(id, [[0, '#7a5216'], [0.3, '#f0cc60'], [0.55, '#c8962e'], [1, '#6a4612']], 0, 0, 1, 0);
  const glint = (x, y, r, op = 1) => op <= 0.01 ? '' : `<g transform="translate(${f(x)},${f(y)})" opacity="${f(op)}"><path d="M0,${-r} L${r * 0.12},${-r * 0.12} L${r},0 L${r * 0.12},${r * 0.12} L0,${r} L${-r * 0.12},${r * 0.12} L${-r},0 L${-r * 0.12},${-r * 0.12}Z" fill="#fffbe8"/><circle r="${f(r * 0.28)}" fill="#fff"/></g>` + C.bloom(x, y, r * 1.6, '#fff0c0', 0.5 * op);

  // ---------------- the golden spoon (grip frame). o.food: a morsel of meat in the bowl; o.glint 0..1
  P.spoon = (o = {}) => {
    const id = uid('sp'), id2 = id + 'b';
    let g = `<defs>${goldV(id)}${RG(id2, [[0, '#fff4c0'], [0.45, '#d8a83a'], [1, '#6a4410']], 0.4, 0.35, 0.7)}</defs>`;
    // handle: ornamented end behind the fist, slender shaft out of the thumb side
    g += `<path d="M-52,-8 Q-62,0 -52,8 L-10,6 L84,3.2 Q96,2.6 104,1 L104,-1 Q96,-2.6 84,-3.2 L-10,-6Z" fill="url(#${id})" ${ol(1.3)}/>`;
    g += `<circle cx="-58" cy="0" r="9" fill="url(#${id})" ${ol(1.2)}/><circle cx="-60" cy="-3" r="3" fill="#fff6d0" opacity="0.8"/><ellipse cx="-58" cy="0" rx="3.5" ry="4" fill="#a01e28"/>`;
    g += `<path d="M-46,-3 L80,-1.6" stroke="#fff6c8" stroke-width="1.6" opacity="0.7"/>`;
    // bowl seen a little from above
    g += `<ellipse cx="138" cy="0" rx="38" ry="23" fill="url(#${id2})" ${ol(1.4)}/><ellipse cx="141" cy="2" rx="29" ry="15" fill="#7a5418" opacity="0.55"/><ellipse cx="132" cy="-6" rx="13" ry="5" fill="#fffbe0" opacity="0.7"/>`;
    if (o.food) g += `<path d="M118,4 C120,-12 150,-14 160,-2 C164,8 150,14 136,13 C126,12 118,10 118,4Z" fill="#7a3a16" ${ol(1)}/><path d="M126,-2 C134,-8 146,-8 152,-3" stroke="#d8884a" stroke-width="3" fill="none" opacity="0.7"/><circle cx="146" cy="4" r="2" fill="#3a1a08"/>`;
    g += glint(128, -8, 26, o.glint || 0);
    return g;
  };

  // ---------------- roast meat
  const roastG = id => RG(id, [[0, '#c87a3a'], [0.5, '#8a4418'], [1, '#4a1e08']], 0.4, 0.3, 0.75);
  const steam = (x, y, w, t, n = 4, op = 0.25) => { let g = ''; for (let i = 0; i < n; i++) { const ph = (t * 0.45 + i / n) % 1, xx = x + (i - n / 2 + 0.5) * w / n + Math.sin(t * 1.3 + i * 2) * 14, yy = y - ph * 260; g += `<ellipse cx="${f(xx)}" cy="${f(yy)}" rx="${f(26 + ph * 50)}" ry="${f(40 + ph * 60)}" fill="#f4eee6" opacity="${f(op * Math.sin(Math.PI * ph))}" filter="url(#b14)"/>`; } return g; };
  P.steam = steam;
  // gold plate in perspective, (x,y) = centre of the plate surface. o.meat: slices; o.bite: 0..1 missing chunk; o.poison 0..1 sheen
  P.plate = (x, y, s = 1, o = {}) => {
    const id = uid('pl');
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${fs(s)})"><defs>${goldH(id)}${RG(id + 'i', [[0, '#f4d688'], [0.7, '#c89a3a'], [1, '#8a6018']])}</defs>`;
    g += `<ellipse cx="0" cy="10" rx="178" ry="52" fill="#000" opacity="0.35" filter="url(#b8)"/>`;
    g += `<ellipse cx="0" cy="4" rx="170" ry="48" fill="url(#${id})" ${ol(1.4)}/><ellipse cx="0" cy="0" rx="150" ry="40" fill="url(#${id}i)" ${ol(1)}/><ellipse cx="-30" cy="-10" rx="90" ry="14" fill="#fff8d8" opacity="0.35" filter="url(#b4)"/>`;
    if (o.meat !== false) {
      const rid = id + 'r';
      g += `<defs>${roastG(rid)}</defs>`;
      // three thick slices of roast fanned on the plate plus gravy
      g += `<ellipse cx="6" cy="6" rx="110" ry="26" fill="#5a2a0c" opacity="0.8"/>`;
      for (const [dx, rot] of [[-56, -12], [0, 0], [54, 12]]) g += `<g transform="translate(${dx},-14) rotate(${rot})"><path d="M-44,10 C-46,-26 46,-30 44,8 C40,22 -40,24 -44,10Z" fill="url(#${rid})" ${ol(1.2)}/><path d="M-36,-6 C-10,-20 20,-20 36,-8" stroke="#e8a060" stroke-width="3" fill="none" opacity="0.6"/><path d="M-30,6 C-10,0 10,0 30,6" stroke="#f0c8a0" stroke-width="2" fill="none" opacity="0.45"/></g>`;
      if (o.bite) g += `<path d="M30,-30 q8,10 16,4 q6,10 16,4 q4,10 14,6 L80,-44 Z" fill="#c8906a" opacity="${f(o.bite)}" ${ol(1)}/>`;
      g += `<path d="M-90,22 q30,-6 60,0 q40,6 80,-2" stroke="#e0b070" stroke-width="2.5" fill="none" opacity="0.5"/>`;
      g += `<circle cx="-110" cy="-4" r="9" fill="#4a6a2a" ${ol(1)}/><circle cx="104" cy="2" r="8" fill="#5a7a2a" ${ol(1)}/>`;
    }
    if (o.poison) g += `<ellipse cx="0" cy="-10" rx="100" ry="22" fill="#9ad860" opacity="${f(0.18 * o.poison)}" style="mix-blend-mode:screen" filter="url(#b8)"/>` + [[-20, -24], [10, -18], [34, -28]].map(([px, py]) => `<ellipse cx="${px}" cy="${py}" rx="6" ry="3" fill="#b8f070" opacity="${f(0.7 * o.poison)}"/>`).join('');
    if (o.steam !== undefined) g += steam(0, -30, 200, o.steam, 3, 0.22);
    return g + `</g>`;
  };
  // whole roast boar on a silver platter (x,y = platter centre); o.t animates steam; o.carved 0..1
  P.boar = (x, y, s = 1, o = {}) => {
    const id = uid('br');
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${fs(s)})"><defs>${roastG(id)}${LG(id + 's', [[0, '#f2f4f6'], [0.5, '#a8acb4'], [1, '#5a5e66']])}</defs>`;
    g += `<ellipse cx="0" cy="40" rx="330" ry="66" fill="#000" opacity="0.4" filter="url(#b8)"/><ellipse cx="0" cy="30" rx="320" ry="62" fill="url(#${id}s)" ${ol(1.6)}/><ellipse cx="0" cy="24" rx="290" ry="50" fill="#c8ccd2" ${ol(1)}/>`;
    // garnish
    const r = rng(5); for (let i = 0; i < 16; i++) { const a = r() * Math.PI * 2; g += `<circle cx="${f(Math.cos(a) * 250)}" cy="${f(28 + Math.sin(a) * 36)}" r="${f(10 + r() * 8)}" fill="${['#4a6a2a', '#6a8a30', '#b8302a', '#d89a2a'][i % 4]}" ${ol(1)}/>`; }
    // legs
    for (const [lx, ld] of [[-120, -1], [-60, -1], [90, 1], [150, 1]]) g += `<path d="M${lx},20 q${ld * 30},30 ${ld * 50},40 l${ld * 14},-10 q${-ld * 20},-20 ${-ld * 30},-50Z" fill="#6a3010" ${ol(1.2)}/>`;
    // body
    g += `<path d="M-230,10 C-250,-80 -150,-170 0,-172 C140,-170 230,-110 236,-20 C240,30 180,50 0,52 C-150,52 -220,44 -230,10Z" fill="url(#${id})" ${ol(1.6)}/>`;
    g += `<path d="M-180,-60 C-100,-140 80,-150 180,-80" stroke="#f0b070" stroke-width="7" fill="none" opacity="0.4" filter="url(#b2)"/>`;
    for (let i = 0; i < 9; i++) g += `<path d="M${-160 + i * 40},-130 q10,60 0,140" stroke="#3a1606" stroke-width="3" fill="none" opacity="0.35"/>`;
    // head with apple
    g += `<path d="M200,-90 C260,-110 330,-70 340,-20 C346,10 300,30 250,24 C220,20 200,0 196,-30Z" fill="url(#${id})" ${ol(1.5)}/>`;
    g += `<path d="M232,-84 l-6,-34 l26,22Z" fill="#5a2408" ${ol(1)}/><circle cx="292" cy="-48" r="5" fill="#1a0a04"/><circle cx="338" cy="-4" r="26" fill="#c0302a" ${ol(1.3)}/><circle cx="330" cy="-12" r="8" fill="#fff" opacity="0.35"/>`;
    if (o.carved) g += `<path d="M-60,-150 C-30,-120 30,-118 60,-148 L70,-60 C30,-40 -30,-40 -70,-60Z" fill="#e0a07a" opacity="${f(o.carved)}" ${ol(1)}/><path d="M-50,-100 C-10,-90 20,-90 52,-100" stroke="#b86a46" stroke-width="3" fill="none" opacity="${f(o.carved * 0.8)}"/>`;
    if (o.t !== undefined) g += steam(0, -160, 360, o.t, 4, 0.2);
    return g + `</g>`;
  };
  // roast pheasant on a small platter
  P.bird = (x, y, s = 1, o = {}) => {
    const id = uid('bd');
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${fs(s)})"><defs>${roastG(id)}</defs>`;
    g += `<ellipse cx="0" cy="24" rx="200" ry="46" fill="#000" opacity="0.35" filter="url(#b8)"/><ellipse cx="0" cy="20" rx="190" ry="44" fill="#c4c8ce" ${ol(1.4)}/>`;
    g += `<path d="M-120,10 C-130,-70 -40,-120 20,-118 C100,-114 140,-60 130,0 C120,30 -100,34 -120,10Z" fill="url(#${id})" ${ol(1.5)}/>`;
    for (const sd of [-1, 1]) g += `<path d="M${sd * 60},-60 C${sd * 110},-110 ${sd * 150},-130 ${sd * 160},-150" stroke="${OUT}" stroke-width="30" stroke-linecap="round" fill="none"/><path d="M${sd * 60},-60 C${sd * 110},-110 ${sd * 150},-130 ${sd * 160},-150" stroke="#7a3812" stroke-width="26" stroke-linecap="round" fill="none"/><circle cx="${sd * 166}" cy="-156" r="12" fill="#efe6d4" ${ol(1)}/>`;
    g += `<path d="M-80,-60 C-30,-100 40,-100 90,-60" stroke="#f0b070" stroke-width="6" fill="none" opacity="0.4" filter="url(#b2)"/>`;
    if (o.t !== undefined) g += steam(0, -120, 220, o.t, 3, 0.18);
    return g + `</g>`;
  };
  // a big roast leg (grip frame): bone through the fist, meat out of the thumb side. o.bite 0..1
  P.leg = (o = {}) => {
    const id = uid('lg');
    let g = `<defs>${roastG(id)}</defs>`;
    g += `<path d="M-64,-11 L40,-13 L40,13 L-64,11Z" fill="#efe6d4" ${ol(1.3)}/><circle cx="-70" cy="-10" r="13" fill="#efe6d4" ${ol(1.2)}/><circle cx="-70" cy="10" r="13" fill="#efe6d4" ${ol(1.2)}/>`;
    g += `<path d="M30,-24 C60,-70 160,-80 196,-30 C214,0 206,50 160,66 C100,84 40,50 30,24Z" fill="url(#${id})" ${ol(1.5)}/>`;
    g += `<path d="M60,-44 C100,-66 150,-60 180,-34" stroke="#f0b070" stroke-width="6" fill="none" opacity="0.45" filter="url(#b2)"/>`;
    if (o.bite > 0.01) {
      // a big bite out of the top edge: exposed pale meat with tooth marks
      const k = Math.min(1, o.bite), bx = 150;
      g += `<path d="M${bx - 52 * k},-64 q${10 * k},${26 * k} ${22 * k},${12 * k} q${8 * k},${22 * k} ${22 * k},${12 * k} q${8 * k},${20 * k} ${24 * k},${8 * k} q${8 * k},${18 * k} ${26 * k},${2 * k} L${bx + 60},-90 L${bx - 60 * k},-90Z" fill="#e2a47e" ${ol(1.1)}/>`;
      g += `<path d="M${bx - 40 * k},-46 q${30 * k},${14 * k} ${70 * k},${-6 * k}" stroke="#b8704a" stroke-width="2" fill="none" opacity="0.7"/>`;
    }
    return g;
  };

  // ---------------- tableware
  // goblet: (x,y) = foot centre on the table; o.tip deg (about the foot rim), o.wine 0..1 fill, o.spill 0..1
  P.goblet = (x, y, s = 1, o = {}) => {
    const id = uid('gb'), tip = o.tip || 0, piv = tip >= 0 ? 34 : -34;
    let g = `<defs>${goldH(id)}</defs>`;
    g += `<g transform="rotate(${f(tip)} ${piv} 0)">`;
    g += `<ellipse cx="0" cy="-3" rx="38" ry="9" fill="url(#${id})" ${ol(1.2)}/><path d="M-8,-8 L-6,-70 L6,-70 L8,-8Z" fill="url(#${id})" ${ol(1.1)}/><ellipse cx="0" cy="-42" rx="12" ry="6" fill="url(#${id})" ${ol(1)}/>`;
    g += `<path d="M-50,-160 L50,-160 C50,-110 30,-74 0,-72 C-30,-74 -50,-110 -50,-160Z" fill="url(#${id})" ${ol(1.3)}/>`;
    for (const gx of [-26, 0, 26]) g += `<circle cx="${gx}" cy="-120" r="6" fill="${gx ? '#a01e28' : '#1f4fa0'}" ${ol(0.9)}/>`;
    g += `<ellipse cx="0" cy="-160" rx="50" ry="11" fill="#5a3a10" ${ol(1.2)}/>`;
    if ((o.wine ?? 0.8) > 0 && Math.abs(tip) < 60) g += `<ellipse cx="0" cy="-158" rx="44" ry="8" fill="#5a0a14"/><ellipse cx="-12" cy="-160" rx="16" ry="3" fill="#c03040" opacity="0.6"/>`;
    g += `<path d="M-38,-150 C-36,-110 -24,-86 -10,-80" stroke="#fff6c8" stroke-width="4" fill="none" opacity="0.5"/>`;
    g += `</g>`;
    return `<g transform="translate(${f(x)},${f(y)}) scale(${fs(s)})">${g}</g>`;
  };
  // wine stain spreading on the tablecloth (x,y centre), u 0..1
  P.stain = (x, y, u, seed = 3, sc = 1) => {
    if (u <= 0) return '';
    const r = rng(seed); let d = '';
    const N = 22;
    for (let i = 0; i <= N; i++) { const a = i / N * Math.PI * 2, rr = (0.75 + r() * 0.5) * u; d += `${i ? 'L' : 'M'}${f(Math.cos(a) * 260 * rr * sc)},${f(Math.sin(a) * 70 * rr * sc)} `; }
    return `<g transform="translate(${f(x)},${f(y)})"><path d="${d}Z" fill="#6a0a16" opacity="0.85" filter="url(#b2)"/><path d="${d}Z" fill="#a01828" opacity="0.5" transform="scale(0.7)" filter="url(#b4)"/></g>`;
  };
  // silver cloche (side view) over a plate; lift 0..1 raises the dome
  P.cloche = (x, y, s = 1, lift = 0) => {
    const id = uid('cl');
    return `<g transform="translate(${f(x)},${f(y)}) scale(${fs(s)})"><defs>${LG(id, [[0, '#5a5e66'], [0.3, '#f4f6f8'], [0.55, '#b8bcc4'], [1, '#4a4e56']], 0, 0, 1, 0)}</defs>` +
      `<g transform="translate(0,${f(-lift * 140)})"><path d="M-150,0 C-150,-150 150,-150 150,0Z" fill="url(#${id})" ${ol(1.5)}/><rect x="-156" y="-8" width="312" height="14" rx="6" fill="url(#${id})" ${ol(1.2)}/><circle cx="0" cy="-116" r="16" fill="url(#${id})" ${ol(1.2)}/><path d="M-100,-80 C-70,-110 -30,-118 0,-118" stroke="#fff" stroke-width="7" fill="none" opacity="0.5" filter="url(#b1)"/></g></g>`;
  };
  // top-down cloche on its plate (for the roulette table); lift 0..1 slides the dome off upward-left
  P.clocheTop = (x, y, r, o = {}) => {
    const id = uid('ct'), lift = o.lift || 0;
    let g = `<defs>${RG(id, [[0, '#fbfcfd'], [0.35, '#c8ccd2'], [0.8, '#6a6e76'], [1, '#3a3e46']], 0.36, 0.32, 0.75)}${RG(id + 'p', [[0, '#f0d080'], [0.75, '#c8962e'], [1, '#6a4612']])}</defs>`;
    g += `<circle cx="${f(x + 10)}" cy="${f(y + 14)}" r="${f(r * 1.25)}" fill="#000" opacity="0.4" filter="url(#b8)"/><circle cx="${f(x)}" cy="${f(y)}" r="${f(r * 1.22)}" fill="url(#${id}p)" ${ol(1.3)}/>`;
    if (o.meat) g += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r * 0.8)}" fill="#7a3a16" ${ol(1)}/><path d="M${f(x - r * 0.5)},${f(y - r * 0.2)} q${f(r * 0.5)},${f(-r * 0.4)} ${f(r)},0" stroke="#d8884a" stroke-width="4" fill="none" opacity="0.6"/>`;
    const dx = -lift * r * 2.4, dy = -lift * r * 1.6, sc = 1 + lift * 0.25;
    g += `<g opacity="${f(1 - lift * 0.3)}"><circle cx="${f(x + dx + 12 * lift)}" cy="${f(y + dy + 18 * lift)}" r="${f(r * sc)}" fill="#000" opacity="${f(0.35 * lift)}" filter="url(#b8)"/><circle cx="${f(x + dx)}" cy="${f(y + dy)}" r="${f(r * sc)}" fill="url(#${id})" ${ol(1.4)}/><circle cx="${f(x + dx)}" cy="${f(y + dy)}" r="${f(r * 0.2 * sc)}" fill="#e8ecf0" ${ol(1)}/><circle cx="${f(x + dx - r * 0.3)}" cy="${f(y + dy - r * 0.34)}" r="${f(r * 0.16)}" fill="#fff" opacity="0.8" filter="url(#b2)"/></g>`;
    return g;
  };
  // three-branch candelabrum, (x,y) = base on the table
  P.candelabra = (x, y, s, t, seed = 0) => {
    const id = uid('cb');
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${fs(s)})"><defs>${goldH(id)}</defs>`;
    g += `<ellipse cx="0" cy="-6" rx="60" ry="14" fill="url(#${id})" ${ol(1.2)}/><path d="M-10,-14 L-8,-200 L8,-200 L10,-14Z" fill="url(#${id})" ${ol(1.1)}/>`;
    g += `<path d="M-120,-260 C-120,-180 -40,-170 0,-190 C40,-170 120,-180 120,-260" stroke="${OUT}" stroke-width="20" fill="none"/><path d="M-120,-260 C-120,-180 -40,-170 0,-190 C40,-170 120,-180 120,-260" stroke="url(#${id})" stroke-width="15" fill="none"/>`;
    for (const cx of [-120, 0, 120]) {
      const top = cx === 0 ? -330 : -270;
      g += `<ellipse cx="${cx}" cy="${top}" rx="28" ry="8" fill="url(#${id})" ${ol(1)}/>`;
      if (cx === 0) g += `<path d="M-8,-200 L-8,${top} L8,${top} L8,-200Z" fill="url(#${id})" ${ol(1)}/>`;
      g += P.candle(cx, top - 4, 120, t + cx * 0.01 + seed, 1);
    }
    return g + `</g>`;
  };
  // sheathed dagger worn at the belt (person-local); (x,y) = sheath mouth; d 0..1 drawn out; ang = lean
  P.dagger = (x, y, s = 1, d = 0, ang = 18, glintOp = 0) => {
    const id = uid('dg'), lift = d * 46;
    let g = `<g transform="translate(${f(x)},${f(y)}) rotate(${f(ang)}) scale(${fs(s)})"><defs>${goldH(id)}${LG(id + 'st', [[0, '#5a5e66'], [0.45, '#eef2f6'], [1, '#6a6e76']], 0, 0, 1, 0)}</defs>`;
    // sheath
    g += `<path d="M-15,0 L15,0 L10,150 L0,168 L-10,150Z" fill="#2a1410" ${ol(1.3)}/><path d="M-15,0 L15,0 L14,16 L-14,16Z" fill="url(#${id})" ${ol(1)}/><path d="M-6,150 L6,150 L0,168Z" fill="url(#${id})"/><path d="M-6,30 L-4,140" stroke="#5a3424" stroke-width="2" opacity="0.6"/>`;
    // exposed steel when drawn
    if (lift > 0.5) g += `<path d="M-9,${f(-lift)} L9,${f(-lift)} L9,2 L-9,2Z" fill="url(#${id}st)" ${ol(1)}/><path d="M-2,${f(-lift)} L-2,0" stroke="#fff" stroke-width="1.5" opacity="0.7"/>`;
    // guard, grip, pommel (move up with the draw)
    g += `<g transform="translate(0,${f(-lift)})"><rect x="-34" y="-12" width="68" height="12" rx="5" fill="url(#${id})" ${ol(1.2)}/><rect x="-8" y="-64" width="16" height="52" rx="5" fill="#3a1e14" ${ol(1.1)}/>` +
      [0, 1, 2, 3].map(i => `<path d="M-8,${-56 + i * 12} l16,6" stroke="#8a6a3a" stroke-width="2"/>`).join('') +
      `<circle cx="0" cy="-72" r="11" fill="url(#${id})" ${ol(1.1)}/><circle cx="0" cy="-72" r="5.5" fill="#b0202a"/><circle cx="-2" cy="-74" r="1.8" fill="#fff" opacity="0.9"/></g>`;
    g += glint(0, f(-lift + 10), 30, glintOp);
    return g + `</g>`;
  };
  // the grip point of the dagger hilt in person-local coords (for the hand)
  P.daggerGrip = (x, y, s = 1, d = 0, ang = 18) => { const a = ang * Math.PI / 180, ly = (-38 - d * 46) * s; return [x - Math.sin(a) * ly, y + Math.cos(a) * ly]; };
  // glass vial (grip frame): body along +x out of the thumb side, cork at the end. o.col liquid, o.level 0..1, o.glint
  P.vial = (o = {}) => {
    const id = uid('vl'), col = o.col || '#4a8a2a', lev = o.level ?? 0.8, L0 = -26, L1 = 54;
    let g = `<defs><clipPath id="${id}"><path d="M${L0},-15 Q${L0 - 8},0 ${L0},15 L${L1 - 12},13 L${L1 - 6},7 L${L1},7 L${L1},-7 L${L1 - 6},-7 L${L1 - 12},-13Z"/></clipPath></defs>`;
    g += `<path d="M${L0},-15 Q${L0 - 8},0 ${L0},15 L${L1 - 12},13 L${L1 - 6},7 L${L1},7 L${L1},-7 L${L1 - 6},-7 L${L1 - 12},-13Z" fill="#cfe2e8" opacity="0.35"/>`;
    g += `<g clip-path="url(#${id})"><rect x="${L0 - 10}" y="-20" width="${f((L1 - L0) * lev + 10)}" height="40" fill="${col}" opacity="0.85"/></g>`;
    g += `<path d="M${L0},-15 Q${L0 - 8},0 ${L0},15 L${L1 - 12},13 L${L1 - 6},7 L${L1},7 L${L1},-7 L${L1 - 6},-7 L${L1 - 12},-13Z" fill="none" ${ol(1.3)}/><path d="M${L0 + 4},-9 L${L1 - 16},-8" stroke="#fff" stroke-width="3" opacity="0.6"/>`;
    if (!o.open) g += `<rect x="${L1 - 2}" y="-6" width="16" height="12" rx="3" fill="#a07a4a" ${ol(1.1)}/>`;
    else g += `<ellipse cx="${L1}" cy="0" rx="3" ry="7" fill="${col}" opacity="0.9"/>`;
    g += glint(L0 + 20, -6, 22, o.glint || 0);
    return g;
  };
  // single drop of liquid
  P.dropC = (x, y, r, col) => `<path d="M${f(x)},${f(y - r * 1.8)} Q${f(x + r)},${f(y)} ${f(x)},${f(y + r * 0.6)} Q${f(x - r)},${f(y)} ${f(x)},${f(y - r * 1.8)}Z" fill="${col}"/><circle cx="${f(x - r * 0.3)}" cy="${f(y - r * 0.2)}" r="${f(r * 0.24)}" fill="#fff" opacity="0.6"/>`;
  // hammer (grip frame): handle through the fist, head at the thumb end
  P.hammer = () => `<rect x="-60" y="-8" width="190" height="16" rx="7" fill="#7a5634" ${ol(1.2)}/><path d="M-50,-3 L120,-3" stroke="#a87a4a" stroke-width="3" opacity="0.6"/><rect x="118" y="-34" width="40" height="68" rx="5" fill="#4a4e56" ${ol(1.3)}/><rect x="122" y="-30" width="10" height="60" fill="#8a8e96" opacity="0.6"/>`;
  // a torch in the grip frame (flame at the thumb end)
  P.torchG = (t, seed = 0) => `<rect x="-50" y="-9" width="170" height="18" rx="6" fill="#5a3a22" ${ol(1.2)}/><path d="M110,-14 L150,-18 L150,18 L110,14Z" fill="#3a2414" ${ol(1.1)}/>` +
    `<g transform="translate(176,0) rotate(90)">${G.ENV.fire(0, 0, 0.55, 3 + seed + Math.floor(t * 12) % 4)}</g>` + C.bloom(190, 0, 120, '#ff9a40', 0.5);
  // wooden plank
  P.plank = (x, y, w, h, rot = 0) => `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)})"><rect x="${f(-w / 2)}" y="${f(-h / 2)}" width="${f(w)}" height="${f(h)}" fill="#6a4a2e" filter="url(#woodH)" ${ol(1.4)}/><path d="M${f(-w / 2 + 10)},${f(-h / 2 + 8)} L${f(w / 2 - 10)},${f(-h / 2 + 8)}" stroke="#a07a50" stroke-width="3" opacity="0.4"/>` +
    [-0.38, 0.38].map(k => `<circle cx="${f(k * w)}" cy="0" r="6" fill="#3a3a3e" ${ol(1)}/>`).join('') + `</g>`;

  // ---------------- chandeliers
  // iron wheel chandelier, side view; (x,y) = ring centre
  P.chandelier = (x, y, s, t, n = 10) => {
    let back = '', front = '';
    for (const cx of [-260, 0, 260]) back += `<path d="M${cx * 0.4},-700 L${cx},0" stroke="#1a1410" stroke-width="5"/>`;
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2 + t * 0.05, cx = Math.cos(a) * 300, cy = Math.sin(a) * 46, behind = Math.sin(a) < 0;
      const c = `<rect x="${f(cx - 9)}" y="${f(cy - 70)}" width="18" height="70" fill="#efe6d0" ${ol(1)}/>` + P.flame(cx, cy - 74, 1, t + i * 0.7);
      if (behind) back += c; else front += c;
    }
    const ring = `<ellipse cx="0" cy="0" rx="300" ry="46" fill="none" stroke="#1a1410" stroke-width="16"/><ellipse cx="0" cy="0" rx="300" ry="46" fill="none" stroke="#4a3a2a" stroke-width="8"/>`;
    return `<g transform="translate(${f(x)},${f(y)}) scale(${fs(s)})">${back}${ring}${front}</g>` + C.bloom(x, y - 60 * s, 380 * s, '#ffb860', 0.4);
  };
  // the same chandelier seen from directly below (ring of candles); rot in degrees
  P.chandelierBelow = (x, y, r, t, rot = 0, n = 6) => {
    let g = `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)})">`;
    g += `<circle r="${f(r)}" fill="none" stroke="#120c08" stroke-width="${f(r * 0.1)}"/><circle r="${f(r)}" fill="none" stroke="#4a3a2a" stroke-width="${f(r * 0.045)}"/>`;
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; g += `<path d="M0,0 L${f(Math.cos(a) * r)},${f(Math.sin(a) * r)}" stroke="#1a1410" stroke-width="${f(r * 0.04)}"/>`; }
    g += `<circle r="${f(r * 0.16)}" fill="#2a2018" stroke="#120c08" stroke-width="3"/>`;
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2, cx = Math.cos(a) * r, cy = Math.sin(a) * r, fl = 0.85 + 0.15 * Math.sin(t * 9 + i * 1.7);
      g += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 0.2)}" fill="#efe2c4" stroke="#1a1410" stroke-width="2"/><circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 0.1 * fl)}" fill="#fff4c0"/>`;
      g += C.bloom(cx, cy, r * 0.5 * fl, '#ffb050', 0.6);
    }
    return g + `</g>`;
  };
  // a candle flame (x,y = flame base)
  P.flame = (x, y, s, t) => {
    const fl = Math.sin(t * 11) * 0.06 + Math.sin(t * 17.3) * 0.04, lean = Math.sin(t * 3.1) * 3;
    return `<g transform="translate(${f(x)},${f(y)}) scale(${fs(s)})"><path d="M0,0 C-10,-8 -9,-26 ${f(lean)},${f(-46 * (1 + fl))} C9,-26 10,-8 0,0Z" fill="#ffd27a"/><path d="M0,-2 C-5,-8 -4,-18 ${f(lean * 0.6)},${f(-28 * (1 + fl))} C4,-18 5,-8 0,-2Z" fill="#fff8e0"/></g>` + C.bloom(x, y - 20 * s, 60 * s, '#ffb050', 0.55);
  };

  // ---------------- the feast table (front view). (x0..x1) span, y = front edge of the top, depth = visible top band
  P.table = (x0, x1, y, o = {}) => {
    const id = uid('tb'), dep = o.depth ?? 120, drop = o.drop ?? 420, cloth = o.cloth || '#efe8da';
    let g = `<defs>${LG(id, [[0, shade(cloth, -0.08)], [1, shade(cloth, 0.04)]])}${LG(id + 'd', [[0, shade(cloth, -0.02)], [0.6, shade(cloth, -0.2)], [1, shade(cloth, -0.42)]])}</defs>`;
    g += `<rect x="${x0}" y="${y - dep}" width="${x1 - x0}" height="${dep}" fill="url(#${id})"/>`;
    g += `<rect x="${x0}" y="${y - dep}" width="${x1 - x0}" height="${dep}" fill="#000" opacity="0.06" filter="url(#tex)"/>`;
    // hanging cloth with soft vertical folds
    g += `<rect x="${x0}" y="${y}" width="${x1 - x0}" height="${drop}" fill="url(#${id}d)"/>`;
    for (let x = x0 + 40; x < x1; x += 90) g += `<path d="M${x},${y + 10} Q${x + 8},${y + drop * 0.5} ${x - 4},${y + drop}" stroke="#5a5040" stroke-width="16" opacity="0.18" fill="none" filter="url(#b8)"/><path d="M${x + 40},${y + 10} L${x + 44},${y + drop}" stroke="#fff" stroke-width="8" opacity="0.12" fill="none" filter="url(#b4)"/>`;
    g += `<path d="M${x0},${y} L${x1},${y}" stroke="${OUT}" stroke-width="2"/><rect x="${x0}" y="${y}" width="${x1 - x0}" height="10" fill="#000" opacity="0.15" filter="url(#b2)"/>`;
    if (o.runner) g += `<rect x="${x0}" y="${y - dep * 0.62}" width="${x1 - x0}" height="${dep * 0.34}" fill="${o.runner}" opacity="0.9"/><rect x="${x0}" y="${y - dep * 0.62}" width="${x1 - x0}" height="4" fill="#d8b04a" opacity="0.8"/><rect x="${x0}" y="${y - dep * 0.3}" width="${x1 - x0}" height="4" fill="#d8b04a" opacity="0.8"/>`;
    return g;
  };
  // round loaf
  P.bread = (x, y, s = 1) => `<g transform="translate(${f(x)},${f(y)}) scale(${fs(s)})"><path d="M-50,0 C-54,-40 54,-40 50,0Z" fill="#b8783a" ${ol(1.2)}/><path d="M-30,-22 l10,8 M-6,-28 l10,8 M18,-24 l10,8" stroke="#6a3a14" stroke-width="3"/><ellipse cx="-14" cy="-24" rx="18" ry="6" fill="#f0c890" opacity="0.4"/></g>`;
  P.apples = (x, y, s = 1) => `<g transform="translate(${f(x)},${f(y)}) scale(${fs(s)})">` + [[-26, -8], [8, -12], [-8, -34], [26, -6]].map(([ax, ay], i) => P.apple(ax, ay, 20, i * 20)).join('') + `</g>`;
  // wine jug
  P.jug = (x, y, s = 1) => { const id = uid('jg'); return `<g transform="translate(${f(x)},${f(y)}) scale(${fs(s)})"><defs>${LG(id, [[0, '#6a3a1e'], [0.4, '#b87a46'], [1, '#4a2410']], 0, 0, 1, 0)}</defs><path d="M-40,0 C-60,-60 -40,-120 -20,-140 L-24,-170 L24,-170 L20,-140 C40,-120 60,-60 40,0Z" fill="url(#${id})" ${ol(1.3)}/><path d="M36,-130 C80,-120 80,-50 44,-40" stroke="${OUT}" stroke-width="13" fill="none"/><path d="M36,-130 C80,-120 80,-50 44,-40" stroke="#8a5a30" stroke-width="9" fill="none"/></g>`; };
})(window);
