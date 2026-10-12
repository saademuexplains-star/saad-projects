// Gladiator short — cast and props. Same recipe as the engine's person(): gradients lit from the upper-left,
// finishing filters, paper texture, no outlines.

// ---------- hand positions (so props can be held) ----------
// person()'s arm k (-1 = screen-left) hangs from the shoulder (k*155, -925); the hand centre sits ~(k*185, -600).
const handPos = (k, raise = 0) => {
  const a = (k < 0 ? raise : -raise) * Math.PI / 180, vx = k * 30, vy = 325;
  return [k * 155 + vx * Math.cos(a) - vy * Math.sin(a), -925 + vx * Math.sin(a) + vy * Math.cos(a)];
};

// a sickly, grey-green skin tone for the people waiting with cups
SKIN_TONES.pale = { hi: '#ddd9c2', mid: '#bdb59c', lo: '#8c8470', ear: '#b0a68c', earDk: '#9a917a', neck: '#a9a088', shade: '#7a725e', deep: '#5f584a', blush: '#b49a86', nostril: '#3e3a30', line: '#6e6656', lip: '#9a8a7a', mouth: '#3a2e28', rim: '#4a4438' };

addDefs(`
  <linearGradient id="buzzG" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#1a110a" stop-opacity=".72"/><stop offset=".5" stop-color="#1e140c" stop-opacity=".6"/><stop offset="1" stop-color="#2a1c12" stop-opacity=".42"/></linearGradient>
  <filter id="softW" x="-50%" y="-200%" width="200%" height="500%"><feGaussianBlur stdDeviation="6"/></filter>
  <filter id="softW2" x="-50%" y="-200%" width="200%" height="500%"><feGaussianBlur stdDeviation="2"/></filter>
  <radialGradient id="bronzeG" cx=".32" cy=".28" r=".85"><stop offset="0" stop-color="#ffe7a8"/><stop offset=".25" stop-color="#d9a957"/><stop offset=".65" stop-color="#8f6428"/><stop offset="1" stop-color="#3e2a10"/></radialGradient>
  <linearGradient id="steelG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e6e9ee"/><stop offset=".45" stop-color="#9aa0aa"/><stop offset="1" stop-color="#4a4e56"/></linearGradient>
  <linearGradient id="woodG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8a6440"/><stop offset=".5" stop-color="#5e4026"/><stop offset="1" stop-color="#2e1e10"/></linearGradient>
  <radialGradient id="coinG" cx=".35" cy=".35" r=".7"><stop offset="0" stop-color="#fff2b8"/><stop offset=".45" stop-color="#d8b04c"/><stop offset="1" stop-color="#7a5418"/></radialGradient>
  <radialGradient id="hotG" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fffbe0"/><stop offset=".35" stop-color="#ffb030"/><stop offset=".7" stop-color="#e2380c"/><stop offset="1" stop-color="#7a1004" stop-opacity="0"/></radialGradient>
`);

// ---------- the gladiator ("you") ----------
// scar through the left brow and a nick on the cheek; heavy brows
// shaved head: a dark tint over the scalp (clipped to the skull), not a solid cap
const BUZZ = g => `<g clip-path="url(#${g('face')})">
    <path d="M-84 -1090 C-80 -1110 -66 -1124 -44 -1129 C-20 -1135 20 -1135 44 -1129 C66 -1124 80 -1110 84 -1090 L96 -1210 L-96 -1210 Z" fill="url(#buzzG)" filter="url(#softW2)"/>
    <path d="M-84 -1092 L-72 -1094 L-70 -1076 L-80 -1072 Z M84 -1092 L72 -1094 L70 -1076 L80 -1072 Z" fill="#24170e" opacity=".3" filter="url(#softW2)"/>
    <ellipse cx="-22" cy="-1160" rx="36" ry="9" fill="#fff4e0" opacity=".12"/></g>`;
const gladFace = ({ g, e }) => `${BUZZ(g)}<g clip-path="url(#${g('face')})"><g filter="url(#softW)" opacity=".26"><path d="M-64 -1044 C-58 -990 -24 -964 0 -964 C24 -964 58 -990 64 -1044 C44 -1006 30 -1000 0 -1000 C-30 -1000 -44 -1006 -64 -1044 Z" fill="#2a2018"/>
    <path d="M-30 -1018 Q0 -1026 30 -1018" stroke="#2a2018" stroke-width="10" fill="none"/></g></g>
  <g filter="url(#softW)" opacity=".32"><path d="M-62 -1110 Q-30 -1118 -8 -1106 M62 -1110 Q30 -1118 8 -1106" stroke="#2a1a12" stroke-width="14" fill="none"/></g>
  <g opacity=".85">
    <path d="M-58 -1124 L-30 -1066" stroke="#e2b29c" stroke-width="6" stroke-linecap="round" filter="url(#softW2)"/>
    <path d="M-56 -1124 L-29 -1068" stroke="#8a4a36" stroke-width="2" opacity=".55"/>
    <path d="M44 -1030 l16 -9" stroke="#e2b29c" stroke-width="4" stroke-linecap="round" opacity=".7"/></g>
  ${e.blood ? `<path d="M-40 -1090 q4 30 -2 ${F1(50 * e.blood)}" stroke="#7a0e08" stroke-width="7" stroke-linecap="round" fill="none" opacity=".85"/>` : ''}
  ${e.dirt ? `<g fill="#5a4630" opacity="${(.35 * e.dirt).toFixed(2)}" filter="url(#softW2)"><ellipse cx="38" cy="-1060" rx="20" ry="12"/><ellipse cx="-44" cy="-1000" rx="16" ry="9"/><ellipse cx="8" cy="-990" rx="22" ry="8"/></g>` : ''}`;

