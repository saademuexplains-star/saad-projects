// era.js — the cast of "Two Bombs" (Hiroshima / Nagasaki, August 1945), in the pipeline's grammar: whole-garment bodies
// (upper sleeves under the shirt shoulder, forearms + hands in front), face2 eyes / brows / mouth, hair and caps in the
// head group, hands lit in screen space. Local coordinates as person(): head centre ≈ (0,-1075), neck -1004..-950,
// shoulders ≈ -930, waist ≈ -690, feet y = 0. +x is the character's LEFT side (screen right when facing us).

// ---------- skin ----------
SKIN_TONES.jp = { hi: '#ecc9a2', mid: '#d3a47a', lo: '#a8744e', ear: '#c99670', earDk: '#b4835c', neck: '#c08d64', shade: '#8c5c3c', deep: '#76482e',
  blush: '#b98068', nostril: '#4a2a1a', line: '#76462e', lip: '#b06e5e', mouth: '#5a2a1e', rim: '#5a2e18' };
SKIN_TONES.jpOld = { hi: '#e8c8a8', mid: '#c99e7c', lo: '#9a6e50', ear: '#c0926e', earDk: '#a87c5c', neck: '#b88866', shade: '#86583c', deep: '#6e4630',
  blush: '#b08068', nostril: '#4a2a1a', line: '#6e4230', lip: '#a46a5c', mouth: '#4e261c', rim: '#56301c' };
SKIN_TONES.jpF = { hi: '#f0d2b0', mid: '#dab08a', lo: '#b08058', ear: '#cf9e78', earDk: '#bb8a64', neck: '#c6966e', shade: '#94664a', deep: '#7c5036',
  blush: '#c88a72', nostril: '#4e2c1c', line: '#7c4c34', lip: '#b8706a', mouth: '#5a2a20', rim: '#5e321e' };
const SKJ = SKIN_TONES.jp, SKJO = SKIN_TONES.jpOld, SKJF = SKIN_TONES.jpF;
const handAng = A => Math.atan2(A.wr[1] - A.el[1], A.wr[0] - A.el[0]) * 180 / Math.PI - 90 + (A.hrot || 0);

addDefs(`
  <linearGradient id="leatherG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6e4e34"/><stop offset=".5" stop-color="#4a3220"/><stop offset="1" stop-color="#2a1a0e"/></linearGradient>
  <radialGradient id="brassG" cx=".35" cy=".35" r=".7"><stop offset="0" stop-color="#d2bf92"/><stop offset=".45" stop-color="#8a7044"/><stop offset="1" stop-color="#3a2a14"/></radialGradient>
  <linearGradient id="steelH" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c4c6c6"/><stop offset=".3" stop-color="#8e9294"/><stop offset=".7" stop-color="#585c60"/><stop offset="1" stop-color="#2a2c30"/></linearGradient>
  <linearGradient id="glassG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".55"/><stop offset=".35" stop-color="#ffffff" stop-opacity=".08"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
`);

// ---------- surface texture (flat pass only; the normal pass drops it): woven fibre + soft mottling ----------
addDefs(`<filter id="clothTex" x="-2%" y="-2%" width="104%" height="104%" color-interpolation-filters="sRGB">
  <feTurbulence type="fractalNoise" baseFrequency=".7 .16" numOctaves="2" seed="3" result="a"/>
  <feTurbulence type="fractalNoise" baseFrequency=".16 .7" numOctaves="2" seed="7" result="b"/>
  <feTurbulence type="fractalNoise" baseFrequency=".018" numOctaves="3" seed="11" result="c"/>
  <feComposite in="a" in2="b" operator="arithmetic" k2=".5" k3=".5" result="ab"/>
  <feComposite in="ab" in2="c" operator="arithmetic" k2=".72" k3=".28" result="n"/>
  <feColorMatrix in="n" type="matrix" values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1" result="g"/>
  <feComposite in="SourceGraphic" in2="g" operator="arithmetic" k1=".42" k2=".79" result="t"/>
  <feComposite in="t" in2="SourceAlpha" operator="in"/></filter>`);
const textured = svg => `<g filter="url(#clothTex)">${svg}</g>`;

// ---------- hands (wrist at (0,0), fingers toward +y; scale(-k*s, s) mirrors them; local +x is the thumb side) ----------
const handG = (id, S) => `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="-20" y1="0" x2="20" y2="0"><stop offset="0" stop-color="${darken(S.lo, .08)}"/><stop offset=".5" stop-color="${darken(S.mid, .07)}"/><stop offset="1" stop-color="${mix(S.mid, S.hi, .08)}"/></linearGradient>`;
let HGN = 0;
// a fist closed around a bar (a briefcase or bucket handle), seen from the back: the bar runs across at y ≈ 20
function handHold(k, x, y, s, rot, { S, sk }) {
  const id = 'hg' + (HGN++), fx = [-13.2, -4.4, 4.6, 13.2], fw = [8.4, 9.4, 9.2, 8.2];
  const fingers = fx.map((f, i) => capsuleD(f, 12, fw[i] / 2, f - .4, 31 - (i === 0 || i === 3 ? 1.5 : 0), fw[i] / 2 - .4)).join(' ');
  return `<g transform="translate(${F1(x)} ${F1(y)}) rotate(${F1(rot)}) scale(${F1(-k * s)} ${F1(s)})"><defs>${handG(id, S)}</defs>
    <g filter="url(#pks_${sk})" fill="url(#${id})"><path d="${capsuleD(14.5, 1, 6.6, 13.4, 22.5, 5.2)}"/></g>
    <g filter="url(#pks_${sk})" fill="url(#${id})">
      <path d="M-12 -2 C-12 -10 12 -10 12 -2 C15 3 17.5 8 18.2 13 L-17.6 13 C-17 8 -15 3 -12 -2 Z"/>
      <path d="${fingers}"/></g>
    <g filter="url(#softW2)">
      <path d="M-17 27 C-8 33 8 33 17 27" stroke="${S.deep}" stroke-width="7" fill="none" opacity=".35"/>
      <path d="M-15 12 C-6 15 6 15 15 12" stroke="${S.deep}" stroke-width="3" fill="none" opacity=".22"/>
      ${fx.map(f => `<ellipse cx="${F1(f)}" cy="10.5" rx="3.6" ry="2.6" fill="${S.hi}" opacity=".28"/>`).join('')}
      <path d="M-7 -5 L-9 9 M0 -6 L-1 9 M7 -5 L7 9" stroke="${S.hi}" stroke-width="2" opacity=".16"/></g>
    <g stroke="${S.line}" fill="none" stroke-linecap="round">
      ${[-8.8, 0, 8.9].map((f, i) => `<path d="M${f} 15 L${F1(f - .3)} ${31 - (i === 1 ? 0 : .6)}" stroke-width="1.5" opacity=".55"/>`).join('')}
      ${fx.map((f, i) => `<path d="M${F1(f - fw[i] * .32)} 22.5 Q${F1(f)} 24.5 ${F1(f + fw[i] * .32)} 22.5" stroke-width="1.1" opacity=".35"/>`).join('')}
      <path d="M11 3 C13.5 9 14 15 13.4 21" stroke-width="1.2" opacity=".4"/></g>
    <ellipse cx="13" cy="23.4" rx="2.2" ry="2.8" fill="${mix(S.mid, '#f0d8cc', .35)}" opacity=".35"/></g>`;
}
// a forefinger pointing along the forearm (other fingers curled), seen from the back of the hand
function handPoint(k, x, y, s, rot, { S, sk }) {
  const id = 'hg' + (HGN++), kn = [[1.8, 34.4, 6.2], [-5.6, 32, 5.9], [-12.6, 28.6, 5.4]];
  return `<g transform="translate(${F1(x)} ${F1(y)}) rotate(${F1(rot)}) scale(${F1(-k * s)} ${F1(s)})"><defs>${handG(id, S)}</defs>
    <g filter="url(#pks_${sk})" fill="url(#${id})"><path d="${capsuleD(15, 3, 6, 14.2, 18.5, 5)}"/></g>
    <g filter="url(#pks_${sk})" fill="url(#${id})">
      <path d="M-12 -1 C-12 -10 12 -10 12 -1 C15 6 16.6 18 16.4 30 C16.2 34 14.8 37 11 38 L-11 31 C-15 28.6 -17 24 -17 18 C-16.6 10 -15 4 -12 -1 Z"/>
      <path d="${kn.map(([a, b, r]) => capsuleD(a, b - 3.5, r, a - .8, b, r - .4)).join(' ')}"/>
      <path d="${capsuleD(10.4, 34, 6.4, 10.7, 72, 4.9)}"/></g>
    <g filter="url(#softW2)">
      <path d="M-16 28 C-9 35 -2 38 5 38" stroke="${S.deep}" stroke-width="5" fill="none" opacity=".3"/>
      ${kn.map(([a, b]) => `<ellipse cx="${F1(a - .6)}" cy="${F1(b + 1.6)}" rx="3.4" ry="2.4" fill="${S.hi}" opacity=".26"/>`).join('')}
      <path d="M6 40 C7 52 7.4 60 8 68" stroke="${S.deep}" stroke-width="3" fill="none" opacity=".25"/></g>
    <g stroke="${S.line}" fill="none" stroke-linecap="round">
      <path d="M7.6 50 Q10.6 48.6 13.6 50" stroke-width="1.1" opacity=".45"/><path d="M8 61.5 Q10.8 60.5 13.6 61.5" stroke-width="1.1" opacity=".4"/>
      <path d="M-1.8 31.6 L-2.4 38.6 M-9.4 28.6 L-10 35" stroke-width="1.4" opacity=".5"/></g>
    <path d="M7.4 64 C7.3 69 8.5 72.4 10.6 72.6 C12.7 72.4 13.7 69 13.5 64 C11.9 62.6 8.9 62.6 7.4 64 Z" fill="${mix(S.hi, '#f2d6cc', .55)}" stroke="${S.line}" stroke-width=".9" stroke-opacity=".4"/></g>`;
}
// The piece normal filter measures slopes in the piece's OWN coordinates; a hand drawn under rotate(rot) scale(-k*s, s)
// writes normals in its rotated / mirrored frame. In the normal pass, turn the encoded (R, G) normal back into screen
// space with the same rotation + mirror (id starts with "dof" so the normal-pass CSS keeps the filter).
let NFN = 0;
const normFix = (rot, k, svg) => { if (PASS() !== 'normal') return svg;
  const r = rot * Math.PI / 180, c = Math.cos(r), sn = Math.sin(r), sg = k > 0 ? -1 : 1, id = 'dofNF' + (NFN++);
  const m = [c * sg, -sn, 0, 0, .5 * (1 - c * sg + sn), sn * sg, c, 0, 0, .5 * (1 - sn * sg - c), 0, 0, 1, 0, 0, 0, 0, 0, 1, 0].map(v => +v.toFixed(4)).join(' ');
  return `<defs><filter id="${id}" x="-30%" y="-30%" width="160%" height="160%" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="${m}"/></filter></defs><g filter="url(#${id})">${svg}</g>`; };
