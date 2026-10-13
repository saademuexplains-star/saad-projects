// chars.js — frontal cartoon puppets (feet at y=0, head top ≈ -1200, +y is down), in the reference's style:
// long sleeved arms, big readable face with ink outline, soft cel shading, expressive brows / lids / mouth.
'use strict';

const LOOKS = {
  guard: { // Bologna: white surcoat, red cross (the city's arms), red sleeves, kettle helmet, big moustache
    skin: '#f3c9a2', skinD: '#cf9470', hair: '#5a3822', tunic: '#f2eddf', cross: '#c9262b', sleeve: '#c9262b', cuff: '#f2eddf',
    hose: '#3f4a63', boot: '#5b3a24', belt: '#6a4527', hat: 'kettle', mustache: true, stubble: 0, eye: '#3d5a80' },
  thief: { // Modena: green tunic, mustard sleeves, soft cap with a red feather, stubble
    skin: '#ecbd92', skinD: '#c78a62', hair: '#3a2416', tunic: '#2f8f5b', cross: null, sleeve: '#e0ac33', cuff: '#2f8f5b',
    hose: '#8a6a40', boot: '#4a3020', belt: '#5a3b20', hat: 'cap', mustache: false, stubble: .55, eye: '#5a3d22' },
  knight: { // Modena hero for the ending: same colours, proud
    skin: '#ecbd92', skinD: '#c78a62', hair: '#3a2416', tunic: '#2f8f5b', cross: null, sleeve: '#e0ac33', cuff: '#2f8f5b',
    hose: '#8a6a40', boot: '#4a3020', belt: '#5a3b20', hat: 'cap', mustache: false, stubble: .55, eye: '#5a3d22' },
};

const POSE0 = {
  bob: 0, lean: 0, sx: 1, sy: 1, tilt: 0,
  aL: 7, bL: 8, aR: 7, bR: 8, gripL: 0, gripR: 0, holdL: null, holdR: null, showHandL: 1, showHandR: 1,
  legL: 0, legR: 0,
  lid: .22, look: [0, 0], eyeW: 0, browL: [0, 0], browR: [0, 0],
  smile: .5, smirk: 0, open: 0, rage: 0, sweat: 0, steam: 0, tears: 0, xeyes: 0, vein: 0, blink: 0, hatY: 0, hatTilt: 0,
};

const mxp = (s, d) => (s > 0 ? d : d.replace(/(-?\d+\.?\d*) (-?\d+\.?\d*)/g, (m, x, y) => `${-x} ${y}`));
const dir = (side, a) => [side * Math.sin(deg(a)), Math.cos(deg(a))];
const UPPER = 215, FORE = 200, SHX = 208, SHY = -790, UP = 70; // UP: upper body is lifted this much above the legs

function armGeom(side, a, b) {
  const s = [side * SHX, SHY], d1 = dir(side, a), e = [s[0] + UPPER * d1[0], s[1] + UPPER * d1[1]];
  const phi = a + b, d2 = dir(side, phi), w = [e[0] + FORE * d2[0], e[1] + FORE * d2[1]];
  return { s, e, w, phi };
}
// exported so scenes can attach props to a hand (world position inside the puppet's local frame)
function handPos(P, side) { const g = side < 0 ? armGeom(-1, P.aL, P.bL) : armGeom(1, P.aR, P.bR); return { x: g.w[0], y: g.w[1] - UP, phi: g.phi }; }

function drawHand(ctx, L, grip, side) {
  // local frame: origin at the wrist, +y along the forearm
  const fistP = 'M -34 -4 C -44 24 -42 66 -22 80 C -6 90 22 88 34 70 C 46 48 42 14 32 -4 Z';
  const openP = 'M -27 -4 C -36 26 -38 62 -29 82 C -22 98 12 100 25 84 C 35 66 33 26 27 -4 Z';
  piece(ctx, grip > .5 ? fistP : openP, { fill: rgrad(ctx, -8, 20, 70, [lighten(L.skin, .25), L.skin, L.skinD]), lw: 4, shade: .3, hi: .3, sw: 18, k: 5 });
  ctx.save(); ctx.strokeStyle = 'rgba(60,25,15,.7)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  if (grip > .5) { for (const y of [28, 46, 62]) { ctx.beginPath(); ctx.moveTo(-26, y); ctx.quadraticCurveTo(0, y + 6, 28, y); ctx.stroke(); } }
  else { for (const x of [-10, 4, 18]) { ctx.beginPath(); ctx.moveTo(x, 66); ctx.lineTo(x + 1, 90); ctx.stroke(); } }
  // thumb
  piece(ctx, 'M -22 6 C -44 14 -52 40 -40 54 C -30 62 -20 46 -18 30 Z', { fill: L.skin, lw: 3.5, shade: .2, hi: .2, sw: 10, k: 3 });
  ctx.restore();
}

