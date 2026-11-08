# Find render glitches: a frame that differs from BOTH neighbours while the neighbours agree with each other.
param([string]$Dir, [int]$Count, [double]$K = 2.2, [double]$Min = 3.0)
Add-Type -AssemblyName System.Drawing
if (-not ('GlitchScan' -as [type])) {
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System; using System.Drawing; using System.Drawing.Imaging; using System.Collections.Generic;
public static class GlitchScan {
  static float[] Load(string p) { using (var b0 = (Bitmap)Image.FromFile(p)) using (var b = new Bitmap(b0, new Size(135, 240))) {
    var d = b.LockBits(new Rectangle(0, 0, 135, 240), ImageLockMode.ReadOnly, PixelFormat.Format24bppRgb); var a = new float[135 * 240]; var row = new byte[d.Stride];
    for (int y = 0; y < 240; y++) { System.Runtime.InteropServices.Marshal.Copy(d.Scan0 + y * d.Stride, row, 0, d.Stride); for (int x = 0; x < 135; x++) a[y * 135 + x] = (row[x * 3] + row[x * 3 + 1] + row[x * 3 + 2]) / 3f; }
    b.UnlockBits(d); return a; } }
  static double Diff(float[] a, float[] b) { double s = 0; for (int k = 0; k < a.Length; k++) s += Math.Abs(a[k] - b[k]); return s / a.Length; }
  public static string Run(string dir, int n, double K, double Min) {
    var fr = new float[n][]; for (int i = 0; i < n; i++) fr[i] = Load(string.Format("{0}\\f{1:00000}.jpg", dir, i));
    var bad = new List<int>();
    for (int i = 0; i < n; i++) {
      var p = fr[(i - 1 + n) % n]; var q = fr[(i + 1) % n];
      double d1 = Diff(p, fr[i]), d2 = Diff(fr[i], q), d0 = Diff(p, q);
      // also catch two-frame glitches: compare against i-2 / i+2
      if (Math.Min(d1, d2) > K * d0 + Min) bad.Add(i);
    }
    return string.Join(",", bad);
  } }
'@
}
[GlitchScan]::Run((Resolve-Path $Dir).Path, $Count, $K, $Min)