// a bare, muscled arm with a wrist wrap; k = -1 screen-left (his sword arm). manica = segmented arm guard
function gladArm(k, ang, { S, sk, manica = false, wrap = '#d8ccb0' }) {
  let man = '';
  if (manica) for (let i = 0; i < 9; i++) {
    const y = -930 + i * 32;
    man += `<path d="${mx(k, `M -132 ${y} Q -164 ${y - 10} -214 ${y + 2} L -212 ${y + 30} Q -164 ${y + 20} -134 ${y + 28} Z`)}" fill="${i % 2 ? '#8e8a82' : '#b9b4aa'}" filter="url(#pcsA)"/>`;
  }
  return `<g transform="rotate(${ang} ${k * 160} -925)">
    <path d="${mx(k, 'M -160 -925 Q -204 -820 -190 -650')}" stroke="${S.mid}" stroke-width="72" stroke-linecap="round" fill="none" filter="url(#pclA)"/>
    <path d="${mx(k, 'M -178 -890 Q -198 -810 -188 -700')}" stroke="${S.hi}" stroke-width="16" stroke-linecap="round" fill="none" opacity="${k < 0 ? .55 : .22}" filter="url(#soft2)"/>
    <path d="${mx(k, 'M -150 -900 Q -175 -870 -196 -800')}" stroke="${S.shade}" stroke-width="10" fill="none" opacity=".35" filter="url(#soft)"/>
    ${man}
    <path d="${mx(k, 'M -192 -704 L -190 -652')}" stroke="${wrap}" stroke-width="74" filter="url(#pcsA)"/>
    <path d="${mx(k, 'M -192 -690 L -190 -676 M -192 -672 L -190 -660')}" stroke="${darken(wrap, .35)}" stroke-width="74" opacity=".25"/>
    <path d="${mx(k, 'M -166 -642 C -156 -612 -158 -586 -170 -570 C -178 -560 -194 -558 -204 -565 C -214 -574 -217 -596 -215 -642 Z')}" fill="${S.mid}" filter="url(#pks_${sk})"/></g>`;
}

function gladLegs(S, sk, e = {}) {
  return [-1, 1].map(k => `<g ${typeof legTf === 'function' ? legTf(k, e, -480, 0) : ''}><path d="${mx(k, 'M -160 -480 C -172 -380 -160 -300 -132 -250 C -146 -190 -136 -120 -116 -70 L -112 -38 C -136 -28 -156 -14 -156 0 L -40 0 C -40 -20 -46 -40 -54 -60 C -46 -120 -42 -200 -54 -250 C -42 -300 -32 -380 -28 -480 Z')}" fill="${S.mid}" filter="url(#pk_${sk})"/>
    <ellipse cx="${k * 92}" cy="-255" rx="34" ry="26" fill="${S.hi}" opacity=".35" filter="url(#soft2)"/>
    <path d="${mx(k, 'M -150 -18 L -44 -24 M -140 -40 L -50 -50 M -126 -62 L -54 -66')}" stroke="#4a2e1a" stroke-width="9" opacity=".9"/></g>`).join('');
}

// a thick neck that flows into the trapezius, with a shadow under the jaw
const gneck = (S, sk) => `<path d="M-48 -1012 L48 -1012 L54 -962 C84 -950 120 -944 150 -934 L-150 -934 C-120 -944 -84 -950 -54 -962 Z" fill="${S.neck}" filter="url(#pks_${sk})"/>
  <path d="M-46 -1000 Q0 -978 46 -1000" stroke="${S.deep}" stroke-width="16" fill="none" opacity=".45" filter="url(#soft)"/>
  <path d="M-30 -968 L-24 -944 M30 -968 L24 -944" stroke="${S.shade}" stroke-width="7" opacity=".35" filter="url(#soft2)"/>`;
// body: 'tunic' (the night before) or 'arena' (bare chest, wide bronze belt, loincloth, manica)
function gladBody({ mode = 'tunic', tunic = '#8a7458' } = {}) {
  return ({ g, S, sk, e, legs, neck }) => {
    const id = g('gb');
    const garm = (k, ang) => e[k < 0 ? 'noArmL' : 'noArmR'] ? '' : e[k < 0 ? 'armL' : 'armR'] ? (() => { const P0 = e[k < 0 ? 'armL' : 'armR'];
      return posedArm(k, [k * 158, -915], P0.el, P0.wr, { r1: 36, r2: 27, r3: 21, S, sk, sleeve: tunic, sleeveLen: .45, band: '#d8ccb0', hand: P0.hand, hrot: P0.hrot, hs: P0.hs ?? 1.4 }); })()
      : `<g transform="rotate(${F1(ang)} ${k * 158} -925)">${posedArm(k, [k * 158, -915], [k * 184, -790], [k * 180, -668], { r1: 36, r2: 27, r3: 21, S, sk, sleeve: tunic, sleeveLen: .45, band: '#d8ccb0', hand: 'relaxed', hs: 1.4 })}</g>`;
    const arms = garm(-1, e.raiseLeft || 0) + garm(1, -(e.raiseRight || 0));
    const chest = `<path d="M-66 -994 C-128 -984 -178 -968 -190 -925 L-176 -640 Q0 -618 176 -640 L190 -925 C178 -968 128 -984 66 -994 Z" fill="url(#${id}s)" filter="url(#pk_${sk})"/>
      <g filter="url(#soft)" opacity=".6"><path d="M-140 -830 Q-74 -790 -12 -818" stroke="${S.shade}" stroke-width="14" fill="none"/><path d="M140 -830 Q74 -790 12 -818" stroke="${S.deep}" stroke-width="16" fill="none"/>
        <path d="M0 -910 L0 -664" stroke="${S.shade}" stroke-width="9"/><path d="M-64 -760 Q0 -748 64 -760 M-58 -716 Q0 -706 58 -716 M-54 -676 Q0 -668 54 -676" stroke="${S.shade}" stroke-width="8" fill="none"/>
        <path d="M-130 -910 Q-84 -890 -40 -898" stroke="${S.hi}" stroke-width="14" fill="none"/><path d="M-100 -790 Q-70 -760 -30 -770" stroke="${S.hi}" stroke-width="8" fill="none" opacity=".6"/></g>
      <path d="M-120 -860 L-60 -810 M70 -900 L118 -846" stroke="#e2b29c" stroke-width="5" opacity=".55"/>`;
    if (mode === 'tunic') {
      const tp = 'M-66 -994 C-130 -984 -180 -968 -194 -925 L-182 -640 C-188 -580 -196 -520 -204 -440 Q0 -416 204 -440 C196 -520 188 -580 182 -640 L194 -925 C180 -968 130 -984 66 -994 Z';
      return `<defs>${linG(id + 't', [lighten(tunic, .22), tunic, darken(tunic, .45)], { user: [-210, 0, 210, 0] })}${linG(id + 's', [S.hi, S.mid, S.lo], { user: [-180, 0, 180, 0] })}</defs>
        ${gladLegs(S, sk, e)}
        <path d="${tp}" fill="url(#${id}t)" filter="url(#pcl)"/>
        <g filter="url(#soft)" opacity=".5"><path d="M-110 -620 C-122 -540 -140 -480 -150 -432" stroke="${darken(tunic, .55)}" stroke-width="12" fill="none"/>
          <path d="M70 -620 C76 -540 82 -480 86 -430" stroke="${darken(tunic, .6)}" stroke-width="14" fill="none"/><path d="M-50 -900 Q-60 -780 -70 -660" stroke="${lighten(tunic, .3)}" stroke-width="10" fill="none"/></g>
        <path d="M-60 -992 Q0 -930 60 -992" fill="${S.mid}" filter="url(#pks_${sk})"/>
        <path d="M-182 -660 Q0 -638 182 -660 L180 -626 Q0 -604 -180 -626 Z" fill="#3a2a1c" filter="url(#pcsl)"/>
        ${arms}${gneck(S, sk)}`;
    }
    return `<defs>${linG(id + 's', [S.hi, S.mid, S.lo], { user: [-180, 0, 180, 0] })}</defs>
      ${gladLegs(S, sk, e)}
      <path d="M-176 -630 Q0 -612 176 -630 L196 -470 Q120 -440 0 -500 Q-120 -440 -196 -470 Z" fill="#e8e0cc" filter="url(#pcl)"/>
      <path d="M-40 -520 Q0 -470 40 -520" stroke="#b8ae98" stroke-width="8" fill="none" opacity=".7"/>
      ${chest}
      <path d="M-182 -664 Q0 -640 182 -664 L180 -594 Q0 -570 -180 -594 Z" fill="url(#bronzeG)" filter="url(#pcsl)"/>
      <path d="M-180 -644 Q0 -622 180 -644" stroke="#3e2a10" stroke-width="4" fill="none" opacity=".5"/>
      ${[-120, -60, 0, 60, 120].map(x => `<circle cx="${x}" cy="${-628 + Math.abs(x) * .04}" r="9" fill="#fff3c0" opacity=".5"/>`).join('')}
      ${arms}${gneck(S, sk)}`;
  };
}

