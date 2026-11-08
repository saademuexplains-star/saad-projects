# Resume pass B from where it stopped, then re-render pass A's sickbed (the neighbour moved out of the close-up).
param([int]$From = 319)
$ErrorActionPreference = 'Stop'
& "$PSScriptRoot\render_calf.ps1" -Out '_render\frames12b' -From $From
& "$PSScriptRoot\render_calf.ps1" -Out '_render\frames12a' -From 1161 -To 1635
