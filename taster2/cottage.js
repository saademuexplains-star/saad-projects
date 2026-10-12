// "The Lullaby" — sets. World units: the bedroom floor meets the back wall at y = 1950; people stand at scale ~.6
// (1 unit ≈ 2.2 mm). Painted, opaque, layered: everything a character stands in front of is drawn in the back layer,
// everything that covers a character (quilt, front rail, table) in a front layer.

const FLOOR_Y = 1950;
const PAL = { plaster: ['#988d78', '#6a604e'], timber: '#3a2a1e', timberHi: '#5a4430', board: '#5a4230', boardDk: '#2e2016', gap: '#0b0705',
  linen: '#d9d0bf', quilt: ['#3e4a66', '#7a4432', '#9a7c3e', '#cdc2a6', '#4e5a3c', '#5e3a4a'] };

addDefs(`
  <filter id="plasterT" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".006 .009" numOctaves="5" seed="21"/>
    <feColorMatrix values="0 0 0 0 .22  0 0 0 0 .19  0 0 0 0 .16  0 0 0 .55 -.08"/></filter>
  <filter id="woodT" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".006 .14" numOctaves="3" seed="13"/>
    <feColorMatrix values="0 0 0 0 .12  0 0 0 0 .07  0 0 0 0 .04  0 0 0 1.3 -.45"/></filter>
  <filter id="frostT" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".06" numOctaves="3" seed="4"/>
    <feColorMatrix values="0 0 0 0 .9  0 0 0 0 .94  0 0 0 0 1  0 0 0 1.6 -.7"/></filter>
  <filter id="b3" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter>
  <filter id="skinT" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".035 .05" numOctaves="4" seed="17"/>
    <feColorMatrix values="0 0 0 0 .1  0 0 0 0 .11  0 0 0 0 .09  0 0 0 .9 -.38"/></filter>
  <filter id="b8" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="8"/></filter>
  <filter id="b18" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="18"/></filter>
  <filter id="b40" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="40"/></filter>
  <radialGradient id="flameG" cx=".5" cy=".7" r=".6"><stop offset="0" stop-color="#ffffff"/><stop offset=".35" stop-color="#fff2c4"/><stop offset=".75" stop-color="#ffc870"/><stop offset="1" stop-color="#e8823a"/></radialGradient>
  <radialGradient id="candleGlow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffe2b0" stop-opacity=".55"/><stop offset=".5" stop-color="#ffcf90" stop-opacity=".16"/><stop offset="1" stop-color="#ffcf90" stop-opacity="0"/></radialGradient>
  <radialGradient id="hearthG" cx=".5" cy=".75" r=".8"><stop offset="0" stop-color="#ffd59a"/><stop offset=".6" stop-color="#c8783a"/><stop offset="1" stop-color="#4a2410"/></radialGradient>
  <linearGradient id="nightWin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a2a52"/><stop offset=".6" stop-color="#2e4474"/><stop offset="1" stop-color="#5a6e9a"/></linearGradient>
  <linearGradient id="moonBeam" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c8d8ff" stop-opacity=".42"/><stop offset="1" stop-color="#c8d8ff" stop-opacity="0"/></linearGradient>
  <linearGradient id="underDark" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#050302"/><stop offset="1" stop-color="#1a120c"/></linearGradient>
`);

