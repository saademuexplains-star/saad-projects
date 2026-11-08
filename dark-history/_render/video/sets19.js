// Sets for "The Pied Piper" (Hamelin, a summer morning in 1284): the street to the town gate at dawn (in perspective,
// the Piper walks out of the sunlit arch toward us), the market street with your house and its upstairs window, your
// kitchen, the road outside the walls, the hill with the winding path, the hilltop and its rock face (day and dusk),
// and a child's bedroom centuries later.
(function (G) {
  const S = G.SETS, { f, shade, mix, rng } = G.RIG, C = G.CINE, PR = G.PROPS, E = G.ENV;
  const cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t;
  const TAU = Math.PI * 2;
  const cache = {}, once = (k, fn) => cache[k] || (cache[k] = fn());
  const OUTC = '#20140c', olr = (w = 2, op = 0.7) => `stroke="${OUTC}" stroke-width="${w}" stroke-opacity="${op}" stroke-linejoin="round"`;
  const LG = (id, stops, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('')}</linearGradient>`;
  const P2 = p => `${f(p[0])},${f(p[1])}`;
  // a point inside a quad (p00 top-left, p10 top-right, p11 bottom-right, p01 bottom-left) at (u across, v down)
  const qp = (q, u, v) => { const a = [lerp(q[0][0], q[1][0], u), lerp(q[0][1], q[1][1], u)], b = [lerp(q[3][0], q[2][0], u), lerp(q[3][1], q[2][1], u)]; return [lerp(a[0], b[0], v), lerp(a[1], b[1], v)]; };
  const qpath = (q, u0, v0, u1, v1) => `M${P2(qp(q, u0, v0))} L${P2(qp(q, u1, v0))} L${P2(qp(q, u1, v1))} L${P2(qp(q, u0, v1))}Z`;
  const qline = (q, u0, v0, u1, v1) => `M${P2(qp(q, u0, v0))} L${P2(qp(q, u1, v1))}`;
  const motes = (x0, y0, x1, y1, n, seed, t, col = '#fff2d8', op = 0.5) => { const r = rng(seed); let g = ''; for (let i = 0; i < n; i++) { const x = x0 + r() * (x1 - x0) + Math.sin(t * 0.6 + i) * 18, y = y0 + ((r() * (y1 - y0) - t * 12 * (0.4 + r())) % (y1 - y0) + (y1 - y0)) % (y1 - y0); g += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(1.5 + r() * 2.5)}" fill="${col}" opacity="${f(op * (0.4 + 0.6 * r()))}"/>`; } return g; };
  const PLASTER = ['#e2d4b4', '#d8c8a6', '#e8dcc0', '#cdbd9c', '#e0cfae'], TIMBER = '#3a2618';
  // soft blades of grass close to the lens (filled, tapered; sw = the wind's bend)
  const blades = (seed, n, x0, x1, y0, y1, hMin, hMax, t, cols, wind = 1) => { const r = rng(seed); let g = ''; for (let i = 0; i < n; i++) { const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), h = hMin + r() * (hMax - hMin), w = 8 + r() * 10, sw = (Math.sin(t * 2.1 + i * 0.7) * 22 + 16) * wind; g += `<path d="M${f(x - w)},${f(y)} Q${f(x + sw * 0.4 - w * 0.3)},${f(y - h * 0.5)} ${f(x + sw * 1.4)},${f(y - h)} Q${f(x + sw * 0.4 + w * 0.3)},${f(y - h * 0.5)} ${f(x + w)},${f(y)}Z" fill="${cols[i % cols.length]}"/>`; } return g; };

  // ======================================================= a half-timbered house front (side-on street): x0..x0+w, ground at
  // base, eaves at top; floors, a jettied upper storey, braces, shuttered windows, a door, a steep gable roof, a chimney
  const house = (x0, w, top, base, seed, o = {}) => {
    const r = rng(seed), pl = o.plaster || PLASTER[seed % PLASTER.length], h = base - top, floors = o.floors || 2, fh = h / floors;
    let g = `<rect x="${x0}" y="${top}" width="${w}" height="${h}" fill="${pl}" filter="url(#plaster)"/><rect x="${x0}" y="${top}" width="${w}" height="${h}" fill="none" ${olr(2)}/>`;
    // the gable: a steep roof triangle with tiles, and its own timbering
    const gh = w * 0.7, gx = x0 + w / 2;
    g += `<path d="M${x0 - 24},${top} L${gx},${top - gh} L${x0 + w + 24},${top}Z" fill="${o.roof || '#7a3a2a'}" ${olr(2)}/>`;
    for (let i = 1; i < 8; i++) { const y = top - gh + gh * i / 8, half = (w / 2 + 24) * i / 8; g += `<path d="M${f(gx - half)},${f(y)} L${f(gx + half)},${f(y)}" stroke="${shade(o.roof || '#7a3a2a', -0.3)}" stroke-width="3" opacity="0.6"/>`; }
    g += `<path d="M${x0 + 20},${top} L${gx},${f(top - gh + 40)} L${x0 + w - 20},${top}Z" fill="${shade(pl, -0.05)}" ${olr(1.6)}/><path d="M${gx},${f(top - gh + 40)} L${gx},${top} M${x0 + w * 0.3},${f(top - gh * 0.3)} L${gx},${f(top - gh * 0.62)} L${x0 + w * 0.7},${f(top - gh * 0.3)}" stroke="${TIMBER}" stroke-width="8" fill="none"/>`;
    if (o.chimney !== false) g += `<rect x="${f(x0 + w * 0.7)}" y="${f(top - gh * 0.8)}" width="34" height="${f(gh * 0.5)}" fill="#8a5a42" ${olr(1.4)}/>`;
    // timbers: posts, floor beams, braces
    for (let k = 0; k < floors; k++) {
      const y0 = top + k * fh, y1 = y0 + fh;
      g += `<rect x="${x0 - 6}" y="${f(y1 - 14)}" width="${w + 12}" height="16" fill="${TIMBER}"/>`;
      const posts = Math.max(2, Math.round(w / 110));
      for (let i = 0; i <= posts; i++) g += `<rect x="${f(x0 + i * w / posts - 7)}" y="${f(y0)}" width="14" height="${f(fh)}" fill="${TIMBER}"/>`;
      if (k > 0 || o.brace) for (let i = 0; i < posts; i++) if ((i + k + seed) % 2) g += `<path d="M${f(x0 + i * w / posts)},${f(y1 - 14)} L${f(x0 + (i + 1) * w / posts)},${f(y0 + 10)}" stroke="${TIMBER}" stroke-width="10"/>`;
    }
    g += `<rect x="${x0 - 14}" y="${f(top + fh - 22)}" width="${w + 28}" height="14" fill="#000" opacity="0.18"/>`;
    // windows with open shutters (upper floors), a door with an arched head (ground floor)
    for (let k = 0; k < floors; k++) {
      const y0 = top + k * fh, n = Math.max(1, Math.round(w / 160));
      for (let i = 0; i < n; i++) {
        if (k === floors - 1 && i === 0 && o.door !== false) continue;
        const cx = x0 + (i + 0.5) * w / n, ww = 60, wh = 76, wy = y0 + fh * 0.32;
        if (o.skipWin && o.skipWin(k, i)) continue;
        g += `<rect x="${f(cx - ww / 2)}" y="${f(wy)}" width="${ww}" height="${wh}" fill="#2a2018" ${olr(1.6)}/><path d="M${f(cx)},${f(wy)} L${f(cx)},${f(wy + wh)} M${f(cx - ww / 2)},${f(wy + wh / 2)} L${f(cx + ww / 2)},${f(wy + wh / 2)}" stroke="#7a6040" stroke-width="3"/>` +
          `<rect x="${f(cx - ww / 2 - 34)}" y="${f(wy)}" width="30" height="${wh}" fill="${o.shutter || '#3a5a4a'}" ${olr(1.4)}/><rect x="${f(cx + ww / 2 + 4)}" y="${f(wy)}" width="30" height="${wh}" fill="${o.shutter || '#3a5a4a'}" ${olr(1.4)}/>` +
          `<rect x="${f(cx - ww / 2 - 6)}" y="${f(wy + wh)}" width="${ww + 12}" height="10" fill="#6a4a2a"/>` + (r() < 0.5 ? `<rect x="${f(cx - ww / 2 - 4)}" y="${f(wy + wh + 10)}" width="${ww + 8}" height="20" fill="#5a3a20"/>` + [0, 1, 2, 3].map(j => `<circle cx="${f(cx - ww / 2 + 6 + j * 16)}" cy="${f(wy + wh + 8)}" r="9" fill="${['#c83a3a', '#e8c040', '#d86a8a', '#f2ece0'][(j + seed) % 4]}"/>`).join('') : '');
      }
    }
    if (o.door !== false) { const dx = x0 + w / Math.max(1, Math.round(w / 160)) / 2, dy = base; g += `<path d="M${f(dx - 38)},${dy} L${f(dx - 38)},${dy - 120} C${f(dx - 38)},${dy - 156} ${f(dx + 38)},${dy - 156} ${f(dx + 38)},${dy - 120} L${f(dx + 38)},${dy}Z" fill="#4a2e1a" ${olr(1.6)}/><path d="M${f(dx - 20)},${dy - 10} L${f(dx - 20)},${dy - 120} M${f(dx)},${dy - 10} L${f(dx)},${dy - 130} M${f(dx + 20)},${dy - 10} L${f(dx + 20)},${dy - 120}" stroke="#2e1a0e" stroke-width="3"/><circle cx="${f(dx + 24)}" cy="${dy - 60}" r="5" fill="#a88a4a"/>`; }
    return g;
  };
  // cobbles on a flat strip (side view, rows shrinking toward the back)
  const cobbles = (x0, x1, y0, y1, seed, col = '#8a8276') => {
    const r = rng(seed); let g = `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="${shade(col, -0.25)}"/>`;
    for (let y = y0 + 10, row = 0; y < y1; row++) { const k = 0.5 + 0.5 * (y - y0) / (y1 - y0), sw = 34 * k + 10, sh = 16 * k + 6; for (let x = x0 + (row % 2) * sw * 0.5; x < x1; x += sw * (0.9 + r() * 0.3)) g += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(sw * 0.46)}" ry="${f(sh * 0.5)}" fill="${shade(col, (r() - 0.5) * 0.25)}"/><path d="M${f(x - sw * 0.3)},${f(y - sh * 0.2)} q${f(sw * 0.3)},${f(-sh * 0.25)} ${f(sw * 0.6)},0" stroke="#fff" stroke-width="1.5" fill="none" opacity="0.18"/>`; y += sh * 1.05; }
    return g;
  };

  // ======================================================= THE GATE AT DAWN (perspective, everything on one painted layer at
  // p 0.8 so the Piper can walk on it; the land through the arch at p 0.4; mist over the cobbles after him)
  // the street's vanishing line is at y 1216; the arch's foot at (540, 1330); a man of scale s stands at y = 1216 + s*2594
  const HG = S.HG = { P: 0.8, VPY: 1216, ARCH: [440, 900, 200, 430], TOWER: [300, 260, 480, 1070], WIN: [880, 860] };
  S.hgate = (t, o = {}) => {
    const L = [], [ax, ay, aw, ah] = HG.ARCH;
    // through the arch: the dawn sky (sun low at the right edge), fields and the road out to the hills
    L.push({ p: 0.4, svg: once('hgout', () => `<defs>${LG('hgsky', [[0, '#5a6a9a'], [0.45, '#e8a48a'], [0.75, '#f8d6a0'], [1, '#fff0d0']])}</defs><rect x="-400" y="-200" width="1900" height="1700" fill="url(#hgsky)"/>` +
      E.ridge(1500, 1060, 60, 31, '#7a8a9a', 160) + E.ridge(1500, 1120, 40, 37, '#6a8a5a', 120) + `<path d="M500,1500 L560,1500 L548,1130 L538,1130Z" fill="#c8b088"/>` + E.patchwork(-200, 1300, 1140, 1300, 41, ['#7a9a4a', '#8aa856', '#a8a050', '#6a8a42'])) +
      C.radial(760, 1060, 260, '#fff6dc', 0.85, 'screen') + C.radial(760, 1060, 700, '#ffcf90', 0.4, 'screen') + E.birds(520, 980, 5, 9 + Math.floor(t * 0), 0.8, '#3a3040') });
    // the street, the houses, the gate tower with its arch cut through
    L.push({ p: HG.P, svg: once('hgstreet', () => {
      let g = `<defs><clipPath id="hgarch"><path d="M-2000,-2000 L3000,-2000 L3000,4000 L-2000,4000Z M${ax},${ay + ah} L${ax},${ay + 100} A${aw / 2},${aw / 2 * 1.1} 0 0 1 ${ax + aw},${ay + 100} L${ax + aw},${ay + ah}Z" clip-rule="evenodd"/></clipPath>${LG('hgst', [[0, '#a89c8a'], [1, '#6a6052']])}</defs>`;
      // sky over the roofs
      g += `<defs>${LG('hgsk2', [[0, '#7a8ab8'], [1, '#f0c8a8']])}</defs><g clip-path="url(#hgarch)"><rect x="-1500" y="-1200" width="3600" height="2530" fill="url(#hgsk2)"/></g>`;
      // the pavement, wedge-shaped to the arch, cobbles in rows that shrink toward it
      g += `<path d="M430,1330 L650,1330 L1900,2600 L-820,2600Z" fill="#5e564a"/>`;
      const r = rng(5);
      // setts packed tight in staggered courses (each course as deep as its spacing, so only thin dark joints show),
      // a little irregular, their far edges just catching the low sun from the arch
      for (let k = 0; k < 60; k++) {
        const v = Math.pow(k / 60, 1.6), vn = Math.pow((k + 1) / 60, 1.6), y = 1334 + v * 1266, dy = (vn - v) * 1266, half = 110 + 0.984 * (y - 1330), sw = dy * 1.75 + 4;
        for (let x = 540 - half - sw + (k % 2) * sw * 0.5; x < 540 + half + sw; x += sw * (0.94 + r() * 0.12)) {
          const ox = x + (r() - 0.5) * sw * 0.08, oy = y + dy * 0.5 + (r() - 0.5) * dy * 0.08, ex = sw * (0.45 + r() * 0.04), ey = dy * (0.47 + r() * 0.05), c = shade('#857b6c', (r() - 0.5) * 0.22);
          g += `<ellipse cx="${f(ox)}" cy="${f(oy)}" rx="${f(ex)}" ry="${f(ey)}" fill="${c}"/>`;
          if (dy > 9) g += `<path d="M${f(ox - ex * 0.7)},${f(oy - ey * 0.35)} Q${f(ox)},${f(oy - ey * 1.05)} ${f(ox + ex * 0.7)},${f(oy - ey * 0.35)}" stroke="#ffeacc" stroke-width="${f(Math.max(1, dy * 0.07))}" fill="none" opacity="0.18"/>`;
        }
      }
      g += `<path d="M540,1330 L540,2600" stroke="#5a5246" stroke-width="18" opacity="0.4"/>`;
      // the two rows of house fronts receding to the gate (left: u 0 near .. 1 far)
      const sides = [[[-820, -560], [430, 700], [430, 1330], [-820, 2600]], [[650, 700], [1900, -560], [1900, 2600], [650, 1330]]];
      sides.forEach((q, si) => {
        const cuts = [0, 0.3, 0.52, 0.68, 0.8, 0.9, 1], cols = si ? ['#e2d4b4', '#cdbd9c', '#e8dcc0', '#d8c8a6', '#e0cfae', '#d4c4a2'] : ['#d8c8a6', '#e8dcc0', '#cdbd9c', '#e2d4b4', '#d4c4a2', '#e0cfae'];
        for (let i = 0; i < 6; i++) {
          let u0 = cuts[i], u1 = cuts[i + 1]; if (si) { const a = 1 - u1, b = 1 - u0; u0 = a; u1 = b; }
          const ua = si ? u1 : u0, ub = si ? u0 : u1;
          g += `<path d="${qpath(q, u0, 0.06 * i, u1, 1)}" fill="${cols[i]}" filter="url(#plaster)"/>`;
          // eave and roof edge, the jetty beam, posts, braces, windows, a door
          g += `<path d="${qline(q, u0, 0.06 * i, u1, 0.06 * i)}" stroke="#4a2a1e" stroke-width="${f(26 * (1 - (si ? 1 - ua : ua) * 0.8))}"/>`;
          for (const v of [0.42, 0.46]) g += `<path d="${qline(q, u0, v, u1, v)}" stroke="${TIMBER}" stroke-width="${f(14 * (1 - (si ? 1 - ua : ua) * 0.85))}"/>`;
          for (const u of [u0, (u0 + u1) / 2, u1]) g += `<path d="${qline(q, u, 0.06 * i, u, 1)}" stroke="${TIMBER}" stroke-width="${f(12 * (1 - (si ? 1 - u : u) * 0.85))}"/>`;
          g += `<path d="${qline(q, u0, 0.1 + 0.06 * i, (u0 + u1) / 2, 0.42)}" stroke="${TIMBER}" stroke-width="${f(9 * (1 - (si ? 1 - ua : ua) * 0.85))}"/><path d="${qline(q, u1, 0.1 + 0.06 * i, (u0 + u1) / 2, 0.42)}" stroke="${TIMBER}" stroke-width="${f(9 * (1 - (si ? 1 - ua : ua) * 0.85))}"/>`;
          for (const [wu, wv] of [[0.25, 0.2], [0.75, 0.2], [0.3, 0.58]]) { const uu0 = lerp(u0, u1, wu - 0.1), uu1 = lerp(u0, u1, wu + 0.1); g += `<path d="${qpath(q, uu0, wv + 0.03 * i, uu1, wv + 0.1 + 0.03 * i)}" fill="#2a2018" ${olr(1.2)}/>`; }
          const du0 = lerp(u0, u1, 0.62), du1 = lerp(u0, u1, 0.82); g += `<path d="${qpath(q, du0, 0.74, du1, 1)}" fill="#4a2e1a" ${olr(1.2)}/>`;
        }
      });
      // the gate tower: big ashlar blocks, battlements, a slit window, the arch with its voussoirs
      const [tx, ty, tw, th] = HG.TOWER;
      let tower = `<rect x="${tx}" y="${ty}" width="${tw}" height="${th}" fill="#a8a090"/>`;
      for (let y = ty, row = 0; y < ty + th; y += 44, row++) for (let x = tx + (row % 2) * 40; x < tx + tw; x += 80) tower += `<rect x="${x + 2}" y="${y + 2}" width="76" height="40" fill="${shade('#a8a090', (rng(x * 7 + y)() - 0.5) * 0.18)}" stroke="#6a6252" stroke-width="2"/>`;
      for (let i = 0; i < 6; i++) tower += `<rect x="${tx + i * 84}" y="${ty - 60}" width="54" height="64" fill="#9a9282" ${olr(1.4)}/>`;
      tower += `<rect x="${tx + tw / 2 - 14}" y="${ty + 180}" width="28" height="90" fill="#1a1612"/>`;
      for (let i = 0; i <= 10; i++) { const a = Math.PI + i / 10 * Math.PI, cx = ax + aw / 2, cy = ay + 100, R1 = aw / 2, R2 = aw / 2 + 40; tower += `<path d="M${f(cx + Math.cos(a) * R1)},${f(cy + Math.sin(a) * R1 * 1.1)} L${f(cx + Math.cos(a) * R2)},${f(cy + Math.sin(a) * R2 * 1.1)}" stroke="#6a6252" stroke-width="3"/>`; }
      g += `<g clip-path="url(#hgarch)">${tower}</g><path d="M${ax},${ay + ah} L${ax},${ay + 100} A${aw / 2},${aw / 2 * 1.1} 0 0 1 ${ax + aw},${ay + 100} L${ax + aw},${ay + ah}" fill="none" stroke="#4a4236" stroke-width="10"/><rect x="${tx}" y="${ty}" width="${tw}" height="${th}" fill="none" ${olr(2)}/>`;
      // hanging signs, a flower box, a water butt, a cart by a wall
      g += `<path d="M-150,600 L60,600" stroke="#2a1a10" stroke-width="10"/><path d="M0,600 L0,640 M-120,600 L-120,640" stroke="#2a1a10" stroke-width="4"/><rect x="-140" y="640" width="160" height="110" rx="8" fill="#7a5a34" ${olr(1.6)}/><circle cx="-60" cy="695" r="30" fill="#e8c88a" ${olr(1.2)}/><path d="M-84,695 C-70,670 -50,670 -36,695" stroke="#8a5a2a" stroke-width="5" fill="none"/>`;
      g += `<path d="M1180,560 L1000,560" stroke="#2a1a10" stroke-width="9"/><path d="M1030,560 L1030,600 M1150,560 L1150,600" stroke="#2a1a10" stroke-width="4"/><path d="M1020,600 L1160,600 L1150,700 L1030,700Z" fill="#6a4a2a" ${olr(1.6)}/><circle cx="1090" cy="650" r="26" fill="#c8a040" ${olr(1.2)}/>`;
      g += `<ellipse cx="-260" cy="2200" rx="110" ry="40" fill="#5a4030" ${olr(1.6)}/><rect x="-370" y="1960" width="220" height="240" rx="20" fill="#6a4a30" ${olr(1.6)}/>` + [2010, 2090, 2170].map(y => `<rect x="-374" y="${y}" width="228" height="14" fill="#3a2a1e"/>`).join('');
      return g;
    }) + (() => {
      // townsfolk at windows (heads and shoulders), chimney smoke drifting, swifts over the roofs
      let g = '';
      for (const [x, y, s, sd] of [[-120, 360, 1, 3], [1300, 300, 0.9, 5], [180, 900, 0.6, 7]]) g += E.smoke(x, y, 260 * s, sd + Math.floor(t * 0), '#d8d0c8', 0.28);
      for (let i = 0; i < 4; i++) { const k = (t * 0.12 + i * 0.27) % 1, x = -300 + k * 1700, y = 100 + 120 * Math.sin(k * 6 + i); g += `<path d="M${f(x - 14)},${f(y)} q7,-8 14,0 q7,-8 14,0" stroke="#2a2030" stroke-width="3" fill="none"/>`; }
      return g;
    })() });
    // the low dawn light pouring through the arch along the street
    // (o.lightK eases it off in the close-ups, where it would only wash out his face)
    const lk = o.lightK ?? 1;
    L.push({ p: HG.P, light: true, svg: `<defs>${LG('hgray', [[0, '#fff2d0', 0.55], [1, '#fff2d0', 0]])}</defs><path d="M${ax + 30},${ay + 120} L${ax + aw - 30},${ay + 120} L1500,2600 L-420,2600Z" fill="url(#hgray)" style="mix-blend-mode:screen" opacity="${f(0.55 * lk)}"/>` +
      C.radial(540, 1180, 520, '#ffe8c0', 0.5 * lk, 'screen') + motes(200, 900, 900, 2000, 40, 77, t, '#fff4d8', 0.5 * lk) });
    // mist low over the cobbles (drawn after the Piper, so his feet walk in it)
    L.push({ p: HG.P, tag: 'mist', svg: (() => { let g = ''; for (let i = 0; i < 9; i++) { const y = 1320 + i * 150 + i * i * 9, w = 300 + i * 260, x = 540 + Math.sin(t * 0.3 + i * 1.7) * (40 + i * 20); g += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(w)}" ry="${f(26 + i * 12)}" fill="#f4ece0" opacity="${f(0.22 + 0.04 * (i % 3))}" filter="url(#b8)"/>`; } return g; })() });
    return L;
  };

  // ======================================================= THE MARKET STREET (side-on): a row of house fronts (p 0.86), the well
  // and a laundry line (p 0.93), cobbles (p 1); your house is the tall blue-shuttered one at MH, its upstairs window at MW.
  // The mother is drawn by the shot between 'front' and 'sill' (both p 0.86).
  const HS = S.HS = { FY: 1650, MH: [2200, 520, 1650], MW: [2380, 620, 250, 270], WELL: [700, 1660] };
  S.hstreet = (t, o = {}) => {
    const L = [], [mx, mw] = [HS.MH[0], 520], [wx, wy, ww, wh] = HS.MW;
    L.push({ p: 0.5, svg: once('hssky', () => `<defs>${LG('hssk', [[0, '#8ab4dc'], [1, '#f0e6d0']])}</defs><rect x="-2400" y="-1600" width="7200" height="3000" fill="url(#hssk)"/>` + E.cloud(400, 120, 600, 160, 3) + E.cloud(1800, 40, 700, 180, 5) + E.cloud(3100, 160, 520, 140, 7) +
      `<path d="M-2400,700 L4800,700 L4800,1400 L-2400,1400Z" fill="#9a8a7a"/>` + E.church(1500, 640, 2.6, { stone: '#b8b0a2', roof: '#5a5a62' })) });
    L.push({ p: 0.86, tag: 'front', svg: once('hsfront', () => {
      let g = '';
      const row = [[-1500, 380, 360, 2], [-1110, 300, 480, 3], [-800, 420, 340, 2], [-370, 360, 300, 2], [0, 440, 400, 3], [460, 340, 330, 2], [820, 420, 260, 2], [1260, 380, 360, 2], [1660, 500, 300, 3], [3000, 380, 340, 2], [3400, 460, 290, 2], [3880, 400, 380, 3]];
      row.forEach(([x, w, top, fl], i) => { g += house(x, w, top, HS.FY, i + 3, { floors: fl, roof: ['#7a3a2a', '#6a4a3a', '#8a4430', '#5a3a2e'][i % 4], shutter: ['#3a5a4a', '#7a3a2a', '#3a4a6a', '#5a4a2a'][i % 4] }); });
      // your house: tall, blue shutters, the upstairs window opening is a hole (you appear in it)
      g += `<defs><clipPath id="hsmw"><path d="M-3000,-3000 L6000,-3000 L6000,4000 L-3000,4000Z M${wx},${wy} L${wx + ww},${wy} L${wx + ww},${wy + wh} L${wx},${wy + wh}Z" clip-rule="evenodd"/></clipPath></defs>`;
      g += `<g clip-path="url(#hsmw)">${house(mx, mw, 300, HS.FY, 11, { floors: 3, roof: '#6a3a2e', shutter: '#2e4a7a', skipWin: (k, i) => k === 0 && i === 1 })}</g>`;
      g += `<rect x="${wx - 6}" y="${wy - 6}" width="${ww + 12}" height="${wh + 6}" fill="none" stroke="${TIMBER}" stroke-width="14"/>`;
      return g;
    }) + C.radial(wx + ww / 2, wy + wh / 2, 160, '#000', 0.0, 'multiply') });
    // inside your window: the dark room behind you (drawn before you)
    L.push({ p: 0.86, tag: 'room', svg: once('hsroom', () => `<rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" fill="#2a1e16"/><rect x="${wx + 20}" y="${wy + 30}" width="80" height="120" fill="#3a2a1e"/><circle cx="${wx + ww - 50}" cy="${wy + 60}" r="20" fill="#6a4a2a"/>`) });
    // the sill and the open blue shutters (drawn after you)
    L.push({ p: 0.86, tag: 'sill', svg: once('hssill', () => `<rect x="${wx - 22}" y="${wy + wh - 4}" width="${ww + 44}" height="26" fill="#6a4a2a" ${olr(1.6)}/><rect x="${wx - 70}" y="${wy}" width="60" height="${wh}" fill="#2e4a7a" ${olr(1.6)}/><rect x="${wx + ww + 10}" y="${wy}" width="60" height="${wh}" fill="#2e4a7a" ${olr(1.6)}/>` +
      [0, 1, 2].map(i => `<path d="M${wx - 64},${wy + 30 + i * 80} l48,0 M${wx + ww + 16},${wy + 30 + i * 80} l48,0" stroke="#1e3458" stroke-width="5"/>`).join('') + `<rect x="${wx - 10}" y="${wy + wh + 22}" width="${ww + 20}" height="34" fill="#5a3a20" ${olr(1.4)}/><rect x="${wx - 10}" y="${wy + wh + 22}" width="${ww + 20}" height="6" fill="#3a2414"/>` +
      // geraniums: a mass of round leaves along the box, clusters of red and pink flowers on short stems above them
      (() => { const r = rng(161); let g = ''; for (let j = 0; j < 11; j++) { const x = wx - 6 + j * 26 + r() * 6, y = wy + wh + 20 + r() * 4, rr = 13 + r() * 6; g += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(rr)}" fill="${j % 2 ? '#3a5a2a' : '#46683a'}"/><circle cx="${f(x - rr * 0.25)}" cy="${f(y - rr * 0.3)}" r="${f(rr * 0.5)}" fill="#6a8c48" opacity="0.8"/><path d="M${f(x - rr * 0.5)},${f(y)} q${f(rr * 0.5)},${f(-rr * 0.3)} ${f(rr)},0" stroke="#2a4020" stroke-width="1.4" fill="none"/>`; }
        for (let j = 0; j < 6; j++) { const x = wx + 12 + j * 45 + r() * 8, y = wy + wh + 2 + r() * 6, c = ['#c8322e', '#e04a5a', '#c8322e', '#f06a7a'][j % 4]; g += `<path d="M${f(x)},${f(y + 6)} L${f(x - 2)},${f(y + 18)}" stroke="#3a5a2a" stroke-width="2.5"/>`; for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2 + r(); g += `<circle cx="${f(x + Math.cos(a) * 7)}" cy="${f(y + Math.sin(a) * 6)}" r="${f(4.5 + r() * 1.5)}" fill="${shade(c, (r() - 0.5) * 0.2)}"/>`; } g += `<circle cx="${f(x - 1)}" cy="${f(y - 2)}" r="3" fill="${shade(c, 0.3)}"/>`; }
        return g; })()) });
    L.push({ p: 1, svg: once('hscobble', () => cobbles(-2400, 4800, HS.FY, 2700, 13) + `<rect x="-2400" y="${HS.FY}" width="7200" height="40" fill="#000" opacity="0.2"/>`) });
    // the well, a laundry line with sheets moving in the breeze, barrels (on the ground plane, after it)
    L.push({ p: 1, tag: 'props', svg: (() => {
      const [qx, qy] = HS.WELL;
      let g = once('hswell', () => `<ellipse cx="${qx}" cy="${qy}" rx="150" ry="36" fill="#5a5248"/><path d="M${qx - 150},${qy} L${qx - 150},${qy - 120} C${qx - 150},${qy - 150} ${qx + 150},${qy - 150} ${qx + 150},${qy - 120} L${qx + 150},${qy}Z" fill="#9a9282" ${olr(1.6)}/>` + [0, 1, 2].map(k => `<path d="M${qx - 150},${qy - 40 - k * 36} C${qx - 50},${qy - 26 - k * 36} ${qx + 50},${qy - 26 - k * 36} ${qx + 150},${qy - 40 - k * 36}" stroke="#6a6252" stroke-width="3" fill="none"/>`).join('') +
        `<path d="M${qx - 130},${qy - 130} L${qx - 130},${qy - 340} M${qx + 130},${qy - 130} L${qx + 130},${qy - 340}" stroke="#5a3a20" stroke-width="18"/><path d="M${qx - 170},${qy - 330} L${qx},${qy - 420} L${qx + 170},${qy - 330}Z" fill="#6a3a2a" ${olr(1.6)}/><path d="M${qx - 130},${qy - 260} L${qx + 130},${qy - 260}" stroke="#4a2e1a" stroke-width="10"/><path d="M${qx},${qy - 260} L${qx},${qy - 190}" stroke="#8a7a5a" stroke-width="3"/><path d="M${qx - 22},${qy - 190} L${qx + 22},${qy - 190} L${qx + 18},${qy - 150} L${qx - 18},${qy - 150}Z" fill="#6a4a2a" ${olr(1.2)}/>`);
      // laundry: sheets hanging from a line across the street, rippling
      g += `<path d="M1300,700 C1500,760 1700,760 1900,700" stroke="#3a2a1a" stroke-width="4" fill="none"/>`;
      for (let i = 0; i < 4; i++) { const x = 1340 + i * 140, sw = 110, ph = t * 2 + i, d = `M${x},${f(744 + Math.sin(i * 0.8) * 6)} L${x + sw},${f(744 + Math.sin(i * 0.8 + 0.6) * 6)} C${f(x + sw + 6 * Math.sin(ph))},860 ${f(x + sw - 6 * Math.sin(ph + 1))},940 ${f(x + sw + 8 * Math.sin(ph + 2))},${f(1000 + 6 * Math.sin(ph))} L${f(x + 8 * Math.sin(ph + 2))},${f(1000 + 6 * Math.sin(ph + 1))} C${f(x - 6 * Math.sin(ph))},940 ${f(x + 6 * Math.sin(ph + 1))},860 ${x},${f(744 + Math.sin(i * 0.8) * 6)}Z`; g += `<path d="${d}" fill="${['#f4f0e6', '#e8dcc8', '#f0ece4', '#dfe4e8'][i]}" ${olr(1.4)}/>`; }
      g += once('hsbarrels', () => `<rect x="2900" y="1500" width="110" height="150" rx="20" fill="#6a4a30" ${olr(1.6)}/><rect x="3020" y="1520" width="100" height="130" rx="18" fill="#5a3e28" ${olr(1.6)}/>` + [1530, 1600].map(y => `<rect x="2896" y="${y}" width="230" height="10" fill="#3a2a1e"/>`).join(''));
      return g;
    })() });
    L.push({ p: 0.86, light: true, svg: `<g opacity="0.85">${C.radial(-200, -200, 2600, '#fff4dc', 0.25, 'screen')}</g>` + motes(-1000, 400, 3800, 1800, 50, 19, t, '#fff6e0', 0.35) });
    return L;
  };

  // ======================================================= YOUR KITCHEN: the hearth at the right (fire, pot), a small window at
  // the left, herbs drying from the beam, a shelf of bowls; the kneading table (p 0.97) at TABLE
  // (the hearth, the window and the herb beam sit close enough to her that the shot sees all three)
  const HK2 = S.HK2 = { FY: 1700, TABLE: [180, 900, 1360], FIRE: [1090, 1480], WIN: [-70, 500, 250, 320], BEAM: 330 };
  S.hkitchen = (t, o = {}) => {
    const L = [], [wx, wy, ww, wh] = HK2.WIN, [fx, fy] = HK2.FIRE;
    L.push({ p: 0.5, svg: once('hkout', () => `<defs>${LG('hkos', [[0, '#9ac0e0'], [1, '#f0e8d4']])}</defs><rect x="-700" y="200" width="900" height="900" fill="url(#hkos)"/>` + house(-560, 300, 640, 1100, 21, { floors: 1, door: false, chimney: false }) + house(-240, 260, 700, 1100, 22, { floors: 1, door: false })) });
    L.push({ p: 0.9, svg: once('hkwall', () => {
      let g = `<defs><clipPath id="hkwc"><path d="M-2000,-1000 L3000,-1000 L3000,3000 L-2000,3000Z M${wx},${wy} L${wx + ww},${wy} L${wx + ww},${wy + wh} L${wx},${wy + wh}Z" clip-rule="evenodd"/></clipPath></defs><g clip-path="url(#hkwc)"><rect x="-2000" y="-1000" width="5000" height="${HK2.FY + 1000}" fill="#c8b490" filter="url(#plaster)"/>`;
      for (let i = 0; i < 40; i++) { const r = rng(i + 200); g += `<ellipse cx="${f(-1600 + r() * 4200)}" cy="${f(-600 + r() * 2200)}" rx="${f(40 + r() * 120)}" ry="${f(20 + r() * 60)}" fill="#8a7458" opacity="0.12"/>`; }
      g += `</g><rect x="${wx - 16}" y="${wy - 16}" width="${ww + 32}" height="${wh + 32}" fill="none" stroke="#4a2e1a" stroke-width="18"/><path d="M${wx + ww / 2},${wy} L${wx + ww / 2},${wy + wh}" stroke="#4a2e1a" stroke-width="8"/>`;
      // the beam with drying herbs and garlic
      const by = HK2.BEAM;
      g += `<rect x="-2000" y="${by}" width="5000" height="60" fill="#4a2e1a" ${olr(1.6)}/><rect x="-2000" y="${by + 6}" width="5000" height="8" fill="#6a4a2e" opacity="0.6"/>`;
      for (let i = 0; i < 9; i++) { const x = -420 + i * 170; g += `<path d="M${x},${by + 60} L${x},${by + 110}" stroke="#3a2a1a" stroke-width="3"/>` + (i % 3 === 1 ? [0, 1, 2].map(k => `<circle cx="${x - 14 + k * 14}" cy="${by + 130 + (k % 2) * 16}" r="16" fill="#f0e8d8" ${olr(1)}/>`).join('') : E.herbs(x, by + 110, 90, ['#5e6a3c', '#6a7a40', '#7a6a3a'][i % 3], i + 3)); }
      // copper pans hanging on pegs between the shelf and the hearth, a ladle, a sieve
      g += [[300, 900, 54], [400, 930, 44], [500, 905, 50]].map(([x, y, rr]) => `<path d="M${x},${y - rr - 40} L${x},${y - rr}" stroke="#3a2a1a" stroke-width="3"/><path d="M${x - 6},${y - rr - 4} L${x + 6},${y - rr - 4} L${x + 5},${y - rr + 26} L${x - 5},${y - rr + 26}Z" fill="#7a4a2a"/><circle cx="${x}" cy="${y}" r="${rr}" fill="#b0643a" ${olr(1.6)}/><circle cx="${x - rr * 0.2}" cy="${y - rr * 0.2}" r="${rr * 0.62}" fill="#c8804a" opacity="0.7"/><path d="M${x - rr * 0.55},${y - rr * 0.35} q${rr * 0.3},${-rr * 0.3} ${rr * 0.7},${-rr * 0.2}" stroke="#f0c090" stroke-width="4" fill="none" opacity="0.6"/>`).join('');
      // the shelf of bowls and jugs, a broom against the wall
      g += `<rect x="300" y="700" width="560" height="18" fill="#5a3a20" ${olr(1.4)}/>` + [0, 1, 2, 3, 4].map(i => i % 2 ? `<path d="M${330 + i * 104},700 L${334 + i * 104},640 C${340 + i * 104},610 ${396 + i * 104},610 ${402 + i * 104},640 L${406 + i * 104},700Z" fill="${['#a8642a', '#8a7a5a'][i % 2]}" ${olr(1.2)}/>` : `<path d="M${320 + i * 104},700 C${320 + i * 104},660 ${410 + i * 104},660 ${410 + i * 104},700Z" fill="#c8a878" ${olr(1.2)}/>`).join('');
      g += `<path d="M-520,${HK2.FY} L-430,1020" stroke="#7a5a34" stroke-width="12"/><path d="M-560,${HK2.FY} C-560,1560 -470,1520 -440,1500 L-400,1520 C-420,1560 -470,1640 -480,${HK2.FY}Z" fill="#b89a5a" ${olr(1.2)}/>`;
      // the hearth: a stone arch, the fire's back blackened, a pot on a chain
      g += `<path d="M${fx - 300},${HK2.FY} L${fx - 300},${fy - 360} C${fx - 300},${fy - 520} ${fx + 300},${fy - 520} ${fx + 300},${fy - 360} L${fx + 300},${HK2.FY}Z" fill="#8a8274" ${olr(2)}/><path d="M${fx - 230},${HK2.FY} L${fx - 230},${fy - 330} C${fx - 230},${fy - 440} ${fx + 230},${fy - 440} ${fx + 230},${fy - 330} L${fx + 230},${HK2.FY}Z" fill="#1a120c"/>`;
      g += `<path d="M${fx},${fy - 420} L${fx},${fy - 200}" stroke="#2a2a2a" stroke-width="6" stroke-dasharray="10 4"/><path d="M${fx - 80},${fy - 200} C${fx - 90},${fy - 80} ${fx + 90},${fy - 80} ${fx + 80},${fy - 200}Z" fill="#2a2a2e" ${olr(1.6)}/>`;
      return g;
    }) + E.fire(fx, fy, 1.4, 3 + Math.floor(t * 12) % 4) + C.radial(fx, fy - 60, 520, '#ff9a3a', 0.45 + 0.08 * Math.sin(t * 9), 'screen') });
    L.push({ p: 1, svg: once('hkfloor', () => `<rect x="-2000" y="${HK2.FY}" width="5000" height="1400" fill="#6a5440"/>` + Array.from({ length: 16 }, (_, i) => `<path d="M-2000,${HK2.FY + 30 + i * 70} L3000,${HK2.FY + 30 + i * 70}" stroke="#4a3a2a" stroke-width="3" opacity="0.5"/>`).join('') + E.straw(-1000, 2000, HK2.FY + 40, HK2.FY + 900, 160, 5)) });
    // the kneading table: a thick top, a lump of dough on flour, a bowl, a jug (you stand behind it: drawn after you)
    L.push({ p: 0.97, tag: 'table', svg: once('hktable', () => {
      const [x0, x1, y] = HK2.TABLE;
      return `<rect x="${x0}" y="${y}" width="${x1 - x0}" height="40" fill="#7a5230" ${olr(2)}/><rect x="${x0 + 30}" y="${y + 40}" width="40" height="${HK2.FY + 140 - y - 40}" fill="#5a3a20" ${olr(1.6)}/><rect x="${x1 - 70}" y="${y + 40}" width="40" height="${HK2.FY + 140 - y - 40}" fill="#5a3a20" ${olr(1.6)}/>` +
        `<ellipse cx="${(x0 + x1) / 2}" cy="${y - 4}" rx="220" ry="18" fill="#f6f0e2" opacity="0.8"/><path d="M${x1 - 160},${y} C${x1 - 160},${y - 90} ${x1 - 20},${y - 90} ${x1 - 20},${y}Z" fill="#a8642a" ${olr(1.4)}/><path d="M${x0 + 60},${y} L${x0 + 66},${y - 80} C${x0 + 70},${y - 104} ${x0 + 110},${y - 104} ${x0 + 114},${y - 80} L${x0 + 120},${y}Z" fill="#8a7a5a" ${olr(1.4)}/>`;
    }) });
    L.push({ p: 0.9, light: true, svg: `<defs>${LG('hkwl', [[0, '#fff4dc', 0.4], [1, '#fff4dc', 0]])}</defs><path d="M${wx},${wy + 40} L${wx + ww},${wy + 40} L${wx + ww + 700},2600 L${wx - 200},2600Z" fill="url(#hkwl)" style="mix-blend-mode:screen" opacity="0.6"/>` + C.radial(HK2.FIRE[0], HK2.FIRE[1], 1400, '#ff8a3a', 0.16, 'screen') + motes(wx - 100, wy, wx + 900, 1900, 30, 23, t, '#fff4dc', 0.45) });
    return L;
  };

  // ======================================================= OUTSIDE THE WALLS: the gate tower and the town wall at the right, the
  // road running left and up into green hills; a grassy bank in front hides the walkers' feet (p 0.9)
  const HO = S.HO2 = { GATE: [1500, 1500], ROADY: 1500 };
  S.houtside = (t, o = {}) => {
    const L = [];
    L.push({ p: 0.2, svg: once('hosky', () => `<defs>${LG('hosk2', [[0, '#7aa8d8'], [1, '#eef0e4']])}</defs><rect x="-3000" y="-2000" width="8000" height="4000" fill="url(#hosk2)"/>` + E.cloud(-400, -100, 800, 200, 11) + E.cloud(900, 40, 700, 170, 13) + E.cloud(2200, -60, 900, 220, 15)) });
    L.push({ p: 0.45, svg: once('hohills', () => E.ridge(4000, 1050, 160, 51, '#8aa070', 200).replace('M-50', 'M-2000') + E.patchwork(-2000, 3000, 1000, 1250, 53, ['#8aa856', '#a8b060', '#7a9a4a', '#c8b868']) + E.hedge(-2000, 3000, 1110, 40, 55)) });
    // the near hill the road climbs, the road, trees
    L.push({ p: 0.8, svg: once('horoad', () => {
      const HILL = 'M-3000,1600 C-2200,1100 -1400,800 -600,760 C200,740 1200,1300 3000,1400 L3000,3000 L-3000,3000Z', RD = 'M1500,1520 C900,1480 300,1300 -400,1000 C-900,800 -1500,760 -2200,700';
      const bez = (a, b, c, d, u) => [0, 1].map(i => (1 - u) ** 3 * a[i] + 3 * (1 - u) ** 2 * u * b[i] + 3 * (1 - u) * u * u * c[i] + u ** 3 * d[i]);
      const road = u => u < 0.5 ? bez([1500, 1520], [900, 1480], [300, 1300], [-400, 1000], u * 2) : bez([-400, 1000], [-900, 800], [-1500, 760], [-2200, 700], u * 2 - 1);
      let g = `<defs>${LG('hohg', [[0, '#7e9e4e'], [1, '#54743a']])}<clipPath id="hohc"><path d="${HILL}"/></clipPath></defs><path d="${HILL}" fill="url(#hohg)"/><g clip-path="url(#hohc)">`;
      { const r = rng(301); for (let i = 0; i < 90; i++) { const x = -2800 + r() * 5600, y = 760 + r() * 1300, w = 60 + r() * 220; g += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(w)}" ry="${f(w * 0.15)}" fill="${['#8aaa52', '#5e7e36', '#9aaa5a'][i % 3]}" opacity="${f(0.12 + r() * 0.12)}"/>`; } }
      // a hay meadow on the slope between the crest and the road: mown rows, haycocks standing in it
      g += `<path d="M60,890 C400,950 900,1080 1560,1240 L1560,1440 C1000,1380 500,1250 60,1120Z" fill="#b4ac5c" opacity="0.9"/>`;
      for (let i = 1; i < 9; i++) { const k = i / 9; g += `<path d="M60,${f(890 + 230 * k)} C400,${f(950 + 260 * k)} 900,${f(1080 + 250 * k)} 1560,${f(1240 + 200 * k)}" stroke="${i % 2 ? '#9a9448' : '#ccc472'}" stroke-width="${f(3 + 5 * k)}" fill="none" opacity="0.7"/>`; }
      for (const [x, y, s, sd] of [[420, 1030, 1.3, 1], [700, 1120, 1.45, 2], [1000, 1190, 1.6, 3], [1320, 1270, 1.75, 4], [560, 1240, 1.6, 5], [880, 1330, 1.8, 6]]) g += E.stook(x, y, s, sd);
      g += '</g>';
      g += `<path d="${RD}" stroke="#a8946c" stroke-width="122" fill="none" stroke-linecap="round" opacity="0.6"/><path d="${RD}" stroke="#c8b088" stroke-width="108" fill="none" stroke-linecap="round"/><path d="${RD}" stroke="#b09a72" stroke-width="40" fill="none" opacity="0.6"/>`;
      // wheel ruts and stones in the road
      { const r = rng(303); for (let i = 0; i < 70; i++) { const u = r(), p = road(u), sc = 1 - 0.55 * u, w = (3 + r() * 5) * sc; g += `<ellipse cx="${f(p[0] + (r() - 0.5) * 60 * sc)}" cy="${f(p[1] + (r() - 0.5) * 70 * sc)}" rx="${f(w)}" ry="${f(w * 0.6)}" fill="#8a8070"/>`; } }
      // a split-rail fence along the far side of the road
      { let posts = '', rails = ''; let prev = null; for (let u = 0.03; u <= 0.97; u += 0.018) { const p = road(u), sc = 1 - 0.55 * u, b = [p[0], p[1] - 66 * sc], h = 70 * sc; posts += `<rect x="${f(b[0] - 4 * sc)}" y="${f(b[1] - h)}" width="${f(8 * sc)}" height="${f(h + 4)}" fill="#6a4e30" ${olr(1)}/>`; if (prev) for (const k of [0.32, 0.7]) rails += `<path d="M${f(prev[0][0])},${f(prev[0][1] - prev[1] * k)} L${f(b[0])},${f(b[1] - h * k)}" stroke="#7a5a38" stroke-width="${f(5 * sc)}"/>`; prev = [b, h]; } g += rails + posts; }
      // a wayside cross under its little roof by the road
      g += `<g transform="translate(-60,935)"><rect x="-6" y="-170" width="12" height="170" fill="#5a3e24" ${olr(1.2)}/><rect x="-40" y="-130" width="80" height="11" fill="#5a3e24" ${olr(1.2)}/><path d="M-36,-176 L0,-204 L36,-176Z" fill="#6a3a24" ${olr(1.2)}/><circle cx="0" cy="-124" r="5" fill="#d8b860"/><path d="M-12,0 C-10,-14 10,-14 12,0Z" fill="#c8504a"/></g>`;
      for (const [x, y, s, sd] of [[-1200, 900, 1.6, 3], [160, 870, 1.7, 5], [-2400, 760, 1.4, 7], [2200, 1360, 2.2, 9], [1750, 1300, 1.5, 11]]) g += E.oak(x, y, s, sd);
      return g;
    }) });
    // the town wall and the gate tower (seen from outside)
    L.push({ p: 0.8, svg: once('howall', () => {
      const [gx, gy] = HO.GATE;
      let g = `<rect x="${gx + 200}" y="${gy - 520}" width="2000" height="560" fill="#a8a090" ${olr(2)}/>`;
      for (let y = gy - 520, row = 0; y < gy + 40; y += 44, row++) for (let x = gx + 200 + (row % 2) * 40; x < gx + 2200; x += 80) g += `<rect x="${x + 2}" y="${y + 2}" width="76" height="40" fill="${shade('#a8a090', (rng(x + y * 3)() - 0.5) * 0.16)}" stroke="#6a6252" stroke-width="2"/>`;
      for (let i = 0; i < 24; i++) g += `<rect x="${gx + 200 + i * 84}" y="${gy - 570}" width="54" height="54" fill="#9a9282" ${olr(1.4)}/>`;
      g += `<rect x="${gx - 220}" y="${gy - 860}" width="440" height="900" fill="#a29a8a" ${olr(2)}/>`;
      for (let y = gy - 860, row = 0; y < gy + 40; y += 44, row++) for (let x = gx - 220 + (row % 2) * 40; x < gx + 220; x += 80) g += `<rect x="${x + 2}" y="${y + 2}" width="76" height="40" fill="${shade('#a29a8a', (rng(x * 5 + y)() - 0.5) * 0.16)}" stroke="#6a6252" stroke-width="2"/>`;
      for (let i = 0; i < 5; i++) g += `<rect x="${gx - 220 + i * 90}" y="${gy - 920}" width="56" height="64" fill="#9a9282" ${olr(1.4)}/>`;
      g += `<path d="M${gx - 100},${gy + 40} L${gx - 100},${gy - 260} A100,110 0 0 1 ${gx + 100},${gy - 260} L${gx + 100},${gy + 40}Z" fill="#2a2420" ${olr(1.6)}/><path d="M${gx - 90},${gy + 40} L${gx - 90},${gy - 250} A90,100 0 0 1 ${gx + 90},${gy - 250} L${gx + 90},${gy + 40}" fill="none" stroke="#4a4236" stroke-width="8"/>`;
      g += `<path d="M${gx - 60},${gy - 300} L${gx - 60},${gy + 20} M${gx},${gy - 330} L${gx},${gy + 20} M${gx + 60},${gy - 300} L${gx + 60},${gy + 20}" stroke="#4a3a2a" stroke-width="10" opacity="0.5"/>`;
      return g;
    }) });
    // the grassy bank in front of the road (hides feet), flowers moving in the breeze
    // the bank follows just below the road (the road's line shifted down), so walkers' feet sink into the grass
    const BANK = [[-3000, 720], [-2200, 730], [-1500, 790], [-900, 860], [-400, 1030], [300, 1330], [900, 1490], [1500, 1550], [1800, 1590], [3000, 1610]];
    const bankY = x => { for (let i = 1; i < BANK.length; i++) if (x <= BANK[i][0]) { const k = (x - BANK[i - 1][0]) / (BANK[i][0] - BANK[i - 1][0]); return lerp(BANK[i - 1][1], BANK[i][1], k); } return BANK[BANK.length - 1][1]; };
    S.HO2.bankY = bankY;
    L.push({ p: 0.8, tag: 'bank', svg: (() => { let g = once('hobank', () => {
      let b = `<defs>${LG('hobk', [[0, '#628440'], [1, '#3e5a2c']])}</defs><path d="M${BANK.map(p => p.join(',')).join(' L')} L3000,3000 L-3000,3000Z" fill="url(#hobk)"/><path d="M${BANK.map(p => p.join(',')).join(' L')}" stroke="#7a9a4a" stroke-width="10" fill="none" opacity="0.7"/>`;
      // tufts, clumps of flowers and stones down the bank (bigger the nearer they are)
      const r = rng(63);
      for (let i = 0; i < 130; i++) { const x = -2800 + r() * 5600, y = bankY(x) + 30 + Math.pow(r(), 1.3) * 1300, k = 0.9 + (y - bankY(x)) / 450; for (let j = 0; j < 4; j++) { const h = (18 + r() * 26) * k, w = (4 + r() * 3) * k, lean = (r() - 0.4) * 20 * k, bx = x + (j - 2) * 6 * k; b += `<path d="M${f(bx - w)},${f(y)} Q${f(bx + lean * 0.3)},${f(y - h * 0.55)} ${f(bx + lean)},${f(y - h)} Q${f(bx + lean * 0.3 + w * 0.4)},${f(y - h * 0.5)} ${f(bx + w)},${f(y)}Z" fill="${['#3a5a28', '#5a7e36', '#76984a', '#46682e'][(i + j) % 4]}"/>`; } }
      for (let i = 0; i < 34; i++) { const x = -2700 + r() * 5400, y0 = bankY(x) + 40 + r() * 900, k = 0.9 + (y0 - bankY(x)) / 500, col = ['#f4f0e8', '#f0d050', '#b890d8', '#e8a0b8'][i % 4]; for (let j = 0; j < 4; j++) { const fx = x + (r() - 0.5) * 60 * k, fy = y0 + (r() - 0.5) * 16 * k, fr = (3.5 + r() * 2) * k; b += `<circle cx="${f(fx)}" cy="${f(fy)}" r="${f(fr)}" fill="${col}"/><circle cx="${f(fx)}" cy="${f(fy)}" r="${f(fr * 0.35)}" fill="#d8a830"/>`; } }
      for (let i = 0; i < 16; i++) { const x = -2600 + r() * 5200, y = bankY(x) + 60 + r() * 1000, k = 0.9 + (y - bankY(x)) / 450, w = (10 + r() * 14) * k; b += `<path d="M${f(x - w)},${f(y)} C${f(x - w)},${f(y - w * 0.9)} ${f(x + w)},${f(y - w * 0.9)} ${f(x + w)},${f(y)}Z" fill="#9a9488" ${olr(1.2, 0.5)}/><path d="M${f(x - w * 0.6)},${f(y - w * 0.45)} q${f(w * 0.5)},${f(-w * 0.3)} ${f(w)},0" stroke="#e8e2d2" stroke-width="${f(1.4 * k)}" fill="none" opacity="0.5"/>`; }
      return b;
    }); const r = rng(61); for (let i = 0; i < 160; i++) { const x = -2600 + r() * 5200, y = bankY(x) + 6 + r() * 26, h = 26 + r() * 30, sw = Math.sin(t * 2 + i) * 6; g += `<path d="M${f(x)},${f(y)} q${f(sw)},${f(-h * 0.5)} ${f(sw * 1.6)},${f(-h)}" stroke="${r() < 0.5 ? '#3a5a2a' : '#7a9a4a'}" stroke-width="4" fill="none"/>` + (r() < 0.3 ? `<circle cx="${f(x + sw * 1.6)}" cy="${f(y - h)}" r="6" fill="${['#f0e060', '#f4f0e8', '#d86a8a'][i % 3]}"/>` : ''); } return g; })() });
    L.push({ p: 0.8, light: true, svg: C.radial(-400, 0, 2600, '#fff4dc', 0.2, 'screen') });
    return L;
  };

  // ======================================================= THE HILL (wide): the valley with Hamelin far below at the right,
  // the hill rising to the left, the path zigzagging up to the crest; the procession is drawn by the shot along HH.ROUTE
  const HH = S.HH = { ROUTE: [[1500, 1720], [1100, 1640], [600, 1600], [200, 1520], [480, 1420], [820, 1340], [520, 1240], [120, 1160], [-200, 1060], [-80, 960], [-300, 880]] };
  S.hhill = (t, o = {}) => {
    const L = [];
    L.push({ p: 0.15, svg: once('hhsky', () => `<defs>${LG('hhsk', [[0, '#6a9ad0'], [1, '#e8eee6']])}</defs><rect x="-3000" y="-2000" width="7000" height="4000" fill="url(#hhsk)"/>` + E.cloud(-200, 200, 900, 240, 17) + E.cloud(1400, 80, 800, 200, 19)) });
    L.push({ p: 0.4, svg: once('hhvalley', () => {
      let g = E.ridge(3000, 1100, 140, 61, '#8a9a8a', 220).replace('M-50', 'M-2000') + `<path d="M-2000,1100 L3000,1100 L3000,2400 L-2000,2400Z" fill="#7a9a5a"/>` + E.patchwork(-2000, 3000, 1100, 1500, 63, ['#8aa856', '#a8b060', '#7a9a4a', '#c8b868']);
      g += `<path d="M-2000,1380 C-600,1300 600,1460 3000,1340" stroke="#7ab0c8" stroke-width="40" fill="none" opacity="0.8"/>`;
      // the walled town far off at the right: roofs, two church spires, the wall ring
      g += `<ellipse cx="1500" cy="1290" rx="360" ry="90" fill="#9a9282"/>`;
      for (let i = 0; i < 22; i++) { const r = rng(i + 70), x = 1200 + r() * 600, y = 1240 + r() * 70; g += `<path d="M${f(x)},${f(y)} l18,-22 l18,22Z" fill="${['#8a4430', '#6a3a2a', '#7a4a3a'][i % 3]}"/><rect x="${f(x + 2)}" y="${f(y)}" width="32" height="18" fill="#d8c8a6"/>`; }
      g += `<path d="M1440,1250 L1450,1130 L1460,1250Z M1580,1240 L1588,1150 L1596,1240Z" fill="#5a5a62"/>`;
      return g;
    }) });
    // the hill: a big green slope rising to the left, rocks at the crest, the path worn into it
    L.push({ p: 0.7, svg: once('hhhill', () => {
      let g = `<defs>${LG('hhg', [[0, '#7aa04a'], [1, '#4a6a30']])}</defs><path d="M-2400,700 C-1400,640 -800,760 -300,860 C400,1000 1200,1500 2400,1760 L2400,3000 L-2400,3000Z" fill="url(#hhg)"/>`;
      g += `<path d="${HH.ROUTE.map((p, i) => (i ? 'L' : 'M') + p[0] + ',' + p[1]).join(' ')}" stroke="#c8b088" stroke-width="34" fill="none" stroke-linejoin="round" stroke-linecap="round"/><path d="${HH.ROUTE.map((p, i) => (i ? 'L' : 'M') + p[0] + ',' + p[1]).join(' ')}" stroke="#a8946c" stroke-width="12" fill="none" stroke-linejoin="round" opacity="0.6"/>`;
      for (const [x, y, s] of [[-700, 760, 1.6], [-460, 810, 1.0], [-900, 700, 1.2]]) g += `<path d="M${x - 100 * s},${y} C${x - 90 * s},${y - 80 * s} ${x + 60 * s},${y - 110 * s} ${x + 110 * s},${y}Z" fill="#8a8678" ${olr(1.6)}/>`;
      // grass on the slope (clipped to it, so none of it hangs in the sky above the crest)
      g += `<defs><clipPath id="hhgc"><path d="M-2400,700 C-1400,640 -800,760 -300,860 C400,1000 1200,1500 2400,1760 L2400,3000 L-2400,3000Z"/></clipPath></defs><g clip-path="url(#hhgc)">`;
      const r = rng(71); for (let i = 0; i < 200; i++) { const x = -2200 + r() * 4400, y = 800 + r() * 1800; g += `<path d="M${f(x)},${f(y)} l${f(-3 + r() * 6)},-${f(10 + r() * 12)}" stroke="${r() < 0.5 ? '#3a5a2a' : '#8aaa52'}" stroke-width="3"/>`; }
      return g + '</g>';
    }) });
    L.push({ p: 1.15, svg: `<g filter="url(#dof2)">${blades(81, 46, -900, 2000, 2150, 2450, 160, 320, t, ['#4a6a32', '#6a8a42', '#5a7a3a', '#7a9a4a'])}</g>` });
    return L;
  };

  // ======================================================= THE HILLTOP / HILLSIDE: a long slope (x -1600..3200) rising to the
  // summit at the right, where the path ends at a grey rock face with a dark seam; a lone hawthorn; the valley far below.
  // o.dusk 0..1 turns the light to sunset. HT.TOP: the summit ground point; HT.ROCK: the rock face
  const HT = S.HT = { FY: 1700, TOP: [2300, 1560], ROCK: [2700, 1580], TREE: [-600, 1660] };
  S.htop = (t, o = {}) => {
    const L = [], dk = o.dusk || 0;
    L.push({ p: 0.15, svg: `<defs>${LG('htsk', [[0, mix('#6a9ad0', '#1e1e44', dk)], [0.45, mix('#a8c4e0', '#5a3a6a', dk)], [0.62, mix('#cfe0ea', '#d86a4a', dk)], [0.72, mix('#eef0e6', '#ffb070', dk)], [1, mix('#eef0e6', '#ffd08a', dk)]])}</defs><rect x="-4000" y="-2400" width="10000" height="5000" fill="url(#htsk)"/>` +
      once('htcl', () => E.cloud(-600, 200, 1000, 220, 23) + E.cloud(1200, 60, 900, 200, 29) + E.cloud(2600, 260, 800, 180, 31)) + (dk > 0.01 ? C.radial(3200, 1200, 900, '#ffb060', 0.6 * dk, 'screen') : '') });
    L.push({ p: 0.4, svg: once('htvalley', () => E.ridge(5000, 1240, 120, 91, '#8a9aa0', 240).replace('M-50', 'M-3000') + `<path d="M-3000,1260 L5000,1260 L5000,2600 L-3000,2600Z" fill="#7a8a6a"/>` + E.patchwork(-3000, 5000, 1260, 1600, 93, ['#8aa856', '#a8b060', '#7a9a4a', '#c8b868']) +
      `<ellipse cx="400" cy="1400" rx="260" ry="60" fill="#9a9282"/>` + Array.from({ length: 16 }, (_, i) => { const r = rng(i + 400); const x = 180 + r() * 440, y = 1370 + r() * 50; return `<path d="M${f(x)},${f(y)} l12,-15 l12,15Z" fill="#7a4a3a"/>`; }).join('')) + (dk > 0.01 ? `<rect x="-3000" y="1100" width="8000" height="1600" fill="#2a1a3a" opacity="${f(0.4 * dk)}"/>` : '') });
    // the rock face at the summit (p 0.85): grey stone with a dark seam where the hill "closed"
    L.push({ p: 0.85, svg: once('htrock', () => {
      const [rx, ry] = HT.ROCK;
      let g = `<path d="M${rx - 380},${ry} C${rx - 360},${ry - 300} ${rx - 220},${ry - 620} ${rx},${ry - 700} C${rx + 260},${ry - 680} ${rx + 520},${ry - 420} ${rx + 700},${ry} Z" fill="#8a8678" ${olr(2)}/>`;
      for (let i = 0; i < 14; i++) { const r = rng(i + 500); g += `<path d="M${f(rx - 300 + r() * 900)},${f(ry - 60 - r() * 560)} l${f(30 + r() * 80)},${f(-10 + r() * 20)}" stroke="#5a5650" stroke-width="4" opacity="0.6"/>`; }
      g += `<path d="M${rx + 40},${ry} C${rx + 30},${ry - 120} ${rx + 70},${ry - 260} ${rx + 50},${ry - 420}" stroke="#141210" stroke-width="12" fill="none"/><path d="M${rx + 40},${ry} C${rx + 30},${ry - 120} ${rx + 70},${ry - 260} ${rx + 50},${ry - 420}" stroke="#3a3632" stroke-width="30" fill="none" opacity="0.4" filter="url(#b4)"/>`;
      return g;
    }) });
    // the ground: the slope, the path, the grass; a lone hawthorn
    L.push({ p: 1, svg: once('htground', () => {
      let g = `<defs>${LG('htg', [[0, '#7aa04a'], [1, '#4a6a30']])}</defs><path d="M-3600,${HT.FY + 200} C-2000,${HT.FY + 100} 0,${HT.FY} 1400,${HT.FY - 80} C2000,${HT.FY - 130} 2600,${HT.FY - 140} 4200,${HT.FY - 120} L4200,3800 L-3600,3800Z" fill="url(#htg)"/>`;
      g += `<path d="M-3600,${HT.FY + 280} C-2000,${HT.FY + 160} 0,${HT.FY + 60} 1400,${HT.FY - 30} C2000,${HT.FY - 80} 2500,${HT.FY - 90} 2760,${HT.FY - 110}" stroke="#c8b088" stroke-width="90" fill="none" stroke-linecap="round"/><path d="M-3600,${HT.FY + 280} C-2000,${HT.FY + 160} 0,${HT.FY + 60} 1400,${HT.FY - 30} C2000,${HT.FY - 80} 2500,${HT.FY - 90} 2760,${HT.FY - 110}" stroke="#a8946c" stroke-width="30" fill="none" opacity="0.5"/>`;
      const r = rng(97); for (let i = 0; i < 500; i++) { const x = -3400 + r() * 7400, y = HT.FY - 120 + r() * 1600, h = 10 + r() * 22; g += `<path d="M${f(x)},${f(y)} l${f(-4 + r() * 8)},-${f(h)}" stroke="${r() < 0.5 ? '#3a5a2a' : '#8aaa52'}" stroke-width="3"/>` + (r() < 0.06 ? `<circle cx="${f(x)}" cy="${f(y - h)}" r="5" fill="${['#f0e060', '#f4f0e8', '#c8a0e8'][i % 3]}"/>` : ''); }
      const [tx, ty] = HT.TREE;
      g += `<path d="M${tx - 26},${ty} C${tx - 30},${ty - 200} ${tx - 80},${ty - 360} ${tx - 160},${ty - 480} M${tx + 20},${ty} C${tx + 10},${ty - 160} ${tx + 70},${ty - 300} ${tx + 180},${ty - 420}" stroke="#3a2a1e" stroke-width="36" fill="none" stroke-linecap="round"/>`;
      for (let i = 0; i < 26; i++) { const r2 = rng(i + 600), a = r2() * TAU, d = Math.sqrt(r2()) * 260; g += `<circle cx="${f(tx + Math.cos(a) * d * 1.4)}" cy="${f(ty - 500 + Math.sin(a) * d * 0.6)}" r="${f(50 + r2() * 40)}" fill="${shade('#4a6a32', (r2() - 0.5) * 0.3)}"/>`; }
      return g;
    }) });
    // grass in front of the lens, bending in the wind
    { const v = G.ENG && G.ENG.viewRect ? G.ENG.viewRect(1.2) : null; L.push({ p: 1.2, svg: `<g filter="url(#dof2)">${blades(101, 30, v ? v[0] - 100 : -2400, v ? v[2] + 100 : 3200, 2350, 2600, 170, 340, t, ['#4a6a32', '#6a8a42', '#5a7a3a', '#7a9a4a'].map(c => mix(c, '#4a2a3a', dk * 0.45)))}</g>` }); }
    L.push({ p: 1, light: true, svg: dk > 0.01 ? `<rect x="-6000" y="-4000" width="14000" height="10000" fill="#3a1a3a" opacity="${f(0.3 * dk)}" style="mix-blend-mode:multiply"/>` + C.radial(3000, 1300, 2200, '#ff9a50', 0.35 * dk, 'screen') : C.radial(1000, 0, 3000, '#fff8e4', 0.18, 'screen') });
    return L;
  };

  // ======================================================= THE BEDROOM, centuries later: star wallpaper, a window with the moon,
  // a wooden bed (headboard at the back), a lamp on the night table, a shelf of toys; BED: the quilt's front edge
  const HB = S.HB = { FY: 1760, BED: [360, 1280, 1420], LAMP: [1260, 1300], WIN: [-420, 380, 420, 560] };
  S.bedroom = (t, o = {}) => {
    const L = [], [wx, wy, ww, wh] = HB.WIN;
    L.push({ p: 0.4, svg: once('hbnight', () => `<defs>${LG('hbn', [[0, '#0e1430'], [1, '#2a3a5a']])}</defs><rect x="-900" y="0" width="900" height="1200" fill="url(#hbn)"/><circle cx="-220" cy="420" r="70" fill="#f4f0d8"/><circle cx="-196" cy="404" r="62" fill="#1a2440" opacity="0.0"/>` + Array.from({ length: 30 }, (_, i) => { const r = rng(i + 800); return `<circle cx="${f(-880 + r() * 860)}" cy="${f(20 + r() * 900)}" r="${f(1 + r() * 2)}" fill="#fff" opacity="0.7"/>`; }).join('') + `<path d="M-900,980 L-700,860 L-560,920 L-380,840 L-200,900 L0,860 L0,1200 L-900,1200Z" fill="#141a2a"/>`) + C.radial(-220, 420, 220, '#fff8d0', 0.25, 'screen') });
    L.push({ p: 0.9, svg: once('hbwall', () => {
      let g = `<defs><clipPath id="hbwc"><path d="M-2000,-1000 L3000,-1000 L3000,3000 L-2000,3000Z M${wx},${wy} L${wx + ww},${wy} L${wx + ww},${wy + wh} L${wx},${wy + wh}Z" clip-rule="evenodd"/></clipPath><pattern id="hbst" width="120" height="120" patternUnits="userSpaceOnUse"><rect width="120" height="120" fill="#c8d4e0"/><path d="M30,20 l5,12 l13,1 l-10,8 l3,13 l-11,-7 l-11,7 l3,-13 l-10,-8 l13,-1Z" fill="#f2e6b8" opacity="0.8"/><circle cx="90" cy="80" r="5" fill="#f2e6b8" opacity="0.7"/></pattern></defs>`;
      g += `<g clip-path="url(#hbwc)"><rect x="-2000" y="-1000" width="5000" height="${HB.FY + 1000}" fill="url(#hbst)"/><rect x="-2000" y="1280" width="5000" height="${HB.FY - 1280}" fill="#e8dcc8"/><rect x="-2000" y="1272" width="5000" height="14" fill="#a8906a"/></g>`;
      g += `<rect x="${wx - 20}" y="${wy - 20}" width="${ww + 40}" height="${wh + 40}" fill="none" stroke="#f4f0e6" stroke-width="22"/><path d="M${wx + ww / 2},${wy} L${wx + ww / 2},${wy + wh} M${wx},${wy + wh / 2} L${wx + ww},${wy + wh / 2}" stroke="#f4f0e6" stroke-width="10"/>`;
      g += `<path d="M${wx - 90},${wy - 60} C${wx - 40},${wy + 200} ${wx - 110},${wy + 500} ${wx - 60},${wy + wh + 120} L${wx + 30},${wy + wh + 120} C${wx - 10},${wy + 400} ${wx + 40},${wy + 100} ${wx + 10},${wy - 60}Z" fill="#a83a3a" ${olr(1.4)}/><path d="M${wx - 80},${wy - 70} L${wx + ww + 80},${wy - 70}" stroke="#6a4a2a" stroke-width="10"/>`;
      // a shelf with a toy boat, a teddy bear, books; a framed picture of a sailing ship
      g += `<rect x="1380" y="760" width="420" height="16" fill="#8a6a44" ${olr(1.2)}/><path d="M1400,760 L1460,700 L1520,760Z" fill="#c8a040" ${olr(1)}/><circle cx="1600" cy="720" r="34" fill="#a8743a" ${olr(1.2)}/><circle cx="1600" cy="680" r="24" fill="#a8743a" ${olr(1.2)}/>` + [0, 1, 2, 3].map(i => `<rect x="${1660 + i * 30}" y="${690 + (i % 2) * 10}" width="24" height="${70 - (i % 2) * 10}" fill="${['#3a5a8a', '#c83a3a', '#3a8a5a', '#e8b030'][i]}" ${olr(1)}/>`).join('');
      g += `<rect x="560" y="520" width="300" height="220" fill="#6a4a2a" ${olr(1.6)}/><rect x="580" y="540" width="260" height="180" fill="#bcd4e0"/><path d="M640,690 L780,690 L760,720 L660,720Z" fill="#6a4a2a"/><path d="M710,580 L710,690 M710,590 L760,670 L710,670Z" stroke="#4a3a2a" stroke-width="3" fill="#f4f0e6"/>`;
      return g;
    }) });
    // the bed: headboard, pillows, the quilt (patchwork), the night table and the lamp
    L.push({ p: 0.97, tag: 'bedback', svg: once('hbbed', () => {
      const [x0, x1, by] = HB.BED;
      let g = `<path d="M${x0 - 40},${HB.FY} L${x0 - 40},${by - 520} C${x0 - 40},${by - 600} ${x1 + 40},${by - 600} ${x1 + 40},${by - 520} L${x1 + 40},${HB.FY}Z" fill="#8a5a34" ${olr(2)}/><path d="M${x0},${by - 500} C${x0 + 20},${by - 560} ${x1 - 20},${by - 560} ${x1},${by - 500}" stroke="#b07a48" stroke-width="10" fill="none"/>`;
      g += `<path d="M${x0 + 40},${by - 240} C${x0 + 40},${by - 360} ${x0 + 420},${by - 360} ${x0 + 420},${by - 240}Z" fill="#f6f2ea" ${olr(1.6)}/><path d="M${x1 - 420},${by - 240} C${x1 - 420},${by - 360} ${x1 - 40},${by - 360} ${x1 - 40},${by - 240}Z" fill="#f2eee4" ${olr(1.6)}/>`;
      return g;
    }) });
    L.push({ p: 0.97, tag: 'quilt', svg: once('hbquilt', () => {
      const [x0, x1, by] = HB.BED;
      let g = `<path d="M${x0 - 60},${by - 200} C${x0 + 200},${by - 260} ${x1 - 200},${by - 260} ${x1 + 60},${by - 200} L${x1 + 80},${by + 120} L${x0 - 80},${by + 120}Z" fill="#c8a070" ${olr(2)}/>`;
      const cols = ['#c83a3a', '#e8c040', '#3a6aa8', '#4a8a5a', '#e8e2d4', '#a85a8a'];
      for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) { const x = x0 - 60 + i * (x1 - x0 + 120) / 6, y = by - 210 + j * 108; g += `<rect x="${f(x + 6)}" y="${f(y + 6)}" width="${f((x1 - x0 + 120) / 6 - 12)}" height="96" fill="${cols[(i + j * 2) % 6]}" opacity="0.85" stroke="#f4f0e6" stroke-width="3" stroke-dasharray="8 6"/>`; }
      g += `<rect x="${x1 + 120}" y="${by - 220}" width="200" height="${HB.FY - by + 220}" fill="#7a5230" ${olr(1.6)}/><rect x="${x1 + 140}" y="${by - 120}" width="160" height="80" fill="#6a4426" ${olr(1)}/>`;
      return g;
    }) + (() => { const [lx, ly] = HB.LAMP; return `<rect x="${lx + 196}" y="${ly - 200}" width="18" height="180" fill="#3a3a3e"/><path d="M${lx + 120},${ly - 200} L${lx + 290},${ly - 200} L${lx + 250},${ly - 330} L${lx + 160},${ly - 330}Z" fill="#f2dca0" ${olr(1.4)}/>` + C.radial(lx + 205, ly - 240, 700, '#ffc870', 0.4, 'screen'); })() });
    L.push({ p: 1, svg: once('hbfloor', () => `<rect x="-2000" y="${HB.FY}" width="5000" height="1200" fill="#7a5a3a"/>` + Array.from({ length: 14 }, (_, i) => `<path d="M${-2000 + i * 380},${HB.FY} L${-2400 + i * 520},${HB.FY + 1200}" stroke="#5a3e26" stroke-width="4"/>`).join('') + `<ellipse cx="820" cy="${HB.FY + 260}" rx="700" ry="140" fill="#a84a4a" opacity="0.8"/><ellipse cx="820" cy="${HB.FY + 260}" rx="600" ry="110" fill="none" stroke="#e8c070" stroke-width="10" stroke-dasharray="20 14"/>`) });
    L.push({ p: 0.9, light: true, svg: `<rect x="-3000" y="-3000" width="8000" height="8000" fill="#0a1024" opacity="0.32"/>` + C.radial(HB.LAMP[0] + 205, HB.LAMP[1] - 240, 1300, '#ffb860', 0.28, 'screen') });
    return L;
  };
})(window);
