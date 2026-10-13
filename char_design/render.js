// Render one or more SVG files to PNG with Chromium (full filter support).
// usage: node render.js in.svg out.png [scale]
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const [inp, out, sc] = process.argv.slice(2);
  const svg = fs.readFileSync(inp, 'utf8');
  const m = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
  const W = +m[1], H = +m[2], s = +(sc || 1);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: s });
  await page.setContent(`<html><body style="margin:0;background:#000">${svg}</body></html>`);
  await page.waitForTimeout(100);
  await page.screenshot({ path: out, clip: { x: 0, y: 0, width: W, height: H } });
  await browser.close();
})();
