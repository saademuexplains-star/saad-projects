// nyc.js — the cast of "The Man Who Wouldn't Die" (Michael Malloy, the Bronx, winter 1933), built on era.js's grammar
// (whole-garment bodies, face2 eyes / brows / mouth, hats in the head group). Local coordinates as person(): head centre
// ≈ (0,-1075), shoulders ≈ -930, waist ≈ -690, feet y = 0. +x is the character's LEFT (screen right when facing us).

// ---------- skin ----------
SKIN_TONES.ir = { hi: '#f2cfb8', mid: '#dba890', lo: '#b27a64', ear: '#d29a82', earDk: '#bb846c', neck: '#c9937a', shade: '#97624e', deep: '#7e4c3c',
  blush: '#cc6e5c', nostril: '#4a2420', line: '#80493a', lip: '#b46a5e', mouth: '#5a2620', rim: '#663024' };
SKIN_TONES.wt = { hi: '#f3d8c4', mid: '#dfb79c', lo: '#b6866c', ear: '#d6a68c', earDk: '#c09078', neck: '#cfa286', shade: '#9a6a54', deep: '#80523e',
  blush: '#c98a74', nostril: '#4a2a20', line: '#7e4e3c', lip: '#b47464', mouth: '#5a2a20', rim: '#62341e' };
SKIN_TONES.it = { hi: '#ecc8a6', mid: '#cfa07c', lo: '#a37252', ear: '#c69472', earDk: '#b0805e', neck: '#c09070', shade: '#8a5c40', deep: '#724830',
  blush: '#bf7e62', nostril: '#45261a', line: '#784a32', lip: '#a8685a', mouth: '#52261c', rim: '#5e321c' };
const SKI = SKIN_TONES.ir, SKW = SKIN_TONES.wt, SKT = SKIN_TONES.it;

// ---------- faces ----------
// a man's face, a little longer and squarer in the jaw than the default; a thin, long one; a broad round one
const FACE_W = 'M-69 -1116 C-72 -1074 -69 -1032 -59 -1002 C-49 -976 -26 -957 0 -954 C26 -957 49 -976 59 -1002 C69 -1032 72 -1074 69 -1116 C63 -1156 34 -1178 0 -1178 C-34 -1178 -63 -1156 -69 -1116Z';
const FACE_WT = 'M-63 -1118 C-66 -1074 -63 -1030 -54 -998 C-45 -970 -24 -949 0 -946 C24 -949 45 -970 54 -998 C63 -1030 66 -1074 63 -1118 C58 -1158 31 -1180 0 -1180 C-31 -1180 -58 -1158 -63 -1118Z';
const FACE_WR = 'M-74 -1112 C-78 -1070 -76 -1030 -66 -1002 C-55 -974 -29 -958 0 -956 C29 -958 55 -974 66 -1002 C76 -1030 78 -1070 74 -1112 C68 -1154 36 -1176 0 -1176 C-36 -1176 -68 -1154 -74 -1112Z';
// deeper eye sockets, cheekbones, the shadow under the jaw line; hatShadow darkens the brow under a brim
const faceShadeW = ({ hatShadow = 0, hollow = .5 } = {}) => ({ g, S }) => `<g filter="url(#softW)">
    <ellipse cx="-30" cy="-1086" rx="24" ry="11" fill="${S.shade}" opacity=".36"/><ellipse cx="30" cy="-1086" rx="24" ry="11" fill="${S.shade}" opacity=".36"/>
    <ellipse cx="-64" cy="-1100" rx="14" ry="44" fill="${S.shade}" opacity=".4"/><ellipse cx="64" cy="-1100" rx="10" ry="38" fill="${S.shade}" opacity=".2"/>
    <ellipse cx="-50" cy="-1034" rx="14" ry="24" fill="${S.deep}" opacity="${F1(.22 * hollow)}"/><ellipse cx="50" cy="-1034" rx="14" ry="24" fill="${S.deep}" opacity="${F1(.16 * hollow)}"/>
    <ellipse cx="42" cy="-1060" rx="18" ry="10" fill="${S.hi}" opacity=".32"/><ellipse cx="-40" cy="-1060" rx="16" ry="9" fill="${S.hi}" opacity=".14"/>
    <ellipse cx="0" cy="-1138" rx="38" ry="16" fill="${S.hi}" opacity=".3"/>
    <path d="M-60 -992 C-38 -962 38 -962 60 -992" stroke="${S.deep}" stroke-width="18" fill="none" opacity=".36"/>
    ${hatShadow ? `<ellipse cx="0" cy="-1150" rx="96" ry="36" fill="#22160e" opacity="${F1(.55 * hatShadow)}"/>` : ''}</g>`;
