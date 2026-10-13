// medieval.js — the cast for "The War of the Bucket" (Italy, 1325), built in the pipeline's own grammar:
// whole-garment bodies (upper sleeves tuck UNDER the surcoat so no joint shows, forearms + hands in front),
// face2 eyes / brows / mouth, soft-line folds, and hats that are part of the head group.
// Local coordinates as person(): head centre ≈ (0,-1075), neck -1004..-950, shoulders ≈ -930, waist ≈ -660, feet y = 0.

SKIN_TONES.ruddy = { hi: '#f2c8aa', mid: '#dca07e', lo: '#b06c50', ear: '#d08e70', earDk: '#b8785c', neck: '#c4866a', shade: '#9a5a44', deep: '#884a36',
  blush: '#e0705a', nostril: '#5a2a1e', line: '#8a4a36', lip: '#c06a5a', mouth: '#6a2a20', rim: '#7a3424' };
const handAng = A => Math.atan2(A.wr[1] - A.el[1], A.wr[0] - A.el[0]) * 180 / Math.PI - 90 + (A.hrot || 0);
const SKO = SKIN_TONES.olive, SKR = SKIN_TONES.ruddy;

addDefs(`
  <linearGradient id="steelH" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f1f4f8"/><stop offset=".3" stop-color="#b5bcc6"/><stop offset=".7" stop-color="#6c7480"/><stop offset="1" stop-color="#363b44"/></linearGradient>
  <linearGradient id="steelV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9edf2"/><stop offset=".5" stop-color="#97a0ac"/><stop offset="1" stop-color="#4a505a"/></linearGradient>
  <radialGradient id="gemG" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ff9a8a"/><stop offset=".45" stop-color="#c4182a"/><stop offset="1" stop-color="#5a0610"/></radialGradient>
  <linearGradient id="featherG" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#8e1a1c"/><stop offset=".55" stop-color="#d8402e"/><stop offset="1" stop-color="#f08a5a"/></linearGradient>
  <linearGradient id="leatherG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a5a34"/><stop offset=".5" stop-color="#5e3a1e"/><stop offset="1" stop-color="#3a2210"/></linearGradient>
`);

// ---------- hands: a fist closed around a bar (the bucket handle). Wrist at (0,0), fingers toward +y, thumb toward +x for k = -1 ----------
// seen from the back: the dorsum, a row of four knuckle ridges with the first finger joints, the fingers folded away from us,
// a thumb folded over the front. Each finger end is its own rounded piece so the knuckles read.
function handHold(k, x, y, s, rot, { S, sk }) {
  const fing = [[-13.4, 31, 17, 10], [-4.6, 32, 20, 10.4], [4.4, 32, 19, 10.2], [13.0, 31, 15, 9.4]];
  return `<g transform="translate(${F1(x)} ${F1(y)}) rotate(${F1(rot)}) scale(${F1(-k * s)} ${F1(s)})">
    <g filter="url(#pks_${sk})" fill="${S.mid}"><path d="M-16 -4 C-20 8 -22 22 -20 33 C-18 38 18 38 20 33 C22 22 20 8 16 -4 Z"/>
      ${fing.map(([fx, fy, L, w]) => `<path d="${capsuleD(fx, fy, w / 2, fx - .4, fy + L - w * .5, w / 2 - .5)}"/>`).join('')}</g>
    <g stroke="${S.shade}" stroke-width="1.6" fill="none" opacity=".6" stroke-linecap="round">${[-9, 0, 8.6].map((fx, i) => `<path d="M${fx} 38 L${fx} ${46 + (i === 1 ? 3 : 0)}"/>`).join('')}</g>
    <g fill="${S.hi}" opacity=".5">${fing.map(([fx, fy]) => `<ellipse cx="${fx}" cy="${fy + 1}" rx="3.8" ry="2.5"/>`).join('')}</g>
    <g filter="url(#pks_${sk})" fill="${S.mid}"><path d="${capsuleD(15.6, 3, 6.8, 19, 27, 5.6)}"/></g>
    <path d="M13.5 8 C16 15 17.6 21 18 26" stroke="${S.shade}" stroke-width="1.5" fill="none" opacity=".55"/>
    <ellipse cx="19" cy="27" rx="3.2" ry="2.2" fill="#f4dccb" opacity=".5"/>
    <path d="M-12 2 C-16 14 -16 24 -14 32" stroke="${S.hi}" stroke-width="3.4" fill="none" opacity=".35" stroke-linecap="round"/></g>`;
}
Object.assign(HANDS, { hold: handHold });

