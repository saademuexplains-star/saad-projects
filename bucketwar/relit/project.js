// WAR OF THE BUCKET — style frame "…soldiers stole a bucket."  (relight pipeline)
// the thief carries the bucket at his side and shushes the viewer; the Bologna guard sleeps behind him; the well is in the distance
const THIEF_X = 500, THIEF_Y = 2190, THIEF_S = 1.28, HS = 1.55;
const SB = SKO, SKB = 'olive';
function heroFrame(t = 0) {
  // right arm hangs; the fist closes on the handle (hand redrawn over the prop)
  const GA = gripArm(tArm, 1, [194, -598], { hs: HS, bend: -1, hand: 'hold' });
  const F = fistAt(GA, HS);
  // left arm: elbow in, finger to the lips (the hand is redrawn on top of the face)
  const LA0 = tArm(-1, [6, -902], 'none', { hs: HS });
  const LA = { ...aim(LA0, -90), gh: 'hush', front: true };   // the arm crosses the body: its upper arm is drawn in front of the surcoat
  const thief = manb(THIEF_X, THIEF_Y, THIEF_S, THIEF, { smirk: 1.0, side: .6, bIn: -6, bOut: 8, lid: .5, look: 0, lookY: 0, turn: .0, tilt: -4,
    armR: GA, armL: LA, breath: 0 });
  const held = atb(THIEF_X, THIEF_Y, THIEF_S, bucketProp(F[0], F[1] - 2, .94, { rot: -2 }) + handShadow(GA, 1, SB, SKB, HS, -3, 5, .35) + gripHandOn(GA, 1, SB, SKB, HS) + cuffOver(GA, THIEF_SLEEVE)
    + handShadow(LA, -1, SB, SKB, HS, -8, 11, .62) + gripHandOn(LA, -1, SB, SKB, HS) + cuffOver(LA, THIEF_SLEEVE), 0);
  const guard = manb(120, 2190, 1.12, WATCHMAN, { lid: 2, smirk: -.2, talk: .14, tilt: 9, bIn: 4, bOut: 2, turn: .15, armL: gArm(-1, [-170, -520], 'back', { bend: 1 }), armR: gHang(1) });
  return { thief, held, guard, GA, LA, F };
}
const SHOTS = [{ at: 0, draw(v, t) {
  const C = camT(0, 540, 1010, 1.1, { hh: 0 });
  const H = heroFrame(t);
  return `<g transform="${C.tf}">
    ${lights(C.v, RIG.cine(0))}
    ${villageSunset({ t: 0, blur: 'dofHeavy' })}
    <g filter="url(#dofLight)">${outlined(textured(H.guard))}</g>
    ${outlined(textured(H.thief + H.held), 0, { px: 1.3, col: '#1a120c', op: .5 })}
  </g>`; } }];
TL = makeTimeline({ shots: SHOTS, trans: [], words: [], strong: [], captions: 'none', fps: 30, duration: 7 });
render(0);
