// "The Keeper" — 4 style frames (no captions). A night storm on a rock lighthouse: the old keeper tends the lamp,
// his grandson asks why it may never go dark. Relit (flat + normal passes → deferred lights). Hard cuts only.

const brS = (t, ph = 0, rate = 1) => br(t, ph, rate) * seamW(t), swayS = (t, k = 0, a = 1.5) => sway(t, k, a) * seamW(t);
const aim = (A, theta) => ({ ...A, hrot: theta - Math.atan2(A.wr[1] - A.el[1], A.wr[0] - A.el[0]) * 180 / Math.PI });
const wristFor = (tip, theta, len) => [tip[0] - Math.cos(theta * Math.PI / 180) * len, tip[1] - Math.sin(theta * Math.PI / 180) * len];

// ---------- light rigs (world coordinates of each set) ----------
const LAMP_EXT = [470, 500];
const RIG_EXT = (t) => ({
  lights: [
    { pos: [LAMP_EXT[0], LAMP_EXT[1], 140], col: '#fff1d8', int: 2.6 * (.96 + .04 * flkSeam(t, 2)), rad: 520, shin: 24 },   // the lamp
    { pos: [1000, 200, 500], col: '#9fb4e0', int: 1.1, rad: 2600, shin: 20 },                                                 // moon behind the cloud
    { pos: [680, 1290, 90], col: '#ffd6a0', int: .5, rad: 260, shin: 16 },                                                    // the cottage window
    { pos: [540, 1500, 1800], col: '#7d90c4', int: .3, rad: 5000, shin: 12 },
  ],
  amb: '#2e3c58', ambGround: '#151a24', ambInt: .32, bgLight: .5, exposure: 1.2, bloom: .45, bloomThresh: .72, normalStrength: .95, specScale: .35,
  vignette: .55, grain: .02, shadowTint: '#0c1830', highTint: '#f2e6d0', sat: .86, contrast: 1.08,
  rays: { center: LAMP_EXT, thresh: .5, srcRad: 220, samples: 44, step: .022, decay: .965, col: '#fff0d4', int: .9 },
});
// the lamp room: the lens is the key (warm white, never orange), the storm through the glass gives a cold rim
const LENS = [330, 1150], FLOOR2 = 2330;
const RIG_ROOM = (t, { flash = 0 } = {}) => ({
  lights: [
    { pos: [LENS[0], LENS[1], 170], col: '#fff0d6', int: 2.5 * (.95 + .05 * flkSeam(t, 5)), rad: 640, shin: 28 },
    { pos: [LENS[0] + 120, LENS[1] + 500, 60], col: '#ffe6c2', int: .35, rad: 700, shin: 18 },
    { pos: [1350, 700, -300], col: '#a4b8ea', int: 1.4 + 2.2 * flash, rad: 1250, shin: 26 },
    { pos: [640, 1500, 1800], col: '#8a9cd0', int: .3, rad: 5000, shin: 12 },
  ],
  amb: '#344058', ambGround: '#1a1c22', ambInt: .24, bgLight: .5, exposure: 1.16, bloom: .38, bloomThresh: .74, normalStrength: .95, specScale: .35,
  vignette: .56, grain: .02, shadowTint: '#101c34', highTint: '#f6e6cc', sat: .9, contrast: 1.1,
  rays: { center: LENS, thresh: .55, srcRad: 260, samples: 40, step: .016, decay: .962, col: '#fff0d4', int: .45 },
});
// through the glass from outside: the lens backlights them (warm rims), the storm light keys their faces (cold)
const LENS4 = [565, 1120];
const RIG_GLASS = (t) => ({
  lights: [
    { pos: [LENS4[0], LENS4[1], -260], col: '#fff0d6', int: 2.5 * (.95 + .05 * flkSeam(t, 5)), rad: 900, shin: 26 },
    { pos: [-200, 1000, 700], col: '#b4c4ec', int: 1.25, rad: 2600, shin: 24 },
    { pos: [560, 1500, 1800], col: '#7d90c4', int: .26, rad: 5000, shin: 12 },
  ],
  amb: '#2e3a54', ambGround: '#16181e', ambInt: .26, bgLight: .5, exposure: 1.18, bloom: .4, bloomThresh: .74, normalStrength: .95, specScale: .4,
  vignette: .58, grain: .02, shadowTint: '#0e1a32', highTint: '#f4e6cc', sat: .88, contrast: 1.1,
  rays: { center: LENS4, thresh: .55, srcRad: 240, samples: 40, step: .016, decay: .962, col: '#fff0d4', int: .35 },
});