// every hand in the kit uses the same translate / rotate / scale(-k*s, s) frame, so all of them get the fix.
// a relaxed hanging hand seen from the thumb side (+x local = the thumb / front): the back of the hand, fingers loosely
// curled toward the front, the thumb resting along them
function handRelax(k, x, y, s, rot, { S, sk }) {
  const id = 'hg' + (HGN++);
  return `<g transform="translate(${F1(x)} ${F1(y)}) rotate(${F1(rot)}) scale(${F1(-k * s)} ${F1(s)})"><defs>${handG(id, S)}</defs>
    <g filter="url(#pks_${sk})" fill="url(#${id})">
      <path d="M-11 -3 C-12 -10 11 -10 11 -3 C14 6 15 16 14 26 C16 34 14 42 8 47 C2 52 -6 52 -10 46 C-14 38 -15 26 -14 14 C-14 8 -13 2 -11 -3 Z"/>
      <path d="${capsuleD(11, 6, 5.6, 14.5, 27, 4.4)}"/></g>
    <g stroke="${S.line}" fill="none" stroke-linecap="round" opacity=".45">
      <path d="M-6 36 C-2 40 4 41 9 38 M-8 42 C-3 46 3 46 7 43" stroke-width="1.3"/><path d="M9 10 C12 16 13 22 13 27" stroke-width="1.2"/></g>
    <g filter="url(#softW2)"><path d="M-10 4 C-11 14 -11 24 -9 32" stroke="${S.hi}" stroke-width="3.5" fill="none" opacity=".3"/><ellipse cx="2" cy="44" rx="7" ry="4" fill="${S.deep}" opacity=".3"/></g>
    <ellipse cx="14.4" cy="27.6" rx="2" ry="2.6" fill="${mix(S.mid, '#f0d8cc', .35)}" opacity=".35"/></g>`;
}
// an open hand, palm toward us, fingers apart (explaining, pleading, "this big"); the thumb out to the +x side.
// spread fans the fingers; cup closes them a little toward the palm
function handOpenJ(k, x, y, s, rot, { S, sk, spread = 1, curl: cup = 0 }) {
  const id = 'hg' + (HGN++), sp = .6 + .6 * spread;
  const F = [[11.2, 34, 31, 8.6, 9], [3.6, 36.5, 35.5, 9.2, 2.5], [-4.2, 36, 33.5, 8.8, -4], [-11.6, 33.5, 26.5, 7.8, -11]].map(([bx, by, L, w, a]) => [bx, by, L * (1 - .18 * cup), w, a * sp]);
  const tip = ([bx, by, L, w, a]) => { const r = a * Math.PI / 180; return [bx - Math.sin(r) * L, by + Math.cos(r) * L]; };
  const fingers = F.map(f => { const [tx, ty] = tip(f); return capsuleD(f[0], f[1] - 4, f[3] / 2 + .4, tx, ty, f[3] / 2 - .9); }).join(' ');
  return `<g transform="translate(${F1(x)} ${F1(y)}) rotate(${F1(rot)}) scale(${F1(-k * s)} ${F1(s)})"><defs>${handG(id, S)}</defs>
    <g filter="url(#pks_${sk})" fill="url(#${id})">
      <path d="M-12 -3 C-12 -10 12 -10 12 -3 C15 6 16.5 18 15.6 32 L-15.4 33 C-16.4 22 -15.6 9 -12 -3 Z"/>
      <path d="${fingers}"/><path d="${capsuleD(12.5, 8, 7, 27.5, 27, 5.1)}"/></g>
    <g filter="url(#softW2)">
      <ellipse cx="-1" cy="18" rx="10" ry="9" fill="${S.hi}" opacity=".3"/><path d="M8 4 C4 14 3 22 6 30" stroke="${S.deep}" stroke-width="4" fill="none" opacity=".22"/></g>
    <g stroke="${S.line}" fill="none" stroke-linecap="round">
      <path d="M-13 21 Q-2 27 12 19" stroke-width="1.3" opacity=".42"/><path d="M-13 29 Q-1 33 10 28" stroke-width="1.2" opacity=".36"/><path d="M10 6 C6 14 6 22 9 28" stroke-width="1.2" opacity=".4"/>
      ${F.slice(0, 3).map((f, i) => { const g2 = F[i + 1], m0 = [(f[0] + g2[0]) / 2, (f[1] + g2[1]) / 2 + 3], t1 = tip(f), t2 = tip(g2), m1 = [(t1[0] + t2[0]) / 2, (t1[1] + t2[1]) / 2];
        return `<path d="M${F1(m0[0])} ${F1(m0[1])} L${F1(lerp(m0[0], m1[0], .72))} ${F1(lerp(m0[1], m1[1], .72))}" stroke-width="1.5" opacity=".5"/>`; }).join('')}
      ${F.map(f => { const t1 = tip(f), q = [lerp(f[0], t1[0], .55), lerp(f[1], t1[1], .55)]; return `<path d="M${F1(q[0] - f[3] * .36)} ${F1(q[1])} Q${F1(q[0])} ${F1(q[1] + 1.6)} ${F1(q[0] + f[3] * .36)} ${F1(q[1])}" stroke-width="1" opacity=".32"/>`; }).join('')}</g>
    ${F.map(f => { const t1 = tip(f); return `<ellipse cx="${F1(t1[0])}" cy="${F1(t1[1] - 4)}" rx="${F1(f[3] * .3)}" ry="2.6" fill="${S.hi}" opacity=".32"/>`; }).join('')}</g>`;
}
Object.assign(HANDS, { hold: handHold, pointF: handPoint, relax: handRelax, openJ: handOpenJ });
for (const n of Object.keys(HANDS)) { const f = HANDS[n]; if (f.__nf) continue;
  const w = (k, x, y, s, rot, o) => normFix(rot, k, f(k, x, y, s, rot, o)); w.__nf = 1; HANDS[n] = w; }
// a soft drop shadow of a redrawn hand onto whatever is under it (flat pass only)
addDefs(`<filter id="castSh" x="-50%" y="-50%" width="200%" height="200%"><feFlood flood-color="#140806"/><feComposite in2="SourceAlpha" operator="in"/><feGaussianBlur stdDeviation="5"/></filter>`);
const handShadow = (A, k, S, sk, hs, dx = -5, dy = 7, op = .45) => PASS() === 'normal' ? '' :
  `<g opacity="${op}" transform="translate(${dx} ${dy})"><g filter="url(#castSh)">${gripHandOn(A, k, S, sk, hs)}</g></g>`;

// ---------- arms: shoulders ±140, bones 165 / 155 ----------
const tArm = (k, T, hand = 'back', o = {}) => ({ ...autoIK(k, [k * 140, -930], T, 165, 155, o.bend), hand, ...o });
const tHang = (k, dx = 0, dy = 0, o = {}) => tArm(k, [k * (160 + dx), -628 + dy], 'relax', { bend: -k, ...o });
// blend two arm poses (same IK side) — for gestures that travel
const armMix = (A0, A1, p) => p <= 0 ? A0 : p >= 1 ? A1 : { ...A1, el: lerp2(A0.el, A1.el, p), wr: lerp2(A0.wr, A1.wr, p), hrot: lerp(A0.hrot || 0, A1.hrot || 0, p) };

