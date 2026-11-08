# Two-pass raster check: compare every frame of -B with the same frame in -A at 270x480 and report frames where any
# 8x8 block differs by more than -Thr (mean abs RGB). A raster tile glitch shows up as a block of large difference even
# when the whole-frame average barely moves; identical renders give 0 everywhere.
param([string]$A, [string]$B, [double]$Thr = 6.0, [int]$From = 0, [int]$To = 999999)
Add-Type -AssemblyName System.Drawing
if (-not ('CmpBlk' -as [type])) {
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System; using System.Drawing; using System.Drawing.Imaging;
public static class CmpBlk {
  const int W = 270, H = 480, K = 8;
  static byte[] Px(string p, out int stride) { using (var b0 = (Bitmap)Image.FromFile(p)) using (var b = new Bitmap(b0, new Size(W, H))) { var d = b.LockBits(new Rectangle(0, 0, W, H), ImageLockMode.ReadOnly, PixelFormat.Format24bppRgb); stride = d.Stride; var a = new byte[d.Stride * H]; System.Runtime.InteropServices.Marshal.Copy(d.Scan0, a, 0, a.Length); b.UnlockBits(d); return a; } }
  // returns the largest 8x8 block mean difference and the whole-frame mean
  public static double[] D(string a, string b) {
    int sa, sb; var x = Px(a, out sa); var y = Px(b, out sb); double best = 0, all = 0;
    for (int by = 0; by < H; by += K) for (int bx = 0; bx < W; bx += K) {
      double s = 0; int n = 0;
      for (int j = by; j < Math.Min(H, by + K); j++) for (int i = bx * 3; i < Math.Min(W, bx + K) * 3; i++) { s += Math.Abs(x[j * sa + i] - y[j * sb + i]); n++; }
      all += s; if (s / n > best) best = s / n;
    }
    return new double[] { best, all / (W * H * 3) };
  } }
'@
}
$bad = @(); $n = 0; $worst = 0
foreach ($f in Get-ChildItem $B -Filter *.jpg) {
  $k = [int]$f.BaseName.Substring(1); if ($k -lt $From -or $k -gt $To) { continue }
  $pa = Join-Path (Resolve-Path $A).Path $f.Name; if (-not (Test-Path $pa)) { continue }
  $n++; $d = [CmpBlk]::D($pa, $f.FullName); if ($d[0] -gt $worst) { $worst = $d[0] }
  if ($d[0] -gt $Thr) { $bad += ('{0}({1:0.0})' -f $k, $d[0]) }
}
"compared $n frames; worst block diff {0:0.0}; differ (> $Thr): $($bad.Count) -> $($bad -join ' ')" -f $worst
