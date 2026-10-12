// hall2.js — the great hall, re-lit and re-coloured. Everything that gives light is EMISSIVE (filter pe*: the relight
// pass keeps it self-lit and it blooms): golden candle flames (never orange), stained-glass windows in three colours —
// crimson and gold behind the king, sapphire and gold behind the boy, emerald behind the queen — a storm outside
// whose lightning flares the glass, chandeliers, dust drifting in the window light.

addDefs(`
  <radialGradient id="flameG2" cx=".5" cy=".72" r=".62"><stop offset="0" stop-color="#ffffff"/><stop offset=".38" stop-color="#fff6d6"/><stop offset=".75" stop-color="#ffd98a"/><stop offset="1" stop-color="#f6b852"/></radialGradient>
  <radialGradient id="glowG2" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffe7b8" stop-opacity=".6"/><stop offset=".45" stop-color="#ffd8a0" stop-opacity=".18"/><stop offset="1" stop-color="#ffd8a0" stop-opacity="0"/></radialGradient>
  <radialGradient id="moonGlow" cx=".5" cy=".3" r=".7"><stop offset="0" stop-color="#ffffff" stop-opacity=".55"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>
  <linearGradient id="hazeG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c8b898" stop-opacity=".22"/><stop offset=".6" stop-color="#8a7a68" stop-opacity=".08"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
  <linearGradient id="bannerR" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b02a30"/><stop offset=".5" stop-color="#8a1a22"/><stop offset="1" stop-color="#4e0c12"/></linearGradient>
  <linearGradient id="bannerE" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1e7a5a"/><stop offset=".5" stop-color="#145a42"/><stop offset="1" stop-color="#0a3024"/></linearGradient>
  <linearGradient id="pillarG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5a6270"/><stop offset=".35" stop-color="#7a8290"/><stop offset="1" stop-color="#262a32"/></linearGradient>
  <linearGradient id="dawnSky2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#141c2c"/><stop offset=".45" stop-color="#3a4a66"/><stop offset=".78" stop-color="#9aa0a8"/><stop offset=".9" stop-color="#e0d0b0"/><stop offset="1" stop-color="#c8c0b0"/></linearGradient>
  <radialGradient id="poisonG" cx=".45" cy=".4" r=".6"><stop offset="0" stop-color="#d8ffe0"/><stop offset=".5" stop-color="#6ae0a0"/><stop offset="1" stop-color="#1a8a5a"/></radialGradient>
`);

