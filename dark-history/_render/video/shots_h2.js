// "The Blind Harpist" part 2: the flinch -> the brother freezes, hand on his dagger -> the blank stare and the
// unbroken song -> the Emperor chokes -> a later night: the brother in the purple makes you his musician (loops to the iron).
(function (G) {
  const X = G.ENG, S = G.SETS, PR = G.PROPS, C = G.CINE, R = G.RIG;
  const { track: TK, ss, lerp, EZ } = X;
  const { f } = R;
  const { hh, scr, CAM, env } = G.SHOTS_H;
  const ST = G.HARPIST, POS = ST.POS, SC = ST.SC;
  const youEye = [POS.you[0] + 6, POS.you[1] - 1310 * SC.you];
  const broEye = [POS.bro[0] - 4, POS.bro[1] - 1312 * SC.bro];
  const empHead = [POS.emp[0], POS.emp[1] - 1290 * SC.emp];
  // the camera is set first: the set and the characters cull against it
  const night = (t, cam, seed, o) => { const c = hh(cam(t), t, 0.4, seed); return X.compose(X.stage(S.warRoom(t, { dark: 1 }), ST.room(t, o)), c) + ST.NIGHT_TINT; };

  // ======================================================= REACT (21.05 - 28.52)
  // "and when you accidentally flinch, he freezes with his hand on his dagger,
  //  realizing you can see and waiting to see if you warn the Emperor."
  {
    const cam = CAM(
      [[21.05, [205, 960, 0]], [22.0, [196, 930, 0], 'sine'], [22.7, [212, 922, 1.5], 'sine'], [23.6, [1405, 700, -1], 'io'], [24.9, [1418, 640, 0], 'sine'], [26.2, [1424, 578, 0], 'sine'], [27.3, [800, 1010, 0], 'io'], [28.52, [770, 1000, 0], 'sine']],
      [[21.05, 2.0], [22.0, 2.45, 'sine'], [22.7, 2.55, 'sine'], [23.15, 1.1, 'sine'], [23.6, 1.85, 'sine'], [24.9, 2.2, 'sine'], [26.2, 3.2, 'sine'], [26.75, 1.5, 'sine'], [27.3, 0.8, 'sine'], [28.52, 0.92, 'sine']]);
    ST.reactCam = cam;
    X.shot('REACT', 21.05, 28.52, t => night(t, cam, 31, { youFace: ST.youFace }) + C.vignette(0.55), { grade: 'gHall' });
  }

  // ======================================================= BLANK (27.92 - 32.18)
  // "You force a blank stare and keep playing without missing a single note,"
  {
    const cam = CAM(
      [[27.92, [184, 902, 0]], [29.5, [180, 898, 0], 'sine'], [30.25, [218, 1180, 0], 'io'], [31.4, [236, 1206, 0], 'sine'], [32.18, [262, 1200, 0], 'in2']],
      [[27.92, 3.1], [29.5, 3.55, 'sine'], [30.25, 2.25, 'io'], [31.4, 2.5, 'sine'], [32.18, 2.5, 'sine']]);
    ST.blankCam = cam;
    X.shot('BLANK', 27.92, 32.18, t => night(t, cam, 37, { youFace: ST.youFace }) + C.vignette(0.6), { grade: 'gHall' });
  }

  // ======================================================= CHOKE (31.58 - 33.65)
  // "the Emperor chokes to death,"
  {
    const cam = CAM(
      [[31.58, [1015, 760, 0]], [32.4, [1035, 790, -1.5], 'sine'], [33.65, [1040, 880, 1.5], 'sine']],
      [[31.58, 1.65], [32.4, 1.95, 'sine'], [33.65, 1.7, 'sine']]);
    ST.chokeCam = cam;
    X.shot('CHOKE', 31.58, 33.65, t => night(t, cam, 41, { youFace: ST.youFace }) + C.vignette(0.6), { grade: 'gHall' });
  }

  // ======================================================= NEW: a later night (32.95 - end, loops into the iron)
  // "and the brother makes you his personal war-room musician."
  {
    const newFace = t => ({ bandage: null, face: { expr: 'neutral', look: [0.02, 0.07], lid: 0.44, brows: [-1, 0], mouth: 'closed', sweat: 0.3 } });
    const cam = CAM(
      [[32.95, [1045, 610, 0]], [34.1, [1040, 660, 0], 'sine'], [35.0, [690, 1010, 0], 'io'], [35.45, [640, 1000, 0], 'sine'], [36.1, [205, 930, 0], 'in2']],
      [[32.95, 2.5], [34.1, 2.1, 'sine'], [35.0, 0.84, 'sine'], [35.45, 0.9, 'sine'], [36.1, 1.7, 'in2']]);
    ST.newCam = cam;
    X.shot('NEW', 32.95, X.T_END + 0.01, t => night(t, cam, 43, { youFace: newFace, later: true }) + C.vignette(0.55), { grade: 'gHall' });
  }

  // ======================================================= transitions: nine scene changes, nine different types
  // the curtain that hides the war room crosses the lens
  const curtainWipe = (x, u) => `<g filter="url(#dof2)">${PR.curtain(x - 720, x + 720, -300, 2300, '#4c1642', u * 3, 4, -1, 0)}<rect x="${f(x - 720)}" y="-300" width="1440" height="80" fill="#c89a3a"/></g>`;
  X.tr('iris', 1.76, 0.6, 'CELL', 'HARP', { fa: ST.cellTip(1.6), fb: ST.harpFocus(2.0), k: 5 });
  X.tr('wipe', 3.62, 0.7, 'HARP', 'WAR', { dir: 1, truck: 240, obj: curtainWipe });
  X.tr('bokeh', 10.55, 0.7, 'WAR', 'NIGHT', { dir: [0, 1], dist: 0.3, blur: 16, seed: 7 });
  X.tr('eyelid', 13.5, 0.8, 'NIGHT', 'POV', {});
  X.tr('organic', 21.35, 0.6, 'POV', 'REACT', { fa: ST.povFocus(21.3), fb: scr(youEye, ST.reactCam(21.4)), za: 1.1, zb: 0.92, seed: 13, freq: 0.004, soft: 4 });
  X.tr('push', 28.22, 0.6, 'REACT', 'BLANK', { fa: scr(youEye, ST.reactCam(28.2)), fb: [540, 960], za: 2.4, zb: 0.6, fade: [0.4, 0.6], blur: 6 });
  X.tr('carry', 31.88, 0.6, 'BLANK', 'CHOKE', { mode: 'pan', dir: [1, 0], dist: 0.45, blur: 12 });
  X.tr('liquid', 33.3, 0.7, 'CHOKE', 'NEW', { fa: scr(ST.MP(820, 230), ST.chokeCam(33.3)), fb: scr([POS.emp[0], POS.emp[1] - 1380 * SC.bro], ST.newCam(33.3)), col: '#5a0812', seed: 9 });
  X.tr('zmatch', X.T_END, 0.65, 'NEW', 'CELL', { end: true, bOff: -X.T_END, fa: scr(youEye, ST.newCam(X.T_END - 0.3)), fb: scr([612, 1478], ST.cellCam(-0.3)), za: 2.4, zb: 2.2, seed: 15, leak: '#ff8a3a', leakOp: 0.35, blur: 4 });
  ST.FOCUS = { youEye, broEye, empHead };
})(window);
