  // 23 "and takes someone's seven year old son." — inside: the helmeted man fills the doorway and his hand reaches in;
  //   the mother clutches her boy's arm, then her hand is torn away and she is dragged back out of the light as we push
  //   into the boy's face — the first frame of the film
  { at: 42.71,
    draw(v, t) {
      const reach = easeInOut(seg(t, 42.8, 43.9)), push = easeInOut(seg(t, 43.3, 44.45)), clutch = easeOut(seg(t, 42.75, 43.1)), torn = easeIn(seg(t, 43.95, 44.25));
      const gone = easeInOut(seg(t, 44.0, 44.55)), settle = easeInOut(seg(t, 44.5, 45.2));
      const s = lerp(1.0, 2.0, push), fx = lerp(560, BX, push), fy = lerp(1000, 1110, push), endW = 1 - seg(t, 44.9, 45.4);
      const C = camT(t, fx, fy, s);
      const breath = br(t, 0, 1.4) * endW, yank = 12 * decay(t, 43.97, .12) * (t < 44.6 ? 1 : 0), fear = (t > 43.97 ? 1 : 0) * (1 - settle);
      const pose = { lid: blink(t, [43.2]), tilt: sway(t, 0, 1) * (1 - push), breath, look: lerp(10, 8, push), turn: .4 * (1 - push),
        shock: fear > .5 ? 1 : 0, bIn: 8 + 6 * fear, bOut: 6 + 4 * fear };
      // the mother holds his arm; torn away, she is dragged back out of frame, still reaching
      const mx = lerp(140, -160, gone), my = 2650 + 40 * gone;
      const G = toWorld(BOY_ARM, BX + yank, 2830, 1.6, breath);
      const momT = lerp2(lerp2([-190, -700], toLocal([G[0] - 34, G[1] + 4], mx, my, 1.35), clutch), [-60, -860], torn);
      const mA = pArm(-1, momT, torn > .3 ? 'open' : 'fist');
      return `<g transform="${C.tf}">
        ${lights(C.v, RIG.home(t, { door: 1 - push, spill: 1 - push }))}
        ${homeNight({ t, open: 1 - push, blur: 'dofLight' })}
        <g opacity="${(1 - push).toFixed(2)}">${torch(1060, 900, t, { s: 1.0, seed: 5, glow: 1.2 })}${at(860, 1690, 1.0, P({ ...SOLDIER, id: 'sx' }, { armL: hArm(-1, lerp2([-186, -680], [-310, -840], reach), reach > .3 ? 'open' : 'relaxed'), raiseRight: 6, turn: -.3 * reach, look: -8 }))}</g>
        ${momAt(mx, my, { lid: .15, shock: torn > .2 ? 1 : 0, bIn: 16, bOut: -2 + 10 * torn, smirk: -1.2, tear: 1, tilt: 6, look: 6, turn: .3, armL: mA })}
        <g transform="translate(${F1(yank)} 0)">${boyHome(pose)}</g>
        ${clutch > .5 && torn < .3 ? gripHand(mx, my, 1.35, mA, -1, 1.35) : ''}
        ${floorMat}
      </g>`;
    } },
