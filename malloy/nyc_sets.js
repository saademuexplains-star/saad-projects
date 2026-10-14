// nyc_sets.js — sets and props for "The Man Who Wouldn't Die" (the Bronx, winter 1932–33).
// World units ≈ screen pixels at zoom 1. Pure functions of time. Background pieces carry no piece filter (they take the
// flat background light); props, furniture and anything that covers a figure carry a pc filter so the relight shapes
// them and the figure's normals never show through.

// ======================= sky, snow =======================
// the loop frame: a winter night sky over the Bronx — deep blue overhead, a warm city glow low down, a few stars, the moon
function nightSky({ y0 = -2700, y1 = 760, glow = '#4a4050', day = 0 } = {}) {
  const id = fid('ns');
  const stops = day ? ['#6a7a8c', '#8e9aa6', '#aeb4b8', '#c4c4c0'] : ['#070b18', '#111a30', '#24283e', glow];
  let st = '';
  if (!day) { const R = rng(77); for (let i = 0; i < 70; i++) { const x = -300 + R() * 1700, y = y0 + 80 + R() * (y1 - y0) * .62, r = .8 + R() * 1.6;
    st += `<circle cx="${F1(x)}" cy="${F1(y)}" r="${F1(r)}" fill="#f4f0e4" opacity="${F1(.35 + R() * .5)}"/>`; } }
  return `<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="${y0}" x2="0" y2="${y1}">
      ${stops.map((c, i) => `<stop offset="${[0, .45, .8, 1][i]}" stop-color="${c}"/>`).join('')}</linearGradient></defs>
    <rect x="-1400" y="${y0}" width="3880" height="${y1 - y0}" fill="url(#${id})"/>${st}
    ${day ? '' : `<g filter="url(#pe16)"><circle cx="820" cy="${F1(y0 + 900)}" r="120" fill="#c8d0e0" opacity=".22"/></g>
    <g filter="url(#pe2)"><circle cx="820" cy="${F1(y0 + 900)}" r="46" fill="#f2efe4"/></g>
    <circle cx="806" cy="${F1(y0 + 890)}" r="9" fill="#cfcabc" opacity=".6"/><circle cx="834" cy="${F1(y0 + 912)}" r="6" fill="#cfcabc" opacity=".5"/>`}`;
}
// falling snow: three depths (far small and slow, near large, soft and fast). ts = time (pass t − DUR at the end of the
// film so the last frame repeats the first)
function snowFall(ts, { area = [-300, -2700, 1700, 2500], n = 160, seed = 5, wind = 30, op = 1, near = 1 } = {}) {
  const [x0, y0, x1, y1] = area, H = y1 - y0, R = rng(seed); let far = '', mid = '', nr = '';
  for (let i = 0; i < n; i++) {
    const layer = i % 10 < 5 ? 0 : i % 10 < 9 ? 1 : 2, sp = [70, 130, 260][layer], r = [2, 3.6, 9][layer] * (.7 + R() * .6);
    const bx = x0 + R() * (x1 - x0), by = R() * H, ph = R() * 6.28;
    const y = y0 + ((by + ts * sp) % H + H) % H, x = bx + Math.sin(ts * .8 + ph) * 18 + ((ts * wind * (layer + 1) * .4) % (x1 - x0));
    const c = `<circle cx="${F1(((x - x0) % (x1 - x0) + (x1 - x0)) % (x1 - x0) + x0)}" cy="${F1(y)}" r="${F1(r)}"/>`;
    if (layer === 0) far += c; else if (layer === 1) mid += c; else nr += c;
  }
  return `<g fill="#e8eef6" opacity="${F1(.55 * op)}">${far}</g><g fill="#f2f6fa" opacity="${F1(.75 * op)}" filter="url(#b2)">${mid}</g>
    ${near ? `<g fill="#f6f8fc" opacity="${F1(.55 * op)}" filter="url(#b5)">${nr}</g>` : ''}`;
}

