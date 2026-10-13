// bg.js — pre-rendered, softly blurred backgrounds (depth of field like the reference).
// Each canvas is (W+2M) x (H+2M); draw it at (-M,-M) in world coordinates so camera moves never show an edge.
'use strict';
const M = 200;
const BGS = {};

const PALS = {
  day: { sky: ['#5fb0ee', '#a9d8f5', '#eaf4ef'], mount: '#9db8d2', hill: '#86ad5c', hill2: '#5f8a43', lawn: ['#8fc257', '#5f9a3a'], ground: ['#e6cd9a', '#c39a62'], stone: 'rgba(110,80,40,.28)',
    houses: ['#eab86c', '#e8917a', '#f2e0b0', '#b9cf93', '#e6aa92', '#d9c28f'], roof: '#c25a3a', tint: null },
  war: { sky: ['#e9873f', '#f3b15f', '#f8dca0'], mount: '#b98a6a', hill: '#9a8a4c', hill2: '#7a6a3a', lawn: ['#a5993f', '#7d7330'], ground: ['#cf9a55', '#a8723a'], stone: 'rgba(90,50,20,.3)',
    houses: ['#d99a6a', '#c97a62', '#e0c08a', '#a9a878', '#c98c78', '#cdb07a'], roof: '#a84a30', tint: 'rgba(255,120,40,.10)' },
  after: { sky: ['#4a4a78', '#b8788a', '#f0b890'], mount: '#7a6a8a', hill: '#6c6a58', hill2: '#4e5040', lawn: ['#6f7a46', '#4d5a32'], ground: ['#a88660', '#7e5e40'], stone: 'rgba(50,30,20,.3)',
    houses: ['#9a7a78', '#8a6a70', '#a89080', '#7e8a70', '#957068', '#a08a70'], roof: '#6e3a30', tint: 'rgba(60,30,90,.10)' },
  gold: { sky: ['#f4a742', '#fbd37a', '#fff0c4'], mount: '#d3a579', hill: '#a9b45a', hill2: '#7e9440', lawn: ['#b5c45c', '#7d9a40'], ground: ['#efd29a', '#cfa062'], stone: 'rgba(120,70,20,.28)',
    houses: ['#f2c07a', '#ec9b72', '#f7e2b4', '#c8d494', '#eeb094', '#e8cf94'], roof: '#c8603a', tint: 'rgba(255,190,70,.12)' },
};

function makeBg(kind, { houses = true, tower = true, horizon = 1160 } = {}) {
  const key = kind + houses + tower + horizon; if (BGS[key]) return BGS[key];
  const P = PALS[kind], cw = W + 2 * M, ch = H + 2 * M;
  const raw = document.createElement('canvas'); raw.width = cw; raw.height = ch; const g = raw.getContext('2d');
  g.translate(M, M);
  // sky
  g.fillStyle = vgrad(g, -M, horizon, P.sky); g.fillRect(-M, -M, cw, horizon + M + 10);
  // distant mountains
  g.fillStyle = P.mount; g.beginPath(); g.moveTo(-M, horizon - 40);
  [[-80, 800], [60, 930], [220, 760], [380, 920], [560, 830], [740, 940], [930, 790], [1100, 900], [1300, 820]].forEach(([x, y]) => g.lineTo(x, y + (horizon - 1160)));
  g.lineTo(1300, horizon); g.lineTo(-M, horizon); g.fill();
  g.fillStyle = rgba('#ffffff', .25); g.fillRect(-M, horizon - 120, cw, 120);
  // hills
  g.fillStyle = P.hill; g.beginPath(); g.moveTo(-M, horizon - 20); g.bezierCurveTo(100, horizon - 200, 380, horizon - 130, 560, horizon - 60); g.bezierCurveTo(760, horizon - 190, 1000, horizon - 170, 1300, horizon - 40); g.lineTo(1300, horizon + 40); g.lineTo(-M, horizon + 40); g.fill();
  g.fillStyle = P.hill2; g.beginPath(); g.moveTo(-M, horizon + 10); g.bezierCurveTo(120, horizon - 90, 420, horizon - 40, 640, horizon + 4); g.bezierCurveTo(860, horizon - 70, 1080, horizon - 40, 1300, horizon + 10); g.lineTo(1300, horizon + 60); g.lineTo(-M, horizon + 60); g.fill();
  const rr = srand(5);
  for (let i = 0; i < 9; i++) drawCypress(g, -40 + i * 140 + rr() * 60, horizon - 20 + rr() * 30, 150 + rr() * 90, 34 + rr() * 14);
  // small tower on the skyline
  if (tower) { g.save(); g.translate(880, horizon - 20); drawTower(g, { s: .34 }); g.restore(); }
  // houses
  if (houses) {
    const ws = [170, 220, 160, 240, 190, 210, 180], hs = [300, 390, 270, 430, 340, 300, 360]; let x = -90;
    for (let i = 0; i < ws.length; i++) { drawHouse(g, x, horizon + 30, ws[i], hs[i], P.houses[i % P.houses.length], P.roof, i + 3); x += ws[i] + 6 + rr() * 8; }
  }
  // lawn strip + plaza
  g.fillStyle = vgrad(g, horizon + 10, horizon + 150, P.lawn); g.fillRect(-M, horizon + 10, cw, 150);
  g.fillStyle = vgrad(g, horizon + 130, H + M, P.ground); g.fillRect(-M, horizon + 130, cw, H + M - horizon - 130);
  // cobbles in perspective
  g.strokeStyle = P.stone; g.lineWidth = 4;
  const rc = srand(11); let y = horizon + 150;
  for (let row = 0; y < H + M; row++) {
    const h = 30 + row * 8; g.beginPath(); g.moveTo(-M, y); g.lineTo(W + M, y); g.stroke();
    for (let x = -M + (row % 2) * 55; x < W + M; x += 110 + row * 4) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + (rc() - .5) * 10, y + h); g.stroke(); }
    y += h;
  }
  // lawn edge shadow
  g.fillStyle = 'rgba(40,60,20,.25)'; g.fillRect(-M, horizon + 150, cw, 14);
  // blur (depth of field) + tint
  const out = document.createElement('canvas'); out.width = cw; out.height = ch; const o = out.getContext('2d');
  o.filter = 'blur(9px)'; o.drawImage(raw, 0, 0); o.filter = 'none';
  if (P.tint) { o.fillStyle = P.tint; o.fillRect(0, 0, cw, ch); }
  BGS[key] = out; return out;
}
const drawBg = (ctx, c) => ctx.drawImage(c, -M, -M);