// ---------- the candle (flame = the key light). still = 1 freezes it (the house goes quiet) ----------
function candle(x, y, t, { still = 0, s = 1, lit = 1, lean = 0 } = {}) {
  const tt = lerp(t, 23.3, still), w = seamW(t) * (1 - still), sw = (Math.sin(tt * 9.3) * 2.2 + Math.sin(tt * 14.1) * 1.2) * w + lean, hh = 1 + (.08 * Math.sin(tt * 11.7) + .05 * Math.sin(tt * 23)) * w;
  return `<g transform="translate(${F1(x)} ${F1(y)}) scale(${s})">
    <circle cx="0" cy="-118" r="${F1(150 * lit)}" fill="url(#candleGlow)" style="mix-blend-mode:screen"/>
    <path d="M-34 0 C-34 -12 34 -12 34 0 C34 8 -34 8 -34 0 Z" fill="#6e6a64" filter="url(#pcs)"/><path d="M-8 -6 L-6 -26 L6 -26 L8 -6 Z" fill="#5e5a54" filter="url(#pcs)"/>
    <path d="M-16 -26 C-16 -32 16 -32 16 -26 L15 -96 C12 -104 -12 -104 -15 -96 Z" fill="#ece2c8" filter="url(#pcs)"/>
    <path d="M-15 -96 C-8 -92 -2 -98 4 -94 C9 -91 13 -96 15 -96 L14 -84 C10 -88 6 -82 2 -86 C-4 -90 -10 -84 -15 -88 Z" fill="#f6eedc"/>
    <path d="M0 -100 L0 -110" stroke="#2a1a10" stroke-width="2.4"/>
    ${lit > .02 ? `<g transform="translate(${F1(sw * .4)} -108) scale(${F1(lit)} ${F1(lit * hh)})"><path d="M0 -44 C${F1(9 + sw)} -24 11 -8 0 2 C-11 -8 ${F1(-9 + sw * .5)} -24 0 -44 Z" fill="url(#flameG)"/>
      <ellipse cx="0" cy="-6" rx="3.6" ry="6" fill="#4a7ac8" opacity=".55"/></g>` : ''}</g>`;
}

// ---------- floorboards in perspective (boards run toward us, vanishing at vp) ----------
function floorBoards(y0, y1, x0, x1, { vp = [620, 900], w = 72, seed = 6, light = 1, hump = null } = {}) {
  const k = (y1 - vp[1]) / (y0 - vp[1]), R = rng(seed); let s = `<rect x="${x0 - 400}" y="${y0}" width="${x1 - x0 + 800}" height="${y1 - y0}" fill="${PAL.board}"/>
    <rect x="${x0 - 400}" y="${y0}" width="${x1 - x0 + 800}" height="${y1 - y0}" filter="url(#woodT)" opacity=".9"/>`;
  for (let xb = x0 - 300; xb <= x1 + 300; xb += w) {
    const xt = vp[0] + (xb - vp[0]) * k, shade = R();
    const seam = (xa) => { if (!hump) return `M${F1(xa)} ${y0} L${F1(vp[0] + (xa - vp[0]) * k)} ${y1}`;
      let d = ''; for (let i = 0; i <= 16; i++) { const u = i / 16, y = y0 + (y1 - y0) * u, f = (y - vp[1]) / (y0 - vp[1]), x = vp[0] + (xa - vp[0]) * f;
        const wx = Math.exp(-(((x - hump.x) / hump.wx) ** 2)), dy = hump.h * wx * Math.exp(-(((y - hump.y) / hump.wy) ** 2)); d += `${i ? 'L' : 'M'}${F1(x)} ${F1(y - dy)}`; } return d; };
    s += `<path d="M${F1(xb)} ${y0} L${F1(xb + w)} ${y0} L${F1(vp[0] + (xb + w - vp[0]) * k)} ${y1} L${F1(xt)} ${y1} Z" fill="${shade < .3 ? PAL.boardDk : shade > .8 ? PAL.timberHi : PAL.board}" opacity="${(.18 + .25 * R()).toFixed(2)}"/>
      <path d="${seam(xb)}" stroke="${PAL.gap}" stroke-width="${F1(3 + 3 * k * .5)}" fill="none"/>`;
    const yc = y0 + (y1 - y0) * (.15 + .7 * R()), f = (yc - vp[1]) / (y0 - vp[1]);   // a board end
    s += `<path d="M${F1(vp[0] + (xb - vp[0]) * f)} ${F1(yc)} L${F1(vp[0] + (xb + w - vp[0]) * f)} ${F1(yc)}" stroke="${PAL.gap}" stroke-width="3" opacity=".8"/>`;
  }
  if (hump && hump.h > .5) s += `<ellipse cx="${hump.x}" cy="${F1(hump.y - hump.h * .6)}" rx="${hump.wx * .9}" ry="${F1(hump.wy * .35)}" fill="#e8c898" opacity="${Math.min(.32, hump.h / 90).toFixed(2)}" filter="url(#b18)"/>
    <ellipse cx="${hump.x}" cy="${F1(hump.y + hump.wy * .5)}" rx="${hump.wx * .9}" ry="${F1(hump.wy * .3)}" fill="#000" opacity="${Math.min(.4, hump.h / 70).toFixed(2)}" filter="url(#b18)"/>`;
  return s + `<rect x="${x0 - 400}" y="${y0}" width="${x1 - x0 + 800}" height="60" fill="#000" opacity=".35" filter="url(#b18)"/>`;
}

