// Sets for "The Stoker" (Titanic): boiler room with the decks above it (ballroom on top), the iceberg alongside the hull,
// the bridge, the bulkhead cutaway, the safe side of the watertight door, the stairwell, the boat deck.
// Backgrounds stay defined: light depth blur (dof1 at most on back layers), thin local mist, real detail on every layer.
(function (G) {
  const { f, shade, mix, rng, uid, OUT, ol } = G.RIG, C = G.CINE, E = G.ENV, S = G.SETS, P = G.PROPS;
  const lg = S.lg, mist = S.mist;
  // riveted steel plating: plates cw x ch with seams and rivet rows
  const plates = (x0, y0, x1, y1, cw, ch, col, seed, o = {}) => {
    const r = rng(seed); let g = `<rect x="${f(x0)}" y="${f(y0)}" width="${f(x1 - x0)}" height="${f(y1 - y0)}" fill="${col}" filter="url(#tex)"/>`;
    for (let y = y0; y < y1; y += ch) for (let x = x0 + ((Math.round((y - y0) / ch) % 2) * cw / 2) - cw; x < x1; x += cw) {
      const k = (r() - 0.5) * 0.12; g += `<rect x="${f(x)}" y="${f(y)}" width="${f(cw)}" height="${f(ch)}" fill="${shade(col, k)}" stroke="${shade(col, -0.45)}" stroke-width="3"/>`;
      if (!o.noRivets) for (let k2 = 1; k2 < 6; k2++) g += `<circle cx="${f(x + k2 * cw / 6)}" cy="${f(y + 9)}" r="3.4" fill="${shade(col, 0.22)}"/><circle cx="${f(x + k2 * cw / 6)}" cy="${f(y + ch - 9)}" r="3.4" fill="${shade(col, 0.22)}"/>`;
      if (r() > 0.7) g += `<path d="M${f(x + r() * cw)},${f(y + 10)} l${f((r() - 0.5) * 30)},${f(ch * (0.4 + r() * 0.5))}" stroke="#4a2a14" stroke-width="${f(4 + r() * 6)}" opacity="0.35" filter="url(#b4)"/>`;   // rust streaks
    }
    return g;
  };
  S.plates = plates;
  const pipe = (x0, y0, x1, y1, w, col) => `<path d="M${f(x0)},${f(y0)} L${f(x1)},${f(y1)}" stroke="${OUT}" stroke-width="${f(w + 4)}" stroke-linecap="round"/><path d="M${f(x0)},${f(y0)} L${f(x1)},${f(y1)}" stroke="${col}" stroke-width="${f(w)}" stroke-linecap="round"/><path d="M${f(x0)},${f(y0 - w * 0.22)} L${f(x1)},${f(y1 - w * 0.22)}" stroke="#fff" stroke-width="${f(w * 0.18)}" opacity="0.18"/>`;
  S.pipe = pipe;
  const steam = (x, y, h, t, seed, op = 0.4) => { let g = ''; for (let i = 0; i < 5; i++) { const ph = ((t * 0.5 + i / 5 + seed * 0.13) % 1); g += `<ellipse cx="${f(x + Math.sin(t + i + seed) * 20 + ph * 30)}" cy="${f(y - ph * h)}" rx="${f(20 + ph * 70)}" ry="${f(16 + ph * 50)}" fill="#d8d4cc" opacity="${f(op * Math.sin(Math.PI * ph))}" filter="url(#b8)"/>`; } return g; };
  S.steam = steam;
  const stars = (x0, y0, x1, y1, n, seed, t) => { const r = rng(seed); let g = ''; for (let i = 0; i < n; i++) { const tw = 0.5 + 0.5 * Math.sin(t * (1 + r() * 2) + i); g += `<circle cx="${f(x0 + r() * (x1 - x0))}" cy="${f(y0 + r() * (y1 - y0))}" r="${f(0.8 + r() * 2.2)}" fill="#e8eeff" opacity="${f((0.3 + r() * 0.6) * (0.6 + 0.4 * tw))}"/>`; } return g; };
  S.stars = stars;
  const boilerFront = (cx, cy, r) => {
    let g = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#2c2826" ${ol(2.4)}/><circle cx="${cx}" cy="${cy}" r="${r - 26}" fill="none" stroke="#1a1716" stroke-width="6"/>`;
    for (let i = 0; i < 36; i++) { const a = i / 36 * Math.PI * 2; g += `<circle cx="${f(cx + Math.cos(a) * (r - 13))}" cy="${f(cy + Math.sin(a) * (r - 13))}" r="5" fill="#4a4440"/>`; }
    g += `<path d="M${cx - r * 0.7},${cy - r * 0.5} A${r * 0.86},${r * 0.86} 0 0 1 ${cx + r * 0.2},${cy - r * 0.84}" stroke="#7a706a" stroke-width="10" fill="none" opacity="0.35"/>`;
    g += `<circle cx="${cx + r * 0.42}" cy="${cy - r * 0.4}" r="34" fill="#d8d0c0" ${ol(2)}/><path d="M${cx + r * 0.42},${cy - r * 0.4} l18,-14" stroke="#1a1410" stroke-width="4"/>`;   // pressure gauge
    return g;
  };

  // ============================================== THE BOILER ROOM (front view). Floor at FY = 1700.
  // o.red 0..1 alarm wash, o.gash 0..1 hull burst on the left with a water jet, o.heat furnace heat 0..1, o.steamF steam at the furnaces
  S.BOILER_FURNACE = [830, 1270];
  S.boiler = (t, o = {}) => {
    const FY = 1700, heat = o.heat ?? 1;
    let back = plates(-800, 0, 1900, 1720, 260, 180, '#3a3432', 11) + `<rect x="-800" y="0" width="2700" height="240" fill="#14100e" opacity="0.6"/>`;
    back += pipe(-800, 130, 1900, 130, 46, '#5a4a3a') + pipe(-800, 205, 1900, 205, 30, '#6a5a44') + pipe(160, 0, 160, 600, 34, '#5a4a3a') + pipe(980, 0, 980, 520, 40, '#4e4436');
    for (const [x, y] of [[100, 420], [1030, 380], [-420, 400], [1500, 420]]) back += `<circle cx="${x}" cy="${y}" r="26" fill="#d8d0c0" ${ol(1.6)}/><path d="M${x},${y} l${f(14 * Math.cos(t * 0.3 + x))},-14" stroke="#1a1410" stroke-width="3"/>`;
    back += steam(160, 560, 300, t, 1, 0.3) + steam(980, 500, 280, t, 2, 0.25);
    let mid = '';
    for (const [x, s] of [[-520, 0.8], [1640, 0.8]]) mid += P.cageLamp(x, 520, s, 1, '#ffd890');
    let boilers = '';
    const blast = o.blast || 0;
    for (const cx of [-180, 670, 1520]) boilers += boilerFront(cx, 780, 340);
    for (const cx of [-180, 670, 1520]) for (const dx of [-160, 160]) boilers += P.furnace(cx + dx, 1270, 0.82, t + cx * 0.01 + dx * 0.003, { heat: heat * (1 - blast), steam: o.steamF || 0, seed: Math.abs(cx + dx) });
    boilers += `<rect x="-800" y="1440" width="2700" height="40" fill="#1e1a18" ${ol(1.4)}/>`;   // furnace sill
    let floor = `<rect x="-800" y="${FY}" width="2700" height="900" fill="#2a2624" filter="url(#ground)"/>`;
    for (let x = -800; x < 1900; x += 46) for (let y = FY + 20; y < FY + 700; y += 40) floor += `<path d="M${x + ((y / 40) % 2) * 23},${y} l14,-6" stroke="#4a4440" stroke-width="3" opacity="0.5"/>`;
    floor += C.radial(670, FY + 40, 900, '#ff8a30', 0.18 * heat) + P.coalPile(680, FY + 10, 330, 230, 21) + P.coalPile(-170, FY + 10, 330, 230, 22) + P.coalPile(1500, FY + 30, 340, 130, 23);
    // hull breach on the left wall: torn plates and the jet of black water
    let breach = '';
    const gs = o.gash || 0;
    if (gs > 0.01) {
      const hx = -40, hy = 1330, R = 40 + 120 * gs;
      breach += `<path d="M${hx - R},${hy} L${hx - R * 0.5},${hy - R * 0.8} L${hx + R * 0.2},${hy - R * 0.55} L${hx + R * 0.9},${hy - R * 0.9} L${hx + R},${hy + R * 0.1} L${hx + R * 0.4},${hy + R * 0.7} L${hx - R * 0.6},${hy + R * 0.6}Z" fill="#05080c" ${ol(2)}/>`;
      for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; breach += `<path d="M${f(hx + Math.cos(a) * R * 0.8)},${f(hy + Math.sin(a) * R * 0.7)} l${f(Math.cos(a) * 40 * gs)},${f(Math.sin(a) * 30 * gs)}" stroke="#4a4442" stroke-width="16" stroke-linecap="round"/>`; }
    }
    return { back: { p: 0.62, svg: `<g filter="url(#dof1)">${back}</g>` }, mid: { p: 0.82, svg: mid, light: true }, boilers: { p: 1, svg: boilers }, floor: { p: 1, svg: floor }, breach: { p: 1, svg: breach }, FY };
  };
  // the jet of seawater bursting from the breach (drawn in front of people); k 0..1 strength
  S.waterJet = (t, k, hx = -40, hy = 1330) => {
    if (k <= 0.01) return '';
    let g = '';
    for (let i = 0; i < 14; i++) { const ph = ((t * 2.2 + i / 14) % 1), sp = 0.7 + (i % 5) * 0.12, x = hx + ph * 900 * sp * k, y = hy + (i % 3 - 1) * 26 + ph * ph * 420; g += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(60 + ph * 90)}" ry="${f(22 + ph * 40)}" fill="${i % 2 ? '#1a2a32' : '#cfe0e6'}" opacity="${f((i % 2 ? 0.75 : 0.45) * (1 - ph * 0.6) * k)}" filter="url(#b4)"/>`; }
    // the solid core of the jet: green-black water with a white foaming edge, not a dark hose
    const core = `M${hx},${hy - 30 * k} C${hx + 300},${hy - 50 * k} ${hx + 600},${hy + 80} ${hx + 900 * k},${hy + 380}`;
    g = `<path d="${core}" stroke="#24424c" stroke-width="${f(80 * k)}" fill="none" opacity="0.45" filter="url(#b8)"/><path d="${core}" stroke="#d8eef2" stroke-width="${f(10 * k)}" fill="none" opacity="0.55" stroke-dasharray="40 30" stroke-dashoffset="${f(-t * 900)}"/>` + g;
    return g;
  };
  // flood water seen from the front: level y (surface), dark and churning, foam on top; drawn in front of people
  S.flood = (t, level, o = {}) => {
    const id = uid('fl'), x0 = o.x0 ?? -1500, x1 = o.x1 ?? 2700;
    let g = `<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="${f(level)}" x2="0" y2="${f(level + 520)}"><stop offset="0" stop-color="#1c3038" stop-opacity="0.55"/><stop offset="0.4" stop-color="#0e1c22" stop-opacity="0.85"/><stop offset="1" stop-color="#05080a" stop-opacity="0.95"/></linearGradient></defs>`;
    let wl = `M${x0},${f(level)}`; for (let x = x0; x <= x1; x += 40) wl += ` L${x},${f(level + Math.sin(x * 0.012 + t * 3) * 10 + Math.sin(x * 0.031 - t * 4.4) * 5)}`;
    g += `<path d="${wl} L${x1},${f(level + 2600)} L${x0},${f(level + 2600)}Z" fill="url(#${id})"/>`;
    g += `<path d="${wl}" stroke="#d8e8ea" stroke-width="5" fill="none" opacity="0.7"/>`;
    const r = rng(o.seed || 4);
    for (let i = 0; i < 30; i++) { const x = x0 + r() * (x1 - x0), ph = (t * 0.6 + r()) % 1; g += `<ellipse cx="${f(x + Math.sin(t + i) * 20)}" cy="${f(level + 4 + Math.sin(x * 0.012 + t * 3) * 10)}" rx="${f(20 + r() * 50)}" ry="${f(4 + r() * 5)}" fill="#e8f0f0" opacity="${f(0.5 * Math.sin(Math.PI * ph))}"/>`; }
    return g;
  };

  // ============================================== THE SHIP IN SECTION above the boiler room (opening crane):
  // boiler ceiling y 250, third-class cabin (-1100..250), corridor (-2300..-1100), the first-class ballroom above -2300.
  S.decks = (t, o = {}) => {
    const deckBand = y => `<rect x="-900" y="${y - 50}" width="2900" height="100" fill="#1a1816" ${ol(2)}/>` + Array.from({ length: 40 }, (_, i) => `<circle cx="${-880 + i * 72}" cy="${y}" r="5" fill="#3a3634"/>`).join('') + `<rect x="-900" y="${y - 50}" width="2900" height="10" fill="#4a4440"/>`;
    // third class: painted steel, bunks with sleepers, a porthole at night
    let cab = `<rect x="-900" y="-1100" width="2900" height="1350" fill="#a89a7c" filter="url(#plaster)"/><rect x="-900" y="-1100" width="2900" height="1350" fill="#1a1410" opacity="0.45"/>`;
    for (const bx of [-300, 300, 900]) {
      for (const by of [-420, 60]) { cab += `<rect x="${bx}" y="${by - 30}" width="420" height="40" fill="#6a5a44" ${ol(1.4)}/><path d="M${bx + 20},${by - 30} Q${bx + 210},${by - 100} ${bx + 400},${by - 30}Z" fill="${['#6a4a3a', '#4a5a6a', '#7a6a4a'][(bx + by + 900) % 3 === 0 ? 0 : (bx > 0 ? 1 : 2)]}" ${ol(1.4)}/><circle cx="${bx + 40}" cy="${by - 52}" r="26" fill="#d8b090" ${ol(1.2)}/><path d="M${bx + 20},${by - 70} q20,-18 44,-4" stroke="#3a2a1a" stroke-width="10" fill="none"/>`; }
      cab += `<rect x="${bx - 10}" y="-520" width="16" height="620" fill="#4a3a28"/><rect x="${bx + 414}" y="-520" width="16" height="620" fill="#4a3a28"/>`;
    }
    cab += `<circle cx="-560" cy="-640" r="70" fill="#0a1020" stroke="#8a7a5a" stroke-width="16"/>` + stars(-610, -690, -510, -590, 8, 5, t) + P.cageLamp(620, -900, 0.9, 1, '#ffc880');
    // corridor ("Scotland Road"): a long passage with doors and pipes, a steward hurrying
    let cor = `<rect x="-900" y="-2300" width="2900" height="1200" fill="#c8bca0" filter="url(#plaster)"/><rect x="-900" y="-2300" width="2900" height="1200" fill="#2a2016" opacity="0.4"/>`;
    for (let x = -700; x < 1900; x += 360) cor += `<rect x="${x}" y="-1820" width="170" height="680" fill="#6a4a2a" ${ol(1.6)}/><circle cx="${x + 140}" cy="-1480" r="9" fill="#c8a040"/>`;
    cor += pipe(-900, -2150, 2000, -2150, 30, '#7a6a54') + pipe(-900, -2080, 2000, -2080, 20, '#6a5a44');
    for (const x of [-400, 400, 1200]) cor += P.cageLamp(x, -2000, 0.8, 1, '#ffe0a0');
    // the first-class ballroom: oak panels and gilt, arched windows on the night, the chandelier, the band
    let ball = `<rect x="-900" y="-4200" width="2900" height="1900" fill="#4a2e1a" filter="url(#woodV)"/>`;
    for (let x = -800; x < 1900; x += 300) ball += `<rect x="${x}" y="-3300" width="230" height="860" fill="#5a3a22" stroke="#c8a050" stroke-width="5"/><rect x="${x + 20}" y="-3280" width="190" height="820" fill="none" stroke="#2a1a0c" stroke-width="3"/>`;
    for (const x of [-500, 1100]) ball += `<path d="M${x},-3400 L${x},-3800 A160,160 0 0 1 ${x + 320},-3800 L${x + 320},-3400Z" fill="#0a1020" stroke="#c8a050" stroke-width="12"/>` + stars(x + 10, -3940, x + 310, -3420, 14, x, t);
    ball += `<rect x="-900" y="-3420" width="2900" height="24" fill="#c8a050"/>`;
    ball += C.radial(540, -3300, 1300, '#ffd8a0', 0.35);
    let floorB = `<rect x="-900" y="-2360" width="2900" height="70" fill="#7a5030" filter="url(#woodH)" ${ol(1.4)}/>`;
    for (let x = -900; x < 2000; x += 60) floorB += `<path d="M${x},-2360 l30,60" stroke="#4a2e18" stroke-width="3" opacity="0.6"/>`;
    const chand = P.chandelier(540, -3560, 1.15, t, 12);
    return { cab: { p: 1, svg: cab + deckBand(250) }, cor: { p: 1, svg: cor + deckBand(-1100) }, ball: { p: 1, svg: ball + floorB + deckBand(-2300) }, chand: { p: 1, svg: chand } };
  };

  // ============================================== THE ICEBERG along the hull at midnight: waterline WL. o.rip 0..1, o.tc contact time
  S.ocean = (t, o = {}) => {
    const WL = 1000, hullV = 180, xo = -t * hullV;
    let sky = lg('ocS', [[0, '#01030a'], [0.7, '#060c1c'], [1, '#0e1a30']]) + `<rect x="-1500" y="-2400" width="4200" height="3500" fill="url(#ocS)"/>` + stars(-1500, -2400, 2700, 900, 420, 3, t);
    // the hull: black topsides with lit portholes, white boot-topping, red below the waterline; it slides left
    let hull = `<rect x="-1500" y="80" width="4200" height="2600" fill="#0c0c0e"/>`;
    hull += `<rect x="-1500" y="60" width="4200" height="30" fill="#2a2a2e"/>` + Array.from({ length: 60 }, (_, i) => `<rect x="${f(-1500 + ((i * 90 + xo) % 4200 + 4200) % 4200)}" y="20" width="6" height="44" fill="#3a3a40"/>`).join('');   // railing
    for (const [py, sp, col] of [[260, 150, '#ffd890'], [420, 130, '#ffcf80'], [600, 170, '#ffe0a0']]) for (let i = 0; i < 40; i++) { const x = -1500 + ((i * sp + xo * 1.0) % 4200 + 4200) % 4200; if ((i * 7) % 5 === 0) continue; hull += `<circle cx="${f(x)}" cy="${py}" r="15" fill="${col}" opacity="0.9"/>` + C.radial(x, py, 50, col, 0.3); }
    for (let i = 0; i < 70; i++) { const x = -1500 + ((i * 64 + xo) % 4200 + 4200) % 4200; hull += `<path d="M${f(x)},100 L${f(x)},2600" stroke="#1c1c20" stroke-width="3"/>`; }
    hull += `<rect x="-1500" y="${WL - 40}" width="4200" height="46" fill="#d8d4cc"/><rect x="-1500" y="${WL + 6}" width="4200" height="1700" fill="#3a1410"/>`;
    // the gash: torn plates from the first contact point (which slides left with the hull) to the iceberg's spur
    const spur = [430, 1560], rip = o.rip || 0, tc = o.tc ?? 6.9;
    // underwater plate seams so the red hull reads below the waterline
    for (let y = WL + 160; y < 2600; y += 170) hull += `<path d="M-1500,${y} L2700,${y}" stroke="#1e0806" stroke-width="5"/>`;
    if (rip > 0) {
      // the tear glows from the furnaces inside: the boiler room is right behind these plates
      const xa = spur[0] - Math.max(0, (t - tc)) * hullV, r = rng(9), gid = uid('gg'); let d = `M${f(xa)},${spur[1]}`;
      for (let x = xa; x <= spur[0]; x += 36) d += ` L${f(x)},${f(spur[1] - 14 - r() * 34 * rip)}`;
      for (let x = spur[0]; x >= xa; x -= 36) d += ` L${f(x)},${f(spur[1] + 14 + r() * 34 * rip)}`;
      hull += `<defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a0a04"/><stop offset="0.5" stop-color="#ff7a20"/><stop offset="1" stop-color="#3a0a04"/></linearGradient></defs><path d="${d}Z" fill="url(#${gid})" stroke="#c8c0b8" stroke-width="6"/>`;
      hull += C.radial((xa + spur[0]) / 2, spur[1], Math.max(80, (spur[0] - xa) * 0.7), '#ff8a30', 0.35 * rip);
      for (let x = xa; x < spur[0]; x += 80) hull += `<path d="M${f(x)},${spur[1] - 34} l24,-46 M${f(x + 40)},${spur[1] + 34} l22,40" stroke="#8a2a1e" stroke-width="14" stroke-linecap="round"/>`;
      for (let i = 0; i < 8; i++) { const ph = ((t * 3 + i / 8) % 1); hull += `<circle cx="${f(spur[0] - 10 - ph * 60)}" cy="${f(spur[1] + (i % 4 - 1.5) * 20 - ph * 30)}" r="${f(3 + 3 * (1 - ph))}" fill="#ffd890" opacity="${f((1 - ph) * rip)}"/>`; }   // rivets popping
    }
    // underwater murk over the lower hull
    let under = lg('ocU', [[0, '#0e3444', 0.3], [0.5, '#06202c', 0.55], [1, '#020810', 0.85]]) + `<rect x="-1500" y="${WL}" width="4200" height="1900" fill="url(#ocU)"/>`;
    const r2 = rng(14); for (let i = 0; i < 60; i++) under += `<circle cx="${f(-800 + r2() * 2600 + Math.sin(t * 0.4 + i) * 20)}" cy="${f(WL + 40 + r2() * 1500 - (t * 30 % 200))}" r="${f(1.5 + r2() * 3)}" fill="#9ad0e0" opacity="${f(0.15 + r2() * 0.2)}"/>`;
    // bubbles sucked into the gash
    if (rip > 0.05) for (let i = 0; i < 24; i++) { const ph = ((t * 1.4 + i / 24) % 1), x0 = spur[0] - 120 - (i % 6) * 120 + 400 * (1 - ph); under += `<circle cx="${f(x0)}" cy="${f(spur[1] + 140 * (1 - ph) * ((i % 2) ? 1 : -1))}" r="${f(4 + (i % 4) * 3)}" fill="none" stroke="#cfe8f0" stroke-width="2" opacity="${f(0.7 * ph * rip)}"/>`; }
    // the iceberg: a towering jagged white mass above, a huge pale-blue body below with a spur pressing into the hull
    const bob = Math.sin(t * 0.6) * 6;
    let berg = `<path d="M560,${WL} L600,700 L700,560 L760,600 L840,330 L930,420 L1010,240 L1110,470 L1230,420 L1320,640 L1460,700 L1580,${WL}Z" fill="#dfeaf2" ${ol(2)}/>`;
    berg += `<path d="M840,330 L900,${WL} M1010,240 L1060,${WL} M700,560 L740,${WL}" stroke="#9ab8cc" stroke-width="18" opacity="0.5"/><path d="M1010,240 L1110,470 L1230,420 L1320,640 L1460,700 L1580,${WL}Z" fill="#9ab4c8" opacity="0.55"/>`;
    let bergU = `<path d="M560,${WL} C480,1150 ${spur[0] - 30},1400 ${spur[0]},${spur[1]} C${spur[0] + 60},1720 520,1980 760,2200 C1100,2400 1500,2300 1700,2000 L1700,${WL}Z" fill="#7aa6c0" opacity="0.9" ${ol(2)}/>` + `<path d="M620,${WL + 60} C580,1250 ${spur[0] + 40},1480 ${spur[0] + 60},1600" stroke="#cfe6f2" stroke-width="20" fill="none" opacity="0.35"/>`;
    // ice chips grinding off at the spur
    if (rip > 0.05) for (let i = 0; i < 10; i++) { const ph = ((t * 1.8 + i / 10) % 1); bergU += `<path d="M${f(spur[0] - 20 - ph * 160)},${f(spur[1] - 40 + (i % 5) * 20 + ph * 60)} l12,-8 l8,12 l-14,6Z" fill="#e8f4fa" opacity="${f(0.8 * (1 - ph) * rip)}"/>`; }
    let surf = `M-1500,${WL}`; for (let x = -1500; x <= 2700; x += 40) surf += ` L${x},${f(WL + Math.sin(x * 0.01 + t * 1.6) * 7)}`;
    const surface = `<path d="${surf}" stroke="#a8c8d8" stroke-width="4" fill="none" opacity="0.6"/>` + `<path d="${surf} L2700,${WL - 300} L-1500,${WL - 300}Z" fill="#0a1828" opacity="0.18"/>`;
    return { sky: { p: 0.25, svg: sky }, hull: { p: 1, svg: hull }, under: { p: 1, svg: under }, berg: { p: 1.04, svg: `<g transform="translate(0,${f(bob)})">${bergU}${berg}</g>` }, surface: { p: 1, svg: surface }, WL, spur };
  };

  // ============================================== THE BRIDGE at night: the door switch panel on the right
  S.bridge = (t, o = {}) => {
    let out = lg('brS', [[0, '#01030a'], [1, '#0c1628']]) + `<rect x="-1200" y="-800" width="3600" height="2200" fill="url(#brS)"/>` + stars(-1200, -800, 2400, 820, 260, 7, t);
    out += `<rect x="-1200" y="760" width="3600" height="400" fill="#04070c"/><path d="M-1200,770 L2400,770" stroke="#1a2a3a" stroke-width="3"/>`;
    out += `<path d="M260,1200 L540,700 L820,1200Z" fill="#0c0c0e"/><path d="M540,700 L540,180" stroke="#141418" stroke-width="12"/><circle cx="540" cy="190" r="10" fill="#fff4d0"/>` + C.radial(540, 190, 120, '#fff0c0', 0.5);
    out += `<path d="M1500,770 L1560,600 L1600,650 L1640,560 L1720,770Z" fill="#c8d8e4" opacity="0.75"/>`;   // the iceberg, passing in the dark
    let frame = `<rect x="-1200" y="-800" width="3600" height="200" fill="#2a1a10" filter="url(#woodH)"/><rect x="-1200" y="900" width="3600" height="1200" fill="#3a2414" filter="url(#woodV)"/>`;
    for (let x = -1100; x < 2400; x += 420) frame += `<rect x="${x}" y="-620" width="40" height="1540" fill="#2a1a10" ${ol(1.6)}/>`;
    frame += `<rect x="-1200" y="890" width="3600" height="30" fill="#c8a050"/>`;
    for (let x = -1000; x < 2400; x += 260) frame += `<rect x="${x}" y="1000" width="200" height="560" fill="#4a2e1a" stroke="#1e120a" stroke-width="4"/>`;
    let props = '';
    // the ship's wheel and an engine telegraph
    props += `<g transform="translate(260,1290)"><rect x="-26" y="0" width="52" height="420" fill="#5a3a1e" ${ol(1.6)}/><circle r="170" fill="none" stroke="#6a4424" stroke-width="22"/><circle r="170" fill="none" ${ol(2)}/>` + Array.from({ length: 8 }, (_, i) => { const a = i / 8 * Math.PI * 2 + t * 0.05; return `<path d="M0,0 L${f(Math.cos(a) * 210)},${f(Math.sin(a) * 210)}" stroke="#6a4424" stroke-width="16" stroke-linecap="round"/>`; }).join('') + `<circle r="34" fill="#c8a050" ${ol(1.4)}/></g>`;
    props += `<g transform="translate(-160,1180)"><rect x="-30" y="80" width="60" height="460" fill="#b8902e" ${ol(1.4)}/><circle cx="0" cy="40" r="90" fill="#c8a040" ${ol(1.6)}/><circle cx="0" cy="40" r="66" fill="#f0e8d0" ${ol(1)}/><path d="M0,40 L${f(Math.cos(-2.2) * 56)},${f(40 + Math.sin(-2.2) * 56)}" stroke="#1a1410" stroke-width="7"/></g>`;
    props += P.cageLamp(540, 980, 0.9, 1, '#ffd890');
    let floor = `<rect x="-1200" y="1720" width="3600" height="600" fill="#5a3a20" filter="url(#woodH)"/>` + Array.from({ length: 30 }, (_, i) => `<path d="M-1200,${1740 + i * 22} L2400,${1740 + i * 22}" stroke="#3a2412" stroke-width="2" opacity="0.5"/>`).join('');
    return { out: { p: 0.4, svg: out }, frame: { p: 0.85, svg: frame }, props: { p: 1, svg: props + floor } };
  };

  // ============================================== THE BULKHEAD IN SECTION (side view). Bulkhead at x 585..655, door opening y 820..1700.
  // o.doorY door bottom edge, o.wl water level on the left, o.red alarm, o.spill 0..1 water gushing under the door
  S.SEC = { BX0: 585, BX1: 655, FY: 1700, DTOP: 820 };
  S.section = (t, o = {}) => {
    const { BX0, BX1, FY, DTOP } = S.SEC, doorY = o.doorY ?? DTOP;
    // left: the flooding boiler room, furnaces glowing at the back; right: the next room, dim and dry
    let left = plates(-1200, 0, BX0, 1720, 240, 170, '#3a3230', 31) + boilerFront(-480, 760, 300) + boilerFront(120, 760, 300);
    for (const x of [-620, -340, -20, 260]) left += P.furnace(x, 1240, 0.72, t + x * 0.01, { heat: o.heat ?? 1, steam: o.steamF || 0, seed: Math.abs(x) });
    left += pipe(-1200, 150, BX0, 150, 40, '#5a4a3a') + P.alarm(380, 320, 0.9, t, o.ring || 0, o.red || 0);
    let right = plates(BX1, 0, 2400, 1720, 240, 170, '#2a2c30', 37) + pipe(BX1, 220, 2400, 220, 34, '#3a3c40') + pipe(1180, 220, 1180, 1700, 30, '#3a3c40');
    right += `<path d="M1500,300 L1500,1700 M1580,300 L1580,1700" stroke="#1a1c20" stroke-width="12"/>` + Array.from({ length: 12 }, (_, i) => `<path d="M1500,${380 + i * 110} L1580,${380 + i * 110}" stroke="#1a1c20" stroke-width="10"/>`).join('');   // ladder
    right += P.cageLamp(1000, 420, 0.9, 1, '#d8e4f0') + `<rect x="${BX1}" y="0" width="2400" height="1720" fill="#060a14" opacity="0.35"/>`;
    // floors
    let floor = `<rect x="-1200" y="${FY}" width="3600" height="700" fill="#24201e" filter="url(#ground)"/>`;
    if (o.spill > 0.01) { const len = 200 + 700 * o.spill; floor += `<path d="M${BX1},${FY - 6} Q${BX1 + len * 0.5},${FY - 14} ${BX1 + len},${FY - 2} L${BX1 + len},${FY + 10} L${BX1},${FY + 10}Z" fill="#1c3038" opacity="0.85"/>`; }
    // the bulkhead itself: steel wall above the opening, the door housing, the sill, the door slab with its guide rails
    let wall = `<rect x="${BX0}" y="-600" width="${BX1 - BX0}" height="${DTOP + 600}" fill="#4a4442" ${ol(2)}/><rect x="${BX0 - 14}" y="${DTOP - 30}" width="${BX1 - BX0 + 28}" height="30" fill="#2a2624" ${ol(1.6)}/>`;
    wall += `<rect x="${BX0 - 10}" y="${FY - 12}" width="${BX1 - BX0 + 20}" height="24" fill="#2a2624" ${ol(1.4)}/>`;
    const slab = `<rect x="${BX0 + 6}" y="${f(doorY - 900)}" width="${BX1 - BX0 - 12}" height="900" fill="#5a5c60" filter="url(#tex)" ${ol(2.2)}/>` + Array.from({ length: 8 }, (_, i) => `<circle cx="${(BX0 + BX1) / 2}" cy="${f(doorY - 860 + i * 110)}" r="6" fill="#7a7c80"/>`).join('') + `<rect x="${BX0 + 6}" y="${f(doorY - 18)}" width="${BX1 - BX0 - 12}" height="18" fill="#2a2c30"/>`;
    return { left: { p: 1, svg: left }, right: { p: 1, svg: right }, floor: { p: 1, svg: floor }, wall: { p: 1, svg: wall }, slab, doorY };
  };

  // ============================================== THE SAFE SIDE of the watertight door, face-on. Floor at FY 1660, door frame x 250..830.
  // o.doorY bottom edge of the door, o.bulge 0..1, o.flow 0..1 water streaming from under the door, o.red lamp
  S.SAFE = { FY: 1660, X0: 250, X1: 830, TOP: 760 };
  S.doorSafe = (t, o = {}) => {
    const { FY, X0, X1, TOP } = S.SAFE, doorY = o.doorY ?? FY, b = o.bulge || 0;
    let wall = plates(-1000, -200, 2200, FY + 20, 260, 180, '#3c3a38', 41);
    wall += pipe(-1000, 120, 2200, 120, 44, '#5a4a3a') + pipe(-1000, 200, 2200, 200, 26, '#4a3e30') + pipe(1080, 0, 1080, FY, 38, '#4a4036') + pipe(-60, 0, -60, FY, 30, '#4a4036');
    wall += `<circle cx="1080" cy="900" r="46" fill="none" stroke="#8a2a1a" stroke-width="12"/><path d="M1034,900 L1126,900 M1080,854 L1080,946" stroke="#8a2a1a" stroke-width="8"/>`;   // valve wheel
    wall += P.cageLamp(-220, 640, 0.9, 1, '#ffd890') + P.cageLamp(1340, 640, 0.9, 1, '#ffd890');
    // the door frame (coaming) and the dark recess above where the door hangs when open
    let frame = `<rect x="${X0 - 60}" y="${TOP - 70}" width="${X1 - X0 + 120}" height="${FY - TOP + 70}" fill="#24221f" ${ol(2.4)}/><rect x="${X0}" y="${TOP}" width="${X1 - X0}" height="${FY - TOP}" fill="#0a0806"/>`;
    for (let y = TOP - 40; y < FY; y += 56) frame += `<circle cx="${X0 - 30}" cy="${y}" r="7" fill="#5a5652"/><circle cx="${X1 + 30}" cy="${y}" r="7" fill="#5a5652"/>`;
    frame += `<rect x="${X0 - 70}" y="${FY - 16}" width="${X1 - X0 + 140}" height="22" fill="#1a1816" ${ol(1.6)}/>`;
    const door = `<g>${P.wtDoor(X0 + 6, doorY - (FY - TOP), X1 - 6, doorY, { bulge: b })}</g>`;
    let floor = `<rect x="-1000" y="${FY}" width="3200" height="900" fill="#2a2826" filter="url(#ground)"/>`;
    for (let x = -1000; x < 2200; x += 46) for (let y = FY + 20; y < FY + 600; y += 40) floor += `<path d="M${x + ((y / 40) % 2) * 23},${y} l14,-6" stroke="#4a4644" stroke-width="3" opacity="0.5"/>`;
    if (o.flow > 0.01) {
      floor += `<path d="M${X0 - 40},${FY + 4} C${X0 - 200},${FY + 120} ${X1 + 200},${FY + 140} ${X1 + 40},${FY + 4}Z" fill="#1c3038" opacity="${f(0.7 * o.flow)}"/>`;
      for (let i = 0; i < 12; i++) { const ph = ((t * 1.6 + i / 12) % 1), x = X0 + 20 + i * (X1 - X0 - 40) / 11; floor += `<path d="M${f(x)},${FY} q${f((i - 6) * 8)},${f(30 + ph * 80)} ${f((i - 6) * 20 * ph)},${f(60 + ph * 200)}" stroke="#a8c8d0" stroke-width="3" fill="none" opacity="${f(0.5 * o.flow * (1 - ph))}"/>`; }
    }
    return { wall: { p: 0.92, svg: wall }, frame: { p: 1, svg: frame }, door: { p: 1, svg: door }, floor: { p: 1, svg: floor } };
  };

  // ============================================== THE STAIRWELL: zigzag iron flights rising 520 px each; landings alternate x 230 / 850
  S.FLIGHTS = (() => { const L = []; for (let k = 0; k < 4; k++) { const a = [k % 2 ? 850 : 230, 1700 - k * 520], b = [k % 2 ? 230 : 850, 1700 - (k + 1) * 520]; L.push([a, b]); } return L; })();
  S.stairs = (t, o = {}) => {
    let wall = plates(-800, -3600, 1900, 2900, 260, 200, '#34322f', 51);
    wall += pipe(-40, -3600, -40, 1800, 40, '#4a4036') + pipe(1120, -3600, 1120, 1800, 34, '#3e382e');
    // more flights above and below, lost in the dark: the climb feels endless
    for (let k = -2; k < 7; k++) { const y = 1700 - k * 520; if (k >= 0 && k < 4) continue; wall += `<path d="M${k % 2 ? 850 : 230},${y + 26} L${k % 2 ? 230 : 850},${y - 494}" stroke="#1e1e22" stroke-width="26" opacity="0.8"/>`; }
    for (let k = -1; k < 7; k++) wall += P.cageLamp(k % 2 ? 1000 : 80, 1300 - k * 520, 0.8, 1, k < 2 ? '#ff8a60' : '#e8eef4');
    wall += lg('stG', [[0, '#c8d8e8', 0.12], [0.6, '#000000', 0], [1, '#6a0a04', 0.25]]) + `<rect x="-800" y="-3600" width="2700" height="5400" fill="url(#stG)"/>`;
    const top = 1700 - 4 * 520;   // the last landing (left side): the door to the deck beside it
    wall += `<rect x="-60" y="${top - 400}" width="200" height="400" fill="#0a0c10" ${ol(2)}/>` + `<rect x="-60" y="${top - 400}" width="200" height="400" fill="none" stroke="#e8f0ff" stroke-width="${f(4 + 6 * (o.doorGlow || 0))}" opacity="${f(0.4 + 0.5 * (o.doorGlow || 0))}"/>` + C.radial(40, top - 200, 420, '#dfe8ff', 0.25 + 0.4 * (o.doorGlow || 0));
    // the door swinging open onto the freezing night: cold light floods out of the doorway
    if (o.doorOpen > 0) { const k = o.doorOpen; wall += `<rect x="-60" y="${top - 400}" width="${f(200 * k)}" height="400" fill="#dfe8ff" opacity="${f(0.85 * k)}"/><path d="M-60,${top - 400} L${f(-60 - 70 * k)},${top - 380} L${f(-60 - 70 * k)},${top + 10} L-60,${top}Z" fill="#14161c" ${ol(1.6)}/>` + C.radial(40, top - 200, 700, '#e8f0ff', 0.5 * k); }
    // the bottom of the shaft: a steel floor with water pooled on it, so the frame never runs out below the first flight
    let back = `<rect x="-900" y="1724" width="2900" height="1200" fill="#1e1c1a" filter="url(#ground)"/><rect x="-900" y="1724" width="2900" height="14" fill="#3a3632"/>` +
      `<ellipse cx="520" cy="1800" rx="620" ry="40" fill="#1c3038" opacity="0.6"/><ellipse cx="520" cy="1796" rx="560" ry="10" fill="#6a8a94" opacity="0.25"/>`, front = '';
    for (const [a, b] of S.FLIGHTS) {
      const n = 12;
      back += `<path d="M${a[0]},${a[1] + 26} L${b[0]},${b[1] + 26}" stroke="#1a1a1c" stroke-width="30"/>`;
      for (let i = 0; i < n; i++) { const u = (i + 0.5) / n, x = a[0] + (b[0] - a[0]) * u, y = a[1] + (b[1] - a[1]) * u; back += `<rect x="${f(x - 30)}" y="${f(y - 4)}" width="60" height="12" fill="#3a3a3e" ${ol(1)}/>`; }
      back += `<rect x="${b[0] - 120}" y="${b[1]}" width="240" height="26" fill="#2a2a2e" ${ol(1.4)}/>`;   // landing
      // the near railing passes in front of the climber
      front += `<path d="M${a[0]},${a[1] - 300} L${b[0]},${b[1] - 300}" stroke="${OUT}" stroke-width="16" stroke-linecap="round"/><path d="M${a[0]},${a[1] - 300} L${b[0]},${b[1] - 300}" stroke="#4a4a50" stroke-width="11" stroke-linecap="round"/>`;
      for (let i = 0; i <= 4; i++) { const u = i / 4, x = a[0] + (b[0] - a[0]) * u, y = a[1] + (b[1] - a[1]) * u; front += `<path d="M${f(x)},${f(y)} L${f(x)},${f(y - 300)}" stroke="#2a2a2e" stroke-width="9"/>`; }
    }
    // blood on the treads behind the climber
    if (o.prints) for (const [x, y, k] of o.prints) back += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(14 * k)}" ry="${f(6 * k)}" fill="#7a0c0a" opacity="0.85"/>`;
    return { wall: { p: 0.9, svg: wall }, back: { p: 1, svg: back }, front: { p: 1, svg: front }, top };
  };

  // ============================================== THE BOAT DECK at night, listing. Deck FY 1640. Gate post x 980, gate closes to x 700.
  // o.gate 0..1 (closed), o.lock, o.boatY lifeboat keel y, o.rocket 0..1 distress rocket burst
  S.DECK = { FY: 1640, GFIX: 990, GSHUT: 700 };
  S.deck = (t, o = {}) => {
    const { FY } = S.DECK;
    let sky = lg('dkS', [[0, '#01030a'], [1, '#0a1428']]) + `<rect x="-1500" y="-1500" width="4200" height="3000" fill="url(#dkS)"/>` + stars(-1500, -1500, 2700, 900, 320, 21, t);
    if (o.rocket > 0) { const k = o.rocket; for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2, R = 40 + 160 * k; sky += `<circle cx="${f(1500 + Math.cos(a) * R)}" cy="${f(-200 + Math.sin(a) * R + k * k * 140)}" r="4" fill="#fff8e8" opacity="${f(1 - k)}"/>`; } sky += C.radial(1500, -200, 300, '#fff0d0', 0.4 * (1 - k)); }
    let sea = `<g transform="rotate(-4,540,900)"><rect x="-1500" y="900" width="4200" height="1400" fill="#020408"/><path d="M-1500,900 L2700,900" stroke="#1a2a3a" stroke-width="3"/>` + Array.from({ length: 5 }, (_, i) => `<circle cx="${-300 + i * 420}" cy="${960 + (i % 2) * 30}" r="4" fill="#ffd890" opacity="0.8"/>`).join('') + `</g>`;   // distant lifeboat lanterns
    // the superstructure: officers' quarters with lit windows the whole width, two funnels venting steam, a mast with its lamp
    let sup = `<rect x="-900" y="760" width="3400" height="900" fill="#d8d0bc" filter="url(#plaster)" ${ol(2)}/><rect x="-900" y="760" width="3400" height="900" fill="#0a1020" opacity="0.55"/><rect x="-900" y="740" width="3400" height="30" fill="#8a7a5a" ${ol(1.4)}/>`;
    for (let x = -820; x < 2400; x += 170) { const on = (x / 170 | 0) % 4 !== 1; sup += `<rect x="${x}" y="980" width="100" height="120" fill="${on ? '#ffd890' : '#1a1e28'}" opacity="0.85" ${ol(1.2)}/>` + (on ? C.radial(x + 50, 1040, 120, '#ffd890', 0.22) : ''); }
    sup += `<path d="M-500,760 L-460,-500 L-80,-500 L-40,760Z" fill="#b8843a" ${ol(2)}/><path d="M-470,-500 L-460,-260 L-70,-260 L-80,-500Z" fill="#141210"/>` + steam(-270, -520, 700, t, 3, 0.35) + steam(-200, -560, 600, t, 6, 0.3);
    sup += `<path d="M1900,760 L1930,-300 L2250,-300 L2280,760Z" fill="#b8843a" ${ol(2)}/><path d="M1930,-300 L1938,-80 L2242,-80 L2250,-300Z" fill="#141210"/>` + steam(2090, -320, 600, t, 8, 0.3);
    sup += `<path d="M1200,760 L1200,-700" stroke="#2a2420" stroke-width="16"/><path d="M1200,-640 L1500,760 M1200,-640 L900,760" stroke="#2a2420" stroke-width="3" opacity="0.7"/><circle cx="1200" cy="-700" r="12" fill="#fff4d0"/>` + C.radial(1200, -700, 140, '#fff0c0', 0.45);
    // more lifeboats on their davits further along the deck, some already gone (empty falls swinging)
    for (const [bx, gone] of [[-640, 1], [2200, 0]]) { sup += `<path d="M${bx - 220},760 L${bx - 220},420 Q${bx - 220},330 ${bx - 140},330 M${bx + 220},760 L${bx + 220},420 Q${bx + 220},330 ${bx + 140},330" stroke="#e8e4da" stroke-width="22" fill="none"/>`; sup += gone ? `<path d="M${bx - 140},330 L${f(bx - 140 + Math.sin(t * 1.3) * 20)},700 M${bx + 140},330 L${f(bx + 140 + Math.sin(t * 1.3 + 1) * 20)},700" stroke="#c8b890" stroke-width="4"/>` : P.lifeboat(bx, 600, 0.45, { ropes: 600 }); }
    // background crowd hurrying along the rail (soft silhouettes)
    let crowd = '';
    const r = rng(61);
    for (let i = 0; i < 9; i++) { const x0 = -700 + r() * 2400, sp = (r() - 0.5) * 160, x = x0 + sp * t * 0.2, h = 300 + r() * 60; crowd += `<g transform="translate(${f(x)},${FY - 60})" fill="#0e1018" opacity="0.85"><ellipse cx="0" cy="${f(-h)}" rx="26" ry="30"/><path d="M-50,${f(-h + 30)} L50,${f(-h + 30)} L60,0 L-60,0Z"/></g>`; }
    let deck = `<rect x="-1500" y="${FY}" width="4200" height="900" fill="#6a5a44" filter="url(#woodH)"/><rect x="-1500" y="${FY}" width="4200" height="900" fill="#c8d8e8" opacity="0.12"/>`;
    for (let i = 0; i < 14; i++) deck += `<path d="M-1500,${FY + 14 + i * 34} L2700,${FY + 14 + i * 34}" stroke="#3a2e22" stroke-width="3" opacity="0.6"/>`;
    deck += `<rect x="20" y="${FY - 760}" width="240" height="760" fill="#3a2a1c" filter="url(#woodV)" ${ol(2)}/><rect x="40" y="${FY - 740}" width="200" height="740" fill="${o.doorOpen ? '#0a0806' : '#4a3424'}" ${ol(1.4)}/>`;   // the door from the stairs
    // frost glinting on the planks, deck lamps on posts
    const fr = rng(71); for (let i = 0; i < 60; i++) deck += `<circle cx="${f(-1000 + fr() * 3400)}" cy="${f(FY + 10 + fr() * 300)}" r="${f(1 + fr() * 2)}" fill="#e8f0ff" opacity="${f(0.3 + 0.4 * Math.sin(t * 3 + i) ** 2)}"/>`;
    // davits and the lifeboat (lowered by o.boatY); the ship's rail runs behind it
    const by = o.boatY ?? 1230;
    let boat = `<path d="M1100,${FY} L1100,700 Q1100,560 1220,560 L1260,560" stroke="#e8e4da" stroke-width="30" fill="none"/><path d="M1740,${FY} L1740,700 Q1740,560 1620,560 L1580,560" stroke="#e8e4da" stroke-width="30" fill="none"/>`;
    boat += P.lifeboat(1420, by, 0.62, { ropes: (by - 580) / 0.62 });
    boat += `<path d="M-1500,${FY - 150} L2700,${FY - 150} M-1500,${FY - 90} L2700,${FY - 90}" stroke="#c8c0b0" stroke-width="8"/>` + Array.from({ length: 40 }, (_, i) => `<path d="M${-1500 + i * 110},${FY - 160} L${-1500 + i * 110},${FY}" stroke="#a8a090" stroke-width="7"/>`).join('');
    for (const lx of [-300, 1980]) boat += `<path d="M${lx},${FY} L${lx},${FY - 520}" stroke="#2a2420" stroke-width="10"/>` + P.cageLamp(lx, FY - 560, 0.8, 1, '#ffd890');
    return { sky: { p: 0.15, svg: sky }, sea: { p: 0.3, svg: sea }, sup: { p: 0.62, svg: sup }, crowd: { p: 0.85, svg: `<g filter="url(#dof1)">${crowd}</g>` }, deck: { p: 1, svg: deck }, boat: { p: 1, svg: boat }, boatY: by };
  };
})(window);
