// Cast for "The Blind Harpist" (Byzantine war room). New faces for everyone: the harpist, the Emperor, his brother,
// two generals and a Varangian guard.
(function (G) {
  const { person } = G.RIG, K0 = G.CAST;
  const Q = {};
  const face = (base, p) => Object.assign({}, base, p.face || {}, p.blink ? { lid: Math.max((p.face && p.face.lid) ?? base.lid ?? 0.25, p.blink) } : {});
  const mk = (base, faceBase) => p => person(Object.assign({}, base, p, { fx: Object.assign({}, base.fx, p.fx || {}), face: face(faceBase, p) }));
  Q.blink = K0.blink; Q.talk = K0.talk; Q.breath = K0.breath;

  // YOU: a young court musician, gaunt from captivity. Long narrow face, narrow pointed chin, high arched brows,
  // long straight nose, full lips, hollow cheeks; unkempt dark hair, stubble. Undyed linen tunic, rope belt, hose, sandals.
  Q.you = mk({
    kind: 'man', robe: true, dims: { shX: 150, wX: 122, sw: 78, hemX: 140, hand: 110 }, skin: '#c69472', tunic: '#cdbf9e', sleeve: '#c6b894',
    belt: '#8a7450', hair: '#21160e', hairStyle: 'short', hairSeed: 27, stubble: 0.75, lightX: -1, dirt: 41,
    fx: { w: 0.93, len: 1.09, cheek: 0.96, jaw: 0.88, chinW: 0.84, eyeS: 1.0, eyeH: 0.95, nose: 'long', noseS: 1.02, noseL: 2, browT: 1.05, browArch: 3, lipT: 1.2, mouthW: 0.95, earS: 1.0, hollow: 0.45 },
  }, { expr: 'neutral', iris: '#4a3a2a' });
  // the healed eyes: clouded pale irises
  Q.IRIS_HEALED = '#8c9498';

  // THE EMPEROR: heavy and old, broad cheeks, double chin, heavy lids, hooked nose, long salt-and-pepper beard.
  // Tyrian purple robe, the jewelled gold loros down the front, gold crown with pearl pendilia.
  const LOROS = (() => {
    let g = '<path d="M-150,-1150 L-56,-1150 L-36,-560 L-36,-30 L36,-30 L36,-560 L56,-1150 L150,-1150 L120,-1080 L52,-1050 L44,-600 L-44,-600 L-52,-1050 L-120,-1080Z" fill="#c89a3a" stroke="#3a2a10" stroke-width="2.4"/>';
    g += '<path d="M-36,-560 L36,-560 L36,-30 L-36,-30Z" fill="#c89a3a" stroke="#3a2a10" stroke-width="2.4"/>';
    // jewels in a lattice down the hanging panel and across the collar
    for (let y = -520; y < -60; y += 58) g += `<rect x="-14" y="${y}" width="28" height="28" transform="rotate(45 0 ${y + 14})" fill="${(y / 58) % 2 ? '#2a5aa8' : '#a8202a'}" stroke="#3a2a10" stroke-width="1.5"/><circle cx="-24" cy="${y + 14}" r="4" fill="#f2ecdc"/><circle cx="24" cy="${y + 14}" r="4" fill="#f2ecdc"/>`;
    for (const x of [-120, -88, 88, 120]) g += `<circle cx="${x}" cy="-1112" r="9" fill="${Math.abs(x) > 100 ? '#2a7a3a' : '#a8202a'}" stroke="#3a2a10" stroke-width="1.5"/>`;
    g += '<path d="M-30,-555 L-30,-40" stroke="#fff4c8" stroke-width="3" opacity="0.45"/>';
    return g;
  })();
  Q.emperor = mk({
    kind: 'man', build: 'fat', robe: true, dims: { hand: 118 }, skin: '#d6a684', tunic: '#4c1842', sleeve: '#43153a', belt: false, props: LOROS,
    hair: '#5c5650', hairStyle: 'short', hairSeed: 5, beard: '#6a6460', beardStyle: 'long', brow: '#4a4440', crown: '#d8b048', pendilia: true, lightX: 1,
    fx: { w: 1.08, cheek: 1.14, jaw: 1.06, chinW: 1.0, dbl: 0.55, eyeS: 0.9, hooded: 0.38, crow: 1, nose: 'hook', noseS: 1.18, browT: 1.45, browArch: -1, lipT: 0.9, earS: 1.06 },
  }, { expr: 'stern', iris: '#2a2018', age: true, lid: 0.2 });

  // THE BROTHER: lean and sharp. Long face, narrow cheeks, narrow tilted cold eyes, long nose, thin lips,
  // a black pointed beard, oiled black hair, a mole. Deep crimson robe with gold borders, a dagger at the belt.
  const TRIM = '<path d="M-26,-1140 L26,-1140 L22,-30 L-22,-30Z" fill="#b88a2e" stroke="#3a2a10" stroke-width="2"/>' +
    [-900, -700, -500, -300].map(y => `<circle cx="0" cy="${y}" r="10" fill="#e8d8a0" stroke="#3a2a10" stroke-width="1.5"/>`).join('');
  Q.brother = mk({
    kind: 'man', robe: true, dims: { shX: 156, wX: 120, sw: 80, hemX: 150, hand: 112 }, skin: '#cc9c78', tunic: '#5a1418', sleeve: '#511216', belt: '#2a1410', leatherBelt: true, buckle: '#c8a040',
    props: TRIM, hair: '#120c0a', hairStyle: 'slick', beard: '#120c0a', beardStyle: 'pointed', stubble: 0, lightX: 1,
    fx: { w: 0.9, len: 1.12, cheek: 0.93, jaw: 0.95, chinW: 0.82, eyeS: 0.88, eyeH: 0.86, eyeTilt: -5, hooded: 0.22, nose: 'long', noseS: 1.16, browT: 1.1, browArch: 5, browIn: 1.1, lipT: 0.75, mouthW: 0.92, earS: 0.95, mole: [30, 62] },
  }, { expr: 'neutral', iris: '#4a5a3a', lid: 0.24 });

  // general 1: an old strategos. Square heavy jaw, broad nose, thick brows, receding grey hair, full grey beard,
  // scale-armour coat over a red tunic, a red cloak
  const SCALES = (() => { let g = ''; for (let y = -1080; y < -620; y += 26) for (let x = -150 + ((y / 26) % 2 ? 13 : 0); x < 150; x += 26) g += `<path d="M${x - 12},${y} Q${x},${y + 24} ${x + 12},${y} Z" fill="#8a8a82" stroke="#2a2a26" stroke-width="1.4"/>`; return `<defs><clipPath id="gScl"><path d="M-150,-1090 L150,-1090 L136,-620 L-136,-620Z"/></clipPath></defs><g clip-path="url(#gScl)" opacity="0.92">${g}</g>`; })();
  Q.general1 = mk({
    kind: 'man', robe: true, dims: { shX: 172, wX: 140, sw: 88, hand: 120 }, skin: '#c08a68', tunic: '#7a1c18', sleeve: '#6e1814', belt: '#2a1a10', leatherBelt: true, buckle: '#a8946a',
    props: SCALES, mantle: '#7a1a14', mantleW: 1.12, mantleDrop: 40, hair: '#8c867c', hairStyle: 'receding', beard: '#8c867c', beardStyle: 'full', brow: '#7a746a', lightX: -1,
    fx: { w: 1.04, cheek: 1.0, jaw: 1.16, chinW: 1.12, eyeS: 0.92, hooded: 0.15, crow: 1, nose: 'broad', noseS: 1.12, browT: 1.55, browArch: -2, lipT: 0.95, earS: 1.1 },
  }, { expr: 'grim', iris: '#3a3a30', age: true, lid: 0.22 });
  // general 2: younger, round full cheeks, wide-set eyes, button nose, full lips, curly brown hair, trimmed moustache;
  // deep blue tunic, a green cloak
  Q.general2 = mk({
    kind: 'man', robe: true, dims: { shX: 160, wX: 132, sw: 82 }, skin: '#d8ac8c', tunic: '#1e2e5a', sleeve: '#1a2850', belt: '#c8a040',
    mantle: '#2a4a2e', mantleW: 1.08, mantleDrop: 50, hair: '#4a2c16', hairStyle: 'short', hairSeed: 61, beard: '#4a2c16', beardStyle: 'short', stubble: 0, lightX: -1,
    fx: { w: 1.0, len: 0.96, cheek: 1.1, jaw: 1.0, eyeS: 1.04, eyeX: 3, eyeTilt: 2, nose: 'button', noseS: 1.12, lipT: 1.25, mouthW: 1.05, earS: 1.12, freckles: 0.3 },
  }, { expr: 'neutral', iris: '#4a3a20', lid: 0.22 });

  // the Varangian guard: tall, long jaw, deep-set pale eyes, straight nose, braided blond beard, iron helmet; red tunic, dark boots
  Q.guard = mk({
    kind: 'man', dims: { shX: 184, wX: 146, sw: 94, hemY: -500, hemX: 170, legX: 58, legW: 80, hand: 124 }, skin: '#e0b496', tunic: '#7a1e1a', sleeve: '#6e1a16', legs: '#3a3028', feet: '#1e140c',
    belt: '#1e140c', leatherBelt: true, buckle: '#8a8a82', hair: '#c8a050', hairStyle: 'short', beard: '#c8a050', beardStyle: 'full', helmet: '#7a7a76', helmetStyle: 'nasal', lightX: -1,
    fx: { w: 1.04, len: 1.05, jaw: 1.18, chinW: 1.1, eyeS: 0.86, eyeW: 1.05, eyeY: 2, hooded: 0.25, nose: 'std', noseS: 1.05, browT: 1.3, browArch: -3, lipT: 0.9, earS: 1.0 },
  }, { expr: 'stern', iris: '#5a7a9a', lid: 0.25 });

  G.QCAST = Q;
})(window);