function drawArm(ctx, L, side, a, b, grip, hold, showHand) {
  const g = armGeom(side, a, b), w = 108;
  const sleeve = L.sleeve, nrm = (p, q) => { const dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy); return [dy / l, -dx / l]; };
  const n1 = nrm(g.s, g.e), n2 = nrm(g.e, g.w), off = (p, n, k) => [p[0] + n[0] * k, p[1] + n[1] * k];
  // ink, base, shading, highlight — each a 3-point polyline so the elbow stays one solid shape
  const pl = (o, nk, col, lw) => {
    const A = off(g.s, n1, nk), B = off(g.e, n1.map((v, i) => (v + n2[i]) / 2), nk), C = off(g.w, n2, nk);
    line(ctx, [A, B, C], col, lw);
  };
  line(ctx, [g.s, g.e, g.w], INK, w + 8);
  line(ctx, [g.s, g.e, g.w], sleeve, w);
  // side of the sleeve facing away from the light (screen-right) gets darker, facing the light gets a highlight
  const lightSide = n1[0] < 0 ? 1 : -1; // pick normal pointing to the upper-left
  ctx.save(); ctx.beginPath();
  pl(0, lightSide * (w * .28), rgba(lighten(sleeve, .45), .55), w * .22);
  pl(0, -lightSide * (w * .30), rgba(darken(sleeve, .55), .38), w * .30);
  ctx.restore();
  // cuff band near the wrist
  const d2 = dir(side, g.phi), c0 = [g.w[0] - d2[0] * 26, g.w[1] - d2[1] * 26];
  line(ctx, [c0, g.w], INK, w + 10); line(ctx, [c0, g.w], L.cuff, w - 2);
  // held prop sits between hand and fingers: draw it first, hand over it
  ctx.save(); ctx.translate(g.w[0], g.w[1]); ctx.rotate(-side * deg(g.phi));
  if (hold) { ctx.save(); hold(ctx, side * deg(g.phi)); ctx.restore(); }
  if (showHand) drawHand(ctx, L, grip, side);
  ctx.restore();
}

function drawLegs(ctx, L, P) {
  for (const s of [-1, 1]) {
    const lift = s < 0 ? P.legL : P.legR;
    ctx.save(); ctx.translate(0, -lift);
    shadowEll(ctx, s * 66, lift + 4, 82, 16, .28 * (1 - clamp(lift / 60) * .6));
    // hose
    piece(ctx, mxp(s, 'M 20 -440 L 112 -440 L 108 -70 Q 106 -52 90 -52 L 38 -52 Q 22 -52 22 -70 Z'),
      { fill: hgrad(ctx, s * 20, s * 112, [lighten(L.hose, .18), L.hose, darken(L.hose, .3)]), lw: 4, shade: .26, sw: 26 });
    // boot (round toe, wide)
    piece(ctx, mxp(s, 'M 16 -112 L 118 -112 L 122 -46 Q 150 -34 148 -10 Q 146 4 126 4 L 28 4 Q 10 4 10 -14 Z'),
      { fill: vgrad(ctx, -112, 4, [lighten(L.boot, .2), L.boot, darken(L.boot, .35)]), lw: 4, shade: .3, sw: 22, k: 6 });
    // boot cuff
    piece(ctx, mxp(s, 'M 14 -122 L 120 -122 L 118 -92 L 16 -92 Z'), { fill: darken(L.boot, .12), lw: 3.5, shade: .2, sw: 12, k: 4 });
    ctx.restore();
  }
}

