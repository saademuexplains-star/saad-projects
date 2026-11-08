// "The Royal Fool": the council room and the courtyard below its window, and the harbour of Sluys, both in true
// perspective (street3d's camera, world cm). The council room: stone walls, a beamed ceiling, a tapestry and torches,
// the oak door in the back wall, an open arched window; the long table with the painted map of the Channel and its
// carved ship tokens, candlesticks. Through the window, one floor down, the wet courtyard: cobbles and puddles, the
// curtain wall and gate tower, and the gibbet with last week's messenger on it, crows on the beam; drizzle and mist.
// The camera can go out through the window. Sluys: the sea in perspective (swell lines, glitter, haze), the far coast
// of Flanders with the town and its church tower, the French fleet chained across the harbour mouth in lines, the
// English cogs coming in with the sun behind them; ships are broadside billboards (P17.cog) with fire and smoke.
(function (G) {
  const T = G.ST3, { f, rng, shade } = G.RIG, C = G.CINE, PR = G.PROPS, Q = G.QCAST, P17 = G.P17, HL = G.HALL;
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t;
  const ss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  const TAU = Math.PI * 2;
  const poly = (cam, pts, fill, x = '') => { const d = T.path(cam, pts); return d ? `<path d="${d}" fill="${fill}" ${x}/>` : ''; };
  const OL = (w = 1.2, op = 0.55) => `stroke="#140c06" stroke-width="${w}" stroke-opacity="${op}" stroke-linejoin="round"`;
  const lw = (cam, d, k = 1) => f(clamp(k * 1.6 * 900 / Math.max(60, d) * cam.fl / 1300, 0.3, 2.4));
  const bb = HL.bb, plane = HL.plane;
  const px = (cam, P, cm) => { const c = cam.toC(P); return c[2] > cam.near ? clamp(cm * cam.fl / c[2], 0.3, 80) : 0.3; };

  // art over a big plane, as a grid of affine tiles (each exact at its own centre), so a map lying on a table near the
  // lens keeps true perspective. O: the art's (0,0) in world; U, V: world vectors per art unit; w, h: art size; n x m
  const tiled = (cam, O, U, V, w, h, n, m, svg, id) => {
    // a whole copy underneath (one fit at the centre) fills any hairline between the tiles
    const Wp = (a, b) => [O[0] + U[0] * a + V[0] * b, O[1] + U[1] * a + V[1] * b, O[2] + U[2] * a + V[2] * b], qd = T.path(cam, [Wp(0, 0), Wp(w, 0), Wp(w, h), Wp(0, h)]);
    let g = n * m > 1 && qd ? `<defs><clipPath id="${id}B"><path d="${qd}"/></clipPath></defs><g clip-path="url(#${id}B)">${plane(cam, O, U, V, svg, w / 2, h / 2, Math.min(w, h) / 4)}</g>` : '', defs = '';
    for (let j = 0; j < m; j++) for (let i = 0; i < n; i++) {
      const x0 = i * w / n, y0 = j * h / m, cx = x0 + w / n / 2, cy = y0 + h / m / 2, cid = `${id}${i}_${j}`;
      const ox = w / n * 0.06, oy = h / m * 0.06; const t = plane(cam, O, U, V, `<defs><clipPath id="${cid}"><rect x="${f(x0 - ox)}" y="${f(y0 - oy)}" width="${f(w / n + 2 * ox)}" height="${f(h / m + 2 * oy)}"/></clipPath></defs><g clip-path="url(#${cid})">${svg}</g>`, cx, cy, Math.min(w / n, h / m) / 2);
      g += t;
    }
    return g;
  };

  // ======================================================= THE COUNCIL ROOM (+ the courtyard below the window)
  const RM = { X: 450, Z0: -300, Z1: 800, H: 620, TAB: { x: 170, z0: 290, z1: 470, y: 88 }, DOOR: { x0: -360, x1: -170, h: 300, apex: 370 }, WIN: { x0: 110, x1: 370, sill: 110, spring: 430, apex: 520 }, YARD: -500 };
  HL.RM = RM;
  // the map's world frame on the table top: art (0,0) at the far-left corner of the map, x to the right, y toward us
  const MAPW = 300, MAPK = MAPW / P17.MAP.W, MAPH = P17.MAP.H * MAPK;
  RM.MAP = { O: [-MAPW / 2, RM.TAB.y + 0.6, 380 + MAPH / 2], U: [MAPK, 0, 0], V: [0, 0, -MAPK] };
  RM.mapPt = (mx, my) => [RM.MAP.O[0] + mx * MAPK, RM.MAP.O[1], RM.MAP.O[2] - my * MAPK];
  const roomEnv = k => ({ shade: '#2a2028', shadeK: 0.2, haze: shade('#3a3030', -0.2 * k), hazeD: 3800, hazeNear: 200, hazeMax: 0.6 });
  const yardEnv = { shade: '#3a4050', shadeK: 0.25, haze: '#8a8c96', hazeD: 2600, hazeNear: 300, hazeMax: 0.85 };
  HL.roomDraw = (cam, t, o = {}) => {
    const E = roomEnv(o.dim || 0), tone = (c, d, k = 's') => T.tone(E, c, d, k), D = p => cam.dist(p), items = [];
    const YE = yardEnv, ytone = (c, d, k = 'g') => T.tone(YE, c, d, k);
    let yard = '', shell = '';
    // ---- outside: the overcast sky (screen space, under everything), the far wall, the courtyard, the gibbet
    const hz = cam.dir([0, 0, 1]), hy = hz ? hz[1] : -2000;
    yard += `<defs><linearGradient id="rmSky" gradientUnits="userSpaceOnUse" x1="0" y1="${f(hy - 1400)}" x2="0" y2="${f(hy + 200)}"><stop offset="0" stop-color="#4a4c60"/><stop offset="0.7" stop-color="#8a8a98"/><stop offset="1" stop-color="#a8a4a8"/></linearGradient></defs><rect x="-60" y="-60" width="1200" height="2040" fill="url(#rmSky)"/>`;
    const r = rng(331);
    for (let i = 0; i < 7; i++) { const cx = ((r() * 1600 + t * (8 + r() * 10)) % 1700) - 300, cy = hy - 200 - r() * 900; yard += `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(220 + r() * 200)}" ry="${f(50 + r() * 40)}" fill="#5a5a6c" opacity="0.5" filter="url(#b14)"/>`; }
    const Y = RM.YARD, WZ = 3600, wd = D([0, 0, WZ]);
    yard += poly(cam, [[-3000, Y, 800], [3000, Y, 800], [3000, Y, WZ], [-3000, Y, WZ]], ytone('#3a3a40', 1800));
    for (let i = 0; i < 28; i++) { const zz = 900 + i * 100, dd = T.lineD(cam, [[-2000, Y + 0.5, zz], [2000, Y + 0.5, zz]]); if (dd) yard += `<path d="${dd}" stroke="${ytone('#24242a', zz)}" stroke-width="${lw(cam, zz, 0.7)}" fill="none" opacity="0.6"/>`; }
    for (const [pxx, pz, rw] of [[200, 1500, 160], [700, 2300, 220], [-300, 1900, 140]]) yard += poly(cam, T.ring([pxx, Y + 0.8, pz], [rw, 0, 0], [0, 0, rw * 0.55], 16), ytone('#7a7c88', pz, 'n'), 'opacity="0.55"');
    // the curtain wall with crenellations and the gate tower, the inner buildings left and right
    yard += poly(cam, [[-3000, Y, WZ], [3000, Y, WZ], [3000, 400, WZ], [-3000, 400, WZ]], ytone('#5a5a60', wd, 's'));
    let cr = ''; for (let x = -3000; x < 3000; x += 120) cr += poly(cam, [[x, 400, WZ], [x + 70, 400, WZ], [x + 70, 470, WZ], [x, 470, WZ]], ytone('#5a5a60', wd, 's'));
    yard += cr + poly(cam, [[-500, Y, WZ - 40], [300, Y, WZ - 40], [300, 900, WZ - 40], [-500, 900, WZ - 40]], ytone('#4e4e56', wd, 's')) + poly(cam, [[-180, Y, WZ - 42], [20, Y, WZ - 42], [20, 120, WZ - 42], [-80, 200, WZ - 42], [-180, 120, WZ - 42]], ytone('#1a1a20', wd, 'd'));
    for (const sd of [-1, 1]) { const x = sd * 1300; yard += poly(cam, [[x, Y, 800], [x, Y, WZ], [x, 300, WZ], [x, 300, 800]], ytone(sd < 0 ? '#4a4a52' : '#56565e', 2000, 's')); for (let z = 1100; z < WZ - 200; z += 500) yard += poly(cam, [[x - sd * 1, -200, z], [x - sd * 1, -200, z + 120], [x - sd * 1, 0, z + 120], [x - sd * 1, 0, z]], ytone('#24242a', z, 'd')); }
    // the gibbet (billboard; its art is px with the post 980 px = 4.4 m)
    const GB = [560, Y, 1900], gb = bb(cam, GB);
    if (gb) items.push({ z: gb.d, out: 1, svg: () => { const b = bb(cam, GB); return b ? P17.gibbet(b.x, b.y, b.k * 0.45, t, { fly: o.crowFly || 0 }) : ''; } });
    // ---- the room shell: back wall with door and window cut out, side walls, ceiling and beams, the floor
    const X = RM.X, Z1 = RM.Z1, Hh = RM.H, Wn = RM.WIN, Dr = RM.DOOR;
    const winPts = [[Wn.x0, Wn.sill], [Wn.x1, Wn.sill], [Wn.x1, Wn.spring]]; for (let i = 1; i < 12; i++) { const a = i / 12; winPts.push([lerp(Wn.x1, Wn.x0, a), Wn.spring + (Wn.apex - Wn.spring) * Math.sin(Math.PI * a) ** 0.7]); } winPts.push([Wn.x0, Wn.spring]);
    const drPts = [[Dr.x0, 0], [Dr.x1, 0], [Dr.x1, Dr.h]]; for (let i = 1; i < 12; i++) { const a = i / 12; drPts.push([lerp(Dr.x1, Dr.x0, a), Dr.h + (Dr.apex - Dr.h) * Math.sin(Math.PI * a) ** 0.7]); } drPts.push([Dr.x0, Dr.h]);
    const bw = D([0, 300, Z1]);
    const outer = T.path(cam, [[-X, 0, Z1], [X, 0, Z1], [X, Hh, Z1], [-X, Hh, Z1]]), wh = T.path(cam, winPts.map(([x, y]) => [x, y, Z1])), dh = T.path(cam, drPts.map(([x, y]) => [x, y, Z1]));
    // behind the door: a torch-lit passage (seen when it opens)
    shell += poly(cam, [[Dr.x0 - 20, 0, Z1 + 400], [Dr.x1 + 20, 0, Z1 + 400], [Dr.x1 + 20, Dr.apex + 20, Z1 + 400], [Dr.x0 - 20, Dr.apex + 20, Z1 + 400]], tone('#5a3a22', bw, 'd')) + poly(cam, [[Dr.x0, 0, Z1], [Dr.x1, 0, Z1], [Dr.x1, 0, Z1 + 400], [Dr.x0, 0, Z1 + 400]], tone('#2a1e16', bw, 'g'));
    const tb = bb(cam, [Dr.x0 + 40, 220, Z1 + 300]); if (tb) shell += PR.flame(tb.x, tb.y, 0.6 * tb.k, t) + C.radial(tb.x, tb.y, 300 * tb.k, '#ffa040', 0.55, 'screen');
    if (outer) shell += `<path d="${outer}${wh ? ' ' + wh : ''}${dh ? ' ' + dh : ''}" fill-rule="evenodd" fill="${tone('#6a5a4a', bw)}"/>`;
    let crs = ''; for (let y = 45; y < Hh; y += 45) { const segs = []; let x0 = -X; const cuts = []; if (y < Dr.apex) cuts.push([Dr.x0 - 3, Dr.x1 + 3]); if (y > Wn.sill && y < Wn.apex) cuts.push([Wn.x0 - 3, Wn.x1 + 3]); cuts.sort((a, b) => a[0] - b[0]); for (const [a, b] of cuts) { segs.push([x0, a]); x0 = b; } segs.push([x0, X]); for (const [a, b] of segs) { const dd = T.lineD(cam, [[a, y, Z1 - 1], [b, y, Z1 - 1]]); if (dd) crs += dd; } }
    if (crs) shell += `<path d="${crs}" stroke="${tone('#3a2e24', bw)}" stroke-width="${lw(cam, bw, 0.8)}" fill="none" opacity="0.6"/>`;
    // window reveal (the wall's thickness) and the open shutters, the door's frame
    const rv = T.lineD(cam, [...winPts, winPts[0]].map(([x, y]) => [x, y, Z1 - 1])); if (rv) shell += `<path d="${rv}" stroke="${tone('#8a7a64', bw)}" stroke-width="${f(px(cam, [240, 300, Z1], 14))}" fill="none" stroke-linejoin="round"/>`;
    for (const [x, sd] of [[Wn.x0, -1], [Wn.x1, 1]]) shell += poly(cam, [[x, Wn.sill, Z1 - 2], [x + sd * 0, Wn.sill, Z1 - 2 - 120], [x, Wn.spring, Z1 - 2 - 120], [x, Wn.spring, Z1 - 2]], tone('#4a3420', bw), OL(lw(cam, bw), 0.6));
    const dfr = T.lineD(cam, drPts.map(([x, y]) => [x, y, Z1 - 1])); if (dfr) shell += `<path d="${dfr}" stroke="${tone('#8a7a64', bw)}" stroke-width="${f(px(cam, [-260, 200, Z1], 16))}" fill="none"/>`;
    // the door leaf (swings into the room on its left hinge)
    const op = o.door || 0, ang = op * 1.5, hx = Dr.x0, w = Dr.x1 - Dr.x0, ex = hx + w * Math.cos(ang), ez = Z1 - 3 - w * Math.sin(ang), ld = D([(hx + ex) / 2, 150, (Z1 + ez) / 2]);
    items.push({ z: ld, svg: () => { let s = poly(cam, [[hx, 0, Z1 - 3], [ex, 0, ez], [ex, Dr.h, ez], [hx, Dr.h, Z1 - 3]], tone('#5a3a20', ld), OL(lw(cam, ld), 0.6)); for (const yy of [50, 150, 250]) { const st = T.lineD(cam, [[hx, yy, Z1 - 4], [lerp(hx, ex, 0.9), yy, lerp(Z1 - 4, ez, 0.9)]]); if (st) s += `<path d="${st}" stroke="#1a1612" stroke-width="${f(px(cam, [hx, yy, Z1], 6))}" fill="none"/>`; } return s; } });
    for (const sd of [-1, 1]) {
      const x = sd * X, sdd = D([x, 300, 300]);
      shell += poly(cam, [[x, 0, RM.Z0], [x, 0, Z1], [x, Hh, Z1], [x, Hh, RM.Z0]], tone(sd < 0 ? '#5e5040' : '#665646', sdd));
      let c2 = ''; for (let y = 45; y < Hh; y += 45) { const dd = T.lineD(cam, [[x - sd, y, RM.Z0], [x - sd, y, Z1]]); if (dd) c2 += dd; } if (c2) shell += `<path d="${c2}" stroke="${tone('#3a2e24', sdd)}" stroke-width="${lw(cam, sdd, 0.8)}" fill="none" opacity="0.55"/>`;
    }
    // a tapestry on the left wall: the King's arms; a weapon rack and a lion banner of the enemy (taken) on the right
    shell += poly(cam, [[-X + 2, 520, 120], [-X + 2, 520, 620], [-X + 2, 120, 620], [-X + 2, 120, 120]], tone('#22348a', D([-X, 300, 370])), OL(1.4, 0.6));
    if (Math.abs(cam.x + X) > 260) for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) shell += plane(cam, [-X + 3, 470 - j * 130, 180 + i * 125], [0, 0, 1], [0, -1, 0], Q.lily(0, 0, 0.9, '#c8a040'), 0, 0, 30);
    shell += poly(cam, [[X - 2, 500, 200], [X - 2, 500, 520], [X - 2, 260, 520], [X - 2, 260, 200]], tone('#8a1e1a', D([X, 380, 360])), OL(1.4, 0.6)) + (D([X, 380, 360]) > 380 && Math.abs(cam.x - X) > 260 ? plane(cam, [X - 3, 380, 360], [0, 0, -1], [0, -1, 0], P17.lion(0, 0, 2.2, '#d8b040', 1), 0, 0, 40) : '');
    // the ceiling and its beams, the floor of flagstones
    shell += poly(cam, [[-X, Hh, RM.Z0], [X, Hh, RM.Z0], [X, Hh, Z1], [-X, Hh, Z1]], tone('#2a1c12', D([0, Hh, 300]), 'd'));
    for (let z = -200; z < Z1; z += 140) shell += poly(cam, [[-X, Hh - 30, z], [X, Hh - 30, z], [X, Hh - 30, z + 30], [-X, Hh - 30, z + 30]], tone('#1a120a', D([0, Hh, z]), 'd')) + poly(cam, [[-X, Hh - 30, z], [X, Hh - 30, z], [X, Hh, z], [-X, Hh, z]], tone('#3a2818', D([0, Hh, z]), 's'));
    shell += poly(cam, [[-X, 0, RM.Z0], [X, 0, RM.Z0], [X, 0, Z1], [-X, 0, Z1]], tone('#4a3e32', D([0, 0, 300]), 'g'));
    const fr = rng(41); let fl = '';
    for (let z = RM.Z0; z < Z1; z += 70) for (let x = -X; x < X; x += 90) { const ox = (Math.floor(z / 70) % 2) * 45; const dd = T.path(cam, [[x + ox + 2, 0.3, z + 2], [x + ox + 86, 0.3, z + 2], [x + ox + 86, 0.3, z + 66], [x + ox + 2, 0.3, z + 66]]); if (dd) fl += `<path d="${dd}" fill="${tone(shade('#5a4c3e', (fr() - 0.5) * 0.25), D([x, 0, z]), 'g')}"/>`; }
    shell += fl;
    // torches on the side walls (lit, warm pools)
    for (const [x, z] of [[-X + 10, 680], [X - 10, 640]]) { const b = bb(cam, [x, 330, z]); if (b) shell += `<g transform="${b.tr}"><path d="M0,0 L0,-34" stroke="#1a1410" stroke-width="5"/></g>` + PR.flame(b.x, b.y - 36 * b.k, 0.55 * b.k, t + x) + C.radial(b.x, b.y - 40 * b.k, 340 * b.k, '#ffa040', 0.45, 'screen'); }
    // ---- the table, its map and tokens, the candlesticks
    const TB = RM.TAB, td = D([0, TB.y, (TB.z0 + TB.z1) / 2]);
    items.push({ z: td, svg: () => {
      let s = poly(cam, [[-TB.x - 14, TB.y, TB.z0 - 14], [TB.x + 14, TB.y, TB.z0 - 14], [TB.x + 14, TB.y, TB.z1 + 14], [-TB.x - 14, TB.y, TB.z1 + 14]], tone('#5a3a20', td), OL(lw(cam, td), 0.6));
      s += poly(cam, [[-TB.x - 14, TB.y, TB.z0 - 14], [TB.x + 14, TB.y, TB.z0 - 14], [TB.x + 14, TB.y - 10, TB.z0 - 14], [-TB.x - 14, TB.y - 10, TB.z0 - 14]], tone('#3a2412', td));
      for (const sd of [-1, 1]) s += poly(cam, [[sd * (TB.x - 30) - 10, TB.y - 10, TB.z0 + 10], [sd * (TB.x - 30) + 10, TB.y - 10, TB.z0 + 10], [sd * (TB.x - 30) + 14, 0, TB.z0 + 10], [sd * (TB.x - 30) - 14, 0, TB.z0 + 10]], tone('#3a2412', td));
      { const md = cam.dist([0, TB.y, 380]), sl = Math.abs(cam.y - TB.y) / Math.max(1, md), nn = md > 520 && sl > 0.5 ? 2 : md > 320 ? 5 : 9; s += tiled(cam, RM.MAP.O, RM.MAP.U, RM.MAP.V, P17.MAP.W, P17.MAP.H, nn, Math.max(2, Math.round(nn * 0.75)), P17.channelMap(t, { tokens: o.tokens || [] }), 'mp'); }
      if (o.letter) { const L = o.letter, lp = L.p; s += plane(cam, [lp[0], TB.y + 1.2, lp[2]], [L.k || 0.12, 0, 0], [0, 0, -(L.k || 0.12)], P17.letter(0, 0, 1, L.rot || 0, { wet: 0.6 }), 0, 0, 40); }
      return s;
    } });
    for (const [x, z] of [[-TB.x + 16, TB.z0 + 10], [TB.x - 16, TB.z0 + 10], [-TB.x + 16, TB.z1 - 14], [TB.x - 16, TB.z1 - 14]]) {
      const P0 = [x, TB.y, z], b0 = bb(cam, P0); if (!b0) continue;
      items.push({ z: b0.d - 2, svg: () => { const b = bb(cam, P0); if (!b) return ''; return `<g transform="${b.tr}"><path d="M-6,0 L6,0 L2,-4 L2,-26 L-2,-26 L-2,-4Z" fill="#2a2420"/><rect x="-2.4" y="-40" width="4.8" height="14" rx="1.5" fill="#efe6cc"/></g>` + PR.flame(b.x, b.y - 41 * b.k, 0.22 * b.k, t + x * 0.1) + C.radial(b.x, b.y - 44 * b.k, 120 * b.k, '#ffb860', 0.45, 'screen'); } });
    }
    return { yard, shell, items, E };
  };
  // drizzle in the courtyard (screen space streaks), when the camera is out of the window or looking through it
  const drizzle = (t, k) => { if (k < 0.01) return ''; const r = rng(77); let g = ''; for (let i = 0; i < 70; i++) { const x = r() * 1180 - 50, sp = 900 + r() * 500, y = ((r() * 2100 + t * sp) % 2100) - 90, l = 30 + r() * 30; g += `<path d="M${f(x)},${f(y)} l-6,${f(l)}" stroke="#d8dce8" stroke-width="1.6" opacity="${f(0.25 * k)}"/>`; } return g; };
  HL.roomRender = (cam, t, o = {}, actors = []) => {
    const H = HL.roomDraw(cam, t, o);
    const all = H.items.concat(actors).sort((a, b) => b.z - a.z);
    const outside = cam.z > RM.Z1 - 40;
    let yardItems = '', roomItems = '';
    for (const it of all) { const s = it.svg(); if (!s) continue; if (it.out) yardItems += s; else roomItems += s; }
    const mist = `<rect x="-60" y="-60" width="1200" height="2040" fill="#9a9aa6" opacity="0.12"/>`;
    return `${H.yard}${yardItems}${mist}${drizzle(t, o.rain ?? 1)}${outside ? '' : H.shell}${outside ? '' : roomItems}`;
  };

  // ======================================================= THE HARBOUR OF SLUYS
  // the sea at y = 0; the coast and the town far off at z ~ 30000; the French fleet chained in three lines across the
  // harbour mouth (z 9000 - 12000), broadside; the English coming in from our side. o.dusk 0..1 (the evening after)
  const SEA = HL.SEA = {};
  SEA.FRENCH = (() => { const L = [], r = rng(901); for (let row = 0; row < 3; row++) for (let i = 0; i < 9; i++) L.push({ x: -9000 + i * 2200 + row * 700 + (r() - 0.5) * 300, z: 9000 + row * 1400 + (r() - 0.5) * 200, dir: r() < 0.5 ? -1 : 1, seed: 100 + row * 10 + i, row }); return L; })();
  // (none in the corridor the camera cranes down, x -3600 .. 600)
  SEA.ENGLISH = (() => { const L = [], r = rng(907); for (const x of [-9800, -7600, -5300, -4400, 900, 4300, 6600, 8900]) L.push({ x: x + (r() - 0.5) * 500, z: 4200 + (r() - 0.5) * 1500, dir: r() < 0.5 ? -1 : 1, seed: 300 + L.length }); return L; })();
  const seaPal = k => ({ skyT: G.RIG.mix('#7aa0c8', '#2a1830', k), skyH: G.RIG.mix('#f0dcb0', '#d8582a', k), sea: G.RIG.mix('#2a4a58', '#1a1418', k), seaH: G.RIG.mix('#8aa8a8', '#a8482a', k), coast: G.RIG.mix('#6a7a6a', '#2a1a20', k), town: G.RIG.mix('#8a8a80', '#24161a', k) });
  HL.seaDraw = (cam, t, o = {}) => {
    const k = o.dusk || 0, P = seaPal(k), items = [], hz = cam.dir([0, 0, 1]), hy = hz ? hz[1] : -400;
    let back = '';
    // the sky and its haze, the sun low behind the camera's left (its light on the sails); smoke darkening the sky
    back += `<defs><linearGradient id="sxS" gradientUnits="userSpaceOnUse" x1="0" y1="${f(hy - 1600)}" x2="0" y2="${f(hy + 10)}"><stop offset="0" stop-color="${P.skyT}"/><stop offset="1" stop-color="${P.skyH}"/></linearGradient>` +
      `<linearGradient id="sxW" gradientUnits="userSpaceOnUse" x1="0" y1="${f(hy)}" x2="0" y2="${f(hy + 1500)}"><stop offset="0" stop-color="${P.seaH}"/><stop offset="0.25" stop-color="${G.RIG.mix(P.seaH, P.sea, 0.6)}"/><stop offset="1" stop-color="${P.sea}"/></linearGradient></defs>`;
    back += `<rect x="-60" y="-60" width="1200" height="${f(clamp(hy + 62, 0, 2100))}" fill="url(#sxS)"/>`;
    const r = rng(511);
    for (let i = 0; i < 9; i++) { const cx = ((r() * 2000 + t * (5 + r() * 6)) % 2100) - 500, cy = hy - 120 - r() * 700; back += `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(300 + r() * 300)}" ry="${f(40 + r() * 50)}" fill="${G.RIG.mix('#fff4e0', '#ff9a60', k)}" opacity="${f(0.25 + 0.15 * k)}" filter="url(#b14)"/>`; }
    if (k > 0.05) back += C.radial(260, hy - 40, 900, '#ff7a30', 0.5 * k, 'screen');
    // the far coast: low dunes, the town of Sluys (roofs, a church tower, a windmill), seen through the haze
    const cz = 30000, cb = (x, y) => cam.proj([x, y, cz]);
    let coast = 'M-60,' + f(hy + 4);
    for (let i = 0; i <= 24; i++) { const x = -40000 + i * 80000 / 24, p = cb(x, 180 + 140 * Math.sin(i * 1.7) + 60 * Math.sin(i * 3.1)); if (p) coast += ` L${f(p[0])},${f(p[1])}`; }
    coast += ` L1140,${f(hy + 4)}Z`;
    back += `<path d="${coast}" fill="${P.coast}" opacity="0.85"/>`;
    const tw = cb(1800, 0);
    if (tw) { const kk = cam.fl / (cz - cam.z); let s = ''; for (let i = 0; i < 16; i++) { const xx = -2400 + i * 300, hh = 300 + (i * 37) % 200; s += `<path d="M${xx},0 L${xx},${-hh} L${xx + 140},${-hh - 160} L${xx + 280},${-hh} L${xx + 280},0Z" fill="${P.town}"/>`; } s += `<path d="M-200,0 L-200,-1300 L0,-1700 L200,-1300 L200,0Z" fill="${shade(P.town, -0.1)}"/><path d="M1900,0 L1950,-700 L2050,-700 L2100,0Z" fill="${P.town}"/><path d="M2000,-700 L2000,-1050 M1800,-880 L2200,-520 M1800,-520 L2200,-880" stroke="${P.town}" stroke-width="40"/>`; back += `<g transform="translate(${f(tw[0])},${f(tw[1])}) scale(${kk.toFixed(5)})" opacity="0.8">${s}</g>`; }
    // the sea: a gradient below the horizon, swell lines in perspective (bigger near), glitter
    back += `<rect x="-60" y="${f(hy)}" width="1200" height="${f(Math.max(0, 2000 - hy))}" fill="url(#sxW)"/>`;
    let sw = '';
    for (let i = 0; i < 46; i++) {
      const z = cam.z + 120 + 40 * i * i * 0.8, amp = 6 + z * 0.002, ph = t * 1.1 + i * 1.7, pts = [];
      for (let j = 0; j <= 16; j++) { const x = cam.x - z * 1.2 + j * z * 2.4 / 16; pts.push([x, amp * Math.sin(x * 0.004 + ph), z + 30 * Math.sin(x * 0.002 + i)]); }
      const dd = T.lineD(cam, pts); if (dd) sw += `<path d="${dd}" stroke="${i % 3 ? '#0a161c' : G.RIG.mix('#e8f0f0', '#ffb070', k)}" stroke-width="${f(clamp(14000 / z, 0.5, 9))}" fill="none" opacity="${f(i % 3 ? 0.5 : 0.38)}"/>`;
    }
    back += sw;
    for (let i = 0; i < 40; i++) { const z = 3000 + r() * 20000, x = cam.x + (r() - 0.5) * z * 1.4, p = cam.proj([x, 2, z]); if (p) back += `<ellipse cx="${f(p[0])}" cy="${f(p[1])}" rx="${f(clamp(600000 / z / z * 60, 2, 18))}" ry="1.4" fill="${G.RIG.mix('#fff8e0', '#ffc080', k)}" opacity="${f((0.3 + 0.4 * Math.sin(t * 3 + i)) * (1 - 0.5 * k))}"/>`; }
    // the ships (broadside billboards; cog art 630 px long ~ 25 m: 4 cm a px)
    const ship = (S, side) => {
      const P0 = [S.x, 0, S.z], b0 = bb(cam, P0); if (!b0 || b0.k * 4 < 0.004) return;
      const so = (o.ship && o.ship(S, side, t)) || {};
      items.push({ z: b0.d, svg: () => {
        const b = bb(cam, P0); if (!b) return '';
        const sc = b.k * 4, haze = clamp((b.vd - 3000) / 30000) * 0.7;
        let s = P17.cog(b.x, b.y, sc, t, Object.assign({ dir: S.dir, seed: S.seed, sail: side === 'F' ? '#e8e2d0' : '#ece4d4', emblem: side === 'F' ? 'lily' : 'lions', stripes: side === 'F' ? '#22348a' : '#b8221a', banner: side === 'F' ? '#22348a' : '#b8221a', dark: k * 0.8 }, so));
        // the swell along the hull
        s += `<path d="M${f(b.x - 330 * sc)},${f(b.y + 4 * sc)} C${f(b.x - 150 * sc)},${f(b.y - 10 * sc)} ${f(b.x + 150 * sc)},${f(b.y + 14 * sc)} ${f(b.x + 340 * sc)},${f(b.y)} L${f(b.x + 340 * sc)},${f(b.y + 120 * sc)} L${f(b.x - 330 * sc)},${f(b.y + 120 * sc)}Z" fill="${P.sea}" opacity="0.92"/><path d="M${f(b.x - 330 * sc)},${f(b.y + 4 * sc)} C${f(b.x - 150 * sc)},${f(b.y - 10 * sc)} ${f(b.x + 150 * sc)},${f(b.y + 14 * sc)} ${f(b.x + 340 * sc)},${f(b.y)}" stroke="#e8f0f0" stroke-width="${f(Math.max(0.6, 3 * sc))}" fill="none" opacity="0.5"/>`;
        if (so.fire > 0.15) s = `<ellipse cx="${f(b.x)}" cy="${f(b.y + 60 * sc)}" rx="${f(420 * sc)}" ry="${f(90 * sc + 4)}" fill="#ff8a30" opacity="${f(0.32 * so.fire)}" style="mix-blend-mode:screen" filter="url(#b8)"/>` + s;
        if (so.smoke) s += P17.smoke(b.x, b.y - 120 * sc, sc * 3, t, S.seed, { n: 12, wind: 40, rise: 70, op: 0.5 * so.smoke });
        
        return haze > 0.02 ? `<g opacity="${f(1 - haze * 0.6)}">${s}</g>` : s;
      } });
    };
    for (const S of SEA.FRENCH) ship(S, 'F');
    if (o.english !== false) for (const S of SEA.ENGLISH) ship(S, 'E');
    // the chains between the French ships of each row (sagging iron at deck height)
    let chains = '';
    for (let row = 0; row < 3; row++) { const L = SEA.FRENCH.filter(s => s.row === row).sort((a, b) => a.x - b.x); for (let i = 0; i < L.length - 1; i++) { const a = [L[i].x + 1100, 120, L[i].z], b = [L[i + 1].x - 1100, 120, L[i + 1].z], pts = []; for (let j = 0; j <= 8; j++) { const u = j / 8; pts.push([lerp(a[0], b[0], u), 120 - 80 * Math.sin(Math.PI * u), lerp(a[2], b[2], u)]); } const dd = T.lineD(cam, pts); if (dd) chains += `<path d="${dd}" stroke="#1a1410" stroke-width="${f(px(cam, a, 12))}" fill="none" opacity="0.8"/>`; } }
    items.push({ z: 9000 - cam.z + 2000, svg: () => chains });
    return { back, items, P };
  };
  HL.seaRender = (cam, t, o = {}, actors = []) => {
    const H = HL.seaDraw(cam, t, o);
    const all = H.items.concat(actors).sort((a, b) => b.z - a.z);
    let body = ''; for (const it of all) { const s = it.svg(); if (s) body += s; }
    return H.back + body + (o.over ? o.over(cam, t) : '');
  };
})(window);
