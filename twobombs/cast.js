// "The Lullaby" — cast. Built on the engine's person() head; every body is drawn as whole garments (no loose stuck-on
// pieces): upper arms + sleeves go BEHIND the garment's shoulder seam, forearms + hands in front, so joints never show.
// Local coordinates as person(): head centre ~(0,-1075), neck -1004..-950, standing feet at y = 0.

SKIN_TONES.fair = { hi: '#f4dcca', mid: '#e2bfa6', lo: '#b98f78', ear: '#d9ae96', earDk: '#c49a82', neck: '#d2ab92', shade: '#a77c68', deep: '#946a58',
  blush: '#e39a88', nostril: '#6a3e30', line: '#9a6a58', lip: '#c98a7a', mouth: '#7a4438', rim: '#7a4a3a' };
const SKF = SKIN_TONES.fair, SKL2 = SKIN_TONES.light;

// ---------- hands: one silhouette each (palm + fingers + thumb share one filter), wrist at (0,0), fingers toward +y ----------
// thumb toward +x for k = -1 (mirrored for k = +1), the same convention as the engine's posed arms
const fingerCaps = (spec) => spec.map(([bx, by, L, w, a]) => { const r = a * Math.PI / 180; return capsuleD(bx, by, w / 2 + .3, bx - Math.sin(r) * L, by + Math.cos(r) * L, w / 2 - .7); }).join(' ');
// back of the hand, fingers together (pressing, covering a mouth, resting on a forehead / quilt). curl bends the tips under
function handBack(k, x, y, s, rot, { S, sk, spread = 0, curl = 0 }) {
  const c = curl * 7;
  const F = [[-15.5, 38, 27 - c, 8.6, -6 * spread], [-5.6, 40, 37 - c, 9.6, -2 * spread], [4.4, 40, 40 - c, 9.9, 2 * spread], [13.8, 38, 35 - c, 9.5, 6 * spread]];
  return `<g transform="translate(${F1(x)} ${F1(y)}) rotate(${F1(rot)}) scale(${F1(-k * s)} ${F1(s)})">
    <g filter="url(#pks_${sk})" fill="${S.mid}"><path d="M-15 -3 C-19 10 -21 26 -20.5 41 L19 42 C20 28 18 12 15 -3 Z"/><path d="${fingerCaps(F)}"/><path d="${capsuleD(13, 6, 7.2, 27, 30, 5.4)}"/></g>
    <g stroke="${S.shade}" stroke-width="1.5" fill="none" opacity=".5" stroke-linecap="round">${F.slice(0, 3).map(([bx, by, L, w], i) => `<path d="M${F1(bx + w / 2 + .3)} ${by + 7} L${F1(bx + w / 2 + .3)} ${F1(by + L - 3)}"/>`).join('')}</g>
    <g fill="${S.hi}" opacity=".42">${F.map(([bx, by, L, w]) => `<ellipse cx="${bx}" cy="${by + 2}" rx="${F1(w * .32)}" ry="2.4"/>`).join('')}</g>
    <path d="M-10 6 C-6 18 0 26 9 30" stroke="${S.shade}" stroke-width="1.4" fill="none" opacity=".35"/></g>`;
}
// open palm toward us, fingers up and a little apart (pleading / "stop" / reaching)
function handPalm(k, x, y, s, rot, { S, sk, spread = 1 }) {
  const F = [[-14.5, 36, 26, 8.4, -9 * spread], [-5, 38, 35, 9.4, -3 * spread], [4.6, 38, 38, 9.7, 3 * spread], [13.5, 36, 33, 9.2, 9 * spread]];
  return `<g transform="translate(${F1(x)} ${F1(y)}) rotate(${F1(rot)}) scale(${F1(-k * s)} ${F1(s)})">
    <g filter="url(#pks_${sk})" fill="${S.mid}"><path d="M-15 -3 C-19 10 -20 25 -19 38 L18 39 C19 26 18 11 15 -3 Z"/><path d="${fingerCaps(F)}"/><path d="${capsuleD(12, 10, 7.4, 30, 24, 5.4)}"/></g>
    <path d="M-12 22 Q0 30 14 20 M-10 32 Q2 37 12 31" stroke="${S.shade}" stroke-width="1.5" fill="none" opacity=".45"/>
    <ellipse cx="2" cy="20" rx="10" ry="8" fill="${S.hi}" opacity=".3"/></g>`;
}
// a loose fist / hand closed around something (a rail, a blanket edge)
function handGrip(k, x, y, s, rot, { S, sk }) {
  return `<g transform="translate(${F1(x)} ${F1(y)}) rotate(${F1(rot)}) scale(${F1(-k * s)} ${F1(s)})">
    <g filter="url(#pks_${sk})" fill="${S.mid}"><path d="M-15 -3 C-20 8 -21 24 -19 34 C-17 44 -8 48 2 47 C12 46 18 40 19 30 C20 18 18 8 15 -3 Z"/><path d="${capsuleD(13, 8, 7.2, 20, 32, 5.6)}"/></g>
    <path d="M-15 34 Q-7 41 0 41 Q8 41 15 34" stroke="${S.shade}" stroke-width="1.8" fill="none" opacity=".55"/>
    <path d="M-8 37 L-8 44 M0 38 L0 46 M8 37 L8 44" stroke="${S.shade}" stroke-width="1.4" opacity=".45"/>
    <g fill="${S.hi}" opacity=".4"><ellipse cx="-9" cy="33" rx="3.4" ry="2.2"/><ellipse cx="-1" cy="34" rx="3.4" ry="2.2"/><ellipse cx="7" cy="33" rx="3.4" ry="2.2"/></g></g>`;
}
Object.assign(HANDS, { back: handBack, palm: handPalm, grip: handGrip });

