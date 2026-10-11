// "The Taster" — sets. The great hall at night (the dais with the high table; the hall of nobles seen from the dais;
// the establishing view from the far end), the boy's cell (night / dawn), the floor under the table, the gallows at dawn,
// and the wine inside the goblet. Painted, opaque, layered: what a character sits behind is drawn in a front layer.

addDefs(`
  <filter id="stoneT2" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".012 .02" numOctaves="4" seed="12"/>
    <feColorMatrix values="0 0 0 0 .1  0 0 0 0 .09  0 0 0 0 .08  0 0 0 .8 -.25"/></filter>
  <filter id="b24" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="24"/></filter>
  <linearGradient id="nightGlass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1e2c52"/><stop offset=".6" stop-color="#2c3e6a"/><stop offset="1" stop-color="#46588a"/></linearGradient>
  <linearGradient id="linenG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ece4d2"/><stop offset="1" stop-color="#bcb29c"/></linearGradient>
  <linearGradient id="bannerG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9a2a2c"/><stop offset=".5" stop-color="#7e1c20"/><stop offset="1" stop-color="#4a0e12"/></linearGradient>
  <linearGradient id="dawnSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a6a88"/><stop offset=".55" stop-color="#9aa6b8"/><stop offset="1" stop-color="#d8d4cc"/></linearGradient>
  <linearGradient id="dawnBeam" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dfe6f4" stop-opacity=".55"/><stop offset="1" stop-color="#dfe6f4" stop-opacity="0"/></linearGradient>
  <radialGradient id="wineSurf" cx=".45" cy=".42" r=".6"><stop offset="0" stop-color="#7a1626"/><stop offset=".7" stop-color="#4a0a16"/><stop offset="1" stop-color="#26040a"/></radialGradient>
`);

// ---------- view clipping: big pieces are only drawn where the camera can see them (+ a margin wider than any blur) ----------
const VW = () => (typeof window !== 'undefined' && window.__VIEW) || [-1e5, -1e5, 1e5, 1e5];
const VM = 120;
function rectV(x, y, w, h, attrs) {
  const v = VW(), x0 = Math.max(x, v[0] - VM), y0 = Math.max(y, v[1] - VM), x1 = Math.min(x + w, v[2] + VM), y1 = Math.min(y + h, v[3] + VM);
  return x1 > x0 && y1 > y0 ? `<rect x="${F1(x0)}" y="${F1(y0)}" width="${F1(x1 - x0)}" height="${F1(y1 - y0)}" ${attrs}/>` : '';
}
const spanX = (a, b) => { const v = VW(); return [Math.max(a, v[0] - VM), Math.min(b, v[2] + VM)]; };
// depth of field: a blur sized to the view (filter region = what the camera sees + 3 sigma), its strength capped in screen
// pixels so close-ups stay fast. The id starts with "dof" so the normal pass keeps the blur too.
let DOFN = 0;
function dofG(name, inner) {
  if (!name) return inner;
  const base = { dof: 11, dofHeavy: 20, dofLight: 5 }[name] || 8, z = (typeof window !== 'undefined' && window.__Z) || 1;
  const sd = Math.min(base, (name === 'dofHeavy' ? 70 : name === 'dof' ? 45 : 22) / z), v = VW(), m = sd * 3 + 10, id = 'dofV' + (DOFN++);
  if (v[0] < -9e4) return `<g filter="url(#${name})">${inner}</g>`;
  return `<defs><filter id="${id}" filterUnits="userSpaceOnUse" x="${F1(v[0] - m)}" y="${F1(v[1] - m)}" width="${F1(v[2] - v[0] + 2 * m)}" height="${F1(v[3] - v[1] + 2 * m)}"><feGaussianBlur stdDeviation="${sd.toFixed(2)}"/></filter></defs><g filter="url(#${id})">${inner}</g>`;
}
// a stone wall (same block grid and a user-space gradient whatever part of it is drawn)
function wallV(x0, y0, x1, y1, cols, { course = 110, block = 210, jointOp = .35, tex2 = .35 } = {}) {
  const v = VW();
  const WM = 70, cx0 = Math.max(x0, x0 + Math.floor((v[0] - WM - x0) / block) * block), cx1 = Math.min(x1, v[2] + WM);
  const n0 = Math.max(0, Math.floor((v[1] - WM - y0) / (2 * course)) * 2), cy0 = y0 + n0 * course, cy1 = Math.min(y1, v[3] + WM);
  if (cx1 <= cx0 || cy1 <= cy0) return '';
  const id = fid('wv'); let j = '';
  for (let y = cy0, r = n0; y < cy1; y += course, r++) {
    j += `M${F1(cx0)} ${y} L${F1(cx1)} ${y} `;
    for (let x = x0 + (r % 2 ? block / 2 : 0) + Math.floor((cx0 - x0) / block) * block; x < cx1; x += block) if (x >= cx0) j += `M${x} ${y} L${x} ${Math.min(cy1, y + course)} `;
  }
  const R = `x="${F1(cx0)}" y="${F1(cy0)}" width="${F1(cx1 - cx0)}" height="${F1(cy1 - cy0)}"`;
  return `<defs>${linG(id, cols, { user: [0, y0, 0, y1] })}</defs><rect ${R} fill="url(#${id})"/><rect ${R} filter="url(#stoneT)" opacity=".5"/>
    ${tex2 ? `<rect ${R} filter="url(#stoneT2)" opacity="${tex2}"/>` : ''}<path d="${j}" stroke="#000" stroke-width="6" opacity="${jointOp}"/>`;
}

