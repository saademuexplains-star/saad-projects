// Spartan boy short — cast and props. Built on the engine's person(); children get a short custom body
// (feet at local y = -300, so place them with kid(x, y, s, ...)), and every face can carry expressive brows,
// tears and a clenched-teeth grimace through emoFace().

SKIN_TONES.olive = { hi: '#e6bb92', mid: '#c99468', lo: '#9a6440', ear: '#bd8560', earDk: '#a8724e', neck: '#b07a54', shade: '#875234', deep: '#70422a', blush: '#d77a5e', nostril: '#45261a', line: '#7a4430', lip: '#b8664e', mouth: '#5a2a1c', rim: '#62301a' };

addDefs(`
  <linearGradient id="spRed" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d23a2a"/><stop offset=".5" stop-color="#a82218"/><stop offset="1" stop-color="#5e0e0a"/></linearGradient>
  <linearGradient id="spRedV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c4301f"/><stop offset="1" stop-color="#6a120c"/></linearGradient>
  <radialGradient id="tearG" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#ffffff" stop-opacity=".95"/><stop offset=".5" stop-color="#cfe6ff" stop-opacity=".6"/><stop offset="1" stop-color="#9ab8d8" stop-opacity=".2"/></radialGradient>
  <linearGradient id="bladeG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f4f6f8"/><stop offset=".5" stop-color="#a9b0b8"/><stop offset="1" stop-color="#5a6068"/></linearGradient>
`);

// ---------- expressive face layer (drawn over the engine's face) ----------
// e.bIn / e.bOut: inner / outer brow raise (+ up). Sad = bIn up; angry = bIn down; fear = both up.
// e.tear: wet, shining eyes; e.tearRun 0..1: a drop running down the cheek; e.grit: clenched-teeth grimace;
// e.blush: flushed cheeks; e.bw: brow thickness
// big, readable eyes: almond whites, coloured iris that follows look/lookY, two highlights, a thick lash line;
// lid 0 open .. 1 half .. 2 closed; shock widens them and shrinks the pupils
function bigEyes(e, { iris = '#5a3a22', size = 1, lash = '#1e120a' } = {}) {
  const lid = e.lid || 0, sh = e.shock || 0;
  if (lid >= 1.5) return [-1, 1].map(s => `<path d="M${s * 28 - 22 * size} -1082 Q${s * 28} ${-1074} ${s * 28 + 22 * size} -1082" stroke="${lash}" stroke-width="4.5" fill="none" stroke-linecap="round"/>`).join('');
  const open = Math.max(.08, 1 - Math.min(lid, 1) * .72) * (1 + .3 * sh);
  return [-1, 1].map((s, i) => {
    const cx = s * 28, cy = -1084, w = 22 * size, top = cy - 12 * open * size, bot = cy + 8.5 * Math.min(1.2, open + .15) * size;
    const ix = cx + (e.look || 0) * 1.1, iy = cy + (e.lookY || 0) * .9 + 1;
    const id = `ey${i}_${(e._id || 'x')}`;
    const shape = `M${F1(cx - w)} ${cy} Q${F1(cx - w * .3)} ${F1(top - 4 * open)} ${F1(cx + w * .2)} ${F1(top)} Q${F1(cx + w * .8)} ${F1(top + 2)} ${F1(cx + w)} ${F1(cy - 1)} Q${F1(cx + w * .3)} ${F1(bot + 2)} ${F1(cx - w * .2)} ${F1(bot)} Q${F1(cx - w * .8)} ${F1(bot - 1)} ${F1(cx - w)} ${cy} Z`;
    const pr = (sh > .3 ? 3.2 : 4.8) * size, ir = 10 * size;
    return `<defs><clipPath id="${id}"><path d="${shape}"/></clipPath></defs>
      <path d="${shape}" fill="#f6f0e8"/>
      <g clip-path="url(#${id})"><circle cx="${F1(ix)}" cy="${F1(iy)}" r="${F1(ir)}" fill="${iris}"/><circle cx="${F1(ix)}" cy="${F1(iy)}" r="${F1(ir * .62)}" fill="${darken(iris, .35)}"/>
        <circle cx="${F1(ix)}" cy="${F1(iy)}" r="${F1(pr)}" fill="#0a0604"/><circle cx="${F1(ix - 3.5 * size)}" cy="${F1(iy - 4 * size)}" r="${F1(3 * size)}" fill="#fff"/><circle cx="${F1(ix + 3 * size)}" cy="${F1(iy + 3 * size)}" r="${F1(1.4 * size)}" fill="#fff" opacity=".8"/>
        <path d="M${F1(cx - w)} ${F1(top - 6)} L${F1(cx + w)} ${F1(top - 6)} L${F1(cx + w)} ${F1(top + 5)} L${F1(cx - w)} ${F1(top + 5)} Z" fill="#000" opacity=".18" filter="url(#softW2)"/></g>
      <path d="M${F1(cx - w - 2)} ${cy + 1} Q${F1(cx - w * .3)} ${F1(top - 4 * open)} ${F1(cx + w * .2)} ${F1(top)} Q${F1(cx + w * .8)} ${F1(top + 2)} ${F1(cx + w + 3)} ${F1(cy - 3)}" stroke="${lash}" stroke-width="${F1(4.5 * size)}" fill="none" stroke-linecap="round"/>
      <path d="M${F1(cx - w * .8)} ${F1(bot - 1)} Q${F1(cx)} ${F1(bot + 3)} ${F1(cx + w * .8)} ${F1(bot - 1)}" stroke="#7a4a36" stroke-width="2" fill="none" opacity=".55"/>`;
  }).join('');
}
function emoFace({ g, e, bw = 9, browCol = '#2a1a10', extra = '', eyes = null }) {
  const bi = e.bIn || 0, bo = e.bOut || 0, w = e.bw || bw;
  const brows = [-1, 1].map(s => {
    const xi = s * 9, xo = s * 50, yi = -1103 - bi - (e.lid ? 2 : 0), yo = -1104 - bo, ym = (yi + yo) / 2 - 8 - (bi - bo) * .15;
    return `<path d="M${xi} ${F1(yi)} Q${s * 28} ${F1(ym)} ${xo} ${F1(yo)}" stroke="${browCol}" stroke-width="${w}" stroke-linecap="round" fill="none" filter="url(#softW2)"/>`;
  }).join('');
  const knit = bi > 4 ? `<path d="M-6 -1112 q6 -10 12 0" stroke="#7a4430" stroke-width="2.5" fill="none" opacity="${Math.min(.6, (bi - 4) * .05).toFixed(2)}"/>` : '';
  const tr = e.tear || 0, run = e.tearRun || 0;
  const tears = tr > .02 ? `${[-1, 1].map(s => `<path d="M${s * 14} -1077 Q${s * 28} -1071 ${s * 42} -1077" stroke="#e8f4ff" stroke-width="3.5" fill="none" opacity="${(.85 * tr).toFixed(2)}"/>
      <circle cx="${s * 34}" cy="-1088" r="3.2" fill="#fff" opacity="${(.9 * tr).toFixed(2)}"/>`).join('')}` : '';
  const drop = run > .01 ? `<path d="M-36 -1074 Q-40 ${F1(-1074 + 40 * run)} -41 ${F1(-1072 + 70 * run)}" stroke="#d8ecff" stroke-width="3" fill="none" opacity=".55"/>
      <ellipse cx="-41" cy="${F1(-1068 + 70 * run)}" rx="4.2" ry="6" fill="url(#tearG)"/>` : '';
  const grit = e.grit ? `<g opacity="${Math.min(1, e.grit).toFixed(2)}"><path d="M-22 -1018 Q0 -1024 22 -1018 L20 -1002 Q0 -998 -20 -1002 Z" fill="#3a1410"/>
      <path d="M-19 -1015 Q0 -1019 19 -1015 L18 -1004 Q0 -1001 -18 -1004 Z" fill="#efe6d8"/><path d="M-19 -1009.5 L19 -1009.5 M-9 -1017 L-9 -1002 M0 -1018 L0 -1001 M9 -1017 L9 -1002" stroke="#b8aa96" stroke-width="1.4"/>
      <path d="M-24 -1019 Q0 -1027 24 -1019 M-22 -1000 Q0 -994 22 -1000" stroke="#8a4a3a" stroke-width="3" fill="none"/></g>` : '';
  const blush = e.blush ? `<g filter="url(#softW)" opacity="${(.4 * e.blush).toFixed(2)}"><ellipse cx="-44" cy="-1040" rx="20" ry="11" fill="#e0604a"/><ellipse cx="44" cy="-1040" rx="20" ry="11" fill="#e0604a"/></g>` : '';
  return `${blush}${extra}${eyes ? bigEyes({ ...e, _id: g('') }, eyes) : ''}${brows}${knit}${tears}${drop}${grit}`;
}