// ---------- light sources ----------
const flk2 = (t, s) => (Math.sin(t * 9.1 + s) * 2 + Math.sin(t * 13.7 + s * 2) * 1.2) * seamW(t);
// a golden candle flame (emissive) with its halo; (x, y) = the wick
function flame2(x, y, t, s = 1, seed = 1, { glow = 1, lit = 1, halo = 110, bend = 0 } = {}) {
  if (lit <= .01) return '';
  const sw = flk2(t, seed), hh = 1 + .08 * Math.sin(t * 11 + seed) * seamW(t), g = glow * (.92 + .08 * Math.sin(t * 7.3 + seed * 3) * seamW(t));
  return `<g transform="translate(${F1(x)} ${F1(y)}) scale(${F2(s * lit)})">
    ${glow > 0 ? `<circle cx="0" cy="-16" r="${halo}" fill="url(#glowG2)" opacity="${F2(g)}" filter="url(#pe)" style="mix-blend-mode:screen"/>` : ''}
    <g filter="url(#pe)"><g transform="translate(${F1(sw * .35)} 0) skewX(${F1(-bend * 50)}) scale(1 ${F2(hh * (1 - .35 * Math.abs(bend)))})"><path d="M0 -40 C${F1(8 + sw)} -22 10 -8 0 2 C-10 -8 ${F1(-8 + sw * .5)} -22 0 -40 Z" fill="url(#flameG2)"/>
      <ellipse cx="0" cy="-5" rx="3.2" ry="5" fill="#7aa0e8" opacity=".55"/></g></g></g>`;
}
// override: table candles (used by the hall of nobles too)
function tableCandle(x, y, t, s = 1, seed = 1) {
  return `<g transform="translate(${F1(x)} ${F1(y)}) scale(${s})">
    <path d="M-34 0 C-34 -14 34 -14 34 0 Z" fill="url(#goldG2)" filter="url(#pcs)"/><path d="M-7 -8 L-5 -86 L5 -86 L7 -8 Z" fill="url(#goldG2)" filter="url(#pcs)"/>
    <path d="M-22 -86 C-22 -96 22 -96 22 -86 Z" fill="url(#goldG2)" filter="url(#pcs)"/>
    <path d="M-12 -92 L-11 -170 C-6 -176 6 -176 11 -170 L12 -92 Z" fill="#efe6cc" filter="url(#pcs)"/><path d="M-6 -168 C-8 -150 -6 -130 -8 -116" stroke="#f6f0e0" stroke-width="3" fill="none"/>
    <path d="M0 -172 L0 -180" stroke="#2a1a10" stroke-width="2.2"/></g>${flame2(x, y - 176 * s, t, s * 1.05, seed, { halo: 130 })}`;
}
// a three-branch candelabrum (foot on the table at x, y)
function candelabra(x, y, t, s = 1, seed = 1) {
  const arms = [[-70, -150], [0, -190], [70, -150]];
  return `<g transform="translate(${F1(x)} ${F1(y)}) scale(${s})">
    <path d="M-40 0 C-40 -16 40 -16 40 0 Z" fill="url(#goldG2)" filter="url(#pcs)"/><path d="M-8 -10 L-6 -120 L6 -120 L8 -10 Z" fill="url(#goldG2)" filter="url(#pcs)"/>
    <path d="M-70 -150 C-70 -110 -30 -100 0 -110 C30 -100 70 -110 70 -150" stroke="#b8862e" stroke-width="10" fill="none" filter="url(#pcs)"/>
    ${arms.map(([ax, ay]) => `<path d="M${ax - 16} ${ay} C${ax - 16} ${ay - 9} ${ax + 16} ${ay - 9} ${ax + 16} ${ay} Z" fill="url(#goldG2)" filter="url(#pcs)"/><path d="M${ax - 10} ${ay - 4} L${ax - 9} ${ay - 70} C${ax - 5} ${ay - 75} ${ax + 5} ${ay - 75} ${ax + 9} ${ay - 70} L${ax + 10} ${ay - 4} Z" fill="#efe6cc" filter="url(#pcs)"/>`).join('')}</g>
    ${arms.map(([ax, ay], i) => flame2(x + ax * s, y + (ay - 74) * s, t, s, seed * 3 + i, { halo: 120 })).join('')}`;
}
// override: wall torches — an iron bracket and a big golden flame
function wallTorch(x, y, t, { s = 1, seed = 1, glow = 1 } = {}) {
  const sw = flk2(t, seed);
  return `<g transform="translate(${F1(x)} ${F1(y)}) scale(${s})">
    <path d="M-16 0 L16 0 L10 90 L-10 90 Z" fill="#2a1e14" filter="url(#pcs)"/><path d="M-30 -10 L30 -10 L20 14 L-20 14 Z" fill="#3a2a1a" filter="url(#pcs)"/>
    <circle cx="0" cy="-70" r="300" fill="url(#glowG2)" opacity="${F2(.8 * glow)}" filter="url(#pe)" style="mix-blend-mode:screen"/>
    <g filter="url(#pe)"><g transform="translate(${F1(sw)} -6)">
      <path d="M-24 0 C-30 -40 -10 -70 ${F1(-4 + sw)} -130 C8 -90 30 -60 24 0 Z" fill="#f6b852"/>
      <path d="M-15 0 C-18 -34 -4 -56 ${F1(sw * .8)} -100 C8 -66 20 -40 15 0 Z" fill="#ffd98a"/>
      <path d="M-8 0 C-9 -24 0 -40 ${F1(sw * .5)} -62 C5 -40 11 -22 8 0 Z" fill="#fff8e0"/></g></g></g>`;
}
// override: the chandelier — a black iron ring of candles
function chandelier(cx, y, t, s = 1) {
  const sw = Math.sin(t * .8) * 3 * seamW(t), xs = [-240, -150, -60, 30, 120, 210];
  return `<g transform="translate(${F1(cx + sw)} ${y}) scale(${s})">
    <path d="M0 -700 L0 -40" stroke="#14100c" stroke-width="8"/><path d="M-270 0 Q0 64 270 0" stroke="#1a1410" stroke-width="18" fill="none"/>
    <path d="M-270 0 L0 -40 L270 0" stroke="#1a1410" stroke-width="6" fill="none"/>
    ${xs.map(x => `<rect x="${x + 7}" y="${Math.abs(x + 15) * -.04 - 44}" width="16" height="56" fill="#ece2c8"/>`).join('')}</g>
    ${xs.map((x, i) => flame2(cx + sw + (x + 15) * s, y + (Math.abs(x + 15) * -.04 - 46) * s, t, s * 1.1, i + 40, { halo: 150 })).join('')}`;
}
// override: the candle stub in the cell
function candleStub(x, y, t, { lit = 1, bend = 0 } = {}) {
  return `<g transform="translate(${x} ${y})"><path d="M-26 0 C-26 -8 26 -8 26 0 Z" fill="#6a5a4a" filter="url(#pcs)"/><path d="M-12 -4 L-11 -50 C-6 -56 6 -56 11 -50 L12 -4 Z" fill="#e6dcc0" filter="url(#pcs)"/>
    ${lit ? '' : `<path d="M0 -56 C-6 -90 10 -110 0 -150" stroke="#c8ccd4" stroke-width="5" fill="none" opacity=".25" filter="url(#b8)"/>`}</g>${lit ? flame2(x, y - 54, t, 1.1, 4, { halo: 160, lit, bend }) : ''}`;
}

// ---------- the storm outside: lightning times (s) and the flash envelope ----------
const BOLTS = [0.6, 10.72, 20.05, 24.45, 30.3, 36.4, 47.4, 52.3];
const storm = t => { let v = 0; for (const b of BOLTS) { const d = t - b; if (d > -.02 && d < .5) v = Math.max(v, (d < .04 ? (d + .02) / .06 : Math.exp(-(d - .04) / .07)) * (1 + .5 * Math.max(0, Math.sin(d * 60)) * (d < .2))); } return Math.min(1.4, v); };

