// "The Taster" — cast. Engine person() heads + emoFace; bodies are whole garments (torso + upper arms in ONE filter
// group, so no joint shows), forearms + hands in front, IK arms with explicit bends. Local coordinates as person():
// head centre ~(0,-1075), adult waist ~-650; the boy's feet at y = -300 (child body, placed with kidb).

SKIN_TONES.porcelain = { hi: '#f7e4d8', mid: '#e8cbbb', lo: '#c09c8c', ear: '#e0bcaa', earDk: '#cca898', neck: '#d8b6a4', shade: '#ae8676', deep: '#9a7466',
  blush: '#e09a8e', nostril: '#6e4a40', line: '#9e7468', lip: '#a83a3e', mouth: '#6a2428', rim: '#7e5048' };
SKIN_TONES.ruddy = { hi: '#f2c8aa', mid: '#dca07e', lo: '#b06c50', ear: '#d08e70', earDk: '#b8785c', neck: '#c4866a', shade: '#9a5a44', deep: '#884a36',
  blush: '#e0705a', nostril: '#5a2a1e', line: '#8a4a36', lip: '#c06a5a', mouth: '#6a2a20', rim: '#7a3424' };
const SKB = SKIN_TONES.fair, SKQ = SKIN_TONES.porcelain, SKR = SKIN_TONES.ruddy;
const handAng = A => Math.atan2(A.wr[1] - A.el[1], A.wr[0] - A.el[0]) * 180 / Math.PI - 90 + (A.hrot || 0);

addDefs(`
  <linearGradient id="goldG2" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f6dc8a"/><stop offset=".35" stop-color="#d8a845"/><stop offset=".7" stop-color="#a87422"/><stop offset="1" stop-color="#5e3c0e"/></linearGradient>
  <linearGradient id="silverG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f0f2f4"/><stop offset=".4" stop-color="#bcc2c8"/><stop offset="1" stop-color="#5e646c"/></linearGradient>
  <linearGradient id="wineG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a1424"/><stop offset="1" stop-color="#3a0610"/></linearGradient>
  <linearGradient id="glassV" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#cfe4dc"/><stop offset=".5" stop-color="#8ab0a4"/><stop offset="1" stop-color="#4a6a62"/></linearGradient>
`);

