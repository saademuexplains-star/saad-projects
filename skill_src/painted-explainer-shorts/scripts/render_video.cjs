#!/usr/bin/env node
// Render a project page frame by frame and mux it with the voiceover (+ optional SFX track).
//   node render_video.cjs <page.html> <out.mp4> --voice vo.wav [--sfx sfx.wav] [--variant B] [--from 0] [--to DURATION]
// Every frame is a pure function of time, so output is frame-exact and fully synced to the audio.
// Expect ~1-6 s per frame with the finishing filters on; run long renders in the background.
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs'), os = require('os'), path = require('path');
(async () => {
  const [page, out, ...rest] = process.argv.slice(2);
  const arg = n => { const i = rest.indexOf(n); return i >= 0 ? rest[i + 1] : null; };
  const variant = arg('--variant') || 'B', voice = arg('--voice'), sfx = arg('--sfx');
  const frames = fs.mkdtempSync(path.join(os.tmpdir(), 'frames-'));
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve(page)); await p.evaluate(() => document.fonts.ready);
  const { FPS, DURATION } = await p.evaluate(() => ({ FPS: window.FPS, DURATION: window.DURATION }));
  const from = +(arg('--from') || 0), to = +(arg('--to') || DURATION);
  const total = Math.round((to - from) * FPS);
  const t0 = Date.now();
  for (let f = 0; f < total; f++) {
    await p.evaluate(([t, v]) => window.render(t, v), [from + f / FPS, variant]);
    await p.screenshot({ path: path.join(frames, `${String(f).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 95 });
    if (f % 15 === 0) process.stdout.write(`\rframe ${f}/${total}  (${((Date.now() - t0) / 1000 / (f + 1)).toFixed(1)} s/frame)`);
  }
  await b.close();
  if (errs.length) console.error('\nPAGE ERRORS:', errs.slice(0, 5));
  const dur = (to - from).toFixed(3), fadeAt = Math.max(0, to - from - 0.08).toFixed(2); // ffmpeg needs 0.08, not .08
  const args = ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(frames, '%05d.jpg')];
  let filter = null;
  if (voice) {
    args.push('-ss', String(from), '-t', dur, '-i', voice);
    if (sfx) { args.push('-ss', String(from), '-t', dur, '-i', sfx);
      filter = `[1:a]aresample=44100,afade=t=out:st=${fadeAt}:d=0.08[vo];[2:a]aresample=44100,volume=0.55[fx];[vo][fx]amix=inputs=2:normalize=0:duration=first[a]`;
    } else filter = `[1:a]aresample=44100,afade=t=out:st=${fadeAt}:d=0.08[a]`;
  }
  if (filter) args.push('-filter_complex', filter, '-map', '0:v', '-map', '[a]', '-c:a', 'aac', '-b:a', '192k', '-shortest');
  args.push('-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-movflags', '+faststart', out);
  execFileSync('ffmpeg', args, { stdio: 'inherit' });
  fs.rmSync(frames, { recursive: true });
  console.log(`\nwrote ${out} (${total} frames @ ${FPS}fps)`);
})();
