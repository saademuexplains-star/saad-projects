// Props for "The King's Decoy": the horse (side view, real walk / trot / gallop leg cycles), the royal coach with its
// passenger window, the rider's leg, arrows, powder barrels, the fuse, the fireball, the gibbet, the brake lever.
// Units are person-local (a man is 1450 tall, feet at 0, -y up), so horses, coaches and people share one scale.
(function (G) {
  const P = G.PROPS, { f, shade, mix, rng, uid } = G.RIG;
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t;
  const ss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  const rot = (v, deg) => { const a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a); return [v[0] * c - v[1] * s, v[0] * s + v[1] * c]; };
  const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k], sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
  const len = v => Math.hypot(v[0], v[1]), nrm = v => { const n = len(v) || 1; return [v[0] / n, v[1] / n]; }, perp = v => [-v[1], v[0]];
  const pt = p => `${f(p[0])},${f(p[1])}`;
  const OUTC = '#140c06';
  const ol = (w = 3, op = 0.85) => `stroke="${OUTC}" stroke-width="${w}" stroke-opacity="${op}" stroke-linejoin="round"`;
  P.V2 = { rot, add, sub, len, nrm, perp };

  // ======================================================= the horse
  // Gaits: P cycle seconds, beta stance fraction, S stride (local units), lifts, body bob / pitch / head nod; ph = leg
  // phase offsets [LF, RF, LH, RH]. Ground speed = S / (beta * P). The near side is the horse's left (camera side).
  const GAIT = {
    stand: { P: 1.2, beta: 1, S: 0, liftF: 0, liftH: 0, bob: 0, bobN: 2, bobPh: 0, pitch: 0, nod: 0, hb: 0, tail: 0, ph: [0.25, 0.75, 0, 0.5] },
    walk: { P: 1.15, beta: 0.62, S: 380, liftF: 170, liftH: 120, bob: 9, bobN: 2, bobPh: 0.31, pitch: 0.5, nod: 3.5, hb: 4, tail: 0.25, ph: [0.25, 0.75, 0, 0.5] },
    trot: { P: 0.7, beta: 0.44, S: 520, liftF: 270, liftH: 180, bob: 20, bobN: 2, bobPh: 0.22, pitch: 0.8, nod: 2, hb: 6, tail: 0.45, ph: [0, 0.5, 0.5, 0] },
    gallop: { P: 0.54, beta: 0.36, S: 820, liftF: 340, liftH: 240, bob: 34, bobN: 1, bobPh: 0.3, pitch: 4.5, nod: 7, hb: 17, tail: 1, ph: [0.42, 0.52, 0, 0.1] },
  };
  P.GAIT = GAIT;
  const blendG = (a, b, k) => { const o = {}; for (const key in a) o[key] = Array.isArray(a[key]) ? a[key].map((v, i) => lerp(v, b[key][i], k)) : lerp(a[key], b[key], k); return o; };
  P.blendG = blendG;
  // a horse's journey: keys [[t, gaitName], ...] (gaits blend smoothly between keys). Integrates distance (local units)
  // and the leg cycle so a gait change never makes a leg jump. Returns t -> { x, c, g, v }
  P.horseRun = (keys, tA, tB, c0 = 0) => {
    const gAt = t => { if (t <= keys[0][0]) return GAIT[keys[0][1]]; for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) { const k = ss(keys[i - 1][0], keys[i][0], t); return blendG(GAIT[keys[i - 1][1]], GAIT[keys[i][1]], k); } return GAIT[keys[keys.length - 1][1]]; };
    const dt = 1 / 240, n = Math.ceil((tB - tA) / dt) + 2, X = new Float64Array(n), Cc = new Float64Array(n);
    X[0] = 0; Cc[0] = c0;
    for (let i = 1; i < n; i++) { const t = tA + (i - 0.5) * dt, g = gAt(t); X[i] = X[i - 1] + (g.S > 0.5 ? g.S / (g.beta * g.P) : 0) * dt; Cc[i] = Cc[i - 1] + dt / g.P; }
    return t => { const u = clamp((t - tA) / dt, 0, n - 1.001), i = Math.floor(u), k = u - i, g = gAt(t); return { x: lerp(X[i], X[i + 1], k), c: lerp(Cc[i], Cc[i + 1], k), g, v: g.S > 0.5 ? g.S / (g.beta * g.P) : 0 }; };
  };
  // where a leg's fetlock is and how far its hoof folds, at cycle c. which: 0 LF, 1 RF, 2 LH, 3 RH
  const legTarget = (g, c, which) => {
    const fore = which < 2, s = (((c + g.ph[which]) % 1) + 1) % 1, rest = fore ? 470 : -640;
    let x, lift = 0, flex = 0;
    if (s < g.beta || g.beta >= 0.999) { const u = g.beta >= 0.999 ? 0.5 : s / g.beta; x = rest + g.S / 2 - g.S * u; }
    else {
      const u = (s - g.beta) / (1 - g.beta), e = u * u * (3 - 2 * u);
      x = rest - g.S / 2 + g.S * e; lift = (fore ? g.liftF : g.liftH) * Math.pow(Math.sin(Math.PI * Math.pow(u, fore ? 0.8 : 1)), 0.9); flex = Math.pow(Math.sin(Math.PI * u), 0.75) * clamp(g.S / 380);
    }
    return { x, lift, flex, rest };
  };
  const ik = (T, F, a, b, side) => {
    let d = sub(F, T), dl = len(d); const reach = (a + b) * 0.998;
    if (dl > reach) { F = add(T, nrm(d), reach); d = sub(F, T); dl = reach; }
    dl = Math.max(dl, Math.abs(a - b) + 1);
    const ca = clamp((a * a + dl * dl - b * b) / (2 * a * dl), -1, 1), al = Math.acos(ca) * 180 / Math.PI;
    const K = add(T, rot(nrm(d), side * al), a);
    return { K, F };
  };
  // one leg: tapered upper limb (forearm / gaskin), knee or hock, cannon, fetlock, pastern and hoof
  const drawLeg = (T, K, F, flexA, fore, c1, c2, hoofC, sock, wk) => {
    const d1 = nrm(sub(K, T)), n1 = perp(d1), L1 = len(sub(K, T)), d2 = nrm(sub(F, K)), n2 = perp(d2);
    const wT = fore ? 150 : 215, wK = fore ? 74 : 84, wC = fore ? 52 : 56;
    let g = '';
    // upper: a muscle that swells on the front (fore) or back (hind) and narrows into the joint
    const sw = fore ? 1 : -1;
    const up = `M${pt(add(T, n1, wT / 2))} C${pt(add(add(T, d1, L1 * 0.42), n1, wT * (fore ? 0.5 : 0.6)))} ${pt(add(add(K, d1, -L1 * 0.3), n1, wK * 0.62))} ${pt(add(K, n1, wK / 2))} L${pt(add(K, n1, -wK / 2))} C${pt(add(add(K, d1, -L1 * 0.3), n1, -wK * 0.6))} ${pt(add(add(T, d1, L1 * 0.4), n1, -wT * (fore ? 0.58 : 0.5)))} ${pt(add(T, n1, -wT / 2))}Z`;
    g += `<path d="${up}" fill="${c1}" ${ol()}/>`;
    // lower: the cannon (hard, thin, a tendon line down the back), the joint knob
    const lowCol = c2;
    const L2 = len(sub(F, K));
    const can = `M${pt(add(K, n2, wK * 0.48))} C${pt(add(add(K, d2, L2 * 0.35), n2, wC * 0.5))} ${pt(add(add(F, d2, -L2 * 0.2), n2, wC * 0.48))} ${pt(add(F, n2, wC * 0.55))} L${pt(add(F, n2, -wC * 0.55))} C${pt(add(add(F, d2, -L2 * 0.2), n2, -wC * 0.5))} ${pt(add(add(K, d2, L2 * 0.35), n2, -wC * 0.52))} ${pt(add(K, n2, -wK * 0.48))}Z`;
    g += `<path d="${can}" fill="${lowCol}" ${ol()}/>`;
    // the knee / hock knob (the hock has its point sticking out behind)
    g += `<ellipse cx="${f(K[0])}" cy="${f(K[1])}" rx="${f(wK * 0.5)}" ry="${f(wK * 0.56)}" fill="${fore ? lowCol : mix(c1, lowCol, 0.5)}" ${ol(2, 0.5)}/>`;
    if (!fore) { const hp = add(K, n2, wK * 0.62); g += `<path d="M${pt(add(K, d2, -30))} Q${pt(add(hp, d2, -18))} ${pt(add(hp, d2, 6))} L${pt(add(K, d2, 40))}Z" fill="${mix(c1, lowCol, 0.5)}" ${ol(2.2)}/>`; }
    // tendon shading along the back of the cannon
    const tb = fore ? -1 : 1;
    g += `<path d="M${pt(add(add(K, d2, 30), n2, tb * wC * 0.3))} L${pt(add(add(F, d2, -24), n2, tb * wC * 0.3))}" stroke="#000" stroke-width="7" opacity="0.18" stroke-linecap="round"/>`;
    // fetlock, pastern, hoof (the hoof frame rotates with the fold; flat sole when standing)
    const pv = rot([34, 98], flexA), C = add(F, pv), hd = nrm(pv);
    const sockCol = sock ? '#ece6da' : lowCol;
    g += `<path d="M${pt(add(F, perp(hd), 30))} L${pt(add(C, perp(hd), 25))} L${pt(add(C, perp(hd), -25))} L${pt(add(F, perp(hd), -30))}Z" fill="${sockCol}" ${ol(2.4)}/>`;
    g += `<ellipse cx="${f(F[0])}" cy="${f(F[1])}" rx="32" ry="29" transform="rotate(${f(flexA * 0.5)} ${f(F[0])} ${f(F[1])})" fill="${sockCol}" ${ol(2.4)}/>`;
    const hoof = [[-28, 0], [16, 0], [54, 70], [-36, 70]].map(q => add(C, rot(q, flexA)));
    g += `<path d="M${pt(hoof[0])} L${pt(hoof[1])} L${pt(hoof[2])} Q${pt(add(C, rot([10, 78], flexA)))} ${pt(hoof[3])}Z" fill="${hoofC}" ${ol(2.6)}/>`;
    g += `<path d="M${pt(add(C, rot([-24, 8], flexA)))} L${pt(add(C, rot([14, 8], flexA)))}" stroke="${shade(hoofC, 0.35)}" stroke-width="6" opacity="0.6"/>`;
    g += `<path d="M${pt(add(C, rot([22, 14], flexA)))} L${pt(add(C, rot([44, 60], flexA)))}" stroke="#fff" stroke-width="4" opacity="0.18"/>`;
    return `<g filter="url(#skinS)">${g}</g>`;
  };
  // o: x, y, s, dir (1 faces right), g (gait params), c (cycle), col, mane, low (lower-leg colour), socks [LF,RF,LH,RH],
  // head (deg, + lowers the head), tailUp, tack: { bridle, saddle, harness, plume, collar, blinkers }, eyeLook, ears (deg back),
  // rear (deg, rears up about the hind feet), fall: { rot, dx, dy } (falling: drawn without ground logic), far (darken)
  P.horse = (o) => {
    const g = o.g || GAIT.stand, c = o.c || 0, col = o.col || '#6a3a1e', mane = o.mane || '#1a1210', low = o.low || shade(col, -0.35), hoofC = o.hoof || '#2a2420';
    const id = uid('hs'), dark = o.far ? 0.3 : 0, C1 = shade(col, -dark), C2 = shade(low, -dark), MN = shade(mane, -dark);
    const t = o.t || 0;
    // body motion: bob (down = +y), pitch about the girth, head nod
    const bw = g.bobN * 2 * Math.PI * (c - g.bobPh);
    const bob = g.bob * Math.cos(bw) * 0.5 + (o.crouch || 0);
    const pitch = g.pitch * Math.sin(2 * Math.PI * (c - g.bobPh)) * (g.bobN < 1.5 ? 1 : 0.5) - (o.rear || 0);
    const nod = g.nod * Math.sin(bw + 0.6) + g.hb + (o.head || 0);
    const PIV = [-100, -950];
    const bodyT = p => { const q = rot(sub(p, PIV), pitch); return [q[0] + PIV[0], q[1] + PIV[1] + bob]; };
    const bodyTr = `translate(0,${f(bob)}) rotate(${f(pitch)} ${PIV[0]} ${PIV[1]})`;
    // legs (rearing lifts the fore legs off the ground and tucks them)
    const rearK = clamp((o.rear || 0) / 30);
    const leg = (which) => {
      const fore = which < 2, far = which % 2 === 1, tg = legTarget(g, c, which);
      const T0 = fore ? [430, -800] : [-600, -860];
      const T = bodyT(add(T0, [(tg.x - tg.rest) * 0.33, 0]));
      let Fp = [tg.x - 34, -168 - tg.lift];
      if (fore && rearK > 0) Fp = [lerp(Fp[0], T[0] + 150, rearK), lerp(Fp[1], T[1] + 300, rearK)];
      const { K, F } = ik(T, Fp, fore ? 360 : 430, fore ? 275 : 272, fore ? -1 : 1);
      const flexA = (fore ? 100 : 65) * tg.flex + (fore ? 110 * rearK : 0);
      const fo = far ? [26, -14] : [0, 0];
      const sh = (q) => add(q, fo);
      return drawLeg(sh(T), sh(K), sh(F), flexA, fore, far ? shade(C1, -0.28) : C1, far ? shade(C2, -0.28) : C2, hoofC, (o.socks || [])[which], 0);
    };
    let s = `<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="-1320" x2="0" y2="-640"><stop offset="0" stop-color="${shade(C1, 0.16)}"/><stop offset="0.5" stop-color="${C1}"/><stop offset="1" stop-color="${shade(C1, -0.28)}"/></linearGradient>` +
      `<radialGradient id="${id}h" gradientUnits="userSpaceOnUse" cx="-640" cy="-1120" r="300"><stop offset="0" stop-color="#fff" stop-opacity="0.22"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>` +
      `<radialGradient id="${id}s" gradientUnits="userSpaceOnUse" cx="420" cy="-1040" r="260"><stop offset="0" stop-color="#fff" stop-opacity="0.18"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>` +
      `<linearGradient id="${id}n" gradientUnits="userSpaceOnUse" x1="500" y1="-1700" x2="800" y2="-1300"><stop offset="0" stop-color="${shade(C1, 0.12)}"/><stop offset="1" stop-color="${shade(C1, -0.18)}"/></linearGradient></defs>`;
    // ground shadow (not while falling)
    if (!o.fall && !o.noShadow) s += `<ellipse cx="-80" cy="8" rx="${f(780 - 120 * rearK)}" ry="52" fill="#000" opacity="${f(0.32 - 0.1 * rearK)}" filter="url(#b8)"/>`;
    // far legs
    s += leg(3) + leg(1);
    // ---- tail (behind the near legs): a full hank of hair that arcs out from the dock and falls; streams back at speed
    const tk0 = clamp(g.tail * 0.9 + (o.tailUp || 0)), r0 = lerp(48, 84, tk0), r1 = lerp(6, 62, tk0);
    const dock = [-830, -1250];
    const tailPts = (() => {
      const L = 720, segs = 10, P2 = [];
      let p = dock;
      for (let i = 0; i <= segs; i++) { const u = i / segs, ang = lerp(r0, r1, Math.pow(u, 0.55)) + (5 + 12 * tk0) * Math.sin(t * 2.1 + u * 3.4 + c * 6.28) * u; P2.push([p, ang, u]); p = add(p, rot([0, 1], ang), L / segs); }
      return P2;
    })();
    const tailPath = (wk, off) => {
      const Lp = [], Rp = [];
      for (const [p, ang, u] of tailPts) { const n = perp(rot([0, 1], ang)), w = (u < 0.3 ? lerp(60, 118, u / 0.3) : lerp(118, 26, Math.pow((u - 0.3) / 0.7, 1.2))) * wk; Lp.push(add(add(p, n, w / 2 + off), [0, 0])); Rp.push(add(p, n, -w / 2 + off)); }
      return `M${pt(Lp[0])} ` + Lp.slice(1).map(q => `L${pt(q)}`).join(' ') + ' ' + Rp.reverse().map(q => `L${pt(q)}`).join(' ') + 'Z';
    };
    let tailG = `<path d="${tailPath(1, 0)}" fill="${MN}" ${ol(2.6)}/>`;
    // hair strands along the tail, light on top, dark underneath
    for (let k = 0; k < 6; k++) { const off = (k - 2.5) * 14; tailG += `<path d="M${tailPts.slice(1, -1).map(([p, ang]) => pt(add(p, perp(rot([0, 1], ang)), off))).join(' L')}" stroke="${shade(MN, k < 3 ? 0.3 : -0.3)}" stroke-width="${3 + (k % 2) * 2}" fill="none" opacity="0.4" stroke-linecap="round"/>`; }
    s += `<g transform="${bodyTr}">${tailG}</g>`;
    // near legs (their tops disappear under the body)
    s += leg(2) + leg(0);
    let bodyG = '';
    // ---- the neck bends from its root (a weighted rotation: nothing at the shoulder, all of it at the poll); the head
    // rides rigidly on top. The neck is laid over the shoulder with no outline at its base, so neck and body are one.
    const NB = [400, -1110], NS0 = [420, -1150], NA = nrm([280, -620]);
    const wp = p => { const w = ss(0, 1, ((p[0] - NS0[0]) * NA[0] + (p[1] - NS0[1]) * NA[1]) / 520); return add(rot(sub(p, NB), nod * w), NB); };
    const warp = d => d.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g, (m, a, b) => pt(wp([+a, +b])));
    const neckFill = warp(`M150,-1262 L230,-1290 C330,-1420 520,-1660 660,-1770 C700,-1800 740,-1790 770,-1760 L880,-1530 C840,-1500 800,-1460 770,-1410 C700,-1300 640,-1160 600,-990 C590,-950 566,-900 530,-850 C440,-900 300,-1080 150,-1262Z`);
    let ng = `<path d="${neckFill}" fill="url(#${id})"/>`;
    ng += `<path d="${warp('M226,-1294 C330,-1420 520,-1660 660,-1770 C690,-1792 720,-1792 750,-1776')}" fill="none" ${ol()}/><path d="${warp('M880,-1530 C840,-1500 800,-1460 770,-1410 C700,-1300 640,-1160 600,-990 C592,-956 576,-920 552,-884')}" fill="none" ${ol()}/>`;
    // neck muscle line, the jugular groove, a soft highlight down the crest
    ng += `<path d="${warp('M420,-1270 C520,-1380 610,-1530 690,-1640')}" stroke="#000" stroke-width="10" opacity="0.1" fill="none" stroke-linecap="round"/><path d="${warp('M640,-1180 C690,-1300 730,-1420 790,-1500')}" stroke="#fff" stroke-width="7" opacity="0.1" fill="none" stroke-linecap="round"/><path d="${warp('M300,-1300 C400,-1400 540,-1600 640,-1720')}" stroke="#fff" stroke-width="9" opacity="0.1" fill="none" stroke-linecap="round"/>`;
    let hg = '';
    // far ear first
    hg += `<path d="M676,-1752 C664,-1820 676,-1880 694,-1910 C716,-1872 724,-1810 714,-1760Z" fill="${shade(C1, -0.25)}" ${ol(2.4)} transform="rotate(${f(-(o.ears || 0))} 700 -1760) translate(-26,6)"/>`;
    // the head: forehead, straight nasal bone, soft muzzle, round jowl
    const head = `M700,-1772 C740,-1790 790,-1770 820,-1730 L1060,-1460 C1100,-1420 1128,-1380 1126,-1344 C1124,-1312 1100,-1296 1072,-1300 C1050,-1302 1040,-1290 1020,-1282 C1000,-1276 986,-1290 990,-1306 C930,-1360 870,-1400 830,-1440 C780,-1480 760,-1540 770,-1600 C776,-1650 740,-1700 700,-1772Z`;
    hg += `<path d="${head}" fill="url(#${id})" ${ol()}/>`;
    // the jowl's round edge, the cheekbone ridge, muzzle shading, nostril, mouth line, chin
    hg += `<path d="M778,-1600 C800,-1520 860,-1470 930,-1440" stroke="#000" stroke-width="5" opacity="0.18" fill="none"/><path d="M860,-1640 C930,-1580 990,-1520 1040,-1460" stroke="#fff" stroke-width="5" opacity="0.14" fill="none"/>`;
    hg += `<path d="M1050,-1452 C1092,-1420 1126,-1384 1126,-1344 C1124,-1312 1100,-1296 1072,-1300 C1040,-1330 1020,-1380 1050,-1452Z" fill="#000" opacity="0.18"/>`;
    hg += `<path d="M1082,-1396 C1098,-1404 1110,-1392 1106,-1376 C1100,-1362 1084,-1366 1080,-1378Z" fill="#1a0e08" opacity="0.85"/><path d="M1074,-1404 C1092,-1418 1114,-1404 1112,-1380" stroke="${shade(C1, 0.2)}" stroke-width="4" fill="none" opacity="0.6"/>`;
    hg += `<path d="M1060,-1306 C1040,-1312 1020,-1306 1004,-1300" stroke="${OUTC}" stroke-width="3" fill="none" opacity="0.7"/>`;
    // the eye: dark, glossy, with a lid line and a highlight; o.eyeWhite shows white when panicked
    const ew = o.eyeWhite || 0;
    hg += `<ellipse cx="846" cy="-1652" rx="${f(22 + ew * 4)}" ry="${f(16 + ew * 5)}" fill="${ew > 0.1 ? '#e8e0d4' : '#1a0e08'}" ${ol(2)} transform="rotate(30 846 -1652)"/>${ew > 0.1 ? `<circle cx="850" cy="-1650" r="13" fill="#1a0e08"/>` : ''}<circle cx="840" cy="-1658" r="5" fill="#fff" opacity="0.85"/><path d="M820,-1672 C838,-1684 862,-1676 872,-1660" stroke="${OUTC}" stroke-width="3.5" fill="none"/>`;
    // forelock and near ear
    hg += `<path d="M704,-1768 C740,-1740 770,-1700 776,-1650 C760,-1680 740,-1700 724,-1706 C730,-1690 732,-1670 726,-1650 C712,-1690 700,-1730 704,-1768Z" fill="${MN}" ${ol(2)}/>`;
    hg += `<path d="M676,-1752 C664,-1820 676,-1880 694,-1910 C716,-1872 724,-1810 714,-1760Z" fill="${C1}" ${ol(2.4)} transform="rotate(${f(-(o.ears || 0))} 700 -1760)"/><path d="M684,-1770 C680,-1820 688,-1860 694,-1880" stroke="#000" stroke-width="7" opacity="0.25" fill="none" transform="rotate(${f(-(o.ears || 0))} 700 -1760)"/>`;
    // the mane: locks falling down the near side of the neck from the crest, lifting in the wind at speed
    const crest = u => { const a = [230, -1290], b = [330, -1420], c2 = [520, -1660], d = [690, -1775], m = 1 - u; return [m * m * m * a[0] + 3 * m * m * u * b[0] + 3 * m * u * u * c2[0] + u * u * u * d[0], m * m * m * a[1] + 3 * m * m * u * b[1] + 3 * m * u * u * c2[1] + u * u * u * d[1]]; };
    const rm = rng(o.seed || 5);
    let mn = '';
    const lift = 0.2 + 0.8 * g.tail, NM = 18, top = [], bot = [];
    for (let i = 0; i <= NM; i++) {
      const u = 0.03 + i * (0.95 / NM), p0 = wp(crest(u)), ang = 162 - 52 * lift + 9 * Math.sin(t * 3.1 + i * 0.7 + c * 6.28) * lift + (rm() - 0.5) * 10;
      top.push(p0); bot.push(add(p0, rot([0, -1], -ang), (i % 2 ? 140 : 200) * (0.7 + 0.3 * Math.sin(u * 3.1))));
    }
    let md = `M${pt(top[0])} ` + top.slice(1).map(q => `L${pt(q)}`).join(' ');
    for (let i = NM; i > 0; i--) { const a = bot[i], b = bot[i - 1], notch = L2m(L2m(a, b), L2m(top[i], top[i - 1])); md += ` L${pt(a)} Q${pt(L2m(a, notch))} ${pt(L2m(L2m(a, b), notch))}`; }
    md += ` L${pt(bot[0])}Z`;
    mn += `<path d="${md}" fill="${MN}" ${ol(2, 0.75)}/>`;
    for (let i = 1; i < NM; i += 2) mn += `<path d="M${pt(top[i])} Q${pt(add(L2m(top[i], bot[i]), perp(nrm(sub(bot[i], top[i]))), 8))} ${pt(bot[i])}" stroke="${shade(MN, 0.3)}" stroke-width="4" fill="none" opacity="0.35"/>`;
    ng += mn;
    // ---- tack on the head: bridle (headstall, browband, noseband, bit ring), blinkers, a plume
    const tk = o.tack || {};
    if (tk.bridle) {
      const lc = tk.leather || '#2a1a0e', mt = tk.metal || '#c9a040';
      hg += `<path d="M712,-1756 C760,-1640 800,-1520 830,-1440 C860,-1400 950,-1340 1018,-1320" stroke="${lc}" stroke-width="18" fill="none"/>`;
      hg += `<path d="M720,-1734 C760,-1730 800,-1716 828,-1700" stroke="${lc}" stroke-width="16" fill="none"/><path d="M720,-1734 C760,-1730 800,-1716 828,-1700" stroke="${mt}" stroke-width="5" fill="none" stroke-dasharray="12 10"/>`;
      hg += `<path d="M960,-1520 C990,-1440 1000,-1400 1004,-1340" stroke="${lc}" stroke-width="16" fill="none"/><path d="M968,-1516 L1066,-1430" stroke="${lc}" stroke-width="16"/>`;
      hg += `<circle cx="1018" cy="-1318" r="20" fill="none" stroke="${mt}" stroke-width="7"/>`;
      if (tk.blinkers) hg += `<path d="M792,-1700 L842,-1716 C850,-1690 846,-1640 836,-1616 L790,-1630Z" fill="#141010" ${ol(2)}/><path d="M800,-1694 L836,-1706" stroke="${mt}" stroke-width="5"/>`;
      if (tk.plume) { const pc = tk.plume; for (let i = 0; i < 5; i++) { const a = -20 + i * 9 - 25 * g.tail + 5 * Math.sin(t * 4 + i); hg += `<path d="M708,-1770 Q${pt(add([708, -1770], rot([0, -1], a + 20), 160))} ${pt(add([708, -1770], rot([0, -1], a), 300))}" stroke="${shade(pc, (i % 2) * 0.15)}" stroke-width="${f(34 - i * 3)}" fill="none" stroke-linecap="round" opacity="0.95"/>`; } hg += `<rect x="690" y="-1790" width="36" height="30" rx="6" fill="${mt}" ${ol(2)}/>`; }
    }
    if (tk.collar) {
      // the draught collar round the neck root: padded leather with gilded hames
      const hm = wp([440, -1352]);
      ng += `<path d="${warp('M420,-1340 C470,-1300 520,-1150 520,-1000 L470,-930 C470,-1070 430,-1230 380,-1300Z')}" fill="#2a1a10" ${ol(2.6)}/><path d="${warp('M430,-1330 C480,-1290 512,-1160 508,-1010')}" stroke="${tk.metal || '#c9a040'}" stroke-width="12" fill="none"/><circle cx="${f(hm[0])}" cy="${f(hm[1])}" r="16" fill="${tk.metal || '#c9a040'}" ${ol(2)}/>`;
    }
    const headTr = `rotate(${f(nod)} ${NB[0]} ${NB[1]})`;
    // ---- the barrel of the body: withers, back, croup, round haunch, tucked belly, deep chest
    // withers, a level back, the point of hip and a sloping croup, the point of buttock, a tucked flank, a deep girth
    const body = `M300,-1312 C170,-1264 -20,-1238 -170,-1242 C-320,-1246 -460,-1300 -600,-1310 C-700,-1316 -790,-1280 -830,-1210 C-866,-1140 -868,-1040 -830,-950 C-800,-886 -730,-838 -650,-812 C-590,-794 -520,-800 -470,-786 C-400,-760 -250,-718 -60,-700 C120,-684 270,-680 380,-704 C440,-722 488,-764 526,-812 C562,-864 580,-930 570,-992 C558,-1070 490,-1172 420,-1240 C380,-1280 340,-1304 300,-1312Z`;
    bodyG += `<path d="${body}" fill="url(#${id})" ${ol()}/>`;
    bodyG += `<path d="${body}" fill="url(#${id}h)"/><path d="${body}" fill="url(#${id}s)"/>`;
    // muscle anatomy: the shoulder blade, the triceps over the elbow, ribs, the flank fold, the haunch and its groove
    bodyG += `<path d="M330,-1262 C390,-1140 440,-990 470,-850" stroke="#000" stroke-width="10" opacity="0.12" fill="none" stroke-linecap="round"/><path d="M300,-1250 C350,-1140 400,-1010 430,-880" stroke="#fff" stroke-width="6" opacity="0.1" fill="none" stroke-linecap="round"/>`;
    bodyG += `<path d="M548,-880 C520,-830 470,-790 400,-770 C330,-756 300,-790 290,-840" stroke="#000" stroke-width="7" opacity="0.12" fill="none"/>`;
    for (let i = 0; i < 4; i++) bodyG += `<path d="M${130 - i * 72},${-1020 + i * 4} C${108 - i * 72},-920 ${112 - i * 72},-820 ${132 - i * 74},-724" stroke="#000" stroke-width="5" opacity="0.055" fill="none"/>`;
    bodyG += `<path d="M-430,-772 C-490,-860 -530,-960 -556,-1060" stroke="#000" stroke-width="8" opacity="0.12" fill="none" stroke-linecap="round"/>`;
    bodyG += `<path d="M-560,-1268 C-680,-1210 -748,-1080 -724,-900" stroke="#000" stroke-width="11" opacity="0.13" fill="none" stroke-linecap="round"/><path d="M-640,-1286 C-740,-1250 -800,-1160 -812,-1060" stroke="#fff" stroke-width="7" opacity="0.15" fill="none" stroke-linecap="round"/>`;
    bodyG += `<path d="M-600,-1290 C-600,-1240 -620,-1200 -650,-1170" stroke="#000" stroke-width="6" opacity="0.1" fill="none"/>`;
    bodyG += `<path d="M262,-1280 C120,-1244 -40,-1220 -170,-1224 C-330,-1228 -460,-1280 -590,-1292" stroke="#fff" stroke-width="8" opacity="0.13" fill="none" stroke-linecap="round"/>`;
    bodyG += ng + `<g transform="${headTr}">${hg}</g>`;
    // ---- tack on the body
    if (tk.saddle) {
      const sc = tk.saddle, mt = tk.metal || '#a8a8a0';
      bodyG += `<path d="M-330,-1230 C-300,-1060 -140,-980 40,-990 C140,-1000 190,-1080 180,-1240 Z" fill="${tk.cloth || '#3a3026'}" ${ol(2.4)}/>`;
      bodyG += `<path d="M-250,-1236 C-240,-1300 -200,-1316 -170,-1300 C-120,-1262 20,-1262 80,-1290 C110,-1320 140,-1310 150,-1270 C140,-1220 60,-1200 -40,-1200 C-140,-1200 -230,-1210 -250,-1236Z" fill="${sc}" ${ol(2.6)}/>`;
      bodyG += `<path d="M-170,-1220 C-170,-1100 -110,-1040 -30,-1040 C40,-1040 80,-1100 80,-1210" fill="${shade(sc, -0.12)}" ${ol(2.2)}/>`;
      bodyG += `<path d="M-20,-1050 L-30,-700" stroke="${shade(sc, -0.3)}" stroke-width="22"/><path d="M-20,-1050 L-30,-700" stroke="${mt}" stroke-width="5" stroke-dasharray="4 26"/>`;
      if (!tk.noStirrup) bodyG += `<path d="M-40,-1200 L-60,-830" stroke="${shade(sc, -0.25)}" stroke-width="14"/><path d="M-110,-830 C-110,-760 -10,-760 -10,-830 Z" fill="none" stroke="${mt}" stroke-width="10"/>`;
    }
    if (tk.harness) {
      const hc = tk.leather || '#1e1410', mt = tk.metal || '#c9a040';
      // saddle pad with terrets, the girth, the breeching round the haunch, the trace along the side
      bodyG += `<path d="M-60,-1236 C-50,-1290 120,-1300 140,-1250 L120,-1120 C40,-1100 -40,-1110 -60,-1236Z" fill="${hc}" ${ol(2.4)}/><circle cx="0" cy="-1290" r="16" fill="none" stroke="${mt}" stroke-width="7"/><circle cx="90" cy="-1296" r="16" fill="none" stroke="${mt}" stroke-width="7"/>`;
      bodyG += `<path d="M30,-1120 L36,-694" stroke="${hc}" stroke-width="20"/>`;
      bodyG += `<path d="M-850,-1030 C-760,-960 -580,-940 -420,-960" stroke="${hc}" stroke-width="16" fill="none"/><path d="M-690,-1300 C-730,-1210 -790,-1100 -850,-1030" stroke="${hc}" stroke-width="13" fill="none"/>`;
      bodyG += `<path d="M520,-960 C300,-960 0,-950 -420,-960" stroke="${hc}" stroke-width="16" fill="none"/>${[300, 0, -300].map(x => `<rect x="${x - 10}" y="-962" width="20" height="12" fill="${mt}"/>`).join('')}`;
      bodyG += `<path d="M-690,-1300 C-500,-1270 -300,-1250 -60,-1250" stroke="${hc}" stroke-width="11" fill="none"/>`;
    }
    if (tk.blanket) bodyG += `<path d="M-520,-1250 C-500,-1000 -420,-860 -340,-820 L300,-820 C340,-900 360,-1100 330,-1290 C150,-1250 -60,-1215 -200,-1220 C-320,-1224 -420,-1250 -520,-1250Z" fill="${tk.blanket}" ${ol(2.4)} opacity="0.96"/><path d="M-340,-820 L300,-820" stroke="${tk.metal || '#c9a040'}" stroke-width="12" stroke-dasharray="16 8"/>`;
    s += `<g transform="${bodyTr}">${bodyG}</g>`;
    // world placement
    const dir = o.dir || 1;
    let tr = `translate(${f(o.x || 0)},${f(o.y || 0)}) scale(${f((o.s || 1) * dir)},${f(o.s || 1)})`;
    if (o.rear) tr += ` rotate(${f(-o.rear * 0.6)} -640 0)`;
    if (o.fall) tr += ` translate(${f(o.fall.dx || 0)},${f(o.fall.dy || 0)}) rotate(${f(o.fall.rot || 0)} -100 -900)`;
    // anchor points (local) for riders, reins, traces
    const P0 = { saddle: bodyT([-60, -1250]), withers: bodyT([300, -1300]), hands: bodyT([260, -1330]), bit: add(rot(sub([1018, -1318], NB), nod), NB).map((v, i) => i ? v + bob : v), collar: bodyT([500, -1000]), knee: bodyT([90, -1020]), stirrup: bodyT([-60, -800]), rump: bodyT([-700, -1290]) };
    return { svg: `<g transform="${tr}">${s}</g>`, pts: P0, bob, pitch, nod, tr };
  };
  const L2m = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  // horse-local point -> world, for a placed horse { x, y, s, dir }
  P.hW = (h, p) => [h.x + p[0] * h.s * (h.dir || 1), h.y + p[1] * h.s];

  // ======================================================= the rider's near leg (side view, in horse-local units)
  // from the hip on the saddle, the thigh runs forward-down along the flank to the knee, the shin back to the stirrup.
  // o.legs trouser colour, o.boot, o.spur (0..1 kicks the heel back into the flank), o.hem tunic hem colour (drapes over the thigh)
  P.riderLeg = (o) => {
    const hip = o.hip || [-80, -1250], kick = o.spur || 0, legs = o.legs || '#2e2a26', boot = o.boot || '#1e1610';
    const knee = add([80, -1060], [-10 * kick, -20 * kick]), ankle = add([-10, -850], [-90 * kick, -60 * kick]);
    const d1 = nrm(sub(knee, hip)), n1 = perp(d1), d2 = nrm(sub(ankle, knee)), n2 = perp(d2);
    let g = `<path d="M${pt(add(hip, n1, 80))} C${pt(add(add(hip, d1, 120), n1, 90))} ${pt(add(knee, n1, 66))} ${pt(add(knee, d1, 40))} L${pt(add(knee, n2, -52))} C${pt(add(add(knee, d1, -60), n1, -66))} ${pt(add(add(hip, d1, 80), n1, -76))} ${pt(add(hip, n1, -74))}Z" fill="${legs}" ${ol(2.6)}/>`;
    g += `<path d="M${pt(add(knee, n2, 56))} C${pt(add(add(knee, d2, 100), n2, 58))} ${pt(add(ankle, n2, 46))} ${pt(add(ankle, n2, 42))} L${pt(add(ankle, n2, -38))} C${pt(add(add(knee, d2, 140), n2, -50))} ${pt(add(knee, n2, -50))} ${pt(add(knee, n2, -50))}Z" fill="${legs}" ${ol(2.6)}/>`;
    // the riding boot to mid-shin, the foot in the stirrup (toe forward)
    const b0 = add(knee, d2, len(sub(ankle, knee)) * 0.4);
    g += `<path d="M${pt(add(b0, n2, 54))} L${pt(add(ankle, n2, 46))} C${pt(add(add(ankle, d2, 60), n2, 50))} ${pt(add(ankle, [150, 70]))} ${pt(add(ankle, [170, 96]))} L${pt(add(ankle, [-60, 100]))} C${pt(add(ankle, [-70, 60]))} ${pt(add(ankle, n2, -44))} ${pt(add(ankle, n2, -42))} L${pt(add(b0, n2, -50))}Z" fill="${boot}" ${ol(2.6)}/>`;
    g += `<path d="M${pt(add(b0, n2, 54))} L${pt(add(b0, n2, -50))}" stroke="${shade(boot, 0.25)}" stroke-width="12"/>`;
    if (o.spurs !== false) g += `<path d="M${pt(add(ankle, [-60, 60]))} l-40,-6" stroke="#a8a8a0" stroke-width="6" stroke-linecap="round"/><circle cx="${f(ankle[0] - 104)}" cy="${f(ankle[1] + 54)}" r="10" fill="none" stroke="#a8a8a0" stroke-width="4"/>`;
    // the tunic hem draped over the top of the thigh
    if (o.hem) g += `<path d="M${pt(add(hip, [-120, -40]))} C${pt(add(hip, [-60, 120]))} ${pt(add(hip, [120, 170]))} ${pt(add(hip, [220, 120]))} L${pt(add(hip, [170, -60]))}Z" fill="${o.hem}" ${ol(2.4)}/>`;
    return `<g filter="url(#skinS)">${g}</g>`;
  };
})(window);
