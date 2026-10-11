// "The Keeper" — cast. Same recipe as the Lullaby cast: engine person() head + emoFace, bodies drawn as whole garments
// (torso + upper arms in ONE filter group so no joint shows), forearms + hands in front, IK arms from cast.js.
// Local coordinates as person(): head centre ~(0,-1075), adult feet at y = 0; the boy's feet at y = -300 (kidb).

// a weathered, wind-burnt skin for the old keeper
SKIN_TONES.weathered = { hi: '#efc8ac', mid: '#d4a082', lo: '#a66e56', ear: '#c99276', earDk: '#b27c62', neck: '#bd876a', shade: '#925e48', deep: '#82503c',
  blush: '#d77e68', nostril: '#5a3024', line: '#84503e', lip: '#b67060', mouth: '#683428', rim: '#723626' };
const SKW = SKIN_TONES.weathered;

// ---------- the keeper: grey hair and beard, a knitted watch cap, a navy fisherman's gansey, dark trousers, boots ----------
function watchCap({ col = '#5c2c29' } = {}) {
  return ({ g }) => `<defs>${linG(g('wc'), [lighten(col, .16), col, darken(col, .35)], { user: [-100, 0, 100, 0] })}</defs>
    <path d="M-86 -1110 C-94 -1186 -54 -1240 0 -1242 C54 -1240 94 -1186 86 -1110 C60 -1124 30 -1130 0 -1130 C-30 -1130 -60 -1124 -86 -1110 Z" fill="url(#${g('wc')})" filter="url(#pcl)"/>
    <path d="M-92 -1104 C-94 -1124 -92 -1140 -88 -1152 C-56 -1166 56 -1166 88 -1152 C92 -1140 94 -1124 92 -1104 C60 -1120 30 -1126 0 -1126 C-30 -1126 -60 -1120 -92 -1104 Z" fill="${darken(col, .08)}" filter="url(#pcsl)"/>
    <g stroke="${darken(col, .4)}" stroke-width="2.4" opacity=".55">${Array.from({ length: 17 }, (_, i) => { const x = -84 + i * 10.5; return `<path d="M${F1(x)} ${F1(-1150 + Math.abs(x) * .03)} L${F1(x * 1.02)} ${F1(-1112 + Math.abs(x) * .08)}"/>`; }).join('')}</g>
    <g stroke="${darken(col, .3)}" stroke-width="2" fill="none" opacity=".35">${[-50, -18, 18, 50].map(x => `<path d="M${x} -1164 C${x * .9} -1190 ${x * .7} -1214 ${x * .4} -1234"/>`).join('')}</g>
    <path d="M-50 -1220 C-24 -1236 24 -1238 52 -1222" stroke="${lighten(col, .35)}" stroke-width="7" fill="none" opacity=".35" filter="url(#softW2)"/>`;
}
// face extras: forehead lines, crow's feet, heavy lids, weathered cheeks
const keeperFace = ({ g, e }) => `<g clip-path="url(#${g('face')})"><g filter="url(#softW)">
    <ellipse cx="-30" cy="-1066" rx="20" ry="7" fill="#6a4438" opacity=".3"/><ellipse cx="30" cy="-1066" rx="20" ry="7" fill="#6a4438" opacity=".3"/>
    <ellipse cx="-44" cy="-1042" rx="20" ry="12" fill="#c8604c" opacity=".26"/><ellipse cx="44" cy="-1042" rx="20" ry="12" fill="#c8604c" opacity=".22"/>
    <ellipse cx="0" cy="-1048" rx="10" ry="9" fill="#c8604c" opacity=".2"/></g>
    ${e.pale ? `<path d="${FACE}" fill="#e6ebef" opacity="${(.45 * e.pale).toFixed(2)}"/>` : ''}</g>
  <g stroke="#84503e" fill="none" stroke-linecap="round" opacity=".5">
    <path d="M-34 ${F1(-1118 - (e.bIn || 0) * .4)} Q0 ${F1(-1124 - (e.bIn || 0) * .6)} 34 ${F1(-1118 - (e.bIn || 0) * .4)}" stroke-width="2.2"/>
    <path d="M-26 ${F1(-1127 - (e.bIn || 0) * .5)} Q0 ${F1(-1132 - (e.bIn || 0) * .7)} 26 ${F1(-1127 - (e.bIn || 0) * .5)}" stroke-width="1.8"/>
    ${[-1, 1].map(k => `<path d="M${k * 54} -1088 l${k * 9} -5 M${k * 55} -1082 l${k * 10} 0 M${k * 54} -1076 l${k * 9} 5" stroke-width="1.6"/>`).join('')}
    <path d="M-40 -1070 Q-28 -1063 -16 -1068 M40 -1070 Q28 -1063 16 -1068" stroke-width="1.6"/></g>
  ${emoFace({ g, e: { blush: .1, ...e }, bw: 12, browCol: '#8e877c', eyes: { iris: '#5a6c7c', size: .92, lash: '#2a1c14' } })}`;