// ---------- stained glass ----------
const GLASS = {
  king: ['#a01e2c', '#d8a038', '#6a2a8a', '#7a1424', '#e8c050', '#c83a3a'],
  boy: ['#22409a', '#d8a838', '#9a2a4a', '#1a2e78', '#e8c050', '#3a62c0'],
  queen: ['#127a52', '#d8b848', '#1e4a9a', '#0c5a3e', '#e8d060', '#22a070'],
};
function stainedWindow(cx, y0, y1, w, t, { pal = GLASS.boy, flash = 0, seed = 1, glow = 1 } = {}) {
  const r = w / 2, id = fid('sw'), R = rng(seed);
  const arch = `M${cx - r} ${y1} L${cx - r} ${y0 + r} Q${cx - r} ${y0} ${cx} ${y0 - r * .6} Q${cx + r} ${y0} ${cx + r} ${y0 + r} L${cx + r} ${y1} Z`;
  const cols = 6, cw = w / cols, rh = 38; let panes = '';
  for (let y = y0 - r * .7, row = 0; y < y1; y += rh, row++) for (let c = 0; c < cols / 2; c++) {
    const q = R(), col = q < .62 ? pal[(row + c) % 2 ? 0 : 3] : q < .8 ? pal[5] : q < .92 ? pal[2] : pal[1];
    panes += `<rect x="${F1(cx - r + c * cw)}" y="${F1(y)}" width="${F1(cw + .5)}" height="${rh + .5}" fill="${col}"/><rect x="${F1(cx + r - (c + 1) * cw)}" y="${F1(y)}" width="${F1(cw + .5)}" height="${rh + .5}" fill="${col}"/>`;
  }
  const ry = y0 + r * .1, rr = r * .6;
  let rose = `<circle cx="${cx}" cy="${F1(ry)}" r="${F1(rr)}" fill="${pal[3]}"/>`;
  for (let i = 0; i < 10; i++) { const a = i / 10 * TAU2, px = cx + Math.cos(a) * rr * .58, py = ry + Math.sin(a) * rr * .58; rose += `<ellipse cx="${F1(px)}" cy="${F1(py)}" rx="${F1(rr * .3)}" ry="${F1(rr * .14)}" transform="rotate(${F1(a * 180 / Math.PI)} ${F1(px)} ${F1(py)})" fill="${pal[i % 2 ? 1 : 2]}"/>`; }
  rose += `<circle cx="${cx}" cy="${F1(ry)}" r="${F1(rr * .22)}" fill="${pal[4]}"/>`;
  let lead = ''; for (let c = 1; c < cols; c++) lead += `M${F1(cx - r + c * cw)} ${F1(y0 - r)} L${F1(cx - r + c * cw)} ${y1} `;
  for (let y = y0 - r * .7; y < y1; y += rh) lead += `M${cx - r} ${F1(y)} L${cx + r} ${F1(y)} `;
  const fl = clamp(flash, 0, 1.4);
  return `<path d="${arch}" fill="#120e0c" stroke="#3a3632" stroke-width="40" filter="url(#pcs)"/>
    <clipPath id="${id}"><path d="${arch}"/></clipPath>
    <g clip-path="url(#${id})"><g filter="url(#pe)" opacity="${F2(clamp(.66 * glow + .26))}">
      <rect x="${cx - r}" y="${F1(y0 - r)}" width="${w}" height="${F1(y1 - y0 + r)}" fill="${pal[0]}"/>${panes}${rose}
      <rect x="${cx - r}" y="${F1(y0 - r)}" width="${w}" height="${F1(y1 - y0 + r)}" fill="url(#moonGlow)"/>
      ${fl > .01 ? `<rect x="${cx - r}" y="${F1(y0 - r)}" width="${w}" height="${F1(y1 - y0 + r)}" fill="#eef4ff" opacity="${F2(Math.min(.85, fl * .7))}"/>` : ''}
      <path d="${lead}" stroke="#0c0a08" stroke-width="5" fill="none"/>
      <circle cx="${cx}" cy="${F1(ry)}" r="${F1(rr)}" fill="none" stroke="#0c0a08" stroke-width="8"/></g></g>
    <path d="M${cx} ${F1(y0 - r * .6)} L${cx} ${y1}" stroke="#1a1612" stroke-width="14"/>
    <rect x="${cx - r - 34}" y="${y1}" width="${w + 68}" height="36" fill="#4e4a46" filter="url(#pcl)"/>`;
}
const TAU2 = Math.PI * 2;
function banner2(x, y0, y1, w, fill, emblem = '#d8a845') {
  return `<g><rect x="${x - w / 2 - 14}" y="${y0 - 14}" width="${w + 28}" height="18" rx="8" fill="#2a2018" filter="url(#pcs)"/>
    <path d="M${x - w / 2} ${y0} L${x + w / 2} ${y0} L${x + w / 2} ${y1} L${x} ${y1 - 70} L${x - w / 2} ${y1} Z" fill="url(#${fill})" filter="url(#pcl)"/>
    <path d="M${x - w / 2 + 12} ${y0} L${x - w / 2 + 12} ${y1 - 10} M${x + w / 2 - 12} ${y0} L${x + w / 2 - 12} ${y1 - 10}" stroke="#d0a440" stroke-width="6" opacity=".9"/>
    <g transform="translate(${x} ${(y0 + y1) / 2 - 80})"><path d="M-40 26 L-40 -12 L-22 6 L0 -30 L22 6 L40 -12 L40 26 Z" fill="${emblem}" filter="url(#pcs)"/><circle cx="0" cy="-37" r="6" fill="${emblem}"/></g>
    <g filter="url(#softW)" opacity=".45"><path d="M${x - 26} ${y0 + 40} L${x - 30} ${y1 - 60} M${x + 30} ${y0 + 40} L${x + 26} ${y1 - 60}" stroke="#000" stroke-width="12"/></g></g>`;
}
// dust drifting in the light (emissive specks)
function motes(t, { n = 40, seed = 9, area = [500, 200, 1160, 1400], op = .7, size = 3 } = {}) {
  const R = rng(seed), w = TAU2 / DUR, H = area[3] - area[1]; let s = '';   // periodic over the film: the loop seam is seamless
  for (let i = 0; i < n; i++) { const x = area[0] + R() * (area[2] - area[0]) + Math.sin(w * t * 4 + i * 1.7) * 26, y0 = area[1] + R() * H, y = y0 + Math.sin(w * t * 3 + i) * 30 - (t / DUR) * H;
    const yy = ((y - area[1]) % H + H) % H + area[1], a = op * (.3 + .7 * R()) * (.6 + .4 * Math.sin(w * t * 18 + i * 3));
    s += `<circle cx="${F1(x)}" cy="${F1(yy)}" r="${F1(size * (.6 + R()))}" fill="#fff4dc" opacity="${F2(Math.max(0, a))}"/>`; }
  return `<g filter="url(#pe)">${s}</g>`;
}