// ---------- props ----------
// the king's goblet: gold bowl, gems, stem, foot. (x, y) = centre of the bowl's rim; tilt in deg; wine 0..1 level
function goblet(x, y, s = 1, { tilt = 0, wine = .8, gems = 1, col = 'goldG2' } = {}) {
  return `<g transform="translate(${F1(x)} ${F1(y)}) rotate(${F1(tilt)}) scale(${s})">
    <path d="M-50 0 C-50 54 -30 86 0 92 C30 86 50 54 50 0 Z" fill="url(#${col})" filter="url(#pcl)"/>
    <path d="M-10 90 L-8 150 L8 150 L10 90 Z" fill="url(#${col})" filter="url(#pcs)"/><ellipse cx="0" cy="120" rx="15" ry="9" fill="url(#${col})" filter="url(#pcs)"/>
    <path d="M-44 168 C-40 150 40 150 44 168 Z" fill="url(#${col})" filter="url(#pcl)"/>
    <ellipse cx="0" cy="0" rx="50" ry="11" fill="#5a3a10"/>
    ${wine > .02 ? `<ellipse cx="0" cy="${F1(2 + (1 - wine) * 6)}" rx="${F1(44 - (1 - wine) * 6)}" ry="8" fill="url(#wineG)"/><ellipse cx="-14" cy="${F1(1 + (1 - wine) * 6)}" rx="14" ry="2.5" fill="#c84050" opacity=".55"/>` : ''}
    <path d="M-50 0 C-50 54 -30 86 0 92" stroke="#fff3c8" stroke-width="4" fill="none" opacity=".45"/>
    <path d="M-46 22 Q0 34 46 22" stroke="#7a5214" stroke-width="5" fill="none" opacity=".7"/>
    ${gems ? `<circle cx="0" cy="44" r="8" fill="#a8142a"/><circle cx="-2" cy="42" r="2.5" fill="#fff" opacity=".8"/><circle cx="-28" cy="38" r="5" fill="#1e4aa8"/><circle cx="28" cy="38" r="5" fill="#1e7a4a"/>` : ''}</g>`;
}
// a plain pewter cup (the taster's "every cup", the king's second cup)
function pewterCup(x, y, s = 1, { tilt = 0, wine = .7 } = {}) {
  return `<g transform="translate(${F1(x)} ${F1(y)}) rotate(${F1(tilt)}) scale(${s})">
    <path d="M-40 0 L40 0 L34 100 C30 110 -30 110 -34 100 Z" fill="url(#silverG)" filter="url(#pcl)"/>
    <ellipse cx="0" cy="0" rx="40" ry="10" fill="#3a3e44"/>${wine > .02 ? `<ellipse cx="0" cy="3" rx="35" ry="7" fill="url(#wineG)"/>` : ''}
    <path d="M-36 30 L36 30 M-34 84 L34 84" stroke="#4a4e54" stroke-width="3" opacity=".6"/>
    <path d="M40 20 C66 20 68 66 38 70" stroke="#8a9098" stroke-width="9" fill="none"/></g>`;
}
// a pewter platter with a roast and a little bread
function platter(x, y, s = 1, { leg = 1, bite = 0, legRot = -60 } = {}) {
  return `<g transform="translate(${F1(x)} ${F1(y)}) scale(${s})">
    <ellipse cx="0" cy="0" rx="190" ry="46" fill="#8e949a" filter="url(#pcl)"/><ellipse cx="0" cy="-6" rx="160" ry="34" fill="#b4bac0"/>
    <path d="M-150 -10 Q0 18 150 -10" stroke="#6e747a" stroke-width="3" fill="none" opacity=".5"/>
    ${breadLoaf(-90, -24, .6)}${leg ? roastLeg(40, -60, .7, legRot, bite) : ''}</g>`;
}
// a candlestick with a live flame (the table key lights). (x, y) = foot on the table
function tableCandle(x, y, t, s = 1, seed = 1) {
  const sw = Math.sin(t * 9.1 + seed) * 2 * seamW(t) + Math.sin(t * 13.7 + seed * 2) * 1.2 * seamW(t), hh = 1 + .07 * Math.sin(t * 11 + seed) * seamW(t);
  return `<g transform="translate(${F1(x)} ${F1(y)}) scale(${s})">
    <circle cx="0" cy="-190" r="120" fill="url(#candleGlow)" style="mix-blend-mode:screen"/>
    <path d="M-34 0 C-34 -14 34 -14 34 0 Z" fill="url(#goldG2)" filter="url(#pcs)"/><path d="M-7 -8 L-5 -86 L5 -86 L7 -8 Z" fill="url(#goldG2)" filter="url(#pcs)"/>
    <path d="M-22 -86 C-22 -96 22 -96 22 -86 Z" fill="url(#goldG2)" filter="url(#pcs)"/>
    <path d="M-12 -92 L-11 -170 C-6 -176 6 -176 11 -170 L12 -92 Z" fill="#efe6cc" filter="url(#pcs)"/>
    <path d="M0 -172 L0 -180" stroke="#2a1a10" stroke-width="2.2"/>
    <g transform="translate(${F1(sw * .4)} -178) scale(1 ${F1(hh)})"><path d="M0 -40 C${F1(8 + sw)} -22 10 -8 0 2 C-10 -8 ${F1(-8 + sw * .5)} -22 0 -40 Z" fill="url(#flameG)"/>
      <ellipse cx="0" cy="-6" rx="3.2" ry="5.5" fill="#4a7ac8" opacity=".5"/></g></g>`;
}
// a small glass vial with a cork; tip 0..1 tips it toward its mouth (rotation about the cork)
function vial(x, y, s = 1, { rot = 0, cork = 1, fill = .6 } = {}) {
  return `<g transform="translate(${F1(x)} ${F1(y)}) rotate(${F1(rot)}) scale(${s})">
    <path d="M-9 -30 L9 -30 L9 -18 C20 -10 22 6 22 22 C22 40 -22 40 -22 22 C-22 6 -20 -10 -9 -18 Z" fill="url(#glassV)" filter="url(#pcs)"/>
    <path d="M-20 ${F1(36 - 50 * fill)} L20 ${F1(36 - 50 * fill)} L21 24 C21 38 -21 38 -21 24 Z" fill="#3a6a4a" opacity=".85"/>
    <path d="M-14 0 C-16 10 -16 20 -12 30" stroke="#fff" stroke-width="3" fill="none" opacity=".6"/>
    ${cork ? `<rect x="-8" y="-44" width="16" height="16" rx="3" fill="#a8783e"/>` : ''}</g>`;
}

