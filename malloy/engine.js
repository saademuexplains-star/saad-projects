// Painted Explainer Shorts — rendering engine.
// Frame-exact SVG renderer for 1080x1920 shorts: every frame is a pure function of time t.
// A project file defines SHOTS / TRANS / WORDS and calls makeTimeline(); see examples/.
// Coordinates: canvas 1080x1920. Characters are authored in local units with feet at y=0
// and the head centre near y=-1075 (about 7 heads tall), then placed with translate+scale.

const W = 1080, H = 1920;

// ---------- math & easing ----------
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const lerp = (a, b, p) => a + (b - a) * p;
const easeOut = p => 1 - Math.pow(1 - p, 3);
const easeIn = p => p * p * p;
const easeInOut = p => p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
const backOut = p => { const c = 1.9; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); };
const pop = (t, t0, d = .18) => backOut(seg(t, t0, t0 + d));          // springy pop-in starting at t0
const bell = (t, a, b) => Math.sin(seg(t, a, b) * Math.PI);           // 0 → 1 → 0 between a and b
const decay = (t, t0, tau) => t < t0 ? 0 : Math.exp(-(t - t0) / tau);  // impulse at t0
const breathe = t => `scale(${1 - Math.sin(t * 2.4) * .004} ${1 + Math.sin(t * 2.4) * .006})`;
const blinkAt = (t, list) => list.some(b => t > b && t < b + .1) ? 2 : 0; // lid value 2 = fully closed
const cam = ({ cx = 540, cy = 960, s = 1, r = 0, x = 0, y = 0 }) =>
  `translate(${x} ${y}) translate(${cx} ${cy}) scale(${s}) rotate(${r}) translate(${-cx} ${-cy})`;
function shakeXY(t, hits) { // hits: [[t0, amplitude, duration], ...]
  let x = 0, y = 0;
  for (const [t0, amp, dur] of hits) {
    if (t < t0 || t > t0 + dur) continue;
    const k = amp * (1 - seg(t, t0, t0 + dur));
    x += Math.sin(t * 95 + t0) * k; y += Math.cos(t * 83 + t0) * k;
  }
  return [x, y];
}