// ---------- arms: shoulders ±140, bones 165 / 155 (a lean man) or ±156, 175 / 165 (the broad guard) ----------
const tArm = (k, T, hand = 'back', o = {}) => ({ ...autoIK(k, [k * 140, -930], T, 165, 155, o.bend), hand, ...o });
const tHang = (k, dx = 0, dy = 0, o = {}) => tArm(k, [k * (166 + dx), -626 + dy], 'back', { bend: -k, curl: .3, ...o });
const gArm = (k, T, hand = 'back', o = {}) => ({ ...autoIK(k, [k * 156, -930], T, 175, 165, o.bend), hand, ...o });
const gHang = (k, dx = 0, dy = 0, o = {}) => gArm(k, [k * (184 + dx), -608 + dy], 'back', { bend: -k, curl: .3, ...o });

// scalloped edge from (xl, y) to (xr, y): n rounded tongues of the given depth; returns the 'C…' segments (the path must already be at (xl, y))
const dagEdge = (xl, xr, y, depth, n, notch = 8, endY = null) => { let d = '';
  for (let i = 0; i < n; i++) { const xa = lerp(xl, xr, i / n), xb = lerp(xl, xr, (i + 1) / n), xm = (xa + xb) / 2, dx = xm - xa;
    d += ` C${F1(xa + dx * .12)} ${F1(y + depth * .55)} ${F1(xm - dx * .5)} ${F1(y + depth)} ${F1(xm)} ${F1(y + depth)} C${F1(xm + dx * .5)} ${F1(y + depth)} ${F1(xb - dx * .12)} ${F1(y + depth * .55)} ${F1(xb)} ${F1(i === n - 1 ? (endY ?? y) : y - notch + notch)}`; }
  return d; };

