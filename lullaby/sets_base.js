// Gladiator short — sets. Backgrounds are painted simply and blurred (phone-photo depth of field);
// characters stay sharp. Every set overscans the frame so the camera can move.

addDefs(`
  <filter id="stoneT" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency=".018 .045" numOctaves="4" seed="21"/>
    <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.2 -.42"/>
  </filter>
  <filter id="sandT" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency=".5 .9" numOctaves="2" seed="8"/>
    <feColorMatrix values="0 0 0 0 .35  0 0 0 0 .25  0 0 0 0 .12  0 0 0 .9 -.35"/>
  </filter>
  <filter id="strawT" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency=".02 .35" numOctaves="3" seed="13"/>
    <feColorMatrix values="0 0 0 0 .55  0 0 0 0 .45  0 0 0 0 .22  0 0 0 1.4 -.5"/>
  </filter>
  <filter id="b24" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="24"/></filter>
  <filter id="b40" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="40"/></filter>
`);

// a stone wall with block courses; (x0,y0)-(x1,y1), colours [top, bottom]
function stoneWall(x0, y0, x1, y1, cols, { course = 110, block = 210, seed = 3, joint = '#000', jointOp = .35 } = {}) {
  const id = fid('sw');
  let j = '';
  for (let y = y0, r = 0; y < y1; y += course, r++) {
    j += `M${x0} ${y} L${x1} ${y} `;
    for (let x = x0 + (r % 2 ? block / 2 : 0); x < x1; x += block) j += `M${x} ${y} L${x} ${Math.min(y1, y + course)} `;
  }
  return `<defs>${linG(id, cols, { x2: 0, y2: 1 })}</defs><rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="url(#${id})"/>
    <rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" filter="url(#stoneT)" opacity=".5"/>
    <path d="${j}" stroke="${joint}" stroke-width="6" opacity="${jointOp}"/>`;
}

// a wall torch: iron bracket + live fire + warm glow
function wallTorch(x, y, t, { s = 1, seed = 1, glow = 1 } = {}) {
  const f = flick(t, seed);
  return `<g transform="translate(${F1(x)} ${F1(y)}) scale(${s})">
    <circle cx="0" cy="-60" r="${F1(420 * glow)}" fill="url(#fireGlow)" opacity="${(.55 * f * glow).toFixed(2)}" style="mix-blend-mode:screen"/>
    <path d="M-16 0 L16 0 L10 90 L-10 90 Z" fill="#2a1e14"/><path d="M-30 -10 L30 -10 L20 14 L-20 14 Z" fill="#3a2a1a"/>
    ${fire(0, -6, 60, 150, t, { seed, n: 5, intensity: .9 + .15 * f, glow: 0 })}</g>`;
}

// a simple background person: head + shoulders, warm rim from torchlight. Used for blurred crowds.
function crowdBust(x, y, s, { skin = '#8a5a3e', cloth = '#5a3a2a', rim = '#ffb060', rimOp = .5, arm = 0, t = 0, ph = 0 } = {}) {
  const sw = Math.sin(t * 1.3 + ph) * 6;
  const armSVG = arm ? `<path d="M${F1(-70)} -60 Q${F1(-110 - sw)} ${F1(-160 - 90 * arm)} ${F1(-80 - sw)} ${F1(-250 - 120 * arm)}" stroke="${cloth}" stroke-width="42" stroke-linecap="round" fill="none"/><circle cx="${F1(-80 - sw)}" cy="${F1(-262 - 120 * arm)}" r="22" fill="${skin}"/>` : '';
  return `<g transform="translate(${F1(x + sw)} ${F1(y)}) scale(${s})">${armSVG}
    <path d="M-120 60 C-120 -20 -80 -60 -40 -70 L40 -70 C80 -60 120 -20 120 60 Z" fill="${cloth}"/>
    <ellipse cx="0" cy="-120" rx="52" ry="62" fill="${skin}"/>
    <path d="M-52 -126 C-56 -180 -20 -196 0 -196 C30 -196 56 -176 52 -126 C40 -150 -40 -150 -52 -126 Z" fill="#1e140e"/>
    <path d="M40 -150 C60 -120 58 -90 44 -70 M110 0 C118 20 120 40 120 60" stroke="${rim}" stroke-width="8" fill="none" opacity="${rimOp}"/>
    <ellipse cx="-16" cy="-118" rx="6" ry="4" fill="#1a0e08" opacity=".6"/><ellipse cx="18" cy="-118" rx="6" ry="4" fill="#1a0e08" opacity=".6"/></g>`;
}
const CROWD_SKIN = ['#8a5a3e', '#a8775a', '#6e4630', '#c49478', '#5a3a28'];
const CROWD_CLOTH = ['#5a3a2a', '#6b2a26', '#3e4a32', '#4a3e5a', '#8a6a3a', '#2e2a26', '#7a5a4a'];

