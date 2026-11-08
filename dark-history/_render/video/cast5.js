// Cast for "The Leech Collector". New faces: a gaunt, cold young labourer and a fat, smug town doctor.
(function (G) {
  const { person } = G.RIG, K0 = G.CAST;
  const Q = {};
  const face = (base, p) => Object.assign({}, base, p.face || {}, p.blink ? { lid: Math.max((p.face && p.face.lid) ?? base.lid ?? 0.25, p.blink) } : {});
  const mk = (base, faceBase) => p => person(Object.assign({}, base, p, { fx: Object.assign({}, base.fx, p.fx || {}), face: face(faceBase, p) }));
  Q.blink = K0.blink; Q.talk = K0.talk; Q.breath = K0.breath;

  // YOU: a thin young leech gatherer. Long hollow face, narrow jaw, deep tired hooded eyes, big ears, freckles,
  // reddish-brown messy hair, stubble; grey-brown smock to the knee, bare legs and feet.
  Q.you = mk({
    kind: 'man', dims: { shX: 150, wX: 118, hemX: 146, sw: 74, hand: 110 }, skin: '#d9a888', hair: '#5a2e18', hairStyle: 'messy', hairSeed: 37, stubble: 0.7,
    tunic: '#7e745e', sleeve: '#766c56', legs: null, feet: '#c89878', belt: '#4a3420', patch: 11, dirt: 23, lightX: -1,
    fx: { w: 0.92, len: 1.08, cheek: 0.94, jaw: 0.86, chinW: 0.88, chin: 1.06, hollow: 0.7, eyeS: 0.96, eyeW: 1.04, hooded: 0.45, lidAdd: 0.05, crow: 0.4,
      nose: 'std', noseS: 1.12, noseL: 1.08, browT: 0.9, browArch: 2, lipT: 0.82, mouthW: 0.96, earS: 1.16, freckles: 0.45 },
  }, { expr: 'tired', iris: '#5a6a5a' });

  // the town doctor: fat round face, double chin, small piggy eyes, button nose flushed red, thin smug mouth,
  // grey receding hair with long sideburns; crimson coat (the authority colour) over a cream waistcoat
  Q.doctor = mk({
    kind: 'man', build: 'fat', skin: '#e8b898', hair: '#b4aca0', hairStyle: 'receding', brow: '#9a9288', stubble: 0,
    tunic: '#8a1c24', sleeve: '#7c1820', legs: '#2a2220', feet: '#1a1410', belt: '#e8dcc0', buckle: '#d8b04a', leatherBelt: true, lightX: 1,
    fx: { w: 1.14, cheek: 1.2, jaw: 1.08, chinW: 1.1, len: 0.96, eyeS: 0.8, eyeH: 0.9, hooded: 0.35, nose: 'button', noseS: 1.3, lipT: 0.75, mouthW: 0.92, dbl: 0.75, earS: 0.95, mole: [36, 40] },
  }, { expr: 'neutral', mouth: 'smile', iris: '#4a3a2a', age: true, blush: 0.35, lid: 0.38 });

  G.QCAST = Q;
})(window);
