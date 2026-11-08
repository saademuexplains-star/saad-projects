// Sets for "The Royal Astrologer" part 1: the astrologer's tower (night; day and seasons for the end), the castle
// gate at night with the old astrologer's head on its pike, the great hall at the night feast.
(function (G) {
  const S = G.SETS, { f, shade, mix, rng, uid, ol } = G.RIG, C = G.CINE, E = G.ENV, PR = G.PROPS;
  const lerp = (a, b, t) => a + (b - a) * t, cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const ss = (a, b, x) => { const t = cl((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  const TAU = Math.PI * 2;
  const OUTC = '#140c06';
  const olr = (w = 2, op = 0.7) => `stroke="${OUTC}" stroke-width="${w}" stroke-opacity="${op}" stroke-linejoin="round"`;
  const cache = {}, once = (k, fn) => cache[k] || (cache[k] = fn());

  // ---------------- shared pieces
  // ashlar: coursed stone blocks with varied tone, chipped edges and a lit top edge
  const ashlar = (x0, y0, x1, y1, seed, base, o = {}) => {
    const r = rng(seed), bh = o.bh || 64, bw = o.bw || 150;
    let g = `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="${shade(base, -0.25)}"/>`;
    for (let y = y0, row = 0; y < y1; y += bh, row++) for (let x = x0 - (row % 2) * bw / 2; x < x1; x += bw) {
      const w = bw - 6, h = bh - 6, c = shade(base, (r() - 0.5) * 0.2);
      g += `<rect x="${f(x + 3)}" y="${f(y + 3)}" width="${f(w)}" height="${f(h)}" rx="5" fill="${c}"/>`;
      g += `<path d="M${f(x + 6)},${f(y + 5)} L${f(x + w - 2)},${f(y + 5)}" stroke="${shade(base, 0.22)}" stroke-width="3" opacity="0.5"/>`;
      if (r() < 0.25) g += `<path d="M${f(x + 10 + r() * (w - 30))},${f(y + 8 + r() * (h - 16))} l${f(8 + r() * 14)},${f(4 + r() * 8)} l${f(-4 + r() * 10)},${f(6 + r() * 6)}" stroke="${shade(base, -0.45)}" stroke-width="2" fill="none" opacity="0.6"/>`;
    }
    return `<g filter="url(#plaster)">${g}</g>`;
  };
  S.ashlar = ashlar;
  // a star field; o.rot (deg, about o.pole), o.trail (deg of arc drawn behind each star = star trails), twinkle with t
  const stars = (x0, y0, x1, y1, n, seed, t, o = {}) => {
    const r = rng(seed), [px, py] = o.pole || [(x0 + x1) / 2, y0], rot = (o.rot || 0) * Math.PI / 180, tr = (o.trail || 0) * Math.PI / 180;
    let g = '';
    for (let i = 0; i < n; i++) {
      const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), big = r(), ph = r() * TAU, rr = big > 0.96 ? 3.4 : big > 0.85 ? 2.4 : 1.4;
      const tw = 0.55 + 0.45 * Math.sin(t * (1.5 + r() * 2) + ph), dx = x - px, dy = y - py, R = Math.hypot(dx, dy), a0 = Math.atan2(dy, dx) + rot;
      const sx = px + R * Math.cos(a0), sy = py + R * Math.sin(a0);
      if (tr > 0.002 && R > 4) { const a1 = a0 - tr; g += `<path d="M${f(px + R * Math.cos(a1))},${f(py + R * Math.sin(a1))} A${f(R)},${f(R)} 0 0 1 ${f(sx)},${f(sy)}" stroke="#e8eeff" stroke-width="${f(rr * 0.9)}" fill="none" opacity="${f(0.55 * (0.5 + big * 0.5))}" stroke-linecap="round"/>`; }
      else g += `<circle cx="${f(sx)}" cy="${f(sy)}" r="${rr}" fill="#f4f6ff" opacity="${f(tw * (0.5 + big * 0.5))}"/>` + (big > 0.96 ? `<path d="M${f(sx - 9)},${f(sy)} L${f(sx + 9)},${f(sy)} M${f(sx)},${f(sy - 9)} L${f(sx)},${f(sy + 9)}" stroke="#f4f6ff" stroke-width="1.2" opacity="${f(tw * 0.7)}"/>` : '');
    }
    return g;
  };
  S.stars16 = stars;
  // the night sky: a deep gradient, a soft milky band, stars; the moon off-centre with craters and a modest halo
  const nightSky = (x0, y0, x1, y1, t, o = {}) => {
    const id = 'ns' + (o.id || 0);
    let g = `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05070f"/><stop offset="0.6" stop-color="#0c1428"/><stop offset="1" stop-color="#1a2440"/></linearGradient></defs><rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="url(#${id})"/>`;
    g += `<path d="M${x0},${f(y0 + (y1 - y0) * 0.7)} C${f(x0 + (x1 - x0) * 0.3)},${f(y0 + (y1 - y0) * 0.4)} ${f(x0 + (x1 - x0) * 0.6)},${f(y0 + (y1 - y0) * 0.25)} ${x1},${f(y0 + (y1 - y0) * 0.05)}" stroke="#8a9ac8" stroke-width="${f((x1 - x0) * 0.12)}" fill="none" opacity="0.07" filter="url(#b14)"/>`;
    g += stars(x0, y0, x1, y1, o.n || 260, o.seed || 3, t, o);
    if (o.moon) { const [mx, my, mr] = o.moon; g += C.radial(mx, my, mr * 3.2, '#c8d4f0', 0.22, 'screen') + `<circle cx="${mx}" cy="${my}" r="${mr}" fill="#eef0f4"/><circle cx="${mx - mr * 0.3}" cy="${my - mr * 0.2}" r="${mr * 0.22}" fill="#d0d4dc"/><circle cx="${mx + mr * 0.3}" cy="${my + mr * 0.25}" r="${mr * 0.16}" fill="#d4d8e0"/><circle cx="${mx + mr * 0.1}" cy="${my - mr * 0.45}" r="${mr * 0.1}" fill="#d8dce2"/><circle cx="${mx + mr * 0.22}" cy="${my}" r="${mr}" fill="#05070f" opacity="0.18"/>`; }
    return g;
  };
  S.nightSky16 = nightSky;
  // drifting clouds, silvered on top by the moon
  const clouds = (x0, x1, y, t, seed, n, o = {}) => {
    const r = rng(seed); let g = '';
    for (let i = 0; i < n; i++) {
      const w = 260 + r() * 360, h = 50 + r() * 50, sp = 6 + r() * 10, x = x0 + (((r() * (x1 - x0) + t * sp) % (x1 - x0 + w)) + (x1 - x0 + w)) % (x1 - x0 + w) - w, yy = y + (r() - 0.5) * (o.spread || 300);
      g += `<path d="M${f(x)},${f(yy)} C${f(x + w * 0.1)},${f(yy - h)} ${f(x + w * 0.35)},${f(yy - h * 1.2)} ${f(x + w * 0.5)},${f(yy - h * 0.6)} C${f(x + w * 0.62)},${f(yy - h * 1.3)} ${f(x + w * 0.9)},${f(yy - h)} ${f(x + w)},${f(yy)}Z" fill="${o.col || '#2a3250'}" opacity="${o.op || 0.85}"/>`;
      g += `<path d="M${f(x + w * 0.1)},${f(yy - h * 0.7)} C${f(x + w * 0.25)},${f(yy - h * 1.15)} ${f(x + w * 0.42)},${f(yy - h * 1.1)} ${f(x + w * 0.5)},${f(yy - h * 0.6)}" stroke="${o.rim || '#8a9ac0'}" stroke-width="4" fill="none" opacity="0.45"/>`;
    }
    return `<g filter="url(#b2)">${g}</g>`;
  };
  S.clouds16 = clouds;
  // an iron wall sconce with a tallow candle (flame flickers; a warm pool of light on the wall)
  const sconce = (x, y, s, t, seed = 0, glow = 1) => `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><path d="M-6,0 L-6,-60 C-6,-80 30,-90 40,-70 L44,-60" stroke="#1e1a16" stroke-width="7" fill="none"/><path d="M20,-70 L68,-70 L60,-60 L28,-60Z" fill="#2a2420" ${olr(1)}/><rect x="36" y="-122" width="16" height="54" rx="4" fill="#efe6cc" ${olr(1)}/></g>` + PR.flame(x + 44 * s, y - 122 * s, 0.9 * s, t + seed) + (glow ? C.radial(x + 44 * s, y - 140 * s, 260 * s, '#ffb860', 0.4 * glow, 'screen') : '');
  S.sconce16 = sconce;
  // an arched opening (round head): x, y = top of the springing line left corner, w, h total height
  const archD = (x, y, w, h) => { const r = w / 2; return `M${x},${y + h} L${x},${y + r} A${r},${r} 0 0 1 ${x + w},${y + r} L${x + w},${y + h}Z`; };
  S.archD16 = archD;
  // a hanging iron lantern on a chain, glowing (world)
  const chainLamp = (x, y0, y, s, t, ph = 0) => { const sw = Math.sin(t * 0.8 + ph) * 2; return `<path d="M${x},${y0} L${f(x + sw * 3)},${y}" stroke="#2a2420" stroke-width="5" stroke-dasharray="10 5"/>` + PR.lantern(x + sw * 3, y, s, t, sw); };

  // ======================================================= THE ASTROLOGER'S TOWER
  // world: back wall base 1500, floor to 2300. Two open arched windows (left 0-360, right 720-1080, sill 1130) show the
  // sky; a painted gold zodiac between them; an open conical timber roof with an oculus at (540, -950); the desk at the
  // left; the armillary sphere centre-right; the celestial globe at the right edge; a fireplace off-frame left (the end).
  // o.mode 'night' | 'day'; o.season 0 autumn, 1 winter, 2 spring (day only); o.spin (star rotation, deg); o.trail;
  // o.fire 0..1 (the hearth, for the end); o.armRot (the armillary rings); o.desk false to hide the desk props
  S.OB = { FY: 1500, FLOOR: 2300, WINL: [0, 260, 360, 870], WINR: [720, 260, 360, 870], OCU: [540, -560, 230], DESK: [20, 470, 1440], ARM: [790, 1735, 1.05],
    GLOBE: [1210, 1790, 0.85], CANDLE: [250, 1380], HOURG: [400, 1440], CHART: [180, 1446], FIRE: [-300, 1500], YOU: [590, 1850], KING: [300, 1840] };
  S.tower = (t, o = {}) => {
    const B = S.OB, L = [], day = o.mode === 'day', ss2 = o.season || 0;
    // the sky beyond the windows and the oculus
    let sky;
    if (!day) sky = nightSky(-700, -1700, 1800, 1500, t, { n: 420, seed: 7, moon: [960, 120, 54], rot: o.spin || 0, trail: o.trail || 0, pole: [560, -500], id: 'ob' });
    else {
      // o.season2 + o.seasonK cross-fade one season into the next (the years passing at the end)
      const daySky = s3 => { const top = s3 === 1 ? '#9aa8b8' : '#6a9ad0', bot = s3 === 1 ? '#d8dee6' : s3 === 0 ? '#e8c89a' : '#cfe0f0'; return `<defs><linearGradient id="obday${s3}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bot}"/></linearGradient></defs><rect x="-700" y="-1700" width="2500" height="3200" fill="url(#obday${s3})"/>`; };
      sky = daySky(ss2) + (o.season2 != null && o.seasonK > 0.001 ? `<g opacity="${f(o.seasonK)}">${daySky(o.season2)}</g>` : '') + clouds(-700, 1800, 300, t, 11, 6, { col: '#f4f2ee', rim: '#ffffff', op: 0.8, spread: 500 });
    }
    // the king's constellation: a crown of stars that the camera finds through the oculus; o.crown 0..1 draws its lines
    if (!day && o.crown) {
      const k = o.crown, pts = [[380, 400], [430, 250], [490, 340], [540, 200], [590, 340], [650, 250], [700, 400]], base = [[380, 400], [700, 400]];
      let cg = '', d = `M${pts[0][0]},${pts[0][1]}`;
      for (let i = 1; i < pts.length; i++) d += ` L${pts[i][0]},${pts[i][1]}`;
      d += ` L${base[0][0]},${base[0][1]}`;
      cg += `<path d="${d}" stroke="#e8c870" stroke-width="3" fill="none" stroke-dasharray="${f(1500 * k)} 1600" opacity="0.85"/>`;
      cg += C.radial(540, 320, 260, '#e8c870', 0.1 * k, 'screen') + pts.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i % 3 ? 4.5 : 6.5}" fill="#fff6d8"/>` + `<circle cx="${x}" cy="${y}" r="16" fill="#fff0c0" opacity="${f(0.25 * k)}"/>`).join('');
      sky += cg;
    }
    L.push({ p: 0.22, svg: sky });
    // far: the town roofs and hills seen far below the windows (night: lit windows; day: by season)
    const farOf = s3 => once('obfar' + (day ? s3 : 'n'), () => {
      const r = rng(21); let g = `<path d="M-700,1180 C-300,1090 100,1150 500,1100 C900,1060 1300,1130 1800,1080 L1800,1600 L-700,1600Z" fill="${day ? (s3 === 1 ? '#c8ccd4' : s3 === 0 ? '#8a6a3a' : '#6a8a4a') : '#0e1424'}"/>`;
      for (let i = 0; i < 46; i++) { const x = -700 + r() * 2500, y = 1150 + r() * 120, w = 30 + r() * 60, h = 30 + r() * 40; g += `<path d="M${f(x)},${f(y)} l${f(w / 2)},${f(-h)} l${f(w / 2)},${f(h)}Z" fill="${day ? (s3 === 1 ? '#f0f0f4' : '#7a5a4a') : '#141a2a'}"/><rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(40 + r() * 30)}" fill="${day ? (s3 === 1 ? '#d8d8dc' : '#b8a888') : '#10141e'}"/>` + (!day && r() < 0.35 ? `<rect x="${f(x + w * 0.4)}" y="${f(y + 12)}" width="7" height="9" fill="#ffc870" opacity="0.85"/>` : ''); }
      return g;
    });
    L.push({ p: 0.36, svg: farOf(ss2) + (day && o.season2 != null && o.seasonK > 0.001 ? `<g opacity="${f(o.seasonK)}">${farOf(o.season2)}</g>` : '') });
    // the back wall, with the window openings, the zodiac fresco, sconces and niches (p 0.82)
    const wall = once('obwall', () => {
      let g = `<defs><clipPath id="obwin"><path d="M-700,-100 L1800,-100 L1800,1500 L-700,1500Z ${archD(...B.WINL)} ${archD(...B.WINR)}" clip-rule="evenodd"/></clipPath></defs>`;
      g += `<g clip-path="url(#obwin)">${ashlar(-700, -100, 1800, 1500, 5, '#5e5244', { bh: 70, bw: 160 })}</g>`;
      for (const w of [B.WINL, B.WINR]) { const [x, y, ww, hh] = w; g += `<path d="${archD(x - 26, y - 26, ww + 52, hh + 26)}" fill="none" stroke="#3a3026" stroke-width="22"/><path d="${archD(x - 12, y - 12, ww + 24, hh + 12)}" fill="none" stroke="#8a7a62" stroke-width="8"/>`;
        g += `<rect x="${x - 40}" y="${y + hh}" width="${ww + 80}" height="34" fill="#6e6252" ${olr(1.5)}/><path d="M${x + ww / 2},${y} L${x + ww / 2},${y + hh}" stroke="#4a4034" stroke-width="18"/><path d="M${x},${y + hh * 0.45} L${x + ww},${y + hh * 0.45}" stroke="#4a4034" stroke-width="12"/>`; }
      // the zodiac fresco: a dark blue disc ringed with gold, twelve signs, stars, a sun and a crescent
      const zx = 540, zy = 520, zr = 150;
      g += `<circle cx="${zx}" cy="${zy}" r="${zr + 22}" fill="#8a6a2a" ${olr(2)}/><circle cx="${zx}" cy="${zy}" r="${zr}" fill="#13204a"/><circle cx="${zx}" cy="${zy}" r="${zr * 0.62}" fill="none" stroke="#c9a040" stroke-width="4"/>`;
      for (let k = 0; k < 12; k++) { const a = k * TAU / 12, c = Math.cos(a), s2 = Math.sin(a); g += `<path d="M${f(zx + c * zr * 0.62)},${f(zy + s2 * zr * 0.62)} L${f(zx + c * zr)},${f(zy + s2 * zr)}" stroke="#c9a040" stroke-width="3"/><circle cx="${f(zx + Math.cos(a + 0.26) * zr * 0.82)}" cy="${f(zy + Math.sin(a + 0.26) * zr * 0.82)}" r="7" fill="#e8c870"/>`; }
      g += `<circle cx="${zx}" cy="${zy}" r="30" fill="#e8c050"/>` + [0, 1, 2, 3, 4, 5, 6, 7].map(k => { const a = k * TAU / 8; return `<path d="M${f(zx + Math.cos(a) * 36)},${f(zy + Math.sin(a) * 36)} L${f(zx + Math.cos(a) * 52)},${f(zy + Math.sin(a) * 52)}" stroke="#e8c050" stroke-width="5"/>`; }).join('');
      g += `<path d="M${zx + 70},${zy - 60} C${zx + 40},${zy - 40} ${zx + 44},${zy - 4} ${zx + 74},${zy + 6} C${zx + 54},${zy - 18} ${zx + 54},${zy - 44} ${zx + 70},${zy - 60}Z" fill="#e8e0c8"/>`;
      // wainscot and a cornice
      g += `<rect x="-700" y="1180" width="2500" height="320" fill="#3a2414" filter="url(#woodV)"/>` + Array.from({ length: 16 }, (_, i) => `<rect x="${-690 + i * 160}" y="1210" width="140" height="260" rx="6" fill="#2e1c10" ${olr(1.4, 0.5)}/><path d="M${-680 + i * 160},1230 L${-680 + i * 160},1450 M${-620 + i * 160},1230 L${-620 + i * 160},1450" stroke="#4a3018" stroke-width="5" opacity="0.6"/>`).join('');
      g += `<rect x="-700" y="1172" width="2500" height="16" fill="#5a3a20"/><rect x="-700" y="-118" width="2500" height="44" fill="#4a3e32"/><rect x="-700" y="-118" width="2500" height="8" fill="#7a6a54"/>`;
      // the hearth off to the left (lit only at the end)
      g += `<path d="M-520,1500 L-520,1060 L-80,1060 L-80,1500Z" fill="#4a4036" ${olr(2)}/><path d="M-470,1500 L-470,1160 C-470,1120 -130,1120 -130,1160 L-130,1500Z" fill="#0e0a08"/><rect x="-560" y="1030" width="520" height="40" fill="#6a5a48" ${olr(1.5)}/>`;
      return g;
    });
    let wallLive = wall;
    for (const [x, y, sd] of [[-180, 900, 1], [400, 960, 2], [1180, 900, 3], [680, 960, 4]]) wallLive += sconce(x, y, 1, t, sd, day ? 0.3 : 1);
    if (o.fire) wallLive += S.flames(-300, 1480, 280, 260, t, 61, o.fire);
    // hanging astrolabes and a quadrant on the wall; shelves of books at the sides
    wallLive += PR.astrolabe(-260, 300, 0.9, t, { ph: 1 }) + PR.astrolabe(1360, 340, 0.8, t, { ph: 2.2 }) + PR.quadrant(390, 120, 0.7, t);
    wallLive += once('obshelves', () => {
      const r = rng(9); let g = '';
      for (const [x0, x1] of [[-680, -360], [1440, 1760]]) for (let y = 260; y < 1160; y += 180) {
        g += `<rect x="${x0}" y="${y + 150}" width="${x1 - x0}" height="22" fill="#4a2e18" ${olr(1.2)}/>`;
        for (let x = x0 + 10; x < x1 - 30;) { const w = 18 + r() * 22, h = 90 + r() * 50; g += `<rect x="${f(x)}" y="${f(y + 150 - h)}" width="${f(w)}" height="${f(h)}" fill="${['#5a2a1e', '#2a3a5a', '#4a4a2a', '#6a4a2a', '#3a1e2a'][Math.floor(r() * 5)]}" ${olr(1, 0.6)}/><path d="M${f(x + 3)},${f(y + 160 - h)} L${f(x + w - 3)},${f(y + 160 - h)}" stroke="#c9a040" stroke-width="2" opacity="0.6"/>`; x += w + 2; }
        if (r() < 0.6) g += `<path d="M${x1 - 120},${y + 132} l90,0 l-6,18 l-80,0Z" fill="#d8c8a0" ${olr(1)}/><circle cx="${x1 - 116}" cy="${y + 141}" r="10" fill="#c8b890" ${olr(1)}/>`;
      }
      return g;
    });
    // the roof: a cone of rafters seen from below, open at the oculus (p 0.7). It is clipped above the wall and drawn
    // before it, so the wall always covers the join whatever the parallax does.
    const roof = once('obroof', () => {
      const [ox, oy, orr] = B.OCU;
      let g = `<defs><clipPath id="obroofc"><rect x="-1200" y="-2600" width="3600" height="2520"/></clipPath></defs><g clip-path="url(#obroofc)">` + `<path d="M-900,-160 L1980,-160 L1980,-2200 L-900,-2200Z M${ox - orr},${oy} A${orr},${orr} 0 1,0 ${ox + orr},${oy} A${orr},${orr} 0 1,0 ${ox - orr},${oy}Z" fill="#241810" fill-rule="evenodd"/>`;
      for (let k = 0; k < 18; k++) { const a = k * TAU / 18, c = Math.cos(a), s2 = Math.sin(a); g += `<path d="M${f(ox + c * orr)},${f(oy + s2 * orr)} L${f(ox + c * 2600)},${f(oy + s2 * 1400)}" stroke="#3a2614" stroke-width="40"/><path d="M${f(ox + c * orr)},${f(oy + s2 * orr)} L${f(ox + c * 2600)},${f(oy + s2 * 1400)}" stroke="#5a3a1e" stroke-width="10" opacity="0.6"/>`; }
      for (const rr of [1.5, 2.3, 3.4]) g += `<ellipse cx="${ox}" cy="${oy}" rx="${orr * rr}" ry="${orr * rr * 0.62}" fill="none" stroke="#2e1e10" stroke-width="22"/>`;
      g += `<circle cx="${ox}" cy="${oy}" r="${orr + 16}" fill="none" stroke="#6a4a26" stroke-width="30"/><circle cx="${ox}" cy="${oy}" r="${orr + 16}" fill="none" stroke="#a8844a" stroke-width="6" opacity="0.6"/></g>`;
      return g;
    });
    L.push({ p: 0.7, svg: roof + (day ? '' : C.radial(B.OCU[0], B.OCU[1] + 200, 600, '#7a8ab8', 0.12, 'screen')) });
    // seasons in the windows by day: falling leaves (autumn), snow (winter), blossom (spring)
    if (day) {
      const parts = (s3, op) => {
        if (op < 0.01) return '';
        const r = rng(91 + s3); let pt = '';
        for (let i = 0; i < 70; i++) {
          const x0 = -300 + r() * 1700, sp = 60 + r() * 80, y = ((r() * 1600 + t * sp) % 1600) - 200, x = x0 + Math.sin(t * (0.6 + r()) + i) * 40, rr = 4 + r() * 6;
          pt += s3 === 1 ? `<circle cx="${f(x)}" cy="${f(y)}" r="${f(rr * 0.6)}" fill="#ffffff" opacity="0.9"/>`
            : `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rr)}" ry="${f(rr * 0.5)}" transform="rotate(${f(t * 90 + i * 40)} ${f(x)} ${f(y)})" fill="${s3 === 0 ? ['#c86a1e', '#a83a14', '#d8a030'][i % 3] : ['#f4c8d8', '#ffffff', '#f0b8c8'][i % 3]}"/>`;
        }
        return `<g opacity="${f(op)}">${pt}${s3 === 1 ? `<rect x="-700" y="1120" width="2500" height="14" fill="#ffffff" opacity="0.9"/>` : ''}</g>`;
      };
      const k2 = o.season2 != null ? (o.seasonK || 0) : 0;
      L.push({ p: 0.4, svg: parts(ss2, 1 - k2) + (k2 > 0 ? parts(o.season2, k2) : '') });
    }
    L.push({ p: 0.82, svg: wallLive });
    // floor: planks in perspective and the brass zodiac inlay; moonlight (or daylight) pooling from the windows
    const floor = once('obfloor', () => {
      let g = `<rect x="-900" y="${B.FY}" width="2900" height="1000" fill="#3a2616" filter="url(#woodH)"/>`;
      for (let x = -2400; x <= 3400; x += 120) g += `<path d="M${f(540 + (x - 540) * 0.32)},${B.FY} L${x},2600" stroke="#24160c" stroke-width="3"/>`;
      for (const y of [30, 72, 130, 210, 320, 470, 680]) g += `<path d="M-900,${B.FY + y} L2000,${B.FY + y}" stroke="#2a1a0e" stroke-width="${f(1.5 + y / 200)}" opacity="0.7"/>`;
      g += `<ellipse cx="540" cy="1880" rx="520" ry="160" fill="none" stroke="#a8843a" stroke-width="10"/><ellipse cx="540" cy="1880" rx="420" ry="128" fill="none" stroke="#a8843a" stroke-width="5"/>`;
      for (let k = 0; k < 12; k++) { const a = k * TAU / 12; g += `<path d="M${f(540 + Math.cos(a) * 420)},${f(1880 + Math.sin(a) * 128)} L${f(540 + Math.cos(a) * 520)},${f(1880 + Math.sin(a) * 160)}" stroke="#a8843a" stroke-width="5"/>`; }
      return g;
    });
    let fl = floor + (day ? C.radial(740, 1700, 600, '#fff2d8', 0.18, 'screen') : `<path d="M720,1130 L1080,1130 L1260,1900 L700,1900Z" fill="#9ab0e0" opacity="0.07"/><path d="M0,1130 L360,1130 L420,1900 L-180,1900Z" fill="#9ab0e0" opacity="0.06"/>`);
    L.push({ p: 1, svg: fl });
    // the instruments and the desk (p 1)
    let inst = PR.celestialGlobe(B.GLOBE[0], B.GLOBE[1], B.GLOBE[2], t) + PR.armillary(B.ARM[0], B.ARM[1], B.ARM[2], t, { rot: o.armRot });
    L.push({ p: 1, svg: inst + (o.desk === 'front' || o.desk === false ? '' : S.towerDesk(t, o)) });
    // foreground: a hanging lantern at the top left and a pile of books at the bottom right, both soft (p 1.3)
    L.push({ p: 1.3, svg: `<g filter="url(#dof1)">${chainLamp(-120, -900, -120, 1.3, t)}<path d="M1100,2280 L1500,2240 L1520,2420 L1080,2440Z" fill="#3a1e14"/><path d="M1120,2200 L1460,2180 L1480,2250 L1110,2270Z" fill="#2a3a5a"/></g>` });
    return L;
  };

  // the desk: chart (o.doom, o.cross; o.chartK = how upright it is drawn, 0.35 lying flat), hourglass (o.sand), the
  // candelabrum, inkpot and quill. The shots draw it in front of you when you stand behind it (o.desk 'front').
  // A standing writing desk is the same desk raised: o.dy (top), o.legY (where the legs end) and o.cand ([x, scale] of
  // the candelabrum) move it without touching the default one.
  S.towerDesk = (t, o = {}) => {
    const B = S.OB, [dx0, dx1] = B.DESK, dy = o.dy ?? B.DESK[2], sh = dy - B.DESK[2], legY = o.legY ?? B.FY + 60, [cdx, cds] = o.cand || [80, 0.9];
    let desk = `<rect x="${dx0}" y="${dy}" width="${dx1 - dx0}" height="26" fill="#5a3a1e" filter="url(#woodH)" ${olr(1.5)}/><path d="M${dx0 + 20},${dy + 26} L${dx0 + 20},${legY} M${dx1 - 20},${dy + 26} L${dx1 - 20},${legY}" stroke="#3a2412" stroke-width="24"/><rect x="${dx0 + 10}" y="${dy + 26}" width="${dx1 - dx0 - 20}" height="70" fill="#4a2e16" ${olr(1.2)}/>`;
    desk += `<g transform="translate(${B.CHART[0]},${B.CHART[1] + sh}) scale(1,${o.chartK ?? 0.35})">${PR.horoscope(0, 0, 0.42, t, { doom: o.doom || 0, cross: o.cross || 0 })}</g>`;
    desk += PR.hourglass(B.HOURG[0], B.HOURG[1] + sh, 0.62, t, o.sand ?? 0.4) + PR.candelabra(cdx, dy, cds, t, 3) + `<rect x="300" y="${dy - 40}" width="34" height="40" rx="6" fill="#1a1612" ${olr(1)}/>` + (o.quill === false ? '' : `<path d="M318,${dy - 40} L360,${dy - 130}" stroke="#ece4d0" stroke-width="5"/>`);
    return desk + C.radial(cdx + 30, o.cand ? dy - 155 * cds : dy - 140, 360, '#ffb860', 0.35, 'screen');
  };

  // ======================================================= THE CASTLE GATE AT NIGHT
  // world: road 1700-2200; gatehouse towers 60-330 and 750-1020 from 300 to the road; the arch 330-750 up to 900; the
  // pike with the head on the battlement over the arch (base 300); behind (p 0.78) the tall tower with your lit window
  // at (880, -1560); the moon left of the sky.
  S.GT = { ROAD: 1700, PIKE: [540, 296, 0.82], HEAD: [540, -110], WIN: [880, -1560, 140, 220], TOWER: [700, 1060] };
  S.gateNight = (t, o = {}) => {
    const B = S.GT, L = [];
    L.push({ p: 0.18, svg: nightSky(-1600, -3200, 2700, 1600, t, { n: 520, seed: 13, moon: o.moon || [140, -1100, 70], id: 'gt' }) });
    L.push({ p: 0.26, svg: clouds(-1600, 2700, -900, t, 5, 7, { spread: 900 }) });
    // far hills and the town below the castle rock
    L.push({ p: 0.45, svg: once('gtfar', () => { const r = rng(4); let g = `<path d="M-1400,1150 C-800,1020 -200,1120 300,1060 C800,1000 1400,1110 2400,1040 L2400,2000 L-1400,2000Z" fill="#0c1220"/>`; for (let i = 0; i < 30; i++) { const x = -1300 + r() * 3600, y = 1120 + r() * 120; g += `<rect x="${f(x)}" y="${f(y)}" width="6" height="8" fill="#ffc870" opacity="${f(0.5 + r() * 0.4)}"/>`; } return g; }) });
    // the castle behind: curtain wall and the tall round tower with your lit window
    const back = once('gtback', () => {
      const [tx0, tx1] = B.TOWER;
      let g = `<rect x="-1200" y="200" width="3400" height="1500" fill="#2a2a34"/>` + `<g opacity="0.85">${ashlar(-1200, 200, 2200, 1500, 31, '#3a3a46', { bh: 80, bw: 180 })}</g>`;
      for (let x = -1200; x < 2200; x += 120) g += `<rect x="${x}" y="150" width="70" height="60" fill="#2e2e3a"/>`;
      g += `<rect x="${tx0}" y="-2100" width="${tx1 - tx0}" height="2300" fill="#30303c"/>` + `<g opacity="0.9">${ashlar(tx0, -2100, tx1, 200, 32, '#3e3e4a', { bh: 76, bw: 120 })}</g>`;
      g += `<path d="M${tx0 - 40},-2100 L${(tx0 + tx1) / 2},-2620 L${tx1 + 40},-2100Z" fill="#1e1e28" ${olr(2)}/><path d="M${(tx0 + tx1) / 2},-2620 L${(tx0 + tx1) / 2},-2720" stroke="#1e1e28" stroke-width="8"/>`;
      g += `<path d="M${(tx0 + tx1) / 2 + 4},-2700 l70,16 l-70,18Z" fill="#5a1a2a"/>`;
      g += `<rect x="${tx0 - 30}" y="-2140" width="${tx1 - tx0 + 60}" height="50" fill="#2a2a36" ${olr(1.5)}/>`;
      for (const y of [-1100, -500]) g += `<rect x="${(tx0 + tx1) / 2 - 10}" y="${y}" width="20" height="90" fill="#0c0c12"/>`;
      // round it: dark at both edges, a moonlit band on the left
      g += `<defs><linearGradient id="gtcyl" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity="0.55"/><stop offset="0.18" stop-color="#a8b8e0" stop-opacity="0.16"/><stop offset="0.45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.7"/></linearGradient></defs><rect x="${tx0}" y="-2100" width="${tx1 - tx0}" height="2300" fill="url(#gtcyl)"/>`;
      return g;
    });
    const [wx, wy, ww, wh] = B.WIN;
    let win = `<path d="${archD(wx - ww / 2, wy, ww, wh)}" fill="#ffb860"/>` + C.radial(wx, wy + wh / 2, 380, '#ffa040', 0.45, 'screen') + `<path d="${archD(wx - ww / 2 - 14, wy - 14, ww + 28, wh + 14)}" fill="none" stroke="#2a2a34" stroke-width="16"/>`;
    // you, a small silhouette in the window, looking down at the gate
    win += `<path d="M${wx - 30},${wy + wh} L${wx - 34},${wy + 120} C${wx - 30},${wy + 80} ${wx - 16},${wy + 66} ${wx},${wy + 64} C${wx + 16},${wy + 66} ${wx + 30},${wy + 80} ${wx + 34},${wy + 120} L${wx + 30},${wy + wh}Z" fill="#141016"/><circle cx="${wx}" cy="${wy + 46}" r="22" fill="#141016"/><path d="M${wx - 26},${wy + 40} C${wx - 26},${wy + 6} ${wx + 26},${wy + 6} ${wx + 26},${wy + 40}" fill="#1a1e38"/>`;
    L.push({ p: 0.78, svg: back + win });
    // the gatehouse (p 1): two round towers, battlements, the arch with the portcullis, torches, the road
    const gh = once('gtgh', () => {
      let g = '';
      for (const [x0, x1] of [[60, 330], [750, 1020]]) {
        const id = 'gtt' + x0;
        g += `<defs><linearGradient id="${id}" x1="0" x2="1"><stop offset="0" stop-color="#1a1a22"/><stop offset="0.35" stop-color="#4a4a58"/><stop offset="0.7" stop-color="#34343e"/><stop offset="1" stop-color="#18181e"/></linearGradient></defs>`;
        g += `<rect x="${x0}" y="260" width="${x1 - x0}" height="1500" fill="url(#${id})"/>` + `<g opacity="0.55">${ashlar(x0, 260, x1, 1760, x0 + 3, '#4a4a56', { bh: 70, bw: 90 })}</g>` + `<rect x="${x0}" y="260" width="${x1 - x0}" height="1500" fill="url(#${id})" opacity="0.55"/>`;
        for (let x = x0 - 20; x < x1 + 10; x += 70) g += `<rect x="${x}" y="190" width="44" height="80" fill="#2e2e38" ${olr(1.5)}/>`;
        g += `<rect x="${x0 - 30}" y="250" width="${x1 - x0 + 60}" height="30" fill="#24242e" ${olr(1.5)}/><rect x="${(x0 + x1) / 2 - 10}" y="600" width="20" height="110" fill="#08080c"/><rect x="${(x0 + x1) / 2 - 10}" y="1050" width="20" height="110" fill="#08080c"/>`;
      }
      // the wall over the arch with its merlons
      g += `<rect x="330" y="300" width="420" height="640" fill="#383844"/>` + `<g opacity="0.6">${ashlar(330, 300, 750, 940, 77, '#44444f', { bh: 70, bw: 120 })}</g>`;
      for (let x = 330; x < 750; x += 84) g += `<rect x="${x}" y="230" width="52" height="80" fill="#30303a" ${olr(1.5)}/>`;
      // the arch: voussoirs, the dark passage, the portcullis half raised, the road
      g += `<path d="${archD(330, 900, 420, 860)}" fill="#0a0a10"/>`;
      for (let k = 0; k <= 12; k++) { const a = Math.PI + k * Math.PI / 12, c = Math.cos(a), s2 = Math.sin(a); g += `<path d="M${f(540 + c * 210)},${f(1110 + s2 * 210)} L${f(540 + c * 262)},${f(1110 + s2 * 262)}" stroke="#20202a" stroke-width="8"/>`; }
      g += `<path d="M330,1110 A210,210 0 0 1 750,1110" fill="none" stroke="#5a5a68" stroke-width="10" opacity="0.6"/>`;
      let pc = ''; for (let x = 352; x < 740; x += 46) pc += `<path d="M${x},900 L${x},1330" stroke="#1e1c20" stroke-width="12"/><path d="M${x},1330 l-8,24 l16,0Z" fill="#1e1c20"/>`; for (let y = 930; y < 1330; y += 60) pc += `<path d="M335,${y} L745,${y}" stroke="#1e1c20" stroke-width="10"/>`;
      g += `<g clip-path="url(#gtarch)"><defs><clipPath id="gtarch"><path d="${archD(330, 900, 420, 860)}"/></clipPath></defs>${pc}</g>`;
      g += `<path d="M-600,1700 L1700,1700 L2400,2400 L-1300,2400Z" fill="#26242a"/>`;
      for (let y = 1720, k = 0; y < 2300; y += 30 + k * 6, k++) for (let x = -1300; x < 2400; x += 70 + k * 6) g += `<ellipse cx="${f(x + (k % 2) * 30)}" cy="${y}" rx="${f(26 + k * 3)}" ry="${f(9 + k)}" fill="#34323a" ${olr(1, 0.5)}/>`;
      return g;
    });
    let ghLive = gh;
    // torches on the towers either side of the arch (fire + light on the stone)
    for (const [x, y, sd] of [[300, 1000, 1], [780, 1000, 2]]) ghLive += `<path d="M${x},${y + 40} L${x},${y - 20}" stroke="#3a2a1a" stroke-width="14"/>` + S.flames(x, y - 20, 50, 110, t, 70 + sd, 1) + C.radial(x, y - 60, 380, '#ff9a40', 0.32, 'screen');
    // the pike with the head, crows on the merlons; o.head 0..1 (it can be absent), o.emptyPike (the spike waiting for you)
    const [pkx, pky, pks] = B.PIKE;
    if (o.head !== 0) ghLive += PR.headPike(pkx, pky, pks, t);
    if (o.emptyPike) ghLive += `<path d="M${pkx + 150},${pky} L${pkx + 150},${pky - 420 * pks} M${pkx + 150},${pky - 560 * pks} L${pkx + 142},${pky - 500 * pks} L${pkx + 158},${pky - 500 * pks}Z" stroke="#141216" stroke-width="${12 * pks}" fill="#2a2a30"/>`;
    for (const [x, y, s, d, ph] of [[410, 232, 0.9, 1, 0], [670, 232, 0.8, -1, 1], [150, 190, 0.85, 1, 2]]) ghLive += S.crow(x + Math.sin(t * 0.7 + ph) * 3, y, s, t, { dir: d });
    const fly = o.crowsFly ?? 0;
    for (let i = 0; i < 4; i++) { const u = ((t * 0.08 + i * 0.25) % 1), cx = lerp(-200, 1300, u) + Math.sin(i * 3) * 60, cy = -600 + i * 120 + Math.sin(u * 9 + i) * 40; ghLive += S.crow(cx, cy, 0.7, t + i, { fly: 1, ph: i, dir: 1 }); }
    L.push({ p: 1, svg: ghLive });
    // low mist across the road and a dark bare branch in the foreground
    L.push({ p: 1.12, svg: `<g filter="url(#b14)"><ellipse cx="${f(300 + Math.sin(t * 0.2) * 80)}" cy="1760" rx="700" ry="60" fill="#8a94b0" opacity="0.14"/><ellipse cx="${f(900 - Math.sin(t * 0.17) * 90)}" cy="1820" rx="600" ry="50" fill="#8a94b0" opacity="0.12"/></g>` });
    L.push({ p: 1.35, svg: `<g filter="url(#dof1)" stroke="#06060a" fill="none" stroke-linecap="round"><path d="M-260,-300 C-180,-200 -140,-60 -150,140" stroke-width="26"/><path d="M-190,-150 C-120,-170 -60,-220 -10,-300" stroke-width="12"/><path d="M-160,20 C-90,10 -40,-20 20,-80" stroke-width="10"/><path d="M-60,-185 C-30,-200 0,-196 30,-210" stroke-width="6"/><path d="M-40,-30 C-10,-30 20,-50 40,-40" stroke-width="5"/></g>` });
    return L;
  };

  // ======================================================= THE GREAT HALL, the night feast
  // world: wall base 1180; a huge blue fleur-de-lis hanging behind the high table (200-880); tall moonlit windows at the
  // sides; two wheel chandeliers; the high table (top 1340, cloth to 1640); checkered floor in front.
  S.HL = { FY: 1180, TABLE: [-140, 1220, 1340, 1640], KING: [540, 1690, 0.66], LADY: [760, 1700, 0.64], LORD: [140, 1690, 0.66], WAIT: [980, 1700, 0.64], YOU: [300, 2080, 0.86] };
  const lily = (x, y, s, col) => `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})" fill="${col}"><path d="M0,-40 C14,-24 14,-6 0,10 C-14,-6 -14,-24 0,-40Z"/><path d="M-4,4 C-26,-4 -40,-24 -30,-38 C-24,-20 -14,-8 -4,0Z"/><path d="M4,4 C26,-4 40,-24 30,-38 C24,-20 14,-8 4,0Z"/><rect x="-16" y="8" width="32" height="7"/><path d="M-4,15 L0,30 L4,15Z"/></g>`;
  S.hall = (t, o = {}) => {
    const B = S.HL, L = [];
    const wall = once('hlwall', () => {
      let g = ashlar(-700, -500, 1800, 1180, 41, '#5a5046', { bh: 74, bw: 170 });
      // the windows (moonlight), with stone tracery
      for (const x of [-330, 1170]) { g += `<path d="${archD(x, 120, 240, 820)}" fill="#1a2440"/>` + `<g clip-path="url(#hlw${x})"><defs><clipPath id="hlw${x}"><path d="${archD(x, 120, 240, 820)}"/></clipPath></defs>${stars(x, 120, x + 240, 940, 40, x + 900, 0)}</g>`;
        g += `<path d="${archD(x, 120, 240, 820)}" fill="none" stroke="#3a3228" stroke-width="20"/><path d="M${x + 120},120 L${x + 120},940 M${x},560 L${x + 240},560" stroke="#3a3228" stroke-width="12"/><path d="M${x},940 L${x + 240},940" stroke="#6a5e4e" stroke-width="20"/>`; }
      // the royal hanging: blue velvet sewn with gold lilies, a gold fringe, the crown
      g += `<rect x="190" y="80" width="700" height="980" fill="#1c2c6a" ${olr(2)}/>`;
      for (let y = 160, row = 0; y < 1020; y += 96, row++) for (let x = 240 + (row % 2) * 46; x < 870; x += 92) g += lily(x, y, 0.8, '#d8b040');
      g += `<rect x="190" y="1040" width="700" height="22" fill="#c9a040"/>` + Array.from({ length: 35 }, (_, i) => `<path d="M${200 + i * 20},1062 L${200 + i * 20},1092" stroke="#c9a040" stroke-width="5"/>`).join('');
      g += `<rect x="170" y="60" width="740" height="30" fill="#4a3018" ${olr(1.5)}/>` + S.crownEmblem(540, 40, 1.4);
      // the fringe of a gallery rail at the top
      g += `<rect x="-700" y="-60" width="2500" height="40" fill="#3a2414"/>` + Array.from({ length: 50 }, (_, i) => `<rect x="${-690 + i * 52}" y="-20" width="16" height="70" fill="#4a2e18"/>`).join('');
      return g;
    });
    let w = wall;
    for (const [x, y, sd] of [[60, 820, 1], [1020, 820, 2]]) w += sconce(x, y, 1.1, t, sd);
    L.push({ p: 0.74, svg: w + `<path d="M-330,940 L-90,940 L120,1300 L-500,1300Z" fill="#9ab0e0" opacity="0.06"/><path d="M1170,940 L1410,940 L1580,1300 L960,1300Z" fill="#9ab0e0" opacity="0.06"/>` });
    // chandeliers (p 0.88)
    L.push({ p: 0.88, svg: `<path d="M120,-400 L120,250 M960,-400 L960,250" stroke="#1a1612" stroke-width="5"/>` + PR.chandelier(120, 300, 1.15, t, 10) + PR.chandelier(960, 300, 1.15, t, 10) + C.radial(120, 280, 420, '#ffb860', 0.3, 'screen') + C.radial(960, 280, 420, '#ffb860', 0.3, 'screen') });
    // the floor (p 1): checkered stone in perspective
    // warm worn stone flags in perspective, a long red runner up to the high table
    L.push({ p: 1, svg: once('hlfloor', () => {
      let g = `<rect x="-900" y="${B.FY}" width="2900" height="1500" fill="#4a3e34" filter="url(#plaster)"/>`;
      for (let x = -2600; x <= 3600; x += 170) g += `<path d="M${f(540 + (x - 540) * 0.3)},${B.FY} L${x},2700" stroke="#2a221c" stroke-width="4"/>`;
      for (const y of [24, 56, 100, 160, 240, 350, 500, 700]) g += `<path d="M-900,${B.FY + y} L2000,${B.FY + y}" stroke="#2a221c" stroke-width="${f(2 + y / 160)}"/>`;
      return g + `<path d="M-200,1700 L1280,1700 L1500,2700 L-420,2700Z" fill="#5a1418" opacity="0.85"/><path d="M-160,1720 L1240,1720 L1450,2700 L-370,2700Z" fill="none" stroke="#c9a040" stroke-width="6"/>`;
    }) });
    return L;
  };
  // the high table (drawn by the shot in front of whoever sits behind it): cloth, gold plates, goblets, fruit, candles
  S.hallTable = (t, o = {}) => {
    const [x0, x1, top, bot] = S.HL.TABLE, r = rng(61);
    let g = `<path d="M${x0},${top} L${x1},${top} L${x1 + 30},${bot} L${x0 - 30},${bot}Z" fill="#ece6d8" ${olr(2)}/>`;
    for (let x = x0 + 40; x < x1; x += 70) g += `<path d="M${x},${top + 30} C${x - 6},${(top + bot) / 2} ${x + 4},${bot - 60} ${x - 8},${bot}" stroke="#b8b0a0" stroke-width="5" fill="none" opacity="0.6"/>`;
    g += `<rect x="${x0 - 40}" y="${top - 18}" width="${x1 - x0 + 80}" height="22" fill="#5a3a1e" ${olr(1.5)}/><path d="M${x0},${top + 60} L${x1},${top + 60}" stroke="#2a3a7a" stroke-width="26"/><path d="M${x0},${top + 60} L${x1},${top + 60}" stroke="#c9a040" stroke-width="4" stroke-dasharray="14 10"/>`;
    for (const x of [0, 200, 420, 660, 880, 1100]) g += `<ellipse cx="${x}" cy="${top - 14}" rx="50" ry="10" fill="#d8b040" ${olr(1)}/>`;
    for (const x of [100, 330, 760, 990]) g += PR.goblet(x, top - 14, 0.55, { wine: 0.7 });
    g += `<ellipse cx="560" cy="${top - 16}" rx="120" ry="18" fill="#c9a040" ${olr(1.4)}/>` + [[-60, -20, '#8a1a1a'], [-20, -34, '#6a8a2a'], [24, -26, '#a82a1a'], [60, -18, '#d8a030'], [0, -10, '#5a2a6a']].map(([dx, dy, c]) => `<circle cx="${560 + dx}" cy="${top - 16 + dy}" r="24" fill="${c}" ${olr(1)}/>`).join('');
    g += PR.candelabra(60, top - 16, 0.8, t, 5) + PR.candelabra(1040, top - 16, 0.8, t, 6) + C.radial(60, top - 120, 300, '#ffb860', 0.3, 'screen') + C.radial(1040, top - 120, 300, '#ffb860', 0.3, 'screen');
    return g;
  };
})(window);
