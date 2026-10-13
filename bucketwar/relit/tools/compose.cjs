// Composite captions / labels / the sleeper's Zs onto a lit frame, using the same CSS as the engine's caption layer.
//   node tools/compose.cjs lit.jpg out.png '{"caption":"bucket.","key":true,"label":"Italy, 1325","zs":[[150,640]]}'
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs');
(async () => {
  const [lit, out, optS] = process.argv.slice(2); const o = JSON.parse(optS || '{}');
  const img = 'file://' + path.resolve(lit), fonts = 'file://' + path.resolve(__dirname, '../../fonts');
  const zs = (o.zs || []).map(([x, y], i) => [['z', 46, 0], ['Z', 62, -26], ['Z', 82, -70]].map(([ch, sz, dy], j) => `<div class="z" style="left:${x + j * 52}px;top:${y + dy - j * 58}px;font-size:${sz}px;transform:rotate(${-8 + j * 7}deg)">${ch}</div>`).join('')).join('');
  const html = `<!doctype html><meta charset="utf-8"><style>
    @font-face{font-family:Poppins;font-weight:800;src:url(${fonts}/Poppins-ExtraBold.ttf)}
    *{margin:0;padding:0;box-sizing:border-box} body{width:1080px;height:1920px;overflow:hidden;background:#000;position:relative}
    img{position:absolute;inset:0;width:1080px;height:1920px}
    .capWord{position:absolute;left:40px;right:40px;top:${o.capTop ?? 1230}px;text-align:center;font:800 ${o.capSize ?? 96}px Poppins,sans-serif;color:#fffdf5;-webkit-text-stroke:${o.stroke ?? 11}px #121212;paint-order:stroke fill;letter-spacing:.5px;
      text-shadow:0 5px 12px rgba(0,0,0,.7),0 0 3px rgba(0,0,0,.9)}
    .capWord.key{color:#ffd21f}
    .label{position:absolute;left:60px;top:${o.labelTop ?? 330}px;font:800 46px Poppins,sans-serif;color:#fff;-webkit-text-stroke:5px #121212;paint-order:stroke fill;text-shadow:0 3px 10px rgba(0,0,0,.6)}
    .z{position:absolute;font:800 52px Poppins,sans-serif;color:#fff;-webkit-text-stroke:7px #1a1228;paint-order:stroke fill;text-shadow:0 4px 10px rgba(0,0,0,.55)}
  </style><img src="${img}">${o.caption ? `<div class="capWord${o.key ? ' key' : ''}">${o.caption}</div>` : ''}${o.label ? `<div class="label">${o.label}</div>` : ''}${zs}`;
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  const tmp = path.resolve(path.dirname(out), '_compose.html'); fs.writeFileSync(tmp, html); await p.goto('file://' + tmp); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
  await p.screenshot({ path: out }); await b.close(); fs.unlinkSync(tmp); console.log('wrote', out);
})();