// ---------- the dais, re-dressed (world: table top y 1430; king 560, boy 830, queen 1100) ----------
function daisBack2(t, { blur = null, glow = 1, flash = null } = {}) {
  const fl = flash ?? storm(t);
  const inner = `${wallV(-900, -700, 2000, 1780, ['#5c6472', '#20242c'], { course: 120, block: 240, jointOp: .45 })}
    ${[-200, 1860].map(x => rectV(x - 80, -700, 160, 2480, 'fill="url(#pillarG)" filter="url(#pcl)"')).join('')}
    ${stainedWindow(260, 420, 1120, 230, t, { pal: GLASS.king, flash: fl, seed: 3, glow })}
    ${stainedWindow(830, 300, 1160, 380, t, { pal: GLASS.boy, flash: fl, seed: 5, glow })}
    ${stainedWindow(1400, 420, 1120, 230, t, { pal: GLASS.queen, flash: fl, seed: 8, glow })}
    ${banner2(545, 90, 1190, 150, 'bannerR')}${banner2(1115, 90, 1190, 150, 'bannerE', '#e0c060')}
    ${wallTorch(-60, 780, t, { s: .95, seed: 3, glow: .9 })}${wallTorch(1720, 780, t, { s: .95, seed: 7, glow: .9 })}
    ${chandelier(830, 60, t, 1)}
    <rect x="-900" y="-700" width="2900" height="2480" fill="url(#hazeG)"/>
    ${motes(t, { area: [600, 300, 1060, 1300], n: 46 })}`;
  return dofG(blur, inner);
}
// the high table's dressing; o.boyCup = false hides the goblet in front of the boy (he holds it)
function items2(t, o = {}) {
  return `${candelabra(300, 1428, t, .78, 1)}${candelabra(1360, 1428, t, .78, 2)}
    ${jug(420, 1436, .48)}${platter(560, 1424, .52, { leg: o.leg ?? 1, bite: o.bite || 0 })}${o.kcup === 0 ? '' : goblet(700, 1428 - 168 * .5, .5, { wine: .75 })}
    ${breadLoaf(1230, 1420, .42)}${grapes(1290, 1404, .5)}${o.qcup ? goblet(o.qcup[0], o.qcup[1], o.qcup[3] || .5, { wine: .75, tilt: o.qcup[2] || 0 }) : goblet(1180, 1428 - 168 * .46, .46, { wine: .7, gems: 0 })}
    ${o.extra || ''}`;
}

// override: every older gothic window becomes stained glass (the nave's far wall)
function gothicWindow(cx, y0, y1, w, t, { moon = 1 } = {}) { return stainedWindow(cx, y0, y1, w, t, { pal: cx < 540 ? GLASS.king : GLASS.boy, flash: storm(t), seed: Math.round(cx) % 17 + 2, glow: moon }); }

