# Engine (`_render/video/engine.js`, global `G.ENG = X`)

## Page setup

Each production has a page `_render/video/mainN.html`. It sets `window.VIDEO_FRAMES`, then loads the scripts in this order:

1. `../lib/rig3.js`, `../lib/cine.js`, `../lib/env.js` (rig, light/grade, shared scenery)
2. `cast.js` + this video's `castN.js`
3. `props*.js`
4. `sets*.js`
5. `engine.js`
6. this video's `shots_*.js` files

It also defines `window.renderFrame(n)`, which does `root.innerHTML = ENG.svgFrame(n)` and then waits 3 animation frames plus 40 ms. Copy `main4.html` for a new video.

- Debug URL flags: `?noset` hides sets, `?nochars` hides characters, `?nolit` skips lighting.
- `X.FRAMES = VIDEO_FRAMES` and `X.T_END = FRAMES / 60`.

## Shots and time

```js
X.shot(id, t0, t1, (t, local) => svgString, { grade: 'gDay' });
X.tr(type, at, d, idA, idB, options);   // transition centred on `at`, lasting d s (end: true -> it ends at `at`)
```

- A frame at time `t`:
  1. If a transition covers `t`, it renders both shots through `TR[type]`.
  2. Otherwise the **first registered** shot with `t0 <= t < t1` is used.
- **Gotcha:** if an earlier shot's `t1` extends past the end of its outgoing transition, it reappears for a moment after the transition. Set each shot's `t1` exactly to the end of its outgoing transition. The same goes for `t0` and its incoming transition start.
- **Loop close:** `X.tr('carry' | 'organic', X.T_END, 0.62, 'LAST', 'FIRST', { end: true, bOff: -X.T_END, ... })` blends the last frames into frame 0's shot. Design the first shot so it also works as the landing.
- One render function can serve two shot ids (e.g. `W5a` and `W5c` share the river function).

## Tracks and easing

```js
const { track: TK, ss, clamp, lerp, EZ } = X;
const cam = TK([[t0, [x, y, zoom, roll]], [t1, [x, y, zoom, roll], 'io'], ...]);   // the ease names the segment arriving at that key
```

- `EZ`: `lin, in, out, in2, out2, io (cubic in-out), sine, expo, back`.
- `ss(a, b, x)` is smoothstep.
- `X.noise(t, seed)` is smooth pseudo-noise.
- Only use smooth functions: `Math.abs(sin)` or `Math.max(0, sin)` kinks read as jitter.

## Camera and layers

- `cam = [cx, cy, zoom, rollDeg]`: the world point at the screen centre (540, 960), the zoom, and the roll.
- The world is 1080x1920 at zoom 1.
- `hh(cam(t), t, amp, seed)` adds hand-held drift and stores `X.CAM` (needed for culling and for `X.lit`).
- A set or shot is a list of layers `{ p, svg, chars?, light? }`. `X.compose(layers, cam)` applies parallax: layer depth `p` scales both the move and the zoom (`zoom^p`).

  | `p` | Typical layer |
  |---|---|
  | 0.2 | Sky |
  | 0.45 | Far |
  | 0.6–0.8 | Mid / back wall |
  | 1 | Characters and ground |
  | 1.15–1.35 | Foreground, blurred |
- `X.stage(set, charsSvg)` inserts characters before the set's first foreground layer.
- `X.viewRect(p)` gives the visible world rect on a layer. Use it to cull drawing in big worlds (see `sets7.js`).
- `scr(worldPt, cam, p)` (from `G.SHOTS_E`) converts world to screen: transition focus points `fa`/`fb` are screen points of the matching objects.

## Transitions (`TR.*`, screen space)

All take `fa` / `fb` focus points (screen px) where relevant.

