// A small perspective renderer for the Hamelin street scenes. World units are centimetres: x to the right, y up, z away
// from the camera; the cobbles lie at y = 0. A camera has a position, a yaw (turning right is +), a pitch (looking up is
// +) and a focal length in pixels, and the shots move it like a real camera (dolly, crane, pan, tilt). Every wall, beam,
// window, sign and cobble is projected each frame, so convergence and parallax are always true. Characters stand in this
// world as billboards (T.stand gives their screen foot point and rig scale) and are depth-sorted with the things that
// stand in the street (signs on brackets, a well, barrels).
(function (G) {
  const { f, rng } = G.RIG, shade2 = G.RIG.shade;
  const T = G.ST3 = {};
  const D2R = Math.PI / 180, clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const ss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  T.ss = ss;

  // ------------------------------------------------------------ colour (rgb arrays, fast)
  const rgbOf = h => { const c = parseInt(h.slice(1), 16); return [c >> 16, (c >> 8) & 255, c & 255]; };
  const hexOf = c => '#' + c.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const cmix = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
  const cmul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
  T.rgbOf = rgbOf; T.hexOf = hexOf; T.cmix = cmix;

  // ------------------------------------------------------------ camera
  T.cam = o => {
    const yw = (o.yaw || 0) * D2R, pt = (o.pitch || 0) * D2R, cy = Math.cos(yw), sy = Math.sin(yw), cp = Math.cos(pt), sp = Math.sin(pt);
    const fl = o.fl || 1300, CX = 540, CY = 960, near = o.near || 25;
    const toC = P => { const x = P[0] - o.x, y = P[1] - o.y, z = P[2] - o.z, xc = x * cy - z * sy, z1 = x * sy + z * cy; return [xc, y * cp - z1 * sp, y * sp + z1 * cp]; };
    const scr = c => [CX + fl * c[0] / c[2], CY - fl * c[1] / c[2]];
    // a direction (a point at infinity: the sun, the vanishing point of the street) on screen
    const dir = d => { const xc = d[0] * cy - d[2] * sy, z1 = d[0] * sy + d[2] * cy, yc = d[1] * cp - z1 * sp, zc = d[1] * sp + z1 * cp; return zc > 1e-4 ? [CX + fl * xc / zc, CY - fl * yc / zc] : null; };
    // dist: straight-line distance from the lens, the key every depth sort uses (unlike the depth along the view axis it
    // doesn't change as the camera turns, so two things side by side never swap places while it pans)
    return { x: o.x, y: o.y, z: o.z, yaw: o.yaw || 0, pitch: o.pitch || 0, fl, near, toC, scr, dir, proj: P => { const c = toC(P); return c[2] > near ? scr(c) : null; },
      dist: P => Math.hypot(P[0] - o.x, P[1] - o.y, P[2] - o.z) };
  };

  // ------------------------------------------------------------ primitives (world -> screen path data)
  const P2 = p => f(p[0]) + ',' + f(p[1]);
  const clipNear = (c, nr) => {
    const out = [], n = c.length;
    for (let i = 0; i < n; i++) {
      const a = c[i], b = c[(i + 1) % n], ia = a[2] >= nr, ib = b[2] >= nr;
      if (ia) out.push(a);
      if (ia !== ib) { const t = (nr - a[2]) / (b[2] - a[2]); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, nr]); }
    }
    return out;
  };
  // closed polygon; null when behind the camera or wholly off screen
  T.path = (cam, pts) => {
    const c = clipNear(pts.map(cam.toC), cam.near);
    if (c.length < 3) return null;
    const s = c.map(cam.scr);
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    for (const p of s) { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; }
    if (x1 < -300 || x0 > 1380 || y1 < -300 || y0 > 2220) return null;
    return 'M' + s.map(P2).join('L') + 'Z';
  };
  // open polyline (each segment clipped against the near plane)
  T.lineD = (cam, pts) => {
    let d = '', pen = false;
    for (let i = 0; i < pts.length - 1; i++) {
      let A = cam.toC(pts[i]), B = cam.toC(pts[i + 1]); const nr = cam.near;
      if (A[2] < nr && B[2] < nr) { pen = false; continue; }
      let cut = false;
      if (A[2] < nr) { const t = (nr - A[2]) / (B[2] - A[2]); A = [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, nr]; cut = true; }
      if (B[2] < nr) { const t = (nr - B[2]) / (A[2] - B[2]); B = [B[0] + (A[0] - B[0]) * t, B[1] + (A[1] - B[1]) * t, nr]; }
      if (!pen || cut) d += 'M' + P2(cam.scr(A));
      d += 'L' + P2(cam.scr(B)); pen = !(B[2] <= nr + 1e-6);
    }
    return d;
  };
  // points round an ellipse in a plane: centre C, axis vectors a, b (world)
  T.ring = (C, a, b, n = 18) => Array.from({ length: n }, (_, i) => { const t = i / n * Math.PI * 2, c = Math.cos(t), s = Math.sin(t); return [C[0] + a[0] * c + b[0] * s, C[1] + a[1] * c + b[1] * s, C[2] + a[2] * c + b[2] * s]; });
  // stroke width for an outline at camera depth d (thinner far away, never fatter than a character's line)
  const lw = (cam, d, k = 1) => f(clamp(k * 1.7 * 900 / Math.max(60, d) * cam.fl / 1300, 0.35, 2.1));
  // how much of a line's opacity to keep: 1 until its true width falls under ~0.6 px, then fading out with it
  const thinK = (cam, d, k = 1) => { const w = k * 1.7 * 900 / Math.max(60, d) * cam.fl / 1300; return w >= 0.6 ? 1 : Math.max(0, (w - 0.15) / 0.45); };

  // ------------------------------------------------------------ lighting / atmosphere
  // env: { sun: direction toward the sun, sunCol, shade (the cool shadow tint), shadeK, haze, hazeD (cm), lit(z): the
  // height above which the sun reaches the lit row of facades }
  const hazeK = (env, d) => clamp(1 - Math.exp(-Math.max(0, d - (env.hazeNear || 0)) / env.hazeD)) * (env.hazeMax ?? 0.85);
  // base colour in the shade of the street + atmospheric haze at camera depth d
  const tone = (env, c, d, kind) => {
    let col = rgbOf(c);
    if (kind !== 'n') {
      const sk = kind === 'd' ? env.shadeK + 0.25 : kind === 'r' ? env.shadeK * 0.8 : env.shadeK;
      col = cmix(col, rgbOf(env.shade), sk);
      if (kind === 'd') col = cmul(col, 0.62); else if (kind === 's') col = cmul(col, 0.86); else if (kind === 'g') col = cmul(col, 0.92);
    }
    return hexOf(cmix(col, rgbOf(env.haze), hazeK(env, d)));
  };
  T.tone = tone;

  // ------------------------------------------------------------ the houses
  // A half-timbered house. side -1 = left of the street (its front faces +x), 1 = right; X: the ground-floor wall plane;
  // z0..z1: its frontage along the street; fl: floor heights [ground, upper, ...]; jet: how far each upper floor juts
  // out over the one below; gable: the gable faces the street (else the eaves do); pal: plaster, timber, shutters, roof,
  // ground floor; win: windows per upper floor; sign: { kind, k } a hanging sign on an iron bracket; seed: details.
  // The geometry (world coordinates) is built once; the renderer projects and tones it every frame.
  const houseItems = o => {
    const walls = [], over = [], props = [], r = rng(o.seed || 1), sd = o.side, jet = o.jet ?? 24, z0 = o.z0, z1 = o.z1, W = z1 - z0, zm = (z0 + z1) / 2;
    const Y = [0]; for (const h of o.fl) Y.push(Y[Y.length - 1] + h);
    const n = o.fl.length, Xk = k => o.X - sd * Math.min(k, n - 1) * jet, PT = (k, u, v) => [Xk(k), v, u];
    const pal = o.pal, Dp = o.depth ?? 900, Xt = Xk(n - 1), Ytop = Y[n], back = Xt + sd * Dp;
    const hp = o.gable ? W / 2 * (o.pitch ?? 1.3) : 0, rh = o.gable ? 0 : Dp / 2 * (o.pitch ?? 1.0);
    const add = (L, kind, pts, c, x = {}) => L.push(Object.assign({ kind, pts, c }, x));
    let chim = null;
    const quad = (k, u0, v0, u1, v1) => [PT(k, u0, v0), PT(k, u1, v0), PT(k, u1, v1), PT(k, u0, v1)];
    const beam = (k, ua, va, ub, vb, t) => { const du = ub - ua, dv = vb - va, L = Math.hypot(du, dv) || 1, nu = -dv / L * t / 2, nv = du / L * t / 2; return [PT(k, ua + nu, va + nv), PT(k, ub + nu, vb + nv), PT(k, ub - nu, vb - nv), PT(k, ua - nu, va - nv)]; };
    // a timber with the light catching one edge (details have their own random stream, so adding them never changes
    // which windows are lit or which have shutters and flowers)
    const rd = rng((o.seed || 1) * 977 + 13);
    const beamD = (k, ua, va, ub, vb, t) => { const q = beam(k, ua, va, ub, vb, t); add(over, 'f', q, pal.tm, { k, ol: 1, sc: 0.6 }); add(over, 'f', [q[0], q[1]], shade2(pal.tm, 0.55), { line: 1, sc: 0.3, op: 0.42, k }); };
    // the end wall facing the camera (seen above a lower neighbour) and the roof
    const endWall = o.gable ? [[o.X, 0, z0], [back, 0, z0], [back, Ytop, z0], [Xt, Ytop, z0], [Xt, Y[1], z0], [o.X, Y[1], z0]]
      : [[o.X, 0, z0], [back, 0, z0], [back, Ytop, z0], [Xt + sd * Dp / 2, Ytop + rh, z0], [Xt, Ytop, z0], [Xt, Y[1], z0], [o.X, Y[1], z0]];
    add(walls, 's', endWall, pal.pl, { ol: 1 });
    if (o.gable) {
      // both slopes (the far one shows only as its overhang beside the far verge), tile courses across them
      const ov = 22;
      for (const ze of [z1 + 6, z0 - 6]) {
        add(walls, 'r', [[Xt - sd * ov, Ytop - 12, ze], [Xt - sd * ov, Ytop + hp + 16, zm], [back, Ytop + hp + 16, zm], [back, Ytop - 12, ze]], pal.rf, { ol: 1 });
        for (let i = 1; i < 11; i++) { const k = i / 11, y = Ytop - 12 + (hp + 28) * k, z = ze + (zm - ze) * k; add(walls, 'r', [[Xt - sd * ov, y, z], [back, y, z]], shade2(pal.rf, -0.35), { line: 1, sc: 0.55, op: 0.55 }); }
        // tiles: staggered joints between the courses, a few patches of moss
        const A = [Xt - sd * ov, Ytop - 12, ze], Bv = [0, hp + 28, zm - ze], Dv = [back - A[0], 0, 0], S2 = (s, q) => [A[0] + Bv[0] * s + Dv[0] * q, A[1] + Bv[1] * s + Dv[1] * q, A[2] + Bv[2] * s + Dv[2] * q];
        const segs = []; for (let i = 0; i < 10; i++) for (let j = 0; j < 9; j++) { const q = (j + (i % 2) * 0.5 + 0.25) / 9.5, s0 = (i + 0.08) / 11, s1 = (i + 0.92) / 11; segs.push([S2(s0, q), S2(s1, q)]); }
        add(over, 'r', segs[0], shade2(pal.rf, -0.3), { segs, sc: 0.3, op: 0.35 });
        for (let i = 0; i < 2; i++) { const s = 0.08 + rd() * 0.4, q = 0.1 + rd() * 0.8, c = S2(s, q); add(walls, 'r', T.ring(c, Bv.map(v => v * (0.05 + rd() * 0.04)), Dv.map(v => v * (0.035 + rd() * 0.03)), 10), '#5e6a3a', { op: f(0.22 + rd() * 0.12) }); }
      }
      // the ridge
      add(walls, 'r', [[Xt - sd * ov, Ytop + hp + 16, zm], [back, Ytop + hp + 16, zm]], shade2(pal.rf, -0.5), { line: 1, sc: 1.8, op: 0.9 });
    } else {
      const ov = 40, rf = [[Xt - sd * ov, Ytop - 12, z0 - 6], [Xt - sd * ov, Ytop - 12, z1 + 6], [Xt + sd * Dp / 2, Ytop + rh, z1 + 6], [Xt + sd * Dp / 2, Ytop + rh, z0 - 6]];
      add(walls, 'r', rf, pal.rf, { ol: 1, sunlit: sd < 0 ? 1 : 0 });
      for (let i = 1; i < 12; i++) { const k = i / 12, x = Xt - sd * ov + (sd * Dp / 2 + sd * ov) * k, y = Ytop - 12 + (rh + 12) * k; add(walls, 'r', [[x, y, z0 - 6], [x, y, z1 + 6]], shade2(pal.rf, -0.35), { line: 1, sc: 0.55, op: 0.55 }); }
      // tiles: staggered joints between the courses, moss, the ridge
      {
        const A = [Xt - sd * ov, Ytop - 12, z0 - 6], Bv = [sd * Dp / 2 + sd * ov, rh + 12, 0], Dv = [0, 0, W + 12], S2 = (s, q) => [A[0] + Bv[0] * s + Dv[0] * q, A[1] + Bv[1] * s + Dv[1] * q, A[2] + Bv[2] * s + Dv[2] * q];
        const segs = [], nq = Math.max(6, Math.round(W / 45)); for (let i = 0; i < 11; i++) for (let j = 0; j < nq; j++) { const q = (j + (i % 2) * 0.5 + 0.25) / (nq + 0.5), s0 = (i + 0.08) / 12, s1 = (i + 0.92) / 12; segs.push([S2(s0, q), S2(s1, q)]); }
        add(over, 'r', segs[0], shade2(pal.rf, -0.3), { segs, sc: 0.3, op: 0.35 });
        for (let i = 0; i < 3; i++) { const c = S2(0.08 + rd() * 0.5, 0.08 + rd() * 0.84); add(walls, 'r', T.ring(c, Bv.map(v => v * (0.05 + rd() * 0.04)), Dv.map(v => v * (0.025 + rd() * 0.025)), 10), '#5e6a3a', { op: f(0.22 + rd() * 0.12) }); }
        add(walls, 'r', [S2(1, -0.01), S2(1, 1.01)], shade2(pal.rf, -0.5), { line: 1, sc: 1.8, op: 0.9 });
      }
      // a chimney with a little smoke point, a dormer now and then
      const cz = z0 + W * (0.25 + r() * 0.5), cx = Xt + sd * Dp * 0.38, ch = rh * 0.86;
      add(walls, 's', [[cx - 30, Ytop, cz - 35], [cx + 30, Ytop, cz - 35], [cx + 30, Ytop + ch + 90, cz - 35], [cx - 30, Ytop + ch + 90, cz - 35]], '#8a6a5a', { ol: 1 });
      chim = [cx, Ytop + ch + 90, cz - 35];
      if (r() < 0.6) {
        const dz = z0 + W * (0.3 + r() * 0.3), dw = 120, dx0 = Xt + sd * Dp * 0.12, dy0 = Ytop + rh * 0.24, dhh = 130;
        add(walls, 'f', [[dx0, dy0, dz - dw / 2], [dx0, dy0, dz + dw / 2], [dx0, dy0 + dhh, dz + dw / 2], [dx0, dy0 + dhh + 60, dz], [dx0, dy0 + dhh, dz - dw / 2]], pal.pl, { ol: 1, sunlit: sd < 0 ? 1 : 0 });
        add(walls, 'n', [[dx0 - sd * 2, dy0 + 25, dz - 32], [dx0 - sd * 2, dy0 + 25, dz + 32], [dx0 - sd * 2, dy0 + 105, dz + 32], [dx0 - sd * 2, dy0 + 105, dz - 32]], r() < 0.5 ? '#f0b860' : '#2a2c3a', { ol: 1 });
      }
    }
    // the front: ground floor, the jettied upper floors, the gable
    add(walls, 'g', quad(0, z0, 0, z1, Y[1]), pal.gf || pal.pl, { ol: 1, wall: 1, k: 0 });
    for (let k = 1; k < n; k++) {
      add(walls, 'd', [[Xk(k - 1), Y[k], z0], [Xk(k - 1), Y[k], z1], [Xk(k), Y[k], z1], [Xk(k), Y[k], z0]], pal.tm, {});
      add(walls, 'f', quad(k, z0, Y[k], z1, Y[k + 1]), pal.pl, { ol: 1, wall: 1, k });
    }
    if (o.gable) add(walls, 'f', [PT(n - 1, z0, Ytop), PT(n - 1, z1, Ytop), PT(n - 1, zm, Ytop + hp)], pal.pl, { ol: 1, wall: 1, k: n - 1 });
    // the shade each jetty throws on the wall under it
    for (let k = 1; k < n; k++) add(walls, 'g', quad(k - 1, z0, Y[k] - 48, z1, Y[k]), '#1a1018', { op: 0.28 });
    // weathering: damp along the foot of the wall, a few stains
    add(walls, 'g', quad(0, z0, 0, z1, 34), '#3a3230', { op: 0.35 });
    for (let i = 0; i < 3; i++) { const u = z0 + W * (0.15 + r() * 0.7), v = 40 + r() * (Y[1] - 80), a = 40 + r() * 70; add(walls, 'g', T.ring(PT(0, u, v), [0, a * 0.5, 0], [0, 0, a], 10), '#5a4a40', { op: 0.12 }); }
    // the plaster of the upper floors isn't one flat colour: soft patches of damp and of fresher limewash
    const plD = shade2(pal.pl, -0.16), plL = shade2(pal.pl, 0.1), pats = [[], []];
    for (let k = 1; k < n; k++) for (let i = 0; i < 5; i++) {
      const u = z0 + W * (0.08 + rd() * 0.84), v = Y[k] + (Y[k + 1] - Y[k]) * (0.12 + rd() * 0.76), a = 26 + rd() * 56;
      pats[rd() < 0.62 ? 0 : 1].push(T.ring(PT(k, u, v), [0, a * (0.35 + rd() * 0.35), 0], [0, 0, a], 12));
    }
    for (const q of pats[0]) add(walls, 'f', q, plD, { op: 0.2, bk: 1 });
    for (const q of pats[1]) add(walls, 'f', q, plL, { op: 0.17, bk: 1 });
    // a stone plinth with its joints along the foot of the front
    add(over, 'g', [PT(0, z0, 36), PT(0, z1, 36)], '#2a2220', { line: 1, sc: 0.5, op: 0.5 });
    for (let u = z0 + 26 + rd() * 20; u < z1 - 18; u += 36 + rd() * 26) add(over, 'g', [PT(0, u, 3), PT(0, u, 34)], '#2a2220', { line: 1, sc: 0.4, op: 0.42 });
    // hairline cracks running up from the window corners; on some houses the plaster has fallen off and shows the brick
    for (let i = 0, m = 2 + Math.floor(rd() * 3); i < m && n > 1; i++) {
      const k = 1 + Math.floor(rd() * (n - 1)); let u = z0 + W * (0.12 + rd() * 0.76), v = Y[k] + (Y[k + 1] - Y[k]) * (0.2 + rd() * 0.5); const pts = [PT(k, u, v)];
      for (let j = 0; j < 4; j++) { u += (rd() - 0.5) * 24; v += 9 + rd() * 15; pts.push(PT(k, u, v)); }
      add(over, 'f', pts, '#3a2a22', { line: 1, sc: 0.32, op: 0.55, k });
    }
    if (n > 1 && rd() < 0.4) {
      const k = 1 + Math.floor(rd() * (n - 1)), u = z0 + W * (0.2 + rd() * 0.6), v = Y[k] + (Y[k + 1] - Y[k]) * (0.3 + rd() * 0.35), w = 34 + rd() * 26, h = 22 + rd() * 14;
      add(over, 'f', T.ring(PT(k, u, v), [0, h, 0], [0, 0, w], 11).map(p => [p[0], p[1] + (rd() - 0.5) * 7, p[2] + (rd() - 0.5) * 9]), '#9a5a44', { ol: 1, sc: 0.35, k });
      for (let j = -1; j <= 1; j++) add(over, 'f', [PT(k, u - w * 0.72, v + j * h * 0.48), PT(k, u + w * 0.72, v + j * h * 0.48)], '#5a3022', { line: 1, sc: 0.32, op: 0.6, k });
      for (let j = -1; j <= 1; j += 2) add(over, 'f', [PT(k, u + j * w * 0.3, v - h * 0.48), PT(k, u + j * w * 0.3, v)], '#5a3022', { line: 1, sc: 0.3, op: 0.5, k });
    }
    // ground floor: a door (round-headed), a window with a sill, quoins at the corners
    const dz = o.doorAt ?? (sd < 0 ? z0 + W * 0.22 : z1 - W * 0.22), dw = 116, dh = 214;
    const arch = Array.from({ length: 9 }, (_, i) => { const a = Math.PI * i / 8; return PT(0, dz - Math.cos(a) * dw / 2, dh - dw / 2 + Math.sin(a) * dw / 2); });
    add(over, 'g', [PT(0, dz - dw / 2 - 14, 0), ...arch.map(p => [p[0], p[1] + 12, p[2] + (p[2] - dz) * 0.22]), PT(0, dz + dw / 2 + 14, 0)], '#9a8c78', { ol: 1 });
    add(over, 'g', [PT(0, dz - dw / 2, 0), ...arch, PT(0, dz + dw / 2, 0)], o.doorC || '#5a3a24', { ol: 1 });
    for (let i = 1; i < 5; i++) { const u = dz - dw / 2 + dw * i / 5; add(over, 'g', [PT(0, u, 4), PT(0, u, dh - dw / 2 + Math.sqrt(Math.max(0, (dw / 2) ** 2 - (u - dz) ** 2)) - 6)], '#2a1a10', { line: 1, sc: 0.6, op: 0.6 }); }
    for (const v of [50, 150]) add(over, 'g', [PT(0, dz - dw / 2 + 6, v), PT(0, dz + 4, v)], '#1a1410', { line: 1, sc: 1.4, op: 0.85 });
    // a ring handle on the door, a worn step before it, and by some doors an iron lantern on a bracket
    add(over, 'g', T.ring(PT(0, dz + dw * 0.28, 104), [0, 7, 0], [0, 0, 7], 10), '#1a1410', { line: 1, sc: 0.8, op: 0.85 });
    add(over, 'g', [PT(0, dz - dw / 2 - 16, 0), PT(0, dz + dw / 2 + 16, 0), PT(0, dz + dw / 2 + 16, 11), PT(0, dz - dw / 2 - 16, 11)].map(p => [p[0] - sd * 24, p[1], p[2]]), '#8e8474', { ol: 1, sc: 0.5 });
    if (rd() < 0.4) {
      const lu = dz + (sd < 0 ? 1 : -1) * (dw / 2 + 36), lv = dh + 26;
      add(over, 'g', [PT(0, lu, lv + 24), PT(0, lu, lv + 48), PT(0, lu - 12, lv + 56)], '#1a1410', { line: 1, sc: 0.9, op: 0.9 });
      add(over, 'g', [PT(0, lu - 10, lv), PT(0, lu + 10, lv), PT(0, lu + 13, lv + 22), PT(0, lu, lv + 30), PT(0, lu - 13, lv + 22)], '#2a1a10', { ol: 1, sc: 0.5 });
      add(over, 'n', quad(0, lu - 6, lv + 3, lu + 6, lv + 19), rd() < 0.5 ? '#f0b860' : '#c8b898', {});
    }
    const gwz = sd < 0 ? z1 - W * 0.3 : z0 + W * 0.3;
    if (W > 420) {
      add(over, 'g', quad(0, gwz - 62, 96, gwz + 62, 200), '#3a2a20', { ol: 1 });
      add(over, 'n', quad(0, gwz - 52, 104, gwz + 52, 192), o.lit0 ? '#e8a858' : '#20242e', { ol: 1, glass: o.lit0 ? 0 : 1 });
      for (let i = 1; i < 4; i++) add(over, 'g', [PT(0, gwz - 52 + 104 * i / 4, 104), PT(0, gwz - 52 + 104 * i / 4, 192)], '#1a1410', { line: 1, sc: 0.7, op: 0.8 });
      add(over, 'g', quad(0, gwz - 70, 84, gwz + 70, 96), '#8a7c6a', { ol: 1 });
    }
    for (const u of [z0, z1]) for (let v = 0; v < Y[1] - 30; v += 56) { const w2 = (v / 56) % 2 ? 26 : 40, uu = u === z0 ? u : u - w2; add(over, 'g', quad(0, uu, v + 3, uu + w2, v + 52), '#a89a86', { ol: 1, sc: 0.5, op: 0.9 }); }
    // the timber frame of the upper floors: sill and head beams, corner and window posts, braces, a rail under the windows
    const tm = pal.tm, nwin = o.win ?? Math.max(1, Math.round(W / 250)), winList = [];
    for (let k = 1; k < n; k++) {
      const yb = Y[k], yt = Y[k + 1], hh = yt - yb, wins = [], ww = Math.min(96, W / (nwin * 2.2)), wh = Math.min(140, hh * 0.52), wy = yb + hh * 0.3;
      for (let i = 0; i < nwin; i++) wins.push(z0 + W * (i + 0.5) / nwin);
      const posts = [z0 + 9, z1 - 9]; wins.forEach(u => posts.push(u - ww / 2 - 10, u + ww / 2 + 10));
      for (const u of posts) beamD(k, u, yb + 6, u, yt - 6, 17);
      beamD(k, z0, yb + 9, z1, yb + 9, 19);
      beamD(k, z0, yt - 9, z1, yt - 9, 19);
      beamD(k, z0, wy - 10, z1, wy - 10, 13);
      // braces in the wall panels: a 'man' figure (a post with two raking struts) in each panel wide enough for one
      const ps = posts.slice().sort((a, b) => a - b);
      for (let i = 0; i < ps.length - 1; i++) {
        const a = ps[i] + 8, b = ps[i + 1] - 8; if (b - a < 70) continue;
        if (wins.some(u => u > a && u < b)) continue;
        const m = (a + b) / 2;
        beamD(k, m, yb + 10, m, yt - 10, 15);
        beamD(k, a, yb + 14, m, yb + hh * 0.62, 14);
        beamD(k, b, yb + 14, m, yb + hh * 0.62, 14);
      }
      // windows: frame, glass (dark with the sky in it, or warm when someone has lit a lamp), the cross of the
      // casement and its leaded panes, shutters hooked back, a flower box with geraniums on some
      for (const [wi, u] of wins.entries()) {
        const lit = r() < (o.litP ?? 0.22);
        winList.push({ k, i: wi, u, wy, ww, wh, X: Xk(k) });
        // o.open [k, i]: this window stands open (the shot draws the room, the person in it and the sill over them)
        if (o.open && o.open[0] === k && o.open[1] === wi) {
          add(over, 'f', quad(k, u - ww / 2 - 8, wy - 8, u + ww / 2 + 8, wy + wh + 8), tm, { k, ol: 1 });
          add(over, 'n', quad(k, u - ww / 2, wy, u + ww / 2, wy + wh), '#120c0a', { k });
          const sc = pal.sh;
          for (const s2 of [-1, 1]) { const ua = u + s2 * (ww / 2 + 10), ub = u + s2 * (ww / 2 + 10 + ww / 2 + 4); add(over, 'f', quad(k, Math.min(ua, ub), wy - 4, Math.max(ua, ub), wy + wh + 4), sc, { k, ol: 1 }); }
          continue;
        }
        // a grey streak of rain-washed dirt under the window
        add(over, 'f', [PT(k, u - ww * 0.36, wy - 12), PT(k, u + ww * 0.36, wy - 12), PT(k, u + ww * 0.12, wy - 78 - rd() * 20), PT(k, u - ww * 0.14, wy - 70 - rd() * 20)], '#4a3c34', { k, op: 0.08 });
        add(over, 'f', quad(k, u - ww / 2 - 8, wy - 8, u + ww / 2 + 8, wy + wh + 8), tm, { k, ol: 1 });
        add(over, 'n', quad(k, u - ww / 2, wy, u + ww / 2, wy + wh), lit ? '#f2b860' : '#262a38', { ol: 1, glass: lit ? 0 : 1, k });
        // leaded glass: a lattice of diamonds over the panes; the pale sky caught in the upper panes of a dark window
        {
          const ua = u - ww / 2, ub = u + ww / 2, D = wh * 0.62, sp = ww / 2.6, lc = lit ? '#6a4420' : '#a8b0c0', lo = lit ? 0.5 : 0.3;
          const clipSeg = (u1, v1, u2, v2) => { const kk = (v2 - v1) / (u2 - u1); if (u1 > u2) { [u1, v1, u2, v2] = [u2, v2, u1, v1]; } if (u2 <= ua || u1 >= ub) return null; if (u1 < ua) { v1 += (ua - u1) * kk; u1 = ua; } if (u2 > ub) { v2 -= (u2 - ub) * kk; u2 = ub; } return [PT(k, u1, v1), PT(k, u2, v2)]; };
          for (let j = -3; j <= 3; j++) for (const dirn of [1, -1]) { const s0 = dirn > 0 ? ua + j * sp : ub - j * sp, sg = clipSeg(s0, wy, s0 + dirn * D, wy + wh); if (sg) add(over, 'f', sg, lc, { line: 1, sc: 0.28, op: lo, k }); }
          if (!lit) add(over, 'n', quad(k, ua + 3, wy + wh * 0.6, ub - 3, wy + wh - 3), '#d4dce8', { k, op: 0.12 });
        }
        add(over, 'f', [PT(k, u, wy), PT(k, u, wy + wh)], tm, { line: 1, sc: 1.6, k });
        add(over, 'f', [PT(k, u - ww / 2, wy + wh * 0.62), PT(k, u + ww / 2, wy + wh * 0.62)], tm, { line: 1, sc: 1.4, k });
        if (r() < 0.75) {
          const sc = pal.sh;
          for (const s2 of [-1, 1]) {
            const ua = u + s2 * (ww / 2 + 10), ub = u + s2 * (ww / 2 + 10 + ww / 2 + 4), lo = Math.min(ua, ub), hi = Math.max(ua, ub);
            add(over, 'f', quad(k, lo, wy - 4, hi, wy + wh + 4), sc, { k, ol: 1 });
            // boards, a ledge and a brace on each shutter
            for (const q of [0.33, 0.66]) add(over, 'f', [PT(k, lo + (hi - lo) * q, wy), PT(k, lo + (hi - lo) * q, wy + wh)], '#000000', { line: 1, sc: 0.32, op: 0.2, k });
            add(over, 'f', [PT(k, lo + 4, wy + wh * 0.2), PT(k, hi - 4, wy + wh * 0.2)], '#000000', { line: 1, sc: 0.5, op: 0.25, k });
            add(over, 'f', [PT(k, lo + 4, wy + wh * 0.8), PT(k, hi - 4, wy + wh * 0.8)], '#000000', { line: 1, sc: 0.5, op: 0.25, k });
            add(over, 'f', [PT(k, s2 > 0 ? lo + 4 : hi - 4, wy + wh * 0.22), PT(k, s2 > 0 ? hi - 4 : lo + 4, wy + wh * 0.78)], '#000000', { line: 1, sc: 0.45, op: 0.22, k });
            add(over, 'f', [PT(k, s2 > 0 ? lo + 1 : hi - 1, wy + wh * 0.2), PT(k, s2 > 0 ? lo + 1 : hi - 1, wy + wh * 0.8)], shade2(sc, 0.4), { line: 1, sc: 0.3, op: 0.35, k });
          }
        }
        if (r() < (o.flowers ?? 0.45)) {
          const by = wy - 34, bx = Xk(k) - sd * 26, P = (uu, vv, xx = bx) => [xx, vv, uu];
          const fr = rng((o.seed || 1) * 31 + k * 7 + Math.round(u));
          // geraniums: a bank of leaves, then the flower heads standing up out of it, then the box in front
          for (let j = 0; j < 8; j++) { const uu = u - ww / 2 + ww * (j + 0.5) / 8, vv = by + 26 + fr() * 12, rr = 9 + fr() * 4; add(over, 'f', T.ring([bx + sd * 6, vv, uu], [0, rr * 0.8, 0], [0, 0, rr], 8), j % 2 ? '#3a6a2a' : '#2e5a24', { k }); }
          for (let j = 0; j < 9; j++) { const uu = u - ww / 2 + 6 + (ww - 12) * fr(), vv = by + 36 + fr() * 20, rr = 4.5 + fr() * 3; add(over, 'f', T.ring([bx + sd * 3, vv, uu], [0, rr, 0], [0, 0, rr], 7), o.flowerC || '#d02e28', { k }); }
          add(over, 'f', [P(u - ww / 2 - 6, by), P(u + ww / 2 + 6, by), P(u + ww / 2 + 6, by + 30), P(u - ww / 2 - 6, by + 30)], '#6a4228', { ol: 1, k, x: 1 });
        } else add(over, 'f', quad(k, u - ww / 2 - 12, wy - 19, u + ww / 2 + 12, wy - 8), shade2(tm, 0.14), { k, ol: 1, sc: 0.45 });
      }
    }
    // the gable: a collar beam, a king post and struts, a loft door under a hoist beam
    if (o.gable) {
      const k = n - 1, yc = Ytop + hp * 0.42, half = W / 2 * (1 - 0.42);
      beamD(k, zm - half + 6, yc, zm + half - 6, yc, 17);
      beamD(k, zm, Ytop + 6, zm, Ytop + hp - 10, 16);
      beamD(k, z0 + 30, Ytop + 10, zm - 40, yc - 6, 14);
      beamD(k, z1 - 30, Ytop + 10, zm + 40, yc - 6, 14);
      add(over, 'f', quad(k, zm - 40, Ytop + 40, zm - 6, Ytop + 120), '#3a2a20', { k, ol: 1 });
      add(over, 'f', quad(k, zm + 6, Ytop + 40, zm + 40, Ytop + 120), '#3a2a20', { k, ol: 1 });
      add(over, 'n', quad(k, zm - 34, yc + 22, zm + 34, yc + 92), r() < 0.3 ? '#e8a858' : '#262a38', { k, ol: 1, glass: 1 });
      // barge boards along the verges (on the roof's edge, just proud of the gable)
      const vb = (u, v) => [Xt - sd * 20, v, u];
      add(over, 'f', [vb(z0 - 6, Ytop - 14), vb(zm, Ytop + hp + 18), vb(zm, Ytop + hp + 36), vb(z0 - 8, Ytop + 2)], tm, { ol: 1, k });
      add(over, 'f', [vb(z1 + 6, Ytop - 14), vb(zm, Ytop + hp + 18), vb(zm, Ytop + hp + 36), vb(z1 + 8, Ytop + 2)], tm, { ol: 1, k });
    } else {
      // the eaves: a dark band of rafter ends under the roof's edge
      add(over, 'd', [[Xt - sd * 40, Ytop - 12, z0 - 6], [Xt - sd * 40, Ytop - 12, z1 + 6], [Xt, Ytop + 6, z1 + 6], [Xt, Ytop + 6, z0 - 6]], '#2a1a14', {});
    }
    // a hanging sign on an iron bracket (stands in the street: depth-sorted with the people)
    if (o.sign) {
      const sz = o.sign.z ?? zm, sx0 = o.X - sd * 6, sx1 = o.X - sd * 112, sy = Y[1] - 30;
      props.push({ z: sz, kind: 'sign', sd, x0: sx0, x1: sx1, y: sy, sign: o.sign.kind, col: o.sign.col || '#c89a3a' });
    }
    // o.xf: a house built as if on a street side, then turned into place (the far side of a square faces the camera)
    const xf = o.xf || (p => p);
    if (o.xf) { for (const L of [walls, over]) for (const it of L) { it.pts = it.pts.map(xf); if (it.segs) it.segs = it.segs.map(s2 => s2.map(xf)); } props.length = 0; }
    // the corners of the house's whole box (for the cull: a house is skipped only when all of it is behind the lens)
    const box = []; for (const x of [Xk(n - 1) - sd * 60, back]) for (const y of [0, Ytop + hp + rh + 150]) for (const z of [z0 - 30, z1 + 30]) box.push(xf([x, y, z]));
    return { walls, over, props, z0, z1, zm, side: sd, Y, Xk, n, top: Ytop + hp + rh, hp, gable: !!o.gable, xf, litSide: o.litSide, wins: winList, pal, chim: chim && xf(chim), box };
  };
  T.houseItems = houseItems;
  // the skyline of one row (top of its fronts and gables) as a function of z: the low sun throws it onto the row across
  // the street, so the shadow line there steps with the real roofs
  T.rowTop = (list, side) => {
    let L = null;
    return z => {
      if (!L) L = list.filter(o => o.side === side && !o.xf).map(o => o._g || (o._g = houseItems(o)));
      for (const H of L) if (z >= H.z0 && z <= H.z1) { const Yt = H.Y[H.n]; return H.gable ? Yt + H.hp * Math.max(0, 1 - Math.abs(z - H.zm) / ((H.z1 - H.z0) / 2)) : Yt + 80; }
      return 0;
    };
  };

  // signs: boards and shapes hanging in the plane facing the camera (z = const), drawn by the depth sort
  const signSvg = (cam, env, p) => {
    // (no early exit near the lens: the board and bracket are clipped at the near plane, so a sign slides out of frame)
    const d = Math.max(cam.near + 5, cam.toC([p.x1, p.y, p.z])[2]);
    const S = (x, y) => [x, y, p.z], col = (c, k = 'g') => tone(env, c, d, k), sw = lw(cam, d);
    let g = '';
    const br = T.lineD(cam, [S(p.x0, p.y), S(p.x1, p.y)]), br2 = T.lineD(cam, [S(p.x0, p.y - 46), S(p.x0 + (p.x1 - p.x0) * 0.55, p.y)]);
    g += `<path d="${br} ${br2}" stroke="${col('#1a1410')}" stroke-width="${f(sw * 2.4)}" fill="none" stroke-linecap="round"/>`;
    const cx = p.x0 + (p.x1 - p.x0) * 0.62, top = p.y - 6, hang = T.lineD(cam, [S(cx - 22, p.y), S(cx - 22, top - 18)]) + T.lineD(cam, [S(cx + 22, p.y), S(cx + 22, top - 18)]);
    g += `<path d="${hang}" stroke="${col('#1a1410')}" stroke-width="${f(sw)}" fill="none"/>`;
    const sh = (pts, c, k) => { const dd = T.path(cam, pts.map(([x, y]) => S(x, y))); return dd ? `<path d="${dd}" fill="${col(c, k)}" stroke="${col('#1a1008', 'n')}" stroke-width="${sw}" stroke-linejoin="round"/>` : ''; };
    const y0 = top - 18;
    if (p.sign === 'pretzel') {
      const ring = (ox, oy, r2) => T.ring([cx + ox, y0 - 60 + oy, p.z], [r2, 0, 0], [0, r2 * 0.8, 0], 14).map(q => [q[0], q[1]]);
      g += sh(ring(0, 0, 58), p.col) + sh(ring(-24, 14, 22), '#3a2a1a') + sh(ring(24, 14, 22), '#3a2a1a') + sh(ring(0, -26, 18), '#3a2a1a');
    } else if (p.sign === 'boot') {
      g += sh([[cx - 34, y0], [cx + 4, y0], [cx + 4, y0 - 70], [cx + 50, y0 - 96], [cx + 50, y0 - 118], [cx - 34, y0 - 118]], p.col);
    } else if (p.sign === 'key') {
      g += sh([[cx - 8, y0], [cx + 8, y0], [cx + 8, y0 - 90], [cx + 30, y0 - 90], [cx + 30, y0 - 104], [cx + 8, y0 - 104], [cx + 8, y0 - 116], [cx - 8, y0 - 116]], p.col);
      g += sh(T.ring([cx, y0 + 26, p.z], [26, 0, 0], [0, 26, 0], 14).map(q => [q[0], q[1]]), p.col);
    } else {
      g += sh([[cx - 46, y0], [cx + 46, y0], [cx + 46, y0 - 74], [cx - 46, y0 - 74]], p.col);
      g += sh([[cx - 30, y0 - 16], [cx + 30, y0 - 16], [cx + 30, y0 - 58], [cx - 30, y0 - 58]], '#6a2a1e');
    }
    return g;
  };

  // ------------------------------------------------------------ rendering a set of houses
  // draws all walls (far to near), then returns the street props for the depth sort
  const sunOverlay = (cam, env, H) => {
    // the lit row (the one whose front faces the low sun): warm light above the shadow line cast by the other row
    const lit = H.litSide !== undefined ? H.litSide : (H.side === env.litSide);
    if (!env.lit || !lit) return '';
    let d = '';
    const X = H.xf;
    for (let k = 0; k < H.n; k++) {
      const yb = H.Y[k], yt = H.Y[k + 1], steps = 6, top = [], bot = [];
      for (let i = 0; i <= steps; i++) { const u = H.z0 + (H.z1 - H.z0) * i / steps, hs = env.lit(u, H); if (hs >= yt) continue; bot.push(X([H.Xk(k) - H.side * 1, Math.max(yb, hs), u])); top.push(X([H.Xk(k) - H.side * 1, yt, u])); }
      if (bot.length > 1) { const pp = T.path(cam, [...bot, ...top.reverse()]); if (pp) d += pp; }
    }
    if (H.gable && env.lit(H.zm, H) < H.Y[H.n]) { const x = H.Xk(H.n - 1) - H.side; const pp = T.path(cam, [[x, H.Y[H.n], H.z0], [x, H.Y[H.n], H.z1], [x, H.Y[H.n] + H.hp, H.zm]].map(X)); if (pp) d += pp; }
    return d;
  };
  T.houses = (cam, env, list) => {
    if (G.DBG.nohouses) return { svg: '', props: [] };
    const items = list.map(o => (o._g || (o._g = houseItems(o))));
    // painter's order by straight-line distance from the lens to the middle of each front (stable while the camera turns:
    // neighbours never swap for a frame, so no wall or roof ever flickers over the house in front of it)
    const order = items.map(H => ({ H, d: cam.dist(H.xf([H.Xk(0), 300, (H.z0 + H.z1) / 2])) })).sort((a, b) => b.d - a.d);
    let g = '', sun = '';
    const props = [], lod = env.lodD || 9000;
    for (const { H } of order) {
      if (H.box.every(p => cam.toC(p)[2] < cam.near)) continue;
      // far off, the beams, windows and doors fade out (they'd be under a pixel); they never switch off in view
      const dH = cam.toC(H.xf([H.Xk(0), 300, (H.z0 + H.z1) / 2]))[2], ov = 1 - ss(lod * 0.75, lod, dH);
      for (const [L, isOver] of [[H.walls, 0], [H.over, 1]]) {
        if (isOver && ov < 0.004) continue;
        // runs of consecutive lines (or plain fills) of one look go into a single path: the same picture with far fewer
        // elements for the browser to draw (a house's lattice, shutter boards, joints, patches)
        let s = '', run = null;
        const flush = () => { if (run) { s += run.line ? `<path d="${run.d}" stroke="${run.c}" stroke-width="${run.w}" opacity="${run.o}" fill="none"/>` : `<path d="${run.d}" fill="${run.c}" opacity="${run.o}"/>`; run = null; } };
        const toRun = (line, d2, c2, w2, o2) => { if (run && run.line === line && run.c === c2 && run.w === w2 && run.o === o2) run.d += d2; else { flush(); run = { line, d: d2, c: c2, w: w2, o: o2 }; } };
        for (const it of L) {
          let c = [0, 0, 0], cnt = 0; for (const p of it.pts) { c[0] += p[0]; c[1] += p[1]; c[2] += p[2]; cnt++; }
          c = c.map(v => v / cnt);
          // (no cull by the centre: the near clip keeps whatever part of a face is still in front of the lens)
          const d = Math.max(cam.near + 1, cam.toC(c)[2]);
          // a line thinner than about half a pixel fades away with distance rather than shimmering as it moves
          if (it.segs || it.line) {
            const lo = (it.op ?? 1) * thinK(cam, d, it.sc || 1); if (lo < 0.02) continue;
            let dd = ''; if (it.segs) { for (const s2 of it.segs) dd += T.lineD(cam, s2); } else dd = T.lineD(cam, it.pts);
            if (dd) toRun(1, dd, tone(env, it.c, Math.max(cam.near + 1, dH), it.kind), f(Math.round(lw(cam, d, it.sc || 1) * 8) / 8), f(Math.round(lo * 20) / 20));
            continue;
          }
          const dd = T.path(cam, it.pts); if (!dd) continue;
          let fill = tone(env, it.c, d, it.kind);
          // window glass catches the bright sky
          if (it.glass) fill = hexOf(cmix(rgbOf(fill), rgbOf(env.skyGlass || '#8a7a9a'), 0.22));
          if (!it.ol && it.op !== undefined && it.bk) { toRun(0, dd, tone(env, it.c, Math.max(cam.near + 1, dH), it.kind), 0, it.op); continue; }
          flush();
          s += `<path d="${dd}" fill="${fill}"${it.op !== undefined && !it.ol ? ` opacity="${it.op}"` : ''}${it.ol ? ` stroke="${tone(env, '#1a120c', d, 'n')}" stroke-width="${lw(cam, d, it.sc || 1)}" stroke-linejoin="round"${it.op !== undefined ? ` opacity="${it.op}"` : ''}` : ''}/>`;
        }
        flush();
        g += isOver && ov < 0.996 ? `<g opacity="${f(ov)}">${s}</g>` : s;
      }
      sun += sunOverlay(cam, env, H);
      for (const p of H.props) props.push({ z: cam.dist([p.x1, p.y, p.z]), svg: () => signSvg(cam, env, p) });
    }
    if (sun && env.sunCol) g += `<path d="${sun}" fill="${env.sunCol}" opacity="${env.sunOp ?? 0.5}" style="mix-blend-mode:screen" filter="url(#b2)"/>`;
    return { svg: g, props };
  };

  // ------------------------------------------------------------ the street surface
  // setts in courses across the street, a gutter down the middle; individual stones near the lens, courses farther off
  T.street = (cam, env, o) => {
    const x0 = o.x0, x1 = o.x1, zA = o.z0 ?? 0, zB = o.z1;
    let g = '';
    const base = T.path(cam, [[x0, 0, zA], [x1, 0, zA], [x1, 0, zB], [x0, 0, zB]]);
    if (base) {
      // near tone at the bottom of the frame, far tone at the horizon (screen space: it slides smoothly however the camera turns)
      const hz = cam.dir([Math.sin(cam.yaw * D2R), 0, Math.cos(cam.yaw * D2R)]), yh = hz ? hz[1] : 960 + cam.fl * Math.tan(cam.pitch * D2R), id = G.RIG.uid('stg');
      g += `<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="540" y1="1920" x2="540" y2="${f(Math.min(1900, yh))}"><stop offset="0" stop-color="${tone(env, o.col || '#6a6070', 300, 'g')}"/><stop offset="1" stop-color="${tone(env, o.col || '#6a6070', Math.max(600, zB - cam.z), 'g')}"/></linearGradient></defs><path d="${base}" fill="url(#${id})"/>`;
    }
    // stones near the camera: rounded setts of three tones on the darker bedding (the gaps read as the joints), the
    // courses alone farther off (they come in as the stones fade out); a shallow gutter down the middle. Every sett has
    // its own seed and the same outline at any distance, so nothing on the cobbles changes shape as the camera moves.
    const sz = o.sz || 1, course = 15 * sz, stoneD = G.DBG.nostones ? 0 : o.stoneD ?? 760, tones = [o.stone || '#7a7080', shade2(o.stone || '#7a7080', 0.1), shade2(o.stone || '#7a7080', -0.12)];
    const zs = Math.ceil(zA / course) * course;
    for (let z = zs; z < zB; z += course) {
      const row = Math.round(z / course), dA = cam.toC([x0, 0, z])[2], dB = cam.toC([x1, 0, z])[2], dLo = Math.min(dA, dB), dHi = Math.max(dA, dB), dMid = Math.max(cam.near + 1, (dA + dB) / 2);
      if (dHi < cam.near + 2) continue;
      if (dLo < stoneD) {
        const off = (row % 2) * 9 * sz, dd = {};
        let j = 0;
        for (let x = x0 + off; x < x1 - 4; x += 17.5 * sz, j++) {
          const rr = rng(row * 7919 + j * 131 + 7), w = (14.5 + rr() * 2) * sz, h = (12 + rr() * 1.4) * sz, xx = x + rr() * 1.4, k = Math.floor(rr() * 3), cx = xx + w / 2, cz = z + h / 2;
          const d = cam.toC([cx, 0, cz])[2]; if (d < cam.near + 1 || d > stoneD) continue;
          // a worn sett: a rounded, slightly irregular outline
          const pts = []; for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2, q = 0.86 + rr() * 0.16; pts.push([cx + Math.cos(a) * w / 2 * q, 0, cz + Math.sin(a) * h / 2 * q]); }
          const p = T.path(cam, pts); if (!p) continue;
          const fo = Math.round((1 - ss(stoneD * 0.6, stoneD, d)) * 20) / 20, key = k + '|' + fo;
          dd[key] = (dd[key] || '') + p;
          // near the lens each sett shows its worn, sunlit top (a smaller, paler crown on the stone)
          if (d < 520) { const ho = Math.round((1 - ss(320, 520, d)) * fo * 20) / 20; if (ho > 0) { const hp = T.path(cam, pts.map(q => [cx + (q[0] - cx) * 0.56, 0.4, cz + (q[2] - cz) * 0.5 + h * 0.1])); if (hp) dd['h|' + ho] = (dd['h|' + ho] || '') + hp; } }
        }
        for (const key in dd) { const [k, op] = key.split('|'); if (+op > 0) g += `<path d="${dd[key]}" fill="${k === 'h' ? tone(env, shade2(tones[1], 0.22), dMid, 'g') : tone(env, tones[+k], dMid, 'g')}" opacity="${k === 'h' ? f(+op * 0.32) : op}"/>`; }
      }
      if (row % 2 === 0 && dHi > stoneD * 0.6 && dLo < 9000) {
        const op = 0.45 * ss(stoneD * 0.6, stoneD, dMid) * (1 - ss(3000, 9000, dMid)) * thinK(cam, dMid, 0.5), dd = op > 0.005 ? T.lineD(cam, [[x0, 0, z], [x1, 0, z]]) : '';
        if (dd) g += `<path d="${dd}" stroke="${tone(env, '#3a3440', dMid, 'n')}" stroke-width="${lw(cam, dMid, 0.5)}" opacity="${f(op)}" fill="none"/>`;
      }
    }
    const gt = T.path(cam, [[-26, 0.3, zA], [26, 0.3, zA], [26, 0.3, zB], [-26, 0.3, zB]]);
    if (gt) g += `<path d="${gt}" fill="${tone(env, '#2a2834', 600, 'n')}" opacity="0.13"/>`;
    // dirt and old straw gathered along the foot of the walls on both sides
    // (three nested strips give the soft edge without a blur filter)
    if (o.edges !== false) { let e = ''; for (const w of [52, 34, 18]) for (const [a, b] of [[x0, x0 + w], [x1 - w, x1]]) { const q = T.path(cam, [[a, 0.35, zA], [b, 0.35, zA], [b, 0.35, zB], [a, 0.35, zB]]); if (q) e += `<path d="${q}" fill="${tone(env, '#3a3026', 600, 'n')}" opacity="0.08"/>`; } g += e; }
    return g;
  };

  // ------------------------------------------------------------ people in the street
  // where a figure of real height hCm standing at (x, z) appears, and the rig scale that gives it that height
  T.stand = (cam, x, z, hCm, rigH) => {
    const c = cam.toC([x, 0, z]); if (c[2] < cam.near) return null;
    const p = cam.scr(c), top = cam.scr(cam.toC([x, hCm, z]));
    return { x: p[0], y: p[1], s: (p[1] - top[1]) / rigH, d: c[2] };
  };

  // ------------------------------------------------------------ things standing in the street (billboards: round things
  // look the same from any side). Each returns { z: camera depth, svg() } for the depth sort with the people.
  T.prop = (cam, env, kind, x, z, o = {}) => {
    const c = cam.toC([x, 0, z]); if (c[2] < cam.near + 10) return null;
    const p = cam.scr(c), k = cam.fl / c[2], d = c[2], col = (h, m = 'g') => tone(env, h, d, m), sw = f(clamp(1.6 * k * 0.9, 0.3, 2)), OL = `stroke="${col('#1a120c', 'n')}" stroke-width="${sw}" stroke-linejoin="round"`;
    const X = v => f(p[0] + v * k), Y = v => f(p[1] - v * k), R = v => f(v * k);
    // off screen only when its whole extent is (a big tree or the well reaches far from its foot point)
    const ext = ({ tree: 460, well: 170, bench: 100, crates: 80 })[kind] || 60, top = ({ tree: (o.h || 900) * 1.1, well: 380 })[kind] || 130;
    if (p[0] + ext * k < -20 || p[0] - ext * k > 1100 || p[1] - top * k > 1940 || p[1] + 40 * k < -20) return null;
    let g = '';
    const shadow = `<ellipse cx="${X(0)}" cy="${Y(0)}" rx="${R(o.w || 40)}" ry="${R((o.w || 40) * 0.28)}" fill="#0a0610" opacity="0.35" filter="url(#b4)"/>`;
    if (kind === 'barrel') {
      const w = 34, h = 92, bc = o.col || '#7a5232';
      g += shadow + `<path d="M${X(-w)},${Y(4)} C${X(-w - 8)},${Y(h * 0.5)} ${X(-w - 8)},${Y(h * 0.5)} ${X(-w)},${Y(h - 4)} L${X(w)},${Y(h - 4)} C${X(w + 8)},${Y(h * 0.5)} ${X(w + 8)},${Y(h * 0.5)} ${X(w)},${Y(4)}Z" fill="${col(bc)}" ${OL}/>`;
      for (const v of [0.18, 0.5, 0.82]) g += `<path d="M${X(-w - (v === 0.5 ? 7 : 4))},${Y(h * v)} L${X(w + (v === 0.5 ? 7 : 4))},${Y(h * v)}" stroke="${col('#2a2420')}" stroke-width="${R(5)}"/>`;
      for (const u of [-0.5, 0, 0.5]) g += `<path d="M${X(w * u)},${Y(6)} L${X(w * u)},${Y(h - 6)}" stroke="${col('#3a2414')}" stroke-width="${R(1.2)}" opacity="0.5"/>`;
      g += `<ellipse cx="${X(0)}" cy="${Y(h - 4)}" rx="${R(w)}" ry="${R(8)}" fill="${col(G.RIG.shade(bc, 0.12))}" ${OL}/>`;
    } else if (kind === 'pot') {
      const w = o.w || 26, fc = o.flower || '#c8302a';
      g += shadow + `<path d="M${X(-w)},${Y(46)} L${X(w)},${Y(46)} L${X(w * 0.72)},${Y(0)} L${X(-w * 0.72)},${Y(0)}Z" fill="${col('#a85a3a')}" ${OL}/>`;
      const r = rng(Math.round(x * 3 + z));
      for (let i = 0; i < 9; i++) { const a = -0.9 + r() * 1.8, rr = 9 + r() * 7; g += `<circle cx="${X(Math.sin(a) * w * 0.9)}" cy="${Y(52 + Math.cos(a) * 22 + r() * 10)}" r="${R(rr)}" fill="${col(i % 3 ? '#3e6a2c' : fc)}" ${OL}/>`; }
    } else if (kind === 'crates') {
      const w = 46;
      g += shadow;
      for (const [dx, dy, s] of [[-26, 0, 1], [28, 0, 0.9], [0, 52, 0.9]]) { const ww = w * s; g += `<rect x="${X(dx - ww / 2)}" y="${Y(dy + ww)}" width="${R(ww)}" height="${R(ww)}" fill="${col('#8a6440')}" ${OL}/><path d="M${X(dx - ww / 2)},${Y(dy + ww / 2)} L${X(dx + ww / 2)},${Y(dy + ww / 2)} M${X(dx - ww / 2)},${Y(dy + ww)} L${X(dx + ww / 2)},${Y(dy)}" stroke="${col('#4a3018')}" stroke-width="${R(2)}"/>`; }
      g += `<g>${[[-20, 104], [-4, 110], [12, 106]].map(([a, b]) => `<circle cx="${X(a)}" cy="${Y(b)}" r="${R(9)}" fill="${col(o.fruit || '#c84a2a')}" ${OL}/>`).join('')}</g>`;
    } else if (kind === 'bench') {
      g += shadow + `<rect x="${X(-90)}" y="${Y(48)}" width="${R(180)}" height="${R(10)}" fill="${col('#7a5634')}" ${OL}/>` + [-74, 74].map(u => `<rect x="${X(u - 5)}" y="${Y(46)}" width="${R(10)}" height="${R(46)}" fill="${col('#5a3a20')}" ${OL}/>`).join('');
    } else if (kind === 'well') {
      // the town well: a round stone curb, two posts, a little shingled roof, the winch and its bucket
      const w = 120;
      g += `<ellipse cx="${X(0)}" cy="${Y(0)}" rx="${R(w * 1.3)}" ry="${R(w * 0.3)}" fill="#0a0610" opacity="0.35" filter="url(#b8)"/>`;
      g += `<path d="M${X(-w)},${Y(90)} L${X(-w)},${Y(0)} Q${X(0)},${Y(-22)} ${X(w)},${Y(0)} L${X(w)},${Y(90)}Z" fill="${col('#9a8e80')}" ${OL}/>`;
      for (let i = 0; i < 3; i++) for (let j = 0; j < 6; j++) g += `<path d="M${X(-w + (j + (i % 2) * 0.5) * w / 3)},${Y(i * 30)} l0,${R(-30)}" stroke="${col('#5a5048')}" stroke-width="${R(1.5)}" opacity="0.6"/>`;
      g += `<ellipse cx="${X(0)}" cy="${Y(90)}" rx="${R(w)}" ry="${R(24)}" fill="${col('#b0a494')}" ${OL}/><ellipse cx="${X(0)}" cy="${Y(90)}" rx="${R(w * 0.8)}" ry="${R(17)}" fill="${col('#1a1416', 'n')}"/>`;
      for (const u of [-w * 0.86, w * 0.86]) g += `<rect x="${X(u - 8)}" y="${Y(290)}" width="${R(16)}" height="${R(200)}" fill="${col('#5a3a22')}" ${OL}/>`;
      g += `<path d="M${X(-w * 0.86)},${Y(232)} L${X(w * 0.86)},${Y(232)}" stroke="${col('#4a2e18')}" stroke-width="${R(10)}"/><path d="M${X(0)},${Y(232)} L${X(0)},${Y(150)}" stroke="${col('#2a2018')}" stroke-width="${R(2)}"/><path d="M${X(-16)},${Y(150)} L${X(16)},${Y(150)} L${X(13)},${Y(122)} L${X(-13)},${Y(122)}Z" fill="${col('#6a4a2a')}" ${OL}/>`;
      g += `<path d="M${X(-w * 1.25)},${Y(270)} L${X(0)},${Y(360)} L${X(w * 1.25)},${Y(270)} L${X(w * 1.25)},${Y(282)} L${X(0)},${Y(374)} L${X(-w * 1.25)},${Y(282)}Z" fill="${col('#5a3a30')}" ${OL}/>`;
      for (let i = 1; i < 4; i++) g += `<path d="M${X(-w * 1.25 * (1 - i / 4))},${Y(270 + 90 * i / 4)} L${X(w * 1.25 * (1 - i / 4))},${Y(270 + 90 * i / 4)}" stroke="${col('#2a1a14')}" stroke-width="${R(1.6)}" opacity="0.5"/>`;
    } else if (kind === 'tree') {
      // a linden: a dark trunk and a great round crown of leaf clusters, sunlit on one side
      const H = o.h || 900, r = rng(o.seed || 9), lc = o.leaf || '#4a6a32';
      g += `<ellipse cx="${X(0)}" cy="${Y(0)}" rx="${R(260)}" ry="${R(60)}" fill="#0a0610" opacity="0.3" filter="url(#b8)"/>`;
      g += `<path d="M${X(-30)},${Y(0)} C${X(-24)},${Y(H * 0.3)} ${X(-40)},${Y(H * 0.5)} ${X(-90)},${Y(H * 0.62)} L${X(-70)},${Y(H * 0.66)} C${X(-20)},${Y(H * 0.56)} ${X(0)},${Y(H * 0.55)} ${X(20)},${Y(H * 0.7)} L${X(36)},${Y(H * 0.66)} C${X(26)},${Y(H * 0.5)} ${X(24)},${Y(H * 0.3)} ${X(32)},${Y(0)}Z" fill="${col('#3a2a20')}" ${OL}/>`;
      // leaf masses: lumpy clusters (irregular outlines built from many small lobes), dark inside and below, lit on
      // the sun's side, with sky holes and single leaves breaking the edge
      const cl = [], sunX = o.sunX ?? 1;
      for (let i = 0; i < 30; i++) { const a = r() * Math.PI * 2, rr = Math.sqrt(r()), cx = Math.cos(a) * 310 * rr, cy = H * 0.74 + Math.sin(a) * 240 * rr, s = 60 + r() * 55; cl.push([cx, cy, s, r() * 9]); }
      cl.sort((a, b) => b[1] - a[1] || a[0] - b[0]);
      // a smooth lumpy outline: points at random radii joined by curves through their midpoints
      const lobe = (cx, cy, s, sd2) => { const rr2 = rng(Math.round(sd2 * 1000)), N = 11, pts = []; for (let i = 0; i < N; i++) { const a = i / N * Math.PI * 2, q = s * (0.78 + rr2() * 0.34); pts.push([cx + Math.cos(a) * q, cy + Math.sin(a) * q * 0.86]); } const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; let m = mid(pts[N - 1], pts[0]), d2 = 'M' + X(m[0]) + ',' + Y(m[1]); for (let i = 0; i < N; i++) { const p2 = pts[i], m2 = mid(p2, pts[(i + 1) % N]); d2 += `Q${X(p2[0])},${Y(p2[1])} ${X(m2[0])},${Y(m2[1])}`; } return d2 + 'Z'; };
      g += `<path d="${cl.map(q => lobe(q[0], q[1] - 30, q[2] * 1.05, q[3] + 1)).join('')}" fill="${col(G.RIG.shade(lc, -0.42))}"/>`;
      for (const [cx, cy, s, sd2] of cl) { const k = Math.max(-1, Math.min(1, cx * sunX / 260 + (cy - H * 0.74) / 400)); g += `<path d="${lobe(cx, cy, s, sd2)}" fill="${col(G.RIG.shade(lc, k * 0.2 - 0.04))}"/>`; }
      g += `<g opacity="0.7">${cl.filter(q => q[0] * sunX > -40).map(([cx, cy, s, sd2]) => `<path d="${lobe(cx + s * 0.18 * sunX, cy + s * 0.2, s * 0.5, sd2 + 3)}" fill="${col(G.RIG.shade(lc, 0.3))}"/>`).join('')}</g>`;
    }
    return { z: cam.dist([x, 40, z]), svg: () => g };
  };

  // washing hung on a line across the street between upper windows (sags, cloths swing a little): depth-sorted
  T.washing = (cam, env, o, t) => {
    const ya = o.y, sag = o.sag ?? 60, N = 14, pts = [];
    for (let i = 0; i <= N; i++) { const u = i / N, x = o.x0 + (o.x1 - o.x0) * u, y = ya - sag * 4 * u * (1 - u); pts.push([x, y, o.z]); }
    // drawn while any of it is in front of the lens (the near clip trims the rest): it never blinks out overhead
    if (pts.every(p => cam.toC(p)[2] < cam.near)) return null;
    const d = Math.max(cam.near + 10, cam.toC([0, ya, o.z])[2]), k = cam.fl / d, line = T.lineD(cam, pts);
    let g = line ? `<path d="${line}" stroke="${tone(env, '#2a2420', d, 'n')}" stroke-width="${f(clamp(k * 1.4, 0.4, 2))}" fill="none"/>` : '';
    const r = rng(o.seed || 3);
    for (const cl of o.cloths) {
      const u = cl.u, x = o.x0 + (o.x1 - o.x0) * u, y = ya - sag * 4 * u * (1 - u), w = cl.w, h = cl.h, sw2 = Math.sin(t * 1.3 + u * 7) * 6 * (cl.swing ?? 1);
      const pp = T.path(cam, [[x - w / 2, y, o.z], [x + w / 2, y, o.z], [x + w / 2 + sw2, y - h, o.z + sw2 * 0.5], [x - w / 2 + sw2, y - h, o.z + sw2 * 0.5]]);
      if (pp) g += `<path d="${pp}" fill="${tone(env, cl.col, d, 'g')}" stroke="${tone(env, '#2a2420', d, 'n')}" stroke-width="${f(clamp(k, 0.3, 1.6))}" stroke-linejoin="round"/>`;
      r();
    }
    return { z: cam.dist([0, ya, o.z]), svg: () => g };
  };

  // chimney smoke: soft puffs rising and leaning on the breeze (world point at the chimney top)
  T.smoke = (cam, P, t, o = {}) => {
    // (thins out as the lens comes up to it, the way smoke does when you pass through it, instead of vanishing)
    const c = cam.toC(P), near = ss(cam.near + 50, cam.near + 450, c[2]); if (near <= 0) return '';
    const k = cam.fl / c[2], p = cam.scr(c);
    let g = '';
    for (let i = 0; i < 6; i++) { const a = ((t * 0.35 + i / 6) % 1), x = p[0] + a * 300 * k * (o.lean ?? 1), y = p[1] - a * 900 * k, r = (40 + a * 180) * k; g += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${o.col || '#d8c8d0'}" opacity="${(0.22 * (1 - a) * Math.min(1, a * 6) * near).toFixed(3)}"/>`; }
    return g ? `<g filter="url(#smokeF)">${g}</g>` : '';
  };

  // shafts of low sunlight through an opening (world quad at the opening, the direction the light travels): soft beams
  T.beams = (cam, src, dirL, len, col, op) => {
    let g = '';
    for (const [a, b, w] of src) {
      const A2 = [a[0] + dirL[0] * len, a[1] + dirL[1] * len, a[2] + dirL[2] * len], B2 = [b[0] + dirL[0] * len, b[1] + dirL[1] * len, b[2] + dirL[2] * len];
      const pp = T.path(cam, [a, b, B2, A2]); if (!pp) continue;
      // the fade runs along the beam's middle from its source to its end, or to where it passes the lens (found along
      // the beam itself, so the gradient slides smoothly instead of jumping when the end goes behind the camera)
      const M0 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], M1 = [(A2[0] + B2[0]) / 2, (A2[1] + B2[1]) / 2, (A2[2] + B2[2]) / 2];
      const d0 = cam.toC(M0)[2], d1 = cam.toC(M1)[2], lim = cam.near + 20; if (d0 < lim) continue;
      const u = d1 >= lim ? 1 : (d0 - lim) / (d0 - d1), p0 = cam.scr(cam.toC(M0)), p1 = cam.scr(cam.toC(M0.map((v, i) => v + (M1[i] - v) * u)));
      const id = G.RIG.uid('bm');
      g += `<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${f(p0[0])}" y1="${f(p0[1])}" x2="${f(p1[0])}" y2="${f(p1[1])}"><stop offset="0" stop-color="${col}" stop-opacity="${f(op * w)}"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></linearGradient></defs><path d="${pp}" fill="url(#${id})"/>`;
    }
    return g ? `<g style="mix-blend-mode:screen" filter="url(#b14)">${g}</g>` : '';
  };

  // ------------------------------------------------------------ the sky (screen space, anchored to the horizon)
  // env.sky: stops from the horizon up [[px above the horizon, colour]...]; the sun at env.sunDir; banks of cloud lit
  // from below; birds wheeling (t: seconds)
  T.sky = (cam, env, t) => {
    const hz = cam.dir([Math.sin(cam.yaw * D2R), 0, Math.cos(cam.yaw * D2R)]), yh = hz ? hz[1] : 960 + cam.fl * Math.tan(cam.pitch * D2R), id = G.RIG.uid('sk');
    const st = env.sky, top = st[st.length - 1][0];
    let g = `<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="${f(yh)}" x2="0" y2="${f(yh - top)}">${st.map(([h, c]) => `<stop offset="${f(h / top)}" stop-color="${c}"/>`).join('')}</linearGradient></defs><rect x="-50" y="-50" width="1180" height="2020" fill="url(#${id})"/>`;
    const sp = cam.dir(env.sunDir);
    if (sp) {
      const R = cam.fl * 0.035;
      g += G.CINE.radial(sp[0], sp[1], R * 22, env.sunGlow || '#ffb070', 0.55, 'screen') + G.CINE.radial(sp[0], sp[1], R * 7, '#fff0c8', 0.7, 'screen');
      g += `<circle cx="${f(sp[0])}" cy="${f(sp[1])}" r="${f(R)}" fill="#fff8e4"/>`;
    }
    // cloud banks: soft, wide, lit from below by the low sun
    for (const c of (G.DBG.noclouds ? [] : env.clouds || [])) {
      const p = cam.dir([Math.sin(c.az * D2R) * Math.cos(c.el * D2R), Math.sin(c.el * D2R), Math.cos(c.az * D2R) * Math.cos(c.el * D2R)]); if (!p) continue;
      const w = cam.fl * c.w * D2R, h = cam.fl * c.h * D2R, x = p[0] + (t || 0) * (c.drift || 4);
      // a bank built of several puffs, lit along its underside
      g += `<g filter="url(#cloudF)" opacity="${c.op ?? 0.8}"><ellipse cx="${f(x)}" cy="${f(p[1])}" rx="${f(w)}" ry="${f(h)}" fill="${c.col}"/>` +
        [[-0.42, -0.55, 0.38, 0.9], [0.18, -0.75, 0.42, 1.0], [0.55, -0.35, 0.3, 0.75], [-0.1, -0.95, 0.24, 0.7]].map(([dx, dy, sw, sh]) => `<ellipse cx="${f(x + w * dx)}" cy="${f(p[1] + h * dy)}" rx="${f(w * sw)}" ry="${f(h * sh)}" fill="${c.col}"/>`).join('') +
        `<ellipse cx="${f(x + w * 0.1)}" cy="${f(p[1] + h * 0.45)}" rx="${f(w * 0.8)}" ry="${f(h * 0.4)}" fill="${c.lit}"/><ellipse cx="${f(x - w * 0.3)}" cy="${f(p[1] + h * 0.2)}" rx="${f(w * 0.35)}" ry="${f(h * 0.3)}" fill="${c.lit}" opacity="0.7"/></g>`;
    }
    if (env.birds) {
      const r = rng(5); let d = '';
      for (let i = 0; i < env.birds; i++) {
        const az = -30 + r() * 60 + (t || 0) * (2 + r() * 2), el = 14 + r() * 16 + Math.sin((t || 0) * 0.6 + i) * 1.2, p = cam.dir([Math.sin(az * D2R), Math.sin(el * D2R), Math.cos(az * D2R)]);
        // (its size is drawn before the test: a bird off screen must not shift the next birds' numbers)
        const s = cam.fl * 0.006 * (0.7 + r() * 0.6), fl2 = Math.sin((t || 0) * 9 + i * 1.7) * 0.6; if (!p) continue;
        d += `M${f(p[0] - s)},${f(p[1] - s * fl2)} Q${f(p[0] - s * 0.4)},${f(p[1] - s * 0.3)} ${f(p[0])},${f(p[1])} Q${f(p[0] + s * 0.4)},${f(p[1] - s * 0.3)} ${f(p[0] + s)},${f(p[1] - s * fl2)}`;
      }
      g += `<path d="${d}" stroke="#2a2030" stroke-width="2" fill="none" opacity="0.7"/>`;
    }
    return g;
  };

  // far country: rolling hills as silhouettes on the horizon (world arcs far away), lighter and hazier with distance
  T.hills = (cam, env, rows) => {
    let g = '';
    for (const h of rows) {
      const pts = [], N = 48;
      for (let i = 0; i <= N; i++) { const x = h.x0 + (h.x1 - h.x0) * i / N, y = h.y + h.amp * (0.6 * Math.sin(x * h.f1 + h.ph) + 0.4 * Math.sin(x * h.f2 + h.ph * 2.1)) + (h.bump ? h.bump(x) : 0); pts.push([x, Math.max(-50, y), h.z]); }
      pts.push([h.x1, -200, h.z], [h.x0, -200, h.z]);
      const d = T.path(cam, pts); if (d) g += `<path d="${d}" fill="${tone(env, h.col, h.z - cam.z, 'n')}"/>`;
    }
    return g;
  };

  // ------------------------------------------------------------ a church tower facing the camera (plane z), its spire
  // o.front: the west front of the church under it (a portal and a rose window)
  T.tower = (cam, env, o) => {
    const d = o.z - cam.z; if (cam.toC([o.x, o.h, o.z])[2] < cam.near) return '';
    const hw = o.w / 2, x = o.x, z = o.z, H = o.h, col = (c, k = 's') => tone(env, c, d, k), sw = lw(cam, d), OL = `stroke="${col('#2a2020', 'n')}" stroke-width="${sw}" stroke-linejoin="round"`;
    const P = (pts, c, k) => { const p = T.path(cam, pts); return p ? `<path d="${p}" fill="${col(c, k)}" ${OL}/>` : ''; };
    let g = '';
    if (o.front) {
      const fw = o.w * 1.9, fh = H * 0.42;
      g += P([[x - fw / 2, 0, z + 40], [x + fw / 2, 0, z + 40], [x + fw / 2, fh, z + 40], [x, fh + fw * 0.45, z + 40], [x - fw / 2, fh, z + 40]], o.col);
      g += P(T.ring([x, fh * 0.72, z + 38], [fw * 0.14, 0, 0], [0, fw * 0.14, 0], 18), '#5a4a6a', 'n');
    }
    g += P([[x - hw, 0, z], [x + hw, 0, z], [x + hw, H, z], [x - hw, H, z]], o.col);
    let cs = ''; for (const k of [0.32, 0.58, 0.8]) cs += T.lineD(cam, [[x - hw, H * k, z - 2], [x + hw, H * k, z - 2]]);
    if (cs) g += `<path d="${cs}" stroke="${col('#5a4a40')}" stroke-width="${f(sw * 2)}" fill="none"/>`;
    // belfry lancets, a clock
    for (const s of [-1, 1]) { const lx = x + s * hw * 0.32, y0 = H * 0.83, pts = [[lx - hw * 0.12, y0, z - 2], [lx + hw * 0.12, y0, z - 2], [lx + hw * 0.12, y0 + H * 0.1, z - 2], [lx, y0 + H * 0.135, z - 2], [lx - hw * 0.12, y0 + H * 0.1, z - 2]]; g += P(pts, '#1a1620', 'n'); }
    g += P(T.ring([x, H * 0.7, z - 3], [hw * 0.24, 0, 0], [0, hw * 0.24, 0], 18), '#e8dcc0', 'g');
    const hand = T.lineD(cam, [[x, H * 0.7, z - 4], [x + hw * 0.12, H * 0.7 + hw * 0.08, z - 4]]) + T.lineD(cam, [[x, H * 0.7, z - 4], [x - hw * 0.03, H * 0.7 + hw * 0.18, z - 4]]);
    if (hand) g += `<path d="${hand}" stroke="${col('#1a1416', 'n')}" stroke-width="${f(sw * 1.6)}" fill="none"/>`;
    // the spire, with corner pinnacles, a ball and a weathercock
    const sp = o.spire;
    g += P([[x - hw - 30, H, z - 20], [x + hw + 30, H, z - 20], [x, H + sp, z + hw]], o.roof || '#4a5a6a', 'r');
    for (const s of [-1, 1]) g += P([[x + s * hw - 40, H, z - 25], [x + s * hw + 40, H, z - 25], [x + s * hw, H + sp * 0.22, z - 25]], o.roof || '#4a5a6a', 'r');
    const top = T.lineD(cam, [[x, H + sp, z + hw], [x, H + sp + 240, z + hw]]); if (top) g += `<path d="${top}" stroke="${col('#2a2420', 'n')}" stroke-width="${f(sw * 2.2)}"/>`;
    return g;
  };

  // ------------------------------------------------------------ the town gate (a tower across the end of the street)
  // its front in the plane z = zG facing the camera; a pointed arch through it (the passage walls go back DEP), a
  // raised portcullis, the steep roof and the town wall running off both ways. Backlit at dawn: dark, rimmed with light.
  T.gate = (cam, env, o) => {
    const zG = o.z, hw = o.w / 2, H = o.h, aw = o.aw / 2, ah = o.ah, DEP = o.dep ?? 420, d = zG - cam.z;
    if (cam.toC([0, H, zG])[2] < cam.near) return '';
    const col = c => tone(env, c, d, 's'), sw = lw(cam, d);
    const archPts = (z, inset = 0) => { const pts = [[-aw + inset, 0, z]]; for (let i = 0; i <= 12; i++) { const a = Math.PI / 2 * i / 12; pts.push([-aw + inset + (aw - inset) * (1 - Math.cos(a)) * 1.0, ah * 0.62 + (ah * 0.38 - inset) * Math.sin(a), z]); } for (let i = 11; i >= 0; i--) { const a = Math.PI / 2 * i / 12; pts.push([aw - inset - (aw - inset) * (1 - Math.cos(a)), ah * 0.62 + (ah * 0.38 - inset) * Math.sin(a), z]); } pts.push([aw - inset, 0, z]); return pts; };
    let g = '';
    // the town wall either side, with a walk and crenels
    for (const s of [-1, 1]) {
      const wx0 = s * hw, wx1 = s * (hw + 4200), wh = o.wallH ?? 900;
      const wall = T.path(cam, [[wx0, 0, zG + 60], [wx1, 0, zG + 60], [wx1, wh, zG + 60], [wx0, wh, zG + 60]]);
      if (wall) g += `<path d="${wall}" fill="${col('#7a6a66')}" stroke="${col('#2a2020')}" stroke-width="${sw}"/>` + (o.lit ? `<path d="${wall}" fill="${env.sunCol}" opacity="${o.lit}" style="mix-blend-mode:screen"/>` : '');
      // stone courses on the wall, a few lighter blocks, ivy where it meets the ground
      if (o.lit) { let cl2 = ''; for (let y = 70; y < wh; y += 70) cl2 += T.lineD(cam, [[wx0, y, zG + 59], [wx1, y, zG + 59]]); if (cl2) g += `<path d="${cl2}" stroke="${col('#3a2c2a')}" stroke-width="${f(sw * 0.5)}" opacity="0.4" fill="none"/>`; }
      let cr = '';
      for (let x = hw + 40; x < hw + 4200; x += 120) { const p = T.path(cam, [[s * x, wh, zG + 60], [s * (x + 70), wh, zG + 60], [s * (x + 70), wh + 80, zG + 60], [s * x, wh + 80, zG + 60]]); if (p) cr += p; }
      if (cr) g += `<path d="${cr}" fill="${col('#6a5a58')}" stroke="${col('#2a2020')}" stroke-width="${f(sw * 0.7)}"/>`;
    }
    // the passage walls inside the arch (seen in perspective) and its vault, lit from the far end
    for (const s of [-1, 1]) { const p = T.path(cam, [[s * aw, 0, zG], [s * aw, 0, zG + DEP], [s * aw, ah * 0.62, zG + DEP], [s * aw, ah * 0.62, zG]]); if (p) g += `<path d="${p}" fill="${tone(env, '#6a5550', d, 'g')}"/>`; }
    // the tower front with the arch cut through it
    const front = T.path(cam, [[-hw, 0, zG], [hw, 0, zG], [hw, H, zG], [-hw, H, zG]]), hole = T.path(cam, archPts(zG));
    if (front && hole) g += `<path d="${front} ${hole}" fill-rule="evenodd" fill="${col(o.col || '#8a7870')}" stroke="${col('#2a2020')}" stroke-width="${sw}"/>`;
    // seen from outside with the sun behind the viewer, the tower's face is in full light; its stones show
    if (o.lit && front && hole) {
      g += `<path d="${front} ${hole}" fill-rule="evenodd" fill="${env.sunCol}" opacity="${o.lit}" style="mix-blend-mode:screen"/>`;
      const rs = rng(17); let st = '', st2 = '';
      for (let y = 0; y < H - 40; y += 46) for (let x = -hw + ((y / 46) % 2) * 40; x < hw - 20; x += 80 + rs() * 30) {
        if (Math.abs(x) < aw + 50 && y < ah + 60) continue;
        // (every block draws its numbers whether or not it is on screen: a block leaving the frame used to shift the
        // stream, and every block's tone and width re-shuffled in one frame)
        const w2 = 60 + rs() * 30, dark = rs() < 0.3, p = T.path(cam, [[x, y + 3, zG - 1], [x + w2, y + 3, zG - 1], [x + w2, y + 43, zG - 1], [x, y + 43, zG - 1]]);
        if (p) { if (dark) st2 += p; else st += p; }
      }
      if (st) g += `<path d="${st}" fill="none" stroke="${col('#5a4a40')}" stroke-width="${f(sw * 0.5)}" opacity="0.5"/>`;
      if (st2) g += `<path d="${st2}" fill="${col('#6a5a50')}" opacity="0.18"/>`;
      const stain = T.path(cam, [[-hw, 0, zG - 1], [hw, 0, zG - 1], [hw, 140, zG - 1], [-hw, 140, zG - 1]]); if (stain) g += `<path d="${stain}" fill="#3a3028" opacity="0.18"/>`;
    }
    // stone courses and a few blocks
    let cs = '';
    for (let y = 60; y < H; y += 60) { const L = T.lineD(cam, [[-hw, y, zG - 1], [hw, y, zG - 1]]); if (L) cs += L; }
    if (cs) g += `<path d="${cs}" stroke="${col('#3a2c2a')}" stroke-width="${f(sw * 0.5)}" opacity="0.45" fill="none"/>`;
    // the voussoirs round the arch
    const ring = archPts(zG - 2, -46), ringIn = archPts(zG - 2, 0), rp = T.path(cam, [...ring, ...ringIn.reverse()]);
    if (rp) g += `<path d="${rp}" fill="${col('#9a8a80')}" stroke="${col('#2a2020')}" stroke-width="${f(sw * 0.8)}"/>`;
    // the portcullis, raised: its iron teeth hang just inside the top of the arch
    let pc = '';
    for (let x = -aw + 20; x < aw - 10; x += 34) { const top = ah * 0.62 + Math.sqrt(Math.max(0, 1 - (x / aw) ** 2)) * ah * 0.3; pc += T.lineD(cam, [[x, top, zG + 30], [x, top - 70, zG + 30]]); }
    if (pc) g += `<path d="${pc}" stroke="${tone(env, '#1a1414', d, 'n')}" stroke-width="${f(sw * 3)}" fill="none"/>`;
    // windows (arrow slits) and the clock / a coat of arms
    for (const [x, y] of [[-180, H * 0.62], [180, H * 0.62], [0, H * 0.8]]) { const p = T.path(cam, [[x - 14, y, zG - 1], [x + 14, y, zG - 1], [x + 14, y + 110, zG - 1], [x - 14, y + 110, zG - 1]]); if (p) g += `<path d="${p}" fill="${o.litSlits ? '#f0b060' : tone(env, '#1a1416', d, 'n')}"/>`; }
    // the town's arms over the arch: a red shield with the white mill-iron of Hamelin
    const shY = ah + 70, SHP = [[-74, shY + 160], [74, shY + 160], [74, shY + 70], [52, shY + 18], [0, shY - 14], [-52, shY + 18], [-74, shY + 70]].map(([x, y]) => [x, y, zG - 2]);
    const shp = T.path(cam, SHP); if (shp) g += `<path d="${shp}" fill="${tone(env, '#9a2a24', d, 's')}" stroke="${col('#2a2020')}" stroke-width="${sw}" stroke-linejoin="round"/>`;
    const mi = T.lineD(cam, [[0, shY + 132, zG - 3], [0, shY + 22, zG - 3]]) + T.lineD(cam, [[-36, shY + 78, zG - 3], [36, shY + 78, zG - 3]]) + T.lineD(cam, [[-36, shY + 78, zG - 3], [-46, shY + 98, zG - 3]]) + T.lineD(cam, [[36, shY + 78, zG - 3], [46, shY + 98, zG - 3]]) + T.lineD(cam, [[-14, shY + 132, zG - 3], [14, shY + 132, zG - 3]]);
    if (mi) g += `<path d="${mi}" stroke="${tone(env, '#f0e8d8', d, 's')}" stroke-width="${f(Math.max(1, sw * 4.5))}" stroke-linecap="round" fill="none"/>`;
    // the stones of the tower show in its shade too
    if (!o.lit && front) { const rs = rng(17); let st = ''; for (let y = 0; y < H - 40; y += 46) for (let x = -hw + ((y / 46) % 2) * 40; x < hw - 20; x += 80 + rs() * 30) { if (Math.abs(x) < aw + 50 && y < ah + 60) continue; if (Math.abs(x) < 90 && y > shY - 30 && y < shY + 180) continue; const w2 = 60 + rs() * 30, p = T.path(cam, [[x, y + 3, zG - 1], [x + w2, y + 3, zG - 1], [x + w2, y + 43, zG - 1], [x, y + 43, zG - 1]]); if (p) st += p; } if (st) g += `<path d="${st}" fill="none" stroke="${col('#4a3a3a')}" stroke-width="${f(sw * 0.45)}" opacity="0.35"/>`; }
    // the steep roof: a hipped pyramid with a little spire and a weathervane
    const ry = H, roofH = o.roofH ?? 900;
    const roofL = T.path(cam, [[-hw - 50, ry, zG - 40], [hw + 50, ry, zG - 40], [0, ry + roofH, zG + o.depth / 2]]);
    if (roofL) g += `<path d="${roofL}" fill="${tone(env, o.roof || '#5a4048', d, 'r')}" stroke="${col('#1a1416')}" stroke-width="${sw}"/>`;
    let tl = ''; for (let i = 1; i < 8; i++) { const k = i / 8, y = ry + roofH * k, x = (hw + 50) * (1 - k), z = zG - 40 + (o.depth / 2 + 40) * k; tl += T.lineD(cam, [[-x, y, z], [x, y, z]]); }
    if (tl) g += `<path d="${tl}" stroke="${col('#2a2028')}" stroke-width="${f(sw * 0.6)}" opacity="0.5" fill="none"/>`;
    const sp = T.lineD(cam, [[0, ry + roofH, zG + o.depth / 2], [0, ry + roofH + 260, zG + o.depth / 2]]); if (sp) g += `<path d="${sp}" stroke="${col('#2a2028')}" stroke-width="${f(sw * 2.4)}"/>`;
    return g;
  };
})(window);
