// era_sets.js — sets, props and effects for "Two Bombs" (Hiroshima / Nagasaki, 1945 → 2009).
// World units ≈ screen pixels at zoom 1. Sets are pure functions of time. Background pieces carry no piece filter
// (they take the flat background light); props and anything near the lens use pc filters so the relight shapes them.

addDefs(`
  <filter id="b2" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2"/></filter>
  <filter id="b5" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5"/></filter>
  <filter id="b10" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="10"/></filter>
  <filter id="b16" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="16"/></filter>
  <filter id="b60" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="60"/></filter>
  <filter id="cloudF" x="-30%" y="-30%" width="160%" height="160%">
    <feTurbulence type="fractalNoise" baseFrequency=".012" numOctaves="4" seed="5" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="40" xChannelSelector="R" yChannelSelector="G" result="d"/>
    <feGaussianBlur in="d" stdDeviation="4"/></filter>
  <filter id="cloudF2" x="-30%" y="-30%" width="160%" height="160%">
    <feTurbulence type="fractalNoise" baseFrequency=".02" numOctaves="4" seed="9" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="34" xChannelSelector="R" yChannelSelector="G" result="d"/>
    <feGaussianBlur in="d" stdDeviation="2.5"/></filter>
`);

// parallax: a layer that follows the camera only partly (pf = 1 moves with the world, pf < 1 lags like distance)
const par = (C, pf, svg, ref = [540, 960]) => pf === 1 ? svg : `<g transform="translate(${F1((C.v.fx - ref[0]) * (1 - pf))} ${F1((C.v.fy - ref[1]) * (1 - pf))})">${svg}</g>`;
const pick = (R, arr) => arr[Math.floor(R() * arr.length) % arr.length];

// ---------- summer sky with cumulus ----------
// the loop frame: the same sky opens and closes the film
function sky1945({ y0 = -2600, y1 = 900, haze = '#dfe7e4', top = '#2e6db4', mid = ['#6aa2d6', '#b6d2e2'] } = {}) {
  const id = fid('sk45');
  return `<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="${y0}" x2="0" y2="${y1}">
      <stop offset="0" stop-color="${top}"/><stop offset=".55" stop-color="${mid[0]}"/><stop offset=".85" stop-color="${mid[1]}"/><stop offset="1" stop-color="${haze}"/></linearGradient></defs>
    <rect x="-1400" y="${y0}" width="3880" height="${y1 - y0}" fill="url(#${id})"/>`;
}
// a cumulus: soft lumpy volume lit from the upper left, shaded underside; (x, y) = base centre
function cumulus(x, y, w, h, { seed = 1, op = 1, drift = 0, tint = '#ffffff', shadeC = '#a8b8cc', baseC = '#9eb0c4' } = {}) {
  const R = rng(seed * 17 + 3), id = fid('cu'); let body = '', lit = '', dark = '';
  const n = 11;
  for (let i = 0; i < n; i++) {
    const u = (i + .5) / n, bump = Math.pow(Math.sin(u * Math.PI), .8);
    const r = (h * .22 + h * .42 * bump) * (.8 + R() * .4), px = x - w / 2 + u * w + (R() - .5) * w * .06 + drift, py = y - r * .55 - bump * h * .42;
    body += `<circle cx="${F1(px)}" cy="${F1(py)}" r="${F1(r)}"/>`;
    lit += `<circle cx="${F1(px - r * .28)}" cy="${F1(py - r * .3)}" r="${F1(r * .62)}"/>`;
    dark += `<circle cx="${F1(px + r * .3)}" cy="${F1(py + r * .42)}" r="${F1(r * .7)}"/>`;
  }
  for (let i = 0; i < 6; i++) { const px = x - w * .3 + R() * w * .6 + drift, py = y - h * (.7 + R() * .35), r = h * (.18 + R() * .16);
    body += `<circle cx="${F1(px)}" cy="${F1(py)}" r="${F1(r)}"/>`; lit += `<circle cx="${F1(px - r * .25)}" cy="${F1(py - r * .25)}" r="${F1(r * .6)}"/>`; }
  return `<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="${F1(y - h * 1.2)}" x2="0" y2="${F1(y)}"><stop offset="0" stop-color="${tint}"/><stop offset=".6" stop-color="${mix(tint, shadeC, .35)}"/><stop offset="1" stop-color="${baseC}"/></linearGradient></defs>
    <g opacity="${op}"><g filter="url(#cloudF2)"><g fill="url(#${id})">${body}</g></g>
      <g filter="url(#b16)"><g fill="${shadeC}" opacity=".45">${dark}</g></g>
      <g filter="url(#b10)"><g fill="#ffffff" opacity=".75">${lit}</g></g>
      <ellipse cx="${F1(x + drift)}" cy="${F1(y - h * .06)}" rx="${F1(w * .46)}" ry="${F1(h * .1)}" fill="${baseC}" opacity=".5" filter="url(#b10)"/></g>`;
}
// the sky band used at the start and the end of the film (sky + three cumulus), world coordinates
function skyOpen(t = 0, { drift = 0 } = {}) {
  return `${sky1945()}
    ${cumulus(210, -980, 520, 260, { seed: 3, drift: drift * .6 })}${cumulus(880, -1320, 440, 210, { seed: 7, drift: drift * .4, op: .9 })}
    ${cumulus(640, -560, 760, 300, { seed: 11, drift })}${cumulus(-60, -1700, 380, 170, { seed: 13, drift: drift * .3, op: .8 })}`;
}

// ---------- hills ----------
function hills(y, cols, { seed = 3, amp = 160, step = 90, smooth = true } = {}) {
  return cols.map((c, i) => {
    const R = rng(seed + i * 7), pts = [];
    for (let x = -1400; x <= 2500; x += step) pts.push([x, y + i * 46 - amp * (1 - i * .22) * (.35 + .65 * Math.abs(Math.sin(x * .0016 + i * 1.3 + seed) * .7 + R() * .3))]);
    let d = `M${pts[0][0]} ${y + 900}`;
    pts.forEach(([x, yy], j) => { if (!j) d += ` L${x} ${F1(yy)}`; else { const [px, py] = pts[j - 1]; d += ` Q${px + step / 2} ${F1(py)} ${x} ${F1(yy)}`; } });
    let trees = ''; if (smooth) { const R2 = rng(seed * 3 + i); for (let k = 0; k < 140; k++) { const x = -1400 + R2() * 3900, j = Math.floor((x + 1400) / step), q = pts[Math.max(0, Math.min(pts.length - 1, j))];
      trees += `<circle cx="${F1(x)}" cy="${F1(q[1] + 10 + R2() * 120)}" r="${F1(3 + R2() * 6)}"/>`; } }
    return `<path d="${d} L2500 ${y + 900} Z" fill="${c}"/><g fill="${darken(c, .1)}" opacity=".28" filter="url(#b2)">${trees}</g>`;
  }).join('');
}

// ---------- Hiroshima from above the river ----------
// a field of tiled roofs between y0 (far) and y1 (near), seen from a high vantage: rows shrink with distance
function roofField(x0, x1, y0, y1, { seed = 5, rows = 22, gapAt = null, skip = null, haze = '#c8d4d8', far = .25 } = {}) {
  const R = rng(seed); let s = '';
  for (let r = 0; r < rows; r++) {
    const p = r / (rows - 1), y = y0 + (y1 - y0) * Math.pow(p, 1.6), sc = lerp(far, 1.25, Math.pow(p, 1.3)), hz = Math.pow(1 - p, 1.8);
    let x = x0 - R() * 60 * sc;
    while (x < x1) {
      const w = (70 + R() * 90) * sc, d = (26 + R() * 18) * sc, hgt = (14 + R() * 16) * sc, cx = x + w / 2;
      if (!(skip && skip(cx, y))) {
        const roofC = mix(pick(R, ['#4a5058', '#3e444c', '#565a60', '#5a5048', '#444a50']), haze, .75 * hz), wallC = mix(pick(R, ['#d8cdb8', '#c8b898', '#8a7458', '#6a5640']), haze, .75 * hz);
        const ridge = pick(R, [0, 1]);
        // wall (front), then roof: a hip roof seen from above (trapezoid with a ridge line)
        s += `<rect x="${F1(x + w * .06)}" y="${F1(y - hgt)}" width="${F1(w * .88)}" height="${F1(hgt)}" fill="${wallC}"/>`;
        s += `<path d="M${F1(x)} ${F1(y - hgt)} L${F1(x + w * .18)} ${F1(y - hgt - d)} L${F1(x + w * .82)} ${F1(y - hgt - d)} L${F1(x + w)} ${F1(y - hgt)} Z" fill="${roofC}"/>`;
        s += `<path d="M${F1(x + w * .18)} ${F1(y - hgt - d)} L${F1(x + w * .82)} ${F1(y - hgt - d)}" stroke="${mix('#2a2e34', haze, .7 * hz)}" stroke-width="${F1(2.2 * sc)}"/>`;
        s += `<path d="M${F1(x + w * .5)} ${F1(y - hgt - d)} L${F1(x + w * .5 + (ridge ? 0 : w * .1))} ${F1(y - hgt)}" stroke="${mix('#7a8088', haze, .7 * hz)}" stroke-width="${F1(1.2 * sc)}" opacity=".5"/>`;
        if (R() < .1) s += `<circle cx="${F1(x + w * .5)}" cy="${F1(y - hgt - d * 1.2)}" r="${F1(18 * sc)}" fill="${mix('#3e6a3a', haze, .7 * hz)}"/>`;   // a tree
      }
      x += w + (R() < .2 ? 30 * sc : 4 * sc);
    }
  }
  return s;
}
// ---------- the Industrial Promotion Hall, seen across the river (the postcard view) ----------
// ruin = 0: 1945, tan walls, copper dome. ruin = 1: the A-Bomb Dome as it stands (bare walls, the dome's steel skeleton).
// (x, y) = ground centre of the front facade, s = scale. Sun from the left: left faces lit, right faces in shade.
function domeHall(x, y, s = 1, { ruin = 0 } = {}) {
  const W = ruin ? '#a49a8a' : '#d2bc94', WS = ruin ? '#7a7266' : '#a89070', WD = ruin ? '#4a443c' : '#7a6448', trim = ruin ? '#8a8276' : '#e6d6b4';
  const roof = '#4a4e52', cop = '#5a9a84', copL = '#9ed2bc', copD = '#2e5e4e', win = ruin ? '#120e0c' : '#2c3238', glass = ruin ? 0 : 1;
  const arch = (x0, y0, w, h) => `<path d="M${x0} ${y0 + h} L${x0} ${y0 + w / 2} A${w / 2} ${w / 2} 0 0 1 ${x0 + w} ${y0 + w / 2} L${x0 + w} ${y0 + h} Z" fill="${win}"/>` +
    (glass ? `<path d="M${x0 + w * .2} ${y0 + h * .3} L${x0 + w * .2} ${y0 + h * .9}" stroke="#8aa0b0" stroke-width="2" opacity=".5"/>` : '');
  const row = (x0, x1, y0, n, w, h) => Array.from({ length: n }, (_, i) => arch(x0 + i * (x1 - x0 - w) / (n - 1), y0, w, h)).join('');
  // wings: front block 760 wide x 300 high; the right side recedes (a narrow shaded return)
  const wing = `<path d="M-380 0 L-380 -300 L380 -300 L380 0 Z" fill="${W}"/>
    <path d="M380 0 L380 -300 L470 -330 L470 -26 Z" fill="${WS}"/>
    <path d="M-392 -300 L392 -300 L392 -318 L-392 -318 Z" fill="${trim}"/><path d="M380 -300 L470 -330 L470 -346 L392 -318 Z" fill="${WS}"/>
    <path d="M-380 -104 L380 -104 L380 -96 L-380 -96 Z M-380 -204 L380 -204 L380 -196 L-380 -196 Z" fill="${trim}" opacity=".8"/>
    ${row(-360, -140, -88, 6, 22, 64)}${row(140, 360, -88, 6, 22, 64)}${row(-360, -140, -186, 6, 22, 66)}${row(140, 360, -186, 6, 22, 66)}${row(-360, -140, -284, 6, 22, 60)}${row(140, 360, -284, 6, 22, 60)}
    ${[0, 1, 2].map(r => [0, 1, 2].map(c => `<rect x="${396 + c * 24}" y="${-280 + r * 98 - c * 8}" width="12" height="54" fill="${win}" opacity=".8"/>`).join('')).join('')}
    ${ruin ? '' : `<path d="M-392 -318 L-372 -352 L372 -352 L392 -318 Z" fill="${roof}"/><path d="M392 -318 L372 -352 L460 -378 L470 -346 Z" fill="${darken(roof, .3)}"/>`}`;
  // central tower: 260 wide, to -560, then the drum and the oval dome
  const tower = `<path d="M-130 -300 L-130 -560 L130 -560 L130 -300 Z" fill="${W}"/><path d="M60 -300 L60 -560 L130 -560 L130 -300 Z" fill="${WS}" opacity=".45"/>
    ${row(-110, 110, -400, 4, 26, 80)}${row(-110, 110, -520, 4, 26, 84)}
    <path d="M-140 -560 L140 -560 L140 -578 L-140 -578 Z" fill="${trim}"/><path d="M-130 -380 L130 -380 L130 -372 L-130 -372 Z" fill="${trim}" opacity=".8"/>`;
  const drum = `<path d="M-96 -578 L-96 -640 L96 -640 L96 -578 Z" fill="${W}"/><path d="M40 -578 L40 -640 L96 -640 L96 -578 Z" fill="${WS}" opacity=".45"/>
    ${row(-84, 84, -630, 7, 14, 44)}<path d="M-104 -640 L104 -640 L104 -654 L-104 -654 Z" fill="${trim}"/>`;
  const domeIntact = `<path d="M-98 -654 C-98 -746 -54 -802 0 -804 C54 -802 98 -746 98 -654 Z" fill="${cop}"/>
    <path d="M18 -800 C64 -786 98 -736 98 -654 L44 -654 C46 -722 36 -770 18 -800 Z" fill="${copD}" opacity=".75"/>
    <path d="M-62 -760 C-46 -786 -22 -798 2 -800" stroke="${copL}" stroke-width="8" fill="none" opacity=".6"/>
    ${[-60, -30, 0, 30, 60].map(xx => `<path d="M${xx} -654 Q${xx * .8} -760 0 -802" stroke="${copD}" stroke-width="2" fill="none" opacity=".45"/>`).join('')}
    <path d="M-8 -804 L-8 -836 L8 -836 L8 -804 Z" fill="${copD}"/><circle cx="0" cy="-840" r="7" fill="${copD}"/>`;
  const domeRuin = `${[-98, -70, -40, -14, 14, 40, 70, 98].map(xx => `<path d="M${xx} -654 Q${xx * .8} -760 0 -802" stroke="#2e2a26" stroke-width="5" fill="none"/>`).join('')}
    <path d="M-98 -700 Q0 -716 98 -700 M-84 -748 Q0 -762 84 -748 M-50 -786 Q0 -794 50 -786" stroke="#2e2a26" stroke-width="4" fill="none"/>`;
  const broken = ruin ? `<path d="M-392 -330 L-380 -300 L-380 -240 L-330 -262 L-300 -210 L-250 -250 L-220 -300 L-200 -230 L-140 -270 L-130 -300 L-392 -300 Z M392 -330 L470 -360 L470 -200 L430 -230 L400 -180 L380 -240 L392 -300 Z" fill="#7a96a8"/>
    <path d="M-130 -560 L-110 -540 L-60 -560 Z M130 -560 L100 -530 L60 -560 Z" fill="#7a96a8"/>
    <g fill="#6a6258">${Array.from({ length: 22 }, (_, i) => { const R = rng(i + 40); return `<path d="M${F1(-420 + R() * 900)} 4 l${F1(10 + R() * 30)} ${F1(-10 - R() * 24)} l${F1(14 + R() * 20)} ${F1(12 + R() * 10)} Z"/>`; }).join('')}</g>` : '';
  const detail = `<path d="M-380 0 L-380 -26 L380 -26 L380 0 Z" fill="${WD}" opacity=".55"/><path d="M380 0 L380 -26 L470 -52 L470 -26 Z" fill="${WD}" opacity=".7"/>
    <defs><linearGradient id="dhs${ruin}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff6e0" stop-opacity=".18"/><stop offset=".5" stop-color="#fff6e0" stop-opacity="0"/><stop offset="1" stop-color="#20160c" stop-opacity=".22"/></linearGradient></defs>
    <path d="M-380 0 L-380 -300 L380 -300 L380 0 Z M-130 -300 L-130 -560 L130 -560 L130 -300 Z" fill="url(#dhs${ruin})"/>
    <path d="M-250 -300 L-250 0 M250 -300 L250 0" stroke="${WD}" stroke-width="5" opacity=".35"/>
    ${ruin ? '' : [-300, -220, 180, 300].map(xx => `<path d="M${xx} -280 l6 0 l0 54 l-6 0 Z" fill="#fff8e0" opacity=".35"/>`).join('')}`;
  return `<g transform="translate(${F1(x)} ${F1(y)}) scale(${s})">${wing}${tower}${drum}${ruin ? domeRuin : domeIntact}${broken}${detail}</g>`;
}
// the Aioi bridge seen from the side (a long low concrete span with railings) with a streetcar on it; tram = 0..1 across
function aioiSide(x0, x1, y, { tram = null, s = 1 } = {}) {
  const posts = Array.from({ length: Math.floor((x1 - x0) / 46) }, (_, i) => `<rect x="${F1(x0 + 20 + i * 46)}" y="${F1(y - 30 * s)}" width="${F1(5 * s)}" height="${F1(30 * s)}" fill="#6a665e"/>`).join('');
  const piers = Array.from({ length: 4 }, (_, i) => `<rect x="${F1(lerp(x0, x1, (i + .5) / 4) - 14 * s)}" y="${F1(y + 18 * s)}" width="${F1(28 * s)}" height="${F1(70 * s)}" fill="#5a564e"/>`).join('');
  const tx = tram == null ? null : lerp(x0 - 200, x1 + 50, tram);
  const tramSVG = tx == null ? '' : `<g transform="translate(${F1(tx)} ${F1(y - 6 * s)}) scale(${s})">
      <path d="M0 0 L0 -66 Q0 -76 10 -76 L150 -76 Q160 -76 160 -66 L160 0 Z" fill="#3e6a52"/><path d="M0 -40 L160 -40 L160 -6 L0 -6 Z" fill="#d8ccaa"/>
      ${[0, 1, 2, 3, 4].map(i => `<rect x="${12 + i * 28}" y="-68" width="20" height="22" fill="#2a3036"/>`).join('')}
      <path d="M70 -76 L60 -106 M70 -76 L84 -106" stroke="#2a2a2a" stroke-width="2"/><circle cx="30" cy="2" r="7" fill="#1a1a1a"/><circle cx="130" cy="2" r="7" fill="#1a1a1a"/></g>`;
  return `${piers}<path d="M${x0} ${y} L${x1} ${y} L${x1} ${F1(y + 20 * s)} L${x0} ${F1(y + 20 * s)} Z" fill="#8a867c"/>
    <path d="M${x0} ${F1(y + 20 * s)} L${x1} ${F1(y + 20 * s)} L${x1} ${F1(y + 28 * s)} L${x0} ${F1(y + 28 * s)} Z" fill="#4a463e"/>
    ${tramSVG}${posts}<path d="M${x0} ${F1(y - 30 * s)} L${x1} ${F1(y - 30 * s)}" stroke="#7a766c" stroke-width="${F1(5 * s)}"/>
    <path d="M${x0} ${F1(y - 120 * s)} L${x1} ${F1(y - 120 * s)}" stroke="#2a2a2a" stroke-width="1.4" opacity=".6"/>
    ${Array.from({ length: 6 }, (_, i) => `<path d="M${F1(lerp(x0, x1, i / 5))} ${F1(y)} L${F1(lerp(x0, x1, i / 5))} ${F1(y - 126 * s)}" stroke="#4a4640" stroke-width="${F1(3 * s)}"/>`).join('')}`;
}
// a skyline band of roofs on the far bank: silhouettes stepping in front of each other, hazy
function skylineBand(x0, x1, y, { seed = 2, h = 60, col = '#7c8a90', haze = '#b4c2c6', rows = 3 } = {}) {
  let s = '';
  for (let r = 0; r < rows; r++) { const R = rng(seed + r * 11), c = mix(col, haze, .5 * (rows - 1 - r) / Math.max(1, rows - 1)); let x = x0;
    let d = `M${x0} ${y + 40}`;
    while (x < x1) { const w = 40 + R() * 90, hh = h * (.5 + R() * .7) * (1 - .15 * (rows - 1 - r)), yy = y - r * 14 - hh;
      if (R() < .78) d += ` L${F1(x)} ${F1(yy + 14)} L${F1(x + w * .2)} ${F1(yy)} L${F1(x + w * .8)} ${F1(yy)} L${F1(x + w)} ${F1(yy + 14)}`;
      else d += ` L${F1(x)} ${F1(yy - 30)} L${F1(x + w * .6)} ${F1(yy - 30)} L${F1(x + w * .6)} ${F1(yy + 14)} L${F1(x + w)} ${F1(yy + 14)}`;
      if (R() < .15) d += ` L${F1(x + w)} ${F1(yy - 6)} Q${F1(x + w + 24)} ${F1(yy - 50)} ${F1(x + w + 48)} ${F1(yy - 6)}`, x += 48;
      x += w; }
    s += `<path d="${d} L${x1} ${y + 40} Z" fill="${c}"/>`; }
  return s;
}
// water with the reflection of whatever `refl` draws (mirrored about y = yw), ripples, glints
function riverWater(yw, y1, t, refl = '', { col = '#5e7e8a', far = '#a8bcc2', seed = 4 } = {}) {
  const id = fid('rw'), R = rng(seed);
  let rip = ''; for (let i = 0; i < 40; i++) { const p = R(), y = yw + 6 + (y1 - yw) * p * p, x = -300 + R() * 1700, L = 30 + p * 140;
    rip += `<path d="M${F1(x + Math.sin(t * 1.2 + i) * 8 * (1 + p))} ${F1(y)} l${F1(L)} 0" stroke="${R() < .5 ? '#e6f0f0' : '#3a525c'}" stroke-width="${F1(1 + p * 3)}" opacity="${F1(.18 + .25 * R())}"/>`; }
  return `<defs>${linG(id, [far, col], { x2: 0, y2: 1 })}</defs><rect x="-1400" y="${yw}" width="3880" height="${y1 - yw}" fill="url(#${id})"/>
    <g transform="translate(0 ${2 * yw}) scale(1 -1)" opacity=".42" filter="url(#b5)">${refl}</g>
    <rect x="-1400" y="${yw}" width="3880" height="${y1 - yw}" fill="url(#${id})" opacity=".35"/>${rip}`;
}
// the near bank: stone embankment and grass
function nearBank(y, t, { seed = 6 } = {}) {
  const R = rng(seed); let stones = '';
  for (let i = 0; i < 30; i++) { const x = -300 + i * 60 + R() * 20, yy = y + 10 + R() * 30; stones += `<path d="M${F1(x)} ${F1(yy)} l${F1(26 + R() * 30)} ${F1(-4 - R() * 6)} l${F1(8 + R() * 10)} ${F1(16 + R() * 10)} l${F1(-30 - R() * 26)} ${F1(6)} Z" fill="${pick(R, ['#6a6458', '#5a564c', '#7a7266'])}"/>`; }
  let grass = ''; for (let i = 0; i < 160; i++) { const x = -300 + R() * 1700, yy = y + 30 + R() * 200, h = 20 + R() * 40; grass += `<path d="M${F1(x)} ${F1(yy)} q${F1(4 + Math.sin(t * 2 + i) * 4)} ${F1(-h * .6)} ${F1(8 + Math.sin(t * 2 + i) * 6)} ${F1(-h)}" stroke="${pick(R, ['#4e6a34', '#5e7a3e', '#3e5a2a'])}" stroke-width="${F1(2 + R() * 2)}" fill="none"/>`; }
  return `<path d="M-1400 ${y} L2500 ${y} L2500 ${y + 1200} L-1400 ${y + 1200} Z" fill="#4a5a34"/>${stones}${grass}`;
}
// the whole opening view. ruin: the same view today (end of the film). Parallax refs: sky at the opening frame, the rest
// at the settled frame.
const SKY_REF = [540, -1000], TOWN_REF = [540, 880];
function riverView(t, C, { ruin = 0, tram = null, haze = 1, driftT = null } = {}) {
  const town = `${hills(560, ['#7e9aa4', '#6a8a8c', '#5a7a74'], { seed: 4, amp: 170, step: 120 })}`;
  const bank = `${skylineBand(-900, 2000, 760, { seed: 5, h: 64, col: ruin ? '#8a969a' : '#6e7e84', haze: '#b6c4c8' })}`;
  const hall = domeHall(330, 900, .78, { ruin });
  const bridge = aioiSide(700, 1900, 850, { tram, s: .9 });
  return `${par(C, .2, skyOpen(t, { drift: (driftT ?? t) * 5 }), SKY_REF)}
    ${par(C, .5, town, TOWN_REF)}${par(C, .62, bank, TOWN_REF)}
    ${par(C, .8, `${hall}${bridge}<path d="M-1400 900 L2500 900 L2500 930 L-1400 930 Z" fill="#7a7468"/>`, TOWN_REF)}
    ${par(C, .86, riverWater(928, 1500, t, `${hall}${bridge}`), TOWN_REF)}
    ${par(C, 1, `${nearBank(1500, t)}`, TOWN_REF)}
    <rect x="-1400" y="400" width="3880" height="600" fill="#cfdcde" opacity="${F1(.16 * haze)}" filter="url(#b40)"/>`;
}

