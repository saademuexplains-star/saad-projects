// face2.js — refined faces for the cast (no outlined "glasses" eyes): almond eyes with a tapered lash line, a soft lid
// crease and a faint lower lid; an iris with a limbal ring and two catchlights; tapered brows; a mouth that can smile,
// smirk, frown, talk, gasp, grin with clenched teeth and laugh. person() head-local coordinates: eyes at y ≈ -1084,
// mouth ≈ -1012, the face spans x ±72. Used through person({ ownFace: 1, faceExtra }) so the engine's own eyes,
// brows and mouth are not drawn underneath.

// Catmull-Rom through points → cubic Bézier path (open or closed)
function cr2(pts, closed = false, k = 1 / 6) {
  const n = pts.length; if (n < 2) return '';
  const P = i => closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))];
  let d = `M${F1(pts[0][0])} ${F1(pts[0][1])}`;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    d += ` C${F1(p1[0] + (p2[0] - p0[0]) * k)} ${F1(p1[1] + (p2[1] - p0[1]) * k)} ${F1(p2[0] - (p3[0] - p1[0]) * k)} ${F1(p2[1] - (p3[1] - p1[1]) * k)} ${F1(p2[0])} ${F1(p2[1])}`;
  }
  return d + (closed ? 'Z' : '');
}
// a filled tapered band along a centre line (widths w0 → wm → w1)
function band2(pts, w0, w1, wm = null) {
  const n = pts.length, L = [], R = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
    const u = i / (n - 1), w = wm == null ? lerp(w0, w1, u) : (u < .5 ? lerp(w0, wm, u * 2) : lerp(wm, w1, u * 2 - 1));
    L.push([pts[i][0] - dy * w / 2, pts[i][1] + dx * w / 2]); R.push([pts[i][0] + dy * w / 2, pts[i][1] - dx * w / 2]);
  }
  return cr2(L.concat(R.reverse()), true);
}
let F2N = 0;