// ---------- nobles with real arms (a sleeve from the shoulder, the cup in a gripping hand) ----------
function nobleArm(A, k, col, S, sk) {
  const sh = [k * 118, -928], d = unit(A.el, A.wr);
  return `<g filter="url(#pcl)" fill="${col}"><path d="${capsuleD(sh[0], sh[1], 30, A.el[0], A.el[1], 26)}"/><path d="${capsuleD(A.el[0], A.el[1], 26, A.wr[0] - d[0] * 8, A.wr[1] - d[1] * 8, 21)}"/></g>
    <g filter="url(#pk_${sk})" fill="${S.mid}"><path d="${capsuleD(A.wr[0] - d[0] * 12, A.wr[1] - d[1] * 12, 16, A.wr[0], A.wr[1], 15)}"/></g>
    <path d="${band([A.wr[0] - d[0] * 14, A.wr[1] - d[1] * 14], d, 26, 14, 3)}" fill="${darken(col, .25)}" filter="url(#pcs)"/>`;
}
function hallNave2(t, { heads = () => ({}), cups = () => 0, glow = 1 } = {}) {
  const far = dofG('dof', `
      ${wallV(-700, -500, 1800, 1100, ['#5a6272', '#22262e'], { course: 110, block: 220, jointOp: .4, tex2: 0 })}
      <path d="M380 1100 L380 520 Q380 330 540 300 Q700 330 700 520 L700 1100 Z" fill="#0e0c0a"/><path d="M380 520 Q380 330 540 300 Q700 330 700 520" stroke="#4a4642" stroke-width="30" fill="none"/>
      ${stainedWindow(80, 200, 780, 220, t, { pal: GLASS.king, flash: storm(t), seed: 4, glow })}${stainedWindow(1000, 200, 780, 220, t, { pal: GLASS.queen, flash: storm(t), seed: 6, glow })}
      ${banner2(250, 40, 760, 130, 'bannerR')}${banner2(830, 40, 760, 130, 'bannerE', '#e0c060')}
      ${wallTorch(-160, 700, t, { s: .8, seed: 2, glow: .8 })}${wallTorch(1240, 700, t, { s: .8, seed: 9, glow: .8 })}
      ${chandelier(540, -40, t, .9)}
      <rect x="-700" y="1000" width="2500" height="200" fill="#2a2420"/>
      ${Array.from({ length: 9 }, (_, i) => { const x = -100 + i * 160; return crowdBust(x, 1010, .55, { skin: CROWD_SKIN[i % 5], cloth: CROWD_CLOTH[(i * 3) % 7], t, ph: i * 1.3, rimOp: .2 }); }).join('')}
      <rect x="-700" y="1040" width="2500" height="70" fill="#d8cfbc"/><rect x="-700" y="1100" width="2500" height="140" fill="#9a907c"/>
      <rect x="-700" y="-500" width="2500" height="1700" fill="url(#hazeG)"/>`);
  const row = (idx, xs, yTop, s, blur) => {
    let people = '';
    xs.forEach((x, j) => { const i = idx[j], N = NOBLES[i % NOBLES.length], key = Math.round(x * 7 + yTop) % 11, pose = heads(i, key), b = brS(t, i * 1.3 + x * .01, 1);
      const cup = cups(i, key), SK = [SKIN_TONES[N.skin], N.skin];
      const A = cup > .01 ? gripArm(qArm, -1, lerp2([-150, -760], [-150, -1010], cup), { hs: 1.25, bend: 1 }) : null;
      const yb = yTop + 700 * s;
      people += outlined(manb(x, yb, s, N, { breath: b, ...pose, look: (pose.look || 0) + (x - 540) * -.004, lookY: (pose.lookY || 0) + 1 })
        + (A ? atb(x, yb, s, nobleArm(A, -1, NOBLE_SPECS[i % NOBLE_SPECS.length].col, SK[0], SK[1]) + heldPewter(A, -1, 1.25, 1.1, SK, { wine: .7 }), b) : '')); });
    const [ta, tb] = spanX(-700, 1800);
    const tbl = `<path d="M${F1(ta)} ${yTop - 16} L${F1(tb)} ${yTop - 16} L${F1(tb)} ${yTop + 10} L${F1(ta)} ${yTop + 10} Z" fill="#ddd4c0" filter="url(#pcl)"/>
      <path d="M${F1(ta)} ${yTop + 8} L${F1(tb)} ${yTop + 8} L${F1(tb)} ${yTop + 420 * s + 60} L${F1(ta)} ${yTop + 420 * s + 60} Z" fill="url(#linenG)" filter="url(#pcl)"/>
      <path d="M${F1(ta)} ${yTop + 40} L${F1(tb)} ${yTop + 40} L${F1(tb)} ${yTop + 90} L${F1(ta)} ${yTop + 90} Z" fill="#7e1c20" filter="url(#pcs)"/>
      ${xs.map((x, j) => `${pewterCup(x + 120 * s, yTop - 80 * s, s * .9, { wine: .7 })}${j % 2 ? tableCandle(x - 180 * s, yTop - 6, t, s * 1.1, j + idx[0]) : breadLoaf(x - 170 * s, yTop - 20 * s, s * .6)}`).join('')}`;
    return dofG(blur, people + tbl);
  };
  return `${far}${row([0, 3, 5, 1, 6, 2], [40, 230, 420, 610, 800, 990], 1180, .42, 'dofLight')}${row([7, 4, 0, 2, 5], [80, 320, 560, 800, 1040], 1470, .56, null)}${row([1, 3, 6], [150, 540, 930], 1840, .74, null)}`;
}