// ---------- the feast: torch-lit hall, staring crowd behind, long table in front ----------
function feastHall({ t = 0, blur = 'dof', crowd = 1, rows = 2, warm = 1 } = {}) {
  let busts = '';
  const R = rng(17);
  if (crowd) for (let r = 0; r < rows; r++) for (let i = 0; i < 7; i++) {
    const x = -120 + i * 210 + (r % 2 ? 105 : 0) + (R() - .5) * 50, y = 1060 + r * 120, s = .9 + r * .22;
    busts += crowdBust(x, y, s, { skin: CROWD_SKIN[(i + r) % 5], cloth: CROWD_CLOTH[(i * 3 + r) % 7], t, ph: i * 1.7 + r, rimOp: .45 });
  }
  return `<g filter="url(#${blur})">
    ${stoneWall(-320, -300, 1400, 1400, ['#4a2e1c', '#24150c'], { course: 120, block: 230 })}
    ${[160, 920].map(x => `<path d="M${x - 170} 1400 L${x - 170} 420 C${x - 170} 220 ${x + 170} 220 ${x + 170} 420 L${x + 170} 1400 Z" fill="#120a06" opacity=".75"/>
      <path d="M${x - 170} 420 C${x - 170} 220 ${x + 170} 220 ${x + 170} 420" stroke="#6a4a30" stroke-width="22" fill="none" opacity=".6"/>`).join('')}
    ${wallTorch(540, 520, t, { s: 1.1, seed: 2, glow: warm })}${wallTorch(-60, 600, t, { seed: 5, glow: warm })}${wallTorch(1140, 600, t, { seed: 8, glow: warm })}
    <rect x="-320" y="900" width="1720" height="700" fill="#0c0705" opacity=".35"/>
    ${busts}
  </g>`;
}
// the table in front of him: planks + food. y = table edge nearest the camera is below the frame
function feastTable(y, t, { food = 1, leg = true } = {}) {
  return `<g>
    <path d="M-320 ${y} L1400 ${y} L1400 ${y + 900} L-320 ${y + 900} Z" fill="#5a3a22" filter="url(#pcl)"/>
    <rect x="-320" y="${y}" width="1720" height="900" filter="url(#planks)" opacity=".8"/>
    <path d="M-320 ${y} L1400 ${y}" stroke="#a87a50" stroke-width="10" opacity=".55"/>
    <ellipse cx="540" cy="${y + 140}" rx="700" ry="220" fill="url(#fireGlow)" opacity=".25" style="mix-blend-mode:screen"/>
    ${food ? `${breadLoaf(180, y + 110, 1.1)}${grapes(900, y + 80, 1.2)}${jug(1010, y + 120, .9)}${cup(330, y + 150, 1.1)}
      <ellipse cx="610" cy="${y + 120}" rx="200" ry="56" fill="#a89a80" filter="url(#pcl)"/><ellipse cx="610" cy="${y + 112}" rx="170" ry="40" fill="#cfc4ac"/>
      ${leg ? roastLeg(640, y + 60, .9, 70) : ''}` : ''}</g>`;
}

