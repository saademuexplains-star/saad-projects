// Engine: keyframes, multiplane camera, shot timeline, transitions, grade and post.
(function (G) {
  const W = 1080, H = 1920, FPS = 60;
  const { f, uid, rng } = G.RIG, C = G.CINE;
  const X = { W, H, FPS, shots: [], trans: [] };
  G.DBG = Object.fromEntries([...new URLSearchParams(location.search).keys()].map(k => [k, 1]));
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t;
  X.clamp = clamp; X.lerp = lerp;
  const EZ = {
    lin: x => x, in: x => x * x * x, out: x => 1 - Math.pow(1 - x, 3), in2: x => x * x, out2: x => 1 - (1 - x) * (1 - x),
    io: x => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2,
    sine: x => -(Math.cos(Math.PI * x) - 1) / 2,
    expo: x => x >= 1 ? 1 : 1 - Math.pow(2, -10 * x),
    back: x => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
  };
  X.EZ = EZ;
  X.ss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  // keyframe track; the ease named on a key shapes the segment that arrives at that key (default io)
  X.track = keys => t => {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) {
      const [t0, v0] = keys[i - 1], [t1, v1, e] = keys[i], u = (EZ[e || 'io'])((t - t0) / (t1 - t0));
      return Array.isArray(v0) ? v0.map((a, j) => lerp(a, v1[j], u)) : lerp(v0, v1, u);
    }
    return keys[keys.length - 1][1];
  };
  // smooth pseudo-noise for handheld drift / trembling
  X.noise = (t, seed = 0) => Math.sin(t * 1.31 + seed) * 0.5 + Math.sin(t * 2.17 + seed * 2.3) * 0.3 + Math.sin(t * 3.73 + seed * 4.1) * 0.2;
  X.hand = (t, amp = 1, seed = 0) => [X.noise(t, seed) * 6 * amp, X.noise(t, seed + 9) * 6 * amp, X.noise(t * 0.7, seed + 3) * 0.25 * amp];

  // camera c = [x, y, z, rot]: the world point at the screen centre, zoom, roll (deg). p = layer depth factor
  X.layerT = (c, p) => {
    const [cx, cy, z, r = 0] = c, zp = Math.pow(z, p), px = 540 + (cx - 540) * p, py = 960 + (cy - 960) * p;
    return `translate(540,960) rotate(${f(r * Math.min(1, p))}) scale(${f(zp * 1000) / 1000}) translate(${f(-px)},${f(-py)})`;
  };
  X.compose = (layers, cam) => layers.map(L => L && L.svg && !(G.DBG.noset && !L.chars) ? `<g transform="${X.layerT(cam, L.p)}">${L.svg}</g>` : '').join('');
  // insert character layer(s) in front of the set's mid layers but behind its foreground (p > 1.05)
  X.stage = (set, chars, p = 1) => { const i = set.findIndex(L => L.p > 1.05 && !L.light); const c = { p, svg: chars, chars: true }; return i < 0 ? [...set, c] : [...set.slice(0, i), c, ...set.slice(i)]; };
  X.VEXP = 1; X.CAM = null;
  // world rect visible on layer depth p under the current camera (padded; widened during transitions)
  X.viewRect = (p = 1) => {
    if (!X.CAM) return null;
    const [cx, cy, z, r = 0] = X.CAM, zp = Math.pow(z, p), px = 540 + (cx - 540) * p, py = 960 + (cy - 960) * p;
    const k = X.VEXP * (1 + Math.min(0.4, Math.abs(r) * 0.03)), hw = 540 / zp * k + 70, hh = 960 / zp * k + 70;
    return [px - hw, py - hh, px + hw, py + hh];
  };
  X.lit = (P, L, p = 1) => { if (G.DBG.nochars) return ''; if (G.DBG.nolit) return P.svg; const r = C.lit(P, Object.assign({ view: X.viewRect(p) }, L)); return r.cast + r.body; };

  X.shot = (id, t0, t1, fn, o = {}) => { X.shots.push(Object.assign({ id, t0, t1, fn }, o)); };
  X.tr = (type, at, d, a, b, o = {}) => { X.trans.push(Object.assign({ type, at, d, a, b }, o)); };
  const byId = id => X.shots.find(s => s.id === id);
  X.renderShot = (id, t) => {
    const s = byId(id);
    const body = s.fn(t, t - s.t0);
    // each shot is its own isolated group: the screen-blended glows inside it must blend with this shot only (inside a
    // transition's mask Chrome otherwise blends them with the other shot, in hard-edged blocks)
    const iso = G.ISO === false ? '' : ' style="isolation:isolate"';
    return s.grade && !G.DBG.nograde ? `<g filter="url(#${s.grade})"${iso}>${body}</g>` : `<g${iso}>${body}</g>`;
  };

  const zoomAt = (fx, fy, z) => `translate(${f(fx)},${f(fy)}) scale(${f(z * 10000) / 10000}) translate(${f(-fx)},${f(-fy)})`;
  let fid = 0; const blurF = (sx, sy) => { const id = 'bf' + (++fid); return [`<filter id="${id}" filterUnits="userSpaceOnUse" x="-200" y="-200" width="${W + 400}" height="${H + 400}"><feGaussianBlur stdDeviation="${f(sx)} ${f(sy)}" edgeMode="duplicate"/></filter>`, id]; };
  const withBlur = (svg, sx, sy) => { if (sx < 0.4 && sy < 0.4) return svg; const [d, id] = blurF(sx, sy); return `<defs>${d}</defs><g filter="url(#${id})">${svg}</g>`; };

  // ---------------- transitions (screen space) ----------------
  const TR = {};
  // whip pan / tilt: both shots ride one strip; directional smear peaks mid-way
  TR.whip = (T, u, A, B) => {
    const [dx, dy] = T.dir, G2 = (dx ? W : H) * (T.gap || 1.08), s = G2 * EZ[T.ease || 'io'](u);
    const bl = Math.pow(Math.sin(Math.PI * u), 1.4) * (T.blur || 70);
    let g = '';
    if (s < (dx ? W : H) * 1.02) g += `<g transform="translate(${f(-dx * s)},${f(-dy * s)})">${A()}</g>`;
    if (G2 - s < (dx ? W : H) * 1.02) g += `<g transform="translate(${f(dx * (G2 - s))},${f(dy * (G2 - s))})">${B()}</g>`;
    return withBlur(g, Math.abs(dx) * bl + 0.3 * bl * Math.abs(dy) * 0, Math.abs(dy) * bl);
  };
  // push-through / match: A pushes into focus fa (zoom za), B settles from zoom zb around fb; crossfade mid
  TR.push = (T, u, A, B) => {
    const fa = T.fa || [540, 960], fb = T.fb || fa, za = T.za ?? 3, zb = T.zb ?? 0.55, [c0, c1] = T.fade || [0.38, 0.62];
    const ka = lerp(1, za, EZ[T.easeA || 'in2'](u)), kb = lerp(zb, 1, EZ[T.easeB || 'out'](u));
    const fade = X.ss(c0, c1, u), bl = Math.sin(Math.PI * u) * (T.blur ?? 8);
    // align: A slides so the thing pushed into (fa) arrives where B's matching thing is (fb) by the swap, inside the
    // margin A's zoom leaves (plus the 40 px the sets draw past the frame)
    let sh = '';
    if (T.align) {
      const al = X.ss(0, c0, u), m = 40;
      sh = `translate(${f(Math.max(-(W - fa[0]) * (ka - 1) - m, Math.min(fa[0] * (ka - 1) + m, (fb[0] - fa[0]) * al)))},${f(Math.max(-(H - fa[1]) * (ka - 1) - m, Math.min(fa[1] * (ka - 1) + m, (fb[1] - fa[1]) * al)))}) `;
    }
    let g = '';
    if (fade < 1) g += `<g transform="${sh}${zoomAt(fa[0], fa[1], ka)}">${A()}</g>`;
    if (fade > 0) g += `<g transform="${zoomAt(fb[0], fb[1], kb)}" opacity="${f(fade)}">${B()}</g>`;
    return withBlur(g, bl, bl);
  };
  // light flood: cut hidden under a bloom of light
  TR.flash = (T, u, A, B) => {
    const col = T.col || '#fff4e0', pk = Math.pow(Math.sin(Math.PI * u), T.pow || 0.8);
    let g = u < 0.5 ? `<g transform="${zoomAt(540, 960, 1 + u * 0.12)}">${A()}</g>` : `<g transform="${zoomAt(540, 960, 1.06 - (u - 0.5) * 0.12)}">${B()}</g>`;
    if (T.fa && u < 0.5) g = `<g transform="${zoomAt(T.fa[0], T.fa[1], 1 + EZ.in2(u * 2) * (T.za || 0.5))}">${A()}</g>`;
    const [cx, cy] = u < 0.5 ? (T.fa || [540, 960]) : (T.fb || [540, 960]);
    g += C.radial(cx, cy, 2400, col, 0.95 * pk, 'screen') + `<rect width="${W}" height="${H}" fill="${col}" opacity="${f(pk * 0.92)}"/>`;
    return g;
  };
  // foreground wipe: a dark out-of-focus object crosses the lens while both shots truck
  TR.wipe = (T, u, A, B) => {
    const d = T.dir || 1, tr = (T.truck ?? 220);
    let g = u < 0.5 ? `<g transform="translate(${f(-d * tr * u)},0)">${A()}</g>` : `<g transform="translate(${f(d * tr * (1 - u))},0)">${B()}</g>`;
    const x = lerp(d > 0 ? W * 1.75 : -W * 0.75, d > 0 ? -W * 0.75 : W * 1.75, EZ.sine(u));
    g += T.obj ? T.obj(x, u) : `<rect x="${f(x - W * 0.62)}" y="-200" width="${f(W * 1.24)}" height="${H + 400}" fill="#0c0806" filter="url(#dof3)"/>`;
    return g;
  };
  // dip through darkness
  TR.dip = (T, u, A, B) => {
    const k = u < 0.5 ? X.ss(0, 0.5, u) : 1 - X.ss(0.5, 1, u);
    let g = u < 0.5 ? `<g transform="${zoomAt(...(T.fa || [540, 960]), 1 + u * (T.za || 0.15))}">${A()}</g>` : `<g transform="${zoomAt(...(T.fb || [540, 960]), 1 + (1 - u) * (T.zb || 0.1))}">${B()}</g>`;
    return g + `<rect width="${W}" height="${H}" fill="${T.col || '#000'}" opacity="${f(k)}"/>`;
  };
  // parchment roller: B is revealed above a big rolled scroll travelling down the screen
  TR.unroll = (T, u, A, B) => {
    const Y = lerp(-180, H + 180, EZ.io(u)), id = uid('ur');
    return `${A()}<defs><clipPath id="${id}"><rect x="-10" y="-10" width="${W + 20}" height="${f(Y + 10)}"/></clipPath></defs><g clip-path="url(#${id})">${B()}</g>` +
      `<rect x="-20" y="${f(Y)}" width="${W + 40}" height="140" fill="#000" opacity="0.45" filter="url(#b14)"/>` + G.PROPS.scroll(540, Y, W + 200, 150, 0, { seal: false });
  };
  TR.cut = (T, u, A, B) => (u < 0.5 ? A() : B());
  // momentum carry: the camera keeps travelling through the cut. A accelerates away (u^2), B arrives decelerating
  // ((1-u)^2) so both move at the same speed at the cut; a soft crossfade and light motion blur hide the seam.
  // mode 'pan' | 'tilt' (dir, dist as a fraction of the frame) or 'zoom' (k > 1 pushes in, k < 1 pulls back)
  TR.carry = (T, u, A, B) => {
    const m = T.mode || 'pan', [c0, c1] = T.fade || [0.36, 0.64], fade = X.ss(c0, c1, u);
    const ua = u * u, ub = (1 - u) * (1 - u), v = Math.sin(Math.PI * u);
    let ta, tb, bx = 0, by = 0;
    if (m === 'zoom') {
      const k = T.k ?? 1.6, fa = T.fa || [540, 960], fb = T.fb || fa;
      ta = zoomAt(fa[0], fa[1], Math.pow(k, ua)); tb = zoomAt(fb[0], fb[1], Math.pow(k, -ub));
      bx = by = v * (T.blur ?? 4);
    } else {
      const [dx, dy] = T.dir, D = (T.dist ?? 0.45) * (dx ? W : H);
      ta = `translate(${f(-dx * D * ua)},${f(-dy * D * ua)})`; tb = `translate(${f(dx * D * ub)},${f(dy * D * ub)})`;
      bx = Math.abs(dx) * v * (T.blur ?? 14); by = Math.abs(dy) * v * (T.blur ?? 14);
    }
    if (T.roll) { ta += ` rotate(${f(T.roll * ua)},540,960)`; tb += ` rotate(${f(-T.roll * ub)},540,960)`; }
    let g = '';
    if (fade < 1) g += `<g transform="${ta}">${A()}</g>`;
    if (fade > 0) g += `<g transform="${tb}" opacity="${f(fade)}">${B()}</g>`;
    g = withBlur(g, bx, by);
    if (T.leak) { const pk = Math.pow(v, 1.5), [lx, ly] = T.leakAt || [540, 960]; g += C.radial(lx, ly, 1700, T.leak, (T.leakOp ?? 0.55) * pk, 'screen'); }
    return g;
  };
  // ---- transitions for "The Royal Taster" ----
  // organic noise mask: white where the noise exceeds a threshold sweeping from 1 to 0 (soft edge)
  const noiseMask = (u, seed = 3, freq = 0.0045, soft = 5) => {
    const id = uid('nm'), th = lerp(0.98, 0.02, u), B = 0.5 - soft * th;
    return [`<filter id="${id}f" filterUnits="userSpaceOnUse" x="-200" y="-200" width="${W + 400}" height="${H + 400}"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="3" seed="${seed}"/><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  ${soft} 0 0 0 ${f(B)}"/></filter><mask id="${id}" maskUnits="userSpaceOnUse" x="-200" y="-200" width="${W + 400}" height="${H + 400}"><rect x="-200" y="-200" width="${W + 400}" height="${H + 400}" filter="url(#${id}f)"/></mask>`, id];
  };
  // revolver spin: A rolls and pushes in accelerating, B arrives still rolling and decelerates (matched speed)
  TR.spin = (T, u, A, B) => {
    const rot = T.rot ?? 120, k = T.k ?? 1.5, ua = u * u, ub = (1 - u) * (1 - u), v = Math.sin(Math.PI * u), fade = X.ss(0.4, 0.6, u);
    const fa = T.fa || [540, 960], fb = T.fb || [540, 960];
    let g = '';
    if (fade < 1) g += `<g transform="rotate(${f(rot * ua)},540,960) ${zoomAt(fa[0], fa[1], Math.pow(k, ua))}">${A()}</g>`;
    if (fade > 0) g += `<g transform="rotate(${f(-rot * ub)},540,960) ${zoomAt(fb[0], fb[1], Math.pow(k, -ub))}" opacity="${f(fade)}">${B()}</g>`;
    return withBlur(g, v * (T.blur ?? 7), v * (T.blur ?? 7));
  };
  // organic dissolve: B grows through drifting noise while both keep their own push (anchored on fa / fb)
  TR.organic = (T, u, A, B) => {
    const fa = T.fa || [540, 960], fb = T.fb || fa, e = EZ.sine(u);
    const ka = lerp(1, T.za ?? 1.12, e), kb = lerp(T.zb ?? 0.92, 1, e);
    if (T.plain) return `<g transform="${zoomAt(fa[0], fa[1], ka)}">${A()}</g><g opacity="${f(EZ.sine(u))}" transform="${zoomAt(fb[0], fb[1], kb)}">${B()}</g>`;
    const [d, id] = noiseMask(u, T.seed || 3, T.freq || 0.0045, T.soft || 5);
    let g = `<defs>${d}</defs><g transform="${zoomAt(fa[0], fa[1], ka)}">${A()}</g><g mask="url(#${id})"><g transform="${zoomAt(fb[0], fb[1], kb)}">${B()}</g></g>`;
    if (T.leak) { const pk = Math.pow(Math.sin(Math.PI * u), 1.5); g += C.radial(...(T.leakAt || fa), 1500, T.leak, (T.leakOp ?? 0.4) * pk, 'screen'); }
    return g;
  };
  // rise through bokeh: camera tilts (content slides), the frame defocuses into floating candle bokeh, refocuses on B
  TR.bokeh = (T, u, A, B) => {
    const [dx, dy] = T.dir || [0, 1], D = (T.dist ?? 0.5) * H, ua = u * u, ub = (1 - u) * (1 - u), v = Math.sin(Math.PI * u), fade = X.ss(0.42, 0.58, u);
    let g = '';
    if (fade < 1) g += `<g transform="translate(${f(dx * D * ua)},${f(dy * D * ua)})">${A()}</g>`;
    if (fade > 0) g += `<g transform="translate(${f(-dx * D * ub)},${f(-dy * D * ub)})" opacity="${f(fade)}">${B()}</g>`;
    g = withBlur(g, v * (T.blur ?? 16), v * (T.blur ?? 16));
    const r = rng(T.seed || 5); let bk = '';
    for (let i = 0; i < 26; i++) {
      const x0 = r() * W, y0 = r() * H * 1.6 - H * 0.3, rr = 60 + r() * 150, sp = 0.6 + r() * 0.8, col = ['#ffcf80', '#ffb050', '#fff0c8', '#ff9a40'][i % 4];
      const y = y0 + dy * (u - 0.5) * H * 1.2 * sp, x = x0 + dx * (u - 0.5) * W * 1.2 * sp;
      bk += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(rr)}" fill="${col}" opacity="${f(0.55 * Math.pow(v, 1.3) * (0.5 + r() * 0.5))}" filter="url(#b4)"/>`;
    }
    return g + `<g style="mix-blend-mode:screen">${bk}</g>`;
  };
  // star glint: a highlight on an object flares into a four-point star; the cut hides in its peak
  TR.glint = (T, u, A, B) => {
    const fa = T.fa || [540, 960], fb = T.fb || fa, pk = Math.pow(Math.sin(Math.PI * u), 2), fade = X.ss(0.44, 0.56, u);
    let g = '';
    if (fade < 1) g += `<g transform="${zoomAt(fa[0], fa[1], 1 + EZ.in2(u) * (T.za ?? 0.25))}">${A()}</g>`;
    if (fade > 0) g += `<g transform="${zoomAt(fb[0], fb[1], 1 + EZ.out2(1 - u) * (T.zb ?? 0.2))}" opacity="${f(fade)}">${B()}</g>`;
    const [cx, cy] = u < 0.5 ? fa : fb, R = 60 + pk * 1500, rot = u * 40;
    g += `<g transform="translate(${f(cx)},${f(cy)}) rotate(${f(rot)})" style="mix-blend-mode:screen"><path d="M0,${f(-R)} L${f(R * 0.05)},${f(-R * 0.05)} L${f(R)},0 L${f(R * 0.05)},${f(R * 0.05)} L0,${f(R)} L${f(-R * 0.05)},${f(R * 0.05)} L${f(-R)},0 L${f(-R * 0.05)},${f(-R * 0.05)}Z" fill="#fff8e0" opacity="${f(0.9 * pk)}" filter="url(#b2)"/></g>`;
    g += C.radial(cx, cy, 300 + pk * 1600, T.col || '#fff6dc', 0.95 * pk, 'screen');
    return g;
  };
  // iris: push into the pupil, darkness swallows the frame, B opens out of a widening soft circle
  TR.iris = (T, u, A, B) => {
    const fa = T.fa || [540, 960], ka = Math.pow(T.k ?? 6, EZ.in2(Math.min(1, u / 0.6)));
    let g = '';
    if (u < 0.62) {
      // soft-edged darkness as a radial gradient (a blur filter on a disc this large breaks Chrome's filter limits)
      const r = lerp(0, 1500, X.ss(0.15, 0.6, u)), gid = uid('irs');
      const far = Math.max(...[[0, 0], [W, 0], [0, H], [W, H]].map(([x, y]) => Math.hypot(x - fa[0], y - fa[1])));
      // once the solid core covers the whole frame, the zoomed shot underneath is not drawn at all
      if ((r * 1.12 + 20) * 0.82 < far + 8) g += `<g transform="${zoomAt(fa[0], fa[1], ka)}">${A()}</g>`;
      else g += `<rect width="${W}" height="${H}" fill="#000"/>`;
      if (r > 1) g += `<defs><radialGradient id="${gid}" gradientUnits="userSpaceOnUse" cx="${f(fa[0])}" cy="${f(fa[1])}" r="${f(r * 1.12 + 20)}"><stop offset="0.82" stop-color="#000"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient></defs><circle cx="${f(fa[0])}" cy="${f(fa[1])}" r="${f(r * 1.12 + 20)}" fill="url(#${gid})"/>`;
    }
    else g += `<rect width="${W}" height="${H}" fill="#000"/>`;
    if (u > 0.5) {
      const k = X.ss(0.5, 1, u), id = uid('ir'), R = lerp(0, 1400, EZ.out2(k));
      g += `<defs><radialGradient id="${id}g"><stop offset="0.7" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient><mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><circle cx="${f((T.fb || [540, 960])[0])}" cy="${f((T.fb || [540, 960])[1])}" r="${f(R)}" fill="url(#${id}g)"/></mask></defs>`;
      g += `<g mask="url(#${id})"><g transform="${zoomAt(...(T.fb || [540, 960]), lerp(1.35, 1, EZ.out(k)))}">${B()}</g></g>`;
    }
    return g;
  };
  // liquid: a spreading stain (organic blob) becomes the window into B
  TR.liquid = (T, u, A, B) => {
    const fa = T.fa || [540, 960], id = uid('lq'), R = lerp(10, 2500, EZ.in2(u) * 0.6 + EZ.sine(u) * 0.4);
    const blob = `<circle cx="${f(fa[0])}" cy="${f(fa[1])}" r="${f(R)}" filter="url(#${id}d)"/>`;
    let g = `<defs><filter id="${id}d" filterUnits="userSpaceOnUse" x="-600" y="-600" width="${W + 1200}" height="${H + 1200}"><feTurbulence type="fractalNoise" baseFrequency="0.006" numOctaves="3" seed="${T.seed || 8}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="${f(120 + R * 0.25)}" xChannelSelector="R" yChannelSelector="G"/></filter>` +
      `<mask id="${id}" maskUnits="userSpaceOnUse" x="-600" y="-600" width="${W + 1200}" height="${H + 1200}"><g fill="#fff">${blob}</g></mask></defs>`;
    g += `<g transform="${zoomAt(fa[0], fa[1], 1 + u * 0.12)}">${A()}</g>`;
    g += `<g fill="${T.col || '#5a0810'}" opacity="${f(0.9 * (1 - X.ss(0.75, 1, u)))}"><circle cx="${f(fa[0])}" cy="${f(fa[1])}" r="${f(R * 1.06 + 20)}" filter="url(#${id}d)"/></g>`;
    g += `<g mask="url(#${id})"><g transform="${zoomAt(...(T.fb || fa), lerp(1.15, 1, EZ.out(u)))}">${B()}</g><rect width="${W}" height="${H}" fill="${T.col || '#5a0810'}" opacity="${f(0.45 * (1 - u))}" style="mix-blend-mode:multiply"/></g>`;
    return g;
  };
  // zoom match: A dives into fa, B pulls back out of fb (a matching shape), joined by an organic dissolve + bloom
  TR.zmatch = (T, u, A, B) => {
    const fa = T.fa || [540, 960], fb = T.fb || fa, ua = u * u, ub = (1 - u) * (1 - u), [c0, c1] = T.fade || [0.25, 0.75];
    const ta = zoomAt(fa[0], fa[1], Math.pow(T.za ?? 2.6, ua)), tb = zoomAt(fb[0], fb[1], Math.pow(T.zb ?? 2.6, ub));
    let g;
    // plain: a smooth crossfade inside the blur (the noise dissolve leaves grey blotches of B over A, like smoke)
    if (T.plain) { const fd = X.ss(c0, c1, u); g = (fd < 1 ? `<g transform="${ta}">${A()}</g>` : '') + (fd > 0 ? `<g transform="${tb}" opacity="${f(fd)}">${B()}</g>` : ''); }
    else { const [d, id] = noiseMask(X.ss(c0, c1, u), T.seed || 6, 0.0035, 2.6); g = `<defs>${d}</defs><g transform="${ta}">${A()}</g><g mask="url(#${id})"><g transform="${tb}">${B()}</g></g>`; }
    const pk = Math.pow(Math.sin(Math.PI * u), 2);
    if (T.leak) g += C.radial(...(u < 0.5 ? fa : fb), 1200, T.leak, (T.leakOp ?? 0.6) * pk, 'screen');
    const kb = T.bpow ? Math.pow(Math.sin(Math.PI * u), T.bpow) : pk;
    return withBlur(g, kb * (T.blur ?? 5), kb * (T.blur ?? 5));
  };
  // ---- transitions for "The Worm" ----
  // lens: a glass lens opens from fa; inside it B (magnified world), A keeps pushing in behind it
  TR.lens = (T, u, A, B) => {
    const fa = T.fa || [540, 960], fb = T.fb || [540, 960], e = EZ.io(u), id = uid('ln');
    const R = lerp(0, Math.hypot(W, H) * 0.62, EZ.in2(Math.min(1, u * 1.05)) * 0.55 + e * 0.45);
    const cx = lerp(fa[0], 540, e), cy = lerp(fa[1], 960, e);
    let g = `<g transform="${zoomAt(fa[0], fa[1], 1 + e * (T.za ?? 1.4))}">${A()}</g>`;
    if (R > 2) {
      g += `<defs><clipPath id="${id}"><circle cx="${f(cx)}" cy="${f(cy)}" r="${f(R)}"/></clipPath></defs><g clip-path="url(#${id})"><g transform="${zoomAt(fb[0], fb[1], lerp(1.8, 1, e))}">${B()}</g>` +
        `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(R)}" fill="none" stroke="#000" stroke-width="${f(R * 0.25)}" opacity="0.35" filter="url(#b14)"/></g>`;
      g += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(R)}" fill="none" stroke="#e8f4ff" stroke-width="${f(3 + 6 * (1 - u))}" opacity="${f(0.8 * (1 - X.ss(0.8, 1, u)))}"/><circle cx="${f(cx)}" cy="${f(cy)}" r="${f(R + 10)}" fill="none" stroke="#1a2a30" stroke-width="${f(10 * (1 - u))}" opacity="0.7"/>` +
        C.radial(cx - R * 0.35, cy - R * 0.4, R * 0.5, '#ffffff', 0.18 * (1 - u), 'screen');
    }
    return g;
  };
  // scan: a glowing scan line sweeps down; above it B, below it A
  TR.scan = (T, u, A, B) => {
    const y = lerp(-80, H + 80, EZ.io(u)), id = uid('sc'), col = T.col || '#8ef0ff';
    let g = `<defs><clipPath id="${id}a"><rect x="-10" y="${f(y)}" width="${W + 20}" height="${H + 200}"/></clipPath><clipPath id="${id}b"><rect x="-10" y="-200" width="${W + 20}" height="${f(y + 200)}"/></clipPath></defs>`;
    g += `<g clip-path="url(#${id}a)"><g transform="${zoomAt(540, 960, 1 + u * (T.za ?? 0.15))}">${A()}</g></g>`;
    g += `<g clip-path="url(#${id}b)"><g transform="${zoomAt(...(T.fb || [540, 960]), lerp(T.zb ?? 1.5, 1, EZ.out(u)))}">${B()}</g></g>`;
    g += `<rect x="-10" y="${f(y - 60)}" width="${W + 20}" height="120" fill="${col}" opacity="0.18" filter="url(#b14)"/><rect x="-10" y="${f(y - 3)}" width="${W + 20}" height="6" fill="#ffffff" opacity="0.9"/><rect x="-10" y="${f(y - 12)}" width="${W + 20}" height="24" fill="${col}" opacity="0.45" filter="url(#b4)"/>`;
    return g;
  };
  // eyelid: the eyes close on A and open on B (soft out-of-focus as they open)
  TR.eyelid = (T, u, A, B) => {
    const shut = u < 0.5 ? EZ.io(u / 0.45 > 1 ? 1 : u / 0.45) : 1 - EZ.io(Math.max(0, (u - 0.55) / 0.45)), open = 1 - shut;
    const g0 = u < 0.5 ? `<g transform="${zoomAt(540, 960, 1 + u * 0.08)}">${A()}</g>` : withBlur(`<g transform="${zoomAt(540, 960, 1.06 - (u - 0.5) * 0.12)}">${B()}</g>`, (1 - u) * 18, (1 - u) * 18);
    const h = open * H * 0.52, c = 260 * open * Math.min(1, shut * 4);   // flat (fully off-screen) lids at both ends
    const lid = (top) => top ? `M-20,-20 L${W + 20},-20 L${W + 20},${f(H / 2 - h)} Q540,${f(H / 2 - h + c)} -20,${f(H / 2 - h)}Z` : `M-20,${H + 20} L${W + 20},${H + 20} L${W + 20},${f(H / 2 + h)} Q540,${f(H / 2 + h - c)} -20,${f(H / 2 + h)}Z`;
    return g0 + `<g filter="url(#b8)"><path d="${lid(true)}" fill="#050304"/><path d="${lid(false)}" fill="#050304"/></g>`;
  };
  // heat shimmer: the frame wobbles like air over a fire while A dissolves into B
  TR.heat = (T, u, A, B) => {
    const pk = Math.sin(Math.PI * u), id = uid('ht'), fade = X.ss(0.3, 0.7, u);
    const filt = `<filter id="${id}" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="turbulence" baseFrequency="0.012 0.04" numOctaves="2" seed="${Math.floor(u * 40)}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="${f(pk * 70)}" xChannelSelector="R" yChannelSelector="G"/></filter>`;
    let g = `<defs>${filt}</defs><g filter="url(#${id})">`;
    if (fade < 1) g += `<g transform="${zoomAt(540, 960, 1 + u * 0.1)}">${A()}</g>`;
    if (fade > 0) g += `<g opacity="${f(fade)}" transform="${zoomAt(540, 960, 1.1 - u * 0.1)}">${B()}</g>`;
    g += `</g>`;
    return g + `<rect width="${W}" height="${H}" fill="#ff7a30" opacity="${f(0.28 * pk)}" style="mix-blend-mode:screen"/>`;
  };
  // negative: an x-ray flash; colours invert into a cold negative, A dissolves into B inside the negative, then B resolves
  TR.negative = (T, u, A, B) => {
    const pk = X.ss(0, 0.4, u) * (1 - X.ss(0.6, 1, u)), mB = X.ss(0.36, 0.64, u), id = uid('ng');
    const inv = `<filter id="${id}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="-0.7 -0.2 0 0 0.95  -0.2 -0.6 -0.1 0 1  -0.1 -0.1 -0.6 0 1  0 0 0 1 0"/></filter>`;
    const base = (mB < 1 ? `<g transform="${zoomAt(...(T.fa || [540, 960]), 1 + u * 0.3)}">${A()}</g>` : '') +
      (mB > 0 ? `<g opacity="${f(mB)}" transform="${zoomAt(...(T.fb || [540, 960]), 1.15 - 0.15 * X.clamp((u - 0.36) / 0.64))}">${B()}</g>` : '');
    return `<defs>${inv}</defs>${base}<g opacity="${f(pk)}" filter="url(#${id})">${base}</g><rect width="${W}" height="${H}" fill="#bff4ff" opacity="${f(0.22 * pk)}" style="mix-blend-mode:screen"/>`;
  };
  // sweep: a band of warm light crosses the frame; the cut hides inside it
  TR.sweep = (T, u, A, B) => {
    const x = lerp(-700, W + 700, EZ.io(u)), d = T.dir || 1, xx = d > 0 ? x : W - x;
    const id = uid('sw');
    // (the seam between the shots leans with the band, so it always lies under the band's brightest line)
    let g = `<defs><clipPath id="${id}a"><rect x="${d > 0 ? f(xx) : -800}" y="-10" width="${d > 0 ? W + 1600 : f(xx + 800)}" height="${H + 20}" transform="skewX(-12)"/></clipPath><clipPath id="${id}b"><rect x="${d > 0 ? -800 : f(xx)}" y="-10" width="${d > 0 ? f(xx + 800) : W + 1600}" height="${H + 20}" transform="skewX(-12)"/></clipPath>` +
      `<linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${T.col || '#fff0c8'}" stop-opacity="0"/><stop offset="0.5" stop-color="${T.col || '#fff0c8'}" stop-opacity="1"/><stop offset="1" stop-color="${T.col || '#fff0c8'}" stop-opacity="0"/></linearGradient></defs>`;
    g += `<g clip-path="url(#${id}a)"><g transform="${zoomAt(540, 960, 1 + u * 0.12)}">${A()}</g></g><g clip-path="url(#${id}b)"><g transform="${zoomAt(540, 960, 1.12 - u * 0.12)}">${B()}</g></g>`;
    // (the skew leaves the band's tail on screen at the far corner at both ends: fade it there, or it pops off on the
    // first frame after the transition)
    g += `<rect x="${f(xx - 600)}" y="-10" width="1200" height="${H + 20}" fill="url(#${id}g)" opacity="${f(0.95 * X.ss(0, 0.14, u) * (1 - X.ss(0.86, 1, u)))}" style="mix-blend-mode:screen" transform="skewX(-12)"/>`;
    return g;
  };
  // morph: a shape in A becomes a matching shape in B (both aligned on fa/fb), glow at the switch
  TR.morph = (T, u, A, B) => {
    const fa = T.fa || [540, 960], fb = T.fb || fa, e = EZ.io(u), fade = X.ss(...(T.fade || [0.35, 0.65]), u), pk = Math.pow(Math.sin(Math.PI * u), 2);
    const ka = lerp(1, T.za ?? 1.3, e);
    // align: A slides so its shape lands on B's before the switch (or the two shapes cross as a double image); the slide
    // stays inside the margin A's zoom leaves, plus the 40 px every set draws past the frame
    let sh = '';
    if (T.align) {
      const al = X.ss(0, 0.5, u), m = 40;
      const dx = Math.max(-(W - fa[0]) * (ka - 1) - m, Math.min(fa[0] * (ka - 1) + m, (fb[0] - fa[0]) * al));
      const dy = Math.max(-(H - fa[1]) * (ka - 1) - m, Math.min(fa[1] * (ka - 1) + m, (fb[1] - fa[1]) * al));
      sh = `translate(${f(dx)},${f(dy)}) `;
    }
    let g = '';
    if (fade < 1) g += `<g transform="${sh}${zoomAt(fa[0], fa[1], ka)}">${A()}</g>`;
    if (fade > 0) g += `<g opacity="${f(fade)}" transform="${zoomAt(fb[0], fb[1], lerp(T.zb ?? 1.3, 1, e))}">${B()}</g>`;
    // (bpow narrows the defocus to the frames round the swap; the default keeps the old broad curve)
    if (T.blur) { const kb = T.bpow ? Math.pow(Math.sin(Math.PI * u), T.bpow) : pk; g = withBlur(g, kb * T.blur, kb * T.blur); }
    return g + C.radial(fb[0], fb[1], 700, T.col || '#ffffff', 0.5 * pk, 'screen');
  };
  // ---- face-locked transitions (The Royal Fool, after delivery). T.faceA(t) and T.faceB(tB) give the face that matches
  // in each shot: { p: [x, y] screen point of its centre, s: its scale, r: its turn (deg) }, computed from the shots'
  // cameras and rigs (never read back from a drawing), so a measuring pass and the drawing pass agree.
  // facematch: A dissolves into B while A is carried onto B's face - position, size and turn - the carry eased in before
  // the dissolve; nothing else moves, so only what is round the face changes (two faces a few per cent apart in size and
  // a few pixels apart showed as a double face through the dissolve)
  const faceT = (F, P, dr, k, w) => `translate(${f(F.p[0] + (P[0] - F.p[0]) * w)},${f(F.p[1] + (P[1] - F.p[1]) * w)}) rotate(${f(dr * w)}) scale(${f((1 + (k - 1) * w) * 10000) / 10000}) translate(${f(-F.p[0])},${f(-F.p[1])})`;
  TR.facematch = (T, u, A, B, t) => {
    const [c0, c1] = T.fade || [0.25, 0.75], fa = T.faceA(t), fb = T.faceB(t + (T.bOff || 0)), fade = X.ss(c0, c1, u);
    // (the carry is spread over the first half - a plain smoothstep, under 0.2% of zoom a frame: eased twice over the
    // first quarter it made a 1% pop in one frame, 3339)
    const ta = fa && fb ? faceT(fa, fb.p, fb.r - fa.r, fb.s / fa.s, X.ss(0, T.carry ?? 0.5, u)) : '';
    let g = '';
    if (fade < 1) g += `<g transform="${ta}">${A()}</g>`;
    if (fade > 0) g += `<g opacity="${f(fade)}">${B()}</g>`;
    return g;
  };
  // facepush: A pushes into a face, accelerating; B pulls back out of the matching face, decelerating to rest. At the
  // swap the two faces lie exactly on each other (B is carried onto A's face, the carry shrinking with B's zoom so B
  // arrives untouched); the swap is a few frames inside a defocus. A only zooms - a slide held inside A's zoom margin
  // stopped dead where the margin caught up with it
  TR.facepush = (T, u, A, B, t) => {
    const us = 0.5, [c0, c1] = T.fade || [0.4, 0.6], za = T.za ?? 2.8, eo = v => 1 - (1 - v) * (1 - v);
    const fa = T.faceA(t), fb = T.faceB(t + (T.bOff || 0));
    const ka = lerp(1, za, u * u), kaS = lerp(1, za, us * us), kbS = fa && fb ? kaS * fa.s / fb.s : kaS;
    const zb = (kbS - eo(us)) / (1 - eo(us)), kb = lerp(zb, 1, eo(u)), cw = Math.max(0, Math.min(1, (kb - 1) / Math.max(1e-6, kbS - 1)));
    const fade = X.ss(c0, c1, u), bl = Math.pow(Math.sin(Math.PI * u), T.bpow ?? 4) * (T.blur ?? 5);
    let g = '';
    if (fade < 1 && fa) g += `<g transform="${zoomAt(fa.p[0], fa.p[1], ka)}">${A()}</g>`;
    if (fade > 0 && fb) {
      const P = fa ? [fb.p[0] + (fa.p[0] - fb.p[0]) * cw, fb.p[1] + (fa.p[1] - fb.p[1]) * cw] : fb.p, dr = fa ? (fa.r - fb.r) * cw : 0;
      g += `<g opacity="${f(fade)}" transform="translate(${f(P[0])},${f(P[1])}) rotate(${f(dr)}) scale(${f(kb * 10000) / 10000}) translate(${f(-fb.p[0])},${f(-fb.p[1])})">${B()}</g>`;
    }
    return withBlur(g, bl, bl);
  };
  // surface: the camera dips through a water surface. A bright wavy waterline crosses the frame;
  // dir 1 = going under (line rises, B = the underwater view below it), dir -1 = coming up (line sinks, B = the air view above it)
  // (tint / line / core / bub: the water's colours - defaults are the old cold water; a warm drink passes its own)
  TR.surface = (T, u, A, B) => {
    const d = T.dir || 1, e = EZ.io(u), y = d > 0 ? lerp(H + 160, -160, e) : lerp(-160, H + 160, e), id = uid('sf');
    let wv = `M-40,${f(y)}`;
    for (let x = -40; x <= W + 40; x += 30) wv += ` L${x},${f(y + Math.sin(x * 0.011 + u * 8) * 30 + Math.sin(x * 0.029 - u * 12) * 12)}`;
    const below = `${wv} L${W + 40},${H + 600} L-40,${H + 600}Z`, above = `${wv} L${W + 40},-600 L-40,-600Z`;
    const under = d > 0 ? B : A, over = d > 0 ? A : B;
    const ku = d > 0 ? lerp(1.12, 1, e) : lerp(1, 1.1, e), ko = d > 0 ? lerp(1, 1.08, e) : lerp(1.08, 1, e);
    let g = `<defs><clipPath id="${id}u"><path d="${below}"/></clipPath><clipPath id="${id}o"><path d="${above}"/></clipPath></defs>`;
    g += `<g clip-path="url(#${id}o)"><g transform="${zoomAt(540, 960, ko)}">${over()}</g></g>`;
    g += `<g clip-path="url(#${id}u)"><g transform="${zoomAt(540, 960, ku)}">${under()}</g><rect width="${W}" height="${H}" fill="${T.tint || '#9ad8e8'}" opacity="${f(0.18 * Math.sin(Math.PI * u))}" style="mix-blend-mode:screen"/></g>`;
    g += `<path d="${wv}" stroke="${T.line || '#d8f6ff'}" stroke-width="46" fill="none" opacity="0.22"/><path d="${wv}" stroke="${T.core || '#ffffff'}" stroke-width="7" fill="none" opacity="0.9"/>`;
    // bubbles riding the line
    const r = rng(T.seed || 21);
    for (let i = 0; i < 26; i++) { const bx = r() * W, by = y + 20 + r() * 220 * (d > 0 ? 1 : -0.6), rr = 4 + r() * 12; g += `<circle cx="${f(bx)}" cy="${f(by - u * 120 * d)}" r="${f(rr)}" fill="none" stroke="${T.bub || '#e8fbff'}" stroke-width="2" opacity="${f(0.7 * Math.sin(Math.PI * u))}"/>`; }
    return g;
  };
  // ---- transitions for "The Rabies Boy" ----
  // rack focus: A drifts out of focus while B, already crossfading in, pulls into focus; both keep their own slow push.
  // fa/fb anchor the pushes, za/zb the zooms, blur the peak defocus (px). Blur and fade curves are flat at both ends.
  TR.rack = (T, u, A, B) => {
    const fa = T.fa || [540, 960], fb = T.fb || fa, e = EZ.sine(u), fade = X.ss(...(T.fade || [0.3, 0.7]), u), bm = T.blur ?? 11;
    const ba = bm * X.ss(0, 0.55, u), bb = bm * (1 - X.ss(0.45, 1, u));
    let g = '';
    if (fade < 1) g += withBlur(`<g transform="${zoomAt(fa[0], fa[1], lerp(1, T.za ?? 1.06, e))}">${A()}</g>`, ba, ba);
    if (fade > 0) g += `<g opacity="${f(fade)}">${withBlur(`<g transform="${zoomAt(fb[0], fb[1], lerp(T.zb ?? 0.95, 1, e))}">${B()}</g>`, bb, bb)}</g>`;
    if (T.leak) g += C.radial(...fb, 1400, T.leak, (T.leakOp ?? 0.25) * Math.pow(Math.sin(Math.PI * u), 2), 'screen');
    return g;
  };
  // radial reveal: B grows out of fb through a soft-edged circle (no darkness, no blur filter) while A keeps pushing
  // into fa. With fa/fb on matching shapes (a face then an older face) it reads as one image turning into the other.
  TR.radial = (T, u, A, B) => {
    const fa = T.fa || [540, 960], fb = T.fb || fa, e = EZ.io(u), id = uid('rd'), soft = T.soft ?? 0.5;
    const far = Math.max(...[[0, 0], [W, 0], [0, H], [W, H]].map(([x, y]) => Math.hypot(x - fb[0], y - fb[1])));
    const R = (far / soft + 40) * (EZ.in2(Math.min(1, u * 1.04)) * 0.3 + e * 0.7);
    let g = `<g transform="${zoomAt(fa[0], fa[1], lerp(1, T.za ?? 1.12, e))}">${A()}</g>`;
    if (R > 2) g += `<defs><radialGradient id="${id}g" gradientUnits="userSpaceOnUse" cx="${f(fb[0])}" cy="${f(fb[1])}" r="${f(R)}"><stop offset="${soft}" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>` +
      `<mask id="${id}" maskUnits="userSpaceOnUse" x="-60" y="-60" width="${W + 120}" height="${H + 120}"><rect x="-60" y="-60" width="${W + 120}" height="${H + 120}" fill="url(#${id}g)"/></mask></defs>` +
      `<g mask="url(#${id})"><g transform="${zoomAt(fb[0], fb[1], lerp(T.zb ?? 1.16, 1, e))}">${B()}</g></g>`;
    // ring: a band of light riding the soft edge, so the two shots never show through each other there (it starts at
    // the edge's opaque side, which is off the far corner by the last frame, and fades out over the last 15%)
    if (T.ring && R > 2) {
      const r2 = R * 1.12, op = (T.ringOp ?? 0.8) * X.ss(0, 0.08, u) * (1 - X.ss(0.85, 1, u));
      g += `<defs><radialGradient id="${id}r" gradientUnits="userSpaceOnUse" cx="${f(fb[0])}" cy="${f(fb[1])}" r="${f(r2)}"><stop offset="${f(soft / 1.12)}" stop-color="${T.ring}" stop-opacity="0"/><stop offset="${f((soft + 1) / 2 / 1.12)}" stop-color="${T.ring}" stop-opacity="${f(op)}"/><stop offset="1" stop-color="${T.ring}" stop-opacity="0"/></radialGradient></defs>` +
        `<rect x="-60" y="-60" width="${W + 120}" height="${H + 120}" fill="url(#${id}r)" style="mix-blend-mode:screen"/>`;
    }
    if (T.leak) g += C.radial(...fb, 900, T.leak, (T.leakOp ?? 0.2) * Math.pow(Math.sin(Math.PI * u), 2), 'screen');
    return g;
  };
  X.TR = TR;

  // ---------------- frame ----------------
  // X.tOf(n): the (animation) time of frame n. G.TWARP_T (a page's time warp: the old time of every frame) lets a film
  // whose shots were timed to one voice-over play against another take of it - the picture eases through the pauses
  X.tOf = n => {
    const T = G.TWARP_T; if (!T) return n / FPS;
    if (n <= 0) return T[0] + n / FPS;
    const i = Math.floor(n); if (i >= T.length - 1) return T[T.length - 1] + (n - (T.length - 1)) / FPS;
    return T[i] + (T[i + 1] - T[i]) * (n - i);
  };
  X.FRAMES = G.VIDEO_FRAMES || 2743; X.T_END = X.tOf(X.FRAMES);   // the voice ends inside the last frame, frame FRAMES == frame 0
  // the transition running at t (with its progress u), or null
  X.transAt = t => { for (const T of X.trans) { const a = T.end ? T.at - T.d : T.at - T.d / 2; if (t >= a && t < a + T.d) return { T, u: (t - a) / T.d }; } return null; };
  X.vexpFor = T => T.vexp ? T.vexp : T.type === 'push' ? Math.max(1, 1 / Math.min(T.zb ?? 0.55, 1)) * 1.1
    : T.type === 'carry' ? (T.mode === 'zoom' ? Math.max(T.k ?? 1.6, 1 / (T.k ?? 1.6)) * 1.15 : 1.7)
    : ({ whip: 2.3, wipe: 1.6, flash: 1.25, dip: 1.25, unroll: 1.05, cut: 1, spin: 2.2, organic: 1.15, bokeh: 1.8, glint: 1.1, iris: 1.4, liquid: 1.2, zmatch: 1.1, lens: 1.1, scan: 1.6, eyelid: 1.15, heat: 1.2, negative: 1.2, sweep: 1.2, morph: 1.35, surface: 1.15, rack: 1.12, radial: 1.2, facematch: 1.12, facepush: 1.7 })[T.type] || 2;
  // Inside a transition each shot can stand in as a picture (X.SHOTIMG.a / .b: { url, x, y, w, h } in the shot's own
  // frame coordinates), drawn beforehand on its own: two heavy shots rasterised together in one frame made Chrome drop
  // whole layers for single frames. X.SHOTIMG = 'probe' puts a measuring rectangle in each shot's place instead, so the
  // page can read off which part of each shot the transition will show, and at what magnification.
  X.SHOTIMG = null;
  const shotRef = (k, id, tt) => {
    const S = X.SHOTIMG;
    if (!S) return X.renderShot(id, tt);
    if (S === 'probe') return `<rect class="probe${k}" x="0" y="0" width="${W}" height="${H}" fill="#000" fill-opacity="0"/>`;
    const im = S[k]; return im ? `<image href="${im.url}" x="${im.x}" y="${im.y}" width="${im.w}" height="${im.h}" preserveAspectRatio="none"/>` : '';
  };
  X.frameBody = t => {
    const tr = X.transAt(t);
    if (tr) {
      const T = tr.T;
      X.VEXP = X.vexpFor(T);
      try { return TR[T.type](T, tr.u, () => shotRef('a', T.a, t), () => shotRef('b', T.b, t + (T.bOff || 0)), t); } finally { X.VEXP = 1; }
    }
    let s = X.shots.find(s => t >= s.t0 && t < s.t1) || (t < X.shots[0].t0 ? X.shots[0] : X.shots[X.shots.length - 1]);
    return X.renderShot(s.id, t);
  };
  X.post = (t, n) => {
    const r = rng(n * 7 + 3), gx = -Math.floor(r() * 300), gy = -Math.floor(r() * 300);
    return C.vignette(0.55, '#06040a', 0.42) + `<rect x="${gx}" y="${gy}" width="${W + 300}" height="${H + 300}" filter="url(#grain)" opacity="${X.GRAIN ?? 0.07}" style="mix-blend-mode:overlay"/>`;
  };
  X.defs = () => G.RIG.defs() + C.defs() + G.ENV.defs() +
    `<filter id="inkF" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="0.6"/></filter>` +
    `<filter id="silh" x="-20%" y="-20%" width="140%" height="140%"><feFlood flood-color="#1a0c06"/><feComposite in2="SourceAlpha" operator="in"/><feGaussianBlur stdDeviation="4"/></filter>` +
    `<filter id="xrayP" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 0.3  0 0 0 0 0.7  0 0 0 0 0.95  0.22 0.22 0.22 0 0.06"/></filter>` +
    `<filter id="silhS" x="-20%" y="-20%" width="140%" height="140%"><feFlood flood-color="#120a08"/><feComposite in2="SourceAlpha" operator="in"/><feGaussianBlur stdDeviation="1.2"/></filter>` +
    C.gradeFilter('gDay', 0.9, '0.03 0.12 0.29 0.5 0.7 0.87 0.97', [0.99, 1, 1.02]) +
    C.gradeFilter('gHall', 0.92, '0.02 0.1 0.27 0.49 0.7 0.87 0.98', [1.02, 0.99, 0.97]) +
    C.gradeFilter('gNight', 0.85, '0.03 0.1 0.25 0.46 0.68 0.86 0.97', [0.98, 0.99, 1.04]) +
    C.gradeFilter('gDusk', 0.95, '0.03 0.12 0.29 0.5 0.71 0.88 0.98', [1.02, 0.99, 0.98]) +
    C.gradeFilter('gPage', 0.9, '0.04 0.14 0.31 0.52 0.72 0.88 0.97', [1, 0.99, 0.98]) +
    C.gradeFilter('gSick', 0.5, '0.04 0.12 0.28 0.48 0.68 0.85 0.95', [0.94, 1.05, 0.86]) +
    C.gradeFilter('gFeast', 0.95, '0.02 0.1 0.26 0.48 0.69 0.86 0.97', [1.04, 0.99, 0.94]);

  X.svgFrame = n => {
    const t = X.tOf(n);
    fid = 0;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${X.defs()}</defs><rect width="${W}" height="${H}" fill="#000"/>${X.frameBody(t)}${X.post(t, n)}</svg>`;
  };
  G.ENG = X;
})(window);






