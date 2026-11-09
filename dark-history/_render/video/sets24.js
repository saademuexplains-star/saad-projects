// Sets for the Coca-Cola look test: Columbus, Georgia, the night of 16 April 1865 (you down in the grass by a broken
// gun wheel, the town burning across the river); Atlanta, 1885 (the pharmacist's back room by lamplight); Jacobs'
// Pharmacy, 1886 (the soda fountain). 2.5D layers, one light source per set, detail richest where the light falls.
// Also the props held in a grip (grip frame: origin at the grip slot, +x = thumb side, +y = fingers).
(function (G) {
  const S = G.SETS, PR = G.PROPS, { f, mix, rng, ol } = G.RIG, C = G.CINE, E = G.ENV;
  const lg = S.lg;
  const fl = (t, seed) => 0.86 + 0.08 * Math.sin(t * 9 + seed) + 0.06 * Math.sin(t * 23 + seed * 2);
  const TXT = (x, y, size, col, s, o = {}) => `<text x="${f(x)}" y="${f(y)}" font-family="${o.font || 'Georgia, Times New Roman, serif'}" font-size="${size}"${o.w ? ` font-weight="${o.w}"` : ''}${o.it ? ' font-style="italic"' : ''} fill="${col}" text-anchor="${o.a || 'middle'}"${o.ls != null ? ` letter-spacing="${o.ls}"` : ''}${o.len ? ` textLength="${o.len}" lengthAdjust="spacingAndGlyphs"` : ''}${o.op != null ? ` opacity="${o.op}"` : ''}>${s}</text>`;
  S.TXT = TXT;

  // ======================================================= props in the grip frame
  // the morphine bottle: brown glass, the neck toward the thumb; the paper label reads across the bottle when it is held
  // upright in a right fist with the back of the hand to camera (its text is turned 90 deg in the grip frame)
  PR.morphineG = () => {
    let g = `<defs><linearGradient id="mphG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1e0c04"/><stop offset="0.3" stop-color="#6a3410"/><stop offset="0.55" stop-color="#8a4a18"/><stop offset="1" stop-color="#2a1206"/></linearGradient></defs>`;
    g += `<path d="M-122,-38 Q-126,0 -122,38 L-6,40 Q14,38 20,16 L36,13 L36,-13 L20,-16 Q14,-38 -6,-40Z" fill="url(#mphG)" ${ol(1.4)}/>`;
    g += `<rect x="34" y="-16" width="9" height="32" rx="3" fill="#5a2a0c" ${ol(1.1)}/><path d="M43,-12 L60,-11 Q63,0 60,11 L43,12Z" fill="#a8845a" ${ol(1.1)}/><path d="M46,-9 L58,-8" stroke="#d8b888" stroke-width="2" opacity="0.7"/>`;
    g += `<path d="M-118,-30 L-10,-31" stroke="#f0c080" stroke-width="4" opacity="0.35" stroke-linecap="round"/><path d="M-116,-24 L-40,-25" stroke="#fff" stroke-width="2.5" opacity="0.5" stroke-linecap="round"/>`;
    g += `<rect x="-112" y="-34" width="74" height="68" rx="3" fill="#e8dcc0" ${ol(1.1)}/><rect x="-108" y="-30" width="66" height="60" fill="none" stroke="#5a1a10" stroke-width="1.6"/>`;
    g += `<g transform="translate(-75,0) rotate(90)">` + TXT(0, -5, 13.5, '#1a1008', 'MORPHINE', { w: 'bold', len: 54 }) + TXT(0, 9, 8, '#5a1a10', 'SULPHATE', { len: 40 }) + TXT(0, 21, 6.5, '#3a2a1a', 'POISON', { len: 26 }) + `</g>`;
    return g;
  };
  // a pestle: porcelain head (toward the little finger, down in the bowl), a turned wooden handle, a knob at the thumb
  // (the handle is long - the head 129 below the grip, not 83 - so the fist rides above the mortar's rim: lower, the
  // bowl's front wall cut across the wrist and the hand seemed sunk in the bowl. The user, 2026-11-09)
  PR.PESTLE_HEAD = 129;
  PR.pestleG = () => `<path d="M-108,-10 L54,-6.5 L54,6.5 L-108,10Z" fill="#6e4424" ${ol(1.2)}/><path d="M-104,-4.5 L52,-2.5" stroke="#b58552" stroke-width="2.6" opacity="0.55"/>` +
    `<circle cx="62" cy="0" r="11" fill="#5e3a1e" ${ol(1.2)}/><circle cx="58.5" cy="-3.5" r="3.6" fill="#c89a68" opacity="0.6"/>` +
    `<path d="M-106,-12 C-118,-22 -148,-21 -152,0 C-148,21 -118,22 -106,12Z" fill="#e9e3d6" ${ol(1.3)}/><path d="M-116,-12 C-130,-16 -143,-12 -146,-3" stroke="#fff" stroke-width="3.5" fill="none" opacity="0.75" stroke-linecap="round"/>` +
    `<path d="M-150,5 C-146,14 -132,18 -118,15" stroke="#3e4a22" stroke-width="5" fill="none" opacity="0.75" stroke-linecap="round"/>`;
  // a soda glass of the new drink: dark brown, red-brown where the light comes through, a head of foam toward the thumb
  PR.sodaGlassG = (o = {}) => {
    let g = `<defs><linearGradient id="sgG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a0a04"/><stop offset="0.35" stop-color="#5a2a0e"/><stop offset="0.62" stop-color="#7a3a14"/><stop offset="1" stop-color="#1a0a04"/></linearGradient></defs>`;
    g += `<path d="M-84,-29 L44,-34 L44,34 L-84,29Z" fill="url(#sgG)"/>`;
    g += `<path d="M42,-35 Q50,-30 54,-20 Q60,-10 56,0 Q61,12 54,22 Q50,32 42,35Z" fill="#d9c3a0"/><path d="M44,-34 L44,34" stroke="#b89a70" stroke-width="2" opacity="0.6"/>`;
    const r = rng(o.seed || 5); for (let i = 0; i < 16; i++) { const x = -70 + r() * 110, y = -24 + r() * 48, rr = 1.2 + r() * 2.2; g += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(rr)}" fill="none" stroke="#e8c090" stroke-width="0.9" opacity="${f(0.35 + r() * 0.4)}"/>`; }
    g += `<path d="M-98,-30 L62,-37 L62,37 L-98,30Z" fill="#e8f0f0" fill-opacity="0.14" ${ol(1.5)}/><rect x="-98" y="-30" width="14" height="60" fill="#e8f0f0" opacity="0.3"/><path d="M58,-37 L64,-37 L64,37 L58,37" fill="none" stroke="#f4f8f8" stroke-width="3" opacity="0.7"/>`;
    g += `<path d="M-92,-25 L56,-31" stroke="#fff" stroke-width="3.5" opacity="0.55" stroke-linecap="round"/><path d="M-90,22 L50,26" stroke="#fff" stroke-width="2" opacity="0.25"/>`;
    return g;
  };

  // ---------------- the same two, upright in the world (x = centre, y = base, h = height), for a detached hand drawn
  // over them: the label always reads level, the glass always stands straight
  S.MORPH_GRIP = 118 / 160;   // the grip slot (neck) above the base, as a fraction of the height
  S.morphineBottle = (x, y, h) => {
    const s = h / 160;
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><defs><linearGradient id="mphW" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2a1206"/><stop offset="0.3" stop-color="#7a3e14"/><stop offset="0.55" stop-color="#8a4a18"/><stop offset="1" stop-color="#1e0c04"/></linearGradient></defs>`;
    g += `<path d="M-38,0 Q-40,-3 -40,-8 L-40,-100 Q-38,-118 -14,-122 L-13,-138 L13,-138 L14,-122 Q38,-118 40,-100 L40,-8 Q40,-3 38,0Z" fill="url(#mphW)" ${ol(1.4)}/>`;
    g += `<rect x="-16" y="-144" width="32" height="9" rx="3" fill="#5a2a0c" ${ol(1.1)}/><path d="M-11,-144 L-10,-160 Q0,-163 10,-160 L11,-144Z" fill="#a8845a" ${ol(1.1)}/>`;
    g += `<path d="M-30,-10 L-30,-100" stroke="#fff" stroke-width="3" opacity="0.45" stroke-linecap="round"/><path d="M28,-12 L28,-96" stroke="#ffb060" stroke-width="4" opacity="0.4" stroke-linecap="round"/>`;
    g += `<rect x="-34" y="-92" width="68" height="70" rx="3" fill="#e8dcc0" ${ol(1.1)}/><rect x="-30" y="-88" width="60" height="62" fill="none" stroke="#5a1a10" stroke-width="1.5"/>`;
    g += TXT(0, -66, 12.5, '#1a1008', 'MORPHINE', { w: 'bold', len: 52 }) + TXT(0, -52, 7.5, '#5a1a10', 'SULPHATE', { len: 38 }) + `<path d="M-20,-46 L20,-46" stroke="#5a1a10" stroke-width="1"/>` + TXT(0, -35, 7, '#3a2a1a', 'POISON', { len: 30 });
    return g + `</g>`;
  };
  S.GLASS_GRIP = 70 / 160;
  S.sodaGlass = (x, y, h) => {
    const s = h / 160, r = rng(5);
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><defs><linearGradient id="sgW" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1a0a04"/><stop offset="0.35" stop-color="#5a2a0e"/><stop offset="0.62" stop-color="#7e3c14"/><stop offset="1" stop-color="#1a0a04"/></linearGradient></defs>`;
    g += `<path d="M-30,-14 L-36,-128 L36,-128 L30,-14Z" fill="url(#sgW)"/><path d="M-36,-128 Q-38,-138 -30,-146 Q-20,-154 -8,-150 Q0,-158 10,-151 Q22,-155 30,-146 Q38,-138 36,-128Z" fill="#dcc6a2"/><path d="M-30,-140 Q0,-148 30,-140" stroke="#fff4e0" stroke-width="3" fill="none" opacity="0.7"/>`;
    for (let i = 0; i < 18; i++) { const bx = -26 + r() * 52, by = -24 - r() * 100, rr = 1 + r() * 2; g += `<circle cx="${f(bx)}" cy="${f(by)}" r="${f(rr)}" fill="none" stroke="#e8c090" stroke-width="0.9" opacity="${f(0.35 + r() * 0.4)}"/>`; }
    g += `<path d="M-32,0 L-39,-160 L39,-160 L32,0Z" fill="#e8f0f0" fill-opacity="0.14" ${ol(1.5)}/><rect x="-32" y="-14" width="64" height="14" fill="#e8f0f0" opacity="0.3"/><path d="M-39,-160 L39,-160" stroke="#f4f8f8" stroke-width="3" opacity="0.8"/>`;
    g += `<path d="M-27,-8 L-32,-150" stroke="#fff" stroke-width="3.5" opacity="0.5" stroke-linecap="round"/><path d="M26,-10 L30,-120" stroke="#fff" stroke-width="2" opacity="0.3"/>`;
    return g + `</g>`;
  };

  // ======================================================= shared: apothecary bottles and jars (standing at x, y = base)
  // kinds: round (Boston round), tall (stoppered), square, jar (porcelain drug jar with a lid and a label cartouche)
  const bottle = (x, y, h, kind, col, r, op = 1) => {
    let g = '';
    if (kind === 'jar') {
      const w = h * 0.66;
      g += `<path d="M${f(x - w / 2)},${f(y)} L${f(x - w / 2)},${f(y - h * 0.72)} Q${f(x - w / 2)},${f(y - h * 0.84)} ${f(x - w * 0.3)},${f(y - h * 0.84)} L${f(x + w * 0.3)},${f(y - h * 0.84)} Q${f(x + w / 2)},${f(y - h * 0.84)} ${f(x + w / 2)},${f(y - h * 0.72)} L${f(x + w / 2)},${f(y)}Z" fill="${col}" ${ol(1.2)}/>`;
      g += `<path d="M${f(x - w * 0.34)},${f(y - h * 0.84)} Q${f(x)},${f(y - h * 1.02)} ${f(x + w * 0.34)},${f(y - h * 0.84)}Z" fill="${col}" ${ol(1.1)}/><circle cx="${f(x)}" cy="${f(y - h * 0.97)}" r="${f(w * 0.07)}" fill="${col}" ${ol(1)}/>`;
      g += `<ellipse cx="${f(x)}" cy="${f(y - h * 0.42)}" rx="${f(w * 0.32)}" ry="${f(h * 0.17)}" fill="#1a1410"/><ellipse cx="${f(x)}" cy="${f(y - h * 0.42)}" rx="${f(w * 0.27)}" ry="${f(h * 0.13)}" fill="#e8dcc0"/>`;
      g += `<path d="M${f(x - w * 0.16)},${f(y - h * 0.45)} l${f(w * 0.32)},0 M${f(x - w * 0.11)},${f(y - h * 0.38)} l${f(w * 0.22)},0" stroke="#2a1a10" stroke-width="${f(Math.max(1, h * 0.02))}"/>`;
      g += `<rect x="${f(x - w * 0.42)}" y="${f(y - h * 0.78)}" width="${f(w * 0.1)}" height="${f(h * 0.68)}" fill="#fff" opacity="0.35"/>`;
      return g;
    }
    const w = kind === 'tall' ? h * 0.3 : kind === 'square' ? h * 0.44 : h * 0.42, shY = kind === 'tall' ? 0.74 : 0.64, nw = w * (kind === 'tall' ? 0.42 : 0.32);
    const body = kind === 'square'
      ? `M${f(x - w / 2)},${f(y)} L${f(x - w / 2)},${f(y - h * shY)} L${f(x - nw / 2)},${f(y - h * (shY + 0.1))} L${f(x - nw / 2)},${f(y - h * 0.93)} L${f(x + nw / 2)},${f(y - h * 0.93)} L${f(x + nw / 2)},${f(y - h * (shY + 0.1))} L${f(x + w / 2)},${f(y - h * shY)} L${f(x + w / 2)},${f(y)}Z`
      : `M${f(x - w / 2)},${f(y)} L${f(x - w / 2)},${f(y - h * shY)} Q${f(x - w / 2)},${f(y - h * (shY + 0.14))} ${f(x - nw / 2)},${f(y - h * (shY + 0.16))} L${f(x - nw / 2)},${f(y - h * 0.93)} L${f(x + nw / 2)},${f(y - h * 0.93)} L${f(x + nw / 2)},${f(y - h * (shY + 0.16))} Q${f(x + w / 2)},${f(y - h * (shY + 0.14))} ${f(x + w / 2)},${f(y - h * shY)} L${f(x + w / 2)},${f(y)}Z`;
    g += `<path d="${body}" fill="${col}" opacity="${op}" ${ol(1.2)}/>`;
    g += `<rect x="${f(x - nw * 0.62)}" y="${f(y - h)}" width="${f(nw * 1.24)}" height="${f(h * 0.08)}" rx="2" fill="${kind === 'tall' ? col : '#6a4a2a'}" ${ol(1)}/>`;
    if (kind === 'tall') g += `<ellipse cx="${f(x)}" cy="${f(y - h * 1.04)}" rx="${f(nw * 0.6)}" ry="${f(h * 0.05)}" fill="${col}" ${ol(1)}/>`;
    if (r() < 0.8) { const lw = w * 0.74, lh = h * 0.26, ly = y - h * (0.3 + r() * 0.08); g += `<rect x="${f(x - lw / 2)}" y="${f(ly - lh / 2)}" width="${f(lw)}" height="${f(lh)}" fill="#e6dac0" opacity="0.92"/><rect x="${f(x - lw / 2 + 2)}" y="${f(ly - lh / 2 + 2)}" width="${f(lw - 4)}" height="${f(lh - 4)}" fill="none" stroke="#3a2a1a" stroke-width="0.8" opacity="0.7"/><path d="M${f(x - lw * 0.32)},${f(ly - lh * 0.1)} l${f(lw * 0.64)},0 M${f(x - lw * 0.22)},${f(ly + lh * 0.18)} l${f(lw * 0.44)},0" stroke="#2a1a10" stroke-width="${f(Math.max(0.8, h * 0.018))}"/>`; }
    g += `<path d="M${f(x - w * 0.32)},${f(y - h * 0.08)} L${f(x - w * 0.32)},${f(y - h * (shY - 0.02))}" stroke="#fff" stroke-width="${f(Math.max(1.5, w * 0.08))}" opacity="0.32" stroke-linecap="round"/>`;
    return g;
  };
  S.bottle = bottle;

  // ======================================================= THE BATTLEFIELD AT COLUMBUS, NIGHT
  S.BT = { HZ: 1188 };
  const soldierSil = (x, y, s, k, flip) => {
    const c = '#0b0705';
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(flip ? -s : s)},${f(s)})">`;
    g += `<path d="M-2,-160 C0,-170 18,-171 20,-160 L23,-151 L-4,-149Z" fill="${c}"/><path d="M-6,-151 L26,-151" stroke="${c}" stroke-width="4"/>`;
    g += `<ellipse cx="9" cy="-138" rx="11" ry="12.5" fill="${c}"/><path d="M-8,-126 C2,-130 22,-128 26,-118 L30,-74 L-2,-70 Z" fill="${c}"/>`;
    g += `<path d="M6,-74 L${f(-12 - 12 * k)},-38 L${f(-26 - 8 * k)},-2 M14,-74 L${f(24 + 10 * k)},-40 L${f(36 + 6 * k)},-4" stroke="${c}" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    g += `<path d="M2,-120 L-8,-96 L10,-84 M22,-118 L36,-98 L44,-116" stroke="${c}" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    g += `<path d="M-30,-70 L66,-150" stroke="${c}" stroke-width="5" stroke-linecap="round"/><path d="M60,-146 L76,-160" stroke="${c}" stroke-width="2.5"/>`;
    return g + `</g>`;
  };
  const cannonSil = (x, y, s) => `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})" fill="#0b0705"><path d="M-150,-78 L60,-118 L64,-96 L-146,-56Z"/><path d="M-20,-60 L-170,0 L-150,6 L-10,-44Z"/><circle cx="-10" cy="-50" r="52" fill="none" stroke="#0b0705" stroke-width="10"/>` +
    [0, 1, 2, 3, 4, 5].map(i => { const a = i * Math.PI / 3; return `<path d="M-10,-50 L${f(-10 + Math.cos(a) * 50)},${f(-50 + Math.sin(a) * 50)}" stroke="#0b0705" stroke-width="6"/>`; }).join('') + `</g>`;
  // the town across the river: roofs, chimneys, a church spire, a covered bridge; fires on the roofs and the glow of
  // them on the smoke; the river catching the fire
  const town = (t) => {
    const HZ = S.BT.HZ, r = rng(57);
    let g = C.radial(760, HZ - 40, 620, '#ff7a28', 0.55) + C.radial(170, HZ - 20, 430, '#ff8a30', 0.34) + C.radial(1180, HZ, 380, '#ff6a20', 0.3);
    for (const [x, s0] of [[760, 1.6], [180, 1.1], [1140, 0.9]]) for (let i = 0; i < 7; i++) {
      const u = i / 6, yy = HZ - 80 - u * 820, xx = x + u * u * 260 + Math.sin(t * 0.6 + i) * 6, rr = (70 + u * 210) * s0 * 0.7;
      g += `<ellipse cx="${f(xx)}" cy="${f(yy)}" rx="${f(rr * 1.2)}" ry="${f(rr * 0.8)}" fill="${mix('#7a3414', '#1e1410', Math.min(1, u * 1.3))}" opacity="${f(0.6 - u * 0.25)}" filter="url(#b14)"/>`;
    }
    let sk = `M-300,${HZ + 60} L-300,${HZ}`, x = -300;
    while (x < 1400) {
      const w = 60 + r() * 120, h = 40 + r() * 100, kind = r();
      if (x > 470 && x < 600) { sk += ` L${f(x)},${HZ - 120} L${f(x + 16)},${HZ - 120} L${f(x + 16)},${HZ - 250} L${f(x + 32)},${HZ - 410} L${f(x + 48)},${HZ - 250} L${f(x + 48)},${HZ - 120} L${f(x + 64)},${HZ - 120}`; x += 64; continue; }
      if (kind < 0.55) sk += ` L${f(x)},${f(HZ - h)} L${f(x + w / 2)},${f(HZ - h - w * 0.4)} L${f(x + w)},${f(HZ - h)}`;
      else sk += ` L${f(x)},${f(HZ - h)} L${f(x + w * 0.7)},${f(HZ - h)} L${f(x + w * 0.7)},${f(HZ - h - 30)} L${f(x + w * 0.8)},${f(HZ - h - 30)} L${f(x + w * 0.8)},${f(HZ - h)} L${f(x + w)},${f(HZ - h)}`;
      x += w;
    }
    g += `<path d="${sk} L1400,${HZ} L1400,${HZ + 60}Z" fill="#0d0806"/>`;
    for (let i = 0; i < 14; i++) { const wx = -250 + r() * 1600, wy = HZ - 20 - r() * 60; g += `<rect x="${f(wx)}" y="${f(wy)}" width="9" height="12" fill="#ffb050" opacity="${f(0.5 + r() * 0.4)}"/>`; }
    for (const [fx0, fy0, fs, sd] of [[730, HZ - 95, 1.25, 3], [800, HZ - 70, 0.95, 6], [160, HZ - 70, 0.9, 1], [1150, HZ - 60, 0.8, 4], [620, HZ - 60, 0.7, 2]]) g += E.fire(fx0, fy0, fs, sd + Math.floor(t * 12) % 4);
    g += `<rect x="-300" y="${HZ + 8}" width="1700" height="70" fill="#140a06"/>`;
    for (let i = 0; i < 26; i++) { const xx = 520 + (r() - 0.5) * 760, yy = HZ + 14 + r() * 56, w2 = 20 + r() * 70; g += `<path d="M${f(xx)},${f(yy)} l${f(w2)},0" stroke="#ff9a40" stroke-width="${f(2 + r() * 3)}" opacity="${f(0.25 + r() * 0.4)}"/>`; }
    g += `<path d="M-260,${HZ - 30} L230,${HZ - 30} L250,${HZ - 4} L-280,${HZ - 4}Z" fill="#0d0806"/>` + [-220, -60, 100].map(px => `<rect x="${px}" y="${HZ - 4}" width="22" height="60" fill="#0d0806"/>`).join('');
    return g;
  };
  // a gun carriage's broken wheel: wooden felloe, iron tyre, twelve spokes (two snapped), lit by the fire on the right
  const wheel = (x, y, R) => {
    let g = `<g transform="translate(${x},${y})">`;
    g += `<circle r="${R}" fill="none" stroke="#120a06" stroke-width="${f(R * 0.14)}"/><circle r="${R}" fill="none" stroke="#3a2414" stroke-width="${f(R * 0.1)}"/><circle r="${f(R * 1.06)}" fill="none" stroke="#0e0b0a" stroke-width="${f(R * 0.035)}"/>`;
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * Math.PI * 2 + 0.13, broke = i === 3 || i === 8, e = broke ? 0.45 : 0.95, c = Math.cos(a), s = Math.sin(a);
      g += `<path d="M${f(c * R * 0.12)},${f(s * R * 0.12)} L${f(c * R * e)},${f(s * R * e)}" stroke="#2e1c10" stroke-width="${f(R * 0.06)}" stroke-linecap="${broke ? 'butt' : 'round'}"/>`;
      g += `<path d="M${f(c * R * 0.14 + 4)},${f(s * R * 0.14)} L${f(c * R * e + 4)},${f(s * R * e)}" stroke="#c8682a" stroke-width="${f(R * 0.012)}" opacity="${f(0.15 + 0.45 * Math.max(0, c))}"/>`;
    }
    g += `<circle r="${f(R * 0.15)}" fill="#2a1a10" stroke="#0e0806" stroke-width="4"/><circle r="${f(R * 0.06)}" fill="#0e0b0a"/>`;
    g += `<path d="M${f(R * 1.06 * Math.cos(-0.9))},${f(R * 1.06 * Math.sin(-0.9))} A${f(R * 1.06)},${f(R * 1.06)} 0 0 1 ${f(R * 1.06 * Math.cos(0.9))},${f(R * 1.06 * Math.sin(0.9))}" stroke="#ff9a4a" stroke-width="4" fill="none" opacity="0.6"/>`;
    return g + `</g>`;
  };
  // your slouch hat, knocked off into the grass: black felt, a gold cord, the fire on its brim
  const hat = (x, y, s) => `<g transform="translate(${x},${y}) scale(${s}) rotate(-8)"><ellipse cx="0" cy="0" rx="150" ry="44" fill="#0e0c0b" stroke="#000" stroke-width="2"/><path d="M-80,-6 C-84,-90 84,-96 84,-8 Q0,10 -80,-6Z" fill="#161412" stroke="#000" stroke-width="2"/>` +
    `<path d="M-82,-18 Q0,-2 84,-20" stroke="#c8a040" stroke-width="7" fill="none"/><circle cx="70" cy="-16" r="8" fill="#c8a040"/><path d="M60,-70 C80,-60 86,-36 84,-12" stroke="#ff8a3a" stroke-width="4" fill="none" opacity="0.55"/><path d="M110,-20 A150,44 0 0 1 140,10" stroke="#ff8a3a" stroke-width="3" fill="none" opacity="0.5"/></g>`;
  // the cavalry sabre that cut you, dropped in the grass: brass guard, wire-bound grip, the curved blade, blood on it
  const sabre = (x0, y0, x1, y1) => {
    const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = -uy, ny = ux, mx = (x0 + x1) / 2 + nx * 34, my = (y0 + y1) / 2 + ny * 34;
    const blade = `M${f(x0)},${f(y0)} Q${f(mx)},${f(my)} ${f(x1)},${f(y1)}`;
    let g = `<path d="${blade}" stroke="#151516" stroke-width="22" fill="none" stroke-linecap="round"/><path d="${blade}" stroke="#7c7f84" stroke-width="15" fill="none" stroke-linecap="round"/>`;
    g += `<path d="M${f(x0 + nx * 4)},${f(y0 + ny * 4)} Q${f(mx + nx * 4)},${f(my + ny * 4)} ${f(x1)},${f(y1)}" stroke="#ffd2a2" stroke-width="2.6" fill="none" opacity="0.85"/>`;
    g += `<path d="M${f(x0 + ux * L * 0.62)},${f(y0 + uy * L * 0.62 + 3)} Q${f(x0 + ux * L * 0.8)},${f(y0 + uy * L * 0.8 + 10)} ${f(x1)},${f(y1)}" stroke="#5a0a06" stroke-width="10" fill="none" stroke-linecap="round" opacity="0.85"/>`;
    const gx = x0 - ux * 10, gy = y0 - uy * 10, hx = x0 - ux * 120, hy = y0 - uy * 120;
    g += `<path d="M${f(gx)},${f(gy)} L${f(hx)},${f(hy)}" stroke="#1a120c" stroke-width="22" stroke-linecap="round"/>`;
    for (let i = 1; i < 9; i++) { const k = i / 9, px = gx + (hx - gx) * k, py = gy + (hy - gy) * k; g += `<path d="M${f(px + nx * 10)},${f(py + ny * 10)} L${f(px - nx * 10 + ux * 5)},${f(py - ny * 10 + uy * 5)}" stroke="#8a7a60" stroke-width="2" opacity="0.7"/>`; }
    g += `<path d="M${f(gx + nx * 26)},${f(gy + ny * 26)} Q${f(gx - ux * 60 + nx * 70)},${f(gy - uy * 60 + ny * 70)} ${f(hx + nx * 8)},${f(hy + ny * 8)}" stroke="#b8862e" stroke-width="7" fill="none"/><ellipse cx="${f(gx)}" cy="${f(gy)}" rx="30" ry="12" transform="rotate(${f(Math.atan2(uy, ux) * 180 / Math.PI + 90)} ${f(gx)} ${f(gy)})" fill="#c8963a" ${ol(1.4)}/><circle cx="${f(hx)}" cy="${f(hy)}" r="12" fill="#c8963a" ${ol(1.2)}/>`;
    return g;
  };
  S.battle = (t) => {
    const HZ = S.BT.HZ, L = [], rs = rng(31);
    // the sky: smoke over the burning town, its underside lit orange; sparks carried up by the heat
    let sky = lg('btSky', [[0, '#090607'], [0.28, '#140b09'], [0.45, '#33160b'], [0.55, '#7a3412'], [0.6, '#a24c1a'], [0.66, '#4a1e0c'], [1, '#100806']]) + `<rect x="-900" y="-600" width="2900" height="3000" fill="url(#btSky)"/>`;
    for (let i = 0; i < 16; i++) {
      const x = -300 + rs() * 1700, y = 80 + rs() * 900, rx = 240 + rs() * 360, ry = 110 + rs() * 150, k = Math.max(0, Math.min(1, (y - 150) / 850));
      sky += `<ellipse cx="${f(x + t * 8)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" fill="${mix('#171010', '#4a2010', k)}" opacity="${f(0.5 + rs() * 0.35)}" filter="url(#b14)"/>`;
      if (k > 0.45) sky += `<ellipse cx="${f(x + t * 8)}" cy="${f(y + ry * 0.55)}" rx="${f(rx * 0.7)}" ry="${f(ry * 0.3)}" fill="#c8561c" opacity="${f(0.12 + 0.2 * k)}" filter="url(#b14)"/>`;
    }
    for (let i = 0; i < 22; i++) { const x = 300 + rs() * 900, y = 300 + rs() * 800; sky += `<circle cx="${f(x)}" cy="${f(y - t * 40)}" r="${f(1.2 + rs() * 1.8)}" fill="#ffc070" opacity="${f(0.4 + rs() * 0.5)}"/>`; }
    // billows of smoke with structure, darker high up, their undersides lit by the fires below
    const billow = (cx, cy, R2, seed, lt) => { const r2 = rng(seed); let s2 = ''; for (let i = 0; i < 9; i++) { const x = cx + (r2() - 0.5) * R2 * 1.7, y = cy + (r2() - 0.5) * R2 * 0.55, rr = R2 * (0.32 + r2() * 0.34); s2 += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(rr)}" fill="${mix('#24160f', '#6a3214', lt)}" opacity="0.9"/><circle cx="${f(x + rr * 0.1)}" cy="${f(y + rr * 0.45)}" r="${f(rr * 0.7)}" fill="#d8682a" opacity="${f(0.12 + 0.3 * lt)}"/><circle cx="${f(x - rr * 0.2)}" cy="${f(y - rr * 0.3)}" r="${f(rr * 0.5)}" fill="#0e0807" opacity="${f(0.35 * (1 - lt))}"/>`; } return `<g filter="url(#b8)">${s2}</g>`; };
    for (const [cx, cy, R2, sd, lt] of [[120, 240, 260, 1, 0.3], [700, 170, 300, 2, 0.25], [1000, 480, 260, 3, 0.5], [320, 560, 300, 4, 0.55], [860, 780, 300, 5, 0.8], [60, 860, 260, 6, 0.75], [560, 900, 280, 7, 0.95], [1080, 1000, 240, 8, 0.9]]) sky += billow(cx + t * 6, cy, R2, sd + 40, lt);
    L.push({ p: 0.25, svg: sky });
    L.push({ p: 0.45, svg: `<g filter="url(#dof2)">${town(t)}</g>` });
    // the ridge between: men running against the glow, a gun, smoke drifting across
    let mid = `<path d="M-300,${HZ + 70} C0,${HZ + 50} 300,${HZ + 90} 600,${HZ + 64} C900,${HZ + 40} 1200,${HZ + 80} 1500,${HZ + 60} L1500,2000 L-300,2000Z" fill="#0e0806"/>`;
    for (const [x, s, k, fl2] of [[600, 0.95, 0.6, false], [-20, 0.9, -0.4, false], [96, 0.82, 0.9, false], [1060, 0.88, -0.7, true], [690, 0.78, 0.3, false]]) mid += soldierSil(x, HZ + 72, s, k, fl2);
    mid += cannonSil(980, HZ + 76, 0.75);
    for (let i = 0; i < 6; i++) { const x = -100 + i * 260 + t * 12, y = HZ + 20 + (i % 2) * 40; mid += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="230" ry="60" fill="#3a2418" opacity="0.35" filter="url(#b14)"/>`; }
    L.push({ p: 0.7, svg: `<g filter="url(#dof1)">${mid}</g>` });
    // the ground where you fell: trampled earth and grass raked by the firelight, the broken wheel at your back
    let gr = lg('btGr', [[0, '#24130a'], [0.35, '#160c07'], [1, '#090504']]) + `<path d="M-400,1340 C100,1320 600,1336 1500,1306 L1500,2300 L-400,2300Z" fill="url(#btGr)"/>`;
    gr += C.radial(1150, 1520, 700, '#ff7a2a', 0.18);
    const rg = rng(41);
    for (let i = 0; i < 130; i++) {
      const x = -100 + rg() * 1300, y = 1340 + rg() * 600, l = 14 + rg() * 30 * (0.5 + (y - 1340) / 600), a = -Math.PI / 2 + (rg() - 0.5) * 0.9, lt = x > 600 ? 0.55 : 0.18;
      gr += `<path d="M${f(x)},${f(y)} q${f(Math.cos(a) * l * 0.3)},${f(Math.sin(a) * l * 0.6)} ${f(Math.cos(a) * l)},${f(Math.sin(a) * l)}" stroke="${mix('#2a2010', '#a8602a', lt * rg())}" stroke-width="${f(1.5 + rg() * 2)}" fill="none" opacity="0.8"/>`;
    }
    gr += wheel(300, 1235, 330);
    L.push({ p: 1, svg: gr });
    return L;
  };
  // in front of you: the hat and the sabre in the grass (drawn after the characters)
  S.battleFront = (t) => hat(150, 1790, 1.0) + sabre(470, 1880, 1010, 1745);
  // the firelight on everything, embers and smoke drifting past the lens
  S.battleLight = (t) => {
    const r = rng(77);
    let g = C.radial(1250, 1150, 1000, '#ff7a2a', 0.2);
    for (let i = 0; i < 26; i++) { const x = r() * 1080, y = 200 + r() * 1700 - t * 60, rr = 1.5 + r() * 2.5; g += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(rr)}" fill="#ffb860" opacity="${f(0.35 + r() * 0.5)}"/><circle cx="${f(x)}" cy="${f(y)}" r="${f(rr * 4)}" fill="#ff8a30" opacity="0.12" filter="url(#b4)"/>`; }
    return g;
  };
  S.battleFg = (t) => {
    const r = rng(83);
    let g = '';
    // (the blades stand at the two sides only: across the middle, blurred dark streaks lay over the hands hanging there
    // and read as dirt on them)
    for (let i = 0; i < 26; i++) { const u = r(), x = u < 0.5 ? -80 + u * 2 * 250 : 910 + (u - 0.5) * 2 * 250, y = 1850 + r() * 120, h = 90 + r() * 160, a = (r() - 0.5) * 0.5; g += `<path d="M${f(x)},${f(y)} q${f(Math.sin(a) * h * 0.5)},${f(-h * 0.6)} ${f(Math.sin(a) * h)},${f(-h)}" stroke="#0a0604" stroke-width="${f(6 + r() * 8)}" fill="none" stroke-linecap="round"/>`; }
    g += `<ellipse cx="200" cy="1880" rx="420" ry="110" fill="#2a1a12" opacity="0.5" filter="url(#b14)"/><ellipse cx="980" cy="1900" rx="360" ry="90" fill="#2a1a12" opacity="0.4" filter="url(#b14)"/>`;
    return `<g filter="url(#dof2)">${g}</g>`;
  };

  // ======================================================= THE BACK ROOM, ATLANTA, 1885 (lamplight)
  // world: the bench's far edge at y 1330 (you are cut off behind it), its near edge at 1520; the lamp on the bench at
  // the left; shelves of bottles behind, a window onto the wet night street, the calendar for 1885
  // (MORTAR x 620: right of his middle, so the grinding forearm comes across his belly from an elbow at his side - under
  // his shoulder the solver swung the elbow out and a gap opened between the arm and the body, the arm read as see-through)
  S.BR = { TOP: 1330, NEAR: 1520, LAMP: [176, 1456], MORTAR: [620, 1350] };
  const nightWindow = (x0, y0, x1, y1, t) => {
    const w = x1 - x0, h = y1 - y0, r = rng(13);
    let g = `<rect x="${x0 - 30}" y="${y0 - 30}" width="${w + 60}" height="${h + 60}" fill="#1a1008" ${ol(1.4)}/>`;
    g += `<defs><clipPath id="brWin"><rect x="${x0}" y="${y0}" width="${w}" height="${h}"/></clipPath></defs><g clip-path="url(#brWin)">`;
    g += lg('brNight', [[0, '#0c0b0c'], [0.6, '#1a1612'], [1, '#2a2018']]) + `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="url(#brNight)"/>`;
    g += `<rect x="${x0 + w * 0.45}" y="${y0 + h * 0.15}" width="${w * 0.7}" height="${h}" fill="#151110"/>` + [[0.55, 0.3], [0.75, 0.3], [0.55, 0.55], [0.75, 0.55]].map(([a, b], i) => `<rect x="${f(x0 + w * a)}" y="${f(y0 + h * b)}" width="${f(w * 0.12)}" height="${f(h * 0.13)}" fill="${i === 2 ? '#e8a050' : '#2a221a'}" opacity="${i === 2 ? 0.8 : 1}"/>`).join('');
    const lx = x0 + w * 0.25, ly = y0 + h * 0.42;
    g += `<path d="M${f(lx)},${f(ly + 20)} L${f(lx)},${f(y1)}" stroke="#0a0806" stroke-width="7"/><path d="M${f(lx - 16)},${f(ly - 14)} L${f(lx + 16)},${f(ly - 14)} L${f(lx + 10)},${f(ly + 20)} L${f(lx - 10)},${f(ly + 20)}Z" fill="#ffd890" stroke="#0a0806" stroke-width="3"/>` + C.radial(lx, ly, 150, '#ffb860', 0.55);
    for (let i = 0; i < 40; i++) { const rx2 = x0 + r() * w, ry2 = y0 + ((r() * h + t * 900) % h); g += `<path d="M${f(rx2)},${f(ry2)} l-3,22" stroke="#c8b8a0" stroke-width="1.2" opacity="${f(0.15 + r() * 0.25)}"/>`; }
    g += `</g>`;
    g += `<path d="M${x0 + w / 2},${y0} L${x0 + w / 2},${y1} M${x0},${y0 + h / 2} L${x1},${y0 + h / 2}" stroke="#1a1008" stroke-width="12"/>`;
    for (let i = 0; i < 8; i++) { const dx2 = x0 + 20 + r() * (w - 40), dy2 = y0 + 20 + r() * (h - 40); g += `<path d="M${f(dx2)},${f(dy2)} q2,10 0,${f(16 + r() * 22)}" stroke="#d8c8b0" stroke-width="3" fill="none" opacity="0.22"/>`; }
    g += `<path d="M${x0 + 10},${y0 + 10} L${x0 + w * 0.3},${y0 + 10} L${x0 + 10},${y0 + h * 0.4}Z" fill="#fff" opacity="0.05"/>`;
    return g;
  };
  S.backroom = (t) => {
    const L = [], [lx, ly] = S.BR.LAMP, k = fl(t, 3), r = rng(101);
    let w = `<rect x="-900" y="-500" width="2900" height="2600" fill="#24170e" filter="url(#woodV)"/>`;
    w += nightWindow(40, 150, 320, 620, t);
    // the calendar for 1885 on a nail under the window, a framed diploma above the bench
    w += `<path d="M180,700 L180,690" stroke="#2a1a0e" stroke-width="4"/><rect x="110" y="700" width="140" height="190" fill="#e2d6bc" ${ol(1.3)}/><rect x="110" y="700" width="140" height="44" fill="#7a2a1a"/>` + TXT(180, 732, 26, '#f0e4c8', '1885', { w: 'bold' }) + TXT(180, 768, 13, '#3a2a1a', 'MAY', { w: 'bold', ls: 2 });
    for (let i = 0; i < 5; i++) for (let j = 0; j < 7; j++) w += `<rect x="${118 + j * 18.5}" y="${778 + i * 21}" width="15" height="17" fill="none" stroke="#8a7a60" stroke-width="0.8"/>`;
    w += `<path d="M140,795 l8,10 M160,836 l8,10" stroke="#9a1a12" stroke-width="2"/>`;
    // shelves floor to ceiling: rows of bottles, jars and drug pots, labels; the lowest row of small drawers
    const rows = [300, 520, 740, 960, 1180], X0 = 380, X1 = 1320, cols = ['#5a3410', '#3a2208', '#2e4a2a', '#4a4a22', '#6a4a1a', '#7a2a14', '#1e3434'];
    for (const y of rows) {
      w += `<rect x="${X0 - 20}" y="${y}" width="${X1 - X0 + 40}" height="22" fill="#3a2414" ${ol(1.2)}/><rect x="${X0 - 20}" y="${y}" width="${X1 - X0 + 40}" height="4" fill="#c8945a" opacity="0.25"/><rect x="${X0 - 20}" y="${y + 22}" width="${X1 - X0 + 40}" height="26" fill="#000" opacity="0.35" filter="url(#b4)"/>`;
      if (y === 1180) continue;
      let x = X0;
      while (x < X1 - 30) {
        const kind = ['round', 'round', 'tall', 'square', 'jar'][Math.floor(r() * 5)], h = kind === 'jar' ? 120 + r() * 50 : 110 + r() * 80, wd = kind === 'jar' ? h * 0.66 : kind === 'tall' ? h * 0.3 : h * 0.44;
        const col = kind === 'jar' ? (r() < 0.5 ? '#e4dccb' : '#d8ccb0') : cols[Math.floor(r() * cols.length)];
        w += bottle(x + wd / 2, y, h, kind, col, r, kind === 'jar' ? 1 : 0.92);
        x += wd + 6 + r() * 16;
      }
    }
    for (let i = 0; i < 9; i++) for (let j = 0; j < 2; j++) { const dx = X0 + i * 104, dy = 1196 + j * 64; w += `<rect x="${dx}" y="${dy}" width="98" height="58" fill="#3e2616" ${ol(1)}/><rect x="${dx + 30}" y="${dy + 10}" width="38" height="16" fill="#c8a050" opacity="0.8"/><rect x="${dx + 33}" y="${dy + 13}" width="32" height="10" fill="#e8dcc0"/><circle cx="${dx + 49}" cy="${dy + 40}" r="5" fill="#c8963a"/>`; }
    // the dried coca: a sack slumped on the end of the shelf
    w += `<path d="M1090,960 C1080,860 1100,800 1150,790 L1250,792 C1300,800 1310,880 1300,960Z" fill="#8a7450" ${ol(1.3)}/><path d="M1150,790 C1170,770 1230,772 1250,792" stroke="#5a4a30" stroke-width="5" fill="none"/>` + TXT(1196, 880, 22, '#3a2a14', 'COCA', { w: 'bold', ls: 3, op: 0.85 }) + TXT(1196, 906, 12, '#3a2a14', 'BOLIVIA', { ls: 2, op: 0.8 });
    for (let i = 0; i < 7; i++) w += `<ellipse cx="${1110 + r() * 170}" cy="${790 + r() * 12}" rx="14" ry="6" fill="#4a5a26" transform="rotate(${f((r() - 0.5) * 80)} ${1110 + i * 24} 792)"/>`;
    // the lamp's light on the wall, and the dark the room falls into away from it
    w += C.radial(lx + 60, ly - 260, 980, '#ffb460', 0.32 * k);
    w += lg('brFall', [[0, '#000', 0], [0.45, '#000', 0.25], [1, '#000', 0.78]], 0, 0, 1, 0) + `<rect x="-900" y="-500" width="2900" height="2600" fill="url(#brFall)"/>`;
    w += lg('brTop', [[0, '#000', 0.55], [0.35, '#000', 0], [1, '#000', 0]]) + `<rect x="-900" y="-500" width="2900" height="2600" fill="url(#brTop)"/>`;
    L.push({ p: 0.75, svg: `<g filter="url(#dof1)">${w}</g>` });
    return L;
  };
  // the bench: its worn oak top, the front with drawers, and everything on it behind your hands
  S.bench = (t) => {
    const { TOP, NEAR, LAMP: [lx, ly] } = S.BR, k = fl(t, 3), r = rng(131);
    let g = `<path d="M-200,${TOP} L1280,${TOP} L1320,${NEAR} L-240,${NEAR}Z" fill="#4a2c16" filter="url(#woodH)"/>`;
    for (let i = 1; i < 6; i++) { const y = TOP + (NEAR - TOP) * (i / 6) ** 1.15; g += `<path d="M-240,${f(y)} L1320,${f(y)}" stroke="#1e1006" stroke-width="2" opacity="0.5"/>`; }
    for (let i = 0; i < 9; i++) { const x = r() * 1100, y = TOP + 20 + r() * 160; g += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(22 + r() * 30)}" ry="${f(6 + r() * 6)}" fill="none" stroke="#1a0c04" stroke-width="${f(2 + r() * 3)}" opacity="0.35"/>`; }
    for (let i = 0; i < 18; i++) { const x = r() * 1100, y = TOP + 10 + r() * 180; g += `<path d="M${f(x)},${f(y)} l${f(20 + r() * 50)},${f((r() - 0.5) * 6)}" stroke="#a87a4a" stroke-width="1.2" opacity="0.3"/>`; }
    g += C.radial(lx + 40, ly - 30, 640, '#ffb050', 0.34 * k);
    g += `<rect x="-240" y="${NEAR}" width="1560" height="30" fill="#5a3a1e" ${ol(1.4)}/><rect x="-240" y="${NEAR}" width="1560" height="5" fill="#e8b878" opacity="0.35"/>`;
    g += `<rect x="-240" y="${NEAR + 30}" width="1560" height="500" fill="#2e1a0c" filter="url(#woodV)"/>`;
    for (let i = 0; i < 4; i++) { const dx = -20 + i * 290; g += `<rect x="${dx}" y="${NEAR + 60}" width="250" height="150" fill="#3a2212" ${ol(1.3)}/><rect x="${dx + 100}" y="${NEAR + 120}" width="50" height="14" rx="6" fill="#b8863a" ${ol(1)}/>`; }
    g += lg('bnFr', [[0, '#000', 0.1], [1, '#000', 0.75]]) + `<rect x="-240" y="${NEAR + 30}" width="1560" height="500" fill="url(#bnFr)"/>`;
    // the coca leaves on a sheet of brown paper, some fresh green, some dried
    g += `<path d="M740,1380 L1010,1372 L1050,1478 L760,1490Z" fill="#9a7a50" ${ol(1.2)}/>`;
    for (let i = 0; i < 34; i++) { const x = 790 + r() * 220, y = 1392 + r() * 80, a = r() * 180, s = 0.8 + r() * 0.5, c = r() < 0.7 ? mix('#3e5420', '#6a7a32', r()) : '#6a5a2a'; g += `<g transform="translate(${f(x)},${f(y)}) rotate(${f(a)}) scale(${f(s)},${f(s * 0.62)})"><ellipse rx="22" ry="11" fill="${c}" stroke="#1a2008" stroke-width="1"/><path d="M-20,0 L20,0" stroke="#a8b870" stroke-width="1.2" opacity="0.6"/></g>`; }
    // the kola nuts in a wooden bowl, one split open
    g += `<ellipse cx="330" cy="1488" rx="92" ry="26" fill="#5a3418" ${ol(1.3)}/><path d="M238,1488 Q250,1530 330,1532 Q410,1530 422,1488" fill="#4a2a12" ${ol(1.3)}/>`;
    for (const [x, y, c] of [[290, 1478, '#8a3e22'], [330, 1470, '#a85a32'], [372, 1480, '#7a3418'], [310, 1458, '#9a4e2a'], [352, 1456, '#8a4024']]) g += `<path d="M${x - 20},${y} C${x - 22},${y - 22} ${x - 2},${y - 26} ${x},${y - 14} C${x + 2},${y - 26} ${x + 22},${y - 22} ${x + 20},${y} C${x + 18},${y + 14} ${x - 18},${y + 14} ${x - 20},${y}Z" fill="${c}" ${ol(1)}/><path d="M${x - 10},${y - 14} q4,-4 8,-2" stroke="#e8b080" stroke-width="2" fill="none" opacity="0.6"/>`;
    g += `<g transform="translate(420,1500) rotate(-14)"><ellipse rx="22" ry="14" fill="#7a3418" ${ol(1)}/><ellipse rx="15" ry="9" fill="#e8b8a0"/><path d="M-10,0 L10,0" stroke="#c88a70" stroke-width="1.4"/></g>`;
    // your secret, in the light by the lamp: a small bottle of morphine and a teaspoon
    g += bottle(290, 1408, 118, 'round', '#5a2c0e', rng(5), 0.95);
    g += `<rect x="262" y="1350" width="56" height="34" fill="#e8dcc0"/><rect x="265" y="1353" width="50" height="28" fill="none" stroke="#5a1a10" stroke-width="1"/>` + TXT(290, 1366, 9.5, '#1a1008', 'MORPHINE', { w: 'bold', len: 44 }) + TXT(290, 1377, 6, '#5a1a10', 'SULPH.', { len: 22 });
    g += `<path d="M330,1418 L404,1404" stroke="#a8a8a4" stroke-width="5" stroke-linecap="round"/><ellipse cx="318" cy="1420" rx="15" ry="8" transform="rotate(-10 318 1420)" fill="#c8c8c2" ${ol(1)}/><path d="M334,1416 L400,1404" stroke="#fff" stroke-width="1.5" opacity="0.7"/>`;
    // a flask and a measuring glass of the brown tincture, catching the lamp
    g += `<path d="M960,1424 L1000,1310 L1000,1262 L1028,1262 L1028,1310 L1068,1424Z" fill="#e8f0ec" fill-opacity="0.16" ${ol(1.3)}/><path d="M968,1424 L986,1372 L1042,1372 L1060,1424Z" fill="#5a2a0e" opacity="0.85"/><path d="M1006,1270 L1006,1400" stroke="#fff" stroke-width="3" opacity="0.4"/>`;
    g += `<rect x="1090" y="1260" width="44" height="172" rx="4" fill="#e8f0ec" fill-opacity="0.14" ${ol(1.3)}/><rect x="1092" y="1330" width="40" height="100" fill="#6a3010" opacity="0.8"/>` + [0, 1, 2, 3, 4, 5].map(i => `<path d="M1092,${1290 + i * 22} l12,0" stroke="#d8d0c0" stroke-width="1.2" opacity="0.7"/>`).join('');
    // the open notebook with the formula you keep changing
    g += `<g transform="translate(830,1508) rotate(-4)"><path d="M-150,-58 L150,-58 L162,8 L-162,8Z" fill="#e4d8bc" ${ol(1.3)}/><path d="M0,-58 L0,8" stroke="#8a7a60" stroke-width="2"/>`;
    for (let i = 0; i < 4; i++) g += `<path d="M${-140},${-44 + i * 13} q30,-4 60,0 t60,0" stroke="#3a2a1a" stroke-width="1.6" fill="none" opacity="0.75"/><path d="M${16},${-44 + i * 13} q30,-4 60,0 t50,0" stroke="#3a2a1a" stroke-width="1.6" fill="none" opacity="0.75"/>`;
    g += `<path d="M-60,-30 l80,-2" stroke="#7a1a12" stroke-width="2.2"/></g>`;
    // the oil lamp: brass foot, the glass font of oil, the burner, the tall chimney with the flame
    g += S.lamp(lx, ly, t);
    // the mortar's inside and its back rim (its front is drawn over the pestle by S.mortarFront)
    const [mx, my] = S.BR.MORTAR;
    g += `<ellipse cx="${mx}" cy="${my}" rx="140" ry="34" fill="#d8d2c4" ${ol(1.5)}/><ellipse cx="${mx}" cy="${my + 4}" rx="124" ry="27" fill="#5a5446"/><ellipse cx="${mx + 6}" cy="${my + 14}" rx="88" ry="15" fill="#3e4a1c"/><ellipse cx="${mx - 10}" cy="${my + 11}" rx="40" ry="6" fill="#6a7a32" opacity="0.7"/>`;
    return g;
  };
  S.mortarFront = () => {
    const [mx, my] = S.BR.MORTAR;
    return `<defs><linearGradient id="mtF" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fbf6ec"/><stop offset="0.35" stop-color="#e6dfd0"/><stop offset="1" stop-color="#7a7468"/></linearGradient></defs>` +
      `<path d="M${mx - 140},${my} A140,34 0 0 0 ${mx + 140},${my} C${mx + 136},${my + 70} ${mx + 96},${my + 100} ${mx + 70},${my + 108} L${mx - 70},${my + 108} C${mx - 96},${my + 100} ${mx - 136},${my + 70} ${mx - 140},${my}Z" fill="url(#mtF)" ${ol(1.6)}/>` +
      `<path d="M${mx - 84},${my + 104} L${mx + 84},${my + 104} L${mx + 96},${my + 122} L${mx - 96},${my + 122}Z" fill="#d8d0c0" ${ol(1.4)}/><ellipse cx="${mx}" cy="${my + 124}" rx="110" ry="10" fill="#000" opacity="0.4" filter="url(#b4)"/>` +
      `<path d="M${mx - 126},${my + 12} C${mx - 120},${my + 52} ${mx - 96},${my + 82} ${mx - 70},${my + 94}" stroke="#fff" stroke-width="7" fill="none" opacity="0.6" stroke-linecap="round"/><path d="M${mx - 140},${my} A140,34 0 0 0 ${mx + 140},${my}" stroke="#fff" stroke-width="3" fill="none" opacity="0.5"/>`;
  };
  // the pestle in the world: H = the centre of its porcelain head, u = the direction up the handle, len = to the knob
  S.pestle = (H, u, len) => {
    const nx = -u[1], ny = u[0], P = (k, w) => `${f(H[0] + u[0] * k + nx * w)},${f(H[1] + u[1] * k + ny * w)}`, ang = Math.atan2(u[1], u[0]) * 180 / Math.PI, K2 = [H[0] + u[0] * (len - 6), H[1] + u[1] * (len - 6)];
    let g = `<path d="M${P(20, 10)} L${P(len - 16, 8)} L${P(len - 16, -8)} L${P(20, -10)}Z" fill="#6e4424" ${ol(1.2)}/><path d="M${P(24, -5)} L${P(len - 18, -4)}" stroke="#c08a58" stroke-width="3" opacity="0.6"/>`;
    g += `<circle cx="${f(K2[0])}" cy="${f(K2[1])}" r="13" fill="#5e3a1e" ${ol(1.2)}/><circle cx="${f(K2[0] - 4)}" cy="${f(K2[1] - 4)}" r="4" fill="#d8a878" opacity="0.6"/>`;
    g += `<ellipse cx="${f(H[0])}" cy="${f(H[1])}" rx="26" ry="21" transform="rotate(${f(ang)} ${f(H[0])} ${f(H[1])})" fill="#ece6da" ${ol(1.3)}/><path d="M${P(-20, 16)} Q${P(-28, 0)} ${P(-18, -14)}" stroke="#3e4a22" stroke-width="7" fill="none" opacity="0.8" stroke-linecap="round"/>`;
    return g;
  };
  // the oil lamp (x, y = the foot on the bench)
  S.lamp = (x, y, t) => {
    const k = fl(t, 11);
    let g = `<ellipse cx="${x}" cy="${y + 4}" rx="80" ry="14" fill="#000" opacity="0.5" filter="url(#b4)"/>`;
    g += `<path d="M${x - 62},${y} Q${x - 60},${y - 26} ${x - 22},${y - 34} L${x - 14},${y - 74} L${x + 14},${y - 74} L${x + 22},${y - 34} Q${x + 60},${y - 26} ${x + 62},${y}Z" fill="#a8762e" ${ol(1.4)}/><path d="M${x - 46},${y - 10} Q${x - 40},${y - 26} ${x - 18},${y - 30}" stroke="#ffe0a0" stroke-width="4" fill="none" opacity="0.7"/>`;
    g += `<path d="M${x - 56},${y - 74} C${x - 66},${y - 120} ${x - 50},${y - 170} ${x},${y - 172} C${x + 50},${y - 170} ${x + 66},${y - 120} ${x + 56},${y - 74}Z" fill="#c88a3a" opacity="0.55" ${ol(1.4)}/><path d="M${x - 50},${y - 110} C${x - 46},${y - 140} ${x - 30},${y - 158} ${x - 12},${y - 162}" stroke="#fff4d0" stroke-width="5" fill="none" opacity="0.6"/><path d="M${x - 54},${y - 96} Q${x},${y - 84} ${x + 54},${y - 96}" stroke="#7a4a14" stroke-width="3" fill="none" opacity="0.7"/>`;
    g += `<rect x="${x - 34}" y="${y - 196}" width="68" height="26" rx="4" fill="#b8863a" ${ol(1.3)}/><rect x="${x - 28}" y="${y - 192}" width="56" height="6" fill="#ffe8b0" opacity="0.5"/>`;
    g += PR.flame(x, y - 214, 1.5, t);
    g += `<path d="M${x - 26},${y - 196} C${x - 44},${y - 240} ${x - 44},${y - 290} ${x - 18},${y - 320} L${x - 16},${y - 420} L${x + 16},${y - 420} L${x + 18},${y - 320} C${x + 44},${y - 290} ${x + 44},${y - 240} ${x + 26},${y - 196}Z" fill="#fff8e8" fill-opacity="0.12" stroke="#d8c8a8" stroke-width="2" stroke-opacity="0.7"/>`;
    g += `<path d="M${x - 30},${y - 214} C${x - 36},${y - 250} ${x - 30},${y - 290} ${x - 12},${y - 316} L${x - 10},${y - 410}" stroke="#fff" stroke-width="3" fill="none" opacity="0.55"/>`;
    g += C.bloom(x, y - 250, 120 * k, '#ffc060', 0.55) + C.radial(x, y - 250, 360, '#ffa040', 0.25 * k);
    return g;
  };
  S.roomLight = (t) => {
    const [lx, ly] = S.BR.LAMP, k = fl(t, 3), r = rng(91);
    let g = C.radial(lx + 30, ly - 230, 760, '#ffb060', 0.16 * k);
    for (let i = 0; i < 36; i++) { const x = lx - 100 + r() * 760, y = ly - 760 + r() * 700 - t * 12; g += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(1 + r() * 1.8)}" fill="#ffe0b0" opacity="${f(0.2 + r() * 0.4)}"/>`; }
    return g;
  };
  S.roomFg = (t) => `<g filter="url(#dof2)">` + bottle(1010, 2010, 600, 'round', '#3a1e0a', rng(4), 1) + `<path d="M1000,1420 Q1040,1500 1046,1700" stroke="#ffb060" stroke-width="10" fill="none" opacity="0.35"/>` + bottle(-30, 2060, 520, 'square', '#22301c', rng(9), 1) + `</g>`;

  // ======================================================= THE SODA FOUNTAIN, JACOBS' PHARMACY, 1886 (daylight)
  // world: the marble counter's far edge at y 1360, near edge 1520; the back bar behind: walnut, two mirrors, the
  // card for the new brain tonic, taps and syrup bottles; the shop window off to the right throws the light
  S.SF = { TOP: 1360, NEAR: 1520 };
  S.fountainBack = (t) => {
    const L = [], r = rng(201);
    let w = `<rect x="-900" y="-500" width="2900" height="2600" fill="#b49a76" filter="url(#plaster)"/>`;
    w += `<rect x="-900" y="250" width="2900" height="100" fill="#3a2414" filter="url(#woodH)"/><rect x="-900" y="250" width="2900" height="16" fill="#6a4426"/>` + Array.from({ length: 70 }, (_, i) => `<rect x="${-900 + i * 42}" y="304" width="22" height="20" fill="#2a180c"/>`).join('');
    // the mirrors: soft warm reflections of the shop and its window
    for (const [mx0, mx1] of [[120, 500], [590, 970]]) {
      w += `<rect x="${mx0 - 16}" y="344" width="${mx1 - mx0 + 32}" height="760" fill="#2e1c0e" ${ol(1.3)}/>`;
      w += lg('sfMir' + mx0, [[0, '#7a6a54'], [0.5, '#a89478'], [1, '#5a4a38']], 0, 0, 1, 0) + `<rect x="${mx0}" y="360" width="${mx1 - mx0}" height="730" fill="url(#sfMir${mx0})"/>`;
      w += `<rect x="${mx1 - 120}" y="380" width="90" height="420" fill="#fff4dc" opacity="0.35" filter="url(#b14)"/><rect x="${mx0 + 30}" y="760" width="${mx1 - mx0 - 60}" height="330" fill="#3a2a1a" opacity="0.35" filter="url(#b14)"/>`;
      w += `<path d="M${mx0 + 20},380 L${mx0 + 120},380 L${mx0 + 20},560Z" fill="#fff" opacity="0.08"/>`;
    }
    for (const px of [60, 530, 1000]) w += `<rect x="${px}" y="340" width="60" height="780" fill="#3a2414" filter="url(#woodV)" ${ol(1.3)}/><rect x="${px + 8}" y="360" width="10" height="740" fill="#8a5a30" opacity="0.4"/>` + S.sconce(px + 30, 640, t);
    // the clock on the cornice
    w += `<circle cx="920" cy="218" r="58" fill="#3a2414" ${ol(1.4)}/><circle cx="920" cy="218" r="46" fill="#ece2c8" ${ol(1.2)}/><path d="M920,218 L920,184 M920,218 L944,226" stroke="#1a1410" stroke-width="4" stroke-linecap="round"/>`;
    // the back counter: syrup bottles with pour spouts, glass jars, silver taps on their marble slab
    w += `<rect x="-900" y="1100" width="2900" height="30" fill="#c8c0b0" ${ol(1.2)}/><rect x="-900" y="1130" width="2900" height="400" fill="#2e1c0e" filter="url(#woodV)"/>`;
    let x = 140; while (x < 1060) { const h = 110 + r() * 60, col = ['#6a2a14', '#7a5a1a', '#3a4a22', '#8a3a1a', '#5a3a14'][Math.floor(r() * 5)]; w += bottle(x, 1100, h, r() < 0.3 ? 'tall' : 'round', col, r, 0.9) + `<path d="M${f(x)},${f(1100 - h)} l10,-22" stroke="#c8ccd0" stroke-width="5"/>`; x += 56 + r() * 30; }
    for (let i = 0; i < 4; i++) { const tx = 70 + i * 52; w += `<rect x="${tx - 8}" y="1040" width="16" height="60" fill="#c8ccd0" ${ol(1)}/><path d="M${tx},1040 L${tx + 22},988" stroke="#e8e0d0" stroke-width="10" stroke-linecap="round"/><circle cx="${tx + 24}" cy="984" r="9" fill="#f0e8d8" ${ol(1)}/>`; }
    // the window light falling across the back bar
    w += `<path d="M1100,-200 L1400,-200 L700,1400 L380,1400Z" fill="#fff6e0" opacity="0.12" filter="url(#b14)"/>`;
    L.push({ p: 0.8, svg: `<g filter="url(#dof1)">${w}</g>` });
    // the card for the new drink, hanging on its chain in front of the left mirror
    let c = `<path d="M250,346 L190,420 M250,346 L310,420" stroke="#4a3a2a" stroke-width="3"/><rect x="96" y="414" width="308" height="300" fill="#8a6a2a" ${ol(1.4)}/><rect x="106" y="424" width="288" height="280" fill="#efe4c8"/><rect x="116" y="434" width="268" height="260" fill="none" stroke="#2a1a10" stroke-width="2"/><rect x="122" y="440" width="256" height="248" fill="none" stroke="#2a1a10" stroke-width="1"/>`;
    c += TXT(250, 478, 22, '#9a1e14', 'DRINK', { w: 'bold', ls: 6 }) + TXT(250, 530, 46, '#1a120c', 'BRAIN', { w: 'bold', len: 200 }) + TXT(250, 578, 46, '#1a120c', 'TONIC', { w: 'bold', len: 200 }) + TXT(250, 660, 72, '#9a1e14', '5¢', { w: 'bold' }) + TXT(250, 684, 14, '#3a2a1a', 'Relieves Headache · Exhaustion', { it: true, len: 230 });
    c += `<path d="M150,592 L350,592" stroke="#2a1a10" stroke-width="1.6"/><rect x="96" y="414" width="308" height="300" fill="#fff4dc" opacity="0.1"/>`;
    L.push({ p: 0.86, svg: c });
    return L;
  };
  S.sconce = (x, y, t) => `<path d="M${x},${y + 30} L${x},${y - 10}" stroke="#b8863a" stroke-width="6"/><path d="M${x - 22},${y - 10} L${x + 22},${y - 10} L${x + 14},${y - 52} L${x - 14},${y - 52}Z" fill="#fff0d0" opacity="0.85" ${ol(1)}/>` + C.bloom(x, y - 32, 70, '#ffd090', 0.6) + C.radial(x, y - 32, 220, '#ffc070', 0.2 * fl(t, x));
  // the marble counter: veined white top, the walnut front with carved panels, a brass rail; on it the nickel the
  // customer put down (a Liberty "V" nickel: five cents) and a tray of clean glasses
  S.counter = (t, o = {}) => {
    const { TOP, NEAR } = S.SF, r = rng(211);
    let g = `<defs><filter id="sfMarble" x="0" y="0" width="1" height="1"><feTurbulence type="fractalNoise" baseFrequency="0.006 0.03" numOctaves="4" seed="7"/><feColorMatrix values="0 0 0 0 0.55  0 0 0 0 0.52  0 0 0 0 0.48  0 0 0 -2.6 1.5"/></filter></defs>`;
    g += `<path d="M-200,${TOP} L1280,${TOP} L1320,${NEAR} L-240,${NEAR}Z" fill="#ece6da"/><path d="M-200,${TOP} L1280,${TOP} L1320,${NEAR} L-240,${NEAR}Z" fill="#000" filter="url(#sfMarble)" opacity="0.5"/>`;
    for (let i = 0; i < 7; i++) { const x0 = r() * 1100, y0 = TOP + 10 + r() * 140; g += `<path d="M${f(x0)},${f(y0)} q${f(40 + r() * 80)},${f(10 + r() * 20)} ${f(140 + r() * 160)},${f(-5 + r() * 30)}" stroke="#8a8478" stroke-width="${f(1 + r() * 1.5)}" fill="none" opacity="0.45"/>`; }
    g += lg('sfTopL', [[0, '#000', 0.2], [0.6, '#fff', 0], [1, '#fff8e8', 0.25]], 0, 0, 1, 0) + `<path d="M-200,${TOP} L1280,${TOP} L1320,${NEAR} L-240,${NEAR}Z" fill="url(#sfTopL)"/>`;
    g += `<rect x="-240" y="${NEAR}" width="1560" height="26" fill="#d8d0c2" ${ol(1.3)}/><rect x="-240" y="${NEAR}" width="1560" height="5" fill="#fff" opacity="0.5"/>`;
    g += `<rect x="-240" y="${NEAR + 26}" width="1560" height="500" fill="#3a2212" filter="url(#woodV)"/>`;
    for (let i = 0; i < 5; i++) { const dx = -60 + i * 250; g += `<rect x="${dx}" y="${NEAR + 60}" width="220" height="300" rx="6" fill="#4a2c16" ${ol(1.3)}/><rect x="${dx + 18}" y="${NEAR + 78}" width="184" height="264" rx="4" fill="none" stroke="#7a4a26" stroke-width="3" opacity="0.6"/><ellipse cx="${dx + 110}" cy="${NEAR + 210}" rx="40" ry="60" fill="none" stroke="#6a3e1e" stroke-width="5" opacity="0.7"/>`; }
    g += lg('sfFr', [[0, '#000', 0.1], [1, '#000', 0.65]]) + `<rect x="-240" y="${NEAR + 26}" width="1560" height="500" fill="url(#sfFr)"/>`;
    g += `<rect x="-240" y="${NEAR + 380}" width="1560" height="16" rx="8" fill="#c8963a" ${ol(1.2)}/>`;
    // the nickel (o.noNickel: a shot that drops its own)
    if (!o.noNickel) g += `<g transform="translate(700,1468)"><ellipse rx="34" ry="13" fill="#3a3a38" opacity="0.45" transform="translate(4,5)" filter="url(#b2)"/><ellipse rx="34" ry="13" fill="#c8ccce" ${ol(1.2)}/><ellipse rx="27" ry="9.5" fill="none" stroke="#8a8e90" stroke-width="1.5"/>` + `<g transform="scale(1,0.38)">` + TXT(0, 12, 32, '#6a6e72', 'V', { w: 'bold' }) + `</g><ellipse cx="-10" cy="-4" rx="12" ry="3" fill="#fff" opacity="0.7"/></g>`;
    // a tray of clean glasses upside down at the right end (o.trayX: moved clear of a soda tap standing there)
    const TX = o.trayX ?? 1010;
    g += `<ellipse cx="${TX}" cy="1420" rx="120" ry="26" fill="#b8b4ac" ${ol(1.2)}/>`;
    for (const gx0 of [950, 1010, 1070, 980, 1040]) { const gx = gx0 + TX - 1010, gy = gx0 % 20 ? 1414 : 1400; g += `<path d="M${gx - 26},${gy} L${gx - 22},${gy - 90} L${gx + 22},${gy - 90} L${gx + 26},${gy}Z" fill="#eef4f4" fill-opacity="0.22" ${ol(1.1)}/><path d="M${gx - 18},${gy - 8} L${gx - 16},${gy - 82}" stroke="#fff" stroke-width="3" opacity="0.6"/>`; }
    return g;
  };
  S.fountLight = (t) => {
    const r = rng(221);
    let g = `<path d="M1300,-300 L1700,-300 L700,1700 L200,1700Z" fill="#fff4dc" opacity="0.1" style="mix-blend-mode:screen" filter="url(#b14)"/>`;
    for (let i = 0; i < 40; i++) { const u = r(), x = 1350 - u * 900 + r() * 260, y = -100 + u * 1700; g += `<circle cx="${f(x - t * 6)}" cy="${f(y + t * 10)}" r="${f(1 + r() * 1.6)}" fill="#fff8e8" opacity="${f(0.2 + r() * 0.4)}"/>`; }
    return g;
  };
  // a seltzer siphon on the counter close to the lens: ribbed green glass, a pewter head with its lever and spout
  S.fountFg = (t) => {
    let g = `<g filter="url(#dof2)"><path d="M-40,1960 L-40,1360 Q-40,1320 0,1316 L120,1316 Q160,1320 160,1360 L160,1960Z" fill="#9ab8a8" fill-opacity="0.32" ${ol(2.5)}/>`;
    for (let i = 0; i < 6; i++) g += `<path d="M${-20 + i * 30},1330 L${-20 + i * 30},1960" stroke="#d8ece4" stroke-width="5" opacity="0.25"/>`;
    g += `<path d="M-10,1340 L-10,1950" stroke="#fff" stroke-width="12" opacity="0.4"/><path d="M-30,1316 L150,1316 L130,1210 L-10,1210Z" fill="#8a8e90" ${ol(2)}/><path d="M120,1230 L240,1196 L246,1214 L126,1252Z" fill="#7a7e80" ${ol(1.6)}/><path d="M20,1210 L60,1130 L100,1136 L70,1214Z" fill="#6a6e70" ${ol(1.6)}/><path d="M0,1226 L130,1226" stroke="#e8ecee" stroke-width="5" opacity="0.6"/></g>`;
    return g;
  };
})(window);