// ======================= the Bronx street (frontal) =======================
// brick: a soft course pattern over a fill colour
function brickFill(x, y, w, h, col, { seed = 1, course = 15 } = {}) {
  const R = rng(seed); let d = '', dk = '';
  for (let yy = y + course; yy < y + h; yy += course) d += `M${F1(x)} ${F1(yy)} L${F1(x + w)} ${F1(yy)} `;
  for (let i = 0; i < w * h / 2600; i++) { const bx = x + R() * w, by = y + Math.floor(R() * h / course) * course; dk += `<rect x="${F1(bx)}" y="${F1(by + 1)}" width="34" height="${course - 2}" opacity="${F1(.1 + R() * .2)}"/>`; }
  return `<rect x="${F1(x)}" y="${F1(y)}" width="${F1(w)}" height="${F1(h)}" fill="${col}"/>
    <g fill="${darken(col, .35)}">${dk}</g><path d="${d}" stroke="${darken(col, .4)}" stroke-width="1.6" opacity=".35"/>`;
}
// a double-hung sash window with a stone lintel and sill; lit = 0..1 (warm lamplight behind a half-drawn shade);
// snow on the sill
function sash(x, y, w, h, { lit = 0, seed = 1, shade = .4, day = 0, snow = 1 } = {}) {
  const R = rng(seed), glass = day ? mix('#6a7884', '#9aa6b0', R()) : lit ? '#e6a85a' : mix('#141a26', '#20283a', R());
  const sh = shade * h * (.6 + R() * .6);
  return `<rect x="${F1(x - 10)}" y="${F1(y - 22)}" width="${F1(w + 20)}" height="20" fill="#9a9488"/>
    <rect x="${F1(x)}" y="${F1(y)}" width="${F1(w)}" height="${F1(h)}" fill="#2a2420"/>
    ${lit && !day ? `<g filter="url(#pe2)"><rect x="${F1(x + 6)}" y="${F1(y + 6)}" width="${F1(w - 12)}" height="${F1(h - 12)}" fill="${glass}" opacity="${F1(.55 + .45 * lit)}"/></g>`
      : `<rect x="${F1(x + 6)}" y="${F1(y + 6)}" width="${F1(w - 12)}" height="${F1(h - 12)}" fill="${glass}"/><path d="M${F1(x + 10)} ${F1(y + h - 14)} L${F1(x + w - 14)} ${F1(y + 12)}" stroke="#fff" stroke-width="6" opacity=".07"/>`}
    <rect x="${F1(x + 6)}" y="${F1(y + 6)}" width="${F1(w - 12)}" height="${F1(sh)}" fill="${lit && !day ? '#b8783e' : '#3a3630'}" opacity="${lit && !day ? .8 : .85}"/>
    <rect x="${F1(x)}" y="${F1(y + h / 2 - 4)}" width="${F1(w)}" height="8" fill="#2a2420"/><rect x="${F1(x + w / 2 - 3)}" y="${F1(y)}" width="6" height="${F1(h)}" fill="#2a2420" opacity=".8"/>
    <rect x="${F1(x - 8)}" y="${F1(y + h)}" width="${F1(w + 16)}" height="14" fill="#8a8478"/>
    ${snow ? `<path d="M${F1(x - 9)} ${F1(y + h + 1)} q${F1((w + 18) / 2)} -10 ${F1(w + 18)} 0 Z M${F1(x - 11)} ${F1(y - 21)} q${F1((w + 22) / 2)} -9 ${F1(w + 22)} 0 Z" fill="#e8eef4"/>` : ''}`;
}
// a fire escape: a platform and railing at each floor, ladders zig-zagging between them (black iron, snow on the slats)
function fireEscape(x0, x1, floors, { snow = 1 } = {}) {
  let s = '';
  floors.forEach((y, i) => {
    s += `<rect x="${x0}" y="${y}" width="${x1 - x0}" height="10" fill="#141416"/>`;
    s += `<path d="M${x0} ${y} L${x0} ${y - 70} L${x1} ${y - 70} L${x1} ${y} M${x0} ${y - 36} L${x1} ${y - 36}" stroke="#141416" stroke-width="4" fill="none"/>`;
    for (let x = x0 + 18; x < x1; x += 18) s += `<path d="M${x} ${y} L${x} ${y - 70}" stroke="#141416" stroke-width="1.6"/>`;
    if (snow) s += `<path d="M${x0 - 2} ${y + 1} q${(x1 - x0) / 2} -9 ${x1 - x0 + 4} 0 Z M${x0 - 2} ${y - 69} L${x1 + 2} ${y - 69} L${x1 + 2} ${y - 73} L${x0 - 2} ${y - 73} Z" fill="#e2e8f0"/>`;
    if (i < floors.length - 1) { const yn = floors[i + 1], a = i % 2 ? x0 + 30 : x1 - 120, b = i % 2 ? x0 + 120 : x1 - 30;
      s += `<path d="M${a} ${y} L${b} ${yn} M${a + 22} ${y} L${b + 22} ${yn}" stroke="#141416" stroke-width="4"/>`;
      for (let k = 1; k < 8; k++) { const p = k / 8; s += `<path d="M${F1(lerp(a, b, p))} ${F1(lerp(y, yn, p))} l22 0" stroke="#141416" stroke-width="2.4"/>`; } }
  });
  return s;
}
// a tenement: brick, a cornice, rows of sash windows (some lit), optional fire escape; (x0..x1) wide, roof at yTop,
// ground-floor ceiling at yG (the ground floor itself is drawn by the caller)
function tenement(x0, x1, yTop, yG, { seed = 1, brick = '#6a3e30', floorH = 250, cols = null, litP = .35, escape = null, day = 0 } = {}) {
  const R = rng(seed), w = x1 - x0; let s = brickFill(x0, yTop, w, yG - yTop, brick, { seed });
  s += `<rect x="${x0 - 14}" y="${yTop - 34}" width="${w + 28}" height="34" fill="${darken(brick, .25)}"/><rect x="${x0 - 22}" y="${yTop - 50}" width="${w + 44}" height="18" fill="#8a8274"/>`;
  for (let x = x0; x < x1; x += 22) s += `<rect x="${x}" y="${yTop - 32}" width="10" height="12" fill="#7a7266"/>`;
  s += `<path d="M${x0 - 22} ${yTop - 51} L${x1 + 22} ${yTop - 51} L${x1 + 22} ${yTop - 58} L${x0 - 22} ${yTop - 58} Z" fill="#e6ecf2"/>`;
  s += `<rect x="${x0}" y="${yG - 18}" width="${w}" height="18" fill="#8a8274"/>`;
  const cs = cols || Array.from({ length: Math.floor(w / 150) }, (_, i) => x0 + 45 + i * 150);
  for (let y = yTop + 40; y + floorH - 40 <= yG; y += floorH) cs.forEach((cx, i) => {
    s += sash(cx, y, 72, 140, { lit: R() < litP ? .6 + R() * .4 : 0, seed: seed * 31 + i * 7 + y, day });
  });
  if (escape) s += fireEscape(escape[0], escape[1], Array.from({ length: Math.floor((yG - yTop) / floorH) }, (_, i) => yTop + 40 + 150 + i * floorH).filter(y => y < yG - 30), {});
  return s;
}
// the far skyline: rooftops, water towers, chimneys, and Manhattan's towers faint in the haze far off (no detail)
function farRoofs(y, { day = 0 } = {}) {
  const R = rng(19), col = day ? '#8a8e94' : '#1a1c28', col2 = day ? '#a4a8ac' : '#262838'; let s = '', d = `M-1400 ${y + 200}`;
  for (let x = -1400; x < 2500; x += 120 + R() * 160) { const h = 60 + R() * 220; d += ` L${F1(x)} ${F1(y - h)} L${F1(x + 110 + R() * 90)} ${F1(y - h)}`; }
  d += ` L2500 ${y + 200} Z`;
  s += `<path d="M-1400 ${y + 200} L-1400 ${y - 60} L700 ${y - 80} L720 ${y - 520} L736 ${y - 560} L752 ${y - 640} L760 ${y - 720} L768 ${y - 640} L784 ${y - 560} L800 ${y - 520} L820 ${y - 80} L1040 ${y - 70} L1060 ${y - 360} L1076 ${y - 420} L1084 ${y - 500} L1092 ${y - 420} L1108 ${y - 360} L1128 ${y - 70} L2500 ${y - 60} L2500 ${y + 200} Z" fill="${col2}" opacity=".7"/>`;
  s += `<path d="${d}" fill="${col}"/>`;
  [[-200, y - 210], [420, y - 160], [1300, y - 230]].forEach(([x, yy]) => {
    s += `<g fill="${col}"><path d="M${x - 40} ${yy} L${x - 40} ${yy - 70} Q${x} ${yy - 110} ${x + 40} ${yy - 70} L${x + 40} ${yy} Z"/><path d="M${x - 36} ${yy} L${x - 44} ${yy + 60} M${x + 36} ${yy} L${x + 44} ${yy + 60}" stroke="${col}" stroke-width="6"/></g>`; });
  if (!day) { for (let i = 0; i < 26; i++) s += `<rect x="${F1(-300 + R() * 1700)}" y="${F1(y - 40 - R() * 140)}" width="8" height="10" fill="#e0a860" opacity="${F1(.4 + R() * .4)}"/>`; }
  return s;
}
// the elevated railway: a lattice girder deck across the frame, rails on top, columns down into the street; a train
// (wooden-bodied cars, lit windows) crosses when trainX is given
function elDeck(y, { trainX = null, cols = [100, 1020], baseY = 1720, snow = 1, day = 0 } = {}) {
  const steel = day ? '#3a3a3c' : '#16171c'; let s = '';
  if (trainX != null) { for (let c = 0; c < 4; c++) { const x = trainX + c * 760;
    s += `<g filter="url(#pcl)"><path d="M${x} ${y - 4} L${x} ${y - 150} Q${x} ${y - 172} ${x + 22} ${y - 172} L${x + 718} ${y - 172} Q${x + 740} ${y - 172} ${x + 740} ${y - 150} L${x + 740} ${y - 4} Z" fill="${day ? '#5a3a2a' : '#3a2620'}"/></g>
      <rect x="${x - 4}" y="${y - 180}" width="748" height="12" fill="#2a2222"/>`;
    for (let k = 0; k < 9; k++) s += day ? `<rect x="${x + 30 + k * 78}" y="${y - 140}" width="54" height="56" fill="#6a7480"/>` : `<g filter="url(#pe2)"><rect x="${x + 30 + k * 78}" y="${y - 140}" width="54" height="56" fill="#f0c070"/></g>`; } }
  s += `<g filter="url(#pc)"><rect x="-1400" y="${y}" width="3880" height="86" fill="${steel}"/></g>`;
  let lat = ''; for (let x = -1400; x < 2500; x += 60) lat += `M${x} ${y + 10} L${x + 30} ${y + 76} L${x + 60} ${y + 10} `;
  s += `<path d="${lat}" stroke="${day ? '#5a5a5c' : '#2a2c34'}" stroke-width="5" fill="none"/><rect x="-1400" y="${y - 10}" width="3880" height="12" fill="${steel}"/>`;
  if (snow) s += `<rect x="-1400" y="${y - 16}" width="3880" height="7" fill="#dfe6ee"/>`;
  cols.forEach(cx => { s += `<g filter="url(#pc)"><rect x="${cx - 22}" y="${y + 86}" width="44" height="${baseY - y - 86}" fill="${steel}"/>
      <path d="M${cx - 22} ${y + 86} L${cx - 150} ${y + 86} L${cx - 22} ${y + 220} Z M${cx + 22} ${y + 86} L${cx + 150} ${y + 86} L${cx + 22} ${y + 220} Z" fill="${steel}"/></g>
      <path d="M${cx - 6} ${y + 100} L${cx - 6} ${baseY}" stroke="#4a4c56" stroke-width="3" opacity=".5"/>`; });
  return s;
}
// a cast-iron street lamp with a glowing globe; (x, y) = base
function streetLamp(x, y, { on = 1, h = 600, snow = 1 } = {}) {
  return `<g filter="url(#pcs)"><rect x="${x - 9}" y="${y - h}" width="18" height="${h}" fill="#141418"/><path d="M${x - 26} ${y} L${x + 26} ${y} L${x + 16} ${y - 60} L${x - 16} ${y - 60} Z" fill="#141418"/>
    <path d="M${x - 22} ${y - h} L${x + 22} ${y - h} L${x + 14} ${y - h - 20} L${x - 14} ${y - h - 20} Z" fill="#141418"/></g>
    ${on ? `<g filter="url(#pe32)"><circle cx="${x}" cy="${y - h - 56}" r="70" fill="#ffd8a0" opacity=".45"/></g><g filter="url(#pe2)"><circle cx="${x}" cy="${y - h - 56}" r="36" fill="#fff0d0"/></g>`
      : `<circle cx="${x}" cy="${y - h - 56}" r="36" fill="#c8ccd0"/>`}
    <path d="M${x - 20} ${y - h - 90} L${x + 20} ${y - h - 90} L${x + 8} ${y - h - 104} L${x - 8} ${y - h - 104} Z" fill="#141418"/>
    ${snow ? `<ellipse cx="${x}" cy="${y - h - 104}" rx="14" ry="5" fill="#e8eef4"/>` : ''}`;
}
// the speakeasy front: dark green boards, a door with a little barred peephole that glows, curtained windows lit
// warm from inside, a lamp over the door, a step with snow
function speakeasyFront(x0, x1, yT, yB, t, { day = 0, glow = 1, door = 0 } = {}) {
  const mid = (x0 + x1) / 2, dw = 140, wood = '#24342c', warm = '#e8a858';
  const win = (a, b) => `<rect x="${a}" y="${yT + 70}" width="${b - a}" height="${yB - yT - 170}" fill="#1a1410"/>
    ${day ? `<rect x="${a + 8}" y="${yT + 78}" width="${b - a - 16}" height="${yB - yT - 186}" fill="#4a4a4c"/>` : `<g filter="url(#pe4)"><rect x="${a + 8}" y="${yT + 78}" width="${b - a - 16}" height="${yB - yT - 186}" fill="${warm}" opacity="${F1(.8 * glow)}"/></g>`}
    <path d="M${a + 8} ${yT + 78} Q${a + (b - a) * .3} ${yT + 160} ${a + 14} ${yB - 108} L${a + 8} ${yB - 108} Z M${b - 8} ${yT + 78} Q${b - (b - a) * .3} ${yT + 160} ${b - 14} ${yB - 108} L${b - 8} ${yB - 108} Z" fill="#6a2a24" opacity=".9"/>
    <rect x="${a + 8}" y="${yT + 78}" width="${b - a - 16}" height="22" fill="#5a2420"/>
    <rect x="${a - 6}" y="${yB - 104}" width="${b - a + 12}" height="14" fill="#1a2420"/><path d="M${a - 8} ${yB - 104} q${(b - a + 16) / 2} -10 ${b - a + 16} 0 Z" fill="#e8eef4"/>`;
  return `<g filter="url(#pc)"><rect x="${x0}" y="${yT}" width="${x1 - x0}" height="${yB - yT}" fill="${wood}"/></g>
    <rect x="${x0}" y="${yT}" width="${x1 - x0}" height="40" fill="#1a2620"/><rect x="${x0}" y="${yT + 40}" width="${x1 - x0}" height="6" fill="#4a5a4e" opacity=".6"/>
    ${win(x0 + 40, mid - dw / 2 - 40)}${win(mid + dw / 2 + 40, x1 - 40)}
    <rect x="${mid - dw / 2 - 12}" y="${yT + 60}" width="${dw + 24}" height="${yB - yT - 60}" fill="#141c18"/>
    ${door > 0 ? `<g filter="url(#pe4)"><rect x="${mid - dw / 2}" y="${yT + 70}" width="${dw}" height="${yB - yT - 70}" fill="${warm}" opacity=".8"/></g>` : ''}
    <g filter="url(#pcs)"><rect x="${F1(mid - dw / 2)}" y="${yT + 70}" width="${F1(dw * (1 - .8 * door))}" height="${yB - yT - 70}" fill="#3a2a1e"/></g>
    <rect x="${mid - dw / 2 + 18}" y="${yT + 100}" width="${F1((dw - 36) * (1 - .8 * door))}" height="${F1((yB - yT) * .3)}" fill="#2a1e14" opacity=".8"/>
    ${door < .2 ? `<rect x="${mid - 22}" y="${yT + 120}" width="44" height="30" fill="#1a1410"/>${day ? '' : `<g filter="url(#pe2)"><rect x="${mid - 18}" y="${yT + 124}" width="36" height="22" fill="${warm}" opacity="${F1(.9 * glow)}"/></g>`}
      <path d="M${mid - 8} ${yT + 120} L${mid - 8} ${yT + 150} M${mid + 8} ${yT + 120} L${mid + 8} ${yT + 150}" stroke="#141010" stroke-width="3"/>
      <circle cx="${mid + dw / 2 - 22}" cy="${yT + (yB - yT) * .58}" r="6" fill="url(#brassG)"/>` : ''}
    <path d="M${mid - 40} ${yT + 30} L${mid + 40} ${yT + 30} L${mid + 26} ${yT + 4} L${mid - 26} ${yT + 4} Z" fill="#141418"/>
    ${day ? '' : `<g filter="url(#pe16)"><ellipse cx="${mid}" cy="${yT + 40}" rx="60" ry="30" fill="#ffc888" opacity=".55"/></g><g filter="url(#pe2)"><ellipse cx="${mid}" cy="${yT + 34}" rx="16" ry="9" fill="#fff0d0"/></g>`}
    <g filter="url(#pc)"><rect x="${mid - dw / 2 - 40}" y="${yB}" width="${dw + 80}" height="22" fill="#5a5650"/></g><path d="M${mid - dw / 2 - 44} ${yB + 1} q${(dw + 88) / 2} -12 ${dw + 88} 0 Z" fill="#e6ecf2"/>`;
}
// the street in snow: the sidewalk (footprints), the curb with ploughed-up snow banks, the road with slushy tyre tracks
function snowStreet(yS, { day = 0, x0 = -1400, x1 = 2500, tracks = 1 } = {}) {
  const R = rng(41); let fp = '', tr = '';
  for (let i = 0; i < 40; i++) { const x = x0 + R() * (x1 - x0), y = yS + 14 + R() * 60; fp += `<ellipse cx="${F1(x)}" cy="${F1(y)}" rx="9" ry="4" fill="#9aa4b4" opacity=".5"/>`; }
  if (tracks) [yS + 210, yS + 250, yS + 470, yS + 520].forEach((y, i) => { tr += `<path d="M${x0} ${y} C400 ${y + 8} 800 ${y - 6} ${x1} ${y + 4}" stroke="${day ? '#6a6660' : '#3a3c48'}" stroke-width="${18 + i * 6}" fill="none" opacity=".55"/>`; });
  const snowC = day ? '#d8dee4' : '#9ea8bc', road = day ? '#bcc2c8' : '#6e7688';
  return `<rect x="${x0}" y="${yS}" width="${x1 - x0}" height="90" fill="${snowC}"/>${fp}
    <rect x="${x0}" y="${yS + 90}" width="${x1 - x0}" height="22" fill="#5a5a5e"/>
    <rect x="${x0}" y="${yS + 112}" width="${x1 - x0}" height="1400" fill="${road}"/>${tr}
    <g filter="url(#b3)"><path d="M${x0} ${yS + 118} ${(() => { let d = '', x = x0; while (x < x1) { const w = 90 + R() * 260, h = 14 + R() * 40; d += `C${F1(x + w * .2)} ${F1(yS + 112 - h)} ${F1(x + w * .8)} ${F1(yS + 112 - h * (.6 + R() * .5))} ${F1(x + w)} ${F1(yS + 112 - R() * 8)} `; x += w; } return d; })()} L${x1} ${yS + 126} L${x0} ${yS + 126} Z" fill="${lighten(snowC, .12)}"/></g>
    <path d="M${x0} ${yS + 2} L${x1} ${yS + 2}" stroke="#fff" stroke-width="3" opacity=".25"/>`;
}
// the whole street outside the speakeasy (frontal): sky, far roofs, the tenement over the speakeasy, the El crossing in
// front, a lamp, the snowy street. o.trainX: a train on the El; o.day: grey daylight; o.ts: snow time
function bronxStreet(t, C, { trainX = null, day = 0, ts = t, door = 0, snowK = 1, glow = 1 } = {}) {
  return `${nightSky({ y0: -2700, y1: 760, day })}
    ${par(C, .35, `<g transform="translate(0 0)">${farRoofs(560, { day })}</g>`, [540, 1150])}
    ${tenement(-420, 300, 120, 1190, { seed: 3, brick: day ? '#7a5446' : '#4a3028', escape: null, cols: [-340, -190, -40, 110], day, litP: .4 })}
    ${tenement(300, 1500, 60, 1190, { seed: 5, brick: day ? '#8a5a44' : '#58362a', escape: [930, 1130], cols: [360, 510, 660, 810, 1190, 1340], day, litP: .35 })}
    <g filter="url(#pc)"><rect x="-420" y="1190" width="2000" height="20" fill="#3a3430"/></g>
    <rect x="-420" y="1210" width="560" height="300" fill="${day ? '#4a4440' : '#201c1c'}"/>${Array.from({ length: 14 }, (_, i) => `<rect x="${-410 + i * 40}" y="1220" width="20" height="280" fill="#141212" opacity=".7"/>`).join('')}
    <rect x="980" y="1210" width="520" height="300" fill="${day ? '#5a4a40' : '#241e1a'}"/><rect x="1060" y="1250" width="120" height="260" fill="#120e0c"/>
    ${speakeasyFront(160, 940, 1210, 1500, t, { day, glow, door })}
    ${snowStreet(1500, { day })}
    ${elDeck(470, { trainX, day })}
    ${streetLamp(860, 1640, { on: day ? 0 : 1 })}
    ${snowK > 0 ? snowFall(ts, { op: snowK * (day ? .8 : 1) }) : ''}`;
}