// ---------- the boy (7): short body, big head, messy hair that can be shaved away ----------
// hair(g, amt): amt 1 = full mop, 0 = shaved; shaving sweeps from the back (screen-right) to the front
function boyHair(g, amt = 1, col = '#3a2416') {
  if (amt >= .999) return `<path d="M-86 -1078 C-102 -1128 -96 -1180 -66 -1206 C-48 -1230 -16 -1240 8 -1234 C36 -1242 70 -1228 84 -1204 C102 -1178 106 -1130 96 -1086 C94 -1076 90 -1068 86 -1060 C84 -1080 80 -1098 72 -1110 C70 -1102 66 -1096 60 -1092 C58 -1108 52 -1120 42 -1128 C38 -1116 32 -1108 24 -1102 C24 -1118 18 -1130 6 -1136 C2 -1122 -6 -1112 -16 -1106 C-16 -1122 -22 -1134 -34 -1138 C-38 -1124 -46 -1114 -56 -1108 C-58 -1120 -62 -1128 -70 -1130 C-74 -1112 -78 -1094 -86 -1078 Z" fill="${col}" filter="url(#pcsl)"/>
    <g filter="url(#softW2)" opacity=".55"><path d="M-66 -1190 C-50 -1176 -42 -1156 -40 -1140 M-30 -1210 C-12 -1192 -2 -1170 0 -1140 M14 -1216 C32 -1198 42 -1172 42 -1136 M52 -1204 C68 -1186 76 -1160 76 -1118" stroke="${darken(col, .45)}" stroke-width="4" fill="none"/></g>
    <path d="M-52 -1196 C-36 -1182 -30 -1162 -30 -1146 M-10 -1214 C6 -1196 14 -1176 16 -1150 M34 -1210 C50 -1192 58 -1170 60 -1140" stroke="#8a6040" stroke-width="2.6" fill="none" opacity=".6"/>
    <path d="M-48 -1208 Q-6 -1228 44 -1214" stroke="#b88a60" stroke-width="9" fill="none" opacity=".4" filter="url(#softW2)"/>`;
  const shaved = `<g clip-path="url(#${g('face')})"><path d="M-84 -1090 C-80 -1112 -66 -1124 -44 -1129 C-20 -1135 20 -1135 44 -1129 C66 -1124 80 -1112 84 -1090 L96 -1210 L-96 -1210 Z" fill="#3a2a1e" opacity=".32" filter="url(#softW2)"/></g>`;
  if (amt <= .001) return shaved;
  const cut = lerp(-100, 100, amt);   // hair remains only left of `cut`
  return `${shaved}<defs><clipPath id="${g('hc')}"><rect x="-120" y="-1260" width="${F1(cut + 120)}" height="240"/></clipPath></defs>
    <g clip-path="url(#${g('hc')})">${boyHair(g, 1, col)}</g>`;
}