// ---------- faces ----------
const FACE_J = 'M-66 -1114 C-70 -1074 -66 -1038 -55 -1008 C-45 -983 -23 -964 0 -961 C23 -964 45 -983 55 -1008 C66 -1038 70 -1074 66 -1114 C60 -1154 32 -1176 0 -1176 C-32 -1176 -60 -1154 -66 -1114Z';
// under-eye marks, crow's feet, cheekbone hollow; k = how much (0 young … 2 old)
const ageLines = (S, k = 1) => [-1, 1].map(s => `<g stroke="${S.line}" fill="none" stroke-linecap="round">
    <path d="M${s * 13} -1069 Q${s * 28} -1061 ${s * 44} -1071" stroke-width="1.6" opacity="${F1(.26 * k)}"/>
    ${k > 1.2 ? `<path d="M${s * 16} -1062 Q${s * 30} -1055 ${s * 42} -1062" stroke-width="1.3" opacity="${F1(.16 * k)}"/>` : ''}
    <path d="M${s * 51} -1090 l${s * 9} -4 M${s * 52} -1084 l${s * 10} 0 M${s * 51} -1078 l${s * 8} 4" stroke-width="1.2" opacity="${F1(.22 * k)}"/></g>
  <g filter="url(#softW)"><ellipse cx="${s * 52}" cy="-1040" rx="12" ry="22" fill="${S.deep}" opacity="${F1(.16 * k)}"/><ellipse cx="${s * 28}" cy="-1068" rx="18" ry="6" fill="${S.deep}" opacity="${F1(.14 * k)}"/></g>`).join('');
// forehead and mouth lines of an old man
const oldLines = (S, k = 1) => `<g stroke="${S.line}" fill="none" stroke-linecap="round" opacity="${F1(.42 * k)}">
    <path d="M-40 -1138 Q0 -1146 40 -1138" stroke-width="1.6"/><path d="M-46 -1128 Q0 -1136 46 -1128" stroke-width="1.4"/><path d="M-36 -1119 Q0 -1125 36 -1119" stroke-width="1.2"/>
    <path d="M-8 -1110 L-6 -1098 M8 -1110 L6 -1098" stroke-width="1.3"/>
    <path d="M-26 -1036 C-34 -1018 -34 -1004 -28 -990 M26 -1036 C34 -1018 34 -1004 28 -990" stroke-width="1.8"/>
    <path d="M-20 -986 Q0 -978 20 -986" stroke-width="1.2" opacity=".6"/></g>
  <g filter="url(#softW)" opacity="${F1(.3 * k)}"><ellipse cx="-50" cy="-1028" rx="14" ry="26" fill="${S.deep}"/><ellipse cx="50" cy="-1028" rx="14" ry="26" fill="${S.deep}"/></g>
  <g fill="${S.shade}" opacity="${F1(.28 * k)}"><circle cx="-46" cy="-1120" r="3"/><circle cx="38" cy="-1112" r="2.4"/><circle cx="-56" cy="-1050" r="2.2"/><circle cx="52" cy="-1062" r="2.8"/></g>`;
// a straight nose: bridge light, a shadowed side plane, the ball of the tip
const noseForm = (S, side = 1, k = 1) => `<g filter="url(#softW2)"><path d="M-2 -1092 C-4 -1072 -5 -1058 -4 -1046" stroke="#fff0e0" stroke-width="7" fill="none" opacity="${F1(.18 * k)}"/><ellipse cx="-2" cy="-1042" rx="9" ry="6" fill="#fff0e0" opacity="${F1(.2 * k)}"/></g>
  <g filter="url(#softW)"><path d="M${11 * side} -1086 C${16 * side} -1066 ${18 * side} -1050 ${12 * side} -1036" stroke="${S.shade}" stroke-width="8" fill="none" opacity="${F1(.3 * k)}"/></g>`;
// burns (raw, reddened skin with darker patches) on the +x half of the face, clipped to the face
const faceBurn = (g, k = 1) => k < .01 ? '' : `<g clip-path="url(#${g('face')})" opacity="${F1(Math.min(1, k))}">
    <g filter="url(#softW)"><path d="M14 -1176 C60 -1170 82 -1120 78 -1060 C76 -1010 54 -972 18 -962 C40 -1010 44 -1060 30 -1110 C24 -1140 18 -1160 14 -1176 Z" fill="#b8483a" opacity=".55"/>
      <ellipse cx="52" cy="-1060" rx="20" ry="30" fill="#9a2e24" opacity=".45"/><ellipse cx="44" cy="-1006" rx="14" ry="12" fill="#a83a2e" opacity=".4"/></g>
    <g filter="url(#softW2)"><ellipse cx="58" cy="-1092" rx="7" ry="5" fill="#e8b0a0" opacity=".45"/><ellipse cx="40" cy="-1030" rx="6" ry="4" fill="#e6a898" opacity=".4"/>
      <path d="M36 -1120 C46 -1112 50 -1100 48 -1088" stroke="#5a1a14" stroke-width="2.4" fill="none" opacity=".4"/></g></g>`;
// soot / dirt smudges and specks over the whole face
const faceSoot = (g, k = 1, seed = 3) => { if (k < .01) return ''; const R = rng(seed); let d = '';
  for (let i = 0; i < 18; i++) { const x = (R() * 2 - 1) * 60, y = -1165 + R() * 190; d += `<circle cx="${F1(x)}" cy="${F1(y)}" r="${F1(.5 + R() * .7)}"/>`; }
  return `<g clip-path="url(#${g('face')})" opacity="${F1(k)}"><g filter="url(#softW)"><ellipse cx="-40" cy="-1030" rx="26" ry="16" fill="#3a2c22" opacity=".26"/><ellipse cx="10" cy="-1150" rx="40" ry="14" fill="#3a2c22" opacity=".22"/><ellipse cx="-20" cy="-985" rx="30" ry="12" fill="#3a2c22" opacity=".22"/>
      <ellipse cx="-52" cy="-1080" rx="12" ry="22" fill="#3a2c22" opacity=".16"/></g>
    <g fill="#2a1e16" opacity=".3">${d}</g></g>`; };
const EYE_J = { iris: '#2a1a0e', lash: '#0e0806', size: 1, w: 15.5, h: 7.2, sep: 30, tilt: .07, crease: '#a8785a', lowLine: '#6e4430', iris_r: 6.6, catch: .55, catchR: .7, white: '#e2d8cc', lashW: .9 };
const BROW_J = { col: '#140e0a', w: 7, len: 25, y: -1102, sep: 30, arch: 2.4, lineCol: '#7a4a32' };
const MOUTH_J = { w: 19, y: -1009, lip: '#a86858', mouth: '#4a1c16', line: '#3a1a12', teeth: '#ece4d6', crease: '#7a4a32', lipK: .85 };
const EYE_O = { ...EYE_J, h: 6.4, iris: '#2a1c12', crease: '#7a5040', lowLine: '#6a4030', catch: .45, white: '#ddd2c4' };
const BROW_O = { col: '#a8a298', w: 7.5, len: 26, y: -1103, sep: 30, arch: 3, lineCol: '#6e4230' };
const MOUTH_O = { ...MOUTH_J, lip: '#9c6458', line: '#3a1a12', lipK: .45 };
// painted shading of the face planes: brow ridge and eye sockets, temples, the side plane of the nose, cheekbones,
// the upper lip, the shadow under the lower lip, the chin, the jaw turning under. side = which side is lit (+1: +x side)
const faceShadeJ = ({ hatShadow = 0, side = 1 } = {}) => ({ g, S }) => `<g filter="url(#softW)">
    <ellipse cx="-30" cy="-1090" rx="22" ry="9" fill="${S.shade}" opacity=".32"/><ellipse cx="30" cy="-1090" rx="22" ry="9" fill="${S.shade}" opacity=".32"/>
    <ellipse cx="${-62 * side}" cy="-1110" rx="14" ry="40" fill="${S.shade}" opacity=".4"/><ellipse cx="${62 * side}" cy="-1110" rx="10" ry="34" fill="${S.shade}" opacity=".18"/>
    <path d="M${-46 * side} -1060 C${-54 * side} -1030 ${-50 * side} -1000 ${-30 * side} -978" stroke="${S.shade}" stroke-width="22" fill="none" opacity=".3"/>
    <ellipse cx="${40 * side}" cy="-1058" rx="18" ry="10" fill="${S.hi}" opacity=".35"/><ellipse cx="${-40 * side}" cy="-1058" rx="16" ry="9" fill="${S.hi}" opacity=".16"/>
    <ellipse cx="0" cy="-1132" rx="34" ry="14" fill="${S.hi}" opacity=".3"/>
    <ellipse cx="0" cy="-994" rx="16" ry="5" fill="${S.deep}" opacity=".32"/><ellipse cx="0" cy="-978" rx="14" ry="7" fill="${S.hi}" opacity=".28"/>
    <path d="M-58 -990 C-36 -964 36 -964 58 -990" stroke="${S.deep}" stroke-width="16" fill="none" opacity=".35"/>
    ${hatShadow ? `<ellipse cx="0" cy="-1150" rx="90" ry="34" fill="#2a1a12" opacity="${F1(.55 * hatShadow)}"/>` : ''}</g>`;