// ======================= a 1930s taxi =======================
// side view, facing screen-left; (x, y) = ground under the middle; s = scale (length ≈ 900 s). Two-tone: a pale
// mustard body, black wings and roof, a checker band, the roof light. win: what to show through the driver's window
// (a figure drawn by the caller BEFORE the taxi shows through the opening)
function taxiSide(x, y, s = 1, { roll = 0, lights = 1, day = 0 } = {}) {
  const body = '#cfae4c', blk = '#18171a', wheel = (cx) => { const a = roll / 52 * 180 / Math.PI;
    return `<g filter="url(#pcs)"><circle cx="${cx}" cy="-62" r="62" fill="#141414"/></g><circle cx="${cx}" cy="-62" r="34" fill="#c8c4b8"/><circle cx="${cx}" cy="-62" r="12" fill="#5a5a5a"/>
      <g transform="rotate(${F1(a)} ${cx} -62)" stroke="#5a5650" stroke-width="5">${[0, 60, 120].map(r => `<path d="M${cx - 30} -62 L${cx + 30} -62" transform="rotate(${r} ${cx} -62)"/>`).join('')}</g>`; };
  const chk = Array.from({ length: 30 }, (_, i) => `<rect x="${-150 + i * 14}" y="${-232 + (i % 2) * 8}" width="14" height="8" fill="#141414"/>`).join('');
  return `<g transform="translate(${F1(x)} ${F1(y)}) scale(${s})">
    <ellipse cx="0" cy="0" rx="470" ry="22" fill="#000" opacity=".35" filter="url(#b10)"/>
    <g filter="url(#pcl)"><path fill-rule="evenodd" d="M-440 -110 L-440 -200 Q-436 -232 -400 -236 L-190 -246 L-150 -380 Q-140 -404 -110 -404 L230 -404 Q262 -404 272 -380 L320 -248 L400 -232 Q440 -222 444 -180 L444 -110 Z
        M-128 -374 L-30 -374 L-30 -262 L-162 -262 Z M-10 -374 L130 -374 L130 -262 L-10 -262 Z M150 -374 L236 -374 Q248 -374 254 -362 L290 -262 L150 -262 Z" fill="${body}"/></g>
    <g filter="url(#pcl)"><path d="M-160 -396 Q-150 -414 -110 -414 L232 -414 Q270 -414 282 -390 L272 -376 L-148 -378 Z" fill="${blk}"/></g>
    <rect x="10" y="-440" width="60" height="26" rx="6" fill="${blk}"/>${lights && !day ? `<g filter="url(#pe2)"><rect x="16" y="-436" width="48" height="16" rx="4" fill="#ffe2a0"/></g>` : `<rect x="16" y="-436" width="48" height="16" rx="4" fill="#d8c890"/>`}
    <path d="M-160 -240 L330 -240" stroke="#8a7230" stroke-width="3"/>${chk}
    <path d="M-30 -374 L-30 -130 M140 -374 L140 -130" stroke="#8a7230" stroke-width="4"/><rect x="-60" y="-210" width="26" height="8" rx="3" fill="url(#brassG)"/><rect x="104" y="-210" width="26" height="8" rx="3" fill="url(#brassG)"/>
    <g filter="url(#pcl)"><path d="M-460 -60 Q-460 -170 -350 -176 Q-250 -170 -236 -60 L-210 -60 L-210 -40 L-470 -40 Z M240 -60 Q250 -170 350 -176 Q460 -170 466 -60 L466 -40 L230 -40 Z" fill="${blk}"/>
      <rect x="-236" y="-70" width="476" height="22" fill="${blk}"/></g>
    ${wheel(-350)}${wheel(352)}
    <g filter="url(#pcs)"><rect x="-486" y="-120" width="40" height="26" rx="8" fill="#b8b4a8"/><rect x="452" y="-120" width="34" height="24" rx="8" fill="#b8b4a8"/></g>
    <g filter="url(#pcs)"><path d="M-430 -214 Q-470 -214 -472 -190 Q-470 -166 -430 -166 Z" fill="${blk}"/></g>
    ${lights && !day ? `<g filter="url(#pe8)"><ellipse cx="-470" cy="-190" rx="18" ry="22" fill="#fff4d8"/></g>` : `<ellipse cx="-466" cy="-190" rx="10" ry="18" fill="#d8d4c8"/>`}
    <path d="M-420 -150 L-260 -150" stroke="#fff" stroke-width="5" opacity=".12"/><path d="M-120 -330 L-40 -300" stroke="#fff" stroke-width="4" opacity=".25"/></g>`;
}
// the same taxi head-on, rushing at the camera: wings, upright grille, two big headlamps that flare; (x, y) = ground,
// s = scale (width ≈ 760 s); glare 0..1
function taxiFront(x, y, s = 1, { glare = 0 } = {}) {
  const body = '#cfae4c', blk = '#18171a';
  return `<g transform="translate(${F1(x)} ${F1(y)}) scale(${F1(s)})">
    <ellipse cx="0" cy="0" rx="420" ry="30" fill="#000" opacity=".4" filter="url(#b10)"/>
    <g filter="url(#pcl)"><path d="M-250 -260 L-220 -520 Q-210 -548 -180 -548 L180 -548 Q210 -548 220 -520 L250 -260 Z" fill="${body}"/>
      <path d="M-200 -500 L200 -500 L222 -330 L-222 -330 Z" fill="#1e2430"/>
      <path d="M-380 -40 Q-390 -200 -280 -230 L-150 -240 L-150 -40 Z M380 -40 Q390 -200 280 -230 L150 -240 L150 -40 Z" fill="${blk}"/>
      <path d="M-120 -320 L120 -320 L110 -60 L-110 -60 Z" fill="#b8b2a4"/></g>
    ${Array.from({ length: 9 }, (_, i) => `<path d="M${-96 + i * 24} -310 L${-92 + i * 23} -68" stroke="#4a4840" stroke-width="5"/>`).join('')}
    <rect x="-400" y="-70" width="800" height="34" rx="12" fill="#c8c4b8"/>
    <rect x="-36" y="-570" width="72" height="24" rx="6" fill="${blk}"/>
    <g filter="url(#pcs)"><circle cx="-250" cy="-280" r="66" fill="${blk}"/><circle cx="250" cy="-280" r="66" fill="${blk}"/></g>
    <g filter="url(#pe8)"><circle cx="-250" cy="-280" r="54" fill="#fff6dc"/><circle cx="250" cy="-280" r="54" fill="#fff6dc"/></g>
    <g filter="url(#pe32)"><circle cx="-250" cy="-280" r="${F1(120 + 600 * glare)}" fill="#fff4d8" opacity="${F1(.5 + .5 * glare)}"/><circle cx="250" cy="-280" r="${F1(120 + 600 * glare)}" fill="#fff4d8" opacity="${F1(.5 + .5 * glare)}"/></g>
    <g filter="url(#pcs)"><circle cx="-300" cy="-30" r="58" fill="#121212"/><circle cx="300" cy="-30" r="58" fill="#121212"/></g></g>`;
}
// a street at night seen down its length (one-point), dark and soft: tenement walls, lamps and El columns receding
function streetDepth(t, { hy = 900 } = {}) {
  const vx = 540; let s = nightSky({ y0: -800, y1: hy + 60 });
  s += `<path d="M-400 ${hy} L-400 -200 L${vx - 70} ${hy - 160} L${vx - 70} ${hy} Z" fill="#20141a"/><path d="M1480 ${hy} L1480 -200 L${vx + 70} ${hy - 160} L${vx + 70} ${hy} Z" fill="#1a1218"/>`;
  const R = rng(8);
  for (let i = 0; i < 40; i++) { const side = i % 2 ? 1 : -1, d = .12 + R() * .85, x = vx + side * (70 + d * 900), y = hy - 140 * (1 - d) - R() * 900 * d;
    s += `<g filter="url(#pe2)"><rect x="${F1(x)}" y="${F1(y)}" width="${F1(14 * d + 3)}" height="${F1(20 * d + 4)}" fill="#e8a858" opacity="${F1(.5 + R() * .4)}"/></g>`; }
  s += `<path d="M-400 2400 L${vx - 70} ${hy} L${vx + 70} ${hy} L1480 2400 Z" fill="#7a8294"/>`;
  s += `<path d="M${vx - 40} ${hy} L-200 2400 M${vx + 40} ${hy} L1280 2400" stroke="#4a5060" stroke-width="40" opacity=".5"/>`;
  [0.1, 0.2, 0.35, 0.6, 1.0, 1.6].forEach(d => { const xl = vx - 110 - d * 620, xr = vx + 110 + d * 620, yb = hy + d * 760, h = 900 * d + 60;
    s += `<rect x="${F1(xl - 9 * d)}" y="${F1(yb - h)}" width="${F1(18 * d + 2)}" height="${F1(h)}" fill="#0e0e12"/><rect x="${F1(xr - 9 * d)}" y="${F1(yb - h)}" width="${F1(18 * d + 2)}" height="${F1(h)}" fill="#0e0e12"/>
      <g filter="url(#pe8)"><circle cx="${F1(xl)}" cy="${F1(yb - h - 30 * d)}" r="${F1(22 * d + 4)}" fill="#ffe0b0" opacity=".9"/><circle cx="${F1(xr)}" cy="${F1(yb - h - 30 * d)}" r="${F1(22 * d + 4)}" fill="#ffe0b0" opacity=".9"/></g>`; });
  s += `<rect x="-400" y="${hy - 520}" width="1880" height="70" fill="#0c0c10"/>`;
  return s;
}

