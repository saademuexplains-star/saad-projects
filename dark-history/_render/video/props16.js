// Props for "The Pied Piper": the Piper's pipe, a wooden hoop and stick, a rag ball, hens, the crutch and the blind boy's
// stick, your son's red cap on the grass, the picture book at bedtime (the Piper and his rats), and the small dancing
// children of the procession seen from far away.
(function (G) {
  const P = G.PROPS, R = G.RIG, { f, uid, shade, mix, rng } = R;
  const TAU = Math.PI * 2;
  // a scale that keeps its precision: f() rounds to 0.01, so a prop 640 wide jumped 6 px at every step as the camera moved
  const fs = v => Math.round(v * 1e5) / 1e5;
  const olp = (w = 2) => `stroke="#20140c" stroke-width="${w}" stroke-linejoin="round"`;

  // ======================================================= the pipe: pale boxwood with dark rings, a beaked mouthpiece at 0 and
  // the bell at +L (drawn along +y; rotate it into place), finger holes, a red ribbon tied below the mouthpiece
  P.PIPE_L = 300;
  P.pipe = (k = 1, t = 0) => {
    const L = P.PIPE_L, id = uid('pp');
    let g = `<g transform="scale(${fs(k)})"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8a6a3a"/><stop offset="0.4" stop-color="#f0dcae"/><stop offset="1" stop-color="#7a5a2c"/></linearGradient></defs>`;
    g += `<path d="M-9,4 L9,4 L13,${L - 40} L22,${L} L-22,${L} L-13,${L - 40}Z" fill="url(#${id})" ${olp(1.8)}/><path d="M-8,4 C-8,-10 8,-10 8,4Z" fill="#5a3a1a" ${olp(1.4)}/>`;
    for (const y of [40, L - 44]) g += `<rect x="-12" y="${y}" width="24" height="9" rx="3" fill="#4a2e14" ${olp(1)}/>`;
    for (let i = 0; i < 6; i++) g += `<ellipse cx="0" cy="${100 + i * 26}" rx="4.6" ry="5.4" fill="#2a180a"/>`;
    g += `<path d="M10,58 C30,70 ${f(34 + 6 * Math.sin(t * 5))},96 ${f(24 + 8 * Math.sin(t * 5 + 1))},130 M10,60 C26,80 ${f(20 + 6 * Math.sin(t * 6))},110 ${f(14 + 6 * Math.sin(t * 6 + 2))},140" stroke="#c8322a" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    return g + '</g>';
  };

  // ======================================================= a wooden hoop (rolling: o.roll angle) and a stick
  P.hoop = (x, y, s, rot = 0) => `<g transform="translate(${f(x)},${f(y)}) scale(${fs(s)})"><ellipse cx="0" cy="-90" rx="90" ry="90" fill="none" stroke="#7a5230" stroke-width="12"/><ellipse cx="0" cy="-90" rx="90" ry="90" fill="none" stroke="#20140c" stroke-width="1.6"/>` +
    `<path d="M${f(Math.cos(rot) * 84)},${f(-90 + Math.sin(rot) * 84)} l${f(Math.cos(rot) * 10)},${f(Math.sin(rot) * 10)}" stroke="#c8a070" stroke-width="6"/></g>`;
  P.ball = (x, y, s) => `<g transform="translate(${f(x)},${f(y)}) scale(${fs(s)})"><circle cx="0" cy="-34" r="34" fill="#c8a878" ${olp(1.8)}/><path d="M-30,-48 C-10,-30 10,-30 30,-48 M-20,-6 C-14,-30 14,-30 20,-6" stroke="#8a6a3a" stroke-width="3" fill="none"/></g>`;

  // ======================================================= a hen pecking (dir -1 / 1 faces left / right)
  P.hen = (x, y, s, t, dir = 1, ph = 0) => {
    const pk = Math.max(0, Math.sin(t * 3 + ph)) ** 3, hx = 52 + 10 * pk, hy = -78 + 44 * pk;
    return `<g transform="translate(${f(x)},${f(y)}) scale(${fs(s * dir)},${fs(s)})"><path d="M-60,-40 C-70,-90 -20,-110 30,-80 C60,-60 50,-20 20,-14 L-40,-14 C-58,-16 -62,-28 -60,-40Z" fill="#a8683a" ${olp(1.6)}/><path d="M-60,-60 C-90,-90 -86,-120 -70,-100 C-70,-80 -64,-70 -56,-60Z" fill="#5a3a20" ${olp(1.2)}/>` +
      `<path d="M-20,-60 C0,-70 20,-64 30,-50" stroke="#7a4a24" stroke-width="5" fill="none"/><path d="M-10,-14 L-14,0 M10,-14 L14,0" stroke="#d8a040" stroke-width="5"/>` +
      `<g transform="translate(${f(hx)},${f(hy)})"><circle cx="0" cy="0" r="22" fill="#b0703e" ${olp(1.4)}/><path d="M-8,-20 C-4,-36 10,-34 8,-18 C14,-30 24,-24 16,-14Z" fill="#c8322a" ${olp(1)}/><path d="M18,-2 L34,4 L18,10Z" fill="#e8b040" ${olp(1)}/><circle cx="6" cy="-4" r="3.4" fill="#141010"/><path d="M14,10 C18,20 12,26 8,20" fill="#c8322a"/></g>` +
      `<path d="M30,-70 C${f(hx - 20)},${f(hy + 10)} ${f(hx - 14)},${f(hy + 6)} ${f(hx - 6)},${f(hy + 4)}" stroke="#a8683a" stroke-width="22" fill="none" stroke-linecap="round"/></g>`;
  };

  // ======================================================= the crutch (grip frame: the handle in the fist, +x = up the
  // shaft to the armpit pad... drawn along -y from the foot at (0,0) instead, for free placement) and a walking stick
  P.crutch = (x, y, s, rot = 0) => `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)}) scale(${fs(s)})"><path d="M-6,0 L-8,-560 L8,-560 L6,0Z" fill="#8a6036" ${olp(1.6)}/><path d="M-60,-560 C-60,-590 60,-590 60,-560 L50,-546 L-50,-546Z" fill="#6a4426" ${olp(1.6)}/><rect x="-26" y="-330" width="52" height="16" rx="6" fill="#6a4426" ${olp(1.4)}/><path d="M-4,-540 L-4,-20" stroke="#c89a62" stroke-width="3" opacity="0.6"/><rect x="-10" y="-14" width="20" height="14" rx="4" fill="#3a2a1a"/></g>`;
  P.stick = (k = 1) => `<g transform="scale(${fs(k)})"><path d="M-6,-60 C-10,-40 -6,200 -4,420 L6,420 C6,200 10,-40 6,-60Z" fill="#7a5a34" ${olp(1.6)}/><path d="M-2,-40 L0,400" stroke="#b8925a" stroke-width="3" opacity="0.6"/></g>`;

  // ======================================================= your son's red cap lying in the grass (or held)
  P.redCap = (x, y, s, rot = 0) => `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)}) scale(${fs(s)})"><ellipse cx="0" cy="6" rx="90" ry="16" fill="#000" opacity="0.2" filter="url(#b4)"/><path d="M-80,0 C-80,-60 -30,-90 0,-90 C36,-90 80,-60 80,0Z" fill="#b8322a" ${olp(2)}/><path d="M-90,4 C-60,-16 60,-16 90,4 L84,20 C56,4 -56,4 -84,20Z" fill="#8a2420" ${olp(1.6)}/><circle cx="0" cy="-90" r="9" fill="#8a2420" ${olp(1.2)}/><path d="M-36,-70 C-10,-80 20,-78 44,-62" stroke="#e86a5a" stroke-width="5" fill="none" opacity="0.6"/></g>`;

  // ======================================================= a little dancing child seen from far away (the procession):
  // ph = step phase, col tunic, hair; arms swing, the body bobs, legs alternate
  P.kidSil = (x, y, s, t, col, hair, ph = 0, skin = '#e8c0a0') => {
    const w = t * 7 + ph, bob = Math.abs(Math.sin(w)) * 0, b = 6 * Math.sin(w * 2) ** 2, a = 0.6 * Math.sin(w), lg = 14 * Math.sin(w);
    return `<g transform="translate(${f(x)},${f(y - b * s)}) scale(${fs(s)})"><path d="M-8,-60 L${f(-10 - lg)},0 M8,-60 L${f(10 + lg)},0" stroke="${shade(col, -0.4)}" stroke-width="11" stroke-linecap="round"/>` +
      `<path d="M-24,-112 L24,-112 L30,-56 L-30,-56Z" fill="${col}" ${olp(1.2)}/><path d="M-22,-106 L${f(-44 - 10 * a)},${f(-140 - 20 * a)} M22,-106 L${f(44 - 10 * a)},${f(-140 + 20 * a)}" stroke="${shade(col, -0.1)}" stroke-width="10" stroke-linecap="round"/>` +
      `<circle cx="0" cy="-132" r="20" fill="${skin}" ${olp(1.2)}/><path d="M-20,-136 C-20,-160 20,-160 20,-136 C12,-146 -12,-146 -20,-136Z" fill="${hair}"/></g>` + (bob ? '' : '');
  };

  // ======================================================= the picture book at bedtime: an open book, the left page a coloured
  // drawing of the smiling Piper in red and yellow leading a parade of rats and children, the right page lines of text
  // (x,y) = the spine's foot, s scale; o.page 0..1 a page turning
  P.storybook = (x, y, s, t, o = {}) => {
    const id = uid('sb');
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${fs(s)})"><defs><clipPath id="${id}c"><path d="M-300,-360 L-12,-344 L-12,0 L-300,-12Z"/></clipPath></defs>`;
    g += `<path d="M-320,-372 C-200,-380 -60,-370 0,-350 C60,-370 200,-380 320,-372 L320,6 C200,-6 60,4 0,18 C-60,4 -200,-6 -320,6Z" fill="#7a2a24" ${olp(2)}/>`;
    g += `<path d="M-300,-360 C-190,-368 -60,-358 -6,-340 L-6,6 C-60,-6 -190,-14 -300,-8Z" fill="#f6eedc" ${olp(1.6)}/><path d="M300,-360 C190,-368 60,-358 6,-340 L6,6 C60,-6 190,-14 300,-8Z" fill="#f6eedc" ${olp(1.6)}/>`;
    // the drawing: green hill, blue sky, the Piper and the rats and children following
    g += `<g clip-path="url(#${id}c)"><rect x="-300" y="-360" width="300" height="360" fill="#bfe0f0"/><path d="M-300,-120 C-220,-170 -120,-160 -10,-200 L-10,0 L-300,0Z" fill="#7ab05a"/><circle cx="-60" cy="-300" r="28" fill="#f8d860"/>`;
    g += `<g transform="translate(-90,-150) scale(0.5)"><path d="M-40,-200 L40,-200 L60,0 L-60,0Z" fill="#c8322a" stroke="#20140c" stroke-width="3"/><path d="M0,-200 L40,-200 L60,0 L0,0Z" fill="#e8b830"/><circle cx="0" cy="-240" r="36" fill="#f0c8a8" stroke="#20140c" stroke-width="3"/><path d="M-40,-262 C-30,-320 30,-320 40,-262Z" fill="#e8b830" stroke="#20140c" stroke-width="3"/><path d="M30,-290 C70,-330 110,-300 120,-270" stroke="#fff" stroke-width="8" fill="none"/><path d="M-12,-232 q12,10 24,0" stroke="#20140c" stroke-width="4" fill="none"/><path d="M10,-224 L70,-140" stroke="#8a5a2a" stroke-width="10"/><path d="M-30,0 L-40,60 M30,0 L40,60" stroke="#2a5a3a" stroke-width="16"/></g>`;
    // (the rats are printed: they keep still, so nothing on the page jitters)
    for (let i = 0; i < 6; i++) { const rx = -170 - i * 26, ry = -88 + i * 10; g += `<g transform="translate(${f(rx)},${f(ry)})"><ellipse cx="0" cy="0" rx="14" ry="8" fill="#8a8078" stroke="#20140c" stroke-width="1.5"/><circle cx="12" cy="-4" r="6" fill="#8a8078" stroke="#20140c" stroke-width="1.5"/><path d="M-14,0 C-24,4 -28,-6 -36,-2" stroke="#d89a9a" stroke-width="2" fill="none"/></g>`; }
    for (let i = 0; i < 4; i++) g += `<g transform="translate(${-230 - i * 22},${-150 + i * 18}) scale(0.32)"><path d="M-30,-110 L30,-110 L36,-50 L-36,-50Z" fill="${['#4a7ab0', '#e8b830', '#7a3a8a', '#3a8a5a'][i]}" stroke="#20140c" stroke-width="3"/><circle cx="0" cy="-136" r="26" fill="#f0c8a8" stroke="#20140c" stroke-width="3"/><path d="M-12,-50 L-14,0 M12,-50 L14,0" stroke="#5a3a2a" stroke-width="10"/></g>`;
    g += `</g>`;
    // the text page and a decorated capital
    // (the capital is a shape, not live text: text snaps to the pixel grid as it scales, and twitches)
    g += `<rect x="40" y="-320" width="70" height="70" fill="#c8322a" opacity="0.85"/><path fill-rule="evenodd" d="M53,-285 a22,24 0 1,0 44,0 a22,24 0 1,0 -44,0 Z M64,-285 a11,20 0 1,0 22,0 a11,20 0 1,0 -22,0 Z" fill="#f6eedc"/>`;
    for (let i = 0; i < 12; i++) g += `<path d="M${i < 3 ? 124 : 40},${-300 + i * 24} L${260 - (i % 4) * 14},${-300 + i * 24}" stroke="#6a5a4a" stroke-width="5" opacity="0.55" stroke-linecap="round"/>`;
    g += `<path d="M0,-344 L0,14" stroke="#c8b898" stroke-width="3"/>`;
    return g + '</g>';
  };
})(window);
