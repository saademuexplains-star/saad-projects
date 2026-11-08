// Cast for "The Calf's Blood" (Paris, 1667). All new faces: you (a gaunt wild-haired madman, later calm), the king's
// young doctor in a curled periwig and lace cravat, his bald old surgeon, your wife (tender, then cold), an old
// neighbour, a priest, two porters, the three judges, guards, and a pamphlet crier.
(function (G) {
  const { person } = G.RIG, K0 = G.CAST;
  const Q = {};
  const face = (base, p) => Object.assign({}, base, p.face || {}, p.blink ? { lid: Math.max((p.face && p.face.lid) ?? base.lid ?? 0.2, p.blink) } : {});
  const mk = (base, faceBase) => p => person(Object.assign({}, base, p, { fx: Object.assign({}, base.fx, p.fx || {}), face: face(faceBase, p) }));
  Q.blink = K0.blink; Q.talk = K0.talk; Q.breath = K0.breath;

  // ---- YOU: a gaunt, hollow-cheeked man with burning eyes, a tangle of black hair, a ragged beard, a torn shirt, bare feet
  Q.you = mk({ kind: 'man', dims: { shX: 156, wX: 124, sw: 78, hand: 112 }, skin: '#d6a888', tunic: '#7c7e78', sleeve: '#76786f', legs: '#4a3c2e', feet: '#c89a7a', belt: '#4a3420',
    dirt: 23, hair: '#1e1612', hairStyle: 'messy', hairSeed: 124, beard: '#1e1612', beardStyle: 'short', stubble: 1, brow: '#140e0a', lightX: -1,
    fx: { w: 0.95, len: 1.08, cheek: 0.9, hollow: 0.55, jaw: 0.98, chinW: 0.95, eyeS: 1.04, eyeTilt: 2, hooded: 0.1, crow: 0.6, nose: 'std', noseS: 1.06, lipT: 0.92, earS: 1.04, browT: 1.3, browArch: 1.2 } },
    { expr: 'fear', iris: '#4a3a22', lid: 0.08 });

  // ---- THE KING'S DOCTOR: young, long narrow face, a curled brown periwig, a pencil moustache, black coat, a lace cravat
  const JABOT = '<path d="M-46,-1196 L46,-1196 L34,-1150 L48,-1112 L24,-1076 L36,-1040 L0,-1000 L-36,-1040 L-24,-1076 L-48,-1112 L-34,-1150Z" fill="#f4f0e6" stroke="#8a8478" stroke-width="2.5"/>' +
    [-1150, -1112, -1076, -1040].map(y => `<path d="M-40,${y} Q0,${y + 14} 40,${y}" stroke="#c8c2b4" stroke-width="2.5" fill="none"/>`).join('') + '<rect x="-30" y="-1206" width="60" height="16" rx="6" fill="#ece6d8" stroke="#8a8478" stroke-width="2"/>';
  const COATBTN = [-980, -920, -860, -800, -740, -680].map(y => `<circle cx="0" cy="${y}" r="7" fill="#c9a040" stroke="#5a4010" stroke-width="1.5"/>`).join('');
  Q.doctor = mk({ kind: 'man', dims: { shX: 150, wX: 120, sw: 76, hemY: -400, hemX: 176, hand: 108 }, skin: '#e8c2a4', tunic: '#1e1c22', sleeve: '#1e1c22', legs: '#24222a', feet: '#141216', belt: false,
    hair: '#5a3a1e', hairStyle: 'curls', hairSeed: 131, mustache: '#3a2414', brow: '#3a2414', stubble: 0, lightX: -1, frontProps: JABOT + COATBTN,
    fx: { w: 0.93, len: 1.1, cheek: 0.96, jaw: 0.9, chinW: 0.86, eyeS: 0.92, eyeTilt: -2, hooded: 0.22, crow: 0.2, nose: 'long', noseS: 1.06, lipT: 0.75, earS: 0.96, browT: 1.05, browArch: 1.5 } },
    { expr: 'stern', iris: '#5a4430', lid: 0.22 });

  // ---- THE SURGEON: older, bald with a grey fringe, round red face, broad nose, a leather apron over a brown shirt
  Q.surgeon = mk({ kind: 'man', build: 'fat', dims: { hand: 120 }, skin: '#e6a888', tunic: '#6a5a44', sleeve: '#d8ccb4', legs: '#3a3026', feet: '#1e1610', apron: '#6a4a2a', belt: false,
    hair: '#a8a49a', hairStyle: 'receding', hairSeed: 141, brow: '#8a867c', stubble: 0.7, lightX: -1,
    fx: { w: 1.1, cheek: 1.12, jaw: 1.08, chinW: 1.06, eyeS: 0.86, hooded: 0.35, crow: 1.0, nose: 'broad', noseS: 1.14, lipT: 1.0, earS: 1.1, dbl: 0.4 } },
    { expr: 'neutral', iris: '#5a6a7a', lid: 0.26, blush: 0.35 });

  // ---- YOUR WIFE: thin, sharp cheekbones, narrow up-tilted green eyes, dark hair under a linen cap, a grey dress, white fichu
  const FICHU = '<path d="M-74,-1150 C-50,-1110 -24,-1084 0,-1070 C24,-1084 50,-1110 74,-1150 L62,-1166 C40,-1132 20,-1112 0,-1102 C-20,-1112 -40,-1132 -62,-1166Z" fill="#ece6d8" stroke="#8a8478" stroke-width="2"/>';
  Q.wife = mk({ kind: 'woman', skin: '#e4bc9e', tunic: '#4e4842', sleeve: '#5a544c', apron: '#cfc6b0', kerchief: '#ece6d8', hair: '#2e2018', hairStyle: 'bob', brow: '#24180e', belt: false, lightX: 1, frontProps: FICHU,
    fx: { w: 0.92, len: 1.08, cheek: 0.94, hollow: 0.3, jaw: 0.88, chinW: 0.86, eyeS: 0.94, eyeTilt: 6, hooded: 0.24, nose: 'std', noseS: 1.0, lipT: 0.85, mouthW: 0.95, browArch: 1.2, browT: 1.0 } },
    { expr: 'anxious', iris: '#4a5a3e', lid: 0.2 });

  // ---- THE OLD NEIGHBOUR: a round, kind, deeply lined face under a brown hood
  Q.neighbor = mk({ kind: 'woman', skin: '#e0b494', tunic: '#5a4a36', sleeve: '#6a5a44', apron: '#bfb49c', hood: '#5a4030', hair: '#c8c4bc', brow: '#a8a49a', belt: false, lightX: 1,
    fx: { w: 1.08, cheek: 1.1, jaw: 1.0, eyeS: 0.88, hooded: 0.4, crow: 1.5, hollow: 0.2, nose: 'button', noseS: 1.04, lipT: 0.8, age: 0.7 } },
    { expr: 'grief', iris: '#4a3a2a', lid: 0.3 });

  // ---- THE PRIEST: long pale face, grey receding hair, black cassock, white collar bands
  const BANDS = '<path d="M-22,-1196 L-4,-1196 L-8,-1110 L-26,-1112Z M4,-1196 L22,-1196 L26,-1112 L8,-1110Z" fill="#f4f0e6" stroke="#8a8478" stroke-width="2"/>';
  Q.priest = mk({ kind: 'man', dims: { hand: 108 }, skin: '#e8ccb4', tunic: '#141216', sleeve: '#141216', legs: '#141216', feet: '#0c0a0a', robe: true, belt: false, cap: '#141216', hair: '#5a564e', hairStyle: 'short', hairSeed: 151, brow: '#4a463e', stubble: 0, lightX: -1, frontProps: BANDS,
    fx: { w: 0.94, len: 1.14, cheek: 0.92, hollow: 0.35, jaw: 0.94, chinW: 0.92, eyeS: 0.9, hooded: 0.45, crow: 0.9, nose: 'long', noseS: 1.1, lipT: 0.7, earS: 1.06 } },
    { expr: 'grief', iris: '#5a5a5a', lid: 0.36 });

  // ---- TWO PORTERS who hold you down: one black-bearded and heavy-browed, one red-haired in a cap
  Q.porterA = mk({ kind: 'man', dims: { shX: 176, wX: 146, hand: 124 }, skin: '#c8987a', tunic: '#7a6a52', sleeve: '#6a5a44', legs: '#3a3026', feet: '#1e1610', leatherBelt: true, belt: '#2a1a0e', hair: '#141010', hairStyle: 'bald', hairSeed: 161, beard: '#141010', beardStyle: 'goatee', mustache: '#141010', stubble: 0.9, brow: '#0e0a08', lightX: -1,
    fx: { w: 1.08, jaw: 1.14, chinW: 1.1, eyeS: 0.84, hooded: 0.3, nose: 'broad', noseS: 1.12, browT: 1.5, browArch: -0.6, earS: 1.06 } }, { expr: 'grim', iris: '#2a1e14', lid: 0.3 });
  Q.porterB = mk({ kind: 'man', dims: { hand: 116 }, skin: '#ecc0a2', tunic: '#5a6a4a', sleeve: '#4e5e40', legs: '#3a3026', feet: '#1e1610', cap: '#6a2a1e', belt: '#2a1a0e', hair: '#a8582a', hairStyle: 'short', hairSeed: 171, brow: '#8a4a22', stubble: 0.5, lightX: -1,
    fx: { w: 0.98, len: 1.02, cheek: 1.02, jaw: 0.96, eyeS: 0.98, nose: 'button', noseS: 1.0, lipT: 1.05, earS: 1.12, freckles: 0.6 } }, { expr: 'neutral', iris: '#5a7a8a', lid: 0.24 });

  // ---- THE JUDGES: red robes, black caps, white bands; the presiding judge old and heavy-jowled with a white beard
  const JUDGE = { tunic: '#8a1418', sleeve: '#7a1216', legs: '#1a1416', feet: '#0c0a0a', robe: true, belt: false, cap: '#141012', frontProps: BANDS, lightX: -1 };
  Q.judge = mk(Object.assign({ kind: 'man', build: 'fat', dims: { hand: 116 }, skin: '#e0b49a', hair: '#e2ded6', hairStyle: 'long', hairSeed: 181, beard: '#e8e4dc', beardStyle: 'long', brow: '#d8d4cc',
    fx: { w: 1.08, len: 1.04, cheek: 1.06, jaw: 1.1, eyeS: 0.82, hooded: 0.55, crow: 1.4, nose: 'hook', noseS: 1.12, lipT: 0.8, earS: 1.12, dbl: 0.6 } }, JUDGE), { expr: 'stern', iris: '#6a6a5a', lid: 0.42 });
  Q.judge2 = mk(Object.assign({ kind: 'man', dims: { hand: 110 }, skin: '#e6c4ac', hair: '#3a2a1a', hairStyle: 'curls', hairSeed: 191, mustache: '#3a2a1a', brow: '#2a1a0e', stubble: 0,
    fx: { w: 0.96, len: 1.06, cheek: 0.98, jaw: 0.96, eyeS: 0.94, hooded: 0.3, nose: 'std', noseS: 1.04, lipT: 0.9 } }, JUDGE), { expr: 'stern', iris: '#3a2a1a', lid: 0.3 });
  Q.judge3 = mk(Object.assign({ kind: 'man', dims: { hand: 110 }, skin: '#d8b498', hair: '#7a766e', hairStyle: 'bald', brow: '#6a665e', stubble: 0.3,
    fx: { w: 0.9, len: 1.12, cheek: 0.88, hollow: 0.45, jaw: 0.9, chinW: 0.86, eyeS: 0.88, hooded: 0.4, crow: 1.1, nose: 'long', noseS: 1.14, lipT: 0.7, earS: 1.14 } }, JUDGE), { expr: 'stern', iris: '#4a4a3a', lid: 0.38 });

  // ---- GUARDS of the court: blue coats, steel helmets
  Q.guard = mk({ kind: 'man', dims: { hand: 116 }, skin: '#d0a080', tunic: '#2a3a6a', sleeve: '#24325c', legs: '#2a2420', feet: '#1a1410', tabard: { col: '#2a3a6a', trim: '#c9a040' }, helmet: '#8a8e94', helmetStyle: 'nasal', hair: '#3a2a1a', hairStyle: 'short', mustache: '#3a2a1a', mstyle: 'walrus', brow: '#2a1a0e', belt: false, lightX: -1,
    fx: { w: 1.02, jaw: 1.1, eyeS: 0.86, nose: 'broad', noseS: 1.08 } }, { expr: 'grim', iris: '#3a2a1a', lid: 0.32 });

  Q.guard2 = mk({ kind: 'man', dims: { hand: 118 }, skin: '#e2b494', tunic: '#2a3a6a', sleeve: '#24325c', legs: '#2a2420', feet: '#1a1410', tabard: { col: '#2a3a6a', trim: '#c9a040' }, helmet: '#7a7e84', helmetStyle: 'nasal', hair: '#8a5a2a', hairStyle: 'short', beard: '#8a5a2a', beardStyle: 'pointed', brow: '#6a4220', belt: false, lightX: -1,
    fx: { w: 0.92, len: 1.1, cheek: 0.9, hollow: 0.4, jaw: 0.92, chinW: 0.86, eyeS: 0.9, eyeTilt: -3, hooded: 0.4, nose: 'hook', noseS: 1.12, lipT: 0.7, earS: 1.0 } }, { expr: 'grim', iris: '#5a6a4a', lid: 0.36 });

  // ---- THE PAMPHLET CRIER: a cheerful lad in a red cap, freckles
  Q.crier = mk({ kind: 'man', dims: { shX: 144, wX: 116, hand: 106 }, skin: '#f0caa8', tunic: '#a87a3a', sleeve: '#9a6e34', legs: '#4a3a2a', feet: '#2a1a10', cap: '#a82a1e', belt: '#3a2414', hair: '#c8903a', hairStyle: 'short', hairSeed: 201, brow: '#a8702a', stubble: 0, lightX: -1,
    fx: { w: 0.98, len: 0.96, cheek: 1.06, jaw: 0.9, chinW: 0.9, eyeS: 1.04, nose: 'button', noseS: 0.94, lipT: 1.1, mouthW: 1.08, earS: 1.1, freckles: 0.8 } }, { expr: 'neutral', iris: '#4a6a8a', lid: 0.16 });

  Q.HAND = { you: 112, doctor: 108, surgeon: 120, wife: 104, neighbor: 104, priest: 108, porterA: 124, porterB: 116, judge: 116, judge2: 110, judge3: 110, guard: 116, guard2: 118, crier: 106 };
  G.QCAST = Q;
})(window);
