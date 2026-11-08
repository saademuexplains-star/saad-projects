// "The King's Decoy" part 2 props: the royal coach (side view, facing +x) with its pair of greys, coachman and the
// passenger seen through the door window; the mounted rider; arrows; spoked wheels.
(function (G) {
  const P = G.PROPS, R = G.RIG, { f, shade, mix, rng, uid } = R;
  const { rot, add, sub, len, nrm, perp } = P.V2;
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t;
  const pt = p => `${f(p[0])},${f(p[1])}`;
  const OUTC = '#140c06';
  const ol = (w = 3, op = 0.85) => `stroke="${OUTC}" stroke-width="${w}" stroke-opacity="${op}" stroke-linejoin="round"`;
  const GOLD = '#c9a040', GOLDL = '#f0d890', GOLDD = '#6a4a14';

  // ---------------- a spoked carriage wheel: iron tyre, painted felloe, spokes, gilded hub (local units)
  P.wheel = (cx, cy, r, ang, o = {}) => {
    const n = o.n || 14, wood = o.wood || '#7a1a1a', id = uid('wh');
    let g = `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="none" stroke="#141214" stroke-width="${f(r * 0.07)}"/>`;
    g += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 0.9)}" fill="none" stroke="${wood}" stroke-width="${f(r * 0.1)}"/><circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 0.85)}" fill="none" stroke="${GOLD}" stroke-width="${f(r * 0.012)}"/>`;
    for (let i = 0; i < n; i++) {
      const a = ang + i * 360 / n, d = rot([0, -1], a), nn = perp(d), h0 = add([cx, cy], d, r * 0.16), h1 = add([cx, cy], d, r * 0.86);
      g += `<path d="M${pt(add(h0, nn, r * 0.03))} L${pt(add(h1, nn, r * 0.018))} L${pt(add(h1, nn, -r * 0.018))} L${pt(add(h0, nn, -r * 0.03))}Z" fill="${wood}" stroke="#2a0a0a" stroke-width="${f(r * 0.006)}"/>`;
      g += `<path d="M${pt(add(h0, d, r * 0.04))} L${pt(add(h1, d, -r * 0.06))}" stroke="${GOLD}" stroke-width="${f(r * 0.006)}" opacity="0.7"/>`;
    }
    g += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 0.17)}" fill="${GOLD}" ${ol(2.4)}/><circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 0.1)}" fill="${GOLDD}"/><circle cx="${f(cx - r * 0.04)}" cy="${f(cy - r * 0.05)}" r="${f(r * 0.04)}" fill="${GOLDL}" opacity="0.8"/>`;
    // the tyre's highlight and the dust thrown off the rim
    g += `<path d="M${pt(add([cx, cy], rot([0, -1], -60), r))} A${f(r)},${f(r)} 0 0 1 ${pt(add([cx, cy], rot([0, -1], 20), r))}" stroke="#8a8a90" stroke-width="${f(r * 0.02)}" fill="none" opacity="0.5"/>`;
    return g;
  };

  // ---------------- an arrow stuck in a surface: tip buried at (x,y), shaft out at angle ang (deg, 0 = +x), length L
  P.arrowStuck = (x, y, ang, L, o = {}) => {
    const d = rot([1, 0], ang), n = perp(d), e = add([x, y], d, L), q = o.quiver || 0, wob = q * Math.sin((o.t || 0) * 40) * Math.exp(-(o.dt || 0) * 6) * 6;
    const e2 = add(e, n, wob);
    let g = `<path d="M${x},${y} L${pt(e2)}" stroke="#2a1a0e" stroke-width="${o.w || 13}" stroke-linecap="round"/><path d="M${x},${y} L${pt(e2)}" stroke="#a8804a" stroke-width="${(o.w || 13) * 0.55}" stroke-linecap="round"/>`;
    const fd = nrm(sub(e2, [x, y])), fn = perp(fd), f0 = add(e2, fd, -L * 0.22);
    for (const s of [1, -1]) g += `<path d="M${pt(f0)} L${pt(e2)} L${pt(add(add(e2, fd, 14), fn, s * 36))} L${pt(add(add(f0, fd, -6), fn, s * 30))}Z" fill="${o.fletch || '#e8e2d4'}" stroke="#5a5048" stroke-width="2"/>`;
    // splinters round the hole
    for (let i = 0; i < 6; i++) { const a = i * 60 + 17, sp = add([x, y], rot([1, 0], a), 14); g += `<path d="M${x},${y} L${pt(sp)}" stroke="#d8b888" stroke-width="3" opacity="0.8"/>`; }
    return `<circle cx="${x}" cy="${y}" r="12" fill="#0a0604" opacity="0.7"/>` + g;
  };
  // a flying arrow (screen-aligned): tip at p, direction d
  P.arrowFly = (p, d, L = 300, w = 10) => { const e = add(p, nrm(d), -L), fd = nrm(d), fn = perp(fd); let g = `<path d="M${pt(p)} L${pt(e)}" stroke="#2a1a0e" stroke-width="${w}" stroke-linecap="round"/><path d="M${pt(p)} L${pt(add(p, fd, -18))}" stroke="#8a8a90" stroke-width="${w * 1.8}"/>`; for (const s of [1, -1]) g += `<path d="M${pt(add(e, fd, 50))} L${pt(e)} L${pt(add(add(e, fd, -4), fn, s * 22))}Z" fill="#e8e2d4"/>`; return g; };

  // ======================================================= the royal coach (local units, origin on the ground under
  // the door; +x forward). o: x, y, s, t, run {x, c, g} (distance travelled drives the wheels and the horses), sway,
  // passenger(cl) -> svg drawn inside the door window (cl = clip id), lean 0..1 (the window opens wider for a lean-out),
  // driver(svg fn), arrows [[x,y,ang,L,quiver,dt]], glass 0..1, horses: { far, near } overrides, farLight (far window colour)
  const RW = [-760, -540], RR = 540, FW = [830, -410], FR = 410;
  const WIN = [-210, -1930, 190, -1500];   // door window x0, y0, x1, y1
  const BOX = [700, -1660], SEAT = -1180;
  P.COACH = { RW, RR, FW, FR, WIN, BOX, SEAT, HORSE: 2420, HORSE_FAR: [2500, -46], HS: 1.12 };
  P.coach = (o) => {
    const t = o.t || 0, run = o.run || { x: 0, c: 0, g: P.GAIT.stand }, s = o.s || 1, id = uid('co');
    const roll = run.x * 180 / Math.PI;
    // the body rocks on its braces with the horses' stride
    const rock = 0.7 * Math.sin(2 * Math.PI * run.c * 2) * clamp(run.g.S / 380) + (o.sway || 0), bob = 6 * Math.cos(2 * Math.PI * run.c * 2) * clamp(run.g.S / 380);
    const bodyTr = `translate(0,${f(bob)}) rotate(${f(rock)} -100 -880)`;
    let g = `<defs><linearGradient id="${id}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2430"/><stop offset="0.5" stop-color="#16121a"/><stop offset="1" stop-color="#0a080c"/></linearGradient>` +
      `<linearGradient id="${id}p" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a1a26"/><stop offset="1" stop-color="#4a0a12"/></linearGradient>` +
      `<linearGradient id="${id}i" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3a0a10"/><stop offset="1" stop-color="#1a0408"/></linearGradient>` +
      `<clipPath id="${id}w"><path d="${winClip(o.lean || 0)}"/>${o.clipExtra ? `<path d="${o.clipExtra}"/>` : ''}</clipPath></defs>`;
    // ground shadow
    g += `<ellipse cx="200" cy="10" rx="2600" ry="70" fill="#000" opacity="0.3" filter="url(#b8)"/>`;
    // ---- the pair of greys: the far horse first (darker, a little up and ahead)
    const hgt = P.GAIT, hc = Object.assign({ col: '#d8d4cc', low: '#8a8680', mane: '#ece8e0', hoof: '#4a4440', tack: { bridle: true, blinkers: true, plume: '#a8182a', collar: true, harness: true, metal: GOLD, leather: '#1e1410' } }, o.horse || {});
    const HS = P.COACH.HS;
    const farH = P.horse(Object.assign({}, hc, { x: P.COACH.HORSE_FAR[0], y: P.COACH.HORSE_FAR[1], s: HS, g: run.g, c: run.c + 0.13, t, far: true, seed: 9, noShadow: true }, (o.horses || {}).far || {}));
    const nearH = P.horse(Object.assign({}, hc, { x: P.COACH.HORSE, y: 0, s: HS, g: run.g, c: run.c, t, seed: 5 }, (o.horses || {}).near || {}));
    g += farH.svg;
    // ---- the far wheels peeking behind (offset up and forward)
    g += `<g opacity="0.85">${P.wheel(RW[0] + 70, RW[1] - 40, RR, roll + 9, { n: 14, wood: '#4a1010' })}${P.wheel(FW[0] + 70, FW[1] - 40, FR, roll * RR / FR + 5, { n: 12, wood: '#4a1010' })}</g>`;
    // ---- the undercarriage: the perch (a curved beam joining the axles), the springs and leather braces
    g += `<path d="M${RW[0]},${RW[1]} C-300,-640 400,-640 ${FW[0]},${FW[1] - 20}" stroke="#4a0e10" stroke-width="54" fill="none"/><path d="M${RW[0]},${RW[1] - 18} C-300,-660 400,-660 ${FW[0]},${FW[1] - 38}" stroke="${GOLD}" stroke-width="5" fill="none"/>`;
    g += `<path d="M${RW[0] - 40},${RW[1] - 20} C-900,-900 -980,-1100 -900,-1220 C-860,-1270 -800,-1260 -800,-1210" stroke="#1a1416" stroke-width="30" fill="none"/><path d="M${RW[0] - 40},${RW[1] - 20} C-900,-900 -980,-1100 -900,-1220" stroke="${GOLD}" stroke-width="6" fill="none"/>`;
    g += `<path d="M${FW[0] + 20},${FW[1] - 30} C760,-760 720,-940 640,-1020" stroke="#1a1416" stroke-width="30" fill="none"/><path d="M${FW[0] + 20},${FW[1] - 30} C760,-760 720,-940 640,-1020" stroke="${GOLD}" stroke-width="6" fill="none"/>`;
    // the swingletree and the pole to the horses, the traces from the near horse's collar
    g += `<path d="M${FW[0]},${FW[1] - 40} L1260,-860 L${f(P.COACH.HORSE + 520 * P.COACH.HS)},${f(-960 * P.COACH.HS)}" stroke="#3a0e10" stroke-width="40" stroke-linecap="round" fill="none"/><path d="M${FW[0]},${FW[1] - 58} L1260,-878" stroke="${GOLD}" stroke-width="5"/>`;
    // ---- the body, rocking on its braces
    let b = '';
    // interior seen through the window (crimson velvet, the far window's daylight), then the passenger, clipped to the opening
    b += `<path d="${winClip(0)}" fill="url(#${id}i)"/>`;
    b += `<rect x="${WIN[0] + 40}" y="${WIN[1] + 40}" width="${WIN[2] - WIN[0] - 80}" height="${WIN[3] - WIN[1] - 90}" fill="${o.farLight || '#c8c4b8'}" opacity="0.55" filter="url(#b8)"/>`;
    for (let i = 0; i < 4; i++) b += `<circle cx="${WIN[0] + 70 + i * 90}" cy="${WIN[3] - 30}" r="7" fill="#1a0406" opacity="0.6"/>`;
    // the body shell: a bowed box, wider at the waist line, with a domed cornice
    const shell = `M-700,-860 L480,-860 C560,-866 610,-920 620,-1000 C650,-1200 652,-1500 640,-1700 C636,-1880 626,-2000 600,-2080 L-860,-2080 C-890,-2000 -905,-1880 -910,-1700 C-918,-1500 -912,-1200 -880,-1000 C-860,-920 -800,-866 -700,-860Z`;
    const hole = winClip(o.lean || 0);
    // the passenger is drawn in the window opening (behind the shell when sitting, in front of it when leaning out)
    const pass = o.passenger ? `<g clip-path="url(#${id}w)">${o.passenger()}</g>` : '';
    b += (o.lean || 0) < 0.001 ? pass : '';
    b += `<path d="${shell} ${winClip(0)}" fill="url(#${id}b)" fill-rule="evenodd" ${ol(3.2)}/>`;
    // lacquer sheen
    b += `<path d="M-860,-1700 C-870,-1400 -860,-1100 -820,-980" stroke="#fff" stroke-width="18" opacity="0.07" fill="none"/><path d="M560,-1900 C590,-1600 600,-1300 580,-1020" stroke="#fff" stroke-width="14" opacity="0.06" fill="none"/>`;
    // crimson panels with gilded mouldings: the back quarter, the door's lower panel, the front quarter
    const panel = (x0, y0, x1, y1, r = 40) => `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" rx="${r}" fill="url(#${id}p)" stroke="${GOLD}" stroke-width="12"/><rect x="${x0 + 16}" y="${y0 + 16}" width="${x1 - x0 - 32}" height="${y1 - y0 - 32}" rx="${r * 0.6}" fill="none" stroke="${GOLDL}" stroke-width="3" opacity="0.6"/>`;
    b += panel(-840, -1900, -330, -1060, 50) + panel(-200, -1420, 180, -980, 30) + panel(310, -1440, 590, -1040, 40);
    // the front quarter light (a small glazed window)
    b += `<rect x="330" y="-1900" width="240" height="380" rx="30" fill="url(#${id}i)" stroke="${GOLD}" stroke-width="12"/><path d="M350,-1880 L440,-1540" stroke="#fff" stroke-width="10" opacity="0.12"/>`;
    // the door: its seams, gilded frame, handle and the royal arms on the lower panel
    b += `<path d="M-250,-2000 L-250,-890 M230,-2000 L230,-890" stroke="#050405" stroke-width="7"/><path d="M-250,-2000 L230,-2000" stroke="#050405" stroke-width="6"/>`;
    b += `<path d="M240,-1460 l70,0" stroke="${GOLD}" stroke-width="16" stroke-linecap="round"/><circle cx="240" cy="-1460" r="16" fill="${GOLD}" ${ol(2)}/>`;
    b += crest(-10, -1210, 1);
    // gilded scrollwork on the back quarter: a crown over a cartouche
    b += `<g transform="translate(-585,-1500)"><path d="M-110,40 C-160,-20 -120,-90 -60,-70 C-30,-60 -30,-20 -60,-20 M110,40 C160,-20 120,-90 60,-70 C30,-60 30,-20 60,-20" stroke="${GOLD}" stroke-width="12" fill="none" stroke-linecap="round"/>${R.crownArt ? '' : ''}<path d="M-60,-120 L-70,-200 L-30,-160 L0,-220 L30,-160 L70,-200 L60,-120Z" fill="${GOLD}" ${ol(2.2)}/><rect x="-66" y="-130" width="132" height="24" rx="6" fill="${GOLD}" ${ol(2)}/><circle cx="0" cy="-118" r="8" fill="#a8182a"/></g>`;
    // the waist rail and the cornice with its gilded beading
    b += `<path d="M-905,-1450 C-500,-1460 300,-1460 648,-1450" stroke="${GOLD}" stroke-width="14" fill="none"/><path d="M-905,-1440 C-500,-1450 300,-1450 648,-1440" stroke="${GOLDD}" stroke-width="4" fill="none"/>`;
    b += `<path d="M-910,-2080 L650,-2080 L680,-2130 L-940,-2130Z" fill="#1a1418" ${ol(3)}/><path d="M-930,-2108 L670,-2108" stroke="${GOLD}" stroke-width="12" stroke-dasharray="18 10"/>`;
    // the roof: a low dome, a gilded rail with urn finials at the corners and the crown at its centre
    b += `<path d="M-900,-2130 C-700,-2210 450,-2210 640,-2130Z" fill="#141016" ${ol(3)}/>`;
    for (let i = 0; i <= 14; i++) { const x = -880 + i * 108; b += `<path d="M${x},-2150 L${x},-2250" stroke="${GOLD}" stroke-width="8"/>`; }
    b += `<path d="M-900,-2250 L660,-2250" stroke="${GOLD}" stroke-width="14"/>`;
    for (const x of [-900, 660]) b += `<path d="M${x - 26},-2250 C${x - 40},-2290 ${x - 20},-2330 ${x},-2340 C${x + 20},-2330 ${x + 40},-2290 ${x + 26},-2250Z" fill="${GOLD}" ${ol(2.4)}/><path d="M${x},-2340 L${x},-2380" stroke="${GOLD}" stroke-width="10"/><circle cx="${x}" cy="-2390" r="14" fill="${GOLD}" ${ol(2)}/>`;
    b += `<g transform="translate(-120,-2250)"><path d="M-130,0 L-150,-170 L-70,-90 L0,-210 L70,-90 L150,-170 L130,0Z" fill="${GOLD}" ${ol(3)}/><rect x="-140" y="-20" width="280" height="40" rx="10" fill="${GOLD}" ${ol(2.6)}/>${[-90, 0, 90].map(x => `<circle cx="${x}" cy="0" r="12" fill="${['#2a5aa8', '#a8182a', '#2a8a4a'][(x / 90 + 1)]}"/>`).join('')}<circle cx="0" cy="-214" r="14" fill="${GOLDL}" ${ol(2)}/><path d="M-80,-40 L-60,-140" stroke="${GOLDL}" stroke-width="5" opacity="0.6"/></g>`;
    // the window's gilded frame
    b += `<path d="${winClip(0)}" fill="none" stroke="${GOLD}" stroke-width="22"/><path d="${winClip(0)}" fill="none" stroke="${GOLDD}" stroke-width="4" transform="translate(0,0)"/>`;
    // a drop glass (raised: a pale sheen with two streaks)
    if ((o.glass ?? 1) > 0.01) b += `<g opacity="${f(o.glass ?? 1)}"><path d="${winClip(0)}" fill="#c8d8e0" opacity="0.08"/><path d="M${WIN[0] + 40},${WIN[1] + 40} L${WIN[0] + 160},${WIN[3] - 20}" stroke="#fff" stroke-width="22" opacity="0.13"/><path d="M${WIN[0] + 120},${WIN[1] + 30} L${WIN[0] + 200},${WIN[1] + 260}" stroke="#fff" stroke-width="9" opacity="0.12"/></g>`;
    // arrows stuck in the coach
    for (const a of (o.arrows || [])) b += P.arrowStuck(a[0], a[1], a[2], a[3], { quiver: a[4] || 0, t, dt: a[5] || 9 });
    // the sill moulding; leaning out, the passenger comes in front of the frame and rests on the sill
    b += `<path d="M${WIN[0] - 30},${WIN[3] + 6} L${WIN[2] + 30},${WIN[3] + 6}" stroke="${GOLD}" stroke-width="26" stroke-linecap="round"/><path d="M${WIN[0] - 30},${WIN[3] + 18} L${WIN[2] + 30},${WIN[3] + 18}" stroke="${GOLDD}" stroke-width="5"/>`;
    if ((o.lean || 0) >= 0.001) b += pass;
    // the carriage lamps on the front corners
    b += lamp(650, -1760, t) + lamp(-930, -1760, t, true);
    // ---- the coachman's box above the front wheel: seat, crimson hammercloth with a gold fringe, the splashboard
    let bx = `<path d="M600,-1700 L1000,-1700 L1040,-1640 L600,-1640Z" fill="#2a0a10" ${ol(2.6)}/>`;
    bx += (o.driver ? o.driver() : '');
    bx += `<path d="M640,-1650 L1080,-1650 C1100,-1500 1110,-1380 1090,-1270 L660,-1260 C640,-1380 630,-1520 640,-1650Z" fill="url(#${id}p)" ${ol(2.8)}/>`;
    bx += `<path d="M640,-1600 L1084,-1600" stroke="${GOLD}" stroke-width="14"/>` + crest(860, -1440, 0.6);
    const rf = rng(3); let fr = ''; for (let x = 664; x < 1088; x += 16) fr += `<path d="M${x},-1268 l${f((rf() - 0.5) * 6 + 3 * Math.sin(t * 5 + x))},${f(40 + rf() * 10)}" stroke="${GOLD}" stroke-width="7" stroke-linecap="round"/>`;
    bx += fr;
    bx += `<path d="M1090,-1660 C1180,-1640 1230,-1560 1240,-1460 L1200,-1460 C1190,-1540 1150,-1600 1080,-1610Z" fill="#141016" ${ol(2.4)}/>`;
    g += `<g transform="${bodyTr}">${b}${bx}</g>`;
    // ---- the near wheels (rolling)
    g += P.wheel(RW[0], RW[1], RR, roll, { n: 14 }) + P.wheel(FW[0], FW[1], FR, roll * RR / FR, { n: 12 });
    // ---- the near horse, its traces, and the reins up to the coachman's hands
    g += nearH.svg;
    const hands = o.reinHands || [960, -1520];
    for (const [hh, k] of [[nearH, 0], [farH, 1]]) {
      const base = [k ? P.COACH.HORSE_FAR[0] : P.COACH.HORSE, k ? P.COACH.HORSE_FAR[1] : 0], bit = add(base, hh.pts.bit, HS), terret = add(base, hh.pts.withers, HS);
      g += `<path d="M${pt(bit)} Q${pt(add(terret, [0, -40]))} ${pt(add(terret, [-120, 30]))} Q${pt(add(hands, [500, 60 + 30 * Math.sin(t * 3 + k)]))} ${pt(hands)}" stroke="#1e1410" stroke-width="9" fill="none" opacity="${k ? 0.75 : 1}"/>`;
    }
    const W = (p) => [o.x + p[0] * s, o.y + p[1] * s];
    return { svg: `<g transform="translate(${f(o.x)},${f(o.y)}) scale(${f(s)})">${g}</g>`, nearH, farH, roll, bob, rock, W,
      pts: { win: W([(WIN[0] + WIN[2]) / 2, (WIN[1] + WIN[3]) / 2]), fw: W(FW), rw: W(RW), box: W(BOX), lamp: W([650, -1760]) } };
  };
  // the window opening (rounded top corners); a lean widens the opening up and sideways, its bottom stays on the sill
  const winClip = (lean) => { const [x0, y0, x1, y1] = WIN, k = lean, X0 = x0 - 420 * k, X1 = x1 + 520 * k, Y0 = y0 - 520 * k, r = 46; return `M${f(X0)},${y1} L${f(X0)},${f(Y0 + r)} Q${f(X0)},${f(Y0)} ${f(X0 + r)},${f(Y0)} L${f(X1 - r)},${f(Y0)} Q${f(X1)},${f(Y0)} ${f(X1)},${f(Y0 + r)} L${f(X1)},${y1}Z`; };
  P.coachWinClip = winClip;
  // the royal arms: a crimson shield quartered with gold, under a crown
  const crest = (x, y, k) => `<g transform="translate(${x},${y}) scale(${k})"><path d="M-110,-120 L110,-120 L110,20 C110,110 40,150 0,170 C-40,150 -110,110 -110,20Z" fill="#8a1424" stroke="${GOLD}" stroke-width="12"/><path d="M0,-120 L0,170 M-110,10 L110,10" stroke="${GOLD}" stroke-width="10"/><circle cx="-50" cy="-56" r="18" fill="${GOLD}"/><circle cx="54" cy="80" r="18" fill="${GOLD}"/>` +
    `<path d="M-80,-140 L-96,-230 L-44,-180 L0,-250 L44,-180 L96,-230 L80,-140Z" fill="${GOLD}" ${ol(2.4)}/><rect x="-88" y="-150" width="176" height="26" rx="8" fill="${GOLD}" ${ol(2)}/>` +
    `<path d="M-150,-60 C-200,0 -190,120 -120,170 M150,-60 C200,0 190,120 120,170" stroke="${GOLD}" stroke-width="10" fill="none" stroke-linecap="round"/></g>`;
  P.royalArms = crest;
  // a brass carriage lamp with a candle glowing behind its glass
  const lamp = (x, y, t, back) => `<g transform="translate(${x},${y})"><path d="M-10,60 L10,60 L6,140 L-6,140Z" fill="${GOLDD}"/><path d="M-44,-60 L44,-60 L36,60 L-36,60Z" fill="#f8e8b0" opacity="${back ? 0.5 : 0.85}" ${ol(2.4)}/><path d="M-50,-60 L50,-60 L30,-110 L-30,-110Z" fill="${GOLD}" ${ol(2.4)}/><circle cx="0" cy="-124" r="14" fill="${GOLD}" ${ol(2)}/><path d="M-36,60 L36,60" stroke="${GOLD}" stroke-width="12"/><path d="M-30,-40 L-20,40" stroke="#fff" stroke-width="6" opacity="0.5"/></g>`;

  // ======================================================= a mounted rider
  // o: x, y (ground under the horse), s, dir, g, c, t, horse {col, tack...}, who (cast key), pose (extra person params),
  // face, lit (P -> svg), reins: hands drawn forward to the withers; spur 0..1; leg {legs, boot, hem}; armR/armL overrides,
  // hide (no person, e.g. far escort silhouettes)
  P.rider = (o) => {
    const Q = G.QCAST, s = o.s || 1, dir = o.dir || 1;
    const H = P.horse(Object.assign({ x: o.x, y: o.y, s, dir, g: o.g, c: o.c, t: o.t }, o.horse || {}));
    const hw = p => [o.x + p[0] * s * dir, o.y + p[1] * s];
    const seat = H.pts.saddle, seatW = hw(seat);
    // the person: hips on the seat, legs hidden, the torso leaning into the motion
    const lean = (o.lean || 0) + (H.pitch || 0) * 0.6;
    const po = Object.assign({ x: seatW[0], y: seatW[1] + 790 * s, s, noLegs: true, sway: lean * dir }, o.pose || {});
    // the hands hold the reins over the withers
    const handsW = hw(add(H.pts.hands, [-150, 50]));
    const Lp = R.toLocal(po, handsW);
    if (!po.armR) po.armR = { hand: [Lp[0] - 40 * dir, Lp[1] + 10], dir: [0.55 * dir, 0.6], pose: 'fist', facing: 'back' };
    if (!po.armL) po.armL = { hand: [Lp[0] + 40 * dir, Lp[1] + 4], dir: [0.6 * dir, 0.5], pose: 'fist', facing: 'back' };
    const Pp = o.hide ? null : Q[o.who](po);
    const id = uid('rd');
    let g = H.svg;
    if (Pp) {
      const cut = seatW[1] + 40 * s;
      g += `<defs><clipPath id="${id}"><rect x="${f(seatW[0] - 2000)}" y="${f(cut - 4000)}" width="4000" height="4000"/></clipPath></defs><g clip-path="url(#${id})">${o.lit ? o.lit(Pp) : Pp.svg}</g>`;
    }
    // the near leg over the flank, and the reins from the fists to the bit
    const legSvg = P.riderLeg(Object.assign({ hip: add(seat, [-10, -10]), spur: o.spur || 0, hem: (o.leg || {}).hem }, o.leg || {}));
    g += `<g transform="translate(${f(o.x)},${f(o.y)}) scale(${f(s * dir)},${f(s)})">${legSvg}</g>`;
    if (Pp && o.reins !== false) {
      const bitW = hw(H.pts.bit);
      for (const side of ['R', 'L']) {
        const hp = R.toWorld(po, side === 'R' ? po.armR.hand : po.armL.hand);
        g += `<path d="M${pt(hp)} Q${pt([(hp[0] + bitW[0]) / 2, Math.max(hp[1], bitW[1]) + 60 * s])} ${pt(bitW)}" stroke="#1e1410" stroke-width="${f(10 * s)}" fill="none"/>`;
      }
    }
    return { svg: g, H, P: Pp, po, seatW, hw };
  };
})(window);
