# Mix for "The Stoker" (Titanic, loops): ElevenLabs music beds + ambiences + one-shot SFX around the voice-over.
# Writes the full mix and separate stems (voice, sfx, music), all exactly -Frames/-Fps long.
param([string]$Vo = '_vo7\vo_tight.wav', [string]$Dir = '_sfx7\wav', [string]$OutDir = '_vo7', [int]$Frames = 2164, [int]$Fps = 60)
$ErrorActionPreference = 'Stop'
. "$PSScriptRoot\audiotool.ps1" -Mode none
if (-not ('LeechMix' -as [type])) {
Add-Type -TypeDefinition @'
using System;
using System.Collections.Generic;
public class Ev { public string Key; public double T, Gain = 1, FadeIn = 0.005, FadeOut = 0.02, Off = 0, Len = -1, Lp = 0; public bool Loop; public int Bus; public double[] AutoT, AutoG; }
public static class LeechMix {
  public const int SR = 48000;
  public static Dictionary<string, float[][]> Clips = new Dictionary<string, float[][]>();
  public static void Load(string key, short[] s, int ch, bool normalize, double peakTarget) {
    int n = s.Length / ch; var L = new float[n]; var R = new float[n];
    for (int i = 0; i < n; i++) { L[i] = s[i * ch] / 32768f; R[i] = s[i * ch + (ch > 1 ? 1 : 0)] / 32768f; }
    if (normalize) {
      // loudness match: the loudest 50 ms window lands on a common level (beds use their average), peaks capped, gain capped at +24 dB
      float pk = 1e-6f; for (int i = 0; i < n; i++) pk = Math.Max(pk, Math.Max(Math.Abs(L[i]), Math.Abs(R[i])));
      int W = SR / 20; double best = 1e-9, all = 0;
      for (int a = 0; a + W <= n; a += W / 2) { double acc = 0; for (int i = a; i < a + W; i++) acc += L[i] * L[i] + R[i] * R[i]; best = Math.Max(best, Math.Sqrt(acc / (2 * W))); }
      for (int i = 0; i < n; i++) all += L[i] * L[i] + R[i] * R[i]; all = Math.Sqrt(all / (2.0 * Math.Max(1, n)));
      double target = peakTarget < 0.85 ? 0.16 : 0.3, lev = peakTarget < 0.85 ? Math.Max(all, 1e-9) : best;
      double g = Math.Min(Math.Min(0.95 / pk, target / lev), 15.85);
      for (int i = 0; i < n; i++) { L[i] *= (float)g; R[i] *= (float)g; }
    }
    Clips[key] = new float[][] { L, R };
  }
  // peak position (seconds) of a clip, for aligning hits
  public static double PeakAt(string key) { var c = Clips[key]; int bi = 0; float bv = 0; for (int i = 0; i < c[0].Length; i++) { float v = Math.Abs(c[0][i]) + Math.Abs(c[1][i]); if (v > bv) { bv = v; bi = i; } } return bi / (double)SR; }
  public static double Dur(string key) { return Clips[key][0].Length / (double)SR; }
  static double Auto(Ev e, double t) {
    if (e.AutoT == null) return 1;
    if (t <= e.AutoT[0]) return e.AutoG[0];
    for (int i = 1; i < e.AutoT.Length; i++) if (t <= e.AutoT[i]) { double u = (t - e.AutoT[i - 1]) / (e.AutoT[i] - e.AutoT[i - 1]); u = u * u * (3 - 2 * u); return e.AutoG[i - 1] + (e.AutoG[i] - e.AutoG[i - 1]) * u; }
    return e.AutoG[e.AutoG.Length - 1];
  }
  // render one event into bus buffers; tEnd = video end (loop events wrap their source)
  public static void Render(Ev e, float[][] bus, int N) {
    var c = Clips[e.Key]; int cn = c[0].Length;
    int s0 = (int)Math.Round(e.T * SR), off = (int)Math.Round(e.Off * SR);
    int len = e.Len > 0 ? (int)Math.Round(e.Len * SR) : (e.Loop ? N - s0 : cn - off);
    int fi = Math.Max(1, (int)(e.FadeIn * SR)), fo = Math.Max(1, (int)(e.FadeOut * SR));
    double lpA = e.Lp > 0 ? Math.Exp(-2 * Math.PI * e.Lp / SR) : 0; double zl = 0, zr = 0;
    for (int k = 0; k < len; k++) {
      int o = s0 + k; if (o >= N) break; if (o < 0) continue;
      int si = off + k; if (e.Loop) si = ((si % cn) + cn) % cn; else if (si >= cn) break;
      double g = e.Gain * Auto(e, o / (double)SR);
      if (k < fi) g *= (double)k / fi; if (len - k < fo) g *= (double)(len - k) / fo;
      double l = c[0][si], r = c[1][si];
      if (lpA > 0) { zl = (1 - lpA) * l + lpA * zl; zr = (1 - lpA) * r + lpA * zr; l = zl; r = zr; }
      bus[0][o] += (float)(l * g); bus[1][o] += (float)(r * g);
    }
  }
  // sidechain: gain reduction on a bus following the voice envelope (dB at full voice)
  public static void Duck(float[][] bus, float[][] vo, double depthDb, int N) {
    double env = 0, aA = Math.Exp(-1.0 / (0.015 * SR)), aR = Math.Exp(-1.0 / (0.28 * SR));
    for (int i = 0; i < N; i++) {
      double x = Math.Abs(vo[0][i]) + Math.Abs(vo[1][i]);
      env = x > env ? aA * env + (1 - aA) * x : aR * env + (1 - aR) * x;
      double k = Math.Min(1, env / 0.12), g = Math.Pow(10, -depthDb * k / 20);
      bus[0][i] *= (float)g; bus[1][i] *= (float)g;
    }
  }
  // music loop seam: crossfade the last L seconds toward what would have led into t=0 (for looping beds)
  public static void Seam(float[][] bus, float[][] pre, int N, double L) {
    int n = (int)(L * SR);
    for (int k = 0; k < n; k++) { int i = N - n + k; double w = (double)k / n; w = w * w * (3 - 2 * w); bus[0][i] = (float)(bus[0][i] * (1 - w) + pre[0][k] * w); bus[1][i] = (float)(bus[1][i] * (1 - w) + pre[1][k] * w); }
  }
  public static short[] ToPcm(float[][] b, int N, double gain) {
    var o = new short[N * 2];
    for (int i = 0; i < N; i++) for (int ch = 0; ch < 2; ch++) { double v = b[ch][i] * gain; v = Math.Tanh(v * 1.05) / Math.Tanh(1.05); o[i * 2 + ch] = (short)Math.Max(-32767, Math.Min(32767, Math.Round(v * 32767))); }
    return o;
  }
  public static double Peak(float[][] b, int N) { double p = 0; for (int i = 0; i < N; i++) p = Math.Max(p, Math.Max(Math.Abs(b[0][i]), Math.Abs(b[1][i]))); return p; }
  public static double Rms(float[][] b, int N, int a0, int a1) { double s = 0; int n = 0; for (int i = Math.Max(0, a0); i < Math.Min(N, a1); i++) { s += b[0][i] * b[0][i] + b[1][i] * b[1][i]; n += 2; } return Math.Sqrt(s / Math.Max(1, n)); }
}
'@
}
$N = [int]([math]::Round($Frames / $Fps * 48000))
$T = $Frames / $Fps
# ---------------- load clips
$files = Get-ChildItem $Dir -Filter *.wav
foreach ($f in $files) {
  $w = [AudioTool]::Read($f.FullName)
  $key = $f.BaseName
  $isBed = $key -match '^h?(m|a)\d'
  [LeechMix]::Load($key, $w.S, $w.Ch, $true, $(if ($isBed) { 0.8 } else { 0.89 }))
}
$vw = [AudioTool]::Read((Resolve-Path $Vo).Path)
[LeechMix]::Load('vo', $vw.S, $vw.Ch, $false, 1)
function E($key, $t, $g, [hashtable]$o = @{}) { $e = New-Object Ev; $e.Key = $key; $e.T = $t; $e.Gain = $g; foreach ($k in $o.Keys) { $e.$k = $o[$k] }; return $e }
# ---------------- the arrangement
$music = @(
  # the dark court underscore: the cell, the harp, the war room (it steps back when your harp starts)
  (E 'hm1_underscore' 0 0.6 @{ Loop = $true; Len = 11.2; FadeIn = 0.01; FadeOut = 1.0; AutoT = [double[]](0, 3.2, 4.4, 10.0); AutoG = [double[]](1.0, 1.0, 0.6, 0.55) }),
  # YOUR harp, from the first touch of the strings to the flinch, where it stops dead
  (E 'hm4_harp' 2.85 0.5 @{ Loop = $true; Len = (21.99 - 2.85); FadeIn = 0.7; FadeOut = 0.05; AutoT = [double[]](2.85, 4.0, 13.0, 21.0); AutoG = [double[]](0.8, 1.0, 0.85, 0.75) }),
  # dread from "one night" through the blurred room and the poison
  (E 'hm2_tension' 10.3 0.55 @{ Loop = $true; Len = 11.75; FadeIn = 1.0; FadeOut = 0.08; AutoT = [double[]](10.3, 16.0, 19.0, 21.9); AutoG = [double[]](0.75, 0.9, 1.05, 1.15) }),
  # after a near-silent beat, the tension creeps back under the stare-down
  (E 'hm2_tension' 22.6 0.62 @{ Loop = $true; Off = 9.0; Len = 9.4; FadeIn = 1.4; FadeOut = 0.8; AutoT = [double[]](22.6, 26.0, 28.4, 31.9); AutoG = [double[]](0.75, 1.1, 0.9, 1.0) }),
  # you keep playing: the harp comes back
  (E 'hm4_harp' 28.9 0.48 @{ Loop = $true; Off = 6.0; Len = ($T - 28.9); FadeIn = 0.9; FadeOut = 0.01 }),
  # the Emperor chokes: drums and braams
  (E 'hm3_climax' 31.55 0.6 @{ Off = 7.6; Len = 2.5; FadeIn = 0.25; FadeOut = 0.9 }),
  # the underscore returns under the new Emperor and runs into the loop seam
  (E 'hm1_underscore' 33.2 0.45 @{ Loop = $true; Off = 5.0; Len = ($T - 33.2); FadeIn = 1.2; FadeOut = 0.01 })
)
$amb = @(
  (E 'ha1_cell' 0 0.85 @{ Loop = $true; Len = 2.1; FadeOut = 0.4 }),
  (E 'ha2_hall' 1.6 0.45 @{ Loop = $true; Len = 2.3; FadeIn = 0.3; FadeOut = 0.4; Lp = 1200 }),
  (E 'ha2_hall' 3.4 0.9 @{ Loop = $true; Off = 1.0; Len = ($T - 3.4 - 0.4); FadeIn = 0.6; FadeOut = 0.5 }),
  # the cell comes back under the loop dissolve and runs straight on into t = 0
  (E 'ha1_cell' ($T - 0.65) 0.85 @{ Loop = $true; Off = [LeechMix]::Dur('ha1_cell') - 0.65; FadeIn = 0.5 })
)
# one-shots: [key, time, gain, 'p' = the clip's peak lands on the time | 's' = the clip starts there]
$hits = @(
  @('hs6_boom', 0.0, 0.8, 'p'), @('hs1_iron', -0.1, 0.6, 's'), @('hs25_fire', 0.25, 0.45, 's'), @('hs7_riser', 1.7, 0.55, 'p'), @('hs2_sizzle', 1.66, 0.85, 's'), @('hs3_scream', 1.76, 0.4, 's'),
  @('hs4_gliss', 2.85, 0.5, 's'), @('hs5_curtain', 3.62, 0.65, 'p'),
  @('hs22_whoosh', 6.55, 0.35, 'p'), @('hs22_whoosh', 7.55, 0.35, 'p'), @('hs8_block', 7.98, 0.6, 'p'), @('hs22_whoosh', 8.9, 0.35, 'p'), @('hs10_heartbeat', 9.1, 0.4, 's'), @('hs9_axe', 9.5, 0.55, 'p'),
  @('hs24_swell', 10.55, 0.35, 'p'), @('hs11_cloth', 11.6, 0.7, 's'), @('hs15_gasp', 12.65, 0.45, 'p'), @('hs12_blur', 13.15, 0.6, 's'),
  @('hs10_heartbeat', 18.3, 0.45, 's'), @('hs13_pour', 19.3, 0.6, 's'), @('hs22_whoosh', 21.3, 0.35, 'p'),
  @('hs14_twang', 21.99, 0.8, 's'), @('hs15_gasp', 22.03, 0.55, 'p'), @('hs17_stinger', 22.1, 0.7, 'p'), @('hs22_whoosh', 23.15, 0.5, 'p'), @('hs16_dagger', 24.2, 0.75, 'p'), @('hs10_heartbeat', 24.6, 0.6, 's'),
  @('hs22_whoosh', 28.2, 0.35, 'p'), @('hs22_whoosh', 31.88, 0.4, 'p'),
  @('hs19_goblet', 31.76, 0.7, 'p'), @('hs18_choke', 31.85, 0.7, 's'), @('hs6_boom', 32.05, 0.6, 'p'), @('hs20_thud', 33.2, 0.75, 'p'),
  @('hs23_wetwhoosh', 33.3, 0.6, 'p'), @('hs21_crown', 33.95, 0.7, 'p'), @('hs26_laugh', 34.9, 0.45, 's'),
  @('hs24_swell', ($T - 0.02), 0.6, 'p')
)
$sfx = @()
foreach ($h in $hits) {
  if (-not [LeechMix]::Clips.ContainsKey($h[0])) { Write-Host "missing clip $($h[0])"; continue }
  $t0 = [double]$h[1]; if ($h[3] -eq 'p') { $t0 -= [LeechMix]::PeakAt($h[0]) }
  $sfx += (E $h[0] $t0 ([double]$h[2]) @{ FadeOut = 0.08 })
  # anything that starts before t = 0 also plays its head at the end of the file, so the loop seam carries it across
  if ($t0 -lt 0) { $sfx += (E $h[0] ($t0 + $T) ([double]$h[2]) @{ FadeOut = 0.002 }) }
}
# ---------------- render buses
function NewBus { ,@((New-Object 'float[]' $N), (New-Object 'float[]' $N)) }
$busV = NewBus; $busS = NewBus; $busM = NewBus; $busA = NewBus
$ev = New-Object Ev; $ev.Key = 'vo'; $ev.T = 0; $ev.Gain = 1; $ev.FadeOut = 0.012; [LeechMix]::Render($ev, $busV, $N)
foreach ($e in $sfx) { [LeechMix]::Render($e, $busS, $N) }
foreach ($e in $music) { [LeechMix]::Render($e, $busM, $N) }
foreach ($e in $amb) { [LeechMix]::Render($e, $busA, $N) }
# music loop seam: crossfade the last L seconds toward what the underscore plays just before t = 0
$L = 0.7
$seamEv = E 'hm1_underscore' 0 0.6 @{ Loop = $true; Off = - $L; Len = $L; FadeIn = 0.001; FadeOut = 0.001; AutoT = [double[]](0); AutoG = [double[]](1.0) }
$preFull = NewBus; [LeechMix]::Render($seamEv, $preFull, $N)
[LeechMix]::Seam($busM, $preFull, $N, $L)
[LeechMix]::Duck($busM, $busV, 7, $N); [LeechMix]::Duck($busA, $busV, 5, $N); [LeechMix]::Duck($busS, $busV, 2.5, $N)
# ---------------- levels: voice is the anchor
$gV = 0.86 / [math]::Max(0.2, [LeechMix]::Peak($busV, $N))
$gS = 0.66; $gM = 0.85; $gA = 0.32
$mix = NewBus
for ($i = 0; $i -lt $N; $i++) { for ($c = 0; $c -lt 2; $c++) { $mix[$c][$i] = $busV[$c][$i] * $gV + $busS[$c][$i] * $gS + $busM[$c][$i] * $gM + $busA[$c][$i] * $gA } }
$pk = [LeechMix]::Peak($mix, $N); $gMix = if ($pk -gt 0.97) { 0.97 / $pk } else { 1 }
"peak mix {0:0.00} -> gain {1:0.000}" -f $pk, $gMix
$rv = [LeechMix]::Rms($busV, $N, 0, $N) * $gV; $rs = [LeechMix]::Rms($busS, $N, 0, $N) * $gS; $rm = [LeechMix]::Rms($busM, $N, 0, $N) * $gM; $ra = [LeechMix]::Rms($busA, $N, 0, $N) * $gA
"rms dB  voice {0:0.0}  sfx {1:0.0}  music {2:0.0}  amb {3:0.0}" -f (20 * [math]::Log10($rv)), (20 * [math]::Log10($rs + 1e-9)), (20 * [math]::Log10($rm + 1e-9)), (20 * [math]::Log10($ra + 1e-9))
function WriteBus($b, $g, $path) { $w = New-Object Wav; $w.Rate = 48000; $w.Ch = 2; $w.Bits = 16; $w.S = [LeechMix]::ToPcm($b, $N, $g); [AudioTool]::Write($path, $w) }
$od = (Resolve-Path $OutDir).Path
WriteBus $mix $gMix "$od\harpist_mix.wav"
WriteBus $busV ($gV * $gMix) "$od\harpist_voiceover.wav"
$sfxBus = NewBus; for ($i = 0; $i -lt $N; $i++) { for ($c = 0; $c -lt 2; $c++) { $sfxBus[$c][$i] = $busS[$c][$i] * $gS + $busA[$c][$i] * $gA } }
WriteBus $sfxBus $gMix "$od\harpist_sfx.wav"
WriteBus $busM ($gM * $gMix) "$od\harpist_music.wav"
"wrote mix + stems: {0:0.000}s" -f ($N / 48000)



