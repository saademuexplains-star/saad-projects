// "The Stoker" part 2: clawing hands at the gap -> the foot rips out of the boot, the door slams -> the furnaces flood and the
// boilers explode -> the door bends behind you -> the stairs -> the boat deck: the warning shot, the gun, the gate. Loops to the boiler room.
(function (G) {
  const X = G.ENG, Q = G.QCAST, S = G.SETS, PR = G.PROPS, C = G.CINE, R = G.RIG, E = G.SHOTS_G, ST = G.STOKER;
  const { track: TK, ss, clamp, lerp, EZ } = X;
  const { f, mix } = R;
  const { sbob, env, bump, idle, hh, scr, nrm, L2, gripAt, gripPt, fingersFor, handsLit, CAM, shake } = E;
  const TAU = Math.PI * 2, D2R = Math.PI / 180, lit = X.lit;
  const LT = {
    safe: { from: [-0.5, -0.8], shadow: '#101418', shadowOp: 0.55, floor: '#1a1a1c', floorOp: 0.4, contactOp: 0.45, key: '#e8eef4', keyAdd: 0.05, rims: [{ from: [1, -0.3], col: '#ff5030', w: 6, op: 0.45 }], face: { col: '#f0f4f8', op: 0.12 } },
    stair: { from: [0.3, -1], shadow: '#14100e', shadowOp: 0.55, floor: '#1a1614', floorOp: 0.4, contactOp: 0.4, key: '#e8eef4', keyAdd: 0.05, rims: [{ from: [-1, 0.3], col: '#ff6040', w: 6, op: 0.45 }], face: { col: '#f0f0f0', op: 0.12 } },
    deck: { from: [-0.4, -0.9], shadow: '#06081a', shadowOp: 0.6, floor: '#141828', floorOp: 0.4, contactOp: 0.45, key: '#c8d8ff', keyAdd: 0.05, rims: [{ from: [1, -0.3], col: '#ffd890', w: 6, op: 0.4 }, { from: [-1, -0.5], col: '#a8c0ff', w: 5, op: 0.4 }], face: { col: '#e0e8ff', op: 0.12 } },
  };
  const SKIN = '#b8886a';
  // after the door: one boot left on the right foot, the left foot bare and bleeding
  const BOOT_R = '<path d="M14,-230 L98,-230 L104,-40 Q132,-22 150,6 L150,16 L4,16 L8,-40Z" fill="#2a1a10" stroke="#1a0e06" stroke-width="3"/><path d="M24,-200 L88,-200" stroke="#c8a878" stroke-width="5" opacity="0.7"/>';
  const ONE_BOOT = { feet: SKIN, frontProps: BOOT_R, legFx: { s: -1, wound: 1 } };

  // ======================================================= CLAW: the safe side; your boot pinned under the door; arms through the gap (24.8 - 30.4)
  {
    const { FY, X0, X1, TOP } = S.SAFE, DOORY = FY - 26, YS = 0.55, F = [370, 1671];
    const cam = CAM(
      [[24.8, [760, 1620, 0]], [26.1, [1020, 1740, 0], 'sine'], [27.6, [560, 1610, 0], 'io'], [29.0, [800, 1670, 0], 'sine'], [30.4, [390, 1645, 0], 'in2']],
      [[24.8, 1.0], [26.1, 1.6, 'sine'], [27.6, 1.4, 'io'], [29.0, 1.45, 'sine'], [30.4, 2.3, 'in2']]);
    ST.clawBoot = tt => scr([F[0], DOORY + 6], cam(tt));
    // the trapped men's arms: [x at the gap, target on you (local point), skin, start time]
    const ARMS = [[300, [-30, -470], '#c0927a', 26.3], [430, [60, -880], '#a8724c', 26.6], [560, [-60, -1020], '#d8a888', 26.9], [690, [70, -1100], '#9a6a4a', 27.3]];
    const fn = t => {
      const c = hh(cam(t), t, 0.35, 7), L = LT.safe, set = S.doorSafe(t, { doorY: DOORY, flow: 1 });
      const pull = EZ.io(clamp((t - 28.7) / 0.9)) * (1 - 0.4 * EZ.io(clamp((t - 29.7) / 0.6)));
      const yO = Object.assign(idle(t, 1, 0.3), { x: F[0] - pull * 26, y: F[1], s: YS, sway: 100 + Math.sin(t * 7) * 1.2 * ss(25.2, 25.5, t), tilt: -4 });
      const fierce = ss(25.15, 25.5, t);
      const claw = k => [lerp(-90, -40, k) + Math.sin(t * 6 + k * 3) * 20, -1480 + Math.sin(t * 6 + k * 3) * 50];
      const you = Q.you(Object.assign(yO, {
        face: { expr: 'fear', mouth: 'snarl', look: L2([0, 0.85], [0, -0.5], fierce), lid: 0.35, brows: L2([-16, 6], [10, -4], fierce), sweat: true, tears: true },
        armR: { hand: claw(0), pose: Math.sin(t * 6) > 0 ? 'grip' : 'open', facing: 'palm', dir: [0, -1] }, armL: { hand: claw(1), pose: Math.sin(t * 6 + 3) > 0 ? 'grip' : 'open', facing: 'palm', dir: [0, -1] },
      }));
      // the hands reaching out from under the door, gripping your shirt; clipped so they only show below the door's edge
      let arms = '';
      for (const [gx, lp, sk, t0] of ARMS) {
        const k = EZ.out2(clamp((t - t0) / 0.6)); if (k <= 0) continue;
        const target = R.toWorld(yO, lp), from = [gx, DOORY - 220], tip = L2([gx, DOORY + 20], target, k), d = nrm([tip[0] - from[0], tip[1] - from[1]]);
        const wrist = PR.wristFor(tip, d, 70), grab = t > t0 + 0.55;
        arms += PR.closeArm({ from, wrist, dir: d, side: gx < 500 ? 'R' : 'L', facing: 'back', pose: grab ? 'grip' : 'open', size: 70, skin: sk, sleeve: sk });
      }
      const clip = `<defs><clipPath id="clawC"><rect x="-1000" y="${DOORY - 4}" width="3000" height="900"/></clipPath></defs>`;
      // the door itself redrawn over the top of the pinned boot (clipped to the boot) so the edge visibly bites into it; red light leaks through the gap
      const strip = `<defs><clipPath id="bootC"><rect x="${F[0] - 90}" y="${DOORY - 300}" width="180" height="300"/></clipPath></defs><g clip-path="url(#bootC)">${PR.wtDoor(X0 + 6, DOORY - (FY - TOP), X1 - 6, DOORY, {})}</g>`;
      const glow = `<rect x="${X0}" y="${DOORY}" width="${X1 - X0}" height="${FY - DOORY}" fill="#ff3018" opacity="${f(0.35 + 0.25 * Math.sin(TAU * 2.2 * t))}" filter="url(#b4)"/>`;
      const body = `<g filter="url(#skinS)">${you.svg}</g>`;
      const layers = [set.wall, set.frame, set.door, set.floor, { p: 1, svg: glow + body + strip + clip + `<g clip-path="url(#clawC)">${arms}</g>`, chars: true }];
      return X.compose(layers, c) + C.vignette(0.5, '#040608', 0.45);
    };
    X.shot('CLAW', 24.8, 30.4, fn, { grade: 'gDusk' });
  }

  // ======================================================= RIP: close side view: the bare foot rips out of the boot; the door slams (29.7 - 34.2)
  {
    const A = [600, 1300], LS = 0.9, ROT = 80, DX0 = 480, DX1 = 660, SILL = 1640, PIN_Y = 1168;
    const ax = [Math.sin(ROT * D2R), -Math.cos(ROT * D2R)];   // ankle -> knee direction
    const pull = TK([[29.7, 0], [30.15, 6], [30.75, 70, 'in2'], [31.25, 360, 'out2'], [32.4, 470, 'sine'], [34.2, 520, 'sine']]);
    const doorB = TK([[29.7, PIN_Y], [32.85, PIN_Y + 6], [33.05, SILL - 12, 'in2'], [33.2, SILL - 20, 'out2'], [33.5, SILL - 14, 'sine']]);
    const cam = CAM(
      [[29.7, [600, 1260, 0]], [31.3, [760, 1230, 0], 'sine'], [32.7, [620, 1200, 0], 'sine'], [33.05, [580, 1330, 2], 'out2'], [34.2, [560, 1380, 0], 'sine']],
      [[29.7, 1.6], [31.3, 1.3, 'sine'], [32.7, 1.15, 'sine'], [33.05, 1.6, 'out2'], [34.2, 1.85, 'sine']]);
    ST.ripBoot = tt => scr([600, 1440], cam(tt));
    ST.ripCam = cam;
    const fn = t => {
      const slam = shake(t, 33.0, 0.6, 20), strain = env(t, 30.1, 30.3, 30.75, 30.9) * Math.sin(t * 50) * 4;
      const c0 = cam(t), c = hh([c0[0] + slam[0] + strain, c0[1] + slam[1], c0[2], c0[3]], t, 0.3, 8);
      const pl = pull(t), a = [A[0] + ax[0] * pl, A[1] + ax[1] * pl], crush = t < 30.75 ? 0.18 : lerp(0.18, 0.35, ss(30.75, 31.2, t)) + 0.65 * ss(32.9, 33.1, t);
      let back = `<rect x="-1500" y="-1500" width="${DX0 + 1500}" height="4000" fill="#0e2228"/>` + `<rect x="${DX1}" y="-1500" width="2500" height="4000" fill="#2a2c30"/>` + S.plates(DX1, 0, 2200, 1650, 240, 170, '#2e3034', 61) + P_lamp(t);
      back += `<rect x="-1500" y="${SILL}" width="4200" height="600" fill="#1a1816"/>`;
      // the leg (bare foot) slides out along its own axis; the boot stays pinned and is crushed flat by the slam
      const leg = `<g transform="translate(${f(a[0])},${f(a[1])}) rotate(${ROT}) scale(${LS})">${PR.legClose({ skin: SKIN, wound: ss(31.0, 31.4, t) * 0.6 })}${PR.trouserLeg('#4a443e', -260)}</g>`;
      const boot = `<g transform="translate(${A[0]},${A[1]}) rotate(${ROT}) scale(${LS})">${PR.boot({ crush, empty: pl > 300 })}</g>`;
      let blood = '';
      if (t > 31.1) for (let i = 0; i < 4; i++) { const ph = ((t * 0.8 + i * 0.27) % 1), p = [a[0] - 60 + i * 16, a[1] + 120]; blood += `<ellipse cx="${f(p[0])}" cy="${f(p[1] + ph * 160)}" rx="5" ry="${f(8 + ph * 6)}" fill="#8a0c0a" opacity="${f(0.9 * (1 - ph))}"/>`; }
      // water racing through the gap until the slam seals it
      const open = 1 - ss(32.95, 33.05, t);
      let water = `<rect x="-1500" y="-1500" width="${DX0 + 1500}" height="4000" fill="#0a2a34" opacity="0.5"/><rect x="${DX1}" y="1560" width="2500" height="200" fill="#1c3a44" opacity="${f(0.45 + 0.2 * open)}"/>`;
      for (let i = 0; i < 18; i++) { const ph = ((t * 1.6 + i / 18) % 1); water += `<ellipse cx="${f(DX1 + ph * 900)}" cy="${f(1560 - Math.sin(Math.PI * ph) * 60 * open + (i % 4) * 12)}" rx="${f(18 + ph * 30)}" ry="5" fill="#cfe8f0" opacity="${f(0.5 * open * Math.sin(Math.PI * ph))}"/>`; }
      // the slam: sparks and a burst of spray along the sill
      const sp = env(t, 33.0, 33.03, 33.15, 33.5);
      if (sp > 0) for (let i = 0; i < 20; i++) { const an = -Math.PI * (0.1 + 0.8 * (i / 19)), L0 = 60 + (i % 5) * 50; water += `<path d="M${f(570 + Math.cos(an) * 30)},${f(SILL - 6)} l${f(Math.cos(an) * L0 * sp)},${f(Math.sin(an) * L0 * sp)}" stroke="${i % 3 ? '#ffd070' : '#e8f4f8'}" stroke-width="3" opacity="${f(sp)}"/>`; }
      const slab = `<rect x="${DX0}" y="${f(doorB(t) - 2400)}" width="${DX1 - DX0}" height="2400" fill="#56585c" filter="url(#tex)" ${R.ol(3)}/><rect x="${DX0}" y="${f(doorB(t) - 30)}" width="${DX1 - DX0}" height="30" fill="#2a2c30"/>` + Array.from({ length: 10 }, (_, i) => `<circle cx="${(DX0 + DX1) / 2}" cy="${f(doorB(t) - 80 - i * 150)}" r="9" fill="#76787c"/>`).join('') + `<rect x="${DX0 - 30}" y="${SILL}" width="${DX1 - DX0 + 60}" height="40" fill="#2a2624" ${R.ol(2)}/>`;
      const layers = [{ p: 1, svg: back }, { p: 1, svg: `<g filter="url(#skinS)">${leg}</g>${boot}${blood}` }, { p: 1, svg: water + slab }];
      return X.compose(layers, c) + C.vignette(0.55, '#020608', 0.42);
    };
    const P_lamp = t => PR.cageLamp(1100, 700, 1.0, 1, '#e8eef4');
    X.shot('RIP', 29.7, 34.2, fn, { grade: 'gDusk' });
  }

  // ======================================================= FURN: the flooded side: water reaches the red-hot furnaces; the boilers explode (33.5 - 39.7)
  {
    const BC = [670, 780];
    const level = TK([[33.5, 1620], [36.0, 1330, 'sine'], [38.8, 1290, 'sine']]);
    const cam = CAM(
      [[33.5, [560, 1300, 0]], [34.8, [600, 1150, 0], 'out2'], [36.4, [760, 1230, 0], 'sine'], [37.8, [670, 900, 0], 'sine'], [38.75, [670, 850, 0], 'in2'], [39.7, [670, 840, 0], 'out2']],
      [[33.5, 1.5], [34.8, 1.05, 'out2'], [36.4, 1.35, 'sine'], [37.8, 1.15, 'sine'], [38.75, 1.5, 'in2'], [39.7, 1.9, 'out2']]);
    ST.furnCam = cam;
    const r0 = R.rng(77), SHARDS = Array.from({ length: 16 }, () => [r0() * Math.PI * 2, 500 + r0() * 900, 20 + r0() * 40, (r0() - 0.5) * 900]);
    const fn = t => {
      const bl = t - 38.85, boom = shake(t, 38.85, 0.9, 30), c0 = cam(t), c = hh([c0[0] + boom[0], c0[1] + boom[1], c0[2], c0[3]], t, 0.45, 9);
      const lv = level(t), hiss = ss(35.5, 36.2, t), blast = ss(38.85, 38.95, t);
      const set = S.boiler(t, { heat: 1 - 0.65 * hiss, steamF: hiss, blast: blast * 0.7 });
      const red = 0.55 + 0.45 * Math.sin(TAU * 2.2 * t);
      let fx = S.flood(t, lv, { seed: 9 });
      // coal and debris floating on the surge
      fx += PR.coalLumps(400 + Math.sin(t) * 60, lv + 6, 700, 10, 14, 4);
      // steam bursting where the water meets the furnace mouths
      for (const x of [-340, -20, 510, 830, 1360, 1680]) fx += S.steam(x, 1300, 600, t * 2.2, x, 0.7 * hiss);
      // the gauge needle spins as pressure climbs
      const gx = BC[0] + 340 * 0.42, gy = BC[1] - 340 * 0.4, ang = -2.2 + ss(36.5, 38.8, t) * 5 + Math.sin(t * 30) * 0.2 * ss(37.5, 38.8, t);
      fx += `<circle cx="${f(gx)}" cy="${f(gy)}" r="34" fill="#e8e0d0" ${R.ol(2)}/><path d="M${f(gx)},${f(gy)} l${f(Math.cos(ang) * 28)},${f(Math.sin(ang) * 28)}" stroke="#a01a0a" stroke-width="5"/>`;
      // the explosion: fireball and steam ring expanding from the middle boiler, flying plates
      if (bl > 0) {
        const k = clamp(bl / 0.8), R0 = 80 + 1500 * EZ.out2(k);
        fx += C.radial(BC[0], BC[1], R0 * 1.2, '#ffefc0', 0.85 * (1 - k * 0.7)) + C.radial(BC[0], BC[1], R0 * 0.8, '#ff8a20', 0.8 * (1 - k * 0.5), 'screen');
        for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, d = R0 * (0.5 + (i % 3) * 0.15); fx += `<ellipse cx="${f(BC[0] + Math.cos(a) * d)}" cy="${f(BC[1] + Math.sin(a) * d * 0.8)}" rx="${f(160 + R0 * 0.2)}" ry="${f(120 + R0 * 0.15)}" fill="${i % 2 ? '#ffb040' : '#5a4a40'}" opacity="${f(0.55 * (1 - k))}" filter="url(#b14)"/>`; }
        for (const [a, sp, sz, spin] of SHARDS) { const d = sp * bl, x = BC[0] + Math.cos(a) * d, y = BC[1] + Math.sin(a) * d + 300 * bl * bl; fx += `<g transform="translate(${f(x)},${f(y)}) rotate(${f(spin * bl)})"><path d="M${-sz},${-sz * 0.4} L${sz},${-sz * 0.6} L${sz * 0.6},${sz * 0.5} L${-sz * 0.8},${sz * 0.4}Z" fill="#2a2624" ${R.ol(1.4)}/></g>`; }
      }
      const wash = `<rect x="-1500" y="-1000" width="4200" height="4000" fill="#ff1a0a" opacity="${f(0.16 * red * (1 - blast))}" style="mix-blend-mode:multiply"/>`;
      const layers = [set.back, set.mid, set.boilers, set.floor, { p: 1, svg: fx + wash }];
      return X.compose(layers, c) + C.vignette(0.45, '#080202', 0.5);
    };
    X.shot('FURN', 33.5, 39.7, fn, { grade: 'gFeast' });
  }

  // ======================================================= BEND: the shock hits; the steel door bulges right behind your back (39.1 - 42.8)
  {
    const { FY } = S.SAFE;
    const cam = CAM(
      [[39.1, [540, 1250, 0]], [40.3, [560, 1260, 0], 'sine'], [41.6, [560, 1110, 0], 'sine'], [42.8, [560, 740, 0], 'in2']],
      [[39.1, 1.15], [40.3, 1.0, 'sine'], [41.6, 1.35, 'sine'], [42.8, 1.3, 'sine']]);
    const fn = t => {
      const hit = shake(t, 39.45, 1.0, 24), c0 = cam(t), c = hh([c0[0] + hit[0], c0[1] + hit[1], c0[2], c0[3]], t, 0.4, 10);
      const bulge = ss(39.45, 39.75, t) * 0.85 + 0.15 * ss(40.3, 41.0, t), L = LT.safe;
      const set = S.doorSafe(t, { doorY: FY, bulge });
      // you limp away from the door toward us; the shock throws you forward a step; you look back over your shoulder
      const walk = EZ.io(clamp((t - 39.1) / 3.4)), thrown = bump(t, 39.45, 1, 0.5);
      const yO = Object.assign(idle(t, 1), { x: 540 + thrown * 20, y: 1700 + walk * 120 + thrown * 30 + sbob(t, 0.8) * 10, s: lerp(0.6, 0.7, walk), sway: -thrown * 5 + Math.sin(t * 5) * 1.5, tilt: -10 * thrown + 6 * ss(40.6, 41.2, t) });
      const look = TK([[39.1, [0.1, 0.2]], [39.6, [-0.2, -0.3]], [40.6, [-0.6, -0.55]], [42.4, [-0.6, -0.5]]])(t);
      const you = Q.you(Object.assign(yO, ONE_BOOT, { face: { expr: 'fear', wide: true, mouth: 'snarl', look, brows: [-16, 6], sweat: true, tears: true },
        armR: { hand: [-220, -760 - thrown * 200], pose: 'open', facing: 'palm', dir: [-0.4, 1] }, armL: { hand: [210, -780 - thrown * 200], pose: 'open', facing: 'palm', dir: [0.4, 1] } }));
      // dust raining from the deckhead, sparks from popped rivets, steam jets from the seams, lamps swinging
      let fx = ''; const r = R.rng(3), dk = env(t, 39.45, 39.6, 41.5, 42.5);
      for (let i = 0; i < 40; i++) { const x = -200 + r() * 1500, sp = 0.6 + r(); fx += `<circle cx="${f(x)}" cy="${f(((t - 39.45) * 700 * sp + r() * 300) % 1800)}" r="${f(1.5 + r() * 3)}" fill="#c8c0b0" opacity="${f(0.6 * dk)}"/>`; }
      const spk = env(t, 39.45, 39.5, 40.0, 40.6);
      for (let i = 0; i < 16; i++) { const a = i / 16 * TAU, d = 60 + ((t - 39.45) * 800) % 300; fx += `<circle cx="${f(540 + Math.cos(a) * (240 + d * 0.4))}" cy="${f(1300 + Math.sin(a) * (300 + d * 0.3))}" r="3" fill="#ffd070" opacity="${f(spk)}"/>`; }
      fx += S.steam(250, 1100, 420, t * 1.6, 1, 0.3 * dk) + S.steam(830, 1000, 420, t * 1.6, 2, 0.3 * dk);
      const layers = [set.wall, set.frame, set.door, set.floor, { p: 1, svg: lit(you, L) + fx, chars: true }];
      return X.compose(layers, c) + C.vignette(0.5, '#040608', 0.45);
    };
    X.shot('BEND', 39.1, 42.8, fn, { grade: 'gDusk' });
  }

  // ======================================================= STAIRS: you limp up flight after flight, bleeding; at the top you breathe (42.1 - 47.45)
  {
    const FL = S.FLIGHTS, YS = 0.55;
    // one unbroken climb: up the flights and straight on along the top landing to the door, never stopping
    const prog = TK([[42.1, 0], [47.75, 4.42, 'sine']]);
    const at = p => { if (p >= 4) { const b = FL[3][1]; return [b[0] - (p - 4) * 480, b[1]]; } const k = Math.floor(p), u = p - k, [a, b] = FL[k]; return [lerp(a[0], b[0], u), lerp(a[1], b[1], u)]; };
    const DOOR = [40, 1700 - 4 * 520 - 200];
    // the camera follows the climb, then leans in and pushes into the opening door (into the zoom-match)
    const camAt = t => { const p = at(prog(t)), z = TK([[42.1, 1.1], [44.0, 1.0, 'sine'], [45.5, 1.12, 'sine'], [46.9, 1.28, 'sine'], [48.0, 1.85, 'in2']])(t), k = EZ.io(clamp((t - 46.4) / 1.3)); return [lerp(lerp(540, p[0], 0.45), DOOR[0], k), lerp(p[1] - 420 + 120 * ss(45.4, 46.6, t), DOOR[1], k), z, 0]; };
    ST.stairCam = camAt; ST.stairDoor = tt => scr(DOOR, camAt(tt));
    const fn = t => {
      const c = hh(camAt(t), t, 0.35, 11), L = LT.stair, p = prog(t), pos = at(p);
      // bloody prints on every other tread already climbed
      const prints = []; for (let q = 0.17; q < Math.min(p, 4); q += 0.34) { const w = at(q); prints.push([w[0] + 10, w[1] - 2, 1]); }
      const set = S.stairs(t, { prints, doorGlow: ss(46.0, 47.0, t), doorOpen: ss(47.2, 47.5, t) });
      const climbing = 1, limp = sbob(t, 1.4) * climbing;
      const yO = Object.assign(idle(t, 1), { x: pos[0], y: pos[1] - limp * 14, s: YS, sway: (Math.sin(TAU * 1.4 * t) * 3) * climbing, tilt: -4 * climbing });
      const relief = ss(45.6, 46.2, t);
      const you = Q.you(Object.assign(yO, ONE_BOOT, { face: { expr: relief > 0.5 ? 'tired' : 'grief', mouth: relief > 0.5 ? 'parted' : 'snarl', open: 0.12, lid: lerp(0.45, 0.6, relief), look: L2([0.2, -0.6], [-0.5, -0.3], relief), brows: L2([-14, 5], [-6, 2], relief), sweat: true },
        armR: { hand: L2([-230, -900], [-200, -1150], relief), pose: 'open', facing: 'palm', dir: [-0.3, 1] }, armL: { hand: [220, -980], pose: relief > 0.5 ? 'open' : 'grip', facing: 'back', dir: [0.2, 1] } }));
      const layers = [set.wall, set.back, { p: 1, svg: lit(you, L), chars: true }, set.front];
      return X.compose(layers, c) + C.vignette(0.55, '#040302', 0.42);
    };
    X.shot('STAIRS', 42.1, 48.0, fn, { grade: 'gDusk' });
  }

  // ======================================================= DECK: the freezing boat deck: the lifeboat, the warning shot, the gun, the gate (46.85 - 58.8)
  {
    // the deck plays on the original timeline shifted by SH (the new line "It leads to the freezing top deck" runs 0.48 s longer)
    const { FY, GFIX, GSHUT } = S.DECK, YS = 0.6, OS = 0.62, SH = 0.48;
    // one continuous burst-and-run from the doorway toward the lifeboat (no standing beat)
    const yX = TK([[46.85, 110], [50.6, 560, 'sine'], [55.5, 566], [56.1, 618, 'io'], [58.8, 622]]);
    const oX = TK([[46.85, 1180], [50.8, 1170], [51.5, 1070, 'io'], [58.8, 1066]]);
    const gate = TK([[46.85, GFIX], [54.85, GFIX], [55.3, GSHUT, 'in2']]);
    const boatY = TK([[46.85, 1230], [55.4, 1230], [58.8, 1580, 'sine']]);
    const cam = CAM(
      [[46.85, [300, 1180, 0]], [48.8, [600, 1150, 0], 'sine'], [50.6, [940, 1130, 0], 'sine'], [52.0, [900, 1050, 0], 'sine'], [52.5, [870, 1040, 2], 'out2'], [54.2, [800, 1050, 0], 'io'], [55.4, [820, 1150, 0], 'sine'], [57.2, [700, 1110, 0], 'sine'], [58.8, [690, 1200, 0], 'sine']],
      [[46.85, 1.5], [48.8, 1.0, 'sine'], [50.6, 0.92, 'sine'], [52.0, 1.2, 'sine'], [52.5, 1.32, 'out2'], [54.2, 1.65, 'io'], [55.4, 1.25, 'sine'], [57.2, 1.55, 'sine'], [58.8, 1.35, 'sine']]);
    ST.deckFace = tt => scr([yX(tt - SH), FY - 1240 * YS], cam(tt - SH));
    ST.deckDoor = tt => scr([140, FY - 370], cam(tt - SH));
    const PUFF = [47.1, 48.3, 49.4, 50.5, 51.6, 53.0, 54.4, 55.9, 57.3];
    const fn = tt => {
      const t = tt - SH;
      const shotK = bump(t, 52.4, 1, 0.16), c0 = cam(t), kick = shake(t, 52.4, 0.35, 8), c = hh([c0[0] + kick[0], c0[1] + kick[1], c0[2], c0[3]], t, 0.45, 12);
      const L = LT.deck, by = boatY(t), set = S.deck(t, { doorOpen: true, boatY: by, rocket: clamp((t - 49.4) / 2.2) * (t < 51.6 ? 1 : 0) });
      // ---- the officer: gun low, then straight up (the warning shot), then levelled at your chest; his left hand swings the gate shut and locks it
      const up = EZ.io(clamp((t - 51.3) / 0.6)) * (1 - EZ.io(clamp((t - 53.0) / 0.6))), aim = EZ.io(clamp((t - 53.0) / 0.6));
      const oO = Object.assign(idle(t, 6), { x: oX(t), y: FY, s: OS, tilt: -2 * aim });
      const gHand = L2(L2([-150, -660], [-110, -1470], up), [-330, -1060 + Math.sin(t * 2) * 6], aim), gDir = nrm(L2(L2([0.1, 1], [0, -1], up), [-1, 0.06], aim));
      const armR = { hand: gHand, dir: gDir, pose: 'grip', facing: 'back', hold: PR.revolver() };
      const push = EZ.io(clamp((t - 54.7) / 0.25)) * (1 - EZ.io(clamp((t - 55.25) / 0.3))), lockH = EZ.io(clamp((t - 55.35) / 0.3));
      const armL = { hand: R.toLocal(oO, L2(L2([oX(t) + 150, FY - 420], [GFIX + 20, FY - 560], push), [GFIX + 10, FY - 470], lockH)), pose: 'open', facing: 'back', dir: [-0.7, 0.7] };
      const off = Q.officer(Object.assign(oO, { face: { expr: 'stern', look: [-0.85, 0.05], lid: 0.42 - 0.3 * shotK, brows: [10, -4], mouth: 'tight' }, armR, armL }));
      const muzzle = gripPt(oO, 'officer', 'R', armR, PR.REVOLVER_MUZZLE[0], PR.REVOLVER_MUZZLE[1]);
      // ---- you: burst out shivering, run for the boat, freeze at the shot, hands up at the gun, then grip the bars
      const run = env(t, 46.95, 47.3, 50.3, 50.6), xg = gate(t);
      const yO = Object.assign(idle(t, 1), { x: yX(t), y: FY - sbob(t, 2.2) * 14 * run, s: YS, sway: Math.sin(t * 4.4) * 3 * run + Math.sin(t * 22) * 0.4, tilt: -6 * bump(t, 52.4, 1, 0.5) });
      const reach = env(t, 49.6, 50.2, 50.9, 51.4), hands = ss(52.45, 52.8, t) * (1 - ss(55.5, 55.9, t)), bars = ss(55.8, 56.15, t);
      let aR = { hand: L2(L2(L2([-90, -980], [-180, -760], run), [-250, -1250], hands), [0, 0], 0), pose: 'open', facing: 'palm', dir: nrm(L2([0.6, -0.2], [-0.2, -1], hands)) };
      let aL = { hand: L2(L2([90, -960], [330, -1060], reach), [240, -1260], hands), pose: 'open', facing: 'palm', dir: nrm(L2(L2([-0.6, -0.2], [1, -0.2], reach), [0.2, -1], hands)) };
      if (bars > 0) {
        const gL = gripAt(yO, 'you', [GSHUT + 14, FY - 520], fingersFor('L', 'back', [0, -1])), gR = gripAt(yO, 'you', [GSHUT + 14, FY - 400], fingersFor('R', 'back', [0, -1]));
        aL = { hand: L2(aL.hand, gL.hand, bars), dir: nrm(L2(aL.dir, gL.dir, bars)), pose: bars > 0.6 ? 'grip' : 'open', facing: bars > 0.6 ? 'back' : 'palm' };
        aR = { hand: L2(aR.hand, gR.hand, bars), dir: nrm(L2(aR.dir, gR.dir, bars)), pose: bars > 0.6 ? 'grip' : 'open', facing: bars > 0.6 ? 'back' : 'palm' };
      }
      const despair = ss(56.2, 56.8, t), fear = ss(51.0, 51.5, t);
      const look = TK([[46.85, [0.3, -0.2]], [47.8, [0.75, -0.1]], [50.9, [0.8, -0.1]], [51.3, [0.85, -0.25]], [53.2, [0.85, -0.05]], [56.4, [0.8, 0.3]]])(t);
      const you = Q.you(Object.assign(yO, ONE_BOOT, { face: { expr: despair > 0.5 ? 'grief' : fear > 0.5 ? 'fear' : 'anxious', wide: fear > 0.5 && despair < 0.5, tears: despair > 0.3, mouth: despair > 0.5 ? 'cry' : 'parted', open: 0.14, look, lid: 0.32 + 0.4 * bump(t, 52.4, 1, 0.3), brows: [-15, 6], sweat: true }, armR: aR, armL: aL }));
      // the rich in the half-empty lifeboat (upper bodies above the gunwale), riding down with it
      const rich = lit(Q.richWoman2(Object.assign(idle(t, 3), { x: 1290, y: by + 330, s: 0.5, face: { mouth: 'tight', look: [-0.6, 0.1], lid: 0.45 } })), L) + lit(Q.richMan(Object.assign(idle(t, 4), { x: 1560, y: by + 340, s: 0.52, face: { mouth: 'closed', look: [-0.7, 0], lid: 0.5 } })), L);
      // breath vapour, the muzzle flash and its smoke, the padlock on the chain at the hinge post
      let fx = '';
      const mouth = R.toWorld(yO, R.headPt(yO, 'man', [6, 100]));
      for (const p0 of PUFF) { const u = (t - p0) / 1.0; if (u <= 0 || u >= 1) continue; for (let i = 0; i < 4; i++) fx += `<ellipse cx="${f(mouth[0] + 20 + u * (40 + i * 16))}" cy="${f(mouth[1] - u * (40 + i * 18))}" rx="${f(10 + u * 36)}" ry="${f(8 + u * 26)}" fill="#e8eef8" opacity="${f(0.3 * Math.sin(Math.PI * u) * (1 - i * 0.15))}" filter="url(#b8)"/>`; }
      fx += PR.muzzle(muzzle[0], muzzle[1], Math.atan2(gDir[1], gDir[0]) / D2R, shotK, ss(52.4, 53.6, t));
      const lock = ss(55.5, 55.8, t);
      const chain = lock > 0 ? `<path d="M${GFIX - 30},${FY - 520} q30,30 60,0" stroke="#7a7e86" stroke-width="7" fill="none" opacity="${f(lock)}"/><g transform="translate(${GFIX},${FY - 480}) scale(${f(0.8 + 0.2 * lock)})" opacity="${f(lock)}"><path d="M-14,0 L-14,-22 A14,14 0 0 1 14,-22 L14,0" stroke="#9a9ea6" stroke-width="6" fill="none"/><rect x="-20" y="-4" width="40" height="34" rx="5" fill="#7a6a2a" stroke="#141006" stroke-width="2"/></g>` : '';
      const gateSvg = PR.gate(GFIX, xg, FY - 760, FY, {}) + `<rect x="${GSHUT - 14}" y="${FY - 800}" width="28" height="800" fill="#141518" stroke="#06070a" stroke-width="2"/>`;
      const layers = [set.sky, set.sea, set.sup, set.crowd, { p: 1, svg: rich + set.boat.svg }, set.deck, { p: 1, svg: lit(off, L) + gateSvg + chain + lit(you, L) + fx, chars: true }];
      return X.compose(layers, c) + C.vignette(0.45, '#02030a', 0.45);
    };
    X.shot('DECK', 47.3, X.T_END + 0.01, fn, { grade: 'gNight' });
  }

  // ======================================================= transitions: soft, varied, each hidden in a move (never the same type twice in a row)
  X.tr('bokeh', 5.75, 0.7, 'OPEN', 'ICE', { dir: [0, 1], dist: 0.45, blur: 14, seed: 5 });
  X.tr('zmatch', 8.6, 0.6, 'ICE', 'FLOOD', { fa: scr([330, 1560], ST.iceCam(8.6)), fb: scr([-40, 1330], ST.floodCam(8.6)), za: 2.4, zb: 2.2, leak: '#1a3a4a', leakOp: 0.35, seed: 6 });
  X.tr('carry', 13.25, 0.7, 'FLOOD', 'BRIDGE', { mode: 'tilt', dir: [0, -1], dist: 0.42, blur: 14 });
  X.tr('push', 15.45, 0.6, 'BRIDGE', 'SEC', { fa: ST.bridgeKnob(15.45), fb: ST.secDoorTop(15.45), za: 2.2, zb: 0.62, fade: [0.4, 0.6], blur: 6 });
  X.tr('surface', 21.15, 0.5, 'SEC', 'PIN', { dir: 1, seed: 4 });
  X.tr('wipe', 25.1, 0.6, 'PIN', 'CLAW', { dir: 1, truck: 200 });
  X.tr('carry', 30.05, 0.7, 'CLAW', 'RIP', { mode: 'zoom', k: 1.8, fa: ST.clawBoot(30.05), fb: ST.ripBoot(30.05), blur: 5 });
  X.tr('liquid', 33.85, 0.7, 'RIP', 'FURN', { fa: ST.ripBoot(33.85), fb: scr([830, 1300], ST.furnCam(33.85)), col: '#06121a', seed: 11 });
  X.tr('heat', 39.4, 0.6, 'FURN', 'BEND', {});
  X.tr('carry', 42.45, 0.7, 'BEND', 'STAIRS', { mode: 'tilt', dir: [0, -1], dist: 0.42, blur: 14 });
  // the stairwell door's light -> the deck door you burst out of: the camera dives into one doorway and pulls back out of the other
  X.tr('zmatch', 47.65, 0.7, 'STAIRS', 'DECK', { fa: ST.stairDoor(47.65), fb: ST.deckDoor(47.65), za: 2.4, zb: 2.2, leak: '#dfe8ff', leakOp: 0.4, seed: 12, blur: 4 });
  X.tr('organic', X.T_END, 0.65, 'DECK', 'OPEN', { end: true, bOff: -X.T_END, fa: ST.deckFace(X.T_END - 0.3), fb: [470, 1150], za: 1.12, zb: 0.9, seed: 9, freq: 0.004, soft: 4 });
})(window);
