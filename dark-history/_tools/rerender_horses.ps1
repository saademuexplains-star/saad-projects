# Re-render every frame with a horse in it (after the neck fix), twice, into two folders for the two-pass diff.
# The loop transition (3380+) uses the slow page, which renders it without raster glitches.
param([string[]]$Out = @('_render\frames11r', '_render\frames11s'))
$ErrorActionPreference = 'Stop'
foreach ($o in $Out) {
  foreach ($r in @(@(264, 564, 'main11'), @(732, 1896, 'main11'), @(2676, 3379, 'main11'), @(3380, 3453, 'main11slow'))) {
    & "$PSScriptRoot\cdp.ps1" -Page "_render\video\$($r[2]).html" -From $r[0] -To $r[1] -OutDir $o -Port 9362 -Gpu
  }
}