// ---------- a Hiroshima street, 1945 (one-point perspective, looking down the street) ----------
// 3D: X right, Y up, Z away from the camera. cz = camera dolly (negative = pulled back). Horizon at hy.
const P3 = (X, Y, Z, { cz = 0, f = 900, hy = 820, camY = 170, cx = 540 } = {}) => { const z = Math.max(40, Z - cz); return [cx + X * f / z, hy + (camY - Y) * f / z, z]; };
const poly3 = (pts, o) => 'M' + pts.map(p => P3(...p, o)).map(([x, y]) => `${F1(x)} ${F1(y)}`).join(' L') + ' Z';
// one two-storey wooden house front on the left (side = -1) or right (side = 1) of the street, from depth z0 to z1
function machiya(side, z0, z1, o, { seed = 1, lit = 1 } = {}) {
  const R = rng(seed), X = side * 420, H1 = 270, H2 = 520, eave = 70, F = (Y, Z, dx = 0) => [X + side * dx, Y, Z];
  const wood = mix(pick(R, ['#5a4632', '#4a3a2a', '#6a5238', '#3e3226']), '#000', lit > 0 ? 0 : .25), plaster = mix(pick(R, ['#d6ccb6', '#cfc2a6', '#bfb49c']), '#2a2420', lit > 0 ? 0 : .35);
  const roofC = mix('#3e434a', '#000', lit > 0 ? 0 : .2), litK = lit > 0 ? 1 : .55;
  let s = '';
  // the wall planes
  s += `<path d="${poly3([F(0, z0), F(H1, z0), F(H1, z1), F(0, z1)], o)}" fill="${wood}"/>`;
  s += `<path d="${poly3([F(H1 + 20, z0), F(H2, z0), F(H2, z1), F(H1 + 20, z1)], o)}" fill="${plaster}"/>`;
  // lattice (koshi) on the ground floor: vertical slats
  const n = Math.max(4, Math.round((z1 - z0) / 26));
  for (let i = 1; i < n; i++) { const z = lerp(z0, z1, i / n); s += `<path d="M${P3(X, 18, z, o).map(F1).slice(0, 2).join(' ')} L${P3(X, H1 - 30, z, o).map(F1).slice(0, 2).join(' ')}" stroke="${darken(wood, .4)}" stroke-width="${F1(Math.max(.6, 6 * o.f / Math.max(60, z - (o.cz || 0)) * .12))}"/>`; }
  // a noren curtain (indigo, a pale circle crest) over one door
  if (R() < .6) { const za = lerp(z0, z1, .2 + R() * .3), zb = za + (z1 - z0) * .3;
    s += `<path d="${poly3([F(H1 - 10, za, -4), F(H1 - 110, za, -4), F(H1 - 110, zb, -4), F(H1 - 10, zb, -4)], o)}" fill="${pick(R, ['#2e3e5e', '#3a2e2a', '#5a2a24'])}"/>`;
    const c = P3(X + side * 6, H1 - 60, (za + zb) / 2, o); s += `<ellipse cx="${F1(c[0])}" cy="${F1(c[1])}" rx="${F1(18 * o.f / c[2])}" ry="${F1(28 * o.f / c[2])}" fill="#d8d0c0" opacity=".7"/>`; }
  // upper floor: slatted window (mushiko) band
  s += `<path d="${poly3([F(H1 + 70, lerp(z0, z1, .15)), F(H2 - 60, lerp(z0, z1, .15)), F(H2 - 60, lerp(z0, z1, .85)), F(H1 + 70, lerp(z0, z1, .85))], o)}" fill="${darken(wood, .2)}"/>`;
  for (let i = 0; i < 9; i++) { const z = lerp(lerp(z0, z1, .15), lerp(z0, z1, .85), (i + .5) / 9); s += `<path d="M${P3(X, H1 + 74, z, o).slice(0, 2).map(F1).join(' ')} L${P3(X, H2 - 64, z, o).slice(0, 2).map(F1).join(' ')}" stroke="${plaster}" stroke-width="${F1(Math.max(.6, 9 * o.f / (z - (o.cz || 0)) * .1))}" opacity=".7"/>`; }
  // eaves over the ground floor and the roof: tile planes sloping out over the street
  s += `<path d="${poly3([F(H1, z0), F(H1 + 34, z0, -0), F(H1 + 34, z1, 0), F(H1, z1)], o)}" fill="${darken(roofC, .2)}"/>`;
  s += `<path d="${poly3([F(H1 + 40, z0, 0), F(H1 - 6, z0, -eave), F(H1 - 6, z1, -eave), F(H1 + 40, z1, 0)], o)}" fill="${roofC}"/>`;
  s += `<path d="${poly3([F(H2 + 90, z0, 120), F(H2 - 8, z0, -eave), F(H2 - 8, z1, -eave), F(H2 + 90, z1, 120)], o)}" fill="${lighten(roofC, .08 * litK)}"/>`;
  s += `<path d="${poly3([F(H2 - 8, z0, -eave), F(H2 - 22, z0, -eave), F(H2 - 22, z1, -eave), F(H2 - 8, z1, -eave)], o)}" fill="${darken(roofC, .35)}"/>`;
  s += `<path d="${poly3([F(H1 - 6, z0, -eave), F(H1 - 18, z0, -eave), F(H1 - 18, z1, -eave), F(H1 - 6, z1, -eave)], o)}" fill="${darken(roofC, .35)}"/>`;
  s += `<path d="${poly3([F(H2 - 8, z0, 0), F(H2 - 8, z0, -eave), F(H2 - 8, z1, -eave), F(H2 - 8, z1, 0)], o)}" fill="${darken(wood, .45)}"/>`;
  s += `<path d="${poly3([F(H1 - 6, z0, 0), F(H1 - 6, z0, -eave), F(H1 - 6, z1, -eave), F(H1 - 6, z1, 0)], o)}" fill="${darken(wood, .5)}"/>`;
  // tile ridges along the roof (lines in depth)
  for (let k = 1; k < 5; k++) { const a = P3(X + side * lerp(120, -eave, k / 5), lerp(H2 + 90, H2 - 8, k / 5), z0, o), b = P3(X + side * lerp(120, -eave, k / 5), lerp(H2 + 90, H2 - 8, k / 5), z1, o);
    s += `<path d="M${F1(a[0])} ${F1(a[1])} L${F1(b[0])} ${F1(b[1])}" stroke="${darken(roofC, .35)}" stroke-width="1.2" opacity=".6"/>`; }
  return s;
}
// the street with poles and wires; t for nothing (static set); o = projection options (cz dolly)
function street1945(t, o = {}, { sunK = 1 } = {}) {
  o = { cz: 0, f: 900, hy: 820, camY: 170, cx: 540, ...o };
  const R = rng(31); let houses = '', poles = '', wires = '';
  const left = [], right = []; let z = 300; while (z < 9000) { const w = 380 + R() * 320; left.push([z, z + w]); z += w + (R() < .2 ? 120 : 6); }
  z = 300; while (z < 9000) { const w = 380 + R() * 320; right.push([z, z + w]); z += w + (R() < .2 ? 140 : 6); }
  // far to near so near houses overlap
  [...left.map(a => [-1, ...a]), ...right.map(a => [1, ...a])].sort((a, b) => b[2] - a[2]).forEach(([sd, z0, z1], i) => { if (z1 - (o.cz) > 60) houses += machiya(sd, z0, z1, o, { seed: i + 7, lit: sd }); });
  // utility poles every ~900 on the right side, wires converging
  const polesZ = []; for (let pz = 500; pz < 9000; pz += 900) polesZ.push(pz);
  polesZ.slice().reverse().forEach(pz => { const a = P3(330, 0, pz, o), b = P3(330, 820, pz, o), w = Math.max(1, 26 * o.f / Math.max(60, pz - o.cz));
    poles += `<path d="M${F1(a[0])} ${F1(a[1])} L${F1(b[0])} ${F1(b[1])}" stroke="#3a2e24" stroke-width="${F1(w)}"/>`;
    const c1 = P3(220, 780, pz, o), c2 = P3(440, 780, pz, o); poles += `<path d="M${F1(c1[0])} ${F1(c1[1])} L${F1(c2[0])} ${F1(c2[1])}" stroke="#3a2e24" stroke-width="${F1(w * .5)}"/>`; });
  for (const wx of [230, 330, 430]) { let d = ''; polesZ.forEach((pz, i) => { const q = P3(wx, 770, pz, o); d += (i ? ' L' : 'M') + `${F1(q[0])} ${F1(q[1])}`; }); wires += `<path d="${d}" stroke="#2a2420" stroke-width="1.4" fill="none" opacity=".7"/>`; }
  // ground: packed earth, darker ruts, the long shadow of the left side across the road (sun from the left)
  const g0 = P3(-420, 0, 9000, o), g1 = P3(420, 0, 9000, o), g2 = P3(420, 0, 40 + o.cz, o), g3 = P3(-420, 0, 40 + o.cz, o);
  const sh = poly3([[-420, 0, 300], [-420, 0, 9000], [-80, 0, 9000], [-80, 0, 300]], o);
  return `${sky1945({ y0: -800, y1: o.hy + 40, haze: '#d8e2e4', top: '#5a8ec4' })}${cumulus(300, 380, 420, 160, { seed: 21, op: .8 })}${cumulus(900, 300, 360, 130, { seed: 22, op: .7 })}
    ${par({ v: { fx: 540, fy: 960 } }, 1, hills(o.hy - 30, ['#94aab0', '#86a09c'], { seed: 9, amp: 90, step: 120 }))}
    <path d="M-1400 ${F1(o.hy)} L2500 ${F1(o.hy)} L2500 2400 L-1400 2400 Z" fill="#b49a76"/>
    <path d="M${F1(g0[0])} ${F1(g0[1])} L${F1(g1[0])} ${F1(g1[1])} L${F1(g2[0])} ${F1(g2[1])} L${F1(g3[0])} ${F1(g3[1])} Z" fill="#a8906c"/>
    <path d="${sh}" fill="#5a4a3a" opacity="${F1(.35 * sunK)}"/>
    ${[-120, 120].map(rx => `<path d="${poly3([[rx - 14, 0, 300], [rx - 14, 0, 9000], [rx + 14, 0, 9000], [rx + 14, 0, 300]], o)}" fill="#8a7458" opacity=".4"/>`).join('')}
    <g fill="#8a7454" opacity=".35">${Array.from({ length: 220 }, (_, i) => { const R2 = rng(i * 7 + 3), zz = 700 + R2() * 6000, xx = -400 + R2() * 800, q = P3(xx, 0, zz + o.cz, o); return q[1] > o.hy + 2 && q[2] > 500 ? `<ellipse cx="${F1(q[0])}" cy="${F1(q[1])}" rx="${F1(Math.max(.8, 14 * o.f / q[2]))}" ry="${F1(Math.max(.4, 5 * o.f / q[2]))}"/>` : ''; }).join('')}</g>
    ${houses}${poles}${wires}${farFolk(o)}
    <rect x="-1400" y="${F1(o.hy - 300)}" width="3880" height="420" fill="#d8e0e0" opacity=".25" filter="url(#b40)"/>`;
}

