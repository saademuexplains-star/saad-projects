// Cast for "The Rabies Boy" (Alsace and Paris, 1885). New faces for everyone: you (a boy of nine, later the grown
// man at the gate), the scientist who isn't a doctor, the doctor who gives the shots, your mother in her Alsatian
// bow, the dying man in the ward, and the nursing sister in her white cornette.
(function (G) {
  const { person } = G.RIG, K0 = G.CAST;
  const Q = {};
  const face = (base, p) => Object.assign({}, base, p.face || {}, p.blink ? { lid: Math.max((p.face && p.face.lid) ?? base.lid ?? 0.2, p.blink) } : {});
  const mk = (base, faceBase) => p => person(Object.assign({}, base, p, { fx: Object.assign({}, base.fx, p.fx || {}), face: face(faceBase, p) }));
  Q.blink = K0.blink; Q.talk = K0.talk; Q.breath = K0.breath;

  // ---- head props (head-local units: face centre at 0,0; they turn with the head)
  // the Alsatian black silk bow: two great loops above the head, a knot, a small black cap over the crown
  const BOW = '<path d="M-84,-96 C-86,-176 86,-176 84,-96 C40,-118 -40,-118 -84,-96Z" fill="#17151a" stroke="#000" stroke-width="2.5"/>' +
    [-1, 1].map(s => `<path d="M0,-156 C${s * -50},-226 ${s * -232},-268 ${s * -262},-182 C${s * -276},-128 ${s * -150},-112 0,-140Z" fill="#141216" stroke="#000" stroke-width="3"/>` +
      `<path d="M${s * -30},-160 C${s * -90},-214 ${s * -196},-236 ${s * -230},-196" stroke="#5a5866" stroke-width="5" fill="none" opacity="0.6"/>` +
      `<path d="M${s * -40},-146 C${s * -110},-150 ${s * -200},-150 ${s * -246},-170" stroke="#000" stroke-width="4" fill="none" opacity="0.6"/>`).join('') +
    '<rect x="-26" y="-174" width="52" height="44" rx="12" fill="#1c1a20" stroke="#000" stroke-width="2.5"/><path d="M-18,-166 L18,-166" stroke="#6a6876" stroke-width="3" opacity="0.6"/>';
  // the nursing sister's starched white cornette: a band over the brow and two great upswept wings
  const CORNETTE = '<path d="M-92,-84 C-96,-128 96,-128 92,-84 C40,-104 -40,-104 -92,-84Z" fill="#f6f4ee" stroke="#8a8a84" stroke-width="2"/>' +
    [-1, 1].map(s => `<path d="M${s * 70},-104 C${s * 150},-150 ${s * 250},-210 ${s * 300},-300 C${s * 312},-248 ${s * 284},-170 ${s * 210},-118 C${s * 170},-92 ${s * 120},-86 ${s * 84},-88Z" fill="#fbfaf6" stroke="#8a8a84" stroke-width="2.5"/>` +
      `<path d="M${s * 100},-108 C${s * 170},-146 ${s * 240},-196 ${s * 280},-262" stroke="#c8c8c0" stroke-width="3" fill="none"/>`).join('');
  // a dark kerchief over the hair, its folded edge across the brow, knotted at the nape (an Alsatian mother in Paris)
  const SCARF = '<path d="M-90,-30 C-100,-118 -62,-162 0,-164 C62,-162 100,-118 90,-30 C84,-66 64,-90 0,-94 C-64,-90 -84,-66 -90,-30Z" fill="#2e1c22" stroke="#0a0406" stroke-width="2.5"/>' +
    '<path d="M-84,-56 C-66,-88 66,-88 84,-56" stroke="#4a2e36" stroke-width="7" fill="none"/><path d="M-60,-130 C-30,-148 30,-148 60,-130" stroke="#4a2e36" stroke-width="3" fill="none" opacity="0.6"/>' +
    [[-50, -118], [-14, -134], [24, -130], [56, -112], [-30, -104], [36, -100]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#8a5a4a" opacity="0.7"/>`).join('');
  // the gatekeeper's peaked cap: navy crown, black visor, brass badge (seated low on the brow)
  const KEPI = '<g transform="translate(0,34)"><path d="M-86,-104 L86,-104 L80,-182 L-80,-182Z" fill="#1e2a44" stroke="#05070c" stroke-width="2.5"/><ellipse cx="0" cy="-182" rx="80" ry="12" fill="#26345a" stroke="#05070c" stroke-width="2"/>' +
    '<rect x="-86" y="-122" width="172" height="18" fill="#0e121c"/><path d="M-90,-104 Q0,-80 90,-104 L84,-96 Q0,-70 -84,-96Z" fill="#0a0a0c" stroke="#000" stroke-width="2"/><path d="M-60,-98 Q0,-84 60,-98" stroke="#fff" stroke-width="2" opacity="0.25" fill="none"/>' +
    '<circle cx="0" cy="-140" r="12" fill="#c8a040" stroke="#5a4010" stroke-width="1.5"/><path d="M-6,-140 L6,-140 M0,-146 L0,-134" stroke="#5a4010" stroke-width="2"/></g>';
  Q.HEADP = { BOW, CORNETTE, KEPI, SCARF };

  // YOU: nine years old, from an Alsatian village. Ash-blond cropped hair, a square little face, freckles, big ears,
  // a broad nose, serious grey-green eyes. Outfits change by scene (o.outfit: 'shirt' | 'smock' | 'night')
  const OUTFIT = {
    shirt: { tunic: '#ece6d8', sleeve: '#e6e0d0', legs: '#3a3a48', feet: '#2a1e14' },
    smock: { tunic: '#3a5a8a', sleeve: '#36547e', legs: '#3a3a48', feet: '#2a1e14', strap: '#6a4424' },
    night: { tunic: '#efeae0', sleeve: '#ebe6da', robe: true, feet: '#e8c8b0' },
  };
  const youBase = {
    kind: 'kid', dims: { hand: 74 }, skin: '#f0caa8', belt: false, hair: '#a8884e', hairStyle: 'short', hairSeed: 113, brow: '#7a5a2e', lightX: -1,
    fx: { w: 1.04, jaw: 1.06, cheek: 0.96, chinW: 1.02, eyeS: 0.94, eyeTilt: -2, nose: 'broad', noseS: 0.92, lipT: 0.9, mouthW: 0.95, earS: 1.22, freckles: 0.45, browT: 1.1 },
  };
  const youMk = mk(youBase, { expr: 'anxious', iris: '#6a7a5a', lid: 0.14 });
  Q.you = p => youMk(Object.assign({}, OUTFIT[p.outfit || 'shirt'], p));

  // YOU, grown: the same grey-green eyes and big ears, a full ash-brown moustache, the gatekeeper's navy uniform and cap
  const UNIFORM = [-1040, -980, -920, -860, -800].map(y => `<circle cx="0" cy="${y}" r="7" fill="#c8a040" stroke="#5a4010" stroke-width="1.5"/>`).join('') +
    '<path d="M-60,-1150 L0,-1100 L60,-1150" stroke="#0a0e18" stroke-width="10" fill="none"/>' + [-1, 1].map(s => `<rect x="${s * 46 - 12}" y="-1140" width="24" height="16" rx="3" fill="#c8a040" opacity="0.85"/>`).join('');
  Q.youAdult = mk({
    kind: 'man', dims: { shX: 162, wX: 134, sw: 82, hemY: -500, hemX: 150, hand: 116 }, skin: '#e2b896', tunic: '#1e2a44', sleeve: '#1a2540', legs: '#1a2236', feet: '#0e0c0c', belt: '#0e0c0c', leatherBelt: true, buckle: '#c8a040',
    props: UNIFORM, headProps: KEPI, hair: '#8a7a5a', hairStyle: 'short', hairSeed: 114, mustache: '#8a6a44', mstyle: 'walrus', brow: '#6a5a3e', stubble: 0.2, lightX: -1,
    fx: { w: 1.04, jaw: 1.08, cheek: 0.96, chinW: 1.02, eyeS: 1.0, eyeTilt: -2, hooded: 0.15, crow: 0.8, nose: 'broad', noseS: 1.0, lipT: 0.85, earS: 1.2, browT: 1.25 },
  }, { expr: 'neutral', iris: '#6a7a5a', lid: 0.2, age: true });

  // THE SCIENTIST (not a doctor): sixty-two, a short grey beard, thick grey brows, a high bald brow, tired hooded eyes;
  // black frock coat, white shirt front, black bow tie, the red rosette of the Legion of Honour. His left side is weak.
  const SCI = '<path d="M-44,-1150 L44,-1150 L30,-930 L-30,-930Z" fill="#f2efe6" stroke="#5a5a54" stroke-width="2"/>' +
    '<path d="M-30,-1140 L0,-1126 L30,-1140 L30,-1112 L0,-1124 L-30,-1112Z" fill="#0a0a0c"/><circle cx="0" cy="-1125" r="7" fill="#141416"/>' +
    [-1060, -1010, -960].map(y => `<circle cx="0" cy="${y}" r="4" fill="#d8d4c8" stroke="#6a6a64" stroke-width="1"/>`).join('') +
    '<circle cx="-92" cy="-1040" r="9" fill="#b81e1e" stroke="#5a0a0a" stroke-width="1.5"/><path d="M-96,-1032 L-92,-1010 L-88,-1032" fill="#b81e1e"/>';
  Q.sci = mk({
    kind: 'man', dims: { shX: 158, wX: 138, sw: 80, hemY: -420, hemX: 160, legX: 52, legW: 66, hand: 112 }, skin: '#e4bea0', tunic: '#16161c', sleeve: '#141418', legs: '#202024', feet: '#0c0c0c',
    belt: false, props: SCI, hair: '#b8b4ac', hairStyle: 'receding', beard: '#c4c0b8', beardStyle: 'short', mustache: '#b8b4ac', brow: '#8a8680', lightX: -1,
    fx: { w: 1.02, len: 1.04, cheek: 1.02, jaw: 1.08, chinW: 1.05, eyeS: 0.84, hooded: 0.32, crow: 1, nose: 'std', noseS: 1.1, browT: 1.65, browArch: 1, lipT: 0.8, earS: 1.05 },
  }, { expr: 'stern', iris: '#4a5a6a', lid: 0.22, age: true });

  // THE DOCTOR who gives the shots: forty, dark hair, a pointed dark beard, a long nose, sharp brows; white apron over black
  Q.doc = mk({
    kind: 'man', dims: { shX: 160, wX: 128, sw: 80, hemY: -460, hemX: 156, hand: 114 }, skin: '#e8c0a0', tunic: '#1a1a20', sleeve: '#18181e', apron: '#efece4', legs: '#1e1e24', feet: '#0c0c0c',
    belt: false, hair: '#2a2018', hairStyle: 'short', hairSeed: 61, beard: '#2a2018', beardStyle: 'pointed', mustache: '#2a2018', brow: '#1e1610', lightX: 1,
    fx: { w: 0.94, len: 1.08, cheek: 1.0, jaw: 1.0, eyeS: 0.92, nose: 'long', noseS: 1.05, browT: 1.35, browArch: 2, lipT: 0.85, earS: 0.98 },
  }, { expr: 'stern', iris: '#3a2a1a', lid: 0.2 });

  // YOUR MOTHER: Alsatian, black silk bow, white blouse, red skirt and black bodice, white apron; your grey-green eyes
  const BODICE = '<path d="M-104,-1060 L104,-1060 L92,-830 L-92,-830Z" fill="#141216" stroke="#000" stroke-width="2"/>' + [-1000, -950, -900].map(y => `<path d="M-60,${y} L60,${y}" stroke="#c8a040" stroke-width="3" opacity="0.7"/>`).join('');
  Q.mother = mk({
    kind: 'woman', skin: '#e2b48e', tunic: '#8a1e1e', sleeve: '#efeae0', apron: '#ece4d4', hair: '#5a3a1e', hairStyle: 'bob', brow: '#3a2414', belt: false, props: BODICE, headProps: SCARF, lightX: 1,
    fx: { w: 1.0, cheek: 1.04, jaw: 0.94, eyeS: 0.96, nose: 'std', noseS: 1.0, lipT: 1.05, crow: 0.5, mouthW: 1.0 },
  }, { expr: 'anxious', iris: '#6a7a5a', lid: 0.18 });

  // THE DYING MAN in the ward: thirty, black hair plastered with sweat, stubble, a hooked nose, wild eyes
  Q.patient = mk({
    kind: 'man', robe: true, dims: { shX: 156, wX: 124, sw: 80 }, skin: '#dcb08e', tunic: '#e6e0d2', sleeve: '#e0dacb', belt: false, hair: '#141010', hairStyle: 'messy', hairSeed: 77, stubble: 1, brow: '#0e0a08', lightX: 1,
    fx: { w: 0.98, len: 1.04, cheek: 0.96, jaw: 1.02, hollow: 0.5, eyeS: 1.0, nose: 'hook', noseS: 1.0, browT: 1.3, lipT: 0.9 },
  }, { expr: 'fear', iris: '#3a2a1a', lid: 0.1 });

  // THE NURSING SISTER: round calm face, small nose, the white cornette and coif, a grey-blue habit with a white collar
  const COLLAR = '<path d="M-110,-1100 C-60,-1040 60,-1040 110,-1100 L96,-1118 C50,-1074 -50,-1074 -96,-1118Z" fill="#f6f4ee" stroke="#8a8a84" stroke-width="2"/>';
  Q.sister = mk({
    kind: 'woman', skin: '#ecc8a8', tunic: '#3a4a6a', sleeve: '#36455f', apron: '#f2f0ea', coif: '#f6f4ee', belt: false, props: COLLAR, headProps: CORNETTE, lightX: -1,
    fx: { w: 1.04, cheek: 1.1, jaw: 0.9, eyeS: 0.9, nose: 'button', noseS: 0.95, lipT: 1.0, mouthW: 0.95 },
  }, { expr: 'neutral', iris: '#4a5a6a', lid: 0.2 });

  G.QCAST = Q;
})(window);
