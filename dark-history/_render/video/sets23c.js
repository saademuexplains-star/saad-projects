// "The Royal Fool": the harbour of Sluys, rebuilt (same fleets and ship callbacks as sets22b, so BATTLE, DEAD and JUMP
// keep their staging). A golden-hour sky: the sun low over the sea ahead-left with its halo, banks of cloud lit gold
// at their edges, the smoke of the burning fleet rising in towering columns lit orange from below; the far Flemish
// shore with dunes, the town of Sluys, its church spire and a windmill; the sea in perspective with rows of wave
// crests, the sun's glitter path, every ship mirrored in the water, firelight spilling across the waves; gulls.
// At dusk (o.dusk) the sky turns crimson and violet, the first stars come out, the fires burn on the dark water.
(function (G) {
  const T = G.ST3, { f, rng, shade, mix } = G.RIG, C = G.CINE, P17 = G.P17, HL = G.HALL, SEA = HL.SEA;
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t;
  const ss = (a, b, x) => { const u = clamp((x - a) / (b - a)); return u * u * (3 - 2 * u); };
  const TAU = Math.PI * 2, bb = HL.bb;
  const pxw = (cam, P, cm, lo = 0.3, hi = 90) => { const c = cam.toC(P); return c[2] > cam.near ? clamp(cm * cam.fl / c[2], lo, hi) : lo; };
  const SUN = [-0.62, 0.09, 1];
  const SMC = [-560, -1000, 1640, 2920];   // the frame plus the margin a transition may zoom out to (x0, y0, x1, y1)
  const pal = k => ({
    skyT: mix('#3a4a86', '#160c2a', k), skyM: mix('#c8906a', '#8a2a3a', k), skyH: mix('#ffd890', '#ff7a3a', k),
    sea: mix('#16343e', '#0e0a14', k), seaM: mix('#3a6064', '#3a1a20', k), seaH: mix('#e8c890', '#d8603a', k),
    cloud: mix('#6a5a78', '#3a1a2a', k), cloudLit: mix('#ffd8a0', '#ff8a50', k), coast: mix('#4a5248', '#1a1018', k), town: mix('#5a5650', '#1a1014', k), sunC: mix('#fff4d0', '#ff9050', k)
  });
  let CALL = 0;   // ids unique per drawing (two sea shots share one frame inside a transition)
  HL.seaDraw = (cam, t, o = {}) => {
    const k = o.dusk || 0, P = pal(k), items = [], hz = cam.dir([0, 0, 1]), hy = hz ? hz[1] : -400, id0 = 's3' + (++CALL % 9973) + '_';
    let back = '';
    // ---------------- the sky
    back += `<defs><linearGradient id="${id0}Sky" gradientUnits="userSpaceOnUse" x1="0" y1="${f(hy - 1900)}" x2="0" y2="${f(hy + 6)}"><stop offset="0" stop-color="${P.skyT}"/><stop offset="0.62" stop-color="${P.skyM}"/><stop offset="1" stop-color="${P.skyH}"/></linearGradient>` +
      `<linearGradient id="${id0}Sea" gradientUnits="userSpaceOnUse" x1="0" y1="${f(hy)}" x2="0" y2="${f(hy + 1700)}"><stop offset="0" stop-color="${P.seaH}"/><stop offset="0.08" stop-color="${P.seaM}"/><stop offset="0.5" stop-color="${mix(P.seaM, P.sea, 0.6)}"/><stop offset="1" stop-color="${P.sea}"/></linearGradient>` +
      // the reflections: smeared down the waves and darkened by the water
      `<filter id="${id0}Rf" filterUnits="userSpaceOnUse" x="${SMC[0]}" y="${SMC[1]}" width="${SMC[2] - SMC[0]}" height="${SMC[3] - SMC[1]}" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="1.3 4.5"/><feColorMatrix type="matrix" values="0.62 0 0 0 0.02  0 0.68 0 0 0.04  0 0 0.74 0 0.05  0 0 0 1 0"/></filter>` +
      `<radialGradient id="${id0}Fw"><stop offset="0" stop-color="#ff8a30"/><stop offset="0.5" stop-color="#ff8a30" stop-opacity="0.55"/><stop offset="1" stop-color="#ff8a30" stop-opacity="0"/></radialGradient>` +
      `<radialGradient id="${id0}Sh"><stop offset="0" stop-color="${P.sea}" stop-opacity="0.6"/><stop offset="0.6" stop-color="${P.sea}" stop-opacity="0.38"/><stop offset="1" stop-color="${P.sea}" stop-opacity="0"/></radialGradient>` +
      // the smoke: soft gradient puffs (no blur layers: a burning fleet's thirty columns, twice over inside a transition,
      // made Chrome drop parts of the frame in blocks)
      P17.smokeDefs(id0 + 'Sm') + `</defs>`;
    back += `<rect x="-60" y="-60" width="1200" height="${f(clamp(hy + 62, 0, 2100))}" fill="url(#${id0}Sky)"/>`;
    if (k > 0.4) { const r = rng(55); for (let i = 0; i < 90; i++) { const x = r() * 1100, y = hy - 300 - r() * 1700, rad = 0.8 + r() * 1.2; if (y < -40) continue; back += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(rad)}" fill="#fff4e8" opacity="${f((k - 0.4) * 1.5 * (0.4 + 0.6 * Math.sin(t * 2 + i)) * clamp((hy - y - 300) / 600))}"/>`; } }
    const sp = cam.dir(SUN);
    if (sp) {
      if (k < 0.7) back += C.radial(sp[0], sp[1], 1100, P.skyH, 0.55 * (1 - k), 'screen') + C.radial(sp[0], sp[1], 300, '#fff8e0', 0.6 * (1 - k), 'screen') + `<circle cx="${f(sp[0])}" cy="${f(sp[1])}" r="${f(46 * cam.fl / 1100)}" fill="${P.sunC}" opacity="${f(1 - k)}"/>`;
      else back += C.radial(sp[0], hy, 1300, '#ff6a2a', 0.5 * k, 'screen');
    }
    // banks of cloud (placed by direction, so they turn with the camera): puffy bodies of many lobes, dark violet-grey,
    // their undersides lit gold by the low sun (brighter toward it)
    { const r = rng(511); let body = '', lit = '';
      for (let i = 0; i < 14; i++) {
        // (every number for a cloud is drawn whether or not it is in view, so one turning out of view never reshapes the rest)
        const az = -0.95 + r() * 1.9 + t * 0.004 * (0.5 + r()), el = 0.05 + r() * r() * 0.5, p = cam.dir([Math.sin(az), el, Math.cos(az)]);
        const w0 = 160 + r() * 340, hk = 0.16 + r() * 0.12, n = 6 + Math.floor(r() * 5), lobes = Array.from({ length: n }, () => [r(), r(), r()]);
        if (!p) continue;
        const w = w0 * cam.fl / 1100 * (1 - el * 0.8), h = w * hk, lk = clamp(1 - Math.abs(az - Math.atan2(SUN[0], SUN[2])) * 0.8);
        for (let j = 0; j < n; j++) { const u = (j + 0.5) / n - 0.5, rx = w * (0.18 + lobes[j][0] * 0.16), ry = rx * (0.45 + lobes[j][1] * 0.3), cx = p[0] + u * w * 0.9, cy = p[1] - h * (0.25 + 0.35 * Math.cos(u * Math.PI)) + lobes[j][2] * h * 0.2; body += `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx)}" ry="${f(ry)}"/>`; lit += `<ellipse cx="${f(cx)}" cy="${f(cy + ry * 0.55)}" rx="${f(rx * 0.85)}" ry="${f(ry * 0.32)}" opacity="${f(0.35 + 0.6 * lk)}"/>`; }
        body += `<ellipse cx="${f(p[0])}" cy="${f(p[1])}" rx="${f(w * 0.55)}" ry="${f(h * 0.4)}"/>`;
      }
      back += `<g fill="${P.cloud}" opacity="0.82" filter="url(#b2)">${body}</g><g fill="${P.cloudLit}" style="mix-blend-mode:screen" filter="url(#b4)">${lit}</g>`;
    }    // ---------------- the far shore: dunes, the town, the church spire, a windmill
    const cz = 30000, cb = (x, y) => cam.proj([x, y, cz]);
    let coast = 'M-60,' + f(hy + 4);
    for (let i = 0; i <= 30; i++) { const x = -40000 + i * 80000 / 30, p = cb(x, 160 + 120 * Math.sin(i * 1.7) + 50 * Math.sin(i * 3.1)); if (p) coast += ` L${f(p[0])},${f(p[1])}`; }
    coast += ` L1140,${f(hy + 4)}Z`;
    back += `<path d="${coast}" fill="${P.coast}" opacity="0.9"/>`;
    const tw = cb(1800, 0);
    if (tw) {
      const kk = cam.fl / (cz - cam.z); let s = '';
      for (let i = 0; i < 22; i++) { const xx = -3000 + i * 270, hh = 260 + (i * 37) % 220, roof = i % 3 === 0 ? mix('#8a3a2a', '#2a1014', k) : mix('#6a4a3a', '#1a1014', k); s += `<path d="M${xx},0 L${xx},${-hh} L${xx + 120},${-hh - 150} L${xx + 240},${-hh} L${xx + 240},0Z" fill="${P.town}"/><path d="M${xx - 6},${-hh} L${xx + 120},${-hh - 156} L${xx + 246},${-hh}" fill="${roof}" opacity="0.85"/>`; if (i % 4 === 1) s += `<rect x="${xx + 90}" y="${-hh + 60}" width="40" height="60" fill="#ffc870" opacity="${f(0.2 + 0.6 * k)}"/>`; }
      s += `<path d="M-260,0 L-260,-1300 L-160,-1300 L-160,-1500 L0,-2300 L160,-1500 L160,-1300 L260,-1300 L260,0Z" fill="${shade(P.town, -0.12)}"/><path d="M-60,-1100 L60,-1100 L60,-900 L-60,-900Z" fill="#ffc870" opacity="${f(0.15 + 0.5 * k)}"/>`;
      const ma = t * 0.6; s += `<path d="M2600,0 L2660,-800 L2800,-800 L2860,0Z" fill="${P.town}"/>` + [0, 1, 2, 3].map(i => { const a = ma + i * TAU / 4; return `<path d="M2730,-820 L${f(2730 + Math.cos(a) * 520)},${f(-820 + Math.sin(a) * 520)}" stroke="${P.town}" stroke-width="46"/>`; }).join('');
      back += `<g transform="translate(${f(tw[0])},${f(tw[1])}) scale(${kk.toFixed(5)})" opacity="0.85">${s}</g>`;
    }
    // ---------------- the sea: gradient; swell lines and whitecaps fixed in the world (the water streams past as the
    // camera travels), thinned level by level with distance and faded in and out (never popping); the sun's glitter
    back += `<rect x="-60" y="${f(hy)}" width="1200" height="${f(Math.max(0, 2000 - hy))}" fill="url(#${id0}Sea)"/>`;
    // (the reflections are laid on the bare sea before the waves: the sky and sea so far are kept apart in backSky)
    const backSky = back; back = '';
    const tanY = Math.tan(cam.yaw * Math.PI / 180), D0 = 420 + 0.8 * Math.max(60, cam.y);
    let sw = '';
    { const S0 = 150, k0 = Math.ceil((cam.z + 60) / S0), k1 = Math.floor((cam.z + 30000) / S0), lit = mix('#f0e8d0', '#ffb070', k);
      for (let kk = k0; kk <= k1; kk++) {
        let L = 0; const ak = Math.abs(kk); while (L < 9 && ak % (2 << L) === 0) L++;
        const dz = kk * S0 - cam.z, reach = D0 * (1 << L), vis = (1 - ss(reach * 0.6, reach, dz)) * clamp(dz / 600);
        if (vis < 0.01) continue;
        const z = kk * S0, amp = 5 + dz * 0.0016, ph = t * 1.1 + kk * 1.7, cx = cam.x + dz * tanY, half = dz * 0.72 + 800, step = 200;
        const j0 = Math.floor((cx - half) / step), j1 = Math.ceil((cx + half) / step);
        let d = '', run = [];
        for (let j = j0; j <= j1; j++) {
          const x = j * step, on = Math.sin(x * 0.00083 + kk * 2.13) + 0.7 * Math.sin(x * 0.0029 + kk * 0.71) > 0.25;
          if (on) run.push([x, amp * Math.sin(x * 0.004 + ph), z + 30 * Math.sin(x * 0.002 + kk)]);
          if (!on || j === j1) { if (run.length > 1) d += T.lineD(cam, run); run = []; }
        }
        if (d) sw += `<path d="${d}" stroke="${kk % 3 ? '#08141a' : lit}" stroke-width="${f(clamp(5200 / dz, 0.5, 3.2))}" stroke-linecap="round" fill="none" opacity="${f((kk % 3 ? 0.22 : 0.17) * vis)}"/>`;
      }
    }
    back += sw;
    // whitecaps: one per world cell, a level of coarser cells for each doubling of distance, each level living in its own
    // band (growing in at the near edge, shrinking away at the far one); each cap swells, curls and dies on its own clock
    { const hsh = (a, b, c) => { let h = (Math.imul(a, 374761393) + Math.imul(b, 668265263) + Math.imul(c, 1274126177)) | 0; h = Math.imul(h ^ (h >>> 13), 1103515245); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
      let cr = ''; const S0 = 150;
      for (let L = 0; L < 8; L++) {
        const S = S0 * (1 << L), d0 = L ? D0 * (1 << L) * 0.5 : 120, d1 = D0 * (1 << L) * 2;
        const i0 = Math.floor((cam.x + d0 * tanY - d1 * 0.75 - 400) / S), i1 = Math.ceil((cam.x + d1 * tanY + d1 * 0.75 + 400) / S);
        const j0 = Math.floor((cam.z + d0) / S), j1 = Math.ceil((cam.z + d1) / S);
        for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
          const u = hsh(i, j, L), v = hsh(j, i, L + 17), x = (i + u) * S, z = (j + v) * S, dz = z - cam.z;
          if (dz < d0 || dz > d1 || Math.abs(x - cam.x - dz * tanY) > dz * 0.75 + 300) continue;
          const ph = hsh(i + 7, j, L + 3) * TAU, life = clamp((Math.sin(t * 0.8 + ph) + 0.25) / 0.7), band = (L ? ss(d0, d0 * 1.6, dz) : 1) * (1 - ss(d1 * 0.62, d1, dz)), g = life * band;
          if (g < 0.03) continue;
          const w = S * 0.36 * (0.7 + 0.6 * hsh(i, j + 3, L + 9)) * (0.4 + 0.6 * g), y = 3 + 3 * Math.sin(t * 1.4 + ph);
          const a = cam.proj([x - w / 2, y, z]), m = cam.proj([x, y + 6, z]), b = cam.proj([x + w / 2, y, z]); if (!a || !b || !m) continue;
          const ws = Math.abs(b[0] - a[0]); if (ws < 3) continue;
          cr += `<path d="M${f(a[0])},${f(a[1])} Q${f(m[0])},${f(m[1] - ws * 0.09)} ${f(b[0])},${f(b[1])}" stroke-width="${f(clamp(ws * 0.035, 0.7, 3.2))}" opacity="${f(0.5 * g)}"/>`;
        }
      }
      if (cr) back += `<g stroke="${mix('#f4ecd8', '#ffc090', k)}" fill="none" stroke-linecap="round">${cr}</g>`;
    }
    if (sp && k < 0.85) { const r = rng(737); let gl = ''; for (let i = 0; i < 140; i++) { const z = 2500 + r() * r() * 26000, azs = Math.atan2(SUN[0], SUN[2]), x = cam.x + Math.tan(azs) * z + (r() - 0.5) * z * 0.12 * (1 + z / 20000), p = cam.proj([x, 2, z]); if (!p) continue; const tw = 0.3 + 0.7 * Math.max(0, Math.sin(t * 3 + i * 1.9)); gl += `<ellipse cx="${f(p[0])}" cy="${f(p[1])}" rx="${f(clamp(900000 / (z * 30), 1.5, 22))}" ry="1.4" fill="${mix('#fff8e0', '#ffb070', k)}" opacity="${f(tw * (1 - k))}"/>`; } back += `<g style="mix-blend-mode:screen">${gl}</g>`; }
    // gulls wheeling far off
    { const r = rng(91); for (let i = 0; i < 6; i++) { const az = -0.5 + r() + 0.05 * Math.sin(t * 0.3 + i), el = 0.05 + r() * 0.12, s = 5 + r() * 4, p = cam.dir([Math.sin(az), el, Math.cos(az)]); if (!p) continue; const fl = Math.sin(t * 8 + i * 2) * 4; back += `<path d="M${f(p[0] - s)},${f(p[1] + fl * 0.3)} Q${f(p[0] - s / 2)},${f(p[1] - fl)} ${f(p[0])},${f(p[1])} Q${f(p[0] + s / 2)},${f(p[1] - fl)} ${f(p[0] + s)},${f(p[1] + fl * 0.3)}" stroke="#2a2430" stroke-width="1.6" fill="none"/>`; } }
    // ---------------- the ships (broadside billboards), their reflections, firelight on the water, smoke columns
    // every reflection and the firelight on the water are laid on the sea itself, under the swell and the whitecaps and
    // under every hull (a near hull hides the reflections of the ships beyond it)
    // (Chrome gives every mask, filter, blend and group opacity its own offscreen surface: per ship that was eight
    // surfaces, and two sea shots inside one transition frame overflowed it into blocks. So each reflection keeps only
    // its own mask (its strength baked into it), all of them share one smear filter, the firelight on the water is one
    // blended group, the fire columns' glow another, and the hull shadows are gradient-filled.)
    const reflArt = [], glows = []; let fireW = '', nearD = 1e9;
    const ship = (S, side) => {
      const P0 = [S.x, 0, S.z], b = bb(cam, P0); if (!b || b.k * 4 < 0.004) return;
      const so = (o.ship && o.ship(S, side, t)) || {};
      {
        const sc = b.k * 4, haze = clamp((b.vd - 4000) / 30000) * 0.65, id = id0 + side + (S.seed | 0);
        const look = { dir: S.dir, seed: S.seed, sail: side === 'F' ? '#e8e2d0' : '#ece4d4', emblem: side === 'F' ? 'lily' : 'lions', stripes: side === 'F' ? '#22348a' : '#b8221a', banner: side === 'F' ? '#22348a' : '#b8221a', dark: k * 0.75 };
        // the ship with its flames' light painted plainly, and a copy without any for its reflection
        const art = P17.cog(b.x, b.y, sc, t, Object.assign({}, look, so, { fireGlow: 'over' })), artR = so.fire ? P17.cog(b.x, b.y, sc, t, Object.assign({}, look, so, { fireGlow: false })) : art;
        // the waterline: a low swell running along the hull (the ship is cut off by the water below it)
        const wl = x => b.y + 2.4 * sc * Math.sin((x - b.x) / (70 * sc + 0.01) + t * 1.9 + S.seed);
        let s = '';
        // the reflection: the ship mirrored about the waterline, smeared and darkened, broken into ripples that drift down
        // the waves, fading out with depth
        // (seen from above, a reflection is shorter than the thing itself: rr scales the mirror image down the water)
        const pT = cam.proj([S.x, 2400, S.z]), pR = cam.proj([S.x, -2400, S.z]), rr = pT && pR && b.y - pT[1] > 1 ? clamp((pR[1] - b.y) / (b.y - pT[1]), 0.15, 1.6) : 1;
        const Hr = 720 * sc * rr, xl = clamp(b.x - 780 * sc, -120, 1200), xr = clamp(b.x + 780 * sc, -120, 1200);
        if (xr > xl + 1 && b.y < 1990 && Hr > 2 && !(G.DBG && G.DBG.noRefl)) {
          let st = '';
          const ko = 0.5 * (1 - haze);
          for (let i = 0; i <= 32; i++) { const u = i / 32, w1 = Math.sin(TAU * 6.5 * (u - 0.32 * u * u) - t * 1.7 + S.seed), w2 = Math.sin(TAU * 2.6 * u + t * 0.8 + S.seed * 0.37), band = clamp(0.55 + 0.45 * w1 * (0.6 + 0.4 * w2)); st += `<stop offset="${f(u)}" stop-color="#fff" stop-opacity="${f(ko * Math.pow(1 - u, 1.6) * (0.16 + 0.84 * band))}"/>`; }
          // (the mask need not reach far below the frame; a far ship's rect hugs its hull, for the shared mask)
          const yb = b.y - 3 * sc, hb = Math.min(Hr + 3 * sc, 2200 - yb), xn = clamp(b.x - 480 * sc, -120, 1200), xm = clamp(b.x + 480 * sc, -120, 1200);
          if (hb > 2) reflArt.push({ d: b.d, id, grad: `<linearGradient id="${id}g" gradientUnits="userSpaceOnUse" x1="0" y1="${f(b.y)}" x2="0" y2="${f(b.y + Hr)}">${st}</linearGradient>`,
            rect: `<rect x="${f(xl)}" y="${f(yb)}" width="${f(xr - xl)}" height="${f(hb)}" fill="url(#${id}g)"/>`, rectN: xm > xn + 1 ? `<rect x="${f(xn)}" y="${f(yb)}" width="${f(xm - xn)}" height="${f(hb)}" fill="url(#${id}g)"/>` : '',
            box: [xl, yb, xr - xl, hb], art: `<g transform="translate(0,${f(b.y * (1 + rr))}) scale(1,${(-rr).toFixed(4)})">${artR}</g>` });
        }
        if (so.fire > 0.12) fireW += `<ellipse cx="${f(b.x)}" cy="${f(b.y + 40 * sc * rr)}" rx="${f(520 * sc)}" ry="${f(130 * sc * rr + 6)}" fill="url(#${id0}Fw)" opacity="${f(0.3 * so.fire * (1 - haze))}"/>`;
        // the hull's shadow on the water just below it
        s += `<ellipse cx="${f(b.x)}" cy="${f(b.y + 5 * sc)}" rx="${f(340 * sc)}" ry="${f(Math.max(1.6, 13 * sc))}" fill="url(#${id0}Sh)"/>`;
        nearD = Math.min(nearD, b.d);
        // the ship above the water
        { const xa = clamp(b.x + 440 * sc, -200, 1300), xb = clamp(b.x - 440 * sc, -200, 1300); let cp = `M-200,-600 L1300,-600 L1300,${f(b.y)} L${f(xa)},${f(b.y)}`; for (let i = 0; i <= 18; i++) { const x = lerp(xa, xb, i / 18); cp += ` L${f(x)},${f(wl(x))}`; } cp += ` L${f(xb)},${f(b.y)} L-200,${f(b.y)}Z`;
          s += `<defs><clipPath id="${id}c"><path d="${cp}"/></clipPath></defs><g clip-path="url(#${id}c)">${art}</g>`; }
        // broken foam along the waterline and a bow wave
        { let fm = ''; for (let i = 0; i < 7; i++) { const u0 = -0.5 + i / 7 + 0.015, u1 = u0 + 0.08 + 0.035 * (1 + Math.sin(t * 2 + i * 1.7 + S.seed)), x0 = b.x + u0 * 680 * sc, x1 = b.x + u1 * 680 * sc; fm += `M${f(x0)},${f(wl(x0) + 0.6 * sc)} L${f(x1)},${f(wl(x1) + 0.6 * sc)}`; }
          const bx = b.x + S.dir * 320 * sc; fm += `M${f(bx - S.dir * 60 * sc)},${f(b.y + 2 * sc)} Q${f(bx)},${f(b.y - 9 * sc)} ${f(bx + S.dir * 34 * sc)},${f(b.y + 3 * sc)}`;
          s += `<path d="${fm}" stroke="#f4f0e4" stroke-width="${f(Math.max(0.7, 3.2 * sc))}" stroke-linecap="round" fill="none" opacity="${f(0.55 * (1 - 0.5 * k))}"/>`; }
        if (so.smoke && !(G.DBG && G.DBG.noSmoke)) s += P17.smoke(b.x, b.y - 140 * sc, sc * 4, t, S.seed, { n: 16, wind: 34, rise: 80, op: 0.6 * so.smoke, col: null, cull: SMC, grad: id0 + 'Sm' });
        if (so.fire > 0.3) { const gr = Math.min(1000, 520 * sc), gx = b.x, gy = b.y - 260 * sc, gid = id + 'r'; glows.push(`<radialGradient id="${gid}" gradientUnits="userSpaceOnUse" cx="${f(gx)}" cy="${f(gy)}" r="${f(gr)}"><stop offset="0" stop-color="#ff7a2a" stop-opacity="${f(0.35 * so.fire * (1 - haze * 0.6))}"/><stop offset="1" stop-color="#ff7a2a" stop-opacity="0"/></radialGradient><rect x="${f(gx - gr)}" y="${f(gy - gr)}" width="${f(2 * gr)}" height="${f(2 * gr)}" fill="url(#${gid})"/>`); }
        const out = haze > 0.02 ? `<g opacity="${f(1 - haze * 0.6)}">${s}</g>` : s;
        items.push({ z: b.d, svg: () => out });
      }
    };
    for (const S of SEA.FRENCH) ship(S, 'F');
    if (o.english !== false) for (const S of SEA.ENGLISH) ship(S, 'E');
    // the reflections, far to near, under the one shared mask and smear; the firelight on the water; the columns' glow
    let refl = '';
    // the eight nearest ships keep a mask each; the rest, small and far, share one (their rects hug their hulls)
    if (reflArt.length) {
      const byNear = reflArt.slice().sort((a, b) => a.d - b.d), own = new Set(byNear.slice(0, 8)), far = byNear.slice(8).sort((a, b) => b.d - a.d);
      let defs = reflArt.map(r => r.grad).join(''), g = '';
      if (far.length) { defs += `<mask id="${id0}FM" maskUnits="userSpaceOnUse" x="${SMC[0]}" y="${SMC[1]}" width="${SMC[2] - SMC[0]}" height="${2200 - SMC[1]}">${far.map(r => r.rectN).join('')}</mask>`; g += `<g mask="url(#${id0}FM)">${far.map(r => r.art).join('')}</g>`; }
      for (const r of byNear.slice(0, 8).reverse()) { const [x, y, w, h] = r.box; defs += `<mask id="${r.id}m" maskUnits="userSpaceOnUse" x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}">${r.rect}</mask>`; g += `<g mask="url(#${r.id}m)">${r.art}</g>`; }
      refl += `<defs>${defs}</defs><g filter="url(#${id0}Rf)">${g}</g>`;
      void own;
    }
    if (fireW) refl += `<g style="mix-blend-mode:screen">${fireW}</g>`;
    if (glows.length) { const gl = `<g style="mix-blend-mode:screen">${glows.join('')}</g>`; items.push({ z: nearD - 1, svg: () => gl }); }
    // the chains between the French ships of each row (sagging iron at deck height)
    let chains = '';
    for (let row = 0; row < 3; row++) { const L = SEA.FRENCH.filter(s => s.row === row).sort((a, b) => a.x - b.x); for (let i = 0; i < L.length - 1; i++) { const a = [L[i].x + 1100, 120, L[i].z], b = [L[i + 1].x - 1100, 120, L[i + 1].z], pts = []; for (let j = 0; j <= 8; j++) { const u = j / 8; pts.push([lerp(a[0], b[0], u), 120 - 80 * Math.sin(Math.PI * u), lerp(a[2], b[2], u)]); } const dd = T.lineD(cam, pts); if (dd) chains += `<path d="${dd}" stroke="#1a1410" stroke-width="${f(pxw(cam, a, 12))}" fill="none" opacity="0.8"/>`; } }
    items.push({ z: 9000 - cam.z + 2000, svg: () => chains });
    return { back: backSky + refl + back, items, P, id0 };
  };
  HL.seaRender = (cam, t, o = {}, actors = []) => {
    const H = HL.seaDraw(cam, t, o);
    const all = H.items.concat(actors).sort((a, b) => b.z - a.z);
    let body = ''; for (const it of all) { const s = it.svg(); if (s) body += s; }
    const hz = cam.dir([0, 0, 1]), hy = hz ? hz[1] : -400;
    const haze = `<defs><linearGradient id="${H.id0}Hz" gradientUnits="userSpaceOnUse" x1="0" y1="${f(hy - 260)}" x2="0" y2="${f(hy + 260)}"><stop offset="0" stop-color="${H.P.skyH}" stop-opacity="0"/><stop offset="0.5" stop-color="${H.P.skyH}" stop-opacity="0.32"/><stop offset="1" stop-color="${H.P.skyH}" stop-opacity="0"/></linearGradient></defs><rect x="-60" y="${f(hy - 260)}" width="1200" height="520" fill="url(#${H.id0}Hz)" style="mix-blend-mode:screen"/>`;
    return H.back + body + haze + (o.over ? o.over(cam, t) : '');
  };
})(window);