function drawTunic(ctx, L, P) {
  const path = 'M -128 -858 C -196 -862 -250 -836 -258 -776 L -222 -470 L -246 -318 Q -120 -296 0 -304 Q 120 -296 246 -318 L 222 -470 L 258 -776 C 250 -836 196 -862 128 -858 Q 0 -820 -128 -858 Z';
  piece(ctx, path, { fill: hgrad(ctx, -250, 250, [lighten(L.tunic, .12), L.tunic, darken(L.tunic, .28)]), lw: 4.5, shade: .3, sw: 40, k: 10 });
  // emblem
  if (L.cross) {
    piece(ctx, 'M -28 -846 L 28 -846 L 28 -700 L 120 -700 L 120 -644 L 28 -644 L 28 -322 L -28 -322 L -28 -644 L -120 -644 L -120 -700 L -28 -700 Z',
      { fill: L.cross, lw: 3.5, shade: .22, hi: .25, sw: 14, k: 4 });
  } else { // trim band + buttons for the green tunic
    line(ctx, [[-120, -855], [0, -812], [120, -855]], '#e7c24a', 14);
    for (const y of [-740, -680, -620]) ell(ctx, 0, y, 9, 9, '#e7c24a', 2.5);
  }
  // hem trim
  line(ctx, [[-244, -322], [-120, -300], [0, -308], [120, -300], [244, -322]], L.cross ? L.cross : '#e7c24a', 12);
  // belt + buckle
  piece(ctx, 'M -236 -496 L 236 -496 L 232 -452 L -232 -452 Z', { fill: vgrad(ctx, -496, -452, [lighten(L.belt, .2), L.belt, darken(L.belt, .3)]), lw: 3.5, shade: .22, sw: 12, k: 4 });
  piece(ctx, 'M -26 -504 L 26 -504 L 26 -444 L -26 -444 Z', { fill: '#e8c04a', lw: 3.5, shade: .3, sw: 10, k: 3 });
  piece(ctx, 'M -12 -490 L 12 -490 L 12 -458 L -12 -458 Z', { fill: L.belt, lw: 2.5, shade: 0, hi: 0 });
}

function drawHatBack(ctx, L, P) { /* reserved for hair under hats */ }