// arm targets for this cast (shoulder anchors and bone lengths match the bodies below)
const eArm = (k, T, hand = 'back', o = {}) => ({ ...autoIK(k, [k * 120, -926], T, 160, 150, o.bend), hand, ...o });
const uArm = (k, T, hand = 'relaxed', o = {}) => ({ ...autoIK(k, [k * 142, -930], T, 170, 160, o.bend), hand, ...o });
// arms hanging loose at the sides: the elbow bends a little outward (bend = -k), never forward of the chest.
// dx / dy nudge the wrist (positive dx = further out)
const uHang = (k, dx = 0, dy = 0, o = {}) => uArm(k, [k * (158 + dx), -604 + dy], 'back', { bend: -k, curl: .3, ...o });
const eHang = (k, dx = 0, dy = 0, o = {}) => eArm(k, [k * (138 + dx), -622 + dy], 'back', { bend: -k, curl: .25, ...o });

// ---------- arms in two layers: the upper arm (with its sleeve) goes under the garment's shoulder; forearm + hand on top ----
// A = { el, wr, hand, hrot, hs, curl, spread } from kArm / hArm / pArm. sleeve covers the whole arm when long = true,
// or stops at the elbow with a rolled cuff (rolled = true).
function armLayers(k, sh, A, { r1, r2, r3, S, sk, sleeve, long = true, rolled = false, cuff = null, hs = 1.35 }) {
  const { el, wr } = A, ang = Math.atan2(wr[1] - el[1], wr[0] - el[0]) * 180 / Math.PI - 90;
  const H = A.hand && A.hand !== 'none' ? HANDS[A.hand] : null;
  const upper = `<g filter="url(#pcl)" fill="${sleeve}"><path d="${capsuleD(sh[0], sh[1], r1 + 3, el[0], el[1], r2 + 4)}"/></g>`;
  let lower;
  if (long) {
    const f = .9, m = [lerp(el[0], wr[0], f), lerp(el[1], wr[1], f)], a2 = Math.atan2(wr[1] - el[1], wr[0] - el[0]);
    lower = `<g filter="url(#pk_${sk})" fill="${S.mid}"><path d="${capsuleD(m[0], m[1], r3 + 2, wr[0], wr[1], r3)}"/></g>
      <g filter="url(#pcl)" fill="${sleeve}"><path d="${capsuleD(el[0], el[1], r2 + 4, m[0], m[1], r3 + 7)}"/></g>
      ${cuff ? `<path d="M${F1(m[0] - Math.sin(a2) * (r3 + 8))} ${F1(m[1] + Math.cos(a2) * (r3 + 8))} L${F1(m[0] + Math.sin(a2) * (r3 + 8))} ${F1(m[1] - Math.cos(a2) * (r3 + 8))}" stroke="${cuff}" stroke-width="6" stroke-linecap="round" opacity=".8"/>` : ''}`;
  } else {
    lower = `<g filter="url(#pk_${sk})" fill="${S.mid}"><path d="${capsuleD(el[0], el[1], r2, wr[0], wr[1], r3)}"/></g>
      <path d="${capsuleD(lerp(el[0], wr[0], .1) - k * r2 * .25, lerp(el[1], wr[1], .1), r2 * .2, lerp(el[0], wr[0], .8) - k * r3 * .25, lerp(el[1], wr[1], .8), r3 * .15)}" fill="${S.hi}" opacity=".28" filter="url(#softW2)"/>
      ${rolled ? `<g filter="url(#pcsl)" fill="${sleeve}"><path d="${capsuleD(lerp(el[0], sh[0], .2), lerp(el[1], sh[1], .2), r2 + 6, lerp(el[0], wr[0], .08), lerp(el[1], wr[1], .08), r2 + 5)}"/></g>
        <path d="M${F1(el[0] - r2 - 6)} ${F1(el[1] - 4)} Q${F1(el[0])} ${F1(el[1] + 6)} ${F1(el[0] + r2 + 6)} ${F1(el[1] - 4)}" stroke="${darken(sleeve, .35)}" stroke-width="2.5" fill="none" opacity=".6"/>` : ''}`;
  }
  const hand = H ? H(k, wr[0], wr[1] - 3, A.hs ?? hs, ang + (A.hrot || 0), { S, sk, curl: A.curl || 0, spread: A.spread ?? (A.hand === 'palm' ? 1 : 0) }) : '';
  return { upper, lower: lower + hand };
}

