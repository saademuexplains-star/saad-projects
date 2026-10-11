  // 1 "You're seven when the soldiers come for you…" — wrapped in his blanket he listens in the dark (his eyes dart, a
  //   shadow crosses the light under the door, his brows creep up), BANG: the door bursts, he jolts and recoils, his mother
  //   bolts up and grabs his arm, pulling him to her, and a soldier strides in with a torch held high
  { at: 0,
    draw(v, t) {
      const open = easeOut(seg(t, .96, 1.18)), pull = easeInOut(seg(t, 1.0, 1.7)), [jx, jy] = shakeXY(t, [[.98, 18, .5]]);
      const step = easeInOut(seg(t, 1.38, 2.15)), flinch = decay(t, .98, .35), bang = t > .97, w0 = seg(t, 0, .5);
      const s = lerp(2.0, 1.02, pull) + B(t) * .5, fx = lerp(BX, 560, pull), fy = lerp(1110, 1000, pull);
      const C = camT(t, fx, fy, s, jx, jy);
      const look = bang ? lerp(10, 12, flinch) : kf(t, [[0, 8], [.28, 8], [.38, -4], [.56, -4], [.68, 10], [.97, 10]]);
      const turn = bang ? kf(t, [[.97, .3], [1.06, .85], [2.2, .7]]) : kf(t, [[0, 0], [.6, 0], [.82, .3]]);
      const worry = easeInOut(seg(t, .45, .9)) * (1 - seg(t, .97, 1.05));
      // the startle: a jolt up and a recoil away from the door; then his mother's pull draws him in to her
      const jolt = -46 * decay(t, .98, .1) + 14 * spring(t, 1.02, 2.2, .22);
      const recoil = -4.5 * easeOut(seg(t, .98, 1.1)) * (1 - easeInOut(seg(t, 1.45, 2.0))) + 1.4 * spring(t, 1.1, 2.6, .3);
      const drawIn = -26 * easeInOut(seg(t, 1.42, 1.86)), breath = br(t, 0, bang ? 2.4 : 1.3) * w0;
      const boy = boyHome({ shock: bang ? 1 : 0, bIn: 8 + 5 * worry + 6 * flinch, bOut: 6 + 6 * flinch, look, turn, smirk: -.5 - .45 * worry,
        tilt: -6 * flinch + sway(t, 0, 1) * w0 + 2.5 * worry, lid: blink(t, [.45]), talk: t > 1.2 ? .08 * Math.abs(Math.sin(t * 20)) : 0, breath, flap: 2.5 * spring(t, .99, 3, .35) });
      const onBoy = p => { const q = rotP(p, recoil, [BX, 2350]); return [q[0] + drawIn, q[1] + jolt]; };
      // the mother: asleep beside him; she bolts up and her left hand takes hold of his arm
      const rise = easeOut(seg(t, 1.05, 1.42)), mx = lerp(-150, 140, rise), my = lerp(2720, 2650, rise), reachM = easeOut(seg(t, 1.12, 1.4));
      const G = onBoy(toWorld(BOY_ARM, BX, 2830, 1.6, breath));
      const mA = pArm(-1, lerp2([-190, -700], toLocal([G[0] - 34, G[1] + 4], mx, my, 1.35), reachM), reachM > .9 ? 'fist' : 'open');
      const mom = momAt(mx, my, { lid: t < 1.05 ? 1.8 : .2, shock: t > 1.05 ? 1 : 0, bIn: t > 1.05 ? 12 : 0, bOut: t > 1.05 ? 10 : 0,
        tilt: lerp(14, 3, rise), turn: .5 * rise, look: 8 * rise, smirk: -.2, armL: mA });
      // one soldier strides in: torch held high, his free arm swinging with the step
      const st = stride(t, .5, 24), walking = step > 0 && step < 1, swing = walking ? Math.sin(t * 2 * Math.PI / .5 + 1.3) : 0;
      const s0 = lerp(.8, 1.0, step), x0 = lerp(930, 790, step), y0 = lerp(1580, 1690, step) - (walking ? st.bob * s0 : 0);
      const tArm = hArm(1, [150, -1120], 'fist'), tx = x0 + s0 * tArm.wr[0], ty = y0 + s0 * (tArm.wr[1] - 40);
      const sold = manb(x0, y0, s0, SOLDIER, { armR: tArm, armL: hArm(-1, [-184 + 24 * swing, -672 + 8 * Math.abs(swing)], 'relaxed'), tilt: sway(t, 0, .8), turn: -.25 * step, look: -8,
        ...(walking ? { legL: st.legL, legR: st.legR } : {}) });
      // a shadow passes the line of light under the door before it bursts
      const feet = seg(t, .4, .86), under = (1 - open) * flk(t, 2);
      return `<g transform="${C.tf}">
        ${lights(C.v, RIG.home(t, { door: open }))}
        ${homeNight({ t, open, blur: 'dofLight' })}
        <path d="M760 1490 L1080 1490 L1080 1500 L760 1500 Z" fill="#ffb060" opacity="${(.85 * under).toFixed(2)}"/>
        ${feet > 0 && feet < 1 ? `<rect x="${F1(lerp(740, 1060, feet))}" y="1486" width="70" height="16" fill="#120a06" opacity="${(.9 * under).toFixed(2)}"/>` : ''}
        ${open > .02 ? `<g opacity="${Math.min(1, open * 1.5).toFixed(2)}">${sold}${torch(tx, ty, t, { s: 1.0, seed: 5, glow: 1.2 })}</g>` : ''}
        ${puff(900, 1350, t, .98, { col: '#c8a880', r: 160, n: 8, seed: 4, dur: 1.2, op: .45 })}
        ${mom}
        <g transform="translate(${F1(drawIn)} ${F1(jolt)}) rotate(${F1(recoil)} ${BX} 2350)">${boy}</g>
        ${reachM > .9 ? gripHand(mx, my, 1.35, mA, -1, 1.35) : ''}
        ${floorMat}
      </g>`;
    } },

