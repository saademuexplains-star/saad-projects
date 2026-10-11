// Shared helpers (from the gladiator short): placement, limbs, hands, small fx.
let TL;
const B = t => TL.beat(t);
const at = (x, y, s, svg) => `<g transform="translate(${F1(x)} ${F1(y)}) scale(${s})">${svg}</g>`;
const atR = (x, y, s, r, svg) => `<g transform="translate(${F1(x)} ${F1(y)}) rotate(${F1(r)}) scale(${s})">${svg}</g>`;
const P = (look, pose) => lit(person(look, pose), { warm: 'warm2', shade: 'shade2' });
const wob = (t, f = 1.6, a = 1) => Math.sin(t * f) * a;
const flashRect = (op, col = '#fff1d6') => op > .002 ? `<rect x="-200" y="-200" width="1480" height="2320" fill="${col}" opacity="${op.toFixed(3)}"/>` : '';
const SKM = SKIN_TONES.medium, SKL = SKIN_TONES.light;
const cloth = (c) => ({ mid: c, hi: lighten(c, .22), shade: darken(c, .45) });
// a person-local point (lx, ly) placed with translate(X,Y) rotate(R) scale(s) → canvas point
const place = (X, Y, s, R, [lx, ly]) => { const a = R * Math.PI / 180; return [X + s * (lx * Math.cos(a) - ly * Math.sin(a)), Y + s * (lx * Math.sin(a) + ly * Math.cos(a))]; };

addDefs(`<filter id="silhB"><feColorMatrix type="matrix" values="0 0 0 0 .03  0 0 0 0 .035  0 0 0 0 .06  0 0 0 1 0"/></filter>
  <filter id="rimF"><feColorMatrix type="matrix" values="0 0 0 0 .66  0 0 0 0 .77  0 0 0 0 1  0 0 0 1 0"/><feGaussianBlur stdDeviation="2"/></filter>
  <filter id="silh"><feColorMatrix type="matrix" values="0.1 0 0 0 0.02  0 0.09 0 0 0.02  0 0 0.11 0 0.03  0 0 0 1 0"/></filter>
  <filter id="shadowF" x="-20%" y="-20%" width="140%" height="140%"><feColorMatrix type="matrix" values="0 0 0 0 .02  0 0 0 0 .01  0 0 0 0 .01  0 0 0 .9 0"/><feGaussianBlur stdDeviation="5"/></filter>
  <filter id="b5" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5"/></filter>
  <radialGradient id="ironGlow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffb050" stop-opacity=".9"/><stop offset=".4" stop-color="#ff5a14" stop-opacity=".45"/><stop offset="1" stop-color="#ff3a0a" stop-opacity="0"/></radialGradient>
  <radialGradient id="sunGlow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fffbea" stop-opacity="1"/><stop offset=".35" stop-color="#ffe9b0" stop-opacity=".55"/><stop offset="1" stop-color="#ffd890" stop-opacity="0"/></radialGradient>
  <linearGradient id="marbleG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4efe6"/><stop offset=".5" stop-color="#ddd5c6"/><stop offset="1" stop-color="#a89e8c"/></linearGradient>
  <radialGradient id="warm2" cx=".2" cy=".15" r=".75"><stop offset="0" stop-color="#ffd59a" stop-opacity=".2"/><stop offset="1" stop-color="#ffd59a" stop-opacity="0"/></radialGradient>
  <linearGradient id="shade2" x1="0" y1="0" x2="1" y2=".3"><stop offset=".3" stop-color="#1b1020" stop-opacity="0"/><stop offset="1" stop-color="#1b1020" stop-opacity=".55"/></linearGradient>
  <linearGradient id="ironBarG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3a3a42"/><stop offset=".3" stop-color="#16161a"/><stop offset="1" stop-color="#050506"/></linearGradient>`);

