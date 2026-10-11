// "The Keeper" — sets: the lighthouse on its rock in a night storm, the lamp room (the lens, the storm through the
// glazing), and the glazing seen from outside on the gallery. Painted, opaque, layered like the Lullaby sets.

addDefs(`
  <linearGradient id="stormSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b111d"/><stop offset=".55" stop-color="#1c2840"/><stop offset="1" stop-color="#34445e"/></linearGradient>
  <linearGradient id="stormSea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a3a50"/><stop offset=".25" stop-color="#18243a"/><stop offset="1" stop-color="#0a101c"/></linearGradient>
  <linearGradient id="towerG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f2efe6"/><stop offset=".45" stop-color="#dcd6c8"/><stop offset="1" stop-color="#8e8a82"/></linearGradient>
  <linearGradient id="bandG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#a8423a"/><stop offset=".45" stop-color="#8a2e28"/><stop offset="1" stop-color="#4a1814"/></linearGradient>
  <radialGradient id="lampCore" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffffff"/><stop offset=".3" stop-color="#fff8e4"/><stop offset=".7" stop-color="#f6e2b4"/><stop offset="1" stop-color="#d8c08a"/></radialGradient>
  <radialGradient id="lampGlow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff4dc" stop-opacity=".8"/><stop offset=".4" stop-color="#ffe8c0" stop-opacity=".25"/><stop offset="1" stop-color="#ffe8c0" stop-opacity="0"/></radialGradient>
  <linearGradient id="beamL" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#fff6e2" stop-opacity=".62"/><stop offset=".35" stop-color="#fff0d4" stop-opacity=".22"/><stop offset="1" stop-color="#fff0d4" stop-opacity="0"/></linearGradient>
  <linearGradient id="beamR" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff6e2" stop-opacity=".35"/><stop offset="1" stop-color="#fff0d4" stop-opacity="0"/></linearGradient>
  <linearGradient id="ironWall" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3c4646"/><stop offset=".5" stop-color="#2c3434"/><stop offset="1" stop-color="#1a2020"/></linearGradient>
  <linearGradient id="glassSheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c8d6f0" stop-opacity=".16"/><stop offset=".5" stop-color="#c8d6f0" stop-opacity="0"/><stop offset="1" stop-color="#c8d6f0" stop-opacity=".06"/></linearGradient>
  <radialGradient id="lensGlass" cx=".5" cy=".5" r=".55"><stop offset="0" stop-color="#fffdf4"/><stop offset=".25" stop-color="#fff4d8"/><stop offset=".6" stop-color="#e8d6a8"/><stop offset="1" stop-color="#9c8a62"/></radialGradient>
  <filter id="b24" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="24"/></filter>
  <filter id="cloudT" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".0028 .006" numOctaves="5" seed="31"/>
    <feColorMatrix values="0 0 0 0 .55  0 0 0 0 .62  0 0 0 0 .74  0 0 0 2.2 -1.05"/><feGaussianBlur stdDeviation="2"/></filter>
  <filter id="rockT" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".02 .035" numOctaves="4" seed="8"/>
    <feColorMatrix values="0 0 0 0 .05  0 0 0 0 .06  0 0 0 0 .08  0 0 0 1.1 -.42"/></filter>
`);

