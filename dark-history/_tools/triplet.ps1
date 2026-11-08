# Look at what changes around frame N: frames N-1, N, N+1 side by side and the difference images |N - (N-1)| and
# |(N+1) - N| amplified (x4), optionally cropped (-Crop x,y,w,h in 1080x1920 pixels). One row per frame in -N (comma list).
param([string]$Dir, [string]$Frames, [string]$Out, [string]$Crop = '0,0,1080,1920', [int]$TileH = 420, [string]$DirB = '')
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
if (-not ('Trip' -as [type])) {
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @"
using System; using System.Drawing; using System.Drawing.Imaging; using System.Runtime.InteropServices;
public static class Trip {
  public static Bitmap Diff(Bitmap a, Bitmap b, int k) {
    int W = a.Width, H = a.Height; var o = new Bitmap(W, H, PixelFormat.Format24bppRgb);
    var da = a.LockBits(new Rectangle(0, 0, W, H), ImageLockMode.ReadOnly, PixelFormat.Format24bppRgb);
    var db = b.LockBits(new Rectangle(0, 0, W, H), ImageLockMode.ReadOnly, PixelFormat.Format24bppRgb);
    var dd = o.LockBits(new Rectangle(0, 0, W, H), ImageLockMode.WriteOnly, PixelFormat.Format24bppRgb);
    int st = da.Stride; var ra = new byte[st * H]; var rb = new byte[st * H]; var ro = new byte[st * H];
    Marshal.Copy(da.Scan0, ra, 0, ra.Length); Marshal.Copy(db.Scan0, rb, 0, rb.Length);
    for (int i = 0; i < ra.Length; i++) { int v = Math.Abs(ra[i] - rb[i]) * k; ro[i] = (byte)(v > 255 ? 255 : v); }
    Marshal.Copy(ro, 0, dd.Scan0, ro.Length); a.UnlockBits(da); b.UnlockBits(db); o.UnlockBits(dd); return o;
  }
}
"@
}
$c = $Crop -split ',' | ForEach-Object { [int]$_ }; $cr = New-Object System.Drawing.Rectangle $c[0], $c[1], $c[2], $c[3]
$tw = [int]($TileH * $c[2] / $c[3]); $ns = $Frames -split ',' | ForEach-Object { [int]$_ }
$bmp = New-Object System.Drawing.Bitmap ($tw * 5), ($TileH * $ns.Count)
$g = [System.Drawing.Graphics]::FromImage($bmp); $g.Clear([System.Drawing.Color]::Black); $g.InterpolationMode = 'HighQualityBicubic'
$font = New-Object System.Drawing.Font('Arial', 12, [System.Drawing.FontStyle]::Bold)
$row = 0
foreach ($fn in $ns) { $n = [int]$fn
  $load = { param([int]$fi) $p = Join-Path $Dir ('f' + $fi.ToString('00000') + '.jpg'); $im = [System.Drawing.Bitmap]::FromFile($p); $cp = $im.Clone($cr, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb); $im.Dispose(); $cp }
  $a = & $load ($n - 1); $b = & $load $n; $d = & $load ($n + 1)
  if ($DirB) { $p = Join-Path $DirB ('f' + ([int]$n).ToString('00000') + '.jpg'); $im = [System.Drawing.Bitmap]::FromFile($p); $d = $im.Clone($cr, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb); $im.Dispose() }
  $x1 = [Trip]::Diff($a, $b, 4); $x2 = [Trip]::Diff($b, $d, 4)
  $k = 0; foreach ($im in @($a, $b, $d, $x1, $x2)) { $g.DrawImage($im, (New-Object System.Drawing.Rectangle ($k * $tw), ($row * $TileH), $tw, $TileH)); $k++ }
  $lab = if ($DirB) { "$n  (A n-1, A n, B n, |An-An-1|, |Bn-An|)" } else { "$($n-1) / $n / $($n+1)  diffs" }
  $g.FillRectangle([System.Drawing.Brushes]::Black, 0, $row * $TileH, 360, 17); $g.DrawString($lab, $font, [System.Drawing.Brushes]::Yellow, 1, $row * $TileH + 1)
  foreach ($im in @($a, $b, $d, $x1, $x2)) { $im.Dispose() }
  $row++
}
$enc = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$ep = New-Object System.Drawing.Imaging.EncoderParameters 1; $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), 88L
$bmp.Save($Out, $enc, $ep); $g.Dispose(); $bmp.Dispose(); "$Out"