// ---------- eyes ----------
// e: lid 0 open … 1 half … 2 shut; shock 0..1 (wide, small pupils); squint 0..1 (lower lid up); look / lookY (iris offset);
// turn (−1..1, the far eye narrows); happy 0..1 (shut eyes curve up instead of down); dilate (pupils)
// P: { iris, lash, size, w, h, sep, cy, tilt, wing, lashes, crease, lowLine, white }
function eyes2(e, P) {
  const lid = e.lid || 0, sh = e.shock || 0, sq = e.squint || 0, turn = e.turn || 0, size = P.size || 1;
  const open = clamp(1 - Math.min(lid, 1) * .48 - Math.max(0, lid - 1) * .66, 0, 1) * (1 + .34 * sh);
  let out = '';
  for (const s of [-1, 1]) {
    const far = turn * s > 0, wk = far ? 1 - .3 * Math.abs(turn) : 1 + .05 * Math.abs(turn);
    const cx = s * (P.sep || 28) + (far ? -s * 3 * Math.abs(turn) : 0), cy = P.cy || -1084, w = (P.w || 21) * size * wk, h = (P.h || 11.5) * size;
    const tilt = P.tilt ?? .06, X = u => cx + u * w * s;            // u: −1 inner corner … +1 outer corner
    const ycorner = u => cy + 1.5 * (1 - u) / 2 - tilt * h * (u + 1) / 2 * 1.4;
    const lw = (P.lashW || 1) * size;
    if (open < .07) {   // shut: a lash curve (down = asleep / squeezed; up = a happy smile-eye)
      const hp = e.happy || 0, pts = [];
      for (let i = 0; i <= 10; i++) { const u = -1 + i / 5; pts.push([X(u), ycorner(u) + (hp > .5 ? -1 : 1) * h * .32 * (1 - u * u) + (hp > .5 ? 0 : h * .18)]); }
      out += `<path d="${band2(pts, .8 * lw, 1.2 * lw, 3.4 * lw)}" fill="${P.lash}"/>`;
      const cr = pts.map(([x, y], i) => [x, y - h * .6 - 2]).slice(2, 10);
      out += `<path d="${cr2(cr)}" stroke="${P.crease}" stroke-width="${F1(1.5 * size)}" fill="none" opacity=".3" stroke-linecap="round"/>`;
      if (e.squeeze) out += `<path d="M${F1(X(1.05))} ${F1(cy - 4)} l${F1(s * 7)} -4 M${F1(X(1.05))} ${F1(cy + 1)} l${F1(s * 8)} 1 M${F1(X(1.0))} ${F1(cy + 6)} l${F1(s * 6)} 5" stroke="${P.crease}" stroke-width="1.6" opacity=".45" stroke-linecap="round"/>`;
      continue;
    }
    const up = [], lo = [];
    for (let i = 0; i <= 12; i++) {
      const u = -1 + i / 6, b = Math.pow(Math.max(0, 1 - u * u), .75);
      up.push([X(u), ycorner(u) - h * open * b * (1 + .22 * (-u)) ]);
      lo.push([X(u), ycorner(u) + h * .62 * Math.pow(Math.max(0, 1 - u * u), 1.05) * (1 + .12 * u) * (1 - .55 * sq) * Math.min(1, open * 1.6)]);
    }
    const shape = cr2(up.concat(lo.slice(1, -1).reverse()), true), id = 'ey' + (F2N++);
    const lk = (e.look || 0), ix = cx + lk * 1.15 * wk, iy = cy + (e.lookY || 0) * .9 + h * .14;
    const ir = (P.iris_r || 10) * size * (1 - .08 * sh), pr = ir * .42 * (1 - .42 * sh) * (1 + .25 * (e.dilate || 0));
    const irisC = P.iris, irDk = darken(irisC, .45), irLt = lighten(irisC, .3);
    out += `<defs><clipPath id="${id}"><path d="${shape}"/></clipPath></defs>
      <path d="${shape}" fill="${P.white || '#f1e9e2'}"/>
      <g clip-path="url(#${id})">
        <ellipse cx="${F1(X(-1))}" cy="${F1(cy)}" rx="${F1(w * .3)}" ry="${F1(h)}" fill="#c89a8e" opacity=".35"/><ellipse cx="${F1(X(1))}" cy="${F1(cy)}" rx="${F1(w * .26)}" ry="${F1(h)}" fill="#a8988e" opacity=".3"/>
        <circle cx="${F1(ix)}" cy="${F1(iy)}" r="${F1(ir)}" fill="${irDk}"/>
        <circle cx="${F1(ix)}" cy="${F1(iy + ir * .08)}" r="${F1(ir * .84)}" fill="${irisC}"/>
        <ellipse cx="${F1(ix)}" cy="${F1(iy + ir * .38)}" rx="${F1(ir * .6)}" ry="${F1(ir * .38)}" fill="${irLt}" opacity=".55"/>
        <circle cx="${F1(ix)}" cy="${F1(iy)}" r="${F1(pr)}" fill="#070403"/>
        <path d="${band2(up.map(([x, y]) => [x, y + h * .2]), h * .5, h * .5, h * .7)}" fill="#3a2420" opacity=".28" filter="url(#softW2)"/>
        <circle cx="${F1(ix - ir * .34)}" cy="${F1(iy - ir * .4)}" r="${F1(ir * .27)}" fill="#fff" opacity=".95"/>
        <circle cx="${F1(ix + ir * .36)}" cy="${F1(iy + ir * .3)}" r="${F1(ir * .12)}" fill="#fff" opacity=".7"/></g>
      <path d="${band2(up.concat([[X(1.12 + (P.wing || 0) * .25), ycorner(1) - h * (.12 + (P.wing || 0) * .5)]]), .7 * lw, (.9 + 1.4 * (P.wing || 0)) * lw, 3.2 * lw)}" fill="${P.lash}"/>
      <path d="${cr2(lo.slice(2, 12))}" stroke="${P.lowLine}" stroke-width="${F1(1.3 * size)}" fill="none" opacity=".38" stroke-linecap="round"/>
      <path d="${cr2(up.slice(2, 12).map(([x, y], i) => [x, y - h * (.42 + .3 * (1 - open)) - 3]))}" stroke="${P.crease}" stroke-width="${F1(1.6 * size)}" fill="none" opacity=".32" stroke-linecap="round"/>`;
    if (P.lashes) { const o = up.slice(8, 13); out += o.map(([x, y], i) => `<path d="M${F1(x)} ${F1(y)} q${F1(s * (3 + i))} ${F1(-4 - i * .8)} ${F1(s * (5 + i * 1.4))} ${F1(-6 - i)}" stroke="${P.lash}" stroke-width="${F1(1.3 * size)}" fill="none" stroke-linecap="round"/>`).join(''); }
  }
  return out;
}

