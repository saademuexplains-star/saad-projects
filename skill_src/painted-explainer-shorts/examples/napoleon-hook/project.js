// Worked example: the approved 5.45 s hook — "Ten weird things you didn't know about Napoleon,
// and the worst one: the battle he lost to rabbits."  Clean style (variant B), 1080x1920, 30 fps.
// Study it for HOW things are timed and layered; do not copy its content into new projects.

// ---- 1. word timings from the voiceover (scripts/transcribe.py) and stressed hits (scripts/onsets.py) ----
// Caption text exactly as shown (casing + punctuation). Third value: true = yellow key word, false = white.
// Yellow is editorial: the subject, the hook words and the punchline — not every long word.
const WORDS = [
  [0.07, 'Ten', true], [0.31, 'weird', true], [0.67, 'things', false], [1.05, 'you', false], [1.17, "didn't", false], [1.48, 'know', false],
  [1.68, 'about', false], [1.90, 'Napoleon,', true], [2.55, 'and', false], [2.64, 'the', false], [2.70, 'worst', true], [3.04, 'one:', false],
  [3.40, 'the', false], [3.49, 'battle', true], [3.83, 'he', false], [4.00, 'lost', true], [4.50, 'to', false], [4.62, 'rabbits.', true, 5.45],
];
const STRONG = [0.07, 0.31, 2.03, 2.70, 3.49, 4.00, 4.62, 5.02]; // TEN, WEIRD, na-PO-leon, WORST, BATTLE, LOST, RAB-, -BITS

// ---- 2. cast & sets ----
const NAP = { hair: 'forelock', hairColor: 'brown', beard: 'stubble', hat: 'bicorne', top: 'military', coat: '#26355a', accent: '#9b2d2b',
  legs: 'breeches', foot: 'boots', armLeft: 'tucked', hands: 'gloves' };
const nap = (pose, t) => lit(person(NAP, pose));
const campProps = h => `
  <g opacity=".95"><path d="M90 ${h + 40} L230 ${h - 120} L370 ${h + 40}Z" fill="#e9e2d2"/><path d="M230 ${h - 120} L370 ${h + 40} L300 ${h + 40}Z" fill="#b7ad98"/>
  <path d="M760 ${h + 20} L880 ${h - 110} L1000 ${h + 20}Z" fill="#e9e2d2"/><path d="M880 ${h - 110} L1000 ${h + 20} L940 ${h + 20}Z" fill="#b7ad98"/>
  <rect x="520" y="${h - 330}" width="10" height="380" fill="#4a3a2a"/>
  <rect x="530" y="${h - 325}" width="62" height="120" fill="#2e4a86"/><rect x="592" y="${h - 325}" width="62" height="120" fill="#ece6d8"/><rect x="654" y="${h - 325}" width="62" height="120" fill="#a8312d"/></g>
  <g fill="#cfc6b6" opacity=".55"><circle cx="230" cy="${h - 230}" r="60"/><circle cx="260" cy="${h - 330}" r="80"/></g>`;
const camp = (h, blur = 'dof') => background({ preset: 'day', horizon: h, blur, props: campProps(h) });
const meadow = (h, blur = 'dof', preset = 'day') => background({ preset, horizon: h, blur,
  props: `<g fill="#3f5a2a"><ellipse cx="160" cy="${h + 40}" rx="230" ry="90"/><ellipse cx="900" cy="${h + 30}" rx="260" ry="100"/></g>` });

// ---- 3. a creature: same recipe as people (gradients, soft shading, fur texture), realistic eyes with a menacing glint ----
addDefs(`${radG('furG', ['#b8a28b', '#806a56', '#4a3b2f'], { cx: .4, cy: .35, r: .75 })}
  <radialGradient id="bellyG" cx=".5" cy=".4" r=".6"><stop offset="0" stop-color="#ece1d0"/><stop offset="1" stop-color="#b8a690" stop-opacity="0"/></radialGradient>
  ${linG('earIn', ['#c9958c', '#e7b4aa'], { x2: 0, y2: 1 })}`);
