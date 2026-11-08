// Whole-film check of the flat art drawn with HL.plane (sets22 plane(): art in local cm, drawn with ONE affine map taken
// at its anchor point). For every plane() call: the art's bounding box (getBBox, cached by string), a 7x7 grid of its
// points mapped by that affine map and by the true perspective projection. Flags:
//   ghost  - the affine art is on screen but the true art is not (drawn where nothing is: FEAST 344-357, a side-wall
//            tapestry smeared across the cloth of estate)
//   err    - both on screen, but the affine art is more than ERR px from where it truly is
//   near   - the art crosses the near plane while the affine art is on screen (part of it is behind the lens)
//   vanish - plane() draws nothing (its anchor is behind the lens) while the true art is on screen
// Needs the inert hook at the top of sets22 plane(). Usage:
//   .\_tools\jseval.ps1 -Page _render\video\pick19.html -Exprs (Get-Content _tools\planechk.js -Raw), 'PCHK(0,3370)'
(function () {
  const NS = 'http://www.w3.org/2000/svg', FW = 1080, FH = 1920, M = 60;
  let hs = null; const cache = new Map();
  const bbox = svg => {
    let r = cache.get(svg); if (r) return r;
    if (!hs) { hs = document.createElementNS(NS, 'svg'); hs.setAttribute('width', '10'); hs.setAttribute('height', '10'); hs.style.cssText = 'position:absolute;left:-9999px;top:0'; document.body.appendChild(hs); }
    if (cache.size > 400) cache.clear();
    hs.innerHTML = '<g>' + svg + '</g>'; const b = hs.firstChild.getBBox(); r = [b.x, b.y, b.width, b.height]; cache.set(svg, r); return r;
  };
  // convex polygon vs the frame (separating axes)
  const hitsFrame = P => {
    if (P.length < 3) return false;
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (const p of P) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
    if (x1 < 0 || x0 > FW || y1 < 0 || y0 > FH) return false;
    const R = [[0, 0], [FW, 0], [FW, FH], [0, FH]];
    for (let i = 0; i < P.length; i++) {
      const a = P[i], b = P[(i + 1) % P.length], nx = b[1] - a[1], ny = a[0] - b[0];
      let pm = 1e18, pM = -1e18, rm = 1e18, rM = -1e18;
      for (const p of P) { const v = p[0] * nx + p[1] * ny; pm = Math.min(pm, v); pM = Math.max(pM, v); }
      for (const p of R) { const v = p[0] * nx + p[1] * ny; rm = Math.min(rm, v); rM = Math.max(rM, v); }
      if (pM < rm || rM < pm) return false;
    }
    return true;
  };
  const inF = p => p[0] > -M && p[0] < FW + M && p[1] > -M && p[1] < FH + M;
  let AGG = new Map(), CALLS = 0, FR = 0;
  // (ext / cut: the art's extent passed to plane() and whether plane() now leaves it out as off screen. A call left out
  // that was drawn on screen before is listed as 'culled': the frames whose pixels the cull changes)
  // (clip: plane() keeps the art but clips it to its true outline, which misses the frame: listed as 'clipped' when the
  // art was on screen before - those frames change too)
  window.__PLANECHK = (cam, O, U, V, svg, cx, cy, span, ext, cut, clipped) => {
    CALLS++;
    const [bx, by, bw, bh] = ext ? [ext[0], ext[1], ext[2] - ext[0], ext[3] - ext[1]] : bbox(svg); if (!(bw > 0 && bh > 0)) return;
    const W3 = (u, v) => [O[0] + U[0] * u + V[0] * v, O[1] + U[1] * u + V[1] * v, O[2] + U[2] * u + V[2] * v];
    // the affine map plane() uses
    const A = W3(cx, cy), ca = cam.toC(A);
    let drawn = ca[2] >= cam.near + 10, aff = null;
    if (drawn) {
      const p0 = cam.scr(ca), pu = cam.proj(W3(cx + span, cy)), pv = cam.proj(W3(cx, cy + span));
      if (!pu || !pv) drawn = false;
      else { const a = (pu[0] - p0[0]) / span, b = (pu[1] - p0[1]) / span, c = (pv[0] - p0[0]) / span, d = (pv[1] - p0[1]) / span, e = p0[0] - a * cx - c * cy, g = p0[1] - b * cx - d * cy; aff = (u, v) => [a * u + c * v + e, b * u + d * v + g]; }
    }
    // the true quad, clipped at the near plane
    const cn = [[bx, by], [bx + bw, by], [bx + bw, by + bh], [bx, by + bh]].map(([u, v]) => cam.toC(W3(u, v)));
    const nr = cam.near + 1, clip = []; let behind = false;
    for (let i = 0; i < 4; i++) { const P = cn[i], Q = cn[(i + 1) % 4], iP = P[2] >= nr, iQ = Q[2] >= nr; if (!iP) behind = true; if (iP) clip.push(P); if (iP !== iQ) { const k = (nr - P[2]) / (Q[2] - P[2]); clip.push([P[0] + (Q[0] - P[0]) * k, P[1] + (Q[1] - P[1]) * k, nr]); } }
    const trueVis = clip.length >= 3 && hitsFrame(clip.map(c => cam.scr(c)));
    let type = null, err = 0;
    if (drawn && (cut || clipped)) {
      if (hitsFrame([[bx, by], [bx + bw, by], [bx + bw, by + bh], [bx, by + bh]].map(([u, v]) => aff(u, v)))) type = cut ? 'culled' : 'clipped';
    } else if (drawn) {
      const affVis = hitsFrame([[bx, by], [bx + bw, by], [bx + bw, by + bh], [bx, by + bh]].map(([u, v]) => aff(u, v)));
      if (!affVis) return;
      for (let i = 0; i <= 6; i++) for (let j = 0; j <= 6; j++) {
        const u = bx + bw * i / 6, v = by + bh * j / 6, c = cam.toC(W3(u, v)); if (c[2] < nr) continue;
        const t = cam.scr(c), q = aff(u, v); if (inF(t) || inF(q)) err = Math.max(err, Math.hypot(t[0] - q[0], t[1] - q[1]));
      }
      type = !trueVis ? 'ghost' : behind ? 'near' : err > (window.__PCHK_ERR || 12) ? 'err' : null;
    } else if (trueVis) type = 'vanish';
    if (!type) return;
    const key = O.map(v => Math.round(v)).join(',') + ' | ' + svg.replace(/ id="[^"]*"/g, '').replace(/<defs>.*?<\/defs>/, '').slice(0, 46);
    let r = AGG.get(key); if (!r) AGG.set(key, r = {});
    const s = r[type] || (r[type] = { fr: [], e: 0 }); if (s.fr[s.fr.length - 1] !== FR) s.fr.push(FR); s.e = Math.max(s.e, err);
    // (with window.__PCHK_CULL set, a ghost is left out: GVIS measures what that changes on screen)
    return window.__PCHK_CULL === true && type === 'ghost';
  };
  // GVIS(frames): each frame rasterised with its ghosts and without them; the pixels that differ (any channel > 24)
  // and their box. Tells whether a ghost the scan lists is seen at all (most lie under nearer things or at the edge).
  const raster = svg => new Promise((res, rej) => {
    if (!/^<svg[^>]*xmlns=/.test(svg)) svg = svg.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    const u = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' })), im = new Image();
    im.onload = () => { const cv = document.createElement('canvas'); cv.width = FW; cv.height = FH; const g = cv.getContext('2d'); g.drawImage(im, 0, 0, FW, FH); URL.revokeObjectURL(u); res(g.getImageData(0, 0, FW, FH).data); };
    im.onerror = e => { URL.revokeObjectURL(u); rej(new Error('raster failed')); }; im.src = u;
  });
  window.GVIS = async frames => {
    const out = [];
    for (const n of frames) {
      window.__PCHK_CULL = false; FR = n; const s1 = ENG.svgFrame(n);
      window.__PCHK_CULL = true; const s2 = ENG.svgFrame(n); window.__PCHK_CULL = false;
      const [a, b] = [await raster(s1), await raster(s2)];
      let cnt = 0, x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
      for (let i = 0; i < a.length; i += 4) { if (Math.abs(a[i] - b[i]) > 24 || Math.abs(a[i + 1] - b[i + 1]) > 24 || Math.abs(a[i + 2] - b[i + 2]) > 24) { cnt++; const p = i / 4, x = p % FW, y = (p - x) / FW; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } }
      out.push(n + ' px ' + cnt + (cnt ? ' box ' + x0 + ',' + y0 + '-' + x1 + ',' + y1 : ''));
    }
    return out.join('\n');
  };
  const ranges = a => { const o = []; let s = a[0], p = a[0]; for (let i = 1; i <= a.length; i++) { if (a[i] === p + 1) { p = a[i]; continue; } o.push(s === p ? '' + s : s + '-' + p); s = p = a[i]; } return o.join(','); };
  window.PCHK = (from, to, step = 1) => {
    AGG = new Map(); CALLS = 0;
    for (let n = from; n <= to; n += step) { FR = n; ENG.svgFrame(n); }
    const out = ['frames ' + from + '-' + to + ' step ' + step + ', plane() calls ' + CALLS + ', flagged planes ' + AGG.size];
    for (const [k, r] of AGG) for (const t in r) out.push(t.padEnd(6) + ' e' + String(Math.round(r[t].e)).padStart(5) + '  ' + ranges(r[t].fr) + '   ' + k);
    return out.join('\n');
  };
  return 'planechk loaded';
})();
