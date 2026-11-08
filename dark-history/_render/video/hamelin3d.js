// Hamelin in perspective (street3d.js): the west gate street at dawn, the market square in the morning sun and the
// street where you live, with your window. Each scene takes a camera, the time and the actors (people and anything
// else that stands in the street, as { z: camera depth, svg() }), and returns the frame's set with the actors
// depth-sorted among the signs, barrels, washing and well.
(function (G) {
  const T = G.ST3, { f, rng, shade } = G.RIG, C = G.CINE;
  const H3 = G.H3 = {};
  const norm = v => { const n = Math.hypot(...v); return v.map(x => x / n); };
  const PAL = H3.PAL = [
    { pl: '#e6d8bc', tm: '#4a2e1e', sh: '#4a6a3a', rf: '#8a4430', gf: '#cfc2aa' },
    { pl: '#e2c48e', tm: '#5a2a1e', sh: '#8a2a22', rf: '#7a3a2c', gf: '#c8b494' },
    { pl: '#ead2c4', tm: '#3a2a22', sh: '#3a5070', rf: '#6a4a48', gf: '#d0beb0' },
    { pl: '#efe8da', tm: '#6a2a20', sh: '#b88a3a', rf: '#8a4a34', gf: '#d8d0c0' },
    { pl: '#d8d4bc', tm: '#2a221c', sh: '#5a3a6a', rf: '#5a4a50', gf: '#c4c0aa' },
    { pl: '#e8cfa6', tm: '#3e2618', sh: '#2e5a5a', rf: '#94503a', gf: '#cdb898' }
  ];
  const SIGNS = ['pretzel', 'boot', 'key', 'board'];
  // a row of houses along one side of a street from za to zb
  const row = (side, X, za, zb, seed, x = {}) => {
    const r = rng(seed), out = []; let z = za, i = 0;
    while (z < zb - 200) {
      const w = Math.min(zb - z, 460 + r() * 320), fl = r() < 0.55 ? [330, 280, 270] : [320, 280], gable = r() < (x.gableP ?? 0.62);
      out.push(Object.assign({ side, X, z0: z, z1: z + w, fl, gable, pal: PAL[(i * 2 + seed) % PAL.length], seed: seed * 10 + i, jet: 22 + r() * 8, depth: 800 + r() * 300, pitch: gable ? 1.15 + r() * 0.35 : 0.9 + r() * 0.3, sign: r() < (x.signP ?? 0.35) ? { kind: SIGNS[(i + seed) % 4] } : null, litP: x.litP ?? 0.25, flowers: x.flowers ?? 0.45 }, (x.over || {})[i] || {}));
      z += w; i++;
    }
    return out;
  };
  H3.row = row;
  // a character standing in a scene: rig options at the right screen place and scale for real height hCm
  H3.place = (cam, x, z, hCm, kind) => T.stand(cam, x, z, hCm, G.RIG.DIMS[kind].H);
  const smokeOf = (cam, list, t) => G.DBG.nosmoke ? '' : list.map(o => o._g && o._g.chim ? T.smoke(cam, o._g.chim, t + o.seed * 0.37, { lean: 1 }) : '').join('');

  // ======================================================= THE WEST GATE STREET AT DAWN
  // The street runs from the camera (z 0) to the gate tower (z 6300); the low sun rises behind the gate, a little to the
  // right: the left row's upper floors catch it, the street lies in cool shade with the light from the arch along it.
  const DAWN = H3.DAWN = {
    sunDir: norm([0.3, 0.1, 1]), sunCol: '#ffb070', sunOp: 0.55, shade: '#4a4a74', shadeK: 0.36, haze: '#d8a4a4', hazeD: 5200, hazeMax: 0.78, skyGlass: '#b88aa0',
    litSide: -1, lit: z => 600 + 90 * Math.sin(z * 0.0021) + 50 * Math.sin(z * 0.0057 + 1),
    sky: [[0, '#ffd8a0'], [160, '#f6ae8a'], [480, '#c48098'], [1000, '#6a5482'], [1900, '#2c2c56']],
    clouds: [{ az: -14, el: 9, w: 9, h: 0.9, col: '#a07898', lit: '#ffc8a0', op: 0.7 }, { az: 16, el: 13, w: 12, h: 1.1, col: '#8a6a90', lit: '#f8b898', op: 0.65 }, { az: 2, el: 21, w: 16, h: 1.4, col: '#6a5a86', lit: '#e8a0a0', op: 0.55 }, { az: -26, el: 30, w: 14, h: 1.2, col: '#5a4a7a', lit: '#c8889a', op: 0.5 }],
    birds: 7
  };
  const GATE = H3.GATE = { z: 6300, w: 940, h: 1500, aw: 340, ah: 580, depth: 760, roofH: 960 };
  const DHOUSES = [...row(-1, -360, 150, 5600, 3), ...row(1, 360, 150, 5600, 7)];
  // the right row's skyline, thrown 21 m up the street and 2 m down onto the left row by the low sun
  { const top = T.rowTop(DHOUSES, 1); DAWN.lit = z => top(z + 2080) - 208; }
  const DHILLS = [
    { x0: -60000, x1: 60000, z: 90000, y: 2600, amp: 900, f1: 0.00011, f2: 0.00029, ph: 1, col: '#9a7a98' },
    { x0: -40000, x1: 40000, z: 52000, y: 1200, amp: 700, f1: 0.00018, f2: 0.0005, ph: 2, col: '#7a6a80', bump: x => 1600 * Math.exp(-(((x - 3000) / 5000) ** 2)) }
  ];
  const DPROPS = [['barrel', -300, 900, { col: '#6a4a2e' }], ['barrel', -296, 990, {}], ['pot', 312, 1500, {}], ['pot', -318, 2350, { flower: '#e8c040' }], ['crates', 296, 2900, {}], ['barrel', 300, 4100, {}], ['pot', -316, 3900, { flower: '#d85a8a' }], ['crates', -300, 4700, { fruit: '#d8a030' }]];
  const DWASH = [
    { x0: -330, x1: 330, y: 780, z: 1820, sag: 70, cloths: [{ u: 0.2, w: 60, h: 80, col: '#ece4d4' }, { u: 0.38, w: 44, h: 60, col: '#a83a30' }, { u: 0.6, w: 70, h: 90, col: '#d8d0c0' }, { u: 0.8, w: 40, h: 50, col: '#3a5a8a' }] },
    { x0: -310, x1: 320, y: 930, z: 4900, sag: 60, cloths: [{ u: 0.3, w: 60, h: 70, col: '#e8dcc8' }, { u: 0.55, w: 50, h: 64, col: '#6a8a4a' }, { u: 0.75, w: 54, h: 70, col: '#ece4d4' }] }
  ];
  H3.dawn = (cam, t, actors = [], o = {}) => {
    const E = Object.assign({}, DAWN, o.env || {});
    let g = T.sky(cam, E, t) + T.hills(cam, E, DHILLS);
    const road = T.path(cam, [[-1400, 0, GATE.z], [1400, 0, GATE.z], [3000, 0, 40000], [-3000, 0, 40000]]); if (road) g += `<path d="${road}" fill="${T.tone(E, '#b08870', 8000, 'n')}"/>`;
    g += T.gate(cam, E, Object.assign({}, GATE, o.gate || {}));
    g += T.street(cam, E, { x0: -360, x1: 360, z1: GATE.z, col: '#4e4858', stone: '#887c8e' });
    // the light from the arch lying along the street
    const sh = T.path(cam, [[-300, 0.5, GATE.z], [300, 0.5, GATE.z], [520, 0.5, cam.z + 300], [-520, 0.5, cam.z + 300]]);
    if (sh) { const a = cam.proj([0, 0, GATE.z]), b = cam.proj([0, 0, cam.z + 400]) || [540, 1920]; if (a) { const id = G.RIG.uid('ls'); g += `<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}"><stop offset="0" stop-color="#ffc888" stop-opacity="0.75"/><stop offset="1" stop-color="#ffc888" stop-opacity="0"/></linearGradient></defs><path d="${sh}" fill="url(#${id})" style="mix-blend-mode:screen" filter="url(#b8)"/>`; } }
    const H = T.houses(cam, E, DHOUSES);
    g += H.svg + smokeOf(cam, DHOUSES, t);
    const items = [...H.props, ...DPROPS.map(([k, x, z, oo]) => T.prop(cam, E, k, x, z, oo)).filter(Boolean), ...DWASH.map(w => T.washing(cam, E, w, t)).filter(Boolean), ...actors].sort((a, b) => b.z - a.z);
    for (const it of items) g += it.svg();
    // shafts of dawn light from the arch, haze lying toward the gate
    const L = norm([-0.1, -0.07, -1]), z0 = GATE.z + 20;
    g += T.beams(cam, [[[-180, 0, z0], [-180, 500, z0], 0.6], [[-30, 0, z0], [-30, 560, z0], 1], [[140, 0, z0], [140, 520, z0], 0.75]], L, 2600, '#ffd0a0', o.beamOp ?? 0.2);
    const vp = cam.proj([0, 300, GATE.z]);
    if (vp) g += C.radial(vp[0], vp[1], 900, '#ffc8a0', 0.35, 'screen');
    return g;
  };

  // ======================================================= THE MARKET SQUARE, MORNING
  // The square runs from z 300 to the far row at z 2800 (facing the camera), x -1300 .. 1300. A lane leaves through the
  // far row (x -200 .. 400): the Piper comes out of it. The sun is low behind the camera on the left: the right row and the
  // far row are in full sun, the left row in shade and its shadow lies across the left of the square.
  const SUN = H3.SUN = {
    sunDir: norm([-0.5, 0.42, -0.75]), sunCol: '#ffd8a0', sunOp: 0.42, shade: '#5a6080', shadeK: 0.3, haze: '#e8dcc8', hazeD: 9000, hazeMax: 0.7, skyGlass: '#b8c8d8',
    litSide: 1, lit: () => -10,
    sky: [[0, '#fbe6bc'], [260, '#e6e2d0'], [800, '#a8c4dc'], [1800, '#6a92c4']],
    clouds: [{ az: -10, el: 12, w: 10, h: 0.8, col: '#f4f0e8', lit: '#ffffff', op: 0.6 }, { az: 18, el: 18, w: 14, h: 1.1, col: '#eae6e0', lit: '#ffffff', op: 0.55 }],
    birds: 4
  };
  const backXf = Zb => p => [p[2], p[1], Zb - p[0]];
  const SQ = H3.SQ = { Zb: 2800, X: 1300 };
  const SHOUSES = [
    ...row(-1, -1300, 300, 2800, 11, { signP: 0.5 }),
    ...row(1, 1300, 300, 2800, 13, { signP: 0.5 }),
    // the far row, turned to face the camera, with the lane between x -200 and 400
    ...row(-1, 0, -1300, -200, 17, { flowers: 0.6 }).map(o => Object.assign(o, { xf: backXf(SQ.Zb), litSide: true })),
    ...row(-1, 0, 400, 1300, 19, { flowers: 0.6 }).map(o => Object.assign(o, { xf: backXf(SQ.Zb), litSide: true })),
    // the lane beyond it
    ...row(-1, -200, SQ.Zb + 40, 5600, 23), ...row(1, 400, SQ.Zb + 40, 5600, 29)
  ];
  const SPROPS = [['well', 380, 1500, {}], ['tree', -760, 2150, { h: 980, seed: 4 }], ['bench', -760, 1850, {}], ['crates', -1180, 900, {}], ['barrel', -1200, 1150, {}], ['pot', 1200, 1000, {}], ['barrel', 1210, 2350, {}], ['crates', 1180, 1700, { fruit: '#e0a030' }]];
  H3.square = (cam, t, actors = [], o = {}) => {
    const E = Object.assign({}, SUN, o.env || {});
    let g = T.sky(cam, E, t) + T.hills(cam, E, [{ x0: -60000, x1: 60000, z: 80000, y: 1400, amp: 700, f1: 0.00012, f2: 0.0003, ph: 3, col: '#a8b4c0' }]);
    g += T.tower(cam, E, { x: -700, z: 7200, w: 900, h: 3600, spire: 2600, col: '#a89a8a', roof: '#4a5a6a' });
    g += T.street(cam, E, { x0: -1300, x1: 1300, z0: -3000, z1: SQ.Zb, col: '#7a7266', stone: '#a49886', stoneD: 560, sz: 1.5 });
    g += T.street(cam, E, { x0: -200, x1: 400, z0: SQ.Zb, z1: 5600, col: '#7a7266', stone: '#a49886', stoneD: 0 });
    // the shade of the left row lying across the square
    // the morning sun lying warm on the cobbles, the left row's shade across the left of the square
    const sunG = T.path(cam, [[-640, 0.3, -3000], [1300, 0.3, -3000], [1300, 0.3, SQ.Zb], [-560, 0.3, SQ.Zb]]);
    if (sunG && !G.DBG.nosg) g += `<path d="${sunG}" fill="#ffd8a0" opacity="0.3" style="mix-blend-mode:screen"/>`;
    const shd = T.path(cam, [[-1300, 0.4, -3000], [-1300, 0.4, SQ.Zb], [-560, 0.4, SQ.Zb], [-640, 0.4, -3000]]);
    if (shd && !G.DBG.noshd) g += `<path d="${shd}" fill="#2a3050" opacity="0.28" filter="url(#b4)"/>`;
    const H = T.houses(cam, E, SHOUSES);
    g += H.svg + smokeOf(cam, SHOUSES, t);
    const items = [...H.props, ...SPROPS.map(([k, x, z, oo]) => T.prop(cam, E, k, x, z, oo)).filter(Boolean), ...actors].sort((a, b) => b.z - a.z);
    for (const it of items) g += it.svg();
    // morning light raking across from the left
    if (!G.DBG.norad) g += C.radial(-200, 300, 1500, '#fff0c8', 0.18, 'screen');
    return g;
  };

  // ======================================================= THE STREET WHERE YOU LIVE, MORNING
  // Your house is on the left (z 700 .. 1360), its first-floor window open; the street runs on to a church at its far end
  // (z 7200). The sun is to the right and fairly high: the left row is lit above the shadow of the right row.
  const MORN = H3.MORN = {
    sunDir: norm([0.6, 0.48, 0.35]), sunCol: '#ffd09a', sunOp: 0.36, shade: '#525a7e', shadeK: 0.32, haze: '#e4d6c4', hazeD: 7000, hazeMax: 0.72, skyGlass: '#a8b8cc',
    litSide: -1, lit: z => 380 + 70 * Math.sin(z * 0.0023) + 40 * Math.sin(z * 0.0061 + 2),
    sky: [[0, '#f8e2b8'], [240, '#e0dccc'], [760, '#9cbcd8'], [1800, '#5e88bc']],
    clouds: [{ az: -8, el: 10, w: 12, h: 0.9, col: '#f0ece4', lit: '#ffffff', op: 0.55 }, { az: 14, el: 16, w: 15, h: 1.2, col: '#e8e4dc', lit: '#ffffff', op: 0.5 }],
    birds: 5
  };
  const HOME = H3.HOME = { X: -340, z0: 700, z1: 1360, fl: [320, 280, 270], k: 1, i: 0 };
  const WHOUSES = [
    ...row(-1, -340, -900, 700, 31),
    Object.assign({ side: -1, X: HOME.X, z0: HOME.z0, z1: HOME.z1, fl: HOME.fl, gable: true, pal: PAL[1], seed: 501, jet: 26, depth: 900, pitch: 1.3, win: 2, open: [HOME.k, HOME.i], flowers: 1, flowerC: '#d83a2a', litP: 0 }),
    ...row(-1, -340, 1360, 6600, 37),
    ...row(1, 340, -900, 6600, 41)
  ];
  { const top = T.rowTop(WHOUSES, 1); MORN.lit = z => top(z + 357) - 490; }
  const WPROPS = [['pot', -312, 560, {}], ['barrel', 300, 300, {}], ['barrel', 296, 390, { col: '#6a4a2e' }], ['crates', -296, 1600, {}], ['pot', 316, 2200, { flower: '#e8c040' }], ['barrel', -300, 3100, {}], ['pot', 312, 3900, {}]];
  const WWASH = [{ x0: -310, x1: 310, y: 820, z: 2600, sag: 60, cloths: [{ u: 0.25, w: 60, h: 80, col: '#ece4d4' }, { u: 0.5, w: 46, h: 62, col: '#a83a30' }, { u: 0.72, w: 64, h: 84, col: '#e0d8c8' }] }];
  H3.home = (cam, t, actors = [], o = {}) => {
    const E = Object.assign({}, MORN, o.env || {});
    let g = T.sky(cam, E, t) + T.hills(cam, E, [{ x0: -60000, x1: 60000, z: 80000, y: 1600, amp: 800, f1: 0.00012, f2: 0.0003, ph: 5, col: '#a8b4c4' }]);
    g += T.tower(cam, E, { x: 0, z: 7400, w: 1100, h: 3000, spire: 2400, col: '#b0a294', roof: '#4a5a6a', front: true });
    g += T.street(cam, E, { x0: -340, x1: 340, z0: -900, z1: 7200, col: '#5a5450', stone: '#93887c' });
    const H = T.houses(cam, E, WHOUSES);
    g += H.svg + smokeOf(cam, WHOUSES, t);
    if (o.window) g += o.window(cam, E, WHOUSES[WHOUSES.findIndex(h => h.open)]._g);
    const items = [...H.props, ...WPROPS.map(([k, x, z, oo]) => T.prop(cam, E, k, x, z, oo)).filter(Boolean), ...WWASH.map(w => T.washing(cam, E, w, t)).filter(Boolean), ...actors].sort((a, b) => b.z - a.z);
    for (const it of items) g += it.svg();
    return g;
  };
  // ======================================================= OUTSIDE THE WALLS: the east gate, the meadow, the hill
  // (terrain3d.js). The town is at z > 0 behind its wall; the path leaves the gate and climbs the hill to the summit at
  // z -24200. The morning sun stands over the hill: the gate and the wall are in full light, the hill is seen against it.
  const OUT = H3.OUT = {
    sunDir: norm([0.22, 0.32, -1]), sunCol: '#ffd090', sunOp: 0.45, shade: '#4a5478', shadeK: 0.28, haze: '#ecd8bc', hazeD: 26000, hazeMax: 0.55, skyGlass: '#a8b8cc', lodD: 6000,
    litSide: 2, lit: () => 99999,
    sky: [[0, '#ffdca4'], [170, '#f8cc98'], [480, '#d4c8c8'], [1100, '#8aa6cc'], [2200, '#4a6aa6']],
    clouds: [{ az: 168, el: 9, w: 14, h: 1, col: '#f6eee0', lit: '#ffffff', op: 0.55 }, { az: 196, el: 15, w: 12, h: 1.1, col: '#efe6da', lit: '#ffffff', op: 0.5 }, { az: 10, el: 14, w: 16, h: 1.2, col: '#ece8e0', lit: '#ffffff', op: 0.5 }],
    birds: 6
  };
  const TOWNBACK = [
    ...row(-1, 0, -3600, -500, 51, { gableP: 0.4 }).map(o => Object.assign(o, { xf: backXf(900), litSide: true })),
    ...row(-1, 0, 500, 3800, 53, { gableP: 0.4 }).map(o => Object.assign(o, { xf: backXf(900), litSide: true }))
  ];
  // the rest of the town, seen only from far off (from the hill): rows of roofs
  const TOWNIN = [1900, 2900, 3900].flatMap((zb, k) => [...row(-1, 0, -3600 + k * 300, -300, 61 + k, { gableP: 0.5 }), ...row(-1, 0, 300, 3800 - k * 300, 71 + k, { gableP: 0.5 })].map(o => Object.assign(o, { xf: backXf(zb), litSide: true })));
  const OGATE = { z: 0, w: 900, h: 1400, aw: 320, ah: 560, depth: 760, roofH: 900, wallH: 860, lit: 0.42, col: '#9a8a7e', roof: '#6a4a40' };
  H3.outside = (cam, t, actors = [], o = {}) => {
    const E = Object.assign({}, OUT, o.env || {}), TR = G.TR3;
    let g = T.sky(cam, E, t) + T.hills(cam, E, [{ x0: -90000, x1: 90000, z: -90000, y: 3600, amp: 1400, f1: 0.00009, f2: 0.00023, ph: 2, col: '#9aa8b8' }, { x0: -90000, x1: 90000, z: 70000, y: 2200, amp: 900, f1: 0.0001, f2: 0.00027, ph: 4, col: '#a4b0bc' }]);
    // inside the walls: the church and the backs of the houses showing over the wall, then the wall and the gate
    // the land beyond the town (farmland, the river), under everything that stands in the town
    g += TR.ground(cam, E, [{ x0: -43200, x1: 43200, z0: 0, z1: 16200, cell: 1800 }], Object.assign({ zr: [0, 1e9], items: TR.trees(cam, E, { sunX: o.sunX, side: 1 }) }, o.land || {}));
    g += T.tower(cam, E, { x: -1600, z: 6400, w: 900, h: 3200, spire: 2400, col: '#b4a696', roof: '#4a5a6a' });
    // the rest of the town shows only from high up: it comes in with the camera's height (o.town 0..1) rather than at once
    if (o.town > 0.004) { const s = T.houses(cam, E, TOWNIN).svg; g += o.town < 0.996 ? `<g opacity="${f(o.town)}">${s}</g>` : s; }
    g += T.street(cam, E, { x0: -3600, x1: 3800, z0: 0, z1: 900, col: '#6a6258', stone: '#958a7e', stoneD: 0 });
    g += T.houses(cam, E, TOWNBACK).svg;
    g += T.gate(cam, E, OGATE);
    // the meadow and the hill, with everything that stands on them sorted in among the land (a crest hides what is behind it)
    g += TR.ground(cam, E, o.regions || [{ x0: -43200, x1: 43200, z0: -39600, z1: -1800, cell: 900 }, { x0: -6000, x1: 6000, z0: -2400, z1: 0, cell: 200 }], Object.assign({ zr: [-1e9, 0], items: [...actors, ...(o.extra || []), ...TR.trees(cam, E, { sunX: o.sunX, side: -1 })] }, o.land || {}));
    return g;
  };

  // ======================================================= CENTURIES LATER: A CHILD'S BEDROOM AT NIGHT
  // A beamed room (x -320 .. 320, back wall at z 520, ceiling 290). The bed stands head to the back wall; the child sits
  // up against the pillows, the father sits on the bed's far edge beside her with the open book; an oil lamp on the night
  // table on the left, the window in the left wall full of night and the moon.
  const NIGHT = H3.NIGHT = { sunDir: norm([-0.6, 0.3, 0.2]), shade: '#2a2a4a', shadeK: 0.42, haze: '#1a1a2a', hazeD: 90000, hazeMax: 0.2 };
  // zq: where the quilt ends, just in front of the two sitting up in bed (the child at z 470, the father at 482)
  const BED = H3.BED = { x0: -150, x1: 110, z0: 360, z1: 515, zq: 462, top: 62, lamp: [-232, 98, 470] };
  H3.bedroom = (cam, t, actors = { back: '', front: '' }, o = {}) => {
    // (the lamp breathes slowly: a quick flicker pulsed the whole room and shimmered on the white pages of the book)
    const E = NIGHT, fl = 1 + 0.02 * Math.sin(t * 4.3) + 0.012 * Math.sin(t * 6.7 + 1);
    const P = (pts, c, x = '') => { const p = T.path(cam, pts); return p ? `<path d="${p}" fill="${c}" ${x}/>` : ''; };
    const OL = 'stroke="#140c08" stroke-width="1.3" stroke-linejoin="round"';
    const lampS = cam.proj(BED.lamp) || [0, 0];
    let g = '';
    // walls, floor, ceiling (the lamp's warmth is laid over them after)
    g += P([[-320, 0, 520], [320, 0, 520], [320, 290, 520], [-320, 290, 520]], '#6a5040');
    g += P([[-320, 0, -200], [-320, 0, 520], [-320, 290, 520], [-320, 290, -200]], '#4e3c34');
    g += P([[320, 0, -200], [320, 0, 520], [320, 290, 520], [320, 290, -200]], '#4a3830');
    g += P([[-320, 290, -200], [320, 290, -200], [320, 290, 520], [-320, 290, 520]], '#2a1e18');
    for (const z of [40, 200, 360]) g += P([[-320, 278, z], [320, 278, z], [320, 278, z + 22], [-320, 278, z + 22]], '#3a2618', OL) + P([[-320, 278, z], [320, 278, z], [320, 290, z], [-320, 290, z]], '#4a3020', OL);
    g += P([[-320, 0, -200], [320, 0, -200], [320, 0, 520], [-320, 0, 520]], '#5a3c26');
    let pl = ''; for (let x = -300; x <= 300; x += 24) pl += T.lineD(cam, [[x, 0.2, -200], [x, 0.2, 520]]);
    if (pl) g += `<path d="${pl}" stroke="#2a1a10" stroke-width="1" opacity="0.6" fill="none"/>`;
    g += P(T.ring([0, 0.4, 260], [260, 0, 0], [0, 0, 150], 28), '#7a2e2a', 'opacity="0.85"') + P(T.ring([0, 0.6, 260], [230, 0, 0], [0, 0, 130], 28), 'none', 'stroke="#c89a50" stroke-width="2" stroke-dasharray="8 6" opacity="0.7"');
    // the window in the left wall: night blue, the moon, stars, the cross of the frame, curtains
    const W0 = [-319, 120, 150], wq = [[-319, 120, 150], [-319, 120, 330], [-319, 240, 330], [-319, 240, 150]];
    g += P(wq, '#1a2448');
    const moon = cam.proj([-319, 205, 290]); if (moon) g += `<circle cx="${f(moon[0])}" cy="${f(moon[1])}" r="${f(cam.fl / 600 * 9)}" fill="#f2ecd2"/>` + C.radial(moon[0], moon[1], cam.fl / 600 * 40, '#c8d8ff', 0.25, 'screen');
    const r = rng(5); for (let i = 0; i < 14; i++) { const s = cam.proj([-319, 130 + r() * 100, 160 + r() * 160]); if (s) g += `<circle cx="${f(s[0])}" cy="${f(s[1])}" r="${f(0.8 + r())}" fill="#fff" opacity="${f(0.4 + r() * 0.5)}"/>`; }
    const roofs = T.path(cam, [[-319, 120, 150], [-319, 150, 170], [-319, 140, 200], [-319, 162, 230], [-319, 146, 262], [-319, 158, 300], [-319, 138, 330], [-319, 120, 330]]); if (roofs) g += `<path d="${roofs}" fill="#0e1428"/>`;
    g += `<path d="${T.lineD(cam, [[-318, 120, 240], [-318, 240, 240]])} ${T.lineD(cam, [[-318, 180, 150], [-318, 180, 330]])}" stroke="#2a1a10" stroke-width="5" fill="none"/>`;
    g += P([[-318, 112, 142], [-318, 112, 338], [-318, 248, 338], [-318, 248, 142], [-318, 112, 142], [-318, 120, 150], [-318, 240, 150], [-318, 240, 330], [-318, 120, 330], [-318, 120, 150]], '#3a2416', OL);
    for (const [za, zb] of [[100, 158], [322, 380]]) g += P([[-316, 70, za], [-316, 70, zb], [-316, 262, zb], [-316, 262, za]], '#6a2a3a', OL);
    // a shelf on the back wall with a wooden horse and books; a little picture
    g += P([[110, 200, 518], [290, 200, 518], [290, 208, 510], [110, 208, 510]], '#5a3a22', OL);
    for (let i = 0; i < 5; i++) g += P([[200 + i * 14, 208, 516], [212 + i * 14, 208, 516], [212 + i * 14, 236 - (i % 2) * 6, 516], [200 + i * 14, 236 - (i % 2) * 6, 516]], ['#7a2a24', '#2a4a6a', '#5a6a2a', '#8a6a2a', '#4a2a4a'][i], OL);
    g += P([[130, 208, 516], [140, 228, 516], [165, 232, 516], [180, 246, 516], [186, 236, 516], [170, 208, 516]], '#a8743a', OL);
    g += P([[-110, 170, 519], [-40, 170, 519], [-40, 225, 519], [-110, 225, 519]], '#6a4a2a', OL) + P([[-104, 176, 518], [-46, 176, 518], [-46, 219, 518], [-104, 219, 518]], '#4a5a6a');
    // the night table and the oil lamp
    const [lx, ly, lz] = BED.lamp;
    g += P([[lx - 34, 0, lz - 30], [lx + 34, 0, lz - 30], [lx + 34, 66, lz - 30], [lx - 34, 66, lz - 30]], '#5a3a22', OL) + P([[lx - 36, 66, lz - 32], [lx + 36, 66, lz - 32], [lx + 36, 66, lz + 30], [lx - 36, 66, lz + 30]], '#7a5232', OL);
    g += P([[lx - 9, 66, lz], [lx + 9, 66, lz], [lx + 6, 88, lz], [lx - 6, 88, lz]], '#c8a050', OL) + P([[lx - 4, 88, lz], [lx + 4, 88, lz], [lx + 4, 94, lz], [lx - 4, 94, lz]], '#e8e0d0');
    const fp = cam.proj([lx, 94, lz]), k = cam.fl / Math.max(50, cam.toC([lx, 94, lz])[2]);
    if (fp) g += `<path d="M${f(fp[0])},${f(fp[1])} Q${f(fp[0] - 4 * k * fl)},${f(fp[1] - 6 * k)} ${f(fp[0])},${f(fp[1] - 14 * k * fl)} Q${f(fp[0] + 4 * k * fl)},${f(fp[1] - 6 * k)} ${f(fp[0])},${f(fp[1])}Z" fill="#ffd27a"/>`;
    // the bed: headboard, the frame, the child and the father behind the quilt, the quilt over their laps
    const { x0, x1, z0, z1, top } = BED;
    g += P([[x0 - 10, 0, z1], [x1 + 10, 0, z1], [x1 + 10, 120, z1], [(x0 + x1) / 2, 150, z1], [x0 - 10, 120, z1]], '#7a4e2c', OL);
    g += P([[x0, 0, z0], [x0, 0, z1], [x0, top - 6, z1], [x0, top - 6, z0]], '#5a3a20', OL) + P([[x1, 0, z0], [x1, 0, z1], [x1, top - 6, z1], [x1, top - 6, z0]], '#5a3a20', OL);
    // her pillow, plumped up behind her, and his rumpled at the far side
    g += P(T.ring([-42, top + 34, z1 - 22], [52, 0, 0], [0, 26, 0], 20), '#e8e0d0', OL) + P(T.ring([-42, top + 28, z1 - 24], [40, 0, 0], [0, 12, 0], 16), '#c8bcac', 'opacity="0.5"') + P(T.ring([34, top + 22, z1 - 30], [40, 0, 0], [0, 16, 0], 16), '#dcd2c4', OL);
    g += actors.back || '';
    // the patchwork quilt: squares on the top, falling over the foot of the bed toward us
    // a worn patchwork quilt in faded colours, little squares stitched in pale thread, folds across it
    const cols = ['#a83e36', '#d8b048', '#3e66a0', '#4a845a', '#e6dccc', '#9a5a86'].map(c => G.RIG.mix(c, '#6a5a58', 0.32));
    // (the quilt comes right up to their waists, ending in the sheet turned down over it: the two of them are drawn sitting
    // up behind it, and the line where the figures end lies under it)
    const zq = BED.zq;
    for (let i = 0; i < 8; i++) for (let j = 0; j < 6; j++) { const xa = x0 + (x1 - x0) * i / 8, xb = x0 + (x1 - x0) * (i + 1) / 8, za = z0 + (zq - z0) * j / 6, zb = z0 + (zq - z0) * (j + 1) / 6, ya = top + 2 + Math.sin(i * 1.3 + j) * 2.5; g += P([[xa, ya, za], [xb, ya, za], [xb, ya, zb], [xa, ya, zb]], cols[(i + j * 3) % 6], 'stroke="#e8dccc" stroke-width="0.9" stroke-dasharray="3 3" stroke-opacity="0.8"'); }
    for (const zf of [z0 + 40, z0 + 82]) g += `<path d="${T.lineD(cam, [[x0, top + 4, zf], [x1, top + 4, zf + 10]])}" stroke="#1a0e0a" stroke-width="5" opacity="0.18" fill="none" filter="url(#b2)"/>`;
    // the sheet turned down over the quilt's top edge: a soft roll across the bed (its front face, then its top), with a
    // shadow under it and a few creases
    // (a low roll lying on the quilt, mostly seen from above, in the lamp's warm half-light: not a white board)
    g += P([[x0 - 4, top + 2, zq - 14], [x1 + 4, top + 2, zq - 14], [x1 + 4, top + 7, zq - 13], [x0 - 4, top + 7, zq - 13]], '#a89c8a', OL);
    g += P([[x0 - 4, top + 7, zq - 13], [x1 + 4, top + 7, zq - 13], [x1 + 4, top + 9, zq + 2], [x0 - 4, top + 9, zq + 2]], '#c4b8a4', OL);
    g += `<path d="${T.lineD(cam, [[x0, top + 3, zq - 16], [x1, top + 3, zq - 16]])}" stroke="#1a0e0a" stroke-width="6" opacity="0.22" fill="none" filter="url(#b2)"/>`;
    for (const cx of [x0 + 40, -20, x1 - 30]) g += `<path d="${T.lineD(cam, [[cx, top + 9, zq - 4], [cx + 6, top + 7, zq - 13]])}" stroke="#8a7c6a" stroke-width="1.4" opacity="0.7" fill="none"/>`;
    g += P([[x0, top + 2, z0], [x1, top + 2, z0], [x1, 8, z0 - 6], [x0, 8, z0 - 6]], G.RIG.mix('#8a3a32', '#5a4a48', 0.3), OL);
    for (let i = 1; i < 8; i++) { const x = x0 + (x1 - x0) * i / 8; g += `<path d="${T.lineD(cam, [[x, top + 2, z0], [x, 8, z0 - 6]])}" stroke="#f4ece0" stroke-width="1.2" stroke-dasharray="4 3" fill="none"/>`; }
    g += actors.front || '';
    // light: the lamp's warm pool, the cool night beyond it
    // the lamplight falls off toward us: the near end of the bed sinks into the dark
    { const id = G.RIG.uid('bf'); g += `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0.55" stop-color="#0a0608" stop-opacity="0"/><stop offset="1" stop-color="#0a0608" stop-opacity="0.72"/></linearGradient></defs><rect x="-50" y="-50" width="1180" height="2020" fill="url(#${id})"/>`; }
    g += `<rect x="-50" y="-50" width="1180" height="2020" fill="#0a1024" opacity="0.3"/>` + C.radial(lampS[0], lampS[1] - 20, cam.fl * 0.9, '#ffb860', 0.32 * fl, 'screen') + C.radial(lampS[0], lampS[1] - 10, cam.fl * 0.22, '#ffd8a0', 0.4 * fl, 'screen');
    if (moon) g += C.radial(moon[0], moon[1] + 200, cam.fl * 0.7, '#7a90d0', 0.12, 'screen');
    return g;
  };

  // the open window of your house: its corners in the world, for drawing the room and you in it
  H3.homeWindow = Hg => { const w = Hg.wins.find(q => q.k === HOME.k && q.i === HOME.i), X = w.X; return { X, u: w.u, y0: w.wy, y1: w.wy + w.wh, u0: w.u - w.ww / 2, u1: w.u + w.ww / 2, quad: [[X, w.wy, w.u - w.ww / 2], [X, w.wy, w.u + w.ww / 2], [X, w.wy + w.wh, w.u + w.ww / 2], [X, w.wy + w.wh, w.u - w.ww / 2]] }; };
})(window);