// ---------- the taster (12): mop of dark hair, the king's livery (blue tabard, gold trim) over a cream shirt ----------
const tArm = (k, T, hand = 'back', o = {}) => ({ ...autoIK(k, [k * 104, -932], T, 118, 110, o.bend), hand, ...o });
const tHang = (k, dx = 0, dy = 0, o = {}) => tArm(k, [k * (122 + dx), -716 + dy], 'back', { bend: -k, curl: .3, ...o });
function tasterBody({ shirt = '#d8ccb0', tabard = '#2c3c6e', trim = '#c8a040', hose = '#3a3430', shoe = '#2a1d14' } = {}) {
  return ({ g, S, sk, e }) => {
    const id = g('tb'), td = darken(tabard, .4);
    const L = e.armL || tHang(-1), R = e.armR || tHang(1);
    const up = (A, k) => capsuleD(k * 104, -930, 25, lerp(k * 104, A.el[0], .95), lerp(-930, A.el[1], .95), 21);
    const fa = (k, A) => forearm(k, A, { r2: 19, r3: 15, S, sk, sleeve: shirt, long: true, hs: 1.05 });
    const body = 'M-44 -998 C-80 -992 -108 -978 -120 -952 C-128 -900 -126 -800 -122 -706 C-124 -666 -126 -626 -128 -596 Q0 -580 128 -596 C126 -626 124 -666 122 -706 C126 -800 128 -900 120 -952 C108 -978 80 -992 44 -998 Z';
    const tab = 'M-58 -994 C-84 -988 -104 -974 -110 -956 L-104 -560 Q0 -540 104 -560 L110 -956 C104 -974 84 -988 58 -994 C40 -966 -40 -966 -58 -994 Z';
    const torso = `<g filter="url(#pcl)" fill="url(#${id}s)"><path d="${body}"/><path d="${up(L, -1)}"/><path d="${up(R, 1)}"/></g>
      <path d="${tab}" fill="url(#${id}t)" filter="url(#pcl)"/>
      <path d="${tab}" fill="none" stroke="${trim}" stroke-width="7" opacity=".9"/>
      <path d="M-58 -994 C-40 -966 40 -966 58 -994" stroke="${trim}" stroke-width="6" fill="none"/>
      <g transform="translate(0 -860)"><path d="M-30 14 L-30 -10 L-18 4 L0 -18 L18 4 L30 -10 L30 14 Z" fill="${trim}" filter="url(#pcs)"/><circle cx="0" cy="-22" r="4" fill="${trim}"/></g>
      <g filter="url(#softW)" opacity=".45"><path d="M-80 -940 C-84 -840 -84 -720 -80 -580 M80 -940 C84 -840 84 -720 80 -580" stroke="${td}" stroke-width="10" fill="none"/></g>
      <path d="M-112 -712 Q0 -696 112 -712" stroke="#4a2e18" stroke-width="13" fill="none" stroke-linecap="round"/><rect x="-12" y="-718" width="24" height="18" rx="3" fill="none" stroke="${trim}" stroke-width="3"/>`;
    const legs = [-1, 1].map(k => `<g ${legTf(k, e, -600, -300)}><path d="${mx(k, 'M -70 -580 C -72 -500 -66 -420 -60 -340 L -22 -340 C -20 -420 -18 -500 -16 -580 Z')}" fill="${hose}" filter="url(#pc)"/>
      <path d="${mx(k, 'M -64 -346 C -80 -338 -88 -320 -84 -302 L -16 -300 C -14 -318 -18 -336 -24 -346 Z')}" fill="${shoe}" filter="url(#pcl)"/></g>`).join('');
    return `<defs>${linG(id + 's', [lighten(shirt, .15), shirt, darken(shirt, .25)], { user: [-135, 0, 135, 0] })}${linG(id + 't', [lighten(tabard, .2), tabard, darken(tabard, .32)], { user: [-115, 0, 115, 0] })}</defs>
      ${e.bust ? '' : legs}${softNeck(S, sk, 33, -960)}<path d="M-40 -1000 Q0 -978 40 -1000 L36 -984 Q0 -964 -36 -984 Z" fill="${shirt}" filter="url(#pcsl)"/>${torso}${fa(-1, L)}${fa(1, R)}`;
  };
}
// face extras: the mop of hair (moves a little less than the features when he turns), puffed cheeks (wine held in
// the mouth), the tongue out (the drop), a forced grin, sweat
const tasterFace = ({ g, S, e }) => {
  const puff = e.puff || 0, tongue = e.tongue || 0;
  return `<g transform="translate(${F1(-(e.turn || 0) * 11)} 0)">${boyHair(g, 1, '#2e1e14')}</g>
    ${puff > .01 ? `<g opacity="${Math.min(1, puff * 1.5).toFixed(2)}">${[-1, 1].map(k => `<ellipse cx="${k * 58}" cy="-1028" rx="${F1(10 + 18 * puff)}" ry="${F1(14 + 12 * puff)}" fill="${S.mid}"/>
        <path d="M${k * 40} -1050 Q${k * (64 + 18 * puff)} ${F1(-1040)} ${k * 46} -1004" stroke="${S.shade}" stroke-width="2.4" fill="none" opacity=".35"/>
        <ellipse cx="${k * 56}" cy="-1040" rx="9" ry="6" fill="#fff" opacity=".35"/>`).join('')}
      <ellipse cx="-44" cy="-1034" rx="14" ry="9" fill="#e0807a" opacity=".3"/><ellipse cx="44" cy="-1034" rx="14" ry="9" fill="#e0807a" opacity=".3"/>
      <path d="M-10 -1011 Q0 -1014 10 -1011" stroke="${S.mouth}" stroke-width="3.4" fill="none" stroke-linecap="round"/></g>` : ''}
    ${tongue > .02 ? `<path d="M-12 ${F1(-1004)} C-12 ${F1(-1004 + 22 * tongue)} 12 ${F1(-1004 + 22 * tongue)} 12 -1004 Z" fill="#d86a6a"/><path d="M0 -1002 L0 ${F1(-1002 + 14 * tongue)}" stroke="#a84848" stroke-width="1.6" opacity=".6"/>` : ''}
    ${emoFace({ g, e: { blush: .45, ...e }, bw: 7, browCol: '#2a1a10', eyes: { iris: '#5a3e24', size: 1.08 } })}`;
};
const TASTER = { skin: 'fair', hair: 'bald', beard: 'none', child: true, eyeColor: '#5a3e24', browW: .01, id: 'ts', body: tasterBody(), faceExtra: tasterFace };