// secutor helmet: smooth bronze egg with two tiny eye-holes and a low fin. Worn (hat) or carried (prop)
const SECUTOR_PATH = 'M-104 -900 C-124 -980 -126 -1100 -96 -1180 C-70 -1240 -30 -1262 0 -1262 C30 -1262 70 -1240 96 -1180 C126 -1100 124 -980 104 -900 C70 -880 -70 -880 -104 -900 Z';
function secutorHelm({ shine = 1 } = {}) {
  return `<path d="${SECUTOR_PATH}" fill="url(#bronzeG)" filter="url(#pcl)"/>
    <path d="M-8 -1262 C-10 -1300 10 -1300 8 -1262 L10 -1150 L-10 -1150 Z" fill="#8f6428" filter="url(#pcsl)"/>
    <path d="M0 -1290 C40 -1280 70 -1240 88 -1190" stroke="#e9c27a" stroke-width="9" fill="none" opacity=".6" filter="url(#soft2)"/>
    <circle cx="-30" cy="-1090" r="11" fill="#0b0805"/><circle cx="30" cy="-1090" r="11" fill="#0b0805"/>
    <circle cx="-30" cy="-1090" r="15" fill="none" stroke="#5e4018" stroke-width="5"/><circle cx="30" cy="-1090" r="15" fill="none" stroke="#5e4018" stroke-width="5"/>
    <path d="M-104 -900 C-70 -880 70 -880 104 -900 L110 -880 C70 -860 -70 -860 -110 -880 Z" fill="#6e4c1e" filter="url(#pcsl)"/>
    <ellipse cx="-50" cy="-1170" rx="24" ry="60" fill="#fff6d8" opacity="${(.28 * shine).toFixed(2)}" transform="rotate(18 -50 -1170)" filter="url(#soft)"/>`;
}

const GLAD_TUNIC = { skin: 'medium', hair: 'bald', hairColor: 'black', beard: 'none', top: 'vest', legs: 'none', eyeColor: '#3a2a1e', browW: 13, id: 'gt',
  body: gladBody({ mode: 'tunic' }), faceExtra: gladFace };
const GLAD_BARE = { ...GLAD_TUNIC, id: 'gb', body: gladBody({ mode: 'arena' }) };
const GLAD_HELM = { ...GLAD_BARE, id: 'gh', hat: 'helm', customHat: () => secutorHelm() };

// ---------- the retiarius: no helmet, shoulder guard, net and trident ----------
function retiBody() {
  return ({ g, S, sk, e, legs, neck }) => {
    const id = g('rb');
    return `<defs>${linG(id + 's', [S.hi, S.mid, S.lo], { user: [-180, 0, 180, 0] })}</defs>
      ${legs}
      <path d="M-176 -630 Q0 -612 176 -630 L190 -480 Q0 -500 -190 -480 Z" fill="#cfc4a8" filter="url(#pcl)"/>
      <path d="M-62 -992 C-120 -982 -168 -968 -180 -925 L-170 -640 Q0 -620 170 -640 L180 -925 C168 -968 120 -982 62 -992 Z" fill="url(#${id}s)" filter="url(#pk_${sk})"/>
      <g filter="url(#soft)" opacity=".5"><path d="M-130 -820 Q-70 -790 -14 -812" stroke="${S.shade}" stroke-width="12" fill="none"/><path d="M130 -820 Q70 -790 14 -812" stroke="${S.deep}" stroke-width="14" fill="none"/><path d="M0 -900 L0 -680" stroke="${S.shade}" stroke-width="8"/></g>
      <path d="M-178 -662 Q0 -640 178 -662 L176 -616 Q0 -594 -176 -616 Z" fill="#5a3a20" filter="url(#pcsl)"/>
      ${e.noArmL ? '' : gladArm(-1, e.raiseLeft || 0, { S, sk })}${e.noArmR ? '' : gladArm(1, -(e.raiseRight || 0), { S, sk, manica: true })}
      ${neck}
      <path d="M120 -1010 C160 -1060 214 -1040 230 -980 L210 -900 C190 -930 160 -950 130 -948 Z" fill="url(#steelG)" filter="url(#pcl)"/>`;
  };
}
const RETI = { skin: 'light', hair: 'short', hairColor: 'brown', beard: 'stubble', top: 'vest', eyeColor: '#4a5a3a', browW: 9, id: 'rt', body: retiBody() };