// ---------- the bedroom: back layer (walls, window with snow beyond, door, floor) ----------
function bedroomBack({ t = 0, blur = null, still = 0, door = 0, snowAmt = 1, hump = null } = {}) {
  const tt = lerp(t, 23.3, still);
  const panes = [];
  for (let i = 0; i < 4; i++) for (let j = 0; j < 5; j++) panes.push(`<rect x="${960 + i * 75}" y="${1010 + j * 66}" width="75" height="66" fill="none" stroke="#1a140e" stroke-width="5"/>`);
  const flakes = snowAmt > 0 ? snowfall(tt, { n: 26, seed: 3, area: [962, 1010, 1258, 1340], wind: 40, op: .8 * snowAmt }) : '';
  const inner = `
    <rect x="-1200" y="200" width="3400" height="${FLOOR_Y - 200}" fill="${PAL.plaster[1]}"/>
    <rect x="-1200" y="200" width="3400" height="${FLOOR_Y - 200}" fill="${PAL.plaster[0]}" opacity=".55"/>
    <rect x="-1200" y="200" width="3400" height="${FLOOR_Y - 200}" filter="url(#plasterT)"/>
    ${[[-560, 30], [340, 34], [1440, 34], [2100, 30]].map(([x, w]) => `<rect x="${x - w / 2}" y="200" width="${w}" height="${FLOOR_Y - 200}" fill="${PAL.timber}"/><rect x="${x - w / 2}" y="200" width="${w}" height="${FLOOR_Y - 200}" filter="url(#woodT)"/>`).join('')}
    <rect x="-1200" y="820" width="3400" height="44" fill="${PAL.timber}"/><rect x="-1200" y="820" width="3400" height="44" filter="url(#woodT)"/>
    <path d="M340 1480 L-120 870 L-150 870 L310 1480 Z" fill="${PAL.timber}"/>
    <rect x="-1200" y="${FLOOR_Y - 40}" width="3400" height="40" fill="${PAL.timber}"/>
    <!-- window: night outside, snow falling, frost creeping in from the corners -->
    <rect x="940" y="990" width="340" height="370" fill="#1c140e"/>
    <rect x="960" y="1010" width="300" height="330" fill="url(#nightWin)"/>
    <circle cx="1210" cy="1040" r="70" fill="#dfe8ff" opacity=".35" filter="url(#b18)"/>
    ${flakes}
    <rect x="960" y="1010" width="300" height="330" filter="url(#frostT)" opacity=".75"/>
    ${panes.join('')}
    <rect x="930" y="1350" width="360" height="26" fill="${PAL.timberHi}"/><rect x="930" y="1350" width="360" height="26" filter="url(#woodT)"/>
    <!-- the door (right): opening shows the warm room beyond -->
    <rect x="1560" y="1060" width="290" height="${FLOOR_Y - 1060}" fill="${door > .01 ? 'url(#hearthG)' : '#120c08'}"/>
    <path d="M1560 1060 L${F1(1560 + 290 * (1 - door * .8))} ${F1(1060 - 30 * door)} L${F1(1560 + 290 * (1 - door * .8))} ${F1(FLOOR_Y + 30 * door)} L1560 ${FLOOR_Y} Z" fill="#3a2618"/>
    <path d="M1560 1060 L${F1(1560 + 290 * (1 - door * .8))} ${F1(1060 - 30 * door)} L${F1(1560 + 290 * (1 - door * .8))} ${F1(FLOOR_Y + 30 * door)} L1560 ${FLOOR_Y} Z" filter="url(#woodT)"/>
    <rect x="1540" y="1040" width="330" height="26" fill="${PAL.timber}"/>
    ${floorBoards(FLOOR_Y, 2800, -1200, 2200, { hump })}`;
  return blur ? `<g filter="url(#${blur})">${inner}</g>` : inner;
}
// the moonbeam falling from the window across the bed and floor (a soft cold wash, drawn over the set)
const moonBeam = (op = 1) => `<path d="M960 1010 L1260 1010 L860 2700 L-80 2700 Z" fill="url(#moonBeam)" opacity="${(.85 * op).toFixed(2)}" style="mix-blend-mode:screen"/>`;