// ---------- the cell at night: stone, straw, moonlight through bars ----------
function cellSet({ t = 0, blur = 'dofLight', moon = 1 } = {}) {
  return `<g filter="url(#${blur})">
    ${stoneWall(-320, -300, 1400, 2300, ['#26324a', '#0e1422'], { course: 130, block: 250, jointOp: .5 })}
    <rect x="-320" y="-300" width="1720" height="2600" filter="url(#strawT)" opacity=".55"/>
    <rect x="-320" y="-300" width="1720" height="2600" fill="#0a1020" opacity=".35"/></g>`;
}
// moonlight falling through a barred window across the floor/face: a bright band with bar shadows
function moonBars(x, y, w, h, rot = -18, { op = .5, bars = 5 } = {}) {
  const id = fid('mb');
  let b = '';
  for (let i = 1; i < bars; i++) b += `<rect x="${F1(-w / 2 + i * w / bars - 9)}" y="${-h / 2}" width="18" height="${h}" fill="#000"/>`;
  return `<defs><mask id="${id}"><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" fill="#fff"/>${b}</mask></defs>
    <g transform="translate(${x} ${y}) rotate(${rot})" style="mix-blend-mode:screen"><g filter="url(#b8)"><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" fill="#8fa8d8" opacity="${op}" mask="url(#${id})"/></g></g>`;
}

// ---------- Roman street at dawn, crowds both sides ----------
function romanStreet({ t = 0, blur = 'dof', cheer = 0 } = {}) {
  const id = fid('st');
  let facades = '';
  [-1, 1].forEach(k => {
    const xn = k < 0 ? -320 : 1400, xf = k < 0 ? 420 : 660;
    facades += `<path d="M${xn} -300 L${xf} 640 L${xf} 1060 L${xn} 1700 Z" fill="${k < 0 ? '#b8875c' : '#8a5e3c'}"/>`;
    for (let i = 0; i < 7; i++) {
      const p = i / 7, p2 = (i + .35) / 7;
      const xa = xn + (xf - xn) * p, xb = xn + (xf - xn) * p2;
      const ya = -300 + (640 + 300) * p, yb = 1700 - (1700 - 1060) * p;
      facades += `<path d="M${F1(xa)} ${F1(ya + 120 * (1 - p))} L${F1(xb)} ${F1(-300 + 940 * p2 + 120 * (1 - p2))} L${F1(xb)} ${F1(1700 - 640 * p2)} L${F1(xa)} ${F1(yb)} Z" fill="${k < 0 ? '#e8c08a' : '#b88a5e'}" opacity=".55"/>`;
      facades += `<rect x="${F1(Math.min(xa, xb))}" y="${F1(ya + 300 * (1 - p))}" width="${F1(Math.abs(xb - xa) * .6)}" height="${F1(160 * (1 - p) + 30)}" fill="#3a2214" opacity=".7"/>`;
    }
    facades += `<path d="M${xn} -300 L${xf} 640 L${xf} 600 L${xn} -420 Z" fill="#8a3a22"/>`;
  });
  let busts = '';
  const R = rng(5);
  [-1, 1].forEach(k => {
    for (let i = 0; i < 9; i++) {
      const p = i / 9, x = k < 0 ? -200 + p * 560 : 1280 - p * 560, y = 1700 - p * 560, s = 1.6 * (1 - p * .75);
      busts += crowdBust(x + (R() - .5) * 40, y, s, { skin: CROWD_SKIN[i % 5], cloth: CROWD_CLOTH[(i * 2 + (k > 0 ? 3 : 0)) % 7], rim: '#ffd9a0', rimOp: .6, t, ph: i * 1.1 + k, arm: Math.max(0, cheer * (.6 + .4 * Math.sin(t * 7 + i))) });
    }
  });
  return `<g filter="url(#${blur})">
    <defs>${linG(id, ['#3a2a4a', '#a8607a', '#f0a868', '#ffe0a8'], { x2: 0, y2: 1 })}</defs>
    <rect x="-320" y="-300" width="1720" height="1300" fill="url(#${id})"/>
    <circle cx="540" cy="820" r="140" fill="#fff4d8" opacity=".9"/><circle cx="540" cy="820" r="420" fill="#ffe0a8" opacity=".35"/>
    ${facades}
    <path d="M420 1060 L660 1060 L1400 2300 L-320 2300 Z" fill="#8a6a4a"/>
    <path d="M420 1060 L660 1060 L1400 2300 L-320 2300 Z" filter="url(#sandT)" opacity=".5"/>
    <path d="M540 1060 L540 2300" stroke="#fff0c8" stroke-width="160" opacity=".15" filter="url(#b40)"/>
    ${busts}
  </g>`;
}
// petals / dust motes drifting in sunlight
function motes(t, { n = 40, seed = 3, col = '#fff0c8', area = [0, 0, 1080, 1920], op = .7, size = 6, fall = 60 } = {}) {
  const R = rng(seed);
  let s = '';
  for (let i = 0; i < n; i++) {
    const x0 = area[0] + R() * area[2], y0 = area[1] + R() * area[3], sp = .5 + R(), ph = R() * 6.28, sz = size * (.5 + R());
    const y = area[1] + ((y0 - area[1] + t * fall * sp) % area[3]);
    s += `<circle cx="${F1(x0 + Math.sin(t * 1.5 + ph) * 30)}" cy="${F1(y)}" r="${F1(sz)}" fill="${col}" opacity="${(op * (.4 + .6 * Math.abs(Math.sin(t + ph)))).toFixed(2)}"/>`;
  }
  return s;
}

