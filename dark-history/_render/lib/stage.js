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
  // Prefer ST.behind to armsOver. Furniture drawn after a lit figure (a quilt over the lap, a basin, a counter) that the
  // figure's forearms and hands must stay in front of is masked out wherever those forearms and hands are, so they keep
  // the body's own light pass. (armsOver relights the arms on their own: the rim then runs round each arm's own outline,
  // the inner edge against the body too, and the arms read as cut-out pieces laid on top - the user, 2026-11-08:
  // "they look like cutted pngs".) The mask is the arms' exact silhouette (alpha sharpened so soft shadows leave no
  // ghost), so the furniture meets the arm's ink outline cleanly.
  ST.behind = (P, id, svg, which = 'RL') => {
    const arms = (which.includes('R') ? P.armRsvg : '') + (which.includes('L') ? P.armLsvg : '');
    const E = P.info && P.info.ext, m = 120, [x0, y0, x1, y1] = E ? [E[0] - m, E[1] - m, E[2] + m, E[3] + m] : [-1500, -1500, 4000, 4000];
    const R = `x="${Math.round(x0)}" y="${Math.round(y0)}" width="${Math.round(x1 - x0)}" height="${Math.round(y1 - y0)}"`;
    // (window.DBG_BEHIND = true: also paint the mask's silhouette red over the frame)
    const dbg = G.DBG_BEHIND ? `<defs><filter id="${id}d" filterUnits="userSpaceOnUse" ${R} color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 0  0 0 0 0 0  0 0 0 3 -1"/></filter></defs><g filter="url(#${id}d)" opacity="0.5">${arms}</g>` : '';
    return `<defs><filter id="${id}k" filterUnits="userSpaceOnUse" ${R} color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 3 -1"/></filter>` +
      `<mask id="${id}" maskUnits="userSpaceOnUse" x="-1500" y="-1500" width="5500" height="5500"><rect x="-1500" y="-1500" width="5500" height="5500" fill="#fff"/><g filter="url(#${id}k)">${arms}</g></mask></defs><g mask="url(#${id})">${svg}</g>` + dbg;
  };
  // a figure lit together with what it holds (a prop drawn over the body, the detached hand over the prop) in ONE pass:
  // rims only on the outer outline of the whole group. ext [x0, y0, x1, y1] widens the light's box for a prop that
  // reaches past the body (the box clips, and a prop cut at its edge seems to shake)
  ST.litWith = (P, L, svg, ext) => {
    const I = ST.infoOf(P), E0 = I.ext;
    const ext2 = ext ? (E0 ? [Math.min(E0[0], ext[0]), Math.min(E0[1], ext[1]), Math.max(E0[2], ext[2]), Math.max(E0[3], ext[3])] : ext) : E0;
    const r = G.CINE.lit({ svg, info: Object.assign({}, I, { ext: ext2 }) }, Object.assign(V(), L));
    return r.cast + r.body;
  };
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