// a tapered neck with the jaw's shadow on it (replaces the engine's rectangle)
const softNeck = (S, sk, w = 40, y1 = -952) => `<path d="M${-w} -1010 C${-w + 2} -990 ${-w - 4} -970 ${-w - 10} ${y1} L${w + 10} ${y1} C${w + 4} -970 ${w - 2} -990 ${w} -1010 Z" fill="${S.neck}" filter="url(#pks_${sk})"/>
  <path d="M${-w + 4} -1004 C-10 -986 10 -986 ${w - 4} -1004 L${w - 2} -990 C10 -974 -10 -974 ${-w + 2} -990 Z" fill="${S.deep}" opacity=".35" filter="url(#softW2)"/>`;
// a band of cloth around a limb segment with straight (cut) ends — cuffs, rolled sleeves, a shawl's edge. p = centre,
// d = unit direction along the limb, w = half width, len = band length
const band = (p, d, w, len, bulge = 3) => { const n = [-d[1], d[0]], a = [p[0] - d[0] * len / 2, p[1] - d[1] * len / 2], b = [p[0] + d[0] * len / 2, p[1] + d[1] * len / 2];
  const P = (q, s) => [q[0] + n[0] * w * s, q[1] + n[1] * w * s];
  const [a1, a2, b1, b2] = [P(a, 1), P(a, -1), P(b, 1), P(b, -1)];
  return `M${F1(a1[0])} ${F1(a1[1])} Q${F1(a[0] + d[0] * bulge)} ${F1(a[1] + d[1] * bulge)} ${F1(a2[0])} ${F1(a2[1])} L${F1(b2[0])} ${F1(b2[1])} Q${F1(b[0] + d[0] * bulge)} ${F1(b[1] + d[1] * bulge)} ${F1(b1[0])} ${F1(b1[1])} Z`; };
const unit = (a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1; return [dx / L, dy / L]; };
// the forearm part of an arm (sleeve or skin + hand), drawn in front of the garment; A from eArm / uArm.
// long: a full sleeve to the wrist (ruffled cuff band); else bare forearm with a rolled-sleeve band at the elbow
function forearm(k, A, { r2, r3, S, sk, sleeve, long = true, hs = 1.6, rolled = false }) {
  const { el, wr } = A, d = unit(el, wr), ang = Math.atan2(d[1], d[0]) * 180 / Math.PI - 90, L = Math.hypot(wr[0] - el[0], wr[1] - el[1]);
  const H = A.hand && A.hand !== 'none' ? HANDS[A.hand] : null;
  const hand = H ? H(k, wr[0], wr[1] - 3, A.hs ?? hs, ang + (A.hrot || 0), { S, sk, curl: A.curl || 0, spread: A.spread ?? (A.hand === 'palm' ? 1 : 0) }) : '';
  if (long) { const m = [wr[0] - d[0] * 16, wr[1] - d[1] * 16];
    return `<g filter="url(#pk_${sk})" fill="${S.mid}"><path d="${capsuleD(m[0], m[1], r3 + 1, wr[0], wr[1], r3)}"/></g>
      <g filter="url(#pcl)" fill="${sleeve}"><path d="${capsuleD(el[0], el[1], r2 + 5, m[0] - d[0] * 6, m[1] - d[1] * 6, r3 + 6)}"/><path d="${band([m[0] - d[0] * 4, m[1] - d[1] * 4], d, r3 + 8, 16, 4)}"/></g>
      <path d="${band([m[0] - d[0] * 4, m[1] - d[1] * 4], d, r3 + 8, 16, 4)}" fill="none" stroke="${darken(sleeve, .3)}" stroke-width="1.6" opacity=".5"/>${hand}`; }
  return `<g filter="url(#pk_${sk})" fill="${S.mid}"><path d="${capsuleD(el[0], el[1], r2, wr[0], wr[1], r3)}"/></g>
    <path d="${capsuleD(lerp(el[0], wr[0], .14) - k * r2 * .25, lerp(el[1], wr[1], .14), r2 * .2, lerp(el[0], wr[0], .8) - k * r3 * .25, lerp(el[1], wr[1], .8), r3 * .15)}" fill="${S.hi}" opacity=".25" filter="url(#softW2)"/>
    ${rolled ? `<g filter="url(#pcl)" fill="${sleeve}"><path d="${band([el[0] + d[0] * 8, el[1] + d[1] * 8], d, r2 + 8, 34, 5)}"/></g>
      <path d="M${F1(el[0] + d[0] * 2 - d[1] * (r2 + 7))} ${F1(el[1] + d[1] * 2 + d[0] * (r2 + 7))} L${F1(el[0] + d[0] * 2 + d[1] * (r2 + 7))} ${F1(el[1] + d[1] * 2 - d[0] * (r2 + 7))}" stroke="${darken(sleeve, .32)}" stroke-width="2.4" opacity=".6"/>` : ''}${hand}`;
}