// ---------- the dais (world: the table top at y 1430, the back wall behind) ----------
const DAIS = { top: 1430, king: [560, 1864, .62], boy: [830, 1680, .6], queen: [1100, 1850, .6] };
function banner(x, y0, y1, w = 170) {
  return `<g><rect x="${x - w / 2 - 14}" y="${y0 - 14}" width="${w + 28}" height="18" rx="8" fill="#3a2a1a" filter="url(#pcs)"/>
    <path d="M${x - w / 2} ${y0} L${x + w / 2} ${y0} L${x + w / 2} ${y1} L${x} ${y1 - 70} L${x - w / 2} ${y1} Z" fill="url(#bannerG)" filter="url(#pcl)"/>
    <path d="M${x - w / 2 + 14} ${y0} L${x - w / 2 + 14} ${y1 - 12} M${x + w / 2 - 14} ${y0} L${x + w / 2 - 14} ${y1 - 12}" stroke="#c8a040" stroke-width="6" opacity=".8"/>
    <g transform="translate(${x} ${(y0 + y1) / 2 - 60})"><path d="M-46 30 L-46 -14 L-26 8 L0 -34 L26 8 L46 -14 L46 30 Z" fill="#d8a845" filter="url(#pcs)"/><circle cx="0" cy="-42" r="7" fill="#d8a845"/></g>
    <g filter="url(#softW)" opacity=".45"><path d="M${x - 30} ${y0 + 40} L${x - 34} ${y1 - 60} M${x + 34} ${y0 + 40} L${x + 30} ${y1 - 60}" stroke="#3a0608" stroke-width="12"/></g></g>`;
}
function gothicWindow(cx, y0, y1, w, t, { moon = 1 } = {}) {
  const r = w / 2, id = 'gw' + Math.round(cx);
  const arch = `M${cx - r} ${y1} L${cx - r} ${y0 + r} Q${cx - r} ${y0} ${cx} ${y0 - r * .5} Q${cx + r} ${y0} ${cx + r} ${y0 + r} L${cx + r} ${y1} Z`;
  let lat = ''; for (let i = -8; i <= 8; i++) lat += `M${cx + i * 40 - 400} ${y0 - 200} l800 800 M${cx + i * 40 + 400} ${y0 - 200} l-800 800 `;
  return `<path d="${arch}" fill="#1a1410" transform="translate(0 -6) scale(1)" stroke="#2a2018" stroke-width="40"/>
    <clipPath id="${id}"><path d="${arch}"/></clipPath><g clip-path="url(#${id})"><rect x="${cx - r}" y="${y0 - r}" width="${w}" height="${y1 - y0 + r}" fill="url(#nightGlass)"/>
      <circle cx="${cx + r * .3}" cy="${y0 + r * .6}" r="${r * .9}" fill="#c8d6ff" opacity="${(.35 * moon).toFixed(2)}" filter="url(#b24)"/>
      <rect x="${cx - r}" y="${y0 - r}" width="${w}" height="${y1 - y0 + r}" filter="url(#frostT)" opacity=".25"/>
      <path d="${lat}" stroke="#141010" stroke-width="5" fill="none" opacity=".85"/></g>
    <path d="M${cx} ${y0 - r * .5} L${cx} ${y1}" stroke="#1a1410" stroke-width="16"/><path d="M${cx - r} ${(y0 + y1) / 2 + 40} L${cx + r} ${(y0 + y1) / 2 + 40}" stroke="#1a1410" stroke-width="14"/>
    <rect x="${cx - r - 30}" y="${y1}" width="${w + 60}" height="34" fill="#4a3e32" filter="url(#pcl)"/>`;
}
function chandelier(cx, y, t, s = 1) {
  const sw = Math.sin(t * .8) * 3 * seamW(t);
  return `<g transform="translate(${F1(cx + sw)} ${y}) scale(${s})">
    <path d="M0 -600 L0 -40" stroke="#1a1410" stroke-width="8"/><path d="M-260 0 Q0 60 260 0" stroke="#1e1612" stroke-width="18" fill="none"/>
    <path d="M-260 0 L0 -40 L260 0" stroke="#1e1612" stroke-width="6" fill="none"/>
    ${[-240, -150, -60, 30, 120, 210].map((x, i) => `<g transform="translate(${x + 15} ${Math.abs(x + 15) * -.04 + 16})"><rect x="-8" y="-60" width="16" height="56" fill="#ece2c8"/>
      <path d="M0 -94 C8 -78 9 -68 0 -60 C-9 -68 -8 -78 0 -94 Z" fill="url(#flameG)" transform="translate(${F1(Math.sin(t * 9 + i) * 1.5 * seamW(t))} 0)"/>
      <circle cx="0" cy="-74" r="60" fill="url(#candleGlow)" style="mix-blend-mode:screen"/></g>`).join('')}</g>`;
}
// back layer of the dais: stone wall, the great window behind the high table, banners, torches, the chandelier
function daisBack(t, { blur = null, moon = 1 } = {}) {
  const inner = `${wallV(-900, -700, 2000, 1780, ['#5e5246', '#2e2620'], { course: 120, block: 240, jointOp: .45 })}
    ${[-140, 1800].map(x => rectV(x - 70, -700, 140, 2480, 'fill="#4a3e34" filter="url(#pcl)"') + rectV(x - 70, -700, 140, 2480, 'filter="url(#stoneT2)" opacity=".4"')).join('')}
    ${gothicWindow(830, 330, 1150, 320, t, { moon })}
    ${banner(260, 140, 1180)}${banner(1400, 140, 1180)}
    ${wallTorch(-20, 760, t, { s: .9, seed: 3, glow: .5 })}${wallTorch(1680, 760, t, { s: .9, seed: 7, glow: .5 })}
    ${chandelier(830, 40, t, 1)}`;
  return dofG(blur, inner);
}
// the high table: linen top (items stand on y = DAIS.top), the front cloth with a red runner and gold band
function daisTable(items = '', { y = DAIS.top, front = '' } = {}) {
  const [a, b] = spanX(-900, 2000);
  if (b <= a) return items + front;
  return `<path d="M${F1(a)} ${y - 22} L${F1(b)} ${y - 22} L${F1(b)} ${y + 14} L${F1(a)} ${y + 14} Z" fill="#e2dac6" filter="url(#pcl)"/>
    ${items}
    <path d="M${F1(a)} ${y + 10} L${F1(b)} ${y + 10} L${F1(b)} ${y + 420} L${F1(a)} ${y + 420} Z" fill="url(#linenG)" filter="url(#pcl)"/>
    <g filter="url(#softW)" opacity=".45">${[-700, -380, -60, 260, 580, 900, 1220, 1540, 1860].filter(x => x > a - 40 && x < b + 40).map(x => `<path d="M${x} ${y + 30} C${x + 8} ${y + 140} ${x - 6} ${y + 260} ${x + 4} ${y + 400}" stroke="#8a806c" stroke-width="14" fill="none"/>`).join('')}</g>
    <path d="M${F1(a)} ${y + 40} L${F1(b)} ${y + 40} L${F1(b)} ${y + 110} L${F1(a)} ${y + 110} Z" fill="#7e1c20" filter="url(#pcs)"/>
    <path d="M${F1(a)} ${y + 44} L${F1(b)} ${y + 44} M${F1(a)} ${y + 106} L${F1(b)} ${y + 106}" stroke="#d0a040" stroke-width="5"/>${front}`;
}