// ---------- the king: big, red-bearded, crowned; red velvet robe with an ermine cape, a heavy gold chain ----------
const kArm2 = (k, T, hand = 'back', o = {}) => ({ ...autoIK(k, [k * 150, -932], T, 178, 168, o.bend), hand, ...o });
const kHang = (k, dx = 0, dy = 0, o = {}) => kArm2(k, [k * (168 + dx), -600 + dy], 'back', { bend: -k, curl: .3, ...o });
function kingBody({ robe = '#8a2026', ermine = '#eee8dc' } = {}) {
  return ({ g, S, sk, e }) => {
    const id = g('kg'), rd = darken(robe, .45);
    const L = e.armL || kHang(-1), R = e.armR || kHang(1);
    const up = (A, k) => capsuleD(k * 146, -928, 40, lerp(k * 146, A.el[0], .96), lerp(-928, A.el[1], .96), 34);
    const fa = (k, A) => { const { el, wr } = A, d = unit(el, wr);
      return forearm(k, A, { r2: 32, r3: 26, S, sk, sleeve: robe, long: true, hs: 1.75 })
        + `<g filter="url(#pcsl)" fill="${ermine}"><path d="${band([wr[0] - d[0] * 30, wr[1] - d[1] * 30], d, 38, 30, 4)}"/></g>
           ${[-1, 1].map(j => `<ellipse cx="${F1(wr[0] - d[0] * 30 + d[1] * j * 16)}" cy="${F1(wr[1] - d[1] * 30 - d[0] * j * 16)}" rx="3" ry="5" fill="#1a1414"/>`).join('')}`; };
    const body = 'M-70 -1000 C-130 -994 -176 -978 -190 -944 C-200 -880 -200 -760 -196 -560 Q0 -530 196 -560 C200 -760 200 -880 190 -944 C176 -978 130 -994 70 -1000 Z';
    const torso = `<g filter="url(#pcl)" fill="url(#${id}r)"><path d="${body}"/><path d="${up(L, -1)}"/><path d="${up(R, 1)}"/></g>
      <g filter="url(#softW)" opacity=".5"><path d="M-130 -900 C-136 -800 -136 -700 -130 -580 M120 -900 C126 -800 126 -700 120 -580 M-30 -880 C-34 -780 -34 -680 -30 -580" stroke="${rd}" stroke-width="14" fill="none"/></g>
      <path d="M-26 -960 L-20 -560 M26 -960 L20 -560" stroke="#d8a845" stroke-width="7" opacity=".85"/>`;
    // the ermine cape over the shoulders: white fur with black tails, one shape
    const cape = `M-76 -1006 C-140 -1000 -200 -980 -214 -930 C-222 -896 -216 -860 -200 -840 C-150 -826 -100 -840 -60 -870 C-30 -890 30 -890 60 -870 C100 -840 150 -826 200 -840 C216 -860 222 -896 214 -930 C200 -980 140 -1000 76 -1006 C40 -980 -40 -980 -76 -1006 Z`;
    const tails = [[-170, -900], [-120, -870], [-70, -900], [-190, -940], [-140, -950], [70, -900], [120, -870], [170, -900], [190, -940], [140, -950], [-20, -930], [20, -930]].map(([x, y]) => `<path d="M${x} ${y} l-4 12 l4 6 l4 -6 Z" fill="#141010"/>`).join('');
    const chain = `<path d="M-120 -900 Q0 -760 120 -900" stroke="#d8a845" stroke-width="12" fill="none" stroke-dasharray="14 6" filter="url(#pcs)"/>
      <circle cx="0" cy="-812" r="26" fill="url(#goldG2)" filter="url(#pcsl)"/><circle cx="0" cy="-812" r="11" fill="#a8142a"/><circle cx="-4" cy="-816" r="3" fill="#fff" opacity=".7"/>`;
    return `<defs>${linG(id + 'r', [lighten(robe, .2), robe, darken(robe, .35)], { user: [-200, 0, 200, 0] })}</defs>
      ${softNeck(S, sk, 46, -960)}${torso}<path d="${cape}" fill="${ermine}" filter="url(#pcl)"/>${tails}${chain}${fa(-1, L)}${fa(1, R)}`;
  };
}
// the king's face: ruddy cheeks, heavy brows; laugh 0..1 = a big open laugh through the beard
const kingFace = ({ g, e }) => {
  const lg = e.laugh || 0;
  return `<g clip-path="url(#${g('face')})"><g filter="url(#softW)"><ellipse cx="-44" cy="-1040" rx="22" ry="14" fill="#d8604c" opacity=".35"/><ellipse cx="44" cy="-1040" rx="22" ry="14" fill="#d8604c" opacity=".32"/><ellipse cx="0" cy="-1046" rx="11" ry="10" fill="#d8604c" opacity=".3"/></g></g>
    ${lg > .02 ? `<path d="M-30 -1014 C-28 ${F1(-1012 + 34 * lg)} 28 ${F1(-1012 + 34 * lg)} 30 -1014 Q0 -1020 -30 -1014 Z" fill="#3a1010"/>
      <path d="M-26 -1014 Q0 -1019 26 -1014 L24 -1006 Q0 -1010 -24 -1006 Z" fill="#efe6d6"/>
      <ellipse cx="0" cy="${F1(-1012 + 26 * lg)}" rx="${F1(14 * lg)}" ry="${F1(6 * lg)}" fill="#c05050"/>
      <path d="M-34 -1020 C-20 -1034 -6 -1032 0 -1026 C6 -1032 20 -1034 34 -1020 C24 -1012 10 -1014 0 -1018 C-10 -1014 -24 -1012 -34 -1020 Z" fill="url(#${g('hair')})" filter="url(#pcs)"/>` : ''}
    ${emoFace({ g, e: { blush: .2, ...e }, bw: 13, browCol: '#4a2410', eyes: { iris: '#4a3626', size: .9, lash: '#1e120a' } })}`;
};
const KING = { skin: 'ruddy', hair: 'short', hairColor: 'red', beard: 'full', hat: 'crown', eyeColor: '#4a3626', browW: .01, id: 'kn', body: kingBody(), faceExtra: kingFace };

