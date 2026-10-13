// Viking raid short — shared helpers and animated effects (fire, smoke, embers, fog, water).
// Everything is a pure function of time t so any frame renders on its own.

const rng = seed => { let s = (Math.abs(Math.floor(seed)) % 2147483646) + 1; return () => (s = (s * 16807) % 2147483647) / 2147483647; };
const F1 = n => (+n).toFixed(1);
let FXN = 0;
const fid = p => p + (FXN++);
const flick = (t, s = 0) => .62 + .2 * Math.sin(t * 13.1 + s) + .18 * Math.sin(t * 7.7 + s * 2.3);

addDefs(`
  <filter id="fireBlur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.6"/></filter>
  <filter id="fireSoft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="7"/></filter>
  <filter id="smokeBlur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="22"/></filter>
  <filter id="smokeBlur2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="34"/></filter>
  <filter id="fogBlur" x="-50%" y="-80%" width="200%" height="260%"><feGaussianBlur stdDeviation="38"/></filter>
  <filter id="b3"><feGaussianBlur stdDeviation="3"/></filter>
  <filter id="b8" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="8"/></filter>
  <filter id="b14" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="14"/></filter>
  <radialGradient id="fireGlow" cx=".5" cy=".55" r=".5"><stop offset="0" stop-color="#ffb04a" stop-opacity=".85"/><stop offset=".45" stop-color="#ff6a1c" stop-opacity=".35"/><stop offset="1" stop-color="#ff5a10" stop-opacity="0"/></radialGradient>
  <radialGradient id="emberG" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff2b0"/><stop offset=".5" stop-color="#ff9a2a"/><stop offset="1" stop-color="#ff5a10" stop-opacity="0"/></radialGradient>
  <linearGradient id="fl0" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#d4400f"/><stop offset=".55" stop-color="#9a2a0c" stop-opacity=".85"/><stop offset="1" stop-color="#5a1406" stop-opacity="0"/></linearGradient>
  <linearGradient id="fl1" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ffb347"/><stop offset=".5" stop-color="#f2671c" stop-opacity=".9"/><stop offset="1" stop-color="#c4380e" stop-opacity="0"/></linearGradient>
  <linearGradient id="fl2" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#fff6c8"/><stop offset=".45" stop-color="#ffd36a" stop-opacity=".95"/><stop offset="1" stop-color="#ff9a2e" stop-opacity="0"/></linearGradient>
`);

// A painted fire: three layers of swaying flame tongues + glow. (x, y) = base centre, w = width, h = height.
function fire(x, y, w, h, t, { seed = 1, n = 9, intensity = 1, glow = 1 } = {}) {
  const R = rng(seed * 97 + 13);
  let out = glow ? `<ellipse cx="${F1(x)}" cy="${F1(y - h * .35)}" rx="${F1(w * .95)}" ry="${F1(h * .85 * intensity)}" fill="url(#fireGlow)" opacity="${(.6 * glow * flick(t, seed)).toFixed(2)}"/>` : '';
  for (let layer = 0; layer < 3; layer++) {
    const nn = Math.max(2, n - layer * 2);
    let tongues = '';
    for (let i = 0; i < nn; i++) {
      const bx = x + (i + .5 - nn / 2) * (w / nn) + (R() - .5) * w / nn * .5;
      const bw = w / nn * (0.8 + R() * .5) * (1 - layer * .15);
      const ph = R() * 6.28, sp = 5 + R() * 5;
      const hh = h * intensity * (0.5 + R() * .5) * (1 - layer * .25) * (1 + .2 * Math.sin(t * sp + ph) + .1 * Math.sin(t * 17 + ph * 3));
      const sway = Math.sin(t * (3 + R() * 2.5) + ph) * bw * .8 + Math.sin(t * 9 + ph) * bw * .2;
      tongues += `<path d="M${F1(bx - bw)} ${F1(y)} C${F1(bx - bw * .95)} ${F1(y - hh * .45)} ${F1(bx + sway * .35 - bw * .35)} ${F1(y - hh * .72)} ${F1(bx + sway)} ${F1(y - hh)} C${F1(bx + sway * .45 + bw * .4)} ${F1(y - hh * .62)} ${F1(bx + bw * .95)} ${F1(y - hh * .42)} ${F1(bx + bw)} ${F1(y)} Z" fill="url(#fl${layer})"/>`;
    }
    out += `<g filter="url(#fireBlur)">${tongues}</g>`;
  }
  return out;
}

