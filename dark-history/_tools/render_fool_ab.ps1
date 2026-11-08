# both passes, one after the other (one Chrome at a time)
param([int]$FromA = 0, [int]$FromB = 0)
& "$PSScriptRoot\render_fool.ps1" -Out '_render\frames19a' -From $FromA
& "$PSScriptRoot\render_fool.ps1" -Out '_render\frames19b' -From $FromB
"both passes done"
