// Render given times over a white page background to reveal transparent areas of each shot.
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const [page, ...times] = process.argv.slice(2);
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto('file://' + path.resolve(page));
  for (const t of times) {
    await p.evaluate(t => { window.render(+t, 'B'); document.body.style.background = '#fff'; }, t);
    await p.screenshot({ path: `alpha_${t}.png` }); console.log('wrote', t);
  }
  await b.close();
})();