// ---------- the keeper at the lens (shots 2-3) ----------
const KP_X = 860, KP_S = 1.1;
function keeperAtLens(t, pose = {}, { wipe = 1 } = {}) {
  const b = brS(t, 0, 1), y = FLOOR2;
  // the rag hand: fingertips circle on the lens face (world), wrist found back along the hand, arm keeps one IK side
  const w = wipe * seamW(t), tip = [548 + 22 * Math.cos(t * 4.2) * w, 1160 + 16 * Math.sin(t * 4.2) * w], th = -112 + 8 * Math.sin(t * 4.2) * w;
  const handLen = 64 * 1.7 * KP_S;
  const wr = toLocal(wristFor(tip, th, handLen), KP_X, y, KP_S, b);
  const L = aim(uArm(-1, wr, 'back', { bend: 1, spread: .2, curl: .1 }), th);
  const R = uArm(1, [160, -600], 'grip', { bend: -1 });
  const fc = (() => { const dx = R.wr[0] - R.el[0], dy = R.wr[1] - R.el[1], l = Math.hypot(dx, dy); return [R.wr[0] + dx / l * 22 * 1.7, R.wr[1] + dy / l * 22 * 1.7]; })();
  const ragC = toLocal([lerp(tip[0], toWorld(wr, KP_X, y, KP_S, b)[0], .45), lerp(tip[1], toWorld(wr, KP_X, y, KP_S, b)[1], .45)], KP_X, y, KP_S, b);
  const S = SKW, sk = 'weathered';
  const fig = manb(KP_X, y, KP_S, KEEPER, { armL: L, armR: R, breath: b, ...pose })
    + atb(KP_X, y, KP_S, rag(ragC[0], ragC[1], 1.15, th + 90) + HANDS.back(-1, L.wr[0], L.wr[1] - 3, 1.7, Math.atan2(L.wr[1] - L.el[1], L.wr[0] - L.el[0]) * 180 / Math.PI - 90 + L.hrot, { S, sk, spread: .2, curl: .1 })
      + oilCan(fc[0], fc[1] + 4, 1.35, swayS(t, 1, 1.2)) + HANDS.grip(1, R.wr[0], R.wr[1] - 3, 1.7, Math.atan2(R.wr[1] - R.el[1], R.wr[0] - R.el[0]) * 180 / Math.PI - 90, { S, sk }), b);
  return `<ellipse cx="${KP_X}" cy="${FLOOR2 + 4}" rx="230" ry="26" fill="#000" opacity=".45" filter="url(#b18)"/>${outlined(fig)}`;
}
function lampRoom(t, o = {}) {
  return `${lampRoomBack(t, { blur: o.blur, flash: o.flash || 0 })}
    <rect x="-700" y="${FLOOR2}" width="2600" height="600" fill="#1a1e1e"/><rect x="-700" y="${FLOOR2}" width="2600" height="600" filter="url(#planks)" opacity=".5"/>
    <path d="M-700 ${FLOOR2} L1900 ${FLOOR2}" stroke="#3a4444" stroke-width="6"/>
    ${(o.blur ? `<g filter="url(#${o.blur})">` : '') + fresnelLens(LENS[0], LENS[1], 1, t, { foot: FLOOR2 - LENS[1] }) + (o.blur ? '</g>' : '')}
    ${o.fig || ''}`;
}