// ---------- the hall seen from the dais: three rows of tables, nobles facing us ----------
// heads(i) → the pose for noble i (look / turn / etc.); cups(i) → 0..1 a cup raised
function hallNave(t, { heads = () => ({}), cups = () => 0, blurFar = 'dofLight' } = {}) {
  const far = dofG('dof', `
      ${wallV(-700, -500, 1800, 1100, ['#544a40', '#2a241e'], { course: 110, block: 220, jointOp: .4, tex2: 0 })}
      <path d="M380 1100 L380 520 Q380 330 540 300 Q700 330 700 520 L700 1100 Z" fill="#120e0a"/><path d="M380 520 Q380 330 540 300 Q700 330 700 520" stroke="#3a3028" stroke-width="30" fill="none"/>
      ${gothicWindow(80, 160, 760, 220, t)}${gothicWindow(1000, 160, 760, 220, t)}
      ${banner(250, 40, 760, 130)}${banner(830, 40, 760, 130)}
      ${wallTorch(-160, 700, t, { s: .8, seed: 2, glow: .45 })}${wallTorch(1240, 700, t, { s: .8, seed: 9, glow: .45 })}
      <rect x="-700" y="1000" width="2500" height="200" fill="#2a221c"/>
      ${Array.from({ length: 9 }, (_, i) => { const x = -100 + i * 160; return crowdBust(x, 1010, .55, { skin: CROWD_SKIN[i % 5], cloth: CROWD_CLOTH[(i * 3) % 7], t, ph: i * 1.3, rimOp: .2 }); }).join('')}
      <rect x="-700" y="1040" width="2500" height="70" fill="#d8cfbc"/><rect x="-700" y="1100" width="2500" height="140" fill="#9a907c"/>`);
  const row = (idx, xs, yTop, s, blur) => {
    let people = '';
    xs.forEach((x, j) => { const i = idx[j], pose = heads(i, Math.round(x * 7 + yTop) % 11), b = brS(t, i * 1.3 + x * .01, 1);
      const cup = cups(i), A = cup > .01 ? qArm(-1, lerp2([-120, -700], [-150, -1080], cup), 'grip', { bend: 1 }) : null;
      people += outlined(manb(x, yTop + 700 * s, s, NOBLES[i % NOBLES.length], { breath: b, ...(A ? { armL: A } : {}), ...pose, look: (pose.look || 0) + (x - 540) * -.004, lookY: (pose.lookY || 0) + 1 })
        + (A ? atb(x, yTop + 700 * s, s, pewterCup(A.wr[0] - 6, A.wr[1] - 70, 1.2, { tilt: -10 }) + HANDS.grip(-1, A.wr[0], A.wr[1] - 3, 1.35, handAng(A), { S: SKIN_TONES[NOBLES[i % NOBLES.length].skin], sk: NOBLES[i % NOBLES.length].skin }), b) : '')); });
    const [ta, tb] = spanX(-700, 1800);
    const tbl = `<path d="M${F1(ta)} ${yTop - 16} L${F1(tb)} ${yTop - 16} L${F1(tb)} ${yTop + 10} L${F1(ta)} ${yTop + 10} Z" fill="#ddd4c0" filter="url(#pcl)"/>
      <path d="M${F1(ta)} ${yTop + 8} L${F1(tb)} ${yTop + 8} L${F1(tb)} ${yTop + 420 * s + 60} L${F1(ta)} ${yTop + 420 * s + 60} Z" fill="url(#linenG)" filter="url(#pcl)"/>
      ${xs.map((x, j) => `${pewterCup(x + 120 * s, yTop - 80 * s, s * .9, { wine: .7 })}${j % 2 ? tableCandle(x - 180 * s, yTop - 6, t, s * 1.1, j + idx[0]) : breadLoaf(x - 170 * s, yTop - 20 * s, s * .6)}`).join('')}`;
    return dofG(blur, people + tbl);
  };
  return `${far}${row([0, 3, 5, 1, 6, 2], [40, 230, 420, 610, 800, 990], 1180, .42, 'dofLight')}${row([7, 4, 0, 2, 5], [80, 320, 560, 800, 1040], 1470, .56, null)}${row([1, 3, 6], [150, 540, 930], 1840, .74, null)}`;
}