// ---------- refined limbs: tapered two-segment arms (one silhouette) and real hands ----------
function capsuleD(x1, y1, r1, x2, y2, r2) {
  const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy);
  if (L <= Math.abs(r1 - r2) + .01) { const [x, y, r] = r1 > r2 ? [x1, y1, r1] : [x2, y2, r2]; return `M${F1(x - r)} ${F1(y)} a${F1(r)} ${F1(r)} 0 1 0 ${F1(2 * r)} 0 a${F1(r)} ${F1(r)} 0 1 0 ${F1(-2 * r)} 0Z`; }
  const a = Math.acos((r1 - r2) / L), b = Math.atan2(dy, dx), P = (x, y, r, t) => [x + r * Math.cos(t), y + r * Math.sin(t)];
  const [ax, ay] = P(x1, y1, r1, b + a), [bx, by] = P(x2, y2, r2, b + a), [cx, cy] = P(x2, y2, r2, b - a), [ex, ey] = P(x1, y1, r1, b - a);
  return `M${F1(ax)} ${F1(ay)} L${F1(bx)} ${F1(by)} A${F1(r2)} ${F1(r2)} 0 ${2 * a > Math.PI ? 1 : 0} 0 ${F1(cx)} ${F1(cy)} L${F1(ex)} ${F1(ey)} A${F1(r1)} ${F1(r1)} 0 ${2 * Math.PI - 2 * a > Math.PI ? 1 : 0} 0 ${F1(ax)} ${F1(ay)}Z`;
}
// relaxed hanging hand, wrist at (0,0), fingers toward +y, thumb toward the body's centre (k = -1 screen-left hand)
function relaxedHand(k, x, y, s, rot, { S, sk }) {
  return `<g transform="translate(${F1(x)} ${F1(y)}) rotate(${F1(rot)}) scale(${F1(-k * s)} ${F1(s)})">
    <path d="M-14 -4 C-18 8 -20 22 -19 34 C-18 45 -15 53 -10 58 C-7 61 -3 61 -1 58 C1 62 5 62 7 58 C9 61 13 60 14 56 C16 51 17 43 16 35 C18 29 22 23 24 17 C26 11 24 7 20 8 C16 10 13 15 11 19 C12 11 13 4 12 -4 Z" fill="${S.mid}" filter="url(#pks_${sk})"/>
    <path d="M-6 40 L-7 56 M3 42 L3 57" stroke="${S.shade}" stroke-width="1.6" opacity=".5" stroke-linecap="round"/>
    <path d="M12 21 C16 16 19 13 21 12" stroke="${S.shade}" stroke-width="1.6" opacity=".45" fill="none"/>
    <path d="M-12 4 C-15 16 -15 28 -13 38" stroke="${S.hi}" stroke-width="4" opacity=".4" fill="none" stroke-linecap="round"/></g>`;
}
// body-scale hands, wrist at (0,0), fingers toward +y (rotate to the forearm direction), thumb toward +x (mirrored by k)
function fistHandS(k, x, y, s, rot, { S, sk }) {
  return `<g transform="translate(${F1(x)} ${F1(y)}) rotate(${F1(rot)}) scale(${F1(-k * s)} ${F1(s)})">
    <path d="M-15 -3 C-19 6 -20 18 -18 28 C-16 37 -9 42 0 42 C9 42 16 37 18 28 C20 20 19 8 15 -3 Z" fill="${S.mid}" filter="url(#pks_${sk})"/>
    <path d="M-13 30 Q-7 37 0 37 Q7 37 13 31" stroke="${S.shade}" stroke-width="2" fill="none" opacity=".55"/>
    <path d="M-7 33 L-7 39 M1 34 L1 41 M8 33 L8 39" stroke="${S.shade}" stroke-width="1.6" opacity=".5"/>
    <path d="M15 4 C22 10 22 20 14 24" stroke="${S.shade}" stroke-width="2" fill="none" opacity=".5"/></g>`;
}
function openHandS(k, x, y, s, rot, { S, sk }) {
  const fing = [[-11, -16], [-4, -5], [4, 5], [11, 15]].map(([fx, a], i) => { const L = [24, 28, 27, 22][i], r = a * Math.PI / 180;
    return capsuleD(fx, 26, 5.6, fx + Math.sin(-r) * L, 26 + Math.cos(r) * L, 4.6); }).join(' ');
  return `<g transform="translate(${F1(x)} ${F1(y)}) rotate(${F1(rot)}) scale(${F1(-k * s)} ${F1(s)})">
    <g filter="url(#pks_${sk})" fill="${S.mid}"><path d="M-15 -3 C-19 8 -19 20 -16 30 L16 30 C19 20 19 8 15 -3 Z"/><path d="${fing}"/><path d="${capsuleD(13, 10, 6.5, 26, 26, 4.8)}"/></g>
    <path d="M-12 30 Q0 34 12 30" stroke="${S.shade}" stroke-width="1.6" fill="none" opacity=".4"/></g>`;
}
function pointHandS(k, x, y, s, rot, { S, sk }) {
  return `<g transform="translate(${F1(x)} ${F1(y)}) rotate(${F1(rot)}) scale(${F1(-k * s)} ${F1(s)})">
    <g filter="url(#pks_${sk})" fill="${S.mid}"><path d="M-15 -3 C-19 6 -20 18 -18 28 C-16 37 -9 42 0 42 C9 42 16 37 18 28 C20 20 19 8 15 -3 Z"/><path d="${capsuleD(-9, 34, 5.4, -10, 72, 4.6)}"/></g>
    <path d="M1 34 L1 41 M8 33 L8 39" stroke="${S.shade}" stroke-width="1.6" opacity=".5"/></g>`;
}
const HANDS = { relaxed: relaxedHand, fist: fistHandS, open: openHandS, point: pointHandS };
// an arm posed by absolute local points (shoulder, elbow, wrist); optional sleeve over the upper arm (sleeveLen 0..2 covers
// shoulder→elbow→wrist), optional wrist band or cuff; hand type relaxed | fist | open | point | none
function posedArm(k, sh, el, wr, { r1 = 22, r2 = 17, r3 = 13, S, sk, sleeve = null, sleeveLen = .4, cuff = null, band = null, hand = 'relaxed', hrot = 0, hs = 1 }) {
  const ang = Math.atan2(wr[1] - el[1], wr[0] - el[0]) * 180 / Math.PI - 90;
  let sl = '';
  if (sleeve && sleeveLen > 0) {
    const f1 = Math.min(1, sleeveLen), m1 = [lerp(sh[0], el[0], f1), lerp(sh[1], el[1], f1)];
    sl = `<g filter="url(#pcs)" fill="${sleeve}"><path d="${capsuleD(sh[0], sh[1] - 4, r1 + 7, m1[0], m1[1], lerp(r1, r2, f1) + 6)}"/>`;
    if (sleeveLen > 1) { const f2 = Math.min(1, sleeveLen - 1), m2 = [lerp(el[0], wr[0], f2), lerp(el[1], wr[1], f2)]; sl += `<path d="${capsuleD(el[0], el[1], r2 + 6, m2[0], m2[1], lerp(r2, r3, f2) + 6)}"/>`; }
    sl += '</g>';
    if (cuff && sleeveLen > 1.5) { const f2 = Math.min(1, sleeveLen - 1), m2 = [lerp(el[0], wr[0], f2), lerp(el[1], wr[1], f2)], a2 = Math.atan2(wr[1] - el[1], wr[0] - el[0]);
      sl += `<path d="M${F1(m2[0] - Math.sin(a2) * (r3 + 7))} ${F1(m2[1] + Math.cos(a2) * (r3 + 7))} L${F1(m2[0] + Math.sin(a2) * (r3 + 7))} ${F1(m2[1] - Math.cos(a2) * (r3 + 7))}" stroke="${cuff}" stroke-width="9" stroke-linecap="round"/>`; }
  }
  const bandSVG = band ? `<path d="${capsuleD(lerp(el[0], wr[0], .62), lerp(el[1], wr[1], .62), r3 + 4, lerp(el[0], wr[0], .9), lerp(el[1], wr[1], .9), r3 + 3)}" fill="${band}" filter="url(#pcs)"/>` : '';
  const H = HANDS[hand];
  return `<g filter="url(#pk_${sk})" fill="${S.mid}"><path d="${capsuleD(sh[0], sh[1], r1, el[0], el[1], r2)}"/><path d="${capsuleD(el[0], el[1], r2, wr[0], wr[1], r3)}"/></g>
    <path d="${capsuleD(lerp(sh[0], el[0], .15) - k * r1 * .3, lerp(sh[1], el[1], .15), r1 * .22, lerp(sh[0], el[0], .85) - k * r2 * .3, lerp(sh[1], el[1], .85), r2 * .18)}" fill="${S.hi}" opacity=".25" filter="url(#softW2)"/>
    ${sl}${bandSVG}${H ? H(k, wr[0], wr[1] - 3, hs, ang + hrot, { S, sk }) : ''}`;
}
// a walking stride for the frontal rigs: per-leg lift and a body bob (t in seconds)
const stride = (t, period = .52, lift = 26, ph = 0) => {
  const a = (t / period) * Math.PI * 2 + ph;
  return { legL: { lift: lift * Math.max(0, Math.sin(a)) }, legR: { lift: lift * Math.max(0, Math.sin(a + Math.PI)) }, bob: Math.abs(Math.cos(a)) * lift * .35, sway: Math.sin(a) * 2.2 };
};
const legTf = (k, e, hipY, footY) => { const L = e && e[k < 0 ? 'legL' : 'legR']; if (!L || !L.lift) return ''; const sc = 1 - L.lift / (footY - hipY); return `transform="matrix(1 0 0 ${sc.toFixed(4)} 0 ${F1(hipY * (1 - sc))})"`; };

