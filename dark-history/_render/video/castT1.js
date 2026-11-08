// Test cast (an any-topic test of the skill, 2026-11-08): Vienna General Hospital, the First Obstetric Clinic, 1847.
// The clean rig (G.RIG_CRISP), every garment dressed with tailor.js and woven (o.weave), the hair built with hairkit.js
// (layered locks, a sheen, a soft hairline), every face new and different, one main colour per character: you, Ignaz
// Semmelweis, a young doctor (bottle-green frock coat); a mother in the ward with childbed fever (cream linen
// nightgown); Professor Johann Klein, your chief (black frock coat).
(function (G) {
  const { person, shade } = G.RIG, K0 = G.CAST, T = G.TAILOR, HK = G.HAIRKIT;
  const Q = {};
  const face = (base, p) => Object.assign({}, base, p.face || {}, p.blink ? { lid: Math.max((p.face && p.face.lid) ?? base.lid ?? 0.2, p.blink) } : {});
  const mk = (base, faceBase) => p => person(Object.assign({}, base, p, { fx: Object.assign({}, base.fx, p.fx || {}), face: face(faceBase, p) }));
  Q.blink = K0.blink; Q.talk = K0.talk; Q.breath = K0.breath;

  // head-local art drawn exactly where the rig puts the head (from cast14.js): back pieces behind the body, front over it
  Q.headArt = (P, o, svg) => {
    const s = o.s || 1, b = o.breath || 0, sx = Math.round(s * (1 - b * 0.0015) * 1e5) / 1e5, sy = Math.round(s * (1 + b * 0.004) * 1e5) / 1e5, hsc = o.headScale ?? 1;
    return `<g transform="translate(${o.x || 0},${o.y || 0}) rotate(${o.sway || 0}) scale(${sx},${sy})"><g transform="translate(0,${P.D.headY + (1 - hsc) * 110}) rotate(${o.tilt || 0}) scale(${hsc})">${svg}</g></g>`;
  };
  Q.withArt = (P, o, art, body) => (art && art.back ? Q.headArt(P, o, art.back) : '') + body + (art && art.front ? Q.headArt(P, o, art.front) : '');

  // ======================================================= YOU: Ignaz Semmelweis at twenty-nine. A round open face, full
  // cheeks, a soft square chin, warm brown eyes under straight brows, a straight nose, a full moustache; brown hair
  // parted on the left and swept across in a wave, trimmed sideburns. A bottle-green frock coat in a wool twill (velvet
  // collar, pick-stitched lapels, horn buttons), a burgundy silk waistcoat, a pleated shirt, the standing collar and a
  // black silk bow.
  const SFX = { w: 1.06, len: 0.96, cheek: 1.12, jaw: 1.04, chinW: 1.05, chin: 0.96, eyeS: 1.0, eyeW: 1.0, eyeTilt: 1, hooded: 0.15, crow: 0.2, nose: 'std', noseS: 1.04, noseL: 0.98, lipT: 1.05, mouthW: 0.98, browT: 1.2, browArch: 0, earS: 1.0 };
  const SHAIR = '#5e4026';
  Q.semm = mk({ kind: 'man', dims: { shX: 156, wX: 126, hemX: 148, sw: 76, hand: 112 }, skin: '#e8bf9e', tunic: '#30402c', sleeve: '#2d3c29', legs: '#22201c', feet: '#141010', belt: false, tailored: true,
    weave: { kind: 'twill', op: 0.12 },
    hair: SHAIR, hairStyle: 'bald', hairSeed: 3101, brow: '#4a301a', mustache: '#4e331c', stubble: 0.35, lightX: 1,
    costume: T.shirt({ col: '#f3efe6', placket: true, pleats: true }) + T.vest({ col: '#5c2622' }) + T.collar({ type: 'stand', tieCol: '#141210' }) + T.jacket({ col: '#30402c', pocket: 'plain', bkind: 'horn', weave: 'twill', weaveOp: 0.12, velvet: true }),
    fx: SFX },
  { expr: 'anxious', iris: '#5a4028', lid: 0.2 });
  Q.semmArt = () => HK.sidePart({ fx: SFX, col: SHAIR, id: 'shr', light: 1, part: 28 });

  // ======================================================= THE MOTHER: twenty, an oval face, a narrow chin, wide-set
  // hazel-green eyes, a small straight nose, full lips, freckles; dark chestnut hair parted in the middle and smoothed
  // over her ears, gathered into a night plait over her left shoulder. A linen nightgown: a pin-tucked yoke with a
  // stitched seam, the cloth gathered softly below it, a lace-edged frill at the neck, a drawstring tied in a faded silk
  // ribbon, a short placket with linen buttons.
  const GOWN = col => {
    const dk = shade(col, -0.32), lt = shade(col, 0.3);
    let g = '';
    // gathers falling from the yoke seam
    for (let x = -120; x <= 120; x += 20) g += `<path d="M${x},-1044 Q${x * 1.04},-980 ${x * 1.12},-880" stroke="${dk}" stroke-width="3.2" fill="none" opacity="0.22" filter="url(#b2)"/><path d="M${x + 7},-1044 Q${(x + 7) * 1.04},-984 ${(x + 7) * 1.1},-896" stroke="${lt}" stroke-width="2" fill="none" opacity="0.35"/>`;
    // the yoke: pin tucks in pairs either side of the placket, and its seam with a line of stitching under it
    for (const s of [-1, 1]) for (const x of [16, 26, 36, 46, 56]) g += `<path d="M${s * x},-1130 L${s * x},-1050" stroke="${dk}" stroke-width="1.1" opacity="0.45"/><path d="M${s * (x + 2.2)},-1130 L${s * (x + 2.2)},-1050" stroke="${lt}" stroke-width="1.2" opacity="0.6"/>`;
    g += `<path d="M-140,-1050 Q0,-1036 140,-1050" stroke="${dk}" stroke-width="1.6" fill="none" opacity="0.6"/><path d="M-140,-1043 Q0,-1029 140,-1043" stroke="${dk}" stroke-width="0.9" fill="none" stroke-dasharray="2.4 2" opacity="0.5"/><path d="M-140,-1053 Q0,-1039 140,-1053" stroke="${lt}" stroke-width="1.2" fill="none" opacity="0.5"/>`;
    // the placket and its buttons
    g += `<path d="M-6,-1132 L-6,-1052 M6,-1132 L6,-1052" stroke="${dk}" stroke-width="1.2" opacity="0.6"/>` + [-1112, -1086, -1060].map(y => T.button(0, y, 'cloth', 4.6, shade(col, 0.12))).join('');
    // the neck frill, edged with lace: scallops, each pierced with a small eyelet, a fine line of stitching above
    let d = 'M-60,-1152'; for (let i = 0; i < 10; i++) { const x0 = -60 + i * 12, x1 = x0 + 12; d += ` Q${(x0 + x1) / 2},-1126 ${x1},-1152`; }
    g += `<path d="${d} L60,-1162 L-60,-1162Z" fill="${shade(col, 0.16)}" stroke="${dk}" stroke-width="1"/>`;
    for (let i = 0; i < 10; i++) g += `<circle cx="${-54 + i * 12}" cy="-1141" r="1.6" fill="${dk}" opacity="0.55"/>`;
    g += `<path d="M-58,-1156 L58,-1156" stroke="${dk}" stroke-width="0.8" stroke-dasharray="2 1.6" opacity="0.55"/>`;
    // the drawstring bow: faded rose silk with a sheen, its two ends hanging
    const rb = '#b8867a';
    g += `<path d="M0,-1146 L-17,-1156 Q-22,-1146 -17,-1136Z M0,-1146 L17,-1156 Q22,-1146 17,-1136Z" fill="${rb}" stroke="${shade(rb, -0.45)}" stroke-width="1"/><path d="M-15,-1153 L-5,-1148 M15,-1153 L5,-1148" stroke="${shade(rb, 0.5)}" stroke-width="1.2" opacity="0.7"/>`;
    g += `<path d="M-2,-1144 C-6,-1130 -10,-1118 -8,-1104 M2,-1144 C6,-1128 10,-1116 9,-1100" stroke="${rb}" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="0" cy="-1146" r="3.4" fill="${shade(rb, -0.1)}" stroke="${shade(rb, -0.45)}" stroke-width="0.9"/>`;
    return g;
  };
  const MFX = { w: 0.97, len: 1.03, cheek: 1.04, jaw: 0.9, chinW: 0.88, chin: 1.0, eyeS: 1.0, eyeW: 1.02, eyeX: 1.04, eyeTilt: 0, hooded: 0.08, crow: 0, nose: 'std', noseS: 0.92, noseL: 0.96, lipT: 1.1, mouthW: 0.96, browT: 0.9, browArch: 1.5, earS: 0.96, freckles: 0.3 };
  const MHAIR = '#4a2814', GCOL = '#d9d3c5';
  Q.mother = mk({ kind: 'woman', skin: '#ecc8ac', tunic: GCOL, sleeve: '#d3cdbf', belt: false, tailored: true,
    weave: { kind: 'linen', op: 0.14 },
    hair: MHAIR, hairStyle: 'bald', hairSeed: 3201, brow: '#3a1e0e', lightX: 1, costume: GOWN(GCOL),
    fx: MFX },
  { expr: 'fear', iris: '#5a6a3c', lid: 0.12 });
  Q.motherArt = () => HK.centrePart({ fx: MFX, col: MHAIR, id: 'mhr', light: 1, braid: 1, ribbon: '#b8867a' });

  // ======================================================= PROFESSOR JOHANN KLEIN: sixty, heavy. A broad fleshy face with
  // jowls and a double chin, small pale grey eyes under heavy hooded lids and thick brows, a big hooked nose, thin lips,
  // a mole on the cheek; bald, soft white hair round the sides and back, short white side-whiskers. A black frock coat in
  // a fine twill (velvet collar, pick-stitched lapels), a charcoal silk waistcoat with his gold watch chain, a pleated
  // shirt front, the standing collar and a black stock.
  const KFX = { w: 1.1, len: 1.05, cheek: 1.16, jaw: 1.18, chinW: 1.14, chin: 0.96, eyeS: 0.86, eyeW: 0.95, eyeTilt: -2, hooded: 0.55, crow: 1, lidAdd: 0.04, nose: 'hook', noseS: 1.12, noseL: 1.08, lipT: 0.75, mouthW: 1.02, browT: 1.45, browArch: -1, browOut: 3, earS: 1.12, dbl: 0.8, mole: [-50, 40], age: 0.8 };
  Q.klein = mk({ kind: 'man', dims: { shX: 178, wX: 158, hemX: 178, sw: 88, hand: 120 }, skin: '#dcae92', tunic: '#1f1d1c', sleeve: '#1d1b1a', legs: '#1a1818', feet: '#0e0c0c', belt: false, tailored: true,
    weave: { kind: 'twill', op: 0.12 },
    hair: '#cfc9be', hairStyle: 'bald', hairSeed: 3301, brow: '#a8a298', stubble: 0.12, lightX: 1,
    costume: T.shirt({ col: '#efebe0', pleats: true }) + T.vest({ col: '#3e3a36', chain: '#e0b450' }) + T.collar({ type: 'stand', tieCol: '#0c0a0a' }) + T.jacket({ col: '#1f1d1c', pocket: null, buttons: [-930, -852], bkind: 'horn', weave: 'twill', weaveOp: 0.13, velvet: true }),
    fx: KFX },
  { expr: 'stern', iris: '#5e646a', lid: 0.34, age: true });
  Q.kleinArt = () => HK.baldFringe({ fx: KFX, col: '#b8b2a8', id: 'khr', light: 1 });

  // grip maths needs each rig's hand size
  Q.HAND = { semm: 112, mother: 104, klein: 120 };
  G.QCAST = Q;
})(window);
