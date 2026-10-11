#!/usr/bin/env node
// Render still frames from a project page.
//   node render_stills.cjs <page.html> <outDir> --times 0.5,1.9,3.4 [--variant B]
//   node render_stills.cjs <page.html> <outDir> --stills          (calls window.STILLS[name]() for each named still)
// Needs playwright (Chromium). Run with NODE_PATH=$(npm root -g) if playwright is installed globally.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const [page, outDir, ...rest] = process.argv.slice(2);
  const arg = n => { const i = rest.indexOf(n); return i >= 0 ? rest[i + 1] : null; };
  const variant = arg('--variant') || 'B';
  fs.mkdirSync(outDir, { recursive: true });
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve(page)); await p.evaluate(() => document.fonts.ready);
  if (rest.includes('--stills')) {
    const names = await p.evaluate(() => Object.keys(window.STILLS || {}));
    for (const n of names) {
      await p.evaluate(n => window.STILLS[n](), n);
      await p.screenshot({ path: path.join(outDir, `${n}.png`) });
      console.log('wrote', n);
    }
  } else {
    for (const t of (arg('--times') || '0').split(',')) {
      await p.evaluate(([t, v]) => window.render(+t, v), [t, variant]);
      const f = path.join(outDir, `t${(+t).toFixed(2)}_${variant}.png`);
      await p.screenshot({ path: f }); console.log('wrote', f);
    }
  }
  if (errs.length) { console.error('PAGE ERRORS:', errs); process.exitCode = 1; }
  await b.close();
})();