function keeperBody({ pose = 'stand', knit = '#2e3b55', trousers = '#2e2b29', boot = '#1e1712' } = {}) {
  return ({ g, S, sk, e }) => {
    const id = g('kb'), kd = darken(knit, .38), kh = lighten(knit, .2);
    const L = e.armL || uHang(-1), R = e.armR || uHang(1);
    const up = (A, k) => capsuleD(k * 138, -928, 35, lerp(k * 138, A.el[0], .96), lerp(-928, A.el[1], .96), 30);
    const fa = (k, A) => forearm(k, A, { r2: 28, r3: 23, S, sk, sleeve: knit, long: true, hs: 1.7 });
    // the gansey: one shape for the body and both upper arms (union), so shoulders never show a joint
    const body = 'M-62 -1000 C-114 -992 -152 -976 -164 -946 C-172 -880 -166 -760 -160 -650 C-158 -620 -158 -596 -162 -568 Q0 -546 162 -568 C158 -596 158 -620 160 -650 C166 -760 172 -880 164 -946 C152 -976 114 -992 62 -1000 Z';
    const torso = `<g filter="url(#pcl)" fill="url(#${id}s)"><path d="${body}"/><path d="${up(L, -1)}"/><path d="${up(R, 1)}"/></g>
      <g stroke="${kd}" fill="none" opacity=".45" stroke-width="3">${[-96, -40, 40, 96].map(x => `<path d="M${x} -940 L${x} -606"/>`).join('')}</g>
      <g stroke="${kd}" fill="none" opacity=".4" stroke-width="2.6">${[-68, 68].map(x => `<path d="M${x} -936 ${Array.from({ length: 11 }, (_, i) => `L${x + (i % 2 ? 9 : -9)} ${-912 + i * 30}`).join(' ')}"/>`).join('')}</g>
      <g stroke="${kh}" fill="none" opacity=".18" stroke-width="2.4">${Array.from({ length: 6 }, (_, i) => `<path d="M-140 ${-930 + i * 13} Q0 ${-918 + i * 13} 140 ${-930 + i * 13}"/>`).join('')}</g>
      <path d="M-160 -604 Q0 -582 160 -604 L162 -568 Q0 -546 -162 -568 Z" fill="${darken(knit, .12)}" filter="url(#pcsl)"/>
      <g stroke="${kd}" stroke-width="2.4" opacity=".5">${Array.from({ length: 27 }, (_, i) => `<path d="M${-156 + i * 12} ${F1(-600 + Math.abs(-156 + i * 12) * .0)} l0 30"/>`).join('')}</g>
      <g filter="url(#softW)" opacity=".45"><path d="M-120 -930 C-126 -840 -124 -740 -118 -630 M118 -930 C124 -840 122 -740 116 -630" stroke="${darken(knit, .55)}" stroke-width="12" fill="none"/></g>`;
    // the roll neck: a thick knitted tube around the neck (the beard falls over its front)
    const collar = `<path d="M-60 -1004 C-62 -1030 62 -1030 60 -1004 L66 -962 Q0 -940 -66 -962 Z" fill="${darken(knit, .06)}" filter="url(#pcsl)"/>
      <g stroke="${kd}" stroke-width="2.4" opacity=".55">${Array.from({ length: 11 }, (_, i) => `<path d="M${-50 + i * 10} -1018 l${(i - 5) * .6} 52"/>`).join('')}</g>`;
    const legs = [-1, 1].map(k => `<g ${legTf(k, e, -600, 0)}><path d="${mx(k, 'M -152 -606 C -158 -500 -150 -400 -140 -300 L -44 -300 C -38 -400 -30 -500 -22 -606 Z')}" fill="url(#${id}t)" filter="url(#pc)"/>
      <path d="${mx(k, 'M -144 -330 C -148 -240 -142 -130 -134 -48 C -148 -34 -168 -18 -170 0 L -40 0 C -38 -60 -38 -200 -46 -330 Z')}" fill="${boot}" filter="url(#pcl)"/>
      <path d="${mx(k, 'M -146 -332 Q -96 -344 -44 -332')}" stroke="${darken(boot, .4)}" stroke-width="4" fill="none" opacity=".6"/></g>`).join('');
    return `<defs>${linG(id + 's', [kh, knit, darken(knit, .3)], { user: [-175, 0, 175, 0] })}${linG(id + 't', [lighten(trousers, .16), trousers, darken(trousers, .3)], { user: [-180, 0, 180, 0] })}</defs>
      ${pose === 'bust' ? '' : legs}${softNeck(S, sk, 42, -960)}${torso}${collar}${fa(-1, L)}${fa(1, R)}`;
  };
}
const KEEPER_LOOK = { skin: 'weathered', hair: 'short', hairColor: 'grey', beard: 'full', hat: 'knit', customHat: watchCap(), eyeColor: '#5a6c7c', browW: .01, faceExtra: keeperFace };
const KEEPER = { ...KEEPER_LOOK, id: 'kp', body: keeperBody({ pose: 'stand' }) };

