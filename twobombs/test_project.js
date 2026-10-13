// test page: window.SCENE(t) → svg (a set at time t), else the cast lineup
const RIG_TEST = { lights: [ { pos: [200, 300, 900], col: '#fff2e0', int: 1.2, rad: 3000, shin: 24 }, { pos: [1300, 700, -300], col: '#ffd8b0', int: 2.2, rad: 1400, shin: 22 },
    { pos: [-300, 800, -200], col: '#a8bcff', int: 1.0, rad: 1200, shin: 22 }, { pos: [540, 1800, 1200], col: '#8a9ad0', int: .3, rad: 4000, shin: 12 } ],
  amb: '#4a5470', ambGround: '#3a3028', ambInt: .32, bgLight: .5, exposure: 1.12, bloom: .4, bloomThresh: .78, white: 2.2, tonemap: 'soft', normalStrength: 1.5, specScale: .28,
  vignette: .5, grain: .014, shadowTint: '#13243a', highTint: '#f6d6a8', shadowAmt: .25, highAmt: .1, sat: .92, contrast: 1.1 };
const SHOTS = [{ at: 0, draw(v, t) {
  if (window.SCENE) return window.SCENE(t);
  const C = camT(0, 540, 960, 1, { hh: 0 });
  const who = window.WHO || [TSU, TSU_NOCAP, TSU_BURNT, TSU_BAND];
  const xs = who.map((_, i) => 140 + i * (800 / Math.max(1, who.length - 1)));
  const pose = window.POSE || {};
  return `<g transform="${C.tf}">${lights(C.v, RIG_TEST)}<rect x="-200" y="-200" width="1480" height="2400" fill="#6a6660"/>
    <rect x="-200" y="1500" width="1480" height="700" fill="#4a463e"/>
    ${who.map((ch, i) => outlined(textured(manb(xs[i], window.FEET || 1560, window.SC || .72, ch, { smirk: .2, ...pose })), 0, { px: 1.3, col: '#1a120c', op: .5 })).join('')}</g>`; } }];
TL = makeTimeline({ shots: SHOTS, trans: [], words: [], strong: [], captions: 'none', fps: 30, duration: 60 });
render(window.T0 || 0);
