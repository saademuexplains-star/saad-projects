// character sheet tests (fps 1: frame n = sheet n)
const RIGT = { lights: [{ pos: [200, 300, 700], col: '#ffe2bc', int: 1.6, rad: 2200, shin: 26 }, { pos: [1000, 600, -300], col: '#a8bcf0', int: 1.2, rad: 1400, shin: 26 },
  { pos: [540, 1500, 1800], col: '#8a9cd0', int: .35, rad: 5000, shin: 12 }],
  amb: '#3a4258', ambGround: '#2a2420', ambInt: .4, bgLight: .5, exposure: 1.15, bloom: .3, bloomThresh: .78, normalStrength: .95, specScale: .35,
  vignette: .3, grain: .01, shadowTint: '#141c30', highTint: '#f6e2c4', sat: 1, contrast: 1.08 };
const bg = `<rect x="-100" y="-100" width="1280" height="2120" fill="#3a4050"/>`;
const grid6 = (ch, poses, s = 1.1) => poses.map((p, i) => { const x = i % 2 ? 790 : 290, hy = 330 + Math.floor(i / 2) * 640; return outlined(manb(x, hy + 1075 * s, s, ch, { bust: 1, ...p })); }).join('');
const SHOTS = [
  { at: 0, draw(v, t) { lights(null, RIGT); return bg + grid6(TASTER, [{}, { shock: .9, bIn: 8, bOut: 5 }, { squint: .5, bIn: -5, lid: .45, smirk: -.2, look: 6 }, { smirk: .9, side: .6, lid: .3, look: -5 }, { puff: 1, bIn: 9, bOut: 5, sweat: 1, look: 7 }, { lid: 2, squeeze: 1, grit: .9, bIn: -6, bOut: 7 }]); } },
  { at: 1, draw(v, t) { lights(null, RIGT); return bg + grid6(KING, [{}, { laugh: 1, lid: 2, happy: 1, smirk: 1, bIn: 2, bOut: 6 }, { bIn: -9, bOut: 4, squint: .45, smirk: -.6 }, { talk: .3, smirk: .4, look: -6 }, { squint: .3, side: -.6, smirk: .3, look: 7, lid: .3 }, { open: .85, bIn: 3, bOut: 7, teeth: 1 }], .95); } },
  { at: 2, draw(v, t) { lights(null, RIGT); return bg + grid6(QUEEN, [{}, { smirk: .6, side: .5, squint: .3, lid: .35, look: -6 }, { look: -9, lookY: 4, lid: .3 }, { shock: .3, smirk: .5, lid: 0, bIn: 3 }, { pale: 1, open: .45, bIn: 8, shock: .6, lookY: 6 }, { pale: .8, bIn: 10, bOut: 3, sweat: 1, smirk: -.7, lid: 0 }]); } },
  { at: 3, draw(v, t) { lights(null, RIGT);
    const SB = [SKIN_TONES.fair, 'fair'], SR = [SKIN_TONES.ruddy, 'ruddy'];
    // 1: the boy holds the goblet at his chest with his right hand
    const A1 = gripArm(tArm, 1, [30, -830], { hs: 1.05, bend: -1 });
    const f1 = outlined(manb(290, 330 + 1075 * .95, .95, TASTER, { bust: 1, armR: A1, look: 3 }) + atb(290, 330 + 1075 * .95, .95, heldGoblet(A1, 1, 1.05, .8, SB)));
    // 2: drinking: the rim at his lips, head back a little
    const A2 = gripArm(tArm, 1, [26, -900], { hs: 1.05, bend: -1, hrot: 30 });
    const f2 = outlined(manb(790, 330 + 1075 * .95, .95, TASTER, { bust: 1, armR: A2, lid: 1.4, tilt: -6 }) + atb(790, 330 + 1075 * .95, .95, heldGoblet(A2, 1, 1.05, .8, SB, { wine: .6 })));
    // 3: the king with the roast leg
    const A3 = gripArm(kArm2, -1, [-150, -820], { hs: 1.75, bend: 1 });
    const f3 = outlined(manb(290, 1000 + 1075 * .75, .75, KING, { armL: A3, laugh: .5, smirk: .8 }) + atb(290, 1000 + 1075 * .75, .75, heldLeg(A3, -1, 1.75, .5, SR)));
    // 4: the boy offers the goblet out to his left
    const A4 = gripArm(tArm, -1, [-190, -870], { hs: 1.05, bend: 1 });
    const f4 = outlined(manb(820, 1000 + 1075 * .95, .95, TASTER, { bust: 1, armL: A4, turn: -.3, look: -6, smirk: .4 }) + atb(820, 1000 + 1075 * .95, .95, heldGoblet(A4, -1, 1.05, .8, SB)));
    return bg + f1 + f2 + f3 + f4; } },
];
TL = makeTimeline({ shots: SHOTS, trans: [], words: WORDS, strong: STRONG, captions: 'none', fps: 1, duration: 4 });
render(0);
