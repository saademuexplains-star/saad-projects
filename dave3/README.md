# Dave the crab — v3 engine

Canvas-based shorts engine: every frame is a pure function of time, rendered in headless Chromium with real
motion blur (6 sub-frames per frame, 180° shutter).

- `lib.js` — helpers (easing, springs, camera, auto-cover backgrounds), cartoon eyes/mouths/props, the **Dave rig**
  (body + 8 knee-bending legs + 2 claws with opening fingers) and **Barbara**.
- `film.js` — the shot list (`SHOTS = [{a, b, draw(ctx, t)}]`).
- `data.js` — word timings for captions (pocketsphinx forced alignment, `tools/align.py`).
- `tools/cutout.py` — white-background removal with defringe (no white edges); `tools/prep_rig.py` splits legs/claws.
- `render.cjs` — `node render.cjs stills OUT 1.0,2.5` or `node render.cjs video FRAMES 0 16.4 4`.

Encode: `ffmpeg -framerate 30 -i work/frames/%05d.jpg -i work/voice_demo.wav -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest out.mp4`
