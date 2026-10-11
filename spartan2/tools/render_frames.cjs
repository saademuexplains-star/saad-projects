#!/usr/bin/env node
// Render frames [from, to) (frame indices) of a project page to <outDir>/NNNNN.jpg. Several of these run in parallel.
//   node render_frames.cjs page.html outDir fromFrame toFrame
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const [page, outDir, a, b, stepArg] = process.argv.slice(2); const step = +(stepArg || 1);
  fs.mkdirSync(outDir, { recursive: true });
  const br = await chromium.launch(); const p = await br.newPage({ viewport: { width: 1080, height: 1920 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve(page)); await p.evaluate(() => document.fonts.ready);
  const FPS = await p.evaluate(() => window.FPS);
  const t0 = Date.now();
  for (let f = +a; f < +b; f += step) {
    const out = path.join(outDir, `${String(f).padStart(5, '0')}.jpg`);
    if (fs.existsSync(out)) continue;                        // resumable
    await p.evaluate(t => window.render(t, 'B'), f / FPS);
    // capture until two consecutive screenshots are identical: heavy layers (SVG filters, CSS blur) can still be
    // rasterising when the first capture happens, and an unpainted tile lets the layer underneath ghost through
    await p.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
    await p.waitForTimeout(80);
    let prev = await p.screenshot({ type: 'jpeg', quality: 94 }), tries = 0;
    for (;;) {
      await p.waitForTimeout(60);
      const cur = await p.screenshot({ type: 'jpeg', quality: 94 });
      if (cur.equals(prev) || ++tries >= 8) { prev = cur; break; }
      prev = cur;
    }
    if (tries) console.log(`frame ${f}: settled after ${tries} extra capture(s)`);
    fs.writeFileSync(out + '.tmp.jpg', prev);
    fs.renameSync(out + '.tmp.jpg', out);
    if (((f - a) / step) % 25 === 0) console.log(`[${a}-${b}] frame ${f}  ${((Date.now() - t0) / 1000 / ((f - a) / step + 1)).toFixed(2)} s/frame`);
  }
  if (errs.length) console.error('PAGE ERRORS:', errs.slice(0, 5));
  await br.close();
  console.log(`[${a}-${b}] done in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
})();
