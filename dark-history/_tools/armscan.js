// Whole-film arm scan (rig3 window.__HANDLOG: one entry per arm per frame - side, hand angle, elbow and wrist relative
// to the shoulder, tag, sleeve, pose). Arms are matched frame to frame by their order in the frame (same characters,
// same order). Flags an arm whose hand turns more than A deg in one frame, or whose elbow moves more than E units
// beyond what its wrist moved (an elbow that jumps while the hand travels smoothly: a flip of the arm solver).
// Usage: .\_tools\jseval.ps1 -Page _render\video\pick19.html -Exprs (Get-Content _tools\armscan.js -Raw), 'ARMSCAN(0,3370)'
(function () {
  window.ARMSCAN = (from, to, A = 14, E = 30) => {
    const out = []; let prev = null, nFlag = 0;
    for (let n = from; n <= to; n++) {
      window.__HANDLOG = []; ENG.svgFrame(n); const cur = window.__HANDLOG; window.__HANDLOG = null;
      if (prev && prev.length === cur.length) {
        for (let i = 0; i < cur.length; i++) {
          const a = prev[i], b = cur[i]; if (a[0] !== b[0] || a[6] !== b[6]) continue;
          let da = Math.abs(b[1] - a[1]); if (da > 180) da = 360 - da;
          const de = Math.hypot(b[2] - a[2], b[3] - a[3]), dw = Math.hypot(b[4] - a[4], b[5] - a[5]);
          if (da > A || de - dw > E) { nFlag++; out.push(n + ':' + i + b[0] + (b[6] ? '/' + b[6] : '') + ' a' + Math.round(da) + ' e' + Math.round(de) + ' w' + Math.round(dw) + ' ' + b[8]); }
        }
      }
      prev = cur;
    }
    return 'flags ' + nFlag + '\n' + out.join('\n');
  };
  return 'armscan loaded';
})();
