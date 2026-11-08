// Scenery building blocks: flat geometric period sets, depth layers, light and atmosphere.
(function (G) {
  const { shade, rng, f, OUT } = G.RIG;
  const S = {};

  S.sky = (W, H, top, bot, y1 = H) => `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bot}"/></linearGradient></defs><rect width="${W}" height="${y1}" fill="url(#sky)"/>`;

  S.sun = (x, y, r, c, glowC, glowR = 4) =>
    `<circle cx="${x}" cy="${y}" r="${r * glowR}" fill="${glowC}" opacity="0.55" filter="url(#glow)"/>` +
    `<circle cx="${x}" cy="${y}" r="${r * 1.6}" fill="${glowC}" opacity="0.6" filter="url(#soft2)"/>` +
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;

  S.hills = (W, y, c, amp = 40, seed = 1) => {
    const r = rng(seed); let d = `M0,${y}`;
    for (let x = 0; x <= W + 200; x += 200) d += ` Q${x + 100},${f(y - amp * (0.4 + r()))} ${x + 200},${f(y - amp * r() * 0.6)}`;
    return `<path d="${d} L${W + 200},${y + 400} L0,${y + 400}Z" fill="${c}"/>`;
  };

  // thatched cottage, front view. (x = centre, y = ground)
  S.cottage = (x, y, w, h, wall = '#e2d3b2', roof = '#c99a4a') => {
    const rh = h * 0.95;
    return `<g>` +
      `<rect x="${f(x - w / 2)}" y="${f(y - h)}" width="${f(w)}" height="${f(h)}" fill="${wall}"/>` +
      `<rect x="${f(x - w / 2)}" y="${f(y - h)}" width="${f(w)}" height="${f(h * 0.25)}" fill="#000" opacity="0.12"/>` +
      `<path d="M${f(x - w * 0.62)},${f(y - h + 4)} L${f(x)},${f(y - h - rh)} L${f(x + w * 0.62)},${f(y - h + 4)}Z" fill="${roof}"/>` +
      `<path d="M${f(x)},${f(y - h - rh)} L${f(x + w * 0.62)},${f(y - h + 4)} L${f(x + w * 0.1)},${f(y - h + 4)}Z" fill="#000" opacity="0.12"/>` +
      `<rect x="${f(x - w * 0.1)}" y="${f(y - h * 0.55)}" width="${f(w * 0.2)}" height="${f(h * 0.55)}" fill="${shade(wall, -0.55)}"/>` +
      `</g>`;
  };

  S.church = (x, y, s, wall = '#d9d2c4', roof = '#6d6f78') => {
    const w = 260 * s, h = 120 * s, tw = 70 * s, th = 230 * s;
    return `<g>` +
      `<rect x="${f(x - w / 2)}" y="${f(y - h)}" width="${f(w)}" height="${f(h)}" fill="${wall}"/>` +
      `<path d="M${f(x - w / 2 - 10 * s)},${f(y - h)} L${f(x - w / 2 + 40 * s)},${f(y - h - 60 * s)} L${f(x + w / 2 - 40 * s)},${f(y - h - 60 * s)} L${f(x + w / 2 + 10 * s)},${f(y - h)}Z" fill="${roof}"/>` +
      `<rect x="${f(x - tw / 2)}" y="${f(y - th)}" width="${f(tw)}" height="${f(th)}" fill="${shade(wall, 0.05)}"/>` +
      `<rect x="${f(x)}" y="${f(y - th)}" width="${f(tw / 2)}" height="${f(th)}" fill="#000" opacity="0.08"/>` +
      `<path d="M${f(x - tw / 2 - 4 * s)},${f(y - th)} L${f(x)},${f(y - th - 110 * s)} L${f(x + tw / 2 + 4 * s)},${f(y - th)}Z" fill="${roof}"/>` +
      `<rect x="${f(x - 9 * s)}" y="${f(y - th + 50 * s)}" width="${f(18 * s)}" height="${f(30 * s)}" rx="${f(9 * s)}" fill="#3a3530"/>` +
      `</g>`;
  };

  S.tree = (x, y, r, c = '#5d7a46', trunk = '#5a4330') =>
    `<rect x="${f(x - r * 0.1)}" y="${f(y - r * 1.4)}" width="${f(r * 0.2)}" height="${f(r * 1.4)}" fill="${trunk}"/>` +
    `<circle cx="${f(x - r * 0.45)}" cy="${f(y - r * 1.5)}" r="${f(r * 0.7)}" fill="${shade(c, -0.08)}"/>` +
    `<circle cx="${f(x + r * 0.45)}" cy="${f(y - r * 1.55)}" r="${f(r * 0.72)}" fill="${shade(c, -0.12)}"/>` +
    `<circle cx="${f(x)}" cy="${f(y - r * 2)}" r="${f(r * 0.8)}" fill="${c}"/>`;

  // furrowed field converging to a vanishing point
  S.furrows = (W, H, vx, vy, base, line, n = 22, spread = 380, opacity = 0.35, width = 8) => {
    let g = `<rect x="-200" y="${vy}" width="${W + 400}" height="${H - vy + 200}" fill="${base}"/>`;
    for (let i = -n; i <= n; i++) {
      const xb = vx + i * spread;
      g += `<path d="M${vx},${vy} L${f(xb)},${H + 200}" stroke="${line}" stroke-width="${width}" opacity="${opacity}"/>`;
    }
    return g;
  };

  S.wheat = (x0, x1, yBase, hMin, hMax, n, seed, col = '#d9a84a') => {
    const r = rng(seed); let g = '';
    for (let i = 0; i < n; i++) {
      const x = x0 + (x1 - x0) * r(), hh = hMin + (hMax - hMin) * r(), lean = (r() - 0.5) * 60;
      const c = shade(col, (r() - 0.5) * 0.3), tx = x + lean, ty = yBase - hh;
      g += `<path d="M${f(x)},${yBase} Q${f(x + lean * 0.2)},${f(yBase - hh * 0.5)} ${f(tx)},${f(ty)}" stroke="${shade(c, -0.15)}" stroke-width="5" fill="none"/>`;
      for (let k = 0; k < 7; k++) {
        const yy = ty + 8 + k * 11, xx = tx + lean * 0.02 * k;
        g += `<ellipse cx="${f(xx - 7)}" cy="${f(yy)}" rx="5" ry="10" transform="rotate(-25 ${f(xx - 7)} ${f(yy)})" fill="${c}"/>` +
          `<ellipse cx="${f(xx + 7)}" cy="${f(yy)}" rx="5" ry="10" transform="rotate(25 ${f(xx + 7)} ${f(yy)})" fill="${c}"/>`;
      }
      g += `<ellipse cx="${f(tx)}" cy="${f(ty)}" rx="5" ry="11" fill="${c}"/>`;
    }
    return g;
  };

  S.particles = (W, H, n, seed, col, rMin, rMax, opMin = 0.3, opMax = 0.9, blur = '') => {
    const r = rng(seed); let g = '';
    for (let i = 0; i < n; i++) g += `<circle cx="${f(r() * W)}" cy="${f(r() * H)}" r="${f(rMin + r() * (rMax - rMin))}" fill="${col}" opacity="${f(opMin + r() * (opMax - opMin))}"/>`;
    return `<g ${blur ? `filter="url(#${blur})"` : ''}>${g}</g>`;
  };

  S.vignette = (W, H, op = 0.55, col = '#000') => `<defs><radialGradient id="vig" cx="50%" cy="48%" r="75%"><stop offset="0.55" stop-color="${col}" stop-opacity="0"/><stop offset="1" stop-color="${col}" stop-opacity="${op}"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#vig)"/>`;

  S.grain = (W, H, op = 0.07) => `<rect width="${W}" height="${H}" filter="url(#grain)" opacity="${op}" style="mix-blend-mode:overlay"/>`;

  S.grade = (W, H, col, op, mode = 'soft-light') => `<rect width="${W}" height="${H}" fill="${col}" opacity="${op}" style="mix-blend-mode:${mode}"/>`;

  S.lightPool = (x, y, rx, ry, col, op) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${col}" opacity="${op}" filter="url(#glow)" style="mix-blend-mode:screen"/>`;

  S.loaf = (x, y, w, h, c = '#5a3b26') =>
    `<g filter="url(#airS)"><ellipse cx="${x}" cy="${y}" rx="${w / 2}" ry="${h / 2}" fill="${c}" stroke="${OUT}" stroke-width="3"/>` +
    `<ellipse cx="${x - w * 0.08}" cy="${y - h * 0.18}" rx="${w * 0.3}" ry="${h * 0.16}" fill="${shade(c, 0.18)}" opacity="0.6"/>` +
    [-0.22, 0, 0.22].map(k => `<path d="M${f(x + k * w - w * 0.06)},${f(y - h * 0.32)} q${f(w * 0.06)},${f(h * 0.25)} ${f(w * 0.12)},${f(h * 0.3)}" stroke="${shade(c, -0.35)}" stroke-width="3" fill="none"/>`).join('') + `</g>`;

  S.sickle = (x, y, s, rot) =>
    `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})"><rect x="-6" y="0" width="12" height="70" rx="5" fill="#6b4a2c" stroke="${OUT}" stroke-width="2.5"/>` +
    `<path d="M0,0 C-10,-90 70,-150 130,-110 C80,-130 20,-90 10,0Z" fill="#a9b0b8" stroke="${OUT}" stroke-width="2.5"/><path d="M8,-10 C10,-80 60,-125 115,-112" stroke="#e8edf2" stroke-width="3" fill="none" opacity="0.8"/></g>`;

  S.staff = (x1, y1, x2, y2, w = 14) => `<path d="M${x1},${y1} L${x2},${y2}" stroke="${OUT}" stroke-width="${w + 6}" stroke-linecap="round"/><path d="M${x1},${y1} L${x2},${y2}" stroke="#7a5634" stroke-width="${w}" stroke-linecap="round"/><path d="M${x1},${y1} L${x2},${y2}" stroke="#9a7450" stroke-width="${w * 0.3}" stroke-linecap="round" opacity="0.7" transform="translate(-3,0)"/>`;

  G.SCN = S;
})(window);
