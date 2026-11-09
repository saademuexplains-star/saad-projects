// Hand audit, step 1 (run with _tools/jseval.cjs on a film's page): every STEP frames outside transitions, every arm's
// wrist and elbow on screen (rig3 window.__ARMW, through the shot's own camera). Prints JSON [[frame, shot, [[wx, wy, ex,
// ey, handLen], ...]], ...]. Step 2: _tools/render_list.sh those frames, then _tools/handcrops.py tiles every hand.
//   node _tools/jseval.cjs --page _render/video/main20.html --js _tools/handaudit.js > hands.json
const X = window.ENG;
let lastCam = null;
const oc = X.compose;
X.compose = (layers, cam) => { lastCam = cam; return oc(layers, cam); };
const toScr = (p, c) => { const [cx, cy, z, r = 0] = c, a = r * Math.PI / 180, dx = (p[0] - cx) * z, dy = (p[1] - cy) * z; return [540 + dx * Math.cos(a) - dy * Math.sin(a), 960 + dx * Math.sin(a) + dy * Math.cos(a)]; };
const out = [];
const STEP = +(window.AUD_STEP || 20);
for (let n = 0; n < window.VIDEO_FRAMES; n += STEP) {
  const t = X.tOf ? X.tOf(n) : n / 60;
  if (X.transAt(t)) continue;
  const s = X.shots.find(s => t >= s.t0 && t < s.t1);
  if (!s) continue;
  window.__ARMW = []; lastCam = null;
  X.renderShot(s.id, t);
  const A = window.__ARMW; window.__ARMW = null;
  if (!lastCam) continue;
  const z = lastCam[2];
  const hands = [];
  for (const a of A) {
    const w = toScr([a[0], a[1]], lastCam), e = toScr([a[2], a[3]], lastCam), L = a[4] * z;
    if (w[0] < -L || w[0] > 1080 + L || w[1] < -L || w[1] > 1920 + L) continue;
    hands.push([Math.round(w[0]), Math.round(w[1]), Math.round(e[0]), Math.round(e[1]), Math.round(L)]);
  }
  out.push([n, s.id, hands]);
}
X.compose = oc;
return out;
