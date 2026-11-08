// Cast for "The Worm" (Guinea worm / Rod of Asclepius). New faces: every character has its own structure.
(function (G) {
  const { person } = G.RIG, K0 = G.CAST;
  const Q = {};
  const face = (base, p) => Object.assign({}, base, p.face || {}, p.blink ? { lid: Math.max((p.face && p.face.lid) ?? base.lid ?? 0.25, p.blink) } : {});
  const mk = (base, faceBase) => p => person(Object.assign({}, base, p, { fx: Object.assign({}, base.fx, p.fx || {}), face: face(faceBase, p) }));
  Q.blink = K0.blink; Q.talk = K0.talk; Q.breath = K0.breath;

  // YOU: a young labourer. Square jaw, broad nose, heavy brows, full lips, tight black curls; linen tunic, bare legs.
  Q.you = mk({
    kind: 'man', dims: { shX: 160, wX: 128, hemX: 150, sw: 80, hand: 112 }, skin: '#9c6a46', hair: '#18110c', hairStyle: 'curls', hairSeed: 52, stubble: 0.9,
    tunic: '#d9ceb2', sleeve: '#d2c6a8', legs: null, feet: '#8e5e3e', belt: '#7a4a24', lightX: -1,
    fx: { w: 1.03, cheek: 1.05, jaw: 1.1, chinW: 1.08, eyeS: 1.0, nose: 'broad', noseS: 1.05, browT: 1.3, browArch: -1, lipT: 1.25, mouthW: 1.05, earS: 1.05 },
  }, { expr: 'neutral', iris: '#3a2a1a' });
  // the same man after thirty days in the healer's hut: a beard has grown
  Q.youBeard = p => Q.you(Object.assign({ beard: '#1c140e', beardStyle: 'short', stubble: 0 }, p));

  // the water seller: round heavy old face, big hooked nose, small hooded eyes, grey beard, turban, striped robe
  Q.seller = mk({
    kind: 'man', build: 'fat', robe: true, skin: '#b07a52', hair: '#8a8278', turban: '#e2d6b8', beard: '#a8a29a', beardStyle: 'full', brow: '#9a948a',
    tunic: '#7a5a34', sleeve: '#6e5230', belt: '#3a2a1a', leatherBelt: true, lightX: -1, stubble: 0,
    fx: { w: 1.1, cheek: 1.14, jaw: 1.02, nose: 'hook', noseS: 1.28, eyeS: 0.84, eyeH: 0.86, hooded: 0.55, crow: 1, dbl: 0.4, browT: 1.2 },
  }, { expr: 'neutral', mouth: 'smile', iris: '#3a2e22', age: true });

  // the village healer: gaunt and long-faced, deep-set hooded eyes, long nose, white bushy brows, receding white hair,
  // short white beard, a mole on the cheek, bead necklace
  Q.healer = mk({
    kind: 'man', robe: true, dims: { shX: 142, wX: 112, hemX: 150, sw: 72, hand: 112 }, skin: '#7e5234', hair: '#e8e2d6', hairStyle: 'receding', beard: '#ece6da', beardStyle: 'short', noSideburns: true, brow: '#f0ece4',
    tunic: '#5a4632', sleeve: '#524028', belt: '#2a1c10', lightX: -1, stubble: 0,
    fx: { w: 0.88, len: 1.1, cheek: 1.06, jaw: 0.84, chinW: 0.85, hollow: 0.85, eyeS: 0.9, hooded: 0.75, nose: 'long', noseS: 1.15, crow: 1, browT: 1.5, browArch: 3, mole: [-40, 26] },
  }, { expr: 'stern', iris: '#2a2018', age: true, lid: 0.38 });

  // market folk
  Q.basketWoman = mk({
    kind: 'woman', skin: '#a8724a', tunic: '#2a5a7a', kerchief: '#b8402a', hair: '#1a1210', apron: null, belt: false, lightX: -1,
    fx: { w: 0.97, cheek: 1.08, jaw: 0.88, eyeS: 1.08, eyeTilt: 3, nose: 'std', noseS: 0.95, lipT: 1.2 },
  }, { expr: 'neutral', iris: '#2a2018' });
  Q.merchant = mk({
    kind: 'man', dims: { shX: 158, wX: 132, sw: 80 }, skin: '#c08a5e', turban: '#3a5a3a', hair: '#1a1410', mustache: '#1a1410', stubble: 0.6,
    tunic: '#8a3a22', sleeve: '#7a321e', legs: '#d8cbb0', feet: '#4a3220', belt: '#d8b04a', lightX: -1,
    fx: { w: 0.96, len: 1.06, jaw: 0.96, nose: 'long', noseS: 1.0, eyeS: 0.95, eyeTilt: 2, browT: 1.1 },
  }, { expr: 'neutral', mouth: 'talk', iris: '#2a2018' });
  Q.kid = mk({
    kind: 'kid', skin: '#8e5a38', hair: '#140e0a', hairStyle: 'messy', hairSeed: 61, stubble: 0, tunic: '#c8b890', sleeve: '#bca880', legs: null, feet: null, belt: '#6a4424', lightX: -1,
    fx: { eyeS: 1.12, w: 1.04, nose: 'button' },
  }, { expr: 'neutral', mouth: 'grin', iris: '#2a1a10' });
  // his wife (the year passing)
  Q.wife = mk({
    kind: 'woman', skin: '#a06a46', tunic: '#6a3a4a', kerchief: '#d8c8a0', hair: '#140e0a', apron: '#c8b890', belt: false, lightX: -1,
    fx: { w: 1.0, cheek: 1.04, jaw: 0.9, eyeS: 1.04, nose: 'button', noseS: 1.05, lipT: 1.1, freckles: 0.3 },
  }, { expr: 'neutral', mouth: 'smile', iris: '#2a1a10' });

  G.QCAST = Q;
})(window);
