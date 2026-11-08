// Cut-out character rig v2, matched to the reference shorts:
// thin constant outlines, airbrushed gradients, blurred pleats/folds, detailed hands and faces.
// Hand rules: arms are drawn after torso/head/props (always in front of the belly); characters are
// never mirrored; each hand knows it is a RIGHT or LEFT hand and which side faces camera.
(function (G) {
  const OUT = '#24170e', OW = 2.1;
  const NS = 'vector-effect="non-scaling-stroke"';
  const ol = (w = OW) => `stroke="${OUT}" stroke-width="${w}" ${NS} stroke-linejoin="round" stroke-linecap="round"`;
  let UID = 0; const uid = p => p + (++UID);
  const f = n => Math.round(n * 100) / 100;
  const hex2rgb = h => { const c = parseInt(h.slice(1), 16); return [c >> 16, (c >> 8) & 255, c & 255]; };
  const rgb2hex = (r, g, b) => '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const shade = (h, a) => { const [r, g, b] = hex2rgb(h); const t = a < 0 ? 0 : 255, p = Math.abs(a); return rgb2hex(r + (t - r) * p, g + (t - g) * p, b + (t - b) * p); };
  const mix = (h1, h2, p) => { const a = hex2rgb(h1), b = hex2rgb(h2); return rgb2hex(a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p, a[2] + (b[2] - a[2]) * p); };
  const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

  // gradients
  const cylGrad = (id, c, k = 1) => `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${shade(c, -0.26 * k)}"/><stop offset="0.3" stop-color="${shade(c, 0.1 * k)}"/><stop offset="0.62" stop-color="${c}"/><stop offset="1" stop-color="${shade(c, -0.3 * k)}"/></linearGradient>`;
  const vGrad = (id, top, bot) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bot}"/></linearGradient>`;

  function defs() {
    const inner = (id, sd, op) => `<filter id="${id}" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
 <feGaussianBlur in="SourceAlpha" stdDeviation="${sd}" result="b"/>
 <feComposite in="SourceAlpha" in2="b" operator="arithmetic" k1="0" k2="1" k3="-1" k4="0" result="e"/>
 <feFlood flood-color="#1c0e05" flood-opacity="${op}"/><feComposite in2="e" operator="in" result="s"/>
 <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="s"/></feMerge></filter>`;
    const blur = (id, sd, pad = 30) => `<filter id="${id}" x="-${pad}%" y="-${pad}%" width="${100 + pad * 2}%" height="${100 + pad * 2}%"><feGaussianBlur stdDeviation="${sd}"/></filter>`;
    return inner('air', 16, 0.42) + inner('airM', 9, 0.4) + inner('airS', 5, 0.38) +
      blur('b1', 1) + blur('b2', 2.5) + blur('b4', 4.5) + blur('b8', 8) + blur('b14', 14) +
      blur('soft', 4, 60) + blur('soft2', 9, 60) + blur('glow', 40, 250) +
      blur('dof1', 2.5, 10) + blur('dof2', 6, 10) + blur('dof3', 12, 10) + blur('dof4', 22, 20) +
      `<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>`;
  }

  const DIMS = {
    kid: { headY: -500, shY: -394, shX: 118, wY: -236, wX: 110, hemY: -108, hemX: 128, legX: 34, legW: 50, foot: 54, ua: 122, fa: 106, sw: 66, hand: 84 },
    man: { headY: -935, shY: -812, shX: 182, wY: -584, wX: 164, hemY: -330, hemX: 190, legX: 62, legW: 80, foot: 82, ua: 178, fa: 160, sw: 92, hand: 118 },
    woman: { headY: -890, shY: -778, shX: 148, wY: -600, wX: 128, hemY: -6, hemX: 200, legX: 0, legW: 0, foot: 60, ua: 168, fa: 150, sw: 80, hand: 104 }
  };

  // ---------------- hands ----------------
  // local frame: wrist at origin, fingers point along +y. t = side of the thumb (+1 => local +x)
  function hand(o) {
    const Sz = o.size, skin = o.skin;
    let [dx, dy] = o.dir; const n = Math.hypot(dx, dy) || 1; dx /= n; dy /= n;
    const a = Math.atan2(-dx, dy), lx = [Math.cos(a), Math.sin(a)];
    let t;
    if (o.thumb && o.thumb !== 'auto') {
      const w = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[o.thumb];
      t = (lx[0] * w[0] + lx[1] * w[1]) >= 0 ? 1 : -1;
    } else t = (o.side === 'R' ? -1 : 1) * (o.facing === 'palm' ? 1 : -1);
    const id = uid('hg');
    const pw = Sz * 0.6, pl = Sz * 0.46, fw = pw / 4 * 1.1;
    const curl = o.pose === 'relaxed' ? 0.82 : 1;
    const lens = [0.42, 0.47, 0.44, 0.35].map(v => v * Sz * curl); // index, middle, ring, pinky
    const xs = [0, 1, 2, 3].map(i => t * (pw / 2 - fw / 2 - i * (pw - fw) / 3));
    const pieces = []; // [svgShape] drawn twice (outline pass + fill pass)
    const cap = (x1, y1, x2, y2, w) => { const L = Math.hypot(x2 - x1, y2 - y1), r = Math.atan2(-(x2 - x1), y2 - y1) * 180 / Math.PI; return `<rect x="${f(-w / 2)}" y="${f(-w / 2)}" width="${f(w)}" height="${f(L + w)}" rx="${f(w / 2)}" transform="translate(${f(x1)},${f(y1)}) rotate(${f(r)})"/>`; };
    const fist = o.pose === 'fist' || o.pose === 'point';
    if (!fist) {
      pieces.push(`<path d="M${f(-pw * 0.44)},${f(-Sz * 0.04)} L${f(-pw / 2)},${f(pl * 0.75)} Q${f(-pw / 2)},${f(pl + fw * 0.3)} ${f(-pw * 0.3)},${f(pl + fw * 0.3)} L${f(pw * 0.3)},${f(pl + fw * 0.3)} Q${f(pw / 2)},${f(pl + fw * 0.3)} ${f(pw / 2)},${f(pl * 0.75)} L${f(pw * 0.44)},${f(-Sz * 0.04)}Z"/>`);
      for (let i = 0; i < 4; i++) { const spread = (i - 1.5) * 0.04 * -t; pieces.push(cap(xs[i], pl * 0.85, xs[i] + spread * Sz, pl * 0.85 + lens[i] - fw / 2, fw * (i === 3 ? 0.9 : 1))); }
      const ang = (o.pose === 'relaxed' ? 22 : 42) * Math.PI / 180, tb = [t * pw * 0.36, pl * 0.28], tl = Sz * 0.36;
      pieces.unshift(cap(tb[0], tb[1], tb[0] + t * Math.sin(ang) * tl, tb[1] + Math.cos(ang) * tl, fw * 1.18));
    } else {
      pieces.push(`<rect x="${f(-pw * 0.52)}" y="${f(-Sz * 0.04)}" width="${f(pw * 1.04)}" height="${f(pl + fw * 0.6)}" rx="${f(pw * 0.22)}"/>`);
      for (let i = 0; i < 4; i++) pieces.push(`<rect x="${f(xs[i] - fw * 0.52)}" y="${f(pl * 0.62)}" width="${f(fw * 1.04)}" height="${f(fw * 1.25)}" rx="${f(fw * 0.48)}"/>`);
      if (o.pose === 'point') pieces.push(cap(xs[0], pl, xs[0], pl + Sz * 0.5, fw));
      pieces.push(cap(t * pw * 0.5, pl * 0.12, t * pw * 0.02, pl * 0.48, fw * 1.15));
    }
    const all = pieces.join('');
    let g = `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${shade(skin, -0.1)}"/><stop offset="0.45" stop-color="${shade(skin, 0.1)}"/><stop offset="1" stop-color="${shade(skin, -0.14)}"/></linearGradient></defs>`;
    g += `<g fill="${OUT}" stroke="${OUT}" stroke-width="${OW * 2}" ${NS} stroke-linejoin="round">${all}</g>`;
    g += `<g fill="url(#${id})">${all}</g>`;
    const ln = `stroke="${shade(skin, -0.42)}" stroke-width="1.3" ${NS} stroke-linecap="round" fill="none"`;
    if (!fist) {
      for (let i = 0; i < 3; i++) { const xm = (xs[i] + xs[i + 1]) / 2; g += `<path d="M${f(xm)},${f(pl * 0.92)} L${f(xm + (i - 1) * 0.03 * -t * Sz)},${f(pl * 0.85 + Math.min(lens[i], lens[i + 1]) - fw * 0.3)}" ${ln} opacity="0.75"/>`; }
      if (o.facing === 'palm') {
        g += `<path d="M${f(-pw * 0.32)},${f(pl * 0.45)} Q0,${f(pl * 0.8)} ${f(pw * 0.3)},${f(pl * 0.4)}" ${ln} opacity="0.55"/><path d="M${f(t * pw * 0.2)},${f(pl * 0.1)} Q${f(t * pw * 0.05)},${f(pl * 0.5)} ${f(-t * pw * 0.05)},${f(pl * 0.9)}" ${ln} opacity="0.45"/>`;
      } else {
        for (let i = 0; i < 4; i++) g += `<circle cx="${f(xs[i])}" cy="${f(pl * 0.86)}" r="${f(fw * 0.2)}" fill="${shade(skin, 0.35)}" opacity="0.85"/>` +
          `<path d="M${f(xs[i] - fw * 0.2)},${f(pl * 0.85 + lens[i] * 0.48)} l${f(fw * 0.4)},0" ${ln} opacity="0.5"/>`;
      }
    } else {
      for (let i = 0; i < 3; i++) { const xm = (xs[i] + xs[i + 1]) / 2; g += `<path d="M${f(xm)},${f(pl * 0.7)} L${f(xm)},${f(pl * 0.62 + fw * 1.2)}" ${ln} opacity="0.75"/>`; }
      for (let i = 0; i < 4; i++) g += `<circle cx="${f(xs[i])}" cy="${f(pl * 0.66)}" r="${f(fw * 0.18)}" fill="${shade(skin, 0.35)}" opacity="0.8"/>`;
    }
    return `<g transform="translate(${f(o.x)},${f(o.y)}) rotate(${f(a * 180 / Math.PI)})">${g}</g>`;
  }

  // ---------------- arms ----------------
  function capsule(A, B, w, fill, extra = '') {
    const L = Math.hypot(B[0] - A[0], B[1] - A[1]), r = Math.atan2(-(B[0] - A[0]), B[1] - A[1]) * 180 / Math.PI;
    return `<g transform="translate(${f(A[0])},${f(A[1])}) rotate(${f(r)})"><rect x="${f(-w / 2)}" y="${f(-w * 0.42)}" width="${f(w)}" height="${f(L + w * 0.62)}" rx="${f(w * 0.48)}" fill="${fill}" ${ol()}/>${extra}</g>`;
  }
  function arm(side, sh, o, D, C) {
    const L1 = D.ua * (o.us || 1), L2 = D.fa * (o.fs || 1);
    let [hx, hy] = o.hand, vx = hx - sh[0], vy = hy - sh[1], d = Math.hypot(vx, vy);
    const maxd = (L1 + L2) * 0.995, mind = Math.abs(L1 - L2) + 2;
    if (d > maxd) { hx = sh[0] + vx / d * maxd; hy = sh[1] + vy / d * maxd; d = maxd; }
    if (d < mind) { hx = sh[0] + vx / d * mind; hy = sh[1] + vy / d * mind; d = mind; }
    const base = Math.atan2(hy - sh[1], hx - sh[0]);
    const off = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d))));
    const e1 = [sh[0] + L1 * Math.cos(base + off), sh[1] + L1 * Math.sin(base + off)];
    const e2 = [sh[0] + L1 * Math.cos(base - off), sh[1] + L1 * Math.sin(base - off)];
    const lat = side === 'R' ? -1 : 1, score = e => e[1] + e[0] * lat * 0.45;
    let E = score(e1) > score(e2) ? e1 : e2; if (o.elbow === 'in') E = E === e1 ? e2 : e1;
    const W = [hx, hy];
    let dir = [W[0] - E[0], W[1] - E[1]];
    if (o.bend) { const b = Math.max(-60, Math.min(60, o.bend)) * Math.PI / 180; dir = [dir[0] * Math.cos(b) - dir[1] * Math.sin(b), dir[0] * Math.sin(b) + dir[1] * Math.cos(b)]; }
    const sl = o.sleeve || C.sleeve, gid = uid('sg'), sw = D.sw;
    const bare = o.bare; // rolled sleeves: forearm is skin
    let g = `<defs>${cylGrad(gid, sl)}${cylGrad(gid + 'k', C.skin, 0.6)}</defs>`;
    const fold = `<path d="M${f(-sw * 0.18)},${f(Math.hypot(E[0] - sh[0], E[1] - sh[1]) * 0.55)} q${f(sw * 0.2)},${f(sw * 0.12)} ${f(sw * 0.38)},0" stroke="${shade(sl, -0.4)}" stroke-width="2" ${NS} fill="none" opacity="0.6" filter="url(#b1)"/>`;
    g += capsule(sh, E, sw, `url(#${gid})`, fold);
    const fl = Math.hypot(W[0] - E[0], W[1] - E[1]);
    const Wc = [E[0] + (W[0] - E[0]) * (1 - sw * 0.12 / fl), E[1] + (W[1] - E[1]) * (1 - sw * 0.12 / fl)];
    g += capsule(E, Wc, sw * (bare ? 0.7 : 0.9), bare ? `url(#${gid}k)` : `url(#${gid})`);
    const handSvg = o.pose === 'none' ? '' : hand({ x: W[0], y: W[1], dir, side, facing: o.facing || 'back', thumb: o.thumb || 'auto', pose: o.pose || 'relaxed', size: D.hand, skin: C.skin });
    if (!o.detachHand) g += handSvg;
    return { svg: `<g filter="url(#airM)">${g}</g>`, hand: o.detachHand ? handSvg : '', W, E };
  }
  function restHand(kind, side) { const D = DIMS[kind], s = side === 'R' ? -1 : 1; return [s * (D.shX - D.sw * 0.2), D.shY + D.sw * 0.45 + (D.ua + D.fa) * 0.95]; }

  // ---------------- faces ----------------
  function eyes(F, kind, skin) {
    const K = kind === 'kid' ? { x: 39, y: 12, rx: 22, ry: 15.5, ir: 12.5, lw: 5.2 } : kind === 'woman' ? { x: 35, y: 6, rx: 19, ry: 11, ir: 10, lw: 4.8 } : { x: 37, y: 4, rx: 19, ry: 9.5, ir: 8.6, lw: 5.2 };
    const st = F.eyes || 'open', lk = F.look || [0, 0], iris = F.iris || '#8a6a42';
    let g = '';
    for (const s of [-1, 1]) {
      const cx = s * K.x + (F.turn || 0) * 8, cy = K.y, id = uid('ec');
      let ry = K.ry * (st === 'wide' ? 1.18 : st === 'squint' ? 0.55 : st === 'half' ? 0.75 : 1);
      const crease = `<path d="M${f(cx - K.rx * 0.7)},${f(cy - ry * 1.2 - 3)} Q${f(cx)},${f(cy - ry * 1.75 - 3)} ${f(cx + K.rx * 0.78)},${f(cy - ry * 1.15 - 3)}" stroke="${shade(skin, -0.32)}" stroke-width="1.6" ${NS} fill="none" opacity="0.75"/>`;
      const bag = `<path d="M${f(cx - K.rx * 0.65)},${f(cy + K.ry * 1.25)} Q${f(cx)},${f(cy + K.ry * 1.62)} ${f(cx + K.rx * 0.6)},${f(cy + K.ry * 1.22)}" stroke="${shade(skin, -0.25)}" stroke-width="1.4" ${NS} fill="none" opacity="0.6"/>`;
      if (st === 'closed') {
        g += `<path d="M${f(cx - K.rx)},${f(cy)} Q${f(cx)},${f(cy + K.ry * 0.55)} ${f(cx + K.rx)},${f(cy)}" stroke="#1b110b" stroke-width="${K.lw}" stroke-linecap="round" fill="none"/>` + crease + bag;
        continue;
      }
      const top = kind === 'kid' ? cy - ry * 1.42 : kind === 'man' ? cy - ry * 1.3 : cy - ry * 1.5, bot = cy + ry * 1.2;
      const shape = `M${f(cx - K.rx)},${f(cy + 1)} C${f(cx - K.rx * 0.8)},${f(top)} ${f(cx + K.rx * 0.8)},${f(top)} ${f(cx + K.rx)},${f(cy - 1)} C${f(cx + K.rx * 0.75)},${f(bot)} ${f(cx - K.rx * 0.75)},${f(bot)} ${f(cx - K.rx)},${f(cy + 1)}Z`;
      const ix = cx + lk[0] * K.rx * 0.4, iy = cy + lk[1] * ry * 0.35 + (st === 'half' ? ry * 0.15 : 0), ir = K.ir * (st === 'wide' ? 0.85 : 1);
      g += `<defs><clipPath id="${id}"><path d="${shape}"/></clipPath><radialGradient id="${id}i" cx="50%" cy="55%" r="55%"><stop offset="0" stop-color="${shade(iris, 0.35)}"/><stop offset="0.7" stop-color="${iris}"/><stop offset="1" stop-color="${shade(iris, -0.45)}"/></radialGradient></defs>`;
      g += `<path d="${shape}" fill="#fbf8f3"/>`;
      g += `<g clip-path="url(#${id})"><circle cx="${f(ix)}" cy="${f(iy)}" r="${f(ir)}" fill="url(#${id}i)"/><circle cx="${f(ix)}" cy="${f(iy)}" r="${f(ir)}" fill="none" stroke="${shade(iris, -0.55)}" stroke-width="1.6" ${NS}/>` +
        `<circle cx="${f(ix)}" cy="${f(iy)}" r="${f(ir * 0.45)}" fill="#140d08"/><circle cx="${f(ix + ir * 0.36)}" cy="${f(iy - ir * 0.36)}" r="${f(ir * 0.3)}" fill="#fff"/><circle cx="${f(ix - ir * 0.32)}" cy="${f(iy + ir * 0.34)}" r="${f(ir * 0.13)}" fill="#fff" opacity="0.7"/>` +
        `<rect x="${f(cx - K.rx)}" y="${f(top - 4)}" width="${f(K.rx * 2)}" height="${f(ry * 0.9)}" fill="#6b4a3a" opacity="0.16" filter="url(#b2)"/>`;
      if (st === 'half' || st === 'squint') g += `<path d="M${f(cx - K.rx - 2)},${f(top - 6)} L${f(cx + K.rx + 2)},${f(top - 6)} L${f(cx + K.rx + 2)},${f(cy - ry * (st === 'squint' ? 0.2 : 0.55))} Q${f(cx)},${f(cy - ry * (st === 'squint' ? 0.5 : 0.9))} ${f(cx - K.rx - 2)},${f(cy - ry * (st === 'squint' ? 0.2 : 0.55))}Z" fill="${skin}"/>`;
      g += `</g>`;
      const lidY = st === 'half' ? cy - ry * 0.55 : st === 'squint' ? cy - ry * 0.2 : null;
      if (lidY === null) g += `<path d="M${f(cx - K.rx * 1.08)},${f(cy + 2)} C${f(cx - K.rx * 0.8)},${f(top - 2)} ${f(cx + K.rx * 0.8)},${f(top - 2)} ${f(cx + K.rx * 1.12)},${f(cy - 1)}" stroke="#1b110b" stroke-width="${K.lw}" stroke-linecap="round" fill="none"/>`;
      else g += `<path d="M${f(cx - K.rx * 1.08)},${f(lidY + 3)} Q${f(cx)},${f(lidY - ry * 0.45)} ${f(cx + K.rx * 1.12)},${f(lidY + 1)}" stroke="#1b110b" stroke-width="${K.lw}" stroke-linecap="round" fill="none"/>`;
      g += `<path d="M${f(cx - K.rx * 0.8)},${f(cy + ry * 0.6)} C${f(cx - K.rx * 0.4)},${f(bot + 1)} ${f(cx + K.rx * 0.4)},${f(bot + 1)} ${f(cx + K.rx * 0.82)},${f(cy + ry * 0.58)}" stroke="${shade(skin, -0.45)}" stroke-width="1.5" ${NS} fill="none" opacity="0.8"/>`;
      g += crease + bag;
      if (kind !== 'kid' && F.age) g += `<path d="M${f(cx + s * K.rx * 1.25)},${f(cy - 4)} l${f(s * 9)},-5 M${f(cx + s * K.rx * 1.25)},${f(cy + 3)} l${f(s * 10)},3" stroke="${shade(skin, -0.3)}" stroke-width="1.4" ${NS} opacity="0.7"/>`;
    }
    return { svg: g, K };
  }

  function brows(F, kind, skin, col, K) {
    const w = kind === 'man' ? 7.5 : kind === 'woman' ? 4 : 4.2, y0 = K.y - K.ry * 2.15 - (kind === 'kid' ? 6 : 8);
    let g = '';
    for (const s of [-1, 1]) {
      const cx = s * K.x + (F.turn || 0) * 8;
      const xi = cx - s * K.rx * 0.95, xo = cx + s * K.rx * 1.05;
      const b = F.brows || 'neutral';
      const di = b === 'worried' || b === 'sad' ? -11 : b === 'angry' ? 9 : b === 'raised' ? -10 : 0;
      const dO = b === 'worried' || b === 'sad' ? 3 : b === 'angry' ? -5 : b === 'raised' ? -8 : 0;
      g += `<path d="M${f(xi)},${f(y0 + di)} Q${f(cx + s * 4)},${f(y0 - 8 + (di + dO) / 2)} ${f(xo)},${f(y0 + dO + 2)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round" fill="none" filter="url(#b1)" opacity="0.92"/>`;
    }
    if (F.brows === 'worried' || F.brows === 'sad') g += `<path d="M-6,${f(y0 - 6)} Q0,${f(y0 - 16)} 6,${f(y0 - 6)}" stroke="${shade(skin, -0.3)}" stroke-width="1.8" ${NS} fill="none" opacity="0.8"/><path d="M-22,${f(y0 - 22)} Q0,${f(y0 - 28)} 22,${f(y0 - 22)}" stroke="${shade(skin, -0.22)}" stroke-width="1.4" ${NS} fill="none" opacity="0.55"/>`;
    if (F.brows === 'angry') g += `<path d="M-5,${f(y0 - 2)} l2,12 M5,${f(y0 - 2)} l-2,12" stroke="${shade(skin, -0.3)}" stroke-width="1.6" ${NS} opacity="0.7"/>`;
    return g;
  }

  function mouth(type, y, skin, kind) {
    const lip = mix(shade(skin, -0.25), '#c0584a', 0.45), dark = '#3a140f', s = kind === 'kid' ? 1 : 1.15;
    const L = `stroke="${lip}" stroke-width="2.4" ${NS} fill="none" stroke-linecap="round"`;
    switch (type) {
      case 'o': return `<ellipse cx="0" cy="${y}" rx="${9 * s}" ry="${10 * s}" fill="${dark}" stroke="${lip}" stroke-width="2.4" ${NS}/><ellipse cx="0" cy="${y + 5 * s}" rx="${6 * s}" ry="${3.6 * s}" fill="#c45a5a"/>`;
      case 'open': return `<path d="M${-12 * s},${y - 3} Q0,${y - 6} ${12 * s},${y - 3} Q${9 * s},${y + 9 * s} 0,${y + 9 * s} Q${-9 * s},${y + 9 * s} ${-12 * s},${y - 3}Z" fill="${dark}" stroke="${lip}" stroke-width="2.4" ${NS}/><path d="M${-9 * s},${y - 3} L${9 * s},${y - 3} L${8 * s},${y + 1} L${-8 * s},${y + 1}Z" fill="#f2ede4"/><ellipse cx="0" cy="${y + 6 * s}" rx="${5 * s}" ry="${2.4 * s}" fill="#c45a5a"/>`;
      case 'smile': return `<path d="M${-15 * s},${y - 3} Q0,${y + 11 * s} ${15 * s},${y - 3}" ${L} stroke-width="3"/>`;
      case 'frown': return `<path d="M${-12 * s},${y + 4} Q0,${y - 5} ${12 * s},${y + 4}" ${L} stroke-width="3"/>`;
      case 'grimace': return `<rect x="${-17 * s}" y="${y - 8 * s}" width="${34 * s}" height="${16 * s}" rx="${4 * s}" fill="#f4efe6" stroke="${dark}" stroke-width="2.6" ${NS}/><path d="M${-15 * s},${y} L${15 * s},${y}" stroke="#bdb3a3" stroke-width="1.5" ${NS}/>` +
        [-8, 0, 8].map(x => `<path d="M${x * s},${y - 7 * s} L${x * s},${y + 7 * s}" stroke="#cfc6b8" stroke-width="1.2" ${NS}/>`).join('');
      case 'shout': return `<path d="M${-14 * s},${y - 4} Q0,${y - 8} ${14 * s},${y - 4} Q${10 * s},${y + 14 * s} 0,${y + 14 * s} Q${-10 * s},${y + 14 * s} ${-14 * s},${y - 4}Z" fill="${dark}" stroke="${lip}" stroke-width="2.4" ${NS}/><path d="M${-11 * s},${y - 4} L${11 * s},${y - 4} L${10 * s},${y + 1} L${-10 * s},${y + 1}Z" fill="#f2ede4"/>`;
      default: return `<path d="M${-11 * s},${y} Q0,${y + 3} ${11 * s},${y}" ${L} stroke-width="2.8"/><path d="M${-7 * s},${y + 6} Q0,${y + 9} ${7 * s},${y + 6}" stroke="${lip}" stroke-width="1.6" ${NS} fill="none" opacity="0.5"/>`;
    }
  }

  function head(o, kind) {
    const F = o.face || {}, skin = o.skin, id = uid('h');
    const hairC = o.hair || '#4a3122';
    // face silhouettes (head centre at 0,0)
    const faceD = kind === 'kid'
      ? 'M-80,-62 C-86,-20 -90,22 -84,50 C-76,86 -42,104 0,104 C42,104 76,86 84,50 C90,22 86,-20 80,-62 C68,-98 -68,-98 -80,-62Z'
      : kind === 'woman'
        ? 'M-72,-70 C-78,-25 -80,25 -72,58 C-62,94 -32,112 0,112 C32,112 62,94 72,58 C80,25 78,-25 72,-70 C62,-106 -62,-106 -72,-70Z'
        : 'M-78,-82 C-84,-30 -86,30 -78,62 C-68,100 -36,120 0,120 C36,120 68,100 78,62 C86,30 84,-30 78,-82 C66,-118 -66,-118 -78,-82Z';
    const earX = kind === 'kid' ? 86 : kind === 'woman' ? 76 : 82;
    let back = '', g = '';
    const grad = `<radialGradient id="${id}f" cx="50%" cy="46%" r="62%"><stop offset="0" stop-color="${shade(skin, 0.28)}"/><stop offset="0.5" stop-color="${shade(skin, 0.06)}"/><stop offset="0.82" stop-color="${skin}"/><stop offset="1" stop-color="${shade(skin, -0.16)}"/></radialGradient>` +
      `<clipPath id="${id}c"><path d="${faceD}"/></clipPath>`;
    // ---- back layers: hood/veil/coif back, ears
    const wrap = o.hood || o.wimple || o.coif;
    if (o.hood) back += `<path d="M-118,140 C-140,20 -120,-150 0,-152 C120,-150 140,20 118,140Z" fill="${shade(o.hood, -0.15)}" ${ol()}/>`;
    if (o.wimple) back += `<path d="M-112,190 C-128,40 -112,-150 0,-150 C112,-150 128,40 112,190Z" fill="${o.veil || '#5d6450'}" ${ol()}/>`;
    if (o.coif) back += `<path d="M-100,96 C-112,0 -100,-140 0,-140 C100,-140 112,0 100,96Z" fill="${shade(o.coif, -0.12)}" ${ol()}/>`;
    if (!o.hood && !o.wimple && !o.coif && !o.beard) for (const s of [-1, 1]) {
      back += `<g transform="translate(${s * earX},${kind === 'kid' ? 14 : 8})"><ellipse cx="0" cy="0" rx="16" ry="24" fill="${shade(skin, -0.04)}" ${ol()}/><path d="M${s * 5},-12 q${s * 6},12 0,24" stroke="${shade(skin, -0.32)}" stroke-width="2" ${NS} fill="none"/><ellipse cx="${s * 2}" cy="2" rx="6" ry="10" fill="${shade(skin, -0.18)}" opacity="0.5" filter="url(#b1)"/></g>`;
    }
    // ---- face
    g += `<path d="${faceD}" fill="url(#${id}f)"/>`;
    let inside = '';
    inside += `<ellipse cx="0" cy="${kind === 'kid' ? 108 : 125}" rx="90" ry="40" fill="#5a2a14" opacity="0.22" filter="url(#b8)"/>`;
    for (const s of [-1, 1]) inside += `<ellipse cx="${s * 52}" cy="${kind === 'kid' ? 44 : 40}" rx="22" ry="12" fill="#ef7f6e" opacity="${F.blush ?? (kind === 'kid' ? 0.32 : kind === 'woman' ? 0.2 : 0.1)}" filter="url(#b4)"/>`;
    // forehead shadow under the hair fringe
    if (!o.hood && !o.wimple && o.hairStyle !== 'bald') inside += `<rect x="-100" y="${kind === 'kid' ? -50 : -72}" width="200" height="22" fill="#4a2410" opacity="0.28" filter="url(#b4)"/>`;
    if (wrap) inside += `<path d="${faceD}" fill="none" stroke="#3a1a0a" stroke-width="22" opacity="0.28" filter="url(#b8)"/>`;
    g += `<g clip-path="url(#${id}c)">${inside}</g>`;
    g += `<path d="${faceD}" fill="none" ${ol()}/>`;
    // ---- features
    const E = eyes(F, kind, skin);
    let feat = brows(F, kind, skin, o.brow || shade(hairC, kind === 'kid' ? 0.15 : -0.1), E.K) + E.svg;
    const ny = kind === 'kid' ? 44 : kind === 'woman' ? 40 : 46;
    feat += `<path d="M5,${f(E.K.y + 12)} Q10,${f(ny - 14)} 8,${f(ny - 4)}" stroke="${shade(skin, -0.25)}" stroke-width="5" fill="none" opacity="0.25" filter="url(#b2)"/>`;
    feat += `<ellipse cx="0" cy="${ny}" rx="${kind === 'kid' ? 9.5 : 10.5}" ry="${kind === 'kid' ? 8 : 9}" fill="${shade(skin, -0.06)}"/><ellipse cx="-2" cy="${ny - 3}" rx="4" ry="3" fill="#fff" opacity="0.5"/>` +
      `<ellipse cx="-5.5" cy="${ny + 5}" rx="2.8" ry="2" fill="#5e2a1c"/><ellipse cx="5.5" cy="${ny + 5}" rx="2.8" ry="2" fill="#5e2a1c"/>`;
    if (F.freckles) { const r = rng(F.freckles === true ? 21 : F.freckles); for (let i = 0; i < 26; i++) { let x, y; if (i < 6) { x = (r() - 0.5) * 26; y = 26 + r() * 12; } else { const s = i % 2 ? 1 : -1; x = s * (22 + r() * 44); y = 24 + r() * 30; } feat += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(1.2 + r() * 2.2)}" fill="#c27650" opacity="${f(0.5 + r() * 0.45)}"/>`; } }
    const my = kind === 'kid' ? 72 : kind === 'woman' ? 74 : 82;
    if (o.beard) {
      const b = o.beard, bid = id + 'b';
      feat += `<defs>${vGrad(bid, shade(b, -0.08), shade(b, 0.12))}</defs>`;
      const beardD = o.beardStyle === 'goatee'
        ? 'M-80,-6 C-80,40 -66,80 -36,104 C-20,118 -10,150 0,160 C10,150 20,118 36,104 C66,80 80,40 80,-6 L72,-2 C70,40 56,70 30,88 C18,94 -18,94 -30,88 C-56,70 -70,40 -72,-2Z'
        : 'M-86,-4 C-90,56 -64,132 0,152 C64,132 90,56 86,-4 L74,-2 C72,30 60,56 36,64 Q18,68 12,64 Q0,58 -12,64 Q-18,68 -36,64 C-60,56 -72,30 -74,-2Z';
      feat += `<path d="${beardD}" fill="url(#${bid})" ${ol()}/>`;
      const r = rng(9); for (let i = 0; i < 10; i++) { const x = (r() - 0.5) * 100; feat += `<path d="M${f(x)},${f(88 + r() * 14)} q${f(x * 0.04)},${f(18)} ${f(x * 0.02)},${f(30 + r() * 10)}" stroke="${shade(b, 0.25)}" stroke-width="1.6" ${NS} fill="none" opacity="0.5"/>`; }
      feat += `<path d="M0,98 L0,128" stroke="${shade(b, -0.3)}" stroke-width="1.6" ${NS} opacity="0.6"/>`;
      feat += mouth(F.mouth || 'neutral', my, skin, kind);
      feat += `<path d="M-30,${my - 4} C-18,${my - 16} -4,${my - 14} 0,${my - 9} C4,${my - 14} 18,${my - 16} 30,${my - 4} C18,${my - 8} 6,${my - 6} 0,${my - 4} C-6,${my - 6} -18,${my - 8} -30,${my - 4}Z" fill="${shade(b, -0.12)}" ${ol(1.2)}/>`;
    } else feat += mouth(F.mouth || 'neutral', my, skin, kind);
    if (F.tears) for (const s of [-1, 1]) {
      const x = s * (E.K.x - 6), y = E.K.y + E.K.ry + 2;
      feat += `<path d="M${x},${y} C${x - s * 2},${y + 18} ${x + s * 3},${y + 30} ${x + s * 2},${y + 42}" stroke="#eef6ff" stroke-width="4.5" fill="none" stroke-linecap="round" opacity="0.95"/><path d="M${x + s * 2},${y + 40} q-5,8 0,12 q5,-4 0,-12Z" fill="#f4f9ff"/>`;
    }
    if (F.age) feat += `<path d="M-30,${kind === 'man' ? -54 : -50} Q0,-60 30,${kind === 'man' ? -54 : -50}" stroke="${shade(skin, -0.25)}" stroke-width="1.4" ${NS} fill="none" opacity="0.6"/><path d="M-22,-44 Q0,-50 22,-44" stroke="${shade(skin, -0.25)}" stroke-width="1.3" ${NS} fill="none" opacity="0.45"/>`;
    // ---- front layers: hair / hood rim / wimple band / coif
    let front = '';
    if (o.hood) {
      const c = o.hood, hid = id + 'hd';
      front += `<defs>${vGrad(hid, shade(c, 0.12), shade(c, -0.2))}</defs>`;
      front += `<path d="M-120,150 C-142,10 -122,-152 0,-154 C122,-152 142,10 120,150 L94,150 C98,60 96,-100 0,-102 C-96,-100 -98,60 -94,150Z" fill="url(#${hid})" ${ol()}/>`;
      front += `<path d="M-94,150 C-98,60 -96,-100 0,-102 C96,-100 98,60 94,150" stroke="${shade(c, 0.3)}" stroke-width="3" ${NS} fill="none" opacity="0.5"/>`;
      if (o.hair) front += `<path d="M-60,-86 Q0,-104 60,-86 L58,-62 L22,-62 L15,-52 L8,-62 L1,-52 L-6,-62 L-58,-62Z" fill="${o.hair}" ${ol()}/>`;
    } else if (o.wimple) {
      front += `<path d="M-92,40 C-96,-60 -82,-128 0,-130 C82,-128 96,-60 92,40 C92,110 60,150 0,152 C-60,150 -92,110 -92,40Z M-70,-6 C-72,70 -40,108 0,108 C40,108 72,70 70,-6 C70,-70 50,-92 0,-94 C-50,-92 -70,-70 -70,-6Z" fill-rule="evenodd" fill="${o.wimple}" ${ol()}/>`;
      front += `<path d="M-70,-6 C-72,70 -40,108 0,108 C40,108 72,70 70,-6 C70,-70 50,-92 0,-94 C-50,-92 -70,-70 -70,-6Z" fill="none" stroke="#000" stroke-opacity="0.12" stroke-width="10" filter="url(#b2)"/>`;
      front += `<path d="M-104,60 C-108,-80 -92,-140 0,-142 C92,-140 108,-80 104,60 L92,60 C92,-60 80,-126 0,-128 C-80,-126 -92,-60 -92,60Z" fill="${o.veil || '#5d6450'}" ${ol()}/>`;
    } else if (o.coif) {
      const hc = o.hair || '#d9b26a';
      front += `<path d="M-64,-70 Q0,-96 64,-70 L66,-48 L24,-52 L16,-40 L8,-52 L0,-40 L-8,-52 L-66,-48Z" fill="${hc}" ${ol()}/>`;
      front += `<path d="M-96,80 C-104,-10 -96,-128 0,-130 C96,-128 104,-10 96,80 L84,96 C88,0 80,-64 60,-76 Q0,-104 -60,-76 C-80,-64 -88,0 -84,96Z" fill="${o.coif}" ${ol()}/>`;
      front += `<path d="M-84,96 Q0,140 84,96 L80,112 Q0,154 -80,112Z" fill="${shade(o.coif, -0.05)}" ${ol()}/>`;
    } else if (o.hairStyle !== 'bald') {
      const hid = id + 'hr';
      front += `<defs>${vGrad(hid, shade(hairC, 0.16), shade(hairC, -0.12))}</defs>`;
      const hp = kind === 'kid'
        ? 'M-97,6 L-98,-58 C-99,-108 -62,-126 0,-126 C62,-126 99,-108 98,-58 L97,6 L84,6 L82,-46 L30,-46 L23,-34 L16,-46 L9,-34 L2,-46 L-5,-34 L-12,-46 L-82,-46 L-84,6Z'
        : kind === 'woman'
          ? 'M-86,20 C-92,-90 -60,-132 0,-132 C60,-132 92,-90 86,20 L74,20 C74,-40 60,-70 20,-78 C-20,-70 -60,-60 -74,20Z'
          : o.beard
            ? 'M-86,10 L-88,-72 C-90,-122 -58,-142 0,-142 C58,-142 90,-122 88,-72 L86,10 L76,10 L74,-68 L28,-68 L21,-56 L14,-68 L7,-56 L0,-68 L-7,-56 L-14,-68 L-74,-68 L-76,10Z'
            : 'M-92,4 L-93,-70 C-94,-122 -60,-142 0,-142 C60,-142 94,-122 93,-70 L92,4 L80,4 L78,-68 L28,-68 L21,-56 L14,-68 L7,-56 L0,-68 L-7,-56 L-14,-68 L-78,-68 L-80,4Z';
      front += `<path d="${hp}" fill="url(#${hid})" ${ol()}/>`;
      const r = rng(4); for (let i = 0; i < 6; i++) { const x = -70 + i * 28 + r() * 8; front += `<path d="M${f(x * 0.8)},${kind === 'kid' ? -118 : -134} Q${f(x * 1.02)},-90 ${f(x)},${kind === 'kid' ? -52 : -74}" stroke="${shade(hairC, -0.35)}" stroke-width="1.8" ${NS} fill="none" opacity="0.6"/>`; }
      front += `<path d="M-50,${kind === 'kid' ? -112 : -128} Q-10,${kind === 'kid' ? -124 : -140} 40,${kind === 'kid' ? -110 : -126}" stroke="${shade(hairC, 0.35)}" stroke-width="6" fill="none" opacity="0.35" filter="url(#b2)"/>`;
    }
    return `<defs>${grad}</defs>${back}<g filter="url(#airS)">${g}</g>${feat}<g filter="url(#airS)">${front}</g>`;
  }

  // ---------------- body ----------------
  function torsoPath(D) {
    const nw = 34;
    return `M${-nw},${D.shY - 6} C${f(-D.shX * 0.6)},${D.shY - 8} ${-D.shX},${D.shY - 4} ${-D.shX},${D.shY + 34} L${-D.wX},${D.wY} L${-D.hemX},${D.hemY} C${f(-D.hemX * 0.4)},${D.hemY + 10} ${f(D.hemX * 0.4)},${D.hemY + 10} ${D.hemX},${D.hemY} L${D.wX},${D.wY} L${D.shX},${D.shY + 34} C${D.shX},${D.shY - 4} ${f(D.shX * 0.6)},${D.shY - 8} ${nw},${D.shY - 6}Z`;
  }

  function person(o) {
    const kind = o.kind || 'kid', D = DIMS[kind];
    const C = { skin: o.skin || '#f6cfb4', sleeve: o.sleeve || o.tunic || '#85735a', tunic: o.tunic || '#85735a' };
    const tun = C.tunic, id = uid('p');
    let out = '';
    out += `<ellipse cx="0" cy="2" rx="${f(D.hemX * 1.05)}" ry="${f(D.foot * 0.45)}" fill="#1a0e05" opacity="${o.shadow ?? 0.32}" filter="url(#soft2)"/>`;
    // legs & feet
    if (kind !== 'woman') {
      const legC = o.legs || C.skin, bare = !o.legs;
      for (const s of [-1, 1]) {
        const x = s * D.legX, lid = id + 'l' + s;
        let leg = `<defs>${cylGrad(lid, legC, 0.7)}<clipPath id="${lid}c"><rect x="${f(x - D.legW / 2)}" y="${D.hemY - 30}" width="${D.legW}" height="${f(-D.hemY + 30 - D.foot * 0.35)}" rx="${f(D.legW * 0.3)}"/></clipPath></defs>`;
        leg += `<rect x="${f(x - D.legW / 2)}" y="${D.hemY - 30}" width="${D.legW}" height="${f(-D.hemY + 30 - D.foot * 0.35)}" rx="${f(D.legW * 0.3)}" fill="url(#${lid})" ${ol()}/>`;
        if (o.stripes) { let st = ''; for (let y = D.hemY + 6; y < -D.foot * 0.4; y += 30) st += `<rect x="${f(x - D.legW)}" y="${y}" width="${D.legW * 2}" height="13" fill="${o.stripes}"/>`; leg += `<g clip-path="url(#${lid}c)">${st}</g><rect x="${f(x - D.legW / 2)}" y="${D.hemY - 30}" width="${D.legW}" height="${f(-D.hemY + 30 - D.foot * 0.35)}" rx="${f(D.legW * 0.3)}" fill="none" ${ol()}/>`; }
        const fc = o.feet || (bare ? C.skin : '#3a2619'), fid = lid + 'f';
        leg += `<defs>${vGrad(fid, shade(fc, 0.12), shade(fc, -0.18))}</defs><path d="M${f(x - D.foot * 0.55 + s * 4)},${f(-D.foot * 0.5)} C${f(x - D.foot * 0.62 + s * 4)},4 ${f(x + D.foot * 0.62 + s * 4)},4 ${f(x + D.foot * 0.55 + s * 4)},${f(-D.foot * 0.5)} C${f(x + D.foot * 0.4)},${f(-D.foot * 0.75)} ${f(x - D.foot * 0.4)},${f(-D.foot * 0.75)} ${f(x - D.foot * 0.55 + s * 4)},${f(-D.foot * 0.5)}Z" fill="url(#${fid})" ${ol()}/>`;
        if (bare) for (const k of [-0.2, 0.05, 0.28]) leg += `<path d="M${f(x + s * 4 + k * D.foot)},${f(-D.foot * 0.12)} l0,${f(D.foot * 0.18)}" stroke="${shade(fc, -0.4)}" stroke-width="1.2" ${NS} opacity="0.6"/>`;
        out += `<g filter="url(#airS)">${leg}</g>`;
      }
    }
    const shR = [-(D.shX - D.sw * 0.42), D.shY + D.sw * 0.45], shL = [D.shX - D.sw * 0.42, D.shY + D.sw * 0.45];
    const aR = Object.assign({ hand: restHand(kind, 'R'), pose: 'relaxed', facing: 'back' }, o.armR || {});
    const aL = Object.assign({ hand: restHand(kind, 'L'), pose: 'relaxed', facing: 'back' }, o.armL || {});
    const armR = arm('R', shR, aR, D, C), armL = arm('L', shL, aL, D, C);
    if (aR.behind) out += armR.svg; if (aL.behind) out += armL.svg;
    // neck
    const neckW = kind === 'kid' ? 30 : 36;
    out += `<rect x="${-neckW}" y="${D.headY + 60}" width="${neckW * 2}" height="${f(D.shY - D.headY - 40)}" fill="${shade(C.skin, -0.14)}" ${ol()}/>`;
    // torso
    const TP = torsoPath(D), tg = id + 't';
    let t = `<defs><linearGradient id="${tg}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${shade(tun, -0.2)}"/><stop offset="0.25" stop-color="${shade(tun, 0.06)}"/><stop offset="0.55" stop-color="${shade(tun, 0.02)}"/><stop offset="1" stop-color="${shade(tun, -0.24)}"/></linearGradient><clipPath id="${tg}c"><path d="${TP}"/></clipPath></defs>`;
    t += `<path d="${TP}" fill="url(#${tg})"/>`;
    let sh = '';
    // chest folds
    for (const s of [-1, 1]) sh += `<path d="M${f(s * D.shX * 0.62)},${D.shY + 50} Q${f(s * D.shX * 0.72)},${f((D.shY + D.wY) / 2)} ${f(s * D.shX * 0.6)},${D.wY - 24}" stroke="${shade(tun, -0.45)}" stroke-width="${kind === 'kid' ? 5 : 8}" fill="none" opacity="0.55" filter="url(#b2)"/>`;
    // skirt pleats: soft alternating dark/light stripes
    const N = kind === 'woman' ? 9 : 8;
    for (let i = 0; i < N; i++) {
      const u = (i + 0.5) / N * 2 - 1, xw = u * D.wX * 0.95, xh = u * D.hemX * 1.0;
      sh += `<path d="M${f(xw)},${D.wY + 14} L${f(xh)},${D.hemY - 4}" stroke="${shade(tun, -0.5)}" stroke-width="${kind === 'kid' ? 9 : 13}" opacity="0.62" filter="url(#b4)"/>`;
      const u2 = u + 1 / N; if (u2 < 1) sh += `<path d="M${f(u2 * D.wX * 0.95)},${D.wY + 20} L${f(u2 * D.hemX)},${D.hemY - 10}" stroke="${shade(tun, 0.28)}" stroke-width="${kind === 'kid' ? 8 : 11}" opacity="0.5" filter="url(#b4)"/>`;
    }
    sh += `<rect x="${-D.hemX - 20}" y="${D.hemY - 26}" width="${D.hemX * 2 + 40}" height="34" fill="${shade(tun, -0.5)}" opacity="0.35" filter="url(#b8)"/>`;
    sh += `<rect x="${-D.wX - 10}" y="${D.wY - 4}" width="${D.wX * 2 + 20}" height="30" fill="${shade(tun, -0.55)}" opacity="0.45" filter="url(#b4)"/>`;
    if (o.apron) sh += `<path d="M${f(-D.wX * 0.72)},${D.wY + 8} L${f(D.wX * 0.72)},${D.wY + 8} L${f(D.hemX * 0.55)},${D.hemY - 40} Q0,${D.hemY - 26} ${f(-D.hemX * 0.55)},${D.hemY - 40}Z" fill="${o.apron}" ${ol()}/>` +
      [-0.3, 0, 0.3].map(k => `<path d="M${f(k * D.wX)},${D.wY + 20} L${f(k * D.hemX * 0.9)},${D.hemY - 50}" stroke="${shade(o.apron, -0.25)}" stroke-width="7" opacity="0.5" filter="url(#b4)"/>`).join('');
    // stitched patches
    if (o.patch) { const r = rng(o.patch === true ? 7 : o.patch); for (let i = 0; i < 3; i++) { const px = (r() - 0.5) * D.wX * 1.4, py = D.shY + 60 + r() * (D.hemY - D.shY - 100); sh += `<g transform="translate(${f(px)},${f(py)})" stroke="${shade(tun, -0.6)}" stroke-width="1.8" ${NS} opacity="0.8"><path d="M-4,-9 L-4,9" stroke-dasharray="3 3"/><path d="M4,-9 L4,9" stroke-dasharray="3 3"/><path d="M-4,-2 L4,-2 M-4,4 L4,4"/></g>`; } }
    t += `<g clip-path="url(#${tg}c)">${sh}</g>`;
    t += `<path d="${TP}" fill="none" ${ol()}/>`;
    // neckline: white undershirt edge + centre slit
    t += `<path d="M-30,${D.shY - 5} Q0,${D.shY + 12} 30,${D.shY - 5}" stroke="#efe8da" stroke-width="5" fill="none"/><path d="M-30,${D.shY - 5} Q0,${D.shY + 14} 30,${D.shY - 5}" stroke="${OUT}" stroke-width="1.6" ${NS} fill="none"/>`;
    if (!o.mantle && kind !== 'woman') t += `<path d="M0,${D.shY + 10} L0,${D.shY + (kind === 'kid' ? 46 : 70)}" stroke="${OUT}" stroke-width="2" ${NS} opacity="0.85"/>`;
    if (o.mantle) {
      const m = o.mantle, sx = D.shX * 1.06, y0 = D.shY - 12, y1 = D.shY + (kind === 'kid' ? 60 : 100), mid = id + 'm';
      let d = `M${f(-sx)},${D.shY + 30} C${f(-sx)},${y0} ${f(sx)},${y0} ${f(sx)},${D.shY + 30} L${f(sx * 0.96)},${y1} `;
      const r = rng(13); for (let i = 1; i <= 16; i++) { const x = sx * 0.96 - i * (sx * 1.92 / 16); d += `L${f(x + sx * 0.06)},${f(y1 + 8 + r() * 10)} L${f(x)},${f(y1 + r() * 4)} `; }
      t += `<defs>${vGrad(mid, shade(m, 0.15), shade(m, -0.15))}</defs><path d="${d}Z" fill="url(#${mid})" ${ol()}/>`;
      for (let i = 0; i < 30; i++) t += `<path d="M${f((r() - 0.5) * sx * 1.8)},${f(y0 + 24 + r() * (y1 - y0 - 20))} l${f(r() * 6 - 3)},${f(8 + r() * 6)}" stroke="${shade(m, 0.32)}" stroke-width="1.6" ${NS} opacity="0.55"/>`;
    }
    // belt
    if (o.belt !== false) {
      const by = D.wY + 6, bw = D.wX + 4;
      if (o.leatherBelt) {
        const bc = o.belt || '#3a2416';
        t += `<rect x="${-bw}" y="${by - 9}" width="${bw * 2}" height="18" fill="${bc}" ${ol()}/><rect x="${-bw}" y="${by - 9}" width="${bw * 2}" height="6" fill="#fff" opacity="0.08"/><rect x="-13" y="${by - 12}" width="26" height="24" rx="3" fill="none" stroke="${o.buckle || '#cdb98d'}" stroke-width="5"/><rect x="-13" y="${by - 12}" width="26" height="24" rx="3" fill="none" ${ol(1.2)}/>`;
        if (o.pouch) t += `<path d="M${f(bw * 0.45)},${by + 8} l34,0 l-2,48 q-15,10 -30,0Z" fill="#3a2416" ${ol()}/>`;
      } else {
        const bc = o.belt || '#d4c294';
        let rope = `<rect x="${-bw}" y="${by - 7}" width="${bw * 2}" height="14" rx="6" fill="${bc}" ${ol()}/>`;
        for (let x = -bw + 4; x < bw - 3; x += 7) rope += `<path d="M${x},${by - 6} L${x + 3},${by + 6}" stroke="${shade(bc, -0.45)}" stroke-width="2.4" opacity="0.8"/>`;
        rope += `<circle cx="6" cy="${by}" r="8" fill="${bc}" ${ol()}/>`;
        for (const [dx, len] of [[-3, 62], [8, 54]]) rope += `<path d="M${6 + dx},${by + 6} L${6 + dx * 1.6},${by + len}" stroke="${OUT}" stroke-width="9" stroke-linecap="round"/><path d="M${6 + dx},${by + 6} L${6 + dx * 1.6},${by + len}" stroke="${bc}" stroke-width="6" stroke-linecap="round"/>`;
        t += rope;
      }
    }
    out += `<g filter="url(#air)">${t}</g>`;
    // head
    out += `<g transform="translate(0,${D.headY}) rotate(${o.tilt || 0})">${head(o, kind)}</g>`;
    // cape (hood) covers the upper arms: upper arms drawn first, then cape, then forearms/hands
    if (o.props) out += o.props;
    if (o.hood && o.cape !== false) {
      const c = o.hood, cid = id + 'cp', cy0 = D.headY + 70, cy1 = D.shY + (kind === 'kid' ? 110 : 170), cx1 = D.shX * 1.55;
      if (!aR.behind) out += armR.svg; if (!aL.behind) out += armL.svg;
      out += `<defs>${vGrad(cid, shade(c, 0.05), shade(c, -0.25))}</defs><path d="M-70,${cy0} C-110,${cy0 + 40} ${-cx1},${cy1 - 40} ${-cx1},${cy1} Q0,${cy1 + 30} ${cx1},${cy1} C${cx1},${cy1 - 40} 110,${cy0 + 40} 70,${cy0}Z" fill="url(#${cid})" ${ol()}/>`;
      out += `<path d="M${-cx1 + 10},${cy1 - 6} Q0,${cy1 + 22} ${cx1 - 10},${cy1 - 6}" stroke="${shade(c, 0.3)}" stroke-width="3" ${NS} fill="none" opacity="0.45"/>`;
      if (o.handsOverCape) out += (armR.hand || '') + (armL.hand || '');
    } else {
      if (!aR.behind) out += armR.svg; if (!aL.behind) out += armL.svg;
    }
    if (o.frontProps) out += o.frontProps;
    const s = o.s || 1;
    const wrap = inner => `<g transform="translate(${f(o.x || 0)},${f(o.y || 0)}) scale(${s})">${inner}</g>`;
    return { svg: wrap(out), handR: armR.hand ? wrap(armR.hand) : '', handL: armL.hand ? wrap(armL.hand) : '', D, shR, shL };
  }

  G.RIG = { defs, person, hand, shade, mix, rng, uid, DIMS, OUT, OW, NS, ol, restHand, f, cylGrad, vGrad };
})(window);