// rain: fast slanted streaks in an area (world units); seamless at the loop because every streak's travel is periodic
function rain(t, { n = 140, seed = 3, area = [-300, -300, 1400, 2300], slant = .2, op = .45, len = [50, 110], w = [1.6, 3], col = '#c4d0e6', speed = 2400 } = {}) {
  const R = rng(seed), H2 = area[3] - area[1], W2 = area[2] - area[0]; let s = '';
  for (let i = 0; i < n; i++) {
    const z = .45 + R() * .55, L = lerp(len[0], len[1], R()) * z, sp = speed * z, x0 = area[0] + R() * W2, y0 = R() * H2;
    const y = area[1] + ((y0 + t * sp) % H2), x = area[0] + ((x0 - area[0] + (y - area[1]) * slant) % W2 + W2) % W2;
    s += `<path d="M${F1(x)} ${F1(y)} l${F1(-L * slant)} ${F1(-L)}" stroke="${col}" stroke-width="${F1(lerp(w[0], w[1], z))}" stroke-linecap="round" opacity="${(op * (.4 + .6 * z)).toFixed(2)}"/>`;
  }
  return s;
}
// water running down a pane: wavy rivulets + beads (world area x0, y0, x1, y1)
function glassWater(t, { n = 16, beads = 60, seed = 5, area = [0, 0, 1080, 1920], op = .5 } = {}) {
  const R = rng(seed); let s = '';
  for (let i = 0; i < n; i++) {
    const x = area[0] + R() * (area[2] - area[0]), y0 = area[1] + R() * (area[3] - area[1]) * .7, L = 160 + R() * 420, ph = R() * 6;
    const head = y0 + ((t * (60 + R() * 80) + R() * 300) % L);
    let d = `M${F1(x)} ${F1(y0)}`; for (let y = y0 + 20; y <= head; y += 20) d += ` L${F1(x + Math.sin(y * .03 + ph) * 6)} ${F1(y)}`;
    s += `<path d="${d}" stroke="#d8e2f2" stroke-width="${F1(2.5 + R() * 2.5)}" fill="none" stroke-linecap="round" opacity="${(op * .55).toFixed(2)}"/>
      <ellipse cx="${F1(x + Math.sin(head * .03 + ph) * 6)}" cy="${F1(head)}" rx="5" ry="7" fill="#e8f0ff" opacity="${(op * .8).toFixed(2)}"/>`;
  }
  for (let i = 0; i < beads; i++) { const x = area[0] + R() * (area[2] - area[0]), y = area[1] + R() * (area[3] - area[1]), r = 2 + R() * 4;
    s += `<circle cx="${F1(x)}" cy="${F1(y)}" r="${F1(r)}" fill="#dfe8f8" opacity="${(op * (.3 + .4 * R())).toFixed(2)}"/><circle cx="${F1(x - r * .3)}" cy="${F1(y - r * .3)}" r="${F1(r * .35)}" fill="#fff" opacity="${(op * .9).toFixed(2)}"/>`; }
  return s;
}
// the storm sky: dark gradient, a moon smothered in cloud (upper right), rolling cloud masses lit from beneath by the beam
function stormSky(t, { y1 = 1250, moon = [880, 260] } = {}) {
  const dr = t * 14;
  return `<rect x="-600" y="-600" width="2300" height="${y1 + 600}" fill="url(#stormSky)"/>
    <circle cx="${moon[0]}" cy="${moon[1]}" r="260" fill="#9fb2d8" opacity=".3" filter="url(#b40)"/><circle cx="${moon[0]}" cy="${moon[1]}" r="58" fill="#d8e2f6" opacity=".55" filter="url(#b8)"/>
    <g transform="translate(${F1(-dr)} 0)"><rect x="-600" y="-600" width="2600" height="${y1 + 500}" filter="url(#cloudT)" opacity=".55"/></g>
    <g filter="url(#b40)" opacity=".9">${[[-100, 120, 520, 150, '#0e1626'], [700, 60, 600, 170, '#121b2e'], [250, 420, 700, 120, '#1a2438'], [960, 520, 480, 110, '#141d30'], [-200, 700, 600, 120, '#202c44']].map(([x, y, rx, ry, c]) =>
      `<ellipse cx="${F1(x - dr * .6)}" cy="${y}" rx="${rx}" ry="${ry}" fill="${c}"/>`).join('')}</g>`;
}
// the sea: dark swell bands to the horizon, white crests, spray bursting on the rocks
function stormSea(t, { y0 = 1180 } = {}) {
  let s = `<rect x="-600" y="${y0}" width="2300" height="${2600 - y0}" fill="url(#stormSea)"/>
    <rect x="-600" y="${y0 - 6}" width="2300" height="40" fill="#3e4e68" opacity=".55" filter="url(#b8)"/>`;
  const R = rng(17);
  for (let j = 0; j < 9; j++) {
    const y = y0 + 20 + j * j * 14, a = 6 + j * 3.2, ph = R() * 6, sp = 1 + R() * .6, col = j % 2 ? '#1e2c44' : '#14203a';
    let d = `M-600 ${F1(y + 40 + j * 6)}`; for (let x = -600; x <= 1700; x += 40) d += ` L${x} ${F1(y + Math.sin(x * .006 + t * sp + ph) * a + Math.sin(x * .017 - t * 1.7 * sp) * a * .4)}`;
    s += `<path d="${d} L1700 ${F1(y + 60 + j * 8)} Z" fill="${col}" opacity=".85"/>`;
    let c = ''; for (let x = -600; x <= 1700; x += 40) { const yy = y + Math.sin(x * .006 + t * sp + ph) * a + Math.sin(x * .017 - t * 1.7 * sp) * a * .4; c += `${x === -600 ? 'M' : 'L'}${x} ${F1(yy)}`; }
    s += `<path d="${c}" stroke="#b8c6dc" stroke-width="${F1(1.5 + j * .5)}" fill="none" opacity="${(.12 + .03 * j).toFixed(2)}" stroke-dasharray="${30 + j * 10} ${60 + j * 25}" stroke-dashoffset="${F1(-t * 40 * sp)}"/>`;
  }
  return s;
}
// spray bursting where the swell hits the rock: puffs that burst, rise and fall back (each loops on its own period)
function seaSpray(cx, cy, t, { n = 14, seed = 2, w = 360, h = 260, op = .7 } = {}) {
  const R = rng(seed); let s = '';
  for (let i = 0; i < n; i++) { const per = 1.8 + R() * 1.4, p = ((t + R() * per) % per) / per, x = cx + (R() - .5) * w, up = Math.sin(Math.PI * Math.min(1, p * 1.3)) * h * (.5 + R() * .5);
    s += `<circle cx="${F1(x + (p - .5) * 60)}" cy="${F1(cy - up)}" r="${F1(30 + 70 * p)}" fill="#dce6f4" opacity="${(op * (1 - p) * .8).toFixed(2)}"/>`; }
  return `<g filter="url(#b14)">${s}</g>`;
}
// the rock the tower stands on, and the keeper's cottage at its foot
function rockIsland() {
  return `<path d="M-120 1540 C-60 1440 60 1400 180 1392 C260 1340 360 1320 460 1330 C560 1310 680 1316 760 1340 C860 1350 960 1400 1040 1460 C1120 1500 1200 1560 1260 1640 L1260 2000 L-120 2000 Z" fill="#20252c" filter="url(#pcl)"/>
    <path d="M-120 1540 C-60 1440 60 1400 180 1392 C260 1340 360 1320 460 1330 C560 1310 680 1316 760 1340 C860 1350 960 1400 1040 1460 C1120 1500 1200 1560 1260 1640 L1260 2000 L-120 2000 Z" filter="url(#rockT)"/>
    <path d="M180 1392 L260 1470 L200 1560 M460 1330 L420 1420 L500 1500 M760 1340 L820 1440 L760 1520 M1040 1460 L980 1560" stroke="#0e1116" stroke-width="6" fill="none" opacity=".7"/>
    <path d="M180 1392 C260 1340 360 1320 460 1330 C560 1310 680 1316 760 1340 C860 1350 960 1400 1040 1460" stroke="#5a6474" stroke-width="5" fill="none" opacity=".5"/>`;
}
function cottage(x, y) {
  return `<g transform="translate(${x} ${y})">
    <path d="M-110 0 L-110 -96 L110 -96 L110 0 Z" fill="#bab4a6" filter="url(#pcl)"/>
    <path d="M-126 -90 L0 -170 L126 -90 Z" fill="#33302e" filter="url(#pcl)"/>
    <rect x="62" y="-176" width="24" height="44" fill="#4a4440"/>
    <rect x="-70" y="-74" width="44" height="40" fill="#ffd9a0"/><path d="M-48 -74 L-48 -34 M-70 -54 L-26 -54" stroke="#2a2420" stroke-width="5"/>
    <circle cx="-48" cy="-54" r="60" fill="#ffd6a0" opacity=".28" filter="url(#b24)" style="mix-blend-mode:screen"/>
    <rect x="20" y="-70" width="40" height="70" fill="#2a2420"/></g>`;
}
// the tower: tapered white stone with two dull red bands, the gallery, the lantern (lamp lit) and its dome.
// beam = the angle (deg) of the rotating beam; lit = lamp 0..1
function lighthouse(cx, base, t, { beam = 200, lit = 1 } = {}) {
  const top = base - 780, wb = 108, wt = 70, X = (y, k) => cx + k * lerp(wt, wb, (y - top) / (base - top));
  const shaft = `M${X(top, -1)} ${top} L${X(base, -1)} ${base} L${X(base, 1)} ${base} L${X(top, 1)} ${top} Z`;
  const band = (y0, y1) => `M${F1(X(y0, -1))} ${y0} L${F1(X(y1, -1))} ${y1} L${F1(X(y1, 1))} ${y1} L${F1(X(y0, 1))} ${y0} Z`;
  const ly = top - 80, lr = 58;
  // the beam: a long soft wedge from the lamp, plus the weaker back beam
  const a = beam * Math.PI / 180, far = 1900, sp = .09, bm = (ang, len, grad, op) => { const p1 = [cx + Math.cos(ang - sp) * len, ly + Math.sin(ang - sp) * len], p2 = [cx + Math.cos(ang + sp) * len, ly + Math.sin(ang + sp) * len];
    return `<path d="M${cx} ${ly - 14} L${F1(p1[0])} ${F1(p1[1])} L${F1(p2[0])} ${F1(p2[1])} L${cx} ${ly + 14} Z" fill="url(#${grad})" opacity="${op}" style="mix-blend-mode:screen" filter="url(#b8)"/>`; };
  return `${lit > .01 ? bm(a, far, 'beamL', (.95 * lit).toFixed(2)) + bm(a + Math.PI, far * .5, 'beamR', (.5 * lit).toFixed(2)) : ''}
    <path d="${shaft}" fill="url(#towerG)" filter="url(#pcl)"/>
    <g filter="url(#pc)" fill="url(#bandG)"><path d="${band(top + 150, top + 240)}"/><path d="${band(top + 430, top + 520)}"/></g>
    ${[top + 330, top + 600].map(y => `<rect x="${cx - 9}" y="${y}" width="18" height="34" rx="8" fill="#1a1c22"/>`).join('')}
    <path d="M${cx - 30} ${base} L${cx - 30} ${base - 70} Q${cx} ${base - 100} ${cx + 30} ${base - 70} L${cx + 30} ${base} Z" fill="#22242a"/>
    <path d="M${cx - 104} ${top + 4} L${cx + 104} ${top + 4} L${cx + 96} ${top + 22} L${cx - 96} ${top + 22} Z" fill="#2a2c30" filter="url(#pcl)"/>
    <g stroke="#2a2c30" stroke-width="5">${[-90, -60, -30, 0, 30, 60, 90].map(dx => `<path d="M${cx + dx} ${top + 4} L${cx + dx} ${top - 44}"/>`).join('')}<path d="M${cx - 100} ${top - 44} L${cx + 100} ${top - 44}" stroke-width="7"/></g>
    <rect x="${cx - lr}" y="${ly - 46}" width="${lr * 2}" height="96" fill="url(#lampCore)"/>
    <g stroke="#1e2026" stroke-width="5">${[-lr, -20, 20, lr].map(dx => `<path d="M${cx + dx} ${ly - 46} L${cx + dx} ${ly + 50}"/>`).join('')}<path d="M${cx - lr} ${ly + 2} L${cx + lr} ${ly + 2}" stroke-width="3"/></g>
    <circle cx="${cx}" cy="${ly}" r="${F1(150 * lit)}" fill="url(#lampGlow)" style="mix-blend-mode:screen"/>
    <path d="M${cx - lr - 8} ${ly - 46} Q${cx} ${ly - 120} ${cx + lr + 8} ${ly - 46} Z" fill="#26282e" filter="url(#pcl)"/>
    <circle cx="${cx}" cy="${ly - 104}" r="10" fill="#26282e" filter="url(#pcs)"/><path d="M${cx} ${ly - 112} L${cx} ${ly - 170}" stroke="#26282e" stroke-width="3"/>`;
}

