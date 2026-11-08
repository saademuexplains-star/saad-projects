// Cast for the Coca-Cola video (the approved cast20 faces, brought up to the Semmelweis-test standard of 2026-11-08):
// hair from hairkit.js drawn INSIDE each figure's light pass (Q.litHair), the cloth woven (o.weave), finished tailoring.
// You, John Pemberton, at thirty-four (a cavalry officer, Columbus, Georgia, 1865) and at fifty-four (an Atlanta
// pharmacist with a secret, 1885-88); the field surgeon; the soda clerk at the fountain.
(function (G) {
  const { person, rng, shade } = G.RIG, K0 = G.CAST, T = G.TAILOR, HK = G.HAIRKIT;
  const f = v => Math.round(v * 10) / 10;
  const Q = {};
  const face = (base, p) => Object.assign({}, base, p.face || {}, p.blink ? { lid: Math.max((p.face && p.face.lid) ?? base.lid ?? 0.2, p.blink) } : {});
  const mk = (base, faceBase) => p => person(Object.assign({}, base, p, { fx: Object.assign({}, base.fx, p.fx || {}), face: face(faceBase, p) }));
  Q.blink = K0.blink; Q.talk = K0.talk; Q.breath = K0.breath;

  // the transform the rig gives the head (person-local -> head-local: face centre 0,0), for art on the face
  Q.headT = (P, o) => {
    const s = o.s || 1, b = o.breath || 0, sx = Math.round(s * (1 - b * 0.0015) * 1e5) / 1e5, sy = Math.round(s * (1 + b * 0.004) * 1e5) / 1e5, hsc = o.headScale ?? 1;
    return `translate(${o.x || 0},${o.y || 0}) rotate(${o.sway || 0}) scale(${sx},${sy}) translate(0,${P.D.headY + (1 - hsc) * 110}) rotate(${o.tilt || 0}) scale(${hsc})`;
  };
  Q.headArt = (P, o, svg) => `<g transform="${Q.headT(P, o)}">${svg}</g>`;
  // the figure lit TOGETHER with its hair (back art + body + front art, then extra - a held prop and its detached fist -
  // through ONE light pass), so the hair takes the same key, rim and face light as the head (castT1.js)
  Q.litHair = (P, o, art, L, extra = '', ext = null) => {
    const s = o.s || 1, E = [o.x - 340 * s, o.y - 1520 * s, o.x + 340 * s, o.y + 20 * s];
    const e2 = ext ? [Math.min(E[0], ext[0]), Math.min(E[1], ext[1]), Math.max(E[2], ext[2]), Math.max(E[3], ext[3])] : E;
    return G.STAGE.litWith(P, L, (art && art.back ? Q.headArt(P, o, art.back) : '') + P.svg + (art && art.front ? Q.headArt(P, o, art.front) : '') + extra, e2);
  };
  // ---------------- the arm's contact shadow on the body (the user, 2026-11-08: "arm is invisible and blending with
  // shirt"): in ONE light pass an arm in front of the torso gets no edge, and a white sleeve on a white jacket (or grey on
  // grey) disappears. This lays a soft dark shadow of the arm (and its detached fist) on the torso, offset away from the
  // light - masked to the torso and never over the arm itself, so nothing is redrawn and nothing gets a rim of its own.
  // Draw it after P.svg inside the same light pass (litHair's extra), before a held prop.
  let aoN = 0;
  Q.armAO = (P, o, which = 'RL', L = {}, op = 0.55) => {
    const D = P.D, s = o.s || 1, id = 'cao' + (++aoN), R = G.RIG;
    const loc = [[-D.shX * 1.04, D.shY - 10], [D.shX * 1.04, D.shY - 10], [D.wX * 1.06, D.wY], [D.hemX * 1.04, (D.hemY ?? -470) + 20], [-D.hemX * 1.04, (D.hemY ?? -470) + 20], [-D.wX * 1.06, D.wY]];
    const pts = loc.map(p => R.toWorld(o, p)), xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    const bx0 = Math.min(...xs) - 120, by0 = Math.min(...ys) - 120, bw = Math.max(...xs) - bx0 + 120, bh = Math.max(...ys) - by0 + 120;
    const BB = `x="${f(bx0)}" y="${f(by0)}" width="${f(bw)}" height="${f(bh)}"`;
    const lx = (L.from && L.from[0]) || 0, dx = -Math.sign(lx) * 7 * s, dy = 10 * s;
    const arms = (which.includes('R') ? (P.armRsvg || '') + (P.handR || '') : '') + (which.includes('L') ? (P.armLsvg || '') + (P.handL || '') : '');
    if (!arms) return '';
    const torso = `M${pts.map(p => f(p[0]) + ',' + f(p[1])).join(' L')}Z`;
    return `<defs><filter id="${id}k" filterUnits="userSpaceOnUse" ${BB} color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 3 -1"/></filter>` +
      `<filter id="${id}s" filterUnits="userSpaceOnUse" ${BB} color-interpolation-filters="sRGB"><feFlood flood-color="#120804"/><feComposite in2="SourceAlpha" operator="in" result="a"/><feMorphology in="a" operator="dilate" radius="${f(2.5 * s)}" result="d"/><feGaussianBlur in="d" stdDeviation="${f(7 * s)}" result="b"/><feOffset in="b" dx="${f(dx)}" dy="${f(dy)}"/></filter>` +
      `<mask id="${id}m" maskUnits="userSpaceOnUse" ${BB}><path d="${torso}" fill="#fff"/><g filter="url(#${id}k)">${arms}</g></mask></defs>` +
      `<g mask="url(#${id}m)" opacity="${op}"><g filter="url(#${id}s)">${arms}</g></g>`;
  };
  // soot on your face after the fight (head-local)
  Q.SOOT = `<g opacity="0.5"><ellipse cx="-70" cy="-70" rx="34" ry="16" fill="#1a120c" filter="url(#b8)"/><ellipse cx="66" cy="48" rx="30" ry="18" fill="#1a120c" filter="url(#b8)"/><ellipse cx="-46" cy="84" rx="26" ry="12" fill="#1a120c" filter="url(#b8)"/></g>`;

  // ---------------- the sabre cut opening (T.wound with a reveal k, 0..1): the gash runs from a toward b behind the
  // blade, tapering at its running end; the blood soaks into the wool after it and the drips run down later. Every
  // random number is drawn in T.wound's order, so at k = 1 it is exactly the approved wound.
  Q.woundK = (o = {}) => {
    const cl = v => Math.max(0, Math.min(1, v)), k = cl(o.k ?? 1), kb = cl(o.bleed ?? k), kx = k * 1.14;
    const a = o.a || [-178, -1104], b = o.b || [158, -868], r = rng(o.seed || 2011), dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
    let g = '';
    // the blood soaking into the wool (k: the cut's progress along a -> b; bleed: the blood's)
    for (let i = 0; i < 16; i++) { const u = r(), px = a[0] + dx * u + (r() - 0.5) * 26, py = a[1] + dy * u + 8 + r() * 46, rx = 12 + r() * 30, ry = 8 + r() * 22, rot = r() * 180, op = 0.3 + r() * 0.35, w = cl((kb - u * 0.6) / 0.4); if (w > 0.002) g += `<ellipse cx="${f(px)}" cy="${f(py)}" rx="${f(rx * (0.4 + 0.6 * w))}" ry="${f(ry * (0.4 + 0.6 * w))}" transform="rotate(${f(rot)} ${f(px)} ${f(py)})" fill="#2a0604" opacity="${f(op * w)}" filter="url(#b4)"/>`; }
    for (let i = 0; i < 6; i++) { const u = 0.2 + r() * 0.75, px = a[0] + dx * u, py = a[1] + dy * u + 8, len0 = 40 + r() * 170, w = 4 + r() * 5, gw = cl((kb - 0.3 - u * 0.5) / 0.225), len = len0 * gw; if (gw > 0.01) g += `<path d="M${f(px)},${f(py)} C${f(px + 3)},${f(py + len * 0.4)} ${f(px - 4)},${f(py + len * 0.7)} ${f(px + 1)},${f(py + len)}" stroke="#3a0604" stroke-width="${f(w)}" stroke-linecap="round" fill="none" opacity="0.85"/><circle cx="${f(px + 1)}" cy="${f(py + len)}" r="${f(w * 0.8)}" fill="#3a0604" opacity="0.85"/>`; }
    // the gash, tapering to nothing at its running end (at k = 1 every point is at full width: T.wound exactly)
    const N = 24, top = [], bot = [], mid = [];
    for (let i = 0; i <= N; i++) {
      const u = i / N, tp = Math.sqrt(cl((kx - u) / 0.14)), w = (1.5 + 7 * Math.pow(Math.sin(Math.PI * u), 0.6)) * tp, px = a[0] + dx * u, py = a[1] + dy * u;
      top.push([px + nx * (w + r() * 3 * tp), py + ny * (w + r() * 3 * tp)]); bot.push([px - nx * (w + r() * 2 * tp), py - ny * (w + r() * 2 * tp)]); mid.push([px + nx * w * 0.1, py + ny * w * 0.1]);
    }
    if (kx <= 0.002) return g;
    const tipU = Math.min(1, kx), m = Math.min(N, Math.ceil(tipU * N)), poly = (A, B) => 'M' + A.map(p => f(p[0]) + ',' + f(p[1])).join(' L') + ' L' + B.slice().reverse().map(p => f(p[0]) + ',' + f(p[1])).join(' L') + 'Z';
    const tip = [a[0] + dx * tipU, a[1] + dy * tipU], T2 = top.slice(0, m + 1), B2 = bot.slice(0, m + 1);
    if (tipU < 1) { T2[m] = tip; B2[m] = tip; }
    g += `<path d="${poly(T2, B2)}" fill="#1a0302" stroke="#2a0604" stroke-width="2" stroke-linejoin="round"/>`;
    const mEnd = Math.min(N - 1, m - 1), hEnd = Math.min(N - 2, m - 1);
    if (mEnd > 3) g += `<path d="M${mid.slice(2, mEnd).map(p => f(p[0]) + ',' + f(p[1])).join(' L')}" stroke="#8a140c" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
    if (hEnd > 4) g += `<path d="M${top.slice(3, hEnd).map(p => f(p[0] - nx * 2) + ',' + f(p[1] - ny * 2)).join(' L')}" stroke="#d86848" stroke-width="1.2" fill="none" opacity="0.55"/>`;
    // the torn flaps lift as the cut passes them
    for (let i = 3; i < N - 2; i += 3) { const p = top[i], q = top[i + 1], kk = 8 + r() * 8, lift = cl((kx - (i + 1) / N) / 0.1); if (lift > 0) g += `<path d="M${f(p[0])},${f(p[1])} L${f(q[0])},${f(q[1])} L${f((p[0] + q[0]) / 2 + nx * kk * lift)},${f((p[1] + q[1]) / 2 + ny * kk * lift)}Z" fill="${o.cloth || '#6e695f'}" stroke="#2a2620" stroke-width="1"/>`; }
    for (let i = 2; i < N - 2; i += 4) { const p = bot[i], q = bot[i + 1], kk = 6 + r() * 6, lift = cl((kx - (i + 1) / N) / 0.1); if (lift > 0) g += `<path d="M${f(p[0])},${f(p[1])} L${f(q[0])},${f(q[1])} L${f((p[0] + q[0]) / 2 - nx * kk * lift)},${f((p[1] + q[1]) / 2 - ny * kk * lift)}Z" fill="#5a1410" stroke="#2a0604" stroke-width="1"/>`; }
    return g;
  };

  // ======================================================= YOU: John Pemberton. A long face, high cheekbones, deep-set
  // brown eyes under heavy straight brows, a long straight nose, thin lips under a full moustache
  const pembFx = { w: 0.95, len: 1.1, cheek: 1.06, hollow: 0.25, jaw: 0.94, chinW: 0.9, chin: 1.04, eyeS: 0.96, eyeW: 1.0, eyeTilt: -1, hooded: 0.3, crow: 0.3, nose: 'long', noseS: 1.06, noseL: 1.06, lipT: 0.85, mouthW: 1.0, browT: 1.3, browArch: 1, earS: 1.02 };
  const PDIMS = { shX: 152, wX: 118, hemX: 146, sw: 74, hand: 112 };
  // at thirty-four, 1865: dark brown hair parted on the left and swept across, unshaven; the grey wool shell jacket
  // (waist length, a twill) with its buff collar, two rows of brass buttons
  const YHAIR = '#2e1e12';
  const YOUNG = { kind: 'man', dims: Object.assign({}, PDIMS, { hemY: -700, hemX: 132 }), skin: '#e2b896', tunic: '#6c675e', sleeve: '#67625a', legs: '#5a564e', feet: '#1a1410', belt: false, tailored: true,
    weave: { kind: 'twill', op: 0.13 },
    hair: YHAIR, hairStyle: 'bald', hairSeed: 2001, brow: '#22160e', mustache: '#22160e', mstyle: 'walrus', stubble: 0.7, lightX: 1, fx: pembFx };
  const UNI = T.uniform({ collar: '#a8843a' }), UNI_S = T.uniform({ collar: '#a8843a', soil: 2011 });
  Q.pembYoung = mk(Object.assign({}, YOUNG, { costume: UNI }), { expr: 'neutral', iris: '#4a3422', lid: 0.22 });
  // ... cut down at Columbus: soot and mud on the wool, the sabre cut across the chest (woundK: k, the cut opening)
  Q.pembYoungHurt = mk(Object.assign({}, YOUNG, { costume: UNI_S + T.wound({ seed: 2011 }) }), { expr: 'fear', iris: '#4a3422', lid: 0.3 });
  Q.youngCostume = (k, bleed) => UNI_S + Q.woundK({ seed: 2011, k, bleed });
  Q.pembYoungArt = () => HK.sidePart({ fx: pembFx, col: YHAIR, id: 'pyh', light: 1, part: 28, crown: 0.86 });

  // at fifty-four, 1885-88: the hair grey and gone from the crown, a soft fringe round the sides; the cheeks hollowed
  // by twenty years of morphine, a short grey beard; the pleated linen shirt under a charcoal waistcoat, the wing
  // collar and black bow tie
  const oldFx = Object.assign({}, pembFx, { hollow: 0.7, crow: 0.9, hooded: 0.45, age: 0.6 });
  const OLD = { kind: 'man', dims: Object.assign({}, PDIMS, { hemY: -760, hemX: 126 }), skin: '#dcb090', tunic: '#e4ded0', sleeve: '#dfd9ca', legs: '#2a2622', feet: '#141010', belt: false, tailored: true,
    weave: { kind: 'linen', op: 0.13 },
    hair: '#6e665c', hairStyle: 'bald', hairSeed: 2002, brow: '#4a4038', mustache: '#7a7268', mstyle: 'walrus', beard: '#857d72', beardStyle: 'short', stubble: 0.3, lightX: -1,
    costume: T.shirt({ pleats: true, studs: 2 }) + T.waistcoat({ col: '#26221e' }) + T.collar({ type: 'wing', y: -1160 }),
    fx: oldFx };
  const OLDFACE = { expr: 'grim', iris: '#4a3422', lid: 0.32, age: true, bags: 0.6 };
  Q.pembOld = mk(OLD, OLDFACE);
  // ... in public at the fountain, 1886: the black frock coat (a fine twill, velvet collar, pick-stitched lapels, horn
  // buttons) over a charcoal silk waistcoat with the gold watch chain
  Q.pembOldCoat = mk(Object.assign({}, OLD, { tunic: '#1f1d1b', sleeve: '#1d1b19', weave: { kind: 'twill', op: 0.12 },
    costume: T.shirt({ col: '#efebe0', pleats: true }) + T.vest({ col: '#34302c', chain: '#e0b450' }) + T.collar({ type: 'wing', y: -1160, tieCol: '#0c0a0a' }) + T.jacket({ col: '#1f1d1b', pocket: 'plain', bkind: 'horn', weave: 'twill', weaveOp: 0.12, velvet: true }) }), OLDFACE);
  Q.pembOldArt = () => HK.baldFringe({ fx: oldFx, col: '#8e877c', id: 'poh', light: -1 });

  // THE FIELD SURGEON: a broad heavy face, small eyes under heavy flat brows, a broad nose, a short dark beard and a
  // walrus moustache going grey, greying brown hair parted on the right; shirt and braces under a bloodied leather
  // bib apron to the knee
  const surgFx = { w: 1.08, len: 0.98, cheek: 1.12, jaw: 1.1, chinW: 1.12, chin: 0.94, eyeS: 0.86, eyeW: 0.96, hooded: 0.5, crow: 0.9, lidAdd: 0.04, nose: 'broad', noseS: 1.12, noseL: 0.96, lipT: 1.1, mouthW: 1.08, browT: 1.55, browArch: -1, browOut: 4, earS: 1.1, mole: [-40, 46], age: 0.5 };
  Q.surgeon = mk({ kind: 'man', dims: { shX: 168, wX: 150, hemX: 170, sw: 84, hand: 120, hemY: -560 }, skin: '#d8a888', tunic: '#cfc6b2', sleeve: '#c9bfaa', legs: '#3a342c', feet: '#1a1410', belt: false, tailored: true,
    weave: { kind: 'linen', op: 0.14 },
    hair: '#5e5246', hairStyle: 'bald', hairSeed: 2031, brow: '#4a4038', beard: '#6a5e50', beardStyle: 'short', mustache: '#6a5e50', mstyle: 'walrus', stubble: 0.3, lightX: 1,
    costume: T.apron({ col: '#4a3424', blood: 2031 }),
    fx: surgFx },
  { expr: 'grim', iris: '#3a3a30', lid: 0.35, age: true });
  Q.surgeonArt = () => HK.sidePart({ fx: surgFx, col: '#5a4e42', id: 'sgh', light: 1, part: -30 });

  // THE SODA CLERK: young, an open round face, big hazel eyes, a button nose, full lips, big ears; brown hair parted
  // on the left and combed flat with pomade; a hip-length white cotton jacket with notched lapels (no velvet: a
  // working jacket), the shirt's high collar and a black bow tie, a pencil in the breast pocket
  const clerkFx = { w: 0.98, len: 0.98, cheek: 1.08, jaw: 0.92, chinW: 0.94, eyeS: 1.08, eyeW: 1.02, hooded: 0.05, crow: 0.1, nose: 'button', noseS: 0.96, lipT: 1.12, mouthW: 1.06, browT: 1.0, browArch: 2, earS: 1.14, freckles: 0.2 };
  Q.clerk = mk({ kind: 'man', dims: { shX: 146, wX: 116, hemX: 138, sw: 72, hand: 108, hemY: -640 }, skin: '#eebf98', tunic: '#ebe7dd', sleeve: '#e6e2d8', legs: '#2a2622', feet: '#141010', belt: false, tailored: true,
    weave: { kind: 'linen', op: 0.12 },
    hair: '#4a2e16', hairStyle: 'bald', hairSeed: 2004, brow: '#4a2e18', lightX: 1,
    costume: T.shirt({ col: '#f8f6f0', placket: true }) + T.collar({ type: 'stand' }) + T.jacket({ col: '#efebe2', pocket: 'pencil', weave: 'linen', weaveOp: 0.1 }),
    fx: clerkFx },
  { expr: 'neutral', iris: '#6a6a3a', lid: 0.15 });
  Q.clerkArt = () => HK.sidePart({ fx: clerkFx, col: '#4a2e16', id: 'clh', light: 1, part: 24, crown: 0.88 });

  Q.HAND = { pembYoung: 112, pembYoungHurt: 112, pembOld: 112, pembOldCoat: 112, surgeon: 120, clerk: 108 };
  G.QCAST = Q;
})(window);
