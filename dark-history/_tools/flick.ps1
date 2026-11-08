# Local flicker / pop / jitter detector. Every frame is reduced to 270x480 grey and cut into BxB blocks. For each
# block and frame n, with D(n) = mean |F(n) - F(n-1)| and D2(n) = mean |F(n+1) - F(n-1)|:
#   blink = min(D(n), D(n+1)) - D2(n)                 the block changes and changes back (one-frame blink or jitter)
#   pop   = D(n) - 2 * max(D(n-1), D(n+1))             the block jumps at n while it moves smoothly before and after
# Smooth motion scores <= 0 on both. Frames with blocks over -Min are listed with the count, the worst score and the
# box of the flagged blocks (in 1080x1920 pixels). -Out writes the list to a file as well.
param([string]$Dir, [int]$From = 0, [int]$To = -1, [int]$B = 10, [double]$Min = 7, [string]$Out = '')
$ErrorActionPreference = 'Stop'
if (-not ('Flick' -as [type])) {
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @"
using System; using System.Drawing; using System.Drawing.Imaging; using System.Runtime.InteropServices; using System.Text; using System.Collections.Generic;
public static class Flick {
  public static byte[] Load(string path, out int w, out int h) {
    using (var bmp = new Bitmap(path)) {
      int W = bmp.Width, H = bmp.Height; w = W / 4; h = H / 4;
      var data = bmp.LockBits(new Rectangle(0, 0, W, H), ImageLockMode.ReadOnly, PixelFormat.Format24bppRgb);
      int stride = data.Stride; var raw = new byte[stride * H]; Marshal.Copy(data.Scan0, raw, 0, raw.Length); bmp.UnlockBits(data);
      var g = new byte[w * h];
      for (int y = 0; y < h; y++) for (int x = 0; x < w; x++) { int s = 0; for (int dy = 0; dy < 4; dy++) { int row = (y * 4 + dy) * stride; for (int dx = 0; dx < 4; dx++) { int i = row + (x * 4 + dx) * 3; s += raw[i] + raw[i + 1] + raw[i + 2]; } } g[y * w + x] = (byte)(s / 48); }
      return g;
    }
  }
  static float[] BD(byte[] a, byte[] c, int w, int h, int b) {
    int bw = w / b, bh = h / b; var r = new float[bw * bh];
    for (int by = 0; by < bh; by++) for (int bx = 0; bx < bw; bx++) { int s = 0; for (int y = by * b; y < by * b + b; y++) for (int x = bx * b; x < bx * b + b; x++) { int i = y * w + x; s += Math.Abs(a[i] - c[i]); } r[by * bw + bx] = (float)s / (b * b); }
    return r;
  }
  public static string Run(string[] paths, int from, int b, double min) {
    int n = paths.Length, w = 0, h = 0; var F = new byte[n][];
    for (int i = 0; i < n; i++) F[i] = Load(paths[i], out w, out h);
    int bw = w / b, bh = h / b; var D = new float[n][]; var D2 = new float[n][];
    for (int i = 1; i < n; i++) D[i] = BD(F[i - 1], F[i], w, h, b);
    for (int i = 1; i < n - 1; i++) D2[i] = BD(F[i - 1], F[i + 1], w, h, b);
    var sb = new StringBuilder();
    for (int i = 2; i < n - 2; i++) {
      int nb = 0, np = 0; double wb = 0, wp = 0; int x0 = 9999, y0 = 9999, x1 = -1, y1 = -1;
      for (int j = 0; j < bw * bh; j++) {
        double blink = Math.Min(D[i][j], D[i + 1][j]) - D2[i][j];
        double pop = D[i][j] - 2 * Math.Max(D[i - 1][j], D[i + 1][j]);
        bool hit = false;
        if (blink > min) { nb++; if (blink > wb) wb = blink; hit = true; }
        if (pop > min) { np++; if (pop > wp) wp = pop; hit = true; }
        if (hit) { int bx = j % bw, by = j / bw; if (bx < x0) x0 = bx; if (by < y0) y0 = by; if (bx > x1) x1 = bx; if (by > y1) y1 = by; }
      }
      if (nb + np > 0) sb.AppendFormat("{0} blink {1} (max {2:0.0}) pop {3} (max {4:0.0}) box {5},{6}-{7},{8}\n", from + i, nb, wb, np, wp, x0 * b * 4, y0 * b * 4, (x1 + 1) * b * 4, (y1 + 1) * b * 4);
    }
    return sb.ToString();
  }
}
"@
}
$files = @(Get-ChildItem "$Dir\f*.jpg" | Sort-Object Name)
if ($To -lt 0) { $To = $files.Count - 1 }
$sel = $files[$From..$To] | ForEach-Object { $_.FullName }
$res = [Flick]::Run([string[]]$sel, $From, $B, $Min)
if ($Out) { $res | Out-File -Encoding utf8 $Out }
$res