// ---------- the tunnel under the arena: stone vault, wooden ceiling with light slits ----------
function tunnelSet({ t = 0, blur = 'dofLight', shake = 0, shadow = 0 } = {}) {
  let slits = '', rays = '';
  for (let i = 0; i < 6; i++) {
    const x = 60 + i * 190, w = 26 + (i % 3) * 8, pass = Math.max(0, Math.sin(t * 2.3 + i * 1.7)) * shadow;
    slits += `<rect x="${x}" y="-300" width="${w}" height="${520 - i * 4}" fill="#ffe6b8" opacity="${(.9 - .7 * pass).toFixed(2)}"/>`;
    rays += `<path d="M${x} 220 L${x + w} 220 L${x + w + 260} 2300 L${x - 120} 2300 Z" fill="#ffd9a0" opacity="${(.16 * (1 - .8 * pass)).toFixed(3)}"/>`;
  }
  return `<g filter="url(#${blur})">
    ${stoneWall(-320, 200, 1400, 2300, ['#3a2a1e', '#0e0a07'], { course: 140, block: 260, jointOp: .5 })}
    <rect x="-320" y="-300" width="1720" height="520" fill="#1e140c"/>
    ${slits}
    ${[0, 1, 2, 3, 4, 5, 6].map(i => `<rect x="${-320 + i * 260}" y="190" width="40" height="70" fill="#120c08"/>`).join('')}
    <rect x="-320" y="200" width="1720" height="40" fill="#2a1c12"/>
    <path d="M540 700 C330 700 250 860 250 1200 L250 2300 L830 2300 L830 1200 C830 860 750 700 540 700 Z" fill="#06040a" opacity=".8"/>
    <ellipse cx="540" cy="1150" rx="160" ry="240" fill="#ffe6b8" opacity=".35" filter="url(#b40)"/>
    <g style="mix-blend-mode:screen" filter="url(#b14)">${rays}</g>
  </g>`;
}
// dust / blood dripping through the ceiling slits
function drips(t, t0, { col = '#7a0a06', n = 10, seed = 4, x0 = 60, dx = 190, top = 230, speed = 1400, size = 9 } = {}) {
  if (t < t0) return '';
  const R = rng(seed);
  let s = '';
  for (let i = 0; i < n; i++) {
    const x = x0 + (i % 6) * dx + 10 + R() * 20, st = t0 + R() * 1.2, dt = t - st;
    if (dt < 0) continue;
    const y = top + Math.min(dt, 1.4) * speed * (.6 + R() * .5);
    s += `<ellipse cx="${F1(x)}" cy="${F1(y)}" rx="${F1(size)}" ry="${F1(size * 1.8)}" fill="${col}" opacity=".9"/><path d="M${F1(x)} ${top} L${F1(x)} ${F1(Math.min(y, top + 60))}" stroke="${col}" stroke-width="${F1(size * .8)}" opacity=".7"/>`;
  }
  return s;
}