// ---------- the establishing view: down the hall toward the dais (backs of the nobles in front) ----------
function backBust(x, y, s, { cloth = '#4a3a2a', hair = '#1e140e', bald = 0 } = {}) {
  return `<g transform="translate(${F1(x)} ${F1(y)}) scale(${s})" filter="url(#pcl)">
    <path d="M-130 80 C-130 -10 -90 -60 -44 -70 L44 -70 C90 -60 130 -10 130 80 Z" fill="${cloth}"/>
    <ellipse cx="0" cy="-122" rx="56" ry="64" fill="${bald ? '#b88a6a' : hair}"/>${bald ? `<path d="M-56 -110 C-50 -70 50 -70 56 -110 C50 -96 -50 -96 -56 -110 Z" fill="${hair}"/>` : ''}</g>`;
}
function hallEstablish(t, dais) {
  // the dais world drawn small at the far end; tables of nobles (seen from behind) between us and it
  const R = rng(5); let rows = '';
  [[1240, .5], [1520, .78], [1900, 1.15]].forEach(([y, s], r) => {
    let b = '';
    for (let i = -1; i < 9; i++) { const x = -60 + i * 260 * s + (r % 2) * 120 * s + (R() - .5) * 30;
      b += backBust(x, y + 60 * s, s * 1.15, { cloth: CROWD_CLOTH[(i + r * 3 + 7) % 7], hair: ['#1e140e', '#3a2416', '#5a4a3a', '#2a1a10'][(i + r) & 3], bald: (i + r) % 5 === 0 }); }
    rows += `<g ${r === 2 ? 'filter="url(#dofLight)"' : ''}><path d="M-700 ${y - 30 * s} L1800 ${y - 30 * s} L1800 ${y + 30 * s} L-700 ${y + 30 * s} Z" fill="#ddd4c0" filter="url(#pcl)"/>
      ${Array.from({ length: 6 }, (_, i) => tableCandle(-40 + i * 230 + r * 60, y - 20 * s, t, s * .9, i + r * 7)).join('')}${b}</g>`;
  });
  return `<g transform="translate(250 330) scale(.54)">${dais}</g>
    <path d="M-700 1260 L1800 1260 L1800 2600 L-700 2600 Z" fill="#3e342c"/><rect x="-700" y="1260" width="2500" height="1340" filter="url(#stoneT2)" opacity=".5"/>
    ${[-500, -140, 1220, 1580].map((x, i) => `<path d="M${x} -700 L${x + (i < 2 ? -60 : 60)} 2600" stroke="#2a221c" stroke-width="${i % 3 === 0 ? 180 : 130}" filter="url(#pcl)"/>`).join('')}
    ${rows}`;
}

