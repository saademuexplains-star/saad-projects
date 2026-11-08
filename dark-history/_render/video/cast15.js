// Cast for "The Cells That Never Died" (Baltimore 1951, and a lab today). All new faces: you (Henrietta, thirty, red
// nails), your five children and your husband; the clinic doctor, the surgeon and the operating nurse (masked), the ward
// doctor and nurse, the young lab assistant; the school nurse and the children in the polio line; the scientists of
// today. Period dress is drawn as costume overlays and head art (curls, puffs, caps, masks, a fedora, glasses).
(function (G) {
  const { person, mix, shade, faceP } = G.RIG, K0 = G.CAST;
  const Q = {};
  const face = (base, p) => Object.assign({}, base, p.face || {}, p.blink ? { lid: Math.max((p.face && p.face.lid) ?? base.lid ?? 0.2, p.blink) } : {});
  const mk = (base, faceBase) => p => person(Object.assign({}, base, p, { fx: Object.assign({}, base.fx, p.fx || {}), face: face(faceBase, p) }));
  Q.blink = K0.blink; Q.talk = K0.talk; Q.breath = K0.breath;
  const OUTL = 'stroke="#20140c" stroke-width="2" stroke-linejoin="round"';

  // draw head-local art on a person exactly as the rig places its head (person transform, then the head's own)
  Q.headArt = (P, o, svg) => {
    const s = o.s || 1, b = o.breath || 0, sx = Math.round(s * (1 - b * 0.0015) * 1e5) / 1e5, sy = Math.round(s * (1 + b * 0.004) * 1e5) / 1e5, hsc = o.headScale ?? 1;
    return `<g transform="translate(${o.x || 0},${o.y || 0}) rotate(${o.sway || 0}) scale(${sx},${sy})"><g transform="translate(0,${P.D.headY + (1 - hsc) * 110}) rotate(${o.tilt || 0}) scale(${hsc})">${svg}</g></g>`;
  };
  Q.withArt = (P, o, art, body) => (art && art.back ? Q.headArt(P, o, art.back) : '') + body + (art && art.front ? Q.headArt(P, o, art.front) : '');

  // ======================================================= head art (head-local: face centre 0,0, hair top about -134)
  const hairGrad = (id, col) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(col, 0.2)}"/><stop offset="1" stop-color="${shade(col, -0.2)}"/></linearGradient>`;
  // one rolled curl: a soft ball with a spiral catching the light
  const curl = (x, y, r, col) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${shade(col, 0.04)}" ${OUTL}/><path d="M${x - r * 0.5},${y + r * 0.1} C${x - r * 0.5},${y - r * 0.6} ${x + r * 0.55},${y - r * 0.6} ${x + r * 0.5},${y + r * 0.05} C${x + r * 0.42},${y + r * 0.45} ${x - r * 0.1},${y + r * 0.45} ${x - r * 0.08},${y + r * 0.08}" stroke="${shade(col, 0.42)}" stroke-width="2.4" fill="none" opacity="0.7"/>`;
  // Henrietta's hair, 1951: pressed and set, full over the crown, a front roll swept back from a side parting, rolled
  // curls at the sides and the nape (the hairline sits low enough to cover the rig's scalp)
  const CURLS50 = (col, id) => {
    let g = `<defs>${hairGrad(id, col)}</defs><path d="M-100,24 C-118,-50 -110,-146 -50,-172 C-6,-190 56,-184 92,-150 C118,-114 116,-40 100,24 L84,18 C84,-24 78,-54 62,-74 C34,-96 -8,-92 -34,-84 C-60,-74 -78,-44 -84,18Z" fill="url(#${id})" ${OUTL}/>`;
    for (let i = 0; i < 4; i++) g += `<path d="M${-70 + i * 10},${-140 + i * 6} C${-30 + i * 6},${-162 + i * 8} ${30 - i * 4},${-160 + i * 8} ${72 - i * 6},${-136 + i * 6}" stroke="${shade(col, i % 2 ? 0.38 : -0.35)}" stroke-width="2.4" fill="none" opacity="0.55"/>`;
    g += `<path d="M-74,-66 C-60,-118 20,-140 72,-104 C82,-96 84,-84 78,-70 C42,-102 -20,-102 -62,-58Z" fill="${shade(col, 0.12)}" ${OUTL}/><path d="M-58,-80 C-30,-114 30,-120 66,-94" stroke="${shade(col, 0.48)}" stroke-width="3" fill="none" opacity="0.5"/>`;
    for (const [x, y, r] of [[-98, -34, 20], [-96, 2, 18], [-82, 28, 15], [98, -34, 20], [96, 2, 18], [82, 28, 15]]) g += curl(x, y, r, col);
    g += `<path d="M-30,-88 L-42,-152" stroke="${shade(col, -0.45)}" stroke-width="2" opacity="0.5"/><path d="M-40,-164 C-10,-178 30,-176 58,-160" stroke="#fff" stroke-width="5" opacity="0.12" fill="none"/>`;
    return g;
  };
  // a boy's close crop: a rounded cap of tight coils with a clean hairline (k widens it for a child's round head)
  const SHORTCROP = (col, id, k = 1, seed = 7) => {
    const r = G.RIG.rng(seed);
    let g = `<defs>${hairGrad(id, col)}</defs><path d="M${-88 * k},-6 C${-98 * k},-80 ${-80 * k},-152 0,-160 C${80 * k},-152 ${98 * k},-80 ${88 * k},-6 L${74 * k},-12 C${74 * k},-44 ${64 * k},-64 ${50 * k},-72 C${20 * k},-78 ${-20 * k},-78 ${-50 * k},-72 C${-64 * k},-64 ${-74 * k},-44 ${-74 * k},-12Z" fill="url(#${id})" ${OUTL}/>`;
    for (let i = 0; i < 70; i++) { const a = Math.PI * (1.08 + r() * 0.84), rr = 0.62 + r() * 0.34, x = Math.cos(a) * 86 * k * rr, y = -76 + Math.sin(a) * 82 * rr; g += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(2 + r() * 2.4).toFixed(1)}" fill="${shade(col, 0.32)}" opacity="0.32"/>`; }
    return g;
  };
  // a girl's two puffs tied high with ribbons, and a centre parting
  const PUFFS = (col, rib, id, k = 1) => {
    let g = `<defs>${hairGrad(id, col)}</defs><path d="M-84,0 C-96,-60 -88,-128 -40,-150 C-10,-162 10,-162 40,-150 C88,-128 96,-60 84,0 L70,-2 C68,-40 56,-64 30,-72 C14,-76 -14,-76 -30,-72 C-56,-64 -68,-40 -70,-2Z" fill="url(#${id})" ${OUTL}/>`;
    for (const s of [-1, 1]) {
      const cx = s * 92 * k, cy = -120;
      g += `<circle cx="${cx}" cy="${cy}" r="${42 * k}" fill="url(#${id})" ${OUTL}/>`;
      for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; g += `<circle cx="${(cx + Math.cos(a) * 26 * k).toFixed(1)}" cy="${(cy + Math.sin(a) * 26 * k).toFixed(1)}" r="${(9 * k).toFixed(1)}" fill="none" stroke="${shade(col, 0.35)}" stroke-width="1.6" opacity="0.5"/>`; }
      g += `<path d="M${cx - s * 30 * k},${cy + 24 * k} l${s * -16},14 l4,-24Z M${cx - s * 30 * k},${cy + 24 * k} l${s * 14},16 l4,-22Z" fill="${rib}" ${OUTL}/>`;
    }
    g += `<path d="M0,-98 L0,-158" stroke="${shade(col, -0.45)}" stroke-width="2" opacity="0.6"/>`;
    return g;
  };
  // a toddler's single top puff with a bow
  const TOPPUFF = (col, rib, id) => `<defs>${hairGrad(id, col)}</defs><path d="M-76,-10 C-86,-70 -66,-126 0,-134 C66,-126 86,-70 76,-10 L62,-14 C58,-50 40,-68 0,-72 C-40,-68 -58,-50 -62,-14Z" fill="url(#${id})" ${OUTL}/>` +
    `<circle cx="0" cy="-150" r="34" fill="url(#${id})" ${OUTL}/><path d="M0,-122 l-30,-14 l2,28Z M0,-122 l30,-14 l-2,28Z" fill="${rib}" ${OUTL}/><circle cx="0" cy="-122" r="7" fill="${shade(rib, -0.25)}"/>`;
  // a 1950s ponytail (back) with a smooth swept front and a band (front)
  const PONY = (col, id) => ({
    back: `<defs>${hairGrad(id, col)}</defs><path d="M30,-150 C110,-150 128,-60 104,40 C96,80 86,120 70,150 C80,96 82,40 70,-20 C60,-80 44,-120 30,-150Z" fill="url(#${id})" ${OUTL}/>`,
    front: `<path d="M-90,8 C-104,-60 -92,-140 -40,-162 C0,-176 50,-170 84,-140 C104,-110 104,-40 92,8 L78,6 C78,-40 66,-80 40,-94 C12,-106 -24,-104 -50,-88 C-70,-70 -76,-30 -76,8Z" fill="url(#${id})" ${OUTL}/>` +
      `<path d="M-56,-104 C-20,-130 40,-132 76,-104" stroke="${shade(col, 0.4)}" stroke-width="3" fill="none" opacity="0.5"/><path d="M60,-146 C80,-140 96,-126 104,-110" stroke="#7a2a34" stroke-width="10" fill="none" stroke-linecap="round"/>`
  });
  // a modern bun (back) and a tidy front
  const BUN = (col, id) => ({
    back: `<defs>${hairGrad(id, col)}</defs><ellipse cx="0" cy="-162" rx="48" ry="38" fill="url(#${id})" ${OUTL}/><path d="M-30,-170 C-10,-186 20,-184 34,-166" stroke="${shade(col, 0.35)}" stroke-width="2.5" fill="none" opacity="0.6"/>`,
    front: `<path d="M-88,6 C-100,-60 -90,-138 -36,-160 C4,-174 50,-166 82,-138 C102,-106 100,-40 88,6 L74,4 C72,-40 62,-78 34,-92 C8,-102 -26,-100 -50,-84 C-68,-66 -74,-30 -74,4Z" fill="url(#${id})" ${OUTL}/><path d="M-8,-96 C10,-120 40,-130 64,-118" stroke="${shade(col, 0.35)}" stroke-width="2.5" fill="none" opacity="0.5"/>`
  });
  // a nurse's white cap pinned on dark hair
  const NURSECAP = (hair, id) => `<defs>${hairGrad(id, hair)}</defs><path d="M-86,6 C-98,-60 -88,-136 -36,-156 C4,-168 48,-162 80,-136 C100,-104 98,-40 86,6 L72,4 C70,-40 60,-76 34,-90 C8,-100 -26,-98 -50,-82 C-66,-64 -72,-30 -72,4Z" fill="url(#${id})" ${OUTL}/>` +
    `<path d="M-78,-128 C-60,-176 60,-176 78,-128 L64,-112 C40,-140 -40,-140 -64,-112Z" fill="#fbfaf6" ${OUTL}/><path d="M-70,-124 C-40,-150 40,-150 70,-124" stroke="#d8d4cc" stroke-width="3" fill="none"/><path d="M-20,-152 l40,0" stroke="#2a3a6a" stroke-width="5"/>`;
  // operating-room cap and mask (cap = front over the hair; mask over nose and mouth with ties)
  const ORMASK = (kind, fx, cap = '#c4d6c0') => {
    const P = faceP(kind, fx), y0 = P.ey + 26;
    return `<path d="M-94,-40 C-104,-120 -60,-176 0,-178 C60,-176 104,-120 94,-40 C70,-70 40,-82 0,-84 C-40,-82 -70,-70 -94,-40Z" fill="${cap}" ${OUTL}/>` +
      [-60, -20, 20, 60].map(x => `<path d="M${x},-170 C${x * 0.9},-130 ${x * 0.85},-100 ${x * 0.8},-82" stroke="${shade(cap, -0.2)}" stroke-width="2" fill="none" opacity="0.5"/>`).join('') +
      `<path d="M-74,${y0.toFixed(0)} C-40,${(y0 - 10).toFixed(0)} 40,${(y0 - 10).toFixed(0)} 74,${y0.toFixed(0)} L70,100 C40,132 -40,132 -70,100Z" fill="#eef2ea" ${OUTL}/>` +
      [0.3, 0.55, 0.8].map(k => `<path d="M-68,${(y0 + (100 - y0) * k).toFixed(0)} C-30,${(y0 + (100 - y0) * k + 8).toFixed(0)} 30,${(y0 + (100 - y0) * k + 8).toFixed(0)} 68,${(y0 + (100 - y0) * k).toFixed(0)}" stroke="#c8ccc2" stroke-width="2" fill="none"/>`).join('') +
      `<path d="M-74,${(y0 + 4).toFixed(0)} L-100,${(y0 - 20).toFixed(0)} M-70,96 L-98,110 M74,${(y0 + 4).toFixed(0)} L100,${(y0 - 20).toFixed(0)} M70,96 L98,110" stroke="#dcdfd6" stroke-width="5" stroke-linecap="round"/>`;
  };
  // glasses: heavy 1950s frames (c = frame colour, sq = squarer lenses)
  const GLASSES = (kind, fx, c = '#2a1e18', sq = 0) => {
    const P = faceP(kind, fx), r = P.rx * 1.42, y = P.ey + 2;
    let g = '';
    for (const s of [-1, 1]) g += `<rect x="${(s * P.ex - r).toFixed(1)}" y="${(y - r * 0.82).toFixed(1)}" width="${(r * 2).toFixed(1)}" height="${(r * 1.64).toFixed(1)}" rx="${(r * (0.9 - sq * 0.55)).toFixed(1)}" fill="#e6eef2" fill-opacity="0.12" stroke="${c}" stroke-width="5"/>` +
      `<path d="M${(s * P.ex - r * 0.5).toFixed(1)},${(y - r * 0.4).toFixed(1)} l${(r * 0.45).toFixed(1)},${(-r * 0.2).toFixed(1)}" stroke="#fff" stroke-width="2.4" opacity="0.6"/>`;
    g += `<path d="M${(-P.ex + r).toFixed(1)},${(y - 4).toFixed(1)} Q0,${(y - 12).toFixed(1)} ${(P.ex - r).toFixed(1)},${(y - 4).toFixed(1)}" stroke="${c}" stroke-width="4" fill="none"/>`;
    return g;
  };
  // a man's fedora
  const FEDORA = (col, band, id) => `<defs>${hairGrad(id, col)}</defs><path d="M-126,-96 C-100,-112 100,-112 126,-96 C110,-84 -110,-84 -126,-96Z" fill="${shade(col, -0.1)}" ${OUTL}/>` +
    `<path d="M-80,-100 C-90,-150 -70,-196 0,-196 C70,-196 90,-150 80,-100Z" fill="url(#${id})" ${OUTL}/><path d="M-14,-196 C-6,-176 6,-176 14,-196" stroke="${shade(col, -0.4)}" stroke-width="3" fill="none"/><path d="M-82,-116 L82,-116" stroke="${band}" stroke-width="12"/>`;
  // Henrietta's small felt hat for the hospital
  const HAT50 = (col, id) => `<defs>${hairGrad(id, col)}</defs><path d="M-86,-128 C-70,-196 60,-206 92,-140 C70,-150 -50,-150 -86,-128Z" fill="url(#${id})" ${OUTL}/><path d="M60,-176 C80,-200 110,-196 112,-180 C96,-176 80,-170 66,-160Z" fill="#6a2a2a" ${OUTL}/>`;

  // ======================================================= costume overlays (person-local)
  // the suit from her photograph: a fitted jacket with a white blouse collar, three buttons, a belted waist, a pencil skirt
  const SUIT = (col) => `<path d="M-116,-834 L116,-834 C128,-660 132,-520 132,-404 L-132,-404 C-132,-520 -128,-660 -116,-834Z" fill="${col}" ${OUTL}/><path d="M40,-820 L48,-414" stroke="${shade(col, -0.3)}" stroke-width="3" opacity="0.6"/>` +
    `<path d="M-34,-1168 L0,-1120 L34,-1168 L52,-1150 L0,-1096 L-52,-1150Z" fill="#fbf8f0" ${OUTL}/><path d="M-70,-1150 L0,-990 L70,-1150 L58,-1162 L0,-1040 L-58,-1162Z" fill="${shade(col, -0.12)}" ${OUTL}/>` +
    [-980, -920, -860].map(y => `<circle cx="0" cy="${y}" r="9" fill="${shade(col, -0.35)}" stroke="#20140c" stroke-width="1.5"/>`).join('') + `<rect x="-114" y="-850" width="228" height="20" rx="6" fill="${shade(col, -0.25)}" ${OUTL}/>` +
    `<path d="M-90,-960 L-40,-960 M44,-960 L94,-960" stroke="${shade(col, -0.3)}" stroke-width="3"/>`;
  // a housedress: a little floral print, a white Peter Pan collar, a belt, a full skirt to below the knee
  const HOUSEDRESS = (col) => {
    let g = `<path d="M-118,-834 L118,-834 C142,-660 152,-520 156,-404 L-156,-404 C-152,-520 -142,-660 -118,-834Z" fill="${col}" ${OUTL}/>`;
    for (let i = 0; i < 30; i++) { const x = -140 + (i * 53) % 280, y = -1100 + Math.floor(i * 53 / 280) * 92 + (i % 2) * 40; if (y > -420) continue; g += `<circle cx="${x}" cy="${y}" r="7" fill="${shade(col, -0.3)}" opacity="0.6"/><circle cx="${x}" cy="${y}" r="3" fill="#fbf4e6" opacity="0.8"/>`; }
    g += `<path d="M-60,-1166 C-50,-1130 -10,-1124 0,-1150 C10,-1124 50,-1130 60,-1166 C40,-1176 -40,-1176 -60,-1166Z" fill="#fbf8f0" ${OUTL}/><rect x="-118" y="-850" width="236" height="18" rx="5" fill="${shade(col, -0.35)}" ${OUTL}/>` +
      [-140, -60, 20, 100].map(x => `<path d="M${(x * 0.7).toFixed(0)},-820 C${(x * 0.85).toFixed(0)},-640 ${(x * 0.95).toFixed(0)},-500 ${x},-410" stroke="${shade(col, -0.2)}" stroke-width="3" fill="none" opacity="0.5"/>`).join('');
    return g;
  };
  // a long dark wool coat with a wide collar
  const COAT = (col) => `<path d="M-128,-1150 L128,-1150 C150,-800 166,-520 172,-280 L-172,-280 C-166,-520 -150,-800 -128,-1150Z" fill="${col}" ${OUTL}/><path d="M-74,-1160 L0,-930 L74,-1160 L92,-1146 L0,-880 L-92,-1146Z" fill="${shade(col, 0.12)}" ${OUTL}/>` +
    [-900, -780, -660, -540].map(y => `<circle cx="-24" cy="${y}" r="10" fill="${shade(col, -0.3)}" stroke="#141010" stroke-width="1.5"/>`).join('') + `<path d="M-6,-880 L-2,-284" stroke="${shade(col, -0.35)}" stroke-width="3"/>`;
  // a hospital gown: thin pale cotton with a faint stripe and a tie at the neck
  const GOWN = `<path d="M-60,-1166 C-30,-1130 30,-1130 60,-1166" stroke="#20140c" stroke-width="2" fill="none"/><path d="M0,-1140 l-16,22 M0,-1140 l16,22" stroke="#cfd6dc" stroke-width="4"/>` +
    [-90, -45, 0, 45, 90].map(x => `<path d="M${x},-1120 L${(x * 1.1).toFixed(0)},-480" stroke="#c8d2da" stroke-width="3" opacity="0.6"/>`).join('');
  // a teenage boy's plaid shirt (a checked weave over the tunic) with a collar
  const PLAID = (col) => {
    let g = '';
    for (let i = 0; i < 6; i++) g += `<path d="M${-110 + i * 44},-1140 L${-110 + i * 44},-480" stroke="${shade(col, -0.35)}" stroke-width="7" opacity="0.5"/>`;
    for (let i = 0; i < 8; i++) g += `<path d="M-120,${-1120 + i * 86} L120,${-1120 + i * 86}" stroke="${shade(col, -0.35)}" stroke-width="7" opacity="0.45"/>`;
    return g + `<path d="M-40,-1164 L0,-1120 L40,-1164 L54,-1146 L0,-1100 L-54,-1146Z" fill="${shade(col, 0.1)}" ${OUTL}/>` + [-1080, -1000, -920].map(y => `<circle cx="0" cy="${y}" r="5" fill="#efe8da"/>`).join('');
  };
  // a girl's Sunday dress: a round white collar and a sash
  const GIRLDRESS = (col) => `<path d="M-46,-640 C-30,-604 30,-604 46,-640 L52,-618 C30,-588 -30,-588 -52,-618Z" fill="#fbf8f0" ${OUTL}/><rect x="-80" y="-470" width="160" height="16" rx="5" fill="${shade(col, -0.35)}" ${OUTL}/>` +
    `<path d="M70,-470 l26,34 l-16,6 l-14,-30Z" fill="${shade(col, -0.35)}" ${OUTL}/>`;
  // a small boy's dungarees over a striped shirt
  const OVERALLS = (col) => `<path d="M-70,-560 L70,-560 L76,-420 L-76,-420Z" fill="${col}" ${OUTL}/><path d="M-60,-640 L-46,-560 M60,-640 L46,-560" stroke="${col}" stroke-width="14"/><circle cx="-46" cy="-560" r="6" fill="#c8b070"/><circle cx="46" cy="-560" r="6" fill="#c8b070"/>` +
    [-620, -590].map(y => `<path d="M-70,${y} L70,${y}" stroke="#c8443a" stroke-width="6" opacity="0.6"/>`).join('');
  // a man's suit front: lapels, a white shirt, a tie
  const SUITM = (tie) => `<path d="M-78,-1162 L0,-920 L78,-1162 L58,-1176 L0,-1010 L-58,-1176Z" fill="#000" opacity="0.25"/><path d="M-44,-1158 L0,-1030 L44,-1158Z" fill="#f2efe8" ${OUTL}/><path d="M-12,-1150 L12,-1150 L10,-1060 L0,-1036 L-10,-1060Z" fill="${tie}" ${OUTL}/>` +
    [-900, -820].map(y => `<circle cx="-24" cy="${y}" r="7" fill="#141414"/>`).join('');
  // a white coat (doctor or lab): lapels, a breast pocket with pens, side pockets; s = stethoscope, tie colour
  const WHITECOAT = (tie, steth, badge) => `<path d="M-76,-1160 L-6,-900 L6,-900 L76,-1160 L58,-1174 L0,-1000 L-58,-1174Z" fill="#dcdcd6" ${OUTL}/>` +
    (tie ? `<path d="M-38,-1156 L0,-1040 L38,-1156Z" fill="#eef0f2" ${OUTL}/><path d="M-10,-1148 L10,-1148 L8,-1070 L0,-1050 L-8,-1070Z" fill="${tie}" ${OUTL}/>` : `<path d="M-38,-1156 L0,-1050 L38,-1156Z" fill="#5a7a9a" ${OUTL}/>`) +
    `<rect x="40" y="-1010" width="46" height="56" rx="4" fill="#efefe8" ${OUTL}/><path d="M50,-1020 L50,-990 M60,-1022 L60,-994 M70,-1018 L70,-992" stroke="#2a3a6a" stroke-width="4"/>` +
    `<rect x="-100" y="-700" width="60" height="70" rx="5" fill="#efefe8" ${OUTL}/><rect x="40" y="-700" width="60" height="70" rx="5" fill="#efefe8" ${OUTL}/>` +
    (steth ? `<path d="M-40,-1150 C-80,-1080 -70,-980 -24,-960 M40,-1150 C76,-1080 60,-1000 30,-990 C10,-986 0,-960 -6,-930" stroke="#2a2a2e" stroke-width="7" fill="none"/><circle cx="-6" cy="-922" r="14" fill="#b8b8bc" ${OUTL}/>` : '') +
    (badge ? `<path d="M-30,-1150 L-50,-930 M30,-1150 L-30,-930" stroke="#3a6aa8" stroke-width="4" fill="none"/><rect x="-62" y="-930" width="44" height="62" rx="5" fill="#f8f8f4" ${OUTL}/><rect x="-56" y="-922" width="32" height="22" fill="#9ab"/><path d="M-56,-890 l30,0 M-56,-880 l22,0" stroke="#556" stroke-width="3"/>` : '');
  // a surgical gown with ties
  const ORGOWN = (col) => `<path d="M-50,-1164 C-20,-1144 20,-1144 50,-1164" stroke="#20140c" stroke-width="2" fill="none"/>` + [-70, 0, 70].map(x => `<path d="M${x},-1130 L${(x * 1.15).toFixed(0)},-520" stroke="${shade(col, -0.18)}" stroke-width="3" opacity="0.6"/>`).join('');
  // a nurse's white uniform: a collar, a row of buttons, a belt with a buckle
  const NURSE = `<path d="M-46,-1166 L0,-1120 L46,-1166 L60,-1148 L0,-1100 L-60,-1148Z" fill="#fbfbf7" ${OUTL}/>` + [-1080, -1020, -960, -900].map(y => `<circle cx="0" cy="${y}" r="5" fill="#e4e4de" stroke="#9a9a94" stroke-width="1"/>`).join('') +
    `<rect x="-116" y="-850" width="232" height="18" rx="5" fill="#ececE6" ${OUTL}/><rect x="-14" y="-852" width="28" height="22" rx="3" fill="#c8b070" ${OUTL}/>`;

  // ======================================================= YOU: Henrietta (thirty)
  // a warm oval face with high cheekbones, wide-set warm brown eyes, arched 1950s brows, a broad nose and full lips that
  // smile easily; dark hair set in curls; red nail polish. o.outfit: 'suit' | 'home' | 'coat' | 'gown'; o.ill 0..1
  const HSKIN = '#7e5236', HHAIR = '#1c1410', NAILS = '#b8141e';
  const henFx = { w: 0.98, len: 1.02, cheek: 1.14, jaw: 0.88, chinW: 0.86, eyeS: 1.12, eyeW: 1.06, eyeTilt: 2, hooded: 0.06, nose: 'broad', noseS: 0.96, lipT: 1.55, mouthW: 1.12, earS: 0.92, browT: 0.75, browArch: 1.5 };
  // a knee-length 1950s skirt: the rig's skirt stops at the knee and her legs (stockings, dark pumps) show below
  const henMk = mk({ kind: 'woman', dims: { hemY: -404, hemX: 140, legX: 42, legW: 50, foot: 100 }, legsW: true, skin: HSKIN, tunic: '#d9c39c', sleeve: '#d2bc94', legs: '#86583a', feet: '#2e1c14', hair: HHAIR, hairStyle: 'bald', hairSeed: 501, brow: '#140c08', belt: false, lightX: -1, nails: NAILS, fx: henFx },
    { expr: 'neutral', iris: '#3a2214', lid: 0.16, mouth: 'smile' });
  const OUTFIT = {
    suit: { tunic: '#d9c39c', sleeve: '#d2bc94', props: SUIT('#d9c39c') },
    home: { tunic: '#e8d27e', sleeve: '#e4cc76', props: HOUSEDRESS('#e8d27e') },
    coat: { tunic: '#2e2a30', sleeve: '#2a262c', props: COAT('#2e2a30') },
    gown: { tunic: '#dfe6ea', sleeve: '#d8e0e4', props: GOWN, legs: '#7e5236', feet: '#7e5236' }
  };
  Q.henrietta = p => {
    const k = p.ill || 0, o = OUTFIT[p.outfit || 'home'];
    return henMk(Object.assign({}, p, o, { skin: mix(HSKIN, '#6e5444', k * 0.5), fx: Object.assign({ hollow: 0.45 * k }, p.fx || {}), face: Object.assign({ bags: 0.1 + 0.6 * k }, p.face || {}) }));
  };
  Q.henriettaArt = p => ({ front: CURLS50(HHAIR, 'hhr') + (p && p.outfit === 'coat' ? HAT50('#5a2230', 'hht') : '') });
  Q.HEN_FX = henFx;

  // ======================================================= the children
  // Lawrence (16): long-faced, a narrow jaw, heavy-lidded eyes, a plaid shirt
  Q.lawrence = mk({ kind: 'man', dims: { shX: 150, wX: 124, sw: 78, hand: 104 }, skin: '#6a422a', tunic: '#7a3a2e', sleeve: '#743628', legs: '#2e2a36', feet: '#1e1612', belt: false, hair: '#141010', hairStyle: 'bald', hairSeed: 511, brow: '#120c0a', lightX: -1, props: PLAID('#7a3a2e'),
    fx: { w: 0.9, len: 1.1, cheek: 0.94, jaw: 0.92, chinW: 0.88, eyeS: 0.96, eyeTilt: -2, hooded: 0.3, nose: 'broad', noseS: 0.94, lipT: 1.2, mouthW: 0.98, earS: 1.08 } }, { expr: 'neutral', iris: '#2a1a10', lid: 0.22 });
  // Elsie (10): a round face, big bright eyes, puffs with yellow ribbons, a blue dress
  const elsieMk = mk({ kind: 'kid', skin: '#7a4c32', tunic: '#5a78b0', sleeve: '#5672aa', legs: null, feet: '#2a1a14', robe: false, hair: '#1a1210', hairStyle: 'bald', hairSeed: 521, brow: '#120c0a', belt: false, lightX: -1, props: GIRLDRESS('#5a78b0'),
    fx: { w: 1.04, len: 0.96, cheek: 1.08, jaw: 0.92, chinW: 0.9, eyeS: 1.14, eyeTilt: 3, hooded: 0.05, nose: 'button', noseS: 0.96, lipT: 1.2, mouthW: 0.94 } }, { expr: 'neutral', iris: '#2a1a10', lid: 0.12 });
  Q.elsie = elsieMk; Q.elsieArt = { front: PUFFS('#1a1210', '#e8c040', 'elp', 0.9) };
  // Sonny (4): chubby cheeks, a wide grin, short curls, dungarees
  Q.lawrenceArt = { front: SHORTCROP('#141010', 'lwc', 1, 11) };
  Q.sonny = mk({ kind: 'kid', skin: '#714629', tunic: '#e8e2d4', sleeve: '#e2dccc', legs: '#3a5a8a', feet: '#2a1a12', hair: '#141010', hairStyle: 'bald', hairSeed: 531, brow: '#120c0a', belt: false, lightX: -1, props: OVERALLS('#3a5a8a'),
    fx: { w: 1.1, len: 0.92, cheek: 1.18, jaw: 0.96, chinW: 0.96, eyeS: 1.06, eyeTilt: 0, hooded: 0.04, nose: 'button', noseS: 1.04, lipT: 1.15, mouthW: 1.04, earS: 1.12 } }, { expr: 'neutral', iris: '#2a1a10', lid: 0.1, mouth: 'smile' });
  Q.sonnyArt = { front: SHORTCROP('#141010', 'snc', 1.08, 23) };
  // Deborah (one and a half): a tiny round face, a top puff with a pink bow
  Q.deborah = mk({ kind: 'kid', skin: '#7c5034', tunic: '#e89aa8', sleeve: '#e494a2', legs: null, feet: '#f4f0ea', hair: '#1a1210', hairStyle: 'bald', hairSeed: 541, brow: '#140c0a', belt: false, lightX: -1, props: GIRLDRESS('#e89aa8'),
    fx: { w: 1.14, len: 0.88, cheek: 1.2, jaw: 0.9, chinW: 0.86, eyeS: 1.2, eyeTilt: 2, hooded: 0, nose: 'button', noseS: 0.86, lipT: 1.1, mouthW: 0.86 } }, { expr: 'neutral', iris: '#2a1a10', lid: 0.08 });
  Q.deborahArt = { front: TOPPUFF('#1a1210', '#e86a8a', 'dbp') };
  // Day (David Lacks, her husband): tall, a long strong face, a thin moustache, a fedora, his good suit
  Q.day = mk({ kind: 'man', dims: { shX: 170, wX: 142, sw: 88, hand: 118 }, skin: '#5e3a24', tunic: '#3a3428', sleeve: '#36302a', legs: '#2e2a24', feet: '#141010', belt: false, hair: '#141010', hairStyle: 'short', hairSeed: 551, mustache: '#141010', brow: '#100a08', lightX: -1, props: SUITM('#5a2a22'),
    fx: { w: 0.94, len: 1.14, cheek: 1.0, hollow: 0.2, jaw: 1.06, chinW: 0.98, eyeS: 0.9, eyeTilt: -3, hooded: 0.28, crow: 0.6, nose: 'broad', noseS: 1.08, noseL: 1.06, lipT: 1.1, earS: 1.04, browT: 1.2 } }, { expr: 'grim', iris: '#2a1a10', lid: 0.24 });
  Q.dayArt = { front: FEDORA('#4a4034', '#1e1a14', 'dyf') };

  // ======================================================= the clinic doctor (1951): a lean face, a long hooked nose, heavy
  // dark glasses, greying hair, a white coat with a stethoscope
  const docFx = { w: 0.92, len: 1.12, cheek: 0.9, hollow: 0.3, jaw: 0.98, chinW: 0.9, eyeS: 0.88, hooded: 0.36, crow: 0.9, nose: 'hook', noseS: 1.12, noseL: 1.1, lipT: 0.7, mouthW: 0.94, earS: 1.06, browT: 1.3, browArch: -0.3 };
  Q.doctor = mk({ kind: 'man', dims: { shX: 166, wX: 138, sw: 86, hand: 114 }, skin: '#ecc6a8', tunic: '#ececE6', sleeve: '#e6e6e0', legs: '#3a3a40', feet: '#1a1a1c', belt: false, hair: '#6a6660', hairStyle: 'slick', hairSeed: 561, brow: '#4a4640', lightX: -1, props: WHITECOAT('#2a3a5a', true),
    fx: docFx }, { expr: 'grim', iris: '#4a5a6a', lid: 0.26 });
  Q.doctorArt = { front: GLASSES('man', docFx, '#1e1612', 0.4) };
  // the surgeon: masked and capped; deep-set grey eyes and bushy brows above the mask; tan rubber gloves
  const surgFx = { w: 1.04, len: 1.0, cheek: 1.02, jaw: 1.08, chinW: 1.04, eyeS: 0.84, eyeTilt: -3, hooded: 0.42, crow: 0.8, nose: 'std', noseS: 1.0, browT: 1.7, browArch: -0.8 };
  Q.surgeon = mk({ kind: 'man', dims: { shX: 176, wX: 148, sw: 90, hand: 120 }, skin: '#e8c0a0', tunic: '#b8ccb4', sleeve: '#b2c6ae', legs: '#8aa088', feet: '#5a6a58', belt: false, hair: '#3a2a20', hairStyle: 'short', hairSeed: 571, brow: '#2a1e16', lightX: -1, glove: '#c8b088', props: ORGOWN('#b8ccb4'),
    fx: surgFx }, { expr: 'stern', iris: '#6a7478', lid: 0.3 });
  Q.surgeonArt = { front: ORMASK('man', surgFx) };
  // the operating nurse: masked, soft round eyes, a cap
  const orNFx = { w: 1.02, len: 0.98, cheek: 1.06, jaw: 0.9, chinW: 0.88, eyeS: 1.06, eyeTilt: 4, hooded: 0.1, nose: 'button', browT: 0.8, browArch: 1.0 };
  Q.orNurse = mk({ kind: 'woman', skin: '#f2d0b8', tunic: '#b8ccb4', sleeve: '#b2c6ae', legs: '#8aa088', feet: '#5a6a58', belt: false, hair: '#6a4a2a', hairStyle: 'bald', hairSeed: 581, brow: '#5a3a1a', lightX: -1, glove: '#c8b088', props: ORGOWN('#b8ccb4'),
    fx: orNFx }, { expr: 'neutral', iris: '#3a5a7a', lid: 0.18 });
  Q.orNurseArt = { front: ORMASK('woman', orNFx, '#d4e2d0') };
  // the ward doctor: young, round-faced, wavy fair hair, a bow-tied white coat, talking as he walks past
  Q.wardDoc = mk({ kind: 'man', dims: { shX: 164, wX: 138, sw: 84, hand: 112 }, skin: '#f0caa8', tunic: '#ececE6', sleeve: '#e6e6e0', legs: '#2e3238', feet: '#141416', belt: false, hair: '#b8904a', hairStyle: 'messy', hairSeed: 591, brow: '#8a6a3a', lightX: 1, props: WHITECOAT('#7a2a2a', false),
    fx: { w: 1.08, len: 0.96, cheek: 1.1, jaw: 0.96, chinW: 0.94, eyeS: 0.96, eyeTilt: 2, hooded: 0.12, nose: 'button', noseS: 1.04, lipT: 0.95, mouthW: 1.0, earS: 1.1, freckles: 0.3 } }, { expr: 'neutral', iris: '#4a6a4a', lid: 0.2 });
  // the ward nurse: a narrow face, a pointed chin, sharp brows, dark hair under a white cap
  const wnFx = { w: 0.9, len: 1.08, cheek: 0.92, jaw: 0.86, chinW: 0.8, eyeS: 0.92, eyeTilt: -4, hooded: 0.2, nose: 'long', noseS: 1.0, lipT: 0.8, mouthW: 0.9, browT: 1.0, browArch: 1.3 };
  // (knee-length coats and uniforms: the rig's woman skirt would reach the floor)
  const KNEE = { legsW: true, dims: { hemY: -400, hemX: 150, legX: 40, legW: 48, foot: 100 } };
  Q.wardNurse = mk({ ...KNEE, kind: 'woman', skin: '#f0ccb2', tunic: '#f4f4f0', sleeve: '#efefea', legs: '#f0f0ea', feet: '#f2f2ee', belt: false, hair: '#2a2018', hairStyle: 'bald', hairSeed: 601, brow: '#1e1610', lightX: 1, props: NURSE, fx: wnFx },
    { expr: 'neutral', iris: '#3a3a2a', lid: 0.22 });
  Q.wardNurseArt = { front: NURSECAP('#2a2018', 'wnc') };
  // the lab assistant (21): freckled, a pert nose, keen hazel eyes, a ponytail, a lab coat over a blouse
  const labFx = { w: 0.96, len: 1.0, cheek: 1.02, jaw: 0.88, chinW: 0.84, eyeS: 1.08, eyeTilt: 3, hooded: 0.06, nose: 'button', noseS: 0.92, lipT: 1.0, mouthW: 0.96, freckles: 0.7, browT: 0.85, browArch: 1.1 };
  Q.labGirl = mk({ ...KNEE, kind: 'woman', skin: '#f4d4bc', tunic: '#ececE6', sleeve: '#e6e6e0', legs: '#d8b49a', feet: '#4a3a2a', belt: false, hair: '#7a4a24', hairStyle: 'bald', hairSeed: 611, brow: '#6a3a1a', lightX: -1, props: WHITECOAT(null, false),
    fx: labFx }, { expr: 'neutral', iris: '#6a6a3a', lid: 0.14 });
  const pony = PONY('#7a4a24', 'lgp');
  Q.labGirlArt = { back: pony.back, front: pony.front };

  // ======================================================= the polio line (1950s school): the nurse and four children
  const pnFx = { w: 1.1, len: 0.98, cheek: 1.12, jaw: 1.0, chinW: 0.98, eyeS: 0.92, eyeTilt: 1, hooded: 0.22, crow: 0.7, nose: 'std', noseS: 1.04, lipT: 1.0, mouthW: 1.04, dbl: 0.3 };
  Q.schoolNurse = mk({ ...KNEE, kind: 'woman', skin: '#e8c4a6', tunic: '#f4f4f0', sleeve: '#efefea', legs: '#f0f0ea', feet: '#f2f2ee', belt: false, hair: '#a89a8a', hairStyle: 'bald', hairSeed: 621, brow: '#8a7a6a', lightX: -1, props: NURSE, fx: pnFx },
    { expr: 'neutral', iris: '#4a5a6a', lid: 0.2, mouth: 'smile' });
  Q.schoolNurseArt = { front: NURSECAP('#a89a8a', 'snc') + GLASSES('woman', pnFx, '#8a6a4a', 0.2) };
  const kidBase = (skin, tunic, hair, style, fx, seed) => mk({ kind: 'kid', skin, tunic, sleeve: shade(tunic, -0.04), legs: '#3a3a44', feet: '#2a1e16', hair, hairStyle: style, hairSeed: seed, brow: shade(hair, -0.2), belt: false, lightX: -1, fx },
    { expr: 'neutral', iris: '#3a2a1a', lid: 0.14 });
  Q.polioKids = [
    // the girl getting the shot: a brave face, a pageboy cut, a red cardigan
    kidBase('#f2d2b8', '#b83a3a', '#6a4220', 'bob', { w: 1.02, len: 0.96, cheek: 1.1, jaw: 0.9, chinW: 0.86, eyeS: 1.1, eyeTilt: 2, nose: 'button', noseS: 0.9, lipT: 1.0, freckles: 0.5 }, 631),
    kidBase('#c89070', '#3a6a5a', '#1a1410', 'short', { w: 1.08, len: 0.94, cheek: 1.12, jaw: 1.0, chinW: 0.98, eyeS: 0.98, nose: 'std', noseS: 1.0, lipT: 1.05, earS: 1.15 }, 641),
    kidBase('#8a5a3a', '#d8b84a', '#141010', 'bald', { w: 0.98, len: 1.02, cheek: 1.04, jaw: 0.94, chinW: 0.9, eyeS: 1.08, eyeTilt: -2, nose: 'broad', noseS: 0.94, lipT: 1.2 }, 651),
    kidBase('#ecc8a8', '#4a5aa0', '#c8a060', 'messy', { w: 1.06, len: 0.92, cheek: 1.16, jaw: 0.96, chinW: 0.94, eyeS: 1.0, eyeTilt: 4, nose: 'button', noseS: 1.0, lipT: 0.95, freckles: 0.8 }, 661)
  ];
  Q.polioKidArt = [null, null, { front: PUFFS('#141010', '#3a8a5a', 'pkp', 0.86) }, null];

  // ======================================================= today: the scientists
  // the lead scientist: a heart-shaped face, almond eyes, a bun, safety glasses, a lab coat with a badge, blue gloves
  const sciFx = { w: 1.0, len: 1.02, cheek: 1.06, jaw: 0.86, chinW: 0.82, eyeS: 0.96, eyeH: 0.86, eyeTilt: 6, hooded: 0.3, nose: 'button', noseS: 0.94, lipT: 1.05, mouthW: 0.94, browT: 0.9, browArch: 0.6 };
  Q.scientist = mk({ ...KNEE, kind: 'woman', skin: '#ecc8a6', tunic: '#f2f2ee', sleeve: '#ececE8', legs: '#2e3440', feet: '#e8e8ec', belt: false, hair: '#141214', hairStyle: 'bald', hairSeed: 671, brow: '#141214', lightX: 1, glove: '#5a86d0', props: WHITECOAT(null, false, true),
    fx: sciFx }, { expr: 'neutral', iris: '#2a1a14', lid: 0.2 });
  const bun = BUN('#141214', 'scb');
  Q.scientistArt = { back: bun.back, front: bun.front + GLASSES('woman', sciFx, '#8aa0b8', 0.9) };
  // two colleagues in the background: a tall bearded man; a young woman with long braids
  Q.sciB = mk({ kind: 'man', dims: { shX: 172, wX: 146, sw: 88, hand: 118 }, skin: '#5a3a28', tunic: '#f2f2ee', sleeve: '#ececE8', legs: '#2a2e36', feet: '#e8e8ec', belt: false, hair: '#141010', hairStyle: 'short', hairSeed: 681, beard: '#141010', beardStyle: 'short', brow: '#100a08', lightX: 1, glove: '#5a86d0', props: WHITECOAT(null, false, true),
    fx: { w: 1.04, len: 1.08, cheek: 1.02, jaw: 1.1, chinW: 1.04, eyeS: 0.9, hooded: 0.2, nose: 'broad', noseS: 1.06, lipT: 1.1, earS: 0.98 } }, { expr: 'neutral', iris: '#2a1a10', lid: 0.22 });
  Q.sciC = mk({ ...KNEE, kind: 'woman', skin: '#d6a07a', tunic: '#f2f2ee', sleeve: '#ececE8', legs: '#3a3440', feet: '#e8e8ec', belt: false, hair: '#2a1a12', hairStyle: 'long', hairSeed: 691, brow: '#1e120c', lightX: 1, glove: '#5a86d0', props: WHITECOAT(null, false, true),
    fx: { w: 0.94, len: 1.04, cheek: 0.98, jaw: 0.88, chinW: 0.84, eyeS: 1.02, eyeTilt: -2, hooded: 0.12, nose: 'long', noseS: 0.98, lipT: 1.1, mouthW: 1.0 } }, { expr: 'neutral', iris: '#3a2214', lid: 0.16 });

  Q.HAND = { henrietta: 104, lawrence: 104, elsie: 72, sonny: 66, deborah: 60, day: 118, doctor: 114, surgeon: 120, orNurse: 104, wardDoc: 112, wardNurse: 104, labGirl: 104, schoolNurse: 104, kid: 70, scientist: 104, sciB: 118, sciC: 104 };
  G.QCAST = Q;
})(window);