// Rising smoke: blurred puffs that grow and fade as they rise.
function smoke(x, y, t, { seed = 1, n = 10, H = 900, drift = 140, r0 = 40, r1 = 200, col = '#3a3430', op = .55, speed = .11, blur = 'smokeBlur' } = {}) {
  const R = rng(seed * 31 + 7);
  let s = '';
  for (let i = 0; i < n; i++) {
    const off = R(), wob = R() * 6.28;
    const p = (t * speed + off) % 1;
    const xx = x + drift * p + Math.sin(t * .7 + wob) * 40 * p;
    const yy = y - H * p;
    const rr = r0 + (r1 - r0) * p;
    const o = op * Math.min(1, p * 5) * (1 - p) * 1.4;
    s += `<circle cx="${F1(xx)}" cy="${F1(yy)}" r="${F1(rr)}" fill="${col}" opacity="${Math.max(0, o).toFixed(3)}"/>`;
  }
  return `<g filter="url(#${blur})">${s}</g>`;
}

// Embers drifting up from a fire.
function embers(x, y, w, H, t, { seed = 3, n = 14, speed = .35, size = 4 } = {}) {
  const R = rng(seed * 13 + 5);
  let s = '';
  for (let i = 0; i < n; i++) {
    const off = R(), xo = (R() - .5) * w, ph = R() * 6.28, sz = size * (.5 + R());
    const p = (t * speed * (.7 + R() * .6) + off) % 1;
    const xx = x + xo + Math.sin(t * 2 + ph) * 25 * p + 60 * p;
    const yy = y - H * p;
    const o = Math.sin(Math.PI * p) * (.6 + .4 * Math.sin(t * 20 + ph));
    s += `<circle cx="${F1(xx)}" cy="${F1(yy)}" r="${F1(sz)}" fill="url(#emberG)" opacity="${Math.max(0, o).toFixed(2)}"/>`;
  }
  return s;
}

// Drifting fog bank: large blurred ellipses sliding sideways (wrapping), centred on y.
function fogBank(y, t, { seed = 1, n = 8, h = 150, speed = 18, op = .38, col = '#c8d0d8', spread = 1700, blur = 'fogBlur' } = {}) {
  const R = rng(seed * 53 + 11);
  let s = '';
  for (let i = 0; i < n; i++) {
    const x0 = R() * spread - 300, rx = 260 + R() * 320, ry = h * (.6 + R() * .7), dy = (R() - .5) * h * 1.2;
    const x = ((x0 + t * speed * (.7 + R() * .6)) % spread + spread) % spread - 300;
    s += `<ellipse cx="${F1(x)}" cy="${F1(y + dy)}" rx="${F1(rx)}" ry="${F1(ry)}" fill="${col}" opacity="${(op * (.6 + R() * .4)).toFixed(2)}"/>`;
  }
  return `<g filter="url(#${blur})">${s}</g>`;
}

// Sea surface between y0 (horizon) and y1 with perspective wave lines moving sideways.
function seaSurface(y0, y1, t, { far = '#4d5b6b', near = '#1d2833', hi = '#9fb1c2', seed = 2, rows = 16, speed = 30, glint = .35 } = {}) {
  const id = fid('sea'), R = rng(seed);
  let lines = '';
  for (let k = 0; k < rows; k++) {
    const p = k / (rows - 1), yy = y0 + (y1 - y0) * Math.pow(p, 1.7);
    const amp = 2 + p * 16, wl = 60 + p * 260, ph = R() * 6.28, sp = speed * (.4 + p);
    let d = `M-320 ${F1(yy)}`;
    for (let x = -320; x <= 1400; x += 40) d += ` L${x} ${F1(yy + Math.sin((x + t * sp) / wl * 6.28 + ph) * amp)}`;
    lines += `<path d="${d}" stroke="${hi}" stroke-width="${F1(1.5 + p * 5)}" fill="none" opacity="${(glint * (.25 + .5 * (1 - p))).toFixed(2)}"/>`;
    lines += `<path d="${d}" stroke="#000" stroke-width="${F1(3 + p * 9)}" fill="none" opacity="${(.12 + .1 * p).toFixed(2)}" transform="translate(0 ${F1(6 + p * 14)})"/>`;
  }
  return `<defs>${linG(id, [far, near], { x2: 0, y2: 1 })}</defs><rect x="-320" y="${y0}" width="1720" height="${y1 - y0 + 600}" fill="url(#${id})"/>${lines}`;
}

// Soft vignette / colour grade overlays used by several shots.
const grade = (col, op, mode = 'multiply') => `<rect x="-100" y="-100" width="1280" height="2120" fill="${col}" opacity="${op}" style="mix-blend-mode:${mode}"/>`;
const darkness = op => `<rect x="-100" y="-100" width="1280" height="2120" fill="#05060a" opacity="${op}"/>`;
