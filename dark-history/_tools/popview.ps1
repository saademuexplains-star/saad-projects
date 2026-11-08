# Look at pops.ps1 events: one row per event = the frame with the event boxed, then crops of frames t-1, t, t+1
# around it. Picks the strongest events (at most -PerSec per second of film, from -From to -To) and writes sheets of
# -Rows rows. .\_tools\popview.ps1 -Dir _render\frames18b -Csv _render\pops18b.csv -Out _render\pv [-From 0 -To 2978]
param([string]$Dir, [string]$Csv, [string]$Out, [int]$From = 0, [int]$To = 999999, [int]$PerSec = 2, [int]$Rows = 5, [double]$Min = 0)
Add-Type -AssemblyName System.Drawing
Remove-Item $Out -Recurse -Force -ErrorAction SilentlyContinue; New-Item -ItemType Directory -Force $Out | Out-Null
$ev = Import-Csv $Csv | Where-Object { [int]$_.frame -ge $From -and [int]$_.frame -le $To -and [double]$_.score -ge $Min }
$pick = $ev | Group-Object { [int]([int]$_.frame / 60) } | ForEach-Object { $_.Group | Sort-Object { [double]$_.score } -Descending | Select-Object -First $PerSec } | Sort-Object { [int]$_.frame }
$TW = 200; $TH = 356; $CW = 300; $rowH = 356
$font = New-Object System.Drawing.Font 'Arial', 13, ([System.Drawing.FontStyle]::Bold)
$sheet = $null; $g = $null; $r = 0; $n = 0
$load = { param($k) $p = Join-Path $Dir ('f{0:D5}.jpg' -f $k); if (Test-Path $p) { [System.Drawing.Image]::FromFile((Resolve-Path $p).Path) } else { $null } }
foreach ($e in $pick) {
  if (-not $sheet) { $sheet = New-Object System.Drawing.Bitmap ($TW + 3 * $CW + 12), ($Rows * ($rowH + 4)); $g = [System.Drawing.Graphics]::FromImage($sheet); $g.Clear([System.Drawing.Color]::Black); $r = 0 }
  $t = [int]$e.frame; $x0 = [int]$e.x0; $y0 = [int]$e.y0; $x1 = [int]$e.x1; $y1 = [int]$e.y1
  $cx = ($x0 + $x1) / 2; $cy = ($y0 + $y1) / 2; $side = [Math]::Max(220, [Math]::Max($x1 - $x0, $y1 - $y0) * 1.5)
  $src = New-Object System.Drawing.RectangleF ([float]($cx - $side / 2)), ([float]($cy - $side * 1.19 / 2)), ([float]$side), ([float]($side * 1.19))
  $y = $r * ($rowH + 4)
  $im = & $load $t
  if ($im) { $g.DrawImage($im, 0, $y, $TW, $TH); $sx = $TW / 1080; $g.DrawRectangle((New-Object System.Drawing.Pen ([System.Drawing.Color]::Red), 2), [float]($x0 * $sx), [float]($y + $y0 * $sx), [float](($x1 - $x0) * $sx), [float](($y1 - $y0) * $sx)); $im.Dispose() }
  $i = 0
  foreach ($k in ($t - 1), $t, ($t + 1)) {
    $im = & $load $k
    if ($im) { $g.DrawImage($im, (New-Object System.Drawing.RectangleF ([float]($TW + 4 + $i * $CW)), ([float]$y), ([float]$CW), ([float]$rowH)), $src, [System.Drawing.GraphicsUnit]::Pixel); $im.Dispose() }
    $i++
  }
  $g.DrawString(("{0} {1} {2:N0} ({3:N2}s)" -f $t, $e.kind, [double]$e.score, ($t / 60)), $font, [System.Drawing.Brushes]::Yellow, 2, ($y + 2))
  $r++
  if ($r -ge $Rows) { $n++; $sheet.Save((Join-Path (Resolve-Path $Out).Path ('pv_{0:D2}.jpg' -f $n)), [System.Drawing.Imaging.ImageFormat]::Jpeg); $g.Dispose(); $sheet.Dispose(); $sheet = $null }
}
if ($sheet) { $n++; $sheet.Save((Join-Path (Resolve-Path $Out).Path ('pv_{0:D2}.jpg' -f $n)), [System.Drawing.Imaging.ImageFormat]::Jpeg); $g.Dispose(); $sheet.Dispose() }
"{0} events on {1} sheets in {2}" -f @($pick).Count, $n, $Out
