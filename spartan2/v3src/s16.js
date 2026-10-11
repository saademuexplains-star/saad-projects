  // 16 "Because you've seen what happens to boys who get caught." — a memory in hard sun: the priest hauls a caught boy
  //   toward the altar by the wrist; the boy leans back, kicking, his free arm flailing; our boy watches from the crowd,
  //   swallows, and flinches on CAUGHT
  { at: 26.66,
    draw(v, t) {
      const drag = easeInOut(seg(t, 26.7, 28.9)), flinch = decay(t, 28.63, .3), X = lerp(780, 600, drag), st = stride(t, .6, 18);
      const PY = 1900 - st.bob * .82, pb = br(t, 1);
      const pA = pArm(1, [232, -684 + 8 * Math.sin(t * 5)], 'fist');           // his right hand, low and behind him
      const G = toWorld(pA.wr, X, PY, .82, pb);                                // the grip
      const Tb = [-150, -1104], kick = Math.sin(t * 13), lean = -11 + 5 * Math.sin(t * 5.3);
      const bxp = G[0] - Tb[0] * .62, byp = G[1] - 186 - Tb[1] * .62;          // the boy placed so his raised hand sits in the grip
      const C = camT(t, 560, 1180, 1.1 + .06 * drag + B(t) * .4);
      return `<g transform="${C.tf}">
        ${lights(C.v, RIG.altar(t))}
        ${altarDay({ t, blur: 'dofHeavy' })}
        ${altarStone(330, 1640, .8, 0)}
        <g transform="rotate(${F1(lean)} ${F1(G[0])} ${F1(G[1])})">${kidb(bxp, byp, .62, { ...BOY_BARE, id: 'cb2' }, { armL: kArm(-1, Tb, 'fist'),
          armR: kArm(1, [170 + 40 * kick, -790 + 40 * Math.sin(t * 9)], 'open'), shock: 1, bIn: 14, bOut: 10, tilt: -6, look: -8, turn: -.3, talk: .2 + .1 * Math.abs(kick),
          legL: { lift: 40 * Math.max(0, kick) }, legR: { lift: 40 * Math.max(0, -kick) } })}</g>
        ${manb(X, PY, .82, PRIEST, { armR: pA, smirk: -.7, bIn: -10, bOut: 6, lid: .2, look: -8, turn: -.25, tilt: -6 + sway(t, 1, 1),
          legL: st.legL, legR: st.legR, breath: pb })}
        ${gripHand(X, PY, .82, pA, 1, 1.35, { b: pb })}
        ${kidb(250 - 18 * flinch, 2420, 1.5, { ...BOY_CAMP, faceExtra: boyFace(true) }, { look: lerp(10, 6, drag), lookY: -2, bIn: 14, bOut: 6, shock: flinch > .3 ? 1 : 0, smirk: -.9,
          lid: blink(t, [27.6, 28.64]), turn: .35 + .1 * drag, tilt: -4 * flinch + sway(t, 3, 1), tear: .6, talk: t > 27.9 && t < 28.05 ? .12 : 0, breath: br(t, 0, 1.8) })}
        ${tint('#e8c890', .2)}${tint('#ffffff', .06, 'screen')}
      </g>`;
    } },

