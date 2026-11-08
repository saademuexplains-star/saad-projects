// Sets for "The Cells That Never Died" part 2: George Gey's tissue-culture lab at night (1951), the field of the
// microscope, a school hall on vaccination day (1954), a production line of vials, the family burial ground in Clover,
// Virginia (1951 and today), and a cell-biology lab today with her photograph on the incubator.
(function (G) {
  const S = G.SETS, { f, shade, mix, rng } = G.RIG, C = G.CINE, PR = G.PROPS;
  const { boards, frame, motes, shaft, darkPool, LG, olr, starsW } = S.H17;
  const cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const TAU = Math.PI * 2;
  const cache = {}, once = (k, fn) => cache[k] || (cache[k] = fn());

  // ======================================================= GEY'S LAB (night; o.fill 0..1 crowds the shelves with tubes and
  // bottles; o.day 0..1 for the time-lapse in the window; o.drum: the roller drum turns)
  // floor 1700, the bench top 1380 (x -500..1600), the roller drum hub (150, 1020), the microscope (780, 1380),
  // the window 1040-1340 (y 380-980), the shelves -420..560 (y 460-1180)
  const LB = S.LB = { FY: 1700, BENCH: 1380, DRUM: [150, 1020], SCOPE: [780, 1380], WIN: [1040, 380, 300, 600], SHELF: [-420, 560, 460] };
  S.lab51 = (t, o = {}) => {
    const L = [], [wx, wy, ww, wh] = LB.WIN, day = o.day || 0, fill = o.fill || 0;
    L.push({ p: 0.4, svg: `<defs>${LG('lbsky', [[0, mix('#060a1a', '#8aa8c8', day)], [1, mix('#1a2238', '#e0dcd0', day)]])}</defs><rect x="600" y="0" width="1200" height="1400" fill="url(#lbsky)"/>` +
      once('lbcity', () => { const r = rng(81); let g = ''; for (let i = 0; i < 9; i++) { const x = 700 + i * 110, h = 200 + r() * 260; g += `<rect x="${x}" y="${1000 - h}" width="96" height="${h + 400}" fill="#121624"/>`; for (let k = 0; k < 8; k++) if (r() < 0.4) g += `<rect x="${x + 14 + (k % 3) * 26}" y="${1000 - h + 20 + Math.floor(k / 3) * 50}" width="14" height="22" fill="#ffd890" opacity="0.7"/>`; } return g; }) +
      (day > 0.02 ? `<rect x="600" y="0" width="1200" height="1400" fill="#e8e4d8" opacity="${f(day * 0.55)}"/>` : '') });
    L.push({ p: 0.88, svg: once('lbwall', () => {
      let g = `<defs><clipPath id="lbwc"><path d="M-1600,-600 L2800,-600 L2800,2400 L-1600,2400Z M${wx},${wy} L${wx + ww},${wy} L${wx + ww},${wy + wh} L${wx},${wy + wh}Z" clip-rule="evenodd"/></clipPath>${LG('lbw', [[0, '#c8c2b0'], [1, '#aaa494']])}</defs>`;
      g += `<g clip-path="url(#lbwc)"><rect x="-1600" y="-600" width="4400" height="3000" fill="url(#lbw)"/>`;
      for (let y = 1180; y < LB.FY; y += 44) for (let x = -1600; x < 2800; x += 88) g += `<rect x="${x + (Math.floor(y / 44) % 2) * 44}" y="${y}" width="86" height="42" fill="#e8e6dc" stroke="#c8c4b6" stroke-width="2"/>`;
      g += `</g><rect x="${wx - 16}" y="${wy - 16}" width="${ww + 32}" height="${wh + 32}" fill="none" stroke="#d8d4c4" stroke-width="16"/>` + `<path d="M${wx + ww / 2},${wy} L${wx + ww / 2},${wy + wh} M${wx},${wy + wh / 2} L${wx + ww},${wy + wh / 2}" stroke="#d8d4c4" stroke-width="10"/>`;
      // the shelves of glassware (bottles of chicken plasma, flasks, beakers)
      const [s0, s1, sy] = LB.SHELF;
      for (const y of [sy, sy + 240, sy + 480]) {
        g += `<rect x="${s0}" y="${y}" width="${s1 - s0}" height="16" fill="#6a5034" ${olr(1.4)}/>`;
        for (let i = 0; i < 9; i++) { const x = s0 + 30 + i * 104, k = (i + y) % 4; g += k === 0 ? `<path d="M${x},${y} l0,-90 l14,-20 l0,-30 l20,0 l0,30 l14,20 l0,90Z" fill="#a8641e" fill-opacity="0.75" ${olr(1)}/>` : k === 1 ? `<path d="M${x - 10},${y} L${x + 50},${y} L${x + 34},${y - 70} L${x + 34},${y - 120} L${x + 6},${y - 120} L${x + 6},${y - 70}Z" fill="#dfe8ee" fill-opacity="0.55" ${olr(1)}/>` : k === 2 ? `<rect x="${x}" y="${y - 100}" width="44" height="100" rx="5" fill="#e8eef2" fill-opacity="0.5" ${olr(1)}/><rect x="${x + 3}" y="${y - 40}" width="38" height="38" fill="${PR.MEDIUM}" opacity="0.5"/>` : `<rect x="${x}" y="${y - 70}" width="60" height="70" rx="4" fill="#3a3a40" ${olr(1)}/><rect x="${x + 8}" y="${y - 54}" width="44" height="18" fill="#e8e0c8"/>`; }
      }
      // a blackboard of growth figures and a wall clock
      g += `<rect x="640" y="430" width="300" height="220" fill="#2a3a30" stroke="#8a6a40" stroke-width="12"/>` + Array.from({ length: 6 }, (_, i) => `<path d="M${660 + i * 44},${620 - i * i * 6} l30,${-6 - i * 4}" stroke="#e8e8e0" stroke-width="3" opacity="0.7"/>`).join('') + `<path d="M660,630 L920,630 M660,630 L660,450" stroke="#e8e8e0" stroke-width="3" opacity="0.6"/>`;
      return g;
    }) + (() => {
      // more and more tubes and bottles as the cells multiply (o.fill)
      if (fill < 0.01) return '';
      const n = Math.floor(fill * 60), [s0, s1, sy] = LB.SHELF; let g = '';
      for (let i = 0; i < n; i++) { const row = i % 3, x = s0 + 20 + ((i * 37) % (s1 - s0 - 40)), y = sy + row * 240 - 2; g += PR.testTube(x, y, 0.42, (i % 5 - 2) * 4, { level: 0.5, glow: 0.6 }); }
      return g;
    })() });
    // the bench: a long slate top, cupboards; the roller drum, racks of tubes, a gas burner, the microscope, a notebook
    L.push({ p: 0.97, svg: once('lbbench', () => {
      let g = `<rect x="-700" y="${LB.BENCH}" width="2600" height="40" fill="#2a2a2c" ${olr(2)}/><rect x="-680" y="${LB.BENCH + 40}" width="2560" height="${LB.FY - LB.BENCH - 40}" fill="#6a5034" ${olr(1.6)}/>`;
      for (let i = 0; i < 8; i++) g += `<rect x="${-660 + i * 320}" y="${LB.BENCH + 60}" width="300" height="${LB.FY - LB.BENCH - 80}" fill="#7a5c3c" ${olr(1.2)}/><circle cx="${-660 + i * 320 + 270}" cy="${LB.BENCH + 150}" r="10" fill="#c8a040"/>`;
      // a test-tube rack, a gas burner with its tube, a stack of notebooks
      g += `<rect x="420" y="${LB.BENCH - 90}" width="260" height="20" fill="#8a6a44" ${olr(1.2)}/><rect x="420" y="${LB.BENCH - 30}" width="260" height="30" fill="#8a6a44" ${olr(1.2)}/>`;
      for (let i = 0; i < 8; i++) g += PR.testTube(440 + i * 30, LB.BENCH - 10, 0.5, 0, { level: 0.5 });
      g += `<path d="M1100,${LB.BENCH} l60,0 l-10,-24 l-40,0Z" fill="#3a3a3e" ${olr(1)}/><rect x="1122" y="${LB.BENCH - 150}" width="16" height="126" fill="#8a8a90" ${olr(1)}/><path d="M1160,${LB.BENCH - 12} C1260,${LB.BENCH - 20} 1300,${LB.BENCH + 10} 1400,${LB.BENCH}" stroke="#c84a3a" stroke-width="8" fill="none"/>`;
      g += `<rect x="1260" y="${LB.BENCH - 40}" width="200" height="40" fill="#2a3a5a" ${olr(1.2)}/><rect x="1270" y="${LB.BENCH - 64}" width="180" height="26" fill="#8a2a2a" ${olr(1.2)}/>`;
      return g;
    }) + PR.rollerDrum(LB.DRUM[0], LB.DRUM[1], 0.95, o.drum ?? t, { n: 22, glow: o.glow || 0, every: 1 }) + PR.microscope(LB.SCOPE[0], LB.SCOPE[1], 0.85) +
      `<path d="M1130,${LB.BENCH - 150} C1122,${LB.BENCH - 190} 1134,${LB.BENCH - 210} 1130,${LB.BENCH - 236 + Math.sin(t * 17) * 4} C1142,${LB.BENCH - 206} 1140,${LB.BENCH - 180} 1130,${LB.BENCH - 150}Z" fill="#6a9aff" opacity="0.8"/>` + C.radial(1130, LB.BENCH - 190, 60, '#8ab0ff', 0.4, 'screen') });
    L.push({ p: 1, svg: once('lbfloor', () => `<rect x="-1600" y="${LB.FY}" width="4400" height="1000" fill="#3a3a36"/>` + Array.from({ length: 30 }, (_, i) => `<rect x="${-1600 + (i % 10) * 440}" y="${LB.FY + Math.floor(i / 10) * 120}" width="220" height="120" fill="#46463f" opacity="0.7"/>`).join('')) });
    // a hanging lamp pool over the bench; the night dark elsewhere
    L.push({ p: 1, light: true, svg: C.radial(500, 1200, 700, '#ffe2b0', 0.35, 'screen') + darkPool('lbdk', 500, 1100, 600, 1500, 0.5 * (1 - day), '#050608', -3000, 4000) });
    return L;
  };

  // ======================================================= THE MICROSCOPE FIELD (a warm bright disc in the dark; the shot
  // draws the cells over it). r = field radius; o.tint (0 = the lamp's cream, 1 = a deeper pink stain)
  S.micro = (t, o = {}) => {
    const r = o.r || 900, tint = o.tint || 0;
    let g = `<defs><radialGradient id="mcf" cx="50%" cy="48%" r="52%"><stop offset="0" stop-color="${mix('#fbf3e8', '#f6dce0', tint)}"/><stop offset="0.75" stop-color="${mix('#f2e2cc', '#eac0c8', tint)}"/><stop offset="1" stop-color="${mix('#c8a888', '#b88890', tint)}"/></radialGradient></defs>`;
    g += `<rect x="-2000" y="-2000" width="5080" height="5920" fill="#020203"/><circle cx="540" cy="960" r="${r}" fill="url(#mcf)"/>`;
    // debris and a faint drift in the medium
    const rr = rng(91); for (let i = 0; i < 40; i++) { const a = rr() * TAU, d = Math.sqrt(rr()) * r * 0.95, x = 540 + Math.cos(a) * d + Math.sin(t * 0.3 + i) * 6, y = 960 + Math.sin(a) * d + Math.cos(t * 0.25 + i) * 6; g += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(1.5 + rr() * 3)}" fill="#b89888" opacity="0.35"/>`; }
    return [{ p: 1, svg: g }];
  };
  // the dark ring of the eyepiece over everything
  S.microRing = (r = 900) => `<defs><radialGradient id="mcr" cx="50%" cy="50%" r="50%"><stop offset="0.86" stop-color="#000" stop-opacity="0"/><stop offset="0.97" stop-color="#000" stop-opacity="0.85"/><stop offset="1" stop-color="#000"/></radialGradient></defs><circle cx="540" cy="960" r="${r + 30}" fill="url(#mcr)"/><path d="M-200,-200 L1280,-200 L1280,2120 L-200,2120Z M540,${960 - r} A${r},${r} 0 1 0 540,${960 + r} A${r},${r} 0 1 0 540,${960 - r}Z" fill="#000" fill-rule="evenodd"/>`;

  // ======================================================= THE SCHOOL HALL, VACCINATION DAY (1954)
  // floor 1720; tall windows high on the back wall; a banner; a poster of a boy on crutches; the nurse's table at 700
  const GY = S.GY = { FY: 1720, TABLE: [560, 1000, 1420] };
  S.gym51 = (t, o = {}) => {
    const L = [];
    L.push({ p: 0.86, svg: once('gywall', () => {
      let g = `<defs>${LG('gyw', [[0, '#d8ccb0'], [1, '#bcae90']])}</defs><rect x="-1600" y="-600" width="4400" height="${GY.FY + 600}" fill="url(#gyw)"/>`;
      for (let i = 0; i < 6; i++) { const x = -1000 + i * 520; g += `<rect x="${x}" y="-160" width="300" height="600" fill="#e8f0f4" ${olr(1.6)}/>` + `<path d="M${x + 150},-160 L${x + 150},440 M${x},140 L${x + 300},140" stroke="#c8c0a8" stroke-width="10"/>`; }
      g += `<rect x="-1600" y="1100" width="4400" height="${GY.FY - 1100}" fill="#8a6a44"/><rect x="-1600" y="1092" width="4400" height="12" fill="#5a4024"/>`;
      // the banner and the poster of a boy in leg braces with crutches
      g += `<path d="M-200,520 L1280,520 L1260,640 L-180,640Z" fill="#f4f0e4" ${olr(1.6)}/><text x="540" y="602" text-anchor="middle" font-family="'Franklin Gothic Medium','Arial Narrow',Arial,sans-serif" font-size="58" font-weight="bold" letter-spacing="3" fill="#2a3a7a">POLIO VACCINE TODAY</text>`;
      g += `<rect x="1180" y="700" width="260" height="360" fill="#f2ead8" ${olr(1.6)}/><circle cx="1310" cy="780" r="30" fill="#e8c4a6" ${olr(1.2)}/><path d="M1280,812 L1340,812 L1350,940 L1270,940Z" fill="#4a6aa8" ${olr(1.2)}/><path d="M1290,940 L1288,1030 M1330,940 L1332,1030" stroke="#2a2a3a" stroke-width="14"/>` +
        `<path d="M1288,960 L1288,1020 M1332,960 L1332,1020" stroke="#9a9a9a" stroke-width="4"/><path d="M1250,840 L1240,1040 M1370,840 L1380,1040" stroke="#7a5a3a" stroke-width="8"/><rect x="1196" y="716" width="228" height="34" fill="#c83a3a"/>`;
      // the basketball hoop
      g += `<rect x="-760" y="420" width="240" height="160" fill="#f4f2ec" ${olr(1.6)}/><rect x="-690" y="500" width="100" height="70" fill="none" stroke="#c83a3a" stroke-width="6"/><ellipse cx="-640" cy="600" rx="60" ry="12" fill="none" stroke="#e86a2a" stroke-width="7"/>` + Array.from({ length: 6 }, (_, i) => `<path d="M${-694 + i * 22},604 l${4 - i},70" stroke="#f4f2ec" stroke-width="3"/>`).join('');
      return g;
    }) });
    L.push({ p: 0.96, svg: once('gytable', () => {
      const [x0, x1, ty] = GY.TABLE;
      let g = `<rect x="${x0}" y="${ty}" width="${x1 - x0}" height="20" fill="#f6f4ee" ${olr(1.4)}/><path d="M${x0},${ty + 20} L${x0 - 10},${ty + 200} L${x1 + 10},${ty + 200} L${x1},${ty + 20}Z" fill="#f2f0ea" ${olr(1.4)}/>`;
      for (let i = 0; i < 7; i++) g += PR.vial(x0 + 40 + i * 30, ty, 0.42, { col: '#f0e8c8', cap: '#3a6aa8', label: true });
      g += `<rect x="${x0 + 280}" y="${ty - 30}" width="120" height="30" rx="6" fill="#d8dcde" ${olr(1)}/>` + Array.from({ length: 5 }, (_, i) => `<circle cx="${x0 + 296 + i * 22}" cy="${ty - 34}" r="12" fill="#fbfbf8" ${olr(1)}/>`).join('');
      return g;
    }) });
    L.push({ p: 1, svg: once('gyfloor', () => `<rect x="-1600" y="${GY.FY}" width="4400" height="1000" fill="#b88a50"/>` + boards(-1600, 2800, GY.FY, 2800, 540, 1000, '#b88a50', 97, 120) + `<path d="M-1600,${GY.FY + 300} C0,${GY.FY + 260} 1200,${GY.FY + 260} 2800,${GY.FY + 300}" stroke="#f4f0e8" stroke-width="10" opacity="0.6" fill="none"/>`) });
    L.push({ p: 0.86, light: true, svg: Array.from({ length: 3 }, (_, i) => shaft([[-880 + i * 520, 80], [-760 + i * 520, 80], [-200 + i * 600, 2600], [-500 + i * 600, 2600]], '#fff8e4', 0.16, 'gysh' + i, 0.15)).join('') + motes(-800, 0, 1800, 1800, 40, 93, t, '#fff8e0', 0.4) });
    return L;
  };

  // ======================================================= THE PRODUCTION LINE (vials of vaccine and medicine racing past)
  // the conveyor runs across the frame at y 1300 (a near belt) and 900 (a far one); o.speed px/s
  S.vials = (t, o = {}) => {
    const L = [], sp = o.speed || 700;
    L.push({ p: 0.5, svg: once('vlback', () => {
      let g = `<defs>${LG('vlw', [[0, '#9aa4a8'], [1, '#c8d0d2']])}</defs><rect x="-3000" y="-1000" width="9000" height="3600" fill="url(#vlw)"/>`;
      for (let i = 0; i < 16; i++) g += `<rect x="${-2600 + i * 500}" y="-200" width="360" height="40" rx="8" fill="#f8fcfc" opacity="0.9"/>`;
      for (let i = 0; i < 10; i++) g += `<rect x="${-2400 + i * 700}" y="500" width="320" height="480" rx="10" fill="#b8c0c4" ${olr(1.4)}/><rect x="${-2370 + i * 700}" y="540" width="260" height="160" fill="#2a3a44"/><circle cx="${-2300 + i * 700}" cy="780" r="20" fill="${i % 2 ? '#5ad08a' : '#e8c040'}"/>`;
      return g;
    }) + C.radial(540, -180, 1600, '#ffffff', 0.25, 'screen') });
    const belt = (y, s, off, n, seed, r0 = -3000, r1 = 6000) => {
      let g = `<rect x="${f(r0)}" y="${y}" width="${f(r1 - r0)}" height="${60 * s}" fill="#8a9296" ${olr(1.4)}/><rect x="${f(r0)}" y="${y + 60 * s}" width="${f(r1 - r0)}" height="${30 * s}" fill="#5a6266"/>`;
      const step = 70 * s, x0 = -3000 + ((off % step) + step) % step;
      for (let i = 0; i < n; i++) { const x = x0 + i * step; if (x > Math.max(-1400, r0 - 40) && x < Math.min(2600, r1 + 40)) g += PR.vial(x, y, s * 0.9, { col: i % 7 === 3 ? '#e8d27e' : PR.MEDIUM, cap: i % 2 ? '#b8323a' : '#c8ccd0' }); }
      return g;
    };
    // more lines receding into the hall (seen when the camera pulls back)
    L.push({ p: 0.56, svg: belt(560, 0.42, -t * sp * 0.42, 260, 4) + belt(700, 0.48, t * sp * 0.48, 240, 5) });
    L.push({ p: 0.65, svg: belt(820, 0.56, -t * sp * 0.56, 200, 6) });
    L.push({ p: 0.75, svg: belt(980, 0.7, t * sp * 0.7, 130, 1) });
    L.push({ p: 1, svg: belt(1420, 1.0, t * sp, 90, 2) + `<rect x="-3000" y="${1420 + 90}" width="9000" height="800" fill="#4a5054"/>` });
    { const v = G.ENG && G.ENG.viewRect ? G.ENG.viewRect(1.3) : null; L.push({ p: 1.3, svg: `<g filter="url(#dof2)">${belt(1900, 1.4, t * sp * 1.3, 70, 3, v ? v[0] - 100 : -1400, v ? v[2] + 100 : 2600)}</g>` }); }
    return L;
  };

  // ======================================================= THE FAMILY BURIAL GROUND (Clover, Virginia): o.year 0 = 1951 (a
  // fresh mound, no stone), 1 = today (a granite headstone, flowers); o.season 0..1 (green summer .. autumn); o.day
  const CM = S.CM = { FY: 1500, GRAVE: [540, 1640], TREE: [980, 1500] };
  S.cemetery = (t, o = {}) => {
    const L = [], yr = o.year || 0, se = o.season ?? 0.6, day = o.day ?? 1;
    const sc0 = ((se % 1) + 1) % 1, snow = sc0 > 0.68 && sc0 < 0.95 ? Math.sin(Math.PI * (sc0 - 0.68) / 0.27) : 0;
    L.push({ p: 0.2, svg: `<defs>${LG('cmsky', [[0, mix('#5a6a8a', '#8ab0d0', day)], [1, mix('#c8a088', '#f0e8d0', day)]])}</defs><rect x="-2000" y="-1600" width="5200" height="3600" fill="url(#cmsky)"/>` +
      once('cmcloud', () => Array.from({ length: 6 }, (_, i) => `<ellipse cx="${-600 + i * 420}" cy="${120 + (i % 3) * 90}" rx="${180 + (i % 2) * 80}" ry="44" fill="#fff" opacity="0.5"/>`).join('')) });
    // rolling fields: tobacco rows to the horizon, a far barn
    L.push({ p: 0.45, svg: once('cmfield', () => {
      let g = `<path d="M-2000,1000 C-1000,880 0,960 600,900 C1200,840 2200,960 3200,900 L3200,2400 L-2000,2400Z" fill="#7a8a4a"/>`;
      for (let i = 0; i < 24; i++) g += `<path d="M-2000,${1000 + i * 30} C-1000,${890 + i * 32} 0,${970 + i * 30} 600,${910 + i * 31} C1200,${850 + i * 32} 2200,${970 + i * 30} 3200,${910 + i * 31}" stroke="${i % 2 ? '#5a6a2a' : '#8a9a52'}" stroke-width="10" fill="none" opacity="0.6"/>`;
      g += `<path d="M1500,900 L1500,780 L1580,720 L1660,780 L1660,900Z" fill="#6a3a2a" ${olr(1.2)}/>`;
      return g;
    }) + (snow > 0.01 ? `<path d="M-2000,1000 C-1000,880 0,960 600,900 C1200,840 2200,960 3200,900 L3200,2400 L-2000,2400Z" fill="#e4eaee" opacity="${f(0.7 * snow)}"/>` : '') });
    // the big oak over the graves (leaves by season), the wire fence, old leaning stones
    L.push({ p: 0.8, svg: (() => {
      // the season runs round a circle: 0 spring, 0.25 summer, 0.5 autumn, 0.75 winter (bare, snow), 1 spring again
      const sc = ((se % 1) + 1) % 1, [tx, ty] = CM.TREE;
      const leaf = sc < 0.25 ? mix('#86a84e', '#3e6a2a', sc / 0.25) : sc < 0.5 ? mix('#3e6a2a', '#c8701e', (sc - 0.25) / 0.25) : sc < 0.75 ? mix('#c8701e', '#8a4a1a', (sc - 0.5) / 0.25) : mix('#8a4a1a', '#86a84e', (sc - 0.75) / 0.25);
      const amt = sc < 0.58 ? 1 : sc < 0.7 ? 1 - (sc - 0.58) / 0.12 : sc < 0.9 ? 0 : (sc - 0.9) / 0.1;
      let g = once('cmtrunk', () => {
        let s = `<path d="M${tx - 60},${ty} C${tx - 40},${ty - 300} ${tx - 70},${ty - 500} ${tx - 20},${ty - 700} L${tx + 40},${ty - 700} C${tx + 70},${ty - 500} ${tx + 50},${ty - 300} ${tx + 70},${ty}Z" fill="#3a2a1e" ${olr(2)}/>`;
        const br = [[0, -600, -420, -880, 40], [10, -640, 360, -940, 40], [-10, -700, -120, -1080, 28], [20, -690, 160, -1100, 26], [-200, -760, -520, -760, 18], [200, -800, 520, -820, 18], [-300, -820, -380, -1060, 14], [260, -860, 300, -1080, 14]];
        for (const [x0, y0, x1, y1, w] of br) s += `<path d="M${tx + x0},${ty + y0} C${tx + x0 + (x1 - x0) * 0.4},${ty + y0 - 60} ${tx + x1 - (x1 - x0) * 0.2},${ty + y1 + 40} ${tx + x1},${ty + y1}" stroke="#3a2a1e" stroke-width="${w}" fill="none" stroke-linecap="round"/>`;
        return s;
      });
      // the crown: scalloped clumps of leaves in three passes (shadow, body, sunlit tops), a little wind in them
      if (amt > 0.01) {
        const clump = (x, y, r, sd) => { const rr = rng(sd), N = 9, pts = []; for (let i = 0; i < N; i++) { const a = i / N * TAU + rr() * 0.3, k = 0.85 + rr() * 0.25; pts.push([x + Math.cos(a) * r * k, y + Math.sin(a) * r * k * 0.85]); } let d = `M${f(pts[0][0])},${f(pts[0][1])}`; for (let i = 0; i < N; i++) { const p0 = pts[i], p1 = pts[(i + 1) % N], mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2, dx = mx - x, dy = my - y, dl = Math.hypot(dx, dy) || 1; d += ` Q${f(mx + dx / dl * r * 0.32)},${f(my + dy / dl * r * 0.32)} ${f(p1[0])},${f(p1[1])}`; } return d + 'Z'; };
        const r = rng(97), cs = [];
        for (let i = 0; i < 30; i++) { const a = r() * TAU, d = Math.sqrt(r()); cs.push([tx + Math.cos(a) * d * 560, ty - 900 + Math.sin(a) * d * 300, (80 + r() * 60) * (0.4 + 0.6 * amt), i]); }
        cs.sort((a, b) => a[1] - b[1]);
        const w = i => Math.sin(t * 1.3 + i * 0.7) * 5;
        let sh = '', body = '', hi = '';
        for (const [x, y, rr, i] of cs) {
          sh += `<path d="${clump(x + 14 + w(i), y + 20, rr, 300 + i)}" fill="${shade(leaf, -0.38)}"/>`;
          body += `<path d="${clump(x + w(i), y, rr, 300 + i)}" fill="${shade(leaf, (i % 5 - 2) * 0.04)}"/>`;
          if (y < ty - 860) hi += `<path d="${clump(x - rr * 0.22 + w(i), y - rr * 0.28, rr * 0.55, 500 + i)}" fill="${shade(leaf, 0.22)}" opacity="0.85"/>`;
        }
        g += `<g opacity="${f(Math.min(1, amt * 1.5))}">${sh}${body}${hi}</g>`;
      }
      // autumn: leaves drifting down
      if (sc > 0.48 && sc < 0.74) { const k = Math.sin(Math.PI * (sc - 0.48) / 0.26), r = rng(61); for (let i = 0; i < 18; i++) { const x = tx - 500 + r() * 1000 + Math.sin(t * 2 + i) * 40, y = ty - 800 + ((r() * 900 + t * 160) % 900); g += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="9" ry="5" fill="${shade(leaf, (r() - 0.5) * 0.3)}" opacity="${f(0.9 * k)}" transform="rotate(${f(t * 90 + i * 40)} ${f(x)} ${f(y)})"/>`; } }
      g += once('cmstones', () => { let s = ''; for (const [x, rot, h] of [[-300, -6, 150], [-80, 4, 120], [1300, -10, 140], [1500, 6, 110]]) s += `<g transform="translate(${x},${CM.FY}) rotate(${rot})"><path d="M-50,0 L-50,${-h + 40} C-50,${-h} 50,${-h} 50,${-h + 40} L50,0Z" fill="#8a8a84" ${olr(1.6)}/><path d="M-30,${-h + 50} l60,0 M-30,${-h + 70} l50,0" stroke="#6a6a64" stroke-width="4"/></g>`; return s; });
      return g;
    })() });
    // the grave in front: in 1951 a fresh mound and a few wild flowers; today a granite headstone and flowers
    L.push({ p: 1, svg: (() => {
      const [gx, gy] = CM.GRAVE;
      let g = once('cmground', () => `<path d="M-2000,${CM.FY} C-600,${CM.FY - 30} 1200,${CM.FY + 20} 3200,${CM.FY - 10} L3200,3000 L-2000,3000Z" fill="#5a7a3a"/>`);
      // winter: a thin snow cover under the grass tufts (they poke through it)
      const sc = ((se % 1) + 1) % 1, sn = sc > 0.68 && sc < 0.95 ? Math.sin(Math.PI * (sc - 0.68) / 0.27) : 0;
      if (sn > 0.01) g += `<path d="M-2000,${CM.FY + 2} C-600,${CM.FY - 28} 1200,${CM.FY + 22} 3200,${CM.FY - 8} L3200,3000 L-2000,3000Z" fill="#dfe6ea" opacity="${f(0.62 * sn)}"/>`;
      g += once('cmtufts', () => Array.from({ length: 300 }, (_, i) => { const r = rng(i + 500); const x = -1600 + r() * 4200, y = CM.FY + 20 + r() * 1300; return `<path d="M${f(x)},${f(y)} l${f(-4 + r() * 8)},-${f(12 + r() * 16)}" stroke="${r() < 0.5 ? '#3a5a2a' : '#7a9a4a'}" stroke-width="3"/>`; }).join(''));
      if (yr < 0.99) g += `<g opacity="${f(1 - yr)}"><path d="M${gx - 240},${gy + 60} C${gx - 200},${gy - 40} ${gx + 200},${gy - 40} ${gx + 240},${gy + 60}Z" fill="#6a4a2e" ${olr(1.6)}/>` + Array.from({ length: 7 }, (_, i) => `<path d="M${gx - 150 + i * 50},${gy + 10} l0,-40" stroke="#3a5a2a" stroke-width="4"/><circle cx="${gx - 150 + i * 50}" cy="${gy - 32}" r="12" fill="${['#e8d8e0', '#f0c840', '#e8e4f0'][i % 3]}"/>`).join('') + `</g>`;
      if (yr > 0.01) g += `<g opacity="${f(yr)}"><path d="M${gx - 230},${gy + 40} L${gx - 230},${gy - 260} C${gx - 230},${gy - 320} ${gx - 120},${gy - 330} ${gx},${gy - 300} C${gx + 120},${gy - 330} ${gx + 230},${gy - 320} ${gx + 230},${gy - 260} L${gx + 230},${gy + 40}Z" fill="#5a5c60" ${olr(2)}/>` +
        `<path d="M${gx},${gy - 296} L${gx},${gy + 30}" stroke="#3a3c40" stroke-width="5"/>` + Array.from({ length: 8 }, (_, i) => `<path d="M${gx - 190},${gy - 240 + i * 30} l${150 - (i % 3) * 30},0 M${gx + 40},${gy - 240 + i * 30} l${150 - (i % 2) * 40},0" stroke="#8a8c90" stroke-width="5" opacity="0.7"/>`).join('') +
        Array.from({ length: 9 }, (_, i) => `<circle cx="${gx - 200 + i * 50}" cy="${gy + 30 - (i % 2) * 10}" r="16" fill="${['#e8384a', '#f4f0e8', '#f0b8c0'][i % 3]}" ${olr(1)}/>`).join('') + `</g>`;
      return g;
    })() });
    if (day < 0.99) L.push({ p: 1, light: true, svg: `<rect x="-3000" y="-3000" width="8000" height="8000" fill="#0a0c1a" opacity="${f(0.55 * (1 - day))}"/>` });
    return L;
  };

  // ======================================================= (first sketch of the lab today; the one used is S.labNow in sets18c)
  const LN = { FY: 1720, BENCH: 1340, BSC: [80, 360, 600, 980], INC: [1000, 1720], MON: [700, 860, 260, 170] };
  S.labNowSketch = (t, o = {}) => {
    const L = [];
    L.push({ p: 0.5, svg: once('lnwin', () => `<defs>${LG('lnsky', [[0, '#9ac0e0'], [1, '#e4eef4']])}</defs><rect x="-1600" y="0" width="1500" height="1500" fill="url(#lnsky)"/>` + Array.from({ length: 8 }, (_, i) => `<rect x="${-1500 + i * 170}" y="${600 - (i % 3) * 140}" width="140" height="1000" fill="#7a8a9a" opacity="0.7"/>`).join('')) });
    L.push({ p: 0.88, svg: once('lnwall', () => {
      let g = `<defs><clipPath id="lnwc"><path d="M-2000,-600 L2800,-600 L2800,2400 L-2000,2400Z M-1500,200 L-200,200 L-200,1100 L-1500,1100Z" clip-rule="evenodd"/></clipPath></defs><g clip-path="url(#lnwc)"><rect x="-2000" y="-600" width="4800" height="3000" fill="#eef0f0"/></g>`;
      g += `<rect x="-1520" y="180" width="1340" height="940" fill="none" stroke="#c8ccce" stroke-width="20"/>`;
      for (let i = 0; i < 5; i++) g += `<rect x="${-1400 + i * 700}" y="-80" width="420" height="44" rx="6" fill="#ffffff" ${olr(1)}/>`;
      // shelves of plastic flasks and boxes of pipette tips
      for (const y of [520, 760]) { g += `<rect x="1300" y="${y}" width="700" height="14" fill="#c8ccce" ${olr(1)}/>`; for (let i = 0; i < 7; i++) g += PR.flask(1360 + i * 96, y, 0.32, 0, { level: 0.3 }); }
      g += `<rect x="-160" y="520" width="200" height="140" rx="6" fill="#e0e4e6" ${olr(1)}/><rect x="-150" y="530" width="180" height="40" fill="#5a8ad0"/>`;
      return g;
    }) });
    // the biosafety cabinet: a steel box with a lit glass sash
    L.push({ p: 0.93, svg: once('lnbsc', () => {
      const [x0, y0, x1, y1] = LN.BSC;
      return `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${LN.FY - y0}" fill="#d8dcde" ${olr(2)}/><rect x="${x0 + 30}" y="${y0 + 120}" width="${x1 - x0 - 60}" height="${y1 - y0 - 140}" fill="#f4fbff" ${olr(1.4)}/><rect x="${x0 + 30}" y="${y0 + 120}" width="${x1 - x0 - 60}" height="${(y1 - y0 - 140) * 0.55}" fill="#c8e0ee" opacity="0.5" ${olr(1)}/>` +
        `<rect x="${x0 + 30}" y="${y0 + 30}" width="${x1 - x0 - 60}" height="60" fill="#3a4448"/><circle cx="${x1 - 70}" cy="${y0 + 60}" r="10" fill="#5ae0a0"/><rect x="${x0 + 50}" y="${y0 + 46}" width="180" height="28" fill="#1a2a2a"/>` + `<path d="M${x0 + 30},${y1 - 20} L${x1 - 30},${y1 - 20}" stroke="#9aa0a4" stroke-width="10"/>`;
    }) + C.radial((LN.BSC[0] + LN.BSC[2]) / 2, (LN.BSC[1] + LN.BSC[3]) / 2, 420, '#f0faff', 0.35, 'screen') });
    // the bench, the monitor (living cells on it), the incubator and the photograph on its door
    L.push({ p: 0.97, svg: once('lnbench', () => `<rect x="-1600" y="${LN.BENCH}" width="4400" height="30" fill="#2e3236" ${olr(1.6)}/><rect x="-1580" y="${LN.BENCH + 30}" width="4360" height="${LN.FY - LN.BENCH - 30}" fill="#e8eaec" ${olr(1.4)}/>` +
      Array.from({ length: 12 }, (_, i) => `<rect x="${-1560 + i * 360}" y="${LN.BENCH + 50}" width="340" height="${LN.FY - LN.BENCH - 70}" fill="#f0f2f4" ${olr(1)}/>`).join('')) +
      (() => {
        const [mx, my, mw, mh] = LN.MON;
        let g = `<rect x="${mx - 10}" y="${my - 10}" width="${mw + 20}" height="${mh + 20}" rx="8" fill="#1a1c1e" ${olr(1.4)}/><rect x="${mx}" y="${my}" width="${mw}" height="${mh}" fill="#2a1a26"/><path d="M${mx + mw / 2},${my + mh + 10} l0,${LN.BENCH - my - mh - 10}" stroke="#2a2c2e" stroke-width="16"/>`;
        g += `<g clip-path="url(#lnmc)"><defs><clipPath id="lnmc"><rect x="${mx}" y="${my}" width="${mw}" height="${mh}"/></clipPath></defs>`;
        for (let i = 0; i < 14; i++) { const r = rng(300 + i), x = mx + 20 + r() * (mw - 40) + Math.sin(t * 0.6 + i) * 4, y = my + 20 + r() * (mh - 40) + Math.cos(t * 0.5 + i) * 4; g += PR.cell(x, y, 16, t, { seed: 300 + i, life: 1 }); }
        return g + `</g>` + PR.incubator(LN.INC[0], LN.INC[1], 1.15, t, { open: o.open || 0 });
      })() });
    L.push({ p: 1, svg: once('lnfloor', () => `<rect x="-1600" y="${LN.FY}" width="4400" height="1000" fill="#c8ccd0"/>` + Array.from({ length: 30 }, (_, i) => `<rect x="${-1600 + (i % 10) * 440}" y="${LN.FY + Math.floor(i / 10) * 140}" width="440" height="140" fill="none" stroke="#b0b4b8" stroke-width="3"/>`).join('')) });
    L.push({ p: 1, light: true, svg: C.radial(540, 300, 1400, '#ffffff', 0.15, 'screen') });
    return L;
  };
})(window);
