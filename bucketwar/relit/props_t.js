// props_t.js — the bucket (hero prop), the well, a spear, the village at golden hour, and the light rig.
// Pieces that should be lit as solid objects carry a pc* filter (so the normal pass shades them); loose detail is flat paint.

addDefs(`
  <linearGradient id="oakA" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e2ab62"/><stop offset=".5" stop-color="#c58a45"/><stop offset="1" stop-color="#8e5d2c"/></linearGradient>
  <linearGradient id="ironB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a929c"/><stop offset=".45" stop-color="#5a616b"/><stop offset="1" stop-color="#2e333b"/></linearGradient>
  <radialGradient id="pitG" cx=".5" cy=".3" r=".8"><stop offset="0" stop-color="#7a5232"/><stop offset=".6" stop-color="#3a2212"/><stop offset="1" stop-color="#1a0e06"/></radialGradient>
`);

// a closed polygon around a polyline (round-ish ends), for thin bent parts that must carry a pc* filter
function ribbon(pts, w) {
  const n = pts.length, L = [], R = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
    L.push([pts[i][0] - dy * w / 2, pts[i][1] + dx * w / 2]); R.push([pts[i][0] + dy * w / 2, pts[i][1] - dx * w / 2]);
  }
  return 'M' + L.concat(R.reverse()).map(p => `${F1(p[0])} ${F1(p[1])}`).join(' L') + ' Z';
}
const bez = (p0, p1, p2, p3, n = 20) => Array.from({ length: n + 1 }, (_, i) => { const t = i / n, u = 1 - t;
  return [u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]; });