// tapered arm with a slight elbow bend, as one silhouette; returns {svg, hand: [x, y, angle]}
function refinedArm(k, { sh, el, wr, r1, r2, r3, S, sk, fill = null, hand = 1 }) {
  const P = p => [k * p[0], p[1]];
  const [a, b, c] = [P(sh), P(el), P(wr)];
  const ang = Math.atan2(c[1] - b[1], c[0] - b[0]) * 180 / Math.PI - 90;
  return `<g filter="url(#pk_${sk})" fill="${fill || S.mid}"><path d="${capsuleD(a[0], a[1], r1, b[0], b[1], r2)}"/><path d="${capsuleD(b[0], b[1], r2, c[0], c[1], r3)}"/></g>
    <path d="${capsuleD(a[0] - k * r1 * .35, a[1] + 20, r1 * .25, b[0] - k * r2 * .3, b[1], r2 * .2)}" fill="${S.hi}" opacity=".28" filter="url(#softW2)"/>
    ${hand ? relaxedHand(k, c[0], c[1] - 4, hand, ang, { S, sk }) : ''}`;
}

function childBody({ tunic = '#9a6a3a', belt = '#5a3a1e', cloak = 0, wrapped = 0, bare = 0 } = {}) {
  return ({ g, S, sk, e, neck }) => {
    const arm = (k, ang) => e[k < 0 ? 'noArmL' : 'noArmR'] ? '' : e[k < 0 ? 'armL' : 'armR'] ? (() => { const P0 = e[k < 0 ? 'armL' : 'armR'];
      return posedArm(k, [k * 110, -930], P0.el, P0.wr, { r1: 22, r2: 17, r3: 13, S, sk, sleeve: bare ? null : tunic, sleeveLen: .42, hand: P0.hand, hrot: P0.hrot, hs: P0.hs ?? .95 }); })() : `<g transform="rotate(${F1(ang)} ${k * 108} -942)">
      ${refinedArm(k, { sh: [-110, -930], el: [-122, -812], wr: [-116, -706], r1: 22, r2: 17, r3: 13, S, sk, hand: .95 })}
      ${bare ? '' : `<path d="${mx(k, 'M -88 -962 C -112 -966 -132 -950 -138 -926 C -142 -906 -142 -884 -138 -864 C -122 -856 -104 -858 -92 -866 Z')}" fill="${tunic}" filter="url(#pcs)"/>
      <path d="${mx(k, 'M -138 -866 C -122 -858 -104 -860 -92 -868')}" stroke="${darken(tunic, .35)}" stroke-width="3" fill="none" opacity=".8"/>`}</g>`;
    const legs = [-1, 1].map(k => `<g ${legTf(k, e, -616, -300)}><path d="${mx(k, 'M -70 -616 C -74 -556 -70 -500 -66 -476 C -72 -452 -72 -420 -64 -390 C -60 -370 -58 -354 -56 -336 L -24 -336 C -22 -356 -20 -372 -18 -392 C -14 -424 -16 -452 -20 -476 C -16 -510 -12 -560 -10 -616 Z')}" fill="${S.mid}" filter="url(#pk_${sk})"/>
      <path d="${mx(k, 'M -60 -480 Q -44 -470 -28 -480')}" stroke="${S.shade}" stroke-width="2.5" fill="none" opacity=".45"/>
      <path d="${mx(k, 'M -60 -340 C -76 -332 -84 -316 -80 -304 L -18 -302 C -16 -316 -20 -332 -26 -340 Z')}" fill="${e.shoes ? '#5a3a20' : S.mid}" filter="url(#pks_${sk})"/>
      ${e.shoes ? `<path d="${mx(k, 'M -62 -330 L -24 -334 M -64 -316 L -22 -320')}" stroke="#3a2412" stroke-width="5"/>` : ''}</g>`).join('');
    const tp = bare ? 'M-56 -992 C-88 -986 -110 -970 -118 -942 L-110 -770 C-116 -710 -124 -660 -130 -600 Q0 -580 130 -600 C124 -660 116 -710 110 -770 L118 -942 C110 -970 88 -986 56 -992 Z'
      : 'M-46 -994 C-72 -990 -98 -980 -114 -960 C-122 -934 -116 -886 -110 -846 C-106 -806 -106 -766 -112 -726 C-118 -686 -126 -646 -134 -604 C-90 -590 -44 -596 0 -592 C44 -596 90 -590 134 -604 C126 -646 118 -686 112 -726 C106 -766 106 -806 110 -846 C116 -886 122 -934 114 -960 C98 -980 72 -990 46 -994 C30 -968 -30 -968 -46 -994 Z';
    const id = g('cb');
    const body = bare ? `<path d="${tp}" fill="url(#${id}s)" filter="url(#pk_${sk})"/>
        <g filter="url(#softW)" opacity=".5">${[-1, 0, 1].map(i => `<path d="M-70 ${-880 + i * 30} Q0 ${-866 + i * 30} 70 ${-880 + i * 30}" stroke="${S.shade}" stroke-width="5" fill="none"/>`).join('')}</g>
        <path d="M-130 -640 Q0 -620 130 -640 L132 -600 Q0 -582 -132 -600 Z" fill="#c8b890" filter="url(#pcsl)"/>`
      : `<path d="${tp}" fill="url(#${id}t)" filter="url(#pcl)"/>
        <g filter="url(#softW)" opacity=".5">
          <path d="M-96 -900 C-74 -860 -56 -830 -40 -790 M96 -900 C78 -862 60 -830 46 -790" stroke="${darken(tunic, .5)}" stroke-width="9" fill="none"/>
          <path d="M-58 -768 C-66 -716 -78 -664 -92 -608 M-8 -768 C-10 -716 -12 -662 -14 -600 M48 -768 C54 -716 62 -662 70 -606" stroke="${darken(tunic, .55)}" stroke-width="10" fill="none"/>
          <path d="M-84 -930 C-92 -870 -94 -820 -88 -780 M-34 -760 C-38 -710 -44 -660 -50 -606" stroke="${lighten(tunic, .35)}" stroke-width="9" fill="none"/></g>
        <path d="M-46 -994 C-30 -968 30 -968 46 -994" stroke="${darken(tunic, .45)}" stroke-width="5" fill="none"/>
        <path d="M-132 -606 C-90 -594 -44 -598 0 -594 C44 -598 90 -594 132 -606" stroke="${darken(tunic, .4)}" stroke-width="5" fill="none" opacity=".8"/>
        <path d="M-110 -786 Q0 -770 110 -786" stroke="${belt}" stroke-width="13" fill="none" stroke-linecap="round"/>
        <path d="M-110 -786 Q0 -770 110 -786" stroke="${lighten(belt, .3)}" stroke-width="3" fill="none" stroke-dasharray="7 6" opacity=".7"/>
        <path d="M28 -776 C34 -756 30 -730 36 -712 M38 -777 C46 -758 46 -736 50 -720" stroke="${belt}" stroke-width="6" fill="none" stroke-linecap="round"/>
        <circle cx="33" cy="-778" r="9" fill="${belt}" filter="url(#pcs)"/>`;
    const cl = cloak ? `<path d="M-120 -950 C-170 -900 -190 -760 -200 -560 C-150 -540 -120 -560 -100 -580 L-100 -800 Z M120 -950 C170 -900 190 -760 200 -560 C150 -540 120 -560 100 -580 L100 -800 Z" fill="url(#spRedV)" filter="url(#pcl)"/>` : '';
    const wrap = wrapped ? (() => { const fl = e.flap || 0;
      return `<path d="M-124 -956 C-150 -900 ${F1(-176 - 14 * fl)} -760 ${F1(-170 - 26 * fl)} -560 Q0 ${F1(-520 + 10 * fl)} ${F1(170 + 20 * fl)} -560 C176 -760 150 -900 124 -956 C80 -990 -80 -990 -124 -956 Z" fill="url(#spRed)" filter="url(#pcl)"/>
        <g filter="url(#softW)" opacity=".55"><path d="M-60 -930 C-80 -800 -90 -680 -100 -560 M30 -900 C40 -780 46 -680 52 -566 M-10 -920 Q-20 -760 -14 -560" stroke="#4a0a06" stroke-width="12" fill="none"/></g>
        <path d="M-124 -956 C-150 -900 -176 -760 -170 -560" stroke="#ff8a6a" stroke-width="6" fill="none" opacity=".35" filter="url(#softW2)"/>
        <path d="M-6 -958 C-14 -860 -18 -720 -8 -562" stroke="#3a0604" stroke-width="9" fill="none" opacity=".75"/>
        ${fist(-14, -884, .36, 84, { S, sk })}
        ${e.wound ? `<ellipse cx="0" cy="-730" rx="${F1(30 + 44 * e.wound)}" ry="${F1(24 + 34 * e.wound)}" fill="#5a0606" opacity="${(.85 * Math.min(1, e.wound * 2)).toFixed(2)}" filter="url(#softW2)"/>` : ''}
        ${e.bulge ? `<ellipse cx="${F1(6 * Math.sin(e.bulgeT || 0))}" cy="-740" rx="${F1(70 + 10 * e.bulge)}" ry="${F1(54 + 8 * Math.abs(Math.sin((e.bulgeT || 0) * 1.7)))}" fill="#b0281c" opacity=".55" filter="url(#softW)"/>
          <ellipse cx="${F1(-22 + 6 * Math.sin(e.bulgeT || 0))}" cy="${F1(-772 + 5 * Math.sin((e.bulgeT || 0) * 1.3))}" rx="34" ry="22" fill="#ff7a5a" opacity=".3" filter="url(#softW)"/>
          <path d="M${F1(52 + 6 * Math.sin(e.bulgeT || 0))} -800 C${F1(74 + 8 * Math.sin((e.bulgeT || 0) * 1.7))} -760 ${F1(70 + 6 * Math.sin(e.bulgeT || 0))} -716 44 -686" stroke="#4a0806" stroke-width="9" fill="none" opacity=".55" filter="url(#softW2)"/>
          <path d="M-70 ${F1(-806 + 6 * Math.sin((e.bulgeT || 0) * 2.1))} l34 18 M-58 -700 l30 -12" stroke="#5a0a06" stroke-width="6" fill="none" opacity=".45" filter="url(#softW2)"/>` : ''}`; })() : '';
    return `<defs>${linG(id + 't', [lighten(tunic, .22), tunic, darken(tunic, .45)], { user: [-130, 0, 130, 0] })}${linG(id + 's', [S.hi, S.mid, S.lo], { user: [-130, 0, 130, 0] })}</defs>
      ${cl}${legs}${body}${arm(-1, e.raiseLeft || 0)}${arm(1, -(e.raiseRight || 0))}${neck}${wrap}`;
  };
}
const boyFace = (cut) => ({ g, e }) => `<g transform="translate(${F1(-(e.turn || 0) * 11)} 0)">${boyHair(g, cut ? 0 : (e.hair ?? 1))}</g>${emoFace({ g, e: { blush: .5, ...e }, bw: 8, eyes: { iris: '#6a4424', size: 1.08 } })}`;
const BOY = { skin: 'olive', hair: 'bald', hairColor: 'brown', beard: 'none', top: 'vest', legs: 'none', eyeColor: '#4a3020', browW: .01, id: 'by', child: true,
  body: childBody({}), faceExtra: boyFace(false) };