// ---------- the man who paid for the games: toga with a purple border, rings, heavy jowls ----------
function togaBody({ wool = '#ece4d2', stripe = '#5e1d4c' } = {}) {
  return ({ g, S, sk, e, arm, legs, neck }) => {
    const id = g('tg');
    return `<defs>${linG(id + 'w', [lighten(wool, .3), wool, darken(wool, .32)], { user: [-230, 0, 230, 0] })}</defs>
      ${legs}
      <path d="M-70 -994 C-140 -984 -194 -968 -210 -920 L-206 -620 C-212 -560 -220 -500 -226 -430 Q0 -404 226 -430 C220 -500 212 -560 206 -620 L210 -920 C194 -968 140 -984 70 -994 Z" fill="url(#${id}w)" filter="url(#pcl)"/>
      ${arm(-1)}${arm(1)}
      ${neck}
      <path d="M-200 -930 C-120 -880 -20 -780 90 -560 L150 -560 C40 -780 -60 -900 -140 -960 Z" fill="url(#${id}w)" filter="url(#pcl)"/>
      <path d="M-200 -930 C-120 -880 -20 -780 90 -560" stroke="${stripe}" stroke-width="22" fill="none" filter="url(#pcsl)"/>
      <g filter="url(#soft)" opacity=".45"><path d="M-150 -880 C-80 -820 -10 -720 60 -600" stroke="${darken(wool, .4)}" stroke-width="12" fill="none"/>
        <path d="M120 -900 C140 -800 150 -700 156 -600" stroke="${darken(wool, .35)}" stroke-width="10" fill="none"/></g>`;
  };
}
const editorFace = () => `<g filter="url(#soft)" opacity=".55"><ellipse cx="-56" cy="-990" rx="30" ry="22" fill="#b06a52"/><ellipse cx="56" cy="-990" rx="30" ry="22" fill="#9a5844"/></g>
  <path d="M-48 -962 Q0 -940 48 -962" stroke="#9a5844" stroke-width="5" fill="none" opacity=".6" filter="url(#soft2)"/>
  <path d="M-40 -1046 q-6 10 -2 18 M40 -1046 q6 10 2 18" stroke="#9a5844" stroke-width="3" fill="none" opacity=".5"/>`;
const EDITOR = { skin: 'light', hair: 'bald', hairColor: 'grey', beard: 'none', top: 'robe', robe: '#ece4d2', trim: '#5e1d4c', eyeColor: '#4a3a30', browW: 9, id: 'ed',
  body: togaBody({}), faceExtra: editorFace };

// ---------- Romans at the feast and in the street ----------
const ROMANS = {
  fat: { skin: 'light', hair: 'short', hairColor: 'grey', beard: 'none', top: 'robe', robe: '#9a7a3c', trim: '#c49a3c', eyeColor: '#4a3a30', browW: 8, id: 'rf', faceExtra: editorFace, necklace: true },
  beard: { skin: 'medium', hair: 'short', hairColor: 'black', beard: 'full', top: 'robe', robe: '#6b2a26', trim: '#a07a3a', eyeColor: '#2a1e14', browW: 9, id: 'rb' },
  thin: { skin: 'light', hair: 'forelock', hairColor: 'brown', beard: 'stubble', top: 'robe', robe: '#4a5a3a', trim: '#8a7a4a', eyeColor: '#5a6a4a', browW: 7, id: 'rn' },
  bald: { skin: 'deep', hair: 'bald', hairColor: 'black', beard: 'mustache', top: 'robe', robe: '#3e4a62', trim: '#9a8a5a', eyeColor: '#1e140c', browW: 8, id: 'rd' },
  woman: { skin: 'light', hair: 'long', hairColor: 'red', beard: 'none', top: 'robe', robe: '#7a3a5a', trim: '#c49a3c', eyeColor: '#5a7a6a', browW: 6, id: 'rw', necklace: true },
};

// ---------- the man in the god's mask (Mercury: winged cap, bone-white face, black eyes) ----------
function wingedCap() {
  return () => `<path d="M-96 -1110 C-100 -1190 -60 -1236 0 -1238 C60 -1236 100 -1190 96 -1110 C60 -1130 -60 -1130 -96 -1110 Z" fill="#1a1816" filter="url(#pcl)"/>
    <path d="M-120 -1110 Q0 -1150 120 -1110 L116 -1094 Q0 -1132 -116 -1094 Z" fill="#2a2622" filter="url(#pcsl)"/>
    ${[-1, 1].map(k => `<g filter="url(#pcsl)"><path d="${mx(k, 'M -92 -1160 C -140 -1200 -190 -1240 -220 -1236 C -190 -1210 -170 -1190 -160 -1170 C -186 -1176 -206 -1170 -214 -1160 C -180 -1150 -140 -1146 -100 -1140 Z')}" fill="#cfc8b8"/>
      <path d="${mx(k, 'M -110 -1166 L -196 -1222 M -112 -1156 L -190 -1176')}" stroke="#8a8274" stroke-width="3" opacity=".7"/></g>`).join('')}`;
}
const maskFace = () => `<path d="M-74 -1130 C-80 -1060 -70 -1010 -50 -982 C-34 -962 -14 -952 0 -952 C14 -952 34 -962 50 -982 C70 -1010 80 -1060 74 -1130 C60 -1160 30 -1172 0 -1172 C-30 -1172 -60 -1160 -74 -1130 Z" fill="#e6e0d2" filter="url(#pcl)"/>
  <path d="M-74 -1130 C-80 -1060 -70 -1010 -50 -982 C-34 -962 -14 -952 0 -952" stroke="#9a9282" stroke-width="10" fill="none" opacity=".45" filter="url(#soft)"/>
  <ellipse cx="-30" cy="-1084" rx="20" ry="13" fill="#050304"/><ellipse cx="30" cy="-1084" rx="20" ry="13" fill="#050304"/>
  <path d="M-52 -1104 Q-30 -1112 -10 -1102 M52 -1104 Q30 -1112 10 -1102" stroke="#8a8272" stroke-width="5" fill="none" opacity=".6"/>
  <path d="M0 -1080 L-8 -1030 L8 -1030 Z" fill="#c9c1b0" opacity=".8"/>
  <path d="M-22 -1000 Q0 -996 22 -1000" stroke="#4a443c" stroke-width="4" fill="none"/>
  <path d="M40 -1140 l-10 30 l8 22" stroke="#8a8272" stroke-width="2" fill="none" opacity=".6"/>`;
function wingedHood() {
  return () => `${sickHood('#0d0b0a')()}
    ${[-1, 1].map(k => `<g filter="url(#pcsl)"><path d="${mx(k, 'M -118 -1120 C -150 -1150 -190 -1186 -214 -1184 C -194 -1162 -182 -1146 -176 -1128 C -196 -1132 -212 -1126 -218 -1116 C -190 -1108 -150 -1104 -120 -1100 Z')}" fill="#bdb6a6"/>
      <path d="${mx(k, 'M -128 -1124 L -196 -1172 M -128 -1112 L -196 -1122')}" stroke="#7a7264" stroke-width="3" opacity=".7"/></g>`).join('')}`;
}
const MASKED = { skin: 'light', hair: 'bald', hairColor: 'black', beard: 'none', hat: 'mask', customHat: wingedHood(), top: 'robe', robe: '#16120f', trim: '#26201a',
  eyeColor: '#000', id: 'mk', faceExtra: maskFace, ears: () => '' };

