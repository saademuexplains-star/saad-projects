// Cast for "The King's Decoy". All new faces: you (a poor man chosen because you have the king's face), the king himself
// (that same face with a scar through his brow and cold grey eyes), his brother on the ridge, the coachman, the two
// dressing servants, the royal escort, your wife and little daughter in the village, and the mercenaries.
(function (G) {
  const { person, mix } = G.RIG, K0 = G.CAST;
  const Q = {};
  const face = (base, p) => Object.assign({}, base, p.face || {}, p.blink ? { lid: Math.max((p.face && p.face.lid) ?? base.lid ?? 0.2, p.blink) } : {});
  const mk = (base, faceBase) => p => person(Object.assign({}, base, p, { fx: Object.assign({}, base.fx, p.fx || {}), face: face(faceBase, p) }));
  Q.blink = K0.blink; Q.talk = K0.talk; Q.breath = K0.breath;

  // ---- the face you share with the king: long strong face, high cheekbones, deep-set eyes under heavy arched brows,
  // a long straight nose, a full dark auburn beard, a medieval pageboy cut
  const KFX = { w: 1.02, len: 1.07, cheek: 1.08, jaw: 1.04, chinW: 0.98, eyeS: 0.95, eyeTilt: -3, hooded: 0.18, crow: 0.4, nose: 'long', noseS: 1.03, lipT: 0.9, earS: 0.96, browT: 1.45, browArch: 1.6 };
  const KHAIR = { hair: '#5a2e1a', hairStyle: 'bob', hairSeed: 51, beard: '#5a2e1a', beardStyle: 'full', mustache: '#5a2e1a', brow: '#3c1e10' };
  const KDIMS = { shX: 166, wX: 136, sw: 84, hemY: -470, hemX: 172, hand: 116 };
  // royal dress: crimson gown, purple mantle with ermine, a heavy gold chain and medallion, the crown
  const CHAIN = '<path d="M-118,-1120 C-96,-980 -40,-930 0,-918 C40,-930 96,-980 118,-1120" stroke="#5a4010" stroke-width="14" fill="none"/><path d="M-118,-1120 C-96,-980 -40,-930 0,-918 C40,-930 96,-980 118,-1120" stroke="#d8b040" stroke-width="9" fill="none" stroke-dasharray="10 5"/>' +
    '<circle cx="0" cy="-890" r="30" fill="#c9a040" stroke="#5a4010" stroke-width="3"/><circle cx="0" cy="-890" r="17" fill="#8a1a1a" stroke="#5a4010" stroke-width="2"/><circle cx="-6" cy="-896" r="5" fill="#fff" opacity="0.7"/>';
  const ROYAL = { tunic: '#6a1020', sleeve: '#5e0e1c', legs: '#2a1a1a', feet: '#1a1010', robe: true, mantle: '#3a1458', ermine: true, mantleW: 1.22, mantleDrop: 150, crown: '#d6a838', props: CHAIN, leatherBelt: true, belt: '#3a2410', buckle: '#d8b040' };
  // the king's guard disguise: an iron kettle helmet, a leather jerkin over mail, a rough travelling cloak
  const GUARD = { tunic: '#5a4630', sleeve: '#4a3a2a', legs: '#2e2a26', feet: '#1e1610', helmet: '#7e8288', mantle: '#4a4236', mantleW: 1.08, mantleDrop: 60, leatherBelt: true, belt: '#2a1a0e', buckle: '#8a8a80', crown: false, props: '', robe: false, ermine: false };
  const kingBase = Object.assign({ kind: 'man', dims: KDIMS, skin: '#dcae8c', lightX: -1, fx: KFX }, KHAIR);

  // YOU: the same face as his, but warm brown eyes, no scar, a little thinner and more worried
  const youMk = mk(Object.assign({}, kingBase, { fx: Object.assign({}, KFX, { hollow: 0.25, crow: 0.6 }) }), { expr: 'anxious', iris: '#6a4424', lid: 0.18 });
  Q.you = p => youMk(Object.assign({}, p.outfit === 'plain' ? { tunic: '#7a6a52', sleeve: '#6e5e48', robe: true } : ROYAL, p));
  // THE KING: identical, with a white scar through his brow and pale grey eyes that never blink enough
  const kingMk = mk(Object.assign({}, kingBase, { scar: true }), { expr: 'stern', iris: '#8a969a', lid: 0.24 });
  Q.king = p => kingMk(Object.assign({}, p.outfit === 'guard' ? GUARD : ROYAL, p));

  // THE KING'S BROTHER: gaunt, older, hollow cheeks, a hooked nose, a black pointed beard going grey, black and fur
  const BRO = '<path d="M-150,-1100 C-120,-1060 120,-1060 150,-1100 L160,-1050 C120,-1010 -120,-1010 -160,-1050Z" fill="#3a3028" stroke="#120e0a" stroke-width="3"/>' +
    [-140, -110, -80, -50, -20, 10, 40, 70, 100, 130].map(x => `<path d="M${x},-1066 l6,22 l6,-22" fill="#2a221c"/>`).join('') + '<circle cx="0" cy="-1040" r="14" fill="#a8acb0" stroke="#3a3a3a" stroke-width="2"/>';
  Q.brother = mk({ kind: 'man', dims: { shX: 154, wX: 120, sw: 78, hemY: -480, hemX: 160, hand: 112 }, skin: '#d2aa90', tunic: '#18161a', sleeve: '#141216', legs: '#141216', feet: '#0c0a0a',
    mantle: '#1e1818', mantleW: 1.16, mantleDrop: 120, props: BRO, belt: false, hair: '#16120e', hairStyle: 'slick', hairSeed: 61, beard: '#2a2420', beardStyle: 'pointed', mustache: '#2a2420', brow: '#141010', lightX: 1,
    fx: { w: 0.92, len: 1.14, cheek: 0.88, hollow: 0.55, jaw: 0.94, chinW: 0.86, eyeS: 0.86, eyeTilt: 4, hooded: 0.35, crow: 1.1, nose: 'hook', noseS: 1.12, lipT: 0.75, earS: 1.0, browT: 1.2, browArch: 0.7, browIn: 4 } }, { expr: 'stern', iris: '#4a5a46', lid: 0.3 });

  // THE COACHMAN: heavy, red-cheeked, grey walrus moustache, a felt cap and a green driving coat
  Q.driver = mk({ kind: 'man', build: 'fat', dims: { hand: 120 }, skin: '#e0a888', tunic: '#2e4a32', sleeve: '#2a4430', legs: '#3a3026', feet: '#1e1610', cap: '#3a3020', leatherBelt: true, belt: '#2a1a0e', hair: '#8a8478', hairStyle: 'short', hairSeed: 71, mustache: '#a8a49a', mstyle: 'walrus', brow: '#7a766c', lightX: -1,
    fx: { w: 1.12, cheek: 1.14, jaw: 1.1, chinW: 1.1, eyeS: 0.84, hooded: 0.3, nose: 'broad', noseS: 1.15, lipT: 1.0, earS: 1.06 } }, { expr: 'neutral', iris: '#4a5a6a', lid: 0.3, blush: 0.4 });

  // THE DRESSERS: a young valet and an old chamberlain in the royal livery (blue tabard, gold crown badge)
  const LIVERY = { tabard: { col: '#1e3a6a', trim: '#c9a040' }, tunic: '#d8cfba', sleeve: '#1e3a6a', legs: '#1e2a40', feet: '#1a1410', belt: false };
  Q.valet = mk(Object.assign({ kind: 'man', dims: { shX: 148, wX: 118, sw: 74, hand: 108 }, skin: '#e6c0a2', hair: '#b88a4a', hairStyle: 'bob', hairSeed: 81, brow: '#8a6a3a', lightX: -1,
    fx: { w: 0.96, len: 0.98, cheek: 1.0, jaw: 0.92, chinW: 0.9, eyeS: 1.04, nose: 'button', noseS: 0.92, lipT: 1.05, earS: 1.06, freckles: 0.3 } }, LIVERY), { expr: 'neutral', iris: '#5a7a9a', lid: 0.2 });
  Q.chamberlain = mk(Object.assign({ kind: 'man', dims: { shX: 152, wX: 128, sw: 76, hand: 110 }, skin: '#e2b8a0', hair: '#e2ded6', hairStyle: 'receding', hairSeed: 83, brow: '#d8d4cc', beard: '#dcd8d0', beardStyle: 'short', lightX: -1,
    fx: { w: 0.98, len: 1.04, cheek: 0.94, hollow: 0.3, jaw: 0.98, eyeS: 0.88, hooded: 0.4, crow: 1.2, nose: 'hook', noseS: 1.0, lipT: 0.8, earS: 1.08 } }, LIVERY), { expr: 'neutral', iris: '#6a6a5a', lid: 0.32 });

  // THE ESCORT: royal riders in helmets and livery (faces half hidden)
  Q.escort = mk({ kind: 'man', dims: { hand: 114 }, skin: '#d4a684', tunic: '#4a4a50', sleeve: '#3e3e44', legs: '#2e2a26', feet: '#1a1410', tabard: { col: '#1e3a6a', trim: '#c9a040' }, helmet: '#80848a', helmetStyle: 'nasal', hair: '#2a2018', hairStyle: 'short', beard: '#2a2018', beardStyle: 'short', brow: '#1e1610', belt: false, lightX: -1,
    fx: { w: 1.0, jaw: 1.06, eyeS: 0.9, nose: 'broad', earS: 1.0 } }, { expr: 'grim', iris: '#3a2a1a', lid: 0.3 });

  // YOUR WIFE and YOUR DAUGHTER (the village): warm round faces, a russet kerchief, a worn apron; the girl's fair braids
  Q.wife = mk({ kind: 'woman', skin: '#e6b896', tunic: '#6a5a42', sleeve: '#d8cdb4', apron: '#cfc2a4', kerchief: '#8a4a2e', hair: '#5a3a20', hairStyle: 'bob', brow: '#4a2a14', belt: false, lightX: 1,
    fx: { w: 1.04, cheek: 1.1, jaw: 0.94, eyeS: 1.0, nose: 'button', noseS: 0.98, lipT: 1.08, mouthW: 1.02, crow: 0.3 } }, { expr: 'anxious', iris: '#5a3a1a', lid: 0.2 });
  Q.daughter = mk({ kind: 'kid', dims: { hand: 70 }, skin: '#f0caa8', tunic: '#a8724a', sleeve: '#9a6a44', legs: null, feet: '#6a4a2a', robe: true, hair: '#d8b878', hairStyle: 'bob', hairSeed: 91, brow: '#b89058', belt: false, lightX: 1,
    fx: { w: 1.02, cheek: 1.12, jaw: 0.9, chinW: 0.9, eyeS: 1.08, nose: 'button', noseS: 0.9, lipT: 1.0, earS: 1.0, freckles: 0.5 } }, { expr: 'anxious', iris: '#5a3a1a', lid: 0.14 });

  // THE MERCENARIES: hooded hard men (seen against the light)
  Q.merc = mk({ kind: 'man', dims: { hand: 116 }, skin: '#c89c7c', tunic: '#2e2a26', sleeve: '#2a2622', legs: '#26221e', feet: '#140f0a', hood: '#26221e', beard: '#1e1814', beardStyle: 'short', brow: '#120e0a', belt: '#1a120a', leatherBelt: true, lightX: 1,
    fx: { w: 1.06, jaw: 1.12, eyeS: 0.84, hooded: 0.4, nose: 'broad', noseS: 1.1 } }, { expr: 'grim', iris: '#2a2018', lid: 0.34 });

  Q.HAND = { you: 116, king: 116, brother: 112, driver: 120, valet: 108, chamberlain: 110, escort: 114, wife: 104, daughter: 70, merc: 116 };
  G.QCAST = Q;
})(window);
