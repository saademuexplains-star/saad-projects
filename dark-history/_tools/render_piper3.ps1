# Render "The Pied Piper" third cut (2979 frames, main18.html) into one folder: the normal page for most frames, the slow
# page (700 ms wait) for every transition (masks, blurs, noise) and for the stretches with depth-of-field blur (your
# street from 13 s, your son at 42-45 s). Long stretches go in chunks of at most 75 frames, each with a fresh Chrome (one Chrome
# session degrades after a few hundred heavy frames and times out).
param([string]$Out = '_render\frames18a', [int]$From = 0, [int]$To = 2978, [int]$Port = 9362)
$ErrorActionPreference = 'Stop'
New-Item -ItemType Directory -Force $Out | Out-Null
$slow = @(@(330, 384), @(570, 624), @(778, 1100), @(1172, 1223), @(1332, 1386), @(1522, 1571), @(1842, 1902), @(2298, 2352), @(2499, 2721), @(2925, 2978))
function Run($page, $a, $b) {
  for ($s = $a; $s -le $b; $s += 75) {
    $e = [Math]::Min($b, $s + 74)
    for ($try = 0; $try -lt 3; $try++) {
      try { & "$PSScriptRoot\cdp.ps1" -Page $page -From $s -To $e -OutDir $Out -Port $Port -Gpu | Select-Object -Last 1; break }
      catch { Write-Host "retry $s-$e ($try): $($_.Exception.Message)" }
    }
  }
}
$cur = $From
foreach ($sl in $slow) {
  if ($sl[1] -lt $From -or $sl[0] -gt $To) { continue }
  $a = [Math]::Max($sl[0], $From); $b = [Math]::Min($sl[1], $To)
  if ($cur -le $a - 1) { Run '_render\video\main18.html' $cur ($a - 1) }
  Run '_render\video\main18slow.html' $a $b
  $cur = $b + 1
}
if ($cur -le $To) { Run '_render\video\main18.html' $cur $To }
"done: $((Get-ChildItem $Out -Filter *.jpg).Count) frames in $Out"