// ---------- the boy's cell: a barred window (moon by night, dawn by day), tally marks, a candle ----------
// light: 0 night … 1 dawn; season: 0 none, 1 snow, 2 rain, 3 sun, 4 leaves (seen through the window)
function cell2(t, { light = 0, blur = null, candle = 1, reveal = 1, season = 0, sweep = null, bend = 0 } = {}) {
  const sky = light > .5 ? ['#ffd9a8', '#f6e8d0'] : ['#1c2c58', '#34508a'];
  const wx0 = 740, wx1 = 940, wy0 = 400, wy1 = 640;
  const win = `M${wx0} ${wy0 + 40} L${wx0} ${wy1} L${wx1} ${wy1} L${wx1} ${wy0 + 40} Q840 ${wy0 - 60} ${wx0} ${wy0 + 40} Z`;
  let weather = '';
  if (season === 1) weather = Array.from({ length: 30 }, (_, i) => { const R = rng(i + 3), x = wx0 + R() * 200, y = wy0 - 60 + ((R() * 300 + t * 90) % 300); return `<circle cx="${F1(x + Math.sin(t * 2 + i) * 6)}" cy="${F1(y)}" r="${F1(2 + R() * 3)}" fill="#fff"/>`; }).join('');
  if (season === 2) weather = Array.from({ length: 26 }, (_, i) => { const R = rng(i + 7), x = wx0 + R() * 220, y = wy0 - 60 + ((R() * 300 + t * 900) % 300); return `<path d="M${F1(x)} ${F1(y)} l-6 22" stroke="#cfe0ff" stroke-width="2.5" opacity=".8"/>`; }).join('');
  if (season === 3) weather = `<circle cx="880" cy="470" r="46" fill="#fff6d8"/>` + [0, 1].map(i => { const p = (t * .5 + i * .5) % 1; return `<path d="M${F1(wx0 + 200 * p - 12)} ${F1(520 - 30 * p)} q12 -10 24 0" stroke="#3a3a40" stroke-width="3" fill="none"/>`; }).join('');
  if (season === 4) weather = Array.from({ length: 12 }, (_, i) => { const R = rng(i + 11), x = wx0 + R() * 200 + Math.sin(t * 3 + i) * 20, y = wy0 - 60 + ((R() * 300 + t * 120) % 300); return `<ellipse cx="${F1(x)}" cy="${F1(y)}" rx="7" ry="4" transform="rotate(${F1(t * 200 + i * 40)} ${F1(x)} ${F1(y)})" fill="${['#d87a2a', '#c8a030', '#a84a20'][i % 3]}"/>`; }).join('');
  const skyCol = season === 1 ? ['#c8d4e8', '#eef2f8'] : season === 2 ? ['#5a6a80', '#8a9ab0'] : season === 3 ? ['#ffe2a8', '#fff4dc'] : season === 4 ? ['#f0c890', '#f8e4c0'] : sky;
  const id = fid('cw');
  const inner = `${wallV(-500, -500, 1600, 2400, light > .5 ? ['#7a7470', '#3a3634'] : ['#4e5462', '#22262e'], { course: 110, block: 200, jointOp: .5, tex2: .4 })}
    ${tallyWall(-150, 600, 9, 9, { s: 1, reveal })}
    <clipPath id="${id}"><path d="${win}"/></clipPath>
    <g clip-path="url(#${id})"><g filter="url(#pe)"><rect x="${wx0}" y="${wy0 - 60}" width="200" height="320" fill="${skyCol[0]}"/><rect x="${wx0}" y="${wy0 + 80}" width="200" height="180" fill="${skyCol[1]}" opacity=".7"/>
      ${light <= .5 && !season ? `<circle cx="880" cy="470" r="26" fill="#f4f6ff"/><circle cx="800" cy="520" r="2" fill="#fff"/><circle cx="770" cy="460" r="1.6" fill="#fff"/>` : ''}${weather}</g></g>
    <g stroke="#14100c" stroke-width="12">${[800, 840, 880].map(x => `<path d="M${x} 380 L${x} ${wy1}"/>`).join('')}</g>
    <path d="${win}" fill="none" stroke="#3a3632" stroke-width="24" filter="url(#pcs)"/>
    <path d="M${wx0 + 20} ${wy0 + 40} L${wx1 - 20} ${wy0 + 40} L${sweep ? sweep[0] : 700} 2400 L${sweep ? sweep[1] : -300} 2400 Z" fill="${light > .5 || season === 3 ? '#fff0d0' : '#c8d8ff'}" opacity="${F2(light > .5 || season ? .16 : .1)}" filter="url(#pe8)" style="mix-blend-mode:screen"/>
    <rect x="720" y="1150" width="230" height="24" fill="#4a3624" filter="url(#pcl)"/><path d="M730 1174 L760 1174 L748 1230 Z M910 1174 L940 1174 L922 1230 Z" fill="#3a2a1c"/>
    ${candleStub(810, 1150, t, { lit: candle, bend })}
    ${rectV(-500, 1640, 2100, 760, 'fill="#2a2420"')}
    ${motes(t, { area: [500, 600, 1000, 1700], n: 26, op: .5 })}`;
  return dofG(blur, inner);
}