// a man's nose: a longer bridge, a rounded tip; red = a drinker's flush on the tip and cheeks
const noseW = (S, { big = 1, red = 0 } = {}) => { const b = big; return `<g filter="url(#softW2)">
    <path d="M-6 -1098 C-8 -1078 -10 -1060 -15 ${F1(-1046 + 2 * b)}" stroke="${S.shade}" stroke-width="${F1(8 * b)}" fill="none" opacity=".32"/>
    <path d="M3 -1096 C4 -1078 5 -1062 4 -1050" stroke="${S.hi}" stroke-width="6" fill="none" opacity=".42"/>
    <ellipse cx="2" cy="-1042" rx="${F1(10 * b)}" ry="${F1(8 * b)}" fill="${S.hi}" opacity=".45"/>
    <ellipse cx="0" cy="-1030" rx="${F1(15 * b)}" ry="5" fill="${S.deep}" opacity=".45"/>
    ${red ? `<ellipse cx="1" cy="-1040" rx="${F1(13 * b)}" ry="${F1(11 * b)}" fill="#c4544a" opacity="${F1(.45 * red)}"/>` : ''}</g>
  <path d="M${F1(-17 * b)} -1043 C${F1(-20 * b)} -1035 ${F1(-16 * b)} -1029 -9 -1028 M${F1(17 * b)} -1043 C${F1(20 * b)} -1035 ${F1(16 * b)} -1029 9 -1028" stroke="${S.line}" stroke-width="1.9" fill="none" opacity=".55" stroke-linecap="round"/>
  <path d="M-10.5 -1031 q3 -2.6 6.5 -.6 M10.5 -1031 q-3 -2.6 -6.5 -.6" stroke="${S.nostril}" stroke-width="2.6" fill="none" opacity=".75" stroke-linecap="round"/>
  <path d="M-3.6 -1025 L-4 -1014 M3.6 -1025 L4 -1014" stroke="${S.shade}" stroke-width="1.4" opacity=".3"/>`; };
const earsAt = (x0 = 70) => ({ S, sk, turn = 0 }) => [-1, 1].map(k => { const sq = 1 - .85 * Math.max(0, k * turn), x = k * (x0 - turn * 4);
  return `<g transform="translate(${F1(x)} -1072) scale(${F1(sq)} 1.05)"><path d="${mx(-k, 'M 0 -21 C 13 -23 17 -8 14 6 C 12 17 6 23 0 21 Z')}" fill="${k < 0 ? S.ear : S.earDk}" filter="url(#pks_${sk})"/>
    <path d="${mx(-k, 'M 3 -13 C 9 -13 11 -2 9 6 C 8 10 6 12 3 11')}" stroke="${S.deep}" stroke-width="2.4" fill="none" opacity=".45"/></g>`; }).join('');
// stubble / a day's beard over the lower face (clipped to the face; the lips stay clear)
const stubble = (g, k = 1, col = '#5a4a40', seed = 4) => { if (k < .01) return ''; const R = rng(seed); let d = '';
  for (let i = 0; i < 260; i++) { const x = (R() * 2 - 1) * 66, y = -1050 + R() * 100; if (Math.abs(x) < 24 && y > -1022 && y < -1000) continue; if (y < -1040 && Math.abs(x) < 30) continue;
    if (Math.abs(x) > 40 && y < -1045 + Math.abs(x) * .0) continue; d += `<circle cx="${F1(x)}" cy="${F1(y)}" r="${F1(.5 + R() * .5)}"/>`; }
  return `<g clip-path="url(#${g('face')})"><g filter="url(#softW)"><path d="M-60 -1040 C-58 -990 -30 -954 0 -952 C30 -954 58 -990 60 -1040 C40 -1030 30 -1046 0 -1048 C-30 -1046 -40 -1030 -60 -1040 Z" fill="${col}" opacity="${F1(.24 * k)}"/></g>
    <g fill="${col}" opacity="${F1(.16 * k)}" filter="url(#softW2)">${d}</g></g>`; };
