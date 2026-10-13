// War of the Bucket (1325) — style frame, painted look from the painted-explainer-shorts skill.
// Beat shown: "…soldiers stole a bucket."  The Modena soldier walks off with the bucket while the Bologna guard sleeps.

// ---- cast ----
const THIEF = { skin: 'light', hair: 'short', hairColor: 'brown', beard: 'stubble', hat: 'feathercap', hatColor: '#2f6b46', top: 'vest',
  coat: '#3f6a45', under: '#e6dcbf', legs: 'breeches', pants: '#8a6a3f', foot: 'shoes', eyeColor: '#5a3d22', id: 'th' };
const GUARD = { skin: 'light', hair: 'short', hairColor: 'brown', beard: 'mustache', hat: 'kettle', hatColor: '#8d98a5', top: 'jacket',
  coat: '#b3322f', under: '#efe8d8', legs: 'trousers', pants: '#3f4a63', foot: 'shoes', eyeColor: '#3d5a80', id: 'gd' };

// ---- the hero prop: an oak bucket, painted like the characters (gradients, rim shading, no outlines) ----
addDefs(`${linG('bkW', ['#e8b772', '#c68c47', '#8d5c2b', '#5e3a1b'])}${linG('bkI', ['#dde2e7', '#8a949e', '#40474f'])}
  <radialGradient id="bkIn" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#6a4426"/><stop offset="1" stop-color="#2a170a"/></radialGradient>`);
function bucket(s = 1, rot = 0) {
  return `<g transform="scale(${s}) rotate(${rot})">
    <path d="M-104 -2 C-106 -150 106 -150 104 -2" stroke="#2b2f36" stroke-width="15" fill="none" stroke-linecap="round" opacity=".55" transform="translate(5 5)" filter="url(#soft2)"/>
    <path d="M-104 -2 C-106 -150 106 -150 104 -2" stroke="url(#bkI)" stroke-width="12" fill="none" stroke-linecap="round"/>
    <path d="M-92 -40 C-80 -112 -40 -138 -8 -142" stroke="#fff" stroke-width="4" fill="none" opacity=".55" stroke-linecap="round" filter="url(#soft2)"/>
    <path d="M-108 0 L-82 175 Q0 205 82 175 L108 0 Q0 30 -108 0 Z" fill="url(#bkW)" filter="url(#pcl)"/>
    <g fill="none" stroke="#3b2210" stroke-opacity=".35" stroke-width="3" filter="url(#soft2)">${[-3, -2, -1, 0, 1, 2, 3].map(i => `<path d="M${i * 27} 10 Q${i * 25} 90 ${i * 21} 168"/>`).join('')}</g>
    <path d="M-100 34 Q0 66 100 34 L96 56 Q0 90 -96 56 Z" fill="url(#bkI)" filter="url(#pcsl)"/>
    <path d="M-88 124 Q0 156 88 124 L84 146 Q0 180 -84 146 Z" fill="url(#bkI)" filter="url(#pcsl)"/>
    <ellipse cx="0" cy="0" rx="108" ry="28" fill="#d9a258" filter="url(#pcsl)"/>
    <ellipse cx="0" cy="2" rx="94" ry="20" fill="url(#bkIn)"/>
    <ellipse cx="-24" cy="-1" rx="52" ry="6" fill="#000" opacity=".35" filter="url(#soft2)"/>
    <circle cx="-105" cy="-2" r="9" fill="url(#bkI)"/><circle cx="105" cy="-2" r="9" fill="url(#bkI)"/>
  </g>`;
}

// ---- blurred village backdrop pieces ----
const houseRow = h => [[-60, 240, 400, '#e6b46e', '#b85a3a'], [190, 260, 480, '#e58f78', '#a84a30'], [470, 210, 340, '#efe0b4', '#b85a3a'], [690, 240, 430, '#b8cf92', '#a84a30'], [930, 230, 370, '#e4a98e', '#b85a3a']]
  .map(([x, w, ht, wall, roof]) => `
    <rect x="${x}" y="${h - ht}" width="${w}" height="${ht}" fill="${wall}"/><rect x="${x + w * .62}" y="${h - ht}" width="${w * .38}" height="${ht}" fill="#000" opacity=".12"/>
    <path d="M${x - 14} ${h - ht} L${x + w / 2} ${h - ht - w * .36} L${x + w + 14} ${h - ht} Z" fill="${roof}"/>
    ${[0, 1, 2].map(r => [0, 1].map(c => `<path d="M${x + 36 + c * (w - 100)} ${h - ht + 60 + r * 110 + 56} v-46 a18 18 0 0 1 36 0 v46Z" fill="#33485e"/>`).join('')).join('')}`).join('');
