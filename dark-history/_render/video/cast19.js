// Cast for "The Royal Fool" (France, 1340). All new faces: you (the King's fool: a lean, quick young face under a green
// hood with a dagged cape, a motley tunic, and the three-horned cap with gold bells the King puts on your head), King
// Philip VI (heavy brow, dark greying beard, crown, a blue robe sewn with gold lilies, an ermine mantle), Queen Joan,
// a lady of the court, four lords of the council (the old chancellor, the fat lord, the young lord, the scarred lord),
// two guards in lily tabards, two messengers (the soaked one from the coast, and the next one, at the end), and the
// small sailors and archers of the sea battle.
(function (G) {
  const { person, shade, DIMS } = G.RIG, K0 = G.CAST;
  const Q = {};
  const face = (base, p) => Object.assign({}, base, p.face || {}, p.blink ? { lid: Math.max((p.face && p.face.lid) ?? base.lid ?? 0.2, p.blink) } : {});
  const mk = (base, faceBase) => p => person(Object.assign({}, base, p, { fx: Object.assign({}, base.fx, p.fx || {}), face: face(faceBase, p) }));
  Q.blink = K0.blink; Q.talk = K0.talk; Q.breath = K0.breath;
  const OUTL = 'stroke="#20140c" stroke-width="2" stroke-linejoin="round"';
  const f = v => Math.round(v * 10) / 10;
  // scales are never rounded to steps (a far prop would jump a few per cent at each step as the camera moves)
  const fs = v => Math.round(v * 1e5) / 1e5;
  // the transform the rig gives the head (person-local -> head-local), for head art and for the cap in the King's hands
  Q.headT = (P, o) => {
    const s = o.s || 1, b = o.breath || 0, sx = Math.round(s * (1 - b * 0.0015) * 1e5) / 1e5, sy = Math.round(s * (1 + b * 0.004) * 1e5) / 1e5, hsc = o.headScale ?? 1;
    return `translate(${o.x || 0},${o.y || 0}) rotate(${o.sway || 0}) scale(${sx},${sy}) translate(0,${P.D.headY + (1 - hsc) * 110}) rotate(${o.tilt || 0}) scale(${hsc})`;
  };
  Q.headArt = (P, o, svg) => `<g transform="${Q.headT(P, o)}">${svg}</g>`;
  Q.withArt = (P, o, art, body) => (art && art.back ? Q.headArt(P, o, art.back) : '') + body + (art && art.front ? Q.headArt(P, o, art.front) : '');
  const grad = (id, a, b, horiz) => `<linearGradient id="${id}" x1="0" y1="0" x2="${horiz ? 1 : 0}" y2="${horiz ? 0 : 1}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  // a gold lily (heraldic fleur-de-lis), centred on x, y
  const lily = (x, y, s, col, ol = '') => `<g transform="translate(${f(x)},${f(y)}) scale(${fs(s)})" fill="${col}" ${ol}><path d="M0,-40 C14,-24 14,-6 0,10 C-14,-6 -14,-24 0,-40Z"/><path d="M-4,4 C-26,-4 -40,-24 -30,-38 C-24,-20 -14,-8 -4,0Z"/><path d="M4,4 C26,-4 40,-24 30,-38 C24,-20 14,-8 4,0Z"/><rect x="-16" y="8" width="32" height="7"/><path d="M-4,15 L0,30 L4,15Z"/></g>`;
  Q.lily = lily;

  // ======================================================= the cap with bells (head-local: face centre 0,0; the hood's
  // crown at y -164). A padded roll round the crown, a dome counterchanged yellow and green, three soft horns (yellow to
  // the left, green to the right, red up and back) that droop under their weight, a gold bell at each tip. k: the swing
  // of the bells (-1..1; they lag the head like pendulums), j: a shiver of the horns (jingling)
  const BELL = (x, y, r, id, rot = 0) => `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)})"><path d="M0,${f(-r * 1.25)} a${f(r * 0.32)},${f(r * 0.32)} 0 1 1 0.1,0" fill="none" stroke="#7a5a18" stroke-width="${f(r * 0.16)}"/><circle cx="0" cy="0" r="${f(r)}" fill="url(#${id}g)" ${OUTL}/><path d="M${f(-r * 0.62)},${f(r * 0.22)} L${f(r * 0.62)},${f(r * 0.22)}" stroke="#4a3208" stroke-width="${f(r * 0.16)}" stroke-linecap="round"/><circle cx="0" cy="${f(r * 0.5)}" r="${f(r * 0.16)}" fill="#3a2406"/><ellipse cx="${f(-r * 0.32)}" cy="${f(-r * 0.36)}" rx="${f(r * 0.3)}" ry="${f(r * 0.2)}" fill="#fff6d0" opacity="0.8"/></g>`;
  Q.FOOLCAP = (id, k = 0, j = 0) => {
    const g = `<defs><radialGradient id="${id}g" cx="0.38" cy="0.32" r="0.75"><stop offset="0" stop-color="#fff0a8"/><stop offset="0.45" stop-color="#e2b23a"/><stop offset="1" stop-color="#8a5e12"/></radialGradient>` +
      grad(id + 'y', '#f0c440', '#a87a14') + grad(id + 'n', '#4a9a52', '#1e5228') + grad(id + 'r', '#d04a3a', '#7a1a14') + `</defs>`;
    // a horn: a soft cloth tube along a cubic centre-line (root on the dome, up and out, then drooping under the bell's
    // weight), wide at the root and tapering to the tip; shaded across, a highlight along its upper edge
    const horn = (P0, P1, P2, P3, w0, fill) => {
      const N = 18, L = [], Rr = [];
      const bz = u => { const a = 1 - u; return [0, 1].map(j => a * a * a * P0[j] + 3 * a * a * u * P1[j] + 3 * a * u * u * P2[j] + u * u * u * P3[j]); };
      for (let i = 0; i <= N; i++) {
        const u = i / N, p = bz(u), q = bz(Math.min(1, u + 0.02)), p0 = bz(Math.max(0, u - 0.02)), dx = q[0] - p0[0], dy = q[1] - p0[1], n = Math.hypot(dx, dy) || 1;
        const w = w0 * (1 - u) ** 0.9 + 6 * u;
        L.push([p[0] - dy / n * w, p[1] + dx / n * w]); Rr.push([p[0] + dy / n * w, p[1] - dx / n * w]);
      }
      const d = 'M' + L.map(p => f(p[0]) + ',' + f(p[1])).join(' L') + ' L' + Rr.reverse().map(p => f(p[0]) + ',' + f(p[1])).join(' L') + 'Z';
      const hl = 'M' + L.slice(1, N - 2).map(p => f(p[0] * 0.6 + bz(0)[0] * 0) + ',' + f(p[1])).join(' L');
      return `<path d="${d}" fill="url(#${id}${fill})" ${OUTL}/>` + `<path d="M${Array.from({ length: N - 3 }, (_, i) => { const u = (i + 1) / N, p = bz(u); return f(p[0]) + ',' + f(p[1] - 0.45 * (w0 * (1 - u) ** 0.9)); }).join(' L')}" stroke="#fff" stroke-width="4" fill="none" opacity="0.2" stroke-linecap="round"/>`;
    };
    // bells swing like pendulums (k), the cloth shivers when they jingle (j)
    const sw = k * 20, sh = j * 5;
    const tipL = [-208 - sw, 6 + Math.abs(sw) * 0.3 + sh], tipR = [208 - sw, 6 + Math.abs(sw) * 0.3 - sh], tipC = [84 - sw * 1.2, -318 + sh];
    let s = g;
    // the up-and-back horn first, then the dome (fitted over the hood's crown), the side horns, the band, the bells
    s += horn([10, -200], [20, -290], [60, -330], tipC, 30, 'r');
    s += `<path d="M-138,-98 C-142,-168 -82,-200 0,-202 C82,-200 142,-168 138,-98 Q0,-122 -138,-98Z" fill="url(#${id}y)" ${OUTL}/>`;
    s += `<path d="M0,-202 C82,-200 142,-168 138,-98 Q70,-110 0,-112Z" fill="url(#${id}n)"/><path d="M0,-202 L0,-112" stroke="#20140c" stroke-width="2"/><path d="M-138,-98 C-142,-168 -82,-200 0,-202 C82,-200 142,-168 138,-98" fill="none" ${OUTL}/>`;
    s += horn([-96, -168], [-190, -250], [-236, -150], tipL, 34, 'y') + horn([96, -168], [190, -250], [236, -150], tipR, 34, 'n');
    s += `<path d="M-142,-96 Q0,-124 142,-96 L140,-78 Q0,-104 -140,-78Z" fill="#9a2a22" ${OUTL}/>`;
    for (let i = -4; i <= 4; i++) s += `<circle cx="${i * 30}" cy="${f(-92 - 9 * (1 - (i / 4) ** 2))}" r="5.5" fill="#e2b23a" stroke="#5a3a0a" stroke-width="1.2"/>`;
    s += BELL(tipL[0], tipL[1] + 22, 23, id, -k * 22) + BELL(tipR[0], tipR[1] + 22, 23, id, -k * 22) + BELL(tipC[0] + 18, tipC[1] + 8, 20, id, -k * 22 - 30);
    return s;
  };
  Q.BELL = BELL;
  Q.foolArt = (k = 0, j = 0, id = 'fc') => ({ front: Q.FOOLCAP(id, k, j) });

  // ======================================================= costume overlays (person-local; the rig cuts them to the torso)
  // the motley: the tunic green on your right, saffron on your left (the yellow half shaded like the cloth under it), a
  // red belt with a brass bell, a row of small bells at the hem
  const MOTLEY = (() => {
    const y = '#d8a429';
    let g = `<defs><linearGradient id="mtY" gradientUnits="userSpaceOnUse" x1="-150" y1="0" x2="150" y2="0"><stop offset="0" stop-color="${shade(y, -0.22)}"/><stop offset="0.3" stop-color="${shade(y, 0.06)}"/><stop offset="0.55" stop-color="${y}"/><stop offset="1" stop-color="${shade(y, -0.32)}"/></linearGradient></defs>`;
    g += `<rect x="0" y="-1400" width="400" height="1000" fill="url(#mtY)"/><path d="M0,-1178 L0,-460" stroke="#20140c" stroke-width="2.4"/>`;
    // diamond lozenges stitched down the seam, red on green, green on yellow
    for (let yy = -1060, i = 0; yy < -520; yy += 92, i++) g += `<path d="M${i % 2 ? 46 : -46},${yy - 30} l22,30 l-22,30 l-22,-30Z" fill="${i % 2 ? '#2e6b3a' : '#9a2a24'}" ${OUTL}/>`;
    g += `<rect x="-200" y="-842" width="400" height="26" fill="#8a2420" ${OUTL}/><rect x="-16" y="-846" width="32" height="34" rx="5" fill="#c8a040" ${OUTL}/>`;
    g += `<circle cx="-70" cy="-800" r="13" fill="#e2b23a" ${OUTL}/><path d="M-78,-798 L-62,-798" stroke="#4a3208" stroke-width="2"/>`;
    for (let x = -150; x <= 150; x += 50) g += `<circle cx="${x}" cy="-486" r="9" fill="#e2b23a" stroke="#5a3a0a" stroke-width="1.4"/>`;
    // a short dagged collar over the shoulders: points in turn yellow and red, a bell at each tip
    g += `<path d="M-200,-1190 L200,-1190 L200,-1100 Q0,-1080 -200,-1100Z" fill="#3a8244" ${OUTL}/>`;
    for (let i = 0; i < 8; i++) { const x = -175 + i * 50, y0 = -1104 + 10 * Math.sin(Math.PI * (i + 0.5) / 8); g += `<path d="M${x - 25},${f(y0)} L${x + 25},${f(y0)} L${x},${f(y0 + 64)}Z" fill="${i % 2 ? '#9a2a24' : '#d8a429'}" ${OUTL}/><circle cx="${x}" cy="${f(y0 + 72)}" r="9" fill="#e2b23a" stroke="#5a3a0a" stroke-width="1.4"/>`; }
    return g;
  })();
  // the dagged edge of your hood's cape: points in turn yellow and red, a bell at each tip (drawn under the cape and arms)
  const DAGS = (() => {
    const sY = DIMS.man.shY, cy1 = sY + 190, cx1 = 150 * 1.3;
    let g = '';
    const n = 9;
    for (let i = 0; i < n; i++) {
      const u = (i + 0.5) / n, x = lerp(-cx1 * 1.02, cx1 * 1.02, u), yTop = cy1 - 16 + 30 * Math.sin(Math.PI * u) - 22, w = (cx1 * 2.04) / n * 0.52;
      g += `<path d="M${f(x - w)},${f(yTop)} L${f(x + w)},${f(yTop)} L${f(x)},${f(yTop + 70)}Z" fill="${i % 2 ? '#9a2a24' : '#d8a429'}" ${OUTL}/><circle cx="${f(x)}" cy="${f(yTop + 78)}" r="9" fill="#e2b23a" stroke="#5a3a0a" stroke-width="1.4"/>`;
    }
    return g;
  })();
  function lerp(a, b, t) { return a + (b - a) * t; }
  // the King's robe: deep blue velvet sewn with gold lilies, a gold band at the waist
  const LILYROBE = (() => {
    let g = '';
    for (let yy = -1120, row = 0; yy < -40; yy += 110, row++) for (let x = -220 + (row % 2) * 55; x <= 220; x += 110) g += lily(x, yy, 0.62, '#d8b040');
    g += `<rect x="-220" y="-836" width="440" height="22" fill="#c9a040" ${OUTL}/>`;
    return g;
  })();
  // a lord's heavy gold chain of office
  const CHAIN = (col = '#d8b040') => { let g = ''; for (let i = 0; i <= 14; i++) { const u = i / 14, x = lerp(-120, 120, u), y = -1130 + 150 * Math.sin(Math.PI * u); g += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="12" ry="8" fill="none" stroke="${col}" stroke-width="5"/>`; } return g + `<circle cx="0" cy="-976" r="22" fill="${col}" ${OUTL}/><circle cx="0" cy="-976" r="10" fill="#8a1a1a"/>`; };
  // a baldric across the chest, silver studs
  const BALDRIC = `<path d="M-150,-1140 L170,-760 L150,-730 L-170,-1110Z" fill="#3a2a1e" ${OUTL}/>` + [0.15, 0.35, 0.55, 0.75].map(u => `<circle cx="${f(lerp(-150, 160, u))}" cy="${f(lerp(-1125, -745, u))}" r="7" fill="#c8ccd0"/>`).join('');
  // the guards' tabard lily (big, on the chest)
  const TABLILY = lily(0, -960, 1.9, '#d8b040', OUTL);
  // a mud-spattered, rain-soaked riding tunic
  const MUD = (seed) => { let g = '', r = G.RIG.rng(seed); for (let i = 0; i < 26; i++) { const x = -180 + r() * 360, y = -800 + r() * 360; g += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(6 + r() * 16)}" ry="${f(4 + r() * 9)}" fill="#3a2a18" opacity="${f(0.4 + r() * 0.4)}"/>`; } return g + [-120, -40, 50, 130].map(x => `<path d="M${x},-1100 L${x + 8},-500" stroke="#fff" stroke-width="5" opacity="0.08"/>`).join(''); };

  // ======================================================= YOU: the fool (about twenty-five): a lean face, high cheekbones,
  // big quick hazel eyes under arched, mobile brows, a long nose with a bump, a wide mouth made for grinning, a pointed
  // chin; a fringe of auburn hair under a green hood with a dagged cape; the motley; red sleeves and hose, pointed shoes
  const foolFx = { w: 0.92, len: 1.06, cheek: 1.1, hollow: 0.18, jaw: 0.88, chinW: 0.8, chin: 1.06, eyeS: 1.12, eyeW: 1.04, eyeTilt: 2, hooded: 0.05, crow: 0.3, nose: 'long', noseS: 1.04, noseL: 1.08, lipT: 0.92, mouthW: 1.14, browT: 1.0, browArch: 1.5, earS: 1.0, freckles: 0.25 };
  Q.fool = mk({ kind: 'man', dims: { shX: 142, wX: 112, hemX: 140, sw: 70, hand: 108 }, skin: '#e8c2a0', tunic: '#2e6b3a', sleeve: '#9a2a24', legs: '#8a2622', feet: '#2a1a10', belt: false, hair: '#7a3a1a', hairStyle: 'short', hairSeed: 1901, brow: '#5a2a12', stubble: 0.25,
    hood: '#3a8244', cape: false, lightX: -1, costume: MOTLEY, fx: foolFx },
    { expr: 'neutral', iris: '#7a6a2a', lid: 0.14 });

  // ======================================================= King Philip VI (about forty-seven): a broad, heavy face, a low
  // brow, hooded dark eyes, a big hooked nose, a full dark beard going grey at the chin; the crown; the lily robe and an
  // ermine-lined blue mantle
  const kingFx = { w: 0.98, len: 1.12, cheek: 1.0, jaw: 1.04, chinW: 0.96, eyeS: 0.92, eyeW: 1.0, eyeTilt: -3, hooded: 0.38, crow: 0.6, lidAdd: 0.04, nose: 'hook', noseS: 1.14, noseL: 1.08, lipT: 0.92, mouthW: 1.04, browT: 1.35, browArch: -0.5, earS: 1.04, age: 0.45 };
  Q.king = mk({ kind: 'man', dims: { shX: 168, wX: 146, hemX: 168, sw: 86, hand: 122 }, robe: true, skin: '#e0b494', tunic: '#22348a', sleeve: '#1e2f7e', feet: '#2a1a14', belt: false, hair: '#3a2a1e', hairStyle: 'curls', hairSeed: 1911, beard: '#4a3628', beardStyle: 'pointed', mustache: '#3a2a1e', brow: '#2a1c12',
    mantle: '#f0ece2', mantleW: 1.14, mantleDrop: 130, ermine: true, crown: '#d6a838', lightX: -1, costume: LILYROBE, fx: kingFx },
    { expr: 'stern', iris: '#3a2414', lid: 0.3 });

  // ======================================================= Queen Joan (the lame queen): a narrow pale face, cool grey eyes,
  // thin lips, a white wimple and a gold circlet, a crimson gown
  Q.queen = mk({ kind: 'woman', skin: '#f0d4c0', tunic: '#6a1424', sleeve: '#641222', hair: '#6a4a2a', hairStyle: 'bald', brow: '#6a4a2a', wimple: '#f0ece4', veil: '#d8d2c4', circlet: '#d6a838', lightX: -1, costume: CHAIN('#d6a838'),
    fx: { w: 0.9, len: 1.1, cheek: 0.96, hollow: 0.2, jaw: 0.86, chinW: 0.82, eyeS: 0.96, eyeTilt: -4, hooded: 0.3, crow: 0.25, nose: 'long', noseS: 0.98, noseL: 1.1, lipT: 0.7, mouthW: 0.92, browT: 0.85, browArch: 0.9 } },
    { expr: 'neutral', iris: '#7a8a98', lid: 0.3 });
  // a lady of the court: round young face, dark eyes, auburn hair under a gold net, a green gown
  Q.lady = mk({ kind: 'woman', skin: '#ecc6a6', tunic: '#2a5a4a', sleeve: '#285646', hair: '#8a3a1a', hairStyle: 'bob', hairSeed: 1921, brow: '#6a2a12', circlet: '#d6a838', lightX: -1,
    fx: { w: 1.02, len: 0.96, cheek: 1.12, jaw: 0.9, chinW: 0.86, eyeS: 1.08, eyeTilt: 3, nose: 'button', noseS: 0.94, lipT: 1.15, mouthW: 0.96, browT: 0.9, browArch: 0.6 } },
    { expr: 'neutral', iris: '#3a2214', lid: 0.18 });

  // ======================================================= the four lords of the council
  // the old chancellor: long gaunt face, deep-set pale eyes, a hooked nose, a trimmed white beard, a black cap, burgundy robe
  Q.chancellor = mk({ kind: 'man', robe: true, skin: '#e6c0a4', tunic: '#5a1820', sleeve: '#561620', feet: '#1a1210', belt: false, hair: '#d8d4cc', hairStyle: 'receding', beard: '#e0dcd2', beardStyle: 'short', mustache: '#e0dcd2', brow: '#c8c4bc', cap: '#1a1414', lightX: -1, costume: CHAIN('#c9a040'),
    fx: { w: 0.9, len: 1.14, cheek: 0.92, hollow: 0.42, jaw: 0.92, chinW: 0.86, eyeS: 0.86, eyeTilt: -2, hooded: 0.45, crow: 0.9, nose: 'hook', noseS: 1.1, noseL: 1.14, lipT: 0.7, mouthW: 0.98, browT: 1.1, browArch: 0.4, earS: 1.1, age: 1 } },
    { expr: 'anxious', iris: '#8a9aa8', lid: 0.3, age: 0.9 });
  // the fat lord: a round ruddy face, a double chin, small eyes, a broad nose, clean-shaven; a red chaperon, green gown
  Q.fatLord = mk({ kind: 'man', build: 'fat', skin: '#e8ac8e', tunic: '#2a4a2e', sleeve: '#28462c', legs: '#3a2a1e', feet: '#1a1210', belt: '#5a3a20', hair: '#7a5a3a', hairStyle: 'receding', brow: '#6a4a2a', stubble: 0.2, turban: '#7a1a1a', lightX: -1, costume: CHAIN('#d8b040'),
    fx: { w: 1.18, len: 0.94, cheek: 1.24, jaw: 1.14, chinW: 1.12, dbl: 1, eyeS: 0.84, eyeTilt: 1, hooded: 0.25, nose: 'broad', noseS: 1.14, lipT: 1.1, mouthW: 0.94, browT: 0.9, browArch: 0.6, earS: 0.96 } },
    { expr: 'anxious', iris: '#4a3a2a', lid: 0.24 });
  // the young lord: narrow and nervous, close-set blue eyes, a long sharp nose, a weak chin, a fair bob, a teal doublet
  Q.youngLord = mk({ kind: 'man', dims: { shX: 146, wX: 116 }, skin: '#f0d0b6', tunic: '#2a5a6a', sleeve: '#285666', legs: '#2a2a3a', feet: '#1a1210', belt: '#3a2a1a', hair: '#d0a860', hairStyle: 'bob', hairSeed: 1931, brow: '#b08840', cap: '#3a2a4a', lightX: -1,
    fx: { w: 0.88, len: 1.08, cheek: 0.96, jaw: 0.84, chinW: 0.76, chin: 0.9, eyeS: 0.98, eyeW: 0.94, eyeX: 0.9, eyeTilt: 4, nose: 'long', noseS: 1.0, noseL: 1.16, lipT: 0.85, mouthW: 0.9, browT: 0.85, browArch: 1.0, earS: 1.12 } },
    { expr: 'anxious', iris: '#5a8ab8', lid: 0.14 });
  // the scarred lord: olive skin, a shaved head, a black goatee, a heavy jaw and brow, a scar through one brow; black and red
  Q.scarLord = mk({ kind: 'man', dims: { shX: 166, wX: 136, sw: 84 }, skin: '#c89474', tunic: '#24201c', sleeve: '#22201c', legs: '#1a1614', feet: '#120e0c', belt: false, hair: '#1a1410', hairStyle: 'bald', beard: '#141010', beardStyle: 'goatee', mustache: '#141010', brow: '#141010', scar: 1, mantle: '#5a1a1a', mantleW: 1.08, lightX: -1, costume: BALDRIC,
    fx: { w: 1.04, len: 1.04, cheek: 1.0, jaw: 1.18, chinW: 1.04, eyeS: 0.9, eyeTilt: -5, hooded: 0.3, crow: 0.4, nose: 'std', noseS: 1.08, lipT: 0.85, mouthW: 1.0, browT: 1.4, browArch: -0.8, earS: 0.98 } },
    { expr: 'stern', iris: '#2a1a10', lid: 0.26 });

  // ======================================================= two guards (lily tabards over mail, steel helmets)
  Q.guardA = mk({ kind: 'man', dims: { shX: 170, wX: 140, sw: 86, hand: 120 }, skin: '#d8a084', tunic: '#5a5a60', sleeve: '#6a6a70', legs: '#3a3a40', feet: '#1a1410', belt: '#3a2a1a', hair: '#7a4a24', hairStyle: 'short', brow: '#5a3418', mustache: '#7a4a24', mstyle: 'walrus', mail: true, helmet: '#9aa0a8',
    tabard: { col: '#1e3a8a', trim: '#c9a040' }, lightX: -1, costume: TABLILY,
    fx: { w: 1.06, len: 1.0, cheek: 1.08, jaw: 1.12, chinW: 1.08, eyeS: 0.88, eyeTilt: -2, hooded: 0.3, crow: 0.4, nose: 'broad', noseS: 1.12, lipT: 0.9, mouthW: 1.02, browT: 1.25, browArch: -0.4 } },
    { expr: 'stern', iris: '#4a3a2a', lid: 0.28 });
  Q.guardB = mk({ kind: 'man', dims: { shX: 160, wX: 130, sw: 82, hand: 118 }, skin: '#a87456', tunic: '#5a5a60', sleeve: '#6a6a70', legs: '#3a3a40', feet: '#1a1410', belt: '#3a2a1a', hair: '#1a1210', hairStyle: 'short', brow: '#1a1210', stubble: 0.7, mail: true, helmet: '#a0a6ae', helmetStyle: 'nasal',
    tabard: { col: '#1e3a8a', trim: '#c9a040' }, lightX: -1, costume: TABLILY,
    fx: { w: 0.96, len: 1.06, cheek: 1.02, jaw: 1.0, chinW: 0.92, eyeS: 0.96, eyeTilt: 3, hooded: 0.1, nose: 'long', noseS: 1.0, lipT: 1.1, mouthW: 0.96, browT: 1.1, browArch: 0.2 } },
    { expr: 'stern', iris: '#2a1a10', lid: 0.22 });

  // ======================================================= the messengers
  // the first: young, soaked from the road from the coast, mud on his tunic, a brown hood
  Q.messenger = mk({ kind: 'man', dims: { shX: 150, wX: 122 }, skin: '#e4bc9c', tunic: '#5a4a34', sleeve: '#564632', legs: '#3a3024', feet: '#2a1e14', belt: '#2a1e14', hair: '#4a3020', hairStyle: 'messy', hairSeed: 1941, brow: '#3a2414', stubble: 0.4, hood: '#6a4e32', dirt: 0.6, lightX: -1, costume: MUD(1951),
    fx: { w: 0.98, len: 1.02, cheek: 1.04, jaw: 0.96, chinW: 0.94, eyeS: 1.04, eyeTilt: 1, hooded: 0.08, nose: 'button', noseS: 1.0, lipT: 1.05, mouthW: 1.0, browT: 0.95, browArch: 0.5, earS: 1.08 } },
    { expr: 'fear', iris: '#4a3a24', lid: 0.1, sweat: 0.6 });
  // the next one (the end): older, a grey-stubbled hard face, a dusty purple riding tunic, no hood, rain in his hair
  Q.messenger2 = mk({ kind: 'man', dims: { shX: 160, wX: 132 }, skin: '#d4a07e', tunic: '#4a3a5a', sleeve: '#463656', legs: '#2a2430', feet: '#1e1612', belt: '#2a1e14', hair: '#6a6460', hairStyle: 'messy', hairSeed: 1961, brow: '#4a4440', stubble: 0.9, dirt: 0.5, lightX: -1, costume: MUD(1971),
    fx: { w: 1.02, len: 1.08, cheek: 0.98, hollow: 0.3, jaw: 1.08, chinW: 1.0, eyeS: 0.9, eyeTilt: -3, hooded: 0.35, crow: 0.7, nose: 'std', noseS: 1.1, noseL: 1.04, lipT: 0.8, mouthW: 1.02, browT: 1.2, browArch: 0.1, age: 0.5 } },
    { expr: 'anxious', iris: '#5a5040', lid: 0.24, sweat: 0.4 });

  // ======================================================= the sea battle: French sailors, English archers (small)
  const sailor = (skin, tunic, hair, cap, fx, seed) => mk({ kind: 'man', skin, tunic, sleeve: shade(tunic, -0.05), legs: shade(tunic, -0.3), feet: skin, belt: '#3a2a1a', hair, hairStyle: 'messy', hairSeed: seed, brow: shade(hair, -0.2), stubble: 0.6, cap, lightX: 1, fx }, { expr: 'fear', iris: '#3a2a1a', lid: 0.12 });
  Q.sailors = [
    sailor('#d8a888', '#3a5a7a', '#4a3020', '#8a2a24', { w: 1.04, jaw: 1.06, nose: 'broad', eyeS: 0.96 }, 1981),
    sailor('#e8c0a0', '#8a7a5a', '#b08040', null, { w: 0.94, len: 1.06, nose: 'long', eyeS: 1.04 }, 1982),
    sailor('#c08868', '#5a3a2a', '#1a1210', '#3a4a6a', { w: 1.0, cheek: 1.1, nose: 'std', eyeS: 1.0 }, 1983),
    sailor('#e0b494', '#2a4a5a', '#6a4a2a', null, { w: 1.08, jaw: 1.1, nose: 'hook', eyeS: 0.9 }, 1984)
  ];
  Q.archer = mk({ kind: 'man', skin: '#e4b898', tunic: '#b8b0a0', sleeve: '#a8a090', legs: '#5a4a3a', feet: '#2a1a12', belt: '#3a2a1a', hair: '#8a5a2a', hairStyle: 'short', brow: '#6a4020', helmet: '#8a9098', mail: true, tabard: { col: '#e8e4dc', trim: '#b8221a' }, lightX: 1,
    fx: { w: 1.0, jaw: 1.08, nose: 'std', eyeS: 0.92, browT: 1.2 } }, { expr: 'stern', iris: '#3a2a1a', lid: 0.3 });

  const H = (d, k) => (d && d.hand) || DIMS[k].hand;
  Q.HAND = { fool: 108, king: 122, queen: H(null, 'woman'), lady: H(null, 'woman'), chancellor: H(null, 'man'), fatLord: H(null, 'man'), youngLord: H(null, 'man'), scarLord: H(null, 'man'), guardA: 120, guardB: 118, messenger: H(null, 'man'), messenger2: H(null, 'man'), archer: H(null, 'man') };
  G.QCAST = Q;
})(window);
