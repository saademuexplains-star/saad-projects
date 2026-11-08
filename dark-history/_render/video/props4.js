// Props for "The Worm". Hand-held props use the RIG 'grip' frame (+x = thumb side, +y = fingers).
(function (G) {
  const { f, shade, mix, rng, uid, OUT, NS, ol } = G.RIG, C = G.CINE;
  // scales are never rounded to steps (a far prop would jump a few per cent at each step as the camera moves)
  const fs = v => Math.round(v * 1e5) / 1e5;
  const P = G.PROPS;
  const LG = (id, stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a !== undefined ? ` stop-opacity="${a}"` : ''}/>`).join('')}</linearGradient>`;
  const RG = (id, stops, cx = 0.5, cy = 0.5, r = 0.5) => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a !== undefined ? ` stop-opacity="${a}"` : ''}/>`).join('')}</radialGradient>`;

  // ---------------- clay cup in the grip frame: rim at +x (thumb side), base at -x. o.water 0..1 visible at the rim
  P.cup = (o = {}) => {
    const id = uid('cu');
    let g = `<defs>${LG(id, [[0, '#6a3a1e'], [0.35, '#b8784a'], [0.6, '#a0603a'], [1, '#4a2410']])}</defs>`;
    g += `<path d="M-46,-30 L42,-36 L42,36 L-46,30 Q-54,0 -46,-30Z" fill="url(#${id})" ${ol(1.4)}/>`;
    g += `<path d="M-30,-31 L-30,31 M10,-34 L10,34" stroke="#5a2a10" stroke-width="2.5" opacity="0.35"/>`;
    g += `<ellipse cx="42" cy="0" rx="10" ry="36" fill="#8a4a24" ${ol(1.4)}/>`;
    if (o.water !== undefined) g += `<ellipse cx="43" cy="0" rx="6" ry="${f(30 * (o.water || 0.8))}" fill="#6a8a8a" opacity="0.9"/><ellipse cx="43" cy="-8" rx="2" ry="8" fill="#e8f4f4" opacity="0.7"/>`;
    return g;
  };
  // leather water skin carried on the hip; (x,y) = bag centre, rot deg; returns {svg, spout}
  P.goatskin = (x, y, s, rot = 0) => {
    const id = uid('gs');
    const svg = `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)}) scale(${fs(s)})"><defs>${LG(id, [[0, '#8a5a30'], [0.5, '#5a3418'], [1, '#2a160a']], 0, 0, 1, 1)}</defs>` +
      `<path d="M-120,-40 C-140,60 -60,120 40,110 C130,100 150,20 120,-40 C90,-80 -90,-90 -120,-40Z" fill="url(#${id})" ${ol(1.6)}/>` +
      `<path d="M100,-50 L160,-90 L176,-72 L118,-30Z" fill="#4a2a14" ${ol(1.3)}/><circle cx="170" cy="-84" r="9" fill="#2a160a" ${ol(1)}/>` +
      `<path d="M-90,-20 C-60,-40 40,-44 90,-20" stroke="#c89a6a" stroke-width="4" fill="none" opacity="0.35"/><path d="M-110,10 q60,30 200,10" stroke="#1a0c04" stroke-width="3" fill="none" opacity="0.4"/></g>`;
    const a = rot * Math.PI / 180, sp = [170 * s, -84 * s];
    return { svg, spout: [x + sp[0] * Math.cos(a) - sp[1] * Math.sin(a), y + sp[0] * Math.sin(a) + sp[1] * Math.cos(a)] };
  };
  // a falling stream of water between two points, t animates the shimmer
  P.stream = (a, b, w, t) => {
    const mx = (a[0] + b[0]) / 2 + 10, my = Math.min(a[1], b[1]) - 20;
    let g = `<path d="M${f(a[0])},${f(a[1])} Q${f(mx)},${f(my)} ${f(b[0])},${f(b[1])}" stroke="#b8d4d8" stroke-width="${f(w)}" fill="none" stroke-linecap="round" opacity="0.8"/>`;
    g += `<path d="M${f(a[0])},${f(a[1])} Q${f(mx)},${f(my)} ${f(b[0])},${f(b[1])}" stroke="#ffffff" stroke-width="${f(w * 0.35)}" fill="none" stroke-dasharray="${f(w * 2)} ${f(w * 3)}" stroke-dashoffset="${f(-t * 400)}" opacity="0.7"/>`;
    return g;
  };

  // ---------------- the micro world
  // a water flea (copepod), (x,y) centre, heading in degrees; o.larva: carries a coiled larva inside
  P.copepod = (x, y, s, ang, t, o = {}) => {
    const id = uid('cp'), k = Math.sin(t * 18 + x * 0.01);
    let g = `<g transform="translate(${f(x)},${f(y)}) rotate(${f(ang)}) scale(${fs(s)})"><defs>${RG(id, [[0, '#e8f0d8', 0.9], [0.7, '#a8c0a0', 0.75], [1, '#5a7a5a', 0.6]], 0.4, 0.4, 0.7)}</defs>`;
    g += `<path d="M0,-70 C-12,40 30,-52 2,96 L-2,96 C-30,-52 12,40 0,-70" fill="none"/>`;
    // antennae
    for (const sd of [-1, 1]) g += `<path d="M${sd * 8},-56 C${sd * 60},-90 ${sd * 120},${f(-70 + k * 10)} ${sd * 170},${f(-40 + k * 14)}" stroke="#c8d8b8" stroke-width="3" fill="none" opacity="0.8"/>`;
    // body
    g += `<path d="M0,-70 C34,-66 42,-10 30,30 C22,58 10,70 0,74 C-10,70 -22,58 -30,30 C-42,-10 -34,-66 0,-70Z" fill="url(#${id})" stroke="#4a6a4a" stroke-width="1.5"/>`;
    for (let i = 0; i < 4; i++) g += `<path d="M-30,${-20 + i * 18} q30,8 60,0" stroke="#5a7a5a" stroke-width="1.5" fill="none" opacity="0.6"/>`;
    // legs paddling
    for (let i = 0; i < 4; i++) for (const sd of [-1, 1]) g += `<path d="M${sd * 26},${-8 + i * 14} l${f(sd * (26 + Math.sin(t * 22 + i) * 8))},${f(10 + i * 2)}" stroke="#a8c098" stroke-width="2.5" stroke-linecap="round"/>`;
    // tail with egg sacs
    g += `<path d="M0,72 L0,120 M0,120 l-14,24 M0,120 l14,24" stroke="#a8c098" stroke-width="3" stroke-linecap="round"/>`;
    g += `<circle cx="0" cy="-48" r="7" fill="#c03028"/><circle cx="-2" cy="-50" r="2.4" fill="#fff" opacity="0.8"/>`;
    if (o.larva) g += P.larva(0, 6, 0.55, t, '#f4f0e0');
    return g + `</g>`;
  };
  // coiled worm larva, wriggling
  P.larva = (x, y, s, t, col = '#f0ece0') => {
    let d = '';
    for (let i = 0; i <= 28; i++) { const u = i / 28, a = u * Math.PI * 3.2 + t * 4, r = 30 * (1 - u * 0.65); d += `${i ? 'L' : 'M'}${f(Math.cos(a) * r + Math.sin(t * 9 + u * 8) * 3)},${f(Math.sin(a) * r)} `; }
    return `<g transform="translate(${f(x)},${f(y)}) scale(${fs(s)})"><path d="${d}" stroke="#3a3428" stroke-width="12" fill="none" stroke-linecap="round" opacity="0.6"/><path d="${d}" stroke="${col}" stroke-width="9" fill="none" stroke-linecap="round"/><path d="${d}" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.6"/></g>`;
  };

  // ---------------- the worm along a list of points (world/local units). w = thickness. o.head: draw a rounded head,
  // o.len 0..1 how much of the path is drawn (from the first point), o.glow for x-ray views
  P.worm = (pts, w, o = {}) => {
    if (pts.length < 2) return '';
    // resample to arc length so partial length grows smoothly
    const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const total = L[L.length - 1], want = total * (o.len ?? 1);
    const out = [pts[0]];
    for (let i = 1; i < pts.length; i++) { if (L[i] <= want) out.push(pts[i]); else { const u = (want - L[i - 1]) / (L[i] - L[i - 1] || 1); out.push([pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * u, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * u]); break; } }
    let d = `M${f(out[0][0])},${f(out[0][1])}`;
    for (let i = 1; i < out.length - 1; i++) { const m = [(out[i][0] + out[i + 1][0]) / 2, (out[i][1] + out[i + 1][1]) / 2]; d += ` Q${f(out[i][0])},${f(out[i][1])} ${f(m[0])},${f(m[1])}`; }
    d += ` L${f(out[out.length - 1][0])},${f(out[out.length - 1][1])}`;
    const col = o.col || '#f2eee2';
    let g = '';
    if (o.glow) g += `<path d="${d}" stroke="${o.glowCol || '#d8f8ff'}" stroke-width="${f(w * 2.4)}" fill="none" stroke-linecap="round" opacity="${f(0.35 * o.glow)}" filter="url(#b4)"/>`;
    // contact shadow on the tissue underneath
    if (o.shadow) g += `<path d="${d}" stroke="#12020a" stroke-width="${f(w * 1.7)}" fill="none" stroke-linecap="round" opacity="${f(0.22 * o.shadow)}" transform="translate(${f(w * 0.35)},${f(w * 0.45)})"/><path d="${d}" stroke="#12020a" stroke-width="${f(w * 1.25)}" fill="none" stroke-linecap="round" opacity="${f(0.3 * o.shadow)}" transform="translate(${f(w * 0.3)},${f(w * 0.38)})"/>`;
    g += `<path d="${d}" stroke="#2a2418" stroke-width="${f(w + 3)}" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.75"/>`;
    g += `<path d="${d}" stroke="${shade(col, -0.18)}" stroke-width="${f(w)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    g += `<path d="${d}" stroke="${col}" stroke-width="${f(w * 0.6)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    g += `<path d="${d}" stroke="#ffffff" stroke-width="${f(w * 0.18)}" fill="none" stroke-linecap="round" opacity="0.7" transform="translate(${f(-w * 0.15)},${f(-w * 0.15)})"/>`;
    // segment rings
    g += `<path d="${d}" stroke="${shade(col, -0.35)}" stroke-width="${f(w * 0.9)}" fill="none" stroke-dasharray="1.2 ${f(w * 0.9)}" opacity="0.45"/>`;
    if (o.head) { const e = out[out.length - 1]; g += `<circle cx="${f(e[0])}" cy="${f(e[1])}" r="${f(w * 0.62)}" fill="${shade(col, 0.05)}" ${ol(1.2)}/><circle cx="${f(e[0] - w * 0.18)}" cy="${f(e[1] - w * 0.18)}" r="${f(w * 0.2)}" fill="#fff" opacity="0.6"/>`; }
    return g;
  };

  // round flatbread in the grip frame: it rises out of the fist on the thumb side (+x), seen nearly face-on
  P.bread = () => {
    const id = uid('br');
    let g = `<defs>${RG(id, [[0, '#e8bc78'], [0.7, '#d09a54'], [1, '#9a6430']], 0.45, 0.4, 0.6)}</defs>`;
    g += `<ellipse cx="56" cy="2" rx="54" ry="46" fill="url(#${id})" ${ol(1.6)}/><ellipse cx="54" cy="-2" rx="42" ry="34" fill="none" stroke="#a86a34" stroke-width="2" opacity="0.5"/>`;
    for (const [x, y, r] of [[40, -14, 7], [66, 10, 6], [52, 20, 5], [76, -16, 5], [30, 12, 4]]) g += `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.6}" fill="#6a3a14" opacity="0.55"/>`;
    return g;
  };

  // ---------------- the lower leg close-up (side view), ankle bone at (0,0), knee up-left, toes to the right.
  // o: skin, heat 0..1, blister 0..1, wound 0..1 (open sore), wet, under (underwater tint)
  P.legClose = (o = {}) => {
    const skin = o.skin || '#9c6a46', id = uid('lc');
    const body = `M-150,-900 C-170,-600 -160,-300 -110,-120 C-90,-50 -110,10 -130,60 C-150,110 -120,150 -40,150 L240,150 C300,150 320,120 300,96 C280,72 200,60 120,40 C60,24 40,-30 50,-120 C70,-320 80,-620 60,-900Z`;
    let g = `<defs>${LG(id, [[0, shade(skin, -0.3)], [0.35, shade(skin, 0.08)], [0.7, skin], [1, shade(skin, -0.35)]], 0, 0, 1, 0)}<clipPath id="${id}c"><path d="${body}"/></clipPath></defs>`;
    g += `<path d="${body}" fill="url(#${id})" ${ol(2)}/>`;
    let inner = '';
    inner += `<ellipse cx="-20" cy="-20" rx="38" ry="30" fill="${shade(skin, 0.12)}" opacity="0.6"/><ellipse cx="-20" cy="-30" rx="18" ry="12" fill="#fff" opacity="0.12"/>`;   // ankle bone
    inner += `<path d="M-60,-500 C-40,-300 -20,-150 -10,-60" stroke="${shade(skin, -0.4)}" stroke-width="18" fill="none" opacity="0.3" filter="url(#b8)"/>`; // shin shadow
    inner += `<path d="M120,60 C180,80 240,96 290,100" stroke="${shade(skin, -0.4)}" stroke-width="10" fill="none" opacity="0.3" filter="url(#b4)"/>`;
    for (const tx of [210, 236, 258, 276, 292]) inner += `<path d="M${tx},${118 + (tx - 210) * 0.1} q6,16 0,30" stroke="${shade(skin, -0.45)}" stroke-width="2" fill="none" opacity="0.6"/>`;
    // the burning: a hot red bloom under the skin around the ankle
    if (o.heat) inner += `<ellipse cx="10" cy="40" rx="${f(90 + o.heat * 80)}" ry="${f(80 + o.heat * 60)}" fill="#ff3010" opacity="${f(0.45 * o.heat)}" filter="url(#b14)"/><ellipse cx="10" cy="40" rx="${f(40 + o.heat * 30)}" ry="${f(34 + o.heat * 26)}" fill="#ffb040" opacity="${f(0.5 * o.heat)}" filter="url(#b8)"/>`;
    if (o.under) inner += `<rect x="-400" y="-1000" width="800" height="1300" fill="#2a6a7a" opacity="0.35" style="mix-blend-mode:multiply"/>`;
    g += `<g clip-path="url(#${id}c)">${inner}</g>`;
    // the blister swelling out of the skin, then the open sore
    if (o.blister > 0.01) {
      const b = o.blister, r = 18 + b * 62;
      g += `<ellipse cx="34" cy="${f(46 - b * 6)}" rx="${f(r * 1.15)}" ry="${f(r)}" fill="#f0d8b8" opacity="${f(0.6 + b * 0.3)}" stroke="${shade(skin, -0.35)}" stroke-width="2"/>`;
      g += `<ellipse cx="${f(34 - r * 0.3)}" cy="${f(46 - r * 0.45)}" rx="${f(r * 0.35)}" ry="${f(r * 0.2)}" fill="#fff" opacity="0.65"/><ellipse cx="34" cy="${f(46 + r * 0.3)}" rx="${f(r * 0.9)}" ry="${f(r * 0.4)}" fill="#c87a60" opacity="0.25"/>`;
    }
    if (o.wound > 0.01) {
      const k = o.wound;
      g += `<ellipse cx="34" cy="46" rx="${f(26 * k + 8)}" ry="${f(20 * k + 6)}" fill="#7a1a14" ${ol(1.2)}/><ellipse cx="34" cy="48" rx="${f(16 * k + 4)}" ry="${f(12 * k + 3)}" fill="#3a0806"/><path d="M${f(34 - 30 * k)},40 q${f(30 * k)},-14 ${f(60 * k)},0" stroke="#e8c8b0" stroke-width="3" fill="none" opacity="0.6"/>`;
    }
    if (o.wet) g += `<path d="M-120,-200 C-110,-100 -100,0 -120,60" stroke="#ffffff" stroke-width="4" opacity="${f(0.3 * o.wet)}" fill="none"/><circle cx="-60" cy="-140" r="5" fill="#e8f8ff" opacity="${f(0.6 * o.wet)}"/><circle cx="60" cy="-260" r="4" fill="#e8f8ff" opacity="${f(0.6 * o.wet)}"/>`;
    return g;
  };
  P.LEG_WOUND = [34, 46];   // where the worm comes out, leg-local
  // the worm's route inside the lower leg (leg-local), knee -> ankle wound
  P.legRoute = () => { const pts = []; for (let i = 0; i <= 40; i++) { const u = i / 40; pts.push([-60 + u * 94 + Math.sin(u * 9) * 26 * (1 - u * 0.6), -880 + u * 926]); } return pts; };
  // x-ray of the lower leg: translucent flesh, tibia/fibula, foot bones, veins; the worm inside.
  // o.worm 0..1 length, o.snap 0..1 the worm tears in two, o.venom 0..1 black poison spreading up the veins
  P.legXray = (o = {}) => {
    const body = `M-150,-900 C-170,-600 -160,-300 -110,-120 C-90,-50 -110,10 -130,60 C-150,110 -120,150 -40,150 L240,150 C300,150 320,120 300,96 C280,72 200,60 120,40 C60,24 40,-30 50,-120 C70,-320 80,-620 60,-900Z`;
    let g = `<path d="${body}" fill="#2a6a8a" opacity="0.35"/><path d="${body}" fill="none" stroke="#9ae8ff" stroke-width="5" opacity="0.6" filter="url(#b2)"/>`;
    // bones
    g += `<g stroke="#e8f8ff" fill="none" stroke-linecap="round" opacity="0.7"><path d="M-30,-880 C-24,-600 -20,-300 -14,-40" stroke-width="34"/><path d="M-90,-860 C-86,-600 -80,-320 -70,-60" stroke-width="16"/>` +
      `<path d="M-60,0 C-20,-30 40,-20 60,30 M60,30 C120,60 200,80 290,100 M70,50 L280,118 M80,70 L260,130" stroke-width="12"/></g>`;
    // veins, darkening with the venom from the ankle upward
    const vk = o.venom || 0;
    for (let i = 0; i < 5; i++) {
      let d = `M${30 - i * 10},40`; for (let k = 1; k <= 12; k++) d += ` L${f(30 - i * 16 + Math.sin(k * 1.7 + i) * 26)},${f(40 - k * 76)}`;
      const reach = Math.max(0, Math.min(1, vk * 1.4 - i * 0.08));
      g += `<path d="${d}" stroke="#5aa8c8" stroke-width="4" fill="none" opacity="0.5"/>`;
      if (reach > 0) g += `<path d="${d}" stroke="#0a0a0a" stroke-width="${f(6 + vk * 6)}" fill="none" stroke-dasharray="${f(reach * 1000)} 2000" opacity="0.9"/><path d="${d}" stroke="#3a1a3a" stroke-width="${f(18 + vk * 16)}" fill="none" stroke-dasharray="${f(reach * 1000)} 2000" opacity="0.35" filter="url(#b4)"/>`;
    }
    // the worm inside
    const route = P.legRoute();
    if ((o.snap || 0) > 0.01) {
      const cut = Math.floor(route.length * 0.55), gap = o.snap * 60;
      const top = route.slice(0, cut).map(([x, y]) => [x, y - gap * 0.4]), bottom = route.slice(cut).map(([x, y]) => [x, y + gap * 0.6]);
      g += P.worm(top, 20, { glow: 1, head: true }) + P.worm(bottom, 20, { glow: 1 });
      g += C.radial(route[cut][0], route[cut][1], 120, '#ff3040', 0.6 * o.snap);
    } else g += P.worm(route, 20, { glow: 1, len: o.worm ?? 1 });
    return g;
  };
  // a close-up forearm entering from off-screen with its hand (for big hand-on-prop shots).
  // from = elbow side (can be off-frame), wrist = wrist point; the hand follows R.hand conventions.
  P.closeArm = (o) => {
    const R = G.RIG, skin = o.skin, w0 = o.w0 || o.size * 0.62, w1 = o.w1 || o.size * 0.44, id = uid('ca');
    const [ax, ay] = o.from, [bx, by] = o.wrist, L = Math.hypot(bx - ax, by - ay) || 1, nx = -(by - ay) / L, ny = (bx - ax) / L;
    const p = (x, y, k, w) => `${f(x + nx * k * w / 2)},${f(y + ny * k * w / 2)}`;
    const col = o.sleeve || mix(skin, '#c97a62', 0.14);
    let g = `<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${f(bx + nx * w1 / 2)}" y1="${f(by + ny * w1 / 2)}" x2="${f(bx - nx * w1 / 2)}" y2="${f(by - ny * w1 / 2)}"><stop offset="0" stop-color="${shade(col, -0.32)}"/><stop offset="0.4" stop-color="${shade(col, 0.08)}"/><stop offset="1" stop-color="${shade(col, -0.36)}"/></linearGradient></defs>`;
    g += `<path d="M${p(ax, ay, 1, w0)} L${p(bx, by, 1, w1)} L${p(bx, by, -1, w1)} L${p(ax, ay, -1, w0)}Z" fill="url(#${id})" ${ol(1.6)}/>`;
    g += R.hand({ x: bx, y: by, dir: o.dir, side: o.side, facing: o.facing || 'back', thumb: o.thumb || 'auto', pose: o.pose || 'relaxed', size: o.size, skin, hold: o.hold, holdRot: o.holdRot });
    return `<g filter="url(#skinS)">${g}</g>`;
  };
  // grip slot of a close hand: wrist + dir * 0.33 * size
  P.slot = (wrist, dir, size) => { const n = Math.hypot(dir[0], dir[1]) || 1, g = G.RIG.gripSlot ? G.RIG.gripSlot(size) : 0.33 * size; return [wrist[0] + dir[0] / n * g, wrist[1] + dir[1] / n * g]; };
  P.wristFor = (slot, dir, size) => { const n = Math.hypot(dir[0], dir[1]) || 1, g = G.RIG.gripSlot ? G.RIG.gripSlot(size) : 0.33 * size; return [slot[0] - dir[0] / n * g, slot[1] - dir[1] / n * g]; };

  // ---------------- x-ray: skeleton + gut drawn in person-local units for an adult man (DIMS man)
  P.skeleton = (D, o = {}) => {
    const c = o.col || '#e8f8ff', op = o.op ?? 0.75;
    let g = `<g opacity="${op}" stroke="${c}" fill="none" stroke-linecap="round">`;
    const sy = D.shY, wy = D.wY, hy = D.hemY;
    g += `<path d="M0,${sy - 40} L0,${wy + 120}" stroke-width="16"/>`;
    for (let i = 0; i < 7; i++) { const y = sy + 30 + i * 46; g += `<path d="M-8,${y} C-80,${y - 10} -120,${y + 30} -110,${y + 60} M8,${y} C80,${y - 10} 120,${y + 30} 110,${y + 60}" stroke-width="9"/>`; }
    g += `<path d="M${-D.shX + 30},${sy + 6} L-20,${sy - 10} M${D.shX - 30},${sy + 6} L20,${sy - 10}" stroke-width="12"/>`;
    g += `<path d="M-110,${wy + 90} C-120,${wy + 170} -40,${wy + 200} 0,${wy + 150} C40,${wy + 200} 120,${wy + 170} 110,${wy + 90}" stroke-width="12"/>`;
    for (const s of [-1, 1]) g += `<path d="M${s * 70},${wy + 180} L${s * D.legX},${hy + 160} M${s * D.legX},${hy + 190} L${s * D.legX},${-D.foot * 0.5}" stroke-width="14"/><circle cx="${s * D.legX}" cy="${hy + 175}" r="14" stroke-width="6"/>`;
    g += `</g>`;
    // stomach and gut (soft)
    g += `<path d="M-60,${sy + 330} C-90,${sy + 260} 30,${sy + 230} 60,${sy + 290} C90,${sy + 350} 20,${sy + 400} -40,${sy + 380}Z" fill="${c}" opacity="0.18" stroke="${c}" stroke-width="2"/>`;
    return g;
  };
  // the worm's route inside the body (person-local): stomach -> belly -> hip -> down the left leg to the ankle
  P.wormRoute = D => {
    const pts = [], sy = D.shY, wy = D.wY, hy = D.hemY, x = D.legX;
    const key = [[-10, sy + 320], [30, sy + 380], [-30, wy - 10], [40, wy + 60], [x - 10, wy + 160], [x + 14, hy + 100], [x - 8, hy + 260], [x + 8, -D.foot * 0.9 - 120], [x - 4, -D.foot * 0.6]];
    for (let i = 0; i < key.length - 1; i++) for (let k = 0; k < 8; k++) { const u = k / 8; pts.push([key[i][0] + (key[i + 1][0] - key[i][0]) * u + Math.sin((i * 8 + k) * 0.9) * 10, key[i][1] + (key[i + 1][1] - key[i][1]) * u]); }
    pts.push(key[key.length - 1]);
    return pts;
  };

  // ---------------- twig (grip frame): along x; the worm coiled on it, coil 0..1 (number of turns); o.thread
  P.twig = (o = {}) => {
    const id = uid('tw');
    let g = `<defs>${LG(id, [[0, '#8a6a44'], [0.5, '#5a4024'], [1, '#2e1e10']])}</defs>`;
    g += `<path d="M-70,-6 L150,-5 Q160,0 150,5 L-70,6 Q-78,0 -70,-6Z" fill="url(#${id})" ${ol(1.2)}/><circle cx="20" cy="-6" r="4" fill="#3a2614"/><path d="M60,-6 l8,-10" stroke="#5a4024" stroke-width="4"/>`;
    const turns = Math.round((o.coil || 0) * 26);
    for (let i = 0; i < turns; i++) { const x = 70 + i * 3.1 - (turns * 1.4); g += `<ellipse cx="${f(x)}" cy="0" rx="4.5" ry="${f(10 + Math.min(4, i * 0.15))}" fill="#efe9dc" stroke="#6a5a48" stroke-width="1.2"/>`; }
    if (o.thread) g += `<path d="M96,-8 l4,16 M100,-8 l4,16" stroke="#d8c8a0" stroke-width="2.4"/>`;
    return g;
  };

  // ---------------- the Rod of Asclepius (staff with one coiled serpent), centre-bottom at (x,y)
  P.rod = (x, y, s, o = {}) => {
    const col = o.col || '#ffffff', id = uid('ro');
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${fs(s)})">`;
    g += `<rect x="-9" y="-420" width="18" height="420" rx="8" fill="${col}"/><circle cx="0" cy="-424" r="12" fill="${col}"/>`;
    let d = 'M0,-30';
    for (let i = 1; i <= 40; i++) { const u = i / 40, yy = -30 - u * 330, xx = Math.sin(u * Math.PI * 5) * (34 - u * 6); d += ` L${f(xx)},${f(yy)}`; }
    g += `<path d="${d}" stroke="${o.bg || '#1a5aa8'}" stroke-width="22" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${col}" stroke-width="14" fill="none" stroke-linecap="round"/>`;
    g += `<ellipse cx="22" cy="-372" rx="22" ry="13" fill="${col}" transform="rotate(-20 22 -372)"/><circle cx="30" cy="-376" r="3" fill="${o.bg || '#1a5aa8'}"/>`;
    return g + `</g>`;
  };
  // Star of Life: blue six-armed cross with a white edge and the rod inside; (x,y) centre, R = arm length
  P.starOfLife = (x, y, R, o = {}) => {
    const arm = R * 0.36, blue = o.blue || '#1a5aa8';
    let arms = '';
    for (let k = 0; k < 3; k++) arms += `<rect x="${f(-arm / 2)}" y="${f(-R)}" width="${f(arm)}" height="${f(2 * R)}" transform="rotate(${k * 60})"/>`;
    return `<g transform="translate(${f(x)},${f(y)})"><g fill="#ffffff" transform="scale(1.1)">${arms}</g><g fill="${blue}">${arms}</g>${P.rod(0, R * 0.78, R * 0.0036, { bg: blue })}</g>`;
  };
  // modern ambulance (side view), (x,y) = ground under the centre; t flashes the light bar; o.lights 0..1
  P.ambulance = (x, y, s, t, o = {}) => {
    const id = uid('am'), on = o.lights ?? 1, pulse = 0.5 + 0.5 * Math.sin(Math.PI * 2 * 2.2 * t);
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${fs(s)})"><defs>${LG(id, [[0, '#ffffff'], [0.6, '#e4e8ee'], [1, '#a8b0bc']])}</defs>`;
    g += `<ellipse cx="0" cy="8" rx="620" ry="40" fill="#000" opacity="0.5" filter="url(#b8)"/>`;
    // box body + cab
    g += `<path d="M-560,-60 L-560,-640 Q-560,-660 -540,-660 L260,-660 Q280,-660 280,-640 L280,-60Z" fill="url(#${id})" ${ol(2)}/>`;
    g += `<path d="M280,-460 L420,-460 Q470,-450 500,-380 L560,-240 Q580,-200 580,-150 L580,-60 L280,-60Z" fill="url(#${id})" ${ol(2)}/>`;
    g += `<path d="M300,-440 L410,-440 Q450,-430 470,-380 L510,-280 L300,-280Z" fill="#1a2430" ${ol(1.5)}/><path d="M320,-430 L400,-430 L430,-330" stroke="#8aa0b8" stroke-width="6" opacity="0.4" fill="none"/>`;
    // stripes
    g += `<rect x="-560" y="-300" width="1140" height="36" fill="#c8202a"/><rect x="-560" y="-256" width="1140" height="14" fill="#1a5aa8"/>`;
    g += `<rect x="-540" y="-620" width="230" height="160" rx="6" fill="#1a2430" opacity="0.85"/>`;
    // the Star of Life on the box side
    g += P.starOfLife(-60, -470, 130, {});
    // light bar
    g += `<rect x="-420" y="-700" width="600" height="40" rx="12" fill="#2a2a30" ${ol(1.5)}/>`;
    const red = 0.2 + 0.8 * pulse, blue = 0.2 + 0.8 * (1 - pulse);
    g += `<rect x="-410" y="-694" width="280" height="28" rx="8" fill="#ff2a2a" opacity="${f(0.35 + 0.65 * red * on)}"/><rect x="-110" y="-694" width="280" height="28" rx="8" fill="#2a6aff" opacity="${f(0.35 + 0.65 * blue * on)}"/>`;
    // wheels
    for (const wx of [-360, 380]) g += `<circle cx="${wx}" cy="-60" r="86" fill="#141418" ${ol(2)}/><circle cx="${wx}" cy="-60" r="44" fill="#8a8e96"/><circle cx="${wx}" cy="-60" r="16" fill="#3a3e46"/>`;
    g += `<rect x="540" y="-200" width="40" height="40" rx="8" fill="#fff4c0"/>`;
    g += `</g>`;
    // light spill
    if (on > 0) g += C.radial(x - 230 * s, y - 700 * s, 900 * s, '#ff2a2a', 0.35 * red * on) + C.radial(x + 60 * s, y - 700 * s, 900 * s, '#2a6aff', 0.35 * blue * on) + C.radial(x + 600 * s, y - 180 * s, 500 * s, '#fff4c0', 0.25);
    return g;
  };

  // ---------------- small set dressing
  P.tally = (x, y, n, s = 1) => { let g = ''; for (let i = 0; i < n; i++) { const grp = Math.floor(i / 5), k = i % 5, gx = x + grp * 70 * s; g += k < 4 ? `<path d="M${f(gx + k * 12 * s)},${f(y)} l${f(2 * s)},${f(46 * s)}" stroke="#2a1c10" stroke-width="${f(4 * s)}" stroke-linecap="round" opacity="0.85"/>` : `<path d="M${f(gx - 6 * s)},${f(y + 34 * s)} L${f(gx + 46 * s)},${f(y + 10 * s)}" stroke="#2a1c10" stroke-width="${f(4 * s)}" stroke-linecap="round" opacity="0.85"/>`; } return g; };
  P.jar = (x, y, s, col = '#a0603a') => { const id = uid('jr'); return `<g transform="translate(${f(x)},${f(y)}) scale(${fs(s)})"><defs>${LG(id, [[0, shade(col, -0.35)], [0.4, shade(col, 0.12)], [1, shade(col, -0.45)]], 0, 0, 1, 0)}</defs><path d="M-40,0 C-90,-40 -90,-160 -40,-200 L-30,-230 L30,-230 L40,-200 C90,-160 90,-40 40,0Z" fill="url(#${id})" ${ol(1.4)}/><ellipse cx="0" cy="-230" rx="32" ry="8" fill="${shade(col, -0.4)}" ${ol(1)}/><path d="M-70,-110 Q0,-90 70,-110" stroke="${shade(col, -0.4)}" stroke-width="3" fill="none" opacity="0.6"/></g>`; };
  P.spiceCone = (x, y, s, col) => `<g transform="translate(${f(x)},${f(y)}) scale(${fs(s)})"><ellipse cx="0" cy="0" rx="70" ry="18" fill="#6a4a2a" ${ol(1.2)}/><path d="M-60,-4 Q0,-120 60,-4Z" fill="${col}" ${ol(1.2)}/><path d="M-20,-60 Q0,-80 20,-60" stroke="#fff" stroke-width="3" opacity="0.3" fill="none"/></g>`;
  P.mat = (x, y, w, h, col = '#b89a5a') => { let g = `<rect x="${f(x - w / 2)}" y="${f(y - h / 2)}" width="${f(w)}" height="${f(h)}" rx="10" fill="${col}" ${ol(1.4)}/>`; for (let i = 1; i < 10; i++) g += `<path d="M${f(x - w / 2 + i * w / 10)},${f(y - h / 2)} l0,${f(h)}" stroke="${shade(col, -0.3)}" stroke-width="2" opacity="0.5"/>`; return g; };
})(window);