// ---------- the sick, waiting with cups (hooded, pale) ----------
function sickHood(col = '#3a3428') {
  return () => `<path d="M-130 -930 C-150 -1000 -150 -1090 -134 -1150 C-112 -1214 -56 -1240 4 -1240 C64 -1240 116 -1214 138 -1150 C152 -1090 150 -1000 130 -930 C120 -1020 104 -1100 72 -1140 C40 -1168 -40 -1168 -72 -1140 C-104 -1100 -120 -1020 -130 -930 Z" fill="${col}" filter="url(#pcl)"/>
    <path d="M-90 -1140 C-50 -1176 50 -1176 90 -1140" stroke="${darken(col, .6)}" stroke-width="16" fill="none" opacity=".7" filter="url(#soft)"/>`;
}
const sickFace = () => `<g filter="url(#soft)" opacity=".6"><ellipse cx="-30" cy="-1070" rx="28" ry="14" fill="#4a4436"/><ellipse cx="30" cy="-1070" rx="28" ry="14" fill="#4a4436"/>
  <ellipse cx="-52" cy="-1020" rx="14" ry="30" fill="#5a5444"/><ellipse cx="52" cy="-1020" rx="14" ry="30" fill="#5a5444"/></g>`;
const SICK = {
  old: { skin: 'pale', hair: 'short', hairColor: 'grey', beard: 'full', hat: 'hood', customHat: sickHood('#3a3428'), top: 'robe', robe: '#3a3428', trim: '#2a261e', eyeColor: '#6a6a50', browW: 7, id: 'so', faceExtra: sickFace },
  woman: { skin: 'pale', hair: 'long', hairColor: 'grey', beard: 'none', hat: 'hood', customHat: sickHood('#2e3230'), top: 'robe', robe: '#2e3230', trim: '#22241f', eyeColor: '#5a6a5a', browW: 6, id: 'sw', faceExtra: sickFace },
  man: { skin: 'pale', hair: 'short', hairColor: 'brown', beard: 'stubble', hat: 'hood', customHat: sickHood('#40362a'), top: 'robe', robe: '#40362a', trim: '#2a2218', eyeColor: '#5a5a40', browW: 8, id: 'sm', faceExtra: sickFace },
};