function rabbit({ look = 0 } = {}) {
  const eyes = [-1, 1].map(s => `
    <ellipse cx="${s * 33}" cy="-213" rx="11" ry="12" fill="#c4b09a" opacity=".6"/>
    <ellipse cx="${s * 33 + look}" cy="-213" rx="8.5" ry="9" fill="#120a06"/>
    <circle cx="${s * 33 + 2 + look}" cy="-216" r="2.4" fill="#fff" opacity=".9"/>
    <circle cx="${s * 33 - 2 + look}" cy="-210" r="2" fill="#c0391f" opacity=".85"/>
    <path d="M${s * 45} -224 L${s * 22} -219" stroke="#3a2c22" stroke-width="5" stroke-linecap="round" opacity=".6"/>`).join('');
  return `<g filter="url(#fur)">
    <path d="M-24 -230 C-50 -330 -40 -390 -18 -398 C2 -370 -2 -300 -6 -230Z" fill="url(#furG)"/>
    <path d="M24 -230 C52 -325 60 -385 40 -396 C20 -372 12 -300 8 -230Z" fill="url(#furG)"/>
    <path d="M-95 -5 C-112 -96 -82 -170 0 -176 C82 -170 112 -96 95 -5Z" fill="url(#furG)"/>
    <ellipse cx="0" cy="-90" rx="52" ry="66" fill="url(#bellyG)"/>
    <ellipse cx="-30" cy="-10" rx="24" ry="12" fill="#cbbba5"/><ellipse cx="30" cy="-10" rx="24" ry="12" fill="#cbbba5"/>
    <ellipse cx="0" cy="-208" rx="62" ry="54" fill="url(#furG)"/>
    <ellipse cx="-17" cy="-186" rx="22" ry="16" fill="#cdbca6"/><ellipse cx="17" cy="-186" rx="22" ry="16" fill="#cdbca6"/></g>
  <path d="M-20 -250 C-34 -320 -28 -366 -18 -376 C-8 -350 -10 -300 -12 -250Z" fill="url(#earIn)" opacity=".8" filter="url(#soft2)"/>
  <path d="M20 -250 C36 -318 42 -360 36 -372 C24 -350 18 -300 14 -250Z" fill="url(#earIn)" opacity=".8" filter="url(#soft2)"/>
  <ellipse cx="40" cy="-110" rx="40" ry="70" fill="#2a1f18" opacity=".35" filter="url(#soft)"/>
  <path d="M-7 -200 L7 -200 L0 -192Z" fill="#9a5b56"/>
  <path d="M0 -192 L0 -184 M-7 -179 Q0 -184 7 -179" stroke="#3a2a22" stroke-width="2.5" fill="none"/>
  <rect x="-5" y="-182" width="10" height="9" rx="2" fill="#efe5cf" opacity=".9"/>
  <path d="M-22 -188 L-62 -194 M-22 -184 L-60 -180 M22 -188 L62 -194 M22 -184 L60 -180" stroke="#efe5cf" stroke-width="1.6" opacity=".7"/>
  ${eyes}`;
}
const RABBITS = [[450, 1640, .7, 2], [640, 1650, .72, 2], [150, 1700, .9, 2], [900, 1690, .85, 2],
  [330, 1820, 1.15, 1], [740, 1830, 1.2, 1], [70, 1990, 1.45, 1], [1010, 1980, 1.4, 1], [540, 1990, 1.6, 1]];

let TL; // set below; shots use TL.beat for the per-word camera kick
const B = t => TL.beat(t);