// ---------- the bucket: origin = the handle's apex (the grip point); it hangs below. s = scale, rot = swing (deg about the apex) ----------
function bucketProp(x, y, s = 1, { rot = 0, glint = 0, t = 0, pit = 1 } = {}) {
  const RIMY = 152, TOPR = 108, BOTR = 84, H = 178, RYT = 30, RYB = 22;
  const xt = i => -TOPR + i * (2 * TOPR / 9), xb = i => -BOTR + i * (2 * BOTR / 9);
  const yt = x_ => RIMY + RYT * Math.sqrt(Math.max(0, 1 - (x_ / TOPR) ** 2)), yb = x_ => RIMY + H + RYB * Math.sqrt(Math.max(0, 1 - (x_ / BOTR) ** 2));
  const R = rng(21);
  const staves = Array.from({ length: 9 }, (_, i) => {
    const a = [xt(i), yt(xt(i))], b = [xt(i + 1), yt(xt(i + 1))], c = [xb(i + 1), yb(xb(i + 1))], d = [xb(i), yb(xb(i))];
    const k = i / 8, base = mix(mix('#e6b36a', '#c18843', Math.min(1, k * 1.4)), '#7a4a22', Math.max(0, k - .55) * 1.1), col = mix(base, R() < .5 ? '#d29a52' : '#b27a38', .25);
    const grain = [0, 1, 2].map(j => `<path d="M${F1(a[0] * (.78 + j * .08) + b[0] * (.22 - j * .08))} ${F1(a[1] + 14 + j * 7)} L${F1(d[0] * (.7 + j * .1) + c[0] * (.3 - j * .1))} ${F1(d[1] - 20 - j * 9)}" stroke="#4a2a10" stroke-width="1.4" opacity="${F1(.18 + R() * .16)}"/>`).join('');
    return `<path d="M${F1(a[0])} ${F1(a[1])} L${F1(b[0])} ${F1(b[1])} L${F1(c[0])} ${F1(c[1])} L${F1(d[0])} ${F1(d[1])} Z" fill="${col}" filter="url(#pcs)"/>${grain}`;
  }).join('');
  const hoop = (y0, h) => { const a = x_ => TOPR - (TOPR - BOTR) * ((y0 - RIMY) / H), b = TOPR - (TOPR - BOTR) * ((y0 + h - RIMY) / H);
    return `<path d="M${-a(0)} ${y0} Q0 ${y0 + 2 * RYT * .98} ${a(0)} ${y0} L${b} ${y0 + h} Q0 ${y0 + h + 2 * RYT * .94} ${-b} ${y0 + h} Z" fill="url(#ironB)" filter="url(#pcsl)"/>
      ${[-.8, -.45, -.1, .25, .6].map(f => `<circle cx="${F1(f * a(0))}" cy="${F1(y0 + h / 2 + RYT * .98 * Math.sqrt(1 - f * f) * 1.0)}" r="3.2" fill="#aeb6c0"/>`).join('')}`; };
  const handle = bez([-TOPR + 4, RIMY], [-TOPR - 8, 56], [-54, -2], [0, -2], 18).concat(bez([0, -2], [54, -2], [TOPR + 8, 56], [TOPR - 4, RIMY], 18).slice(1));
  return `<g transform="translate(${F1(x)} ${F1(y)}) rotate(${F1(rot)}) scale(${s})">
    <path d="${ribbon(handle, 12)}" fill="url(#ironB)" filter="url(#pcsl)"/>
    <path d="${ribbon(handle.slice(3, 16), 3)}" fill="#c9d1da" opacity=".5"/>
    <path d="M${-TOPR} ${RIMY} L${-BOTR} ${RIMY + H} L${BOTR} ${RIMY + H} L${TOPR} ${RIMY} Z" fill="#2a160a"/>
    ${staves}
    <path d="M${-BOTR} ${RIMY + H} Q0 ${RIMY + H + 2 * RYB} ${BOTR} ${RIMY + H}" stroke="#2a160a" stroke-width="5" fill="none" opacity=".7"/>
    ${hoop(RIMY + 34, 22)}${hoop(RIMY + 128, 22)}
    <ellipse cx="0" cy="${RIMY}" rx="${TOPR + 3}" ry="${RYT + 2}" fill="#d8a45a" filter="url(#pcsl)"/>
    <ellipse cx="0" cy="${RIMY + 2}" rx="${TOPR - 11}" ry="${RYT - 8}" fill="url(#pitG)"/>
    <path d="M${-TOPR + 14} ${RIMY - 4} Q0 ${RIMY - RYT * 1.1 + 6} ${TOPR - 14} ${RIMY - 4}" stroke="#f0cf90" stroke-width="3" fill="none" opacity=".5"/>
    <ellipse cx="-26" cy="${RIMY + 2}" rx="${TOPR * .46}" ry="6" fill="#000" opacity=".3"/>
    <g filter="url(#pcsl)"><circle cx="${-TOPR + 2}" cy="${RIMY}" r="10" fill="url(#ironB)"/><circle cx="${TOPR - 2}" cy="${RIMY}" r="10" fill="url(#ironB)"/></g>
    <g transform="translate(${TOPR - 2} ${RIMY})">
      <path d="M2 4 C22 22 14 52 30 84 C38 102 34 122 40 138" stroke="#2a1a0c" stroke-width="15" fill="none" stroke-linecap="round" opacity=".5" transform="translate(3 4)"/>
      <path d="M2 4 C22 22 14 52 30 84 C38 102 34 122 40 138" stroke="#cdb078" stroke-width="12" fill="none" stroke-linecap="round" filter="url(#pcs)"/>
      <path d="M2 4 C22 22 14 52 30 84 C38 102 34 122 40 138" stroke="#7a5a30" stroke-width="3" fill="none" stroke-dasharray="6 8" opacity=".7"/>
      <ellipse cx="6" cy="6" rx="13" ry="11" fill="#bda068" filter="url(#pcsl)"/><path d="M-4 2 q10 -6 18 2 M-4 9 q10 -6 18 2" stroke="#6a4a24" stroke-width="2" fill="none" opacity=".7"/>
      <path d="M40 138 l-9 24 M40 138 l2 28 M40 138 l12 22 M40 138 l-3 26" stroke="#d6bc84" stroke-width="3.4" stroke-linecap="round"/></g>
    ${glint ? `<g opacity="${F1(glint)}"><path d="M-50 ${RIMY + 70} l0 -44 l6 38 l44 4 l-44 6 l-6 42 l-6 -42 l-44 -6 l44 -4 Z" fill="#fff4c8" transform="scale(.8)"/></g>` : ''}
  </g>`;
}