// ---------- the surcoat, undershirt sleeves, belt, hose and boots ----------
// opt: tunic (surcoat) / sleeve (undershirt sleeves) / trim / hose [left, right] / boot / belt, w = half-width scale, emblem 'cross' | null,
//      pouch, mail (chain-mail collar), arm = IK arm builders, rolled cuffs
function cotteBody({ tunic = '#2f7d4a', sleeve = '#e0a834', trim = '#e8c050', hose = ['#a8372f', '#c9962c'], boot = '#4a2f1c', belt = '#5a3a1e', w = 1, emblem = null, emblemCol = '#c9262b',
  pouch = true, mail = false, cape = null, armFn = tArm, hangFn = tHang, sh = 140, r1 = 31, r2 = 24, r3 = 19, hs = 1.55, lace = true, folds = 1 } = {}) {
  return ({ g, S, sk, e }) => {
    const id = g('cb'), td = darken(tunic, .5), tl = lighten(tunic, .3), sd = darken(sleeve, .45);
    const L = e.armL || hangFn(-1), R = e.armR || hangFn(1);
    const SX = sh * w;
    const up = (A, k) => capsuleD(k * SX, -930, r1 * (.9 + .1 * w), lerp(k * SX, A.el[0], .97), lerp(-930, A.el[1], .97), r2 * (.9 + .1 * w) + 2);
    const fa = (k, A) => forearm(k, A, { r2: r2 * (.9 + .1 * w), r3: r3 * (.9 + .1 * w), S, sk, sleeve, long: true, hs });
    const X = v => v * w;
    // surcoat: sleeveless, flared to mid-thigh; neckline dips to a V
    // dagged (scalloped) hem: six rounded tongues along the bottom edge, left to right
    const dag = dagEdge(X(-186), X(186), -420, 54, 6, 0, -420);
    const body = `M${X(-54)} -1000 C${X(-98)} -994 ${X(-130)} -978 ${X(-138)} -950 C${X(-146)} -880 ${X(-142)} -780 ${X(-134)} -690 C${X(-140)} -610 ${X(-156)} -520 ${X(-186)} -420${dag} C${X(156)} -520 ${X(140)} -610 ${X(134)} -690 C${X(142)} -780 ${X(146)} -880 ${X(138)} -950 C${X(130)} -978 ${X(98)} -994 ${X(54)} -1000 C${X(30)} -950 ${X(-30)} -950 ${X(-54)} -1000 Z`;
    // hose (parti-coloured) and boots; the lift transform lets a leg step
    const leg = k => `<g ${legTf(k, e, -440, 0)}>
        <path d="${mx(k, `M ${X(-124)} -460 C ${X(-132)} -380 ${X(-122)} -300 ${X(-112)} -236 C ${X(-120)} -180 ${X(-114)} -120 ${X(-104)} -72 L ${X(-44)} -72 C ${X(-42)} -130 ${X(-40)} -190 ${X(-48)} -240 C ${X(-40)} -310 ${X(-34)} -390 ${X(-30)} -460 Z`)}" fill="${k < 0 ? hose[0] : hose[1]}" filter="url(#pc)"/>
        <path d="${mx(k, `M ${X(-112)} -236 C ${X(-122)} -236 ${X(-52)} -226 ${X(-46)} -240`)}" stroke="${darken(k < 0 ? hose[0] : hose[1], .5)}" stroke-width="5" fill="none" opacity=".5" filter="url(#softW2)"/>
        <path d="${mx(k, `M ${X(-112)} -96 C ${X(-122)} -50 ${X(-146)} -34 ${X(-152)} -12 C ${X(-154)} 4 ${X(-132)} 6 ${X(-100)} 4 L ${X(-36)} 4 C ${X(-32)} -22 ${X(-36)} -56 ${X(-42)} -100 Z`)}" fill="${boot}" filter="url(#pcl)"/>
        <path d="${mx(k, `M ${X(-118)} -110 Q ${X(-78)} -124 ${X(-34)} -110 L ${X(-36)} -80 Q ${X(-78)} -92 ${X(-114)} -78 Z`)}" fill="${lighten(boot, .12)}" filter="url(#pcsl)"/></g>`;
    const legs = e.bust ? '' : leg(-1) + leg(1);
    // belt, buckle, hanging pouch
    const beltSVG = `<path d="M${X(-140)} -704 Q0 -686 ${X(140)} -704 L${X(138)} -664 Q0 -646 ${X(-138)} -664 Z" fill="${belt}" filter="url(#pcsl)"/>
      <path d="M${X(-136)} -690 Q0 -672 ${X(136)} -690" stroke="${lighten(belt, .3)}" stroke-width="2.4" fill="none" stroke-dasharray="9 7" opacity=".6"/>
      <g filter="url(#pcsl)"><rect x="${X(-22)}" y="-708" width="${F1(42 * w)}" height="48" rx="6" fill="url(#goldG)"/></g>
      <rect x="${X(-10)}" y="-698" width="${F1(18 * w)}" height="28" rx="3" fill="${darken(belt, .3)}"/><path d="M${X(-4)} -694 L${X(14)} -684" stroke="#e8c050" stroke-width="4" stroke-linecap="round"/>
      <path d="M${X(20)} -668 C${X(28)} -640 ${X(24)} -600 ${X(32)} -560" stroke="${belt}" stroke-width="12" fill="none" stroke-linecap="round" filter="url(#pcs)"/>
      ${pouch ? `<g transform="translate(${X(96)} -650)"><path d="M-34 0 C-44 30 -40 80 -22 96 Q0 106 22 96 C40 80 44 30 34 0 Z" fill="url(#leatherG)" filter="url(#pcl)"/>
        <path d="M-34 0 L34 0 C32 22 20 36 0 38 C-20 36 -32 22 -34 0 Z" fill="${lighten('#6a4426', .08)}" filter="url(#pcsl)"/><circle cx="0" cy="34" r="6" fill="url(#goldG)"/>
        <path d="M-26 8 C-30 40 -28 70 -16 88 M26 8 C30 40 28 70 16 88" stroke="#2a1a0e" stroke-width="2" fill="none" stroke-dasharray="5 5" opacity=".55"/></g>
        <path d="M${X(96)} -662 L${X(96)} -650" stroke="${belt}" stroke-width="10"/>` : ''}`;
    // folds drawn as soft dark / light strokes (the relight pass rounds them)
    const FO = folds;
    const foldSVG = `<g filter="url(#softW)" opacity="${F1(.5 * FO)}"><path d="M${X(-96)} -940 C${X(-104)} -840 ${X(-100)} -760 ${X(-90)} -700 M${X(86)} -940 C${X(96)} -840 ${X(92)} -760 ${X(84)} -700" stroke="${td}" stroke-width="13" fill="none"/>
        <path d="M${X(-120)} -644 C${X(-130)} -570 ${X(-146)} -500 ${X(-168)} -440 M${X(-40)} -640 C${X(-46)} -560 ${X(-54)} -490 ${X(-64)} -430 M${X(40)} -640 C${X(48)} -560 ${X(60)} -490 ${X(76)} -428 M${X(122)} -644 C${X(134)} -570 ${X(150)} -500 ${X(170)} -440" stroke="${td}" stroke-width="15" fill="none"/>
        <path d="M${X(-76)} -950 C${X(-84)} -860 ${X(-82)} -790 ${X(-76)} -720 M${X(-6)} -640 C${X(-8)} -560 ${X(-10)} -490 ${X(-12)} -430" stroke="${tl}" stroke-width="11" fill="none" opacity=".75"/></g>
      <path d="M${X(-134)} -900 C${X(-110)} -870 ${X(-108)} -826 ${X(-122)} -780 M${X(134)} -900 C${X(110)} -870 ${X(108)} -826 ${X(122)} -780" stroke="${td}" stroke-width="3" fill="none" opacity=".6"/>`;
    // hem trim + neckline trim + (optional) emblem
    const trimSVG = `<path d="M${X(-186)} -420${dag}" stroke="${trim}" stroke-width="11" fill="none" stroke-linejoin="round" filter="url(#pcs)"/>
      <path d="M${X(-186)} -420${dag}" stroke="${darken(trim, .45)}" stroke-width="2.2" fill="none" stroke-dasharray="7 7" opacity=".5" transform="translate(0 -6)"/>
      <path d="M${X(-54)} -1000 C${X(-30)} -950 ${X(30)} -950 ${X(54)} -1000" stroke="${trim}" stroke-width="9" fill="none" filter="url(#pcs)"/>`;
    const emb = emblem === 'cross' ? `<g filter="url(#pcsl)" fill="${emblemCol}"><path d="M${X(-24)} -980 L${X(24)} -980 L${X(24)} -842 L${X(112)} -842 L${X(112)} -792 L${X(24)} -792 L${X(24)} -450 L${X(-24)} -450 L${X(-24)} -792 L${X(-112)} -792 L${X(-112)} -842 L${X(-24)} -842 Z"/></g>
      <path d="M${X(-24)} -970 L${X(-24)} -842 M${X(-112)} -842 L${X(-24)} -842" stroke="${lighten(emblemCol, .4)}" stroke-width="3" opacity=".5"/>` : '';
    // a row of covered buttons down the front, and the shoulder yoke seam
    const buttons = emblem ? '' : `<g>${[-930, -890, -850, -810, -770, -730].map(y => `<g filter="url(#pcsl)"><circle cx="${F1(X(0))}" cy="${y}" r="8" fill="${trim}"/></g><circle cx="${F1(X(-2))}" cy="${y - 2}" r="2.4" fill="#fff" opacity=".6"/>`).join('')}</g>
      <path d="M${X(-128)} -952 C${X(-96)} -912 ${X(-70)} -900 ${X(-34)} -898 M${X(128)} -952 C${X(96)} -912 ${X(70)} -900 ${X(34)} -898" stroke="${td}" stroke-width="3" fill="none" opacity=".55"/>`;
    // laced V-neck over the undershirt
    const neckSVG = `<path d="M${X(-50)} -1002 C${X(-24)} -958 ${X(24)} -958 ${X(50)} -1002 L${X(30)} -1004 L0 -944 L${X(-30)} -1004 Z" fill="${sleeve}" filter="url(#pcsl)"/>
      ${lace ? [0, 1, 2, 3].map(i => `<path d="M${X(-17 + i * 3)} ${-984 + i * 11} L${X(17 - i * 3)} ${-974 + i * 11} M${X(17 - i * 3)} ${-984 + i * 11} L${X(-17 + i * 3)} ${-974 + i * 11}" stroke="#3a2412" stroke-width="2.4" stroke-linecap="round" opacity=".8"/>`).join('') : ''}`;
    const mailCol = mail ? `<g filter="url(#pcl)"><path d="M${X(-76)} -1006 C${X(-130)} -996 ${X(-170)} -978 ${X(-176)} -948 C${X(-150)} -930 ${X(-100)} -940 ${X(-64)} -958 C${X(-30)} -942 ${X(30)} -942 ${X(64)} -958 C${X(100)} -940 ${X(150)} -930 ${X(176)} -948 C${X(170)} -978 ${X(130)} -996 ${X(76)} -1006 C${X(40)} -976 ${X(-40)} -976 ${X(-76)} -1006 Z" fill="url(#steelH)"/></g>
      <g opacity=".5" stroke="#2a2e36" stroke-width="1.6" fill="none">${Array.from({ length: 9 }, (_, i) => `<path d="M${X(-160 + i * 8)} ${-966 + (i % 2) * 6} q${X(14)} 8 ${X(26)} 0"/>`).join('')}</g>` : '';
    // shoulder capelet: covers the yoke and the tops of the sleeves, scalloped along the bottom, edged in gold, clasped at the throat
    const capeSVG = cape ? (() => { const cd = darken(cape, .5), cl = lighten(cape, .28), yb = -900, xl = X(-188), xr = X(188);
      const bottom = dagEdge(xl, xr, yb, 30, 5, 0, yb);
      const sh = `M${X(-60)} -1004 C${X(-128)} -996 ${X(-178)} -972 ${X(-196)} -934 C${X(-202)} -920 ${X(-198)} -908 ${xl} ${yb}${bottom} C${X(198)} -908 ${X(202)} -920 ${X(196)} -934 C${X(180)} -970 ${X(128)} -996 ${X(60)} -1004 C${X(34)} -950 ${X(-34)} -950 ${X(-60)} -1004 Z`;
      return `<defs>${linG(id + 'c', [cl, cape, cd], { user: [-210 * w, 0, 210 * w, 0] })}</defs><path d="${sh}" fill="url(#${id}c)" filter="url(#pcl)"/>
        <path d="M${xl} ${yb}${bottom}" stroke="${trim}" stroke-width="7" fill="none" stroke-linejoin="round" filter="url(#pcs)"/>
        <path d="M${X(-60)} -1004 C${X(-34)} -950 ${X(34)} -950 ${X(60)} -1004" stroke="${trim}" stroke-width="8" fill="none" filter="url(#pcs)"/>
        <g filter="url(#softW)" opacity=".55"><path d="M${X(-146)} -956 C${X(-154)} -930 ${X(-160)} -910 ${X(-166)} -892 M${X(-88)} -948 C${X(-92)} -926 ${X(-94)} -908 ${X(-92)} -892 M${X(146)} -956 C${X(154)} -930 ${X(160)} -910 ${X(166)} -892 M${X(88)} -948 C${X(92)} -926 ${X(94)} -908 ${X(92)} -892" stroke="${cd}" stroke-width="13" fill="none"/>
          <path d="M${X(-118)} -990 C${X(-146)} -966 ${X(-166)} -946 ${X(-182)} -922" stroke="${cl}" stroke-width="11" fill="none" opacity=".6"/></g>
        <g filter="url(#pcsl)"><circle cx="0" cy="-946" r="17" fill="url(#goldG)"/></g><circle cx="0" cy="-946" r="9" fill="url(#gemG)"/><circle cx="-3" cy="-950" r="2.6" fill="#fff" opacity=".8"/>`; })() : '';
    return `<defs>${linG(id + 't', [lighten(tunic, .16), tunic, darken(tunic, .3)], { user: [-170 * w, 0, 170 * w, 0] })}${linG(id + 'm', [lighten(sleeve, .2), sleeve, darken(sleeve, .28)], { user: [-190, 0, 190, 0] })}</defs>
      ${legs}${softNeck(S, sk, 38, -960)}
      <g filter="url(#pcl)" fill="url(#${id}m)">${L.front ? '' : `<path d="${up(L, -1)}"/>`}${R.front ? '' : `<path d="${up(R, 1)}"/>`}</g>
      <path d="${body}" fill="url(#${id}t)" filter="url(#pcl)"/>
      ${foldSVG}${trimSVG}${emb}${neckSVG}${beltSVG}${mailCol}${buttons}
      ${[[-1, L], [1, R]].filter(([k, A]) => A.front).map(([k, A]) => { const d = unit([k * SX, -930], A.el);
        return `<g filter="url(#pcl)" fill="url(#${id}m)"><path d="${up(A, k)}"/></g>
        <g filter="url(#softW2)" opacity=".5"><path d="M${F1(A.el[0] - d[1] * 18)} ${F1(A.el[1] - 40)} q${F1(k * 10)} 14 ${F1(k * 4)} 30 M${F1(A.el[0] + d[1] * 14)} ${F1(A.el[1] - 64)} q${F1(k * 8)} 12 ${F1(k * 2)} 26" stroke="${sd}" stroke-width="4" fill="none"/></g>`; }).join('')}
      ${capeSVG}
      <g filter="url(#softW)" opacity=".42"><path d="M${F1(L.el[0])} ${F1(L.el[1])} l-16 -26 M${F1(R.el[0])} ${F1(R.el[1])} l16 -26" stroke="${sd}" stroke-width="12" fill="none"/></g>
      ${fa(-1, L)}${fa(1, R)}`;
  };
}