const noseJ = (S, side = 1) => `<g filter="url(#softW2)">
    <path d="M${-5 * side} -1094 C${-7 * side} -1076 ${-8 * side} -1062 ${-12 * side} -1048" stroke="${S.shade}" stroke-width="7" fill="none" opacity=".3"/>
    <path d="M${2 * side} -1092 C${3 * side} -1074 ${3 * side} -1060 ${2 * side} -1050" stroke="${S.hi}" stroke-width="6" fill="none" opacity=".4"/>
    <ellipse cx="${1 * side}" cy="-1046" rx="8" ry="6.5" fill="${S.hi}" opacity=".45"/>
    <ellipse cx="0" cy="-1035" rx="13" ry="4.5" fill="${S.deep}" opacity=".45"/></g>
  <path d="M-15 -1047 C-17 -1040 -14 -1035 -8 -1034 M15 -1047 C17 -1040 14 -1035 8 -1034" stroke="${S.line}" stroke-width="1.8" fill="none" opacity=".55" stroke-linecap="round"/>
  <path d="M-9.5 -1037 q3 -2.4 6 -.6 M9.5 -1037 q-3 -2.4 -6 -.6" stroke="${S.nostril}" stroke-width="2.4" fill="none" opacity=".75" stroke-linecap="round"/>
  <path d="M-3.4 -1031 L-4 -1020 M3.4 -1031 L4 -1020" stroke="${S.shade}" stroke-width="1.4" opacity=".28"/>`;
const earsJ = ({ S, sk, turn = 0 }) => [-1, 1].map(k => { const sq = 1 - .85 * Math.max(0, k * turn), x = k * (67 - turn * 4);
  return `<g transform="translate(${F1(x)} -1074) scale(${F1(sq)} 1)"><path d="${mx(-k, 'M 0 -20 C 12 -22 16 -8 13 6 C 11 16 6 22 0 20 Z')}" fill="${k < 0 ? S.ear : S.earDk}" filter="url(#pks_${sk})"/>
    <path d="${mx(-k, 'M 3 -12 C 9 -12 10 -2 8 6 C 7 10 5 12 3 11')}" stroke="${S.deep}" stroke-width="2.4" fill="none" opacity=".45"/></g>`; }).join('');
// e.burn / e.soot / e.age drive the damage; eye / brow / mouth sets per person
const jpFace = (EYE, BROW, MOUTH, { age = 0, old = 0 } = {}) => ({ g, S, e }) => `${noseJ(S, 1)}<g clip-path="url(#${g('face')})">${ageLines(S, age)}${old ? oldLines(S, old) : ''}</g>
  ${faceBurn(g, e.burn || 0)}${faceSoot(g, e.soot || 0)}${eyes2(e, EYE)}${brows2(e, BROW)}${mouth2(e, MOUTH)}${sweat2(e, S)}`;

// ---------- hair and hats (drawn in the hat slot, part of the head group) ----------
// short 1940s side parting: volume on top, combed toward +x, a parting on the -x side, short at the temples
function sidePart({ col = '#17110d', hi = '#5a4c42', capped = false } = {}) {
  const top = 'M-71 -1080 C-74 -1112 -77 -1150 -71 -1172 C-62 -1198 -32 -1214 2 -1214 C38 -1214 68 -1200 77 -1172 C81 -1150 77 -1112 73 -1080 L67 -1083 C67 -1108 65 -1126 59 -1140 C42 -1152 22 -1158 2 -1158 C-24 -1158 -44 -1152 -58 -1142 C-64 -1128 -67 -1108 -67 -1083 Z';
  const quiff = 'M-34 -1160 C-30 -1190 -4 -1212 30 -1212 C54 -1210 70 -1196 76 -1176 C62 -1188 40 -1194 18 -1190 C0 -1186 -20 -1176 -34 -1160 Z';
  return `<defs><linearGradient id="hairJ" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${lighten(col, .12)}"/><stop offset=".6" stop-color="${col}"/><stop offset="1" stop-color="${darken(col, .3)}"/></linearGradient></defs>
    <g filter="url(#pcsl)"><path d="${top}" fill="url(#hairJ)"/></g>
    <g filter="url(#pcs)"><path d="${quiff}" fill="${lighten(col, .06)}"/></g>
    <g fill="none" stroke-linecap="round">
      <path d="M-31 -1158 C-33 -1176 -30 -1196 -22 -1212" stroke="${mix(col, '#8a6a58', .5)}" stroke-width="1.6" opacity=".7"/>
      <path d="M-24 -1166 C-4 -1188 26 -1196 60 -1186 M-22 -1176 C0 -1200 30 -1206 66 -1194 M-26 -1190 C-4 -1208 26 -1212 56 -1206 M-18 -1160 C2 -1176 30 -1180 64 -1170"
        stroke="${hi}" stroke-width="1.4" opacity=".45"/>
      <path d="M-40 -1160 C-52 -1170 -60 -1160 -64 -1134 M-46 -1174 C-58 -1180 -66 -1166 -68 -1140" stroke="${hi}" stroke-width="1.2" opacity=".3"/></g>
    <path d="M-6 -1196 C16 -1206 40 -1204 60 -1192" stroke="#fff" stroke-width="5" fill="none" opacity=".16" filter="url(#softW2)"/>
    <g filter="url(#softW2)" opacity=".5"><path d="M-66 -1084 C-67 -1108 -65 -1126 -59 -1140 M66 -1084 C67 -1108 65 -1126 59 -1140" stroke="${col}" stroke-width="5" fill="none"/></g>`;
}
// thin white hair of an old man: soft tufts over the ears that follow the skull, a few fine strands combed back over the
// crown — all of it on the head (the crown strands are clipped to the face outline, so nothing floats above the scalp)
function oldHair({ g, col = '#cfc8bc' } = {}) {
  const tuft = k => mx(k, 'M -63 -1136 C -71 -1124 -75 -1104 -74 -1086 C -73 -1076 -71 -1068 -67 -1062 L -64 -1068 C -66 -1086 -66 -1108 -61 -1128 Z');
  return `<g filter="url(#pcs)" fill="${col}"><path d="${tuft(-1)}"/><path d="${tuft(1)}"/></g>
    <g stroke="${darken(col, .28)}" fill="none" opacity=".4" stroke-width="1.1"><path d="M-70 -1120 C-72 -1104 -72 -1090 -70 -1074 M70 -1120 C72 -1104 72 -1090 70 -1074"/></g>
    <g clip-path="url(#${g('face')})">
      <path d="M-58 -1150 C-40 -1170 -16 -1178 4 -1178 C28 -1178 50 -1168 60 -1150 C40 -1160 20 -1164 2 -1164 C-20 -1164 -40 -1160 -58 -1150 Z" fill="${col}" opacity=".32" filter="url(#softW2)"/>
      <g stroke="${lighten(col, .25)}" fill="none" opacity=".5" stroke-width="1.1"><path d="M-46 -1156 C-30 -1168 -8 -1174 14 -1172 M-36 -1162 C-18 -1172 6 -1176 30 -1170 M-20 -1166 C0 -1176 24 -1176 46 -1164"/></g></g>`;
}
// the wartime civilian field cap (senjibō): khaki crown, short dark visor, a band
function fieldCap({ col = '#8a7c5a', hair = '#17110d' } = {}) {
  return ({ g }) => `${sidePart({ col: hair, capped: true })}
    <g filter="url(#pcl)"><path d="M-82 -1140 C-88 -1206 -48 -1252 0 -1254 C48 -1252 88 -1206 82 -1140 Q0 -1160 -82 -1140 Z" fill="url(#${g('hat')})"/></g>
    <path d="M0 -1254 L0 -1152 M-44 -1240 C-60 -1214 -66 -1176 -66 -1148 M44 -1240 C60 -1214 66 -1176 66 -1148" stroke="${darken(col, .45)}" stroke-width="2.2" fill="none" opacity=".45"/>
    <g filter="url(#pcsl)"><path d="M-84 -1142 Q0 -1166 84 -1142 L84 -1124 Q0 -1148 -84 -1124 Z" fill="${darken(col, .18)}"/></g>
    <g filter="url(#pcsl)"><path d="M-60 -1132 Q0 -1152 60 -1132 Q48 -1114 0 -1110 Q-48 -1114 -60 -1132 Z" fill="#3a2a1a"/></g>
    <path d="M-50 -1124 Q0 -1138 50 -1124" stroke="#fff" stroke-width="2" fill="none" opacity=".16"/>
    <g clip-path="url(#${g('face')})"><ellipse cx="0" cy="-1112" rx="64" ry="10" fill="#1e140c" opacity=".3" filter="url(#softW)"/></g>`;
}
// gauze bandage wrapped around the head and over the +x side (ear and cheek)
function headBandage({ col = '#ece6da', stain = .3 } = {}) {
  const fold = darken(col, .22);
  return `<g filter="url(#pcl)" fill="${col}">
      <path d="M-82 -1150 C-40 -1172 40 -1176 84 -1152 L86 -1118 C40 -1140 -40 -1136 -84 -1116 Z"/>
      <path d="M-80 -1132 C-30 -1150 30 -1150 82 -1130 L82 -1104 C30 -1124 -30 -1124 -80 -1106 Z"/>
      <path d="M40 -1150 C70 -1130 86 -1090 84 -1040 C80 -1006 64 -982 44 -970 L32 -986 C50 -1010 60 -1040 60 -1072 C60 -1104 50 -1128 30 -1140 Z"/></g>
    <g stroke="${fold}" fill="none" stroke-linecap="round" opacity=".7" stroke-width="1.8">
      <path d="M-80 -1132 C-30 -1150 30 -1150 82 -1130"/><path d="M-82 -1122 C-36 -1140 36 -1142 84 -1124" opacity=".5"/>
      <path d="M44 -1120 C62 -1098 70 -1066 68 -1036 M50 -1100 C66 -1074 72 -1048 66 -1012" opacity=".6"/></g>
    <g filter="url(#softW)"><ellipse cx="62" cy="-1060" rx="9" ry="14" fill="#b86a5c" opacity="${F1(stain)}"/><ellipse cx="20" cy="-1140" rx="12" ry="5" fill="#b86a5c" opacity="${F1(stain * .7)}"/></g>`;
}
// round wire spectacles
const glasses = (k = 1) => `<g fill="url(#glassG)" stroke="#5a5450" stroke-width="2.6"><circle cx="-29" cy="-1083" r="19"/><circle cx="29" cy="-1083" r="19"/></g>
  <path d="M-10 -1086 Q0 -1092 10 -1086 M-48 -1086 L-70 -1092 M48 -1086 L70 -1092" stroke="#5a5450" stroke-width="2.4" fill="none"/>
  <path d="M-40 -1096 L-30 -1100 M18 -1096 L28 -1100" stroke="#fff" stroke-width="2.4" opacity=".5" stroke-linecap="round"/>`;

