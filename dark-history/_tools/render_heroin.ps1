# Render "The Heroin Bottle" (2655 frames) into one folder: the normal page for everything, the slow page (700 ms
# wait) for the transitions with masks, blur or noise (lens, zmatch, morph, both carries, organic, eyelid, radial,
# the newspaper wipe, rack, the loop push).
# Long stretches go in chunks of at most 400 frames, each with a fresh Chrome (a long session slowed and crashed once).
param([string]$Out = '_render\frames14a', [int]$From = 0, [int]$To = 2654, [int]$Port = 9362)
$ErrorActionPreference = 'Stop'
New-Item -ItemType Directory -Force $Out | Out-Null
$slow = @(@(159, 201), @(345, 381), @(693, 729), @(828, 864), @(915, 951), @(1578, 1614), @(1779, 1815), @(2043, 2079), @(2298, 2334), @(2460, 2502), @(2622, 2654))
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
  if ($cur -le $a - 1) { Run '_render\video\main14.html' $cur ($a - 1) }
  Run '_render\video\main14slow.html' $a $b
  $cur = $b + 1
}
if ($cur -le $To) { Run '_render\video\main14.html' $cur $To }
"done: $((Get-ChildItem $Out -Filter *.jpg).Count) frames in $Out"
