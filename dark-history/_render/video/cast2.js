// Cast for "The Whipping Boy". The King IS the grown-up Prince (same face, hair, colours) and the Prince's son
// is drawn exactly like the young Prince: the loop shows the cycle repeating.
(function (G) {
  const { person } = G.RIG, K0 = G.CAST;
  const W = {};
  const face = (base, p) => Object.assign({}, base, p.face || {}, p.blink ? { lid: Math.max((p.face && p.face.lid) ?? base.lid ?? 0.25, p.blink) } : {});
  W.blink = K0.blink; W.talk = K0.talk; W.breath = K0.breath;

  // the whipping boy at 8: street rags (bare feet, patched, messy hair) or palace silk
  W.boy = p => person(Object.assign({ kind: 'kid', skin: '#efc6a6', hair: '#4a2e1c', hairSeed: 14, stubble: 0, lightX: -1 },
    p.rags ? { hairStyle: 'messy', tunic: '#7d6e55', sleeve: '#74664e', patch: 5, dirt: 9, belt: '#8a7a54' }
           : { tunic: '#2c6d8c', sleeve: '#2c6d8c', tabard: { col: '#1f5f7f', trim: '#d8b04a', emblem: false }, legs: '#e6dccb', feet: '#3a2618', belt: '#c9a040', leatherBelt: true, buckle: '#f0d070' },
    p, { face: face({ expr: 'anxious', iris: '#5b6e86' }, p) }));

  // the whipping boy at 18: same hair and colours, worn silk, a pale old scar
  W.man = p => person(Object.assign({
    kind: 'man', dims: { shX: 150, wX: 122, hemX: 150, sw: 74, hand: 108 }, skin: '#ecc2a2', hair: '#4a2e1c', hairSeed: 14, stubble: 0.6, scar: true,
    tunic: '#285a72', sleeve: '#285a72', tabard: { col: '#1d5068', trim: '#b8984a', emblem: false }, legs: '#4a3e30', feet: '#2e1e14', belt: '#6a4a2a', leatherBelt: true, lightX: -1,
  }, p, { face: face({ expr: 'tired', iris: '#5b6e86' }, p) }));

  // the Prince (and later his son): golden curls, circlet, crimson and gold, smug
  W.prince = p => person(Object.assign({
    kind: 'kid', skin: '#f2cdb0', hair: '#dcb24c', hairStyle: 'curls', hairSeed: 22, circlet: '#e2b040', stubble: 0,
    tunic: '#8a1a28', sleeve: '#8a1a28', tabard: { col: '#a01e30', trim: '#e2b040', emblem: true }, legs: '#f0e6d0', feet: '#4a1a12', belt: '#e2b040', leatherBelt: true, buckle: '#fff0b0', lightX: -1,
  }, p, { face: face({ expr: 'neutral', mouth: 'smirk', lid: 0.42, iris: '#3a6aa0', brows: [3, -5] }, p) }));

  // the King = the Prince grown up: golden curls and beard, crown, crimson robe, ermine
  W.king = p => person(Object.assign({
    kind: 'man', dims: { shX: 160, wX: 135, sw: 80 }, robe: true, skin: '#eec6a6', hair: '#d4a842', hairStyle: 'curls', hairSeed: 22, beard: '#c8983a',
    crown: true, mantle: '#efe9dc', ermine: true, mantleW: 1.18, mantleDrop: 110, tunic: '#8e1c2a', sleeve: '#7a1824', belt: '#c9a040', leatherBelt: true, buckle: '#f0d070', lightX: -1,
  }, p, { face: face({ expr: 'neutral', mouth: 'smirk', lid: 0.4, iris: '#3a6aa0', brows: [3, -5] }, p) }));

  // the royal tutor: gaunt scholar in black, skullcap, long grey beard
  W.tutor = p => person(Object.assign({
    kind: 'man', dims: { shX: 140, wX: 112, hemX: 150, sw: 72, hand: 110 }, robe: true, skin: '#e0bea4', tunic: '#1f1c24', sleeve: '#1a171e', hair: '#9a948c', hairSeed: 8,
    cap: '#141216', beard: '#bdb7ac', beardStyle: 'long', brow: '#d0ccc4', belt: '#3a2a1a', lightX: -1, stubble: 0,
  }, p, { face: face({ expr: 'stern', iris: '#4a4a40', age: true, lid: 0.45 }, p) }));

  // palace guards in purple and gold
  W.guard = p => K0.guard(Object.assign({ tabard: { col: '#4a2a6a', trim: '#d8b04a', emblem: true }, sleeve: '#80848c' }, p));
  // courtiers / tailor (rich clothes)
  W.courtier = (p, v = 0) => K0.herald(Object.assign([
    { tunic: '#2a5a3a', sleeve: '#244e32', legs: '#d8c890', hair: '#3a2a1a', hairSeed: 31 },
    { tunic: '#6a2a5a', sleeve: '#5a2450', legs: '#2a2a2a', hair: '#8a6a3a', hairSeed: 33 },
    { tunic: '#7a5a2a', sleeve: '#6a4e24', legs: '#3a3a4a', hair: '#9a9a96', hairSeed: 35 },
  ][v % 3], p));
  W.maid = p => K0.mother(Object.assign({ wimple: '#efe8da', veil: '#6a5a7a', tunic: '#6a5a7a', apron: '#e8e0cc' }, p));
  G.WCAST = W;
})(window);

