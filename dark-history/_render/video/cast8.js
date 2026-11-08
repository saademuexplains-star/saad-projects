// Cast for "The Confessor". New faces for everyone: the royal confessor, the King, the kitchen boy,
// your mother, and three of the King's soldiers.
(function (G) {
  const { person } = G.RIG, K0 = G.CAST;
  const Q = {};
  const face = (base, p) => Object.assign({}, base, p.face || {}, p.blink ? { lid: Math.max((p.face && p.face.lid) ?? base.lid ?? 0.25, p.blink) } : {});
  const mk = (base, faceBase) => p => person(Object.assign({}, base, p, { fx: Object.assign({}, base.fx, p.fx || {}), face: face(faceBase, p) }));
  Q.blink = K0.blink; Q.talk = K0.talk; Q.breath = K0.breath;

  // YOU: the King's confessor, about fifty. Balding crown with a grey fringe, broad square face, heavy grey brows,
  // tired hooded grey-blue eyes, a large straight nose, thin lips, deep lines. Black cassock, violet stole, wooden cross.
  const STOLE = '<path d="M-56,-1146 L-26,-1146 L-34,-80 L-64,-80Z" fill="#4a2a6a" stroke="#1a0e24" stroke-width="2"/><path d="M26,-1146 L56,-1146 L64,-80 L34,-80Z" fill="#4a2a6a" stroke="#1a0e24" stroke-width="2"/>' +
    '<path d="M-58,-150 L-42,-150 L-42,-120 L-28,-120 L-28,-106 L-42,-106 L-42,-86 L-58,-86 L-58,-106 L-72,-106 L-72,-120 L-58,-120Z" fill="#c8a040" transform="translate(9,0)"/><path d="M42,-150 L58,-150 L58,-120 L72,-120 L72,-106 L58,-106 L58,-86 L42,-86 L42,-106 L28,-106 L28,-120 L42,-120Z" fill="#c8a040" transform="translate(-1,0)"/>' +
    '<path d="M-40,-1140 L-6,-1000 M40,-1140 L6,-1000" stroke="#6a4a2a" stroke-width="3"/><path d="M-4,-1004 L4,-1004 L4,-978 L16,-978 L16,-970 L4,-970 L4,-936 L-4,-936 L-4,-970 L-16,-970 L-16,-978 L-4,-978Z" fill="#7a5028" stroke="#2a1a0c" stroke-width="1.5"/>';
  Q.you = mk({
    kind: 'man', robe: true, dims: { shX: 162, wX: 134, sw: 82, hemX: 156, hand: 114 }, skin: '#d4aa8a', tunic: '#18161c', sleeve: '#141218', belt: false, props: STOLE,
    hair: '#8a8580', hairStyle: 'receding', brow: '#7a7670', stubble: 0.35, lightX: 1,
    fx: { w: 1.02, cheek: 1.06, jaw: 1.02, chinW: 1.04, len: 1.04, dbl: 0.22, eyeS: 0.9, hooded: 0.35, crow: 1, nose: 'std', noseS: 1.2, noseL: 3, browT: 1.45, browArch: 1, lipT: 0.82, mouthW: 1.0, earS: 1.08 },
  }, { expr: 'grim', iris: '#5a6a72', lid: 0.24, age: true });

  // THE KING: young and cold. Long auburn hair, a trimmed goatee, high cheekbones, narrow pale-blue eyes,
  // a small straight nose, thin hard lips. Crimson robe, ermine-trimmed mantle, gold crown.
  Q.king = mk({
    kind: 'man', robe: true, dims: { shX: 160, wX: 126, sw: 80, hemX: 150, hand: 112 }, skin: '#e2b898', tunic: '#7a1418', sleeve: '#6a1014', belt: '#c8a040',
    mantle: '#efe9de', mantleW: 1.18, mantleDrop: 80, ermine: true, crown: '#d8b048', hair: '#5a2c14', hairStyle: 'short', hairSeed: 14, beard: '#5a2c14', beardStyle: 'short', lightX: -1,
    fx: { w: 0.98, len: 1.05, cheek: 1.1, jaw: 1.04, chinW: 0.96, eyeS: 0.86, eyeH: 0.8, eyeTilt: 3, hooded: 0.18, nose: 'std', noseS: 0.98, lipT: 0.7, mouthW: 0.92, browT: 1.25, browArch: 3, earS: 0.96 },
  }, { expr: 'neutral', iris: '#7a9ab8', lid: 0.2 });

  // THE KITCHEN BOY: about twelve, freckled, round cheeks, button nose, messy brown hair; drab tunic, stained apron
  Q.boy = mk({
    kind: 'kid', dims: { hand: 74 }, skin: '#e8bea0', tunic: '#7e6e52', sleeve: '#76664a', apron: '#d6ccb8', legs: '#4a3c2e', feet: '#2e2016', belt: '#5a4430',
    hair: '#5a321a', hairStyle: 'short', hairSeed: 37, dirt: 23, lightX: 1,
    fx: { w: 0.98, cheek: 1.05, jaw: 0.94, eyeS: 0.96, nose: 'button', noseS: 1.0, lipT: 1.1, earS: 1.12, freckles: 0.7 },
  }, { expr: 'anxious', iris: '#4a5a30' });

  // YOUR MOTHER: old, soft round face, your grey-blue eyes, crow's feet; headscarf, brown dress, apron
  Q.mother = mk({
    kind: 'woman', skin: '#d8b090', tunic: '#5a4a3e', apron: '#d8d0bc', kerchief: '#cfc6b0', hair: '#9a948a', hairStyle: 'bob', belt: false, lightX: 1,
    fx: { w: 1.02, cheek: 1.08, jaw: 0.95, eyeS: 0.92, hooded: 0.3, crow: 1, nose: 'std', noseS: 1.05, lipT: 0.85, mouthW: 0.98, earS: 1.0 },
  }, { expr: 'neutral', iris: '#5a6a72', age: true, mouth: 'smile', lid: 0.3 });

  // the King's soldiers: kettle helmets, crimson-and-gold tabards over mail-grey tunics, each face different
  const SOLDIER = { kind: 'man', tunic: '#5e5e5a', sleeve: '#555550', legs: '#3a3028', feet: '#1e140c', belt: '#2a1a10', leatherBelt: true, buckle: '#8a8a82', helmet: '#6a6a66', tabard: { col: '#7a1418', trim: '#c8a040' }, lightX: -1 };
  Q.soldier1 = mk(Object.assign({}, SOLDIER, { skin: '#c89a78', beard: '#3a2a1a', beardStyle: 'short', fx: { w: 1.06, jaw: 1.14, cheek: 1.0, eyeS: 0.88, nose: 'broad', noseS: 1.1, browT: 1.4 } }), { expr: 'stern', iris: '#3a2a1a', lid: 0.25 });
  Q.soldier2 = mk(Object.assign({}, SOLDIER, { skin: '#e2b898', mustache: '#8a6a3a', fx: { w: 0.94, len: 1.08, jaw: 0.92, eyeS: 0.9, eyeTilt: -2, nose: 'long', noseS: 1.05, lipT: 0.8 } }), { expr: 'grim', iris: '#4a5a6a', lid: 0.25 });
  Q.soldier3 = mk(Object.assign({}, SOLDIER, { skin: '#a87a58', stubble: 0.9, fx: { w: 1.0, cheek: 1.1, jaw: 1.04, eyeS: 0.92, nose: 'hook', noseS: 1.05, browT: 1.3, earS: 1.1 } }), { expr: 'stern', iris: '#2a1a10', lid: 0.25 });

  G.QCAST = Q;
})(window);
