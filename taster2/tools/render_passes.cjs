#!/usr/bin/env node
// Render the relighting passes for frames [from, to) step k:  flat/NNNNN.jpg (albedo), nrm/NNNNN.png (normals),
// lights/NNNNN.json (the frame's light rig).  Resumable.   node render_passes.cjs page.html from to [step]
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
(async () => {
  const [page, a, b, stepArg, forceArg] = process.argv.slice(2); const step = +(stepArg || 1), force = forceArg === '--force';
  for (const d of ['flat', 'nrm', 'lights']) fs.mkdirSync(d, { recursive: true });
  const br = await chromium.launch(); const p = await br.newPage({ viewport: { width: 1080, height: 1920 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve(page)); await p.evaluate(() => document.fonts.ready);
  const FPS = await p.evaluate(() => window.FPS);
  const grab = async (type) => {
    // pure SVG, no external images: two animation frames and one capture are enough (the double-capture check always matched)
    await p.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))); await p.waitForTimeout(15);
    return p.screenshot(type === 'png' ? { type: 'png' } : { type: 'jpeg', quality: 95 });
  };
  const t0 = Date.now(); let n = 0;
  for (let f = +a; f < +b; f += step) {
    const id = String(f).padStart(5, '0'), fo = `flat/${id}.jpg`, no = `nrm/${id}.png`, lo = `lights/${id}.json`;
    if (!force && fs.existsSync(fo) && fs.existsSync(no) && fs.existsSync(lo)) continue;
    const t = f / FPS;
    await p.evaluate(t => { window.PASS = 'flat'; document.body.classList.add('fpass'); document.body.classList.remove('npass'); window.render(t, 'B'); }, t);
    const flat = await grab('jpeg');
    const rig = await p.evaluate(() => JSON.stringify(window.LIGHTS));
    await p.evaluate(t => { window.PASS = 'normal'; document.body.classList.add('npass'); document.body.classList.remove('fpass'); window.render(t, 'B'); }, t);
    const nrm = await grab('png');
    fs.writeFileSync(fo + '.tmp', flat); fs.renameSync(fo + '.tmp', fo);
    fs.writeFileSync(no + '.tmp', nrm); fs.renameSync(no + '.tmp', no);
    fs.writeFileSync(lo, rig);
    if (n++ % 20 === 0) console.log(`[${a}-${b}] frame ${f}  ${((Date.now() - t0) / 1000 / n).toFixed(2)} s/frame`);
  }
  if (errs.length) console.error('PAGE ERRORS:', errs.slice(0, 5));
  await br.close(); console.log(`[${a}-${b}] done in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
})();
