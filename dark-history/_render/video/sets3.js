// Sets for "The Whipping Boy": palace hall, dressing room, classroom (+ shadow wall, marble close-up), poor street.
(function (G) {
  const { shade, mix, rng, f, uid, OUT, NS, ol } = G.RIG, E = G.ENV, C = G.CINE, PR = G.PROPS, S = G.SETS;
  const lg = S.lg;

  // ------------------------------------------------------------- PALACE HALL (purple & gold)
  S.palace = (t, o = {}) => S.throne(t, Object.assign({ bc: '#5a2a7a', bs: '#8e1e28' }, o));

  // ------------------------------------------------------------- DRESSING ROOM
  S.dressing = (t, o = {}) => {
    const L = [];
    let w = `<rect x="-800" y="-400" width="2700" height="2100" fill="#6a3a3a" filter="url(#plaster)"/>`;
    // patterned tapestry wall
    const r = rng(5);
    for (let y = -380; y < 1600; y += 120) for (let x = -780 + ((y / 120) % 2 ? 60 : 0); x < 1900; x += 120) w += `<path d="M${x},${y} l18,30 l-18,30 l-18,-30Z" fill="#c9a040" opacity="0.35"/><circle cx="${x}" cy="${y + 60}" r="6" fill="#e8d090" opacity="0.4"/>`;
    w += `<rect x="-800" y="1250" width="2700" height="400" fill="#3a2418" filter="url(#woodV)"/><rect x="-800" y="1250" width="2700" height="14" fill="#c9a040" opacity="0.6"/>`;
    // window with light
    w += `<rect x="1050" y="250" width="320" height="700" rx="160" fill="#fff6e4"/><path d="M1210,250 L1210,950 M1050,600 L1370,600" stroke="#4a3020" stroke-width="12"/><rect x="1050" y="250" width="320" height="700" rx="160" fill="none" stroke="#4a3020" stroke-width="24"/>` + C.bloom(1210, 600, 260, '#fff2dc', 0.5);
    // shelves of silk bolts
    w += `<rect x="-700" y="150" width="520" height="1100" fill="#3a2418" filter="url(#woodV)"/>`;
    const cols = ['#2c6d8c', '#a01e30', '#d8b04a', '#5a2a7a', '#2a7a4a', '#e8dcc8', '#1f5f7f'];
    for (let sh = 0; sh < 5; sh++) { const y = 250 + sh * 210; w += `<rect x="-700" y="${y + 150}" width="520" height="20" fill="#24160c"/>`; for (let i = 0; i < 6; i++) { const c = cols[(sh * 3 + i) % cols.length]; w += `<ellipse cx="${-660 + i * 82}" cy="${y + 100}" rx="36" ry="48" fill="${shade(c, -0.1)}" ${ol(1.2)}/><ellipse cx="${-660 + i * 82}" cy="${y + 100}" rx="12" ry="16" fill="${shade(c, -0.45)}"/><path d="M${-690 + i * 82},${y + 80} q14,-20 30,-10" stroke="#fff" stroke-width="3" opacity="0.25" fill="none"/>`; } }
    L.push({ p: 0.6, svg: `<g filter="url(#dof2)">${w}</g>` });
    // tall gilded mirror behind the pedestal
    let m = lg('mg', [[0, '#8a6a20'], [0.4, '#f0d070'], [1, '#7a5a18']], 0, 0, 1, 0) + lg('mgl', [[0, '#c8d0d8'], [0.5, '#8a96a4'], [1, '#5a6470']], 0, 0, 1, 1);
    m += `<rect x="330" y="300" width="420" height="1200" rx="200" fill="url(#mg)" ${ol()}/><rect x="360" y="330" width="360" height="1140" rx="180" fill="url(#mgl)"/><path d="M420,420 L560,360 M440,560 L640,420" stroke="#fff" stroke-width="18" opacity="0.25" stroke-linecap="round"/>`;
    m += `<path d="M540,240 l-40,60 l80,0Z" fill="url(#mg)" ${ol()}/>`;
    L.push({ p: 0.85, svg: `<g filter="url(#dof1)">${m}</g>` });
    let fl = lg('dfl', [[0, '#5a3a28'], [1, '#2a1a12']]) + `<rect x="-800" y="1620" width="2700" height="900" fill="url(#dfl)" filter="url(#woodH)"/>`;
    fl += `<ellipse cx="540" cy="1880" rx="520" ry="110" fill="#7a1a2a" filter="url(#tex)"/><ellipse cx="540" cy="1880" rx="480" ry="94" fill="none" stroke="#d8b04a" stroke-width="10"/>`;
    fl += `<ellipse cx="540" cy="1860" rx="200" ry="36" fill="#4a2e1a" ${ol()}/><rect x="340" y="1800" width="400" height="60" fill="#5a3a22" filter="url(#woodH)"/><ellipse cx="540" cy="1800" rx="200" ry="36" fill="#6a4a2c" ${ol()}/>`;
    L.push({ p: 1, svg: fl });
    L.push({ p: 1, svg: C.radial(1210, 600, 1600, '#fff0d8', 0.3) + C.rays(1210, 600, [[118, 1], [128, 0.8], [140, 1]], 1600, 70, '#fff2d0', 0.18), light: true });
    return L;
  };

  // ------------------------------------------------------------- CLASSROOM
  // perspective checkered marble floor: wall base at y0, vanishing point vp
  S.checker = (x0, x1, y0, y1, vp, seed, cw = 100) => {
    const rad = x => y => vp[0] + (x - vp[0]) * (y - vp[1]) / (y0 - vp[1]);
    const ys = []; for (let k = 0; k < 40; k++) { const y = y0 + 55 * (Math.pow(1.3, k) - 1); ys.push(y); if (y > y1) break; }
    const r = rng(seed); let g = '';
    for (let k = 0; k + 1 < ys.length; k++) for (let i = Math.floor(x0 / cw) - 30; i < Math.ceil(x1 / cw) + 30; i++) {
      const xa = i * cw, xb = xa + cw, ya = ys[k], yb = ys[k + 1];
      const p = [[rad(xa)(ya), ya], [rad(xb)(ya), ya], [rad(xb)(yb), yb], [rad(xa)(yb), yb]];
      if (p[1][0] < x0 - 300 || p[0][0] > x1 + 300) continue;
      const white = ((i + k) % 2 + 2) % 2 === 0, c = white ? shade('#e8e2d8', (r() - 0.5) * 0.06) : shade('#2a2628', (r() - 0.5) * 0.1);
      g += `<path d="M${p.map(q => `${f(q[0])},${f(q[1])}`).join(' L')}Z" fill="${c}"/>`;
      if (white && r() < 0.35) g += `<path d="M${f(p[0][0] + (p[1][0] - p[0][0]) * r())},${f(ya)} Q${f((p[0][0] + p[2][0]) / 2)},${f((ya + yb) / 2)} ${f(p[3][0] + (p[2][0] - p[3][0]) * r())},${f(yb)}" stroke="#9a9086" stroke-width="1.5" fill="none" opacity="0.5"/>`;
    }
    return g;
  };
  S.stainedGlass = (x, y, w, h, t, broken = 0, seed = 6) => {
    // arched window: (x, y) top-centre, w wide, h tall; broken: 0..1 (hole grows quickly then stays)
    const id = uid('sg'), r = rng(seed), arch = `M${x - w / 2},${y + h} L${x - w / 2},${y + w / 2} A${w / 2},${w / 2} 0 0 1 ${x + w / 2},${y + w / 2} L${x + w / 2},${y + h}Z`;
    const cols = ['#c83a3a', '#3a6ac8', '#e8c84a', '#3aa86a', '#9a4ac8', '#e87a3a'];
    let g = `<defs><clipPath id="${id}"><path d="${arch}"/></clipPath></defs><g clip-path="url(#${id})"><rect x="${x - w / 2}" y="${y}" width="${w}" height="${h}" fill="#fff4dc"/>`;
    const cell = 46; let panes = '';
    for (let yy = y; yy < y + h; yy += cell) for (let xx = x - w / 2; xx < x + w / 2; xx += cell) panes += `<rect x="${f(xx + 3)}" y="${f(yy + 3)}" width="${cell - 6}" height="${cell - 6}" fill="${cols[Math.floor(r() * cols.length)]}" opacity="${f(0.75 + r() * 0.2)}"/>`;
    panes += `<circle cx="${x}" cy="${y + w / 2}" r="${w * 0.28}" fill="#e8c84a" opacity="0.85"/><path d="M${x},${y + w / 2 - w * 0.24} L${x + w * 0.07},${y + w / 2} L${x},${y + w / 2 + w * 0.24} L${x - w * 0.07},${y + w / 2}Z" fill="#c83a3a"/>`;
    if (broken > 0) {
      const hc = [x - 20, y + h * 0.68], hr = w * 0.26 * Math.min(1, broken * 3);
      let hole = ''; for (let i = 0; i < 14; i++) { const a = i / 14 * 6.283, rr = hr * (0.55 + r() * 0.6); hole += `${i ? 'L' : 'M'}${f(hc[0] + Math.cos(a) * rr)},${f(hc[1] + Math.sin(a) * rr)} `; }
      const hid = uid('hole');
      g += `<defs><mask id="${hid}"><rect x="${x - w}" y="${y - 10}" width="${w * 2}" height="${h + 20}" fill="#fff"/><path d="${hole}Z" fill="#000"/></mask></defs><g mask="url(#${hid})">${panes}</g><path d="${hole}Z" fill="#dbe8f4"/>` + C.bloom(hc[0], hc[1], hr * 1.6, '#ffffff', 0.6);
    } else g += panes;
    for (let xx = x - w / 2; xx <= x + w / 2; xx += cell) g += `<path d="M${f(xx)},${y} L${f(xx)},${y + h}" stroke="#2a2220" stroke-width="4"/>`;
    for (let yy = y; yy <= y + h; yy += cell) g += `<path d="M${x - w / 2},${f(yy)} L${x + w / 2},${f(yy)}" stroke="#2a2220" stroke-width="4"/>`;
    g += `</g><path d="${arch}" fill="none" stroke="#4a3a2a" stroke-width="26"/><path d="${arch}" fill="none" stroke="#8a7a62" stroke-width="10"/>`;
    return g + `<rect x="${x - w / 2 - 30}" y="${y + h}" width="${w + 60}" height="34" fill="#8a7a62" ${ol()}/>`;
  };
  // o: { broken 0..1, door 0..1 open, rod (on desk), book (on table), lightAng (window light shift) }
  // returns { back: [...layers], front: [...layers] } ; floor/wall base at y = 1600
  S.classroom = (t, o = {}) => {
    const back = [], front = [];
    let w = `<rect x="-1100" y="-500" width="3400" height="2100" fill="#c8b48e" filter="url(#plaster)"/>`;
    for (const x of [-750, -100, 1300, 1950]) w += `<rect x="${x - 40}" y="-500" width="80" height="2100" fill="#a8946e" filter="url(#tex)"/><rect x="${x - 40}" y="-500" width="16" height="2100" fill="#fff" opacity="0.12"/>`;
    // oak wainscot (behind the bookshelves and the door)
    w += `<rect x="-1100" y="1060" width="3400" height="540" fill="#5a3a22" filter="url(#woodV)"/><rect x="-1100" y="1060" width="3400" height="26" fill="#3a2414"/>`;
    for (let x = -1080; x < 2300; x += 200) w += `<rect x="${x}" y="1120" width="170" height="420" rx="10" fill="none" stroke="#3a2414" stroke-width="8"/><rect x="${x + 12}" y="1132" width="146" height="20" fill="#fff" opacity="0.06"/>`;
    // world map tapestry
    w += `<rect x="-680" y="250" width="420" height="560" fill="#d8c49a" filter="url(#plaster)" ${ol()}/><path d="M-640,420 Q-560,360 -500,430 Q-440,470 -400,400 Q-340,380 -320,460 M-600,600 Q-520,560 -470,640 Q-400,700 -330,620" stroke="#5a7a5a" stroke-width="14" fill="none" opacity="0.7"/><circle cx="-470" cy="520" r="34" fill="none" stroke="#7a5a3a" stroke-width="4"/><path d="M-470,486 L-470,554 M-504,520 L-436,520" stroke="#7a5a3a" stroke-width="3"/><rect x="-690" y="240" width="440" height="20" fill="#5a3a20"/><rect x="-690" y="802" width="440" height="20" fill="#5a3a20"/>`;
    // stained glass window
    w += S.stainedGlass(150, 200, 440, 800, t, o.broken || 0);
    // bookshelves
    w += `<rect x="600" y="120" width="560" height="1480" fill="#3e2616" filter="url(#woodV)" ${ol()}/>`;
    const rb = rng(8); for (let sh = 0; sh < 7; sh++) { const y = 160 + sh * 200; w += `<rect x="600" y="${y + 170}" width="560" height="22" fill="#24160c"/>`; for (let x = 615; x < 1140; x += 22 + rb() * 12) { const bh = 110 + rb() * 55, c = ['#6a2a22', '#2a3a5a', '#4a5a2a', '#7a6a3a', '#3a2a1a', '#5a2a4a'][Math.floor(rb() * 6)]; w += `<rect x="${f(x)}" y="${f(y + 170 - bh)}" width="${f(18 + rb() * 8)}" height="${f(bh)}" fill="${c}" stroke="#140c08" stroke-width="1.5"/><rect x="${f(x + 3)}" y="${f(y + 190 - bh)}" width="12" height="4" fill="#d8b04a" opacity="0.6"/>`; } }
    // the door (opens inward, revealing a lit corridor)
    const dO = o.door || 0;
    w += `<rect x="1450" y="700" width="380" height="900" rx="190" fill="#f2e2c0"/>` + C.bloom(1640, 1150, 300, '#fff0d0', 0.5 * dO);
    w += `<g transform="translate(1450,0) scale(${f(1 - dO * 0.85)},1)"><path d="M0,1600 L0,890 A190,190 0 0 1 380,890 L380,1600Z" fill="#4a2c18" filter="url(#woodV)" ${ol()}/>` + [80, 190, 300].map(xx => `<path d="M${xx},760 L${xx},1600" stroke="#2a1a0c" stroke-width="5"/>`).join('') + [900, 1200, 1500].map(yy => `<rect x="0" y="${yy}" width="380" height="22" fill="#3a3430"/>` + [30, 120, 210, 300, 350].map(xx => `<circle cx="${xx}" cy="${yy + 11}" r="6" fill="#6a6460"/>`).join('')).join('') + `<circle cx="320" cy="1220" r="16" fill="none" stroke="#6a6460" stroke-width="6"/></g>`;
    w += `<path d="M1430,1600 L1430,890 A210,210 0 0 1 1850,890 L1850,1600" fill="none" stroke="#6a5a42" stroke-width="40"/>`;
    // candle sconces
    for (const x of [-100, 1300]) w += PR.candle(x, 900, 90, t + x, 1.3) + C.bloom(x, 760, 160, '#ffc070', 0.45);

    back.push({ p: 0.75, svg: `<g filter="url(#dof1)">${w}</g>` });
    // marble floor
    back.push({ p: 1, svg: `<rect x="-1400" y="1590" width="4000" height="1400" fill="#1a1618"/>` + S.checker(-1400, 2600, 1600, 2900, [540, 760], 11) + `<rect x="-1400" y="1590" width="4000" height="1400" fill="#000" opacity="0.08" style="mix-blend-mode:multiply"/>` });
    // window light on the floor
    const la = o.lightAng || 0;
    let lt = C.rays(150, 640, [[62 + la, 1.2], [72 + la, 1], [82 + la, 0.9]], 2000, 90, '#fff2d0', 0.2) + `<path d="M${f(260 + la * 18)},1700 L${f(720 + la * 22)},1700 L${f(980 + la * 26)},2150 L${f(380 + la * 22)},2150Z" fill="#fff4dc" opacity="0.18" filter="url(#b14)"/>`;
    lt += S.dust(300, 1200, 420, 600, 34, 17, t, '#fff3d8', 1.6, 0.45);
    back.push({ p: 1, svg: lt, light: true });
    // furniture: tutor's desk (right), prince's study table (centre-left), whipping bench (centre), armchair (left corner)
    let fur = '', furF = '';
    if (o.desk !== false) {
      let d = `<rect x="880" y="1480" width="440" height="40" rx="6" fill="#6a4428" filter="url(#woodH)" ${ol()}/><rect x="900" y="1520" width="400" height="200" fill="#4a2c18" filter="url(#woodV)" ${ol()}/><rect x="930" y="1550" width="340" height="140" rx="8" fill="none" stroke="#2a1a0c" stroke-width="6"/>`;
      d += PR.book(980, 1440, 0.5, -4, false, '#3a2a5a') + PR.book(1000, 1400, 0.45, 2, false, '#6a2a22') + PR.hourglass(1220, 1478, 0.48, o.sand ?? 0.4, t) + PR.candle(1120, 1482, 120, t, 0.9);
      if (o.rod !== false) d += PR.rod(1040, 1468, 0.62, -94);
      if (o.deskFront) furF += d; else fur += d;
    }
    if (o.table !== false) {
      let tb = `<rect x="220" y="1570" width="400" height="34" rx="6" fill="#6a4428" filter="url(#woodH)" ${ol()}/>` + [250, 590].map(xx => `<rect x="${xx - 12}" y="1600" width="24" height="170" fill="#4a2c18" ${ol(1)}/>`).join('');
      if (o.book !== false) tb += PR.book(420, 1540, 0.75, 0, true, '#3a2a5a');
      if (o.tableFront) furF += tb; else fur += tb;
    }
    if (o.bench !== false) fur += PR.stool(560, 1830, 0.9);
    back.push({ p: 1, svg: fur });
    if (furF) front.unshift({ p: 1, svg: furF });
    if (o.chair !== false) back.push({ p: 1, svg: PR.chairBack(-330, 1780, 0.85) + `<rect x="-60" y="1640" width="140" height="18" rx="4" fill="#6a4428" ${ol()}/><rect x="-14" y="1658" width="28" height="120" fill="#4a2c18" ${ol(1)}/>` + PR.bowl(10, 1620, 0.65, o.grapes ?? 1), id: 'chair' });
    if (o.chair !== false) front.push({ p: 1, svg: PR.chairFront(-330, 1780, 0.85), id: 'chairFront' });
    front.push({ p: 1.3, svg: `<g filter="url(#dof3)"><rect x="-1400" y="2350" width="4000" height="700" fill="#0e0a08" opacity="0.65"/></g>` });
    return { back, front };
  };

  // ------------------------------------------------------------- SHADOW WALL (classroom plaster lit by the window)
  S.classShadow = (t, shadows, o = {}) => {
    const L = [];
    let w = `<rect x="-800" y="-400" width="2700" height="2100" fill="#d4bc92" filter="url(#plaster)"/>` + S.stoneWall(-800, -400, 1900, 1100, '#d4bc92', 21, 90).replace(/opacity="0\.7"/g, 'opacity="0.2"').replace(/opacity="0\.6"/g, 'opacity="0.18"');
    w += `<rect x="-800" y="1100" width="2700" height="500" fill="#5a3a22" filter="url(#woodV)"/><rect x="-800" y="1100" width="2700" height="22" fill="#3a2414"/>`;
    w += `<rect x="-800" y="-400" width="2700" height="2100" fill="#2a1e2a" opacity="${f(0.45 + (o.dark || 0) * 0.35)}" style="mix-blend-mode:multiply"/>` + C.radial(540, 600, 1300, '#fff0d0', 0.5 * (1 - (o.dark || 0)));
    L.push({ p: 0.95, svg: w });
    L.push({ p: 0.95, svg: shadows || '', id: 'shadows' });
    let fl = `<rect x="-900" y="1590" width="2900" height="1300" fill="#1a1618"/>` + S.checker(-900, 2000, 1600, 2800, [540, 760], 23);
    fl += `<rect x="-900" y="1590" width="2900" height="1300" fill="#000" opacity="0.35"/>`;
    L.push({ p: 1.1, svg: fl });
    if (o.flash) L.push({ p: 1, svg: `<rect x="-800" y="-400" width="2700" height="2600" fill="#fff" opacity="${f(o.flash)}" style="mix-blend-mode:overlay"/>`, light: true });
    return L;
  };

  // ------------------------------------------------------------- MARBLE FLOOR CLOSE-UP (time passes)
  // o.hour 0..1 (sunlight patch crawls across), o.drops: [[x, y, t0], ...] drops appearing at time t0
  S.marble = (t, o = {}) => {
    const L = [], h = o.hour || 0;
    let g = `<rect x="-800" y="-600" width="2700" height="3200" fill="#1a1618"/>` + S.checker(-800, 1900, -560, 2700, [540, -1400], 31, 170);
    const sx = -300 + h * 1300;
    g += `<path d="M${f(sx)},200 L${f(sx + 520)},120 L${f(sx + 640)},900 L${f(sx + 120)},980Z" fill="#fff2d8" opacity="0.22" filter="url(#b14)"/><path d="M${f(sx + 250)},160 L${f(sx + 310)},150 L${f(sx + 420)},940 L${f(sx + 360)},950Z" fill="#000" opacity="0.15" filter="url(#b8)"/>`;
    g += `<rect x="-800" y="-600" width="2700" height="3200" fill="#0a0810" opacity="${f(0.35 - Math.sin(h * Math.PI) * 0.15)}" style="mix-blend-mode:multiply"/>`;
    L.push({ p: 1, svg: g });
    let d = PR.hourglass(780, 1150, 1.5, o.sand ?? h, t) + `<ellipse cx="780" cy="1365" rx="140" ry="22" fill="#000" opacity="0.4" filter="url(#b8)"/>`;
    for (const [x, y, t0] of (o.drops || [])) {
      if (t < t0) continue;
      const u = Math.min(1, (t - t0) / 0.18);
      if (u < 1) d += PR.drop(x, y - 600 * (1 - u * u), 9);
      else { const k = Math.min(1, (t - t0 - 0.18) / 0.25); d += `<ellipse cx="${x}" cy="${y}" rx="${f(10 + 12 * k)}" ry="${f(5 + 4 * k)}" fill="#7a0e16"/><ellipse cx="${x - 4}" cy="${y - 2}" rx="${f(4 + 3 * k)}" ry="2" fill="#fff" opacity="0.3"/>`; }
    }
    L.push({ p: 1, svg: d });
    L.push({ p: 1, svg: S.dust(sx + 300, 500, 360, 500, 26, 4, t, '#fff3d8', 1.4, 0.5), light: true });
    return L;
  };

  // ------------------------------------------------------------- POOR STREET (overcast, mud)
  S.street = (t, o = {}) => {
    const L = [];
    let far = E.sky(1080, 900, [[0, '#7a828c'], [1, '#c4c2ba']]).replace('width="1080"', 'x="-700" width="2500"');
    far += `<g opacity="0.7">${E.cloud(200 + t * 5, 260, 500, 90, 3, { body: '#9a9ea6', lit: '#d8d6d0', dark: '#6a6e78' })}${E.cloud(900 + t * 3, 200, 420, 80, 5, { body: '#9a9ea6', lit: '#d8d6d0', dark: '#6a6e78' })}</g>`;
    far += `<g filter="url(#dof2)">${E.cottage(380, 1050, 90, 52, 2.2, 3, { side: 1, smoke: 260, wall: '#b8aa90', roof: '#6a5a3a' })}${E.church(840, 1060, 1.1, { stone: '#9a948a' })}</g>`;
    far += `<rect x="-700" y="960" width="2500" height="1200" fill="#6a6250" filter="url(#ground)"/>` + `<g filter="url(#dof2)">${E.hedge(-700, 1800, 990, 60, 4, '#4e5040')}${E.cottage(-300, 1120, 90, 52, 1.8, 5, { side: 1, wall: '#a89c86', roof: '#5a4c34' })}${E.cottage(1080, 1130, 90, 52, 1.7, 6, { side: -1, wall: '#a89c86', roof: '#5a4c34', smoke: 200 })}</g>`;
    far += E.birds(500 + t * 30, 360, 4, 8, 1.3, '#2a2a30');
    L.push({ p: 0.45, svg: far });
    let mid = E.cottage(-560, 1600, 90, 52, 6.2, 9, { side: 1, wall: '#a89a80', roof: '#5a4a30', timber: '#2a1e14' });
    mid += E.cottage(1180, 1600, 90, 52, 5.6, 13, { side: -1, wall: '#9a8e78', roof: '#5a4a30', timber: '#2a1e14', smoke: 300 });
    L.push({ p: 0.85, svg: mid });
    let gr = lg('stg', [[0, '#5a4a36'], [1, '#2a2018']]) + `<rect x="-900" y="1580" width="2900" height="1300" fill="url(#stg)" filter="url(#ground)"/>`;
    gr += E.puddle(300, 1900, 160, 26, '#9aa0a8') + E.puddle(820, 2150, 220, 34, '#9aa0a8') + E.straw(-800, 1900, 1600, 2400, 160, 5, '#6a5a3a');
    // the wall where the kid sits, barrels and a crate
    gr += `<rect x="-900" y="1100" width="760" height="560" fill="#8a7e6a" filter="url(#plaster)"/>` + S.stoneWall(-900, 1100, -140, 1660, '#8a7e6a', 5, 80).replace(/opacity="0\.7"/g, 'opacity="0.4"');
    gr += `<ellipse cx="1000" cy="1720" rx="80" ry="22" fill="#000" opacity="0.4" filter="url(#b8)"/><rect x="930" y="1560" width="140" height="160" rx="30" fill="#5a3e24" filter="url(#woodV)" ${ol()}/><path d="M930,1600 L1070,1600 M930,1680 L1070,1680" stroke="#2a2a2a" stroke-width="8"/>`;
    L.push({ p: 1, svg: gr });
    L.push({ p: 1, svg: `<rect x="-900" y="-400" width="2900" height="3300" fill="#5a6070" opacity="0.18" style="mix-blend-mode:multiply"/>`, light: true });
    L.push({ p: 1.3, svg: `<g filter="url(#dof3)">${E.straw(-900, 2000, 2300, 2500, 60, 9, '#3a3020')}</g>` });
    return L;
  };
})(window);


