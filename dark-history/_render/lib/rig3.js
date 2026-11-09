// Character rig v3: cinematic / mature version of the cut-out style.
// Thin constant outlines, cloth texture, realistic proportions, restrained faces.
// Hand rules: arms are drawn after torso/head/props (always in front of the belly); characters are
// never mirrored; each hand knows it is a RIGHT or LEFT hand and which side faces camera.
(function (G) {
  const OUT = '#1f140c', OW = 1.9;
  const NS = 'vector-effect="non-scaling-stroke"';
  const ol = (w = OW) => `stroke="${OUT}" stroke-width="${w}" ${NS} stroke-linejoin="round" stroke-linecap="round"`;
  let UID = 0; const uid = p => p + (++UID);
  const f = n => Math.round(n * 100) / 100;
  const hex2rgb = h => { const c = parseInt(h.slice(1), 16); return [c >> 16, (c >> 8) & 255, c & 255]; };
  const rgb2hex = (r, g, b) => '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const shade = (h, a) => { const [r, g, b] = hex2rgb(h); const t = a < 0 ? 0 : 255, p = Math.abs(a); return rgb2hex(r + (t - r) * p, g + (t - g) * p, b + (t - b) * p); };
  const mix = (h1, h2, p) => { const a = hex2rgb(h1), b = hex2rgb(h2); return rgb2hex(a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p, a[2] + (b[2] - a[2]) * p); };
  const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const cylGrad = (id, c, k = 1) => `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${shade(c, -0.3 * k)}"/><stop offset="0.32" stop-color="${shade(c, 0.08 * k)}"/><stop offset="0.6" stop-color="${c}"/><stop offset="1" stop-color="${shade(c, -0.34 * k)}"/></linearGradient>`;
  const vGrad = (id, top, bot) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bot}"/></linearGradient>`;

  function defs() {
    // (G.RIG_CRISP: clean cloth - a faint weave instead of a heavy speckle, a lighter and narrower shading inside the edges)
    const NZ = G.RIG_CRISP ? [0.16, 0.92] : [0.55, 0.72];
    const cloth = (id, sd, op, freq) => `<filter id="${id}" x="-15%" y="-15%" width="130%" height="130%" color-interpolation-filters="sRGB">
 <feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="3" seed="4" result="n"/>
 <feColorMatrix in="n" type="matrix" values="0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0 0 0 0 1" result="g"/>
 <feComponentTransfer in="g" result="m"><feFuncR type="linear" slope="${NZ[0]}" intercept="${NZ[1]}"/><feFuncG type="linear" slope="${NZ[0]}" intercept="${NZ[1]}"/><feFuncB type="linear" slope="${NZ[0]}" intercept="${NZ[1]}"/></feComponentTransfer>
 <feBlend in="SourceGraphic" in2="m" mode="multiply" result="t"/><feComposite in="t" in2="SourceAlpha" operator="in" result="t2"/>
 <feGaussianBlur in="SourceAlpha" stdDeviation="${sd}" result="b"/>
 <feComposite in="SourceAlpha" in2="b" operator="arithmetic" k1="0" k2="1" k3="-1" k4="0" result="e"/>
 <feFlood flood-color="#120804" flood-opacity="${op}"/><feComposite in2="e" operator="in" result="s"/>
 <feMerge><feMergeNode in="t2"/><feMergeNode in="s"/></feMerge></filter>`;
    const inner = (id, sd, op) => `<filter id="${id}" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
 <feGaussianBlur in="SourceAlpha" stdDeviation="${sd}" result="b"/>
 <feComposite in="SourceAlpha" in2="b" operator="arithmetic" k1="0" k2="1" k3="-1" k4="0" result="e"/>
 <feFlood flood-color="#160a04" flood-opacity="${op}"/><feComposite in2="e" operator="in" result="s"/>
 <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="s"/></feMerge></filter>`;
    const blur = (id, sd, pad = 30) => `<filter id="${id}" x="-${pad}%" y="-${pad}%" width="${100 + pad * 2}%" height="${100 + pad * 2}%"><feGaussianBlur stdDeviation="${sd}"/></filter>`;
    const clothN = (id, freq) => `<filter id="${id}" x="-15%" y="-15%" width="130%" height="130%" color-interpolation-filters="sRGB">
 <feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="3" seed="4" result="n"/>
 <feColorMatrix in="n" type="matrix" values="0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0 0 0 0 1" result="g"/>
 <feComponentTransfer in="g" result="m"><feFuncR type="linear" slope="${NZ[0]}" intercept="${NZ[1]}"/><feFuncG type="linear" slope="${NZ[0]}" intercept="${NZ[1]}"/><feFuncB type="linear" slope="${NZ[0]}" intercept="${NZ[1]}"/></feComponentTransfer>
 <feBlend in="SourceGraphic" in2="m" mode="multiply" result="t"/><feComposite in="t" in2="SourceAlpha" operator="in"/></filter>`;
    return cloth('cloth', G.RIG_CRISP ? 15 : 22, G.RIG_CRISP ? 0.3 : 0.5, '0.9 0.22') + cloth('clothS', G.RIG_CRISP ? 7 : 9, G.RIG_CRISP ? 0.28 : 0.45, '1.1 0.3') + clothN('clothN', '1.1 0.3') + inner('skin', 10, 0.32) + inner('skinS', 5, 0.3) +
      `<filter id="stubble" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="1" seed="5"/><feColorMatrix type="matrix" values="0 0 0 0 0.16 0 0 0 0 0.11 0 0 0 0 0.09 0 0 -14 0 6.2"/></filter>` +
      blur('b05', 0.6) + blur('b1', 1) + blur('b2', 2.5) + blur('b4', 4.5) + blur('b8', 8) + blur('b14', 14) +
      blur('soft', 4, 60) + blur('soft2', 9, 60) + blur('glow', 40, 250) +
      blur('dof1', 2.5, 10) + blur('dof2', 6, 10) + blur('dof3', 12, 10) + blur('dof4', 24, 20) +
      `<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.95" numOctaves="2" seed="7" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>`;
  }

  // body dims in head-local units (feet at 0). Heads are ~1/4.3 (kid) and ~1/6.5 (adult) of height.
  // Arms follow real landmarks: elbow at the waist, wrist at the hip/crotch, fingertips at mid-thigh;
  // sleeve thickness ~30% of shoulder width (a tunic sleeve over a real arm).
  const DIMS = {
    kid: { H: 860, headY: -734, shY: -606, shX: 104, wY: -404, wX: 92, hemY: -250, hemX: 114, legX: 34, legW: 48, foot: 80, ua: 130, fa: 104, sw: 56, hand: 72 },
    man: { H: 1450, headY: -1308, shY: -1150, shX: 168, wY: -820, wX: 140, hemY: -470, hemX: 168, legX: 54, legW: 72, foot: 128, ua: 212, fa: 172, sw: 86, hand: 116 },
    woman: { H: 1400, headY: -1268, shY: -1118, shX: 136, wY: -830, wX: 112, hemY: -8, hemX: 200, legX: 0, legW: 0, foot: 110, ua: 196, fa: 160, sw: 74, hand: 104 }
  };

  // expression presets (restrained, adult acting)
  const EXPR = {
    neutral: { brows: [0, 0], lid: 0.28, mouth: 'closed', cd: 1 },
    anxious: { brows: [-6, 1], lid: 0.2, mouth: 'closed', cd: 2.5 },
    fear: { brows: [-9, -2], lid: 0.08, mouth: 'parted', cd: 2, wide: true },
    grim: { brows: [5, -1], lid: 0.42, mouth: 'closed', cd: 3.5 },
    stern: { brows: [8, -3], lid: 0.38, mouth: 'tight', cd: 3 },
    tired: { brows: [-2, 2], lid: 0.5, mouth: 'closed', cd: 2.5 },
    grief: { brows: [-10, 3], lid: 0.45, mouth: 'cry', cd: 5 },
    hollow: { brows: [-3, 2], lid: 0.4, mouth: 'closed', cd: 2 }
  };

  // ---------------- hands ----------------
  function hand(o) {
    const Sz = o.size, skin = o.skin;
    let [dx, dy] = o.dir; const n = Math.hypot(dx, dy) || 1; dx /= n; dy /= n;
    const a = Math.atan2(-dx, dy), lx = [Math.cos(a), Math.sin(a)];
    let t;
    if (o.thumb && o.thumb !== 'auto') {
      const w = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[o.thumb];
      t = (lx[0] * w[0] + lx[1] * w[1]) >= 0 ? 1 : -1;
    } else t = (o.side === 'R' ? -1 : 1) * (o.facing === 'palm' ? 1 : -1);
    const id = uid('hg');
    const pw = Sz * 0.47, pl = Sz * 0.5, fw = pw / 4 * 1.05;
    const curl = o.pose === 'relaxed' ? 0.78 : 1;
    const lens = [0.4, 0.45, 0.42, 0.33].map(v => v * Sz * curl);
    const xs = [0, 1, 2, 3].map(i => t * (pw / 2 - fw / 2 - i * (pw - fw) / 3));
    const pieces = [];
    const cap = (x1, y1, x2, y2, w) => { const L = Math.hypot(x2 - x1, y2 - y1), r = Math.atan2(-(x2 - x1), y2 - y1) * 180 / Math.PI; return `<rect x="${f(-w / 2)}" y="${f(-w / 2)}" width="${f(w)}" height="${f(L + w)}" rx="${f(w / 2)}" transform="translate(${f(x1)},${f(y1)}) rotate(${f(r)})"/>`; };
    const fist = o.pose === 'fist' || o.pose === 'point' || o.pose === 'grip';
    if (o.pose === 'grip') {
      // a fist closed around a held object: the object lives in the hand's own frame (origin at the grip slot,
      // +x across the knuckles), so it can never slide, float or turn relative to the fingers.
      const gy = pl * 0.66;
      const objBack = o.hold ? `<g transform="translate(0,${f(gy)}) scale(${t},1) rotate(${f(o.holdRot || 0)})">${o.hold}</g>` : '';
      const id = uid('hg'), hs = mix(skin, '#c97a62', 0.14);
      const palm = `<rect x="${f(-pw * 0.52)}" y="${f(-Sz * 0.05)}" width="${f(pw * 1.04)}" height="${f(pl + fw * 0.55)}" rx="${f(pw * 0.26)}"/>`;
      let kn = ''; for (let i = 0; i < 4; i++) kn += `<rect x="${f(xs[i] - fw * 0.52)}" y="${f(gy - fw * 0.55)}" width="${f(fw * 1.04)}" height="${f(fw * 1.3)}" rx="${f(fw * 0.5)}"/>`;
      const thumbC = cap(t * pw * 0.52, pl * 0.18, t * pw * 0.12, gy - fw * 0.1, fw * 1.15);
      const all = palm + kn + thumbC;
      let g = `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${shade(hs, -0.2)}"/><stop offset="0.45" stop-color="${shade(hs, 0.04)}"/><stop offset="1" stop-color="${shade(hs, -0.24)}"/></linearGradient><clipPath id="${id}c">${all}</clipPath></defs>`;
      g += objBack;
      g += `<g fill="${OUT}" stroke="${OUT}" stroke-width="${OW * 1.5}" ${NS} stroke-linejoin="round" opacity="0.85">${all}</g><g fill="url(#${id})">${all}</g>`;
      let sh = `<rect x="${f(-pw)}" y="${f(-Sz * 0.1)}" width="${f(pw * 2)}" height="${f(pl * 0.45)}" fill="#3a1408" opacity="0.3" filter="url(#b4)"/>`;
      sh += `<rect x="${f(-pw)}" y="${f(gy + fw * 0.3)}" width="${f(pw * 2)}" height="${f(Sz * 0.4)}" fill="#3a1408" opacity="0.22" filter="url(#b4)"/>`;
      for (let i = 0; i < 4; i++) sh += `<path d="M${f(xs[i] - fw * 0.3)},${f(gy - fw * 0.25)} q${f(fw * 0.3)},${f(-fw * 0.16)} ${f(fw * 0.6)},0" stroke="${shade(hs, 0.3)}" stroke-width="2.5" fill="none" opacity="0.5" filter="url(#b05)"/>`;
      g += `<g clip-path="url(#${id}c)">${sh}</g>`;
      for (let i = 0; i < 3; i++) { const xm = (xs[i] + xs[i + 1]) / 2; g += `<path d="M${f(xm)},${f(gy - fw * 0.4)} L${f(xm)},${f(gy + fw * 0.7)}" stroke="${shade(hs, -0.5)}" stroke-width="1" ${NS} opacity="0.75"/>`; }
      if (o.holdFront) g += `<g transform="translate(0,${f(gy)}) scale(${t},1) rotate(${f(o.holdRot || 0)})">${o.holdFront}</g>`;
      return `<g transform="translate(${f(o.x)},${f(o.y)}) rotate(${f(a * 180 / Math.PI)})">${g}</g>`;
    }
    if (!fist) {
      pieces.push(`<path d="M${f(-pw * 0.42)},${f(-Sz * 0.05)} L${f(-pw / 2)},${f(pl * 0.75)} Q${f(-pw / 2)},${f(pl + fw * 0.3)} ${f(-pw * 0.3)},${f(pl + fw * 0.3)} L${f(pw * 0.3)},${f(pl + fw * 0.3)} Q${f(pw / 2)},${f(pl + fw * 0.3)} ${f(pw / 2)},${f(pl * 0.75)} L${f(pw * 0.42)},${f(-Sz * 0.05)}Z"/>`);
      for (let i = 0; i < 4; i++) { const spread = (i - 1.5) * 0.012 * -t; pieces.push(cap(xs[i], pl * 0.85, xs[i] + spread * Sz, pl * 0.85 + lens[i] - fw / 2, fw * (i === 3 ? 0.88 : 1))); }
      const ang = (o.pose === 'relaxed' ? 14 : 34) * Math.PI / 180, tb = [t * pw * 0.36, pl * 0.3], tl = Sz * 0.34;
      pieces.unshift(cap(tb[0], tb[1], tb[0] + t * Math.sin(ang) * tl, tb[1] + Math.cos(ang) * tl, fw * 1.15));
    } else {
      pieces.push(`<rect x="${f(-pw * 0.52)}" y="${f(-Sz * 0.05)}" width="${f(pw * 1.04)}" height="${f(pl + fw * 0.6)}" rx="${f(pw * 0.24)}"/>`);
      for (let i = 0; i < 4; i++) pieces.push(`<rect x="${f(xs[i] - fw * 0.52)}" y="${f(pl * 0.62)}" width="${f(fw * 1.04)}" height="${f(fw * 1.2)}" rx="${f(fw * 0.48)}"/>`);
      if (o.pose === 'point') pieces.push(cap(xs[0], pl, xs[0], pl + Sz * 0.46, fw));
      pieces.push(cap(t * pw * 0.5, pl * 0.12, t * pw * 0.02, pl * 0.5, fw * 1.12));
    }
    const all = pieces.join('');
    const hs = mix(skin, '#c97a62', 0.14); // hands are a touch redder / more weathered than faces
    let g = `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${shade(hs, -0.2)}"/><stop offset="0.45" stop-color="${shade(hs, 0.04)}"/><stop offset="1" stop-color="${shade(hs, -0.24)}"/></linearGradient><clipPath id="${id}c">${all}</clipPath></defs>`;
    g += `<g fill="${OUT}" stroke="${OUT}" stroke-width="${OW * 1.5}" ${NS} stroke-linejoin="round" opacity="0.85">${all}</g><g fill="url(#${id})">${all}</g>`;
    const ln = `stroke="${shade(hs, -0.5)}" stroke-width="1" ${NS} stroke-linecap="round" fill="none"`;
    let sh = `<rect x="${f(-pw)}" y="${f(-Sz * 0.1)}" width="${f(pw * 2)}" height="${f(pl * 0.5)}" fill="#3a1408" opacity="0.32" filter="url(#b4)"/>`;
    sh += `<rect x="${f(-pw)}" y="${f(pl * 0.8)}" width="${f(pw * 2)}" height="${f(Sz * 0.6)}" fill="#3a1408" opacity="${fist ? 0.2 : 0.12}" filter="url(#b4)"/>`;
    sh += `<path d="M${f(-t * pw * 0.45)},${f(pl * 0.1)} L${f(-t * pw * 0.45)},${f(pl + Sz * 0.3)}" stroke="#3a1408" stroke-width="${f(pw * 0.3)}" opacity="0.22" filter="url(#b4)"/>`;
    if (!fist) {
      for (let i = 0; i < 3; i++) { const xm = (xs[i] + xs[i + 1]) / 2; sh += `<path d="M${f(xm)},${f(pl * 0.92)} L${f(xm + (i - 1) * 0.01 * -t * Sz)},${f(pl * 0.85 + Math.min(lens[i], lens[i + 1]) - fw * 0.3)}" stroke="#3a1408" stroke-width="${f(fw * 0.35)}" opacity="0.35" filter="url(#b1)"/>`; }
      if (o.facing !== 'palm') for (let i = 0; i < 4; i++) {
        const tipY = pl * 0.85 + lens[i] - fw * 0.55;
        // o.nails: painted nails (a colour) with a small gloss; otherwise the pale bare nail
        sh += o.nails ? `<ellipse cx="${f(xs[i])}" cy="${f(tipY + fw * 0.02)}" rx="${f(fw * 0.33)}" ry="${f(fw * 0.42)}" fill="${o.nails}" stroke="${shade(o.nails, -0.4)}" stroke-width="1" ${NS}/><ellipse cx="${f(xs[i] - fw * 0.08)}" cy="${f(tipY - fw * 0.1)}" rx="${f(fw * 0.08)}" ry="${f(fw * 0.14)}" fill="#fff" opacity="0.5"/>`
          : `<ellipse cx="${f(xs[i])}" cy="${f(tipY)}" rx="${f(fw * 0.27)}" ry="${f(fw * 0.34)}" fill="${shade(hs, 0.22)}" opacity="0.75"/>`;
        sh += `<path d="M${f(xs[i] - fw * 0.22)},${f(pl * 0.82)} q${f(fw * 0.22)},${f(-fw * 0.12)} ${f(fw * 0.44)},0" stroke="${shade(hs, 0.3)}" stroke-width="2.5" fill="none" opacity="0.5" filter="url(#b05)"/>`;
        sh += `<path d="M${f(xs[i] - fw * 0.16)},${f(pl * 0.85 + lens[i] * 0.45)} l${f(fw * 0.32)},0" ${ln} opacity="0.4"/>`;
      }
      else sh += `<path d="M${f(-pw * 0.3)},${f(pl * 0.45)} Q0,${f(pl * 0.78)} ${f(pw * 0.3)},${f(pl * 0.4)}" ${ln} opacity="0.5"/><path d="M${f(-pw * 0.2)},${f(pl * 0.75)} Q${f(pw * 0.1)},${f(pl * 0.6)} ${f(pw * 0.3)},${f(pl * 0.7)}" ${ln} opacity="0.35"/>`;
      for (let i = 0; i < 3; i++) { const xm = (xs[i] + xs[i + 1]) / 2; g += `<path d="M${f(xm)},${f(pl * 0.95)} L${f(xm + (i - 1) * 0.01 * -t * Sz)},${f(pl * 0.85 + Math.min(lens[i], lens[i + 1]) - fw * 0.4)}" ${ln} opacity="0.7"/>`; }
    } else {
      for (let i = 0; i < 4; i++) sh += `<path d="M${f(xs[i] - fw * 0.3)},${f(pl * 0.66)} q${f(fw * 0.3)},${f(-fw * 0.16)} ${f(fw * 0.6)},0" stroke="${shade(hs, 0.3)}" stroke-width="2.5" fill="none" opacity="0.5" filter="url(#b05)"/>`;
      for (let i = 0; i < 3; i++) { const xm = (xs[i] + xs[i + 1]) / 2; g += `<path d="M${f(xm)},${f(pl * 0.72)} L${f(xm)},${f(pl * 0.62 + fw * 1.1)}" ${ln} opacity="0.75"/>`; }
    }
    g = g.replace(`<g fill="url(#${id})">${all}</g>`, `<g fill="url(#${id})">${all}</g><g clip-path="url(#${id}c)">${sh}</g>`);
    return `<g transform="translate(${f(o.x)},${f(o.y)}) rotate(${f(a * 180 / Math.PI)})">${g}</g>`;
  }

  // ---------------- hands v2 (The Royal Fool, after delivery) ----------------
  // A hand at true size, drawn as one silhouette: the palm with the thumb's pad, four tapered fingers of their own
  // lengths on a curved knuckle line, a two-joint thumb; shaded across its width, with knuckle creases and nails on the
  // back, the palm's creases on the palm. Its length (wrist joint to the tip of the middle finger) is HAND_K x the rig's
  // nominal hand size: the old hand was about two thirds of a real one and narrower than its own cuff. Hand-local
  // frame: origin at the wrist joint, +y toward the fingertips, +x toward the thumb when t = +1.
  // G.RIG_HANDS = 1 draws the old hands.
  const HAND_K = 1.3;
  // wrist joint -> the axis of an object held in the fist (rig units)
  const gripSlot = Sz => (G.RIG_HANDS === 1 ? 0.33 : 0.56 * HAND_K) * Sz;
  // index, middle, ring, little: knuckle x, knuckle y, length (knuckle to tip), width (fractions of the hand length)
  const FING = [[0.143, 0.44, 0.485, 0.11], [0.048, 0.455, 0.53, 0.114], [-0.047, 0.44, 0.5, 0.108], [-0.139, 0.405, 0.39, 0.096]];
  function handV2(o) {
    const L = o.size * HAND_K, skin = o.skin;
    let [dx, dy] = o.dir; const n = Math.hypot(dx, dy) || 1; dx /= n; dy /= n;
    const a = Math.atan2(-dx, dy), lx = [Math.cos(a), Math.sin(a)];
    let t;
    if (o.thumb && o.thumb !== 'auto') {
      const w = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[o.thumb];
      t = (lx[0] * w[0] + lx[1] * w[1]) >= 0 ? 1 : -1;
    } else t = (o.side === 'R' ? -1 : 1) * (o.facing === 'palm' ? 1 : -1);
    // (pose 'legs': index and middle finger out and apart, the others curled - two fingers walking or leaping)
    const pose = o.pose || 'relaxed', fist = pose === 'fist' || pose === 'point' || pose === 'grip' || pose === 'legs', palmV = o.facing === 'palm';
    const id = uid('hh'), hs = mix(skin, '#c97a62', G.RIG_CRISP ? 0.05 : 0.14);
    const P = (x, y) => [t * x * L, y * L], Q = p => `${f(p[0])},${f(p[1])}`;
    // a tapered capsule from a (width w0) to b (width w1): its b end rounded, its a end buried in the hand
    const cap = (a, b, w0, w1) => {
      const ddx = b[0] - a[0], ddy = b[1] - a[1], ln = Math.hypot(ddx, ddy) || 1, ux = ddx / ln, uy = ddy / ln, nx = -uy, ny = ux, r0 = w0 / 2, r1 = w1 / 2, k = 1.33 * r1;
      const a1 = [a[0] + nx * r0, a[1] + ny * r0], a2 = [a[0] - nx * r0, a[1] - ny * r0], b1 = [b[0] + nx * r1, b[1] + ny * r1], b2 = [b[0] - nx * r1, b[1] - ny * r1];
      return `M${Q(a1)} L${Q(b1)} C${Q([b1[0] + ux * k, b1[1] + uy * k])} ${Q([b2[0] + ux * k, b2[1] + uy * k])} ${Q(b2)} L${Q(a2)} C${Q([a2[0] - ux * r0, a2[1] - uy * r0])} ${Q([a1[0] - ux * r0, a1[1] - uy * r0])} ${Q(a1)}Z`;
    };
    // the back of the hand / the palm: from the wrist it widens to the knuckle line (its far edge runs under the fingers)
    const palm = `M${Q(P(-0.146, -0.045))} C${Q(P(-0.15, -0.015))} ${Q(P(-0.152, 0.0))} ${Q(P(-0.153, 0.02))} C${Q(P(-0.172, 0.09))} ${Q(P(-0.2, 0.23))} ${Q(P(-0.196, 0.37))} Q${Q(P(0, 0.52))} ${Q(P(0.2, 0.42))} C${Q(P(0.212, 0.31))} ${Q(P(0.196, 0.18))} ${Q(P(0.172, 0.1))} C${Q(P(0.166, 0.05))} ${Q(P(0.16, 0.01))} ${Q(P(0.156, -0.02))} C${Q(P(0.157, -0.03))} ${Q(P(0.156, -0.04))} ${Q(P(0.15, -0.045))}Z`;
    // the thumb: base (in the hand), joint, tip and widths. It belongs to the silhouette (one outline with the hand),
    // except a fist seen from the palm side, where it lies across the curled fingers
    // (o.morphTo / o.morphK: a relaxed hand opening or an open hand relaxing - fingers, spread and thumb in between)
    const FLAT = { relaxed: { curl: [0.22, 0.28, 0.33, 0.38], ang: [-0.04, -0.012, 0.02, 0.06], th: [[0.1, 0.06], [0.236, 0.27], [0.27, 0.56], 0.152, 0.126, 0.104] }, open: { curl: [0, 0, 0, 0], ang: [0.11, 0.025, -0.06, -0.16], th: [[0.1, 0.06], [0.262, 0.21], [0.42, 0.38], 0.15, 0.124, 0.102] } };
    const fA = FLAT[pose] || FLAT.relaxed, fB = !fist && FLAT[o.morphTo] ? FLAT[o.morphTo] : fA, mK = fB === fA ? 0 : Math.max(0, Math.min(1, o.morphK || 0));
    const lr = (a, b) => a + (b - a) * mK, lv = (a, b) => a.map((v, i) => Array.isArray(v) ? lv(v, b[i]) : lr(v, b[i]));
    // (a fist seen from the palm: only the thumb's last joint shows, lying across the curled fingers)
    const TH = fist ? (palmV ? [[0.16, 0.16], [0.175, 0.37], [-0.03, 0.5], 0.15, 0.13, 0.112] : [[0.1, 0.08], [0.228, 0.28], [0.205, 0.55], 0.15, 0.128, 0.112]) : lv(fA.th, fB.th);
    const thB = P(...TH[0]), thJ = P(...TH[1]), thT = P(...TH[2]);
    const thumbOver = fist && palmV;
    const thumb = thumbOver ? cap(thJ, thT, TH[4] * L, TH[5] * L) : cap(thB, thJ, TH[3] * L, TH[4] * L) + cap(thJ, thT, TH[4] * L, TH[5] * L);
    // the fingers: straight (open, relaxed with a little curl that shortens them and draws them together) or curled
    const curl = fist ? [0, 0, 0, 0] : lv(fA.curl, fB.curl);
    const ang = fist ? FLAT.relaxed.ang : lv(fA.ang, fB.ang);
    let fingers = '', tips = [], segs = [];
    FING.forEach(([kx, ky, len, w], i) => {
      const straight = !fist || (pose === 'point' && i === 0) || (pose === 'legs' && i < 2);
      if (straight) {
        const vl = len * (1 - 0.45 * curl[i]), th = (pose === 'point' ? 0.03 : pose === 'legs' ? [0.13, -0.07][i] : ang[i]), b = P(kx, ky - 0.06), dir = [t * Math.sin(th), Math.cos(th)], e = [b[0] + dir[0] * (vl + 0.06 - w * 0.42) * L, b[1] + dir[1] * (vl + 0.06 - w * 0.42) * L];
        fingers += cap(b, e, w * L, w * 0.82 * L); tips.push([b, e, dir, w * L, vl * L]);
      } else {
        // a curled finger from the back: the first joint comes toward the lens and the rest folds under, a rounded
        // block below the knuckle; the blocks touch (a fist has no gaps between its fingers)
        // (G.RIG_CRISP: the curled fingers fan a little from the knuckles and differ in length - the middle one longest -
        // each a rounded shape, not four equal parallel blocks, which read as a mitten)
        const crisp = !!G.RIG_CRISP, lenK = crisp ? [0.9, 1.0, 0.95, 0.8][i] : 1, fan = crisp ? [-5, -1.5, 2, 6.5][i] * Math.PI / 180 : 0;
        const y0 = ky - 0.06, y1 = ky + 0.25 * lenK, ww = w * (crisp ? 1.06 : 1.1), r = ww * 0.5;
        const x0 = t * (kx - ww / 2) * L, x1 = t * (kx + ww / 2) * L, X0 = Math.min(x0, x1), X1 = Math.max(x0, x1);
        const pc = [t * kx * L, y0 * L], ca = Math.cos(t * fan), sa = Math.sin(t * fan), rt = (x, y) => { const dx2 = x - pc[0], dy2 = y - pc[1]; return `${f(pc[0] + dx2 * ca - dy2 * sa)},${f(pc[1] + dx2 * sa + dy2 * ca)}`; };
        fingers += `M${rt(X0, y0 * L)} L${rt(X1, y0 * L)} L${rt(X1, y1 * L - r * L)} C${rt(X1, y1 * L - r * L * 0.4)} ${rt(X1 - (X1 - X0) * 0.2, y1 * L)} ${rt((X0 + X1) / 2, y1 * L)} C${rt(X0 + (X1 - X0) * 0.2, y1 * L)} ${rt(X0, y1 * L - r * L * 0.4)} ${rt(X0, y1 * L - r * L)}Z`;
        segs.push([kx, ky, w, lenK, fan]);
      }
    });
    // the held object: behind the fingers (back view), in its own frame at the grip slot
    const gy = gripSlot(o.size);
    const objBack = pose === 'grip' && o.hold ? `<g transform="translate(0,${f(gy)}) scale(${t},1) rotate(${f(o.holdRot || 0)})">${o.hold}</g>` : '';
    const objFront = pose === 'grip' && o.holdFront ? `<g transform="translate(0,${f(gy)}) scale(${t},1) rotate(${f(o.holdRot || 0)})">${o.holdFront}</g>` : '';
    // shaded across the hand: the little-finger edge in shadow, light over the back of the hand, the thumb side turning
    const gk = G.RIG_CRISP ? 0.6 : 1, grd = `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${f(-t * 0.21 * L)}" y1="0" x2="${f(t * 0.3 * L)}" y2="0"><stop offset="0" stop-color="${shade(hs, -0.24 * gk)}"/><stop offset="0.38" stop-color="${shade(hs, 0.06 * gk)}"/><stop offset="0.66" stop-color="${hs}"/><stop offset="1" stop-color="${shade(hs, -0.18 * gk)}"/></linearGradient>`;
    const body = `<path d="${palm}"/>` + (thumbOver ? '' : `<path d="${thumb}"/>`) + `<path d="${fingers}"/>`;
    const outl = d => `<g fill="${OUT}" stroke="${OUT}" stroke-width="${f(OW * (G.RIG_CRISP ? 1.05 : 1.5))}" ${NS} stroke-linejoin="round" opacity="0.9">${d}</g>`;
    const ln = (op, w = 1) => `stroke="${shade(hs, -0.5)}" stroke-width="${w}" ${NS} stroke-linecap="round" fill="none" opacity="${op}"`;
    const across = (c, d, hw, op) => `<path d="M${f(c[0] + d[1] * hw)},${f(c[1] - d[0] * hw)} L${f(c[0] - d[1] * hw)},${f(c[1] + d[0] * hw)}" ${ln(op)}/>`;
    // soft light and shade inside the silhouette
    let sh = `<rect x="${f(-0.5 * L)}" y="${f(-0.1 * L)}" width="${f(L)}" height="${f(0.18 * L)}" fill="#3a1408" opacity="0.24" filter="url(#b4)"/>`;
    sh += `<path d="M${Q(P(-0.21, 0.04))} L${Q(P(-0.21, 0.9))}" stroke="#3a1408" stroke-width="${f(0.1 * L)}" opacity="0.2" filter="url(#b4)"/>`;
    if (!palmV) sh += `<ellipse cx="${f(t * 0.0 * L)}" cy="${f(0.24 * L)}" rx="${f(0.11 * L)}" ry="${f(0.16 * L)}" fill="#fff" opacity="0.09" filter="url(#b8)"/>`;
    let det = '';
    // where the thumb leaves the hand: the hand's edge over its root
    if (!thumbOver) det += palmV ? `<path d="M${Q(P(0.19, 0.31))} C${Q(P(0.15, 0.24))} ${Q(P(0.1, 0.18))} ${Q(P(0.06, 0.06))}" ${ln(0.42)}/>` : `<path d="M${Q(P(0.198, 0.34))} C${Q(P(0.19, 0.24))} ${Q(P(0.17, 0.15))} ${Q(P(0.14, 0.08))}" ${ln(0.5)}/>`;
    { const d = [thT[0] - thJ[0], thT[1] - thJ[1]], dl = Math.hypot(d[0], d[1]) || 1, u = [d[0] / dl, d[1] / dl], c = [thJ[0] + u[0] * 0.02 * L, thJ[1] + u[1] * 0.02 * L]; det += across(c, u, TH[4] * L * 0.34, 0.3); if (!palmV && !fist) { const nc = [thT[0] - u[0] * 0.05 * L, thT[1] - u[1] * 0.05 * L]; det += `<ellipse cx="${f(nc[0])}" cy="${f(nc[1])}" rx="${f(0.026 * L)}" ry="${f(0.04 * L)}" transform="rotate(${f(Math.atan2(-u[0], u[1]) * 180 / Math.PI)},${f(nc[0])},${f(nc[1])})" fill="${o.nails || shade(hs, 0.22)}" opacity="${o.nails ? 1 : 0.6}"/>`; } }
    if (!fist || pose === 'point' || pose === 'legs') {
      // the gaps between straight fingers: a soft shadow, then a thin line
      for (let i = 0; i < 3; i++) {
        const A = tips[i], B = tips[i + 1]; if (!A || !B) continue;
        const m0 = [(A[0][0] + B[0][0]) / 2, (A[0][1] + B[0][1]) / 2 + 0.05 * L], ln2 = Math.min(A[4], B[4]) * 0.84, md = [(A[2][0] + B[2][0]) / 2, (A[2][1] + B[2][1]) / 2], m1 = [m0[0] + md[0] * ln2, m0[1] + md[1] * ln2];
        sh += `<path d="M${Q(m0)} L${Q(m1)}" stroke="#3a1408" stroke-width="${f(0.028 * L)}" opacity="0.3" filter="url(#b1)"/>`;
        det += `<path d="M${Q(m0)} L${Q(m1)}" ${ln(0.62)}/>`;
      }
      tips.forEach(([b, e, d, w, vl]) => {
        const at = k => [b[0] + d[0] * (0.06 * L + vl * k), b[1] + d[1] * (0.06 * L + vl * k)];
        if (!palmV) {
          // the knuckle's sheen, two joint creases, the nail
          const kq = at(-0.04); sh += `<path d="M${f(kq[0] + d[1] * w * 0.3)},${f(kq[1] - d[0] * w * 0.3)} L${f(kq[0] - d[1] * w * 0.3)},${f(kq[1] + d[0] * w * 0.3)}" stroke="${shade(hs, 0.34)}" stroke-width="${f(0.034 * L)}" opacity="0.5" stroke-linecap="round" filter="url(#b05)"/>`;
          det += across(at(0.42), d, w * 0.26, 0.3) + across(at(0.7), d, w * 0.22, 0.26);
          const nc = at(0.86);
          det += `<ellipse cx="${f(nc[0])}" cy="${f(nc[1])}" rx="${f(w * 0.28)}" ry="${f(w * 0.36)}" transform="rotate(${f(Math.atan2(-d[0], d[1]) * 180 / Math.PI)},${f(nc[0])},${f(nc[1])})" fill="${o.nails || shade(hs, 0.24)}" opacity="${o.nails ? 1 : 0.62}"/>`;
        } else det += across(at(0.36), d, w * 0.3, 0.38) + across(at(0.66), d, w * 0.26, 0.32);
      });
    }
    if (!fist) {
      if (palmV) det += `<path d="M${Q(P(-0.185, 0.33))} Q${Q(P(0, 0.4))} ${Q(P(0.15, 0.3))}" ${ln(0.48)}/><path d="M${Q(P(-0.165, 0.25))} Q${Q(P(0.02, 0.28))} ${Q(P(0.16, 0.22))}" ${ln(0.4)}/><path d="M${Q(P(0.15, 0.04))} Q${Q(P(0.05, 0.16))} ${Q(P(0.11, 0.3))}" ${ln(0.42)}/>`;
      // (the tendons fanning from the wrist to the knuckles, barely there)
      else for (const [kx, ky] of FING) det += `<path d="M${Q(P(kx * 0.4, 0.06))} L${Q(P(kx * 0.92, ky - 0.08))}" ${ln(0.12)}/>`;
    } else {
      // the knuckle block: a crease where it meets the back of the hand, the knuckles' sheen, the lines between
      // the curled fingers and the fold of each one
      det += `<path d="M${Q(P(-0.19, 0.39))} Q${Q(P(0, 0.455))} ${Q(P(0.2, 0.41))}" ${ln(0.42)}/>`;
      segs.forEach(([kx, ky, w, lenK = 1]) => { sh += `<path d="M${Q(P(kx - w * 0.32, ky - 0.005))} Q${Q(P(kx, ky - 0.035))} ${Q(P(kx + w * 0.32, ky - 0.005))}" stroke="${shade(hs, 0.36)}" stroke-width="${f(0.034 * L)}" fill="none" opacity="0.55" filter="url(#b05)"/>`; det += `<path d="M${Q(P(kx - w * 0.36, ky + 0.13 * lenK))} Q${Q(P(kx, ky + 0.16 * lenK))} ${Q(P(kx + w * 0.36, ky + 0.13 * lenK))}" ${ln(G.RIG_CRISP ? 0.26 : 0.34)}/>`; });
      if (G.RIG_CRISP) for (let i = 0; i < segs.length - 1; i++) { const xm = (segs[i][0] + segs[i + 1][0]) / 2, y0 = Math.max(segs[i][1], segs[i + 1][1]) + 0.01, fa = (segs[i][4] + segs[i + 1][4]) / 2, l2 = 0.17 * Math.min(segs[i][3], segs[i + 1][3]); det += `<path d="M${Q(P(xm, y0))} Q${Q(P(xm + Math.sin(fa) * l2 * 0.5 + 0.004, y0 + l2 * 0.5))} ${Q(P(xm + Math.sin(fa) * l2, y0 + l2))}" ${ln(0.42)}/>`; }
      else for (let i = 0; i < segs.length - 1; i++) { const xm = (segs[i][0] + segs[i + 1][0]) / 2, y0 = Math.max(segs[i][1], segs[i + 1][1]) - 0.01; det += `<path d="M${Q(P(xm, y0))} L${Q(P(xm, y0 + 0.24))}" ${ln(0.7)}/>`; }
      sh += `<rect x="${f(-0.5 * L)}" y="${f(0.6 * L)}" width="${f(L)}" height="${f(0.2 * L)}" fill="#3a1408" opacity="0.2" filter="url(#b4)"/>`;
    }
    // a fist seen from the palm side: the thumb lies over the curled fingers, outlined on its own
    const thumbG = thumbOver ? `<g>${outl(`<path d="${thumb}"/>`)}<path d="${thumb}" fill="url(#${id})"/></g>` : '';
    // (the outline runs down both sides of the wrist but not across it: the hand is drawn over its sleeve and meets the
    // wrist below the cuff, where a line across would read as the edge of a glove)
    // (o.joinWrist, with G.RIG_CRISP on a sleeved arm: the hand's top dissolves over a short band into the wrist piece
    // drawn under it (wristBridge), and its side outlines start just below where the wrist's take over, so no flat top
    // edge, corner or line across the wrist shows - the joint reads as one limb, not a hand pinned to a sleeve)
    const join = !!o.joinWrist;
    const mk = `<mask id="${id}m" maskUnits="userSpaceOnUse" x="${f(-2 * L)}" y="${f(-2 * L)}" width="${f(4 * L)}" height="${f(4 * L)}"><rect x="${f(-2 * L)}" y="${f(-2 * L)}" width="${f(4 * L)}" height="${f(4 * L)}" fill="#fff"/><rect x="${f((join ? -0.26 : -0.138) * L)}" y="${f(-0.4 * L)}" width="${f((join ? 0.52 : 0.276) * L)}" height="${f((join ? 0.43 : 0.405) * L)}" fill="#000"/></mask>` +
      (join ? `<linearGradient id="${id}fg" gradientUnits="userSpaceOnUse" x1="0" y1="${f(-0.05 * L)}" x2="0" y2="${f(0.035 * L)}"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#fff"/></linearGradient><mask id="${id}f" maskUnits="userSpaceOnUse" x="${f(-L)}" y="${f(-L)}" width="${f(2 * L)}" height="${f(2.6 * L)}"><rect x="${f(-L)}" y="${f(-L)}" width="${f(2 * L)}" height="${f(2.6 * L)}" fill="url(#${id}fg)"/></mask>` : '');
    let g = `<defs>${grd}${mk}<clipPath id="${id}c">${body}</clipPath></defs>` + objBack;
    g += `<g mask="url(#${id}m)">${outl(body)}</g>` + (join ? `<g mask="url(#${id}f)">` : '') + `<g fill="url(#${id})">${body}</g><g clip-path="url(#${id}c)">${sh}</g>` + (join ? '</g>' : '') + `${det}${thumbG}`;
    g += objFront;
    return `<g transform="translate(${f(o.x)},${f(o.y)}) rotate(${f(a * 180 / Math.PI)})">${g}</g>`;
  }

  // ---------------- arms v2: one sleeve, shoulder to cuff (The Royal Fool, after delivery) ----------------
  // The whole sleeve is one closed shape: both edges run down the arm, round the outside of the elbow on an arc and into
  // a crease on its inside, to a cuff a little short of the wrist. The shading runs along the arm and round the bend
  // with it (two tubes pinned at the elbow, each shaded across its own direction, read as cut-out pieces), with folds
  // at the crease, across the upper arm above the elbow and across the forearm, and a fitted cuff band.
  // part: 'all'; 'fore' - the same drawing fading in from the elbow (the copy drawn over the head and the body, so a
  // forearm in front of them is in front); 'end' - only the end of the sleeve (for a hand the shot draws on its own).
  // Fresh ids on every call.
  function sleeveV2(g, part = 'all') {
    const { sh, E, Wc, ud, dn, ul, fcl, w0, w1, w2, sl, lat, sw, fsK, weave } = g;
    const add = (p, v, k) => [p[0] + v[0] * k, p[1] + v[1] * k], Q = p => `${f(p[0])},${f(p[1])}`;
    const nU = [-ud[1], ud[0]], nF = [-dn[1], dn[0]], cr = ud[0] * dn[1] - ud[1] * dn[0];
    const sIn = cr >= 0 ? 1 : -1, sOut = -sIn, sLat = nU[0] * lat >= 0 ? 1 : -1, sMed = -sLat;
    const A = s => add(sh, nU, s * w0 / 2), B = s => add(E, nU, s * w1 / 2), Cf = s => add(E, nF, s * w1 / 2), Dd = s => add(Wc, nF, s * w2 / 2);
    // the crease: where the two inner edges cross, kept within reach of the elbow
    let X;
    {
      const a = A(sIn), b = B(sIn), c = Cf(sIn), d = Dd(sIn), r = [b[0] - a[0], b[1] - a[1]], q = [d[0] - c[0], d[1] - c[1]], den = r[0] * q[1] - r[1] * q[0];
      if (Math.abs(cr) < 0.03 || Math.abs(den) < 1e-6) X = [(b[0] + c[0]) / 2, (b[1] + c[1]) / 2];
      else { const tt = ((c[0] - a[0]) * q[1] - (c[1] - a[1]) * q[0]) / den; X = add(a, r, tt); }
      const ex = X[0] - E[0], ey = X[1] - E[1], dd = Math.hypot(ex, ey), lim = w1 * 0.85;
      if (dd > lim) X = [E[0] + ex / dd * lim, E[1] + ey / dd * lim];
    }
    // round the outside of the elbow, from one edge to the other
    const arc = (p, q2) => { const cx = (p[0] - E[0]) * (q2[1] - E[1]) - (p[1] - E[1]) * (q2[0] - E[0]); return `A${f(w1 / 2)},${f(w1 / 2)} 0 0 ${cx > 0 ? 1 : 0} ${Q(q2)}`; };
    // (G.RIG_CRISP: the inside of the bend is a soft rounded fold, not a sharp paper corner)
    const rnd = (P0, P1, P2) => { const rr = w1 * 0.45, a = Math.min(0.45, rr / (Math.hypot(P0[0] - P1[0], P0[1] - P1[1]) || 1)), b = Math.min(0.45, rr / (Math.hypot(P2[0] - P1[0], P2[1] - P1[1]) || 1)); return `L${Q([P1[0] + (P0[0] - P1[0]) * a, P1[1] + (P0[1] - P1[1]) * a])} Q${Q(P1)} ${Q([P1[0] + (P2[0] - P1[0]) * b, P1[1] + (P2[1] - P1[1]) * b])}`; };
    // (G.RIG_CRISP: the forearm's outer edge swells a little and tapers into the cuff - two straight edges read as a box)
    const bul = (p, q, s) => add([(p[0] + q[0]) / 2, (p[1] + q[1]) / 2], nF, s * w1 * 0.07);
    const down = s => s === sOut ? `L${Q(B(s))} ${arc(B(s), Cf(s))} ` + (G.RIG_CRISP ? `Q${Q(bul(Cf(s), Dd(s), s))} ${Q(Dd(s))}` : `L${Q(Dd(s))}`) : (G.RIG_CRISP ? `${rnd(A(s), X, Dd(s))} L${Q(Dd(s))}` : `L${Q(X)} L${Q(Dd(s))}`);
    const upTo = (s, end) => s === sOut ? (G.RIG_CRISP ? `Q${Q(bul(Dd(s), Cf(s), s))} ${Q(Cf(s))}` : `L${Q(Cf(s))}`) + ` ${arc(Cf(s), B(s))} L${Q(end)}` : (G.RIG_CRISP ? `${rnd(Dd(s), X, end)} L${Q(end)}` : `L${Q(X)} L${Q(end)}`);
    const kc = w2 * 0.3, k0 = w0 * 0.66;
    const cuff = `C${Q(add(Dd(sLat), dn, kc))} ${Q(add(Dd(sMed), dn, kc))} ${Q(Dd(sMed))}`;
    const shape = `M${Q(A(sLat))} ${down(sLat)} ${cuff} ${upTo(sMed, A(sMed))} C${Q(add(A(sMed), ud, -k0))} ${Q(add(A(sLat), ud, -k0))} ${Q(A(sLat))}Z`;
    // the outline: over the outside of the shoulder (its top is under the body's yoke), down the outer side, round the
    // cuff and up the inner side to just below the armpit
    const capTop = add(sh, ud, -w0 / 2);
    const aM = A(sMed), tgt = sMed === sOut ? B(sMed) : X, L0 = Math.hypot(tgt[0] - aM[0], tgt[1] - aM[1]) || 1;
    const Ap = add(aM, [(tgt[0] - aM[0]) / L0, (tgt[1] - aM[1]) / L0], Math.min(0.75 * sw, L0));
    const outline = `M${Q(capTop)} C${Q(add(capTop, nU, sLat * w0 * 0.28))} ${Q(add(A(sLat), ud, -w0 * 0.28))} ${Q(A(sLat))} ${down(sLat)} ${cuff} ${upTo(sMed, Ap)}`;
    // a box round the arm: blurred strokes get it as their filter region (a straight stroke has no width of its own)
    const xs = [sh[0], E[0], Wc[0]], ys = [sh[1], E[1], Wc[1]], bx0 = Math.min(...xs) - w0, by0 = Math.min(...ys) - w0, bx1 = Math.max(...xs) + w0, by1 = Math.max(...ys) + w0;
    const box = `<rect x="${f(bx0)}" y="${f(by0)}" width="${f(bx1 - bx0)}" height="${f(by1 - by0)}" fill="none"/>`;
    // shading along the arm: the outer side in shadow, the inner side a little, a soft light between
    const bisV = [nU[0] + nF[0], nU[1] + nF[1]], bl = Math.hypot(bisV[0], bisV[1]), bis = bl < 1e-3 ? nU : [bisV[0] / bl, bisV[1] / bl];
    const latC = `M${Q(A(sLat))} ${down(sLat)}`, medC = `M${Q(A(sMed))} ${down(sMed)}`;
    const hl = `M${Q(add(sh, nU, sMed * w0 * 0.14))} L${Q(add(E, bis, sMed * w1 * 0.12))} L${Q(add(Wc, nF, sMed * w2 * 0.14))}`;
    // (G.RIG_CRISP: clean, defined form shadows instead of wide airbrushed bands, which read as smudges and see-through
    // fades on light cloth against a dark ground)
    let shd = G.RIG_CRISP
      ? `<g filter="url(#b4)">${box}<path d="${latC}" stroke="${shade(sl, -0.42)}" stroke-width="${f(w1 * 0.56)}" fill="none" stroke-linejoin="round" opacity="0.5"/></g>` +
        `<g filter="url(#b2)">${box}<path d="${medC}" stroke="${shade(sl, -0.28)}" stroke-width="${f(w1 * 0.26)}" fill="none" stroke-linejoin="round" opacity="0.4"/><path d="${hl}" stroke="${shade(sl, 0.24)}" stroke-width="${f(w1 * 0.16)}" fill="none" stroke-linejoin="round" stroke-linecap="round" opacity="0.42"/></g>`
      : `<g filter="url(#b8)">${box}<path d="${latC}" stroke="${shade(sl, -0.46)}" stroke-width="${f(w1 * 0.55)}" fill="none" stroke-linejoin="round" opacity="0.6"/></g>` +
        `<g filter="url(#b4)">${box}<path d="${medC}" stroke="${shade(sl, -0.32)}" stroke-width="${f(w1 * 0.3)}" fill="none" stroke-linejoin="round" opacity="0.42"/><path d="${hl}" stroke="${shade(sl, 0.22)}" stroke-width="${f(w1 * 0.16)}" fill="none" stroke-linejoin="round" stroke-linecap="round" opacity="0.4"/></g>`;
    // folds: a crease at the inside of the bend fanning into both halves; soft folds across the upper arm above the
    // elbow and across the forearm toward the cuff
    const bend = Math.min(1, Math.abs(cr) * 1.25);
    let fo = '';
    if (bend > 0.1) {
      const fc = shade(sl, -0.6);
      fo += `<path d="M${Q(X)} Q${Q(add(add(X, dn, w1 * 0.25), nF, sOut * w1 * 0.08))} ${Q(add(add(X, dn, w1 * 0.55), nF, sOut * w1 * 0.22))}" stroke="${fc}" stroke-width="${f(sw * 0.05)}" fill="none" stroke-linecap="round" opacity="${f(0.55 * bend)}"/>`;
      fo += `<path d="M${Q(X)} Q${Q(add(add(X, ud, -w1 * 0.25), nU, sOut * w1 * 0.08))} ${Q(add(add(X, ud, -w1 * 0.55), nU, sOut * w1 * 0.24))}" stroke="${fc}" stroke-width="${f(sw * 0.045)}" fill="none" stroke-linecap="round" opacity="${f(0.45 * bend)}"/>`;
      fo += `<ellipse cx="${f(X[0])}" cy="${f(X[1])}" rx="${f(w1 * 0.22)}" ry="${f(w1 * 0.22)}" fill="#1a0c04" opacity="${f(0.28 * bend)}"/>`;
    }
    for (const k of [0.6, 0.82]) { const c = add(sh, ud, ul * k); fo += `<path d="M${Q(add(c, nU, sLat * w0 * 0.4))} Q${Q(add(c, ud, w0 * 0.1))} ${Q(add(c, nU, sMed * w0 * 0.3))}" stroke="${shade(sl, -0.5)}" stroke-width="${f(sw * 0.035)}" fill="none" opacity="0.42"/>`; }
    for (const k of [0.38, 0.7]) { const c = add(E, dn, fcl * k), w = w1 + (w2 - w1) * k; fo += `<path d="M${Q(add(c, nF, sOut * w * 0.42))} Q${Q(add(c, dn, w * 0.12))} ${Q(add(c, nF, sIn * w * 0.3))}" stroke="${shade(sl, -0.5)}" stroke-width="${f(sw * 0.03)}" fill="none" opacity="0.32"/>`; }
    if (G.RIG_CRISP) { for (const k of [0.84, 0.92]) { const c = add(E, dn, fcl * k), w = w1 + (w2 - w1) * k; fo += `<path d="M${Q(add(c, nF, sLat * w * 0.46))} Q${Q(add(add(c, dn, -w * 0.08), nF, sLat * w * 0.1))} ${Q(add(add(c, dn, w * 0.04), nF, sMed * w * 0.2))}" stroke="${shade(sl, -0.45)}" stroke-width="${f(sw * 0.026)}" fill="none" stroke-linecap="round" opacity="0.5"/>`; } fo = `<g opacity="0.72">${fo}</g>`; }
    // the fitted cuff band: a shade darker, its seam a thin line, a light edge where it turns
    const cb = Math.min(sw * 0.14, fcl * 0.25), C0 = add(Wc, dn, -cb), Cx = add(Wc, dn, w2);
    let band = `<path d="M${Q(add(C0, nF, w2 * 0.8))} L${Q(add(Cx, nF, w2 * 0.8))} L${Q(add(Cx, nF, -w2 * 0.8))} L${Q(add(C0, nF, -w2 * 0.8))}Z" fill="${shade(sl, G.RIG_CRISP ? -0.06 : -0.14)}" opacity="${G.RIG_CRISP ? 0.7 : 0.85}"/>`;
    if (G.RIG_CRISP) { const bc = add(add(C0, dn, cb * 0.55), nF, sLat * w2 * 0.3); band += `<circle cx="${f(bc[0])}" cy="${f(bc[1])}" r="${f(Math.max(1.2, w2 * 0.055))}" fill="${shade(sl, 0.28)}" stroke="${shade(sl, -0.5)}" stroke-width="0.8"/>`; }
    band += `<path d="M${Q(add(C0, nF, w2 * 0.6))} L${Q(add(C0, nF, -w2 * 0.6))}" stroke="${shade(sl, -0.55)}" stroke-width="1.2" ${NS} opacity="0.55"/>`;
    const id = uid('sv');
    let body = `<defs><clipPath id="${id}c"><path d="${shape}"/></clipPath></defs><g filter="url(#clothN)"><path d="${shape}" fill="${sl}"/><g clip-path="url(#${id}c)">${weaveFill(weave, bx0, by0, bx1 - bx0, by1 - by0)}${shd}<g filter="url(#b1)">${box}${fo}</g>${band}<g filter="url(#b1)">${box}<path d="M${Q(add(add(C0, dn, cb * 0.35), nF, w2 * 0.5))} L${Q(add(add(C0, dn, cb * 0.35), nF, -w2 * 0.5))}" stroke="${shade(sl, 0.32)}" stroke-width="${f(sw * 0.03)}" opacity="0.45"/></g></g></g><path d="${outline}" fill="none" ${ol()}/>`;
    // a forearm coming toward the lens (drawn short) shows the open end of its sleeve, deepening with the foreshortening
    // (not with G.RIG_CRISP: half-transparent over light cloth it read as a glassy bubble on the cuff; the wrist piece
    // now leaves the cuff cleanly at any angle)
    if (fsK > 0 && !G.RIG_CRISP) {
      const rx = w2 * 0.48, ry = w2 * 0.48 * (0.28 + 0.5 * fsK), r = Math.atan2(dn[1], dn[0]) * 180 / Math.PI + 90, oc = add(Wc, dn, -ry * 0.25);
      body += `<g opacity="${f(0.6 * fsK)}"><ellipse cx="${f(oc[0])}" cy="${f(oc[1])}" rx="${f(rx)}" ry="${f(ry)}" transform="rotate(${f(r)},${f(oc[0])},${f(oc[1])})" fill="${shade(sl, -0.42)}" stroke="${shade(sl, -0.6)}" stroke-width="1.2" ${NS}/></g>`;
    }
    if (part === 'all') return body;
    // the copies show only the forearm's own outline (a band along it, a little wider, from just above the elbow to past
    // the cuff) and fade in along it. (A cut across the whole picture through the elbow swept over the upper arm whenever
    // the arm folded or the elbow swung, and laid the upper sleeve over the King's mantle for a frame: CAP 100, KING 1995)
    const kE = Math.min(sw * 0.55, fcl * 0.45), fore = part === 'fore';
    const q0 = add(E, dn, fore ? -0.12 * w1 : fcl - kE - 0.05 * sw), q1 = add(Wc, dn, w2 * 0.5), wA = (fore ? w1 : w2) * 0.62, wB = w2 * 0.62;
    const fband = `M${Q(add(q0, nF, wA))} L${Q(add(q1, nF, wB))} L${Q(add(q1, nF, -wB))} L${Q(add(q0, nF, -wA))}Z`;
    const p0 = fore ? add(E, dn, -0.05 * sw) : add(Wc, dn, -kE), p1 = add(p0, dn, (G.RIG_CRISP ? (fore ? 0.07 : 0.06) : (fore ? 0.32 : 0.25)) * sw);
    const R2 = ul + fcl + 3 * w0;
    return `<defs><clipPath id="${id}k"><path d="${fband}"/></clipPath><linearGradient id="${id}g" gradientUnits="userSpaceOnUse" x1="${f(p0[0])}" y1="${f(p0[1])}" x2="${f(p1[0])}" y2="${f(p1[1])}"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#fff"/></linearGradient><mask id="${id}m" maskUnits="userSpaceOnUse" x="${f(E[0] - R2)}" y="${f(E[1] - R2)}" width="${f(2 * R2)}" height="${f(2 * R2)}"><rect x="${f(E[0] - R2)}" y="${f(E[1] - R2)}" width="${f(2 * R2)}" height="${f(2 * R2)}" fill="url(#${id}g)"/></mask></defs><g clip-path="url(#${id}k)"><g mask="url(#${id}m)">${body}</g></g>`;
  }

  // ---------------- arms ----------------
  // tapered limb segment with rounded ends, shaded across its width
  function limb(A, B, w1, w2, col, extra = '') {
    const dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, id = uid('lb');
    const P = (p, n, w) => [p[0] + nx * n * w / 2, p[1] + ny * n * w / 2];
    const a1 = P(A, 1, w1), a2 = P(A, -1, w1), b1 = P(B, 1, w2), b2 = P(B, -1, w2);
    const g = `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${f(a1[0])}" y1="${f(a1[1])}" x2="${f(a2[0])}" y2="${f(a2[1])}"><stop offset="0" stop-color="${shade(col, -0.3)}"/><stop offset="0.35" stop-color="${shade(col, 0.07)}"/><stop offset="0.62" stop-color="${col}"/><stop offset="1" stop-color="${shade(col, -0.36)}"/></linearGradient>`;
    const d = `M${f(a1[0])},${f(a1[1])} L${f(b1[0])},${f(b1[1])} A${f(w2 / 2)},${f(w2 / 2)} 0 0 0 ${f(b2[0])},${f(b2[1])} L${f(a2[0])},${f(a2[1])} A${f(w1 / 2)},${f(w1 / 2)} 0 0 0 ${f(a1[0])},${f(a1[1])}Z`;
    const r = Math.atan2(-dx, dy) * 180 / Math.PI;
    return `<defs>${g}</defs><path d="${d}" fill="url(#${id})" ${ol()}/>` + (extra ? `<g transform="translate(${f(A[0])},${f(A[1])}) rotate(${f(r)})">${extra}</g>` : '');
  }
  // (o.weave = { kind: 'twill' | 'linen', op }) the cloth's own weave, laid over the torso and the sleeves under their
  // shading: a fine, regular thread texture in neutral dark and light threads, so it works on any colour (2026-11-08:
  // plain flat fills read as "not detailed"). tailor.js lays the same patterns (same ids) on lapels and waistcoats.
  const WEAVE = {
    twill: `<pattern id="rgWvTwill" patternUnits="userSpaceOnUse" width="5" height="5" patternTransform="rotate(38)"><path d="M0,1.2 L5,1.2" stroke="#000" stroke-width="1.3" opacity="0.55"/><path d="M0,3.7 L5,3.7" stroke="#fff" stroke-width="1" opacity="0.4"/></pattern>`,
    linen: `<pattern id="rgWvLinen" patternUnits="userSpaceOnUse" width="3.6" height="3.6"><path d="M0,0.9 L3.6,0.9" stroke="#000" stroke-width="0.8" opacity="0.4"/><path d="M0.9,0 L0.9,3.6" stroke="#000" stroke-width="0.6" opacity="0.28"/><path d="M0,2.7 L3.6,2.7" stroke="#fff" stroke-width="0.7" opacity="0.35"/></pattern>`
  };
  const weaveFill = (w, x, y, W, H) => w && WEAVE[w.kind] ? `<defs>${WEAVE[w.kind]}</defs><rect x="${f(x)}" y="${f(y)}" width="${f(W)}" height="${f(H)}" fill="url(#rgWv${w.kind === 'twill' ? 'Twill' : 'Linen'})" opacity="${w.op ?? 0.16}"/>` : '';
  // (G.RIG_CRISP) the wrist as one smooth piece from inside the cuff to the back of the hand. Its sides leave the cuff
  // along the forearm and curve into the hand's own line, as wide as the cuff opening at one end and as the back of the
  // hand at the other, so a hand bent at the wrist never shows the corner of its flat top edge standing out past a
  // straight wrist (a capsule laid along the forearm did: the hand read as a cut-out pinned on - the user, 2026-11-08:
  // "they look like cutted pngs"). Outlined along its two sides only; the hand is drawn over its lower end.
  function wristBridge(Wc, dn, W, hn, wIn, cw, HL, col) {
    const add = (p, v, k) => [p[0] + v[0] * k, p[1] + v[1] * k], Q = p => `${f(p[0])},${f(p[1])}`;
    const nF = [-dn[1], dn[0]]; let nH = [-hn[1], hn[0]]; if (nF[0] * nH[0] + nF[1] * nH[1] < 0) nH = [-nH[0], -nH[1]];
    const a0 = add(Wc, dn, -wIn), wa = cw * 0.46, wb = HL * 0.152, b0 = add(W, hn, -0.045 * HL), b1 = add(W, hn, 0.12 * HL);
    const k = 0.5 * Math.hypot(b0[0] - Wc[0], b0[1] - Wc[1]) + 0.5;
    // (the side on the inside of the bend gets short handles: with long ones it looped over itself into a point when the
    // hand turned sharply off the forearm - a hand gripping sideways on an arm that hangs down)
    const bendIn = s => (nF[0] * s * hn[0] + nF[1] * s * hn[1]) > 0, dd = Math.max(-1, Math.min(1, dn[0] * hn[0] + dn[1] * hn[1])), sharp = Math.max(0, Math.min(1, (0.8 - dd) / 0.8));
    const S = s => { const p1 = add(Wc, nF, s * wa), q0 = add(b0, nH, s * wb), kk = k * (bendIn(s) ? Math.max(0.15, 1 - 0.85 * sharp) : Math.max(0.35, 1 - 0.65 * sharp)); return { p0: add(a0, nF, s * wa), p1, q0, q1: add(b1, nH, s * wb * 0.98), c1: add(p1, dn, kk), c2: add(q0, hn, -kk) }; };
    const A = S(1), B = S(-1), id = uid('wb'), g1 = add(W, nH, wb), g2 = add(W, nH, -wb);
    const d = `M${Q(A.p0)} L${Q(A.p1)} C${Q(A.c1)} ${Q(A.c2)} ${Q(A.q0)} L${Q(A.q1)} L${Q(B.q1)} L${Q(B.q0)} C${Q(B.c2)} ${Q(B.c1)} ${Q(B.p1)} L${Q(B.p0)}Z`;
    const grd = `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${f(g1[0])}" y1="${f(g1[1])}" x2="${f(g2[0])}" y2="${f(g2[1])}"><stop offset="0" stop-color="${shade(col, -0.22)}"/><stop offset="0.4" stop-color="${shade(col, 0.05)}"/><stop offset="0.7" stop-color="${col}"/><stop offset="1" stop-color="${shade(col, -0.2)}"/></linearGradient>`;
    const side = s => `M${Q(s.p1)} C${Q(s.c1)} ${Q(s.c2)} ${Q(s.q0)} L${Q(s.q1)}`;
    return `<defs>${grd}</defs><path d="${d}" fill="url(#${id})"/><path d="${side(A)} ${side(B)}" fill="none" ${ol()}/>`;
  }
  // the sore on the front of a bare shin just above the ankle (person-local), shared by the drawing and the shots
  function woundPt(D, s) { return [s * D.legX - s * D.legW * 0.06, -D.foot * 0.98]; }
  // burning / blister / open sore / wet sheen drawn on the rig's own lower leg, so it stays attached at any zoom or angle
  function legFx(x, s, D, skin, fx, clipId) {
    const [wx, wy] = woundPt(D, s), w2 = D.legW * 0.74;
    let g = '', clip = '';
    clip += `<ellipse cx="${f(x - s * w2 * 0.28)}" cy="${f(-D.foot * 0.75)}" rx="${f(w2 * 0.12)}" ry="${f(w2 * 0.2)}" fill="#fff" opacity="0.12"/>`;
    if (fx.heat) clip += `<ellipse cx="${f(wx)}" cy="${f(wy)}" rx="${f(w2 * (0.7 + fx.heat * 0.5))}" ry="${f(D.foot * (0.55 + fx.heat * 0.4))}" fill="#ff3010" opacity="${f(0.5 * fx.heat)}" filter="url(#b8)"/><ellipse cx="${f(wx)}" cy="${f(wy)}" rx="${f(w2 * 0.35)}" ry="${f(w2 * 0.45)}" fill="#ffb040" opacity="${f(0.45 * fx.heat)}" filter="url(#b4)"/>`;
    if (fx.under) clip += `<rect x="${f(x - D.legW)}" y="${f(D.hemY - 60)}" width="${f(D.legW * 2)}" height="${f(-D.hemY + 80)}" fill="#2a6a7a" opacity="0.3" style="mix-blend-mode:multiply"/>`;
    g += `<g clip-path="url(#${clipId})">${clip}</g>`;
    if (fx.heat) g += `<ellipse cx="${f(x)}" cy="${f(-D.foot * 0.25)}" rx="${f(D.foot * 0.36)}" ry="${f(D.foot * 0.2)}" fill="#ff4020" opacity="${f(0.25 * fx.heat)}" filter="url(#b4)"/>`;
    if (fx.blister > 0.01) {
      const b = fx.blister, r = w2 * (0.12 + b * 0.42);
      g += `<ellipse cx="${f(wx)}" cy="${f(wy - b * 3)}" rx="${f(r * 1.08)}" ry="${f(r)}" fill="#f0d8b8" opacity="${f(0.62 + b * 0.3)}" stroke="${shade(skin, -0.4)}" stroke-width="1.6"/>`;
      g += `<ellipse cx="${f(wx - r * 0.3)}" cy="${f(wy - r * 0.42)}" rx="${f(r * 0.34)}" ry="${f(r * 0.2)}" fill="#fff" opacity="0.7"/><ellipse cx="${f(wx)}" cy="${f(wy + r * 0.32)}" rx="${f(r * 0.85)}" ry="${f(r * 0.36)}" fill="#c87a60" opacity="0.28"/>`;
    }
    if (fx.wound > 0.01) {
      const k = fx.wound, rx = w2 * (0.1 + 0.2 * k), ry = w2 * (0.08 + 0.16 * k);
      g += `<ellipse cx="${f(wx)}" cy="${f(wy)}" rx="${f(rx * 1.5)}" ry="${f(ry * 1.5)}" fill="#a0402e" opacity="0.55" filter="url(#b2)"/>`;
      g += `<ellipse cx="${f(wx)}" cy="${f(wy)}" rx="${f(rx)}" ry="${f(ry)}" fill="#7a1a14" stroke="${OUT}" stroke-width="1.2"/><ellipse cx="${f(wx)}" cy="${f(wy + ry * 0.15)}" rx="${f(rx * 0.6)}" ry="${f(ry * 0.6)}" fill="#3a0806"/><path d="M${f(wx - rx)},${f(wy - ry * 0.5)} q${f(rx)},${f(-ry * 0.7)} ${f(rx * 2)},0" stroke="#e8c8b0" stroke-width="1.6" fill="none" opacity="0.6"/>`;
    }
    if (fx.wet) g += `<path d="M${f(x - s * w2 * 0.3)},${f(D.hemY + 40)} L${f(x - s * w2 * 0.26)},${f(-D.foot * 0.7)}" stroke="#fff" stroke-width="3" opacity="${f(0.35 * fx.wet)}"/><circle cx="${f(x + s * w2 * 0.2)}" cy="${f(D.hemY * 0.45)}" r="3.5" fill="#e8f8ff" opacity="${f(0.7 * fx.wet)}"/><circle cx="${f(x - s * w2 * 0.1)}" cy="${f(D.hemY * 0.3)}" r="2.6" fill="#e8f8ff" opacity="${f(0.7 * fx.wet)}"/>`;
    return g;
  }
  // limb segment whose outline is only drawn where the silhouette really is (sides + chosen ends),
  // so overlapping segments join without a ring at the joint
  function openLimb(A, B, w1, w2, col, top = false, bottom = true, extra = '') {
    const dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, id = uid('ol');
    const P = (p, n, w) => [p[0] + nx * n * w / 2, p[1] + ny * n * w / 2], Q = p => `${f(p[0])},${f(p[1])}`;
    const a1 = P(A, 1, w1), a2 = P(A, -1, w1), b1 = P(B, 1, w2), b2 = P(B, -1, w2);
    const g = `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${f(a1[0])}" y1="${f(a1[1])}" x2="${f(a2[0])}" y2="${f(a2[1])}"><stop offset="0" stop-color="${shade(col, -0.3)}"/><stop offset="0.35" stop-color="${shade(col, 0.05)}"/><stop offset="0.62" stop-color="${col}"/><stop offset="1" stop-color="${shade(col, -0.32)}"/></linearGradient>`;
    const d = `M${Q(a1)} L${Q(b1)} A${f(w2 / 2)},${f(w2 / 2)} 0 0 0 ${Q(b2)} L${Q(a2)} A${f(w1 / 2)},${f(w1 / 2)} 0 0 0 ${Q(a1)}Z`;
    const r = Math.atan2(-dx, dy) * 180 / Math.PI;
    const fill = `<defs>${g}</defs><path d="${d}" fill="url(#${id})"/>` + (extra ? `<g transform="translate(${Q(A)}) rotate(${f(r)})">${extra}</g>` : '');
    let lines = `<path d="M${Q(a1)} L${Q(b1)}" fill="none" ${ol()}/><path d="M${Q(a2)} L${Q(b2)}" fill="none" ${ol()}/>`;
    if (bottom) lines += `<path d="M${Q(b1)} A${f(w2 / 2)},${f(w2 / 2)} 0 0 0 ${Q(b2)}" fill="none" ${ol()}/>`;
    if (top) lines += `<path d="M${Q(a2)} A${f(w1 / 2)},${f(w1 / 2)} 0 0 0 ${Q(a1)}" fill="none" ${ol()}/>`;
    return { fill, lines, gid: id };
  }
  function arm(side, sh, o, D, C) {
    const lat = side === 'R' ? -1 : 1, L1 = D.ua * (o.us || 1);
    // natural resting elbow: hanging just outside and below the shoulder
    const Nat = [sh[0] + lat * 0.18 * L1, sh[1] + 0.96 * L1];
    // foreshortening: a hand held close in front of the body means the forearm points at the camera,
    // so it is drawn shorter and the elbow can stay at its natural place (no winged or crossed arms)
    // (kept with the v2 arms: held at 0.8 the elbow could not stay at its resting place for a hand near it, and the solver
    // swung it from one side to the other - the v2 drawing puts the hand in front of a short sleeve instead)
    let L2 = D.fa * (o.fs || 1);
    if (!o.fs) { const need = Math.hypot(o.hand[0] - Nat[0], o.hand[1] - Nat[1]); if (need < L2) L2 = Math.max(D.fa * 0.5, need); }
    let [hx, hy] = o.hand, vx = hx - sh[0], vy = hy - sh[1], d = Math.hypot(vx, vy);
    const maxd = (L1 + L2) * 0.995, mind = Math.abs(L1 - L2) + 2;
    if (d > maxd) { hx = sh[0] + vx / d * maxd; hy = sh[1] + vy / d * maxd; d = maxd; }
    if (d < mind) { hx = sh[0] + vx / d * mind; hy = sh[1] + vy / d * mind; d = mind; }
    const base = Math.atan2(hy - sh[1], hx - sh[0]);
    const off = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d))));
    const e1 = [sh[0] + L1 * Math.cos(base + off), sh[1] + L1 * Math.sin(base + off)];
    const e2 = [sh[0] + L1 * Math.cos(base - off), sh[1] + L1 * Math.sin(base - off)];
    // of the two IK solutions take the elbow nearest its natural resting place (stable, anatomically plausible)
    const dN = e => Math.hypot(e[0] - Nat[0], e[1] - Nat[1]);
    // Near the switch (both about as near) the elbow does not jump to the other solution in one frame: it turns about the
    // shoulder-hand axis, which on screen slides it between the two through the line to the hand (both segments
    // foreshortened at the middle). Away from the switch (a quarter upper arm either side) the choice is as before.
    // elbowM (0 = first solution, 1 = second) with weight elbowMK holds an arm through a move that would switch it.
    // (o.elbowSoft narrows the zone: an arm folded flat - hand close to the shoulder - crosses from one solution to the
    // other where the two meet, and a wide zone would drag its elbow round the far side instead)
    const gW = 0.45 * L1 * (o.elbowSoft ?? 1), gx = Math.max(0, Math.min(1, (dN(e1) - dN(e2) + gW) / (2 * gW)));
    let m = gx * gx * (3 - 2 * gx);
    if (o.elbow === 'in') m = 1 - m;
    if (o.elbowM !== undefined) m += (o.elbowM - m) * (o.elbowMK ?? 1);
    const cO = Math.cos(off), Mx = sh[0] + L1 * cO * Math.cos(base), My = sh[1] + L1 * cO * Math.sin(base), cm = Math.cos(Math.PI * m);
    let E = m <= 0 ? e1 : m >= 1 ? e2 : [Mx + (e1[0] - Mx) * cm, My + (e1[1] - My) * cm];
    if (typeof window !== 'undefined') {
      if (window.__SOFTLOG) { let Eo = dN(e1) <= dN(e2) ? e1 : e2; if (o.elbow === 'in') Eo = Eo === e1 ? e2 : e1; const dv = Math.hypot(E[0] - Eo[0], E[1] - Eo[1]); if (window.__SOFTLOG.arms) window.__SOFTLOG.arms.push([Eo === e1 ? 1 : 2, Math.round(Math.hypot(e1[0] - e2[0], e1[1] - e2[1])), side, E[0] - sh[0], E[1] - sh[1], hx - sh[0], hy - sh[1], Eo[0] - sh[0], Eo[1] - sh[1]]); if (dv > window.__SOFTLOG.thr) { window.__SOFTLOG.n++; window.__SOFTLOG.mx = Math.max(window.__SOFTLOG.mx, dv); } }
      if (o.dbgTag && window.__ARMLOG) window.__ARMLOG.push([o.dbgTag, Math.round(m * 100), Math.round(Math.hypot(o.hand[0] - sh[0], o.hand[1] - sh[1]))]);
    }
    // Hands raised to the face / chest: in a front view the elbow drops forward toward the camera instead of
    // crossing the chest or winging above the shoulder. Blend smoothly toward that foreshortened elbow.
    if (o.elbow !== 'in' && o.elbow !== 'free') {
      const ssf = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
      const cross = (E[0] - sh[0]) * lat, up = sh[1] - E[1];
      const k = Math.max(ssf(-0.02 * L1, -0.3 * L1, cross), ssf(-0.12 * L1, 0.12 * L1, up), o.fwd || 0);
      if (k > 0) {
        let Ef = [sh[0] + lat * 0.14 * L1, sh[1] + 0.7 * L1];
        const dh = Math.hypot(hx - Ef[0], hy - Ef[1]);
        if (dh > L2 * 1.02) { const q = L2 * 1.02 / dh; Ef = [hx + (Ef[0] - hx) * q, hy + (Ef[1] - hy) * q]; }
        E = [E[0] + (Ef[0] - E[0]) * k, E[1] + (Ef[1] - E[1]) * k];
      }
    }
    const W = [hx, hy];
    let dir = [W[0] - E[0], W[1] - E[1]];
    if (o.bend) { const b = Math.max(-90, Math.min(90, o.bend)) * Math.PI / 180; dir = [dir[0] * Math.cos(b) - dir[1] * Math.sin(b), dir[0] * Math.sin(b) + dir[1] * Math.cos(b)]; }
    // explicit hand direction (e.g. dictated by a held object): the wrist bends, but never past ~75 degrees
    if (o.dir) {
      const fa0 = Math.atan2(dir[1], dir[0]); let da = Math.atan2(o.dir[1], o.dir[0]) - fa0;
      while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
      // a forearm pointing at the camera is drawn short; then the hand can face any way on screen
      const flen = Math.hypot(W[0] - E[0], W[1] - E[1]), fsK = Math.max(0, Math.min(1, (0.9 * D.fa - flen) / (0.4 * D.fa)));
      const lim = 1.3 + (Math.PI * 0.97 - 1.3) * fsK;
      if (typeof window !== 'undefined' && window.__DAALL) window.__DAALL.push([side, +da.toFixed(3), +lim.toFixed(3)]);
      if (o.dbgTag && typeof window !== 'undefined' && window.__DALOG) window.__DALOG.push([o.dbgTag, +da.toFixed(3), +lim.toFixed(3), +fsK.toFixed(3), Math.round(E[0] - sh[0]), Math.round(E[1] - sh[1]), Math.round(W[0] - sh[0]), Math.round(W[1] - sh[1])]);
      // o.wristFree: no limit - the hand points exactly as asked. The limit flips a hand to the other side in one frame
      // when the asked direction passes straight back along the forearm (it clamps to whichever side is nearer), so an
      // arm whose hand is asked to point back over a forearm that comes towards the camera is drawn free
      if (!o.wristFree) da = Math.max(-lim, Math.min(lim, da));
      dir = [Math.cos(fa0 + da), Math.sin(fa0 + da)];
    }
    if (typeof window !== 'undefined' && window.__HANDLOG) window.__HANDLOG.push([side, Math.round(Math.atan2(dir[1], dir[0]) * 180 / Math.PI), Math.round(E[0] - sh[0]), Math.round(E[1] - sh[1]), Math.round(W[0] - sh[0]), Math.round(W[1] - sh[1]), o.dbgTag || '', o.sleeve || C.sleeve, o.pose || '']);
    const sl = o.sleeve || C.sleeve, sw = D.sw;
    const ul = Math.hypot(E[0] - sh[0], E[1] - sh[1]), ud = [(E[0] - sh[0]) / ul, (E[1] - sh[1]) / ul];
    let folds = '';
    for (const k of [0.6, 0.8, 0.93]) folds += `<path d="M${f(-sw * 0.3)},${f(ul * k)} q${f(sw * 0.3)},${f(sw * 0.1)} ${f(sw * 0.55)},${f(-sw * 0.04)}" stroke="${shade(sl, -0.5)}" stroke-width="2.2" ${NS} fill="none" opacity="0.5" filter="url(#b1)"/>`;
    // Upper arm grows out of the shoulder: no outline around the top cap, outer silhouette line runs
    // continuously over the shoulder and down the arm, inner line only starts below the armpit.
    let nrm = [-ud[1], ud[0]]; if (nrm[0] * lat < 0) nrm = [ud[1], -ud[0]];
    const P2 = (p) => `${f(p[0])},${f(p[1])}`, w2 = sw * 0.84;
    const add = (p, v, k) => [p[0] + v[0] * k, p[1] + v[1] * k];
    const A1 = add(sh, nrm, sw / 2), A2 = add(sh, nrm, -sw / 2), B1 = add(E, nrm, w2 / 2), B2 = add(E, nrm, -w2 / 2), capTop = add(sh, ud, -sw / 2);
    const crs = (a, b) => a[0] * b[1] - a[1] * b[0];
    const swOut = crs([-ud[0], -ud[1]], nrm) > 0 ? 1 : 0, swEnd = crs(nrm, ud) > 0 ? 1 : 0;
    const uid2 = uid('ua');
    const ugrad = `<linearGradient id="${uid2}" gradientUnits="userSpaceOnUse" x1="${f(A1[0])}" y1="${f(A1[1])}" x2="${f(A2[0])}" y2="${f(A2[1])}"><stop offset="0" stop-color="${shade(sl, -0.34)}"/><stop offset="0.3" stop-color="${shade(sl, -0.04)}"/><stop offset="0.6" stop-color="${shade(sl, 0.04)}"/><stop offset="1" stop-color="${shade(sl, -0.1)}"/></linearGradient>`;
    const uFill = `M${P2(A1)} L${P2(B1)} A${f(w2 / 2)},${f(w2 / 2)} 0 0 ${swEnd} ${P2(B2)} L${P2(A2)} A${f(sw / 2)},${f(sw / 2)} 0 0 ${1 - swEnd} ${P2(A1)}Z`;
    const r = Math.atan2(-(E[0] - sh[0]), E[1] - sh[1]) * 180 / Math.PI;
    const upper = `<defs>${ugrad}</defs><path d="${uFill}" fill="url(#${uid2})"/>` +
      `<g transform="translate(${P2(sh)}) rotate(${f(r)})">${folds}</g>` +
      `<path d="M${P2(add(A1, ud, sw * 0.3))} L${P2(B1)}" stroke="#1a0c04" stroke-width="${f(sw * 0.18)}" opacity="0.22" filter="url(#b4)"/>`;
    const innerShade = `<path d="M${P2(add(A2, ud, sw * 0.2))} Q${P2(add(add(A2, ud, sw * 0.5), nrm, sw * 0.12))} ${P2(add(add(A2, ud, sw * 0.9), nrm, sw * 0.05))}" stroke="${shade(sl, -0.6)}" stroke-width="${f(sw * 0.12)}" fill="none" opacity="0.4" filter="url(#b2)"/>`;
    // the hand grows out of the sleeve: wrist skin -> hand -> cuff shadow -> forearm sleeve over the wrist
    const fl = Math.hypot(W[0] - E[0], W[1] - E[1]), dn = [(W[0] - E[0]) / fl, (W[1] - E[1]) / fl];
    const hd = Math.hypot(dir[0], dir[1]), hn = [dir[0] / hd, dir[1] / hd];
    // (v2: the sleeve ends a little short of the wrist joint, so a bit of wrist shows between the cuff and the hand, and
    // it tapers to a fitted cuff narrower than the hand)
    const V2 = G.RIG_HANDS !== 1, bare = !!o.bare, HLn = D.hand * (V2 ? HAND_K : 1);
    const cutB = V2 && !bare ? Math.min(0.13 * HLn, 0.3 * fl) : sw * 0.14;
    const Wc = [W[0] - dn[0] * cutB, W[1] - dn[1] * cutB];
    const fw1 = sw * (bare ? 0.6 : 0.84), fw2 = sw * (bare ? 0.46 : V2 ? 0.6 : 0.66), fcl = Math.hypot(Wc[0] - E[0], Wc[1] - E[1]);
    const foreL = openLimb(E, Wc, fw1, fw2, bare ? C.skin : sl, false, !bare,
      `<path d="M${f(-sw * 0.25)},${f(sw * 0.35)} q${f(sw * 0.25)},${f(sw * 0.12)} ${f(sw * 0.5)},0" stroke="${shade(bare ? C.skin : sl, -0.5)}" stroke-width="2" ${NS} fill="none" opacity="0.4" filter="url(#b1)"/>`);
    // soft shadow the upper arm casts onto the top of the forearm, deeper the more the elbow bends
    const bendK = Math.abs(ud[0] * dn[1] - ud[1] * dn[0]);
    const elbowShade = `<ellipse cx="${f(E[0] + dn[0] * sw * 0.3)}" cy="${f(E[1] + dn[1] * sw * 0.3)}" rx="${f(sw * 0.36)}" ry="${f(sw * 0.22)}" fill="#1a0c04" opacity="${f(bare ? 0.22 : 0.04 + 0.16 * bendK)}" filter="url(#b4)"/>`;
    // One sleeve, one silhouette: the upper arm and the forearm keep their own fills (each shaded across its own
    // direction) under a single outline that runs down the arm, round the outside of the elbow on an arc and into a
    // crease on the inside, so the elbow never shows as a ball or a ring. Its top (the shoulder end) is covered by the
    // body's yoke, so no ball joint shows there either.
    let upperLines, foreLines, crease = '', foreFill = foreL.fill, foreGid = foreL.gid;
    if (bare) {
      upperLines = `<path d="M${P2(capTop)} A${f(sw / 2)},${f(sw / 2)} 0 0 ${swOut} ${P2(A1)} L${P2(B1)} A${f(w2 / 2)},${f(w2 / 2)} 0 0 ${swEnd} ${P2(B2)} L${P2(add(A2, ud, sw * 0.75))}" fill="none" ${ol()}/>`;
      foreLines = foreL.lines;
    } else {
      const sg = nrm[0] * -ud[1] + nrm[1] * ud[0] >= 0 ? 1 : -1, n2 = [sg * -dn[1], sg * dn[0]], cr = ud[0] * dn[1] - ud[1] * dn[0];
      const we = w2, rE = we / 2, F1a = add(E, n2, rE), F2a = add(E, n2, -rE), F1b = add(Wc, n2, fw2 / 2), F2b = add(Wc, n2, -fw2 / 2);
      // the forearm is shaded exactly like the upper arm (outer side dark, same stops) and starts flat at the elbow: the
      // upper arm's round end fills the outside of the bend, so no disc or ring shows where the two meet
      foreGid = uid('fa');
      const fr = Math.atan2(-dn[0], dn[1]) * 180 / Math.PI;
      const G1 = add(E, n2, sw / 2), G2 = add(E, n2, -sw / 2);
      foreFill = `<defs><linearGradient id="${foreGid}" gradientUnits="userSpaceOnUse" x1="${f(G1[0])}" y1="${f(G1[1])}" x2="${f(G2[0])}" y2="${f(G2[1])}"><stop offset="0" stop-color="${shade(sl, -0.34)}"/><stop offset="0.3" stop-color="${shade(sl, -0.04)}"/><stop offset="0.6" stop-color="${shade(sl, 0.04)}"/><stop offset="1" stop-color="${shade(sl, -0.1)}"/></linearGradient></defs>` +
        `<path d="M${P2(F1a)} L${P2(F1b)} A${f(fw2 / 2)},${f(fw2 / 2)} 0 0 ${sg > 0 ? 0 : 1} ${P2(F2b)} L${P2(F2a)}Z" fill="url(#${foreGid})"/>` +
        `<g transform="translate(${P2(E)}) rotate(${f(fr)})"><path d="M${f(-sw * 0.25)},${f(sw * 0.35)} q${f(sw * 0.25)},${f(sw * 0.12)} ${f(sw * 0.5)},0" stroke="${shade(sl, -0.5)}" stroke-width="2" ${NS} fill="none" opacity="0.4" filter="url(#b1)"/></g>`;
      // where the two edge lines on the inside of the bend cross (the crease)
      const meet = (Pu, Pf) => { if (Math.abs(cr) < 0.03) return [(Pu[0] + Pf[0]) / 2, (Pu[1] + Pf[1]) / 2]; let t = crs([Pf[0] - Pu[0], Pf[1] - Pu[1]], dn) / cr; t = Math.max(-0.85 * ul, Math.min(0, t)); return add(Pu, ud, t); };
      const latIn = sg * cr > 0, latEnd = latIn ? meet(B1, F1a) : B1, medEnd = latIn ? B2 : meet(B2, F2a);
      const sw1 = cr > 0 ? 1 : 0, cuffSw = sg > 0 ? 0 : 1;
      upperLines = `<path d="M${P2(capTop)} A${f(sw / 2)},${f(sw / 2)} 0 0 ${swOut} ${P2(A1)} L${P2(latEnd)}" fill="none" ${ol()}/><path d="M${P2(add(A2, ud, sw * 0.75))} L${P2(medEnd)}" fill="none" ${ol()}/>`;
      // o.noJoin (a mantle over the upper arm): the forearm's outline stops at its own elbow end - the crease that runs
      // on up the inside of the upper arm would otherwise be drawn over the mantle as a stray thin line
      const noJ = !!o.noJoin;
      let d = `M${P2(noJ && latIn ? F1a : latEnd)} ` + (latIn ? '' : `A${f(rE)},${f(rE)} 0 0 ${sw1} ${P2(F1a)} `) + `L${P2(F1b)} A${f(fw2 / 2)},${f(fw2 / 2)} 0 0 ${cuffSw} ${P2(F2b)} `;
      d += latIn ? `L${P2(F2a)} A${f(rE)},${f(rE)} 0 0 ${1 - sw1} ${P2(medEnd)}` : `L${P2(noJ ? F2a : medEnd)}`;
      foreLines = `<path d="${d}" fill="none" ${ol()}/>`;
      // a soft fold in the crease of the elbow
      const X = latIn ? latEnd : medEnd, bend = Math.abs(cr);
      if (bend > 0.12 && !noJ) crease = `<path d="M${P2(X)} L${P2([X[0] + (E[0] - X[0]) * 0.75, X[1] + (E[1] - X[1]) * 0.75])}" stroke="${shade(sl, -0.6)}" stroke-width="${f(sw * 0.07)}" stroke-linecap="round" opacity="${f(Math.min(0.5, bend))}" filter="url(#b1)"/>`;
    }
    // (v2: a fitted cuff band at the end of the sleeve, a shade darker, with a light edge where it turns)
    let cuffF = '', cuffL = '';
    if (V2 && !bare && fcl > sw * 0.3) {
      const cb = Math.min(sw * 0.13, fcl * 0.25), C0 = add(Wc, dn, -cb), cbL = openLimb(C0, Wc, fw2 * 1.05, fw2 * 1.07, shade(sl, -0.1), false, true);
      const pn = [-dn[1], dn[0]];
      cuffF = cbL.fill + `<path d="M${P2(add(add(C0, dn, cb * 0.35), pn, fw2 * 0.5))} L${P2(add(add(C0, dn, cb * 0.35), pn, -fw2 * 0.5))}" stroke="${shade(sl, 0.3)}" stroke-width="${f(sw * 0.03)}" opacity="0.45" filter="url(#b05)"/>`;
      cuffL = cbL.lines;
    }
    const fore = foreFill + elbowShade + crease + cuffF + (bare ? foreLines : '');
    // rolled-up sleeve at the elbow when the forearm is bare
    const rollL = bare ? openLimb([E[0] + dn[0] * sw * 0.02, E[1] + dn[1] * sw * 0.02], [E[0] + dn[0] * sw * 0.3, E[1] + dn[1] * sw * 0.3], sw * 0.74, sw * 0.7, shade(sl, 0.04), true, true,
      `<path d="M${f(-sw * 0.34)},${f(sw * 0.14)} q${f(sw * 0.34)},${f(sw * 0.08)} ${f(sw * 0.68)},0" stroke="${shade(sl, -0.5)}" stroke-width="2" ${NS} fill="none" opacity="0.6"/>`) : null;
    const roll = rollL ? rollL.fill + rollL.lines : '';
    // C.glove: a gloved hand and wrist in that colour (surgical rubber, nitrile) instead of the skin
    const hSkin = o.glove ?? C.glove ?? C.skin;
    const wSkin = hSkin === C.skin ? mix(C.skin, '#c97a62', 0.14) : hSkin;
    const wrist = bare ? '' : V2 ? limb([W[0] - dn[0] * (cutB + sw * 0.3), W[1] - dn[1] * (cutB + sw * 0.3)], [W[0] + hn[0] * HLn * 0.08, W[1] + hn[1] * HLn * 0.08], HLn * 0.3, HLn * 0.285, wSkin)
      : limb([W[0] - dn[0] * sw * 0.4, W[1] - dn[1] * sw * 0.4], [W[0] + hn[0] * D.hand * 0.06, W[1] + hn[1] * D.hand * 0.06], D.hand * 0.36, D.hand * 0.34, wSkin);
    // (not for a detached hand: drawn on its own over a prop, a faded top showed the prop through the wrist - a smear)
    const joinWrist = !!(G.RIG_CRISP && V2 && !bare && !o.detachHand);
    const handSvg = o.pose === 'none' ? '' : (V2 ? handV2 : hand)({ x: W[0], y: W[1], dir, side, facing: o.facing || 'back', thumb: o.thumb || 'auto', pose: o.pose || 'relaxed', size: D.hand, skin: hSkin, hold: o.hold, holdFront: o.holdFront, holdRot: o.holdRot, nails: (o.glove ?? C.glove) ? null : (o.nails ?? C.nails), joinWrist });
    const cuffShadow = V2 && !bare ? (() => { const c = add(Wc, dn, HLn * 0.06), r = Math.atan2(-dn[0], dn[1]) * 180 / Math.PI; return `<ellipse cx="${f(c[0])}" cy="${f(c[1])}" rx="${f(fw2 * 0.5)}" ry="${f(HLn * 0.075)}" transform="rotate(${f(r)},${f(c[0])},${f(c[1])})" fill="#1e0c04" opacity="0.34" filter="url(#b4)"/>`; })()
      : `<ellipse cx="${f(W[0] + hn[0] * sw * 0.18)}" cy="${f(W[1] + hn[1] * sw * 0.18)}" rx="${f(sw * 0.36)}" ry="${f(sw * 0.26)}" fill="#1e0c04" opacity="0.35" filter="url(#b4)"/>`;
    const up = `<g filter="url(#clothN)">${upper}</g>${upperLines}${innerShade}`;
    // (v2: the hand is drawn in front of its sleeve. The sleeve ends a little short of the wrist joint, so an arm in the
    // picture plane looks as before - the cuff over the wrist, the hand beyond it - while a hand bent back toward the
    // lens over a forearm that comes at the camera covers the sleeve's end instead of hiding behind it. A forearm drawn
    // short also shows the open end of its sleeve, a shading that deepens with the foreshortening)
    const fsK = V2 && !bare && o.pose !== 'none' ? Math.max(0, Math.min(1, (0.66 * D.fa - fl) / (0.26 * D.fa))) : 0;
    let opening = '';
    if (fsK > 0) {
      const rx = fw2 * 0.48, ry = fw2 * 0.48 * (0.28 + 0.5 * fsK), r = Math.atan2(dn[1], dn[0]) * 180 / Math.PI + 90, oc = add(Wc, dn, -ry * 0.25);
      opening = `<g opacity="${f(0.9 * fsK)}"><ellipse cx="${f(oc[0])}" cy="${f(oc[1])}" rx="${f(rx)}" ry="${f(ry)}" transform="rotate(${f(r)},${f(oc[0])},${f(oc[1])})" fill="${shade(sl, -0.62)}" ${ol(1.4)}/></g>`;
    }
    let lo = '', hand2 = '';
    if (V2 && !bare) {
      // one sleeve from the shoulder to the cuff (drawn whole under the body's yoke, its forearm again over the head and
      // the body), the wrist under its cuff, the hand in front
      // (o.pose2 / o.facing2 / o.poseK: the hand dissolving into another pose, from V.mixArm)
      let handG = `<g filter="url(#skinS)">${handSvg}</g>`;
      if (o.pose2 && o.poseK > 0 && o.poseK < 1 && o.pose !== 'none' && o.pose2 !== 'none') {
        // (between two flat poses - relaxed and open, same side to the lens - the fingers and thumb move in between; any other
        // change of pose dissolves quickly)
        const hO = { x: W[0], y: W[1], dir, side, thumb: o.thumb || 'auto', size: D.hand, skin: hSkin, hold: o.hold, holdFront: o.holdFront, holdRot: o.holdRot, nails: (o.glove ?? C.glove) ? null : (o.nails ?? C.nails), joinWrist }, flat = q => q === 'relaxed' || q === 'open';
        if (flat(o.pose) && flat(o.pose2) && (o.facing || 'back') === (o.facing2 || 'back')) handG = `<g filter="url(#skinS)">${handV2(Object.assign({}, hO, { pose: o.pose, facing: o.facing || 'back', morphTo: o.pose2, morphK: o.poseK }))}</g>`;
        else { const h2 = handV2(Object.assign({}, hO, { pose: o.pose2, facing: o.facing2 || 'back' })); handG = `<g filter="url(#skinS)" opacity="${f(1 - o.poseK)}">${handSvg}</g><g filter="url(#skinS)" opacity="${f(o.poseK)}">${h2}</g>`; }
      }
      const gS = { sh, E, Wc, ud, dn, ul, fcl, w0: sw, w1: sw * 0.84, w2: fw2 * (1 + 0.2 * fsK), sl, lat, sw, fsK, weave: C.weave };
      const wIn = Math.min(sw * 0.3, fcl * 0.5), wristS = G.RIG_CRISP ? wristBridge(Wc, dn, W, hn, wIn, gS.w2, HLn, wSkin)
        : limb([Wc[0] - dn[0] * wIn, Wc[1] - dn[1] * wIn], [W[0] + hn[0] * HLn * 0.08, W[1] + hn[1] * HLn * 0.08], HLn * 0.3, HLn * 0.285, wSkin);
      const upS = sleeveV2(gS, 'all');
      if (!o.detachHand) lo += `<g filter="url(#skinS)">${wristS}</g>${cuffShadow}`;
      lo += sleeveV2(gS, 'fore');
      if (!o.detachHand) lo += handG;
      else hand2 = `<g filter="url(#skinS)">${wristS}</g>${cuffShadow}` + sleeveV2(gS, 'end') + handG;
      return { svg: upS + lo, up: upS, lo, hand: hand2, W, E, hn, HL: HLn };
    }
    if (V2) {
      const handG = `<g filter="url(#skinS)">${handSvg}</g>`;
      if (!o.detachHand) lo += `<g filter="url(#skinS)">${wrist}</g>${cuffShadow}`;
      lo += `<g filter="url(#clothN)">${fore}${roll}</g>${bare ? '' : foreLines + cuffL}${opening}`;
      if (!o.detachHand) lo += handG;
      // a detached hand (drawn by the shot over what it holds) takes its wrist and the end of the sleeve with it
      if (o.detachHand) {
        hand2 = `<g filter="url(#skinS)">${wrist}</g>${cuffShadow}`;
        if (!bare) {
          const k = Math.min(sw * 0.55, fcl * 0.45), wk = fw2 + (fw1 - fw2) * k / Math.max(1, fcl), Cs = add(Wc, dn, -k), cl = openLimb(Cs, Wc, wk, fw2, sl, false, true);
          hand2 += `<g filter="url(#clothN)">${cl.fill.replace(/fill="url\(#[^)]+\)"/, `fill="url(#${foreGid})"`)}${cuffF}</g>${cl.lines}${cuffL}${opening}`;
        }
        hand2 += handG;
      }
    } else {
      if (!o.detachHand) lo += `<g filter="url(#skinS)">${wrist}${handSvg}</g>${cuffShadow}`;
      lo += `<g filter="url(#clothN)">${fore}${roll}</g>${bare ? '' : foreLines}`;
      // a detached hand (drawn by the shot over what it holds) takes its wrist and the end of the sleeve with it, so the
      // cuff still overlaps the wrist and the hand never sits on top of the sleeve like a glove laid on it
      if (o.detachHand) {
        hand2 = `<g filter="url(#skinS)">${wrist}${handSvg}</g>${cuffShadow}`;
        if (!bare) {
          const k = Math.min(sw * 0.55, fcl * 0.45), wk = fw2 + (fw1 - fw2) * k / Math.max(1, fcl), Cs = add(Wc, dn, -k), cl = openLimb(Cs, Wc, wk, fw2, sl, false, true);
          hand2 += `<g filter="url(#clothN)">${cl.fill.replace(/fill="url\(#[^)]+\)"/, `fill="url(#${foreGid})"`)}</g>${cl.lines}`;
        }
      }
    }
    return { svg: up + lo, up, lo, hand: hand2, W, E, hn, HL: HLn };
  }
  // natural hang: hand beside the thigh, arm almost straight with a soft elbow bend
  function restHand(kind, side, spread = 0) { const D = DIMS[kind], s = side === 'R' ? -1 : 1; return [s * (D.shX - D.sw * 0.72 + spread), D.shY + D.sw * 0.55 + (D.ua + D.fa) * 0.975]; }

  // ---------------- face parts ----------------
  const FACE = {
    kid: { d: 'M-70,-84 C-80,-46 -84,4 -80,36 C-76,76 -46,106 0,110 C46,106 76,76 80,36 C84,4 80,-46 70,-84 C58,-110 -58,-110 -70,-84Z', ex: 32, ey: 8, rx: 18.5, ry: 10.2, ir: 9.6, lw: 3.4, lid0: 0.1, browY: -21, noseY: 46, my: 76, mw: 13, earX: 79, earY: 14, chin: 110, hairTop: -128 },
    man: { d: 'M-68,-96 C-78,-60 -82,-10 -80,22 C-78,52 -72,80 -56,100 C-42,118 -22,128 0,130 C22,128 42,118 56,100 C72,80 78,52 80,22 C82,-10 78,-60 68,-96 C56,-124 -56,-124 -68,-96Z', ex: 33, ey: -2, rx: 17, ry: 7.6, ir: 7.6, lw: 3.6, lid0: 0.3, browY: -24, noseY: 52, my: 88, mw: 17, earX: 80, earY: 4, chin: 130, hairTop: -144 },
    woman: { d: 'M-64,-88 C-74,-50 -76,0 -72,34 C-68,74 -38,112 0,118 C38,112 68,74 72,34 C76,0 74,-50 64,-88 C54,-116 -54,-116 -64,-88Z', ex: 30, ey: 0, rx: 16, ry: 8, ir: 7.8, lw: 3.4, lid0: 0.26, browY: -21, noseY: 48, my: 80, mw: 14, earX: 72, earY: 6, chin: 118, hairTop: -134 }
  };

  // Per-character face proportions (o.fx). The base outline is morphed band by band (forehead / cheeks / jaw / chin)
  // and every landmark moves with it, so faces differ in structure, not just in colouring.
  function faceP(kind, fx) {
    const B = FACE[kind];
    if (!fx) return Object.assign({}, B, { base: B, fx: {}, MX: x => x, MY: y => y, sx: 1, sy: 1, bt: '' });
    const W0 = fx.w ?? 1, CH = W0 * (fx.cheek ?? 1), JW = W0 * (fx.jaw ?? 1), CW = fx.chinW ?? 1, LEN = fx.len ?? 1, CHIN = fx.chin || 0;
    const MY = y => (y + (y > 40 ? (y - 40) / 90 * CHIN : 0)) * LEN;
    const MX = (x, y) => { let s = y < -40 ? W0 : y < 30 ? W0 + (CH - W0) * (y + 40) / 70 : CH + (JW - CH) * Math.min(1, (y - 30) / 70); if (y > 95) s *= 1 + (CW - 1) * Math.min(1, (y - 95) / 35); return x * s; };
    const d = B.d.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g, (m, a, b) => `${f(MX(+a, +b))},${f(MY(+b))}`);
    const es = fx.eyeS ?? 1;
    // transform that carries jaw-hugging art (beards) drawn in base coordinates onto the morphed jaw
    const bt = `matrix(${f(JW * 1000) / 1000},0,0,${f(LEN * (1 + CHIN / 90) * 1000) / 1000},0,${f(-LEN * 40 * CHIN / 90)})`;
    return Object.assign({}, B, { base: B, fx, MX, MY, sx: W0, sy: LEN, bt, d,
      ex: B.ex + (fx.eyeX || 0), ey: MY(B.ey) + (fx.eyeY || 0), rx: B.rx * es * (fx.eyeW ?? 1), ry: B.ry * es * (fx.eyeH ?? 1), ir: B.ir * es * (fx.irisS ?? 1),
      browY: MY(B.browY) + (fx.browY || 0), noseY: MY(B.noseY) + (fx.noseL || 0), my: MY(B.my) + (fx.mouthY || 0), mw: B.mw * (fx.mouthW ?? 1),
      earX: MX(B.earX, B.earY), earY: MY(B.earY), chin: MY(B.chin) });
  }

  // the highest lid value drawn since the last reset (lets a page list the frames a lid change touches)
  let lidMax = 0;
  function eyePair(P, F, X, skin, lightX) {
    const lk = F.look || [0, 0], fx = P.fx || {};
    const lid = Math.max(0, Math.min(1, F.lid ?? X.lid ?? (P.lid0 + (fx.lidAdd || 0))));
    if (lid > lidMax) lidMax = lid;
    const wide = F.wide || X.wide;
    let g = '', socket = '';
    for (const s of [-1, 1]) {
      const g0 = g.length;
      const cx = s * P.ex + (F.turn || 0) * 7, cy = P.ey, rx = P.rx, ry = P.ry * (F.eyeW !== undefined ? 1 + 0.14 * F.eyeW : wide ? 1.14 : 1), id = uid('ey');
      const ix0 = cx - s * rx, ox = cx + s * rx; // inner (toward nose) / outer corner x
      const iy0 = cy + ry * 0.18, oy = cy - ry * 0.08;
      const c1 = [ix0 + (ox - ix0) * 0.22, cy - ry * 1.4], c2 = [ix0 + (ox - ix0) * 0.68, cy - ry * 1.5];
      const c3 = [ox + (ix0 - ox) * 0.25, cy + ry * 0.95], c4 = [ox + (ix0 - ox) * 0.7, cy + ry * 1.05];
      const shape = `M${f(ix0)},${f(iy0)} C${f(c1[0])},${f(c1[1])} ${f(c2[0])},${f(c2[1])} ${f(ox)},${f(oy)} C${f(c3[0])},${f(c3[1])} ${f(c4[0])},${f(c4[1])} ${f(ix0)},${f(iy0)}Z`;
      const yTop = cy - ry * 1.08, yBot = cy + ry * 0.78, yl = yTop + lid * (yBot - yTop);
      const yc = (4 * yl - iy0 - oy) / 2;
      // the lid's skin must start above the eye at any lid value: past lid 0.46, yc - 0.6ry sinks into the eye and a
      // closing (or blinking) eye reopened under its own lash line
      const yLt = lid > 0.46 ? Math.min(yc - ry * 0.6, cy - ry * 1.6) : yc - ry * 0.6;
      const ix = cx + lk[0] * rx * 0.42, iy = cy + lk[1] * ry * 0.3 + ry * 0.08;
      const irisC = F.iris || '#6b5a42';
      socket += `<ellipse cx="${f(cx)}" cy="${f(cy - ry * 1.3)}" rx="${f(rx * 1.45)}" ry="${f(ry * 1.6)}" fill="#3a1c0e" opacity="0.2" filter="url(#b4)"/>`;
      socket += `<path d="M${f(cx - rx * 0.9)},${f(cy + ry * 1.6)} Q${f(cx)},${f(cy + ry * 2.6)} ${f(cx + rx * 0.9)},${f(cy + ry * 1.6)}" stroke="#4a2414" stroke-width="5" fill="none" opacity="${F.bags ? 0.3 : 0.14}" filter="url(#b2)"/>`;
      if (F.redEyes) socket += `<ellipse cx="${f(cx)}" cy="${f(cy + ry * 0.4)}" rx="${f(rx * 1.3)}" ry="${f(ry * 1.6)}" fill="#d0504a" opacity="0.28" filter="url(#b4)"/>`;
      g += `<defs><clipPath id="${id}"><path d="${shape}"/></clipPath><radialGradient id="${id}s" cx="50%" cy="60%" r="60%"><stop offset="0" stop-color="#f1ebe3"/><stop offset="1" stop-color="#c9b9aa"/></radialGradient><radialGradient id="${id}i" cx="50%" cy="58%" r="55%"><stop offset="0" stop-color="${shade(irisC, 0.3)}"/><stop offset="0.65" stop-color="${irisC}"/><stop offset="1" stop-color="${shade(irisC, -0.55)}"/></radialGradient></defs>`;
      g += `<path d="${shape}" fill="url(#${id}s)"/>`;
      g += `<g clip-path="url(#${id})"><circle cx="${f(ix)}" cy="${f(iy)}" r="${f(P.ir)}" fill="url(#${id}i)"/><circle cx="${f(ix)}" cy="${f(iy)}" r="${f(P.ir)}" fill="none" stroke="${shade(irisC, -0.6)}" stroke-width="1.3" ${NS}/><circle cx="${f(ix)}" cy="${f(iy)}" r="${f(P.ir * 0.42)}" fill="#0d0805"/>` +
        `<circle cx="${f(ix - lightX * P.ir * 0.32)}" cy="${f(iy - P.ir * 0.38)}" r="${f(P.ir * 0.17)}" fill="#fff" opacity="0.9"/>` +
        `<path d="M${f(ix0)},${f(yLt)} L${f(ox)},${f(yLt)} L${f(ox)},${f(oy)} Q${f(cx)},${f(yc)} ${f(ix0)},${f(iy0)}Z" fill="${shade(skin, -0.08)}"/>` +
        `<path d="M${f(ix0)},${f(iy0)} Q${f(cx)},${f(yc)} ${f(ox)},${f(oy)}" stroke="#2a1408" stroke-width="5" opacity="0.4" fill="none" filter="url(#b1)" transform="translate(0,${f(ry * 0.35)})"/></g>`;
      g += `<path d="M${f(ix0)},${f(iy0)} C${f(c1[0])},${f(c1[1] - ry * 0.45)} ${f(c2[0])},${f(c2[1] - ry * 0.5)} ${f(ox + s * 2)},${f(oy - 1)}" stroke="${shade(skin, -0.32)}" stroke-width="1.4" ${NS} fill="none" opacity="0.7"/>`;
      g += `<path d="M${f(ix0)},${f(iy0)} Q${f(cx)},${f(yc)} ${f(ox + s * 2.5)},${f(oy - 1.5)}" stroke="#160c06" stroke-width="${P.lw}" stroke-linecap="round" fill="none"/>`;
      g += `<path d="M${f(ox - s * 1)},${f(oy - 1)} l${f(s * 4)},${f(-2.5)}" stroke="#160c06" stroke-width="${f(P.lw * 0.6)}" stroke-linecap="round"/>`;
      if (lid < 0.92) g += `<path d="M${f(ox)},${f(oy)} C${f(c3[0])},${f(c3[1])} ${f(c4[0])},${f(c4[1])} ${f(ix0)},${f(iy0)}" stroke="${shade(skin, -0.42)}" stroke-width="1.2" ${NS} fill="none" opacity="0.8"/>`;
      if (F.tears) g += `<path d="M${f(ox + (ix0 - ox) * 0.3)},${f(cy + ry * 0.95)} C${f(cx - s * 2)},${f(cy + ry * 3)} ${f(cx + s * 3)},${f(cy + ry * 4.5)} ${f(cx + s * 1)},${f(cy + ry * 6.5)}" stroke="#f4f8ff" stroke-width="2.2" fill="none" opacity="0.6" stroke-linecap="round"/>` +
        `<circle cx="${f(cx + s * 1)}" cy="${f(cy + ry * 6.5)}" r="2.6" fill="#ffffff" opacity="0.85"/>` +
        `<path d="M${f(cx - rx * 0.7)},${f(cy + ry * 0.75)} Q${f(cx)},${f(cy + ry * 1.1)} ${f(cx + rx * 0.7)},${f(cy + ry * 0.75)}" stroke="#ffffff" stroke-width="1.3" ${NS} fill="none" opacity="0.6"/>`;
      // hooded upper lid: a fold of skin drooping over the outer half of the eye, with its crease
      if (fx.hooded) {
        const hk = fx.hooded, hy = cy - ry * (1.25 - 0.55 * hk);
        g += `<path d="M${f(ix0 + s * 1)},${f(iy0 - ry * 0.9)} Q${f(cx)},${f(cy - ry * 2.3)} ${f(ox + s * 4)},${f(oy + ry * 0.35 * hk)} Q${f(cx + s * rx * 0.3)},${f(hy)} ${f(ix0 + s * 1)},${f(iy0 - ry * 0.9)}Z" fill="${shade(skin, -0.04)}"/>` +
          `<path d="M${f(ix0 + s * 2)},${f(iy0 - ry * 0.85)} Q${f(cx + s * rx * 0.3)},${f(hy)} ${f(ox + s * 4)},${f(oy + ry * 0.35 * hk)}" stroke="${shade(skin, -0.42)}" stroke-width="1.5" ${NS} fill="none" opacity="0.85"/>`;
      }
      if (fx.crow) for (let k = -1; k <= 1; k++) g += `<path d="M${f(ox + s * 5)},${f(oy + k * 5)} l${f(s * 11)},${f(k * 4 - 1)}" stroke="${shade(skin, -0.38)}" stroke-width="1.1" ${NS} opacity="${f(0.45 * fx.crow)}"/>`;
      if (fx.eyeTilt) g = g.slice(0, g0) + `<g transform="rotate(${f(-s * fx.eyeTilt)} ${f(cx)} ${f(cy)})">${g.slice(g0)}</g>`;
    }
    return { g, socket };
  }

  function browPair(P, F, X, col) {
    const [di, dO] = F.brows || X.brows, fx = P.fx || {};
    let g = '';
    for (const s of [-1, 1]) {
      const cx = s * P.ex + (F.turn || 0) * 7;
      const xi = cx - s * P.rx * 1.05 * (fx.browIn ?? 1), xo = cx + s * P.rx * 1.25 * (fx.browLen ?? 1);
      const yi = P.browY + di, yo = P.browY + dO + 3 + (fx.browOut || 0), xm = (xi + xo) / 2, ym = (yi + yo) / 2 - 5 - (fx.browArch || 0);
      const ti = (P.base === FACE.man ? 7.5 : 5.2) * (fx.browT ?? 1), to = 2;
      g += `<path d="M${f(xi)},${f(yi - ti / 2)} Q${f(xm)},${f(ym - ti * 0.6)} ${f(xo)},${f(yo)} Q${f(xm)},${f(ym + ti * 0.4)} ${f(xi)},${f(yi + ti / 2)}Z" fill="${col}" filter="url(#b05)" opacity="0.92"/>`;
      for (let k = 0; k < 5; k++) { const u = k / 5; g += `<path d="M${f(xi + (xo - xi) * u)},${f(yi + (yo - yi) * u + 2)} l${f(s * 5)},${f(-3)}" stroke="${shade(col, -0.3)}" stroke-width="1" ${NS} opacity="0.6"/>`; }
    }
    if (di < -8) g += `<path d="M-4,${P.browY - 4} Q-1,${P.browY + 4} -3,${P.browY + 10} M4,${P.browY - 4} Q1,${P.browY + 4} 3,${P.browY + 10}" stroke="#7a4a32" stroke-width="1.2" ${NS} fill="none" opacity="0.45"/>`;
    if (di > 3) g += `<path d="M-5,${P.browY + 2} l1,10 M5,${P.browY + 2} l-1,10" stroke="#7a4a32" stroke-width="1.3" ${NS} opacity="0.55"/>`;
    return g;
  }

  // nose styles (o.fx.nose): std | hook | broad | button | long ; o.fx.noseS scales it
  function nose(P, skin, lightX, kind) {
    const fx = P.fx || {}, st = fx.nose || 'std', k = fx.noseS ?? 1;
    const y = P.noseY, sh = -lightX, ln = shade(skin, -0.4);
    const wk = k * ({ broad: 1.45, button: 0.82, long: 0.86, hook: 1.05 }[st] || 1), hk = k * ({ hook: 1.3, button: 0.86, long: 1.1, broad: 0.95 }[st] || 1);
    const tipY = y - 3 + (st === 'hook' ? 4 : st === 'button' ? -2 : 0);
    let g = `<path d="M${f(sh * 6)},${f(P.ey + 6)} Q${f(sh * 12 * wk)},${f(y - 22)} ${f(sh * 11 * wk)},${f(y - 6)}" stroke="${shade(skin, -0.35)}" stroke-width="${f((kind === 'kid' ? 6 : 8) * Math.sqrt(wk))}" fill="none" opacity="0.28" filter="url(#b2)"/>`;
    if (st === 'hook' || st === 'long') {
      // a defined bridge: shadow-side ridge line (with the hump for a hooked nose) and a hard highlight
      const bump = st === 'hook' ? 9 * k : 2;
      g += `<path d="M${f(sh * 4)},${f(P.ey + 8)} C${f(sh * (6 + bump))},${f(P.ey + (y - P.ey) * 0.35)} ${f(sh * (5 + bump * 0.8))},${f(y - 18)} ${f(sh * 8 * wk)},${f(tipY - 2)}" stroke="${shade(skin, -0.45)}" stroke-width="1.4" ${NS} fill="none" opacity="0.7"/>`;
      g += `<path d="M${f(-sh * 3)},${f(P.ey + 12)} C${f(-sh * 1 + sh * bump * 0.4)},${f(P.ey + (y - P.ey) * 0.4)} ${f(-sh * 3)},${f(y - 16)} ${f(-sh * 4)},${f(tipY - 8)}" stroke="#fff" stroke-width="3" opacity="0.16" fill="none" filter="url(#b05)"/>`;
    } else g += `<path d="M${f(-sh * 4)},${f(P.ey + 10)} L${f(-sh * 5)},${f(y - 12)}" stroke="#fff" stroke-width="3" opacity="0.18" filter="url(#b1)"/>`;
    const rx0 = (kind === 'kid' ? 9 : 11) * wk, ry0 = (kind === 'kid' ? 8 : 9.5) * hk;
    g += `<ellipse cx="0" cy="${f(tipY)}" rx="${f(rx0)}" ry="${f(ry0)}" fill="${shade(skin, -0.03)}"/><ellipse cx="${f(-sh * 3)}" cy="${f(tipY - 4)}" rx="4" ry="3" fill="#fff" opacity="0.3"/>`;
    if (st === 'hook') g += `<path d="M${f(-rx0 * 0.7)},${f(tipY + ry0 * 0.55)} Q0,${f(tipY + ry0 * 1.25)} ${f(rx0 * 0.7)},${f(tipY + ry0 * 0.55)}" stroke="${ln}" stroke-width="1.3" ${NS} fill="none" opacity="0.7"/>`;
    const wx = 6 * wk, wo = 15 * wk, wy = st === 'hook' ? -1 : 0;
    g += `<path d="M${f(-wx)},${f(y - 2 + wy)} Q${f(-wo)},${f(y + 1 + wy)} ${f(-wo * 0.6)},${f(y + 7 + wy)} M${f(wx)},${f(y - 2 + wy)} Q${f(wo)},${f(y + 1 + wy)} ${f(wo * 0.6)},${f(y + 7 + wy)}" stroke="${ln}" stroke-width="1.4" ${NS} fill="none" opacity="0.85"/>`;
    const nh = st === 'button' ? 1.35 : 1;
    g += `<path d="M${f(-7.5 * wk)},${f(y + 5 + wy)} q${f(3 * nh)},${f(-2.5 * nh)} ${f(5 * nh)},0.5 M${f(7.5 * wk)},${f(y + 5 + wy)} q${f(-3 * nh)},${f(-2.5 * nh)} ${f(-5 * nh)},0.5" stroke="#3e1a10" stroke-width="${f(2.4 * nh)}" ${NS} fill="none" stroke-linecap="round"/>`;
    g += `<ellipse cx="${f(sh * 3)}" cy="${f(y + 12 + (st === 'hook' ? 3 : 0))}" rx="${f(13 * wk)}" ry="4" fill="#3a1608" opacity="0.2" filter="url(#b2)"/>`;
    return g;
  }

  // mouth presets: open (0..1 jaw), corner drop (cd, + = down), teeth, width, upper-lip raise
  const MOUTH = {
    closed: { open: 0 }, tight: { open: 0, tight: true }, parted: { open: 0.2 }, cry: { open: 0.5, wide: 1.2, cd: 5 },
    smile: { open: 0, cd: -4 }, grin: { open: 0.3, cd: -6, wide: 1.3, teeth: 2 }, snarl: { open: 0.42, cd: 4, wide: 1.15, teeth: 2, raise: 4 },
    smirk: { open: 0, cdL: 2.5, cdR: -6 }, o: { open: 0.55, round: true, wide: 0.55 }, shout: { open: 0.95, cd: 3, wide: 1.15, teeth: 1 },
    scream: { open: 1.2, cd: 6, wide: 1.4, teeth: 1, raise: 3 },
    talk: { open: 0.35, teeth: 1 }, bashful: { open: 0, cd: -5, wide: 0.85 }
  };
  function mouthPart(P, F, X, skin, kind) {
    const M = MOUTH[F.mouth || X.mouth] || MOUTH.closed;
    const y = P.my, w = P.mw * (F.mw ?? F.wide ?? M.wide ?? 1);
    const cdE = F.cd ?? (M.cd !== undefined ? M.cd : X.cd ?? 1);
    const cdL = M.cdL ?? cdE, cdR = M.cdR ?? cdE, raise = M.raise || 0;
    const open = Math.max(0, F.open ?? M.open ?? 0), gap = open * (kind === 'kid' ? 15 : 19);
    const lip = mix(shade(skin, -0.2), '#a8564a', kind === 'man' ? 0.28 : 0.4), dark = '#2a0e08', teethC = '#e9e1d2';
    const yl = y + cdL, yr = y + cdR, lt = (P.fx && P.fx.lipT) ?? 1;
    let g = `<path d="M-4,${f(y - 22)} Q-3,${f(y - 14)} -4,${f(y - 7)} M4,${f(y - 22)} Q3,${f(y - 14)} 4,${f(y - 7)}" stroke="${shade(skin, -0.25)}" stroke-width="1.2" ${NS} fill="none" opacity="0.5"/>`;
    const upper = (dy) => `M${f(-w)},${f(yl + dy)} Q${f(-w * 0.5)},${f(y - 6 * lt - raise + dy)} -3,${f(y - 5 * lt - raise + dy)} Q0,${f(y - 3.5 * lt - raise + dy)} 3,${f(y - 5 * lt - raise + dy)} Q${f(w * 0.5)},${f(y - 6 * lt - raise + dy)} ${f(w)},${f(yr + dy)} Q0,${f(y + 0.5 - raise + dy)} ${f(-w)},${f(yl + dy)}Z`;
    const lower = (dy) => `M${f(-w * 0.82)},${f(yl * 0.6 + y * 0.4 + 1 + dy)} Q0,${f(y + 11 * lt + dy)} ${f(w * 0.82)},${f(yr * 0.6 + y * 0.4 + 1 + dy)} Q0,${f(y + 3 + dy)} ${f(-w * 0.82)},${f(yl * 0.6 + y * 0.4 + 1 + dy)}Z`;
    if (gap < 1.5) {
      g += `<path d="${lower(0)}" fill="${lip}"/><path d="${upper(0)}" fill="${shade(lip, -0.12)}"/>`;
      g += `<path d="M${f(-w)},${f(yl)} Q0,${f(y + (M.tight ? -0.5 : 1) - raise)} ${f(w)},${f(yr)}" stroke="${dark}" stroke-width="${M.tight ? 2.2 : 1.7}" ${NS} fill="none" stroke-linecap="round"/>`;
    } else if (M.round) {
      g += `<ellipse cx="0" cy="${f(y + gap * 0.45)}" rx="${f(w * 1.1)}" ry="${f(gap * 0.62 + 3)}" fill="${dark}" stroke="${lip}" stroke-width="3.5" ${NS}/><ellipse cx="0" cy="${f(y + gap * 0.85)}" rx="${f(w * 0.7)}" ry="${f(gap * 0.2)}" fill="#a84848"/>`;
    } else {
      const bot = y + gap * 1.15;
      const interior = `M${f(-w * 0.92)},${f(yl)} Q0,${f(y - 1 - raise)} ${f(w * 0.92)},${f(yr)} Q${f(w * 0.55)},${f(bot)} 0,${f(bot + 1)} Q${f(-w * 0.55)},${f(bot)} ${f(-w * 0.92)},${f(yl)}Z`;
      const id = uid('mo');
      g += `<defs><clipPath id="${id}"><path d="${interior}"/></clipPath></defs><path d="${interior}" fill="${dark}"/>`;
      let inner = `<ellipse cx="0" cy="${f(bot - 1)}" rx="${f(w * 0.55)}" ry="${f(Math.min(6, gap * 0.3))}" fill="#a04444"/>`;
      if ((M.teeth || 0) >= 1 || open > 0.3) inner += `<rect x="${f(-w)}" y="${f(y - 6 - raise)}" width="${f(w * 2)}" height="${f(5 + raise + Math.min(4, gap * 0.25))}" fill="${teethC}"/><path d="M${f(-w * 0.3)},${f(y - 2)} l0,5 M0,${f(y - 2)} l0,5 M${f(w * 0.3)},${f(y - 2)} l0,5" stroke="#b9ad98" stroke-width="1" ${NS}/>`;
      if ((M.teeth || 0) >= 2) inner += `<rect x="${f(-w)}" y="${f(bot - 5)}" width="${f(w * 2)}" height="7" fill="${shade(teethC, -0.08)}"/>`;
      g += `<g clip-path="url(#${id})">${inner}</g>`;
      g += `<path d="${upper(-1)}" fill="${shade(lip, -0.12)}"/><path d="${lower(gap)}" fill="${lip}"/>`;
    }
    g += `<ellipse cx="-2" cy="${f(y + 6 + gap)}" rx="${f(w * 0.35)}" ry="1.8" fill="#fff" opacity="0.22"/>`;
    g += `<ellipse cx="0" cy="${f(y + 16 + gap)}" rx="${f(P.mw * 0.75)}" ry="3.5" fill="#3a1608" opacity="0.18" filter="url(#b2)"/>`;
    g += `<path d="M${f(-(w + 1))},${f(yl - 2)} q-3,2 -1,5 M${f(w + 1)},${f(yr - 2)} q3,2 1,5" stroke="${shade(skin, -0.35)}" stroke-width="1.2" ${NS} fill="none" opacity="0.6"/>`;
    if (cdL < -2 || cdR < -2) g += `<path d="M${f(-(w + 4))},${f(yl - 8)} q-6,6 -2,14 M${f(w + 4)},${f(yr - 8)} q6,6 2,14" stroke="${shade(skin, -0.3)}" stroke-width="1.4" ${NS} fill="none" opacity="0.45"/>`;
    return g;
  }

  // long hair and a wimple's veil hang down behind the shoulders: person() draws them before the body (head-local units)
  function backHair(o, kind) {
    const P = faceP(kind, o.fx), hairC = o.hair || '#3e2a1e', id = uid('bh');
    let g = '';
    if (o.wimple) {
      const v = o.veil || '#4f5544';
      g += `<defs>${vGrad(id, shade(v, 0.04), shade(v, -0.18))}</defs><path d="M-120,320 C-140,60 -122,-158 0,-160 C122,-158 140,60 120,320Z" fill="url(#${id})" ${ol()}/>` +
        [-104, 104].map(x => `<path d="M${x},-60 Q${f(x * 1.14)},100 ${f(x * 1.08)},300" stroke="${shade(v, -0.35)}" stroke-width="5" fill="none" opacity="0.35" filter="url(#b2)"/>`).join('');
    } else if (o.hairStyle === 'long' && !o.hood && !o.coif)
      g += `<defs>${vGrad(id, shade(hairC, 0.05), shade(hairC, -0.3))}</defs><path d="M-96,-60 C-118,40 -122,160 -112,280 Q-60,300 0,292 Q60,300 112,280 C122,160 118,40 96,-60 C80,-150 -80,-150 -96,-60Z" fill="url(#${id})" ${ol()}/>` + [-70, -40, 40, 70].map(x => `<path d="M${x},40 Q${x * 1.15},160 ${x * 1.2},280" stroke="${shade(hairC, -0.4)}" stroke-width="1.4" ${NS} fill="none" opacity="0.6"/>`).join('');
    return g ? `<g transform="scale(${f(P.sx)},${f(P.sy)})">${g}</g>` : '';
  }

  function head(o, kind, bh) {
    const F = o.face || {}, X = EXPR[F.expr || 'neutral'], P = faceP(kind, o.fx), fx = P.fx, skin = o.skin, id = uid('h');
    const lightX = o.lightX ?? -1, hairC = o.hair || '#3e2a1e';
    let back = '', g = '', feat = '', front = '';
    const grad = `<radialGradient id="${id}f" cx="${50 + lightX * 10}%" cy="44%" r="64%"><stop offset="0" stop-color="${shade(skin, 0.16)}"/><stop offset="0.55" stop-color="${skin}"/><stop offset="0.85" stop-color="${shade(skin, -0.1)}"/><stop offset="1" stop-color="${shade(skin, -0.22)}"/></radialGradient><clipPath id="${id}c"><path d="${P.d}"/></clipPath>`;
    const wrap = o.hood || o.wimple || o.coif;
    const hs = o.hairStyle, coversEars = hs === 'bob' || hs === 'long';
    let backWrap = '';
    if (o.hood) backWrap += `<path d="M-118,150 C-140,10 -122,-158 0,-160 C122,-158 140,10 118,150Z" fill="${shade(o.hood, -0.45)}" ${ol()}/>`;
    if (o.wimple && !bh) backWrap += `<path d="M-118,220 C-134,40 -118,-158 0,-158 C118,-158 134,40 118,220Z" fill="${o.veil || '#4f5544'}" ${ol()}/>`;
    if (o.coif) backWrap += `<path d="M-104,100 C-116,0 -104,-146 0,-146 C104,-146 116,0 104,100Z" fill="${shade(o.coif, -0.15)}" ${ol()}/>`;
    if (hs === 'long' && !wrap && !bh) { const hid0 = id + 'hl'; backWrap += `<defs>${vGrad(hid0, shade(hairC, 0.05), shade(hairC, -0.3))}</defs><path d="M-96,-60 C-118,40 -122,160 -112,250 Q-60,272 0,262 Q60,272 112,250 C122,160 118,40 96,-60 C80,-150 -80,-150 -96,-60Z" fill="url(#${hid0})" ${ol()}/>` + [-70, -40, 40, 70].map(x => `<path d="M${x},40 Q${x * 1.15},150 ${x * 1.2},250" stroke="${shade(hairC, -0.4)}" stroke-width="1.4" ${NS} fill="none" opacity="0.6"/>`).join(''); }
    if (o.kerchief && !wrap) backWrap += `<path d="M-92,-30 C-100,40 -96,120 -84,190 Q0,214 84,190 C96,120 100,40 92,-30Z" fill="${shade(o.kerchief, -0.28)}" ${ol()}/>`;
    if (backWrap) back += `<g transform="scale(${f(P.sx)},${f(P.sy)})">${backWrap}</g>`;
    if (fx.dbl) back += `<path d="M${f(-56 * P.sx)},${f(P.chin - 30)} C${f(-60 * P.sx)},${f(P.chin + 10 + 16 * fx.dbl)} ${f(60 * P.sx)},${f(P.chin + 10 + 16 * fx.dbl)} ${f(56 * P.sx)},${f(P.chin - 30)}Z" fill="${shade(skin, -0.1)}" ${ol()}/><path d="M${f(-30 * P.sx)},${f(P.chin + 2 + 8 * fx.dbl)} Q0,${f(P.chin + 12 + 10 * fx.dbl)} ${f(30 * P.sx)},${f(P.chin + 2 + 8 * fx.dbl)}" stroke="${shade(skin, -0.4)}" stroke-width="1.3" ${NS} fill="none" opacity="0.6"/>`;
    const es = fx.earS ?? 1;
    if (!wrap && !coversEars) for (const s of [-1, 1]) back += `<g transform="translate(${f(s * P.earX)},${f(P.earY)}) scale(${f(es)})"><path d="M0,-24 C${s * 18},-28 ${s * 22},-6 ${s * 14},14 C${s * 10},26 ${s * 2},26 0,22Z" fill="${shade(skin, -0.06)}" ${ol()}/><path d="M${s * 3},-14 C${s * 13},-16 ${s * 14},2 ${s * 8},12" stroke="${shade(skin, -0.35)}" stroke-width="1.6" ${NS} fill="none"/><ellipse cx="${s * 7}" cy="-2" rx="5" ry="9" fill="#c0503a" opacity="0.25" filter="url(#b2)"/></g>`;
    g += `<path d="${P.d}" fill="url(#${id}f)"/>`;
    const E = eyePair(P, F, X, skin, lightX);
    let inside = E.socket;
    // structure: hollow cheeks under the cheekbones, cheekbone light, freckles, a mole
    if (fx.hollow) for (const s of [-1, 1]) inside += `<ellipse cx="${f(s * P.MX(56, 60))}" cy="${f(P.noseY + 22)}" rx="18" ry="36" fill="#3a1608" opacity="${f(0.26 * fx.hollow)}" filter="url(#b8)"/><ellipse cx="${f(s * P.MX(52, 20))}" cy="${f(P.ey + 30)}" rx="22" ry="9" fill="#fff4e8" opacity="${f(0.12 * fx.hollow)}" filter="url(#b4)"/>`;
    if (fx.freckles) { const rf = rng(77); for (let i = 0; i < 26; i++) { const s = i % 2 ? 1 : -1; inside += `<circle cx="${f(s * (14 + rf() * 42))}" cy="${f(P.ey + 16 + rf() * 30)}" r="${f(1.2 + rf() * 1.4)}" fill="#8a4a2a" opacity="${f(0.35 * fx.freckles)}"/>`; } }
    if (fx.mole) feat += `<circle cx="${fx.mole[0]}" cy="${fx.mole[1]}" r="3.4" fill="#4a2414" opacity="0.85"/>`;
    // smallpox (o.pox 0..1): raised pustules with an inflamed rim, scattered over the face (drawn under the eyes and mouth)
    if (o.pox) { const rp = rng(91 + (o.poxSeed || 0)), n = Math.round(60 * o.pox); let px = '';
      for (let i = 0; i < n; i++) { const x = (rp() - 0.5) * 156, y = -100 + rp() * 226, r = 2.2 + rp() * 2.6, crust = rp() < 0.22;
        // keep the eyes and the lips clear so the face still reads
        if (Math.hypot(Math.abs(x) - P.ex, (y - P.ey) * 1.6) < 26 || Math.hypot(x, (y - P.my) * 1.5) < P.mw + 8) continue;
        px += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r + 2.6)}" fill="#c0402e" opacity="0.42"/>` + (crust ? `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r * 0.9)}" fill="#6a3418" stroke="#3a1a0a" stroke-width="0.7"/>` :
          `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="#f2e2b0" stroke="#9a3a28" stroke-width="0.8"/><circle cx="${f(x)}" cy="${f(y + r * 0.2)}" r="${f(r * 0.45)}" fill="#d8b860" opacity="0.7"/><circle cx="${f(x - r * 0.35)}" cy="${f(y - r * 0.35)}" r="${f(r * 0.3)}" fill="#fff" opacity="0.7"/>`); }
      inside += `<rect x="-90" y="-110" width="180" height="250" fill="#c86a50" opacity="${f(0.12 * o.pox)}"/>` + px; }
    inside += `<ellipse cx="0" cy="${P.chin + 6}" rx="90" ry="34" fill="#4a1e0c" opacity="0.28" filter="url(#b8)"/>`;
    for (const s of [-1, 1]) inside += `<ellipse cx="${s * 50}" cy="${P.noseY - 6}" rx="24" ry="10" fill="#4a1e0c" opacity="${kind === 'kid' ? 0.06 : 0.14}" filter="url(#b8)" transform="rotate(${s * -18} ${s * 50} ${P.noseY - 6})"/>` +
      `<ellipse cx="${s * 46}" cy="${P.noseY + 2}" rx="20" ry="10" fill="#d8705e" opacity="${F.blush ?? (kind === 'kid' ? 0.2 : 0.08)}" filter="url(#b4)"/>`;
    // form shading: the side away from the key light falls into soft shadow (terminator), temples and jaw darker
    inside += `<ellipse cx="${-lightX * 78}" cy="10" rx="70" ry="150" fill="#3a1608" opacity="0.3" filter="url(#b14)"/>`;
    inside += `<ellipse cx="${lightX * 30}" cy="-30" rx="40" ry="50" fill="#fff4e8" opacity="0.14" filter="url(#b14)"/>`;
    for (const s of [-1, 1]) inside += `<ellipse cx="${s * 78}" cy="-40" rx="18" ry="40" fill="#3a1608" opacity="0.16" filter="url(#b8)"/>`;
    if (!o.hood && !o.wimple && o.hairStyle !== 'bald' && hs !== 'receding') inside += `<rect x="-100" y="${f((kind === 'kid' ? -56 : -78) * P.sy + (hs === 'bob' ? 18 : 0))}" width="200" height="24" fill="#3a1808" opacity="0.32" filter="url(#b4)"/>`;
    if (wrap) inside += `<path d="${P.d}" fill="none" stroke="#2a1006" stroke-width="26" opacity="0.32" filter="url(#b8)"/>`;
    if (kind === 'man' && !o.beard && o.stubble !== 0) inside += `<g opacity="${f(0.55 * (o.stubble ?? 1))}" transform="${P.bt}"><path d="M-74,40 C-70,90 -40,124 0,126 C40,124 70,90 74,40 C60,70 40,96 0,98 C-40,96 -60,70 -74,40Z" fill="#43403e" opacity="0.18" filter="url(#b4)"/><rect x="-80" y="30" width="160" height="100" filter="url(#stubble)" opacity="0.22" clip-path="url(#${id}j)"/></g>`;
    // healed burn scars around both eyes (o.burn 0..1): mottled pink-red tissue, pale shiny streaks, a darker rim
    if (o.burn) { const k = o.burn, rb = rng(23); for (const s of [-1, 1]) { const cx = s * P.ex, cy = P.ey; inside += `<ellipse cx="${f(cx + s * 4)}" cy="${f(cy + 2)}" rx="${f(P.rx * 2.1)}" ry="${f(P.ry * 3.1)}" fill="#a8483c" opacity="${f(0.32 * k)}" filter="url(#b4)"/><ellipse cx="${f(cx)}" cy="${f(cy + 4)}" rx="${f(P.rx * 1.5)}" ry="${f(P.ry * 2.2)}" fill="#c86a5a" opacity="${f(0.3 * k)}" filter="url(#b2)"/>`;
      for (let i = 0; i < 5; i++) { const a = rb() * Math.PI * 2, rr = P.rx * (1.1 + rb() * 0.8); inside += `<path d="M${f(cx + Math.cos(a) * rr)},${f(cy + Math.sin(a) * rr * 0.9)} q${f((rb() - 0.5) * 14)},${f((rb() - 0.5) * 10)} ${f((rb() - 0.5) * 22)},${f((rb() - 0.5) * 12)}" stroke="#f2c4b4" stroke-width="2" ${NS} fill="none" opacity="${f(0.55 * k)}"/>`; } } }
    if (F.age) inside += `<path d="M-34,-58 Q0,-66 34,-58 M-26,-48 Q0,-54 26,-48" stroke="${shade(skin, -0.3)}" stroke-width="1.2" ${NS} fill="none" opacity="0.45"/>` +
      [-1, 1].map(s => `<path d="M${s * 14},${P.noseY + 2} Q${s * 24},${P.my - 8} ${s * (P.mw + 8)},${P.my + 6}" stroke="${shade(skin, -0.35)}" stroke-width="1.5" ${NS} fill="none" opacity="0.4" filter="url(#b05)"/>`).join('');
    g += `<g clip-path="url(#${id}c)">${inside}</g>`;
    g += `<path d="${P.d}" fill="none" ${ol()}/>`;
    feat += browPair(P, F, X, o.brow || shade(hairC, kind === 'kid' ? 0.1 : -0.05)) + E.g + nose(P, skin, lightX, kind);
    if (o.scar) feat += `<path d="M-60,-34 L-20,34" stroke="#b56a58" stroke-width="5" stroke-linecap="round" opacity="0.8"/><path d="M-60,-34 L-20,34" stroke="#e8b4a0" stroke-width="1.6" stroke-linecap="round" opacity="0.7" transform="translate(-2,0)"/>` +
      [-48, -38, -28].map((x, i) => `<path d="M${x - 5},${-14 + i * 15} l10,-3" stroke="#b56a58" stroke-width="2" opacity="0.6"/>`).join('');
    if (o.paint) for (const s of [-1, 1]) feat += `<path d="M${s * 18},${P.ey + 14} L${s * 50},${P.ey + 30} M${s * 20},${P.ey + 24} L${s * 46},${P.ey + 40}" stroke="${o.paint}" stroke-width="5" stroke-linecap="round" opacity="0.55"/>`;
    if (F.sweat) { const r = rng(31); for (let i = 0; i < 4; i++) { const x = (i % 2 ? 1 : -1) * (40 + r() * 30), y = -60 + r() * 50, sz = 5 + r() * 4; feat += `<g opacity="${f(Math.min(1, F.sweat))}"><path d="M${f(x)},${f(y - sz * 1.6)} Q${f(x + sz)},${f(y)} ${f(x)},${f(y + sz * 0.6)} Q${f(x - sz)},${f(y)} ${f(x)},${f(y - sz * 1.6)}Z" fill="#dff0ff" opacity="0.75" stroke="#7a9ab0" stroke-width="1" ${NS}/><circle cx="${f(x - sz * 0.3)}" cy="${f(y - sz * 0.2)}" r="${f(sz * 0.25)}" fill="#fff"/></g>`; } }
    // beards are drawn in base-face coordinates (BM = base mouth line) inside P.bt, which carries them onto the morphed jaw
    const BM = P.base.my + (fx.mouthY || 0) / (P.sy * (1 + (fx.chin || 0) / 90)), mouthSvg = mouthPart(P, F, X, skin, kind);
    const wrapB = s => s ? `<g transform="${P.bt}">${s}</g>` : '';
    let bPre = '', bPost = '';
    if (o.beard && o.beardStyle === 'goatee') {
      const b = o.beard;
      bPost += `<path d="M-26,${BM + 16} C-24,${BM + 40} -10,${BM + 70} 0,${BM + 92} C10,${BM + 70} 24,${BM + 40} 26,${BM + 16} Q0,${BM + 26} -26,${BM + 16}Z" fill="${b}" ${ol()}/>`;
      bPost += `<path d="M-8,${BM + 30} q4,30 8,58 M6,${BM + 30} q-2,26 -4,52" stroke="${shade(b, 0.3)}" stroke-width="1.2" ${NS} fill="none" opacity="0.5"/>`;
      bPost += `<path d="M0,${BM - 8} C-12,${BM - 14} -30,${BM - 10} -40,${BM - 2} C-46,${BM + 2} -52,${BM - 6} -50,${BM - 16} C-48,${BM - 8} -42,${BM - 8} -38,${BM - 10} C-28,${BM - 18} -10,${BM - 18} 0,${BM - 12} C10,${BM - 18} 28,${BM - 18} 38,${BM - 10} C42,${BM - 8} 48,${BM - 8} 50,${BM - 16} C52,${BM - 6} 46,${BM + 2} 40,${BM - 2} C30,${BM - 10} 12,${BM - 14} 0,${BM - 8}Z" fill="${b}" ${ol(1)}/>`;
    } else if (o.beard && o.beardStyle === 'pointed') {
      // a narrow, sharp chin beard and a pencil moustache with fine upturned tips
      const b = o.beard;
      bPost += `<path d="M-24,${BM + 17} C-26,${BM + 46} -9,${BM + 76} 0,${BM + 108} C9,${BM + 76} 26,${BM + 46} 24,${BM + 17} Q0,${BM + 29} -24,${BM + 17}Z" fill="${b}" ${ol()}/><path d="M-6,${BM + 30} q4,34 6,70 M7,${BM + 32} q-2,30 -5,60" stroke="${shade(b, 0.35)}" stroke-width="1.1" ${NS} fill="none" opacity="0.5"/>`;
      bPost += `<path d="M0,${BM - 9} C-8,${BM - 13} -22,${BM - 12} -30,${BM - 6} C-35,${BM - 3} -39,${BM - 8} -40,${BM - 15} C-37,${BM - 10} -34,${BM - 9} -30,${BM - 10} C-22,${BM - 15} -8,${BM - 15} 0,${BM - 11} C8,${BM - 15} 22,${BM - 15} 30,${BM - 10} C34,${BM - 9} 37,${BM - 10} 40,${BM - 15} C39,${BM - 8} 35,${BM - 3} 30,${BM - 6} C22,${BM - 12} 8,${BM - 13} 0,${BM - 9}Z" fill="${b}" ${ol(0.9)}/>`;
    } else if (o.beard && o.beardStyle === 'braided') {
      const b = o.beard, bid = id + 'b';
      bPre += `<defs>${vGrad(bid, shade(b, -0.08), shade(b, 0.14))}</defs>`;
      bPre += `<path d="M-84,0 C-96,80 -86,180 -46,232 C-26,256 26,256 46,232 C86,180 96,80 84,0 L72,2 C70,40 58,62 38,70 Q20,74 13,70 Q0,64 -13,70 Q-20,74 -38,70 C-58,62 -70,40 -72,2Z" fill="url(#${bid})" ${ol()}/>`;
      for (const s of [-1, 1]) {
        let br = `<path d="M${s * 22},200 C${s * 24},250 ${s * 18},300 ${s * 22},350" stroke="${OUT}" stroke-width="30" stroke-linecap="round" fill="none"/><path d="M${s * 22},200 C${s * 24},250 ${s * 18},300 ${s * 22},350" stroke="${shade(b, 0.05)}" stroke-width="25" stroke-linecap="round" fill="none"/>`;
        for (let k = 0; k < 6; k++) br += `<path d="M${s * 22 - 11},${212 + k * 22} q11,9 22,0" stroke="${shade(b, -0.35)}" stroke-width="2" ${NS} fill="none"/>`;
        br += `<rect x="${s * 22 - 15}" y="300" width="30" height="13" rx="4" fill="#9a8a6a" ${ol(1.2)}/><rect x="${s * 22 - 15}" y="300" width="30" height="4" rx="2" fill="#e0d4b0" opacity="0.6"/>`;
        bPre += br;
      }
      const r = rng(19); for (let i = 0; i < 26; i++) { const x = (r() - 0.5) * 140; bPre += `<path d="M${f(x)},${f(86 + r() * 60)} q${f(x * 0.05)},${f(24)} ${f(x * 0.03)},${f(40 + r() * 30)}" stroke="${shade(b, 0.3)}" stroke-width="1.3" ${NS} fill="none" opacity="0.45"/>`; }
      bPost += `<path d="M-46,${BM + 8} C-30,${BM - 18} -6,${BM - 16} 0,${BM - 9} C6,${BM - 16} 30,${BM - 18} 46,${BM + 8} C40,${BM + 22} 34,${BM + 4} 20,${BM - 2} Q8,${BM - 4} 0,${BM - 2} Q-8,${BM - 4} -20,${BM - 2} C-34,${BM + 4} -40,${BM + 22} -46,${BM + 8}Z" fill="${shade(b, -0.12)}" ${ol(1)}/>`;
    } else if (o.beard && o.beardStyle === 'long') {
      // long pointed scholar's beard
      const b = o.beard, bid = id + 'b';
      bPre += `<defs>${vGrad(bid, shade(b, -0.06), shade(b, 0.16))}</defs>`;
      bPre += `<path d="M-79,24 C-84,90 -60,180 -20,250 Q0,292 20,250 C60,180 84,90 79,24 L70,26 C68,46 58,60 38,68 Q20,72 13,68 Q0,62 -13,68 Q-20,72 -38,68 C-58,60 -68,46 -70,26Z" fill="url(#${bid})" ${ol()}/>`;
      bPre += `<path d="M-79,26 L-76,-30 L-70,-30 L-70,28Z M79,26 L76,-30 L70,-30 L70,28Z" fill="${shade(b, 0.05)}" opacity="0.95"/>`;
      const r = rng(11); for (let i = 0; i < 22; i++) { const x = (r() - 0.5) * 110; bPre += `<path d="M${f(x)},${f(80 + r() * 40)} q${f(-x * 0.2)},${f(40)} ${f(-x * 0.55)},${f(80 + r() * 60)}" stroke="${shade(b, 0.3)}" stroke-width="1.2" ${NS} fill="none" opacity="0.45"/>`; }
      bPost += `<path d="M-36,${BM - 2} C-22,${BM - 15} -5,${BM - 14} 0,${BM - 9} C5,${BM - 14} 22,${BM - 15} 36,${BM - 2} C30,${BM + 14} 20,${BM - 4} 0,${BM - 4} C-20,${BM - 4} -30,${BM + 14} -36,${BM - 2}Z" fill="${shade(b, -0.1)}" ${ol(1)}/>`;
    } else if (o.beard) {
      // full beard ('short' = trimmed close to the jaw)
      const b = o.beard, bid = id + 'b', sb = o.beardStyle === 'short';
      const bot = sb ? 146 : 164, mid = sb ? 128 : 146;
      bPre += `<defs>${vGrad(bid, shade(b, -0.05), shade(b, 0.12))}</defs>`;
      bPre += `<path d="M-79,24 C-82,74 -58,${mid} 0,${bot} C58,${mid} 82,74 79,24 L70,26 C68,46 58,60 38,68 Q20,72 13,68 Q0,62 -13,68 Q-20,72 -38,68 C-58,60 -68,46 -70,26Z" fill="url(#${bid})" ${ol()}/>`;
      if (!o.noSideburns) bPre += `<path d="M-79,26 L-76,-30 L-70,-30 L-70,28Z M79,26 L76,-30 L70,-30 L70,28Z" fill="${shade(b, 0.05)}" opacity="0.95"/>`;
      const r = rng(9); for (let i = 0; i < 16; i++) { const x = (r() - 0.5) * 120; bPre += `<path d="M${f(x)},${f(80 + r() * 30)} q${f(x * 0.04)},${f(16)} ${f(x * 0.03)},${f((sb ? 16 : 26) + r() * 12)}" stroke="${shade(b, 0.28)}" stroke-width="1.2" ${NS} fill="none" opacity="0.45"/>`; }
      bPost += `<path d="M-32,${BM - 2} C-20,${BM - 15} -5,${BM - 14} 0,${BM - 9} C5,${BM - 14} 20,${BM - 15} 32,${BM - 2} C20,${BM - 7} 7,${BM - 5} 0,${BM - 4} C-7,${BM - 5} -20,${BM - 7} -32,${BM - 2}Z" fill="${shade(b, -0.1)}" ${ol(1)}/>`;
    } else if (o.mustache) {
      // moustache only: 'walrus' (heavy, drooping over the lip) or the default trimmed one
      const b = o.mustache;
      if (o.mstyle === 'walrus') bPost += `<path d="M0,${BM - 12} C-14,${BM - 18} -36,${BM - 14} -44,${BM + 4} C-46,${BM + 14} -40,${BM + 18} -36,${BM + 12} C-30,${BM + 4} -14,${BM - 2} 0,${BM - 3} C14,${BM - 2} 30,${BM + 4} 36,${BM + 12} C40,${BM + 18} 46,${BM + 14} 44,${BM + 4} C36,${BM - 14} 14,${BM - 18} 0,${BM - 12}Z" fill="${b}" ${ol(1)}/>` +
        [-30, -18, -6, 6, 18, 30].map(x => `<path d="M${x},${BM - 10} q${x * 0.1},8 ${x * 0.18},14" stroke="${shade(b, 0.3)}" stroke-width="1.1" ${NS} fill="none" opacity="0.5"/>`).join('');
      else bPost += `<path d="M-30,${BM - 2} C-20,${BM - 14} -5,${BM - 13} 0,${BM - 9} C5,${BM - 13} 20,${BM - 14} 30,${BM - 2} C20,${BM - 7} 7,${BM - 5} 0,${BM - 5} C-7,${BM - 5} -20,${BM - 7} -30,${BM - 2}Z" fill="${b}" ${ol(1)}/>`;
    }
    feat += wrapB(bPre) + mouthSvg + wrapB(bPost);
    // hair / headwear
    if (o.hood) {
      const c = o.hood, hid = id + 'hd';
      front += `<defs>${vGrad(hid, shade(c, 0.1), shade(c, -0.25))}</defs>`;
      if (o.hair) front += `<path d="M-74,-74 Q0,-112 74,-74 L70,-58 L52,-62 L44,-50 L34,-60 L22,-48 L10,-58 L-2,-47 L-14,-58 L-26,-49 L-38,-60 L-50,-50 L-70,-58Z" fill="${o.hair}" ${ol()}/>`;
      const hoodD = 'M-120,160 C-144,10 -124,-162 0,-164 C124,-162 144,10 120,160 L86,160 C92,50 90,-96 0,-100 C-90,-96 -92,50 -86,160Z';
      front += `<path d="${hoodD}" fill="url(#${hid})" ${ol()}/>`;
      front += `<path d="M-86,160 C-92,50 -90,-96 0,-100 C90,-96 92,50 86,160" stroke="${shade(c, 0.35)}" stroke-width="2.5" ${NS} fill="none" opacity="0.5"/>`;
      front += `<path d="M-90,150 C-96,50 -94,-90 0,-96 C94,-90 96,50 90,150" stroke="#000" stroke-width="14" fill="none" opacity="0.25" filter="url(#b4)"/>`;
      // the hood's folds, kept on the cloth (two of them used to run straight down across the face in close-ups)
      let folds = '';
      for (const k of [-0.62, 0.35, 0.78]) folds += `<path d="M${f(k * 112)},-145 Q${f(k * 126)},0 ${f(k * 112)},150" stroke="${shade(c, -0.5)}" stroke-width="6" fill="none" opacity="0.35" filter="url(#b4)"/>`;
      front += `<defs><clipPath id="${hid}k"><path d="${hoodD}"/></clipPath></defs><g clip-path="url(#${hid}k)">${folds}</g>`;
    } else if (o.wimple && bh) {
      // the wimple wraps the brow, the cheeks and the throat and lies over the top of the chest in a soft rounded hem;
      // the veil hangs behind the shoulders (backHair). One piece, one outline: no seams, no hooks.
      const w = o.wimple, wid = id + 'wm';
      const hole = `M-70,-10 C-72,74 -40,119 0,120 C40,119 72,74 70,-10 C70,-78 49,-103 0,-105 C-49,-103 -70,-78 -70,-10Z`;
      const outer = `M-97,40 C-101,-66 -87,-138 0,-140 C87,-138 101,-66 97,40 C98,104 110,150 126,180 Q74,232 0,238 Q-74,232 -126,180 C-110,150 -98,104 -97,40Z`;
      front += `<defs>${vGrad(wid, shade(w, 0.06), shade(w, -0.12))}<clipPath id="${wid}c"><path d="${outer}"/></clipPath></defs><path d="${outer} ${hole}" fill-rule="evenodd" fill="url(#${wid})"/>`;
      // folds falling from under the chin, the shade under the jaw, and the inner edge's shadow on the face
      front += `<g clip-path="url(#${wid}c)">` + [[-60, 150, -84, 212], [-26, 136, -34, 226], [26, 136, 34, 226], [60, 150, 84, 212]].map(([x1, y1, x2, y2]) => `<path d="M${x1},${y1} Q${f((x1 + x2) / 2 + (x1 < 0 ? 6 : -6))},${f((y1 + y2) / 2)} ${x2},${y2}" stroke="${shade(w, -0.3)}" stroke-width="4" fill="none" opacity="0.45" filter="url(#b1)"/>`).join('') +
        `<ellipse cx="0" cy="138" rx="74" ry="20" fill="#3a2a20" opacity="0.18" filter="url(#b4)"/></g>`;
      front += `<path d="${outer} ${hole}" fill-rule="evenodd" fill="none" ${ol()}/><path d="${hole}" fill="none" stroke="#000" stroke-opacity="0.16" stroke-width="12" filter="url(#b2)"/>`;
    } else if (o.wimple) {
      front += `<path d="M-96,40 C-100,-64 -86,-136 0,-138 C86,-136 100,-64 96,40 C96,116 62,158 0,160 C-62,158 -96,116 -96,40Z M-68,-8 C-70,72 -38,114 0,114 C38,114 70,72 68,-8 C68,-74 48,-98 0,-100 C-48,-98 -68,-74 -68,-8Z" fill-rule="evenodd" fill="${o.wimple}" ${ol()}/>`;
      front += `<path d="M-68,-8 C-70,72 -38,114 0,114 C38,114 70,72 68,-8 C68,-74 48,-98 0,-100 C-48,-98 -68,-74 -68,-8Z" fill="none" stroke="#000" stroke-opacity="0.18" stroke-width="12" filter="url(#b2)"/>`;
      front += `<path d="M-110,70 C-114,-86 -96,-150 0,-152 C96,-150 114,-86 110,70 L96,70 C96,-66 84,-134 0,-136 C-84,-134 -96,-66 -96,70Z" fill="${o.veil || '#4f5544'}" ${ol()}/>`;
    } else if (o.coif) {
      if (o.hair) front += `<path d="M-66,-76 Q0,-102 66,-76 L68,-52 L40,-56 L30,-46 L20,-56 L8,-47 L-4,-56 L-16,-47 L-28,-56 L-68,-52Z" fill="${o.hair}" ${ol()}/>`;
      const cfD = `M-100,84 C-108,-12 -100,-134 0,-136 C100,-134 108,-12 100,84 L88,100 C92,0 84,-68 62,-80 Q0,-110 -62,-80 C-84,-68 -92,0 -88,100Z`, chin = `M-88,100 Q0,146 88,100 L84,118 Q0,162 -84,118Z`;
      front += `<path d="${cfD}" fill="${o.coif}" ${ol()}/><path d="${chin}" fill="${shade(o.coif, -0.06)}" ${ol()}/>`;
      if (o.mail) { const mid = id + 'ml'; let rings = ''; for (let yy = -140; yy < 170; yy += 9) for (let xx = -112 + ((yy / 9) % 2 ? 4.5 : 0); xx < 112; xx += 9) rings += `<path d="M${xx - 3.5},${yy} a3.5,3.5 0 0 0 7,0" stroke="${shade(o.coif, -0.45)}" stroke-width="1.3" fill="none"/>`; front += `<defs><clipPath id="${mid}"><path d="${cfD} ${chin}"/></clipPath></defs><g clip-path="url(#${mid})" opacity="0.8">${rings}</g>`; }
    } else if (hs === 'slick' || hs === 'short' || hs === 'receding' || hs === 'bob') {
      const hid = id + 'hr', top = P.hairTop, r = rng(o.hairSeed || 3);
      const fy = kind === 'kid' ? -54 : -76, sideY = kind === 'kid' ? -6 : -26, wx = kind === 'kid' ? 82 : 80;
      front += `<defs>${vGrad(hid, shade(hairC, 0.14), shade(hairC, -0.18))}</defs>`;
      const cap = `M${-wx + 2},${sideY} C${-wx - 6},${sideY - 40} ${-wx - 8},${top + 110} ${-wx - 4},${top + 76} C${-wx + 2},${top + 20} -52,${top - 4} 0,${top - 4} C52,${top - 4} ${wx - 2},${top + 20} ${wx + 4},${top + 76} C${wx + 8},${top + 110} ${wx + 6},${sideY - 40} ${wx - 2},${sideY}`;
      if (hs === 'slick') {
        // combed straight back with oil: high temples, a sharp widow's peak, long comb lines and a hard sheen
        const hp = `${cap} L${wx - 10},${sideY} C${wx - 10},${fy - 6} ${wx - 24},${fy - 26} ${wx - 36},${fy - 26} C${wx - 52},${fy - 26} 16,${fy - 20} 0,${fy + 4} C-16,${fy - 20} ${-wx + 52},${fy - 26} ${-wx + 36},${fy - 26} C${-wx + 24},${fy - 26} ${-wx + 10},${fy - 6} ${-wx + 10},${sideY}Z`;
        front += `<path d="${hp}" fill="url(#${hid})" ${ol()}/>`;
        for (let i = 0; i < 11; i++) { const x = -64 + i * 12.8; front += `<path d="M${f(x * 0.55)},${f(fy - 18 + Math.abs(x) * 0.12)} C${f(x * 0.8)},${f(fy - 50)} ${f(x * 1.08)},${f(top + 30)} ${f(x * 1.12)},${f(top + 70)}" stroke="${shade(hairC, i % 2 ? 0.35 : -0.45)}" stroke-width="${i % 2 ? 1.2 : 1.5}" ${NS} fill="none" opacity="${i % 2 ? 0.35 : 0.6}"/>`; }
        front += `<path d="M-46,${top + 24} C-20,${top + 6} 24,${top + 8} 50,${top + 30}" stroke="#fff" stroke-width="6" opacity="0.2" fill="none" filter="url(#b2)"/>`;
      } else if (hs === 'short') {
        // cropped close: low flat volume, a slightly ragged straight hairline, bristle texture
        let line = ''; const N = 14;
        for (let i = 0; i <= N; i++) { const x = wx - 12 - i * ((wx - 12) * 2 / N); line += `L${f(x)},${f(fy - 10 + (r() - 0.5) * 5 + Math.pow(Math.abs(x) / wx, 3) * 10)} `; }
        const capS = `M${-wx + 4},${sideY - 6} C${-wx - 2},${sideY - 40} ${-wx - 2},${top + 104} ${-wx + 2},${top + 74} C${-wx + 8},${top + 26} -50,${top + 8} 0,${top + 8} C50,${top + 8} ${wx - 8},${top + 26} ${wx - 2},${top + 74} C${wx + 2},${top + 104} ${wx + 2},${sideY - 40} ${wx - 4},${sideY - 6}`;
        front += `<path d="${capS} L${wx - 12},${sideY - 6} ${line}L${-wx + 12},${sideY - 6}Z" fill="url(#${hid})" ${ol()}/>`;
        for (let i = 0; i < 70; i++) { const x = (r() - 0.5) * (wx * 1.7), y = top + 16 + r() * (fy - top - 26); front += `<path d="M${f(x)},${f(y)} l${f((r() - 0.5) * 3)},${f(-4 - r() * 4)}" stroke="${shade(hairC, r() > 0.5 ? 0.35 : -0.4)}" stroke-width="1.2" ${NS} opacity="0.5"/>`; }
      } else if (hs === 'receding') {
        // bald crown with hair left at the sides and back; a thin wisp across the top
        for (const s of [-1, 1]) {
          front += `<path d="M${s * (wx + 3)},${sideY + 34} C${s * (wx + 9)},${sideY - 6} ${s * (wx + 9)},${top + 96} ${s * (wx + 3)},${top + 78} C${s * (wx - 2)},${top + 72} ${s * (wx - 9)},${top + 80} ${s * (wx - 9)},${top + 90} C${s * (wx - 7)},${fy + 14} ${s * (wx - 6)},${sideY + 14} ${s * (wx - 4)},${sideY + 34}Z" fill="url(#${hid})" ${ol(1.3)}/>`;
          for (let i = 0; i < 5; i++) front += `<path d="M${s * (wx - 4 + i * 2)},${top + 88 + i * 3} q${s * 3},30 ${s * 2},${60 + i * 8}" stroke="${shade(hairC, 0.3)}" stroke-width="1.1" ${NS} fill="none" opacity="0.4"/>`;
        }
        front += `<path d="M-44,${top + 30} C-20,${top + 12} 20,${top + 14} 40,${top + 30}" stroke="${hairC}" stroke-width="3" opacity="0.45" fill="none"/><ellipse cx="${-lightX * -16}" cy="${top + 36}" rx="34" ry="12" fill="#fff" opacity="0.26" filter="url(#b4)"/>`;
      } else {
        // pageboy bob: rounded mass to the jaw, blunt fringe low on the forehead, ears covered
        const bt = fy + 18, low = 42; let bobFringe = ''; for (let i = 1; i < 14; i++) { const x = wx - 10 - i * ((wx - 10) * 2 / 14); bobFringe += `L${f(x)},${f(bt + (i % 2 ? 4 + r() * 4 : -r() * 2))} `; }
        const hp = `M${-wx - 16},${low} C${-wx - 24},-20 ${-wx - 20},${top + 56} -58,${top + 6} C-30,${top - 10} 30,${top - 10} 58,${top + 6} C${wx + 20},${top + 56} ${wx + 24},-20 ${wx + 16},${low} Q${wx + 4},${low + 14} ${wx - 8},${low + 4} L${wx - 10},${bt} ${bobFringe}L${-wx + 10},${bt} L${-wx + 8},${low + 4} Q${-wx - 4},${low + 14} ${-wx - 16},${low}Z`;
        front += `<path d="${hp}" fill="url(#${hid})" ${ol()}/>`;
        for (let i = 0; i < 12; i++) { const x = -wx + 14 + i * ((wx - 14) * 2 / 11); front += `<path d="M${f(x * 0.8)},${top + 14} Q${f(x * 1.02)},${f((top + bt) / 2)} ${f(x)},${bt - 2}" stroke="${shade(hairC, -0.42)}" stroke-width="1.3" ${NS} fill="none" opacity="0.55"/>`; }
        for (const s of [-1, 1]) for (let i = 0; i < 4; i++) front += `<path d="M${s * (wx + 2 + i * 3)},${top + 70 + i * 6} Q${s * (wx + 12)},0 ${s * (wx + 4 + i * 3)},${low}" stroke="${shade(hairC, -0.4)}" stroke-width="1.2" ${NS} fill="none" opacity="0.5"/>`;
        front += `<path d="M-50,${top + 22} C-20,${top + 6} 20,${top + 6} 50,${top + 22}" stroke="#fff" stroke-width="5" opacity="0.16" fill="none" filter="url(#b2)"/>`;
      }
    } else if (o.hairStyle !== 'bald') {
      const hid = id + 'hr', top = P.hairTop;
      front += `<defs>${vGrad(hid, shade(hairC, 0.12), shade(hairC, -0.15))}</defs>`;
      const fy = kind === 'kid' ? -54 : -76, sideY = kind === 'kid' ? -6 : -26, wx = kind === 'kid' ? 82 : 80;
      const r = rng(o.hairSeed || 3);
      let fringe = '';
      const N = 11;
      for (let i = 0; i <= N; i++) { const x = wx - 8 - i * ((wx - 8) * 2 / N); const yy = fy + (i % 2 ? 5 + r() * 7 : -r() * 3); fringe += `L${f(x)},${f(yy)} `; }
      const hp = `M${-wx + 2},${sideY} C${-wx - 6},${sideY - 40} ${-wx - 8},${top + 110} ${-wx - 4},${top + 76} C${-wx + 2},${top + 20} -52,${top - 4} 0,${top - 4} C52,${top - 4} ${wx - 2},${top + 20} ${wx + 4},${top + 76} C${wx + 8},${top + 110} ${wx + 6},${sideY - 40} ${wx - 2},${sideY} L${wx - 10},${sideY} C${wx - 8},${fy + 30} ${wx - 10},${fy + 8} ${wx - 14},${fy} ${fringe}L${-wx + 14},${fy} C${-wx + 10},${fy + 8} ${-wx + 8},${fy + 30} ${-wx + 10},${sideY}Z`;
      front += `<path d="${hp}" fill="url(#${hid})" ${ol()}/>`;
      for (let i = 0; i < 9; i++) { const x = -70 + i * 17.5 + r() * 6; front += `<path d="M${f(x * 0.7)},${top + 6} Q${f(x * 1.05)},${top + 40} ${f(x)},${fy - 2}" stroke="${shade(hairC, -0.4)}" stroke-width="1.3" ${NS} fill="none" opacity="0.6"/>`; }
      for (let i = 0; i < 5; i++) { const x = -50 + i * 24 + r() * 8; front += `<path d="M${f(x * 0.75)},${top + 10} Q${f(x * 1.02)},${top + 36} ${f(x)},${top + 60}" stroke="${shade(hairC, 0.4)}" stroke-width="1.2" ${NS} fill="none" opacity="0.35"/>`; }
      if (o.hairStyle === 'curls') {
        // golden ringlets around the crown and along the fringe
        const rc = rng((o.hairSeed || 3) + 40), cy0 = (top + sideY) / 2 + 6, ry0 = cy0 - top + 4;
        const curl = (x, y, rr) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(rr)}" fill="${shade(hairC, (rc() - 0.5) * 0.14)}" ${ol(1.2)}/><path d="M${f(x - rr * 0.45)},${f(y + rr * 0.1)} a${f(rr * 0.45)},${f(rr * 0.45)} 0 1 1 ${f(rr * 0.6)},${f(rr * 0.35)}" stroke="${shade(hairC, -0.35)}" stroke-width="1.6" ${NS} fill="none" opacity="0.7"/><circle cx="${f(x - rr * 0.3)}" cy="${f(y - rr * 0.35)}" r="${f(rr * 0.25)}" fill="#fff" opacity="0.25"/>`;
        for (let i = 0; i <= 14; i++) { const a = Math.PI * (1.06 + i / 14 * 0.88); front += curl(Math.cos(a) * (wx + 2), cy0 + Math.sin(a) * ry0, 15 + rc() * 5); }
        for (let i = 0; i < 7; i++) front += curl(-wx + 26 + i * ((wx - 26) * 2 / 6), fy + 2 + rc() * 4, 12 + rc() * 4);
        for (const s of [-1, 1]) for (let i = 0; i < 3; i++) front += curl(s * (wx + 4), sideY - 10 + i * 18, 13 + rc() * 3);
      }
      if (o.hairStyle === 'messy') {
        const rm = rng((o.hairSeed || 3) + 60); let tufts = '';
        for (let i = 0; i < 9; i++) { const a = Math.PI * (1.08 + i / 8 * 0.84), bx = Math.cos(a) * (wx - 6), by = (top + sideY) / 2 + Math.sin(a) * ((sideY - top) / 2 + 2), len = 9 + rm() * 9, aa = a + (rm() - 0.5) * 0.7;
          tufts += `<path d="M${f(bx - 9)},${f(by)} L${f(bx + Math.cos(aa) * len)},${f(by + Math.sin(aa) * len)} L${f(bx + 9)},${f(by)}Z" fill="${shade(hairC, (rm() - 0.5) * 0.2)}" ${ol(1.2)}/>`; }
        front = front.replace(`<path d="${hp}"`, tufts + `<path d="${hp}"`);
      }
    }
    if (o.turban && !wrap) {
      // wrapped turban: a full cloth dome down to the brow, diagonal wraps and a loose tail
      const k = o.turban, top = P.hairTop, fy = kind === 'kid' ? -54 : -76, wx = kind === 'kid' ? 82 : 80, tid = id + 'tu';
      front += `<defs>${vGrad(tid, shade(k, 0.14), shade(k, -0.22))}</defs><path d="M${-wx - 14},${fy + 6} C${-wx - 30},${top + 40} -70,${top - 40} 0,${top - 42} C70,${top - 40} ${wx + 30},${top + 40} ${wx + 14},${fy + 6} Q0,${fy - 12} ${-wx - 14},${fy + 6}Z" fill="url(#${tid})" ${ol()}/>`;
      for (let i = 0; i < 5; i++) { const yy = fy - 8 - i * 26; front += `<path d="M${-wx - 8 + i * 6},${yy + 12} Q0,${yy - 26 + i * 4} ${wx + 8 - i * 6},${yy - 4}" stroke="${shade(k, -0.35)}" stroke-width="4" fill="none" opacity="0.55"/><path d="M${-wx - 6 + i * 6},${yy + 8} Q0,${yy - 30 + i * 4} ${wx + 6 - i * 6},${yy - 8}" stroke="${shade(k, 0.3)}" stroke-width="2" fill="none" opacity="0.45"/>`; }
      front += `<path d="M${wx - 6},${fy - 30} q30,10 26,60 q-4,30 -18,40 q4,-40 -8,-70Z" fill="${shade(k, -0.08)}" ${ol(1.2)}/>`;
    }
    if (o.kerchief && !wrap) {
      // headscarf over the crown, hair showing at the brow and sides, tails hanging behind
      const k = o.kerchief, top = P.hairTop, fy = kind === 'kid' ? -54 : -76, sideY = kind === 'kid' ? -6 : -26, wx = kind === 'kid' ? 82 : 80, kid2 = id + 'kc';
      front += `<defs>${vGrad(kid2, shade(k, 0.12), shade(k, -0.2))}</defs><path d="M${-wx - 10},${sideY + 22} C${-wx - 16},${top + 60} -62,${top - 16} 0,${top - 16} C62,${top - 16} ${wx + 16},${top + 60} ${wx + 10},${sideY + 22} L${wx + 1},${sideY + 16} C${wx - 1},${fy + 6} ${wx - 14},${fy - 18} ${wx - 30},${fy - 22} Q0,${fy - 34} ${-wx + 30},${fy - 22} C${-wx + 14},${fy - 18} ${-wx + 1},${fy + 6} ${-wx - 1},${sideY + 16}Z" fill="url(#${kid2})" ${ol()}/>` +
        `<path d="M${-wx + 26},${fy - 20} Q0,${fy - 31} ${wx - 26},${fy - 20}" stroke="${shade(k, 0.3)}" stroke-width="3" fill="none" opacity="0.5"/>` +
        [-0.55, -0.15, 0.25, 0.6].map(q => `<path d="M${f(q * 70)},${top - 6} Q${f(q * 90)},${f((top + fy) / 2)} ${f(q * 80)},${fy - 26}" stroke="${shade(k, -0.4)}" stroke-width="5" fill="none" opacity="0.35" filter="url(#b2)"/>`).join('');
    }
    if (o.cap) {
      // scholar's skullcap
      const yb = P.hairTop + 60;
      front += `<path d="M-84,${yb} C-88,${P.hairTop - 14} 88,${P.hairTop - 14} 84,${yb} Q0,${yb - 18} -84,${yb}Z" fill="${o.cap}" ${ol()}/><path d="M-60,${yb - 30} C-40,${P.hairTop + 2} 20,${P.hairTop - 4} 50,${yb - 40}" stroke="#fff" stroke-width="4" opacity="0.12" fill="none" filter="url(#b2)"/>`;
    }
    if (o.circlet) {
      const g = o.circlet, y0 = P.hairTop + (kind === 'kid' ? 58 : 66), id2 = id + 'ci';
      front += `<defs><linearGradient id="${id2}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${shade(g, -0.35)}"/><stop offset="0.35" stop-color="${shade(g, 0.45)}"/><stop offset="1" stop-color="${shade(g, -0.4)}"/></linearGradient></defs>`;
      for (const x of [-48, -24, 0, 24, 48]) front += `<path d="M${x - 8},${y0} L${x},${y0 - (x === 0 ? 26 : 16)} L${x + 8},${y0}Z" fill="url(#${id2})" ${ol(1.1)}/>`;
      front += `<path d="M-80,${y0 + 2} Q0,${y0 - 8} 80,${y0 + 2} L80,${y0 + 14} Q0,${y0 + 4} -80,${y0 + 14}Z" fill="url(#${id2})" ${ol(1.2)}/><ellipse cx="0" cy="${y0 + 3}" rx="7" ry="8" fill="#b0202a" ${ol(1)}/><circle cx="-2" cy="${y0}" r="2.2" fill="#fff" opacity="0.8"/>`;
    }
    if (o.hairStyle === 'bald' && !wrap) {
      // bald scalp: soft sheen + stubble shadow at the sides
      front += `<path d="M-74,-60 C-66,-112 66,-112 74,-60" stroke="#000" stroke-width="10" opacity="0.08" fill="none" filter="url(#b4)"/><ellipse cx="${-lightX * -20}" cy="-96" rx="34" ry="14" fill="#fff" opacity="0.28" filter="url(#b4)"/>`;
    }
    if (o.helmet && o.helmetStyle === 'nasal') {
      // conical iron helmet with a riveted brow band and a nose guard (Varangian / Norman)
      const m = o.helmet, hid = id + 'hm', P2 = P.hairTop;
      front += `<defs><linearGradient id="${hid}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${shade(m, -0.4)}"/><stop offset="0.38" stop-color="${shade(m, 0.4)}"/><stop offset="0.62" stop-color="${m}"/><stop offset="1" stop-color="${shade(m, -0.5)}"/></linearGradient></defs>`;
      front += `<path d="M-88,-58 C-90,-130 -52,${P2 - 40} 0,${P2 - 66} C52,${P2 - 40} 90,-130 88,-58Z" fill="url(#${hid})" ${ol()}/>`;
      front += `<path d="M0,${P2 - 62} L0,-62" stroke="${shade(m, -0.45)}" stroke-width="6"/><path d="M-4,${P2 - 56} L-4,-66" stroke="#fff" stroke-width="2" opacity="0.4"/>`;
      front += `<path d="M-92,-70 Q0,-84 92,-70 L92,-48 Q0,-62 -92,-48Z" fill="${shade(m, -0.15)}" ${ol(1.4)}/>` + [-70, -40, -12, 16, 44, 72].map(x => `<circle cx="${x}" cy="${-62 + Math.abs(x) * 0.04}" r="3.2" fill="${shade(m, 0.45)}"/>`).join('');
      front += `<path d="M-9,-52 L9,-52 L7,${f(P.noseY - 4)} Q0,${f(P.noseY + 4)} -7,${f(P.noseY - 4)}Z" fill="url(#${hid})" ${ol(1.3)}/>`;
    } else if (o.helmet) {
      const m = o.helmet, hid = id + 'hm';
      front += `<defs><linearGradient id="${hid}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${shade(m, -0.35)}"/><stop offset="0.35" stop-color="${shade(m, 0.35)}"/><stop offset="0.6" stop-color="${m}"/><stop offset="1" stop-color="${shade(m, -0.45)}"/></linearGradient></defs>`;
      front += `<path d="M-84,-74 C-86,-150 -46,-178 0,-178 C46,-178 86,-150 84,-74Z" fill="url(#${hid})" ${ol()}/>`;
      front += `<ellipse cx="0" cy="-74" rx="128" ry="22" fill="url(#${hid})" ${ol()}/><ellipse cx="0" cy="-78" rx="118" ry="13" fill="#000" opacity="0.25"/>`;
      front += `<path d="M0,-178 L0,-80" stroke="${shade(m, -0.4)}" stroke-width="7"/><path d="M-3,-176 L-3,-82" stroke="#fff" stroke-width="2" opacity="0.4"/>`;
      for (const x of [-60, -30, 30, 60]) front += `<circle cx="${x}" cy="${x * x / 400 - 98}" r="3.5" fill="${shade(m, 0.4)}"/>`;
    }
    if (o.bandage) {
      // linen band wrapped over the eyes (head units). slip = how far it has slid down (0 = over the eyes), drop = how much
      // further its screen-left end has fallen (it hangs crooked as it loosens), stain 0..1 = old blood where the eyes were
      // (headwear art is drawn in base units and scaled by P.sx / P.sy, so the morphed eye line is divided back)
      const b = o.bandage, sl = b.slip || 0, dr = b.drop || 0, col = b.col || '#ddd3bc', w = P.MX(84, P.base.ey) / P.sx + 8, y0 = P.ey / P.sy - 24 + sl, h = 46, bid = id + 'bd';
      const L0 = y0 + dr, L1 = L0 + h, R0 = y0, R1 = y0 + h;
      const band = `M${f(-w)},${f(L0 + 4)} Q0,${f((L0 + R0) / 2 - 10)} ${f(w)},${f(R0 + 4)} L${f(w)},${f(R1 - 2)} Q0,${f((L1 + R1) / 2 + 8)} ${f(-w)},${f(L1 - 2)}Z`;
      front += `<defs>${vGrad(bid, shade(col, 0.1), shade(col, -0.22))}</defs><path d="${band}" fill="url(#${bid})" ${ol(1.3)}/>`;
      for (let i = 1; i < 4; i++) { const k = i / 4; front += `<path d="M${f(-w + 4)},${f(L0 + h * k + 2)} Q0,${f((L0 + R0) / 2 + h * k - 6)} ${f(w - 4)},${f(R0 + h * k + 2)}" stroke="${shade(col, -0.3)}" stroke-width="1.3" ${NS} fill="none" opacity="0.55"/>`; }
      for (const s of [-1, 1]) { const ex = s * P.ex / P.sx, ey = s < 0 ? L0 + h / 2 + 2 : R0 + h / 2 + 2; if (b.stain) front += `<ellipse cx="${f(ex)}" cy="${f(ey)}" rx="20" ry="13" fill="#7a2a1a" opacity="${f(0.42 * b.stain)}" filter="url(#b2)"/><ellipse cx="${f(ex + 2)}" cy="${f(ey + 1)}" rx="10" ry="6" fill="#5a1a10" opacity="${f(0.35 * b.stain)}" filter="url(#b1)"/>`; }
      front += `<path d="M${f(-w + 6)},${f(L0 + 8)} Q0,${f((L0 + R0) / 2 - 2)} ${f(w - 6)},${f(R0 + 8)}" stroke="#fff" stroke-width="3" opacity="0.22" fill="none"/>`;
    }
    if (o.crown) {
      // o.crownLift raises it off the head (head units) and o.crownRot tilts it, for crowning / falling
      // o.pendilia: Byzantine strings of pearls hanging from the crown's rim beside the cheeks (sway = degrees of swing)
      let pend = '';
      if (o.pendilia) { const sw = (o.pendSway || 0) * Math.PI / 180; for (const s of [-1, 1]) for (const dx of [0, 12]) { const x0 = s * (70 + dx), L = 118 - dx * 1.6, x1 = x0 + Math.sin(sw) * L, y1 = Math.cos(sw) * L; pend += `<path d="M${x0},-2 L${f(x1)},${f(y1)}" stroke="#3a2a10" stroke-width="1.6"/>`; for (let i = 1; i <= 6; i++) { const k = i / 6; pend += `<circle cx="${f(x0 + (x1 - x0) * k)}" cy="${f(-2 + (y1 + 2) * k)}" r="${i === 6 ? 7 : 5}" fill="${i === 6 ? '#a8202a' : '#f2ecdc'}" stroke="#3a2a10" stroke-width="1"/>`; } } }
      front += `<g transform="translate(0,${f(P.hairTop + 32 - (o.crownLift || 0))}) rotate(${f(o.crownRot || 0)})">${pend}${crownArt(o.crown === true ? '#d6a838' : o.crown)}</g>`;
    }
    const jaw = `<clipPath id="${id}j"><path d="M-80,30 L80,30 L80,140 L-80,140Z"/></clipPath>`;
    const st = P.sx !== 1 || P.sy !== 1 ? ` transform="scale(${f(P.sx)},${f(P.sy)})"` : '';
    return `<defs>${grad}${jaw}</defs>${back}<g filter="url(#skin)">${g}</g>${feat}<g filter="url(#clothS)"${st}>${front}</g>`;
  }
  // the royal crown, base centre at (0,0), 160 wide; shared by worn and hand-held crowns so a hand-off is seamless
  function crownArt(gold) {
    const cid = uid('cr'), yb = 0, yt = -32;
    let g = `<defs><linearGradient id="${cid}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${shade(gold, -0.35)}"/><stop offset="0.3" stop-color="${shade(gold, 0.45)}"/><stop offset="0.55" stop-color="${gold}"/><stop offset="1" stop-color="${shade(gold, -0.45)}"/></linearGradient></defs>`;
    for (const [x, hgt] of [[-62, 38], [-31, 46], [0, 60], [31, 46], [62, 38]]) g += `<path d="M${x - 15},${yt + 4} L${x},${yt - hgt} L${x + 15},${yt + 4}Z" fill="url(#${cid})" ${ol(1.4)}/><circle cx="${x}" cy="${yt - hgt - 4}" r="6" fill="${shade(gold, 0.2)}" ${ol(1)}/>`;
    g += `<path d="M-80,${yt} Q0,${yt - 10} 80,${yt} L80,${yb} Q0,${yb - 10} -80,${yb}Z" fill="url(#${cid})" ${ol()}/>`;
    for (const [x, c] of [[-50, '#a8202a'], [-17, '#1f4fa0'], [17, '#2a7a3a'], [50, '#a8202a']]) g += `<ellipse cx="${x}" cy="${f((yt + yb) / 2 - 4)}" rx="8" ry="10" fill="${c}" ${ol(1)}/><circle cx="${x - 2}" cy="${f((yt + yb) / 2 - 8)}" r="2.6" fill="#fff" opacity="0.8"/>`;
    g += `<path d="M-78,${yt + 6} Q0,${yt - 4} 78,${yt + 6}" stroke="#fff6d0" stroke-width="2.5" fill="none" opacity="0.7"/>`;
    return g;
  }

  // ---------------- body ----------------
  function torsoPath(D) {
    const nw = D.shX * 0.3, sy = D.shY, my = (sy + D.wY) / 2, bl = D.belly || 0;
    const bx = D.wX * (1.04 + bl * 0.3), by = my + bl * 80;
    return `M${f(-nw)},${sy - 26} C${f(-nw * 1.8)},${sy - 14} ${f(-D.shX * 0.85)},${sy - 6} ${-D.shX},${sy + 30} C${f(-D.shX * 1.04)},${sy + 70} ${f(-D.shX * 0.98 - bl * 30)},${sy + 120} ${f(-bx)},${f(by)} C${f(-bx)},${f(by + bl * 90)} ${f(-D.wX * (1 + bl * 0.05))},${f(D.wY - bl * 30)} ${-D.wX},${D.wY} L${-D.hemX},${D.hemY} C${f(-D.hemX * 0.4)},${D.hemY + 14} ${f(D.hemX * 0.4)},${D.hemY + 14} ${D.hemX},${D.hemY} L${D.wX},${D.wY} C${f(D.wX * (1 + bl * 0.05))},${f(D.wY - bl * 30)} ${f(bx)},${f(by + bl * 90)} ${f(bx)},${f(by)} C${f(D.shX * 0.98 + bl * 30)},${sy + 120} ${f(D.shX * 1.04)},${sy + 70} ${D.shX},${sy + 30} C${f(D.shX * 0.85)},${sy - 6} ${f(nw * 1.8)},${sy - 14} ${f(nw)},${sy - 26}Z`;
  }

  function person(o) {
    const kind = o.kind || 'kid';
    let D = Object.assign({}, DIMS[kind], o.dims || {});
    if (o.build === 'fat') D = Object.assign(D, { shX: D.shX * 1.18, wX: D.wX * 1.42, hemX: D.hemX * 1.32, belly: 1, sw: D.sw * 1.22, hand: D.hand * 1.08, legX: D.legX * 1.25, legW: D.legW * 1.25 });
    if (o.robe) D = Object.assign(D, { hemY: -10, hemX: D.hemX * 1.22 });
    const C = { skin: o.skin || '#eec1a2', sleeve: o.sleeve || o.tunic || '#76664e', tunic: o.tunic || '#76664e', nails: o.nails, glove: o.glove, weave: o.weave };
    const tun = C.tunic, id = uid('p'), u = D.shX / 128; // unit scale for line widths
    let out = '';
    // o.legsW: a woman in a knee-length skirt (raise dims.hemY, give legX/legW) gets legs like everyone else
    if ((kind !== 'woman' || o.legsW) && !o.robe && !o.noLegs) {
      const legC = o.legs || C.skin, bare = !o.legs;
      for (const s of [-1, 1]) {
        if (o.hideLeg === s) continue;
        // o.steps { R: [dx, dy, k], L: [...] }: a front-view walk moves each foot (dy < 0 lifts it, so the leg reads as
        // bent toward the camera) and k sizes it (a foot nearer the lens is a touch bigger); the leg runs on to it
        const st = o.steps && o.steps[s < 0 ? 'R' : 'L'], fdx = st ? st[0] : 0, fdy = st ? st[1] : 0, fk = st ? (st[2] ?? 1) : 1;
        const x = s * D.legX, lid = id + 'l' + s, lh = -D.hemY + 40 - D.foot * 0.22;
        let leg = `<defs><clipPath id="${lid}c"><rect x="${f(x - D.legW / 2)}" y="${D.hemY - 40}" width="${D.legW}" height="${f(lh)}" rx="${f(D.legW * 0.3)}"/></clipPath></defs>`;
        leg += limb([x + s * 2, D.hemY - 40], [x + fdx, -D.foot * 0.3 * fk + fdy], D.legW, D.legW * 0.74 * (0.85 + 0.15 * fk), legC);
        if (o.stripes) { let st = ''; for (let y = D.hemY + 10; y < -D.foot * 0.2; y += D.legW * 0.7) st += `<rect x="${f(x - D.legW)}" y="${f(y)}" width="${D.legW * 2}" height="${f(D.legW * 0.3)}" fill="${o.stripes}" opacity="0.85"/>`; leg += `<g clip-path="url(#${lid}c)">${st}</g>`; }
        const fc = o.feet || (bare ? C.skin : '#2e1e14'), fid = lid + 'f', fl = D.foot, fh = D.foot * 0.36;
        if (st) leg += `<g transform="translate(${f(x + fdx)},${f(fdy)}) scale(${f(fk)}) translate(${f(-x)},0)">`;
        leg += `<defs>${vGrad(fid, shade(fc, 0.1), shade(fc, -0.25))}</defs><path d="M${f(x - fl * 0.34)},${f(-fh)} C${f(x - fl * 0.4)},2 ${f(x + fl * 0.4)},2 ${f(x + fl * 0.34)},${f(-fh)} C${f(x + fl * 0.24)},${f(-fh * 1.5)} ${f(x - fl * 0.24)},${f(-fh * 1.5)} ${f(x - fl * 0.34)},${f(-fh)}Z" fill="url(#${fid})" ${ol()}/>`;
        if (bare && kind !== 'kid') {
          // toes seen from the front: big toe on the inner side, a little nail on each
          // toes are only indicated inside the foot outline: soft gaps between them and pale nails (no bumps outside the silhouette)
          const toes = [[0.19, 0.075], [0.06, 0.055], [-0.05, 0.05], [-0.15, 0.045], [-0.24, 0.04]];
          toes.forEach(([k, r], i) => { const tx = x - s * k * fl; leg += `<ellipse cx="${f(tx)}" cy="${f(-fl * 0.07)}" rx="${f(r * fl * 0.5)}" ry="${f(r * fl * 0.42)}" fill="${shade(fc, 0.3)}" opacity="0.45"/>`; if (i < 4) { const gx = x - s * (k - (k - toes[i + 1][0]) * 0.5) * fl; leg += `<path d="M${f(gx)},${f(-fl * 0.02)} L${f(gx)},${f(-fl * 0.13)}" stroke="${shade(fc, -0.5)}" stroke-width="2" stroke-linecap="round" opacity="0.5"/>`; } });
          leg += `<path d="M${f(x - fl * 0.3)},${f(-fh * 1.05)} Q${f(x)},${f(-fh * 1.35)} ${f(x + fl * 0.3)},${f(-fh * 1.05)}" stroke="${shade(fc, -0.45)}" stroke-width="3" fill="none" opacity="0.35" filter="url(#b2)"/>`;
          leg += `<ellipse cx="${f(x - s * D.legW * 0.42)}" cy="${f(-fh * 1.75)}" rx="${f(D.legW * 0.12)}" ry="${f(D.legW * 0.16)}" fill="${shade(fc, 0.18)}" opacity="0.4"/><ellipse cx="${f(x + s * D.legW * 0.4)}" cy="${f(-fh * 1.6)}" rx="${f(D.legW * 0.1)}" ry="${f(D.legW * 0.14)}" fill="${shade(fc, 0.12)}" opacity="0.35"/>`;
        }
        if (st) leg += '</g>';
        if (o.legFx && o.legFx.s === s) leg += legFx(x, s, D, C.skin, o.legFx, lid + 'c');
        out += `<g filter="url(#clothS)">${leg}</g>`;
      }
    }
    // the shoulder joint sits so the sleeve's outer edge runs on from the widest point of the shoulder
    const shJ = D.shX * 1.02 - D.sw * 0.5, shR = [-shJ, D.shY + D.sw * 0.55], shL = [shJ, D.shY + D.sw * 0.55];
    const rest = sd => [sd * (D.shX - D.sw * 0.35 + (D.belly ? D.sw * 0.45 : 0)), D.shY + D.sw * 0.55 + (D.ua + D.fa) * 0.975];
    const aR = Object.assign({ hand: rest(-1), pose: 'relaxed', facing: 'back', noJoin: !!o.mantle }, o.armR || {});
    const aL = Object.assign({ hand: rest(1), pose: 'relaxed', facing: 'back', noJoin: !!o.mantle }, o.armL || {});
    const armR = arm('R', shR, aR, D, C), armL = arm('L', shL, aL, D, C);
    // (QA: window.__ARMW collects each hand's screen point, its elbow's and its drawn length - inert unless set)
    if (typeof window !== 'undefined' && window.__ARMW) for (const A of [armR, armL]) { const w = toWorld(o, A.W), e = toWorld(o, A.E); window.__ARMW.push([Math.round(w[0]), Math.round(w[1]), Math.round(e[0]), Math.round(e[1]), Math.round(D.hand * 1.3 * (o.s || 1))]); }
    if (aR.behind) out += armR.svg; if (aL.behind) out += armL.svg;
    // (v2 arms: a hand or a forearm over the body casts a soft shadow on it, cut to the body's shape - laid on the cloth,
    // not floating over it like a cut-out laid on top)
    const contactSh = A => {
      if (!A || !A.HL || G.RIG_HANDS === 1) return '';
      const { W, E, hn, HL } = A, ox = HL * 0.06, oy = HL * 0.1, c = [W[0] + hn[0] * HL * 0.42 + ox, W[1] + hn[1] * HL * 0.42 + oy], r = Math.atan2(-hn[0], hn[1]) * 180 / Math.PI;
      const bx = Math.min(E[0], W[0]) - HL, by = Math.min(E[1], W[1]) - HL, bw = Math.abs(E[0] - W[0]) + 2 * HL, bh = Math.abs(E[1] - W[1]) + 2 * HL;
      return `<g clip-path="url(#${tg}c)" opacity="0.3"><g filter="url(#b8)"><rect x="${f(bx)}" y="${f(by)}" width="${f(bw)}" height="${f(bh)}" fill="none"/><path d="M${f(E[0] + ox)},${f(E[1] + oy)} L${f(W[0] + ox)},${f(W[1] + oy)}" stroke="#1a0c06" stroke-width="${f(D.sw * 0.55)}" stroke-linecap="round"/><ellipse cx="${f(c[0])}" cy="${f(c[1])}" rx="${f(HL * 0.24)}" ry="${f(HL * 0.44)}" transform="rotate(${f(r)},${f(c[0])},${f(c[1])})" fill="#1a0c06"/></g></g>`;
    };
    const hsc = o.headScale ?? (kind === 'kid' ? 0.9 : 1), headT = `translate(0,${f(D.headY + (1 - hsc) * 110)}) rotate(${o.tilt || 0}) scale(${hsc})`;
    const hb = backHair(o, kind);
    if (hb) out += `<g transform="${headT}">${hb}</g>`;
    const neckW = kind === 'kid' ? 34 : kind === 'man' ? 46 : 34, nid = id + 'n';
    out += `<defs>${vGrad(nid, shade(C.skin, -0.45), shade(C.skin, -0.12))}</defs><rect x="${-neckW}" y="${D.headY + 60}" width="${neckW * 2}" height="${f(D.shY - D.headY - 40)}" fill="url(#${nid})" ${ol()}/>`;
    const TP = torsoPath(D), tg = id + 't';
    let t = `<defs><linearGradient id="${tg}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${shade(tun, -0.24)}"/><stop offset="0.28" stop-color="${shade(tun, 0.05)}"/><stop offset="0.55" stop-color="${tun}"/><stop offset="1" stop-color="${shade(tun, -0.28)}"/></linearGradient><clipPath id="${tg}c"><path d="${TP}"/></clipPath></defs>`;
    t += `<path d="${TP}" fill="url(#${tg})"/>`;
    // o.weave: the cloth's thread texture (under the costume, so a shirt front or lapel drawn by it covers it)
    if (o.weave) t += `<g clip-path="url(#${tg}c)">${weaveFill(o.weave, -D.shX * 1.8, D.shY - 140, D.shX * 3.6, -D.shY + 260)}</g>`;
    // o.costume: patterns sewn on the garment (person-local), cut to the torso's own shape and shaded with it
    if (o.costume) t += `<g clip-path="url(#${tg}c)">${o.costume}</g>`;
    let sh = '';
    for (const s of [-1, 1]) sh += `<path d="M${f(s * D.shX * 0.6)},${D.shY + 80 * u} Q${f(s * D.shX * 0.72)},${f((D.shY + D.wY) / 2)} ${f(s * D.shX * 0.58)},${f(D.wY - 40 * u)}" stroke="${shade(tun, -0.5)}" stroke-width="${f(8 * u)}" fill="none" opacity="0.5" filter="url(#b4)"/>`;
    sh += `<path d="M${f(-D.shX * 0.3)},${f(D.shY + 120 * u)} Q0,${f(D.shY + 150 * u)} ${f(D.shX * 0.3)},${f(D.shY + 110 * u)}" stroke="${shade(tun, -0.45)}" stroke-width="${f(5 * u)}" fill="none" opacity="0.35" filter="url(#b4)"/>`;
    // (o.tailored: a jacket, shirt or apron cut to a pattern - no tunic pleats from the waist to the hem, which read as a
    // kilt; just a soft fold at each side; no hem grime unless o.dirt; a lighter shade at the hem)
    const tailored = !!o.tailored, N = tailored ? 0 : (kind === 'woman' ? 10 : 9);
    for (let i = 0; i < N; i++) {
      const v = (i + 0.5) / N * 2 - 1;
      sh += `<path d="M${f(v * D.wX * 0.95)},${D.wY + 16} L${f(v * D.hemX * 1.02)},${D.hemY - 4}" stroke="${shade(tun, -0.55)}" stroke-width="${f(11 * u)}" opacity="0.55" filter="url(#b4)"/>`;
      const v2 = v + 1 / N; if (v2 < 1) sh += `<path d="M${f(v2 * D.wX * 0.95)},${D.wY + 24} L${f(v2 * D.hemX)},${D.hemY - 12}" stroke="${shade(tun, 0.22)}" stroke-width="${f(9 * u)}" opacity="0.4" filter="url(#b4)"/>`;
    }
    if (tailored && D.hemY > D.wY + 60) for (const s of [-1, 1]) sh += `<path d="M${f(s * D.wX * 0.7)},${D.wY + 20} Q${f(s * D.wX * 0.82)},${f((D.wY + D.hemY) / 2)} ${f(s * D.hemX * 0.78)},${D.hemY - 6}" stroke="${shade(tun, -0.45)}" stroke-width="${f(9 * u)}" fill="none" opacity="0.28" filter="url(#b4)"/>`;
    if (!tailored || o.dirt) {
      const rr = rng(o.dirt || 17);
      for (let i = 0; i < 6; i++) sh += `<ellipse cx="${f((rr() - 0.5) * D.hemX * 1.8)}" cy="${f(D.hemY - rr() * 120 * u)}" rx="${f((20 + rr() * 40) * u)}" ry="${f((10 + rr() * 20) * u)}" fill="#2a1a0c" opacity="${f(0.12 + rr() * 0.12)}" filter="url(#b8)"/>`;
    }
    sh += `<rect x="${-D.hemX - 20}" y="${f(D.hemY - 50 * u)}" width="${D.hemX * 2 + 40}" height="${f(60 * u)}" fill="${shade(tun, -0.6)}" opacity="${tailored ? 0.07 : 0.4}" filter="url(#b8)"/>`;
    // (the belted tunic's waist shadow; a tailored jacket or shirt has no belt line, only the fold its cut makes)
    if (!tailored || o.belt) sh += `<rect x="${-D.wX - 10}" y="${D.wY - 6}" width="${D.wX * 2 + 20}" height="${f(44 * u)}" fill="${shade(tun, -0.6)}" opacity="0.45" filter="url(#b4)"/>`;
    sh += `<rect x="${-D.shX}" y="${D.shY - 10}" width="${D.shX * 2}" height="${f(70 * u)}" fill="#fff" opacity="0.06" filter="url(#b8)"/>`;
    if (o.apron) sh += `<path d="M${f(-D.wX * 0.74)},${D.wY + 10} L${f(D.wX * 0.74)},${D.wY + 10} L${f(D.hemX * 0.56)},${f(D.hemY - 60 * u)} Q0,${f(D.hemY - 40 * u)} ${f(-D.hemX * 0.56)},${f(D.hemY - 60 * u)}Z" fill="${o.apron}" ${ol()}/>` +
      [-0.32, 0, 0.32].map(k => `<path d="M${f(k * D.wX)},${D.wY + 30} L${f(k * D.hemX * 0.9)},${f(D.hemY - 80 * u)}" stroke="${shade(o.apron, -0.3)}" stroke-width="${f(9 * u)}" opacity="0.5" filter="url(#b4)"/>`).join('');
    if (o.patch) { const r = rng(o.patch === true ? 7 : o.patch); for (let i = 0; i < 3; i++) { const px = (r() - 0.5) * D.wX * 1.4, py = D.shY + 100 * u + r() * (D.hemY - D.shY - 160 * u); sh += `<g transform="translate(${f(px)},${f(py)}) scale(${f(u * 1.3)})" stroke="${shade(tun, -0.6)}" stroke-width="1.5" ${NS} opacity="0.75"><path d="M-4,-9 L-4,9" stroke-dasharray="3 3"/><path d="M4,-9 L4,9" stroke-dasharray="3 3"/><path d="M-4,-2 L4,-2 M-4,4 L4,4"/></g>`; } }
    t += `<g clip-path="url(#${tg}c)">${sh}</g>`;
    t += `<path d="${TP}" fill="none" ${ol()}/>`;
    const nw = D.shX * 0.3;
    t += `<path d="M${f(-nw)},${D.shY - 24} Q0,${D.shY + 6} ${f(nw)},${D.shY - 24}" stroke="#d6ccba" stroke-width="5" fill="none"/><path d="M${f(-nw)},${D.shY - 24} Q0,${D.shY + 8} ${f(nw)},${D.shY - 24}" ${ol(1.4)} fill="none"/>`;
    if (!o.mantle && kind !== 'woman') t += `<path d="M0,${D.shY + 12} L0,${f(D.shY + 80 * u)}" ${ol(1.6)} opacity="0.85"/>`;
    let mantleSvg = '';
    if (o.mantle) {
      const m = o.mantle, sx = D.shX * (o.mantleW || 1.1), sy = D.shY, y1 = sy + (o.mantleDrop || 70) * u, mid = id + 'm', nw2 = D.shX * 0.34;
      let d = `M${f(-nw2)},${sy - 30} C${f(-nw2 * 2)},${sy - 24} ${f(-sx * 0.92)},${sy - 8} ${f(-sx)},${f(sy + 40 * u)} `;
      const r = rng(13), N = 24;
      for (let i = 1; i <= N; i++) { const tt = i / N, x = -sx + tt * sx * 2, yb = y1 + Math.sin(tt * Math.PI) * 55 * u; d += `L${f(x - sx * 0.04)},${f(yb + (8 + r() * 12) * u)} L${f(x)},${f(yb + r() * 4 * u)} `; }
      d += `L${f(sx)},${f(sy + 40 * u)} C${f(sx * 0.92)},${sy - 8} ${f(nw2 * 2)},${sy - 24} ${f(nw2)},${sy - 30} Q0,${sy + 4} ${f(-nw2)},${sy - 30}Z`;
      let mm = `<defs>${vGrad(mid, shade(m, 0.14), shade(m, -0.25))}</defs><path d="${d}" fill="url(#${mid})" ${ol()}/>`;
      if (o.ermine) { for (let i = 0; i < 26; i++) { const ex = (r() - 0.5) * sx * 1.8, ey = sy + 10 + r() * (y1 - sy + 30 * u); mm += `<path d="M${f(ex)},${f(ey)} q${f(4 * u)},${f(10 * u)} 0,${f(18 * u)} q${f(-4 * u)},${f(-8 * u)} 0,${f(-18 * u)}Z" fill="#141414"/>`; } }
      else for (let i = 0; i < 70; i++) mm += `<path d="M${f((r() - 0.5) * sx * 1.9)},${f(sy + r() * (y1 - sy))} l${f(r() * 8 - 4)},${f((8 + r() * 9) * u)}" stroke="${shade(m, 0.32)}" stroke-width="1.2" ${NS} opacity="0.45"/>`;
      // soft folds fanning out from the neck
      for (const k of [-0.78, -0.42, -0.1, 0.24, 0.56, 0.86]) mm += `<path d="M${f(k * nw2 * 1.6)},${sy - 8} Q${f(k * sx * 0.7)},${f((sy + y1) / 2)} ${f(k * sx * 1.02)},${f(y1 + 30 * u)}" stroke="${shade(m, -0.5)}" stroke-width="${f(7 * u)}" fill="none" opacity="0.22" filter="url(#b4)"/>`;
      for (const k of [-0.6, -0.25, 0.08, 0.4, 0.72]) mm += `<path d="M${f(k * nw2 * 1.6)},${sy - 4} Q${f(k * sx * 0.7)},${f((sy + y1) / 2)} ${f(k * sx * 1.02)},${f(y1 + 20 * u)}" stroke="${shade(m, 0.3)}" stroke-width="${f(4 * u)}" fill="none" opacity="0.18" filter="url(#b4)"/>`;
      mantleSvg = `<g filter="url(#cloth)">${mm}</g>`;
    }
    if (D.belly) t += `<path d="M${f(-D.wX * 1.05)},${f(D.wY - 40 * u)} Q0,${f(D.wY + 30 * u)} ${f(D.wX * 1.05)},${f(D.wY - 40 * u)}" stroke="${shade(tun, -0.6)}" stroke-width="${f(14 * u)}" fill="none" opacity="0.45" filter="url(#b8)"/><ellipse cx="${f(D.wX * 0.25)}" cy="${f((D.shY + D.wY) / 2 + 60 * u)}" rx="${f(D.wX * 0.5)}" ry="${f(80 * u)}" fill="#fff" opacity="0.07" filter="url(#b14)"/>`;
    if (o.tabard) {
      const tb = o.tabard, tc = tb.col || '#2a4a8a', trim = tb.trim || '#c9a040', ty0 = D.shY - 18, ty1 = D.wY + 170 * u, tx0 = D.shX * 0.6, tx1 = D.wX * 0.82, tid = id + 'tb';
      const tD = `M${f(-tx0)},${ty0} L${f(tx0)},${ty0} L${f(tx1)},${f(ty1 - 20 * u)} Q${f(tx1)},${f(ty1)} ${f(tx1 - 20 * u)},${f(ty1)} L${f(-tx1 + 20 * u)},${f(ty1)} Q${f(-tx1)},${f(ty1)} ${f(-tx1)},${f(ty1 - 20 * u)}Z`;
      t += `<defs><linearGradient id="${tid}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${shade(tc, -0.3)}"/><stop offset="0.35" stop-color="${shade(tc, 0.1)}"/><stop offset="1" stop-color="${shade(tc, -0.32)}"/></linearGradient></defs><path d="${tD}" fill="url(#${tid})" ${ol()}/>`;
      t += `<path d="${tD}" fill="none" stroke="${trim}" stroke-width="${f(7 * u)}" transform="translate(0,0) scale(0.93,0.985)" opacity="0.9"/>`;
      for (const k of [-0.5, 0, 0.5]) t += `<path d="M${f(k * tx0)},${f(D.wY + 20 * u)} L${f(k * tx1 * 1.05)},${f(ty1 - 6)}" stroke="${shade(tc, -0.5)}" stroke-width="${f(9 * u)}" opacity="0.5" filter="url(#b4)"/>`;
      if (tb.emblem !== false) { const ey = D.shY + 115 * u, es = 1.25 * u; t += `<g transform="translate(0,${f(ey)}) scale(${f(es)})"><path d="M-34,14 L-38,-22 L-20,-4 L0,-30 L20,-4 L38,-22 L34,14Z" fill="${trim}" ${ol(1.2)}/><rect x="-36" y="12" width="72" height="12" rx="3" fill="${shade(trim, -0.15)}" ${ol(1.2)}/><circle cx="0" cy="-34" r="5" fill="${trim}" ${ol(1)}/><circle cx="-40" cy="-25" r="4" fill="${trim}"/><circle cx="40" cy="-25" r="4" fill="${trim}"/><path d="M-30,10 L-26,-10" stroke="#fff6d0" stroke-width="2" opacity="0.6"/></g>`; }
    }    if (o.belt !== false) {
      const by = D.wY + 8, bw = D.wX + 4;
      if (o.leatherBelt) {
        const bc = o.belt || '#2e1c10', bh = 28 * u;
        t += `<rect x="${-bw}" y="${f(by - bh / 2)}" width="${bw * 2}" height="${f(bh)}" fill="${bc}" ${ol()}/><rect x="${-bw}" y="${f(by - bh / 2)}" width="${bw * 2}" height="${f(bh * 0.3)}" fill="#fff" opacity="0.08"/>` +
          `<rect x="${f(-20 * u)}" y="${f(by - bh * 0.7)}" width="${f(40 * u)}" height="${f(bh * 1.4)}" rx="3" fill="none" stroke="${o.buckle || '#a8946a'}" stroke-width="${f(7 * u)}"/>`;
        if (o.pouch) t += `<path d="M${f(bw * 0.4)},${f(by + bh / 2)} l${f(52 * u)},0 l-3,${f(72 * u)} q${f(-23 * u)},${f(14 * u)} ${f(-46 * u)},0Z" fill="#2e1c10" ${ol()}/>`;
      } else {
        const bc = o.belt || '#b6a378', bh = 20 * u;
        let rope = `<rect x="${-bw}" y="${f(by - bh / 2)}" width="${bw * 2}" height="${f(bh)}" rx="${f(bh / 2)}" fill="${bc}" ${ol()}/>`;
        for (let x = -bw + 5; x < bw - 4; x += 9 * u) rope += `<path d="M${f(x)},${f(by - bh / 2 + 1)} l${f(4 * u)},${f(bh - 2)}" stroke="${shade(bc, -0.5)}" stroke-width="${f(2.6 * u)}" opacity="0.75"/>`;
        rope += `<circle cx="${f(8 * u)}" cy="${by}" r="${f(12 * u)}" fill="${bc}" ${ol()}/>`;
        for (const [dx, len] of [[-4, 90], [10, 78]]) rope += `<path d="M${f((8 + dx) * u)},${f(by + 8 * u)} L${f((8 + dx * 1.6) * u)},${f(by + len * u)}" stroke="${OUT}" stroke-width="${f(12 * u)}" stroke-linecap="round"/><path d="M${f((8 + dx) * u)},${f(by + 8 * u)} L${f((8 + dx * 1.6) * u)},${f(by + len * u)}" stroke="${bc}" stroke-width="${f(8.5 * u)}" stroke-linecap="round"/>`;
        t += rope;
      }
    }
    if (o.strap) {
      const sc = o.strap, x0 = -D.shX * 0.62, y0 = D.shY - 6, x1 = D.wX * 0.95, y1 = D.wY + 40 * u, sw2 = 22 * u;
      t += `<path d="M${f(x0)},${f(y0)} L${f(x1)},${f(y1)}" stroke="${OUT}" stroke-width="${f(sw2 + 3)}" stroke-linecap="round"/><path d="M${f(x0)},${f(y0)} L${f(x1)},${f(y1)}" stroke="${sc}" stroke-width="${f(sw2)}" stroke-linecap="round"/><path d="M${f(x0)},${f(y0 - 6 * u)} L${f(x1)},${f(y1 - 6 * u)}" stroke="#fff" stroke-width="${f(3 * u)}" opacity="0.15"/>`;
      t += `<path d="M${f(x1 - 50 * u)},${f(y1 - 10 * u)} l${f(110 * u)},0 l${f(-6 * u)},${f(105 * u)} q${f(-49 * u)},${f(16 * u)} ${f(-98 * u)},0Z" fill="${shade(sc, 0.05)}" ${ol()}/><path d="M${f(x1 - 50 * u)},${f(y1 - 10 * u)} l${f(110 * u)},0 l${f(-4 * u)},${f(48 * u)} q${f(-51 * u)},${f(18 * u)} ${f(-102 * u)},0Z" fill="${shade(sc, -0.12)}" ${ol()}/><circle cx="${f(x1 + 5 * u)}" cy="${f(y1 + 40 * u)}" r="${f(6 * u)}" fill="#c9a040" ${ol(1)}/>`;
    }
    out += `<g filter="url(#cloth)">${t}</g>`;
    // the upper arms, then the top of the body again over their roots, feathered out towards the armpits: the sleeves
    // grow out from under the shoulder line at any angle (no ball joints); forearms and hands come after the head
    if (!aR.behind) out += armR.up; if (!aL.behind) out += armL.up;
    if ((!aR.behind || !aL.behind) && !o.noYoke && !(G.DBG && G.DBG.noyoke) && G.RIG_CRISP) {
      // (G.RIG_CRISP) the yoke ends in a clean armhole seam on each side, from the top of the shoulder curving down
      // round the front of the arm's root to the armpit, instead of a feathered fade (a dark body faded over a light
      // sleeve read as a smudge)
      const sx = D.shX, sy = D.shY, sw = D.sw, ym = id + 'yc';
      const side = s => `L${f(s * sx * 0.62)},${f(sy - 50)} C${f(s * sx * 0.88)},${f(sy - 30)} ${f(s * sx * 0.94)},${f(sy + sw * 0.5)} ${f(s * sx * 0.84)},${f(sy + sw * 1.2)}`;
      // the seam line: only the part of the armhole curve below the shoulder line (above it the curve runs off the body)
      const seam = s => { const P = [[s * sx * 0.62, sy - 50], [s * sx * 0.88, sy - 30], [s * sx * 0.94, sy + sw * 0.5], [s * sx * 0.84, sy + sw * 1.2]]; let d = ''; for (let i = 0; i <= 10; i++) { const t2 = 0.5 + 0.5 * i / 10, a = 1 - t2, b0 = a * a * a, b1 = 3 * a * a * t2, b2 = 3 * a * t2 * t2, b3 = t2 * t2 * t2; d += (i ? ' L' : 'M') + f(b0 * P[0][0] + b1 * P[1][0] + b2 * P[2][0] + b3 * P[3][0]) + ',' + f(b0 * P[0][1] + b1 * P[1][1] + b2 * P[2][1] + b3 * P[3][1]); } return d; };
      const clip = `M${f(-sx * 0.6)},${f(sy - 340)} ${side(-1)} L${f(sx * 0.84)},${f(sy + sw * 1.2)} C${f(sx * 0.94)},${f(sy + sw * 0.5)} ${f(sx * 0.88)},${f(sy - 30)} ${f(sx * 0.62)},${f(sy - 50)} L${f(sx * 0.6)},${f(sy - 340)}Z`;
      out += `<defs><clipPath id="${ym}"><path d="${clip}"/></clipPath></defs><g clip-path="url(#${ym})"><g filter="url(#cloth)">${t}</g></g>`;
      out += [-1, 1].map(s => (s < 0 ? !aR.behind : !aL.behind) ? `<path d="${seam(s)}" fill="none" stroke="#1a120c" stroke-width="2" opacity="0.45"/>` : '').join('');
    } else if ((!aR.behind || !aL.behind) && !o.noYoke && !(G.DBG && G.DBG.noyoke)) {
      const yA = D.shY + D.sw * 0.58, yB = D.shY + D.sw * 1.3, ym = id + 'ym', mx = -D.shX * 2, my = D.shY - 320, mw = D.shX * 4, mh = yB - my + 10;
      out += `<defs><linearGradient id="${ym}g" gradientUnits="userSpaceOnUse" x1="0" y1="${f(yA)}" x2="0" y2="${f(yB)}"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient><mask id="${ym}" maskUnits="userSpaceOnUse" x="${f(mx)}" y="${f(my)}" width="${f(mw)}" height="${f(mh)}"><rect x="${f(mx)}" y="${f(my)}" width="${f(mw)}" height="${f(mh)}" fill="url(#${ym}g)"/></mask></defs><g mask="url(#${ym})"><g filter="url(#cloth)">${t}</g></g>`;
    }
    if (!o.hood) { out += mantleSvg; mantleSvg = ''; }
    // o.headProps: SVG in head-local units (face centre at 0,0) that turns with the head (bonnets, caps, headdresses)
    out += `<g transform="${headT}">${head(o, kind, true)}${o.headProps || ''}</g>`;
    if (o.props) out += o.props;
    if (o.hood && o.cape !== false) {
      const c = o.hood, cid = id + 'cp', cy0 = D.headY + 92, cy1 = D.shY + 190 * u, cx1 = D.shX * 1.3, sY = D.shY;
      out += contactSh(aR.behind ? null : armR) + contactSh(aL.behind ? null : armL);
      if (!aR.behind) out += armR.lo; if (!aL.behind) out += armL.lo;
      const capeD = `M-70,${cy0} C-118,${cy0 + 20} ${f(-cx1 * 0.92)},${sY - 14} ${f(-cx1)},${f(sY + 56 * u)} L${f(-cx1 * 1.05)},${f(cy1 - 16)} Q${f(-cx1 * 0.5)},${f(cy1 + 26 * u)} 0,${f(cy1 + 14 * u)} Q${f(cx1 * 0.5)},${f(cy1 + 26 * u)} ${f(cx1 * 1.05)},${f(cy1 - 16)} L${f(cx1)},${f(sY + 56 * u)} C${f(cx1 * 0.92)},${sY - 14} 118,${cy0 + 20} 70,${cy0}Z`;
      out += `<g filter="url(#cloth)"><defs>${vGrad(cid, shade(c, 0.12), shade(c, -0.25))}</defs><path d="${capeD}" fill="url(#${cid})" ${ol()}/>` +
        [-0.7, -0.35, 0.05, 0.4, 0.72].map(k => `<path d="M${f(k * 80)},${cy0 + 40} Q${f(k * cx1 * 0.9)},${f((cy0 + cy1) / 2)} ${f(k * cx1)},${f(cy1 + 10)}" stroke="${shade(c, -0.55)}" stroke-width="${f(9 * u)}" fill="none" opacity="0.45" filter="url(#b4)"/>`).join('') +
        [-0.5, -0.15, 0.22, 0.56].map(k => `<path d="M${f(k * 80)},${cy0 + 50} Q${f(k * cx1 * 0.9)},${f((cy0 + cy1) / 2)} ${f(k * cx1)},${f(cy1)}" stroke="${shade(c, 0.25)}" stroke-width="${f(5 * u)}" fill="none" opacity="0.3" filter="url(#b4)"/>`).join('') + `</g>`;
      if (o.handsOverCape) out += (armR.hand || '') + (armL.hand || '');
    } else { out += mantleSvg; mantleSvg = ''; out += contactSh(aR.behind ? null : armR) + contactSh(aL.behind ? null : armL); if (!aR.behind) out += armR.lo; if (!aL.behind) out += armL.lo; }
    out += mantleSvg;
    if (o.frontProps) out += o.frontProps;
    const s = o.s || 1;
    const wrap = inner => `<g transform="translate(${f(o.x || 0)},${f(o.y || 0)}) rotate(${f(o.sway || 0)}) scale(${Math.round(s * (1 - (o.breath || 0) * 0.0015) * 1e5) / 1e5},${Math.round(s * (1 + (o.breath || 0) * 0.004) * 1e5) / 1e5})">${inner}</g>`;
    // light-rig info for scene lighting (scene coordinates)
    const info = { cx: o.x, cy: o.y - D.H * 0.55 * s, top: o.y - (D.H + 20) * s, feet: o.y, R: Math.max(D.shX, D.hemX) * s * 1.6, s, head: [o.x, o.y + D.headY * s], hr: 125 * s };
    // (the light filter's box is the body's: arms flung wide or raised high reached past it and their hands were cut off at
    // its edge, a hand reduced to a thumb - the box now takes in both hands and both elbows)
    { const hl = D.hand * (G.RIG_HANDS === 1 ? 1 : HAND_K) * s * 1.15, ew = D.sw * s; let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const A of [armR, armL]) { const w = toWorld(o, A.W), e = toWorld(o, A.E); x0 = Math.min(x0, w[0] - hl, e[0] - ew); y0 = Math.min(y0, w[1] - hl, e[1] - ew); x1 = Math.max(x1, w[0] + hl, e[0] + ew); y1 = Math.max(y1, w[1] + hl, e[1] + ew); } info.ext = [x0, y0, x1, y1]; }
    // armRsvg / armLsvg: the forearm and hand only (redrawn over a tabletop the hand rests on; the shoulder stays put)
    return { svg: wrap(out), handR: armR.hand ? wrap(armR.hand) : '', handL: armL.hand ? wrap(armL.hand) : '', armRsvg: wrap(armR.lo), armLsvg: wrap(armL.lo), armRfull: wrap((armR.up || '') + armR.lo), armLfull: wrap((armL.up || '') + armL.lo), D, shR, shL, info, jR: { W: armR.W, E: armR.E }, jL: { W: armL.W, E: armL.E } };
  }

  // exact person-local <-> world mapping (translate, sway rotation, breathing scale) so hands meet world props precisely
  const pScale = o => { const s = o.s || 1; return [Math.round(s * (1 - (o.breath || 0) * 0.0015) * 1e5) / 1e5, Math.round(s * (1 + (o.breath || 0) * 0.004) * 1e5) / 1e5]; };
  function toWorld(o, p) { const [sx, sy] = pScale(o), a = (o.sway || 0) * Math.PI / 180, x = p[0] * sx, y = p[1] * sy; return [(o.x || 0) + x * Math.cos(a) - y * Math.sin(a), (o.y || 0) + x * Math.sin(a) + y * Math.cos(a)]; }
  function toLocal(o, w) { const [sx, sy] = pScale(o), a = -(o.sway || 0) * Math.PI / 180, dx = w[0] - (o.x || 0), dy = w[1] - (o.y || 0); return [(dx * Math.cos(a) - dy * Math.sin(a)) / sx, (dx * Math.sin(a) + dy * Math.cos(a)) / sy]; }
  // a world direction expressed in person-local axes (for hand directions)
  function dirLocal(o, d) { const [sx, sy] = pScale(o), a = -(o.sway || 0) * Math.PI / 180; return [(d[0] * Math.cos(a) - d[1] * Math.sin(a)) / sx, (d[0] * Math.sin(a) + d[1] * Math.cos(a)) / sy]; }
  // a point in head-local units -> person-local (follows tilt and head scale)
  function headPt(o, kind, p) { const D = Object.assign({}, DIMS[kind], o.dims || {}), hsc = o.headScale ?? (kind === 'kid' ? 0.9 : 1), a = (o.tilt || 0) * Math.PI / 180, x = p[0] * hsc, y = p[1] * hsc; return [x * Math.cos(a) - y * Math.sin(a), D.headY + (1 - hsc) * 110 + x * Math.sin(a) + y * Math.cos(a)]; }
  G.RIG = { defs, person, hand, handV2, gripSlot, HAND_K, shade, mix, rng, uid, DIMS, OUT, OW, NS, ol, restHand, f, cylGrad, vGrad, EXPR, MOUTH, FACE, faceP, crownArt, toWorld, toLocal, dirLocal, headPt, woundPt, limb,
    lidProbe: { reset: () => { lidMax = 0; }, get: () => lidMax } };
})(window);




