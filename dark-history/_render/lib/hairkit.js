// Hair kit for rig3 heads (the detailing pass of 2026-11-08: "their clothes and hairs look uneven ... not detailed and
// clean", then "hairs still look very off and cutted at some points ... not matching"). Hair is built the way painted
// hair is, in layers - never one flat blob with a few scratched lines:
//   - the mass, shaded by ONE gradient per head (lighter on the crown, darker toward the nape) shared by every piece -
//     front, back and plait - so their tones meet without a seam;
//   - wide tapered locks that follow the flow from the parting, in alternating tones, with only faint lines between;
//   - a sheen band across the crown, stronger on the key-light side;
//   - a soft hairline: a thin line a shade darker than the hair where it meets the skin, no ink, a faint brow shadow.
// No hair ends in a straight cut: a woman's hair rounds over the ear and goes back behind it, sideburns taper to a
// rounded end, a bald man's fringe thins out at both ends, a parting is a soft groove.
// Drawn on the base head (rig3 FACE[kind]) and carried onto the character's morphed head with the rig's own face map
// (faceP), like its beards. Use with the rig's hairStyle 'bald'. Each style returns { back, front }: draw them INSIDE
// the figure's light pass (back + P.svg + front through one C.lit, e.g. the cast's litHair), so the hair takes the same
// key, rim and face light as the head (drawn outside it, it reads as a cut-out laid on top).
//   HK.centrePart({ kind: 'woman', fx, col, id, light: 1, braid: 1 | -1 | 0, ribbon })
//   HK.sidePart({ kind: 'man', fx, col, id, light: 1, part: 28 })
//   HK.baldFringe({ kind: 'man', fx, col, id, light: 1 })
(function (G) {
  const { shade, faceP } = G.RIG;
  const HK = {};
  const f = v => Math.round(v * 10) / 10;
  const Q = p => `${f(p[0])},${f(p[1])}`;
  const OUTL = 'stroke="#20140c" stroke-width="2" stroke-linejoin="round"';
  // base head point -> the character's morphed head
  const mapper = (kind, fx) => { const P = faceP(kind, fx || {}); return p => [P.MX(p[0], p[1]), P.MY(p[1])]; };
  // cmds: [['M', p], ['C', p1, p2, p3], ['Q', p1, p2], ['L', p]] in base points
  const path = (m, cmds) => cmds.map(([c, ...ps]) => c + ps.map(p => Q(m(p))).join(' ')).join(' ');
  const nr = (a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [-dy / l, dx / l]; };
  const off = (p, n, w) => [p[0] + n[0] * w / 2, p[1] + n[1] * w / 2];
  // a tapered lock along the quadratic p0 -> c -> p1: w0 wide at p0, w1 at p1
  const lock = (m, p0, c, p1, w0, w1) => {
    const n0 = nr(p0, c), n1 = nr(c, p1), nc = nr(p0, p1), wc = (w0 + w1) / 2;
    return path(m, [['M', off(p0, n0, w0)], ['Q', off(c, nc, wc), off(p1, n1, w1)], ['L', off(p1, n1, -w1)], ['Q', off(c, nc, -wc), off(p0, n0, -w0)]]) + 'Z';
  };
  const curve = (m, p0, c, p1, dn = 0) => { const n = nr(p0, p1); return path(m, [['M', off(p0, n, dn)], ['Q', off(c, n, dn), off(p1, n, dn)]]); };
  // one gradient per head, top of the crown to the nape (userSpaceOnUse, head-local after mapping)
  const grad = (id, col, y0, y1) => `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="${f(y0)}" x2="0" y2="${f(y1)}"><stop offset="0" stop-color="${shade(col, 0.2)}"/><stop offset="0.38" stop-color="${col}"/><stop offset="1" stop-color="${shade(col, -0.3)}"/></linearGradient>`;
  // locks over a mass: wide fills in alternating tones; only faint lines between them
  const lockSet = (m, col, L, op = 0.42) => {
    let g = '';
    L.forEach(([p0, c, p1, w0, w1], i) => { g += `<path d="${lock(m, p0, c, p1, w0, w1)}" fill="${shade(col, i % 2 ? 0.14 : -0.16)}" opacity="${op}"/>`; });
    L.forEach(([p0, c, p1, w0], i) => { g += `<path d="${curve(m, p0, c, p1, -w0 * 0.9)}" stroke="${shade(col, -0.45)}" stroke-width="1" fill="none" opacity="0.22" stroke-linecap="round"/>`; if (i % 2) g += `<path d="${curve(m, p0, c, p1, w0 * 0.4)}" stroke="${shade(col, 0.45)}" stroke-width="1" fill="none" opacity="0.2" stroke-linecap="round"/>`; });
    return g;
  };

  // ======================================================= women: a centre parting, over the ears and back, a night plait
  HK.centrePart = (o = {}) => {
    const m = mapper(o.kind || 'woman', o.fx), col = o.col || '#4a2814', id = o.id || 'hkc', lt = o.light || 1, fx = o.fx || {};
    const G0 = m([0, -152])[1], G1 = m([0, 150])[1];
    // the cap: smooth over the crown, down over each ear (covered whole, as the 1840s wore it: a lobe peeping out under
    // the hair read as a stray sliver), where it rounds under and turns back behind it
    const side = s => [['C', [s * 98, -108], [s * 97, -40], [s * 87, 14]], ['C', [s * 85, 30], [s * 79, 39], [s * 70, 37]]];
    const outerD = [['M', [-70, 37]], ['C', [-79, 39], [-85, 30], [-87, 14]], ['C', [-97, -40], [-98, -108], [-62, -132]], ['C', [-34, -152], [34, -152], [62, -132]], ...side(1)];
    const hlD = [['M', [70, 37]], ['C', [70, 14], [69, -14], [67, -28]], ['C', [64, -52], [58, -64], [50, -74]], ['C', [34, -94], [12, -100], [0, -96]], ['C', [-12, -100], [-34, -94], [-50, -74]], ['C', [-58, -64], [-64, -52], [-67, -28]], ['C', [-69, -14], [-70, 14], [-70, 37]]];
    const cap = path(m, outerD) + ' L' + path(m, hlD).slice(1) + 'Z';
    let front = `<defs>${grad(id + 'g', col, G0, G1)}<clipPath id="${id}c"><path d="${cap}"/></clipPath></defs>`;
    front += `<path d="${path(m, hlD)}" stroke="#3a1c0c" stroke-width="10" fill="none" opacity="0.14" filter="url(#b4)" transform="translate(0,5)"/>`;
    front += `<path d="${cap}" fill="url(#${id}g)"/>`;
    // five wide locks a side from the parting: the upper over the crown to the back, the lower along the hairline and
    // round over the ear
    let lk = '';
    for (const s of [-1, 1]) {
      const L = [];
      for (let i = 0; i < 5; i++) { const t = i / 4; L.push([[s * 2, -146 + 48 * t], [s * (48 + 14 * t), -156 + 80 * t], [s * (94 - 16 * t), -104 + 124 * t], 24, 8]); }
      lk += lockSet(m, col, L);
    }
    for (const s of [-1, 1]) lk += `<path d="${path(m, [['M', [s * 8, -140]], ['Q', [s * 40, -144], [s * 72, -112]]])}" stroke="${shade(col, 0.55)}" stroke-width="13" fill="none" opacity="${s === lt ? 0.28 : 0.14}" filter="url(#b4)" stroke-linecap="round"/>`;
    for (let i = 0; i < 3; i++) lk += `<path d="${path(m, [['M', [lt * (18 + 14 * i), -141 + 4 * i]], ['Q', [lt * (32 + 15 * i), -139 + 6 * i], [lt * (46 + 16 * i), -131 + 10 * i]]])}" stroke="${shade(col, 0.7)}" stroke-width="1.3" fill="none" opacity="0.45" stroke-linecap="round"/>`;
    // the parting: a soft groove where the locks divide (shading, not a drawn line)
    lk += `<path d="${path(m, [['M', [0, -98]], ['L', [0, -148]]])}" stroke="${shade(col, -0.45)}" stroke-width="4" opacity="0.35" filter="url(#b1)"/>`;
    front += `<g clip-path="url(#${id}c)">${lk}</g>`;
    front += `<path d="${path(m, outerD)}" fill="none" ${OUTL}/><path d="${path(m, hlD)}" stroke="${shade(col, -0.35)}" stroke-width="1.3" fill="none" opacity="0.8"/>`;
    // behind the head, in the same gradient: the hair taken back from behind each ear toward the nape; on the plait's
    // side it runs down behind the jaw to where the plait comes round the neck
    let back = '';
    for (const s of [-1, 1]) {
      const big = s === (o.braid || 0);
      const d = big ? [['M', [s * 66, -24]], ['C', [s * 98, -10], [s * 106, 40], [s * 96, 96]], ['C', [s * 90, 116], [s * 76, 126], [s * 58, 124]], ['L', [s * 50, 104]], ['C', [s * 70, 88], [s * 74, 40], [s * 58, -6]]]
        : [['M', [s * 66, -20]], ['C', [s * 94, -8], [s * 98, 24], [s * 88, 56]], ['C', [s * 84, 66], [s * 78, 70], [s * 72, 68]], ['C', [s * 76, 40], [s * 72, 12], [s * 58, -4]]];
      back += `<path d="${path(m, d)}Z" fill="url(#${id}g)" ${OUTL}/><path d="${path(m, [['M', [s * 72, -6]], ['C', [s * 90, 8], [s * 96, 40], [s * 88, big ? 90 : 52]]])}" stroke="${shade(col, 0.35)}" stroke-width="1.2" fill="none" opacity="0.3"/>`;
    }
    // the plait: round the side of the neck, over the shoulder, down the front; thick at the top, tapering. A solid
    // core, then pointed three-strand lenses leaning in turn, overlapping closely; tied with a ribbon over a little tuft.
    // (Head-local, scaled with the head's width only - it lies on the body.) Its tones come from the same gradient
    // (the core) plus light and dark lenses, so it matches the hair it grows from.
    if (o.braid) {
      const s = o.braid, W0 = fx.w ?? 1, B = p => [p[0] * W0, p[1]];
      const pts = [[s * 50, 112], [s * 72, 150], [s * 92, 206], [s * 102, 270], [s * 104, 330]];
      const seg = [0]; for (let i = 1; i < pts.length; i++) seg.push(seg[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
      const at = t => { const d = t * seg[seg.length - 1]; let k = 0; while (k < seg.length - 2 && seg[k + 1] < d) k++; const u = (d - seg[k]) / (seg[k + 1] - seg[k]); return [pts[k][0] + (pts[k + 1][0] - pts[k][0]) * u, pts[k][1] + (pts[k + 1][1] - pts[k][1]) * u]; };
      const wid = t => 30 - 13 * t;
      let core = '', coreB = '';
      for (let i = 0; i <= 16; i++) { const t = i / 16, p = B(at(t)), q = B(at(Math.min(1, t + 0.01))), a = Math.atan2(q[1] - p[1], q[0] - p[0]), n = [-Math.sin(a), Math.cos(a)], w = wid(t) * 0.42; core += (i ? ' L' : 'M') + Q([p[0] + n[0] * w, p[1] + n[1] * w]); coreB = ' L' + Q([p[0] - n[0] * w, p[1] - n[1] * w]) + coreB; }
      let br = `<path d="${core}${coreB}Z" fill="${shade(col, -0.3)}" ${OUTL}/>`;
      const N = 22;
      for (let i = 0; i < N; i++) {
        const t = i / (N - 1), p = B(at(t)), q = B(at(Math.min(1, t + 0.01))), a = Math.atan2(q[1] - p[1], q[0] - p[0]) * 180 / Math.PI, w = wid(t), hl = w * 0.5, hw = w * 0.27, lean = (i % 2 ? 1 : -1) * 38;
        const lens = `M0,${f(-hl)} Q${f(hw * 1.9)},0 0,${f(hl)} Q${f(-hw * 1.9)},0 0,${f(-hl)}Z`;
        br += `<g transform="translate(${f(p[0])},${f(p[1])}) rotate(${f(a - 90 + lean)})"><path d="${lens}" fill="${shade(col, (i % 2 ? 0.06 : -0.1) - 0.12 * t)}" stroke="${shade(col, -0.55)}" stroke-width="1.1"/><path d="M${f(hw * 0.5)},${f(-hl * 0.6)} Q${f(hw * 0.95)},0 ${f(hw * 0.5)},${f(hl * 0.6)}" stroke="${shade(col, 0.5)}" stroke-width="1.2" fill="none" opacity="${(i % 2 ? 1 : -1) * lt > 0 ? 0.45 : 0.22}"/></g>`;
      }
      const e = B(at(1)), rb = o.ribbon || '#b88a7e';
      br += [-8, -4, 0, 4, 8].map((dx, k) => `<path d="M${Q([e[0] + dx * 0.4, e[1] - 2])} q${f(dx * 0.5)},${12 + k % 2 * 4} ${f(dx * 0.9)},${24 + (k % 3) * 4}" stroke="${shade(col, k % 2 ? 0 : -0.3)}" stroke-width="${3 - Math.abs(dx) * 0.14}" fill="none" stroke-linecap="round"/>`).join('');
      br += [-1, 1].map(k => `<path d="M${Q(e)} q${f(k * 14)},-9 ${f(k * 16)},4 q${f(-k * 4)},9 ${f(-k * 16)},-4Z" fill="${rb}" stroke="${shade(rb, -0.5)}" stroke-width="1.1"/><path d="M${Q([e[0] + k * 4, e[1] - 2])} q${f(k * 6)},-4 ${f(k * 10)},-3" stroke="${shade(rb, 0.5)}" stroke-width="1.1" fill="none" opacity="0.7"/>`).join('') + `<circle cx="${f(e[0])}" cy="${f(e[1])}" r="4" fill="${shade(rb, -0.15)}" stroke="${shade(rb, -0.5)}" stroke-width="1"/>`;
      front += br;
    }
    return { back: `<defs>${grad(id + 'g', col, G0, G1)}</defs>` + back, front };
  };

  // ======================================================= men: a side parting, swept across the crown, sideburns
  // o.crown (default 1): below 1 lowers the crown's volume (everything above the temples is drawn closer to them), for a
  // long face whose full cap reads as a tall dome
  HK.sidePart = (o = {}) => {
    const m0 = mapper(o.kind || 'man', o.fx), cr = o.crown ?? 1, m = cr === 1 ? m0 : p => m0([p[0], p[1] < -40 ? -40 + (p[1] + 40) * cr : p[1]]), col = o.col || '#5e4026', id = o.id || 'hks', lt = o.light || 1, pt = o.part ?? 28;
    // the cap, its sideburns ending in a rounded taper (never a straight cut)
    const outerD = [['M', [-70, 30]], ['C', [-74, 34], [-80, 30], [-80, 20]], ['C', [-84, -6], [-88, -24], [-90, -46]], ['C', [-95, -90], [-88, -122], [-62, -138]], ['C', [-32, -156], [30, -158], [60, -140]], ['C', [84, -126], [96, -96], [90, -46]], ['C', [88, -24], [84, -6], [80, 20]], ['C', [80, 30], [74, 34], [70, 30]]];
    const hlD = [['M', [70, 30]], ['C', [68, 26], [67, 10], [67, -4]], ['C', [67, -30], [67, -40], [66, -52]], ['C', [58, -74], [42, -84], [24, -86]], ['C', [6, -88], [-20, -96], [-44, -88]], ['C', [-58, -82], [-66, -62], [-66, -34]], ['C', [-67, -12], [-67, 10], [-68, 26]], ['C', [-68, 28], [-69, 30], [-70, 30]]];
    const cap = path(m, outerD) + ' L' + path(m, hlD).slice(1) + 'Z';
    const G0 = m([0, -158])[1], G1 = m([0, 34])[1];
    let front = `<defs>${grad(id + 'g', col, G0, G1)}<clipPath id="${id}c"><path d="${cap}"/></clipPath></defs>`;
    front += `<path d="${path(m, hlD)}" stroke="#3a1c0c" stroke-width="10" fill="none" opacity="0.14" filter="url(#b4)" transform="translate(0,5)"/>`;
    front += `<path d="${cap}" fill="url(#${id}g)"/>`;
    // the long side: from the parting over the crown and across the forehead in a wave, down to the far temple
    const L1 = []; for (let i = 0; i < 6; i++) { const t = i / 5; L1.push([[pt + 1 - 3 * t, -146 + 50 * t], [-12 - 18 * t, -166 + 68 * t], [-90 + 6 * t, -98 + 72 * t], 22, 7]); }
    // the short side: from the parting down to the near temple
    const L2 = []; for (let i = 0; i < 3; i++) { const t = i / 2; L2.push([[pt + 3, -146 + 44 * t], [pt + 36, -148 + 40 * t], [91 - 2 * t, -100 + 70 * t], 20, 7]); }
    let lk = lockSet(m, col, L1) + lockSet(m, col, L2);
    // the wave's rolled front edge catches the light; the sheen across the crown
    lk += `<path d="${path(m, [['M', [pt - 2, -104]], ['C', [0, -110], [-40, -106], [-80, -46]]])}" stroke="${shade(col, 0.5)}" stroke-width="3" fill="none" opacity="0.3" stroke-linecap="round"/>`;
    lk += `<path d="${path(m, [['M', [-46, -142]], ['Q', [8, -166], [64, -138]]])}" stroke="${shade(col, 0.55)}" stroke-width="13" fill="none" opacity="0.24" filter="url(#b4)" stroke-linecap="round"/>`;
    // the parting: a soft groove (shading, not a drawn line)
    lk += `<path d="${path(m, [['M', [pt + 1, -148]], ['Q', [pt - 1, -124], [pt - 3, -100]]])}" stroke="${shade(col, -0.45)}" stroke-width="4" fill="none" opacity="0.32" filter="url(#b1)"/>`;
    // the sideburns: fine strands down to the rounded end
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) lk += `<path d="${path(m, [['M', [s * (70 + i * 4), -30 + i * 2]], ['Q', [s * (71 + i * 4), 6], [s * (72 + i * 2), 28]]])}" stroke="${shade(col, i % 2 ? 0.3 : -0.35)}" stroke-width="1" fill="none" opacity="0.4"/>`;
    front += `<g clip-path="url(#${id}c)">${lk}</g>`;
    front += `<path d="${path(m, outerD)}" fill="none" ${OUTL}/><path d="${path(m, hlD)}" stroke="${shade(col, -0.35)}" stroke-width="1.3" fill="none" opacity="0.8"/>`;
    return { back: '', front };
  };

  // ======================================================= an old man: bald crown, soft fringe over the sides and back
  HK.baldFringe = (o = {}) => {
    const m = mapper(o.kind || 'man', o.fx), col = o.col || '#b8b2a8', id = o.id || 'hkb', lt = o.light || 1;
    const G0 = m([0, -110])[1], G1 = m([0, 80])[1];
    // behind the head: the fringe round the back, from the temple past the ear to the nape, thinning to nothing at
    // both ends (no hard start or stop)
    let back = `<defs>${grad(id + 'g', col, G0, G1)}</defs>`;
    for (const s of [-1, 1]) {
      const d = [['M', [s * 52, -112]], ['C', [s * 74, -110], [s * 89, -88], [s * 91, -54]], ['C', [s * 93, -16], [s * 91, 18], [s * 86, 42]], ['C', [s * 83, 56], [s * 76, 66], [s * 64, 72]], ['C', [s * 70, 50], [s * 74, 20], [s * 74, -10]], ['C', [s * 74, -48], [s * 68, -88], [s * 52, -112]]];
      back += `<path d="${path(m, d)}Z" fill="url(#${id}g)" stroke="${shade(col, -0.55)}" stroke-width="1.3" stroke-linejoin="round"/>`;
      for (let i = 0; i < 3; i++) back += `<path d="${path(m, [['M', [s * (60 + i * 6), -104 + i * 8]], ['C', [s * (80 + i * 2), -84 + i * 4], [s * (86 + i), -30], [s * (78 + i * 2), 46 - i * 6]]])}" stroke="${shade(col, i % 2 ? 0.3 : -0.3)}" stroke-width="1.1" fill="none" opacity="0.45"/>`;
    }
    // over the head: the hair on each side of the head above the ear, overlapping the skull's edge and thinning
    // upward into the bald crown; ending in a soft rounded tuft just above the ear (it never covers the ear)
    let front = `<defs>${grad(id + 'f', col, G0, G1)}</defs>`;
    for (const s of [-1, 1]) {
      const d = [['M', [s * 60, -96]], ['C', [s * 76, -92], [s * 88, -70], [s * 90, -44]], ['C', [s * 91, -32], [s * 89, -24], [s * 84, -21]], ['C', [s * 79, -20], [s * 76, -26], [s * 75, -34]], ['C', [s * 73, -56], [s * 69, -78], [s * 60, -96]]];
      front += `<path d="${path(m, d)}Z" fill="url(#${id}f)"/><path d="${path(m, [['M', [s * 90, -44]], ['C', [s * 91, -32], [s * 89, -24], [s * 84, -21]], ['C', [s * 79, -20], [s * 76, -26], [s * 75, -34]]])}" fill="none" stroke="${shade(col, -0.55)}" stroke-width="1.2"/>`;
      for (let i = 0; i < 3; i++) front += `<path d="${path(m, [['M', [s * (66 + i * 5), -88 + i * 4]], ['Q', [s * (78 + i * 3), -70], [s * (80 + i * 3), -30 + i * 2]]])}" stroke="${shade(col, i % 2 ? 0.35 : -0.25)}" stroke-width="1.1" fill="none" opacity="0.5"/>`;
      front += `<path d="${path(m, [['M', [s * 70, -86]], ['C', [s * 82, -74], [s * 87, -56], [s * 87, -40]]])}" stroke="${shade(col, 0.5)}" stroke-width="2.2" fill="none" opacity="${s === lt ? 0.45 : 0.18}" stroke-linecap="round"/>`;
    }
    return { back, front };
  };

  G.HAIRKIT = HK;
})(window);
