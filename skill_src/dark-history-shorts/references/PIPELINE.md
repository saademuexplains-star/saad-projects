# Pipeline: commands for every step

Run everything from the project root (the folder that holds `_render` and `_tools`), in Windows PowerShell 5.1. Use **absolute paths** for anything a .NET or WinRT API opens (the WAV tools, `towavhq`, `probe`). Relative paths there resolve against the wrong directory.

Example names below use video number 5; substitute your own.

## 1. Voiceover

```powershell
New-Item -ItemType Directory -Force _vo5 | Out-Null
Copy-Item "C:\Users\<user>\Downloads\<elevenlabs file>.mp3" _vo5\vo.mp3
# the user's script, verbatim
Set-Content _vo5\script.txt -Encoding utf8 -Value '<script text>'
$root = (Get-Location).Path
& .\_tools\towavhq.ps1 -Src "$root\_vo5\vo.mp3" -OutDir "$root\_vo5" -OutName vo_hq.wav
# trim the lead-in, the tail and only pauses over 0.6 s (to 0.5 s): KEEP the narrator's own pauses - cut to 0.11 s the
# voice sounded "too rigid" (FEEDBACK_LOG 2026-11-09). Linux: python3 -I _tools/audiotool.py trim in.wav out.wav --maxgap 0.5 --mingap 0.6
& .\_tools\audiotool.ps1 -Mode trim -In "$root\_vo5\vo_hq.wav" -Out "$root\_vo5\vo_tight.wav" -MaxGap 0.5 -MinGap 0.6
# word times -> words.txt
& .\_tools\align2.ps1 -Wav "$root\_vo5\vo_tight.wav" -ScriptFile _vo5\script.txt -OutFile _vo5\words.txt
```

- Frame count: `frames = ceil(seconds * 60)`, where `seconds = (bytes - 44) / 192000` for 48 kHz stereo 16-bit. The voice must end inside the last frame.
- `words.txt` has one line per script word (`word start end punct`). Header comments list the speech chunks. Recognition is rough, so when times look off, check them against the chunk boundaries and the silences from `audiotool.ps1 -Mode scan`.

## 2. Build the video files

- Copy `_render/video/main4.html` to `main5.html`. Set `window.VIDEO_FRAMES`, and list the libs, casts, props, sets and your new shot files.
- Create:
  - `cast5.js` (new faces)
  - `props5.js` / `sets8.js` (new objects and worlds)
  - `shots_f.js` (+ `shots_f2.js`)
- Copy the helper header at the top of `shots_e.js`. It exports `G.SHOTS_E`, which later files reuse.
- Preview single frames in the browser pane by opening a test page (`settest6.html`, `casttest4.html` pattern) or by rendering a list of frames (step 3).

## 3. Test frames and contact sheets

```powershell
$ts = @(0.5, 2.0, 3.6)                       # key moments in seconds
$list = ($ts | ForEach-Object { [int][math]::Round($_ * 60) }) -join ','
& .\_tools\cdp.ps1 -Page _render\video\main5.html -List $list -OutDir _render\test5 -Port 9362 -Gpu
& .\_tools\sheet.ps1 -Dir _render\test5 -OutPrefix "$env:TEMP\t5" -Cols 8 -Rows 2 -TileW 176 -TileH 313
```

- Then Read the sheet images, and the important frames at full size.
- `sheet.ps1` tiles every JPEG in a folder. To sheet chosen frames from a full render, copy them into a temp folder first.

## 4. Full render (one renderer only)

```powershell
& .\_tools\cdp.ps1 -Page _render\video\main5.html -From 0 -To <frames-1> -OutDir _render\frames5 -Port 9362 -Gpu
```

