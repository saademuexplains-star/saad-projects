# Crop a region of an image and scale it up (for close inspection of joints, hands, edges).
# .\_tools\crop.ps1 -In frame.jpg -X 200 -Y 800 -W 400 -H 400 -Out zoom.png [-Scale 2]
param([string]$In, [int]$X, [int]$Y, [int]$W, [int]$H, [string]$Out, [double]$Scale = 2)
Add-Type -AssemblyName System.Drawing
$src = [System.Drawing.Image]::FromFile((Resolve-Path $In))
$ow = [int]($W * $Scale); $oh = [int]($H * $Scale)
$bmp = New-Object System.Drawing.Bitmap $ow, $oh
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($src, (New-Object System.Drawing.Rectangle 0, 0, $ow, $oh), (New-Object System.Drawing.Rectangle $X, $Y, $W, $H), [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose(); $src.Dispose()
$dir = Split-Path -Parent $Out; if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Force $dir | Out-Null }
$bmp.Save($Out, [System.Drawing.Imaging.ImageFormat]::Png); $bmp.Dispose()
