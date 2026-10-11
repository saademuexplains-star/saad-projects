  // 2 "and your mother isn't allowed to cry." — her hand is closed round his; a soldier's grip drags it out of hers; her
  //   fingers chase it; her lip trembles, her breath hitches; on CRY she squeezes her eyes shut and one tear escapes anyway
  { at: 2.19,
    draw(v, t) {
      const pullAway = easeIn(seg(t, 2.85, 3.55)), shut = bell(t, 3.48, 4.08), s = 1.04 + .06 * seg(t, 2.19, 4.1) + B(t) * .4;
      const tear = easeOut(seg(t, 2.3, 3.2)), run = easeInOut(seg(t, 3.6, 4.1)), hitch = decay(t, 3.0, .12) + decay(t, 3.3, .1);
      const C = camT(t, 500, 900, s);
      const hx = lerp(690, 1240, pullAway), hy = 1640 + 40 * pullAway - 10 * Math.sin(t * 7) * (1 - pullAway);
      const chase = easeOut(seg(t, 2.95, 3.7)), held = pullAway < .05, my = 3260 - 8 * hitch, mb = br(t, 1, 1.8);
      // her one arm: the hand closed round his until the pull, then open and chasing after it
      const mW = held ? [hx - 6, hy - 40] : [lerp(684, 800, chase) + 5 * Math.sin(t * 9) * chase, lerp(1600, 1590, chase)];
      const mA = pArm(1, toLocal(mW, 430, my, 2.35, mb), held ? 'fist' : 'open');
      return `<g transform="${C.tf}">
        ${lights(C.v, RIG.home(t, { door: 1, spill: .6 }))}
        ${homeNight({ t, open: 1, blur: 'dofHeavy' })}
        <g filter="url(#dof)">${at(860, 2050, 1.25, P(SOLDIER, { tilt: -4, raiseLeft: 10, breath: br(t, 2) }))}</g>${torch(1100, 700, t, { s: 1.3, seed: 6, glow: .8 })}
        ${atb(430, my, 2.35, P(MOTHER, { smirk: -1.3, bIn: 15 + 3 * shut, bOut: -4, lid: .2 + 1.6 * shut, tear, tearRun: run, armR: mA,
          talk: .04 + .06 * Math.abs(Math.sin(t * 23)) * (1 - shut), tilt: -3 + sway(t, 1, .8) - 3 * shut, turn: .25 * chase * (1 - shut), look: 6 * (1 - shut) + 4 * chase, lookY: 3 }), mb)}
        <g transform="translate(${F1(hx)} ${F1(hy)})">${limb(40, 0, 440, 40, 70, 80, { S: OLV, sk: 'olive' })}${fist(0, 0, .85, 90, { S: OLV, sk: 'olive' })}
          ${pullAway > .01 ? fist(170, 26, 1.25, 80, { S: OLV, sk: 'olive' }) + limb(200, 30, 640, -40, 120, 140, { S: OLV, sk: 'olive' }) : ''}</g>
        ${held ? gripHand(430, my, 2.35, mA, 1, 1.35, { b: mb }) : ''}
      </g>`;
    } },

