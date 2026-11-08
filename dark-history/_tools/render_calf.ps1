# Render "The Calf's Blood" (2814 frames) into one folder: the normal page for everything, the slow page for the
# heavy noise-mask / displacement transitions (liquid 19.35-20.05, organic 28.3-29.1, the zmatch loop 46.0-46.9).
param([string]$Out = '_render\frames12a', [int]$From = 0, [int]$To = 2813)
$ErrorActionPreference = 'Stop'
$slow = @(@(1161, 1203), @(1698, 1746), @(2760, 2813))
$cur = $From
foreach ($s in $slow) {
  if ($s[1] -lt $From -or $s[0] -gt $To) { continue }
  $a = [Math]::Max($s[0], $From); $b = [Math]::Min($s[1], $To)
  if ($cur -le $a - 1) { & "$PSScriptRoot\cdp.ps1" -Page '_render\video\main12.html' -From $cur -To ($a - 1) -OutDir $Out -Port 9362 -Gpu }
  & "$PSScriptRoot\cdp.ps1" -Page '_render\video\main12slow.html' -From $a -To $b -OutDir $Out -Port 9362 -Gpu
  $cur = $b + 1
}
if ($cur -le $To) { & "$PSScriptRoot\cdp.ps1" -Page '_render\video\main12.html' -From $cur -To $To -OutDir $Out -Port 9362 -Gpu }