const cypress = (x, h, ht) => `<path d="M${x} ${h - ht} C${x + 46} ${h - ht * .7} ${x + 50} ${h - ht * .2} ${x + 24} ${h} L${x - 24} ${h} C${x - 50} ${h - ht * .2} ${x - 46} ${h - ht * .7} ${x} ${h - ht}Z" fill="#2c5a36"/>`;
function wellSVG(s = 1) {
  return `<g transform="scale(${s})">
    <rect x="-205" y="-650" width="44" height="650" fill="#5a3b20"/><rect x="161" y="-650" width="44" height="650" fill="#4a2f18"/>
    <rect x="-220" y="-660" width="440" height="40" fill="#8a5c34"/>
    <path d="M-270 -650 L0 -820 L270 -650 Z" fill="#5d4630"/><path d="M0 -820 L270 -650 L120 -650Z" fill="#3f2e1e" opacity=".7"/>
    <rect x="-230" y="-250" width="460" height="250" rx="36" fill="#cfc7b3"/><rect x="40" y="-250" width="190" height="250" rx="36" fill="#000" opacity=".16"/>
    <ellipse cx="0" cy="-250" rx="230" ry="52" fill="#b9b19c"/><ellipse cx="0" cy="-248" rx="190" ry="36" fill="#1d2a38"/>
    <path d="M0 -600 L2 -420 L-6 -380 L6 -352" stroke="#c9a766" stroke-width="9" fill="none" stroke-linecap="round"/>
  </g>`;
}
const spear = (x, y, len) => `<rect x="${x - 6}" y="${y - len}" width="12" height="${len}" fill="#6b4a2b"/><path d="M${x} ${y - len - 90} C${x + 20} ${y - len - 50} ${x + 18} ${y - len - 14} ${x + 8} ${y - len}L${x - 8} ${y - len} C${x - 18} ${y - len - 14} ${x - 20} ${y - len - 50} ${x} ${y - len - 90}Z" fill="#aeb8c2"/>`;

function village(preset = 'day', blur = 'dof') {
  const h = 1180;
  return background({ preset, horizon: h, blur, trees: true, grassOp: .22, overrides: { ground: ['#d8c28f', '#b99d66', '#8d7747'] },
    props: `${houseRow(h + 6)}${cypress(70, h + 14, 330)}${cypress(1010, h + 14, 300)}
      <g transform="translate(905 ${h + 96})">${wellSVG(.66)}</g>
      <g>${spear(290, h + 130, 880)}<ellipse cx="190" cy="${h + 136}" rx="200" ry="24" fill="#000" opacity=".28" filter="url(#soft)"/>
      <g transform="translate(190 ${h + 134}) scale(.7)"><g>${lit(person(GUARD, { lid: 2, tilt: 7, talk: .35, browL: 3, browR: 3 }))}</g></g></g>` });
}

// ---- the style frame: "stole a bucket." ----
const HERO_X = 548, HERO_Y = 1800, HERO_S = 1.12;
function heroFrame() {
  const pose = { lid: .28, look: -6, smirk: 1.5, browR: 12, browL: -3, tilt: -5, raiseLeft: 26 };
  // the left fist (screen-left) hangs near local (-344,-654) when raised 26–30°; the bucket handle runs through it
  const hx = HERO_X - HERO_S * 336, hy = HERO_Y - HERO_S * 668;
  return village(window.PRESET || 'day') + `
    <g transform="translate(${hx} ${hy + 150 * .95}) scale(.95)">${bucket(1, -2)}</g>
    ${placePerson(HERO_X, HERO_Y, HERO_S, THIEF, pose, 0.4)}`;
}

window.STILLS = {
  hero: () => showStill(heroFrame(), `<div class="capWord key">bucket.</div><div class="label" style="left:60px;top:330px">Italy, 1325</div>`),
};
