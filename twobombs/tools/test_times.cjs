// Render flat + normal + light rig for a list of times into <dir>:  node test_times.cjs page.html dir t1,t2,...
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
(async () => {
  const [page, dir, times] = process.argv.slice(2); fs.mkdirSync(dir, { recursive: true });
  const br = await chromium.launch(); const p = await br.newPage({ viewport: { width: 1080, height: 1920 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve(page));
  const grab = async (type) => { await p.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))); await p.waitForTimeout(70);
    const opt = type === 'png' ? { type: 'png' } : { type: 'jpeg', quality: 95 }; let prev = await p.screenshot(opt);
    for (let i = 0; i < 8; i++) { await p.waitForTimeout(50); const c = await p.screenshot(opt); if (c.equals(prev)) break; prev = c; } return prev; };
  for (const t of times.split(',').map(Number)) {
    const id = t.toFixed(2);
    await p.evaluate(t => { window.PASS = 'flat'; document.body.classList.add('fpass'); document.body.classList.remove('npass'); window.render(t, 'B'); }, t);
    fs.writeFileSync(`${dir}/flat_${id}.jpg`, await grab('jpeg'));
    fs.writeFileSync(`${dir}/rig_${id}.json`, await p.evaluate(() => JSON.stringify(window.LIGHTS)));
    await p.evaluate(t => { window.PASS = 'normal'; document.body.classList.add('npass'); document.body.classList.remove('fpass'); window.render(t, 'B'); }, t);
    fs.writeFileSync(`${dir}/nrm_${id}.png`, await grab('png'));
  }
  if (errs.length) console.error('PAGE ERRORS:', [...new Set(errs)].slice(0, 8));
  await br.close();
})();
