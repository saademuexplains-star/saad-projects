# Patch pass A where the code changed after it was rendered (the sickbed, the begging hands, the three transitions that
# had not registered), then render pass B in full for the two-pass diff.
$ErrorActionPreference = 'Stop'
foreach ($r in @(@(1161, 1635), @(2016, 2100), @(2376, 2424), @(2622, 2670), @(2760, 2813))) {
  & "$PSScriptRoot\render_calf.ps1" -Out '_render\frames12a' -From $r[0] -To $r[1]
}
& "$PSScriptRoot\render_calf.ps1" -Out '_render\frames12b'