// ---------- the wristwatch at 8:15 (ECU): a steel case, cream dial, blued hands; hm = hours as a float ----------
function wristWatch(x, y, s, hm, { secs = 0, glint = 0 } = {}) {
  const ha = (hm % 12) / 12 * 360, ma = (hm * 60 % 60) / 60 * 360, sa = secs / 60 * 360;
  const hand = (a, L, w, col, tail = 10) => `<g transform="rotate(${F1(a)})"><path d="M${-w / 2} ${tail} L${-w * .3} ${-L * .8} L0 ${-L} L${w * .3} ${-L * .8} L${w / 2} ${tail} Z" fill="${col}"/></g>`;
  const ticks = Array.from({ length: 60 }, (_, i) => `<path d="M0 -92 L0 ${i % 5 ? -86 : -76}" stroke="#2a2420" stroke-width="${i % 5 ? 1.4 : 4}" transform="rotate(${i * 6})"/>`).join('');
  return `<g transform="translate(${F1(x)} ${F1(y)}) scale(${s})">
    <g filter="url(#pcl)"><path d="M-46 -150 L46 -150 L40 -96 L-40 -96 Z M-46 150 L46 150 L40 96 L-40 96 Z" fill="#5a3a22"/></g>
    <g filter="url(#pcl)"><circle r="112" fill="url(#steelH)"/></g><circle r="100" fill="#2a2a2a" opacity=".5"/>
    <circle r="98" fill="#ece2c8"/><circle r="98" fill="url(#glassG)" opacity=".4"/>
    ${ticks}
    ${hand(ha, 54, 9, '#1e2a4a', 12)}${hand(ma, 82, 7, '#1e2a4a', 14)}
    <g transform="rotate(${F1(sa)})"><path d="M-1 22 L-1 -88 L1 -88 L1 22 Z" fill="#a8241c"/></g><circle r="5" fill="#1e2a4a"/>
    <path d="M-70 -50 Q-40 -92 10 -96" stroke="#fff" stroke-width="10" fill="none" opacity="${F1(.25 + .5 * glint)}" stroke-linecap="round"/>
    <circle cx="112" cy="0" r="12" fill="url(#steelH)"/></g>`;
}
// a B-29 high in the sky: a tiny silver cross with a contrail; (x, y) world, a = heading (deg), s = size
const b29 = (x, y, a = -12, s = 1, { trail = 1 } = {}) => `<g transform="translate(${F1(x)} ${F1(y)}) rotate(${F1(a)}) scale(${s})">
    ${trail ? `<path d="M-30 0 L-700 0" stroke="#ffffff" stroke-width="5" opacity=".55" filter="url(#b5)"/><path d="M-30 -6 L-640 -6 M-30 6 L-640 6" stroke="#ffffff" stroke-width="2" opacity=".5" filter="url(#b2)"/>` : ''}
    <path d="M-24 0 L26 0" stroke="#d8dee6" stroke-width="5" stroke-linecap="round"/><path d="M-4 -30 L2 30" stroke="#d8dee6" stroke-width="4" stroke-linecap="round"/>
    <path d="M-22 -9 L-20 9" stroke="#d8dee6" stroke-width="3" stroke-linecap="round"/><circle cx="20" cy="0" r="2" fill="#fff"/></g>`;
const parachute = (x, y, s = 1, sway = 0) => `<g transform="translate(${F1(x)} ${F1(y)}) rotate(${F1(sway)}) scale(${s})">
    <path d="M-16 0 Q0 -16 16 0 Z" fill="#f4f4f0"/><path d="M-16 0 L0 22 L16 0 M-6 0 L0 22 L6 0" stroke="#e0e0e0" stroke-width=".8" fill="none"/><rect x="-2" y="22" width="4" height="6" fill="#bbb"/></g>`;

// a few townsfolk far down the street (silhouettes, still), and a bicycle
function farFolk(o) {
  const folk = [[-160, 2600, '#3a3430'], [210, 3300, '#4a4038'], [-60, 4200, '#5a5048'], [120, 5200, '#5a524a']];
  return folk.map(([X, Z, c]) => { const [x, y, z] = P3(X, 0, Z + 0 * o.cz, o), k = o.f / z;
    return `<g transform="translate(${F1(x)} ${F1(y)}) scale(${F1(k)})"><path d="M-22 0 L-18 -90 L-26 -96 L-24 -150 Q0 -160 24 -150 L26 -96 L18 -90 L22 0 L6 0 L0 -70 L-6 0 Z" fill="${c}"/><circle cx="0" cy="-168" r="17" fill="${c}"/></g>`; }).join('') +
    (() => { const [x, y, z] = P3(-330, 0, 1500, o), k = o.f / z; return `<g transform="translate(${F1(x)} ${F1(y)}) scale(${F1(k)})" stroke="#2a2420" stroke-width="5" fill="none"><circle cx="-40" cy="-40" r="38"/><circle cx="60" cy="-40" r="38"/><path d="M-40 -40 L0 -90 L60 -40 M0 -90 L40 -90 M-10 -100 L0 -90 L-20 -40"/></g>`; })();
}
// a leather briefcase; origin = the top of the handle (the grip point); s = scale, rot = swing (deg)
function briefcase(x, y, s = 1, rot = 0) {
  return `<g transform="translate(${F1(x)} ${F1(y)}) rotate(${F1(rot)}) scale(${s})">
    <g filter="url(#pcsl)"><path d="M-34 30 C-34 -4 34 -4 34 30" stroke="#3a2416" stroke-width="12" fill="none" stroke-linecap="round"/></g>
    <g filter="url(#pcl)"><path d="M-170 34 L170 34 Q182 34 182 48 L182 236 Q182 250 168 250 L-168 250 Q-182 250 -182 236 L-182 48 Q-182 34 -170 34 Z" fill="url(#leatherG)"/></g>
    <g filter="url(#pcsl)"><path d="M-182 48 Q-182 34 -170 34 L170 34 Q182 34 182 48 L182 120 Q0 132 -182 120 Z" fill="#5a3a24"/></g>
    <path d="M-170 118 Q0 130 170 118" stroke="#2a180c" stroke-width="2.4" fill="none" opacity=".7"/>
    <g filter="url(#pcsl)"><rect x="-96" y="112" width="26" height="22" rx="3" fill="url(#brassG)"/><rect x="70" y="112" width="26" height="22" rx="3" fill="url(#brassG)"/></g>
    <path d="M-160 60 Q-60 50 60 56" stroke="#fff" stroke-width="5" fill="none" opacity=".12" filter="url(#softW2)"/>
    <path d="M-176 160 L176 160 M-176 200 L176 200" stroke="#2a180c" stroke-width="1.6" stroke-dasharray="6 6" opacity=".4"/></g>`;
}

