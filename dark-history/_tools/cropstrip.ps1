# Same region cropped from consecutive frames, tiled with frame numbers (to inspect a suspected pop or blink).
# .\_tools\cropstrip.ps1 -Dir _render\frames19a -From 980 -To 991 -X 700 -Y 800 -W 380 -H 300 -Out _render\cs.jpg [-Cols 4] [-Scale 1]
param([string]$Dir, [int]$From, [int]$To, [int]$X, [int]$Y, [int]$W, [int]$H, [string]$Out, [int]$Cols = 4, [double]$Scale = 1)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$n = $To - $From + 1; $rows = [math]::Ceiling($n / $Cols)
$tw = [int]($W * $Scale); $th = [int]($H * $Scale)
$bmp = New-Object System.Drawing.Bitmap ($Cols * ($tw + 4)), ($rows * ($th + 4))
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.Clear([System.Drawing.Color]::Black)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$font = New-Object System.Drawing.Font('Arial', 12, [System.Drawing.FontStyle]::Bold)
for ($i = 0; $i -lt $n; $i++) {
    $f = $From + $i
    $p = Join-Path $Dir ("f{0:00000}.jpg" -f $f)
    if (-not (Test-Path $p)) { continue }
    $img = [System.Drawing.Image]::FromFile((Resolve-Path $p).Path)
    # PowerShell names are case-insensitive: $dx/$dy, not $x/$y, or the source rectangle gets overwritten
    $dx = ($i % $Cols) * ($tw + 4); $dy = [math]::Floor($i / $Cols) * ($th + 4)
    $g.DrawImage($img, (New-Object System.Drawing.Rectangle $dx, $dy, $tw, $th), (New-Object System.Drawing.Rectangle $X, $Y, $W, $H), [System.Drawing.GraphicsUnit]::Pixel)
    $img.Dispose()
    $g.FillRectangle([System.Drawing.Brushes]::Black, $dx, $dy, 46, 19)
    $g.DrawString("$f", $font, [System.Drawing.Brushes]::Yellow, $dx + 1, $dy + 1)
}
$g.Dispose(); $bmp.Save($Out, [System.Drawing.Imaging.ImageFormat]::Jpeg); $bmp.Dispose()
"wrote $Out"
