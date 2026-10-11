// Spartan boy short — sets. Rich, saturated light: warm lamp/torch orange against cool moonlit blue,
// golden dusk on the river, hard white sun at the altar. Backgrounds stay soft so faces read.

// a sky gradient + optional sun/moon disc
function sky(stops, { y0 = -300, y1 = 1400, disc = null } = {}) {
  const id = fid('sk');
  return `<defs>${linG(id, stops, { x2: 0, y2: 1 })}</defs><rect x="-320" y="${y0}" width="1720" height="${y1 - y0}" fill="url(#${id})"/>
    ${disc ? `<circle cx="${disc[0]}" cy="${disc[1]}" r="${disc[2] * 3.2}" fill="${disc[3]}" opacity=".22" filter="url(#b40)"/><circle cx="${disc[0]}" cy="${disc[1]}" r="${disc[2]}" fill="${disc[3]}" opacity=".95"/>` : ''}`;
}
// layered mountains (Taygetus) along a horizon
function mountains(y, cols, { seed = 3, amp = 260 } = {}) {
  return cols.map((c, i) => {
    const R = rng(seed + i * 7);
    let d = `M-320 ${y + 400}`;
    for (let x = -320; x <= 1400; x += 120) d += ` L${x} ${F1(y - i * 40 - amp * (.3 + .7 * R()) * (1 - i * .2))}`;
    return `<path d="${d} L1400 ${y + 400} Z" fill="${c}"/>`;
  }).join('');
}
function stars(t, { n = 60, seed = 9, area = [-200, -200, 1480, 900] } = {}) {
  const R = rng(seed); let s = '';
  for (let i = 0; i < n; i++) s += `<circle cx="${F1(area[0] + R() * area[2])}" cy="${F1(area[1] + R() * area[3])}" r="${F1(1.5 + R() * 2.5)}" fill="#fff" opacity="${(.4 + .5 * Math.abs(Math.sin(t * (1 + R()) + i))).toFixed(2)}"/>`;
  return s;
}

// ---------- the family home at night: mud-brick walls, oil lamp, straw mat, door on the right ----------
// open 0..1: the door swings in; light: torchlight + moonlight spill through it
function homeNight({ t = 0, open = 0, blur = 'dofLight', lamp = 1 } = {}) {
  const f = flick(t, 4), doorW = 300 * (1 - easeOut(open) * .85);
  return `<g filter="url(#${blur})">
    ${stoneWall(-320, -300, 1400, 2300, ['#6a4428', '#2e1a0e'], { course: 90, block: 170, joint: '#1a0e06', jointOp: .3 })}
    <rect x="-320" y="1500" width="1720" height="800" fill="#3a2414"/>
    <rect x="-320" y="1500" width="1720" height="800" filter="url(#strawT)" opacity=".7"/>
    <path d="M760 420 L1080 420 L1080 1500 L760 1500 Z" fill="${open > .02 ? '#1c2a48' : '#120a06'}"/>
    ${open > .02 ? `<path d="M760 420 L1080 420 L1080 1500 L760 1500 Z" fill="#ff9a40" opacity="${(.45 * open * (.8 + .2 * f)).toFixed(2)}"/>
      <path d="M760 1500 L1080 1500 L620 2300 L-100 2300 Z" fill="#ffb060" opacity="${(.22 * open).toFixed(2)}" style="mix-blend-mode:screen" filter="url(#b24)"/>` : ''}
    <path d="M760 420 L${F1(760 + doorW)} ${F1(420 - 40 * open)} L${F1(760 + doorW)} ${F1(1500 + 40 * open)} L760 1500 Z" fill="#4a2c16" filter="url(#planks)"/>
    <path d="M760 420 L${F1(760 + doorW)} ${F1(420 - 40 * open)} L${F1(760 + doorW)} ${F1(1500 + 40 * open)} L760 1500 Z" fill="#4a2c16" opacity=".6"/>
    <path d="M740 400 L1100 400 L1100 440 L740 440 Z" fill="#2a1a0e"/>
    ${lamp ? `<circle cx="180" cy="1180" r="${F1(620 + 30 * f)}" fill="url(#fireGlow)" opacity="${(.7 * lamp * (.85 + .15 * f)).toFixed(2)}" style="mix-blend-mode:screen"/>
      <path d="M130 1220 C130 1190 230 1190 230 1220 L220 1240 L140 1240 Z" fill="#8a4a24"/>${fire(205, 1200, 22, 60, t, { seed: 3, n: 3, intensity: 1, glow: 0 })}` : ''}
    <path d="M60 300 L120 300 L120 360 L60 360 Z" fill="#1a1c38" opacity=".9"/>
  </g>`;
}