// ---------- props (drawn in a person's local coords, or anywhere) ----------
function goldCoin(x, y, r = 18, rot = 0) {
  return `<g transform="translate(${F1(x)} ${F1(y)}) rotate(${F1(rot)}) scale(1 .5)"><circle r="${r}" fill="url(#coinG)"/><circle r="${r * .68}" fill="none" stroke="#8a6420" stroke-width="2.5"/><circle cx="${-r * .3}" cy="${-r * .3}" r="${r * .22}" fill="#fff" opacity=".6"/></g>`;
}
function coinStack(x, y, n = 6, r = 22) {
  let s = '';
  for (let i = 0; i < n; i++) s += `<g transform="translate(${F1(x + Math.sin(i * 2.1) * 3)} ${F1(y - i * 7)})"><ellipse rx="${r}" ry="${r * .45}" fill="#7a5418"/><ellipse cy="-3" rx="${r}" ry="${r * .45}" fill="url(#coinG)"/></g>`;
  return s;
}
function coinPouch(x, y, s = 1, rot = 0) {
  return `<g transform="translate(${F1(x)} ${F1(y)}) rotate(${F1(rot)}) scale(${s})">
    <path d="M-70 0 C-90 -60 -60 -120 -20 -130 L20 -130 C60 -120 90 -60 70 0 C40 20 -40 20 -70 0 Z" fill="#6e4a2a" filter="url(#pcl)"/>
    <path d="M-30 -130 C-36 -150 -16 -170 0 -160 C16 -170 36 -150 30 -130 Z" fill="#5a3a20"/>
    <path d="M-34 -126 Q0 -112 34 -126" stroke="#c49a3c" stroke-width="7" fill="none"/>
    <path d="M-40 -90 C-50 -60 -46 -30 -30 -10" stroke="#9a7048" stroke-width="10" fill="none" opacity=".5" filter="url(#soft2)"/></g>`;
}
function roastLeg(x, y, s = 1, rot = 0, bite = 0) {
  return `<g transform="translate(${F1(x)} ${F1(y)}) rotate(${F1(rot)}) scale(${s})">
    <path d="M-15 20 L-13 150 C-36 154 -40 188 -16 192 C-18 210 8 214 12 194 C38 198 40 162 15 154 L17 20 Z" fill="#efe6d4" filter="url(#pcsl)"/>
    <path d="M-6 160 C-14 172 -10 186 0 188" stroke="#fff" stroke-width="5" fill="none" opacity=".6"/>
    <path d="M-88 -78 C-98 -158 -44 -204 4 -198 C60 -192 100 -146 88 -78 C80 -26 46 14 24 38 C12 50 -10 50 -24 38 C-46 14 -82 -26 -88 -78 Z" fill="#7e3c18" filter="url(#pcl)"/>
    <path d="M-62 -126 C-42 -176 20 -184 54 -146" stroke="#d48c46" stroke-width="18" fill="none" opacity=".7" stroke-linecap="round" filter="url(#softW2)"/>
    <path d="M-70 -60 C-60 -20 -30 10 -10 24" stroke="#c07434" stroke-width="10" fill="none" opacity=".5" filter="url(#softW2)"/>
    <g fill="#4a200a" opacity=".55"><ellipse cx="30" cy="-90" rx="16" ry="9"/><ellipse cx="-30" cy="-40" rx="12" ry="7"/><ellipse cx="44" cy="-30" rx="10" ry="6"/><ellipse cx="-10" cy="-140" rx="9" ry="5"/></g>
    ${bite ? `<path d="M-98 -110 c14 -4 18 10 30 6 c10 12 -2 22 10 32 c-10 10 4 22 -6 32 c-14 2 -22 -8 -34 -2 Z" fill="#e8b48a" filter="url(#pcsl)"/><path d="M-80 -96 l14 8 M-82 -70 l12 4" stroke="#b06a40" stroke-width="4"/>` : ''}</g>`;
}
function breadLoaf(x, y, s = 1) {
  return `<g transform="translate(${F1(x)} ${F1(y)}) scale(${s})"><ellipse rx="90" ry="46" fill="#a86a2c" filter="url(#pcl)"/>
    ${[-50, -17, 17, 50].map(a => `<path d="M${a - 12} -34 Q${a} -10 ${a + 12} 30" stroke="#5a3410" stroke-width="5" fill="none" opacity=".6"/>`).join('')}
    <ellipse cx="-20" cy="-18" rx="40" ry="14" fill="#e8b070" opacity=".5" filter="url(#soft2)"/></g>`;
}
function grapes(x, y, s = 1) {
  let g = '';
  [[0, 0], [-22, -12], [22, -12], [-12, 14], [12, 14], [0, 28], [-30, 10], [30, 10], [0, -24]].forEach(([dx, dy]) => g += `<circle cx="${dx}" cy="${dy}" r="15" fill="#5a2a4e"/><circle cx="${dx - 5}" cy="${dy - 5}" r="4" fill="#d9a8d0" opacity=".7"/>`);
  return `<g transform="translate(${F1(x)} ${F1(y)}) scale(${s})" filter="url(#pcsl)">${g}<path d="M0 -36 L4 -60" stroke="#4a3a1a" stroke-width="6"/></g>`;
}
function cup(x, y, s = 1, { col = '#8a4a2a', fill = 0, steam = 0, t = 0 } = {}) {
  const st = steam ? [0, 1, 2].map(i => { const p = ((t * .6 + i / 3) % 1); return `<circle cx="${F1(Math.sin(t * 2 + i) * 10 * p)}" cy="${F1(-60 - 120 * p)}" r="${F1(10 + 24 * p)}" fill="#e8e0d8" opacity="${(.35 * steam * Math.sin(Math.PI * p)).toFixed(2)}"/>`; }).join('') : '';
  return `<g transform="translate(${F1(x)} ${F1(y)}) scale(${s})">
    <path d="M-44 -50 L44 -50 L34 30 C30 44 -30 44 -34 30 Z" fill="${col}" filter="url(#pcl)"/>
    <ellipse cy="-50" rx="44" ry="12" fill="${darken(col, .5)}"/>
    ${fill ? `<ellipse cy="-50" rx="38" ry="9" fill="#5a0606"/><ellipse cx="-10" cy="-52" rx="14" ry="3" fill="#c0302a" opacity=".6"/>` : ''}
    <path d="M44 -36 C70 -36 72 6 40 8" stroke="${darken(col, .2)}" stroke-width="9" fill="none"/>
    <g filter="url(#b8)">${st}</g></g>`;
}
function jug(x, y, s = 1) {
  return `<g transform="translate(${F1(x)} ${F1(y)}) scale(${s})"><path d="M-30 -170 L30 -170 L24 -130 C70 -110 80 -30 60 10 C50 30 -50 30 -60 10 C-80 -30 -70 -110 -24 -130 Z" fill="#a4582e" filter="url(#pcl)"/>
    <path d="M-40 -60 Q0 -40 40 -60" stroke="#4a2410" stroke-width="6" fill="none" opacity=".6"/><path d="M30 -150 C70 -150 76 -100 50 -90" stroke="#8a4424" stroke-width="10" fill="none"/></g>`;
}
function trident(x, y, len = 1300, rot = 0) {
  return `<g transform="translate(${F1(x)} ${F1(y)}) rotate(${F1(rot)})">
    <rect x="-9" y="${-len}" width="18" height="${len}" rx="6" fill="url(#woodG)" filter="url(#pcs)"/>
    <path d="M-70 ${-len + 20} L70 ${-len + 20} L70 ${-len - 30} L58 ${-len - 30} L58 ${-len + 6} L6 ${-len + 6} L6 ${-len - 120} L0 ${-len - 150} L-6 ${-len - 120} L-6 ${-len + 6} L-58 ${-len + 6} L-58 ${-len - 30} L-70 ${-len - 30} Z" fill="url(#steelG)" filter="url(#pcs)"/>
    <path d="M58 ${-len - 30} L64 ${-len - 64} L70 ${-len - 30} M-70 ${-len - 30} L-64 ${-len - 64} L-58 ${-len - 30}" fill="#c9ced6"/></g>`;
}
function gladius(x, y, rot = 0, s = 1) {
  return `<g transform="translate(${F1(x)} ${F1(y)}) rotate(${F1(rot)}) scale(${s})">
    <path d="M-16 -40 L-14 -400 L0 -460 L14 -400 L16 -40 Z" fill="url(#steelG)" filter="url(#pcs)"/><path d="M0 -440 L0 -50" stroke="#fff" stroke-width="3" opacity=".5"/>
    <rect x="-50" y="-44" width="100" height="20" rx="8" fill="url(#bronzeG)"/><rect x="-14" y="-24" width="28" height="90" rx="10" fill="#4a2e1a" filter="url(#pcs)"/><circle cy="74" r="20" fill="url(#bronzeG)"/></g>`;
}
// big curved scutum, red with a bronze boss and gold lightning
function scutum(x, y, s = 1, rot = 0) {
  return `<g transform="translate(${F1(x)} ${F1(y)}) rotate(${F1(rot)}) scale(${s})">
    <path d="M-150 -300 Q0 -330 150 -300 L150 300 Q0 330 -150 300 Z" fill="#8e1e18" filter="url(#pcl)"/>
    <path d="M-150 -300 Q0 -330 150 -300 L150 300 Q0 330 -150 300 Z" fill="none" stroke="url(#bronzeG)" stroke-width="16"/>
    <path d="M-60 -200 L-10 -60 L-50 -60 L10 120 L-20 120 L40 230" stroke="#d9b04c" stroke-width="12" fill="none" opacity=".85"/>
    <path d="M60 -200 L10 -60 L50 -60 L-10 120 L20 120 L-40 230" stroke="#d9b04c" stroke-width="12" fill="none" opacity=".85"/>
    <circle r="56" fill="url(#bronzeG)" filter="url(#pcsl)"/><circle cx="-14" cy="-14" r="16" fill="#fff3c8" opacity=".55"/>
    <path d="M-150 -300 L-150 300" stroke="#fff" stroke-width="10" opacity=".15"/></g>`;
}
// a weighted rope net. spread 0 = bundled in a hand, 1 = fully open (w x h); drawn around (x, y)
function net(x, y, w = 700, h = 520, spread = 1, rot = 0, { col = '#cdbf9a', t = 0 } = {}) {
  const W = w * (.2 + .8 * spread), H = h * (.2 + .8 * spread);
  let d = '';
  const n = 9;
  for (let i = 0; i <= n; i++) {
    const p = i / n, sag = Math.sin(p * Math.PI) * 30 * spread;
    d += `M${F1(-W / 2)} ${F1(-H / 2 + p * H)} Q0 ${F1(-H / 2 + p * H + sag + Math.sin(t * 6 + i) * 6)} ${F1(W / 2)} ${F1(-H / 2 + p * H)} `;
    d += `M${F1(-W / 2 + p * W)} ${F1(-H / 2)} Q${F1(-W / 2 + p * W + sag * .6)} 0 ${F1(-W / 2 + p * W)} ${F1(H / 2)} `;
  }
  let weights = '';
  for (let i = 0; i <= 6; i++) weights += `<circle cx="${F1(-W / 2 + i * W / 6)}" cy="${F1(H / 2 + 6)}" r="${F1(9 + 5 * spread)}" fill="#5a5048"/>`;
  return `<g transform="translate(${F1(x)} ${F1(y)}) rotate(${F1(rot)})">
    <path d="${d}" stroke="#2a2218" stroke-width="${F1(7 + 3 * spread)}" fill="none" opacity=".5" transform="translate(4 6)"/>
    <path d="${d}" stroke="${col}" stroke-width="${F1(5 + 3 * spread)}" fill="none" stroke-linecap="round"/>${weights}</g>`;
}
function hotIron(x, y, rot = 0, s = 1, { glow = 1, t = 0 } = {}) {
  const f = .8 + .2 * Math.sin(t * 17);
  return `<g transform="translate(${F1(x)} ${F1(y)}) rotate(${F1(rot)}) scale(${s})">
    <rect x="-10" y="-40" width="20" height="300" rx="6" fill="#2a2420" filter="url(#pcs)"/>
    <rect x="-8" y="-420" width="16" height="390" fill="#3a3632"/>
    <rect x="-9" y="-470" width="18" height="140" rx="6" fill="#ff7a1a"/>
    <rect x="-6" y="-466" width="12" height="80" rx="5" fill="#fff0b0"/>
    <circle cy="-430" r="${F1(80 * glow * f)}" fill="url(#hotG)" opacity="${(.8 * glow).toFixed(2)}" style="mix-blend-mode:screen"/></g>`;
}
function mallet(x, y, rot = 0, s = 1) {
  return `<g transform="translate(${F1(x)} ${F1(y)}) rotate(${F1(rot)}) scale(${s})">
    <rect x="-12" y="-560" width="24" height="600" rx="8" fill="url(#woodG)" filter="url(#pcs)"/>
    <path d="M-110 -660 L110 -660 C124 -660 130 -650 130 -636 L130 -500 C130 -486 124 -476 110 -476 L-110 -476 C-124 -476 -130 -486 -130 -500 L-130 -636 C-130 -650 -124 -660 -110 -660 Z" fill="url(#woodG)" filter="url(#pcl)"/>
    <rect x="-130" y="-640" width="22" height="144" fill="#3a3632"/><rect x="108" y="-640" width="22" height="144" fill="#3a3632"/></g>`;
}
// a fallen body (dark silhouette shapes, nothing graphic): lying along +x, head at the left
function body(x, y, s = 1, rot = 0, { col = '#1a1410', rim = '#ff9a4a', rimOp = .35, arm = 0 } = {}) {
  return `<g transform="translate(${F1(x)} ${F1(y)}) rotate(${F1(rot)}) scale(${s})">
    <ellipse cx="-230" cy="-40" rx="62" ry="54" fill="${col}"/>
    <path d="M-180 -90 C-80 -110 80 -100 160 -80 L170 0 C80 10 -80 10 -180 0 Z" fill="${col}"/>
    <path d="M160 -70 L420 -60 L420 -20 L160 -10 Z" fill="${col}"/><path d="M160 -40 L400 10 L396 40 L150 0 Z" fill="${col}"/>
    <path d="M-120 -96 C-60 -140 ${F1(-20 + arm * 40)} ${F1(-160 - arm * 60)} ${F1(20 + arm * 30)} ${F1(-150 - arm * 90)}" stroke="${col}" stroke-width="34" stroke-linecap="round" fill="none"/>
    <path d="M-280 -70 C-240 -100 -160 -112 -60 -110 C40 -110 120 -100 170 -86" stroke="${rim}" stroke-width="6" fill="none" opacity="${rimOp}" filter="url(#soft2)"/></g>`;
}