// ---------- under the high table: flagstones, the cloth's hem, the predecessor's shadow, a goblet that falls and rolls ----------
function floor2(t, t0) {
  const vp = [540, 600]; let stones = '';
  for (let i = -12; i <= 12; i++) stones += `<path d="M${vp[0] + i * 40} ${vp[1] + 40} L${vp[0] + i * 420} 2200" stroke="#0e0c0a" stroke-width="3" fill="none" opacity=".7"/>`;
  for (const y of [720, 820, 950, 1130, 1380, 1740]) stones += `<path d="M-300 ${y} L1400 ${y}" stroke="#0e0c0a" stroke-width="${F1(2 + (y - 600) / 220)}" opacity=".7"/>`;
  const u = t - t0, land = .3, x = 700 - 330 * easeOut(clamp((u - land) / 1.6)), bounce = u < land ? -1500 * (1 - (u / land) ** 2) : -90 * Math.abs(Math.sin((u - land) * 9)) * Math.exp(-(u - land) * 5);
  const rot = u < land ? -40 + 70 * u / land : 30 + 290 * easeOut(clamp((u - land) / 1.6)) + 6 * Math.sin(u * 12) * Math.exp(-(u - land) * 2);
  const pool = clamp((u - land) / 1.5);
  // the shadow of the boy before him, thrown on the cloth by the candle: he clutches his throat, sways, and drops
  const fall = easeIn(clamp((u + .25) / .7)), sway = Math.sin(u * 9) * 10 * (1 - fall);
  const shadow = `<g clip-path="url(#clothC)"><g transform="translate(${F1(520 + sway)} ${F1(470 + 900 * fall)}) rotate(${F1(-80 * fall)}) scale(1.25)" opacity="${F2(.62 * (1 - seg(u, .5, .9)))}" filter="url(#b8)">
      <ellipse cx="0" cy="-330" rx="62" ry="74" fill="#050304"/><path d="M-110 -250 C-120 -100 -100 60 -90 300 L90 300 C100 60 120 -100 110 -250 Z" fill="#050304"/>
      <path d="M-100 -230 C-70 -270 -46 -300 -22 -268 M100 -230 C70 -270 46 -300 22 -268" stroke="#050304" stroke-width="42" stroke-linecap="round" fill="none"/></g></g>`;
  const cloth = 'M-300 -300 L1400 -300 L1400 500 C1100 530 900 490 540 520 C200 490 0 530 -300 500 Z';
  return `<defs><clipPath id="clothC"><path d="${cloth}"/></clipPath></defs><rect x="-300" y="-300" width="1700" height="2600" fill="#0c0a08"/>
    <path d="M-300 560 L1400 560 L1400 2300 L-300 2300 Z" fill="#30333c"/><rect x="-300" y="560" width="1700" height="1740" filter="url(#stoneT2)" opacity=".6"/>${stones}
    <path d="${cloth}" fill="#d8d0bc" filter="url(#pcl)"/>
    <g opacity=".5" filter="url(#softW)">${[-100, 180, 460, 740, 1020].map(x => `<path d="M${x} -300 C${x + 10} 0 ${x - 8} 300 ${x + 6} 500" stroke="#8a806c" stroke-width="16" fill="none"/>`).join('')}</g>
    ${shadow}
    <path d="M-300 450 C0 480 200 440 540 470 C900 440 1100 480 1400 450" stroke="#7e1c20" stroke-width="44" fill="none"/>
    <rect x="-300" y="520" width="1700" height="160" fill="#000" opacity=".45" filter="url(#b24)"/>
    ${pool > 0 ? `<path d="M${F1(700 - 40 * pool)} 1560 C${F1(640 - 300 * pool)} ${F1(1530 - 30 * pool)} ${F1(420 - 120 * pool)} ${F1(1560 - 20 * pool)} ${F1(400 - 200 * pool)} ${F1(1600 + 10 * pool)} C${F1(460 - 100 * pool)} ${F1(1640 + 40 * pool)} ${F1(680 + 60 * pool)} ${F1(1650 + 30 * pool)} ${F1(760 + 60 * pool)} ${F1(1600)} Z" fill="#4a0612"/>
      <path d="M${F1(640 - 100 * pool)} 1570 C${F1(560 - 120 * pool)} 1566 ${F1(500 - 100 * pool)} 1574 ${F1(470 - 120 * pool)} 1586" stroke="#e07080" stroke-width="5" fill="none" opacity=".55"/>` : ''}
    ${u > -0.05 ? `<ellipse cx="${F1(x)}" cy="1600" rx="${F1(130 - Math.min(80, -bounce * .1))}" ry="24" fill="#000" opacity=".45" filter="url(#b18)"/><g transform="translate(${F1(x)} ${F1(1520 + bounce)}) rotate(${F1(rot)})">${goblet(0, -150, 1.5, { wine: u < land ? .7 : 0 })}</g>` : ''}
    ${flame2(1060, 1640, t, 2.4, 31, { halo: 220 })}<path d="M1036 1650 L1084 1650 L1080 1780 L1040 1780 Z" fill="#e6dcc0" filter="url(#pcs)"/>`;
}
// ---------- the gallows at dawn (cold, fog, crows) ----------
function gallows2(t, t0 = 30.25) {
  const sw = Math.sin(t * 1.6) * 5 * seamW(t), u = t - t0;
  const crows = [0, 1, 2, 3].map(i => { const p = clamp((u - .22 - i * .05) / 1.1), x = 640 + i * 40 + 900 * p * (i % 2 ? 1 : .8), y = 470 - 30 * i - 600 * p + 60 * p * p, f = Math.sin(t * 22 + i * 2) * 16;
    return p > 0 ? `<path d="M${F1(x - 30)} ${F1(y - f)} Q${F1(x - 14)} ${F1(y - 6)} ${F1(x)} ${F1(y)} Q${F1(x + 14)} ${F1(y - 6)} ${F1(x + 30)} ${F1(y - f)}" stroke="#121418" stroke-width="7" fill="none"/>` : `<path d="M${640 + i * 40} ${500 - (i % 2) * 6} q8 -14 18 -4 q6 6 -4 10 Z" fill="#121418"/>`; }).join('');
  return `<g filter="url(#pe)"><rect x="-300" y="-300" width="1700" height="2600" fill="url(#dawnSky2)"/><circle cx="300" cy="870" r="80" fill="#fff4e0"/></g>
    <circle cx="300" cy="880" r="420" fill="#eae4d8" opacity=".3" filter="url(#b40)"/>
    <path d="M-300 1260 L-300 980 L-160 980 L-160 940 L-100 940 L-100 980 L60 980 L60 940 L120 940 L120 980 L300 980 L300 900 L420 900 L420 980 L1400 980 L1400 1260 Z" fill="#30343e"/>
    <path d="M-300 1300 L1400 1300 L1400 2400 L-300 2400 Z" fill="#3e4046"/><rect x="-300" y="1300" width="1700" height="1100" filter="url(#stoneT2)" opacity=".4"/>
    <g filter="url(#pcl)" fill="#2e241c"><rect x="250" y="520" width="56" height="1500"/><rect x="250" y="500" width="560" height="50"/><path d="M306 700 L306 760 L470 550 L410 550 Z"/></g>
    <rect x="200" y="2000" width="660" height="60" fill="#221a14" filter="url(#pcl)"/>
    <g transform="rotate(${F1(sw)} 700 550)"><path d="M700 550 L700 900" stroke="#8a7a5a" stroke-width="7"/>
      <path d="M700 900 C640 910 630 1020 700 1040 C770 1020 760 910 700 900 Z" fill="none" stroke="#8a7a5a" stroke-width="8"/>
      <path d="M690 890 L710 890 L712 930 L688 930 Z" fill="#7a6a4a"/></g>
    ${crows}
    ${fogBank(1560, t, { seed: 3, n: 8, h: 180, speed: 30, op: .32, col: '#c8ccd4' })}`;
}

