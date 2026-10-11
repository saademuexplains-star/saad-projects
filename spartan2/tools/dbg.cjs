const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto('file://' + path.resolve('index.html'));
  for (const t of [24.967, 25.0]) {
    const info = await p.evaluate(t => { window.render(t, 'B'); const g = id => document.getElementById(id);
      return ['L1', 'L2', 'L3', 'flash'].map(id => `${id}: disp=${g(id).style.display} op=${g(id).style.opacity} tf=${g(id).style.transform} filt=${g(id).style.filter} len=${(g(id).innerHTML || '').length}`).join('\n'); }, t);
    console.log('t=' + t + '\n' + info);
    await p.evaluate(() => { document.getElementById('L1').style.display = 'none'; });
    await p.screenshot({ path: `dbg_noL1_${t}.png` });
  }
  await b.close();
})();
