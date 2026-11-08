// Cast for "The Heroin Bottle" (around 1900: a working family's home, the corner pharmacy, a medical society).
// All new faces: you (a young mother), your little daughter, the pharmacist, six parents in the night queue, and three
// doctors. Period dress is drawn as costume overlays (props) and head art (buns, caps, a bowler, a bonnet, spectacles).
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
  // the person drawn with its head art: back pieces behind it, front pieces over it
  Q.withArt = (P, o, art, body) => (art && art.back ? Q.headArt(P, o, art.back) : '') + body + (art && art.front ? Q.headArt(P, o, art.front) : '');

  // ======================================================= head art (head-local: face centre 0,0, hair top about -134)
  const hairGrad = (id, col) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(col, 0.16)}"/><stop offset="1" stop-color="${shade(col, -0.22)}"/></linearGradient>`;
  // a bun pinned high at the back of the head (peeks over the crown), with wound strands
  const BUN = (col, id, y = -150) => {
    let g = `<defs>${hairGrad(id, col)}</defs><ellipse cx="0" cy="${y}" rx="60" ry="44" fill="url(#${id})" ${OUTL}/>`;
    for (let i = 0; i < 5; i++) g += `<path d="M${-46 + i * 6},${y + 10 - i * 4} C${-30 + i * 8},${y - 34 + i * 2} ${30 - i * 8},${y - 34 + i * 2} ${46 - i * 6},${y + 10 - i * 4}" stroke="${shade(col, i % 2 ? 0.3 : -0.4)}" stroke-width="2" fill="none" opacity="0.6"/>`;
    return g;
  };
  // Edwardian hair for the women and the girl (with hairStyle 'bald' on the rig): a centre parting, soft waves swept
  // back over the crown and down over the tops of the ears, the forehead framed by a rounded hairline
  // (d lowers the hairline: the girl's rounder face needs it to cover the rig's scalp sheen)
  const PARTED = (col, id, k = 1, d = 0) => {
    const w = 1 * k;
    let g = `<defs>${hairGrad(id, col)}</defs><path d="M${-82 * w},12 C${-98 * w},-40 ${-100 * w},-122 ${-62 * w},-152 C${-32 * w},-174 ${32 * w},-174 ${62 * w},-152 C${100 * w},-122 ${98 * w},-40 ${82 * w},12 ` +
      `L${70 * w},10 C${68 * w},-28 ${62 * w},${-58 + d * 0.3} ${50 * w},${-76 + d * 0.6} C${34 * w},${-96 + d} ${12 * w},${-102 + d} 0,${-97 + d} C${-12 * w},${-102 + d} ${-34 * w},${-96 + d} ${-50 * w},${-76 + d * 0.6} C${-62 * w},${-58 + d * 0.3} ${-68 * w},-28 ${-70 * w},10Z" fill="url(#${id})" ${OUTL}/>`;
    for (const s of [-1, 1]) for (let i = 0; i < 4; i++) g += `<path d="M${s * 4},${-100 - i * 14} C${s * (34 + i * 10) * w},${-112 - i * 12} ${s * (70 + i * 6) * w},${-90 - i * 8} ${s * (80 + i * 2) * w},${-20 - i * 12}" stroke="${shade(col, i % 2 ? 0.3 : -0.38)}" stroke-width="${i % 2 ? 1.6 : 2.2}" fill="none" opacity="0.6"/>`;
    g += `<path d="M0,-98 L0,-150" stroke="${shade(col, -0.45)}" stroke-width="2" opacity="0.6"/><path d="M${-40 * w},-148 C${-14 * w},-162 ${14 * w},-162 ${40 * w},-148" stroke="#fff" stroke-width="5" opacity="0.16" fill="none"/>`;
    return g;
  };
  // the girl's two braids over the shoulders, tied with ribbons
  const BRAIDS = (col, rib) => {
    let g = '';
    for (const s of [-1, 1]) {
      // a plait: overlapping leaf-shaped strands leaning left and right in turn, tapering, with a dark core
      let core = `M${s * 72},4`;
      for (let i = 0; i < 12; i++) {
        const y = 14 + i * 14, x = s * (72 + i * 1.4), rw = 12 - i * 0.35, lean = (i % 2 ? 1 : -1) * 34;
        g += `<ellipse cx="${x.toFixed(1)}" cy="${y}" rx="${rw.toFixed(1)}" ry="${(rw * 0.62).toFixed(1)}" fill="${shade(col, i % 2 ? 0.1 : -0.06)}" stroke="${shade(col, -0.45)}" stroke-width="1.4" transform="rotate(${lean} ${x.toFixed(1)} ${y})"/>`;
        core += ` L${x.toFixed(1)},${y}`;
      }
      g += `<path d="${core}" stroke="${shade(col, -0.5)}" stroke-width="1.2" fill="none" opacity="0.5"/>`;
      const ex = s * 89, ey = 184;
      g += `<path d="M${ex},${ey} l${s * -20},12 l2,-24Z M${ex},${ey} l${s * 20},12 l-2,-24Z" fill="${rib}" ${OUTL}/><circle cx="${ex}" cy="${ey}" r="5.5" fill="${shade(rib, -0.2)}"/><path d="M${ex - 4},${ey + 6} q-4,12 -2,22 M${ex + 3},${ey + 6} q4,10 4,20" stroke="${col}" stroke-width="5" stroke-linecap="round" fill="none"/>`;
    }
    return g;
  };
  // loose strands falling by the face as the mother comes apart (k 0..1)
  const STRANDS = (col, k) => k < 0.05 ? '' : `<g opacity="${Math.min(1, k * 1.4).toFixed(3)}" fill="none" stroke-linecap="round">` +
    `<path d="M-58,-96 C-80,-60 -86,-10 -78,${(40 + k * 50).toFixed(1)}" stroke="${col}" stroke-width="5"/><path d="M-44,-100 C-62,-70 -66,-40 -60,${(-6 + k * 40).toFixed(1)}" stroke="${shade(col, 0.2)}" stroke-width="3"/>` +
    `<path d="M62,-96 C84,-58 90,-20 82,${(20 + k * 60).toFixed(1)}" stroke="${col}" stroke-width="4.5"/><path d="M20,-104 C40,-90 46,-70 38,${(-50 + k * 30).toFixed(1)}" stroke="${shade(col, -0.2)}" stroke-width="3"/></g>`;
  // round wire spectacles placed on this face's eyes
  const SPECS = (kind, fx, col = '#c9a040') => {
    const P = faceP(kind, fx), r = P.rx * 1.32, y = P.ey + 1;
    let g = '';
    for (const s of [-1, 1]) g += `<circle cx="${(s * P.ex).toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="#dfe8f0" fill-opacity="0.12" stroke="${col}" stroke-width="2.6"/><path d="M${(s * (P.ex - r * 0.5)).toFixed(1)},${(y - r * 0.55).toFixed(1)} q${(s * r * 0.3).toFixed(1)},${(-r * 0.2).toFixed(1)} ${(s * r * 0.55).toFixed(1)},0" stroke="#fff" stroke-width="2" opacity="0.6" fill="none"/>` +
      `<path d="M${(s * (P.ex + r)).toFixed(1)},${y.toFixed(1)} L${(s * (P.ex + r + 22)).toFixed(1)},${(y - 4).toFixed(1)}" stroke="${col}" stroke-width="2.4"/>`;
    g += `<path d="M${(-P.ex + r).toFixed(1)},${y.toFixed(1)} Q0,${(y - 9).toFixed(1)} ${(P.ex - r).toFixed(1)},${y.toFixed(1)}" stroke="${col}" stroke-width="2.4" fill="none"/>`;
    return g;
  };
  // pince-nez: small oval lenses pinched on the nose, a fine chain to the lapel
  const PINCE = (kind, fx) => {
    const P = faceP(kind, fx), y = P.ey + 6, r = P.rx * 1.05;
    let g = '';
    for (const s of [-1, 1]) g += `<ellipse cx="${(s * P.ex * 0.92).toFixed(1)}" cy="${y.toFixed(1)}" rx="${r.toFixed(1)}" ry="${(r * 0.82).toFixed(1)}" fill="#e8f0f4" fill-opacity="0.14" stroke="#b8b8b0" stroke-width="2"/>`;
    g += `<path d="M${(-P.ex * 0.92 + r).toFixed(1)},${y.toFixed(1)} Q0,${(y - 10).toFixed(1)} ${(P.ex * 0.92 - r).toFixed(1)},${y.toFixed(1)}" stroke="#b8b8b0" stroke-width="2" fill="none"/>`;
    g += `<path d="M${(P.ex * 0.92 + r).toFixed(1)},${y.toFixed(1)} C${(P.ex + 40).toFixed(1)},${(y + 60).toFixed(1)} ${(P.ex + 30).toFixed(1)},150 ${(P.ex - 6).toFixed(1)},220" stroke="#d8c890" stroke-width="1.4" fill="none" opacity="0.8"/>`;
    return g;
  };
  // a flat cloth cap with a short peak
  const FLATCAP = (col, id) => `<defs>${hairGrad(id, col)}</defs><path d="M-92,-82 C-104,-150 -40,-190 20,-186 C80,-182 108,-140 96,-90 Q0,-100 -92,-82Z" fill="url(#${id})" ${OUTL}/>` +
    `<path d="M-96,-84 Q-10,-104 98,-90 Q60,-60 -40,-62 Q-80,-66 -96,-84Z" fill="${shade(col, -0.25)}" ${OUTL}/><path d="M-60,-150 C-20,-176 40,-176 70,-150" stroke="${shade(col, 0.25)}" stroke-width="3" fill="none" opacity="0.5"/>`;
  // a black bowler: a hard dome and a curled brim
  const BOWLER = (col, id) => `<defs><radialGradient id="${id}" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="${shade(col, 0.35)}"/><stop offset="1" stop-color="${shade(col, -0.2)}"/></radialGradient></defs>` +
    `<path d="M-74,-106 C-80,-196 80,-196 74,-106Z" fill="url(#${id})" ${OUTL}/><path d="M-76,-112 L76,-112" stroke="#3a2a20" stroke-width="9"/>` +
    `<path d="M-112,-100 C-100,-118 100,-118 112,-100 C96,-90 -96,-90 -112,-100Z" fill="${shade(col, -0.1)}" ${OUTL}/>`;
  // a straw bonnet framing the face (back = the crown behind the head, front = the brim edge and the ribbon)
  const BONNET = (col, rib, id) => ({
    back: `<defs>${hairGrad(id, col)}</defs><path d="M-112,60 C-130,-60 -100,-190 0,-196 C100,-190 130,-60 112,60 C90,20 80,-90 0,-100 C-80,-90 -90,20 -112,60Z" fill="url(#${id})" ${OUTL}/>`,
    front: `<path d="M-108,40 C-124,-70 -96,-188 0,-192 C96,-188 124,-70 108,40" stroke="${shade(col, -0.25)}" stroke-width="14" fill="none"/><path d="M-108,40 C-124,-70 -96,-188 0,-192 C96,-188 124,-70 108,40" stroke="${shade(col, 0.2)}" stroke-width="4" fill="none" stroke-dasharray="6 5"/>` +
      `<path d="M-96,30 C-80,110 -40,150 0,160 C40,150 80,110 96,30" stroke="${rib}" stroke-width="8" fill="none"/><path d="M-10,160 l-26,40 l20,-6 l8,-34 l8,34 l20,6 l-26,-40Z" fill="${rib}" ${OUTL}/>`
  });

  // ======================================================= costume overlays (person-local)
  // the mother: cream blouse with a high lace collar, a cameo and tiny buttons; a navy skirt from the waist; a work apron
  const BLOUSE = `<path d="M-40,-1166 L40,-1166 L44,-1118 L-44,-1118Z" fill="#efe6d4" ${OUTL}/>` + Array.from({ length: 9 }, (_, i) => `<circle cx="${-36 + i * 9}" cy="-1166" r="5" fill="#f8f2e6" stroke="#b8ac96" stroke-width="1"/>`).join('') +
    `<ellipse cx="0" cy="-1108" rx="15" ry="19" fill="#c9a040" stroke="#6a4c14" stroke-width="2"/><ellipse cx="0" cy="-1108" rx="10" ry="14" fill="#e8d4c0"/><path d="M-2,-1118 C4,-1116 5,-1108 2,-1104 C5,-1100 3,-1096 -3,-1097" stroke="#a88a70" stroke-width="2.5" fill="none"/>` +
    Array.from({ length: 6 }, (_, i) => `<circle cx="0" cy="${-1060 + i * 40}" r="5" fill="#f4eee0" stroke="#9a8e78" stroke-width="1.4"/>`).join('') +
    `<path d="M-60,-1090 C-40,-1000 -30,-920 -24,-840 M60,-1090 C40,-1000 30,-920 24,-840" stroke="#c8bca4" stroke-width="3" fill="none" opacity="0.7"/>`;
  const SKIRT = (col) => `<path d="M-116,-834 L116,-834 C142,-600 184,-300 204,-8 L-204,-8 C-184,-300 -142,-600 -116,-834Z" fill="${col}" ${OUTL}/>` +
    [-140, -80, -20, 40, 100, 150].map((x, i) => `<path d="M${(x * 0.55).toFixed(0)},-820 C${(x * 0.75).toFixed(0)},-560 ${(x * 0.92).toFixed(0)},-300 ${x},-14" stroke="${shade(col, i % 2 ? 0.16 : -0.4)}" stroke-width="${i % 2 ? 3 : 5}" fill="none" opacity="0.55"/>`).join('') +
    `<rect x="-118" y="-846" width="236" height="22" rx="5" fill="${shade(col, -0.3)}" ${OUTL}/>`;
  const APRON = (col, stain = 0) => `<path d="M-90,-826 L90,-826 C100,-600 116,-320 122,-112 Q0,-94 -122,-112 C-116,-320 -100,-600 -90,-826Z" fill="${col}" ${OUTL}/>` +
    `<path d="M-60,-640 L-6,-640 L-8,-540 Q-34,-532 -58,-540Z" fill="${shade(col, -0.06)}" stroke="#a89e8a" stroke-width="2"/>` +
    [-70, -10, 50].map(x => `<path d="M${x},-810 C${x + 4},-600 ${x * 1.2},-300 ${x * 1.3},-120" stroke="${shade(col, -0.18)}" stroke-width="3" fill="none" opacity="0.5"/>`).join('') +
    (stain > 0.02 ? `<g opacity="${stain.toFixed(3)}"><ellipse cx="30" cy="-560" rx="34" ry="22" fill="#8a5a2a" opacity="0.35"/><ellipse cx="-50" cy="-360" rx="22" ry="30" fill="#7a4a22" opacity="0.3"/><circle cx="10" cy="-700" r="9" fill="#6a3a18" opacity="0.4"/></g>` : '');
  // the girl's nightgown: a frilled collar and a ribbon
  const GOWN = `<path d="M-60,-640 C-40,-604 40,-604 60,-640 L64,-616 C40,-584 -40,-584 -64,-616Z" fill="#fbf8f0" ${OUTL}/>` + Array.from({ length: 8 }, (_, i) => `<circle cx="${-52 + i * 15}" cy="${-604 + Math.sin(i / 7 * Math.PI) * 10}" r="6" fill="#fbf8f0" stroke="#c8c0b0" stroke-width="1"/>`).join('') +
    `<path d="M-14,-602 l-18,-10 l2,22Z M14,-602 l18,-10 l-2,22Z" fill="#c86a7a" ${OUTL}/><circle cx="0" cy="-602" r="6" fill="#b85a6a" ${OUTL}/>` +
    `<path d="M-40,-560 C-30,-480 -36,-380 -48,-260 M36,-560 C30,-470 40,-380 52,-260" stroke="#ddd6c8" stroke-width="3" fill="none" opacity="0.8"/>`;
  // the pharmacist: the white coat's lapels over a black waistcoat, a bow tie, a gold watch chain
  const PHARM = `<path d="M-74,-1160 L0,-1010 L74,-1160 L56,-1172 L0,-1060 L-56,-1172Z" fill="#f6f4ee" ${OUTL}/><path d="M-46,-1148 L0,-1050 L46,-1148 L36,-900 L-36,-900Z" fill="#1e1c22" ${OUTL}/>` +
    `<path d="M-14,-1160 L14,-1160 L0,-1070Z" fill="#f2efe6"/><path d="M0,-1158 l-24,-12 l0,24Z M0,-1158 l24,-12 l0,24Z" fill="#141216" ${OUTL}/><circle cx="0" cy="-1158" r="6" fill="#141216"/>` +
    [-1020, -980, -940].map(y => `<circle cx="0" cy="${y}" r="5" fill="#8a7a50"/>`).join('') + `<path d="M-30,-960 C-10,-930 14,-930 30,-962" stroke="#e0c060" stroke-width="3" fill="none"/>` +
    [-1000, -880, -760].map(y => `<circle cx="-62" cy="${y}" r="7" fill="#ddd8cc" stroke="#9a948a" stroke-width="1.5"/>`).join('');
  // a doctor's frock coat front: lapels, white shirt, a black cravat (or a bow), a watch chain
  const FROCK = (bow) => `<path d="M-80,-1162 L-10,-930 L0,-930 L10,-930 L80,-1162 L60,-1176 L0,-1010 L-60,-1176Z" fill="#141418" opacity="0.6"/><path d="M-50,-1156 L0,-1020 L50,-1156Z" fill="#f2efe8" ${OUTL}/>` +
    (bow ? `<path d="M0,-1150 l-26,-12 l0,24Z M0,-1150 l26,-12 l0,24Z" fill="#5a1a22" ${OUTL}/>` : `<path d="M-14,-1158 L14,-1158 L8,-1060 L0,-1046 L-8,-1060Z" fill="#141216" ${OUTL}/>`) +
    `<path d="M-40,-900 C-16,-870 16,-870 40,-902" stroke="#d8b850" stroke-width="3" fill="none"/>` + [-900, -820, -740].map(y => `<circle cx="-30" cy="${y}" r="6" fill="#0c0c0e" stroke="#4a4a50" stroke-width="1"/>`).join('');
  // a knitted shawl wrapped round the shoulders (frontProps: over the upper arms), crossing at the breast, fringed; and a
  // man's knotted scarf
  // (the knit runs in soft rows along the drape, clipped to the shawl; the two ends cross over the breast)
  const SHAWL = (col) => {
    const d = 'M-186,-1040 C-180,-1112 -110,-1150 -54,-1152 C-30,-1140 30,-1140 54,-1152 C110,-1150 180,-1112 186,-1040 C184,-1000 176,-972 168,-950 C120,-930 60,-905 20,-880 L-20,-880 C-60,-905 -120,-930 -168,-950 C-176,-972 -184,-1000 -186,-1040Z';
    const id = 'shw' + col.replace('#', '');
    let g = `<defs><clipPath id="${id}"><path d="${d}"/></clipPath></defs><path d="${d}" fill="${col}" ${OUTL}/><g clip-path="url(#${id})">`;
    for (let k = 0; k < 9; k++) { const y0 = -1150 + k * 30; g += `<path d="M-200,${y0 + 40} C-120,${y0 + 62 + k * 3} -60,${y0 + 76 + k * 5} 0,${y0 + 82 + k * 6} C60,${y0 + 76 + k * 5} 120,${y0 + 62 + k * 3} 200,${y0 + 40}" stroke="${shade(col, -0.3)}" stroke-width="3" fill="none" opacity="0.45" stroke-dasharray="7 5"/>`; }
    g += `<path d="M-186,-1040 C-150,-1010 -150,-980 -168,-950" stroke="${shade(col, -0.35)}" stroke-width="10" fill="none" opacity="0.35"/><path d="M186,-1040 C150,-1010 150,-980 168,-950" stroke="${shade(col, -0.35)}" stroke-width="10" fill="none" opacity="0.35"/></g>`;
    g += `<path d="M-70,-906 C-36,-892 14,-872 42,-848 L24,-834 C2,-858 -42,-880 -78,-894Z" fill="${shade(col, -0.1)}" ${OUTL}/>`;
    for (let i = 0; i < 16; i++) { const u = i / 15, x = -164 + u * 328, y = -950 + (1 - Math.pow(Math.abs(u - 0.5) * 2, 1.2)) * 66; g += `<path d="M${x.toFixed(0)},${y.toFixed(0)} l${(-2 + (i % 3)).toFixed(0)},24" stroke="${shade(col, -0.15)}" stroke-width="3.5" stroke-linecap="round"/>`; }
    return g;
  };
  const SCARF = (col) => `<path d="M-70,-1170 C-30,-1140 30,-1140 70,-1170 L70,-1140 C30,-1110 -30,-1110 -70,-1140Z" fill="${col}" ${OUTL}/><path d="M20,-1130 L40,-1000 L10,-990 L-6,-1124Z" fill="${shade(col, -0.12)}" ${OUTL}/>` +
    `<path d="M24,-1010 l4,14 M16,-1006 l2,14 M32,-1012 l5,13" stroke="${shade(col, 0.2)}" stroke-width="2"/>`;
  const WAISTCOAT = (col) => `<path d="M-90,-1160 L0,-1040 L90,-1160 L96,-830 L0,-800 L-96,-830Z" fill="${col}" ${OUTL}/><path d="M-36,-1160 L0,-1060 L36,-1160Z" fill="#d8d0c0"/>` + [-1020, -960, -900, -840].map(y => `<circle cx="0" cy="${y}" r="5" fill="#2a2018"/>`).join('');

  // ======================================================= YOU: the mother
  // a soft oval face, gentle downturned brown eyes, a straight nose, full lips, a small mole on the cheek; chestnut hair
  // up in a bun. o.decl 0..1: the habit takes her (paler, hollow, dark rings, hair coming loose, a stained apron)
  const MSKIN = '#efcfb4', MHAIR = '#5a3420';
  const momMk = mk({ kind: 'woman', skin: MSKIN, tunic: '#e4d8c2', sleeve: '#ddd0b8', hair: MHAIR, hairStyle: 'bald', hairSeed: 301, brow: '#4a2a18', belt: false, lightX: -1,
    fx: { w: 0.95, len: 1.04, cheek: 1.0, jaw: 0.9, chinW: 0.86, eyeS: 1.0, eyeTilt: -3, hooded: 0.14, nose: 'std', noseS: 0.95, lipT: 1.1, mouthW: 0.98, earS: 0.95, browT: 0.9, browArch: 1.2, mole: [40, 62] } },
    { expr: 'anxious', iris: '#5a4430', lid: 0.18 });
  Q.you = p => {
    const k = p.decl || 0;
    return momMk(Object.assign({}, p, { skin: mix(MSKIN, '#dccabe', k), props: BLOUSE + SKIRT('#1e2438') + APRON('#e8e2d4', k), fx: Object.assign({ hollow: 0.35 * k }, p.fx || {}),
      face: Object.assign({ bags: 0.15 + 0.7 * k }, p.face || {}) }));
  };
  Q.youArt = p => ({ back: BUN(MHAIR, 'yb' + Math.round((p.decl || 0) * 10), -158 + 12 * (p.decl || 0)), front: PARTED(MHAIR, 'yh') + STRANDS(MHAIR, p.decl || 0) });

  // ======================================================= YOUR DAUGHTER (about six)
  // a round face, a small button nose, grey-blue eyes, a few freckles, long dark-blonde hair, a white nightgown.
  // o.sick 0..1: pale with fever-flushed cheeks; o.wd 0..1: the withdrawal (white, sweating)
  const CSKIN = '#f6dcc8';
  const CHAIR = '#c4945a';
  const kidMk = mk({ kind: 'kid', skin: CSKIN, tunic: '#f4f0e6', sleeve: '#efeae0', robe: true, hair: CHAIR, hairStyle: 'bald', hairSeed: 311, brow: '#a87a48', belt: false, lightX: -1, props: GOWN,
    fx: { w: 1.0, len: 0.98, cheek: 1.06, jaw: 0.94, chinW: 0.92, eyeS: 1.0, eyeTilt: 2, hooded: 0.08, nose: 'button', noseS: 0.9, lipT: 1.0, mouthW: 0.92, freckles: 0.35 } },
    { expr: 'neutral', iris: '#5a7a96', lid: 0.16 });
  Q.child = p => {
    const s = p.sick || 0, w = p.wd || 0;
    return kidMk(Object.assign({}, p, { skin: mix(mix(CSKIN, '#eee4dc', s * 0.6), '#e6ddd6', w), face: Object.assign({ blush: 0.2 + 0.35 * s - 0.15 * w, bags: 0.3 * s + 0.5 * w }, p.face || {}) }));
  };
  // (a child's hair lies flatter: the parting is pressed down toward the head)
  Q.childArt = { front: `<g transform="translate(0,-90) scale(1,0.84) translate(0,90)">${PARTED(CHAIR, 'ch', 0.99, 20)}</g>` + BRAIDS(CHAIR, '#c86a7a') };

  // ======================================================= THE PHARMACIST
  // round and rosy, small merry eyes, a button nose, a big walrus moustache, pomaded hair, pince-nez, a white coat
  const pharmFx = { w: 1.1, len: 0.96, cheek: 1.12, jaw: 1.0, chinW: 1.0, eyeS: 0.86, eyeTilt: 2, hooded: 0.2, crow: 0.8, nose: 'button', noseS: 1.08, lipT: 1.0, mouthW: 1.06, earS: 1.0, browT: 1.1, browArch: 0.8, dbl: 0.3 };
  Q.pharmacist = mk({ kind: 'man', dims: { shX: 176, wX: 150, sw: 88, hand: 118 }, skin: '#f0c2a2', tunic: '#ece9e2', sleeve: '#e6e2da', legs: '#2a2a2e', feet: '#141416', belt: false, hair: '#2a2218', hairStyle: 'slick', hairSeed: 321,
    mustache: '#2a2218', mstyle: 'walrus', brow: '#2a2218', stubble: 0, lightX: -1, props: PHARM, fx: pharmFx },
    { expr: 'neutral', iris: '#4a3a2a', lid: 0.22, blush: 0.35 });
  Q.pharmArt = { front: PINCE('man', pharmFx) };

  // ======================================================= THE NIGHT QUEUE: six parents with empty bottles
  const pa = mk({ kind: 'woman', skin: '#e8c4a8', tunic: '#4a3a30', sleeve: '#443428', hair: '#6a5a4a', hairStyle: 'bob', hairSeed: 331, kerchief: '#6a3434', brow: '#4a3a2a', belt: false, lightX: -1, frontProps: SHAWL('#5a5048'),
    fx: { w: 0.88, len: 1.12, cheek: 0.9, hollow: 0.45, jaw: 0.88, chinW: 0.84, eyeS: 0.96, eyeTilt: -4, hooded: 0.3, nose: 'long', noseS: 1.05, lipT: 0.8, mouthW: 0.95 } }, { expr: 'anxious', iris: '#4a4a3a', lid: 0.24, bags: 0.6 });
  const pbFx = { w: 0.92, len: 1.1, cheek: 0.94, hollow: 0.35, jaw: 1.0, chinW: 0.94, eyeS: 0.94, hooded: 0.2, nose: 'std', noseS: 1.06, lipT: 0.85, earS: 1.18 };
  const pb = mk({ kind: 'man', dims: { shX: 160, wX: 132, sw: 82, hand: 112 }, skin: '#e0b496', tunic: '#4a4236', sleeve: '#443c30', legs: '#2e2a26', feet: '#1a1612', belt: false, hair: '#3a2a1a', hairStyle: 'short', hairSeed: 341, stubble: 0.9, brow: '#2e2014', lightX: -1, props: SCARF('#7a2e22'), fx: pbFx },
    { expr: 'anxious', iris: '#3a2a1a', lid: 0.2, bags: 0.5 });
  const pc = mk({ kind: 'woman', skin: '#f4d2b8', tunic: '#2e4a3a', sleeve: '#2a4434', hair: '#a8441e', hairStyle: 'bob', hairSeed: 351, brow: '#8a3a1a', belt: false, lightX: -1,
    fx: { w: 1.02, len: 0.98, cheek: 1.06, jaw: 0.9, chinW: 0.88, eyeS: 1.04, eyeTilt: 3, hooded: 0.1, nose: 'button', noseS: 0.92, lipT: 1.1, freckles: 0.8 } }, { expr: 'fear', iris: '#4a6a3a', lid: 0.14, bags: 0.4 });
  const pd = mk({ kind: 'man', dims: { shX: 176, wX: 150, sw: 90, hand: 120 }, skin: '#e6b090', tunic: '#2a2a2e', sleeve: '#26262a', legs: '#1e1e22', feet: '#121214', belt: false, hair: '#8a8680', hairStyle: 'receding', hairSeed: 361, beard: '#9a968e', beardStyle: 'short', mustache: '#9a968e', brow: '#7a766e', lightX: -1, props: WAISTCOAT('#3a2e26'),
    fx: { w: 1.06, len: 1.0, cheek: 1.08, jaw: 1.06, eyeS: 0.84, hooded: 0.45, crow: 1.2, nose: 'broad', noseS: 1.12, lipT: 0.9, earS: 1.1 } }, { expr: 'tired', iris: '#5a5a54', lid: 0.34, bags: 0.6 });
  const pe = mk({ kind: 'woman', skin: '#d8a888', tunic: '#3a2a2a', sleeve: '#342424', hair: '#1a1412', hairStyle: 'bald', hairSeed: 371, brow: '#141010', belt: false, lightX: -1, frontProps: SHAWL('#7a7a74'),
    fx: { w: 1.12, len: 0.96, cheek: 1.14, jaw: 1.04, chinW: 1.0, eyeS: 0.9, hooded: 0.2, nose: 'broad', noseS: 1.0, lipT: 1.05, dbl: 0.4 } }, { expr: 'anxious', iris: '#2a1e14', lid: 0.2, bags: 0.5 });
  const pf = mk({ kind: 'man', dims: { shX: 166, wX: 136, sw: 84, hand: 114 }, skin: '#c89070', tunic: '#d8d0c0', sleeve: '#d0c8b8', legs: '#2a2420', feet: '#18120e', belt: false, hair: '#141010', hairStyle: 'short', hairSeed: 381, stubble: 0.7, brow: '#120c0a', lightX: -1, props: WAISTCOAT('#3a3026'),
    fx: { w: 0.98, len: 1.02, cheek: 1.0, jaw: 1.04, chinW: 1.02, eyeS: 0.98, eyeTilt: -2, nose: 'hook', noseS: 1.0, lipT: 1.0 } }, { expr: 'fear', iris: '#2a1a10', lid: 0.16, bags: 0.4 });
  Q.parents = [
    { mk: pa, art: null },
    { mk: pb, art: { front: FLATCAP('#4a4a44', 'pbc') } },
    { mk: pc, art: BONNET('#c8b48a', '#3a6a4a', 'pcb') },
    { mk: pd, art: { front: BOWLER('#1a1816', 'pdb') } },
    { mk: pe, art: { back: BUN('#1a1412', 'peb', -158), front: PARTED('#1a1412', 'peh', 1.06) } },
    { mk: pf, art: null }
  ];
  Q.PARENT_HAND = [104, 112, 104, 120, 104, 114];

  // ======================================================= THE DOCTORS (a medical society, later)
  const daFx = { w: 0.96, len: 1.1, cheek: 0.96, hollow: 0.25, jaw: 0.98, chinW: 0.92, eyeS: 0.84, hooded: 0.4, crow: 1.4, nose: 'long', noseS: 1.14, noseL: 1.1, lipT: 0.75, earS: 1.12, browT: 1.3 };
  const dbFx = { w: 1.12, len: 0.98, cheek: 1.1, jaw: 1.14, chinW: 1.08, eyeS: 0.82, hooded: 0.36, nose: 'broad', noseS: 1.1, lipT: 1.05, browT: 1.6, browArch: -0.6, dbl: 0.35 };
  const dcFx = { w: 0.9, len: 1.06, cheek: 0.92, jaw: 0.96, chinW: 0.9, eyeS: 0.96, eyeTilt: -3, hooded: 0.15, nose: 'std', noseS: 1.02, lipT: 0.9, earS: 0.96 };
  // the senior physician: white hair and a full white beard, gold spectacles, a black frock coat
  Q.docA = mk({ kind: 'man', dims: { shX: 168, wX: 140, sw: 86, hand: 116 }, skin: '#ecc4a4', tunic: '#1c1c22', sleeve: '#1a1a20', legs: '#141418', feet: '#0c0c0e', belt: false, hair: '#e8e4dc', hairStyle: 'receding', hairSeed: 391,
    beard: '#ece8e0', beardStyle: 'full', mustache: '#ece8e0', brow: '#d8d4cc', lightX: -1, props: FROCK(false), fx: daFx }, { expr: 'grim', iris: '#5a6a7a', lid: 0.28 });
  // a heavy-browed man with a short black beard and pince-nez, a grey coat
  Q.docB = mk({ kind: 'man', dims: { shX: 180, wX: 154, sw: 92, hand: 122 }, skin: '#e2b08e', tunic: '#34343a', sleeve: '#303036', legs: '#202024', feet: '#101012', belt: false, hair: '#2a1c14', hairStyle: 'receding', hairSeed: 401,
    beard: '#2a1c14', beardStyle: 'short', mustache: '#2a1c14', brow: '#1e140e', lightX: -1, props: FROCK(false), fx: dbFx }, { expr: 'stern', iris: '#3a2a1a', lid: 0.3 });
  // a younger doctor: pomaded hair, a neat moustache, a brown-grey suit and a claret bow tie
  Q.docC = mk({ kind: 'man', dims: { shX: 162, wX: 132, sw: 82, hand: 112 }, skin: '#f0c8aa', tunic: '#4a4440', sleeve: '#46403c', legs: '#2a2624', feet: '#141210', belt: false, hair: '#5a3a22', hairStyle: 'slick', hairSeed: 411,
    mustache: '#5a3a22', brow: '#4a2e18', stubble: 0.2, lightX: 1, props: FROCK(true), fx: dcFx }, { expr: 'anxious', iris: '#4a5a3a', lid: 0.2 });
  Q.docArt = { a: { front: SPECS('man', daFx) }, b: { front: PINCE('man', dbFx) }, c: null };

  Q.HAND = { you: 104, child: 72, pharmacist: 118, docA: 116, docB: 122, docC: 112 };
  G.QCAST = Q;
})(window);
