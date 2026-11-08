// Whole-film SVG hash for change detection: NH(a, b) returns comma-separated hashes of frames a..b, with the global uid
// ids renumbered per frame (so the hash does not depend on how many frames the page drew before). Load with jseval.ps1.
window.NH = (A, B) => {
  const h = s => { let h1 = 0xdeadbeef, h2 = 0x41c6ce57; for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i); h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677); } h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909); h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909); return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36); };
  const out = [];
  for (let n = A; n <= B; n++) {
    let s = ENG.svgFrame(n);
    const map = new Map(); let k = 0;
    s = s.replace(/id="([^"]+)"/g, (m, id) => { if (!map.has(id)) map.set(id, 'q' + (k++)); return 'id="' + map.get(id) + '"'; });
    s = s.replace(/url\(#([^)]+)\)/g, (m, id) => 'url(#' + (map.get(id) || id) + ')');
    s = s.replace(/href="#([^"]+)"/g, (m, id) => 'href="#' + (map.get(id) || id) + '"');
    out.push(h(s));
  }
  return out.join(',');
};
'ok'

