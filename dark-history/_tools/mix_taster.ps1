# Mix for "The Royal Taster": ElevenLabs music beds + ambiences + one-shot SFX around the voice-over.
# Writes the full mix and separate stems (voice, sfx, music), all exactly -Frames/-Fps long.
param([string]$Vo = '_vo3\vo_tight.wav', [string]$Dir = '_sfx3\wav', [string]$OutDir = '_vo3', [int]$Frames = 2876, [int]$Fps = 60)
$ErrorActionPreference = 'Stop'
. "$PSScriptRoot\audiotool.ps1" -Mode none
if (-not ('TasterMix' -as [type])) {
Add-Type -TypeDefinition @'
using System;
using System.Collections.Generic;
public class Ev { public string Key; public double T, Gain = 1, FadeIn = 0.005, FadeOut = 0.02, Off = 0, Len = -1, Lp = 0; public bool Loop; public int Bus; public double[] AutoT, AutoG; }
public static class TasterMix {
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
  $isBed = $key -match '^(m|a)\d'
  [TasterMix]::Load($key, $w.S, $w.Ch, $true, $(if ($isBed) { 0.8 } else { 0.89 }))
}
$vw = [AudioTool]::Read((Resolve-Path $Vo).Path)
[TasterMix]::Load('vo', $vw.S, $vw.Ch, $false, 1)
function E($key, $t, $g, [hashtable]$o = @{}) { $e = New-Object Ev; $e.Key = $key; $e.T = $t; $e.Gain = $g; foreach ($k in $o.Keys) { $e.$k = $o[$k] }; return $e }
# ---------------- the arrangement
$music = @(
  (E 'm1_underscore' 0 0.5 @{ Loop = $true; FadeIn = 0.01; FadeOut = 0.01; AutoT = [double[]](0, 5.2, 7.6, 16.8, 18.0, 28.6, 29.2, 32.6, 33.4, 39.6, 40.4, 43.0, 46.2, $T); AutoG = [double[]](0.8, 1.0, 0.75, 0.6, 0.48, 0.4, 0.8, 0.8, 0.55, 0.5, 0.3, 0.55, 0.8, 0.8) }),
  (E 'm2_suspense' 17.25 0.62 @{ Len = 22.4; FadeIn = 0.6; FadeOut = 0.5; AutoT = [double[]](17.25, 28.5, 29.3, 32.5, 33.3, 39.5, 39.8); AutoG = [double[]](0.8, 1.0, 0.6, 0.7, 0.85, 1.0, 0.0) }),
  (E 'm3_minstrels' 7.85 0.42 @{ Loop = $true; Len = 32.0; FadeIn = 0.5; FadeOut = 0.06; AutoT = [double[]](7.85, 10.9, 11.4, 12.9, 17.1, 17.5, 18.6, 19.2, 26.4, 26.9, 32.6, 33.4, 39.7, 39.8); AutoG = [double[]](1, 1, 0.35, 0.8, 0.8, 0.0, 0.0, 0.4, 0.35, 0.0, 0.0, 0.8, 0.8, 0.0); Lp = 0 })
)
$clim = 40.95 - [TasterMix]::PeakAt('m4_climax')
$music += (E 'm4_climax' $clim 0.85 @{ FadeIn = 0.02; FadeOut = 1.2; AutoT = [double[]](40.0, 44.0, 46.0); AutoG = [double[]](1, 0.8, 0.4) })
$amb = @(
  (E 'a3_dining' 0 0.38 @{ Loop = $true; Len = 5.8; FadeOut = 0.4 }),
  (E 'a3_dining' ($T - 0.9) 0.38 @{ Loop = $true; Off = 0; FadeIn = 0.8 }),
  (E 'a1_hall' 7.8 0.42 @{ Loop = $true; Len = 9.5; FadeIn = 0.6; FadeOut = 0.3; AutoT = [double[]](10.9, 11.4, 12.9); AutoG = [double[]](1, 0.25, 0.9) }),
  (E 'a1_hall' 18.4 0.26 @{ Loop = $true; Off = 9.5; Len = 8.4; FadeIn = 0.4; FadeOut = 0.4; Lp = 900 }),
  (E 'a1_hall' 32.6 0.4 @{ Loop = $true; Off = 3; Len = 8.3; FadeIn = 0.5; FadeOut = 0.08 }),
  (E 'a2_village' 28.85 0.55 @{ Loop = $true; Len = 4.3; FadeIn = 0.4; FadeOut = 0.5 })
)
$hits = @(
  @('s1_shimmer', -0.05, 0.42), @('s1_shimmer', 1.1, 0.3), @('s2_spoonclink', 0.53, 0.55), @('s3_platter', 2.3, 0.6), @('s4_scoop', 2.68, 0.55),
  @('s5_chewgulp', 3.35, 1.0), @('s6_kinglaugh', 4.92, 0.75), @('s7_spinwhoosh', 4.92, 0.8), @('s9_spoonspin', 5.15, 0.45),
  @('s8_click', 5.75, 0.7), @('s8_click', 6.08, 0.7), @('s8_click', 6.4, 0.7), @('s8_click', 6.73, 0.72), @('s8_click', 7.18, 0.75), @('s8_click', 7.58, 0.85),
  @('s10_cloche', 7.45, 0.55), @('s1_shimmer', 7.7, 0.25), @('s11_tiltwhoosh', 8.1, 0.75), @('s12_bite', 9.9, 0.7), @('s13_tinnitus', 10.95, 0.7),
  @('s14_bokeh', 12.5, 0.65), @('s15_vertigo', 13.6, 0.6), @('s16_dagger', 16.72, 0.7), @('s17_shing', 17.22, 0.7), @('s18_drops', 17.6, 0.6),
  @('s19_impactrev', 18.38, 0.75), @('s20_sizzle', 19.9, 0.72), @('s21_glass', 21.1, 0.65), @('s22_droplet', 22.75, 0.45), @('s22_droplet', 23.05, 0.4), @('s22_droplet', 23.35, 0.4),
  @('s23_cough', 24.95, 1.0), @('s24_swoosh', 26.22, 0.75), @('s43_riser', 25.75, 0.55), @('s25_subboom', 28.1, 0.85), @('s26_darkwhoosh', 28.7, 0.75),
  @('s27_hammer', 29.45, 0.8), @('s27_hammer', 29.85, 0.82), @('s27_hammer', 30.25, 0.85), @('s28_screams', 30.3, 0.55), @('s29_torch', 31.42, 0.6), @('s30_rooffire', 31.8, 0.8),
  @('s31_firecandle', 32.45, 0.65), @('s32_kinglaugh2', 36.62, 0.8), @('s33_bigbite', 38.72, 0.8), @('s34_choke', 39.75, 0.75), @('s36_crown', 40.32, 0.55),
  @('s35_collapse', 40.88, 0.9), @('s37_spill', 40.95, 0.55), @('s38_chaos', 41.05, 0.55), @('s39_vial', 42.88, 0.6), @('s40_whisper', 43.3, 0.55),
  @('s41_fanfare', 44.55, 0.65), @('s42_kneel', 45.42, 0.5), @('s1_shimmer', 46.95, 0.6), @('s14_bokeh', 46.61, 0.55)
)
$sfx = @(); foreach ($h in $hits) { if ([TasterMix]::Clips.ContainsKey($h[0])) { $sfx += (E $h[0] ([double]$h[1]) ([double]$h[2]) @{ FadeOut = 0.08 }) } else { Write-Host "missing clip $($h[0])" } }
# ---------------- render buses
function NewBus { ,@((New-Object 'float[]' $N), (New-Object 'float[]' $N)) }
$busV = NewBus; $busS = NewBus; $busM = NewBus; $busA = NewBus; $pre = NewBus
$ev = New-Object Ev; $ev.Key = 'vo'; $ev.T = 0; $ev.Gain = 1; $ev.FadeOut = 0.012; [TasterMix]::Render($ev, $busV, $N)
foreach ($e in $sfx) { [TasterMix]::Render($e, $busS, $N) }
foreach ($e in $music) { [TasterMix]::Render($e, $busM, $N) }
foreach ($e in $amb) { [TasterMix]::Render($e, $busA, $N) }
# what the underscore would play just before t = 0 (for the loop seam)
$L = 0.8; $nL = [int]($L * 48000)
$seamEv = E 'm1_underscore' 0 0.5 @{ Loop = $true; Off = - $L; Len = $L; FadeIn = 0.001; FadeOut = 0.001; AutoT = [double[]](0); AutoG = [double[]](0.75) }
$preFull = @((New-Object 'float[]' $N), (New-Object 'float[]' $N)); [TasterMix]::Render($seamEv, $preFull, $N)
# shift: the rendered 'pre' clip starts at index 0 and contains source samples [-L, 0) of the loop
[TasterMix]::Seam($busM, $preFull, $N, $L)
[TasterMix]::Duck($busM, $busV, 7, $N); [TasterMix]::Duck($busA, $busV, 5, $N); [TasterMix]::Duck($busS, $busV, 2.5, $N)
# ---------------- levels: voice is the anchor
$gV = 0.86 / [math]::Max(0.2, [TasterMix]::Peak($busV, $N))
$gS = 0.8; $gM = 0.85; $gA = 0.6
$mix = NewBus
for ($i = 0; $i -lt $N; $i++) { for ($c = 0; $c -lt 2; $c++) { $mix[$c][$i] = $busV[$c][$i] * $gV + $busS[$c][$i] * $gS + $busM[$c][$i] * $gM + $busA[$c][$i] * $gA } }
$pk = [TasterMix]::Peak($mix, $N); $gMix = if ($pk -gt 0.97) { 0.97 / $pk } else { 1 }
"peak mix {0:0.00} -> gain {1:0.000}" -f $pk, $gMix
$rv = [TasterMix]::Rms($busV, $N, 0, $N) * $gV; $rs = [TasterMix]::Rms($busS, $N, 0, $N) * $gS; $rm = [TasterMix]::Rms($busM, $N, 0, $N) * $gM; $ra = [TasterMix]::Rms($busA, $N, 0, $N) * $gA
"rms dB  voice {0:0.0}  sfx {1:0.0}  music {2:0.0}  amb {3:0.0}" -f (20 * [math]::Log10($rv)), (20 * [math]::Log10($rs + 1e-9)), (20 * [math]::Log10($rm + 1e-9)), (20 * [math]::Log10($ra + 1e-9))
function WriteBus($b, $g, $path) { $w = New-Object Wav; $w.Rate = 48000; $w.Ch = 2; $w.Bits = 16; $w.S = [TasterMix]::ToPcm($b, $N, $g); [AudioTool]::Write($path, $w) }
$od = (Resolve-Path $OutDir).Path
WriteBus $mix $gMix "$od\taster_mix.wav"
WriteBus $busV ($gV * $gMix) "$od\taster_voiceover.wav"
$sfxBus = NewBus; for ($i = 0; $i -lt $N; $i++) { for ($c = 0; $c -lt 2; $c++) { $sfxBus[$c][$i] = $busS[$c][$i] * $gS + $busA[$c][$i] * $gA } }
WriteBus $sfxBus $gMix "$od\taster_sfx.wav"
WriteBus $busM ($gM * $gMix) "$od\taster_music.wav"
"wrote mix + stems: {0:0.000}s" -f ($N / 48000)
