// "The Pied Piper" (third cut), shots 8-11 and the transitions.
// THREE (31.0 .. 39.1): back down in the meadow under the walls, the three who were left: the lame boy on his crutch,
// reaching after them; the deaf girl, who heard nothing, looking about her; the blind boy turning his face to the hill.
// BED (38.3 .. 42.5): centuries later the same hill is a picture in a children's book, read at bedtime by lamplight.
// REAL (41.7 .. 45.3): your son in the morning sun, smiling, then looking straight at us.
// REVEAL (44.6 .. 49.65): the stranger lowers his pipe and smiles; he steps back into the light of the gate as the camera
// rises over the roofs into the dawn (and the film begins again).
(function (G) {
  const X = G.ENG, T = G.ST3, H3 = G.H3, TR = G.TR3, Q = G.QCAST, C = G.CINE, R = G.RIG, PR = G.PROPS, SH = G.SH;
  const { ss, clamp, lerp } = X, { f } = R, LT = SH.LT;
  const gh = (x, z) => TR.h(x, z);

  // ======================================================= 8. THREE
  // the camera comes down off the slope and settles on each child in turn, easing into every hold; between them it
  // swings round in a short arc (turning more than travelling), rising a little so the grass stays well below the lens
  const threeCam = SH.CAM3([
    [30.7, [-100, 470, -2350, 1, -8, 1100]],
    [31.0, [-110, 440, -2280, 1, -7.6, 1100]],
    [32.2, [-290, 290, -1640, 0.4, -5.5, 1180]],
    [33.25, [-262, 142, -1060, 0, -3, 1300], 'stop'],
    [33.9, [-258, 143, -1052, 1, -3, 1320]],
    [34.55, [-120, 175, -1240, 22, -3.6, 1300]],
    [35.2, [40, 145, -1335, 40, -3, 1320], 'stop'],
    [35.95, [44, 146, -1330, 38, -3, 1330]],
    [36.6, [-30, 178, -1560, 18, -3.6, 1300]],
    [37.25, [-90, 142, -1740, -4, -3, 1330], 'stop'],
    [38.6, [-92, 145, -1700, -4, -2.4, 1550]],
    [39.2, [-92, 146, -1686, -4, -2.2, 1630]]
  ], 0.6, 8);
  // the ground the lens passes over (no tufts are grown within reach of it: nothing ever whips past just under the camera)
  const threePath = []; for (let t = 30.6; t <= 39.3; t += 0.04) { const c = threeCam(t); threePath.push([c.x, c.z]); }
  const nearPath = (x, z) => threePath.some(([px, pz]) => (x - px) ** 2 + (z - pz) ** 2 < 165 * 165);
  const LAME = [-260, -760], DEAF = [240, -1080], BLIND = [-120, -1450];
  SH.blindFace = (cam, t) => { const y = gh(BLIND[0], BLIND[1]), p = cam.proj([BLIND[0], y + 104, BLIND[1]]); return p; };
  X.shot('THREE', 31.0, 39.1, t => {
    SH.still();
    const cam = threeCam(t), A = [];
    // the lame boy: leaning on his crutch, his free hand reaching after them, crying
    {
      const [x, z] = LAME, st = SH.at(cam, x, z, 114, 'kid', gh(x, z));
      if (st) {
        const reach = ss(32.9, 33.6, t), step = ss(33.3, 33.7, t) * (1 - ss(33.9, 34.3, t)), idle = SH.idle(t, 11);
        const o = { x: st.x, y: st.y, s: st.s, sway: -3 + idle.sway - 2 * step, tilt: 4 + 3 * reach, blink: idle.blink, breath: Q.breath(t * 2.2) * 1.4,
          steps: { R: [0, 0, 1], L: [0, -60 * step, 1.02] },
          armR: { hand: [-150, -470], dir: [0, 1], pose: 'grip', facing: 'back' },
          armL: { hand: [lerp(150, 290, reach), lerp(-340, -720, reach)], dir: [lerp(0, 0.7, reach), lerp(1, -0.7, reach)], pose: reach > 0.5 ? 'open' : 'relaxed', facing: 'palm' },
          face: { expr: 'grief', brows: [-10, 3], lid: 0.32, mouth: 'cry', open: 0.25 + 0.1 * Math.sin(t * 5), tears: 0.9, look: [0.05, -0.1] } };
        // the crutch under his right arm, its foot planted out to his side (he stands, so it stays put as he sways)
        const cr = SH.crutch(o, st, Q.HAND.lame); o.armR = cr.arm;
        const P = Q.lame(o);
        A.push(SH.actor(st, () => cr.svg + SH.draw(P, o, null, LT.out, '', { cast: [-0.1, -0.35], castOp: 0.24 })));
      }
    }
    // the deaf girl: turning to look one way and the other, a hand at her ear
    {
      const [x, z] = DEAF, st = SH.at(cam, x, z, 118, 'kid', gh(x, z));
      if (st) {
        const turn = Math.sin((t - 33.8) * 1.6), ear = ss(34.6, 35.0, t), idle = SH.idle(t, 13);
        const o = { x: st.x, y: st.y, s: st.s, sway: idle.sway + 1.5 * turn, tilt: 5 * turn, blink: idle.blink, breath: idle.breath,
          armR: { hand: [lerp(-150, -96, ear), lerp(-340, -742, ear)], dir: [lerp(0, 0.3, ear), lerp(1, -1, ear)], pose: 'relaxed', facing: 'palm' },
          armL: { hand: [150, -340], dir: [0, 1], pose: 'relaxed' },
          face: { expr: 'anxious', brows: [-7, 1], lid: 0.06, mouth: 'parted', open: 0.12, look: [0.85 * turn, -0.05] } };
        const P = Q.deaf(o);
        A.push(SH.actor(st, () => SH.draw(P, o, Q.deafArt, LT.out, '', { cast: [-0.1, -0.35], castOp: 0.24 })));
      }
    }
    // the blind boy: his stick out before him, his face lifted toward where the music went
    {
      const [x, z] = BLIND, st = SH.at(cam, x, z, 120, 'kid', gh(x, z));
      if (st) {
        const lift = ss(36.6, 37.6, t), idle = SH.idle(t, 17);
        const o = { x: st.x, y: st.y, s: st.s, sway: idle.sway, tilt: -6 * lift + 3 * Math.sin(t * 0.8), blink: 0, breath: idle.breath,
          armR: { hand: [-160, -420], dir: [0.2, 1], pose: 'grip', facing: 'back', detachHand: true },
          armL: { hand: [lerp(150, 230, lift), lerp(-340, -560, lift)], dir: [0.5, -0.3], pose: 'open', facing: 'palm' },
          face: { lid: 0.36, look: [0.15 * Math.sin(t * 0.7), lerp(0, -0.7, lift)], brows: [-4 * lift, 0], mouth: 'closed' } };
        const P = Q.blind(o), hw = R.toWorld(o, [-160, -420]);
        const stick = `<g transform="translate(${f(hw[0])},${f(hw[1])}) rotate(${f(-14)})">${PR.stick(st.s * 1.05)}</g>`;
        A.push(SH.actor(st, () => SH.draw(P, o, null, LT.out, stick, { cast: [-0.1, -0.35], castOp: 0.24 })));
      }
    }
    const extra = TR.tufts(cam, H3.OUT, cam.x, cam.z + 500, 900, t, { dens: 0.5, avoid: nearPath });
    return H3.outside(cam, t, A, { extra, sunX: -0.4 });
  }, { grade: 'gDay' });

  // ======================================================= 9. BED
  const bedCam = SH.CAM3([
    [38.3, [2, 114, 322, 0, -2, 1190]],
    [39.9, [-2, 120, 300, 0, -1, 1250]],
    [41.0, [-4, 122, 290, 0, -1, 1150]],
    [41.85, [-2, 120, 300, 0, -1, 1250]],
    [42.5, [0, 116, 330, 0, -2, 1450]]
  ], 0.35, 9);
  // the book rests on his lap, on the quilt's turned-down edge, centred in front of him and facing us (the spine's foot,
  // world; 40 cm across, no wider than his reach: at 44 cm off to his side his arm stopped short of the far corner and
  // the hand hung in the middle of the page, poking out of it)
  const BOOK = [20, 75, 450], BOOKW = 40;
  SH.bookPage = (cam, which = 0) => { const p = cam.proj([BOOK[0] - BOOKW / 4 + which * BOOKW / 2, BOOK[1] + 13, BOOK[2]]); return p; };
  // Both sit up in bed under the quilt (it comes up to their waists, hamelin3d BED.zq): the figures are drawn from the
  // hips up, set low enough that where they end is always under the quilt; before, they stood on the floor cut off at
  // the hips, floating in front of the bed. The book and his fists on its outer edges are drawn in front of the quilt,
  // lit with him (with the book inside the light's box); his arms come down outside it, in full view.
  X.shot('BED', 38.3, 42.5, t => {
    SH.still();
    const cam = bedCam(t), D = cam.toC(BOOK)[2], sc = cam.fl / D;
    let back = '', front = '';
    // the child sitting up against the pillows, the quilt over her lap
    {
      const st = SH.at(cam, -40, 470, 118, 'kid', 5);
      if (st) {
        const yawn = ss(41.25, 41.5, t) * (1 - ss(41.7, 41.95, t)), idle = SH.idle(t, 21);
        const o = { x: st.x, y: st.y, s: st.s, noLegs: true, sway: idle.sway + 2, tilt: 9 + 3 * Math.sin(t * 0.5), blink: idle.blink, breath: idle.breath,
          armR: { hand: [-110, -330], dir: [0.3, 1], pose: 'relaxed' }, armL: { hand: [120, -340], dir: [-0.3, 1], pose: 'relaxed' },
          face: { mouth: yawn > 0.2 ? 'parted' : 'smile', open: 0.45 * yawn, cd: -2, lid: lerp(0.5, 0.75, yawn), look: [0.6, 0.35] } };
        const P = Q.child(o);
        back += SH.draw(P, o, null, LT.lamp, '', { noCast: 1 });
      }
    }
    // the father sitting up beside her, reading aloud, the book held open toward her (and us)
    {
      const st = SH.at(cam, 25, 482, 182, 'man', -29);
      if (st) {
        const idle = SH.idle(t, 23);
        const o = { x: st.x, y: st.y, s: st.s, noLegs: true, sway: idle.sway * 0.6, tilt: -4, blink: idle.blink, breath: idle.breath,
          face: { mouth: 'talk', open: Q.talk(t, 0.5), lid: 0.38, look: [-0.3, 0.55] } };
        // his fists close on the book's two outer edges, fingers over the margin (points fixed to the book, so the hands
        // stay on it as he sways); his elbows stand out to the sides (the IK solution away from the body), so both arms
        // stay outside the book, in full view, and nothing of them shows through it
        const edge = s => cam.proj([BOOK[0] + s * BOOKW / 2, BOOK[1] + 9, BOOK[2]]) || [st.x + s * 170, st.y - 750];
        o.armR = SH.gripK(o, Q.HAND.reader, edge(-1), [1, 0.5], { detachHand: true, elbow: 'in' });
        o.armL = SH.gripK(o, Q.HAND.reader, edge(1), [-1, 0.5], { detachHand: true, elbow: 'in' });
        const P = Q.reader(o), bp = cam.proj(BOOK), k = sc * BOOKW / 640;
        const book = bp ? PR.storybook(bp[0], bp[1], k, t) : '', ext = bp ? [bp[0] - 340 * k, bp[1] - 400 * k, bp[0] + 340 * k, bp[1] + 40 * k] : null;
        back += SH.draw(Object.assign({}, P, { handR: '', handL: '' }), o, Q.readerArt, LT.lamp, '', { noCast: 1 });
        front += SH.draw(Object.assign({}, P, { svg: '' }), o, null, LT.lamp, book, { noCast: 1, ext });
      }
    }
    return H3.bedroom(cam, t, { back, front });
  }, { grade: 'gNight' });

  // ======================================================= 10. KIDS
  // "But the children were real.": the square where they played, in the morning sun. The children stand together and look
  // straight at us, still and solemn, your son in the middle of the front row; the camera pushes in at their height, the
  // square soft behind them, until he is in the middle of the frame (and the push carries on into him: REAL).
  // (low, a little below their eyes, looking slightly up at them, so their faces sit in the upper middle of the frame)
  const kidsCam = SH.CAM3([[41.7, [40, 92, 260, 0, 2.5, 1250]], [43.85, [40, 96, 520, 0, 1.5, 1300]]], 0.35, 12);
  const KR = [
    { mk: () => Q.son, art: () => Q.sonArt, x: 40, z: 720, h: 118 },
    { mk: () => Q.kids[0], art: () => Q.kidArt[0], x: -120, z: 760, h: 122 },
    { mk: () => Q.kids[1], x: 200, z: 780, h: 126 },
    { mk: () => Q.kids[2], x: -250, z: 930, h: 124 },
    { mk: () => Q.kids[3], x: -50, z: 960, h: 117 },
    { mk: () => Q.kids[4], x: 130, z: 940, h: 120 },
    { mk: () => Q.kids[5], x: 300, z: 980, h: 116 },
    { mk: () => Q.kids[6], x: -150, z: 1150, h: 118 },
    { mk: () => Q.kids[7], x: 220, z: 1170, h: 121 }
  ];
  SH.kidsSon = cam => cam.proj([KR[0].x, 104, KR[0].z]);
  X.shot('KIDS', 41.7, 43.85, t => {
    SH.still();
    const cam = kidsCam(t), A = [];
    KR.forEach((K, i) => {
      const st = SH.at(cam, K.x, K.z, K.h, 'kid'); if (!st) return;
      const idle = SH.idle(t, i * 7 + 3);
      const o = Object.assign({ x: st.x, y: st.y, s: st.s, sway: idle.sway * 0.8, tilt: 1.5 * Math.sin(t * 0.6 + i), blink: idle.blink, breath: idle.breath,
        face: { mouth: 'closed', lid: 0.2 + 0.04 * Math.sin(t * 0.8 + i), look: [0.02 * Math.sin(t * 0.5 + i), 0.04], brows: [-2, 0] } }, SH.swingArms('kid', 0, 0));
      const P = K.mk()(o);
      A.push({ z: st.d, svg: () => SH.draw(P, o, K.art || null, LT.sun, '', { cast: [0.35, -0.3], castOp: 0.26 }) });
    });
    A.sort((a, b) => b.z - a.z);
    return SH.blur(H3.square(cam, t, []), 5) + A.map(a => a.svg()).join('');
  }, { grade: 'gDay' });

  // ======================================================= 11. REAL
  // "Your son was real.": your son alone in the morning street, smiling, then looking straight at us
  const realCam = SH.CAM3([[41.7, [40, 116, 400, -2, -1, 1700]], [45.3, [40, 115, 470, -2, -1, 1900]]], 0.4, 10);
  const SON = [40, 600];
  SH.sonFace = (cam, eye = 0) => { const p = cam.proj([SON[0] + eye * 3, 104, SON[1]]); return p; };
  X.shot('REAL', 41.7, 45.3, t => {
    SH.still();
    const cam = realCam(t);
    let g = SH.blur(H3.home(cam, t, []), 7);
    const st = SH.at(cam, SON[0], SON[1], 118, 'kid');
    if (st) {
      const stare = ss(44.2, 44.7, t), idle = SH.idle(t, 31);
      const o = { x: st.x, y: st.y, s: st.s, sway: idle.sway * (1 - stare), tilt: 3 * (1 - stare), blink: stare > 0.5 ? 0 : idle.blink, breath: idle.breath,
        face: { mouth: stare > 0.5 ? 'closed' : 'smile', cd: -2 * (1 - stare), lid: lerp(0.48, 0.12, stare), look: [0.08 * (1 - stare), 0.05 * (1 - stare)], brows: [-3 * stare, 0] } };
      const P = Q.son(o);
      g += SH.draw(P, o, Q.sonArt, LT.morn, '', { noCast: 1 });
    }
    return g;
  }, { grade: 'gDay' });

  // ======================================================= 11. REVEAL
  const revCam = SH.CAM3([
    [44.6, [40, 172, 5430, -1, 6, 1700]],
    [46.1, [40, 175, 5390, -1, 5, 1500]],
    [47.5, [30, 420, 5000, 0, 1, 1250]],
    [48.8, [10, 1000, 4100, 1, -3, 1150]],
    [49.65, [0, 1260, 3600, 2, -3.5, 1150]]
  ], 0.4, 11);
  SH.piperEye = (cam, t) => cam.proj([20 + 4, 166, 5640]);
  X.shot('REVEAL', 44.6, 49.65, t => {
    SH.still();
    const cam = revCam(t), A = [];
    const back = ss(46.1, 48.6, t), z = lerp(5640, 6360, back), x = 20;
    const st = SH.at(cam, x, z, 190, 'man');
    if (st) {
      const lower = ss(45.2, 46.0, t), w = SH.walk(z - 5640, { stride: 80, lift: 60, depth: -34, bob: 30 }), mv = ss(46.1, 46.4, t);
      const L = SH.mixL(LT.dawn, LT.backlit, ss(5800, 6250, z)), fade = 1 - ss(48.5, 49.0, t);
      const o = { x: st.x, y: st.y + w.bob * st.s * mv, s: st.s, steps: SH.mixSteps(w.steps, 1 - mv), sway: w.sway * mv + Math.sin(t * 2.2) * 0.6 * (1 - lower), tilt: 2 * Math.sin(t * 1.3) * (1 - lower), breath: Q.breath(t) * 0.6,
        face: { mouth: lower > 0.5 ? 'smirk' : 'tight', lid: lerp(0.42, 0.34, lower), brows: [3, -7], look: [0, 0.02] } };
      if (fade > 0.01) A.push(SH.actor(st, () => `<g opacity="${f(fade)}">${SH.piper(o, t, L, { cast: [0.03, 0.4], lower }).svg}</g>`));
    }
    return H3.dawn(cam, t, A, { beamOp: 0.2 + 0.25 * ss(46.5, 48.5, t) });
  }, { grade: 'gDusk' });

  SH.cam.THREE = threeCam; SH.cam.BED = bedCam; SH.cam.KIDS = kidsCam; SH.cam.REAL = realCam; SH.cam.REVEAL = revCam;
  // every shot with a camera in the world gets the shutter's smear on its fast turns
  { const rs = X.renderShot; X.renderShot = (id, t) => { const body = rs(id, t), cf = SH.cam[id]; return cf ? SH.mblur(body, cf, t) : body; }; }
  // ======================================================= transitions (each a different kind, hidden in a move)
  const sunOn = (camFn, t, env) => camFn(t).dir(env.sunDir) || [540, 700];
  const at = (camFn, t, P) => camFn(t).proj(P) || [540, 960];
  // light-coloured things passing close to the lens, for the wipes (each covers the whole frame when it is centred, so
  // the two shots never show through each other)
  // a corner of the town wall's pale stone, out of focus: the sunlit face, the shaded face round the corner, block joints
  const stoneWipe = x => {
    // (blocks and joints stay on the sunlit face, x - 690 .. x + 390: none may stick out past the corner over the next shot)
    let g = `<rect x="${f(x - 690)}" y="-260" width="1080" height="2440" fill="#cdbba4"/><rect x="${f(x + 390)}" y="-260" width="300" height="2440" fill="#988676"/>`;
    for (let r = 0; r < 17; r++) {
      const y = -200 + r * 150, o = (r % 2) * 170;
      for (let k = 0; k < 4; k++) {
        const bx = o + k * 340, w = Math.min(340, 1080 - bx), v = Math.sin(r * 12.99 + k * 78.23) * 0.5 + 0.5;
        if (w > 0 && v > 0.55) g += `<rect x="${f(x - 690 + bx)}" y="${f(y)}" width="${w}" height="150" fill="${v > 0.8 ? '#b8a48c' : '#d8c8b2'}" opacity="0.7"/>`;
        if (bx < 1080) g += `<rect x="${f(x - 690 + bx)}" y="${f(y)}" width="10" height="150" fill="#8a7866" opacity="0.65"/>`;
      }
      g += `<rect x="${f(x - 690)}" y="${f(y)}" width="1080" height="10" fill="#8a7866" opacity="0.75"/><rect x="${f(x + 390)}" y="${f(y)}" width="300" height="10" fill="#6e5e50" opacity="0.6"/>`;
    }
    return `<g filter="url(#dof4)">${g}</g>`;
  };
  // a page of the storybook turning past the lens: cream paper, lines of text and a red initial, darker toward its
  // curling leading edge, which throws a soft shadow ahead of it
  const pageWipe = x => {
    let g = `<path d="M${f(x - 700)},-260 L${f(x + 650)},-260 L${f(x + 650)},2180 L${f(x - 700)},2180 Q${f(x - 560)},960 ${f(x - 700)},-260Z" fill="#efe4cc"/>`;
    g += `<path d="M${f(x - 700)},-260 Q${f(x - 560)},960 ${f(x - 700)},2180 L${f(x - 500)},2180 Q${f(x - 380)},960 ${f(x - 500)},-260Z" fill="#c4ae8a" opacity="0.55"/>`;
    g += `<rect x="${f(x - 330)}" y="110" width="130" height="130" fill="#a83228" opacity="0.85"/>`;
    for (let i = 0; i < 24; i++) { const y = 150 + i * 72, s = i < 2 ? 160 : 0; g += `<rect x="${f(x - 330 + s)}" y="${f(y)}" width="${(i % 6 === 5 ? 430 : 840) - s}" height="16" rx="8" fill="#6a5844" opacity="0.42"/>`; }
    return `<rect x="${f(x - 930)}" y="-260" width="240" height="2440" fill="#000" opacity="0.2" filter="url(#b14)"/><g filter="url(#dof3)">${g}</g>`;
  };
  // 1. the camera tilts up off the stranger into the sky; the next shot keeps tilting up into the square
  X.tr('carry', 5.95, 0.8, 'HOOK', 'SQUARE', { mode: 'tilt', dir: [0, -1], dist: 0.22, blur: 14, fade: [0.44, 0.56] });
  // 2. the stranger's coat sweeps past the lens
  X.tr('wipe', 9.95, 0.8, 'SQUARE', 'WINDOW', { dir: 1, truck: 160, obj: SH.coatWipe });
  // (every cross-fade is held to a few frames at the peak of the blur or the glow, so two shots never show through
  // each other)
  // 3. into the dark of the window as you turn from it, out of the dark of your doorway (dark matched to dark)
  X.tr('push', 17.95, 0.7, 'WINDOW', 'RUN', { fa: at(SH.cam.WINDOW, 17.95, [-314, 474, 865]), fb: at(SH.cam.RUN, 17.95, [-338, 110, 845]), za: 2.2, zb: 0.7, blur: 10, fade: [0.45, 0.55] });
  // 4. you run past us; the camera carries on round, outside the walls
  X.tr('carry', 19.95, 0.75, 'RUN', 'OUTGATE', { mode: 'pan', dir: [1, 0], dist: 0.42, blur: 16, fade: [0.44, 0.56] });
  // 5. the camera, panning on, passes the corner of the wall close to the lens and comes out over the hill (a radial out
  // of the sun showed both paths through each other for a third of a second)
  X.tr('wipe', 22.65, 0.8, 'OUTGATE', 'HILL', { dir: 1, truck: 120, obj: stoneWipe });
  // 6. a band of warm light across the hillside
  X.tr('sweep', 25.78, 0.7, 'HILL', 'TOP', { col: '#fff0c8', dir: 1 });
  // 7. the summit drifts out of focus, the three come into it
  X.tr('rack', 31.2, 0.9, 'TOP', 'THREE', { blur: 14, za: 1.04, zb: 0.96, fade: [0.43, 0.57] });
  // 8. a page of the picture book turns past the lens, and the story is a book at bedtime (a face-to-page morph showed
  // the two shots through each other)
  X.tr('wipe', 38.75, 0.8, 'THREE', 'BED', { dir: 1, truck: 60, obj: pageWipe });
  // 9. into the drawn children, out of the real ones
  X.tr('zmatch', 42.1, 0.8, 'BED', 'KIDS', { fa: SH.bookPage(SH.cam.BED(42.1), 0) || [540, 900], fb: SH.kidsSon(SH.cam.KIDS(42.1)) || [540, 900], za: 2.6, zb: 2.2, plain: true, blur: 9, leak: '#ffe0b0', leakOp: 0.4, fade: [0.38, 0.62] });
  // 9b. the push goes on into your son among them and comes out on him alone (his figure lined up across the swap)
  X.tr('push', 43.55, 0.6, 'KIDS', 'REAL', { fa: SH.kidsSon(SH.cam.KIDS(43.55)) || [540, 930], fb: SH.sonFace(SH.cam.REAL(43.55)) || [540, 1000], za: 4, zb: 0.96, easeA: 'sine', align: true, blur: 10, fade: [0.45, 0.55] });
  // 10. his eye becomes the stranger's eye
  X.tr('morph', 44.95, 0.7, 'REAL', 'REVEAL', { fa: SH.sonFace(SH.cam.REAL(44.95), -1) || [540, 900], fb: SH.piperEye(SH.cam.REVEAL(44.95), 44.95) || [540, 900], za: 1.15, zb: 3.6, align: true, blur: 8, col: '#fff0d0', fade: [0.44, 0.56] });
  // 11. (the loop) the gate's light goes soft and the stranger's silhouette pulls into focus in front of it: frame 0.
  // (not a radial out of the hook's sun: the sun sits behind his head, so that opened as a black blob)
  X.tr('rack', X.T_END, 0.85, 'REVEAL', 'HOOK', { end: true, bOff: -X.T_END, fa: [540, 1250], fb: [430, 760], za: 1.08, zb: 1.05, blur: 18, fade: [0.35, 0.65], leak: '#ffd8b0', leakOp: 0.3 });
})(window);
