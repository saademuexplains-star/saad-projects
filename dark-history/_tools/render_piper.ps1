# Render "The Pied Piper" (2979 frames) into one folder: the normal page for everything, the slow page (700 ms wait)
# for every transition (masks, blur, noise) and for the gate close-up, where the street behind him is blurred.
# Long stretches go in chunks of at most 400 frames, each with a fresh Chrome.
param([string]$Out = '_render\frames16a', [int]$From = 0, [int]$To = 2978, [int]$Port = 9362)
$ErrorActionPreference = 'Stop'
New-Item -ItemType Directory -Force $Out | Out-Null
$slow = @(@(150, 390), @(570, 607), @(705, 742), @(1086, 1122), @(1330, 1367), @(1524, 1560), @(1852, 1889), @(2303, 2339), @(2501, 2537), @(2675, 2712), @(2941, 2978))
function Run($page, $a, $b) {
  for ($s = $a; $s -le $b; $s += 400) {
    $e = [Math]::Min($b, $s + 399)
    for ($try = 0; $try -lt 3; $try++) {
      try { & "$PSScriptRoot\cdp.ps1" -Page $page -From $s -To $e -OutDir $Out -Port $Port -Gpu | Select-Object -Last 1; break }
      catch { "retry $s-$e ($try): $($_.Exception.Message)" }
    }
  }
}
$cur = $From
foreach ($sl in $slow) {
  if ($sl[1] -lt $From -or $sl[0] -gt $To) { continue }
  $a = [Math]::Max($sl[0], $From); $b = [Math]::Min($sl[1], $To)
  if ($cur -le $a - 1) { Run '_render\video\main16.html' $cur ($a - 1) }
  Run '_render\video\main16slow.html' $a $b
  $cur = $b + 1
}
if ($cur -le $To) { Run '_render\video\main16.html' $cur $To }
"done: $((Get-ChildItem $Out -Filter *.jpg).Count) frames in $Out"