// ---------- inside the goblet: the wine; the poison's pale oily film turning on it ----------
function wine2(t, t0) {
  const u = t - t0, R = rng(21); let film = '', flecks = '';
  for (let i = 0; i < 6; i++) { const a0 = i * 1.05 + u * 1.1; let d = '';
    for (let j = 0; j <= 44; j++) { const a = a0 + j * .11, r = 60 + j * 9 + i * 12; d += `${j ? 'L' : 'M'}${F1(540 + Math.cos(a) * r)} ${F1(960 + Math.sin(a) * r * .62)}`; }
    film += `<path d="${d}" stroke="${i % 2 ? '#c8f0d0' : '#e8e0c0'}" stroke-width="${F1(6 + 5 * R())}" fill="none" opacity="${F2(.22 + .12 * R())}" stroke-linecap="round"/>`; }
  for (let i = 0; i < 30; i++) { const a = R() * 6.28 + u * (.6 + R() * .6), r = 60 + R() * 380; flecks += `<path d="M${F1(540 + Math.cos(a) * r)} ${F1(960 + Math.sin(a) * r * .62)} l${F1(6 + R() * 8)} ${F1(-3 + R() * 6)} l${F1(-4 - R() * 6)} ${F1(5 + R() * 4)} Z" fill="#f2ead0" opacity=".8"/>`; }
  return `<rect x="-300" y="-300" width="1700" height="2600" fill="#140c06"/>
    <ellipse cx="540" cy="960" rx="700" ry="500" fill="url(#goldG2)" filter="url(#pcl)"/>
    <ellipse cx="540" cy="960" rx="610" ry="420" fill="#5a3a10"/>
    <ellipse cx="540" cy="968" rx="590" ry="400" fill="url(#wineSurf)"/>
    <g filter="url(#b3)">${film}</g><g filter="url(#pe2)" opacity=".55"><path d="M540 960 m-120 0 a120 74 0 1 0 240 0 a120 74 0 1 0 -240 0" fill="url(#poisonG)" opacity="${F2(.25 + .15 * Math.sin(u * 3))}"/></g>${flecks}
    <g filter="url(#pe8)"><ellipse cx="${F1(400 + 10 * Math.sin(u * 2))}" cy="760" rx="120" ry="34" fill="#fff4dc" opacity=".6"/></g>
    <ellipse cx="400" cy="760" rx="40" ry="10" fill="#fff" opacity=".7"/>
    <path d="M-160 960 A700 500 0 0 1 1240 960" stroke="#fff2c0" stroke-width="10" fill="none" opacity=".35"/>`;
}
// a green poison drop (emissive)
const poisonDrop = (x, y, r = 8, op = 1) => `<g filter="url(#pe)" opacity="${F2(op)}"><path d="M${F1(x)} ${F1(y - r * 1.9)} C${F1(x + r * .9)} ${F1(y - r * .5)} ${F1(x + r)} ${F1(y + r * .6)} ${F1(x)} ${F1(y + r)} C${F1(x - r)} ${F1(y + r * .6)} ${F1(x - r * .9)} ${F1(y - r * .5)} ${F1(x)} ${F1(y - r * 1.9)} Z" fill="url(#poisonG)"/><circle cx="${F1(x - r * .3)}" cy="${F1(y - r * .2)}" r="${F1(r * .25)}" fill="#fff"/></g>`;
// a bread roll held at one end: grip at (0, 0), the roll runs up (−y) to its bitten end
function roll(x, y, s = 1, rot = 0, bite = 0) {
  return `<g transform="translate(${F1(x)} ${F1(y)}) rotate(${F1(rot)}) scale(${s})">
    <path d="M-34 30 C-44 -40 -40 -120 -22 -150 C-8 -170 8 -170 22 -150 C40 -120 44 -40 34 30 C20 44 -20 44 -34 30 Z" fill="#a8703c" filter="url(#pcl)"/>
    ${[-110, -70, -30].map(y => `<path d="M-22 ${y} Q0 ${y - 12} 22 ${y}" stroke="#6a3c14" stroke-width="5" fill="none" opacity=".6"/>`).join('')}
    <path d="M-20 -130 C-26 -90 -26 -40 -20 0" stroke="#f0c088" stroke-width="10" fill="none" opacity=".5" filter="url(#soft2)"/>
    ${bite ? `<path d="M-30 -132 C-20 -146 -10 -136 0 -148 C10 -136 20 -146 30 -132 C24 -122 -24 -122 -30 -132 Z" fill="#f2deb4" filter="url(#pcs)"/>` : ''}</g>`;
}
function heldRoll(A, k, hs, rs, skin, { bite = 0 } = {}) {
  const [x, y, R] = propAt(A, k, hs, rs, 0);
  return roll(x, y, rs, R, bite) + gripHandOn(A, k, skin[0], skin[1], hs);
}
