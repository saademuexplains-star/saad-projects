# Band envelopes of a WAV, to judge whether a music cue really builds: per-window RMS dB of the lows (<200 Hz), the
# highs (>2 kHz) and the full band. A cue that only holds a loop keeps all three flat; a build lifts them over time.
# Usage (from the astro folder): . .\_tools\bandenv.ps1; $e = BandEnvOf 'path.wav' 0.1  ->  $e[0] low, $e[1] high, $e[2] full
. "$PSScriptRoot\audiotool.ps1" -Mode none
if (-not ('BandEnv' -as [type])) {
Add-Type -TypeDefinition @'
using System;
public static class BandEnv {
  public static double[][] Env(short[] s, int ch, int sr, double win) {
    int n = s.Length / ch, w = (int)(win * sr), m = n / w;
    var lo = new double[m]; var hi = new double[m]; var fu = new double[m];
    double aL = Math.Exp(-2 * Math.PI * 200.0 / sr), aH = Math.Exp(-2 * Math.PI * 2000.0 / sr);
    double yl = 0, px = 0, yh = 0, sl = 0, sh = 0, sf = 0; int k = 0, j = 0;
    for (int i = 0; i < n; i++) {
      double x = 0; for (int c = 0; c < ch; c++) x += s[i * ch + c] / 32768.0; x /= ch;
      yl = (1 - aL) * x + aL * yl; yh = aH * (yh + x - px); px = x;
      sl += yl * yl; sh += yh * yh; sf += x * x; k++;
      if (k == w) { if (j < m) { lo[j] = 10 * Math.Log10(sl / w + 1e-12); hi[j] = 10 * Math.Log10(sh / w + 1e-12); fu[j] = 10 * Math.Log10(sf / w + 1e-12); j++; } sl = sh = sf = 0; k = 0; }
    }
    return new[] { lo, hi, fu };
  }
}
'@
}
function BandEnvOf([string]$path, [double]$win) { $w = [AudioTool]::Read((Resolve-Path $path).Path); $script:BE_wav = $w; return [BandEnv]::Env($w.S, $w.Ch, $w.Rate, $win) }
