// Cinematic lighting & atmosphere for the cut-out characters.
(function (G) {
  const { f, shade, mix, rng, uid } = G.RIG;
  const W = 1080, H = 1920;
  const C = {};
  const norm = v => { const n = Math.hypot(v[0], v[1]) || 1; return [v[0] / n, v[1] / n]; };

  // Light a character. L.from = direction from the character towards the key light (screen space).
  // Returns { cast, body }: draw cast shadows before characters, body afterwards.
  C.lit = (P, L) => {
    const id = uid('L'), { cx, cy, R } = P.info;
    const [lx, ly] = norm(L.from || [-1, -0.4]);
    const ax = cx + lx * R, ay = cy + ly * R, bx = cx - lx * R, by = cy - ly * R;
    const content = P.svg + (P.extra || '');
    // light only what the camera can see: the filter region is the character box clipped to the view
    let bx0 = cx - R * 2.1, by0 = P.info.top - R * 0.4, bx1 = cx + R * 2.1, by1 = P.info.feet + R * 0.4;
    // P.info.ext [x0, y0, x1, y1]: something held that reaches past the body's box (a big open book) is lit whole, not cut
    const E = P.info.ext; if (E) { bx0 = Math.min(bx0, E[0]); by0 = Math.min(by0, E[1]); bx1 = Math.max(bx1, E[2]); by1 = Math.max(by1, E[3]); }
    const V = L.view;
    if (V) { bx0 = Math.max(bx0, V[0]); by0 = Math.max(by0, V[1]); bx1 = Math.min(bx1, V[2]); by1 = Math.min(by1, V[3]); }
    if (bx1 - bx0 < 2 || by1 - by0 < 2) return { cast: '', body: '' };
    const bw = bx1 - bx0, bh = by1 - by0;
    const BB = `x="${f(bx0)}" y="${f(by0)}" width="${f(bw)}" height="${f(bh)}"`;
    const W1 = (c, op) => mix('#ffffff', c, Math.min(1, op)), K0 = (c, op) => mix('#000000', c, Math.min(1, op));
    // every light is computed inside ONE filter so the character is rasterised once
    let defs = '', fx = '', n = 0, cur = 'SourceGraphic';
    // shading is generated inside the filter with point lights (no images): a key light that falls off across
    // the body, a top light that darkens towards the feet, and a small face light
    const lin = (I0, c, res, src) => { const [r, g, b] = [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16) / 255), k = 1 / (1 - I0);
      fx += `<feComponentTransfer in="${src}" result="${res}">` + [['R', r], ['G', g], ['B', b]].map(([ch, v]) => `<feFunc${ch} type="linear" slope="${f((1 - v) * k * 1000) / 1000}" intercept="${f((v - (1 - v) * k * I0) * 1000) / 1000}"/>`).join('') + `<feFuncA type="linear" slope="0" intercept="1"/></feComponentTransfer>`; };
    const pl = (res, x, y, z) => { fx += `<feDiffuseLighting in="SourceAlpha" surfaceScale="0" diffuseConstant="1" lighting-color="#ffffff" ${BB} result="${res}"><fePointLight x="${f(x)}" y="${f(y)}" z="${f(z)}"/></feDiffuseLighting>`; };
    const mul = src => { fx += `<feComposite in="${cur}" in2="${src}" operator="arithmetic" k1="1" k2="0" k3="0" k4="0" result="c${n}"/>`; cur = `c${n++}`; };
    const scr = src => { fx += `<feComposite in="${src}" in2="SourceAlpha" operator="in" result="q${n}"/><feComposite in="${cur}" in2="q${n}" operator="arithmetic" k1="-1" k2="1" k3="1" k4="0" result="c${n}"/>`; cur = `c${n++}`; };
    const sh = L.shadow || '#3a3040', so = L.shadowOp ?? 0.75, Hh = P.info.feet - P.info.top;
    // key: light sits 1.6R out towards the source; intensity z/sqrt(d^2+z^2) spans ~0.4 (far side) .. 1
    const kz = R * 1.5, kx = cx + lx * R * 1.6, ky = cy + ly * R * 1.6;
    pl('kl', kx, ky, kz);
    lin(0.42, W1(sh, so), 'ks', 'kl'); mul('ks');
    if (L.ambient) { fx += `<feFlood flood-color="${W1(L.ambient, L.ambientOp ?? 1)}" ${BB} result="am"/>`; mul('am'); }
    // floor: light above the head, fades towards the feet
    pl('tl', cx, P.info.top - Hh * 0.15, Hh * 0.95);
    lin(0.62, W1(L.floor || '#5a4a48', L.floorOp ?? 0.7), 'ts', 'tl'); mul('ts');
    if (L.keyAdd) { const kc = K0(L.key || '#ffffff', L.keyAdd); fx += `<feComponentTransfer in="kl" result="kp"><feFuncR type="gamma" amplitude="${f(parseInt(kc.slice(1, 3), 16) / 255)}" exponent="5"/><feFuncG type="gamma" amplitude="${f(parseInt(kc.slice(3, 5), 16) / 255)}" exponent="5"/><feFuncB type="gamma" amplitude="${f(parseInt(kc.slice(5, 7), 16) / 255)}" exponent="5"/><feFuncA type="linear" slope="0" intercept="1"/></feComponentTransfer>`; scr('kp'); }
    if (L.face && P.info.head) {
      const [hx, hy] = P.info.head, hr = P.info.hr * (L.face.r || 1.4), fcx = hx + lx * P.info.hr * 0.45, fcy = hy + ly * P.info.hr * 0.3 + P.info.hr * 0.1;
      const fc = K0(L.face.col || L.key || '#ffffff', L.face.op ?? 0.35);
      pl('fl', fcx, fcy, hr * 0.5);
      fx += `<feComponentTransfer in="fl" result="fp">` + [['R', 1], ['G', 3], ['B', 5]].map(([ch, i]) => `<feFunc${ch} type="gamma" amplitude="${f(parseInt(fc.slice(i, i + 2), 16) / 255)}" exponent="4"/>`).join('') + `<feFuncA type="linear" slope="0" intercept="1"/></feComponentTransfer>`;
      scr('fp');
    }    const rims = L.rims || (L.rim ? [{ from: L.from, col: L.rim, w: L.rimW || 7, op: L.rimOp ?? 0.9 }] : []);
    // rims stay a thin bright edge at any size (a wide one reads as a pale see-through ghost round dark cloth and hair)
    rims.forEach((r, i) => {
      const [rx, ry] = norm(r.from), w = (r.w || 7) * (P.info.s ? Math.max(0.6, Math.min(L.rimMax ?? 1.25, P.info.s / 0.62)) : 1);
      fx += `<feOffset in="SourceAlpha" dx="${f(-rx * w)}" dy="${f(-ry * w)}" result="o${i}"/><feComposite in="SourceAlpha" in2="o${i}" operator="out" result="e${i}"/><feGaussianBlur in="e${i}" stdDeviation="${f(w * 0.32)}" result="eb${i}"/>` +
        `<feFlood flood-color="${K0(r.col, r.op ?? 0.9)}" result="rf${i}"/><feComposite in="rf${i}" in2="eb${i}" operator="in" result="ri${i}"/>`;
      scr(`ri${i}`);
    });
    fx += `<feComposite in="${cur}" in2="SourceAlpha" operator="in"/>`;
    const filt = `<filter id="${id}f" filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" ${BB} color-interpolation-filters="sRGB">${fx}</filter>`;
    let body = `<defs>${defs}${filt}</defs><g id="${id}" filter="url(#${id}f)">${content}</g>`;
    if (L.blur) body = `<g filter="url(#${L.blur})">${body}</g>`;
    // cast shadow: project silhouette onto the ground plane (kx, ky = shadow offset per unit of height)
    let cast = '';
    const y0 = L.ground ?? P.info.feet ?? (P.info.cy + (P.info.cy - P.info.top) * 0.82);
    if (L.cast) {
      const [kx, ky] = L.cast;
      cast += `<defs><g id="${id}s">${content.replace(/filter="url\(#[^)]+\)"/g, '')}</g></defs><use href="#${id}s" transform="matrix(1,0,${f(-kx)},${f(-ky)},${f(kx * y0)},${f(y0 * (1 + ky))})" filter="url(#castF)" opacity="${L.castOp ?? 0.45}"/>`;
    }
    cast += `<ellipse cx="${f(P.info.cx)}" cy="${f(y0)}" rx="${f(R * 0.75)}" ry="${f(R * 0.12)}" fill="#0a0604" opacity="${L.contactOp ?? 0.5}" filter="url(#soft2)"/>`;
    return { cast, body };
  };

  C.defs = () => `<filter id="castF" x="-50%" y="-50%" width="200%" height="200%"><feFlood flood-color="#0a0604"/><feComposite in2="SourceAlpha" operator="in"/><feGaussianBlur stdDeviation="10"/></filter>` +
    `<filter id="rayBlur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="22"/></filter>` +
    `<filter id="bigGlow" x="-300%" y="-300%" width="700%" height="700%"><feGaussianBlur stdDeviation="80"/></filter>`;

  // global colour grade: saturation + filmic S-curve with lifted blacks
  C.gradeFilter = (id, sat = 0.85, curve = '0.04 0.13 0.3 0.5 0.7 0.86 0.96', tint = [1, 1, 1]) =>
    // (a fixed region round the frame, never the content's own bounding box: a set that throws glows and reflections far
    // off screen would otherwise ask for a giant offscreen surface, and two such shots in one transition frame broke up
    // into blocks; 900 px of margin still covers a shot zoomed down to 0.38 inside a transition)
    `<filter id="${id}" filterUnits="userSpaceOnUse" x="-900" y="-900" width="${W + 1800}" height="${H + 1800}" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="${sat}"/>` +
    `<feComponentTransfer><feFuncR type="table" tableValues="${curve.split(' ').map(v => f(+v * tint[0])).join(' ')}"/><feFuncG type="table" tableValues="${curve.split(' ').map(v => f(+v * tint[1])).join(' ')}"/><feFuncB type="table" tableValues="${curve.split(' ').map(v => f(+v * tint[2])).join(' ')}"/></feComponentTransfer></filter>`;

  C.rays = (x, y, angles, len, width, col, op) => {
    let g = '';
    for (const [a, wMul] of angles) {
      const r = a * Math.PI / 180, ex = x + Math.cos(r) * len, ey = y + Math.sin(r) * len, nx = -Math.sin(r), ny = Math.cos(r), w = width * (wMul || 1);
      g += `<path d="M${x},${y} L${f(ex + nx * w)},${f(ey + ny * w)} L${f(ex - nx * w)},${f(ey - ny * w)}Z" fill="${col}"/>`;
    }
    return `<g filter="url(#rayBlur)" style="mix-blend-mode:screen" opacity="${op}">${g}</g>`;
  };
  C.bloom = (x, y, r, col, op) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${col}" opacity="${op}" filter="url(#bigGlow)" style="mix-blend-mode:screen"/>`;
  C.fog = (y, h, col, op) => { const id = uid('fg'); return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${col}" stop-opacity="0"/><stop offset="0.5" stop-color="${col}" stop-opacity="${op}"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></linearGradient></defs><rect x="0" y="${y}" width="${W}" height="${h}" fill="url(#${id})"/>`; };
  C.motes = (x, y, rx, ry, n, seed, col, rMax, op) => { const r = rng(seed); let g = ''; for (let i = 0; i < n; i++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()); g += `<circle cx="${f(x + Math.cos(a) * rx * d)}" cy="${f(y + Math.sin(a) * ry * d)}" r="${f(0.8 + r() * rMax)}" fill="${col}" opacity="${f(op * (0.3 + r() * 0.7))}"/>`; } return `<g filter="url(#b1)" style="mix-blend-mode:screen">${g}</g>`; };
  // the same elliptical falloff as a frame-sized rect (r = 72% of each side), but the rect runs well past the frame so a shot
  // that a transition shifts or shrinks never shows the vignette's edge
  C.vignette = (op = 0.6, col = '#000', inner = 0.5) => { const id = uid('vg'), cx = W * 0.5, cy = H * 0.48; return `<defs><radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${cx}" cy="${cy}" r="${W * 0.72}" gradientTransform="translate(${cx},${cy}) scale(1,${H / W}) translate(${-cx},${-cy})"><stop offset="${inner}" stop-color="${col}" stop-opacity="0"/><stop offset="1" stop-color="${col}" stop-opacity="${op}"/></radialGradient></defs><rect x="${-W}" y="${-H}" width="${W * 3}" height="${H * 3}" fill="url(#${id})"/>`; };
  C.grain = (op = 0.08) => `<rect width="${W}" height="${H}" filter="url(#grain)" opacity="${op}" style="mix-blend-mode:overlay"/>`;
  C.overlay = (col, op, mode) => `<rect width="${W}" height="${H}" fill="${col}" opacity="${op}" style="mix-blend-mode:${mode}"/>`;
  C.radial = (x, y, r, col, op, mode = 'screen') => { const id = uid('rg'); return `<defs><radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${x}" cy="${y}" r="${r}"><stop offset="0" stop-color="${col}" stop-opacity="${op}"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></radialGradient></defs><rect x="${x - r}" y="${y - r}" width="${r * 2}" height="${r * 2}" fill="url(#${id})" style="mix-blend-mode:${mode}"/>`; };

  G.CINE = C;
})(window);





