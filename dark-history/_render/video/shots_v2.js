// "The Royal Fool" part 2.
// WAR (12.25 .. 17.1) "It's 1340, France is at war with England, and news arrives that the English have trapped..."
//   Low across the war map: the scarred lord's pointer pushes the red English ships across the Channel toward the blue
//   French fleet in the harbour; we rise to the council round the table; the door bursts open, the soaked messenger
//   runs in and slaps his letter on the map; we dive into the painted harbour...
// BATTLE (16.4 .. 20.4) "...the King's entire fleet in a harbor and destroyed it." ...into the real one (z-match): the
//   French cogs chained in lines, the English coming in with the sun behind them, arrows; down to one burning cog
//   whose mast comes down.
// DEAD (19.75 .. 22.4) "Thousands of French sailors are dead." Evening: wreckage, burning hulks, smoke; the lily banner
//   drifting under the lens.
// LORDS (21.7 .. 27.65) "No lord dares to tell him, because everyone knows what happens to men who bring the King bad
//   news." The council pushes the letter from hand to hand; their eyes go to the window; we go out through it, down into
//   the rain, to the gibbet where the last messenger hangs; a crow lifts off.
(function (G) {
  const X = G.ENG, T = G.ST3, Q = G.QCAST, C = G.CINE, R = G.RIG, PR = G.PROPS, SH = G.SH, HL = G.HALL, P17 = G.P17, V = G.FV;
  const { ss, clamp, lerp, EZ } = X, { f } = R;
  const { env, nrm, L2, bump } = V;
  const RM = HL.RM, TB = RM.TAB, D2R = Math.PI / 180;

  // the council round the table (behind it, facing us) and their reactions
  const COUNCIL = [{ i: 3, x: -150, z: 530 }, { i: 0, x: -48, z: 545 }, { i: 1, x: 62, z: 540 }, { i: 2, x: 165, z: 528 }];
  // a lord at the table: hands resting on its far edge unless arms are given
  const lordAt = (c, t, L, k, face, arms = {}, x2 = {}) => {
    const S = COUNCIL[k], def = V.LORDS[S.i], st = V.at(c, S.x + (x2.dx || 0), S.z, def.h, 'man', 0); if (!st) return null;
    const id = V.idle(t, def.seed), o = { x: st.x, y: st.y, s: st.s, blink: id.blink, breath: id.breath, sway: id.sway + (x2.sway || 0), tilt: x2.tilt || 0, face };
    const edge = sd => { const p = c.proj([S.x + sd * 32, TB.y + 2, TB.z1 + 6]); return p ? V.handAt(o, p, [0, 1], { pose: 'relaxed', facing: 'back' }) : V.rest(sd); };
    // (an arm given as a function eases from the hands-on-the-table pose: a gesture never snaps from or back to it)
    const pick = (a, sd) => typeof a === 'function' ? a(edge(sd)) : (a || edge(sd));
    o.armR = pick(arms.R, -1); o.armL = pick(arms.L, 1);
    const P = def.mk()(o);
    return { st, P, o, actor: V.actor(st.d, () => SH.draw(P, o, null, L, x2.mid || '', { noCast: 1 }) + V.armsOver(P, L) + V.handsLit(P, L) + (x2.over || '')) };
  };
  // the map tokens: French blue in the harbour; English red crossing (k 0..1 of their advance)
  const tokensAt = k => {
    const [hx, hy] = P17.MAP.HARBOUR, L = [];
    for (let i = 0; i < 7; i++) L.push({ x: hx - 40 + (i % 3) * 34 - (i > 2 ? 18 : 0), y: hy - 30 + Math.floor(i / 3) * 30, col: '#22348a', rot: (i * 17) % 20 - 10, s: 0.8 });
    for (let i = 0; i < 6; i++) { const a = [560 + (i % 3) * 70, 330 + Math.floor(i / 3) * 60], b = [hx - 170 + (i % 3) * 40, hy - 110 + Math.floor(i / 3) * 34]; const u = EZ.io(clamp(k * 1.2 - i * 0.04)); L.push({ x: lerp(a[0], b[0], u), y: lerp(a[1], b[1], u), col: '#b8221a', rot: 20 - 10 * u, s: 0.8 }); }
    return L;
  };
  V.tokensAt = tokensAt;

  // ======================================================= WAR
  {
    const HB = RM.mapPt(...P17.MAP.HARBOUR);
    const cam = V.CAM([
      [12.2, [-200, 132, 150], [40, 92, 420], 1150],
      [13.4, [-90, 138, 150], [120, 96, 430], 1200],
      // (to the door as it bursts open, down to the corner of the table where he slaps the letter, then along with the
      // letter as it skids across the map to the harbour, and down into it)
      [14.5, [40, 245, 70], [-20, 125, 500], 1100],
      [15.2, [-50, 232, 70], [-170, 150, 640], 1050],
      [15.8, [-70, 214, 150], [-150, 105, 470], 1080],
      [16.35, [30, 205, 230], [HB[0], HB[1], HB[2]], 1150],
      [17.15, [HB[0] - 6, HB[1] + 48, HB[2] - 22], [HB[0], HB[1], HB[2]], 1200]
    ], 0.5, 11);
    V.warCam = cam;
    const ADV = t => ss(12.4, 14.6, t);
    // the run ends at the table's back corner (he can reach the map from there); the letter is slapped down on the
    // corner of the map and shoved, and skids across to the harbour
    const RUN0 = 14.95, RUN1 = 0.75, SLAP = 15.8, SLIDE = 0.5, MX = -190, MZ = 482;
    const L1 = RM.mapPt(P17.MAP.HARBOUR[0] - 120, P17.MAP.HARBOUR[1] + 50), L0 = [-158, L1[1], 456];
    const letterW = t => { const u = EZ.out(clamp((t - SLAP) / SLIDE)); return [lerp(L0[0], L1[0], u), L1[1], lerp(L0[2], L1[2], u)]; };
    const fn = t => {
      SH.still();
      const c = cam(t), L = V.LT.room, A = [];
      // the pointer: from the scarred lord's fist to the lead English token
      const tok = tokensAt(ADV(t)), lead = tok[7], tip = RM.mapPt(lead.x - 20, lead.y + 6);
      const turn = ss(RUN0 - 0.1, RUN0 + 0.4, t), atLetter = ss(SLAP, SLAP + 0.4, t);
      COUNCIL.forEach((S, k) => {
        // (they turn to the door and back to the letter with eased gazes, brows and heads: nothing snaps)
        const tk = ss(0.3, 0.7, turn), lk = ss(0.3, 0.7, atLetter);
        const look = V.lerp2(V.lerp2([S.x < 0 ? 0.25 : -0.25, 0.75], [lerp(-0.2, -0.75, turn), -0.05], tk), [S.x < 0 ? 0.3 : -0.2, 0.8], lk);
        const face = V.faceMix({ expr: 'stern', look, lid: 0.3, mouth: 'tight', brows: [5, -2] }, { expr: 'anxious', look, lid: 0.3, mouth: 'tight', brows: [-6, 1] }, tk);
        let arms = {}, mid = '';
        if (k === 0) {
          const hw = c.proj([S.x + 36, TB.y + 24, TB.z1 - 8]), tp = c.proj(tip);
          if (hw && tp) { const st0 = V.at(c, S.x, S.z, V.LORDS[S.i].h, 'man', 0); if (st0) { const o0 = { x: st0.x, y: st0.y, s: st0.s }; const ax = nrm([tp[0] - hw[0], tp[1] - hw[1]]); arms.L = V.gripK(o0, Q.HAND.scarLord, hw, SH.fingersFor('L', 'back', ax), { detachHand: true, wristFree: true }); const back = [hw[0] - ax[0] * 40 * st0.s, hw[1] - ax[1] * 40 * st0.s]; mid = `<path d="M${f(back[0])},${f(back[1])} L${f(tp[0])},${f(tp[1])}" stroke="#5a3a1e" stroke-width="${f(Math.max(1.2, 22 * st0.s))}" stroke-linecap="round"/>`; } }
        }
        const l = lordAt(c, t, L, k, face, arms, { mid, tilt: lerp(3, -3, tk) });
        if (l) A.push(l.actor);
      });
      // the messenger: through the door, running to the table, the letter slapped down on the harbour
      let letter = null;
      const ru = EZ.out(clamp((t - RUN0) / RUN1)), mz = lerp(820, MZ, ru), mx = lerp(-265, MX, ru);
      if (t > RUN0 - 0.25) {
        const st = V.at(c, mx, mz, 176, 'man', 0);
        if (st) {
          // (the run settles into a stand over a third of a second - bob, sway and arms ease out - and the reach for the
          // map starts from wherever the arm is, never snapping from the running pose)
          const run = SH.run(t, { rate: 3.2, bob: 40 }), runK = 1 - ss(RUN0 + RUN1 - 0.3, RUN0 + RUN1 + 0.05, t);
          const id = V.idle(t, 41), o = { x: st.x, y: st.y + (run.bob || 0) * st.s * 0.6 * runK, s: st.s, blink: id.blink, breath: id.breath * 2 + 2 * Math.sin(t * 9), sway: (run.sway || 0) * 0.5 * runK, tilt: -4 };
          // the slap: the hand rises high over the corner of the map, comes down flat on the letter, shoves it on, lifts
          // high again and drops back to his side
          const reach = env(t, SLAP - 0.42, SLAP - 0.17, SLAP + 0.45, SLAP + 0.85);
          const dn = ss(SLAP - 0.13, SLAP - 0.01, t), up2 = ss(SLAP + 0.2, SLAP + 0.4, t), push = ss(SLAP, SLAP + 0.12, t);
          const hw = [L0[0] + 10 * push, L0[1] + 6 + 36 * (1 - dn) + 36 * up2, L0[2] - 8 * push], lps = c.proj(hw);
          // (while he runs each fist turns with its forearm, pointing up at the top of the swing: a fist asked to point down
          // while its forearm swung up was turned by the wrist limit, which flipped it half a turn at every swing)
          const swA = Math.sin(t * 3.2 * 2 * Math.PI);
          const runArm = (rest, r, sd) => { if (!r) return rest; const d = V.turnDir([-sd * 0.2, 1], [sd * 0.3, -1], ss(0.05, 0.95, sd * swA)); return V.mixArm(rest, Object.assign({}, r, { dir: d }), runK); };
          const baseL = runArm(V.rest(1), run.armL, 1), baseR = runArm(V.rest(-1), run.armR, -1);
          o.armL = reach > 0.001 && lps ? V.mixArm(baseL, V.handAt(o, lps, [0.7, 0.6], { pose: 'open', facing: 'back' }), reach) : baseL;
          o.armR = baseR;
          o.face = { expr: 'fear', look: [0.4, 0.4], lid: 0.08, mouth: 'talk', open: Q.talk(t, 0.25, 7), brows: [-9, -2], sweat: 0.8 };
          const MP = Q.messenger(o);
          // (the letter in his hand becomes the letter on the map in the instant his palm lands on it, under the palm)
          const handOff = ss(SLAP - 0.04, SLAP, t);
          const hp = R.toWorld(o, o.armL.hand);
          const lt = handOff < 1 ? `<g transform="translate(${f(hp[0])},${f(hp[1])})" opacity="${f(1 - handOff)}">${P17.letter(0, 0, o.s * 0.9, -20, { wet: 0.7 })}</g>` : '';
          // (he stands behind the table, which is drawn after him; while his hand is up clear of the table's edge the
          // slapping forearm, the letter and the hand move to a layer in front of the table, so they land on it)
          const over = t > SLAP - 0.16 && t < SLAP + 0.42;
          A.push(V.actor(st.d, () => SH.draw(MP, o, null, L, '', { noCast: 1 }) + (reach > 0.02 && !over ? V.armsOver(MP, L, 'L') : '') + (over ? V.handsLit(MP, L, 'R') : lt + V.handsLit(MP, L))));
          if (over) A.push(V.actor(c.dist([0, TB.y, (TB.z0 + TB.z1) / 2]) - 4, () => V.armsOver(MP, L, 'L') + lt + V.handsLit(MP, L, 'L')));
        }
      }
      if (t >= SLAP - 0.04) letter = { p: letterW(t), k: 0.09, rot: -20 + 6 * EZ.out(clamp((t - SLAP) / SLIDE)), op: ss(SLAP - 0.04, SLAP, t) };
      return HL.roomRender(c, t, { tokens: tok, door: EZ.out(ss(RUN0 - 0.45, RUN0 - 0.05, t)), letter, rain: 0.5 }, A) + C.vignette(0.5);
    };
    X.shot('WAR', 12.25, 17.1, fn, { grade: 'gHall' });
    V.warHarbour = tt => cam(tt).proj(HB) || [540, 960];
  }

  // ======================================================= BATTLE
  {
    const SEA = HL.SEA, HERO = SEA.FRENCH[3], HP = [HERO.x, 260, HERO.z];
    const cam = V.CAM([
      [16.35, [0, 3600, 3000], [0, 0, 10400], 1050],
      [17.1, [-200, 3000, 3600], [-300, 0, 10400], 1080],
      [18.35, [-1000, 1250, 5300], [-1900, 300, 9600], 1150],
      [19.3, [HERO.x + 700, 460, HERO.z - 2400], HP, 1300],
      [20.5, [HERO.x + 900, 330, HERO.z - 2000], [HERO.x + 100, 300, HERO.z], 1350]
    ], 0.6, 13);
    V.battleCam = cam;
    V.battleHarbour = tt => cam(tt).proj([0, 0, 10400]) || [540, 960];
    const EN = t => ss(16.3, 20.5, t);
    const fn = t => {
      SH.still();
      const c = cam(t);
      const shipFn = (S, side, tt) => {
        if (side === 'F') {
          const hero = S === HERO, fk = hero ? ss(19.15, 19.75, tt) : ss(18.2 + (S.seed % 7) * 0.25, 19.8 + (S.seed % 5) * 0.3, tt) * (S.row === 0 ? 0.9 : 0.5);
          return { fire: fk, smoke: Math.max(fk, 0.2 * ss(17.5, 18.5, tt)), mast: hero ? EZ.in2(ss(19.55, 20.4, tt)) : 0, roll: hero ? 6 * ss(19.6, 20.4, tt) : 0, crew: [{ x: -120, seed: S.seed, pose: 'arms' }, { x: 20, seed: S.seed + 1 }, { x: 140, seed: S.seed + 2, pose: 'pull' }] };
        }
        return { archers: 3, x0: 0, furl: 0 };
      };
      // the English press in (their z advances), arrow volleys from their castles to the French decks
      const ENG = SEA.ENGLISH.map(S => Object.assign({}, S, { z: S.z + 2300 * EN(t) }));
      const saved = SEA.ENGLISH; SEA.ENGLISH = ENG;
      let arrows = '';
      for (let i = 0; i < 4; i++) {
        const E = ENG[i + 2], F = SEA.FRENCH[i + 2], a = c.proj([E.x + E.dir * 1000, 700, E.z]), b = c.proj([F.x, 380, F.z]);
        if (a && b) arrows += P17.volley([a[0], a[1], 80], [b[0], b[1], 160], t, { n: 14, per: 1.5, flight: 1.0, arc: Math.max(60, Math.abs(a[1] - b[1]) * 0.9 + 120), seed: 50 + i, t0: 16.8, len: clamp(Math.abs(b[0] - a[0]) * 0.02 + 10, 8, 40) });
      }
      const out = HL.seaRender(c, t, { dusk: 0.15 * ss(19, 20.5, t), ship: shipFn }, []);
      SEA.ENGLISH = saved;
      return out + arrows + C.vignette(0.45);
    };
    // (ends exactly where the carry into DEAD ends: the engine draws the first shot whose span holds t, so a BATTLE
    // running past the carry flashed back for two frames after it)
    X.shot('BATTLE', 16.4, 20.4, fn, { grade: 'gDay' });
  }

  // ======================================================= DEAD: the evening after
  {
    const SEA = HL.SEA, BAN = [240, 0, 5750];
    const cam = V.CAM([
      [19.7, [-260, 260, 4300], [-100, 120, 9800], 1080],
      [21.0, [40, 180, 4900], [160, 40, 8000], 1150],
      [22.45, [170, 130, 5330], [BAN[0], 0, BAN[2]], 1300]
    ], 0.5, 17);
    V.deadCam = cam;
    const DEB = (() => { const L = [], r = R.rng(733); for (let i = 0; i < 30; i++) L.push({ x: -1100 + r() * 2200, z: 5500 + r() * 3200, seed: i, s: 0.6 + r() * 0.8 }); return L; })();
    const fn = t => {
      SH.still();
      const c = cam(t), A = [];
      for (const d of DEB) { const b = HL.bb(c, [d.x, 0, d.z]); if (b) A.push({ z: b.d, svg: () => { const bb = HL.bb(c, [d.x, 0, d.z]); return bb ? P17.wreck(bb.x, bb.y, bb.k * 1.1 * d.s, t, d.seed, 0.15) : ''; } }); }
      const bn = HL.bb(c, BAN); if (bn) A.push({ z: bn.d, svg: () => { const b = HL.bb(c, BAN); return b ? P17.floatBanner(b.x, b.y, b.k * 0.62, t, 0) : ''; } });
      const shipFn = (S, side) => side === 'F' ? { fire: (S.seed % 3) ? 0.55 : 0.2, smoke: 1, sink: 0.55 + (S.seed % 4) * 0.1, roll: ((S.seed % 5) - 2) * 7, mast: (S.seed % 3) === 0 ? 0.8 : 0, furl: 1 } : { furl: 0.4, archers: 0 };
      // embers drifting up across the frame
      const r = R.rng(91); let emb = ''; for (let i = 0; i < 30; i++) { const x = (r() * 1200 + t * 20 * (r() - 0.3)) % 1150, y = 1950 - ((r() * 2000 + t * (60 + r() * 60)) % 2000); emb += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(1.5 + r() * 2.5)}" fill="#ffb060" opacity="${f(0.5 * (0.5 + 0.5 * Math.sin(t * 4 + i)))}"/>`; }
      return HL.seaRender(c, t, { dusk: 0.85, ship: shipFn, english: false }, A) + `<g filter="url(#b1)">${emb}</g>` + C.vignette(0.55);
    };
    X.shot('DEAD', 19.75, 22.4, fn, { grade: 'gDusk' });
  }

  // ======================================================= LORDS: nobody takes the letter; the window; the gibbet
  {
    const WIN = [240, 300, RM.Z1], GB = [560, RM.YARD, 1900];
    const cam = V.CAM([
      // (high and close over the table: the letter, the hands that push it on and the faces that refuse it all read -
      // the old low wide view left two thirds of the frame to the floor)
      [21.65, [-70, 215, 170], [-20, 100, 430], 1080],
      [23.0, [-10, 220, 165], [40, 102, 430], 1100],
      [23.85, [60, 224, 170], [80, 106, 435], 1100],
      [24.7, [170, 228, 360], [WIN[0], WIN[1], WIN[2]], 1080],
      [25.4, [236, 300, 690], [420, -120, 1900], 1000],
      [26.5, [390, -60, 1290], [GB[0] + 80, -160, GB[2]], 1080],
      [27.7, [450, -120, 1470], [GB[0] + 140, -110, GB[2]], 1250]
    ], 0.5, 19);
    V.lordsCam = cam;
    V.lordsLetter = tt => cam(tt).proj([-20, TB.y, 380]) || [540, 1000];
    // the letter sliding on the table: from the chancellor's side to the fat lord's, back to the young lord's, then left
    const LPATH = [[22.2, [-70, 380]], [22.75, [40, 400]], [23.25, [60, 400]], [23.75, [120, 410]], [24.4, [100, 405]]];
    const letterAt = t => { let p = LPATH[0][1]; for (let i = 0; i < LPATH.length - 1; i++) { const [t0, a] = LPATH[i], [t1, b] = LPATH[i + 1]; if (t >= t0) p = L2(a, b, EZ.io(clamp((t - t0) / (t1 - t0)))); } return p; };
    const fn = t => {
      SH.still();
      const c = cam(t), L = V.LT.room, A = [];
      const lp = letterAt(t), lw = [lp[0], TB.y + 1.2, lp[1]];
      // who pushes it: the chancellor (22.2-22.75), the fat lord (23.25-23.75)
      const push = (k, t0, t1) => env(t, t0 - 0.2, t0, t1, t1 + 0.25);
      const wnd = ss(23.95, 24.5, t);
      COUNCIL.forEach((S, k) => {
        const watch = [lerp(0, 0.5, wnd) + (S.x < 0 ? 0.25 : -0.25) * (1 - wnd), lerp(0.7, -0.15, wnd)];
        const face = { expr: k === 3 ? 'stern' : 'anxious', look: watch, lid: 0.22, mouth: 'tight', brows: [-7, 1] };
        let arms = {}, x2 = {};
        const st0 = V.at(c, S.x, S.z, V.LORDS[S.i].h, 'man', 0);
        if (st0) {
          const o0 = { x: st0.x, y: st0.y, s: st0.s };
          const pk = S.i === 0 ? push(k, 22.2, 22.75) : S.i === 1 ? push(k, 23.3, 23.75) : 0;
          // (each gesture eases out of the hands-on-the-table pose and back into it)
          // (the letter slides past in front of him, so the push is handed from one hand to the other as it goes by: each
          // hand keeps to its own side of his body and the two cross-fade their reach - choosing the arm by the letter's
          // side switched arms in one frame mid-push)
          if (pk > 0) {
            const wL = ss(S.x - 20, S.x + 20, lw[0]);
            for (const [side, key, w] of [[1, 'L', pk * wL], [-1, 'R', pk * (1 - wL)]]) {
              const hx = side > 0 ? Math.max(lw[0] - 14, S.x + 4) : Math.min(lw[0] + 14, S.x - 4), lps = c.proj([hx, lw[1] + 1, lw[2]]);
              if (w > 0 && lps) { const tgt = V.handAt(o0, lps, [side * 0.7, 0.5], { pose: 'point', facing: 'back' }); arms[key] = base => Object.assign(V.mixArm(base, tgt, w), { wristFree: true }); }
            }
          }
          // the fat lord: both palms up (not me); the young lord shakes his head; the scarred lord's arms folded
          // (drawn free of the wrist limit, which flipped the rising hands from one side to the other)
          if (S.i === 1 && t > 22.75 && t < 23.1) { const k2 = env(t, 22.75, 22.87, 22.98, 23.1); arms.R = base => Object.assign(V.mixArm(base, { hand: [-200, -1010], dir: [0.2, -1], pose: 'open', facing: 'palm' }, k2), { wristFree: true }); arms.L = base => Object.assign(V.mixArm(base, { hand: [200, -1010], dir: [-0.2, -1], pose: 'open', facing: 'palm' }, k2), { wristFree: true }); }
          if (S.i === 2) x2.tilt = 5 * Math.sin(t * 9) * env(t, 23.75, 23.85, 24.2, 24.35);
          if (S.i === 3) { arms.R = { hand: [80, -930], dir: [1, 0.1], pose: 'relaxed', facing: 'back' }; arms.L = { hand: [-70, -960], dir: [-1, 0.1], pose: 'relaxed', facing: 'back' }; }
        }
        const l = lordAt(c, t, L, k, face, arms, x2); if (l) A.push(l.actor);
      });
      return HL.roomRender(c, t, { tokens: tokensAt(1), letter: { p: lw, k: 0.09, rot: -14 + lp[0] * 0.1 }, door: 0, rain: 1, crowFly: ss(26.3, 27.6, t) }, A) + C.vignette(0.5);
    };
    X.shot('LORDS', 21.7, 27.65, fn, { grade: 'gHall' });
    V.lordsGibbet = tt => cam(tt).proj([GB[0] + 135, -300, GB[2]]) || [540, 960];
  }

  // ---- transitions
  X.tr('eyelid', 12.55, 0.6, 'JUGGLE', 'WAR', {});
  // (no noise dissolves: their blotches of one shot eating through the other read as glitches. The dive swaps in a few
  // frames at the peak of the zoom blur; the battle hands over to the evening inside a fast blurred pan)
  X.tr('zmatch', 16.75, 0.7, 'WAR', 'BATTLE', { fa: V.warHarbour(16.75), fb: V.battleHarbour(16.75), za: 3.0, zb: 0.55, plain: true, fade: [0.46, 0.54], blur: 8, bpow: 4, vexp: 1.32 });
  X.tr('carry', 20.1, 0.6, 'BATTLE', 'DEAD', { mode: 'pan', dir: [1, 0], dist: 0.62, fade: [0.46, 0.54], blur: 12 });
  X.tr('wipe', 22.05, 0.7, 'DEAD', 'LORDS', { dir: 1, truck: 160, obj: (x, u) => P17.pageWipe(x, u) });
})(window);
