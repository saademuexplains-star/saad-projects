param([string]$Dir, [string]$OutPrefix, [int]$Cols = 6, [int]$Rows = 2, [int]$TileW = 240, [int]$TileH = 427)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$files = @(Get-ChildItem "$Dir\*.jpg" | Sort-Object Name)
$per = $Cols * $Rows
$font = New-Object System.Drawing.Font('Arial', 14, [System.Drawing.FontStyle]::Bold)
$sheetNo = 0
for ($i = 0; $i -lt $files.Count; $i += $per) {
    $sheetNo++
    $bmp = New-Object System.Drawing.Bitmap ($Cols * ($TileW + 4)), ($Rows * ($TileH + 4))
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.Clear([System.Drawing.Color]::Black)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    for ($k = 0; $k -lt $per -and ($i + $k) -lt $files.Count; $k++) {
        $f = $files[$i + $k]
        $img = [System.Drawing.Image]::FromFile($f.FullName)
        $x = ($k % $Cols) * ($TileW + 4); $y = [math]::Floor($k / $Cols) * ($TileH + 4)
        $g.DrawImage($img, $x, $y, $TileW, $TileH)
        $img.Dispose()
        $label = $f.BaseName.Substring(1).TrimStart('0'); if ($label.StartsWith('.')) { $label = '0' + $label }
        $g.FillRectangle([System.Drawing.Brushes]::Black, $x, $y, 62, 22)
        $g.DrawString($label + 's', $font, [System.Drawing.Brushes]::Yellow, $x + 2, $y + 1)
    }
    $g.Dispose()
    $bmp.Save(("{0}_{1:00}.jpg" -f $OutPrefix, $sheetNo), [System.Drawing.Imaging.ImageFormat]::Jpeg)
    $bmp.Dispose()
}
"$OutPrefix : $sheetNo sheets"