// ---------- the boy (9): flat cap, wool coat, a knitted scarf; short legs (feet at local y = -300) ----------
const bArm = (k, T, hand = 'back', o = {}) => ({ ...autoIK(k, [k * 104, -932], T, 118, 110, o.bend), hand, ...o });
const bHang = (k, dx = 0, dy = 0, o = {}) => bArm(k, [k * (122 + dx), -716 + dy], 'back', { bend: -k, curl: .3, ...o });
function flatCap({ col = '#6a6152' } = {}) {
  return ({ g }) => `<defs>${linG(g('fc'), [lighten(col, .18), col, darken(col, .32)], { user: [-110, 0, 110, 0] })}</defs>
    <path d="M-94 -1118 C-104 -1188 -64 -1240 4 -1242 C72 -1240 108 -1192 98 -1122 C66 -1140 30 -1146 0 -1146 C-30 -1146 -64 -1140 -94 -1118 Z" fill="url(#${g('fc')})" filter="url(#pcl)"/>
    <path d="M-84 -1132 Q0 -1156 86 -1132 Q92 -1116 76 -1108 Q0 -1128 -74 -1108 Q-90 -1116 -84 -1132 Z" fill="${darken(col, .3)}" filter="url(#pcsl)"/>
    <path d="M-60 -1214 Q0 -1232 64 -1212 M-80 -1170 Q0 -1192 82 -1168" stroke="${darken(col, .35)}" stroke-width="2.4" fill="none" opacity=".45"/>
    <circle cx="4" cy="-1238" r="7" fill="${darken(col, .15)}"/>`;
}
const boyFace2 = ({ g, e }) => `${[[-40, -1048], [-30, -1040], [-48, -1036], [38, -1048], [30, -1040], [46, -1038]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2" fill="#a8664e" opacity=".55"/>`).join('')}
  ${emoFace({ g, e: { blush: .45, ...e }, bw: 7, browCol: '#3a2416', eyes: { iris: '#6a4a2a', size: 1.08 } })}`;
function boyCoatBody({ coat = '#56604a', scarf = '#7a3430', shorts = '#3a3530', sock = '#8c8576', boot = '#2a1d14' } = {}) {
  return ({ g, S, sk, e }) => {
    const id = g('bc'), cd = darken(coat, .4);
    const L = e.armL || bHang(-1), R = e.armR || bHang(1);
    const up = (A, k) => capsuleD(k * 104, -930, 25, lerp(k * 104, A.el[0], .95), lerp(-930, A.el[1], .95), 21);
    const fa = (k, A) => forearm(k, A, { r2: 19, r3: 15, S, sk, sleeve: coat, long: true, hs: 1.05 });
    const body = 'M-44 -998 C-80 -992 -108 -978 -120 -952 C-128 -900 -126 -800 -122 -706 C-124 -666 -128 -626 -132 -592 Q0 -574 132 -592 C128 -626 124 -666 122 -706 C126 -800 128 -900 120 -952 C108 -978 80 -992 44 -998 Z';
    const torso = `<g filter="url(#pcl)" fill="url(#${id}c)"><path d="${body}"/><path d="${up(L, -1)}"/><path d="${up(R, 1)}"/></g>
      <path d="M4 -960 C2 -860 4 -720 8 -584" stroke="${cd}" stroke-width="3.5" fill="none" opacity=".7"/>
      ${[-900, -820, -740, -660].map(y => `<circle cx="-16" cy="${y}" r="6.5" fill="${darken(coat, .55)}"/>`).join('')}
      <path d="M-120 -700 L-60 -700 M120 -700 L60 -700" stroke="${cd}" stroke-width="3" opacity=".55"/>
      <g filter="url(#softW)" opacity=".4"><path d="M-92 -940 C-98 -840 -96 -740 -90 -620 M92 -940 C98 -840 96 -740 90 -620" stroke="${darken(coat, .55)}" stroke-width="10" fill="none"/></g>`;
    // the scarf: a knitted band round the neck, one end hanging down the chest
    const sc = `<g filter="url(#pcl)" fill="${scarf}"><path d="M-56 -1006 C-60 -1030 60 -1030 56 -1006 L62 -964 Q0 -944 -62 -964 Z"/><path d="M-50 -980 C-58 -930 -62 -880 -60 -818 L-18 -818 C-16 -880 -16 -930 -12 -970 Z"/></g>
      <g stroke="${darken(scarf, .4)}" stroke-width="2.2" opacity=".5">${[-48, -38, -28].map(x => `<path d="M${x} -960 L${x + 2} -822"/>`).join('')}<path d="M-60 -846 L-18 -846 M-60 -866 L-18 -866"/></g>
      <g stroke="${scarf}" stroke-width="4" stroke-linecap="round">${[-56, -46, -36, -26].map(x => `<path d="M${x} -818 l0 14"/>`).join('')}</g>`;
    const legs = [-1, 1].map(k => `<g ${legTf(k, e, -600, -300)}><path d="${mx(k, 'M -64 -560 C -66 -500 -62 -470 -60 -440 L -24 -440 C -22 -470 -20 -500 -18 -560 Z')}" fill="${S.mid}" filter="url(#pk_${sk})"/>
      <path d="${mx(k, 'M -66 -452 C -68 -410 -64 -370 -60 -338 L -22 -338 C -20 -370 -18 -410 -20 -452 Z')}" fill="${sock}" filter="url(#pc)"/>
      <path d="${mx(k, 'M -64 -346 C -80 -338 -88 -320 -84 -302 L -16 -300 C -14 -318 -18 -336 -24 -346 Z')}" fill="${boot}" filter="url(#pcl)"/></g>`).join('')
      + `<path d="M-128 -610 C-130 -580 -126 -556 -120 -536 L-12 -536 L0 -560 L12 -536 L120 -536 C126 -556 130 -580 128 -610 Z" fill="${shorts}" filter="url(#pcl)"/>`;
    return `<defs>${linG(id + 'c', [lighten(coat, .18), coat, darken(coat, .3)], { user: [-135, 0, 135, 0] })}</defs>
      ${e.bust ? '' : legs}${softNeck(S, sk, 34, -960)}${torso}${sc}${fa(-1, L)}${fa(1, R)}`;
  };
}
const BOY2 = { skin: 'fair', hair: 'short', hairColor: 'brown', beard: 'none', hat: 'flat', customHat: flatCap(), child: true, eyeColor: '#6a4a2a', browW: .01, id: 'bk',
  body: boyCoatBody(), faceExtra: boyFace2 };

// ---------- props ----------
// a small brass oil can with a wire bail, hanging from a fist at local point (x, y) (the bail's top runs through the fist)
function oilCan(x, y, s = 1, sway = 0) {
  return `<g transform="translate(${F1(x)} ${F1(y)}) rotate(${F1(sway)}) scale(${s})">
    <path d="M-26 6 Q0 -24 26 6" stroke="#2a241c" stroke-width="4" fill="none"/>
    <path d="M-30 6 L30 6 L36 30 C40 70 38 96 34 104 L-34 104 C-38 96 -40 70 -36 30 Z" fill="url(#brassG)" filter="url(#pcl)"/>
    <path d="M-36 30 L36 30 M-36 92 L36 92" stroke="#5a3e18" stroke-width="3" opacity=".6"/>
    <path d="M30 38 L72 4 L76 8 L38 46 Z" fill="url(#brassG)" filter="url(#pcs)"/>
    <ellipse cx="-14" cy="60" rx="6" ry="26" fill="#fff6d8" opacity=".35" filter="url(#softW2)"/></g>`;
}
// a cloth rag bunched under a hand (centre x, y), a corner hanging down
const rag = (x, y, s = 1, rot = 0) => `<g transform="translate(${F1(x)} ${F1(y)}) rotate(${F1(rot)}) scale(${s})">
  <path d="M-46 -30 C-30 -48 26 -46 44 -28 C58 -6 50 24 34 40 C40 70 36 100 22 118 C10 104 4 84 0 62 C-20 64 -42 52 -50 30 C-58 8 -56 -16 -46 -30 Z" fill="#cfc4ac" filter="url(#pcl)"/>
  <path d="M-30 -20 C-12 -6 10 -4 30 -18 M-36 16 C-16 26 8 26 30 12 M10 50 C14 76 16 96 20 112" stroke="#9a8e74" stroke-width="3" fill="none" opacity=".6"/></g>`;
addDefs(`<linearGradient id="brassG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e8c878"/><stop offset=".45" stop-color="#b8893e"/><stop offset="1" stop-color="#5e4018"/></linearGradient>`);
