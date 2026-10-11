// probe.cjs "<js expression returning an SVG string>" — evaluates in the page and reports hand/arm signatures
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto('file://' + path.resolve(process.argv[2]));
  const out = await p.evaluate(expr => { const s = eval(expr);
    const cnt = re => (s.match(re) || []).length;
    return { len: s.length, relaxed: cnt(/M-14 -4 C-18 8 -20 22 -19 34/g), fist: cnt(/M-15 -3 C-19 6 -20 18 -18 28 C-16 37/g), band50: cnt(/stroke-width="50"/g), capsules: cnt(/filter="url\(#pk_/g) }; }, process.argv[3]);
  console.log(JSON.stringify(out));
  await b.close();
})();
