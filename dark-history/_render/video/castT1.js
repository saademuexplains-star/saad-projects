// Test cast (an any-topic test of the skill, 2026-11-08): Vienna General Hospital, the First Obstetric Clinic, 1847.
// The clean rig (G.RIG_CRISP), every garment dressed with tailor.js, every face new and different, one main colour
// per character: you, Ignaz Semmelweis, a young doctor (bottle-green frock coat); a mother in the ward with childbed
// fever (cream linen nightgown); Professor Johann Klein, your chief (black frock coat).
(function (G) {
  const { person, shade } = G.RIG, K0 = G.CAST, T = G.TAILOR;
  const Q = {};
  const face = (base, p) => Object.assign({}, base, p.face || {}, p.blink ? { lid: Math.max((p.face && p.face.lid) ?? base.lid ?? 0.2, p.blink) } : {});
  const mk = (base, faceBase) => p => person(Object.assign({}, base, p, { fx: Object.assign({}, base.fx, p.fx || {}), face: face(faceBase, p) }));
  Q.blink = K0.blink; Q.talk = K0.talk; Q.breath = K0.breath;
  const OUTL = 'stroke="#20140c" stroke-width="2" stroke-linejoin="round"';

  // head-local art drawn exactly where the rig puts the head (from cast14.js): back pieces behind the body, front over it
  Q.headArt = (P, o, svg) => {
    const s = o.s || 1, b = o.breath || 0, sx = Math.round(s * (1 - b * 0.0015) * 1e5) / 1e5, sy = Math.round(s * (1 + b * 0.004) * 1e5) / 1e5, hsc = o.headScale ?? 1;
    return `<g transform="translate(${o.x || 0},${o.y || 0}) rotate(${o.sway || 0}) scale(${sx},${sy})"><g transform="translate(0,${P.D.headY + (1 - hsc) * 110}) rotate(${o.tilt || 0}) scale(${hsc})">${svg}</g></g>`;
  };
  Q.withArt = (P, o, art, body) => (art && art.back ? Q.headArt(P, o, art.back) : '') + body + (art && art.front ? Q.headArt(P, o, art.front) : '');

  // ---------------- 1840s hair for the mother (rig hairStyle 'bald'): a centre parting smoothed over the tops of the ears
  // (cast14's PARTED), the long hair loose down her back after the birth, one lock forward over her shoulder, and the
  // strands the fever has pulled loose by her face. The candle side (+x) carries a warm sheen.
  const hairGrad = (id, col) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(col, 0.16)}"/><stop offset="1" stop-color="${shade(col, -0.22)}"/></linearGradient>`;
  const PARTED = (col, id) => {
    let g = `<defs>${hairGrad(id, col)}</defs><path d="M-82,12 C-98,-40 -100,-122 -62,-152 C-32,-174 32,-174 62,-152 C100,-122 98,-40 82,12 L70,10 C68,-28 62,-58 50,-76 C34,-96 12,-102 0,-97 C-12,-102 -34,-96 -50,-76 C-62,-58 -68,-28 -70,10Z" fill="url(#${id})" ${OUTL}/>`;
    for (const s of [-1, 1]) for (let i = 0; i < 4; i++) g += `<path d="M${s * 4},${-100 - i * 14} C${s * (34 + i * 10)},${-112 - i * 12} ${s * (70 + i * 6)},${-90 - i * 8} ${s * (80 + i * 2)},${-20 - i * 12}" stroke="${shade(col, i % 2 ? 0.3 : -0.38)}" stroke-width="${i % 2 ? 1.6 : 2.2}" fill="none" opacity="0.6"/>`;
    g += `<path d="M0,-98 L0,-150" stroke="${shade(col, -0.45)}" stroke-width="2" opacity="0.6"/><path d="M-40,-148 C-14,-162 14,-162 40,-148" stroke="#fff" stroke-width="5" opacity="0.16" fill="none"/>`;
    g += `<path d="M52,-150 C84,-128 96,-70 86,-6" stroke="#ffc890" stroke-width="5" fill="none" opacity="0.32" stroke-linecap="round"/>`;
    return g;
  };
  const LONGBACK = (col, id) => {
    let g = `<defs>${hairGrad(id, col)}</defs><path d="M-90,-40 C-118,40 -130,160 -124,262 C-120,306 -108,334 -92,352 L92,352 C108,334 120,306 124,262 C130,160 118,40 90,-40 C78,-142 -78,-142 -90,-40Z" fill="url(#${id})" ${OUTL}/>`;
    for (const s of [-1, 1]) for (let i = 0; i < 5; i++) g += `<path d="M${s * (78 + i * 7)},${-20 + i * 6} C${s * (104 + i * 4)},${70 + i * 10} ${s * (112 + i * 2)},${180} ${s * (100 + i * 3)},${330}" stroke="${shade(col, i % 2 ? 0.28 : -0.4)}" stroke-width="${i % 2 ? 1.6 : 2.4}" fill="none" opacity="0.55"/>`;
    return g;
  };
  const LOCK = (col, id) => `<path d="M76,8 C96,60 122,140 125,210 C127,262 117,302 100,334 C108,292 110,252 105,212 C99,152 86,92 66,30Z" fill="url(#${id})" ${OUTL}/>` +
    `<path d="M80,24 C100,80 118,150 116,232 M90,40 C108,100 120,180 110,290" stroke="${shade(col, -0.35)}" stroke-width="1.8" fill="none" opacity="0.6"/><path d="M86,30 C106,90 122,160 120,220" stroke="#ffc890" stroke-width="3" fill="none" opacity="0.35"/>`;
  // ---------------- 1840s hair for the men (rig hairStyle 'bald'), drawn in the base man head and carried onto each
  // character's morphed head with the rig's own face map (faceP: skull width, cheeks, jaw, length), like its beards
  const mapD = (d, FP) => d.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g, (m, a, b) => `${(Math.round(FP.MX(+a, +b) * 10) / 10)},${(Math.round(FP.MY(+b) * 10) / 10)}`);
  // a side parting on his left, swept across the crown in a soft wave, full over the tops of the ears, trimmed sideburns
  const SIDEPART = (col, id, fx) => {
    const FP = G.RIG.faceP('man', fx), M = d => mapD(d, FP);
    let g = `<defs>${hairGrad(id, col)}</defs><path d="${M('M-80,22 C-84,-6 -88,-24 -90,-46 C-95,-90 -86,-122 -62,-136 C-30,-154 36,-156 68,-134 C90,-120 97,-90 90,-46 C88,-24 84,-6 80,22 L68,22 C67,-4 67,-30 66,-52 C56,-76 38,-86 22,-86 C6,-87 -20,-95 -44,-88 C-58,-82 -66,-62 -66,-34 C-66,-12 -67,6 -68,22Z')}" fill="url(#${id})" ${OUTL}/>`;
    for (let i = 0; i < 6; i++) g += `<path d="${M(`M${28 - i * 2},${-134 + i * 7} C${4 - i * 4},${-142 + i * 9} ${-46 - i * 4},${-128 + i * 10} ${-80 + i * 2},${-84 + i * 12}`)}" stroke="${shade(col, i % 2 ? 0.3 : -0.4)}" stroke-width="${i % 2 ? 1.5 : 2}" fill="none" opacity="0.6"/>`;
    for (let i = 0; i < 3; i++) g += `<path d="${M(`M${34 + i * 6},${-132 + i * 8} C${54 + i * 6},${-130 + i * 8} ${78 + i * 2},${-112 + i * 10} ${86 - i * 2},${-70 + i * 12}`)}" stroke="${shade(col, i % 2 ? 0.3 : -0.4)}" stroke-width="1.6" fill="none" opacity="0.55"/>`;
    g += `<path d="${M('M31,-140 L26,-100')}" stroke="${shade(col, -0.5)}" stroke-width="2.2" opacity="0.7"/><path d="${M('M-10,-90 C-26,-98 -40,-96 -50,-88')}" stroke="${shade(col, -0.45)}" stroke-width="2" fill="none" opacity="0.6"/>`;
    g += `<path d="${M('M24,-138 C52,-136 76,-116 84,-76')}" stroke="#e8c090" stroke-width="5" fill="none" opacity="0.3" stroke-linecap="round"/>`;
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) g += `<path d="${M(`M${s * (70 + i * 4)},${-30 + i * 4} L${s * (70 + i * 4)},${16}`)}" stroke="${shade(col, i % 2 ? 0.3 : -0.45)}" stroke-width="1.3" opacity="0.55"/>`;
    return g;
  };
  // a bald crown with thin grey hair left round the sides and back: a band hugging the skull, drawn behind the head so
  // only a margin shows past its outline, from the temples down behind the ears ...
  const FRINGE = (col, id, fx) => {
    const FP = G.RIG.faceP('man', fx), M = d => mapD(d, FP);
    let g = `<defs>${hairGrad(id, col)}</defs>`;
    for (const s of [-1, 1]) {
      g += `<path d="${M(`M${s * 50},-114 C${s * 70},-112 ${s * 84},-100 ${s * 88},-80 C${s * 94},-54 ${s * 95},-20 ${s * 92},10 C${s * 90},26 ${s * 86},38 ${s * 78},46 L${s * 70},40 C${s * 74},10 ${s * 76},-30 ${s * 72},-64 C${s * 68},-90 ${s * 60},-106 ${s * 50},-114Z`)}" fill="url(#${id})" ${OUTL}/>`;
      for (let i = 0; i < 3; i++) g += `<path d="${M(`M${s * (62 + i * 6)},${-108 + i * 8} C${s * (84 + i * 2)},${-84 + i * 6} ${s * (90 + i)},${-30} ${s * (84 + i * 2)},${30}`)}" stroke="${shade(col, i % 2 ? 0.25 : -0.3)}" stroke-width="1.3" fill="none" opacity="0.6"/>`;
    }
    return g;
  };
  // ... and short grey sideburns in front of the ears (drawn over the face)
  const CHOPS = (col, id, fx) => {
    const FP = G.RIG.faceP('man', fx), M = d => mapD(d, FP);
    let g = `<defs>${hairGrad(id, col)}</defs>`;
    for (const s of [-1, 1]) {
      g += `<path d="${M(`M${s * 70},-56 C${s * 75},-40 ${s * 78},-16 ${s * 79},8 L${s * 78},22 L${s * 68},22 C${s * 67},0 ${s * 66},-24 ${s * 64},-44Z`)}" fill="url(#${id})" ${OUTL} opacity="0.95"/>`;
      for (let i = 0; i < 2; i++) g += `<path d="${M(`M${s * (68 + i * 5)},${-44 + i * 4} L${s * (70 + i * 5)},${18}`)}" stroke="${shade(col, i % 2 ? 0.3 : -0.32)}" stroke-width="1.2" fill="none" opacity="0.55"/>`;
    }
    return g;
  };
  const STRANDS = (col, k) => `<g opacity="${Math.min(1, k * 1.4).toFixed(3)}" fill="none" stroke-linecap="round">` +
    `<path d="M-58,-96 C-80,-60 -86,-10 -78,${(40 + k * 50).toFixed(1)}" stroke="${col}" stroke-width="5"/><path d="M-44,-100 C-62,-70 -66,-40 -60,${(-6 + k * 40).toFixed(1)}" stroke="${shade(col, 0.2)}" stroke-width="3"/>` +
    `<path d="M62,-96 C84,-58 90,-20 82,${(20 + k * 60).toFixed(1)}" stroke="${col}" stroke-width="4.5"/><path d="M20,-104 C40,-90 46,-70 38,${(-50 + k * 30).toFixed(1)}" stroke="${shade(col, -0.2)}" stroke-width="3"/></g>`;

  // ======================================================= YOU: Ignaz Semmelweis at twenty-nine. A round open face, full
  // cheeks, a soft square chin, warm brown eyes under straight brows, a straight nose, a full moustache; the brown hair
  // already going back at the temples. The bottle-green frock coat with notched lapels, the shirt's standing collar and
  // a black silk bow at the throat, horn buttons.
  const SFX = { w: 1.06, len: 0.96, cheek: 1.12, jaw: 1.04, chinW: 1.05, chin: 0.96, eyeS: 1.0, eyeW: 1.0, eyeTilt: 1, hooded: 0.15, crow: 0.2, nose: 'std', noseS: 1.04, noseL: 0.98, lipT: 1.05, mouthW: 0.98, browT: 1.2, browArch: 0, earS: 1.0 };
  Q.semm = mk({ kind: 'man', dims: { shX: 156, wX: 126, hemX: 148, sw: 76, hand: 112 }, skin: '#e8bf9e', tunic: '#30402c', sleeve: '#2d3c29', legs: '#22201c', feet: '#141010', belt: false, tailored: true,
    hair: '#5e4026', hairStyle: 'bald', hairSeed: 3101, brow: '#4a301a', mustache: '#4e331c', stubble: 0.35, lightX: 1,
    costume: T.shirt({ col: '#f3efe6', placket: true }) + T.collar({ type: 'stand', tieCol: '#141210' }) + T.jacket({ col: '#30402c', pocket: 'plain', bkind: 'horn' }),
    fx: SFX },
  { expr: 'anxious', iris: '#5a4028', lid: 0.2 });
  Q.semmArt = () => ({ front: SIDEPART('#5e4026', 'shr', SFX) });

  // ======================================================= THE MOTHER: twenty, an oval face, a narrow chin, wide-set
  // hazel-green eyes, a small straight nose, full lips, freckles; long dark chestnut hair loose after the birth. A high-
  // necked linen nightgown: a gathered neck with a narrow frill, the drawstring tied in a faded ribbon, a short placket.
  const GOWN = (() => {
    let g = '';
    for (const x of [-46, -30, -14, 14, 30, 46]) g += `<path d="M${x},-1132 Q${x * 1.5},-1070 ${x * 1.9},-1000" stroke="#a8a090" stroke-width="2.4" fill="none" opacity="0.45"/><path d="M${x + 5},-1132 Q${x * 1.5 + 6},-1070 ${x * 1.9 + 7},-1000" stroke="#ffffff" stroke-width="2" fill="none" opacity="0.35"/>`;
    g += `<path d="M-6,-1130 L-5,-1010 M6,-1130 L5,-1010" stroke="#b8b0a0" stroke-width="1.4"/>` + [-1100, -1060, -1020].map(y => T.button(0, y, 'cloth', 5, '#efebe2')).join('');
    let d = 'M-58,-1150'; for (let i = 0; i < 9; i++) { const x0 = -58 + i * 12.9, x1 = x0 + 12.9; d += ` Q${(x0 + x1) / 2},-1128 ${x1},-1150`; }
    g += `<path d="${d} L58,-1158 L-58,-1158Z" fill="#f2eee6" stroke="#a8a090" stroke-width="1.2"/>`;
    g += `<path d="M0,-1140 L-16,-1150 Q-20,-1140 -16,-1130Z M0,-1140 L16,-1150 Q20,-1140 16,-1130Z" fill="#b88a7e" stroke="#6a4a42" stroke-width="1"/><path d="M-2,-1138 L-10,-1112 M2,-1138 L9,-1110" stroke="#b88a7e" stroke-width="3" stroke-linecap="round"/>`;
    return g;
  })();
  const MHAIR = '#4a2814';
  Q.mother = mk({ kind: 'woman', skin: '#ecc8ac', tunic: '#d9d3c5', sleeve: '#d3cdbf', belt: false, tailored: true,
    hair: MHAIR, hairStyle: 'bald', hairSeed: 3201, brow: '#3a1e0e', lightX: 1, costume: GOWN,
    fx: { w: 0.97, len: 1.03, cheek: 1.04, jaw: 0.9, chinW: 0.88, chin: 1.0, eyeS: 1.0, eyeW: 1.02, eyeX: 1.04, eyeTilt: 0, hooded: 0.08, crow: 0, nose: 'std', noseS: 0.92, noseL: 0.96, lipT: 1.1, mouthW: 0.96, browT: 0.9, browArch: 1.5, earS: 0.96, freckles: 0.3 } },
  { expr: 'fear', iris: '#5a6a3c', lid: 0.12 });
  Q.motherArt = (k = 0.5) => ({ back: LONGBACK(MHAIR, 'mhb'), front: PARTED(MHAIR, 'mhf') + LOCK(MHAIR, 'mhf') + STRANDS(MHAIR, k) });

  // ======================================================= PROFESSOR JOHANN KLEIN: sixty, heavy. A broad fleshy face with
  // jowls and a double chin, small pale grey eyes under heavy hooded lids and thick brows, a big hooked nose, thin lips,
  // a mole on the cheek; the white hair gone back to a fringe. Clean-shaven. The black frock coat, a pleated shirt
  // front, the standing collar and a black stock.
  const KFX = { w: 1.1, len: 1.05, cheek: 1.16, jaw: 1.18, chinW: 1.14, chin: 0.96, eyeS: 0.86, eyeW: 0.95, eyeTilt: -2, hooded: 0.55, crow: 1, lidAdd: 0.04, nose: 'hook', noseS: 1.12, noseL: 1.08, lipT: 0.75, mouthW: 1.02, browT: 1.45, browArch: -1, browOut: 3, earS: 1.12, dbl: 0.8, mole: [-50, 40], age: 0.8 };
  Q.klein = mk({ kind: 'man', dims: { shX: 178, wX: 158, hemX: 178, sw: 88, hand: 120 }, skin: '#dcae92', tunic: '#1f1d1c', sleeve: '#1d1b1a', legs: '#1a1818', feet: '#0e0c0c', belt: false, tailored: true,
    hair: '#cfc9be', hairStyle: 'bald', hairSeed: 3301, brow: '#a8a298', stubble: 0.12, lightX: 1,
    costume: T.shirt({ col: '#efebe0', pleats: true }) + T.collar({ type: 'stand', tieCol: '#0c0a0a' }) + T.jacket({ col: '#1f1d1c', pocket: null, buttons: [-930, -852], bkind: 'horn' }),
    fx: KFX },
  { expr: 'stern', iris: '#5e646a', lid: 0.34, age: true });
  Q.kleinArt = () => ({ back: FRINGE('#bdb6aa', 'khb', KFX), front: CHOPS('#bdb6aa', 'khf', KFX) });

  // grip maths needs each rig's hand size
  Q.HAND = { semm: 112, mother: 104, klein: 120 };
  G.QCAST = Q;
})(window);