// ---------- the children's bed: back part (under the heads) and front part (quilt, rail — over the bodies) ----------
const BED = { x0: 470, x1: 1330, top: 1742 };
function childBedBack({ t = 0 } = {}) {
  return `
    <path d="M470 1560 C470 1520 530 1520 530 1560 L530 ${FLOOR_Y} L470 ${FLOOR_Y} Z" fill="${PAL.timber}" filter="url(#pcl)"/>
    <path d="M478 1585 C478 1556 522 1556 522 1585" stroke="${PAL.timberHi}" stroke-width="5" fill="none" opacity=".6"/>
    <path d="M530 1700 L1300 1700 L1300 1760 L530 1760 Z" fill="#cfc6b2" filter="url(#pcl)"/>
    <path d="M538 1676 C536 1650 560 1640 600 1644 L820 1652 C852 1654 862 1676 856 1700 C850 1724 820 1730 780 1728 L590 1724 C556 1722 540 1704 538 1676 Z" fill="${PAL.linen}" filter="url(#pcl)"/>
    <path d="M560 1660 C620 1668 700 1666 760 1664 M600 1712 C660 1716 740 1716 800 1712" stroke="#a89c86" stroke-width="3" fill="none" opacity=".6"/>`;
}
// breathe: 0..1 rise of the children's chests; lift / roll: the thing beneath moving the bed
function childBedFront({ t = 0, breathe = 0 } = {}) {
  const b = breathe * 9, W = '#38435c';
  const top = `M700 ${F1(1724 - b)} C760 ${F1(1700 - b * 1.4)} 860 ${F1(1702 - b)} 960 ${F1(1714 - b * .6)} C1100 1720 1220 1722 1300 1726 L1300 1846 C1180 1852 1000 1852 820 1854 C740 1854 660 1850 604 1846 L604 1744 C640 1736 670 ${F1(1730 - b * .6)} 700 ${F1(1724 - b)} Z`;
  return `
    <clipPath id="qc"><path d="${top}"/></clipPath>
    <path d="${top}" fill="${W}" filter="url(#pcl)"/>
    <g clip-path="url(#qc)" opacity=".35"><g stroke="#56637e" stroke-width="5">${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => `<path d="M${640 + i * 66} 1680 L${640 + i * 66} 1860"/>`).join('')}</g>
      <g stroke="#28304a" stroke-width="7">${[1760, 1800, 1836].map(y => `<path d="M600 ${y} L1310 ${y}"/>`).join('')}</g></g>
    <path d="M1300 1726 C1220 1724 1100 1722 960 1716" stroke="#56637e" stroke-width="5" fill="none" opacity=".55"/>
    <path d="M598 1742 C640 1730 700 ${F1(1716 - b)} 770 ${F1(1712 - b)} L782 1746 C722 1752 660 1756 604 1764 Z" fill="#d8ccb0" filter="url(#pcsl)"/>
    <path d="M520 1840 L1300 1840 L1300 1866 L520 1866 Z" fill="${PAL.timberHi}" filter="url(#pcs)"/>
    <rect x="510" y="1866" width="800" height="${FLOOR_Y - 1866}" fill="url(#underDark)"/>
    <path d="M1270 1660 C1270 1630 1330 1630 1330 1660 L1330 ${FLOOR_Y} L1270 ${FLOOR_Y} Z" fill="${PAL.timber}" filter="url(#pcl)"/>
    <rect x="530" y="1866" width="22" height="${FLOOR_Y - 1866}" fill="${PAL.timber}"/><rect x="1248" y="1866" width="22" height="${FLOOR_Y - 1866}" fill="${PAL.timber}"/>`;
}
// bedside table + stool
const bedsideTable = () => `<path d="M360 1640 L500 1640 L496 1662 L364 1662 Z" fill="${PAL.timberHi}" filter="url(#pcl)"/>
  <rect x="372" y="1660" width="14" height="${FLOOR_Y - 1660}" fill="${PAL.timber}"/><rect x="474" y="1660" width="14" height="${FLOOR_Y - 1660}" fill="${PAL.timber}"/>
  <rect x="370" y="1840" width="120" height="10" fill="${PAL.timber}"/>`;
const stool = (x = 300) => `<path d="M${x - 70} 1746 L${x + 70} 1746 L${x + 66} 1770 L${x - 66} 1770 Z" fill="${PAL.timberHi}" filter="url(#pcl)"/>
  ${[-56, -20, 20, 56].map(dx => `<path d="M${x + dx - 6} 1770 L${x + dx * 1.15 - 6} ${FLOOR_Y} L${x + dx * 1.15 + 6} ${FLOOR_Y} L${x + dx + 6} 1770 Z" fill="${PAL.timber}"/>`).join('')}`;

