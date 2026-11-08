# Track a red marker (the book's capital, a coat, a shield) across consecutive frames: its centre and its size per frame,
# with the frame-to-frame changes. A smooth camera gives smooth numbers; a prop that vibrates shows up as jumps and
# back-and-forth flips in the size or the position, which the eye sees long before a contact sheet does.
# .\_tools\trackred.ps1 -Dir _render\frames20a -From 2400 -To 2460 -X 200 -Y 850 -W 800 -H 480 [-Show]
param([string]$Dir, [int]$From, [int]$To, [int]$X, [int]$Y, [int]$W, [int]$H, [int]$Min = 28, [switch]$Show)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
if (-not ('RedTrack' -as [type])) {
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System; using System.Drawing; using System.Drawing.Imaging; using System.Runtime.InteropServices;
public static class RedTrack {
  // weighted centre and spread of the pixels where red stands clear of green and blue, inside the box
  public static double[] Measure(string path, int X, int Y, int W, int H, int min) {
    using (var b = (Bitmap)Image.FromFile(path)) {
      var d = b.LockBits(new Rectangle(X, Y, W, H), ImageLockMode.ReadOnly, PixelFormat.Format24bppRgb);
      var row = new byte[d.Stride]; double s = 0, sx = 0, sy = 0, sxx = 0, syy = 0;
      for (int j = 0; j < H; j++) { Marshal.Copy(d.Scan0 + j * d.Stride, row, 0, d.Stride);
        for (int i = 0; i < W; i++) { int bl = row[i * 3], g = row[i * 3 + 1], r = row[i * 3 + 2], v = r - Math.Max(g, bl); if (v < min) continue; double k = v; s += k; sx += k * i; sy += k * j; sxx += k * i * i; syy += k * j * j; } }
      b.UnlockBits(d);
      if (s <= 0) return new double[] { 0, 0, 0, 0 };
      double cx = sx / s, cy = sy / s;
      return new double[] { X + cx, Y + cy, Math.Sqrt(Math.Max(0, sxx / s - cx * cx)), Math.Sqrt(Math.Max(0, syy / s - cy * cy)) };
    }
  }
}
'@
}
$prev = $null; $rows = @(); $dS = @(); $flip = 0; $last = 0
for ($f = $From; $f -le $To; $f++) {
  $m = [RedTrack]::Measure((Resolve-Path (Join-Path $Dir ('f{0:D5}.jpg' -f $f))).Path, $X, $Y, $W, $H, $Min)
  if ($prev) {
    $dsx = ($m[2] - $prev[2]) / [math]::Max(1, $prev[2]) * 100; $dx = $m[0] - $prev[0]; $dy = $m[1] - $prev[1]
    $dS += [math]::Abs($dsx)
    if ($dsx * $last -lt 0 -and [math]::Abs($dsx) -gt 0.15 -and [math]::Abs($last) -gt 0.15) { $flip++ }
    $last = $dsx
    $rows += ('{0} cx {1:0.00} cy {2:0.00} dx {3,6:0.00} dy {4,6:0.00} size {5:0.00} dsize% {6,6:0.00}' -f $f, $m[0], $m[1], $dx, $dy, $m[2], $dsx)
  }
  $prev = $m
}
if ($Show) { $rows }
$avg = ($dS | Measure-Object -Average).Average; $max = ($dS | Measure-Object -Maximum).Maximum
'{0} frames: size change per frame avg {1:0.00}% max {2:0.00}%, back-and-forth flips {3}' -f $dS.Count, $avg, $max, $flip
