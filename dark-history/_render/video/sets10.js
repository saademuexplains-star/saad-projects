// Sets for "The Blind Harpist": the blinding cell under the palace, the antechamber, the Emperor's secret war room.
// Every set is a list of parallax layers { p, svg }; something always moves (fire, smoke, lamp flames, curtains, dust).
(function (G) {
  const S = G.SETS, { f, shade, mix, rng, uid, OUT, ol } = G.RIG, C = G.CINE, E = G.ENV, PR = G.PROPS;
  const lg = S.lg;
  const X = () => G.ENG;
  // gold tesserae: a fixed pattern of slightly varied tiles (defined once per frame per id)
  const mosaicDefs = (id, base = '#c49a3e', sz = 16) => { const r = rng(7); let tiles = ''; for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) tiles += `<rect x="${i * sz + 1}" y="${j * sz + 1}" width="${sz - 2.5}" height="${sz - 2.5}" fill="${shade(base, (r() - 0.5) * 0.32)}"/>`; return `<defs><pattern id="${id}" width="${sz * 4}" height="${sz * 4}" patternUnits="userSpaceOnUse"><rect width="${sz * 4}" height="${sz * 4}" fill="${shade(base, -0.55)}"/>${tiles}</pattern></defs>`; };
  // perspective tile floor with porphyry and serpentine roundels; culled to the view
  const floor = (x0, x1, y0, y1, vp, seed, cw, view) => {
    const rad = x => y => vp[0] + (x - vp[0]) * (y - vp[1]) / (y0 - vp[1]);
    const ys = []; for (let k = 0; k < 40; k++) { const y = y0 + 40 * (Math.pow(1.28, k) - 1); ys.push(y); if (y > y1) break; }
    const r = rng(seed); let g = `<rect x="${x0 - 2000}" y="${y0}" width="${x1 - x0 + 4000}" height="${y1 - y0 + 400}" fill="#b8ab94"/>`;
    for (let k = 0; k + 1 < ys.length; k++) for (let i = Math.floor(x0 / cw) - 30; i < Math.ceil(x1 / cw) + 30; i++) {
      const xa = i * cw, xb = xa + cw, ya = ys[k], yb = ys[k + 1], rv = r();
      const p = [[rad(xa)(ya), ya], [rad(xb)(ya), ya], [rad(xb)(yb), yb], [rad(xa)(yb), yb]];
      if (p[1][0] < x0 - 300 || p[0][0] > x1 + 300) continue;
      if (view && (p[1][0] < view[0] - 50 || p[0][0] > view[2] + 50 || yb < view[1] - 50 || ya > view[3] + 50)) continue;
      const odd = ((i + k) % 2 + 2) % 2, c = odd ? shade('#d8ccb4', (rv - 0.5) * 0.08) : shade('#c4b69a', (rv - 0.5) * 0.08);
      g += `<path d="M${p.map(q => `${f(q[0])},${f(q[1])}`).join(' L')}Z" fill="${c}" stroke="#8a7a62" stroke-width="1.4"/>`;
      if (((i % 4) + 4) % 4 === 1 && k % 3 === 1) { const cx = (p[0][0] + p[2][0]) / 2, cy = (ya + yb) / 2, rx = (p[1][0] - p[0][0]) * 0.26, ry = (yb - ya) * 0.26; g += `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx)}" ry="${f(ry)}" fill="${(i + k) % 4 < 2 ? '#6a1e22' : '#2e4a3a'}" stroke="#3a2a20" stroke-width="1.4"/><ellipse cx="${f(cx - rx * 0.2)}" cy="${f(cy - ry * 0.3)}" rx="${f(rx * 0.4)}" ry="${f(ry * 0.25)}" fill="#fff" opacity="0.12"/>`; }
    }
    return g;
  };
  S.tileFloor = floor;

  // ======================================================= the blinding cell
  // brazier at (560, 1790); the back wall is rough stone with chains, a torch and a barred slit of moonlight
  S.CELL = { BZ: [520, 1800], BZS: 0.8 };
  S.cell = (t, o = {}) => {
    const L = [];
    let w = S.stoneWall(-900, -700, 2100, 1600, '#5e4e40', 21, 84);
    w += `<path d="M330,1600 L330,820 Q560,600 790,820 L790,1600Z" fill="#1a120c" opacity="0.85"/><path d="M330,820 Q560,600 790,820" stroke="#3a2c20" stroke-width="40" fill="none" filter="url(#tex)"/>`;
    // barred slit high on the left with a thin moon shaft
    w += `<rect x="-260" y="180" width="170" height="240" fill="#2a3448"/><rect x="-260" y="180" width="170" height="240" fill="#9ab0d0" opacity="0.35"/>` + [-230, -190, -150, -110].map(x => `<rect x="${x}" y="176" width="10" height="248" fill="#141414"/>`).join('');
    w += `<path d="M-250,420 L-100,420 L380,1600 L120,1600Z" fill="#a8bce0" opacity="0.07" filter="url(#b14)"/>`;
    // chains and shackles on rings
    for (const [cx, len, sw] of [[120, 460, 0.6], [1060, 520, 1.1]]) {
      const a = Math.sin(t * 0.9 + cx) * 2 * sw; let ch = `<circle cx="${cx}" cy="780" r="22" fill="none" stroke="#1a1a1c" stroke-width="9"/>`;
      for (let i = 0; i < len / 30; i++) { const y = 800 + i * 30, x = cx + Math.sin(a * Math.PI / 180) * i * 30; ch += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${i % 2 ? 5 : 11}" ry="16" fill="none" stroke="#2a2a2e" stroke-width="6"/>`; }
      w += ch + `<path d="M${cx - 28},${780 + len} a28,22 0 1 0 56,0" fill="none" stroke="#2a2a2e" stroke-width="10"/>`;
    }
    w += PR.torch(1290, 900, 1.0, t, 3);
    w += `<rect x="-900" y="-700" width="3000" height="2300" fill="#120806" opacity="0.5" style="mix-blend-mode:multiply"/>` + C.radial(520, 1460, 1100, '#ff7a2a', 0.42 + 0.06 * Math.sin(t * 9)) + C.radial(1290, 860, 520, '#ffa050', 0.3);
    L.push({ p: 0.72, svg: w });
    let fl = `<rect x="-900" y="1560" width="3000" height="1400" fill="#3a2c22" filter="url(#plaster)"/>`;
    const r = rng(5); for (let i = 0; i < 9; i++) fl += `<path d="M-900,${1600 + i * 90 + i * i * 8} L2100,${1600 + i * 90 + i * i * 8}" stroke="#1e140e" stroke-width="3" opacity="0.6"/>`;
    for (let i = 0; i < 40; i++) fl += `<path d="M${f(-900 + r() * 3000)},${f(1600 + r() * 900)} l0,${f(50 + r() * 60)}" stroke="#1e140e" stroke-width="3" opacity="0.5"/>`;
    fl += `<rect x="-900" y="1560" width="3000" height="80" fill="#000" opacity="0.4" filter="url(#b8)"/>` + C.radial(560, 1800, 900, '#ff8a3a', 0.35);
    L.push({ p: 1, svg: fl });
    // foreground: a hanging chain and drifting smoke, out of focus
    let fg = `<g filter="url(#dof2)">`;
    for (let i = 0; i < 26; i++) { const y = -300 + i * 44, x = -160 + Math.sin(t * 0.7) * 6 * i / 26; fg += `<ellipse cx="${f(x)}" cy="${y}" rx="${i % 2 ? 9 : 20}" ry="26" fill="none" stroke="#0c0a0a" stroke-width="12"/>`; }
    fg += `</g>` + E.smoke(700 + Math.sin(t * 0.3) * 40, 1500, 900, 9 + Math.floor(t * 0.4), '#6a5a50', 0.16);
    L.push({ p: 1.3, svg: fg });
    return L;
  };

  // ======================================================= the antechamber: mosaic, marble, a lamp, the closed curtain
  S.ANTE = {};
  S.ante = (t, o = {}) => {
    const L = [], id = uid('an');
    let far = mosaicDefs(id + 'm', '#c49a3e') + `<rect x="-800" y="-900" width="2700" height="1400" fill="url(#${id}m)"/>`;
    for (const ax of [-200, 540, 1280]) far += `<path d="M${ax - 260},520 L${ax - 260},0 Q${ax},-260 ${ax + 260},0 L${ax + 260},520" fill="none" stroke="#5a1a3a" stroke-width="34"/><path d="M${ax - 260},520 L${ax - 260},0 Q${ax},-260 ${ax + 260},0 L${ax + 260},520" fill="none" stroke="#e8c870" stroke-width="6"/>`;
    far += `<g transform="translate(540,-260) scale(1.2)" opacity="0.92">${eagle('#3a1020')}</g>`;
    far += `<rect x="-800" y="-900" width="2700" height="1400" fill="#140a08" opacity="0.35" style="mix-blend-mode:multiply"/>`;
    L.push({ p: 0.5, svg: far });
    let w = `${lg(id + 'v', [[0, '#e6dccb'], [1, '#bdae94']])}<rect x="-800" y="480" width="2700" height="1300" fill="url(#${id}v)"/>`;
    for (let i = 0; i < 9; i++) { const x = -760 + i * 300; w += `<rect x="${x}" y="560" width="270" height="560" fill="${i % 2 ? '#d8cdb8' : '#cbbfa6'}" stroke="#8a7a5a" stroke-width="4"/><path d="M${x + 40},600 C${x + 120},760 ${x + 60},900 ${x + 200},1080" stroke="#9a8a70" stroke-width="2" fill="none" opacity="0.6"/><circle cx="${x + 135}" cy="840" r="34" fill="${i % 2 ? '#5a2226' : '#34483c'}" stroke="#c89a3a" stroke-width="4" opacity="0.85"/>`; }
    w += `<rect x="-800" y="470" width="2700" height="26" fill="#c89a3a"/><rect x="-800" y="1150" width="2700" height="30" fill="#8a7a5a"/>`;
    // standing oil lamp on the left
    w += `<rect x="-30" y="700" width="16" height="520" fill="#7a5424"/><ellipse cx="-22" cy="700" rx="60" ry="14" fill="#a8743e" ${ol(1.2)}/>` + PR.flame(-22, 690, 1.6, t) + C.radial(-22, 640, 520, '#ffb060', 0.45);
    // the heavy purple curtain that hides the war room
    w += PR.curtain(620, 1560, 380, 1220, '#4c1642', t, 2, 1, 0);
    w += `<rect x="600" y="360" width="980" height="34" fill="#c89a3a" ${ol(1.2)}/>`;
    L.push({ p: 0.78, svg: w });
    L.push({ p: 1, svg: floor(-900, 2000, 1220, 2900, [540, -500], 3, 140, X().viewRect(1)) + `<rect x="-900" y="1220" width="3000" height="120" fill="#000" opacity="0.3" filter="url(#b8)"/>` + C.radial(200, 1500, 900, '#ffb060', 0.18) });
    L.push({ p: 1.3, svg: `<g filter="url(#dof2)"><rect x="1180" y="-400" width="240" height="3000" fill="#3a1424"/><rect x="1200" y="-400" width="40" height="3000" fill="#8a3a5a" opacity="0.5"/></g>` });
    return L;
  };
  // mosaic double-headed eagle (origin at its body)
  function eagle(col) {
    let g = `<path d="M-30,-60 C-60,-110 -110,-120 -120,-90 C-100,-96 -84,-84 -86,-64 C-120,-60 -200,-80 -260,-30 C-200,-30 -160,-10 -150,20 C-200,30 -230,70 -240,110 C-180,90 -120,80 -80,90 L-40,170 L-70,240 L0,200 L70,240 L40,170 L80,90 C120,80 180,90 240,110 C230,70 200,30 150,20 C160,-10 200,-30 260,-30 C200,-80 120,-60 86,-64 C84,-84 100,-96 120,-90 C110,-120 60,-110 30,-60 Q0,-80 -30,-60Z" fill="${col}" opacity="0.88"/>`;
    g += `<circle cx="-104" cy="-98" r="7" fill="#e8c870"/><circle cx="104" cy="-98" r="7" fill="#e8c870"/>` + [-1, 1].map(s => `<path d="M${s * 120},-90 l${s * 30},4 l${s * -24},12Z" fill="#e8c870"/>`).join('');
    for (let i = 0; i < 6; i++) g += `<path d="M${-200 + i * 30},${-24 + i * 6} l60,20" stroke="#e8c870" stroke-width="5" opacity="0.6"/><path d="M${200 - i * 30},${-24 + i * 6} l-60,20" stroke="#e8c870" stroke-width="5" opacity="0.6"/>`;
    return g;
  }
  S.eagle = eagle;

  // ======================================================= the war room
  // world (p = 1): harpist at x 170 (feet 1730), the map table x 470..1330 (top 830..1150, skirt to 1560),
  // the Emperor and generals behind it (feet 1330), the brother at its right end; windows on the back wall show the night city
  S.WR = { FY: 1730, TX0: 470, TX1: 1330, TFAR: 830, TNEAR: 1150, TFLOOR: 1560, BACK: 1330 };
  S.warRoom = (t, o = {}) => {
    const L = [], id = 'wr', dark = o.dark || 0;
    // the night outside: sky, moon, the city's domes and the sea
    let sky = `${lg(id + 's', [[0, '#0c1428'], [0.5, '#2a3a66'], [1, '#56689a']])}<rect x="-1400" y="-1400" width="4200" height="3200" fill="url(#${id}s)"/>`;
    const rs = rng(3); for (let i = 0; i < 140; i++) sky += `<circle cx="${f(-1300 + rs() * 4000)}" cy="${f(-1300 + rs() * 1900)}" r="${f(0.8 + rs() * 1.8)}" fill="#f4f0e0" opacity="${f(0.3 + 0.5 * (0.5 + 0.5 * Math.sin(t * (1 + rs() * 2) + i)))}"/>`;
    sky += `<circle cx="800" cy="640" r="62" fill="#f4eedc"/><circle cx="782" cy="628" r="16" fill="#d8d0b8" opacity="0.6"/>` + C.radial(800, 640, 420, '#c8d4f0', 0.45);
    let city = '';
    for (const [cx, w, h] of [[-300, 340, 260], [80, 260, 200], [420, 520, 380], [900, 300, 240], [1300, 420, 300], [1700, 280, 200]]) {
      city += `<rect x="${cx - w / 2}" y="${880 - h * 0.5}" width="${w}" height="${h * 0.5 + 200}" fill="#0c101c"/><path d="M${cx - w * 0.32},${880 - h * 0.5} A${w * 0.32},${h * 0.42} 0 0 1 ${cx + w * 0.32},${880 - h * 0.5}Z" fill="#0c101c"/>`;
      for (let k = 0; k < 4; k++) city += `<rect x="${f(cx - w / 2 + 20 + rs() * (w - 40))}" y="${f(880 - h * 0.3 + rs() * h * 0.4)}" width="6" height="10" fill="#ffb860" opacity="${f(0.5 + 0.4 * Math.sin(t * 2 + k + cx))}"/>`;
    }
    city += `<rect x="790" y="420" width="18" height="300" fill="#0c101c"/><rect x="1010" y="440" width="18" height="280" fill="#0c101c"/>`;
    sky += city + `<rect x="-1400" y="1060" width="4200" height="800" fill="#0a1222"/>` + [...Array(18)].map((_, i) => `<path d="M${f(1060 + Math.sin(t * 0.8 + i) * 40 - i * 4)},${1080 + i * 22} l${f(60 + i * 6)},0" stroke="#c8d4f0" stroke-width="3" opacity="${f(0.35 - i * 0.015)}"/>`).join('');
    L.push({ p: 0.3, svg: sky });
    // back wall: gold mosaic above, three arched windows, porphyry columns, marble revetment below
    const holes = [250, 900, 1550].map(x => `M${x - 150},1000 L${x - 150},500 A150,150 0 0 1 ${x + 150},500 L${x + 150},1000Z`).join(' ');
    let w = mosaicDefs(id + 'm', '#c49a3e', 18) + `<path d="M-1500,-2600 L3000,-2600 L3000,1300 L-1500,1300Z ${holes}" fill="url(#${id}m)" fill-rule="evenodd"/>`;
    // lower marble zone
    w += `${lg(id + 'v', [[0, '#d8ccb4'], [1, '#a89a80']])}<path d="M-1500,1000 L3000,1000 L3000,1300 L-1500,1300Z" fill="url(#${id}v)"/>`;
    for (let i = 0; i < 16; i++) { const x = -1460 + i * 290; w += `<rect x="${x}" y="1030" width="260" height="200" fill="${i % 2 ? '#cfc2a8' : '#bfb196'}" stroke="#7a6a50" stroke-width="4"/><path d="M${x + 30},1050 C${x + 120},1110 ${x + 60},1170 ${x + 220},1220" stroke="#8a7a60" stroke-width="2" fill="none" opacity="0.6"/>`; }
    // window frames, grilles and sills
    for (const x of [250, 900, 1550]) {
      w += `<path d="M${x - 150},1000 L${x - 150},500 A150,150 0 0 1 ${x + 150},500 L${x + 150},1000" fill="none" stroke="#5a1a3a" stroke-width="30"/><path d="M${x - 150},1000 L${x - 150},500 A150,150 0 0 1 ${x + 150},500 L${x + 150},1000" fill="none" stroke="#e8c870" stroke-width="6"/>`;
      w += `<path d="M${x},360 L${x},1000 M${x - 150},680 L${x + 150},680" stroke="#2a1a14" stroke-width="10"/><rect x="${x - 180}" y="990" width="360" height="30" fill="#8a7a5a" ${ol(1.2)}/>`;
    }
    // columns with gilded capitals between the windows
    for (const x of [-100, 575, 1225, 1900]) w += `${lg(id + 'c' + x, [[0, '#3a0c10'], [0.4, '#8a2a2e'], [1, '#2a080a']], 0, 0, 1, 0)}<rect x="${x - 46}" y="240" width="92" height="1060" fill="url(#${id}c${x})" ${ol(1.6)}/><path d="M${x - 70},240 L${x + 70},240 L${x + 54},200 L${x - 54},200Z" fill="#c89a3a" ${ol(1.4)}/><rect x="${x - 60}" y="1270" width="120" height="30" fill="#c89a3a" ${ol(1.2)}/>`;
    // the band of ornament and the great mosaic eagle above the middle window
    w += `<rect x="-1500" y="150" width="4500" height="44" fill="#4c1642"/><rect x="-1500" y="156" width="4500" height="6" fill="#e8c870"/><rect x="-1500" y="182" width="4500" height="6" fill="#e8c870"/>`;
    w += `<g transform="translate(900,-200) scale(1.5)">${eagle('#3a1020')}</g>`;
    for (let k = 0; k < 2; k++) w += `<path d="M-1500,${-1400 + k * 500} Q900,${-1900 + k * 500} 3000,${-1400 + k * 500}" stroke="#4c1642" stroke-width="40" fill="none" opacity="0.8"/><path d="M-1500,${-1400 + k * 500} Q900,${-1900 + k * 500} 3000,${-1400 + k * 500}" stroke="#e8c870" stroke-width="6" fill="none"/>`;
    // lamp-light falloff on the gold, moonlight spilling through the windows
    w += `<path d="M-1500,-2600 L3000,-2600 L3000,1300 L-1500,1300Z" fill="#140806" opacity="${f(0.42 + 0.2 * dark)}" style="mix-blend-mode:multiply"/>` + C.radial(900, 400, 1300, '#ffb860', 0.28) + C.radial(200, 300, 700, '#ffb860', 0.16);
    L.push({ p: 0.6, svg: w });
    // mid: side curtains swaying
    L.push({ p: 0.85, svg: PR.curtain(-900, -330, -200, 1450, '#4c1642', t, 5, -1, 0) + PR.curtain(2050, 2700, -200, 1450, '#4c1642', t, 9, 1, 0) });
    // the hanging polycandela over the table and over the harpist
    L.push({ p: 0.95, svg: PR.polycandelon(900, 340, 1.0, t, 0, 10) + PR.polycandelon(160, 160, 0.75, t, 2.1, 8) + PR.polycandelon(1700, 200, 0.8, t, 4.2, 8) });
    // floor: tiles with roundels, moonlight shafts, dust in the beams
    let fl = floor(-1400, 2800, 1250, 2900, [900, -700], 9, 150, X().viewRect(1));
    fl += `<rect x="-1400" y="1240" width="4200" height="110" fill="#000" opacity="0.45" filter="url(#b8)"/>`;
    for (const x of [250, 900, 1550]) fl += `<path d="M${x - 140},1260 L${x + 140},1260 L${x + 340},1900 L${x - 20},1900Z" fill="#a8bce0" opacity="0.07" filter="url(#b14)"/>`;
    fl += S.dust(900, 1100, 900, 500, 40, 4, t, '#ffe0b0', 2.2, 0.5);
    fl += `<rect x="-1400" y="1240" width="4200" height="1700" fill="#0a0408" opacity="${f(0.3 + 0.25 * dark)}" style="mix-blend-mode:multiply"/>` + C.radial(900, 1250, 1100, '#ffb060', 0.16);
    L.push({ p: 1, svg: fl });
    // foreground: a porphyry column at the far left, out of focus
    L.push({ p: 1.3, svg: `<g filter="url(#dof2)"><rect x="-760" y="-1600" width="280" height="4400" fill="#2a080a"/><rect x="-700" y="-1600" width="50" height="4400" fill="#8a2a2e" opacity="0.6"/></g>` });
    return L;
  };
})(window);
