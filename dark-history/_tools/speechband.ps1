# Speech-band masking check: the voice stem against the other stems above 300 Hz (sub booms inflate plain RMS without
# hiding words). Lists every 0.2 s window where the voice speaks and the rest comes within -Margin dB of it.
param([string]$Voice, [string[]]$Others, [double]$Margin = 8, [double]$Win = 0.2)
$ErrorActionPreference = 'Stop'
. "$PSScriptRoot\audiotool.ps1" -Mode none
if (-not ('SpeechBand' -as [type])) {
Add-Type -TypeDefinition @'
using System;
public static class SpeechBand {
  // mono, one-pole high-pass at fc, then RMS (dB) per window
  public static double[] Band(short[] s, int ch, int sr, double fc, double win) {
    int n = s.Length / ch, w = (int)(win * sr), m = n / w; var o = new double[m];
    double a = Math.Exp(-2 * Math.PI * fc / sr), px = 0, py = 0;
    double acc = 0; int k = 0, j = 0;
    for (int i = 0; i < n; i++) {
      double x = 0; for (int c = 0; c < ch; c++) x += s[i * ch + c] / 32768.0; x /= ch;
      double y = a * (py + x - px); px = x; py = y;
      acc += y * y; k++;
      if (k == w) { if (j < m) o[j++] = 10 * Math.Log10(acc / w + 1e-12); acc = 0; k = 0; }
    }
    return o;
  }
}
'@
}
$v = [AudioTool]::Read((Resolve-Path $Voice).Path)
$bv = [SpeechBand]::Band($v.S, $v.Ch, $v.Rate, 300, $Win)
$sum = New-Object 'double[]' $bv.Length
foreach ($o in $Others) { $w = [AudioTool]::Read((Resolve-Path $o).Path); $b = [SpeechBand]::Band($w.S, $w.Ch, $w.Rate, 300, $Win); for ($i = 0; $i -lt [Math]::Min($b.Length, $sum.Length); $i++) { $sum[$i] += [Math]::Pow(10, $b[$i] / 10) } }
$flag = 0
for ($i = 0; $i -lt $bv.Length; $i++) {
  $o = 10 * [Math]::Log10($sum[$i] + 1e-12)
  if ($bv[$i] -gt -38 -and $o -gt $bv[$i] - $Margin) { "{0,6:0.0}s  voice {1,6:0.0}  rest {2,6:0.0}  ({3:+0.0;-0.0} dB)" -f ($i * $Win), $bv[$i], $o, ($o - $bv[$i]); $flag++ }
}
"windows within $Margin dB of the voice: $flag"
