// node tools/errs.cjs page.html  — print every page error / console error on load
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', e => console.log('PAGEERROR:', e.message.split('\n')[0], (e.stack || '').split('\n').slice(1, 3).join(' | ')));
  p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.log('CONSOLE', m.type(), m.text().slice(0, 200)); });
  await p.goto('file://' + path.resolve(process.argv[2])); await p.waitForTimeout(500); await b.close(); })();
