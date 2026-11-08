// Cast for "The Stoker" (Titanic). New faces for everyone: the stoker, his crew, the captain, the officer, the rich.
(function (G) {
  const { person } = G.RIG, K0 = G.CAST;
  const Q = {};
  const face = (base, p) => Object.assign({}, base, p.face || {}, p.blink ? { lid: Math.max((p.face && p.face.lid) ?? base.lid ?? 0.25, p.blink) } : {});
  const mk = (base, faceBase) => p => person(Object.assign({}, base, p, { fx: Object.assign({}, base.fx, p.fx || {}), face: face(faceBase, p) }));
  Q.blink = K0.blink; Q.talk = K0.talk; Q.breath = K0.breath;

  // YOU: a broad-shouldered young stoker. Square heavy jaw, broken broad nose, thick low brows, small deep-set eyes,
  // a scar, short black hair, black stubble; grimy sleeveless undershirt (bare sooty arms), dark work trousers, leather boots.
  // the undershirt is tucked in at the belt (hem at the waist), so the dark work trousers show from the waist down
  const STOKER = { kind: 'man', tunic: '#bdb4a0', sleeve: '#b8886a', legs: '#3e3832', feet: '#2a1a10', belt: '#2a1c12', leatherBelt: true, buckle: '#6a5a40', dirt: 31, lightX: -1 };
  const TUCK = { hemY: -760, hemX: 132 };
  Q.you = mk(Object.assign({}, STOKER, {
    dims: Object.assign({ shX: 176, wX: 136, sw: 92, hand: 118, legX: 58, legW: 84 }, TUCK, { hemX: 140 }), skin: '#b8886a', hair: '#16100c', hairStyle: 'short', hairSeed: 8, stubble: 1, scar: true,
    fx: { w: 1.06, cheek: 0.96, jaw: 1.2, chinW: 1.14, len: 1.0, eyeS: 0.9, eyeH: 0.9, hooded: 0.32, nose: 'broad', noseS: 1.18, browT: 1.45, browArch: -2, browIn: 2, lipT: 1.0, mouthW: 1.02, earS: 0.98 },
  }), { expr: 'grim', iris: '#3a3028' });

  // the trapped crew: each with its own bone structure
  Q.stokerA = mk(Object.assign({}, STOKER, {   // older, bald, walrus moustache, heavy jowls
    dims: Object.assign({ shX: 168, wX: 140, sw: 88, legX: 58, legW: 82 }, TUCK, { hemX: 144 }), skin: '#c0927a', sleeve: '#c0927a', hairStyle: 'bald', hair: '#5a4a3e', mustache: '#6a5a4a', mstyle: 'walrus', stubble: 0.5,
    fx: { w: 1.1, cheek: 1.12, jaw: 1.05, dbl: 0.4, eyeS: 0.88, hooded: 0.6, crow: 1, nose: 'long', noseS: 1.1, browT: 1.2, earS: 1.08 },
  }), { expr: 'fear', iris: '#4a4a40', age: true });
  Q.stokerB = mk(Object.assign({}, STOKER, {   // young and thin, curly hair, big eyes, button nose
    dims: Object.assign({ shX: 150, wX: 120, sw: 76, legX: 52, legW: 76 }, TUCK, { hemX: 124 }), skin: '#a8724c', sleeve: '#a8724c', hair: '#120c08', hairStyle: 'curls', hairSeed: 19, stubble: 0.3,
    fx: { w: 0.92, len: 1.06, jaw: 0.86, chinW: 0.88, eyeS: 1.08, eyeTilt: 2, nose: 'button', noseS: 1.0, lipT: 1.2, earS: 1.12 },
  }), { expr: 'fear', iris: '#2a1a10' });
  Q.stokerC = mk(Object.assign({}, STOKER, {   // heavy-set, full ginger beard, hooked nose
    build: 'fat', dims: Object.assign({}, TUCK, { hemX: 150 }), skin: '#d8a888', sleeve: '#d8a888', hair: '#8a3a1a', hairStyle: 'messy', hairSeed: 44, beard: '#8a3a1a', beardStyle: 'full', stubble: 0,
    fx: { w: 1.04, cheek: 1.06, nose: 'hook', noseS: 1.2, eyeS: 0.95, hooded: 0.4, browT: 1.3, freckles: 0.5 },
  }), { expr: 'fear', iris: '#3a5a4a' });

  // the captain: tall, long face, full white beard, hooded tired eyes; navy coat with gold buttons, white-topped cap
  const BUTTONS = '<g fill="#d8b04a" stroke="#5a4010" stroke-width="2">' + [-1000, -930, -860, -790].map(y => `<circle cx="-34" cy="${y}" r="9"/><circle cx="34" cy="${y}" r="9"/>`).join('') + '</g>';
  Q.captain = mk({
    kind: 'man', dims: { shX: 166, wX: 134, sw: 84, hemY: -560 }, skin: '#d4a084', tunic: '#1a2440', sleeve: '#18213a', legs: '#141a2c', feet: '#0c0c10', belt: false, hair: '#ece8e0', hairStyle: 'short', beard: '#f0ece6', beardStyle: 'full', brow: '#e8e4dc',
    cap: '#1a2034', stubble: 0, lightX: -1, frontProps: BUTTONS,
    fx: { w: 0.98, len: 1.08, cheek: 1.02, jaw: 0.96, eyeS: 0.88, hooded: 0.6, crow: 1, nose: 'std', noseS: 1.08, browT: 1.3, browArch: 2, earS: 1.04 },
  }, { expr: 'grim', iris: '#4a5a6a', age: true, lid: 0.4 });

  // the officer: younger, narrow face, thin clipped moustache, narrow cold eyes, long nose; navy coat and cap
  Q.officer = mk({
    kind: 'man', dims: { shX: 162, wX: 128, sw: 82, hemY: -640, hemX: 140 }, skin: '#e8bca0', tunic: '#1c2848', sleeve: '#1a2542', legs: '#16182a', feet: '#0e0e12', belt: '#0e0e12', leatherBelt: true, buckle: '#c8a040',
    hair: '#2a1c12', hairStyle: 'slick', mustache: '#2a1c12', cap: '#16182a', stubble: 0.2, lightX: 1, frontProps: BUTTONS,
    fx: { w: 0.94, len: 1.06, jaw: 1.0, chinW: 0.92, eyeS: 0.9, eyeH: 0.82, eyeTilt: -3, nose: 'long', noseS: 1.12, lipT: 0.8, mouthW: 0.94, browT: 1.2, browArch: -3 },
  }, { expr: 'stern', iris: '#5a6a5a' });

  // the rich: tailcoat with white shirt front; gowns with fur stoles
  // evening dress: a narrow white shirt front and a white bow tie drawn over the black coat
  const SHIRT = '<path d="M-44,-1130 L44,-1130 L22,-860 L-22,-860Z" fill="#efeae0" stroke="#1a1a1a" stroke-width="2"/><path d="M-30,-1118 L0,-1104 L30,-1118 L30,-1090 L0,-1100 L-30,-1090Z" fill="#f4f2ec" stroke="#1a1a1a" stroke-width="2"/>' +
    '<circle cx="0" cy="-1010" r="5" fill="#d8c070"/><circle cx="0" cy="-950" r="5" fill="#d8c070"/>';
  Q.richMan = mk({
    kind: 'man', dims: { shX: 160, wX: 132, sw: 80, hemY: -620, hemX: 146 }, skin: '#f0c8b0', tunic: '#141418', sleeve: '#141418', legs: '#141418', feet: '#0a0a0a', belt: false, frontProps: SHIRT,
    hair: '#4a3420', hairStyle: 'slick', mustache: '#4a3420', mstyle: 'walrus', stubble: 0, lightX: 1,
    fx: { w: 1.04, cheek: 1.1, jaw: 0.94, dbl: 0.3, eyeS: 0.9, hooded: 0.45, nose: 'button', noseS: 1.15, lipT: 0.9, browT: 1.1 },
  }, { expr: 'neutral', mouth: 'smile', iris: '#4a3a2a', lid: 0.4 });
  Q.richWoman = mk({
    kind: 'woman', skin: '#f2d0bc', tunic: '#5a1a3a', hair: '#3a2414', hairStyle: 'bob', mantle: '#ece4d8', mantleW: 1.15, mantleDrop: 60, belt: false, lightX: 1,
    fx: { w: 0.96, cheek: 1.04, jaw: 0.86, eyeS: 1.02, eyeTilt: 3, nose: 'std', noseS: 0.9, lipT: 1.15, mouthW: 0.95, mole: [-34, 30] },
  }, { expr: 'neutral', mouth: 'smile', iris: '#3a4a5a', lid: 0.35 });
  Q.richMan2 = mk({
    kind: 'man', dims: { shX: 156, wX: 126, sw: 78, hemY: -620, hemX: 140 }, skin: '#e8bfa4', tunic: '#18161e', sleeve: '#18161e', legs: '#18161e', feet: '#0a0a0a', belt: false, frontProps: SHIRT,
    hair: '#c8c0b0', hairStyle: 'receding', beard: '#c8c0b0', beardStyle: 'pointed', stubble: 0, lightX: -1,
    fx: { w: 0.9, len: 1.1, jaw: 0.9, eyeS: 0.86, hooded: 0.5, crow: 1, nose: 'hook', noseS: 1.15, browT: 1.0, browArch: 4 },
  }, { expr: 'neutral', mouth: 'smile', iris: '#5a5a4a', age: true });
  Q.richWoman2 = mk({
    kind: 'woman', skin: '#e6c0a8', tunic: '#1a4a40', hair: '#b88a4a', hairStyle: 'bob', mantle: '#f0ece4', mantleW: 1.1, mantleDrop: 50, belt: false, lightX: -1,
    fx: { w: 1.02, cheek: 1.08, jaw: 0.9, eyeS: 0.96, nose: 'button', noseS: 1.0, lipT: 1.0, freckles: 0.2 },
  }, { expr: 'neutral', mouth: 'smile', iris: '#2a4a3a' });

  G.QCAST = Q;
})(window);
