// hand test sheet: each hand at ~3.4x on a plain wall, lit with the village rig
const poses = [['hold', 0], ['fist', 0], ['relaxed', 0], ['back', 0]];
const SHOTS = [{ at: 0, draw(v, t) {
  const C = camT(0, 540, 960, 1.0, { hh: 0 });
  const tiles = poses.map(([h, r], i) => { const x = 270 + (i % 2) * 540, y = 380 + Math.floor(i / 2) * 760;
    return `<g transform="translate(${x} ${y}) scale(5.2)">${HANDS[h](-1, 0, 0, 1.55, 0, { S: SKO, sk: 'olive' })}</g>`; }).join('');
  return `<g transform="${C.tf}">${lights(C.v, RIG.village(0, { k: 1.1 }))}<rect x="-300" y="-300" width="1680" height="2500" fill="#7a6a7a"/>${tiles}</g>`; } }];
TL = makeTimeline({ shots: SHOTS, trans: [], words: [], strong: [], captions: 'none', fps: 30, duration: 7 });
render(0);
