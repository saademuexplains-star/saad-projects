// Cast for "The First Vaccine" (Gloucestershire, 1796). New faces for everyone: you (a boy of eight), the village
// doctor, the milkmaid with cowpox, your mother, the dying man, and the villagers of the plague street.
(function (G) {
  const { person } = G.RIG, K0 = G.CAST;
  const Q = {};
  const face = (base, p) => Object.assign({}, base, p.face || {}, p.blink ? { lid: Math.max((p.face && p.face.lid) ?? base.lid ?? 0.25, p.blink) } : {});
  const mk = (base, faceBase) => p => person(Object.assign({}, base, p, { fx: Object.assign({}, base.fx, p.fx || {}), face: face(faceBase, p) }));
  Q.blink = K0.blink; Q.talk = K0.talk; Q.breath = K0.breath;

  // YOU: a boy of eight. Tousled chestnut hair, round cheeks, big blue eyes, a straight little nose, full lips, big ears.
  // Linen shirt, a brown waistcoat with brass buttons, buttoned breeches from the waist, stockings, buckled shoes.
  const VEST = '<path d="M-92,-596 L-30,-596 L-12,-520 L-6,-404 L-86,-404 L-96,-520Z M92,-596 L30,-596 L12,-520 L6,-404 L86,-404 L96,-520Z" fill="#6a4a2a" stroke="#2a1a0c" stroke-width="2"/>' +
    [-560, -520, -480, -440].map(y => `<circle cx="-18" cy="${y}" r="4.5" fill="#d8b050" stroke="#5a4010" stroke-width="1"/>`).join('') +
    '<path d="M-94,-408 L94,-408 L116,-250 L-116,-250Z" fill="#6a5440" stroke="#2a1e12" stroke-width="2"/><rect x="-96" y="-416" width="192" height="18" rx="4" fill="#5a4634" stroke="#2a1e12" stroke-width="1.5"/><path d="M-30,-398 L30,-398 L28,-300 L-28,-300Z" fill="none" stroke="#3e3024" stroke-width="2.5"/>' +
    [-386, -356, -326].map(y => `<circle cx="-22" cy="${y}" r="3.6" fill="#c8a050"/><circle cx="22" cy="${y}" r="3.6" fill="#c8a050"/>`).join('') + '<path d="M-104,-300 Q-60,-270 -20,-290 M104,-300 Q60,-270 20,-290" stroke="#4a3a2a" stroke-width="4" fill="none" opacity="0.6"/>';
  Q.you = mk({
    kind: 'kid', dims: { hand: 74 }, skin: '#f2c6a2', tunic: '#ece6d8', sleeve: '#e8e2d2', legs: '#6a5440', feet: '#2a1e14', belt: false, props: VEST,
    hair: '#6a3c1e', hairStyle: 'short', hairSeed: 71, brow: '#5a3418', lightX: -1,
    fx: { w: 1.0, cheek: 1.06, jaw: 0.95, eyeS: 1.0, nose: 'std', noseS: 0.92, lipT: 1.15, earS: 1.16 },
  }, { expr: 'anxious', iris: '#3a6aa8', lid: 0.14 });

  // THE DOCTOR: late forties, long face, heavy dark brows, a long straight nose, thin lips, a powdered grey periwig.
  // A dark navy coat, a cream waistcoat, a white linen stock with a lace jabot, breeches, white stockings, black shoes.
  const CRAVAT = '<path d="M-62,-1150 L62,-1150 L48,-830 L-48,-830Z" fill="#e2d4ae" stroke="#3a3020" stroke-width="2"/><path d="M-62,-1150 L-48,-830 M62,-1150 L48,-830" stroke="#a89870" stroke-width="5" opacity="0.5"/>' + [-1050, -990, -930, -870].map(y => `<circle cx="6" cy="${y}" r="5.5" fill="#c8a040" stroke="#5a4010" stroke-width="1"/>`).join('') +
    '<path d="M-50,-1176 Q0,-1160 50,-1176 L48,-1142 Q0,-1128 -48,-1142Z" fill="#f6f4ee" stroke="#5a5a54" stroke-width="2"/><path d="M-20,-1140 C-38,-1112 -32,-1082 -16,-1060 C-28,-1050 -24,-1032 -8,-1024 L10,-1024 C24,-1032 28,-1050 16,-1060 C32,-1082 38,-1112 20,-1140Z" fill="#fbfaf6" stroke="#7a7a72" stroke-width="1.6"/>' +
    [-1116, -1094, -1072, -1048].map(y => `<path d="M-20,${y} q20,8 40,0" stroke="#b8b4aa" stroke-width="1.6" fill="none"/>`).join('');
  Q.doctor = mk({
    kind: 'man', dims: { shX: 160, wX: 128, sw: 80, hemY: -440, hemX: 158, legX: 50, legW: 64, hand: 114 }, skin: '#dcae8a', tunic: '#1e2638', sleeve: '#1a2232', legs: '#e2dacb', feet: '#141010',
    belt: false, props: CRAVAT, hair: '#e4e0d8', hairStyle: 'curls', hairSeed: 23, brow: '#3e3630', stubble: 0.25, lightX: -1,
    fx: { w: 0.97, len: 1.08, cheek: 1.04, jaw: 1.06, chinW: 1.0, eyeS: 0.98, hooded: 0.06, crow: 0.7, nose: 'long', noseS: 1.12, browT: 1.55, browArch: 3, lipT: 0.85, mouthW: 1.04, earS: 1.0, mole: [34, 40] },
  }, { expr: 'stern', iris: '#2e3e52', age: true, lid: 0.16 });

  // THE MILKMAID: young, round soft face, a button nose, full lips, a white mob cap; lavender dress, apron
  Q.milkmaid = mk({
    kind: 'woman', skin: '#f0c8ac', tunic: '#7a5a8a', apron: '#ece4d4', kerchief: '#f4f0e6', hair: '#6a4020', hairStyle: 'bob', brow: '#4a2a14', belt: false, lightX: 1,
    fx: { w: 0.96, cheek: 1.08, jaw: 0.88, eyeS: 1.0, nose: 'button', noseS: 0.92, lipT: 1.2, mouthW: 0.96, freckles: 0.25 },
  }, { expr: 'neutral', iris: '#5a4a30', lid: 0.16 });

  // YOUR MOTHER: your blue eyes, a long gentle face, a white cap; blue-grey dress and apron
  Q.mother = mk({
    kind: 'woman', skin: '#e4b896', tunic: '#4a5a6a', apron: '#e8e0cc', kerchief: '#f0ece0', hair: '#7a5030', hairStyle: 'bob', brow: '#4a2e1a', belt: false, lightX: 1,
    fx: { w: 0.98, len: 1.06, cheek: 1.0, jaw: 0.9, eyeS: 0.95, crow: 0.5, nose: 'std', noseS: 1.0, lipT: 1.0 },
  }, { expr: 'anxious', iris: '#3a6aa8', lid: 0.18 });

  // THE DYING MAN: gaunt, hollow cheeks, heavy lids, a hooked nose, grey stubble, covered in smallpox
  Q.dying = mk({
    kind: 'man', robe: true, dims: { shX: 150, wX: 120, sw: 78 }, skin: '#d8b8a0', tunic: '#cfc6b0', sleeve: '#c8bea6', belt: false, pox: 1, hair: '#3a2a1e', hairStyle: 'messy', hairSeed: 9, stubble: 1, brow: '#2a1e14', lightX: 1,
    fx: { w: 0.94, len: 1.06, cheek: 0.92, jaw: 1.0, hollow: 0.8, eyeS: 0.9, hooded: 0.5, nose: 'hook', noseS: 0.92, browT: 1.2, lipT: 0.8 },
  }, { expr: 'tired', iris: '#4a4a3a', lid: 0.6, age: true });

  // the plague street: a sick woman, a gravedigger, a man collapsing; each face different
  Q.sickWoman = mk({ kind: 'woman', skin: '#e2c2a8', tunic: '#5a4a3a', apron: '#cfc6b0', kerchief: '#8a7a6a', hair: '#3a2a1a', hairStyle: 'bob', belt: false, pox: 0.8, poxSeed: 3, lightX: 1,
    fx: { w: 1.02, cheek: 1.0, jaw: 0.92, eyeS: 0.94, nose: 'long', noseS: 0.95, lipT: 0.9 } }, { expr: 'grief', iris: '#4a3a2a', lid: 0.4 });
  Q.digger = mk({ kind: 'man', dims: { hemY: -480 }, skin: '#b88a68', tunic: '#4a4034', sleeve: '#443a2e', legs: '#3a3228', feet: '#1e140c', belt: '#2a1a10', hair: '#2a2018', hairStyle: 'short', beard: '#2a2018', beardStyle: 'full', lightX: -1,
    fx: { w: 1.08, jaw: 1.12, cheek: 1.04, eyeS: 0.86, nose: 'broad', noseS: 1.08, browT: 1.45, hooded: 0.3 } }, { expr: 'grim', iris: '#3a2a1a', lid: 0.3 });
  Q.sickMan = mk({ kind: 'man', dims: { hemY: -470 }, skin: '#d8b090', tunic: '#6a5a46', sleeve: '#62523e', legs: '#4a4034', feet: '#2a1e14', belt: '#3a2a1a', pox: 1, poxSeed: 7, hair: '#5a3a1e', hairStyle: 'messy', hairSeed: 31, brow: '#3a2414', stubble: 0.8, lightX: -1,
    fx: { w: 0.98, len: 1.04, jaw: 0.96, eyeS: 0.92, hollow: 0.5, nose: 'std', noseS: 1.1, browT: 1.2 } }, { expr: 'fear', iris: '#4a4a3a', lid: 0.45 });

  // a villager hurrying past with a basket: broad face, wide-set eyes, a strong nose, brown kerchief and shawl
  Q.villagerW = mk({ kind: 'woman', skin: '#d8a888', tunic: '#6a3a2a', apron: '#b8ac90', kerchief: '#7a5a3a', hair: '#4a2a1a', hairStyle: 'bob', belt: false, lightX: -1,
    fx: { w: 1.06, cheek: 1.04, jaw: 1.0, eyeS: 0.9, eyeX: 4, nose: 'broad', noseS: 1.05, lipT: 1.0, mouthW: 1.05 } }, { expr: 'fear', iris: '#3a2a1a', lid: 0.2 });

  G.QCAST = Q;
})(window);
