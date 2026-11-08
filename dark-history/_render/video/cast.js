// Cast for "The Messenger". Each builder takes animation params and returns RIG.person(...) output.
(function (G) {
  const { person, OUT, NS, ol, shade, f } = G.RIG;
  const K = {};

  // blink helper: returns lid value (1 = closed) given time and a seed so characters blink independently
  K.blink = (t, seed = 0, base = null) => {
    const period = 3.1 + (seed % 5) * 0.37, ph = ((t + seed * 0.71) % period) / period;
    const b = ph > 0.955 ? Math.sin((ph - 0.955) / 0.045 * Math.PI) : 0;
    return b;
  };
  // talking mouth openness from time (syllable-ish rhythm)
  K.talk = (t, amp = 1, rate = 7.5) => Math.max(0, (Math.sin(t * rate) * 0.5 + 0.5) * (0.55 + 0.45 * Math.sin(t * rate * 0.37 + 1.3)) * amp);
  K.breath = t => Math.sin(t * 2.1);

  const face = (base, p) => Object.assign({}, base, p.face || {}, p.blink ? { lid: Math.max(p.face?.lid ?? base.lid ?? 0.25, p.blink) } : {});

  // The messenger ("you"): young, lean, nervous; royal blue tabard with gold crown, satchel.
  K.messenger = p => person(Object.assign({
    kind: 'man', dims: { shX: 150, wX: 122, hemX: 150, sw: 74, hand: 108 }, skin: '#efc3a4', tunic: '#d8cdb3', sleeve: '#d2c6aa', legs: '#4a3b2e', feet: '#3a2618',
    hair: '#5a3a22', hairSeed: 11, stubble: 0, tabard: { col: '#2b4a8a', trim: '#cfa441' }, strap: '#6e4a2a', belt: '#4a2e1a', leatherBelt: true, lightX: -1,
  }, p, { face: face({ expr: 'anxious', iris: '#5b6e86' }, p) }));

  // Our king: smug, petty trickster; crimson robe, ermine, crown, curled mustache & goatee.
  K.king = p => person(Object.assign({
    kind: 'man', dims: { shX: 158, wX: 132, sw: 80 }, robe: true, skin: '#e9bf9f', tunic: '#7d1c2a', sleeve: '#6e1824', hair: '#1c1612', hairSeed: 5,
    beard: '#1c1612', beardStyle: 'goatee', crown: true, mantle: '#efe9dc', ermine: true, mantleW: 1.18, mantleDrop: 110, belt: '#c9a040', leatherBelt: true, buckle: '#f0d070', lightX: -1,
  }, p, { face: face({ expr: 'neutral', mouth: 'smirk', lid: 0.42, iris: '#56683a', brows: [4, -6] }, p) }));

  // The warlord: huge, fat, bald, red braided beard, scar, wolf-fur cloak.
  K.warlord = p => person(Object.assign({
    kind: 'man', build: 'fat', skin: '#d79c7a', tunic: '#4a3a2a', sleeve: '#3e3024', legs: '#2c241e', feet: '#1e1610', hairStyle: 'bald', beard: '#8e3c1c', beardStyle: 'braided',
    scar: true, paint: '#22324e', mantle: '#5c544c', mantleW: 1.28, mantleDrop: 130, belt: '#2a1a10', leatherBelt: true, buckle: '#8a8a8a', lightX: 1, brow: '#6e2e14', stubble: 0,
  }, p, { face: face({ expr: 'grim', iris: '#4a5a3a', age: true }, p) }));

  K.mother = p => person(Object.assign({
    kind: 'woman', skin: '#e2b496', tunic: '#55503e', wimple: '#d8cfbd', veil: '#46483a', apron: '#b8ae98', belt: false, lightX: -1,
  }, p, { face: face({ expr: 'tired', iris: '#5a6070', age: true }, p) }));

  K.guard = p => person(Object.assign({
    kind: 'man', dims: { shX: 175, wX: 150, sw: 90 }, skin: '#ddb090', tunic: '#7c8088', sleeve: '#80848c', legs: '#35302c', feet: '#221a14', coif: '#80858e', mail: true,
    helmet: '#8e939a', tabard: { col: '#2b4a8a', trim: '#cfa441', emblem: true }, belt: '#2a1a10', leatherBelt: true, lightX: -1, stubble: 1,
  }, p, { face: face({ expr: 'stern', iris: '#4a4038' }, p) }));

  K.herald = p => person(Object.assign({
    kind: 'man', dims: { shX: 150, wX: 126, sw: 76 }, skin: '#e4b898', tunic: '#2b4a8a', sleeve: '#26437c', legs: '#c9a040', feet: '#2a1a10', hair: '#6a4a2a', hairSeed: 21,
    belt: '#2a1a10', leatherBelt: true, lightX: -1, stubble: 1,
  }, p, { face: face({ expr: 'neutral', lid: 0.4, iris: '#4a4038' }, p) }));

  // the warlord's men: fur, iron cap, dark leather
  K.raider = p => person(Object.assign({
    kind: 'man', dims: { shX: 178, wX: 150, sw: 92 }, skin: '#d8a888', tunic: '#4e4234', sleeve: '#463a2e', legs: '#2a221c', feet: '#1a120c', helmet: '#6a6e74',
    hair: '#3a2a1a', beard: '#4a3020', mantle: '#6a5e50', mantleW: 1.1, mantleDrop: 80, belt: '#1e140c', leatherBelt: true, lightX: 1, stubble: 0,
  }, p, { face: face({ expr: 'stern', iris: '#4a4a3a' }, p) }));

  G.CAST = K;
})(window);
