const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto('file://' + path.resolve('index.html'));
  await p.evaluate(() => window.render(25.0, 'B')); await p.screenshot({ path: 'iso_off.png' });
  await p.evaluate(() => { for (const id of ['L1', 'L2', 'L3']) document.getElementById(id).style.isolation = 'isolate'; window.render(25.0, 'B'); });
  await p.screenshot({ path: 'iso_on.png' });
  for (const t of [6.0, 20.0, 25.2, 37.0]) {   // plain frames: isolation must not change them
    await p.evaluate(t => { for (const id of ['L1', 'L2', 'L3']) document.getElementById(id).style.isolation = 'auto'; window.render(t, 'B'); }, t);
    await p.screenshot({ path: `pl_off_${t}.png` });
    await p.evaluate(t => { for (const id of ['L1', 'L2', 'L3']) document.getElementById(id).style.isolation = 'isolate'; window.render(t, 'B'); }, t);
    await p.screenshot({ path: `pl_on_${t}.png` });
  }
  await b.close();
})();