// ---------- brows: tapered strokes (inner end heavier). bIn / bOut raise the inner / outer end; furrow pinches them ----------
function brows2(e, B) {
  const bi = (e.bIn || 0), bo = (e.bOut || 0), fu = e.furrow || 0, turn = e.turn || 0;
  let out = '';
  for (const s of [-1, 1]) {
    const far = turn * s > 0, wk = far ? 1 - .3 * Math.abs(turn) : 1;
    const sep = B.sep || 28, len = (B.len || 25) * wk, by = (B.y || -1105) - (e.shock || 0) * 6;
    const xi = s * (sep - len * .78 + fu * 2.5), xo = s * (sep + len * .9 * (far ? .85 : 1));
    const yi = by - bi + fu * 3, yo = by - bo + 3, ym = (yi + yo) / 2 - (B.arch ?? 5) - (bi + bo) * .12;
    const pts = []; for (let i = 0; i <= 8; i++) { const u = i / 8, x = (1 - u) * (1 - u) * xi + 2 * (1 - u) * u * (xi + xo) / 2 + u * u * xo, y = (1 - u) * (1 - u) * yi + 2 * (1 - u) * u * ym + u * u * yo; pts.push([x, y]); }
    out += `<path d="${band2(pts, B.w * 1.0, B.w * .3, B.w * .95)}" fill="${B.col}"/>`;
  }
  if (bi > 5 || fu > .3) out += `<path d="M-5 ${F1((B.y || -1105) + 2)} q2 -9 1 -14 M5 ${F1((B.y || -1105) + 2)} q-2 -9 -1 -14" stroke="${B.lineCol || '#7a4a3a'}" stroke-width="1.6" fill="none" opacity="${F1(Math.min(.5, Math.max(bi - 5, fu * 8) * .06))}"/>`;
  return out;
}