// ======================= the speakeasy, inside =======================
addDefs(`<linearGradient id="mahog" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6a3424"/><stop offset=".5" stop-color="#4e2418"/><stop offset="1" stop-color="#36180e"/></linearGradient>
  <linearGradient id="mirrorG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5a5446"/><stop offset=".5" stop-color="#3a3428"/><stop offset="1" stop-color="#2a241c"/></linearGradient>`);
// damask wallpaper: a dark green ground with a faint repeating motif
function wallpaper(x, y, w, h, { col = '#2a3a2e', motif = '#3a4c3c', seed = 2 } = {}) {
  let m = ''; for (let yy = y + 40; yy < y + h; yy += 120) for (let xx = x + ((yy / 120) % 2 ? 60 : 0); xx < x + w; xx += 120)
    m += `<path d="M${xx} ${yy - 30} C${xx + 20} ${yy - 10} ${xx + 20} ${yy + 10} ${xx} ${yy + 30} C${xx - 20} ${yy + 10} ${xx - 20} ${yy - 10} ${xx} ${yy - 30} Z"/>`;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${col}"/><g fill="${motif}" opacity=".55">${m}</g>`;
}
// a bottle: shapes vary by kind (whisky, gin, wine, tall); colour = glass; fill = liquid level 0..1; no labels' text —
// a plain paper label; (x, y) = base centre
function bottle(x, y, s = 1, { kind = 0, col = '#5a3a14', fill = .7, liq = null, label = '#d8ccb0', rot = 0 } = {}) {
  const shapes = [
    'M-26 0 L-26 -110 Q-26 -130 -12 -138 L-9 -180 L9 -180 L12 -138 Q26 -130 26 -110 L26 0 Z',
    'M-22 0 L-22 -120 Q-22 -128 -16 -132 Q-8 -150 -7 -178 L7 -178 Q8 -150 16 -132 Q22 -128 22 -120 L22 0 Z',
    'M-30 0 L-30 -96 Q-30 -112 -14 -118 L-10 -170 L10 -170 L14 -118 Q30 -112 30 -96 L30 0 Z',
    'M-18 0 L-18 -150 Q-18 -164 -8 -170 L-6 -206 L6 -206 L8 -170 Q18 -164 18 -150 L18 0 Z'];
  const d = shapes[kind % 4], top = [-110, -120, -96, -150][kind % 4], lv = top * fill, id = fid('bt');
  return `<g transform="translate(${F1(x)} ${F1(y)}) rotate(${F1(rot)}) scale(${F1(s)})">
    <clipPath id="${id}"><path d="${d}"/></clipPath>
    <g filter="url(#pcs)"><path d="${d}" fill="${col}" opacity=".92"/></g>
    <g clip-path="url(#${id})"><rect x="-40" y="${F1(lv)}" width="80" height="${F1(-lv + 2)}" fill="${liq || darken(col, .35)}" opacity=".8"/>
      <rect x="-40" y="${F1(lv - 1)}" width="80" height="4" fill="${lighten(liq || col, .4)}" opacity=".5"/></g>
    ${label ? `<rect x="-18" y="-80" width="36" height="44" fill="${label}" opacity=".9"/><rect x="-18" y="-80" width="36" height="8" fill="${darken(label, .3)}" opacity=".6"/>` : ''}
    <path d="M-16 -8 L-16 ${F1(top + 10)}" stroke="#fff" stroke-width="5" opacity=".28"/><path d="M14 -10 L14 ${F1(top + 20)}" stroke="#fff" stroke-width="2" opacity=".15"/>
    <rect x="-9" y="${[-186, -184, -176, -212][kind % 4]}" width="18" height="12" fill="#3a2a1a"/></g>`;
}
// a shot glass / a tumbler; fill 0..1, liquid colour
function shotGlass(x, y, s = 1, { fill = .7, liq = '#c08a3a', tall = 0 } = {}) {
  const h = tall ? 120 : 80, w0 = tall ? 36 : 30, w1 = tall ? 44 : 38, lv = -h * fill + 6, id = fid('sg');
  const d = `M${-w0} 0 L${-w1} ${-h} L${w1} ${-h} L${w0} 0 Z`;
  return `<g transform="translate(${F1(x)} ${F1(y)}) scale(${F1(s)})">
    <clipPath id="${id}"><path d="${d}"/></clipPath>
    <g filter="url(#pcs)"><path d="${d}" fill="#c8d4d4" opacity=".42"/></g><path d="${d}" fill="none" stroke="#eef4f4" stroke-width="2.4" opacity=".55"/>
    ${fill > .01 ? `<g clip-path="url(#${id})"><rect x="-60" y="${F1(lv)}" width="120" height="${F1(-lv - 6)}" fill="${liq}" opacity=".88"/><ellipse cx="0" cy="${F1(lv)}" rx="${F1(lerp(w0, w1, -lv / h))}" ry="5" fill="${lighten(liq, .35)}" opacity=".7"/></g>` : ''}
    <rect x="${-w0}" y="-8" width="${2 * w0}" height="8" fill="#e4ecec" opacity=".45"/>
    <path d="M${-w1} ${-h} L${w1} ${-h}" stroke="#eef4f4" stroke-width="3" opacity=".6"/><path d="M${-w1 + 8} ${-h + 6} L${-w0 + 6} -10" stroke="#fff" stroke-width="4" opacity=".4"/></g>`;
}
// the back bar: a mahogany cabinet with an arched mirror between pilasters, glass shelves of bottles, the back counter;
// pendant lamps; damask wallpaper above. yC = top of the back counter
function backBar(t, { yC = 1300, morning = 0, reg = 1 } = {}) {
  const R = rng(23); let shelves = '';
  [[560, -260, 300], [760, -260, 300], [560, 790, 1340], [760, 790, 1340]].forEach(([y, a, b], j) => {
    shelves += `<rect x="${a}" y="${y}" width="${b - a}" height="10" fill="#a8b4b0" opacity=".6"/>`;
    for (let x = a + 30; x < b - 20; x += 46 + R() * 20) shelves += bottle(x, y, .82 + R() * .2, { kind: Math.floor(R() * 4), col: pick(R, ['#5a3a14', '#3a4a26', '#6a4a1a', '#2a3a2a', '#7a5a2a', '#4a2a1a']), fill: .3 + R() * .6, label: R() < .7 ? pick(R, ['#d8ccb0', '#c8b890', '#e0d8c8']) : null });
  });
  const pil = x => `<g filter="url(#pc)"><rect x="${x - 34}" y="420" width="68" height="${yC - 420}" fill="url(#mahog)"/></g><rect x="${x - 22}" y="440" width="10" height="${yC - 460}" fill="#8a4a30" opacity=".5"/>`;
  return `${wallpaper(-600, -600, 2400, 1100)}
    <g filter="url(#pc)"><rect x="-600" y="360" width="2400" height="70" fill="url(#mahog)"/></g><rect x="-600" y="362" width="2400" height="8" fill="#9a5a3a" opacity=".6"/>
    <rect x="-600" y="430" width="2400" height="${yC - 430}" fill="#2a1610"/>
    <path d="M300 ${yC - 30} L300 600 Q300 460 540 450 Q780 460 780 600 L780 ${yC - 30} Z" fill="url(#mirrorG)"/>
    <g filter="url(#b16)" opacity="${F1(.6 - .3 * morning)}"><circle cx="420" cy="620" r="40" fill="#ffd8a0"/><circle cx="700" cy="660" r="30" fill="#ffd8a0"/><rect x="340" y="900" width="400" height="200" fill="#4a2a1a"/></g>
    <path d="M330 560 L420 470 M360 700 L520 520" stroke="#fff" stroke-width="10" opacity=".08"/>
    ${shelves}${pil(-280)}${pil(300)}${pil(780)}${pil(1360)}
    <g filter="url(#pc)"><rect x="-600" y="${yC}" width="2400" height="40" fill="url(#mahog)"/><rect x="-600" y="${yC + 40}" width="2400" height="600" fill="#2e1810"/></g>
    <rect x="-600" y="${yC}" width="2400" height="6" fill="#b87a52" opacity=".5"/>
    ${reg ? cashRegister(1000, yC, .9, {}) : ''}
    ${[100, 980].map(x => pendant(x, 120, t, { on: 1 - .6 * morning })).join('')}`;
}
// a pendant lamp: a cord from the ceiling and a green-glass shade over a warm bulb
function pendant(x, y, t, { on = 1, s = 1 } = {}) {
  return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 -800 L0 0" stroke="#141010" stroke-width="4"/>
    <g filter="url(#pcs)"><path d="M-70 60 Q-60 0 0 -4 Q60 0 70 60 Z" fill="#2e5a3a"/></g><path d="M-50 40 Q-30 8 0 6" stroke="#8ac09a" stroke-width="4" fill="none" opacity=".5"/>
    ${on > 0 ? `<g filter="url(#pe16)"><ellipse cx="0" cy="70" rx="80" ry="30" fill="#ffd8a0" opacity="${F1(.6 * on)}"/></g><g filter="url(#pe2)"><ellipse cx="0" cy="62" rx="22" ry="10" fill="#fff2d6" opacity="${F1(on)}"/></g>` : ''}</g>`;
}
// a brass cash register on the counter (the ornate kind): blank keys, a little sign flag; drawer = how far out (0..1);
// (x, y) = base centre on the counter
function cashRegister(x, y, s = 1, { drawer = 0, flag = 0, coins = 6, moth = 0, t = 0 } = {}) {
  const R = rng(5); let keys = '';
  for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) keys += `<circle cx="${-120 + c * 40}" cy="${-150 + r * 34}" r="13" fill="#e8e0cc"/><circle cx="${-120 + c * 40}" cy="${-150 + r * 34}" r="13" fill="none" stroke="#6a5020" stroke-width="3"/>`;
  let cs = ''; for (let i = 0; i < coins; i++) cs += `<ellipse cx="${F1(-120 + R() * 240)}" cy="${F1(38 + R() * 20)}" rx="13" ry="6" fill="url(#brassG)"/>`;
  const dy = drawer * 70;
  return `<g transform="translate(${F1(x)} ${F1(y)}) scale(${F1(s)})">
    ${drawer > 0 ? `<g filter="url(#pcl)"><rect x="-170" y="${F1(-10 + dy)}" width="340" height="40" fill="#4a3a20"/></g><g transform="translate(0 ${F1(dy - 70)})"><rect x="-160" y="30" width="320" height="40" fill="#2a2016"/>
      ${[-80, 0, 80].map(xx => `<rect x="${xx - 2}" y="30" width="4" height="40" fill="#5a4a30"/>`).join('')}${cs}</g>` : ''}
    <g filter="url(#pcl)"><path d="M-170 0 L-170 -60 L-150 -200 Q-150 -230 -120 -232 L120 -232 Q150 -230 150 -200 L170 -60 L170 0 Z" fill="url(#brassG)"/>
      <path d="M-110 -232 Q-110 -300 0 -310 Q110 -300 110 -232 Z" fill="url(#brassG)"/></g>
    <path d="M-150 -60 L150 -60" stroke="#6a5020" stroke-width="4"/>${keys}
    ${Array.from({ length: 12 }, (_, i) => `<path d="M${-100 + i * 18} -250 q9 -20 18 0" stroke="#8a6a24" stroke-width="3" fill="none"/>`).join('')}
    <rect x="-60" y="-296" width="120" height="44" fill="#1a1612"/><rect x="-54" y="-290" width="108" height="32" fill="#e8e0cc" opacity="${F1(.3 + .7 * flag)}"/>
    <path d="M-120 -40 L120 -40" stroke="#fff4c8" stroke-width="4" opacity=".4"/><path d="M-140 -190 L-100 -226" stroke="#fff8d8" stroke-width="8" opacity=".35"/>
    ${moth ? `<g transform="translate(${F1(40 + 30 * Math.sin(t * 5))} ${F1(-20 + dy - 70 + 20 * Math.cos(t * 7))})"><path d="M0 0 C-14 -14 -24 -4 -18 6 Z M0 0 C14 -14 24 -4 18 6 Z" fill="#9a8a70" opacity=".9" transform="scale(1 ${F1(.5 + .5 * Math.abs(Math.sin(t * 40)))})"/></g>` : ''}</g>`;
}
// the bar counter seen across its top (foreground): the top slab with a brass edge, the panelled front; yTop = the
// near edge of the top. depth = how much of the top is visible
function barCounter(yTop, { x0 = -600, x1 = 1700, depth = 90, side = 'front', wet = 0 } = {}) {
  const yb = yTop + depth;
  return `<g filter="url(#pcl)"><path d="M${x0} ${yTop} L${x1} ${yTop} L${x1} ${yb} L${x0} ${yb} Z" fill="#5a2a1a"/>
      <rect x="${x0}" y="${yb}" width="${x1 - x0}" height="30" fill="#3e1c10"/><rect x="${x0}" y="${yb + 30}" width="${x1 - x0}" height="1400" fill="url(#mahog)"/></g>
    <path d="M${x0} ${yTop + 4} L${x1} ${yTop + 4}" stroke="#c88a62" stroke-width="5" opacity=".45"/>
    <path d="M${x0} ${yTop + depth * .55} L${x1} ${yTop + depth * .55}" stroke="#fff" stroke-width="${F1(depth * .25)}" opacity=".05"/>
    ${wet ? `<ellipse cx="400" cy="${yTop + depth * .5}" rx="80" ry="10" fill="#fff" opacity=".08"/>` : ''}
    ${Array.from({ length: Math.ceil((x1 - x0) / 300) }, (_, i) => `<rect x="${x0 + 30 + i * 300}" y="${yb + 70}" width="240" height="320" fill="none" stroke="#2a1008" stroke-width="6" opacity=".6"/><rect x="${x0 + 40 + i * 300}" y="${yb + 80}" width="10" height="300" fill="#8a4a30" opacity=".25"/>`).join('')}
    ${side === 'front' ? `<g filter="url(#pcs)"><rect x="${x0}" y="${yb + 440}" width="${x1 - x0}" height="16" rx="8" fill="url(#brassG)"/></g>` : ''}`;
}
// the room seen from behind the bar: back wall (wainscot + paper), the door (frosted glass, glowing street or daylight),
// a window with snow outside, round tables, a coat stand, hanging lamps. Floor from yF.
// door: 0..1 open (the door swings in, screen-left); morning: grey daylight in the window
function barRoom(t, { yF = 1360, door = 0, morning = 0, ts = t, tables = 1 } = {}) {
  const outside = morning ? '#b4bcc4' : '#2a3448', dx = 250, dw = 190, dyT = 760;
  const win = `<g filter="url(#pc)"><rect x="660" y="640" width="360" height="420" fill="#3a2214"/></g>
    <rect x="684" y="664" width="312" height="372" fill="${outside}"/>
    <clipPath id="brw"><rect x="684" y="664" width="312" height="372"/></clipPath>
    <g clip-path="url(#brw)">${morning ? '' : `<g filter="url(#pe8)"><circle cx="900" cy="760" r="20" fill="#ffd8a0" opacity=".7"/></g>`}
      <rect x="684" y="960" width="312" height="80" fill="${morning ? '#e8ecf0' : '#8a94a8'}"/>${snowFall(ts, { area: [684, 664, 996, 1036], n: 40, seed: 9, op: .8, near: 0 })}</g>
    <rect x="684" y="844" width="312" height="10" fill="#3a2214"/><rect x="836" y="664" width="10" height="372" fill="#3a2214"/>
    <g opacity=".85"><path d="M684 664 Q720 840 700 1036 L684 1036 Z M996 664 Q960 840 980 1036 L996 1036 Z" fill="#6a2a24"/></g>
    <rect x="650" y="1060" width="380" height="18" fill="#4a2a18"/>`;
  const doorPanel = door < .02 ? `<g filter="url(#pcs)"><rect x="${dx}" y="${dyT}" width="${dw}" height="${yF - dyT}" fill="#4a2a18"/></g>
      <rect x="${dx + 26}" y="${dyT + 30}" width="${dw - 52}" height="230" fill="${morning ? '#c8ccd0' : '#c89a60'}" opacity=".85"/>${morning ? '' : `<g filter="url(#pe8)"><rect x="${dx + 30}" y="${dyT + 34}" width="${dw - 60}" height="222" fill="#e8b878" opacity=".35"/></g>`}
      <rect x="${dx + 26}" y="${dyT + 300}" width="${dw - 52}" height="230" fill="none" stroke="#2a1608" stroke-width="6"/><circle cx="${dx + dw - 24}" cy="${dyT + 330}" r="8" fill="url(#brassG)"/>`
    : `<rect x="${dx}" y="${dyT}" width="${dw}" height="${yF - dyT}" fill="${morning ? '#d8dce0' : '#3a4458'}"/>
      <rect x="${dx}" y="${yF - 120}" width="${dw}" height="120" fill="${morning ? '#eef0f2' : '#8a94a8'}"/>
      <clipPath id="brd"><rect x="${dx}" y="${dyT}" width="${dw}" height="${yF - dyT}"/></clipPath><g clip-path="url(#brd)">${snowFall(ts, { area: [dx, dyT, dx + dw, yF], n: 26, seed: 13, near: 0 })}</g>
      ${door < 1 ? `<g filter="url(#pcs)"><rect x="${dx}" y="${dyT}" width="${F1(dw * (1 - door))}" height="${yF - dyT}" fill="#4a2a18"/></g>` : ''}
      <g filter="url(#pcs)"><path d="M${dx} ${dyT} L${F1(dx - 160 * door)} ${dyT - 30} L${F1(dx - 160 * door)} ${yF + 30} L${dx} ${yF} Z" fill="#3a2010"/></g>`;
  const table = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><g filter="url(#pcs)"><ellipse cx="0" cy="-260" rx="150" ry="34" fill="#4a2a18"/><rect x="-12" y="-250" width="24" height="230" fill="#2a1810"/><ellipse cx="0" cy="-12" rx="70" ry="14" fill="#2a1810"/></g>
      <ellipse cx="0" cy="-266" rx="130" ry="24" fill="#6a3a24" opacity=".6"/>${bottle(-40, -268, .5, { kind: 0 })}${shotGlass(30, -266, .5, {})}</g>`;
  return `${wallpaper(-600, -600, 2400, 1500, { col: '#33281e', motif: '#43362a' })}
    <rect x="-600" y="1000" width="2400" height="${yF - 1000}" fill="#3a2214"/><rect x="-600" y="1000" width="2400" height="14" fill="#5a3420"/>
    ${Array.from({ length: 16 }, (_, i) => `<rect x="${-560 + i * 160}" y="1040" width="120" height="${yF - 1080}" fill="none" stroke="#24140a" stroke-width="5" opacity=".7"/>`).join('')}
    <g filter="url(#pc)"><rect x="${dx - 26}" y="${dyT - 26}" width="${dw + 52}" height="${yF - dyT + 26}" fill="#2a1a10"/></g>${doorPanel}
    ${win}
    <g filter="url(#pc)"><rect x="-200" y="560" width="200" height="150" fill="#3a2414"/></g><rect x="-184" y="576" width="168" height="118" fill="#5a6a5a"/><path d="M-184 660 L-120 620 L-60 650 L-16 610 L-16 694 L-184 694 Z" fill="#3a4a3a"/>
    <path d="M-600 ${yF} L1800 ${yF} L1800 2600 L-600 2600 Z" fill="#3a2416"/>
    ${Array.from({ length: 12 }, (_, i) => `<path d="M${-600 + i * 220} ${yF} L${-1600 + i * 360} 2600" stroke="#24140a" stroke-width="4" opacity=".5"/>`).join('')}
    ${tables ? table(-60, yF + 120, .9) + table(1100, yF + 160, 1.0) : ''}
    ${pendant(540, 300, t, { on: 1 - .7 * morning, s: .8 })}
    ${morning ? `<g filter="url(#b60)" opacity=".35"><path d="M684 664 L996 664 L1300 1700 L700 1700 Z" fill="#e8eef4"/></g>` : ''}`;
}

