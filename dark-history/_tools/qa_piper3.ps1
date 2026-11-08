# QA sheets for "The Pied Piper" third cut: every transition (every 3rd frame), the last 3 s and the loop seam, and the
# whole film every 12 frames. Run after a full pass: .\_tools\qa_piper3.ps1 -Dir _render\frames18a -Out _render\qa18
param([string]$Dir = '_render\frames18a', [string]$Out = '_render\qa18')
$ErrorActionPreference = 'Stop'
Remove-Item $Out -Recurse -Force -ErrorAction SilentlyContinue
$tr = @(@('t01_gate_square', 330, 384), @('t02_square_window', 570, 624), @('t03_window_run', 1052, 1100), @('t04_run_outgate', 1172, 1223),
  @('t05_outgate_hill', 1332, 1386), @('t06_hill_top', 1522, 1571), @('t07_top_three', 1842, 1902), @('t08_three_bed', 2298, 2352),
  @('t09_bed_kids', 2499, 2553), @('t09b_kids_son', 2590, 2640), @('t10_real_reveal', 2673, 2721), @('t11_end_loop', 2799, 2978))
foreach ($t in $tr) {
  $d = Join-Path $Out $t[0]; New-Item -ItemType Directory -Force $d | Out-Null
  $step = if ($t[0] -eq 't11_end_loop') { 6 } else { 3 }
  for ($f = $t[1]; $f -le $t[2]; $f += $step) { $src = Join-Path $Dir ('f{0:D5}.jpg' -f $f); if (Test-Path $src) { Copy-Item $src $d } }
  if ($t[0] -eq 't11_end_loop') { foreach ($f in 0, 6, 12, 18) { $src = Join-Path $Dir ('f{0:D5}.jpg' -f $f); if (Test-Path $src) { Copy-Item $src (Join-Path $d ('z{0:D5}.jpg' -f $f)) } } }
  & "$PSScriptRoot\sheet.ps1" -Dir $d -OutPrefix (Join-Path $d 'sheet') -Cols 6 -Rows 3 -TileW 220 -TileH 391 | Out-Null
}
$all = Join-Path $Out 'all'; New-Item -ItemType Directory -Force $all | Out-Null
for ($f = 0; $f -le 2978; $f += 12) { $src = Join-Path $Dir ('f{0:D5}.jpg' -f $f); if (Test-Path $src) { Copy-Item $src $all } }
& "$PSScriptRoot\sheet.ps1" -Dir $all -OutPrefix (Join-Path $all 'sheet') -Cols 8 -Rows 4 -TileW 165 -TileH 293 | Out-Null
"sheets in $Out"
