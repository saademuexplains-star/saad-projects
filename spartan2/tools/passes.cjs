// Render the flat (albedo) and normal passes of given times:  node passes.cjs page.html outDir t1,t2,...
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
(async () => {
  const [page, outDir, times] = process.argv.slice(2); fs.mkdirSync(outDir, { recursive: true });
  const br = await chromium.launch(); const p = await br.newPage({ viewport: { width: 1080, height: 1920 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve(page));
  const settle = async () => { await p.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))); await p.waitForTimeout(120);
    let prev = await p.screenshot({ type: 'png' }); for (let i = 0; i < 8; i++) { await p.waitForTimeout(60); const c = await p.screenshot({ type: 'png' }); if (c.equals(prev)) break; prev = c; } return prev; };
  for (const t of times.split(',').map(Number)) {
    for (const pass of ['classic', 'flat', 'normal']) {
      await p.evaluate(([t, pass]) => { window.PASS = pass; document.body.classList.toggle('npass', pass === 'normal'); window.render(t, 'B'); }, [t, pass]);
      const t0 = Date.now(); const img = await settle();
      fs.writeFileSync(path.join(outDir, `${pass}_${t.toFixed(2)}.png`), img); console.log(pass, t, Date.now() - t0, 'ms');
    }
  }
  if (errs.length) console.error('PAGE ERRORS:', errs.slice(0, 5)); await br.close();
})();
