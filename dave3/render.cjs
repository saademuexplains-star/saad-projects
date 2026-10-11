// node render.cjs stills OUTDIR t1,t2,...   |   node render.cjs video FRAMEDIR FROM TO [workers]
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = __dirname;
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };
function serve() {
  return new Promise(res => {
    const srv = http.createServer((q, r) => {
      const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]));
      fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' }); r.end(d); });
    }).listen(0, () => res(srv));
  });
}
async function page(browser, port) {
  const p = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('console', m => { if (m.type() === 'error') console.error('PAGE:', m.text()); });
  p.on('pageerror', e => console.error('PAGEERR:', e.message));
  await p.goto(`http://127.0.0.1:${port}/${process.env.PAGE||'index.html'}`); await p.evaluate(() => window.ready);
  return p;
}
const save = (file, url) => fs.writeFileSync(file, Buffer.from(url.split(',')[1], 'base64'));
(async () => {
  const [mode, out, a, b, wk] = process.argv.slice(2);
  fs.mkdirSync(out, { recursive: true });
  const srv = await serve(), port = srv.address().port;
  const browser = await chromium.launch({ args: ['--disable-gpu-vsync', '--enable-unsafe-swiftshader'] });
  if (mode === 'stills') {
    const p = await page(browser, port);
    for (const t of a.split(',').map(Number)) save(path.join(out, `t${t.toFixed(2)}.jpg`), await p.evaluate(t => renderFrame(t), t));
  } else {
    const from = Math.round(Number(a) * 30), to = Math.round(Number(b) * 30), W = Number(wk || 4);
    const idx = []; for (let i = from; i < to; i++) idx.push(i);
    let done = 0; const t0 = Date.now();
    await Promise.all(Array.from({ length: W }, async (_, w) => {
      const p = await page(browser, port);
      for (let j = w; j < idx.length; j += W) {
        const i = idx[j]; save(path.join(out, `${String(i).padStart(5, '0')}.jpg`), await p.evaluate(t => renderFrame(t), i / 30));
        if (++done % 30 === 0) console.log(`${done}/${idx.length} frames, ${((Date.now() - t0) / done).toFixed(0)} ms/frame`);
      }
    }));
  }
  await browser.close(); srv.close();
})().catch(e => { console.error(e); process.exit(1); });
