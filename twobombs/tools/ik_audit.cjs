// Arm/hand audit: runs every frame's drawing code; reports arms whose hand target is out of reach (hand would fall short)
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto('file://' + path.resolve(process.argv[2]));
  const fps = +(process.argv[3] || 30);
  const out = await p.evaluate((fps) => {
    const agg = {}; const orig = window.ik;
    window.ik = function (sh, T, L1, L2, bend) {
      const d = Math.hypot(T[0] - sh[0], T[1] - sh[1]), err = Math.max(d - (L1 + L2 - 2), Math.abs(L1 - L2) + 2 - d);
      if (err > 1) { const k = `shot ${window.__shot + 1} arm@${sh[0]},${sh[1]} L=${L1}+${L2}`; const a = (agg[k] = agg[k] || { n: 0, worst: 0, t0: window.__T, t1: 0 }); a.n++; a.worst = Math.max(a.worst, +err.toFixed(1)); a.t1 = +window.__T.toFixed(2); }
      return orig(sh, T, L1, L2, bend);
    };
    for (let f = 0; f < Math.round(window.DURATION * fps); f++) window.render(f / fps);
    return agg;
  }, fps);
  console.log(Object.keys(out).length ? JSON.stringify(out, null, 1) : 'AUDIT CLEAN: every hand reaches its target');
  await b.close();
})();