// hair that peeks out under a hat: a lock on each side that follows the face edge and curls behind the ear, with strand lines
function hairLocks(col, hi) {   // thin sideburns hugging the face edge, tapering to the cheek
  return [-1, 1].map(k => `<g filter="url(#pcsl)"><path d="${mx(k, 'M -78 -1126 C -86 -1104 -84 -1076 -74 -1052 L -68 -1058 C -72 -1078 -72 -1102 -70 -1124 Z')}" fill="${col}"/></g>
    <path d="${mx(k, 'M -76 -1116 C -80 -1100 -79 -1084 -75 -1068')}" stroke="${hi}" stroke-width="1.8" fill="none" opacity=".55"/>`).join('');
}

// ---------- hats (part of the head group) ----------
// kettle hat: wide brim, domed crown, rivets, leather chin strap. The brim casts a shadow on the brow (the engine adds one too).
function kettleHat({ dent = 0 } = {}) {
  return () => `${hairLocks('#4a2c18', '#9a7048')}<path d="M-206 -1146 Q-120 -1182 0 -1184 Q120 -1182 206 -1146 Q120 -1116 0 -1114 Q-120 -1116 -206 -1146 Z" fill="url(#steelH)" filter="url(#pcl)"/>
    <path d="M-196 -1142 Q-120 -1124 0 -1122 Q120 -1124 196 -1142" stroke="#2a2e36" stroke-width="3" fill="none" opacity=".55"/>
    <path d="M-100 -1140 C-106 -1242 -50 -1308 0 -1308 C50 -1308 106 -1242 100 -1140 Q0 -1160 -100 -1140 Z" fill="url(#steelH)" filter="url(#pcl)"/>
    <path d="M-86 -1180 C-70 -1250 -30 -1290 8 -1296" stroke="#fff" stroke-width="12" fill="none" opacity=".55" filter="url(#softW2)"/>
    <path d="M-100 -1140 Q0 -1160 100 -1140" stroke="#2a2e36" stroke-width="3" fill="none" opacity=".5"/>
    ${[-74, -36, 0, 36, 74].map((x, i) => `<g filter="url(#pcsl)"><circle cx="${x}" cy="${-1150 - (i % 2 ? 0 : 3) + Math.abs(x) * .05}" r="6.5" fill="url(#steelV)"/></g>`).join('')}
    ${dent ? `<ellipse cx="46" cy="-1236" rx="26" ry="16" fill="#2a2e36" opacity=".28" filter="url(#softW2)"/>` : ''}
    <g filter="url(#pcs)"><path d="M-86 -1118 C-94 -1060 -82 -1000 -48 -954" stroke="url(#leatherG)" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M86 -1118 C94 -1060 82 -1000 48 -954" stroke="url(#leatherG)" stroke-width="9" fill="none" stroke-linecap="round"/></g>
    <rect x="-58" y="-974" width="16" height="13" rx="2" fill="none" stroke="#d8b050" stroke-width="3" transform="rotate(-24 -50 -968)"/>`;
}
// soft felt cap with a rolled brim, a gold brooch and a red feather with barbs
function featherCap({ tilt = 0 } = {}) {
  return ({ g }) => `${hairLocks('#15100c', '#6a5848')}<g transform="rotate(${tilt} 0 -1120)"><path d="M-100 -1112 C-112 -1220 -48 -1270 18 -1266 C84 -1262 118 -1204 104 -1112 Q0 -1142 -100 -1112 Z" fill="url(#${g('hat')})" filter="url(#pcl)"/>
    <path d="M-88 -1170 C-70 -1212 -30 -1236 6 -1240 M40 -1236 C70 -1226 90 -1196 98 -1156" stroke="${darken('#2f7a4a', .55)}" stroke-width="5" fill="none" opacity=".55" filter="url(#softW2)"/>
    <path d="M-104 -1116 Q0 -1152 108 -1116 L106 -1088 Q0 -1118 -102 -1086 Z" fill="${darken('#2f7a4a', .18)}" filter="url(#pcsl)"/>
    <path d="M-100 -1100 Q0 -1126 104 -1100" stroke="${lighten('#2f7a4a', .3)}" stroke-width="3" fill="none" opacity=".55"/>
    <g filter="url(#pcsl)"><circle cx="58" cy="-1120" r="15" fill="url(#goldG)"/></g><circle cx="58" cy="-1120" r="8" fill="url(#gemG)"/><circle cx="55" cy="-1124" r="2.4" fill="#fff" opacity=".8"/>
    <path d="M52 -1128 C102 -1236 192 -1292 252 -1250 C230 -1210 176 -1180 108 -1170 Z" fill="url(#featherG)" filter="url(#pcsl)"/>
    <path d="M58 -1130 C120 -1214 190 -1250 244 -1246" stroke="#5e0e10" stroke-width="3.4" fill="none" opacity=".75"/>
    ${[0, 1, 2, 3, 4, 5, 6].map(i => { const t = .12 + i * .13, x = 58 + 186 * t, y = -1130 - 116 * Math.sin(t * 2.2); return `<path d="M${F1(x)} ${F1(y)} l${F1(-14 + i)} 26 M${F1(x)} ${F1(y)} l${F1(18 - i)} ${F1(-4 + i * 2)}" stroke="#7a1416" stroke-width="2" opacity=".55"/>`; }).join('')}
    </g>`;
}

