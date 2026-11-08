// Linux / macOS port of cdp.ps1: headless Chromium (Playwright) renders frames of a page over the DevTools protocol,
// one browser, many frames. The page must set window.READY = true and define async window.renderFrame(n).
// Frames are written as <out>/f00000.jpg (or .png), exactly like cdp.ps1.
//
//   node _tools/cdp.cjs --page _render/video/look20.html --list 30,90,150 --out _render/smoke [--quality 98]
//   node _tools/cdp.cjs --page _render/video/main20.html --from 0 --to 2999 --out _render/frames20a --quality 98
//
// Options: --from/--to/--step, --list a,b,c, --quality (jpeg, default 93), --fmt jpeg|png, --query 'a=1&b=2',
// --w/--h (1080x1920), --stable (capture again until two captures in a row are identical), --sync (the compositor
// finishes every raster tile before drawing). Rasterises on the CPU (--disable-gpu): the skill found CPU raster clean
// where the GPU dropped layers in heavy transitions. One renderer at a time.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const args = process.argv.slice(2), opt = {};
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (!a.startsWith('--')) continue;
  const k = a.slice(2), nx = args[i + 1];
  if (nx === undefined || nx.startsWith('--')) opt[k] = true; else { opt[k] = nx; i++; }
}
const W = +(opt.w || 1080), H = +(opt.h || 1920), fmt = opt.fmt || 'jpeg', quality = +(opt.quality || 93);
if (!opt.page || !opt.out) { console.error('usage: node cdp.cjs --page <html> --out <dir> (--list a,b,c | --from n --to m [--step k])'); process.exit(2); }
const frames = opt.list ? String(opt.list).split(',').map(s => parseInt(s, 10)).filter(n => Number.isFinite(n))
  : (() => { const r = []; for (let q = +(opt.from || 0); q <= +(opt.to || 0); q += +(opt.step || 1)) r.push(q); return r; })();

(async () => {
  const launchArgs = ['--hide-scrollbars', '--force-device-scale-factor=1', `--window-size=${W},${H}`, '--allow-file-access-from-files', '--disable-gpu'];
  if (opt.sync) launchArgs.push('--run-all-compositor-stages-before-draw', '--disable-checker-imaging');
  const browser = await chromium.launch({ args: launchArgs });
  const errors = [];
  try {
    const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
    const url = pathToFileURL(path.resolve(opt.page)).href + (opt.query ? '?' + opt.query : '');
    await page.goto(url, { waitUntil: 'load', timeout: 120000 });
    let ready = false;
    for (let k = 0; k < 600 && !ready; k++) { ready = await page.evaluate(() => window.READY === true); if (!ready) await new Promise(r => setTimeout(r, 100)); }
    if (!ready) throw new Error('page never set window.READY');
    if (errors.length) console.log('page errors at load:\n  ' + errors.join('\n  '));
    const cdp = await page.context().newCDPSession(page);
    const outDir = path.resolve(opt.out);
    fs.mkdirSync(outDir, { recursive: true });
    const cap = async () => (await cdp.send('Page.captureScreenshot', fmt === 'jpeg' ? { format: 'jpeg', quality, captureBeyondViewport: false } : { format: 'png', captureBeyondViewport: false })).data;
    const t0 = Date.now(); let done = 0, unstable = 0;
    for (const f of frames) {
      try { await page.evaluate(async n => { await window.renderFrame(n); return true; }, f); }
      catch (e) { throw new Error(`renderFrame(${f}) failed: ${String(e.message || e).slice(0, 600)}`); }
      let data = await cap();
      if (opt.stable) {
        let k = 0;
        for (; k < 40; k++) { await new Promise(r => setTimeout(r, +(opt.stableMs || 350))); const d2 = await cap(); if (d2 === data) break; data = d2; unstable++; }
        if (k >= 40) console.log(`frame ${f} never settled`);
      }
      fs.writeFileSync(path.join(outDir, `f${String(f).padStart(5, '0')}.${fmt === 'jpeg' ? 'jpg' : 'png'}`), Buffer.from(data, 'base64'));
      done++;
      if (done % 25 === 1) console.log(`frame ${f} (${((Date.now() - t0) / 1000 / done).toFixed(2)}s/frame)`);
    }
    console.log(`rendered ${done} frames in ${((Date.now() - t0) / 1000).toFixed(1)}s` + (opt.stable ? ` (re-captures while settling: ${unstable})` : ''));
    const late = await page.evaluate(() => (window.__E || []).slice(0, 20));
    if (late.length) console.log('window.__E:\n  ' + late.join('\n  '));
  } finally { await browser.close(); }
})().catch(e => { console.error(String(e && e.stack || e)); process.exit(1); });
