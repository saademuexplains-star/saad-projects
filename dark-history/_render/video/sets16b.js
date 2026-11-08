// Sets for "The Royal Astrologer" part 2: the lady's bedchamber (eight days and nights pass in its window), the
// midnight corridor (arches sliding past as you are marched along it), the king's chamber with the open window over
// the valley far below, and your tower wall for the shadow play.
(function (G) {
  const S = G.SETS, { f, shade, mix, rng, uid, ol } = G.RIG, C = G.CINE, PR = G.PROPS;
  const lerp = (a, b, t) => a + (b - a) * t, cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const TAU = Math.PI * 2;
  const OUTC = '#140c06';
  const olr = (w = 2, op = 0.7) => `stroke="${OUTC}" stroke-width="${w}" stroke-opacity="${op}" stroke-linejoin="round"`;
  const cache = {}, once = (k, fn) => cache[k] || (cache[k] = fn());
  const ashlar = S.ashlar, archD = S.archD16, stars = S.stars16, nightSky = S.nightSky16, clouds = S.clouds16, sconce = S.sconce16;
  const lily = (x, y, s, col) => `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})" fill="${col}"><path d="M0,-40 C14,-24 14,-6 0,10 C-14,-6 -14,-24 0,-40Z"/><path d="M-4,4 C-26,-4 -40,-24 -30,-38 C-24,-20 -14,-8 -4,0Z"/><path d="M4,4 C26,-4 40,-24 30,-38 C24,-20 14,-8 4,0Z"/><rect x="-16" y="8" width="32" height="7"/><path d="M-4,15 L0,30 L4,15Z"/></g>`;

  // ======================================================= THE LADY'S BEDCHAMBER
  // world: floor 1800; the bed seen from its foot (posts 140 / 920, headboard 860-1420, the quilt from 1420 to the
  // footboard at 1600); a leaded window at the right (790-1050, 300-1000); a nightstand with a candle and lilies.
  // o.day 0..1 (night -> noon: the window and a sunbeam), o.sun 0..1 (the beam sweeps across), o.wilt 0..1, o.candle 0..1
  S.BD = { FY: 1800, BED: [150, 910], QUILT: 1420, FOOT: 1600, LADY: [530, 1985, 0.64], KING: [10, 1960, 0.7], CANDLE: [1060, 1420], WIN: [790, 300, 260, 700] };
  S.bedroom = (t, o = {}) => {
    const B = S.BD, L = [], day = o.day ?? 0, [wx, wy, ww, wh] = B.WIN;
    // outside the window: night sky <-> day sky
    const out = `<rect x="${wx - 40}" y="${wy - 40}" width="${ww + 80}" height="${wh + 80}" fill="${mix('#0c1428', '#a8c4e0', day)}"/>` + (day < 0.5 ? `<g opacity="${f(1 - day * 2)}">${stars(wx - 40, wy - 40, wx + ww + 40, wy + wh + 40, 30, 17, t)}</g>` : '') +
      `<path d="M${wx - 40},${wy + wh * 0.8} C${wx + 60},${wy + wh * 0.72} ${wx + 160},${wy + wh * 0.78} ${wx + ww + 40},${wy + wh * 0.7} L${wx + ww + 40},${wy + wh + 40} L${wx - 40},${wy + wh + 40}Z" fill="${mix('#0a0e18', '#6a8a5a', day)}"/>`;
    L.push({ p: 0.4, svg: out });
    const wall = once('bdwall', () => {
      let g = `<defs><clipPath id="bdw"><path d="M-800,-600 L1900,-600 L1900,1800 L-800,1800Z ${archD(wx, wy, ww, wh)}" clip-rule="evenodd"/></clipPath></defs><g clip-path="url(#bdw)"><rect x="-800" y="-600" width="2700" height="2400" fill="#cbb89a" filter="url(#plaster)"/>`;
      for (let y = -560, row = 0; y < 1200; y += 110, row++) for (let x = -760 + (row % 2) * 70; x < 1900; x += 140) g += lily(x, y, 0.55, '#a8402e');
      g += `<rect x="-800" y="1200" width="2700" height="600" fill="#5a3a22" filter="url(#woodV)"/><rect x="-800" y="1190" width="2700" height="18" fill="#3a2414"/></g>`;
      g += `<path d="${archD(wx - 18, wy - 18, ww + 36, wh + 18)}" fill="none" stroke="#6a5a48" stroke-width="22"/><path d="M${wx - 30},${wy + wh} L${wx + ww + 30},${wy + wh}" stroke="#8a7a62" stroke-width="24"/>`;
      let lead = ''; for (let k = -10; k < 10; k++) lead += `<path d="M${wx + k * 40},${wy} L${wx + k * 40 + 300},${wy + wh}" stroke="#2a2420" stroke-width="3"/><path d="M${wx + ww - k * 40},${wy} L${wx + ww - k * 40 - 300},${wy + wh}" stroke="#2a2420" stroke-width="3"/>`;
      g += `<g clip-path="url(#bdwi)"><defs><clipPath id="bdwi"><path d="${archD(wx, wy, ww, wh)}"/></clipPath></defs>${lead}<rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" fill="#c8d8e8" opacity="0.12"/></g>`;
      // a small crucifix and a tapestry panel
      g += `<rect x="-560" y="200" width="420" height="700" fill="#2a3a6a" ${olr(2)}/>` + Array.from({ length: 20 }, (_, i) => lily(-520 + (i % 4) * 110, 270 + Math.floor(i / 4) * 130, 0.55, '#c9a040')).join('');
      return g;
    });
    L.push({ p: 0.8, svg: wall + C.radial(wx + ww / 2, wy + wh / 2, 520, day > 0.5 ? '#fff4d8' : '#8aa0d0', 0.12 + 0.2 * day, 'screen') });
    // the sunbeam from the window falling across the room (sweeps with o.sun); the floor and rug
    const sb = o.sun ?? 0.5, bx = lerp(-300, 500, sb);
    let fl = `<rect x="-800" y="${B.FY}" width="2700" height="700" fill="#3a2414" filter="url(#woodH)"/><path d="M-200,1880 L1300,1880 L1500,2300 L-400,2300Z" fill="#6a1e1e" ${olr(2)}/><path d="M-160,1900 L1260,1900 L1440,2280 L-340,2280Z" fill="none" stroke="#c9a040" stroke-width="6"/>`;
    if (day > 0.05) fl += `<path d="M${wx},${wy + 60} L${wx + ww},${wy + 60} L${f(bx + 520)},2200 L${f(bx)},2200Z" fill="#fff0c8" opacity="${f(0.16 * day)}"/>`;
    L.push({ p: 1, svg: fl });
    return L;
  };
  // the bed behind whoever lies in it: posts, canopy, curtains, headboard, pillows
  S.bedBack16 = (t) => {
    const B = S.BD, [x0, x1] = B.BED;
    let g = `<rect x="${x0 - 30}" y="380" width="${x1 - x0 + 60}" height="34" fill="#4a1a12" ${olr(1.5)}/>`;
    g += `<path d="M${x0 - 40},410 L${x1 + 40},410 L${x1 + 40},500 Q${(x0 + x1) / 2},530 ${x0 - 40},500Z" fill="#7a1418" ${olr(1.5)}/>` + Array.from({ length: 28 }, (_, i) => `<path d="M${x0 - 30 + i * 30},${500 + 14 * Math.sin(i / 27 * Math.PI)} l0,22" stroke="#c9a040" stroke-width="4"/>`).join('');
    // back curtains, the headboard with its velvet panel and gilt finials
    g += `<path d="M${x0},500 L${x1},500 L${x1},1420 L${x0},1420Z" fill="#5a0e12"/>` + Array.from({ length: 12 }, (_, i) => `<path d="M${x0 + 30 + i * 64},510 C${x0 + 20 + i * 64},900 ${x0 + 40 + i * 64},1100 ${x0 + 30 + i * 64},1410" stroke="#3a060a" stroke-width="10" fill="none" opacity="0.5"/>`).join('');
    g += `<path d="M${x0 + 30},1420 L${x0 + 30},900 C${x0 + 30},840 ${x1 - 30},840 ${x1 - 30},900 L${x1 - 30},1420Z" fill="#4a2a16" filter="url(#woodV)" ${olr(2)}/><path d="M${x0 + 80},1400 L${x0 + 80},950 C${x0 + 80},910 ${x1 - 80},910 ${x1 - 80},950 L${x1 - 80},1400Z" fill="#8a1a1e" ${olr(1.5)}/>`;
    g += `<ellipse cx="${(x0 + x1) / 2}" cy="1250" rx="230" ry="70" fill="#f2eee6" ${olr(1.5)}/><ellipse cx="${(x0 + x1) / 2 - 60}" cy="1330" rx="250" ry="70" fill="#eae4d8" ${olr(1.5)}/><ellipse cx="${(x0 + x1) / 2 + 80}" cy="1336" rx="230" ry="66" fill="#efe9de" ${olr(1.5)}/>`;
    for (const x of [x0, x1]) g += `<rect x="${x - 18}" y="400" width="36" height="1300" fill="#4a2a16" filter="url(#woodV)" ${olr(1.5)}/><circle cx="${x}" cy="390" r="24" fill="#c9a040" ${olr(1)}/>`;
    // the side curtains, tied back with gold cords (they sway a little)
    for (const [x, s2] of [[x0, 1], [x1, -1]]) g += `<path d="M${x},430 C${x + s2 * (90 + Math.sin(t * 0.7) * 4)},700 ${x + s2 * 70},980 ${x + s2 * 26},1100 C${x + s2 * 60},1250 ${x + s2 * 50},1500 ${x + s2 * 30},1690 L${x},1690Z" fill="#7a1418" ${olr(1.4)}/><rect x="${x + s2 * 26 - 18}" y="1090" width="36" height="20" fill="#c9a040"/>`;
    return g;
  };
  // the quilt over the lady (top at QUILT), and the footboard in front
  S.bedQuilt16 = (t, o = {}) => {
    const B = S.BD, [x0, x1] = B.BED, q = B.QUILT, br = Math.sin(t * 1.6) * 3 * (o.breath ?? 1);
    let g = `<path d="M${x0 + 20},${f(q + br)} C${x0 + 120},${f(q - 26 + br)} ${x1 - 120},${f(q - 26 + br)} ${x1 - 20},${f(q + br)} L${x1 + 10},${B.FOOT + 20} L${x0 - 10},${B.FOOT + 20}Z" fill="#8a1a1e" ${olr(2)}/>`;
    g += `<path d="M${x0 + 20},${f(q + 4 + br)} C${x0 + 120},${f(q - 20 + br)} ${x1 - 120},${f(q - 20 + br)} ${x1 - 20},${f(q + 4 + br)}" stroke="#f2eee6" stroke-width="22" fill="none"/>`;
    for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) g += lily(x0 + 110 + i * 120, q + 70 + j * 60, 0.5, '#c9a040');
    g += `<path d="M${x0 - 20},${B.FOOT} L${x1 + 20},${B.FOOT} L${x1 + 20},${B.FOOT + 140} L${x0 - 20},${B.FOOT + 140}Z" fill="#4a2a16" filter="url(#woodH)" ${olr(2)}/><path d="M${x0 + 30},${B.FOOT + 30} L${x1 - 30},${B.FOOT + 30} L${x1 - 30},${B.FOOT + 110} L${x0 + 30},${B.FOOT + 110}Z" fill="none" stroke="#2a180c" stroke-width="5"/>`;
    return g;
  };
  // the nightstand: a tall candle (o.candle 1 lit .. 0 out, with a curl of smoke after) and lilies wilting (o.wilt)
  S.nightstand16 = (t, o = {}) => {
    const B = S.BD, [cx, cy] = B.CANDLE, k = o.candle ?? 1, w = o.wilt || 0;
    let g = `<rect x="${cx - 110}" y="${cy + 80}" width="220" height="300" fill="#4a2a16" filter="url(#woodV)" ${olr(1.5)}/><rect x="${cx - 130}" y="${cy + 64}" width="260" height="22" fill="#5a3a1e" ${olr(1.4)}/>`;
    g += `<rect x="${cx - 70}" y="${cy + 30}" width="44" height="40" fill="#c9a040" ${olr(1)}/><rect x="${cx - 62}" y="${cy - 110 + w * 60}" width="28" height="${140 - w * 60}" fill="#efe6cc" ${olr(1)}/>`;
    const fx = cx - 48, fy = cy - 112 + w * 60;
    if (k > 0.02) g += `<g opacity="${f(k)}">${PR.flame(fx, fy, 1.1, t)}</g>` + C.radial(fx, fy - 20, 380, '#ffb860', 0.4 * k, 'screen');
    if (k < 0.98) { const sm = 1 - k; for (let i = 0; i < 3; i++) g += `<path d="M${fx},${fy} C${f(fx + Math.sin(t * 2 + i) * 20)},${f(fy - 60 - i * 40)} ${f(fx - Math.sin(t * 1.6 + i) * 24)},${f(fy - 120 - i * 50)} ${f(fx + Math.sin(t * 1.2 + i) * 30)},${f(fy - 200 - i * 60)}" stroke="#c8c4bc" stroke-width="${6 - i}" fill="none" opacity="${f(0.35 * sm * (1 - i * 0.25))}" filter="url(#b2)"/>`; }
    // the vase of lilies: stems droop and petals fall as w grows
    g += `<path d="M${cx + 30},${cy + 64} C${cx + 6},${cy + 20} ${cx + 10},${cy - 20} ${cx + 30},${cy - 30} C${cx + 50},${cy - 20} ${cx + 54},${cy + 20} ${cx + 30},${cy + 64}Z" fill="#3a5a7a" ${olr(1.2)}/>`;
    for (const [a0, len] of [[-30, 150], [-8, 170], [16, 160], [36, 140]]) {
      const a = (a0 + w * (a0 > 0 ? 50 : -50)) * Math.PI / 180, ex = cx + 30 + Math.sin(a) * len, ey = cy - 30 - Math.cos(a) * len * (1 - w * 0.5);
      g += `<path d="M${cx + 30},${cy - 30} Q${f(cx + 30 + Math.sin(a) * len * 0.3)},${f(cy - 30 - len * 0.6)} ${f(ex)},${f(ey)}" stroke="#3a6a2a" stroke-width="5" fill="none"/>`;
      g += `<g transform="translate(${f(ex)},${f(ey)}) rotate(${f(a * 57 + w * 70 * Math.sign(a0 + 1))})">` + [0, 1, 2].map(i => `<path d="M0,0 C${-14 + i * 14},${-30} ${-6 + i * 6},${-46} ${-4 + i * 4},${f(-50 + w * 30)}" stroke="${mix('#f8f4ec', '#c8b890', w)}" stroke-width="10" fill="none" stroke-linecap="round"/>`).join('') + `</g>`;
    }
    for (let i = 0; i < Math.floor(w * 6); i++) g += `<ellipse cx="${cx - 40 + i * 22}" cy="${cy + 62}" rx="12" ry="4" fill="#d8ccb0"/>`;
    return g;
  };

  // ======================================================= THE MIDNIGHT CORRIDOR (perspective; you are marched toward us)
  // o.z: how far the camera has retreated (world units, arches every 1.2); torches on alternating walls
  S.corridor = (t, o = {}) => {
    const z = o.z || 0, vx = 540, vy = 820, F = 900, sp = 1.2, D0 = 0.5, N = 12, iz = Math.floor(z / sp), fz = z / sp - iz;
    const depth = j => D0 + (j + 1 - fz) * sp;
    const P = (x, y, D) => { const k = F / Math.max(0.12, D); return [vx + x * k, vy + y * k]; };
    const hw = 0.95, fy = 0.95, spr = -0.55, apex = -1.25;
    // midnight: the stone only catches what the torches throw (their pools are added below), so it stays dark
    const lightAt = D => 0.6 / (1 + Math.pow(Math.max(0, D - 0.9) * 0.85, 2));
    let g = `<rect x="-400" y="-400" width="1880" height="2720" fill="#060504"/>`;
    // the far end: a dark door with a slit of moonlight
    const Dend = depth(N);
    const e = (x, y) => P(x, y, Dend);
    g += `<path d="M${e(-hw, fy).map(f).join(',')} L${e(-hw, spr).map(f).join(',')} Q${e(0, apex).map(f).join(',')} ${e(hw, spr).map(f).join(',')} L${e(hw, fy).map(f).join(',')}Z" fill="#0c0a0a"/>`;
    for (let j = N - 1; j >= -1; j--) {
      const Da = depth(j), Db = depth(j + 1), n = j + iz;
      if (Db <= 0.12) continue;
      const La = lightAt(Math.max(0.2, Da)), wallC = mix('#08070a', '#6a5a48', La * 0.9), floorC = mix('#060506', '#4a4038', La), vaultC = mix('#060506', '#3a3028', La * 0.8);
      const q = (pts) => `<path d="M${pts.map(p => p.map(f).join(',')).join(' L')}Z"`;
      // left wall, right wall, floor, vault (two triangles of the arch)
      g += q([P(-hw, fy, Da), P(-hw, spr, Da), P(-hw, spr, Db), P(-hw, fy, Db)]) + ` fill="${wallC}" stroke="${wallC}" stroke-width="1"/>`;
      g += q([P(hw, fy, Da), P(hw, spr, Da), P(hw, spr, Db), P(hw, fy, Db)]) + ` fill="${shade(wallC, -0.08)}" stroke="${shade(wallC, -0.08)}" stroke-width="1"/>`;
      g += q([P(-hw, fy, Da), P(hw, fy, Da), P(hw, fy, Db), P(-hw, fy, Db)]) + ` fill="${floorC}" stroke="${floorC}" stroke-width="1"/>`;
      g += q([P(-hw, spr, Da), P(0, apex, Da), P(0, apex, Db), P(-hw, spr, Db)]) + ` fill="${vaultC}" stroke="${vaultC}" stroke-width="1"/>`;
      g += q([P(hw, spr, Da), P(0, apex, Da), P(0, apex, Db), P(hw, spr, Db)]) + ` fill="${shade(vaultC, -0.1)}" stroke="${shade(vaultC, -0.1)}" stroke-width="1"/>`;
      // stone courses along the walls and joints on the floor
      for (const yy of [0.6, 0.25, -0.1, -0.4]) for (const sx of [-1, 1]) { const a = P(sx * hw, yy, Da), b = P(sx * hw, yy, Db); g += `<path d="M${f(a[0])},${f(a[1])} L${f(b[0])},${f(b[1])}" stroke="${shade(wallC, -0.4)}" stroke-width="${f(Math.max(1, 4 / Da))}" opacity="0.7"/>`; }
      { const a = P(-hw, fy, Da), b = P(hw, fy, Da); g += `<path d="M${f(a[0])},${f(a[1])} L${f(b[0])},${f(b[1])}" stroke="${shade(floorC, -0.4)}" stroke-width="${f(Math.max(1, 5 / Da))}"/>`; }
      // the arch rib at Da, a torch on alternate walls
      if (Da > 0.14) {
        const rw = 0.09, rib = (x, y) => P(x, y, Da);
        g += `<path d="M${rib(-hw, fy).map(f).join(',')} L${rib(-hw, spr).map(f).join(',')} Q${rib(0, apex - 0.1).map(f).join(',')} ${rib(hw, spr).map(f).join(',')} L${rib(hw, fy).map(f).join(',')}" fill="none" stroke="${mix('#0a0908', '#8a7a62', La)}" stroke-width="${f(rw * F / Da)}"/>`;
        if (n % 2 === 0) {
          const sx = (Math.floor(n / 2) % 2 ? 1 : -1) * (hw - 0.04), [tx, ty] = P(sx, -0.2, Da + 0.3), k = F / (Da + 0.3);
          g += `<path d="M${f(tx)},${f(ty + 0.15 * k)} L${f(tx)},${f(ty)}" stroke="#2a1e14" stroke-width="${f(0.03 * k)}"/>` + S.flames(tx, ty, 0.07 * k, 0.16 * k, t, 300 + n, 1);
          g += C.radial(tx, ty - 0.05 * k, 0.9 * k, '#ff9a40', 0.32 * Math.min(1, 1.3 / (Da + 0.3)), 'screen');
        }
      }
    }
    return [{ p: 1, svg: g }];
  };

  // ======================================================= THE KING'S CHAMBER AT MIDNIGHT
  // world: floor 1800; fireplace at the left (-460..100, fire at -180); the lady's portrait (black crepe) at 160-460;
  // a tall open arched window at the right (760-1200, top 140, sill 1400) with white curtains, shutters (o.shut), and the
  // moonlit valley far below; o.wind 0..1 (curtains billow)
  S.KC = { FY: 1800, FIRE: [-180, 1780], WIN: [760, 140, 440, 1260], SILL: 1400, KING: [240, 1800, 0.74], YOU: [560, 1830, 0.76], GA: [690, 1800, 0.74], GB: [1290, 1800, 0.74], PORT: [160, 300, 300, 420] };
  S.kchamber = (t, o = {}) => {
    const B = S.KC, L = [], [wx, wy, ww, wh] = B.WIN, sill = B.SILL;
    // the night outside the window: sky, moon, clouds, then the valley far below (the height)
    L.push({ p: 0.2, svg: nightSky(400, -900, 1900, 1600, t, { n: 160, seed: 23, moon: [1120, 160, 46], id: 'kc' }) + clouds(300, 2000, 400, t, 9, 4, { spread: 300 }) });
    L.push({ p: 0.32, svg: once('kcval', () => { const r = rng(12); let g = `<path d="M300,1180 C600,1120 900,1160 1300,1110 C1600,1090 1800,1120 2000,1100 L2000,2000 L300,2000Z" fill="#0a0e1a"/><path d="M300,1320 C700,1290 1000,1360 1400,1300 C1700,1270 1900,1310 2000,1290" stroke="#5a6a90" stroke-width="10" fill="none" opacity="0.45"/>`; for (let i = 0; i < 24; i++) g += `<rect x="${f(400 + r() * 1500)}" y="${f(1190 + r() * 120)}" width="5" height="7" fill="#ffc870" opacity="${f(0.5 + r() * 0.4)}"/>`; return g; }) });
    // the castle's own roofs and towers far below the window (moonlit edges, a few lit windows): the height of the drop
    L.push({ p: 0.46, svg: once('kcroofs', () => {
      const r = rng(19); let g = '';
      for (let i = 0; i < 9; i++) { const x = 300 + i * 170 + r() * 60, w = 120 + r() * 80, top = 1120 + r() * 160; g += `<path d="M${f(x)},1800 L${f(x)},${f(top + 60)} L${f(x + w / 2)},${f(top - 40 - r() * 60)} L${f(x + w)},${f(top + 60)} L${f(x + w)},1800Z" fill="#0e1018"/><path d="M${f(x + w / 2)},${f(top - 40)} L${f(x + w)},${f(top + 60)}" stroke="#5a6a90" stroke-width="3" opacity="0.5"/>` + (r() < 0.5 ? `<rect x="${f(x + w * 0.4)}" y="${f(top + 110)}" width="10" height="14" fill="#ffb860" opacity="0.8"/>` : ''); }
      return g + `<rect x="300" y="1500" width="1600" height="400" fill="#0a0c14"/>`;
    }) });
    // the room: wall, panelling, fireplace surround, portrait (p 0.84)
    const room = once('kcroom', () => {
      let g = `<defs><clipPath id="kcw"><path d="M-900,-700 L2100,-700 L2100,1800 L-900,1800Z ${archD(wx, wy, ww, wh)}" clip-rule="evenodd"/></clipPath></defs><g clip-path="url(#kcw)">`;
      g += `<rect x="-900" y="-700" width="3000" height="1900" fill="#3a1416"/>`;
      for (let y = -660, row = 0; y < 1100; y += 120, row++) for (let x = -880 + (row % 2) * 60; x < 2100; x += 120) g += `<path d="M${x},${y} l18,22 l-18,22 l-18,-22Z" fill="#5a2224" opacity="0.6"/>`;
      g += `<rect x="-900" y="1080" width="3000" height="720" fill="#2e1c10" filter="url(#woodV)"/>`;
      for (let x = -880; x < 2100; x += 150) g += `<rect x="${x}" y="1110" width="130" height="640" rx="6" fill="#26160c" ${olr(1.2, 0.5)}/>` + [0.2, 0.4, 0.6, 0.8].map(k => `<path d="M${x + 130 * k},1140 C${x + 130 * k - 8},1300 ${x + 130 * k + 8},1500 ${x + 130 * k},1720" stroke="#3e2816" stroke-width="7" fill="none" opacity="0.7"/>`).join('');
      g += `<rect x="-900" y="1070" width="3000" height="20" fill="#5a3a20"/></g>`;
      // the window surround and sill
      g += `<path d="${archD(wx - 30, wy - 30, ww + 60, wh + 30)}" fill="none" stroke="#2a1a12" stroke-width="40"/><path d="${archD(wx - 8, wy - 8, ww + 16, wh + 8)}" fill="none" stroke="#6a5a4a" stroke-width="10"/><rect x="${wx - 50}" y="${sill}" width="${ww + 100}" height="44" fill="#6a5e50" ${olr(1.5)}/>`;
      // the fireplace: stone hood and jambs, black firebox
      g += `<path d="M-460,1800 L-460,980 L-420,860 L60,860 L100,980 L100,1800Z" fill="#5a5048" ${olr(2)}/><path d="M-400,1800 L-400,1180 C-400,1120 40,1120 40,1180 L40,1800Z" fill="#100a08"/><rect x="-500" y="840" width="640" height="44" fill="#6e6256" ${olr(1.5)}/>`;
      g += `<g opacity="0.5">${ashlar(-460, 880, 100, 1110, 81, '#5a5048', { bh: 60, bw: 110 })}</g>`;
      // the portrait of the lady in her hennin, a black crepe sash across its corner
      const [px, py, pw, ph] = B.PORT;
      g += `<rect x="${px - 22}" y="${py - 22}" width="${pw + 44}" height="${ph + 44}" fill="#8a6a2a" ${olr(2)}/><rect x="${px}" y="${py}" width="${pw}" height="${ph}" fill="#1a1a2a"/>`;
      g += `<path d="M${px + 70},${py + ph} C${px + 80},${py + 300} ${px + 220},${py + 300} ${px + 230},${py + ph}Z" fill="#1f4a34"/><ellipse cx="${px + 150}" cy="${py + 230}" rx="44" ry="58" fill="#f0d0b8"/><path d="M${px + 106},${py + 196} L${px + 172},${py + 30} L${px + 194},${py + 196}Z" fill="#c9a648"/><path d="M${px + 172},${py + 34} C${px + 240},${py + 90} ${px + 250},${py + 200} ${px + 236},${py + 330}" stroke="#f4f0e8" stroke-width="10" fill="none" opacity="0.6"/>`;
      g += `<path d="M${px - 22},${py + 90} L${px + 90},${py - 22} L${px + 150},${py - 22} L${px - 22},${py + 150}Z" fill="#0a0a0c"/><path d="M${px + 60},${py + 10} l-26,60 l40,-10Z" fill="#0a0a0c"/>`;
      return g;
    });
    L.push({ p: 0.84, svg: room + S.flames(B.FIRE[0], 1760, 320, 300, t, 91, 1) + C.radial(B.FIRE[0], 1500, 900, '#ff8a3a', 0.3, 'screen') });
    // the curtains (white linen, billowing in from the open window) and the shutters (p 1)
    const wd = o.wind ?? 1, sh = o.shut || 0;
    let cur = '';
    for (const [x, sd] of [[wx + 6, 1], [wx + ww - 6, -1]]) {
      const b1 = Math.sin(t * 1.3 + sd) * 40 * wd, b2 = Math.sin(t * 1.9 + sd * 2) * 30 * wd;
      cur += `<path d="M${x},${wy + 40} C${f(x + sd * (60 + b1))},${wy + 400} ${f(x + sd * (110 + b2))},${wy + 800} ${f(x + sd * (70 + b1 * 1.3))},${f(sill + 340)} L${f(x + sd * (-20 + b1 * 0.3))},${f(sill + 360)} C${f(x - sd * 30)},${wy + 800} ${x - sd * 20},${wy + 400} ${x - sd * 6},${wy + 40}Z" fill="#f2eee6" opacity="0.82" stroke="#c8c2b4" stroke-width="2"/>`;
      cur += `<path d="M${f(x + sd * 20)},${wy + 120} C${f(x + sd * (50 + b1 * 0.6))},${wy + 500} ${f(x + sd * (70 + b2 * 0.7))},${wy + 900} ${f(x + sd * (40 + b1))},${sill + 300}" stroke="#d8d2c4" stroke-width="5" fill="none" opacity="0.7"/>`;
    }
    cur += `<rect x="${wx - 40}" y="${wy + 20}" width="${ww + 80}" height="16" fill="#2a1a10"/>`;
    if (sh > 0.001) cur += PR.shutters(wx, wx + ww, wy + 140, sill, sh);
    L.push({ p: 1, svg: `<rect x="-900" y="${B.FY}" width="3000" height="800" fill="#2a1a10" filter="url(#woodH)"/><path d="M-300,1860 L1500,1860 L1700,2300 L-500,2300Z" fill="#3a1418" ${olr(2)}/><path d="M${wx},${sill + 40} L${wx + ww},${sill + 40} L${wx + ww + 300},2200 L${wx - 200},2200Z" fill="#9ab0e0" opacity="${f(0.07 * (1 - sh))}"/>` + cur });
    return L;
  };

  // ======================================================= YOUR TOWER WALL (the shadow play)
  // a stretch of the tower's stone wall, warm where your candle (low left) lights it and falling to black at the
  // edges; the shot draws the shadows on it
  S.towerWall = (t, o = {}) => {
    const g = once('twall', () => ashlar(-900, -900, 2000, 2400, 99, '#9a8a72', { bh: 80, bw: 190 }));
    const id = 'twl';
    // the candle's pool is bright enough that the shadows on it read crisply; the corners fall to black
    const light = `<defs><radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${o.lx ?? 240}" cy="${o.ly ?? 1700}" r="1800"><stop offset="0" stop-color="#ffd8a0" stop-opacity="0.6"/><stop offset="0.45" stop-color="#c88a4a" stop-opacity="0.2"/><stop offset="1" stop-color="#000" stop-opacity="0.72"/></radialGradient></defs><rect x="-900" y="-900" width="2900" height="3300" fill="url(#${id})"/>`;
    return [{ p: 0.92, svg: g + light }];
  };
})(window);