// ---------- the parents' bed (left of the room): her pillow, a heavy dark blanket ----------
function parentsBedBack() {
  return `<path d="M-980 1520 C-980 1480 -900 1480 -900 1520 L-900 ${FLOOR_Y} L-980 ${FLOOR_Y} Z" fill="${PAL.timber}" filter="url(#pcl)"/>
    <path d="M-900 1690 L-160 1690 L-160 1760 L-900 1760 Z" fill="#cfc6b2" filter="url(#pcl)"/>
    <path d="M-892 1660 C-894 1630 -860 1622 -810 1626 L-660 1632 C-626 1634 -616 1660 -622 1690 C-628 1714 -660 1718 -700 1716 L-840 1712 C-876 1710 -890 1690 -892 1660 Z" fill="${PAL.linen}" filter="url(#pcl)"/>`;
}
function parentsBedFront({ lump = 1 } = {}) {
  return `<path d="M-720 1720 C-640 1690 -520 ${F1(1686 + 10 * (1 - lump))} -380 1696 C-300 1702 -220 1706 -160 1712 L-160 1830 L-900 1830 L-900 1760 C-840 1740 -780 1730 -720 1720 Z" fill="#4a2a2a" filter="url(#pcl)"/>
    <path d="M-700 1740 C-600 1720 -480 1718 -360 1726" stroke="#6a3c38" stroke-width="5" fill="none" opacity=".6"/>
    <rect x="-920" y="1832" width="780" height="${FLOOR_Y - 1832}" fill="url(#underDark)"/>
    <path d="M-200 1650 C-200 1620 -140 1620 -140 1650 L-140 ${FLOOR_Y} L-200 ${FLOOR_Y} Z" fill="${PAL.timber}" filter="url(#pcl)"/>`;
}

// ---------- overhead: a face on a pillow (looking straight down). w,h = pillow size ----------
function pillowTop(cx, cy, { w = 900, h = 560, col = PAL.linen } = {}) {
  return `<path d="M${cx - w / 2} ${cy - h / 2 + 30} C${cx - w / 2} ${cy - h / 2 - 20} ${cx - w / 4} ${cy - h / 2 - 10} ${cx} ${cy - h / 2} C${cx + w / 4} ${cy - h / 2 - 10} ${cx + w / 2} ${cy - h / 2 - 20} ${cx + w / 2} ${cy - h / 2 + 30}
    C${cx + w / 2 + 20} ${cy} ${cx + w / 2 + 20} ${cy + h / 4} ${cx + w / 2} ${cy + h / 2 - 20} C${cx + w / 4} ${cy + h / 2 + 10} ${cx - w / 4} ${cy + h / 2 + 10} ${cx - w / 2} ${cy + h / 2 - 20} C${cx - w / 2 - 20} ${cy + h / 4} ${cx - w / 2 - 20} ${cy} ${cx - w / 2} ${cy - h / 2 + 30} Z" fill="${col}" filter="url(#pcl)"/>
    <g filter="url(#softW)" opacity=".5"><path d="M${cx - w * .4} ${cy - h * .25} C${cx - w * .2} ${cy - h * .1} ${cx - w * .15} ${cy + h * .1} ${cx - w * .3} ${cy + h * .3} M${cx + w * .38} ${cy - h * .3} C${cx + w * .25} ${cy - h * .05} ${cx + w * .28} ${cy + h * .15} ${cx + w * .4} ${cy + h * .3}" stroke="#9a8e78" stroke-width="16" fill="none"/></g>`;
}

