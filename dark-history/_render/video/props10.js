// Props for "The Rabies Boy" (1885): the glass-and-brass syringe, the drying flasks with their hanging spinal cords,
// rabbits and their cages, the mad dog (galloping, lunging, foaming), a glass of water, the tear-off calendar,
// the wall clock, a school satchel.
(function (G) {
  const P = G.PROPS, R = G.RIG, { f, shade, mix, rng, uid, ol, NS } = R;
  const lerp = (a, b, t) => a + (b - a) * t, cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));

  // ---------------- the syringe (grip frame): glass barrel through the fist, needle out of the thumb side (+x),
  // plunger rod and finger ring out of the little-finger side. o.size = hand size, o.fill 0..1, o.col liquid colour,
  // o.push 0..1 (plunger travel), o.glint 0..1
  P.SYR_TIP = [138, 0];
  P.syringeG = (o = {}) => {
    const id = uid('sy'), k = (o.size || 116) / 116, fill = cl(o.fill ?? 0.8), push = cl(o.push || 0), col = o.col || '#c8a890';
    const bx0 = -46, bx1 = 62, liquidX1 = lerp(bx0 + 6, bx1 - 4, 1) , liquidX0 = lerp(bx1 - 4 - (bx1 - bx0 - 10) * fill, bx1 - 4, 0);
    const plX = bx0 + 8 + (bx1 - bx0 - 20) * (1 - fill) * 0.98;   // the plunger head sits where the liquid begins
    let g = `<defs><linearGradient id="${id}g" gradientUnits="userSpaceOnUse" x1="0" y1="-13" x2="0" y2="13"><stop offset="0" stop-color="#ffffff" stop-opacity="0.75"/><stop offset="0.35" stop-color="#dfe8ec" stop-opacity="0.25"/><stop offset="0.8" stop-color="#9aa8b0" stop-opacity="0.35"/><stop offset="1" stop-color="#ffffff" stop-opacity="0.5"/></linearGradient>` +
      `<linearGradient id="${id}m" gradientUnits="userSpaceOnUse" x1="0" y1="-14" x2="0" y2="14"><stop offset="0" stop-color="#f4dc90"/><stop offset="0.45" stop-color="#b8862e"/><stop offset="1" stop-color="#6a4a14"/></linearGradient></defs>`;
    // plunger rod and ring (behind the barrel)
    const rodEnd = plX - 70 + 40 * push;
    g += `<rect x="${f(rodEnd)}" y="-3.5" width="${f(plX - rodEnd)}" height="7" fill="#b8bcc0" stroke="#4a4e52" stroke-width="1"/><circle cx="${f(rodEnd - 9)}" cy="0" r="10" fill="none" stroke="url(#${id}m)" stroke-width="5"/>`;
    // the liquid in the barrel, then the glass and its brass end caps, graduations
    g += `<rect x="${f(plX + 4)}" y="-9" width="${f(Math.max(0, bx1 - 4 - plX - 4))}" height="18" fill="${col}" opacity="0.85"/><rect x="${f(plX + 4)}" y="-9" width="${f(Math.max(0, bx1 - 4 - plX - 4))}" height="5" fill="#fff" opacity="0.25"/>`;
    g += `<rect x="${f(plX)}" y="-10" width="7" height="20" rx="2" fill="#2a2a2e"/>`;
    g += `<rect x="${bx0}" y="-12" width="${bx1 - bx0}" height="24" rx="4" fill="url(#${id}g)" stroke="#5a6a70" stroke-width="1.4"/>`;
    for (let i = 1; i < 8; i++) g += `<path d="M${bx0 + i * 13},-12 l0,${i % 2 ? 6 : 9}" stroke="#2a3a40" stroke-width="1" opacity="0.6"/>`;
    g += `<rect x="${bx0 - 8}" y="-14" width="12" height="28" rx="3" fill="url(#${id}m)" stroke="#4a3410" stroke-width="1.2"/><rect x="${bx1 - 4}" y="-13" width="12" height="26" rx="3" fill="url(#${id}m)" stroke="#4a3410" stroke-width="1.2"/>`;
    g += `<path d="M${bx1 + 8},-6 L${bx1 + 22},-3 L${bx1 + 22},3 L${bx1 + 8},6Z" fill="url(#${id}m)" stroke="#4a3410" stroke-width="1"/>`;
    // the needle
    g += `<path d="M${bx1 + 22},-1.6 L138,-0.3 L138,0.3 L${bx1 + 22},1.6Z" fill="#d8dee2" stroke="#5a6266" stroke-width="0.6"/><path d="M${bx1 + 24},-0.8 L134,-0.2" stroke="#fff" stroke-width="0.8" opacity="0.8"/>`;
    if (o.drop) g += `<circle cx="140" cy="2" r="${f(2.5 * o.drop)}" fill="${col}" opacity="0.9"/>`;
    if (o.glint !== undefined && o.glint !== null) { const gx = bx0 + (138 - bx0) * o.glint; g += `<ellipse cx="${f(gx)}" cy="-6" rx="14" ry="3" fill="#fff" opacity="${f(0.9 * Math.sin(Math.PI * cl(o.glint)))}" filter="url(#b2)"/>`; }
    return k === 1 ? g : `<g transform="scale(${f(k)})">${g}</g>`;
  };

  // ---------------- the drying flask: a tall two-necked bottle, a spinal cord hanging from a thread under the stopper,
  // lumps of potash on the bottom, a paper label with the day. d = dryness 0 (fresh, plump, pink-red) .. 1 (shrivelled, brown)
  P.cordFlask = (x, y, s, d, day, t = 0, o = {}) => {
    const id = uid('cf'), sway = Math.sin(t * 1.3 + day) * 2;
    const cordC = mix('#e8a49a', '#a8844a', d), cordW = lerp(15, 6, d), cordL = lerp(150, 120, d);
    let g = `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9ab4b4" stop-opacity="0.55"/><stop offset="0.2" stop-color="#ffffff" stop-opacity="0.35"/><stop offset="0.6" stop-color="#cfe0e0" stop-opacity="0.12"/><stop offset="1" stop-color="#6a8a8a" stop-opacity="0.5"/></linearGradient></defs>`;
    g += `<ellipse cx="0" cy="4" rx="70" ry="10" fill="#000" opacity="0.35" filter="url(#b4)"/>`;
    // the cord hangs inside, seen through the glass
    let cord = `<path d="M0,-238 L${f(sway * 0.3)},-214" stroke="#d8d0c0" stroke-width="1.5"/>`;
    const segs = 9; let px = sway * 0.3, py = -214;
    for (let i = 0; i < segs; i++) { const nx = sway * (0.3 + 0.7 * (i + 1) / segs) + Math.sin(i * 1.9 + day) * (1.5 + 3 * d), ny = -214 + cordL * (i + 1) / segs, w2 = cordW * (1 - 0.15 * Math.sin(i * 1.3 + d * 5)); cord += `<path d="M${f(px)},${f(py)} L${f(nx)},${f(ny)}" stroke="${shade(cordC, -0.35)}" stroke-width="${f(w2 + 3)}" stroke-linecap="round"/><path d="M${f(px)},${f(py)} L${f(nx)},${f(ny)}" stroke="${cordC}" stroke-width="${f(w2)}" stroke-linecap="round"/>`; px = nx; py = ny; }
    cord += `<path d="M${f(sway * 0.3 - cordW * 0.2)},-212 L${f(px - cordW * 0.2)},${f(py - 4)}" stroke="#fff" stroke-width="${f(Math.max(1, cordW * 0.18))}" opacity="${f(0.45 * (1 - d))}" stroke-linecap="round"/>`;
    for (let i = 0; i < 4; i++) cord += `<path d="M${f(-cordW * 0.5)},${f(-200 + i * 30)} l${f(cordW)},2" stroke="${shade(cordC, -0.4)}" stroke-width="1.2" opacity="0.6"/>`;
    // potash lumps
    const rp = rng(day + 3); let pot = ''; for (let i = 0; i < 9; i++) { const px2 = -46 + rp() * 92, sz = 6 + rp() * 9; pot += `<path d="M${f(px2 - sz)},-8 L${f(px2 - sz * 0.4)},${f(-8 - sz)} L${f(px2 + sz * 0.7)},${f(-8 - sz * 0.7)} L${f(px2 + sz)},-8Z" fill="${['#e6e4dc', '#cfccc2', '#f2f0ea'][i % 3]}" stroke="#8a8880" stroke-width="0.8"/>`; }
    const body = `M-56,-6 C-62,-6 -64,-14 -64,-24 L-64,-170 C-64,-196 -40,-208 -22,-212 L-22,-238 L22,-238 L22,-212 C40,-208 64,-196 64,-170 L64,-24 C64,-14 62,-6 56,-6Z`;
    g += `<path d="${body}" fill="#dfeeee" opacity="0.18"/>` + cord + pot;
    // the side neck with its cotton plug, the top stopper with cotton, the glass itself
    g += `<path d="M44,-180 L74,-208 L84,-198 L56,-170Z" fill="url(#${id})" stroke="#5a7474" stroke-width="1.5"/><ellipse cx="80" cy="-204" rx="9" ry="6" fill="#f4f0e6" stroke="#9a968c" stroke-width="1" transform="rotate(-42 80 -204)"/>`;
    g += `<path d="${body}" fill="url(#${id})" stroke="#5a7474" stroke-width="2"/><rect x="-26" y="-252" width="52" height="18" rx="5" fill="#f2eee2" stroke="#9a968c" stroke-width="1.2"/><path d="M-20,-246 q10,-6 20,0 t20,0" stroke="#c8c4b8" stroke-width="2" fill="none"/>`;
    g += `<path d="M-48,-160 L-48,-40" stroke="#fff" stroke-width="7" opacity="0.35" stroke-linecap="round"/><path d="M48,-150 L48,-60" stroke="#fff" stroke-width="3" opacity="0.2"/>`;
    // the label
    g += `<rect x="-30" y="-110" width="60" height="38" fill="#efe6cc" stroke="#6a5a3a" stroke-width="1"/><text x="0" y="-84" font-family="Palatino Linotype, Georgia, serif" font-size="22" text-anchor="middle" fill="#2a1a10">${day}</text>`;
    if (o.glow) g += `<ellipse cx="0" cy="-120" rx="70" ry="120" fill="#ff7a5a" opacity="${f(0.18 * o.glow)}" filter="url(#b14)"/>`;
    return `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">${g}</g>`;
  };

  // ---------------- a rabbit sitting (side view, facing left). o.sick 0..1 hunches it, droops the ears, half-closes the eye;
  // o.dead 0..1 lays it flat on the straw, head down, eye shut, breathing stopped
  P.rabbit = (x, y, s, t, o = {}) => {
    const dead = o.dead || 0, sick = Math.max(o.sick || 0, dead), br = 1 + 0.03 * (1 - dead) * Math.sin(t * (6 - 3 * sick)), tw = (o.twitch || 0) * Math.sin(t * 31) * 2, col = o.col || '#b8a890';
    const earA = lerp(lerp(-18, 50, sick), 78, dead), nose = Math.sin(t * 9) * 1.2 * (1 - sick);
    let g = `<ellipse cx="0" cy="4" rx="${f(80 + 30 * dead)}" ry="10" fill="#000" opacity="0.35" filter="url(#b4)"/>`;
    g += `<g transform="translate(${f(tw - 10 * dead)},0) rotate(${f(-8 * dead)} -40 0) scale(${f(1 + 0.16 * dead)},${f(br * (1 - 0.36 * dead))}) translate(0,${f(-sick * 6 * (1 - dead))})">`;
    g += `<path d="M60,0 C90,-10 96,-60 70,-90 C40,-120 -20,-118 -40,-96 C-56,-78 -50,-30 -40,0Z" fill="${col}" ${ol(1.5)}/>`;
    g += `<path d="M76,-40 C92,-46 98,-62 88,-70 C80,-62 74,-52 70,-46Z" fill="#f4f0e8"/><path d="M-30,-6 L10,-6 C14,-14 4,-22 -10,-22 C-26,-22 -34,-14 -30,-6Z" fill="${shade(col, -0.15)}" ${ol(1)}/>`;
    const rf = rng(5); for (let i = 0; i < 18; i++) g += `<path d="M${f(-30 + rf() * 100)},${f(-100 + rf() * 90)} l${f(rf() * 6 - 3)},${f(6 + rf() * 6)}" stroke="${shade(col, -0.3)}" stroke-width="1.4" opacity="0.5"/>`;
    // head with ears
    g += `<g transform="translate(${f(-40 - 6 * dead)},${f(-92 + sick * 20 + 30 * dead)}) rotate(${f(sick * 18 + 14 * dead)}) scale(1.25,${f(1.25 / (1 - 0.3 * dead))})">`;
    for (const k of [0, 1]) g += `<path d="M${6 + k * 10},-26 C${-4 + k * 10},-70 ${16 + k * 10},-110 ${30 + k * 12},-104 C${40 + k * 12},-90 ${30 + k * 10},-50 ${20 + k * 10},-24Z" fill="${k ? col : shade(col, -0.2)}" ${ol(1.2)} transform="rotate(${f(earA + k * 6)} ${10 + k * 10} -24)"/>`;
    g += `<path d="M-48,8 C-52,-12 -36,-34 -6,-34 C20,-34 34,-16 30,8 C26,26 -40,30 -48,8Z" fill="${col}" ${ol(1.4)}/>`;
    g += `<ellipse cx="-14" cy="-8" rx="${f(6)}" ry="${f(6 * (1 - 0.7 * sick) * (1 - 0.85 * dead))}" fill="#1a0e0a"/><circle cx="-16" cy="-10" r="1.8" fill="#fff" opacity="${f(0.9 * (1 - sick))}"/>`;
    if (dead > 0) g += `<path d="M-21,-8 Q-14,-4 -7,-8" stroke="#1a0e0a" stroke-width="2.2" fill="none" opacity="${f(dead)}"/>`;
    g += `<ellipse cx="${f(-46 + nose)}" cy="4" rx="4" ry="3" fill="#c88a8a"/><path d="M-46,8 l-14,-4 M-46,10 l-14,4 M-44,9 l-12,10" stroke="#e8e4dc" stroke-width="0.8" opacity="0.7"/>`;
    g += `</g></g>`;
    return `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">${g}</g>`;
  };
  // a rabbit cage: dark wooden frame, wire mesh front, straw, a label card. Draw the rabbit first, then the cage front
  P.cageBack = (x, y, w, h) => `<rect x="${f(x)}" y="${f(y - h)}" width="${f(w)}" height="${f(h)}" fill="#1e140c"/><rect x="${f(x)}" y="${f(y - 30)}" width="${f(w)}" height="30" fill="#8a7444"/>` + (() => { const r = rng(Math.round(x)); let s = ''; for (let i = 0; i < 26; i++) { const sx = x + r() * w; s += `<path d="M${f(sx)},${f(y - 4)} l${f(r() * 30 - 15)},${f(-8 - r() * 14)}" stroke="#c8a858" stroke-width="2"/>`; } return s; })();
  P.cageFront = (x, y, w, h, label) => {
    let g = '';
    for (let i = 1; i < Math.floor(w / 18); i++) g += `<path d="M${f(x + i * 18)},${f(y - h)} L${f(x + i * 18)},${f(y)}" stroke="#8a8c8e" stroke-width="1.6" opacity="0.85"/>`;
    for (let j = 1; j < Math.floor(h / 18); j++) g += `<path d="M${f(x)},${f(y - j * 18)} L${f(x + w)},${f(y - j * 18)}" stroke="#7a7c7e" stroke-width="1.2" opacity="0.7"/>`;
    g += `<rect x="${f(x)}" y="${f(y - h)}" width="${f(w)}" height="${f(h)}" fill="none" stroke="#3a2614" stroke-width="12"/>`;
    if (label) g += `<rect x="${f(x + w / 2 - 34)}" y="${f(y - h - 4)}" width="68" height="26" fill="#efe6cc" stroke="#6a5a3a" stroke-width="1"/><text x="${f(x + w / 2)}" y="${f(y - h + 15)}" font-family="Segoe Script, Brush Script MT, cursive" font-size="15" text-anchor="middle" fill="#2a1a10">${label}</text>`;
    return g;
  };

  // ---------------- the dog (side view, facing +x). o.run 0..1 gallop phase (cycles), o.gait 0 standing .. 1 full gallop,
  // o.lunge 0..1 stretches it into a leap, o.jaw 0..1 open mouth, o.foam 0..1, o.mad 0..1 (red eyes, raised hackles,
  // bared teeth), o.col coat colour, o.sit for kennel dogs
  P.dog = (x, y, s, t, o = {}) => {
    const id = uid('dg'), col = o.col || '#5a4632', dk = shade(col, -0.45), gait = o.gait || 0, ph = (o.run || 0) * Math.PI * 2, lun = o.lunge || 0, jaw = o.jaw || 0, mad = o.mad || 0, foam = o.foam || 0;
    const bob = gait * 10 * Math.sin(ph * 2), arch = gait * 0.12 * Math.sin(ph) - lun * 0.12;
    let g = `<defs><radialGradient id="${id}" cx="45%" cy="30%" r="80%"><stop offset="0" stop-color="${shade(col, 0.3)}"/><stop offset="0.6" stop-color="${col}"/><stop offset="1" stop-color="${dk}"/></radialGradient></defs>`;
    g += `<ellipse cx="0" cy="4" rx="${f(150 + 60 * lun)}" ry="12" fill="#000" opacity="${f(0.35 * (1 - lun * 0.7))}" filter="url(#b4)"/>`;
    // legs: hip/shoulder pivots, two segments, swinging with the gallop (far legs darker, phase-shifted)
    const OUT_D = '#140c06', lt = shade(col, 0.28);
    // tapered limb segments (thigh -> hock -> paw) so the legs have weight instead of being sticks
    const seg = (x0, y0, x1, y1, wa, wb) => { const dx = x1 - x0, dy = y1 - y0, n = Math.hypot(dx, dy) || 1, nx = -dy / n, ny = dx / n; return `M${f(x0 + nx * wa)},${f(y0 + ny * wa)} L${f(x1 + nx * wb)},${f(y1 + ny * wb)} L${f(x1 - nx * wb)},${f(y1 - ny * wb)} L${f(x0 - nx * wa)},${f(y0 - ny * wa)}Z`; };
    const leg2 = (hx, hy, phase, far, front) => {
      const a = gait * 0.78 * Math.sin(ph + phase) + (front ? -lun * 1.05 : lun * 0.95), L1 = front ? 52 : 60, L2 = front ? 54 : 56;
      const kx = hx + Math.sin(a) * L1, ky = hy + Math.cos(a) * L1, b = a + (front ? 0.18 : -0.62) * (1 - 0.6 * lun) + gait * 0.42 * Math.sin(ph + phase + 1.2) * (front ? -1 : 1);
      const px = kx + Math.sin(b) * L2, py = ky + Math.cos(b) * L2, c = far ? shade(col, -0.32) : col, w0 = front ? 15 : 24, w1 = front ? 9 : 11;
      // the muscle where the leg joins the body (shoulder / thigh), so the limb grows out of the trunk
      const mus = `<ellipse cx="${f(hx + Math.sin(a) * 10)}" cy="${f(hy + 8)}" rx="${front ? 20 : 30}" ry="${front ? 30 : 38}" transform="rotate(${f(-a * 40)} ${f(hx)} ${f(hy)})" fill="${c}" stroke="${OUT_D}" stroke-width="2"/>`;
      return mus + `<path d="${seg(hx, hy, kx, ky, w0, w1)}" fill="${c}" stroke="${OUT_D}" stroke-width="1.7" stroke-linejoin="round"/><path d="${seg(kx, ky, px, py, w1, 6.5)}" fill="${c}" stroke="${OUT_D}" stroke-width="1.7" stroke-linejoin="round"/><circle cx="${f(kx)}" cy="${f(ky)}" r="${f(w1 - 0.6)}" fill="${c}"/>` +
        `<path d="M${f(px - 9)},${f(py + 3)} C${f(px - 8)},${f(py - 9)} ${f(px + 13)},${f(py - 9)} ${f(px + 17)},${f(py + 3)}Z" fill="${shade(c, -0.3)}" stroke="${OUT_D}" stroke-width="1.8"/>`;
    };
    let body = '';
    if (o.sit) {
      body += `<path d="M-70,-10 C-90,-60 -70,-120 -20,-140 C20,-150 50,-120 50,-80 C50,-40 30,-10 -10,-6Z" fill="url(#${id})" ${ol(1.6)}/><path d="M30,-80 L40,-6 M10,-80 L18,-6" stroke="${col}" stroke-width="16" stroke-linecap="round"/><path d="M-90,-10 C-120,-14 -130,-30 -110,-34" stroke="${col}" stroke-width="12" fill="none" stroke-linecap="round"/>`;
    } else {
      body += leg2(-72, -104 + bob, 1.6, true, false) + leg2(66, -100 + bob, 0.4, true, true);
      // the tail: stiff and low when mad, wagging otherwise (tapers from a thick root)
      const tw = mad > 0.5 ? 0.2 * Math.sin(t * 3) : 0.6 * Math.sin(t * 8), ty = (k) => f(-120 + bob + k);
      const tailD = `M-100,${ty(0)} C-132,${ty(-6 + tw * 30)} -150,${ty(18 + tw * 40 + mad * 30)} -170,${ty(30 + tw * 50 + mad * 44)}`;
      body += `<path d="${tailD}" stroke="${OUT_D}" stroke-width="17" fill="none" stroke-linecap="round"/><path d="${tailD}" stroke="${col}" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M-100,${ty(0)} C-118,${ty(-4)} -126,${ty(2)} -134,${ty(8)}" stroke="${col}" stroke-width="18" fill="none" stroke-linecap="round"/>`;
      body += `<g transform="rotate(${f(arch * 57)} 0 ${f(-110 + bob)})">`;
      // the body: deep chest, tucked belly, a round haunch, a thick neck rising to the head
      const B = (x, y) => `${x},${f(y + bob)}`;
      body += `<path d="M${B(56, -164)} C${B(66, -200)} ${B(92, -214)} ${B(116, -200)} L${B(132, -152)} C${B(128, -126)} ${B(116, -112)} ${B(100, -104)}Z" fill="url(#${id})" ${ol(1.8)}/>`;
      body += `<path d="M${B(-108, -122)} C${B(-116, -154)} ${B(-84, -170)} ${B(-44, -164)} C${B(-4, -160)} ${B(34, -172)} ${B(70, -170)} C${B(98, -168)} ${B(116, -150)} ${B(114, -122)} C${B(112, -94)} ${B(96, -74)} ${B(68, -70)} C${B(40, -68)} ${B(12, -92)} ${B(-28, -94)} C${B(-62, -96)} ${B(-100, -88)} ${B(-108, -122)}Z" fill="url(#${id})" ${ol(1.8)}/>`;
      body += `<path d="M${B(-60, -150)} C${B(-30, -140)} ${B(-36, -104)} ${B(-74, -96)}" stroke="${dk}" stroke-width="5" fill="none" opacity="0.55"/><path d="M${B(64, -150)} C${B(84, -132)} ${B(86, -100)} ${B(70, -80)}" stroke="${dk}" stroke-width="4" fill="none" opacity="0.45"/>`;
      const rf2 = rng(13); for (let i = 0; i < 16; i++) { const fx = -90 + rf2() * 190, fy = -150 + rf2() * 50; body += `<path d="M${B(f(fx), fy)} q${f(4 + rf2() * 4)},${f(5 + rf2() * 5)} ${f(2 + rf2() * 3)},${f(12 + rf2() * 6)}" stroke="${i % 2 ? lt : dk}" stroke-width="1.6" fill="none" opacity="0.45"/>`; }
      // hackles raised along the spine when mad: tufts of fur, not spikes
      if (mad > 0) for (let i = 0; i < 14; i++) { const hx = -66 + i * 10, hy = -164 + Math.abs(i - 8) * 0.5; body += `<path d="M${B(f(hx), hy + 5)} q${f(2 + (i % 3))},${f(-5 * mad - 2)} ${f(6 + (i % 2) * 2)},${f(-7 * mad - 2)}" stroke="${shade(col, -0.22)}" stroke-width="2.4" fill="none" stroke-linecap="round" opacity="0.85"/>`; }
      body += `</g>`;
      body += leg2(-62, -106 + bob, 0, false, false) + leg2(78, -104 + bob, 2.2, false, true);
    }
    // head and jaws (open with bared teeth and foam when mad)
    const hx = o.sit ? 30 : 112, hy = o.sit ? -150 : -176 + bob - lun * 10, ha = (o.sit ? -10 : -lun * 14) + (o.headA || 0), jA = jaw * 32;
    let h = `<path d="M-30,10 C-40,-30 -10,-56 30,-50 C60,-46 90,-30 112,-20 C126,-14 128,0 116,6 L40,12 C20,24 -20,30 -30,10Z" fill="url(#${id})" ${ol(1.6)}/>`;
    h += `<g transform="rotate(${f(jA)} 34 10)"><path d="M34,6 L112,8 C118,10 118,20 108,22 L40,26 C30,26 26,14 34,6Z" fill="${shade(col, -0.1)}" ${ol(1.4)}/>${mad > 0.3 ? [50, 64, 78, 92].map(tx => `<path d="M${tx},8 l4,-8 l4,8Z" fill="#f2ecd8"/>`).join('') : ''}${foam > 0 ? `<path d="M60,24 q6,${f(18 * foam)} 2,${f(34 * foam)} M88,22 q4,${f(14 * foam)} -2,${f(26 * foam)}" stroke="#f4f4f0" stroke-width="3" fill="none" opacity="0.85"/>` : ''}</g>`;
    if (jaw > 0.1) h += `<path d="M38,8 L112,6 L110,14 L40,18Z" fill="#5a0a0a" opacity="${f(cl(jaw * 3))}"/>` + (mad > 0.3 ? [56, 70, 84, 98].map(tx => `<path d="M${tx},6 l4,10 l4,-10Z" fill="#f4eedc" stroke="#6a5a4a" stroke-width="0.6"/>`).join('') : '');
    h += `<ellipse cx="118" cy="-8" rx="9" ry="7" fill="#141010"/><ellipse cx="116" cy="-11" rx="3" ry="2" fill="#fff" opacity="0.5"/>`;
    h += `<ellipse cx="52" cy="-26" rx="9" ry="${f(mad > 0.5 ? 8 : 7)}" fill="${mad > 0.3 ? '#c8281a' : '#2a1608'}"/><circle cx="54" cy="-28" r="3.2" fill="#0a0404"/><circle cx="53" cy="-30" r="1.5" fill="#fff" opacity="0.9"/>`;
    h += `<path d="M38,${f(-34 - mad * 6)} L66,${f(-30 + mad * 4)}" stroke="#140c06" stroke-width="3.5"/>`;
    h += `<path d="M4,-44 C-10,-80 -2,-94 12,-96 C20,-80 26,-60 22,-44Z" fill="${dk}" ${ol(1.3)} transform="rotate(${f(mad * 30)} 14 -44)"/>`;
    if (foam > 0) { const rf = rng(9); for (let i = 0; i < 12; i++) h += `<circle cx="${f(70 + rf() * 50)}" cy="${f(12 + rf() * 16 + jA * 0.4)}" r="${f((2 + rf() * 5) * foam)}" fill="#fbfbf6" stroke="#c8c8c0" stroke-width="0.6"/>`; }
    body += `<g transform="translate(${hx},${f(hy)}) rotate(${f(ha)})">${h}</g>`;
    g += body;
    return `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">${g}</g>`;
  };

  // ---------------- a glass tumbler of water (o.level 0..1, o.tilt deg, o.slosh)
  P.waterGlass = (x, y, s, o = {}) => {
    const lv = cl(o.level ?? 0.75), sl = o.slosh || 0, id = uid('wg');
    const wy = -8 - 104 * lv;
    let g = `<ellipse cx="0" cy="2" rx="40" ry="7" fill="#000" opacity="0.3" filter="url(#b2)"/>`;
    g += `<defs><clipPath id="${id}"><path d="M-36,-120 L36,-120 L30,-4 L-30,-4Z"/></clipPath></defs><g clip-path="url(#${id})"><path d="M-40,${f(wy + sl * 4)} Q0,${f(wy - sl * 6)} 40,${f(wy - sl * 4)} L40,0 L-40,0Z" fill="#b8d8e4" opacity="0.55"/><path d="M-40,${f(wy + sl * 4)} Q0,${f(wy - sl * 6)} 40,${f(wy - sl * 4)}" stroke="#ffffff" stroke-width="2" fill="none" opacity="0.8"/></g>`;
    g += `<path d="M-36,-120 L36,-120 L30,-4 L-30,-4Z" fill="#e8f4f8" opacity="0.12" stroke="#8aa4ae" stroke-width="2"/><ellipse cx="0" cy="-120" rx="36" ry="6" fill="none" stroke="#9ab4be" stroke-width="2"/><path d="M-26,-110 L-22,-14" stroke="#fff" stroke-width="5" opacity="0.4" stroke-linecap="round"/><path d="M-30,-6 L30,-6" stroke="#6a8a94" stroke-width="5" opacity="0.5"/>`;
    return `<g transform="translate(${f(x)},${f(y)}) rotate(${f(o.tilt || 0)}) scale(${f(s)})">${g}</g>`;
  };

  // ---------------- the tear-off wall calendar (month, day; o.flip 0..1 a page curling away)
  P.calendar = (x, y, s, month, day, o = {}) => {
    let g = `<rect x="-70" y="-10" width="140" height="170" fill="#f2ecdc" stroke="#5a4a30" stroke-width="2"/><rect x="-70" y="-10" width="140" height="40" fill="#8a1e1e"/><text x="0" y="18" font-family="Palatino Linotype, Georgia, serif" font-size="22" text-anchor="middle" fill="#f8f2e2">${month}</text>`;
    g += `<text x="0" y="118" font-family="Palatino Linotype, Georgia, serif" font-size="78" text-anchor="middle" fill="#1a1410">${day}</text><text x="0" y="148" font-family="Palatino Linotype, Georgia, serif" font-size="16" text-anchor="middle" fill="#5a4a30">1885</text>`;
    g += `<circle cx="0" cy="-22" r="6" fill="#3a3a3a"/>`;
    if (o.flip) { const k = o.flip; g += `<g transform="translate(0,30) rotate(${f(-60 * k)} -70 0) translate(${f(-30 * k)},${f(-80 * k)})" opacity="${f(1 - k)}"><rect x="-70" y="0" width="140" height="130" fill="#f6f0e2" stroke="#8a7a5a" stroke-width="1.5"/><text x="0" y="88" font-family="Palatino Linotype, Georgia, serif" font-size="78" text-anchor="middle" fill="#1a1410">${o.prevDay || ''}</text></g>`; }
    return `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">${g}</g>`;
  };
  // a round wall clock with a swinging pendulum box below
  P.wallClock = (x, y, s, t, o = {}) => {
    const hm = (o.hour ?? 3) / 12 * Math.PI * 2, mm = (o.min ?? 0) / 60 * Math.PI * 2;
    let g = `<circle r="70" fill="#4a2e16" stroke="#1a0e06" stroke-width="3"/><circle r="56" fill="#f2ecdc" stroke="#6a5a3a" stroke-width="2"/>`;
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g += `<path d="M${f(Math.sin(a) * 46)},${f(-Math.cos(a) * 46)} L${f(Math.sin(a) * 52)},${f(-Math.cos(a) * 52)}" stroke="#1a1410" stroke-width="3"/>`; }
    g += `<path d="M0,0 L${f(Math.sin(hm) * 28)},${f(-Math.cos(hm) * 28)} M0,0 L${f(Math.sin(mm) * 42)},${f(-Math.cos(mm) * 42)}" stroke="#1a1410" stroke-width="4" stroke-linecap="round"/><circle r="4" fill="#1a1410"/>`;
    const sw = Math.sin(t * Math.PI) * 12;
    g += `<rect x="-26" y="68" width="52" height="110" fill="#3a2414" stroke="#1a0e06" stroke-width="2"/><g transform="rotate(${f(sw)} 0 74)"><path d="M0,74 L0,150" stroke="#b8862e" stroke-width="3"/><circle cx="0" cy="156" r="12" fill="#d8b050" stroke="#5a4010" stroke-width="1.5"/></g>`;
    return `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">${g}</g>`;
  };
  // a leather school satchel on a strap (local: the bag hangs from 0,0)
  P.satchel = (x, y, s, ang = 0) => `<g transform="translate(${f(x)},${f(y)}) rotate(${f(ang)}) scale(${f(s)})"><rect x="-60" y="0" width="120" height="90" rx="10" fill="#6a4424" stroke="#2a1608" stroke-width="2.5"/><path d="M-60,4 L60,4 L56,46 Q0,58 -56,46Z" fill="#7a5230" stroke="#2a1608" stroke-width="2"/><rect x="-8" y="36" width="16" height="22" rx="3" fill="#c8a040" stroke="#5a4010" stroke-width="1.5"/></g>`;
})(window);