// ---------- custom limbs (canvas coordinates) ----------
// a tapered limb from (x0,y0) w0 wide to (x1,y1) w1 wide, lit from the upper left
function limb(x0, y0, x1, y1, w0, w1, { S = SKM, sk = 'medium', fill = null, swell = 1.1 } = {}) {
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
  const lk = (-nx - ny) > 0 ? 1 : -1;
  const p = (x, y, w, k) => `${F1(x + nx * w * k / 2)} ${F1(y + ny * w * k / 2)}`;
  const mx_ = x0 + dx * .38, my_ = y0 + dy * .38, wm = Math.max(w0, w1) * swell;
  const d = `M${p(x0, y0, w0, 1)} Q${p(mx_, my_, wm * 1.1, 1)} ${p(x1, y1, w1, 1)} L${p(x1, y1, w1, -1)} Q${p(mx_, my_, wm * 1.1, -1)} ${p(x0, y0, w0, -1)} Z`;
  return `<path d="${d}" fill="${fill || S.mid}" filter="url(#pk_${sk})"/>
    <path d="M${p(x0, y0, w0 * .62, lk)} Q${p(mx_, my_, wm * .74, lk)} ${p(x1, y1, w1 * .62, lk)}" stroke="${S.hi}" stroke-width="${F1(w0 * .13)}" fill="none" opacity=".5" stroke-linecap="round" filter="url(#soft2)"/>
    <path d="M${p(x0, y0, w0 * .66, -lk)} Q${p(mx_, my_, wm * .78, -lk)} ${p(x1, y1, w1 * .66, -lk)}" stroke="${S.shade}" stroke-width="${F1(w0 * .17)}" fill="none" opacity=".42" stroke-linecap="round" filter="url(#soft)"/>`;
}
// a closed fist seen from the back of the hand, fingers stacked vertically (gripping something horizontal)
function fist(x, y, s = 1, rot = 0, { S = SKM, sk = 'medium' } = {}) {
  const fingers = [-39, -13, 13, 39].map((fy, i) => `<rect x="-66" y="${fy - 14}" width="${82 - i * 4}" height="28" rx="14" fill="${S.mid}" filter="url(#pks_${sk})"/>
    <path d="M-60 ${fy - 7} Q-30 ${fy - 12} ${10 - i * 4} ${fy - 8}" stroke="${S.hi}" stroke-width="5" fill="none" opacity=".45"/>`).join('');
  return `<g transform="translate(${F1(x)} ${F1(y)}) rotate(${F1(rot)}) scale(${s})">
    <path d="M-40 -58 C-10 -66 40 -62 60 -40 C70 -10 70 30 56 52 C36 66 -10 64 -36 56 Z" fill="${S.lo}" filter="url(#pk_${sk})"/>
    ${fingers}
    <path d="M-30 -60 C-10 -76 30 -74 44 -56 C30 -50 0 -50 -30 -46 Z" fill="${S.mid}" filter="url(#pks_${sk})"/>
    <path d="M30 -40 C40 -10 42 20 34 46" stroke="${S.shade}" stroke-width="10" fill="none" opacity=".4" filter="url(#soft2)"/></g>`;
}
// a hand raised with one finger up (back of the hand to camera); fin = 0..1 finger extension, tr = tremble
function fingerHand(x, y, s = 1, rot = 0, { S = SKM, sk = 'medium', fin = 1, dirt = 1 } = {}) {
  const fl = 40 + 150 * fin;
  return `<g transform="translate(${F1(x)} ${F1(y)}) rotate(${F1(rot)}) scale(${s})">
    <path d="M-62 -20 C-66 -70 -40 -96 -10 -98 L40 -96 C66 -90 74 -60 70 -20 L66 60 C60 96 30 108 0 108 C-36 108 -60 90 -62 56 Z" fill="${S.mid}" filter="url(#pk_${sk})"/>
    ${[-1, 0, 1].map(i => `<rect x="${-58 + (i + 1) * 40}" y="-112" width="36" height="${70 - Math.abs(i) * 6}" rx="18" fill="${S.mid}" filter="url(#pks_${sk})"/>
      <circle cx="${-40 + (i + 1) * 40}" cy="-100" r="9" fill="${S.hi}" opacity=".35"/>`).join('')}
    <path d="M-60 -60 C-56 -${F1(fl * .5 + 40)} -58 -${F1(fl + 40)} -40 -${F1(fl + 56)} C-26 -${F1(fl + 66)} -10 -${F1(fl + 50)} -14 -${F1(fl + 30)} C-16 -${F1(fl * .5 + 40)} -18 -90 -16 -60 Z" fill="${S.mid}" filter="url(#pk_${sk})"/>
    <path d="M-48 -70 C-46 -${F1(fl * .5 + 50)} -46 -${F1(fl + 30)} -38 -${F1(fl + 50)}" stroke="${S.hi}" stroke-width="7" fill="none" opacity=".45" filter="url(#soft2)"/>
    <path d="M-40 -${F1(fl + 50)} c4 -6 12 -6 16 2" stroke="#efe0cc" stroke-width="6" fill="none" opacity=".7"/>
    <path d="M60 -20 C90 -6 96 30 70 50" stroke="${S.mid}" stroke-width="40" stroke-linecap="round" fill="none" filter="url(#pks_${sk})"/>
    ${dirt ? `<g fill="#6a5034" opacity=".35" filter="url(#soft2)"><ellipse cx="20" cy="30" rx="24" ry="12"/><ellipse cx="-30" cy="70" rx="16" ry="9"/><ellipse cx="-36" cy="-${F1(fl * .6 + 30)}" rx="7" ry="14"/></g>` : ''}
    <path d="M-50 30 Q0 44 50 28" stroke="${S.shade}" stroke-width="6" fill="none" opacity=".35"/></g>`;
}
// an open hand, palm to camera, fingers up, a gold ring on the ring finger
function openHand(x, y, s = 1, rot = 0, { S = SKL, sk = 'light' } = {}) {
  const f = [[-42, 128, -9], [-14, 150, -3], [14, 144, 3], [40, 118, 10]].map(([fx, len, a], i) => `<g transform="rotate(${a} ${fx} -60)">
    <rect x="${fx - 14}" y="${-60 - len}" width="28" height="${len + 24}" rx="14" fill="${S.mid}" filter="url(#pks_${sk})"/>
    <path d="M${fx - 6} ${-50 - len} L${fx - 6} ${-70}" stroke="${S.hi}" stroke-width="6" opacity=".45" stroke-linecap="round"/>
    ${i === 2 ? `<rect x="${fx - 16}" y="${-60 - len * .45}" width="32" height="13" rx="5" fill="url(#goldG)"/><circle cx="${fx}" cy="${-56 - len * .45}" r="8" fill="#2a6a4a"/>` : ''}</g>`).join('');
  return `<g transform="translate(${F1(x)} ${F1(y)}) rotate(${F1(rot)}) scale(${s})">
    <path d="M-62 -66 C-66 -10 -60 46 -40 86 L42 86 C60 46 64 -10 60 -66 Z" fill="${S.mid}" filter="url(#pk_${sk})"/>
    ${f}
    <path d="M-58 0 C-92 -18 -112 -54 -120 -88" stroke="${S.mid}" stroke-width="30" stroke-linecap="round" fill="none" filter="url(#pks_${sk})"/>
    <path d="M-30 -30 Q0 10 30 -20 M-40 30 Q0 50 40 26" stroke="${S.shade}" stroke-width="5" fill="none" opacity=".45"/></g>`;
}
// a pointing index finger stuck onto a rig hand (person-local hand position hx,hy; ang = arm angle, deg)
const pointer = (hx, hy, ang, S = SKL, sk = 'light') => `<path d="M${F1(hx)} ${F1(hy)} l${F1(Math.cos(ang) * 88)} ${F1(Math.sin(ang) * 88)}" stroke="${S.mid}" stroke-width="22" stroke-linecap="round" filter="url(#pks_${sk})"/>`;