// ---------- Elsbeth: linen night-coif, cream nightgown, a dark wool shawl over her shoulders ----------
// the hair under the coif (behind the face — fills the coif's opening so no background shows), drawn via o.ears
const elsHairBack = ({ S, sk, turn = 0 }) => `<path d="M-90 -1010 C-100 -1070 -100 -1140 -84 -1180 C-66 -1220 -34 -1236 0 -1236 C34 -1236 66 -1220 84 -1180 C100 -1140 100 -1070 90 -1010 Z" fill="#4a2618" filter="url(#pcl)"/>
  <ellipse cx="${F1(-73 - turn * 4)}" cy="-1075" rx="${F1(11 * (1 - .85 * Math.max(0, -turn)))}" ry="20" fill="${S.ear}" filter="url(#pks_${sk})"/><ellipse cx="${F1(73 - turn * 4)}" cy="-1075" rx="${F1(11 * (1 - .85 * Math.max(0, turn)))}" ry="20" fill="${S.earDk}" filter="url(#pks_${sk})"/>`;
// the coif: one U-shaped band of linen framing the face, the hair showing in a soft parted band under its edge
function coif({ col = '#cdc4b0' } = {}) {
  return ({ g }) => `<defs>${linG(g('cf'), [lighten(col, .16), col, darken(col, .3)], { user: [-110, 0, 110, 0] })}</defs>
    <path d="M-76 -1118 C-70 -1160 -40 -1182 0 -1180 C40 -1182 70 -1160 76 -1118 C66 -1140 46 -1156 22 -1158 C12 -1150 4 -1146 0 -1140 C-4 -1146 -12 -1150 -22 -1158 C-46 -1156 -66 -1140 -76 -1118 Z" fill="#5a2c1a" filter="url(#pcs)"/>
    <path d="M-60 -1150 C-40 -1166 -18 -1166 -4 -1150 M60 -1150 C40 -1166 18 -1166 4 -1150" stroke="#7a3e26" stroke-width="3" fill="none" opacity=".7"/>
    <path d="M-86 -1006 C-100 -1050 -106 -1112 -98 -1160 C-88 -1212 -50 -1242 0 -1244 C50 -1242 88 -1212 98 -1160 C106 -1112 100 -1050 86 -1006
      C82 -1012 78 -1022 76 -1034 C80 -1068 82 -1104 78 -1132 C72 -1164 42 -1186 0 -1188 C-42 -1186 -72 -1164 -78 -1132 C-82 -1104 -80 -1068 -76 -1034 C-78 -1022 -82 -1012 -86 -1006 Z"
      fill="url(#${g('cf')})" filter="url(#pcl)"/>
    <path d="M-90 -1150 C-80 -1198 -40 -1224 0 -1226 M-78 -1132 C-72 -1166 -42 -1186 0 -1188 C42 -1186 72 -1166 78 -1132" stroke="${darken(col, .3)}" stroke-width="3" fill="none" opacity=".5"/>
    <path d="M-58 -1214 C-30 -1234 30 -1234 58 -1214" stroke="${lighten(col, .35)}" stroke-width="6" fill="none" opacity=".45" filter="url(#softW2)"/>`;
}
// face extras: tired eyes, hollow cheeks; e.fever (flush, sweat), e.pale (the blood drains: white-faced)
const elsFace = ({ g, e }) => {
  const fev = e.fever || 0, pale = e.pale || 0;
  return `<g clip-path="url(#${g('face')})"><g filter="url(#softW)">
      <ellipse cx="-28" cy="-1066" rx="20" ry="7" fill="#6a4a5a" opacity="${(.3 + .2 * fev).toFixed(2)}"/><ellipse cx="28" cy="-1066" rx="20" ry="7" fill="#6a4a5a" opacity="${(.3 + .2 * fev).toFixed(2)}"/>
      <ellipse cx="-52" cy="-1028" rx="13" ry="26" fill="#8a6a6a" opacity=".2"/><ellipse cx="52" cy="-1028" rx="13" ry="26" fill="#8a6a6a" opacity=".24"/>
      ${fev ? `<ellipse cx="-40" cy="-1046" rx="22" ry="13" fill="#d8604c" opacity="${(.42 * fev).toFixed(2)}"/><ellipse cx="40" cy="-1046" rx="22" ry="13" fill="#d8604c" opacity="${(.42 * fev).toFixed(2)}"/><ellipse cx="0" cy="-1046" rx="10" ry="8" fill="#d8604c" opacity="${(.3 * fev).toFixed(2)}"/>` : ''}
    </g>
    ${pale > .01 ? `<path d="${FACE}" fill="#e7ecf0" opacity="${(.55 * pale).toFixed(2)}"/>` : ''}
    ${fev ? [[-58, -1120], [52, -1130], [-30, -1150], [60, -1080]].map(([x, y], i) => `<ellipse cx="${x}" cy="${F1(y + (((e.t || 0) * 9 + i * 11) % 26))}" rx="3" ry="4.2" fill="#fff" opacity="${(.5 * fev).toFixed(2)}"/>`).join('') : ''}</g>
    ${e.cracked ? `<path d="M-8 -1003 l2 4 M4 -1004 l-1 4 M12 -1006 l1 3" stroke="#8a4a40" stroke-width="1.2" opacity=".6"/>` : ''}
    ${emoFace({ g, e: { blush: .15 * (1 - pale), tear: (e.tear || 0) + .35 * fev, ...e }, bw: 6, browCol: '#4a2418', eyes: { iris: '#5a6a56', size: 1.0, lash: '#1a0e08' } })}`;
};
// the shawl over the shoulders and upper arms + the gown; garment parts share ONE filter group each, so they read as
// one solid shape (no joints). pose: 'sit' (on the stool), 'stand', 'bust' (in bed, chest up)
function elsGown({ pose = 'sit', col = '#d9d0bf', shawl = '#3d3431' } = {}) {
  return ({ g, S, sk, e }) => {
    const id = g('gw'), shd = darken(col, .32), sh = darken(shawl, .4), hi = lighten(shawl, .2);
    const L = e.armL || eHang(-1), R = e.armR || eHang(1);
    const shL = [-112, -918], shR = [112, -918];
    // the shawl over an upper arm: shoulder → a little past the elbow, ending in a straight knitted edge
    const drape = (s0, A, k) => { const d = unit(s0, A.el), e2 = [A.el[0] + d[0] * 14, A.el[1] + d[1] * 14], n = [-d[1], d[0]];
      const P = (q, w) => [F1(q[0] + n[0] * w), F1(q[1] + n[1] * w)];
      return `M${P(s0, 34).join(' ')} L${P(e2, 31).join(' ')} Q${F1(e2[0] + d[0] * 6)} ${F1(e2[1] + d[1] * 6)} ${P(e2, -31).join(' ')} L${P(s0, -34).join(' ')} Z`; };
    const gown = `M-44 -968 C-78 -962 -110 -950 -124 -930 C-134 -886 -132 -810 -128 -740 C-124 -700 -126 -672 -130 -650 L130 -650 C126 -672 124 -700 128 -740 C132 -810 134 -886 124 -930 C110 -950 78 -962 44 -968 Q0 -954 -44 -968 Z`;
    const shawlBody = `M-40 -972 C-84 -968 -118 -956 -136 -930 C-150 -900 -150 -860 -140 -820 L-104 -780 C-84 -760 -60 -730 -46 -690 L-10 -690 C-20 -760 -26 -840 -24 -930 C-12 -940 12 -940 24 -930 C26 -840 20 -760 10 -690 L46 -690 C60 -730 84 -760 104 -780 L140 -820 C150 -860 150 -900 136 -930 C118 -956 84 -968 40 -972 Q0 -986 -40 -972 Z`;
    const knit = `<g stroke="${sh}" stroke-width="3" fill="none" opacity=".3">${[-118, -96, -74, 74, 96, 118].map(x => `<path d="M${x} -940 C${x - 2} -890 ${x - 4} -840 ${x * .6} -760"/>`).join('')}</g>
      <path d="M-40 -972 Q0 -986 40 -972" stroke="${hi}" stroke-width="5" fill="none" opacity=".45"/>
      <g stroke="${shawl}" stroke-width="5" stroke-linecap="round">${[-44, -34, -24, -14, 14, 24, 34, 44].map(x => `<path d="M${x} -692 l${x < 0 ? -2 : 2} 22"/>`).join('')}</g>`;
    const fa = (k, A) => forearm(k, A, { r2: 19, r3: 15, S, sk, sleeve: col, long: true, hs: 1.35 });
    const defs = `<defs>${linG(id, [lighten(col, .12), col, darken(col, .18)], { user: [-160, 0, 160, 0] })}${linG(id + 's', [hi, shawl, sh], { user: [-150, 0, 150, 0] })}</defs>`;
    const faBack = (L.front ? '' : fa(-1, L)) + (R.front ? '' : fa(1, R)), faFront = (L.front ? fa(-1, L) : '') + (R.front ? fa(1, R) : '');
    const top = `${softNeck(S, sk, 37, -950)}<path d="${gown}" fill="url(#${id})" filter="url(#pcl)"/>${faBack}
      <path d="M-44 -966 Q0 -952 44 -966" stroke="${shd}" stroke-width="3" fill="none" opacity=".7"/>
      <path d="${Array.from({ length: 9 }, (_, i) => `M${-38 + i * 9.5} -960 l2 13`).join(' ')}" stroke="${shd}" stroke-width="1.6" opacity=".4"/>
      <g filter="url(#pcl)" fill="url(#${id}s)"><path d="${shawlBody}"/><path d="${drape(shL, L, -1)}"/><path d="${drape(shR, R, 1)}"/></g>${knit}`;
    // a forearm in front of the body (A.front) is drawn over the shawl; its top is then covered again by the shawl's edge
    // (clipped around the elbow, same fill, no extra shadow — so no seam shows)
    const elbowCover = [[-1, L, shL], [1, R, shR]].filter(([, A]) => A.front).map(([k, A, s0]) => `<clipPath id="${id}c${k + 1}"><circle cx="${F1(A.el[0])}" cy="${F1(A.el[1])}" r="60"/></clipPath>
      <g clip-path="url(#${id}c${k + 1})"><g filter="url(#pc)" fill="url(#${id}s)"><path d="${drape(s0, A, k)}"/></g></g>`).join('');
    if (pose === 'bust') return `${defs}${top}${faFront}${elbowCover}`;
    const lower = pose === 'sit' ? `
      <path d="M-140 -600 C-140 -480 -132 -360 -124 -262 C-84 -252 -40 -256 0 -254 C40 -256 84 -252 124 -262 C132 -360 140 -480 140 -600 Z" fill="url(#${id})" filter="url(#pcl)"/>
      <g filter="url(#softW)" opacity=".42"><path d="M-96 -540 C-98 -450 -96 -360 -92 -280 M-20 -540 C-22 -450 -20 -350 -18 -272 M44 -540 C48 -450 50 -360 52 -278 M104 -540 C108 -450 108 -360 104 -286" stroke="${shd}" stroke-width="10" fill="none"/></g>
      ${[-1, 1].map(k => `<path d="${mx(k, 'M -92 -262 C -106 -252 -108 -238 -96 -234 L -42 -234 C -34 -242 -38 -256 -48 -262 Z')}" fill="${S.mid}" filter="url(#pks_${sk})"/>`).join('')}
      <path d="M-134 -660 C-154 -640 -164 -606 -156 -572 C-142 -546 -104 -538 -60 -546 C-30 -552 -10 -558 0 -558 C10 -558 30 -552 60 -546 C104 -538 142 -546 156 -572 C164 -606 154 -640 134 -660 Z" fill="url(#${id})" filter="url(#pcl)"/>
      <path d="M-116 -590 C-86 -572 -40 -572 -12 -578 M116 -590 C86 -572 40 -572 12 -578" stroke="${shd}" stroke-width="3" fill="none" opacity=".45"/>`
      : `<path d="M-130 -660 C-144 -500 -158 -300 -170 -20 C-100 -6 -40 -10 0 -8 C40 -10 100 -6 170 -20 C158 -300 144 -500 130 -660 Z" fill="url(#${id})" filter="url(#pcl)"/>
      <g filter="url(#softW)" opacity=".4"><path d="M-90 -600 C-100 -420 -110 -240 -118 -40 M10 -600 C12 -420 14 -240 16 -40 M96 -600 C104 -420 112 -240 120 -44" stroke="${shd}" stroke-width="11" fill="none"/></g>`;
    return `${defs}${lower}${top}${faFront}${elbowCover}`;
  };
}
const ELS_LOOK = { skin: 'fair', hair: 'bald', hairColor: 'red', beard: 'none', hat: 'coif', customHat: coif(), ears: elsHairBack, eyeColor: '#4a5a48', browW: .01, faceExtra: elsFace };
const ELS = { ...ELS_LOOK, id: 'el', body: elsGown({ pose: 'sit' }) };
const ELS_STAND = { ...ELS_LOOK, id: 'es', body: elsGown({ pose: 'stand' }) };
const ELS_BUST = { ...ELS_LOOK, id: 'eb', body: elsGown({ pose: 'bust' }) };