// ---------- the gate (portcullis) with blinding light behind it ----------
function gateSet({ t = 0, open = 0, blur = 'dofLight' } = {}) {
  const lift = -1250 * easeInOut(open);
  let grid = '';
  for (let x = 120; x <= 960; x += 120) grid += `<rect x="${x - 18}" y="${F1(300 + lift)}" width="36" height="1500" fill="#2a1e14"/>`;
  for (let y = 380; y <= 1700; y += 160) grid += `<rect x="90" y="${F1(y + lift)}" width="900" height="30" fill="#24180e"/>`;
  return `<g filter="url(#${blur})">
    <rect x="-320" y="-300" width="1720" height="2600" fill="#fff4dc"/>
    <rect x="-320" y="1200" width="1720" height="1100" fill="#f0d8a8"/>
    <ellipse cx="540" cy="900" rx="${F1(500 + 400 * open)}" ry="${F1(700 + 300 * open)}" fill="#ffffff" opacity="${(.5 + .5 * open).toFixed(2)}" filter="url(#b40)"/>
    ${grid}
    ${stoneWall(-320, -300, 80, 2300, ['#3a2a1e', '#120c08'])}${stoneWall(1000, -300, 1400, 2300, ['#3a2a1e', '#120c08'])}
    <path d="M80 -300 L1000 -300 L1000 300 C1000 120 80 120 80 300 Z" fill="#2a1e14"/>
  </g>`;
}
// the secutor seen from behind as a dark silhouette: egg helmet with a low crest and neck flange, broad shoulders,
// the big shield on his left arm, the short sword in his right. The light in front of him glows around every edge.
function secutorBack(x, y, s = 1, { rim = '#fff0c8', rimOp = .6, col = '#120d0a' } = {}) {
  const parts = [
    'M-70 -606 C-86 -680 -84 -772 -52 -820 C-34 -848 34 -848 52 -820 C84 -772 86 -680 70 -606 Z',
    'M-9 -846 C-11 -884 11 -884 9 -846 L13 -690 L-13 -690 Z',
    'M-108 -598 C-84 -628 84 -628 108 -598 L100 -566 C62 -580 -62 -580 -100 -566 Z',
    'M-96 -580 C-150 -578 -206 -560 -236 -520 C-252 -470 -246 -400 -236 -330 C-222 -260 -196 -200 -176 -150 L-170 40 L170 40 L176 -150 C196 -200 222 -260 236 -330 C246 -400 252 -470 236 -520 C206 -560 150 -578 96 -580 Z',
    'M236 -520 C272 -470 288 -380 286 -280 C284 -220 292 -160 302 -120 L262 -108 C248 -160 242 -220 244 -290 C246 -380 236 -440 214 -490 Z',
    'M286 -132 L304 -132 L336 190 L320 196 Z',
    'M-470 -500 Q-372 -530 -276 -500 L-276 150 Q-372 178 -470 150 Z',
  ];
  return `<g transform="translate(${F1(x)} ${F1(y)}) scale(${s})">
    <g fill="none" stroke="${rim}" stroke-width="22" opacity="${(rimOp * .8).toFixed(2)}" filter="url(#b8)">${parts.map(d => `<path d="${d}"/>`).join('')}</g>
    <g fill="${col}">${parts.map(d => `<path d="${d}"/>`).join('')}</g>
    <g fill="none" stroke="${rim}" stroke-width="5" opacity="${(rimOp * .7).toFixed(2)}" filter="url(#softW2)"><path d="${parts[0]}"/><path d="M-236 -520 C-206 -560 -150 -578 -96 -580 M236 -520 C206 -560 150 -578 96 -580"/><path d="M-470 -500 Q-372 -530 -276 -500"/></g>
    <path d="M-176 -150 L176 -150 L174 -110 L-174 -110 Z" fill="${lighten(col, .08)}"/></g>`;
}

// ---------- the arena: packed stands, the podium wall, sand ----------
const CROWD_SKIN2 = ['#c49478', '#a8775a', '#8a5a3e', '#6e4630', '#e0b494', '#5a3a28'];
const CROWD_CLOTH2 = ['#8a3a2a', '#e2d6be', '#3e4a62', '#c8a24a', '#5a6a3a', '#6b2a46', '#d8cfb8', '#2e2a26', '#a85a2a', '#7a8a9a'];
function crowdPattern(id, { w = 300, h = 120, seed = 1, up = 0, scale = 1 } = {}) {
  const R = rng(seed);
  let s = `<rect width="${w}" height="${h}" fill="#3a2c22"/>`;
  for (let row = 0; row < 2; row++) for (let i = 0; i < 10; i++) {
    const x = (i + .5) * w / 10 + (R() - .5) * 12 + (row ? w / 20 : 0), y = row ? h * .74 : h * .3;
    const sk = CROWD_SKIN2[Math.floor(R() * 6)], cl = CROWD_CLOTH2[Math.floor(R() * 10)], bw = 18 + R() * 8;
    s += `<rect x="${F1(x - bw / 2)}" y="${F1(y)}" width="${F1(bw)}" height="${F1(h * .5)}" rx="7" fill="${cl}"/><circle cx="${F1(x)}" cy="${F1(y - 7)}" r="${F1(8 + R() * 3)}" fill="${sk}"/>`;
    if (up && R() < .65) { const sd = R() < .5 ? -1 : 1; s += `<path d="M${F1(x + sd * 8)} ${F1(y + 4)} L${F1(x + sd * (14 + R() * 8))} ${F1(y - 34 - R() * 10)}" stroke="${sk}" stroke-width="6" stroke-linecap="round"/>`; }
  }
  return `<pattern id="${id}" width="${w}" height="${h}" patternUnits="userSpaceOnUse" patternTransform="scale(${scale})">${s}</pattern>`;
}
addDefs([.42, .55, .7, .88, 1.1].map((sc, i) => crowdPattern('crowd' + i, { seed: 11 + i, scale: sc }) + crowdPattern('crowdUp' + i, { seed: 11 + i, scale: sc, up: 1 })).join(''));

