// Props for "The Royal Fool": the juggling daggers, the sealed letter (and the big page that wipes across the lens),
// 14th-century cogs (French with lily sails, English with lions), fire, smoke, arrow volleys, sailors leaping into the
// sea, splashes, wreckage and a drifting lily banner, the gibbet in the courtyard with crows, and the painted war map
// of the Channel with carved ship tokens.
(function (G) {
  const P = G.PROPS, { f, rng, shade, uid } = G.RIG, C = G.CINE, Q = G.QCAST;
  // scales are never rounded to steps (a far prop would jump a few per cent at each step as the camera moves)
  const fs = v => Math.round(v * 1e5) / 1e5;
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t;
  const ss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  const TAU = Math.PI * 2, D2R = Math.PI / 180;
  const ol = (w = 1.6, op = 0.75) => `stroke="#140c06" stroke-width="${w}" stroke-opacity="${op}" stroke-linejoin="round"`;
  const P17 = G.P17 = {};

  // ---------------- a dagger in the grip frame (origin at the grip slot, +x thumb side = toward the blade, +y fingers)
  // len: the blade length in px at rig scale 1 (the rig's hand is ~110 units)
  P17.daggerG = (len = 210) => `<rect x="-58" y="-9" width="96" height="18" rx="8" fill="#4a2e18" ${ol(1.2)}/>` +
    [-44, -30, -16, -2, 12, 26].map(x => `<path d="M${x},-9 L${x + 6},9" stroke="#2a180a" stroke-width="2" opacity="0.6"/>`).join('') +
    `<circle cx="-62" cy="0" r="12" fill="#c8a040" ${ol(1.2)}/><rect x="38" y="-30" width="13" height="60" rx="4" fill="#c8a040" ${ol(1.2)}/>` +
    `<path d="M51,-11 L${51 + len},-1.5 L${51 + len + 16},0 L${51 + len},1.5 L51,11Z" fill="#d8dee4" ${ol(1.2)}/><path d="M51,0 L${51 + len + 10},0" stroke="#8a929c" stroke-width="2"/><path d="M58,-7 L${51 + len * 0.8},-1.5" stroke="#ffffff" stroke-width="2.5" opacity="0.7"/>`;
  // the same dagger in world space: centre of the grip at (x, y), rotation (deg; 0 = blade pointing right), scale
  P17.dagger = (x, y, s, rot, len = 210) => `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)}) scale(${Math.round(s * 1e5) / 1e5})">${P17.daggerG(len)}</g>`;

  // ---------------- the letter: folded parchment sealed with red wax and a ribbon (origin centre; local px at s = 1:
  // 220 x 150); o.open 0..1 unfolds it (the page grows taller), o.wet darkens it
  P17.letter = (x, y, s, rot = 0, o = {}) => {
    const id = uid('lt'), h = lerp(150, 300, o.open || 0), wet = o.wet || 0;
    let g = `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${shade('#ecdcb4', -0.15 * wet)}"/><stop offset="1" stop-color="${shade('#c8b48a', -0.2 * wet)}"/></linearGradient></defs>`;
    g += `<path d="M-110,${-h / 2} L110,${-h / 2} L106,${h / 2} L-108,${h / 2}Z" fill="url(#${id})" ${ol(1.6)}/><path d="M-110,${-h / 2} L0,6 L110,${-h / 2}" stroke="#8a7650" stroke-width="2" fill="none" opacity="0.7"/>`;
    for (let i = 0; i < 6; i++) g += `<path d="M${-86 + (i % 2) * 10},${f(-h / 2 + 30 + i * (h - 50) / 6)} q40,-4 80,0 t80,0" stroke="#4a3a24" stroke-width="2" fill="none" opacity="${f(0.25 + 0.2 * (o.open || 0))}"/>`;
    if (wet > 0) g += `<path d="M-90,${f(h / 2 - 20)} C-40,${f(h / 2 - 60)} 30,${f(h / 2 - 10)} 100,${f(h / 2 - 40)} L106,${h / 2} L-108,${h / 2}Z" fill="#5a4a30" opacity="${f(0.3 * wet)}"/>`;
    g += `<path d="M-4,6 L-24,58 L-12,56 L-8,66 L2,10Z" fill="#8a1a1a" ${ol(1)}/><circle cx="0" cy="6" r="22" fill="#a8201c" ${ol(1.4)}/>` + Q.lily(0, 8, 0.32, '#6a0e0c');
    return `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)}) scale(${Math.round(s * 1e5) / 1e5})">${g}</g>`;
  };
  // the page that crosses the lens (a light-coloured object wipe): a huge sheet of parchment, its edge curling, out of
  // focus, ink lines and the red seal passing by
  P17.pageWipe = (x, u) => {
    let g = `<path d="M${f(x - 760)},-260 L${f(x + 700)},-200 C${f(x + 760)},400 ${f(x + 640)},1300 ${f(x + 720)},2200 L${f(x - 700)},2160 C${f(x - 780)},1500 ${f(x - 660)},600 ${f(x - 760)},-260Z" fill="#e8d8b0"/>`;
    g += `<path d="M${f(x + 700)},-200 C${f(x + 760)},400 ${f(x + 640)},1300 ${f(x + 720)},2200" stroke="#a8946a" stroke-width="40" fill="none" opacity="0.6"/>`;
    for (let i = 0; i < 14; i++) g += `<path d="M${f(x - 520)},${180 + i * 120} q200,-14 400,0 t400,0" stroke="#5a4a30" stroke-width="12" fill="none" opacity="0.25"/>`;
    g += `<circle cx="${f(x + 120)}" cy="1500" r="150" fill="#9a1e1a" opacity="0.85"/>`;
    return `<g filter="url(#dof3)">${g}</g>`;
  };

  // ---------------- a cog (14th century): local px, origin at the waterline centre, the bow to the right (dir 1) or
  // left (dir -1). o: { sail (colour), emblem 'lily' | 'lions', banner, fire 0..1, sink 0..1, roll (deg), mast 0..1
  // (falling), crew [ {x, k} ], archers n, t, seed, furl 0..1 (sail taken in), dark 0..1 (silhouette at dusk) }
  P17.cog = (x, y, s, t, o = {}) => {
    const d = o.dir || 1, r = rng(o.seed || 1), dk = o.dark || 0, id = uid('cg');
    const wood = shade('#6a4426', -0.5 * dk), woodD = shade('#3a2414', -0.5 * dk), woodL = shade('#9a6a3a', -0.5 * dk);
    let g = `<defs><linearGradient id="${id}h" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${woodL}"/><stop offset="0.5" stop-color="${wood}"/><stop offset="1" stop-color="${woodD}"/></linearGradient>` +
      `<linearGradient id="${id}s" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${shade(o.sail || '#e8e0c8', -0.25 - 0.4 * dk)}"/><stop offset="0.45" stop-color="${shade(o.sail || '#e8e0c8', 0.05 - 0.4 * dk)}"/><stop offset="1" stop-color="${shade(o.sail || '#e8e0c8', -0.3 - 0.4 * dk)}"/></linearGradient></defs>`;
    // hull: a deep round belly, straight stem and stern posts, clinker strakes
    const hull = `M-300,-70 C-300,-10 -290,30 -250,60 C-150,96 150,96 250,60 C300,28 318,-20 330,-92 L290,-96 C260,-60 -250,-52 -270,-92Z`;
    // the mast and sail (behind the castles' front rails): a single big square sail on a yard
    const mastK = o.mast || 0, mastRot = -d * 72 * mastK * mastK, furl = o.furl || 0, sh = lerp(300, 70, furl);
    let rig = `<g transform="rotate(${f(mastRot)},0,-90)">`;
    rig += `<path d="M-6,-90 L-5,-560 L5,-560 L6,-90Z" fill="${woodD}" ${ol(1.2)}/>`;
    // rigging: stays to bow and stern, shrouds
    rig += `<path d="M0,-555 L${300 * d},-150 M0,-555 L${-280 * d},-160 M0,-500 L-120,-96 M0,-500 L120,-96 M0,-470 L-150,-96 M0,-470 L150,-96" stroke="${shade('#2a1e14', -0.3 * dk)}" stroke-width="1.6" opacity="0.8"/>`;
    const bel = 20 * Math.sin(t * 1.3 + (o.seed || 0)) * (1 - furl);
    rig += `<path d="M-180,-500 L180,-500 C${f(190 + bel * 0.3)},${f(-500 + sh * 0.5)} ${f(196 + bel)},${f(-500 + sh * 0.8)} 176,${f(-500 + sh)} L-176,${f(-500 + sh)} C${f(-196 + bel)},${f(-500 + sh * 0.8)} ${f(-190 + bel * 0.3)},${f(-500 + sh * 0.5)} -180,-500Z" fill="url(#${id}s)" ${ol(1.6)}/>`;
    if (furl < 0.6) {
      if (o.stripes) for (let i = -2; i <= 2; i++) rig += `<path d="M${i * 72 - 18},-500 L${i * 72 + 18},-500 L${i * 74 + 18},${f(-500 + sh)} L${i * 74 - 18},${f(-500 + sh)}Z" fill="${o.stripes}" opacity="${f(0.85 - 0.4 * dk)}"/>`;
      if (o.emblem === 'lily') { for (const [ex, ey] of [[-80, 0.3], [80, 0.3], [0, 0.62], [-80, 0.85], [80, 0.85]]) rig += Q.lily(ex, -500 + sh * ey, 1.2, shade('#d8b040', -0.4 * dk)); }
      if (o.emblem === 'lions') { for (const [ex, ey] of [[0, 0.25], [0, 0.55], [0, 0.82]]) rig += P17.lion(ex, -500 + sh * ey, 1.0, shade('#d8b040', -0.4 * dk), d); }
      if (o.emblem === 'cross') rig += `<path d="M-26,-500 L26,-500 L26,${f(-500 + sh)} L-26,${f(-500 + sh)}Z M-176,${f(-500 + sh * 0.42)} L176,${f(-500 + sh * 0.42)} L176,${f(-500 + sh * 0.6)} L-176,${f(-500 + sh * 0.6)}Z" fill="${shade('#c0201a', -0.4 * dk)}"/>`;
    }
    rig += `<path d="M-196,-504 L196,-504" stroke="${woodD}" stroke-width="10" stroke-linecap="round"/>`;
    // the top castle (crow's nest) and a pennant streaming in the wind
    rig += `<path d="M-26,-560 L26,-560 L22,-600 L-22,-600Z" fill="${wood}" ${ol(1.2)}/>`;
    const pw = Math.sin(t * 4 + (o.seed || 0));
    rig += `<path d="M0,-600 L0,-650 L${-d * 120},${f(-640 + pw * 8)} L${-d * 90},${f(-628 + pw * 6)} L${-d * 124},${f(-616 + pw * 9)} L0,-612Z" fill="${shade(o.banner || '#22348a', -0.4 * dk)}" ${ol(1)}/>`;
    rig += `</g>`;
    g += rig;
    // the hull, strakes, wales
    g += `<path d="${hull}" fill="url(#${id}h)" ${ol(2)}/>`;
    for (let i = 1; i < 6; i++) { const yy = -70 + i * 26; g += `<path d="M${-296 + i * 6},${yy} C-150,${yy + 22 - i * 2} 150,${yy + 22 - i * 2} ${316 - i * 10},${yy - 14}" stroke="${woodD}" stroke-width="2.4" fill="none" opacity="0.8"/>`; }
    g += `<path d="M-288,-78 C-150,-58 150,-58 300,-90" stroke="${woodL}" stroke-width="6" fill="none" opacity="0.7"/>`;
    // the castles: stern (left for dir 1) and fore, crenellated rails with painted shields
    const castle = (cx, w, h, top) => {
      let c = `<path d="M${cx - w / 2},${top + h} L${cx - w / 2},${top} L${cx + w / 2},${top} L${cx + w / 2},${top + h}Z" fill="${wood}" ${ol(1.6)}/>`;
      for (let xx = cx - w / 2; xx < cx + w / 2 - 4; xx += 26) c += `<rect x="${f(xx)}" y="${top - 16}" width="15" height="17" fill="${wood}" ${ol(1)}/>`;
      for (let xx = cx - w / 2 + 20; xx < cx + w / 2 - 14; xx += 40) { const sc = o.emblem === 'lily' ? shade('#22348a', -0.4 * dk) : shade('#b8221a', -0.4 * dk); c += `<path d="M${f(xx - 13)},${top + 8} L${f(xx + 13)},${top + 8} L${f(xx + 13)},${top + 24} Q${f(xx)},${top + 42} ${f(xx - 13)},${top + 24}Z" fill="${sc}" ${ol(1)}/>`; }
      return c + `<path d="M${cx - w / 2},${top + h * 0.55} L${cx + w / 2},${top + h * 0.55}" stroke="${woodD}" stroke-width="3"/>`;
    };
    g += castle(-d * 230, 150, 116, -180) + castle(d * 250, 120, 104, -170);
    // crew on deck (small silhouettes) and archers on the castles drawing and loosing
    for (const c of (o.crew || [])) g += P17.tiny(c.x, -96, 0.9, c.k ?? 0, dk, c.seed || 0, t, c.pose);
    for (let i = 0; i < (o.archers || 0); i++) { const ax = d * 250 + (i - 1) * 36; g += P17.archerTiny(ax, -170, 0.9, t + i * 0.37, d, dk); }
    // fire on deck and up the sail; burning makes the wood glow
    if (o.fire) {
      // o.fireGlow: 'screen' (default), 'over' or false, handed to every flame (see P17.fire)
      const fk = o.fire, fg = o.fireGlow ?? 'screen';
      g += fg === 'screen' ? `<path d="${hull}" fill="#ff7a2a" opacity="${f(0.18 * fk)}" style="mix-blend-mode:screen"/>` : `<path d="${hull}" fill="#ff8a3a" opacity="${f(0.12 * fk)}"/>`;
      for (let i = 0; i < 6; i++) { const fx = -220 + i * 90 + r() * 30, fs = (0.7 + r() * 0.8) * fk; if (fs > 0.05) g += P17.fire(fx, -100, fs * 1.4, t, i + (o.seed || 0), fg); }
      if (fk > 0.5) g += `<g transform="rotate(${f(mastRot)},0,-90)">` + P17.fire(-60, -380, (fk - 0.5) * 2.4, t, 17, fg) + P17.fire(70, -300, (fk - 0.5) * 2, t, 23, fg) + `</g>`;
    }
    const sink = o.sink || 0, roll = (o.roll || 0);
    return `<g transform="translate(${f(x)},${f(y + sink * 260 * s)}) rotate(${f(roll)}) scale(${fs(d * s)},${fs(s)})">${g}</g>`;
  };
  // a heraldic lion passant (crude, gold), facing dir
  P17.lion = (x, y, s, col, d = 1) => `<g transform="translate(${f(x)},${f(y)}) scale(${fs(d * s)},${fs(s)})" fill="${col}"><path d="M-46,10 C-40,-10 -10,-14 20,-10 L34,-22 C44,-26 52,-18 48,-8 L44,0 C46,10 40,16 34,14 L30,24 L22,24 L20,12 L-20,12 L-24,26 L-32,26 L-34,12 C-46,16 -60,8 -64,-6 C-60,-2 -52,4 -46,10Z"/><circle cx="40" cy="-14" r="10"/></g>`;
  // a tiny crew figure (silhouette-ish: dark body with a lit edge), k: a little sway, pose 'stand' | 'pull' | 'arms'
  P17.tiny = (x, y, s, k, dk, seed, t, pose = 'stand') => {
    const r = rng(seed + 5), col = shade(['#3a4a6a', '#6a5a3a', '#5a2a24', '#2a3a3a'][Math.floor(r() * 4)], -0.5 * dk), sk = shade('#c89878', -0.6 * dk);
    const sw = Math.sin(t * 2 + seed) * 3 + k * 6, arm = pose === 'arms' ? -40 : pose === 'pull' ? -20 + 10 * Math.sin(t * 5 + seed) : 10;
    return `<g transform="translate(${f(x)},${f(y)}) scale(${fs(s)}) rotate(${f(sw)})"><path d="M-9,0 L-7,-30 L7,-30 L9,0Z" fill="${shade(col, -0.3)}"/><path d="M-11,-30 L-12,-62 L12,-62 L11,-30Z" fill="${col}"/><path d="M-11,-60 L${f(-22 + arm * 0.2)},${f(-40 + arm)} M11,-60 L${f(22 - arm * 0.2)},${f(-40 + arm)}" stroke="${col}" stroke-width="6" stroke-linecap="round"/><circle cx="0" cy="-72" r="9" fill="${sk}"/></g>`;
  };
  // an archer on a castle: drawing the longbow and loosing on a 1.6 s cycle (the bow flexes, the string snaps back)
  P17.archerTiny = (x, y, s, t, d, dk) => {
    const u = ((t / 1.6) % 1 + 1) % 1, draw = u < 0.7 ? ss(0.05, 0.6, u) : 1 - ss(0.7, 0.8, u), col = shade('#c8c0b0', -0.55 * dk), sk = shade('#d8a888', -0.6 * dk);
    const bx = d * 28, pull = d * (6 - 22 * draw);
    return `<g transform="translate(${f(x)},${f(y)}) scale(${fs(s)})"><path d="M-8,0 L-10,-34 L10,-34 L8,0Z" fill="${shade(col, -0.35)}"/><path d="M-11,-34 L-12,-64 L12,-64 L11,-34Z" fill="${col}"/><circle cx="0" cy="-74" r="9" fill="${sk}"/><path d="M-8,-74 C-8,-88 8,-88 8,-74Z" fill="${shade('#8a9098', -0.5 * dk)}"/>` +
      `<path d="M${bx},-110 Q${f(bx + d * (18 + 10 * draw))},-62 ${bx},-14" stroke="${shade('#5a3a1e', -0.4 * dk)}" stroke-width="4" fill="none"/><path d="M${bx},-110 L${f(pull)},-62 L${bx},-14" stroke="#e8e0d0" stroke-width="1" opacity="0.7" fill="none"/><path d="M0,-58 L${f(bx)},-62 M0,-58 L${f(pull)},-62" stroke="${col}" stroke-width="6" stroke-linecap="round"/></g>`;
  };
  // fire: layered tongues that lick upward and flicker (local px; s ~ 1 is a man-high flame at cog scale)
  // glow: 'screen' (a blended light, its own offscreen layer), 'over' (the same light painted plainly: a fleet of
  // burning ships would otherwise need hundreds of blend layers in one frame), or false (none, for reflections)
  P17.fire = (x, y, s, t, seed = 0, glow = 'screen') => {
    const r = rng(seed * 13 + 7); let g = '';
    for (let i = 0; i < 5; i++) {
      const ph = r() * TAU, w = (22 + r() * 18) * s, h = (60 + r() * 50) * s * (0.85 + 0.15 * Math.sin(t * (7 + i) + ph)), ox = (r() - 0.5) * 30 * s, lean = Math.sin(t * 3 + ph) * 10 * s;
      const col = i < 2 ? '#c8281a' : i < 4 ? '#ff7a1a' : '#ffd860';
      g += `<path d="M${f(ox - w)},0 C${f(ox - w)},${f(-h * 0.4)} ${f(ox - w * 0.3 + lean)},${f(-h * 0.6)} ${f(ox + lean * 1.4)},${f(-h)} C${f(ox + w * 0.3 + lean)},${f(-h * 0.6)} ${f(ox + w)},${f(-h * 0.4)} ${f(ox + w)},0Z" fill="${col}" opacity="${i < 2 ? 0.85 : 0.9}"/>`;
    }
    const gx = x, gy = y - 40 * s, gr = 140 * s;
    const gl = glow === 'screen' ? C.radial(gx, gy, gr, '#ff9a40', 0.35, 'screen') : glow === 'over' ? (() => { const id = uid('fg'); return `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${f(gx)}" cy="${f(gy)}" r="${f(gr)}"><stop offset="0" stop-color="#ffa850" stop-opacity="0.28"/><stop offset="1" stop-color="#ffa850" stop-opacity="0"/></radialGradient><rect x="${f(gx - gr)}" y="${f(gy - gr)}" width="${f(2 * gr)}" height="${f(2 * gr)}" fill="url(#${id})"/>`; })() : '';
    return `<g transform="translate(${f(x)},${f(y)})">${g}</g>` + gl;
  };
  // a column of smoke: puffs born at (x, y) rising and spreading with the wind (wx px/s), darker low, grey high
  P17.smoke = (x, y, s, t, seed = 0, o = {}) => {
    const r = rng(seed * 7 + 3), n = o.n || 14, life = o.life || 6, wx = o.wind ?? 30; let g = '';
    for (let i = 0; i < n; i++) {
      const ph = r(), age = (((t / life) + ph) % 1) * life, k = age / life;
      const px = x + wx * age * s + Math.sin(age * 0.8 + i) * 20 * s, py = y - age * (o.rise || 60) * s, rr = (30 + 110 * k) * s * (0.7 + r() * 0.6);
      const op = (o.op ?? 0.55) * ss(0, 0.12, k) * (1 - ss(0.6, 1, k));
      // o.cull [x0, y0, x1, y1]: puffs wholly outside it are left out (a near ship's column climbs thousands of px off
      // the frame)
      if (o.cull && (px + rr < o.cull[0] || px - rr > o.cull[2] || py + rr < o.cull[1] || py - rr > o.cull[3])) continue;
      // o.grad: soft puffs filled with shared radial gradients (8 tones from fresh black smoke to old grey, ids
      // o.grad + 0..7) and no blur layer at all; otherwise flat discs under the b8 blur
      g += `<circle cx="${f(px)}" cy="${f(py)}" r="${f(rr)}" fill="${o.grad ? `url(#${o.grad}${Math.round(k * 7)})` : R0(lerp(0, 1, k), o.col)}" opacity="${f(op)}"/>`;
    }
    return g ? (o.grad ? `<g>${g}</g>` : `<g filter="url(#b8)">${g}</g>`) : '';
  };
  const R0 = (k, col) => col || G.RIG.mix('#1a1410', '#6a6460', k);
  // the gradients for P17.smoke's o.grad: id + 0..7, each a soft puff (solid core, feathered rim)
  P17.smokeDefs = id => Array.from({ length: 8 }, (_, i) => { const c = R0(i / 7); return `<radialGradient id="${id}${i}"><stop offset="0" stop-color="${c}"/><stop offset="0.55" stop-color="${c}" stop-opacity="0.92"/><stop offset="0.82" stop-color="${c}" stop-opacity="0.5"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`; }).join('');
  // a volley of arrows from a source area to a target area: n arrows on parabolas, each loosed on its own beat
  // (period per), the shaft pointing along its flight, a faint streak behind it
  P17.volley = (A, B, t, o = {}) => {
    const r = rng(o.seed || 9), n = o.n || 16, per = o.per || 1.6, fl = o.flight || 1.1; let g = '';
    for (let i = 0; i < n; i++) {
      const off = r() * per, ax = A[0] + (r() - 0.5) * A[2], ay = A[1] + (r() - 0.5) * 20, bx = B[0] + (r() - 0.5) * B[2], by = B[1] + (r() - 0.5) * 30;
      const age = (((t - (o.t0 || 0)) - off) % per + per) % per; if (t - (o.t0 || 0) < off) continue;
      const u = age / fl; if (u > 1) continue;
      const hgt = o.arc || 260, px = lerp(ax, bx, u), py = lerp(ay, by, u) - hgt * 4 * u * (1 - u);
      const vx = bx - ax, vy = (by - ay) - hgt * 4 * (1 - 2 * u), a = Math.atan2(vy, vx) / D2R, L = (o.len || 34);
      const op = ss(0, 0.06, u) * (1 - ss(0.94, 1, u));
      g += `<g transform="translate(${f(px)},${f(py)}) rotate(${f(a)})" opacity="${f(op)}"><path d="M${f(-L * 2.2)},0 L${f(-L)},0" stroke="${o.streak || '#f0e0c0'}" stroke-width="1.4" opacity="0.35"/><path d="M${f(-L)},0 L${f(L * 0.6)},0" stroke="${o.col || '#2a1e14'}" stroke-width="2.2"/><path d="M${f(L * 0.6)},-3 L${f(L * 0.85)},0 L${f(L * 0.6)},3Z" fill="#3a3a3a"/><path d="M${f(-L)},0 l-6,-4 M${f(-L)},0 l-6,4" stroke="#e8e0d0" stroke-width="1.4"/></g>`;
    }
    return g;
  };
  // a man leaping from the rail into the sea: crouch, spring, arc out and down head-first (u 0..1 over the leap),
  // a silhouette lit by the fire from behind; returns '' after he hits the water
  P17.jumper = (x0, y0, xw, yw, s, u, seed = 0, lit = '#ff9a50') => {
    if (u <= 0 || u >= 1) return '';
    const sp = ss(0, 0.25, u), fl = ss(0.25, 1, u), x = lerp(x0, xw, fl), y = lerp(y0, yw, fl) - 120 * s * Math.sin(Math.PI * fl) * (1 - fl * 0.3);
    const dir = Math.sign(xw - x0 || 1), rot = lerp(0, 150 * dir, ss(0.3, 0.95, u)), cr = sp * (1 - fl);
    // a sailor in silhouette against the fire (not a stick figure): a belted tunic, limbs with real thickness bending at
    // knee and elbow, hands, boots, a cap or a hood; crouched on the rail, then flung out - arms up, knees tucked
    const r = rng(seed * 13 + 7), cap = r() < 0.5, C0 = '#140c08', L = (a, b, k) => a + (b - a) * k;
    const hip = [0, -44 + cr * 12], sh = [dir * 2 * cr, -78 + cr * 16], hd = [dir * 3 * cr, -93 + cr * 16];
    const leg = sd => [[L(sd * 5 + dir * 4 * cr, sd * 7 + dir * 10, fl), L(-22 + cr * 4, -30, fl)], [L(sd * 6, sd * 5 - dir * 12, fl), L(0, -14, fl)]];
    const arm = sd => [[L(sd * 13 - dir * 6 * cr, sd * 17, fl), L(-62 + cr * 12, -98, fl)], [L(sd * 12 - dir * 10 * cr, sd * 22, fl), L(-46 + cr * 10, -118, fl)]];
    const seg = (a, b, w) => `<path d="M${f(a[0])},${f(a[1])} L${f(b[0])},${f(b[1])}" stroke="${C0}" stroke-width="${w}" stroke-linecap="round"/>`;
    let body = '';
    for (const sd of [-1, 1]) { const [k, ft] = leg(sd); body += seg([hip[0] + sd * 5, hip[1]], k, 11) + seg(k, ft, 9) + `<ellipse cx="${f(ft[0] + dir * 3)}" cy="${f(ft[1])}" rx="7" ry="4" fill="${C0}"/>`; }
    body += `<path d="M${f(sh[0] - 12)},${f(sh[1])} L${f(sh[0] + 12)},${f(sh[1])} L${f(hip[0] + 13)},${f(hip[1] + 8)} L${f(hip[0] - 13)},${f(hip[1] + 8)}Z" fill="${C0}"/>`;
    for (const sd of [-1, 1]) { const [e, h] = arm(sd); body += seg([sh[0] + sd * 10, sh[1] + 3], e, 8) + seg(e, h, 7) + `<circle cx="${f(h[0])}" cy="${f(h[1])}" r="4.2" fill="${C0}"/>`; }
    body += `<rect x="${f(sh[0] - 3.5)}" y="${f(sh[1] - 6)}" width="7" height="8" fill="${C0}"/><ellipse cx="${f(hd[0])}" cy="${f(hd[1])}" rx="8.5" ry="10" fill="${C0}"/>`;
    body += cap ? `<path d="M${f(hd[0] - 9)},${f(hd[1] - 3)} Q${f(hd[0] - 6)},${f(hd[1] - 16)} ${f(hd[0] + 6)},${f(hd[1] - 14)} L${f(hd[0] - dir * 13)},${f(hd[1] - 19)}Z" fill="${C0}"/>`
      : `<path d="M${f(hd[0] - 10)},${f(hd[1] + 4)} Q${f(hd[0] - 10)},${f(hd[1] - 15)} ${f(hd[0])},${f(hd[1] - 13)} Q${f(hd[0] + 10)},${f(hd[1] - 15)} ${f(hd[0] + 10)},${f(hd[1] + 4)}Z" fill="${C0}"/>`;
    // the fire behind them catches one edge of the body and the head
    body += `<path d="M${f(sh[0] - dir * 12)},${f(sh[1])} L${f(hip[0] - dir * 13)},${f(hip[1] + 8)}" stroke="${lit}" stroke-width="1.6" opacity="0.7"/><path d="M${f(hd[0] - dir * 8)},${f(hd[1] - 5)} Q${f(hd[0] - dir * 9.5)},${f(hd[1] + 2)} ${f(hd[0] - dir * 6)},${f(hd[1] + 8)}" stroke="${lit}" stroke-width="1.4" fill="none" opacity="0.7"/>`;
    return `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)},0,-40) scale(${fs(s)})">${body}</g>`;
  };
  // a splash where something hits the water (u 0..1): a crown of spray rising and falling, rings spreading
  P17.splash = (x, y, s, u, col = '#e8f0f0') => {
    if (u <= 0 || u >= 1) return '';
    const h = 90 * s * Math.sin(Math.PI * Math.min(1, u * 1.6)), w = 30 * s + 40 * s * u, op = 1 - ss(0.5, 1, u);
    let g = `<path d="M${f(x - w)},${f(y)} Q${f(x - w * 0.6)},${f(y - h)} ${f(x - w * 0.2)},${f(y - h * 0.5)} Q${f(x)},${f(y - h * 1.3)} ${f(x + w * 0.2)},${f(y - h * 0.5)} Q${f(x + w * 0.6)},${f(y - h)} ${f(x + w)},${f(y)}Z" fill="${col}" opacity="${f(0.85 * op)}"/>`;
    for (let i = 0; i < 2; i++) { const k = clamp(u * 1.3 - i * 0.25); if (k > 0) g += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(w * (1 + k * 2.4))}" ry="${f(w * (1 + k * 2.4) * 0.18)}" fill="none" stroke="${col}" stroke-width="${f(3 * s)}" opacity="${f(0.6 * (1 - k))}"/>`; }
    return g;
  };
  // wreckage floating: planks, a barrel, a broken spar, a helmet (bobbing on the swell at time t)
  P17.wreck = (x, y, s, t, seed = 0, dk = 0) => {
    const r = rng(seed * 11 + 1); let g = '';
    const kind = Math.floor(r() * 4), bob = Math.sin(t * 1.4 + seed) * 4 * s, rot = Math.sin(t * 0.9 + seed) * 6 + (r() - 0.5) * 50;
    const wood = shade('#5a3a20', -0.5 * dk);
    if (kind === 0) g = `<rect x="-90" y="-8" width="180" height="16" rx="3" fill="${wood}" ${ol(1.2)}/><path d="M-80,-2 L80,-2" stroke="${shade(wood, -0.4)}" stroke-width="2"/>`;
    if (kind === 1) g = `<ellipse cx="0" cy="0" rx="34" ry="44" fill="${wood}" ${ol(1.2)}/><path d="M-34,-12 L34,-12 M-34,14 L34,14" stroke="#2a2420" stroke-width="5"/>`;
    if (kind === 2) g = `<rect x="-140" y="-6" width="280" height="12" rx="5" fill="${shade(wood, -0.2)}" ${ol(1.2)}/><path d="M60,-6 L90,-26 L96,-20 L70,0" fill="${wood}"/>`;
    if (kind === 3) g = `<path d="M-30,6 C-30,-30 30,-30 30,6 L44,8 L-44,8Z" fill="${shade('#8a9098', -0.5 * dk)}" ${ol(1.2)}/>`;
    return `<g transform="translate(${f(x)},${f(y + bob)}) rotate(${f(rot * 0.3)}) scale(${fs(s)})">${g}</g>`;
  };
  // the lily banner drifting half-sunk in the water: blue silk with gold lilies, folds rising and falling with the swell
  P17.floatBanner = (x, y, s, t, dk = 0) => {
    const w1 = Math.sin(t * 1.2) * 8, w2 = Math.sin(t * 1.2 + 1.4) * 8, col = shade('#22348a', -0.35 * dk);
    let g = `<path d="M-200,${f(w1)} C-120,${f(-20 + w2)} -40,${f(20 + w1)} 40,${f(w2)} C120,${f(-16 + w1)} 180,${f(14 + w2)} 220,${f(w1)} L200,${f(60 + w2)} C120,${f(76 + w1)} 40,${f(50 + w2)} -40,${f(70 + w1)} C-120,${f(84 + w2)} -170,${f(60 + w1)} -210,${f(58 + w2)}Z" fill="${col}" ${ol(1.6)}/>`;
    for (const [lx, ly] of [[-130, 34], [-40, 36], [50, 30], [140, 34]]) g += Q.lily(lx, ly + Math.sin(t * 1.2 + lx * 0.02) * 6, 0.62, shade('#d8b040', -0.35 * dk));
    g += `<path d="M-210,${f(58 + w2)} C-120,${f(84 + w2)} 120,${f(76 + w1)} 200,${f(60 + w2)}" stroke="#d8f0f0" stroke-width="3" fill="none" opacity="0.4"/>`;
    return `<g transform="translate(${f(x)},${f(y)}) scale(${fs(s)})">${g}</g>`;
  };

  // ---------------- the gibbet: a post, a beam, a brace; the hanged man (a messenger's satchel at his hip) turning a
  // little on the rope; crows on the beam (fly: 0..1 the first crow takes off). Origin at the post foot; local px.
  P17.gibbet = (x, y, s, t, o = {}) => {
    const wood = o.dark ? '#1a1410' : '#3a2a1e', sw = Math.sin(t * 0.8) * 2.2 + Math.sin(t * 0.37) * 1.2;
    let g = `<rect x="-22" y="-980" width="44" height="980" fill="${wood}" ${ol(2)}/><rect x="-30" y="-1010" width="420" height="40" fill="${wood}" ${ol(2)}/><path d="M18,-760 L170,-972 L196,-972 L22,-724Z" fill="${wood}" ${ol(1.6)}/>`;
    g += `<path d="M-60,0 L60,0 L40,-30 L-40,-30Z" fill="${wood}" ${ol(1.4)}/>`;
    // the rope and the hanged body (dark, faceless at this distance; hood down over the head)
    const body = `<path d="M0,0 L0,150" stroke="#2a2016" stroke-width="5"/><ellipse cx="0" cy="168" rx="24" ry="28" fill="#2a2420"/>` +
      `<path d="M-38,196 L38,196 L32,420 L-32,420Z" fill="#3a3024"/><path d="M-36,204 L-46,380 M36,204 L46,380" stroke="#3a3024" stroke-width="18" stroke-linecap="round"/>` +
      `<path d="M-20,420 L-24,600 M20,420 L24,600" stroke="#2a2420" stroke-width="20" stroke-linecap="round"/><path d="M-30,600 L-16,606 M30,600 L16,606" stroke="#1a1410" stroke-width="12" stroke-linecap="round"/>` +
      `<path d="M30,300 L62,380 L30,400Z" fill="#4a3420"/><path d="M-30,214 L44,330" stroke="#2a1e14" stroke-width="5"/>`;
    g += `<g transform="translate(300,-970) rotate(${f(sw)})">${body}</g>`;
    // crows on the beam (one shuffles, one takes off and flies away up-left)
    const crow = (cx, cy, k, fl) => { const wing = Math.sin(t * 14) * 30 * fl; return `<g transform="translate(${f(cx)},${f(cy)}) scale(${fs(k)})"><path d="M-18,0 C-18,-20 14,-24 22,-10 L36,-14 L26,-4 C24,6 -6,10 -18,0Z" fill="#0e0c10"/><circle cx="20" cy="-14" r="7" fill="#0e0c10"/><path d="M26,-15 L36,-12 L26,-11Z" fill="#3a3430"/>${fl > 0 ? `<path d="M-4,-8 C-20,${f(-40 - wing)} -50,${f(-36 - wing)} -60,${f(-20 - wing * 0.6)} C-36,-18 -20,-12 -4,-4Z" fill="#0e0c10"/>` : `<path d="M-14,-6 L-34,4 L-14,2Z" fill="#0e0c10"/>`}</g>`; };
    const fly = o.fly || 0, fx = lerp(120, -260, fly), fy = lerp(-1018, -1500, fly) - 90 * Math.sin(Math.PI * fly);
    g += crow(40, -1018, 1.2, 0) + crow(200, -1018, 1.1, 0) + crow(fx, fy, 1.2, fly > 0 ? 1 : 0);
    return `<g transform="translate(${f(x)},${f(y)}) scale(${fs(s)})">${g}</g>`;
  };

  // ---------------- the war map of the Channel (local px, w x h, the north at the top): England's south coast across
  // the top, France below, Flanders to the right with the harbour of Sluys (the Zwin estuary) at HARBOUR; a sea of
  // blue-green wash, a compass rose, towns as little towers, lily and lion flags. o.tokens [{ x, y, col, rot }]
  P17.MAP = { W: 1400, H: 1000, HARBOUR: [1120, 560] };
  P17.channelMap = (t, o = {}) => {
    const W = P17.MAP.W, H = P17.MAP.H, id = 'cmap';
    let g = `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e8d8b0"/><stop offset="0.6" stop-color="#dcc89a"/><stop offset="1" stop-color="#c4ac7a"/></linearGradient><radialGradient id="${id}v" cx="0.5" cy="0.5" r="0.7"><stop offset="0.6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#3a2410" stop-opacity="0.45"/></radialGradient></defs>`;
    g += `<rect x="0" y="0" width="${W}" height="${H}" fill="url(#${id})"/>`;
    // the sea between the coasts (blue-green wash), with ripple strokes
    g += `<path d="M0,250 C200,300 380,240 560,290 C760,340 900,300 1040,330 C1120,360 1180,300 1260,320 L1400,300 L1400,520 C1300,530 1220,520 1160,548 C1120,566 1100,600 1060,600 C980,610 900,640 820,650 C640,660 520,700 380,700 C240,700 120,690 0,720Z" fill="#7aa098" opacity="0.6"/>`;
    for (let i = 0; i < 26; i++) { const xx = 60 + (i * 137) % 1280, yy = 340 + (i * 71) % 300; g += `<path d="M${xx},${yy} q12,-8 24,0 t24,0" stroke="#3a6a6a" stroke-width="2.4" fill="none" opacity="0.5"/>`; }
    // the coasts: England (top), France (bottom), Flanders (right), inked outlines and a darker shore band
    const eng = `M0,0 L1400,0 L1400,300 L1260,320 C1180,300 1120,360 1040,330 C900,300 760,340 560,290 C380,240 200,300 0,250Z`;
    const fra = `M0,720 C120,690 240,700 380,700 C520,700 640,660 820,650 C900,640 980,610 1060,600 C1100,600 1120,566 1160,548 C1220,520 1300,530 1400,520 L1400,1000 L0,1000Z`;
    g += `<path d="${eng}" fill="#d8c48e" stroke="#3a2a14" stroke-width="4"/><path d="${fra}" fill="#d4be86" stroke="#3a2a14" stroke-width="4"/>`;
    // the Zwin: an estuary cut into the Flemish coast, the harbour of Sluys at its head
    const [hx, hy] = P17.MAP.HARBOUR;
    g += `<path d="M${hx - 70},${hy - 4} C${hx - 40},${hy + 20} ${hx - 20},${hy + 60} ${hx - 10},${hy + 110} C${hx + 10},${hy + 90} ${hx + 30},${hy + 40} ${hx + 60},${hy - 8}Z" fill="#7aa098" stroke="#3a2a14" stroke-width="3"/>`;
    g += `<circle cx="${hx - 4}" cy="${hy + 118}" r="12" fill="#a8201c" stroke="#3a2a14" stroke-width="2"/>`;
    // hills, rivers, forests (inked), towns as towers
    for (let i = 0; i < 20; i++) { const xx = 80 + (i * 173) % 1240, yy = i % 2 ? 80 + (i * 37) % 140 : 780 + (i * 53) % 180; g += `<path d="M${xx - 20},${yy} L${xx},${yy - 18} L${xx + 20},${yy}" stroke="#6a5a3a" stroke-width="2.4" fill="none" opacity="0.7"/>`; }
    g += `<path d="M300,1000 C320,900 260,840 300,760 M760,1000 C740,900 800,800 760,690" stroke="#4a7a8a" stroke-width="4" fill="none" opacity="0.7"/><path d="M600,0 C620,80 560,150 600,240" stroke="#4a7a8a" stroke-width="4" fill="none" opacity="0.7"/>`;
    const tower = (tx, ty, k = 1) => `<g transform="translate(${tx},${ty}) scale(${k})"><rect x="-10" y="-26" width="20" height="26" fill="#8a7450" stroke="#3a2a14" stroke-width="2"/><path d="M-13,-26 L0,-42 L13,-26Z" fill="#a8301c" stroke="#3a2a14" stroke-width="2"/></g>`;
    for (const [tx, ty] of [[220, 200], [640, 230], [1000, 260], [360, 760], [900, 700], [1240, 600], [hx - 4, hy + 150]]) g += tower(tx, ty, 1.1);
    // flags: the lion of England, the lilies of France
    const flag = (fx, fy, col, em) => `<path d="M${fx},${fy} L${fx},${fy - 90}" stroke="#3a2a14" stroke-width="4"/><path d="M${fx},${fy - 90} L${fx + 80},${fy - 84} L${fx + 76},${fy - 40} L${fx},${fy - 46}Z" fill="${col}" stroke="#3a2a14" stroke-width="2"/>` + em(fx + 38, fy - 64);
    g += flag(500, 160, '#b8221a', (ex, ey) => P17.lion(ex, ey + 4, 0.42, '#d8b040')) + flag(560, 880, '#22348a', (ex, ey) => Q.lily(ex, ey + 6, 0.36, '#d8b040'));
    // a compass rose and a frame with a scroll cartouche (blank; the narration says the year)
    g += `<g transform="translate(150,500)"><circle r="70" fill="none" stroke="#3a2a14" stroke-width="3"/>` + [0, 1, 2, 3].map(i => `<path d="M0,0 L${f(Math.cos(i * TAU / 4) * 18)},${f(Math.sin(i * TAU / 4) * 18)} L${f(Math.cos(i * TAU / 4 + TAU / 8) * 80)},${f(Math.sin(i * TAU / 4 + TAU / 8) * 80)}Z" fill="${i % 2 ? '#a8301c' : '#3a2a14'}"/>`).join('') + `</g>`;
    g += `<rect x="14" y="14" width="${W - 28}" height="${H - 28}" fill="none" stroke="#3a2a14" stroke-width="6"/><rect x="26" y="26" width="${W - 52}" height="${H - 52}" fill="none" stroke="#8a2a1c" stroke-width="3"/>`;
    g += `<rect x="0" y="0" width="${W}" height="${H}" fill="url(#${id}v)"/>`;
    // the ship tokens: little carved cogs (red for England, blue for France)
    for (const tk of (o.tokens || [])) g += P17.token(tk.x, tk.y, tk.s || 1, tk.col, tk.rot || 0);
    return g;
  };
  // a carved wooden ship token (local px ~60 long), painted
  P17.token = (x, y, s, col, rot = 0) => `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)}) scale(${fs(s)})"><ellipse cx="2" cy="10" rx="34" ry="9" fill="#000" opacity="0.3"/><path d="M-32,0 C-30,12 30,12 32,0 L26,-6 L-26,-6Z" fill="${col}" ${ol(1.4)}/><path d="M0,-6 L0,-44" stroke="#3a2414" stroke-width="3"/><path d="M-16,-40 L16,-40 L14,-14 L-14,-14Z" fill="#efe4c8" ${ol(1)}/><path d="M-26,-6 L-20,-14 L-8,-14 L-8,-6Z M26,-6 L20,-12 L10,-12 L10,-6Z" fill="${shade(col, -0.3)}"/></g>`;
})(window);
