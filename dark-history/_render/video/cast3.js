// Cast for "The Royal Taster". Every character has their own face structure (o.fx): skull width, cheekbones,
// jaw, chin, eye size / tilt / hooding, brow weight, nose type, lips, ears, ageing and marks.
(function (G) {
  const { person } = G.RIG, K0 = G.CAST;
  const T = {};
  const face = (base, p) => Object.assign({}, base, p.face || {}, p.blink ? { lid: Math.max((p.face && p.face.lid) ?? base.lid ?? 0.25, p.blink) } : {});
  const mk = (base, faceBase) => p => person(Object.assign({}, base, p, { fx: Object.assign({}, base.fx, p.fx || {}), face: face(faceBase, p) }));
  T.blink = K0.blink; T.talk = K0.talk; T.breath = K0.breath;

  // YOU, the royal taster: gaunt young servant, pageboy bob, huge watchful eyes, long thin nose, hollow cheeks.
  // Forest-green livery, a belt pouch (where the antidote ends up).
  T.taster = mk({
    kind: 'man', dims: { shX: 146, wX: 116, hemX: 146, sw: 72, hand: 106 }, skin: '#dcae8a', hair: '#231812', hairStyle: 'bob', hairSeed: 41, stubble: 0.35,
    tunic: '#2e4a36', sleeve: '#2a4432', legs: '#3a2e26', feet: '#24180f', belt: '#4a2e1a', leatherBelt: true, buckle: '#c8a050', pouch: true, lightX: -1,
    tabard: { col: '#24402e', trim: '#b8984a', emblem: false },
    fx: { w: 0.93, cheek: 0.95, jaw: 0.84, chinW: 0.78, len: 1.07, chin: 8, eyeS: 1.14, eyeH: 1.12, hollow: 0.9, nose: 'long', noseS: 0.92, mouthW: 0.92, lipT: 0.85, browT: 0.85, browArch: 3, earS: 1.05 },
  }, { expr: 'anxious', iris: '#5a4a32' });

  // the old King: enormous, ruddy and jolly. Round wide face, double chin, small merry eyes, broad nose,
  // thick lips, trimmed white beard, receding white hair, crown, crimson velvet and ermine.
  T.king = mk({
    kind: 'man', build: 'fat', robe: true, skin: '#e9b294', hair: '#e2dcd0', hairStyle: 'receding', beard: '#ebe6dc', beardStyle: 'short', brow: '#d8d2c6',
    crown: true, mantle: '#8a1a24', ermine: false, mantleW: 1.22, mantleDrop: 120, tunic: '#a8242e', sleeve: '#8e1c26', belt: '#d4a838', leatherBelt: true, buckle: '#f6dc80', lightX: -1,
    fx: { w: 1.13, cheek: 1.16, jaw: 1.16, chinW: 1.25, len: 0.95, eyeS: 0.84, eyeH: 0.86, nose: 'broad', noseS: 1.18, mouthW: 1.14, lipT: 1.3, dbl: 1, crow: 1, browT: 1.25, browArch: -2, earS: 1.12, lidAdd: 0.08 },
  }, { expr: 'neutral', mouth: 'smile', iris: '#4a6a8a', blush: 0.28, age: true });

  // the King's brother: tall and narrow. Long face, sharp cheekbones, pointed chin, hooded pale eyes tilted up,
  // hooked nose, thin lips, slicked black hair with a widow's peak, pencil moustache and a pointed beard.
  T.brother = mk({
    kind: 'man', dims: { shX: 152, wX: 118, hemX: 150, sw: 74, hand: 110 }, skin: '#d6b298', hair: '#14100e', hairStyle: 'slick', beard: '#14100e', beardStyle: 'pointed', brow: '#14100e',
    tunic: '#2c1c34', sleeve: '#26182e', legs: '#18121c', feet: '#120c0a', belt: '#1a1014', leatherBelt: true, buckle: '#b8bcc4', lightX: -1, stubble: 0,
    mantle: '#1c1422', mantleW: 1.12, mantleDrop: 90,
    fx: { w: 0.89, cheek: 1.03, jaw: 0.82, chinW: 0.66, len: 1.11, chin: 12, eyeS: 0.92, eyeH: 0.84, hooded: 0.6, eyeTilt: 5, nose: 'hook', noseS: 1.06, mouthW: 0.94, lipT: 0.68, browT: 1.1, browArch: 7, browOut: -5, hollow: 0.55 },
  }, { expr: 'neutral', mouth: 'closed', iris: '#7a8a6a', lid: 0.3 });

  // guards: one broad-jawed brute with a flattened nose and heavy brows, one long-faced with a walrus moustache
  T.guard = (p, v = 0) => K0.guard(Object.assign(v % 2 === 0
    ? { skin: '#d4a07e', tabard: { col: '#7a1a22', trim: '#d8b04a', emblem: true }, fx: { w: 1.08, cheek: 1.1, jaw: 1.22, chinW: 1.2, nose: 'broad', noseS: 1.15, eyeS: 0.86, browT: 1.45, browArch: -3, lipT: 1.1, earS: 1.1 } }
    : { skin: '#e6b898', stubble: 0, mustache: '#5a3a22', mstyle: 'walrus', tabard: { col: '#7a1a22', trim: '#d8b04a', emblem: true }, fx: { w: 0.95, jaw: 0.94, len: 1.09, chin: 6, nose: 'long', noseS: 1.1, eyeS: 0.94, hooded: 0.4, browT: 1.1 } }, p));

  // the serving woman: round freckled face, button nose, full lips, kerchief
  T.server = mk({
    kind: 'woman', skin: '#efc6a6', tunic: '#6a4a36', kerchief: '#d8ccb0', hair: '#7a4a26', hairSeed: 17, apron: '#ddd2bc', belt: false, lightX: -1,
    fx: { w: 1.05, cheek: 1.1, jaw: 0.95, chinW: 1.05, len: 0.97, eyeS: 1.02, nose: 'button', freckles: 1, lipT: 1.15, browT: 0.9 },
  }, { expr: 'neutral', iris: '#5a7a4a' });

  // page boy: blond pageboy cut, freckles
  T.page = mk({
    kind: 'kid', skin: '#f2cdb0', hair: '#c9a05a', hairStyle: 'bob', hairSeed: 9, stubble: 0, tunic: '#7a1a24', sleeve: '#6a1620', legs: '#d8c8a0', feet: '#3a2214',
    tabard: { col: '#8a1e28', trim: '#d8b04a', emblem: false }, belt: '#3a2214', leatherBelt: true, lightX: -1,
    fx: { eyeS: 1.04, nose: 'button', freckles: 0.9, w: 1.02 },
  }, { expr: 'neutral', iris: '#4a6a90' });

  // noble lady: long elegant face, tilted almond eyes, fine long nose, full lips, a beauty mark; blue gown, veil
  T.lady = mk({
    kind: 'woman', skin: '#f0d0ba', tunic: '#22406e', hair: '#6a2a14', hairStyle: 'long', hairSeed: 23, circlet: '#d8b04a', belt: false, lightX: -1,
    fx: { w: 0.95, cheek: 1.0, jaw: 0.86, chinW: 0.82, len: 1.05, chin: 4, eyeS: 1.0, eyeTilt: 4, hooded: 0.3, nose: 'long', noseS: 0.84, lipT: 1.2, mouthW: 0.9, mole: [34, 74], browArch: 4, browT: 0.8 },
  }, { expr: 'neutral', iris: '#3a5a4a' });

  // old lord: bald, long white beard, hooded heavy lids, hooked nose
  T.lord = mk({
    kind: 'man', robe: true, dims: { shX: 150, wX: 128, sw: 76 }, skin: '#e0b89c', hairStyle: 'bald', beard: '#e6e2da', beardStyle: 'long', brow: '#e6e2da',
    tunic: '#4a3a1c', sleeve: '#40321a', belt: '#a8843a', leatherBelt: true, lightX: -1, stubble: 0,
    fx: { w: 0.96, len: 1.05, hooded: 0.7, nose: 'hook', noseS: 1.12, crow: 1, eyeS: 0.88, browT: 1.3, browArch: -4 },
  }, { expr: 'neutral', iris: '#5a5a50', age: true, lid: 0.45 });

  // fat red-haired baron: cropped ginger hair, walrus moustache, wide face, little eyes
  T.baron = mk({
    kind: 'man', build: 'fat', dims: {}, skin: '#efbea0', hair: '#a8481e', hairStyle: 'short', hairSeed: 5, mustache: '#9a4018', mstyle: 'walrus', brow: '#9a4018', stubble: 0,
    tunic: '#3a5a2a', sleeve: '#324e24', legs: '#2a2420', feet: '#1e1610', belt: '#2a1a10', leatherBelt: true, buckle: '#c8a050', lightX: -1,
    fx: { w: 1.1, cheek: 1.12, jaw: 1.06, eyeS: 0.82, eyeH: 0.9, nose: 'button', noseS: 1.2, dbl: 0.6, freckles: 0.6, mouthW: 1.08, browT: 1.15 },
  }, { expr: 'neutral', mouth: 'smile', iris: '#4a6a3a', blush: 0.3 });

  // jester: lean, rubbery long face, wide mouth, big round eyes, motley hood
  T.jester = mk({
    kind: 'man', dims: { shX: 140, wX: 112, hemX: 140, sw: 70, hand: 104 }, skin: '#ecc4a6', hood: '#b8282a', cape: false, hair: '#3a2a1a', stubble: 0,
    tunic: '#d8a828', sleeve: '#b8282a', legs: '#b8282a', stripes: '#d8a828', feet: '#2a1a10', belt: '#2a1a10', leatherBelt: true, lightX: -1,
    fx: { w: 0.9, len: 1.1, chin: 10, eyeS: 1.15, eyeH: 1.1, nose: 'long', noseS: 1.15, mouthW: 1.25, lipT: 0.9, browArch: 8 },
  }, { expr: 'neutral', mouth: 'grin', iris: '#3a5a8a' });

  // the cook: bald and broad, double chin, broad nose
  T.cook = mk({
    kind: 'man', build: 'fat', skin: '#dfa888', hairStyle: 'receding', hair: '#3a2a20', stubble: 0.8, tunic: '#8a8070', sleeve: '#7a7262', legs: '#3a3028', feet: '#221a12',
    apron: '#d8d0c0', belt: '#4a3a2a', lightX: 1,
    fx: { w: 1.1, cheek: 1.08, jaw: 1.14, nose: 'broad', noseS: 1.25, dbl: 0.8, eyeS: 0.9, browT: 1.3 },
  }, { expr: 'neutral', iris: '#4a3a2a' });

  // the taster's family (seen at the house): his old mother, his wife, their daughter and son
  T.mother = mk({
    kind: 'woman', skin: '#d9a888', tunic: '#5a4a3a', wimple: '#d8cfbd', veil: '#4a3c30', apron: '#b0a68e', belt: false, lightX: -1,
    fx: { w: 0.94, len: 1.03, hollow: 0.6, crow: 1, nose: 'long', noseS: 1.05, eyeS: 0.94, hooded: 0.5, lipT: 0.8 },
  }, { expr: 'tired', iris: '#5a4a32', age: true });
  T.wife = mk({
    kind: 'woman', skin: '#e8bc9a', tunic: '#7a5a3a', kerchief: '#8a3a2a', hair: '#4a2c1a', hairStyle: 'long', hairSeed: 29, apron: '#d0c4a8', belt: false, lightX: -1,
    fx: { w: 1.0, cheek: 1.06, jaw: 0.9, eyeS: 1.1, eyeTilt: -2, nose: 'button', lipT: 1.15, browArch: 3 },
  }, { expr: 'neutral', iris: '#4a6a8a' });
  T.daughter = mk({
    kind: 'kid', skin: '#eec2a0', hair: '#4a2c1a', hairStyle: 'long', hairSeed: 12, stubble: 0, tunic: '#8a6a4a', sleeve: '#7a5c40', legs: '#8a6a4a', feet: '#3a2618', belt: '#5a3a22', lightX: -1,
    fx: { eyeS: 1.12, nose: 'button', freckles: 1, w: 0.98 },
  }, { expr: 'neutral', iris: '#5a4a32' });
  T.son = mk({
    kind: 'kid', skin: '#dcae8a', hair: '#231812', hairStyle: 'messy', hairSeed: 7, stubble: 0, tunic: '#5a6a4a', sleeve: '#4e5e40', legs: '#4a3e30', feet: '#2a1c12', belt: '#4a2e1a', lightX: -1,
    fx: { eyeS: 1.06, w: 1.04, nose: 'std', noseS: 0.9 },
  }, { expr: 'neutral', iris: '#5a4a32' });

  // hooded traitors (faces mostly in shadow)
  T.thug = (p, v = 0) => person(Object.assign({
    kind: 'man', dims: { shX: 170, wX: 146, sw: 88 }, skin: ['#c89a7a', '#d8aa8a'][v % 2], hood: ['#26222a', '#2e2420'][v % 2], hair: '#1a1410', beard: v % 2 ? '#2a1e16' : null, beardStyle: 'short',
    tunic: '#2a2622', sleeve: '#26221e', legs: '#1a1612', feet: '#120e0a', belt: '#1a1410', leatherBelt: true, lightX: 1, stubble: 1,
    fx: v % 2 ? { w: 1.04, jaw: 1.1, nose: 'broad', eyeS: 0.86, browT: 1.4 } : { w: 0.94, len: 1.08, nose: 'hook', eyeS: 0.9, hooded: 0.6, hollow: 0.7 },
  }, p, { face: face({ expr: 'grim', iris: '#3a3028' }, p) }));

  G.TCAST = T;
})(window);