| type | options | notes |
|---|---|---|
| `carry` | `mode: 'pan' / 'tilt'` with `dir: [dx, dy]`, `dist`; or `mode: 'zoom'` with `k` (>1 push, <1 pull), `fa`, `fb`; `fade: [c0, c1]`, `blur`, `roll`, `leak`, `leakOp`, `leakAt` | Momentum carry: A accelerates, B decelerates at matched speed |
| `wipe` | `dir`, `truck`, `obj: (x, u) => svg` | Foreground object crossing the lens |
| `push` | `fa, fb, za, zb, fade, blur, easeA, easeB` | |
| `flash` | `col, pow, fa, fb, za` | |
| `dip` | `fa, fb, za, zb, col` | |
| `unroll` | — | Parchment roller (needs `PROPS.scroll`) |
| `organic` | `fa, fb, za, zb, seed, freq, soft, leak`, or `plain: true` (crossfade) | |
| `bokeh` | `dir, dist, blur, seed` | |
| `glint` | `fa, fb, za, zb, col` | |
| `iris` | `fa, k` | Darkness is a radial gradient (no giant blur filters) |
| `liquid` | `fa, fb, col (default '#5a0810'), seed` | |
| `zmatch` | `fa, fb, za, zb, seed, leak, leakOp, blur` | |
| `lens` | `fa, fb, za` | |
| `scan` | `fb, zb, za, col` | |
| `eyelid` | — | Lids close (`io`) on A, open on B with defocus |
| `heat` | — | |
| `negative` | `fa, fb` | Plateau inversion, A→B dissolve inside the negative |
| `sweep` | `col, dir` | |
| `morph` | `fa, fb, za, zb, col` | |
| `surface` | `dir: 1` (going under) / `-1` (coming up), `seed` | |
| `whip` | `dir, gap, blur, ease` | |
| `spin` | `rot, k, fa, fb, blur` | |
| `cut` | — | |

Rules:
- Any transition curve must have zero slope at u = 0 and u = 1 (smoothstep-style), or the first and last frames pop.
- Never hard-swap A→B at full strength; dissolve them inside the effect.
- Avoid blur filters on regions larger than about 3000 px: Chrome drops them and you get glitch frames.
- `X.VEXP` widens culling during transitions. Add an entry for any new type in `frameBody`'s table.

## Grades and post

- Grades (`{ grade }` on a shot): `gDay`, `gHall`, `gNight`, `gDusk`, `gPage`, `gSick`, `gFeast`. Built with `C.gradeFilter(id, sat, curve, [r, g, b])` in `X.defs()`.
- `X.post` adds a vignette and moving film grain to every frame.
- Shared filters: `b2 / b4 / b8 / b14` (blurs), `dof1 / dof2 / dof3` (depth blur), `skinS`, `clothS`, `cloth`, `plaster`, `ground`, `woodH / woodV`, `tex`, `grain`, `silh / silhS` (silhouettes), `xrayP`, `bigGlow`.
- `C` (cine.js): `C.lit`, `C.radial(x, y, r, col, op, mode)`, `C.bloom`, `C.vignette(op, col, inner)`, `C.gradeFilter`.

## Sets, props and particles

- **Sets** are functions `S.name(t, opts)` returning layer lists. Examples by video:

  | Video | Sets |
  |---|---|
  | The Messenger | `sets1/2` |
  | The Whipping Boy | `sets3/4` (palace, classroom) |
  | The Royal Taster | `sets5` (dining room, feast hall, village) |
  | The Worm | `sets6` (market, micro, courtyard with day/season, room, river, hut, city); `sets7` (inside-the-body flesh world) |
- Shared helpers:
  - `S.dust(x, y, w, h, n, seed, t, col, size, op)` — motes
  - `S.lg(id, stops)` — gradients
  - `E.ridge`, `E.herbs` from `env.js`
- **Props** (`PR`, `G.PROPS`) cover tableware, food, weapons, scrolls, jars, candles, the goatskin, cup, bread, worm, twig, ambulance and more. Grip-frame props are documented in their comments.
