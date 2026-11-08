// "The Pied Piper" (third cut), shots 3-4.
// WINDOW (9.5 .. 18.3): you at your open window watering the geraniums; the camera floats back and up over the street
// and the roofs of the town, then down into the street: the stranger comes playing, the children behind him. Your son
// walks under your window smiling and passes close by us without turning his head; the focus pulls back to you at the
// window, screaming his name.
// RUN (17.6 .. 20.2): your door bursts open and you run down the street after them.
(function (G) {
  const X = G.ENG, T = G.ST3, H3 = G.H3, Q = G.QCAST, C = G.CINE, R = G.RIG, PR = G.PROPS, SH = G.SH;
  const { ss, clamp, lerp } = X, { f } = R, LT = SH.LT;

  // ======================================================= 3. WINDOW
  const winCam = SH.CAM3([
    [9.5, [-130, 468, 880, -90, 0, 1300]],
    [10.6, [-60, 520, 880, -88, -2, 1250]],
    [11.4, [150, 700, 860, -75, -6, 1150]],
    [12.1, [230, 900, 700, -50, -10, 1100]],
    [13.4, [150, 340, -40, -10, 0, 1150]],
    [14.6, [150, 190, 120, -14, 3, 1150]],
    [15.8, [160, 150, 240, -24, 5, 1100]],
    // the crane swings up off the street as he passes and settles on your face as you scream his name (it starts
    // early and slows all the way in, so it lands softly), then creeps in
    [16.4, [60, 262, 520, -50, 8, 1150]],
    [16.85, [-108, 398, 758, -73, 5.5, 1340]],
    [17.22, [-180, 452, 842, -82, 4, 1450], 'stop'],
    [17.6, [-198, 457, 850, -83, 3.5, 1550]],
    [18.3, [-215, 460, 856, -84, 3, 1650]]
  ], 0.6, 3);
  const PZW = t => 400 - 160 * (t - 15.0);      // the Piper leads them down the street toward us
  // the children behind him: z offset from him, x in the street; the son passes under your window (z 865) at 15.0
  const PROC = [
    { mk: () => Q.kids[0], art: () => Q.kidArt[0], dz: 260, x: -10, h: 122 },
    { mk: () => Q.kids[1], dz: 380, x: 150, h: 126 },
    { mk: () => Q.son, art: () => Q.sonArt, dz: 465, x: 40, h: 118, son: 1 },
    { mk: () => Q.kids[3], dz: 610, x: -120, h: 117 },
    { mk: () => Q.kids[4], dz: 760, x: 110, h: 120 },
    { mk: () => Q.kids[5], dz: 900, x: -60, h: 116 },
    { mk: () => Q.kids[6], dz: 1050, x: 160, h: 118 },
    { mk: () => Q.kids[7], dz: 1200, x: -20, h: 121 },
    { mk: () => Q.kids[2], dz: 1340, x: 90, h: 124 },
    { mk: () => Q.lame, dz: 1500, x: -100, h: 114, lame: 1 }
  ];
  SH.PROC = PROC;
  // a child walking in the procession: entranced, a loose easy walk, eyes ahead, the faint smile
  SH.procKid = (cam, t, K, i, x, z, L, x2 = {}) => {
    const st = SH.at(cam, x, z, K.h, 'kid'); if (!st) return null;
    const dist = (x2.dist ?? 0) + i * 37, w = SH.walk(dist, { stride: K.lame ? 38 : 46, lift: K.lame ? 40 : 66, depth: 26, bob: K.lame ? 34 : 22, sway: K.lame ? 3 : 1 });
    const idle = SH.idle(t, i * 5 + 2);
    const o = Object.assign({ x: st.x, y: st.y + w.bob * st.s, s: st.s, steps: w.steps, sway: w.sway + idle.sway, tilt: 2 * Math.sin(t * 0.9 + i), blink: idle.blink, breath: idle.breath,
      face: { mouth: 'smile', cd: -2, lid: 0.5 + 0.06 * Math.sin(t + i), look: [0.06 * Math.sin(t * 0.5 + i), 0.05], brows: [0, 0] } }, SH.swingArms('kid', w.swing, 0.7));
    if (K.lame) { o.face = { expr: 'grief', mouth: 'parted', open: 0.15, lid: 0.25, tears: 0.6 }; o.steps.L = [0, Math.min(0, o.steps.L[1]) * 0.3, 1]; }
    Object.assign(o, x2.o || {});
    // the lame boy's crutch under his arm, in his fist (it goes along with him as he limps)
    const cr = K.lame ? SH.crutch(o, st, Q.HAND.lame) : null; if (cr) o.armR = cr.arm;
    const P = K.mk()(o);
    return SH.actor(st.d, () => SH.blur((cr ? cr.svg : '') + SH.draw(P, o, K.art || null, L, '', { cast: x2.cast || [0.3, -0.22], castOp: 0.24 }), x2.blur || 0));
  };
  // you at the window: watering the geraniums, hearing it, leaning out, screaming his name, turning to run
  const motherAtWindow = (cam, E, Hg, t, blur) => {
    const w = H3.homeWindow(Hg), X0 = w.X, lean = ss(15.0, 15.8, t) * 34 + ss(16.6, 17.0, t) * 22 - ss(17.7, 18.2, t) * 130;
    const mx = X0 - 52 + lean, c = cam.toC([mx, 320, w.u]); if (c[2] < cam.near + 10) return '';
    const p = cam.scr(c), s = cam.fl / c[2] * 166 / R.DIMS.woman.H;
    const pour = 1 - ss(11.6, 12.1, t), hearK = ss(12.0, 12.6, t), see = ss(14.9, 15.5, t), scream = ss(16.65, 16.95, t);
    // (no blinking while she screams: the eyes stay wide on him)
    const o = { x: p[0], y: p[1], s, blink: Q.blink(t, 4) * (1 - ss(16.3, 16.6, t)), breath: Q.breath(t * 1.4) * (0.6 + 1.6 * scream) };
    // the arms: the jug held out pouring, then the hand on the sill; at the scream it grips the sill edge as she leans
    // out and the other arm reaches down to him, open-handed (both clear of her face)
    // (when the pouring's done she sets the jug down inside, below the sill, and her hand comes back up empty)
    const jugH = [-175, -880 - 30 * pour], sill = [-110, -840], low = [-140, -600], down = ss(12.1, 12.45, t) * (1 - ss(12.55, 12.95, t)), hold = t < 12.55;
    const handR = pour > 0 ? [lerp(sill[0], jugH[0], pour), lerp(sill[1], jugH[1], pour)] : [lerp(sill[0], low[0], down), lerp(sill[1], low[1], down)];
    o.armR = t < 12.95 ? { hand: handR, dir: [0.5, 0.6], pose: 'grip', facing: 'back' } : { hand: [lerp(sill[0], -175, scream), lerp(sill[1], -830, scream)], dir: [lerp(0.5, 0.2, scream), lerp(0.6, 1, scream)], pose: 'grip', facing: 'back' };
    o.armL = { hand: [lerp(120, 330, scream), lerp(-840, -760, scream)], dir: [lerp(-0.1, 0.8, scream), 1], pose: scream > 0.5 ? 'open' : 'relaxed', facing: scream > 0.5 ? 'palm' : 'back' };
    o.face = { expr: 'neutral', lid: 0.22, mouth: 'smile', cd: -1, look: [lerp(-0.1, 0.8, hearK) * (1 - see) + see * 0.7, lerp(0.4, 0.15, hearK) + see * 0.35] };
    if (hearK > 0) o.face = Object.assign(o.face, { brows: [lerp(0, -5, hearK), 0], mouth: hearK > 0.5 ? 'closed' : 'smile' });
    if (see > 0) o.face = Object.assign(o.face, { expr: 'fear', brows: [-8 * see, -2 * see], lid: lerp(0.22, 0.06, see), mouth: 'parted', open: 0.2 * see });
    // the scream: the jaw opens wide, brows knot up, wet eyes on him; the breath catches and goes again (every part
    // eases in from the look before it)
    if (scream > 0) o.face = { expr: 'fear', brows: [lerp(-8, -11, scream), lerp(-2, -4, scream)], lid: lerp(0.06, 0, scream), mouth: 'scream', open: lerp(0.2, 1.2 * (0.9 + 0.1 * Math.sin(t * 9)), scream), wide: lerp(1, 1.4, scream), cd: lerp(-1, 6, scream), look: [lerp(0.7, 0.75, scream), lerp(0.5, 0.45, scream)], tears: ss(16.9, 17.5, t) * 0.8 };
    o.tilt = -4 * hearK + 6 * see - 5 * scream; o.sway = 3 * scream * Math.sin(t * 6);
    const P = Q.mother(o);
    // what she's watering with: a clay jug in her fist, tipped, a thin stream into the box
    let jug = '';
    if (hold) {
      const hw = R.toWorld(o, handR), k = s * 4.6;
      jug = `<g transform="translate(${f(hw[0])},${f(hw[1])}) rotate(${f(-38 * pour)}) scale(${Math.round(k * 1e5) / 1e5})"><path d="M-8,-4 C-24,0 -26,26 -10,34 L18,34 C34,26 32,0 16,-4Z" fill="#a8603a" stroke="#20140c" stroke-width="1.4"/><path d="M14,-2 L30,-12 L28,-4Z" fill="#a8603a" stroke="#20140c" stroke-width="1.2"/><path d="M-8,8 C-22,6 -22,22 -10,22" stroke="#20140c" stroke-width="3" fill="none"/></g>`;
      const sp = [hw[0] + 26 * k * pour, hw[1] - 6 * k];
      jug += `<path d="M${f(sp[0])},${f(sp[1])} q${f(4 * k)},${f(30 * k)} ${f(2 * k)},${f(62 * k)}" stroke="#d8eef8" stroke-width="${f(1.6 * k)}" fill="none" opacity="${f(0.7 * pour)}"/>`;
    }
    // her side of the sill: everything above it shows (she can lean out over it)
    const clipQ = T.path(cam, [[X0, w.y0, w.u0 - 70], [X0, w.y0, w.u1 + 70], [X0, w.y0 + 420, w.u1 + 70], [X0, w.y0 + 420, w.u0 - 70]]); if (!clipQ) return '';
    const id = R.uid('mw');
    return `<defs><clipPath id="${id}"><path d="${clipQ}"/></clipPath></defs><g clip-path="url(#${id})">${SH.blur(SH.draw(P, o, null, LT.morn, jug) , blur)}</g>`;
  };
  // the sill board and the box of geraniums under the window (over her)
  const sillBox = (cam, E, Hg) => {
    const w = H3.homeWindow(Hg), X0 = w.X;
    let g = '';
    const P = (pts, c, k = 'g') => { const p = T.path(cam, pts); return p ? `<path d="${p}" fill="${T.tone(E, c, 500, k)}" stroke="#1a120c" stroke-width="1.2" stroke-linejoin="round"/>` : ''; };
    g += P([[X0, w.y0 - 2, w.u0 - 12], [X0, w.y0 - 2, w.u1 + 12], [X0 + 20, w.y0 - 2, w.u1 + 12], [X0 + 20, w.y0 - 2, w.u0 - 12]], '#7a5434');
    g += P([[X0 + 20, w.y0 - 2, w.u0 - 12], [X0 + 20, w.y0 - 2, w.u1 + 12], [X0 + 20, w.y0 - 12, w.u1 + 12], [X0 + 20, w.y0 - 12, w.u0 - 12]], '#5a3a22');
    const bx = X0 + 26, by = w.y0 - 42, fr = R.rng(9);
    // round leaves and round florets with a darker rim and a pale eye (the camera comes in close on them at the scream)
    for (let j = 0; j < 9; j++) { const uu = w.u0 + (w.u1 - w.u0) * (j + 0.5) / 9; g += P(T.ring([bx - 6, by + 30 + fr() * 10, uu], [0, 10, 0], [0, 0, 12], 18), j % 2 ? '#3a6a2a' : '#2e5a24'); }
    for (let j = 0; j < 7; j++) { const uu = w.u0 + 8 + (w.u1 - w.u0 - 16) * (j + 0.5) / 7 + (fr() - 0.5) * 6, vv = by + 44 + fr() * 16; for (let q = 0; q < 6; q++) { const a = q / 6 * Math.PI * 2, rr = q ? 3.2 : 0; const c0 = [bx - 3, vv + Math.sin(a) * rr * 1.1, uu + Math.cos(a) * rr * 1.2]; const pp = T.path(cam, T.ring(c0, [0, 2.3, 0], [0, 0, 2.3], 14)), pe = T.path(cam, T.ring([c0[0] - 0.5, c0[1], c0[2]], [0, 0.6, 0], [0, 0, 0.6], 8)); if (pp) g += `<path d="${pp}" fill="${T.tone(E, q % 2 ? '#e0382c' : '#c82a24', 500, 'g')}" stroke="${T.tone(E, '#7a1612', 500, 'g')}" stroke-width="0.8"/>`; if (pe) g += `<path d="${pe}" fill="${T.tone(E, '#f0b0a0', 500, 'g')}" opacity="0.7"/>`; } }
    g += P([[bx, by, w.u0 - 6], [bx, by, w.u1 + 6], [bx, by + 32, w.u1 + 6], [bx, by + 32, w.u0 - 6]], '#6a4228');
    return g;
  };
  X.shot('WINDOW', 9.5, 18.3, t => {
    SH.still();
    const cam = winCam(t), E = H3.MORN, rack = ss(16.85, 17.45, t);
    const A = [];
    // the stranger leading, playing
    // (everyone is drawn while any of them is in front of the lens: they walk out of frame, they never blink out)
    const zp = PZW(t), stp = SH.at(cam, -60, zp, 190, 'man');
    if (stp) {
      const w = SH.walk(2000 - zp, { stride: 80, lift: 60, depth: 34, bob: 30, sway: 1.2 });
      const o = { x: stp.x, y: stp.y + w.bob * stp.s, s: stp.s, steps: w.steps, sway: w.sway + Math.sin(t * 2.2) * 0.7, tilt: 3 * Math.sin(t * 2.2 + 0.5), breath: Q.breath(t) * 0.6, face: { lid: 0.4, brows: [2, -5], look: [0.1, 0.1] } };
      A.push(SH.actor(stp.d, () => SH.blur(SH.piper(o, t, LT.morn, { cast: [0.3, -0.22] }).svg, rack * 4)));
    }
    PROC.forEach((K, i) => {
      const z = zp + K.dz + (K.lame ? 70 * (t - 12) : 0) + 20 * Math.sin(t * 0.8 + i), x = K.x + 14 * Math.sin(t * 0.6 + i * 2);
      const a = SH.procKid(cam, t, K, i, x, z, LT.morn, { dist: 3000 - z, blur: rack * 5.5 }); if (a) A.push(a);
    });
    return H3.home(cam, t, A, { window: (cam, E2, Hg) => motherAtWindow(cam, E2, Hg, t, (1 - ss(16.4, 17.2, t)) * ss(13.0, 14.0, t) * 1.6) + sillBox(cam, E2, Hg) });
  }, { grade: 'gDay' });
  SH.cam.WINDOW = winCam;

  // ======================================================= 4. RUN
  // the camera backs down the street ahead of you, turning with you so you stay a little left of centre
  const runCam = SH.CAM3([
    [17.6, [40, 150, 360, -30, 2, 1100]],
    [18.1, [36, 148, 305, -30, 2, 1100]],
    [18.6, [30, 145, 250, -25, 2, 1100]],
    [19.1, [25, 142, 190, -23, 1.5, 1120]],
    [19.6, [20, 140, 130, -25, 1, 1150]],
    [20.4, [10, 138, 40, -22, 1, 1150]]
  ], 1.2, 4);
  // her path out of the door and down the street toward us
  const runPath = SH.spline([[18.1, [-330, 845]], [18.5, [-250, 740]], [19.5, [-90, 330]], [20.3, [-50, 40]]]);
  X.shot('RUN', 17.6, 20.3, t => {
    SH.still();
    const cam = runCam(t), E = H3.MORN, A = [];
    const out = t >= 18.1;
    if (out) {
      const [x, z] = runPath(t), st = SH.at(cam, x, z, 166, 'woman');
      if (st) {
        // running flat out: one fist gathers the skirt up off her feet (her shoes and stockings flash under the hem),
        // the other arm pumps in time with the stride; she comes out of the dark doorway
        const k = ss(18.1, 18.4, t), w = SH.walk((t - 18.1) * 400, { stride: 112, lift: 150, depth: 40, bob: 80, sway: 2.4 }), a = w.swing;
        const o = { x: st.x, y: st.y + w.bob * st.s * k, s: st.s, sway: w.sway * k, tilt: -3 + 2 * Math.sin(t * 6), steps: w.steps, breath: Q.breath(t * 3) * 1.6, blink: 0,
          legsW: 1, dims: { hemY: -190, legX: 34, legW: 44 }, legs: '#4a3a32', feet: '#2a1a12',
          armR: { hand: [-150 + 12 * a, -760 + 30 * a], dir: [0.1, 1], pose: 'grip', facing: 'back' },
          armL: { hand: [170 - 10 * a, -990 - 130 * a], dir: [-0.2, 1], pose: 'fist', facing: 'back' },
          face: { expr: 'fear', brows: [-10, -3], lid: 0.02, mouth: 'scream', open: 0.6 + 0.3 * Math.sin(t * 2.3), look: [0.1, -0.1], tears: 0.6 } };
        const P = Q.mother(o), op = ss(18.1, 18.28, t);
        A.push(SH.actor(st.d, () => `<g opacity="${op.toFixed(3)}">${SH.draw(P, o, null, LT.morn, '', { cast: [0.3, -0.22], castOp: 0.24 })}</g>`));
      }
    }
    // the door: shut, then flung open (a dark doorway, the leaf swung back against the wall)
    const door = (cam2, E2) => {
      const dz = 845, dw = 116, X0 = -340, open = ss(17.98, 18.3, t);
      if (open <= 0) return '';
      const hole = T.path(cam2, [[X0 + 1, 0, dz - dw / 2], [X0 + 1, 0, dz + dw / 2], [X0 + 1, 214, dz + dw / 2], [X0 + 1, 214, dz - dw / 2]]);
      const a = open * Math.PI * 0.55, leaf = T.path(cam2, [[X0 + 1, 0, dz + dw / 2], [X0 + 1 + Math.sin(a) * dw, 0, dz + dw / 2 - Math.cos(a) * dw], [X0 + 1 + Math.sin(a) * dw, 214, dz + dw / 2 - Math.cos(a) * dw], [X0 + 1, 214, dz + dw / 2]]);
      return (hole ? `<path d="${hole}" fill="#120c0a"/>` : '') + (leaf ? `<path d="${leaf}" fill="${T.tone(E2, '#5a3a24', 900, 'g')}" stroke="#1a120c" stroke-width="1.2"/>` : '');
    };
    return H3.home(cam, t, A, { window: (cam2, E2, Hg) => door(cam2, E2) + sillBox(cam2, E2, Hg) });
  }, { grade: 'gDay' });
  SH.sillBox = sillBox; SH.cam.RUN = runCam;
})(window);
