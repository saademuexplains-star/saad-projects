// ---------- DAVE DEMO (0 - 16.4 s) ----------
const DUR = 16.4;
const notesFx = (c, t, x0, y0, every = .3, seed = 1, s = .9) => {
  for (let i = 0; i < 12; i++) {
    const t0 = i * every; const k = t - t0; if (k < 0 || k > 1.1) continue;
    const r = rng(seed + i);
    note(c, x0 + k * (60 + r() * 80) * (r() > .5 ? 1 : -1) + Math.sin(k * 7 + i) * 18, y0 - k * 260, s * (.7 + r() * .5) * E.outBack(clamp(k * 5)), Math.sin(k * 6 + i) * .3, clamp((1.1 - k) * 4), r() > .6);
  }
};

const SHOTS = [
  // 1. "This is Dave." — Dave drops into the tide pool shot, lands, name tag slaps on
  { a: 0, b: 1.22,
    prep: async t => ensureTide([tideIdx(t + 2.2)]),
    draw(c, t) {
      const land = .40, k = t - land;
      const cam = { x: 540, y: 1080, z: kf(t, [[0, 1.0], [1.22, 1.08, 'lin']]), r: 0 };
      const sk = k > 0 ? 16 * Math.exp(-k * 7) : 0; [cam.sx, cam.sy] = shake(t, sk, 22);
      bgLayer(c, TIDE.get(tideIdx(t + 2.2)), cam, { p: .9, s: 1.12, oy: -40 });
      c.save(); applyCam(c, cam);
      const fall = k < 0 ? 1 - Math.pow(t / land, 2) : 0;
      const sq = k > 0 ? Math.exp(-k * 6.5) * Math.cos(TAU * 3.2 * k) : 0;
      const o = {
        t, x: 540, y: 1660, s: .6, hop: fall * 1500,
        sx: k < 0 ? .9 : 1 + .2 * sq, sy: k < 0 ? 1.14 : 1 - .26 * sq,
        splay: k < 0 ? -.35 + Math.sin(t * 40) * .15 : .7 * Math.exp(-k * 6),
        eye: k < .12 ? { top: 0, pupil: .17, ly: -.3 } : { top: .14, lx: 0, ly: .05 },
        blink: kf(t, [[.95, 0], [1.0, 1, 'lin'], [1.07, 0, 'lin']]),
        mouth: k < .12 ? { type: 'o', w: 90 } : t < .63 ? { type: 'smile', w: 100 } : { type: 'grin', w: 105, open: E.outBack(seg(t, .63, .78)) },
        tag: t > .63 ? t - .63 : 0, eyePop: k > 0 ? 18 * Math.exp(-k * 8) * Math.abs(Math.sin(k * 20)) : 0,
        clawOpen: [Math.max(0, Math.sin((t - .7) * 14)) * (t > .7 && t < 1.15), Math.max(0, Math.sin((t - .75) * 14)) * (t > .75 && t < 1.2)],
      };
      dave(c, o);
      for (const d of [-1, 1]) puff(c, 540 + d * 260, 1665, k, { a0: d > 0 ? -.3 : Math.PI - .2, spread: .5 * d, n: 8, r: 70, speed: 420, seed: d + 5 });
      c.restore();
      vignette(c, .3);
    } },
  // 2. "Dave is a crab." — low close-up, claws up + snap snap snap
  { a: 1.22, b: 2.47,
    draw(c, t) {
      const cam = { x: 540, y: 1240, z: kf(t, [[0, 1.45], [.22, 1.02, 'out5'], [1.25, 1.07, 'lin']]), r: kf(t, [[0, -.12], [.22, -.025, 'out5'], [1.25, -.01]]) };
      const ku = t - .68; const sk = ku > 0 ? 9 * Math.exp(-ku * 9) : 0; [cam.sx, cam.sy] = shake(t, sk, 25, 3);
      bgLayer(c, IMG.bg_pebbles, cam, { p: .8, s: 1.18, oy: -60, filter: 'blur(2px)' });
      c.save(); applyCam(c, cam);
      const up = ku > 0 ? spring(ku, 2.4, .5) * 1.9 : 0;
      const snap = ku > .1 ? Math.max(0, Math.sin((ku - .1) * TAU * 3.6)) : 0;
      const o = {
        t: t + 3, x: 540, y: 1620, s: .8, hop: ku > 0 ? 50 * Math.max(0, wob(ku, 2.2, 5)) : 0,
        sy: 1 + (ku > 0 ? .07 * wob(ku, 3, 6) : 0), sx: 1 - (ku > 0 ? .05 * wob(ku, 3, 6) : 0),
        clawUp: [up, up], clawOpen: [snap, Math.max(0, Math.sin((ku - .16) * TAU * 3.6)) * (ku > .16)],
        eye: ku > 0 ? { top: .42, tilt: -.08, ly: -.15 } : { top: .14, lx: kf(t, [[0, -.5], [.3, 0]]) },
        mouth: ku > 0 ? { type: 'grin', w: 110, open: 1 } : { type: 'smile', w: 100 },
        breath: 1.5,
      };
      dave(c, o);
      if (ku > .1) for (const [bx, i] of [[-90, 0], [995, 1]]) {
        const p = davePt(o, bx, -250);
        for (let n = 0; n < 3; n++) { const kk = ((ku - .1 - i * .05) * 3.6 - n) ; if (kk > 0 && kk < .5) burstLines(c, p[0], p[1], 40 + kk * 120, 1 - kk * 2, 5 + n); }
      }
      c.restore();
      vignette(c, .3);
    } },
  // 3. "And Dave is about to become a" — ominous push into his eyes
  { a: 2.47, b: 4.24,
    draw(c, t) {
      const u = E.inOut(seg(t, 0, 1.77));
      const cam = { x: 540, y: lerp(1260, 1440, u), z: lerp(1.0, 2.35, Math.pow(u, 1.4)), r: lerp(0, .05, u) };
      [cam.sx, cam.sy] = shake(t, 3 + 4 * u, 3, 7);
      bgLayer(c, IMG.bg_pool, cam, { p: .7, s: 1.15, oy: -80, filter: `saturate(${1 - u * .35}) brightness(${1 - u * .25})` });
      c.save(); applyCam(c, cam);
      const dart = t > 1.15 ? kf(t, [[1.15, 0], [1.25, -.85, 'out'], [1.45, -.85], [1.53, .85, 'out'], [1.77, .85]]) : 0;
      const o = {
        t, x: 540, y: 1650, s: .62, breath: 2,
        eye: { top: lerp(.14, .3, u), lx: dart, ly: .05, tilt: .12 * u, pupil: lerp(.26, .2, u) },
        mouth: t > 1.2 ? { type: 'wavy', w: 95 } : { type: 'flat', w: 80 },
        blink: kf(t, [[.5, 0], [.55, 1, 'lin'], [.62, 0, 'lin']]),
      };
      dave(c, o);
      if (t > 1.3) { const kk = t - 1.3; const p = davePt(o, 760, 150); sweat(c, p[0] + 10, p[1] + kk * 120, .7 * E.outBack(clamp(kk * 6)), clamp(1.6 - kk * 2)); }
      c.restore();
      vignette(c, .3 + .45 * u);
    } },
  // 4. "MOM" — smash: bonnet slams on, lashes, hearts
  { a: 4.24, b: 4.88,
    draw(c, t) {
      const cam = { x: 540, y: 1180, z: kf(t, [[0, 1.4], [.16, 1.0, 'out5'], [.64, 1.04, 'lin']]), r: kf(t, [[0, .08], [.16, 0, 'out5']]) };
      const sk = 22 * Math.exp(-t * 9); [cam.sx, cam.sy] = shake(t, sk, 26, 11);
      bgLayer(c, IMG.bg_pink, cam, { p: .6, s: 1.2 });
      c.save(); applyCam(c, cam);
      const b = clamp(E.outBack(seg(t, 0, .14), 2.4));
      const o = {
        t, x: 540, y: 1560, s: .82, bonnet: b, bonnetRot: wob(t - .12, 3, 6) * .12,
        sy: 1 - .12 * Math.max(0, wob(t - .1, 3.5, 7)), sx: 1 + .1 * Math.max(0, wob(t - .1, 3.5, 7)),
        eye: { top: 0, pupil: .16, ly: -.1 }, eyePop: 14 * Math.abs(Math.sin(t * 34)) * Math.exp(-t * 4),
        lashes: t > .06 ? 1 + E.outBack(seg(t, .06, .2)) * .6 : 0, blush: seg(t, .1, .3),
        mouth: { type: 'o', w: 100, open: E.outBack(seg(t, 0, .12)) }, clawUp: [.5, .5], clawOpen: [.7, .7],
      };
      dave(c, o);
      for (let i = 0; i < 7; i++) {
        const kk = t - .08 - i * .025; if (kk < 0) continue;
        const an = -Math.PI / 2 + (i - 3) * .42, d = 260 + kk * 900 * (1 - kk);
        heartShape(c, 540 + Math.cos(an) * d * 1.3, 1180 + Math.sin(an) * d - kk * 120, 70 * E.outBack(clamp(kk * 5)) * (1 - kk * .6), '#ff3d7f', 7);
      }
      for (let i = 0; i < 6; i++) sparkle(c, 540 + Math.cos(i * 1.1) * 430, 1150 + Math.sin(i * 1.7) * 380, 34 * Math.abs(Math.sin(t * 9 + i)), t * 2, seg(t, .1, .2));
      c.restore();
      vignette(c, .22);
      flash(c, 1 - seg(t, 0, .12));
    } },
  // 5. "Dave was walking sideways" — wide tracking walk, whistling
  { a: 4.88, b: 6.27,
    draw(c, t) {
      const dx = lerp(150, 900, t / 1.39);
      const cam = { x: 540 + (dx - 540) * .35, y: 1100, z: 1.0, r: 0 };
      [cam.sx, cam.sy] = shake(t, 4, 2, 13);
      bgLayer(c, IMG.bg_waves, cam, { p: .6, s: 1.15 });
      c.save(); applyCam(c, cam);
      const o = { t, x: dx, y: 1400, s: .5, walk: t * 3.6, walkAmt: 1, dir: 1, eye: { happy: true }, mouth: { type: 'whistle', w: 90 } };
      dave(c, o);
      const mp = davePt(o, 452, 400);
      notesFx(c, t, mp[0] + 30, mp[1] - 60, .28, 3, .85);
      for (let i = 0; i < 6; i++) puff(c, lerp(150, 900, (i + .5) * .28 / 1.39) - 160, 1395, t - (i + .5) * .28, { n: 5, r: 30, speed: 160, a0: Math.PI, spread: .6, seed: i, alpha: .45 });
      c.restore();
      vignette(c, .25);
    } },
  // 6. "minding his business" — low close tracking, background scrolls
  { a: 6.27, b: 7.18,
    draw(c, t) {
      const cam = { x: 540, y: 1250, z: 1.0, r: -.02 };
      [cam.sx, cam.sy] = shake(t, 6, 3, 17);
      bgLayer(c, IMG.bg_pool2, cam, { p: 1, s: 1.3, ox: 150 - t * 270, oy: -120 });
      c.save(); applyCam(c, cam);
      const o = { t, x: 520 + t * 40, y: 1640, s: .7, walk: t * 3.6 + .3, walkAmt: 1, dir: 1, eye: { happy: true }, mouth: { type: 'whistle', w: 90 } };
      dave(c, o);
      const mp = davePt(o, 452, 400);
      notesFx(c, t + .2, mp[0] + 40, mp[1] - 80, .3, 9, 1.1);
      c.restore();
      vignette(c, .28);
    } },
  // 7. "when a tiny barnacle larva" — larva drifts down through sunlit water
  { a: 7.18, b: 8.56,
    draw(c, t) {
      const by = lerp(-80, 1250, E.sine(t / 1.38)), bx = 560 + Math.sin(t * 3.2) * 70;
      const zi = E.out5(seg(t, .2, .45)), cz = lerp(1.0, 1.55, zi);
      const cam = { x: lerp(540, bx, zi), y: lerp(900, by, .8), z: cz, r: Math.sin(t * 1.2) * .02 };
      bgLayer(c, IMG.bg_under, cam, { p: .45, s: 1.25 });
      godrays(c, t + 7, .2);
      c.save(); applyCam(c, cam);
      snow(c, t + 3, 60, 11, .6);
      for (let i = 0; i < 10; i++) { const r = rng(40 + i); const yy = ((1900 - (t + r() * 3) * (180 + r() * 120)) % 2200 + 2200) % 2200 - 100; bubble(c, r() * 1080 + Math.sin(t * 3 + i) * 15, yy, 6 + r() * 14, .8); }
      barbara(c, { x: bx, y: by, s: .2, rot: Math.sin(t * 3.2) * .18 + .25 + Math.sin(t * 30) * .04, sy: 1 + Math.sin(t * 30) * .04, bow: false, eye: { top: .1, ly: .3, lx: .2 }, mouth: { type: 'smile' } });
      if (t > .2) { // "tiny" highlight ring
        const kk = t - .2, R = 150 * E.outBack(clamp(kk * 4)) / cz * 1.4;
        c.save(); c.globalAlpha = clamp((1.15 - kk) * 3); c.setLineDash([22, 16]); c.lineDashOffset = -kk * 80; c.lineWidth = 9 / cz * 1.4; c.strokeStyle = '#fff';
        c.beginPath(); c.arc(bx, by, R, 0, TAU); c.stroke(); c.restore();
      }
      c.restore();
      vignette(c, .3);
    } },
  // 8a. "landed" — Dave strolling, larva drops toward him
  { a: 8.56, b: 9.05,
    draw(c, t) {
      const stop = E.out(seg(t, .18, .36));
      const dx = 330 + 300 * E.out(seg(t, 0, .36));
      const cam = { x: 600, y: 1100, z: 1.12, r: 0 };
      bgLayer(c, IMG.bg_waves, cam, { p: .6, s: 1.15, ox: -120 });
      c.save(); applyCam(c, cam);
      const o = { t, x: dx, y: 1400, s: .5, walk: t * 3.6 + .6, walkAmt: 1 - stop, dir: 1,
        eye: t < .3 ? { happy: true } : { top: 0, ly: .7, lx: .55, pupil: .2 }, mouth: t < .3 ? { type: 'whistle', w: 90 } : { type: 'o', w: 70 }, eyePop: t > .3 ? 14 * Math.exp(-(t - .3) * 9) : 0 };
      dave(c, o);
      const tgt = davePt(o, 950, 420);
      const fy = lerp(-200, tgt[1], E.in(seg(t, .05, .45)));
      if (t < .47) barbara(c, { x: tgt[0] + 20, y: fy, s: .13, rot: t * 6, bow: false, eye: { top: 0 } });
      c.restore();
      vignette(c, .25);
    } },
  // 8b. "on his leg" — macro: she lands, squash, dust
  { a: 9.05, b: 9.72,
    draw(c, t) {
      const BO = { s: 1.0, ox: -250, oy: 0 };
      const land = .16, k = t - land;
      const cam = { x: 540, y: 980, z: lerp(1.05, 1.15, t / .67), r: 0 };
      if (k > 0) [cam.sx, cam.sy] = shake(t, 12 * Math.exp(-k * 9), 25, 19);
      bgLayer(c, IMG.bg_macro, cam, { p: 1, ...BO });
      c.save(); applyCam(c, cam);
      const [gx, gy] = bgPt(IMG.bg_macro, BO, 610, 640);
      const sq = k > 0 ? Math.exp(-k * 7) * Math.cos(TAU * 3 * k) : 0;
      shadowEllipse(c, gx, gy + 40, 150, 30, .4 * (k > 0 ? 1 : clamp(1 + k * 4)));
      barbara(c, { x: gx, y: k < 0 ? lerp(-500, gy - 40, E.in(seg(t, 0, land))) : gy - 40, s: .42, sx: k < 0 ? .88 : 1 + .22 * sq, sy: k < 0 ? 1.18 : 1 - .3 * sq,
        bow: false, eye: k < .05 ? { top: 0, pupil: .18 } : { top: .15, ly: .1 }, mouth: { type: k < .1 ? 'o' : 'smile' }, blink: kf(t, [[.42, 0], [.47, 1, 'lin'], [.53, 0, 'lin']]) });
      puff(c, gx, gy + 30, k, { n: 10, r: 60, speed: 380, a0: Math.PI * 1.05, spread: Math.PI * .9, col: '200,190,120', seed: 21, flat: .3 });
      c.restore();
      vignette(c, .3);
    } },
  // 9. "Her name is Barbara." — glamour close-up, bow pops, name tag slaps, wink
  { a: 9.72, b: 10.97,
    draw(c, t) {
      const cam = { x: 540, y: 1000, z: kf(t, [[0, 1.12], [.2, 1.0, 'out'], [1.25, 1.07, 'lin']]), r: Math.sin(t * 1.5) * .015 };
      bgLayer(c, IMG.bg_pink, cam, { p: .5, s: 1.35, ox: -120, oy: 150, filter: 'hue-rotate(-12deg)' });
      c.save(); applyCam(c, cam);
      const fy = 1020 + Math.sin(t * 2.6) * 22;
      const kt = t - .64;
      barbara(c, { x: 540, y: fy, s: .9, rot: Math.sin(t * 2.2) * .05 - .04, bow: t > .05,
        eye: (t > .98 && t < 1.2) ? { happy: true, lid: '#d9a040' } : { top: .12, lx: .15, ly: .05 },
        mouth: { type: t > .64 ? 'grin' : 'smile', open: .8 }, blush: seg(t, .2, .5) });
      if (t > .05) { const kb = t - .05; c.save(); c.translate(...[540 - 0, fy]); c.restore(); }
      if (kt > 0) nameTag(c, 700, 1430, .95 * (1 + (1 - spring(kt, 3, .45)) * 1.4), -.1 + wob(kt, 3, 5) * .4, 'BARBARA');
      for (let i = 0; i < 9; i++) { const an = t * 1.2 + i * TAU / 9; sparkle(c, 540 + Math.cos(an) * 470, 1000 + Math.sin(an) * 420, 30 * (.5 + .5 * Math.sin(t * 7 + i * 2)), an, .9); }
      c.restore();
      vignette(c, .2);
    } },
  // 10. "Barbara found one little hair on Dave's leg" — macro crawl, hair glows, heart eyes
  { a: 10.97, b: 13.42,
    draw(c, t) {
      const BO = { s: 1.0, ox: -250, oy: 0 };
      const [hx, hy] = bgPt(IMG.bg_macro, BO, 705, 465), [tx, ty] = bgPt(IMG.bg_macro, BO, 515, 55);
      const cam = { x: lerp(470, hx - 120, E.inOut(seg(t, 0, 2.45))), y: lerp(980, hy - 60, E.inOut(seg(t, 0, 2.45))), z: lerp(1.0, 1.4, E.inOut(seg(t, 0, 2.45))), r: 0 };
      bgLayer(c, IMG.bg_macro, cam, { p: 1, ...BO });
      c.save(); applyCam(c, cam);
      const arrive = E.out(seg(t, 0, .85));
      const bx = lerp(-150, hx - 190, arrive), by = lerp(hy + 60, hy - 20, arrive) + (arrive < 1 ? Math.abs(Math.sin(t * 16)) * -10 : 0);
      shadowEllipse(c, bx, by + 70, 120, 24, .35);
      const glow = seg(t, .58, .8);
      if (glow > 0) {
        c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
        const pulse = .6 + .4 * Math.sin(t * 9);
        c.strokeStyle = `rgba(255,220,90,${.55 * glow * pulse})`; c.lineWidth = 26; c.shadowColor = 'rgba(255,210,60,1)'; c.shadowBlur = 40;
        const gl = E.out(glow);
        c.beginPath(); c.moveTo(hx, hy); c.lineTo(lerp(hx, tx, gl), lerp(hy, ty, gl)); c.stroke();
        c.restore();
        const sp = (t * .9) % 1; sparkle(c, lerp(hx, tx, sp), lerp(hy, ty, sp), 34, t * 3, glow);
        sparkle(c, tx, ty, 44 * (.7 + .3 * Math.sin(t * 8)), t, glow);
        arrow(c, hx + 330, hy - 360 + Math.sin(t * 8) * 14, hx + 70, hy - 160 + Math.sin(t * 8) * 14, 20, '#ffe14a', glow);
      }
      const love = t > 1.2;
      barbara(c, { x: bx, y: by, s: .27, rot: arrive < 1 ? Math.sin(t * 16) * .05 : -.05, bow: true,
        eye: love ? { heart: true, heartPulse: Math.abs(Math.sin(t * 8)) } : { top: .1, lx: glow > 0 ? .6 : .3, ly: glow > 0 ? -.5 : 0 }, mouth: { type: love ? 'grin' : 'smile', open: .8 }, blush: love ? 1 : 0 });
      if (love) for (let i = 0; i < 5; i++) { const kk = ((t - 1.2) * .9 + i * .2) % 1; heartShape(c, bx + 40 + Math.sin(kk * 6 + i) * 40, by - 90 - kk * 260, 46 * (1 - kk * .4), '#ff3d7f', 6); }
      c.restore();
      vignette(c, .3);
    } },
  // 11. "and squeezed in right next to it." — she wiggles into the gap, POP
  { a: 13.42, b: 15.86,
    draw(c, t) {
      const BO = { s: 1.0, ox: -250, oy: 0 };
      const [hx, hy] = bgPt(IMG.bg_macro, BO, 705, 465);
      const gx = hx - 95, gy = hy + 28;
      const pop = 1.98, kp = t - pop;
      const cam = { x: lerp(hx - 120, gx, E.out(seg(t, 0, .4))), y: lerp(hy - 60, gy - 40, E.out(seg(t, 0, .4))), z: kf(t, [[0, 1.4], [.4, 1.85, 'out'], [1.9, 2.05, 'lin'], [2.1, 1.7, 'out']]), r: 0 };
      if (kp > 0) [cam.sx, cam.sy] = shake(t, 16 * Math.exp(-kp * 8), 26, 23);
      else[cam.sx, cam.sy] = shake(t, 2.5 * seg(t, .3, .5), 30, 23);
      bgLayer(c, IMG.bg_macro, cam, { p: 1, ...BO });
      c.save(); applyCam(c, cam);
      const turn = E.inOut(seg(t, 0, .3));
      const d = E.inOut(seg(t, .3, 1.95));           // how far into the gap
      const wig = t > .3 && t < 1.95 ? 1 : 0;
      const ang = lerp(-.05, 1.25, turn);
      const len = 300;                                   // body length in world px at this scale
      const bx = lerp(hx - 190, gx - Math.cos(ang) * len * .5, turn) + Math.cos(ang) * d * len * .95 + Math.sin(t * 34) * 6 * wig;
      const by = lerp(hy - 20, gy - Math.sin(ang) * len * .5, turn) + Math.sin(ang) * d * len * .95;
      if (kp < 0) {
        c.save();
        c.beginPath(); c.moveTo(gx - 900, gy - 2000); c.lineTo(gx + 900, gy - 2000); c.lineTo(gx + 900, gy - 130); c.lineTo(gx + 40, gy - 6); c.lineTo(gx - 40, gy + 6); c.lineTo(gx - 900, gy + 120); c.closePath(); c.clip();
        barbara(c, { x: bx, y: by, s: .27, rot: ang, sx: 1 + .08 * Math.sin(t * 18) * wig, sy: 1 - .2 * Math.abs(Math.sin(t * 18)) * wig, bow: true,
          eye: d > .2 ? { top: .55, tilt: -.2 } : { heart: true, heartPulse: Math.abs(Math.sin(t * 8)) }, mouth: { type: d > .2 ? 'grin' : 'smile', open: 1 }, blush: 1 });
        c.restore();
        if (wig) puff(c, gx, gy, (t * 3) % .5, { n: 6, r: 22, speed: 160, a0: -Math.PI * .9, spread: Math.PI * .8, col: '210,200,140', seed: Math.floor(t * 6), life: .5, alpha: .5 });
      }
      if (kp > 0) {
        burst(c, gx, gy - 10, 140 * E.outBack(clamp(kp * 6)) * (1 - clamp((kp - .25) * 3)), kp, 1, '#fff6c8', 12);
        puff(c, gx, gy, kp, { n: 12, r: 46, speed: 500, a0: -Math.PI, spread: Math.PI, col: '230,220,170', seed: 77, life: .6 });
        for (let i = 0; i < 8; i++) { const an = -Math.PI / 2 + (i - 3.5) * .38, dd = 60 + kp * 420 * Math.exp(-kp * 2); sparkle(c, gx + Math.cos(an) * dd, gy - 10 + Math.sin(an) * dd, 30 * (1 - clamp(kp * 1.8)), kp * 4, 1); }
        if (kp > .15) { const kk = kp - .15; heartShape(c, gx + Math.sin(kk * 5) * 20, gy - 60 - kk * 200, 54 * E.outBack(clamp(kk * 5)), '#ff3d7f', 7); }
      }
      c.restore();
      vignette(c, .32);
    } },
  // 12. button — Dave, totally unbothered
  { a: 15.86, b: DUR,
    draw(c, t) {
      const cam = { x: 540, y: 1250, z: 1.15 + t * .05, r: 0 };
      bgLayer(c, IMG.bg_pool, cam, { p: .7, s: 1.15, oy: -80 });
      c.save(); applyCam(c, cam);
      dave(c, { t, x: 540, y: 1650, s: .66, eye: { top: .5, lx: 0, ly: .1 }, blink: kf(t, [[.18, 0], [.26, 1, 'lin'], [.36, 1], [.44, 0, 'lin']]), mouth: { type: 'flat', w: 80 } });
      c.restore();
      vignette(c, .3);
      flash(c, seg(t, .42, .54), '0,0,0');
    } },
];
function burstLines(c, x, y, r, a, seed) {
  if (a <= 0) return; c.save(); c.globalAlpha = a; c.strokeStyle = '#fff'; c.lineCap = 'round'; c.lineWidth = 9;
  c.shadowColor = 'rgba(0,0,0,.6)'; c.shadowBlur = 6;
  for (let i = 0; i < 6; i++) { const an = i * TAU / 6 + seed; c.beginPath(); c.moveTo(x + Math.cos(an) * r * .55, y + Math.sin(an) * r * .55); c.lineTo(x + Math.cos(an) * r, y + Math.sin(an) * r); c.stroke(); }
  c.restore();
}
