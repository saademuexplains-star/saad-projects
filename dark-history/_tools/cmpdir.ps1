# Compare frames present in -B against the same frame numbers in -A; list those that differ (mean abs RGB diff on 135x240).
param([string]$A, [string]$B, [double]$Thr = 1.0)
Add-Type -AssemblyName System.Drawing
if (-not ('CmpImg2' -as [type])) {
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System; using System.Drawing; using System.Drawing.Imaging;
public static class CmpImg2 {
  static byte[] Px(string p) { using (var b0 = (Bitmap)Image.FromFile(p)) using (var b = new Bitmap(b0, new Size(135, 240))) { var d = b.LockBits(new Rectangle(0, 0, 135, 240), ImageLockMode.ReadOnly, PixelFormat.Format24bppRgb); var a = new byte[d.Stride * 240]; System.Runtime.InteropServices.Marshal.Copy(d.Scan0, a, 0, a.Length); b.UnlockBits(d); return a; } }
  public static double D(string a, string b) { var x = Px(a); var y = Px(b); double s = 0; for (int i = 0; i < x.Length; i++) s += Math.Abs(x[i] - y[i]); return s / x.Length; } }
'@
}
$bad = @(); $n = 0
foreach ($f in Get-ChildItem $B -Filter *.jpg) { $n++; $d = [CmpImg2]::D((Join-Path (Resolve-Path $A).Path $f.Name), $f.FullName); if ($d -gt $Thr) { $bad += ('{0}({1:0.0})' -f [int]$f.BaseName.Substring(1), $d) } }
"differs: $($bad.Count) of $n -> $($bad -join ' ')"
