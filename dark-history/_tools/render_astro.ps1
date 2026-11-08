# Render "The Royal Astrologer" (2676 frames) into one folder: the normal page for everything, the slow page (700 ms
# wait) for the transitions with masks, blur or noise (morph, carry, radial, organic, eyelid, zmatch, rack, the loop push).
# Long stretches go in chunks of at most 400 frames, each with a fresh Chrome (a long session slowed and crashed once).
param([string]$Out = '_render\frames13a', [int]$From = 0, [int]$To = 2675)
$ErrorActionPreference = 'Stop'
New-Item -ItemType Directory -Force $Out | Out-Null
$slow = @(@(465, 501), @(693, 735), @(783, 825), @(1017, 1059), @(1251, 1287), @(1362, 1404), @(2433, 2481), @(2639, 2675))
function Run($page, $a, $b) {
  for ($s = $a; $s -le $b; $s += 400) {
    $e = [Math]::Min($b, $s + 399)
    for ($try = 0; $try -lt 3; $try++) {
      try { & "$PSScriptRoot\cdp.ps1" -Page $page -From $s -To $e -OutDir $Out -Port 9362 -Gpu | Select-Object -Last 1; break }
      catch { "retry $s-$e ($try): $($_.Exception.Message)" }
    }
  }
}
$cur = $From
foreach ($sl in $slow) {
  if ($sl[1] -lt $From -or $sl[0] -gt $To) { continue }
  $a = [Math]::Max($sl[0], $From); $b = [Math]::Min($sl[1], $To)
  if ($cur -le $a - 1) { Run '_render\video\main13.html' $cur ($a - 1) }
  Run '_render\video\main13slow.html' $a $b
  $cur = $b + 1
}
if ($cur -le $To) { Run '_render\video\main13.html' $cur $To }
"done: $((Get-ChildItem $Out -Filter *.jpg).Count) frames in $Out"