// ---------- outside: the cottage in the snow at night ----------
function cottageNight({ t = 0, blur = null } = {}) {
  const inner = `
    <rect x="-600" y="-600" width="2300" height="3200" fill="url(#nightWin)"/>
    ${stars(t, { n: 50, seed: 4, area: [-400, -500, 1500, 700] })}
    <circle cx="840" cy="160" r="70" fill="#eef2ff"/><circle cx="840" cy="160" r="190" fill="#c8d8ff" opacity=".22" filter="url(#b40)"/>
    <path d="M-600 1180 C-200 1100 200 1150 540 1120 C900 1090 1300 1160 1700 1120 L1700 2600 L-600 2600 Z" fill="#c8d0e0"/>
    <path d="M-600 1180 C-200 1100 200 1150 540 1120 C900 1090 1300 1160 1700 1120 L1700 1300 L-600 1300 Z" fill="#e4eaf6" opacity=".7" filter="url(#b8)"/>
    ${[[-380, 1150, 1.1], [1350, 1130, 1.3], [-120, 1160, .7]].map(([x, y, s]) => `<g transform="translate(${x} ${y}) scale(${s})" stroke="#141a26" fill="none" stroke-linecap="round">
      <path d="M0 0 L0 -620" stroke-width="26"/><path d="M0 -300 L-140 -460 M0 -380 L120 -560 M0 -480 L-80 -600 M-90 -400 L-170 -420 M70 -480 L150 -500" stroke-width="10"/></g>`).join('')}
    <g transform="translate(540 1220)">
      <path d="M-330 0 L-330 -360 L330 -360 L330 0 Z" fill="#4a3a2c" filter="url(#pcl)"/>
      <path d="M-330 0 L-330 -360 L330 -360 L330 0 Z" filter="url(#woodT)"/>
      ${[-230, 0, 230].map(x => `<rect x="${x - 14}" y="-360" width="28" height="360" fill="#241a12"/>`).join('')}
      <path d="M-400 -340 L0 -640 L400 -340 Z" fill="#2a2420" filter="url(#pcl)"/>
      <path d="M-420 -330 L0 -660 L420 -330 L380 -320 L0 -616 L-380 -320 Z" fill="#eef2fa" filter="url(#pcl)"/>
      <rect x="170" y="-640" width="60" height="140" fill="#3a2e26"/><rect x="164" y="-650" width="72" height="18" fill="#eef2fa"/>
      <rect x="-150" y="-270" width="120" height="130" fill="#ffcf8a"/><path d="M-90 -270 L-90 -140 M-150 -205 L-30 -205" stroke="#2a1c12" stroke-width="8"/>
      <circle cx="-90" cy="-205" r="150" fill="#ffd6a0" opacity=".25" filter="url(#b40)" style="mix-blend-mode:screen"/>
      <rect x="80" y="-250" width="110" height="250" fill="#2a1c12"/>
      <path d="M-360 0 C-200 -16 200 -12 360 0 L360 30 L-360 30 Z" fill="#e4eaf6"/>
    </g>
    ${smoke(740, 560, t, { seed: 41, n: 6, H: 520, drift: -160, r0: 24, r1: 110, col: '#8a90a4', op: .35, speed: .09 })}`;
  return blur ? `<g filter="url(#${blur})">${inner}</g>` : inner;
}