function arenaSet({ t = 0, blur = 'dof', roar = 0, sun = 1, bow = 0 } = {}) {
  const id = fid('ar');
  const tiers = [[180, 330, 1], [360, 520, 2], [560, 760, 3], [800, 1060, 4]];
  let stands = '';
  tiers.forEach(([y0, y1, pi], i) => {
    const jig = Math.sin(t * 9 + i) * 4 * roar, up = roar > .3 && (Math.floor(t * 7 + i * 1.3) % 2);
    const b = bow * (1 - i * .15);
    stands += `<path d="M-320 ${y0 + 40 + b} Q540 ${y0 - 30 - b} 1400 ${y0 + 40 + b} L1400 ${y1 + 40 + b} Q540 ${y1 - 30 - b} -320 ${y1 + 40 + b} Z" fill="url(#${up ? 'crowdUp' : 'crowd'}${pi})" transform="translate(${F1(jig)} 0)"/>
      <path d="M-320 ${y1 + 40 + b} Q540 ${y1 - 30 - b} 1400 ${y1 + 40 + b} L1400 ${y1 + 72 + b} Q540 ${y1 - b} -320 ${y1 + 72 + b} Z" fill="#cbb894"/>`;
  });
  stands += `<rect x="-320" y="170" width="1720" height="950" filter="url(#stoneT)" opacity=".35"/>`;
  let arches = '';
  for (let x = -300; x < 1400; x += 150) arches += `<path d="M${x} 170 L${x} 90 C${x} 30 ${x + 110} 30 ${x + 110} 90 L${x + 110} 170 Z" fill="#3a2e24"/>`;
  let vel = '';
  for (let i = -6; i <= 6; i++) vel += `<path d="M540 -900 L${540 + i * 260} -60 L${540 + (i + 1) * 260} -60 Z" fill="${i % 2 ? '#d8c8a8' : '#b8402e'}" opacity=".9"/>`;
  return `<g filter="url(#${blur})">
    <defs>${linG(id + 's', ['#5a8ac0', '#a8c8e0', '#e8e0cc'], { x2: 0, y2: 1 })}${linG(id + 'd', ['#ecd2a4', '#c9a272'], { x2: 0, y2: 1 })}</defs>
    <rect x="-320" y="-300" width="1720" height="600" fill="url(#${id}s)"/>
    ${vel}
    <path d="M-320 -60 Q540 -150 1400 -60 L1400 190 Q540 120 -320 190 Z" fill="#c9b48e"/>${arches}
    ${stands}
    <path d="M-320 1100 Q540 1030 1400 1100 L1400 1240 Q540 1180 -320 1240 Z" fill="#e8dcc4"/>
    ${[0, 1, 2, 3, 4, 5, 6].map(i => `<rect x="${-200 + i * 240}" y="1080" width="70" height="150" fill="#9a2a22" opacity=".8"/>`).join('')}
    <path d="M-320 1240 Q540 1180 1400 1240 L1400 2400 L-320 2400 Z" fill="url(#${id}d)"/>
    <rect x="-320" y="1200" width="1720" height="1200" filter="url(#sandT)" opacity=".55"/>
    ${sun ? `<rect x="-320" y="-300" width="1720" height="2700" fill="#fff2d0" opacity="${(.12 * sun).toFixed(2)}" style="mix-blend-mode:screen"/>` : ''}
  </g>`;
}