// moustaches: pencil (a thin line), brush (full, clipped short at the corners — NOT the narrow toothbrush), walrus
const mous = (kind, col) => kind === 'pencil' ? `<path d="M-22 -1018 Q-11 -1023 -2 -1020 M2 -1020 Q11 -1023 22 -1018" stroke="${col}" stroke-width="3" fill="none" stroke-linecap="round"/>`
  : kind === 'walrus' ? `<g filter="url(#pcs)"><path d="M-34 -1004 C-30 -1020 -14 -1028 0 -1024 C14 -1028 30 -1020 34 -1004 C26 -1010 14 -1012 0 -1012 C-14 -1012 -26 -1010 -34 -1004 Z" fill="${col}"/></g>
      <path d="M-24 -1018 L-20 -1010 M-12 -1022 L-10 -1013 M12 -1022 L10 -1013 M24 -1018 L20 -1010" stroke="${lighten(col, .25)}" stroke-width="1.2" opacity=".6"/>` : '';
const EYE_W = { iris: '#4e5e6a', lash: '#1e140e', size: 1, w: 16.8, h: 7.8, sep: 30, tilt: .02, crease: '#9a6a56', lowLine: '#7a4a38', iris_r: 6.8, catch: .55, catchR: .7, white: '#ece2d8', lashW: .9 };
const BROW_W = { col: '#3a2a1e', w: 7.5, len: 27, y: -1104, sep: 30, arch: 2.6, lineCol: '#7a4a38' };
const MOUTH_W = { w: 20, y: -1007, lip: '#ac6c5e', mouth: '#4a1c16', line: '#3a1a12', teeth: '#e6dccb', crease: '#865040', lipK: .7 };
// the face builder: nose, age lines, flush, stubble, eyes, brows, mouth, moustache, sweat
const wFace = (EYE, BROW, MOUTH, { age = .6, old = 0, nose = {}, stub = 0, stubCol = '#5a4a40', mo = null, moCol = '#2a1e16', flush = 0 } = {}) => ({ g, S, e }) => `${noseW(S, nose)}
  <g clip-path="url(#${g('face')})">${ageLines(S, age)}${old ? oldLines(S, old) : ''}
    ${flush ? `<g filter="url(#softW)" opacity="${F1(flush)}"><ellipse cx="-40" cy="-1046" rx="20" ry="12" fill="${S.blush}"/><ellipse cx="40" cy="-1046" rx="20" ry="12" fill="${S.blush}"/></g>` : ''}</g>
  ${stubble(g, (e.stub ?? stub), stubCol)}${eyes2(e, EYE)}${brows2(e, BROW)}${mouth2(e, MOUTH)}${mo ? mous(mo, moCol) : ''}${sweat2(e, S)}`;

// ---------- hair and hats ----------
// short back-and-sides with a side parting (shared by several men), coloured
const hairW = ({ col = '#2a2018', sheen = .2, recede = 0 } = {}) => () => { const top = -1214 + recede * 30;
  return `<g filter="url(#pcsl)"><path d="M-70 -1100 C-76 -1124 -78 -1156 -70 -1176 C-58 -1200 -28 ${top} 2 ${top} C34 ${top} 64 -1200 74 -1176 C80 -1154 78 -1124 70 -1100 L67 -1104 C68 -1118 66 -1132 60 -1144 C42 -1156 22 -1162 2 -1162 C-22 -1162 -44 -1156 -60 -1146 C-66 -1132 -68 -1118 -67 -1104 Z" fill="${col}"/></g>
    <path d="M-26 -1160 C-28 -1180 -24 -1196 -16 ${top + 4}" stroke="${lighten(col, .3)}" stroke-width="1.6" fill="none" opacity=".6"/>
    <path d="M-12 -1196 C14 -1206 40 -1202 60 -1186" stroke="#fff" stroke-width="5" fill="none" opacity="${F1(sheen)}" filter="url(#softW2)"/>
    <g filter="url(#softW2)" opacity=".5"><path d="M-67 -1102 C-69 -1116 -68 -1130 -62 -1146 M67 -1102 C69 -1116 68 -1130 62 -1146" stroke="${col}" stroke-width="5" fill="none"/></g>`; };
