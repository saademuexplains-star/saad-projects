// Sets for "The Royal Taster": private dining room (day), the great feast hall at night (two sides), the
// roulette table (top-down), the chandelier seen from below, the poison kitchen and the taster's burning house.
(function (G) {
  const { f, shade, mix, rng, uid, OUT, ol } = G.RIG, C = G.CINE, E = G.ENV, S = G.SETS, P = G.PROPS;
  const lg = S.lg;
  const RG = (id, stops, cx = 0.5, cy = 0.5, r = 0.5) => `<defs><radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a !== undefined ? ` stop-opacity="${a}"` : ''}/>`).join('')}</radialGradient></defs>`;

  // woven tapestry with a hunting scene
  S.tapestry = (x, y, w, h, base, seed, t = 0) => {
    const r = rng(seed), id = uid('tp'), sway = Math.sin(t * 0.8 + seed) * 4;
    let g = `<g transform="translate(${f(x)},${f(y)}) skewX(${f(sway * 0.05)})">` + lg(id, [[0, shade(base, -0.2)], [0.5, base], [1, shade(base, -0.35)]]) + `<rect x="${-w / 2}" y="0" width="${w}" height="${h}" fill="url(#${id})" filter="url(#tex)" stroke="${OUT}" stroke-width="2"/>`;
    g += `<rect x="${-w / 2 + 18}" y="18" width="${w - 36}" height="${h - 36}" fill="none" stroke="#c8a040" stroke-width="10" opacity="0.8"/>`;
    // stylised forest, deer and hunters
    for (let i = 0; i < 6; i++) { const tx = -w / 2 + 80 + i * (w - 160) / 5, th = h * (0.32 + r() * 0.12); g += `<path d="M${f(tx)},${f(h - 60)} L${f(tx)},${f(h - 60 - th * 0.4)}" stroke="#3a2a1a" stroke-width="10"/><ellipse cx="${f(tx)}" cy="${f(h - 60 - th * 0.6)}" rx="${f(50 + r() * 20)}" ry="${f(th * 0.32)}" fill="${shade('#3e5a32', (r() - 0.5) * 0.2)}" opacity="0.9"/>`; }
    g += `<g transform="translate(${f(-w * 0.1)},${f(h * 0.62)})" fill="#d8c8a0" opacity="0.85"><path d="M-60,0 C-40,-40 40,-40 60,-10 L70,-40 L76,-10 L60,10 L50,50 L40,50 L36,14 L-30,14 L-36,50 L-46,50 L-50,10Z"/><path d="M60,-36 l-10,-30 m10,30 l14,-28" stroke="#d8c8a0" stroke-width="5"/></g>`;
    g += `<g transform="translate(${f(w * 0.24)},${f(h * 0.55)})" fill="#8a2a22" opacity="0.85"><circle cx="0" cy="-60" r="16"/><path d="M-20,-40 L20,-40 L26,30 L-26,30Z"/><path d="M20,-30 L90,-60" stroke="#c8b890" stroke-width="5"/></g>`;
    for (let k = 0; k < 5; k++) g += `<path d="M${f(-w / 2 + (k + 0.5) * w / 5)},0 L${f(-w / 2 + (k + 0.5) * w / 5 + sway)},${h}" stroke="#000" stroke-width="22" opacity="0.12" filter="url(#b8)"/>`;
    g += `<rect x="${-w / 2 - 20}" y="-14" width="${w + 40}" height="22" rx="10" fill="#5a3a20" stroke="${OUT}" stroke-width="2"/>`;
    return g + `</g>`;
  };
  // tall arched window; daylight or moonlight
  S.archWindow = (x, y, w, h, light, op = 1) => {
    const id = uid('aw');
    let g = lg(id, [[0, mix(light, '#ffffff', 0.4)], [1, shade(light, -0.25)]]) + `<path d="M${x - w / 2},${y + h} L${x - w / 2},${y + w / 2} A${w / 2},${w / 2} 0 0 1 ${x + w / 2},${y + w / 2} L${x + w / 2},${y + h}Z" fill="url(#${id})" opacity="${op}"/>`;
    for (let k = 1; k < 3; k++) g += `<path d="M${f(x - w / 2 + k * w / 3)},${y + 20} L${f(x - w / 2 + k * w / 3)},${y + h}" stroke="#1e1a18" stroke-width="7"/>`;
    for (let yy = y + w / 2; yy < y + h; yy += 70) g += `<path d="M${x - w / 2},${yy} L${x + w / 2},${yy}" stroke="#1e1a18" stroke-width="4" opacity="0.8"/>`;
    g += `<path d="M${x - w / 2 - 24},${y + h + 20} L${x - w / 2 - 24},${y + w / 2} A${w / 2 + 24},${w / 2 + 24} 0 0 1 ${x + w / 2 + 24},${y + w / 2} L${x + w / 2 + 24},${y + h + 20}" fill="none" stroke="#4a4038" stroke-width="40" filter="url(#tex)"/><path d="M${x - w / 2 - 44},${y + h + 20} L${x + w / 2 + 44},${y + h + 20}" stroke="#3a322a" stroke-width="30"/>`;
    return g;
  };

  // ============================================== PRIVATE DINING ROOM (day). Returns { back, front } + the table edge y
  S.dining = (t, o = {}) => {
    const back = [], front = [];
    let w = S.stoneWall(-1400, -900, 2500, 1800, '#9a8c76', 21, 76);
    w += S.archWindow(-260, 120, 300, 900, '#dfe8f0') + S.archWindow(1340, 120, 300, 900, '#dfe8f0');
    w += S.tapestry(540, 160, 860, 1080, '#7a2a2a', 4, t);
    for (const [bx, ph] of [[-700, 0.3], [1780, 1.1]]) w += S.banner(bx, 120, 220, 760, '#8a1a22', t, ph, 'crown');
    // sideboard with silver
    w += `<rect x="-900" y="1300" width="700" height="360" fill="#4a2e1a" filter="url(#woodH)" stroke="${OUT}" stroke-width="2"/><rect x="-900" y="1300" width="700" height="24" fill="#6a4426"/>`;
    w += P.jug(-760, 1300, 1.1) + P.goblet(-560, 1300, 1, {}) + P.goblet(-470, 1300, 1, {}) + P.bread(-330, 1300, 1.2);
    w += `<rect x="-1400" y="-900" width="3900" height="2700" fill="#2a2030" opacity="0.2" style="mix-blend-mode:multiply"/>`;
    w += C.radial(-260, 600, 900, '#eef4ff', 0.18) + C.radial(1340, 600, 900, '#eef4ff', 0.18);
    back.push({ p: 0.5, svg: `<g filter="url(#dof1)">${w}</g>` });
    // daylight shafts with motes from the windows
    back.push({ p: 0.75, svg: `<path d="M-420,200 L-120,200 L700,2000 L200,2000Z" fill="#f4f6ff" opacity="0.07" filter="url(#b14)"/>` + S.dust(100, 1000, 400, 700, 40, 3, t, '#fff8ea', 2.4, 0.5), light: true });
    let fl = lg('dfl', [[0, '#5a4030'], [1, '#2a1a10']]) + `<rect x="-1400" y="1600" width="3900" height="1200" fill="url(#dfl)" filter="url(#woodH)"/>`;
    back.push({ p: 1, svg: fl });
    front.push({ p: 1, svg: P.table(-1400, 2500, o.tableY ?? 1820, { depth: 150, drop: 700, runner: '#6a1a22' }) });
    return { back, front };
  };

  // ============================================== THE GREAT HALL, NIGHT. side 'A' (hearth wall) or 'B' (moonlit windows + gallery)
  S.feast = (t, o = {}) => {
    const back = [], front = [], side = o.side || 'A';
    let w = S.stoneWall(-2000, -1200, 3200, 1900, side === 'A' ? '#6e5a48' : '#5a5260', side === 'A' ? 31 : 33, 84);
    // arcade of gothic arches
    for (let x = -1800; x < 3200; x += 640) w += `<path d="M${x},1500 L${x},420 Q${x + 240},140 ${x + 480},420 L${x + 480},1500" fill="#1a1210" opacity="0.55" stroke="#2a201a" stroke-width="30"/>`;
    if (side === 'A') {
      // the great hearth
      w += `<rect x="1080" y="760" width="760" height="760" fill="#1a100a"/><path d="M1020,760 L1900,760 L1900,700 L1020,700Z" fill="#4a3a2c" stroke="${OUT}" stroke-width="3" filter="url(#tex)"/>`;
      w += `<path d="M1040,1520 L1040,760 M1880,1520 L1880,760" stroke="#3a2e24" stroke-width="60" filter="url(#tex)"/>`;
      w += S.fireMorph(1460, 1500, 2.1, 40, 5, t * 7) + C.radial(1460, 1300, 900, '#ff8a3a', 0.55);
      w += S.tapestry(-420, 260, 640, 900, '#24406a', 9, t) + S.tapestry(380, 260, 520, 860, '#5a2a1a', 12, t);
      for (const [bx, ph] of [[-1300, 0.2], [2360, 0.9], [2860, 1.6]]) w += S.banner(bx, 140, 240, 820, '#7a1a22', t, ph, 'crown');
    } else {
      for (const wx of [-1100, -300, 1300, 2100]) w += S.archWindow(wx, 260, 260, 980, '#5a6e9a', 0.85);
      w += C.radial(-700, 700, 1100, '#8aa8e0', 0.18) + C.radial(1700, 700, 1100, '#8aa8e0', 0.18);
      w += S.tapestry(500, 240, 760, 980, '#3a5a3a', 15, t);
      for (const [bx, ph] of [[-1600, 0.5], [2700, 1.2]]) w += S.banner(bx, 140, 240, 820, '#7a1a22', t, ph, 'crown');
    }
    // wall torches
    for (const tx of side === 'A' ? [-1500, -860, 780, 2200] : [-1500, -700, 900, 2500]) w += P.torch(tx, 880, 1.6, t, tx) + C.bloom(tx, 760, 260, '#ff9a40', 0.5);
    // minstrels' gallery along the top
    w += `<rect x="-2000" y="-300" width="5200" height="480" fill="#24180e" filter="url(#woodH)"/><rect x="-2000" y="170" width="5200" height="40" fill="#3a2614" stroke="${OUT}" stroke-width="2"/>`;
    for (let x = -1980; x < 3200; x += 60) w += `<rect x="${x}" y="40" width="18" height="130" fill="#3a2614" stroke="${OUT}" stroke-width="1"/>`;
    w += `<rect x="-2000" y="-1200" width="5200" height="2000" fill="#0c0a14" opacity="0.35" style="mix-blend-mode:multiply"/>`;
    back.push({ p: 0.38, svg: `<g filter="url(#dof2)">${w}</g>` });
    // musicians in the gallery (silhouettes with candle rim), playing
    let mus = '';
    for (const [mx, k] of [[-900, 0], [-560, 1], [1900, 2], [2240, 3]]) {
      const bob = Math.sin(t * 5 + k) * 6;
      mus += `<g transform="translate(${mx},${f(40 + bob)})"><circle cx="0" cy="-150" r="40" fill="#120c0a"/><path d="M-60,40 L-50,-100 Q0,-120 50,-100 L60,40Z" fill="#160e0c"/>` +
        (k % 2 ? `<ellipse cx="${f(30 + Math.sin(t * 9 + k) * 4)}" cy="-30" rx="44" ry="30" fill="#2a1c12"/><path d="M60,-40 L150,-110" stroke="#2a1c12" stroke-width="10"/>` : `<path d="M-10,-60 L-90,-120" stroke="#2a1c12" stroke-width="8"/><circle cx="-100" cy="-126" r="12" fill="#2a1c12"/>`) + `</g>`;
    }
    back.push({ p: 0.38, svg: `<g filter="url(#dof2)">${mus}</g>` });
    // chandeliers hanging into the hall
    back.push({ p: 0.62, svg: `<g filter="url(#dof1)">${P.chandelier(-700, 300, 0.9, t, 10)}${P.chandelier(900, 260, 0.9, t + 2, 10)}${P.chandelier(2500, 300, 0.9, t + 4, 10)}</g>` });
    // floor
    back.push({ p: 1, svg: lg('ffl' + side, [[0, '#2a2018'], [1, '#120c08']]) + `<rect x="-2000" y="1500" width="5200" height="1400" fill="url(#ffl${side})" filter="url(#ground)"/>` });
    // smoke haze and drifting embers in the light
    back.push({ p: 0.8, svg: S.dust(540, 900, 1500, 800, 50, side === 'A' ? 7 : 8, t, side === 'A' ? '#ffd8a0' : '#dfe6ff', 2.2, 0.45) + C.fog(900, 900, side === 'A' ? '#3a2a24' : '#2a2a3a', 0.25), light: true });
    front.push({ p: 1, svg: P.table(-2000, 3200, o.tableY ?? 1630, { depth: 60, drop: 760, runner: side === 'A' ? '#5a1218' : '#2a1a3a' }) });
    return { back, front };
  };

  // ============================================== THE ROULETTE TABLE (top-down)
  S.roulette = (t, o = {}) => {
    const L = [], cx = 540, cy = 960, R = 560, id = 'rlw';
    let g = `<rect x="-1200" y="-1200" width="3500" height="4300" fill="#0a0806"/>`;
    g += RG(id, [[0, '#6a4428'], [0.7, '#4a2c18'], [1, '#22140a']]) + `<circle cx="${cx}" cy="${cy}" r="${R + 140}" fill="url(#${id})" filter="url(#woodH)"/>`;
    for (let k = 1; k < 9; k++) g += `<circle cx="${cx}" cy="${cy}" r="${R + 140 - k * 80}" fill="none" stroke="#1a0e06" stroke-width="2" opacity="0.35"/>`;
    g += `<circle cx="${cx}" cy="${cy}" r="${R + 140}" fill="none" stroke="#120a04" stroke-width="18"/>`;
    g += RG('rlv', [[0.4, '#000', 0], [1, '#000', 0.75]]) + `<circle cx="${cx}" cy="${cy}" r="${R + 160}" fill="url(#rlv)"/>`;
    L.push({ p: 1, svg: g });
    // the revolving ring of covered dishes
    let ring = '';
    const rot = o.rot || 0;
    for (let i = 0; i < 6; i++) {
      const a = (rot + i * 60 - 90) * Math.PI / 180, x = cx + Math.cos(a) * 380, y = cy + Math.sin(a) * 380;
      ring += P.clocheTop(x, y, 118, { lift: i === (o.liftIdx ?? -1) ? (o.lift || 0) : 0, meat: true });
    }
    L.push({ p: 1, svg: ring });
    // the golden spoon spinning at the centre, like a bottle
    L.push({ p: 1, svg: `<g transform="translate(${cx},${cy}) rotate(${f(o.spin || 0)}) scale(1.7) translate(-46,0)">${P.spoon({ glint: o.glint || 0 })}</g>` + C.radial(cx, cy - 200, 900, '#ffb860', 0.18) });
    return L;
  };

  // ============================================== THE CHANDELIER SEEN FROM BELOW
  S.ceiling = (t, o = {}) => {
    const cx = 540, cy = 960;
    let g = `<rect x="-1200" y="-1200" width="3500" height="4300" fill="#140e0a"/>`;
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; g += `<path d="M${cx},${cy} L${f(cx + Math.cos(a) * 2400)},${f(cy + Math.sin(a) * 2400)}" stroke="#2a1c12" stroke-width="${70}" filter="url(#woodV)"/>`; }
    for (const r of [500, 900, 1400]) g += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#24180e" stroke-width="40"/>`;
    g += C.radial(cx, cy, 900, '#ffa850', 0.35);
    return [{ p: 1, svg: g }, { p: 1, svg: P.chandelierBelow(cx, cy, o.r || 380, t, o.rot || 0, 6) }];
  };

  // ============================================== THE KITCHEN (flashback)
  S.kitchen = (t, o = {}) => {
    const back = [], front = [];
    let w = S.stoneWall(-1400, -900, 2500, 1800, '#5a5246', 41, 70);
    w += `<rect x="-200" y="560" width="900" height="900" fill="#0e0806"/><path d="M-260,560 L760,560 L700,420 L-200,420Z" fill="#3a3028" stroke="${OUT}" stroke-width="3" filter="url(#tex)"/>`;
    w += S.fireMorph(250, 1440, 2.0, 60, 5, t * 7) + C.radial(250, 1200, 800, '#ff8a3a', 0.5);
    // spit with a turning roast
    w += `<path d="M-160,1150 L660,1150" stroke="#2a2420" stroke-width="14"/><g transform="translate(250,1150) rotate(${f(Math.sin(t * 1.5) * 6)})">${P.bird(0, 60, 1.1, {})}</g>`;
    // hanging pots, herbs, shelves with jars
    for (const [hx, hs] of [[-700, 1], [-520, 0.8], [940, 0.9], [1120, 1.1]]) w += `<path d="M${hx},0 L${hx},${f(300 + hs * 80)}" stroke="#2a2420" stroke-width="4"/><path d="M${hx - 70 * hs},${f(300 + hs * 80)} Q${hx},${f(420 + hs * 120)} ${hx + 70 * hs},${f(300 + hs * 80)}Z" fill="#3a3632" stroke="${OUT}" stroke-width="2"/>`;
    for (const hx of [-1100, -980, 1400, 1520, 1640]) w += E.herbs(hx, 200, 160, '#5e6a3c', hx);
    for (const sy of [700, 950]) { w += `<rect x="1100" y="${sy}" width="700" height="20" fill="#4a3220"/>`; for (let k = 0; k < 6; k++) w += E.pot(1150 + k * 110, sy, 70, 110, ['#7a5a3a', '#5a6a7a', '#8a6a4a'][k % 3]); }
    w += `<rect x="-1400" y="-900" width="3900" height="2700" fill="#0a1006" opacity="0.4" style="mix-blend-mode:multiply"/>`;
    back.push({ p: 0.5, svg: `<g filter="url(#dof2)">${w}</g>` });
    back.push({ p: 0.8, svg: E.smoke(250, 700, 700, 3, '#8a8a7a', 0.25) + S.dust(250, 900, 700, 600, 40, 11, t, '#ffd0a0', 2, 0.4), light: true });
    back.push({ p: 1, svg: `<rect x="-1400" y="1600" width="3900" height="1200" fill="#1a140e" filter="url(#ground)"/>` });
    // the worktable top in the foreground
    front.push({ p: 1, svg: `<rect x="-1400" y="${o.tableY ?? 1560}" width="3900" height="1400" fill="#4a3220" filter="url(#woodH)"/><path d="M-1400,${o.tableY ?? 1560} L2500,${o.tableY ?? 1560}" stroke="${OUT}" stroke-width="3"/><rect x="-1400" y="${o.tableY ?? 1560}" width="3900" height="30" fill="#7a5a38" opacity="0.6"/>` });
    return { back, front };
  };

  // ============================================== THE VILLAGE AT NIGHT, the taster's house. fire 0..1
  S.house = (x, y, s, t, fire = 0) => {
    // timber-framed cottage, (x,y) = ground at the door centre. Door 200 x 380, window above-right.
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">`;
    g += `<rect x="-520" y="-760" width="1040" height="760" fill="#cbb48c" filter="url(#plaster)" stroke="${OUT}" stroke-width="3"/>`;
    for (const bx of [-520, -260, 120, 260, 520]) g += `<rect x="${bx - 18}" y="-760" width="36" height="760" fill="#3a2414" filter="url(#woodV)"/>`;
    g += `<rect x="-520" y="-400" width="1040" height="34" fill="#3a2414" filter="url(#woodH)"/><path d="M-260,-400 L-120,-760 M120,-400 L260,-760" stroke="#3a2414" stroke-width="30"/>`;
    // thatched roof
    g += `<path d="M-640,-720 L0,-1260 L640,-720 Q0,-680 -640,-720Z" fill="#8a7040" filter="url(#thatch)" stroke="${OUT}" stroke-width="3"/>`;
    for (let k = 0; k < 7; k++) g += `<path d="M${-560 + k * 160},-740 L${f(-260 + k * 70)},-1100" stroke="#5a4426" stroke-width="5" opacity="0.5"/>`;
    // door
    g += `<rect x="-100" y="-380" width="200" height="380" fill="#4a2e18" filter="url(#woodV)" stroke="${OUT}" stroke-width="3"/><path d="M-50,-380 L-50,0 M0,-380 L0,0 M50,-380 L50,0" stroke="#2a180c" stroke-width="3"/><circle cx="66" cy="-190" r="9" fill="#2a2420"/>`;
    // window (family behind, drawn by the shot) - glow grows with the fire inside
    const wg = 0.25 + fire * 0.75;
    g += `<rect x="190" y="-640" width="230" height="200" fill="${mix('#3a2a1a', '#ff9a40', wg)}" stroke="#2a180c" stroke-width="18"/><path d="M305,-640 L305,-440 M190,-540 L420,-540" stroke="#2a180c" stroke-width="10"/>`;
    g += `</g>`;
    return g;
  };
  S.village = (t, o = {}) => {
    const L = [], fire = o.fire || 0;
    let sky = E.sky(4000, 1500, [[0, '#06080e'], [0.6, '#141a2a'], [1, mix('#2a2430', '#7a3a1a', fire)]]);
    sky = `<g transform="translate(-1500,-600)">${sky}</g>`;
    sky += `<circle cx="1500" cy="220" r="70" fill="#e8ecf4"/><circle cx="1480" cy="205" r="70" fill="#141a2a" opacity="0.12"/>` + C.bloom(1500, 220, 220, '#c8d4f0', 0.35);
    sky += E.cloud(400, 260, 700, 120, 3, { col: '#2a3040' }) + E.cloud(1300, 420, 800, 140, 5, { col: '#242a3a' });
    L.push({ p: 0.25, svg: sky });
    let far = E.ridge(4000, 1100, 120, 4, '#0e121a', 160).replace('M-50', 'M-1550');
    far = `<g transform="translate(-1500,0)">${E.ridge(4000, 1100, 120, 4, '#0e121a', 160)}</g>`;
    for (const [cx, cs] of [[-700, 0.35], [-300, 0.3], [1500, 0.32], [1900, 0.36]]) far += S.house(cx, 1180, cs, t, 0).replace(/fill="#cbb48c"/, 'fill="#3a3a44"');
    L.push({ p: 0.5, svg: `<g filter="url(#dof2)" opacity="0.85">${far}</g><rect x="-1600" y="-600" width="4400" height="2800" fill="#0a0e18" opacity="0.45" style="mix-blend-mode:multiply"/>` });
    L.push({ p: 1, svg: `<rect x="-1500" y="1620" width="4200" height="1300" fill="#1a1612" filter="url(#ground)"/>` + E.straw(-1400, 2600, 1640, 2400, 160, 5, '#5a4a30') });
    L.push({ p: 1, svg: S.house(540, 1640, 1.0, t, fire), id: 'house' });
    return L;
  };
  // flames over the house (drawn by the shot in front of the house at progress u)
  S.houseFire = (x, y, s, t, u) => {
    if (u <= 0) return '';
    let g = '';
    const spots = [[-300, -900, 1.4], [0, -1150, 1.8], [300, -900, 1.4], [-480, -760, 1.1], [480, -760, 1.1], [300, -560, 1.0], [-300, -300, 1.1], [0, -760, 1.6]];
    spots.forEach(([fx, fy, fs], i) => {
      const k = Math.max(0, Math.min(1, u * spots.length * 0.9 - i * 0.8)); if (k <= 0) return;
      g += S.fireMorph(x + fx * s, y + fy * s, fs * s * 2.2 * (0.4 + 0.6 * k), 70 + i * 3, 5, t * 8 + i);
    });
    g += C.radial(x, y - 700 * s, 1400 * s, '#ff7a2a', 0.5 * u) + S.embers(x - 600 * s, y - 2200 * s, 1200 * s, 1600 * s, t, Math.round(40 * u), 19);
    g += `<g opacity="${f(Math.min(1, u * 1.5))}">${E.smoke(x - 100 * s, y - 1200 * s, 900 * s, 6, '#3a3230', 0.5)}${E.smoke(x + 150 * s, y - 1250 * s, 1000 * s, 8, '#2a2422', 0.45)}</g>`;
    return g;
  };
})(window);