// ---------- mouth ----------
// e.smirk (smile −1 frown … 1.3 broad), e.side (−1..1 one corner up), e.talk / e.open (jaw), e.ooh (round), e.grin (clenched
// smile with teeth), e.grit (clenched grimace), e.laugh (wide open laugh), e.teeth (show upper teeth when open)
// M: { w, y, lip, mouth, line, teeth, lipK (lip strength), full (always-visible full lips) }
function mouth2(e, M) {
  const sm = e.smirk ?? 0, side = e.side || 0, lg = e.laugh || 0, ooh = e.ooh || 0, grin = e.grin || 0, grit = e.grit || 0;
  const op = clamp(Math.max(e.talk || 0, e.open || 0, lg * .85, (e.shock || 0) * .45), 0, 1.2);
  const turn = e.turn || 0, y0 = M.y || -1012;
  const W = (M.w || 19) * (1 + .3 * grin + .28 * lg + .1 * Math.max(0, sm) - .38 * ooh + .4 * grit) * (1 - .12 * Math.abs(turn));
  const cy = (k) => y0 - sm * 5.5 - k * side * 4 + grit * 2;
  const cL = [-W, cy(-1)], cR = [W, cy(1)], lipC = M.lip, lk = M.lipK ?? 1;
  let out = '';
  if (op < .06 && grin < .05 && grit < .05) {
    const mid = y0 + 2 + Math.max(0, sm) * 3 - Math.max(0, -sm) * 1.5;
    const line = []; for (let i = 0; i <= 10; i++) { const u = i / 10, x = lerp(cL[0], cR[0], u), yb = lerp(cL[1], cR[1], u); line.push([x, yb + (mid - (cL[1] + cR[1]) / 2) * Math.sin(Math.PI * u)]); }
    if (M.full) {   // full painted lips (the queen)
      const upL = line.map(([x, y], i) => [x, y - (i === 0 || i === 10 ? 0 : 4.2 + 1.6 * Math.cos((i / 10 - .5) * 2 * Math.PI * 1.0))]);
      const loL = line.map(([x, y], i) => [x, y + (i === 0 || i === 10 ? 0 : 7.5 * Math.pow(Math.sin(Math.PI * i / 10), .7))]);
      out += `<path d="${cr2(upL.concat(line.slice().reverse()), true)}" fill="${darken(lipC, .12)}"/><path d="${cr2(line.concat(loL.slice().reverse()), true)}" fill="${lipC}"/>
        <ellipse cx="${F1(-3 + side)}" cy="${F1(mid + 4.5)}" rx="${F1(W * .28)}" ry="1.8" fill="#fff" opacity=".4"/>`;
    } else {
      out += `<path d="${band2(line.map(([x, y]) => [x, y - 3.5]), 2, 2, 6)}" fill="${darken(lipC, .25)}" opacity="${F1(.28 * lk)}" filter="url(#softW2)"/>
        <ellipse cx="0" cy="${F1(mid + 6)}" rx="${F1(W * .58)}" ry="4.6" fill="${lipC}" opacity="${F1(.5 * lk)}" filter="url(#softW2)"/>`;
    }
    out += `<path d="${band2(line, 1.4, 1.4, 3.4)}" fill="${M.line}"/>`;
    if (sm > .45) out += [cL, cR].map(([x, y], i) => `<path d="M${F1(x + (i ? -1 : 1))} ${F1(y - 3)} q${F1(i ? 4 : -4)} 3 ${F1(i ? 3 : -3)} 8" stroke="${M.crease || M.line}" stroke-width="1.5" fill="none" opacity="${F1(.4 * Math.min(1, sm))}"/>`).join('');
    if (sm < -.4) out += [cL, cR].map(([x, y], i) => `<path d="M${F1(x)} ${F1(y + 1)} q${F1(i ? 2 : -2)} 4 ${F1(i ? 1 : -1)} 8" stroke="${M.crease || M.line}" stroke-width="1.5" fill="none" opacity=".35"/>`).join('');
    return out;
  }
  // open / grin / grit
  const H = grin > .05 || grit > .05 ? lerp(8, 13, Math.max(grin, grit)) + op * 14 : (6 + 20 * op) * (1 + .45 * ooh) * (1 + .25 * lg);
  const up = [], lo = [];
  for (let i = 0; i <= 12; i++) { const u = i / 12, x = lerp(cL[0], cR[0], u), yb = lerp(cL[1], cR[1], u), b = Math.sin(Math.PI * u);
    const lift = (ooh > .3 ? 2 : 3.5) + grin * 1.5;
    up.push([x * (1 - .15 * ooh * b), yb - lift * Math.pow(b, .8) - 1]);
    lo.push([x * (1 - .15 * ooh * b), yb + H * Math.pow(b, ooh > .3 ? .55 : lg > .3 ? .7 : .85) + 1]); }
  const shape = cr2(up.concat(lo.slice(1, -1).reverse()), true), id = 'mo' + (F2N++);
  const showT = Math.max(e.teeth ?? (op > .28 ? .8 : 0), grin, grit, lg > .2 ? 1 : 0);
  out += `<defs><clipPath id="${id}"><path d="${shape}"/></clipPath></defs><path d="${shape}" fill="${M.mouth}"/>
    <g clip-path="url(#${id})">
      ${showT > .02 ? `<path d="${cr2(up.map(([x, y]) => [x * .9, y - 3]).concat(up.slice().reverse().map(([x, y]) => [x * .9, y + (grin > .05 || grit > .05 ? H * .5 : 5 + 4 * op)])), true)}" fill="${M.teeth || '#efe6da'}"/>` : ''}
      ${grin > .05 || grit > .05 ? `<path d="${cr2(lo.map(([x, y]) => [x * .88, y + 3]).concat(lo.slice().reverse().map(([x, y]) => [x * .88, y - H * .5])), true)}" fill="${darken(M.teeth || '#efe6da', .06)}"/>
        <path d="M${F1(-W)} ${F1((cL[1] + cR[1]) / 2 + H * .5 - 1)} L${F1(W)} ${F1((cL[1] + cR[1]) / 2 + H * .5 - 1)}" stroke="${M.mouth}" stroke-width="1.6" opacity=".7"/>
        ${grit > .05 ? [-.5, 0, .5].map(f => `<path d="M${F1(W * f)} ${F1(cy(0) - 4)} L${F1(W * f)} ${F1(cy(0) + H + 2)}" stroke="#b8a898" stroke-width="1.2" opacity=".7"/>`).join('') : ''}`
        : `<ellipse cx="0" cy="${F1((cL[1] + cR[1]) / 2 + H * .95)}" rx="${F1(W * .6)}" ry="${F1(H * .4 + 2)}" fill="${M.tongue || '#c4545a'}" opacity="${F1(Math.min(1, op * 1.8))}"/>`}</g>
    <path d="${cr2(up)}" stroke="${darken(lipC, .3)}" stroke-width="${M.full ? 3.4 : 2}" fill="none" opacity="${M.full ? .95 : .6}" stroke-linecap="round"/>
    <path d="${cr2(lo.slice(1, 12))}" stroke="${lipC}" stroke-width="${M.full ? 5.5 : 3.2}" fill="none" opacity="${M.full ? .95 : .55}" stroke-linecap="round"/>`;
  if (sm > .5 || lg > .3 || grin > .3) out += [cL, cR].map(([x, y], i) => `<path d="M${F1(x + (i ? 2 : -2))} ${F1(y - 6)} q${F1(i ? 5 : -5)} 6 ${F1(i ? 2 : -2)} 14" stroke="${M.crease || M.line}" stroke-width="1.6" fill="none" opacity=".4"/>`).join('');
  if (grit > .3) out += `<path d="M${F1(-W - 6)} ${F1(cy(0) + H + 8)} q${F1(W + 6)} 8 ${F1(2 * W + 12)} 0" stroke="${M.crease || M.line}" stroke-width="1.5" fill="none" opacity=".35"/>`;
  return out;
}

// sweat beads (a drop running down the temple) and a tear line
function sweat2(e, S) {
  let o = '';
  if (e.sweat) { const y = -1112 + (e.sweatY || 0), x = 64 - (e.sweatY || 0) * .12;
    o += `<g opacity="${F1(Math.min(1, e.sweat))}"><path d="M${F1(x)} ${F1(y - 9)} C${F1(x + 6)} ${F1(y)} ${F1(x + 5)} ${F1(y + 6)} ${F1(x)} ${F1(y + 6)} C${F1(x - 5)} ${F1(y + 6)} ${F1(x - 6)} ${F1(y)} ${F1(x)} ${F1(y - 9)}Z" fill="#e8f2fa" opacity=".8"/>
      <circle cx="${F1(x - 1.5)}" cy="${F1(y)}" r="1.6" fill="#fff"/></g>`;
    if (e.sweat > 1) o += `<path d="M-60 -1120 q-3 6 0 9 q3 -3 0 -9 Z M58 -1136 q-3 6 0 9 q3 -3 0 -9 Z" fill="#eef6fc" opacity=".75"/>`; }
  return o;
}