const BOY_CAMP = { ...BOY, id: 'bc', body: childBody({ wrapped: 1 }), faceExtra: boyFace(true) };
const BOY_BARE = { ...BOY, id: 'bb', body: childBody({ tunic: '#6e5236', belt: '#3a2614' }), faceExtra: boyFace(true) };
// a child placed with feet at (x, y)
const kid = (x, y, s, look, pose) => at(x, y + 300 * s, s, P(look, pose));

// ---------- the mother: dark hair, plain blue-grey peplos ----------
const momFace = ({ g, e }) => emoFace({ g, e: { blush: .3, ...e }, bw: 6, browCol: '#3a2418', eyes: { iris: '#5a6a3a', size: 1.02 } });
const MOTHER = { skin: 'olive', hair: 'long', hairColor: 'brown', beard: 'none', top: 'robe', robe: '#4e5f7e', trim: '#c49a3c', eyeColor: '#3a2a1e', browW: .01, id: 'mo', faceExtra: momFace };

// ---------- Spartan soldiers: bronze Corinthian helmet with a tall red crest, red cloak, bronze breastplate ----------
// helmet: down = face hidden behind bronze (only eye slits glint); up = pushed up on the forehead
function corinthian({ up = 0, glint = 1 } = {}) {
  return () => {
    return `<g transform="translate(0 ${F1(-175 * up)})"><path d="M-90 -1110 C-96 -1190 -54 -1238 0 -1240 C54 -1238 96 -1190 90 -1110 L92 -980 C80 -948 50 -944 26 -948 L24 -1040 L12 -1050 L12 -1094 L58 -1092 L58 -1066 L-58 -1066 L-58 -1092 L-12 -1094 L-12 -1050 L-24 -1040 L-26 -948 C-50 -944 -80 -948 -92 -980 Z" fill="url(#bronzeG)" filter="url(#pcl)"/>
      <path d="M-58 -1092 L58 -1092 L58 -1066 L12 -1066 L12 -1050 L24 -1040 L26 -948 L-26 -948 L-24 -1040 L-12 -1050 L-12 -1066 L-58 -1066 Z" fill="#0b0705"/>
      <circle cx="-30" cy="-1079" r="4" fill="#fff6d8" opacity="${(.85 * glint).toFixed(2)}"/><circle cx="30" cy="-1079" r="4" fill="#fff6d8" opacity="${(.85 * glint).toFixed(2)}"/>
      <path d="M-70 -1160 Q-40 -1210 10 -1220" stroke="#fff3c8" stroke-width="8" fill="none" opacity=".45" filter="url(#softW2)"/>
      <path d="M-16 -1238 C-20 -1330 -8 -1380 0 -1384 C8 -1380 20 -1330 16 -1238 Z" fill="url(#spRedV)" filter="url(#pcsl)"/>
      <path d="M-90 -1240 C-60 -1320 -10 -1350 0 -1350 C10 -1350 60 -1320 90 -1240 C60 -1270 -60 -1270 -90 -1240 Z" fill="#9a1c12" filter="url(#pcsl)"/>
      <path d="M-70 -1262 L-60 -1300 M-40 -1280 L-34 -1326 M40 -1280 L34 -1326 M70 -1262 L60 -1300" stroke="#5a0a06" stroke-width="5" opacity=".7"/></g>`;
  };
}
function hopliteBody({ cloakCol = 'url(#spRedV)', cuirass = 1, skirt = '#8e1c14', chiton = '#7a6a52' } = {}) {
  return ({ g, S, sk, e, neck }) => {
    const id = g('hb');
    const arm = (k, ang) => e[k < 0 ? 'noArmL' : 'noArmR'] ? '' : e[k < 0 ? 'armL' : 'armR'] ? (() => { const P0 = e[k < 0 ? 'armL' : 'armR'];
      return posedArm(k, [k * 160, -915], P0.el, P0.wr, { r1: 38, r2: 28, r3: 22, S, sk, band: '#5a3a20', hand: P0.hand, hrot: P0.hrot, hs: P0.hs ?? 1.45 }); })() : `<g transform="rotate(${F1(ang)} ${k * 160} -925)">
      ${refinedArm(k, { sh: [-160, -915], el: [-186, -790], wr: [-182, -668], r1: 38, r2: 28, r3: 22, S, sk, hand: 1.45 })}
      <path d="${mx(k, 'M -194 -712 L -192 -668')}" stroke="#5a3a20" stroke-width="50" stroke-linecap="round" filter="url(#pcs)"/>
      <path d="${mx(k, 'M -150 -880 C -170 -860 -184 -830 -190 -800')}" stroke="${S.shade}" stroke-width="8" fill="none" opacity=".35" filter="url(#softW2)"/></g>`;
    const legs = [-1, 1].map(k => `<g ${legTf(k, e, -470, 0)}><path d="${mx(k, 'M -150 -470 C -160 -380 -150 -300 -126 -250 C -140 -190 -130 -120 -112 -70 L -108 -38 C -132 -28 -150 -14 -150 0 L -40 0 C -40 -20 -46 -40 -54 -60 C -46 -120 -42 -200 -54 -250 C -42 -300 -32 -380 -30 -470 Z')}" fill="${S.mid}" filter="url(#pk_${sk})"/>
      <path d="${mx(k, 'M -134 -244 C -144 -180 -136 -120 -118 -64 L -52 -64 C -46 -120 -42 -180 -52 -244 Q -94 -258 -134 -244 Z')}" fill="url(#bronzeG)" filter="url(#pcsl)"/>
      <path d="${mx(k, 'M -146 -16 L -44 -22 M -136 -38 L -50 -46')}" stroke="#3a2412" stroke-width="9"/></g>`).join('');
    const cl = `<path d="M-170 -960 C-260 -860 -300 -500 -310 -120 C-200 -80 -100 -100 0 -110 C100 -100 200 -80 310 -120 C300 -500 260 -860 170 -960 Z" fill="${cloakCol}" filter="url(#pcl)"/>
      <g filter="url(#softW)" opacity=".5"><path d="M-220 -700 C-240 -500 -250 -300 -256 -130 M220 -700 C240 -500 250 -300 256 -130" stroke="#3a0604" stroke-width="16" fill="none"/></g>`;
    const torso = cuirass ? `<path d="M-70 -994 C-140 -984 -186 -968 -196 -925 L-184 -640 Q0 -610 184 -640 L196 -925 C186 -968 140 -984 70 -994 Z" fill="url(#bronzeG)" filter="url(#pcl)"/>
      <g opacity=".55" filter="url(#softW)"><path d="M-130 -830 Q-70 -790 -10 -820 M130 -830 Q70 -790 10 -820" stroke="#5a3a10" stroke-width="12" fill="none"/><path d="M0 -900 L0 -680" stroke="#5a3a10" stroke-width="8"/>
        <path d="M-60 -750 Q0 -738 60 -750 M-56 -700 Q0 -690 56 -700" stroke="#5a3a10" stroke-width="7" fill="none"/><path d="M-140 -910 Q-90 -890 -40 -900" stroke="#fff3c8" stroke-width="14" fill="none"/></g>`
      : `<path d="M-66 -994 C-130 -984 -180 -968 -194 -925 L-182 -640 Q0 -620 182 -640 L194 -925 C180 -968 130 -984 66 -994 Z" fill="url(#${id}c)" filter="url(#pcl)"/>
        <g filter="url(#softW)" opacity=".45"><path d="M-110 -900 C-120 -800 -126 -720 -130 -650 M90 -900 C96 -800 100 -720 104 -650" stroke="${darken(chiton, .55)}" stroke-width="12" fill="none"/><path d="M-60 -960 Q-70 -820 -76 -680" stroke="${lighten(chiton, .3)}" stroke-width="10" fill="none"/></g>
        <path d="M-56 -992 Q0 -940 56 -992" fill="${S.mid}" filter="url(#pks_${sk})"/>`;
    return `<defs>${linG(id + 's', [S.hi, S.mid, S.lo], { user: [-180, 0, 180, 0] })}${linG(id + 'c', [lighten(chiton, .2), chiton, darken(chiton, .45)], { user: [-190, 0, 190, 0] })}</defs>
      ${cl}${legs}
      <path d="M-184 -650 L184 -650 L200 -470 Q0 -440 -200 -470 Z" fill="${skirt}" filter="url(#pcl)"/>
      <path d="M-120 -640 L-130 -470 M-60 -640 L-64 -456 M0 -640 L0 -452 M60 -640 L64 -456 M120 -640 L130 -470" stroke="${darken(skirt, .5)}" stroke-width="6" opacity=".6"/>
      ${torso}
      <path d="M-184 -660 Q0 -634 184 -660 L182 -620 Q0 -598 -182 -620 Z" fill="#4a2a14" filter="url(#pcsl)"/>
      ${arm(-1, e.raiseLeft || 0)}${arm(1, -(e.raiseRight || 0))}${neck}
      <path d="M-196 -940 C-160 -990 -80 -1000 -40 -996 L-60 -960 C-110 -960 -160 -950 -196 -920 Z M196 -940 C160 -990 80 -1000 40 -996 L60 -960 C110 -960 160 -950 196 -920 Z" fill="url(#spRedV)" filter="url(#pcsl)"/>`;
  };
}
const SOLDIER = { skin: 'olive', hair: 'long', hairColor: 'black', beard: 'full', hat: 'helm', customHat: corinthian({}), top: 'vest', legs: 'none', eyeColor: '#2a1a10', browW: 10, id: 'sd', body: hopliteBody({}) };
const hardFace = ({ g, e }) => emoFace({ g, e, bw: 11, browCol: '#1c120c', eyes: { iris: '#3a2a1a', size: .95 }, extra: `<g filter="url(#softW)" opacity=".35"><path d="M-62 -1110 Q-30 -1118 -8 -1106 M62 -1110 Q30 -1118 8 -1106" stroke="#1a100a" stroke-width="14" fill="none"/></g>
  <path d="M30 -1120 L52 -1060" stroke="#e8b8a0" stroke-width="5" stroke-linecap="round" opacity=".7"/>` });