// hair combed straight back with pomade (the bar owner), a strong sheen
const slickW = (col = '#16100c') => () => `<g filter="url(#pcsl)"><path d="M-70 -1100 C-77 -1128 -78 -1160 -66 -1184 C-48 -1212 -16 -1220 4 -1220 C34 -1218 62 -1206 72 -1180 C80 -1156 78 -1126 70 -1100 L67 -1104 C68 -1124 66 -1140 60 -1152 C40 -1162 20 -1166 2 -1166 C-22 -1166 -42 -1162 -60 -1152 C-66 -1136 -68 -1114 -68 -1090 Z" fill="${col}"/></g>
  <g stroke="#6a6a70" fill="none" opacity=".45" stroke-width="1.4"><path d="M-40 -1166 C-30 -1196 0 -1212 30 -1210 M-20 -1166 C-10 -1192 14 -1206 44 -1200 M0 -1166 C6 -1188 26 -1198 56 -1190"/></g>
  <path d="M-30 -1200 C0 -1214 30 -1212 54 -1196" stroke="#fff" stroke-width="6" fill="none" opacity=".3" filter="url(#softW2)"/>`;
// bald on top, a fringe round the sides (the bartender)
const fringeW = (col = '#7a5a44') => ({ g }) => `<g filter="url(#pcs)" fill="${col}"><path d="M-70 -1076 C-76 -1104 -76 -1130 -66 -1150 C-62 -1134 -62 -1110 -62 -1090 L-64 -1074 Z M70 -1076 C76 -1104 76 -1130 66 -1150 C62 -1134 62 -1110 62 -1090 L64 -1074 Z"/></g>
  <g clip-path="url(#${g('face')})"><ellipse cx="-12" cy="-1166" rx="34" ry="10" fill="#fff" opacity=".25" filter="url(#softW2)"/></g>`;