// ---------- the sponsor's box: marble balustrade, purple drapes, crowd behind ----------
function podiumSet({ t = 0, blur = 'dof' } = {}) {
  return `<g filter="url(#${blur})">
    <rect x="-320" y="-300" width="1720" height="2600" fill="url(#crowd4)" opacity=".9"/>
    <rect x="-320" y="-300" width="1720" height="2600" fill="#2a1a12" opacity=".35"/>
    <path d="M-320 -300 C-100 -200 0 300 -40 1400 L-320 1400 Z" fill="#5e1d4c"/><path d="M1400 -300 C1180 -200 1080 300 1120 1400 L1400 1400 Z" fill="#5e1d4c"/>
    <path d="M-320 -300 C-100 -200 0 300 -40 1400 M1400 -300 C1180 -200 1080 300 1120 1400" stroke="#d9b04c" stroke-width="16" fill="none" opacity=".7"/>
  </g>`;
}
function balustrade(y) {
  let posts = '';
  for (let x = -280; x < 1400; x += 110) posts += `<path d="M${x} ${y + 60} C${x - 22} ${y + 120} ${x - 22} ${y + 200} ${x} ${y + 260} L${x + 50} ${y + 260} C${x + 72} ${y + 200} ${x + 72} ${y + 120} ${x + 50} ${y + 60} Z" fill="#d8d0c0" filter="url(#pcl)"/>`;
  return `<g><rect x="-320" y="${y}" width="1720" height="64" fill="#ece4d4" filter="url(#pcl)"/>${posts}<rect x="-320" y="${y + 260}" width="1720" height="900" fill="#cfc6b4" filter="url(#pcl)"/>
    <path d="M-320 ${y + 4} L1400 ${y + 4}" stroke="#fff" stroke-width="8" opacity=".5"/></g>`;
}

// ---------- the corridor of the dead: low stone passage, torches, bodies ----------
function corridorSet({ t = 0, blur = 'dofLight', torches = 1 } = {}) {
  return `<g filter="url(#${blur})">
    ${stoneWall(-320, -300, 1400, 2300, ['#2e2018', '#0a0605'], { course: 130, block: 240, jointOp: .55 })}
    <path d="M200 400 L880 400 L1400 -300 L-320 -300 Z" fill="#0c0806" opacity=".7"/>
    <path d="M200 1300 L880 1300 L1400 2300 L-320 2300 Z" fill="#1a120c"/>
    ${torches ? `${wallTorch(60, 700, t, { s: 1.2, seed: 3 })}${wallTorch(1020, 760, t, { s: 1.1, seed: 7 })}` : ''}
    <path d="M200 400 L880 400 L880 1300 L200 1300 Z" fill="#040203" opacity=".94"/>
  </g>`;
}

// ---------- outside the Gate of Death at night: stone arch, iron bars, torches ----------
function gateOutside({ t = 0, blur = 'dof' } = {}) {
  const id = fid('go');
  let bars = '';
  for (let x = 250; x <= 830; x += 72) bars += `<rect x="${x - 9}" y="340" width="18" height="1300" fill="#1a1614"/>`;
  return `<g filter="url(#${blur})">
    <defs>${linG(id, ['#06070e', '#14142a', '#2a1e34'], { x2: 0, y2: 1 })}</defs>
    <rect x="-320" y="-300" width="1720" height="2600" fill="url(#${id})"/>
    ${stoneWall(-320, -300, 1400, 1700, ['#3a3038', '#14101a'], { course: 140, block: 260 })}
    <path d="M200 1700 L200 600 C200 300 880 300 880 600 L880 1700 Z" fill="#0c0806"/>
    <ellipse cx="540" cy="1100" rx="260" ry="420" fill="#ff8a3a" opacity=".22" filter="url(#b40)"/>
    ${bars}<rect x="200" y="560" width="680" height="24" fill="#1a1614"/><rect x="200" y="1000" width="680" height="24" fill="#1a1614"/>
    ${wallTorch(90, 820, t, { s: 1.3, seed: 11 })}${wallTorch(990, 820, t, { s: 1.3, seed: 12 })}
    <rect x="-320" y="1600" width="1720" height="800" fill="#120c10"/>
  </g>`;
}
