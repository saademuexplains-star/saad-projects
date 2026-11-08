// Props for "The Heroin Bottle" (around 1900): the bottle itself (an amber medicine bottle whose paper label wraps
// round the glass, so turning or rolling it carries the one word in and out of view), the silver spoon and the syrup,
// the cheerful carton, a blue poison-ridged morphine bottle, the pharmacy's show globes, cash register and scale, an
// oil lamp, a kettle, a terrestrial globe that the bans spread over, a rag doll, a wooden horse, a wall calendar.
// Hand-held props use the RIG grip frame (+x = thumb side, +y = fingers).
(function (G) {
  const { f, shade, mix, rng, uid, ol } = G.RIG, C = G.CINE;
  const P = G.PROPS;
  const D2R = Math.PI / 180;
  const OUT = '#1e1208';
  const olp = (w = 1.6) => `stroke="${OUT}" stroke-width="${w}" stroke-linejoin="round" stroke-opacity="0.85"`;
  const GOLD = (id, dark = '#6a4410', mid = '#d8b050', lite = '#fff0b0') => `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${dark}"/><stop offset="0.35" stop-color="${mid}"/><stop offset="0.5" stop-color="${lite}"/><stop offset="0.68" stop-color="${mid}"/><stop offset="1" stop-color="${dark}"/></linearGradient>`;

  // ======================================================= THE BOTTLE (bottle-local: base centre 0,0, up is -y, 336 tall)
  // o.rot  degrees the bottle has turned about its own axis (0 = label square to the camera; at 180 it is round the back)
  // o.level 0..1 syrup, o.tilt the bottle's tilt in the world (degrees) so the syrup stays level, o.cork, o.light (-1|1)
  const BR = 62, BH = 210, NECK = 18;
  const BODY = `M${-BR},-6 Q${-BR},0 ${-BR + 8},0 L${BR - 8},0 Q${BR},0 ${BR},-6 L${BR},${-BH} C${BR},${-BH - 30} ${NECK + 6},${-BH - 30} ${NECK},${-BH - 42} L${NECK},-290 L${-NECK},-290 L${-NECK},${-BH - 42} C${-NECK - 6},${-BH - 30} ${-BR},${-BH - 30} ${-BR},${-BH}Z`;
  const LU = 76, LV = 56, LY = -112;   // label half-width (arc length) and half-height, centre height
  const labelArt = id => {
    let g = `<g id="${id}"><rect x="${-LU}" y="${-LV}" width="${LU * 2}" height="${LV * 2}" fill="#efe5cc"/><rect x="${-LU + 4}" y="${-LV + 4}" width="${LU * 2 - 8}" height="${LV * 2 - 8}" fill="none" stroke="#3a2a1a" stroke-width="2"/>` +
      `<rect x="${-LU + 8}" y="${-LV + 8}" width="${LU * 2 - 16}" height="${LV * 2 - 16}" fill="none" stroke="#7a1a1a" stroke-width="1"/><rect x="${-LU + 8}" y="${-LV + 8}" width="${LU * 2 - 16}" height="18" fill="#7a1a1a"/>`;
    for (let i = 0; i < 4; i++) g += `<rect x="${-LU + 18 + i * 32}" y="${-LV + 15}" width="${20 - (i % 2) * 6}" height="3" fill="#efe5cc" opacity="0.8"/>`;
    g += `<text x="0" y="12" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-weight="bold" font-size="27" letter-spacing="0.5" fill="#16100c">HEROIN</text>`;
    g += `<path d="M${-LU + 22},20 L${LU - 22},20" stroke="#3a2a1a" stroke-width="1.2"/>`;
    for (let i = 0; i < 3; i++) g += `<rect x="${-LU + 20 + (i % 2) * 10}" y="${26 + i * 8}" width="${LU * 2 - 40 - (i % 2) * 20 - i * 6}" height="2.6" fill="#5a4a3a" opacity="0.6"/>`;
    g += `<circle cx="${LU - 22}" cy="${LV - 16}" r="8" fill="none" stroke="#7a1a1a" stroke-width="1.6"/><path d="M${LU - 26},${LV - 16} l8,0 M${LU - 22},${LV - 20} l0,8" stroke="#7a1a1a" stroke-width="1.6"/>`;
    return g + '</g>';
  };
  P.bottleLocal = (t, o = {}) => {
    const id = uid('hb'), rot = (o.rot ?? 0) * D2R, lev = Math.max(0, Math.min(1, o.level ?? 0.75)), tilt = (o.tilt || 0) * D2R, lx = o.light ?? -1;
    let g = `<defs><clipPath id="${id}c"><path d="${BODY}"/></clipPath>${labelArt(id + 'l')}` +
      `<linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3a1c06"/><stop offset="${lx < 0 ? 0.3 : 0.55}" stop-color="#9a5a1c"/><stop offset="${lx < 0 ? 0.55 : 0.75}" stop-color="#7a4210"/><stop offset="1" stop-color="#2a1404"/></linearGradient></defs>`;
    g += `<path d="${BODY}" fill="url(#${id}g)" opacity="0.92"/>`;
    // the syrup: everything below a surface that stays level in the world, through a point on the axis
    if (lev > 0.005) {
      const ax = 0, ay = -8 - lev * 236, ang = -tilt / D2R;
      g += `<g clip-path="url(#${id}c)"><g transform="translate(${ax},${f(ay)}) rotate(${f(ang)})"><rect x="-600" y="0" width="1200" height="900" fill="#3a1606" opacity="0.88"/><rect x="-600" y="0" width="1200" height="5" fill="#c87a2a" opacity="0.55"/></g></g>`;
    }
    // the label, wrapped round the glass in strips (each strip scaled by how square it faces us)
    const N = 22, du = LU * 2 / N;
    let lab = '', cl = '';
    for (let i = 0; i < N; i++) {
      const u = -LU + du * (i + 0.5), phi = u / BR + rot, c = Math.cos(phi);
      if (c < 0.03) continue;
      const x = BR * Math.sin(phi), cid = `${id}s${i}`;
      cl += `<clipPath id="${cid}"><rect x="${f(u - du / 2 - 0.4)}" y="${-LV - 1}" width="${f(du + 0.8)}" height="${LV * 2 + 2}"/></clipPath>`;
      lab += `<use href="#${id}l" transform="translate(${f(x)},${LY}) scale(${f(c)},1) translate(${f(-u)},0)" clip-path="url(#${cid})"/>`;
      const sh = (1 - c) * 0.7 + (lx * Math.sin(phi) > 0 ? 0 : 0.12 * Math.abs(Math.sin(phi)));
      if (sh > 0.02) lab += `<rect x="${f(x - du * c / 2 - 0.3)}" y="${LY - LV}" width="${f(du * c + 0.6)}" height="${LV * 2}" fill="#1a0c04" opacity="${f(Math.min(0.85, sh))}"/>`;
    }
    g += `<defs>${cl}</defs><g clip-path="url(#${id}c)">${lab}</g>`;
    // glass: a highlight stripe, a rim light, the shoulder gleam, the lip and the cork
    g += `<path d="M${-BR * 0.55 * -lx},-16 L${-BR * 0.55 * -lx},${-BH + 4}" stroke="#fff3d8" stroke-width="7" opacity="0.38" stroke-linecap="round"/><path d="M${-BR * 0.36 * -lx},-30 L${-BR * 0.36 * -lx},-96" stroke="#fff" stroke-width="3" opacity="0.3" stroke-linecap="round"/>` +
      `<path d="M${BR * -lx - lx * 2},-10 L${BR * -lx - lx * 2},${-BH}" stroke="#ffb860" stroke-width="3" opacity="0.4"/><path d="${BODY}" fill="none" ${olp(2)}/>` +
      `<rect x="${-NECK - 5}" y="-302" width="${NECK * 2 + 10}" height="14" rx="5" fill="#8a4a14" ${olp(1.4)}/>`;
    if (o.cork !== false) g += `<path d="M${-NECK + 2},-300 L${NECK - 2},-300 L${NECK + 2},-338 L${-NECK - 2},-338Z" fill="#b08a5a" ${olp(1.4)}/><path d="M${-NECK + 6},-310 l4,-20 M${NECK - 8},-314 l-2,-18" stroke="#7a5a32" stroke-width="2"/>`;
    return g;
  };
  // in the world: (x,y) = the base centre; o.lie rotates the whole bottle (90 = lying, neck to the right)
  P.heroinBottle = (x, y, s, t, o = {}) => `<g transform="translate(${f(x)},${f(y)}) rotate(${f(o.lie || 0)}) scale(${f(s)})">${P.bottleLocal(t, o)}</g>`;
  // in a fist: gripped round the middle of the body, the neck toward the thumb (+x)
  P.bottleG = (t, o = {}) => `<g transform="rotate(90) translate(0,118)">${P.bottleLocal(t, o)}</g>`;
  P.BOTTLE_H = 338; P.BOTTLE_MOUTH = 300;

  // ======================================================= the silver spoon in the grip frame (bowl toward the thumb, +x)
  P.spoonG = (o = {}) => {
    const id = uid('sp'), k = Math.max(0, Math.min(1, o.fill || 0));
    let g = `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f6f8"/><stop offset="0.5" stop-color="#b4bac0"/><stop offset="1" stop-color="#5a6068"/></linearGradient></defs>`;
    g += `<path d="M-70,-5 C-30,-8 40,-7 92,-4 L96,4 C40,7 -30,8 -70,6 C-76,4 -76,-4 -70,-5Z" fill="url(#${id})" ${olp(1.2)}/>`;
    g += `<ellipse cx="146" cy="0" rx="46" ry="26" fill="url(#${id})" ${olp(1.4)}/><ellipse cx="148" cy="2" rx="36" ry="18" fill="#5a6068" opacity="0.5"/>`;
    if (k > 0.02) g += `<ellipse cx="149" cy="3" rx="${f(32 * Math.sqrt(k))}" ry="${f(15 * Math.sqrt(k))}" fill="#4a1c06"/><ellipse cx="140" cy="-2" rx="${f(12 * Math.sqrt(k))}" ry="${f(4 * Math.sqrt(k))}" fill="#e09040" opacity="0.6"/>`;
    g += `<path d="M110,-14 C126,-22 150,-22 166,-14" stroke="#fff" stroke-width="3" opacity="0.6" fill="none"/>`;
    return g;
  };
  P.SPOON_BOWL = [148, 2];
  // a thin stream of syrup from (x0,y0) curving down into (x1,y1); k 0..1 how much is flowing
  P.syrupStream = (x0, y0, x1, y1, t, k = 1) => {
    if (k < 0.02) return '';
    const mx = (x0 + x1) / 2 + Math.sin(t * 9) * 2, my = Math.min(y0, y1) + Math.abs(y1 - y0) * 0.25, w = 3 + 4 * k;
    return `<path d="M${f(x0)},${f(y0)} Q${f(mx)},${f(my)} ${f(x1)},${f(y1)}" stroke="#3a1606" stroke-width="${f(w)}" fill="none" stroke-linecap="round" opacity="${f(0.95 * Math.min(1, k * 2))}"/><path d="M${f(x0 - 1)},${f(y0)} Q${f(mx - 1)},${f(my)} ${f(x1 - 1)},${f(y1)}" stroke="#d8843a" stroke-width="${f(w * 0.3)}" fill="none" opacity="${f(0.5 * k)}"/>`;
  };
  // a single falling drop (the last one)
  P.syrupDrop = (x, y, s = 1) => `<path d="M${f(x)},${f(y - 16 * s)} C${f(x + 7 * s)},${f(y - 4 * s)} ${f(x + 8 * s)},${f(y + 6 * s)} ${f(x)},${f(y + 8 * s)} C${f(x - 8 * s)},${f(y + 6 * s)} ${f(x - 7 * s)},${f(y - 4 * s)} ${f(x)},${f(y - 16 * s)}Z" fill="#3a1606"/><circle cx="${f(x - 2 * s)}" cy="${f(y)}" r="${f(2 * s)}" fill="#e8a050" opacity="0.7"/>`;

  // ======================================================= the carton it is sold in (world; (x,y) = bottom-front centre)
  // a cream box with a blue band and gold border, a sweet sleeping-cherub vignette, a red seal and small print (no word)
  P.carton = (x, y, s, o = {}) => {
    const id = uid('ct'), W = 120, H = 220, D = 44;
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><defs>${GOLD(id + 'g')}</defs>`;
    g += `<path d="M${W / 2},0 L${W / 2 + D},${-D * 0.5} L${W / 2 + D},${-H - D * 0.5} L${W / 2},${-H}Z" fill="#c8bea4" ${olp(1.4)}/><path d="M${-W / 2},${-H} L${W / 2},${-H} L${W / 2 + D},${-H - D * 0.5} L${-W / 2 + D},${-H - D * 0.5}Z" fill="#e2d9c2" ${olp(1.4)}/>`;
    g += `<rect x="${-W / 2}" y="${-H}" width="${W}" height="${H}" fill="#efe7d2" ${olp(1.6)}/><rect x="${-W / 2 + 6}" y="${-H + 6}" width="${W - 12}" height="${H - 12}" fill="none" stroke="url(#${id}g)" stroke-width="4"/>`;
    g += `<rect x="${-W / 2 + 6}" y="${-H + 18}" width="${W - 12}" height="26" fill="#2a4a7a"/><rect x="${-W / 2 + 16}" y="${-H + 28}" width="${W - 32}" height="4" fill="#e8dcc0" opacity="0.8"/>`;
    // the cherub: a round sleeping baby face in a gilt oval, with little wings
    const cy = -H + 100;
    g += `<ellipse cx="0" cy="${cy}" rx="40" ry="46" fill="#f6e8d0" stroke="url(#${id}g)" stroke-width="3"/>` +
      `<path d="M-40,${cy - 4} C-62,${cy - 26} -66,${cy + 8} -44,${cy + 14}Z M40,${cy - 4} C62,${cy - 26} 66,${cy + 8} 44,${cy + 14}Z" fill="#fbf6ea" stroke="#b8a888" stroke-width="1.4"/>` +
      `<circle cx="0" cy="${cy + 2}" r="22" fill="#f4cdb0" stroke="#8a6a4a" stroke-width="1.4"/><path d="M-10,${cy - 2} q4,3 8,0 M2,${cy - 2} q4,3 8,0" stroke="#5a3a24" stroke-width="1.6" fill="none"/><path d="M-5,${cy + 10} q5,4 10,0" stroke="#a8504a" stroke-width="1.8" fill="none"/>` +
      `<circle cx="-12" cy="${cy + 6}" r="4" fill="#e8907a" opacity="0.5"/><circle cx="12" cy="${cy + 6}" r="4" fill="#e8907a" opacity="0.5"/><path d="M-20,${cy - 14} C-14,${cy - 26} 14,${cy - 26} 20,${cy - 14}" stroke="#d8a868" stroke-width="5" fill="none"/>`;
    for (let i = 0; i < 4; i++) g += `<rect x="${-W / 2 + 18 + (i % 2) * 8}" y="${-H + 158 + i * 9}" width="${W - 36 - (i % 2) * 16}" height="3" fill="#6a5a44" opacity="0.6"/>`;
    g += `<circle cx="${W / 2 - 22}" cy="-22" r="13" fill="#9a1e1e" ${olp(1)}/><circle cx="${W / 2 - 22}" cy="-22" r="8" fill="none" stroke="#e8c0a0" stroke-width="1.4" stroke-dasharray="2 2"/>`;
    return g + '</g>';
  };
  P.CARTON_FACE = [0, -120];   // the cherub's face, relative to the carton's (x,y) at s 1

  // ======================================================= morphine: a cobalt poison bottle, ridged, a skull on its label
  P.morphineBottle = (x, y, s) => {
    const id = uid('mb');
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0a1238"/><stop offset="0.4" stop-color="#2a4ab0"/><stop offset="0.6" stop-color="#1a2a78"/><stop offset="1" stop-color="#060a24"/></linearGradient></defs>`;
    g += `<path d="M-46,0 L46,0 L46,-170 C46,-196 16,-198 14,-214 L14,-246 L-14,-246 L-14,-214 C-16,-198 -46,-196 -46,-170Z" fill="url(#${id})" ${olp(1.8)}/>`;
    for (const xx of [-34, -22, 22, 34]) g += `<path d="M${xx},-12 L${xx},-160" stroke="#6a8ae0" stroke-width="4" opacity="0.5"/>`;
    g += `<rect x="-24" y="-130" width="48" height="58" fill="#e8e0cc" ${olp(1)}/><circle cx="0" cy="-108" r="10" fill="#2a2420"/><rect x="-6" y="-100" width="12" height="7" fill="#2a2420"/><circle cx="-4" cy="-110" r="2.6" fill="#e8e0cc"/><circle cx="4" cy="-110" r="2.6" fill="#e8e0cc"/>` +
      `<path d="M-14,-86 L14,-76 M14,-86 L-14,-76" stroke="#2a2420" stroke-width="3"/><rect x="-18" y="-256" width="36" height="14" rx="4" fill="#0e1a4a" ${olp(1)}/><path d="M-30,-20 L-30,-150" stroke="#fff" stroke-width="5" opacity="0.25" stroke-linecap="round"/>`;
    return g + '</g>';
  };

  // ======================================================= the pharmacy's show globe (carboy) with coloured water
  P.showGlobe = (x, y, s, t, col = '#b01e2a') => {
    const id = uid('sg');
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><defs><radialGradient id="${id}" cx="40%" cy="40%" r="65%"><stop offset="0" stop-color="${shade(col, 0.55)}"/><stop offset="0.55" stop-color="${col}"/><stop offset="1" stop-color="${shade(col, -0.55)}"/></radialGradient>${GOLD(id + 'g')}</defs>`;
    g += `<path d="M-60,0 L60,0 L50,-30 L-50,-30Z" fill="url(#${id}g)" ${olp(1.4)}/><path d="M-20,-30 L20,-30 L14,-60 L-14,-60Z" fill="url(#${id}g)" ${olp(1.2)}/>`;
    g += `<circle cx="0" cy="-160" r="104" fill="url(#${id})" opacity="0.9" ${olp(2)}/><path d="M-18,-258 L18,-258 L22,-360 L-22,-360Z" fill="${col}" opacity="0.75" ${olp(1.4)}/>`;
    g += `<path d="M-22,-360 C-60,-372 -40,-430 0,-446 C40,-430 60,-372 22,-360Z" fill="url(#${id}g)" ${olp(1.4)}/><circle cx="0" cy="-452" r="10" fill="url(#${id}g)" ${olp(1)}/>`;
    g += `<ellipse cx="-38" cy="-200" rx="22" ry="44" fill="#fff" opacity="0.32" transform="rotate(-25 -38 -200)"/><circle cx="34" cy="-120" r="8" fill="#fff" opacity="0.35"/>` + C.radial(0, -160, 180, col, 0.18, 'screen');
    return g + '</g>';
  };

  // ======================================================= an ornate brass cash register (world; (x,y) = base centre)
  P.register = (x, y, s, o = {}) => {
    const id = uid('cr');
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><defs>${GOLD(id)}</defs>`;
    g += `<path d="M-120,0 L120,0 L110,-60 L-110,-60Z" fill="url(#${id})" ${olp(1.6)}/><path d="M-100,-60 L100,-60 L90,-200 L-90,-200Z" fill="url(#${id})" ${olp(1.6)}/>`;
    for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) g += `<circle cx="${-70 + c * 28}" cy="${-82 - r * 30}" r="10" fill="#f2ead8" stroke="#4a3410" stroke-width="2"/><circle cx="${-70 + c * 28}" cy="${-82 - r * 30}" r="4" fill="#2a2010"/>`;
    g += `<path d="M-80,-200 C-80,-250 80,-250 80,-200Z" fill="url(#${id})" ${olp(1.6)}/><rect x="-46" y="-246" width="92" height="34" fill="#141210" stroke="url(#${id})" stroke-width="5"/>` +
      `<rect x="-36" y="-238" width="20" height="18" fill="#f2ead8"/><rect x="-10" y="-238" width="20" height="18" fill="#f2ead8"/><rect x="16" y="-238" width="20" height="18" fill="#f2ead8"/>` +
      `<path d="M110,-120 C150,-120 160,-150 150,-170" stroke="url(#${id})" stroke-width="10" fill="none"/><circle cx="150" cy="-174" r="12" fill="#2a1a10"/>`;
    for (let i = 0; i < 7; i++) g += `<path d="M${-90 + i * 30},-30 q15,-16 30,0" stroke="#6a4c14" stroke-width="3" fill="none"/>`;
    return g + '</g>';
  };
  // ======================================================= a brass balance scale (world; (x,y) = base centre); tip -1..1
  P.balance = (x, y, s, t, tip = 0) => {
    const id = uid('bs'), a = tip * 8 + Math.sin(t * 1.3) * 1.5;
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><defs>${GOLD(id)}</defs><path d="M-70,0 L70,0 L50,-24 L-50,-24Z" fill="#3a2414" ${olp(1.4)}/><rect x="-8" y="-210" width="16" height="190" fill="url(#${id})" ${olp(1.2)}/>`;
    g += `<g transform="translate(0,-214) rotate(${f(a)})"><rect x="-130" y="-6" width="260" height="12" rx="6" fill="url(#${id})" ${olp(1.2)}/>`;
    for (const sx of [-1, 1]) g += `<g transform="translate(${sx * 120},0) rotate(${f(-a)})"><path d="M0,0 L-40,110 M0,0 L40,110" stroke="#8a6a2a" stroke-width="2"/><path d="M-56,110 Q0,140 56,110Z" fill="url(#${id})" ${olp(1.2)}/></g>`;
    g += `</g><circle cx="0" cy="-214" r="12" fill="url(#${id})" ${olp(1)}/>`;
    return g + '</g>';
  };

  // ======================================================= a kerosene table lamp (world; (x,y) = foot); on 0..1
  P.oilLamp = (x, y, s, t, on = 1) => {
    const id = uid('ol'), fl = 1 + Math.sin(t * 13) * 0.05 + Math.sin(t * 29) * 0.03;
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><defs>${GOLD(id)}<radialGradient id="${id}r" cx="45%" cy="40%" r="60%"><stop offset="0" stop-color="#e8f0e4" stop-opacity="0.7"/><stop offset="1" stop-color="#7a8a70" stop-opacity="0.5"/></radialGradient></defs>`;
    g += `<path d="M-46,0 L46,0 L36,-20 L-36,-20Z" fill="url(#${id})" ${olp(1.4)}/><path d="M-10,-20 L10,-20 L8,-60 L-8,-60Z" fill="url(#${id})" ${olp(1.2)}/>`;
    g += `<ellipse cx="0" cy="-104" rx="52" ry="46" fill="url(#${id}r)" ${olp(1.6)}/><ellipse cx="0" cy="-92" rx="42" ry="26" fill="#c8902a" opacity="0.5"/><rect x="-24" y="-156" width="48" height="16" fill="url(#${id})" ${olp(1.2)}/>`;
    if (on > 0.02) g += `<g opacity="${f(on)}"><path d="M0,-170 C-12,-182 -10,-206 0,${f(-232 * fl)} C10,-206 12,-182 0,-170Z" fill="#ffd27a"/><path d="M0,-174 C-6,-182 -5,-198 0,${f(-214 * fl)} C5,-198 6,-182 0,-174Z" fill="#fff8e0"/></g>`;
    g += `<path d="M-22,-158 C-30,-200 -16,-230 -16,-270 L16,-270 C16,-230 30,-200 22,-158Z" fill="#eef4f0" opacity="0.28" ${olp(1.2)}/><path d="M-12,-170 L-10,-262" stroke="#fff" stroke-width="3" opacity="0.5"/>`;
    return g + '</g>' + (on > 0.02 ? C.bloom(x, y - 200 * s, 120 * s, '#ffb050', 0.45 * on) : '');
  };
  P.OILLAMP_FLAME = 205;
  // ======================================================= a cast-iron kettle (world; (x,y) = base centre); steam 0..1
  P.kettle = (x, y, s, t, steam = 1) => {
    const id = uid('kt');
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><defs><radialGradient id="${id}" cx="35%" cy="35%" r="70%"><stop offset="0" stop-color="#5a5a5e"/><stop offset="1" stop-color="#121214"/></radialGradient></defs>`;
    g += `<path d="M-90,0 C-110,-40 -96,-120 0,-124 C96,-120 110,-40 90,0Z" fill="url(#${id})" ${olp(1.6)}/><path d="M80,-70 C130,-80 150,-110 170,-140 L178,-132 C160,-96 140,-60 90,-40Z" fill="url(#${id})" ${olp(1.4)}/>` +
      `<path d="M-60,-120 C-60,-190 60,-190 60,-120" stroke="#1a1a1c" stroke-width="10" fill="none"/><ellipse cx="0" cy="-124" rx="34" ry="9" fill="#2a2a2e" ${olp(1)}/><circle cx="0" cy="-134" r="8" fill="#3a3a3e"/>`;
    g += '</g>';
    if (steam > 0.02) { const r = rng(7); for (let i = 0; i < 5; i++) { const k = ((t * 0.5 + i / 5) % 1), sx = x + 176 * s + Math.sin(t * 2 + i) * 14 * s + k * 40 * s, sy = y - 140 * s - k * 220 * s; g += `<circle cx="${f(sx)}" cy="${f(sy)}" r="${f((16 + k * 50) * s)}" fill="#e8e8ea" opacity="${f(0.22 * (1 - k) * steam)}" filter="url(#b8)"/>`; } }
    return g;
  };

  // ======================================================= THE GLOBE: continents on an orthographic sphere; the bans spread
  // over them as red stain (o.red[i] 0..1 per continent); o.lon rotation (deg), tilt 18 deg toward us
  const LANDS = [
    [[-168, 66], [-160, 70], [-140, 70], [-120, 72], [-95, 74], [-80, 70], [-65, 60], [-55, 52], [-65, 45], [-70, 42], [-76, 35], [-81, 30], [-80, 25], [-90, 29], [-97, 26], [-97, 20], [-90, 16], [-84, 11], [-79, 8], [-83, 9], [-92, 15], [-105, 20], [-112, 27], [-117, 32], [-124, 40], [-124, 48], [-130, 55], [-140, 60], [-150, 60], [-160, 58], [-165, 62]],
    [[-80, 10], [-72, 12], [-62, 10], [-50, 0], [-35, -5], [-38, -15], [-40, -22], [-48, -27], [-55, -35], [-65, -42], [-68, -52], [-72, -50], [-74, -40], [-71, -30], [-70, -18], [-76, -10], [-81, -4], [-79, 2], [-78, 8]],
    [[-10, 36], [-9, 43], [-2, 44], [-5, 48], [0, 50], [5, 53], [8, 57], [5, 62], [12, 66], [20, 70], [30, 71], [40, 68], [45, 60], [40, 50], [30, 45], [28, 41], [25, 38], [20, 40], [15, 38], [12, 44], [8, 44], [3, 42], [-5, 36]],
    [[-17, 21], [-16, 12], [-12, 8], [-5, 5], [5, 5], [9, 4], [10, -1], [13, -12], [12, -18], [15, -27], [19, -35], [25, -34], [32, -29], [35, -22], [40, -15], [40, -5], [51, 12], [43, 12], [37, 20], [33, 31], [25, 32], [10, 37], [0, 36], [-8, 34], [-12, 28]],
    [[28, 41], [35, 36], [36, 32], [43, 13], [52, 17], [58, 22], [66, 25], [72, 21], [77, 8], [80, 15], [88, 22], [92, 21], [98, 16], [100, 13], [104, 2], [106, 10], [108, 16], [110, 22], [121, 30], [122, 40], [128, 40], [130, 43], [140, 50], [142, 58], [155, 60], [162, 62], [175, 66], [180, 68], [170, 70], [140, 73], [120, 74], [100, 77], [80, 73], [60, 70], [50, 68], [45, 60], [40, 50], [30, 45]],
    [[114, -22], [114, -34], [122, -34], [135, -35], [140, -38], [147, -38], [150, -36], [153, -30], [153, -25], [146, -19], [142, -11], [136, -12], [130, -12], [125, -15], [120, -19]],
    [[-50, 60], [-42, 60], [-22, 70], [-20, 78], [-40, 83], [-60, 80], [-70, 77], [-56, 70]],
    [[-6, 50], [-3, 56], [-5, 58], [-2, 58], [1, 52]], [[130, 31], [134, 34], [140, 36], [142, 40], [141, 45], [139, 38], [133, 33]],
    [[44, -25], [47, -25], [50, -15], [49, -12], [44, -16]], [[95, 5], [105, -6], [114, -8], [118, -2], [110, 2], [100, 3]]
  ];
  // which spread group each land belongs to (0 N.America, 1 Europe/UK, 2 Asia/Japan, 3 S.America, 4 Africa/Madagascar, 5 Australia/islands, 6 Greenland)
  const LAND_GROUP = [0, 3, 1, 4, 2, 5, 6, 1, 2, 4, 5];
  P.GLOBE_GROUPS = 7; P.GLOBE_LANDS = LANDS;
  P.globe = (x, y, s, t, o = {}) => {
    const id = uid('gl'), R = 240, lon0 = (o.lon ?? 0) * D2R, lat0 = (o.lat ?? 18) * D2R, red = o.red || [];
    const proj = ([lo, la]) => {
      const l = lo * D2R - lon0, p = la * D2R, cc = Math.sin(lat0) * Math.sin(p) + Math.cos(lat0) * Math.cos(p) * Math.cos(l);
      let px = R * Math.cos(p) * Math.sin(l), py = -R * (Math.cos(lat0) * Math.sin(p) - Math.sin(lat0) * Math.cos(p) * Math.cos(l));
      if (cc < 0) { const n = Math.hypot(px, py) || 1; px = px / n * R; py = py / n * R; }
      return [px, py, cc];
    };
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><defs>${GOLD(id + 'b', '#4a3008', '#b08a3a', '#f0d890')}<radialGradient id="${id}o" cx="38%" cy="34%" r="70%"><stop offset="0" stop-color="#8aa6a0"/><stop offset="0.6" stop-color="#4a6a6a"/><stop offset="1" stop-color="#1a2a2c"/></radialGradient>` +
      `<radialGradient id="${id}s" cx="38%" cy="34%" r="72%"><stop offset="0" stop-color="#fff" stop-opacity="0.25"/><stop offset="0.5" stop-color="#fff" stop-opacity="0"/><stop offset="0.85" stop-color="#000" stop-opacity="0.15"/><stop offset="1" stop-color="#000" stop-opacity="0.55"/></radialGradient><clipPath id="${id}c"><circle r="${R}"/></clipPath></defs>`;
    // the stand: a turned wooden foot and a brass half-meridian
    g += `<path d="M-120,${R + 240} L120,${R + 240} L80,${R + 200} L-80,${R + 200}Z" fill="#3a2010" ${olp(1.6)}/><path d="M-16,${R + 200} L16,${R + 200} L10,${R + 22} L-10,${R + 22}Z" fill="#4a2a14" ${olp(1.4)}/>`;
    g += `<g clip-path="url(#${id}c)"><circle r="${R}" fill="url(#${id}o)"/>`;
    // graticule
    for (let la = -60; la <= 60; la += 30) { let d = '', on = false; for (let lo = -180; lo <= 180; lo += 8) { const [px, py, cc] = proj([lo, la]); if (cc > 0) { d += `${on ? 'L' : 'M'}${f(px)},${f(py)} `; on = true; } else on = false; } if (d) g += `<path d="${d}" stroke="#c8d8d0" stroke-width="1" opacity="0.25" fill="none"/>`; }
    for (let lo = -180; lo < 180; lo += 30) { let d = '', on = false; for (let la = -80; la <= 80; la += 8) { const [px, py, cc] = proj([lo, la]); if (cc > 0) { d += `${on ? 'L' : 'M'}${f(px)},${f(py)} `; on = true; } else on = false; } if (d) g += `<path d="${d}" stroke="#c8d8d0" stroke-width="1" opacity="0.22" fill="none"/>`; }
    LANDS.forEach((poly, i) => {
      const pts = poly.map(proj);
      if (pts.every(p => p[2] < 0)) return;
      const d = 'M' + pts.map(p => `${f(p[0])},${f(p[1])}`).join(' L') + 'Z', k = red[LAND_GROUP[i]] || 0;
      g += `<path d="${d}" fill="${mix('#d8c8a0', '#8a1a14', Math.min(1, k))}" stroke="#5a4a2a" stroke-width="1.6" stroke-linejoin="round"/>`;
      if (k > 0.02 && k < 0.98) g += `<path d="${d}" fill="none" stroke="#c8281e" stroke-width="${f(6 * Math.sin(Math.PI * k))}" opacity="0.6" filter="url(#b4)"/>`;
    });
    // o.over(proj, R): extra drawing on the sphere (clipped to it); o.overOut(lon0, lat0, R): drawing above it (arcs)
    if (o.over) g += o.over(proj, R);
    g += `<circle r="${R}" fill="url(#${id}s)"/></g><circle r="${R}" fill="none" ${olp(2)}/>`;
    if (o.overOut) g += o.overOut(lon0, lat0, R);
    // the brass meridian ring (tilted, half in front)
    g += `<path d="M0,${-R - 22} A${R + 22},${R + 22} 0 0 1 0,${R + 22}" stroke="url(#${id}b)" stroke-width="14" fill="none"/><circle cx="0" cy="${-R - 22}" r="9" fill="url(#${id}b)" ${olp(1)}/><circle cx="0" cy="${R + 22}" r="9" fill="url(#${id}b)" ${olp(1)}/>`;
    return g + '</g>';
  };

  // ======================================================= a rag doll and a wooden horse (the child's toys)
  P.ragDoll = (x, y, s, rot = 0) => `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)}) scale(${f(s)})"><path d="M-30,0 C-36,-40 -26,-70 0,-72 C26,-70 36,-40 30,0Z" fill="#8a3a3a" ${olp(1.4)}/><path d="M-28,-8 L28,-8" stroke="#e8dcc4" stroke-width="5"/>` +
    `<circle cx="0" cy="-92" r="24" fill="#efe0c8" ${olp(1.4)}/><path d="M-24,-100 C-20,-122 20,-122 24,-100 C30,-90 30,-70 26,-60 M-24,-100 C-30,-90 -30,-70 -26,-60" fill="#a8642a" stroke="#6a3a14" stroke-width="2"/><circle cx="-8" cy="-92" r="2.6" fill="#2a1a10"/><circle cx="8" cy="-92" r="2.6" fill="#2a1a10"/><path d="M-6,-82 q6,4 12,0" stroke="#a8404a" stroke-width="2" fill="none"/>` +
    `<path d="M-30,-56 C-50,-40 -56,-20 -50,-6 M30,-56 C50,-40 56,-20 50,-6" stroke="#8a3a3a" stroke-width="12" stroke-linecap="round" fill="none"/><path d="M-14,0 L-18,30 M14,0 L18,30" stroke="#d8c8a8" stroke-width="12" stroke-linecap="round"/></g>`;
  P.woodHorse = (x, y, s) => `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><path d="M-80,-60 C-90,-90 -60,-104 40,-100 C60,-130 80,-160 104,-160 C126,-150 124,-130 110,-124 L90,-90 C96,-70 80,-60 60,-60Z" fill="#b07a3a" ${olp(1.6)}/>` +
    `<path d="M70,-150 C60,-130 50,-112 46,-100" stroke="#3a2210" stroke-width="10" fill="none"/><circle cx="104" cy="-144" r="4" fill="#1a0e06"/><path d="M-80,-76 C-104,-80 -112,-60 -104,-40" stroke="#3a2210" stroke-width="8" fill="none"/>` +
    `<rect x="-70" y="-60" width="16" height="44" fill="#9a6a30" ${olp(1.2)}/><rect x="40" y="-60" width="16" height="44" fill="#9a6a30" ${olp(1.2)}/><path d="M-100,-14 L100,-14 L90,0 L-90,0Z" fill="#7a3a2a" ${olp(1.4)}/><circle cx="-72" cy="2" r="12" fill="#3a2a1a"/><circle cx="72" cy="2" r="12" fill="#3a2a1a"/></g>`;
  // ======================================================= a wall calendar page with the days crossed off (no lettering)
  P.calendarX = (x, y, s, n = 0) => {
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><rect x="-80" y="-6" width="160" height="196" fill="#efe8d6" ${olp(1.4)}/><rect x="-80" y="-6" width="160" height="40" fill="#5a2a22"/><circle cx="0" cy="-16" r="6" fill="#3a2a1a"/>`;
    for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) { const k = r * 7 + c, cx = -66 + c * 22, cy = 48 + r * 28; g += `<rect x="${cx - 9}" y="${cy - 10}" width="18" height="20" fill="none" stroke="#9a8e78" stroke-width="1"/>`; if (k >= 8 && k < 8 + n) g += `<path d="M${cx - 8},${cy - 9} L${cx + 8},${cy + 9} M${cx + 8},${cy - 9} L${cx - 8},${cy + 9}" stroke="#9a1e1e" stroke-width="2.6"/>`; }
    return g + '</g>';
  };
})(window);
