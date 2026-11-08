// "The Worm" part 2: river -> inside the leg (the snap, the venom) -> sunrise -> the healer's hut, thirty days -> the ambulance.
(function (G) {
  const X = G.ENG, Q = G.QCAST, S = G.SETS, PR = G.PROPS, C = G.CINE, R = G.RIG, E = G.SHOTS_E;
  const { track: TK, ss, clamp, lerp, EZ } = X;
  const { f, mix } = R;
  const { wave, sbob, env, bump, idle, hh, scr, rot, nrm, L2, gripAt, gripPt, fingersFor, place, armsOver, L5, blur } = E;
  const D2R = Math.PI / 180, lit = X.lit;
  const L6 = {
    river: { from: [-0.7, -0.8], shadow: '#3a3a40', shadowOp: 0.45, floor: '#3a4a50', floorOp: 0.3, contactOp: 0.3, key: '#fff4e0', keyAdd: 0.06, rims: [{ from: [1, -0.4], col: '#f0f8ff', w: 6, op: 0.45 }], face: { col: '#fff4e8', op: 0.12 } },
    hut: { from: [-0.8, -0.5], shadow: '#1e140e', shadowOp: 0.55, floor: '#2a1e14', floorOp: 0.35, contactOp: 0.5, key: '#ffc890', keyAdd: 0.1, rims: [{ from: [-1, -0.5], col: '#ffb070', w: 7, op: 0.55 }, { from: [1, -0.6], col: '#fff0d0', w: 5, op: 0.35 }], face: { col: '#ffd8a8', op: 0.18 } },
  };
  const DYOU = Object.assign({}, R.DIMS.man, { shX: 160, wX: 128, hemX: 150, sw: 80, hand: 112 });

  // ======================================================= W5a / W5c  the river, seen from the bank (18.80 - 21.30, 26.15 - 27.65)
  // he limps in up to his shins; later, after the slap, the healer stands over him lecturing. His own legs carry the sore.
  const W5 = {}, W6 = {};
  {
    const WY = 1500, YS = 0.66, HX = 790;
    const yX = TK([[18.8, 160], [20.0, 430, 'sine'], [27.65, 440]]), yY = TK([[18.8, 1500], [20.0, 1506], [20.45, 1660, 'io'], [27.65, 1660]]);
    const wl = R.woundPt(DYOU, 1);
    const cam = TK([[18.8, [380, 1180, 1.0, 0]], [20.0, [470, 1250, 1.25, 0], 'sine'], [20.6, [452, 1440, 1.9, 0], 'io'], [21.3, [470, 1560, 2.7, 0], 'in2'],
      [26.15, [520, 1400, 2.2, 0]], [26.6, [575, 1270, 1.5, 0], 'out2'], [27.2, [600, 1210, 1.35, 0], 'sine'], [27.65, [610, 1190, 1.42, 0]]]);
    W5.focus = tt => scr([440 + wl[0] * YS, 1660 + wl[1] * YS], cam(tt));
    const river = t => {
      const c0 = cam(t), c = hh(c0, t, 0.35, 5);
      const L = L6.river;
      const set = S.river(t, { waterY: WY });
      const x = yX(t), y = yY(t), limp = t < 20.4 ? sbob(t, 0.9) : 0;
      const relief = ss(20.8, 21.2, t), after = t > 26;
      const yO = Object.assign(idle(t, 1), { x, y: y + limp * 14, s: YS, sway: -limp * 3, tilt: -limp * 4 });
      const yFace = after ? { expr: 'fear', wide: true, mouth: 'parted', open: 0.25, look: [0.7, -0.1] } : t < 20.6 ? { expr: 'grief', mouth: 'tight', lid: 0.55, brows: [-10, 3] } : relief > 0.3 ? { expr: 'tired', lid: 0.7, mouth: 'parted', open: 0.15 } : { expr: 'fear', mouth: 'tight', lid: 0.3 };
      const legFx = { s: 1, heat: after ? 0 : 1 - ss(20.6, 21.4, t), blister: after ? 0 : 0.95, wound: after ? 1 : 0, wet: ss(20.4, 20.8, t) };
      const you = Q.you(Object.assign(yO, { face: yFace, armR: { hand: [-150, -620], pose: 'relaxed' }, armL: after ? { hand: [170, -700], pose: 'fist' } : { hand: [150, -620], pose: 'relaxed' }, legFx }));
      let healer = '';
      if (after) {
        const hO = Object.assign(idle(t, 7), { x: HX, y: 1670, s: 0.64, tilt: -4 });
        healer = lit(Q.healer(Object.assign(hO, { face: { expr: 'stern', look: [-0.7, 0.2], mouth: 'talk', open: Q.talk(t, 0.3, 7), brows: [8, -4] }, armR: { hand: [-200, -1180 + wave(t, 2) * 20], pose: 'point', facing: 'back' } })), L);
      }
      // the worm hanging from the open sore after the slap
      let close = '';
      if (after) { const wP = R.toWorld(yO, wl), pts = []; for (let i = 0; i <= 10; i++) { const u = i / 10; pts.push([wP[0] + u * 14 + Math.sin(t * 5 + u * 5) * 3 * u, wP[1] + u * 22]); } close += PR.worm(pts, 3, { head: true }); }
      // steam where the hot ankle meets the cold water
      const steam = env(t, 20.4, 20.6, 21.3, 21.7), wx = x + 54 * YS;
      for (let i = 0; i < 6; i++) { const ph = (t * 1.4 + i / 6) % 1; close += `<ellipse cx="${f(wx + (i - 3) * 12 + Math.sin(t * 3 + i) * 5)}" cy="${f(WY - 6 - ph * 90)}" rx="${f(8 + ph * 18)}" ry="${f(12 + ph * 22)}" fill="#f0f0f0" opacity="${f(0.5 * steam * Math.sin(Math.PI * ph))}" filter="url(#b4)"/>`; }
      const rip = ss(20.3, 20.5, t);
      let front = `<rect x="-1500" y="${WY}" width="4200" height="2400" fill="#2a5a6a" opacity="0.45"/>`;
      front += `<ellipse cx="${f(x)}" cy="${WY + 2}" rx="${f(70 + ((t * 40) % 60))}" ry="${f(8 + ((t * 8) % 12))}" fill="none" stroke="#e8f8ff" stroke-width="2" opacity="${f(0.6 * rip)}"/>`;
      if (after) front += `<ellipse cx="${HX}" cy="${WY + 2}" rx="${f(80 + ((t * 30) % 50))}" ry="10" fill="none" stroke="#e8f8ff" stroke-width="2" opacity="0.5"/>`;
      front += S.surface(t, WY).replace('opacity="0.35"', 'opacity="0"');
      const splash = env(t, 20.3, 20.4, 20.6, 20.9);
      for (let i = 0; i < 10; i++) front += `<circle cx="${f(wx + Math.cos(i) * 40 * (1 + splash))}" cy="${f(WY - 20 * splash - Math.abs(Math.sin(i * 2)) * 60 * splash)}" r="4" fill="#e8f8ff" opacity="${f(splash)}"/>`;
      const layers = [...set.slice(0, 3), set[3], { p: 1, svg: lit(you, L) + healer + close, chars: true }, { p: 1, svg: front }];
      return X.compose(layers, c) + C.vignette(0.4, '#020a10', 0.5);
    };
    X.shot('W5a', 18.8, 21.3, river, { grade: 'gDay' });
    X.shot('W5c', 26.15, 27.65, river, { grade: 'gDay' });
  }
  X.tr('heat', 19.1, 0.6, 'W4', 'W5a', {});

  // ======================================================= W5b  underwater close-up of the ankle (20.80 - 26.65)
  // a split-level view: shin in the air above the waterline, ankle and foot under it. The blister bursts, the worm's head
  // pushes out, his hand plunges in and pinches it, the healer's hand slaps it away.
  {
    const LS = 1.9, A = [470, 1150], SURF = A[1] - 381 * LS, BED = A[1] + 150 * LS + 6;
    const wP = [A[0] + PR.LEG_WOUND[0] * LS, A[1] + PR.LEG_WOUND[1] * LS], HS = 500;
    const cam = TK([[20.8, [540, 980, 1.0, 0]], [21.7, [560, 1180, 1.55, 0], 'io'], [22.2, [600, 1240, 1.7, 2], 'sine'], [23.7, [640, 1230, 1.5, -2], 'sine'], [24.4, [580, 1080, 1.15, 0], 'io'], [25.9, [560, 980, 1.05, 2], 'sine'], [26.65, [540, 900, 1.12, 0], 'out2']]);
    const r = R.rng(77), PEB = Array.from({ length: 34 }, () => [r() * 2200 - 600, BED + 10 + r() * 120, 18 + r() * 36, (r() * 3) | 0]), MOTE = Array.from({ length: 40 }, () => [r() * 1800 - 400, SURF + r() * 1100, 2 + r() * 5, r()]);
    X.shot('W5b', 20.8, 26.65, t => {
      const shake = env(t, 21.74, 21.78, 21.95, 22.2) * Math.sin(t * 60) * 7 + env(t, 25.98, 26.02, 26.15, 26.45) * Math.sin(t * 70) * 9;
      const c0 = cam(t), c = hh([c0[0] + shake, c0[1], c0[2], c0[3]], t, 0.3, 11);
      // ---- air above the waterline: a soft, defocused river bank
      let air = `<defs><linearGradient id="w5air" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9cc4d8"/><stop offset="1" stop-color="#e8e0c8"/></linearGradient></defs><rect x="-1500" y="-1500" width="4200" height="5000" fill="url(#w5air)"/>`;
      air += `<g filter="url(#dof2)"><path d="M-1500,${f(SURF - 120)} Q0,${f(SURF - 220)} 800,${f(SURF - 150)} T2700,${f(SURF - 160)} L2700,${f(SURF)} L-1500,${f(SURF)}Z" fill="#8a7a5a"/>` + Array.from({ length: 30 }, (_, i) => `<path d="M${-1300 + i * 130},${f(SURF)} q${f(Math.sin(t + i) * 10)},-180 ${f(Math.sin(t * 1.3 + i) * 18)},-${200 + (i % 4) * 70}" stroke="${['#4a6a2a', '#6a8a3a', '#3a5a24'][i % 3]}" stroke-width="10" fill="none"/>`).join('') + `</g>`;
      // ---- under the water: depth gradient, light shafts, the bed of sand and pebbles, drifting motes
      let water = `<defs><linearGradient id="w5uw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a9aa8"/><stop offset="1" stop-color="#16343e"/></linearGradient></defs><rect x="-1500" y="${f(SURF)}" width="4200" height="3000" fill="url(#w5uw)"/>`;
      for (let i = 0; i < 7; i++) { const x = -500 + i * 330 + Math.sin(t * 0.6 + i) * 50; water += `<path d="M${f(x)},${f(SURF)} L${f(x + 110)},${f(SURF)} L${f(x + 360)},${f(BED + 200)} L${f(x + 150)},${f(BED + 200)}Z" fill="#d8fbff" opacity="0.07"/>`; }
      water += `<rect x="-1500" y="${f(BED)}" width="4200" height="1400" fill="#7a6a4c" filter="url(#ground)"/>`;
      for (const [x, y, rr, k] of PEB) water += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rr)}" ry="${f(rr * 0.55)}" fill="${['#6a6050', '#8a8070', '#5a5040'][k]}" stroke="#2a2418" stroke-width="2"/>`;
      // ---- the leg (his lower leg, standing on the bed), the sore
      const burst = ss(21.72, 21.85, t), grow = ss(21.95, 23.6, t);
      const leg = `<g transform="translate(${A[0]},${A[1]}) scale(${LS})">${PR.legClose({ skin: '#9c6a46', heat: 0.3 * (1 - ss(20.8, 21.6, t)), blister: (1 - burst) * (0.95 + Math.sin(t * 9) * 0.03), wound: burst, wet: 1 })}</g>`;
      // ---- the worm: out of the sore, drifting with the current; pinched, pulled up, slapped free, recoiling
      const head0 = [wP[0] + 30 + grow * 150, wP[1] + 10 + grow * 70 + Math.sin(t * 2.4) * 16 * grow];
      const handP = TK([[23.95, [wP[0] - 80, SURF - 300]], [24.35, [head0[0] + 4, head0[1] - 4], 'out2'], [26.0, [wP[0] + 40, SURF + 110], 'sine'], [26.3, [wP[0] - 360, SURF - 520], 'out2']])(t);
      const pinched = t > 24.35 && t < 26.02;
      const tip = pinched ? handP : (t >= 26.02 ? L2([wP[0] + 40, SURF + 110], [wP[0] + 90, wP[1] + 60], EZ.out2(clamp((t - 26.02) / 0.4))) : head0);
      const wpts = []; for (let i = 0; i <= 18; i++) { const u = i / 18, bend = Math.sin(u * Math.PI) * (pinched ? 10 : 34) * Math.sin(t * 5 + u * 5); wpts.push([lerp(wP[0], tip[0], u) + bend, lerp(wP[1], tip[1], u) - bend * 0.4]); }
      let fx = '';
      if (t > 21.9) fx += PR.worm(wpts, 15, { head: true, len: t < 24.35 ? Math.max(0.04, grow) : 1 });
      // the milky burst of larvae from the sore
      if (t > 21.72) for (let i = 0; i < 14; i++) { const ph = clamp((t - 21.72 - i * 0.08) / 2.6); if (ph > 0 && ph < 1) fx += `<circle cx="${f(wP[0] + 30 + ph * (160 + i * 14) * Math.cos(i * 0.9 - 0.4))}" cy="${f(wP[1] - 10 + ph * 110 * Math.sin(i * 1.7))}" r="${f(14 + ph * 60)}" fill="#f4f8f0" opacity="${f(0.42 * (1 - ph))}" filter="url(#b8)"/>`; }
      // his hand plunging in from above the surface
      if (t > 23.95 && t < 26.55) {
        const away = ss(26.0, 26.3, t), d = nrm(L2([0.2, 1], [-0.5, -0.86], away));
        const wrist = PR.wristFor(handP, d, HS);
        fx += PR.closeArm({ from: [wrist[0] - d[0] * 900, wrist[1] - d[1] * 900], wrist, dir: d, side: 'L', facing: 'back', pose: pinched ? 'grip' : 'open', size: HS, skin: '#9c6a46' });
      }
      // the healer's palm swinging in from the right
      if (t > 25.5 && t < 26.6) {
        const sw = EZ.in2(clamp((t - 25.55) / 0.45)), back = ss(26.05, 26.6, t), dd = nrm([-0.9, 0.42]);
        const target = [wP[0] + 230, SURF + 60], start = [wP[0] + 1300, SURF - 380];
        const hp = L2(L2(start, target, sw), [wP[0] + 1500, SURF - 600], back);
        fx += PR.closeArm({ from: [hp[0] - dd[0] * 900, hp[1] - dd[1] * 900], wrist: hp, dir: dd, side: 'R', facing: 'palm', pose: 'open', size: HS * 1.04, skin: '#7e5234', sleeve: '#524028' });
        if (t > 25.98 && t < 26.12) fx += C.radial(target[0] - 60, target[1], 260, '#ffffff', 0.55 * (1 - Math.abs(t - 26.04) / 0.08));
      }
      // bubbles: a stream from the sore, and splashes where hands break the surface
      for (let i = 0; i < 18; i++) { const ph = ((t * 0.7 + i / 18) % 1); const bx = wP[0] + 20 + Math.sin(i * 3.3 + t * 2) * 30, by = lerp(wP[1], SURF, ph); if (t > 21.72) fx += `<circle cx="${f(bx)}" cy="${f(by)}" r="${f(4 + (i % 4) * 3)}" fill="none" stroke="#e8fbff" stroke-width="2" opacity="${f(0.6 * (1 - ph))}"/>`; }
      const plunge = env(t, 23.9, 24.0, 24.3, 24.8) + env(t, 25.95, 26.02, 26.2, 26.6);
      // ---- in front: the water tint below the line, the bright waterline itself, motes
      let front = `<rect x="-1500" y="${f(SURF)}" width="4200" height="3000" fill="#2a6a7a" opacity="0.3"/>`;
      let wl = `M-1500,${f(SURF)}`; for (let x = -1500; x <= 2700; x += 40) wl += ` L${x},${f(SURF + Math.sin(x * 0.01 + t * 2.6) * 9 + Math.sin(x * 0.027 - t * 3.1) * 4)}`;
      front += `<path d="${wl}" stroke="#ffffff" stroke-width="7" fill="none" opacity="0.85"/><path d="${wl} L2700,${f(SURF + 70)} L-1500,${f(SURF + 70)}Z" fill="#cfefff" opacity="0.18"/>`;
      if (plunge > 0) for (let i = 0; i < 16; i++) front += `<circle cx="${f(wP[0] - 80 + i * 40 + Math.sin(i) * 20)}" cy="${f(SURF - Math.abs(Math.sin(i * 2.1)) * 90 * plunge)}" r="${f(5 + (i % 3) * 3)}" fill="#e8fbff" opacity="${f(0.8 * plunge)}"/>`;
      for (const [x, y, rr, k] of MOTE) { const yy = y + Math.sin(t * 0.5 + k * 9) * 30, xx = x + ((t * 40 * (0.5 + k)) % 300); front += `<circle cx="${f(xx)}" cy="${f(yy)}" r="${f(rr)}" fill="#e8f4e8" opacity="${f(0.25 + 0.2 * k)}"/>`; }
      const g = X.compose([{ p: 0.6, svg: air }, { p: 1, svg: water }, { p: 1, svg: leg + fx }, { p: 1, svg: front }], c);
      return g + C.vignette(0.45, '#04121a', 0.45);
    }, { grade: 'gDay' });
  }
  X.tr('surface', 21.05, 0.5, 'W5a', 'W5b', { dir: 1 });
  X.tr('surface', 26.4, 0.5, 'W5b', 'W5c', { dir: -1, seed: 9 });


  // ======================================================= W6  inside the leg: the worm snaps, the venom spreads (26.95 - 31.65)
  {
    const SK = S.FLESH_SKIN_Y, B = [560, SK - 4], T = [520, 2950], MID = 0.5;
    const cam = TK([[26.95, [560, 3880, 1.2, 0]], [28.0, [552, 3760, 1.6, 0], 'sine'], [28.2, [548, 3700, 1.85, 0]], [29.0, [540, 3560, 1.4, -3], 'io'], [30.6, [540, 2760, 1.0, 4], 'io'], [31.65, [540, 2500, 1.5, 0], 'in2']]);
    // the stretched worm: a taut strand from the sore up into the leg; tension makes it straighten and hum, then it tears
    const strand = (t, u0, u1, off) => { const pts = []; for (let i = 0; i <= 24; i++) { const u = lerp(u0, u1, i / 24), ten = ss(27.0, 28.0, t); pts.push([lerp(B[0], T[0], u) + Math.sin(u * Math.PI * 2) * 60 * (1 - ten) + Math.sin(t * 70 + u * 20) * 5 * ten * (t < 28.05 ? 1 : 0) + (off ? off(u) : 0), lerp(B[1], T[1], u)]); } return pts; };
    const M = [lerp(B[0], T[0], MID), lerp(B[1], T[1], MID)];
    const venomAt = t => { const s = ss(28.05, 28.4, t); return [M[0] - 10 * s, M[1] - 260 * s]; };
    W6.focus = tt => scr(M, cam(tt));
    X.shot('W6', 26.95, 31.65, t => {
      const shake = env(t, 28.04, 28.08, 28.25, 28.6) * Math.sin(t * 80) * 8;
      const c0 = cam(t), c = hh([c0[0] + shake, c0[1], c0[2], c0[3]], t, 0.3, 6);
      const snap = ss(28.05, 28.35, t), venom = ss(28.7, 30.7, t), dark = ss(30.75, 31.55, t);
      const va = venomAt(t);
      const set = S.flesh(t, { venom, venomAt: va });
      let w = '';
      if (t < 28.05) w += PR.worm(strand(t, 0, 1), 26, { shadow: 1 });
      else {
        // lower half whips back toward the sore; upper half recoils up into the leg and curls
        const lo = strand(t, 0, lerp(MID, 0.18, snap), u => Math.sin(u * 30 + t * 8) * 26 * snap);
        const hi = strand(t, lerp(MID, 0.78, snap), 1, u => Math.sin(u * 26 - t * 6) * 34 * snap).map(([x, y]) => [x, y - 120 * snap]);
        w += PR.worm(lo, 26, { shadow: 1, head: true }) + PR.worm(hi, 26, { shadow: 1 });
        // milky burst at the tear
        const bt = clamp((t - 28.05) / 0.9);
        for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2 + 0.3, r = 30 + bt * (120 + (i % 4) * 50); w += `<circle cx="${f(M[0] + Math.cos(a) * r)}" cy="${f(M[1] + Math.sin(a) * r * 0.8)}" r="${f(6 + bt * 18)}" fill="#f6f0e4" opacity="${f(0.6 * (1 - bt))}" filter="url(#b4)"/>`; }
        w += C.radial(M[0], M[1], 380, '#ff4a3a', 0.55 * bump(t, 28.05, 1, 0.6), 'screen');
      }
      // the poison: dark clouds pouring out of the torn end and climbing the leg
      if (venom > 0) {
        for (let i = 0; i < 9; i++) {
          const k = clamp(venom * 1.3 - i * 0.07), a = i * 2.4, r = 60 + k * (180 + (i % 3) * 80);
          const cx = va[0] + Math.cos(a) * k * 120, cy = va[1] - k * (300 + i * 140) + Math.sin(a) * 40;
          if (k > 0) w += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="url(#w6ink)" opacity="${f(0.85 * k)}"/>`;
        }
        w = `<defs><radialGradient id="w6ink"><stop offset="0" stop-color="#0a0208"/><stop offset="0.55" stop-color="#1e0618" stop-opacity="0.85"/><stop offset="1" stop-color="#2a0a20" stop-opacity="0"/></radialGradient></defs>` + w;
      }
      const layers = [...set, { p: 1, svg: w }, S.fleshSkin(t, { press: 0, heat: 0, at: 560 }), S.fleshNear(t), S.fleshDust(t)];
      let g = X.compose(layers, c) + C.radial(300, 300, 1400, '#ff9070', 0.1 * (1 - venom), 'screen') + C.vignette(0.65 + 0.25 * venom, '#050003', 0.42 - 0.12 * venom);
      g += `<rect width="1080" height="1920" fill="#2a0618" opacity="${f(0.35 * venom)}" style="mix-blend-mode:multiply"/><rect width="1080" height="1920" fill="#040002" opacity="${f(dark)}"/>`;
      return g;
    });
  }
  X.tr('liquid', 27.3, 0.7, 'W5c', 'W6', { fa: W5.focus(27.3), fb: W6.focus(27.3), col: '#5a0810' });

  // ======================================================= W6S  ... and kill you by sunrise (31.15 - 32.60)
  {
    const cam = TK([[31.15, [540, 760, 1.18, 0]], [32.6, [540, 960, 1.0, 0], 'sine']]);
    X.shot('W6S', 31.15, 32.6, t => {
      const c = hh(cam(t), t, 0.25, 9);
      const sun = ss(31.2, 32.6, t), sy = lerp(1210, 1040, sun);
      let sky = `<defs><linearGradient id="w6sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c0a16"/><stop offset="0.45" stop-color="${mix('#2a1626', '#6a3a40', sun)}"/><stop offset="0.66" stop-color="${mix('#5a2a26', '#d8784a', sun)}"/><stop offset="1" stop-color="${mix('#3a1a16', '#f0a060', sun)}"/></linearGradient></defs><rect x="-1500" y="-1200" width="4200" height="2600" fill="url(#w6sky)"/>`;
      sky += `<circle cx="600" cy="${f(sy)}" r="66" fill="#ffe8b8" opacity="${f(0.4 + 0.6 * sun)}"/>` + C.radial(600, sy, 520, '#ff9a50', 0.45 * sun, 'screen');
      const far = `<g transform="translate(-1500,0)">${G.ENV.ridge(4200, 1400, 40, 21, '#140c10', 120)}</g>`;
      let mid = '';
      for (const [px, s] of [[-180, 1.0], [180, 0.8], [1180, 1.1]]) { mid += `<path d="M${px},1400 Q${px + 16},1060 ${px + 36},800" stroke="#07050a" stroke-width="${f(26 * s)}" fill="none"/>`; for (let k = 0; k < 7; k++) { const a = -Math.PI / 2 + (k - 3) * 0.5 + Math.sin(t + k) * 0.04; mid += `<path d="M${px + 36},800 q${f(Math.cos(a) * 170 * s)},${f(Math.sin(a) * 90 * s - 50)} ${f(Math.cos(a) * 300 * s)},${f(Math.sin(a) * 150 * s + 70)}" stroke="#07050a" stroke-width="${f(20 * s)}" fill="none" stroke-linecap="round"/>`; } }
      mid += `<path d="M640,1420 L640,1180 Q760,1080 880,1180 L880,1420Z" fill="#07050a"/><path d="M600,1190 L760,1060 L920,1190Z" fill="#07050a"/>`;
      const ground = `<rect x="-1500" y="1400" width="4200" height="1400" fill="#06040a"/>`;
      // his body on a mat in front of the door, lifeless
      const body = `<path d="M110,1300 L690,1300 L690,1316 L110,1316Z M130,1316 L146,1316 L146,1404 L130,1404Z M654,1316 L670,1316 L670,1404 L654,1404Z" fill="#06040a"/><g filter="url(#silhS)">${Q.you({ x: 650, y: 1248, s: 0.32, sway: -90, face: {} }).svg}</g>`;
      return X.compose([{ p: 0.2, svg: sky }, { p: 0.5, svg: far }, { p: 0.8, svg: mid }, { p: 1, svg: ground + body }], c) + C.vignette(0.55, '#000', 0.45);
    });
  }
  X.tr('organic', 31.4, 0.5, 'W6', 'W6S', { plain: true });

  // ======================================================= W7  the healer's hut: the twig, thirty days (32.00 - 45.60)
  // he sits on the mat with one leg stretched out on a block. The torso is the rig (its legs hidden), the tunic is draped over
  // the thigh down to the knee, and the lower leg continues straight out of the hem, so the leg is visibly his.
  {
    const YS = 0.66, YX = 330, SEAT = 1690, YY = SEAT + 700 * YS, CUT = SEAT + 36;
    const ANK = [880, 1640], LSH = 0.3, KNEE = [ANK[0] - 900 * LSH, ANK[1] + 45 * LSH];
    const wound = [ANK[0] + PR.LEG_WOUND[1] * LSH, ANK[1] - PR.LEG_WOUND[0] * LSH];
    const HX = 1100, HY = 2110, HS = 0.62, FLOOR = 1772;
    const cam = TK([[32.0, [620, 1420, 1.0, -2]], [33.1, [760, 1500, 1.45, 0], 'io'], [34.0, [890, 1585, 2.8, 2], 'io'], [35.8, [900, 1590, 3.05, -1], 'sine'], [36.2, [905, 1592, 3.25, 0], 'sine'],
      [36.55, [680, 1470, 2.2, -1], 'io'], [36.95, [430, 1320, 2.5, -3], 'io'], [37.7, [455, 1350, 2.05, -1], 'sine'], [38.6, [690, 1440, 1.04, 0], 'io'], [41.2, [720, 1440, 1.1, 2], 'sine'],
      [42.3, [430, 880, 1.45, -2], 'io'], [43.4, [690, 1430, 1.1, 2], 'io'], [44.1, [840, 1460, 1.6, 0], 'sine'], [44.9, [930, 1210, 2.3, 0], 'io'], [45.6, [935, 1130, 3.0, 0], 'in2']]);
    const coil = TK([[33.0, 0.02], [36.14, 0.04], [37.0, 0.12, 'io'], [41.2, 0.2], [44.1, 1.0, 'sine']]);
    const days = t => Math.floor(clamp((t - 41.2) / 2.9) * 30);
    const tunic = '#d9ceb2';
    // the tunic draped over the outstretched thigh: from under his skirt to the hem at the knee (thigh-sized, shaded like his lit torso)
    const lapPath = `M${YX + 30},${SEAT - 70} C${YX + 140},${SEAT - 84} ${KNEE[0] - 80},${KNEE[1] - 42} ${KNEE[0] + 24},${KNEE[1] - 36} ` +
      `L${KNEE[0] + 32},${KNEE[1] + 34} C${KNEE[0] - 70},${SEAT + 40} ${YX + 120},${SEAT + 44} ${YX + 20},${SEAT + 40}Z`;
    const lap = `<defs><linearGradient id="w7lap" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bdb296"/><stop offset="0.45" stop-color="#a0957a"/><stop offset="1" stop-color="#5e5444"/></linearGradient></defs>` +
      `<path d="M${YX + 10},${SEAT + 44} C${YX + 200},${SEAT + 58} ${KNEE[0] - 40},${SEAT + 56} ${KNEE[0] + 60},${SEAT + 46}" stroke="#140c06" stroke-width="18" fill="none" opacity="0.35" filter="url(#b4)"/>` +
      `<g filter="url(#clothS)"><path d="${lapPath}" fill="url(#w7lap)" stroke="#1f140c" stroke-width="2.5"/>` +
      [0.3, 0.55, 0.78].map(k => `<path d="M${f(lerp(YX + 70, KNEE[0] - 20, k))},${f(lerp(SEAT - 74, KNEE[1] - 38, k) + 6)} q${f(-14 + k * 8)},26 ${f(-4)},${f(58 - k * 18)}" stroke="#5a4e3c" stroke-width="5" fill="none" opacity="0.45" filter="url(#b2)"/>`).join('') +
      `<path d="M${YX + 60},${SEAT - 66} C${YX + 160},${SEAT - 76} ${KNEE[0] - 90},${KNEE[1] - 40} ${KNEE[0] + 10},${KNEE[1] - 32}" stroke="#ece2c8" stroke-width="4" fill="none" opacity="0.45"/><path d="M${KNEE[0] + 24},${KNEE[1] - 36} L${KNEE[0] + 32},${KNEE[1] + 34}" stroke="#4a3e2e" stroke-width="5" opacity="0.6"/></g>`;
    const mat = `<path d="M${YX - 420},${SEAT + 40} L${ANK[0] + 260},${SEAT + 40} L${ANK[0] + 320},${SEAT + 150} L${YX - 480},${SEAT + 150}Z" fill="#8a7444" stroke="#1f140c" stroke-width="2" filter="url(#cloth)"/>` +
      [0, 1, 2, 3, 4, 5].map(i => `<path d="M${YX - 440 + i * 4},${SEAT + 58 + i * 16} L${ANK[0] + 280 + i * 8},${SEAT + 58 + i * 16}" stroke="#5a4a2a" stroke-width="3" opacity="0.5"/>`).join('');
    const block = `<path d="M${ANK[0] - 70},${ANK[1] + 34} L${ANK[0] + 80},${ANK[1] + 34} L${ANK[0] + 92},${SEAT + 96} L${ANK[0] - 82},${SEAT + 96}Z" fill="#5a3a20" stroke="#1f140c" stroke-width="2" filter="url(#woodH)"/><path d="M${ANK[0] - 70},${ANK[1] + 34} L${ANK[0] + 80},${ANK[1] + 34}" stroke="#a07a50" stroke-width="4" opacity="0.6"/>`;
    X.shot('W7', 32.0, 45.6, t => {
      const c = hh(cam(t), t, 0.35, 7);
      const lapse = env(t, 41.15, 41.4, 43.9, 44.15), light = lapse > 0 ? 0.5 + 0.5 * Math.cos(Math.PI * 2 * (t - 41.2) / 0.48) : 0.85;
      const L = L6.hut;
      const set = S.hut(t, { light: lerp(0.85, light, lapse), tally: 0 });
      // chalk tally marks on the wall, one per day, sharp and pale so they read in the dark hut
      set.splice(1, 0, { p: 0.6, svg: t < 41.2 ? '' : PR.tally(360, 640, days(t), 1.5).split('#2a1c10').join('#e6dcc4') });
      // YOU sitting: flinches show in the face and the shoulders, the body stays seated
      const flinch = bump(t, 36.6, 1, 0.45) + bump(t, 38.4, 0.5, 0.35) + bump(t, 39.9, 0.5, 0.35);
      const yO = Object.assign(idle(t, 1, 0.3), { x: YX, y: YY, s: YS, sway: 0, tilt: -3 - flinch * 7 });
      const yFace = { expr: flinch > 0.3 ? 'grief' : 'anxious', mouth: flinch > 0.3 ? 'snarl' : 'tight', lid: flinch > 0.3 ? 0.7 : 0.3, look: flinch > 0.3 ? [0.3, 0.1] : [0.8, 0.35], brows: [-9, -2], sweat: 0.6 };
      const yArms = { armR: { hand: R.toLocal(yO, [YX - 165, SEAT - 50]), pose: 'fist', facing: 'back' }, armL: { hand: R.toLocal(yO, [YX + 175 + flinch * 6, SEAT - 112]), pose: 'fist', facing: 'back' } };
      const beard = ss(42.2, 43.6, t);
      const mk = Qf => Qf(Object.assign({}, yO, { noLegs: true, face: yFace }, yArms));
      const P0 = mk(Q.you), P1 = beard > 0 ? mk(Q.youBeard) : null;
      const torso = p => `<g clip-path="url(#w7cut)">${lit(p, L)}</g>`;
      let youSvg = torso(P0), youArms = armsOver(P0, L, 'RL');
      if (P1) { youSvg = `<g opacity="${f(1 - beard)}">${youSvg}</g><g opacity="${f(beard)}">${torso(P1)}</g>`; youArms = `<g opacity="${f(1 - beard)}">${youArms}</g><g opacity="${f(beard)}">${armsOver(P1, L, 'RL')}</g>`; }
      // the lower leg on the block; the sore heals over the thirty days
      const heal = ss(43.4, 44.6, t);
      const leg = `<g transform="translate(${ANK[0]},${ANK[1]}) rotate(-90) scale(${LSH})">${PR.legClose({ skin: '#8a5a3a', wound: lerp(0.8, 0.25, heal) })}</g>`;
      // the healer kneeling beyond the leg: the twig in his right hand, thread pinched in his left
      const present = lapse > 0 ? 0.55 + 0.45 * Math.cos(Math.PI * 2 * (t - 41.2) / 0.97) : 1;
      const lift = ss(44.15, 44.9, t);
      const hO = Object.assign(idle(t, 7, 0.3), { x: HX, y: HY - lift * 40, s: HS, tilt: 4 - lift * 6 });
      const turn = ss(36.2, 37.2, t) + Math.max(0, Math.sin((t - 37.8) * 2.4)) * ss(37.8, 38.3, t) * (1 - ss(41.1, 41.3, t));
      const restSlot = [wound[0] + 62, wound[1] - 30], upSlot = [965, 1150];
      const slot = L2(restSlot, upSlot, EZ.io(lift));
      const thumb = nrm(L2([-1, 0], [0, -1], lift)), d = fingersFor('R', 'back', thumb);
      const twig = PR.twig({ coil: coil(t), thread: t > 34.4 });
      const hArmR = gripAt(hO, 'healer', slot, d, { hold: `<g transform="translate(-40,0)">${twig}</g>`, holdRot: turn * 8 });
      const tie = env(t, 33.2, 33.5, 35.6, 35.9);
      const thrP = [restSlot[0] - 36 + Math.cos(t * 9) * 8 * tie, restSlot[1] - 18 + Math.sin(t * 9) * 6 * tie];
      const hArmL = lift > 0.01 || tie < 0.02 ? { hand: [120, -760], pose: 'relaxed' } : gripAt(hO, 'healer', thrP, [-0.4, 1], { facing: 'back' });
      const healerP = Q.healer(Object.assign(hO, { face: { expr: 'stern', look: lift > 0.5 ? [0, -0.6] : [-0.8, 0.5], lid: 0.45, mouth: 'closed' }, armR: hArmR, armL: hArmL }));
      const coilPt = gripPt(hO, 'healer', 'R', hArmR, 70 - 40 - (coil(t) * 26 * 1.4) + 20, 0);
      // the worm from the sore to the coil on the twig (shortens as it is wound in)
      const outLen = 1 - ss(41.2, 44.1, t) * 0.9;
      let worm = '';
      if (lift < 0.6) { const pts = []; for (let i = 0; i <= 12; i++) { const u = i / 12; pts.push([lerp(wound[0], coilPt[0], u), lerp(wound[1], coilPt[1], u) - Math.sin(u * Math.PI) * 10 * outLen]); } worm = `<g opacity="${f(1 - ss(0.3, 0.6, lift))}">${PR.worm(pts, 4.6, {})}</g>`; }
      let thread = '';
      if (tie > 0.02) thread = `<path d="M${f(thrP[0])},${f(thrP[1])} Q${f((thrP[0] + coilPt[0]) / 2)},${f(coilPt[1] - 24)} ${f(coilPt[0])},${f(coilPt[1])}" stroke="#e8dcc0" stroke-width="2" fill="none" opacity="${f(tie)}"/>` + [0, 1, 2].map(k => `<ellipse cx="${f(coilPt[0] + 3)}" cy="${f(coilPt[1])}" rx="6" ry="${f(7 + k * 2)}" fill="none" stroke="#e8dcc0" stroke-width="1.8" opacity="${f(tie * ss(33.6 + k * 0.5, 34.0 + k * 0.5, t))}"/>`).join('');
      // his robe pooled on the floor where he kneels
      const robe = `<path d="M${HX - 200},${FLOOR - 10} C${HX - 210},${FLOOR - 70} ${HX - 120},${FLOOR - 110} ${HX},${FLOOR - 110} C${HX + 120},${FLOOR - 110} ${HX + 210},${FLOOR - 70} ${HX + 200},${FLOOR - 10} Q${HX},${FLOOR + 20} ${HX - 200},${FLOOR - 10}Z" fill="#4a3a28" stroke="#1f140c" stroke-width="2" filter="url(#cloth)"/>`;
      const healerSvg = `<g opacity="${f(present)}"><g clip-path="url(#w7kneel)">${lit(healerP, L)}</g>${robe}</g>`;
      const defs = `<defs><clipPath id="w7cut"><rect x="-2000" y="-2000" width="6000" height="${f(CUT + 2000)}"/></clipPath><clipPath id="w7kneel"><rect x="-2000" y="-2000" width="6000" height="${f(FLOOR - 40 + 2000)}"/></clipPath></defs>`;
      const chars = defs + mat + healerSvg + block + leg + youSvg + lap + youArms + worm + thread + `<g opacity="${f(present)}">${armsOver(healerP, L, 'RL')}</g>`;
      const glow = lift > 0 ? C.radial(upSlot[0], upSlot[1], 240, '#fff4d0', 0.35 * lift) : '';
      return X.compose([...set, { p: 1, svg: chars + glow, chars: true }], c) + C.vignette(0.45, '#080402', 0.45);
    }, { grade: 'gDusk' });
    G.W7_TWIG = () => { const c = cam(45.25); return scr([958, 1140], c); };
  }
  X.tr('sweep', 32.3, 0.6, 'W6S', 'W7', { col: '#ffe8b0', dir: 1 });

  // ======================================================= W8  the symbol on every ambulance today (44.90 - end)
  {
    const AX = 540, AY = 1650, AS = 2.4, star = [AX - 60 * AS, AY - 470 * AS];
    const cam = TK([[44.9, [star[0], star[1], 4.4, 0]], [46.4, [star[0] + 6, star[1] + 40, 1.75, 2], 'io'], [48.0, [560, 1150, 0.5, 0], 'io'], [X.T_END, [585, 1120, 0.43, -1], 'sine']]);
    X.shot('W8', 44.9, X.T_END + 0.1, t => {
      const c = hh(cam(t), t, 0.3, 8);
      const set = S.city(t);
      const flash = bump(t, 48.35, 1, 0.5);
      const amb = PR.ambulance(AX, AY, AS, t, { lights: ss(45.6, 46.2, t) });
      const refl = `<g transform="translate(0,${2 * AY}) scale(1,-1)" opacity="0.18" filter="url(#b8)">${amb}</g>`;
      const g = X.compose([...set.slice(0, 2), { p: 1, svg: refl + amb }, ...set.slice(2)], c);
      return g + C.vignette(0.5, '#02030a', 0.45) + `<rect width="1080" height="1920" fill="#ffffff" opacity="${f(0.35 * flash)}" style="mix-blend-mode:screen"/>`;
    }, { grade: 'gNight' });
    X.tr('morph', 45.25, 0.7, 'W7', 'W8', { fa: G.W7_TWIG(), fb: scr(star, cam(45.25)), za: 1.4, zb: 1.25, col: '#cfe8ff' });
  }
})(window);