// you at thirty: long hair, beard, helmet pushed up, a scar through the right brow, cold eyes
const MAN30 = { ...SOLDIER, id: 'm3', customHat: corinthian({ up: 1 }), browW: .01, faceExtra: hardFace };
// you at eighteen: lean, short hair, no armour, red cloak
const YOUTH = { skin: 'olive', hair: 'short', hairColor: 'black', beard: 'stubble', top: 'vest', legs: 'none', eyeColor: '#2a1a10', browW: .01, id: 'yt', body: hopliteBody({ cuirass: 0, skirt: '#5a4a36', chiton: '#5a4a3a' }), faceExtra: hardFace };
// the trainer: grey beard, red cloak, no helmet
const TRAINER = { skin: 'olive', hair: 'short', hairColor: 'grey', beard: 'full', top: 'vest', legs: 'none', eyeColor: '#2a1a10', browW: .01, id: 'tr', body: hopliteBody({ cuirass: 0, skirt: '#6a2a1a', chiton: '#8a7458' }),
  faceExtra: ({ g, e }) => emoFace({ g, e, bw: 12, browCol: '#9a948c', eyes: { iris: '#4a4a3a', size: .9 } }) };
// the farm guard and the helot: rough wool tunics
const GUARD = { skin: 'medium', hair: 'short', hairColor: 'black', beard: 'full', top: 'vest', legs: 'none', eyeColor: '#2a1a10', browW: .01, id: 'gd',
  body: gladBody({ mode: 'tunic', tunic: '#6a5a3a' }), faceExtra: ({ g, e }) => emoFace({ g, e, bw: 12, browCol: '#1a120c', eyes: { iris: '#3a2a1a', size: .95 } }) };
