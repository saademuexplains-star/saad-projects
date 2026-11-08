// "The Royal Fool": the King's great hall, rebuilt as a jewel box (a royal chapel-hall in the manner of the
// Sainte-Chapelle). Same footprint and camera world as sets22 (x right, y up, z from the doors to the throne, cm), so
// every shot keeps its staging; everything the camera sees is new:
//   a soaring ribbed vault painted royal blue and sown with gold stars, gilded ribs and bosses; clustered piers painted
//   blue with gold fleurs-de-lis and gold bands, slender vaulting shafts running up to the ribs; multi-moulded pointed
//   arcades, a triforium band of little arches, tall clerestory windows of two lights and an oculus, glass in deep
//   blues, reds and golds with figure medallions; sun shafts slanting across the nave with dust drifting in them; a
//   polished floor of cream and oxblood lozenges inlaid with lilies, a dark border, the windows and candle flames
//   mirrored in it; a royal-blue runner with gold borders; the dais with gold-nosed steps and a gilded medallion; a
//   great rose window of kings above lancets, the cloth of estate under a crested gold canopy, the throne; the west
//   portal with carved archivolts, jamb statues and a lily tympanum, the minstrels' gallery and its own rose; the
//   Oriflamme and the lily banner hanging in the nave; wrought-iron candelabra. Day or night.
(function (G) {
  const T = G.ST3, { f, rng, shade } = G.RIG, C = G.CINE, PR = G.PROPS, Q = G.QCAST, HL = G.HALL;
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t;
  const ss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  const TAU = Math.PI * 2;
  const { plane, bb } = HL, K = HL.K;
  const W2 = K.W2, AW = K.AW, LEN = K.LEN, PIERS = K.PIERS, DAIS = K.DAIS, THRONE = K.THRONE;
  const PR_R = 46, SPRING = 760, APEX = 1010, STR = 1062, TRI0 = 1090, TRI1 = 1262, CLR0 = 1310, CLR1 = 1800, VS = 1880, VA = 2470, AISLE_H = 1020;
  const BAYS = [0, ...PIERS, LEN];
  const CLOTH = { z: 3192, x: 215, y0: 70, y1: 650, tz: 3010 };
  const rgb = T.rgbOf, hex = T.hexOf, cm = T.cmix, mixC = (a, b, k) => hex(cm(rgb(a), rgb(b), k));
  const PAL = {
    day: { stoneL: '#d6bb8c', stone: '#a68a64', stoneD: '#5e4a3a', shade2: '#221a2e', blue: '#1f3486', blueL: '#3550b4', gold: '#e6b64a', goldL: '#ffe08a', goldD: '#8a5c16', vault: '#22348c', vaultL: '#3d58b8', star: '#f4cc62', tileA: '#d8c6a0', tileB: '#6a1c18', tileC: '#1a1a28', rug: '#1c2e82', red: '#a8222a', haze: '#e8c890', shade: '#2e2848', shadeK: 0.2, glass: 1 },
    night: { stoneL: '#8e6c48', stone: '#644c36', stoneD: '#2f2319', shade2: '#120c16', blue: '#121c4a', blueL: '#1e2c66', gold: '#d6a040', goldL: '#ffd070', goldD: '#5e3c0e', vault: '#0b1236', vaultL: '#16205a', star: '#d8a44a', tileA: '#8e7452', tileB: '#46160f', tileC: '#100c14', rug: '#0f1848', red: '#6a1418', haze: '#2a1a10', shade: '#140c1a', shadeK: 0.26, glass: 0.16 }
  };
  const palette = k => { const o = {}; for (const key in PAL.day) { const a = PAL.day[key], b = PAL.night[key]; o[key] = typeof a === 'string' ? mixC(a, b, k) : lerp(a, b, k); } return o; };
  const envOf = (P, k) => ({ shade: P.shade, shadeK: P.shadeK, haze: P.haze, hazeD: lerp(5600, 3800, k), hazeNear: 500, hazeMax: lerp(0.42, 0.62, k) });
  const GL = ['#1d4fd0', '#c81d2e', '#f0b22c', '#1f8a4c', '#7a32b8', '#2a72e0', '#e0582a', '#1a3a9a'];
  const OLc = (w, op = 0.5) => `stroke="#140c08" stroke-width="${w}" stroke-opacity="${op}" stroke-linejoin="round"`;
  const poly = (cam, pts, fill, x = '') => { const d = T.path(cam, pts); return d ? `<path d="${d}" fill="${fill}" ${x}/>` : ''; };
  const pxw = (cam, P, cm, lo = 0.3, hi = 90) => { const c = cam.toC(P); return c[2] > cam.near ? clamp(cm * cam.fl / c[2], lo, hi) : lo; };
  // (a line's width comes from one point of it; when that point came out from behind the lens the width jumped from a
  // hairline to the 90 px cap in one frame - the runner's gold borders across the floor in DANCE - so for those lines it
  // eases in over the first 150 cm in front of the lens)
  const pxwN = (cam, P, cm, lo = 0.3, hi = 90) => { const c = cam.toC(P); if (c[2] <= cam.near) return lo; const w = clamp(cm * cam.fl / c[2], lo, hi), k = ss(cam.near, cam.near + 150, c[2]); return k >= 1 ? w : lo + (w - lo) * k; };
  const lineN = (cam, pts, col, wcm, x = '') => { const d = T.lineD(cam, pts); if (!d) return ''; const mid = pts[Math.floor(pts.length / 2)]; return `<path d="${d}" stroke="${col}" stroke-width="${f(pxwN(cam, mid, wcm))}" fill="none" stroke-linecap="round" stroke-linejoin="round" ${x}/>`; };
  const line = (cam, pts, col, wcm, x = '') => { const d = T.lineD(cam, pts); if (!d) return ''; const mid = pts[Math.floor(pts.length / 2)]; return `<path d="${d}" stroke="${col}" stroke-width="${f(pxw(cam, mid, wcm))}" fill="none" stroke-linecap="round" stroke-linejoin="round" ${x}/>`; };
  // shared gradients (objectBoundingBox: one definition serves every shape that uses it)
  const sharedDefs = (P, night) => `<defs>` +
    `<linearGradient id="h3Blue" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${shade(P.blue, -0.5)}"/><stop offset="0.38" stop-color="${P.blue}"/><stop offset="0.66" stop-color="${P.blueL}"/><stop offset="1" stop-color="${shade(P.blue, -0.45)}"/></linearGradient>` +
    `<linearGradient id="h3Stone" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${shade(P.stoneD, -0.25)}"/><stop offset="0.45" stop-color="${P.stone}"/><stop offset="0.72" stop-color="${P.stoneL}"/><stop offset="1" stop-color="${shade(P.stoneD, -0.2)}"/></linearGradient>` +
    `<linearGradient id="h3Gold" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${P.goldD}"/><stop offset="0.4" stop-color="${P.gold}"/><stop offset="0.62" stop-color="${P.goldL}"/><stop offset="1" stop-color="${P.goldD}"/></linearGradient>` +
    `<linearGradient id="h3Web" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(P.vault, -0.45)}"/><stop offset="0.55" stop-color="${P.vault}"/><stop offset="1" stop-color="${P.vaultL}"/></linearGradient>` +
    `<linearGradient id="h3WallV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(P.stoneD, -0.35)}"/><stop offset="0.3" stop-color="${P.stone}"/><stop offset="0.7" stop-color="${P.stoneL}"/><stop offset="1" stop-color="${shade(P.stoneD, -0.1)}"/></linearGradient>` +
    `<linearGradient id="h3WallS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(P.stoneD, -0.5)}"/><stop offset="0.35" stop-color="${shade(P.stone, -0.22)}"/><stop offset="0.75" stop-color="${shade(P.stone, -0.08)}"/><stop offset="1" stop-color="${shade(P.stoneD, -0.25)}"/></linearGradient>` +
    `<linearGradient id="h3Velvet" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0c1446"/><stop offset="0.25" stop-color="#2a3ca8"/><stop offset="0.5" stop-color="#1a2a86"/><stop offset="0.75" stop-color="#2c40ae"/><stop offset="1" stop-color="#0c1446"/></linearGradient>` +
    `<radialGradient id="h3Glow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#fff6d8" stop-opacity="0.9"/><stop offset="0.4" stop-color="#ffd890" stop-opacity="0.35"/><stop offset="1" stop-color="#ffb860" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="h3Flame" cx="0.5" cy="0.6" r="0.5"><stop offset="0" stop-color="#ffe6a8" stop-opacity="0.85"/><stop offset="0.5" stop-color="#ffa850" stop-opacity="0.28"/><stop offset="1" stop-color="#ff8a30" stop-opacity="0"/></radialGradient>` +
    `</defs>`;
  let gid = 0;

  // ------------------------------------------------------------ art pieces (local cm, drawn with HL.plane)
  // a little king (or saint) in a stained-glass medallion: crowned head, robe, the glass behind him
  const glassFigure = (r, bg, robe, crown) => `<circle r="${r}" fill="${bg}"/><path d="M${f(-r * 0.42)},${f(r * 0.78)} L${f(-r * 0.26)},${f(-r * 0.08)} L${f(r * 0.26)},${f(-r * 0.08)} L${f(r * 0.42)},${f(r * 0.78)}Z" fill="${robe}"/><circle cy="${f(-r * 0.32)}" r="${f(r * 0.2)}" fill="#f2dcb8"/>` +
    (crown ? `<path d="M${f(-r * 0.2)},${f(-r * 0.5)} l${f(r * 0.08)},${f(-r * 0.16)} l${f(r * 0.06)},${f(r * 0.1)} l${f(r * 0.06)},${f(-r * 0.12)} l${f(r * 0.06)},${f(r * 0.12)} l${f(r * 0.06)},${f(-r * 0.1)} l${f(r * 0.08)},${f(r * 0.16)}Z" fill="#f4c43a"/>` : `<circle cy="${f(-r * 0.36)}" r="${f(r * 0.3)}" fill="none" stroke="#f4c43a" stroke-width="${f(r * 0.07)}"/>`) +
    `<circle r="${r}" fill="none" stroke="#120c08" stroke-width="${f(r * 0.1)}"/>`;
  // the great rose window: a crowned lily at the heart, twelve petals of kings and saints, twenty-four outer foils,
  // stone tracery between; glowing (day) or dim with a little moonlight (night)
  const roseArt2 = (R, night) => {
    const op = night ? 0.32 : 0.95;
    let s = `<circle r="${R}" fill="${night ? '#0a1030' : '#fff4d6'}"/>`;
    s += `<g opacity="${op}">`;
    for (let i = 0; i < 24; i++) { const a = (i + 0.5) / 24 * TAU; s += `<circle cx="${f(Math.cos(a) * R * 0.88)}" cy="${f(Math.sin(a) * R * 0.88)}" r="${f(R * 0.1)}" fill="${GL[(i * 3) % GL.length]}" stroke="#120c08" stroke-width="${f(R * 0.018)}"/>`; }
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, x = Math.cos(a) * R * 0.6, y = Math.sin(a) * R * 0.6; s += `<g transform="translate(${f(x)},${f(y)})">${glassFigure(R * 0.2, i % 2 ? '#1d4fd0' : '#c81d2e', i % 2 ? '#c81d2e' : '#1f3a9a', i % 3 !== 1)}</g>`; }
    for (let i = 0; i < 6; i++) { const a = (i + 0.5) / 6 * TAU; s += `<path d="M0,0 L${f(Math.cos(a - 0.22) * R * 0.38)},${f(Math.sin(a - 0.22) * R * 0.38)} A${f(R * 0.38)},${f(R * 0.38)} 0 0 1 ${f(Math.cos(a + 0.22) * R * 0.38)},${f(Math.sin(a + 0.22) * R * 0.38)}Z" fill="${GL[(i * 5 + 2) % GL.length]}"/>`; }
    s += `<circle r="${f(R * 0.2)}" fill="#1a3aa8"/>` + Q.lily(0, 2, R * 0.0024, '#f4c43a') + `</g>`;
    // the tracery: rings and radiating bars of stone, moulded
    const tr = night ? '#3a2e22' : '#9a8668', trL = night ? '#5a4a34' : '#d8c4a0';
    for (let i = 0; i < 12; i++) { const a = (i + 0.5) / 12 * TAU; s += `<path d="M${f(Math.cos(a) * R * 0.22)},${f(Math.sin(a) * R * 0.22)} L${f(Math.cos(a) * R * 0.97)},${f(Math.sin(a) * R * 0.97)}" stroke="${tr}" stroke-width="${f(R * 0.045)}"/>`; }
    for (const [rr, w] of [[0.22, 0.04], [0.42, 0.035], [0.8, 0.04], [0.99, 0.07]]) s += `<circle r="${f(R * rr)}" fill="none" stroke="${tr}" stroke-width="${f(R * w)}"/><circle r="${f(R * rr)}" fill="none" stroke="${trL}" stroke-width="${f(R * w * 0.3)}" opacity="0.7"/>`;
    s += `<circle r="${f(R * 1.08)}" fill="none" stroke="${tr}" stroke-width="${f(R * 0.12)}"/><circle r="${f(R * 1.15)}" fill="none" stroke="${trL}" stroke-width="${f(R * 0.03)}"/>`;
    for (let i = 0; i < 32; i++) { const a = i / 32 * TAU; s += `<circle cx="${f(Math.cos(a) * R * 1.08)}" cy="${f(Math.sin(a) * R * 1.08)}" r="${f(R * 0.025)}" fill="${night ? '#6a5030' : '#e8c060'}"/>`; }
    if (!night) s += `<circle r="${R}" fill="#fffaf0" opacity="0.16"/>`;
    return s;
  };
  // a lancet of figure glass for the end walls (local, origin at the sill centre, up = -y)
  const lancetArt = (w, h, seed, night) => {
    const r = rng(seed), top = h + w * 0.62, id = 'la' + seed;
    let s = `<defs><clipPath id="${id}"><path d="M${-w / 2},0 L${-w / 2},${-h} Q${-w / 2},${f(-h - w * 0.5)} 0,${f(-top)} Q${w / 2},${f(-h - w * 0.5)} ${w / 2},${-h} L${w / 2},0Z"/></clipPath></defs><g clip-path="url(#${id})">`;
    s += `<rect x="${-w / 2}" y="${f(-top)}" width="${w}" height="${f(top)}" fill="${night ? '#0a1030' : '#fff0d0'}"/>`;
    const op = night ? 0.3 : 0.92;
    for (let y = -40; y > -top; y -= 40) for (let i = 0; i < 3; i++) s += `<rect x="${f(-w / 2 + i * w / 3 + 1)}" y="${y + 1}" width="${f(w / 3 - 2)}" height="38" fill="${GL[Math.floor(r() * GL.length)]}" opacity="${op}"/>`;
    for (const k of [0.25, 0.58]) s += `<g transform="translate(0,${f(-h * k - 20)})" opacity="${op}">${glassFigure(w * 0.36, r() < 0.5 ? '#1d4fd0' : '#c81d2e', '#f0b22c', r() < 0.6)}</g>`;
    for (let y = -40; y > -top; y -= 40) s += `<path d="M${-w / 2},${y} L${w / 2},${y}" stroke="#120c08" stroke-width="2"/>`;
    s += `<path d="M${f(-w / 6)},0 L${f(-w / 6)},${f(-top)} M${f(w / 6)},0 L${f(w / 6)},${f(-top)}" stroke="#120c08" stroke-width="1.6"/>`;
    if (!night) s += `<rect x="${-w / 2}" y="${f(-top)}" width="${w}" height="${f(top)}" fill="#fff8e4" opacity="0.14"/>`;
    s += `</g><path d="M${-w / 2},0 L${-w / 2},${-h} Q${-w / 2},${f(-h - w * 0.5)} 0,${f(-top)} Q${w / 2},${f(-h - w * 0.5)} ${w / 2},${-h} L${w / 2},0" fill="none" stroke="${night ? '#3a2e22' : '#9a8668'}" stroke-width="10"/>`;
    return s;
  };
  // a stone statue of a king or saint on a corbel under a little canopy (local, origin at its feet)
  const statueArt = (seed, night) => {
    const r = rng(seed), st = night ? '#5a4836' : '#c8b490', sd = night ? '#2a2018' : '#8a7458', crown = r() < 0.6;
    let s = `<path d="M-26,0 L26,0 L20,14 L-20,14Z" fill="${sd}"/><path d="M-22,0 C-24,-60 -20,-118 -14,-140 L14,-140 C20,-118 24,-60 22,0Z" fill="${st}" stroke="#140c08" stroke-width="1" stroke-opacity="0.5"/>`;
    for (const x of [-12, -4, 5, 13]) s += `<path d="M${x},-130 C${x - 2},-90 ${x + 2},-40 ${x - 1},-2" stroke="${sd}" stroke-width="2.4" fill="none" opacity="0.8"/>`;
    s += `<circle cy="-152" r="12" fill="${st}" stroke="#140c08" stroke-width="1" stroke-opacity="0.5"/>` + (crown ? `<path d="M-11,-160 L-11,-172 L-6,-166 L0,-174 L6,-166 L11,-172 L11,-160Z" fill="${night ? '#8a6a30' : '#e0b04a'}"/>` : `<circle cy="-154" r="17" fill="none" stroke="${night ? '#8a6a30' : '#e0b04a'}" stroke-width="2.5"/>`);
    s += `<path d="M-30,-182 L30,-182 L24,-196 L0,-222 L-24,-196Z" fill="${sd}" stroke="#140c08" stroke-width="1" stroke-opacity="0.5"/><path d="M-24,-196 L-24,-210 M24,-196 L24,-210 M0,-222 L0,-236" stroke="${sd}" stroke-width="3"/>`;
    return s;
  };
  // the throne, carved and gilded (local cm; origin at the front of its base on the dais, up = -y). Same seat (48),
  // arms (lion knobs at x +-41, y -80) and back as before, so the King still fits it
  const throneArt2 = (night) => {
    const g = night ? '#c08a30' : '#e2b040', gD = night ? '#5a3a0e' : '#8a5a14', gL = night ? '#f0c060' : '#fff0a0';
    let s = `<defs><linearGradient id="t2G" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${gD}"/><stop offset="0.3" stop-color="${gL}"/><stop offset="0.55" stop-color="${g}"/><stop offset="1" stop-color="${gD}"/></linearGradient>` +
      `<linearGradient id="t2V" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0e1650"/><stop offset="0.4" stop-color="#2c40ae"/><stop offset="0.7" stop-color="#22348e"/><stop offset="1" stop-color="#0e1650"/></linearGradient></defs>`;
    // the back: a tall gable with crockets and pinnacles, a velvet panel embroidered with lilies, a gold border
    s += `<path d="M-52,-44 L-52,-236 L-40,-236 L0,-300 L40,-236 L52,-236 L52,-44Z" fill="url(#t2G)" ${OLc(1.4, 0.6)}/>`;
    s += `<path d="M-39,-56 L-39,-226 L0,-280 L39,-226 L39,-56Z" fill="url(#t2V)" ${OLc(1, 0.5)}/><path d="M-34,-62 L-34,-222 L0,-270 L34,-222 L34,-62Z" fill="none" stroke="${g}" stroke-width="1.6" stroke-dasharray="4 3"/>`;
    for (let y = -80, row = 0; y > -224; y -= 24, row++) for (let x = -24 + (row % 2) * 12; x <= 24; x += 24) s += Q.lily(x, y, 0.28, g);
    for (let i = 0; i < 7; i++) { const u = i / 6, x = lerp(-40, 0, u), y = lerp(-236, -300, u); s += `<path d="M${f(x)},${f(y)} q-6,-4 -4,-10 q4,2 4,10Z" fill="${g}"/>`; s += `<path d="M${f(-x)},${f(y)} q6,-4 4,-10 q-4,2 -4,10Z" fill="${g}"/>`; }
    for (const x of [-52, 52]) s += `<rect x="${x - 7}" y="-268" width="14" height="40" fill="url(#t2G)" ${OLc(1, 0.5)}/><path d="M${x - 7},-268 L${x},-292 L${x + 7},-268Z" fill="${g}" ${OLc(0.8, 0.5)}/>` + Q.lily(x, -298, 0.3, g);
    s += Q.lily(0, -312, 0.5, g) + `<circle cx="0" cy="-252" r="8" fill="#a8222a" stroke="${g}" stroke-width="2"/>`;
    // the seat: a red cushion, the gilded box with an arcade of tracery and a lily shield
    s += `<rect x="-47" y="-54" width="94" height="12" rx="5" fill="#9a1c26" ${OLc(1, 0.5)}/><path d="M-44,-50 L44,-50" stroke="#e86a60" stroke-width="2" opacity="0.5"/>`;
    s += `<rect x="-52" y="-44" width="104" height="44" fill="url(#t2G)" ${OLc(1.2, 0.6)}/>`;
    for (let i = 0; i < 6; i++) { const x0 = -46 + i * 15.5; s += `<path d="M${f(x0)},-6 L${f(x0)},-24 Q${f(x0 + 6.5)},-36 ${f(x0 + 13)},-24 L${f(x0 + 13)},-6Z" fill="${gD}" opacity="0.75"/>`; }
    // the arms: gilded posts, lion heads with flame-like manes on the front of each arm, lion paws at the feet
    for (const sd of [-1, 1]) {
      const x0 = sd * 34, xm = sd * 41;
      s += `<rect x="${Math.min(x0, sd * 48)}" y="-76" width="14" height="76" fill="url(#t2G)" ${OLc(1, 0.55)}/><rect x="${Math.min(x0, sd * 48) - 2}" y="-80" width="18" height="8" rx="3" fill="${gL}" ${OLc(0.8, 0.5)}/>`;
      let mane = ''; for (let i = 0; i < 11; i++) { const a = i / 11 * TAU, rr = 10.5; mane += `<path d="M${f(xm + Math.cos(a) * 6)},${f(-80 + Math.sin(a) * 6)} Q${f(xm + Math.cos(a + 0.3) * rr * 1.25)},${f(-80 + Math.sin(a + 0.3) * rr * 1.25)} ${f(xm + Math.cos(a + 0.5) * rr)},${f(-80 + Math.sin(a + 0.5) * rr)}" stroke="${gD}" stroke-width="3" fill="none" stroke-linecap="round"/>`; }
      // (a stern carved heraldic face - heavy brow, deep-set eyes, muzzle, set mouth - not a smiling cartoon sun)
      s += `<circle cx="${xm}" cy="-80" r="10" fill="${g}" ${OLc(0.8, 0.5)}/>` + mane + `<ellipse cx="${xm}" cy="-78" rx="5.5" ry="6.5" fill="${gL}"/>` +
        `<path d="M${xm - 4.6},-82.6 L${xm - 1},-81 M${xm + 4.6},-82.6 L${xm + 1},-81" stroke="#3a2406" stroke-width="1.4" stroke-linecap="round"/>` +
        `<circle cx="${xm - 2.4}" cy="-80.4" r="0.95" fill="#2a1804"/><circle cx="${xm + 2.4}" cy="-80.4" r="0.95" fill="#2a1804"/>` +
        `<ellipse cx="${xm - 1.8}" cy="-75.6" rx="1.9" ry="1.3" fill="${g}"/><ellipse cx="${xm + 1.8}" cy="-75.6" rx="1.9" ry="1.3" fill="${g}"/>` +
        `<path d="M${xm - 1.6},-78.4 L${xm + 1.6},-78.4 L${xm},-76.7Z" fill="#3a2406"/><path d="M${xm - 2.6},-74 Q${xm},-75.1 ${xm + 2.6},-74" stroke="#3a2406" stroke-width="0.9" fill="none"/>`;
      s += `<path d="M${sd * 41 - 8},0 C${sd * 41 - 8},-8 ${sd * 41 + 8},-8 ${sd * 41 + 8},0Z" fill="${g}" ${OLc(0.8, 0.5)}/>`;
    }
    // the footstool, blue velvet with a gold edge
    s += `<rect x="-32" y="2" width="64" height="12" rx="3" fill="url(#t2V)" ${OLc(1, 0.5)}/><path d="M-32,4 L32,4" stroke="${g}" stroke-width="1.6"/>`;
    return s;
  };
  HL.throneArt = throneArt2;
  // the Oriflamme (vermilion, swallow-tailed, gold flames) and the lily banner (blue, sown with lilies, gold fringe)
  const bannerArt2 = (w, h, sway, kind, id) => {
    const b = sway;
    if (kind === 'ori') {
      let s = `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7a1008"/><stop offset="0.35" stop-color="#e8401c"/><stop offset="0.7" stop-color="#c82a14"/><stop offset="1" stop-color="#6a0e06"/></linearGradient></defs>`;
      s += `<path d="M${-w / 2},0 L${w / 2},0 L${f(w / 2 + b)},${f(h * 0.72)} L${f(w * 0.18 + b)},${h} L${f(b)},${f(h * 0.66)} L${f(-w * 0.18 + b)},${h} L${f(-w / 2 + b)},${f(h * 0.72)}Z" fill="url(#${id})" ${OLc(2, 0.6)}/>`;
      for (let i = 0; i < 7; i++) { const y = 40 + i * h * 0.085, x = b * y / h; s += `<path d="M${f(x)},${f(y)} q-10,-14 0,-30 q10,16 0,30Z" fill="#f4c43a" opacity="0.85"/>`; }
      s += `<rect x="${-w / 2 - 10}" y="-7" width="${w + 20}" height="14" rx="6" fill="#d8a838" ${OLc(1.5, 0.6)}/>` + [-w / 2 - 6, w / 2 + 6].map(x => `<path d="M${x},6 L${x},46" stroke="#1f6a3a" stroke-width="5"/><circle cx="${x}" cy="50" r="7" fill="#1f6a3a"/>`).join('');
      return s;
    }
    let s = `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0e1648"/><stop offset="0.35" stop-color="#2a40b0"/><stop offset="0.7" stop-color="#1f3288"/><stop offset="1" stop-color="#0c1240"/></linearGradient></defs>`;
    s += `<path d="M${-w / 2},0 L${w / 2},0 L${f(w / 2 + b)},${f(h - 40)} L${f(b)},${h} L${f(-w / 2 + b)},${f(h - 40)}Z" fill="url(#${id})" ${OLc(2, 0.6)}/>`;
    for (let y = 46, row = 0; y < h - 60; y += 50, row++) for (let x = -w / 2 + 20 + (row % 2) * 18; x < w / 2 - 12; x += 36) s += Q.lily(x + b * y / h, y, 0.44, '#f0c040');
    s += `<path d="M${f(-w / 2 + b)},${f(h - 40)} L${f(b)},${h} L${f(w / 2 + b)},${f(h - 40)}" stroke="#f0c040" stroke-width="6" fill="none"/>`;
    s += `<rect x="${-w / 2 - 10}" y="-7" width="${w + 20}" height="14" rx="6" fill="#d8a838" ${OLc(1.5, 0.6)}/>`;
    return s;
  };
  // a tapestry: a millefleur ground with a unicorn and a lion either side of a crowned lily shield
  const tapestryArt2 = (w, h, seed, night) => {
    const r = rng(seed), dk = night ? 0.45 : 0;
    let s = `<rect x="${-w / 2}" y="0" width="${w}" height="${h}" fill="${shade('#1a3e2c', -dk)}" ${OLc(2, 0.6)}/>`;
    for (let i = 0; i < 170; i++) s += `<circle cx="${f(-w / 2 + 16 + r() * (w - 32))}" cy="${f(16 + r() * (h - 32))}" r="${f(2 + r() * 3)}" fill="${['#e8d8a0', '#c84a3a', '#f0e8d8', '#d8a040', '#8ab0d8'][i % 5]}" opacity="${night ? 0.4 : 0.8}"/>`;
    s += `<path d="M-50,${h * 0.3} L50,${h * 0.3} L50,${h * 0.52} C50,${h * 0.66} 18,${h * 0.72} 0,${h * 0.76} C-18,${h * 0.72} -50,${h * 0.66} -50,${h * 0.52}Z" fill="${shade('#1f3a9a', -dk)}" stroke="#d8b040" stroke-width="4"/>`;
    for (const [x, y] of [[-22, 0.4], [22, 0.4], [0, 0.58]]) s += Q.lily(x, h * y, 0.46, '#e8c048');
    s += `<path d="M-34,${h * 0.28} L-34,${h * 0.21} L-17,${h * 0.25} L0,${h * 0.18} L17,${h * 0.25} L34,${h * 0.21} L34,${h * 0.28}Z" fill="#d8b040"/>`;
    // the beasts (simple heraldic silhouettes): a white unicorn on the left, a gold lion on the right
    s += `<path d="M-130,${h * 0.62} C-128,${h * 0.5} -100,${h * 0.46} -80,${h * 0.48} L-66,${h * 0.36} L-62,${h * 0.48} C-58,${h * 0.56} -70,${h * 0.62} -78,${h * 0.62} L-80,${h * 0.74} L-90,${h * 0.74} L-92,${h * 0.64} L-116,${h * 0.64} L-118,${h * 0.74} L-128,${h * 0.74}Z" fill="${night ? '#8a8478' : '#f0ece0'}"/><path d="M-66,${h * 0.36} L-52,${h * 0.28}" stroke="#d8b040" stroke-width="3"/>`;
    s += `<path d="M130,${h * 0.62} C128,${h * 0.5} 104,${h * 0.46} 86,${h * 0.5} C76,${h * 0.42} 62,${h * 0.44} 64,${h * 0.52} C66,${h * 0.58} 76,${h * 0.6} 80,${h * 0.62} L82,${h * 0.74} L92,${h * 0.74} L94,${h * 0.65} L116,${h * 0.65} L118,${h * 0.74} L128,${h * 0.74}Z" fill="${night ? '#8a6a30' : '#e0b040'}"/>`;
    s += `<rect x="${-w / 2 + 8}" y="8" width="${w - 16}" height="${h - 16}" fill="none" stroke="#8a2a24" stroke-width="12"/><rect x="${-w / 2 + 8}" y="8" width="${w - 16}" height="${h - 16}" fill="none" stroke="#d8b040" stroke-width="2.5" stroke-dasharray="10 6"/>`;
    return s;
  };
  // a wrought-iron candelabrum (local cm, origin at its foot): tripod with scrolls, a twisted stem, a crown of candles
  const standArt2 = () => {
    let s = `<path d="M-30,0 C-24,-6 -10,-14 0,-30 C10,-14 24,-6 30,0" stroke="#1a1612" stroke-width="4" fill="none"/><path d="M-30,0 q-6,-8 2,-12 M30,0 q6,-8 -2,-12" stroke="#1a1612" stroke-width="2.5" fill="none"/>`;
    s += `<path d="M0,-30 L0,-176" stroke="#1a1612" stroke-width="4.5"/>` + [-60, -100, -140].map(y => `<ellipse cx="0" cy="${y}" rx="5" ry="3" fill="#2a2420"/>`).join('');
    s += `<path d="M-34,-176 C-34,-190 34,-190 34,-176" stroke="#1a1612" stroke-width="3" fill="none"/><path d="M-30,-176 q-10,6 -4,14 M30,-176 q10,6 4,14" stroke="#1a1612" stroke-width="2.2" fill="none"/><ellipse cx="0" cy="-178" rx="36" ry="5" fill="#2a2420" ${OLc(0.8, 0.5)}/>`;
    for (let i = 0; i < 7; i++) { const x = -30 + i * 10, h = 20 + ((i * 7) % 3) * 4; s += `<rect x="${x - 2.4}" y="${-178 - h}" width="4.8" height="${h}" rx="1.4" fill="#f2e8d0" ${OLc(0.5, 0.4)}/><path d="M${x - 2.4},${-178 - h + 6} q-1,4 0,8" stroke="#e8dcc0" stroke-width="1.4" fill="none"/>`; }
    return s;
  };
  const standFlames2 = (tr, t, seed, k) => { let s = ''; for (let i = 0; i < 7; i++) { const x = -30 + i * 10, h = 20 + ((i * 7) % 3) * 4, fl = 1 + 0.14 * Math.sin(t * (9 + i) + seed + i * 2); s += `<path d="M${x},${-178 - h - 1} q-3,-4 0,${f(-11 * fl)} q3,${f(6 * fl)} 0,${f(11 * fl)}Z" fill="#ffc860"/><path d="M${x},${-178 - h - 1} q-1.4,-2.6 0,${f(-6 * fl)} q1.4,2.6 0,${f(6 * fl)}Z" fill="#fffae0"/>`; } return `<g transform="${tr}" opacity="${f(k)}">${s}</g>`; };

  // ------------------------------------------------------------ pieces in 3D
  // a lancet window pair with an oculus in a side wall (plane x), truly projected; lit 0..1 (sun behind it)
  const glassWin = (cam, x, zc, y0, w, h, seed, lit, night, E) => {
    const r = rng(seed), W = (u, v) => [x, y0 + v, zc + u], d = cam.dist(W(0, h / 2));
    const lw2 = w * 0.42, gap = w * 0.16, oc = w * 0.24;
    const sizePx = w * cam.fl / Math.max(60, cam.toC(W(0, h / 2))[2]);
    // (one layout at every size - the panes, the leading and the medallion fade in with size instead of switching on, so
    // a window never pops as the camera travels; every random number is drawn whatever is shown)
    const md = ss(45, 75, sizePx), lk = ss(22, 48, sizePx);
    const op = night ? 0.28 : 0.55 + 0.42 * lit;
    const head = (u0, u1, hh) => { const pts = []; for (let i = 0; i <= 8; i++) { const a = i / 8; pts.push([lerp(u1, u0, a), hh + (u1 - u0) * 0.7 * Math.sin(Math.PI * a) ** 0.8]); } return pts; };
    let s = '';
    for (const [u0, u1] of [[-w / 2, -w / 2 + lw2], [w / 2 - lw2, w / 2]]) {
      const outline = [[u0, 0], [u1, 0], ...head(u0, u1, h)].map(([u, v]) => W(u, v));
      s += poly(cam, outline, night ? '#0a1030' : mixC('#f8e8c0', '#ffffff', lit * 0.4));
      {
        const rows = Math.round(h / 60), cols = 3, ph = h / rows;
        for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { const a0 = lerp(u0, u1, i / cols) + 1.5, a1 = lerp(u0, u1, (i + 1) / cols) - 1.5, gc = GL[Math.floor(r() * GL.length)]; s += poly(cam, [W(a0, j * ph + 2), W(a1, j * ph + 2), W(a1, (j + 1) * ph - 2), W(a0, (j + 1) * ph - 2)], gc, `opacity="${f(op)}"`); }
        // a medallion figure in each light
        const mcol = r() < 0.5 ? '#1d4fd0' : '#c81d2e', mcr = r() < 0.6;
        if (md > 0.01) { const mc = W((u0 + u1) / 2, h * 0.55), m = cam.toC(mc); if (m[2] > cam.near + 10) { const pp = cam.scr(m), rad = (u1 - u0) * 0.32 * cam.fl / m[2]; s += `<g transform="translate(${f(pp[0])},${f(pp[1])}) scale(${(Math.max(0.2, Math.abs(Math.sin(Math.atan2(cam.x - x, cam.z - zc))))).toFixed(4)},1)" opacity="${f(op * md)}">${glassFigure(rad, mcol, '#f0b22c', mcr)}</g>`; } }
        if (lk > 0.01) { let lead = ''; for (let j = 1; j < rows; j++) { const dd = T.lineD(cam, [W(u0, j * ph), W(u1, j * ph)]); if (dd) lead += dd; } if (lead) s += `<path d="${lead}" stroke="#120c08" stroke-width="${f(pxw(cam, W(0, h / 2), 2.4, 0.3, 3))}" fill="none" opacity="${f(0.8 * lk)}"/>`; }
        s += poly(cam, head(u0, u1, h).map(([u, v]) => W(u, v)).concat([W(u1, h), W(u0, h)]), night ? '#1a1430' : '#f0b22c', `opacity="${f(op * 0.9)}"`);
      }
      if (!night && lit > 0.2) s += poly(cam, outline, '#fff6e0', `opacity="${f(0.22 * lit)}"`);
      const fr = T.lineD(cam, [...outline, outline[0]]); if (fr) s += `<path d="${fr}" stroke="${T.tone(E, night ? '#3a2e22' : '#a08a6a', d, 's')}" stroke-width="${f(pxw(cam, W(0, h / 2), 9, 0.5, 30))}" fill="none" stroke-linejoin="round"/>`;
    }
    // the oculus over the two lights
    const oc0 = cam.toC(W(0, h + w * 0.55)); if (oc0[2] > cam.near + 10) { const pts = T.ring(W(0, h + w * 0.55), [0, 0, oc], [0, oc, 0], 14); s += poly(cam, pts, night ? '#1a1430' : GL[seed % GL.length], `opacity="${f(op)}"`); const rr = T.lineD(cam, [...pts, pts[0]]); if (rr) s += `<path d="${rr}" stroke="${T.tone(E, night ? '#3a2e22' : '#a08a6a', d, 's')}" stroke-width="${f(pxw(cam, W(0, h), 7, 0.4, 24))}" fill="none"/>`; }
    // the outer arch and its moulding round the whole window
    const out = [[-w / 2 - 14, -6], [w / 2 + 14, -6], ...head(-w / 2 - 14, w / 2 + 14, h)].map(([u, v]) => W(u, v)), od = T.lineD(cam, out.slice(1));
    if (od) s += `<path d="${od}" stroke="${T.tone(E, night ? '#5a4632' : '#d8c29a', d, 's')}" stroke-width="${f(pxw(cam, W(0, h), 10, 0.5, 30))}" fill="none"/>`;
    return s;
  };
  // a clustered pier: a central shaft painted blue and sown with gold lilies between gold bands, two slender stone side
  // shafts, a moulded base on a plinth with its shadow on the floor, a gilded foliage capital
  const pier2 = (cam, x, z, d, P, E, night) => {
    const tone = (c, k = 's') => T.tone(E, c, d, k);
    const vx = cam.x - x, vz = cam.z - z, vn = Math.hypot(vx, vz) || 1, ux = vx / vn, uz = vz / vn, px = -uz, pz = ux;
    const seg = (ox, oz, y0, y1, r, fill, op = 1) => {
      const a = cam.toC([x + ox, y0, z + oz]), b = cam.toC([x + ox, y1, z + oz]); if (a[2] < cam.near + 5 || b[2] < cam.near + 5) return '';
      const pa = cam.scr(a), pb = cam.scr(b), ra = r * cam.fl / a[2], rb = r * cam.fl / b[2];
      return `<path d="M${f(pa[0] - ra)},${f(pa[1])} L${f(pa[0] + ra)},${f(pa[1])} L${f(pb[0] + rb)},${f(pb[1])} L${f(pb[0] - rb)},${f(pb[1])}Z" fill="${fill}" opacity="${op}" ${OLc(f(pxw(cam, [x, y0, z], 1.2, 0.3, 2)), 0.45)}/>`;
    };
    if (cam.toC([x, SPRING, z])[2] < cam.near + 5 && cam.toC([x, 0, z])[2] < cam.near + 5) return '';
    let s = '';
    // the shadow it lays on the floor
    const fp = cam.toC([x, 0, z]); if (fp[2] > cam.near + 5) { const p = cam.scr(fp), k = cam.fl / fp[2]; s += `<ellipse cx="${f(p[0])}" cy="${f(p[1])}" rx="${f(PR_R * 2.2 * k)}" ry="${f(Math.max(1, PR_R * 2.2 * k * clamp(cam.y / Math.max(100, fp[2]), 0.05, 1)))}" fill="#000" opacity="0.35"/>`; }
    for (const sd of [-1, 1]) s += seg(px * sd * PR_R * 1.08, pz * sd * PR_R * 1.08, 60, SPRING - 30, PR_R * 0.42, 'url(#h3Stone)');
    s += seg(0, 0, 0, 30, PR_R + 22, 'url(#h3Stone)') + seg(0, 0, 30, 46, PR_R + 14, tone(P.stoneD)) + seg(0, 0, 46, 62, PR_R + 8, 'url(#h3Gold)');
    s += seg(0, 0, 62, SPRING - 58, PR_R, 'url(#h3Blue)');
    // gold bands and the lilies on the face toward us
    for (const yb of [190, 420, SPRING - 70]) s += seg(0, 0, yb - 5, yb + 5, PR_R + 1.5, 'url(#h3Gold)');
    // the lilies are fixed on the shaft (eight round it, each row turned half a step), foreshortened and fading out as
    // they turn away round the curve; the whole sowing fades in with the pier's size on screen (no switching on)
    const bigK = ss(7, 11, pxw(cam, [x, 300, z], PR_R));
    if (bigK > 0.01) {
      let lil = '';
      for (let yy = 100, row = 0; yy < SPRING - 90; yy += 46, row++) {
        if (Math.abs(yy - 190) < 20 || Math.abs(yy - 420) < 20) continue;
        for (let j = 0; j < 8; j++) {
          const a = (j + (row % 2) * 0.5) * TAU / 8, ca = Math.cos(a), sa = Math.sin(a), face = ca * ux + sa * uz;
          if (face < 0.08) continue;
          const c = cam.toC([x + ca * PR_R * 0.98, yy, z + sa * PR_R * 0.98]); if (c[2] < cam.near + 5) continue;
          const p = cam.scr(c), sc = cam.fl / c[2] * 0.16;
          lil += `<g transform="translate(${f(p[0])},${f(p[1])}) scale(${face.toFixed(4)},1)" opacity="${f(ss(0.08, 0.4, face))}">${Q.lily(0, 0, sc, night ? '#a88030' : '#f0c448')}</g>`;
        }
      }
      s += bigK < 0.99 ? `<g opacity="${f(bigK)}">${lil}</g>` : lil;
    }
    const big = bigK > 0.01;
    // the capital: a bell of gilded leaves under a square abacus
    s += seg(0, 0, SPRING - 58, SPRING - 8, PR_R + 10, 'url(#h3Gold)') + seg(0, 0, SPRING - 8, SPRING + 12, PR_R + 26, tone(P.stoneL)) + seg(0, 0, SPRING + 12, SPRING + 26, PR_R + 30, tone(P.stone));
    const cp = cam.toC([x + ux * PR_R, SPRING - 30, z + uz * PR_R]);
    if (cp[2] > cam.near + 5 && big) { const p = cam.scr(cp), k = cam.fl / cp[2]; let lv = ''; for (let i = -2; i <= 2; i++) lv += `<path d="M${f(p[0] + i * 13 * k)},${f(p[1] + 18 * k)} q${f(-8 * k)},${f(-16 * k)} ${f(2 * k)},${f(-34 * k)} q${f(4 * k)},${f(10 * k)} ${f(10 * k)},${f(4 * k)} q${f(-4 * k)},${f(14 * k)} ${f(-12 * k)},${f(30 * k)}Z" fill="${night ? '#8a6020' : '#f4cc5a'}" stroke="#5a3a0a" stroke-width="${f(Math.max(0.3, 0.8 * k))}"/>`; s += bigK < 0.99 ? `<g opacity="${f(bigK)}">${lv}</g>` : lv; }
    // the vaulting shaft rising from the capital up the wall to the ribs
    const sx = x > 0 ? x - 16 : x + 16;
    s += line(cam, [[sx, SPRING + 26, z], [sx, VS, z]], tone(P.stoneL), 14) + line(cam, [[sx, SPRING + 26, z], [sx, VS, z]], night ? '#7a5a24' : '#d8a840', 4);
    return s;
  };

  // ------------------------------------------------------------ the hall
  HL.draw = (cam, t, o = {}) => {
    const nk = o.night || 0, P = palette(nk), E = envOf(P, nk), night = nk > 0.5;
    const tone = (c, d, kind = 'g') => T.tone(E, c, d, kind), D = p => cam.dist(p);
    const items = [];
    let back = '', shell = sharedDefs(P, night), light = '';
    // ---- the antechamber beyond the doors: a stair rising into torchlight
    {
      const z1 = -760, hx = 320, hy = 660;
      const q = (pts, c, k) => poly(cam, pts, tone(c, D(pts[0]), k));
      back += q([[-hx, 0, z1], [hx, 0, z1], [hx, hy, z1], [-hx, hy, z1]], '#3a2618', 'd') + q([[-hx, hy, 0], [hx, hy, 0], [hx, hy, z1], [-hx, hy, z1]], '#1a100a', 'd');
      for (const sd of [-1, 1]) back += q([[sd * hx, 0, 0], [sd * hx, 0, z1], [sd * hx, hy, z1], [sd * hx, hy, 0]], '#2e1e12', 'd');
      for (let i = 0; i < 8; i++) { const zz = -260 - i * 60, yy = i * 34; back += q([[-200, yy, zz], [200, yy, zz], [200, yy + 34, zz], [-200, yy + 34, zz]], '#4a3220', 's') + q([[-200, yy + 34, zz], [200, yy + 34, zz], [200, yy + 34, zz - 60], [-200, yy + 34, zz - 60]], '#5a3e28', 'g'); }
      back += q([[-hx, 0, 0], [hx, 0, 0], [hx, 0, -260], [-hx, 0, -260]], '#241810', 'g');
      for (const tx of [-250, 250]) { const tb = bb(cam, [tx, 280, -200]); if (tb) back += PR.flame(tb.x, tb.y, 0.6 * tb.k, t + tx) + C.radial(tb.x, tb.y, 320 * tb.k, '#ffa040', 0.5, 'screen'); }
    }
    // ---- the vault: per bay a blue web sown with gold stars, gilded diagonal and transverse ribs, a boss
    const vArc = (z, a) => [-W2 + 2 * W2 * a, VS + (VA - VS) * Math.sin(Math.PI * a) ** 0.62, z];
    const vDiag = (z0, z1, a, flip) => [flip ? W2 - 2 * W2 * a : -W2 + 2 * W2 * a, VS + (VA - VS) * Math.sin(Math.PI * a) ** 0.62, lerp(z0, z1, a)];
    const bays = []; for (let i = 0; i < BAYS.length - 1; i++) bays.push({ z0: BAYS[i], z1: BAYS[i + 1], d: D([0, VA, (BAYS[i] + BAYS[i + 1]) / 2]) });
    bays.sort((a, b) => b.d - a.d);
    let vault = '', ribs = '';
    for (const B of bays) {
      const N = 14, pts = [];
      for (let i = 0; i <= N; i++) pts.push(vArc(B.z0, i / N)); for (let i = N; i >= 0; i--) pts.push(vArc(B.z1, i / N));
      vault += poly(cam, pts, 'url(#h3Web)');
      // the four cells read through a softer shade along each diagonal (the webs fold)
      const r = rng(Math.round(B.z0) + 5);
      for (let i = 0; i < 34; i++) {
        const a = 0.06 + r() * 0.88, b = r(), p0 = vArc(B.z0, a), p1 = vArc(B.z1, a), P3 = [lerp(p0[0], p1[0], b), lerp(p0[1], p1[1], b) - 4, lerp(p0[2], p1[2], b)], c = cam.toC(P3);
        if (c[2] < cam.near + 10) continue; const p = cam.scr(c), k = cam.fl / c[2] * 7, tw = (0.6 + 0.4 * Math.sin(t * 2 + i * 1.7)) * ss(0.4, 0.8, k);
        if (tw < 0.01) continue;
        vault += `<path d="M${f(p[0])},${f(p[1] - k)} L${f(p[0] + k * 0.3)},${f(p[1] - k * 0.3)} L${f(p[0] + k)},${f(p[1])} L${f(p[0] + k * 0.3)},${f(p[1] + k * 0.3)} L${f(p[0])},${f(p[1] + k)} L${f(p[0] - k * 0.3)},${f(p[1] + k * 0.3)} L${f(p[0] - k)},${f(p[1])} L${f(p[0] - k * 0.3)},${f(p[1] - k * 0.3)}Z" fill="${P.star}" opacity="${f(tw)}"/>`;
      }
      for (const fl of [false, true]) { const dp = []; for (let i = 0; i <= N; i++) dp.push(vDiag(B.z0, B.z1, i / N, fl)); ribs += line(cam, dp, '#2a1a08', 26) + line(cam, dp, night ? '#a87828' : '#e8b848', 16) + line(cam, dp, night ? '#d8a040' : '#fff0a0', 4, 'opacity="0.6"'); }
      const bp = cam.toC([0, VA - 6, (B.z0 + B.z1) / 2]); if (bp[2] > cam.near + 10) { const p = cam.scr(bp), k = cam.fl / bp[2]; ribs += `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="${f(24 * k)}" fill="${night ? '#a87828' : '#f0c048'}" stroke="#3a2408" stroke-width="${f(Math.max(0.4, 2 * k))}"/><circle cx="${f(p[0])}" cy="${f(p[1])}" r="${f(11 * k)}" fill="#a8222a"/>` + Q.lily(p[0], p[1] + k * 2, k * 0.14, night ? '#a87828' : '#f0c048'); }
    }
    for (const z of BAYS) { const tp = []; for (let i = 0; i <= 14; i++) tp.push(vArc(z, i / 14)); ribs += line(cam, tp, '#2a1a08', 34) + line(cam, tp, night ? '#a87828' : '#e8b848', 22) + line(cam, tp, night ? '#d8a040' : '#fff0a0', 5, 'opacity="0.6"'); }
    ribs += line(cam, [[0, VA - 2, 0], [0, VA - 2, LEN]], night ? '#a87828' : '#e8b848', 12);
    shell += vault + ribs;
    // ---- the aisles seen through the arcades: outer walls with sunlit windows, a dark aisle vault
    const winOut = [];
    for (const sd of [-1, 1]) {
      const x = sd * AW, d = D([x, 500, cam.z + 1200]);
      shell += poly(cam, [[x, 0, 0], [x, 0, LEN], [x, AISLE_H, LEN], [x, AISLE_H, 0]], tone(shade(P.stoneD, -0.38), d, 'd'));
      shell += poly(cam, [[x, AISLE_H, 0], [x, AISLE_H, LEN], [sd * W2, AISLE_H + 220, LEN], [sd * W2, AISLE_H + 220, 0]], tone(P.vault, d, 'd'));
      for (let zb = 200; zb < LEN; zb += 400) winOut.push({ d: D([x, 600, zb]), svg: glassWin(cam, x - sd * 2, zb, 300, 190, 520, 2200 + zb + (sd > 0 ? 7 : 0), sd > 0 ? 1 : 0.35, night, E) });
      shell += poly(cam, [[sd * W2, 0, 0], [x, 0, 0], [x, 0, LEN], [sd * W2, 0, LEN]], tone(P.tileC, d, 'g'));
    }
    shell += winOut.sort((a, b) => b.d - a.d).map(w => w.svg).join('');
    // ---- the throne end wall: rose window over figure lancets, a gilded frieze, the cloth of estate, its canopy
    {
      const z = LEN, d = D([0, 900, z]);
      const outline = [[-W2, 0, z], [W2, 0, z]]; for (let i = 14; i >= 0; i--) outline.push(vArc(z, i / 14));
      shell += poly(cam, outline, 'url(#h3WallV)');
      for (const sd of [-1, 1]) shell += poly(cam, [[sd * W2, 0, z], [sd * AW, 0, z], [sd * AW, AISLE_H, z], [sd * W2, AISLE_H + 220, z]], tone(P.stoneD, d, 's'));
      let crs = ''; for (let y = 60; y < VS; y += 60) { const dd = T.lineD(cam, [[-W2, y, z - 1], [W2, y, z - 1]]); if (dd) crs += dd; }
      if (crs) shell += `<path d="${crs}" stroke="${tone(shade(P.stone, -0.3), d, 's')}" stroke-width="${f(pxw(cam, [0, 900, z], 1.6, 0.3, 2))}" fill="none" opacity="0.4"/>`;
      // the rose and its glow
      const rc = [0, 1540, z - 2], rp = cam.proj(rc);
      if (rp && !night) light += C.radial(rp[0], rp[1], pxw(cam, rc, 900, 20, 3000), '#ffe0a0', 0.32, 'screen');
      shell += plane(cam, rc, [1, 0, 0], [0, -1, 0], roseArt2(330, night), 0, 0, 100, [-390, -390, 390, 390]);
      // a gilded frieze of lilies under the rose
      shell += plane(cam, [0, 1150, z - 2], [1, 0, 0], [0, -1, 0], `<rect x="-480" y="-24" width="960" height="48" fill="${night ? '#5a4024' : '#b8944e'}"/>` + Array.from({ length: 19 }, (_, i) => Q.lily(-450 + i * 50, 2, 0.42, night ? '#a87828' : '#ffe08a')).join('') + `<path d="M-480,-24 L480,-24 M-480,24 L480,24" stroke="${night ? '#3a2a18' : '#7a6040'}" stroke-width="5"/>`, 0, 0, 100, [-486, -30, 486, 30]);
      for (const [x, w] of [[-430, 110], [-280, 110], [280, 110], [430, 110]]) shell += plane(cam, [x, 680, z - 2], [1, 0, 0], [0, -1, 0], lancetArt(w, 380, 2900 + x, night), 0, -230, 100, [-w / 2 - 6, -380 - w * 0.62 - 6, w / 2 + 6, 6]);
      // two statues in niches flanking the cloth
      for (const x of [-330, 330]) shell += plane(cam, [x, 170, z - 6], [1, 0, 0], [0, -1, 0], `<path d="M-46,20 L-46,-210 Q0,-260 46,-210 L46,20Z" fill="${night ? '#1a1420' : '#3a3046'}"/>` + statueArt(x + 7, night), 0, -110, 100, [-48, -240, 48, 22]);
      // the cloth of estate: velvet in deep folds, sown with lilies, a gold border and fringe
      const cl = `<rect x="${-CLOTH.x}" y="0" width="${CLOTH.x * 2}" height="${CLOTH.y1 - CLOTH.y0}" fill="url(#h3Velvet)" ${OLc(2, 0.6)}/>` +
        Array.from({ length: 9 }, (_, row) => Array.from({ length: 6 }, (_, i) => Q.lily(-CLOTH.x + 40 + i * 70 + (row % 2) * 35, 50 + row * 64, 0.42, night ? '#9a7228' : '#d8ac40')).join('')).join('') +
        [-160, -80, 0, 80, 160].map(x => `<path d="M${x},0 L${x},${CLOTH.y1 - CLOTH.y0}" stroke="#000" stroke-width="22" opacity="0.2"/><path d="M${x + 18},0 L${x + 18},${CLOTH.y1 - CLOTH.y0}" stroke="#fff" stroke-width="6" opacity="0.06"/>`).join('') +
        `<rect x="${-CLOTH.x}" y="0" width="${CLOTH.x * 2}" height="${CLOTH.y1 - CLOTH.y0}" fill="none" stroke="#d8ac40" stroke-width="10"/>`;
      shell += plane(cam, [0, CLOTH.y1, CLOTH.z], [1, 0, 0], [0, -1, 0], cl, 0, (CLOTH.y1 - CLOTH.y0) / 2, 100, [-CLOTH.x - 6, -6, CLOTH.x + 6, CLOTH.y1 - CLOTH.y0 + 6]);
      const cd = D([0, CLOTH.y1, CLOTH.tz]);
      shell += poly(cam, [[-CLOTH.x - 30, CLOTH.y1, CLOTH.z], [CLOTH.x + 30, CLOTH.y1, CLOTH.z], [CLOTH.x + 30, CLOTH.y1, CLOTH.tz], [-CLOTH.x - 30, CLOTH.y1, CLOTH.tz]], tone('#101a56', cd, 'd'));
      // the canopy's crest: a gilded cresting of lilies and crockets along the valance
      const val = `<path d="M${-CLOTH.x - 30},0 L${CLOTH.x + 30},0 L${CLOTH.x + 30},46 ${Array.from({ length: 12 }, (_, i) => { const x0 = CLOTH.x + 30 - (i + 1) * (CLOTH.x * 2 + 60) / 12; return `Q${f(x0 + (CLOTH.x * 2 + 60) / 24)},74 ${f(x0)},46`; }).join(' ')} Z" fill="url(#h3Velvet)" ${OLc(1.6, 0.6)}/>` +
        Array.from({ length: 12 }, (_, i) => Q.lily(-CLOTH.x - 30 + (i + 0.5) * (CLOTH.x * 2 + 60) / 12, 26, 0.36, '#e8c048')).join('') + `<rect x="${-CLOTH.x - 34}" y="-10" width="${CLOTH.x * 2 + 68}" height="14" fill="url(#h3Gold)"/>` +
        Array.from({ length: 13 }, (_, i) => { const x = -CLOTH.x - 30 + i * (CLOTH.x * 2 + 60) / 12; return Q.lily(x, -22, 0.42, night ? '#b88a30' : '#f0c448'); }).join('');
      items.push({ z: cd - 5, svg: () => plane(cam, [0, CLOTH.y1, CLOTH.tz], [1, 0, 0], [0, -1, 0], val, 0, 30, 100, [-CLOTH.x - 50, -42, CLOTH.x + 50, 76]) });
    }
    // ---- the west wall: the portal (archivolts, jamb statues, a lily tympanum), the gallery, a rose above it
    {
      const z = 0, d = D([0, 900, z]), Dr = K.DOOR;
      const outer = [[-W2, 0, z], [W2, 0, z]]; for (let i = 14; i >= 0; i--) outer.push(vArc(z, i / 14));
      const archP = [[-Dr.x, 0, z]]; for (let i = 0; i <= 12; i++) { const a = i / 12; archP.push([-Dr.x + 2 * Dr.x * a, Dr.h + (Dr.apex - Dr.h) * Math.sin(Math.PI * a) ** 0.7, z]); } archP.push([Dr.x, 0, z]);
      const op = T.path(cam, outer), hp = T.path(cam, archP);
      if (op) shell += `<path d="${op}${hp ? ' ' + hp : ''}" fill-rule="evenodd" fill="url(#h3WallV)"/>`;
      for (const sd of [-1, 1]) shell += poly(cam, [[sd * W2, 0, z], [sd * AW, 0, z], [sd * AW, AISLE_H, z], [sd * W2, AISLE_H + 220, z]], tone(P.stoneD, d, 's'));
      // three orders of archivolts with voussoirs, getting bigger outward
      for (let k = 1; k <= 3; k++) {
        const ex = 1 + 0.11 * k, ey = 1 + 0.07 * k, pts = archP.slice(1, -1).map(p => [p[0] * ex, p[1] * ey, z + 2]);
        shell += line(cam, pts, tone(k % 2 ? P.stoneL : P.stone, d, 's'), 24) + line(cam, pts, tone(P.stoneD, d, 's'), 3);
        for (let i = 1; i < pts.length - 1; i += 1) { const a = pts[i], b = [a[0] * (1 + 0.05), a[1] * 1.03, z + 2]; shell += line(cam, [a, b], tone(P.stoneD, d, 's'), 2); }
        shell += line(cam, [[-Dr.x * ex, 0, z + 2], [-Dr.x * ex, Dr.h * ey, z + 2]], tone(P.stoneL, d, 's'), 22) + line(cam, [[Dr.x * ex, 0, z + 2], [Dr.x * ex, Dr.h * ey, z + 2]], tone(P.stoneL, d, 's'), 22);
      }
      for (const sd of [-1, 1]) for (let i = 0; i < 2; i++) shell += plane(cam, [sd * (Dr.x + 70 + i * 80), 170, z + 4], [1, 0, 0], [0, -1, 0], statueArt(sd * 10 + i * 3, night), 0, -110, 100, [-32, -238, 32, 16]);
      const tz = Dr.h + 60;
      items.push({ z: D([0, tz, 2]) + 3, svg: () => poly(cam, [[-Dr.x, tz, z + 2]].concat(archP.slice(1, -1).filter(p => p[1] > tz).map(p => [p[0], p[1], z + 2])).concat([[Dr.x, tz, z + 2]]), tone(P.blue, d, 's'), OLc(1, 0.6)) + plane(cam, [0, tz + 48, z + 3], [1, 0, 0], [0, -1, 0], Q.lily(0, 0, 1.0, night ? '#a87828' : '#f0c448'), 0, 0, 60, [-43, -43, 43, 33]) });
      // the oak leaves (they swing into the hall), with iron scroll hinges
      const opn = o.doors ?? 1, ang = opn * 1.45;
      for (const sd of [-1, 1]) {
        const hx = sd * Dr.x, ex = hx - sd * Dr.x * Math.cos(ang), ez = Dr.x * Math.sin(ang), lp = [[hx, 0, z + 4], [ex, 0, z + 4 + ez], [ex, Dr.h + 60, z + 4 + ez], [hx, Dr.h + 60, z + 4]], ld = D([(hx + ex) / 2, 250, ez / 2]);
        items.push({ z: ld, svg: () => { let s = poly(cam, lp, tone(shade('#5a3a20', -0.08 * sd), ld, 's'), OLc(f(pxw(cam, lp[0], 1.2, 0.3, 2)), 0.6)); for (const yy of [90, 300, 500]) { const W = (u) => [lerp(hx, ex, u), yy, lerp(z + 5, z + 5 + ez, u)]; s += line(cam, [W(0), W(0.85)], '#1a1612', 8); for (const u of [0.3, 0.55, 0.8]) s += line(cam, [W(u), [lerp(hx, ex, u) - sd * 12, yy + 22, lerp(z + 5, z + 5 + ez, u)]], '#1a1612', 4); } for (let k = 1; k < 7; k++) s += line(cam, [[lerp(hx, ex, k / 7), 6, z + 5 + ez * k / 7], [lerp(hx, ex, k / 7), Dr.h + 54, z + 5 + ez * k / 7]], '#000', 1.6, 'opacity="0.35"'); return s; } });
      }
      // the gallery: a traceried balustrade across the hall, its banners; a rose window above
      const gz = 170, gy0 = 760, gy1 = 860, gd = D([0, 800, gz]);
      items.push({ z: gd + 40, svg: () => {
        let s = poly(cam, [[-W2, gy0, 0], [W2, gy0, 0], [W2, gy0, gz], [-W2, gy0, gz]], tone('#3a2614', gd, 'd')) + poly(cam, [[-W2, gy0 - 50, gz], [W2, gy0 - 50, gz], [W2, gy1, gz], [-W2, gy1, gz]], tone('#6a4a2a', gd, 's'), OLc(1, 0.5));
        for (let x = -W2 + 50; x < W2; x += 70) { const c = cam.toC([x, (gy0 + gy1) / 2, gz + 1]); if (c[2] < cam.near + 10) continue; const p = cam.scr(c), k = cam.fl / c[2]; s += `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="${f(26 * k)}" fill="#2a1a0c"/>` + [0, 1, 2, 3].map(i => `<circle cx="${f(p[0] + Math.cos(i * TAU / 4) * 12 * k)}" cy="${f(p[1] + Math.sin(i * TAU / 4) * 12 * k)}" r="${f(9 * k)}" fill="${tone('#6a4a2a', gd, 's')}"/>`).join(''); }
        s += line(cam, [[-W2, gy1, gz], [W2, gy1, gz]], '#d8a840', 6) + line(cam, [[-W2, gy0 - 50, gz], [W2, gy0 - 50, gz]], '#d8a840', 4);
        return s;
      } });
      for (const sd of [-1, 1]) items.push({ z: D([sd * 300, 560, gz + 6]), svg: () => plane(cam, [sd * 300, gy0 - 50, gz + 6], [1, 0, 0], [0, -1, 0], bannerArt2(110, 380, 3 * Math.sin(t * 0.7 + sd), sd > 0 ? 'lily' : 'ori', 'gb' + sd), 0, 190, 100, [-78, -10, 78, 386]) });
      shell += plane(cam, [0, 1420, z + 2], [-1, 0, 0], [0, -1, 0], roseArt2(260, night), 0, 0, 100, [-307, -307, 307, 307]);
    }
    // ---- the arcade walls: the arches and their mouldings, the triforium, the clerestory windows
    for (const sd of [-1, 1]) {
      const x = sd * W2, d = D([x, 900, cam.z + 1200]);
      const outer = [[x, 0, 0], [x, 0, LEN], [x, VS, LEN], [x, VS, 0]];
      let dpath = T.path(cam, outer) || '';
      const arch = (za, zb, lift = 0, inset = 0) => { const pts = []; for (let j = 0; j <= 14; j++) { const a = j / 14; pts.push([x - sd * inset, SPRING + lift + (APEX + lift - SPRING) * Math.sin(Math.PI * a) ** 0.62, lerp(za, zb, a)]); } return pts; };
      for (let i = 1; i < BAYS.length - 2; i++) { const za = BAYS[i] + PR_R * 0.7, zb = BAYS[i + 1] - PR_R * 0.7, pts = [[x, -2, za], ...arch(za, zb), [x, -2, zb]], hp = T.path(cam, pts); if (hp) dpath += ' ' + hp; }
      if (dpath) shell += `<path d="${dpath}" fill-rule="evenodd" fill="${sd < 0 ? 'url(#h3WallV)' : 'url(#h3WallS)'}"/>`;
      let mo = '', mo2 = '';
      for (let i = 1; i < BAYS.length - 2; i++) {
        const za = BAYS[i] + PR_R * 0.5, zb = BAYS[i + 1] - PR_R * 0.5;
        mo += line(cam, arch(za - 10, zb + 10, 26, 2), tone(P.stoneL, d, 's'), 18) + line(cam, arch(za - 22, zb + 22, 44, 2), tone(P.stoneD, d, 's'), 6);
        mo2 += line(cam, arch(za + 4, zb - 4, 4, 3), '#000', 16, 'opacity="0.28"');
      }
      shell += mo2 + mo;
      // coursed ashlar: horizontal joints and staggered vertical joints, above the arches and on the solid end bays
      {
        let jt = ''; const rr = rng(sd > 0 ? 61 : 67);
        for (let y = APEX + 70, row = 0; y < VS - 20; y += 46, row++) { if (y > TRI0 - 30 && y < TRI1 + 30) continue; const dd = T.lineD(cam, [[x - sd, y, 0], [x - sd, y, LEN]]); if (dd) jt += dd; for (let z = (row % 2) * 40; z < LEN; z += 80 + rr() * 10) { const vv = T.lineD(cam, [[x - sd, y, z], [x - sd, y + 46, z]]); if (vv) jt += vv; } }
        for (const [za, zb] of [[0, BAYS[1] - PR_R], [BAYS[BAYS.length - 2] + PR_R, LEN]]) for (let y = 40, row = 0; y < APEX + 70; y += 46, row++) { const dd = T.lineD(cam, [[x - sd, y, za], [x - sd, y, zb]]); if (dd) jt += dd; for (let z = za + (row % 2) * 40; z < zb; z += 80) { const vv = T.lineD(cam, [[x - sd, y, z], [x - sd, y + 46, z]]); if (vv) jt += vv; } }
        if (jt) shell += `<path d="${jt}" stroke="${tone(shade(P.stoneD, -0.3), d, 's')}" stroke-width="${f(pxw(cam, [x, 1400, cam.z + 800], 1.4, 0.3, 1.6))}" fill="none" opacity="0.45"/>`;
      }      // string course, the triforium (a band of little arches, dark beyond), a second string course
      shell += line(cam, [[x - sd * 4, STR, 0], [x - sd * 4, STR, LEN]], tone(P.stoneL, d, 's'), 16) + line(cam, [[x - sd * 4, STR - 10, 0], [x - sd * 4, STR - 10, LEN]], '#000', 8, 'opacity="0.3"');
      for (let i = 0; i < BAYS.length - 1; i++) {
        const z0 = BAYS[i] + 50, z1 = BAYS[i + 1] - 50, n = 5;
        for (let k = 0; k < n; k++) {
          const a = lerp(z0, z1, k / n) + 10, b = lerp(z0, z1, (k + 1) / n) - 10, pts = [[x - sd * 2, TRI0, a], [x - sd * 2, TRI0, b]];
          for (let j = 0; j <= 6; j++) { const u = j / 6; pts.push([x - sd * 2, TRI1 - 40 + 40 * Math.sin(Math.PI * (1 - u)) ** 0.6, lerp(b, a, u)]); }
          shell += poly(cam, pts, tone(P.shade2, d, 'n'));
        }
        for (let k = 0; k <= n; k++) { const zc = lerp(z0, z1, k / n); shell += line(cam, [[x - sd * 4, TRI0, zc], [x - sd * 4, TRI1 - 20, zc]], tone(P.stoneL, d, 's'), 7); }
      }
      shell += line(cam, [[x - sd * 4, TRI1 + 12, 0], [x - sd * 4, TRI1 + 12, LEN]], tone(P.stoneL, d, 's'), 14);
      // clerestory windows in every bay: the sunlit ones on the right throw the shafts
      for (let i = 0; i < BAYS.length - 1; i++) { const zc = (BAYS[i] + BAYS[i + 1]) / 2; shell += glassWin(cam, x - sd * 3, zc, CLR0, 210, 380, 4100 + zc + sd, sd > 0 ? 1 : 0.45, night, E); if (sd > 0 && !night) { const wp = cam.proj([x, CLR0 + 260, zc]); if (wp) light += C.radial(wp[0], wp[1], pxw(cam, [x, CLR0 + 260, zc], 420, 10, 1500), '#fff0c8', 0.22, 'screen'); } }
      for (const zb of [200, 3000]) shell += plane(cam, [x - sd * 4, 700, zb], [0, 0, -sd], [0, -1, 0], tapestryArt2(300, 520, 3300 + zb + sd, night), 0, 260, 100, [-152, -2, 152, 522]);
    }
    // ---- the floor: cream and oxblood lozenges (lilies on the near ones), a dark border, the runner, the dais
    {
      const r0 = 35, groups = {};
      // (each tile belongs to a fixed row band of the floor, toned by that band's own distance from the lens: the tones
      // slide smoothly as the camera moves and no tile ever jumps from one tone to the next)
      for (let m = 0; m < 92; m++) for (let n = -18; n < 18 + m; n++) {
        const cx = r0 * (m - n), cz = r0 * (m + n); if (Math.abs(cx) > W2 - 60 || cz < 0 || cz > DAIS.z0 + 20) continue;
        const pts = [[cx - r0, 0, cz], [cx, 0, cz - r0], [cx + r0, 0, cz], [cx, 0, cz + r0]], dd = T.path(cam, pts); if (!dd) continue;
        const key = ((m + n) % 2 ? 'b' : 'a') + Math.floor(cz / 140);
        (groups[key] = groups[key] || []).push(dd);
      }
      let fl = poly(cam, [[-W2, 0, 0], [W2, 0, 0], [W2, 0, DAIS.z0 + 20], [-W2, 0, DAIS.z0 + 20]], tone(P.tileC, D([0, 0, cam.z + 800]), 'g'));
      for (const key in groups) { const band = +key.slice(1); fl += `<path d="${groups[key].join('')}" fill="${tone(key[0] === 'a' ? P.tileA : P.tileB, D([clamp(cam.x, -W2, W2), 0, band * 140 + 70]), 'g')}"/>`; }
      // the dark border bands along the walls, with a running gold line
      for (const sd of [-1, 1]) { fl += poly(cam, [[sd * (W2 - 60), 0.3, 0], [sd * W2, 0.3, 0], [sd * W2, 0.3, DAIS.z0], [sd * (W2 - 60), 0.3, DAIS.z0]], tone(P.tileC, 800, 'g')) + lineN(cam, [[sd * (W2 - 62), 0.5, 0], [sd * (W2 - 62), 0.5, DAIS.z0]], tone(P.gold, 800, 'g'), 3); }
      // lilies inlaid in the near cream lozenges
      for (let m = 0; m < 92; m++) for (let n = -18; n < 18 + m; n++) {
        if ((m + n) % 2) continue; const cx = r0 * (m - n), cz = r0 * (m + n); if (Math.abs(cx) > W2 - 80 || cz < 0 || cz > DAIS.z0 || Math.abs(cx) < 130) continue;
        const dd = D([cx, 0, cz]), fo = (1 - ss(850, 1150, dd)) * ss(40, 95, dd); if (fo < 0.01) continue;
        fl += `<g opacity="${f(fo)}">${plane(cam, [cx, 0.4, cz], [1, 0, 0], [0, 0, -1], Q.lily(0, 0, 0.28, tone(P.tileB, dd, 'g')), 0, 0, 20, [-13, -13, 13, 10])}</g>`;
      }
      // (the sheen's far end is the dais front: while the camera stood on the dais that point was behind the lens and the
      // whole sheen was left out - it appeared in one frame as the camera backed past it - so it fades in as the point
      // comes out in front of the lens. Its near end (z 300) passed behind the high camera of the time-lapse and the
      // sheen vanished, the floor a sixth darker in one frame: it fades out as that end nears the lens too)
      { const fq = T.path(cam, [[-W2, 0.5, 0], [W2, 0.5, 0], [W2, 0.5, DAIS.z0], [-W2, 0.5, DAIS.z0]]), a = cam.proj([0, 0, 300]), b = cam.proj([0, 0, DAIS.z0]), bz = cam.toC([0, 0, DAIS.z0])[2], az = cam.toC([0, 0, 300])[2], shK = ss(cam.near, cam.near + 150, bz) * ss(cam.near, cam.near + 150, az); if (fq && a && b && shK > 0.001) fl += `<defs><linearGradient id="flSh" gradientUnits="userSpaceOnUse" x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}"><stop offset="0" stop-color="#000" stop-opacity="0.18"/><stop offset="0.6" stop-color="#fff0d0" stop-opacity="0"/><stop offset="1" stop-color="#ffe8b8" stop-opacity="${night ? 0.06 : 0.2}"/></linearGradient></defs><path d="${fq}" fill="url(#flSh)"${shK < 1 ? ` opacity="${f(shK)}"` : ''}/>`; }      // ambient occlusion where the floor meets the walls
      for (const sd of [-1, 1]) fl += poly(cam, [[sd * (W2 - 110), 0.6, 0], [sd * W2, 0.6, 0], [sd * W2, 0.6, DAIS.z0], [sd * (W2 - 110), 0.6, DAIS.z0]], '#000', 'opacity="0.22"');
      shell += fl;
      // the runner: royal blue, gold borders with a chain of diamonds, lilies down the middle, a fringe
      const ra = 150, rb = DAIS.z0 - 4, rd = D([0, 0, (ra + rb) / 2]);
      shell += poly(cam, [[-122, 0.8, ra], [122, 0.8, ra], [122, 0.8, rb], [-122, 0.8, rb]], tone(P.rug, rd, 'g'));
      for (const x of [-110, -96, 96, 110]) shell += lineN(cam, [[x, 1.2, ra + 6], [x, 1.2, rb]], tone(P.gold, rd, 'g'), 3.4);
      for (let z = ra + 30; z < rb; z += 40) for (const x of [-103, 103]) { const dz = D([x, 0, z]), fo = 1 - ss(1300, 1650, dz); if (fo < 0.01) continue; shell += poly(cam, [[x - 5, 1.2, z], [x, 1.2, z - 7], [x + 5, 1.2, z], [x, 1.2, z + 7]], tone(P.gold, dz, 'g'), fo < 0.99 ? `opacity="${f(fo)}"` : ''); }
      for (let z = ra + 100; z < rb - 60; z += 120) { const ld = D([0, 0, z]), fo = (1 - ss(3300, 3800, ld)) * ss(40, 95, ld); if (fo < 0.01) continue; shell += `<g opacity="${f(fo)}">${plane(cam, [0, 1.3, z], [1, 0, 0], [0, 0, -1], Q.lily(0, 0, 0.42, tone(P.gold, ld, 'g')), 0, 0, 40, [-19, -19, 19, 15])}</g>`; }
      for (let x = -118; x <= 118; x += 9) shell += line(cam, [[x, 1, ra], [x, 1, ra - 14]], tone(P.gold, D([x, 0, ra]), 'g'), 2.2);
      // the dais: three steps with gilded nosings, the crimson carpet down them, a gilded medallion under the throne
      const st = [[DAIS.z0, 0, 20], [DAIS.z0 + 60, 20, 40], [DAIS.z0 + 120, 40, 60]];
      for (const [zz, y0, y1] of st) {
        const dd = D([0, y1, zz]);
        shell += poly(cam, [[-DAIS.x, y0, zz], [DAIS.x, y0, zz], [DAIS.x, y1, zz], [-DAIS.x, y1, zz]], tone(P.stoneD, dd, 's')) + poly(cam, [[-DAIS.x, y1, zz], [DAIS.x, y1, zz], [DAIS.x, y1, LEN], [-DAIS.x, y1, LEN]], tone(P.stoneL, dd, 'g'));
        shell += line(cam, [[-DAIS.x, y1, zz - 0.5], [DAIS.x, y1, zz - 0.5]], tone(P.gold, dd, 'n'), 3.5);
        shell += poly(cam, [[-150, y0 + 0.5, zz - 0.6], [150, y0 + 0.5, zz - 0.6], [150, y1 + 0.5, zz - 0.6], [-150, y1 + 0.5, zz - 0.6]], tone(shade(P.red, -0.15), dd, 's')) + poly(cam, [[-150, y1 + 0.6, zz], [150, y1 + 0.6, zz], [150, y1 + 0.6, zz + 60], [-150, y1 + 0.6, zz + 60]], tone(P.red, dd, 'g'));
        for (const x of [-138, 138]) shell += line(cam, [[x, y1 + 1, zz], [x, y1 + 1, zz + 60]], tone(P.gold, dd, 'n'), 2.5);
        for (const sd of [-1, 1]) shell += poly(cam, [[sd * DAIS.x, y0, zz], [sd * DAIS.x, y1, zz], [sd * DAIS.x, y1, LEN], [sd * DAIS.x, y0, LEN]], tone(shade(P.stoneD, -0.1), dd, 's'));
      }
      shell += poly(cam, T.ring([0, 60.8, 2960], [150, 0, 0], [0, 0, 110], 24), tone(P.blue, D([0, 60, 2960]), 'g')) + line(cam, [...T.ring([0, 61, 2960], [150, 0, 0], [0, 0, 110], 24), T.ring([0, 61, 2960], [150, 0, 0], [0, 0, 110], 24)[0]], tone(P.gold, D([0, 60, 2960]), 'n'), 5);
    }
    // ---- light: the sun pools and shafts from the right clerestory, mirrored glints in the polished floor
    const sun = o.sun || { dir: [-0.42, -0.85, 0.3], k: 1 - nk };
    HL.lastSun = sun;
    if (sun.k > 0.01) {
      const sd2 = sun.dir, srcX = sd2[0] < 0 ? W2 : -W2;
      for (let i = 0; i < BAYS.length - 1; i++) {
        const zc = (BAYS[i] + BAYS[i + 1]) / 2;
        const cnr = [[0, CLR0], [0, CLR0 + 380], [1, CLR0 + 380], [1, CLR0]].map(([u, y]) => [srcX, y, zc - 95 + 190 * u]);
        const hit = cnr.map(p => { const k = -p[1] / sd2[1]; return [p[0] + sd2[0] * k, 0.8, p[2] + sd2[2] * k]; });
        if (hit.some(h => Math.abs(h[0]) > W2 || h[2] > DAIS.z0 || h[2] < 0)) continue;
        const pp = T.path(cam, hit), shim = 0.85 + 0.15 * Math.sin(t * 0.9 + i * 1.3);
        if (pp) light += `<g filter="url(#b4)"><path d="${pp}" fill="#ffe2a0" opacity="${f(0.55 * sun.k * shim)}" style="mix-blend-mode:screen"/><path d="${pp}" fill="${GL[i % GL.length]}" opacity="${f(0.14 * sun.k)}" style="mix-blend-mode:screen"/></g>`;
        // the beam's silhouette: its twelve edges clipped at the lens, projected, hulled (a beam reaching behind the camera
        // is cut where it passes the lens instead of vanishing)
        const nr = cam.near + 2, cc = cnr.concat(hit).map(p => cam.toC(p)), pts2 = [];
        for (const [ia, ib] of [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]]) {
          const A = cc[ia], B = cc[ib], inA = A[2] >= nr, inB = B[2] >= nr;
          if (inA) pts2.push(cam.scr(A));
          if (inA !== inB) { const u = (nr - A[2]) / (B[2] - A[2]); pts2.push(cam.scr([A[0] + (B[0] - A[0]) * u, A[1] + (B[1] - A[1]) * u, nr])); }
        }
        if (pts2.length < 3) continue;
        const h = hull(pts2);
        let Ac = cam.toC([srcX, CLR0 + 190, zc]), Bc = cam.toC([(hit[0][0] + hit[2][0]) / 2, 0.8, (hit[0][2] + hit[2][2]) / 2]);
        // (a shaft fades out as its axis nears the lens: it was dropped whole when it passed behind, a pop as the camera
        // moved through the hall)
        const nfB = ss(nr, nr + 250, Math.max(Ac[2], Bc[2]));
        if (Ac[2] < nr && Bc[2] < nr) continue;
        if (Ac[2] < nr) { const u = (nr - Ac[2]) / (Bc[2] - Ac[2]); Ac = [Ac[0] + (Bc[0] - Ac[0]) * u, Ac[1] + (Bc[1] - Ac[1]) * u, nr]; }
        else if (Bc[2] < nr) { const u = (nr - Bc[2]) / (Ac[2] - Bc[2]); Bc = [Bc[0] + (Ac[0] - Bc[0]) * u, Bc[1] + (Ac[1] - Bc[1]) * u, nr]; }
        const a = cam.scr(Ac), b = cam.scr(Bc);
        const id = 'sb' + i + '_' + (gid++ % 1000);
        light += `<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}"><stop offset="0" stop-color="#fff4d6" stop-opacity="${f(0.5 * sun.k * shim * nfB)}"/><stop offset="0.6" stop-color="#ffe0a0" stop-opacity="${f(0.24 * sun.k * shim * nfB)}"/><stop offset="1" stop-color="#ffd890" stop-opacity="${f(0.08 * sun.k * nfB)}"/></linearGradient></defs><path d="M${h.map(p => f(p[0]) + ',' + f(p[1])).join('L')}Z" fill="url(#${id})" style="mix-blend-mode:screen"/>`;
      }
      // the sunlit windows mirrored in the polished floor (clipped to the floor)
      const flo = T.path(cam, [[-W2, 0, 0], [W2, 0, 0], [W2, 0, DAIS.z0], [-W2, 0, DAIS.z0]]);
      if (flo) { let mir = ''; for (let i = 0; i < BAYS.length - 1; i++) { const zc = (BAYS[i] + BAYS[i + 1]) / 2, pts = [[W2, -CLR0, zc - 95], [W2, -CLR0, zc + 95], [W2, -CLR0 - 380, zc + 95], [W2, -CLR0 - 380, zc - 95]], dd = T.path(cam, pts); if (dd) mir += `<path d="${dd}" fill="${GL[(i * 3) % GL.length]}" opacity="0.18"/>`; } if (mir) light += `<defs><clipPath id="flC"><path d="${flo}"/></clipPath></defs><g clip-path="url(#flC)" style="mix-blend-mode:screen" filter="url(#b4)">${mir}</g>`; }
    }
    // ---- items: piers, candelabra, banners, chandeliers, the throne, the tables
    for (const sd of [-1, 1]) for (const z of PIERS) { const x = sd * W2, d = D([x, 400, z]); items.push({ z: d, svg: () => pier2(cam, x, z, d, P, E, night) }); }
    const flames = [];
    for (const sd of [-1, 1]) for (const z of [700, 1500, 2300]) {
      const P0 = [sd * 420, 0, z], b0 = bb(cam, P0); if (!b0) continue;
      const lit = o.candles ?? (0.4 + 0.6 * nk);
      flames.push([sd * 420, 192, z, lit]);
      items.push({ z: b0.d, svg: () => { const b = bb(cam, P0); if (!b) return ''; const gl = C.radial(b.x, b.y - 196 * b.k, 240 * b.k, '#ffb860', 0.42 * lit, 'screen'); return `<g transform="${b.tr}">${standArt2()}</g>` + standFlames2(b.tr, t, z + sd, clamp(lit * 1.5)) + gl; } });
    }
    for (const sd of [-1, 1]) for (const z of [1200, 2000]) {
      const top = [sd * 330, VS - 120, z], d = D([sd * 330, 1500, z]);
      items.push({ z: d, svg: () => line(cam, [[sd * W2, VS - 120, z], [sd * 300, VS - 120, z]], '#d8a840', 6) + plane(cam, top, [1, 0, 0], [0, -1, 0], bannerArt2(130, 640, 7 * Math.sin(t * 0.6 + z * 0.01 + sd), z === 1200 ? 'ori' : 'lily', 'bn' + sd + z), 0, 320, 100, [-88, -10, 88, 646]) });
    }
    if (nk > 0.05) for (const z of [1200, 2000]) {
      const P0 = [0, 980, z], b0 = bb(cam, P0); if (!b0) continue;
      flames.push([0, 990, z, nk]);
      items.push({ z: b0.d, svg: () => { const b = bb(cam, P0); if (!b) return ''; return line(cam, [[0, VA - 20, z], [0, 990, z]], '#1a1410', 3, 'stroke-dasharray="6 3"') + PR.chandelier(b.x, b.y, b.k * 1.1, t + z, 12) + C.radial(b.x, b.y - 10 * b.k, 460 * b.k, '#ffb860', 0.34 * nk, 'screen'); } });
    }
    // candle flames mirrored in the floor: soft upright glints under each candelabrum
    for (const [fx, fy, fz, lit] of flames) { const a = cam.proj([fx, 4, fz]), b = cam.proj([fx, -fy, fz]); if (!a || !b) continue; const w = pxw(cam, [fx, 0, fz], 26, 1, 80); light += `<ellipse cx="${f(b[0])}" cy="${f((a[1] + b[1]) / 2)}" rx="${f(w)}" ry="${f(Math.abs(b[1] - a[1]) / 2 + 2)}" fill="url(#h3Flame)" opacity="${f(0.55 * lit)}" style="mix-blend-mode:screen"/>`; }
    if (nk > 0.05) for (const [fx, , fz] of flames) { const fp = bb(cam, [fx, 0, fz]); if (fp) light += `<ellipse cx="${f(fp.x)}" cy="${f(fp.y)}" rx="${f(360 * fp.k)}" ry="${f(360 * fp.k * clamp(cam.y / Math.max(100, fp.vd) * 1.1, 0.08, 1))}" fill="#ffa850" opacity="${f(0.16 * nk)}" style="mix-blend-mode:screen" filter="url(#b8)"/>`; }
    if (o.throne !== false) { const b0 = bb(cam, THRONE); if (b0) items.push({ z: b0.d + 30, svg: () => { const b = bb(cam, THRONE); return b ? `<g transform="${b.tr}">${throneArt2(night)}</g>` : ''; } }); }
    if (o.feast) {
      const hz0 = 2900, hz1 = 2980, y0 = DAIS.top, yT = DAIS.top + 76, hd = D([0, yT, hz0]);
      items.push({ z: hd, svg: () => feastTable2(cam, t, P, E, [-390, 390], hz0, hz1, y0, yT, 'x', o) });
      for (const sd of [-1, 1]) { const x0 = sd * 300, x1 = sd * 390, td = D([sd * 345, 76, 1500]); items.push({ z: td, svg: () => feastTable2(cam, t, P, E, [Math.min(x0, x1), Math.max(x0, x1)], 900, 2300, 0, 76, 'z', o) }); }
    }
    return { back, shell, light, items, P, E };
  };
  const hull = pts => { const Pp = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]); const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); const lo = [], up = []; for (const p of Pp) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); } for (let i = Pp.length - 1; i >= 0; i--) { const p = Pp[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); } return lo.slice(0, -1).concat(up.slice(0, -1)); };
  // a feast table: white linen to the floor, a blue and gold runner, gold plates, goblets, bread, fruit, candelabra
  const feastTable2 = (cam, t, P, E, [xa, xb], za, zb, y0, yT, axis, o) => {
    const d = cam.dist([(xa + xb) / 2, yT, (za + zb) / 2]), tone = (c, k = 's') => T.tone(E, c, d, k);
    let s = poly(cam, [[xa, yT, za], [xb, yT, za], [xb, yT, zb], [xa, yT, zb]], tone('#f0e8d8'), OLc(f(pxw(cam, [xa, yT, za], 1, 0.3, 2)), 0.4));
    if (axis === 'x') {
      s += poly(cam, [[xa - 6, yT, za - 4], [xb + 6, yT, za - 4], [xb + 6, y0, za - 12], [xa - 6, y0, za - 12]], tone('#ddd2bc'), OLc(1, 0.4));
      for (let x = xa + 30; x < xb; x += 46) s += line(cam, [[x, yT - 6, za - 4.4], [x - 3, y0 + 6, za - 12]], '#9a8e78', 3, 'opacity="0.5"');
      s += poly(cam, [[xa - 6, yT - 6, za - 4.5], [xb + 6, yT - 6, za - 4.5], [xb + 6, yT - 26, za - 5.2], [xa - 6, yT - 26, za - 5.2]], tone('#22348a'));
      for (let x = xa + 40; x < xb - 20; x += 80) s += plane(cam, [x, yT - 16, za - 5.3], [1, 0, 0], [0, -1, 0], Q.lily(0, 0, 0.26, '#f0c448'), 0, 0, 20);
    } else { const xin = Math.abs(xa) < Math.abs(xb) ? xa : xb; s += poly(cam, [[xin, yT, za], [xin, yT, zb], [xin, y0 + 8, zb], [xin, y0 + 8, za]], tone('#ddd2bc'), OLc(1, 0.4)); }
    // (o.feastHands: the King's forearms and hands resting on the high table - over the cloth, under what stands on it)
    if (axis === 'x' && o.feastHands) s += o.feastHands;
    const spots = []; if (axis === 'x') for (let x = xa + 50; x < xb - 30; x += 75) spots.push([x, (za + zb) / 2]); else for (let z = za + 60; z < zb - 40; z += 110) spots.push([(xa + xb) / 2, z]);
    for (const p of spots.map(([x, z]) => ({ x, z, d: cam.dist([x, yT, z]) })).sort((a, b) => b.d - a.d)) {
      const b = bb(cam, [p.x, yT, p.z]); if (!b || b.k < 0.02) continue;
      const kk = b.k, i = Math.round(p.x + p.z) % 4;
      s += `<ellipse cx="${f(b.x)}" cy="${f(b.y)}" rx="${f(17 * kk)}" ry="${f(Math.max(1, 17 * kk * clamp((cam.y - yT) / Math.max(100, b.vd), 0.05, 1)))}" fill="${tone('#e0b448', 'n')}" ${OLc(f(Math.max(0.3, kk * 0.8)), 0.5)}/>`;
      if (i === 1) s += PR.goblet(b.x, b.y, kk * 0.13, { wine: 0.7 });
      if (i === 3 && axis === 'x' && Math.abs(p.x) < 110) s += PR.goblet(b.x, b.y, kk * 0.13, { wine: 0.7 }); else if (i === 3) s += PR.candelabra(b.x, b.y, kk * 0.32, t, Math.round(p.z)) + C.radial(b.x, b.y - 40 * kk, 170 * kk, '#ffb860', 0.4 * (0.3 + 0.7 * (o.night || 0)), 'screen');
      if (i === 0) s += `<path d="M${f(b.x - 13 * kk)},${f(b.y)} C${f(b.x - 13 * kk)},${f(b.y - 11 * kk)} ${f(b.x + 13 * kk)},${f(b.y - 11 * kk)} ${f(b.x + 13 * kk)},${f(b.y)}Z" fill="${tone('#b8803a', 'n')}"/>`;
      if (i === 2) s += [[-6, -4, '#a8201c'], [5, -5, '#6a8a2a'], [0, -9, '#d8a030']].map(([dx, dy, c]) => `<circle cx="${f(b.x + dx * kk)}" cy="${f(b.y + dy * kk)}" r="${f(5 * kk)}" fill="${tone(c, 'n')}"/>`).join('');
    }
    return s;
  };

  // dust drifting in the sun shafts: points inside each beam, slowly turning over; they shine only where the light is
  const motes = (cam, t, sun) => {
    if (!sun || sun.k < 0.05) return '';
    const sd2 = sun.dir, srcX = sd2[0] < 0 ? W2 : -W2, r = rng(1701); let s = '';
    for (let i = 0; i < 220; i++) {
      const bay = Math.floor(r() * (BAYS.length - 1)), zc = (BAYS[bay] + BAYS[bay + 1]) / 2, along = r(), y0 = CLR0 + r() * 380, z0 = zc - 95 + r() * 190;
      const k = -y0 / sd2[1] * (0.15 + 0.8 * along), ph = r() * TAU, sp = 0.15 + r() * 0.25;
      // (every number for a mote is drawn before asking whether it is in view: a mote leaving the frame must never
      // move all the others)
      const P3 = [srcX + sd2[0] * k + 18 * Math.sin(t * sp + ph), y0 + sd2[1] * k + 14 * Math.sin(t * sp * 1.3 + ph * 2), z0 + sd2[2] * k + 18 * Math.cos(t * sp + ph)], tsp = 1.5 + r();
      if (Math.abs(P3[0]) > W2 || P3[1] < 20) continue;
      const c = cam.toC(P3); if (c[2] < cam.near + 20) continue; const p = cam.scr(c); if (p[0] < -20 || p[0] > 1100 || p[1] < -20 || p[1] > 1940) continue;
      const rad = clamp(1.6 * cam.fl / c[2] * 1.4, 0.5, 4), tw = (0.5 + 0.5 * Math.sin(t * tsp + ph)) * ss(cam.near + 20, cam.near + 120, c[2]);
      s += `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="${f(rad)}" fill="#fff2cc" opacity="${f(0.55 * tw * sun.k)}"/>`;
    }
    return `<g style="mix-blend-mode:screen">${s}</g>`;
  };
  HL.render = (cam, t, o = {}, actors = []) => {
    const H = HL.draw(cam, t, o);
    const all = H.items.concat(actors).sort((a, b) => b.z - a.z);
    const dof = o.dof || 0, foc = o.focus || 600;
    let defs = '', body = '', n = 0;
    const blurFor = z => dof > 0 ? clamp((z - foc) / 1600) * dof : 0;
    for (const it of all) {
      const s = it.svg(); if (!s) continue;
      // (the depth blur follows the distance smoothly: no rounding to steps, no threshold where it switches on)
      const bl = it.actor ? 0 : Math.round(blurFor(it.z) * 1000) / 1000;
      if (bl > 0.02) { const id = 'hd' + (n++); defs += `<filter id="${id}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${bl}"/></filter>`; body += `<g filter="url(#${id})">${s}</g>`; } else body += s;
    }
    const sb = Math.round(dof * 1000) / 1000;
    const shellG = sb > 0.02 ? `<filter id="hdS"><feGaussianBlur stdDeviation="${sb}"/></filter>` : '';
    // a warm wash of haze high in the vault, a cool one low in the shadows
    const wash = `<defs><linearGradient id="hzW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${(o.night || 0) > 0.5 ? '#000' : '#2a1e40'}" stop-opacity="0.28"/><stop offset="0.45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#140a10" stop-opacity="0.22"/></linearGradient></defs><rect x="-40" y="-40" width="1160" height="2000" fill="url(#hzW)"/>`;
    return `<defs>${shellG}${defs}</defs><g ${sb > 0.02 ? 'filter="url(#hdS)"' : ''}>${H.back}${H.shell}${H.light}</g>${body}${motes(cam, t, HL.lastSun && (o.night || 0) < 0.5 ? HL.lastSun : null)}${wash}`;
  };
})(window);
