// Render an SVG that a JS file builds inside a page (after window.READY) and save a screenshot of it.
//   node _tools/snap.cjs --page _render/video/main20.html --js build.js --out shot.png [--w 1080 --h 1920]
// The file's text is the body of an async function returning an <svg ...>...</svg> string (or {svg, w, h}).
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { pathToFileURL } = require('url');
const args = process.argv.slice(2), opt = {};
for (let i = 0; i < args.length; i++) if (args[i].startsWith('--')) { opt[args[i].slice(2)] = args[i + 1]; i++; }
(async () => {
  const W = +(opt.w || 1080), H = +(opt.h || 1920);
  const browser = await chromium.launch({ args: ['--disable-gpu', '--allow-file-access-from-files', '--force-device-scale-factor=1'] });
  try {
    const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
    const errs = []; page.on('pageerror', e => errs.push(e.message));
    await page.goto(pathToFileURL(path.resolve(opt.page)).href, { waitUntil: 'load', timeout: 120000 });
    for (let k = 0; k < 600; k++) { if (await page.evaluate(() => window.READY === true)) break; await new Promise(r => setTimeout(r, 100)); }
    const body = fs.readFileSync(opt.js, 'utf8');
    const info = await page.evaluate(async (src) => {
      const r = await (new Function('return (async () => {' + src + '})()'))();
      const svg = typeof r === 'string' ? r : r.svg;
      document.getElementById('root').innerHTML = svg;
      await new Promise(res => requestAnimationFrame(() => requestAnimationFrame(res)));
      return typeof r === 'string' ? null : r.info || null;
    }, body);
    await new Promise(r => setTimeout(r, 300));
    await page.screenshot({ path: opt.out, type: opt.out.endsWith('.jpg') ? 'jpeg' : 'png' });
    if (info) console.log(JSON.stringify(info));
    if (errs.length) console.error('page errors:', errs.join(' | '));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
