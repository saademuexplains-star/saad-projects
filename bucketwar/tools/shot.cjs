// node tools/shot.cjs page.html outDir "fn(arg)" ...   — quick still renderer for development
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs');
(async () => {
  const [page, out, ...calls] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + path.resolve(page)); await p.evaluate(() => document.fonts.ready);
  await p.evaluate(async () => { await Promise.all([document.fonts.load('800 80px Poppins'), document.fonts.load('900 80px Poppins'), document.fonts.load('80px Anton')]); });
  let i = 0;
  for (const c of calls) {
    const t0 = Date.now(); await p.evaluate(c); const f = path.join(out, `s${String(i++).padStart(2, '0')}.png`);
    await p.locator('canvas').first().screenshot({ path: f }); console.log(f, (Date.now() - t0) + 'ms', c);
  }
  if (errs.length) console.error('ERRORS:', errs.slice(0, 6)); await b.close();
})();
