// Cast for the Coca-Cola look test, dressed with tailor.js on the clean rig (G.RIG_CRISP). New faces: you, John
// Pemberton, at thirty-four (a cavalry officer, Columbus, Georgia, 1865) and at fifty-four (an Atlanta pharmacist with
// a secret, 1885); the field surgeon; the soda clerk at the fountain. Every face different; one main colour per
// character; every garment finished like real clothes and cut to its real length (dims.hemY).
(function (G) {
  const { person } = G.RIG, K0 = G.CAST, T = G.TAILOR;
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
  // soot on your face after the fight (head-local)
  Q.SOOT = `<g opacity="0.5"><ellipse cx="-70" cy="-70" rx="34" ry="16" fill="#1a120c" filter="url(#b8)"/><ellipse cx="66" cy="48" rx="30" ry="18" fill="#1a120c" filter="url(#b8)"/><ellipse cx="-46" cy="84" rx="26" ry="12" fill="#1a120c" filter="url(#b8)"/></g>`;

  // ======================================================= YOU: John Pemberton. A long face, high cheekbones, deep-set
  // brown eyes under heavy straight brows, a long straight nose, thin lips under a full moustache
  const pembFx = { w: 0.95, len: 1.1, cheek: 1.06, hollow: 0.25, jaw: 0.94, chinW: 0.9, chin: 1.04, eyeS: 0.96, eyeW: 1.0, eyeTilt: -1, hooded: 0.3, crow: 0.3, nose: 'long', noseS: 1.06, noseL: 1.06, lipT: 0.85, mouthW: 1.0, browT: 1.3, browArch: 1, earS: 1.02 };
  const PDIMS = { shX: 152, wX: 118, hemX: 146, sw: 74, hand: 112 };
  // at thirty-four, 1865: dark hair, unshaven, the grey shell jacket (waist length) with its buff collar and the belt
  const YOUNG = { kind: 'man', dims: Object.assign({}, PDIMS, { hemY: -700, hemX: 132 }), skin: '#e2b896', tunic: '#6c675e', sleeve: '#67625a', legs: '#5a564e', feet: '#1a1410', belt: false, tailored: true,
    hair: '#2a1c12', hairStyle: 'short', hairSeed: 2001, brow: '#22160e', mustache: '#22160e', mstyle: 'walrus', stubble: 0.7, lightX: 1, fx: pembFx };
  Q.pembYoung = mk(Object.assign({}, YOUNG, { costume: T.uniform({ collar: '#a8843a' }) }), { expr: 'neutral', iris: '#4a3422', lid: 0.22 });
  // ... and cut down at Columbus: soot and mud on the wool, the sabre cut across the chest
  Q.pembYoungHurt = mk(Object.assign({}, YOUNG, { costume: T.uniform({ collar: '#a8843a', soil: 2011 }) + T.wound({ seed: 2011 }) }), { expr: 'fear', iris: '#4a3422', lid: 0.3 });
  // at fifty-four, 1885: the hair grey and going back, the cheeks hollowed by twenty years of morphine, a short grey
  // beard; the pleated shirt tucked in under a charcoal pinstriped waistcoat, the wing collar and black bow tie, the
  // watch chain
  Q.pembOld = mk({ kind: 'man', dims: Object.assign({}, PDIMS, { hemY: -760, hemX: 126 }), skin: '#dcb090', tunic: '#e4ded0', sleeve: '#dfd9ca', legs: '#2a2622', feet: '#141010', belt: false, tailored: true,
    hair: '#6e665c', hairStyle: 'receding', hairSeed: 2002, brow: '#4a4038', mustache: '#7a7268', mstyle: 'walrus', beard: '#857d72', beardStyle: 'short', stubble: 0.3, lightX: -1,
    costume: T.shirt({ pleats: true, studs: 2 }) + T.waistcoat({ col: '#26221e' }) + T.collar({ type: 'wing', y: -1160 }),
    fx: Object.assign({}, pembFx, { hollow: 0.7, crow: 0.9, hooded: 0.45, age: 0.6 }) },
  { expr: 'grim', iris: '#4a3422', lid: 0.32, age: true, bags: 0.6 });

  // THE FIELD SURGEON: a broad heavy face, small eyes under heavy flat brows, a broad nose, a short dark beard and a
  // walrus moustache going grey, the hair receding; shirt and braces under a bloodied leather bib apron to the knee
  Q.surgeon = mk({ kind: 'man', dims: { shX: 168, wX: 150, hemX: 170, sw: 84, hand: 120, hemY: -560 }, skin: '#d8a888', tunic: '#cfc6b2', sleeve: '#c9bfaa', legs: '#3a342c', feet: '#1a1410', belt: false, tailored: true,
    hair: '#5e5246', hairStyle: 'receding', hairSeed: 2031, brow: '#4a4038', beard: '#6a5e50', beardStyle: 'short', mustache: '#6a5e50', mstyle: 'walrus', stubble: 0.3, lightX: 1,
    costume: T.apron({ col: '#4a3424', blood: 2031 }),
    fx: { w: 1.08, len: 0.98, cheek: 1.12, jaw: 1.1, chinW: 1.12, chin: 0.94, eyeS: 0.86, eyeW: 0.96, hooded: 0.5, crow: 0.9, lidAdd: 0.04, nose: 'broad', noseS: 1.12, noseL: 0.96, lipT: 1.1, mouthW: 1.08, browT: 1.55, browArch: -1, browOut: 4, earS: 1.1, mole: [-40, 46], age: 0.5 } },
  { expr: 'grim', iris: '#3a3a30', lid: 0.35, age: true });

  // THE SODA CLERK: young, an open round face, big hazel eyes, a button nose, full lips, big ears; a hip-length white
  // cotton jacket with notched lapels, the shirt's high collar and a black bow tie, a pencil in the breast pocket
  Q.clerk = mk({ kind: 'man', dims: { shX: 146, wX: 116, hemX: 138, sw: 72, hand: 108, hemY: -640 }, skin: '#eebf98', tunic: '#ebe7dd', sleeve: '#e6e2d8', legs: '#2a2622', feet: '#141010', belt: false, tailored: true,
    hair: '#4a2e16', hairStyle: 'short', hairSeed: 2004, brow: '#4a2e18', lightX: 1,
    costume: T.shirt({ col: '#f8f6f0', placket: true }) + T.collar({ type: 'stand' }) + T.jacket({ col: '#efebe2', pocket: 'pencil' }),
    fx: { w: 0.98, len: 0.98, cheek: 1.08, jaw: 0.92, chinW: 0.94, eyeS: 1.08, eyeW: 1.02, hooded: 0.05, crow: 0.1, nose: 'button', noseS: 0.96, lipT: 1.12, mouthW: 1.06, browT: 1.0, browArch: 2, earS: 1.14, freckles: 0.2 } },
  { expr: 'neutral', iris: '#6a6a3a', lid: 0.15 });

  Q.HAND = { pembYoung: 112, pembYoungHurt: 112, pembOld: 112, surgeon: 120, clerk: 108 };
  G.QCAST = Q;
})(window);