// ---------- small fx ----------
const puff = (x, y, t, t0, { col = '#a8987a', r = 160, n = 6, seed = 2, dur = 1.4, op = .55 } = {}) => {
  if (t < t0 || t > t0 + dur) return '';
  const R = rng(seed), p = (t - t0) / dur;
  let s = '';
  for (let i = 0; i < n; i++) s += `<circle cx="${F1(x + (R() - .5) * r * 2.4 * easeOut(p))}" cy="${F1(y - R() * r * .8 * easeOut(p))}" r="${F1(r * (.4 + .7 * easeOut(p)) * (.6 + R() * .5))}" fill="${col}" opacity="${(op * (1 - p)).toFixed(2)}"/>`;
  return `<g filter="url(#b14)">${s}</g>`;
};
const spray = (x, y, t, t0, { n = 18, col = '#b9a27c', spread = 260, up = 420, seed = 4, size = 9, g = 900 } = {}) => {
  if (t < t0 || t > t0 + 1.2) return '';
  const R = rng(seed), dt = t - t0;
  let s = '';
  for (let i = 0; i < n; i++) {
    const vx = (R() - .5) * spread * 2, vy = -up * (.4 + R() * .8), r = size * (.5 + R());
    s += `<circle cx="${F1(x + vx * dt)}" cy="${F1(y + vy * dt + g * dt * dt)}" r="${F1(r)}" fill="${col}" opacity="${Math.max(0, 1 - dt / 1.1).toFixed(2)}"/>`;
  }
  return s;
};
// steam curling up from a point
const steam = (x, y, t, amt = 1, { n = 5, h = 320, seed = 3, col = '#ece6dc' } = {}) => {
  if (amt <= .01) return '';
  const R = rng(seed);
  let s = '';
  for (let i = 0; i < n; i++) {
    const ph = R(), p = (t * .55 + ph) % 1, sw = Math.sin(t * 2.2 + i * 1.7) * 26 * p;
    s += `<circle cx="${F1(x + sw + (R() - .5) * 30)}" cy="${F1(y - h * p)}" r="${F1(14 + 46 * p)}" fill="${col}" opacity="${(.32 * amt * Math.sin(Math.PI * p)).toFixed(2)}"/>`;
  }
  return `<g filter="url(#b14)">${s}</g>`;
};
// iron bars in the foreground, softly blurred (camera is close to them)
const fgBars = (xs, { w = 70, y0 = -200, y1 = 2200, blur = 'b8', rim = '#9ab0d8', rimOp = .45 } = {}) => `<g filter="url(#${blur})">${xs.map(x => `
  <rect x="${x - w / 2}" y="${y0}" width="${w}" height="${y1 - y0}" fill="url(#ironBarG)"/><rect x="${x - w / 2 + 4}" y="${y0}" width="${F1(w * .14)}" height="${y1 - y0}" fill="${rim}" opacity="${rimOp}"/>`).join('')}</g>`;

// ---------- the feast (shot 1 and shot 21 share it so the end frame matches the first) ----------
