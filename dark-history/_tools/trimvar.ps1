# Trim VO silences like audiotool -Mode trim, but with a per-gap keep length (scripted "..." holds stay a little longer).
# -Keep '0.11,0.45,0.25' gives the kept length for interior gap 1, 2, 3...; gaps past the list use -MaxGap.
param([string]$In, [string]$Out, [string]$Keep = '', [double]$MaxGap = 0.11, [double]$MinGap = 0.15, [double]$Lead = 0.04, [double]$Tail = 0.12, [double]$ThreshDb = -38)
$ErrorActionPreference = 'Stop'
# dot-sourcing re-runs audiotool's param block in this scope, so pass our values through
. "$PSScriptRoot\audiotool.ps1" -Mode none -In $In -Out $Out -MaxGap $MaxGap -MinGap $MinGap -Lead $Lead -Tail $Tail -ThreshDb $ThreshDb
if (-not ('TrimVar' -as [type])) {
Add-Type -TypeDefinition @'
using System;
using System.Collections.Generic;
public static class TrimVar {
  public static short[] Cut(short[] S, int ch, int rate, List<double[]> keep) {
    var o = new List<short>(S.Length); int fade = (int)(0.006 * rate);
    foreach (var k in keep) {
      int i0 = Math.Max(0, (int)Math.Round(k[0] * rate)) * ch, i1 = Math.Min(S.Length / ch, (int)Math.Round(k[1] * rate)) * ch, n = (i1 - i0) / ch;
      for (int f = 0; f < n; f++) { double g = 1; if (f < fade) g = f / (double)fade; if (n - f < fade) g = Math.Min(g, (n - f) / (double)fade); for (int c = 0; c < ch; c++) o.Add((short)(S[i0 + f * ch + c] * g)); }
    }
    return o.ToArray();
  }
}
'@
}
$w = [AudioTool]::Read($In)
$total = $w.S.Length / $w.Ch / $w.Rate
$sil = [AudioTool]::Silences([AudioTool]::Env($w), $ThreshDb, $MinGap)
$ks = @(); if ($Keep) { $ks = $Keep -split ',' | ForEach-Object { [double]$_ } }
$ranges = New-Object 'System.Collections.Generic.List[double[]]'; $prev = 0.0; $gi = 0; $map = @()
foreach ($s in $sil) {
  $a = $s[0]; $b = $s[1]
  if ($a -le 0.001) { $prev = [math]::Max(0.0, $b - $Lead); continue }
  if ($b -ge $total - 0.011) { $ranges.Add(@($prev, [math]::Min($total, $a + $Tail))); $prev = -1; break }
  $k = if ($gi -lt $ks.Count) { $ks[$gi] } else { $MaxGap }; $gi++
  $ranges.Add(@($prev, ($a + $k / 2))); $prev = $b - $k / 2
}
if ($prev -ge 0) { $ranges.Add(@($prev, $total)) }
$o = New-Object Wav; $o.Rate = $w.Rate; $o.Ch = $w.Ch; $o.Bits = 16; $o.S = [TrimVar]::Cut($w.S, $w.Ch, $w.Rate, $ranges)
[AudioTool]::Write($Out, $o)
$t = 0.0; foreach ($r in $ranges) { $map += "{0:0.000} {1:0.000} {2:0.000}" -f $r[0], $r[1], $t; $t += $r[1] - $r[0] }
$map | Set-Content ($Out + '.map.txt')
"trimmed: {0:0.000}s -> {1:0.000}s ({2} gaps)" -f $total, ($o.S.Length / $o.Ch / $o.Rate), $gi
