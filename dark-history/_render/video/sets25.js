// Sets for the Coca-Cola video, part 1 (on top of sets24.js): the back room again, 1885-88 - the bench split into the
// top (things behind the hands: drawn with ST.behind) and the front; the guttering lamp; the chair; the diploma; the
// calendar that flips to 1888; the wine-coca jar, the bottles of French Wine Coca and their handbill; the bill of sale;
// a glass of the new drink with its bubbles rising; and the backyard where the syrup is cooked over a fire.
// Period type: Playfair Display, Abril Fatface, Old Standard TT, Rye, Pinyon Script (installed in _render/fonts).
(function (G) {
  const S = G.SETS, PR = G.PROPS, { f, mix, rng, ol, shade } = G.RIG, C = G.CINE, E = G.ENV;
  const lg = S.lg, TXT = S.TXT, bottle = S.bottle;
  const cl = v => Math.max(0, Math.min(1, v)), ss = (a, b, x) => { const u = cl((x - a) / (b - a)); return u * u * (3 - 2 * u); };
  const fl = (t, seed) => 0.86 + 0.08 * Math.sin(t * 9 + seed) + 0.06 * Math.sin(t * 23 + seed * 2);
  const FONT = { play: 'Playfair Display, Georgia, serif', black: 'Playfair Display Black, Playfair Display, serif', abril: 'Abril Fatface, Playfair Display, serif', old: 'Old Standard TT, Georgia, serif', rye: 'Rye, Abril Fatface, serif', script: 'Pinyon Script, cursive' };
  S.FONT = FONT;
  const T2 = (x, y, size, col, s, o = {}) => TXT(x, y, size, col, s, Object.assign({ font: FONT.old }, o));

  // ======================================================= the back room's wall, 1885-88 (over S.backroom's layer)
  // the diploma on the wall left of the window (the wall layer is at p 0.75)
  const diploma = () => `<g transform="translate(40,0)">` + dip0() + `</g>`;
  const dip0 = () => {
    let g = `<rect x="-352" y="236" width="304" height="240" fill="#1a0e06" opacity="0.5" filter="url(#b8)" transform="translate(8,10)"/>`;
    g += lg('dpFr', [[0, '#e8c070'], [0.3, '#8a5a1c'], [0.55, '#d8a850'], [1, '#5a3a10']], 0, 0, 1, 1) + `<rect x="-356" y="232" width="304" height="240" fill="url(#dpFr)" ${ol(1.4)}/>`;
    g += `<rect x="-338" y="250" width="268" height="204" fill="#2a1a0c"/><rect x="-332" y="256" width="256" height="192" fill="#efe4c6"/>`;
    for (let i = 0; i < 5; i++) g += `<rect x="${-332 + i * 2}" y="${256 + i * 2}" width="${256 - i * 4}" height="${192 - i * 4}" fill="none" stroke="#c8b488" stroke-width="0.8" opacity="${0.3 + i * 0.1}"/>`;
    g += T2(-204, 286, 13, '#2a1a0e', 'REFORM MEDICAL COLLEGE', { w: 'bold', len: 210, font: FONT.play }) + T2(-204, 302, 9, '#3a2a1a', 'OF GEORGIA · MACON', { ls: 2, len: 120 });
    g += TXT(-204, 336, 22, '#1a120a', 'Doctor of Medicine', { font: FONT.script, len: 190 });
    g += T2(-204, 360, 8, '#3a2a1a', 'be it known that', { it: true }) + T2(-204, 382, 15, '#1a120a', 'JOHN STITH PEMBERTON', { w: 'bold', len: 200, font: FONT.play });
    for (let i = 0; i < 3; i++) g += `<path d="M-300,${398 + i * 9} L-108,${398 + i * 9}" stroke="#6a5a40" stroke-width="0.8" opacity="0.6"/>`;
    g += `<path d="M-312,436 L-236,436 M-172,436 L-96,436" stroke="#3a2a1a" stroke-width="0.9"/>` + T2(-274, 446, 6, '#3a2a1a', 'DEAN') + T2(-134, 446, 6, '#3a2a1a', 'MDCCCL');
    // the seal: red wax on a ribbon
    g += `<path d="M-212,420 L-222,452 L-212,446 L-204,456 L-200,424Z" fill="#7a1a14" ${ol(0.9)}/><path d="M-196,420 L-190,452 L-198,447 L-205,456 L-208,424Z" fill="#8a2018" ${ol(0.9)}/>`;
    g += `<circle cx="-204" cy="418" r="15" fill="#9a2418" ${ol(1)}/><circle cx="-204" cy="418" r="10" fill="none" stroke="#c84a30" stroke-width="1.4"/><circle cx="-208" cy="413" r="4" fill="#e87a5a" opacity="0.6"/>`;
    g += `<path d="M-332,256 L-260,256 L-332,330Z" fill="#fff" opacity="0.08"/>`;
    return g;
  };
  // the calendar on its nail: pages for the years; flip in [0, n): page i flies off during [i, i + 1]
  const calPage = (x, y, year, month, mark) => {
    let g = `<rect x="${x - 70}" y="${y}" width="140" height="190" fill="#e2d6bc" ${ol(1.3)}/><rect x="${x - 70}" y="${y}" width="140" height="44" fill="#7a2a1a"/>`;
    g += TXT(x, y + 33, 28, '#f0e4c8', year, { w: 'bold', font: FONT.play }) + TXT(x, y + 66, 14, '#3a2a1a', month, { w: 'bold', ls: 2, font: FONT.old });
    for (let i = 0; i < 5; i++) for (let j = 0; j < 7; j++) g += `<rect x="${x - 62 + j * 18.5}" y="${y + 78 + i * 21}" width="15" height="17" fill="none" stroke="#8a7a60" stroke-width="0.8"/>`;
    if (mark) g += `<path d="M${x - 40},${y + 95} l8,10 M${x - 20},${y + 136} l8,10" stroke="#9a1a12" stroke-width="2"/>`;
    return g;
  };
  S.calendar = (x, y, pages, flip = 0) => {
    // pages: [[year, month], ...] top first; the nail at (x, y - 10)
    let g = `<path d="M${x},${y} L${x},${y - 10}" stroke="#2a1a0e" stroke-width="4"/>`;
    const n = pages.length, top = Math.min(n - 1, Math.floor(flip));
    // the pages still hanging, bottom-most first (only the one under the flying page and the flying page itself)
    for (let i = n - 1; i >= top; i--) {
      const u = i === top ? cl(flip - top) : 0;
      if (i > top + 1) continue;
      if (u <= 0) { g += calPage(x, y, pages[i][0], pages[i][1], i === n - 1); continue; }
      // the top page tears off the nail: it lifts at a corner, swings away and falls, turning, fading
      const e = u * u, rot = -8 - 70 * e, tx = -60 * e - 30 * u, ty = 260 * e, op = 1 - ss(0.55, 1, u);
      g += `<g opacity="${f(op)}" transform="translate(${f(x + tx)},${f(y + ty)}) rotate(${f(rot)}) translate(${-x},${-y})">${calPage(x, y, pages[i][0], pages[i][1], false)}<rect x="${x - 70}" y="${y}" width="140" height="190" fill="#000" opacity="${f(0.25 * u)}"/></g>`;
    }
    return g;
  };
  // the layer to put over S.backroom(t)'s wall layer: the diploma, this year's calendar, and the room's darkness when the
  // lamp is low or out (lampK 1 = lit, 0 = out) with the street lamp's glow through the window taking over
  S.roomWall = (t, o = {}) => {
    const lampK = o.lampK ?? 1;
    let g = diploma();
    if (o.cal) g += `<rect x="104" y="694" width="152" height="202" fill="#24170e"/>` + S.calendar(180, 700, o.cal, o.flip || 0);
    // the dark (inside the blurred group: an opaque fill at partial opacity) ...
    if (lampK < 1) g += `<rect x="-900" y="-500" width="2900" height="2600" fill="#020101" opacity="${f(0.54 * (1 - lampK))}"/>`;
    // ... and the street lamp's glow through the window, which must stay readable on the calendar under it: screened onto
    // the finished wall, OUTSIDE the blurred group (a screen blend inside a filtered, half-transparent group leaves a
    // coloured ring at the edge of every gradient)
    const glow = lampK < 1 ? C.radial(180, 420, 520, '#c89a6a', 0.18 * (1 - lampK)) + C.radial(182, 790, 250, '#ecd0a8', 0.34 * (1 - lampK)) + C.radial(260, 900, 420, '#a88a6a', 0.1 * (1 - lampK)) : '';
    return `<g filter="url(#dof1)">${g}</g>` + glow;
  };

  // ======================================================= the lamp, going out (k: 1 lit .. 0 out; out: s since it died)
  S.lamp2 = (x, y, t, k = 1, out = -1) => {
    const kk = fl(t, 11) * k;
    let g = `<ellipse cx="${x}" cy="${y + 4}" rx="80" ry="14" fill="#000" opacity="0.5" filter="url(#b4)"/>`;
    g += `<path d="M${x - 62},${y} Q${x - 60},${y - 26} ${x - 22},${y - 34} L${x - 14},${y - 74} L${x + 14},${y - 74} L${x + 22},${y - 34} Q${x + 60},${y - 26} ${x + 62},${y}Z" fill="#a8762e" ${ol(1.4)}/><path d="M${x - 46},${y - 10} Q${x - 40},${y - 26} ${x - 18},${y - 30}" stroke="#ffe0a0" stroke-width="4" fill="none" opacity="${f(0.2 + 0.5 * k)}"/>`;
    g += `<path d="M${x - 56},${y - 74} C${x - 66},${y - 120} ${x - 50},${y - 170} ${x},${y - 172} C${x + 50},${y - 170} ${x + 66},${y - 120} ${x + 56},${y - 74}Z" fill="#c88a3a" opacity="${f(0.3 + 0.25 * k)}" ${ol(1.4)}/><path d="M${x - 50},${y - 110} C${x - 46},${y - 140} ${x - 30},${y - 158} ${x - 12},${y - 162}" stroke="#fff4d0" stroke-width="5" fill="none" opacity="${f(0.15 + 0.45 * k)}"/><path d="M${x - 54},${y - 96} Q${x},${y - 84} ${x + 54},${y - 96}" stroke="#7a4a14" stroke-width="3" fill="none" opacity="0.7"/>`;
    // the oil low in the font (the lamp burning dry)
    g += `<path d="M${x - 58},${y - 92} Q${x},${y - 80} ${x + 58},${y - 92} L${x + 56},${y - 76} L${x - 56},${y - 76}Z" fill="#7a4a12" opacity="0.45"/>`;
    g += `<rect x="${x - 34}" y="${y - 196}" width="68" height="26" rx="4" fill="#b8863a" ${ol(1.3)}/><rect x="${x - 28}" y="${y - 192}" width="56" height="6" fill="#ffe8b0" opacity="${f(0.15 + 0.35 * k)}"/>`;
    if (k > 0.02) g += `<g transform="translate(${x},${y - 200}) scale(${f(0.35 + 0.65 * k)},${f(0.2 + 0.8 * k)}) translate(${-x},${-(y - 200)})">${PR.flame(x, y - 214, 1.5, t)}</g>`;
    else g += `<path d="M${x - 5},${y - 200} L${x + 5},${y - 200}" stroke="#ff7a2a" stroke-width="3" opacity="${f(cl(1 - out / 0.6) * 0.9)}" stroke-linecap="round"/>`;
    g += `<path d="M${x - 26},${y - 196} C${x - 44},${y - 240} ${x - 44},${y - 290} ${x - 18},${y - 320} L${x - 16},${y - 420} L${x + 16},${y - 420} L${x + 18},${y - 320} C${x + 44},${y - 290} ${x + 44},${y - 240} ${x + 26},${y - 196}Z" fill="#fff8e8" fill-opacity="${f(0.06 + 0.06 * k)}" stroke="#d8c8a8" stroke-width="2" stroke-opacity="${f(0.35 + 0.35 * k)}"/>`;
    g += `<path d="M${x - 30},${y - 214} C${x - 36},${y - 250} ${x - 30},${y - 290} ${x - 12},${y - 316} L${x - 10},${y - 410}" stroke="#fff" stroke-width="3" fill="none" opacity="${f(0.15 + 0.4 * k)}"/>`;
    // smoke rising out of the chimney once the flame dies: a thin curling ribbon, thinning out
    if (out >= 0) {
      const r = rng(17);
      for (let i = 0; i < 4; i++) { const age = out - i * 0.18; if (age < 0) continue; const h = 120 + age * 260, op = 0.4 * cl(1 - age / 2.4) * cl(age / 0.2); let d = `M${x},${y - 420}`; for (let j = 1; j <= 6; j++) { const u = j / 6; d += ` L${f(x + Math.sin(u * 5 + t * 1.6 + i) * 22 * u + (r() - 0.5) * 6)},${f(y - 420 - h * u)}`; } g += `<path d="${d}" stroke="#b8aa98" stroke-width="${f(5 + i * 2)}" fill="none" opacity="${f(op)}" stroke-linecap="round" filter="url(#b4)"/>`; }
    }
    if (k > 0.02) g += C.bloom(x, y - 250, 120 * kk, '#ffc060', 0.55 * k) + C.radial(x, y - 250, 360, '#ffa040', 0.25 * kk);
    return g;
  };

  // ======================================================= the chair you sit in (its back rail shows over the bench
  // only when you are gone)
  S.chair = (x, y) => {
    let g = `<path d="M${x - 150},${y + 40} C${x - 160},${y - 60} ${x - 120},${y - 130} ${x},${y - 136} C${x + 120},${y - 130} ${x + 160},${y - 60} ${x + 150},${y + 40}" stroke="#2a180c" stroke-width="30" fill="none" stroke-linecap="round"/>`;
    g += `<path d="M${x - 150},${y + 40} C${x - 160},${y - 60} ${x - 120},${y - 130} ${x},${y - 136} C${x + 120},${y - 130} ${x + 160},${y - 60} ${x + 150},${y + 40}" stroke="#5a3418" stroke-width="22" fill="none" stroke-linecap="round"/>`;
    g += `<path d="M${x - 140},${y - 20} C${x - 120},${y - 108} ${x - 60},${y - 124} ${x - 6},${y - 128}" stroke="#a8743c" stroke-width="4" fill="none" opacity="0.55" stroke-linecap="round"/>`;
    for (const dx of [-96, -48, 0, 48, 96]) g += `<path d="M${x + dx},${y - 118 + Math.abs(dx) * 0.25} L${x + dx * 1.04},${y + 200}" stroke="#2a180c" stroke-width="13" stroke-linecap="round"/><path d="M${x + dx - 2},${y - 112 + Math.abs(dx) * 0.25} L${x + dx * 1.04 - 2},${y + 200}" stroke="#7a4a22" stroke-width="7" stroke-linecap="round"/>`;
    return g;
  };

  // ======================================================= things on the bench
  // the big glass jar the wine coca steeps in: red wine (level 0..1), coca leaves and kola turning slowly in it
  S.wineJar = (x, y, h, t, lev = 1, swirl = 0) => {
    const w = h * 0.62, r = rng(61), top = y - h, ly = y - 14 - (h - 70) * lev;
    let g = `<ellipse cx="${x}" cy="${y + 2}" rx="${f(w * 0.56)}" ry="14" fill="#000" opacity="0.5" filter="url(#b4)"/>`;
    g += `<defs><clipPath id="wjIn"><path d="M${f(x - w / 2 + 8)},${f(y - 10)} L${f(x - w / 2 + 8)},${f(top + 40)} L${f(x + w / 2 - 8)},${f(top + 40)} L${f(x + w / 2 - 8)},${f(y - 10)}Z"/></clipPath>`;
    g += `<linearGradient id="wjW" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2a0408"/><stop offset="0.3" stop-color="#6a0c14"/><stop offset="0.55" stop-color="#8a1a1c"/><stop offset="1" stop-color="#240206"/></linearGradient></defs>`;
    // the wine and what is in it
    if (lev > 0.01) {
      g += `<g clip-path="url(#wjIn)"><rect x="${f(x - w / 2)}" y="${f(ly)}" width="${f(w)}" height="${f(y - ly)}" fill="url(#wjW)"/>`;
      for (let i = 0; i < 16; i++) { const a = r() * 6.28 + swirl * (0.8 + r() * 0.6), rr = r() * w * 0.36, by = ly + 20 + r() * Math.max(10, y - ly - 50), lx = x + Math.cos(a) * rr, s = 0.7 + r() * 0.5, rot = r() * 180 + swirl * 40; if (by > y - 18) continue; g += `<g transform="translate(${f(lx)},${f(by)}) rotate(${f(rot)}) scale(${f(s)},${f(s * 0.55)})"><ellipse rx="22" ry="11" fill="${mix('#2e3a12', '#4a4a1a', r())}" opacity="0.8"/><path d="M-18,0 L18,0" stroke="#6a6a2a" stroke-width="1.2" opacity="0.5"/></g>`; }
      for (let i = 0; i < 5; i++) { const a = r() * 6.28 + swirl * 0.7, rr = r() * w * 0.3, by = Math.max(ly + 30, y - 40 - r() * (y - ly) * 0.4); g += `<ellipse cx="${f(x + Math.cos(a) * rr)}" cy="${f(by)}" rx="15" ry="10" fill="#5a2210" opacity="0.85"/>`; }
      g += `<ellipse cx="${x}" cy="${f(ly)}" rx="${f(w / 2 - 8)}" ry="12" fill="#a8282a" opacity="0.8"/><ellipse cx="${f(x - w * 0.12)}" cy="${f(ly - 2)}" rx="${f(w * 0.2)}" ry="4" fill="#ff8a7a" opacity="0.35"/>`;
      g += `<rect x="${f(x - w / 2 + 14)}" y="${f(ly + 10)}" width="${f(w * 0.12)}" height="${f(Math.max(0, y - ly - 30))}" fill="#ff6a5a" opacity="0.18"/></g>`;
    }
    // the glass: a thick-walled jar with a rolled lip, catching the lamp
    g += `<path d="M${f(x - w / 2)},${f(y - 8)} Q${f(x - w / 2)},${y} ${f(x - w / 2 + 12)},${y} L${f(x + w / 2 - 12)},${y} Q${f(x + w / 2)},${y} ${f(x + w / 2)},${f(y - 8)} L${f(x + w / 2)},${f(top + 30)} Q${f(x + w / 2)},${f(top + 14)} ${f(x + w / 2 - 14)},${f(top + 10)} L${f(x - w / 2 + 14)},${f(top + 10)} Q${f(x - w / 2)},${f(top + 14)} ${f(x - w / 2)},${f(top + 30)}Z" fill="#e8f0ec" fill-opacity="0.13" ${ol(1.6)}/>`;
    g += `<ellipse cx="${x}" cy="${f(top + 10)}" rx="${f(w / 2 - 6)}" ry="13" fill="none" stroke="#e8ece4" stroke-width="5" opacity="0.6"/><ellipse cx="${x}" cy="${f(top + 10)}" rx="${f(w / 2 - 6)}" ry="13" fill="none" ${ol(1.2)}/>`;
    g += `<path d="M${f(x - w / 2 + 12)},${f(y - 16)} L${f(x - w / 2 + 12)},${f(top + 36)}" stroke="#fff" stroke-width="7" opacity="0.4" stroke-linecap="round"/><path d="M${f(x + w / 2 - 16)},${f(y - 20)} L${f(x + w / 2 - 16)},${f(top + 50)}" stroke="#ffd0a0" stroke-width="3" opacity="0.35"/>`;
    return g;
  };
  // a small wine cask on a wooden cradle with a brass tap (x, y = the cradle's foot on the bench); open 0..1 runs the
  // wine; returns the tap's nozzle too
  S.cask = (x, y, open = 0) => {
    const cx = x, cy = y - 262, R2 = 112;
    let g = `<path d="M${cx - 120},${y} L${cx - 90},${cy + 40} L${cx + 90},${cy + 40} L${cx + 120},${y}" stroke="#2a1608" stroke-width="18" fill="none"/><path d="M${cx - 116},${y} L${cx - 88},${cy + 44} M${cx + 116},${y} L${cx + 88},${cy + 44}" stroke="#7a4a22" stroke-width="5" opacity="0.6"/>`;
    g += `<defs><linearGradient id="ckW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6a3e1c"/><stop offset="0.45" stop-color="#9a6234"/><stop offset="1" stop-color="#3a1e0a"/></linearGradient></defs>`;
    g += `<path d="M${cx - 150},${cy} C${cx - 150},${cy - R2 * 1.05} ${cx + 150},${cy - R2 * 1.05} ${cx + 150},${cy} C${cx + 150},${cy + R2 * 1.05} ${cx - 150},${cy + R2 * 1.05} ${cx - 150},${cy}Z" fill="url(#ckW)" ${ol(1.6)}/>`;
    for (const k of [-0.62, -0.2, 0.2, 0.62]) g += `<path d="M${f(cx + k * 150)},${f(cy - R2 * 0.98 * Math.sqrt(1 - k * k * 0.5))} L${f(cx + k * 150)},${f(cy + R2 * 0.98 * Math.sqrt(1 - k * k * 0.5))}" stroke="#2a1608" stroke-width="2" opacity="0.5"/>`;
    for (const k of [-0.45, 0.45]) g += `<path d="M${f(cx + k * 150 - 8)},${f(cy - R2 * 0.9)} C${f(cx + k * 150 - 12)},${cy} ${f(cx + k * 150 - 12)},${cy} ${f(cx + k * 150 - 8)},${f(cy + R2 * 0.9)}" stroke="#1a1410" stroke-width="16" fill="none"/><path d="M${f(cx + k * 150 - 12)},${f(cy - R2 * 0.85)} L${f(cx + k * 150 - 14)},${f(cy + R2 * 0.85)}" stroke="#8a8278" stroke-width="3" opacity="0.5"/>`;
    g += `<ellipse cx="${cx - 150}" cy="${cy}" rx="26" ry="${f(R2 * 0.96)}" fill="#5a3418" ${ol(1.4)}/><ellipse cx="${cx - 150}" cy="${cy}" rx="18" ry="${f(R2 * 0.8)}" fill="none" stroke="#3a1e0a" stroke-width="3"/>`;
    g += `<path d="M${cx - 60},${cy - R2 * 0.9} C${cx},${cy - R2 * 1.02} ${cx + 60},${cy - R2 * 1.0} ${cx + 110},${cy - R2 * 0.78}" stroke="#e8b070" stroke-width="5" fill="none" opacity="0.4" stroke-linecap="round"/>`;
    // the tap in the head of the cask: a brass spout pointing down, its key turned when open
    const nx = cx - 176, ny = cy + 46;
    g += `<path d="M${cx - 160},${cy + 6} L${nx},${cy + 6} L${nx - 4},${ny} L${nx + 12},${ny} L${nx + 14},${cy + 22} L${cx - 160},${cy + 22}Z" fill="#c8963a" ${ol(1.3)}/><path d="M${cx - 162},${cy + 9} L${nx + 2},${cy + 9}" stroke="#fff0b0" stroke-width="2.5" opacity="0.7"/>`;
    const ka = -90 + 80 * open;
    g += `<g transform="translate(${cx - 168},${cy + 4}) rotate(${f(ka)})"><rect x="-4" y="-30" width="8" height="30" rx="3" fill="#b8863a" ${ol(1.1)}/><rect x="-14" y="-38" width="28" height="12" rx="5" fill="#c8963a" ${ol(1.1)}/></g>`;
    return { svg: g, noz: [nx + 4, ny] };
  };
  // a bottle of Pemberton's French Wine Coca: tall, dark amber, the long neck with a foil cap, the paper label
  S.wcBottle = (x, y, h, seed = 1) => {
    const s = h / 300, w = 76 * s;
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><defs><linearGradient id="wcB" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1a0a04"/><stop offset="0.3" stop-color="#4a2208"/><stop offset="0.55" stop-color="#5e2e0c"/><stop offset="1" stop-color="#140602"/></linearGradient></defs>`;
    g += `<ellipse cx="0" cy="2" rx="44" ry="8" fill="#000" opacity="0.45" filter="url(#b4)"/>`;
    g += `<path d="M-38,0 Q-40,-4 -40,-10 L-40,-170 Q-38,-196 -16,-206 L-13,-270 L13,-270 L16,-206 Q38,-196 40,-170 L40,-10 Q40,-4 38,0Z" fill="url(#wcB)" ${ol(1.5)}/>`;
    g += `<path d="M-15,-300 L15,-300 L16,-262 L-16,-262Z" fill="#8a1a14" ${ol(1.2)}/><path d="M-12,-296 L-12,-266" stroke="#e86a5a" stroke-width="2.5" opacity="0.6"/><rect x="-17" y="-268" width="34" height="8" fill="#6a1410" ${ol(1)}/>`;
    g += `<path d="M-30,-14 L-30,-168" stroke="#fff" stroke-width="4" opacity="0.32" stroke-linecap="round"/><path d="M28,-18 L28,-160" stroke="#ffb060" stroke-width="4" opacity="0.28" stroke-linecap="round"/>`;
    // the label: cream paper, a red border, the name
    g += `<rect x="-36" y="-150" width="72" height="104" rx="2" fill="#ece0c2" ${ol(1.1)}/><rect x="-32" y="-146" width="64" height="96" fill="none" stroke="#8a1a14" stroke-width="1.6"/><rect x="-29" y="-143" width="58" height="90" fill="none" stroke="#8a1a14" stroke-width="0.7"/>`;
    g += TXT(0, -128, 7.5, '#2a1a10', "PEMBERTON'S", { font: FONT.old, w: 'bold', len: 50 }) + TXT(0, -110, 12.5, '#8a1a14', 'FRENCH', { font: FONT.abril, len: 52 }) + TXT(0, -96, 9, '#2a1a10', 'WINE', { font: FONT.abril, len: 30 }) + TXT(0, -78, 16, '#8a1a14', 'COCA', { font: FONT.abril, len: 52 });
    g += `<path d="M-22,-70 L22,-70" stroke="#2a1a10" stroke-width="0.8"/>` + TXT(0, -60, 5.5, '#3a2a1a', 'NERVE TONIC', { font: FONT.old, len: 40 });
    return g + `</g>`;
  };
  // the handbill propped up in front of the bottles (x, y = its foot, centre; h tall): the advertisement, line by line
  S.HB = { W: 470, H: 640 };
  S.handbill = (x, y, o = {}) => {
    const W = S.HB.W, H = S.HB.H, x0 = x - W / 2, y0 = y - H;
    let g = `<path d="M${x0 + 10},${y + 6} L${x0 + W + 16},${y + 4} L${x0 + W + 30},${y0 + 24} L${x0 + 30},${y0 + 30}Z" fill="#000" opacity="0.35" filter="url(#b8)"/>`;
    g += lg('hbP', [[0, '#efe2c2'], [0.6, '#e6d6b0'], [1, '#d4c094']]) + `<path d="M${x0},${y0 + 6} Q${x},${y0 - 6} ${x0 + W},${y0 + 4} L${x0 + W + 4},${y} Q${x},${y + 8} ${x0 - 2},${y}Z" fill="url(#hbP)" ${ol(1.3)}/>`;
    g += `<rect x="${x0 + 16}" y="${y0 + 18}" width="${W - 32}" height="${H - 34}" fill="none" stroke="#2a1a10" stroke-width="2.2"/><rect x="${x0 + 22}" y="${y0 + 24}" width="${W - 44}" height="${H - 46}" fill="none" stroke="#2a1a10" stroke-width="0.9"/>`;
    // foxing and a fold
    const r = rng(83); for (let i = 0; i < 14; i++) g += `<circle cx="${f(x0 + 30 + r() * (W - 60))}" cy="${f(y0 + 30 + r() * (H - 60))}" r="${f(2 + r() * 6)}" fill="#a88a5a" opacity="${f(0.08 + r() * 0.12)}"/>`;
    g += `<path d="M${x0 + 4},${y0 + H * 0.5} Q${x},${y0 + H * 0.5 + 6} ${x0 + W},${y0 + H * 0.5 - 2}" stroke="#a8946a" stroke-width="2" fill="none" opacity="0.4"/>`;
    const L = (yy, size, col, s, font, extra = {}) => TXT(x, y0 + yy, size, col, s, Object.assign({ font }, extra));
    g += L(64, 22, '#2a1a10', "PEMBERTON'S", FONT.old, { w: 'bold', ls: 4, len: 260 });
    g += L(130, 64, '#8a1a14', 'FRENCH WINE', FONT.abril, { len: 400 }) + L(204, 82, '#8a1a14', 'COCA', FONT.abril, { len: 300 });
    g += L(240, 21, '#2a1a10', 'The Great Invigorator', FONT.play, { it: true });
    g += `<path d="M${x - 150},${y0 + 258} L${x + 150},${y0 + 258}" stroke="#2a1a10" stroke-width="1.5"/><path d="M${x - 8},${y0 + 252} l8,6 l8,-6 l-8,-6Z" fill="#2a1a10"/>`;
    g += L(296, 20, '#2a1a10', 'A SURE CURE FOR', FONT.old, { w: 'bold', ls: 3 });
    // the three lines the camera reads (o.hi: [k0, k1, k2] highlight of each line - the lamplight on it)
    const hi = o.hi || [0, 0, 0];
    const lines = [['HEADACHE', 360], ['NERVES', 432], ['THE MORPHINE HABIT', 510]];
    lines.forEach(([s, yy], i) => { g += `<rect x="${x0 + 40}" y="${y0 + yy - 54}" width="${W - 80}" height="68" fill="#fff4d8" opacity="${f(0.35 * hi[i])}" filter="url(#b8)"/>` + L(yy, i === 2 ? 40 : 56, i === 2 ? '#8a1a14' : '#1a120a', s, FONT.black, { len: i === 2 ? 390 : (i === 0 ? 330 : 270) }); });
    g += L(548, 14, '#3a2a1a', 'and all Nervous Troubles', FONT.play, { it: true });
    g += `<path d="M${x - 120},${y0 + 566} L${x + 120},${y0 + 566}" stroke="#2a1a10" stroke-width="1"/>` + L(590, 13, '#2a1a10', 'SOLD BY ALL DRUGGISTS · ONE DOLLAR', FONT.old, { w: 'bold', len: 330 });
    g += lg('hbSh', [[0, '#000', 0.18], [0.3, '#000', 0], [1, '#000', 0.22]], 0, 0, 1, 0) + `<path d="M${x0},${y0 + 6} Q${x},${y0 - 6} ${x0 + W},${y0 + 4} L${x0 + W + 4},${y} Q${x},${y + 8} ${x0 - 2},${y}Z" fill="url(#hbSh)"/>`;
    return g;
  };
  // the bill of sale lying on the bench, foreshortened (x, y = its centre), with his shaking signature and the money
  S.billOfSale = (x, y, sigK = 1) => {
    let g = `<g transform="translate(${x},${y})"><path d="M-206,-70 L190,-78 L226,52 L-236,60Z" fill="#000" opacity="0.4" filter="url(#b8)" transform="translate(6,8)"/>`;
    g += `<path d="M-206,-70 L190,-78 L226,52 L-236,60Z" fill="#e8dcc0" ${ol(1.3)}/>`;
    g += `<g transform="matrix(1,0,-0.25,0.42,0,-50)">`;
    g += T2(0, 34, 34, '#1a120a', 'BILL OF SALE', { w: 'bold', font: FONT.play, len: 280 });
    for (let i = 0; i < 6; i++) g += `<path d="M-170,${70 + i * 22} L${i === 5 ? 40 : 170},${70 + i * 22}" stroke="#4a3a2a" stroke-width="2" opacity="0.6"/>`;
    g += T2(-60, 64, 14, '#2a1a10', 'for value received, the interest in the formula', { it: true, len: 300 });
    // the signature: written slowly by an unsteady hand (sigK draws it in)
    g += `<defs><clipPath id="bsSig"><rect x="-10" y="170" width="${f(220 * sigK)}" height="80"/></clipPath></defs><g clip-path="url(#bsSig)">` + TXT(90, 224, 40, '#1a1430', 'J. S. Pemberton', { font: FONT.script, len: 200, a: 'middle' }) + `</g>`;
    g += `<path d="M-10,236 L200,236" stroke="#2a1a10" stroke-width="1.6"/>`;
    g += `</g>`;
    // a few banknotes and coins on top of it
    g += `<g transform="translate(-150,10) rotate(-6)"><path d="M-70,-26 L70,-30 L82,14 L-82,18Z" fill="#8a9a6a" ${ol(1.1)}/><path d="M-60,-20 L60,-24 L70,10 L-70,14Z" fill="none" stroke="#3a4a2a" stroke-width="1.2"/><ellipse cx="0" cy="-4" rx="18" ry="8" fill="none" stroke="#3a4a2a" stroke-width="1.2"/></g>`;
    g += `<g transform="translate(-120,0) rotate(4)"><path d="M-70,-26 L70,-30 L82,14 L-82,18Z" fill="#94a274" ${ol(1.1)}/><path d="M-60,-20 L60,-24 L70,10 L-70,14Z" fill="none" stroke="#3a4a2a" stroke-width="1.2"/>` + TXT(0, 2, 11, '#2a3a1a', 'FIFTY', { font: FONT.play, w: 'bold' }) + `</g>`;
    for (const [cx, cy] of [[150, 30], [176, 18], [130, 44]]) g += `<ellipse cx="${cx}" cy="${cy + 4}" rx="20" ry="7" fill="#000" opacity="0.35" filter="url(#b2)"/><ellipse cx="${cx}" cy="${cy}" rx="20" ry="7" fill="#c8a24a" ${ol(1)}/><ellipse cx="${cx}" cy="${cy - 1}" rx="14" ry="4.5" fill="none" stroke="#7a5a1a" stroke-width="1"/>`;
    return g + `</g>`;
  };
  // a glass of the new drink, its bubbles rising (x, y = base, h tall; t for the bubbles; lit 0..1)
  S.drinkGlass = (x, y, h, t, lit = 1, o = {}) => {
    const s = h / 160, r = rng(o.seed || 9);
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><defs><linearGradient id="dgW${o.id || ''}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#140602"/><stop offset="0.35" stop-color="#4a200a"/><stop offset="0.62" stop-color="${mix('#3a1606', '#7e3c14', lit)}"/><stop offset="1" stop-color="#140602"/></linearGradient></defs>`;
    g += `<ellipse cx="0" cy="2" rx="44" ry="8" fill="#000" opacity="0.5" filter="url(#b4)"/>`;
    g += `<path d="M-30,-14 L-36,-130 L36,-130 L30,-14Z" fill="url(#dgW${o.id || ''})"/>`;
    // bubbles rising through it, each on its own line, looping
    for (let i = 0; i < 26; i++) { const bx = -24 + r() * 48, sp = 26 + r() * 40, ph = r(), rr = 0.9 + r() * 1.8, u = ((t * sp / 116 + ph) % 1 + 1) % 1, by = -18 - u * 112, wob = Math.sin(t * 7 + i) * 1.4; g += `<circle cx="${f(bx + wob)}" cy="${f(by)}" r="${f(rr * (0.7 + 0.5 * u))}" fill="none" stroke="#f0c890" stroke-width="0.8" opacity="${f((0.25 + 0.45 * lit) * Math.sin(Math.PI * u))}"/>`; }
    g += `<path d="M-36,-130 Q-38,-138 -30,-144 Q-20,-150 -8,-147 Q0,-153 10,-148 Q22,-151 30,-144 Q38,-138 36,-130Z" fill="${mix('#6a5a44', '#dcc6a2', lit)}"/>`;
    g += `<path d="M-32,0 L-39,-160 L39,-160 L32,0Z" fill="#e8f0f0" fill-opacity="${f(0.06 + 0.08 * lit)}" ${ol(1.5)}/><path d="M-39,-160 L39,-160" stroke="#f4f8f8" stroke-width="3" opacity="${f(0.3 + 0.5 * lit)}"/>`;
    g += `<path d="M-27,-8 L-32,-150" stroke="#fff" stroke-width="3.5" opacity="${f(0.15 + 0.35 * lit)}" stroke-linecap="round"/><path d="M26,-10 L30,-120" stroke="#fff" stroke-width="2" opacity="${f(0.1 + 0.2 * lit)}"/>`;
    return g + `</g>`;
  };

  // ======================================================= the bench, split: top (behind the hands) and front
  // o: { morph: [x, y] | false, jar: {x, y, h, lev, swirl}, wc: true, bill: {x, y, hi}, sale: {x, y, sig}, glass: {x, y, h},
  //      notebook, coca, kola, flask, mortar, lampK, lampOut, steam }
  S.benchTop = (t, o = {}) => {
    const { TOP, NEAR, LAMP: [lx, ly] } = S.BR, k = fl(t, 3) * (o.lampK ?? 1), r = rng(131);
    let g = `<path d="M-200,${TOP} L1280,${TOP} L1320,${NEAR} L-240,${NEAR}Z" fill="#4a2c16" filter="url(#woodH)"/>`;
    for (let i = 1; i < 6; i++) { const y = TOP + (NEAR - TOP) * (i / 6) ** 1.15; g += `<path d="M-240,${f(y)} L1320,${f(y)}" stroke="#1e1006" stroke-width="2" opacity="0.5"/>`; }
    for (let i = 0; i < 9; i++) { const x = r() * 1100, y = TOP + 20 + r() * 160; g += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(22 + r() * 30)}" ry="${f(6 + r() * 6)}" fill="none" stroke="#1a0c04" stroke-width="${f(2 + r() * 3)}" opacity="0.35"/>`; }
    for (let i = 0; i < 18; i++) { const x = r() * 1100, y = TOP + 10 + r() * 180; g += `<path d="M${f(x)},${f(y)} l${f(20 + r() * 50)},${f((r() - 0.5) * 6)}" stroke="#a87a4a" stroke-width="1.2" opacity="0.3"/>`; }
    g += C.radial(lx + 40, ly - 30, 640, '#ffb050', 0.34 * k);
    g += `<rect x="-240" y="${NEAR}" width="1560" height="30" fill="#5a3a1e" ${ol(1.4)}/><rect x="-240" y="${NEAR}" width="1560" height="5" fill="#e8b878" opacity="${f(0.1 + 0.25 * (o.lampK ?? 1))}"/>`;
    if (o.coca !== false) {
      g += `<path d="M740,1380 L1010,1372 L1050,1478 L760,1490Z" fill="#9a7a50" ${ol(1.2)}/>`;
      const rl = rng(77);
      for (let i = 0; i < 34; i++) { const x = 790 + rl() * 220, y = 1392 + rl() * 80, a = rl() * 180, s = 0.8 + rl() * 0.5, c = rl() < 0.7 ? mix('#3e5420', '#6a7a32', rl()) : '#6a5a2a'; g += `<g transform="translate(${f(x)},${f(y)}) rotate(${f(a)}) scale(${f(s)},${f(s * 0.62)})"><ellipse rx="22" ry="11" fill="${c}" stroke="#1a2008" stroke-width="1"/><path d="M-20,0 L20,0" stroke="#a8b870" stroke-width="1.2" opacity="0.6"/></g>`; }
    }
    if (o.kola !== false) {
      g += `<ellipse cx="330" cy="1488" rx="92" ry="26" fill="#5a3418" ${ol(1.3)}/><path d="M238,1488 Q250,1530 330,1532 Q410,1530 422,1488" fill="#4a2a12" ${ol(1.3)}/>`;
      for (const [x, y, c] of [[290, 1478, '#8a3e22'], [330, 1470, '#a85a32'], [372, 1480, '#7a3418'], [310, 1458, '#9a4e2a'], [352, 1456, '#8a4024']]) g += `<path d="M${x - 20},${y} C${x - 22},${y - 22} ${x - 2},${y - 26} ${x},${y - 14} C${x + 2},${y - 26} ${x + 22},${y - 22} ${x + 20},${y} C${x + 18},${y + 14} ${x - 18},${y + 14} ${x - 20},${y}Z" fill="${c}" ${ol(1)}/><path d="M${x - 10},${y - 14} q4,-4 8,-2" stroke="#e8b080" stroke-width="2" fill="none" opacity="0.6"/>`;
    }
    if (o.morph) { const [mx, my] = o.morph; g += bottle(mx, my, 118, 'round', '#5a2c0e', rng(5), 0.95) + `<rect x="${mx - 28}" y="${my - 58}" width="56" height="34" fill="#e8dcc0"/><rect x="${mx - 25}" y="${my - 55}" width="50" height="28" fill="none" stroke="#5a1a10" stroke-width="1"/>` + TXT(mx, my - 42, 9.5, '#1a1008', 'MORPHINE', { w: 'bold', len: 44 }) + TXT(mx, my - 31, 6, '#5a1a10', 'SULPH.', { len: 22 }); }
    if (o.flask !== false) {
      g += `<path d="M960,1424 L1000,1310 L1000,1262 L1028,1262 L1028,1310 L1068,1424Z" fill="#e8f0ec" fill-opacity="0.16" ${ol(1.3)}/><path d="M968,1424 L986,1372 L1042,1372 L1060,1424Z" fill="#5a2a0e" opacity="0.85"/><path d="M1006,1270 L1006,1400" stroke="#fff" stroke-width="3" opacity="0.4"/>`;
      if (o.steam) { for (let i = 0; i < 5; i++) { const u = ((t * 0.5 + i / 5) % 1), op = 0.35 * Math.sin(Math.PI * u); g += `<circle cx="${f(1014 + Math.sin(t * 2 + i * 2) * 14 * u)}" cy="${f(1250 - u * 220)}" r="${f(10 + u * 26)}" fill="#e8dcc8" opacity="${f(op)}" filter="url(#b8)"/>`; } for (let i = 0; i < 6; i++) { const u = ((t * 0.9 + i / 6) % 1); g += `<circle cx="${f(1000 + (i * 37 % 50))}" cy="${f(1418 - u * 40)}" r="${f(2 + u * 2)}" fill="none" stroke="#e8b880" stroke-width="1" opacity="${f(0.6 * Math.sin(Math.PI * u))}"/>`; } }
      g += `<rect x="1090" y="1260" width="44" height="172" rx="4" fill="#e8f0ec" fill-opacity="0.14" ${ol(1.3)}/><rect x="1092" y="1330" width="40" height="100" fill="#6a3010" opacity="0.8"/>` + [0, 1, 2, 3, 4, 5].map(i => `<path d="M1092,${1290 + i * 22} l12,0" stroke="#d8d0c0" stroke-width="1.2" opacity="0.7"/>`).join('');
    }
    if (o.notebook !== false) {
      g += `<g transform="translate(830,1508) rotate(-4)"><path d="M-150,-58 L150,-58 L162,8 L-162,8Z" fill="#e4d8bc" ${ol(1.3)}/><path d="M0,-58 L0,8" stroke="#8a7a60" stroke-width="2"/>`;
      for (let i = 0; i < 4; i++) g += `<path d="M${-140},${-44 + i * 13} q30,-4 60,0 t60,0" stroke="#3a2a1a" stroke-width="1.6" fill="none" opacity="0.75"/><path d="M${16},${-44 + i * 13} q30,-4 60,0 t50,0" stroke="#3a2a1a" stroke-width="1.6" fill="none" opacity="0.75"/>`;
      g += `<path d="M-60,-30 l80,-2 M-130,-44 l100,-1 M30,-18 l90,-2" stroke="#7a1a12" stroke-width="2.2"/></g>`;
    }
    if (o.sale) g += S.billOfSale(o.sale.x, o.sale.y, o.sale.sig ?? 1);
    if (o.glass) g += S.drinkGlass(o.glass.x, o.glass.y, o.glass.h, t, o.glass.lit ?? 1, { id: 'b' });
    g += S.lamp2(lx, ly, t, o.lampK ?? 1, o.lampOut ?? -1);
    if (o.mortar !== false) { const [mx, my] = S.BR.MORTAR; g += `<ellipse cx="${mx}" cy="${my}" rx="140" ry="34" fill="#d8d2c4" ${ol(1.5)}/><ellipse cx="${mx}" cy="${my + 4}" rx="124" ry="27" fill="#5a5446"/><ellipse cx="${mx + 6}" cy="${my + 14}" rx="88" ry="15" fill="#3e4a1c"/><ellipse cx="${mx - 10}" cy="${my + 11}" rx="40" ry="6" fill="#6a7a32" opacity="0.7"/>`; }
    return g;
  };
  S.benchFront = (t, o = {}) => {
    const { NEAR } = S.BR;
    let g = `<rect x="-240" y="${NEAR + 30}" width="1560" height="500" fill="#2e1a0c" filter="url(#woodV)"/>`;
    for (let i = 0; i < 4; i++) { const dx = -20 + i * 290; g += `<rect x="${dx}" y="${NEAR + 60}" width="250" height="150" fill="#3a2212" ${ol(1.3)}/><rect x="${dx + 100}" y="${NEAR + 120}" width="50" height="14" rx="6" fill="#b8863a" ${ol(1)}/>`; }
    g += lg('bnFr2', [[0, '#000', 0.1], [1, '#000', 0.75]]) + `<rect x="-240" y="${NEAR + 30}" width="1560" height="500" fill="url(#bnFr2)"/>`;
    if ((o.lampK ?? 1) < 1) g += `<rect x="-240" y="${NEAR}" width="1560" height="530" fill="#020101" opacity="${f(0.6 * (1 - (o.lampK ?? 1)))}"/>`;
    return g;
  };

  // ======================================================= THE BACKYARD AT NIGHT: the syrup kettle over the fire
  // world: the kettle's rim at y 1330 (centre x 540, half-width 330); the furnace below; you stand behind it
  S.KT = { RIM: 1330, CX: 540, RX: 330, RY: 64, FIRE: [540, 1720] };
  S.yard = (t) => {
    const L = [], r = rng(301);
    // the night: low clouds lit faintly by the town, the back of the building, a lit window, the fence
    let sky = lg('ydSky', [[0, '#0a0706'], [0.5, '#1a110c'], [1, '#2a1a10']]) + `<rect x="-900" y="-600" width="2900" height="3000" fill="url(#ydSky)"/>`;
    for (let i = 0; i < 9; i++) { const x = -300 + r() * 1700, y = 60 + r() * 500; sky += `<ellipse cx="${f(x + t * 5)}" cy="${f(y)}" rx="${f(260 + r() * 300)}" ry="${f(60 + r() * 60)}" fill="#3a281c" opacity="${f(0.3 + r() * 0.3)}" filter="url(#b14)"/>`; }
    L.push({ p: 0.3, svg: sky });
    let wall = `<rect x="-600" y="180" width="1300" height="1500" fill="#3a2016"/>`;
    for (let y = 190, row = 0; y < 1680; y += 34, row++) { wall += `<path d="M-600,${y} L700,${y}" stroke="#1e0f08" stroke-width="3" opacity="0.7"/>`; for (let x = -600 + (row % 2) * 40; x < 700; x += 80) wall += `<path d="M${x},${y} L${x},${y + 34}" stroke="#1e0f08" stroke-width="3" opacity="0.6"/><rect x="${x + 3}" y="${y + 3}" width="74" height="28" fill="${mix('#4a2a1c', '#5e3422', r())}" opacity="0.55"/>`; }
    // the lit back window of the shop (the lamp inside), its glow on the bricks
    wall += `<rect x="40" y="420" width="260" height="380" fill="#1a0e08" ${ol(1.4)}/><rect x="56" y="436" width="228" height="348" fill="#e8a050"/><rect x="56" y="436" width="228" height="348" fill="#fff0c0" opacity="0.35" filter="url(#b8)"/>`;
    wall += `<path d="M170,436 L170,784 M56,610 L284,610" stroke="#1a0e08" stroke-width="10"/>` + C.radial(170, 610, 420, '#ffa850', 0.3);
    wall += `<rect x="-600" y="180" width="1300" height="1500" fill="url(#ydFall)"/>` + lg('ydFall', [[0, '#000', 0.55], [0.5, '#000', 0.2], [1, '#000', 0.6]]);
    L.push({ p: 0.55, svg: `<g filter="url(#dof2)">${wall}</g>` });
    // the fence across the yard, a shed, barrels
    let mid = '';
    for (let x = 700; x < 1700; x += 34) mid += `<path d="M${x},${1640} L${x},${1060 + (x % 68 ? 0 : 14)}" stroke="#1e130c" stroke-width="28"/><path d="M${x - 9},${1640} L${x - 9},${1070}" stroke="#4a3220" stroke-width="5" opacity="0.5"/>`;
    mid += `<path d="M680,1180 L1700,1170 M680,1500 L1700,1490" stroke="#24180e" stroke-width="18"/>`;
    for (const [bx, by] of [[860, 1640], [990, 1650]]) mid += `<path d="M${bx - 60},${by} L${bx - 66},${by - 170} Q${bx},${by - 186} ${bx + 66},${by - 170} L${bx + 60},${by}Z" fill="#3a2414" ${ol(1.3)}/><path d="M${bx - 64},${by - 40} Q${bx},${by - 30} ${bx + 64},${by - 40} M${bx - 66},${by - 130} Q${bx},${by - 120} ${bx + 66},${by - 130}" stroke="#141414" stroke-width="8" fill="none"/>`;
    mid += lg('ydMid', [[0, '#000', 0.65], [1, '#000', 0.25]], 0, 0, 1, 0) + `<rect x="600" y="900" width="1200" height="900" fill="url(#ydMid)"/>`;
    L.push({ p: 0.8, svg: `<g filter="url(#dof1)">${mid}</g>` });
    // the ground: packed earth, the fire's glow on it
    let gr = lg('ydGr', [[0, '#1a100a'], [1, '#0a0604']]) + `<rect x="-600" y="1600" width="2400" height="900" fill="url(#ydGr)"/>` + C.radial(540, 1760, 700, '#ff7a2a', 0.22);
    L.push({ p: 1, svg: gr });
    return L;
  };
  // behind your hands: the furnace's top and the kettle's far side, the syrup inside (swirl: its turning, 0..)
  S.kettleBack = (t, swirl = 0) => {
    const { RIM, CX, RX, RY } = S.KT, r = rng(311);
    let g = `<ellipse cx="${CX}" cy="${RIM}" rx="${RX}" ry="${RY}" fill="#5a2a10" ${ol(1.6)}/>`;
    g += `<defs><clipPath id="ktIn"><ellipse cx="${CX}" cy="${RIM + 6}" rx="${RX - 18}" ry="${RY - 14}"/></clipPath><radialGradient id="ktSy" cx="0.45" cy="0.4" r="0.7"><stop offset="0" stop-color="#7a3a12"/><stop offset="0.6" stop-color="#4a1e08"/><stop offset="1" stop-color="#1e0a02"/></radialGradient></defs>`;
    g += `<g clip-path="url(#ktIn)"><ellipse cx="${CX}" cy="${RIM + 6}" rx="${RX - 18}" ry="${RY - 14}" fill="url(#ktSy)"/>`;
    // the swirl: spiral streaks of lighter syrup turning, bubbles swelling and popping
    for (let i = 0; i < 7; i++) { const a0 = i / 7 * 6.28 + swirl, d = []; for (let j = 0; j <= 10; j++) { const u = j / 10, a = a0 + u * 2.6, rr = (RX - 40) * (0.15 + 0.85 * u); d.push(`${f(CX + Math.cos(a) * rr)},${f(RIM + 6 + Math.sin(a) * rr * (RY - 14) / (RX - 18))}`); } g += `<path d="M${d.join(' L')}" stroke="#a8622a" stroke-width="${f(3 + (i % 3))}" fill="none" opacity="0.4" stroke-linecap="round"/>`; }
    for (let i = 0; i < 14; i++) { const bx = CX + (r() - 0.5) * (RX * 1.5), by = RIM + 6 + (r() - 0.5) * (RY * 1.1), ph = r(), u = ((t * (0.6 + r() * 0.5) + ph) % 1), rr = 4 + r() * 10; if (((bx - CX) / (RX - 24)) ** 2 + ((by - RIM - 6) / (RY - 18)) ** 2 > 1) continue; g += `<ellipse cx="${f(bx)}" cy="${f(by)}" rx="${f(rr * u)}" ry="${f(rr * u * 0.55)}" fill="#8a4818" stroke="#d88a40" stroke-width="1.2" opacity="${f(0.9 * Math.sin(Math.PI * u))}"/>`; }
    g += `<ellipse cx="${CX - 80}" cy="${RIM - 4}" rx="140" ry="12" fill="#ffc080" opacity="0.18"/></g>`;
    // steam rising off it
    for (let i = 0; i < 8; i++) { const u = ((t * 0.32 + i / 8) % 1), x = CX - 200 + (i * 53 % 400) + Math.sin(t + i) * 30 * u; g += `<ellipse cx="${f(x)}" cy="${f(RIM - 30 - u * 520)}" rx="${f(40 + u * 90)}" ry="${f(26 + u * 60)}" fill="#d8c8b4" opacity="${f(0.22 * Math.sin(Math.PI * u))}" filter="url(#b14)"/>`; }
    return g;
  };
  // in front: the copper kettle's belly and the brick furnace with the fire roaring in its mouth
  S.kettleFront = (t) => {
    const { RIM, CX, RX, RY, FIRE: [fx, fy] } = S.KT, r = rng(321);
    let g = `<defs><linearGradient id="ktCu" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3a1606"/><stop offset="0.25" stop-color="#a8501e"/><stop offset="0.45" stop-color="#e88a48"/><stop offset="0.62" stop-color="#b85a22"/><stop offset="1" stop-color="#2a0e04"/></linearGradient></defs>`;
    // the furnace: bricks, an iron door frame, the fire
    g += `<path d="M${CX - 420},${RIM + 90} L${CX + 420},${RIM + 90} L${CX + 460},2200 L${CX - 460},2200Z" fill="#4a2618"/>`;
    for (let y = RIM + 96, row = 0; y < 2200; y += 40, row++) { g += `<path d="M${CX - 470},${y} L${CX + 470},${y}" stroke="#1e0e08" stroke-width="4"/>`; for (let x = CX - 460 + (row % 2) * 48; x < CX + 460; x += 96) g += `<path d="M${x},${y} L${x},${y + 40}" stroke="#1e0e08" stroke-width="4"/><rect x="${x + 4}" y="${y + 4}" width="88" height="32" fill="${mix('#5a2e1e', '#7a3e26', r())}" opacity="0.5"/>`; }
    g += `<path d="M${fx - 170},${fy + 150} L${fx - 170},${fy - 70} Q${fx},${fy - 150} ${fx + 170},${fy - 70} L${fx + 170},${fy + 150}Z" fill="#120804" stroke="#1a1a1a" stroke-width="14"/>`;
    g += `<g><clipPath id="ktFire"><path d="M${fx - 160},${fy + 150} L${fx - 160},${fy - 64} Q${fx},${fy - 140} ${fx + 160},${fy - 64} L${fx + 160},${fy + 150}Z"/></clipPath><g clip-path="url(#ktFire)">` + C.radial(fx, fy + 40, 260, '#ff8a2a', 0.8) + E.fire(fx - 40, fy + 110, 1.2, 3 + Math.floor(t * 12) % 4) + E.fire(fx + 60, fy + 120, 1.0, 7 + Math.floor(t * 12 + 2) % 4) + `</g></g>`;
    g += C.radial(fx, fy - 20, 560, '#ff7a2a', 0.35 * fl(t, 5));
    // the kettle: its belly in hammered copper, lit from below by the fire, a riveted band and the rolled rim
    g += `<path d="M${CX - RX},${RIM} A${RX},${RY} 0 0 0 ${CX + RX},${RIM} C${CX + RX - 6},${RIM + 220} ${CX + 180},${RIM + 330} ${CX},${RIM + 340} C${CX - 180},${RIM + 330} ${CX - RX + 6},${RIM + 220} ${CX - RX},${RIM}Z" fill="url(#ktCu)" ${ol(1.8)}/>`;
    for (let i = 0; i < 40; i++) { const u = r(), v = r(), x = CX + (u - 0.5) * RX * 1.7 * (1 - v * 0.5), y = RIM + 40 + v * 270; g += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(8 + r() * 10)}" ry="${f(5 + r() * 6)}" fill="#ffd0a0" opacity="${f(0.06 + r() * 0.08)}"/>`; }
    g += `<path d="M${CX - RX + 20},${RIM + 110} Q${CX},${RIM + 170} ${CX + RX - 20},${RIM + 110}" stroke="#5a2408" stroke-width="12" fill="none"/>` + [-0.8, -0.5, -0.2, 0.1, 0.4, 0.7].map(u => { const x = CX + u * (RX - 30), y = RIM + 110 + 60 * (1 - u * u) ; return `<circle cx="${f(x)}" cy="${f(y)}" r="5" fill="#e8a060" ${ol(0.8)}/>`; }).join('');
    g += `<path d="M${CX - RX},${RIM} A${RX},${RY} 0 0 0 ${CX + RX},${RIM}" stroke="#ffb070" stroke-width="10" fill="none" opacity="0.65"/><path d="M${CX - RX},${RIM} A${RX},${RY} 0 0 0 ${CX + RX},${RIM}" fill="none" ${ol(1.8)}/>`;
    g += `<path d="M${CX - 120},${RIM + 330} C${CX - 40},${RIM + 342} ${CX + 40},${RIM + 342} ${CX + 120},${RIM + 330}" stroke="#ffd080" stroke-width="8" fill="none" opacity="0.5"/>` + C.radial(CX, RIM + 330, 300, '#ff9a40', 0.3);
    // embers and sparks rising out of the fire
    for (let i = 0; i < 22; i++) { const u = ((t * (0.4 + r() * 0.5) + r()) % 1), x = fx - 150 + r() * 300 + Math.sin(t * 2 + i) * 20 * u, y = fy - 60 - u * 900; g += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(1.5 + r() * 2)}" fill="#ffb860" opacity="${f(0.7 * Math.sin(Math.PI * u))}"/>`; }
    return g;
  };
  S.yardLight = (t) => C.radial(540, 1700, 1200, '#ff7a2a', 0.14 * fl(t, 2));
})(window);
