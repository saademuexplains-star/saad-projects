// Props for "The Blind Harpist". Hand-held props use the RIG grip frame (+x = thumb side, +y = fingers);
// the harp, the map table and the brazier are drawn in world space and return the points that hands and cameras need.
(function (G) {
  const { f, shade, mix, rng, uid, OUT, ol } = G.RIG, C = G.CINE;
  const P = G.PROPS;
  const LG = (id, stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1, units = '') => `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"${units ? ` gradientUnits="${units}"` : ''}>${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a !== undefined ? ` stop-opacity="${a}"` : ''}/>`).join('')}</linearGradient>`;
  const GOLD = (id, x1 = 0, y1 = 0, x2 = 1, y2 = 0) => LG(id, [[0, '#6a4a14'], [0.3, '#f2d27a'], [0.55, '#c89a3a'], [0.8, '#8a6420'], [1, '#5a3c10']], x1, y1, x2, y2);
  const BRONZE = id => LG(id, [[0, '#3a2414'], [0.35, '#a8743e'], [0.6, '#7a4e26'], [1, '#2a1a0e']], 0, 0, 1, 0);

  // ---------------- the blinding iron (grip frame): wooden handle through the fist, iron rod along +x, glowing point.
  // heat 0..1 colours the last third of the rod from dull iron to orange-white
  P.IRON_TIP = [530, 0];
  P.ironG = (heat = 1) => {
    const id = uid('ir'), h = Math.max(0, Math.min(1, heat));
    let g = `<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="250" y1="0" x2="530" y2="0"><stop offset="0" stop-color="#2c2a2c"/><stop offset="0.45" stop-color="${mix('#3a2c28', '#8a2008', h)}"/><stop offset="0.75" stop-color="${mix('#3e302a', '#f0601a', h)}"/><stop offset="1" stop-color="${mix('#4a3a32', '#fff0c0', h)}"/></linearGradient></defs>`;
    g += `<rect x="-86" y="-16" width="186" height="32" rx="13" fill="#4a2c18" ${ol(1.3)}/>`;
    for (const x of [-60, -30, 0, 30, 60]) g += `<path d="M${x},-14 L${x + 10},14" stroke="#2a180c" stroke-width="2.4" opacity="0.6"/>`;
    g += `<path d="M-80,-9 L92,-9" stroke="#8a5a32" stroke-width="3" opacity="0.5"/>`;
    g += `<rect x="96" y="-13" width="26" height="26" rx="4" fill="#34343a" ${ol(1.1)}/><path d="M120,-8 L470,-6 L530,0 L470,6 L120,8Z" fill="url(#${id})" ${ol(1.2)}/>`;
    g += `<path d="M124,-4 L466,-3" stroke="#fff" stroke-width="1.6" opacity="${f(0.18 + 0.3 * h)}"/>`;
    if (h > 0.02) g += C.bloom(500, 0, 70 + 50 * h, '#ff7a2a', 0.75 * h) + C.radial(510, 0, 34, '#fff4c8', 0.8 * h, 'screen');
    return g;
  };

  // ---------------- bronze brazier on three lion-paw legs. (x,y) = floor centre. Returns { back, front, mouth }
  // back = far rim, glowing coals and fire (draw before anything that dips into it), front = bowl and legs
  P.brazier = (x, y, s, t, o = {}) => {
    const id = uid('bz'), rimY = y - 400 * s, rx = 230 * s, ry = 52 * s, S = G.SETS, fl = 0.85 + 0.1 * Math.sin(t * 9) + 0.05 * Math.sin(t * 23);
    let back = `<defs>${BRONZE(id)}<radialGradient id="${id}c"><stop offset="0" stop-color="#fff0a0"/><stop offset="0.35" stop-color="#ff9a30"/><stop offset="0.75" stop-color="#b8300c"/><stop offset="1" stop-color="#3a0c04"/></radialGradient></defs>`;
    back += `<ellipse cx="${f(x)}" cy="${f(rimY)}" rx="${f(rx)}" ry="${f(ry)}" fill="#1a0c06" ${ol(1.4)}/>`;
    back += `<ellipse cx="${f(x)}" cy="${f(rimY + 4 * s)}" rx="${f(rx * 0.9)}" ry="${f(ry * 0.78)}" fill="url(#${id}c)" opacity="${f(0.95 * fl)}"/>`;
    const r = rng(o.seed || 4);
    for (let i = 0; i < 26; i++) { const a = r() * Math.PI * 2, rr = Math.sqrt(r()) * 0.85, cx = x + Math.cos(a) * rx * rr, cy = rimY + Math.sin(a) * ry * rr * 0.7, sz = (10 + r() * 14) * s, hot = r();
      back += `<path d="M${f(cx - sz)},${f(cy)} L${f(cx - sz * 0.3)},${f(cy - sz * 0.7)} L${f(cx + sz * 0.8)},${f(cy - sz * 0.5)} L${f(cx + sz)},${f(cy + sz * 0.3)} L${f(cx)},${f(cy + sz * 0.6)}Z" fill="${hot > 0.55 ? '#ffb040' : '#3a1006'}" opacity="${hot > 0.55 ? f(0.7 + 0.3 * Math.sin(t * 7 + i)) : 0.9}" stroke="#1a0604" stroke-width="1"/>`; }
    if (S && S.fireMorph) back += S.fireMorph(x, rimY - 2 * s, 0.9 * s, 31, 6, t * 7.2) + S.fireMorph(x - 80 * s, rimY + 2 * s, 0.6 * s, 41, 5, t * 6.4 + 0.4) + S.fireMorph(x + 90 * s, rimY + 2 * s, 0.65 * s, 51, 5, t * 8.1 + 0.7);
    if (S && S.embers) back += S.embers(x, rimY - 40 * s, rx * 1.2, 520 * s, t, 16, (o.seed || 4) + 3);
    if (G.ENV) back += G.ENV.smoke(x + 20 * s, rimY - 220 * s, 520 * s, (o.seed || 4) + Math.floor(t * 0.5), '#8a8078', 0.18);
    // bowl: a deep bronze basin with a beaded rim and a band of repoussé ornament
    let front = `<path d="M${f(x - rx)},${f(rimY)} C${f(x - rx * 0.96)},${f(rimY + 120 * s)} ${f(x - rx * 0.55)},${f(rimY + 190 * s)} ${f(x)},${f(rimY + 196 * s)} C${f(x + rx * 0.55)},${f(rimY + 190 * s)} ${f(x + rx * 0.96)},${f(rimY + 120 * s)} ${f(x + rx)},${f(rimY)} A${f(rx)},${f(ry)} 0 0 1 ${f(x - rx)},${f(rimY)}Z" fill="url(#${id})" ${ol(1.6)}/>`;
    front += `<path d="M${f(x - rx * 0.97)},${f(rimY + 44 * s)} Q${f(x)},${f(rimY + 104 * s)} ${f(x + rx * 0.97)},${f(rimY + 44 * s)}" stroke="#d8a860" stroke-width="${f(10 * s)}" fill="none" opacity="0.55"/>`;
    for (let i = 0; i < 9; i++) { const u = (i + 0.5) / 9, px = x - rx * 0.86 + u * rx * 1.72, py = rimY + 70 * s + Math.sin(u * Math.PI) * 52 * s; front += `<circle cx="${f(px)}" cy="${f(py)}" r="${f(9 * s)}" fill="#c89050" stroke="#3a2010" stroke-width="1.2" opacity="0.85"/>`; }
    front += `<path d="M${f(x - rx)},${f(rimY)} A${f(rx)},${f(ry)} 0 0 0 ${f(x + rx)},${f(rimY)}" stroke="#e0b070" stroke-width="${f(12 * s)}" fill="none"/><path d="M${f(x - rx)},${f(rimY)} A${f(rx)},${f(ry)} 0 0 0 ${f(x + rx)},${f(rimY)}" ${ol(1.4)} fill="none"/>`;
    front += `<path d="M${f(x - rx * 0.9)},${f(rimY + 30 * s)} Q${f(x - rx * 0.5)},${f(rimY + 150 * s)} ${f(x - 30 * s)},${f(rimY + 170 * s)}" stroke="#ffd08a" stroke-width="${f(8 * s)}" fill="none" opacity="0.35"/>`;
    for (const k of [-0.62, 0, 0.62]) {
      const lx = x + k * rx, top = rimY + (k ? 150 : 196) * s, foot = y, kk = k ? Math.sign(k) : 0;
      front += `<path d="M${f(lx - 14 * s)},${f(top)} C${f(lx - 10 * s + kk * 30 * s)},${f(top + 80 * s)} ${f(lx - 18 * s + kk * 60 * s)},${f(foot - 60 * s)} ${f(lx - 12 * s + kk * 70 * s)},${f(foot - 20 * s)} L${f(lx + 12 * s + kk * 70 * s)},${f(foot - 20 * s)} C${f(lx + 18 * s + kk * 60 * s)},${f(foot - 60 * s)} ${f(lx + 12 * s + kk * 30 * s)},${f(top + 80 * s)} ${f(lx + 14 * s)},${f(top)}Z" fill="url(#${id})" ${ol(1.3)}/>`;
      front += `<ellipse cx="${f(lx + kk * 70 * s)}" cy="${f(foot - 10 * s)}" rx="${f(30 * s)}" ry="${f(14 * s)}" fill="#6a4422" ${ol(1.2)}/>` + [-1, 0, 1].map(j => `<path d="M${f(lx + kk * 70 * s + j * 14 * s)},${f(foot - 18 * s)} l0,${f(14 * s)}" stroke="#2a1608" stroke-width="2"/>`).join('');
    }
    front += C.radial(x, rimY - 30 * s, 700 * s, '#ff8a3a', 0.3 * fl, 'screen');
    return { back, front, mouth: [x, rimY], rimY, rx };
  };

  // ---------------- the golden harp, strings facing the camera. (x,y) = base centre on the floor, s scale.
  // triangle: column on the right (B -> T), curved neck on top (T -> N), soundbox down the diagonal (N -> B).
  // o.vib(i) = vibration amplitude of string i (0..1), t = time. Returns { svg, pt(i, v) world point on string i at v (0 top .. 1 bottom), n }
  const HARP = (() => {
    const T = [150, -880], N = [-250, -560], Bx = [130, -24];
    const neck = [[150, -880], [70, -940], [-70, -770], [-140, -704], [-196, -654], [-232, -640], [-250, -560]];
    // sample the neck as two cubic segments
    const cub = (p0, p1, p2, p3, u) => { const a = 1 - u; return [a * a * a * p0[0] + 3 * a * a * u * p1[0] + 3 * a * u * u * p2[0] + u * u * u * p3[0], a * a * a * p0[1] + 3 * a * a * u * p1[1] + 3 * a * u * u * p2[1] + u * u * u * p3[1]]; };
    const pts = []; for (let i = 0; i <= 40; i++) pts.push(cub(neck[0], neck[1], neck[2], neck[3], i / 40)); for (let i = 1; i <= 40; i++) pts.push(cub(neck[3], neck[4], neck[5], neck[6], i / 40));
    const neckY = x => { let best = pts[0]; for (const p of pts) if (Math.abs(p[0] - x) < Math.abs(best[0] - x)) best = p; return best[1] + 20; };
    const boxY = x => N[1] + (x - N[0]) / (Bx[0] - N[0]) * (Bx[1] - N[1]) - 22;
    const n = 22, xs = [...Array(n)].map((_, i) => -222 + i * (118 + 222) / (n - 1));
    return { T, N, Bx, neck, neckY, boxY, n, xs };
  })();
  P.HARP = HARP;
  P.harp = (x, y, s, t = 0, o = {}) => {
    const id = uid('hp'), H = HARP, tr = (p) => [x + p[0] * s, y + p[1] * s];
    let g = `<defs>${GOLD(id)}${GOLD(id + 'v', 0, 0, 0, 1)}</defs><g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">`;
    // strings first (behind the frame's edges)
    for (let i = 0; i < H.n; i++) {
      const sx = H.xs[i], y0 = H.neckY(sx), y1 = H.boxY(sx), a = (o.vib ? o.vib(i) : 0) * 7 * Math.sin(t * (90 + i * 9));
      const col = i % 7 === 3 ? '#b8382a' : (i % 2 ? '#e8e0c8' : '#d8c890');
      g += `<path d="M${f(sx)},${f(y0)} Q${f(sx + a)},${f((y0 + y1) / 2)} ${f(sx)},${f(y1)}" stroke="#2a1e10" stroke-width="3.6" fill="none" opacity="0.55"/><path d="M${f(sx)},${f(y0)} Q${f(sx + a)},${f((y0 + y1) / 2)} ${f(sx)},${f(y1)}" stroke="${col}" stroke-width="2.2" fill="none"/>`;
    }
    // soundbox: a tapered gilded box down the diagonal, with carved rosettes
    const n = H.N, b = H.Bx, d = [b[0] - n[0], b[1] - n[1]], L = Math.hypot(d[0], d[1]), u = [d[0] / L, d[1] / L], nn = [-u[1], u[0]];
    const q = (p, w) => `${f(p[0] + nn[0] * w)},${f(p[1] + nn[1] * w)}`;
    g += `<path d="M${q(n, -18)} L${q(b, -40)} L${q([b[0] + u[0] * 30, b[1] + u[1] * 30], 46)} L${q(n, 30)}Z" fill="url(#${id}v)" ${ol(2)}/>`;
    g += `<path d="M${q(n, -6)} L${q(b, -22)}" stroke="#fff0b0" stroke-width="4" opacity="0.5"/>`;
    for (let k = 1; k <= 3; k++) { const c = [n[0] + d[0] * k / 4 + nn[0] * 10, n[1] + d[1] * k / 4 + nn[1] * 10]; g += `<circle cx="${f(c[0])}" cy="${f(c[1])}" r="15" fill="#3a2408" ${ol(1.2)}/><circle cx="${f(c[0])}" cy="${f(c[1])}" r="9" fill="none" stroke="#e8c870" stroke-width="2.4"/>`; }
    // column: fluted gilded pillar with a capital and a carved bird's head finial
    g += `<rect x="128" y="-866" width="46" height="846" fill="url(#${id})" ${ol(2)}/>`;
    for (const fx of [140, 151, 162]) g += `<path d="M${fx},-820 L${fx},-60" stroke="#6a4a14" stroke-width="2.2" opacity="0.55"/>`;
    g += `<path d="M144,-820 L144,-60" stroke="#fff4c0" stroke-width="2.6" opacity="0.5"/>`;
    for (const yy of [-860, -470, -60]) g += `<rect x="118" y="${yy - 10}" width="66" height="22" rx="6" fill="url(#${id})" ${ol(1.4)}/>`;
    g += `<path d="M150,-880 C176,-930 214,-944 226,-916 C236,-896 214,-884 196,-892 L206,-874 L170,-866Z" fill="url(#${id})" ${ol(1.6)}/><circle cx="208" cy="-910" r="4" fill="#2a1408"/>`;
    // neck: the harmonic curve, thick gilded wood with tuning pins
    const nd = `M${H.neck[0]} C${H.neck[1]} ${H.neck[2]} ${H.neck[3]} C${H.neck[4]} ${H.neck[5]} ${H.neck[6]}`;
    g += `<path d="${nd}" stroke="${OUT}" stroke-width="44" fill="none" stroke-linecap="round"/><path d="${nd}" stroke="url(#${id}v)" stroke-width="38" fill="none" stroke-linecap="round"/><path d="${nd}" stroke="#fff0b0" stroke-width="5" fill="none" opacity="0.45" transform="translate(0,-9)"/>`;
    for (const sx of H.xs) g += `<circle cx="${f(sx)}" cy="${f(H.neckY(sx) - 22)}" r="4.2" fill="#5a3c10" stroke="#2a1806" stroke-width="1"/>`;
    // plinth
    g += `<path d="M-30,-24 L210,-24 L222,0 L-42,0Z" fill="url(#${id})" ${ol(1.6)}/><path d="M-26,-18 L206,-18" stroke="#fff0b0" stroke-width="3" opacity="0.5"/>`;
    g += `</g>`;
    if (o.glow) g += C.bloom(x + 40 * s, y - 520 * s, 360 * s, '#ffcf70', 0.22 * o.glow);
    const pt = (i, v) => { const sx = H.xs[Math.max(0, Math.min(H.n - 1, i))], y0 = H.neckY(sx), y1 = H.boxY(sx); return tr([sx, y0 + (y1 - y0) * v]); };
    return { svg: g, pt, n: H.n };
  };

  // ---------------- the war table: a dark wood top with the campaign map, a purple cloth skirt to the floor.
  // x0..x1 span, yFar/yNear = far/near edges of the visible top, yFloor = floor line. The map is drawn in map units
  // (0..1000 x 0..1000) squashed onto the top. o.blocks [[mx, my, col], ...] army blocks; o.spill { u, at: [mx, my] };
  // o.hand: a block being moved { from, to, k }. Returns { top, front, pt(mx, my) }
  P.mapTable = (x0, x1, yFar, yNear, yFloor, t, o = {}) => {
    const id = uid('mt'), mx0 = x0 + 34, mx1 = x1 - 34, my0 = yFar + 14, my1 = yNear - 18, sx = (mx1 - mx0) / 1000, sy = (my1 - my0) / 1000;
    const pt = (mx, my) => [mx0 + mx * sx, my0 + my * sy];
    let top = `<defs>${LG(id, [[0, '#2a160c'], [1, '#4a2a16']])}${LG(id + 'p', [[0, '#c8b084'], [0.5, '#dcc69a'], [1, '#c4a878']], 0, 0, 1, 0)}<clipPath id="${id}c"><rect x="${f(mx0)}" y="${f(my0)}" width="${f(mx1 - mx0)}" height="${f(my1 - my0)}"/></clipPath></defs>`;
    top += `<rect x="${f(x0)}" y="${f(yFar)}" width="${f(x1 - x0)}" height="${f(yNear - yFar)}" fill="url(#${id})" ${ol(1.6)}/>`;
    top += `<rect x="${f(mx0)}" y="${f(my0)}" width="${f(mx1 - mx0)}" height="${f(my1 - my0)}" fill="url(#${id}p)"/><rect x="${f(mx0)}" y="${f(my0)}" width="${f(mx1 - mx0)}" height="${f(my1 - my0)}" fill="#6a4a20" opacity="0.18" filter="url(#tex)"/>`;
    // map art in map units
    let m = '';
    // the sea: a big inland sea with a strait, and a northern sea
    m += `<path d="M0,620 C120,560 220,640 330,600 C420,570 470,520 560,540 C600,548 620,500 640,470 C660,500 690,540 760,530 C860,516 920,600 1000,580 L1000,1000 L0,1000Z" fill="#7d9c98" opacity="0.85"/>`;
    m += `<path d="M560,0 C580,90 660,160 760,170 C860,180 930,120 1000,140 L1000,0Z" fill="#7d9c98" opacity="0.85"/><path d="M640,470 C636,380 660,300 700,240 C720,210 740,190 760,170" stroke="#7d9c98" stroke-width="16" fill="none" opacity="0.9"/>`;
    m += `<path d="M0,620 C120,560 220,640 330,600 C420,570 470,520 560,540 C600,548 620,500 640,470 C660,500 690,540 760,530 C860,516 920,600 1000,580" stroke="#3a4a46" stroke-width="5" fill="none"/><path d="M560,0 C580,90 660,160 760,170 C860,180 930,120 1000,140" stroke="#3a4a46" stroke-width="5" fill="none"/>`;
    for (let i = 0; i < 4; i++) m += `<path d="M${40 + i * 230},${760 + (i % 2) * 70} q30,-14 60,0 q30,14 60,0" stroke="#4a6a66" stroke-width="3" fill="none" opacity="0.6"/>`;
    // mountains, rivers, forests
    const r = rng(17);
    for (let i = 0; i < 26; i++) { const ax = 60 + r() * 880, ay = 180 + r() * 340; if (ay > 520 && ax > 300) continue; m += `<path d="M${f(ax - 22)},${f(ay)} L${f(ax)},${f(ay - 34)} L${f(ax + 22)},${f(ay)}" stroke="#5a4020" stroke-width="4" fill="#b8986a"/>`; }
    m += `<path d="M120,80 C170,200 140,320 220,430 C260,490 300,540 330,600" stroke="#5a8a8a" stroke-width="5" fill="none"/><path d="M880,320 C820,380 800,450 760,530" stroke="#5a8a8a" stroke-width="5" fill="none"/>`;
    // the capital on its strait: walls, towers, a gold dome
    m += `<g transform="translate(660,500)"><path d="M-60,-10 L-40,-50 L30,-58 L60,-20 L40,20 L-30,22Z" fill="#c8a870" stroke="#3a2410" stroke-width="5"/>` + [[-40, -50], [30, -58], [60, -20], [40, 20], [-30, 22], [-60, -10]].map(([a, b]) => `<rect x="${a - 8}" y="${b - 8}" width="16" height="16" fill="#8a6a40" stroke="#3a2410" stroke-width="3"/>`).join('') + `<path d="M-14,-12 A16,16 0 0 1 18,-12Z" fill="#d8a838" stroke="#3a2410" stroke-width="3"/></g>`;
    // campaign arrows (painted in ink and red)
    m += `<path d="M180,300 C300,260 420,300 520,420" stroke="#8a1a14" stroke-width="12" fill="none" stroke-linecap="round" opacity="0.85"/><path d="M500,380 L530,430 L470,420Z" fill="#8a1a14" opacity="0.85"/>`;
    m += `<path d="M900,260 C840,300 780,360 720,430" stroke="#1a2a5a" stroke-width="10" fill="none" stroke-dasharray="26 14" opacity="0.8"/><path d="M742,392 L712,442 L700,400Z" fill="#1a2a5a" opacity="0.8"/>`;
    // compass rose
    m += `<g transform="translate(110,880)" opacity="0.8"><circle r="60" fill="none" stroke="#5a4020" stroke-width="3"/><path d="M0,-80 L12,0 L0,80 L-12,0Z M-80,0 L0,12 L80,0 L0,-12Z" fill="#5a4020"/></g>`;
    m += `<rect x="6" y="6" width="988" height="988" fill="none" stroke="#5a4020" stroke-width="10"/><rect x="22" y="22" width="956" height="956" fill="none" stroke="#5a4020" stroke-width="3"/>`;
    top += `<g clip-path="url(#${id}c)"><g transform="translate(${f(mx0)},${f(my0)}) scale(${f(sx)},${f(sy)})">${m}</g>`;
    // wine spill spreading over the map (screen space, flattened by the table's foreshortening)
    if (o.spill && o.spill.u > 0) {
      const sp = o.spill, c = pt(...sp.at), rs = rng(sp.seed || 5), u = sp.u; let d = '';
      for (let i = 0; i <= 26; i++) { const a = i / 26 * Math.PI * 2, rr = (0.7 + rs() * 0.6) * u; d += `${i ? 'L' : 'M'}${f(c[0] + Math.cos(a) * 300 * rr + (Math.cos(a) > 0 ? 160 * u : 0))},${f(c[1] + Math.sin(a) * 300 * rr * (sy * 1000 / (sx * 1000)))} `; }
      top += `<path d="${d}Z" fill="#5a0812" opacity="0.88" filter="url(#b2)"/><path d="${d}Z" fill="#a01828" opacity="0.45" transform="translate(${f(c[0] * 0.25)},${f(c[1] * 0.25)}) scale(0.75)" filter="url(#b4)"/>`;
    }
    top += `</g>`;
    // army blocks standing on the map (not squashed): red = ours, black = the enemy
    for (const b of o.blocks || []) {
      const [bx, by] = pt(b[0], b[1]), col = b[2] || '#8a1a14', k = b[3] || 1;
      top += `<g transform="translate(${f(bx)},${f(by)}) scale(${f(k)})"><ellipse cx="0" cy="4" rx="30" ry="9" fill="#000" opacity="0.35" filter="url(#b2)"/><path d="M-22,0 L-22,-26 L22,-26 L22,0Z" fill="${col}" ${ol(1.2)}/><path d="M-22,-26 L-10,-36 L34,-36 L22,-26Z" fill="${shade(col, 0.25)}" ${ol(1.2)}/><path d="M22,0 L34,-10 L34,-36 L22,-26Z" fill="${shade(col, -0.3)}" ${ol(1.2)}/><path d="M6,-34 L6,-80" stroke="#2a1a0c" stroke-width="3"/><path d="M6,-80 L36,-72 L6,-64Z" fill="${shade(col, 0.15)}" ${ol(1)}/></g>`;
    }
    // near edge: a gilded lip
    top += `<rect x="${f(x0 - 6)}" y="${f(yNear - 6)}" width="${f(x1 - x0 + 12)}" height="26" fill="#3a200e" ${ol(1.4)}/><rect x="${f(x0 - 6)}" y="${f(yNear - 6)}" width="${f(x1 - x0 + 12)}" height="7" fill="#c89a3a" opacity="0.85"/>`;
    // the purple skirt with a gold band and fringe
    let front = `<defs>${LG(id + 'k', [[0, '#3a1034'], [0.5, '#4c1642'], [1, '#2a0a24']], 0, 0, 1, 0)}</defs><rect x="${f(x0)}" y="${f(yNear + 20)}" width="${f(x1 - x0)}" height="${f(yFloor - yNear - 20)}" fill="url(#${id}k)" ${ol(1.4)}/>`;
    for (let xx = x0 + 50; xx < x1; xx += 95) front += `<path d="M${f(xx)},${f(yNear + 30)} Q${f(xx + 10)},${f((yNear + yFloor) / 2)} ${f(xx - 4)},${f(yFloor)}" stroke="#14040f" stroke-width="22" opacity="0.4" fill="none" filter="url(#b8)"/><path d="M${f(xx + 44)},${f(yNear + 30)} L${f(xx + 48)},${f(yFloor)}" stroke="#a04a90" stroke-width="10" opacity="0.18" fill="none" filter="url(#b4)"/>`;
    front += `<rect x="${f(x0)}" y="${f(yNear + 54)}" width="${f(x1 - x0)}" height="30" fill="#b88a2e" ${ol(1.2)}/>` + [...Array(Math.floor((x1 - x0) / 60))].map((_, i) => `<circle cx="${f(x0 + 30 + i * 60)}" cy="${f(yNear + 69)}" r="7" fill="${i % 2 ? '#a8202a' : '#2a5aa8'}" stroke="#3a2a10" stroke-width="1.4"/>`).join('');
    front += `<rect x="${f(x0)}" y="${f(yNear + 20)}" width="${f(x1 - x0)}" height="34" fill="#000" opacity="0.35" filter="url(#b4)"/>`;
    return { top, front, pt };
  };

  // ---------------- marble serving pedestal (round top at top). (x,y) = floor centre
  P.pedestal = (x, y, s) => {
    const id = uid('pd'), topY = y - 560 * s;
    let g = `<defs>${LG(id, [[0, '#3e5a4e'], [0.35, '#9ab8a8'], [0.6, '#6a8a7a'], [1, '#2a3e34']], 0, 0, 1, 0)}${GOLD(id + 'g')}</defs>`;
    g += `<rect x="${f(x - 46 * s)}" y="${f(topY + 30 * s)}" width="${f(92 * s)}" height="${f(500 * s)}" fill="url(#${id})" ${ol(1.4)}/>`;
    for (let i = 0; i < 4; i++) g += `<path d="M${f(x - 30 * s + i * 18 * s)},${f(topY + 60 * s)} q${f(10 * s)},${f(120 * s)} ${f(-6 * s)},${f(420 * s)}" stroke="#e8f4ec" stroke-width="1.6" opacity="0.35" fill="none"/>`;
    g += `<rect x="${f(x - 80 * s)}" y="${f(y - 40 * s)}" width="${f(160 * s)}" height="${f(40 * s)}" fill="url(#${id}g)" ${ol(1.3)}/><rect x="${f(x - 70 * s)}" y="${f(topY + 20 * s)}" width="${f(140 * s)}" height="${f(30 * s)}" fill="url(#${id}g)" ${ol(1.3)}/>`;
    g += `<ellipse cx="${f(x)}" cy="${f(topY + 6 * s)}" rx="${f(150 * s)}" ry="${f(30 * s)}" fill="#cfe0d6" ${ol(1.4)}/><path d="M${f(x - 150 * s)},${f(topY + 6 * s)} L${f(x - 150 * s)},${f(topY + 22 * s)} A${f(150 * s)},${f(30 * s)} 0 0 0 ${f(x + 150 * s)},${f(topY + 22 * s)} L${f(x + 150 * s)},${f(topY + 6 * s)}" fill="#8aa898" ${ol(1.3)}/>`;
    return { svg: g, top: [x, topY] };
  };
  // gilded wine ewer (oinochoe). (x,y) = foot on the surface
  P.ewer = (x, y, s) => { const id = uid('ew'); return `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><defs>${GOLD(id)}</defs><path d="M-30,0 C-56,-40 -60,-110 -30,-150 C-24,-160 -22,-176 -26,-190 L-44,-206 L18,-206 L24,-190 C20,-176 22,-160 30,-150 C60,-110 56,-40 30,0Z" fill="url(#${id})" ${ol(1.4)}/><path d="M28,-170 C78,-170 84,-80 40,-56" stroke="${OUT}" stroke-width="14" fill="none"/><path d="M28,-170 C78,-170 84,-80 40,-56" stroke="#c89a3a" stroke-width="9" fill="none"/><ellipse cx="0" cy="-90" rx="40" ry="10" fill="none" stroke="#7a5418" stroke-width="3"/><circle cx="0" cy="-90" r="8" fill="#a8202a" stroke="#3a2a10" stroke-width="1.4"/><path d="M-36,-130 C-44,-90 -40,-50 -24,-20" stroke="#fff4c0" stroke-width="5" fill="none" opacity="0.5"/></g>`; };

  // ---------------- polycandelon: a bronze ring hung on three chains with glass oil cups (green / amber), each with a flame.
  // (x,y) = ring centre, t time
  P.polycandelon = (x, y, s, t, seed = 0, n = 8) => {
    const sw = Math.sin(t * 0.7 + seed) * 3, a0 = t * 0.08 + seed;
    let back = '', front = '';
    for (const k of [-1, 0, 1]) back += `<path d="M${f(k * 210 * s)},${f(-6 * s)} L${f(sw * 10 * s)},${f(-620 * s)}" stroke="#1a120a" stroke-width="${f(4 * s)}"/>`;
    for (let i = 0; i < n; i++) {
      const a = a0 + i / n * Math.PI * 2, cx = Math.cos(a) * 230 * s, cy = Math.sin(a) * 40 * s, behind = Math.sin(a) < 0, col = i % 2 ? '#5a8a4a' : '#c8902a';
      const c = `<path d="M${f(cx - 22 * s)},${f(cy - 10 * s)} Q${f(cx)},${f(cy + 56 * s)} ${f(cx + 22 * s)},${f(cy - 10 * s)}Z" fill="${col}" opacity="0.75" stroke="#1a120a" stroke-width="1.4"/><ellipse cx="${f(cx)}" cy="${f(cy - 10 * s)}" rx="${f(22 * s)}" ry="${f(6 * s)}" fill="#f2e2b0" opacity="0.6"/>` + P.flame(cx, cy - 12 * s, 0.75 * s, t + i * 0.9 + seed);
      if (behind) back += c; else front += c;
    }
    const ring = `<ellipse cx="0" cy="0" rx="${f(230 * s)}" ry="${f(40 * s)}" fill="none" stroke="#1a120a" stroke-width="${f(16 * s)}"/><ellipse cx="0" cy="0" rx="${f(230 * s)}" ry="${f(40 * s)}" fill="none" stroke="#9a6a32" stroke-width="${f(8 * s)}"/>`;
    return `<g transform="translate(${f(x)},${f(y)}) rotate(${f(sw * 0.4)})">${back}${ring}${front}</g>` + C.bloom(x, y - 20 * s, 420 * s, '#ffb860', 0.35);
  };

  // ---------------- heavy curtain with folds and a gold fringe; open 0..1 gathers it towards the side (side -1 = left)
  P.curtain = (x0, x1, y0, y1, col, t, seed = 0, side = -1, open = 0) => {
    const id = uid('ct'), w = (x1 - x0) * (1 - 0.7 * open), xa = side < 0 ? x0 : x1 - w, n = Math.max(4, Math.round(w / 70));
    let g = `<defs>${LG(id, [[0, shade(col, -0.35)], [0.5, col], [1, shade(col, -0.4)]], 0, 0, 1, 0)}</defs>`;
    let d = `M${f(xa)},${f(y0)} L${f(xa + w)},${f(y0)} L${f(xa + w)},${f(y1)}`;
    for (let i = n; i >= 0; i--) { const xx = xa + w * i / n; d += ` Q${f(xx + w / n / 2)},${f(y1 + 16 + Math.sin(t * 1.3 + i + seed) * 6)} ${f(xx)},${f(y1)}`; }
    g += `<path d="${d}Z" fill="url(#${id})" ${ol(1.6)}/>`;
    for (let i = 0; i < n; i++) { const xx = xa + w * (i + 0.5) / n, sw = Math.sin(t * 1.1 + i * 1.7 + seed) * 6; g += `<path d="M${f(xx)},${f(y0)} Q${f(xx + sw)},${f((y0 + y1) / 2)} ${f(xx)},${f(y1)}" stroke="${shade(col, -0.6)}" stroke-width="${f(w / n * 0.35)}" opacity="0.45" fill="none" filter="url(#b8)"/><path d="M${f(xx + w / n * 0.3)},${f(y0)} Q${f(xx + w / n * 0.3 + sw)},${f((y0 + y1) / 2)} ${f(xx + w / n * 0.3)},${f(y1)}" stroke="${shade(col, 0.35)}" stroke-width="${f(w / n * 0.12)}" opacity="0.3" fill="none" filter="url(#b4)"/>`; }
    g += `<path d="M${f(xa)},${f(y1 + 4)} L${f(xa + w)},${f(y1 + 4)}" stroke="#c89a3a" stroke-width="14" stroke-dasharray="4 5" opacity="0.9"/>`;
    return g;
  };
})(window);
