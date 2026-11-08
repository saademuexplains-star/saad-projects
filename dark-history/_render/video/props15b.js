// Props for "The Cells That Never Died" part 2: surgical forceps, the tumour (growing, spreading), a rack of labelled
// culture tubes that die one by one, an old photograph (any frame drawn inside it, sepia), the Earth at night with
// pink lights where the cells grow, glowing shipping arcs over the desk globe, the operating lamp, the anaesthesia cart,
// the iron hospital bed seen from the side, a bedside cabinet with a water jug.
(function (G) {
  const P = G.PROPS, R = G.RIG, { f, uid, shade, mix, rng } = R;
  const TAU = Math.PI * 2, D2R = Math.PI / 180;
  const olp = (w = 2) => `stroke="#20140c" stroke-width="${w}" stroke-linejoin="round"`;
  const cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));

  // ======================================================= surgical forceps in the grip frame (held like a pen: the blades
  // run along +x past the fingertips, the tips at +150). o.open 0..1, o.tissue 0..1 (a small dark-red piece in the tips)
  P.forceps = (k = 1, o = {}) => {
    const op = o.open || 0;
    const arm = s => `M-150,${f(s * 3)} L-40,${f(s * 10)} L80,${f(s * (6 + op * 26))} L152,${f(s * (1.5 + op * 40))}`;
    let g = `<g transform="scale(${f(k)})">`;
    for (const s of [-1, 1]) g += `<path d="${arm(s)}" stroke="#2a2e32" stroke-width="11" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="${arm(s)}" stroke="#b8c0c6" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<path d="M-120,${f(s * 4 - 1.5)} L60,${f(s * 8 - 1.5)}" stroke="#f0f4f6" stroke-width="2" opacity="0.7"/>`;
    for (let i = 0; i < 5; i++) g += `<path d="M${-10 + i * 9},-10 l0,20" stroke="#6a7076" stroke-width="2" opacity="0.6"/>`;
    g += `<circle cx="-150" cy="0" r="7" fill="#9aa2a8" ${olp(1.4)}/>`;
    if ((o.tissue || 0) > 0.01) g += `<g opacity="${f(cl(o.tissue))}"><path d="M150,-14 C164,-20 182,-12 182,0 C182,12 166,18 152,12 C142,8 140,-8 150,-14Z" fill="#7a1a22" ${olp(1.2)}/><path d="M156,-8 C164,-12 172,-10 176,-4" stroke="#c8606a" stroke-width="2.4" fill="none" opacity="0.8"/><circle cx="170" cy="4" r="3" fill="#ffb0b0" opacity="0.5"/></g>`;
    return g + '</g>';
  };

  // ======================================================= the tumour: a lumpy, glistening dark mass on warm tissue. (x,y) =
  // centre; o.grow 0..1 (size and number of lobes), o.spread 0..1 (dark roots creeping outward), o.pulse
  P.tumor = (x, y, s, t, o = {}) => {
    const id = uid('tm'), gr = o.grow ?? 1, sp = o.spread || 0, Rr = 150 * (0.3 + 0.7 * gr) * (1 + 0.025 * Math.sin(t * 2.6));
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><defs><radialGradient id="${id}" cx="38%" cy="32%" r="72%"><stop offset="0" stop-color="#b85a6e"/><stop offset="0.45" stop-color="#6e2238"/><stop offset="1" stop-color="#2e0a16"/></radialGradient></defs>`;
    // roots: branching dark threads into the surrounding tissue
    if (sp > 0.01) {
      const r = rng(17);
      for (let i = 0; i < 14; i++) {
        const a = i / 14 * TAU + r() * 0.4, L = Rr * (0.6 + 2.6 * sp) * (0.6 + r() * 0.6);
        let px = Math.cos(a) * Rr * 0.8, py = Math.sin(a) * Rr * 0.8, aa = a, w = 14 * (0.5 + 0.5 * sp);
        let d = `M${f(px)},${f(py)}`;
        const N = 7;
        for (let k = 1; k <= N; k++) {
          aa += (r() - 0.5) * 0.7 + Math.sin(t * 0.7 + i + k) * 0.02;
          px += Math.cos(aa) * L / N; py += Math.sin(aa) * L / N; d += ` L${f(px)},${f(py)}`;
          if (k === 3 && r() < 0.8) { const ba = aa + (r() < 0.5 ? -0.7 : 0.7), bl = L * 0.35; g += `<path d="M${f(px)},${f(py)} q${f(Math.cos(ba) * bl * 0.5 + 10)},${f(Math.sin(ba) * bl * 0.5)} ${f(Math.cos(ba) * bl)},${f(Math.sin(ba) * bl)}" stroke="#3a0c1c" stroke-width="${f(w * 0.45)}" fill="none" stroke-linecap="round" opacity="0.85"/>`; }
        }
        g += `<path d="${d}" stroke="#2a0812" stroke-width="${f(w + 6)}" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.35" filter="url(#b4)"/><path d="${d}" stroke="#4a1024" stroke-width="${f(w)}" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>` +
          `<path d="${d}" stroke="#9a4a5e" stroke-width="${f(w * 0.25)}" fill="none" stroke-linecap="round" opacity="0.5" transform="translate(-2,-3)"/>`;
      }
    }
    // a dark halo where it presses into the tissue, then the lobes (biggest first) with wet highlights
    g += `<circle r="${f(Rr * 1.25)}" fill="#2a0612" opacity="0.45" filter="url(#b8)"/>`;
    const r2 = rng(29), nL = 5 + Math.round(8 * gr), lobes = [];
    for (let i = 0; i < nL; i++) { const a = r2() * TAU, d = (i === 0 ? 0 : 0.35 + r2() * 0.45) * Rr, rr = Rr * (i === 0 ? 0.62 : 0.28 + r2() * 0.26); lobes.push([Math.cos(a) * d, Math.sin(a) * d, rr, r2() * 99]); }
    lobes.sort((a, b) => b[2] - a[2]);
    for (const [lx, ly, lr, sd] of lobes) {
      const N = 14; let d = '';
      for (let k = 0; k <= N; k++) { const a = k / N * TAU, w = 1 + 0.09 * Math.sin(a * 4 + sd) + 0.06 * Math.sin(a * 7 - sd * 2 + t * 1.2); d += (k ? ' L' : 'M') + f(lx + Math.cos(a) * lr * w) + ',' + f(ly + Math.sin(a) * lr * w); }
      g += `<path d="${d}Z" fill="url(#${id})" stroke="#1a0408" stroke-width="2.5"/><ellipse cx="${f(lx - lr * 0.3)}" cy="${f(ly - lr * 0.35)}" rx="${f(lr * 0.32)}" ry="${f(lr * 0.18)}" fill="#ffd0dc" opacity="0.32" transform="rotate(-25 ${f(lx - lr * 0.3)} ${f(ly - lr * 0.35)})"/>` +
        `<circle cx="${f(lx - lr * 0.42)}" cy="${f(ly - lr * 0.45)}" r="${f(lr * 0.07)}" fill="#fff" opacity="0.55"/>`;
    }
    return g + '</g>';
  };

  // ======================================================= a wooden rack of labelled culture tubes ((x,y) = the rack's foot
  // at its left end). o.n tubes, o.labels[i], o.dead(i) 0..1, o.gap spacing
  P.tubeRack = (x, y, s, t, o = {}) => {
    const n = o.n || 8, gap = o.gap || 92, w = n * gap + 40;
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">`;
    g += `<rect x="0" y="-30" width="${w}" height="30" fill="#7a5230" ${olp(1.6)}/><rect x="0" y="-120" width="${w}" height="22" fill="#8a6038" ${olp(1.6)}/><rect x="-6" y="-130" width="16" height="130" fill="#6a4426" ${olp(1.4)}/><rect x="${w - 10}" y="-130" width="16" height="130" fill="#6a4426" ${olp(1.4)}/>`;
    let front = '';
    for (let i = 0; i < n; i++) {
      const tx = 40 + i * gap, dd = o.dead ? o.dead(i) : 0;
      g += P.testTube(tx, -24, 1.05, 0, { level: 0.5, dead: dd, label: o.labels ? o.labels[i % o.labels.length] : null });
      if (dd > 0.05) g += `<ellipse cx="${tx}" cy="-80" rx="20" ry="40" fill="#6a6a64" opacity="${f(0.25 * dd)}"/>`;
      front += `<rect x="${tx - 30}" y="-112" width="60" height="10" fill="#9a7048" opacity="0.9"/>`;
    }
    return g + front + '</g>';
  };

  // ======================================================= an old photograph: the frame `inner` (a whole 1080x1920 picture)
  // drawn into its image area [ix, iy, 1080k, 1920k], sepia (o.sepia 0..1), a white deckled border, two strips of tape
  P.photo = (ix, iy, k, inner, o = {}) => {
    const id = uid('ph'), w = 1080 * k, h = 1920 * k, b = 64 * k, sep = o.sepia ?? 1;
    let g = `<defs><filter id="${id}s" filterUnits="userSpaceOnUse" x="0" y="0" width="1080" height="1920" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0.36 0.70 0.17 0 0.03  0.32 0.64 0.15 0 0.02  0.25 0.50 0.12 0 0  0 0 0 1 0"/><feComponentTransfer><feFuncR type="gamma" exponent="1.08" amplitude="1.04"/><feFuncG type="gamma" exponent="1.08" amplitude="1.02"/><feFuncB type="gamma" exponent="1.1" amplitude="0.96"/></feComponentTransfer></filter>` +
      `<clipPath id="${id}c"><rect x="${f(ix)}" y="${f(iy)}" width="${f(w)}" height="${f(h)}"/></clipPath><radialGradient id="${id}v" cx="50%" cy="48%" r="62%"><stop offset="0.6" stop-color="#2a1a0a" stop-opacity="0"/><stop offset="1" stop-color="#2a1a0a" stop-opacity="0.55"/></radialGradient></defs>`;
    if (!o.bare) {
      g += `<rect x="${f(ix - b + 10 * k)}" y="${f(iy - b + 16 * k)}" width="${f(w + b * 2)}" height="${f(h + b * 2)}" fill="#000" opacity="0.35" filter="url(#b8)"/>`;
      let d = `M${f(ix - b)},${f(iy - b)}`;
      const rr = rng(5);
      for (let i = 1; i <= 20; i++) d += ` L${f(ix - b + (w + 2 * b) * i / 20)},${f(iy - b + (rr() - 0.5) * 4 * k)}`;
      for (let i = 1; i <= 30; i++) d += ` L${f(ix + w + b + (rr() - 0.5) * 4 * k)},${f(iy - b + (h + 2 * b) * i / 30)}`;
      for (let i = 1; i <= 20; i++) d += ` L${f(ix + w + b - (w + 2 * b) * i / 20)},${f(iy + h + b + (rr() - 0.5) * 4 * k)}`;
      for (let i = 1; i <= 30; i++) d += ` L${f(ix - b + (rr() - 0.5) * 4 * k)},${f(iy + h + b - (h + 2 * b) * i / 30)}`;
      g += `<path d="${d}Z" fill="#efe6d2" stroke="#b8aa8a" stroke-width="${f(2 * k + 0.5)}"/>`;
    }
    // the picture: sepia under, the colour coming through on top as o.sepia falls
    g += `<g clip-path="url(#${id}c)"><g transform="translate(${f(ix)},${f(iy)}) scale(${f(k)})">`;
    if (sep > 0.001) g += `<g filter="url(#${id}s)">${inner}</g>`;
    if (sep < 0.999) g += `<g opacity="${f(1 - sep)}">${inner}</g>`;
    g += `</g><rect x="${f(ix)}" y="${f(iy)}" width="${f(w)}" height="${f(h)}" fill="url(#${id}v)" opacity="${f(sep)}"/>`;
    if (sep > 0.01) { const r = rng(9); for (let i = 0; i < 7; i++) { const sx = ix + r() * w, sy = iy + r() * h; g += `<path d="M${f(sx)},${f(sy)} q${f(30 * k)},${f(60 * k)} ${f(10 * k)},${f(160 * k)}" stroke="#f8f0dc" stroke-width="${f(1.4 * k + 0.4)}" fill="none" opacity="${f(0.35 * sep)}"/>`; } }
    g += `</g>`;
    if (!o.bare && o.tape !== false) for (const [tx, rot] of [[ix + w * 0.12, -32], [ix + w * 0.88, 30]]) g += `<rect x="${f(tx - 110 * k)}" y="${f(iy - b - 30 * k)}" width="${f(220 * k)}" height="${f(70 * k)}" fill="#f4eccc" opacity="0.55" transform="rotate(${rot} ${f(tx)} ${f(iy - b + 5 * k)})" stroke="#c8bc98" stroke-width="${f(k + 0.3)}"/>`;
    return g;
  };

  // ======================================================= the Earth at night from space: dark oceans, dim land, faint amber
  // city glow, and o.dots 0..1 of pink lights where HeLa grows (they come on in a scattered order); o.lon, o.lat
  const LANDS = () => P.GLOBE_LANDS;
  const inPoly = (pt, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if (((yi > pt[1]) !== (yj > pt[1])) && (pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi)) c = !c; } return c; };
  let LABS = null;
  const labs = () => {
    if (LABS) return LABS;
    LABS = []; const r = rng(123);
    LANDS().forEach((poly, li) => {
      const xs = poly.map(p => p[0]), ys = poly.map(p => p[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
      const want = Math.round(Math.sqrt((x1 - x0) * (y1 - y0)) * 0.9) + 2;
      let tries = 0, got = 0;
      while (got < want && tries < want * 30) { tries++; const p = [x0 + r() * (x1 - x0), y0 + r() * (y1 - y0)]; if (Math.abs(p[1]) > 66 || !inPoly(p, poly)) continue; LABS.push({ p, at: r(), big: r(), li }); got++; }
    });
    // Baltimore first
    LABS.unshift({ p: [-76.6, 39.3], at: 0, big: 1, li: 0 });
    return LABS;
  };
  P.earthNight = (x, y, Rr, t, o = {}) => {
    const id = uid('en'), lon0 = (o.lon ?? -40) * D2R, lat0 = (o.lat ?? 20) * D2R, dots = o.dots ?? 0;
    const proj = ([lo, la]) => {
      const l = lo * D2R - lon0, p = la * D2R, cc = Math.sin(lat0) * Math.sin(p) + Math.cos(lat0) * Math.cos(p) * Math.cos(l);
      let px = Rr * Math.cos(p) * Math.sin(l), py = -Rr * (Math.cos(lat0) * Math.sin(p) - Math.sin(lat0) * Math.cos(p) * Math.cos(l));
      if (cc < 0) { const n = Math.hypot(px, py) || 1; px = px / n * Rr; py = py / n * Rr; }
      return [px, py, cc];
    };
    let g = `<g transform="translate(${f(x)},${f(y)})"><defs><radialGradient id="${id}o" cx="40%" cy="36%" r="68%"><stop offset="0" stop-color="#1c3254"/><stop offset="0.7" stop-color="#0c1a32"/><stop offset="1" stop-color="#040912"/></radialGradient>` +
      `<radialGradient id="${id}a" cx="50%" cy="50%" r="50%"><stop offset="0.9" stop-color="#4a8ad8" stop-opacity="0"/><stop offset="0.955" stop-color="#6aa8f0" stop-opacity="0.55"/><stop offset="1" stop-color="#4a8ad8" stop-opacity="0"/></radialGradient><clipPath id="${id}c"><circle r="${f(Rr)}"/></clipPath></defs>`;
    g += `<circle r="${f(Rr * 1.1)}" fill="url(#${id}a)"/><g clip-path="url(#${id}c)"><circle r="${f(Rr)}" fill="url(#${id}o)"/>`;
    LANDS().forEach(poly => {
      const pts = poly.map(proj);
      if (pts.every(p => p[2] < 0)) return;
      g += `<path d="M${pts.map(p => `${f(p[0])},${f(p[1])}`).join(' L')}Z" fill="#2c3c36" stroke="#557a6a" stroke-width="${f(Rr / 260)}" stroke-linejoin="round"/>`;
    });
    // the dim amber of ordinary cities, then the pink lights
    const L = labs();
    let amber = '', pink = '';
    for (const lb of L) {
      const [px, py, cc] = proj(lb.p);
      if (cc < 0.05) continue;
      const edge = Math.min(1, cc * 3);
      amber += `<circle cx="${f(px)}" cy="${f(py)}" r="${f(Rr * (0.004 + 0.004 * lb.big))}" fill="#ffc870" opacity="${f(0.45 * edge)}"/>`;
      const on = cl((dots - lb.at * 0.85) / 0.15);
      if (on > 0.01) {
        const tw = 0.8 + 0.2 * Math.sin(t * 3 + lb.at * 40), rr = Rr * (0.007 + 0.008 * lb.big) * (0.6 + 0.4 * on);
        pink += `<circle cx="${f(px)}" cy="${f(py)}" r="${f(rr * 4)}" fill="#ff5a8a" opacity="${f(0.22 * on * tw * edge)}"/><circle cx="${f(px)}" cy="${f(py)}" r="${f(rr)}" fill="#ffd0e0" opacity="${f(on * edge)}"/>`;
      }
    }
    g += amber + `<g style="mix-blend-mode:screen">${pink}</g>`;
    // night side shading (sun far behind at the left) and a soft specular on the ocean
    g += `<circle r="${f(Rr)}" fill="url(#${id}o)" opacity="0.18"/></g><circle r="${f(Rr)}" fill="none" stroke="#7ab0f0" stroke-width="${f(Rr / 160)}" opacity="0.5"/>`;
    return g + '</g>';
  };
  P.LAB_SITES = () => labs();

  // ======================================================= glowing arcs leaving one city over the desk globe (for P.globe's
  // o.overOut): dests [[lon, lat, t0], ...], each grows from the origin over `dur` seconds after its t0
  P.globeArcs = (from, dests, t, dur = 0.7) => (lon0, lat0, Rr) => {
    const vec = (lo, la) => [Math.cos(la * D2R) * Math.cos(lo * D2R), Math.cos(la * D2R) * Math.sin(lo * D2R), Math.sin(la * D2R)];
    const toLL = v => [Math.atan2(v[1], v[0]) / D2R, Math.asin(cl(v[2], -1, 1)) / D2R];
    const proj3 = (lo, la, h) => {
      const l = lo * D2R - lon0, p = la * D2R, k = Rr * (1 + h);
      return [k * Math.cos(p) * Math.sin(l), -k * (Math.cos(lat0) * Math.sin(p) - Math.sin(lat0) * Math.cos(p) * Math.cos(l)), Math.sin(lat0) * Math.sin(p) + Math.cos(lat0) * Math.cos(p) * Math.cos(l)];
    };
    const A = vec(from[0], from[1]);
    let g = '', heads = '';
    const o0 = proj3(from[0], from[1], 0);
    if (o0[2] > 0) heads += `<circle cx="${f(o0[0])}" cy="${f(o0[1])}" r="${f(Rr * 0.05)}" fill="#ff6a90" opacity="0.35"/><circle cx="${f(o0[0])}" cy="${f(o0[1])}" r="${f(Rr * 0.018)}" fill="#ffe0ea"/>`;
    for (const [lo, la, t0] of dests) {
      const prog = cl((t - t0) / dur);
      if (prog <= 0) continue;
      const B = vec(lo, la), om = Math.acos(cl(A[0] * B[0] + A[1] * B[1] + A[2] * B[2], -1, 1)), so = Math.sin(om) || 1, N = 36;
      let d = '', on = false, last = null;
      for (let i = 0; i <= N; i++) {
        const u = prog * i / N, a = Math.sin((1 - u) * om) / so, b = Math.sin(u * om) / so;
        const v = [A[0] * a + B[0] * b, A[1] * a + B[1] * b, A[2] * a + B[2] * b], [l2, p2] = toLL(v), h = 0.22 * Math.sin(Math.PI * u) * Math.min(1, om / 1.2);
        const [px, py, cc] = proj3(l2, p2, h), vis = cc > 0 || Math.hypot(px, py) > Rr * 1.002;
        if (vis) { d += `${on ? 'L' : 'M'}${f(px)},${f(py)} `; on = true; last = [px, py]; } else on = false;
      }
      if (d) g += `<path d="${d}" stroke="#ff4a7a" stroke-width="${f(Rr * 0.03)}" fill="none" opacity="0.25" stroke-linecap="round"/><path d="${d}" stroke="#ffb8cc" stroke-width="${f(Rr * 0.009)}" fill="none" stroke-linecap="round"/>`;
      if (last && prog < 1) heads += `<circle cx="${f(last[0])}" cy="${f(last[1])}" r="${f(Rr * 0.04)}" fill="#ff6a90" opacity="0.4"/><circle cx="${f(last[0])}" cy="${f(last[1])}" r="${f(Rr * 0.015)}" fill="#fff"/>`;
      if (prog >= 1) { const [px, py, cc] = proj3(lo, la, 0), pl = cl((t - t0 - dur) / 0.5); if (cc > 0) heads += `<circle cx="${f(px)}" cy="${f(py)}" r="${f(Rr * (0.02 + 0.05 * pl))}" fill="none" stroke="#ffb0c8" stroke-width="${f(Rr * 0.008)}" opacity="${f(0.8 * (1 - pl))}"/><circle cx="${f(px)}" cy="${f(py)}" r="${f(Rr * 0.016)}" fill="#ffd0de"/>`; }
    }
    return `<g style="mix-blend-mode:screen">${g}</g>${heads}`;
  };

  // ======================================================= the operating lamp (1950s): a broad steel dome on a ceiling arm,
  // its underside a ring of bulbs ((x,y) = the centre of the dome's rim; side view seen a little from below)
  P.orLamp = (x, y, s, on = 1) => {
    const id = uid('ol');
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5a6064"/><stop offset="0.4" stop-color="#c8ced2"/><stop offset="1" stop-color="#4a5054"/></linearGradient></defs>`;
    g += `<rect x="-14" y="-900" width="28" height="760" fill="url(#${id})" ${olp(1.6)}/><rect x="-40" y="-160" width="80" height="50" rx="10" fill="url(#${id})" ${olp(1.6)}/>`;
    g += `<path d="M-300,0 C-280,-90 -150,-130 0,-130 C150,-130 280,-90 300,0Z" fill="url(#${id})" ${olp(2)}/><path d="M-260,-40 C-200,-90 -80,-110 0,-110" stroke="#f0f4f6" stroke-width="8" fill="none" opacity="0.5"/>`;
    g += `<ellipse cx="0" cy="0" rx="300" ry="52" fill="#7a8084" ${olp(2)}/><ellipse cx="0" cy="6" rx="262" ry="40" fill="${on > 0.5 ? '#fff8e6' : '#c8ccc8'}"/>`;
    for (let i = 0; i < 9; i++) { const a = i / 9 * TAU; g += `<ellipse cx="${f(Math.cos(a) * 180)}" cy="${f(6 + Math.sin(a) * 26)}" rx="34" ry="12" fill="#ffffff" opacity="${on > 0.5 ? 1 : 0.5}"/>`; }
    g += `<ellipse cx="0" cy="8" rx="58" ry="18" fill="#ffffff"/>`;
    return g + '</g>' + (on > 0.5 ? G.CINE.radial(x, y + 10 * s, 260 * s, '#fff6e0', 0.55 * on, 'screen') : '');
  };

  // ======================================================= the anaesthesia cart: gas cylinders, glass flowmeters, the black
  // breathing bag (it fills and empties with her breath) and a corrugated hose ((x,y) = the floor under its centre)
  P.anesthesia = (x, y, s, t, o = {}) => {
    const br = 0.5 + 0.5 * Math.sin(t * 1.6), hose = o.hose || [-300, -520];
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">`;
    g += `<path d="M0,-560 C${f(hose[0] * 0.3)},-640 ${f(hose[0] * 0.7)},${f(hose[1] - 120)} ${hose[0]},${hose[1]}" stroke="#141416" stroke-width="30" fill="none" stroke-linecap="round"/><path d="M0,-560 C${f(hose[0] * 0.3)},-640 ${f(hose[0] * 0.7)},${f(hose[1] - 120)} ${hose[0]},${hose[1]}" stroke="#3a3a3e" stroke-width="22" fill="none" stroke-dasharray="6 6"/>`;
    g += `<rect x="-150" y="-60" width="300" height="30" fill="#5a5e60" ${olp(1.6)}/><circle cx="-120" cy="-14" r="16" fill="#1a1a1a"/><circle cx="120" cy="-14" r="16" fill="#1a1a1a"/><rect x="-20" y="-700" width="40" height="640" fill="#8a9094" ${olp(1.6)}/>`;
    for (const [cx, col, top] of [[-110, '#3a6a4a', '#e8e8e0'], [-56, '#1a1a1c', '#f0f0ea'], [70, '#3a5a8a', '#3a5a8a'], [124, '#3a6a4a', '#e8e8e0']]) g += `<rect x="${cx - 26}" y="-460" width="52" height="400" rx="24" fill="${col}" ${olp(1.6)}/><rect x="${cx - 26}" y="-460" width="52" height="60" rx="24" fill="${top}" ${olp(1.2)}/><path d="M${cx - 14},-440 L${cx - 14},-80" stroke="#fff" stroke-width="5" opacity="0.18"/>`;
    g += `<rect x="-120" y="-720" width="240" height="160" rx="10" fill="#c8ccce" ${olp(1.6)}/>`;
    for (let i = 0; i < 4; i++) g += `<rect x="${-100 + i * 54}" y="-706" width="30" height="130" rx="6" fill="#e8f2f6" ${olp(1.2)}/><rect x="${-92 + i * 54}" y="${f(-640 - 30 * Math.sin(t * 2 + i) * 0.3 - i * 12)}" width="14" height="12" fill="${['#c83a3a', '#3a6aa8', '#e8b030', '#3a8a5a'][i]}"/>`;
    g += `<g transform="translate(150,-600)"><path d="M0,0 L20,0 L22,24 C${f(60 + 20 * br)},40 ${f(70 + 24 * br)},120 30,${f(170 + 10 * br)} C${f(-10 - 20 * br)},${f(200 + 10 * br)} ${f(-30 - 20 * br)},120 -2,24Z" fill="#141416" ${olp(1.4)}/><path d="M8,40 C30,70 30,120 18,150" stroke="#4a4a50" stroke-width="5" fill="none"/></g>`;
    return g + '</g>';
  };

  // ======================================================= the iron hospital bed from the side ((x,y) = the floor under the
  // head end; it runs `len` to the right). o.back: a raised backrest angle (deg). Returns the mattress top in .top
  P.bedSide = (x, y, len, s, o = {}) => {
    const leg = 330, mt = 80, head = 520, foot = 260, top = -leg - mt;
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">`;
    const rail = (x0, h) => `<path d="M${x0},0 L${x0},${-leg - h}" stroke="#e8eae4" stroke-width="22" stroke-linecap="round"/><path d="M${x0},0 L${x0},${-leg - h}" stroke="#20140c" stroke-width="1.6" opacity="0.6"/>`;
    // the head end: two posts, a top rail, bars
    g += rail(0, head) + rail(60, head - 20) + `<path d="M-10,${-leg - head + 30} C10,${-leg - head - 10} 50,${-leg - head - 10} 70,${-leg - head + 30}" stroke="#e8eae4" stroke-width="18" fill="none"/>`;
    for (let i = 0; i < 4; i++) g += `<path d="M${12 + i * 12},${-leg - 20} L${12 + i * 12},${-leg - head + 60}" stroke="#dcdcd4" stroke-width="7"/>`;
    // the frame rail, the springs' shadow, the far legs, the foot end
    g += `<path d="M0,${-leg + 10} L${len},${-leg + 10}" stroke="#d8dad4" stroke-width="20"/><path d="M40,${-leg + 30} L${len - 40},${-leg + 30}" stroke="#2a2a2a" stroke-width="12" opacity="0.35"/>`;
    g += rail(len, foot) + rail(len - 60, foot - 20) + `<path d="M${len - 70},${-leg - foot + 20} L${len + 10},${-leg - foot + 20}" stroke="#e8eae4" stroke-width="18"/>`;
    for (let i = 0; i < 3; i++) g += `<path d="M${len - 48 + i * 14},${-leg - 20} L${len - 48 + i * 14},${-leg - foot + 40}" stroke="#dcdcd4" stroke-width="7"/>`;
    g += `<circle cx="0" cy="8" r="14" fill="#3a3a3a"/><circle cx="${len}" cy="8" r="14" fill="#3a3a3a"/>`;
    // the mattress and the white sheet hanging over the side with folds
    g += `<path d="M30,${top} L${len - 30},${top} L${len - 30},${-leg} L30,${-leg}Z" fill="#e4e2da" ${olp(1.6)}/><path d="M30,${top} L${len - 30},${top} L${len - 26},${top + 120} C${len * 0.7},${top + 110} ${len * 0.3},${top + 128} 26,${top + 116}Z" fill="#f6f6f2" ${olp(1.4)}/>`;
    for (let i = 1; i < 8; i++) g += `<path d="M${f(30 + i * (len - 60) / 8)},${top + 10} q-6,60 2,${108 + (i % 3) * 6}" stroke="#d4d2c8" stroke-width="5" fill="none"/>`;
    // the chart clipboard hanging on the foot rail
    if (o.chart !== false) g += `<rect x="${len + 16}" y="${-leg - 160}" width="90" height="120" rx="4" fill="#8a6a44" ${olp(1.4)}/><rect x="${len + 24}" y="${-leg - 148}" width="74" height="100" fill="#f6f2e6"/>` + Array.from({ length: 6 }, (_, i) => `<path d="M${len + 30},${-leg - 136 + i * 15} l${50 + (i % 3) * 8},0" stroke="#3a4a6a" stroke-width="2.4" opacity="0.7"/>`).join('');
    return g + '</g>';
  };
  P.BED_TOP = s => -(330 + 80) * s;

  // ======================================================= a bedside cabinet with a glass water jug and a tumbler
  P.bedCabinet = (x, y, s) => `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><rect x="-90" y="-360" width="180" height="360" fill="#e2e4dc" ${olp(1.8)}/><rect x="-74" y="-300" width="148" height="120" fill="#d4d6ce" ${olp(1.2)}/><circle cx="0" cy="-240" r="8" fill="#9a9a90"/>` +
    `<path d="M-60,-360 L-60,-470 C-60,-500 -10,-500 -10,-470 L-10,-360Z" fill="#dff0f4" fill-opacity="0.5" ${olp(1.4)}/><path d="M-58,-360 L-58,-430 L-12,-430 L-12,-360Z" fill="#cfe8f0" opacity="0.6"/><path d="M-10,-470 q20,0 22,24" stroke="#20140c" stroke-width="1.6" fill="none"/>` +
    `<path d="M20,-360 L24,-420 L66,-420 L70,-360Z" fill="#e6f2f6" fill-opacity="0.5" ${olp(1.2)}/><path d="M28,-412 L32,-366" stroke="#fff" stroke-width="3" opacity="0.6"/></g>`;
})(window);