function drawHead(ctx, L, P) {
  const HEAD = 'M -98 -1022 C -104 -1100 -62 -1140 0 -1140 C 62 -1140 104 -1100 98 -1022 C 96 -958 68 -896 0 -886 C -68 -896 -96 -958 -98 -1022 Z';
  const hp = P2(HEAD);
  // ears
  for (const s of [-1, 1]) {
    piece(ctx, mxp(s, 'M 92 -1040 C 126 -1050 140 -1010 120 -982 C 112 -972 98 -972 92 -982 Z'), { fill: L.skin, lw: 4, shade: .3, sw: 14, k: 4 });
    ell(ctx, s * 116, -1014, 8, 14, rgba(L.skinD, .7));
  }
  // side hair
  if (L.hat === 'cap') for (const s of [-1, 1]) piece(ctx, mxp(s, 'M 94 -1100 C 118 -1080 122 -1020 110 -985 L 92 -1000 Z'), { fill: L.hair, lw: 3.5, shade: .2, sw: 10 });
  if (L.hat === 'kettle') for (const s of [-1, 1]) piece(ctx, mxp(s, 'M 92 -1080 C 112 -1060 116 -1020 108 -996 L 92 -1010 Z'), { fill: L.hair, lw: 3.5, shade: .2, sw: 10 });
  // face
  piece(ctx, HEAD, { fill: rgrad(ctx, 0, -1010, 150, [lighten(L.skin, .22), L.skin, L.skinD], -26, -1050, 10), lw: 5, shade: .34, hi: .3, sw: 36, k: 9 });
  // red rage / blush overlay
  if (P.rage > 0) { ctx.save(); ctx.clip(hp); ctx.fillStyle = `rgba(214,38,36,${.62 * P.rage})`; ctx.fillRect(-120, -1160, 240, 300); ctx.restore(); }
  // cheeks + stubble
  ctx.save(); ctx.clip(hp);
  soft(ctx, 14, () => { ell(ctx, -58, -962, 26, 15, 'rgba(235,110,100,.30)'); ell(ctx, 58, -962, 26, 15, 'rgba(235,110,100,.30)'); });
  if (L.stubble) { ctx.globalAlpha = L.stubble; soft(ctx, 10, () => { ctx.fillStyle = 'rgba(70,50,45,.32)'; ctx.beginPath(); ctx.moveTo(-98, -980); ctx.quadraticCurveTo(0, -935, 98, -980); ctx.lineTo(98, -840); ctx.lineTo(-98, -840); ctx.fill(); }); ctx.globalAlpha = 1; }
  ctx.restore();

  // ---- eyes ----
  const ew = 1 + P.eyeW * .22, eh = 1 + P.eyeW * .55;
  for (const s of [-1, 1]) {
    const cx = s * 45, cy = -1026, rx = 28 * ew, ry = 22 * eh;
    if (P.xeyes) { line(ctx, [[cx - 18, cy - 16], [cx + 18, cy + 16]], INK, 7); line(ctx, [[cx - 18, cy + 16], [cx + 18, cy - 16]], INK, 7); continue; }
    ctx.save();
    const eyeP = new Path2D(); eyeP.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#fdf8ee'; ctx.fill(eyeP);
    ctx.save(); ctx.clip(eyeP);
    const lk = P.look, px = cx + clamp(lk[0], -1, 1) * 11, py = cy + clamp(lk[1], -1, 1) * 8;
    ell(ctx, px, py, 12.5 - P.eyeW * 3, 12.5 - P.eyeW * 3, L.eye); ell(ctx, px, py, 7 - P.eyeW * 1.5, 7 - P.eyeW * 1.5, '#0f0a0a'); ell(ctx, px + 4, py - 5, 3.2, 3.2, '#fff');
    // lid
    const lid = clamp(Math.max(P.lid, P.blink)); ctx.fillStyle = L.skinD; ctx.fillRect(cx - rx - 4, cy - ry - 4, rx * 2 + 8, (ry * 2 + 8) * lid * .62 + 4 * lid);
    ctx.restore();
    ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.stroke(eyeP);
    // upper lid line
    const ly = cy - ry + (ry * 2) * lid * .62; ctx.lineWidth = 5.5; ctx.lineCap = 'round';
    if (lid > .02) { ctx.beginPath(); ctx.moveTo(cx - rx + 1, ly); ctx.quadraticCurveTo(cx, ly + (lid > .9 ? 4 : -3), cx + rx - 1, ly); ctx.stroke(); }
    ctx.restore();
  }
  // ---- brows ----
  const hairC = L.hair;
  [[-1, P.browL], [1, P.browR]].forEach(([s, br]) => {
    ctx.save(); ctx.translate(s * 46, -1074 - br[0] - P.eyeW * 10); ctx.rotate(deg(s * br[1]));
    ctx.beginPath(); ctx.moveTo(-34, 3); ctx.quadraticCurveTo(0, -9, 34, 2);
    ctx.strokeStyle = INK; ctx.lineWidth = 15; ctx.lineCap = 'round'; ctx.stroke(); ctx.strokeStyle = hairC; ctx.lineWidth = 9; ctx.stroke(); ctx.restore();
  });
  // ---- nose ----
  ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 4.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(-3, -1038); ctx.bezierCurveTo(-4, -1016, -10, -1002, -24, -994); ctx.bezierCurveTo(-14, -982, 8, -982, 20, -994); ctx.stroke();
  ctx.restore();
  // ---- mouth ----
  const my = -938;
  ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (P.open > .05) {
    const o = P.open, w = 36 + o * 6, bot = my + 18 + o * 78;
    const mp = new Path2D(); mp.moveTo(-w, my); mp.quadraticCurveTo(0, my - 14 + (P.smile < 0 ? -P.smile * 0 : 0), w, my); mp.quadraticCurveTo(w + 6, bot, 0, bot + 8); mp.quadraticCurveTo(-w - 6, bot, -w, my); mp.closePath();
    ctx.fillStyle = '#5a1618'; ctx.fill(mp); ctx.save(); ctx.clip(mp);
    ctx.fillStyle = '#f7efe0'; ctx.fillRect(-w, my - 6, 2 * w, 18 + o * 6); // upper teeth
    ell(ctx, 0, bot - 2, w * .62, 18 + o * 5, '#d9606a'); // tongue
    ctx.restore(); ctx.stroke(mp);
  } else {
    ctx.beginPath(); ctx.moveTo(-34, my + 2 - P.smirk * 4); ctx.quadraticCurveTo(0, my + 2 + P.smile * 30 - (P.smile < 0 ? 0 : 0), 36, my + 2 - P.smirk * 16 - 0);
    ctx.stroke();
    if (P.smile > .8) { ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(40, my - 10 - P.smirk * 14); ctx.quadraticCurveTo(46, my - 2, 38, my + 4); ctx.stroke(); }
  }
  ctx.restore();
  // moustache
  if (L.mustache) {
    const mv = P.open > .3 ? -6 : 0;
    piece(ctx, `M -70 ${-948 + mv} C -62 -988 -18 -992 0 -968 C 18 -992 62 -988 70 ${-948 + mv} C 52 -958 20 -944 0 -954 C -20 -944 -52 -958 -70 ${-948 + mv} Z`,
      { fill: L.hair, lw: 3.5, shade: .25, sw: 10, k: 3 });
  }
  // sweat / tears / veins
  if (P.sweat > 0) { const y = lerp(-1090, -1010, easeOut(P.sweat)); ctx.save(); ctx.globalAlpha = clamp(P.sweat * 4) * (1 - clamp((P.sweat - .85) * 6)); flat(ctx, `M 96 ${y} C 82 ${y + 30} 80 ${y + 44} 96 ${y + 52} C 112 ${y + 44} 110 ${y + 30} 96 ${y} Z`, '#bfe6ff', 3.5); ell(ctx, 91, y + 38, 4, 7, 'rgba(255,255,255,.85)'); ctx.restore(); }
  if (P.tears > 0) {
    for (const s of [-1, 1]) {
      ctx.save(); ctx.globalAlpha = clamp(P.tears * 3);
      const x = s * 52; ctx.fillStyle = '#9fd6ff'; ctx.strokeStyle = INK; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(x - 10, -1004); ctx.quadraticCurveTo(x - 22, -940, x - 8 + s * 2, -905); ctx.lineTo(x + 12, -905); ctx.quadraticCurveTo(x + 14, -960, x + 10, -1004); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.restore();
    }
  }
  if (P.vein > 0) { ctx.save(); ctx.translate(66, -1112); ctx.scale(1 + P.vein * .15 * Math.sin(P.vein * 40), 1 + P.vein * .15 * Math.sin(P.vein * 40)); ctx.strokeStyle = '#d01f1f'; ctx.lineWidth = 7; ctx.lineCap = 'round';
    for (const [a, b, c, d] of [[-14, -14, 0, 0], [0, 0, 14, -14], [-14, 14, 0, 0], [0, 0, 14, 14]]) { ctx.beginPath(); ctx.moveTo(a, b); ctx.quadraticCurveTo((a + c) / 2 - 6, (b + d) / 2, c, d); ctx.stroke(); } ctx.restore(); }

  // ---- hats ----
  ctx.save(); ctx.translate(0, P.hatY); ctx.rotate(deg(P.hatTilt));
  if (L.hat === 'kettle') {
    piece(ctx, 'M -196 -1082 C -190 -1114 -120 -1126 0 -1126 C 120 -1126 190 -1114 196 -1082 C 150 -1060 -150 -1060 -196 -1082 Z', { fill: lgrad(ctx, -190, -1120, 190, -1060, ['#b9c3cd', '#7b8894', '#4f5963']), lw: 4.5, shade: .34, sw: 24, k: 7 });
    piece(ctx, 'M -112 -1100 C -112 -1190 -62 -1232 0 -1232 C 62 -1232 112 -1190 112 -1100 C 60 -1086 -60 -1086 -112 -1100 Z', { fill: lgrad(ctx, -110, -1230, 110, -1090, ['#e6edf3', '#93a1ae', '#56626e']), lw: 4.5, shade: .32, hi: .5, sw: 28, k: 8 });
    ell(ctx, 0, -1180, 9, 9, '#46515c', 2.5); ell(ctx, -60, -1128, 7, 7, '#46515c', 2); ell(ctx, 60, -1128, 7, 7, '#46515c', 2);
    soft(ctx, 6, () => line(ctx, [[-70, -1200], [-40, -1218]], 'rgba(255,255,255,.7)', 12));
  } else if (L.hat === 'cap') {
    piece(ctx, 'M -108 -1058 C -118 -1170 -44 -1224 22 -1218 C 92 -1212 128 -1150 110 -1058 C 62 -1086 -52 -1092 -108 -1058 Z', { fill: lgrad(ctx, -100, -1220, 100, -1060, [lighten('#2f8f5b', .22), '#2f8f5b', darken('#2f8f5b', .35)]), lw: 4.5, shade: .32, sw: 26, k: 8 });
    piece(ctx, 'M -112 -1064 C -60 -1094 62 -1094 114 -1064 L 112 -1040 C 60 -1066 -60 -1066 -110 -1040 Z', { fill: lgrad(ctx, 0, -1090, 0, -1040, ['#e7c24a', '#c99a2c']), lw: 4, shade: .25, sw: 12, k: 4 });
    // feather
    piece(ctx, 'M 70 -1190 C 150 -1250 220 -1240 250 -1170 C 190 -1198 140 -1170 70 -1190 Z', { fill: lgrad(ctx, 70, -1240, 250, -1170, ['#f05a45', '#c92c2c']), lw: 3.5, shade: .2, sw: 10, k: 3 });
    line(ctx, [[74, -1188], [170, -1214], [236, -1192]], 'rgba(120,20,20,.55)', 3);
  }
  ctx.restore();
}

