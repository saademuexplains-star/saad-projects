// Is the ghost a render-order / timing artefact? Render the worker's sequence and screenshot each step.
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto('file://' + path.resolve('index.html'));
  for (const [t, name] of [[24.867, 'seqA_746'], [25.0, 'seqA_750'], [25.0, 'seqA_750again']]) {
    await p.evaluate(t => window.render(t, 'B'), t);
    await p.screenshot({ path: name + '.png', type: 'jpeg', quality: 94 });
  }
  await b.close();
})();