// ======================= the back room =======================
// a store room behind the bar: rough plaster, crates of bottles stacked, a single lamp over a card table, smoke
function backRoom(t, { lamp = 1 } = {}) {
  const crate = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><g filter="url(#pcs)"><rect x="-120" y="-150" width="240" height="150" fill="#6a5034"/></g>
    <path d="M-120 -100 L120 -100 M-120 -50 L120 -50" stroke="#4a3622" stroke-width="5"/>${[-90, -45, 0, 45, 90].map(xx => `<rect x="${xx - 9}" y="-196" width="18" height="50" fill="#2a3a22" opacity=".9"/>`).join('')}</g>`;
  return `<rect x="-600" y="-600" width="2400" height="3200" fill="#3a3028"/>
    <g opacity=".5">${Array.from({ length: 30 }, (_, i) => { const R = rng(i + 4); return `<ellipse cx="${F1(-300 + R() * 1700)}" cy="${F1(R() * 1400)}" rx="${F1(30 + R() * 90)}" ry="${F1(20 + R() * 50)}" fill="${pick(R, ['#2e261e', '#44382c', '#342a20'])}"/>`; }).join('')}</g>
    <g filter="url(#pc)"><rect x="-600" y="1260" width="2400" height="1400" fill="#2a2018"/></g>
    ${crate(-80, 1250, 1.1)}${crate(-80, 1085, 1.1)}${crate(150, 1250, 1.1)}${crate(1080, 1250, 1.2)}${crate(1080, 1070, 1.2)}${crate(1080, 890, 1.2)}
    <g filter="url(#pc)"><rect x="760" y="380" width="200" height="140" fill="#2a2018"/></g><rect x="776" y="396" width="168" height="108" fill="#1a2234"/><path d="M860 396 L860 504 M776 450 L944 450" stroke="#2a2018" stroke-width="8"/>
    <path d="M540 -400 L540 600" stroke="#141010" stroke-width="4"/>
    <g filter="url(#pcs)"><path d="M440 660 Q450 600 540 594 Q630 600 640 660 Z" fill="#2a3a2c"/></g>
    ${lamp ? `<g filter="url(#pe2)"><ellipse cx="540" cy="664" rx="34" ry="12" fill="#fff0d0"/></g>
    <g filter="url(#b60)" opacity=".35"><path d="M450 660 L630 660 L980 1500 L100 1500 Z" fill="#ffe0b0"/></g>` : ''}
    ${smoke(540, 720, t, { seed: 3, n: 8, H: 500, drift: 120, r0: 60, r1: 200, col: '#c8b8a0', op: .12, speed: .03, blur: 'smokeBlur' })}`;
}
// a plain table seen at eye level (top as a sliver, front edge, an apron); covers the figures behind it to the bottom
// of the frame. papers: the policy and a pen on top (no writing — grey lines and a red seal)
function cardTable(x, y, w, { depth = 60, col = '#5a3a24', cloth = null } = {}) {
  return `<g filter="url(#pcl)"><path d="M${x - w / 2} ${y} L${x + w / 2} ${y} L${x + w / 2 + 20} ${y + depth} L${x - w / 2 - 20} ${y + depth} Z" fill="${cloth || col}"/>
      <rect x="${x - w / 2 - 20}" y="${y + depth}" width="${w + 40}" height="40" fill="${darken(col, .3)}"/><rect x="${x - w / 2 - 20}" y="${y + depth + 40}" width="${w + 40}" height="1400" fill="${darken(col, .5)}"/></g>
    <path d="M${x - w / 2 - 20} ${y + depth + 2} L${x + w / 2 + 20} ${y + depth + 2}" stroke="${lighten(col, .3)}" stroke-width="4" opacity=".5"/>`;
}
// an insurance policy lying on a table (seen from a low angle: foreshortened), or flat (insert); sig = how much of the
// signature is written 0..1
function policyDoc(x, y, s = 1, { rot = 0, sig = 0, flat = 0 } = {}) {
  const ky = flat ? 1 : .32, R = rng(3); let lines = '';
  for (let i = 0; i < 12; i++) lines += `<rect x="-120" y="${-260 + i * 22}" width="${F1(150 + R() * 90)}" height="6" fill="#8a8470" opacity=".55"/>`;
  const sigD = 'M-110 60 C-100 30 -90 80 -78 50 C-66 20 -60 70 -48 56 C-36 42 -30 30 -20 60 C-10 80 0 40 14 46 C30 52 40 70 70 40 C80 30 90 50 110 44';
  return `<g transform="translate(${F1(x)} ${F1(y)}) rotate(${F1(rot)}) scale(${F1(s)} ${F1(s * ky)})">
    <g filter="url(#pcs)"><rect x="-150" y="-320" width="300" height="420" fill="#ece4d0"/></g>
    <rect x="-136" y="-306" width="272" height="392" fill="none" stroke="#5a6a7a" stroke-width="5"/><rect x="-128" y="-298" width="256" height="376" fill="none" stroke="#5a6a7a" stroke-width="1.6"/>
    <rect x="-80" y="-290" width="160" height="14" fill="#3a4a5a" opacity=".7"/>${lines}
    <circle cx="96" cy="40" r="26" fill="#a8282a" opacity=".85"/><circle cx="96" cy="40" r="18" fill="none" stroke="#e8a8a0" stroke-width="2" opacity=".6"/>
    <path d="M-120 72 L60 72" stroke="#6a6a60" stroke-width="2"/>
    ${sig > 0 ? `<path d="${sigD}" stroke="#1a2440" stroke-width="3.4" fill="none" stroke-linecap="round" pathLength="1" stroke-dasharray="${F1(sig)} 1"/>` : ''}</g>`;
}
// a fountain pen (held: drawn by the caller at the fist; tip at (0, 0) pointing down-left)
const pen = (x, y, s = 1, rot = 0) => `<g transform="translate(${F1(x)} ${F1(y)}) rotate(${F1(rot)}) scale(${F1(s)})"><g filter="url(#pcs)"><path d="M-4 0 L4 0 L8 -150 Q8 -164 0 -166 Q-8 -164 -8 -150 Z" fill="#141418"/></g>
  <rect x="-8" y="-60" width="16" height="10" fill="url(#brassG)"/><path d="M-3 0 L0 18 L3 0 Z" fill="url(#brassG)"/><path d="M-4 -20 L-5 -140" stroke="#fff" stroke-width="2" opacity=".3"/></g>`;
// a few folded banknotes (held): green-grey paper, no print but a border and an oval
const bills = (x, y, s = 1, rot = 0) => `<g transform="translate(${F1(x)} ${F1(y)}) rotate(${F1(rot)}) scale(${F1(s)})">
  ${[0, 1, 2].map(i => `<g transform="rotate(${i * 9 - 9})"><g filter="url(#pcs)"><rect x="-70" y="-30" width="140" height="60" fill="${['#9aa88a', '#a4b294', '#8e9c80'][i]}"/></g><rect x="-62" y="-22" width="124" height="44" fill="none" stroke="#5a6a4a" stroke-width="2"/><ellipse cx="0" cy="0" rx="18" ry="16" fill="none" stroke="#4a5a3a" stroke-width="2"/></g>`).join('')}</g>`;

// ======================= inserts =======================
// the whisky bottle on the bar with a tin funnel in its neck; antifreeze pours in from a can whose spout comes in from the
// top of the frame; the level rises and greens. p = 0..1 progress, t for the stream wobble
function pourInsert(t, p, { s = 1 } = {}) {
  const lv = lerp(.35, .9, p), liq = mix('#b07a2a', '#6a8a3a', clamp(p * 1.4)), wob = Math.sin(t * 30) * 3;
  const sx = 560 + wob, sy0 = 420;
  return `<rect x="-600" y="-600" width="2400" height="3200" fill="#2a1810"/>
    <g filter="url(#b16)"><circle cx="160" cy="400" r="70" fill="#ffd8a0" opacity=".5"/><circle cx="900" cy="300" r="50" fill="#ffd8a0" opacity=".4"/>${[200, 330, 760, 880, 980].map((x, i) => `<rect x="${x}" y="${560 + (i % 2) * 40}" width="60" height="200" fill="#5a3a1a" opacity=".6"/>`).join('')}</g>
    <g filter="url(#pcl)"><path d="M-600 1500 L1800 1500 L1800 2600 L-600 2600 Z" fill="#4e2418"/></g><path d="M-600 1504 L1800 1504" stroke="#c88a62" stroke-width="6" opacity=".4"/>
    <ellipse cx="540" cy="1590" rx="300" ry="40" fill="#000" opacity=".35" filter="url(#b16)"/>
    ${bottle(540, 1590, 4.2, { kind: 0, col: '#6a4a1a', fill: lv, liq, label: '#d8ccb0' })}
    <g filter="url(#pcs)"><path d="M470 790 L650 790 L578 880 L578 960 L542 960 L542 880 Z" fill="#9aa0a4"/></g><path d="M480 796 L640 796" stroke="#e0e4e8" stroke-width="5" opacity=".6"/>
    <g filter="url(#pe2)"><path d="M${F1(sx - 9)} ${sy0} Q${F1(sx - 6 + wob)} 600 ${F1(sx - 5)} 820 L${F1(sx + 5)} 820 Q${F1(sx + 6 + wob)} 600 ${F1(sx + 9)} ${sy0} Z" fill="#7ac040" opacity=".85"/></g>
    <path d="M${F1(sx - 2)} ${sy0} Q${F1(sx + wob)} 600 ${F1(sx)} 820" stroke="#d8ffb0" stroke-width="3" opacity=".6"/>
    <g filter="url(#pcl)"><path d="M380 -200 L700 -200 L720 300 L360 300 Z" fill="#2e5a34"/><path d="M500 300 L620 300 L600 420 L540 430 Z" fill="#3a3a3a"/></g>
    <path d="M400 -200 L380 300" stroke="#fff" stroke-width="10" opacity=".12"/><rect x="380" y="60" width="340" height="90" fill="#c8b040" opacity=".85"/><path d="M420 105 L680 105" stroke="#2e5a34" stroke-width="10" opacity=".7"/>
    ${Array.from({ length: 8 }, (_, i) => { const R = rng(i + 1), y = 1500 - ((t * 300 + R() * 600) % 600); return `<circle cx="${F1(500 + R() * 80)}" cy="${F1(y)}" r="${F1(4 + R() * 6)}" fill="#e8ffd0" opacity=".45"/>`; }).join('')}`;
}
// a shot of whisky on the bar; the rat-poison tin beside it (a red tin with a black rat silhouette on a yellow band);
// a teaspoon from the top of the frame tips white powder in; it clouds and sinks. p = 0..1
function poisonInsert(t, p) {
  const tip = easeInOut(seg(p, .1, .45)), fall = seg(p, .3, .8), cloud = seg(p, .4, 1);
  const spx = 650, spy = lerp(930, 985, tip), rot = lerp(-10, 38, tip);
  return `<rect x="-600" y="-600" width="2400" height="3200" fill="#24140c"/>
    <g filter="url(#b16)"><circle cx="880" cy="420" r="70" fill="#ffd8a0" opacity=".5"/><circle cx="200" cy="300" r="40" fill="#ffd8a0" opacity=".35"/></g>
    <g filter="url(#pcl)"><path d="M-600 1400 L1800 1400 L1800 2600 L-600 2600 Z" fill="#4e2418"/></g><path d="M-600 1404 L1800 1404" stroke="#c88a62" stroke-width="6" opacity=".4"/>
    <g transform="translate(180 1470)"><g filter="url(#pcl)"><rect x="-150" y="-330" width="300" height="330" rx="14" fill="#9a2622"/><ellipse cx="0" cy="-330" rx="150" ry="26" fill="#b8b4ac"/></g>
      <rect x="-150" y="-250" width="300" height="130" fill="#d8b040"/>
      <path d="M-90 -150 C-80 -200 -20 -214 30 -196 C50 -214 74 -214 80 -196 C96 -190 104 -180 96 -170 C80 -160 60 -158 40 -160 C20 -150 -40 -146 -70 -152 C-100 -150 -130 -140 -140 -150 C-120 -150 -100 -150 -90 -150 Z" fill="#141010"/>
      <path d="M-140 -300 L-140 -30" stroke="#fff" stroke-width="10" opacity=".14"/><ellipse cx="0" cy="-332" rx="130" ry="18" fill="#e8e4dc" opacity=".8"/></g>
    <ellipse cx="620" cy="1480" rx="190" ry="30" fill="#000" opacity=".4" filter="url(#b10)"/>
    ${shotGlass(620, 1470, 5.2, { fill: .62, liq: '#b0742a' })}
    ${cloud > 0 ? `<g filter="url(#b16)" opacity="${F1(.75 * cloud)}">${[0, 1, 2, 3, 4].map(i => `<circle cx="${F1(620 + Math.sin(i * 2 + t * 2) * 60 * cloud)}" cy="${F1(1180 + i * 40 * cloud)}" r="${F1(40 + 30 * cloud)}" fill="#efe8d8"/>`).join('')}</g>` : ''}
    ${fall > 0 && fall < 1 ? `<g fill="#f4f0e8">${Array.from({ length: 40 }, (_, i) => { const R = rng(i + 30), y = spy + 40 + ((R() * 300 + fall * 600) % 340); return `<circle cx="${F1(spx - 40 + R() * 50)}" cy="${F1(y)}" r="${F1(2 + R() * 3)}" opacity=".9"/>`; }).join('')}</g>` : ''}
    <g transform="translate(${F1(spx)} ${F1(spy)}) rotate(${F1(rot)}) scale(1.7)"><g filter="url(#pcl)"><ellipse cx="0" cy="0" rx="60" ry="30" fill="#b8bcc0"/><rect x="40" y="-14" width="900" height="22" rx="10" fill="#a8acb0" transform="rotate(-50 40 0)"/></g>
      ${tip < .7 ? `<ellipse cx="0" cy="-6" rx="${F1(48 * (1 - tip))}" ry="${F1(18 * (1 - tip))}" fill="#f4f0e8"/>` : ''}<path d="M-40 -10 Q0 -26 40 -10" stroke="#fff" stroke-width="4" fill="none" opacity=".5"/></g>`;
}
// the sandwich, seen from above on a cutting board: rye bread, rotten sardines (grey, oily, a sickly green), flies; a
// box of tacks tipped from the top edge pours them in (they rattle down and lie bright among the fish), then the top
// slice comes down. p = 0..1
function sandwichInsert(t, p) {
  const pour = seg(p, .38, .7), lid = easeInOut(seg(p, .78, .93)), R = rng(4);
  let fish = '', tacks = '', flies = '';
  for (let i = 0; i < 6; i++) { const y = 800 + i * 64, x = 530 + (i % 2 ? 24 : -24), r = (i % 2 ? 1 : -1) * 4;
    fish += `<g transform="translate(${x} ${y}) rotate(${r}) scale(1.28)"><g filter="url(#pcs)"><path d="M-170 0 C-120 -30 80 -32 150 -6 L190 -30 L184 0 L190 30 L150 6 C80 32 -120 30 -170 0 Z" fill="${mix('#8a9090', '#7a8a5a', R() * .6)}"/></g>
      <path d="M-150 -6 C-80 -22 60 -22 140 -4" stroke="#d8e0e0" stroke-width="5" fill="none" opacity=".5"/><circle cx="-144" cy="-4" r="5" fill="#1a1a1a"/>
      <ellipse cx="${F1(-40 + R() * 120)}" cy="${F1(-4 + R() * 8)}" rx="22" ry="7" fill="#6a7a2a" opacity=".55"/></g>`; }
  const nT = Math.floor(28 * pour);
  for (let i = 0; i < nT; i++) { const R2 = rng(i * 7919 + 13); R2(); R2(); const tx = 330 + R2() * 420, ty = 780 + R2() * 380, a = R2() * 360, age = pour * 28 - i, bounce = age < 1 ? (1 - age) * 60 : 0;
    tacks += `<g transform="translate(${F1(tx)} ${F1(ty - bounce)}) rotate(${F1(a)})"><circle cx="0" cy="0" r="11" fill="url(#brassG)"/><circle cx="-3" cy="-3" r="4" fill="#fff8d8" opacity=".7"/><path d="M0 0 L0 24" stroke="#b8bcc0" stroke-width="3"/></g>`; }
  for (let i = 0; i < 3; i++) { const fx = 540 + Math.sin(t * (2.3 + i) + i * 2) * 260, fy = 980 + Math.cos(t * (1.7 + i * .6) + i) * 220, wb = Math.abs(Math.sin(t * 50 + i));
    flies += `<g transform="translate(${F1(fx)} ${F1(fy)})"><ellipse cx="0" cy="0" rx="8" ry="11" fill="#141414"/><ellipse cx="-9" cy="-6" rx="${F1(9 * wb + 2)}" ry="6" fill="#d8e0e8" opacity=".45"/><ellipse cx="9" cy="-6" rx="${F1(9 * wb + 2)}" ry="6" fill="#d8e0e8" opacity=".45"/></g>`; }
  const bread = (y, top) => `<g transform="translate(540 ${y})"><g filter="url(#pcl)"><path d="M-300 -260 C-320 -330 -230 -380 -160 -350 C-80 -390 80 -390 160 -350 C230 -380 320 -330 300 -260 L290 250 C290 290 260 300 230 300 L-230 300 C-260 300 -290 290 -290 250 Z" fill="#5a3a22"/></g>
      <path d="M-270 -250 C-280 -300 -220 -340 -160 -320 C-80 -350 80 -350 160 -320 C220 -340 280 -300 270 -250 L262 236 C262 262 244 270 222 270 L-222 270 C-244 270 -262 262 -262 236 Z" fill="${top ? '#9a7048' : '#b08a5e'}"/>
      ${Array.from({ length: 30 }, (_, i) => { const R3 = rng(i + (top ? 50 : 90)); return `<ellipse cx="${F1(-240 + R3() * 480)}" cy="${F1(-300 + R3() * 540)}" rx="4" ry="2.4" fill="#5a3a1e" opacity=".5"/>`; }).join('')}</g>`;
  const boxY = lerp(-300, 360, easeInOut(seg(p, .3, .4))) * (1 - easeInOut(seg(p, .72, .8))) + (seg(p, .72, .8) > 0 ? -300 * easeInOut(seg(p, .72, .8)) : 0);
  return `<rect x="-600" y="-600" width="2400" height="3200" fill="#3a2a1e"/>
    <g filter="url(#pcl)"><rect x="80" y="400" width="920" height="1220" rx="40" fill="#8a6440"/></g>${Array.from({ length: 14 }, (_, i) => `<path d="M100 ${430 + i * 86} C400 ${440 + i * 86} 700 ${420 + i * 86} 980 ${432 + i * 86}" stroke="#6a4a2c" stroke-width="3" opacity=".5"/>`).join('')}
    <g transform="translate(900 1560)"><g filter="url(#pcl)"><rect x="-150" y="-110" width="300" height="220" rx="30" fill="#b8bcc0"/></g><rect x="-130" y="-90" width="260" height="180" rx="22" fill="#6a6a5a"/>
      <path d="M-120 -40 L120 -40 M-120 20 L120 20" stroke="#9aa0a0" stroke-width="20" opacity=".5"/><ellipse cx="0" cy="0" rx="110" ry="70" fill="#8a7a2a" opacity=".35"/></g>
    ${bread(1000, 0)}${fish}${tacks}${flies}
    ${boxY > -290 ? `<g transform="translate(540 ${F1(boxY)}) rotate(${F1(150 + 10 * Math.sin(t * 12))})"><g filter="url(#pcl)"><rect x="-80" y="-120" width="160" height="240" fill="#2a4a6a"/></g><rect x="-80" y="-40" width="160" height="60" fill="#d8c890"/></g>` : ''}
    ${lid > 0 ? `<g transform="translate(0 ${F1(-900 * (1 - lid))})">${bread(1000, 1)}</g>` : ''}`;
}

// ======================= the rooming house =======================
// a high angle down on the bed: the wall with the gas fixture at the top, the iron bedhead, the pillow, the blanket;
// the rubber hose from the gas cock down to the pillow; cold moonlight through a window falls across in bars;
// shadows of men (hats) slide across. Returns { back, front }: the figure (head on the pillow) goes between them.
function roomingHouse(t, { shadow = 0, hiss = 0 } = {}) {
  const hose = 'M900 360 C910 520 830 690 760 810 C720 890 680 945 640 985';
  const back = `<rect x="-600" y="-600" width="2400" height="1300" fill="#5a5444"/>
    <g opacity=".5">${Array.from({ length: 20 }, (_, i) => `<path d="M${-560 + i * 120} -600 L${-560 + i * 120} 700" stroke="#4a4436" stroke-width="20"/>`).join('')}</g>
    <path d="M200 120 C240 160 230 260 300 300 L330 150 Z" fill="#6a6252" opacity=".7"/>
    <g filter="url(#pcs)"><path d="M770 -300 L770 300 Q770 336 806 336 L880 336" stroke="#7a5a26" stroke-width="16" fill="none"/>
      <rect x="826" y="314" width="46" height="44" rx="8" fill="url(#brassG)"/><path d="M872 336 L900 336 L900 356" stroke="#8a6a2a" stroke-width="12" fill="none"/></g>
    <g transform="rotate(${F1(-80 * hiss)} 849 316)"><rect x="844" y="268" width="10" height="50" rx="4" fill="#3a2a16"/><circle cx="849" cy="268" r="8" fill="#3a2a16"/></g>
    <path d="M776 -300 L776 296" stroke="#d8b878" stroke-width="3" opacity=".4"/>
    <rect x="-600" y="700" width="2400" height="40" fill="#3a3226"/>
    <g filter="url(#pc)">${[120, 960].map(x => `<rect x="${x - 14}" y="560" width="28" height="560" fill="#2a2a2e"/><circle cx="${x}" cy="556" r="22" fill="#2a2a2e"/>`).join('')}
      <rect x="120" y="640" width="840" height="20" fill="#2a2a2e"/><rect x="120" y="760" width="840" height="16" fill="#2a2a2e"/></g>
    ${[220, 330, 440, 550, 660, 770, 880].map(x => `<rect x="${x - 5}" y="660" width="10" height="100" fill="#2a2a2e"/>`).join('')}
    <path d="M-600 760 L1800 760 L1800 2600 L-600 2600 Z" fill="#3a3228"/>
    <g filter="url(#pc)"><path d="M100 760 L980 760 L1040 2600 L40 2600 Z" fill="#cfc8b4"/></g>
    <g filter="url(#pcl)"><path d="M300 820 C280 760 380 740 540 740 C700 740 800 760 780 820 C800 900 780 990 740 1000 C600 1020 480 1020 340 1000 C300 990 280 900 300 820 Z" fill="#e4dfd2"/></g>
    <path d="M330 830 C420 800 660 800 750 830" stroke="#b8b0a0" stroke-width="5" fill="none" opacity=".6"/>`;
  const front = `<g filter="url(#pcl)"><path d="M60 1180 C200 1120 400 1150 540 1140 C700 1130 880 1110 1020 1170 L1060 2600 L20 2600 Z" fill="#6a5a7a"/></g>
    <path d="M60 1180 C200 1120 400 1150 540 1140 C700 1130 880 1110 1020 1170 L1022 1240 C880 1180 700 1200 540 1210 C400 1220 200 1190 58 1250 Z" fill="#ece6da"/>
    ${Array.from({ length: 6 }, (_, i) => `<path d="M${120 + i * 160} 1300 C${160 + i * 160} 1600 ${100 + i * 170} 2000 ${140 + i * 160} 2600" stroke="#4a3e5a" stroke-width="6" opacity=".45" fill="none"/>`).join('')}
    <g filter="url(#pcs)"><path d="${hose}" stroke="#2a2a26" stroke-width="22" fill="none" stroke-linecap="round"/></g><path d="${hose}" stroke="#6a6a60" stroke-width="5" fill="none" opacity=".5" transform="translate(-5 -4)"/>
    <g filter="url(#b40)" opacity=".28"><path d="M-300 -300 L200 -300 L1100 2600 L600 2600 Z" fill="#b8c8e8"/><path d="M400 -300 L700 -300 L1500 2600 L1300 2600 Z" fill="#b8c8e8"/></g>
    ${shadow > 0 ? `<g filter="url(#b24)" opacity="${F1(.55 * shadow)}" transform="translate(${F1(lerp(-420, 0, shadow))} 0)">
      <path d="M300 1300 C300 1220 330 1190 360 1180 L340 1150 L460 1150 L440 1180 C470 1190 500 1220 500 1300 L520 2600 L280 2600 Z" fill="#05060c"/>
      <path d="M560 1380 C560 1300 590 1270 620 1262 C600 1240 600 1200 640 1196 L700 1196 C740 1200 740 1240 720 1262 C750 1270 780 1300 780 1380 L800 2600 L540 2600 Z" fill="#05060c"/></g>` : ''}
    ${hiss > 0 ? `<g filter="url(#b16)" opacity="${F1(.18 * hiss)}">${[0, 1, 2].map(i => `<circle cx="${F1(640 - i * 30 + Math.sin(t * 3 + i) * 20)}" cy="${F1(1100 - i * 50 - (t * 40 % 60))}" r="${40 + i * 20}" fill="#d8e8d0"/>`).join('')}</g>` : ''}`;
  return { back, front };
}

// ======================= more props =======================
// a round speakeasy table with a long cloth to the floor (so whoever sits behind it is hidden from the waist down);
// (x, y) = floor under the middle; a bottle and glasses on it
function clothTable(x, y, s = 1, { col = '#7a2a24', seed = 3 } = {}) {
  const T = -280;
  return `<g transform="translate(${F1(x)} ${F1(y)}) scale(${F1(s)})">
    <ellipse cx="0" cy="4" rx="210" ry="22" fill="#000" opacity=".35" filter="url(#b10)"/>
    <g filter="url(#pcl)"><path d="M-176 ${T} C-182 -150 -196 -60 -206 0 L206 0 C196 -60 182 -150 176 ${T} Z" fill="${col}"/>
      <ellipse cx="0" cy="${T}" rx="176" ry="36" fill="${lighten(col, .1)}"/></g>
    ${[-120, -50, 30, 110].map(xx => `<path d="M${xx} ${T + 36} C${xx - 6} -150 ${xx + 4} -70 ${xx - 4} 0" stroke="${darken(col, .3)}" stroke-width="7" fill="none" opacity=".5"/>`).join('')}
    ${bottle(-60, T + 6, .55, { kind: seed % 4, col: '#5a3a14' })}${shotGlass(40, T + 10, .55, {})}${shotGlass(100, T + 4, .5, { fill: .2 })}</g>`;
}
// a one-gallon antifreeze can (green, a yellow band, no lettering), carried by its wire handle; local: grip at (0, −236)
const antifreezeCan = (x, y, s = 1, rot = 0) => `<g transform="translate(${F1(x)} ${F1(y)}) rotate(${F1(rot)}) scale(${F1(s)})">
  <path d="M-46 -200 Q0 -262 46 -200" stroke="#5a5a5a" stroke-width="6" fill="none"/>
  <g filter="url(#pcs)"><rect x="-74" y="-206" width="148" height="206" rx="10" fill="#2e5a34"/><path d="M-60 -206 L-56 -232 L-36 -232 L-36 -206 Z" fill="#7a7a70"/></g>
  <rect x="-74" y="-130" width="148" height="56" fill="#c8b040"/><path d="M-56 -102 L56 -102" stroke="#2e5a34" stroke-width="9" opacity=".75"/>
  <path d="M-64 -196 L-64 -12" stroke="#fff" stroke-width="8" opacity=".14"/><rect x="-74" y="-12" width="148" height="12" fill="#1e3a22"/></g>`;
// a sandwich held by its right end (grip at (0, 0)); it reaches to the left by 150 units; bite 0..1 eats it from the
// left; rye slices, grey sardine tails sticking out, a tack head glinting
function sandwichHeld(x, y, s = 1, { bite = 0 } = {}) {
  const L = -150 + 130 * bite, B = L + 14;
  const bitEdge = bite > .02 ? `M${F1(L)} -40 q8 10 0 20 q8 10 0 20 q8 10 0 20 q8 10 0 20` : `M${F1(L)} -40 L${F1(L)} 40`;
  return `<g transform="translate(${F1(x)} ${F1(y)}) scale(${F1(s)})">
    <g filter="url(#pcs)"><path d="M${F1(L)} -46 L20 -46 Q30 -46 30 -34 L30 -14 L${F1(L)} -14 Z" fill="#8a5a34"/><path d="M${F1(L)} 14 L30 14 L30 34 Q30 46 20 46 L${F1(L)} 46 Z" fill="#7a5030"/></g>
    <path d="M${F1(L)} -14 L30 -14 L30 14 L${F1(L)} 14 Z" fill="#8a9090"/><path d="M${F1(B)} -6 L24 -8" stroke="#d8e0e0" stroke-width="3" opacity=".5"/>
    ${bite < .7 ? `<path d="M${F1(L + 10)} -6 L${F1(L - 18)} -18 L${F1(L - 12)} 0 L${F1(L - 18)} 16 L${F1(L + 10)} 6 Z" fill="#7a8484"/>` : ''}
    <path d="M30 -4 L52 -14 L48 0 L52 14 L30 4 Z" fill="#7a8484"/><circle cx="${F1(L + 40)}" cy="2" r="5" fill="url(#brassG)"/>
    <path d="${bitEdge}" stroke="#d8b890" stroke-width="5" fill="none" opacity=".8"/>
    <path d="M${F1(L + 6)} -40 L22 -40" stroke="#c89a6a" stroke-width="3" opacity=".6"/></g>`;
}