// ---------- the husband: linen shirt (sleeves rolled), dark wool jerkin, breeches, boots ----------
const husFace = ({ g, e }) => `<g clip-path="url(#${g('face')})"><g filter="url(#softW)"><ellipse cx="-30" cy="-1068" rx="18" ry="6" fill="#6a4a40" opacity=".22"/><ellipse cx="30" cy="-1068" rx="18" ry="6" fill="#6a4a40" opacity=".22"/></g>
  ${e.pale ? `<path d="${FACE}" fill="#e6ebef" opacity="${(.45 * e.pale).toFixed(2)}"/>` : ''}</g>
  ${emoFace({ g, e: { blush: .25, ...e }, bw: 10, browCol: '#3a2214', eyes: { iris: '#4a3a28', size: .96 } })}`;
function husBody({ pose = 'stand', shirt = '#cbbd9e', vest = '#3b2b1f', breeches = '#2f2924', boot = '#24170f' } = {}) {
  return ({ g, S, sk, e }) => {
    const id = g('hb');
    const L = e.armL || uHang(-1), R = e.armR || uHang(1);
    const up = (A, k) => capsuleD(k * 138, -928, 33, lerp(k * 138, A.el[0], .96), lerp(-928, A.el[1], .96), 28);
    const fa = (k, A) => forearm(k, A, { r2: 26, r3: 21, S, sk, sleeve: shirt, long: false, rolled: true, hs: 1.7 });
    const shirtBody = `M-58 -996 C-110 -988 -146 -972 -158 -944 C-166 -880 -160 -760 -152 -650 L152 -650 C160 -760 166 -880 158 -944 C146 -972 110 -988 58 -996 Z`;
    const torso = `<g filter="url(#pcl)" fill="url(#${id}s)"><path d="${shirtBody}"/><path d="${up(L, -1)}"/><path d="${up(R, 1)}"/></g>
      <path d="M-40 -990 L0 -928 L40 -990 Z" fill="${S.neck}" filter="url(#pks_${sk})"/><path d="M-30 -980 L0 -936 L30 -980" stroke="${S.shade}" stroke-width="3" fill="none" opacity=".4"/>
      <path d="M-10 -968 L10 -962 M-12 -952 L12 -946" stroke="#6a5a40" stroke-width="2" opacity=".7"/>
      <g filter="url(#pcl)" fill="url(#${id}v)"><path d="M-62 -994 C-102 -986 -128 -972 -136 -946 C-140 -880 -136 -760 -128 -650 L-40 -650 C-44 -760 -40 -860 -30 -930 Z"/>
        <path d="M62 -994 C102 -986 128 -972 136 -946 C140 -880 136 -760 128 -650 L40 -650 C44 -760 40 -860 30 -930 Z"/></g>
      <g filter="url(#softW)" opacity=".4"><path d="M-108 -930 C-112 -840 -110 -740 -104 -660 M100 -930 C104 -840 102 -740 98 -660" stroke="${darken(vest, .5)}" stroke-width="10" fill="none"/></g>
      ${[-880, -810, -740].map(y => `<circle cx="-40" cy="${y}" r="5" fill="${darken(vest, .5)}"/><path d="M-40 ${y} L40 ${y - 2}" stroke="#2a1c12" stroke-width="2.2" opacity=".5"/>`).join('')}
      <path d="M-154 -660 Q0 -640 154 -660 L152 -630 Q0 -612 -152 -630 Z" fill="#2a1a10" filter="url(#pcsl)"/><rect x="-14" y="-658" width="28" height="22" rx="3" fill="none" stroke="#8a7a52" stroke-width="3"/>`;
    const legs = pose === 'sit' ? `
      ${[-1, 1].map(k => `<path d="${mx(k, 'M -146 -560 C -148 -470 -142 -380 -134 -300 L -40 -300 C -34 -380 -30 -470 -30 -560 Z')}" fill="url(#${id}b)" filter="url(#pc)"/>
        <path d="${mx(k, 'M -140 -330 C -144 -260 -140 -200 -134 -140 C -148 -126 -166 -110 -168 -92 L -36 -92 C -36 -150 -36 -250 -42 -330 Z')}" fill="${boot}" filter="url(#pcl)"/>`).join('')}
      <path d="M-156 -646 C-172 -620 -180 -590 -172 -560 C-156 -536 -116 -530 -78 -540 C-40 -546 -10 -552 0 -552 C10 -552 40 -546 78 -540 C116 -530 156 -536 172 -560 C180 -590 172 -620 156 -646 Z" fill="url(#${id}b)" filter="url(#pcl)"/>
      <path d="M-88 -556 C-58 -548 -30 -552 -8 -560 M88 -556 C58 -548 30 -552 8 -560" stroke="#120e0c" stroke-width="3" fill="none" opacity=".5"/>`
      : [-1, 1].map(k => `<g ${legTf(k, e, -630, 0)}><path d="${mx(k, 'M -150 -640 C -156 -520 -148 -400 -138 -300 L -46 -300 C -40 -400 -32 -520 -24 -640 Z')}" fill="url(#${id}b)" filter="url(#pc)"/>
        <path d="${mx(k, 'M -142 -330 C -146 -240 -140 -130 -132 -48 C -146 -34 -166 -18 -168 0 L -40 0 C -38 -60 -38 -200 -46 -330 Z')}" fill="${boot}" filter="url(#pcl)"/></g>`).join('');
    return `<defs>${linG(id + 's', [lighten(shirt, .16), shirt, darken(shirt, .22)], { user: [-170, 0, 170, 0] })}${linG(id + 'v', [lighten(vest, .2), vest, darken(vest, .35)], { user: [-150, 0, 150, 0] })}${linG(id + 'b', [lighten(breeches, .18), breeches, darken(breeches, .3)], { user: [-180, 0, 180, 0] })}</defs>
      ${legs}${softNeck(S, sk, 42, -960)}${torso}${fa(-1, L)}${fa(1, R)}`;
  };
}
const HUS_LOOK = { skin: 'light', hair: 'short', hairColor: 'brown', beard: 'full', eyeColor: '#4a3a28', browW: .01, faceExtra: husFace };
const HUS = { ...HUS_LOOK, id: 'hu', body: husBody({ pose: 'stand' }) };
const HUS_SIT = { ...HUS_LOOK, id: 'hs', body: husBody({ pose: 'sit' }) };