// ---------- the boy's cell: stone, a tiny window, the tally marks of three years, a straw cot ----------
function tallyWall(x0, y0, cols, rowsN, { reveal = 1, newMark = 0, s = 1 } = {}) {
  let d = '', n = 0; const R = rng(3), total = cols * rowsN;
  for (let r = 0; r < rowsN; r++) for (let c = 0; c < cols; c++) {
    if (n++ > total * reveal) break;
    const x = x0 + c * 64 * s + (R() - .5) * 8, y = y0 + r * 70 * s + (R() - .5) * 8;
    for (let k = 0; k < 4; k++) d += `M${F1(x + k * 10 * s)} ${F1(y)} l${F1((R() - .5) * 4)} ${F1(44 * s)} `;
    d += `M${F1(x - 6 * s)} ${F1(y + 34 * s)} l${F1(46 * s)} ${F1(-26 * s)} `;
  }
  return `<path d="${d}" stroke="#d8d0c0" stroke-width="${F1(3.2 * s)}" stroke-linecap="round" fill="none" opacity=".55"/><path d="${d}" stroke="#1a1612" stroke-width="${F1(1.6 * s)}" fill="none" opacity=".5" transform="translate(1.5 1.5)"/>`;
}
function cellRoom(t, { dawn = 0, blur = null, candle = 1 } = {}) {
  const inner = `${wallV(-500, -500, 1600, 2400, dawn ? ['#6a6e72', '#3a3c40'] : ['#5a5048', '#2a2420'], { course: 110, block: 200, jointOp: .5, tex2: .4 })}
    ${tallyWall(-150, 600, 9, 9, { s: 1 })}
    <path d="M760 430 L760 610 L920 610 L920 430 Q840 360 760 430 Z" fill="${dawn ? '#c8d0dc' : '#1a2440'}"/>
    ${dawn ? '' : `<circle cx="880" cy="470" r="2.5" fill="#fff" opacity=".8"/><circle cx="800" cy="520" r="2" fill="#fff" opacity=".7"/>`}
    <g stroke="#1a1612" stroke-width="10">${[800, 840, 880].map(x => `<path d="M${x} 400 L${x} 610"/>`).join('')}</g>
    <path d="M740 430 L740 630 L940 630 L940 430 Q840 340 740 430 Z" fill="none" stroke="#3a3430" stroke-width="22"/>
    ${dawn ? `<path d="M760 430 L920 430 L700 2400 L-300 2400 Z" fill="url(#dawnBeam)" opacity=".7" style="mix-blend-mode:screen" filter="url(#b8)"/>` : ''}
    <rect x="860" y="1080" width="200" height="22" fill="#4a3624" filter="url(#pcl)"/>
    ${candle ? candleStub(930, 1080, t, { lit: dawn ? 0 : 1 }) : ''}
    ${rectV(-500, 1640, 2100, 760, 'fill="#2e2620"')}`;
  return dofG(blur, inner);
}
function candleStub(x, y, t, { lit = 1 } = {}) {
  const sw = Math.sin(t * 9.3) * 2 * seamW(t);
  return `<g transform="translate(${x} ${y})"><path d="M-26 0 C-26 -8 26 -8 26 0 Z" fill="#6a5a4a" filter="url(#pcs)"/><path d="M-12 -4 L-11 -50 C-6 -56 6 -56 11 -50 L12 -4 Z" fill="#e6dcc0" filter="url(#pcs)"/>
    ${lit ? `<circle cx="0" cy="-70" r="120" fill="url(#candleGlow)" style="mix-blend-mode:screen"/><g transform="translate(${F1(sw * .4)} -56)"><path d="M0 -34 C${F1(7 + sw)} -18 9 -6 0 2 C-9 -6 ${F1(-7 + sw * .5)} -18 0 -34 Z" fill="url(#flameG)"/></g>`
      : `<path d="M0 -56 C-6 -90 10 -110 0 -150" stroke="#c8ccd4" stroke-width="5" fill="none" opacity=".25" filter="url(#b8)"/>`}</g>`;
}
// the straw cot (front layer: covers the boy's legs when he sits)
function cot(y = 1520) {
  return `<path d="M-200 ${y} C100 ${y - 30} 900 ${y - 30} 1300 ${y} L1300 ${y + 260} L-200 ${y + 260} Z" fill="#8a7650" filter="url(#pcl)"/>
    <path d="M-200 ${y + 30} C200 ${y + 10} 800 ${y + 10} 1300 ${y + 30}" stroke="#c8b07a" stroke-width="5" fill="none" opacity=".6"/>
    <path d="M-200 ${y + 60} C300 ${y + 20} 600 ${y + 80} 1300 ${y + 40} L1300 ${y + 260} L-200 ${y + 260} Z" fill="#5a4e66" filter="url(#pcl)"/>
    <g stroke="#3a3248" stroke-width="5" opacity=".5">${[0, 1, 2, 3].map(i => `<path d="M-200 ${y + 100 + i * 40} C300 ${y + 70 + i * 40} 700 ${y + 120 + i * 40} 1300 ${y + 90 + i * 40}" fill="none"/>`).join('')}</g>`;
}

