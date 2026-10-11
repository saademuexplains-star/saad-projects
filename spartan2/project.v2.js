// "The Spartan boy" v2 — 45.4 s, 1080x1920, 30 fps, no captions. Relit (flat + normal passes → deferred lights).
// Every shot is a small performance that acts out its line; the last frame is the first frame, so it loops.
// WORDS / STRONG come from words_header.js; animation + light helpers from anim.js.

const flk = (t, s) => { const w = seg(t, 0, .6) * (1 - seg(t, 44.8, 45.4)); return lerp(flick(0, s), flick(t, s), w); };
const BOY_CLOAKED = { ...BOY, id: 'bk', body: childBody({ tunic: '#6e5236', belt: '#3a2614', cloak: 1 }), faceExtra: boyFace(true) };
const spear = (x0, y0, x1, y1) => `<path d="M${F1(x0)} ${F1(y0)} L${F1(x1)} ${F1(y1)}" stroke="#4a3018" stroke-width="12" stroke-linecap="round" filter="url(#pcs)"/>
  <path d="M${F1(x1)} ${F1(y1)} l${F1((x1 - x0) * .06)} ${F1((y1 - y0) * .06)}" stroke="#9aa0a8" stroke-width="16" stroke-linecap="round" filter="url(#pms)"/>`;

// the boy on his mat in the lamp-lit room (shot 1 and the last shot share this framing → seamless loop)
const BOY_REST = { look: 8, lookY: -1, bIn: 8, bOut: 6, smirk: -.5, turn: 0 };
const boyHome = (pose) => kidb(330, 2350, 1.6, BOY, { ...BOY_REST, ...pose });
const momHome = (pose) => at(-40, 2700, 1.35, P(MOTHER, { lid: 1.8, smirk: -.2, tilt: 14, ...pose }));
// the mother's arm drawn separately (in front of the boy), in her placement frame
const momArm = (x, y, s, T, hand = 'open') => { const A = pArm(1, T, hand); return at(x, y, s, posedArm(1, [155, -925], A.el, A.wr, { r1: 25, r2: 22, r3: 19, S: OLV, sk: 'olive', sleeve: '#4e5f7e', sleeveLen: 1.85, cuff: '#c49a3c', hand, hs: 1.35 })); };
// her hand over his shoulder (the arm itself stays behind him): T is in her placement frame
const momHand = (x, y, s, T, hand = 'fist') => { const A = pArm(1, T, hand), ang = Math.atan2(A.wr[1] - A.el[1], A.wr[0] - A.el[0]) * 180 / Math.PI - 90; return at(x, y, s, HANDS[hand](1, A.wr[0], A.wr[1] - 3, 1.35, ang, { S: OLV, sk: 'olive' })); };
const floorMat = `<rect x="-400" y="2050" width="1880" height="500" fill="#4a2e18" filter="url(#pcl)"/><rect x="-400" y="2050" width="1880" height="500" filter="url(#strawT)" opacity=".7"/>`;

