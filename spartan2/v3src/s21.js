  // 21 "to hunt slaves who did nothing wrong." — the young man steps out of the dark, knife low in his fist; the man at
  //   the hut turns, freezes, drops his jug (it shatters), raises his empty hands and backs away as the hunter comes on
  { at: 37.17,
    draw(v, t) {
      const p = seg(t, 37.2, 39.6), see = easeOut(seg(t, 37.9, 38.15)), back = easeInOut(seg(t, 38.6, 39.5)), hands = easeOut(seg(t, 38.15, 38.45));
      const stH = stride(t, .5, 16), drop = seg(t, 38.15, 38.42), broke = t > 38.42;
      const walk1 = seg(t, 37.17, 38.0), adv = easeInOut(seg(t, 38.62, 39.5)), walking = walk1 < 1 || (adv > 0 && adv < 1), st = stride(t, .62, 18);
      const hx = lerp(140, 240, easeOut(walk1)) + 40 * adv, hs = 1.5, hb = br(t, 0, 1.2), hy = 2700 - (walking ? st.bob * hs * .4 : 0);
      const kA = hArm(1, [232 + 6 * Math.sin(t * 2.2), -770], 'fist'), kc = fistC(kA, hx, hy, hs, hb, 1.45);
      const Hx = lerp(820, 890, back), Hy = 1440 - (back > 0 && back < 1 ? stH.bob * .62 : 0);
      const jugL = toWorld([-200, -560], Hx, Hy, .62);
      const jy = drop > 0 ? jugL[1] + 900 * drop * drop * .3 : jugL[1];
      const R = rng(21); let shards = '';
      if (broke) for (let i = 0; i < 9; i++) { const dt = t - 38.42, a = R() * Math.PI, v = 200 + R() * 260; shards += `<path d="M0 0 l${F1(8 + R() * 8)} ${F1(-4 + R() * 8)} l${F1(-4 - R() * 6)} ${F1(8 + R() * 6)}Z" fill="#a85a30" transform="translate(${F1(jugL[0] + Math.cos(a) * v * dt * (R() - .5) * 2)} ${F1(Math.min(1470, jugL[1] + 120 - Math.sin(a) * v * dt + 1400 * dt * dt))})"/>`; }
      const C = camT(t, lerp(560, 640, p), 1180, lerp(1.08, 1.2, p) + B(t) * .4);
      return `<g transform="${C.tf}">
        ${lights(C.v, RIG.field(t))}
        ${nightField({ t, blur: 'dofLight' })}
        ${manb(Hx, Hy, .62, HELOT, { shock: see > .5 ? 1 : 0, bIn: 12 * see, bOut: 10 * see, look: -9 * see, lookY: -2, turn: -.5 * see, tilt: -6 * back + sway(t, 1, 1) + tremble(t, 1.5 * see),
          armL: drop > 0 ? hArm(-1, lerp2([-200, -620], [-260, -1060], hands), hands > .3 ? 'open' : 'relaxed') : hArm(-1, [-200, -620], 'fist'),
          armR: hArm(1, lerp2([186, -668], [260, -1060], hands), hands > .3 ? 'open' : 'relaxed'),
          legL: back > 0 && back < 1 ? stH.legL : null, legR: back > 0 && back < 1 ? stH.legR : null, breath: br(t, 1, 2.4) })}
        ${!broke ? `<g transform="rotate(${F1(200 * drop)} ${F1(jugL[0])} ${F1(jy)})">${jug(jugL[0], jy, .5)}</g>` : shards}
        ${manb(hx, hy, hs, YOUTH, { turn: .5, look: 9, lookY: 2, bIn: -9, bOut: 4, smirk: -.35, lid: .35, tilt: 2 + (walking ? st.sway : 0), armR: kA,
          legL: walking ? st.legL : null, legR: walking ? st.legR : null, breath: hb })}
        ${knife(kc[0], kc[1] - 26, 8, .7, { glint: Math.max(bell(t, 37.6, 38.1), .6 * bell(t, 38.9, 39.3)) })}
        ${gripHand(hx, hy, hs, kA, 1, 1.45, { b: hb })}
      </g>`;
    } },