const SHOTS = [
  // 1 establishing: the lighthouse on its rock, the storm, the beam sweeping through the rain
  { at: 0,
    draw(v, t) {
      const C = camT(t, 540, 1010, lerp(1.0, 1.05, seg(t, 0, 1.5)));
      return `<g transform="${C.tf}">${lights(C.v, RIG_EXT(t))}
        ${stormSky(t)}${stormSea(t, { y0: 1180 })}
        ${seaSpray(110, 1480, t, { seed: 3, w: 300, h: 240 })}${seaSpray(1120, 1520, t, { seed: 5, w: 340, h: 220 })}
        ${lighthouse(LAMP_EXT[0], 1360, t, { beam: lerp(196, 206, seg(t, 0, 1.5)) })}${rockIsland()}${cottage(720, 1352)}
        ${seaSpray(560, 1560, t, { seed: 8, w: 700, h: 120, op: .5 })}
        ${rain(t, { n: 170, seed: 2, area: [-300, -300, 1400, 2300], slant: .22, op: .42 })}</g>`;
    } },
  // 2 medium: in the lamp room the keeper wipes the great lens, oil can in his other hand; the storm beats on the glass
  { at: 1.5,
    draw(v, t) {
      const C = camT(t, 600, 1440, 1.0);
      return `<g transform="${C.tf}">${lights(C.v, RIG_ROOM(t))}
        ${lampRoom(t, { fig: keeperAtLens(t, { look: -9, lookY: 1, turn: -.35, lid: .25, bIn: 3, bOut: 0, smirk: -.15, tilt: -2 }) })}</g>`;
    } },
  // 3 close-up: he stops; his eyes go to the black window — fear
  { at: 3.0,
    draw(v, t) {
      const C = camT(t, 862, 1170, lerp(2.6, 2.7, seg(t, 3, 4.5)), { r: 1.2 });
      return `<g transform="${C.tf}">${lights(C.v, RIG_ROOM(t))}
        ${lampRoom(t, { blur: 'dofHeavy', fig: keeperAtLens(t, { look: 6, lookY: -1, turn: .12, lid: 0, bIn: 15, bOut: 7, talk: .14, tilt: -3 }, { wipe: 0 }) })}</g>`;
    } },
  // 4 through the rain on the glass, from outside: the boy's palm on the pane, the old man's hand on his shoulder;
  //   both look out at the sea
  { at: 4.5,
    draw(v, t) {
      const K = [800, 2560, 1.3], Bo = [330, 2560, 1.3], kb = brS(t, 0, 1), bb = brS(t, 1.3, 1.4);
      // the boy's right shoulder top (world) → where the keeper's fingertips rest
      const shTop = toWorld([98, -958], Bo[0], Bo[1] + 300 * Bo[2], Bo[2], bb), th = 118, len = 64 * 1.7 * K[2];
      const tip = [shTop[0] - 12, shTop[1] + 14];
      const KL = aim(uArm(-1, toLocal(wristFor(tip, th, len), K[0], K[1], K[2], kb), 'back', { bend: 1, curl: .35 }), th);
      // the boy's left palm flat on the glass beside his face, fingers up
      const BL = aim(bArm(-1, wristFor([-176, -1110], -96, 64 * 1.05), 'palm', { bend: 1, spread: .7 }), -96);
      const keeper = manb(K[0], K[1], K[2], KEEPER, { armL: KL, armR: uHang(1), breath: kb, look: -3, lookY: 1, turn: -.06, lid: .15, bIn: 5, bOut: -3, smirk: -.6, tilt: -2 });
      const boy = kidb(Bo[0], Bo[1], Bo[2], BOY2, { armL: BL, armR: bHang(1), breath: bb, look: 3, lookY: 3, lid: 0, bIn: 11, bOut: 6, talk: .12, tilt: 3, bust: 1 });
      const hand = atb(K[0], K[1], K[2], HANDS.back(-1, KL.wr[0], KL.wr[1] - 3, 1.7, Math.atan2(KL.wr[1] - KL.el[1], KL.wr[0] - KL.el[0]) * 180 / Math.PI - 90 + KL.hrot, { S: SKW, sk: 'weathered', curl: .35 }), kb);
      const C = camT(t, 560, 1450, 1.0);
      return `<g transform="${C.tf}">${lights(C.v, RIG_GLASS(t))}
        <g filter="url(#dofHeavy)"><rect x="-300" y="-300" width="1700" height="2700" fill="#121616"/>
          <g transform="translate(560 120) scale(.8)">${lampRoomBack(t)}</g>
          ${fresnelLens(LENS4[0], LENS4[1], .85, t)}</g>
        ${outlined(keeper + boy + hand)}
        <path d="M-200 2150 L1300 2150 L1300 2700 L-200 2700 Z" fill="#20282a" filter="url(#pcl)"/><rect x="-200" y="2150" width="1500" height="18" fill="#3e484a"/>
        ${glazingFront(t, { y0: 640, y1: 2150 })}
        ${rain(t, { n: 60, seed: 4, area: [-300, -300, 1400, 2300], slant: .25, op: .3 })}</g>`;
    } },
];

TL = makeTimeline({ shots: SHOTS, trans: [], words: [], strong: [], captions: 'none', fps: 30, duration: DUR });
render(0);
