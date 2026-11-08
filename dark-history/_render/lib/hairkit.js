// Hair kit for rig3 heads (the detailing pass of 2026-11-08: "their clothes and hairs look uneven ... not detailed and
// clean"). Hair is built the way painted hair is, in layers - never one flat blob with a few scratched lines:
//   - the mass, shaded top to bottom (lighter on the crown, darker at the roots and underneath), inked on its outer
//     edge only;
//   - locks: tapered filled ribbons that follow the flow from the parting, evenly spaced, in alternating tones, each
//     with a fine dark parting line and a lit edge;
//   - a sheen band across the crown, stronger on the key-light side, with a few crisp highlights in it;
//   - a soft hairline: a thin line a shade darker than the hair where it meets the skin (no heavy ink), short strands
//     breaking it, a faint shadow on the brow under it;
//   - a few fly-away hairs past the silhouette.
// Drawn on the base head (rig3 FACE[kind]) and carried onto the character's morphed head with the rig's own face map
// (faceP), like its beards. Use with the rig's hairStyle 'bald'. Each style returns { back, front } for the cast's
// headArt / withArt (back: behind the body and head; front: over the face).
//   HK.centrePart({ kind: 'woman', fx, col, id, light: 1, braid: 1 | -1 | 0, ribbon })  (1840s women: sleek, the
//     ears covered, the hair gathered behind into a night plait over one shoulder)
//   HK.sidePart({ kind: 'man', fx, col, id, light: 1, part: 28 })                       (1840s men: a side parting,
//     the hair swept across the crown in a wave, trimmed sideburns)
//   HK.baldFringe({ kind: 'man', fx, col, id, light: 1 })                               (an old man: a bald crown,
//     soft white hair round the sides and back, wisps over the temples, short side-whiskers)
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
  const grad = (id, col, y0, y1) => `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="${f(y0)}" x2="0" y2="${f(y1)}"><stop offset="0" stop-color="${shade(col, 0.22)}"/><stop offset="0.5" stop-color="${col}"/><stop offset="1" stop-color="${shade(col, -0.32)}"/></linearGradient>`;
  // locks over a mass: fills in alternating tones, then the fine dark line between locks and a lit edge on each
  const lockSet = (m, col, L, op = 0.5) => {
    let g = '';
    L.forEach(([p0, c, p1, w0, w1], i) => { g += `<path d="${lock(m, p0, c, p1, w0, w1)}" fill="${shade(col, i % 2 ? 0.16 : -0.2)}" opacity="${op}"/>`; });
    L.forEach(([p0, c, p1, w0], i) => { g += `<path d="${curve(m, p0, c, p1, -w0 * 0.9)}" stroke="${shade(col, -0.5)}" stroke-width="1.1" fill="none" opacity="0.38" stroke-linecap="round"/><path d="${curve(m, p0, c, p1, w0 * 0.5)}" stroke="${shade(col, 0.45)}" stroke-width="1" fill="none" opacity="${i % 2 ? 0.4 : 0.22}" stroke-linecap="round"/>`; });
    return g;
  };
  // short strands across a hairline (pts: base points on it; d: the way the hair runs there)
  const hairlineStrands = (m, col, pts) => pts.map(([p, d]) => `<path d="${path(m, [['M', [p[0] - d[0] * 4, p[1] - d[1] * 4]], ['L', [p[0] + d[0] * 6, p[1] + d[1] * 6]]])}" stroke="${shade(col, -0.05)}" stroke-width="1" opacity="0.6" stroke-linecap="round"/>`).join('');

  // ======================================================= women: a centre parting, smooth over the ears, a night plait
  HK.centrePart = (o = {}) => {
    const m = mapper(o.kind || 'woman', o.fx), col = o.col || '#4a2814', id = o.id || 'hkc', lt = o.light || 1, fx = o.fx || {};
    const outer = [['M', [-80, 14]], ['C', [-94, -36], [-96, -108], [-62, -132]], ['C', [-34, -152], [34, -152], [62, -132]], ['C', [96, -108], [94, -36], [80, 14]]];
    const inner = [['L', [70, 12]], ['C', [68, -26], [62, -56], [50, -74]], ['C', [34, -94], [12, -100], [0, -96]], ['C', [-12, -100], [-34, -94], [-50, -74]], ['C', [-62, -56], [-68, -26], [-70, 12]]];
    const cap = path(m, outer) + ' ' + path(m, inner) + 'Z';
    const hl = path(m, [['M', [70, 12]], ['C', [68, -26], [62, -56], [50, -74]], ['C', [34, -94], [12, -100], [0, -96]], ['C', [-12, -100], [-34, -94], [-50, -74]], ['C', [-62, -56], [-68, -26], [-70, 12]]]);
    const y0 = m([0, -152])[1], y1 = m([0, 14])[1];
    let front = `<defs>${grad(id + 'g', col, y0, y1)}<clipPath id="${id}c"><path d="${cap}"/></clipPath></defs>`;
    // a faint shadow on the brow under the hairline
    front += `<path d="${hl}" stroke="#3a1c0c" stroke-width="10" fill="none" opacity="0.14" filter="url(#b4)" transform="translate(0,5)"/>`;
    front += `<path d="${cap}" fill="url(#${id}g)"/>`;
    // the locks: from the parting outward and down - the upper ones over the crown to the back, the lower ones along
    // the hairline down over the tops of the ears
    let lk = '';
    for (const s of [-1, 1]) {
      const L = [];
      for (let i = 0; i < 7; i++) { const t = i / 6; L.push([[s * 2, -148 + 50 * t], [s * (46 + 16 * t), -158 + 80 * t], [s * (92 - 14 * t), -108 + 116 * t], 17, 5]); }
      lk += lockSet(m, col, L);
    }
    // the sheen across the crown either side of the parting, stronger toward the light
    for (const s of [-1, 1]) lk += `<path d="${path(m, [['M', [s * 8, -140]], ['Q', [s * 40, -144], [s * 72, -112]]])}" stroke="${shade(col, 0.55)}" stroke-width="13" fill="none" opacity="${s === lt ? 0.3 : 0.16}" filter="url(#b4)" stroke-linecap="round"/>`;
    for (let i = 0; i < 4; i++) { const t = i / 3; lk += `<path d="${path(m, [['M', [lt * (16 + 14 * t), -142 + 4 * t]], ['Q', [lt * (30 + 16 * t), -140 + 6 * t], [lt * (44 + 18 * t), -132 + 10 * t]]])}" stroke="${shade(col, 0.75)}" stroke-width="1.4" fill="none" opacity="0.55" stroke-linecap="round"/>`; }
    front += `<g clip-path="url(#${id}c)">${lk}</g>`;
    // the parting: a fine dark line with the scalp just showing in it
    front += `<path d="${path(m, [['M', [0, -97]], ['L', [0, -150]]])}" stroke="${shade(col, -0.55)}" stroke-width="2" opacity="0.8"/><path d="${path(m, [['M', [0, -100]], ['L', [0, -146]]])}" stroke="#d8b49a" stroke-width="0.9" opacity="0.4"/>`;
    // ink on the outer edge only; where the hair meets the skin a thin line a shade darker than the hair, no ink (stray
    // strands and fly-aways read as scratches at this scale, so there are none)
    front += `<path d="${path(m, outer)}" fill="none" ${OUTL}/><path d="${hl}" stroke="${shade(col, -0.35)}" stroke-width="1.3" fill="none" opacity="0.8"/>`;
    // behind the head: the hair taken back behind the ears; on the plait's side it runs down behind the jaw to where
    // the plait comes round the neck
    let back = `<defs>${grad(id + 'b', col, m([0, -40])[1], m([0, 120])[1])}</defs>`;
    for (const s of [-1, 1]) {
      const big = s === (o.braid || 0);
      const d = big ? [['M', [s * 62, -20]], ['C', [s * 96, -6], [s * 106, 40], [s * 96, 96]], ['C', [s * 90, 116], [s * 76, 126], [s * 58, 124]], ['L', [s * 50, 104]], ['C', [s * 70, 88], [s * 74, 40], [s * 56, -2]]]
        : [['M', [s * 64, -14]], ['C', [s * 88, -6], [s * 94, 18], [s * 88, 40]], ['L', [s * 72, 40]], ['C', [s * 74, 22], [s * 70, 6], [s * 58, 0]]];
      back += `<path d="${path(m, d)}Z" fill="url(#${id}b)" ${OUTL}/><path d="${path(m, [['M', [s * 70, -8]], ['C', [s * 90, 6], [s * 96, 40], [s * 88, big ? 90 : 34]]])}" stroke="${shade(col, 0.35)}" stroke-width="1.2" fill="none" opacity="0.4"/>`;
    }
    // the plait: it comes round the side of the neck, over the shoulder and down the front, thick at the top and
    // tapering. A solid core, then three-strand lobes - pointed lenses leaning left and right in turn, overlapping
    // closely - each lit on the light side; tied with a ribbon, a little tuft below. (Head-local, scaled with the head's
    // width only: it lies on the body.)
    if (o.braid) {
      const s = o.braid, W0 = fx.w ?? 1, B = p => [p[0] * W0, p[1]];
      const pts = [[s * 50, 112], [s * 72, 150], [s * 92, 206], [s * 102, 270], [s * 104, 330]];
      const seg = [0]; for (let i = 1; i < pts.length; i++) seg.push(seg[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
      const at = t => { const d = t * seg[seg.length - 1]; let k = 0; while (k < seg.length - 2 && seg[k + 1] < d) k++; const u = (d - seg[k]) / (seg[k + 1] - seg[k]); return [pts[k][0] + (pts[k + 1][0] - pts[k][0]) * u, pts[k][1] + (pts[k + 1][1] - pts[k][1]) * u]; };
      const wid = t => 30 - 13 * t;
      // the core: a tapered band along the plait in the hair's darkest tone, so no gap ever shows between lobes
      let core = '', coreB = '';
      for (let i = 0; i <= 16; i++) { const t = i / 16, p = B(at(t)), q = B(at(Math.min(1, t + 0.01))), a = Math.atan2(q[1] - p[1], q[0] - p[0]), n = [-Math.sin(a), Math.cos(a)], w = wid(t) * 0.42; core += (i ? ' L' : 'M') + Q([p[0] + n[0] * w, p[1] + n[1] * w]); coreB = ' L' + Q([p[0] - n[0] * w, p[1] - n[1] * w]) + coreB; }
      let br = `<path d="${core}${coreB}Z" fill="${shade(col, -0.35)}" ${OUTL}/>`;
      const N = 22;
      for (let i = 0; i < N; i++) {
        const t = i / (N - 1), p = B(at(t)), q = B(at(Math.min(1, t + 0.01))), a = Math.atan2(q[1] - p[1], q[0] - p[0]) * 180 / Math.PI, w = wid(t), hl = w * 0.5, hw = w * 0.27, lean = (i % 2 ? 1 : -1) * 38;
        const lens = `M0,${f(-hl)} Q${f(hw * 1.9)},0 0,${f(hl)} Q${f(-hw * 1.9)},0 0,${f(-hl)}Z`;
        br += `<g transform="translate(${f(p[0])},${f(p[1])}) rotate(${f(a - 90 + lean)})"><path d="${lens}" fill="${shade(col, i % 2 ? 0.1 : -0.06)}" stroke="${shade(col, -0.55)}" stroke-width="1.1"/><path d="M${f(hw * 0.5)},${f(-hl * 0.6)} Q${f(hw * 0.95)},0 ${f(hw * 0.5)},${f(hl * 0.6)}" stroke="${shade(col, 0.55)}" stroke-width="1.3" fill="none" opacity="${(i % 2 ? 1 : -1) * lt > 0 ? 0.55 : 0.3}"/></g>`;
      }
      const e = B(at(1)), rb = o.ribbon || '#b88a7e';
      br += [-8, -4, 0, 4, 8].map((dx, k) => `<path d="M${Q([e[0] + dx * 0.4, e[1] - 2])} q${f(dx * 0.5)},${12 + k % 2 * 4} ${f(dx * 0.9)},${24 + (k % 3) * 4}" stroke="${shade(col, k % 2 ? 0.15 : -0.2)}" stroke-width="${3 - Math.abs(dx) * 0.14}" fill="none" stroke-linecap="round"/>`).join('');
      br += [-1, 1].map(k => `<path d="M${Q(e)} q${f(k * 14)},-9 ${f(k * 16)},4 q${f(-k * 4)},9 ${f(-k * 16)},-4Z" fill="${rb}" stroke="${shade(rb, -0.5)}" stroke-width="1.1"/><path d="M${Q([e[0] + k * 4, e[1] - 2])} q${f(k * 6)},-4 ${f(k * 10)},-3" stroke="${shade(rb, 0.5)}" stroke-width="1.1" fill="none" opacity="0.7"/>`).join('') + `<circle cx="${f(e[0])}" cy="${f(e[1])}" r="4" fill="${shade(rb, -0.15)}" stroke="${shade(rb, -0.5)}" stroke-width="1"/>`;
      front += br;
    }
    return { back, front };
  };

  // ======================================================= men: a side parting, swept across the crown, sideburns
  HK.sidePart = (o = {}) => {
    const m = mapper(o.kind || 'man', o.fx), col = o.col || '#5e4026', id = o.id || 'hks', lt = o.light || 1, pt = o.part ?? 28;
    const outer = [['M', [-80, 22]], ['C', [-84, -6], [-88, -24], [-90, -46]], ['C', [-95, -90], [-88, -122], [-62, -138]], ['C', [-32, -156], [30, -158], [60, -140]], ['C', [84, -126], [96, -96], [90, -46]], ['C', [88, -24], [84, -6], [80, 22]]];
    const hlD = [['M', [68, 22]], ['C', [67, -4], [67, -30], [66, -52]], ['C', [58, -74], [42, -84], [24, -86]], ['C', [6, -88], [-20, -96], [-44, -88]], ['C', [-58, -82], [-66, -62], [-66, -34]], ['C', [-66, -12], [-67, 6], [-68, 22]]];
    const cap = path(m, outer) + ' L' + path(m, hlD).slice(1) + 'Z';
    const y0 = m([0, -158])[1], y1 = m([0, 22])[1];
    let front = `<defs>${grad(id + 'g', col, y0, y1)}<clipPath id="${id}c"><path d="${cap}"/></clipPath></defs>`;
    front += `<path d="${path(m, hlD)}" stroke="#3a1c0c" stroke-width="10" fill="none" opacity="0.14" filter="url(#b4)" transform="translate(0,5)"/>`;
    front += `<path d="${cap}" fill="url(#${id}g)"/>`;
    // the long side: from the parting over the crown and across the forehead in a wave, down to the far temple
    const L1 = []; for (let i = 0; i < 8; i++) { const t = i / 7; L1.push([[pt + 1 - 3 * t, -146 + 50 * t], [-12 - 18 * t, -166 + 68 * t], [-90 + 6 * t, -98 + 72 * t], 17, 5]); }
    // the short side: from the parting down to the near temple
    const L2 = []; for (let i = 0; i < 4; i++) { const t = i / 3; L2.push([[pt + 3, -146 + 44 * t], [pt + 36, -148 + 40 * t], [91 - 2 * t, -100 + 70 * t], 15, 5]); }
    let lk = lockSet(m, col, L1) + lockSet(m, col, L2);
    // the wave's rolled front edge catches the light; the sheen across the crown
    lk += `<path d="${path(m, [['M', [pt - 2, -104]], ['C', [0, -110], [-40, -106], [-80, -46]]])}" stroke="${shade(col, 0.5)}" stroke-width="3" fill="none" opacity="0.35" stroke-linecap="round"/>`;
    lk += `<path d="${path(m, [['M', [-46, -142]], ['Q', [8, -166], [64, -138]]])}" stroke="${shade(col, 0.55)}" stroke-width="13" fill="none" opacity="0.26" filter="url(#b4)" stroke-linecap="round"/>`;
    for (let i = 0; i < 4; i++) lk += `<path d="${path(m, [['M', [lt * (10 + 12 * i) - 10, -150 + i * 2]], ['Q', [lt * (20 + 12 * i) - 10, -154 + i * 2], [lt * (30 + 12 * i) - 10, -150 + i * 3]]])}" stroke="${shade(col, 0.75)}" stroke-width="1.4" fill="none" opacity="0.5" stroke-linecap="round"/>`;
    // the sideburns: fine vertical strands, a darker root line along the face
    for (const s of [-1, 1]) for (let i = 0; i < 4; i++) lk += `<path d="${path(m, [['M', [s * (69 + i * 3.5), -30 + i * 2]], ['L', [s * (69 + i * 3.5), 18]]])}" stroke="${shade(col, i % 2 ? 0.3 : -0.4)}" stroke-width="1.1" opacity="0.5"/>`;
    front += `<g clip-path="url(#${id}c)">${lk}</g>`;
    front += `<path d="${path(m, [['M', [pt + 1, -148]], ['Q', [pt - 1, -124], [pt - 3, -100]]])}" stroke="${shade(col, -0.55)}" stroke-width="2" fill="none" opacity="0.8"/><path d="${path(m, [['M', [pt + 2, -144]], ['Q', [pt, -124], [pt - 2, -104]]])}" stroke="#d8b49a" stroke-width="0.9" fill="none" opacity="0.4"/>`;
    front += `<path d="${path(m, outer)}" fill="none" ${OUTL}/><path d="${path(m, hlD)}" stroke="${shade(col, -0.35)}" stroke-width="1.3" fill="none" opacity="0.8"/>`;
    // short strands soften the bottom of each sideburn (no stray hairs elsewhere: they read as scratches)
    const hp = []; for (const s of [-1, 1]) for (let i = 0; i < 3; i++) hp.push([[s * (70 + i * 4), 21], [0, 1]]);
    front += hairlineStrands(m, col, hp);
    return { back: '', front };
  };

  // ======================================================= an old man: bald crown, soft white fringe, side-whiskers
  HK.baldFringe = (o = {}) => {
    const m = mapper(o.kind || 'man', o.fx), col = o.col || '#d0cac0', id = o.id || 'hkb', lt = o.light || 1;
    let back = `<defs>${grad(id + 'g', col, m([0, -110])[1], m([0, 70])[1])}</defs>`;
    for (const s of [-1, 1]) {
      // the fringe hugs the skull closely from the temple, past the ear, to the nape; combed strands run along it, with
      // a soft lit edge (no curls: they stuck out like hooks)
      const d = [['M', [s * 58, -104]], ['C', [s * 76, -104], [s * 88, -84], [s * 90, -52]], ['C', [s * 92, -16], [s * 90, 18], [s * 86, 40]], ['C', [s * 82, 54], [s * 76, 60], [s * 70, 62]], ['L', [s * 62, 50]], ['C', [s * 70, 30], [s * 74, 0], [s * 74, -30]], ['C', [s * 72, -62], [s * 66, -88], [s * 58, -104]]];
      back += `<path d="${path(m, d)}Z" fill="url(#${id}g)" stroke="${shade(col, -0.55)}" stroke-width="1.3" stroke-linejoin="round"/>`;
      for (let i = 0; i < 4; i++) back += `<path d="${path(m, [['M', [s * (64 + i * 5), -100 + i * 6]], ['C', [s * (80 + i * 2), -84 + i * 4], [s * (86 + i), -30], [s * (80 + i * 2), 40 - i * 4]]])}" stroke="${shade(col, i % 2 ? 0.3 : -0.3)}" stroke-width="1.2" fill="none" opacity="0.55"/>`;
      back += `<path d="${path(m, [['M', [s * 70, -96]], ['C', [s * 84, -84], [s * 89, -50], [s * 88, -10]]])}" stroke="${shade(col, 0.5)}" stroke-width="2.4" fill="none" opacity="${s === lt ? 0.5 : 0.2}" stroke-linecap="round"/>`;
    }
    // over the face only two faint wisps from the fringe over each temple (side-whiskers drawn on the cheek read as
    // striped blocks pasted on, so there are none)
    let front = '';
    for (const s of [-1, 1]) for (let i = 0; i < 2; i++) front += `<path d="${path(m, [['M', [s * (80 - i * 2), -66 - i * 8]], ['Q', [s * (75 - i * 3), -86 - i * 8], [s * (64 - i * 4), -96 - i * 6]]])}" stroke="${shade(col, 0.1)}" stroke-width="${1.3 - i * 0.3}" fill="none" opacity="${0.5 - i * 0.15}" stroke-linecap="round"/>`;
    return { back, front };
  };

  G.HAIRKIT = HK;
})(window);