function drawSteam(ctx, P, t) {
  if (P.steam <= 0) return;
  for (const s of [-1, 1]) for (let i = 0; i < 4; i++) {
    const ph = ((t * 1.7 + i * .25) % 1), a = (1 - ph) * clamp(P.steam);
    ell(ctx, s * (120 + ph * 40 * s * s) + s * 10, -1010 - ph * 140, 22 + ph * 34, 20 + ph * 28, `rgba(255,255,255,${.85 * a})`, 0);
  }
}

// main entry: draws one puppet with feet at (0,0) of the current transform.
function drawPuppet(ctx, name, pose = {}, t = 0) {
  const L = LOOKS[name], P = { ...POSE0, ...pose };
  ctx.save();
  ctx.translate(0, P.bob); ctx.scale(P.sx * (1 - Math.sin(t * 2.4) * .003), P.sy * (1 + Math.sin(t * 2.4) * .005));
  drawLegs(ctx, L, P);
  ctx.save(); ctx.translate(0, -UP); ctx.transform(1, 0, deg(P.lean) * .5, 1, -deg(P.lean) * 0, 0);
  drawTunic(ctx, L, P);
  // neck
  piece(ctx, 'M -44 -880 L 44 -880 L 50 -820 Q 0 -796 -50 -820 Z', { fill: L.skinD, lw: 4, shade: .3, hi: 0, sw: 14, k: 4 });
  drawArm(ctx, L, -1, P.aL, P.bL, P.gripL, P.holdL, P.showHandL);
  drawArm(ctx, L, 1, P.aR, P.bR, P.gripR, P.holdR, P.showHandR);
  ctx.save(); ctx.translate(0, -860); ctx.rotate(deg(P.tilt)); ctx.translate(0, 860);
  drawHead(ctx, L, P); drawSteam(ctx, P, t);
  ctx.restore();
  ctx.restore();
  ctx.restore();
}

// 2-link IK: pose angles {a,b} so the wrist of `side` reaches target (puppet-local coords, y up is negative).
function reach(side, tx, ty) {
  const sx = side * SHX, sy = SHY - UP, vx = tx - sx, vy = ty - sy;
  let d = Math.hypot(vx, vy); const dd = clamp(d, 40, UPPER + FORE - 1);
  const av = Math.atan2(side * vx, vy) * 180 / Math.PI;
  const al = Math.acos(clamp((UPPER * UPPER + dd * dd - FORE * FORE) / (2 * UPPER * dd), -1, 1)) * 180 / Math.PI;
  const be = Math.acos(clamp((FORE * FORE + dd * dd - UPPER * UPPER) / (2 * FORE * dd), -1, 1)) * 180 / Math.PI;
  const a = av - al, phi = av + be; return { a, b: phi - a };
}
