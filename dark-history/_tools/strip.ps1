param([string]$Dir, [double[]]$Starts, [string]$Out, [int]$N = 9, [double]$Step = 0.1, [int]$TileW = 150, [int]$TileH = 267)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$font = New-Object System.Drawing.Font('Arial', 11, [System.Drawing.FontStyle]::Bold)
$bmp = New-Object System.Drawing.Bitmap ($N * ($TileW + 3)), ($Starts.Count * ($TileH + 3))
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.Clear([System.Drawing.Color]::Black)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
for ($r = 0; $r -lt $Starts.Count; $r++) {
    for ($k = 0; $k -lt $N; $k++) {
        $t = [math]::Round($Starts[$r] + $k * $Step, 2)
        $p = Join-Path $Dir ("t{0:000.00}.jpg" -f $t)
        if (-not (Test-Path $p)) { continue }
        $img = [System.Drawing.Image]::FromFile((Resolve-Path $p).Path)
        $x = $k * ($TileW + 3); $y = $r * ($TileH + 3)
        $g.DrawImage($img, $x, $y, $TileW, $TileH); $img.Dispose()
        $g.FillRectangle([System.Drawing.Brushes]::Black, $x, $y, 44, 17)
        $g.DrawString(("{0:0.0}" -f $t), $font, [System.Drawing.Brushes]::Yellow, $x + 1, $y + 1)
    }
}
$g.Dispose(); $bmp.Save($Out, [System.Drawing.Imaging.ImageFormat]::Jpeg); $bmp.Dispose()
"wrote $Out"