// ---------- the floor beneath the high table: flagstones, the hem of the cloth, a cup that falls and rolls ----------
function floorLow(t, t0) {
  const vp = [540, 560]; let stones = '';
  for (let i = -12; i <= 12; i++) stones += `<path d="M${vp[0] + i * 40} ${vp[1] + 40} L${vp[0] + i * 420} 2200" stroke="#14100c" stroke-width="5" fill="none"/>`;
  for (const y of [700, 800, 930, 1110, 1360, 1720]) stones += `<path d="M-300 ${y} L1400 ${y}" stroke="#14100c" stroke-width="${F1(3 + (y - 600) / 160)}"/>`;
  // the cup: falls in at t0, bounces, rolls to the left and rocks to a stop; the wine spreads from where it lands
  const u = t - t0, land = .22, x = 780 - 380 * easeOut(clamp((u - land) / 1.5)), bounce = u < land ? -1100 * (1 - (u / land) ** 2) : -90 * Math.abs(Math.sin((u - land) * 9)) * Math.exp(-(u - land) * 5);
  const rot = u < land ? -40 + 60 * u / land : 20 + 300 * easeOut(clamp((u - land) / 1.5)) + 6 * Math.sin(u * 12) * Math.exp(-(u - land) * 2);
  const pool = clamp((u - land) / 1.4);
  return `<rect x="-300" y="-300" width="1700" height="2600" fill="#120e0a"/>
    <path d="M-300 600 L1400 600 L1400 2300 L-300 2300 Z" fill="#5e5246"/><rect x="-300" y="600" width="1700" height="1700" filter="url(#stoneT2)" opacity=".6"/>${stones}
    <rect x="-300" y="560" width="1700" height="200" fill="#000" opacity=".4" filter="url(#b24)"/>
    ${[200, 880].map(x => `<rect x="${x - 26}" y="-300" width="52" height="${vp[1] + 240}" fill="#2a1e14" filter="url(#pcl)"/>`).join('')}
    <path d="M-300 -300 L1400 -300 L1400 250 C1100 280 900 240 540 270 C200 240 0 280 -300 250 Z" fill="#cfc6b0" filter="url(#pcl)"/>
    <path d="M-300 200 C0 230 200 190 540 220 C900 190 1100 230 1400 200" stroke="#7e1c20" stroke-width="40" fill="none"/>
    ${pool > 0 ? `<path d="M${F1(760 - 40 * pool)} 1560 C${F1(700 - 300 * pool)} ${F1(1530 - 30 * pool)} ${F1(420 - 120 * pool)} ${F1(1560 - 20 * pool)} ${F1(400 - 200 * pool)} ${F1(1600 + 10 * pool)} C${F1(460 - 100 * pool)} ${F1(1640 + 40 * pool)} ${F1(720 + 60 * pool)} ${F1(1650 + 30 * pool)} ${F1(800 + 60 * pool)} ${F1(1600)} Z" fill="#5a0a16"/>
      <path d="M${F1(700 - 100 * pool)} 1570 C${F1(600 - 120 * pool)} 1566 ${F1(520 - 100 * pool)} 1574 ${F1(480 - 120 * pool)} 1586" stroke="#d86070" stroke-width="5" fill="none" opacity=".55"/>` : ''}
    ${u > -0.05 ? `<ellipse cx="${F1(x)}" cy="1600" rx="${F1(130 - Math.min(80, -bounce * .1))}" ry="24" fill="#000" opacity=".45" filter="url(#b18)"/><g transform="translate(${F1(x)} ${F1(1520 + bounce)}) rotate(${F1(rot)})">${pewterCup(0, -80, 2.4, { wine: u < land ? .7 : 0 })}</g>` : ''}`;
}