// ---------- beneath: the underside of the floor and the thing that sleeps there ----------
// the boards seen from below: dark wood with thin bright seams where the candlelight leaks through
function boardsFromBelow(y0, y1, t, { seamOp = 1, shift = 0 } = {}) {
  let s = `<rect x="-600" y="${y0}" width="2300" height="${y1 - y0}" fill="#1a120c"/><rect x="-600" y="${y0}" width="2300" height="${y1 - y0}" filter="url(#woodT)" opacity=".6"/>`;
  for (let x = -560; x < 1700; x += 120) s += `<rect x="${x}" y="${y0}" width="4" height="${y1 - y0}" fill="#ffd8a0" opacity="${(seamOp * (.55 + .25 * Math.sin(t * 3 + x))).toFixed(2)}"/>
    <rect x="${x - 6}" y="${y0}" width="16" height="${y1 - y0}" fill="#ffb870" opacity="${(seamOp * .14).toFixed(2)}" filter="url(#b8)"/>`;
  s += [0, 1, 2].map(i => `<rect x="-600" y="${y1 - 40 - i * 260 + shift}" width="2300" height="34" fill="#0e0905"/>`).join('');
  return s;
}
// the eye: lid closed (open 0) → a slit (open .3); twitch = rapid movement under the lid; wet sheen catches the seam light
function sleeperEye(cx, cy, s, t, { open = 0, twitch = 0, breathe = 0 } = {}) {
  const tw = twitch * (Math.sin(t * 31) * 6 + Math.sin(t * 17) * 4), lidY = 34 * open;
  return `<g transform="translate(${F1(cx)} ${F1(cy + breathe * 14)}) scale(${s})">
    <ellipse cx="0" cy="40" rx="900" ry="620" fill="#4a4c48" filter="url(#b40)" opacity=".9"/>
    <path d="M-860 120 C-600 -260 600 -260 860 120 C700 420 -700 420 -860 120 Z" fill="#5c5e58" filter="url(#pcl)"/>
    <g filter="url(#softW)" opacity=".55">${[-1, 0, 1, 2].map(i => `<path d="M-700 ${-80 + i * 90} C-300 ${-210 + i * 80} 300 ${-210 + i * 80} 700 ${-80 + i * 90}" stroke="#2a2c28" stroke-width="${18 - i * 3}" fill="none"/>`).join('')}</g>
    <rect x="-900" y="-560" width="1800" height="1300" filter="url(#skinT)" opacity=".35"/>
    <g filter="url(#softW)" opacity=".5">${[-1, 1].map(k => [0, 1, 2].map(i => `<path d="M${k * (440 + i * 40)} ${40 + i * 20} C${k * (520 + i * 50)} ${-40 + i * 50} ${k * (620 + i * 40)} ${-60 + i * 70} ${k * (720 + i * 30)} ${-20 + i * 80}" stroke="#262822" stroke-width="10" fill="none"/>`).join('')).join('')}</g>
    <path d="M-420 40 C-240 -110 240 -110 420 40 C240 ${F1(150 + lidY)} -240 ${F1(150 + lidY)} -420 40 Z" fill="#6c6e66" filter="url(#pcl)"/>
    <path d="M-420 40 C-240 -110 240 -110 420 40 C240 ${F1(150 + lidY)} -240 ${F1(150 + lidY)} -420 40 Z" filter="url(#skinT)" opacity=".25"/>
    <g stroke="#4a3c40" stroke-width="3" fill="none" opacity=".35">${[[-300, -40, -120, -70, 60, -50], [120, -60, 260, -30, 340, 10], [-200, 10, -60, -20, 40, 0]].map(([a, b, c2, d, e, f]) => `<path d="M${a} ${b} Q${c2} ${d} ${e} ${f}"/>`).join('')}</g>
    <path d="M${F1(-200 + tw)} 10 C${F1(-120 + tw)} -40 ${F1(120 + tw)} -40 ${F1(200 + tw)} 10" stroke="#3e403a" stroke-width="14" fill="none" opacity=".45" filter="url(#b8)"/>
    ${open > .02 ? `<path d="M-380 52 C-200 ${F1(52 + lidY * 1.4)} 200 ${F1(52 + lidY * 1.4)} 380 52 C200 ${F1(52 + lidY * .3)} -200 ${F1(52 + lidY * .3)} -380 52 Z" fill="#0c0b08"/>
      <path d="M-120 ${F1(56 + lidY * .5)} C-40 ${F1(60 + lidY)} 60 ${F1(60 + lidY)} 140 ${F1(56 + lidY * .5)}" stroke="#d8c890" stroke-width="${F1(3 + 8 * open)}" fill="none" opacity=".75"/>` : ''}
    <path d="M-420 40 C-240 140 240 140 420 40" stroke="#22231f" stroke-width="10" fill="none"/>
    ${Array.from({ length: 22 }, (_, i) => { const u = i / 21, x = -400 + 800 * u, y = 40 + 100 * Math.sin(Math.PI * u) * .95 + lidY * Math.sin(Math.PI * u); return `<path d="M${F1(x)} ${F1(y)} l${F1((u - .5) * 30)} ${F1(30 + 20 * Math.sin(Math.PI * u))}" stroke="#121310" stroke-width="7" stroke-linecap="round"/>`; }).join('')}
    <path d="M-300 -60 C-140 -130 140 -130 300 -60" stroke="#8a8c84" stroke-width="10" fill="none" opacity=".5" filter="url(#b3)"/></g>`;
}

