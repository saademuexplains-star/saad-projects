// Props for "The Calf's Blood" (Paris, 1667): the calf lying bound on its table, the silver tube with the blood
// running through it, the chamber pot, the soup bowl and pot, the paper of arsenic, the doctor's drawing, a pamphlet.
// Units are person-local (a man is 1450 tall), so props and people share one scale.
(function (G) {
  const P = G.PROPS, { f, shade, mix, rng, uid } = G.RIG;
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t;
  const OUTC = '#1a120c';
  const ol = (w = 3, op = 0.85) => `stroke="${OUTC}" stroke-width="${w}" stroke-opacity="${op}" stroke-linejoin="round"`;

  // ======================================================= the calf, lying bound on its side (local: facing +x,
  // origin on the table top under its belly). o: x, y, s, dir, t, breath, blink 0..1, ear (deg), head (deg), eyeWet,
  // fear 0..1 (eye white, ears back). Returns { svg, neck } (neck = the vein point in world coords)
  // a calf lying on its belly (forelegs folded under the chest, hind leg tucked), head held up on its neck, roped to
  // the table. Brown with white patches, a white blaze, big soft ears set sideways, a large dark eye with lashes.
  P.CALF_NECK = [292, -360];
  P.CALF_EYE = [424, -522];
  P.calf = (o) => {
    const t = o.t || 0, id = uid('cf'), br = 1 + (o.breath ?? 0.025) * Math.sin(t * 2.2), fear = o.fear || 0;
    const coat = '#8a5232', dk = '#5a321c', wt = '#f2ebe0';
    const body = `M-440,-60 C-472,-160 -452,-300 -362,-350 C-300,-382 -200,-370 -80,-372 C20,-374 70,-390 110,-396 C170,-404 230,-370 252,-300 C268,-220 262,-120 232,-56 C204,-16 120,-8 40,-8 L-380,-8 C-420,-10 -436,-30 -440,-60Z`;
    let g = `<defs><radialGradient id="${id}" cx="45%" cy="25%" r="85%"><stop offset="0" stop-color="${shade(coat, 0.22)}"/><stop offset="0.6" stop-color="${coat}"/><stop offset="1" stop-color="${dk}"/></radialGradient>` +
      `<clipPath id="${id}b"><path d="${body}"/></clipPath></defs>`;
    g += `<ellipse cx="-80" cy="2" rx="560" ry="30" fill="#000" opacity="0.35" filter="url(#b8)"/>`;
    // the far hind hoof peeping out behind the rump
    g += `<path d="M-430,-30 L-560,-22 L-560,-2 L-430,-6Z" fill="${dk}" ${ol(2.2)}/><path d="M-560,-28 L-606,-26 L-610,-2 L-560,-2Z" fill="#2a1e18" ${ol(2)}/>`;
    // the body (breathing): the white patches and belly clipped to it, the thigh and the shoulder modelled
    let b = `<path d="${body}" fill="url(#${id})" ${ol(3)}/>`;
    b += `<g clip-path="url(#${id}b)"><path d="M-250,-380 C-200,-300 -120,-290 -40,-340 C0,-280 -30,-170 -110,-130 C-200,-110 -280,-180 -300,-260 C-310,-320 -290,-360 -250,-380Z" fill="${wt}" opacity="0.94"/>` +
      `<path d="M-460,-40 C-300,-70 0,-60 260,-80 L260,0 L-460,0Z" fill="${wt}" opacity="0.9"/><path d="M60,-400 C90,-330 150,-300 200,-310 C230,-320 250,-350 250,-380Z" fill="${wt}" opacity="0.9"/>` +
      `<path d="M-330,-330 C-260,-280 -220,-170 -230,-70" stroke="${dk}" stroke-width="12" fill="none" opacity="0.35" filter="url(#b4)"/><path d="M150,-360 C110,-280 110,-170 150,-80" stroke="${dk}" stroke-width="12" fill="none" opacity="0.3" filter="url(#b4)"/>` +
      `<path d="M-400,-300 C-300,-360 -150,-376 0,-372 C60,-374 100,-390 140,-396" stroke="#fff" stroke-width="12" opacity="0.14" fill="none"/></g>`;
    // short fur strokes
    const rf = rng(7); for (let i = 0; i < 44; i++) { const x = -420 + rf() * 640, y = -360 + rf() * 320; b += `<path d="M${f(x)},${f(y)} q${f(5 + rf() * 6)},${f(8 + rf() * 6)} ${f(4 + rf() * 4)},${f(18 + rf() * 6)}" stroke="${rf() > 0.5 ? dk : shade(coat, 0.3)}" stroke-width="2" fill="none" opacity="0.35"/>`; }
    g += `<g transform="translate(-80,-8) scale(1,${f(br)}) translate(80,8)">${b}</g>`;
    // the near hind leg tucked forward under the belly (hock out behind), the forelegs folded under the chest
    g += `<path d="M-250,-60 C-300,-40 -380,-36 -440,-40 C-470,-40 -480,-20 -470,-6 L-250,-6Z" fill="${coat}" ${ol(2.6)}/><path d="M-470,-34 L-520,-30 L-522,-4 L-470,-4Z" fill="#2a1e18" ${ol(2)}/>`;
    g += `<path d="M150,-70 C200,-60 270,-46 310,-34 C330,-26 330,-8 312,-4 L150,-4Z" fill="${coat}" ${ol(2.6)}/><path d="M300,-30 L346,-28 L350,-2 L300,-2Z" fill="#2a1e18" ${ol(2)}/><path d="M90,-40 C140,-34 200,-26 240,-20 L240,-4 L90,-4Z" fill="${shade(coat, -0.2)}" ${ol(2.2)}/>`;
    // the ropes binding it to the table: over the barrel and the hindquarters, knotted down at the table edge
    for (const x of [-300, 30]) g += `<path d="M${x - 30},-6 C${x - 50},-160 ${x - 40},-320 ${x + 10},${f(-376 * br)} C${x + 30},-300 ${x + 40},-150 ${x + 30},-6" stroke="#c8b488" stroke-width="12" fill="none" opacity="0.95"/><path d="M${x - 30},-6 C${x - 50},-160 ${x - 40},-320 ${x + 10},${f(-376 * br)}" stroke="#7a6a48" stroke-width="3" fill="none" stroke-dasharray="8 10"/>`;
    // the tail hanging off the rump with its dark tuft
    g += `<path d="M-430,-220 C-480,-190 -500,-120 -506,-40" stroke="${dk}" stroke-width="15" fill="none" stroke-linecap="round"/><ellipse cx="-506" cy="-30" rx="16" ry="28" fill="#2a1a10"/>`;
    // the neck and head: lifted, turning a little (o.head degrees about the neck's root); the shaved vein patch
    const ha = (o.head || 0) + 2.5 * Math.sin(t * 0.9);
    // (the neck grows out of the body with no seam: filled without an outline, then only its crest and throat lined)
    let h = `<path d="M60,-372 C150,-430 230,-520 300,-560 L440,-440 C400,-400 320,-340 258,-262 C230,-300 150,-350 60,-372Z" fill="url(#${id})"/><path d="M60,-372 C150,-430 230,-520 300,-560 M440,-440 C400,-400 320,-340 258,-262" fill="none" ${ol(3)}/>`;
    h += `<path d="M262,-280 C300,-330 360,-380 420,-424" stroke="${dk}" stroke-width="10" fill="none" opacity="0.3" filter="url(#b4)"/>`;
    h += `<ellipse cx="${P.CALF_NECK[0]}" cy="${P.CALF_NECK[1]}" rx="36" ry="24" fill="#e2b49c" opacity="0.85" transform="rotate(-40 ${P.CALF_NECK[0]} ${P.CALF_NECK[1]})"/>`;
    // ears: big leaves set sideways from behind the poll (the far one shows above it); they flick, and go back in fear
    const ea = (o.ear || 0) + 7 * Math.sin(t * 1.3) * Math.exp(-((t * 0.7) % 3)) - 25 * fear;
    h += `<g transform="rotate(${f(ea * 0.6)} 360 -580)"><path d="M364,-580 C330,-618 270,-640 236,-632 C256,-604 310,-584 360,-566Z" fill="${shade(coat, -0.15)}" ${ol(2.2)}/></g>`;
    const head = `M300,-560 C336,-600 396,-604 440,-584 C500,-556 560,-504 590,-462 C606,-440 608,-402 594,-382 C578,-360 548,-354 520,-364 C482,-378 452,-390 422,-412 C392,-432 362,-462 334,-482 C304,-502 290,-532 300,-560Z`;
    h += `<path d="${head}" fill="url(#${id})" ${ol(3)}/>`;
    // the white blaze from the forehead down the face; the grey-pink muzzle, nostril, mouth
    h += `<path d="M420,-592 C470,-570 540,-510 576,-462 C566,-452 548,-452 534,-462 C500,-500 460,-540 412,-566Z" fill="${wt}" opacity="0.96"/>`;
    h += `<path d="M566,-470 C588,-462 606,-440 604,-410 C602,-388 590,-376 572,-376 C556,-392 550,-430 566,-470Z" fill="#c8a49c" ${ol(2)}/><ellipse cx="592" cy="-430" rx="8" ry="11" fill="#3a1a14" transform="rotate(-20 592 -430)"/><path d="M596,-392 C580,-386 560,-382 540,-380" stroke="#6a3a30" stroke-width="3" fill="none"/>`;
    h += `<path d="M330,-480 C380,-440 430,-410 480,-392" stroke="${dk}" stroke-width="8" fill="none" opacity="0.3" filter="url(#b2)"/><circle cx="364" cy="-592" r="12" fill="${shade(coat, -0.3)}" ${ol(1.6)}/>`;
    h += `<g transform="rotate(${f(-ea)} 352 -548)"><path d="M352,-548 C300,-582 232,-596 200,-580 C222,-552 292,-534 352,-528Z" fill="${coat}" ${ol(2.4)}/><path d="M340,-544 C300,-566 252,-576 226,-572" stroke="#d8a098" stroke-width="9" fill="none" opacity="0.7"/></g>`;
    // the eye: big, dark and wet, set on the side of the head along its slope; blinks; shows white in fear
    const bl = clamp(o.blink || 0), ew = fear, [ex, ey] = P.CALF_EYE;
    let e = `<ellipse cx="0" cy="0" rx="${f(22 + 4 * ew)}" ry="${f(17 * (1 - bl) + 1.5)}" fill="${ew > 0.2 ? '#f0e8e0' : '#1a0e08'}" ${ol(2.2)}/>`;
    if (ew > 0.2 && bl < 0.8) e += `<circle cx="-2" cy="0" r="${f(12 * (1 - bl))}" fill="#1a0e08"/>`;
    if (bl < 0.8) e += `<circle cx="-7" cy="-6" r="${f(5.5 * (1 - bl))}" fill="#fff" opacity="0.9"/><circle cx="7" cy="5" r="2.6" fill="#fff" opacity="0.5"/>`;
    e += `<path d="M-24,${f(-4 + 16 * bl)} C-12,${f(-20 + 18 * bl)} 12,${f(-20 + 18 * bl)} 24,${f(-4 + 16 * bl)}" stroke="${OUTC}" stroke-width="3.6" fill="none"/>`;
    for (let i = 0; i < 5; i++) e += `<path d="M${-18 + i * 9},${f(-12 + 16 * bl)} l${-3 + i * 1.5},-11" stroke="${OUTC}" stroke-width="2.2"/>`;
    if (o.eyeWet) e += `<path d="M14,10 C18,26 14,44 8,56" stroke="#cfe4f0" stroke-width="4.5" fill="none" opacity="${f(0.7 * o.eyeWet)}"/>`;
    h += `<g transform="translate(${ex},${ey}) rotate(28)">${e}</g>`;
    // a rope halter round the nose and behind the ears, its lead running down to the table
    h += `<path d="M548,-500 C566,-470 574,-420 560,-378 M346,-562 C356,-520 372,-460 396,-420 M396,-420 C450,-430 510,-446 556,-470" stroke="#c8b488" stroke-width="8" fill="none"/>`;
    g += `<g transform="rotate(${f(ha)} 220 -380)">${h}</g><path d="M${f(396 + ha * 2)},-420 C440,-300 440,-140 420,-6" stroke="#c8b488" stroke-width="7" fill="none"/>`;
    const s = o.s || 1, dir = o.dir || 1, rot = (p) => { const a = ha * Math.PI / 180, x = p[0] - 220, y = p[1] + 380; return [220 + x * Math.cos(a) - y * Math.sin(a), -380 + x * Math.sin(a) + y * Math.cos(a)]; };
    const nk = rot(P.CALF_NECK), ey2 = rot(P.CALF_EYE);
    return { svg: `<g transform="translate(${f(o.x)},${f(o.y)}) scale(${f(s * dir)},${f(s)})">${g}</g>`, neck: [o.x + nk[0] * s * dir, o.y + nk[1] * s], eye: [o.x + ey2[0] * s * dir, o.y + ey2[1] * s] };
  };

  // ======================================================= the silver tube: a quill-bore silver pipe from the calf's
  // neck to your arm, sagging a little; blood pulses travel along it (flow 0..1 fill, pulse phase from t)
  P.tube = (a, b, t, o = {}) => {
    const fill = clamp(o.fill ?? 1), sag = o.sag ?? 40, mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + sag];
    const d = `M${f(a[0])},${f(a[1])} Q${f(mid[0])},${f(mid[1])} ${f(b[0])},${f(b[1])}`, w = o.w || 9;
    let g = `<path d="${d}" stroke="#4a4e54" stroke-width="${f(w + 4)}" fill="none" stroke-linecap="round"/><path d="${d}" stroke="#c8ccd2" stroke-width="${f(w)}" fill="none" stroke-linecap="round"/>`;
    // blood inside: a dark red core that fills from the calf toward you, with bright pulses running along it
    if (fill > 0) {
      const id = uid('tb'), L = Math.hypot(b[0] - a[0], b[1] - a[1]) + sag;
      g += `<path d="${d}" stroke="#7a0e0e" stroke-width="${f(w * 0.5)}" fill="none" stroke-linecap="round" stroke-dasharray="${f(L * fill)} ${f(L * 2)}"/>`;
      if (o.pulse !== false) for (let k = 0; k < 3; k++) { const ph = ((t * 0.9 + k / 3) % 1) * fill; g += `<path d="${d}" stroke="#e03a2a" stroke-width="${f(w * 0.5)}" fill="none" stroke-linecap="round" stroke-dasharray="${f(L * 0.08)} ${f(L * 3)}" stroke-dashoffset="${f(-L * ph)}" opacity="0.9"/>`; }
    }
    g += `<path d="${d}" stroke="#ffffff" stroke-width="${f(w * 0.22)}" fill="none" opacity="0.55" transform="translate(-1,-${f(w * 0.25)})"/>`;
    return g;
  };

  // ---------------- a chamber pot (glazed earthenware), with dark liquid; (x,y) = rim centre
  // (glazed brown earthenware: a squat round belly, a flared rim, one loop handle; the liquid catches the candle)
  P.chamberPot = (x, y, s, o = {}) => `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><path d="M110,40 C160,36 168,96 112,104" stroke="#5a3a20" stroke-width="18" fill="none"/><path d="M-110,6 C-150,60 -120,140 0,144 C120,140 150,60 110,6Z" fill="#7a4a2a" ${ol(2.6)}/>` +
    `<path d="M-96,30 C-110,80 -80,124 -20,132" stroke="#c88a5a" stroke-width="8" opacity="0.45" fill="none"/><path d="M-120,10 C-60,30 60,30 120,10 L120,26 C60,46 -60,46 -120,26Z" fill="#4a5a3a" opacity="0.8"/>` +
    `<ellipse cx="0" cy="0" rx="130" ry="26" fill="#5a3a20" ${ol(2.4)}/><ellipse cx="0" cy="3" rx="108" ry="18" fill="${o.liquid || '#0c0606'}"/><ellipse cx="${f(-30 + (o.glint || 0))}" cy="0" rx="34" ry="4" fill="#ffd8a0" opacity="0.35"/></g>`;
  // ---------------- a wooden soup bowl with broth, steam; o.powder 0..1 white powder heap, o.stir angle (swirl)
  P.soupBowl = (x, y, s, t, o = {}) => {
    let g = `<path d="M-130,0 C-120,70 -70,100 0,102 C70,100 120,70 130,0Z" fill="#7a5032" ${ol(2.6)}/><path d="M-40,100 L40,100 L50,116 L-50,116Z" fill="#5a3a22" ${ol(2)}/>`;
    g += `<ellipse cx="0" cy="0" rx="132" ry="26" fill="#6a4428" ${ol(2.4)}/><ellipse cx="0" cy="2" rx="118" ry="20" fill="#b8843a"/>`;
    for (let i = 0; i < 6; i++) { const a = (o.stir || 0) + i * 1.05; g += `<ellipse cx="${f(Math.cos(a) * 60)}" cy="${f(2 + Math.sin(a) * 9)}" rx="16" ry="5" fill="${['#d8a858', '#8a6a2a', '#e8c070'][i % 3]}" opacity="0.8"/>`; }
    if (o.powder) { const k = o.powder, sw = o.swirl || 0; g += `<ellipse cx="0" cy="2" rx="${f(30 + 60 * sw)}" ry="${f(6 + 10 * sw)}" fill="#f4f2ec" opacity="${f(clamp(k) * (1 - 0.7 * sw))}"/>`; if (sw > 0) for (let i = 0; i < 3; i++) { const a = (o.stir || 0) * 1.4 + i * 2.1; g += `<path d="M${f(Math.cos(a) * 20)},${f(2 + Math.sin(a) * 4)} Q${f(Math.cos(a + 1) * 70)},${f(2 + Math.sin(a + 1) * 12)} ${f(Math.cos(a + 2) * 100)},${f(2 + Math.sin(a + 2) * 16)}" stroke="#f4f2ec" stroke-width="5" fill="none" opacity="${f(0.6 * sw * k)}"/>`; } }
    if (o.steam !== false) for (let i = 0; i < 3; i++) { const ph = (t * 0.4 + i * 0.33) % 1; g += `<path d="M${-40 + i * 40},${f(-10 - ph * 120)} q-14,-30 0,-60 q14,-30 0,-60" stroke="#f4f0e8" stroke-width="10" fill="none" opacity="${f(0.25 * Math.sin(ph * Math.PI))}" filter="url(#b4)"/>`; }
    return `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">${g}</g>`;
  };
  // ---------------- a folded paper of white powder (grip frame: held between finger and thumb) or lying open
  // (open: the paper unfolded into a creased cup, a heap of white powder in it, a few grains sifting off its lip)
  P.packet = (o = {}) => {
    const op = clamp(o.open || 0);
    if (op < 0.3) return `<path d="M-46,-30 L46,-30 L46,30 L-46,30Z" fill="#e8e0cc" ${ol(2)}/><path d="M-46,-30 L0,-4 L46,-30 M-46,30 L-10,4" stroke="#a89c80" stroke-width="2.5" fill="none"/>`;
    let g = `<path d="M-76,-12 L-30,-30 L36,-28 L78,-8 L62,26 L-60,28Z" fill="#e6dcc4" ${ol(2)}/><path d="M-30,-30 L-24,26 M36,-28 L30,26 M-76,-12 L78,-8" stroke="#b8ac90" stroke-width="2" fill="none" opacity="0.8"/>`;
    g += `<path d="M-52,-10 C-40,-40 30,-44 52,-8 C30,0 -30,0 -52,-10Z" fill="#fbfaf6" ${ol(1.4, 0.4)}/><path d="M-30,-18 C-14,-30 10,-32 24,-22" stroke="#fff" stroke-width="4" fill="none" opacity="0.9"/><path d="M-40,-8 C-10,-4 20,-4 44,-8" stroke="#c8c4bc" stroke-width="3" fill="none" opacity="0.7"/>`;
    if (o.t !== undefined) { const r = rng(Math.floor(o.t * 20)); for (let i = 0; i < 8; i++) g += `<circle cx="${f(60 + r() * 14)}" cy="${f(-4 + r() * 60)}" r="${f(1.6 + r() * 1.6)}" fill="#fff" opacity="${f(0.5 + r() * 0.4)}"/>`; }
    return g;
  };
  // a stream of powder falling from (x,y) to (x2,y2)
  P.powderFall = (x, y, x2, y2, t, k = 1) => { const r = rng(Math.floor(t * 30)); let g = `<path d="M${f(x)},${f(y)} Q${f(x + 6)},${f((y + y2) / 2)} ${f(x2)},${f(y2)}" stroke="#fbfaf6" stroke-width="${f(7 * k)}" fill="none" opacity="0.9" stroke-linecap="round"/>`; for (let i = 0; i < 14; i++) { const u = r(); g += `<circle cx="${f(lerp(x, x2, u) + (r() - 0.5) * 16)}" cy="${f(lerp(y, y2, u))}" r="${f(1.5 + r() * 2)}" fill="#fff" opacity="0.8"/>`; } return g; };

  // ---------------- the doctor's drawing: parchment with an ink sketch of a calf joined by a tube to a seated man
  P.drawing = (x, y, s, o = {}) => {
    const ink = '#2a1a10';
    let g = `<path d="M-300,-210 L300,-220 L310,210 L-296,218Z" fill="#e8dcbc" ${ol(2.4)} filter="url(#tex)"/><path d="M-290,-200 L290,-210 L300,200 L-286,208Z" fill="none" stroke="#b8a074" stroke-width="3" opacity="0.6"/>`;
    // the calf, bound (simple contour drawing, hatching), at the left facing left; the man in a chair at the right with
    // his arm out; the tube from the calf's neck to the crook of his arm (the sketch is drawn mirrored)
    // the calf: the same lying pose as the real one (a long body, folded legs, the neck and head raised, a big ear)
    let sk = `<g stroke="${ink}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round">` +
      `<path d="M270,70 C280,30 270,-6 240,-16 C200,-28 140,-26 100,-30 C80,-32 66,-40 54,-46 C40,-70 30,-90 24,-104 C20,-114 4,-122 -10,-116 C-30,-108 -40,-96 -44,-86 C-46,-78 -40,-72 -30,-72 C-16,-72 -4,-80 6,-84 C14,-70 20,-50 30,-30 C34,0 40,40 50,70Z"/>` +
      `<path d="M10,-112 C24,-126 46,-130 58,-122 C46,-114 28,-108 14,-106"/><path d="M-44,-86 C-46,-80 -44,-76 -38,-75"/><circle cx="-8" cy="-100" r="5" fill="${ink}"/>` +
      `<path d="M50,70 L130,74 M180,74 L270,70 M120,70 C140,56 170,56 190,70 M230,40 C250,52 262,62 266,70"/><path d="M100,-30 C96,10 104,40 120,70 M200,-22 C210,10 220,40 236,62" opacity="0.6"/>` +
      [0, 1, 2, 3, 4, 5, 6].map(i => `<path d="M${110 + i * 22},${-14 + (i % 2) * 2} l-12,34" opacity="0.45"/>`).join('') + `<path d="M150,-30 C150,20 150,50 154,72 M90,-30 C88,10 88,46 92,72" stroke="#7a6a48" stroke-width="5" opacity="0.7"/></g>`;
    // the man in his chair, his arm out on a board
    sk += `<g stroke="${ink}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M-208,-124 C-208,-150 -172,-150 -172,-124 C-172,-100 -208,-100 -208,-124Z"/><path d="M-196,-100 L-196,-86 M-230,-80 C-220,-86 -170,-86 -160,-80 L-156,10 L-236,10Z"/><path d="M-236,10 L-236,90 M-156,10 L-156,90 M-250,-110 L-250,96 M-142,-110 L-142,96 M-252,-112 L-140,-112"/>` +
      `<path d="M-168,-70 C-140,-60 -100,-40 -60,-30 L-50,-24"/><path d="M-120,-22 L-40,-22 M-80,-22 L-80,90"/></g>`;
    sk += `<path d="M-56,-30 C-30,-62 0,-62 24,-52" stroke="#8a1a1a" stroke-width="4" fill="none" stroke-dasharray="${o.tubeDash || 'none'}"/>`;
    g += `<g transform="scale(-1,1)">${sk}</g>`;
    g += `<g stroke="${ink}" stroke-width="2" fill="none" opacity="0.7"><path d="M-260,140 L-100,140 M-260,160 L-60,160 M-260,180 L-140,180 M40,140 L240,140 M40,160 L200,160 M40,180 L260,180"/></g>`;
    return `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)}) rotate(${f(o.rot || -3)})">${g}</g>`;
  };
  P.DRAWING_CALF = [8, -100];   // the calf's eye on the drawing (local)
  P.drawingPt = (x, y, s, rot, p) => { const a = rot * Math.PI / 180; return [x + s * (p[0] * Math.cos(a) - p[1] * Math.sin(a)), y + s * (p[0] * Math.sin(a) + p[1] * Math.cos(a))]; };
  // a point along the tube (the same quadratic P.tube draws)
  P.tubePt = (a, b, sag, u) => { const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + sag]; return [(1 - u) * (1 - u) * a[0] + 2 * u * (1 - u) * m[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * u * (1 - u) * m[1] + u * u * b[1]]; };
  // the silver cannula: a short quill-bore pipe with a collar; tip at `tip`, pointing along `d` (unit) into the vein,
  // `out` = how far it still stands out of the skin (0 = fully in). Returns { svg, end } (end = where the tube joins)
  P.cannula = (tip, d, out, s = 1) => {
    const L = 70 * s, back = [tip[0] - d[0] * (L + out), tip[1] - d[1] * (L + out)], tp = [tip[0] - d[0] * out, tip[1] - d[1] * out], n = [-d[1], d[0]];
    const col = [back[0] + d[0] * 18 * s, back[1] + d[1] * 18 * s];
    let g = `<path d="M${f(back[0])},${f(back[1])} L${f(tp[0])},${f(tp[1])}" stroke="#3a3e44" stroke-width="${f(11 * s)}" stroke-linecap="round"/><path d="M${f(back[0])},${f(back[1])} L${f(tp[0])},${f(tp[1])}" stroke="#d8dce2" stroke-width="${f(7 * s)}" stroke-linecap="round"/>`;
    g += `<path d="M${f(col[0] + n[0] * 12 * s)},${f(col[1] + n[1] * 12 * s)} L${f(col[0] - n[0] * 12 * s)},${f(col[1] - n[1] * 12 * s)}" stroke="#b8bcc4" stroke-width="${f(9 * s)}" stroke-linecap="round"/>`;
    g += `<path d="M${f(back[0] + n[0] * 2)},${f(back[1] + n[1] * 2)} L${f(tp[0] + n[0] * 2)},${f(tp[1] + n[1] * 2)}" stroke="#fff" stroke-width="${f(2 * s)}" opacity="0.7"/>`;
    return { svg: g, end: back };
  };
  // ---------------- a pamphlet (a woodcut of the calf and the man), held up
  P.pamphlet = (o = {}) => `<path d="M-90,-120 L90,-120 L94,120 L-86,124Z" fill="#ece4cc" ${ol(2)}/><g stroke="#2a1a10" stroke-width="3" fill="none"><path d="M10,10 C10,-20 40,-36 70,-36 C90,-36 100,-20 100,10Z M10,-6 C-4,-20 -6,-40 4,-50"/><circle cx="-40" cy="-30" r="16"/><path d="M-40,-14 L-40,40 M-40,0 L4,-4"/></g><path d="M-70,-96 L70,-96 M-70,70 L70,70 M-70,88 L40,88" stroke="#2a1a10" stroke-width="5"/>`;
})(window);
