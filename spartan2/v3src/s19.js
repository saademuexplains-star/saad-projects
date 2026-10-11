  // 19 "You survive all of it." — we push into his eyes; the years pass in one breath (the boy's face hardens into the
  //   young man's); we pull back out as his chin lifts
  { at: 33.27,
    draw(v, t) {
      const age = easeInOut(seg(t, 33.62, 33.98)), chin = easeOut(seg(t, 33.92, 34.45));
      const sc = kf(t, [[33.27, 1.3], [33.6, 2.4], [34.0, 2.46], [34.47, 1.28]]), fy = kf(t, [[33.27, 1000], [33.6, 935], [34.0, 935], [34.47, 1000]]);
      const C = camT(t, 540, fy, sc);
      return `<g transform="${C.tf}">
        ${lights(C.v, { ...RIG.barracks(t, { k: .8 }), lights: [{ pos: [-300, 700, 400], col: '#ffd0a0', int: 1.7, rad: 2000, shin: 26 }, { pos: [1300, 600, -200], col: '#c8d4f0', int: .8, rad: 1800, shin: 22 }], ambInt: .5 })}
        ${barracksDawn({ t, blur: 'dofHeavy' })}${tint('#3a2a2a', .35)}
        <g opacity="${(1 - age * age).toFixed(3)}">${kidb(540, 960 + 775 * 2.3, 2.3, BOY_BARE, { bIn: 4 + 6 * easeOut(seg(t, 33.3, 33.62)), bOut: -6, smirk: -.6, lid: .25, tilt: 0, blush: .3, lookY: 1, breath: br(t, 0) })}</g>
        <g opacity="${age.toFixed(3)}">${manb(540, 960 + 1075 * 2.3, 2.3, YOUTH, { bIn: -6, bOut: 4, smirk: -.3, lid: .3, tilt: 0, lookY: 1 - 2 * chin, breath: br(t, 0) })}</g>
      </g>`;
    } },

