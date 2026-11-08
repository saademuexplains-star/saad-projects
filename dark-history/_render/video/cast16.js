// Cast for "The Pied Piper" (Hamelin, 1284, and a bedroom centuries later). All new faces: you (a mother in a white
// wimple), your son in his red cap, the Piper (tall, gaunt, pale-eyed, a parti-coloured coat with patches, a dagged
// green cape and a feathered hat), eight children of the town, the three left behind (a lame boy on a crutch, a deaf
// girl, a blind boy), two townsfolk, and the parent and child at bedtime.
(function (G) {
  const { person, mix, shade, faceP } = G.RIG, K0 = G.CAST;
  const Q = {};
  const face = (base, p) => Object.assign({}, base, p.face || {}, p.blink ? { lid: Math.max((p.face && p.face.lid) ?? base.lid ?? 0.2, p.blink) } : {});
  const mk = (base, faceBase) => p => person(Object.assign({}, base, p, { fx: Object.assign({}, base.fx, p.fx || {}), face: face(faceBase, p) }));
  Q.blink = K0.blink; Q.talk = K0.talk; Q.breath = K0.breath;
  const OUTL = 'stroke="#20140c" stroke-width="2" stroke-linejoin="round"';
  Q.headArt = (P, o, svg) => {
    const s = o.s || 1, b = o.breath || 0, sx = Math.round(s * (1 - b * 0.0015) * 1e5) / 1e5, sy = Math.round(s * (1 + b * 0.004) * 1e5) / 1e5, hsc = o.headScale ?? 1;
    return `<g transform="translate(${o.x || 0},${o.y || 0}) rotate(${o.sway || 0}) scale(${sx},${sy})"><g transform="translate(0,${P.D.headY + (1 - hsc) * 110}) rotate(${o.tilt || 0}) scale(${hsc})">${svg}</g></g>`;
  };
  Q.withArt = (P, o, art, body) => (art && art.back ? Q.headArt(P, o, art.back) : '') + body + (art && art.front ? Q.headArt(P, o, art.front) : '');
  const hairGrad = (id, col) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(col, 0.2)}"/><stop offset="1" stop-color="${shade(col, -0.2)}"/></linearGradient>`;
  const f = v => Math.round(v * 10) / 10;

  // ======================================================= head art (head-local: face centre 0,0)
  // the Piper's hat: a tall felt hat, red on one side and yellow on the other, an upturned brim and a long feather that
  // sweeps back over his shoulder (k: the feather's sway)
  const PIPERHAT = (id, k = 0) => `<defs>${hairGrad(id + 'r', '#b02a26')}${hairGrad(id + 'y', '#d8a428')}<clipPath id="${id}c"><path d="M-84,-112 C-90,-196 -40,-262 18,-268 C70,-262 96,-200 86,-112Z"/></clipPath></defs>` +
    `<path d="M${f(40 + 10 * k)},-232 C${f(130 + 20 * k)},${f(-300 + 10 * k)} ${f(230 + 40 * k)},${f(-250 + 20 * k)} ${f(270 + 50 * k)},${f(-130 + 30 * k)} C${f(214 + 40 * k)},${f(-206 + 20 * k)} ${f(140 + 20 * k)},-236 ${f(56 + 10 * k)},-206Z" fill="#f2ece0" ${OUTL}/>` +
    `<path d="M${f(60 + 10 * k)},-222 C${f(150 + 20 * k)},-270 ${f(210 + 40 * k)},-240 ${f(250 + 50 * k)},${f(-150 + 30 * k)}" stroke="#c83a2a" stroke-width="4" fill="none" opacity="0.7"/>` +
    `<g clip-path="url(#${id}c)"><rect x="-100" y="-280" width="100" height="180" fill="url(#${id}r)"/><rect x="0" y="-280" width="100" height="180" fill="url(#${id}y)"/></g><path d="M-84,-112 C-90,-196 -40,-262 18,-268 C70,-262 96,-200 86,-112Z" fill="none" ${OUTL}/>` +
    `<path d="M-118,-108 C-90,-140 90,-140 122,-110 C130,-96 100,-86 0,-88 C-100,-86 -132,-94 -118,-108Z" fill="#7a1e1a" ${OUTL}/><path d="M-100,-112 C-60,-128 60,-128 104,-114" stroke="#d8a428" stroke-width="5" fill="none"/>`;
  // your son's red felt cap with a turned-up rim, and the blond curls that escape from under it
  const SONCAP = (id) => {
    // soft wavy locks: one mass of hair under the cap, scalloped at the edges, curling round the ears and over the brow
    let g = `<defs>${hairGrad(id, '#e2bc62')}</defs>`;
    let d = 'M-92,-90';
    const edge = [[-104, -50], [-98, -18], [-104, 10], [-86, 30], [-74, 8], [-78, -30], [-60, -64], [-36, -72], [-12, -62], [10, -74], [34, -64], [60, -66], [78, -30], [74, 8], [86, 30], [104, 10], [98, -18], [104, -50], [92, -90]];
    edge.forEach(([x, y], i) => { const [px, py] = i ? edge[i - 1] : [-92, -90]; d += ` Q${f((px + x) / 2 + (x < 0 ? -8 : 8))},${f((py + y) / 2 + 6)} ${x},${y}`; });
    g += `<path d="${d}Z" fill="url(#${id})" ${OUTL}/>`;
    for (const [x, y] of [[-90, -30], [-88, 4], [90, -30], [88, 4], [-40, -70], [0, -66], [40, -70]]) g += `<path d="M${x - 10},${y} q10,-10 20,0" stroke="#f8e2a0" stroke-width="2.6" fill="none" opacity="0.65"/>`;
    g += `<path d="M-86,-92 C-86,-162 -36,-196 0,-196 C40,-196 88,-160 86,-92Z" fill="#b8322a" ${OUTL}/><path d="M-30,-180 C-10,-190 20,-188 40,-174" stroke="#e86a5a" stroke-width="5" fill="none" opacity="0.6"/>`;
    g += `<path d="M-96,-86 C-60,-110 60,-110 96,-86 L92,-68 C60,-90 -60,-90 -92,-68Z" fill="#8a2420" ${OUTL}/><circle cx="0" cy="-196" r="9" fill="#8a2420" ${OUTL}/>`;
    return g;
  };
  // two plaits over the shoulders and a centre parting (rib: the ribbon colour)
  const PLAITS = (col, rib, id) => {
    let g = `<defs>${hairGrad(id, col)}</defs><path d="M-86,10 C-96,-60 -86,-136 -32,-152 C0,-160 32,-158 50,-150 C92,-134 98,-60 86,10 L72,6 C70,-40 60,-70 34,-80 C14,-86 -14,-86 -34,-80 C-60,-70 -70,-40 -72,6Z" fill="url(#${id})" ${OUTL}/><path d="M0,-96 L0,-154" stroke="${shade(col, -0.45)}" stroke-width="2" opacity="0.6"/>`;
    for (const s of [-1, 1]) {
      for (let i = 0; i < 6; i++) g += `<ellipse cx="${s * (84 + i * 2)}" cy="${30 + i * 34}" rx="18" ry="22" fill="url(#${id})" ${OUTL}/><path d="M${s * (84 + i * 2) - 12},${26 + i * 34} q12,10 24,0" stroke="${shade(col, 0.35)}" stroke-width="2" fill="none" opacity="0.6"/>`;
      // a small bow tied at the end of the plait
      g += `<path d="M${s * 94},226 C${s * 94 - 26},212 ${s * 94 - 28},240 ${s * 94},232 C${s * 94 + 26},244 ${s * 94 + 28},212 ${s * 94},226Z" fill="${rib}" ${OUTL}/><circle cx="${s * 94}" cy="229" r="5" fill="${shade(rib, -0.25)}"/>`;
    }
    return g;
  };
  // round wire glasses for the father at bedtime
  const SPECS = (kind, fx) => { const P = faceP(kind, fx), r = P.rx * 1.3, y = P.ey + 2; let g = ''; for (const s of [-1, 1]) g += `<circle cx="${(s * P.ex).toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="#e6eef2" fill-opacity="0.1" stroke="#6a5a3a" stroke-width="3.4"/><path d="M${(s * P.ex - r * 0.5).toFixed(1)},${(y - r * 0.4).toFixed(1)} l${(r * 0.4).toFixed(1)},${(-r * 0.2).toFixed(1)}" stroke="#fff" stroke-width="2" opacity="0.6"/>`; return g + `<path d="M${(-P.ex + r).toFixed(1)},${(y - 3).toFixed(1)} Q0,${(y - 10).toFixed(1)} ${(P.ex - r).toFixed(1)},${(y - 3).toFixed(1)}" stroke="#6a5a3a" stroke-width="3" fill="none"/>`; };

  // ======================================================= costume overlays (person-local; the rig cuts them to the torso)
  // the Piper's coat of many colours: the left half yellow, the right half red, patches of green, blue and white
  // stitched across it, a belt with a pouch. The yellow half carries the same round shading as the cloth under it.
  const PIEDCOAT = (() => {
    const y = '#d8a428';
    let g = `<defs><linearGradient id="pcY" gradientUnits="userSpaceOnUse" x1="-150" y1="0" x2="150" y2="0"><stop offset="0" stop-color="${shade(y, -0.24)}"/><stop offset="0.28" stop-color="${shade(y, 0.05)}"/><stop offset="0.55" stop-color="${y}"/><stop offset="1" stop-color="${shade(y, -0.3)}"/></linearGradient></defs>`;
    g += `<rect x="0" y="-1400" width="400" height="1000" fill="url(#pcY)"/><path d="M0,-1178 L0,-460" stroke="#20140c" stroke-width="2.4"/>`;
    const pt = [[-80, -1040, '#2e6a4a'], [60, -980, '#2a4a8a'], [-40, -880, '#f2ece0'], [90, -820, '#b02a26'], [-100, -720, '#2a4a8a'], [30, -660, '#2e6a4a'], [-60, -560, '#d8a428'], [100, -560, '#f2ece0'], [-110, -980, '#d8a428'], [40, -1100, '#b02a26']];
    for (const [x, y, c] of pt) g += `<path d="M${x},${y - 34} L${x + 26},${y} L${x},${y + 34} L${x - 26},${y}Z" fill="${c}" ${OUTL}/><path d="M${x - 22},${y} L${x + 22},${y}" stroke="#20140c" stroke-width="1" stroke-dasharray="4 4" opacity="0.5"/>`;
    g += `<rect x="-200" y="-836" width="400" height="24" fill="#3a2a1a" ${OUTL}/><rect x="-14" y="-840" width="28" height="32" rx="4" fill="#c8a040" ${OUTL}/><path d="M66,-812 C60,-760 62,-730 86,-716 C110,-730 112,-760 106,-812Z" fill="#5a3a20" ${OUTL}/>`;
    return g;
  })();
  // a woman's kirtle laced at the front under a linen apron
  const LACES = `<path d="M0,-1100 L0,-860" stroke="#20140c" stroke-width="3" opacity="0.5"/>` + [-1080, -1040, -1000, -960, -920, -880].map(y => `<path d="M-14,${y} L14,${y + 20} M14,${y} L-14,${y + 20}" stroke="#e8dcc0" stroke-width="2.4" opacity="0.8"/>`).join('');
  // a child's belted tunic (kids' local units; the rig draws the neck slit itself)
  const KIDTUNIC = (col) => `<rect x="-86" y="-452" width="172" height="14" rx="4" fill="#5a3a20" ${OUTL}/>`;
  // striped pyjamas (child, centuries later)
  const PJ = (col) => [-560, -520, -480, -440, -400, -360, -320, -280].map(y => `<path d="M-90,${y} L90,${y}" stroke="${shade(col, 0.4)}" stroke-width="10" opacity="0.6"/>`).join('') + `<path d="M-30,-640 L0,-610 L30,-640" stroke="#20140c" stroke-width="2" fill="none"/>` + [-600, -540, -480].map(y => `<circle cx="0" cy="${y}" r="5" fill="#f4f0e4"/>`).join('');
  // a knitted cardigan with buttons (the father)
  const CARDIGAN = (col) => `<path d="M-60,-1160 L0,-940 L60,-1160" stroke="${shade(col, -0.35)}" stroke-width="6" fill="none"/><path d="M-30,-1150 L0,-1040 L30,-1150Z" fill="#e8e2d4" ${OUTL}/>` + [-900, -820, -740, -660].map(y => `<circle cx="0" cy="${y}" r="8" fill="${shade(col, -0.4)}" stroke="#20140c" stroke-width="1.5"/>`).join('') +
    [-100, -60, 60, 100].map(x => `<path d="M${x},-1100 L${x * 1.1},-500" stroke="${shade(col, -0.2)}" stroke-width="3" opacity="0.4" stroke-dasharray="6 6"/>`).join('');

  // ======================================================= YOU: the mother (about thirty): a strong oval face, wide-set green
  // hazel eyes, straight brows, a long straight nose, full lips; a white wimple and veil, a blue-grey kirtle, an apron
  const motherFx = { w: 0.96, len: 1.05, cheek: 1.06, jaw: 0.9, chinW: 0.86, eyeS: 1.06, eyeW: 1.04, eyeX: 1.04, eyeTilt: -1, hooded: 0.1, crow: 0.2, nose: 'long', noseS: 0.96, noseL: 1.04, lipT: 1.14, mouthW: 0.98, browT: 0.95, browArch: 0.4, earS: 0.95 };
  Q.mother = mk({ kind: 'woman', skin: '#ecc8aa', tunic: '#3e4f6a', sleeve: '#3a4a64', apron: '#e6dcc4', belt: '#5a3a20', hair: '#5a3a22', hairStyle: 'bald', brow: '#5a3a22', wimple: '#f2eee4', veil: '#e2dbcd', lightX: -1, costume: LACES, fx: motherFx },
    { expr: 'neutral', iris: '#5a6a3a', lid: 0.16 });
  Q.motherArt = null;

  // ======================================================= your son (eight): round freckled face, big blue eyes, a button nose,
  // blond curls under a red cap, a green tunic
  const sonFx = { w: 1.04, len: 0.96, cheek: 1.12, jaw: 0.92, chinW: 0.9, eyeS: 1.12, eyeTilt: 2, hooded: 0, nose: 'button', noseS: 0.92, lipT: 1.05, mouthW: 1.0, freckles: 0.6, earS: 1.06, browT: 0.9 };
  Q.son = mk({ kind: 'kid', skin: '#f2d2b6', tunic: '#5a7a3a', sleeve: '#56743a', legs: '#7a5a3a', feet: '#4a3020', belt: false, hair: '#e2bc62', hairStyle: 'bald', brow: '#c89a50', lightX: -1, costume: KIDTUNIC('#5a7a3a'), fx: sonFx },
    { expr: 'neutral', iris: '#4a7ab0', lid: 0.12 });
  Q.sonArt = { front: SONCAP('snc') };

  // ======================================================= the Piper: tall and thin, a long gaunt face, hollow cheeks, slanted
  // pale grey-green eyes under high arched brows, a long sharp nose, a thin smile, a black pointed beard and long hair
  const piperFx = { w: 0.86, len: 1.16, cheek: 0.92, hollow: 0.45, jaw: 0.94, chinW: 0.8, eyeS: 0.9, eyeW: 1.04, eyeTilt: -6, hooded: 0.38, crow: 0.4, nose: 'long', noseS: 1.1, noseL: 1.18, lipT: 0.7, mouthW: 1.06, browT: 1.1, browArch: 1.8, earS: 0.96 };
  Q.piper = mk({ kind: 'man', dims: { shX: 150, wX: 116, hemX: 150, sw: 74, hand: 120 }, skin: '#e0c0a6', tunic: '#b02a26', sleeve: '#d8a428', legs: '#2e4a3a', feet: '#2a1a12', belt: false, hair: '#1e1410', hairStyle: 'long', hairSeed: 702, beard: '#1e1410', beardStyle: 'pointed', mustache: '#1e1410', brow: '#1a120e', mantle: '#2e6a4a', mantleW: 1.06, mantleDrop: 110, lightX: -1, costume: PIEDCOAT, fx: piperFx },
    { expr: 'neutral', iris: '#8ab0a0', lid: 0.34, mouth: 'smile' });
  Q.piperArt = (k = 0) => ({ front: PIPERHAT('pph', k) });

  // ======================================================= the children of the town (eight faces), kid kind
  const kid = (skin, tunic, hair, style, fx, seed, extra = {}) => mk(Object.assign({ kind: 'kid', skin, tunic, sleeve: shade(tunic, -0.04), legs: shade(tunic, -0.35), feet: '#3a2a1a', belt: false, hair, hairStyle: style, hairSeed: seed, brow: shade(hair, -0.2), lightX: -1, costume: KIDTUNIC(tunic), fx }, extra), { expr: 'neutral', iris: '#3a2a1a', lid: 0.14 });
  Q.kids = [
    kid('#f0ccb0', '#a8642a', '#6a4222', 'bald', { w: 1.06, len: 0.94, cheek: 1.14, jaw: 0.92, chinW: 0.88, eyeS: 1.08, eyeTilt: 3, nose: 'button', noseS: 0.9, lipT: 1.1 }, 801),
    kid('#d8a888', '#4a5a7a', '#141010', 'messy', { w: 1.02, len: 1.0, cheek: 1.04, jaw: 1.0, chinW: 0.96, eyeS: 0.96, eyeTilt: -2, nose: 'std', noseS: 1.04, lipT: 1.0, earS: 1.12 }, 811),
    kid('#f4d6c0', '#7a3a2a', '#b8582a', 'short', { w: 1.08, len: 0.92, cheek: 1.16, jaw: 0.96, chinW: 0.94, eyeS: 1.0, eyeTilt: 1, nose: 'button', noseS: 1.0, lipT: 0.95, freckles: 0.9 }, 821),
    kid('#f2d0b4', '#6a7a4a', '#d8b060', 'bald', { w: 0.98, len: 1.02, cheek: 1.06, jaw: 0.88, chinW: 0.84, eyeS: 1.12, eyeTilt: 4, nose: 'button', noseS: 0.88, lipT: 1.15 }, 831, { coif: '#f0ece0' }),
    kid('#e8bea0', '#8a7a5a', '#4a3020', 'short', { w: 1.04, len: 0.98, cheek: 1.08, jaw: 1.04, chinW: 1.0, eyeS: 0.94, eyeTilt: -1, nose: 'broad', noseS: 1.0, lipT: 1.05 }, 841, { hood: '#6a4a2a' }),
    kid('#c89878', '#4a3a5a', '#1e1612', 'bald', { w: 1.0, len: 1.0, cheek: 1.1, jaw: 0.9, chinW: 0.86, eyeS: 1.06, eyeTilt: 5, nose: 'std', noseS: 0.92, lipT: 1.2 }, 851, { kerchief: '#c8a050' }),
    kid('#f6dcc6', '#9a5a3a', '#e8c878', 'messy', { w: 1.1, len: 0.9, cheek: 1.2, jaw: 0.94, chinW: 0.92, eyeS: 1.16, eyeTilt: 2, nose: 'button', noseS: 0.86, lipT: 1.0, freckles: 0.4 }, 861),
    kid('#eec4a6', '#3a5a5a', '#8a3a1a', 'long', { w: 0.96, len: 1.04, cheek: 1.02, jaw: 0.88, chinW: 0.84, eyeS: 1.04, eyeTilt: 0, nose: 'std', noseS: 0.94, lipT: 1.1 }, 871)
  ];
  Q.kidArt = [{ front: PLAITS('#6a4222', '#c8443a', 'k0p') }, null, null, null, null, null, null, null];

  // ======================================================= the three left behind
  // the lame boy: thin, sad-eyed, shaggy brown hair, a bandaged shin, leaning on a crutch
  Q.lame = mk({ kind: 'kid', skin: '#e6c2a4', tunic: '#5a4a3a', sleeve: '#564636', legs: '#4a3a2a', feet: '#3a2a1a', belt: false, hair: '#5a3a20', hairStyle: 'messy', hairSeed: 881, brow: '#4a2a14', lightX: -1, costume: KIDTUNIC('#5a4a3a'),
    fx: { w: 0.94, len: 1.04, cheek: 0.98, hollow: 0.2, jaw: 0.9, chinW: 0.86, eyeS: 1.1, eyeTilt: -4, hooded: 0.1, nose: 'std', noseS: 0.96, lipT: 1.0, earS: 1.08 } }, { expr: 'grief', iris: '#5a4a2a', lid: 0.2 });
  // the deaf girl: a heart-shaped face, wide dark eyes, black plaits with yellow ribbons
  Q.deaf = mk({ kind: 'kid', skin: '#d8ac8c', tunic: '#7a6a4a', sleeve: '#766646', legs: '#5a4a32', feet: '#3a2a1a', belt: false, hair: '#141010', hairStyle: 'bald', brow: '#141010', lightX: -1, costume: KIDTUNIC('#7a6a4a'),
    fx: { w: 1.0, len: 0.98, cheek: 1.1, jaw: 0.86, chinW: 0.8, eyeS: 1.16, eyeTilt: 2, nose: 'button', noseS: 0.9, lipT: 1.12 } }, { expr: 'anxious', iris: '#2a1a10', lid: 0.1 });
  Q.deafArt = { front: PLAITS('#141010', '#e8c040', 'dfp') };
  // the blind boy: a long face, milky pale eyes, close-cropped fair hair, a walking stick
  Q.blind = mk({ kind: 'kid', skin: '#f0d0b8', tunic: '#4a5a4a', sleeve: '#465646', legs: '#3a4a3a', feet: '#3a2a1a', belt: false, hair: '#c8a870', hairStyle: 'short', hairSeed: 891, brow: '#a88850', lightX: -1, costume: KIDTUNIC('#4a5a4a'),
    fx: { w: 0.94, len: 1.08, cheek: 1.0, jaw: 0.94, chinW: 0.9, eyeS: 1.0, eyeTilt: 0, hooded: 0.2, nose: 'long', noseS: 0.94, lipT: 0.95, earS: 1.1 } }, { expr: 'neutral', iris: '#c8ced4', lid: 0.36 });

  // ======================================================= townsfolk
  Q.oldWoman = mk({ kind: 'woman', skin: '#e2b898', tunic: '#5a4a3a', sleeve: '#564636', hair: '#a8a49c', hairStyle: 'bald', brow: '#8a8478', wimple: '#d8d0c0', veil: '#c4bcac', lightX: -1,
    fx: { w: 0.98, len: 1.0, cheek: 0.96, hollow: 0.3, jaw: 0.92, chinW: 0.88, eyeS: 0.9, hooded: 0.4, crow: 1.0, nose: 'hook', noseS: 1.08, lipT: 0.7, browT: 0.8, age: 1 } }, { expr: 'anxious', iris: '#5a6a7a', lid: 0.3, age: 0.8 });
  Q.baker = mk({ kind: 'man', build: 'fat', skin: '#e8b898', tunic: '#c8b898', sleeve: '#c4b492', apron: '#f2ece0', legs: '#5a4a3a', feet: '#2a1a12', hair: '#8a5a2a', hairStyle: 'receding', beard: '#8a5a2a', beardStyle: 'full', brow: '#6a4020', lightX: -1, coif: '#f0ece0',
    fx: { w: 1.14, len: 0.94, cheek: 1.2, jaw: 1.1, chinW: 1.08, eyeS: 0.88, hooded: 0.2, nose: 'broad', noseS: 1.12, lipT: 1.0, earS: 1.0 } }, { expr: 'neutral', iris: '#4a3a2a', lid: 0.24 });

  // ======================================================= centuries later: the father reading and the child in bed
  const readerFx = { w: 1.02, len: 1.06, cheek: 1.0, jaw: 1.04, chinW: 1.0, eyeS: 0.94, eyeTilt: -2, hooded: 0.22, crow: 0.5, nose: 'std', noseS: 1.06, noseL: 1.06, lipT: 1.0, mouthW: 1.02, browT: 1.1, browArch: 0.3, earS: 1.0 };
  Q.reader = mk({ kind: 'man', dims: { shX: 162, wX: 136, sw: 84, hand: 114 }, skin: '#c89a78', tunic: '#7a5a4a', sleeve: '#76564a', legs: '#3a3a44', feet: '#2a2a2e', belt: false, hair: '#2a1e16', hairStyle: 'short', hairSeed: 911, beard: '#2a1e16', beardStyle: 'short', brow: '#20160e', lightX: 1, costume: CARDIGAN('#7a5a4a'), fx: readerFx },
    { expr: 'neutral', iris: '#3a2a1a', lid: 0.3, mouth: 'smile' });
  Q.readerArt = { front: SPECS('man', readerFx) };
  Q.child = mk({ kind: 'kid', skin: '#f0cfb2', tunic: '#7aa0c8', sleeve: '#769cc4', legs: '#7aa0c8', feet: '#f0cfb2', belt: false, hair: '#6a4a2a', hairStyle: 'messy', hairSeed: 921, brow: '#5a3a1a', lightX: 1, costume: PJ('#7aa0c8'),
    fx: { w: 1.06, len: 0.94, cheek: 1.16, jaw: 0.94, chinW: 0.9, eyeS: 1.1, eyeTilt: 1, nose: 'button', noseS: 0.9, lipT: 1.05 } }, { expr: 'neutral', iris: '#4a3a2a', lid: 0.3 });

  Q.HAND = { mother: 104, son: 72, piper: 120, kid: 72, lame: 72, deaf: 72, blind: 72, oldWoman: 104, baker: 124, reader: 114, child: 72 };
  G.QCAST = Q;
})(window);