// ---------- road to the camp at dawn: mountains, tents, smoke ----------
function campDawn({ t = 0, blur = 'dof' } = {}) {
  let tents = '';
  [[120, 1180, .9], [360, 1150, .7], [620, 1170, .8], [880, 1140, .65], [1040, 1185, .9]].forEach(([x, y, s], i) => {
    tents += `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-140 0 L0 -170 L140 0 Z" fill="${i % 2 ? '#b89a6a' : '#a07c4c'}"/><path d="M0 -170 L140 0 L60 0 Z" fill="#6a4e2c"/><path d="M-20 0 L0 -60 L20 0 Z" fill="#2a1a0e"/></g>`;
  });
  return `<g filter="url(#${blur})">
    ${sky(['#3a3a6a', '#c86a6a', '#ffb070', '#ffe2a8'], { y1: 1300, disc: [760, 1020, 90, '#fff2c8'] })}
    ${mountains(1060, ['#7a5a7a', '#5a4262', '#3e2e46'], { seed: 4, amp: 300 })}
    <rect x="-320" y="1120" width="1720" height="1200" fill="#9a7a4e"/>
    <rect x="-320" y="1120" width="1720" height="1200" filter="url(#sandT)" opacity=".5"/>
    ${tents}
    ${smoke(300, 1100, t, { seed: 31, n: 7, H: 600, drift: 120, r0: 30, r1: 140, col: '#8a7a8a', op: .45, speed: .12 })}
    <path d="M540 1220 L380 2300 L760 2300 Z" fill="#b8956a" opacity=".6"/>
  </g>`;
}

// ---------- the Eurotas at dusk: golden water, tall reeds ----------
function riverDusk({ t = 0, blur = 'dof' } = {}) {
  let reeds = '';
  const R = rng(12);
  for (let i = 0; i < 60; i++) {
    const x = -300 + R() * 1700, h = 300 + R() * 400, y = 1100 + R() * 160, sw = Math.sin(t * 1.4 + i) * 10;
    reeds += `<path d="M${F1(x)} ${F1(y)} Q${F1(x + sw * .5)} ${F1(y - h * .5)} ${F1(x + sw)} ${F1(y - h)}" stroke="${['#4a5a2a', '#6a7a3a', '#3a4a22'][i % 3]}" stroke-width="${F1(6 + R() * 6)}" fill="none"/>
      <ellipse cx="${F1(x + sw)}" cy="${F1(y - h)}" rx="7" ry="22" fill="#6a4a2a"/>`;
  }
  return `<g filter="url(#${blur})">
    ${sky(['#2a2a5a', '#b8507a', '#ff8a4a', '#ffd27a'], { y1: 1150, disc: [300, 980, 110, '#ffe6a0'] })}
    ${mountains(1000, ['#5a3a5a', '#3a2440'], { seed: 9, amp: 260 })}
    ${seaSurface(1080, 2300, t, { far: '#d88a4a', near: '#4a3040', hi: '#ffe0a0', seed: 3, glint: .9 })}
    <ellipse cx="300" cy="1150" rx="260" ry="40" fill="#ffd890" opacity=".5" filter="url(#b24)"/>
    ${reeds}
  </g>`;
}

// ---------- the barracks at dawn: reed beds on the floor, cold blue light ----------
function barracksDawn({ t = 0, blur = 'dofLight' } = {}) {
  let reeds = '';
  const R = rng(5);
  for (let i = 0; i < 90; i++) { const x = -320 + R() * 1720, y = 1350 + R() * 900; reeds += `<path d="M${F1(x)} ${F1(y)} l${F1(160 + R() * 160)} ${F1((R() - .5) * 60)}" stroke="${['#8a8a4a', '#a8a060', '#6a6a36'][i % 3]}" stroke-width="7"/>`; }
  return `<g filter="url(#${blur})">
    ${stoneWall(-320, -300, 1400, 1400, ['#5a6070', '#2a2e3a'], { course: 110, block: 220, jointOp: .4 })}
    <path d="M360 200 L720 200 L720 700 L360 700 Z" fill="#cfe0f0" opacity=".8"/>
    <path d="M360 200 L720 200 L1100 1500 L-60 1500 Z" fill="#bcd4ee" opacity=".16" filter="url(#b24)"/>
    <rect x="-320" y="1300" width="1720" height="1000" fill="#4a4636"/>${reeds}
  </g>`;
}