// ---------- the 1945 shirt and trousers ----------
// shirt (off-white, open collar, sleeves rolled to the elbow), khaki trousers, belt, leather shoes.
// burn: the +x (left) side scorched and torn, left forearm raw; soot: dust over everything; bandage: left forearm wrapped
function shirtBody({ shirt = '#e4ddcc', pants = '#7a6c4e', shoe = '#3a2618', belt = '#3a2614', w = 1, burn = 0, soot = 0, bandage = 0, hs = 1.5,
  r1 = 30, r2 = 23, r3 = 18.5, longSleeve = false, pocket = true, sleeveCol = null, over = null, tie = null } = {}) {
  return ({ g, S, sk, e }) => {
    const id = g('sb'), L = e.armL || tHang(-1), R = e.armR || tHang(1), X = v => v * w, SX = 140 * w;
    const sh = soot > .01 ? mix(shirt, '#8a7e6a', .35 * soot) : shirt, sd = darken(sh, .42), sl = lighten(sh, .2), pd = darken(pants, .45), sc = sleeveCol || (over ? over.col : sh);
    if (over) longSleeve = true;
    const up = (A, k) => capsuleD(k * SX, -930, r1, lerp(k * SX, A.el[0], .97), lerp(-930, A.el[1], .97), r2 + 3);
    const fa = (k, A) => forearm(k, A, { r2, r3, S, sk, sleeve: sc, long: longSleeve, rolled: !longSleeve, hs });
    // trousers: high-waisted 1940s cut — the seat (waistband to crotch, full at the hips) and both legs are ONE union in a
    // single filter group, so no seam shows between them. legTf lets a leg step (walk) about the hip line.
    const legP = k => mx(k, `M ${X(-146)} -620 C ${X(-152)} -470 ${X(-134)} -300 ${X(-118)} -104 L ${X(-40)} -104 C ${X(-36)} -300 ${X(-24)} -430 ${X(-4)} -526 L ${X(-4)} -620 Z`);
    const seatP = `M${X(-136)} -712 C${X(-142)} -676 ${X(-148)} -640 ${X(-147)} -600 L${X(147)} -600 C${X(148)} -640 ${X(142)} -676 ${X(136)} -712 Z`;
    // seated (bust + e.lap): the thighs come toward us under the torso, knees side by side
    const lapSVG = e.bust && e.lap ? `<g filter="url(#pc)" fill="url(#${id}p)"><path d="M${X(-150)} -704 C${X(-192)} -688 ${X(-212)} -656 ${X(-200)} -630 C${X(-178)} -606 ${X(-84)} -606 0 -622 C${X(84)} -606 ${X(178)} -606 ${X(200)} -630 C${X(212)} -656 ${X(192)} -688 ${X(150)} -704 Z"/></g>
      <g filter="url(#softW2)" fill="none" opacity=".45"><path d="M0 -680 C${X(-4)} -660 ${X(-3)} -640 0 -624" stroke="${pd}" stroke-width="6"/>
        <path d="M${X(-182)} -636 C${X(-140)} -620 ${X(-96)} -618 ${X(-50)} -628 M${X(182)} -636 C${X(140)} -620 ${X(96)} -618 ${X(50)} -628" stroke="${pd}" stroke-width="4"/>
        <path d="M${X(-160)} -672 C${X(-124)} -662 ${X(-90)} -660 ${X(-60)} -664 M${X(160)} -672 C${X(124)} -662 ${X(90)} -660 ${X(60)} -664" stroke="${lighten(pants, .3)}" stroke-width="6" opacity=".6"/></g>` : '';
    const legs = e.bust ? '' : `<g filter="url(#pc)" fill="url(#${id}p)"><path d="${seatP}"/><g ${legTf(-1, e, -560, 0)}><path d="${legP(-1)}"/></g><g ${legTf(1, e, -560, 0)}><path d="${legP(1)}"/></g></g>
      ${[-1, 1].map(k => `<g ${legTf(k, e, -560, 0)}>
        <g filter="url(#softW2)" opacity=".5"><path d="${mx(k, `M ${X(-78)} -560 C ${X(-82)} -450 ${X(-82)} -320 ${X(-80)} -120`)}" stroke="${pd}" stroke-width="5" fill="none"/>
          <path d="${mx(k, `M ${X(-114)} -150 C ${X(-92)} -136 ${X(-62)} -140 ${X(-44)} -150 M ${X(-120)} -380 C ${X(-98)} -364 ${X(-72)} -368 ${X(-40)} -382`)}" stroke="${pd}" stroke-width="7" fill="none"/></g>
        <path d="${mx(k, `M ${X(-120)} -110 C ${X(-128)} -62 ${X(-152)} -34 ${X(-156)} -14 C ${X(-158)} 4 ${X(-132)} 6 ${X(-100)} 4 L ${X(-34)} 4 C ${X(-30)} -30 ${X(-34)} -72 ${X(-40)} -110 Z`)}" fill="${shoe}" filter="url(#pcl)"/>
        <path d="${mx(k, `M ${X(-140)} -24 C ${X(-130)} -36 ${X(-112)} -40 ${X(-96)} -36`)}" stroke="#fff" stroke-width="5" fill="none" opacity=".18" filter="url(#softW2)"/></g>`).join('')}
      <g filter="url(#softW2)" opacity=".5">
        <path d="M${X(-2)} -536 C${X(-22)} -560 ${X(-46)} -582 ${X(-66)} -596 M${X(2)} -536 C${X(22)} -560 ${X(46)} -582 ${X(66)} -596" stroke="${pd}" stroke-width="6" fill="none"/>
        <path d="M${X(-118)} -660 C${X(-110)} -630 ${X(-104)} -610 ${X(-100)} -590 M${X(118)} -660 C${X(110)} -630 ${X(104)} -610 ${X(100)} -590" stroke="${lighten(pants, .25)}" stroke-width="8" fill="none" opacity=".6"/></g>
      <path d="M${X(2)} -676 C${X(4)} -620 ${X(2)} -580 ${X(-12)} -552" stroke="${pd}" stroke-width="2.2" fill="none" opacity=".55"/>
      <path d="M${X(-62)} -676 L${X(-65)} -632 M${X(62)} -676 L${X(65)} -632 M${X(-82)} -676 L${X(-84)} -648 M${X(82)} -676 L${X(84)} -648" stroke="${pd}" stroke-width="2" opacity=".4"/>
      <path d="M${X(-128)} -672 C${X(-118)} -650 ${X(-112)} -630 ${X(-112)} -606 M${X(128)} -672 C${X(118)} -650 ${X(112)} -630 ${X(112)} -606" stroke="${pd}" stroke-width="2.4" fill="none" opacity=".5"/>`;
    // shirt torso: open V neck, tucked in at the waist
    const body = `M${X(-46)} -1000 C${X(-96)} -992 ${X(-136)} -978 ${X(-150)} -946 C${X(-158)} -900 ${X(-150)} -840 ${X(-142)} -790 C${X(-138)} -750 ${X(-136)} -722 ${X(-136)} -690 L${X(136)} -690 C${X(136)} -722 ${X(138)} -750 ${X(142)} -790 C${X(150)} -840 ${X(158)} -900 ${X(150)} -946 C${X(136)} -978 ${X(96)} -992 ${X(46)} -1000 L${X(10)} -936 L${X(-10)} -936 Z`;
    const chest = `<path d="M${X(-46)} -1006 L${X(46)} -1006 L${X(12)} -930 L${X(-12)} -930 Z" fill="${S.neck}" filter="url(#pks_${sk})"/><path d="M${X(-30)} -1000 L${X(0)} -940 L${X(30)} -1000" stroke="${S.deep}" stroke-width="6" fill="none" opacity=".25" filter="url(#softW2)"/>`;
    const collar = [-1, 1].map(k => `<g filter="url(#pcsl)"><path d="${mx(k, `M ${X(-48)} -1004 L ${X(-84)} -994 L ${X(-62)} -948 L ${X(-12)} -934 Z`)}" fill="${sl}"/></g>
      <path d="${mx(k, `M ${X(-82)} -992 L ${X(-62)} -950 L ${X(-14)} -936`)}" stroke="${sd}" stroke-width="2" fill="none" opacity=".5"/>`).join('');
    const placket = `<path d="M${X(4)} -934 L${X(4)} -694" stroke="${sd}" stroke-width="2" opacity=".45"/>
      ${[-900, -846, -792, -738].map(y => `<circle cx="${X(10)}" cy="${y}" r="4.2" fill="${lighten(sh, .3)}" stroke="${sd}" stroke-width="1" stroke-opacity=".5"/>`).join('')}`;
    const pocketSVG = pocket ? `<path d="M${X(38)} -896 L${X(92)} -896 L${X(90)} -840 Q${X(64)} -834 ${X(40)} -840 Z" fill="none" stroke="${sd}" stroke-width="2" opacity=".5"/><path d="M${X(38)} -896 L${X(92)} -896" stroke="${sd}" stroke-width="4" opacity=".35"/>` : '';
    const folds = `<g filter="url(#softW)" opacity=".42"><path d="M${X(-112)} -900 C${X(-118)} -820 ${X(-112)} -760 ${X(-100)} -700 M${X(112)} -900 C${X(118)} -820 ${X(112)} -760 ${X(100)} -700" stroke="${sd}" stroke-width="12" fill="none"/>
        <path d="M${X(-120)} -716 Q${X(-60)} -700 ${X(0)} -712 Q${X(60)} -700 ${X(120)} -716" stroke="${sd}" stroke-width="10" fill="none"/>
        <path d="M${X(-80)} -920 C${X(-90)} -860 ${X(-86)} -800 ${X(-76)} -740" stroke="${sl}" stroke-width="10" fill="none" opacity=".8"/></g>`;
    const beltSVG = `<g filter="url(#pcsl)"><path d="M${X(-138)} -708 Q0 -694 ${X(138)} -708 L${X(138)} -680 Q0 -666 ${X(-138)} -680 Z" fill="${belt}"/></g>
      <g filter="url(#pcsl)"><rect x="${X(-16)}" y="-708" width="${F1(30 * w)}" height="28" rx="3" fill="url(#steelH)"/></g><rect x="${X(-8)}" y="-701" width="${F1(14 * w)}" height="14" rx="2" fill="${belt}"/>`;
    // scorch: brown-black burn marks and torn edges on the +x half; the +x sleeve torn short
    const scorch = burn > .01 ? `<g clip-path="url(#${id}c)" opacity="${F1(Math.min(1, burn))}"><g filter="url(#softW)">
        <path d="M${X(30)} -1000 C${X(90)} -980 ${X(150)} -940 ${X(150)} -880 C${X(146)} -820 ${X(130)} -780 ${X(110)} -760 C${X(80)} -800 ${X(50)} -860 ${X(30)} -1000 Z" fill="#5a3a24" opacity=".55"/>
        <ellipse cx="${X(110)}" cy="-860" rx="${F1(30 * w)}" ry="44" fill="#2a1a10" opacity=".5"/><ellipse cx="${X(60)}" cy="-760" rx="${F1(26 * w)}" ry="20" fill="#4a3220" opacity=".45"/></g>
        <path d="M${X(96)} -900 l10 18 l-8 12 l14 16 l-6 14" stroke="#1a0e08" stroke-width="3" fill="none" opacity=".6"/></g>` : '';
    const dirt = soot > .01 ? `<g clip-path="url(#${id}c)" opacity="${F1(soot)}"><g filter="url(#softW)"><ellipse cx="${X(-60)}" cy="-760" rx="40" ry="26" fill="#5a4a38" opacity=".3"/><ellipse cx="${X(-20)}" cy="-900" rx="30" ry="20" fill="#5a4a38" opacity=".22"/></g></g>` : '';
    // the +x forearm raw (burn) or wrapped in gauze (bandage), drawn over the forearm skin
    const armMark = (k, A) => { if (k < 0) return ''; const d = unit(A.el, A.wr);
      if (bandage > .01) return `<g filter="url(#pcl)" fill="#ece6da">${[0, 1, 2, 3, 4].map(i => `<path d="${band(lerp2(A.el, A.wr, .16 + i * .17), d, r3 + 3.5, 30, 4)}"/>`).join('')}</g>
        <g stroke="#b8b0a2" stroke-width="1.6" fill="none" opacity=".7">${[0, 1, 2, 3, 4].map(i => { const p = lerp2(A.el, A.wr, .16 + i * .17), n = [-d[1], d[0]]; return `<path d="M${F1(p[0] - n[0] * (r3 + 3) - d[0] * 15)} ${F1(p[1] - n[1] * (r3 + 3) - d[1] * 15)} L${F1(p[0] + n[0] * (r3 + 3) + d[0] * 13)} ${F1(p[1] + n[1] * (r3 + 3) + d[1] * 13)}"/>`; }).join('')}</g>`;
      if (burn > .01) return `<g opacity="${F1(Math.min(1, burn))}"><g filter="url(#softW2)"><path d="${capsuleD(lerp(A.el[0], A.wr[0], .1), lerp(A.el[1], A.wr[1], .1), r2 - 3, lerp(A.el[0], A.wr[0], .92), lerp(A.el[1], A.wr[1], .92), r3 - 3)}" fill="#b8483a" opacity=".6"/></g>
        <g filter="url(#softW2)">${[.3, .55, .78].map((p, i) => `<ellipse cx="${F1(lerp(A.el[0], A.wr[0], p) + (i - 1) * 5)}" cy="${F1(lerp(A.el[1], A.wr[1], p))}" rx="8" ry="6" fill="${i === 1 ? '#e6aa9a' : '#8a2a22'}" opacity=".5"/>`).join('')}</g></g>`;
      return ''; };
    return `<defs>${linG(id + 't', [lighten(sh, .12), sh, darken(sh, .2)], { user: [-170 * w, 0, 170 * w, 0] })}${linG(id + 'p', [lighten(pants, .14), pants, darken(pants, .3)], { user: [-150 * w, 0, 150 * w, 0] })}
        <clipPath id="${id}c"><path d="${body}"/></clipPath></defs>
      ${legs}${lapSVG}${softNeck(S, sk, 31, -960)}${chest}
      <g filter="url(#pcl)" fill="${sc}">${L.front ? '' : `<path d="${up(L, -1)}"/>`}${R.front ? '' : `<path d="${up(R, 1)}"/>`}</g>
      <path d="${body}" fill="url(#${id}t)" filter="url(#pcl)"/>
      ${folds}${placket}${pocketSVG}${scorch}${dirt}${beltSVG}${tie ? tieSVG(tie, X) : ''}${over ? overSVG(over, X, id) : collar}
      ${[[-1, L], [1, R]].filter(([k, A]) => A.front).map(([k, A]) => `<g filter="url(#pcl)" fill="${sc}"><path d="${up(A, k)}"/></g>`).join('')}
      <g filter="url(#softW)" opacity=".38"><path d="M${F1(L.el[0])} ${F1(L.el[1])} l-16 -26 M${F1(R.el[0])} ${F1(R.el[1])} l16 -26" stroke="${sd}" stroke-width="12" fill="none"/></g>
      ${fa(-1, L)}${armMark(-1, L)}${fa(1, R)}${armMark(1, R)}`;
  };
}

