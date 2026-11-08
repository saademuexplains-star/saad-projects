// Cast for "The Royal Astrologer" (a French court, the 1400s). All new faces: you (the king's astrologer), the king
// (young and cold; in black mourning at midnight; old and fussing over you at the end), his favourite lady in her
// hennin, two guards, the royal physician, a maid, and two courtiers at the feast.
(function (G) {
  const { person, mix } = G.RIG, K0 = G.CAST;
  const Q = {};
  const face = (base, p) => Object.assign({}, base, p.face || {}, p.blink ? { lid: Math.max((p.face && p.face.lid) ?? base.lid ?? 0.2, p.blink) } : {});
  const mk = (base, faceBase) => p => person(Object.assign({}, base, p, { fx: Object.assign({}, base.fx, p.fx || {}), face: face(faceBase, p) }));
  Q.blink = K0.blink; Q.talk = K0.talk; Q.breath = K0.breath;

  // ---- costume details (person-local units; `props` sit over the torso and under the arms)
  // your robe: small gold stars and a crescent embroidered on the midnight blue, a gold cord at the collar
  const star4 = (x, y, r, op = 0.85) => `<path d="M${x},${y - r} L${x + r * 0.28},${y - r * 0.28} L${x + r},${y} L${x + r * 0.28},${y + r * 0.28} L${x},${y + r} L${x - r * 0.28},${y + r * 0.28} L${x - r},${y} L${x - r * 0.28},${y - r * 0.28}Z" fill="#d8b456" opacity="${op}"/>`;
  const ROBE = [[-92, -1010, 13], [70, -1040, 10], [-40, -900, 9], [104, -880, 12], [-118, -760, 10], [30, -720, 14], [-70, -600, 9], [118, -560, 11], [-10, -470, 12],
    [-130, -380, 10], [80, -330, 9], [-60, -220, 13], [140, -170, 10], [10, -110, 9], [-150, -80, 11], [96, -60, 12]].map(([x, y, r]) => star4(x, y, r)).join('') +
    '<path d="M-18,-1078 C-46,-1062 -46,-1010 -14,-996 C-34,-1012 -32,-1056 -18,-1078Z" fill="#e0be5e" stroke="#6a4c14" stroke-width="2"/>' +
    '<path d="M-112,-1146 C-70,-1110 70,-1110 112,-1146" stroke="#6a4c14" stroke-width="11" fill="none"/><path d="M-112,-1146 C-70,-1110 70,-1110 112,-1146" stroke="#d8b456" stroke-width="6" fill="none" stroke-dasharray="9 4"/>';
  // the king: a heavy gold collar of linked plaques with a pendant
  const COLLAR = '<path d="M-124,-1128 C-100,-1000 -44,-952 0,-940 C44,-952 100,-1000 124,-1128" stroke="#4a3208" stroke-width="20" fill="none"/>' +
    '<path d="M-124,-1128 C-100,-1000 -44,-952 0,-940 C44,-952 100,-1000 124,-1128" stroke="#d8b044" stroke-width="13" fill="none" stroke-dasharray="15 6"/>' +
    '<path d="M0,-944 L-22,-912 L0,-866 L22,-912Z" fill="#c9a040" stroke="#4a3208" stroke-width="3"/><circle cx="0" cy="-906" r="10" fill="#1e3a8a" stroke="#4a3208" stroke-width="2"/>';
  // the physician's red gown has a black band and a flat black cap; the maid's white fichu
  const FICHU = '<path d="M-70,-1150 C-48,-1112 -22,-1088 0,-1076 C22,-1088 48,-1112 70,-1150 L60,-1164 C38,-1134 18,-1114 0,-1106 C-18,-1114 -38,-1134 -60,-1164Z" fill="#f2eee4" stroke="#8a8478" stroke-width="2"/>';
  const GOWNTRIM = (col) => `<path d="M-104,-1150 C-60,-1080 60,-1080 104,-1150 L96,-1124 C56,-1060 -56,-1060 -96,-1124Z" fill="${col}" stroke="#2a1a0c" stroke-width="2"/>` +
    `<path d="M-150,-830 L150,-830" stroke="#c9a040" stroke-width="14"/><path d="M-150,-830 L150,-830" stroke="#7a5a18" stroke-width="3" stroke-dasharray="6 6"/>`;

  // ---- head art (head-local units: face centre at 0,0; it turns with the head)
  // The hennin is far taller than the head, so it can't go in headProps (the light box would cut it flat). The shots
  // draw it with Q.headArt(P, o, svg) in two parts: `back` (the sheer veil, behind the body) and `front` (the gilt cone
  // over a black velvet frontlet).
  const HENNIN = (col, veilSw = 0, h = 520) => {
    const tip = [44, -110 - h], vx = Math.sin(veilSw) * 26, id = 'hcl' + col.slice(1) + h;
    const back = `<path d="M${tip[0]},${tip[1]} C${tip[0] + 120 + vx},${tip[1] + 90} ${150 + vx},${tip[1] + h * 0.6} ${190 + vx * 1.4},${-20} C${210 + vx * 1.6},${60} ${200 + vx * 1.8},${150} ${170 + vx * 2},${230} L${120 + vx},${120} C${130},${0} ${100},${-140} ${tip[0] + 16},${tip[1] + 30}Z" fill="#f6f2ea" opacity="0.45" stroke="#d8d2c4" stroke-width="2"/>` +
      `<path d="M${tip[0] + 10},${tip[1] + 40} C${tip[0] + 90 + vx},${tip[1] + 140} ${140 + vx},${-60} ${150 + vx * 1.5},${150}" stroke="#ffffff" stroke-width="3" opacity="0.35" fill="none"/>`;
    const cone = `M-98,-104 C-92,-140 92,-140 98,-104 L${tip[0] + 8},${tip[1]} L${tip[0] - 8},${tip[1]}Z`;
    let lat = ''; for (let k = -6; k <= 6; k++) { lat += `<path d="M${k * 34 - 120},-110 L${k * 34 + 60},${tip[1]}" stroke="#f0d68a" stroke-width="2.5" opacity="0.45"/><path d="M${k * 34 + 120},-110 L${k * 34 - 40},${tip[1]}" stroke="#7a5a18" stroke-width="2" opacity="0.35"/>`; }
    let front = `<defs><linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${G.RIG.shade(col, -0.3)}"/><stop offset="0.4" stop-color="${G.RIG.shade(col, 0.12)}"/><stop offset="1" stop-color="${G.RIG.shade(col, -0.38)}"/></linearGradient><clipPath id="${id}"><path d="${cone}"/></clipPath></defs>`;
    front += `<path d="${cone}" fill="url(#${id}g)" stroke="#3a2a0c" stroke-width="3" stroke-linejoin="round"/><g clip-path="url(#${id})">${lat}</g>`;
    front += `<path d="M-100,-96 C-96,-136 96,-136 100,-96 C60,-112 -60,-112 -100,-96Z" fill="#14121a" stroke="#000" stroke-width="2.5"/><path d="M-80,-110 C-40,-122 40,-122 80,-110" stroke="#5a5866" stroke-width="3" fill="none" opacity="0.5"/>`;
    return { back, front };
  };
  Q.HENNIN = HENNIN;
  // draw head-local art on a person exactly as the rig places its head (person transform, then the head's own)
  Q.headArt = (P, o, svg) => {
    const s = o.s || 1, b = o.breath || 0, sx = Math.round(s * (1 - b * 0.0015) * 1e5) / 1e5, sy = Math.round(s * (1 + b * 0.004) * 1e5) / 1e5, hsc = o.headScale ?? 1;
    return `<g transform="translate(${o.x || 0},${o.y || 0}) rotate(${o.sway || 0}) scale(${sx},${sy})"><g transform="translate(0,${P.D.headY + (1 - hsc) * 110}) rotate(${o.tilt || 0}) scale(${hsc})">${svg}</g></g>`;
  };

  // ======================================================= YOU: the king's astrologer
  // a long narrow hawkish face, high cheekbones, deep-set dark eyes under arched brows, a hooked nose, a black pointed
  // beard streaked with grey, a black velvet skullcap, a midnight-blue robe sewn with gold stars
  const youMk = mk({ kind: 'man', dims: { shX: 150, wX: 122, sw: 78, hemY: -470, hemX: 176, hand: 110 }, skin: '#c99c78', tunic: '#1c2350', sleeve: '#1a2049', legs: '#141220', feet: '#100e16',
    robe: true, belt: '#b08a34', hood: '#222a5c', veil: '#10142e', cape: false, hair: '#1a1612', hairStyle: 'short', hairSeed: 211, beard: '#2e2a28', beardStyle: 'pointed', mustache: '#2e2a28', brow: '#1a1410', stubble: 0, lightX: -1, props: ROBE,
    fx: { w: 0.9, len: 1.13, cheek: 0.94, hollow: 0.32, jaw: 0.9, chinW: 0.84, eyeS: 0.93, eyeTilt: 3, hooded: 0.22, crow: 0.6, nose: 'hook', noseS: 1.08, noseL: 1.05, lipT: 0.8, mouthW: 0.94, earS: 0.98, browT: 1.02, browArch: 1.5, browIn: 0 } },
    { expr: 'neutral', iris: '#4a3420', lid: 0.18 });
  // o.old 0..1: grey creeps into the beard and the face lines deepen (the years at the end)
  Q.you = p => { const k = p.old || 0; return youMk(Object.assign({}, p, k > 0 ? { beard: mix('#2e2a28', '#bdb8b0', k), mustache: mix('#2e2a28', '#bdb8b0', k), brow: mix('#1a1410', '#8a8680', k), fx: Object.assign({ crow: 0.6 + k * 0.9, hollow: 0.32 + k * 0.15 }, p.fx || {}) } : {})); };

  // ======================================================= THE KING
  // gaunt and clean-shaven, a long sharp nose, thin lips, small cold grey eyes under heavy lids, long dark hair to the
  // jaw. Crimson robe, ermine mantle, gold collar, the crown. o.mourn: a black mantle over it all at midnight.
  // o.old 0..1: white hair, deep lines, a stoop (the rest of his life). o.pale 0..1: the blood drains from his face.
  const KSKIN = '#dcb294';
  const kingMk = mk({ kind: 'man', dims: { shX: 160, wX: 128, sw: 82, hemY: -470, hemX: 176, hand: 114 }, skin: KSKIN, tunic: '#7a1418', sleeve: '#6e1216', legs: '#2a1414', feet: '#160c0c',
    robe: true, mantle: '#5a0c12', ermine: true, mantleW: 1.2, mantleDrop: 150, crown: '#d6a838', props: COLLAR, belt: '#c9a040', leatherBelt: true, buckle: '#e8c860',
    hair: '#3a2416', hairStyle: 'bob', hairSeed: 221, brow: '#2a1a10', stubble: 0.15, lightX: -1,
    fx: { w: 0.9, len: 1.14, cheek: 0.9, hollow: 0.5, jaw: 0.94, chinW: 0.88, eyeS: 0.84, eyeTilt: -4, hooded: 0.42, crow: 0.7, nose: 'long', noseS: 1.14, noseL: 1.12, lipT: 0.62, mouthW: 0.9, earS: 1.04, browT: 1.1, browArch: 0.6, browIn: 5 } },
    { expr: 'stern', iris: '#8a9094', lid: 0.3 });
  Q.king = p => {
    const k = p.old || 0, pl = p.pale || 0, o = {};
    if (p.mourn) Object.assign(o, { mantle: '#141216', ermine: false, tunic: '#2a1216', sleeve: '#241014' });
    if (k > 0) Object.assign(o, { hair: mix('#3a2416', '#d8d4cc', k), brow: mix('#2a1a10', '#b8b4ac', k), fx: Object.assign({ crow: 0.7 + k * 1.2, hollow: 0.5 + k * 0.25 }, p.fx || {}) });
    if (pl > 0) o.skin = mix(KSKIN, '#d4d0c4', pl);
    return kingMk(Object.assign({}, p, o));
  };

  // ======================================================= THE KING'S FAVOURITE
  // young, a high pale brow (the fashion), almond eyes tilted up, a small nose, full lips; a deep green velvet gown
  // with gold at the neck; the gilt hennin and sheer veil. o.bed: loose hair and a white nightgown, no hennin.
  const ladyMk = mk({ kind: 'woman', skin: '#f0d0b8', tunic: '#1f4a34', sleeve: '#1c4430', hair: '#6a3a1e', hairStyle: 'bob', brow: '#5a3218', belt: false, lightX: 1,
    fx: { w: 0.9, len: 1.08, cheek: 0.96, jaw: 0.86, chinW: 0.82, eyeS: 1.02, eyeTilt: 5, hooded: 0.12, nose: 'button', noseS: 0.95, lipT: 1.15, mouthW: 0.94, earS: 0.92, browT: 0.85, browArch: 1.7 } },
    { expr: 'neutral', iris: '#4a5e3a', lid: 0.16, blush: 0.25 });
  // (with the hennin the hair is hidden, as the fashion was: the shots add Q.HENNIN via Q.headArt)
  Q.lady = p => p.bed ? ladyMk(Object.assign({ tunic: '#efe9de', sleeve: '#ebe4d8', hairStyle: 'long', props: '' }, p))
    : ladyMk(Object.assign({ hairStyle: 'bald', props: GOWNTRIM('#c9a040') }, p));
  Q.LADY_HENNIN = sw => HENNIN('#c9a648', sw || 0);

  // ======================================================= TWO GUARDS (royal blue tabards with gold, kettle helmets)
  const GTAB = { tunic: '#2a2c34', sleeve: '#3a3e48', legs: '#2a2420', feet: '#1a1410', tabard: { col: '#1e3478', trim: '#c9a040', emblem: true }, belt: '#2a1a0e', leatherBelt: true, buckle: '#8a8a80', lightX: -1 };
  // A: a big square head, a broken flat nose, a heavy black full beard, small hard eyes
  Q.guardA = mk(Object.assign({ kind: 'man', dims: { shX: 180, wX: 150, sw: 94, hand: 124 }, skin: '#c89474', helmet: '#7e8288', hair: '#141010', hairStyle: 'short', hairSeed: 231,
    beard: '#141010', beardStyle: 'full', mustache: '#141010', brow: '#0e0a08', stubble: 0.8,
    fx: { w: 1.12, len: 0.98, cheek: 1.06, jaw: 1.18, chinW: 1.12, eyeS: 0.8, hooded: 0.36, nose: 'broad', noseS: 1.16, lipT: 0.9, earS: 1.1, browT: 1.6, browArch: -0.8 } }, GTAB),
    { expr: 'grim', iris: '#2a1e14', lid: 0.3 });
  // B: younger, lean, a long jaw, a scar across the cheek, red-brown stubble, pale blue eyes
  Q.guardB = mk(Object.assign({ kind: 'man', dims: { shX: 160, wX: 130, sw: 84, hand: 116 }, skin: '#e2b494', helmet: '#8a8e94', hair: '#7a4a24', hairStyle: 'short', hairSeed: 241,
    mustache: '#7a4a24', brow: '#6a3e1c', stubble: 1, scar: true,
    fx: { w: 0.93, len: 1.12, cheek: 0.92, hollow: 0.35, jaw: 1.02, chinW: 0.92, eyeS: 0.9, eyeTilt: -2, hooded: 0.28, nose: 'std', noseS: 1.04, lipT: 0.8, earS: 1.06, browT: 1.1 } }, GTAB),
    { expr: 'grim', iris: '#7a9aaa', lid: 0.26 });

  // ======================================================= THE ROYAL PHYSICIAN (the end): old, round, a long white beard, scarlet gown, black cap
  Q.doctor = mk({ kind: 'man', build: 'fat', dims: { hand: 114 }, skin: '#e8b898', tunic: '#8a1a1c', sleeve: '#7a1618', legs: '#1a1416', feet: '#0c0a0a', robe: true, belt: '#1a1012', cap: '#141012',
    hair: '#e0dcd4', hairStyle: 'receding', hairSeed: 251, beard: '#ece8e0', beardStyle: 'long', mustache: '#ece8e0', brow: '#d8d4cc', lightX: -1,
    fx: { w: 1.08, len: 1.02, cheek: 1.1, jaw: 1.02, eyeS: 0.84, hooded: 0.5, crow: 1.5, nose: 'broad', noseS: 1.1, lipT: 0.9, earS: 1.1, dbl: 0.5 } },
    { expr: 'anxious', iris: '#5a6a7a', lid: 0.3, blush: 0.4 });

  // ======================================================= A MAID (the end): round young face, freckles, white coif, brown dress
  Q.maid = mk({ kind: 'woman', skin: '#f2cdb0', tunic: '#6a4a32', sleeve: '#5e422c', apron: '#ece4d4', coif: '#f4f0e8', hair: '#a8642a', hairStyle: 'bob', brow: '#8a4a1e', belt: false, lightX: 1, props: FICHU,
    fx: { w: 1.04, len: 0.96, cheek: 1.08, jaw: 0.92, chinW: 0.9, eyeS: 1.0, hooded: 0.1, nose: 'button', noseS: 0.92, lipT: 1.05, mouthW: 1.02, freckles: 0.7 } },
    { expr: 'anxious', iris: '#6a4a2a', lid: 0.16 });

  // ======================================================= COURTIERS at the feast
  // a fat lord in a green houppelande and a crimson chaperon (the rolled turban hat), a gold chain; a sly fleshy face
  Q.lord = mk({ kind: 'man', build: 'fat', dims: { hand: 118 }, skin: '#e6b090', tunic: '#2e4a2c', sleeve: '#2a4428', legs: '#2a2418', feet: '#1a1410', robe: true, turban: '#7a1a24',
    hair: '#5a3a20', hairStyle: 'short', hairSeed: 261, brow: '#4a2e18', stubble: 0.2, belt: '#c9a040', leatherBelt: true, buckle: '#e8c860', lightX: 1,
    fx: { w: 1.12, len: 0.98, cheek: 1.14, jaw: 1.08, chinW: 1.04, eyeS: 0.86, eyeTilt: -3, hooded: 0.3, nose: 'button', noseS: 1.06, lipT: 1.15, earS: 1.04, dbl: 0.55 } },
    { expr: 'neutral', iris: '#3a2a1a', lid: 0.24, blush: 0.3 });
  // a lady-in-waiting: a narrow face, a sharp chin, wide grey eyes; a blue gown and a short blue hennin
  Q.waiting = mk({ kind: 'woman', skin: '#ecc8ac', tunic: '#2a3a6a', sleeve: '#26365e', hair: '#2a1a12', hairStyle: 'bald', brow: '#24160e', belt: false, lightX: -1, props: GOWNTRIM('#d8d4c8'),
    fx: { w: 0.86, len: 1.1, cheek: 0.9, jaw: 0.84, chinW: 0.78, eyeS: 1.06, eyeTilt: -2, hooded: 0.1, nose: 'long', noseS: 0.98, lipT: 0.85, mouthW: 0.9, earS: 0.94, browArch: 1.1 } },
    { expr: 'anxious', iris: '#7a8a94', lid: 0.14 });
  Q.WAIT_HENNIN = sw => HENNIN('#2e4a8a', sw || 0, 330);

  Q.HAND = { you: 110, king: 114, lady: 104, guardA: 124, guardB: 116, doctor: 114, maid: 104, lord: 118, waiting: 104 };
  G.QCAST = Q;
})(window);
