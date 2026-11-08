# Contact sheet of a frame range: -From..-To every -Step frames of a render folder (optionally a crop -Crop x,y,w,h of
# each frame, scaled into the tile), labelled with frame numbers.
param([string]$Dir, [int]$From, [int]$To, [int]$Step = 1, [string]$Out, [int]$Cols = 6, [int]$TileW = 240, [int]$TileH = 427, [string]$Crop = '')
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$fr = @(); for ($i = $From; $i -le $To; $i += $Step) { $p = Join-Path $Dir ("f{0:00000}.jpg" -f $i); if (Test-Path $p) { $fr += , @($i, $p) } }
$rows = [Math]::Ceiling($fr.Count / $Cols)
$bmp = New-Object System.Drawing.Bitmap ($Cols * $TileW), ($rows * $TileH)
$g = [System.Drawing.Graphics]::FromImage($bmp); $g.Clear([System.Drawing.Color]::Black); $g.InterpolationMode = 'HighQualityBicubic'
$font = New-Object System.Drawing.Font('Arial', 12, [System.Drawing.FontStyle]::Bold)
$cr = if ($Crop) { $c = $Crop -split ',' | ForEach-Object { [int]$_ }; New-Object System.Drawing.Rectangle $c[0], $c[1], $c[2], $c[3] } else { $null }
for ($k = 0; $k -lt $fr.Count; $k++) {
  $im = [System.Drawing.Image]::FromFile($fr[$k][1])
  $dst = New-Object System.Drawing.Rectangle (($k % $Cols) * $TileW), ([Math]::Floor($k / $Cols) * $TileH), $TileW, $TileH
  if ($cr) { $g.DrawImage($im, $dst, $cr, [System.Drawing.GraphicsUnit]::Pixel) } else { $g.DrawImage($im, $dst) }
  $im.Dispose()
  $g.FillRectangle([System.Drawing.Brushes]::Black, $dst.X, $dst.Y, 44, 17); $g.DrawString([string]$fr[$k][0], $font, [System.Drawing.Brushes]::Yellow, $dst.X + 1, $dst.Y + 1)
}
$enc = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$ep = New-Object System.Drawing.Imaging.EncoderParameters 1; $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), 88L
$bmp.Save($Out, $enc, $ep); $g.Dispose(); $bmp.Dispose()
"$Out : $($fr.Count) frames"