// a necktie in the shirt's V (suits)
const tieSVG = (col, X) => `<g filter="url(#pcsl)"><path d="M${X(-9)} -952 L${X(9)} -952 L${X(6)} -936 L${X(14)} -790 L${X(0)} -770 L${X(-14)} -790 L${X(-6)} -936 Z" fill="${col}"/></g>
  <g filter="url(#pcsl)"><path d="M${X(-11)} -962 L${X(11)} -962 L${X(7)} -940 L${X(-7)} -940 Z" fill="${darken(col, .15)}"/></g>
  <path d="M${X(-2)} -930 L${X(6)} -800" stroke="${lighten(col, .3)}" stroke-width="3" opacity=".3"/>`;
// outer garment over the shirt torso. over = { col, kind: 'cardigan' | 'kokumin' | 'suit' }
function overSVG(o, X, id) {
  const c = o.col, cd = darken(c, .42), cl = lighten(c, .18), hem = o.kind === 'cardigan' ? -640 : -610;
  const half = k => mx(k, `M ${X(-44)} -1002 C ${X(-96)} -994 ${X(-138)} -980 ${X(-152)} -948 C ${X(-162)} -900 ${X(-154)} -840 ${X(-146)} -786 C ${X(-142)} -740 ${X(-146)} -680 ${X(-150)} ${hem}
    L ${X(o.kind === 'kokumin' ? 4 : -8)} ${hem + 4} L ${X(o.kind === 'kokumin' ? 4 : -12)} ${o.kind === 'cardigan' ? -760 : o.kind === 'suit' ? -800 : -960} ${o.kind === 'kokumin' ? '' : `L ${X(-38)} -996`} Z`);
  let out = `<defs>${linG(id + 'o', [lighten(c, .12), c, darken(c, .25)], { user: [-170, 0, 170, 0] })}</defs>
    <g filter="url(#pcl)" fill="url(#${id}o)"><path d="${half(-1)}"/><path d="${half(1)}"/></g>
    <g filter="url(#softW)" opacity=".4"><path d="M${X(-110)} -900 C${X(-118)} -820 ${X(-114)} -740 ${X(-104)} ${hem + 20} M${X(110)} -900 C${X(118)} -820 ${X(114)} -740 ${X(104)} ${hem + 20}" stroke="${cd}" stroke-width="12" fill="none"/></g>`;
  if (o.kind === 'cardigan') out += `<g stroke="${cd}" stroke-width="1.6" opacity=".35">${Array.from({ length: 9 }, (_, i) => `<path d="M${X(-148 + i * 4)} ${hem - 4 - i * 0} L${X(-14 + i * 0)} ${hem}" />`).slice(0, 1).join('')}</g>
    ${[-1, 1].map(k => `<path d="${mx(k, `M ${X(-150)} ${hem - 24} L ${X(-10)} ${hem - 20}`)}" stroke="${cd}" stroke-width="3" opacity=".45"/>
      <path d="${mx(k, `M ${X(-38)} -996 L ${X(-12)} -760 L ${X(-10)} ${hem}`)}" stroke="${cd}" stroke-width="7" fill="none" opacity=".4"/>
      <g filter="url(#pcsl)">${[-850, -800, -760].map(y => `<circle cx="${X(k * 22)}" cy="${y + (k > 0 ? 0 : 0)}" r="5" fill="${darken(c, .3)}"/>`).join('')}</g>
      <path d="${mx(k, `M ${X(-120)} -730 L ${X(-60)} -730 L ${X(-62)} -680 L ${X(-118)} -680 Z`)}" fill="none" stroke="${cd}" stroke-width="2" opacity=".45"/>`).join('')}`;
  if (o.kind === 'kokumin') out += `<g filter="url(#pcsl)"><path d="M${X(-40)} -1006 C${X(-20)} -998 ${X(20)} -998 ${X(40)} -1006 L${X(42)} -968 C${X(20)} -960 ${X(-20)} -960 ${X(-42)} -968 Z" fill="${cl}"/></g>
    <path d="M${X(4)} -968 L${X(4)} ${hem}" stroke="${cd}" stroke-width="2.4" opacity=".55"/>
    <g filter="url(#pcsl)">${[-940, -880, -820, -760, -700].map(y => `<circle cx="${X(12)}" cy="${y}" r="5.5" fill="url(#brassG)"/>`).join('')}</g>
    ${[-1, 1].map(k => `<path d="${mx(k, `M ${X(-120)} -910 L ${X(-46)} -910 L ${X(-46)} -850 L ${X(-120)} -850 Z M ${X(-128)} -740 L ${X(-44)} -740 L ${X(-46)} -660 L ${X(-126)} -660 Z`)}" fill="none" stroke="${cd}" stroke-width="2" opacity=".5"/>
      <g filter="url(#pcsl)"><path d="${mx(k, `M ${X(-122)} -912 L ${X(-44)} -912 L ${X(-46)} -892 Q ${X(-84)} -884 ${X(-120)} -892 Z M ${X(-130)} -742 L ${X(-42)} -742 L ${X(-44)} -722 Q ${X(-86)} -714 ${X(-128)} -722 Z`)}" fill="${c}"/></g>`).join('')}`;
  if (o.kind === 'suit') out += [-1, 1].map(k => `<g filter="url(#pcsl)"><path d="${mx(k, `M ${X(-38)} -998 L ${X(-12)} -800 L ${X(-36)} -860 L ${X(-70)} -900 L ${X(-56)} -930 L ${X(-62)} -960 Z`)}" fill="${cl}"/></g>
      <path d="${mx(k, `M ${X(-56)} -930 L ${X(-40)} -926`)}" stroke="${cd}" stroke-width="2" opacity=".6"/>`).join('') +
    `<g filter="url(#pcsl)"><circle cx="${X(-14)}" cy="-760" r="6" fill="${darken(c, .3)}"/><circle cx="${X(-14)}" cy="-690" r="6" fill="${darken(c, .3)}"/></g>
     <path d="M${X(80)} -900 L${X(118)} -900" stroke="#e8e4dc" stroke-width="5" opacity=".7"/>`;
  return out;
}

