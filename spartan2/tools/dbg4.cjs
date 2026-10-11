const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto('file://' + path.resolve('index.html'));
  const raf2 = () => p.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
  const tests = [['raf2', async () => { await raf2(); }], ['wait150', async () => { await p.waitForTimeout(150); }], ['raf2x3', async () => { await raf2(); await raf2(); await raf2(); }]];
  for (const [name, waitFn] of tests) {
    await p.evaluate(() => window.render(24.867, 'B')); await waitFn(); await p.screenshot({ path: `w_${name}_prev.jpg`, type: 'jpeg', quality: 94 });
    await p.evaluate(() => window.render(25.0, 'B')); await waitFn(); await p.screenshot({ path: `w_${name}.jpg`, type: 'jpeg', quality: 94 });
  }
  await b.close();
})();
