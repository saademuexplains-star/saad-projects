param([string]$Mode, [string]$In, [string]$Out, [double]$MaxGap = 0.11, [double]$MinGap = 0.15, [double]$Lead = 0.04, [double]$Tail = 0.12, [double]$ThreshDb = -38)
$ErrorActionPreference = 'Stop'
if (-not ('AudioTool' -as [type])) {
Add-Type -TypeDefinition @'
using System;
using System.IO;
using System.Collections.Generic;
using System.Text;
public class Wav { public int Rate, Ch, Bits; public short[] S; }
public static class AudioTool {
  public static Wav Read(string path) {
    var b = File.ReadAllBytes(path); int p = 12; var w = new Wav();
    while (p < b.Length - 8) {
      string id = Encoding.ASCII.GetString(b, p, 4); int len = BitConverter.ToInt32(b, p + 4);
      if (id == "fmt ") { w.Ch = BitConverter.ToInt16(b, p + 10); w.Rate = BitConverter.ToInt32(b, p + 12); w.Bits = BitConverter.ToInt16(b, p + 22); }
      if (id == "data") { int n = Math.Min(len, b.Length - p - 8) / 2; w.S = new short[n]; Buffer.BlockCopy(b, p + 8, w.S, 0, n * 2); break; }
      p += 8 + len + (len & 1);
    }
    return w;
  }
  public static void Write(string path, Wav w) {
    using (var fs = new FileStream(path, FileMode.Create)) using (var bw = new BinaryWriter(fs)) {
      int dl = w.S.Length * 2;
      bw.Write(Encoding.ASCII.GetBytes("RIFF")); bw.Write(36 + dl); bw.Write(Encoding.ASCII.GetBytes("WAVEfmt "));
      bw.Write(16); bw.Write((short)1); bw.Write((short)w.Ch); bw.Write(w.Rate); bw.Write(w.Rate * w.Ch * 2); bw.Write((short)(w.Ch * 2)); bw.Write((short)16);
      bw.Write(Encoding.ASCII.GetBytes("data")); bw.Write(dl); var tmp = new byte[dl]; Buffer.BlockCopy(w.S, 0, tmp, 0, dl); bw.Write(tmp);
    }
  }
  // RMS dBFS per 10 ms frame (all channels)
  public static double[] Env(Wav w) {
    int fr = w.Rate / 100 * w.Ch; int n = w.S.Length / fr; var e = new double[n];
    for (int i = 0; i < n; i++) { double a = 0; for (int k = 0; k < fr; k++) { double v = w.S[i * fr + k] / 32768.0; a += v * v; } e[i] = 20 * Math.Log10(Math.Sqrt(a / fr) + 1e-9); }
    return e;
  }
  // returns list of [start,end] in seconds of silences longer than minGap
  public static List<double[]> Silences(double[] env, double thr, double minGap) {
    var r = new List<double[]>(); int i = 0;
    while (i < env.Length) {
      if (env[i] < thr) { int j = i; while (j < env.Length && env[j] < thr) j++; double s = i / 100.0, e = j / 100.0; if (e - s >= minGap || i == 0 || j == env.Length) r.Add(new double[] { s, e }); i = j; } else i++;
    }
    return r;
  }
  // build trimmed audio: each silence is shortened to keep seconds (lead/tail special), with 6 ms crossfades
  public static Wav Trim(Wav w, List<double[]> sil, double keep, double lead, double tail, double total, StringBuilder map) {
    var outS = new List<short>(w.S.Length); int ch = w.Ch, rate = w.Rate;
    Func<double, int> idx = t => Math.Max(0, Math.Min(w.S.Length / ch, (int)Math.Round(t * rate))) * ch;
    var keepRanges = new List<double[]>();
    double prev = 0;
    foreach (var s in sil) {
      double a = s[0], b = s[1], k;
      if (a <= 0.001) { prev = Math.Max(0, b - lead); continue; }
      if (b >= total - 0.011) { keepRanges.Add(new double[] { prev, Math.Min(total, a + tail) }); prev = -1; break; }
      k = keep; double half = k / 2;
      keepRanges.Add(new double[] { prev, a + half }); prev = b - half;
    }
    if (prev >= 0) keepRanges.Add(new double[] { prev, total });
    int fade = (int)(0.006 * rate);
    foreach (var kr in keepRanges) {
      int i0 = idx(kr[0]), i1 = idx(kr[1]); int startOut = outS.Count / ch;
      map.AppendFormat("{0:0.000} {1:0.000} {2:0.000}\n", kr[0], kr[1], startOut / (double)rate);
      int frames = (i1 - i0) / ch;
      for (int f = 0; f < frames; f++) {
        double g = 1; if (f < fade) g = f / (double)fade; if (frames - f < fade) g = Math.Min(g, (frames - f) / (double)fade);
        for (int c = 0; c < ch; c++) outS.Add((short)(w.S[i0 + f * ch + c] * g));
      }
    }
    return new Wav { Rate = rate, Ch = ch, Bits = 16, S = outS.ToArray() };
  }
}
'@
}
if ($Mode -eq 'none') { return }
$w = [AudioTool]::Read($In)
$total = $w.S.Length / $w.Ch / $w.Rate
$env = [AudioTool]::Env($w)
if ($Mode -eq 'scan') {
  "rate=$($w.Rate) ch=$($w.Ch) dur=$([math]::Round($total,3))s"
  $sorted = $env | Sort-Object; "p10={0:0.0} p50={1:0.0} p90={2:0.0} dB" -f $sorted[[int]($sorted.Count*0.1)], $sorted[[int]($sorted.Count*0.5)], $sorted[[int]($sorted.Count*0.9)]
  $sil = [AudioTool]::Silences($env, $ThreshDb, $MinGap)
  foreach ($s in $sil) { "silence {0,6:0.00} - {1,6:0.00}  ({2:0.00}s)" -f $s[0], $s[1], ($s[1]-$s[0]) }
}
if ($Mode -eq 'trim') {
  $sil = [AudioTool]::Silences($env, $ThreshDb, $MinGap)
  $map = New-Object System.Text.StringBuilder
  $o = [AudioTool]::Trim($w, $sil, $MaxGap, $Lead, $Tail, $total, $map)
  [AudioTool]::Write($Out, $o)
  $map.ToString() | Set-Content ($Out + '.map.txt')
  "trimmed: {0:0.000}s -> {1:0.000}s" -f $total, ($o.S.Length / $o.Ch / $o.Rate)
}