// ---------- faces ----------
const stubble = (g, amt = .5, seed = 4) => { const R = rng(seed); let d = '';
  for (let i = 0; i < 170; i++) { const a = R() * 2 * Math.PI, r = 20 + R() * 56, x = Math.cos(a) * r * .95, y = -985 + Math.sin(a) * r * .55 + 34;
    if (y < -1022 + Math.abs(x) * .25 && Math.abs(x) < 30) continue; d += `<circle cx="${F1(x)}" cy="${F1(y)}" r="${F1(.9 + R() * .9)}"/>`; }
  return `<g clip-path="url(#${g('face')})"><g filter="url(#softW)" opacity="${F1(.34 * amt)}"><path d="M-80 -1040 C-74 -990 -44 -950 0 -946 C44 -950 74 -990 80 -1040 C54 -1004 34 -996 0 -1000 C-34 -996 -54 -1004 -80 -1040 Z" fill="#1c120c"/></g>
    <g fill="#241810" opacity="${F1(.5 * amt)}">${d}</g></g>`; };
const EYE_T = { iris: '#5a3a1e', lash: '#120804', size: 1.06, w: 21, h: 11.5, sep: 28, tilt: .05, crease: '#8a5438', lowLine: '#7a4a34', iris_r: 10 };
const BROW_T = { col: '#17100a', w: 9, len: 26, y: -1106, arch: 5, lineCol: '#8a5438' };
const MOUTH_T = { w: 18, y: -1012, lip: '#b06a58', mouth: '#4a1c18', line: '#4e241c', teeth: '#f2ebe0', crease: '#8a5438', lipK: .85 };
const noseForm = (S, side = 1) => `<g filter="url(#softW2)"><ellipse cx="-3" cy="-1050" rx="7" ry="17" fill="#fff0e0" opacity=".28"/><ellipse cx="-3" cy="-1036" rx="9" ry="6" fill="#fff0e0" opacity=".3"/></g><g filter="url(#softW)"><path d="M${12 * side} -1070 C${19 * side} -1052 ${17 * side} -1038 ${11 * side} -1031" stroke="${S.shade}" stroke-width="7" fill="none" opacity=".3"/></g>`;
const thiefFace = ({ g, S, e }) => `${stubble(g, .55)}${noseForm(S, 1)}
  <g clip-path="url(#${g('face')})"><g filter="url(#softW)"><ellipse cx="-34" cy="-1068" rx="22" ry="7" fill="#5a3a2a" opacity=".3"/><ellipse cx="34" cy="-1068" rx="22" ry="7" fill="#5a3a2a" opacity=".3"/>
    <ellipse cx="-50" cy="-1030" rx="13" ry="20" fill="#7a4a36" opacity=".18"/><ellipse cx="50" cy="-1030" rx="13" ry="20" fill="#7a4a36" opacity=".2"/></g></g>
  ${eyes2(e, EYE_T)}${brows2(e, BROW_T)}${mouth2(e, MOUTH_T)}${sweat2(e, S)}`;