// a flat (newsboy) cap: soft crown pulled forward over a short peak; hair at the sides
function flatCap({ col = '#5a5048', hair = '#8a8078', worn = 0 } = {}) {
  return ({ g }) => `<g filter="url(#pcs)" fill="${hair}"><path d="M-70 -1082 C-74 -1104 -72 -1124 -66 -1138 L-60 -1136 C-62 -1118 -62 -1100 -62 -1082 Z M70 -1082 C74 -1104 72 -1124 66 -1138 L60 -1136 C62 -1118 62 -1100 62 -1082 Z"/></g>
    <g filter="url(#pcl)"><path d="M-84 -1136 C-90 -1176 -70 -1210 -20 -1220 C30 -1228 80 -1216 96 -1186 C104 -1166 98 -1146 86 -1136 Q0 -1156 -84 -1136 Z" fill="url(#${g('hat')})"/></g>
    <path d="M-60 -1206 C-20 -1214 30 -1212 70 -1196 M-40 -1150 C-30 -1180 -6 -1206 30 -1216" stroke="${darken(col, .35)}" stroke-width="2" fill="none" opacity=".45"/>
    <g filter="url(#pcsl)"><path d="M-80 -1140 Q0 -1162 84 -1140 Q70 -1116 0 -1110 Q-70 -1116 -80 -1140 Z" fill="${darken(col, .2)}"/></g>
    <path d="M-60 -1128 Q0 -1142 60 -1128" stroke="#fff" stroke-width="2" fill="none" opacity=".14"/>
    ${worn ? `<g filter="url(#softW)" opacity="${F1(worn)}"><ellipse cx="40" cy="-1196" rx="26" ry="10" fill="${darken(col, .4)}"/><ellipse cx="-30" cy="-1180" rx="20" ry="8" fill="${lighten(col, .15)}"/></g>` : ''}
    <g clip-path="url(#${g('face')})"><ellipse cx="0" cy="-1110" rx="66" ry="12" fill="#1e140c" opacity=".3" filter="url(#softW)"/></g>`;
}
// a fedora: pinched crown, a band, a wide brim
function fedora({ col = '#2e2c2c', band = '#141214', hair = '#1e1612' } = {}) {
  return ({ g }) => `${hairW({ col: hair })()}
    <g filter="url(#pcl)"><path d="M-150 -1138 C-120 -1156 120 -1156 150 -1138 C130 -1124 -130 -1124 -150 -1138 Z" fill="${darken(col, .12)}"/></g>
    <g filter="url(#pcl)"><path d="M-80 -1142 C-86 -1196 -74 -1236 -40 -1250 C-18 -1240 18 -1240 40 -1250 C74 -1236 86 -1196 80 -1142 Q0 -1156 -80 -1142 Z" fill="url(#${g('hat')})"/></g>
    <path d="M-30 -1242 C-10 -1224 10 -1224 30 -1242 M0 -1230 L0 -1180" stroke="${darken(col, .4)}" stroke-width="2.4" fill="none" opacity=".5"/>
    <g filter="url(#pcsl)"><path d="M-82 -1160 Q0 -1176 82 -1160 L80 -1142 Q0 -1156 -80 -1142 Z" fill="${band}"/></g>
    <g clip-path="url(#${g('face')})"><ellipse cx="0" cy="-1120" rx="70" ry="16" fill="#140e0a" opacity=".42" filter="url(#softW)"/></g>`;
}
// the NYPD peaked cap: a stiff crown with a top, dark band, a shiny peak and a brass badge
function copCap({ col = '#1e2436', hair = '#3a2a1e' } = {}) {
  return ({ g }) => `${hairW({ col: hair })()}
    <g filter="url(#pcl)"><path d="M-96 -1176 C-90 -1206 90 -1206 96 -1176 L82 -1146 Q0 -1160 -82 -1146 Z" fill="url(#${g('hat')})"/></g>
    <g filter="url(#pcsl)"><path d="M-82 -1166 Q0 -1180 82 -1166 L82 -1144 Q0 -1158 -82 -1144 Z" fill="#14161c"/></g>
    <g filter="url(#pcsl)"><path d="M-74 -1146 Q0 -1160 74 -1146 Q60 -1122 0 -1118 Q-60 -1122 -74 -1146 Z" fill="#0e0e10"/></g>
    <path d="M-50 -1140 Q0 -1152 50 -1140" stroke="#fff" stroke-width="3" fill="none" opacity=".35"/>
    <g filter="url(#pcsl)"><path d="M0 -1196 l14 6 l0 14 l-14 8 l-14 -8 l0 -14 Z" fill="url(#brassG)"/></g>
    <g clip-path="url(#${g('face')})"><ellipse cx="0" cy="-1112" rx="66" ry="12" fill="#140e0a" opacity=".38" filter="url(#softW)"/></g>`;
}

// ---------- the people ----------
const W_BASE = { hair: 'bald', hairColor: 'black', beard: 'none', legs: 'none', top: 'vest', browW: .01, ownFace: 1, ownNose: 1, noMustache: 1, facePath: FACE_W, ears: earsAt(70) };
// Michael Malloy: an old Irish drifter, ruddy, a red nose, grey stubble, a battered flat cap, a frayed brown overcoat and a
// scarf over a collarless shirt; cheerful whatever happens
const MALLOY_FACE = wFace({ ...EYE_W, iris: '#5a7088', h: 7.2 }, { ...BROW_W, col: '#8a8078', w: 8, len: 28, arch: 3.4 }, { ...MOUTH_W, lip: '#b06a5e' },
  { age: 1.5, old: .7, nose: { big: 1.15, red: 1 }, stub: .9, stubCol: '#8a8078', flush: .4 });