// ---------- the queen: pale, black hair in coils under a gold crown, emerald gown with gold trim ----------
const qArm = (k, T, hand = 'back', o = {}) => ({ ...autoIK(k, [k * 118, -928], T, 160, 150, o.bend), hand, ...o });
const qRest = (k, dx = 0, dy = 0, o = {}) => qArm(k, [k * (90 + dx), -690 + dy], 'back', { bend: -k, ...o });
const queenBackHair = `<path d="M-100 -1120 C-120 -1060 -124 -980 -118 -900 C-96 -884 -64 -892 -40 -912 L40 -912 C64 -892 96 -884 118 -900 C124 -980 120 -1060 100 -1120 C86 -1192 -86 -1192 -100 -1120 Z" fill="#17110e" filter="url(#pcl)"/>`;
function queenHair() {
  const side = 'M0 -1194 C-62 -1196 -96 -1150 -98 -1090 C-100 -1046 -98 -1004 -90 -968 C-84 -972 -78 -986 -76 -1006 C-74 -1050 -72 -1100 -56 -1130 C-40 -1150 -16 -1154 0 -1144 Z';
  return ({ g }) => `<g filter="url(#pcsl)" fill="#1c1410"><path d="${side}"/><path d="${mx(1, side)}"/></g>
    <path d="M-2 -1194 L2 -1146" stroke="#060404" stroke-width="2.4" opacity=".7"/>
    <path d="M-66 -1160 C-82 -1120 -86 -1060 -84 -1000 M66 -1160 C82 -1120 86 -1060 84 -1000" stroke="#4a3c34" stroke-width="3" fill="none" opacity=".55"/>
    <path d="M-50 -1180 C-30 -1192 -14 -1194 -4 -1190" stroke="#6a5a50" stroke-width="5" fill="none" opacity=".5" filter="url(#softW2)"/>
    <path d="M-80 -1162 L-84 -1240 L-56 -1200 L-30 -1258 L0 -1206 L30 -1258 L56 -1200 L84 -1240 L80 -1162 Q0 -1176 -80 -1162 Z" fill="url(#goldG2)" filter="url(#pcl)"/>
    <path d="M-80 -1172 Q0 -1188 80 -1172 L80 -1158 Q0 -1172 -80 -1158 Z" fill="#b8862e"/>
    ${[[-30, -1250], [30, -1250], [-84, -1232], [84, -1232], [0, -1196]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i === 4 ? 8 : 6}" fill="${i === 4 ? '#1e7a4a' : '#e8e0d0'}"/>`).join('')}
    <path d="M-60 -1166 L-60 -1150 M60 -1166 L60 -1150" stroke="#d8a845" stroke-width="3"/><circle cx="-60" cy="-1146" r="4" fill="#d8a845"/><circle cx="60" cy="-1146" r="4" fill="#d8a845"/>`;
}
const queenFace = ({ g, e }) => {
  const sm = e.smirk ?? 0, op = e.lipOpen || 0, pale = e.pale || 0;
  return `<g clip-path="url(#${g('face')})">
      <g filter="url(#softW)"><ellipse cx="-50" cy="-1040" rx="14" ry="24" fill="#9a6a62" opacity=".22"/><ellipse cx="50" cy="-1040" rx="14" ry="24" fill="#9a6a62" opacity=".25"/>
        <ellipse cx="-28" cy="-1094" rx="22" ry="7" fill="#5a4a5a" opacity=".22"/><ellipse cx="28" cy="-1094" rx="22" ry="7" fill="#5a4a5a" opacity=".22"/></g>
      ${pale > .01 ? `<path d="${FACE}" fill="#eef1f4" opacity="${(.5 * pale).toFixed(2)}"/>` : ''}</g>
    <path d="M-20 -1013 Q-10 ${F1(-1019 - sm * 2)} 0 -1015 Q10 ${F1(-1019 - sm * 2)} 20 -1013 Q${F1(23 + sm * 3)} ${F1(-1015 - sm * 5)} ${F1(24 + sm * 3)} ${F1(-1016 - sm * 6)} Q10 ${F1(-1010 + op * 6)} 0 ${F1(-1010 + op * 6)} Q-10 ${F1(-1010 + op * 6)} ${F1(-24 - sm * 3)} ${F1(-1016 - sm * 6)} Q${F1(-23 - sm * 3)} ${F1(-1015 - sm * 5)} -20 -1013 Z" fill="#9a2a34"/>
    ${op > .05 ? `<path d="M-14 -1012 Q0 ${F1(-1008 + op * 6)} 14 -1012 Q0 ${F1(-1006 + op * 4)} -14 -1012 Z" fill="#3a0e12"/>` : ''}
    <path d="M-18 -1012 Q0 ${F1(-1002 + op * 4)} 18 -1012 Q0 -1004 -18 -1012 Z" fill="#b8404a"/>
    <ellipse cx="-6" cy="-1008" rx="5" ry="1.6" fill="#fff" opacity=".35"/>
    ${emoFace({ g, e: { blush: .1, ...e }, bw: 6, browCol: '#120c0a', eyes: { iris: '#3e6a4a', size: .98, lash: '#0a0606' } })}`;
};
function queenGown({ gown = '#1d4a3c', trim = '#d0a848', chem = '#e8dcc6' } = {}) {
  return ({ g, S, sk, e }) => {
    const id = g('qg');
    const L = e.armL || qRest(-1), R = e.armR || qRest(1);
    const up = (A, k) => capsuleD(k * 116, -926, 26, lerp(k * 116, A.el[0], .95), lerp(-926, A.el[1], .95), 22);
    const fa = (k, A) => { const { wr, el } = A, d = unit(el, wr);
      return forearm(k, A, { r2: 20, r3: 16, S, sk, sleeve: gown, long: true, hs: 1.25 }) + `<path d="${band([wr[0] - d[0] * 22, wr[1] - d[1] * 22], d, 24, 14, 3)}" fill="${trim}" filter="url(#pcs)"/>`; };
    const body = 'M-54 -996 C-100 -990 -132 -972 -140 -944 C-146 -890 -140 -800 -128 -700 C-132 -660 -140 -620 -150 -560 Q0 -540 150 -560 C140 -620 132 -660 128 -700 C140 -800 146 -890 140 -944 C132 -972 100 -990 54 -996 Z';
    const torso = `<g filter="url(#pcl)" fill="url(#${id}g)"><path d="${body}"/><path d="${up(L, -1)}"/><path d="${up(R, 1)}"/></g>
      <path d="M-62 -990 L-56 -900 Q0 -880 56 -900 L62 -990 Q0 -972 -62 -990 Z" fill="${chem}" filter="url(#pcs)"/>
      <path d="M-62 -990 L-56 -900 Q0 -880 56 -900 L62 -990" stroke="${trim}" stroke-width="8" fill="none"/>
      <path d="M-128 -706 Q0 -686 128 -706" stroke="${trim}" stroke-width="9" fill="none"/>
      <g filter="url(#softW)" opacity=".45"><path d="M-96 -880 C-100 -800 -98 -720 -96 -600 M96 -880 C100 -800 98 -720 96 -600" stroke="${darken(gown, .55)}" stroke-width="12" fill="none"/></g>
      <path d="M-40 -968 Q0 -936 40 -968" stroke="#d8a845" stroke-width="4" fill="none"/><path d="M0 -948 L-9 -930 L0 -912 L9 -930 Z" fill="#1e7a4a" filter="url(#pcs)"/>`;
    return `<defs>${linG(id + 'g', [lighten(gown, .2), gown, darken(gown, .35)], { user: [-150, 0, 150, 0] })}</defs>
      ${queenBackHair}${softNeck(S, sk, 30, -950)}${torso}${fa(-1, L)}${fa(1, R)}`;
  };
}
const QUEEN = { skin: 'porcelain', hair: 'bald', beard: 'none', hat: 'queen', customHat: queenHair(), ears: () => '', eyeColor: '#3e6a4a', browW: .01, id: 'qn',
  body: queenGown(), faceExtra: queenFace };

// ---------- nobles in the hall: head + a simple robed bust (the tables hide the rest) ----------
function nobleBust({ col = '#5a3a2a', trim = '#c8a040' } = {}) {
  return ({ g, S, sk }) => `${softNeck(S, sk, 36, -960)}<path d="M-56 -998 C-110 -990 -150 -972 -160 -940 C-168 -880 -164 -760 -160 -560 Q0 -540 160 -560 C164 -760 168 -880 160 -940 C150 -972 110 -990 56 -998 C30 -974 -30 -974 -56 -998 Z" fill="${col}" filter="url(#pcl)"/>
    <path d="M-56 -998 C-30 -974 30 -974 56 -998" stroke="${trim}" stroke-width="7" fill="none"/><g filter="url(#softW)" opacity=".45"><path d="M-110 -930 C-114 -820 -112 -700 -108 -580 M110 -930 C114 -820 112 -700 108 -580" stroke="${darken(col, .5)}" stroke-width="12" fill="none"/></g>`;
}
const nobleFace = ({ g, e }) => emoFace({ g, e: { blush: .2, ...e }, bw: 8, browCol: '#2a1a10', eyes: { iris: '#4a3a2a', size: .95 } });
const NOBLE_SPECS = [
  { skin: 'light', hair: 'short', hairColor: 'brown', beard: 'full', col: '#4a3e6a' }, { skin: 'fair', hair: 'long', hairColor: 'blonde', beard: 'none', col: '#7a2a3a' },
  { skin: 'medium', hair: 'short', hairColor: 'black', beard: 'mustache', col: '#2e5a4a' }, { skin: 'light', hair: 'bald', hairColor: 'grey', beard: 'full', col: '#6a4a24' },
  { skin: 'fair', hair: 'long', hairColor: 'red', beard: 'none', col: '#3a4a6a' }, { skin: 'olive', hair: 'short', hairColor: 'brown', beard: 'stubble', col: '#5a2a2a' },
  { skin: 'light', hair: 'long', hairColor: 'brown', beard: 'none', col: '#4a5a2e' }, { skin: 'medium', hair: 'short', hairColor: 'grey', beard: 'full', col: '#2e3a5a' },
];
const NOBLES = NOBLE_SPECS.map((s, i) => ({ skin: s.skin, hair: s.hair, hairColor: s.hairColor, beard: s.beard, hat: i % 3 === 0 ? 'cap' : 'none', hatColor: darken(s.col, .3),
  browW: .01, id: 'nb' + i, body: nobleBust({ col: s.col }), faceExtra: nobleFace }));