// ---------- the well (background; flat painted shapes, blurred with the set) ----------
function wellBg(x, y, s = 1, { rope = 1 } = {}) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <ellipse cx="30" cy="8" rx="300" ry="34" fill="#000" opacity=".3"/>
    <rect x="-210" y="-690" width="46" height="690" fill="#6a4426"/><rect x="164" y="-690" width="46" height="690" fill="#563418"/>
    <rect x="-236" y="-706" width="472" height="44" fill="#8a5c34"/>
    <path d="M-290 -696 L0 -866 L290 -696 Z" fill="#9a4a30"/><path d="M0 -866 L290 -696 L130 -696 Z" fill="#7a3824"/>
    ${[-3, -2, -1, 0, 1, 2, 3].map(i => `<path d="M${i * 38} -862 L${i * 82} -698" stroke="#5a2418" stroke-width="3" opacity=".5"/>`).join('')}
    <rect x="-252" y="-262" width="504" height="262" rx="40" fill="#cdbfa6"/><rect x="44" y="-262" width="208" height="262" rx="40" fill="#000" opacity=".16"/>
    ${[-200, -134, -68, -2].map((yy, r) => `<path d="M-250 ${yy} Q0 ${yy + 40} 250 ${yy}" stroke="#6a5a44" stroke-width="3" fill="none" opacity=".5"/>`).join('')}
    <ellipse cx="0" cy="-262" rx="252" ry="58" fill="#b8a98e"/><ellipse cx="0" cy="-260" rx="212" ry="40" fill="#1c2634"/>
    ${rope ? `<path d="M0 -640 L3 -440 L-6 -392 L8 -356 L-2 -330" stroke="#c9a766" stroke-width="10" fill="none" stroke-linecap="round"/>` : ''}
  </g>`;
}
const spearBg = (x, y, len) => `<rect x="${x - 6}" y="${y - len}" width="12" height="${len}" fill="#6b4a2b"/>`;

// ---------- the village at golden hour: sunset sky, hills, houses with lit windows, a bell tower, cypresses, a cobbled square ----------
function villageDusk({ t = 0, blur = 'dofHeavy', sun = [200, 1000], well = true } = {}) {
  const hz = 1180, R = rng(14);
  const houses = [[-80, 260, 420, '#d9965a', '#8a3a24'], [190, 230, 520, '#c9766a', '#7a2e22'], [420, 250, 380, '#e3c38a', '#8a3a24'], [660, 240, 470, '#a8b07a', '#7a2e22'], [900, 250, 400, '#d98a6a', '#8a3a24']]
    .map(([x, w, h, wall, roof]) => `<rect x="${x}" y="${hz - h}" width="${w}" height="${h}" fill="${wall}"/><rect x="${x + w * .6}" y="${hz - h}" width="${w * .4}" height="${h}" fill="#2a1a3a" opacity=".28"/>
      <path d="M${x - 16} ${hz - h} L${x + w / 2} ${hz - h - w * .38} L${x + w + 16} ${hz - h} Z" fill="${roof}"/>
      ${[0, 1, 2].map(r => [0, 1].map(c => `<path d="M${x + 38 + c * (w - 110)} ${hz - h + 70 + r * 120 + 62} v-52 a20 20 0 0 1 40 0 v52Z" fill="#ffc87a" filter="url(#pe)"/><path d="M${x + 38 + c * (w - 110)} ${hz - h + 70 + r * 120 + 62} v-52 a20 20 0 0 1 40 0 v52Z" fill="none" stroke="#3a2418" stroke-width="5"/>`).join('')).join('')}`).join('');
  const cyp = [60, 330, 640, 1020].map((x, i) => `<path d="M${x} ${hz - 380 + (i % 2) * 60} C${x + 52} ${hz - 270} ${x + 56} ${hz - 90} ${x + 30} ${hz + 20} L${x - 30} ${hz + 20} C${x - 56} ${hz - 90} ${x - 52} ${hz - 270} ${x} ${hz - 380 + (i % 2) * 60}Z" fill="#2c3a2a"/>`).join('');
  let cob = ''; for (let r = 0, y = hz + 150; y < 2300; r++) { const h = 36 + r * 9; cob += `<path d="M-320 ${y} L1400 ${y}" stroke="#4a2c1c" stroke-width="4" opacity=".4"/>`;
    for (let x = -300 + (r % 2) * 60; x < 1400; x += 120 + r * 5) cob += `<path d="M${x} ${y} l${F1((R() - .5) * 10)} ${h}" stroke="#4a2c1c" stroke-width="3.5" opacity=".35"/>`; y += h; }
  return `<g filter="url(#${blur})">
    ${sky(['#3e3a78', '#c8607e', '#ff9a58', '#ffd9a0'], { y1: 1300, disc: [sun[0], sun[1], 110, '#fff0c0'] })}
    ${mountains(1060, ['#8a5a82', '#6a4670'], { seed: 6, amp: 220 })}
    <g transform="translate(860 ${hz - 40})"><rect x="-70" y="-640" width="140" height="640" fill="#c98a68"/><rect x="40" y="-640" width="30" height="640" fill="#2a1a3a" opacity=".3"/>
      <rect x="-82" y="-700" width="164" height="64" fill="#e3c9a0"/><path d="M-82 -700 L0 -860 L82 -700 Z" fill="#7aa8a0"/>${[-38, 0, 38].map(x => `<path d="M${x - 14} -640 v-70 a14 14 0 0 1 28 0 v70Z" fill="#2a1a2a"/>`).join('')}</g>
    ${houses}${cyp}
    <rect x="-320" y="${hz + 20}" width="1720" height="140" fill="#7a6a3e"/>
    <rect x="-320" y="${hz + 110}" width="1720" height="1300" fill="#b98a58"/><rect x="-320" y="${hz + 110}" width="1720" height="1300" fill="url(#sunWarm)" opacity=".55"/>
    ${cob}
    ${well ? wellBg(930, 1330, .62) : ''}
    <ellipse cx="${sun[0]}" cy="${hz + 10}" rx="360" ry="46" fill="#ffd890" opacity=".5" filter="url(#b24)"/>
  </g>`;
}
addDefs(`<linearGradient id="sunWarm" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffc07a"/><stop offset=".6" stop-color="#d08a50" stop-opacity=".4"/><stop offset="1" stop-color="#5a3a50" stop-opacity=".2"/></linearGradient>`);

// ---------- light rig: low golden sun behind-left (rim), warm front key, cool violet sky fill ----------
RIG.village = (t, { sun = [200, 1000], k = 1 } = {}) => ({
  lights: [
    { pos: [sun[0], sun[1], -300], col: '#ffb470', int: 3.0 * k, rad: 2800, shin: 24 },                // low sun, behind: rim on the left edges
    { pos: [-260, 640, 520], col: '#ffe0b8', int: 1.45 * k, rad: 2600, shin: 26 },                      // warm key from the left, toward us
    { pos: [1300, 520, 420], col: '#b4c4ff', int: .5, rad: 3000, shin: 20 },                            // cool sky fill from the right
    { pos: [540, 2000, 300], col: '#ffc890', int: .35, rad: 1400, shin: 20 },                           // warm bounce off the square
  ],
  amb: '#9a88b0', ambGround: '#7a5a48', ambInt: .5, bgLight: .3, exposure: 1.1, bloom: .3, bloomThresh: .82, normalStrength: 1.5, specScale: .6, contrast: 1.06,
  rays: { center: sun, thresh: .5, srcRad: 420, samples: 40, step: .015, decay: .962, col: '#ffc890', int: .8 * k },
});
