// Style engine: renders a part (closed point list) with a consistent light setup.
'use strict';
const L = require('./lib');
const { path, P, inside, soft, crescent, taper } = L;

// Variable-weight outline around a closed shape: heavier on edges facing away from the light.
function outline(pts, w, lightDir, opt = {}) {
  const S = L.sample(pts, true, 2);
  const n = S.length;
  const ld = L.norm(lightDir);
  const out = [], inn = [];
  // signed area to know orientation
  let area = 0;
  for (let i = 0; i < n; i++) { const a = S[i], b = S[(i + 1) % n]; area += a[0] * b[1] - b[0] * a[1]; }
  const sgn = area > 0 ? 1 : -1;
  const ws = [];
  for (let i = 0; i < n; i++) {
    const a = S[(i - 1 + n) % n], b = S[(i + 1) % n];
    const t = L.norm(L.sub(b, a));
    const nn = [t[1] * sgn, -t[0] * sgn]; // outward normal
    const facing = nn[0] * ld[0] + nn[1] * ld[1]; // +1 faces light
    let ww = w * (1 + (opt.contrast ?? 0.55) * -facing);
    if (opt.bottomHeavy) ww *= 1 + 0.3 * Math.max(0, nn[1]);
    ws.push([nn, Math.max(w * (opt.min ?? 0.25), ww)]);
  }
  // smooth widths
  const sm = ws.map((_, i) => { let acc = 0; for (let k = -3; k <= 3; k++) acc += ws[(i + k + n) % n][1]; return acc / 7; });
  for (let i = 0; i < n; i++) {
    const [nn] = ws[i], hw = sm[i] / 2;
    out.push(L.add(S[i], L.mul(nn, hw * (opt.outer ?? 0.6))));
    inn.push(L.sub(S[i], L.mul(nn, hw * (1 - (opt.outer ?? 0.6)) * 2)));
  }
  const ring = (arr) => 'M' + arr.map((p) => L.f(p[0]) + ',' + L.f(p[1])).join('L') + 'Z';
  return `<path d="${ring(out)}${ring(inn.reverse())}" fill="${opt.color || '#000'}" fill-rule="evenodd" ${opt.extra || ''}/>`;
}

// Outline only part of a closed contour (indices a..b, wrapping), tapered at both ends, weighted by light.
function openLine(pts, [a, b], w, lightDir, color, st) {
  const n = pts.length, seq = [];
  for (let i = a; ; i = (i + 1) % n) { seq.push(pts[i]); if (i === b) break; }
  const S = L.sample(seq, false, 2);
  const ld = L.norm(lightDir);
  // orientation of the full contour
  let area = 0;
  for (let i = 0; i < n; i++) { const p = pts[i], q = pts[(i + 1) % n]; area += p[0] * q[1] - q[0] * p[1]; }
  const sg = area > 0 ? 1 : -1;
  const ws = S.map((p, i) => {
    const t = L.norm(L.sub(S[Math.min(S.length - 1, i + 1)], S[Math.max(0, i - 1)]));
    const nn = [t[1] * sg, -t[0] * sg];
    const facing = nn[0] * ld[0] + nn[1] * ld[1];
    const end = Math.min(1, i / 8, (S.length - 1 - i) / 8);
    return Math.max(w * (st.lineMin ?? 0.3), w * (1 - (st.lineContrast ?? 0.55) * facing)) * end;
  });
  return P(taper(S, (t) => ws[Math.min(ws.length - 1, Math.round(t * (ws.length - 1)))]), color);
}

// Open polyline stroke with weight.
function line(pts, w, color, extra = '') { return P(taper(pts, w), color, extra); }