// ---------- a farm at night: barn wall, fence, hay; moonlight blue; a doorway that can blaze with torchlight ----------
function farmNight({ t = 0, blur = 'dofLight', torch: tl = 0 } = {}) {
  return `<g filter="url(#${blur})">
    ${sky(['#050818', '#101c40', '#24305a'], { y1: 1300, disc: [820, 260, 70, '#e8f0ff'] })}${stars(t)}
    <path d="M-320 900 L520 620 L1400 900 L1400 2300 L-320 2300 Z" fill="#2a2a3a"/>
    ${stoneWall(-320, 900, 1400, 1700, ['#3a3e56', '#1a1c2a'], { course: 100, block: 200, jointOp: .4 })}
    <path d="M560 1000 L900 1000 L900 1700 L560 1700 Z" fill="${tl > .02 ? '#ff9a40' : '#0a0a14'}" opacity="${tl > .02 ? (.5 + .4 * tl).toFixed(2) : 1}"/>
    <rect x="-320" y="1650" width="1720" height="700" fill="#2e2a24"/>
    <g opacity=".9">${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<rect x="${-260 + i * 120}" y="1520" width="22" height="260" fill="#3a2a1a"/>`).join('')}<rect x="-320" y="1560" width="900" height="18" fill="#4a3420"/><rect x="-320" y="1660" width="900" height="18" fill="#4a3420"/></g>
    <ellipse cx="1050" cy="1700" rx="260" ry="120" fill="#8a7a3a"/>
    ${tl > .02 ? `<circle cx="730" cy="1300" r="${F1(900 * tl)}" fill="url(#fireGlow)" opacity="${(.75 * tl * flick(t, 6)).toFixed(2)}" style="mix-blend-mode:screen"/>` : ''}
    <rect x="-320" y="-300" width="1720" height="2600" fill="#2a3a78" opacity=".18" style="mix-blend-mode:screen"/>
  </g>`;
}

// ---------- the altar of Artemis Orthia: stone steps, columns, a packed crowd, hard sun ----------
function altarDay({ t = 0, blur = 'dof', red = 0 } = {}) {
  let crowd = '';
  const R = rng(21);
  for (let r = 0; r < 3; r++) for (let i = 0; i < 9; i++) {
    const x = -200 + i * 170 + (r % 2 ? 85 : 0) + (R() - .5) * 40, y = 1080 + r * 110;
    crowd += crowdBust(x, y, .8 + r * .18, { skin: CROWD_SKIN[(i + r) % 5], cloth: ['#8a2a1e', '#d8ccb0', '#5a4a3a', '#a85a2a', '#c8b890'][(i * 3 + r) % 5], rim: '#fff4d0', rimOp: .5, t, ph: i + r });
  }
  return `<g filter="url(#${blur})">
    ${sky(['#3a7ac8', '#8ac0ea', '#f0f4e8'], { y1: 1100, disc: [880, 160, 80, '#fffbe8'] })}
    ${mountains(900, ['#8a96a8', '#6a7688'], { seed: 2, amp: 200 })}
    <path d="M60 900 L1020 900 L1000 820 L80 820 Z" fill="#e8e0cc"/>
    ${[140, 320, 500, 680, 860].map(x => `<rect x="${x}" y="420" width="70" height="420" fill="#efe8d6"/><rect x="${x + 50}" y="420" width="20" height="420" fill="#c8bfa8"/><rect x="${x - 10}" y="400" width="90" height="26" fill="#ddd4c0"/>`).join('')}
    <path d="M60 420 L1020 420 L540 260 Z" fill="#e2dac6"/><rect x="40" y="400" width="1000" height="30" fill="#d4cab4"/>
    ${crowd}
    <defs>${linG('paveG', ['#e2d6bc', '#c8b898', '#a89878'], { x2: 0, y2: 1 })}</defs>
    <rect x="-400" y="1560" width="1880" height="1500" fill="url(#paveG)"/>
    ${[1640, 1760, 1920, 2120].map((y, i) => `<path d="M-400 ${y} L1480 ${y + 6}" stroke="#9a8a6a" stroke-width="${4 + i * 2}" opacity=".5"/>`).join('')}
  </g>`;
}
// the altar block itself (sharp, foreground) with a red stain that spreads
function altarStone(x, y, s = 1, red = 0) {
  return `<g transform="translate(${F1(x)} ${F1(y)}) scale(${s})">
    <path d="M-300 0 L300 0 L300 -260 L-300 -260 Z" fill="#e8e0cc" filter="url(#pcl)"/>
    <path d="M-330 -260 L330 -260 L330 -310 L-330 -310 Z" fill="#f4eee0" filter="url(#pcl)"/>
    <path d="M-250 -60 Q0 -40 250 -60 M-200 -160 L-120 -140 M80 -200 L180 -220" stroke="#b8ae98" stroke-width="4" fill="none" opacity=".6"/>
    ${red > 0 ? `<g opacity="${Math.min(1, red * 1.5).toFixed(2)}"><path d="M${F1(-40 - 260 * red)} -305 C${F1(-30 - 200 * red)} -290 ${F1(40 + 200 * red)} -284 ${F1(60 + 250 * red)} -306 Q0 -316 ${F1(-40 - 260 * red)} -305 Z" fill="#8a0c08"/>
      ${[-120, -20, 90, 170].map((dx, i) => { const L = Math.max(0, red * 1.4 - i * .15) * 220; return L > 2 ? `<path d="M${dx} -262 Q${dx + 6} ${F1(-262 + L * .5)} ${dx + 2} ${F1(-262 + L)}" stroke="#7a0a06" stroke-width="${14 - i * 2}" stroke-linecap="round" fill="none"/>` : ''; }).join('')}</g>` : ''}</g>`;
}

// ---------- a moonlit field with a helot's hut (lit window) ----------
function nightField({ t = 0, blur = 'dofLight' } = {}) {
  return `<g filter="url(#${blur})">
    ${sky(['#03050f', '#0c1430', '#1e2a50'], { y1: 1250, disc: [300, 300, 80, '#eef4ff'] })}${stars(t, { seed: 4 })}
    ${mountains(1080, ['#141c34', '#0c1224'], { seed: 6, amp: 220 })}
    <rect x="-320" y="1150" width="1720" height="1200" fill="#1a2418"/>
    <g transform="translate(760 1230)"><path d="M-200 0 L-200 -200 L0 -330 L200 -200 L200 0 Z" fill="#2a2620"/><path d="M-230 -190 L0 -350 L230 -190 L210 -180 L0 -320 L-210 -180 Z" fill="#3a3020"/>
      <rect x="40" y="-150" width="80" height="70" fill="#ffb050"/><circle cx="80" cy="-115" r="180" fill="url(#fireGlow)" opacity=".5" style="mix-blend-mode:screen"/></g>
    ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => `<path d="M${-300 + i * 180} 1500 q${F1(Math.sin(t * 1.3 + i) * 10)} -60 ${F1(4 + Math.sin(t + i) * 8)} -120" stroke="#2a3a26" stroke-width="10" fill="none"/>`).join('')}
    <rect x="-320" y="-300" width="1720" height="2600" fill="#3a5aa8" opacity=".14" style="mix-blend-mode:screen"/>
  </g>`;
}

// ---------- outside the family's house at night (the same door as shot 1, from the street) ----------
function houseOutside({ t = 0, blur = 'dofLight', open = 0 } = {}) {
  return `<g filter="url(#${blur})">
    ${sky(['#03050f', '#0e1634', '#25335e'], { y1: 900, disc: [180, 220, 60, '#eef4ff'] })}${stars(t, { seed: 7, area: [-200, -200, 1480, 600] })}
    ${stoneWall(-320, 500, 1400, 2300, ['#6a5a4a', '#2a2018'], { course: 90, block: 170, jointOp: .35 })}
    <path d="M-320 500 L1400 500 L1400 440 L-320 440 Z" fill="#3a2a1a"/>
    <path d="M380 900 L700 900 L700 1900 L380 1900 Z" fill="${open > .02 ? '#ffb060' : '#120a06'}" opacity="${open > .02 ? (.4 + .5 * open).toFixed(2) : 1}"/>
    <path d="M380 900 L${F1(700 - 280 * easeOut(open))} 900 L${F1(700 - 280 * easeOut(open))} 1900 L380 1900 Z" fill="#4a2c16" filter="url(#planks)"/>
    <rect x="360" y="880" width="360" height="30" fill="#2a1a0e"/>
    <rect x="-320" y="1880" width="1720" height="500" fill="#2a2420"/>
    <rect x="-320" y="-300" width="1720" height="2600" fill="#3a5aa8" opacity=".14" style="mix-blend-mode:screen"/>
  </g>`;
}