// ---------- colour helpers ----------
function hexToRgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); }
const rgbToHex = c => '#' + c.map(v => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('');
const mix = (a, b, p) => rgbToHex(hexToRgb(a).map((v, i) => lerp(v, hexToRgb(b)[i], p)));
const lighten = (c, p) => mix(c, '#ffffff', p);
const darken = (c, p) => mix(c, '#000000', p);
const linG = (id, stops, { x2 = 1, y2 = 0, user = null } = {}) =>
  `<linearGradient id="${id}" ${user ? `gradientUnits="userSpaceOnUse" x1="${user[0]}" y1="${user[1]}" x2="${user[2]}" y2="${user[3]}"` : `x1="0" y1="0" x2="${x2}" y2="${y2}"`}>${stops.map((c, i) => `<stop offset="${(i / (stops.length - 1)).toFixed(2)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const radG = (id, stops, { cx = .45, cy = .42, r = .65 } = {}) =>
  `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops.map((c, i) => `<stop offset="${(i / (stops.length - 1)).toFixed(2)}" stop-color="${c}"/>`).join('')}</radialGradient>`;

// Mirror a path written for the SCREEN-LEFT side (negative x) onto either side.
// k = -1 keeps it on the left, k = 1 mirrors it to the right. Paths must use "x y" pairs.
const mx = (k, d) => d.replace(/(-?\d+\.?\d*) (-?\d+\.?\d*)/g, (m, x, y) => `${-k * x} ${y}`);

// ---------- finishing filters ("no cut-paper look") ----------
// Each painted piece gets: slightly rounded edges, a dark rim on the shadow side (bottom-right),
// a faint warm rim on the lit side (top-left) and, for "lift" pieces, a soft cast shadow on what is below.
// region: use a user-space region for STROKE-drawn pieces (arms) — objectBoundingBox ignores stroke width
// and would clip them.
// Render passes for deferred lighting: window.PASS = 'classic' (default: baked rims), 'flat' (albedo for relighting:
// directional rims off, contact shadows kept) or 'normal' (each piece outputs a smooth normal map: R = Nx, G = Ny,
// B = material). Normals come from finite differences of the piece's blurred alpha taken over distances in user
// units, so they are smooth (no 8-bit terracing) and look the same at any zoom.
const PASS = () => (typeof window !== 'undefined' && window.PASS) || 'classic';
function pieceNormalFilter(id, { rim = 8, region = null } = {}) {
  const reg = region ? `filterUnits="userSpaceOnUse" x="${region[0]}" y="${region[1]}" width="${region[2]}" height="${region[3]}"`
    : 'x="-20%" y="-20%" width="140%" height="140%"';
  const s1 = rim * 4.5, d1 = s1 * .8, s2 = rim * 1.2, d2 = s2 * .8, g1 = .4, g2 = .3;
  const mat = id.startsWith('pk') ? 128 : 64;
  const diff = (src, d, g, k4, axis, tag) => `
    <feOffset in="${src}" dx="${axis ? 0 : d}" dy="${axis ? d : 0}" result="${tag}m"/><feOffset in="${src}" dx="${axis ? 0 : -d}" dy="${axis ? -d : 0}" result="${tag}p"/>
    <feComposite in="${tag}m" in2="${tag}p" operator="arithmetic" k2="${g}" k3="${-g}" k4="${k4}" result="${tag}"/>`;
  return `
  <filter id="${id}" ${reg} color-interpolation-filters="sRGB">
    <feComponentTransfer in="SourceAlpha" result="rnd"><feFuncA type="identity"/></feComponentTransfer>
    <feGaussianBlur in="SourceAlpha" stdDeviation="${s1.toFixed(1)}" result="h1"/><feGaussianBlur in="SourceAlpha" stdDeviation="${s2.toFixed(1)}" result="h2"/>
    ${diff('h1', d1, g1, .5, 0, 'x1')}${diff('h2', d2, g2, 0, 0, 'x2')}${diff('h1', d1, g1, .5, 1, 'y1')}${diff('h2', d2, g2, 0, 1, 'y2')}
    <feComposite in="x1" in2="x2" operator="arithmetic" k2="1" k3="1" result="nx"/><feComposite in="y1" in2="y2" operator="arithmetic" k2="1" k3="1" result="ny"/>
    <feColorMatrix in="nx" type="matrix" values="0 0 0 1 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0 1" result="nxR"/>
    <feColorMatrix in="ny" type="matrix" values="0 0 0 0 0  0 0 0 1 0  0 0 0 0 0  0 0 0 0 1" result="nyG"/>
    <feFlood flood-color="rgb(0,0,${mat})" result="mt"/>
    <feComposite in="nxR" in2="nyG" operator="arithmetic" k2="1" k3="1" result="nxy"/>
    <feComposite in="nxy" in2="mt" operator="arithmetic" k2="1" k3="1" result="nm"/>
    <feComposite in="nm" in2="rnd" operator="in"/>
  </filter>`;
}
function pieceFilter(id, { rim = 8, lift = false, dark = '#1c1020', darkOp = .46, lightOp = .22, region = null } = {}) {
  if (PASS() === 'normal') return pieceNormalFilter(id, { rim, region });
  if (PASS() === 'flat') { darkOp *= .16; lightOp = 0; }
  const reg = region ? `filterUnits="userSpaceOnUse" x="${region[0]}" y="${region[1]}" width="${region[2]}" height="${region[3]}"`
    : 'x="-20%" y="-20%" width="140%" height="140%"';
  const cast = lift ? `
    <feGaussianBlur in="rnd" stdDeviation="${(rim * .9).toFixed(1)}" result="s0"/><feOffset in="s0" dx="${(rim * .45).toFixed(1)}" dy="${(rim * .8).toFixed(1)}" result="s1"/>
    <feFlood flood-color="#140a14" flood-opacity=".36"/><feComposite in2="s1" operator="in" result="cast"/>` : '';
  return `
  <filter id="${id}" ${reg} color-interpolation-filters="sRGB">
    <feComponentTransfer in="SourceAlpha" result="rnd"><feFuncA type="identity"/></feComponentTransfer>
    <feComposite in="SourceGraphic" in2="rnd" operator="in" result="body"/>
    <feGaussianBlur in="SourceAlpha" stdDeviation="${rim}" result="bl"/>
    <feOffset in="bl" dx="${(-rim * .5).toFixed(1)}" dy="${(-rim * .6).toFixed(1)}" result="blD"/>
    <feComposite in="rnd" in2="blD" operator="out" result="rimD"/>
    <feFlood flood-color="${dark}" flood-opacity="${darkOp}"/><feComposite in2="rimD" operator="in" result="dark"/>
    <feOffset in="bl" dx="${(rim * .5).toFixed(1)}" dy="${(rim * .6).toFixed(1)}" result="blL"/>
    <feComposite in="rnd" in2="blL" operator="out" result="rimL"/>
    <feFlood flood-color="#fff1d6" flood-opacity="${lightOp}"/><feComposite in2="rimL" operator="in" result="light"/>${cast}
    <feMerge>${lift ? '<feMergeNode in="cast"/>' : ''}<feMergeNode in="body"/><feMergeNode in="dark"/><feMergeNode in="light"/></feMerge>
  </filter>`;
}

// ---------- palettes ----------
const SKIN_TONES = {
  light:  { hi: '#f1cfb3', mid: '#dba98b', lo: '#b57a5f', ear: '#cf9a7e', earDk: '#b98468', neck: '#c48d70', shade: '#9b6650', deep: '#8f5a46', blush: '#e38c76', nostril: '#5a3326', line: '#8a5442', lip: '#c27b68', mouth: '#6e3a2e', rim: '#7a3a26' },
  medium: { hi: '#ddae86', mid: '#c08a61', lo: '#8e5a39', ear: '#b07650', earDk: '#9a6442', neck: '#a56f4b', shade: '#7a4a2e', deep: '#6a3e26', blush: '#c46a4e', nostril: '#3e2215', line: '#6a3a24', lip: '#a05a44', mouth: '#4e2618', rim: '#5a2a16' },
  deep:   { hi: '#a8714c', mid: '#82522f', lo: '#5a3520', ear: '#7a4a2c', earDk: '#683e24', neck: '#6e4428', shade: '#4a2a18', deep: '#3e2214', blush: '#8e4a34', nostril: '#22120a', line: '#3e2214', lip: '#7a4030', mouth: '#2e160c', rim: '#2e140a' },
};
const HAIR_COLORS = {
  brown: ['#3d2b20', '#1c130d', '#6a5040'], black: ['#2c2622', '#0e0b0a', '#4a423c'], blonde: ['#d2ad68', '#8a6a32', '#efd59a'],
  grey: ['#b9b4ac', '#77716a', '#dedad3'], white: ['#f2efe9', '#bdb7ad', '#ffffff'], red: ['#9a4a22', '#4e2010', '#c8703e'],
};

// ---------- shared <defs> ----------
let EXTRA_DEFS = '';
const addDefs = s => { EXTRA_DEFS += s; };
function sharedDefs() {
  const tones = Object.entries(SKIN_TONES).map(([k, s]) =>
    pieceFilter(`pk_${k}`, { rim: 8, dark: s.rim, darkOp: .32, lightOp: .14 }) + pieceFilter(`pks_${k}`, { rim: 3.5, dark: s.rim, darkOp: .3, lightOp: .12 })).join('');
  return `<defs>
  ${pieceFilter('pc', { rim: 8 })}${pieceFilter('pcl', { rim: 8, lift: true })}${pieceFilter('pcs', { rim: 3.5 })}${pieceFilter('pcsl', { rim: 3.5, lift: true })}
  ${pieceFilter('pclA', { rim: 8, lift: true, region: [-340, -1320, 680, 820] })}${pieceFilter('pcsA', { rim: 3.5, region: [-340, -1320, 680, 820] })}${tones}
  ${[0, 2, 4, 8, 16, 32].map(b => { const id = b ? 'pe' + b : 'pe', reg = b ? 'x="-150%" y="-150%" width="400%" height="400%"' : 'x="-30%" y="-30%" width="160%" height="160%"';
    return PASS() === 'normal' ? `<filter id="${id}" ${reg} color-interpolation-filters="sRGB">${b ? `<feGaussianBlur in="SourceAlpha" stdDeviation="${b}" result="a"/>` : ''}<feFlood flood-color="rgb(128,128,255)"/><feComposite in2="${b ? 'a' : 'SourceAlpha'}" operator="in"/></filter>`
      : `<filter id="${id}" ${reg}>${b ? `<feGaussianBlur stdDeviation="${b}"/>` : '<feOffset dx="0" dy="0"/>'}</filter>`; }).join('')}
  <filter id="soft"><feGaussianBlur stdDeviation="6"/></filter>
  <filter id="soft2"><feGaussianBlur stdDeviation="2"/></filter>
  <filter id="tex" x="-5%" y="-5%" width="110%" height="110%">
    <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="4" result="n"/>
    <feColorMatrix in="n" type="saturate" values="0" result="g"/>
    <feComponentTransfer in="g" result="gm"><feFuncR type="linear" slope=".35" intercept=".72"/><feFuncG type="linear" slope=".35" intercept=".72"/><feFuncB type="linear" slope=".35" intercept=".72"/></feComponentTransfer>
    <feBlend in="SourceGraphic" in2="gm" mode="multiply" result="b"/>
    <feComposite in="b" in2="SourceAlpha" operator="in"/>
  </filter>
  <filter id="fur" x="-10%" y="-10%" width="120%" height="120%">
    <feTurbulence type="fractalNoise" baseFrequency=".18" numOctaves="2" seed="9" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="9" xChannelSelector="R" yChannelSelector="G" result="d"/>
    <feTurbulence type="fractalNoise" baseFrequency=".9 .25" numOctaves="2" seed="3" result="n2"/>
    <feColorMatrix in="n2" type="saturate" values="0" result="g"/>
    <feComponentTransfer in="g" result="gm"><feFuncR type="linear" slope=".5" intercept=".62"/><feFuncG type="linear" slope=".5" intercept=".62"/><feFuncB type="linear" slope=".5" intercept=".62"/></feComponentTransfer>
    <feBlend in="d" in2="gm" mode="multiply" result="b"/>
    <feComposite in="b" in2="d" operator="in"/>
  </filter>
  <filter id="white"><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0"/></filter>
  <linearGradient id="shade" x1="0" y1="0" x2="1" y2=".3"><stop offset=".35" stop-color="#1b1830" stop-opacity="0"/><stop offset="1" stop-color="#1b1830" stop-opacity=".5"/></linearGradient>
  <radialGradient id="warm" cx=".2" cy=".15" r=".75"><stop offset="0" stop-color="#ffd59a" stop-opacity=".45"/><stop offset="1" stop-color="#ffd59a" stop-opacity="0"/></radialGradient>
  <radialGradient id="eyeW" cx=".45" cy=".4" r=".65"><stop offset="0" stop-color="#fff"/><stop offset=".75" stop-color="#f2f2f2"/><stop offset="1" stop-color="#bdbdbd"/></radialGradient>
  <radialGradient id="goldG" cx=".35" cy=".35" r=".7"><stop offset="0" stop-color="#fff0b0"/><stop offset=".4" stop-color="#d6ab4a"/><stop offset="1" stop-color="#7c5a1c"/></radialGradient>
  ${linG('bootG', ['#3a3532', '#1d1a19', '#4a4441', '#151312', '#0c0b0a'])}
  ${linG('cuffG', ['#4a3f39', '#1c1714'], { x2: 0, y2: 1 })}
  ${linG('stockG', ['#fbf8f1', '#ddd5c4', '#b9ae98'])}
  ${linG('gloveG', ['#fdfbf6', '#ddd5c6'])}
  <filter id="clouds" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency=".0025 .007" numOctaves="5" seed="7"/>
    <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 2.6 -1.15"/>
    <feGaussianBlur stdDeviation="3"/>
  </filter>
  <filter id="leaves" x="-5%" y="-20%" width="110%" height="140%">
    <feTurbulence type="fractalNoise" baseFrequency=".02" numOctaves="4" seed="2" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="90" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
  <filter id="grass" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency=".25 .012" numOctaves="3" seed="5"/>
    <feColorMatrix values="0 0 0 0 .2  0 0 0 0 .3  0 0 0 0 .1  0 0 0 1.4 -.45"/>
  </filter>
  <filter id="planks" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency=".004 .09" numOctaves="3" seed="11"/>
    <feColorMatrix values="0 0 0 0 .18  0 0 0 0 .1  0 0 0 0 .05  0 0 0 1.2 -.35"/>
  </filter>
  <filter id="dof" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="11"/></filter>
  <filter id="dofHeavy" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="20"/></filter>
  <filter id="dofLight" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="5"/></filter>
  ${EXTRA_DEFS}
</defs>`;
}

// ---------- character lighting ----------
// Warm key light from the upper-left, cool shadow toward the lower-right, applied only inside the
// character's silhouette (a white copy of the character is used as the mask). Wrap every character in this.
let litCount = 0;
function lit(inner, { warm = 'warm', shade = 'shade' } = {}) {
  if (PASS() !== 'classic') return inner;                 // relit passes: the deferred lights replace the baked wash
  const id = 'lit' + (litCount++);
  const own = new Set([...inner.matchAll(/id="([^"]+)"/g)].map(m => m[1]));
  const copy = inner
    .replace(/ filter="url\(#[^)]+\)"/g, '')               // the mask only needs the silhouette: skip the costly finishing filters
    .replace(/id="([^"]+)"/g, (m, a) => `id="${a}_m${id}"`)
    .replace(/url\(#([^)]+)\)/g, (m, a) => own.has(a) ? `url(#${a}_m${id})` : m)
    .replace(/href="#([^"]+)"/g, (m, a) => own.has(a) ? `href="#${a}_m${id}"` : m);
  return `<defs><mask id="${id}" maskUnits="userSpaceOnUse" x="-600" y="-1600" width="1200" height="1800"><g filter="url(#white)">${copy}</g></mask></defs>
    ${inner}
    <g mask="url(#${id})" style="mix-blend-mode:multiply"><rect x="-400" y="-1500" width="800" height="1520" fill="url(#${shade})"/></g>
    <g mask="url(#${id})" style="mix-blend-mode:screen"><rect x="-400" y="-1500" width="800" height="1520" fill="url(#${warm})"/></g>`;
}

// ---------- photo-like blurred backgrounds ----------
// Backgrounds are painted simply and then heavily blurred — they read like a phone photo with
// portrait-mode depth of field, which keeps attention on the sharp character.
const SKIES = {
  day:    { sky: ['#8fb8da', '#e6edf0'], far: '#6f8566', near: '#3e5a32', ground: ['#8d9b55', '#6b8a3c', '#3d5a24'], bokeh: '#fff6dc' },
  golden: { sky: ['#6f84a6', '#f0c78a'], far: '#8a8a6c', near: '#4a5a2e', ground: ['#a49a52', '#7a8a3c', '#43562a'], bokeh: '#ffe2a8' },
  dusk:   { sky: ['#6c7d93', '#c9b8a2'], far: '#6a7568', near: '#3a4f32', ground: ['#7d8a52', '#5e7838', '#36502a'], bokeh: '#f3e2c8' },
  night:  { sky: ['#141c33', '#3a4766'], far: '#2a3440', near: '#16201a', ground: ['#2a3a26', '#1e2c1a', '#101a0e'], bokeh: '#c8d8ff' },
  desert: { sky: ['#7fa8d0', '#f1e2c2'], far: '#c9a77a', near: '#a8805a', ground: ['#e0c08a', '#c9a066', '#9a7444'], bokeh: '#fff3d8' },
};
let bgCount = 0;
function background({ preset = 'day', horizon = 1100, blur = 'dof', props = '', clouds = true, trees = true, overrides = {} } = {}) {
  const P = { ...SKIES[preset], ...overrides }, id = 'bg' + (bgCount++);
  return `
  <g filter="url(#${blur})">
    ${linG(id + 'sky', P.sky, { x2: 0, y2: 1 })}${linG(id + 'gr', P.ground, { x2: 0, y2: 1 })}
    <rect x="-60" y="-60" width="1200" height="2040" fill="url(#${id}sky)"/>
    ${clouds ? `<rect x="-60" y="-60" width="1200" height="${horizon}" filter="url(#clouds)" opacity="${preset === 'night' ? .25 : 1}"/>` : ''}
    ${trees ? `<g filter="url(#leaves)">
      <path d="M-100 ${horizon - 40} Q 200 ${horizon - 260} 420 ${horizon - 120} T 820 ${horizon - 200} T 1200 ${horizon - 100} V${horizon + 120} H-100Z" fill="${P.far}" opacity=".85"/>
      <path d="M-100 ${horizon} Q 150 ${horizon - 200} 380 ${horizon - 70} T 760 ${horizon - 150} T 1200 ${horizon - 40} V${horizon + 140} H-100Z" fill="${P.near}"/>
    </g>` : `<path d="M-100 ${horizon} Q 300 ${horizon - 60} 600 ${horizon - 20} T 1200 ${horizon} V${horizon + 40} H-100Z" fill="${P.far}"/>`}
    <rect x="-60" y="${horizon}" width="1200" height="${1980 - horizon}" fill="url(#${id}gr)"/>
    <rect x="-60" y="${horizon}" width="1200" height="${1980 - horizon}" filter="url(#grass)" opacity="${preset === 'desert' ? .25 : 1}"/>
    ${props}
    <g fill="${P.bokeh}" opacity=".35">${[[150, -160, 26], [330, -220, 18], [720, -180, 30], [940, -120, 20], [600, -260, 16]].map(([x, y, r]) => `<circle cx="${x}" cy="${horizon + y}" r="${r}"/>`).join('')}</g>
  </g>`;
}
// Interior: wall, window with daylight, plank floor. Same blur logic.
function interior({ wall = ['#cdbb9c', '#8e7a5c'], floor = ['#7a5636', '#4a3220'], horizon = 1250, blur = 'dof', windowX = 140, props = '' } = {}) {
  const id = 'in' + (bgCount++);
  return `
  <g filter="url(#${blur})">
    ${linG(id + 'w', wall, { x2: .3, y2: 1 })}${linG(id + 'f', floor, { x2: 0, y2: 1 })}
    <rect x="-60" y="-60" width="1200" height="${horizon + 60}" fill="url(#${id}w)"/>
    <rect x="${windowX}" y="${horizon - 900}" width="300" height="560" fill="#eaf2f6"/>
    <rect x="${windowX}" y="${horizon - 900}" width="300" height="560" fill="none" stroke="#5a4630" stroke-width="22"/>
    <path d="M${windowX + 150} ${horizon - 900} V${horizon - 340} M${windowX} ${horizon - 620} H${windowX + 300}" stroke="#5a4630" stroke-width="14"/>
    <path d="M${windowX} ${horizon - 340} L${windowX + 300} ${horizon - 340} L${windowX + 700} ${horizon + 600} L${windowX - 100} ${horizon + 600}Z" fill="#fff4d8" opacity=".22"/>
    <rect x="-60" y="${horizon}" width="1200" height="${1980 - horizon}" fill="url(#${id}f)"/>
    <rect x="-60" y="${horizon}" width="1200" height="${1980 - horizon}" filter="url(#planks)"/>
    <rect x="-60" y="${horizon - 30}" width="1200" height="34" fill="#3a2a1a" opacity=".55"/>
    ${props}
  </g>`;
}

// ---------- the person builder ----------
// o = look (fixed per character), e = expression/pose (animated per frame), v = 'B' clean (default) | 'A' crude cartoon eyes.
// Look options:
//   skin: light|medium|deep   hair: short|forelock|long|bald   hairColor: brown|black|blonde|grey|white|red
//   beard: none|stubble|mustache|full   hat: none|bicorne|tophat|cap|crown
//   top: military|jacket|vest|robe   legs: breeches|trousers   foot: boots|shoes|sandals
//   coat, accent, under, pants, robe, trim: hex colours   hands: gloves|bare   armLeft: hanging|tucked
//   necklace: true|false   id: unique prefix when several people share a frame
// Expression/pose (all optional): lid (0 open .5 smug 2 closed), look, lookY, shock (0/1), browL, browR,
//   smirk (0 flat .. 1.6 big), raiseLeft / raiseRight (arm raise in degrees, screen sides), tilt (head deg),
//   sweat (0/1), sweatY, talk (0..1 mouth open for speaking characters)
let personCount = 0;
function person(o = {}, e = {}, v = (typeof window !== 'undefined' && window.VARIANT) || 'B') {
  const id = (o.id || 'p') + (personCount++);
  const S = SKIN_TONES[o.skin || 'light'], HC = HAIR_COLORS[o.hairColor || 'brown'];
  const top = o.top || 'jacket', legs = top === 'robe' ? 'none' : (o.legs || 'trousers');
  const foot = o.foot || (top === 'robe' ? 'sandals' : legs === 'breeches' ? 'boots' : 'shoes');
  const hat = o.hat || 'none', hair = o.hair || 'short', beard = o.beard || 'none';
  const hands = o.hands || (top === 'military' ? 'gloves' : 'bare');
  const tucked = o.armLeft === 'tucked' && (top === 'military' || top === 'jacket');
  const col = {
    coat: o.coat || (top === 'military' ? '#26355a' : '#4a3a2c'), accent: o.accent || '#9b2d2b', under: o.under || '#e6dcc4',
    pants: o.pants || (legs === 'breeches' ? '#e6dcc4' : '#3a3530'), robe: o.robe || '#7a2e2a', trim: o.trim || '#c49a3c',
  };
  const { lid = 0, look = 0, lookY = 0, shock = 0, browL = 0, browR = 0, smirk = 1, raiseLeft = 0, raiseRight = 0,
    sweat = 0, sweatY = 0, tilt = 0, talk = 0, turn = 0 } = e;
  const TX = F1(turn * 15);   // head turn: the features slide across the face, the far ear tucks away
  const g = n => `${id}${n}`, u = n => `url(#${id}${n})`;
  const sk = o.skin || 'light';

  const defs = `<defs>
    ${radG(g('skin'), [S.hi, S.mid, S.lo])}
    ${linG(g('hair'), [HC[0], HC[1]], { x2: 0, y2: 1 })}
    ${linG(g('coat'), [lighten(col.coat, .18), col.coat, darken(col.coat, .45)])}
    ${linG(g('coatDk'), [darken(col.coat, .12), darken(col.coat, .5)])}
    ${linG(g('acc'), [lighten(col.accent, .12), darken(col.accent, .4)], { y2: 1 })}
    ${linG(g('under'), [lighten(col.under, .25), col.under, darken(col.under, .22)], { user: [-78, 0, 78, 0] })}
    ${linG(g('underB'), [lighten(col.under, .25), col.under, darken(col.under, .22)])}
    ${linG(g('pants'), [lighten(col.pants, .25), col.pants, darken(col.pants, .25)])}
    ${linG(g('robe'), [lighten(col.robe, .16), col.robe, darken(col.robe, .45)])}
    ${linG(g('trim'), [lighten(col.trim, .35), col.trim, darken(col.trim, .35)])}
    <clipPath id="${g('face')}"><path d="${o.facePath || FACE}"/></clipPath>
  </defs>`;

  // ----- legs & feet -----
  const legsSVG = legs === 'none' ? '' : [-1, 1].map(k => {
    const shoe = `
      <path d="${mx(k, 'M -84 -78 C -100 -54 -132 -40 -140 -20 C -146 -4 -128 4 -100 2 L -28 2 C -20 -10 -26 -50 -32 -78 Q -58 -64 -84 -78 Z')}" fill="url(#bootG)" filter="url(#pc)"/>
      ${o.buckles ? `<rect x="${k > 0 ? 44 : -76}" y="-64" width="32" height="22" rx="5" fill="none" stroke="${col.trim}" stroke-width="6"/>` : ''}`;
    const sole = `<path d="${mx(k, 'M -144 -16 C -148 -2 -130 6 -100 6 L -24 6 L -24 0 L -100 0 C -128 0 -140 -6 -144 -16 Z')}" fill="#2a1d14"/>
      <ellipse cx="${k * 110}" cy="-30" rx="22" ry="8" fill="#fff" opacity="${k < 0 ? .4 : .22}" filter="url(#soft2)"/>`;
    const groundShadow = `<ellipse cx="${k * 88}" cy="4" rx="72" ry="11" fill="#000" opacity=".35" filter="url(#soft)"/>`;
    if (legs === 'trousers') return `${groundShadow}${shoe}${sole}
      <path d="${mx(k, 'M -100 -608 C -108 -480 -104 -280 -96 -62 L -28 -62 C -22 -280 -14 -480 -6 -604 Z')}" fill="${u('pants')}" filter="url(#pc)"/>
      <path d="${mx(k, 'M -54 -560 C -56 -420 -58 -260 -60 -70')}" stroke="${darken(col.pants, .3)}" stroke-width="3" fill="none" opacity=".5" filter="url(#soft2)"/>
      <path d="${mx(k, 'M -16 -585 Q -45 -565 -64 -532')}" stroke="${darken(col.pants, .35)}" stroke-width="3" fill="none" opacity=".6" filter="url(#soft2)"/>`;
    // breeches to the knee + boots or stockings & shoes
    const lower = foot === 'boots' ? `
      <path d="${mx(k, 'M -100 -362 L -98 -335 C -106 -280 -104 -220 -92 -150 C -88 -120 -86 -100 -84 -86 C -100 -60 -132 -44 -140 -22 C -146 -6 -128 4 -100 2 L -28 2 C -20 -10 -26 -50 -34 -86 C -30 -130 -18 -200 -16 -260 C -14 -300 -16 -320 -18 -335 L -16 -362 Z')}" fill="url(#bootG)" filter="url(#pc)"/>
      <path d="${mx(k, 'M -84 -320 C -92 -250 -90 -180 -80 -112')}" stroke="#fff" stroke-width="8" fill="none" opacity="${k < 0 ? .2 : .1}" filter="url(#soft2)"/>
      <path d="${mx(k, 'M -106 -398 Q -60 -420 -10 -398 L -14 -334 Q -60 -350 -102 -334 Z')}" fill="url(#cuffG)" filter="url(#pcsl)"/>` : `
      <path d="${mx(k, 'M -94 -372 C -104 -300 -102 -230 -88 -150 C -84 -110 -82 -90 -80 -70 L -36 -70 C -34 -100 -26 -160 -20 -240 C -18 -300 -20 -340 -22 -372 Z')}" fill="url(#stockG)" filter="url(#pc)"/>
      <path d="${mx(k, 'M -98 -392 L -18 -392 L -20 -366 L -96 -366 Z')}" fill="${darken(col.pants, .08)}" filter="url(#pcsl)"/>${shoe}`;
    return `${groundShadow}
      <path d="${mx(k, 'M -100 -608 C -110 -540 -104 -450 -92 -372 L -22 -372 C -16 -450 -10 -540 -6 -604 Z')}" fill="${u('pants')}" filter="url(#pc)"/>
      <path d="${mx(k, 'M -16 -585 Q -45 -565 -64 -532 M -18 -556 Q -40 -542 -54 -516')}" stroke="${darken(col.pants, .3)}" stroke-width="3" fill="none" opacity=".75" filter="url(#soft2)"/>
      ${lower}${sole}`;
  }).join('');

  // ----- hands (authored for the screen-left hand, mirrored for the right) -----
  const hand = k => hands === 'gloves' ? `
      <path d="${mx(k, 'M -157 -634 C -150 -606 -152 -582 -164 -568 C -172 -558 -188 -556 -198 -563 C -208 -572 -212 -592 -210 -634 Z')}" fill="url(#gloveG)" filter="url(#pcsl)"/>
      <path d="${mx(k, 'M -161 -622 C -147 -614 -144 -596 -152 -586 C -156 -582 -162 -586 -164 -594 Z')}" fill="#e2dbcc"/>
      <path d="${mx(k, 'M -174 -594 L -175 -566 M -186 -596 L -188 -562 M -198 -596 L -199 -568')}" stroke="#a49b8a" stroke-width="2.5" stroke-linecap="round"/>` : `
      <path d="${mx(k, 'M -159 -640 C -150 -608 -152 -584 -164 -570 C -172 -560 -188 -558 -198 -565 C -208 -574 -211 -594 -209 -640 Z')}" fill="${S.mid}" filter="url(#pks_${sk})"/>
      <path d="${mx(k, 'M -161 -626 C -148 -618 -146 -600 -153 -590 C -157 -586 -163 -590 -165 -598 Z')}" fill="${S.hi}"/>
      <path d="${mx(k, 'M -176 -592 L -177 -570 M -188 -594 L -189 -566 M -199 -594 L -200 -572')}" stroke="${S.line}" stroke-width="2" stroke-linecap="round" opacity=".6"/>`;
  const sleeveCol = top === 'vest' ? col.under : top === 'robe' ? col.robe : darken(col.coat, .2);
  const cuffCol = top === 'military' ? darken(col.accent, .3) : top === 'vest' ? darken(col.under, .12) : top === 'robe' ? col.trim : darken(col.coat, .35);
  const arm = k => {
    if ((k < 0 && e.noArmL) || (k > 0 && e.noArmR)) return '';
    const pose = k < 0 ? e.armL : e.armR;
    if (pose) { const w = top === 'robe' ? 31 : 28;
      return posedArm(k, [k * 155, -925], pose.el, pose.wr, { r1: w, r2: w * .86, r3: w * .74, S, sk, sleeve: sleeveCol, sleeveLen: 1.85, cuff: cuffCol, hand: pose.hand, hrot: pose.hrot, hs: pose.hs ?? 1.35 }); }
    const ang = k < 0 ? raiseLeft : -raiseRight;
    const w = top === 'robe' ? 64 : 56;
    return `<g transform="rotate(${ang} ${k * 155} -925)">
      <path d="${mx(k, 'M -155 -925 Q -190 -820 -182 -660')}" stroke="${sleeveCol}" stroke-width="${w}" stroke-linecap="round" fill="none" filter="url(#pclA)"/>
      <path d="${mx(k, 'M -168 -880 Q -186 -800 -176 -700')}" stroke="${lighten(sleeveCol, .25)}" stroke-width="10" stroke-linecap="round" fill="none" filter="url(#soft2)" opacity="${k < 0 ? .55 : .2}"/>
      <path d="${mx(k, 'M -183 -690 L -182 -652')}" stroke="${cuffCol}" stroke-width="${w + 2}" filter="url(#pcsA)"/>
      ${hand(k)}</g>`;
  };
  const tuckedArm = `
    <clipPath id="${g('tuck')}"><rect x="-400" y="-1100" width="336" height="600"/></clipPath>
    <g clip-path="url(#${g('tuck')})">
      <path d="M-150 -925 Q-205 -830 -180 -730 Q-124 -721 -60 -752" stroke="${darken(col.coat, .2)}" stroke-width="56" stroke-linecap="round" fill="none" filter="url(#pclA)"/>
      <path d="M-168 -880 Q-190 -810 -172 -752" stroke="${lighten(col.coat, .25)}" stroke-width="12" stroke-linecap="round" fill="none" filter="url(#soft2)" opacity=".7"/>
      <path d="M-100 -744 L-60 -755" stroke="${u('acc')}" stroke-width="54" filter="url(#pcsA)"/>
    </g>
    <path d="M-65 -794 L-62 -712" stroke="${darken(col.under, .45)}" stroke-width="3" opacity=".85"/>
    <path d="M-60 -792 L-56 -714" stroke="#2a1c10" stroke-width="7" opacity=".25" filter="url(#soft2)"/>`;

  // ----- torso by outfit -----
  let torso = '', neckwear = '';
  const neck = `<path d="M-34 -1004 L34 -1004 L36 -950 L-36 -950Z" fill="${S.neck}" filter="url(#pks_${sk})"/>`;
  if (top === 'military' || top === 'jacket') {
    const lapel = top === 'military' ? u('acc') : u('coatDk');
    torso = `
      <path d="M-150 -650 L-185 -420 L-100 -462 L-70 -630Z" fill="${u('coatDk')}" filter="url(#pc)"/>
      <path d="M150 -650 L185 -420 L100 -462 L70 -630Z" fill="${u('coatDk')}" filter="url(#pc)"/>
      __LEGS__
      <path d="M-72 -945 L72 -945 L78 -600 Q0 -575 -78 -600Z" fill="${u('under')}" filter="url(#pcl)"/>
      <path d="M-60 -700 Q0 -688 60 -700" stroke="${darken(col.under, .35)}" stroke-width="5" fill="none" filter="url(#soft2)"/>
      <path d="M-60 -952 C-120 -965 -172 -955 -178 -905 L-162 -640 L-148 -560 L-72 -598 L-52 -760Z" fill="${u('coat')}" filter="url(#pcl)"/>
      <path d="M60 -952 C120 -965 172 -955 178 -905 L162 -640 L148 -560 L72 -598 L52 -760Z" fill="${darken(col.coat, .35)}" filter="url(#pcl)"/>
      <g filter="url(#soft)" opacity=".5"><path d="M-130 -900 Q-118 -760 -138 -620" stroke="${darken(col.coat, .6)}" stroke-width="12" fill="none"/>
        <path d="M125 -900 Q112 -760 132 -620" stroke="${darken(col.coat, .7)}" stroke-width="16" fill="none"/>
        <path d="M-160 -900 Q-150 -780 -158 -660" stroke="${lighten(col.coat, .35)}" stroke-width="10" fill="none"/></g>
      <path d="M-58 -950 L-108 -938 L-80 -760 L-52 -770Z" fill="${lapel}" filter="url(#pcsl)"/>
      <path d="M58 -950 L108 -938 L80 -760 L52 -770Z" fill="${top === 'military' ? darken(col.accent, .35) : darken(col.coat, .5)}" filter="url(#pcsl)"/>
      ${(top === 'military' ? [-905, -865, -825, -790] : [-860, -800]).map((y, i) => `<circle cx="${-82 + i * 3}" cy="${y}" r="8" fill="url(#goldG)" filter="url(#pcsl)"/>${top === 'military' ? `<circle cx="${82 - i * 3}" cy="${y}" r="8" fill="url(#goldG)" filter="url(#pcsl)"/>` : ''}`).join('')}`;
    neckwear = top === 'military' ? `${neck}
      <path d="M-80 -998 L80 -998 L82 -945 L-82 -945Z" fill="${u('acc')}" filter="url(#pcsl)"/>
      <path d="M-38 -992 L38 -992 L22 -948 L-22 -948Z" fill="#f1ece0" filter="url(#pcs)"/>
      ${[-1, 1].map(s => `<g>${[-200, -188, -176, -164, -152, -140, -128].map((x, i) => `<path d="M${s * x} -945 L${s * (x - 3)} -900" stroke="${i % 2 ? darken(col.trim, .2) : lighten(col.trim, .2)}" stroke-width="7" stroke-linecap="round"/>`).join('')}
        <ellipse cx="${s * 160}" cy="-950" rx="54" ry="20" fill="url(#goldG)" filter="url(#pcsl)"/></g>`).join('')}` : `${neck}
      <path d="M-44 -1000 L-6 -958 L-24 -944 L-62 -982 Z" fill="#f1ece0" filter="url(#pcsl)"/><path d="M44 -1000 L6 -958 L24 -944 L62 -982 Z" fill="#e4ddcd" filter="url(#pcsl)"/>
      <path d="M-20 -966 Q0 -958 20 -966 L14 -920 Q0 -912 -14 -920 Z" fill="${o.tie || '#f1ece0'}" filter="url(#pcs)"/>`;
  } else if (top === 'vest') {
    torso = `__LEGS__
      <path d="M-60 -955 C-130 -965 -172 -955 -178 -905 L-165 -620 L-150 -585 Q0 -560 150 -585 L165 -620 L178 -905 C172 -955 130 -965 60 -955 Z" fill="${u('underB')}" filter="url(#pcl)"/>
      <path d="M-58 -950 C-95 -955 -128 -948 -130 -915 L-122 -600 Q-90 -585 -66 -592 L-36 -760 Z" fill="${u('coat')}" filter="url(#pcl)"/>
      <path d="M58 -950 C95 -955 128 -948 130 -915 L122 -600 Q90 -585 66 -592 L36 -760 Z" fill="${darken(col.coat, .3)}" filter="url(#pcl)"/>
      ${[-840, -780, -720].map(y => `<circle cx="-48" cy="${y}" r="6" fill="${darken(col.coat, .5)}" filter="url(#pcsl)"/>`).join('')}
      <path d="M-120 -610 Q0 -585 120 -610 L118 -580 Q0 -556 -118 -580 Z" fill="${darken(col.pants, .35)}" filter="url(#pcsl)"/>`;
    neckwear = `${neck}<path d="M-44 -1000 L-6 -950 L-28 -940 L-62 -982 Z" fill="${lighten(col.under, .2)}" filter="url(#pcsl)"/><path d="M44 -1000 L6 -950 L28 -940 L62 -982 Z" fill="${col.under}" filter="url(#pcsl)"/>`;
  } else { // robe / dress
    torso = `
      <path d="M-60 -962 C-130 -967 -175 -952 -180 -905 C-190 -700 -205 -350 -215 -8 L215 -8 C205 -350 190 -700 180 -905 C175 -952 130 -967 60 -962 Z" fill="${u('robe')}" filter="url(#pcl)"/>
      <g filter="url(#soft)" opacity=".55">
        <path d="M-90 -560 C-100 -400 -115 -200 -125 -20" stroke="${darken(col.robe, .55)}" stroke-width="16" fill="none"/>
        <path d="M30 -560 C34 -400 38 -200 42 -20" stroke="${darken(col.robe, .5)}" stroke-width="14" fill="none"/>
        <path d="M120 -560 C135 -400 150 -200 160 -20" stroke="${darken(col.robe, .6)}" stroke-width="18" fill="none"/>
        <path d="M-40 -560 C-44 -400 -48 -200 -52 -20" stroke="${lighten(col.robe, .3)}" stroke-width="10" fill="none"/></g>
      <path d="M-150 -640 Q0 -615 150 -640 L148 -598 Q0 -575 -148 -598 Z" fill="${u('trim')}" filter="url(#pcsl)"/>
      ${foot === 'sandals' ? [-1, 1].map(k => `<path d="${mx(k, 'M -100 -10 C -112 0 -108 10 -90 10 L -40 10 C -34 0 -40 -10 -50 -10 Z')}" fill="${S.mid}" filter="url(#pks_${sk})"/><path d="${mx(k, 'M -98 -4 L -44 -4')}" stroke="#5a3a20" stroke-width="5"/>`).join('') : ''}`;
    neckwear = `<path d="M-36 -1004 L36 -1004 L40 -930 Q0 -905 -40 -930 Z" fill="${S.neck}" filter="url(#pks_${sk})"/>
      <path d="M-62 -962 Q0 -880 62 -962" stroke="${darken(col.robe, .35)}" stroke-width="6" fill="none"/>
      ${o.necklace ? `<path d="M-46 -955 Q0 -900 46 -955" stroke="${u('trim')}" stroke-width="10" fill="none" filter="url(#pcsl)"/><circle cx="0" cy="-912" r="12" fill="url(#goldG)" filter="url(#pcsl)"/>` : ''}`;
  }
  torso = torso.replace('__LEGS__', legsSVG);
  const arms = (tucked ? tuckedArm : arm(-1)) + arm(1);

  // ----- head -----
  const backHair = hair === 'long'
    ? `<path d="M-82 -1150 C-112 -1090 -116 -980 -108 -880 L-96 -896 L-86 -872 L-74 -894 L-60 -900 L60 -900 L74 -894 L86 -872 L96 -896 L108 -880 C116 -980 112 -1090 82 -1150 Z" fill="${u('hair')}" filter="url(#pcs)"/>`
    : hair === 'bald' ? '' : [-1, 1].map(k => `<path d="${mx(k, 'M -62 -1162 C -88 -1150 -94 -1104 -87 -1068 L -83 -1060 L -80 -1068 L -76 -1058 L -73 -1068 L -70 -1104 Z')}" fill="${u('hair')}" filter="url(#pcs)"/>`).join('');
  const hairTop = hat !== 'none' && hat !== 'crown' ? '' :
    hair === 'bald' ? `<ellipse cx="-14" cy="-1150" rx="30" ry="10" fill="#fff" opacity=".25" filter="url(#soft2)"/>` :
    `<path d="M-78 -1100 C-84 -1170 -50 -1208 0 -1210 C50 -1208 84 -1170 78 -1100 L70 -1112 C66 -1140 50 -1150 30 -1146 L20 -1128 L8 -1144 L-6 -1124 L-16 -1144 L-30 -1126 L-40 -1146 C-58 -1148 -68 -1136 -70 -1112 Z" fill="${u('hair')}" filter="url(#pcsl)"/>
     <path d="M-50 -1186 Q-30 -1170 -26 -1140 M-10 -1200 Q0 -1176 2 -1144 M30 -1194 Q38 -1170 40 -1150" stroke="${HC[2]}" stroke-width="2.5" fill="none" opacity=".6"/>`;
  const fringe = hair === 'forelock' ? `
    <path d="M-68 -1150 Q-30 -1166 12 -1154 Q34 -1148 48 -1140 L34 -1136 L26 -1124 L16 -1134 L6 -1112 L-4 -1130 L-16 -1110 L-24 -1128 L-38 -1116 L-42 -1132 L-56 -1124 L-58 -1138 Z" fill="${u('hair')}" filter="url(#pcsl)"/>
    <path d="M-50 -1146 Q-40 -1134 -38 -1118 M-26 -1152 Q-16 -1134 -14 -1114 M-2 -1152 Q4 -1134 4 -1116 M20 -1150 Q24 -1140 26 -1128" stroke="${HC[2]}" stroke-width="2" fill="none" opacity=".9"/>`
    : hair === 'long' ? [-1, 1].map(k => `<path d="${mx(k, 'M -64 -1146 C -86 -1104 -92 -1040 -88 -984 C -86 -950 -94 -926 -108 -904 L -96 -906 L -90 -890 L -80 -912 C -70 -946 -66 -996 -64 -1046 C -62 -1092 -58 -1124 -50 -1146 Z')}" fill="${u('hair')}" filter="url(#pcsl)"/>
      <path d="${mx(k, 'M -70 -1120 C -80 -1070 -82 -1010 -86 -950 M -62 -1110 C -70 -1060 -72 -1010 -76 -960')}" stroke="${HC[2]}" stroke-width="2" fill="none" opacity=".5"/>`).join('') : '';
  const sideburns = hair === 'bald' ? '' : [-1, 1].map(k => `<path d="${mx(k, 'M -73 -1136 C -71 -1110 -70 -1088 -66 -1064 L -61 -1068 C -63 -1090 -63 -1112 -62 -1136 Z')}" fill="${u('hair')}" filter="url(#pcs)"/>`).join('');
  const beardSVG = beard === 'full' ? `<path d="M-72 -1070 C-76 -1000 -44 -948 0 -942 C44 -948 76 -1000 72 -1070 C62 -1036 44 -1018 22 -1022 Q0 -1012 -22 -1022 C-44 -1018 -62 -1036 -72 -1070 Z" fill="${u('hair')}" filter="url(#pcsl)"/>
      <path d="M-40 -1000 Q-30 -975 -20 -962 M0 -996 L0 -956 M40 -1000 Q30 -975 20 -962" stroke="${HC[2]}" stroke-width="2" fill="none" opacity=".5"/>`
    : beard === 'stubble' ? `<g clip-path="url(#${g('face')})"><path d="M-58 -1040 C-50 -990 -20 -970 0 -970 C20 -970 50 -990 58 -1040 C40 -1002 -40 -1002 -58 -1040Z" fill="#5c6878" opacity=".16" filter="url(#soft)"/></g>` : '';
  const mustache = beard === 'mustache' || beard === 'full' ? `<path d="M-30 -1018 C-18 -1030 -6 -1028 0 -1022 C6 -1028 18 -1030 30 -1018 C22 -1012 10 -1012 0 -1016 C-10 -1012 -22 -1012 -30 -1018 Z" fill="${u('hair')}" filter="url(#pcs)"/>` : '';

  const eyes = [-1, 1].map(s => {
    const x = s * 28, w = shock ? 1.25 : 1;
    const eye = `M${x - 16} -1084 Q${x} ${-1094 - shock * 5} ${x + 16} -1084 Q${x} ${-1077 + shock * 2} ${x - 16} -1084Z`;
    return `<clipPath id="${g('e' + (s + 1))}"><path d="${eye}"/></clipPath>
      <path d="${eye}" fill="#efe7dd"/>
      <g clip-path="url(#${g('e' + (s + 1))})">
        <circle cx="${x + look}" cy="${-1085 + lookY}" r="${6.5 / w}" fill="${o.eyeColor || '#5f7181'}"/><circle cx="${x + look}" cy="${-1085 + lookY}" r="${3 / w}" fill="#0d0907"/>
        <circle cx="${x + look + 2}" cy="${-1088 + lookY}" r="1.6" fill="#fff"/>
        <rect x="${x - 18}" y="-1096" width="36" height="${lid * 15}" fill="${S.ear}"/>
        <path d="M${x - 16} -1084 Q${x} -1094 ${x + 16} -1084" stroke="#000" stroke-opacity=".25" stroke-width="5" fill="none" filter="url(#soft2)"/>
      </g>
      <path d="M${x - 17} ${-1083 + Math.min(lid, 1) * 8} Q${x} ${-1094 - shock * 5 + Math.min(lid, 1) * 13} ${x + 17} ${-1085 + Math.min(lid, 1) * 8}" stroke="#2b1a12" stroke-width="3.2" fill="none" stroke-linecap="round"/>
      <path d="M${x - 15} ${-1100 - shock * 6} Q${x} ${-1105 - shock * 6} ${x + 15} ${-1099 - shock * 6}" stroke="${S.line}" stroke-width="2" fill="none" opacity=".6"/>`;
  }).join('');
  const brows = [-1, 1].map((s, i) => {
    const dy = -(i ? browR : browL) - shock * 10;
    return `<path d="M${s * 9} ${-1103 + dy + (lid ? 3 : 0)} Q${s * 28} ${-1114 + dy} ${s * 50} ${-1104 + dy}" stroke="${hair === 'bald' ? HC[1] : HC[1]}" stroke-width="${o.browW || 7}" stroke-linecap="round" fill="none" filter="url(#softW2)"/>`;
  }).join('');
  const mouth = shock ? `
      <path d="M-14 -1014 Q0 -1020 14 -1014 Q16 -998 0 -992 Q-16 -998 -14 -1014Z" fill="#3a1410"/>
      <path d="M-10 -1013 Q0 -1016 10 -1013 L9 -1009 Q0 -1011 -9 -1009Z" fill="#e9e1d4"/>
      <path d="M-15 -1014 Q0 -1022 15 -1014" stroke="${S.lip}" stroke-width="3" fill="none"/>`
    : talk > .05 ? `<path d="M-16 -1012 Q0 -1016 16 -1012 Q14 ${-1012 + talk * 16} 0 ${-1010 + talk * 18} Q-14 ${-1012 + talk * 16} -16 -1012Z" fill="#3a1410"/>
      <path d="M-17 -1012 Q0 -1018 17 -1012" stroke="${S.mouth}" stroke-width="3" fill="none"/>`
    : `<path d="M-24 -1012 Q-4 -1008 ${22 + smirk * 4} ${-1013 - smirk * 6}" stroke="${S.mouth}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <ellipse cx="0" cy="-1002" rx="16" ry="5" fill="${S.lip}" opacity=".55" filter="url(#soft2)"/>`;
  const crude = v !== 'A' ? '' : `<g>${[-1, 1].map((s, i) => {
      const x = s * 30, r = shock ? 27 : 23, cy = -1088 - shock * 4, l = lid, br = i ? browR : browL;
      const lf = l >= 1.5 ? 2.2 : l * 1.15;
      return `<circle cx="${x}" cy="${cy}" r="${r}" fill="url(#eyeW)" stroke="#111" stroke-width="3.5"/>
        <circle cx="${x + look * 1.6}" cy="${cy + lookY * 1.4 + Math.min(l, 1) * 7}" r="${shock ? 6 : 9.5}" fill="#0b0b0b"/>
        ${l > 0 ? `<clipPath id="${g('cl' + i)}"><circle cx="${x}" cy="${cy}" r="${r - 1.5}"/></clipPath>
          <g clip-path="url(#${g('cl' + i)})"><path d="M${x - r - 2} ${cy - r - 2} H${x + r + 2} V${cy - r + lf * r}H${x - r - 2}Z" fill="${l >= 1.5 ? S.ear : '#3c3c3e'}"/></g>` : ''}
        ${br ? `<path d="M${x - 24} ${cy - r - 6 - br} Q${x} ${cy - r - 14 - br} ${x + 24} ${cy - r - 8 - br}" stroke="#111" stroke-width="9" stroke-linecap="round" fill="none"/>` : ''}`;
    }).join('')}
    ${shock ? `<path d="M-17 -1016 Q0 -1024 17 -1016 Q20 -995 0 -988 Q-20 -995 -17 -1016Z" fill="#111"/>`
      : `<path d="M-26 -1012 Q0 -1000 ${26 + smirk * 2} ${-1016 - smirk * 6}" stroke="#111" stroke-width="5" fill="none" stroke-linecap="round"/>`}</g>`;

  const hatSVG = {
    none: '',
    bicorne: `<path d="M-245 -1118 Q-160 -1285 0 -1275 Q160 -1285 245 -1118 Q120 -1152 0 -1150 Q-120 -1152 -245 -1118Z" fill="url(#${g('hat')})" filter="url(#pcl)"/>
      <path d="M-210 -1150 Q-130 -1240 -20 -1252" stroke="#55545c" stroke-width="12" fill="none" opacity=".45" filter="url(#soft2)"/>
      <path d="M-238 -1121 Q-120 -1156 0 -1154 Q120 -1156 238 -1121" stroke="${darken(col.trim, .35)}" stroke-width="5" fill="none"/>
      <circle cx="80" cy="-1200" r="22" fill="#2e4a86"/><circle cx="80" cy="-1200" r="14" fill="#ece6d8"/><circle cx="80" cy="-1200" r="7" fill="#a8312d"/>`,
    tophat: `<path d="M-84 -1170 L-74 -1400 Q0 -1414 74 -1400 L84 -1170 Z" fill="url(#${g('hat')})" filter="url(#pcl)"/>
      <path d="M-82 -1206 L82 -1206 L83 -1176 L-83 -1176 Z" fill="${o.hatBand || '#3a2a20'}"/>
      <path d="M-140 -1160 Q0 -1196 140 -1160 Q120 -1146 0 -1150 Q-120 -1146 -140 -1160 Z" fill="url(#${g('hat')})" filter="url(#pcl)"/>
      <path d="M-60 -1390 L-66 -1220" stroke="#5a5862" stroke-width="10" opacity=".45" filter="url(#soft2)"/>`,
    cap: `<path d="M-84 -1130 C-90 -1220 -40 -1250 0 -1250 C40 -1250 90 -1220 84 -1130 Q0 -1150 -84 -1130 Z" fill="url(#${g('hat')})" filter="url(#pcl)"/>
      <path d="M-84 -1132 Q-20 -1154 60 -1140 Q90 -1118 120 -1110 Q60 -1104 -84 -1120 Z" fill="${darken(o.hatColor || '#2a2a30', .35)}" filter="url(#pcsl)"/>`,
    crown: `<g transform="translate(0 -1152) scale(.84) translate(0 1152)"><path d="M-74 -1150 L-80 -1250 L-46 -1210 L-24 -1270 L0 -1216 L24 -1270 L46 -1210 L80 -1250 L74 -1150 Z" fill="url(#goldG)" filter="url(#pcl)"/>
      ${[-46, 0, 46].map(x => `<circle cx="${x}" cy="-1176" r="9" fill="${x ? '#2e6a3a' : '#a8312d'}"/>`).join('')}</g>`,
  }[hat] ?? (o.customHat ? o.customHat({ g, u, S, col }) : '');
  const hatDef = linG(g('hat'), [lighten(o.hatColor || '#232227', .15), o.hatColor || '#141417', darken(o.hatColor || '#141417', .6)], { x2: 0, y2: 1 });

  const sweatDrop = sweat ? `<g transform="translate(0 ${sweatY})"><path d="M86 -1112 Q80 -1098 84 -1092 Q90 -1088 93 -1096 Q93 -1104 86 -1112Z" fill="#fff" opacity=".55"/></g>` : '';

  return `${defs}<defs>${hatDef}</defs>
  <g filter="url(#tex)">${backHair && hair === 'long' ? backHair : ''}${o.body ? o.body({ g, u, S, sk, col, e, legs: legsSVG, arm, hand, neck: `<path d="M-34 -1004 L34 -1004 L36 -950 L-36 -950Z" fill="${S.neck}" filter="url(#pks_${sk})"/>` }) : torso + arms + neckwear}</g>
  ${o.overBody ? o.overBody({ g, u, S, sk, col, e }) : ''}
  <g transform="rotate(${tilt} 0 -980)">
  <g filter="url(#tex)">
    ${hair !== 'long' ? backHair : ''}
    ${o.ears ? o.ears({ g, u, S, sk, turn }) : `<ellipse cx="${F1(-73 - turn * 4)}" cy="-1075" rx="${F1(12 * (1 - .85 * Math.max(0, -turn)))}" ry="22" fill="${S.ear}" filter="url(#pks_${sk})"/><ellipse cx="${F1(73 - turn * 4)}" cy="-1075" rx="${F1(12 * (1 - .85 * Math.max(0, turn)))}" ry="22" fill="${S.earDk}" filter="url(#pks_${sk})"/>`}
    <path d="${o.facePath || FACE}" fill="${u('skin')}" filter="url(#pk_${sk})"/>
    ${o.faceShade ? `<g clip-path="url(#${g('face')})"><g transform="translate(${TX} 0)">${o.faceShade({ g, u, S, e })}</g></g>` : `<g clip-path="url(#${g('face')})"><g filter="url(#soft)" transform="translate(${TX} 0)">
      <ellipse cx="-28" cy="-1088" rx="26" ry="13" fill="${S.shade}" opacity="${o.child ? .22 : .45}"/>
      <ellipse cx="28" cy="-1088" rx="26" ry="13" fill="${S.shade}" opacity="${o.child ? .26 : .5}"/>
      <path d="M3 -1088 C5 -1066 13 -1052 15 -1040 L5 -1036 C5 -1050 -1 -1068 3 -1088Z" fill="${S.shade}" opacity="${o.child ? .35 : .65}"/>
      <ellipse cx="0" cy="-1031" rx="16" ry="6" fill="${S.deep}" opacity=".5"/>
      <ellipse cx="50" cy="-1035" rx="22" ry="42" fill="${S.shade}" opacity=".4"/>
      <ellipse cx="0" cy="-972" rx="70" ry="22" fill="${S.deep}" opacity=".45"/>
      ${hat !== 'none' ? `<ellipse cx="0" cy="-1152" rx="95" ry="36" fill="#3a2520" opacity=".6"/>` : ''}
      <ellipse cx="-12" cy="-1122" rx="28" ry="12" fill="#fff3e2" opacity=".35"/>
      <ellipse cx="-4" cy="-1066" rx="4" ry="18" fill="#fff3e2" opacity=".45"/>
      <ellipse cx="-42" cy="-1042" rx="18" ry="11" fill="${S.blush}" opacity=".3"/>
    </g></g>`}
    ${hairTop}${sideburns}${fringe}${beardSVG}
    <g transform="translate(${TX} 0)">
    ${v === 'A' || o.ownFace ? '' : eyes + brows}
    ${o.ownNose ? '' : o.child ? `<ellipse cx="-6.5" cy="-1036" rx="3.6" ry="2.2" fill="${S.nostril}" opacity=".75"/><ellipse cx="7.5" cy="-1036" rx="3.6" ry="2.2" fill="${S.nostril}" opacity=".75"/>
    <path d="M-13 -1042 Q-15 -1036 -10 -1033 M15 -1042 Q17 -1036 12 -1033" stroke="${S.line}" stroke-width="1.6" fill="none" opacity=".4"/>
    <ellipse cx="1" cy="-1047" rx="9" ry="7" fill="${S.blush}" opacity=".22" filter="url(#soft2)"/>`
    : `<ellipse cx="-7" cy="-1037" rx="4.5" ry="2.6" fill="${S.nostril}"/><ellipse cx="9" cy="-1037" rx="4.5" ry="2.6" fill="${S.nostril}"/>
    <path d="M-15 -1043 Q-17 -1036 -11 -1032 M17 -1043 Q19 -1036 13 -1032" stroke="${S.line}" stroke-width="2.5" fill="none"/>
    <path d="M-24 -1042 Q-32 -1022 -28 -1006 M24 -1042 Q32 -1022 28 -1006" stroke="${S.line}" stroke-width="2.5" fill="none" opacity=".5" filter="url(#soft2)"/>`}
    ${v === 'A' || o.ownFace ? '' : mouth}${o.noMustache ? '' : mustache}${o.faceExtra ? o.faceExtra({ g, u, S, e }) : ''}</g>
    ${hatSVG}
  </g>
  ${crude}${sweatDrop}
  </g>`;
}
const FACE = 'M-72 -1110 C-76 -1060 -70 -1022 -50 -996 C-35 -978 -15 -968 0 -968 C15 -968 35 -978 50 -996 C70 -1022 76 -1060 72 -1110 C66 -1150 35 -1172 0 -1172 C-35 -1172 -66 -1150 -72 -1110Z';

// Convenience: a lit, breathing, placed person. x/y = feet position on canvas, s = scale (1.2 ≈ full body in frame).
const placePerson = (x, y, s, look, pose = {}, t = 0, v = (typeof window !== 'undefined' && window.VARIANT) || 'B') =>
  `<ellipse cx="${x + 30 * s}" cy="${y}" rx="${260 * s}" ry="${32 * s}" fill="#000" opacity=".3" filter="url(#soft)"/>
   <g transform="translate(${x} ${y}) scale(${s})"><g transform="${breathe(t)}">${lit(person(look, pose, v))}</g></g>`;
// Framing presets for a person whose feet are at local y=0 (canvas is 1080x1920):
const FRAMING = {
  wide: { y: 1800, s: 1.3 },     // full body, feet visible
  medium: { y: 2440, s: 1.5 },   // knees up
  close: { y: 3420, s: 2.6 },    // head & shoulders
  extreme: { y: 4300, s: 3.6 },  // face fills frame
};

// ---------- pop-up helpers (keep them clean & period-neutral) ----------
const sparkle = (x, y, s, rot, fill = '#ffe14a') => `<path transform="translate(${x} ${y}) rotate(${rot}) scale(${s})" d="M0 -40 L9 -9 L40 0 L9 9 L0 40 L-9 9 L-40 0 L-9 -9Z" fill="${fill}" stroke="#111" stroke-width="4" stroke-linejoin="round"/>`;
// Hand-drawn marker circle that draws itself on (p = 0..1).
const markerCircle = (cx, cy, rx, ry, p = 1, color = '#e3150f') => `<path pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="${1 - p}" d="M${cx - rx} ${cy} C${cx - rx} ${cy - ry * 1.1} ${cx + rx * 1.05} ${cy - ry} ${cx + rx} ${cy + ry * .1} C${cx + rx * .95} ${cy + ry * 1.05} ${cx - rx * .9} ${cy + ry} ${cx - rx * 1.02} ${cy - ry * .25} L${cx - rx * .8} ${cy - ry * .75}" stroke="${color}" stroke-width="11" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;

// ---------- captions ----------
// Which words turn yellow is an editorial call — names, numbers, the key noun/verb, the punchline word.
// autoKey is only a fallback: digits or longer content words → yellow; short/function words → white.
const CAPTION_PLAIN = new Set(('a an the and or but so to of in on at by for with from into onto over under about after before ' +
  'he she it they we you i me him her us them his its their our your my this that these those there here then than ' +
  'is are was were be been being am do does did done have has had will would could should can may might must ' +
  'not no yes just also very really only even still again first next last some more most all every each other another ' +
  'what which who whom when where why how because while if as like one two up down out off').split(' '));
const autoKey = w => { const c = w.toLowerCase().replace(/[^a-z0-9'-]/g, ''); return /\d/.test(c) || (c.length >= 5 && !CAPTION_PLAIN.has(c) && !/'(t|s|re|ll|ve|d)$/.test(c)); };
const escHTML = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ---------- timeline: shots + layered dissolves + captions ----------
// shots: [{ at, draw(v, t) -> svg string, css?(t) -> css filter, label?: { B: [text, x, y, showAt] } }]
// trans: [[cutTime, start, end, style]] style: zoom | dim | pull | flash | whip | cross
// words: [[t, 'Word,', key?, end?], ...] — caption text exactly as it should appear (casing + punctuation);
//        key = true/false forces yellow/white (omit to use autoKey); end = optional time to hide the word.
// strong: [t, ...] stressed-syllable hits   phrases: [[t, 'caption'], ...] (only for captions: 'phrase')
// captions: 'word' (default, word-by-word) | 'phrase' | 'none'.  There is no on-screen numbering anywhere.
// ragged burn-hole outline centred on (cx, cy) with mean radius R (shape crawls slowly with t)
function burnBlob(cx, cy, R, t) {
  let d = '';
  for (let i = 0; i <= 120; i++) {
    const th = i / 120 * Math.PI * 2;
    const r = Math.max(0, R * (1 + .15 * Math.sin(3 * th + 1.3 + t * 2) + .09 * Math.sin(5 * th + .4 - t * 3) + .045 * Math.sin(9 * th + 2.1 + t * 4) + .022 * Math.sin(17 * th + t * 6) + .012 * Math.sin(29 * th + 1 - t * 8)));
    d += `${i ? 'L' : 'M'}${(cx + r * Math.cos(th)).toFixed(1)} ${(cy + r * Math.sin(th)).toFixed(1)} `;
  }
  return d + 'Z';
}
const mixHex = (c0, c1, p) => {
  const h = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
  const A = h(c0), B2 = h(c1);
  return '#' + A.map((v, i) => Math.round(v + (B2[i] - v) * Math.max(0, Math.min(1, p))).toString(16).padStart(2, '0')).join('');
};
// full-frame rolling smoke for the 'smoke' transitions: q = progress, cov = coverage 0..1
function smokeWipe(q, cov, col, op) {
  let c = '', s = 9173;
  const R = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 20; i++) {
    const x0 = R() * 1400 - 160, y0 = R() * 2300 - 190, r = 250 + R() * 260, dx = (R() - .5) * 260, sh = (R() - .5) * .3;
    const k = Math.max(0, Math.min(1, cov * (1.25 + 2 * sh)));
    c += `<circle cx="${(x0 + dx * q).toFixed(1)}" cy="${(y0 - 520 * q).toFixed(1)}" r="${(r * (.55 + .6 * k)).toFixed(1)}" fill="${i % 3 ? col : mixHex(col, '#000000', .25)}" opacity="${(op * k).toFixed(3)}"/>`;
  }
  return `<defs><filter id="smW" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="46"/></filter></defs>
    <rect x="-60" y="-60" width="1200" height="2040" fill="${col}" opacity="${(op * Math.max(0, cov * 1.3 - .3)).toFixed(3)}"/><g filter="url(#smW)">${c}</g>`;
}

// ---------- light rigs (for the relighting pass) ----------
// A shot calls lights(view, rig) inside draw(): positions are WORLD coordinates of that shot's set; view is the camera
// {fx, fy, s, sx, sy} given to view(), so the rig follows camera moves. Light z is height toward the viewer.
const DEFAULT_RIG = { lights: [], amb: '#8a90a8', ambGround: '#5a4c44', ambInt: .8, bgLight: .4, exposure: 1, tonemap: 'soft', white: 2.3,
  bloom: .22, bloomThresh: .85, normalStrength: 1.1, specScale: .45, vignette: .32, grain: .009, shadowTint: '#2c3c52', highTint: '#f8e0c0', sat: 1, contrast: 1, fade: 1 };
function lights(vw, rig) {
  const { fx = 540, fy = 960, s = 1, sx = 0, sy = 0, r = 0 } = vw || {};
  const cr = Math.cos(r * Math.PI / 180), sr = Math.sin(r * Math.PI / 180);
  const tp = ([x, y]) => { const dx = x - fx, dy = y - fy; return [540 + sx + s * (dx * cr - dy * sr), 960 + sy + s * (dx * sr + dy * cr)]; };
  const out = { ...DEFAULT_RIG, ...rig };
  out.lights = (rig.lights || []).filter(L => (L.int ?? 1) > .001).map(L => ({ ...L, pos: [...tp(L.pos), (L.pos[2] || 0) * s], rad: (L.rad || 900) * s }));
  if (rig.rays) out.rays = { ...rig.rays, center: tp(rig.rays.center), srcRad: (rig.rays.srcRad || 400) * s };
  if (typeof window !== 'undefined') { window.__L = window.__L || {}; window.__L[window.__shot ?? 0] = out; }
  return '';
}
function blendRigs(A, B, p) {
  A = A || DEFAULT_RIG; B = B || DEFAULT_RIG;
  const num = k => (A[k] ?? DEFAULT_RIG[k]) * (1 - p) + (B[k] ?? DEFAULT_RIG[k]) * p;
  const out = { ...B };
  for (const k of ['ambInt', 'bgLight', 'exposure', 'white', 'bloom', 'bloomThresh', 'normalStrength', 'specScale', 'vignette', 'grain', 'sat', 'contrast', 'fade']) if (k in A || k in B) out[k] = num(k);
  for (const k of ['amb', 'ambGround', 'shadowTint', 'highTint']) out[k] = mix(A[k] || DEFAULT_RIG[k], B[k] || DEFAULT_RIG[k], p);
  out.lights = [...(A.lights || []).map(L => ({ ...L, int: (L.int ?? 1) * (1 - p) })), ...(B.lights || []).map(L => ({ ...L, int: (L.int ?? 1) * p }))];
  const ra = A.rays, rb = B.rays;
  out.rays = ra && rb ? { ...rb, center: [lerp(ra.center[0], rb.center[0], p), lerp(ra.center[1], rb.center[1], p)], int: lerp(ra.int, rb.int, p) }
    : ra ? { ...ra, int: ra.int * (1 - p) } : rb ? { ...rb, int: rb.int * p } : undefined;
  return out;
}

function makeTimeline({ shots, trans = [], words = [], strong = [], phrases = [], captions = 'word', fps = 30, duration }) {
  const beat = t => {
    let b = 0;
    for (const [w] of words) b += .010 * decay(t, w, .09);
    for (const w of strong) b += .035 * decay(t, w, .12);
    return b;
  };
  const nsIds = (svg, sfx) => svg.replace(/id="([^"]+)"/g, `id="$1${sfx}"`).replace(/url\(#([^)]+)\)/g, `url(#$1${sfx})`).replace(/href="#([^"]+)"/g, `href="#$1${sfx}"`);
  // window.__shot tells lights() which shot is drawing; vignette + grain are added in post when relighting
  const shotSVG = (k, v, t, sfx) => { window.__shot = k; const body = shots[k].draw(v, t); return nsIds(sharedDefs() + body + (PASS() !== 'classic' ? '' : `
    <radialGradient id="vig" cx=".5" cy=".45" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".38"/></radialGradient>
    <rect width="1080" height="1920" fill="url(#vig)"/>
    <filter id="grainF" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="7" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
    <rect width="1080" height="1920" filter="url(#grainF)" opacity=".05"/>`), sfx); };
  const styleLayer = (el, { o = 1, s = 1, x = 0, y = 0, blur = 0, bright = 1, css = '' } = {}) => {
    el.style.opacity = o;
    el.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
    el.style.filter = [blur > .3 ? `blur(${blur}px)` : '', bright !== 1 ? `brightness(${bright})` : '', css].join(' ').trim() || 'none';
  };
  function render(t, v = 'B') {
    window.VARIANT = v; // person() picks this up, so shots don't have to pass the variant around
    window.__L = {}; window.__T = t;
    const L1 = document.getElementById('L1'), L2 = document.getElementById('L2'), L3 = document.getElementById('L3');
    let k = 0; while (k + 1 < shots.length && t >= shots[k + 1].at) k++;
    const tr = trans.find(([cut, a, b]) => t >= a && t < b && shots.findIndex(s => s.at === cut) > 0);
    if (L3) L3.innerHTML = '';
    // ---- transitions: no crossfades. Strip whips (both shots side by side, like a real pan), zoom-throughs and
    // punch-ins that cut at the midpoint, flashes, dips to black. The relight rig follows each layer's transform;
    // the post pass adds the motion blur of the move (window.__MBk[k] = a shot's own camera blur).
    window.__MBk = {};
    const XF = (el, { x = 0, y = 0, s = 1, r = 0, o = 1 }) => { el.style.opacity = o; el.style.display = o > 0 ? 'block' : 'none';
      el.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${s.toFixed(4)}) rotate(${r.toFixed(2)}deg)`; el.style.filter = 'none'; };
    const xfRig = (rig, { x = 0, y = 0, s = 1, r = 0 }, k = 1) => { if (!rig) return null; const R = JSON.parse(JSON.stringify(rig)), cr = Math.cos(r * Math.PI / 180), sr = Math.sin(r * Math.PI / 180);
      const P = ([px, py]) => { const dx = (px - 540) * s, dy = (py - 960) * s; return [540 + dx * cr - dy * sr + x, 960 + dx * sr + dy * cr + y]; };
      R.lights = (R.lights || []).map(L => ({ ...L, pos: [...P(L.pos), (L.pos[2] || 0) * s], rad: (L.rad || 900) * s, int: (L.int ?? 1) * k }));
      if (R.rays) R.rays = { ...R.rays, center: P(R.rays.center), srcRad: (R.rays.srcRad || 400) * s, int: R.rays.int * k };
      return R; };
    let rigT = null, mbT = { dx: 0, dy: 0, z: 0, cx: 540, cy: 960 }, visK = [];
    if (tr) {
      const [cut, a, b, style, opt] = tr, q = seg(t, a, b), out = shots.findIndex(s => s.at === cut) - 1, inc = out + 1, dt = 1 / 60;
      const q0 = seg(t - dt, a, b), O = opt || {};
      let f1 = null, f2 = null;     // layer transforms (null = hidden)
      if (style === 'whip' || style === 'whipv') {
        const dir = O.dir || 1, e = easeInOut(q), e0 = easeInOut(q0), D = style === 'whip' ? 1080 : 1920;
        const off = -dir * D * e, off2 = dir * D * (1 - e);
        f1 = style === 'whip' ? { x: off } : { y: off }; f2 = style === 'whip' ? { x: off2 } : { y: off2 };
        const v = -dir * D * (e - e0);
        if (style === 'whip') mbT.dx = v; else mbT.dy = v;
      } else if (style === 'zoom' || style === 'punch' || style === 'spin') {
        const [fx, fy] = O.at || [540, 960], [gx, gy] = O.to || [540, 960];
        const big = O.big ?? (style === 'punch' ? .18 : style === 'spin' ? 1.2 : 3.2), big2 = O.big2 ?? (style === 'punch' ? .16 : style === 'spin' ? 1.0 : 1.6);
        const S1 = u => 1 + big * easeIn(clamp(u / .5)), S2 = u => 1 + big2 * (1 - easeOut(clamp((u - .5) / .5)));
        const R1 = u => style === 'spin' ? (O.rot ?? 50) * easeIn(clamp(u / .5)) : 0, R2 = u => style === 'spin' ? -(O.rot ?? 50) * (1 - easeOut(clamp((u - .5) / .5))) : 0;
        if (q < .5) { const S = S1(q); f1 = { s: S, x: (fx - 540) * (1 - S), y: (fy - 960) * (1 - S), r: R1(q) }; mbT = { ...mbT, z: (S - S1(q0)) / S, cx: fx, cy: fy }; }
        else { const S = S2(q); f2 = { s: S, x: (gx - 540) * (1 - S), y: (gy - 960) * (1 - S), r: R2(q) }; mbT = { ...mbT, z: (S - S2(Math.max(.5, q0))) / S, cx: gx, cy: gy }; }
        if (style === 'punch' && q < .5) { f1 = { s: 1 }; mbT.z = 0; }
      } else if (style === 'black') {
        f1 = q < .5 ? {} : null; f2 = q < .5 ? null : {};
      } else {   // 'cut' / 'flash' / anything else: a straight cut at the midpoint (the flash is added in post)
        f1 = q < .5 ? {} : null; f2 = q < .5 ? null : {};
      }
      if (f1) { L1.innerHTML = shotSVG(out, v, t, '_a'); XF(L1, f1); visK.push([out, f1]); } else { L1.innerHTML = ''; XF(L1, { o: 0 }); }
      if (f2) { L2.innerHTML = shotSVG(inc, v, t, '_b'); XF(L2, f2); visK.push([inc, f2]); } else { L2.innerHTML = ''; XF(L2, { o: 0 }); }
      // rig: each visible shot's lights moved with its layer; scalar settings from the dominant one
      // two layers on screen (a strip whip): each layer's lights weighted by how much of the frame it covers
      const w2 = easeInOut(q), rs = visK.map(([kk, f], j) => xfRig(window.__L[kk], f, visK.length === 2 ? (j === 0 ? 1 - w2 : w2) : 1)).filter(Boolean);
      if (rs.length === 1) rigT = rs[0];
      else if (rs.length === 2) { rigT = blendRigs(rs[0], rs[1], w2); rigT.lights = [...rs[0].lights, ...rs[1].lights];
        rigT.rays = rs[w2 < .5 ? 0 : 1].rays; }
      if (style === 'black') { rigT = rigT || {}; rigT.fade = q < .5 ? 1 - easeInOut(q / .5) : easeInOut((q - .5) / .5); }
    } else {
      L1.style.display = 'none'; L1.innerHTML = ''; XF(L2, {});
      L2.innerHTML = shotSVG(k, v, t, '_b'); visK.push([k, {}]);
      if (shots[k].css) L2.style.filter = shots[k].css(t);
      rigT = window.__L[k];
    }
    // flash overlay: colour and strength per transition style (peaks at the cut)
    const FL = { flash: ['#fff6e8', .92], redflash: ['#a8141c', .7], greenflash: ['#c8f0d0', .75], bloom: ['#ffe6b8', .6] };
    let fl = 0, flc = '#fff6e8';
    for (const [cut, a, b, st, opt] of trans) if (FL[st]) {
      const m = (a + b) / 2, hw = Math.max(.04, (b - a) / 2), d = t - m;
      const v2 = d < 0 ? Math.max(0, 1 + d / hw) ** 2 : Math.exp(-d / ((opt && opt.decay) || .09));
      // keep the tail until the decay has died away (a slow decay cut off early leaves a visible step)
      if (t >= a - .001 && t < b + Math.max(.5, 6 * ((opt && opt.decay) || .09))) { const vv = FL[st][1] * v2 * ((opt && opt.k) ?? 1); if (vv > fl) { fl = vv; flc = (opt && opt.col) || FL[st][0]; } }
    }
    if (window.__FLASH && window.__FLASH.op > fl) { fl = window.__FLASH.op; flc = window.__FLASH.col || flc; }
    window.__FLASH = null;
    const flEl = document.getElementById('flash'); flEl.style.opacity = 0;
    {
      let rig = JSON.parse(JSON.stringify(rigT || DEFAULT_RIG));
      rig.flash = { op: +fl.toFixed(4), col: flc };
      // motion blur: the transition's move plus the visible shot's own camera move (moved with its layer's scale)
      const mb = { ...mbT };
      for (const [kk, f] of visK) { const m = window.__MBk[kk]; if (m) { mb.dx += (m.dx || 0) * (f.s || 1); mb.dy += (m.dy || 0) * (f.s || 1); if (Math.abs(m.z || 0) > Math.abs(mb.z)) { mb.z = m.z; mb.cx = m.cx ?? 540; mb.cy = m.cy ?? 960; } } }
      rig.mb = mb;
      if (window.__CA) { rig.ca = Math.max(rig.ca || 0, window.__CA); window.__CA = 0; }
      window.LIGHTS = rig;
    }

    const lab = shots[k].label && (shots[k].label[v] || shots[k].label.all);
    let cap = '';
    if (captions === 'word') {
      // one word on screen at a time; it appears on the spoken word with a tiny settle (no bounce) and stays
      // until the next word, or at most 1.2 s through long pauses
      let i = -1; for (let j = 0; j < words.length; j++) if (t >= words[j][0]) i = j;
      if (i >= 0) {
        const [t0, text, key, end] = words[i];
        const until = Math.min(words[i + 1] ? words[i + 1][0] : Infinity, end ?? t0 + 1.2 + (words[i + 1] ? 0 : .3));
        if (t < until) {
          const hi = key ?? autoKey(text), p = easeOut(seg(t, t0, t0 + .07));
          cap = `<div class="capWord${hi ? ' key' : ''}" style="transform:scale(${.9 + .1 * p})">${escHTML(text)}</div>`;
        }
      }
    } else if (captions === 'phrase') {
      const p = [...phrases].reverse().find(p => t >= p[0]);
      if (p) cap = `<div class="capPhrase" style="opacity:${easeOut(seg(t, p[0], p[0] + .1))}">${p[1]}</div>`;
    }
    document.getElementById('text').innerHTML = cap +
      (lab && t >= lab[3] ? `<div class="label" style="left:${lab[1]}px;top:${lab[2]}px;opacity:${easeOut(seg(t, lab[3], lab[3] + .15))}">${lab[0]}</div>` : '');
  }
  window.FPS = fps; window.DURATION = duration; window.render = render; window.beat = beat;
  return { render, beat };
}

// Static pose for character sheets / style frames (no timeline needed).
function showStill(svgBody, captionHTML = '') {
  document.getElementById('L1').style.display = 'none';
  const L2 = document.getElementById('L2');
  L2.style.display = 'block'; L2.style.filter = 'none'; L2.style.transform = ''; L2.style.opacity = 1;
  L2.innerHTML = sharedDefs() + svgBody + `<radialGradient id="vig" cx=".5" cy=".45" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".38"/></radialGradient><rect width="1080" height="1920" fill="url(#vig)"/>`;
  document.getElementById('text').innerHTML = captionHTML;
}