// Render a lit part.
// st: style {light:[x,y] toward light, cel (blur px), lineW, lineColor, lineMode, rimW, bounce}
// m: material palette {base, light, shadow, deep, rim, rimHot, bounce, line}
// o: {shadowAmt (px shift), shadows:[d], lights:[d], details: svg, rim: px, noRim, noLine, lineW}
function part(doc, st, m, pts, o = {}) {
  const d = path(pts, true, o.k ?? 1);
  const ld = L.norm(st.light);
  let s = P(d, m.base);
  let sh = '';
  // big soft form light toward the light side
  if (m.light && o.formLight !== false) {
    // highlight band inset from the lit edge (not a second rim): (shape moved inward) minus (shape moved further)
    const e = o.formInset ?? st.formInset ?? 10, k = o.formShift ?? 40;
    const mk = doc.mask(`<path d="${d}" fill="#fff" transform="translate(${L.f(ld[0] * e)},${L.f(ld[1] * e)})" ${st.formBlur ? `filter="${doc.blur(st.formBlur * 0.5)}"` : ''}/>` +
      `<path d="${d}" fill="#000" transform="translate(${L.f(ld[0] * (e + k))},${L.f(ld[1] * (e + k))})" ${st.formBlur ? `filter="${doc.blur(st.formBlur)}"` : ''}/>`);
    sh += `<path d="${d}" fill="${m.light}" mask="${mk}" opacity="${o.formOp ?? st.formOp ?? 0.6}"/>`;
  }
  // cel shadow: area of the shape not reached when shifted toward the light
  const amt = o.shadowAmt ?? 40;
  if (amt > 0) sh += crescent(doc, d, [ld[0] * amt, ld[1] * amt], m.shadow, st.cel ?? 1, st.shadowOp ?? 0.92);
  // reflected light on the edge facing away from the key: leaves a darker core shadow at the terminator
  if (amt > 0 && st.reflect !== false && o.reflect !== false) {
    const r = Math.max(4, amt * (st.reflectK ?? 0.22));
    sh += crescent(doc, d, [ld[0] * r, ld[1] * r], m.reflect || m.bounce || m.light, st.reflectBlur ?? Math.max(2, (st.cel ?? 1) * 1.5), st.reflectOp ?? 0.35);
  }
  if (o.shadows) for (const sd of o.shadows) sh += typeof sd === 'string' && sd.startsWith('<') ? sd : P(sd, m.shadow, `opacity="${st.shadowOp ?? 0.92}"`);
  // terminator warm band (subsurface) for skin
  if (m.sss && amt > 0) sh += crescent(doc, d, [ld[0] * (amt - 8), ld[1] * (amt - 8)], m.sss, 4, 0.0);
  if (o.deep) for (const dd of o.deep) sh += soft(doc, dd, m.deep, st.deepBlur ?? 6, 0.6);
  if (o.lights) for (const ll of o.lights) sh += soft(doc, ll, m.hi || m.light, st.hiBlur ?? 4, 0.8);
  if (o.details) sh += o.details;
  // bounce on undersides
  if (m.bounce && o.bounce !== false) { const bd = st.bounceDir || [0, -1], ba = o.bounceAmt ?? 12; sh += crescent(doc, d, [bd[0] * ba, bd[1] * ba], m.bounce, st.bounceBlur ?? 5, st.bounceOp ?? 0.4); }
  // rim light on edges facing the rim light
  const rd = L.norm(st.rimDir || st.light);
  if (!o.noRim && m.rim) {
    const rw = o.rim ?? st.rimW ?? 8;
    sh += crescent(doc, d, [-rd[0] * rw, -rd[1] * rw], m.rim, st.rimBlur ?? 1, st.rimOp ?? 1);
    if (m.rimHot) sh += crescent(doc, d, [-rd[0] * rw * 0.4, -rd[1] * rw * 0.4], m.rimHot, 0.6, 0.9);
  }
  if (st.sheen && m.hi && o.sheen !== false) {
    const k2 = st.sheen;
    const mk = doc.mask(`<path d="${d}" fill="#fff" transform="translate(${L.f(ld[0] * 4)},${L.f(ld[1] * 4)})" filter="${doc.blur(3)}"/>` +
      `<path d="${d}" fill="#000" transform="translate(${L.f(ld[0] * (4 + k2))},${L.f(ld[1] * (4 + k2))})" filter="${doc.blur(k2 * 0.6)}"/>`);
    sh += `<path d="${d}" fill="${m.hi}" mask="${mk}" opacity="${st.sheenOp ?? 0.3}"/>`;
  }
  if (o.after) sh += o.after;
  s += inside(doc, d, sh);
  if (o.lineOpen && st.lineMode !== 'none') s += openLine(pts, o.lineOpen, o.lineW ?? st.lineW, st.lineLight || st.light, o.lineColor || m.line || st.lineColor, st);
  else if (!o.noLine && st.lineMode !== 'none') s += outline(pts, o.lineW ?? st.lineW, st.lineLight || st.light, { color: o.lineColor || m.line || st.lineColor, contrast: st.lineContrast ?? 0.55, min: st.lineMin ?? 0.3, outer: 0.5, bottomHeavy: true });
  return s;
}

// Shade a muscle/bone form inside its host part: soft shadow on the side away from the light,
// soft light on the side facing it. k = depth of the form in px.
function form(doc, st, m, pts, k = 14, o = {}) {
  const d = path(pts, true, st.formK ?? 1);
  const ld = L.norm(st.light);
  const b = o.blur ?? st.formEdge ?? 6;
  let s = '';
  s += crescent(doc, d, [ld[0] * k, ld[1] * k], o.shadow || m.shadow, b, o.sop ?? st.formSop ?? 0.26);
  if ((o.lop ?? 0) > 0) s += crescent(doc, d, [-ld[0] * k * 0.6, -ld[1] * k * 0.6], o.light || m.hi || m.light, b * 1.4, o.lop ?? 0.18);
  return s;
}

module.exports = { outline, line, part, form, openLine };