// ---- 4. shots: every action lands on a word or a stressed syllable ----
const SHOTS = [
  { at: 0, // "Ten weird things you didn't know about" — hook: whip-out from the face, brow pop on "weird",
           // a rabbit peeks up from the bottom edge on "things" (teases the payoff — no on-screen numbers), lean-in on "you didn't know"
    css: t => t < .32 ? `blur(${9 * (1 - easeOut(seg(t, 0, .32)))}px)` : '',
    draw(v, t) {
      const weird = backOut(seg(t, .31, .45)) * (1 - easeInOut(seg(t, .95, 1.15)));
      const lean = easeOut(seg(t, 1.05, 1.35));
      const s = lerp(2.4, 1, easeOut(seg(t, 0, .4))) + .02 * t + B(t) - .03 * bell(t, 1.68, 1.86);
      return `<g transform="${cam({ cx: 540, cy: 830, s })}">${camp(1130)}
        <ellipse cx="600" cy="2440" rx="330" ry="40" fill="#000" opacity=".3" filter="url(#soft)"/>
        <g transform="translate(540 830) scale(${1 + .1 * lean}) translate(-540 -830)">
        <g transform="translate(540 2440) scale(1.5)"><g transform="${breathe(t)}">${nap({
          tilt: Math.sin(t * 1.6) * 1.2 + 7 * weird, browR: 14 * weird + 6 * lean, browL: 6 * lean, lid: blinkAt(t, [1.58]), smirk: 1 + .5 * lean }, t)}</g></g></g></g>
        <g transform="translate(905 ${2400 - 590 * backOut(seg(t, .67, .82)) * (1 - easeIn(seg(t, 1.0, 1.15)))}) scale(.95)">${rabbit({ look: -4 })}</g>`;
    } },
  { at: 1.90, // "Napoleon" — smug close-up, the hit lands on the stressed "PO" (2.03)
    draw(v, t) {
      const proud = backOut(seg(t, 2.0, 2.2));
      return `<g transform="${cam({ cx: 540, cy: 625, s: 1 + .05 * Math.max(0, t - 1.9) + B(t), r: -2 * seg(t, 1.9, 2.6) })}">${camp(1350, 'dofHeavy')}
        <g transform="translate(540 3420) scale(2.6)"><g transform="${breathe(t)}">${nap({
          lid: .55 * easeOut(seg(t, 1.98, 2.12)), smirk: 1 + .6 * proud, browR: 10 * easeOut(seg(t, 2.03, 2.15)), tilt: -2 - 5 * proud }, t)}</g></g></g>`;
    },
    label: { B: ['Napoléon Bonaparte', 60, 1440, 2.05] } },
  { at: 2.55, // "and the worst one:" — darker, tilted, slow dramatic dolly; eyes dart on "one"
    draw(v, t) {
      const look = -2 + 7 * easeOut(seg(t, 3.04, 3.12)) - 5 * easeOut(seg(t, 3.24, 3.32));
      return `<g transform="${cam({ cx: 560, cy: 540, s: 1 + .2 * easeInOut(seg(t, 2.70, 3.38)) + B(t) })}"><g transform="rotate(-6 540 960)">
        ${meadow(1500, 'dofHeavy', 'dusk')}
        <g transform="translate(560 3550) scale(2.8)"><g transform="${breathe(t)}">${nap({
          lid: .35 + .2 * easeOut(seg(t, 2.7, 2.85)), look, browL: 12 * easeOut(seg(t, 2.70, 2.85)), tilt: Math.sin(t * 1.6) * 1.2 }, t)}</g></g></g></g>
        <rect width="1080" height="1920" fill="#0a0612" opacity="${.3 * easeOut(seg(t, 2.7, 3.3))}"/>`;
    } },
  { at: 3.40, // "the battle he" — the rabbit pops up on "battle", Napoleon clocks it
    draw(v, t) {
      const r = backOut(seg(t, 3.49, 3.66)), eye = t > 3.60 && t < 3.83;
      const s = 1 + .04 * Math.max(0, t - 3.4) + B(t) + .06 * easeIn(seg(t, 3.83, 4.0));
      return `<g transform="${cam({ cx: 640, cy: 1300, s, x: -50 * easeInOut(seg(t, 3.5, 3.9)) })}">${meadow(1060)}
        <ellipse cx="480" cy="1890" rx="280" ry="34" fill="#000" opacity=".3" filter="url(#soft)"/>
        <g transform="translate(430 1890) scale(1.15)"><g transform="${breathe(t)}">${nap({
          look: eye ? 5 : 0, lookY: eye ? 4 : 0, browR: 8 * easeOut(seg(t, 3.62, 3.72)), tilt: (eye ? 4 : 0) + Math.sin(t * 1.6) }, t)}</g></g>
        <clipPath id="grassLine"><rect x="600" y="0" width="480" height="1893"/></clipPath>
        <ellipse cx="880" cy="1885" rx="${110 * r}" ry="18" fill="#000" opacity=".3" filter="url(#soft)"/>
        <g clip-path="url(#grassLine)"><g transform="translate(870 ${1880 + (1 - r) * 260}) scale(.62)">${rabbit()}</g></g></g>`;
    },
    label: { all: ['July 1807', 60, 330, 3.49] } },
  { at: 4.00, // "lost to" — impact: head jolt, crash zoom, sweat
    draw(v, t) {
      const [x, y] = shakeXY(t, [[4.0, 20, .4]]);
      return `<g transform="${cam({ cx: 540, cy: 625, s: 1 + .22 * easeOut(seg(t, 4.0, 4.48)) + B(t) - .03 * bell(t, 4.48, 4.62), x, y })}">${meadow(1350, 'dofHeavy', 'dusk')}
        <g transform="translate(540 3420) scale(2.6)"><g transform="${breathe(t)}">${nap({
          shock: 1, sweat: t > 4.08 ? 1 : 0, sweatY: easeOut(seg(t, 4.08, 4.6)) * 24, browL: 6, browR: 6,
          tilt: Math.sin((t - 4) * 32) * 9 * decay(t, 4.0, .14) }, t)}</g></g></g>`;
    } },
  { at: 4.62, // "rabbits" — two waves on RAB- and -BITS
    draw(v, t) {
      const [x, y] = shakeXY(t, [[4.62, 16, .35], [5.02, 12, .3]]);
      return `<g transform="${cam({ cx: 540, cy: 1300, s: 1 + .03 * Math.max(0, t - 4.62) + B(t), x, y })}">${meadow(1020, 'dof', 'dusk')}
        <g transform="translate(540 1420) scale(.78)"><g transform="${breathe(t)}">${nap({
          shock: 1, sweat: 1, raiseRight: 125 * backOut(seg(t, 4.62, 4.84)) - (t > 4.84 ? Math.sin(t * 24) * 6 : 0), tilt: Math.sin(t * 40) * 1.5 }, t)}</g></g>
        ${RABBITS.map(([rx, ry, sc, wave], i) => {
          const t0 = (wave === 1 ? 4.62 : 5.02) + (i % 4) * .03, p = backOut(seg(t, t0, t0 + .2));
          const hop = t > t0 + .2 ? Math.abs(Math.sin((t - t0) * 10 + i)) * 28 * sc : 0;
          return `<g transform="translate(${rx} ${ry + (1 - p) * 480 - hop}) scale(${sc * (i % 2 ? -1 : 1)} ${sc})">${rabbit({ look: (i % 3) - 1 })}</g>`;
        }).join('')}</g>`;
    } },
];
// ---- 5. dissolves: a different one for each cut, all short (0.1–0.2 s) to keep the hook fast ----
const TRANS = [[1.90, 1.78, 1.97, 'zoom'], [2.55, 2.43, 2.62, 'dim'], [3.40, 3.29, 3.46, 'pull'], [4.00, 3.95, 4.03, 'flash'], [4.62, 4.54, 4.66, 'whip']];

TL = makeTimeline({ shots: SHOTS, trans: TRANS, words: WORDS, strong: STRONG, captions: 'word', fps: 30, duration: 5.45 });
render(0);
