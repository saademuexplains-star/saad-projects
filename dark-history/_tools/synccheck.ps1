# Audio offset of an encoded file vs. the reference mix: best lag (ms) and normalized correlation over the whole length.
param([string]$Ref, [string]$Test, [int]$MaxLagMs = 80)
$ErrorActionPreference = 'Stop'
. "$PSScriptRoot\audiotool.ps1" -Mode none
if (-not ('SyncCheck' -as [type])) {
Add-Type -TypeDefinition @'
using System;
public static class SyncCheck {
  // mono, decimated by 4 (12 kHz) for speed
  static double[] Mono(short[] s, int ch) { int n = s.Length / ch / 4; var m = new double[n]; for (int i = 0; i < n; i++) { double a = 0; for (int c = 0; c < ch; c++) a += s[(i * 4) * ch + c]; m[i] = a / ch / 32768.0; } return m; }
  public static string Run(short[] a, int cha, short[] b, int chb, int rate, int maxLagMs) {
    var x = Mono(a, cha); var y = Mono(b, chb); int r = rate / 4, L = maxLagMs * r / 1000, n = Math.Min(x.Length, y.Length);
    double best = -2; int bl = 0;
    for (int lag = -L; lag <= L; lag++) {
      double sxy = 0, sxx = 0, syy = 0;
      for (int i = Math.Max(0, -lag); i < n && i + lag < n; i++) { double p = x[i], q = y[i + lag]; sxy += p * q; sxx += p * p; syy += q * q; }
      double c = sxy / Math.Sqrt(sxx * syy + 1e-12); if (c > best) { best = c; bl = lag; }
    }
    return string.Format("offset {0:0.0} ms, correlation {1:0.0000}, ref {2:0.000}s, test {3:0.000}s", bl * 1000.0 / r, best, x.Length / (double)r, y.Length / (double)r);
  }
}
'@
}
$wa = [AudioTool]::Read((Resolve-Path $Ref).Path); $wb = [AudioTool]::Read((Resolve-Path $Test).Path)
[SyncCheck]::Run($wa.S, $wa.Ch, $wb.S, $wb.Ch, $wa.Rate, $MaxLagMs)
