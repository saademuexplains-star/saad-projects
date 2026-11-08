# Render "The Cells That Never Died" (2947 frames) into one folder: the normal page for everything, the slow page
# (700 ms wait) for every transition (masks, blur, noise) and for the push into the sepia photograph.
# Long stretches go in chunks of at most 400 frames, each with a fresh Chrome.
param([string]$Out = '_render\frames15a', [int]$From = 0, [int]$To = 2946, [int]$Port = 9362)
$ErrorActionPreference = 'Stop'
New-Item -ItemType Directory -Force $Out | Out-Null
$slow = @(@(120, 157), @(176, 213), @(259, 299), @(476, 520), @(645, 682), @(747, 784), @(852, 889), @(955, 996), @(1054, 1094), @(1230, 1266), @(1320, 1362), @(1489, 1526), @(1663, 1700), @(1980, 2016), @(2096, 2136), @(2204, 2241), @(2354, 2393), @(2522, 2565), @(2629, 2666), @(2764, 2801), @(2840, 2946))
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
  if ($cur -le $a - 1) { Run '_render\video\main15.html' $cur ($a - 1) }
  Run '_render\video\main15slow.html' $a $b
  $cur = $b + 1
}
if ($cur -le $To) { Run '_render\video\main15.html' $cur $To }
"done: $((Get-ChildItem $Out -Filter *.jpg).Count) frames in $Out"
