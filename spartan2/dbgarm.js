const SHOTS = [{ at: 0, draw(v, t) {
  return `<rect width="1080" height="1920" fill="#334"/>` + kidb(540, 1500, 1.4, BOY, { armL: kArm(-1, [-46, -1004], 'open'), armR: kArm(1, [30, -840], 'fist') })
    + at(540, 1500 + 420, 1.4, `<g filter="url(#pk_olive)" fill="#c99468"><circle cx="300" cy="-700" r="40"/></g><circle cx="-300" cy="-700" r="40" fill="#c99468" filter="url(#pk_olive)"/>`);
} }];
TL = makeTimeline({ shots: SHOTS, trans: [], words: [], strong: [], captions: 'none', fps: 30, duration: 1 }); render(0);
