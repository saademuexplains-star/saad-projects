// Props for "The First Vaccine": the lancet, leather straps, the boy's close-up forearm (cuts, pus, scars, a sore that
// tries to form), the boy's seated legs, the oak surgeon's chair, a Gloucester cow with cowpox on her udder, the pail,
// the doctor's case book, and the world inside the blood (red cells, white cells, antibodies, brick-shaped pox particles).
(function (G) {
  const P = G.PROPS, R = G.RIG, { f, shade, mix, rng, uid, ol, NS } = R;
  const lerp = (a, b, t) => a + (b - a) * t, cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));

  // ---------------- the lancet (grip frame): tortoiseshell scales through the fist, the steel blade out of the thumb side.
  // o.size = hand size (the prop scales with the hand), o.blood / o.pus / o.matter 0..1 on the blade, o.glint 0..1 along it
  P.LANCET_TIP = [128, 0];
  const BLADE = 'M34,-6 C66,-9 102,-7 128,0 C102,7 66,9 34,6Z';
  P.lancetG = (o = {}) => {
    const id = uid('lc'), k = (o.size || 116) / 116, r = rng(5);
    let g = `<defs><linearGradient id="${id}s" gradientUnits="userSpaceOnUse" x1="0" y1="-8" x2="0" y2="8"><stop offset="0" stop-color="#f2f6f8"/><stop offset="0.42" stop-color="#a8b2ba"/><stop offset="0.58" stop-color="#5a646c"/><stop offset="1" stop-color="#ccd4da"/></linearGradient>` +
      `<linearGradient id="${id}h" gradientUnits="userSpaceOnUse" x1="0" y1="-11" x2="0" y2="11"><stop offset="0" stop-color="#9a6a32"/><stop offset="0.45" stop-color="#5a3212"/><stop offset="1" stop-color="#2a1406"/></linearGradient>` +
      `<clipPath id="${id}c"><path d="${BLADE}"/></clipPath><clipPath id="${id}k"><path d="M-80,-10 C-88,-6 -88,6 -80,10 L28,9 C35,8 36,-8 28,-9Z"/></clipPath></defs>`;
    // tortoiseshell scales with amber mottling
    g += `<path d="M-80,-10 C-88,-6 -88,6 -80,10 L28,9 C35,8 36,-8 28,-9Z" fill="url(#${id}h)" ${ol(1.2)}/>`;
    let mot = ''; for (let i = 0; i < 14; i++) mot += `<ellipse cx="${f(-76 + r() * 100)}" cy="${f((r() - 0.5) * 12)}" rx="${f(4 + r() * 7)}" ry="${f(2 + r() * 3)}" fill="${['#c8843a', '#e0a050', '#3a1a08'][i % 3]}" opacity="${f(0.35 + r() * 0.3)}"/>`;
    g += `<g clip-path="url(#${id}k)">${mot}</g><path d="M-78,-6 L26,-6" stroke="#ffe0b0" stroke-width="1.6" opacity="0.4"/>`;
    // brass bolster and pivot rivet
    g += `<rect x="24" y="-9.5" width="12" height="19" rx="2" fill="#c8a040" ${ol(1)}/><rect x="25" y="-8" width="10" height="4" fill="#fff0b0" opacity="0.5"/><circle cx="-70" cy="0" r="3" fill="#d8b860" ${ol(0.8)}/>`;
    // the blade: polished steel with a centre ridge
    g += `<path d="${BLADE}" fill="url(#${id}s)" ${ol(1)}/><path d="M38,0 L124,0" stroke="#ffffff" stroke-width="1.2" opacity="0.55"/>`;
    let on = '';
    if (o.blood) on += `<path d="M${f(128 - 30 * o.blood)},-10 L132,-10 L132,10 L${f(124 - 22 * o.blood)},10Z" fill="#7a0a08" opacity="${f(0.9 * Math.min(1, o.blood * 1.6))}"/><path d="M${f(118 - 46 * o.blood)},4 L126,1" stroke="#8a0a08" stroke-width="2" opacity="${f(0.7 * Math.min(1, o.blood * 1.6))}"/><path d="M${f(120 - 20 * o.blood)},-3 L127,-1" stroke="#e05a4a" stroke-width="1.2" opacity="0.5"/>`;
    if (o.pus) on += `<ellipse cx="108" cy="1" rx="${f(20 * o.pus)}" ry="${f(6.5 * o.pus)}" fill="#dcc050" stroke="#a8862a" stroke-width="1" opacity="0.95"/><ellipse cx="104" cy="-1.5" rx="${f(8 * o.pus)}" ry="${f(2 * o.pus)}" fill="#fff4b8" opacity="0.7"/>`;
    if (o.matter) { const rm = rng(9); for (let i = 0; i < 7; i++) { const x = 96 + rm() * 28, y = (rm() - 0.5) * 8, s2 = (3 + rm() * 4) * o.matter; on += `<path d="M${f(x - s2)},${f(y)} L${f(x)},${f(y - s2 * 0.8)} L${f(x + s2)},${f(y + s2 * 0.2)} L${f(x)},${f(y + s2)}Z" fill="${['#b8a46a', '#8a7448', '#d8c890'][i % 3]}" ${ol(0.6)}/>`; } }
    if (on) g += `<g clip-path="url(#${id}c)">${on}</g>`;
    if (o.glint !== undefined && o.glint !== null) { const gx = 40 + 86 * o.glint; g += `<ellipse cx="${f(gx)}" cy="-2" rx="16" ry="3" fill="#ffffff" opacity="${f(0.85 * Math.sin(Math.PI * cl(o.glint)))}" filter="url(#b2)"/>`; }
    return k === 1 ? g : `<g transform="scale(${f(k)})">${g}</g>`;
  };

  // ---------------- a leather strap across a limb (centre x, y; len across the limb, width w, angle of the band).
  // The band is shaded as if wrapped around a cylinder; a brass buckle and the strap's tail sit at the +len end.
  P.strap = (x, y, len, w, ang, o = {}) => {
    const col = o.col || '#5a3418', id = uid('sp'), tail = o.tail ?? 1;
    let g = `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(col, 0.25)}"/><stop offset="0.35" stop-color="${col}"/><stop offset="1" stop-color="${shade(col, -0.45)}"/></linearGradient></defs>`;
    g += `<path d="M${f(-len / 2)},${f(-w / 2)} Q0,${f(-w / 2 - w * 0.25)} ${f(len / 2)},${f(-w / 2)} L${f(len / 2)},${f(w / 2)} Q0,${f(w / 2 - w * 0.25)} ${f(-len / 2)},${f(w / 2)}Z" fill="url(#${id})" ${ol(1.4)}/>`;
    g += `<path d="M${f(-len / 2 + 6)},${f(-w * 0.3)} Q0,${f(-w * 0.55)} ${f(len / 2 - 6)},${f(-w * 0.3)} M${f(-len / 2 + 6)},${f(w * 0.3)} Q0,${f(w * 0.05)} ${f(len / 2 - 6)},${f(w * 0.3)}" stroke="#e8c890" stroke-width="${f(Math.max(1, w * 0.04))}" stroke-dasharray="${f(w * 0.14)} ${f(w * 0.12)}" fill="none" opacity="0.55"/>`;
    // buckle frame, prong, and the tail running on past it with punched holes
    const bx = len / 2 - w * 0.2, bw = w * 0.55, bh = w * 1.15;
    if (tail > 0) { g += `<path d="M${f(bx)},${f(-w * 0.42)} L${f(bx + w * 1.6 * tail)},${f(-w * 0.36)} Q${f(bx + w * 1.85 * tail)},0 ${f(bx + w * 1.6 * tail)},${f(w * 0.36)} L${f(bx)},${f(w * 0.42)}Z" fill="${shade(col, -0.1)}" ${ol(1.2)}/>`; for (let i = 0; i < 3; i++) g += `<circle cx="${f(bx + w * (0.5 + i * 0.36) * tail)}" cy="0" r="${f(w * 0.06)}" fill="#1a0c04"/>`; }
    g += `<rect x="${f(bx - bw / 2)}" y="${f(-bh / 2)}" width="${f(bw)}" height="${f(bh)}" rx="${f(w * 0.12)}" fill="none" stroke="#c8a040" stroke-width="${f(w * 0.13)}"/><rect x="${f(bx - bw / 2)}" y="${f(-bh / 2)}" width="${f(bw)}" height="${f(bh)}" rx="${f(w * 0.12)}" fill="none" stroke="#2a1a06" stroke-width="1" opacity="0.7"/>` +
      `<path d="M${f(bx - bw / 2)},0 L${f(bx + bw * 0.4)},0" stroke="#d8b860" stroke-width="${f(w * 0.08)}" stroke-linecap="round"/><path d="M${f(bx - bw / 2 + 2)},${f(-bh / 2 + 3)} L${f(bx + bw / 2 - 2)},${f(-bh / 2 + 3)}" stroke="#fff4c0" stroke-width="${f(w * 0.04)}" opacity="0.6"/>`;
    g += `<ellipse cx="0" cy="${f(w * 0.62)}" rx="${f(len * 0.46)}" ry="${f(w * 0.16)}" fill="#1a0a04" opacity="0.3" filter="url(#b2)"/>`;
    return `<g transform="translate(${f(x)},${f(y)}) rotate(${f(ang)})">${g}</g>`;
  };

  // ---------------- the boy's forearm in close-up, palm up, from the elbow (off-frame along -x) to the wrist at (x, y),
  // rotated by ang (deg). w = thickness at the wrist, L = visible length.
  // o.cuts: [{ u (0 wrist .. 1 elbow), v (-0.5 .. 0.5 across), len, a (deg), draw 0..1, open 0..1, blood 0..1, pus 0..1, matter 0..1 }]
  // o.marks: older cuts [{ u, v, len, a, age 0 fresh .. 1 healed scar }]; o.scab: { u, v, k } the healed cowpox pock;
  // o.sore: { u, v, k } redness and swelling trying to form; o.hand: { size, pose, rot } (fingers relaxed, palm up)
  P.foreClose = (o) => {
    const id = uid('fc'), skin = o.skin || '#f0c8a8', w = o.w, L = o.L || 1400, sl = o.sleeve || '#e8e2d2';
    // a child's forearm: a narrow wrist, the forearm swelling toward the elbow, the muscle belly on the thumb side
    const hw = s => (w / 2) * (1 + 0.62 * s - 0.28 * s * s + 0.1 * Math.exp(-Math.pow((s - 0.62) / 0.2, 2)) - 0.06 * Math.exp(-Math.pow(s / 0.05, 2)));
    const N = 24, top = [], bot = [];
    for (let i = 0; i <= N; i++) { const s = i / N, x = -s * L; top.push([x, -hw(s) * (1 + 0.07 * Math.exp(-Math.pow((s - 0.55) / 0.22, 2)))]); bot.push([x, hw(s) * (0.93 + 0.04 * Math.sin(Math.PI * s))]); }
    const pts = top.concat(bot.reverse()).map(p => `${f(p[0])},${f(p[1])}`).join(' L');
    const P0 = (u, v) => [-u * L, v * 2 * hw(u)];
    let g = `<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="${f(-w * 0.7)}" x2="0" y2="${f(w * 0.7)}"><stop offset="0" stop-color="${shade(skin, -0.42)}"/><stop offset="0.18" stop-color="${shade(skin, -0.08)}"/><stop offset="0.36" stop-color="${shade(skin, 0.1)}"/><stop offset="0.6" stop-color="${skin}"/><stop offset="0.82" stop-color="${shade(skin, -0.22)}"/><stop offset="1" stop-color="${shade(skin, -0.5)}"/></linearGradient><clipPath id="${id}c"><path d="M${pts}Z"/></clipPath></defs>`;
    // contact shadow on the board under the arm
    g += `<path d="M${pts}Z" fill="#140804" opacity="0.5" transform="translate(${f(w * 0.06)},${f(w * 0.12)})" filter="url(#b8)"/>`;
    g += `<path d="M${pts}Z" fill="url(#${id})" ${ol(2)}/>`;
    let ins = '';
    // veins (faint blue-green), the two tendons and the creases at the wrist, a soft highlight down the middle
    ins += `<path d="M${f(-L)},${f(-w * 0.05)} C${f(-L * 0.7)},${f(-w * 0.18)} ${f(-L * 0.45)},${f(w * 0.06)} ${f(-L * 0.2)},${f(-w * 0.04)} C${f(-L * 0.1)},${f(-w * 0.08)} ${f(-w * 0.6)},${f(w * 0.02)} 0,${f(-w * 0.06)} M${f(-L * 0.62)},${f(-w * 0.12)} C${f(-L * 0.5)},${f(w * 0.2)} ${f(-L * 0.3)},${f(w * 0.24)} ${f(-L * 0.12)},${f(w * 0.2)}" stroke="#5a7a8a" stroke-width="${f(w * 0.045)}" fill="none" opacity="0.22" filter="url(#b2)"/>`;
    ins += `<path d="M${f(-w * 1.6)},${f(-w * 0.12)} L0,${f(-w * 0.1)} M${f(-w * 1.5)},${f(w * 0.12)} L0,${f(w * 0.1)}" stroke="#fff6ee" stroke-width="${f(w * 0.05)}" opacity="0.28" filter="url(#b2)"/>`;
    ins += `<path d="M${f(-w * 0.08)},${f(-w * 0.34)} q${f(-w * 0.05)},${f(w * 0.34)} 0,${f(w * 0.68)} M${f(-w * 0.2)},${f(-w * 0.3)} q${f(-w * 0.04)},${f(w * 0.3)} 0,${f(w * 0.6)}" stroke="${shade(skin, -0.38)}" stroke-width="${f(Math.max(1.2, w * 0.012))}" fill="none" opacity="0.55"/>`;
    ins += `<path d="M${f(-L)},${f(-w * 0.2)} L0,${f(-w * 0.18)}" stroke="#fff8f0" stroke-width="${f(w * 0.22)}" opacity="0.12" filter="url(#b8)"/>`;
    // the groove between the muscle bellies, the bony bump at the wrist, fine downy hair
    ins += `<path d="M${f(-L)},${f(w * 0.08)} C${f(-L * 0.6)},${f(w * 0.12)} ${f(-L * 0.3)},${f(w * 0.02)} ${f(-w * 1.4)},${f(w * 0.02)}" stroke="${shade(skin, -0.35)}" stroke-width="${f(w * 0.12)}" fill="none" opacity="0.22" filter="url(#b8)"/><ellipse cx="${f(-w * 0.45)}" cy="${f(w * 0.36)}" rx="${f(w * 0.22)}" ry="${f(w * 0.1)}" fill="#fff6ee" opacity="0.25" filter="url(#b2)"/>`;
    { const rh = rng(55); for (let i = 0; i < 90; i++) { const u = 0.04 + rh() * 0.9, p = P0(u, (rh() - 0.5) * 0.85), a2 = (rh() - 0.5) * 0.5; ins += `<path d="M${f(p[0])},${f(p[1])} l${f(-Math.cos(a2) * 7)},${f(Math.sin(a2) * 7)}" stroke="#8a5a3a" stroke-width="0.9" opacity="0.22"/>`; } }
    const fr = rng(31); for (let i = 0; i < 40; i++) { const u = fr(), p = P0(u, (fr() - 0.5) * 0.8); ins += `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="${f(w * (0.004 + fr() * 0.006))}" fill="#a06a50" opacity="0.25"/>`; }
    // the healed cowpox pock from the first cut: a brown crusted scab in a pink ring
    if (o.scab && o.scab.k > 0) { const [sx, sy] = P0(o.scab.u, o.scab.v), sr = w * 0.12, k = o.scab.k;
      ins += `<g opacity="${f(k)}"><circle cx="${f(sx)}" cy="${f(sy)}" r="${f(sr * 1.7)}" fill="#d87a6a" opacity="0.45" filter="url(#b4)"/><circle cx="${f(sx)}" cy="${f(sy)}" r="${f(sr)}" fill="#7a3a1e" stroke="#4a1e0c" stroke-width="2"/>` +
        `<path d="M${f(sx - sr)},${f(sy)} L${f(sx - sr * 0.5)},${f(sy - sr * 0.9)} L${f(sx + sr * 0.4)},${f(sy - sr * 1.05)} L${f(sx + sr * 1.05)},${f(sy - sr * 0.2)} L${f(sx + sr * 0.7)},${f(sy + sr * 0.85)} L${f(sx - sr * 0.3)},${f(sy + sr)}Z" fill="#5a2410" stroke="#2a0e04" stroke-width="2"/><path d="M${f(sx - sr * 0.6)},${f(sy - sr * 0.2)} q${f(sr * 0.4)},${f(-sr * 0.5)} ${f(sr * 1.1)},${f(-sr * 0.1)} M${f(sx - sr * 0.4)},${f(sy + sr * 0.4)} q${f(sr * 0.5)},${f(-sr * 0.2)} ${f(sr)},${f(sr * 0.1)}" stroke="#a8603a" stroke-width="2" fill="none"/><ellipse cx="${f(sx - sr * 0.3)}" cy="${f(sy - sr * 0.4)}" rx="${f(sr * 0.35)}" ry="${f(sr * 0.15)}" fill="#e8b08a" opacity="0.5"/></g>`; }
    // the sore that tries to form: inflamed pink-red skin, a slight swelling with a glossy top
    if (o.sore && o.sore.k > 0.001) { const [sx, sy] = P0(o.sore.u, o.sore.v), k = o.sore.k;
      ins += `<ellipse cx="${f(sx)}" cy="${f(sy)}" rx="${f(w * 0.42 * (0.6 + 0.4 * k))}" ry="${f(w * 0.3 * (0.6 + 0.4 * k))}" fill="#d0402e" opacity="${f(0.5 * k)}" filter="url(#b8)"/><ellipse cx="${f(sx)}" cy="${f(sy)}" rx="${f(w * 0.2)}" ry="${f(w * 0.13)}" fill="#e86a58" opacity="${f(0.55 * k)}" filter="url(#b2)"/><ellipse cx="${f(sx - w * 0.05)}" cy="${f(sy - w * 0.05)}" rx="${f(w * 0.08)}" ry="${f(w * 0.03)}" fill="#fff" opacity="${f(0.4 * k)}" filter="url(#b2)"/>`; }
    // older cuts: fresh ones are red with a bead of blood, healed ones fade to raised pink scars
    for (const m of (o.marks || [])) { const [mx, my] = P0(m.u, m.v), a = (m.a || 0) * Math.PI / 180, dx = Math.cos(a) * m.len / 2, dy = Math.sin(a) * m.len / 2, age = cl(m.age ?? 1);
      ins += `<path d="M${f(mx - dx)},${f(my - dy)} L${f(mx + dx)},${f(my + dy)}" stroke="${mix('#8a1410', '#e8a898', age)}" stroke-width="${f(lerp(4, 6, age))}" stroke-linecap="round" opacity="${f(lerp(0.95, 0.7, age))}"/><path d="M${f(mx - dx)},${f(my - dy - 2)} L${f(mx + dx)},${f(my + dy - 2)}" stroke="#fff4ee" stroke-width="1.5" stroke-linecap="round" opacity="${f(0.4 * age)}"/>`;
      if (age < 0.5) ins += `<circle cx="${f(mx + dx * 0.2)}" cy="${f(my + dy * 0.2 + 4)}" r="${f(6 * (1 - age * 2))}" fill="#9a0c0a"/>`; }
    g += `<g clip-path="url(#${id}c)">${ins}</g>`;
    // the fresh cuts
    let cuts = '';
    for (const c of (o.cuts || [])) {
      const [cx, cy] = P0(c.u, c.v), a = (c.a || 0) * Math.PI / 180, ux = Math.cos(a), uy = Math.sin(a), nx = -uy, ny = ux;
      const d = cl(c.draw ?? 1), L0 = c.len * d; if (L0 < 1) continue;
      const x0 = cx - ux * c.len / 2, y0 = cy - uy * c.len / 2, x1 = x0 + ux * L0, y1 = y0 + uy * L0, mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
      const op = 2 + 19 * cl(c.open || 0);
      const lens = `M${f(x0)},${f(y0)} Q${f(mx + nx * op)},${f(my + ny * op)} ${f(x1)},${f(y1)} Q${f(mx - nx * op)},${f(my - ny * op)} ${f(x0)},${f(y0)}Z`;
      // swollen pink lips, the dark wound, a wet red edge
      cuts += `<path d="${lens}" fill="none" stroke="#e8907e" stroke-width="${f(6 + op * 0.6)}" opacity="0.55" filter="url(#b2)"/>`;
      const lensIn = `M${f(x0 + ux * 4)},${f(y0 + uy * 4)} Q${f(mx + nx * op * 0.55)},${f(my + ny * op * 0.55)} ${f(x1 - ux * 4)},${f(y1 - uy * 4)} Q${f(mx - nx * op * 0.55)},${f(my - ny * op * 0.55)} ${f(x0 + ux * 4)},${f(y0 + uy * 4)}Z`;
      cuts += `<path d="${lens}" fill="#c8483a"/><path d="${lensIn}" fill="#4a0604"/><path d="M${f(x0)},${f(y0)} Q${f(mx + nx * op * 0.7)},${f(my + ny * op * 0.7)} ${f(x1)},${f(y1)}" stroke="#c02a1e" stroke-width="2.5" fill="none"/><path d="M${f(x0)},${f(y0)} Q${f(mx - nx * op * 0.9)},${f(my - ny * op * 0.9)} ${f(x1)},${f(y1)}" stroke="#ff8a7a" stroke-width="1.5" fill="none" opacity="0.6"/>`;
      // blood: beads welling along the cut, then a trickle running off the lower side of the arm
      const b = cl(c.blood || 0);
      if (b > 0) {
        const rb = rng(17); for (let i = 0; i < 6; i++) { const u = (i + 0.5) / 6; if (u > d) continue; const bx = x0 + ux * c.len * u + nx * (rb() - 0.5) * op, by = y0 + uy * c.len * u + ny * (rb() - 0.5) * op, r0 = (4 + rb() * 6) * cl(b * 2 - i * 0.12); if (r0 > 0.5) cuts += `<circle cx="${f(bx)}" cy="${f(by)}" r="${f(r0)}" fill="#a00c0a"/><circle cx="${f(bx - r0 * 0.3)}" cy="${f(by - r0 * 0.35)}" r="${f(r0 * 0.3)}" fill="#ff9a8a" opacity="0.7"/>`; }
        const tr = cl((b - 0.35) / 0.65); if (tr > 0) { const tx = x0 + ux * c.len * 0.12 + nx * 3, ty = y0 + uy * c.len * 0.12 + ny * 3, ex = tx + nx * w * 0.32 * tr - ux * w * 1.05 * tr, ey = ty + ny * w * 0.32 * tr - uy * w * 1.05 * tr;
          const m1 = [tx + nx * w * 0.35 * tr + ux * 10, ty + ny * w * 0.35 * tr + uy * 10];
          cuts += `<path d="M${f(tx - ux * 9)},${f(ty - uy * 9)} C${f(m1[0] - ux * 8)},${f(m1[1] - uy * 8)} ${f(ex - ux * 7)},${f(ey - uy * 7)} ${f(ex - ux * 7 + nx * 4)},${f(ey - uy * 7 + ny * 4)} A7.5,7.5 0 1 0 ${f(ex + ux * 7 + nx * 4)},${f(ey + uy * 7 + ny * 4)} C${f(ex + ux * 5)},${f(ey + uy * 5)} ${f(m1[0] + ux * 3)},${f(m1[1] + uy * 3)} ${f(tx + ux * 9)},${f(ty + uy * 9)}Z" fill="#8a0a08"/><path d="M${f(tx)},${f(ty)} C${f(m1[0])},${f(m1[1])} ${f(ex)},${f(ey)} ${f(ex)},${f(ey)}" stroke="#c02a1e" stroke-width="2" fill="none" opacity="0.6"/><circle cx="${f(ex + nx * 4 - ux * 2)}" cy="${f(ey + ny * 4 - uy * 2)}" r="2.4" fill="#ff9a8a" opacity="0.7"/>`; }
      }
      // cowpox pus: a thick creamy yellow smear worked into the cut
      if (c.pus) { const pk = cl(c.pus), rp = rng(23); let d = ''; const N2 = 14;
        for (let i = 0; i <= N2; i++) { const a2 = i / N2 * Math.PI * 2, rr = (0.62 + 0.07 * Math.sin(a2 * 3 + 1) + 0.04 * Math.sin(a2 * 5)) , px = mx + ux * Math.cos(a2) * c.len * 0.62 * rr + nx * Math.sin(a2) * (op + 16) * rr * 1.3, py = my + uy * Math.cos(a2) * c.len * 0.62 * rr + ny * Math.sin(a2) * (op + 16) * rr * 1.3; d += (i ? ' L' : 'M') + f(px) + ',' + f(py); }
        cuts += `<g opacity="${f(pk)}"><path d="${d}Z" fill="#d6b844" stroke="#9a7a22" stroke-width="1.4" stroke-linejoin="round"/><path d="${d}Z" fill="#f0dc80" opacity="0.5" transform="translate(${f(-nx * 3)},${f(-ny * 3)}) scale(1)"/>` + [0.3, 0.55, 0.75].map(k => { const px = x0 + ux * c.len * k - nx * 4, py = y0 + uy * c.len * k - ny * 4; return `<ellipse cx="${f(px)}" cy="${f(py)}" rx="6" ry="2.4" transform="rotate(${f((c.a || 0) + Math.atan2(uy, ux) * 0)} ${f(px)} ${f(py)})" fill="#fffbe0" opacity="0.8"/>`; }).join('') + `<path d="M${f(mx)},${f(my)} q${f(nx * 6)},${f(ny * 6)} ${f(nx * 2 + ux * 10)},${f(ny * 2 + uy * 10)}" stroke="#a8201a" stroke-width="3" fill="none" opacity="0.6"/></g>`; }
      // smallpox matter: grey-yellow crust flakes pressed into the cut
      if (c.matter) { const pk = cl(c.matter), rm = rng(41); cuts += `<g opacity="${f(pk)}">`; for (let i = 0; i < 9; i++) { const u = 0.1 + rm() * 0.8, px = x0 + ux * c.len * u + nx * (rm() - 0.5) * 12, py = y0 + uy * c.len * u + ny * (rm() - 0.5) * 12, s2 = 4 + rm() * 6; cuts += `<path d="M${f(px - s2)},${f(py)} L${f(px)},${f(py - s2 * 0.8)} L${f(px + s2)},${f(py + s2 * 0.3)} L${f(px - s2 * 0.2)},${f(py + s2)}Z" fill="${['#b8a46a', '#8a7448', '#cfc090'][i % 3]}" ${ol(0.7)}/>`; } cuts += `</g>`; }
    }
    g += cuts;
    // the rolled linen sleeve at the elbow end
    const ex = -L, eh = hw(1) * 1.25;
    g += `<path d="M${f(ex - 260)},${f(-eh * 1.15)} L${f(ex + 40)},${f(-eh * 1.08)} C${f(ex + 70)},${f(-eh * 0.5)} ${f(ex + 70)},${f(eh * 0.5)} ${f(ex + 40)},${f(eh * 1.08)} L${f(ex - 260)},${f(eh * 1.15)}Z" fill="${sl}" ${ol(2)} filter="url(#cloth)"/>` +
      [-0.6, -0.15, 0.3, 0.7].map(k => `<path d="M${f(ex + 50)},${f(eh * k)} C${f(ex - 20)},${f(eh * k + 14)} ${f(ex - 120)},${f(eh * k - 10)} ${f(ex - 240)},${f(eh * k + 6)}" stroke="${shade(sl, -0.35)}" stroke-width="5" fill="none" opacity="0.5" filter="url(#b2)"/>`).join('') +
      `<path d="M${f(ex + 40)},${f(-eh * 1.08)} C${f(ex + 70)},${f(-eh * 0.5)} ${f(ex + 70)},${f(eh * 0.5)} ${f(ex + 40)},${f(eh * 1.08)}" stroke="${shade(sl, -0.45)}" stroke-width="8" fill="none" opacity="0.6"/>`;
    // the hand, palm up, fingers relaxed; it trembles a little
    const H = o.hand || {}, hs = H.size || w * 2.3;
    const hand = R.hand({ x: 0, y: 0, dir: [Math.cos((H.rot || 0) * Math.PI / 180), Math.sin((H.rot || 0) * Math.PI / 180)], side: 'L', facing: 'palm', pose: H.pose || 'relaxed', size: hs, skin });
    g += hand;
    if (o.strap) g += P.strap(-w * 0.62, 0, w * 1.5, w * 0.34, 90, { tail: o.strapTail ?? 1 });
    return `<g transform="translate(${f(o.x)},${f(o.y)}) rotate(${f(o.ang || 0)})" filter="url(#skinS)">${g}</g>`;
  };

  // ---------------- a seated child's legs seen from the front: breeches knees over the seat edge, buttoned knee bands,
  // stockinged shins hanging to buckled shoes. cx: body centre, seatY: seat front line, floorY: the floor, s: rig scale
  P.kidLegs = (cx, seatY, floorY, s, o = {}) => {
    const br = o.breeches || '#6a5440', st = o.stock || '#e8e2d4', sh = o.shoe || '#2a1e14', id = uid('kl');
    let g = `<defs><linearGradient id="${id}s" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${shade(st, -0.35)}"/><stop offset="0.45" stop-color="${st}"/><stop offset="1" stop-color="${shade(st, -0.4)}"/></linearGradient>` +
      `<radialGradient id="${id}k" cx="45%" cy="35%" r="70%"><stop offset="0" stop-color="${shade(br, 0.22)}"/><stop offset="0.7" stop-color="${br}"/><stop offset="1" stop-color="${shade(br, -0.4)}"/></radialGradient></defs>`;
    for (const k of [-1, 1]) {
      const kx = cx + k * 50 * s, kneeY = seatY + 30 * s, ax = cx + k * (40 + (o.splay || 0)) * s + (o.swing ? o.swing * k * s : 0), ay = floorY - 34 * s;
      // shin with a calf curve
      g += `<path d="M${f(kx - 30 * s)},${f(kneeY)} C${f(kx - 36 * s)},${f(kneeY + 80 * s)} ${f(ax - 26 * s)},${f(ay - 90 * s)} ${f(ax - 19 * s)},${f(ay)} L${f(ax + 19 * s)},${f(ay)} C${f(ax + 26 * s)},${f(ay - 90 * s)} ${f(kx + 36 * s)},${f(kneeY + 80 * s)} ${f(kx + 30 * s)},${f(kneeY)}Z" fill="url(#${id}s)" ${ol(1.3)}/>`;
      g += `<path d="M${f(kx - 8 * s)},${f(kneeY + 40 * s)} L${f(ax - 4 * s)},${f(ay - 20 * s)}" stroke="#fff" stroke-width="${f(5 * s)}" opacity="0.18" filter="url(#b2)"/>`;
      // shoe: a rounded toe pointing at us, a tongue and a square brass buckle
      g += `<path d="M${f(ax - 30 * s)},${f(ay + 4 * s)} C${f(ax - 34 * s)},${f(ay + 34 * s)} ${f(ax + 34 * s)},${f(ay + 34 * s)} ${f(ax + 30 * s)},${f(ay + 4 * s)} C${f(ax + 24 * s)},${f(ay - 10 * s)} ${f(ax - 24 * s)},${f(ay - 10 * s)} ${f(ax - 30 * s)},${f(ay + 4 * s)}Z" fill="${sh}" ${ol(1.2)}/><ellipse cx="${f(ax - 8 * s)}" cy="${f(ay + 16 * s)}" rx="${f(10 * s)}" ry="${f(4 * s)}" fill="#fff" opacity="0.2"/>` +
        `<rect x="${f(ax - 13 * s)}" y="${f(ay - 6 * s)}" width="${f(26 * s)}" height="${f(16 * s)}" rx="${f(3 * s)}" fill="none" stroke="#d8b050" stroke-width="${f(4 * s)}"/>`;
      // the knee of the breeches, foreshortened toward us, with its band and three buttons on the outer side
      g += `<ellipse cx="${f(kx)}" cy="${f(seatY + 2 * s)}" rx="${f(50 * s)}" ry="${f(42 * s)}" fill="url(#${id}k)" ${ol(1.4)}/>`;
      g += `<path d="M${f(kx - 40 * s)},${f(seatY + 26 * s)} Q${f(kx)},${f(seatY + 46 * s)} ${f(kx + 40 * s)},${f(seatY + 26 * s)}" stroke="${shade(br, -0.35)}" stroke-width="${f(10 * s)}" fill="none"/>` + [0, 1, 2].map(i => `<circle cx="${f(kx + k * (30 - i * 2) * s)}" cy="${f(seatY + (2 + i * 10) * s)}" r="${f(3.6 * s)}" fill="#c8a050" ${ol(0.6)}/>`).join('');
      g += `<path d="M${f(kx - 28 * s)},${f(seatY - 20 * s)} Q${f(kx)},${f(seatY - 34 * s)} ${f(kx + 20 * s)},${f(seatY - 22 * s)}" stroke="#fff" stroke-width="${f(5 * s)}" fill="none" opacity="0.15"/>`;
    }
    return g;
  };

  // ---------------- the surgeon's oak chair, front view. cx centre, seatY = seat top, floorY = floor, s scale.
  // back: drawn behind the boy (uprights with finials, carved crest rail, vase splat); front: seat, front rail,
  // turned front legs and stretcher, the left armrest, and the arm board fixed to the right side.
  const OAK = ['#3a2210', '#7a4e28', '#5a3418', '#2a180a'];
  const oakG = (id, horiz) => `<linearGradient id="${id}" x1="0" y1="0" x2="${horiz ? 0 : 1}" y2="${horiz ? 1 : 0}"><stop offset="0" stop-color="${OAK[0]}"/><stop offset="0.35" stop-color="${OAK[1]}"/><stop offset="0.7" stop-color="${OAK[2]}"/><stop offset="1" stop-color="${OAK[3]}"/></linearGradient>`;
  P.chairBack = (cx, seatY, floorY, s) => {
    const id = uid('cb'), u = s;
    let g = `<defs>${oakG(id, false)}${oakG(id + 'h', true)}</defs>`;
    for (const k of [-1, 1]) { const x = cx + k * 176 * u; g += `<rect x="${f(x - 20 * u)}" y="${f(seatY - 640 * u)}" width="${f(40 * u)}" height="${f(640 * u + 40)}" fill="url(#${id})" ${ol(1.4)}/>` + [0.2, 0.5, 0.8].map(q => `<ellipse cx="${f(x)}" cy="${f(seatY - 640 * u * q)}" rx="${f(25 * u)}" ry="${f(9 * u)}" fill="${OAK[2]}" ${ol(1)}/>`).join('') +
      `<path d="M${f(x - 16 * u)},${f(seatY - 640 * u)} C${f(x - 22 * u)},${f(seatY - 676 * u)} ${f(x + 22 * u)},${f(seatY - 676 * u)} ${f(x + 16 * u)},${f(seatY - 640 * u)}Z" fill="${OAK[1]}" ${ol(1.2)}/><circle cx="${f(x)}" cy="${f(seatY - 690 * u)}" r="${f(15 * u)}" fill="${OAK[1]}" ${ol(1.2)}/><circle cx="${f(x - 5 * u)}" cy="${f(seatY - 695 * u)}" r="${f(5 * u)}" fill="#c89a60" opacity="0.6"/>`; }
    // crest rail with carved scrolls, a lower rail, the vase-shaped splat between them
    g += `<path d="M${f(cx - 176 * u)},${f(seatY - 600 * u)} C${f(cx - 100 * u)},${f(seatY - 660 * u)} ${f(cx + 100 * u)},${f(seatY - 660 * u)} ${f(cx + 176 * u)},${f(seatY - 600 * u)} L${f(cx + 176 * u)},${f(seatY - 540 * u)} C${f(cx + 100 * u)},${f(seatY - 590 * u)} ${f(cx - 100 * u)},${f(seatY - 590 * u)} ${f(cx - 176 * u)},${f(seatY - 540 * u)}Z" fill="url(#${id}h)" ${ol(1.4)}/>`;
    for (const k of [-1, 1]) g += `<path d="M${f(cx + k * 30 * u)},${f(seatY - 612 * u)} q${f(k * 30 * u)},${f(-24 * u)} ${f(k * 60 * u)},${f(-4 * u)} q${f(k * 14 * u)},${f(10 * u)} ${f(k * 2 * u)},${f(16 * u)}" stroke="${OAK[3]}" stroke-width="${f(5 * u)}" fill="none"/>`;
    g += `<path d="M${f(cx - 60 * u)},${f(seatY - 560 * u)} C${f(cx - 100 * u)},${f(seatY - 420 * u)} ${f(cx - 30 * u)},${f(seatY - 330 * u)} ${f(cx - 70 * u)},${f(seatY - 110 * u)} L${f(cx + 70 * u)},${f(seatY - 110 * u)} C${f(cx + 30 * u)},${f(seatY - 330 * u)} ${f(cx + 100 * u)},${f(seatY - 420 * u)} ${f(cx + 60 * u)},${f(seatY - 560 * u)}Z" fill="url(#${id})" ${ol(1.3)}/>`;
    g += `<rect x="${f(cx - 176 * u)}" y="${f(seatY - 120 * u)}" width="${f(352 * u)}" height="${f(30 * u)}" fill="url(#${id}h)" ${ol(1.2)}/>`;
    g += `<rect x="${f(cx - 176 * u)}" y="${f(seatY - 660 * u)}" width="${f(352 * u)}" height="${f(660 * u)}" fill="#3a2010" opacity="0.18" filter="url(#woodV)"/>`;
    return g;
  };
  P.ARMBOARD = { x1: 330, top: -150 };   // the arm board reaches cx + x1*s, its top at seatY + top*s
  P.chairFront = (cx, seatY, floorY, s, o = {}) => {
    const id = uid('cf'), u = s, ft = floorY;
    let g = `<defs>${oakG(id, false)}${oakG(id + 'h', true)}</defs>`;
    // back legs show between the front legs, the seat front rail, the stretcher
    g += `<rect x="${f(cx - 150 * u)}" y="${f(seatY + 40 * u)}" width="${f(300 * u)}" height="${f(24 * u)}" fill="${OAK[3]}" opacity="0.8"/>`;
    g += `<rect x="${f(cx - 168 * u)}" y="${f(ft - 140 * u)}" width="${f(336 * u)}" height="${f(22 * u)}" fill="url(#${id}h)" ${ol(1.2)}/>`;
    for (const k of [-1, 1]) { const x = cx + k * 176 * u; g += `<path d="M${f(x - 22 * u)},${f(seatY)} L${f(x + 22 * u)},${f(seatY)} L${f(x + 18 * u)},${f(ft - 16)} L${f(x - 18 * u)},${f(ft - 16)}Z" fill="url(#${id})" ${ol(1.4)}/>` + [0.3, 0.62].map(q => `<ellipse cx="${f(x)}" cy="${f(lerp(seatY, ft, q))}" rx="${f(27 * u)}" ry="${f(10 * u)}" fill="${OAK[2]}" ${ol(1)}/>`).join('') + `<rect x="${f(x - 24 * u)}" y="${f(ft - 22)}" width="${f(48 * u)}" height="22" rx="4" fill="${OAK[3]}" ${ol(1)}/>`; }
    g += `<path d="M${f(cx - 200 * u)},${f(seatY - 14 * u)} L${f(cx + 200 * u)},${f(seatY - 14 * u)} L${f(cx + 196 * u)},${f(seatY + 44 * u)} L${f(cx - 196 * u)},${f(seatY + 44 * u)}Z" fill="url(#${id}h)" ${ol(1.5)}/><path d="M${f(cx - 196 * u)},${f(seatY - 10 * u)} L${f(cx + 196 * u)},${f(seatY - 10 * u)}" stroke="#d8a868" stroke-width="${f(3 * u)}" opacity="0.5"/>`;
    g += `<path d="M${f(cx - 120 * u)},${f(seatY + 16 * u)} q${f(30 * u)},${f(12 * u)} ${f(60 * u)},0 q${f(30 * u)},${f(-12 * u)} ${f(60 * u)},0 q${f(30 * u)},${f(12 * u)} ${f(60 * u)},0 q${f(30 * u)},${f(-12 * u)} ${f(60 * u)},0" stroke="${OAK[3]}" stroke-width="${f(4 * u)}" fill="none" opacity="0.8"/>`;
    // the left armrest (screen left): a turned support and a broad arm ending in a carved scroll
    const ay = seatY - 150 * u, lx = cx - 196 * u;
    g += `<rect x="${f(lx - 14 * u)}" y="${f(ay)}" width="${f(30 * u)}" height="${f(150 * u)}" fill="url(#${id})" ${ol(1.2)}/><ellipse cx="${f(lx)}" cy="${f(ay + 70 * u)}" rx="${f(20 * u)}" ry="${f(8 * u)}" fill="${OAK[2]}" ${ol(1)}/>`;
    g += `<path d="M${f(lx - 40 * u)},${f(ay - 16 * u)} L${f(lx + 30 * u)},${f(ay - 16 * u)} L${f(lx + 34 * u)},${f(ay + 10 * u)} L${f(lx - 44 * u)},${f(ay + 10 * u)}Z" fill="url(#${id}h)" ${ol(1.3)}/><circle cx="${f(lx - 40 * u)}" cy="${f(ay - 3 * u)}" r="${f(14 * u)}" fill="${OAK[1]}" ${ol(1.2)}/><path d="M${f(lx - 44 * u)},${f(ay - 3 * u)} a${f(5 * u)},${f(5 * u)} 0 1 1 ${f(8 * u)},0" stroke="${OAK[3]}" stroke-width="${f(3 * u)}" fill="none"/>`;
    // the arm board on the right: a broad plank from the seat edge outwards, a bracket under it
    const bx0 = cx + 170 * u, bx1 = cx + P.ARMBOARD.x1 * u, by = seatY + P.ARMBOARD.top * u;
    g += `<path d="M${f(bx0)},${f(by + 26 * u)} L${f(bx0 + 70 * u)},${f(by + 26 * u)} L${f(bx0)},${f(by + 130 * u)}Z" fill="url(#${id})" ${ol(1.2)}/>`;
    g += `<path d="M${f(bx0 - 30 * u)},${f(by - 18 * u)} L${f(bx1)},${f(by - 22 * u)} L${f(bx1 + 4 * u)},${f(by + 6 * u)} L${f(bx0 - 30 * u)},${f(by + 10 * u)}Z" fill="#8a5a30" ${ol(1.3)}/><path d="M${f(bx0 - 30 * u)},${f(by + 10 * u)} L${f(bx1 + 4 * u)},${f(by + 6 * u)} L${f(bx1 + 2 * u)},${f(by + 30 * u)} L${f(bx0 - 30 * u)},${f(by + 34 * u)}Z" fill="url(#${id}h)" ${ol(1.3)}/>`;
    g += `<path d="M${f(bx0 - 20 * u)},${f(by - 12 * u)} L${f(bx1 - 6 * u)},${f(by - 16 * u)}" stroke="#c89a60" stroke-width="${f(2 * u)}" opacity="0.5"/>`;
    g += `<rect x="${f(cx - 210 * u)}" y="${f(ay - 20 * u)}" width="${f(560 * u)}" height="${f(ft - ay)}" fill="#3a2010" opacity="0.12" filter="url(#woodH)"/>`;
    return g;
  };

  // ---------------- a Gloucester cow (side view, facing left): deep mahogany-black coat, a white stripe along the spine,
  // white tail and belly, upturned pale horns. origin = ground under the middle of the body.
  // o.head (deg, + lowers the head), o.chew 0..1, o.pox 0..1 cowpox on the udder, o.lit 0..1 window light from the right
  P.cow = (x, y, s, t, o = {}) => {
    const id = uid('cw'), coat = '#3e2016', dk = '#1c0c06', wh = '#ece6da', pox = o.pox || 0;
    const breath = 1 + 0.012 * Math.sin(t * 1.7), sw = Math.sin(t * 2.1) * 7 + Math.sin(t * 3.3) * 3, chew = (o.chew ?? 1) * (0.5 + 0.5 * Math.sin(t * 7));
    const ear = 7 * Math.pow(Math.max(0, Math.sin(t * 1.3 - 1)), 8);
    let g = `<defs><radialGradient id="${id}b" cx="42%" cy="22%" r="85%"><stop offset="0" stop-color="${shade(coat, 0.38)}"/><stop offset="0.5" stop-color="${coat}"/><stop offset="1" stop-color="${dk}"/></radialGradient>` +
      `<linearGradient id="${id}l" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${dk}"/><stop offset="0.45" stop-color="${shade(coat, 0.16)}"/><stop offset="1" stop-color="${dk}"/></linearGradient>` +
      `<radialGradient id="${id}h" cx="55%" cy="30%" r="80%"><stop offset="0" stop-color="${shade(coat, 0.32)}"/><stop offset="0.6" stop-color="${coat}"/><stop offset="1" stop-color="${dk}"/></radialGradient>` +
      `<radialGradient id="${id}u" cx="45%" cy="30%" r="70%"><stop offset="0" stop-color="#f2c8b8"/><stop offset="0.7" stop-color="#d8988a"/><stop offset="1" stop-color="#a06258"/></radialGradient></defs>`;
    // legs: thick forearms and gaskins, bony knees and hocks, cloven hooves
    const leg = (x0, far) => { const c = far ? shade(coat, -0.4) : `url(#${id}l)`;
      return `<path d="M${x0 - 52},-345 C${x0 - 48},-255 ${x0 - 32},-205 ${x0 - 30},-168 C${x0 - 28},-124 ${x0 - 24},-84 ${x0 - 24},-50 L${x0 - 30},-16 L${x0 + 32},-16 L${x0 + 28},-50 C${x0 + 30},-92 ${x0 + 34},-128 ${x0 + 32},-172 C${x0 + 36},-212 ${x0 + 46},-272 ${x0 + 58},-335Z" fill="${c}" ${ol(1.6)}/>` +
        `<ellipse cx="${x0 + 2}" cy="-168" rx="30" ry="20" fill="${far ? shade(coat, -0.3) : shade(coat, 0.12)}" opacity="0.7"/><path d="M${x0 - 32},-18 L${x0 + 34},-18 L${x0 + 40},0 L${x0 - 38},0Z" fill="#141010" ${ol(1)}/><path d="M${x0 + 1},-18 L${x0 + 2},0" stroke="#3a3430" stroke-width="2.5"/><path d="M${x0 - 26},-30 L${x0 + 28},-30" stroke="#120806" stroke-width="5" opacity="0.6"/>`; };
    const hleg = (x0, far) => { const c = far ? shade(coat, -0.4) : `url(#${id}l)`;
      return `<path d="M${x0 - 90},-400 C${x0 - 64},-310 ${x0 - 8},-258 ${x0 + 8},-206 C${x0 + 14},-180 ${x0 + 10},-152 ${x0 + 4},-122 L${x0},-50 L${x0 - 6},-16 L${x0 + 50},-16 L${x0 + 48},-50 C${x0 + 52},-100 ${x0 + 58},-160 ${x0 + 66},-204 C${x0 + 76},-262 ${x0 + 100},-330 ${x0 + 108},-420Z" fill="${c}" ${ol(1.6)}/>` +
        `<ellipse cx="${x0 + 34}" cy="-206" rx="22" ry="16" fill="${far ? shade(coat, -0.3) : shade(coat, 0.12)}" opacity="0.6"/><path d="M${x0 - 8},-18 L${x0 + 52},-18 L${x0 + 58},0 L${x0 - 14},0Z" fill="#141010" ${ol(1)}/><path d="M${x0 + 22},-18 L${x0 + 23},0" stroke="#3a3430" stroke-width="2.5"/>`; };
    g += leg(-236, true) + hleg(262, true);
    // the white tail with its switch, swishing
    g += `<g transform="rotate(${f(sw * 0.6)},430,-596)"><path d="M430,-596 C454,-520 ${f(462 + sw)},-430 ${f(458 + sw * 1.4)},-320 C${f(458 + sw * 1.6)},-276 ${f(462 + sw * 2)},-244 ${f(466 + sw * 2.4)},-212" stroke="${dk}" stroke-width="17" fill="none" stroke-linecap="round"/><path d="M430,-596 C454,-520 ${f(462 + sw)},-430 ${f(458 + sw * 1.4)},-320" stroke="${wh}" stroke-width="8" fill="none" opacity="0.85"/>` +
      `<path d="M${f(458 + sw * 2.2)},-232 C${f(440 + sw * 2.4)},-190 ${f(446 + sw * 3)},-136 ${f(464 + sw * 3.2)},-108 C${f(484 + sw * 3.2)},-136 ${f(492 + sw * 2.8)},-190 ${f(476 + sw * 2.2)},-232Z" fill="${wh}" ${ol(1.2)}/>` + [0, 1, 2].map(i => `<path d="M${f(460 + sw * 2.4 + i * 6)},-222 q${f(-4 + sw * 0.3)},52 ${f(2 + sw * 0.5)},100" stroke="#b8b0a0" stroke-width="2" fill="none"/>`).join('') + `</g>`;
    // the body: deep barrel, sagging belly, hip bones and pins, ribs, the white line along the spine
    const body = `M-340,-500 C-300,-592 -200,-612 -60,-602 C80,-594 200,-608 300,-632 C352,-642 402,-622 432,-592 C462,-560 472,-470 454,-400 C442,-340 422,-290 382,-262 L300,-250 C200,-228 80,-218 -40,-228 C-160,-240 -262,-262 -312,-292 C-372,-322 -402,-382 -398,-432 C-394,-472 -372,-492 -340,-500Z`;
    let b = `<path d="${body}" fill="url(#${id}b)" ${ol(2)}/>`;
    b += `<path d="M-300,-574 C-200,-606 -60,-598 80,-594 C200,-598 300,-628 404,-620 C432,-614 440,-600 436,-592 C400,-606 300,-604 200,-588 C80,-578 -100,-576 -300,-556Z" fill="${wh}" opacity="0.92"/>`;
    b += `<path d="M-160,-246 C-40,-228 120,-222 300,-244 C220,-262 40,-266 -160,-262Z" fill="${shade(coat, -0.25)}" opacity="0.6"/>`;
    b += `<path d="M290,-626 q30,-14 52,4 M320,-560 q40,26 96,20 M404,-560 q24,30 22,70" stroke="${shade(coat, 0.35)}" stroke-width="5" fill="none" opacity="0.45"/>`;
    for (let i = 0; i < 6; i++) b += `<path d="M${-150 + i * 44},-500 q-16,90 4,190" stroke="${dk}" stroke-width="6" fill="none" opacity="0.28" filter="url(#b2)"/>`;
    b += `<path d="M-330,-470 C-300,-420 -296,-360 -320,-300" stroke="${dk}" stroke-width="8" fill="none" opacity="0.35" filter="url(#b2)"/>`;
    const rh = rng(7); for (let i = 0; i < 110; i++) { const hx = -370 + rh() * 820, hy = -590 + rh() * 330; b += `<path d="M${f(hx)},${f(hy)} l${f(-3 + rh() * 6)},${f(9 + rh() * 9)}" stroke="${shade(coat, 0.4)}" stroke-width="1.6" opacity="0.3"/>`; }
    b += `<path d="M-330,-520 C-260,-590 -60,-590 80,-590 C200,-594 300,-624 420,-610" stroke="#ffe0c0" stroke-width="6" fill="none" opacity="${f(0.15 + 0.3 * (o.lit || 0))}" filter="url(#b2)"/>`;
    g += `<g transform="translate(0,-420) scale(1,${f(breath)}) translate(0,420)">${b}</g>`;
    // the udder and teats; cowpox: red-ringed blisters, some burst into yellow crusts
    let ud = `<path d="M180,-252 C176,-196 212,-160 266,-158 C320,-160 350,-196 346,-252Z" fill="url(#${id}u)" ${ol(1.4)}/><path d="M204,-232 C226,-204 284,-198 326,-226" stroke="#b86a6a" stroke-width="2" fill="none" opacity="0.5"/><path d="M262,-244 L262,-172" stroke="#b07068" stroke-width="2" opacity="0.4"/>`;
    for (const [tx, far] of [[218, 1], [308, 1], [242, 0], [290, 0]]) ud += `<path d="M${tx - 10},-172 C${tx - 11},-150 ${tx - 9},-128 ${tx},-122 C${tx + 9},-128 ${tx + 11},-150 ${tx + 10},-172Z" fill="${far ? '#c08478' : '#e2aa9a'}" ${ol(1.1)}/>`;
    if (pox > 0) { const rp = rng(13); for (let i = 0; i < 10; i++) { const px = 200 + rp() * 128, py = -236 + rp() * 70, r0 = (5 + rp() * 5) * pox; ud += `<circle cx="${f(px)}" cy="${f(py)}" r="${f(r0 * 1.8)}" fill="#c8382a" opacity="0.45"/><circle cx="${f(px)}" cy="${f(py)}" r="${f(r0)}" fill="${i % 3 ? '#f0e0b0' : '#d8b848'}" stroke="#8a2a1a" stroke-width="1.2"/><circle cx="${f(px - r0 * 0.3)}" cy="${f(py - r0 * 0.3)}" r="${f(r0 * 0.3)}" fill="#fff" opacity="0.6"/>`; }
      for (const tx of [242, 290]) ud += `<circle cx="${tx - 2}" cy="-142" r="${f(5 * pox)}" fill="#e8d090" stroke="#8a2a1a" stroke-width="1"/><circle cx="${tx - 2}" cy="-142" r="${f(9 * pox)}" fill="none" stroke="#c8382a" stroke-width="2" opacity="0.6"/>`; }
    g += ud;
    g += leg(-296, false) + hleg(316, false);
    // the neck with its folds and dewlap
    g += `<path d="M-300,-566 C-380,-608 -480,-616 -556,-598 L-612,-452 C-562,-404 -482,-344 -402,-312 C-382,-382 -350,-482 -300,-566Z" fill="url(#${id}b)" ${ol(1.6)}/><path d="M-576,-444 C-532,-370 -470,-300 -402,-288 C-412,-322 -476,-386 -538,-436Z" fill="${shade(coat, -0.18)}" ${ol(1.2)}/>`;
    g += [0, 1, 2].map(i => `<path d="M${-470 + i * 40},${-560 + i * 20} q-20,60 -10,${110 - i * 10}" stroke="${dk}" stroke-width="4" fill="none" opacity="0.4"/>`).join('');
    // the head: a broad forehead, a long face, a big square muzzle; horns, ears, a soft dark eye
    const ha = (o.head || 0) + 3 * Math.sin(t * 0.8);
    let h = `<path d="M12,-12 C-20,-34 -92,-34 -134,-2 C-166,30 -204,112 -218,172 C-228,212 -218,252 -182,264 C-150,274 -110,${f(266 + chew * 6)} -94,${f(242 + chew * 4)} C-70,206 -40,170 -10,128 C14,94 30,40 12,-12Z" fill="url(#${id}h)" ${ol(1.7)}/>`;
    h += `<path d="M-40,-14 C-80,-10 -110,20 -130,60 C-110,40 -80,22 -40,10Z" fill="#fff" opacity="0.1"/><path d="M-150,120 C-170,160 -180,190 -186,210" stroke="${dk}" stroke-width="4" fill="none" opacity="0.4"/>`;
    h += `<path d="M-226,214 C-232,186 -210,172 -186,176 C-160,180 -142,198 -146,226 C-150,256 -176,268 -202,262 C-222,256 -228,236 -226,214Z" fill="#a88078" ${ol(1.3)}/><path d="M-214,200 q-10,8 -4,22 q10,-2 13,-12Z" fill="#2a1614"/><path d="M-170,198 q-8,6 -3,16" stroke="#2a1614" stroke-width="3" fill="none"/><path d="M-196,${f(256 + chew * 5)} Q-160,${f(262 + chew * 5)} -126,${f(244 + chew * 4)}" stroke="#2a1614" stroke-width="2.6" fill="none"/><ellipse cx="-206" cy="190" rx="10" ry="5" fill="#fff" opacity="0.28"/>`;
    h += `<ellipse cx="-92" cy="70" rx="17" ry="13" fill="#140a06" ${ol(1)}/><ellipse cx="-97" cy="65" rx="5" ry="3.6" fill="#fff" opacity="0.85"/><path d="M-112,60 Q-92,46 -72,60" stroke="#120806" stroke-width="3.5" fill="none"/>` + [0, 1, 2, 3].map(i => `<path d="M${-108 + i * 10},62 l-3,-8" stroke="#120806" stroke-width="1.6"/>`).join('') + `<path d="M-116,90 q22,10 44,0" stroke="${shade(coat, 0.3)}" stroke-width="2" fill="none" opacity="0.5"/>`;
    h += `<g transform="rotate(${f(ear)},-24,40)"><path d="M-24,32 C0,14 54,12 84,30 C54,50 6,54 -24,44Z" fill="${coat}" ${ol(1.3)}/><path d="M-8,34 C14,24 44,24 70,32 C44,42 14,44 -8,40Z" fill="#c88a7a" opacity="0.85"/></g>`;
    h += `<path d="M-50,-10 C-62,-44 -48,-78 -14,-96 C-24,-70 -30,-40 -26,-8Z" fill="#e8dcc0" ${ol(1.4)}/><path d="M-20,-80 C-16,-88 -14,-92 -12,-96 C-20,-88 -24,-84 -26,-76Z" fill="#2a2018"/><path d="M-44,-14 C-48,-44 -36,-66 -22,-82" stroke="#fff" stroke-width="2.5" opacity="0.45" fill="none"/>`;
    h += [0, 1, 2, 3, 4].map(i => `<path d="M${-70 + i * 12},-6 q-8,-16 -2,-28" stroke="${dk}" stroke-width="5" fill="none" stroke-linecap="round"/>`).join('');
    g += `<g transform="translate(-578,-596) rotate(${f(ha)})">${h}</g>`;
    return `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">${g}</g>`;
  };  // the milking pail (wooden staves, two iron hoops), milk inside; the three-legged milking stool
  P.pail = (x, y, s, milk = 0.7) => `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><ellipse cx="0" cy="2" rx="96" ry="18" fill="#000" opacity="0.4" filter="url(#b4)"/><path d="M-84,-180 L84,-180 L70,0 L-70,0Z" fill="#8a6038" ${ol(1.5)}/>` +
    [-56, -28, 0, 28, 56].map(k => `<path d="M${k},-180 L${k * 0.83},0" stroke="#4a2e14" stroke-width="3" opacity="0.7"/>`).join('') + [-150, -40].map(yy => `<path d="M${f(-84 + (yy + 180) * 0.078)},${yy} L${f(84 - (yy + 180) * 0.078)},${yy}" stroke="#2a2a2c" stroke-width="12"/>`).join('') +
    `<ellipse cx="0" cy="-180" rx="84" ry="18" fill="#5a3a1e" ${ol(1.3)}/><ellipse cx="0" cy="-178" rx="74" ry="14" fill="#f4f0e6" opacity="${f(milk)}"/><ellipse cx="-20" cy="-181" rx="30" ry="4" fill="#fff" opacity="${f(0.6 * milk)}"/></g>`;
  P.milkStool = (x, y, s) => `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><path d="M-60,-110 L-90,0 M60,-110 L90,0 M0,-110 L4,0" stroke="#4a2e14" stroke-width="16" stroke-linecap="round"/><ellipse cx="0" cy="-118" rx="96" ry="22" fill="#7a5028" ${ol(1.4)}/><ellipse cx="-20" cy="-124" rx="40" ry="5" fill="#c89a60" opacity="0.4"/></g>`;

  // ---------------- the doctor's case book, open on the desk (centre x, y; s scale).
  // Left page: the engraved plate of a milkmaid's hand with cowpox. Right page: Case XVII, the tally of trials (o.tally 0..20),
  // and the new word, written by the quill as o.write goes 0..1. o.quill = [x, y] in book units (where the nib is)
  P.ledger = (x, y, s, o = {}) => {
    const id = uid('lb'), ink = '#2a1a10', paper = '#ecdfbf';
    let g = `<defs><radialGradient id="${id}p" cx="50%" cy="40%" r="75%"><stop offset="0" stop-color="#f4e9cc"/><stop offset="0.8" stop-color="${paper}"/><stop offset="1" stop-color="#cdb88a"/></radialGradient>` +
      `<filter id="${id}sep" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0.35 0.45 0.12 0 0.08  0.3 0.4 0.1 0 0.05  0.24 0.3 0.08 0 0.02  0 0 0 1 0"/></filter></defs>`;
    // board covers, the page block, the gutter shadow
    g += `<path d="M-600,-410 L600,-410 L612,420 L-612,420Z" fill="#4a1e12" ${ol(2)}/><path d="M-580,-396 L0,-380 L0,400 L-590,404Z" fill="url(#${id}p)" ${ol(1.2)}/><path d="M580,-396 L0,-380 L0,400 L590,404Z" fill="url(#${id}p)" ${ol(1.2)}/>`;
    g += `<rect x="-60" y="-380" width="120" height="780" fill="#5a4020" opacity="0.28" filter="url(#b14)"/>`;
    const rf = rng(3); for (let i = 0; i < 26; i++) g += `<circle cx="${f(-560 + rf() * 1120)}" cy="${f(-370 + rf() * 750)}" r="${f(3 + rf() * 9)}" fill="#b08a50" opacity="${f(0.08 + rf() * 0.12)}"/>`;
    // left page: the plate. A hand drawn in sepia with the coloured cowpox pustules, a plate number and caption
    const hand = R.hand({ x: -290, y: -230, dir: [0.15, 1], side: 'R', facing: 'back', pose: 'open', size: 420, skin: '#e8c4a8' });
    g += `<g filter="url(#${id}sep)">${hand}<path d="M-380,-330 C-370,-280 -360,-250 -350,-230 M-200,-330 C-210,-280 -216,-250 -220,-230" stroke="#6a5030" stroke-width="2" fill="none"/></g>`;
    for (const [px, py, r0] of [[-260, -120, 16], [-320, -40, 12], [-230, -10, 10], [-300, 60, 13]]) g += `<circle cx="${px}" cy="${py}" r="${r0 * 1.7}" fill="#c84a3a" opacity="0.45"/><circle cx="${px}" cy="${py}" r="${r0}" fill="#e8d098" stroke="#8a3a2a" stroke-width="1.5"/>`;
    g += `<rect x="-520" y="-360" width="460" height="560" fill="none" stroke="#6a5030" stroke-width="2"/><text x="-290" y="250" font-family="Palatino Linotype, Georgia, serif" font-style="italic" font-size="34" text-anchor="middle" fill="${ink}">The Cow Pox.</text><text x="-290" y="290" font-family="Palatino Linotype, Georgia, serif" font-size="22" text-anchor="middle" fill="${ink}" opacity="0.8">From the hand of a Milkmaid</text>`;
    for (let i = 0; i < 3; i++) g += `<path d="M-520,${330 + i * 22} q120,-4 230,0 t220,0" stroke="${ink}" stroke-width="2" fill="none" opacity="0.35"/>`;
    // right page: the case, written in a hand
    const SC = 'Segoe Script, Brush Script MT, cursive';
    g += `<text x="290" y="-320" font-family="Palatino Linotype, Georgia, serif" font-size="40" text-anchor="middle" fill="${ink}">Case XVII.</text>`;
    g += `<text x="60" y="-262" font-family="${SC}" font-size="26" fill="${ink}" opacity="0.88">a healthy boy of eight years,</text><text x="60" y="-226" font-family="${SC}" font-size="26" fill="${ink}" opacity="0.88">cut with matter from the hand</text><text x="60" y="-190" font-family="${SC}" font-size="26" fill="${ink}" opacity="0.88">of a milkmaid. A fever of three days.</text>`;
    g += `<text x="60" y="-140" font-family="${SC}" font-size="26" fill="${ink}" opacity="0.88">Then the Small Pox itself, many times:</text>`;
    // the tally box: one stroke per trial, crossed in fives
    g += `<rect x="70" y="-112" width="440" height="90" fill="none" stroke="${ink}" stroke-width="1.5" opacity="0.5"/>`;
    const n = Math.max(0, Math.min(20, Math.floor(o.tally || 0)));
    for (let i = 0; i < n; i++) { const grp = Math.floor(i / 5), k = i % 5, gx = 90 + grp * 104; g += k < 4 ? `<path d="M${gx + k * 18},-98 l4,62" stroke="${ink}" stroke-width="4" stroke-linecap="round"/>` : `<path d="M${gx - 10},-46 L${gx + 72},-88" stroke="${ink}" stroke-width="4" stroke-linecap="round"/>`; }
    g += `<text x="60" y="30" font-family="${SC}" font-size="26" fill="${ink}" opacity="0.88">No disease followed.</text>`;
    // the new word, revealed left to right as the quill writes it
    const wr = cl(o.write || 0), wid = id + 'w';
    if (wr > 0) g += `<defs><clipPath id="${wid}"><rect x="40" y="70" width="${f(520 * wr)}" height="200"/></clipPath></defs><g clip-path="url(#${wid})"><text x="290" y="200" font-family="${SC}" font-size="104" text-anchor="middle" fill="${ink}">Vaccine</text><path d="M80,232 C200,214 380,214 500,228" stroke="${ink}" stroke-width="4" fill="none" stroke-linecap="round"/></g>`;
    g += `<text x="290" y="312" font-family="Palatino Linotype, Georgia, serif" font-style="italic" font-size="24" text-anchor="middle" fill="${ink}" opacity="${f(0.75 * cl(wr * 1.3 - 0.3))}">from vacca, the cow</text>`;
    return `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">${g}</g>`;
  };
  // where the quill's nib sits while writing the word (book units): progress 0..1 along the word with a small script loop
  P.ledgerNib = (wr) => [80 + 420 * wr, 168 + 22 * Math.sin(wr * 40) - 8 * Math.cos(wr * 23)];

  // ---------------- inside the blood (warm, organic): red cells, a white cell, antibodies, pox particles
  // a red cell: biconcave disc, sq = how much it is turned edge-on (1 = face on)
  P.rbc = (x, y, r, rot, sq = 1, op = 1) => {
    const id = 'rbcg' + Math.round(sq * 10);
    return `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)}) scale(1,${f(Math.max(0.28, sq))})" opacity="${f(op)}"><circle r="${f(r)}" fill="url(#${id})"/><circle r="${f(r * 0.98)}" fill="none" stroke="#ff8a6a" stroke-width="${f(r * 0.05)}" opacity="0.35"/><ellipse cx="${f(-r * 0.25)}" cy="${f(-r * 0.45)}" rx="${f(r * 0.45)}" ry="${f(r * 0.14)}" fill="#ffd0b8" opacity="0.35"/></g>`;
  };
  P.rbcDefs = () => [3, 4, 5, 6, 7, 8, 9, 10].map(k => `<radialGradient id="rbcg${k}"><stop offset="0" stop-color="#7a1410"/><stop offset="0.42" stop-color="#9a1e16"/><stop offset="0.72" stop-color="#d0402c"/><stop offset="0.9" stop-color="#b02a1e"/><stop offset="1" stop-color="#6a0e0a"/></radialGradient>`).join('');
  // a white cell: a soft pale body whose edge creeps (pseudopods), granules, a lobed nucleus. o.reach = [dx, dy] stretches it
  P.wbc = (x, y, r, t, seed = 1, o = {}) => {
    const rr = rng(seed), N = 14, ph = []; for (let i = 0; i < N; i++) ph.push(rr() * 6.28);
    const [rx2, ry2] = o.reach || [0, 0];
    let d = '';
    for (let i = 0; i <= N; i++) { const a = i / N * 6.28, k = 1 + 0.12 * Math.sin(t * 1.7 + ph[i % N]) + 0.08 * Math.sin(t * 2.9 + ph[(i + 3) % N] * 2), ext = Math.max(0, Math.cos(a) * rx2 + Math.sin(a) * ry2);
      const px = Math.cos(a) * (r * k + ext), py = Math.sin(a) * (r * k + ext); d += (i ? ' L' : 'M') + f(px) + ',' + f(py); }
    let g = `<path d="${d}Z" fill="#f0dccb" opacity="0.82" stroke="#fff4e8" stroke-width="${f(r * 0.04)}" stroke-linejoin="round"/>`;
    g += `<path d="${d}Z" fill="none" stroke="#c88a7a" stroke-width="${f(r * 0.12)}" opacity="0.25" filter="url(#b4)"/>`;
    for (let i = 0; i < 18; i++) { const a = rr() * 6.28, q = rr() * 0.75 * r; g += `<circle cx="${f(Math.cos(a) * q)}" cy="${f(Math.sin(a) * q)}" r="${f(r * (0.025 + rr() * 0.03))}" fill="#c8a090" opacity="0.6"/>`; }
    g += `<path d="M${f(-r * 0.4)},${f(-r * 0.1)} C${f(-r * 0.5)},${f(-r * 0.45)} ${f(-r * 0.05)},${f(-r * 0.5)} ${f(0)},${f(-r * 0.2)} C${f(r * 0.1)},${f(-r * 0.5)} ${f(r * 0.55)},${f(-r * 0.35)} ${f(r * 0.4)},${f(0)} C${f(r * 0.55)},${f(r * 0.3)} ${f(r * 0.1)},${f(r * 0.45)} ${f(0)},${f(r * 0.22)} C${f(-r * 0.2)},${f(r * 0.45)} ${f(-r * 0.6)},${f(r * 0.25)} ${f(-r * 0.4)},${f(-r * 0.1)}Z" fill="#9a6a8a" opacity="0.6"/>`;
    g += `<ellipse cx="${f(-r * 0.3)}" cy="${f(-r * 0.55)}" rx="${f(r * 0.35)}" ry="${f(r * 0.12)}" fill="#fff" opacity="0.4"/>`;
    return `<g transform="translate(${f(x)},${f(y)})">${g}</g>`;
  };
  // a pox particle: brick-shaped with a tubule-ridged surface and a dumbbell core. kind 'cow' (amber-gold) or 'small'
  // (dark plum with a sickly green sheen). o.crumble 0..1 breaks it into drifting fragments that fade out
  P.poxV = (x, y, s, rot, kind = 'cow', o = {}) => {
    const cow = kind === 'cow', body = cow ? '#d89a38' : '#3a1a34', ridge = cow ? '#f4d070' : '#7a9a3a', core = cow ? '#a86a20' : '#1a0a18', cr = cl(o.crumble || 0);
    const brick = `<rect x="-60" y="-44" width="120" height="88" rx="30" fill="${body}" stroke="${cow ? '#7a4a10' : '#0e040c'}" stroke-width="3"/>`;
    let tex = ''; const rr = rng(cow ? 3 : 4); for (let i = 0; i < 16; i++) { const tx = -46 + rr() * 92, ty = -32 + rr() * 64; tex += `<path d="M${f(tx - 7)},${f(ty)} q4,-6 7,0 t7,0" stroke="${ridge}" stroke-width="3" fill="none" opacity="0.75"/>`; }
    const inner = `<path d="M-30,-14 C-14,-24 14,-24 30,-14 C40,-6 40,6 30,14 C14,24 -14,24 -30,14 C-40,6 -40,-6 -30,-14Z" fill="${core}" opacity="0.5"/>`;
    let g;
    if (cr <= 0) g = brick + inner + tex + `<ellipse cx="-20" cy="-26" rx="26" ry="7" fill="#fff" opacity="${cow ? 0.35 : 0.15}"/>`;
    else { g = ''; const rf = rng(cow ? 11 : 12); for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28 + rf(), dd = cr * (60 + rf() * 60), fx = Math.cos(a) * dd, fy = Math.sin(a) * dd; g += `<g transform="translate(${f(fx)},${f(fy)}) rotate(${f(cr * (rf() - 0.5) * 120)})" opacity="${f(1 - cr)}"><path d="M${f(Math.cos(a) * 10 - 22)},${f(Math.sin(a) * 10 - 16)} l${f(30 + rf() * 14)},${f(-6)} l${f(6)},${f(30)} l${f(-34)},${f(8)}Z" fill="${body}" stroke="#0e040c" stroke-width="2"/></g>`; }
      g += `<circle r="${f(70 * cr)}" fill="#3a2a20" opacity="${f(0.4 * (1 - cr))}" filter="url(#b4)"/>`; }
    if (cow && cr <= 0) g = `<circle r="90" fill="#f0b040" opacity="0.18" filter="url(#b8)"/>` + g;
    return `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)}) scale(${f(s)})">${g}</g>`;
  };
  // an antibody: a golden Y with rounded tips
  P.antibody = (x, y, s, rot, op = 1) => `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)}) scale(${f(s)})" opacity="${f(op)}"><path d="M0,40 L0,4 M0,4 L-26,-26 M0,4 L26,-26" stroke="#7a5010" stroke-width="16" stroke-linecap="round" fill="none"/><path d="M0,40 L0,4 M0,4 L-26,-26 M0,4 L26,-26" stroke="#f0c860" stroke-width="10" stroke-linecap="round" fill="none"/><path d="M-2,36 L-2,6 M-4,2 L-24,-22" stroke="#fff4c0" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.6"/></g>`;
})(window);
