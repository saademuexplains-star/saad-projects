// "The Worm": inside the body. A warm, organic macro world (no x-ray look), one tall world in depth layers:
// gut (y < 1400) -> pelvis (1400 .. 2300) -> leg muscles (2300 .. 4400) -> the underside of the skin at the ankle (~4480).
// Everything is culled against the camera so long vertical travels stay cheap.
(function (G) {
  const { f, shade, mix, rng } = G.RIG, C = G.CINE, S = G.SETS;
  const vr = p => (G.ENG && G.ENG.viewRect ? G.ENG.viewRect(p) : null);
  const lerp = (a, b, u) => a + (b - a) * u, clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const ss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  const SKIN_Y = 4480;
  S.FLESH_SKIN_Y = SKIN_Y;

  // ---- curves
  const cr = (p0, p1, p2, p3, u) => { const u2 = u * u, u3 = u2 * u; return [0, 1].map(k => 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * u + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * u2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * u3)); };
  S.crSample = (pts, n = 14) => { const out = []; for (let i = 0; i < pts.length - 1; i++) for (let k = 0; k < n; k++) out.push(cr(pts[Math.max(0, i - 1)], pts[i], pts[i + 1], pts[Math.min(pts.length - 1, i + 2)], k / n)); out.push(pts[pts.length - 1]); return out; };
  const smoothD = pts => { let d = `M${f(pts[0][0])},${f(pts[0][1])}`; for (let i = 1; i < pts.length - 1; i++) { const m = [(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2]; d += ` Q${f(pts[i][0])},${f(pts[i][1])} ${f(m[0])},${f(m[1])}`; } return d + ` L${f(pts[pts.length - 1][0])},${f(pts[pts.length - 1][1])}`; };
  S.smoothD = smoothD;
  // arc-length helpers on a sampled route
  S.routeLen = pts => { const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); return L; };
  S.routeAt = (pts, L, u) => { const w = clamp(u) * L[L.length - 1]; let i = 1; while (i < L.length - 1 && L[i] < w) i++; const k = (w - L[i - 1]) / ((L[i] - L[i - 1]) || 1); return [lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)]; };
  S.routeSlice = (pts, L, u0, u1) => { const a = clamp(u0) * L[L.length - 1], b = clamp(u1) * L[L.length - 1], out = [S.routeAt(pts, L, u0)]; for (let i = 1; i < pts.length - 1; i++) if (L[i] > a && L[i] < b) out.push(pts[i]); out.push(S.routeAt(pts, L, u1)); return out; };

  // the worm's way through the body: a loose coil in the gut, past the hip bone, down between the leg muscles to the ankle
  S.FLESH_ROUTE = S.crSample([[300, 250], [700, 300], [830, 560], [560, 770], [300, 640], [250, 920], [520, 1130], [810, 1010], [870, 1260], [640, 1460],
    [500, 1760], [620, 2060], [540, 2360], [600, 2720], [520, 3120], [590, 3520], [540, 3920], [575, 4250], [560, SKIN_Y - 6]], 16);

  // ---- static content, built once (deterministic)
  const R0 = rng(311);
  const BLOBS = Array.from({ length: 60 }, () => ({ x: -900 + R0() * 2900, y: -1200 + R0() * 4200, r: 140 + R0() * 320, c: (R0() * 4) | 0, o: 0.35 + R0() * 0.4 }));
  const CAPS = Array.from({ length: 34 }, () => { const x0 = -700 + R0() * 2500, y0 = -1100 + R0() * 4100, pts = [[x0, y0]]; let a = R0() * Math.PI * 2; for (let k = 0; k < 7; k++) { a += (R0() - 0.5) * 1.2; const p = pts[pts.length - 1]; pts.push([p[0] + Math.cos(a) * 90, p[1] + Math.sin(a) * 90]); } return { pts, w: 2 + R0() * 3 }; });
  // the bowel: long tubes meandering over each other in the gut zone (mid layer, p 0.8)
  const TUBES = Array.from({ length: 8 }, (_, i) => {
    const r = rng(40 + i * 7); let x = -300 + r() * 1700, y = -500 + r() * 1700, a = r() * Math.PI * 2; const pts = [[x, y]];
    for (let k = 0; k < 15; k++) {
      a += Math.sin(k * 1.15 + i * 2.1) * 1.05 + (r() - 0.5) * 0.5;
      const dx = 560 - x, dy = 420 - y; if (Math.hypot(dx, dy) > 880) a = Math.atan2(dy, dx) + (r() - 0.5) * 0.7;
      x += Math.cos(a) * 150; y += Math.sin(a) * 150; pts.push([x, y]);
    }
    const sp = S.crSample(pts, 4), xs = sp.map(p => p[0]), ys = sp.map(p => p[1]);
    return { pts: sp, w: 118 + r() * 46, ph: r() * 6, box: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)] };
  });
  // fat lobules (pelvis / hip), clusters of translucent yellow cells
  const FAT = Array.from({ length: 70 }, () => ({ x: -500 + R0() * 2200, y: 1350 + R0() * 1100, r: 26 + R0() * 40 }));
  // muscle bellies down the leg (mid layer): spindle-shaped bundles in two staggered tiers, tapering into tendons
  const MUS = [];
  for (let i = 0; i < 19; i++) for (let tier = 0; tier < 3; tier++) {
    const y0 = 1850 + tier * 1050 + (R0() - 0.5) * 900, len = 1500 + R0() * 700;
    MUS.push({ x: -650 + i * 125 + R0() * 40, w: 150 + R0() * 90, y0, y1: y0 + len, sway: 20 + R0() * 40, ph: R0() * 6 });
  }
  MUS.sort((a, b) => a.w - b.w);
  // bellies just in front of the lens, only at the sides of the frame so they never cover the worm (p 1.18)
  const NEAR = [[150, 2600, 260], [930, 2900, 240], [60, 3500, 280], [1010, 3800, 250], [180, 4100, 230]].map(([x, y0, w], i) => ({ x, w, y0, y1: y0 + 1300, sway: 30, ph: i * 1.7 }));
  // blood vessels: a main vessel beside the worm route and side branches (layer p 0.92)
  const VES = [S.crSample([[820, -600], [880, 300], [760, 900], [860, 1500], [760, 2100], [830, 2700], [760, 3300], [820, 3900], [770, 4420]], 12)];
  for (let i = 0; i < 12; i++) { const r = rng(90 + i), y = -300 + i * 400, sd = i % 2 ? 1 : -1, pts = [[sd > 0 ? 830 : 790, y]]; for (let k = 1; k < 6; k++) pts.push([pts[0][0] + sd * k * (110 + r() * 40), y + k * (40 + r() * 50) + Math.sin(k * 1.7) * 30]); VES.push(S.crSample(pts, 6)); }
  const VESL = VES.map(S.routeLen);
  // floating cells right in front of the lens (p 1.3)
  const DUST = Array.from({ length: 70 }, () => ({ x: -900 + R0() * 2900, y: -900 + R0() * 7000, r: 8 + R0() * 34, sp: 0.4 + R0(), c: R0() }));

  const inV = (v, x, y, m) => !v || (x > v[0] - m && x < v[2] + m && y > v[1] - m && y < v[3] + m);
  const BLOBC = ['#5e1418', '#74201f', '#4c0e12', '#86302a'];

  // o.venom 0..1 with o.venomAt [x,y]: black poison spreads from that point up the vessels; o.heat 0..1 the skin under the ankle burns;
  // o.press 0..1 the worm head bulging the skin; o.light: extra warmth
  S.flesh = (t, o = {}) => {
    const L = [], vk = o.venom || 0, va = o.venomAt || [560, 3700];
    // ---- deep background: dark tissue with soft out-of-focus forms and faint capillaries
    {
      const v = vr(0.55);
      let g = `<defs>${BLOBC.map((c, i) => `<radialGradient id="flb${i}"><stop offset="0" stop-color="${shade(c, 0.25)}" stop-opacity="0.95"/><stop offset="0.55" stop-color="${c}" stop-opacity="0.6"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`).join('')}</defs>`;
      g += `<rect x="-3000" y="-3000" width="7000" height="12000" fill="#2c070a"/>`;
      for (const b of BLOBS) if (inV(v, b.x, b.y, b.r)) g += `<ellipse cx="${f(b.x + Math.sin(t * 0.3 + b.r) * 20)}" cy="${f(b.y)}" rx="${f(b.r)}" ry="${f(b.r * 0.8)}" fill="url(#flb${b.c})" opacity="${f(b.o)}"/>`;
      for (const cp of CAPS) if (inV(v, cp.pts[0][0], cp.pts[0][1], 700)) g += `<path d="${smoothD(cp.pts)}" stroke="#1a0306" stroke-width="${f(cp.w)}" fill="none" opacity="0.5"/>`;
      L.push({ p: 0.55, svg: g });
    }
    // ---- mid tissue: gut loops, fat, the hip bone, muscle bundles
    {
      const v = vr(0.8);
      let g = '';
      for (const tb of TUBES) {
        if (v && (tb.box[2] < v[0] - 200 || tb.box[0] > v[2] + 200 || tb.box[3] < v[1] - 200 || tb.box[1] > v[3] + 200)) continue;
        const d = smoothD(tb.pts), w = tb.w * (1 + 0.03 * Math.sin(t * 1.3 + tb.ph));
        // a wet tube: dark crease, body, lit top, specular streak, the ring folds of the bowel wall
        g += `<path d="${d}" stroke="#1e0306" stroke-width="${f(w + 30)}" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/><path d="${d}" stroke="#7e2c30" stroke-width="${f(w)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` +
          `<path d="${d}" stroke="#a84c4c" stroke-width="${f(w * 0.66)}" fill="none" stroke-linecap="round" stroke-linejoin="round" transform="translate(${f(-w * 0.06)},${f(-w * 0.08)})"/><path d="${d}" stroke="#c87670" stroke-width="${f(w * 0.3)}" fill="none" stroke-linecap="round" stroke-linejoin="round" transform="translate(${f(-w * 0.12)},${f(-w * 0.16)})" opacity="0.8"/>` +
          `<path d="${d}" stroke="#f4c4b4" stroke-width="${f(w * 0.06)}" fill="none" stroke-linecap="round" opacity="0.6" transform="translate(${f(-w * 0.2)},${f(-w * 0.24)})"/>` +
          `<path d="${d}" stroke="#4a0e12" stroke-width="${f(w * 0.92)}" fill="none" stroke-dasharray="2.5 ${f(w * 0.42)}" opacity="0.3"/>`;
      }
      for (const fz of FAT) if (inV(v, fz.x, fz.y, fz.r)) g += `<circle cx="${f(fz.x)}" cy="${f(fz.y)}" r="${f(fz.r)}" fill="#e0b070" opacity="0.22" stroke="#f0d090" stroke-width="2" stroke-opacity="0.35"/><circle cx="${f(fz.x - fz.r * 0.3)}" cy="${f(fz.y - fz.r * 0.35)}" r="${f(fz.r * 0.25)}" fill="#fff4d8" opacity="0.25"/>`;
      // hip bone (ivory, off to the right) and the top of the thigh bone
      if (inV(v, 1150, 1850, 900)) {
        const bone = `M840,1420 C1000,1340 1330,1360 1480,1480 C1560,1560 1540,1760 1420,1840 C1300,1920 1200,1900 1120,1980 C1060,2040 1080,2160 1040,2240 C980,2300 900,2260 880,2180 C860,2060 900,1960 860,1860 C820,1760 760,1620 840,1420Z`;
        g += `<defs><linearGradient id="flbn" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f2e6cc"/><stop offset="0.6" stop-color="#cdb898"/><stop offset="1" stop-color="#8a7458"/></linearGradient></defs>` +
          `<path d="${bone}" fill="url(#flbn)" stroke="#3a2418" stroke-width="3"/><path d="M900,1500 C1050,1440 1300,1450 1430,1540" stroke="#fff8e8" stroke-width="10" fill="none" opacity="0.45"/>` +
          `<path d="M1060,2200 C1040,2500 1050,2900 1030,3300" stroke="#b8a282" stroke-width="120" fill="none" stroke-linecap="round"/><path d="M1030,2240 C1012,2520 1020,2900 1002,3280" stroke="#f0e2c4" stroke-width="30" fill="none" opacity="0.5"/>` +
          `<ellipse cx="1060" cy="2200" rx="110" ry="96" fill="#e2d2b2" stroke="#3a2418" stroke-width="3"/><ellipse cx="1030" cy="2170" rx="40" ry="26" fill="#fff8e8" opacity="0.5"/>`;
      }
      for (const m of MUS) if (!v || (m.y1 > v[1] - 100 && m.y0 < v[3] + 100 && m.x > v[0] - 300 && m.x < v[2] + 300)) g += muscle(m, t);
      L.push({ p: 0.8, svg: g });
    }
    // ---- vessels with flowing blood (and the venom darkening them)
    {
      const v = vr(0.92);
      let g = '', dark = '';
      VES.forEach((pts, i) => {
        if (!pts.some(p => inV(v, p[0], p[1], 120))) return;
        const d = smoothD(pts), w = i === 0 ? 46 : 16;
        g += `<path d="${d}" stroke="#3a0408" stroke-width="${f(w + 10)}" fill="none" stroke-linecap="round"/><path d="${d}" stroke="#a01a22" stroke-width="${f(w)}" fill="none" stroke-linecap="round"/><path d="${d}" stroke="#e05a5a" stroke-width="${f(w * 0.22)}" fill="none" opacity="0.6" transform="translate(${f(-w * 0.15)},0)"/>`;
        const Ld = VESL[i], n = i === 0 ? 70 : 10;
        for (let k = 0; k < n; k++) {
          const u = ((k / n + t * (i === 0 ? 0.035 : 0.06)) % 1), p = S.routeAt(pts, Ld, u);
          if (!inV(v, p[0], p[1], 40)) continue;
          const poisoned = vk > 0 && p[1] < va[1] + 80 && p[1] > va[1] - vk * 2600;
          g += `<ellipse cx="${f(p[0] + Math.sin(k * 3.1) * w * 0.22)}" cy="${f(p[1])}" rx="${f(w * 0.3)}" ry="${f(w * 0.22)}" fill="${poisoned ? '#1a0a14' : '#d8302e'}" stroke="${poisoned ? '#000' : '#6a0a0e'}" stroke-width="1.5"/>`;
        }
        if (vk > 0) dark += `<path d="${d}" stroke="#08040a" stroke-width="${f(w + 4)}" fill="none" stroke-linecap="round" opacity="0.92"/><path d="${d}" stroke="#4a1a4a" stroke-width="${f(w * 2.6)}" fill="none" opacity="0.28" filter="url(#b8)"/>`;
      });
      if (vk > 0) {
        // the poison climbs the vessels from the torn worm: a clip window that grows upward
        const top = va[1] - vk * 2600, id = 'flvn' + Math.round(t * 60);
        g += `<defs><linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.12" stop-color="#fff" stop-opacity="1"/></linearGradient><mask id="${id}"><rect x="-3000" y="${f(top)}" width="7000" height="${f(va[1] + 120 - top)}" fill="url(#${id}g)"/></mask></defs><g mask="url(#${id})">${dark}</g>`;
      }
      L.push({ p: 0.92, svg: g });
    }
    // ---- near muscle bundles (in front of the worm's plane, defocused) are added by the shot via S.fleshNear
    return L;
  };
  // one muscle belly: a spindle that tapers into a tendon at both ends, with fibres running along it and a wet sheen
  let MID_ = 0;
  function muscle(m, t, o = {}) {
    const N = 22, L = [], Rr = [], C0 = [], id = 'flm' + (MID_++ % 100000);
    for (let k = 0; k <= N; k++) {
      const u = k / N, y = lerp(m.y0, m.y1, u), cx = m.x + Math.sin(y * 0.002 + m.ph) * m.sway + Math.sin(t * 0.8 + m.ph) * 4;
      const hw = m.w / 2 * (0.22 + 0.78 * Math.pow(Math.sin(Math.PI * u), 0.6));
      L.push([cx - hw, y]); Rr.push([cx + hw, y]); C0.push([cx, y, hw]);
    }
    // blunt tendon tips at both ends, and a pale tendon cord running on from each
    const top = [C0[0][0], m.y0 - m.w * 0.3], bot = [C0[N][0], m.y1 + m.w * 0.3];
    const shape = `M${f(top[0])},${f(top[1])} Q${f(L[0][0])},${f(m.y0 - m.w * 0.05)} ${L.map(p => `${f(p[0])},${f(p[1])}`).join(' L')} Q${f(L[N][0])},${f(m.y1 + m.w * 0.05)} ${f(bot[0])},${f(bot[1])} Q${f(Rr[N][0])},${f(m.y1 + m.w * 0.05)} ${Rr.reverse().map(p => `${f(p[0])},${f(p[1])}`).join(' L')} Q${f(Rr[Rr.length - 1][0])},${f(m.y0 - m.w * 0.05)} ${f(top[0])},${f(top[1])}Z`;
    const cord = (p, dy) => `<path d="M${f(p[0])},${f(p[1])} L${f(p[0] + 6)},${f(p[1] + dy)}" stroke="#d8b8a8" stroke-width="${f(m.w * 0.12)}" stroke-linecap="round" opacity="${o.near ? 0.25 : 0.4}"/>`;
    const dark = o.near ? '#3e0a0e' : '#5a1216', mid = o.near ? '#6e2024' : '#9a3634', lite = o.near ? '#8a3a38' : '#c2625a';
    let g = `<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${f(m.x - m.w / 2)}" y1="0" x2="${f(m.x + m.w / 2)}" y2="0"><stop offset="0" stop-color="${dark}"/><stop offset="0.32" stop-color="${lite}"/><stop offset="0.6" stop-color="${mid}"/><stop offset="1" stop-color="${dark}"/></linearGradient></defs>`;
    g += cord(top, -260) + cord(bot, 260) + `<path d="${shape}" fill="url(#${id})" stroke="#1e0306" stroke-width="3"/>`;
    for (const k of [-0.62, -0.34, -0.08, 0.2, 0.46, 0.7]) g += `<path d="M${C0.map(([x, y, hw]) => `${f(x + k * hw)},${f(y)}`).join(' L')}" stroke="${k < -0.2 ? '#e4948a' : '#4a0e12'}" stroke-width="${k < -0.2 ? 1.6 : 2.2}" fill="none" opacity="${k < -0.2 ? 0.35 : 0.45}"/>`;
    g += `<path d="M${C0.map(([x, y, hw]) => `${f(x - hw * 0.42)},${f(y)}`).join(' L')}" stroke="#ffd8cc" stroke-width="${f(m.w * 0.05)}" fill="none" opacity="0.4" stroke-linecap="round"/>`;
    return g;
  }
  // muscle bellies closer to the lens than the worm (p 1.18): darker, softer, only at the frame edges
  S.fleshNear = t => {
    const v = vr(1.18);
    let g = '';
    for (const m of NEAR) if (!v || (m.y1 > v[1] - 100 && m.y0 < v[3] + 100)) g += muscle(m, t, { near: true });
    return { p: 1.18, svg: g ? `<g opacity="0.92">${g}</g>` : '' };
  };
  // floating cells right in front of the lens
  S.fleshDust = t => {
    const v = vr(1.3);
    let g = '';
    for (const d of DUST) { const y = d.y - t * 60 * d.sp, x = d.x + Math.sin(t * 0.7 + d.c * 9) * 30; if (!inV(v, x, y, 60)) continue; g += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(d.r)}" fill="${d.c > 0.6 ? '#ffb0a0' : '#c84a46'}" opacity="${f(0.16 + d.c * 0.18)}" filter="url(#b8)"/>`; }
    return { p: 1.3, svg: g, light: true };
  };
  // the underside of the skin at the ankle: dermis band, the bulge where the worm presses, the burning
  S.fleshSkin = (t, o = {}) => {
    const y = SKIN_Y, pr = o.press || 0, ht = o.heat || 0, cx = o.at || 560;
    let d = `M-2000,${y}`;
    for (let x = -2000; x <= 3000; x += 40) { const k = Math.exp(-Math.pow((x - cx) / 160, 2)); d += ` L${x},${f(y + Math.sin(x * 0.012) * 8 + k * pr * 70)}`; }
    const band = `${d} L3000,${y + 900} L-2000,${y + 900}Z`;
    let g = `<path d="${band}" fill="#e2b49a"/><path d="${band}" fill="#c87a64" opacity="0.5" transform="translate(0,34)"/><path d="${d}" stroke="#fff0e0" stroke-width="10" fill="none" opacity="0.45"/>`;
    g += `<path d="${band}" fill="#120406" transform="translate(0,140)"/>`;
    for (let i = 0; i < 26; i++) { const x = -1200 + i * 160; g += `<path d="M${x},${y + 30} q30,40 0,80" stroke="#a85a4a" stroke-width="3" fill="none" opacity="0.4"/>`; }
    if (pr > 0) g += `<ellipse cx="${f(cx)}" cy="${f(y + pr * 40)}" rx="${f(90 + pr * 60)}" ry="${f(40 + pr * 30)}" fill="#fff4e8" opacity="${f(0.25 * pr)}" filter="url(#b8)"/>`;
    if (ht > 0) g += C.radial(cx, y + 30, 520, '#ff4a1a', 0.55 * ht, 'screen') + C.radial(cx, y + 40, 180, '#ffc060', 0.5 * ht, 'screen');
    return { p: 1, svg: g };
  };
})(window);