const MALLOY_BODY = { shirt: '#d4c8b0', pants: '#4a4238', shoe: '#2a1e16', belt: '#2a1e14', w: .96, pocket: false, collarless: true, over: { col: '#6a5440', kind: 'coat', wear: .6 }, scarf: '#7a3a30' };
const MALLOY = { ...W_BASE, skin: 'ir', id: 'ma', eyeColor: '#5a7088', faceExtra: MALLOY_FACE, faceShade: faceShadeW({ hatShadow: .5, hollow: .9 }), hat: 'mcap', hatColor: '#4e4840', customHat: flatCap({ col: '#4e4840', hair: '#9a948c', worn: .5 }), body: shirtBody(MALLOY_BODY) };
// in shirt sleeves at the bar (coat off), and bandaged after the cab
const MALLOY_BAR = { ...MALLOY, id: 'mb', body: shirtBody({ ...MALLOY_BODY, over: { col: '#5a4a3a', kind: 'vest' }, longSleeve: true }) };
const MALLOY_BAND = { ...MALLOY, id: 'mw', customHat: ({ g }) => flatCap({ col: '#4e4840', hair: '#9a948c', worn: .5 })({ g }) + headBandage({ stain: .25 }) };
const MALLOY_SLEEP = { ...MALLOY, id: 'ms', hat: 'msh', customHat: () => hairW({ col: '#a49e96', sheen: .05, recede: 1 })(), body: shirtBody({ ...MALLOY_BODY, over: null }) };
// Tony Marino, the speakeasy owner: slicked black hair, a pencil moustache, white shirt, dark vest, a long white apron
const MARINO = { ...W_BASE, skin: 'it', id: 'tm', eyeColor: '#2e1e14', hat: 'tmh', customHat: slickW('#16100c'),
  faceExtra: wFace({ ...EYE_W, iris: '#2e1e14', h: 7.6 }, { ...BROW_W, col: '#16100c', w: 8.5, arch: 2 }, MOUTH_W, { age: .6, nose: { big: 1.05 }, stub: .35, stubCol: '#2a2420', mo: 'pencil', moCol: '#16100c' }),
  faceShade: faceShadeW({ hollow: .5 }), body: shirtBody({ shirt: '#ece6da', pants: '#2a2a2e', shoe: '#18120e', w: 1.0, pocket: false, over: { col: '#2e2a2c', kind: 'vest' }, apron: '#ebe6dc', tie: '#5a2228' }) };
// Joe Murphy, the bartender: stout, bald with a fringe, a full brush moustache, rolled sleeves, a striped shirt and apron
const MURPHY = { ...W_BASE, skin: 'ir', id: 'jm', eyeColor: '#4a5a6a', facePath: FACE_WR, ears: earsAt(75), hat: 'jmh', customHat: fringeW('#8a6a52'),
  faceExtra: wFace({ ...EYE_W, iris: '#4a5a6a' }, { ...BROW_W, col: '#7a5a44', w: 8.5 }, { ...MOUTH_W, y: -1004 }, { age: 1.0, old: .4, nose: { big: 1.12, red: .4 }, stub: .2, stubCol: '#7a5a44', mo: 'walrus', moCol: '#7a5a44', flush: .3 }),
  faceShade: faceShadeW({ hollow: .3 }), body: shirtBody({ shirt: '#b4c0c8', pants: '#3a3632', shoe: '#1e1612', w: 1.12, pocket: false, apron: '#e4ded2' }) };
// Frank Pasqua, the undertaker: thin, sallow, black suit and tie, a black fedora
const PASQUA = { ...W_BASE, skin: 'wt', id: 'fp', eyeColor: '#3a2a20', facePath: FACE_WT, ears: earsAt(65), hat: 'fph', customHat: fedora({ col: '#1e1c1e', band: '#0e0c0e', hair: '#2a2420' }),
  faceExtra: wFace({ ...EYE_W, iris: '#3a2a20', h: 7.0 }, { ...BROW_W, col: '#2a2018', w: 7, arch: 4 }, { ...MOUTH_W, w: 18 }, { age: .9, nose: { big: 1.1 }, stub: .2, stubCol: '#3a3028' }),
  faceShade: faceShadeW({ hatShadow: .6, hollow: 1.1 }), body: shirtBody({ shirt: '#e2ddd2', pants: '#1c1a1c', shoe: '#0e0c0c', w: .92, pocket: false, over: { col: '#1e1c20', kind: 'suit' }, tie: '#101012' }) };