// ---------- low angle under the children's bed (its own little world, 1080x1920) ----------
function underBedView(t, { shift = 0, sheen = 0, dustAmt = 0 } = {}) {
  // floor-level view under the bed. Boards and the gaps between them come from the SAME seam polylines, so when the
  // floor lifts (shift) every board bends with its gaps — no edge ever separates from its fill
  const vp = [560, 660], y0 = vp[1] + 40, R = rng(9);
  const hump = (x, y) => shift * 34 * Math.exp(-(((x - 560) / 420) ** 2)) * Math.exp(-(((y - 1200) / 210) ** 2));
  const seamPts = [];
  for (let i = -14; i <= 15; i++) { const xf = vp[0] + i * 46, xn = vp[0] + i * 300, pts = [];
    for (let j = 0; j <= 24; j++) { const u = j / 24, y = y0 + (2000 - y0) * u * u, x = lerp(xf, xn, (y - y0) / (2000 - y0)); pts.push([x, y - hump(x, y)]); }
    seamPts.push(pts); }
  const poly = pts => pts.map((q, j) => `${j ? 'L' : 'M'}${F1(q[0])} ${F1(q[1])}`).join('');
  let boards = '', seams = '', glints = '';
  for (let i = 0; i < seamPts.length - 1; i++) { const sh = R();
    boards += `<path d="${poly(seamPts[i])}${poly([...seamPts[i + 1]].reverse()).replace(/^M/, 'L')}Z" fill="${sh < .3 ? '#3a2a1c' : sh > .8 ? '#6a5038' : '#4e3a28'}"/>`; }
  seamPts.forEach((pts, i) => { seams += `<path d="${poly(pts)}" stroke="#080503" stroke-width="${F1(4 + Math.abs(i - 14) * .4)}" fill="none"/>`;
    // something pale passing beneath, seen only through the gaps: a soft streak slides along each gap toward us,
    // the streaks in step across the floor like one long body turning over
    if (sheen > .01) glints += `<path d="${poly(pts)}" stroke="#cfc6ae" stroke-width="${F1(3 + Math.abs(i - 14) * .35)}" fill="none" stroke-dasharray="260 3400"
      stroke-dashoffset="${F1(-((t - 27.3) * 520 + Math.abs(i - 14.5) * 40) + 300)}" opacity="${(.7 * sheen * (1 - Math.min(1, Math.abs(i - 14.5) / 9))).toFixed(2)}" filter="url(#b3)"/>`; });
  // the lifted boards catch the candle on their crest and shade the far side
  const crest = shift > .01 ? `<ellipse cx="560" cy="${F1(1150 - 20 * shift)}" rx="380" ry="46" fill="#e0b888" opacity="${(.22 * shift).toFixed(2)}" filter="url(#b18)"/>
    <ellipse cx="560" cy="${F1(1270 - 10 * shift)}" rx="400" ry="60" fill="#000" opacity="${(.3 * shift).toFixed(2)}" filter="url(#b18)"/>` : '';
  let motes = '';
  if (dustAmt > .01) { const R2 = rng(4); for (let i = 0; i < 26; i++) { const x = 200 + R2() * 700, sp = 40 + R2() * 60, y = 520 + ((R2() * 500 + t * sp) % 520); motes += `<circle cx="${F1(x + Math.sin(t + i) * 12)}" cy="${F1(y)}" r="${F1(2 + R2() * 3)}" fill="#e8d4b0" opacity="${(dustAmt * (.3 + .5 * R2())).toFixed(2)}"/>`; } }
  return `<rect x="-200" y="-200" width="1480" height="2320" fill="#0c0806"/>
    <rect x="-200" y="${y0}" width="1480" height="1500" fill="#4e3a28"/>${boards}
    <rect x="-200" y="${y0}" width="1480" height="1500" filter="url(#woodT)" opacity=".8"/>${crest}${seams}${glints}
    <rect x="-200" y="${vp[1] - 40}" width="1480" height="420" fill="#000" opacity=".82" filter="url(#b40)"/>
    <rect x="-200" y="-200" width="1480" height="${vp[1] - 120}" fill="#140e0a"/>
    ${[0, 1, 2, 3, 4, 5].map(i => `<rect x="-200" y="${-160 + i * 90}" width="1480" height="64" fill="${i % 2 ? '#1e1610' : '#24190f'}"/>`).join('')}
    <rect x="-200" y="${vp[1] - 220}" width="1480" height="110" fill="#3a2a1e" filter="url(#pcl)"/><rect x="-200" y="${vp[1] - 220}" width="1480" height="110" filter="url(#woodT)"/>
    <rect x="-40" y="-200" width="120" height="${vp[1] + 180}" fill="#2a1e14" filter="url(#pcl)"/><rect x="1000" y="-200" width="130" height="${vp[1] + 200}" fill="#2a1e14" filter="url(#pcl)"/>
    ${motes}`;
}