const SHOTS = [
  // 1 "You're seven when the soldiers come for you…" — he listens in the dark (eyes dart, a shadow crosses the light under
  //   the door), BANG: the door bursts, he flinches and throws his hands up, his mother jolts awake and grabs for him,
  //   the soldiers stride in under torchlight and the first one reaches for him
  { at: 0,
    draw(v, t) {
      const open = easeOut(seg(t, .96, 1.18)), pull = easeInOut(seg(t, 1.0, 1.7)), [jx, jy] = shakeXY(t, [[.98, 18, .5]]);
      const step = easeInOut(seg(t, 1.38, 2.15)), flinch = decay(t, .98, .35), bang = t > .97, w0 = seg(t, 0, .5);
      const s = lerp(2.0, 1.02, pull) + B(t) * .5, fx = lerp(330, 560, pull), fy = lerp(1110, 1000, pull);
      const C = camT(t, fx, fy, s, jx, jy);
      const look = bang ? lerp(10, 12, flinch) : kf(t, [[0, 8], [.28, 8], [.38, -4], [.56, -4], [.68, 10], [.97, 10]]);
      const turn = bang ? kf(t, [[.97, .3], [1.06, .85], [2.2, .7]]) : kf(t, [[0, 0], [.6, 0], [.82, .3]]);
      const jolt = -46 * decay(t, .98, .1) + 14 * spring(t, 1.02, 2.2, .22);
      const armR = kArm(1, kf(t, [[0, [30, -840]], [.98, [30, -840]], [1.1, [74, -1018]], [2.2, [62, -996]]]), bang ? 'open' : 'fist');
      const armL = kArm(-1, kf(t, [[0, [-120, -706]], [.98, [-120, -706]], [1.12, [-46, -1004]], [2.2, [-40, -984]]]), bang ? 'open' : 'relaxed');
      const boy = boyHome({ shock: bang ? 1 : 0, bIn: 8 + 6 * flinch, bOut: 6 + 6 * flinch, look, turn, tilt: -6 * flinch + sway(t, 0, 1) * w0,
        lid: blink(t, [.45]), talk: t > 1.2 ? .08 * Math.abs(Math.sin(t * 20)) : 0, breath: br(t, 0, bang ? 2 : 1.3) * w0, armL, armR });
      // mother: asleep, then bolts up and reaches for him
      const rise = easeOut(seg(t, 1.05, 1.45)), mx = lerp(-40, 0, rise), my = lerp(2700, 2640, rise), reachM = easeOut(seg(t, 1.32, 1.75));
      const mom = at(mx, my, 1.35, P(MOTHER, { lid: t < 1.05 ? 1.8 : .2, shock: t > 1.05 ? 1 : 0, bIn: t > 1.05 ? 12 : 0, bOut: t > 1.05 ? 10 : 0,
        tilt: lerp(14, 3, rise), turn: .5 * rise, look: 8 * rise, smirk: -.2, armR: reachM > .02 ? pArm(1, lerp2([190, -700], [(154 - mx) / 1.35, (1342 - my) / 1.35 - 4], reachM), 'fist') : undefined }));
      const momReach = reachM > .5 ? momHand(mx, my, 1.35, [(154 - mx) / 1.35, (1342 - my) / 1.35 - 4], 'fist') : '';
      // soldiers: stride in, the back one carries the torch high, the front one reaches
      const st = stride(t, .5, 24), walking = step > 0 && step < 1;
      const s1 = lerp(.74, .86, step), x1 = lerp(980, 870, step), y1 = lerp(1540, 1600, step) - (walking ? st.bob * s1 : 0);
      const s0 = lerp(.8, 1.0, step), x0 = lerp(860, 760, step), y0 = lerp(1570, 1680, step) - (walking ? stride(t, .5, 24, 1.3).bob * s0 : 0);
      const tArm = hArm(1, [150, -1120], 'fist'), tx = x1 + s1 * tArm.wr[0], ty = y1 + s1 * (tArm.wr[1] - 40);
      const back = manb(x1, y1, s1, SOLDIER, { armR: tArm, raiseLeft: 8, tilt: sway(t, 3, .8), ...(walking ? { legL: st.legL, legR: st.legR } : {}) });
      const st0 = stride(t, .5, 24, 1.3), reach = easeOut(seg(t, 1.62, 2.1));
      const front = manb(x0, y0, s0, SOLDIER, { armL: hArm(-1, kf(t, [[1.6, [-190, -690]], [2.1, [-330, -900]]]), 'open'), raiseRight: 6,
        tilt: sway(t, 0, .8), turn: -.3 * reach, look: -8, ...(walking ? { legL: st0.legL, legR: st0.legR } : {}) });
      // a shadow passes the line of light under the door before it bursts
      const feet = seg(t, .4, .86), under = (1 - open) * flk(t, 2);
      return `<g transform="${C.tf}">
        ${lights(C.v, RIG.home(t, { door: open }))}
        ${homeNight({ t, open, blur: 'dofLight' })}
        <path d="M760 1490 L1080 1490 L1080 1500 L760 1500 Z" fill="#ffb060" opacity="${(.85 * under).toFixed(2)}"/>
        ${feet > 0 && feet < 1 ? `<rect x="${F1(lerp(740, 1060, feet))}" y="1486" width="70" height="16" fill="#120a06" opacity="${(.9 * under).toFixed(2)}"/>` : ''}
        ${open > .02 ? `<g opacity="${Math.min(1, open * 1.5).toFixed(2)}">${back}${torch(tx, ty, t, { s: 1.0, seed: 5, glow: 1.2 })}${front}</g>` : ''}
        ${puff(900, 1350, t, .98, { col: '#c8a880', r: 160, n: 8, seed: 4, dur: 1.2, op: .45 })}
        ${mom}
        <g transform="translate(0 ${F1(jolt)})">${boy}</g>
        ${momReach}
        ${floorMat}
      </g>`;
    } },

  // 2 "and your mother isn't allowed to cry." — she holds his hand; a soldier's grip drags it out of hers; her fingers
  //   chase it; her lip trembles, her breath hitches; on CRY she squeezes her eyes shut and one tear escapes anyway
  { at: 2.19,
    draw(v, t) {
      const pullAway = easeIn(seg(t, 2.85, 3.55)), shut = bell(t, 3.48, 4.08), s = 1.04 + .06 * seg(t, 2.19, 4.1) + B(t) * .4;
      const tear = easeOut(seg(t, 2.3, 3.2)), run = easeInOut(seg(t, 3.6, 4.1)), hitch = decay(t, 3.0, .12) + decay(t, 3.3, .1);
      const C = camT(t, 500, 900, s);
      const hx = lerp(690, 1240, pullAway), hy = 1640 + 40 * pullAway - 10 * Math.sin(t * 7) * (1 - pullAway);
      const chase = easeOut(seg(t, 2.95, 3.7));
      return `<g transform="${C.tf}">
        ${lights(C.v, RIG.home(t, { door: 1, spill: .6 }))}
        ${homeNight({ t, open: 1, blur: 'dofHeavy' })}
        <g filter="url(#dof)">${at(860, 2050, 1.25, P(SOLDIER, { tilt: -4, raiseLeft: 10, breath: br(t, 2) }))}</g>${torch(1100, 700, t, { s: 1.3, seed: 6, glow: .8 })}
        <g transform="translate(0 ${F1(-8 * hitch)})">${atb(430, 3260, 2.35, P(MOTHER, { smirk: -1.3, bIn: 15 + 3 * shut, bOut: -4, lid: .2 + 1.6 * shut, tear, tearRun: run,
          talk: .04 + .06 * Math.abs(Math.sin(t * 23)) * (1 - shut), tilt: -3 + sway(t, 1, .8) - 3 * shut, turn: .25 * chase * (1 - shut), look: 6 * (1 - shut) + 4 * chase, lookY: 3 }), br(t, 1, 1.8))}</g>
        ${limb(700, 2200, lerp(660, 760, chase), lerp(1700, 1690, chase), 150, 120, { S: OLV, sk: 'olive', fill: '#4e5f7e' })}
        ${openHand(lerp(650, 790, chase), lerp(1640, 1630, chase), 1.1, -80 + 30 * chase + 6 * Math.sin(t * 9) * chase, { S: OLV, sk: 'olive' })}
        <g transform="translate(${F1(hx)} ${F1(hy)})">${limb(40, 0, 440, 40, 70, 80, { S: OLV, sk: 'olive', fill: '#9a6a3a' })}${fist(0, 0, .85, 90, { S: OLV, sk: 'olive' })}
          ${pullAway > .01 ? fist(170, 26, 1.25, 80, { S: OLV, sk: 'olive' }) + limb(200, 30, 640, -40, 120, 140, { S: OLV, sk: 'olive' }) : ''}</g>
      </g>`;
    } },

  // 3 "They take you to a camp," — dawn road: two soldiers march him (real strides, spears), he looks back over his shoulder
  //   and stumbles
  { at: 4.10,
    draw(v, t) {
      const p = seg(t, 4.0, 5.4), C = camT(t, 540 + 30 * p, 1150, 1.08 + .08 * p + B(t) * .4);
      const sA = stride(t, .56, 26), sB = stride(t, .56, 26, Math.PI * .8), sK = stride(t, .42, 22, .6);
      const look = kf(t, [[4.1, 0], [4.45, 0], [4.65, -1], [5.05, -1], [5.25, 0]]), stumble = decay(t, 4.9, .14);
      const soldier = (x, y, sc, stp, k) => manb(x, y - stp.bob * sc, sc, SOLDIER, { raiseLeft: 6 + stp.sway * 2, armR: hArm(1, [196, -720], 'fist'), legL: stp.legL, legR: stp.legR,
        tilt: sway(t, k, .8) + stp.sway, breath: br(t, k) }) + at(x, y - stp.bob * sc, sc, spear(214, -660, 236, -1560));
      return `<g transform="${C.tf}">
        ${lights(C.v, RIG.dawn(t, { sun: [760, 1000] }))}
        ${campDawn({ t, blur: 'dof' })}
        ${soldier(330, lerp(1660, 1760, p), lerp(.62, .7, p), sA, 2)}
        ${soldier(760, lerp(1680, 1780, p), lerp(.62, .7, p), sB, 5)}
        ${kidb(545, lerp(1700, 1800, p) - sK.bob * .5 + 12 * stumble, lerp(.5, .56, p), BOY, { look: lerp(-9, -12, look * -1), lookY: -1, bIn: 12, bOut: -2, smirk: -1,
          turn: .8 * look, tilt: 6 + sway(t) + 10 * stumble, tear: .6, lid: blink(t, [4.9]), legL: sK.legL, legR: sK.legR, breath: br(t, 1, 1.6),
          armL: kArm(-1, [-128 + 6 * sK.sway, -716], 'relaxed'), armR: kArm(1, [128 - 6 * sK.sway, -716], 'relaxed') })}
        ${puff(470, 1840, t, 4.9, { col: '#c8a880', r: 60, n: 5, seed: 8, dur: .8, op: .4 })}
      </g>`;
    } },

  // 4 "shave your head," — a big hand pins his head, the blade rakes twice, his head jerks with each stroke, hair tumbles
  { at: 5.29,
    draw(v, t) {
      const st1 = easeInOut(seg(t, 5.33, 5.66)), st2 = easeInOut(seg(t, 5.76, 6.12)), hair = 1 - .5 * st1 - .5 * st2;
      const cutX = 540 + lerp(-100, 100, hair) * 2.6, lift = bell(t, 5.66, 5.78) * 60, [jx, jy] = shakeXY(t, [[5.34, 6, .3], [5.77, 7, .3]]);
      const jerk = 18 * decay(t, 5.34, .12) + 22 * decay(t, 5.77, .12);
      const R = rng(4); let tufts = '';
      for (let i = 0; i < 22; i++) { const t0 = (i < 11 ? 5.36 : 5.79) + R() * .32, dt = t - t0; if (dt > 0 && dt < 1.2) { const x = 300 + R() * 520 + dt * (R() - .5) * 160, y = 880 + dt * 260 + dt * dt * 1100, r = dt * 400 * (R() - .5);
        tufts += `<path d="M${F1(x)} ${F1(y)} q${F1(14 + R() * 10)} ${F1(-10 + R() * 20)} ${F1(30 + R() * 20)} ${F1(R() * 20)}" stroke="#3a2416" stroke-width="${F1(5 + R() * 5)}" fill="none" stroke-linecap="round" transform="rotate(${F1(r)} ${F1(x)} ${F1(y)})"/>`; } }
      const C = camT(t, 540, 1080, 1.06 + .05 * seg(t, 5.29, 6.3) + B(t) * .4, jx, jy);
      return `<g transform="${C.tf}">
        ${lights(C.v, RIG.dawn(t, { sun: [200, 900], k: .9 }))}
        ${campDawn({ t, blur: 'dofHeavy' })}
        <g transform="translate(0 ${F1(jerk)}) rotate(${F1(jerk * .15)} 540 1400)">
          ${kidb(540, 3200, 2.6, { ...BOY, faceExtra: boyFace(false) }, { hair, lid: 1.75, bIn: 12, bOut: -2, grit: .75, tilt: -5 + tremble(t, .6), blush: .9, tear: easeOut(seg(t, 5.8, 6.2)), breath: br(t, 0, 2) })}
          ${openHand(400, 640, 1.25, 168, { S: OLV, sk: 'olive' })}${limb(120, 200, 380, 620, 150, 130, { S: OLV, sk: 'olive' })}
        </g>
        ${limb(1250, 300, cutX + 150, 860 - lift, 170, 140, { S: OLV, sk: 'olive' })}
        ${razor(cutX, 880 - lift, -8, 1.3)}
        ${fist(cutX + 150, 850 - lift, 1.3, 70, { S: OLV, sk: 'olive' })}
        ${tufts}
      </g>`;
    } },

  // 5 "take your shoes," — a pile of small sandals; a hand drops his pair on top; his bare feet walk past
  { at: 6.27,
    draw(v, t) {
      const drop = easeIn(seg(t, 6.42, 6.62)), [jx, jy] = shakeXY(t, [[6.62, 6, .3]]), step = seg(t, 6.55, 7.35), rel = t > 6.42;
      const sandal = (x, y, r, sc = 1, k = 0) => { const c = ['#b08850', '#9a7444', '#c09a60', '#8a6438'][k % 4];
        return `<g transform="translate(${F1(x)} ${F1(y)}) rotate(${F1(r)}) scale(${sc})">
        <path d="M-80 -4 C-84 -24 -62 -32 -32 -28 L40 -26 C72 -30 92 -16 90 2 C88 22 68 30 40 26 L-32 22 C-62 26 -82 16 -80 -4 Z" fill="${c}" stroke="#4a2c14" stroke-width="7" filter="url(#pcsl)"/>
        <path d="M-74 -2 C-72 -16 -56 -20 -32 -18 L40 -16 C66 -18 80 -10 80 2" stroke="${lighten(c, .3)}" stroke-width="5" fill="none" opacity=".6"/>
        <path d="M-48 -30 L-42 24 M6 -28 C16 -10 16 10 10 26 M50 -26 L62 2" stroke="#3a2010" stroke-width="10" stroke-linecap="round" fill="none"/></g>`; };
      const R = rng(8); let pile = '';
      for (let i = 0; i < 18; i++) pile += sandal(540 + (R() - .5) * 440 * (1 - i / 24), 1580 - i * 11 - R() * 18, (R() - .5) * 140, 1.0 + R() * .3, i);
      const bounce = Math.abs(spring(t, 6.62, 3, .12)) * 26;
      const sy = lerp(900, 1330, drop) - bounce, hx = lerp(700, 730, easeOut(seg(t, 6.42, 6.8))), hy = lerp(800, 720, easeOut(seg(t, 6.42, 6.8))) + 8 * Math.sin(t * 6) * (1 - drop);
      const pair = `${sandal(lerp(660, 590, drop), sy, lerp(-70, -14, drop) + 30 * Math.sin(t * 9) * (1 - drop) * (rel ? 1 : .2), 1.15, 2)}${sandal(lerp(720, 500, drop), sy + 20, lerp(-100, 16, drop), 1.15, 2)}`;
      const foot = (x, lift, far) => `<g transform="translate(${F1(x)} ${F1(1960 - lift)}) rotate(${F1(-lift * .25)}) scale(1.5)"${far ? ' style="filter:brightness(.72)"' : ''}>
        ${limb(-34, -360, -32, -84, 80, 66, { S: OLV, sk: 'olive' })}
        <path d="M-66 -96 C-70 -50 -74 -16 -64 0 L72 4 C98 4 106 -10 94 -20 C70 -32 40 -42 20 -62 C10 -76 6 -88 4 -100 Z" fill="${OLV.mid}" filter="url(#pks_olive)"/>
        ${[[86, -10, 13], [70, -5, 11], [56, -2, 10], [43, 0, 9]].map(([cx, cy, r]) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${OLV.hi}" opacity=".55"/>`).join('')}
        <path d="M-60 -60 C-50 -30 -20 -16 20 -14" stroke="${OLV.shade}" stroke-width="6" fill="none" opacity=".5"/></g>`;
      const fxp = -260 + 1250 * step, ph = t * 2 * Math.PI / .5;
      const feet = step > 0 && step < 1 ? [1, 0].map(k => foot(fxp + 110 * Math.sin(ph + k * Math.PI), 34 * Math.max(0, Math.cos(ph + k * Math.PI)), k)).join('') : '';
      const C = camT(t, 540, 1320, 1.22 + .06 * seg(t, 6.27, 7.3) + B(t) * .4, jx, jy);
      return `<g transform="${C.tf}">
        ${lights(C.v, RIG.dawn(t, { sun: [760, 1000] }))}
        ${campDawn({ t, blur: 'dofHeavy' })}
        <rect x="-300" y="1380" width="1700" height="1000" fill="#8a7454"/><rect x="-300" y="1380" width="1700" height="1000" filter="url(#sandT)" opacity=".6"/>
        <ellipse cx="540" cy="1590" rx="330" ry="60" fill="#2a1e14" opacity=".4" filter="url(#b14)"/>
        ${pile}
        ${!rel ? `<path d="M${F1(hx - 10)} ${F1(hy + 40)} L660 ${F1(sy - 20)} M${F1(hx + 10)} ${F1(hy + 40)} L720 ${F1(sy)}" stroke="#3a2010" stroke-width="8"/>` : ''}
        ${pair}
        ${limb(1250, 250, hx + 30, hy - 60, 160, 130, { S: OLV, sk: 'olive' })}
        ${rel ? openHand(hx, hy, 1.0, 165 - 10 * easeOut(seg(t, 6.42, 6.7)), { S: OLV, sk: 'olive' }) : fist(hx, hy, 1.0, 100, { S: OLV, sk: 'olive' })}
        ${puff(540, 1340, t, 6.62, { col: '#b8a07a', r: 120, n: 6, seed: 2, dur: 1, op: .5 })}
        ${feet}${step > 0 ? puff(fxp + 40, 1960, t, 6.9, { col: '#b8a07a', r: 70, n: 4, seed: 5, dur: .8, op: .35 }) + puff(fxp + 140, 1960, t, 7.15, { col: '#b8a07a', r: 60, n: 4, seed: 6, dur: .7, op: .3 }) : ''}
      </g>`;
    } },

  // 6 "and give you one thin cloak… for the whole year." — shivering in his tunic, a red cloak is flung at him; he wraps it
  //   tight; the wind tears at it, leaves stream past, then the rain comes; he hunches and looks up into it
  { at: 7.29,
    draw(v, t) {
      const p = easeInOut(seg(t, 7.3, 9.9)), season = seg(t, 8.6, 9.8), sh = tremble(t, 3 + 3 * season);
      const fly = seg(t, 7.29, 7.62), wrapped = t > 7.6, settle = spring(t, 7.6, 2.4, .3);
      const gust = Math.max(0, Math.sin(t * 2.3)) ** 3, hunch = easeInOut(seg(t, 8.9, 9.5)), up = bell(t, 9.0, 9.5);
      const C = camT(t, 540, lerp(1200, 1080, p), lerp(1.0, 2.0, p) + B(t) * .4);
      const pose = { bIn: 12, bOut: -2, smirk: -.9, lid: .2 + blink(t, [8.1, 9.3]), talk: .06 * Math.abs(Math.sin(t * 30)), tilt: -4 + sway(t, 2, 1.5) + 6 * hunch,
        lookY: 2 + 3 * hunch - 7 * up, tear: .5 + .5 * season, blush: 1, breath: br(t, 0, 2.2) };
      const boy = wrapped ? kidb(540 + sh, 1560 + 10 * hunch, .82, BOY_CAMP, { ...pose, flap: Math.sin(t * 9) * 1.2 + 2.4 * gust + 3 * settle })
        : kidb(540 + sh, 1560, .82, BOY_BARE, { ...pose, armL: kArm(-1, [60, -840], 'fist'), armR: kArm(1, [-60, -860], 'fist') });
      // the flung cloak: a red cloth tumbling in from the top right onto his shoulders
      const cx = lerp(1150, 545, easeIn(fly)), cy = lerp(520, 1010, easeIn(fly)), cr = lerp(-60, 0, fly), cs = lerp(1.3, .8, fly);
      const cloth = !wrapped && t > 7.29 ? `<g transform="translate(${F1(cx)} ${F1(cy)}) rotate(${F1(cr + 20 * Math.sin(t * 14))}) scale(${F1(cs)})">
        <path d="M-150 -60 C-60 -110 60 -80 160 -50 C190 40 170 160 130 220 C40 250 -60 240 -140 220 C-170 140 -180 40 -150 -60 Z" fill="url(#spRed)" filter="url(#pcl)"/>
        <path d="M-120 -30 C-40 0 20 80 40 200 M40 -60 C70 40 90 120 100 210" stroke="#4a0a06" stroke-width="10" fill="none" opacity=".45"/></g>` : '';
      return `<g transform="${C.tf}">
        ${lights(C.v, RIG.hill(t, season))}
        ${campDawn({ t, blur: 'dofHeavy' })}
        <rect x="-400" y="-400" width="1880" height="2720" fill="#3a4a62" opacity="${(.55 * season).toFixed(2)}" style="mix-blend-mode:multiply"/>
        <path d="M-400 1500 Q540 1300 1480 1500 L1480 2400 L-400 2400 Z" fill="${mix('#9a7a4e', '#4a5040', season)}"/>
        ${leaves(t, (1 - season) * (.5 + gust))}
        ${boy}${cloth}
        ${steam(560, 880, t, .6, { n: 4, h: 140, seed: 6, col: '#e8eef8' })}
        ${rain(t, season)}
      </g>`;
    } },

  // 7 "You sleep on reeds you ripped from the river" — he grips the bundle, leans back and strains (trembling, feet
  //   slipping), RIPPED: it tears free, he staggers back in a burst of water; the other boys haul at theirs
  { at: 9.99,
    draw(v, t) {
      const strain = seg(t, 10.0, 11.0), yank = easeOut(seg(t, 11.0, 11.25)), [jx, jy] = shakeXY(t, [[11.02, 9, .35]]);
      const lean = -8 * strain + 10 * yank - 6 * easeInOut(seg(t, 11.3, 11.8)), back = -40 * yank + 30 * spring(t, 11.05, 1.8, .3);
      const bx = 540, by = 1700, sc = 1.0;
      const Hx = bx, Hy = by + 300 - 615 - 250 * yank, Rx = bx - 170 + 50 * yank, Ry = 1770 - 320 * yank;
      const L0 = Math.hypot(Hx - Rx, Hy - Ry), ux = (Hx - Rx) / L0, uy = (Hy - Ry) / L0, Tx = Hx + ux * 540, Ty = Hy + uy * 540;
      const hl = [(Hx - ux * 38 - bx) / sc, (Hy - uy * 38 - by - 300) / sc], hr = [(Hx + ux * 38 - bx) / sc, (Hy + uy * 38 - by - 300) / sc];
      const bundle = [-30, -15, 0, 15, 30].map((dx, i) => `<path d="M${F1(Rx + dx * .4)} ${F1(Ry)} Q${F1(Hx + dx * .5 + tremble(t, 3 * strain))} ${F1(Hy)} ${F1(Tx + dx * 2.2 + Math.sin(t * 2 + i) * 8)} ${F1(Ty + dx * .6)}" stroke="${['#5a6a2a', '#7a8a3a', '#4a5a22', '#6a7a32', '#5e6e2c'][i]}" stroke-width="16" fill="none"/>`).join('');
      const bot = Ry;
      const other = (x, y, s, i) => { const ph = i * 1.9, pl = Math.max(0, Math.sin(t * 3.2 + ph));
        return `<g transform="rotate(${F1(-7 * pl)} ${x} ${F1(y + 300 * s)})">${kidb(x, y, s, { ...BOY_BARE, id: 'ob' + i }, { armL: kArm(-1, [-10, -700 - 60 * pl], 'fist'), armR: kArm(1, [10, -640 - 60 * pl], 'fist'),
          lid: .6, grit: .5 + .4 * pl, tilt: sway(t, i * 4, 3), breath: br(t, i, 2) })}<path d="M${x} ${F1(y + 300 * s - 700 * s - 60 * pl * s)} l${F1(120 * s)} ${F1(-360 * s)}" stroke="#6a7a32" stroke-width="${F1(14 * s)}"/></g>`; };
      const C = camT(t, 540, 1250, 1.15 + .06 * strain + B(t) * .4, jx, jy);
      return `<g transform="${C.tf}">
        ${lights(C.v, RIG.dusk(t, { sun: [300, 960] }))}
        ${riverDusk({ t, blur: 'dof' })}
        ${other(220, 1520, .5, 0)}${other(870, 1500, .45, 1)}
        <g transform="translate(${F1(back)} 0) rotate(${F1(lean + tremble(t, 1.2 * strain))} ${bx} ${by + 300})">
          ${kidb(bx, by, sc, BOY_BARE, { armL: kArm(-1, hl, 'fist'), armR: kArm(1, hr, 'fist'), grit: .9 * (1 - yank * .6), lid: .9 - .7 * yank, bIn: -4 + 12 * yank, bOut: 4,
            tilt: tremble(t, 1.4 * strain) - 6 * yank, shock: yank > .5 && t < 11.6 ? 1 : 0, breath: br(t, 0, 2.4) })}
          ${bundle}<ellipse cx="${F1(Rx)}" cy="${F1(bot + 6)}" rx="40" ry="20" fill="#3a2a1a"/>
        </g>
        <defs>${linG('rvW', ['#e8a058', '#8a5048', '#3a2838'], { x2: 0, y2: 1 })}</defs>
        <rect x="-400" y="1720" width="1880" height="900" fill="url(#rvW)" opacity=".92"/>
        ${[0, 1, 2, 3, 4, 5].map(i => `<ellipse cx="${F1(540 + Math.sin(t * .8 + i) * 300)}" cy="${1760 + i * 60}" rx="${160 - i * 15}" ry="5" fill="#ffe0a0" opacity="${(.5 - i * .07).toFixed(2)}"/>`).join('')}
        <ellipse cx="${bx}" cy="1724" rx="${F1(160 + 40 * Math.sin(t * 3) + 120 * yank)}" ry="${F1(14 + 10 * yank)}" fill="none" stroke="#ffe8c0" stroke-width="5" opacity="${(.6 - .3 * yank).toFixed(2)}"/>
        ${spray(bx, 1720, t, 11.02, { n: 26, col: '#ffe8c0', spread: 300, up: 760, size: 10, seed: 5 })}
      </g>`;
    } },

  // 8 "with your bare hands," — the fists twist and haul; the stems slide through; the skin splits, blood beads and drips
  { at: 11.86,
    draw(v, t) {
      const work = seg(t, 11.9, 12.4), pull = Math.sin(t * 9) * 10 * (.4 + work), slide = 120 * easeInOut(seg(t, 11.9, 13.0));
      const twist = Math.sin(t * 9 + 1) * 7 * (.4 + work), cuts = [12.1, 12.25, 12.42, 12.58], drip = seg(t, 12.5, 13.1);
      const [jx, jy] = shakeXY(t, cuts.map(c => [c, 4, .2]));
      const C = camT(t, 540, 980, 1.05 + .07 * seg(t, 11.86, 13.1) + B(t) * .4, jx, jy);
      return `<g transform="${C.tf}">
        ${lights(C.v, RIG.dusk(t, { sun: [200, 900] }))}
        ${riverDusk({ t, blur: 'dofHeavy' })}
        ${[-60, -25, 10, 45].map((dx, i) => `<path d="M${540 + dx} ${F1(2100 - slide)} L${F1(540 + dx * .6 + Math.sin(t + i) * 6)} ${F1(-200 - pull - slide)}" stroke="${['#5a6a2a', '#7a8a3a', '#4a5a22', '#6a7a32'][i]}" stroke-width="30"/>`).join('')}
        ${limb(-100, 1500, 450, 760 + pull, 210, 170, { S: OLV, sk: 'olive' })}${limb(1180, 1900, 640, 1200 - pull, 210, 170, { S: OLV, sk: 'olive' })}
        ${fist(540, 760 + pull, 2.3, 180 + twist, { S: OLV, sk: 'olive' })}${fist(560, 1200 - pull, 2.3, -twist, { S: OLV, sk: 'olive' })}
        <g>${[[470, 700, 60, 18], [520, 820, 70, -10], [600, 1150, 80, 12], [520, 1260, 60, -14]].map(([x, y, l, a], i) => { const c = easeOut(seg(t, cuts[i], cuts[i] + .12));
          const yy = y + (i < 2 ? pull : -pull);
          return c > 0 ? `<path d="M${x} ${F1(yy)} l${F1(l * c)} ${F1(a * c)}" stroke="#a8120c" stroke-width="7" stroke-linecap="round"/><path d="M${x} ${F1(yy + 3)} l${F1(l * c)} ${F1(a * c)}" stroke="#ff6a5a" stroke-width="2" opacity=".6"/>` : ''; }).join('')}
          ${[[540, 830], [610, 1170]].map(([x, y], i) => `<path d="M${x} ${F1(y + (i ? -pull : pull))} q4 ${F1(30 * drip)} 0 ${F1(70 * drip)}" stroke="#8a0c08" stroke-width="9" stroke-linecap="round" fill="none"/>
            ${drip > .6 ? `<circle cx="${x + 1}" cy="${F1(y + 80 + 600 * (drip - .6) ** 2 + (i ? -pull : pull))}" r="7" fill="#8a0c08"/>` : ''}`).join('')}</g>
      </g>`;
    } },

  // 9 "and you wake up starving…" — slumped asleep, his eyes snap open; he looks around; the stomach growls and he doubles
  //   over, both hands clutching his belly
  { at: 13.08,
    draw(v, t) {
      const wake = seg(t, 13.25, 13.4), lift = easeOut(seg(t, 13.27, 13.5)), curl = easeInOut(seg(t, 13.6, 13.95)), [jx, jy] = shakeXY(t, [[13.62, 5, .4]]);
      const look = kf(t, [[13.3, 0], [13.42, -7], [13.52, 6], [13.62, 0]]);
      const hands = kf(t, [[13.6, 0], [13.85, 1]]);
      const C = camT(t, 540, 1040, 1.12 + .08 * seg(t, 13.08, 14.4) + B(t) * .4, jx, jy);
      return `<g transform="${C.tf}">
        ${lights(C.v, RIG.barracks(t))}
        ${barracksDawn({ t, blur: 'dofHeavy' })}
        <g filter="url(#dof)">${kidb(150, 1620, .55, { ...BOY_BARE, id: 'sb1' }, { lid: 1.9, tilt: 20, breath: br(t, 1, .7) })}${kidb(930, 1640, .55, { ...BOY_BARE, id: 'sb2' }, { lid: 1.9, tilt: -18, breath: br(t, 2, .7) })}</g>
        <g transform="translate(0 ${F1(40 * (1 - lift) + 60 * curl)}) rotate(${F1(6 * (1 - lift) + 5 * curl)} 540 2900)">
          ${kidb(540, 2400, 1.75, BOY_BARE, { lid: 1.9 - 1.9 * wake + blink(t, [13.95]), look, lookY: 2 + 3 * curl, bIn: 6 + 8 * curl, bOut: -2, smirk: -.8,
            tilt: 8 * (1 - lift) + 5 * curl + sway(t, 1, 1), grit: .45 * curl, blush: .2, breath: br(t, 0, 1.6 + curl),
            armL: kArm(-1, kf(t, [[13.6, [-122, -706]], [13.85, [-26, -770]]]), hands > .5 ? 'fist' : 'relaxed'), armR: kArm(1, kf(t, [[13.6, [122, -706]], [13.85, [34, -740]]]), hands > .5 ? 'fist' : 'relaxed') })}
        </g>
        <rect x="-400" y="1880" width="1880" height="600" fill="#5a5636"/>${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => `<path d="M${-300 + i * 130} ${1900 + (i % 3) * 30} l${120 + (i % 4) * 30} ${-10 + (i % 5) * 6}" stroke="${['#a8a060', '#8a8a4a', '#c8b870'][i % 3]}" stroke-width="10"/>`).join('')}
      </g>`;
    } },

  // 10 "because they starve you on purpose." — the trainer tears a bite of bread and chews with his eyes half shut;
  //   crumbs fall; on PURPOSE he grins down at the boys and dangles the bread; their eyes follow it
  { at: 14.35,
    draw(v, t) {
      const grin = easeOut(seg(t, 15.3, 15.6)), chew = t > 14.58 && t < 15.35 ? .28 * Math.abs(Math.sin(t * 11)) : 0;
      const T = kf(t, [[14.35, [220, -780]], [14.5, [70, -990]], [14.62, [70, -990]], [14.9, [200, -800]], [15.4, [190, -820]], [15.62, [-40, -850]]]);
      const dangle = t > 15.62 ? Math.sin((t - 15.62) * 9) * 22 : 0, Tw = [T[0] + dangle, T[1] + Math.abs(dangle) * .4];
      const tA = hArm(1, Tw, 'fist'), bx = 720 + 1.45 * tA.wr[0], by = 2500 + 1.45 * tA.wr[1];
      const R = rng(12); let crumbs = '';
      for (let i = 0; i < 10; i++) { const t0 = 14.6 + R() * .6, dt = t - t0; if (dt > 0 && dt < .8) crumbs += `<circle cx="${F1(700 + R() * 50 + dt * (R() - .5) * 80)}" cy="${F1(1060 + dt * 200 + dt * dt * 900)}" r="${F1(3 + R() * 3)}" fill="#c89a5a"/>`; }
      const eyes = x => clamp((bx - x) / 50, -10, 10);
      const C = camT(t, 560, 1000, 1.06 + .05 * seg(t, 14.35, 16.1) + B(t) * .4);
      return `<g transform="${C.tf}">
        ${lights(C.v, RIG.barracks(t, { k: .95 }))}
        ${barracksDawn({ t, blur: 'dofHeavy' })}
        ${manb(720, 2500, 1.45, TRAINER, { talk: grin > .3 ? 0 : chew, smirk: .6 + 1.0 * grin, bIn: -6 - 4 * grin, bOut: 6, lid: chew ? .9 : .35, look: grin > .2 ? -9 : -4, lookY: 3 * grin,
          tilt: sway(t, 1, 1) - 5 * grin, turn: -.3 * grin, armR: tA, breath: br(t, 1) })}
        ${breadLoaf(bx - 20, by - 60, 1.3)}
        ${crumbs}
        ${kidb(160, 2250, 1.25, BOY_BARE, { look: eyes(160), lookY: -2, bIn: 10, bOut: 2, smirk: -.6, talk: t > 15.1 && t < 15.25 ? .1 : .03, tilt: 4 + sway(t, 3, 1) + 3 * grin, lid: blink(t, [15.2]), breath: br(t, 2, 1.4) })}
        ${kidb(-60, 2150, 1.0, { ...BOY_BARE, id: 'ob3' }, { look: eyes(-60), lookY: -2, bIn: 12, smirk: -.7, tilt: 7, breath: br(t, 3, 1.4) })}
      </g>`;
    } },

  // 11 "They want you to steal." — he leans in close and whispers, then flings his arm up and points into the distance;
  //   the boy's head turns to follow the finger
  { at: 16.14,
    draw(v, t) {
      const lean = easeOut(seg(t, 16.15, 16.5)), point = easeOut(seg(t, 16.58, 16.84)), follow = easeInOut(seg(t, 16.68, 17.0));
      const pA = hArm(-1, kf(t, [[16.5, [-190, -700]], [16.84, [-330, -1290]]]), point > .3 ? 'point' : 'relaxed');
      const C = camT(t, 540, 1000, 1.1 + .07 * lean + B(t) * .4);
      return `<g transform="${C.tf}">
        ${lights(C.v, { ...RIG.dusk(t, { sun: [-200, 1100], k: .8 }), amb: '#9a84b0', ambInt: .6 })}
        ${campDawn({ t, blur: 'dofHeavy' })}
        ${tint('#5a3a6a', .35)}
        ${manb(700 - 30 * lean, 2600 + 40 * lean, 1.6 + .12 * lean, TRAINER, { smirk: 1.4, bIn: -8 - 6 * point, bOut: 8 + 4 * point, lid: .3, look: -8, lookY: -2 * point, tilt: -8 * lean + 6 * point,
          armL: pA, talk: t < 16.9 ? .2 * Math.abs(Math.sin(t * 14)) : 0, turn: -.3 * lean, breath: br(t, 1) })}
        ${kidb(250, 2300, 1.3, BOY_BARE, { look: lerp(8, -10, follow), lookY: -4 * follow, bIn: 8 + 4 * follow, bOut: 6, smirk: -.3, talk: .1 * follow, turn: -.55 * follow, tilt: sway(t, 2, 1) - 4 * follow, breath: br(t, 2, 1.4) })}
      </g>`;
    } },

  // 12 "So one night, you grab a fox from a farm…" — he creeps along the fence (crouched tiptoe steps), glances around,
  //   coils… and lunges; the fox thrashes in his arms and he clamps it to his chest
  { at: 17.28,
    draw(v, t) {
      const creep = seg(t, 17.3, 18.05), coil = bell(t, 17.95, 18.15), grab = easeOut(seg(t, 18.15, 18.42));
      const bx = lerp(260, 430, creep) + 60 * grab + 14 * spring(t, 18.42, 2, .25) - 18 * coil, st = stride(t, .62, 14);
      const fx = lerp(690, bx + 30, grab), fy = lerp(1600, 1470, grab), snarl = t > 18.1 ? 1 : .3, fight = t > 18.42 ? Math.sin(t * 15) : 0;
      const look = kf(t, [[17.3, 6], [17.55, -8], [17.75, -8], [17.9, 9], [18.15, 6]]);
      const lx = (fx - bx) / .62, ly = (fy - 1886) / .62;
      const hold = grab > .4;
      const C = camT(t, lerp(480, 540, creep), 1350, 1.2 + .1 * grab + B(t) * .4);
      return `<g transform="${C.tf}">
        ${lights(C.v, RIG.farm(t))}
        ${farmNight({ t, blur: 'dofLight' })}
        <g transform="translate(0 ${F1(creep < 1 ? st.bob * .3 : 0)})">
          ${atb(bx, 1700 + 300 * .62, .62, P(BOY_CLOAKED, { look, lookY: 3, bIn: 8 + 4 * coil, bOut: 8, smirk: -.4, tilt: 10 - 6 * grab + sway(t, 1, 1) + 8 * fight * grab, turn: .3 * look / 9,
            shock: grab > .5 && t < 18.8 ? 1 : 0, breath: br(t, 0, 2), legL: creep < 1 ? st.legL : null, legR: creep < 1 ? st.legR : null,
            armL: hold ? kArm(-1, [lx - 40, ly + 10 + 8 * fight], 'fist') : kArm(-1, kf(t, [[17.3, [-110, -740]], [18.1, [-80, -820]], [18.3, [lx - 60, ly]]]), grab > .1 ? 'open' : 'relaxed'),
            armR: hold ? kArm(1, [lx + 40, ly - 10 - 8 * fight], 'fist') : kArm(1, kf(t, [[17.3, [110, -740]], [18.1, [80, -820]], [18.3, [lx + 40, ly - 30]]]), grab > .1 ? 'open' : 'relaxed') }), br(t, 0, 2))}
        </g>
        <g transform="rotate(${F1(12 * fight * grab)} ${F1(fx)} ${F1(fy)})">${foxBody(fx, fy, .55 - .1 * grab, { snarl, t, look: -6 })}</g>
        <rect x="-300" y="1610" width="1700" height="22" fill="#4a3420"/><rect x="-300" y="1690" width="1700" height="22" fill="#4a3420"/>${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => `<rect x="${-240 + i * 150}" y="1580" width="24" height="260" fill="#3a2a1a"/>`).join('')}
      </g>`;
    } },

  // 13 "but a guard walks in, and you hide it under your cloak." — torchlight sweeps in, the guard strides through with the
  //   torch thrust forward; the boy whips the cloak around the fox (HIDE) and freezes; the cloth twitches
  { at: 19.59,
    draw(v, t) {
      const tl = easeOut(seg(t, 19.6, 19.9)), hide = t > 20.72, walk = easeOut(seg(t, 19.7, 20.6)), [jx, jy] = shakeXY(t, [[20.72, 9, .3]]), stG = stride(t, .55, 22);
      const gx = lerp(780, 830, walk), gy = lerp(1700, 1760, walk), gs = lerp(.5, .62, walk);
      const tArm = hArm(-1, kf(t, [[19.6, [-250, -880]], [20.0, [-330, -990]], [21.9, [-340, -1000]]]), 'fist');
      const torchW = [gx + gs * tArm.wr[0], gy + gs * (tArm.wr[1] - 30)];
      const swing = easeInOut(seg(t, 20.55, 20.74)), freeze = hide ? tremble(t, .7) : 0, turnB = kf(t, [[19.6, 0], [19.8, .5], [20.5, .5], [20.74, .1]]);
      const C = camT(t, 560, 1300, 1.25 + .1 * seg(t, 19.6, 21.9) + B(t) * .4, jx, jy);
      const boyPose = { look: 8, bIn: 10, bOut: 10, shock: 1, tilt: 4 + freeze, turn: turnB, breath: br(t, 0, 2.6) };
      const boy = hide ? atb(420, 1720 + 225, .75, P(BOY_CAMP, { ...boyPose, bulge: 1, bulgeT: t * 9, shock: t < 21.2 ? 1 : 0, lookY: -1, smirk: -.5, flap: 3 * spring(t, 20.72, 2.5, .25) }), br(t, 0, 2.6))
        : atb(420, 1720 + 225, .75, P(BOY_CLOAKED, { ...boyPose, armL: kArm(-1, lerp2([-20, -820], [80, -880], swing), 'fist'), armR: kArm(1, lerp2([60, -860], [-40, -900], swing), 'fist') }), br(t, 0, 2.6))
          + `<g transform="rotate(${F1(Math.sin(t * 15) * 10)} 455 1420)">${foxBody(455, 1420, .45, { snarl: 1, t, look: 6 })}</g>`;
      return `<g transform="${C.tf}">
        ${lights(C.v, RIG.farm(t, { torch: [...torchW, 140], torchInt: tl }))}
        ${farmNight({ t, blur: 'dofLight', torch: tl })}
        ${manb(gx, gy - (walk < 1 ? stG.bob * gs : 0), gs, GUARD, { armL: tArm, raiseRight: 8, bIn: -10, bOut: 6, smirk: -.6, tilt: sway(t, 2, 1), look: -8, lid: .3,
          legL: walk < 1 ? stG.legL : null, legR: walk < 1 ? stG.legR : null, breath: br(t, 2) })}
        ${torch(torchW[0], torchW[1] + 30, t, { s: .9, seed: 8, glow: 1.4 * tl })}
        ${boy}
        ${hide ? '' : `<path d="M${F1(lerp(330, 480, swing))} 1330 C${F1(lerp(300, 520, swing))} 1420 ${F1(lerp(310, 500, swing))} 1500 ${F1(lerp(340, 470, swing))} 1560" stroke="#8a1c14" stroke-width="${F1(30 * swing)}" fill="none" opacity="${(.9 * swing).toFixed(2)}"/>`}
        ${tint('#ff9a40', (.08 * tl).toFixed(2), 'screen')}
      </g>`;
    } },

  // 14 "While he questions you, the fox starts eating into your stomach…" — the guard leans in and out, barking, jabbing a
  //   finger, his torch swinging (the light moves across the boy's face). On EATING the boy's face cracks in pain — then
  //   he forces it still again
  { at: 21.89,
    draw(v, t) {
      const wound = easeOut(seg(t, 23.6, 24.9)), push = easeInOut(seg(t, 21.9, 24.9)), spasm = bell(t, 23.62, 24.1), mask = seg(t, 24.1, 24.5);
      const lean = .5 + .5 * Math.sin(t * 2.6), talk = t < 23.4 ? .35 * Math.abs(Math.sin(t * 13)) : .15 * Math.abs(Math.sin(t * 9));
      const jab = Math.max(bell(t, 22.3, 22.6), bell(t, 23.0, 23.3));
      const tA = hArm(-1, [-260 + 30 * Math.sin(t * 1.7), -1150 - 30 * Math.sin(t * 2.3)], 'fist'), gx = 230 + 20 * lean, gy = 2900 - 30 * lean, gs = 1.9 + .05 * lean;
      const torchW = [gx + gs * tA.wr[0], gy + gs * (tA.wr[1] - 30)];
      const C = camT(t, lerp(560, 640, push), lerp(1150, 1000, push), lerp(1.15, 1.55, push) + B(t) * .4, tremble(t, 1.5 * spasm), 0);
      return `<g transform="${C.tf}">
        ${lights(C.v, RIG.farm(t, { torch: [...torchW, 200], torchInt: 1 }))}
        ${farmNight({ t, blur: 'dofHeavy', torch: 1 })}
        ${manb(gx, gy, gs, GUARD, { talk, bIn: -12, bOut: 8, smirk: -1, lid: .15, look: 9, lookY: 4, tilt: 8 + sway(t, 1, 2) + 4 * lean, turn: .3, armL: tA,
          armR: hArm(1, lerp2([210, -700], [290, -760], jab), jab > .3 ? 'point' : 'relaxed'), breath: br(t, 1, 1.5) })}
        ${torch(torchW[0], torchW[1] + 30, t, { s: 1.0, seed: 9 })}
        ${kidb(720, 2240, 1.35, BOY_CAMP, { bulge: 1, bulgeT: t * (9 + 6 * spasm), wound, grit: .3 + .7 * spasm, lid: .1 + .9 * spasm * (1 - mask) + .15 * mask, bIn: 8 + 10 * spasm, bOut: 6 - 8 * spasm,
          look: lerp(-3, -7, lean), lookY: -2, sweat: 1, sweatY: 30 * seg(t, 22.5, 24.9), tear: .4 + .6 * spasm, tilt: tremble(t, 1 + 2 * spasm) - 4 * spasm, smirk: -.5, breath: br(t, 0, 2.8) })}
      </g>`;
    } },

  // 15 "and you don't make a sound." — his eyes, huge; the torchlight trembles on them; one tear rolls; nothing else moves
  { at: 24.99,
    draw(v, t) {
      const run = easeInOut(seg(t, 25.25, 26.4)), C = camT(t, 720, 1060, 4.2 + .3 * seg(t, 24.99, 26.7));
      return `<g transform="${C.tf}">
        ${lights(C.v, RIG.farm(t, { torch: [300, 900, 300], torchInt: .9 }))}
        ${farmNight({ t, blur: 'dofHeavy', torch: 1 })}
        ${kidb(720, 2240, 1.35, BOY_CAMP, { grit: 1, lid: .32 + .05 * Math.sin(t * 3), bIn: 16, bOut: -6, look: tremble(t, .6), lookY: -1, tear: 1, tearRun: run, sweat: 1, sweatY: 30 + 20 * run, tilt: 0, bulge: 1, bulgeT: t * 14, wound: 1, breath: br(t, 0, .5) })}
        ${darkRect(.2 * seg(t, 25.8, 26.6))}
      </g>`;
    } },

  // 16 "Because you've seen what happens to boys who get caught." — a memory in hard sun: the priest hauls a caught boy to
  //   the altar; the boy kicks and twists; our boy watches from the crowd, swallows, and flinches on CAUGHT
  { at: 26.66,
    draw(v, t) {
      const drag = easeInOut(seg(t, 26.7, 28.9)), flinch = decay(t, 28.63, .3), X = lerp(980, 760, drag), st = stride(t, .6, 18);
      const hp = place(X, 1900, .82, 0, [-182, -1040]);   // the priest's raised hand
      const kick = Math.sin(t * 13), twist = Math.sin(t * 5.3) * 10;
      const C = camT(t, 560, 1180, 1.1 + .06 * drag + B(t) * .4);
      return `<g transform="${C.tf}">
        ${lights(C.v, RIG.altar(t))}
        ${altarDay({ t, blur: 'dofHeavy' })}
        ${altarStone(330, 1640, .8, 0)}
        ${manb(X, 1900 - st.bob * .82, .82, PRIEST, { armL: pArm(-1, [-182, -1040], 'fist'), smirk: -.7, bIn: -10, bOut: 6, lid: .2, look: -8, tilt: -6 + sway(t, 1, 1),
          legL: st.legL, legR: st.legR, breath: br(t, 1) })}
        <g transform="rotate(${F1(14 + twist)} ${F1(hp[0])} ${F1(hp[1])})">${kidb(hp[0] - 20, hp[1] + 980 * .62, .62, { ...BOY_BARE, id: 'cb2' }, { armR: kArm(1, [30, -1150], 'fist'),
          armL: kArm(-1, [-160 + 30 * kick, -820], 'open'), shock: 1, bIn: 14, bOut: 10, tilt: 8, look: 6, talk: .2 + .1 * Math.abs(kick),
          legL: { lift: 40 * Math.max(0, kick) }, legR: { lift: 40 * Math.max(0, -kick) } })}</g>
        ${kidb(250 - 18 * flinch, 2420, 1.5, { ...BOY_CAMP, faceExtra: boyFace(true) }, { look: lerp(10, 6, drag), lookY: -2, bIn: 14, bOut: 6, shock: flinch > .3 ? 1 : 0, smirk: -.9,
          lid: blink(t, [27.6, 28.64]), turn: .35 + .1 * drag, tilt: -4 * flinch + sway(t, 3, 1), tear: .6, talk: t > 27.9 && t < 28.05 ? .12 : 0, breath: br(t, 0, 1.8) })}
        ${tint('#e8c890', .2)}${tint('#ffffff', .06, 'screen')}
      </g>`;
    } },

  // 17 "They're whipped at the altar in front of the whole city…" — the priest winds up (leaning back), the lash cracks down
  //   on WHIPPED, FRONT, CITY; the boy's body jolts with each blow; the crowd flinches
  { at: 29.09,
    draw(v, t) {
      const hits = [29.2, 30.22, 30.95], last = Math.max(...hits.filter(h => h <= t), 29.09), next = hits.find(h => h > t) ?? 99;
      const wind = t < next ? easeInOut(seg(t, Math.max(last + .25, next - .55), next - .06)) : 0, strikeP = t < next ? easeIn(seg(t, next - .06, next)) : 1;
      const after = easeOut(seg(t, last, last + .25));
      const up = t >= 29.2 ? Math.max(wind * (1 - strikeP), 0) : easeOut(seg(t, 29.09, 29.18)) * (1 - easeIn(seg(t, 29.14, 29.2)));
      const strike = hits.reduce((a, h) => a + decay(t, h, .18), 0), [jx, jy] = shakeXY(t, hits.map(h => [h, 11, .3]));
      const T = lerp2([-120, -640], [380, -1290], up);
      const wA = pArm(1, T, 'fist'), [whx, why] = place(860, 2050, 1.0, 0, wA.wr);
      const body = -7 * up + 6 * strike;
      const C = camT(t, 540, 1150, 1.12 + .04 * seg(t, 29.09, 31.45) + B(t) * .4, jx, jy);
      const lash = (a, op, w = 1) => { const x1 = lerp(whx + 300, 440, 1 - a), y1 = lerp(why - 360, 1430, 1 - a), bd = lerp(-240, 140, 1 - a), mxp = (whx + x1) / 2 + bd, myp = (why + y1) / 2 - Math.abs(bd) * .6;
        return `<path d="M${F1(whx)} ${F1(why)} Q${F1(mxp)} ${F1(myp)} ${F1(x1)} ${F1(y1)}" stroke="#2a180c" stroke-width="${F1(13 * w)}" fill="none" stroke-linecap="round" opacity="${op}"/>
          <path d="M${F1(whx)} ${F1(why)} Q${F1(mxp)} ${F1(myp)} ${F1(x1)} ${F1(y1)}" stroke="#8a6040" stroke-width="${F1(4 * w)}" fill="none" opacity="${(op * .5).toFixed(2)}"/>`; };
      return `<g transform="${C.tf}">
        ${lights(C.v, RIG.altar(t))}
        ${altarDay({ t, blur: 'dof' })}
        <g transform="rotate(${F1(body)} 860 2050)">${manb(860, 2050, 1.0, PRIEST, { armR: wA, smirk: -.6, bIn: -10, bOut: 6, lid: .2, tilt: -4 * strike + sway(t, 1, 1), lookY: 5, look: -6, breath: br(t, 1) })}</g>
        ${strikeP > 0 && strikeP < 1 || (t - last < .1 && t > 29.2) ? [.15, .3, .45].map((d, i) => lash(Math.min(1, up + d), .22 - i * .06, 2.4 - i * .5)).join('') : ''}${lash(up, 1)}
        ${[90, 750].map(x => `<rect x="${x - 15}" y="1040" width="30" height="720" rx="6" fill="#5a3a20" filter="url(#pcs)"/>`).join('')}
        <rect x="60" y="1058" width="720" height="30" rx="12" fill="#5a3a20" filter="url(#pcs)"/><rect x="66" y="1062" width="708" height="6" fill="#8a6040" opacity=".6"/>
        <g transform="rotate(${F1(-6 * strike)} 420 1735) translate(0 ${F1(-12 * strike)})">${kidb(420, 2050 - 300 * 1.05, 1.05, BOY_BARE, { armL: kArm(-1, [-296 + 8 * strike, -940 - 8 * strike], 'fist'), armR: kArm(1, [296 - 8 * strike, -940 - 8 * strike], 'fist'),
          lid: 1.2 + .7 * Math.min(1, strike), grit: .8 + .2 * Math.min(1, strike), bIn: 14, bOut: -4, tilt: 8 * strike + tremble(t, 1), lookY: 5, tear: 1, shock: strike > .6 ? 1 : 0, id: 'wb', breath: br(t, 0, 2.6) })}</g>
        ${[-1, 1].map(k => `<path d="M${F1(420 + k * 318 - 16)} 1066 q16 -12 32 0 q-16 14 -32 0 M${F1(420 + k * 318 - 14)} 1092 q14 10 28 0" stroke="#c8b088" stroke-width="7" fill="none"/>`).join('')}
        ${altarStone(450, 2120, 1.3, 0)}
      </g>`;
    } },

  // 18 "until the stone turns red." — red spreads over the white stone; his small fist slowly uncurls and goes limp;
  //   a cloud dims the sun
  { at: 31.45,
    draw(v, t) {
      const red = easeInOut(seg(t, 31.55, 32.9)), open = seg(t, 32.0, 32.85), dim = easeInOut(seg(t, 32.3, 33.2));
      const C = camT(t, 540, 1150, 1.6 + .2 * seg(t, 31.45, 33.3));
      const R = rng(31); let dr = '';
      for (let i = 0; i < 6; i++) { const t0 = 31.9 + i * .18 + R() * .1, dt = t - t0, x = 330 + R() * 420; if (dt > 0) dr += `<ellipse cx="${F1(x)}" cy="${F1(1530 + dt * 120 + dt * dt * 1600)}" rx="6" ry="9" fill="#7a0a06" opacity="${clamp(1 - dt, 0, 1).toFixed(2)}"/>`; }
      return `<g transform="${C.tf}">
        ${lights(C.v, RIG.altar(t, { k: 1 - .45 * dim }))}
        ${altarDay({ t, blur: 'dofHeavy' })}
        <rect x="-400" y="1470" width="1880" height="900" fill="url(#paveG)"/><ellipse cx="540" cy="1506" rx="520" ry="26" fill="#3a3024" opacity=".45" filter="url(#b14)"/>
        ${altarStone(540, 1500, 1.6, red)}${dr}
        ${limb(-200, 1300, 470, lerp(1010, 1034, open), 130, 100, { S: OLV, sk: 'olive' })}
        ${open > .55 ? openHand(520, 1034, .9, 90 + 26 * open, { S: OLV, sk: 'olive' }) : fist(520, 1020 + 10 * open, 1.0, 90 + 20 * open, { S: OLV, sk: 'olive' })}
        ${darkRect(.32 * seg(t, 32.7, 33.3))}
      </g>`;
    } },

  // 19 "You survive all of it." — his face hardens through the years: the boy becomes a young man; the chin lifts
  { at: 33.27,
    draw(v, t) {
      const age = easeInOut(seg(t, 33.45, 34.2)), chin = easeOut(seg(t, 33.6, 34.4));
      const C = camT(t, 540, 960, 1.0 + .07 * seg(t, 33.27, 34.5));
      return `<g transform="${C.tf}">
        ${lights(C.v, { ...RIG.barracks(t, { k: .8 }), lights: [{ pos: [-300, 700, 400], col: '#ffd0a0', int: 1.7, rad: 2000, shin: 26 }, { pos: [1300, 600, -200], col: '#c8d4f0', int: .8, rad: 1800, shin: 22 }], ambInt: .5 })}
        ${barracksDawn({ t, blur: 'dofHeavy' })}${tint('#3a2a2a', .35)}
        <g opacity="${(1 - age).toFixed(2)}">${kidb(540, 960 + 775 * 2.3, 2.3, BOY_BARE, { bIn: 4, bOut: -6, smirk: -.6, lid: .25, tilt: 0, blush: .3, lookY: 1 - 2 * chin, breath: br(t, 0) })}</g>
        <g opacity="${age.toFixed(2)}">${manb(540, 960 + 1075 * 2.3, 2.3, YOUTH, { bIn: -6, bOut: 4, smirk: -.3, lid: .3, tilt: 0, lookY: 1 - 2 * chin, breath: br(t, 0) })}</g>
      </g>`;
    } },

  // 20 "So at eighteen, they hand you a knife and send you into the night…" — the elder holds out the knife; the youth takes
  //   it, raises it, looks at it (the blade flashes on KNIFE); on SEND the elder points into the dark and the sky drains
  { at: 34.47,
    draw(v, t) {
      const offer = easeInOut(seg(t, 34.9, 35.3)), take = easeInOut(seg(t, 35.2, 35.5)), raise = easeInOut(seg(t, 35.55, 35.9));
      const glint = bell(t, 35.85, 36.25), night = easeInOut(seg(t, 36.3, 37.2)), send = easeOut(seg(t, 36.35, 36.6));
      const eT = lerp2([220, -700], [310, -800], offer), eA = hArm(1, take > .6 ? lerp2([310, -800], [220, -700], seg(t, 35.5, 35.8)) : eT, take > .6 ? 'relaxed' : 'open');
      const eL = hArm(-1, lerp2([-200, -700], [-330, -1260], send), send > .3 ? 'point' : 'relaxed');
      const eHand = place(220, 2400, 1.35, 0, eA.wr);
      const yLocal = [(eHand[0] - 720) / 1.55, (eHand[1] - 2550) / 1.55 + 20];
      const yT = take < 1 ? lerp2([-200, -720], yLocal, take) : lerp2(yLocal, [-70, -1000], raise);
      const yA = hArm(-1, yT, take > .5 ? 'fist' : 'open');
      const yh = place(720, 2550, 1.55, 0, yA.wr);
      const kx = take > .5 ? yh[0] : eHand[0] + 10, ky = take > .5 ? yh[1] - 6 : eHand[1] - 26, krot = take > .5 ? lerp(70, -4, raise) : 80;
      const C = camT(t, 560, 1000, 1.05 + .15 * night + B(t) * .4);
      const dusk = RIG.dusk(t, { sun: [200, 1100], k: 1 - night }), moon = { pos: [900, 200, 600], col: '#b8c8ff', int: 1.1 * night, rad: 3000, shin: 26 };
      return `<g transform="${C.tf}">
        ${lights(C.v, { ...dusk, lights: [...dusk.lights, moon], amb: mix('#a090b4', '#5a6898', night), ambInt: lerp(.66, .5, night), shadowTint: mix('#2c3c52', '#18284a', night) })}
        ${riverDusk({ t, blur: 'dofHeavy' })}
        ${tint('#0a1030', (.72 * night).toFixed(2))}
        ${manb(220 + 20 * offer, 2400, 1.35, TRAINER, { smirk: .2, bIn: -6, bOut: 4, lid: .3, look: 8, armR: eA, armL: eL, tilt: sway(t, 2, 1), turn: .2, breath: br(t, 1) })}
        ${manb(720, 2550, 1.55, YOUTH, { bIn: -6, bOut: 2, smirk: -.4, lid: .3, look: lerp(-4, -1, take) - 3 * send, lookY: lerp(4, 6, raise) * (1 - send) - 3 * night, tilt: sway(t, 4, 1) + 4 * raise * (1 - send), turn: -.2 * take - .45 * send,
          armL: yA, breath: br(t, 0) })}
        ${knife(kx, ky, krot, 1.25, { glint })}
      </g>`;
    } },

  // 21 "to hunt slaves who did nothing wrong." — the hunter's dark shape steps forward, knife glinting; the man at the hut
  //   turns, freezes, drops his jug (it shatters), raises his empty hands and backs away
  { at: 37.17,
    draw(v, t) {
      const p = seg(t, 37.2, 39.6), see = easeOut(seg(t, 37.9, 38.15)), back = easeInOut(seg(t, 38.6, 39.5)), hands = easeOut(seg(t, 38.15, 38.45));
      const st = stride(t, .7, 16), stH = stride(t, .5, 16), drop = seg(t, 38.15, 38.42), broke = t > 38.42;
      const hx = lerp(230, 290, p), hs = lerp(1.7, 1.8, p), hy = 2700 - st.bob * hs * .5;
      const [kx, ky] = handPos(1, 25);
      const hunter = at(hx, hy, hs, P(YOUTH, { raiseRight: 25 + 10 * p, tilt: 4 + st.sway, legL: st.legL, legR: st.legR }));
      const Hx = lerp(720, 800, back), Hy = 1420 - (back > 0 && back < 1 ? stH.bob * .58 : 0);
      const jugL = place(Hx, Hy, .58, 0, [-200, -560]);
      const jy = drop > 0 ? jugL[1] + 900 * drop * drop * .3 : jugL[1];
      const R = rng(21); let shards = '';
      if (broke) for (let i = 0; i < 9; i++) { const dt = t - 38.42, a = R() * Math.PI, v = 200 + R() * 260; shards += `<path d="M0 0 l${F1(8 + R() * 8)} ${F1(-4 + R() * 8)} l${F1(-4 - R() * 6)} ${F1(8 + R() * 6)}Z" fill="#a85a30" transform="translate(${F1(jugL[0] + Math.cos(a) * v * dt * (R() - .5) * 2)} ${F1(Math.min(1450, jugL[1] + 120 - Math.sin(a) * v * dt + 1400 * dt * dt))})"/>`; }
      const C = camT(t, lerp(560, 640, p), 1200, lerp(1.1, 1.35, p) + B(t) * .4);
      return `<g transform="${C.tf}">
        ${lights(C.v, RIG.field(t))}
        ${nightField({ t, blur: 'dofLight' })}
        ${manb(Hx, Hy, .58, HELOT, { shock: see > .5 ? 1 : 0, bIn: 12 * see, bOut: 10 * see, look: -9 * see, lookY: -2, turn: -.5 * see, tilt: -6 * back + sway(t, 1, 1) + tremble(t, 1.5 * see),
          armL: drop > 0 ? hArm(-1, lerp2([-200, -620], [-260, -1060], hands), hands > .3 ? 'open' : 'relaxed') : hArm(-1, [-200, -620], 'fist'),
          armR: hArm(1, lerp2([186, -668], [260, -1060], hands), hands > .3 ? 'open' : 'relaxed'),
          legL: back > 0 && back < 1 ? stH.legL : null, legR: back > 0 && back < 1 ? stH.legR : null, breath: br(t, 1, 2.4) })}
        ${!broke ? `<g transform="rotate(${F1(200 * drop)} ${F1(jugL[0])} ${F1(jy)})">${jug(jugL[0], jy, .5)}</g>` : shards}
        <g transform="translate(-8 -6)" filter="url(#rimF)" opacity=".75">${hunter}</g><g filter="url(#silhB)">${hunter}</g>
        ${at(hx, hy, hs, knife(kx, ky - 20, 10, .8, { glint: Math.max(bell(t, 37.6, 38.1), .6 * bell(t, 38.9, 39.3)) }))}
      </g>`;
    } },

  // 22 "And at thirty, you're finally the man who walks into a house…" — beard, scar, cold eyes; he lifts both hands to
  //   the helmet and drags it down over his face; the hands drop; he walks toward the door
  { at: 39.65,
    draw(v, t) {
      const grip = easeInOut(seg(t, 41.1, 41.42)), down = easeInOut(seg(t, 41.45, 41.85)), drop = easeInOut(seg(t, 41.88, 42.15)), walk = seg(t, 41.95, 42.7);
      const st = stride(t, .55, 20), helm = { ...MAN30, customHat: corinthian({ up: 1 - down }) };
      const hy = lerp(-1290, -1150, down), handT = k => lerp2([k * 190, -680], [k * 120, hy], grip * (1 - drop));
      const C = camT(t, 540, lerp(980, 1020, walk), 1.1 + .1 * seg(t, 39.65, 41.4) + .15 * walk + B(t) * .4);
      return `<g transform="${C.tf}">
        ${lights(C.v, RIG.street(t, { torch: [1000, 1420, 160] }))}
        ${houseOutside({ t, blur: 'dofHeavy' })}
        ${manb(540, 3150 + (walk > 0 ? st.bob * 2 : 0), 2.0, helm, { bIn: -8, bOut: 4, smirk: -.4, lid: .3, look: 0, lookY: 1, tilt: sway(t, 3, .8) + (walk > 0 ? st.sway : 0),
          armL: hArm(-1, handT(-1), grip * (1 - drop) > .5 ? 'fist' : 'relaxed'), armR: hArm(1, handT(1), grip * (1 - drop) > .5 ? 'fist' : 'relaxed'),
          breath: br(t, 0, 1.2) })}
        ${torch(1000, 1500, t, { s: 1.5, seed: 11, glow: 1.1 })}
      </g>`;
    } },

  // 23 "and takes someone's seven year old son." — inside: the helmeted man fills the doorway; his hand reaches in; the
  //   mother clutches her boy, then her hand is torn away as we push into the boy's face — the first frame of the film
  { at: 42.71,
    draw(v, t) {
      const reach = easeInOut(seg(t, 42.8, 43.9)), push = easeInOut(seg(t, 43.3, 44.45)), clutch = easeOut(seg(t, 42.8, 43.2)), torn = easeIn(seg(t, 43.95, 44.35));
      const s = lerp(1.0, 2.0, push), fx = lerp(560, 330, push), fy = lerp(1000, 1110, push), endW = 1 - seg(t, 44.9, 45.4);
      const C = camT(t, fx, fy, s);
      const pose = { lid: blink(t, [43.2]), tilt: sway(t, 0, 1) * (1 - push), breath: br(t, 0, 1.4) * endW, look: lerp(10, 8, push), turn: .4 * (1 - push),
        armR: kArm(1, [30, -840], 'fist'), armL: kArm(-1, [-120, -706], 'relaxed') };
      const momT = lerp2(kf(t, [[42.71, [200, -760]], [43.2, [144, -1010]]]), [210, -700], torn);
      return `<g transform="${C.tf}">
        ${lights(C.v, RIG.home(t, { door: 1 - push, spill: 1 - push }))}
        ${homeNight({ t, open: 1 - push, blur: 'dofLight' })}
        <g opacity="${(1 - push).toFixed(2)}">${torch(1060, 900, t, { s: 1.0, seed: 5, glow: 1.2 })}${at(860, 1690, 1.0, P({ ...SOLDIER, id: 'sx' }, { armL: hArm(-1, lerp2([-186, -680], [-310, -840], reach), reach > .3 ? 'open' : 'relaxed'), raiseRight: 6, turn: -.3 * reach, look: -8 }))}</g>
        ${momHome({ lid: .15, shock: 0, bIn: 16, bOut: -2, smirk: -1.2, tear: 1, tilt: 6, look: 6, armR: pArm(1, momT, 'fist') })}
        ${boyHome(pose)}
        ${clutch > .5 && torn < .6 ? momHand(-40, 2700, 1.35, momT, 'fist') : ''}
        ${floorMat}
      </g>`;
    } },
];

const TRANS = [
  [2.19, 2.13, 2.25, 'pull'], [4.10, 4.00, 4.18, 'dim'], [5.29, 5.23, 5.35, 'zoom'], [6.27, 6.22, 6.32, 'whipv'], [7.29, 7.23, 7.35, 'pull'],
  [9.99, 9.89, 10.07, 'dim'], [11.86, 11.80, 11.92, 'zoom'], [13.08, 12.98, 13.16, 'dim'], [14.35, 14.30, 14.40, 'whip'], [16.14, 16.08, 16.20, 'zoom'],
  [17.28, 17.18, 17.36, 'dim'], [19.59, 19.55, 19.64, 'flash', { peak: 19.61, decay: .1 }], [21.89, 21.83, 21.95, 'zoom'], [24.99, 24.93, 25.05, 'zoom'],
  [26.66, 26.62, 26.72, 'flash', { peak: 26.68, decay: .14 }], [29.09, 29.04, 29.14, 'whip'], [31.45, 31.39, 31.51, 'zoom'], [33.27, 33.17, 33.35, 'dim'],
  [34.47, 34.41, 34.53, 'pull'], [37.17, 37.07, 37.25, 'dim'], [39.65, 39.60, 39.70, 'whip'], [42.71, 42.65, 42.77, 'zoom'],
];

TL = makeTimeline({ shots: SHOTS, trans: TRANS, words: WORDS, strong: STRONG, captions: 'none', fps: 30, duration: DUR });
render(0);
