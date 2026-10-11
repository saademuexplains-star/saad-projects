  // 20 "So at eighteen, they hand you a knife and send you into the night…" — the elder holds the knife out between them;
  //   the youth takes it, lifts it beside his face and looks at it (the blade flashes on KNIFE); on SEND the elder opens
  //   his hand toward the dark, the youth turns his eyes to it and the sky drains
  { at: 34.47,
    draw(v, t) {
      const offer = easeInOut(seg(t, 34.58, 35.0)), take = easeInOut(seg(t, 35.0, 35.28)), back = easeInOut(seg(t, 35.3, 35.66)), raise = easeInOut(seg(t, 35.4, 35.8));
      const glint = bell(t, 35.85, 36.25), night = easeInOut(seg(t, 36.3, 37.2)), send = easeInOut(seg(t, 36.28, 36.62)), turnY = easeInOut(seg(t, 36.42, 36.85));
      const EX = 230, EY = 2400, ES = 1.3, eb = br(t, 1), YX = 830, YY = 2520, YS = 1.45, yb = br(t, 0);
      const meet = [524, 1420];      // where the knife changes hands: in the open between them, chest-low
      // the elder's right arm: rest → knife held out → back to rest → (SEND) an open hand turned toward the dark
      const eRest = [182, -668], eOut = toLocal([meet[0] - 30, meet[1] - 10], EX, EY, ES, eb);
      const eT = send > 0 ? lerp2(eRest, [236, -730], send) : lerp2(lerp2(eRest, eOut, offer), eRest, back);
      const eA = hArm(1, eT, send > .3 ? 'open' : offer > .4 && back < .5 ? 'fist' : 'relaxed');
      // the youth's left arm: rest → closes on the knife → lifts it beside his face to look at it
      const yRest = [-182, -668], yTake = toLocal([meet[0] + 20, meet[1] + 34], YX, YY, YS, yb), yUp = [-130, -952];
      const yT = raise > 0 ? lerp2(yTake, yUp, raise) : lerp2(yRest, yTake, take);
      const yA = hArm(-1, yT, take > .6 ? 'fist' : 'open');
      const hand = easeInOut(seg(t, 35.12, 35.26)), fc = lerp2(fistC(eA, EX, EY, ES, eb, 1.45), fistC(yA, YX, YY, YS, yb, 1.45), hand);
      const krot = lerp(4, lerp(6, -6, raise), hand);
      const C = camT(t, 560, 1000, 1.05 + .15 * night + B(t) * .4);
      const dusk = RIG.dusk(t, { sun: [200, 1100], k: 1 - night }), moon = { pos: [900, 200, 600], col: '#b8c8ff', int: 1.1 * night, rad: 3000, shin: 26 };
      return `<g transform="${C.tf}">
        ${lights(C.v, { ...dusk, lights: [...dusk.lights, moon], amb: mix('#a090b4', '#5a6898', night), ambInt: lerp(.66, .5, night), shadowTint: mix('#2c3c52', '#18284a', night) })}
        ${riverDusk({ t, blur: 'dofHeavy' })}
        ${tint('#0a1030', (.72 * night).toFixed(2))}
        ${manb(EX, EY, ES, TRAINER, { smirk: .2, bIn: -6, bOut: 4, lid: .3, look: 8 + 2 * send, lookY: 2 - 2 * send, armR: eA, tilt: sway(t, 2, 1) + 3 * send, turn: .2 + .1 * send, breath: eb })}
        ${manb(YX, YY, YS, YOUTH, { bIn: -6, bOut: 2, smirk: -.4, lid: .3, look: lerp(lerp(-4, -7, raise), 9, turnY), lookY: lerp(lerp(4, 1, raise), -1, turnY) - 2 * night,
          tilt: sway(t, 4, 1) + 3 * raise * (1 - turnY), turn: lerp(-.2 - .1 * raise, .45, turnY), armL: yA, breath: yb })}
        ${offer > .3 ? knife(fc[0], fc[1] - 28, krot, .8, { glint }) : ''}
        ${hand > .5 ? gripHand(YX, YY, YS, yA, -1, 1.45, { b: yb }) : offer > .4 ? gripHand(EX, EY, ES, eA, 1, 1.45, { b: eb }) : ''}
      </g>`;
    } },

