// Shadow-theatre figures (The Pied Piper, second version): every character is a crisp profile silhouette on a small
// skeleton. Legs are solved with two-bone IK onto feet that stay planted on the ground while the body moves on (the gait
// is driven by the distance travelled, not by time, so nothing ever slides); arms are IK'd to hand targets; coats, hems,
// hair, braids and feathers lag and sway. A figure is drawn twice: a thin rim of light shifted toward the light, then the
// dark shape over it. The Piper's coat of many colours is the one bright thing: stained glass in lead, clipped to the coat.
// Local units: ground at y = 0, the figure faces +x, an adult is about 1000 tall. o.s scales, o.dir = 1 / -1 faces.
(function (G) {
  const { f, shade } = G.RIG;
  const SIL = G.SIL = {};
  const TAU = Math.PI * 2, D2R = Math.PI / 180;
  const lerp = (a, b, t) => a + (b - a) * t, cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), sm = x => x * x * (3 - 2 * x);
  const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k], sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
  const len = v => Math.hypot(v[0], v[1]), nrm = v => { const l = len(v) || 1; return [v[0] / l, v[1] / l]; };
  const rot = (v, a) => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)];
  const P2 = p => f(p[0]) + ',' + f(p[1]);
  const lerp2 = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
  const poly = pts => 'M' + pts.map(P2).join('L') + 'Z';
  // a smooth closed outline through points (Catmull-Rom)
  const blob = pts => { const n = pts.length; let d = 'M' + P2(pts[0]); for (let i = 0; i < n; i++) { const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n]; d += `C${P2([p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6])} ${P2([p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6])} ${P2(p2)}`; } return d + 'Z'; };
  SIL.util = { add, sub, len, nrm, rot, lerp, cl, sm, poly, blob, P2 };

  // a limb: a tapered capsule from p (radius r1) to q (radius r2) with round ends
  const cap = (p, q, r1, r2) => {
    const dv = nrm(sub(q, p)), a0 = Math.atan2(dv[1], dv[0]), pts = [];
    for (let i = 0; i <= 6; i++) { const a = a0 - Math.PI / 2 + Math.PI * i / 6; pts.push([q[0] + Math.cos(a) * r2, q[1] + Math.sin(a) * r2]); }
    for (let i = 0; i <= 6; i++) { const a = a0 + Math.PI / 2 + Math.PI * i / 6; pts.push([p[0] + Math.cos(a) * r1, p[1] + Math.sin(a) * r1]); }
    return poly(pts);
  };
  // two-bone IK from A toward B (bones l1, l2); bend +1 / -1 picks the side of the middle joint. Returns [joint, end].
  const ik = (A, B, l1, l2, bend) => {
    const d0 = sub(B, A), D = Math.max(1, Math.min(len(d0), l1 + l2 - 0.5)), u = nrm(d0);
    const a = (l1 * l1 - l2 * l2 + D * D) / (2 * D), h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
    return [add(add(A, u, a), [-u[1], u[0]], h * bend), add(A, u, D)];
  };
  SIL.ik = ik;

  // ---------------------------------------------------------------- body plans
  const PLAN = {
    // tall and thin, long legs in hose, long pointed shoes
    man: { headR: 60, headY: -930, neckY: -858, shY: -818, hipY: -505, th: 262, sh: 228, ank: 18, ua: 192, fa: 176, hand: 62, foot: 100, toe: 26,
      rHip: 42, rChest: 52, rWaist: 35, rNeck: 16, rTh: [34, 20], rSh: [20, 25, 11], rUa: [21, 17], rFa: [17, 10] },
    woman: { headR: 54, headY: -862, neckY: -795, shY: -760, hipY: -470, th: 244, sh: 210, ank: 16, ua: 176, fa: 160, hand: 56, foot: 104, toe: 10,
      rHip: 50, rChest: 44, rWaist: 32, rNeck: 14, rTh: [28, 17], rSh: [16, 19, 9], rUa: [14, 11], rFa: [11, 8] },
    kid: { headR: 52, headY: -505, neckY: -446, shY: -428, hipY: -262, th: 132, sh: 118, ank: 12, ua: 106, fa: 96, hand: 40, foot: 70, toe: 6,
      rHip: 32, rChest: 33, rWaist: 28, rNeck: 12, rTh: [20, 13], rSh: [13, 15, 8], rUa: [12, 10], rFa: [10, 7] }
  };
  SIL.PLAN = PLAN;

  // ---------------------------------------------------------------- gait
  // g: { stride, beta (stance share; < 0.5 gives a flight phase), lift, bob, kind: 'walk' | 'run' }
  // returns, relative to the hip's ground point: the two ankles [x, liftY], their foot angles, the hip's rise, the phase
  SIL.gait = (d, g, P) => {
    const S = g.stride, beta = g.beta, ph = d / S, heel = P.foot * 0.22;
    // (every quantity runs on continuously from stance into swing and back: the foot leaves with its heel still up and
    // its toe down, rises and falls with no speed at either end, and lands heel first, rolling flat; before, the ankle
    // dropped a fifth of a foot in one frame at toe-off and the foot snapped 8 degrees flat at heel strike)
    const feet = [0, 0.5].map(off => {
      const k = ph + off, u = k - Math.floor(k);
      if (u < beta) {
        // planted: rolls flat off the heel, the hip passes over it, the heel peels up just before toe-off
        const x = S * (beta / 2 - u), peel = sm(cl((u - beta + 0.14) / 0.14)), land = 1 - sm(cl(u / 0.08));
        return { x, y: -peel * heel, ang: (peel * 28 - land * 8) * D2R, stance: true, u };
      }
      const s = (u - beta) / (1 - beta), e = sm(s);
      const x = -S * beta / 2 + S * (e - (1 - beta) * s);
      return { x, y: -g.lift * Math.sin(Math.PI * Math.pow(s, 0.8)) ** 2 - heel * (1 - sm(cl(s / 0.3))), ang: lerp(28, -8, sm(s)) * D2R, stance: false, u };
    });
    const mid = g.kind === 'run' ? (beta + 0.5) / 2 : beta / 2;
    const rise = g.bob * (0.5 + 0.5 * Math.cos(4 * Math.PI * (ph - mid)));
    return { feet, rise, ph };
  };

  // ---------------------------------------------------------------- heads (profile, head-local units of the head radius)
  const FACE = {
    // [forehead .. nose .. lips .. chin .. jaw] points on the front, x forward, y down, centre of the cranium at 0
    long: [[0.5, -0.86], [0.84, -0.52], [0.93, -0.22], [0.86, -0.08], [1.24, 0.2], [1.02, 0.3], [1.02, 0.4], [0.95, 0.47], [0.99, 0.55], [0.9, 0.66], [0.94, 0.84], [0.72, 1.0], [0.3, 0.98]],
    soft: [[0.52, -0.84], [0.86, -0.5], [0.94, -0.2], [0.88, -0.06], [1.06, 0.14], [0.97, 0.24], [0.99, 0.33], [0.93, 0.4], [0.97, 0.48], [0.88, 0.58], [0.9, 0.72], [0.68, 0.88], [0.28, 0.9]],
    child: [[0.56, -0.8], [0.9, -0.42], [0.96, -0.12], [0.92, 0.02], [1.04, 0.18], [0.95, 0.26], [0.96, 0.34], [0.9, 0.4], [0.93, 0.47], [0.85, 0.56], [0.84, 0.68], [0.6, 0.8], [0.24, 0.8]]
  };
  const headPts = (C, R, a, face) => {
    // cranium as a circle of points from the back of the jaw round the top to the forehead, then the face profile
    const pts = [];
    for (let i = 0; i <= 10; i++) { const th = (110 + i * 22) * D2R; pts.push([Math.cos(th) * R, Math.sin(th) * R]); }
    for (const [x, y] of FACE[face]) pts.push([x * R, y * R]);
    return pts.map(p => add(C, rot(p, a)));
  };

  // ---------------------------------------------------------------- faces in colour (profile, head-local units of R)
  // F: { lid (0 open .. 1 shut), look ([-1..1, -1..1]), brows (front end raised +, lowered -), mouth: 'closed' | 'smile' |
  //      'sad' | 'open' | 'scream' | 'pipe', open (0..1), tears (0..1), blush }
  const faceSvg = (hl, R, F, pal, t) => {
    const ln = pal.line, sk = pal.skin, P = (x, y) => P2(hl(x, y)), sw = R / 56;
    let g = '';
    // the ear, a little behind the middle of the head
    g += `<path d="M${P(-0.08, -0.18)} C${P(-0.34, -0.26)} ${P(-0.4, 0.22)} ${P(-0.1, 0.24)}" fill="${shade(sk, -0.08)}" stroke="${ln}" stroke-width="${f(2.2 * sw)}"/><path d="M${P(-0.12, -0.08)} C${P(-0.26, -0.06)} ${P(-0.24, 0.12)} ${P(-0.12, 0.12)}" fill="none" stroke="${shade(sk, -0.3)}" stroke-width="${f(1.6 * sw)}"/>`;
    // cheek blush and the shadow under the jaw
    g += `<ellipse cx="${f(hl(0.52, 0.3)[0])}" cy="${f(hl(0.52, 0.3)[1])}" rx="${f(0.2 * R)}" ry="${f(0.12 * R)}" fill="#e07a6a" opacity="${f(F.blush ?? 0.28)}"/>`;
    // the eye: a profile almond opening toward the nose, the iris looking where told, the upper lid closing over it
    const lid = cl(F.lid ?? 0.15), lx = cl(F.look ? F.look[0] : 0.3, -1, 1), ly = cl(F.look ? F.look[1] : 0, -1, 1);
    const e0 = [0.5, -0.12], e1 = [0.8, -0.08], top = lerp(-0.25, -0.1, lid), bot = -0.01;
    const eyeD = `M${P(e0[0], e0[1])} Q${P(0.66, top)} ${P(e1[0], e1[1])} Q${P(0.66, bot)} ${P(e0[0], e0[1])}Z`;
    if (lid < 0.92) {
      const id = 'ec' + (uidN++ % 9999), ix = 0.68 + lx * 0.07, iy = -0.11 + ly * 0.05;
      g += `<defs><clipPath id="${id}"><path d="${eyeD}"/></clipPath></defs><path d="${eyeD}" fill="#f6f0e6"/><g clip-path="url(#${id})"><circle cx="${f(hl(ix, iy)[0])}" cy="${f(hl(ix, iy)[1])}" r="${f(0.085 * R)}" fill="${pal.iris || '#3a2a1e'}"/><circle cx="${f(hl(ix, iy)[0])}" cy="${f(hl(ix, iy)[1])}" r="${f(0.045 * R)}" fill="#0c0806"/><circle cx="${f(hl(ix + 0.025, iy - 0.03)[0])}" cy="${f(hl(ix + 0.025, iy - 0.03)[1])}" r="${f(0.018 * R)}" fill="#fff"/></g>`;
    }
    g += `<path d="M${P(e0[0] - 0.03, e0[1] - 0.01)} Q${P(0.66, top - 0.02)} ${P(e1[0] + 0.02, e1[1] - 0.01)}" fill="none" stroke="${ln}" stroke-width="${f(3.4 * sw)}" stroke-linecap="round"/>`;
    g += `<path d="M${P(e1[0] - 0.02, e1[1] - 0.02)} l${f(0.07 * R)},${f(-0.05 * R)}" stroke="${ln}" stroke-width="${f(2 * sw)}" stroke-linecap="round"/>`;
    if (lid > 0.4) g += `<path d="M${P(0.55, bot - 0.005)} Q${P(0.66, bot + 0.03)} ${P(0.77, bot - 0.02)}" fill="none" stroke="${shade(sk, -0.35)}" stroke-width="${f(1.4 * sw)}"/>`;
    // the brow: its front end (toward the nose) rises with fear and grief, drops with anger
    const bf = F.brows ?? 0;
    g += `<path d="M${P(0.42, -0.36)} Q${P(0.62, -0.42 - bf * 0.04)} ${P(0.84, -0.33 - bf * 0.1)}" fill="none" stroke="${pal.brow || pal.hair}" stroke-width="${f(5 * sw)}" stroke-linecap="round"/>`;
    if (bf > 0.4) g += `<path d="M${P(0.78, -0.47)} q${f(0.02 * R)},${f(0.06 * R)} 0,${f(0.1 * R)}" stroke="${shade(sk, -0.3)}" stroke-width="${f(1.2 * sw)}" fill="none"/>`;
    // the nostril
    g += `<path d="M${P(0.86, 0.17)} Q${P(0.92, 0.22)} ${P(0.98, 0.2)}" fill="none" stroke="${shade(sk, -0.4)}" stroke-width="${f(1.8 * sw)}"/>`;
    // the mouth
    const m = F.mouth || 'closed', op = cl(F.open ?? (m === 'scream' ? 0.9 : m === 'open' ? 0.45 : 0));
    if (op > 0.05) {
      const jaw = 0.06 + op * 0.2;
      g += `<path d="M${P(0.74, 0.41)} Q${P(0.86, 0.36)} ${P(0.98, 0.37)} L${P(0.97, 0.4 + jaw)} Q${P(0.84, 0.44 + jaw)} ${P(0.74, 0.43)}Z" fill="#3a0e0c" stroke="${ln}" stroke-width="${f(1.8 * sw)}"/>`;
      if (op > 0.4) g += `<path d="M${P(0.86, 0.38)} L${P(0.97, 0.38)} L${P(0.97, 0.41)} L${P(0.86, 0.41)}Z" fill="#f2eadc"/>`;
    } else {
      const cy = m === 'smile' ? 0.37 : m === 'sad' ? 0.47 : 0.42;
      g += `<path d="M${P(0.74, cy)} Q${P(0.86, 0.43)} ${P(0.97, 0.42)}" fill="none" stroke="${shade(sk, -0.45)}" stroke-width="${f(2.2 * sw)}" stroke-linecap="round"/>`;
      if (m === 'smile') g += `<path d="M${P(0.72, 0.33)} q${f(-0.03 * R)},${f(0.04 * R)} ${f(0.0)},${f(0.08 * R)}" stroke="${shade(sk, -0.3)}" stroke-width="${f(1.3 * sw)}" fill="none"/>`;
    }
    // tears welling and running down the cheek
    if ((F.tears || 0) > 0.05) { const tt = F.tears, k = (t * 0.6) % 1; g += `<path d="M${P(0.62, -0.02)} Q${P(0.6, 0.2)} ${P(0.62, 0.2 + 0.4 * tt)}" stroke="#d8eef8" stroke-width="${f(3 * sw)}" fill="none" opacity="${f(0.7 * tt)}"/><circle cx="${f(hl(0.62, 0.1 + 0.5 * k * tt)[0])}" cy="${f(hl(0.62, 0.1 + 0.5 * k * tt)[1])}" r="${f(0.04 * R)}" fill="#eaf6ff" opacity="${f(0.85 * tt)}"/>`; }
    return g;
  };

  // ---------------------------------------------------------------- the figure
  let uidN = 0;
  // o: { x, y, s, dir, plan, face, t, d (distance walked), gait, stand: { feet: [[x, y], [x, y]] } (local, from the hip
  //      ground point), lean (deg), headTilt (deg), arms: { near, far } each 'swing' | { hand: [x, y] (local), bend } ,
  //      dress: { kind: 'coat' | 'tunic' | 'dress', hem (0 = hips .. 1 = ankles), dag, flare }, hat, hair, extra(fn),
  //      pal (colour mode): { skin, body, dress, sleeve, leg, shoe, hair, hat, veil, apron, belt, line, iris, brow },
  //      F (face, colour mode), light (+1: lit from the right of the screen, -1: from the left) }
  SIL.figure = (o) => {
    const P = PLAN[o.plan], t = o.t || 0;
    const g = o.gait ? SIL.gait(o.d || 0, o.gait, P) : null;
    const lean = (o.lean || 0) * D2R;
    const hipH = -P.hipY - (o.crouch || 0) + (g ? g.rise - o.gait.bob : 0);
    const H = [0, -hipH];
    const neckLen = P.neckY - P.hipY;
    const Nn = add(H, rot([0, neckLen], lean));
    const S = add(H, rot([0, P.shY - P.hipY], lean));
    // legs: [near, far]; the far leg is set a touch behind so the two read apart
    const feet = g ? g.feet : (o.stand && o.stand.feet || [[30, 0], [-30, 0]]).map(([x, y], i) => ({ x, y, ang: (o.stand && o.stand.ang && o.stand.ang[i]) || 0 }));
    const legs = feet.map((ft, i) => {
      const hip = add(H, [i ? -6 : 6, 4]);
      const ank = [ft.x, -P.ank + ft.y];
      const [K, A] = ik(hip, ank, P.th, P.sh, -1);
      return { hip, K, A, ang: ft.ang, i };
    });
    // the head (before the arms, so a hand can be placed relative to it: the pipe at the lips)
    const tilt = lean * 0.5 + (o.headTilt || 0) * D2R;
    const Ch = add(Nn, rot([0, P.headY - P.neckY], tilt * 0.6));
    const hl = (x, y) => add(Ch, rot([x * P.headR, y * P.headR], tilt));
    const sk = { H, S, Ch, hl, tilt, lean, P, t, g };
    // arms: 'swing' (with the gait), { swing: deg }, or { hand: [x, y] | fn(sk), bend, handDir, fist }
    const g2 = g ? g.ph : 0, swing = (o.swingAmp ?? 24) * D2R;
    const arms = ['near', 'far'].map((side, i) => {
      const spec = (o.arms && o.arms[side]) || 'swing';
      const sh = add(S, [i ? -8 : 8, 6]);
      if (spec === 'swing' || spec.swing !== undefined) {
        const amp = spec.swing !== undefined ? spec.swing * D2R : swing, a = g ? (i ? 1 : -1) * amp * Math.cos(TAU * g2) : (spec.rest ?? 4) * D2R * (i ? 1 : -1);
        const dir = rot([0, 1], -a - lean * 0.3), elbowBend = (spec.elbow ?? 14) * D2R + Math.max(0, a) * 0.6;
        const E = add(sh, dir, P.ua), W = add(E, rot(dir, -elbowBend), P.fa);
        return { sh, E, W, hd: rot(dir, -elbowBend - 0.2), i };
      }
      const tgt = typeof spec.hand === 'function' ? spec.hand(sk) : spec.hand;
      const [E, W2] = ik(sh, tgt, P.ua, P.fa, spec.bend ?? 1);
      const hd = spec.handDir ? nrm(typeof spec.handDir === 'function' ? spec.handDir(sk) : spec.handDir) : nrm(sub(W2, E));
      return { sh, E, W: W2, hd, i, fist: spec.fist };
    });

    // ---- the parts, each tagged with what it is made of (one colour in silhouette, its own colour in colour mode)
    const armParts = (a) => {
      const out = [{ d: cap(a.sh, a.E, P.rUa[0], P.rUa[1]), part: 'sleeve' }, { d: cap(a.E, a.W, P.rFa[0], P.rFa[1]), part: 'sleeve' }];
      // the hand: a mitten with a thumb, along the hand direction, growing out of the cuff
      const hd = a.hd, nn = [-hd[1], hd[0]], hL = P.hand;
      const hp = a.fist ? [add(a.W, hd, -2), add(add(a.W, hd, hL * 0.55), nn, hL * 0.18), add(add(a.W, hd, hL * 0.62), nn, -hL * 0.12), add(add(a.W, hd, hL * 0.1), nn, -hL * 0.3)]
        : [add(add(a.W, nn, P.rFa[1] * 0.9), hd, -2), add(add(a.W, hd, hL * 0.9), nn, hL * 0.12), add(a.W, hd, hL), add(add(a.W, hd, hL * 0.85), nn, -hL * 0.16), add(add(a.W, hd, hL * 0.35), nn, -hL * 0.38), add(add(a.W, hd, hL * 0.15), nn, -P.rFa[1])];
      out.push({ d: blob(hp), part: 'hand' });
      // the cuff over the wrist
      out.push({ d: cap(add(a.W, hd, -P.rFa[1] * 1.4), add(a.W, hd, -P.rFa[1] * 0.2), P.rFa[1] * 1.15, P.rFa[1] * 1.15), part: 'cuff' });
      if (o.sleeve) {
        // a dagged hanging sleeve: it starts at the elbow and is cut away toward the wrist, hanging and swinging
        const sv = o.sleeve, fd = nrm(sub(a.W, a.E)), A0 = add(a.E, fd, -P.rUa[1] * 0.4), B0 = add(a.E, fd, P.fa * 0.42), swg = Math.sin(t * 2.6 + a.i * 1.3 + (o.seed || 0)) * 9 - (g ? 12 : 0);
        const Lb = sv.len, tip = add(A0, [swg - 26, Lb]);
        const pts = [add(A0, [0, -P.rUa[1] * 0.6]), add(B0, [0, -P.rFa[1] * 0.4]), add(lerp2(B0, tip, 0.35), [12, 0]), add(lerp2(B0, tip, 0.5), [-4, sv.dag * 0.6]), add(lerp2(B0, tip, 0.7), [6, 4]), add(lerp2(B0, tip, 0.85), [-6, sv.dag * 0.5]), tip, add(lerp2(A0, tip, 0.55), [-10, 0]), add(A0, [-P.rUa[1], 10])];
        out.push({ d: blob(pts), part: 'flap' });
      }
      return out;
    };
    const legParts = (l) => {
      // thigh, then a shin with the calf swelling at the back
      const sd = nrm(sub(l.A, l.K)), mid = add(lerp2(l.K, l.A, 0.36), [-sd[1], sd[0]], P.rSh[1] * 0.28);
      const out = [{ d: cap(l.hip, l.K, P.rTh[0], P.rTh[1]), part: 'leg' }, { d: cap(l.K, mid, P.rSh[0], P.rSh[1]), part: 'leg' }, { d: cap(mid, l.A, P.rSh[1], P.rSh[2]), part: 'leg' }];
      // the foot: heel behind the ankle, sole flat, toe forward (long and pointed on the Piper)
      const fa = l.ang, F = (x, y) => add(l.A, rot([x, y], fa));
      const L = P.foot, T = P.toe;
      out.push({ d: blob([F(-L * 0.26, -P.rSh[2] * 0.6), F(L * 0.18, -P.rSh[2] * 1.3), F(L * 0.62, -L * 0.1), F(L * 0.86 + T, -L * 0.02 - T * 0.12), F(L * 0.7, P.ank * 0.95), F(-L * 0.18, P.ank * 1.05), F(-L * 0.3, P.ank * 0.3)]), part: 'shoe' });
      return out;
    };
    // the torso in profile: the small of the back, the shoulder blades, the chest, the waist and belly (y up from the hip)
    const T = (x, y) => add(H, rot([x, y], lean)), th = P.shY - P.hipY;
    const torso = () => blob([T(-P.rHip * 1.05, 16), T(-P.rWaist * 1.02, th * 0.36), T(-P.rChest * 0.98, th * 0.74), T(-P.rChest * 0.72, th * 0.98), T(-P.rNeck, th * 1.07),
      T(P.rNeck * 0.9, th * 1.07), T(P.rChest * 0.78, th * 0.94), T(P.rChest, th * 0.7), T(P.rWaist, th * 0.4), T(P.rHip * 0.92, th * 0.14), T(P.rHip * 0.72, 22), T(0, 30)]);
    const wrap = (arr, far) => arr.map(q => typeof q === 'string' ? { d: q, part: 'extra' } : Object.assign({}, q, { far: far || q.far }));
    // ---- two layers: behind the coat (far limbs, torso, near leg, the coat itself), then in front of it (near arm, head,
    //      hair, hat, props); the stained glass goes between them, clipped to the coat
    const PB = [], PF = [];
    if (o.extraBack) PB.push(...wrap(o.extraBack({ ...sk, arms, legs })));
    if (o.hairBack) PB.push(...wrap(o.hairBack(hl, t, P, g)).map(q => Object.assign(q, { part: q.part === 'extra' ? 'hair' : q.part })));
    for (const a of arms.filter(a => a.i === 1)) PB.push(...wrap(armParts(a), true));
    for (const l of legs.filter(l => l.i === 1)) PB.push(...wrap(legParts(l), true));
    PB.push({ d: torso(), part: 'body' }, { d: cap(S, Ch, P.rNeck, P.rNeck), part: 'skin' });
    for (const l of legs.filter(l => l.i === 0)) PB.push(...wrap(legParts(l)));
    let coatD = null, coatG = null;
    if (o.dress) {
      const dr = o.dress, hemY = lerp(H[1] + 30, -P.ank - 20, dr.hem ?? 0.4);
      const kx = Math.max(...legs.map(l => l.K[0])), bx = Math.min(...legs.map(l => l.K[0]));
      const sway = Math.sin(t * 2.3 + (o.seed || 0)) * 8 + (g ? -o.gait.stride * 0.03 : 0);
      const fl = dr.flare ?? 1;
      // shoulders, a fitted bodice to the waist, then a skirt flaring over the knees and swinging with the stride
      const fx = Math.max(kx + 24, P.rHip + 18) + 16 * fl + sway, backX = Math.min(bx - 24, -P.rHip - 18) - 22 * fl + sway * 1.4;
      // the skirt as it hangs at rest (hip at its mean height, legs together, no sway), for a pattern carried on the cloth
      const hip0 = -P.hipY - (o.crouch || 0) - (g ? o.gait.bob * 0.5 : 0);
      coatG = { fx, bx: backX, hemY, H0y: -hip0, hemY0: lerp(-hip0 + 30, -P.ank - 20, dr.hem ?? 0.4), fx0: P.rHip + 18 + 16 * fl, bx0: -P.rHip - 18 - 22 * fl };
      const pts = [T(-P.rChest * 0.35, th * 1.05), T(-P.rChest - 8, th * 0.95), T(-P.rChest - 4, th * 0.68), T(-P.rWaist - 5, th * 0.38), T(-P.rHip - 12, th * 0.08), [backX, hemY - 4]];
      const n = dr.dag ? 11 : 5;
      for (let i = 1; i < n; i++) { const u = i / n, x = lerp(backX, fx, u), wob = Math.sin(t * 3.1 + i * 1.7 + (o.seed || 0)) * 5; pts.push([x, hemY + (dr.dag ? (i % 2 ? dr.dag : 0) : 0) + wob]); }
      pts.push([fx, hemY - 6], T(P.rHip + 12, th * 0.06), T(P.rWaist + 5, th * 0.38), T(P.rChest + 6, th * 0.7), T(P.rChest * 0.7, th * 0.98), T(P.rNeck, th * 1.06));
      coatD = poly(pts);
      PB.push({ d: coatD, part: 'dress' });
      // an apron hanging from the waist over the front of the skirt; a belt
      if (o.apron) PB.push({ d: poly([T(P.rWaist * 0.1, th * 0.36), T(P.rWaist + 6, th * 0.36), [fx + 4, hemY - 30], [lerp(backX, fx, 0.42), hemY - 26], T(-P.rWaist * 0.2, th * 0.3)]), part: 'apron' });
      if (o.belt) PB.push({ d: poly([T(-P.rWaist - 6, th * 0.4), T(P.rWaist + 6, th * 0.4), T(P.rWaist + 6, th * 0.34), T(-P.rWaist - 6, th * 0.34)]), part: 'belt' });
      sk.waist = th * 0.38;
    }
    for (const a of arms.filter(a => a.i === 0)) PF.push(...wrap(armParts(a)));
    PF.push({ d: (o.pal ? blob : poly)(headPts(Ch, P.headR, tilt, o.face || 'soft')), part: 'skin', head: true });
    if (o.hair) PF.push(...wrap(o.hair(hl, t, P, g)).map(q => Object.assign(q, { part: q.part === 'extra' ? 'hair' : q.part })));
    if (o.hat) PF.push(...wrap(o.hat(hl, t, P, g)).map(q => Object.assign(q, { part: q.part === 'extra' ? 'hat' : q.part })));
    if (o.extra) PF.push(...wrap(o.extra({ ...sk, arms, legs })));

    const s = o.s || 1, dir = o.dir || 1, rim = o.rim || null;
    const tf = (dx = 0, dy = 0) => `translate(${f(o.x + dx)},${f(o.y + dy)}) scale(${f(s * dir * (o.flip ?? 1))},${f(s)})`;
    let svg = '';
    if (!o.pal) {
      // silhouette: everything one colour
      const col = o.col || '#0c0a0e';
      const pb = PB.map(q => `<path d="${q.d}"/>`).join(''), pf = PF.map(q => `<path d="${q.d}"/>`).join('');
      if (rim) svg += `<g transform="${tf(rim.dx, rim.dy)}" fill="${rim.col}" opacity="${rim.op ?? 1}">${pb}${pf}</g>`;
      svg += `<g transform="${tf()}" fill="${col}">${pb}</g>`;
      if (o.glass && coatD) { const id = 'sg' + (uidN++ % 9999); svg += `<g transform="${tf()}"><defs><clipPath id="${id}"><path d="${coatD}"/></clipPath></defs><g clip-path="url(#${id})">${o.glass({ H, S, lean, P, t, coat: coatG })}</g></g>`; }
      svg += `<g transform="${tf()}" fill="${col}">${pf}</g>`;
    } else {
      // colour: each part in its own colour with an ink outline; far limbs in shadow; soft shading across the body and
      // skirt toward the side away from the light; a rim of light on the lit side; the face drawn over the head
      const pal = Object.assign({ line: '#2a1810', hand: o.pal.skin, cuff: o.pal.sleeve, flap: o.pal.sleeve, extra: '#3a2a20' }, o.pal);
      const lightL = (o.light ?? 1) * dir * (o.flip ?? 1) < 0;   // in local coordinates: is the light on the -x side?
      const gid = 'shd' + (uidN++ % 9999);
      const defs = `<defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity="${lightL ? 0 : 0.32}"/><stop offset="0.55" stop-color="#000" stop-opacity="0.08"/><stop offset="1" stop-color="#000" stop-opacity="${lightL ? 0.32 : 0}"/></linearGradient></defs>`;
      const lw = f((o.lineW ?? 2.6) / Math.max(0.3, s));
      const draw = q => {
        const base = q.fill || pal[q.part] || pal.extra, fill = q.far ? shade(base, -0.2) : base;
        let e = `<path d="${q.d}" fill="${fill}" stroke="${pal.line}" stroke-width="${lw}" stroke-linejoin="round"/>`;
        if (['body', 'dress', 'sleeve', 'leg', 'apron', 'skin'].includes(q.part) && !q.noShade) e += `<path d="${q.d}" fill="url(#${gid})"/>`;
        return e;
      };
      // runs of parts of one material (a sleeve's two halves, a leg's three) are outlined together and then filled again
      // without the outline, so no seam shows at the joints
      const drawAll = arr => { let out = '', i = 0; while (i < arr.length) { let j = i + 1; while (j < arr.length && arr[j].part === arr[i].part && !!arr[j].far === !!arr[i].far && !arr[j].head && !arr[i].head) j++; const run = arr.slice(i, j); out += run.map(draw).join(''); if (run.length > 1) out += run.map(q => `<path d="${q.d}" fill="${q.far ? shade(q.fill || pal[q.part] || pal.extra, -0.2) : (q.fill || pal[q.part] || pal.extra)}"/>`).join('') + (['body', 'dress', 'sleeve', 'leg', 'apron', 'skin'].includes(run[0].part) ? run.map(q => `<path d="${q.d}" fill="url(#${gid})"/>`).join('') : ''); i = j; } return out; };
      if (rim) svg += `<g transform="${tf(rim.dx, rim.dy)}" fill="${rim.col}" opacity="${rim.op ?? 1}">${PB.concat(PF).map(q => `<path d="${q.d}"/>`).join('')}</g>`;
      svg += `<g transform="${tf()}">${defs}${drawAll(PB)}</g>`;
      if (o.glass && coatD) { const id = 'sg' + (uidN++ % 9999); svg += `<g transform="${tf()}"><defs><clipPath id="${id}"><path d="${coatD}"/></clipPath></defs><g clip-path="url(#${id})">${o.glass({ H, S, lean, P, t, coat: coatG })}</g></g>`; }
      const iHead = PF.findIndex(q => q.head);
      svg += `<g transform="${tf()}">${drawAll(PF.slice(0, iHead + 1))}${faceSvg(hl, P.headR, o.F || {}, pal, t)}${drawAll(PF.slice(iHead + 1))}</g>`;
    }
    // where things are, in world space (for props, cameras and transitions)
    const W = p => [o.x + p[0] * s * dir * (o.flip ?? 1), o.y + p[1] * s];
    return { svg, W, H, S, Ch, hl, arms, legs, P };
  };
  // ---------------------------------------------------------------- stained glass for a coat (in the body's frame)
  SIL.glassPanes = (seed, cols, opts = {}) => ({ H, S, lean, P, t, coat }) => {
    const r = G.RIG.rng(seed), th = P.shY - P.hipY;
    // below the hips the panes are carried by the cloth: laid out on the skirt at rest, then swung, flared and stretched
    // with it, so the hem and the sides never slide across them. Panes that would reach into the dagged hem are left
    // out (in cloth space, so none comes and goes): before, lone fragments flickered in the dags as the skirt swung.
    const yS = th * 0.07;
    let warp = q => q, hemT = Infinity;
    if (coat) {
      const hemH = coat.hemY - H[1], hemH0 = coat.hemY0 - coat.H0y, c0 = (coat.fx0 + coat.bx0) / 2, w0 = coat.fx0 - coat.bx0;
      const c1 = (coat.fx + coat.bx) / 2 - H[0], k1 = (coat.fx - coat.bx) / w0, sy = (hemH - yS) / (hemH0 - yS);
      hemT = hemH0;
      warp = ([x, y]) => { if (y <= yS) return [x, y]; const v = cl((y - yS) / (hemH0 - yS)); return [lerp(c0, c1, v) + (x - c0) * lerp(1, k1, v), yS + (y - yS) * sy]; };
    }
    const T = (x, y) => add(H, rot(warp([x, y]), lean));
    const dx = opts.dx || 54, dy = opts.dy || 46, top = th * 1.12, bot = -H[1] + 30;
    let g = '';
    for (let j = 0, y = top; y < bot; j++, y += dy) for (let i = 0, x = -280 + (j % 2) * dx / 2; x < 280; i++, x += dx) {
      const c = cols[Math.floor(r() * cols.length)];
      if (y + dy * 0.56 > hemT - 10) continue;
      const p = [[x, y - dy * 0.56], [x + dx * 0.5, y], [x, y + dy * 0.56], [x - dx * 0.5, y]].map(([a, b]) => T(a, b));
      g += `<path d="${poly(p)}" fill="${c}" opacity="0.94" stroke="#140c10" stroke-width="${opts.lead || 5}" stroke-linejoin="round"/>`;
      g += `<path d="M${P2(lerp2(p[3], p[0], 0.3))} L${P2(lerp2(p[0], p[1], 0.3))}" stroke="#fff6e0" stroke-width="2.5" opacity="0.3"/>`;
    }
    // the belt at the waist, with its buckle
    const wy = th * 0.38;
    g += `<path d="${poly([T(-300, wy - 10), T(300, wy - 10), T(300, wy + 10), T(-300, wy + 10)])}" fill="#140c10"/><path d="${poly([T(P.rWaist - 8, wy - 13), T(P.rWaist + 8, wy - 13), T(P.rWaist + 8, wy + 13), T(P.rWaist - 8, wy + 13)])}" fill="none" stroke="#c8a040" stroke-width="3.5"/>`;
    return g;
  };
})(window);