// Dan Kriesberg, the fruit seller: stocky, a flat cap, a grey sweater-vest over his shirt, sleeves rolled
const KRIESBERG = { ...W_BASE, skin: 'wt', id: 'dk', eyeColor: '#3e3020', facePath: FACE_WR, ears: earsAt(75), hat: 'dkh', customHat: flatCap({ col: '#6a6a62', hair: '#3a2a1e' }),
  faceExtra: wFace({ ...EYE_W, iris: '#3e3020' }, { ...BROW_W, col: '#3a2a1e', w: 8.5 }, MOUTH_W, { age: .7, nose: { big: 1.1 }, stub: .55, stubCol: '#3a2a20' }),
  faceShade: faceShadeW({ hatShadow: .5 }), body: shirtBody({ shirt: '#c8c0ae', pants: '#4a4640', shoe: '#2a2018', w: 1.1, pocket: false, over: { col: '#6e6c66', kind: 'vest' } }) };
// a fifth man (the gang's muscle): a brown three-piece and a brown fedora
const FIFTH = { ...W_BASE, skin: 'wt', id: 'f5', eyeColor: '#3a2a20', hat: 'f5h', customHat: fedora({ col: '#5a4634', band: '#2a1e14', hair: '#3a2a1e' }),
  faceExtra: wFace({ ...EYE_W, iris: '#3a2a20' }, BROW_W, MOUTH_W, { age: .7, nose: { big: 1.08 }, stub: .4, stubCol: '#3a2a20' }), faceShade: faceShadeW({ hatShadow: .55 }),
  body: shirtBody({ shirt: '#e0dccc', pants: '#4e3e2e', shoe: '#1e140e', w: 1.04, pocket: false, over: { col: '#5a4634', kind: 'suit' }, tie: '#6a5a2a' }) };
// the cab driver: a peaked cabbie's cap and a leather jacket
const CABBIE = { ...W_BASE, skin: 'wt', id: 'cb', eyeColor: '#3a3a2a', hat: 'cbh', customHat: copCap({ col: '#3a3630', hair: '#4a3a28' }),
  faceExtra: wFace({ ...EYE_W, iris: '#3a3a2a' }, BROW_W, MOUTH_W, { age: .8, nose: { big: 1.1 }, stub: .6, stubCol: '#3a3028' }), faceShade: faceShadeW({ hatShadow: .5 }),
  body: shirtBody({ shirt: '#bfb8a6', pants: '#3a3632', shoe: '#1e1612', pocket: false, over: { col: '#4a3220', kind: 'jacket' } }) };
// NYPD patrolmen: navy greatcoat, brass buttons, belt, the peaked cap
const COP = { ...W_BASE, skin: 'wt', id: 'cp', eyeColor: '#3a4a5a', hat: 'cph', customHat: copCap({}),
  faceExtra: wFace({ ...EYE_W, iris: '#3a4a5a' }, BROW_W, MOUTH_W, { age: .7, nose: { big: 1.05 }, stub: .15 }), faceShade: faceShadeW({ hatShadow: .6 }),
  body: shirtBody({ shirt: '#d8d6d0', pants: '#1e2232', shoe: '#0e0e10', pocket: false, over: { col: '#202638', kind: 'police' } }) };
const COP2 = { ...COP, id: 'c2', skin: 'ir', facePath: FACE_WR, ears: earsAt(75), faceExtra: wFace({ ...EYE_W, iris: '#4a5a6a' }, { ...BROW_W, col: '#6a4a34' }, MOUTH_W, { age: .9, nose: { big: 1.1, red: .2 }, mo: 'walrus', moCol: '#6a4a34', flush: .2 }) };