// ======================= the bomb: fireball, shockwave, field, the cloud =======================
// the mushroom cloud. (x, y) = ground zero, s = scale (H ≈ 1700·s tall when grown), age 0..1 = growth, t = time (rolling),
// glow = the fiery core (fades as it cools), sun = [x, y] direction of the light (screen), seed
function mushroomCloud(x, y, t, { s = 1, age = 1, glow = .6, seed = 3, op = 1, dark = 0, ghost = 0, tint = null, tintK = 0 } = {}) {
  const R = rng(seed), H = 1700 * s * (.35 + .65 * easeOut(age)), Rm = 420 * s * (.3 + .7 * easeOut(age)), rm = 210 * s * (.35 + .65 * easeOut(age));
  const yc = -H * .74, L = [-.55, -.65, .52];                     // cap centre height; the sun direction (x, y, z toward us)
  let lit = mix('#f2ede8', '#8a8a92', dark), mid = mix('#a89c98', '#5a5458', dark), shd = mix('#463c3e', '#1e1a1c', dark); const gl = '#ff8a3a';
  if (tint) { lit = mix(lit, tint, tintK); mid = mix(mid, tint, tintK); shd = mix(shd, tint, tintK * .8); }
  const shade = (nx, ny, nz) => { const d = Math.pow(clamp(nx * L[0] + ny * L[1] + nz * L[2], -1, 1) * .5 + .5, 1.15); return d > .5 ? mix(mid, lit, (d - .5) / .5) : mix(shd, mid, d / .5); };
  const puffs = [];
  // the stem: a rising column of puffs, widening at the foot and at the cap
  const ns = 64;
  for (let i = 0; i < ns; i++) { const u = ((i / ns) + t * .06 + R() * .02) % 1, yy = lerp(0, yc + rm * .3, u);
    const w = s * (120 + 170 * Math.pow(1 - u, 4) + 120 * Math.pow(u, 5)) * (.35 + .65 * easeOut(age)), xx = (R() - .5) * w * .5 + Math.sin(u * 7 + seed) * 22 * s;
    const ang = R() * 6.28, nz = Math.cos(ang), nx = Math.sin(ang);
    puffs.push({ x: xx, y: yy, r: w * (.5 + R() * .25), z: nz * w, c: mix(shade(nx * .8, -.1, nz), '#6a5040', .35 * Math.pow(1 - u, 2)), g: glow * Math.pow(u, 4) * .3 }); }
  // the skirt: a thin collar of light cloud around the stem under the cap
  for (let i = 0; i < 18; i++) { const th = i / 18 * 6.28 + t * .1, rr = Rm * .75, yy = yc + rm * 1.25 + Math.sin(th) * rr * .18;
    puffs.push({ x: Math.cos(th) * rr, y: yy, r: 34 * s * (.6 + .4 * easeOut(age)), z: Math.sin(th) * rr, c: mix(lit, '#ffffff', .2), g: 0, a: .7 * clamp(age * 2 - .6) }); }
  // the cap: a rolling torus — the outside rises, curls over the top and sinks down the middle
  const nt = 18, np = 11;
  for (let i = 0; i < nt; i++) for (let j = 0; j < np; j++) {
    const th = (i + R() * .4) / nt * 6.28, ph = (j / np) * 6.28 + t * .5 + R() * .3;
    const rr = Rm + rm * Math.cos(ph), xx = rr * Math.cos(th), zz = rr * Math.sin(th), yy = yc - rm * Math.sin(ph) * 1.05 + zz * .22;
    const nx = Math.cos(ph) * Math.cos(th), ny = -Math.sin(ph), nz = Math.cos(ph) * Math.sin(th);
    const inner = clamp(-Math.cos(ph) * .7 + Math.sin(ph) * .6);         // the underside / inner curl glows
    puffs.push({ x: xx + (R() - .5) * 30 * s, y: yy, r: rm * (.38 + R() * .26), z: zz + Math.cos(ph) * rm, c: shade(nx, ny, nz), g: glow * inner * inner });
  }
  // a top dome of puffs so the cap reads as a cauliflower, not a ring
  for (let i = 0; i < 26; i++) { const th = R() * 6.28, rr = Rm * Math.sqrt(R()) * .85, xx = rr * Math.cos(th), zz = rr * Math.sin(th);
    puffs.push({ x: xx, y: yc - rm * (.85 + R() * .35) + zz * .2, r: rm * (.36 + R() * .28), z: zz, c: shade(xx / Rm * .6, -.8, zz / Rm * .6), g: 0 }); }
  // the base surge: brown dust rolling out over the ground
  for (let i = 0; i < 40; i++) { const xx = (R() - .5) * 2 * (300 + 1000 * easeOut(age)) * s, w = (60 + R() * 120) * s * (1 - Math.abs(xx) / (1500 * s) * .5);
    puffs.push({ x: xx, y: -w * .45, r: w, z: -2000 + R(), c: mix('#8a7058', '#3a3028', R() * .6 + dark * .3), g: 0, a: .9 }); }
  puffs.sort((a, b) => a.z - b.z);
  const body = puffs.map(p => `<circle cx="${F1(p.x)}" cy="${F1(p.y)}" r="${F1(p.r)}" fill="${p.c}"${p.a != null ? ` opacity="${F1(p.a)}"` : ''}/>`).join('');
  const hot = puffs.filter(p => p.g > .05).map(p => `<circle cx="${F1(p.x)}" cy="${F1(p.y + p.r * .2)}" r="${F1(p.r * .55)}" fill="${gl}" opacity="${F1(Math.min(1, p.g * .8))}"/>`).join('');
  return `<g transform="translate(${F1(x)} ${F1(y)})" opacity="${op}">
    <g filter="url(#cloudF2)">${body}</g>
    ${hot && !ghost ? `<g filter="url(#pe16)" style="mix-blend-mode:screen">${hot}</g>` : ''}
    <g filter="url(#b16)" opacity=".35"><ellipse cx="${F1(-Rm * .3)}" cy="${F1(yc - rm * .8)}" rx="${F1(Rm * .7)}" ry="${F1(rm * .6)}" fill="#ffffff"/></g></g>`;
}
// the fireball on the horizon at the first instant: a white-hot dome with an orange rim (emissive)
const fireball = (x, y, r, k = 1) => `<g filter="url(#pe8)"><circle cx="${F1(x)}" cy="${F1(y)}" r="${F1(r * 1.25)}" fill="#ff8a3a" opacity="${F1(.5 * k)}"/><circle cx="${F1(x)}" cy="${F1(y)}" r="${F1(r)}" fill="#fff4d0" opacity="${F1(k)}"/><circle cx="${F1(x)}" cy="${F1(y)}" r="${F1(r * .7)}" fill="#ffffff" opacity="${F1(k)}"/></g>`;
// a rolling wall of dust coming from the left; front = x of the leading edge; h = height
function dustWall(front, y, h, t, { seed = 4, col = '#7a6250', lightC = '#c8a888', w = 1600 } = {}) {
  const R = rng(seed); let s = '', edge = '';
  for (let i = 0; i < 70; i++) { const u = Math.pow(R(), .7), vy = R(), xx = front - u * w - Math.pow(vy, 2) * 260 + Math.sin(t * 4 + i) * 24, r = h * (.1 + R() * .16) * (1 - .3 * u), yy = y - vy * h * 1.05;
    s += `<circle cx="${F1(xx)}" cy="${F1(yy)}" r="${F1(r)}" fill="${mix(col, '#3a2e26', R() * .45 + u * .2)}"/>`;
    if (u < .1) edge += `<circle cx="${F1(xx + r * .3)}" cy="${F1(yy - r * .3)}" r="${F1(r * .7)}" fill="${lightC}"/>`; }
  let streaks = ''; for (let i = 0; i < 24; i++) { const yy = y - R() * h, L = 200 + R() * 500; streaks += `<path d="M${F1(front - L - R() * 300)} ${F1(yy)} l${F1(L)} ${F1(-20 + R() * 40)}" stroke="${lightC}" stroke-width="${F1(3 + R() * 8)}" opacity="${F1(.15 + .2 * R())}"/>`; }
  return `<rect x="${F1(front - w * 1.8)}" y="${F1(y - h * 1.1)}" width="${F1(w * 1.3)}" height="${F1(h * 1.4)}" fill="${col}" opacity=".9" filter="url(#b40)"/>
    <g filter="url(#cloudF)">${s}</g><g filter="url(#b10)" opacity=".6">${edge}</g><g filter="url(#b5)">${streaks}</g>`;
}
// flying debris (tiles, boards, leaves) carried right by the blast; p = 0..1 progress, (x0, y0)-(x1, y1) region
function debris(t, p, { n = 60, seed = 6, x0 = -300, x1 = 1400, y0 = 300, y1 = 1700, dir = 1, speed = 2400, col = '#2a2420' } = {}) {
  const R = rng(seed); let s = '';
  for (let i = 0; i < n; i++) { const st = R() * .6, life = clamp((p - st) / .5); if (life <= 0 || life >= 1) continue;
    const xx = x0 + R() * (x1 - x0) * .3 + dir * speed * life, yy = y0 + R() * (y1 - y0) + Math.sin(life * 3 + i) * 60 - 120 * life, sz = 4 + R() * 16, rot = life * 900 * (R() - .5);
    s += `<rect x="${F1(-sz)}" y="${F1(-sz * .35)}" width="${F1(sz * 2)}" height="${F1(sz * .7)}" fill="${R() < .3 ? '#5a4632' : col}" transform="translate(${F1(xx)} ${F1(yy)}) rotate(${F1(rot)})"/>`; }
  return s;
}
// falling ash / grit: flakes drifting down (loops)
function ashFall(t, { n = 80, seed = 12, col = '#d8d0c8', size = 4, speed = .18, area = [-300, -400, 1700, 2600], dark = 0 } = {}) {
  const R = rng(seed); let s = '';
  for (let i = 0; i < n; i++) { const x = area[0] + R() * area[2], ph = R(), p = (t * speed * (.6 + R() * .8) + ph) % 1, y = area[1] + p * area[3], sz = size * (.5 + R());
    s += `<ellipse cx="${F1(x + Math.sin(t * 1.3 + i) * 30)}" cy="${F1(y)}" rx="${F1(sz)}" ry="${F1(sz * .6)}" fill="${R() < dark ? '#3a3430' : col}" opacity="${F1(.4 + .4 * R())}" transform="rotate(${F1((t * 60 + i * 40) % 360)} ${F1(x)} ${F1(y)})"/>`; }
  return s;
}
// a potato field seen low across the furrows: rows of leafy plants receding to the horizon hy; wind bends the leaves
function potatoField(t, { hy = 980, rows = 14, seed = 5, wind = 0, dust = 0, near = 2100, x0 = -500, x1 = 1600, sky = '#c8b8a0' } = {}) {
  const R = rng(seed); let s = `<path d="M-1400 ${hy} L2600 ${hy} L2600 2800 L-1400 2800 Z" fill="${mix('#6a5440', sky, .15)}"/>`;
  for (let r = 0; r < rows; r++) {
    const p = r / (rows - 1), y = hy + (near - hy) * Math.pow(p, 2.2), k = .08 + Math.pow(p, 2) * 1.6, haze = Math.pow(1 - p, 2) * .6;
    s += `<path d="M-1400 ${F1(y + 6 * k)} L2600 ${F1(y + 6 * k)}" stroke="${mix('#4a3a2a', sky, haze)}" stroke-width="${F1(10 * k)}" opacity=".5"/>`;
    let x = x0 - R() * 100 * k;
    while (x < x1) { const w = (70 + R() * 50) * k, leaves = [];
      for (let j = 0; j < 7; j++) { const a = -150 + j * 20 + (R() - .5) * 20 + wind * 25 * Math.sin(t * 9 + x * .01 + j), L = (40 + R() * 30) * k;
        const lx = x + Math.cos(a * Math.PI / 180) * L * .6, ly = y + Math.sin(a * Math.PI / 180) * L * .9;
        leaves.push(`<ellipse cx="${F1(lx)}" cy="${F1(ly)}" rx="${F1(L * .55)}" ry="${F1(L * .32)}" transform="rotate(${F1(a + 90)} ${F1(lx)} ${F1(ly)})"/>`); }
      const lc = mix(pick(R, ['#4e6a30', '#5a7a36', '#44602a']), sky, haze), dc = mix(darken(lc, .35), sky, haze);
      s += `<g fill="${dc}" transform="translate(${F1(3 * k)} ${F1(4 * k)})">${leaves.join('')}</g><g fill="${lc}">${leaves.join('')}</g>`;
      if (dust > .01) s += `<g fill="#b8a488" opacity="${F1(.45 * dust)}">${leaves.slice(0, 3).join('')}</g>`;
      x += w * 1.3; }
  }
  return s;
}
// the city on the horizon (low dark skyline), optionally burning: glows and fire columns
function cityHorizon(y, t, { burn = 0, seed = 8, col = '#3a3430', x0 = -600, x1 = 1700 } = {}) {
  let fires = '', smokeC = ''; const R = rng(seed + 50);
  if (burn > .01) for (let i = 0; i < 9; i++) { const fx = x0 + R() * (x1 - x0), fw = 30 + R() * 60; fires += `<ellipse cx="${F1(fx)}" cy="${F1(y - 10)}" rx="${F1(fw)}" ry="${F1(18)}" fill="#ff8a3a" opacity="${F1(.8 * burn * flick(t, i))}"/>`;
    smokeC += smoke(fx, y - 20, t, { seed: i + 3, n: 7, H: 420, drift: 120, r0: 18, r1: 70, col: '#5a4a42', op: .28 * burn, speed: .08, blur: 'b10' }); }
  return `${skylineBand(x0, x1, y, { seed, h: 40, col, haze: mix(col, '#8a7a70', .4), rows: 2 })}
    ${burn > .01 ? `${smokeC}<g filter="url(#pe8)">${fires}</g><rect x="${x0}" y="${y - 120}" width="${x1 - x0}" height="160" fill="#ff7a2a" opacity="${F1(.2 * burn)}" filter="url(#b40)"/>` : ''}`;
}
// a man seen from behind (head and shoulders), for over-the-shoulder shots; burnt = scorched shirt on his left (screen left from behind)
function backBust(x, y, s = 1, { hair = '#17110d', shirt = '#d8d0c0', burnt = 1, turn = 0 } = {}) {
  return `<g transform="translate(${F1(x)} ${F1(y)}) scale(${s})">
    <g filter="url(#pcl)"><path d="M-230 0 C-226 -80 -190 -150 -120 -170 C-80 -180 -50 -186 -40 -210 L40 -210 C50 -186 80 -180 120 -170 C190 -150 226 -80 230 0 Z" fill="${shirt}"/></g>
    ${burnt ? `<g filter="url(#softW)"><ellipse cx="-140" cy="-90" rx="70" ry="50" fill="#4a3020" opacity=".55"/><ellipse cx="-90" cy="-150" rx="40" ry="22" fill="#2a1a10" opacity=".45"/></g>` : ''}
    <g filter="url(#pks_jp)"><path d="M-40 -260 L40 -260 L46 -196 L-46 -196 Z" fill="${SKJ.neck}"/></g>
    <g transform="translate(${F1(turn * 20)} 0)"><g filter="url(#pks_jp)"><ellipse cx="-74" cy="-330" rx="14" ry="26" fill="${SKJ.earDk}"/><ellipse cx="74" cy="-330" rx="14" ry="26" fill="${SKJ.ear}"/></g>
    <g filter="url(#pcsl)"><path d="M-78 -300 C-90 -360 -80 -430 -40 -456 C-10 -470 30 -468 56 -452 C88 -430 92 -360 78 -300 C60 -278 30 -270 0 -270 C-30 -270 -60 -278 -78 -300 Z" fill="${hair}"/></g>
    <path d="M-50 -440 C-20 -456 20 -456 50 -440" stroke="#5a4c42" stroke-width="3" fill="none" opacity=".5"/>
    ${burnt ? `<g filter="url(#softW2)"><ellipse cx="-62" cy="-330" rx="12" ry="20" fill="#b8483a" opacity=".5"/></g>` : ''}</g></g>`;
}

// ======================= the night shelter =======================
// an earthen air-raid shelter: dug walls, timber props, straw on the floor, a candle; through the entrance the burning city
function shelterSet(t, { glow = 1, blur = null } = {}) {
  const R = rng(17); let soil = '';
  for (let i = 0; i < 90; i++) soil += `<ellipse cx="${F1(-200 + R() * 1500)}" cy="${F1(-100 + R() * 1900)}" rx="${F1(10 + R() * 40)}" ry="${F1(6 + R() * 20)}" fill="${pick(R, ['#2a1c14', '#3a2a1e', '#1e140e'])}" opacity=".5"/>`;
  const post = (x, w = 46) => `<g filter="url(#pcl)"><rect x="${x - w / 2}" y="-200" width="${w}" height="2400" fill="#4a3424"/></g><path d="M${x - w / 2 + 8} -200 L${x - w / 2 + 8} 2200" stroke="#6a4c34" stroke-width="5" opacity=".5"/>`;
  return `<g ${blur ? `filter="url(#${blur})"` : ''}>
    <rect x="-400" y="-400" width="1880" height="2800" fill="#24180f"/>${soil}
    <path d="M300 1150 L300 640 Q540 520 780 640 L780 1150 Z" fill="#2a1408"/>
    <g filter="url(#pe8)"><path d="M330 1150 L330 660 Q540 560 750 660 L750 1150 Z" fill="#8e2a22" opacity="${F1(.8 * glow)}"/></g>
    <g filter="url(#pe16)"><ellipse cx="540" cy="1020" rx="200" ry="150" fill="#d0503c" opacity="${F1(.5 * glow * flick(t, 3))}"/></g>
    <g filter="url(#b16)" opacity=".55">${smoke(480, 1060, t, { seed: 21, n: 8, H: 500, drift: 120, r0: 60, r1: 180, col: '#1a0e0a', op: .8, speed: .05, blur: 'b10' })}</g>
    ${skylineBand(330, 750, 1060, { seed: 33, h: 50, col: '#1a0c06', haze: '#3a1a0a', rows: 2 })}
    ${embers(540, 1060, 300, 500, t, { seed: 4, n: 16, speed: .3, size: 4 })}
    <path d="M260 1150 L260 600 L820 600 L820 1150" fill="none" stroke="#3a2818" stroke-width="40"/>
    ${post(150, 60)}${post(930, 60)}
    <g filter="url(#pcl)"><rect x="-200" y="400" width="1480" height="70" fill="#3e2c1e"/></g>
    <g filter="url(#pcl)"><rect x="-200" y="-200" width="1480" height="260" fill="#2e2016"/></g>
    ${Array.from({ length: 12 }, (_, i) => `<path d="M${-200 + i * 130} 60 L${-200 + i * 130} -200" stroke="#1a120c" stroke-width="4" opacity=".6"/>`).join('')}
    <path d="M-400 1500 L1480 1500 L1480 2400 L-400 2400 Z" fill="#3e2e1c"/>
    <g stroke="#6a5634" stroke-width="3" opacity=".5">${Array.from({ length: 70 }, (_, i) => { const R2 = rng(i + 70), x = -300 + R2() * 1700, y = 1510 + R2() * 700; return `<path d="M${F1(x)} ${F1(y)} l${F1(30 + R2() * 50)} ${F1((R2() - .5) * 14)}"/>`; }).join('')}</g></g>`;
}
// huddled people in the dark: blanket-wrapped shapes with bowed heads (silhouettes catching the candle on one edge)
function huddled(x, y, s = 1, { seed = 1, lit = '#6a4a30' } = {}) {
  const R = rng(seed), col = pick(R, ['#2a2420', '#2e2a26', '#262220']);
  return `<g transform="translate(${F1(x)} ${F1(y)}) scale(${s})">
    <path d="M-150 0 C-160 -120 -120 -230 -40 -260 C-20 -300 30 -310 60 -280 C120 -250 160 -140 150 0 Z" fill="${col}"/>
    <ellipse cx="10" cy="-292" rx="44" ry="50" fill="${darken(col, .2)}"/>
    <path d="M-40 -260 C-120 -230 -160 -120 -150 0" stroke="${lit}" stroke-width="6" fill="none" opacity=".5" filter="url(#b2)"/></g>`;
}
// a candle on an upturned box: the flame is emissive; (x, y) = base of the candle
const candle = (x, y, t, s = 1) => `<g filter="url(#pcl)"><rect x="${F1(x - 90 * s)}" y="${F1(y)}" width="${F1(180 * s)}" height="${F1(140 * s)}" fill="#4a3624"/></g>
  <g filter="url(#pcs)"><rect x="${F1(x - 11 * s)}" y="${F1(y - 70 * s)}" width="${F1(22 * s)}" height="${F1(70 * s)}" fill="#e8dcc0"/></g>
  <g filter="url(#pe2)">${fire(x, y - 70 * s, 12 * s, 40 * s, t, { seed: 5, n: 3, intensity: 1, glow: 1.2 })}</g>`;

