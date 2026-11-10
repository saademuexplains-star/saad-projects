// "The Radium Girls", part 2: the lights off, the dress and the dance, the mirror, the dentist.
// GLOW   (14.62 .. 16.82) "So you paint your nails with it, your teeth,"  the lights off: your hand rises into the frame,
//                         every nail glowing; your friends across the table break into grins of glowing teeth
// DANCE  (16.78 .. 19.86) "you wear your best dress to work so it'll glow at the dance."  you in your best dress in
//                         the studio by day; the light goes down round you to the dance hall and the dress glows
// MIRROR (19.8 .. 21.74)  "Then a tooth falls out, then another."  your smile in the mirror over the washbowl; a tooth
//                         drops into the bowl, then another
// DENTIST (21.7 .. 23.2)  "The dentist touches your jaw,"  his face under the lamp; your face; his mouth mirror at your jaw
// PALM   (23.06 .. 24.9)  "and it comes away in his hand."  the piece of your jaw in his forceps under the lamp
// Hands: your hand in GLOW comes in from the frame's edge with no arm joint in frame (the dentist's mouth mirror and
// forceps come in the same way, with no hand); at the
// dance your hands are clasped behind your back; every other arm hangs with its hand below the frame or the bowl.
(function (G) {
  const X = G.ENG, Q = G.QCAST, S = G.SETS, C = G.CINE, R = G.RIG, ST = G.STAGE, V = G.RGV;
  const { ss, lerp } = X, { f, mix } = R, { up, nrm } = ST;
  const { cl, env, bump, idle, hh, scr, camOn, L2, rest } = V;
  const GL = S.GLOW;
  const rot = (v, deg) => { const a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a); return [v[0] * c - v[1] * s, v[0] * s + v[1] * c]; };
  // a hand coming into the frame from its edge: the hand (rig hand at size L) at wrist W pointing along dir, its sleeve
  // running back from the wrist past the frame's edge (cuff col), lit with light L in one pass
  V.edgeHand = (W, dir, o) => {
    const L = o.size, hand = R.handV2({ x: W[0], y: W[1], dir, side: o.side || 'R', facing: o.facing || 'back', pose: o.pose || 'relaxed', size: L, skin: o.skin, nails: o.nails });
    const n = [-dir[1], dir[0]], ww = 0.16 * L * 1.3, E = [W[0] - dir[0] * 900, W[1] - dir[1] * 900], C0 = [W[0] - dir[0] * 30, W[1] - dir[1] * 30];
    const P2 = (p, k) => `${f(p[0] + n[0] * k)},${f(p[1] + n[1] * k)}`;
    const sleeve = `<path d="M${P2(W, ww)} L${P2(E, ww * 1.5)} L${P2(E, -ww * 1.5)} L${P2(W, -ww)}Z" fill="${o.sleeve}" ${R.ol(1.4)}/>` +
      `<path d="M${P2(C0, ww * 1.06)} L${P2(C0, -ww * 1.06)}" stroke="${R.shade(o.sleeve, -0.3)}" stroke-width="3"/>`;
    const svg = sleeve + hand, P = { svg, info: { cx: W[0], cy: W[1], R: 2 * L, top: W[1] - 2.5 * L, feet: W[1] + 2 * L, s: L / 104 } };
    return { lit: ST.litWith(P, o.light, svg), hand, svg };
  };

  // ======================================================= GLOW: the lights off
  const TOPG = 1400;
  X.shot('GLOW', 14.62, 16.82, t => {
    const c = hh(V.glCam(t), t, 0.5, 11);
    const grin = ss(15.98, 16.22, t), gig = ss(16.15, 16.35, t);
    let people = '', emis = '';
    for (const [who, art, x, fx, look, tilt, seed] of [['friendA', 'friendAArt', 280, 0.6, [0.5, 0.25], 7, 61], ['friendB', 'friendBArt', 800, -0.6, [-0.45, 0.3], -6, 62]]) {
      const id = idle(t, seed, 0.6), bob = gig * Math.sin(t * 19 + seed);
      const o = { x, y: TOPG + 913, s: 1.1, tilt: tilt + 3 * bob, sway: id.sway * 0.4 + 0.8 * bob, breath: id.breath + gig * 0.8 * Math.abs(bob), blink: t > 15.8 ? 0 : id.blink };
      const face = V.faceMix({ expr: 'neutral', mouth: 'smile', teeth: GL, look: [look[0] * 0.6, 0.65], lid: 0.34, brows: [3, 2] }, { expr: 'neutral', mouth: 'grin', teeth: GL, look, lid: 0.3 + 0.2 * gig, brows: [6, 3] }, grin);
      const P = up(Q[who](Object.assign(o, { noLegs: true, face, armR: rest('woman', 'R'), armL: rest('woman', 'L') })), o);
      people += Q.litHair(P, o, Q[art](), V.LG(fx));
      emis += S.emissive(P.svg);
    }
    // your right hand comes up into the frame (the forearm leaving it at the lower right), fingers spread, every nail
    // painted; on "nails" it turns a little in the light
    const rise = ss(14.64, 15.14, t), wig = bump(t, 15.18, 1, 0.6);
    const W = L2([980, 2270], [850, 1770], rise), dir = rot(nrm([-0.36, -0.93]), -4 * (1 - rise) + 4 * wig * Math.sin((t - 15.18) * 10));
    const H = V.edgeHand(W, dir, { size: 104 * 2.6, skin: '#f2cfb6', nails: GL, pose: 'open', sleeve: '#efe9de',
      light: { from: [-0.7, -0.9], shadow: '#000000', shadowOp: 0.8, ambient: '#4a6444', ambientOp: 1, floor: '#000', floorOp: 0, contactOp: 0, key: GL, keyAdd: 0.2, rims: [{ from: [-0.7, -0.9], col: GL, w: 7, op: 0.85 }] } });
    const layers = S.studioBack(t, { dark: 1 });
    const night = `<defs><linearGradient id="glTop" x1="0" y1="-600" x2="0" y2="900" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#000" stop-opacity="0.85"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient></defs><rect x="-900" y="-600" width="2900" height="1500" fill="url(#glTop)"/>`;
    layers.push({ p: 1, svg: people + emis + S.studioTable(t, { dark: 1, top: TOPG, near: 1640, tray: [770, 1500], pot: [540, 1520], potS: 1.5, done: 8 }) + S.radGlow(540, 1440, 460, 0.3) + night }, { p: 1.02, svg: S.studioLight(t, { dark: 1 }) });
    layers.push({ p: 1.15, svg: H.lit + S.emissive(H.hand) + (wig > 0.02 ? `<g opacity="${f(wig)}">${S.emissive(H.hand)}</g>` : '') });
    return S.EMIS + X.compose(layers, c) + C.vignette(0.6, '#000000', 0.5);
  }, { grade: 'gNight' });
  V.glCam = V.cam([[14.6, [580, 1540, 1.22, 0]], [15.2, [600, 1470, 1.16, 0]], [15.75, [560, 1300, 1.08, 0]], [16.25, [540, 1040, 1.24, 0]], [16.85, [540, 1000, 1.36, 0]]]);
  V.glGrin = t => scr([280, 2313 - 1268 * 1.1 + 85], V.glCam(t));
  X.tr('eyelid', 14.66, 0.32, 'BOSS', 'GLOW');

  // ======================================================= DANCE: your best dress by day; the light goes down round you
  // to the dance hall, and the dress glows. (Your hands are clasped behind your back.)
  const DN = { X: 540, Y: 2060, S: 0.98 };
  const behind = side => ({ hand: [side === 'R' ? -38 : 38, -770], dir: [side === 'R' ? 0.45 : -0.45, 1], pose: 'relaxed', facing: 'back', behind: true });
  V.dnYou = t => {
    const id = idle(t, 71, 0.5), night = ss(18.05, 18.6, t), sw = Math.sin((t - 16.8) * 2.6) * (0.4 + 0.6 * night);
    return { x: DN.X + 16 * sw, y: DN.Y - 6 * Math.abs(sw) * night, s: DN.S, tilt: 3 + 4 * sw, sway: 2.2 * sw + id.sway * 0.4, breath: id.breath, blink: id.blink };
  };
  X.shot('DANCE', 16.78, 19.86, t => {
    const c = hh(V.dnCam(t), t, 0.6, 12);
    const night = ss(18.05, 18.6, t), o = V.dnYou(t);
    const face = V.faceAt(t, [
      [16.8, { expr: 'neutral', mouth: 'smile', look: [-0.25, 0.05], lid: 0.16, brows: [3, 3] }],
      [17.6, { expr: 'neutral', mouth: 'smile', look: [0.02, 0.0], lid: 0.12, brows: [4, 3] }],
      [18.7, { expr: 'neutral', mouth: 'grin', teeth: GL, look: [0.3, -0.15], lid: 0.2, brows: [5, 3] }]], 0.4);
    const arms = { armR: behind('R'), armL: behind('L') };
    const YP = up(Q.youDress(Object.assign({}, o, { face }, arms)), o);
    const layers = [];
    // by day: the studio, the friends at their table looking round at you
    if (night < 1) {
      const day = S.studioBack(t).map(L => ({ p: L.p, svg: `<g opacity="${f(1 - night)}">${L.svg}</g>` }));
      let fr = '';
      for (const [who, art, x, look, seed] of [['friendA', 'friendAArt', 150, [0.6, 0.1], 73], ['friendB', 'friendBArt', 930, [-0.6, 0.1], 74]]) {
        const id = idle(t, seed, 0.6), o2 = { x, y: 1790, s: 0.62, tilt: x < 540 ? 4 : -4, sway: id.sway * 0.4, breath: id.breath, blink: id.blink };
        const P2 = up(Q[who](Object.assign(o2, { noLegs: true, face: { expr: 'neutral', mouth: 'smile', look, lid: 0.2, brows: [5, 3] }, armR: rest('woman', 'R'), armL: rest('woman', 'L') })), o2);
        fr += Q.litHair(P2, o2, Q[art](), V.LS);
      }
      fr += S.studioTable(t, { top: 1300, near: 1380, tray: [540, 1340], trayS: 0.7, pot: [760, 1350], potS: 0.8, done: 8 });
      layers.push(...day, { p: 0.93, svg: `<g filter="url(#dof1)" opacity="${f(1 - night)}">${fr}</g>` });
    }
    if (night > 0) layers.push(...S.danceBack(t, { k: night }));
    let you = '';
    if (night < 1) you += `<g opacity="${f(1 - night)}">${Q.litHair(YP, o, Q.youArt(), V.LS)}</g>`;
    if (night > 0) {
      const GP = up(Q.youDressGlow(Object.assign({}, o, { face }, arms)), o);
      you += `<g opacity="${f(night)}">${Q.litHair(YP, o, Q.youArt(), V.LG(0))}</g>` + `<g opacity="${f(0.5 * night)}">${S.emissive(GP.svg)}</g>` + `<g opacity="${f(night)}">${S.emissive(YP.svg)}</g>` + S.radGlow(o.x, o.y - 500, 520, 0.22 * night);
    }
    layers.push({ p: 1, svg: you }, { p: 1.02, svg: night < 1 ? `<g opacity="${f(1 - night)}">${S.studioLight(t)}</g>` : '' });
    return S.EMIS + X.compose(layers, c) + C.vignette(0.5 + 0.1 * night, '#000000', 0.45);
  }, { grade: 'gHall' });
  V.dnCam = V.cam([[16.75, [540, 1280, 1.0, 0]], [17.6, [540, 1240, 1.1, 0]], [18.4, [540, 1180, 1.22, -0.6]], [19.2, [548, 1100, 1.45, 0.6]], [19.9, [552, 1060, 1.62, 0.9]]]);
  V.dnFace = t => scr(V.facePt(V.dnYou(t), 'woman', [0, 30]), V.dnCam(t));
  X.tr('radial', 16.8, 0.42, 'GLOW', 'DANCE', { fa: V.glGrin(16.8), fb: V.dnFace(16.8), za: 1.15, zb: 1.1, soft: 0.5, ring: '#d8ffb0', ringOp: 0.4 });

  // ======================================================= MIRROR: your smile in the mirror over the washbowl; a tooth
  // drops into the bowl, then another (your hands below the bowl's rim)
  const MR = { X: 540, Y: 2440, S: 1.12 };
  const T1 = 20.06, T2 = 21.12, FALL = 0.42;
  V.mrYou = t => { const id = idle(t, 81, 0.5), jolt = bump(t, T1 + 0.05, 1, 0.3) + bump(t, T2 + 0.05, 1, 0.3); return { x: MR.X, y: MR.Y + 4 * jolt, s: MR.S, tilt: 2 - 3 * jolt, sway: id.sway * 0.4, breath: id.breath + 0.6 * jolt, blink: t > 20.0 ? 0 : id.blink }; };
  X.shot('MIRROR', 19.8, 21.74, t => {
    const c = hh(V.mrCam(t), t, 0.5, 13);
    const o = V.mrYou(t);
    const F = V.faceAt(t, [
      [19.8, { expr: 'neutral', mouth: 'grin', look: [0, 0.02], lid: 0.18, brows: [4, 3] }],
      [20.45, { expr: 'anxious', mouth: 'grin', look: [0, 0.3], lid: 0.08, brows: [-6, 5] }],
      [20.75, { expr: 'fear', mouth: 'o', open: 0.32, look: [0, 0.5], lid: 0.02, brows: [-12, 8] }],
      [21.4, { expr: 'fear', mouth: 'o', open: 0.4, look: [0.1, 0.6], lid: 0.0, brows: [-16, 10], sweat: 0.2 }]], 0.25);
    const P = up(Q.you(Object.assign({}, o, { noLegs: true, face: F, armR: rest('woman', 'R'), armL: rest('woman', 'L') })), o);
    // the gap where the first tooth was, while you still smile
    const gap = t > T1 + 0.04 && (F.mouth === 'grin') ? Q.headArt(P, o, `<rect x="5" y="73" width="12" height="7.5" fill="#1e0806"/>`) : '';
    const m = V.facePt(o, 'woman', [10, 78]);
    const falling = [{ from: m, to: 500, k: (t - T1) / FALL, rot: 140 }, { from: V.facePt(o, 'woman', [-8, 82]), to: 590, k: (t - T2) / FALL, rot: -120 }];
    const n = (t >= T1 + FALL ? 1 : 0) + (t >= T2 + FALL ? 1 : 0);
    const layers = S.washBack(t);
    layers.push({ p: 1, svg: Q.litHair(P, o, Q.youArt(), V.LMR) + gap + S.washBowl(t, { n, falling }) });
    return S.EMIS + X.compose(layers, c) + C.vignette(0.5, '#060302', 0.42);
  }, { grade: 'gHall' });
  // the morning from the window behind you (a rim), the soft fill from the mirror's side
  V.LMR = { from: [0.9, -0.5], shadow: '#3a2a20', shadowOp: 0.42, floor: '#3a2a1a', floorOp: 0.2, contactOp: 0, key: '#fff4e0', keyAdd: 0.06,
    rims: [{ from: [0.9, -0.4], col: '#fff4dc', w: 6, op: 0.55 }], face: { col: '#fff0e0', op: 0.14 } };
  V.mrCam = V.cam([[19.75, [540, 1200, 1.42, 0]], [20.3, [540, 1240, 1.42, 0]], [20.8, [540, 1300, 1.36, 0]], [21.3, [540, 1180, 1.62, 0]], [21.75, [540, 1120, 1.85, 0]]]);
  V.mrFace = t => scr(V.facePt(V.mrYou(t), 'woman', [0, 30]), V.mrCam(t));
  X.tr('morph', 19.83, 0.46, 'DANCE', 'MIRROR', { fa: V.dnFace(19.83), fb: V.mrFace(19.83), za: 1.15, zb: 1.15, align: true, fade: [0.44, 0.56], blur: 4, bpow: 6, col: '#fff0d8' });

  // ======================================================= DENTIST: his face under the lamp; your face; his fingers come
  // to your jaw from the edge of the frame (the camera too close on you for his arm to show)
  const YD = { X: 340, Y: 2330, S: 1.0 }, DD = { X: 800, Y: 2380, S: 1.1 };
  const LD = { from: [0.6, -0.9], shadow: '#3a2e26', shadowOp: 0.45, floor: '#3a2a1a', floorOp: 0.25, contactOp: 0, key: '#fff8e8', keyAdd: 0.1,
    rims: [{ from: [0.6, -0.8], col: '#fff4dc', w: 5, op: 0.45 }], face: { col: '#fff6e8', op: 0.16 } };
  V.LD = LD;
  V.ydO = t => { const id = idle(t, 91, 0.4), fl = bump(t, 22.62, 1, 0.4); return { x: YD.X - 4 * fl, y: YD.Y, s: YD.S, tilt: -6 - 4 * fl, sway: -2 + id.sway * 0.3, breath: id.breath + 0.6 * fl, blink: t > 22.2 ? 0 : id.blink }; };
  X.shot('DENTIST', 21.7, 23.2, t => {
    const c = hh(V.dtCam(t), t, 0.45, 14);
    const yo = V.ydO(t), id = idle(t, 92, 0.4);
    const YP = up(Q.you(Object.assign({}, yo, { noLegs: true, face: V.faceAt(t, [[21.7, { expr: 'anxious', look: [0.7, -0.3], lid: 0.12, brows: [-8, 6], mouth: 'parted', open: 0.12 }], [22.6, { expr: 'fear', look: [0.4, 0.2], lid: 0.0, brows: [-14, 9], mouth: 'parted', open: 0.2 }]], 0.25), armR: rest('woman', 'R'), armL: rest('woman', 'L') })), yo);
    const dz = { x: DD.X, y: DD.Y, s: DD.S, tilt: -9, sway: -2 + id.sway * 0.3, breath: id.breath, blink: id.blink };
    const DP = up(Q.dentist(Object.assign(dz, { noLegs: true, face: { expr: 'grim', look: [-0.85, 0.25], lid: 0.38, brows: [6, -2], mouth: 'tight', age: true }, armR: rest('man', 'R'), armL: rest('man', 'L') })), dz);
    const layers = S.dentBack(t);
    let g = S.headrest(YD.X, YD.Y - 1268 - 30, 1.05) + Q.litHair(YP, yo, Q.youArt(), LD) + Q.litHair(DP, dz, Q.dentistArt(), LD) + S.dentLamp(560, 620, 1.1, 1);
    // his mouth mirror comes in from the frame's right edge and presses your jaw (no hand in frame)
    const touch = ss(22.22, 22.6, t), press = bump(t, 22.6, 1, 0.5), jaw = V.facePt(yo, 'woman', [50, 96]);
    if (touch > 0) { const B = L2([jaw[0] + 300, jaw[1] + 120], [jaw[0] + 6 - 4 * press, jaw[1] + 2 + 3 * press], touch), A = [B[0] + 640, B[1] + 260]; g += S.dentalMirror(A, B, 1.25); }
    layers.push({ p: 1, svg: g });
    return S.EMIS + X.compose(layers, c) + C.vignette(0.5, '#060302', 0.42);
  }, { grade: 'gHall' });
  V.dtCam = V.cam([[21.65, [780, 900, 2.0, 0]], [22.05, [720, 930, 1.9, 0]], [22.4, [420, 1050, 2.3, 0]], [23.2, [380, 1080, 2.75, 0]]]);
  X.tr('whip', 21.73, 0.16, 'MIRROR', 'DENTIST', { dir: [1, 0] });

  // ======================================================= PALM: his open hand, the piece of your jaw in it (the forearm
  // leaves the frame at the bottom; you blurred behind)
  X.shot('PALM', 23.06, 24.9, t => {
    const c = hh(V.pmCam(t), t, 0.4, 15);
    const yb = Object.assign({}, V.ydO(t), { x: 470, y: 2290, s: 0.9 });
    const YP = up(Q.you(Object.assign({}, yb, { noLegs: true, face: { expr: 'fear', look: [0.5, 0.4], lid: 0.0, brows: [-16, 10], mouth: 'o', open: 0.3 }, armR: behind('R'), armL: behind('L') })), yb);
    const layers = S.dentBack(t);
    layers.push({ p: 0.9, svg: `<g filter="url(#dof2)">${S.headrest(470, 2290 - 1141 - 26, 0.95)}${Q.litHair(YP, yb, Q.youArt(), LD)}</g>` });
    // his forceps come up from the frame's lower right holding the piece of your jaw under the lamp (no hand in frame:
    // an open palm this close read as a flat cut-out)
    const come = ss(23.08, 23.55, t), B = L2([1180, 1700], [760, 1380], come), A = [B[0] + 560, B[1] + 520], sway = 4 * Math.sin((t - 23) * 2.2);
    const jp = S.jawPiece(B[0] - 64, B[1] + 6, 1.15, -18 + sway, 0.5);
    layers.push({ p: 1, svg: jp + S.forceps(A, [B[0] - 4, B[1] - 2], 1.15, 0.1) + S.dentLamp(1000, 420, 1.0, 1) });
    return S.EMIS + X.compose(layers, c) + C.vignette(0.5, '#060302', 0.45);
  }, { grade: 'gHall' });
  V.pmCam = V.cam([[23.0, [660, 1300, 1.6, 0]], [23.6, [690, 1360, 1.9, 0]], [24.3, [700, 1385, 2.3, 0]], [24.9, [702, 1390, 2.5, 0]]]);
  X.tr('push', 23.12, 0.32, 'DENTIST', 'PALM', { fa: scr(V.facePt(V.ydO(23.12), 'woman', [50, 96]), V.dtCam(23.12)), fb: [540, 1060], za: 1.8, zb: 0.7, fade: [0.45, 0.55], blur: 6 });
})(window);