// ---------- the people ----------
const TSU_FACE = jpFace(EYE_J, BROW_J, MOUTH_J, { age: .5 });
const TSU_BASE = { skin: 'jp', hair: 'bald', hairColor: 'black', beard: 'none', legs: 'none', top: 'vest', eyeColor: '#24160c', browW: .01, ownFace: 1, ownNose: 1, noMustache: 1, facePath: FACE_J, faceExtra: TSU_FACE, faceShade: faceShadeJ(), ears: earsJ };
// young Tsutomu: field cap, white shirt, khaki trousers
const TSU = { ...TSU_BASE, id: 'ts', hat: 'cap1945', hatColor: '#8a7c5a', customHat: fieldCap(), faceShade: faceShadeJ({ hatShadow: .6 }), body: shirtBody({}) };
const TSU_NOCAP = { ...TSU_BASE, id: 'tn', hat: 'sidepart', customHat: () => sidePart(), body: shirtBody({}) };
const TSU_BURNT = { ...TSU_BASE, id: 'tb', hat: 'sidepart', customHat: () => sidePart(), body: shirtBody({ burn: 1, soot: 1 }) };
const TSU_BAND = { ...TSU_BASE, id: 'tw', hat: 'sidepart', customHat: () => sidePart() + headBandage(), body: shirtBody({ soot: .5, bandage: 1 }) };

// old Tsutomu (2009): thin white hair, round spectacles, a cardigan over the shirt, a stoop
const OLD_FACE = jpFace(EYE_O, BROW_O, MOUTH_O, { age: 1.6, old: 1 });
const TSU_OLD = { ...TSU_BASE, skin: 'jpOld', id: 'to', hat: 'oldhair', customHat: ({ g }) => oldHair({ g }) + glasses(), faceExtra: OLD_FACE, faceShade: faceShadeJ(),
  body: shirtBody({ shirt: '#e8e4da', pants: '#3e3c3a', shoe: '#2a2220', belt: '#2a2018', over: { col: '#7a6e60', kind: 'cardigan' } }) };
// the boss (1945): grey temples, round glasses, a small moustache, the khaki national-civilian uniform (kokuminfuku)
const bossHair = () => `<g filter="url(#pcsl)"><path d="M-70 -1084 C-74 -1120 -76 -1156 -64 -1178 C-50 -1202 -20 -1210 4 -1210 C34 -1208 62 -1196 72 -1172 C78 -1150 76 -1116 72 -1084 L66 -1088 C66 -1112 64 -1132 58 -1148 C40 -1160 20 -1166 0 -1166 C-22 -1166 -42 -1160 -56 -1150 C-64 -1134 -66 -1112 -66 -1088 Z" fill="#2a2420"/></g>
  <g filter="url(#softW2)"><path d="M-68 -1090 C-70 -1112 -68 -1130 -62 -1146 M68 -1090 C70 -1112 68 -1130 62 -1146" stroke="#8a8680" stroke-width="7" fill="none" opacity=".8"/></g>
  <path d="M-40 -1196 C-10 -1206 30 -1204 60 -1186" stroke="#6a625a" stroke-width="1.6" fill="none" opacity=".6"/><path d="M-30 -1186 C0 -1196 30 -1194 56 -1178" stroke="#6a625a" stroke-width="1.4" fill="none" opacity=".5"/>`;
