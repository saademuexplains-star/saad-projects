// Cut-out character rig. Everything returns SVG strings.
// Hand rules (fixes "inverted hands" / "hands behind belly"):
//  1. Arms are always drawn AFTER torso, head and held props, so hands sit in front of the body.
//  2. Characters are never mirrored with scale(-1); each hand knows if it is the RIGHT or LEFT hand
//     and whether the palm or the back faces the camera, and the thumb side is derived from that.
//  3. The hand always continues the forearm direction (optional wrist bend is clamped to +-60deg).
(function (G) {
  const OUT = '#26180f';
  let UID = 0;
  const uid = p => p + (++UID);
  const f = n => Math.round(n * 100) / 100;
  const hex2rgb = h => { const c = parseInt(h.slice(1), 16); return [c >> 16, (c >> 8) & 255, c & 255]; };
  const rgb2hex = (r, g, b) => '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const shade = (h, a) => { const [r, g, b] = hex2rgb(h); const t = a < 0 ? 0 : 255, p = Math.abs(a); return rgb2hex(r + (t - r) * p, g + (t - g) * p, b + (t - b) * p); };
  const mix = (h1, h2, p) => { const a = hex2rgb(h1), b = hex2rgb(h2); return rgb2hex(a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p, a[2] + (b[2] - a[2]) * p); };
  const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const P = (...pts) => pts.map(p => f(p[0]) + ',' + f(p[1])).join(' ');

  function defs() {
    return `
<filter id="air" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
 <feGaussianBlur in="SourceAlpha" stdDeviation="11" result="b"/>
 <feComposite in="SourceAlpha" in2="b" operator="arithmetic" k1="0" k2="1" k3="-1" k4="0" result="e"/>
 <feFlood flood-color="#1a0d05" flood-opacity="0.5"/><feComposite in2="e" operator="in" result="s"/>
 <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="s"/></feMerge></filter>
<filter id="airS" x="-30%" y="-30%" width="160%" height="160%" color-interpolation-filters="sRGB">
 <feGaussianBlur in="SourceAlpha" stdDeviation="5" result="b"/>
 <feComposite in="SourceAlpha" in2="b" operator="arithmetic" k1="0" k2="1" k3="-1" k4="0" result="e"/>
 <feFlood flood-color="#1a0d05" flood-opacity="0.45"/><feComposite in2="e" operator="in" result="s"/>
 <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="s"/></feMerge></filter>
<filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter>
<filter id="soft2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9"/></filter>
<filter id="dof1" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="2.5"/></filter>
<filter id="dof2" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="6"/></filter>
<filter id="dof3" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="12"/></filter>
<filter id="dof4" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="22"/></filter>
<filter id="glow" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="40"/></filter>
<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>`;
  }

  const DIMS = {
    kid: { headY: -436, hw: 166, hh: 178, neckY: -352, shY: -340, shX: 62, wY: -250, wX: 57, hemY: -128, hemX: 82, ua: 80, fa: 76, sw: 38, hand: 50, legW: 34, legX: 24, foot: 34, ow: 3.2 },
    man: { headY: -672, hw: 170, hh: 198, neckY: -578, shY: -560, shX: 96, wY: -415, wX: 82, hemY: -250, hemX: 104, ua: 118, fa: 110, sw: 48, hand: 60, legW: 44, legX: 32, foot: 44, ow: 3.6 },
    woman: { headY: -640, hw: 158, hh: 182, neckY: -552, shY: -536, shX: 82, wY: -405, wX: 70, hemY: -14, hemX: 128, ua: 110, fa: 102, sw: 42, hand: 52, legW: 0, legX: 0, foot: 34, ow: 3.4 }
  };

  // ---------- hands ----------
  // side: 'R' = character's right hand (viewer's left), 'L' = character's left (viewer's right)
  // facing: 'back' (back of hand to camera) | 'palm'; thumb: 'auto' | 'up' | 'down' | 'left' | 'right' (screen)
  function hand(o) {
    const S = o.size, skin = o.skin, ow = o.ow;
    let [dx, dy] = o.dir; const n = Math.hypot(dx, dy) || 1; dx /= n; dy /= n;
    const a = Math.atan2(-dx, dy);              // rotation mapping local +y -> forearm direction
    const lx = [Math.cos(a), Math.sin(a)];        // screen direction of local +x
    let t;
    if (o.thumb && o.thumb !== 'auto') {
      const w = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[o.thumb];
      t = (lx[0] * w[0] + lx[1] * w[1]) >= 0 ? 1 : -1;
    } else {
      t = (o.side === 'R' ? -1 : 1) * (o.facing === 'palm' ? 1 : -1);
    }
    const pw = S * 0.64, pl = S * 0.5, fl = S * (o.pose === 'relaxed' ? 0.4 : 0.48);
    const sk2 = shade(skin, -0.22), line = `stroke="${OUT}" stroke-width="${ow}" stroke-linejoin="round"`;
    const cap = (x1, y1, x2, y2, wd) =>
      `<path d="M${f(x1)},${f(y1)} L${f(x2)},${f(y2)}" stroke="${OUT}" stroke-width="${f(wd + ow * 2)}" stroke-linecap="round" fill="none"/>` +
      `<path d="M${f(x1)},${f(y1)} L${f(x2)},${f(y2)}" stroke="${skin}" stroke-width="${f(wd)}" stroke-linecap="round" fill="none"/>`;
    let g = '';
    if (o.pose === 'open' || o.pose === 'relaxed') {
      const ang = (o.pose === 'relaxed' ? 18 : 38) * Math.PI / 180;
      const bx = t * pw * 0.36, by = pl * 0.22, L = S * 0.4;
      g += cap(bx, by, bx + t * Math.sin(ang) * L, by + Math.cos(ang) * L, pw * 0.36);
      const r = pw * 0.42, yb = pl + fl, xb = pw * 0.47;
      g += `<path d="M${f(-pw / 2)},0 L${f(-xb)},${f(yb - r)} Q${f(-xb)},${f(yb)} ${f(-xb + r)},${f(yb)} L${f(xb - r)},${f(yb)} Q${f(xb)},${f(yb)} ${f(xb)},${f(yb - r)} L${f(pw / 2)},0 Q0,${f(-S * 0.08)} ${f(-pw / 2)},0Z" fill="${skin}" ${line}/>`;
      for (const k of [-0.24, 0.0, 0.24]) g += `<path d="M${f(k * pw)},${f(pl + fl * 0.12)} L${f(k * pw)},${f(pl + fl * 0.9)}" stroke="${OUT}" stroke-width="${f(ow * 0.7)}" stroke-linecap="round" opacity="0.55"/>`;
      if (o.facing === 'palm') g += `<path d="M${f(-pw * 0.3)},${f(pl * 0.5)} Q0,${f(pl * 0.85)} ${f(pw * 0.28)},${f(pl * 0.45)}" stroke="${sk2}" stroke-width="${f(ow * 0.7)}" fill="none" opacity="0.6"/>`;
      else for (const k of [-0.24, 0.0, 0.24]) g += `<path d="M${f(k * pw - pw * 0.07)},${f(pl * 0.98)} q${f(pw * 0.07)},${f(S * 0.04)} ${f(pw * 0.14)},0" stroke="${sk2}" stroke-width="${f(ow * 0.6)}" fill="none" opacity="0.6"/>`;
    } else { // fist / point
      const fh = S * 0.62;
      g += `<rect x="${f(-pw * 0.52)}" y="${f(-S * 0.04)}" width="${f(pw * 1.04)}" height="${f(fh)}" rx="${f(pw * 0.36)}" fill="${skin}" ${line}/>`;
      for (const k of [-0.2, 0.02, 0.24]) g += `<path d="M${f(k * pw - t * pw * 0.05)},${f(fh * 0.62)} L${f(k * pw - t * pw * 0.05)},${f(fh * 0.94)}" stroke="${OUT}" stroke-width="${f(ow * 0.7)}" stroke-linecap="round" opacity="0.5"/>`;
      if (o.pose === 'point') g += cap(t * pw * 0.26, fh * 0.6, t * pw * 0.26, fh + S * 0.5, pw * 0.3);
      g += cap(t * pw * 0.5, S * 0.12, t * pw * 0.05, S * 0.26, pw * 0.3); // thumb wrapped over fingers
    }
    const deg = a * 180 / Math.PI;
    return `<g transform="translate(${f(o.x)},${f(o.y)}) rotate(${f(deg)})">${g}</g>`;
  }

  // ---------- arms (2-bone IK) ----------
  function arm(side, sh, o, D, C) {
    // fs/us: foreshortening (forearm/upper arm pointing toward camera looks shorter in a front view)
    const L1 = D.ua * (o.us || 1), L2 = D.fa * (o.fs || 1);
    let [hx, hy] = o.hand;
    let vx = hx - sh[0], vy = hy - sh[1], d = Math.hypot(vx, vy);
    const maxd = (L1 + L2) * 0.995, mind = Math.abs(L1 - L2) + 2;
    if (d > maxd) { hx = sh[0] + vx / d * maxd; hy = sh[1] + vy / d * maxd; d = maxd; }
    if (d < mind) { hx = sh[0] + vx / d * mind; hy = sh[1] + vy / d * mind; d = mind; }
    const base = Math.atan2(hy - sh[1], hx - sh[0]);
    const off = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d))));
    const e1 = [sh[0] + L1 * Math.cos(base + off), sh[1] + L1 * Math.sin(base + off)];
    const e2 = [sh[0] + L1 * Math.cos(base - off), sh[1] + L1 * Math.sin(base - off)];
    const lat = side === 'R' ? -1 : 1;
    // human elbows hang down and slightly out: prefer the lower solution, then the more lateral one
    const score = e => e[1] * 1.0 + e[0] * lat * 0.45;
    let E = score(e1) > score(e2) ? e1 : e2;
    if (o.elbow === 'in') E = (E === e1) ? e2 : e1;
    const W = [hx, hy];
    let dir = [W[0] - E[0], W[1] - E[1]];
    if (o.bend) { const b = Math.max(-60, Math.min(60, o.bend)) * Math.PI / 180; dir = [dir[0] * Math.cos(b) - dir[1] * Math.sin(b), dir[0] * Math.sin(b) + dir[1] * Math.cos(b)]; }
    const sw = D.sw, ow = D.ow, sl = o.sleeve || C.sleeve;
    const up = `M${P(sh)} L${P(E)}`, fo = `M${P(E)} L${P(W)}`;
    const fl = Math.hypot(W[0] - E[0], W[1] - E[1]);
    const cuffA = [E[0] + (W[0] - E[0]) * 0.78, E[1] + (W[1] - E[1]) * 0.78];
    let g = '';
    g += `<path d="${up}" stroke="${OUT}" stroke-width="${f(sw + ow * 2)}" stroke-linecap="round" fill="none"/>`;
    g += `<path d="${fo}" stroke="${OUT}" stroke-width="${f(sw * 0.86 + ow * 2)}" stroke-linecap="butt" fill="none"/>`;
    g += `<circle cx="${f(E[0])}" cy="${f(E[1])}" r="${f(sw * 0.5 + ow)}" fill="${OUT}"/>`;
    const handSvg = o.pose === 'none' ? '' : hand({ x: W[0], y: W[1], dir, side, facing: o.facing || 'back', thumb: o.thumb || 'auto', pose: o.pose || 'relaxed', size: D.hand, skin: C.skin, ow });
    if (!o.detachHand) g += handSvg;
    g += `<path d="${up}" stroke="${sl}" stroke-width="${f(sw)}" stroke-linecap="round" fill="none"/>`;
    g += `<circle cx="${f(E[0])}" cy="${f(E[1])}" r="${f(sw * 0.47)}" fill="${sl}"/>`;
    g += `<path d="${fo}" stroke="${sl}" stroke-width="${f(sw * 0.86)}" stroke-linecap="butt" fill="none"/>`;
    g += `<path d="M${P(cuffA)} L${P(W)}" stroke="${shade(sl, -0.18)}" stroke-width="${f(sw * 0.9)}" stroke-linecap="butt" fill="none"/>`;
    // cuff edge line (perpendicular at wrist)
    const nx = -(W[1] - E[1]) / fl, ny = (W[0] - E[0]) / fl, hw = sw * 0.45;
    g += `<path d="M${f(W[0] + nx * hw)},${f(W[1] + ny * hw)} L${f(W[0] - nx * hw)},${f(W[1] - ny * hw)}" stroke="${OUT}" stroke-width="${f(ow)}" stroke-linecap="round"/>`;
    // elbow fold
    g += `<path d="M${f(E[0] - nx * sw * 0.25)},${f(E[1] - ny * sw * 0.25)} l${f(nx * sw * 0.2 + (W[0] - E[0]) / fl * 6)},${f(ny * sw * 0.2 + (W[1] - E[1]) / fl * 6)}" stroke="${OUT}" stroke-width="${f(ow * 0.6)}" opacity="0.4" stroke-linecap="round"/>`;
    return { svg: `<g filter="url(#airS)">${g}</g>`, hand: o.detachHand ? `<g filter="url(#airS)">${handSvg}</g>` : '', W, E };
  }

  // default hand positions (local, feet at 0,0)
  function restHand(kind, side) {
    const D = DIMS[kind], s = side === 'R' ? -1 : 1;
    return [s * (D.shX + D.sw * 0.25), D.shY + (D.ua + D.fa) * 0.93];
  }

  // ---------- head ----------
  function eye(cx, cy, rx, ry, o, side, kind) {
    const id = uid('e'), lk = o.look || [0, 0], st = o.eyes || 'open';
    const ow = kind === 'kid' ? 5.5 : 5;
    const lid = `stroke="${OUT}" stroke-width="${ow}" stroke-linecap="round" fill="none"`;
    if (st === 'closed') return `<path d="M${f(cx - rx)},${f(cy)} Q${f(cx)},${f(cy + ry * 0.9)} ${f(cx + rx)},${f(cy - ry * 0.05)}" ${lid}/>`;
    let ryy = ry * (st === 'wide' ? 1.22 : st === 'squint' ? 0.6 : 1), ir = ry * (st === 'wide' ? 0.78 : 0.98);
    const top = cy - ryy * 1.3, bot = cy + ryy * 1.15;
    const shape = `M${f(cx - rx)},${f(cy)} Q${f(cx)},${f(top)} ${f(cx + rx)},${f(cy)} Q${f(cx)},${f(bot)} ${f(cx - rx)},${f(cy)}Z`;
    const ix = cx + lk[0] * rx * 0.42, iy = cy + lk[1] * ryy * 0.3 + (st === 'squint' ? ryy * 0.2 : 0);
    const irisC = o.iris || '#6e5a3c';
    let g = `<clipPath id="${id}"><path d="${shape}"/></clipPath>`;
    g += `<path d="${shape}" fill="#f7f2ea"/>`;
    g += `<g clip-path="url(#${id})"><circle cx="${f(ix)}" cy="${f(iy)}" r="${f(ir)}" fill="${irisC}"/>` +
      `<circle cx="${f(ix)}" cy="${f(iy)}" r="${f(ir)}" fill="none" stroke="${shade(irisC, -0.45)}" stroke-width="2.2"/>` +
      `<circle cx="${f(ix)}" cy="${f(iy)}" r="${f(ir * 0.46)}" fill="#160f0b"/>` +
      `<circle cx="${f(ix + ir * 0.34)}" cy="${f(iy - ir * 0.38)}" r="${f(ir * 0.26)}" fill="#fff"/>` +
      `<path d="M${f(cx - rx)},${f(cy - ryy * 0.2)} Q${f(cx)},${f(top + ryy * 0.35)} ${f(cx + rx)},${f(cy - ryy * 0.2)}" stroke="#000" stroke-opacity="0.12" stroke-width="${f(ryy * 0.5)}" fill="none"/></g>`;
    g += `<path d="M${f(cx - rx * 1.06)},${f(cy + ryy * 0.12)} Q${f(cx)},${f(top - ryy * 0.12)} ${f(cx + rx * 1.1)},${f(cy - ryy * 0.04)}" ${lid}/>`;
    g += `<path d="M${f(cx - rx * 0.78)},${f(cy + ryy * 0.86)} Q${f(cx)},${f(bot + ryy * 0.18)} ${f(cx + rx * 0.8)},${f(cy + ryy * 0.84)}" stroke="#7a4f3a" stroke-width="2" fill="none" opacity="0.55"/>`;
    g += `<path d="M${f(cx - rx * 0.66)},${f(cy - ryy * 1.42)} Q${f(cx)},${f(cy - ryy * 1.95)} ${f(cx + rx * 0.72)},${f(cy - ryy * 1.36)}" stroke="#7a4f3a" stroke-width="2" fill="none" opacity="0.45"/>`;
    return g;
  }

  function mouth(type, y, w, h, skin) {
    const lip = mix(shade(skin, -0.32), '#b04a3c', 0.35), dark = '#3a1712';
    switch (type) {
      case 'o': return `<ellipse cx="0" cy="${f(y)}" rx="${f(w * 0.05)}" ry="${f(h * 0.05)}" fill="${dark}" stroke="${lip}" stroke-width="3"/>` +
        `<ellipse cx="0" cy="${f(y + h * 0.028)}" rx="${f(w * 0.03)}" ry="${f(h * 0.017)}" fill="#c25a58"/>`;
      case 'smile': return `<path d="M${f(-w * 0.09)},${f(y - 2)} Q0,${f(y + h * 0.07)} ${f(w * 0.09)},${f(y - 2)}" stroke="${lip}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
      case 'frown': return `<path d="M${f(-w * 0.08)},${f(y + 5)} Q0,${f(y - h * 0.04)} ${f(w * 0.08)},${f(y + 5)}" stroke="${lip}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
      case 'grimace': return `<rect x="${f(-w * 0.085)}" y="${f(y - h * 0.035)}" width="${f(w * 0.17)}" height="${f(h * 0.07)}" rx="${f(h * 0.025)}" fill="#f3efe6" stroke="${dark}" stroke-width="3"/>` +
        `<path d="M${f(-w * 0.08)},${f(y)} L${f(w * 0.08)},${f(y)}" stroke="#b8b0a2" stroke-width="2"/>`;
      case 'shout': return `<path d="M${f(-w * 0.08)},${f(y - h * 0.02)} Q0,${f(y - h * 0.045)} ${f(w * 0.08)},${f(y - h * 0.02)} Q${f(w * 0.06)},${f(y + h * 0.075)} 0,${f(y + h * 0.075)} Q${f(-w * 0.06)},${f(y + h * 0.075)} ${f(-w * 0.08)},${f(y - h * 0.02)}Z" fill="${dark}" stroke="${lip}" stroke-width="3"/>` +
        `<path d="M${f(-w * 0.06)},${f(y - h * 0.022)} L${f(w * 0.06)},${f(y - h * 0.022)} L${f(w * 0.05)},${f(y - h * 0.002)} L${f(-w * 0.05)},${f(y - h * 0.002)}Z" fill="#efe9de"/>`;
      default: return `<path d="M${f(-w * 0.07)},${f(y)} Q0,${f(y + 4)} ${f(w * 0.07)},${f(y)}" stroke="${lip}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    }
  }

  function head(o, kind) {
    const D = DIMS[kind], w = D.hw, h = D.hh, F = o.face || {}, skin = o.skin, sk2 = shade(skin, -0.2);
    const hairC = o.hair || '#4a3020', hairD = shade(hairC, -0.35);
    const tx = (F.turn || 0) * w * 0.07;
    const gid = uid('fg');
    let back = '', face = '', feat = '', front = '';
    // gradient
    const grad = `<radialGradient id="${gid}" cx="44%" cy="40%" r="62%"><stop offset="0" stop-color="${shade(skin, 0.14)}"/><stop offset="0.62" stop-color="${skin}"/><stop offset="1" stop-color="${sk2}"/></radialGradient>`;
    const chin = kind === 'kid' ? 0.5 : 0.52;
    const faceD = kind === 'kid'
      ? `M${f(-w * 0.47)},${f(-h * 0.22)} C${f(-w * 0.53)},${f(h * 0.12)} ${f(-w * 0.46)},${f(h * 0.38)} ${f(-w * 0.26)},${f(h * 0.47)} C${f(-w * 0.1)},${f(h * chin + 0.03 * h)} ${f(w * 0.1)},${f(h * chin + 0.03 * h)} ${f(w * 0.26)},${f(h * 0.47)} C${f(w * 0.46)},${f(h * 0.38)} ${f(w * 0.53)},${f(h * 0.12)} ${f(w * 0.47)},${f(-h * 0.22)} C${f(w * 0.42)},${f(-h * 0.56)} ${f(-w * 0.42)},${f(-h * 0.56)} ${f(-w * 0.47)},${f(-h * 0.22)}Z`
      : `M${f(-w * 0.45)},${f(-h * 0.24)} C${f(-w * 0.5)},${f(h * 0.1)} ${f(-w * 0.44)},${f(h * 0.36)} ${f(-w * 0.24)},${f(h * 0.48)} C${f(-w * 0.1)},${f(h * 0.55)} ${f(w * 0.1)},${f(h * 0.55)} ${f(w * 0.24)},${f(h * 0.48)} C${f(w * 0.44)},${f(h * 0.36)} ${f(w * 0.5)},${f(h * 0.1)} ${f(w * 0.45)},${f(-h * 0.24)} C${f(w * 0.4)},${f(-h * 0.56)} ${f(-w * 0.4)},${f(-h * 0.56)} ${f(-w * 0.45)},${f(-h * 0.24)}Z`;
    // hood / wimple back
    if (o.hood || o.wimple) {
      const c = o.hood || o.wimple;
      back += `<path d="M${f(-w * 0.66)},${f(h * 0.62)} C${f(-w * 0.78)},${f(-h * 0.2)} ${f(-w * 0.55)},${f(-h * 0.74)} 0,${f(-h * 0.74)} C${f(w * 0.55)},${f(-h * 0.74)} ${f(w * 0.78)},${f(-h * 0.2)} ${f(w * 0.66)},${f(h * 0.62)} Z" fill="${shade(c, -0.12)}" stroke="${OUT}" stroke-width="${D.ow}"/>`;
    } else {
      // ears
      for (const s of [-1, 1]) back += `<ellipse cx="${f(s * w * 0.49 + tx * 0.3)}" cy="${f(h * 0.06)}" rx="${f(w * 0.075)}" ry="${f(h * 0.1)}" fill="${shade(skin, -0.06)}" stroke="${OUT}" stroke-width="${D.ow}"/>` +
        `<path d="M${f(s * w * 0.5)},${f(h * 0.0)} q${f(s * w * 0.03)},${f(h * 0.05)} 0,${f(h * 0.11)}" stroke="${sk2}" stroke-width="2.5" fill="none"/>`;
    }
    face += `<path d="${faceD}" fill="url(#${gid})" stroke="${OUT}" stroke-width="${D.ow}"/>`;
    // cheeks
    for (const s of [-1, 1]) face += `<ellipse cx="${f(s * w * 0.27 + tx)}" cy="${f(h * 0.22)}" rx="${f(w * 0.1)}" ry="${f(h * 0.055)}" fill="#e3806e" opacity="0.32" filter="url(#soft)"/>`;
    // features
    const ey = kind === 'kid' ? h * 0.08 : h * 0.02, ex = kind === 'kid' ? w * 0.21 : w * 0.185;
    const erx = kind === 'kid' ? w * 0.12 : w * 0.095, ery = kind === 'kid' ? h * 0.077 : h * 0.052;
    const browY = ey - ery * 2.35, bc = o.brow || hairD;
    for (const s of [-1, 1]) {
      const cx = s * ex + tx;
      feat += eye(cx, ey, erx, ery, F, s, kind);
      const inner = F.brows === 'worried' || F.brows === 'sad' ? -10 : F.brows === 'angry' ? 9 : F.brows === 'raised' ? -12 : 0;
      const outer = F.brows === 'worried' || F.brows === 'sad' ? 3 : F.brows === 'angry' ? -4 : F.brows === 'raised' ? -12 : 0;
      const xi = cx - s * erx * 0.55, xo = cx + s * erx * 1.05;
      feat += `<path d="M${f(xi)},${f(browY + inner)} Q${f((xi + xo) / 2)},${f(browY - 7 + (inner + outer) / 2)} ${f(xo)},${f(browY + outer + 3)}" stroke="${bc}" stroke-width="${kind === 'kid' ? 6 : 8}" stroke-linecap="round" fill="none"/>`;
      if (F.brows === 'worried' || F.brows === 'sad') feat += `<path d="M${f(s * w * 0.05 + tx)},${f(browY - 16)} q${f(-s * 3)},${f(8)} 0,${f(14)}" stroke="${sk2}" stroke-width="2.5" fill="none" opacity="0.6"/>`;
    }
    if (kind !== 'kid') feat += `<path d="M${f(-w * 0.12 + tx)},${f(-h * 0.2)} q${f(w * 0.12)},-6 ${f(w * 0.24)},0" stroke="${sk2}" stroke-width="2" fill="none" opacity="0.45"/>`;
    // nose
    const ny = kind === 'kid' ? h * 0.25 : h * 0.22;
    feat += `<path d="M${f(tx + w * 0.012)},${f(ey + ery * 0.6)} q${f(w * 0.03)},${f(h * 0.08)} ${f(w * 0.01)},${f(ny - ey - ery * 0.2)}" stroke="${sk2}" stroke-width="2" fill="none" opacity="0.5"/>`;
    feat += `<ellipse cx="${f(tx)}" cy="${f(ny)}" rx="${f(w * 0.06)}" ry="${f(h * 0.042)}" fill="${shade(skin, -0.07)}"/>` +
      `<ellipse cx="${f(tx - w * 0.012)}" cy="${f(ny - h * 0.012)}" rx="${f(w * 0.022)}" ry="${f(h * 0.013)}" fill="#fff" opacity="0.35"/>` +
      `<ellipse cx="${f(tx - w * 0.026)}" cy="${f(ny + h * 0.022)}" rx="4" ry="2.6" fill="#5a2c20"/><ellipse cx="${f(tx + w * 0.026)}" cy="${f(ny + h * 0.022)}" rx="4" ry="2.6" fill="#5a2c20"/>`;
    // freckles
    if (F.freckles) { const r = rng(11); for (let i = 0; i < 14; i++) { const s = i % 2 ? 1 : -1; feat += `<circle cx="${f(s * w * (0.16 + r() * 0.16) + tx)}" cy="${f(h * (0.13 + r() * 0.12))}" r="${f(2 + r() * 1.8)}" fill="#c0683c" opacity="0.8"/>`; } }
    // beard (drawn before mouth so lips sit on top)
    const my = kind === 'kid' ? h * 0.385 : h * 0.355;
    if (o.beard) {
      const b = o.beard, bd = shade(b, -0.3);
      feat += `<path d="M${f(-w * 0.47)},${f(-h * 0.06)} C${f(-w * 0.5)},${f(h * 0.34)} ${f(-w * 0.3)},${f(h * 0.7)} 0,${f(h * 0.72)} C${f(w * 0.3)},${f(h * 0.7)} ${f(w * 0.5)},${f(h * 0.34)} ${f(w * 0.47)},${f(-h * 0.06)} L${f(w * 0.4)},${f(h * 0.0)} C${f(w * 0.38)},${f(h * 0.2)} ${f(w * 0.24)},${f(h * 0.29)} ${f(w * 0.13)},${f(h * 0.285)} Q${f(w * 0.05)},${f(h * 0.265)} 0,${f(h * 0.285)} Q${f(-w * 0.05)},${f(h * 0.265)} ${f(-w * 0.13)},${f(h * 0.285)} C${f(-w * 0.24)},${f(h * 0.29)} ${f(-w * 0.38)},${f(h * 0.2)} ${f(-w * 0.4)},${f(h * 0.0)}Z" fill="${b}" stroke="${OUT}" stroke-width="${D.ow}"/>`;
      const r = rng(5); for (let i = 0; i < 9; i++) { const x = (r() - 0.5) * w * 0.7; feat += `<path d="M${f(x)},${f(h * (0.42 + r() * 0.08))} q${f(x * 0.05)},${f(h * 0.1)} ${f(x * 0.02)},${f(h * 0.16)}" stroke="${shade(b, 0.18)}" stroke-width="2" fill="none" opacity="0.45"/>`; }
      feat += `<path d="M${f(-w * 0.012)},${f(h * 0.5)} l0,${f(h * 0.12)}" stroke="${bd}" stroke-width="2.5" opacity="0.6"/>`;
    }
    feat += mouth(F.mouth || 'neutral', my, w, h, skin);
    if (o.beard && (F.mouth || 'neutral') !== 'o') feat += `<path d="M${f(-w * 0.07)},${f(my - 3)} Q0,${f(my - 9)} ${f(w * 0.07)},${f(my - 3)}" stroke="${shade(o.beard, -0.2)}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    // tears
    if (F.tears) for (const s of [-1, 1]) {
      const x = s * ex + tx - s * erx * 0.25, y = ey + ery * 1.1;
      feat += `<path d="M${f(x)},${f(y)} C${f(x - s * 2)},${f(y + h * 0.1)} ${f(x + s * 4)},${f(y + h * 0.16)} ${f(x + s * 2)},${f(y + h * 0.22)}" stroke="#e9f3ff" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.92"/>` +
        `<path d="M${f(x + s * 2)},${f(y + h * 0.22)} q-5,8 0,12 q5,-4 0,-12Z" fill="#e9f3ff" opacity="0.95"/>`;
    }
    if (F.lines) for (const s of [-1, 1]) feat += `<path d="M${f(s * (ex + erx * 1.25) + tx)},${f(ey - 4)} l${f(s * 9)},-5 M${f(s * (ex + erx * 1.25) + tx)},${f(ey + 4)} l${f(s * 9)},4" stroke="${sk2}" stroke-width="2" opacity="0.6"/>`;
    // hair / hood front
    if (o.hood || o.wimple) {
      const c = o.hood || o.wimple;
      const outer = `M${f(-w * 0.64)},${f(h * 0.6)} C${f(-w * 0.74)},${f(-h * 0.2)} ${f(-w * 0.52)},${f(-h * 0.72)} 0,${f(-h * 0.72)} C${f(w * 0.52)},${f(-h * 0.72)} ${f(w * 0.74)},${f(-h * 0.2)} ${f(w * 0.64)},${f(h * 0.6)} L${f(w * 0.5)},${f(h * 0.6)} `;
      const inner = `C${f(w * 0.52)},${f(h * 0.2)} ${f(w * 0.5)},${f(-h * 0.36)} 0,${f(-h * 0.4)} C${f(-w * 0.5)},${f(-h * 0.36)} ${f(-w * 0.52)},${f(h * 0.2)} ${f(-w * 0.5)},${f(h * 0.6)}Z`;
      front += `<path d="${outer}${inner}" fill="${c}" stroke="${OUT}" stroke-width="${D.ow}"/>`;
      front += `<path d="M${f(-w * 0.5)},${f(h * 0.5)} C${f(-w * 0.52)},${f(h * 0.15)} ${f(-w * 0.5)},${f(-h * 0.33)} 0,${f(-h * 0.37)} C${f(w * 0.5)},${f(-h * 0.33)} ${f(w * 0.52)},${f(h * 0.15)} ${f(w * 0.5)},${f(h * 0.5)}" stroke="${shade(c, 0.22)}" stroke-width="5" fill="none" opacity="0.5"/>`;
    } else if (o.hairStyle !== 'bald') {
      const fy = kind === 'kid' ? -h * 0.19 : -h * 0.26;
      const zz = kind === 'kid' ? h * 0.075 : h * 0.06;
      const hairPath = `M${f(-w * 0.5)},${f(h * 0.04)} C${f(-w * 0.56)},${f(-h * 0.3)} ${f(-w * 0.5)},${f(-h * 0.66)} 0,${f(-h * 0.66)} C${f(w * 0.5)},${f(-h * 0.66)} ${f(w * 0.56)},${f(-h * 0.3)} ${f(w * 0.5)},${f(h * 0.04)} L${f(w * 0.44)},${f(h * 0.04)} L${f(w * 0.43)},${f(fy)} L${f(w * 0.17)},${f(fy)} L${f(w * 0.1)},${f(fy + zz)} L${f(w * 0.04)},${f(fy)} L${f(-w * 0.02)},${f(fy + zz)} L${f(-w * 0.08)},${f(fy)} L${f(-w * 0.43)},${f(fy)} L${f(-w * 0.44)},${f(h * 0.04)}Z`;
      const hg = uid('hg');
      front += `<linearGradient id="${hg}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(hairC, 0.12)}"/><stop offset="1" stop-color="${shade(hairC, -0.15)}"/></linearGradient>`;
      front += `<path d="${hairPath}" fill="url(#${hg})" stroke="${OUT}" stroke-width="${D.ow}" stroke-linejoin="round"/>`;
      for (const k of [-0.28, -0.12, 0.05, 0.22]) front += `<path d="M${f(k * w)},${f(-h * 0.6)} Q${f(k * w * 1.15)},${f(-h * 0.42)} ${f(k * w * 1.05)},${f(fy - 6)}" stroke="${hairD}" stroke-width="3" fill="none" opacity="0.55"/>`;
    }
    return `<defs>${grad}</defs><g>${back}</g><g filter="url(#air)">${face}</g><g>${feat}</g><g filter="url(#airS)">${front}</g>`;
  }

  // ---------- full person ----------
  function person(o) {
    const kind = o.kind || 'kid', D = DIMS[kind];
    const C = { skin: o.skin || '#f2c9a5', sleeve: o.sleeve || o.tunic || '#8a7a5c', tunic: o.tunic || '#8a7a5c' };
    const tun = C.tunic, tunD = shade(tun, -0.25), ow = D.ow;
    let out = '';
    // ground shadow
    out += `<ellipse cx="0" cy="4" rx="${f(D.hemX * 1.1)}" ry="${f(D.foot * 0.55)}" fill="#000" opacity="${o.shadow ?? 0.28}" filter="url(#soft2)"/>`;
    // legs + feet
    if (kind !== 'woman') {
      const legC = o.legs || C.skin, isBare = !o.legs;
      for (const s of [-1, 1]) {
        const x = s * D.legX;
        let leg = `<path d="M${f(x - D.legW / 2)},${f(D.hemY - 20)} L${f(x - D.legW * 0.42)},${f(-D.foot * 0.4)} L${f(x + D.legW * 0.42)},${f(-D.foot * 0.4)} L${f(x + D.legW / 2)},${f(D.hemY - 20)}Z" fill="${legC}" stroke="${OUT}" stroke-width="${ow}"/>`;
        if (o.stripes) for (let yy = D.hemY + 10; yy < -D.foot * 0.6; yy += 22) leg += `<path d="M${f(x - D.legW * 0.46)},${f(yy)} L${f(x + D.legW * 0.46)},${f(yy)}" stroke="${o.stripes}" stroke-width="9"/>`;
        const fc = o.feet || (isBare ? C.skin : '#3b2a1e');
        const fx = x + s * D.foot * 0.18, fy = -D.foot * 0.34;
        leg += `<ellipse cx="${f(fx)}" cy="${f(fy)}" rx="${f(D.foot * 0.66)}" ry="${f(D.foot * 0.42)}" fill="${fc}" stroke="${OUT}" stroke-width="${ow}"/>`;
        if (isBare) for (const k of [0.15, 0.4]) leg += `<path d="M${f(fx + s * D.foot * k)},${f(fy + D.foot * 0.12)} l0,${f(D.foot * 0.22)}" stroke="${OUT}" stroke-width="1.6" opacity="0.5"/>`;
        out += `<g filter="url(#airS)">${leg}</g>`;
      }
    }
    // arms behind back (only if explicitly asked)
    const shR = [-(D.shX - 14), D.shY + 18], shL = [D.shX - 14, D.shY + 18];
    const aR = Object.assign({ hand: restHand(kind, 'R'), pose: 'relaxed', facing: 'back' }, o.armR || {});
    const aL = Object.assign({ hand: restHand(kind, 'L'), pose: 'relaxed', facing: 'back' }, o.armL || {});
    const armR = arm('R', shR, aR, D, C), armL = arm('L', shL, aL, D, C);
    if (aR.behind) out += armR.svg; if (aL.behind) out += armL.svg;
    // torso (tunic / dress)
    const nw = D.hw * 0.17;
    const torso = `M${f(-nw)},${f(D.shY - 6)} C${f(-D.shX * 0.6)},${f(D.shY - 8)} ${f(-D.shX * 1.02)},${f(D.shY - 2)} ${f(-D.shX)},${f(D.shY + 26)} L${f(-D.wX)},${f(D.wY)} L${f(-D.hemX)},${f(D.hemY)} Q0,${f(D.hemY + 14)} ${f(D.hemX)},${f(D.hemY)} L${f(D.wX)},${f(D.wY)} L${f(D.shX)},${f(D.shY + 26)} C${f(D.shX * 1.02)},${f(D.shY - 2)} ${f(D.shX * 0.6)},${f(D.shY - 8)} ${f(nw)},${f(D.shY - 6)}Z`;
    const tg = uid('tg');
    let t = `<defs><linearGradient id="${tg}" x1="0" y1="0" x2="1" y2="0.3"><stop offset="0" stop-color="${shade(tun, 0.08)}"/><stop offset="0.55" stop-color="${tun}"/><stop offset="1" stop-color="${shade(tun, -0.12)}"/></linearGradient></defs>`;
    t += `<path d="${torso}" fill="url(#${tg})" stroke="${OUT}" stroke-width="${ow}" stroke-linejoin="round"/>`;
    for (const k of [-0.62, -0.25, 0.12, 0.5]) t += `<path d="M${f(k * D.wX)},${f(D.wY + 12)} L${f(k * D.hemX * 1.05)},${f(D.hemY - 6)}" stroke="${tunD}" stroke-width="${f(ow * 0.9)}" opacity="0.45" stroke-linecap="round"/>`;
    t += `<path d="M0,${f(D.shY - 4)} L0,${f(D.shY + (D.wY - D.shY) * 0.32)}" stroke="${OUT}" stroke-width="${f(ow * 0.8)}" opacity="0.7"/>`;
    if (o.patch) t += `<g transform="translate(${f(-D.shX * 0.45)},${f(D.shY + (D.wY - D.shY) * 0.48)})"><rect x="-9" y="-12" width="18" height="24" fill="${shade(tun, -0.08)}" stroke="${OUT}" stroke-width="1.5" stroke-dasharray="3 3"/></g>`;
    if (o.mantle) { // fur collar / mantle over shoulders
      const m = o.mantle, sx = D.shX * 1.08, y0 = D.shY - 10, y1 = D.shY + 70;
      let d = `M${f(-sx)},${f(D.shY + 24)} C${f(-sx)},${f(y0)} ${f(sx)},${f(y0)} ${f(sx)},${f(D.shY + 24)} L${f(sx * 0.95)},${f(y1)} `;
      for (let i = 0; i <= 8; i++) { const x = sx * 0.95 - i * (sx * 1.9 / 8); d += `Q${f(x + sx * 0.12)},${f(y1 + 16)} ${f(x)},${f(y1 + (i % 2 ? 6 : 0))} `; }
      d += 'Z';
      t += `<path d="${d}" fill="${m}" stroke="${OUT}" stroke-width="${ow}"/>`;
      const r = rng(3); for (let i = 0; i < 22; i++) t += `<path d="M${f((r() - 0.5) * sx * 1.8)},${f(y0 + 20 + r() * 60)} l${f(r() * 6 - 3)},9" stroke="${shade(m, 0.25)}" stroke-width="2" opacity="0.5"/>`;
    }
    // belt
    if (o.belt !== false) {
      const bc = o.belt || '#c7ad78', by = D.wY - 6, bw = D.wX + 3;
      t += `<rect x="${f(-bw)}" y="${f(by - 6)}" width="${f(bw * 2)}" height="12" rx="5" fill="${bc}" stroke="${OUT}" stroke-width="${f(ow * 0.8)}"/>`;
      if (!o.leatherBelt) for (let x = -bw + 6; x < bw - 4; x += 9) t += `<path d="M${f(x)},${f(by - 5)} l5,10" stroke="${shade(bc, -0.3)}" stroke-width="1.6" opacity="0.7"/>`;
      if (o.leatherBelt) t += `<rect x="-11" y="${f(by - 9)}" width="22" height="18" rx="3" fill="none" stroke="#c9a65a" stroke-width="3.5"/>`;
      else t += `<circle cx="${f(bw * 0.3)}" cy="${f(by)}" r="7" fill="${bc}" stroke="${OUT}" stroke-width="1.6"/><path d="M${f(bw * 0.3 - 3)},${f(by + 5)} l-4,46 M${f(bw * 0.3 + 3)},${f(by + 5)} l6,38" stroke="${bc}" stroke-width="5" stroke-linecap="round"/><path d="M${f(bw * 0.3 - 3)},${f(by + 5)} l-4,46 M${f(bw * 0.3 + 3)},${f(by + 5)} l6,38" stroke="${OUT}" stroke-width="1.2" stroke-linecap="round" opacity="0.5" transform="translate(1.5,0)"/>`;
    }
    if (o.apron) t += `<path d="M${f(-D.wX * 0.7)},${f(D.wY + 4)} L${f(D.wX * 0.7)},${f(D.wY + 4)} L${f(D.hemX * 0.6)},${f(D.hemY - 30)} Q0,${f(D.hemY - 20)} ${f(-D.hemX * 0.6)},${f(D.hemY - 30)}Z" fill="${o.apron}" stroke="${OUT}" stroke-width="${ow}"/>`;
    out += `<g filter="url(#air)">${t}</g>`;
    // neck
    out += `<g filter="url(#airS)"><rect x="${f(-D.hw * 0.16)}" y="${f(D.neckY - 30)}" width="${f(D.hw * 0.32)}" height="${f(D.shY - D.neckY + 34)}" fill="${shade(C.skin, -0.14)}" stroke="${OUT}" stroke-width="${ow}"/></g>`;
    // head
    const tilt = o.tilt || 0;
    out += `<g transform="translate(0,${D.headY}) rotate(${tilt})">${head({ skin: C.skin, hair: o.hair, hairStyle: o.hairStyle, beard: o.beard, hood: o.hood, wimple: o.wimple, face: o.face, brow: o.brow }, kind)}</g>`;
    // props held in front of body (drawn BEFORE arms so hands wrap over them)
    if (o.props) out += o.props;
    if (!aR.behind) out += armR.svg; if (!aL.behind) out += armL.svg;
    if (o.frontProps) out += o.frontProps;
    const s = o.s || 1;
    const wrap = inner => `<g transform="translate(${f(o.x || 0)},${f(o.y || 0)}) scale(${s})">${inner}</g>`;
    return { svg: wrap(out), handR: armR.hand ? wrap(armR.hand) : '', handL: armL.hand ? wrap(armL.hand) : '', D, shR, shL };
  }

  G.RIG = { defs, person, hand, shade, mix, rng, uid, DIMS, OUT, restHand, f };
})(window);