// ---------- the lion: layered shaggy mane, deep-set eyes; roar = jaw drops, fangs, nose wrinkles. dark = sunk in shadow ----------
// one tapered lock of mane from (x,y) along angle a, length L, base width w, drooping with gravity
function maneLock(x, y, a, L, w, droop, col, op = 1) {
  const dx = Math.cos(a), dy = Math.sin(a), px = -dy, py = dx;
  const tx = x + dx * L, ty = y + dy * L + droop;
  const cx = x + dx * L * .55 + px * w * .3, cy = y + dy * L * .55 + droop * .3;
  return `<path d="M${F1(x + px * w / 2)} ${F1(y + py * w / 2)} Q${F1(cx + px * w * .4)} ${F1(cy + py * w * .4)} ${F1(tx)} ${F1(ty)} Q${F1(cx - px * w * .4)} ${F1(cy - py * w * .4)} ${F1(x - px * w / 2)} ${F1(y - py * w / 2)} Z" fill="${col}" opacity="${op}"/>`;
}
function lionHead({ t = 0, roar = 0, dark = 0, rim = '#9ab0d8', rimOp = .55, eyeGlow = 1 } = {}) {
  const id = fid('ln'), R = rng(77), jaw = 130 * roar, sq = 1 - .5 * roar, sway = Math.sin(t * 1.4) * .03 * (1 + 2 * roar);
  const layers = [['#1a1006', '#24160a', '#2e1c0e'], ['#3a2412', '#4a2e16', '#5a3a1e'], ['#6e4826', '#86592e', '#9a6a38']];
  let mane = '';
  layers.forEach((cols, li) => {
    const n = [70, 60, 46][li], r0 = [170, 160, 150][li], len = [330, 250, 150][li], wid = [70, 60, 46][li];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + (R() - .5) * .2 + sway * Math.sin(i);
      const bx = Math.cos(a) * r0 * 1.02, by = Math.sin(a) * r0 * 1.12 - 20;
      const L = len * (.75 + R() * .5) * (Math.sin(a) > 0 ? 1.25 : 1), droop = (60 + R() * 90) * (li === 2 ? .4 : 1);
      mane += maneLock(bx, by, a + (R() - .5) * .3, L, wid * (.8 + R() * .5), droop, cols[Math.floor(R() * 3)], li === 2 ? .85 : 1);
    }
  });
  const face = 'M-150 -170 C-120 -230 120 -230 150 -170 C176 -110 172 -40 140 20 C120 70 96 110 70 140 C40 172 -40 172 -70 140 C-96 110 -120 70 -140 20 C-172 -40 -176 -110 -150 -170 Z';
  const eye = k => { const c1 = -112 + 6 * roar, c2 = -114 + 30 * roar, bot = -66 - 6 * roar;
    return `<path d="${mx(k, `M -104 -84 C -90 ${c1} -50 ${c2} -30 -88 C -48 ${bot} -84 ${bot + 4} -104 -84 Z`)}" fill="#f2b632"/>
      <ellipse cx="${k * -66}" cy="-88" rx="8" ry="${F1(13 * sq)}" fill="#0c0603"/><circle cx="${k * -60}" cy="-94" r="4" fill="#fff" opacity=".7"/>
      <circle cx="${k * -66}" cy="-88" r="${F1(46 * eyeGlow)}" fill="#ffd060" opacity="${(.2 * eyeGlow).toFixed(2)}" filter="url(#soft)"/>`; };
  return `<g>
    <defs>${radG(id + 'f', ['#c8955c', '#9a6a3c', '#5a3818'], { cx: .38, cy: .3, r: .8 })}</defs>
    <g filter="url(#fur)">${mane}</g>
    <path d="M-300 -150 C-280 -320 -110 -420 60 -400" stroke="${rim}" stroke-width="18" fill="none" opacity="${(rimOp * .5).toFixed(2)}" filter="url(#b8)"/>
    ${[-1, 1].map(k => `<ellipse cx="${k * 128}" cy="-196" rx="44" ry="38" fill="#7a5230" filter="url(#pcsl)"/><ellipse cx="${k * 128}" cy="-190" rx="22" ry="18" fill="#2a180c"/>`).join('')}
    <path d="M-82 70 C-84 ${F1(110 + jaw * .7)} -56 ${F1(150 + jaw)} 0 ${F1(158 + jaw)} C56 ${F1(150 + jaw)} 84 ${F1(110 + jaw * .7)} 82 70 Z" fill="#b8865a" filter="url(#pcsl)"/>
    <path d="${face}" fill="url(#${id}f)" filter="url(#pcl)"/>
    <path d="M-36 -200 C-30 -120 -34 -40 -40 10 L40 10 C34 -40 30 -120 36 -200 Z" fill="#d8aa72" opacity=".5" filter="url(#soft)"/>
    <path d="M-124 ${F1(-122 - 8 * roar)} C-98 ${F1(-142 - 4 * roar)} -50 ${F1(-140 + 18 * roar)} -28 ${F1(-112 + 18 * roar)} M124 ${F1(-122 - 8 * roar)} C98 ${F1(-142 - 4 * roar)} 50 ${F1(-140 + 18 * roar)} 28 ${F1(-112 + 18 * roar)}" stroke="#2e1a0a" stroke-width="${F1(18 + 12 * roar)}" fill="none" opacity=".8" filter="url(#softW2)"/>
    ${eye(1)}${eye(-1)}
    ${roar > .05 ? `<path d="M-30 -40 Q0 -54 30 -40 M-34 -24 Q0 -38 34 -24 M-26 -60 Q0 -70 26 -60" stroke="#5a3418" stroke-width="5" fill="none" opacity="${(.8 * roar).toFixed(2)}"/>` : ''}
    ${roar > .05 ? `<path d="M-72 76 C-64 ${F1(100 + jaw * .8)} -40 ${F1(120 + jaw)} 0 ${F1(124 + jaw)} C40 ${F1(120 + jaw)} 64 ${F1(100 + jaw * .8)} 72 76 C40 86 -40 86 -72 76 Z" fill="#3a0806"/>
      <ellipse cx="0" cy="${F1(108 + jaw * .9)}" rx="${F1(44 * roar)}" ry="${F1(20 * roar)}" fill="#b04a44"/>
      <path d="M-60 ${F1(110 + jaw * .9)} L-50 ${F1(110 + jaw * .9 - 52 * roar)} L-38 ${F1(112 + jaw * .9)} Z M60 ${F1(110 + jaw * .9)} L50 ${F1(110 + jaw * .9 - 52 * roar)} L38 ${F1(112 + jaw * .9)} Z" fill="#e8dcc4"/>
      <path d="M-62 74 L-50 ${F1(74 + 72 * roar)} L-36 78 Z M62 74 L50 ${F1(74 + 72 * roar)} L36 78 Z" fill="#f2ead6"/>
      <path d="M-30 78 L-24 90 L-18 78 L-12 90 L-6 78 M30 78 L24 90 L18 78 L12 90 L6 78" stroke="#efe4cc" stroke-width="5" fill="none"/>` :
      `<path d="M-50 92 Q-24 104 0 94 Q24 104 50 92" stroke="#3a1a0c" stroke-width="6" fill="none"/>`}
    ${[-1, 1].map(k => `<ellipse cx="${k * 46}" cy="${F1(56 - 8 * roar)}" rx="54" ry="40" fill="#ecd6b4" filter="url(#pcsl)"/>
      ${[0, 1, 2].map(r => [0, 1, 2, 3].map(c => `<circle cx="${k * (24 + c * 16)}" cy="${F1(46 + r * 13 - 8 * roar)}" r="3" fill="#3a2414" opacity=".7"/>`).join('')).join('')}`).join('')}
    <path d="M-40 4 C-40 -22 40 -22 40 4 C30 26 10 34 0 36 C-10 34 -30 26 -40 4 Z" fill="#2e1a12" filter="url(#pcsl)"/>
    ${dark ? `<ellipse cx="0" cy="40" rx="440" ry="500" fill="#04050a" opacity="${(.93 * dark).toFixed(2)}" filter="url(#b40)"/>
      <g opacity="${(dark * eyeGlow).toFixed(2)}">${[-1, 1].map(k => `<ellipse cx="${k * 66}" cy="-90" rx="22" ry="${F1(9 * sq)}" fill="#ffd25a"/><ellipse cx="${k * 66}" cy="-90" rx="5" ry="${F1(8 * sq)}" fill="#1a0e04"/><circle cx="${k * 66}" cy="-90" r="40" fill="#ffc040" opacity=".3" filter="url(#soft)"/>`).join('')}</g>` : ''}
  </g>`;
}