const EYE_G = { iris: '#3d5a80', lash: '#1a0e08', size: 1.0, w: 21, h: 10.5, sep: 28, tilt: -.02, crease: '#9a5a44', lowLine: '#8a4a36', iris_r: 9.6 };
const BROW_G = { col: '#4a2c18', w: 12, len: 28, y: -1107, arch: 3, lineCol: '#9a5a44' };
const MOUTH_G = { w: 20, y: -1011, lip: '#b86858', mouth: '#4a1814', line: '#5a2a20', teeth: '#efe6d8', crease: '#9a5a44', lipK: .7 };
const guardFace = ({ g, S, e }) => `<g clip-path="url(#${g('face')})"><g filter="url(#softW)"><ellipse cx="-46" cy="-1040" rx="22" ry="14" fill="#d8604c" opacity=".35"/><ellipse cx="46" cy="-1040" rx="22" ry="14" fill="#d8604c" opacity=".33"/><ellipse cx="0" cy="-1048" rx="11" ry="10" fill="#d8604c" opacity=".3"/></g></g>
  ${eyes2(e, EYE_G)}${brows2(e, BROW_G)}${mouth2(e, MOUTH_G)}${sweat2(e, S)}`;

// ---------- the people ----------
const THIEF = { skin: 'olive', hair: 'bald', hairColor: 'black', beard: 'stubble', hat: 'feathercap', hatColor: '#2f7a4a', customHat: featherCap(), legs: 'none', top: 'vest',
  eyeColor: '#5a3a1e', browW: .01, id: 'tf', ownFace: 1, noMustache: 1, faceExtra: thiefFace,
  body: cotteBody({ tunic: '#2f7d4a', sleeve: '#e0a834', trim: '#e8c050', hose: ['#a8372f', '#c9962c'], boot: '#4a2f1c', w: 1, cape: '#8a2c30' }) };
const WATCHMAN = { skin: 'ruddy', hair: 'bald', hairColor: 'brown', beard: 'mustache', hat: 'kettle', hatColor: '#9aa3ae', customHat: kettleHat({ dent: 1 }), legs: 'none', top: 'vest',
  eyeColor: '#3d5a80', browW: .01, id: 'gd', ownFace: 1, faceExtra: guardFace,
  body: cotteBody({ tunic: '#efe8d8', sleeve: '#b8302c', trim: '#c9262b', hose: ['#3f4a63', '#3f4a63'], boot: '#4a2f1c', belt: '#4a3018', w: 1.14, emblem: 'cross', mail: true, pouch: false, armFn: gArm, hangFn: gHang, sh: 156, r1: 36, r2: 28, r3: 22, hs: 1.7 }) };