const HELOT = { skin: 'medium', hair: 'short', hairColor: 'brown', beard: 'full', top: 'vest', legs: 'none', eyeColor: '#3a2a1e', browW: .01, id: 'hl',
  body: gladBody({ mode: 'tunic', tunic: '#7a6a4e' }), faceExtra: ({ g, e }) => emoFace({ g, e, bw: 9, browCol: '#2a1a10', eyes: { iris: '#4a3a2a', size: 1 } }) };
const PRIEST = { skin: 'olive', hair: 'bald', hairColor: 'grey', beard: 'full', top: 'robe', robe: '#e8dfcc', trim: '#8a1c14', eyeColor: '#2a1a10', browW: .01, id: 'pr',
  faceExtra: ({ g, e }) => emoFace({ g, e, bw: 10, browCol: '#8a847c', eyes: { iris: '#3a3a2a', size: .9 } }) };

// ---------- props ----------
function foxBody(x, y, s = 1, { snarl = 0, t = 0, look = 0 } = {}) {
  const jaw = 14 * snarl, tw = Math.sin(t * 9) * 4 * snarl;
  return `<g transform="translate(${F1(x)} ${F1(y)}) scale(${s})">
    <path d="M-150 30 C-220 10 -270 -40 -250 -90 C-230 -60 -200 -40 -150 -30 Z" fill="#c8662a" filter="url(#pcl)"/>
    <path d="M-268 -100 C-262 -80 -250 -70 -236 -66" stroke="#f4ece0" stroke-width="22" stroke-linecap="round" fill="none"/>
    <path d="M-160 20 C-170 -40 -110 -80 -20 -78 C40 -76 70 -50 74 -10 C76 30 40 50 -40 50 C-100 50 -150 46 -160 20 Z" fill="#d2702c" filter="url(#pcl)"/>
    <path d="M-120 30 C-80 44 -10 44 40 30" stroke="#f0e4d0" stroke-width="16" fill="none" opacity=".8"/>
    <path d="M-110 44 L-104 80 M-60 46 L-58 84 M10 44 L14 80" stroke="#3a1a0a" stroke-width="12" stroke-linecap="round"/>
    ${foxHead(70 + tw, -60, 1, { snarl, look })}</g>`;
}
function foxHead(x, y, s = 1, { snarl = 0, look = 0 } = {}) {
  const jaw = 16 * snarl;
  return `<g transform="translate(${F1(x)} ${F1(y)}) scale(${s})">
    <path d="M-40 -30 L-30 -96 L2 -44 Z M30 -40 L58 -100 L66 -30 Z" fill="#c8662a" filter="url(#pcsl)"/><path d="M-32 -40 L-27 -80 L-8 -46 Z M36 -44 L54 -84 L58 -40 Z" fill="#3a1a0a"/>
    <path d="M-50 -20 C-56 -60 -10 -70 30 -64 C70 -58 84 -30 80 0 L130 16 C134 26 128 34 118 34 L60 ${F1(40 + jaw)} C20 ${F1(60 + jaw)} -40 50 -50 -20 Z" fill="#d6742e" filter="url(#pcl)"/>
    <path d="M-30 20 C0 50 50 46 80 30 L118 34 C100 46 70 ${F1(52 + jaw)} 30 ${F1(58 + jaw)} C0 60 -24 44 -30 20 Z" fill="#f4ece0"/>
    <ellipse cx="128" cy="20" rx="10" ry="8" fill="#1a0c06"/>
    <path d="M${F1(10 + look)} -22 q12 -8 24 0 q-12 8 -24 0 Z" fill="#f2c14a"/><ellipse cx="${F1(22 + look)}" cy="-22" rx="3" ry="6" fill="#120806"/>
    ${snarl > .05 ? `<path d="M70 32 L118 34 L112 ${F1(40 + jaw * .6)} L66 ${F1(44 + jaw)} Z" fill="#5a0e0a"/><path d="M76 32 L80 ${F1(42 + jaw * .5)} L86 33 M96 33 L99 ${F1(42 + jaw * .5)} L104 34 M84 ${F1(44 + jaw)} L88 ${F1(36 + jaw * .4)} L92 ${F1(44 + jaw)}" stroke="#f4f0e6" stroke-width="3" fill="#f4f0e6"/>
      <path d="M86 6 Q100 2 112 10" stroke="#7a3a14" stroke-width="3" fill="none"/>` : ''}</g>`;
}
function knife(x, y, rot = 0, s = 1, { glint = 0 } = {}) {
  return `<g transform="translate(${F1(x)} ${F1(y)}) rotate(${F1(rot)}) scale(${s})">
    <path d="M-17 -20 L-19 -280 C-19 -322 0 -360 10 -374 C17 -330 19 -290 18 -20 Z" fill="url(#bladeG)" filter="url(#pcs)"/><path d="M-2 -40 L-2 -330" stroke="#ffffff" stroke-width="4" opacity=".5"/>
    <rect x="-34" y="-24" width="68" height="16" rx="6" fill="#5a3a1e"/><rect x="-11" y="-10" width="22" height="110" rx="8" fill="#3a2414" filter="url(#pcs)"/>
    ${glint ? `<g opacity="${glint.toFixed(2)}"><path d="M2 -330 l0 -60 l6 60 l60 6 l-60 6 l-6 60 l-6 -60 l-60 -6 Z" fill="#fff" transform="translate(0 0) scale(.9)"/></g>` : ''}</g>`;
}
function razor(x, y, rot = 0, s = 1) {
  return `<g transform="translate(${F1(x)} ${F1(y)}) rotate(${F1(rot)}) scale(${s})">
    <path d="M-80 -18 C-60 -40 40 -40 80 -20 L84 10 C40 0 -40 0 -80 14 Z" fill="url(#bronzeG)" filter="url(#pcl)"/>
    <path d="M-80 14 C-40 0 40 0 84 10" stroke="#fff6d8" stroke-width="3" opacity=".8"/>
    <rect x="76" y="-24" width="70" height="26" rx="10" fill="#4a2e18" filter="url(#pcs)"/></g>`;
}
function whip(x0, y0, x1, y1, bend = 0, { col = '#3a2412' } = {}) {
  const mxp = (x0 + x1) / 2 + bend, myp = (y0 + y1) / 2 - Math.abs(bend) * .6;
  return `<path d="M${F1(x0)} ${F1(y0)} Q${F1(mxp)} ${F1(myp)} ${F1(x1)} ${F1(y1)}" stroke="${col}" stroke-width="9" fill="none" stroke-linecap="round"/>
    <path d="M${F1(x0)} ${F1(y0)} Q${F1(mxp)} ${F1(myp)} ${F1(x1)} ${F1(y1)}" stroke="#7a5a3a" stroke-width="3" fill="none" opacity=".5"/>`;
}
function torch(x, y, t, { s = 1, seed = 1, glow = 1, rot = 0 } = {}) {
  const f = flick(t, seed);
  return `<g transform="translate(${F1(x)} ${F1(y)}) rotate(${F1(rot)}) scale(${s})">
    <circle cx="0" cy="-60" r="${F1(520 * glow)}" fill="url(#fireGlow)" opacity="${(.6 * f * glow).toFixed(2)}" style="mix-blend-mode:screen"/>
    <rect x="-12" y="-10" width="24" height="260" rx="8" fill="#3a2414"/><path d="M-22 -16 L22 -16 L16 10 L-16 10 Z" fill="#2a1a10"/>
    ${fire(0, -12, 64, 170, t, { seed, n: 6, intensity: 1 + .15 * f, glow: 0 })}</g>`;
}