// ---------- the lamp room ----------
// back layer: the storm through the glazing (sea, sky, rain), the iron mullions, the panelled iron wall below.
// winY0..winY1 = the glazing; the floor is off-frame.
const LR = { winY0: 300, winY1: 1480, horizon: 960 };
function lampRoomBack(t, { blur = null, flash = 0 } = {}) {
  const { winY0: y0, winY1: y1, horizon: hz } = LR;
  const outside = `<g>${stormSky(t * .6, { y1: hz, moon: [1500, 380] })}${stormSea(t, { y0: hz })}
      ${rain(t, { n: 110, seed: 11, area: [-400, y0 - 100, 1900, y1 + 100], slant: .28, op: .5, len: [60, 130] })}
      <rect x="-600" y="${y0}" width="2400" height="${y1 - y0}" fill="#9fb4dc" opacity="${(.4 * flash).toFixed(3)}"/></g>`;
  const mull = [-420, -120, 180, 480, 780, 1080, 1380, 1680];
  return (blur ? `<g filter="url(#${blur})">` : '') + `
    <rect x="-700" y="-400" width="2600" height="${y0 + 400}" fill="#1c2222"/>
    <rect x="-700" y="${y0}" width="2600" height="${y1 - y0}" fill="#0c1220"/>
    <clipPath id="lrWin"><rect x="-700" y="${y0}" width="2600" height="${y1 - y0}"/></clipPath><g clip-path="url(#lrWin)">${outside}
      ${glassWater(t, { n: 20, beads: 80, seed: 6, area: [-500, y0, 1800, y1], op: .55 })}
      <rect x="-700" y="${y0}" width="2600" height="${y1 - y0}" fill="url(#glassSheen)"/></g>
    <g fill="#14181c">${mull.map(x => `<rect x="${x - 13}" y="${y0}" width="26" height="${y1 - y0}"/>`).join('')}<rect x="-700" y="${(y0 + y1) / 2 - 10}" width="2600" height="20"/></g>
    <g stroke="#2e3434" stroke-width="3" opacity=".7">${mull.map(x => `<path d="M${x - 11} ${y0} L${x - 11} ${y1}"/>`).join('')}</g>
    <rect x="-700" y="${y0 - 40}" width="2600" height="44" fill="#232a2a"/>
    <rect x="-700" y="${y1 - 6}" width="2600" height="40" fill="#2e3636"/>
    <rect x="-700" y="${y1 + 34}" width="2600" height="1400" fill="url(#ironWall)"/>
    ${[-400, -100, 200, 500, 800, 1100, 1400].map(x => `<rect x="${x}" y="${y1 + 80}" width="250" height="360" rx="6" fill="none" stroke="#141a1a" stroke-width="6" opacity=".7"/><rect x="${x + 6}" y="${y1 + 86}" width="238" height="348" rx="5" fill="none" stroke="#4a5454" stroke-width="2" opacity=".4"/>`).join('')}
    ${[-260, 340, 940].map(x => `<circle cx="${x}" cy="${y1 + 60}" r="7" fill="#151a1a"/>`).join('')}` + (blur ? '</g>' : '');
}
// the lens: a tall beehive of glass prism rings in a brass frame; the lamp burns at its heart. (cx, cy) = the flame
function fresnelLens(cx, cy, s, t, { glow = 1, foot = 1420 } = {}) {
  const f = .94 + .06 * flkSeam(t, 5), H2 = 520, W2 = 250;
  const prof = u => W2 * (u < 0 ? Math.sqrt(1 - Math.pow(-u, 2.4)) : Math.sqrt(1 - Math.pow(u, 3))) ;   // half-width at u in -1..1 (top..bottom)
  let outline = '', rings = '';
  const pts = []; for (let i = 0; i <= 40; i++) { const u = -1 + 2 * i / 40; pts.push([prof(u), u * H2]); }
  outline = `M${pts.map(([w, y]) => `${F1(-w)} ${F1(y)}`).join(' L')} L${[...pts].reverse().map(([w, y]) => `${F1(w)} ${F1(y)}`).join(' L')} Z`;
  for (let j = -9; j <= 9; j++) { if (Math.abs(j) < 2) continue; const u = j / 10, y = u * H2, w = prof(u) - 4;
    rings += `<path d="M${F1(-w)} ${F1(y)} Q0 ${F1(y + 16 * Math.sign(u))} ${F1(w)} ${F1(y)}" stroke="#6a5a3a" stroke-width="3" fill="none" opacity=".55"/>
      <path d="M${F1(-w * .9)} ${F1(y - 6)} Q0 ${F1(y + 10 * Math.sign(u) - 6)} ${F1(w * .9)} ${F1(y - 6)}" stroke="#fffaf0" stroke-width="2.4" fill="none" opacity=".5"/>`; }
  return `<g transform="translate(${F1(cx)} ${F1(cy)}) scale(${s})">
    <circle cx="0" cy="0" r="${F1(620 * glow * f)}" fill="url(#lampGlow)" style="mix-blend-mode:screen"/>
    <path d="M-150 ${H2 - 40} L150 ${H2 - 40} L190 ${H2 + 90} L-190 ${H2 + 90} Z" fill="url(#brassG)" filter="url(#pcl)"/>
    <path d="M-120 ${H2 + 90} L120 ${H2 + 90} L132 ${foot} L-132 ${foot} Z" fill="#33332e" filter="url(#pcl)"/>
    <path d="${outline}" fill="url(#lensGlass)" filter="url(#pcl)"/>
    <ellipse cx="0" cy="0" rx="${F1(W2 * .75)}" ry="70" fill="#ffffff" opacity="${(.85 * glow * f).toFixed(2)}" filter="url(#b14)"/>
    <rect x="${-W2}" y="-26" width="${2 * W2}" height="52" fill="#fffef8" opacity="${(.7 * glow).toFixed(2)}" filter="url(#b3)"/>
    ${rings}
    <g stroke="url(#brassG)" stroke-width="10" fill="none">${[-.62, -.22, .22, .62].map(k => `<path d="M${F1(k * W2 * .55)} ${-H2 + 30} C${F1(k * W2 * 1.05)} ${-H2 * .4} ${F1(k * W2 * 1.05)} ${H2 * .4} ${F1(k * W2 * .62)} ${H2 - 40}"/>`).join('')}</g>
    <path d="M${-W2 - 6} -34 L${W2 + 6} -34 M${-W2 - 6} 34 L${W2 + 6} 34" stroke="url(#brassG)" stroke-width="12"/>
    <circle cx="0" cy="${-H2 - 10}" r="26" fill="url(#brassG)" filter="url(#pcs)"/>
    <path d="M-60 ${-H2 * .7} C-90 ${-H2 * .3} -96 ${H2 * .2} -70 ${H2 * .6}" stroke="#fff" stroke-width="10" fill="none" opacity=".35" filter="url(#b3)"/></g>`;
}
// the glazing seen from OUTSIDE (shot 4): iron frame at the edges and a transom above the heads; rain over the glass
function glazingFront(t, { y0 = 560, y1 = 2300 } = {}) {
  return `<rect x="-200" y="${y0}" width="1480" height="${y1 - y0}" fill="url(#glassSheen)"/>
    ${glassWater(t, { n: 22, beads: 110, seed: 9, area: [-100, y0, 1180, y1], op: .55 })}
    <g fill="#14181c" filter="url(#pcl)"><rect x="-200" y="${y0 - 120}" width="1480" height="130"/><rect x="-200" y="${y0}" width="210" height="${y1 - y0}"/><rect x="1060" y="${y0}" width="220" height="${y1 - y0}"/></g>
    <path d="M10 ${y0 + 8} L1060 ${y0 + 8}" stroke="#3a4448" stroke-width="4" opacity=".7"/>`;
}
