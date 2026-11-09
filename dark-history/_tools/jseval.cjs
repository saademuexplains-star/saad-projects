// Evaluate a JS file inside a page (after window.READY) and print what it returns as JSON.
//   node _tools/jseval.cjs --page _render/video/main20.html --js probe.js
// The file's text is the body of an async function: `return {...}` whatever it computes.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { pathToFileURL } = require('url');
const args = process.argv.slice(2), opt = {};
for (let i = 0; i < args.length; i++) if (args[i].startsWith('--')) { opt[args[i].slice(2)] = args[i + 1]; i++; }
(async () => {
  const browser = await chromium.launch({ args: ['--disable-gpu', '--allow-file-access-from-files'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
    const errs = []; page.on('pageerror', e => errs.push(e.message));
    await page.goto(pathToFileURL(path.resolve(opt.page)).href, { waitUntil: 'load', timeout: 120000 });
    for (let k = 0; k < 600; k++) { if (await page.evaluate(() => window.READY === true)) break; await new Promise(r => setTimeout(r, 100)); }
    const body = fs.readFileSync(opt.js, 'utf8');
    const r = await page.evaluate(new Function('return (async () => {' + body + '})()'));
    if (errs.length) console.error('page errors:', errs.join(' | '));
    console.log(JSON.stringify(r, null, 0));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
