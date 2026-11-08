// Shot helpers for rig3 scenes (from the Coca-Cola look test on): light a figure framed from the waist up from its
// chest, redraw arms over a table or counter, light a detached hand drawn over a held thing, place a grip exactly,
// hold a still pose, cut a figure off behind a counter or bench. Load after cine.js; uses G.ENG at call time.
(function (G) {
  const ST = {};
  const nrm = v => { const n = Math.hypot(v[0], v[1]) || 1; return [v[0] / n, v[1] / n]; };
  ST.nrm = nrm;
  const V = () => ({ view: G.ENG.viewRect(1) });
  // C.lit puts the key light level with the middle of the WHOLE body. For a figure framed from the waist up that point
  // is below the frame, and the shoulders fell into a dark fade (it read as smudged, see-through clothes). up(P, o)
  // centres the figure's light on its chest; lit, armsOver and handsLit all use it.
  ST.infoOf = P => P.chest ? Object.assign({}, P.info, { cy: P.chest }) : P.info;
  ST.up = (P, o) => { P.chest = o.y - 1000 * o.s; return P; };
  ST.lit = (P, L) => { const r = G.CINE.lit(Object.assign({}, P, { info: ST.infoOf(P) }), Object.assign(V(), L)); return r.cast + r.body; };
  ST.armsOver = (P, L, which = 'RL') => G.CINE.lit({ svg: (which.includes('R') ? P.armRsvg : '') + (which.includes('L') ? P.armLsvg : ''), info: ST.infoOf(P) }, Object.assign(V(), L)).body;
  ST.handsLit = (P, L, which = 'RL') => G.CINE.lit({ svg: (which.includes('R') ? P.handR || '' : '') + (which.includes('L') ? P.handL || '' : ''), info: ST.infoOf(P) }, Object.assign(V(), L)).body;
  // an arm whose grip slot sits exactly on world point Gw, the fingers along world direction dW (hand = rig hand size)
  ST.gripAt = (o, hand, Gw, dW, extra = {}) => { const R = G.RIG, dl = nrm(R.dirLocal(o, dW)), gl = R.toLocal(o, Gw), gy = R.gripSlot ? R.gripSlot(hand) : 0.33 * hand; return Object.assign({ hand: [gl[0] - dl[0] * gy, gl[1] - dl[1] * gy], dir: dl, pose: 'grip', facing: 'back' }, extra); };
  // the finger direction that lays the thumb along a world axis (a rod through the fist runs along the thumb)
  ST.fingersFor = (side, facing, thumb) => { const t = (side === 'R' ? -1 : 1) * (facing === 'palm' ? 1 : -1); return [-thumb[1] * t, thumb[0] * t]; };
  // a pose held still (no blink, a set breath)
  ST.still = (x, y, s, extra = {}) => Object.assign({ x, y, s, blink: 0, breath: 0.3, sway: 0 }, extra);
  // cut a drawing off below a horizontal line (behind a counter or a bench)
  ST.clipTop = (id, y, svg) => `<defs><clipPath id="${id}"><rect x="-2000" y="-2000" width="6000" height="${y + 2000}"/></clipPath></defs><g clip-path="url(#${id})">${svg}</g>`;
  G.STAGE = ST;
})(window);
