// The Radium Girls cast (2026-11-09): Orange, New Jersey, 1917. Clean rig (G.RIG_CRISP), every garment woven and
// finished, hair from hairkit.js drawn inside the figure's one light pass (Q.litHair, from cast21.js), every face new
// and different, one main colour per character:
//   YOU - a dial painter, nineteen: auburn hair up in a soft bun, a cream shirtwaist with a high collar and a cameo, an
//         oatmeal linen work pinafore over a brown skirt (brushes in its pocket); for the dance, a dusty-rose silk dress
//   two FRIENDS at the dial tables - a fair, round-faced girl; a dark, long-faced girl
//   the BOSS - the studio superintendent: slick dark hair, a thin moustache, a striped shirt with sleeve garters, a
//         charcoal waistcoat and his watch chain
//   the DENTIST - sixty, grey, a goatee, round wire spectacles, a white dental coat
//   a CHEMIST - the company's own lab: a heavy grey lead apron, rubber gloves, a cloth mask and goggles
// Load after cast21.js (it extends G.QCAST: litHair, headArt, armAO).
(function (G) {
  const { person, shade, mix } = G.RIG, K0 = G.CAST, T = G.TAILOR, HK = G.HAIRKIT;
  const Q = G.QCAST;
  const face = (base, p) => Object.assign({}, base, p.face || {}, p.blink ? { lid: Math.max((p.face && p.face.lid) ?? base.lid ?? 0.2, p.blink) } : {});
  const mk = (base, faceBase) => p => person(Object.assign({}, base, p, { fx: Object.assign({}, base.fx, p.fx || {}), face: face(faceBase, p) }));
  const f = v => Math.round(v * 10) / 10;

  // ---------------------------------------------------------------- women's garments (person-local, kind 'woman')
  // the shirtwaist: a high standing collar edged in lace with a cameo at the throat, a front placket with small pearl
  // buttons, pin tucks either side (only its front shows above a pinafore or inside a jacket)
  const BLOUSE = (col, cameo = '#c87a5a') => {
    const dk = shade(col, -0.3), lt = shade(col, 0.32);
    let g = `<path d="M-56,-1190 L56,-1190 L52,-1150 Q0,-1140 -52,-1150Z" fill="${shade(col, 0.06)}" stroke="${dk}" stroke-width="1.2"/>`;
    let d = 'M-56,-1190'; for (let i = 0; i < 14; i++) { const x0 = -56 + i * 8, x1 = x0 + 8; d += ` Q${(x0 + x1) / 2},-1200 ${x1},-1190`; }
    g += `<path d="${d}" fill="none" stroke="${dk}" stroke-width="1"/>`;
    for (const s of [-1, 1]) for (const x of [14, 24, 34, 44]) g += `<path d="M${s * x},-1146 L${s * x},-960" stroke="${dk}" stroke-width="1.1" opacity="0.4"/><path d="M${s * (x + 2.2)},-1146 L${s * (x + 2.2)},-960" stroke="${lt}" stroke-width="1.2" opacity="0.55"/>`;
    g += `<path d="M-6,-1146 L-6,-900 M6,-1146 L6,-900" stroke="${dk}" stroke-width="1.1" opacity="0.55"/>` + [-1120, -1088, -1056, -1024, -992].map(y => T.button(0, y, 'cloth', 4.2, '#f6f2ea')).join('');
    // the cameo: a shell oval in a gold rim, a pale profile
    g += `<ellipse cx="0" cy="-1166" rx="11" ry="14" fill="#c8a050" stroke="#6a4a18" stroke-width="1"/><ellipse cx="0" cy="-1166" rx="8" ry="11" fill="${cameo}"/><path d="M-2,-1174 q5,2 4,7 q-3,1 -1,4 q3,3 0,6 q-4,1 -6,-3 q-2,-8 3,-14Z" fill="#f4e6da" opacity="0.9"/>`;
    return g;
  };
  // the skirt under a pinafore: from the waist to the hem in its own colour (the body is the blouse's colour)
  const SKIRT = (col) => `<path d="M-300,-842 L300,-842 L300,0 L-300,0Z" fill="${col}"/>` + [-200, -120, -40, 40, 120, 200].map(x => `<path d="M${x},-840 Q${x * 1.05},-420 ${x * 1.12},-10" stroke="${shade(col, -0.35)}" stroke-width="3" fill="none" opacity="0.25"/>`).join('');
  // the work pinafore: oatmeal linen, a bib on two straps, the waistband and its tie, a wide skirt to the hem, a patch
  // pocket with two fine brushes standing in it; soft folds and a few smudges of paint (o.glow: the dust on it in the dark)
  const PINAFORE = (col) => {
    const dk = shade(col, -0.32), lt = shade(col, 0.3);
    let g = `<path d="M-78,-1134 L78,-1134 L84,-842 L-84,-842Z" fill="${col}" stroke="${dk}" stroke-width="1.4"/>`;
    g += `<path d="M-74,-1134 L-104,-1196 M74,-1134 L104,-1196" stroke="${shade(col, -0.12)}" stroke-width="18" stroke-linecap="round"/><path d="M-74,-1134 L-104,-1196 M74,-1134 L104,-1196" stroke="${lt}" stroke-width="3" opacity="0.5"/>`;
    g += `<path d="M-78,-1128 L78,-1128" stroke="${dk}" stroke-width="0.9" stroke-dasharray="2.4 2" opacity="0.6"/>`;
    g += `<path d="M-200,-842 L200,-842 L230,-10 L-230,-10Z" fill="${col}" stroke="${dk}" stroke-width="1.4"/>`;
    g += `<path d="M-176,-858 L176,-858 L178,-826 L-178,-826Z" fill="${shade(col, -0.08)}" stroke="${dk}" stroke-width="1.3"/><path d="M-176,-852 L176,-852" stroke="${lt}" stroke-width="1.4" opacity="0.5"/>`;
    for (let x = -150; x <= 150; x += 50) g += `<path d="M${x},-822 Q${x * 1.06},-500 ${x * 1.14},-40" stroke="${dk}" stroke-width="3.6" fill="none" opacity="0.18" filter="url(#b2)"/><path d="M${x + 9},-822 Q${(x + 9) * 1.05},-520 ${(x + 9) * 1.12},-60" stroke="${lt}" stroke-width="2" fill="none" opacity="0.3"/>`;
    // the pocket on the bib's right, two brushes in it
    g += `<path d="M18,-1010 L70,-1010 L68,-940 L20,-940Z" fill="${shade(col, 0.05)}" stroke="${dk}" stroke-width="1.2"/><path d="M18,-1004 L70,-1004" stroke="${dk}" stroke-width="0.8" stroke-dasharray="2 2" opacity="0.6"/>`;
    for (const [x, h] of [[32, 54], [50, 46]]) g += `<path d="M${x},-1006 L${x + 3},${-1006 - h}" stroke="#6a4424" stroke-width="5" stroke-linecap="round"/><path d="M${x + 3},${-1006 - h} l1.5,-10" stroke="#3a2a1a" stroke-width="3.2" stroke-linecap="round"/>`;
    for (const [x, y, r] of [[-40, -980, 7], [-26, -900, 5], [120, -600, 6]]) g += `<circle cx="${x}" cy="${y}" r="${r}" fill="#a8a070" opacity="0.35" filter="url(#b1)"/>`;
    return g;
  };
  // the dance dress, 1917: dusty-rose silk, a soft round neck edged with a band, a high sash at the waist with a bow,
  // a fall of soft folds; long sheer sleeves (the sleeve colour)
  const DRESS = (col) => {
    const dk = shade(col, -0.3), lt = shade(col, 0.34);
    let g = `<path d="M-66,-1196 Q0,-1150 66,-1196" fill="none" stroke="${shade(col, -0.2)}" stroke-width="9"/><path d="M-66,-1192 Q0,-1146 66,-1192" fill="none" stroke="${lt}" stroke-width="2" opacity="0.6"/>`;
    for (let x = -60; x <= 60; x += 15) g += `<path d="M${x},-1160 Q${x * 0.9},-1030 ${x * 0.7},-900" stroke="${dk}" stroke-width="2.4" fill="none" opacity="0.25"/>`;
    g += `<path d="M-130,-940 L130,-940 L132,-892 L-132,-892Z" fill="${shade(col, -0.18)}" stroke="${dk}" stroke-width="1.3"/><path d="M-130,-930 L130,-930" stroke="${lt}" stroke-width="1.6" opacity="0.5"/>`;
    g += `<path d="M40,-916 q26,-22 40,-6 q-6,18 -40,6Z M40,-916 q-2,30 18,58 l10,-6 q-14,-24 -28,-52Z" fill="${shade(col, -0.1)}" stroke="${dk}" stroke-width="1.1"/>`;
    for (let x = -170; x <= 170; x += 34) g += `<path d="M${x * 0.5},-888 Q${x * 0.8},-500 ${x * 1.2},-30" stroke="${dk}" stroke-width="4" fill="none" opacity="0.2" filter="url(#b2)"/><path d="M${x * 0.5 + 8},-888 Q${x * 0.8 + 10},-520 ${x * 1.2 + 12},-50" stroke="${lt}" stroke-width="2.2" fill="none" opacity="0.35"/>`;
    return g;
  };

  // ======================================================= YOU: nineteen. A small oval face, soft cheeks, a delicate jaw
  // and chin, big green eyes under fine arched brows, a small button nose, full lips, freckles; auburn hair parted in
  // the middle, rolled soft over the ears and up into a bun.
  const YFX = { w: 0.94, len: 0.97, cheek: 1.06, jaw: 0.84, chinW: 0.84, chin: 0.98, eyeS: 1.12, eyeW: 1.05, eyeX: 1.0, eyeTilt: 3, hooded: 0, crow: 0, nose: 'button', noseS: 0.86, noseL: 0.9, lipT: 1.22, mouthW: 0.92, browT: 0.8, browArch: 2.5, earS: 0.92, freckles: 0.45 };
  const YHAIR = '#8a3e1e', YSKIN = '#f2cfb6', PIN = '#d6ccb8';
  const youBase = { kind: 'woman', skin: YSKIN, tunic: '#efe9de', sleeve: '#efe9de', belt: false, tailored: true, weave: { kind: 'linen', op: 0.13 },
    hair: YHAIR, hairStyle: 'bald', hairSeed: 4101, brow: '#6a2e14', lightX: 1, fx: YFX };
  Q.you = mk(Object.assign({}, youBase, { costume: BLOUSE('#efe9de') + SKIRT('#5a4234') + PINAFORE(PIN) }), { expr: 'neutral', iris: '#5f7a46', lid: 0.16 });
  Q.youDress = mk(Object.assign({}, youBase, { tunic: '#c4928a', sleeve: '#d2a49c', costume: DRESS('#c4928a') }), { expr: 'neutral', iris: '#5f7a46', lid: 0.16 });
  Q.youArt = () => HK.centrePart({ fx: YFX, col: YHAIR, id: 'yhr', light: 1, bun: 1 });

  // ======================================================= FRIENDS. A: fair, round-faced, wide blue-grey eyes, a straight
  // nose, a small mouth. B: dark, a long narrow face, deep-set brown eyes, a long nose, a wide mouth.
  const AFX = { w: 1.04, len: 0.94, cheek: 1.14, jaw: 0.92, chinW: 0.94, chin: 0.94, eyeS: 1.02, eyeW: 1.08, eyeX: 1.06, eyeTilt: -1, hooded: 0.05, crow: 0, nose: 'std', noseS: 0.92, noseL: 0.94, lipT: 1.04, mouthW: 0.9, browT: 0.75, browArch: 1, earS: 0.96 };
  const BFX = { w: 0.9, len: 1.06, cheek: 0.98, jaw: 0.9, chinW: 0.86, chin: 1.04, eyeS: 0.96, eyeW: 0.98, eyeX: 0.96, eyeTilt: 4, hooded: 0.18, crow: 0, nose: 'long', noseS: 0.95, noseL: 1.04, lipT: 1.1, mouthW: 1.04, browT: 1.0, browArch: 3, earS: 0.9 };
  Q.friendA = mk({ kind: 'woman', skin: '#f4d6c0', tunic: '#ece6dc', sleeve: '#ece6dc', belt: false, tailored: true, weave: { kind: 'linen', op: 0.13 },
    hair: '#d8b070', hairStyle: 'bald', hairSeed: 4201, brow: '#a07a40', lightX: 1, fx: AFX, costume: BLOUSE('#ece6dc', '#7a8a9a') + SKIRT('#4a4038') + PINAFORE('#d2c8b4') }, { expr: 'neutral', iris: '#5e7488', lid: 0.18 });
  Q.friendAArt = () => HK.centrePart({ fx: AFX, col: '#d8b070', id: 'ahr', light: 1, bun: 0.9 });
  Q.friendB = mk({ kind: 'woman', skin: '#e2b896', tunic: '#e8e2d6', sleeve: '#e8e2d6', belt: false, tailored: true, weave: { kind: 'linen', op: 0.13 },
    hair: '#1e1410', hairStyle: 'bald', hairSeed: 4301, brow: '#1a100a', lightX: 1, fx: BFX, costume: BLOUSE('#e8e2d6', '#9a5a4a') + SKIRT('#3e3430') + PINAFORE('#cec4b0') }, { expr: 'neutral', iris: '#3a2618', lid: 0.22 });
  Q.friendBArt = () => HK.centrePart({ fx: BFX, col: '#1e1410', id: 'bhr', light: 1, bun: 1.1 });

  // ======================================================= the BOSS: forty-five. A long face, a strong jaw, narrow hooded
  // eyes with crow's feet, a long nose, thin lips under a clipped moustache; dark hair oiled flat and parted on the side.
  // A cream shirt with a fine stripe, black sleeve garters, a charcoal waistcoat with his watch chain, a dark bow tie.
  // (after the first look still: the long face, the tall oiled hair and a black moustache read as a mask - now a fuller,
  // well-fed face, clean-shaven, the hair flatter and dark brown)
  const OFX = { w: 0.97, len: 1.02, cheek: 1.0, jaw: 0.97, chinW: 0.93, chin: 1.0, eyeS: 0.94, eyeW: 1.0, eyeTilt: -3, hooded: 0.34, crow: 0.55, nose: 'long', noseS: 1.0, noseL: 1.04, lipT: 0.9, mouthW: 1.0, browT: 1.1, browArch: 3, browOut: 2, earS: 1.0 };
  const OHAIR = '#3a2818';
  const GARTER = () => [-1, 1].map(s => `<path d="M${s * 150},-1010 L${s * 196},-1016" stroke="#141010" stroke-width="10"/>`).join('');
  Q.boss = mk({ kind: 'man', dims: { shX: 160, wX: 132, hemX: 150, sw: 80, hand: 112 }, skin: '#e4bea0', tunic: '#2a2622', sleeve: '#ece4d4', legs: '#26221e', feet: '#141010', belt: false, tailored: true,
    weave: { kind: 'twill', op: 0.12 },
    hair: OHAIR, hairStyle: 'bald', hairSeed: 4401, brow: '#2a1c12', stubble: 0.18, lightX: 1,
    costume: T.shirt({ col: '#ece4d4', placket: true }) + T.waistcoat({ col: '#2a2622', stripe: '#5a524a', chain: '#e0b450' }) + T.collar({ type: 'stand', tieCol: '#1a1414' }),
    fx: OFX }, { expr: 'stern', iris: '#4a3a2a', lid: 0.34 });
  Q.bossArt = () => HK.sidePart({ fx: OFX, col: OHAIR, id: 'ohr', light: 1, part: -32, crown: 0.74 });

  // ======================================================= the DENTIST: sixty. A broad face, heavy brows, small eyes
  // behind round wire spectacles, a broad nose, a grey goatee; grey hair parted on the side. A white dental coat.
  const DFX = { w: 1.02, len: 1.0, cheek: 1.08, jaw: 1.0, chinW: 1.0, chin: 0.98, eyeS: 0.92, eyeW: 1.0, eyeTilt: 0, hooded: 0.35, crow: 0.8, nose: 'broad', noseS: 1.06, noseL: 1.0, lipT: 0.85, mouthW: 1.0, browT: 1.2, browArch: 1, earS: 1.08, age: 0.7 };
  const DHAIR = '#bcb4a8';
  Q.dentist = mk({ kind: 'man', dims: { shX: 162, wX: 140, hemX: 158, sw: 82, hand: 114 }, skin: '#e0b49a', tunic: '#eeeae2', sleeve: '#ebe7de', legs: '#2a2826', feet: '#141210', belt: false, tailored: true,
    weave: { kind: 'linen', op: 0.1 },
    hair: DHAIR, hairStyle: 'bald', hairSeed: 4501, brow: '#9a9286', beard: '#a8a096', beardStyle: 'goatee', stubble: 0, lightX: 1,
    costume: T.shirt({ col: '#f2efe8' }) + T.collar({ type: 'stand', tieCol: '#3a2a26' }) + T.jacket({ col: '#eeeae2', pocket: 'pencil', weave: 'linen', weaveOp: 0.1 }),
    fx: DFX }, { expr: 'neutral', iris: '#5a5048', lid: 0.3, age: true });
  // the spectacles: round wire rims over the eyes, a bridge, the arms to the ears, a glint
  const SPECS = fx => { const ex = 33 * (fx.eyeX ?? 1) * (fx.w ?? 1), ey = -2; return [-1, 1].map(s => `<circle cx="${f(s * ex)}" cy="${ey}" r="23" fill="#e8f0f0" fill-opacity="0.08" stroke="#4a4036" stroke-width="2.6"/><path d="M${f(s * ex - 12)},${ey - 12} q6,-4 12,-2" stroke="#fff" stroke-width="2" opacity="0.5"/>`).join('') + `<path d="M${f(-ex + 22)},${ey - 4} Q0,${ey - 12} ${f(ex - 22)},${ey - 4}" stroke="#4a4036" stroke-width="2.4" fill="none"/>` + [-1, 1].map(s => `<path d="M${f(s * (ex + 23))},${ey} L${f(s * 80)},${ey - 4}" stroke="#4a4036" stroke-width="2.2"/>`).join(''); };
  Q.dentistArt = () => { const h = HK.sidePart({ fx: DFX, col: DHAIR, id: 'dhr', light: 1, part: -28, crown: 0.84 }); return { back: h.back, front: h.front + SPECS(DFX) }; };

  // ======================================================= a CHEMIST in the company's lab: thirty-five; his face mostly
  // hidden by a white cloth mask and round dark goggles, brown hair. A heavy grey lead apron to the knees over a shirt,
  // brown rubber gloves.
  const CFX = { w: 1.0, len: 1.02, cheek: 1.0, jaw: 1.04, chinW: 1.0, chin: 1.0, eyeS: 0.94, eyeW: 1.0, eyeTilt: 0, hooded: 0.2, crow: 0.2, nose: 'std', noseS: 1.0, noseL: 1.0, lipT: 0.9, mouthW: 1.0, browT: 1.05, browArch: 0, earS: 1.0 };
  const LEAD = '#5a5c5e';
  const LEADAPRON = () => {
    let g = `<path d="M-120,-1196 L-96,-1100 M120,-1196 L96,-1100" stroke="#2a2a2a" stroke-width="14"/>`;
    g += `<path d="M-110,-1110 L110,-1110 L132,-860 L220,-830 L230,-300 L-230,-300 L-220,-830 L-132,-860Z" fill="${LEAD}" stroke="#1e1e20" stroke-width="2"/>`;
    g += `<path d="M-90,-1100 L-100,-320 M0,-1104 L0,-310 M90,-1100 L100,-320" stroke="#3e4042" stroke-width="2.2" opacity="0.6"/><path d="M-86,-1100 L-96,-320 M4,-1104 L4,-310 M94,-1100 L104,-320" stroke="#8a8c8e" stroke-width="1.6" opacity="0.4"/>`;
    g += `<path d="M-200,-700 Q0,-680 200,-700" stroke="#2a2a2c" stroke-width="3" fill="none" opacity="0.5"/>`;
    return g;
  };
  Q.chemist = mk({ kind: 'man', dims: { shX: 166, wX: 140, hemX: 158, sw: 84, hand: 116 }, skin: '#e2b898', tunic: '#5a5c5e', sleeve: '#d8d2c6', legs: '#2a2826', feet: '#141210', belt: false, tailored: true,
    weave: { kind: 'linen', op: 0.1 }, glove: '#6a4a2e',
    hair: '#4a3020', hairStyle: 'bald', hairSeed: 4601, brow: '#3a2416', stubble: 0, lightX: 1,
    costume: T.shirt({ col: '#e2dcd0' }) + T.collar({ type: 'stand', tie: 'none' }) + LEADAPRON(),
    fx: CFX }, { expr: 'neutral', iris: '#4a3a2a', lid: 0.3 });
  // the mask over the nose and mouth (white cloth, ties to the ears, a fold) and round goggles with dark lenses
  const MASK = () => `<path d="M-74,10 Q0,-4 74,10 L70,86 Q0,124 -70,86Z" fill="#ece8e0" stroke="#7a766c" stroke-width="2"/><path d="M-66,40 Q0,30 66,40 M-62,66 Q0,58 62,66" stroke="#b8b2a6" stroke-width="2" fill="none"/><path d="M-74,14 L-84,4 M74,14 L84,4 M-70,80 L-84,70 M70,80 L84,70" stroke="#7a766c" stroke-width="3"/>` +
    [-1, 1].map(s => `<circle cx="${s * 33}" cy="-4" r="22" fill="#2a2620" stroke="#8a7a5a" stroke-width="5"/><path d="M${s * 33 - 10},-14 q8,-6 16,-2" stroke="#e8e0c8" stroke-width="3" opacity="0.6"/>`).join('') + `<path d="M-11,-6 Q0,-12 11,-6" stroke="#8a7a5a" stroke-width="4" fill="none"/><path d="M-55,-4 L-84,-10 M55,-4 L84,-10" stroke="#3a3228" stroke-width="5"/>`;
  Q.chemistArt = () => { const h = HK.sidePart({ fx: CFX, col: '#4a3020', id: 'chr', light: 1, part: 30, crown: 0.86 }); return { back: h.back, front: h.front + MASK() }; };

  // ======================================================= the DIGGERS at the grave, 1927: two labourers in flat caps,
  // collarless shirts, dark waistcoats, a neckerchief. One broad and moustached (fifty), one lean and stubbled (thirty).
  // (the cap's peak sits above the brows: their faces in the coffin's light are the shot)
  const CAP = col => `<g transform="translate(0,-8) scale(0.86,0.8)"><path d="M-136,-86 C-150,-170 -84,-214 4,-214 C96,-214 154,-168 140,-82 Q4,-112 -136,-86Z" fill="${col}" stroke="#141210" stroke-width="2.8"/>` +
    `<path d="M-130,-90 Q4,-118 134,-86 Q130,-62 4,-74 Q-126,-66 -130,-90Z" fill="${shade(col, -0.38)}" stroke="#141210" stroke-width="2.4"/><path d="M-110,-80 Q4,-98 116,-78" stroke="${shade(col, 0.3)}" stroke-width="2.4" fill="none" opacity="0.45"/>` +
    `<path d="M-74,-196 Q4,-214 84,-192" stroke="${shade(col, 0.28)}" stroke-width="5" fill="none" opacity="0.4"/><path d="M4,-212 L8,-120" stroke="${shade(col, -0.3)}" stroke-width="2" opacity="0.5"/><circle cx="4" cy="-208" r="7" fill="${shade(col, -0.2)}" stroke="#141210" stroke-width="1.5"/></g>`;
  const KERCHIEF = col => `<path d="M-52,-1196 Q0,-1150 52,-1196 L40,-1166 Q0,-1128 -40,-1166Z" fill="${col}" stroke="#1a1210" stroke-width="1.6"/><path d="M-10,-1150 L-24,-1110 L4,-1124 L22,-1106 L12,-1150Z" fill="${shade(col, -0.15)}" stroke="#1a1210" stroke-width="1.4"/>`;
  const G1FX = { w: 1.08, len: 0.98, cheek: 1.1, jaw: 1.12, chinW: 1.06, chin: 0.96, eyeS: 0.9, eyeW: 1.0, eyeTilt: -2, hooded: 0.4, crow: 0.9, nose: 'broad', noseS: 1.1, noseL: 1.0, lipT: 0.85, mouthW: 1.04, browT: 1.25, browArch: -1, earS: 1.06, age: 0.55 };
  const G2FX = { w: 0.92, len: 1.06, cheek: 0.92, jaw: 1.0, chinW: 0.92, chin: 1.04, eyeS: 0.96, eyeW: 0.98, eyeTilt: 2, hooded: 0.15, crow: 0.2, nose: 'long', noseS: 1.0, noseL: 1.06, lipT: 0.9, mouthW: 0.98, browT: 1.05, browArch: 2, earS: 1.0 };
  Q.digger1 = mk({ kind: 'man', dims: { shX: 174, wX: 150, hemX: 166, sw: 88, hand: 118 }, skin: '#d8a888', tunic: '#2e2a26', sleeve: '#b8ae9c', legs: '#2a2622', feet: '#141210', belt: false, tailored: true,
    weave: { kind: 'twill', op: 0.14 },
    hair: '#6a6258', hairStyle: 'bald', hairSeed: 4701, brow: '#4a4238', mustache: '#5a5248', stubble: 0.3, lightX: 1,
    costume: T.shirt({ col: '#b8ae9c' }) + T.waistcoat({ col: '#2e2a26', stripe: '#3e3a34' }) + KERCHIEF('#6a2a1e'),
    fx: G1FX }, { expr: 'neutral', iris: '#4a3a2a', lid: 0.3, age: true });
  Q.digger1Art = () => { const h = HK.sidePart({ fx: G1FX, col: '#6a6258', id: 'g1hr', light: 1, part: -30, crown: 0.8 }); return { back: h.back, front: h.front + CAP('#3a342c') }; };
  Q.digger2 = mk({ kind: 'man', dims: { shX: 158, wX: 132, hemX: 150, sw: 80, hand: 112 }, skin: '#e2b494', tunic: '#26282a', sleeve: '#c8c0b0', legs: '#2a2622', feet: '#141210', belt: false, tailored: true,
    weave: { kind: 'twill', op: 0.14 },
    hair: '#2a1e14', hairStyle: 'bald', hairSeed: 4801, brow: '#2a1c12', stubble: 0.55, lightX: 1,
    costume: T.shirt({ col: '#c8c0b0' }) + T.waistcoat({ col: '#26282a', stripe: '#36383a' }) + KERCHIEF('#2a3a4a'),
    fx: G2FX }, { expr: 'neutral', iris: '#3a2a1e', lid: 0.26 });
  Q.digger2Art = () => { const h = HK.sidePart({ fx: G2FX, col: '#2a1e14', id: 'g2hr', light: 1, part: 30, crown: 0.84 }); return { back: h.back, front: h.front + CAP('#2c2a28') }; };

  Object.assign(Q.HAND, { you: 104, friendA: 104, friendB: 104, boss: 112, dentist: 114, chemist: 116, digger1: 118, digger2: 112 });
})(window);
