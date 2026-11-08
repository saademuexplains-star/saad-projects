// "The Pied Piper" (third cut), the hook, in shadow theatre (sil.js / cast17.js / sets20.js): frame 0 is close on a
// stranger's silhouette in the glowing arch of the town gate, the low sun right behind his head, the pipe at his lips
// and his fingers lifting; the camera draws back and rises as he steps out of the arch into the street (his coat a
// window of coloured glass, the town and its smoke coming up behind him), then closes on the pipe again.
// "On a summer morning, a stranger in a coat of many colours walks into your town playing a strange tune on a pipe,"
(function (G) {
  const X = G.ENG, S = G.SETS, C = G.CINE, C17 = G.C17, R = G.RIG, SH = G.SH;
  const { track: TK, ss, lerp } = X, { f } = R;
  const TW = S.TW, PS = 0.62, V = 230;
  // hand-held drift on a 2D camera; a character layer put in just after the layer tagged `tag`
  const hh = (c, t, amp = 1, seed = 0) => { const h = X.hand(t, amp, seed); return (X.CAM = [c[0] + h[0], c[1] + h[1], c[2], (c[3] || 0) + h[2]]); };
  const insertAt = (set, chars, tag, p = 1) => { let i = set.findIndex(L => L.tag === tag); i = i < 0 ? set.findIndex(L => L.light || L.p > 1.05) : i + 1; const c = { p, svg: chars, chars: true }; return i < 0 ? [...set, c] : [...set.slice(0, i), c, ...set.slice(i)]; };
  // he walks left to right through the gate: in the arch at frame 0, out on the street by 2 s
  const px = t => TW.GATE - 20 + V * t;
  const GAIT = { stride: 560, beta: 0.6, lift: 70, bob: 26, kind: 'walk' };
  const RIM = { dx: 3, dy: -2.5, col: '#ffd7a0', op: 0.9 };
  // the camera: [offset from him in x, centre height, zoom] and how far everything behind the gate sits lowered (a low
  // camera looking up at him: only sky and the sun behind his head; as it rises and draws back the town comes up)
  // (smooth splines through the keys, so the move flows on through each one instead of pausing at it)
  const OFF = SH.spline([[-1.0, [40, 1158, 6.4]], [0.0, [42, 1160, 6.2]], [0.9, [36, 1172, 5.0]], [2.9, [10, 1330, 1.7]], [3.9, [-20, 1360, 1.32]], [5.6, [92, 1270, 3.0]], [6.35, [104, 1262, 3.5]]]);
  const LOWs = SH.spline([[-1.0, [1500]], [0.9, [1450]], [2.7, [0], 'stop'], [3.9, [0], 'stop'], [5.6, [420]], [6.35, [520]]]), LOW = t => LOWs(t)[0];
  const cam = t => { const o = OFF(t); return [px(t) + o[0], o[1], o[2], 0]; };
  // the low sun: a disc just behind his hat at frame 0, so it rims his head and the peak of his cap (it stays put on
  // the screen as the camera moves, the way a sun does, and the town rises up under it)
  const SUN = [471, 678], SP = 0.05;
  SH.hookSun = t => { const c = cam(t), zp = Math.pow(c[2], SP); return [540 + (SUN[0] - (540 + (c[0] - 540) * SP)) * zp, 960 + (SUN[1] - (960 + (c[1] - 960) * SP)) * zp]; };
  const sunLayer = () => `<defs><radialGradient id="hksun" gradientUnits="userSpaceOnUse" cx="${SUN[0]}" cy="${SUN[1]}" r="360"><stop offset="0.3" stop-color="#ffe8c0" stop-opacity="0.75"/><stop offset="0.55" stop-color="#ffcf98" stop-opacity="0.28"/><stop offset="1" stop-color="#ffb070" stop-opacity="0"/></radialGradient></defs>` +
    `<circle cx="${SUN[0]}" cy="${SUN[1]}" r="360" fill="url(#hksun)"/><circle cx="${SUN[0]}" cy="${SUN[1]}" r="118" fill="#fff4d8"/><circle cx="${SUN[0]}" cy="${SUN[1]}" r="134" fill="#fff0cc" opacity="0.4"/>`;
  const fn = t => {
    const c = hh(cam(t), t, 0.25, 5), lo = LOW(t);
    const set = S.silTown(t);
    // everything behind the gate drops together (screen px), then the sun goes in over the sky and he goes on the street
    for (const L of set) if (L.p < 1 && !L.chars) { const zp = Math.pow(c[2], L.p); L.svg = `<g transform="translate(0,${f(lo / zp)})">${L.svg}</g>`; }
    set.splice(1, 0, { p: SP, svg: sunLayer() });
    const x = px(t), pp = C17.piper({ x, y: TW.FY, s: PS, d: Math.max(0, x - (TW.GATE - 600)) / PS + 40, gait: GAIT, t, rim: RIM });
    return X.compose(insertAt(set, pp.svg, 'street'), c) + C.vignette(0.5);
  };
  X.shot('HOOK', -1.0, 6.35, fn);
  SH.cam2d = SH.cam2d || {}; SH.cam2d.HOOK = cam;
})(window);
