# Render "The Royal Fool" (3371 frames) into one folder. One page for every frame: inside a transition it draws each
# shot on its own into an image and composes the transition from the two (main19.html), and every capture is retaken
# until two in a row are identical (-Stable), so no half-drawn frame is ever saved.
param([string]$Out = '_render\frames19a', [int]$From = 0, [int]$To = 3370, [string]$List = '')
$ErrorActionPreference = 'Stop'
if ($List) { & "$PSScriptRoot\cdp.ps1" -Page '_render\video\main19.html' -List $List -OutDir $Out -Port 9362 -Gpu -Stable -StableMs 150 }
else { & "$PSScriptRoot\cdp.ps1" -Page '_render\video\main19.html' -From $From -To $To -OutDir $Out -Port 9362 -Gpu -Stable -StableMs 150 }
"done $From-$To"