// ---------- the gallows at dawn (cold) ----------
function gallowsDawn(t) {
  const sw = Math.sin(t * 1.6) * 4 * seamW(t);
  const birds = [0, 1].map(i => { const p = ((t * .12 + i * .45) % 1), x = -100 + 1300 * p, y = 420 - 120 * p + i * 90, f = Math.sin(t * 9 + i * 2) * 14;
    return `<path d="M${F1(x - 26)} ${F1(y - f)} Q${F1(x - 12)} ${F1(y - 6)} ${F1(x)} ${F1(y)} Q${F1(x + 12)} ${F1(y - 6)} ${F1(x + 26)} ${F1(y - f)}" stroke="#1a1c22" stroke-width="5" fill="none"/>`; }).join('');
  return `<rect x="-300" y="-300" width="1700" height="2600" fill="url(#dawnSky)"/>
    <circle cx="300" cy="1200" r="420" fill="#eae4d8" opacity=".35" filter="url(#b40)"/>
    <path d="M-300 1260 L-300 980 L-160 980 L-160 940 L-100 940 L-100 980 L60 980 L60 940 L120 940 L120 980 L300 980 L300 900 L420 900 L420 980 L1400 980 L1400 1260 Z" fill="#3a3e48"/>
    <path d="M-300 1300 L1400 1300 L1400 2400 L-300 2400 Z" fill="#4a4c50"/><rect x="-300" y="1300" width="1700" height="1100" filter="url(#stoneT2)" opacity=".4"/>
    <g filter="url(#pcl)" fill="#3a2e24"><rect x="250" y="520" width="56" height="1500"/><rect x="250" y="500" width="560" height="50"/><path d="M306 700 L306 760 L470 550 L410 550 Z"/></g>
    <rect x="200" y="2000" width="660" height="60" fill="#2a221c" filter="url(#pcl)"/>
    <g transform="rotate(${F1(sw)} 700 550)"><path d="M700 550 L700 900" stroke="#8a7a5a" stroke-width="7"/>
      <path d="M700 900 C640 910 630 1020 700 1040 C770 1020 760 910 700 900 Z" fill="none" stroke="#8a7a5a" stroke-width="8"/>
      <path d="M690 890 L710 890 L712 930 L688 930 Z" fill="#7a6a4a"/></g>
    ${birds}
    <rect x="-300" y="1500" width="1700" height="400" fill="#dcdce0" opacity=".3" filter="url(#b40)"/>`;
}