// ======================= the station and the trains =======================
// a steam locomotive (D51-like), side view, facing right; (x, y) = rail level under the front; s = scale; wheel phase from x
function locomotive(x, y, s = 1, { t = 0, roll = 0, steam = 1 } = {}) {
  const wa = roll / (52 * s) * 180 / Math.PI;     // driving wheel angle from distance rolled
  const wheel = (cx, r, a) => `<g transform="translate(${cx} ${-r}) rotate(${F1(a)})"><circle r="${r}" fill="#1a1a1c"/><circle r="${r - 7}" fill="#2a2a2e"/><circle r="${r * .3}" fill="#3a3a40"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<path d="M0 0 L${F1(Math.cos(i * .785) * (r - 8))} ${F1(Math.sin(i * .785) * (r - 8))}" stroke="#111" stroke-width="5"/>`).join('')}<circle r="${r}" fill="none" stroke="#7a2a22" stroke-width="3" opacity=".6"/></g>`;
  const crank = Math.sin(wa * Math.PI / 180) * 14, crankY = Math.cos(wa * Math.PI / 180) * 14;
  return `<g transform="translate(${F1(x)} ${F1(y)}) scale(${s})">
    <g filter="url(#pcl)">
      <path d="M-760 -150 L-470 -150 L-470 -330 L-760 -330 Z" fill="#1e1e22"/>
      <path d="M-470 -380 L-280 -380 L-280 -150 L-470 -150 Z" fill="#222226"/><path d="M-490 -390 L-260 -390 L-260 -370 L-490 -370 Z" fill="#141416"/>
      <path d="M-280 -310 L40 -310 Q60 -310 60 -290 L60 -170 L-280 -170 Z" fill="#2a2a30"/>
      <path d="M40 -330 Q90 -330 96 -280 L96 -170 L40 -170 Z" fill="#26262c"/>
      <path d="M-40 -310 L-40 -350 Q-40 -366 -24 -366 L-4 -366 Q12 -366 12 -350 L12 -310 Z" fill="#26262a"/>
      <path d="M-200 -310 L-200 -340 Q-200 -356 -170 -356 L-130 -356 Q-100 -356 -100 -340 L-100 -310 Z" fill="#26262a"/>
      <path d="M-760 -150 L120 -150 L120 -120 L-760 -120 Z" fill="#141416"/></g>
    <path d="M-430 -350 L-320 -350 L-320 -290 L-430 -290 Z" fill="#c8a050" opacity=".25"/><path d="M-430 -350 L-320 -350 L-320 -290 L-430 -290 Z" fill="none" stroke="#3a3a40" stroke-width="4"/>
    <path d="M-280 -296 L40 -296" stroke="#5a5a64" stroke-width="3" opacity=".7"/><path d="M-280 -240 L40 -240" stroke="#5a5a64" stroke-width="2" opacity=".5"/>
    <circle cx="96" cy="-250" r="36" fill="#1a1a1e" stroke="#3a3a44" stroke-width="4"/><circle cx="96" cy="-250" r="6" fill="#5a5a60"/>
    <rect x="88" y="-200" width="22" height="12" fill="#7a2a22"/><circle cx="104" cy="-318" r="10" fill="#e8e0b0" opacity=".9"/>
    ${wheel(-690, 46, wa * .8)}${wheel(-590, 46, wa * .8)}${wheel(-370, 70, wa)}${wheel(-220, 70, wa)}${wheel(-70, 70, wa)}${wheel(70, 40, wa * 1.6)}
    <path d="M${F1(-370 + crank)} ${F1(-70 + crankY)} L${F1(-70 + crank)} ${F1(-70 + crankY)}" stroke="#8a8a94" stroke-width="9" stroke-linecap="round"/>
    <path d="M${F1(-70 + crank)} ${F1(-70 + crankY)} L60 -110" stroke="#8a8a94" stroke-width="8" stroke-linecap="round"/>
    <path d="M30 -140 L110 -140 L110 -90 L30 -90 Z" fill="#1e1e22"/>
    <path d="M-760 -10 L130 -10" stroke="#3a3632" stroke-width="6"/></g>
    ${steam ? `<g opacity="${F1(steam)}">${smoke(x - 14 * s, y - 380 * s, t, { seed: 21, n: 10, H: 600 * s, drift: -500 * s, r0: 30 * s, r1: 180 * s, col: '#e8e6e2', op: .85, speed: .5, blur: 'b10' })}
      ${smoke(x - 260 * s, y - 20 * s, t, { seed: 23, n: 7, H: 120 * s, drift: -260 * s, r0: 30 * s, r1: 120 * s, col: '#f0eeea', op: .6, speed: .7, blur: 'b16' })}</g>` : ''}`;
}
// a passenger carriage (side view), length 820; windows lit from inside; (x, y) = rail level at its front
function carriage(x, y, s = 1, { roll = 0, col = '#4a3426' } = {}) {
  const wa = roll / (40 * s) * 180 / Math.PI;
  const bogie = cx => `<g transform="translate(${cx} 0)"><circle cx="-50" cy="-40" r="38" fill="#141416"/><circle cx="50" cy="-40" r="38" fill="#141416"/>
    <path d="M${F1(-50 + Math.cos(wa * .0174) * 30)} ${F1(-40 + Math.sin(wa * .0174) * 30)} L-50 -40 M${F1(50 + Math.cos(wa * .0174) * 30)} ${F1(-40 + Math.sin(wa * .0174) * 30)} L50 -40" stroke="#3a3a40" stroke-width="5"/><rect x="-80" y="-70" width="160" height="20" fill="#1e1e22"/></g>`;
  return `<g transform="translate(${F1(x)} ${F1(y)}) scale(${s})">
    <g filter="url(#pcl)"><path d="M-820 -330 Q-820 -360 -790 -364 L-30 -364 Q0 -360 0 -330 L0 -90 L-820 -90 Z" fill="${col}"/>
      <path d="M-830 -364 Q-410 -400 10 -364 L10 -350 Q-410 -386 -830 -350 Z" fill="#2a2a2c"/></g>
    ${Array.from({ length: 9 }, (_, i) => `<rect x="${-790 + i * 84}" y="-300" width="60" height="80" rx="6" fill="#2a2c30"/><rect x="${-786 + i * 84}" y="-296" width="20" height="72" fill="#8aa0b0" opacity=".25"/>`).join('')}
    <path d="M-820 -200 L0 -200" stroke="${darken(col, .35)}" stroke-width="4"/>${bogie(-660)}${bogie(-160)}</g>`;
}
// the platform + the station: concrete edge, broken canopy, people with bundles (silhouettes); x0 = scroll
function stationSet(t, { scroll = 0, smokeK = 1 } = {}) {
  // refugees shuffling along the platform: stooped, padded air-raid hoods or headscarves, baggy work trousers, bundles on
  // their backs, now and then a child by the hand
  const R = rng(41); let folk = '';
  for (let i = 0; i < 9; i++) { const sp = 26 + R() * 26, x = -200 + i * 190 + R() * 60 - scroll * .9 - (t - 23.3) * sp, y = 1640 + R() * 40, s = .95 + R() * .3;
    const c = pick(R, ['#4e4640', '#5a5048', '#463e38', '#544a40']), cl = pick(R, ['#7e6e5a', '#6e6254', '#8a7c66']), ph = t * (2.6 + R()) + i * 1.7, st = Math.sin(ph) * 12, bob = Math.abs(Math.cos(ph)) * 4;
    const kind = R(), lean = 6 + R() * 8;
    const head = kind < .45 ? `<path d="M-36 -250 C-40 -300 -28 -330 0 -332 C28 -330 40 -300 36 -250 C30 -236 -30 -236 -36 -250 Z" fill="${mix(cl, c, .4)}"/><ellipse cx="4" cy="-288" rx="15" ry="19" fill="${mix(c, '#8a7058', .35)}"/>`
      : kind < .7 ? `<circle cx="0" cy="-290" r="25" fill="${c}"/><path d="M-27 -292 Q0 -326 27 -292 L30 -270 Q0 -282 -30 -270 Z" fill="${cl}"/>` : `<circle cx="0" cy="-290" r="25" fill="${c}"/>`;
    const body = `<path d="M-34 -254 Q0 -266 34 -254 L38 -150 Q42 -80 ${F1(30 + st)} -4 L${F1(8 + st)} -4 L4 -84 L-4 -84 L${F1(-8 - st)} -4 L${F1(-30 - st)} -4 Q-42 -80 -38 -150 Z" fill="${c}"/>
      <path d="M-34 -248 C-44 -210 -46 -180 ${F1(-40 - st * .3)} -150 M34 -248 C44 -210 46 -180 ${F1(40 + st * .3)} -150" stroke="${c}" stroke-width="16" stroke-linecap="round" fill="none"/>`;
    const bundle = R() < .75 ? `<path d="M26 -262 C70 -270 86 -240 84 -200 C82 -164 60 -150 30 -156 Z" fill="${cl}"/><path d="M30 -258 C46 -236 50 -206 36 -170" stroke="${darken(cl, .3)}" stroke-width="4" fill="none"/>` : '';
    folk += `<g transform="translate(${F1(x)} ${F1(y)}) scale(${F1(s)})"><ellipse cx="0" cy="0" rx="60" ry="10" fill="#3a3632" opacity=".4"/>
      <g transform="translate(0 ${F1(-bob)}) rotate(${F1(-lean)} 0 -120)">${body}${bundle}${head}</g>
      ${kind > .86 ? `<g transform="translate(-80 0) scale(.56)"><g transform="translate(0 ${F1(-bob)})"><path d="M-30 -250 Q0 -262 30 -250 L34 -150 Q36 -80 ${F1(26 - st)} -4 L${F1(6 - st)} -4 L0 -84 L${F1(-6 + st)} -4 L${F1(-26 + st)} -4 Q-36 -80 -34 -150 Z" fill="${c}"/><circle cx="0" cy="-286" r="30" fill="${c}"/><path d="M30 -236 L80 -190" stroke="${c}" stroke-width="14" stroke-linecap="round"/></g></g>` : ''}</g>`; }
  return `${sky1945({ y0: -400, y1: 1300, top: '#8a8a90', haze: '#c8b8a4' })}
    ${hills(1180, ['#8a8a84', '#7a7a72'], { seed: 12, amp: 120 })}
    <rect x="-400" y="700" width="1880" height="600" fill="#b8a898" opacity=".35" filter="url(#b40)"/>
    ${smoke(200 - scroll * .3, 1280, t, { seed: 5, n: 10, H: 900, drift: 200, r0: 140, r1: 420, col: '#8a8078', op: .3 * smokeK, speed: .04, blur: 'b40' })}
    <path d="M-400 1500 L1480 1500 L1480 2400 L-400 2400 Z" fill="#6a665e"/><path d="M-400 1500 L1480 1500 L1480 1530 L-400 1530 Z" fill="#9a968c"/>
    <g transform="translate(${F1(-scroll * .95)} 0)">
      ${Array.from({ length: 8 }, (_, i) => `<g filter="url(#pcl)"><rect x="${-200 + i * 400}" y="200" width="26" height="1300" fill="#3a3632"/></g>`).join('')}
      <path d="M-300 200 L2900 200 L2900 240 L-300 240 Z" fill="#2a2826"/>
      ${Array.from({ length: 16 }, (_, i) => `<path d="M${-300 + i * 200} 200 L${-260 + i * 200 + (i % 3 ? 0 : 40)} ${i % 4 === 1 ? 300 : 160}" stroke="#2a2826" stroke-width="10"/>`).join('')}</g>
    <g filter="url(#b5)">${folk}</g>`;
}
// countryside (for the train shots): paddies, hills, telegraph poles; scroll = distance travelled (parallax)
function countryside(t, scroll, { hy = 900, seed = 3 } = {}) {
  const R = rng(seed); let pad = '', poles = '';
  for (let i = 0; i < 12; i++) { const y = hy + 20 + i * i * 9, h = 10 + i * 6; pad += `<path d="M-400 ${y} L1480 ${y}" stroke="#6a8a4a" stroke-width="${h * .2}" opacity=".5"/>`; }
  const pw = 520; for (let i = -1; i < 5; i++) { const x = ((i * pw - scroll * 1.2) % (pw * 4) + pw * 4) % (pw * 4) - 300; poles += `<path d="M${F1(x)} ${hy - 260} L${F1(x)} ${hy + 140}" stroke="#3a2e24" stroke-width="10"/><path d="M${F1(x - 40)} ${hy - 240} L${F1(x + 40)} ${hy - 240}" stroke="#3a2e24" stroke-width="6"/>`; }
  return `${sky1945({ y0: -400, y1: hy + 40, top: '#6a90b8', haze: '#d8dcd4' })}
    ${cumulus(((300 - scroll * .05) % 1600 + 1600) % 1600 - 200, hy - 300, 500, 180, { seed: 31, op: .85 })}
    <g transform="translate(${F1(-(scroll * .15) % 1200)} 0)">${hills(hy - 40, ['#7a9a8a', '#6a8a6e'], { seed: 7, amp: 140 })}</g>
    <path d="M-400 ${hy} L1480 ${hy} L1480 2400 L-400 2400 Z" fill="#7a9a52"/>
    <g transform="translate(${F1(-(scroll * .6) % 300)} 0)">${pad}</g>${poles}`;
}
// a photograph: Hisako with the baby (sepia, white border, a slight curl). In the normal pass: a flat sheet.
addDefs(`<filter id="sepiaF" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values=".39 .77 .19 0 0  .35 .69 .17 0 0  .27 .53 .13 0 0  0 0 0 1 0"/><feComponentTransfer><feFuncR type="linear" slope=".92" intercept=".04"/><feFuncG type="linear" slope=".88" intercept=".03"/><feFuncB type="linear" slope=".8" intercept=".02"/></feComponentTransfer></filter>`);
function photoHisako(x, y, s = 1, { rot = -4, t = 0 } = {}) {
  const inner = PASS() === 'normal' ? '' : `<g filter="url(#sepiaF)"><rect x="-150" y="-200" width="300" height="400" fill="#8a7a6a"/>
      <rect x="-150" y="-200" width="300" height="400" fill="#b8a890"/><ellipse cx="-60" cy="-120" rx="120" ry="90" fill="#d8ccb4" opacity=".6" filter="url(#b16)"/>
      <g transform="translate(16 690) scale(.72)">${P(HISAKO, { smirk: .45, lid: .15, look: 2, tilt: -4 })}</g>
      <g transform="translate(-34 160) rotate(-18)">${babyWrap(0, 0, .82)}</g></g>
    <rect x="-150" y="-200" width="300" height="400" fill="#f0e0c0" opacity=".12"/>`;
  return `<g transform="translate(${F1(x)} ${F1(y)}) rotate(${F1(rot)}) scale(${s})">
    <g filter="url(#pcl)"><rect x="-180" y="-232" width="360" height="470" rx="4" fill="#ece4d2"/></g>
    <clipPath id="phc"><rect x="-150" y="-200" width="300" height="400"/></clipPath><g clip-path="url(#phc)">${inner}</g>
    <path d="M-176 -228 L170 -228" stroke="#fff" stroke-width="3" opacity=".5"/></g>`;
}

// ======================= Nagasaki harbour =======================
// the long harbour between steep hills: houses packed up the slopes (white walls, grey tile), the shipyard on the right
// (a hammerhead crane, a hull on the slip, sheds), sampans and their wakes on the water, gulls
function nagasakiView(t, C, { haze = 1 } = {}) {
  const shore = 1080, hy = x => shore - 20 - 400 * Math.exp(-Math.pow((x - 200) / 520, 2)) - 250 * Math.exp(-Math.pow((x - 1350) / 480, 2)) - 120 * Math.exp(-Math.pow((x + 700) / 400, 2)) - 18 * Math.sin(x * .02);
  let hillD = `M-1400 ${shore + 40}`; for (let x = -1400; x <= 2500; x += 40) hillD += ` L${x} ${F1(hy(x))}`; hillD += ` L2500 ${shore + 40} Z`;
  // houses: rows up the slope, back (high, small, hazy) to front (low, larger)
  const R = rng(61); let houses = '';
  for (let r = 0; r < 16; r++) { const p = r / 15; let x = -900 + R() * 40;
    while (x < 1900) { const top = hy(x), y = lerp(top + 30, shore - 6, p), sc = .55 + .55 * p, w = (34 + R() * 34) * sc, h = (16 + R() * 12) * sc, rf = (12 + R() * 6) * sc;
      if (y > top + 18 && !(x > 900 && x < 1600 && p > .55) && R() < .86) {
        const hz = (1 - p) * .55, wall = mix(pick(R, ['#e6e0d2', '#d8d0c0', '#c8bea8', '#8a7a64']), '#c8d2d4', hz), roof = mix(pick(R, ['#4e545c', '#5a5e64', '#444a52', '#5e5048']), '#a8b4b8', hz);
        houses += `<rect x="${F1(x)}" y="${F1(y - h)}" width="${F1(w)}" height="${F1(h)}" fill="${wall}"/><path d="M${F1(x - 4 * sc)} ${F1(y - h)} L${F1(x + w * .2)} ${F1(y - h - rf)} L${F1(x + w * .8)} ${F1(y - h - rf)} L${F1(x + w + 4 * sc)} ${F1(y - h)} Z" fill="${roof}"/>`;
        if (R() < .3) houses += `<rect x="${F1(x + w * .3)}" y="${F1(y - h * .7)}" width="${F1(w * .16)}" height="${F1(h * .4)}" fill="${mix('#3a3a3a', '#c8d2d4', hz)}"/>`;
        if (R() < .12) houses += `<circle cx="${F1(x + w + 10 * sc)}" cy="${F1(y - h)}" r="${F1(14 * sc)}" fill="${mix('#4a6a42', '#a8b8b0', hz)}"/>`; }
      x += w + (6 + R() * 26) * sc; } }
  // a small church with a spire on the left slope
  const church = `<g transform="translate(-160 ${F1(lerp(hy(-160) + 30, shore, .35))}) scale(.9)"><rect x="-40" y="-60" width="80" height="60" fill="#ece6da"/><path d="M-46 -60 L0 -92 L46 -60 Z" fill="#4e545c"/>
    <rect x="-16" y="-130" width="32" height="70" fill="#ece6da"/><path d="M-20 -130 L0 -190 L20 -130 Z" fill="#4e545c"/><path d="M0 -190 L0 -214 M-8 -204 L8 -204" stroke="#3a3a3a" stroke-width="3"/></g>`;
  // the shipyard: sheds with sawtooth roofs, a hull on the slip in scaffolding, a hammerhead crane
  const sheds = Array.from({ length: 4 }, (_, i) => { const x = 930 + i * 150; return `<rect x="${x}" y="${shore - 90}" width="140" height="90" fill="#7e8288"/>${[0, 1, 2, 3].map(j => `<path d="M${x + j * 35} ${shore - 90} L${x + j * 35 + 35} ${shore - 120} L${x + j * 35 + 35} ${shore - 90} Z" fill="#5a5e64"/>`).join('')}<rect x="${x + 10}" y="${shore - 60}" width="120" height="16" fill="#3e4248" opacity=".6"/>`; }).join('');
  // a cargo ship moored at the yard's quay: dark hull, red boot-topping, the bridge amidships, a funnel, masts and booms
  const hull = `<g transform="translate(1180 ${shore + 34})">
      <path d="M-380 0 L-400 -96 L-360 -100 L330 -100 L400 -120 L380 -40 L340 0 Z" fill="#2e3236"/><path d="M-384 -16 L360 -16 L340 0 L-380 0 Z" fill="#7a3a30"/>
      <path d="M-400 -96 L-360 -100 L330 -100 L400 -120" stroke="#8a9096" stroke-width="4" fill="none"/>
      <path d="M-90 -100 L-90 -170 L70 -170 L70 -100 Z" fill="#e2dccc"/><path d="M-70 -170 L-70 -206 L50 -206 L50 -170 Z" fill="#d8d2c2"/>
      ${[0, 1, 2, 3, 4].map(i => `<rect x="${-80 + i * 30}" y="-160" width="18" height="14" fill="#3a4048"/>`).join('')}${[0, 1, 2].map(i => `<rect x="${-60 + i * 36}" y="-198" width="22" height="14" fill="#3a4048"/>`).join('')}
      <path d="M100 -100 L104 -200 L148 -200 L152 -100 Z" fill="#1e2024"/><rect x="100" y="-190" width="50" height="14" fill="#b8a070"/>
      <path d="M-260 -100 L-260 -300 M240 -100 L240 -280 M-260 -260 L-170 -110 M240 -250 L320 -104" stroke="#2a2c30" stroke-width="5" fill="none"/>
      <path d="M-260 -300 L-90 -206 M240 -280 L50 -206" stroke="#2a2c30" stroke-width="1.5" opacity=".7"/></g>`;
  const crane = (x, y, s, jib) => `<g transform="translate(${x} ${y}) scale(${s})" stroke="#2e3034" fill="none">
      <path d="M-30 0 L-14 -520 M30 0 L14 -520 M-14 -520 L14 -520" stroke-width="10"/>${Array.from({ length: 10 }, (_, i) => `<path d="M${F1(-30 + i * 1.6)} ${-i * 52} L${F1(30 - (i + 1) * 1.6)} ${-(i + 1) * 52}" stroke-width="4"/>`).join('')}
      <g transform="rotate(${F1(jib)} 0 -540)"><path d="M-380 -540 L300 -540 M-380 -572 L180 -572 L300 -540 M-380 -540 L-380 -572" stroke-width="12"/>${Array.from({ length: 12 }, (_, i) => `<path d="M${-370 + i * 50} -542 L${-350 + i * 50} -570" stroke-width="3"/>`).join('')}
        <rect x="-420" y="-590" width="70" height="60" fill="#3a3c40" stroke="none"/><path d="M220 -540 L220 -380" stroke-width="2.5"/><path d="M206 -380 L234 -380 L230 -360 L210 -360 Z" fill="#2e3034" stroke="none"/></g></g>`;
  const town = `<path d="${hillD}" fill="#6e8a72"/><g filter="url(#b2)" fill="#5a7a5e" opacity=".5">${Array.from({ length: 160 }, (_, i) => { const R2 = rng(i + 600), x = -900 + R2() * 2800; return `<circle cx="${F1(x)}" cy="${F1(hy(x) + 10 + R2() * 90)}" r="${F1(6 + R2() * 12)}"/>`; }).join('')}</g>
    ${houses}${church}${sheds}`;
  // the water: hills mirrored, ripples, boats with wakes
  const boats = [[(t * 18) % 2400 - 700, 1300, .9], [1500 - (t * 12) % 2400, 1420, 1.1], [(t * 9 + 900) % 2400 - 600, 1220, .7]].map(([x, y, s]) => `<g transform="translate(${F1(x)} ${y}) scale(${s})">
      <path d="M-60 0 L60 0 L46 14 L-50 14 Z" fill="#3a2e26"/><path d="M-10 0 L-10 -30 L10 -30 L10 0 Z" fill="#5a4a3a"/><circle cx="24" cy="-16" r="8" fill="#2a2420"/><path d="M24 -8 L22 0" stroke="#2a2420" stroke-width="8"/>
      <path d="M-62 16 L-160 40 M-62 16 L-150 6" stroke="#e8f0f0" stroke-width="3" opacity=".45"/></g>`).join('');
  // a fishing boat nearer us, puttering left with a wake and a little smoke from its stack
  const bx = 980 - (t - 28.98) * 46, near = `<g transform="translate(${F1(bx)} ${F1(1520 + Math.sin(t * 1.7) * 3)}) rotate(${F1(Math.sin(t * 1.3) * 1.2)})">
      <path d="M-240 6 L-120 30 L170 30 L230 -6 L200 -16 L-220 -10 Z" fill="#4a3a30"/><path d="M-226 -8 L200 -14 L224 -8" stroke="#c8b8a0" stroke-width="5" fill="none"/>
      <path d="M-110 -14 L-110 -78 L40 -78 L40 -14 Z" fill="#d8d0c0"/><path d="M-120 -78 L50 -78 L40 -94 L-110 -94 Z" fill="#5a4a40"/>
      ${[0, 1, 2].map(i => `<rect x="${-96 + i * 44}" y="-66" width="26" height="22" fill="#3a4048"/>`).join('')}
      <rect x="70" y="-120" width="18" height="106" fill="#3a3230"/><path d="M110 -14 L110 -150 M110 -150 L160 -20" stroke="#3a3230" stroke-width="5"/>
      <path d="M230 -6 L330 40 M230 -6 L320 -30" stroke="#e8f0f0" stroke-width="5" opacity=".5"/></g>
    ${smoke(bx + 79, 1400, t, { seed: 5, n: 8, H: 260, drift: 120, r0: 14, r1: 60, col: '#8a8a8a', op: .35, speed: .25, blur: 'b10' })}`;
  const water = `${riverWater(shore, 1700, t, `<g opacity=".8">${town}</g>`, { col: '#4e6e7a', far: '#9ab0b6', seed: 8 })}${hull}${boats}${near}`;
  const gulls = [0, 1, 2].map(i => { const x = (t * (40 + i * 12) + i * 300) % 1600 - 200, y = 420 + i * 70 + Math.sin(t * 1.3 + i) * 20, f = Math.sin(t * 9 + i * 2) * 10;
    return `<path d="M${F1(x - 18)} ${F1(y - f * .4)} Q${F1(x - 8)} ${F1(y - 8 - f)} ${F1(x)} ${F1(y)} Q${F1(x + 8)} ${F1(y - 8 - f)} ${F1(x + 18)} ${F1(y - f * .4)}" stroke="#2a2a2c" stroke-width="3" fill="none"/>`; }).join('');
  return `${par(C, .2, `${sky1945({ y0: -1400, y1: 1000, top: '#5a7a9e', haze: '#d4d8d4' })}${cumulus(250, 520, 560, 220, { seed: 41 })}${cumulus(860, 380, 420, 170, { seed: 43, op: .9 })}${cumulus(-120, 300, 380, 160, { seed: 47, op: .8 })}`, [540, 960])}
    ${par(C, .4, hills(780, ['#9aaca8', '#8a9e98'], { seed: 23, amp: 220, step: 120 }), [540, 960])}
    ${par(C, .6, `${town}${crane(1010, shore, 1.0, Math.sin(t * .3) * 2)}`, [540, 960])}
    ${par(C, .6, `<rect x="-1400" y="${shore}" width="3880" height="700" fill="#4e6e7a"/>${water}`, [540, 960])}
    ${par(C, 1, `<path d="M-1400 1700 L2500 1700 L2500 2600 L-1400 2600 Z" fill="#4a4a46"/><path d="M-1400 1700 L2500 1700 L2500 1730 L-1400 1730 Z" fill="#7a786e"/>
      ${Array.from({ length: 8 }, (_, i) => `<rect x="${-300 + i * 220}" y="1676" width="18" height="40" fill="#3a3832"/>`).join('')}`, [540, 960])}
    ${gulls}<rect x="-1400" y="700" width="3880" height="500" fill="#d0d8d8" opacity="${F1(.2 * haze)}" filter="url(#b40)"/>`;
}
// ======================= the Nagasaki office, 9 August 1945 =======================
// window with wartime anti-blast tape (an X of paper strips), seen from inside; white = 0..1 the flash outside
function tapedWindow(x, y, w, h, { white = 0, sky = '#a8bcc8', broken = 0, t = 0 } = {}) {
  const pane = (px, py, pw, ph) => `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" fill="${mix(sky, '#ffffff', white)}"/>
    ${broken ? '' : `<path d="M${px} ${py} L${px + pw} ${py + ph} M${px + pw} ${py} L${px} ${py + ph}" stroke="#e8e0cc" stroke-width="10" opacity="${F1(.9 * (1 - white))}"/>`}`;
  const cols = 3, rows = 2, gw = w / cols, gh = h / rows;
  let panes = ''; for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) panes += pane(x + i * gw + 8, y + j * gh + 8, gw - 16, gh - 16);
  const outside = `<g opacity="${F1(1 - white)}">${hills(y + h * .62, ['#8aa096', '#7a9488'], { seed: 51, amp: 60, step: 80 }).replace(/-1400/g, String(x)).replace(/2500/g, String(x + w))}</g>`;
  return `<g filter="url(#pcl)"><rect x="${x - 26}" y="${y - 26}" width="${w + 52}" height="${h + 52}" fill="#5a422e"/></g>
    <clipPath id="twc${Math.round(x)}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath>
    <g clip-path="url(#twc${Math.round(x)})">${panes}${outside}</g>
    ${white > .01 ? `<g filter="url(#pe8)"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#ffffff" opacity="${F1(white)}"/></g>` : ''}
    ${Array.from({ length: cols - 1 }, (_, i) => `<rect x="${x + (i + 1) * gw - 8}" y="${y}" width="16" height="${h}" fill="#5a422e"/>`).join('')}<rect x="${x}" y="${y + gh - 8}" width="${w}" height="16" fill="#5a422e"/>`;
}
// a desk: top in perspective (a slanted plane), front panel, drawers; papers, a drafting board, a lamp optional
function desk(x, y, w, s = 1, { papers = 1, board = 0, lamp = 0, seed = 1, tilt = 0 } = {}) {
  const R = rng(seed), d = 120;
  let pp = ''; for (let i = 0; i < papers * 5; i++) { const px = -w / 2 + 30 + R() * (w - 160), py = -d + 20 + R() * (d - 40); pp += `<path d="M${F1(px)} ${F1(py)} l90 -6 l8 50 l-90 6 Z" fill="${pick(R, ['#ece6d6', '#e4dcc8', '#f2ecdc'])}" transform="rotate(${F1((R() - .5) * 20)} ${F1(px)} ${F1(py)})"/>`; }
  return `<g transform="translate(${F1(x)} ${F1(y)}) rotate(${F1(tilt)}) scale(${s})">
    <g filter="url(#pcl)"><path d="M${-w / 2} 0 L${w / 2} 0 L${w / 2 - 30} ${-d} L${-w / 2 + 30} ${-d} Z" fill="#7a5638"/>
      <path d="M${-w / 2} 0 L${w / 2} 0 L${w / 2} 150 L${-w / 2} 150 Z" fill="#5a3e28"/></g>
    <path d="M${-w / 2 + 20} 40 L${-w / 2 + 200} 40 M${-w / 2 + 20} 96 L${-w / 2 + 200} 96" stroke="#3a2818" stroke-width="3" opacity=".6"/>
    <circle cx="${-w / 2 + 110}" cy="66" r="6" fill="url(#brassG)"/><circle cx="${-w / 2 + 110}" cy="122" r="6" fill="url(#brassG)"/>
    ${pp}
    ${board ? `<g filter="url(#pcl)"><path d="M${-w / 4} -60 L${w / 4} -60 L${w / 4 - 20} -260 L${-w / 4 + 20} -260 Z" fill="#d8ccb0"/></g><path d="M${-w / 4 + 30} -90 L${w / 4 - 40} -230 M${-w / 4 + 40} -140 L${w / 8} -120" stroke="#5a5040" stroke-width="2" opacity=".6"/>` : ''}
    ${lamp ? `<g filter="url(#pcs)"><path d="M${w / 2 - 80} ${-d + 20} L${w / 2 - 80} ${-d - 120} L${w / 2 - 140} ${-d - 170}" stroke="#2a3a2a" stroke-width="8" fill="none"/><path d="M${w / 2 - 190} ${-d - 150} L${w / 2 - 110} ${-d - 200} L${w / 2 - 100} ${-d - 160} Z" fill="#2e4a34"/></g>` : ''}</g>`;
}
// the office: wainscot, plaster, the big taped window, a wall clock, a fan; the boss's desk in front of the window
// white: the flash in the window (0..1); clockT: hours as a float for the clock
function officeSet(t, { white = 0, clockT = 10.97, fan = 1, blur = null, colleagues = null } = {}) {
  const fa = t * 240 * fan;
  return `<g ${blur ? `filter="url(#${blur})"` : ''}>
    <rect x="-600" y="-600" width="2400" height="3200" fill="#cfc4ac"/>
    <rect x="-600" y="1080" width="2400" height="420" fill="#6a4a30"/><path d="M-600 1080 L1800 1080" stroke="#4a3220" stroke-width="16"/>
    ${tapedWindow(240, 380, 620, 600, { white, t })}
    <g filter="url(#pcl)"><circle cx="1010" cy="300" r="70" fill="#5a3e28"/></g><circle cx="1010" cy="300" r="58" fill="#efe6d0"/>
    ${Array.from({ length: 12 }, (_, i) => `<path d="M1010 248 L1010 256" stroke="#2a2420" stroke-width="3" transform="rotate(${i * 30} 1010 300)"/>`).join('')}
    <path d="M1010 300 L1010 266" stroke="#1e1a16" stroke-width="5" transform="rotate(${F1(((clockT % 12) / 12) * 360)} 1010 300)"/>
    <path d="M1010 300 L1010 254" stroke="#1e1a16" stroke-width="3.5" transform="rotate(${F1(((clockT * 60) % 60) / 60 * 360)} 1010 300)"/>
    <g transform="translate(540 -40)"><rect x="-6" y="0" width="12" height="90" fill="#3a2a1e"/>
      ${[0, 1, 2].map(i => `<ellipse cx="0" cy="96" rx="${F1(Math.abs(Math.cos((fa + i * 120) * Math.PI / 180)) * 150 + 10)}" ry="10" fill="#3a2a1e" transform="rotate(${F1(Math.sin((fa + i * 120) * Math.PI / 180) * 4)} 0 96)"/>`).join('')}<circle cx="0" cy="96" r="18" fill="#2a1e14"/></g>
    <g filter="url(#pcl)"><rect x="-560" y="560" width="220" height="520" fill="#6a5a44"/></g>${[0, 1, 2, 3].map(i => `<rect x="-540" y="${590 + i * 120}" width="180" height="90" fill="#5a4a36"/><rect x="-470" y="${620 + i * 120}" width="40" height="10" fill="url(#brassG)"/>`).join('')}
    ${colleagues || ''}
    <path d="M-600 1500 L1800 1500 L1800 2600 L-600 2600 Z" fill="#7a5a3c"/>
    ${Array.from({ length: 14 }, (_, i) => `<path d="M${-600 + i * 180} 1500 L${-1200 + i * 260} 2600" stroke="#5a4028" stroke-width="4" opacity=".5"/>`).join('')}</g>`;
}
// the same office after the blast: the window blown in — outside, the second cloud climbs over the valley — the ceiling
// broken open at one end with a rafter hanging down, the lamp swinging on its cord, cracked plaster, desks overturned,
// papers drifting through the light. Returns { back, front }: the rubble he rises out of goes in front of him.
function officeWreck(t, { dust = 1 } = {}) {
  const X0 = 240, Y0 = 380, W = 620, H = 600, R = rng(71);
  const outside = `<clipPath id="owc"><rect x="${X0}" y="${Y0}" width="${W}" height="${H}"/></clipPath>
    <g clip-path="url(#owc)">${sky1945({ y0: Y0, y1: Y0 + H, top: '#8e887a', mid: ['#aca392', '#cbbfa4'], haze: '#ddd0b0' })}
      ${mushroomCloud(600, 930, t - 37, { s: .3, age: .2 + .08 * seg(t, 40.4, 41.86), glow: .25, seed: 5, dark: .2 })}
      ${hills(900, ['#8c846e', '#7a7262'], { seed: 51, amp: 70, step: 70, smooth: false })}
      <rect x="${X0}" y="${Y0}" width="${W}" height="${H}" fill="#f0e6cc" opacity=".2"/></g>`;
  // plaster: cracked, a damp shadow, a patch fallen away to the laths (upper right)
  let cracks = ''; for (let i = 0; i < 9; i++) { const R2 = rng(i + 140), c = [[X0, Y0], [X0 + W, Y0], [X0, Y0 + H], [X0 + W, Y0 + H]][i % 4]; let x = c[0], y = c[1], d = `M${x} ${y}`;
    const ax = (c[0] > 500 ? 1 : -1), ay = (c[1] > 600 ? 1 : -1); for (let j = 0; j < 6; j++) { x += ax * (20 + R2() * 50); y += ay * (10 + R2() * 46) * (R2() < .3 ? -.4 : 1); d += ` L${F1(x)} ${F1(y)}`; }
    cracks += `<path d="${d}" stroke="#3a2e22" stroke-width="${F1(1.6 + R2() * 1.6)}" fill="none" opacity=".55"/>`; }
  const laths = `<path d="M900 -80 L1240 -120 L1300 300 L1180 360 L1060 300 L960 330 L910 200 Z" fill="#4a3a2c"/>
    ${Array.from({ length: 14 }, (_, i) => `<path d="M${900 + (i % 2) * 10} ${-60 + i * 28} L1290 ${-90 + i * 28}" stroke="#7a6248" stroke-width="12" opacity=".9"/>`).join('')}
    <path d="M900 -80 L1240 -120 L1300 300 L1180 360 L1060 300 L960 330 L910 200 Z" fill="none" stroke="#c8bca4" stroke-width="6" opacity=".6"/>`;
  const wall = `<rect x="-600" y="-600" width="2400" height="3200" fill="#9a8f7a"/>
    <g filter="url(#b60)" opacity=".5"><ellipse cx="-80" cy="700" rx="300" ry="500" fill="#6a5e4c"/><ellipse cx="1150" cy="900" rx="260" ry="420" fill="#6e624e"/></g>
    ${laths}${cracks}
    <rect x="-600" y="1080" width="2400" height="420" fill="#4e3a28"/><path d="M-600 1080 L1800 1080" stroke="#2e2218" stroke-width="16"/>
    ${Array.from({ length: 12 }, (_, i) => `<path d="M${-560 + i * 200} 1090 L${-560 + i * 200} 1500" stroke="#3a2a1c" stroke-width="5" opacity=".6"/>`).join('')}
    <path d="M140 1080 l40 60 l-20 50 l36 70 M720 1090 l-30 80 l24 60" stroke="#1e160e" stroke-width="3" fill="none" opacity=".6"/>`;
  // the window frame: jambs and lintel still there, splintered; a mullion stub, the transom bar hanging from one end
  // (swaying), shards of glass and the paper tape left in the corners
  const sway = Math.sin(t * 2.6) * 2.5;
  const frame = `<g filter="url(#pcl)" fill="#4a3424">
      <path d="M${X0 - 26} ${Y0 - 26} L${X0 + W + 26} ${Y0 - 26} L${X0 + W + 26} ${Y0 + H + 26} L${X0 - 26} ${Y0 + H + 26} Z M${X0} ${Y0} L${X0} ${Y0 + 120} L${X0 + 10} ${Y0 + 150} L${X0} ${Y0 + 180} L${X0} ${Y0 + H} L${X0 + W} ${Y0 + H} L${X0 + W} ${Y0 + 330} L${X0 + W - 12} ${Y0 + 300} L${X0 + W} ${Y0 + 270} L${X0 + W} ${Y0} Z" fill-rule="evenodd"/>
      <path d="M${X0 + 200} ${Y0} L${X0 + 218} ${Y0} L${X0 + 222} ${Y0 + 150} L${X0 + 212} ${Y0 + 196} L${X0 + 204} ${Y0 + 168} L${X0 + 196} ${Y0 + 190} Z"/>
      <path d="M${X0 + 410} ${Y0 + H} L${X0 + 428} ${Y0 + H} L${X0 + 426} ${Y0 + H - 120} L${X0 + 418} ${Y0 + H - 96} L${X0 + 410} ${Y0 + H - 130} Z"/></g>
    <g transform="rotate(${F1(34 + sway)} ${X0 + W - 6} ${Y0 + 296})"><g filter="url(#pcl)"><rect x="${X0 + W - 320}" y="${Y0 + 288}" width="320" height="16" fill="#4a3424"/></g>
      <path d="M${X0 + W - 300} ${Y0 + 290} L${X0 + W - 220} ${Y0 + 290}" stroke="#e8e0cc" stroke-width="8" opacity=".8"/></g>
    <g fill="#c4d0d4" opacity=".45" stroke="#f4f8f8" stroke-width="2" stroke-opacity=".6">
      <path d="M${X0} ${Y0} L${X0 + 90} ${Y0} L${X0 + 30} ${Y0 + 70} L${X0} ${Y0 + 130} Z"/><path d="M${X0 + W} ${Y0 + H} L${X0 + W - 110} ${Y0 + H} L${X0 + W - 40} ${Y0 + H - 60} L${X0 + W} ${Y0 + H - 150} Z"/>
      <path d="M${X0 + 218} ${Y0} L${X0 + 300} ${Y0} L${X0 + 250} ${Y0 + 40} Z"/></g>
    <g stroke="#e4dcc6" stroke-width="9" opacity=".85" stroke-linecap="square"><path d="M${X0 + 10} ${Y0 + 10} L${X0 + 60} ${Y0 + 62}"/><path d="M${X0 + W - 12} ${Y0 + H - 10} L${X0 + W - 70} ${Y0 + H - 64}"/>
      <path d="M${X0 + 226} ${Y0 + 8} L${X0 + 232} ${Y0 + 90 + Math.sin(t * 3) * 4}" opacity=".7"/></g>`;
  // the ceiling has come down at the left: broken boards and a rafter hanging diagonally to the floor
  const ceiling = `<g filter="url(#pcl)"><path d="M-600 -600 L1800 -600 L1800 150 L700 150 L560 200 L380 140 L200 260 L60 160 L-600 200 Z" fill="#3a2c20"/></g>
    ${Array.from({ length: 7 }, (_, i) => `<path d="M${-60 + i * 50} ${170 + (i % 3) * 30} l${F1(30 + i * 8)} ${F1(140 + i * 20)} l18 -6 l${F1(-26 - i * 6)} ${F1(-150 - i * 18)} Z" fill="${i % 2 ? '#5a4430' : '#4a3828'}"/>`).join('')}
    <g filter="url(#pcl)"><path d="M120 120 L190 100 L470 1540 L390 1560 Z" fill="#5e4430"/><path d="M190 100 L214 108 L494 1534 L470 1540 Z" fill="#3a2a1c"/></g>
    <path d="M140 140 L414 1540 M158 130 L436 1540" stroke="#7a5a3e" stroke-width="3" opacity=".5"/>
    <path d="M110 126 l20 -40 l14 30 l18 -46 l12 50" stroke="#c8a87a" stroke-width="3" fill="none" opacity=".6"/>`;
  // the lamp on its cord, swinging
  const la = Math.sin(t * 2.3 + .6) * 6;
  const lamp = `<g transform="rotate(${F1(la)} 960 -300)"><path d="M960 -300 L960 560" stroke="#1e1a16" stroke-width="3"/>
      <g filter="url(#pcl)"><path d="M916 600 L1004 600 L984 562 L936 562 Z" fill="#e8e4da"/></g><ellipse cx="960" cy="600" rx="44" ry="8" fill="#3a3630"/><circle cx="960" cy="606" r="9" fill="#d8d0c0"/></g>`;
  const desks = `${desk(130, 1560, 520, 1, { seed: 3, tilt: -24 })}${desk(1000, 1630, 460, .9, { seed: 4, tilt: 30, papers: 0 })}
    <g filter="url(#pcl)" fill="#4a3424"><path d="M760 1520 L860 1480 L870 1500 L780 1540 Z M820 1500 L800 1600 L816 1604 L836 1504 Z"/></g>`;
  // the light: shafts from the window through the dust, motes drifting in them
  const shafts = `<g opacity="${F1(.7 * dust)}">${[0, 1, 2, 3].map(i => `<path d="M${300 + i * 150} ${Y0 + 20} L${-60 + i * 280} 2200 L${120 + i * 280} 2200 L${380 + i * 150} ${Y0 + 20} Z" fill="#fff2dc" opacity=".12" filter="url(#b16)"/>`).join('')}</g>`;
  let motes = ''; for (let i = 0; i < 70; i++) { const R2 = rng(i + 700), p = (t * (.015 + R2() * .02) + R2()) % 1, x = 160 + R2() * 860 + Math.sin(t * .8 + i) * 20, y = 300 + R2() * 1300 - p * 200;
    motes += `<circle cx="${F1(x)}" cy="${F1(y)}" r="${F1(1.4 + R2() * 2.4)}" opacity="${F1(.25 + .5 * Math.sin(p * Math.PI))}"/>`; }
  let papers = ''; for (let i = 0; i < 24; i++) { const x0 = -100 + R() * 1300, p = (t * (.05 + R() * .05) + R()) % 1, y = -200 + p * 2000, sw = Math.sin(t * 2 + i) * 60;
    papers += `<path d="M${F1(x0 + sw)} ${F1(y)} l60 -4 l6 40 l-60 4 Z" fill="${pick(R, ['#ece6d6', '#e4dcc8', '#d8d0bc'])}" transform="rotate(${F1(Math.sin(t * 3 + i) * 50)} ${F1(x0 + sw)} ${F1(y)})" opacity=".95"/>`; }
  const back = `${wall}${outside}${frame}${ceiling}${lamp}${desks}
    <path d="M-600 1500 L1800 1500 L1800 2600 L-600 2600 Z" fill="#5a4630"/>${shafts}
    ${smoke(560, 1500, t, { seed: 77, n: 10, H: 1100, drift: 120, r0: 80, r1: 300, col: '#b0a28c', op: .4 * dust, speed: .05 })}`;
  // the rubble he rises out of: a broken desk top, planks, plaster lumps and paper, its crest just under his chest
  let lumps = ''; for (let i = 0; i < 26; i++) { const R2 = rng(i + 820), x = -200 + R2() * 1500, y = 1500 + R2() * 520 + Math.abs(x - 560) * .12;
    lumps += `<path d="M${F1(x)} ${F1(y)} l${F1(30 + R2() * 70)} ${F1(-14 - R2() * 30)} l${F1(30 + R2() * 50)} ${F1(20 + R2() * 20)} l${F1(-20 - R2() * 60)} ${F1(24 + R2() * 16)} Z" fill="${pick(R2, ['#8e8474', '#a89e8a', '#6e6252', '#bab09c'])}"/>`; }
  const front = `<g filter="url(#pcl)"><path d="M-400 1600 C-100 1540 200 1480 380 1468 C480 1462 640 1460 760 1470 C960 1490 1200 1540 1500 1620 L1500 2600 L-400 2600 Z" fill="#4e3c2a"/></g>
    <g filter="url(#pcl)"><path d="M-160 1640 L700 1470 L716 1506 L-140 1690 Z" fill="#6a4c32"/><path d="M640 1530 L1300 1600 L1290 1650 L630 1572 Z" fill="#5a3e28"/>
      <path d="M260 1560 L620 1500 L640 1600 L280 1680 Z" fill="#7a5638"/></g>
    <path d="M-150 1655 L705 1484 M300 1600 L620 1540" stroke="#9a7a58" stroke-width="3" opacity=".5"/>
    ${lumps}
    <g fill="#e4dcc8" opacity=".9"><path d="M420 1520 l80 -10 l8 50 l-80 12 Z"/><path d="M820 1560 l70 14 l-10 46 l-70 -12 Z"/><path d="M80 1650 l60 -20 l14 40 l-60 18 Z"/></g>
    <g fill="#fff4e0">${motes}</g>${papers}`;
  return { back, front };
}
// ======================= later years =======================
// the veranda (engawa) of his house in spring, seen from the garden: paper shoji behind him with the shadows of the
// cherry on them, dark posts and the eaves, the boards he sits on, a cup of tea at his side. In front (after him): the
// edge of the veranda, the stepping stone, and a branch of blossom close to the lens; petals drift across.
// Returns { back, front }.
function verandaSet(t, { petals = 1 } = {}) {
  const PW = 270, top = 230, bot = 1400;
  let shoji = '';
  for (let i = 0; i < 8; i++) { const x = -420 + i * PW, cols = 4, rows = 9, gw = (PW - 28) / cols, gh = (bot - top - 28) / rows;
    shoji += `<rect x="${x}" y="${top}" width="${PW}" height="${bot - top}" fill="#efe7d4"/>`;
    let bars = ''; for (let c = 1; c < cols; c++) bars += `<rect x="${F1(x + 14 + c * gw - 2.5)}" y="${top}" width="5" height="${bot - top}"/>`;
    for (let r = 1; r < rows; r++) bars += `<rect x="${x}" y="${F1(top + 14 + r * gh - 2.5)}" width="${PW}" height="5"/>`;
    shoji += `<g fill="#8a6a4c">${bars}</g><path d="M${x + 7} ${top} L${x + 7} ${bot} M${x + PW - 7} ${top} L${x + PW - 7} ${bot}" stroke="#5e4430" stroke-width="14"/>`; }
  // the light on the paper: brighter toward the sun (upper right), the cherry's shadow dappled across it
  const R = rng(83); let dapple = '';
  for (let i = 0; i < 60; i++) { const a = R() * 6.28, rr = Math.sqrt(R()), x = 820 + Math.cos(a) * rr * 520 + Math.sin(t * .6 + i) * 6, y = 520 + Math.sin(a) * rr * 300;
    dapple += `<circle cx="${F1(x)}" cy="${F1(y)}" r="${F1(20 + R() * 40)}"/>`; }
  const light = `<defs>${radG('vsl', ['#fff8e8', '#efe7d4', '#d8ccb4'], { cx: .72, cy: .25, r: .8 })}</defs>
    <rect x="-420" y="${top}" width="2160" height="${bot - top}" fill="url(#vsl)" opacity=".55"/>
    <g filter="url(#b16)" fill="#7a6a5a" opacity=".16">${dapple}<path d="M1500 300 C1200 360 1000 420 760 560" stroke="#7a6a5a" stroke-width="40" fill="none"/></g>`;
  const frame = `<g filter="url(#pcl)"><rect x="-600" y="-600" width="2400" height="${top + 600}" fill="#4a3424"/>
      <rect x="-600" y="${top - 70}" width="2400" height="70" fill="#5e432e"/></g>
    ${Array.from({ length: 16 }, (_, i) => `<rect x="${-560 + i * 160}" y="${top - 170}" width="60" height="96" fill="#3a2a1c"/>`).join('')}
    <g filter="url(#pcl)"><rect x="-600" y="${bot}" width="2400" height="150" fill="#6a4c34"/></g><path d="M-600 ${bot + 4} L1800 ${bot + 4}" stroke="#3a2a1c" stroke-width="8"/>
    ${[-60, 1050].map(x => `<g filter="url(#pcl)"><rect x="${x}" y="${top - 70}" width="64" height="${bot - top + 300}" fill="#5a3e2a"/></g><path d="M${x + 12} ${top} L${x + 12} ${bot + 200}" stroke="#8a6a4c" stroke-width="5" opacity=".5"/>`).join('')}`;
  // the boards of the veranda floor (running left-right), a soft sheen of the paper's light on them
  const floor = `<g filter="url(#pcl)"><path d="M-600 ${bot + 150} L1800 ${bot + 150} L1800 1720 L-600 1720 Z" fill="#8a6848"/></g>
    ${[1572, 1596, 1624, 1656, 1692].map(y => `<path d="M-600 ${y} L1800 ${y}" stroke="#5e4630" stroke-width="3" opacity=".6"/>`).join('')}
    <rect x="-600" y="${bot + 150}" width="2400" height="60" fill="#efe2c8" opacity=".14" filter="url(#b10)"/>`;
  // tea at his side: a small tray, a cup, steam
  const st = [0, 1].map(i => { const ph = t * 1.4 + i * 2; return `<path d="M${716 + i * 12} 1600 C${706 + i * 12 + Math.sin(ph) * 10} 1560 ${730 + i * 12 + Math.sin(ph + 1) * 12} 1530 ${714 + i * 12 + Math.sin(ph + 2) * 10} 1490" stroke="#ffffff" stroke-width="7" fill="none" opacity=".18"/>`; }).join('');
  const tea = `<g filter="url(#pcl)"><ellipse cx="730" cy="1652" rx="96" ry="20" fill="#4e3624"/></g><ellipse cx="730" cy="1646" rx="90" ry="15" fill="#6a4a30"/>
    <g filter="url(#pcl)"><path d="M700 1604 L760 1604 L756 1640 Q730 1652 704 1640 Z" fill="#a8b8a0"/></g><ellipse cx="730" cy="1604" rx="30" ry="7" fill="#6e5a3a"/>
    <path d="M704 1618 Q730 1626 756 1618" stroke="#5a7058" stroke-width="3" fill="none" opacity=".6"/><g filter="url(#b5)">${st}</g>`;
  const back = `${shoji}${light}${frame}${floor}${tea}`;
  // in front: the veranda's edge beam, the stepping stone and raked gravel, a branch of blossom near the lens, petals
  const edge = `<g filter="url(#pcl)"><path d="M-600 1720 L1800 1720 L1800 1800 L-600 1800 Z" fill="#4e3624"/></g><path d="M-600 1722 L1800 1722" stroke="#b8946a" stroke-width="5" opacity=".6"/>
    <path d="M-600 1800 L1800 1800 L1800 2600 L-600 2600 Z" fill="#a49e92"/>
    ${Array.from({ length: 10 }, (_, i) => `<path d="M-600 ${1830 + i * 30} Q600 ${1820 + i * 30} 1800 ${1830 + i * 30}" stroke="#8a8478" stroke-width="3" fill="none" opacity=".5"/>`).join('')}
    <g filter="url(#pcl)"><path d="M300 1850 C330 1820 620 1814 700 1846 C730 1880 690 1920 600 1928 C460 1936 320 1920 296 1890 Z" fill="#8e8a80"/></g>`;
  const R3 = rng(91); let bl = '', blL = '', blD = '';
  const twigs = [[1300, 260, 980, 420, 760, 470], [1050, 380, 900, 300, 820, 250], [930, 440, 860, 560, 780, 610], [1200, 330, 1120, 520, 1010, 600]];
  for (const [ax, ay, bx, by, cx, cy] of twigs) for (let i = 0; i < 9; i++) { const p = i / 8, x = (1 - p) * (1 - p) * ax + 2 * p * (1 - p) * bx + p * p * cx, y = (1 - p) * (1 - p) * ay + 2 * p * (1 - p) * by + p * p * cy;
    for (let j = 0; j < 4; j++) { const xx = x + (R3() - .5) * 70, yy = y + (R3() - .5) * 50, r = 13 + R3() * 13;
      bl += `<circle cx="${F1(xx)}" cy="${F1(yy)}" r="${F1(r)}" fill="${pick(R3, ['#f2d0d8', '#ecc2cc', '#f6dee2', '#e4b4c0'])}"/>`;
      blL += `<circle cx="${F1(xx - r * .25)}" cy="${F1(yy - r * .3)}" r="${F1(r * .55)}"/>`; blD += `<circle cx="${F1(xx + r * .3)}" cy="${F1(yy + r * .35)}" r="${F1(r * .6)}"/>`; } }
  const sway = Math.sin(t * .9) * 6;
  const branch = `<g transform="translate(${F1(sway)} ${F1(sway * .3)})" filter="url(#dofLight)">
      <path d="${twigs.map(([ax, ay, bx, by, cx, cy]) => `M${ax} ${ay} Q${bx} ${by} ${cx} ${cy}`).join(' ')}" stroke="#3e2a20" stroke-width="18" fill="none" stroke-linecap="round"/>
      <path d="M1500 180 C1400 220 1340 250 1300 262" stroke="#3a261c" stroke-width="34" fill="none" stroke-linecap="round"/>
      <g filter="url(#cloudF2)">${bl}</g><g fill="#a86878" opacity=".3">${blD}</g><g fill="#ffffff" opacity=".45">${blL}</g></g>`;
  let pet = ''; for (let i = 0; i < 46 * petals; i++) { const R2 = rng(i + 400), p = (t * (.06 + R2() * .05) + R2()) % 1, x = 300 + R2() * 1100 - p * 600 + Math.sin(t * 2 + i) * 40, y = 260 + p * 1700;
    pet += `<ellipse cx="${F1(x)}" cy="${F1(y)}" rx="${F1(6 + R2() * 4)}" ry="4" fill="${pick(R2, ['#f6d4dc', '#f2c8d2', '#fae6ea'])}" transform="rotate(${F1(t * 120 + i * 37)} ${F1(x)} ${F1(y)})" opacity=".92"/>`; }
  return { back, front: `${edge}${branch}${pet}` };
}
// a ceremony room (2009): a gold folding screen with a painted pine, the national flag on its stand, a dark carpet.
// front: press photographers' heads and raised cameras close to the lens (soft), flashes from them. Returns { back, front }.
function ceremonySet(t, { fl = 0 } = {}) {
  const X0 = -40, PWb = 190, Yt = 300, Yb = 1420;
  let screen = '';
  for (let i = 0; i < 7; i++) { const x = X0 + i * PWb, sh = i % 2 ? .1 : 0;
    screen += `<rect x="${x}" y="${Yt}" width="${PWb}" height="${Yb - Yt}" fill="${mix('#d4b46a', '#8a6a34', sh)}"/>`;
    let leaf = ''; for (let r = 0; r < 14; r++) for (let c = 0; c < 3; c++) leaf += `<rect x="${x + 6 + c * 62}" y="${Yt + 6 + r * 80}" width="60" height="78" fill="none" stroke="#fff0c0" stroke-width="1.2" opacity="${F1(.12 + ((r * 3 + c + i) % 4) * .03)}"/>`;
    screen += leaf + `<path d="M${x} ${Yt} L${x} ${Yb}" stroke="#2e1e12" stroke-width="7"/>`; }
  screen = `<defs>${linG('csG', ['#f2dc9a', '#d8b86c', '#b8944e'], { user: [0, Yt, 0, Yb] })}</defs>${screen}
    <rect x="${X0}" y="${Yt}" width="${PWb * 7}" height="${Yb - Yt}" fill="url(#csG)" opacity=".55"/>
    <g opacity=".5" fill="#f8ecc4" filter="url(#b10)"><ellipse cx="300" cy="520" rx="260" ry="50"/><ellipse cx="860" cy="1160" rx="300" ry="56"/></g>
    <g opacity=".55"><path d="M120 1300 C180 1100 260 980 420 900 C560 830 700 820 860 760" stroke="#3a2c1e" stroke-width="26" fill="none" stroke-linecap="round"/>
      <path d="M420 900 C440 820 500 760 580 720 M640 812 C700 760 760 740 840 730" stroke="#3a2c1e" stroke-width="14" fill="none" stroke-linecap="round"/>
      <g fill="#2e4232">${[[560, 700, 90], [700, 760, 80], [850, 720, 100], [430, 860, 70], [300, 980, 80]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${F1(r * .42)}"/><ellipse cx="${x + r * .4}" cy="${y - r * .25}" rx="${F1(r * .7)}" ry="${F1(r * .3)}"/>`).join('')}</g></g>
    <g filter="url(#pcl)"><rect x="${X0 - 14}" y="${Yt - 14}" width="${PWb * 7 + 28}" height="18" fill="#2a1a10"/><rect x="${X0 - 14}" y="${Yb}" width="${PWb * 7 + 28}" height="20" fill="#2a1a10"/></g>`;
  const wave = Math.sin(t * 1.6) * 4;
  const fx = 250, fy = 470;
  const flag = `<g transform="translate(${fx - 102} ${fy - 268})"><g filter="url(#pcl)"><rect x="96" y="250" width="12" height="1300" fill="#4a3220"/></g><circle cx="102" cy="244" r="13" fill="url(#brassG)"/>
    <g filter="url(#pcl)"><path d="M108 268 C150 ${F1(262 + wave)} 210 ${F1(276 - wave)} 300 ${F1(268 + wave * .6)} L300 ${F1(452 + wave * .6)} C210 ${F1(460 - wave)} 150 ${F1(446 + wave)} 108 452 Z" fill="#f4f0e6"/></g>
    <ellipse cx="${F1(204 + wave * .3)}" cy="${F1(360 + wave * .2)}" rx="50" ry="52" fill="#b8202a"/>
    <path d="M150 ${F1(270 + wave)} C160 340 160 400 150 ${F1(450 + wave)} M240 ${F1(272 - wave)} C250 340 248 400 240 ${F1(456 - wave)}" stroke="#c8beb0" stroke-width="10" fill="none" opacity=".35" filter="url(#softW)"/></g>`;
  const back = `<rect x="-600" y="-600" width="2400" height="3200" fill="#cdbfa2"/>
    ${Array.from({ length: 10 }, (_, i) => `<rect x="${-560 + i * 260}" y="-400" width="240" height="690" fill="#c2b392" opacity=".7"/>`).join('')}
    ${screen}<path d="M-600 ${Yb + 20} L1800 ${Yb + 20} L1800 2600 L-600 2600 Z" fill="#5a2c2a"/>${flag}`;
  // the press, close to the lens: heads and shoulders, two cameras raised
  const R = rng(17); let press = '';
  [[-40, 1790, 1.15, 1], [360, 1850, 1.05, 0], [760, 1860, 1.1, 0], [1110, 1790, 1.2, 1]].forEach(([x, y, s, cam], i) => {
    press += `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-190 120 C-186 0 -140 -70 -70 -86 L70 -86 C140 -70 186 0 190 120 Z" fill="${pick(R, ['#22242a', '#2a2622', '#1e2228'])}"/>
      <ellipse cx="0" cy="-160" rx="74" ry="86" fill="#16120e"/>
      ${cam ? `<g transform="translate(${-20 + i * 6} -250)"><rect x="-70" y="-46" width="140" height="84" rx="10" fill="#1a1a1c"/><circle cx="0" cy="-4" r="30" fill="#2e3034"/><circle cx="0" cy="-4" r="16" fill="#0e0e10"/>
        <rect x="30" y="-70" width="36" height="26" fill="#2a2a2c"/><path d="M-70 10 L-110 60 M70 10 L110 60" stroke="#c8a080" stroke-width="22" stroke-linecap="round"/></g>` : ''}</g>`; });
  const front = `<g filter="url(#dof)">${press}</g>`;
  return { back, front };
}
// a press photographer's flash: a burst of white light in the foreground (emissive) — k 0..1
const pressFlash = (x, y, k) => k < .01 ? '' : `<g filter="url(#pe16)"><circle cx="${F1(x)}" cy="${F1(y)}" r="${F1(120 + 200 * k)}" fill="#ffffff" opacity="${F1(.9 * k)}"/></g>`;
// a paper crane (orizuru) flying: wings flap with phase ph; (x, y) centre, s = scale, col
function paperCrane(x, y, s, ph, col = '#d8443a', rot = 0) {
  const f = Math.sin(ph), wy = -60 * f, dk = darken(col, .3), lt = lighten(col, .25);
  return `<g transform="translate(${F1(x)} ${F1(y)}) rotate(${F1(rot)}) scale(${s})">
    <path d="M-10 0 L-60 ${F1(wy)} L-110 ${F1(wy * .4 - 10)} Z" fill="${lt}"/><path d="M10 0 L60 ${F1(wy)} L110 ${F1(wy * .4 - 10)} Z" fill="${dk}"/>
    <path d="M-40 6 L0 -16 L40 6 L0 18 Z" fill="${col}"/><path d="M-40 6 L-70 -40 L-34 0 Z" fill="${dk}"/><path d="M40 6 L76 -46 L64 -40 L34 0 Z" fill="${col}"/><path d="M76 -46 L86 -40 L70 -34 Z" fill="${dk}"/></g>`;
}
// many cranes rising (a column of colours), p = 0..1 progress; spreads upward
function craneFlock(t, p, { n = 26, seed = 91, x = 540, y = 1300 } = {}) {
  const R = rng(seed), cols = ['#d8443a', '#e8b23a', '#3a7ac8', '#f0ece4', '#e87a9a', '#4aa86a', '#9a5ac8', '#f08a3a'];
  let s = '';
  for (let i = 0; i < n; i++) { const st = R() * .5, q = clamp((p - st) / .6); if (q <= 0) continue;
    const xx = x + (R() - .5) * 700 + Math.sin(t * .8 + i) * 40 + (R() - .5) * 600 * q, yy = y - 2400 * easeIn(q) * (.7 + R() * .5), sc = .5 + R() * .7;
    s += paperCrane(xx, yy, sc, t * (7 + R() * 3) + i, pick(R, cols), (R() - .5) * 30); }
  return s;
}
// inside the carriage: a window on the right with the countryside streaming past, wooden seat backs, a luggage rack
function carriageInterior(t, scroll, { blurOut = 1 } = {}) {
  return `<rect x="-600" y="-600" width="2400" height="3200" fill="#5a4632"/>
    <clipPath id="ciw"><rect x="600" y="300" width="520" height="700" rx="20"/></clipPath>
    <g clip-path="url(#ciw)"><g filter="url(#${blurOut ? 'b5' : 'b2'})">${countryside(t, scroll, { hy: 760 })}</g></g>
    <g filter="url(#pcl)"><path d="M580 280 L1140 280 L1140 1020 L580 1020 Z M600 300 L600 1000 L1120 1000 L1120 300 Z" fill="#6a4e36" fill-rule="evenodd"/></g>
    <path d="M600 660 L1120 660" stroke="#4a3624" stroke-width="18"/>
    <g filter="url(#pcl)"><rect x="-600" y="120" width="2400" height="40" fill="#3a2a1c"/></g>
    ${Array.from({ length: 12 }, (_, i) => `<path d="M${-560 + i * 200} 160 L${-560 + i * 200} 200" stroke="#2a1e14" stroke-width="6"/>`).join('')}<path d="M-600 200 L1800 200" stroke="#2a1e14" stroke-width="6"/>
    <g filter="url(#pcl)"><path d="M-600 1180 L1800 1180 L1800 1500 L-600 1500 Z" fill="#4a5a3e"/><path d="M-600 1180 L1800 1180 L1800 1220 L-600 1220 Z" fill="#3a2a1c"/></g>
    <path d="M-600 1500 L1800 1500 L1800 2600 L-600 2600 Z" fill="#3a2c20"/>`;
}
// dusk on a hill with the two clouds as ghosts on the horizon (Hiroshima left, Nagasaki right), and under each the lights
// of the city as it is now. The near slope is lit by the last of the sky: grass along the crest, wild flowers.
function hillGhosts(t, C, { ghost = 1 } = {}) {
  const lights = (cx, n, seed) => { const R = rng(seed); let s = ''; for (let i = 0; i < n; i++) { const x = cx + (R() - .5) * 420 * (.4 + R()), y = 1262 + R() * 30 + Math.abs(x - cx) * .02, tw = .7 + .3 * Math.sin(t * (2 + R() * 3) + i);
    s += `<circle cx="${F1(x)}" cy="${F1(y)}" r="${F1(1.6 + R() * 2.2)}" opacity="${F1(tw)}"/>`; } return s; };
  const crest = x => 1362 + Math.pow(Math.abs(x - 540) / 900, 1.6) * 180 * (x < 540 ? 1 : 1.1);
  let grass = '', flowers = ''; const R = rng(33);
  for (let i = 0; i < 220; i++) { const x = -500 + R() * 2100, y = crest(x) + R() * 14, h = 14 + R() * 30, sw = Math.sin(t * 1.4 + x * .01) * 5;
    grass += `<path d="M${F1(x)} ${F1(y)} q${F1(2 + sw * .5)} ${F1(-h * .5)} ${F1(3 + sw)} ${F1(-h)}" stroke="${pick(R, ['#3a2e3e', '#463848', '#2e2634'])}" stroke-width="${F1(1.6 + R() * 1.6)}" fill="none"/>`; }
  for (let i = 0; i < 90; i++) { const x = -400 + R() * 1900, y = crest(x) + 30 + R() * 700;
    flowers += `<circle cx="${F1(x)}" cy="${F1(y)}" r="${F1(2 + R() * 3.4 * (y - 1300) / 700)}" fill="${pick(R, ['#d8c8e0', '#e8dcc8', '#c8b8d8'])}" opacity="${F1(.35 + R() * .3)}"/>`; }
  let d = 'M-1400 2800 L-1400 1700'; for (let x = -1400; x <= 2500; x += 50) d += ` L${x} ${F1(crest(x))}`; d += ' L2500 2800 Z';
  return `${par(C, .3, sky1945({ y0: -1400, y1: 1500, top: '#1e2240', mid: ['#4a4a72', '#b47a7a'], haze: '#eaa070' }), [540, 960])}
    ${par(C, .45, `<g filter="url(#b2)">${mushroomCloud(170, 1250, t, { s: .56, age: .95, glow: 0, seed: 3, op: .62 * ghost, ghost: 1, tint: '#f0c8c8', tintK: .45 })}${mushroomCloud(920, 1270, t * .8, { s: .52, age: .9, glow: 0, seed: 7, op: .58 * ghost, ghost: 1, tint: '#e8c4d0', tintK: .45 })}</g>`, [540, 960])}
    ${par(C, .5, `${hills(1250, ['#5a4a5a', '#4a3e4c'], { seed: 31, amp: 90, step: 140 })}<g filter="url(#pe8)" fill="#ffd8a0">${lights(170, 70, 5)}${lights(920, 60, 9)}</g>`, [540, 960])}
    ${par(C, 1, `<defs>${linG('hgG', ['#6a5468', '#4a3a4c', '#2e2632'], { user: [0, 1350, 0, 2100] })}</defs><path d="${d}" fill="url(#hgG)"/>
      <path d="M-500 ${F1(crest(-500))} ${Array.from({ length: 43 }, (_, i) => { const x = -500 + i * 50; return `L${x} ${F1(crest(x))}`; }).join(' ')}" stroke="#c89aa0" stroke-width="5" fill="none" opacity=".35" filter="url(#softW2)"/>
      <path d="M560 1372 C600 1500 520 1640 620 1800 C680 1900 660 2000 700 2100" stroke="#7a6474" stroke-width="40" fill="none" opacity=".35" filter="url(#b10)"/>
      ${flowers}${grass}`, [540, 960])}`;
}
// a lecture room: blackboard, windows with daylight, rows of students (backs of heads, dark uniforms) in the foreground
function lectureSet(t) {
  return `<rect x="-600" y="-600" width="2400" height="3200" fill="#d8d0bc"/>
    <g filter="url(#pcl)"><rect x="-120" y="420" width="1320" height="620" fill="#2e4236"/></g><rect x="-100" y="440" width="1280" height="580" fill="#344a3e"/>
    <path d="M-60 520 C100 500 300 540 420 520 M-40 640 C160 620 260 660 400 640" stroke="#c8d0c0" stroke-width="4" opacity=".25"/>
    ${[-460, 1300].map(x => `<rect x="${x}" y="300" width="260" height="700" fill="#f0f2ea"/><path d="M${x + 130} 300 L${x + 130} 1000 M${x} 650 L${x + 260} 650" stroke="#b8ae98" stroke-width="12"/>`).join('')}
    <rect x="-600" y="1500" width="2400" height="1100" fill="#7a5c40"/>`;
}
const studentBacks = (y, t, { n = 6, seed = 5, s = 1 } = {}) => { const R = rng(seed); let o = '';
  for (let i = 0; i < n; i++) { const x = -200 + i * (1500 / n) + R() * 60, yy = y + R() * 40, ss = s * (.9 + R() * .2), sw = Math.sin(t * .8 + i) * 4;
    o += `<g transform="translate(${F1(x + sw)} ${F1(yy)}) scale(${F1(ss)})"><path d="M-170 0 C-166 -110 -120 -170 -60 -186 L60 -186 C120 -170 166 -110 170 0 Z" fill="#1e2230"/>
      <path d="M-40 -200 L40 -200 L36 -170 L-36 -170 Z" fill="#c8a080"/><ellipse cx="0" cy="-262" rx="66" ry="76" fill="#1a1410"/><ellipse cx="-66" cy="-248" rx="12" ry="20" fill="#c8a080"/><ellipse cx="66" cy="-248" rx="12" ry="20" fill="#c8a080"/></g>`; }
  return o; };
