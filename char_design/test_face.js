const L = require('./lib');
const mod = process.argv[2], fn = process.argv[3];
const F = require('./' + mod)[fn];
const doc = new L.Doc(1600, 900);
const exprs = [JSON.parse(process.argv[4] || '{}'), JSON.parse(process.argv[5] || '{}')];
let body = `<rect width="1600" height="900" fill="#7d8a92"/>`;
exprs.forEach((e, i) => {
  body += `<g transform="translate(${330 + i * 800},120) scale(0.68)">${F(doc, e, { sc: +(process.env.SC || 0.19) })}</g>`;
});
require('fs').writeFileSync(process.argv[6] || 'out/face_test.svg', doc.svg(body));