// ---------- inside the goblet: the wine, and the pale oily film of the poison turning on it ----------
function wineMacro(t, t0) {
  const u = t - t0, R = rng(21); let film = '', flecks = '';
  for (let i = 0; i < 5; i++) { const a0 = i * 1.26 + u * .9; let d = '';
    for (let j = 0; j <= 40; j++) { const a = a0 + j * .11, r = 80 + j * 9 + i * 14; d += `${j ? 'L' : 'M'}${F1(540 + Math.cos(a) * r * 1.0)} ${F1(960 + Math.sin(a) * r * .62)}`; }
    film += `<path d="${d}" stroke="#e8dcc0" stroke-width="${F1(6 + 4 * R())}" fill="none" opacity="${(.22 + .1 * R()).toFixed(2)}" stroke-linecap="round"/>`; }
  for (let i = 0; i < 26; i++) { const a = R() * 6.28 + u * (.6 + R() * .5), r = 60 + R() * 380; flecks += `<path d="M${F1(540 + Math.cos(a) * r)} ${F1(960 + Math.sin(a) * r * .62)} l${F1(6 + R() * 8)} ${F1(-3 + R() * 6)} l${F1(-4 - R() * 6)} ${F1(5 + R() * 4)} Z" fill="#efe2c4" opacity=".75"/>`; }
  return `<rect x="-300" y="-300" width="1700" height="2600" fill="#1a1006"/>
    <ellipse cx="540" cy="960" rx="700" ry="500" fill="url(#goldG2)" filter="url(#pcl)"/>
    <ellipse cx="540" cy="960" rx="610" ry="420" fill="#6a4614"/>
    <ellipse cx="540" cy="968" rx="590" ry="400" fill="url(#wineSurf)"/>
    <g filter="url(#b3)">${film}</g>${flecks}
    <ellipse cx="${F1(400 + 10 * Math.sin(u * 2))}" cy="760" rx="120" ry="34" fill="#fff4dc" opacity=".55" filter="url(#b8)"/>
    <ellipse cx="400" cy="760" rx="40" ry="10" fill="#fff" opacity=".7"/>
    <path d="M-160 960 A700 500 0 0 1 1240 960" stroke="#fff2c0" stroke-width="10" fill="none" opacity=".35"/>`;
}
