# Smoothness scan: mean abs frame-to-frame difference (135x240 grey), flags spikes vs. local median, checks the loop seam.
param([string]$Dir, [int]$Count)
Add-Type -AssemblyName System.Drawing
if (-not ('FrameScan' -as [type])) {
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System; using System.Drawing; using System.Drawing.Imaging; using System.Collections.Generic;
public static class FrameScan {
  static float[] Load(string p) { using (var b0 = (Bitmap)Image.FromFile(p)) using (var b = new Bitmap(b0, new Size(135, 240))) {
    var d = b.LockBits(new Rectangle(0, 0, 135, 240), ImageLockMode.ReadOnly, PixelFormat.Format24bppRgb); var a = new float[135 * 240]; var row = new byte[d.Stride];
    for (int y = 0; y < 240; y++) { System.Runtime.InteropServices.Marshal.Copy(d.Scan0 + y * d.Stride, row, 0, d.Stride); for (int x = 0; x < 135; x++) a[y * 135 + x] = (row[x * 3] + row[x * 3 + 1] + row[x * 3 + 2]) / 3f; }
    b.UnlockBits(d); return a; } }
  static double Diff(float[] a, float[] b) { double s = 0; for (int k = 0; k < a.Length; k++) s += Math.Abs(a[k] - b[k]); return s / a.Length; }
  public static string Run(string dir, int n) {
    var ds = new double[n]; float[] prev = null, first = null;
    for (int i = 0; i < n; i++) { var a = Load(string.Format("{0}\\f{1:00000}.jpg", dir, i)); if (i == 0) first = a; if (prev != null) ds[i] = Diff(a, prev); prev = a; }
    double seam = Diff(prev, first);
    var sb = new System.Text.StringBuilder(); int spikes = 0;
    for (int i = 2; i < n; i++) { var w = new List<double>(); for (int j = Math.Max(1, i - 5); j <= Math.Min(n - 1, i + 5); j++) if (j != i) w.Add(ds[j]); w.Sort(); double med = w[w.Count / 2]; if (ds[i] > med * 2.0 + 0.6) { spikes++; sb.AppendFormat(" {0}({1:0.0}/{2:0.0})", i, ds[i], med); } }
    double avg = 0; for (int i = 1; i < n; i++) avg += ds[i]; avg /= n - 1;
    return string.Format("avg frame diff {0:0.00}; loop seam (last->first) {1:0.00}; last steps {2:0.00},{3:0.00}; spikes {4}:{5}", avg, seam, ds[n - 2], ds[n - 1], spikes, sb.ToString());
  } }
'@
}
[FrameScan]::Run((Resolve-Path $Dir).Path, $Count)
