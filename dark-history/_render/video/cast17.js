// The cast of "The Pied Piper" (shadow-theatre version): every silhouette has to read from its outline alone.
// The Piper: very tall and thin, a peaked cap with an up-turned back brim and a long swaying feather, long hair, a pointed
// beard, a dagged coat to the knee in stained glass, hose and long pointed shoes, the pipe at his lips with fingers that
// lift. The children: six different outlines (braids, cap, hood with a long tail, curls, bowl cut, kerchief), tunics or
// dresses. Hair, feathers and braids lag behind the motion.
(function (G) {
  const SIL = G.SIL, { add, sub, rot, nrm, lerp, cl, sm, poly, blob } = SIL.util;
  const D2R = Math.PI / 180;
  const C17 = G.C17 = {};
  const sw = (t, k = 1, ph = 0) => Math.sin(t * 2.4 * k + ph);

  // ---------------------------------------------------------------- the Piper
  // a hunter's cap: a crown sitting on the skull, a sharp peak pointing forward, the back brim turned up; a long
  // feather rising off the side and sweeping back over his shoulders, its edges cut into barbs, swaying as he walks
  const piperHat = (hl, t, P, g) => {
    const w = sw(t, 1.1) * 0.1 + (g ? Math.sin(g.ph * Math.PI * 4) * 0.05 - 0.08 : 0);
    const crown = blob([hl(-0.96, -0.36), hl(-0.98, -0.85), hl(-0.55, -1.28), hl(0.15, -1.36), hl(0.72, -1.12), hl(1.02, -0.68), hl(0.6, -0.52), hl(-0.2, -0.5)]);
    const peak = poly([hl(0.55, -0.62), hl(1.05, -0.74), hl(1.62, -0.6), hl(1.1, -0.48), hl(0.6, -0.46)]);
    const brim = blob([hl(-0.5, -0.5), hl(-1.05, -0.48), hl(-1.42, -0.72), hl(-1.36, -0.92), hl(-0.98, -0.82), hl(-0.6, -0.72)]);
    const spine = [[-0.35, -1.18], [-0.9 + w * 0.5, -1.62], [-1.7 + w, -1.86], [-2.55 + w * 1.6, -1.8], [-3.3 + w * 2.2, -1.52], [-3.95 + w * 2.8, -1.08], [-4.35 + w * 3.2, -0.62]].map(([x, y]) => hl(x, y));
    const wd = [5, 11, 14, 14, 11, 7, 2].map(v => v * P.headR / 56), L = [], R = [];
    spine.forEach((p, i) => {
      const a = spine[Math.max(0, i - 1)], b = spine[Math.min(spine.length - 1, i + 1)], d = nrm(sub(b, a)), n = [-d[1], d[0]];
      L.push(add(p, n, wd[i])); R.push(add(p, n, -wd[i] * 0.8));
      // barbs: a notch between each pair of spine points on the upper edge
      if (i < spine.length - 1) { const m = add(lerp2(p, spine[i + 1], 0.5), n, (wd[i] + wd[i + 1]) * 0.25); L.push(m); }
    });
    return [crown, peak, brim, poly([...L, ...R.reverse()])];
  };
  const lerp2 = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
  const piperHair = (hl, t, P, g) => {
    const w = sw(t, 0.9, 1) * 0.08 + (g ? -0.1 : 0);
    return [blob([hl(-0.3, -0.9), hl(-0.92, -0.5), hl(-1.04 + w, 0.35), hl(-0.98 + w * 1.5, 1.2), hl(-0.78 + w * 1.5, 1.45), hl(-0.62, 0.9), hl(-0.45, 0.25)]),
      // the pointed beard under the chin
      poly([hl(0.55, 0.78), hl(0.95, 0.7), hl(0.85, 1.25), hl(0.62 + w * 0.5, 1.75), hl(0.42, 1.1)])];
  };
  // the pipe from his lips, angled down and out; both hands on it, three fingers of each lifting in turn
  const PIPE_L = 330, PIPE_A = 38 * D2R;
  const pipeAt = sk => { const m = sk.hl(1.0, 0.44), d = rot([Math.cos(PIPE_A), Math.sin(PIPE_A)], sk.tilt); return { m, d, at: k => add(m, d, PIPE_L * k) }; };
  C17.pipeAt = pipeAt;
  const pipeProp = (sk, t, play) => {
    const { m, d, at } = pipeAt(sk), n = [-d[1], d[0]];
    const out = [];
    // the shaft (narrow at the lips, widening to a flared bell) and three rings
    const end = at(1);
    out.push(poly([add(m, n, 5), add(at(0.85), n, 9), add(end, n, 17), add(add(end, d, 10), n, 19), add(add(end, d, 10), n, -19), add(end, n, -17), add(at(0.85), n, -9), add(m, n, -5)]));
    // fingers: little bumps on the top edge near each hand, lifting to the tune
    for (const [k0, ph] of [[0.36, 0], [0.64, 1.7]]) for (let j = 0; j < 3; j++) {
      // (each finger rises and settles smoothly: no snap where it leaves or meets the pipe)
      const k = k0 + j * 0.055, lift = play ? Math.sin(t * 6.5 + j * 1.05 + ph * 0.5) ** 2 * 9 : 0, p = add(at(k), n, -12 - lift);
      out.push(blob([add(p, d, -9), add(add(p, d, -4), n, -7), add(add(p, d, 5), n, -6), add(p, d, 9), add(at(k), n, -8)]));
    }
    return out;
  };
  const GLASS = ['#c2312a', '#e0a020', '#2f7a46', '#2b56a8', '#7a3a8c', '#d8642a', '#3e9aa0', '#b8a020'];
  C17.piper = (o) => {
    const play = o.play !== false;
    const arms = play ? {
      near: { hand: sk => add(pipeAt(sk).at(0.66), rot([0, 1], sk.tilt), 14), bend: 1, handDir: sk => rot([-Math.sin(PIPE_A), Math.cos(PIPE_A)], sk.tilt), fist: true },
      far: { hand: sk => add(pipeAt(sk).at(0.38), rot([0, 1], sk.tilt), 14), bend: 1, handDir: sk => rot([-Math.sin(PIPE_A), Math.cos(PIPE_A)], sk.tilt), fist: true }
    } : o.arms;
    return SIL.figure(Object.assign({ plan: 'man', face: 'long', dress: { kind: 'coat', hem: 0.56, dag: 30, flare: 1.6 }, sleeve: { len: 120, dag: 22 }, hat: piperHat, hair: piperHair,
      glass: SIL.glassPanes(17, GLASS), lean: 4, seed: 3,
      extra: sk => play ? pipeProp(sk, o.t || 0, true) : (o.pipeAtSide ? [] : []) }, o, { arms }));
  };

  // ---------------------------------------------------------------- the children
  const HAIR = {
    braids: (hl, t, P, g) => { const w = sw(t, 1.4) * 0.12 + (g ? -0.25 : 0); return [blob([hl(-0.95, 0.1), hl(-0.98, -0.6), hl(-0.4, -1.08), hl(0.4, -1.06), hl(0.86, -0.62), hl(0.7, -0.4), hl(0.1, -0.62), hl(-0.55, -0.2)]),
      blob([hl(-0.7, 0.0), hl(-0.95 + w, 0.7), hl(-0.98 + w * 1.6, 1.4), hl(-0.82 + w * 1.6, 1.5), hl(-0.72 + w, 0.75), hl(-0.5, 0.1)]), blob([hl(-0.98 + w * 1.6, 1.4), hl(-1.2 + w * 1.6, 1.62), hl(-0.95 + w * 1.6, 1.72), hl(-0.62 + w * 1.6, 1.6)])]; },
    cap: (hl, t) => [blob([hl(-1.0, -0.15), hl(-1.05, -0.72), hl(-0.4, -1.18), hl(0.5, -1.12), hl(1.05, -0.62), hl(0.95, -0.42), hl(0.1, -0.55), hl(-0.6, -0.35)]), blob([hl(0.2, -1.12), hl(0.32, -1.36), hl(0.48, -1.12)])],
    hood: (hl, t, P, g) => { const w = sw(t, 1.2) * 0.15 + (g ? -0.3 : 0); return [blob([hl(-0.6, 0.95), hl(-1.12, 0.2), hl(-1.05, -0.75), hl(-0.35, -1.25), hl(0.55, -1.18), hl(1.02, -0.6), hl(0.95, -0.25), hl(0.6, -0.45), hl(0.2, -0.3), hl(0.1, 0.6), hl(0.3, 1.0)]),
      blob([hl(-0.8, -0.9), hl(-1.6 + w, -0.6), hl(-2.3 + w * 1.6, 0.0), hl(-2.25 + w * 1.6, 0.15), hl(-1.5 + w, -0.35), hl(-0.9, -0.55)])]; },
    curls: (hl) => { const pts = []; for (let i = 0; i <= 12; i++) { const a = (150 + i * 17) * D2R, r = 1.12 + (i % 2) * 0.12; pts.push(hl(Math.cos(a) * r, Math.sin(a) * r)); } pts.push(hl(0.75, -0.35), hl(0.1, -0.5), hl(-0.7, 0.1)); return [blob(pts)]; },
    bowl: (hl) => [poly([hl(-0.95, 0.1), hl(-1.08, -0.5), hl(-0.6, -1.1), hl(0.3, -1.15), hl(0.95, -0.7), hl(1.02, -0.32), hl(0.62, -0.3), hl(0.62, -0.42), hl(0.1, -0.45), hl(-0.6, -0.1)])],
    kerchief: (hl, t, P, g) => { const w = sw(t, 1.3) * 0.1 + (g ? -0.2 : 0); return [blob([hl(-0.95, 0.15), hl(-1.05, -0.6), hl(-0.45, -1.15), hl(0.45, -1.1), hl(0.95, -0.55), hl(0.7, -0.38), hl(0.0, -0.5), hl(-0.6, 0.0)]),
      poly([hl(-0.95, -0.05), hl(-1.5 + w, 0.15), hl(-1.35 + w, 0.4), hl(-0.85, 0.2)]), poly([hl(-0.95, 0.0), hl(-1.25 + w, 0.55), hl(-1.05 + w, 0.62), hl(-0.8, 0.15)])]; }
  };
  // [hair, dress kind, hem, height scale, face, seed]
  C17.KIDS = [
    ['braids', 'dress', 0.74, 1.0, 'child', 11], ['cap', 'tunic', 0.3, 1.04, 'child', 12], ['hood', 'tunic', 0.34, 0.96, 'child', 13],
    ['curls', 'tunic', 0.3, 0.9, 'child', 14], ['kerchief', 'dress', 0.78, 1.06, 'child', 15], ['bowl', 'tunic', 0.32, 0.86, 'child', 16]
  ];
  C17.kid = (k, o) => {
    const [hair, kind, hem, hs, face, seed] = C17.KIDS[k % C17.KIDS.length];
    return SIL.figure(Object.assign({ plan: 'kid', face, hair: HAIR[hair], dress: { kind, hem, flare: kind === 'dress' ? 1.1 : 0.6 }, seed }, o, { s: (o.s || 1) * hs }));
  };
  C17.HAIR = HAIR;
})(window);