const mustacheJ = (col = '#2a2420') => `<g filter="url(#pcs)"><path d="M-20 -1026 C-12 -1031 -4 -1030 0 -1027 C4 -1030 12 -1031 20 -1026 C18 -1021 10 -1020 0 -1022 C-10 -1020 -18 -1021 -20 -1026 Z" fill="${col}"/></g>`;
const BOSS_FACE = (o => ({ g, S, e }) => o({ g, S, e }))(jpFace({ ...EYE_J, h: 6.8 }, { ...BROW_J, col: '#3a322c', w: 7.5 }, { ...MOUTH_J, y: -1008 }, { age: 1.2, old: .45 }));
const BOSS = { ...TSU_BASE, id: 'bo', hat: 'bosshair', customHat: () => bossHair() + glasses(), faceExtra: BOSS_FACE, faceShade: faceShadeJ(),
  body: shirtBody({ shirt: '#d8d2c4', pants: '#5e5a40', shoe: '#2a1e14', over: { col: '#6a6444', kind: 'kokumin' } }) };
// colleagues at the desks (white shirts; one with spectacles, one with cropped hair)
const cropHair = (col = '#1a1410') => `<g filter="url(#pcsl)"><path d="M-70 -1086 C-74 -1124 -72 -1160 -60 -1182 C-44 -1204 -14 -1210 4 -1210 C30 -1208 58 -1196 68 -1176 C76 -1154 74 -1120 70 -1086 L64 -1090 C64 -1116 62 -1136 56 -1150 C40 -1160 20 -1164 0 -1164 C-20 -1164 -40 -1160 -54 -1150 C-62 -1136 -64 -1116 -64 -1090 Z" fill="${col}"/></g>
  <g fill="#3a3028" opacity=".5">${Array.from({ length: 40 }, (_, i) => { const R = rng(i + 9); return `<circle cx="${F1((R() * 2 - 1) * 60)}" cy="${F1(-1200 + R() * 40)}" r="1.4"/>`; }).join('')}</g>`;
const COL1 = { ...TSU_BASE, id: 'c1', hat: 'c1', customHat: () => sidePart({ col: '#201814' }) + glasses(), faceExtra: jpFace(EYE_J, BROW_J, MOUTH_J, { age: .7 }), body: shirtBody({ shirt: '#e2dccc', pocket: true }) };
const COL2 = { ...TSU_BASE, id: 'c2', hat: 'c2', customHat: () => cropHair(), faceExtra: jpFace({ ...EYE_J, h: 6.6 }, { ...BROW_J, w: 8 }, MOUTH_J, { age: 1 }), body: shirtBody({ shirt: '#dcd6c6', longSleeve: true }) };
// the official (2009): a dark suit and tie, grey short hair, spectacles
const OFFICIAL = { ...TSU_BASE, id: 'of', hat: 'of', customHat: () => cropHair('#4a4642') + glasses(), faceExtra: jpFace(EYE_J, { ...BROW_J, col: '#3a3632' }, MOUTH_J, { age: 1.1, old: .3 }),
  body: shirtBody({ shirt: '#f0eee8', pants: '#262a34', shoe: '#141414', belt: '#141414', over: { col: '#2a3040', kind: 'suit' }, tie: '#6a2a2e', pocket: false }) };

// ---------- Hisako and the baby (for the photograph) ----------
const FACE_F = 'M-62 -1114 C-66 -1074 -62 -1040 -52 -1012 C-42 -986 -22 -968 0 -965 C22 -968 42 -986 52 -1012 C62 -1040 66 -1074 62 -1114 C56 -1152 30 -1172 0 -1172 C-30 -1172 -56 -1152 -62 -1114Z';
const EYE_F = { ...EYE_J, w: 15, h: 7.6, iris_r: 6.8, wing: .25, catch: .7, lashW: 1.15 };
const BROW_F = { col: '#1e1410', w: 5, len: 24, y: -1104, sep: 30, arch: 4.5, lineCol: '#7c4c34' };
const MOUTH_F = { w: 15, y: -1010, lip: '#b0605a', mouth: '#4a1c16', line: '#5a2a22', teeth: '#f0e8dc', crease: '#7c4c34', lipK: 1, full: 1 };
// hair drawn back into a low bun, soft waves over the temples
const hisakoHair = (col = '#16100c') => `<g filter="url(#pcsl)"><path d="M-68 -1060 C-78 -1110 -76 -1160 -56 -1190 C-36 -1214 0 -1222 30 -1214 C62 -1204 80 -1170 78 -1120 C78 -1090 74 -1070 68 -1056 C66 -1086 62 -1116 52 -1136 C34 -1150 12 -1154 -6 -1150 C-30 -1146 -48 -1132 -58 -1112 C-62 -1094 -64 -1076 -68 -1060 Z" fill="${col}"/></g>
  <g stroke="#5a4a40" fill="none" stroke-width="1.6" opacity=".55"><path d="M-50 -1140 C-30 -1160 0 -1170 30 -1166 M-60 -1110 C-50 -1150 -20 -1176 20 -1180 M40 -1150 C58 -1140 70 -1120 72 -1090"/></g>
  <path d="M-10 -1196 C14 -1206 40 -1200 56 -1186" stroke="#fff" stroke-width="5" fill="none" opacity=".14" filter="url(#softW2)"/>`;
// kasuri (indigo with white splashes) top with a crossed collar; monpe below (not seen in the photo)
function kasuriBody({ col = '#2e3a5a', w = .92 } = {}) {
  return ({ g, S, sk, e }) => { const id = g('kb'), X = v => v * w, R = rng(7);
    let dots = ''; for (let i = 0; i < 70; i++) { const x = (R() * 2 - 1) * 150, y = -980 + R() * 330; dots += `<path d="M${F1(x)} ${F1(y)} l6 -3 l2 4 l-6 3 Z" fill="#d8dce6" opacity=".55"/>`; }
    const body = `M${X(-40)} -1000 C${X(-96)} -992 ${X(-140)} -976 ${X(-152)} -940 C${X(-160)} -890 ${X(-156)} -800 ${X(-150)} -640 L${X(150)} -640 C${X(156)} -800 ${X(160)} -890 ${X(152)} -940 C${X(140)} -976 ${X(96)} -992 ${X(40)} -1000 L${X(0)} -930 Z`;
    return `<defs><clipPath id="${id}c"><path d="${body}"/></clipPath></defs>${softNeck(S, sk, 28, -962)}
      <path d="M${X(-40)} -1004 L${X(40)} -1004 L${X(0)} -926 Z" fill="${S.neck}" filter="url(#pks_${sk})"/>
      <path d="${body}" fill="${col}" filter="url(#pcl)"/><g clip-path="url(#${id}c)">${dots}</g>
      <g filter="url(#pcsl)"><path d="M${X(-40)} -1002 L${X(-26)} -1002 L${X(30)} -880 L${X(16)} -872 Z M${X(40)} -1002 L${X(26)} -1002 L${X(-8)} -930 L${X(4)} -916 Z" fill="#e6e2d8"/></g>`; };
}
const HISAKO = { skin: 'jpF', hair: 'bald', hairColor: 'black', beard: 'none', legs: 'none', top: 'vest', browW: .01, ownFace: 1, ownNose: 1, noMustache: 1, id: 'hk', ears: earsJ,
  facePath: FACE_F, faceShade: faceShadeJ(), faceExtra: jpFace(EYE_F, BROW_F, MOUTH_F, { age: .2 }), hat: 'hk', customHat: () => hisakoHair(), body: kasuriBody() };
// the baby, asleep in a cloth wrap: drawn at (x, y) = head centre, s = scale
const babyWrap = (x, y, s = 1, { S = SKJF } = {}) => `<g transform="translate(${F1(x)} ${F1(y)}) scale(${s})">
    <g filter="url(#pcl)"><path d="M-70 -10 C-80 40 -50 110 20 120 C90 124 130 70 120 10 C110 -40 70 -60 30 -60 C-10 -60 -60 -50 -70 -10 Z" fill="#e6dcc6"/></g>
    <path d="M-40 60 C0 80 60 80 100 50 M-50 30 C-10 50 50 50 110 20" stroke="#b8ac94" stroke-width="2.4" fill="none" opacity=".6"/>
    <g filter="url(#pks_jpF)"><ellipse cx="0" cy="0" rx="44" ry="40" fill="${S.mid}"/></g>
    <g filter="url(#softW)"><ellipse cx="-4" cy="-12" rx="26" ry="16" fill="${S.hi}" opacity=".45"/><ellipse cx="-20" cy="10" rx="9" ry="6" fill="#d88a7a" opacity=".3"/><ellipse cx="18" cy="10" rx="9" ry="6" fill="#d88a7a" opacity=".3"/></g>
    <path d="M-20 -2 q6 4 12 0 M8 -2 q6 4 12 0" stroke="#3a2418" stroke-width="2" fill="none" stroke-linecap="round"/>
    <ellipse cx="0" cy="8" rx="3" ry="2" fill="${S.shade}" opacity=".5"/><path d="M-5 20 q5 3 10 0" stroke="#9a5a4a" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M-30 -30 C-16 -44 10 -46 24 -36" stroke="#2a1e16" stroke-width="2" fill="none" opacity=".5"/>
    <g filter="url(#pcl)"><path d="M-60 -20 C-70 -60 -20 -78 30 -70 C70 -62 90 -40 96 -10 C70 -40 40 -50 0 -48 C-30 -46 -50 -36 -60 -20 Z" fill="#d8ccb2"/></g></g>`;
