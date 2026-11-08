// Sets for "The Cells That Never Died" part 3: the operating theatre from the side (the table is drawn by the shot so
// the surgeon can stand behind it and the patient lie on it), the ward with her bed seen from the side and the seasons
// passing in the window, the front window of the house at night in the rain (the children look out), deep space.
(function (G) {
  const S = G.SETS, { f, shade, mix, rng } = G.RIG, C = G.CINE, PR = G.PROPS;
  const { boards, motes, shaft, darkPool, LG, olr, starsW } = S.H17, { panes } = S.H18;
  const cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t;
  const TAU = Math.PI * 2;
  const cache = {}, once = (k, fn) => cache[k] || (cache[k] = fn());
  const tiles = (id, w, h, col, line) => `<pattern id="${id}" width="${w}" height="${h}" patternUnits="userSpaceOnUse"><rect width="${w}" height="${h}" fill="${line}"/><rect x="1.5" y="1.5" width="${w - 3}" height="${h - 3}" fill="${col}"/><rect x="3" y="3" width="${w - 6}" height="${f(h * 0.3)}" fill="#fff" opacity="0.07"/></pattern>`;

  // ======================================================= THE OPERATING THEATRE (side view). The table runs left-right
  // (-80..1040, top 1500); her head at the left on the pillow; the surgeon stands behind it, the nurse at the tray.
  // S.or51s gives the room; S.orTable the steel table and sheet (drawn after the people behind it); S.orDrape the
  // green drape over her (drawn after her body)
  const OS = S.OS = { FY: 1760, TOP: 1400, X0: -80, X1: 1040, LAMP: [470, 560], CART: [-360, 1880], TRAY: [1230, 1300] };
  S.or51s = (t, o = {}) => {
    const L = [];
    L.push({ p: 0.85, svg: once('oswall', () => {
      let g = `<defs>${tiles('ostl', 64, 64, '#5f8c76', '#3e6654')}${tiles('ostl2', 64, 64, '#4c7864', '#2e5444')}${LG('osgw', [[0, '#1a2a2a'], [1, '#0e1818']])}</defs>`;
      g += `<rect x="-2200" y="-900" width="5400" height="${OS.FY + 900}" fill="url(#ostl)"/><rect x="-2200" y="1180" width="5400" height="${OS.FY - 1180}" fill="url(#ostl2)"/><rect x="-2200" y="1168" width="5400" height="18" fill="#2a4a3c"/>`;
      // the gallery window high on the wall: dark glass, the rail, students watching
      g += `<rect x="-640" y="120" width="900" height="400" fill="url(#osgw)" ${olr(2)}/><rect x="-660" y="100" width="940" height="440" fill="none" stroke="#c8d2cc" stroke-width="18"/><path d="M-640,420 L260,420" stroke="#8a9a92" stroke-width="10"/>`;
      for (const [x, s] of [[-520, 1], [-380, 0.94], [-170, 1.04], [20, 0.96], [150, 1]]) g += `<g opacity="0.55"><ellipse cx="${x}" cy="${f(330 - 6 * s)}" rx="${f(40 * s)}" ry="${f(48 * s)}" fill="#05080a"/><path d="M${f(x - 90 * s)},420 C${f(x - 86 * s)},${f(380 - 4 * s)} ${f(x + 86 * s)},${f(380 - 4 * s)} ${f(x + 90 * s)},420Z" fill="#05080a"/></g>`;
      g += `<path d="M-620,140 L-300,500" stroke="#fff" stroke-width="22" opacity="0.05"/>`;
      // a clock, an X-ray viewing box, the glass instrument cabinet
      g += `<circle cx="760" cy="300" r="70" fill="#f4f2ea" stroke="#2a2a2a" stroke-width="8"/>` + Array.from({ length: 12 }, (_, i) => { const a = i / 12 * TAU; return `<path d="M${f(760 + Math.sin(a) * 54)},${f(300 - Math.cos(a) * 54)} L${f(760 + Math.sin(a) * 62)},${f(300 - Math.cos(a) * 62)}" stroke="#2a2a2a" stroke-width="4"/>`; }).join('') + `<path d="M760,300 L790,262 M760,300 L742,348" stroke="#1a1a1a" stroke-width="6" stroke-linecap="round"/>`;
      g += `<rect x="960" y="500" width="300" height="230" rx="6" fill="#5a5e60" ${olr(2)}/><rect x="978" y="518" width="264" height="194" fill="#e8f2f6"/><path d="M1040,540 C1020,600 1030,660 1060,700 M1180,540 C1200,600 1190,660 1160,700" stroke="#9aa8ae" stroke-width="10" fill="none" opacity="0.7"/><ellipse cx="1110" cy="660" rx="60" ry="40" fill="#a8b4ba" opacity="0.6"/>`;
      g += `<rect x="1360" y="560" width="440" height="1040" fill="#e4e6e2" ${olr(2)}/><rect x="1384" y="590" width="392" height="640" fill="#c4d6d8" opacity="0.55" ${olr(1.4)}/><path d="M1580,590 L1580,1230" stroke="#9aa0a0" stroke-width="6"/>`;
      for (const sy of [760, 960, 1160]) { g += `<path d="M1384,${sy} L1776,${sy}" stroke="#a8acaa" stroke-width="6"/>`; for (let k = 0; k < 6; k++) g += `<rect x="${1400 + k * 62}" y="${sy - 74 - (k % 2) * 22}" width="34" height="${74 + (k % 2) * 22}" rx="5" fill="${['#8a5a2a', '#e8e8e0', '#3a5a7a', '#c8a050'][k % 4]}" opacity="0.85" ${olr(1)}/>`; }
      return g;
    }) });
    // the floor: terrazzo, a drain, the lamp's pool
    L.push({ p: 1, svg: once('osfloor', () => `<rect x="-2200" y="${OS.FY}" width="5400" height="1400" fill="#7a8a82"/>` + Array.from({ length: 360 }, (_, i) => { const r = rng(i * 3 + 11); return `<circle cx="${f(-2000 + r() * 5000)}" cy="${f(OS.FY + 10 + r() * 1300)}" r="${f(2 + r() * 5)}" fill="${['#5a6a62', '#a8b4ae', '#e8ece6'][i % 3]}" opacity="0.6"/>`; }).join('') +
      `<rect x="-2200" y="${OS.FY}" width="5400" height="70" fill="#000" opacity="0.18"/>`) });
    // the anaesthesia cart at the head, its hose running to her face; the instrument trolley at the foot
    L.push({ p: 1, svg: PR.anesthesia(OS.CART[0], OS.CART[1], 0.9, t, { hose: [400, -505] }) + once('ostray', () => {
      const [x, y] = OS.TRAY;
      let g = `<path d="M${x},${y + 20} L${x},1900 M${x - 120},1900 L${x + 120},1900" stroke="#9aa2a6" stroke-width="16" stroke-linecap="round"/>`;
      g += `<rect x="${x - 190}" y="${y - 14}" width="380" height="30" rx="6" fill="#c8ced2" ${olr(1.6)}/><rect x="${x - 176}" y="${y - 26}" width="352" height="16" fill="#e8ecee" ${olr(1)}/>`;
      for (let i = 0; i < 7; i++) g += `<path d="M${x - 150 + i * 44},${y - 28} l30,-4" stroke="#7a8288" stroke-width="6" stroke-linecap="round"/>`;
      g += `<path d="M${x + 40},${y - 30} C${x + 70},${y - 60} ${x + 120},${y - 50} ${x + 150},${y - 30}" fill="#f4f4ee" ${olr(1)}/>`;
      return g;
    }) });
    // the lamp over the table and its cone of light
    L.push({ p: 0.97, svg: PR.orLamp(OS.LAMP[0], OS.LAMP[1], 1.05, o.lamp ?? 1) });
    L.push({ p: 0.97, light: true, svg: `<defs>${LG('oscone', [[0, '#fff6e0', 0.32], [1, '#fff6e0', 0]])}</defs><path d="M${OS.LAMP[0] - 270},${OS.LAMP[1] + 30} L${OS.LAMP[0] + 270},${OS.LAMP[1] + 30} L${OS.LAMP[0] + 700},${OS.TOP + 120} L${OS.LAMP[0] - 700},${OS.TOP + 120}Z" fill="url(#oscone)" style="mix-blend-mode:screen"/>` +
      C.radial(OS.LAMP[0], OS.TOP - 20, 700, '#fff4dc', 0.3, 'screen') + darkPool('osdk', OS.LAMP[0], 1300, 700, 1800, 0.5, '#020806', -3000, 4000) + motes(-200, 700, 1200, 1500, 24, 31, t, '#fff8e8', 0.35) });
    return L;
  };
  // the steel table: the slab, the pedestal, the white sheet with the pillow at the head
  S.orTable = t => once('ostable', () => {
    const { TOP: y, X0: x0, X1: x1 } = OS;
    let g = `<path d="M${(x0 + x1) / 2 - 50},${y + 30} L${(x0 + x1) / 2 - 40},1880 L${(x0 + x1) / 2 + 40},1880 L${(x0 + x1) / 2 + 50},${y + 30}Z" fill="#8a9296" ${olr(1.6)}/><path d="M${(x0 + x1) / 2 - 200},1880 L${(x0 + x1) / 2 + 200},1880 L${(x0 + x1) / 2 + 170},1850 L${(x0 + x1) / 2 - 170},1850Z" fill="#6a7276" ${olr(1.4)}/>`;
    g += `<rect x="${x0}" y="${y}" width="${x1 - x0}" height="36" rx="6" fill="#b4bcc0" ${olr(1.8)}/><path d="M${x0 + 10},${y + 8} L${x1 - 10},${y + 8}" stroke="#eef2f4" stroke-width="4" opacity="0.6"/>`;
    g += `<path d="M${x0 - 6},${y + 2} L${x1 + 6},${y + 2} L${x1 + 10},${y - 18} L${x0 - 10},${y - 18}Z" fill="#f4f4f0" ${olr(1.4)}/>`;
    g += `<path d="M${x0 + 10},${y - 18} C${x0 + 10},${y - 90} ${x0 + 230},${y - 92} ${x0 + 240},${y - 22}Z" fill="#fafaf6" ${olr(1.4)}/><path d="M${x0 + 40},${y - 60} C${x0 + 90},${y - 76} ${x0 + 160},${y - 76} ${x0 + 200},${y - 54}" stroke="#d8d8d0" stroke-width="5" fill="none"/>`;
    return g;
  });
  // the green drape over her from the chest down, hanging over the table's front edge in folds; a square window of
  // white gauze over the place where they work (at wx)
  S.orDrape = (t, wx = 560) => {
    const { TOP: y, X0: x0, X1: x1 } = OS, top = y - 150;
    // the top follows her body: up over the chest and belly, down to the shins and feet at the far end
    let g = `<path d="M${x0 + 250},${top + 40} C${x0 + 300},${top - 10} ${x0 + 500},${top - 20} ${x0 + 700},${top} C${x0 + 850},${top + 14} ${x1 - 60},${top + 46} ${x1 + 30},${top + 60} L${x1 + 40},${y + 230} C${x1 - 200},${y + 250} ${x0 + 500},${y + 220} ${x0 + 240},${y + 240}Z" fill="#5e8a72" ${olr(1.8)}/>`;
    for (let i = 0; i < 10; i++) { const x = x0 + 290 + i * 80, ty = top + (i < 6 ? 6 : 6 + (i - 5) * 9); g += `<path d="M${x},${ty + 14} C${x + 6},${y + 60} ${x - 10},${y + 140} ${x + 4},${y + 226}" stroke="${i % 2 ? '#4a7460' : '#7aa48c'}" stroke-width="${i % 2 ? 9 : 6}" fill="none" opacity="0.7"/>`; }
    g += `<path d="M${x0 + 252},${top + 42} C${x0 + 300},${top - 6} ${x0 + 500},${top - 16} ${x0 + 700},${top + 4} C${x0 + 850},${top + 18} ${x1 - 60},${top + 50} ${x1 + 30},${top + 64}" stroke="#9cc4ac" stroke-width="5" fill="none" opacity="0.6"/>`;
    g += `<path d="M${wx - 74},${top - 14} L${wx + 74},${top - 10} L${wx + 70},${top + 24} L${wx - 70},${top + 20}Z" fill="#f6f2ea" ${olr(1.2)}/><path d="M${wx - 50},${top - 2} l100,2 M${wx - 44},${top + 9} l90,2" stroke="#d8d0c0" stroke-width="3"/>`;
    return g;
  };

  // ======================================================= THE WARD (side view): her bed along the wall under the window, the
  // seasons in the window (o.season 0 Feb snow .. 0.3 spring .. 0.66 summer .. 1 Oct), o.day, o.cal month (2..10),
  // o.clock hours; other beds and a screen further down the ward; a doorway at the far right where the doctors talk
  const WS = S.WS = { FY: 1700, WIN: [120, 240, 620, 760], BED: [-60, 1900, 1100], CAL: [900, 640], CLOCK: [1260, 420], DOOR: [2100, 560, 320, 1140] };
  const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT'];
  S.wardS = (t, o = {}) => {
    const L = [], [wx, wy, ww, wh] = WS.WIN, day = o.day ?? 1, se = o.season || 0;
    L.push({ p: 0.45, svg: (() => {
      let g = `<defs>${LG('wssky', [[0, mix('#0a1024', mix('#a8bccc', '#8ab4dc', cl(se * 2)), day)], [1, mix('#1a2238', '#ece8dc', day)]])}</defs><rect x="-600" y="-600" width="2400" height="2400" fill="url(#wssky)"/>`;
      if (day < 0.5) g += `<g opacity="${f(1 - day * 2)}">${starsW(-200, -200, 1400, 800, 50, 9, t)}</g>`;
      // the street below: brick fronts across the road, snow on the ground in February
      g += once('wsrow', () => { let s = ''; for (let i = 0; i < 7; i++) { const x = -360 + i * 240; s += `<rect x="${x}" y="700" width="236" height="760" fill="${['#7a4232', '#8a4a36', '#6a3a2c'][i % 3]}"/><rect x="${x - 4}" y="684" width="244" height="22" fill="#4a2418"/>` + [0, 1].map(k => `<rect x="${x + 40 + k * 100}" y="760" width="56" height="90" fill="#2a3440"/><rect x="${x + 40 + k * 100}" y="920" width="56" height="90" fill="#2a3440"/>`).join(''); } return s; });
      g += `<rect x="-600" y="700" width="2400" height="1000" fill="#000" opacity="${f(0.75 * (1 - day))}"/>`;
      if (se < 0.14) g += `<path d="M-600,676 L1800,676 L1800,700 L-600,700Z" fill="#f2f4f6" opacity="${f((1 - se / 0.14) * (0.5 + 0.5 * day))}"/>`;
      // two street trees in front of the houses: bare in winter (snow on the boughs), blossom and green in spring and
      // summer, orange in October
      const leafN = cl((se - 0.1) / 0.2), col = se < 0.36 ? mix('#e8b8c8', '#5a8a3a', cl((se - 0.2) / 0.16)) : mix('#4a7a32', '#c8701e', cl((se - 0.74) / 0.22));
      for (const [tx, sd] of [[260, 3], [740, 5]]) {
        const ty = -220;
        g += `<path d="M${tx},1300 C${tx - 6},${1100 + ty} ${tx + 6},${980 + ty} ${tx},${820 + ty} M${tx},${980 + ty} C${tx - 60},${920 + ty} ${tx - 120},${880 + ty} ${tx - 170},${800 + ty} M${tx + 2},${940 + ty} C${tx + 70},${880 + ty} ${tx + 120},${820 + ty} ${tx + 160},${760 + ty} M${tx},${860 + ty} C${tx - 30},${780 + ty} ${tx - 20},${720 + ty} ${tx - 40},${660 + ty}" stroke="${mix('#2a2018', '#0a0a0e', 1 - day)}" stroke-width="16" fill="none" stroke-linecap="round"/>`;
        const r = rng(sd);
        for (let k = 0; k < 26; k++) { const a = r() * TAU, d = Math.sqrt(r()), lx = tx + Math.cos(a) * d * 200, ly = 780 + ty + Math.sin(a) * d * 150, rr = 26 + r() * 24, on = cl(leafN * 26 - k); if (on > 0.01) g += `<circle cx="${f(lx)}" cy="${f(ly + Math.sin(t * 1.3 + k) * 3)}" r="${f(rr * on)}" fill="${mix(shade(col, (r() - 0.5) * 0.3), '#0a0e14', 1 - day)}" opacity="0.92"/>`; }
        if (se < 0.14) g += `<path d="M${tx - 170},${796 + ty} C${tx - 120},${876 + ty} ${tx - 60},${916 + ty} ${tx},${976 + ty} M${tx + 160},${756 + ty} C${tx + 120},${816 + ty} ${tx + 70},${876 + ty} ${tx + 2},${936 + ty}" stroke="#f4f6f8" stroke-width="6" fill="none" opacity="${f(0.8 * day)}"/>`;
      }
      return g;
    })() });
    // the wall: pale green over a darker dado, the tall window, a radiator, the calendar, the clock
    L.push({ p: 0.9, svg: once('wswall', () => {
      let g = `<defs><clipPath id="wswc"><path d="M-2000,-800 L3400,-800 L3400,2400 L-2000,2400Z M${wx},${wy} L${wx + ww},${wy} L${wx + ww},${wy + wh} L${wx},${wy + wh}Z M${WS.DOOR[0]},${WS.DOOR[1]} L${WS.DOOR[0] + WS.DOOR[2]},${WS.DOOR[1]} L${WS.DOOR[0] + WS.DOOR[2]},${WS.FY} L${WS.DOOR[0]},${WS.FY}Z" clip-rule="evenodd"/></clipPath>${LG('wsw', [[0, '#e2e6d0'], [1, '#c6ceb2']])}</defs>`;
      g += `<g clip-path="url(#wswc)"><rect x="-2000" y="-800" width="5400" height="3200" fill="url(#wsw)"/><rect x="-2000" y="1180" width="5400" height="${WS.FY - 1180}" fill="#8aa08a"/><rect x="-2000" y="1172" width="5400" height="14" fill="#5a705a"/></g>`;
      g += panes(wx, wy, ww, wh, 2, 4, '#f2f0e8', 14) + `<rect x="${wx - 40}" y="${wy + wh + 10}" width="${ww + 80}" height="24" fill="#f2f0e8" ${olr(1.4)}/>`;
      g += `<rect x="${WS.DOOR[0] - 22}" y="${WS.DOOR[1] - 22}" width="${WS.DOOR[2] + 44}" height="${WS.FY - WS.DOOR[1] + 22}" fill="none" stroke="#e8e6dc" stroke-width="22"/>`;
      // a long white curtain on a ceiling rail between the beds
      g += `<path d="M1180,60 L1820,60" stroke="#8a8a84" stroke-width="10"/><path d="M1200,70 C1210,600 1190,1100 1206,${WS.FY} L1460,${WS.FY} C1450,1100 1470,600 1460,70Z" fill="#e4eae2" ${olr(1.6)}/>` + Array.from({ length: 5 }, (_, i) => `<path d="M${1230 + i * 50},80 C${1240 + i * 50},700 ${1220 + i * 50},1200 ${1236 + i * 50},${WS.FY}" stroke="#c4ccc0" stroke-width="6" fill="none"/>`).join('');
      return g;
    }) + (() => {
      const [cx, cy] = WS.CAL;
      const page = (mi, dx = 0, dy = 0, rot = 0, op = 1) => `<g transform="translate(${f(dx)},${f(dy)}) rotate(${f(rot)} ${cx} ${cy})" opacity="${f(op)}"><rect x="${cx - 70}" y="${cy}" width="140" height="170" fill="#f6f2e8" ${olr(1.4)}/><rect x="${cx - 70}" y="${cy}" width="140" height="44" fill="#2a4a6a"/><text x="${cx}" y="${cy + 32}" text-anchor="middle" font-family="Georgia,serif" font-size="28" font-weight="bold" fill="#fff">${MONTHS[cl(Math.floor(mi) - 1, 0, 9)]}</text>` +
        Array.from({ length: 20 }, (_, i) => `<rect x="${cx - 60 + (i % 5) * 24}" y="${cy + 56 + Math.floor(i / 5) * 26}" width="18" height="16" fill="#d8d0c0"/>`).join('') + `</g>`;
      // o.calNew underneath, o.calOld on top lifting away as o.flip runs 0..1 (at 0 it covers the new page exactly)
      let g;
      if (o.calOld) { const k = o.flip || 0; g = page(o.calNew) + (k < 0.999 ? page(o.calOld, 30 * k, -150 * k * k - 40 * k, -10 * k, 1 - k * k) : ''); }
      else g = page(o.cal || 2);
      const [kx, ky] = WS.CLOCK, hr = (o.clock ?? 10) * TAU / 12, mn = (o.clock ?? 10) * TAU;
      g += `<circle cx="${kx}" cy="${ky}" r="70" fill="#f8f6ee" stroke="#3a3a3a" stroke-width="8"/>` + Array.from({ length: 12 }, (_, i) => { const a = i / 12 * TAU; return `<path d="M${f(kx + Math.sin(a) * 56)},${f(ky - Math.cos(a) * 56)} L${f(kx + Math.sin(a) * 64)},${f(ky - Math.cos(a) * 64)}" stroke="#3a3a3a" stroke-width="4"/>`; }).join('') +
        `<path d="M${kx},${ky} L${f(kx + Math.sin(hr) * 34)},${f(ky - Math.cos(hr) * 34)}" stroke="#1a1a1a" stroke-width="7" stroke-linecap="round"/><path d="M${kx},${ky} L${f(kx + Math.sin(mn) * 52)},${f(ky - Math.cos(mn) * 52)}" stroke="#1a1a1a" stroke-width="4" stroke-linecap="round"/>`;
      return g;
    })() });
    // through the doorway: the lit corridor
    L.push({ p: 0.82, svg: once('wsdoor', () => `<rect x="${WS.DOOR[0] - 200}" y="${WS.DOOR[1] - 40}" width="${WS.DOOR[2] + 400}" height="${WS.FY - WS.DOOR[1] + 80}" fill="#d8dcc8"/><rect x="${WS.DOOR[0] - 200}" y="1250" width="${WS.DOOR[2] + 400}" height="500" fill="#7a9a82"/><circle cx="${WS.DOOR[0] + 160}" cy="${WS.DOOR[1] + 40}" r="30" fill="#fff8e0"/>`) });
    // the next bed down the ward (a sleeping patient's shape under the covers)
    L.push({ p: 0.94, svg: once('wsbed2', () => PR.bedSide(1560, 1840, 760, 0.8, { chart: true }) + `<path d="M${1560 + 80 * 0.8},${1840 - 410 * 0.8} C${1660},${1840 - 520 * 0.8} ${1900},${1840 - 470 * 0.8} ${2100},${1840 - 440 * 0.8} L${2140},${1840 - 330 * 0.8} L${1600},${1840 - 330 * 0.8}Z" fill="#cfd4ce" ${olr(1.4)}/><ellipse cx="${1640}" cy="${1840 - 470 * 0.8}" rx="46" ry="38" fill="#3a2a22"/>`) });
    L.push({ p: 1, svg: once('wsfloor', () => `<rect x="-2000" y="${WS.FY}" width="5400" height="1200" fill="#8e8c7c"/>` + Array.from({ length: 70 }, (_, i) => `<rect x="${-2000 + (i % 14) * 380}" y="${WS.FY + Math.floor(i / 14) * 120}" width="190" height="120" fill="#7c7a6c" opacity="0.6"/>`).join('') + `<rect x="-2000" y="${WS.FY}" width="5400" height="60" fill="#000" opacity="0.15"/>`) });
    L.push({ p: 0.9, light: true, svg: `<g opacity="${f(0.85 * day)}">${shaft([[wx, wy + 40], [wx + ww, wy + 40], [1500, 2700], [300, 2700]], '#fff4dc', 0.22, 'wssun', 0.18)}</g>` + motes(wx, wy, wx + 900, 2000, 24, 51, t, '#fff8e0', 0.35 * day) +
      (day < 0.6 ? `<rect x="-3000" y="-3000" width="8000" height="8000" fill="#060a18" opacity="${f(0.55 * (1 - day / 0.6))}"/>` + C.radial(400, 1250, 700, '#ffd8a0', 0.22 * (1 - day), 'screen') : '') });
    return L;
  };

  // ======================================================= THE FRONT WINDOW AT NIGHT, from the street in the rain: the warm
  // room behind (p 0.72), the children at the glass (shot, p 1), the brick front and the window frame (p 1.1) with
  // rain running down the panes, rain falling in front (p 1.25)
  const HW = S.HW = { WIN: [200, 380, 680, 1000], RAIL: 820, SILL: 1380 };
  S.homeWin = (t, o = {}) => {
    const L = [], [wx, wy, ww, wh] = HW.WIN;
    L.push({ p: 0.72, svg: once('hwroom', () => {
      let g = `<defs>${LG('hwp', [[0, '#a8b496'], [1, '#8a9878']])}</defs><rect x="-1200" y="-400" width="3400" height="2600" fill="url(#hwp)"/>`;
      for (let x = -1200; x < 2200; x += 64) g += `<path d="M${x},-400 L${x},2200" stroke="#7a8a6a" stroke-width="10" opacity="0.3"/>`;
      g += `<rect x="-1200" y="360" width="3400" height="14" fill="#6a4a2c"/>`;
      // a framed photograph of the family, a doorway into the dark hall, the floor lamp's shade
      g += `<rect x="460" y="560" width="180" height="230" fill="#2a2018" ${olr(1.6)}/><rect x="472" y="572" width="156" height="206" fill="#b8a888"/><ellipse cx="530" cy="650" rx="22" ry="26" fill="#4a3426"/><ellipse cx="580" cy="664" rx="18" ry="22" fill="#4a3426"/><path d="M490,778 C500,700 620,700 630,778Z" fill="#3a2a20"/>`;
      g += `<rect x="-200" y="440" width="300" height="1500" fill="#1a1410"/><rect x="-224" y="420" width="348" height="1540" fill="none" stroke="#d8d0bc" stroke-width="24"/>`;
      g += `<path d="M1040,1900 L1040,760" stroke="#8a7a50" stroke-width="10"/><path d="M960,760 L1120,760 L1090,650 L990,650Z" fill="#f6dca0" ${olr(1.6)}/>`;
      g += `<rect x="-1200" y="1500" width="3400" height="900" fill="#6a4a2e"/>`;
      return g;
    }) + C.radial(1040, 720, 900, '#ffc070', 0.45, 'screen') + C.radial(1040, 700, 160, '#fff0c0', 0.5, 'screen') });
    // the façade: brick, the window opening, the frame and the sill; rain streaming down the glass
    L.push({ p: 1.1, svg: once('hwfront', () => {
      let g = `<defs><clipPath id="hwfc"><path d="M-1600,-800 L2800,-800 L2800,3200 L-1600,3200Z M${wx},${wy} L${wx + ww},${wy} L${wx + ww},${wy + wh} L${wx},${wy + wh}Z" clip-rule="evenodd"/></clipPath>${LG('hwbr', [[0, '#5a2a20'], [1, '#3a1a14']])}${LG('hwgl', [[0, '#9ab8e0', 0.16], [0.5, '#9ab8e0', 0.03], [1, '#9ab8e0', 0.12]], 1, 1)}</defs>`;
      g += `<g clip-path="url(#hwfc)"><rect x="-1600" y="-800" width="4400" height="4000" fill="url(#hwbr)"/>`;
      for (let y = -800, row = 0; y < 3200; y += 36, row++) { g += `<path d="M-1600,${y} L2800,${y}" stroke="#2a120c" stroke-width="5" opacity="0.7"/>`; for (let x = -1600 + (row % 2) * 60; x < 2800; x += 120) g += `<path d="M${x},${y} L${x},${y + 36}" stroke="#2a120c" stroke-width="4" opacity="0.6"/>`; }
      g += `</g>`;
      // marble lintel and sill, the white sash frame with the meeting rail
      g += `<rect x="${wx - 50}" y="${wy - 70}" width="${ww + 100}" height="56" fill="#d8d4cc" ${olr(1.8)}/><rect x="${wx - 70}" y="${HW.SILL}" width="${ww + 140}" height="50" fill="#e0dcd2" ${olr(1.8)}/><rect x="${wx - 60}" y="${HW.SILL + 50}" width="${ww + 120}" height="20" fill="#000" opacity="0.4"/>`;
      g += `<rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" fill="url(#hwgl)"/>` + `<rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" fill="none" stroke="#efece4" stroke-width="30"/><rect x="${wx}" y="${HW.RAIL - 16}" width="${ww}" height="32" fill="#efece4" ${olr(1.4)}/><rect x="${wx - 15}" y="${wy - 15}" width="${ww + 30}" height="${wh + 30}" fill="none" ${olr(2)}/>`;
      return g;
    }) + (() => {
      // drops: fixed beads and runnels sliding down, all inside the panes
      const r = rng(77); let g = `<g opacity="${f(0.9 * (o.rain ?? 1))}">`;
      for (let i = 0; i < 60; i++) { const x = wx + 24 + r() * (ww - 48), y = wy + 24 + r() * (wh - 48), rr = 2 + r() * 4; g += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(rr)}" fill="#dfe8f4" opacity="0.35"/><circle cx="${f(x - rr * 0.3)}" cy="${f(y - rr * 0.3)}" r="${f(rr * 0.35)}" fill="#fff" opacity="0.6"/>`; }
      for (let i = 0; i < 16; i++) { const x = wx + 30 + r() * (ww - 60), sp = 90 + r() * 140, len = 80 + r() * 160, y0 = wy + 20 + ((r() * wh + t * sp) % (wh - 40)); g += `<path d="M${f(x)},${f(Math.max(wy + 20, y0 - len))} Q${f(x + 4)},${f(y0 - len * 0.5)} ${f(x + (r() - 0.5) * 6)},${f(y0)}" stroke="#e8f0fa" stroke-width="2.5" fill="none" opacity="0.4"/><circle cx="${f(x)}" cy="${f(y0)}" r="4.5" fill="#eef4fc" opacity="0.6"/>`; }
      return g + '</g>';
    })() });
    // the cold street light raking the bricks; the window's own warm spill on the frame
    L.push({ p: 1.1, light: true, svg: C.radial(-500, 200, 1600, '#7a98d0', 0.3, 'screen') + C.radial(wx + ww / 2, wy + wh / 2, 700, '#ffb860', 0.18, 'screen') + `<rect x="-3000" y="-3000" width="8000" height="8000" fill="#04060e" opacity="0.25"/>` });
    // falling rain in front of the lens
    L.push({ p: 1.25, svg: (() => { const r = rng(5); let g = ''; for (let i = 0; i < 120; i++) { const x = -800 + r() * 2800, sp = 1300 + r() * 700, y = -600 + ((r() * 3200 + t * sp) % 3200); g += `<path d="M${f(x)},${f(y)} l-10,${f(60 + r() * 50)}" stroke="#b8c8e8" stroke-width="${f(2 + r() * 2)}" stroke-linecap="round" opacity="${f(0.18 + r() * 0.16)}"/>`; } return g; })() });
    return L;
  };

  // ======================================================= THE LAB TODAY: a window onto the city, the biosafety cabinet, a bench
  // with the monitor of living cells, a centrifuge and pipettes; two incubators stacked on a stand (the lower door opens
  // with o.open), her photograph taped to the upper door (o.photo: svg drawn over the door; image area LN.PHOTO =
  // [x, y, k] for P.photo); the -80 freezer and shelves of flasks at the right
  const LN = S.LN = { FY: 1720, BENCH: 1340, B0: 290, B1: 990, BSC: [-260, 340, 260, 980], MON: [420, 900, 280, 180], INC: [1160, 1560], INC2: [1160, 1098], PHOTO: [1063, 712, 0.18], FRZ: [1560, 1720] };
  S.labNow = (t, o = {}) => {
    const L = [];
    L.push({ p: 0.5, svg: once('lnwin2', () => {
      let g = `<defs>${LG('lnsky2', [[0, '#8ab4dc'], [1, '#e2ecf2']])}</defs><rect x="-1700" y="-200" width="1700" height="1700" fill="url(#lnsky2)"/>`;
      const r = rng(7);
      for (let i = 0; i < 9; i++) { const x = -1650 + i * 190, h = 380 + r() * 520, c = ['#8a98a8', '#9aa6b2', '#7a8898'][i % 3]; g += `<rect x="${x}" y="${1100 - h}" width="176" height="${h + 500}" fill="${c}"/>`; for (let k = 0; k < 16; k++) g += `<rect x="${x + 14 + (k % 4) * 40}" y="${1100 - h + 24 + Math.floor(k / 4) * 70}" width="26" height="40" fill="#c8dcec" opacity="0.7"/>`; }
      return g;
    }) });
    L.push({ p: 0.88, svg: once('lnwall2', () => {
      let g = `<defs><clipPath id="lnwc2"><path d="M-2400,-800 L3400,-800 L3400,2400 L-2400,2400Z M-1100,240 L-400,240 L-400,1000 L-1100,1000Z" clip-rule="evenodd"/></clipPath>${LG('lnw2', [[0, '#f2f4f4'], [1, '#dfe3e4']])}</defs><g clip-path="url(#lnwc2)"><rect x="-2400" y="-800" width="5800" height="3200" fill="url(#lnw2)"/></g>`;
      g += panes(-1100, 240, 700, 760, 2, 2, '#e8ecee', 16);
      for (let i = 0; i < 6; i++) g += `<rect x="${-1500 + i * 700}" y="-60" width="440" height="40" rx="6" fill="#ffffff" ${olr(1)}/>`;
      // wall cupboards over the bench, the shelves of flasks and a poster at the right
      g += `<rect x="330" y="380" width="640" height="230" fill="#f6f8f8" ${olr(1.6)}/><path d="M650,380 L650,610" stroke="#c8ccce" stroke-width="4"/><rect x="620" y="560" width="10" height="34" rx="4" fill="#9aa0a4"/><rect x="672" y="560" width="10" height="34" rx="4" fill="#9aa0a4"/>`;
      for (const y of [520, 780]) { g += `<rect x="1760" y="${y}" width="700" height="14" fill="#c8ccce" ${olr(1)}/>`; for (let i = 0; i < 7; i++) g += PR.flask(1810 + i * 92, y, 0.3, 0, { level: 0.3 }); }
      g += `<rect x="1790" y="920" width="230" height="300" fill="#fbfbf8" ${olr(1.2)}/>` + Array.from({ length: 6 }, (_, i) => { const a = i / 6 * TAU; return `<circle cx="${f(1905 + Math.cos(a) * 70)}" cy="${f(1050 + Math.sin(a) * 70)}" r="22" fill="${['#e48aa0', '#8ac0e0', '#a0d0a0', '#f0c070', '#c8a0e0', '#e8a080'][i]}" opacity="0.8"/>`; }).join('') + `<circle cx="1905" cy="1050" r="96" fill="none" stroke="#5a6a7a" stroke-width="3" stroke-dasharray="8 6"/>`;
      return g;
    }) });
    L.push({ p: 0.93, svg: once('lnbsc2', () => {
      const [x0, y0, x1, y1] = LN.BSC;
      return `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${LN.FY - y0}" fill="#d8dcde" ${olr(2)}/><rect x="${x0 + 30}" y="${y0 + 120}" width="${x1 - x0 - 60}" height="${y1 - y0 - 140}" fill="#f4fbff" ${olr(1.4)}/><rect x="${x0 + 30}" y="${y0 + 120}" width="${x1 - x0 - 60}" height="${f((y1 - y0 - 140) * 0.55)}" fill="#c8e0ee" opacity="0.5" ${olr(1)}/>` +
        `<rect x="${x0 + 30}" y="${y0 + 30}" width="${x1 - x0 - 60}" height="60" fill="#3a4448"/><circle cx="${x1 - 70}" cy="${y0 + 60}" r="10" fill="#5ae0a0"/><rect x="${x0 + 50}" y="${y0 + 46}" width="180" height="28" fill="#1a2a2a"/><path d="M${x0 + 30},${y1 - 20} L${x1 - 30},${y1 - 20}" stroke="#9aa0a4" stroke-width="10"/>` +
        PR.flask(x0 + 160, y1 - 30, 0.32, 0, { level: 0.3 }) + `<rect x="${x0 + 300}" y="${y1 - 120}" width="20" height="100" rx="6" fill="#e8e8ea" ${olr(1)}/><rect x="${x0 + 40}" y="${y1 + 30}" width="${x1 - x0 - 80}" height="${LN.FY - y1 - 60}" fill="#c8ccd0" ${olr(1.2)}/>`;
    }) + C.radial((LN.BSC[0] + LN.BSC[2]) / 2, (LN.BSC[1] + LN.BSC[3]) / 2, 420, '#f0faff', 0.35, 'screen') });
    L.push({ p: 0.97, svg: once('lnbench2', () => {
      const { B0: x0, B1: x1, BENCH: y } = LN;
      let g = `<rect x="${x0}" y="${y}" width="${x1 - x0}" height="30" fill="#2e3236" ${olr(1.6)}/><rect x="${x0 + 10}" y="${y + 30}" width="${x1 - x0 - 20}" height="${LN.FY - y - 30}" fill="#e8eaec" ${olr(1.4)}/>`;
      for (let i = 0; i < 2; i++) g += `<rect x="${x0 + 26 + i * 340}" y="${y + 50}" width="320" height="${LN.FY - y - 70}" fill="#f0f2f4" ${olr(1)}/><rect x="${x0 + 156 + i * 340}" y="${y + 80}" width="60" height="10" rx="4" fill="#9aa0a4"/>`;
      // centrifuge, pipettes on a carousel, boxes of tips
      g += `<path d="M640,${y} L640,${y - 100} C640,${y - 130} 800,${y - 130} 800,${y - 100} L800,${y}Z" fill="#f2f4f6" ${olr(1.6)}/><rect x="660" y="${y - 70}" width="60" height="22" rx="3" fill="#1a2a2a"/><circle cx="770" cy="${y - 58}" r="9" fill="#5ae0a0"/>`;
      g += `<rect x="846" y="${y - 12}" width="70" height="12" fill="#9aa0a4"/><path d="M881,${y - 12} L881,${y - 230}" stroke="#8a9094" stroke-width="8"/>` + [-28, 0, 26].map((dx, i) => `<path d="M${881 + dx},${y - 214} L${885 + dx * 1.2},${y - 60}" stroke="${['#f0f0f2', '#e8e8ec', '#f4f4f6'][i]}" stroke-width="14" stroke-linecap="round"/><rect x="${875 + dx}" y="${y - 236}" width="14" height="22" rx="4" fill="${['#3a6aa8', '#e8b030', '#c83a3a'][i]}"/>`).join('');
      g += `<rect x="930" y="${y - 50}" width="50" height="50" rx="4" fill="#3a7ac8" opacity="0.85" ${olr(1)}/><rect x="300" y="${y - 44}" width="90" height="44" rx="4" fill="#e8c040" opacity="0.85" ${olr(1)}/>`;
      return g;
    }) + (() => {
      const [mx, my, mw, mh] = LN.MON;
      let g = `<rect x="${mx - 10}" y="${my - 10}" width="${mw + 20}" height="${mh + 20}" rx="8" fill="#1a1c1e" ${olr(1.4)}/><rect x="${mx}" y="${my}" width="${mw}" height="${mh}" fill="#2a1a26"/><path d="M${mx + mw / 2},${my + mh + 10} l0,${LN.BENCH - my - mh - 10}" stroke="#2a2c2e" stroke-width="16"/><rect x="${mx + mw / 2 - 60}" y="${LN.BENCH - 12}" width="120" height="12" fill="#2a2c2e"/>`;
      g += `<defs><clipPath id="lnmc2"><rect x="${mx}" y="${my}" width="${mw}" height="${mh}"/></clipPath></defs><g clip-path="url(#lnmc2)">`;
      for (let i = 0; i < 16; i++) { const r = rng(300 + i), x = mx + 20 + r() * (mw - 40) + Math.sin(t * 0.6 + i) * 5, y = my + 20 + r() * (mh - 40) + Math.cos(t * 0.5 + i) * 5; g += PR.cell(x, y, 17, t, { seed: 300 + i, life: 1, phase: i === 3 ? (t * 0.3) % 1 : 0, axis: 0.6 }); }
      return g + `</g><rect x="${mx}" y="${my}" width="${mw}" height="${mh}" fill="#fff" opacity="0.06"/>` + (o.bench || '');
    })() });
    // the incubators on their stand, the photograph, the freezer
    L.push({ p: 0.98, svg: (() => {
      const [ix, iy] = LN.INC, [jx, jy] = LN.INC2;
      let g = once('lnstand', () => `<path d="M${ix - 170},${iy} L${ix + 170},${iy} L${ix + 170},${iy + 24} L${ix - 170},${iy + 24}Z" fill="#8a9094" ${olr(1.4)}/><path d="M${ix - 150},${iy + 24} L${ix - 150},${LN.FY} M${ix + 150},${iy + 24} L${ix + 150},${LN.FY}" stroke="#7a8084" stroke-width="16"/><path d="M${ix - 150},${LN.FY - 50} L${ix + 150},${LN.FY - 50}" stroke="#7a8084" stroke-width="10"/>`);
      g += PR.incubator(jx, jy, 1.1, t, { open: 0 }) + (o.photo || '') + PR.incubator(ix, iy, 1.1, t, { open: o.open || 0 });
      g += once('lnfrz', () => { const [fx, fy] = LN.FRZ; return `<rect x="${fx - 140}" y="${fy - 1000}" width="280" height="1000" rx="10" fill="#f2f4f4" ${olr(2)}/><rect x="${fx - 120}" y="${fy - 970}" width="110" height="40" rx="4" fill="#1a2a2a"/><text x="${fx - 112}" y="${fy - 941}" font-family="Consolas,monospace" font-size="26" fill="#ff5a4a">-80°C</text><rect x="${fx + 96}" y="${fy - 700}" width="16" height="200" rx="6" fill="#9aa0a4"/><path d="M${fx - 140},${fy - 900} L${fx + 140},${fy - 900}" stroke="#c8ccce" stroke-width="4"/><rect x="${fx - 100}" y="${fy - 860}" width="80" height="60" fill="#f6e070" opacity="0.8"/>`; });
      return g;
    })() });
    L.push({ p: 1, svg: once('lnfloor2', () => `<rect x="-2400" y="${LN.FY}" width="5800" height="1200" fill="#c4c8cc"/>` + Array.from({ length: 52 }, (_, i) => `<rect x="${-2400 + (i % 13) * 440}" y="${LN.FY + Math.floor(i / 13) * 150}" width="440" height="150" fill="none" stroke="#acb0b4" stroke-width="3"/>`).join('') + `<rect x="-2400" y="${LN.FY}" width="5800" height="50" fill="#000" opacity="0.12"/>`) });
    L.push({ p: 0.9, light: true, svg: C.radial(700, 200, 1500, '#ffffff', 0.14, 'screen') + `<g opacity="0.6">${shaft([[-1100, 300], [-400, 300], [600, 2600], [-700, 2600]], '#f4f8ff', 0.18, 'lnsun', 0.12)}</g>` });
    return L;
  };

  // ======================================================= INSIDE HER (warm and organic, never an x-ray): deep red depths with
  // soft forms, the great wet folds of the womb wall, capillaries with blood moving in them, cells drifting past the
  // lens; the near wall (p 1) bulges up across the lower frame and the shot grows the tumour on it near IN.SPOT
  const IN = S.IN = { SPOT: [560, 1420] };
  const VESS = [[[-700, 1200], [-300, 1080], [100, 1150], [420, 1000], [800, 1060], [1200, 940], [1700, 1020]], [[-500, 1650], [-100, 1520], [300, 1580], [700, 1460], [1100, 1540], [1600, 1440]],
    [[200, 600], [380, 800], [300, 1000], [460, 1200], [420, 1400]], [[900, 500], [820, 760], [940, 980], [880, 1240], [980, 1500]], [[-300, 700], [-100, 860], [-200, 1080], [0, 1300]]];
  let VESP = null;
  S.inside = (t, o = {}) => {
    const L = [], sm = S.smoothD;
    if (!VESP) VESP = VESS.map(p => { const pts = S.crSample(p, 10); return { pts, L: S.routeLen(pts) }; });
    L.push({ p: 0.45, svg: once('inbg', () => {
      let g = `<defs><radialGradient id="inb0"><stop offset="0" stop-color="#8a2a2e" stop-opacity="0.9"/><stop offset="0.6" stop-color="#5a1418" stop-opacity="0.5"/><stop offset="1" stop-color="#3a0a0e" stop-opacity="0"/></radialGradient><radialGradient id="inb1"><stop offset="0" stop-color="#c8605a" stop-opacity="0.55"/><stop offset="1" stop-color="#7a2224" stop-opacity="0"/></radialGradient></defs><rect x="-3000" y="-3000" width="7000" height="8000" fill="#240508"/>`;
      const r = rng(13); for (let i = 0; i < 26; i++) g += `<ellipse cx="${f(-1200 + r() * 3600)}" cy="${f(-600 + r() * 3600)}" rx="${f(200 + r() * 420)}" ry="${f(160 + r() * 300)}" fill="url(#inb${i % 3 ? 0 : 1})"/>`;
      return g;
    }) });
    // the far folds: broad wet ridges of tissue, each a dark crease, the body, a lit crest and a thin specular line
    L.push({ p: 0.72, svg: once('infold', () => {
      const folds = [[[[-1400, 200], [-600, 420], [200, 300], [1000, 460], [1900, 340], [2600, 420]], 300], [[[-1400, 760], [-400, 640], [400, 800], [1200, 660], [2100, 800]], 240], [[[-1400, 2300], [-500, 2080], [400, 2220], [1300, 2020], [2300, 2160]], 320], [[[-1300, -300], [-300, -160], [700, -280], [1800, -140]], 260]];
      let g = '';
      for (const [p, w] of folds) { const d = sm(S.crSample(p, 10)); g += `<path d="${d}" stroke="#1e0306" stroke-width="${w + 50}" fill="none" stroke-linecap="round" opacity="0.8"/><path d="${d}" stroke="#7a2228" stroke-width="${w}" fill="none" stroke-linecap="round"/><path d="${d}" stroke="#a8444a" stroke-width="${f(w * 0.6)}" fill="none" stroke-linecap="round" transform="translate(${f(-w * 0.05)},${f(-w * 0.1)})"/><path d="${d}" stroke="#d07a74" stroke-width="${f(w * 0.22)}" fill="none" stroke-linecap="round" transform="translate(${f(-w * 0.1)},${f(-w * 0.22)})" opacity="0.7"/><path d="${d}" stroke="#ffd8cc" stroke-width="${f(w * 0.04)}" fill="none" stroke-linecap="round" transform="translate(${f(-w * 0.12)},${f(-w * 0.3)})" opacity="0.55"/>`; }
      return g;
    }) });
    // capillaries with red cells streaming along them
    L.push({ p: 0.88, svg: (() => {
      let g = '';
      VESP.forEach(({ pts, L: Ld }, i) => {
        const d = sm(pts), w = i < 2 ? 20 : 12;
        g += `<path d="${d}" stroke="#3a0408" stroke-width="${w + 8}" fill="none" stroke-linecap="round"/><path d="${d}" stroke="#b0242a" stroke-width="${w}" fill="none" stroke-linecap="round"/><path d="${d}" stroke="#f07a70" stroke-width="${f(w * 0.25)}" fill="none" opacity="0.6" transform="translate(-2,-3)"/>`;
        for (let k = 0; k < 14; k++) { const u = ((k / 14 + t * 0.06 * (i % 2 ? 1 : -1)) % 1 + 1) % 1, p = S.routeAt(pts, Ld, u); g += `<ellipse cx="${f(p[0])}" cy="${f(p[1])}" rx="${f(w * 0.36)}" ry="${f(w * 0.26)}" fill="#e0342e" stroke="#6a0a0e" stroke-width="1.2"/>`; }
      });
      return g;
    })() });
    // the near wall: a soft glistening bulge of pink-red tissue rising across the lower frame
    L.push({ p: 1, svg: once('inwall', () => {
      let g = `<defs><radialGradient id="inwg" gradientUnits="userSpaceOnUse" cx="480" cy="1500" r="1300"><stop offset="0" stop-color="#c25a60"/><stop offset="0.5" stop-color="#94343c"/><stop offset="1" stop-color="#4a0e14"/></radialGradient></defs>`;
      const top = `M-1600,2000 C-900,1560 -200,1300 560,1290 C1300,1290 1900,1520 2600,1900`;
      g += `${''}<path d="${top} L2600,3400 L-1600,3400Z" fill="url(#inwg)" stroke="#2a0408" stroke-width="4"/>`;
      g += `<path d="M-1200,1830 C-600,1460 -100,1330 560,1320 C1200,1330 1700,1480 2200,1760" stroke="#ffd0c4" stroke-width="10" fill="none" opacity="0.45"/><path d="M-1000,1780 C-500,1480 0,1370 560,1360" stroke="#fff" stroke-width="4" fill="none" opacity="0.35"/>`;
      const r = rng(19); for (let i = 0; i < 60; i++) { const x = -900 + r() * 2900, y = 1420 + r() * 1300 + Math.abs(x - 560) * 0.25; g += `<path d="M${f(x)},${f(y)} q${f(30 + r() * 40)},${f(-14 - r() * 10)} ${f(70 + r() * 60)},0" stroke="${r() < 0.5 ? '#6a1a20' : '#d88078'}" stroke-width="${f(3 + r() * 3)}" fill="none" opacity="0.5"/>`; }
      return g;
    }) });
    // cells drifting just in front of the lens
    L.push({ p: 1.3, light: true, svg: (() => { const r = rng(23); let g = ''; for (let i = 0; i < 22; i++) { const x = -600 + r() * 2400 + Math.sin(t * 0.4 + i) * 40, y = ((r() * 2800 - t * 50 * (0.5 + r())) % 2800 + 2800) % 2800 - 400, rr = 14 + r() * 26; g += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(rr)}" fill="${r() < 0.6 ? '#ffb0a0' : '#c84a46'}" opacity="${f(0.14 + r() * 0.16)}" filter="url(#b8)"/>`; } return g; })() });
    L.push({ p: 1, light: true, svg: C.radial(500, 1100, 1300, '#ff9a7a', 0.22, 'screen') + C.radial(560, 1250, 500, '#ffd0b0', 0.18, 'screen') });
    return L;
  };

  // ======================================================= deep space behind the Earth
  S.space = t => [{ p: 0.15, svg: once('spbg', () => `<defs><radialGradient id="spneb" cx="30%" cy="30%" r="80%"><stop offset="0" stop-color="#1a1430"/><stop offset="0.6" stop-color="#070812"/><stop offset="1" stop-color="#020205"/></radialGradient></defs><rect x="-3000" y="-3000" width="7000" height="8000" fill="url(#spneb)"/>`) + starsW(-1600, -1600, 2700, 3600, 260, 41, t) }];
})(window);