- Run it in the background. It takes roughly 0.3–0.9 s per frame.
- Re-rendering a range (`-From/-To` or `-List`) overwrites just those frames in the same folder.
- `cdp.ps1` starts its own headless Chrome (profile `%TEMP%\cdp_prof_<port>`) and kills only that one, never the user's Chrome.
- **Never run two renderers at once.** It causes raster glitches.
- **Raster transition windows on the CPU** (drop `-Gpu` for those ranges; `render_fool.ps1` does it with the slow
  page). Two heavy shots in one frame can make the GPU rasteriser drop whole layers in rectangular blocks, different on
  every run (The Royal Fool's burning fleet). About 3.7 s per frame on the CPU, so only the transition windows.
- Keep each shot's offscreen surfaces few. Every mask, filter, blend mode and group opacity is one. Use gradient fills
  in place of blurs, one shared filter in place of one per item, and filter regions bounded to the frame rather than
  the content's bounding box.

## 5. QA

```powershell
# must print nothing
& .\_tools\glitch.ps1 -Dir _render\frames5 -Count <frames>
# spikes: frame(diff/median)
& .\_tools\scan.ps1 -Dir _render\frames5 -Count <frames>
# after a re-render: which frames changed
& .\_tools\cmpdir.ps1 -A <old> -B <new>
```

- **Second pass (mandatory):** render the whole film again into another folder and compare. Any frame that differs between the two passes is a raster glitch; re-render those frames (`-List`) until two passes agree.

```powershell
& .\_tools\cdp.ps1 -Page _render\video\main5.html -From 0 -To <frames-1> -OutDir _render\frames5b -Port 9362 -Gpu
& .\_tools\cmpdir.ps1 -A _render\frames5 -B _render\frames5b
```

- In each page's `renderFrame`, wait 4 animation frames plus 120 ms (heavy frames need it).
- For every spike, look at the surrounding frames (copy them, then sheet them).
- Typical causes:
  - a shot's `t1` overlapping past its transition
  - a transition curve with non-zero slope at its ends
  - a light preset switching on screen
  - eyelid or flash effects (fine if smooth)
- Fix, re-render that window, and re-scan.

## 6. ElevenLabs music, ambience and SFX

Tools come from the ElevenLabs connector (load them with ToolSearch if they're deferred).

1. **Create a flow:** `creative_create_flow`. The old flow id belongs to another account.
2. **Add one node per sound:** `creative_add_flow_node` with:
   - `node_type: 'sfx'`, `model_id: 'eleven_text_to_sound_v2'`
   - a descriptive prompt
   - `model_parameters: { duration_seconds, prompt_influence: 0.6, loop }`

   | Kind | Duration | `loop` |
   |---|---|---|
   | Music cue | 14–30 s | true for beds |
   | Ambience | 5–8 s | true |
   | One-shot | 0.6–3 s | false |
3. **Run them:** `creative_run_flow_nodes` with `node_ids` (at most 20 per call; a 429 means wait for the previous batch) and `generations_count: 1`.
4. **Collect the links:** `creative_get_flow_run_status` with `flow_id` and the returned `session_ids`. If the result is too large, the harness saves it to a file (read it with a `\\?\` long-path prefix). Otherwise write the `generations` (prompt, status, `content_url`) into a JSON file yourself.
5. **Download:** copy `_tools/fetch_worm.ps1` to `fetch_<name>.ps1`, replace its prompt-substring → key map (`wm*` music, `wa*` ambience, `ws*` SFX), then:

```powershell
& .\_tools\fetch_<name>.ps1 -Json <status.json> -OutDir _sfx5
$wav = Join-Path (Get-Location) '_sfx5\wav'; New-Item -ItemType Directory -Force $wav | Out-Null
Get-ChildItem _sfx5\mp3 -Filter *.mp3 | ForEach-Object {
  & .\_tools\towavhq.ps1 -Src $_.FullName -OutDir $wav -OutName "$($_.BaseName).wav" | Out-Null
}
```

Prompt examples that worked:
- **Music:**
  - "Ancient Middle Eastern cinematic underscore: slow oud melody over low frame drums…"
  - "Horror tension music build: dark low strings, pulsing heartbeat…"
  - "Emotional cinematic resolution music: warm strings and soft…"
- **Ambience:**
  - "Ancient bustling bazaar ambience…"
  - "Inside the human body: deep muffled heartbeat, gurgling fluids and a low organic rumble"
  - "Underwater river ambience…"
- **SFX:**
  - "Red-hot branding iron pressed onto skin, intense sizzle and hiss with steam"
  - "One sharp loud slap of a hand hitting a wet wrist"
  - "Wet rubbery snap like a stretched elastic tearing apart, with a low thud"
  - "Huge cinematic final impact hit with a long deep boom tail"
  - "Very short swift air whoosh for a fast camera pan"
  - "Man grunting and straining…"

## 7. Mix

- Copy `_tools/mix_worm.ps1` (real ending) or `_tools/mix_taster.ps1` (looping video; it has the music loop-seam crossfade) to `mix_<name>.ps1`.
- Set `-Vo`, `-Dir`, `-OutDir`, `-Frames` and the output names. Write the arrangement:
  - **`$music`:** `E key t gain @{ Loop, Off, Len, FadeIn, FadeOut, AutoT = [double[]](...), AutoG = [double[]](...) }`. Use `Off` to skip a cue's silent build, and overlap passes so there are no holes.
  - **`$amb`:** one bed per location, trimmed to the shot times.
  - **`$hits`:** `@('ws19_slap', 26.02, 1.0, 'p')`. Use `'p'` to put the clip's loudest point on the time (impacts, slaps, transitions) or `'s'` to start the clip there.
- Ducking and stems are automatic. Then check:

```powershell
& .\_tools\mix_<name>.ps1
& .\_tools\levels.ps1 -Files _vo5\<name>_voiceover.wav, _vo5\<name>_sfx.wav, _vo5\<name>_music.wav, _vo5\<name>_mix.wav
```

- Look for music holes (below about -36 dB for a second) and fix them with `Off`/`Len`/overlap. Each generated clip's envelope can be checked the same way.
- Target RMS: voice ≈ -19 dB, SFX ≈ -27, music ≈ -28, ambience ≈ -38. Mix peak ≤ 0.97.

## 8. Encode and verify

```powershell
# -OutAvi/-OutMp4 relative to the project root
& .\_tools\avi.ps1 -FramesDir _render\frames5 -Wav _vo5\<name>_mix.wav -OutAvi _render\<name>.avi -OutMp4 <name>.mp4 -Fps 60 -Kbps 20000
# expect 1080x1920, fps=60/1, audioTracks=1
& .\_tools\probe.ps1 (Join-Path (Get-Location) '<name>.mp4')
& .\_tools\towavhq.ps1 -Src (Join-Path (Get-Location) '<name>.mp4') -OutDir $env:TEMP -OutName dec.wav
# expect offset within ±5 ms and correlation > 0.99
& .\_tools\synccheck.ps1 -Ref _vo5\<name>_mix.wav -Test "$env:TEMP\dec.wav"
```

- Copy the stems next to the MP4 as `<name>_voiceover.wav`, `<name>_sfx.wav` and `<name>_music.wav`. Delete the big AVI.
- Send all four files with SendUserFile.

## PowerShell gotchas

- Variable names are case-insensitive (`$s` and `$S` are the same variable).
- Paths over 260 characters need the `\\?\` prefix with `-LiteralPath`.
- `Add-Type` classes persist only within one PowerShell process, so keep C# helpers inside script files.
- Write text files with `[IO.File]::WriteAllText(path, text, (New-Object Text.UTF8Encoding $false))` to avoid BOM and encoding surprises.
- When splicing a block into a file, check that the block you read is non-empty before writing, and keep a `.bak`.

## Linux cloud sessions (no PowerShell)

Claude Code on the web runs in a Linux container with Node, Python, ffmpeg and a preinstalled Chromium + Playwright.
- Frames: `node _tools/cdp.cjs --page _render/video/<page>.html --list 30,90,150 --out _render/<dir> --quality 98`
  (or `--from 0 --to <frames-1>`; `--stable`, `--sync`, `--query`). Same `window.READY` / `renderFrame(n)` contract and
  `f00000.jpg` names as `cdp.ps1`; rasterised on the CPU.
- Sheets and crops: `python3 -I _tools/sheet.py --dir <frames> --out <jpg> --cols 4 --tile 270x480 [--frames 30,90]`,
  `python3 -I _tools/sheet.py --crop <jpg> --box x0,y0,x1,y1 --out <jpg> --scale 2`.
- Close review of hair and hands: render the page in Playwright with `deviceScaleFactor: 2.5` and clip the heads and
  hands (`page.screenshot({ clip })`).
- The VO, mixing and encoding scripts are PowerShell + Windows APIs; port them with ffmpeg when a video is made there.