// ---------- the children: heads on the pillow (the quilt covers the rest). Hair is one solid mass, no gaps ----------
// back hair is drawn in body() (behind the head); the fringe in faceExtra (in front)
function kidHead({ hair = '#d4b072', braids = false } = {}) {
  const dk = darken(hair, .35), hi = lighten(hair, .3);
  const back = ({ S, sk }) => `<path d="M-92 -1076 C-100 -1150 -64 -1214 0 -1218 C64 -1214 100 -1150 92 -1076 C90 -1040 84 -1012 74 -992 L-74 -992 C-84 -1012 -90 -1040 -92 -1076 Z" fill="${hair}" filter="url(#pcl)"/>
    ${braids ? [-1, 1].map(k => `<g filter="url(#pcl)" fill="${hair}">${[0, 1, 2, 3, 4].map(i => `<ellipse cx="${k * (86 - i * 3)}" cy="${-1000 + i * 30}" rx="${16 - i}" ry="19"/>`).join('')}</g>
      ${[0, 1, 2, 3, 4].map(i => `<path d="M${k * (86 - i * 3) - 12} ${-1006 + i * 30} Q${k * (86 - i * 3)} ${-994 + i * 30} ${k * (86 - i * 3) + 12} ${-1006 + i * 30}" stroke="${dk}" stroke-width="2.4" fill="none" opacity=".7"/>`).join('')}
      <path d="M${k * 74} ${-1000 + 4 * 30 + 16} l${k * 6} 18 l${k * -10} 4 Z" fill="#a03a2a"/>`).join('') : ''}
    <path d="M-40 -1000 L40 -1000 L44 -950 Q0 -936 -44 -950 Z" fill="${S.neck}" filter="url(#pks_${sk})"/>
    <path d="M-70 -962 Q0 -930 70 -962 L76 -930 Q0 -905 -76 -930 Z" fill="#d6cbb4" filter="url(#pcsl)"/>`;
  const front = ({ g, e }) => `<path d="${braids
      ? 'M-82 -1096 C-88 -1166 -50 -1208 0 -1210 C50 -1208 88 -1166 82 -1096 C76 -1130 60 -1150 36 -1158 C22 -1154 10 -1150 2 -1144 C-8 -1152 -22 -1156 -36 -1158 C-60 -1150 -76 -1130 -82 -1096 Z'
      : 'M-84 -1092 C-92 -1166 -52 -1212 0 -1214 C54 -1212 92 -1166 84 -1092 C80 -1112 74 -1126 64 -1134 C62 -1118 56 -1110 48 -1106 C48 -1124 42 -1136 32 -1142 C26 -1124 16 -1116 6 -1114 C10 -1128 8 -1140 0 -1148 C-10 -1132 -22 -1122 -36 -1120 C-30 -1132 -30 -1142 -34 -1148 C-48 -1140 -58 -1126 -62 -1110 C-64 -1122 -66 -1130 -70 -1134 C-78 -1124 -82 -1110 -84 -1092 Z'}" fill="${hair}" filter="url(#pcl)"/>
    <path d="M-56 -1180 Q-36 -1166 -30 -1140 M-6 -1196 Q4 -1172 0 -1134 M40 -1186 Q50 -1166 48 -1146" stroke="${dk}" stroke-width="2.4" fill="none" opacity=".55"/>
    <path d="M-50 -1194 Q0 -1214 46 -1196" stroke="${hi}" stroke-width="7" fill="none" opacity=".45" filter="url(#softW2)"/>
    ${emoFace({ g, e: { blush: .55, ...e }, bw: 5, browCol: dk, eyes: { iris: '#5a6a7a', size: 1.0 } })}
    ${e.breathOpen ? `<ellipse cx="0" cy="-1006" rx="${F1(6 + 5 * e.breathOpen)}" ry="${F1(2 + 6 * e.breathOpen)}" fill="#4a1e18" opacity=".85"/>` : ''}`;
  return { back, front };
}
const GIRL_H = kidHead({ hair: '#d6b26e', braids: true }), BOY_H = kidHead({ hair: '#8a6240' });
const KID_GIRL = { skin: 'fair', hair: 'bald', beard: 'none', child: true, browW: .01, id: 'kg', body: GIRL_H.back, faceExtra: GIRL_H.front };
const KID_BOY = { skin: 'fair', hair: 'bald', beard: 'none', child: true, browW: .01, id: 'kb', body: BOY_H.back, faceExtra: BOY_H.front };
