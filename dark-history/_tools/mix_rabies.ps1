# Mix for "The Rabies Boy" (loops): ElevenLabs music beds + ambiences + one-shot SFX around the voice-over.
# Writes the full mix and separate stems (voice, sfx, music), all exactly -Frames/-Fps long.
param([string]$Vo = '_vo10\vo_tight.wav', [string]$Dir = '_sfx10\wav', [string]$OutDir = '_vo10', [int]$Frames = 2569, [int]$Fps = 60)
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
  $isBed = $key -match '^[a-z]?(m|a)\d'
  [LeechMix]::Load($key, $w.S, $w.Ch, $true, $(if ($isBed) { 0.8 } else { 0.89 }))
}
$vw = [AudioTool]::Read((Resolve-Path $Vo).Path)
[LeechMix]::Load('vo', $vw.S, $vw.Ch, $false, 1)
function E($key, $t, $g, [hashtable]$o = @{}) { $e = New-Object Ev; $e.Key = $key; $e.T = $t; $e.Gain = $g; foreach ($k in $o.Keys) { $e.$k = $o[$k] }; return $e }

# ---------------- the arrangement
$music = @(
  # the laboratory underscore: the needle, the drying cords, the man who isn't a doctor (it swells on him), nine years old
  (E 'rm1_lab' 0 0.55 @{ Loop = $true; Off = 7.7; Len = 12.85; FadeIn = 0.01; FadeOut = 0.6; AutoT = [double[]](0, 4.2, 7.6, 9.3, 10.8, 12.3); AutoG = [double[]](0.9, 1.0, 1.1, 1.15, 1.0, 0.8) }),
  # the village road (held low until the growl), the attack, the ward: fever, foam, the scream at the water
  (E 'rm2_attack' 12.55 0.6 @{ Loop = $true; Len = 12.2; FadeIn = 0.4; FadeOut = 0.6; AutoT = [double[]](12.55, 13.8, 14.2, 16.8, 17.6, 20.5, 22.7, 23.2, 24.2); AutoG = [double[]](0.3, 0.4, 1.1, 1.1, 0.6, 0.75, 1.15, 1.0, 0.7) }),
  # the tenth night, the deadliest dose, the rabbit, the wait and the weeks
  (E 'rm3_dread' 24.3 0.6 @{ Loop = $true; Off = 8.0; Len = 11.9; FadeIn = 0.5; FadeOut = 0.7; AutoT = [double[]](24.3, 26.9, 27.85, 29.4, 32.3, 33.0, 34.6, 35.6); AutoG = [double[]](0.8, 0.9, 1.2, 1.0, 1.05, 0.6, 0.85, 1.0) }),
  # the morning the fever never comes, the gate, the name over the door; it runs into the loop seam
  (E 'rm4_hope' 35.8 0.6 @{ Loop = $true; Len = ($T - 35.8); FadeIn = 0.8; FadeOut = 0.01; AutoT = [double[]](35.8, 37.3, 39.1, 40.8, 42.3); AutoG = [double[]](0.6, 0.9, 1.0, 1.15, 1.2) })
)
$amb = @(
  (E 'ra1_lab' 0 1.1 @{ Loop = $true; Len = 12.9; FadeOut = 0.5 }),
  (E 'ra2_village' 12.45 1.1 @{ Loop = $true; Len = 4.7; FadeIn = 0.4; FadeOut = 0.5 }),
  (E 'ra3_ward' 16.6 1.1 @{ Loop = $true; Len = 8.0; FadeIn = 0.4; FadeOut = 0.4 }),
  (E 'ra4_nightlab' 24.3 1.1 @{ Loop = $true; Len = 8.4; FadeIn = 0.3; FadeOut = 0.5 }),
  (E 'ra5_room' 32.4 1.1 @{ Loop = $true; Len = 5.2; FadeIn = 0.4; FadeOut = 0.5 }),
  (E 'ra6_court' 37.0 1.1 @{ Loop = $true; Len = ($T - 37.0 - 0.4); FadeIn = 0.6; FadeOut = 0.4 }),
  # the laboratory tone comes back under the loop dissolve and runs straight on into t = 0
  (E 'ra1_lab' ($T - 0.65) 1.1 @{ Loop = $true; Off = [LeechMix]::Dur('ra1_lab') - 0.65; FadeIn = 0.5 })
)
# one-shots: [key, time, gain, 'p' = the clip's peak lands on the time | 's' = the clip starts there, optional event options]
$chalk = @(29.95, 30.49, 30.74, 30.97, 31.18, 31.41, 31.66) | ForEach-Object { , @('rs29_chalk', $_, 0.5, 's') }
$hits = @(
  # the needle: heartbeats as it closes on the skin, the puncture, the gasp, the dose pushed in; the focus pull
  @('rs30_heart', 1.4, 0.5, 'p'), @('rs30_heart', 2.05, 0.55, 'p'), @('rs1_riser', 2.65, 0.5, 'p'), @('rs2_needle', 2.65, 0.9, 'p'), @('rs3_gasp', 2.72, 0.6, 's'),
  @('rs5_plunger', 2.95, 0.6, 's'), @('rs10_sniff', 3.4, 0.45, 's'), @('rs8_whoosh', 4.15, 0.45, 'p'),
  # the cords: glass, the pestle grinding, the cages, "stronger than the day before", the pan into the scientist
  @('rs7_glass', 4.3, 0.5, 's'), @('rs6_grind', 4.65, 0.7, 's'), @('rs39_cage', 6.6, 0.4, 's'), @('rs11_reverse', 7.6, 0.35, 'p'), @('rs4_boom', 7.62, 0.4, 'p'), @('rs8_whoosh', 9.1, 0.45, 'p'),
  # the scientist's nod and his cane; nine years old; into the eye
  @('rs9_cane', 9.95, 0.6, 'p'), @('rs30_heart', 11.42, 0.5, 'p'), @('rs10_sniff', 11.6, 0.4, 's'), @('rs11_reverse', 12.75, 0.5, 'p'),
  # the road: footsteps, the growl, the gallop, the scream, the impact, the bites ("fourteen times"), the dust
  @('rs12_steps', 12.6, 0.45, 's', @{ Len = 1.8; FadeOut = 0.3 }), @('rs13_growl', 13.95, 0.8, 's'), @('rs14_gallop', 14.05, 0.7, 's', @{ Len = 0.75; FadeOut = 0.15 }),
  @('rs15_snarl', 14.75, 0.85, 's'), @('rs16_scream', 14.8, 0.75, 's'), @('rs17_thud', 15.0, 0.8, 'p'), @('rs4_boom', 15.0, 0.55, 'p'),
  @('rs18_bites', 15.4, 0.8, 's'), @('rs18_bites', 16.05, 0.8, 's'), @('rs16_scream', 16.2, 0.45, 's'), @('rs19_dust', 16.8, 0.5, 'p'),
  # the ward: delirium, fever, foam, the glass offered, the scream at the water, the spill, the curtain
  @('rs20_groan', 18.0, 0.45, 's'), @('rs20_groan', 20.7, 0.65, 's'), @('rs21_froth', 21.75, 0.7, 's'), @('rs23_slosh', 22.4, 0.5, 's'),
  @('rs22_mscream', 22.82, 0.85, 's'), @('rs4_boom', 22.85, 0.45, 'p'), @('rs24_splash', 23.7, 0.7, 's'), @('rs25_curtain', 24.45, 0.6, 'p'),
  # the tenth night: the kennels, heartbeats, the deadliest dose, your whimper, your mother's sob, the push into the syringe
  @('rs26_kennel', 24.5, 0.65, 's'), @('rs30_heart', 26.92, 0.55, 'p'), @('rs30_heart', 27.4, 0.55, 'p'), @('rs1_riser', 27.85, 0.5, 'p'), @('rs2_needle', 27.85, 0.9, 'p'),
  @('rs27_whimper', 27.9, 0.7, 's'), @('rs28_sob', 28.0, 0.55, 's'), @('rs5_plunger', 28.15, 0.55, 's'), @('rs8_whoosh', 29.4, 0.4, 'p'), @('rs4_boom', 29.45, 0.5, 'p'),
  # the rabbit: the cage, a chalk stroke a day, the collapse; the rise through the candlelight
  @('rs39_cage', 29.7, 0.45, 's'), @('rs38_collapse', 31.95, 0.6, 's'), @('rs30_heart', 32.0, 0.5, 'p'), @('rs11_reverse', 32.55, 0.35, 'p'),
  # the wait, the weeks rushing by, the rooster at dawn, your mother's relief; your face becomes your face grown
  @('rs30_heart', 33.4, 0.4, 'p'), @('rs30_heart', 34.2, 0.4, 'p'), @('rs40_tick', 34.7, 0.55, 's'), @('rs31_pages', 34.75, 0.6, 's'),
  @('rs32_rooster', 36.0, 0.5, 's'), @('rs33_relief', 36.6, 0.55, 's'), @('rs34_shimmer', 37.3, 0.45, 'p'),
  # the gate: keys; the years rush past (clock, wind through the leaves and the snow); the crane up to the window and
  # the old man's nod; the swell up past the name to the spire, the final hit on its point (its tail carries over the loop)
  @('rs36_keys', 37.6, 0.5, 's'), @('rs40_tick', 37.85, 0.4, 's'), @('rs19_dust', 38.05, 0.45, 'p'), @('rs19_dust', 38.6, 0.4, 'p'), @('rs8_whoosh', 39.5, 0.35, 'p'),
  @('rs34_shimmer', 40.25, 0.4, 'p'), @('rs11_reverse', 41.3, 0.4, 'p'), @('rs37_final', 42.55, 0.75, 'p')
) + $chalk
$sfx = @()
foreach ($h in $hits) {
  if (-not [LeechMix]::Clips.ContainsKey($h[0])) { Write-Host "missing clip $($h[0])"; continue }
  $t0 = [double]$h[1]; if ($h[3] -eq 'p') { $t0 -= [LeechMix]::PeakAt($h[0]) }
  $o = @{ FadeOut = 0.08 }; if ($h.Count -gt 4) { foreach ($k in $h[4].Keys) { $o[$k] = $h[4][$k] } }
  $sfx += (E $h[0] $t0 ([double]$h[2]) $o)
  # anything that starts before t = 0 also plays its head at the end of the file, and anything running past the end
  # plays its tail from t = 0, so the loop seam carries it across
  if ($t0 -lt 0) { $sfx += (E $h[0] ($t0 + $T) ([double]$h[2]) @{ FadeOut = 0.002 }) }
  $len = if ($o.ContainsKey('Len')) { $o.Len } else { [LeechMix]::Dur($h[0]) }
  if ($t0 + $len -gt $T) { $o2 = $o.Clone(); $o2.FadeIn = 0.002; $sfx += (E $h[0] ($t0 - $T) ([double]$h[2]) $o2) }
}
# ---------------- render buses
function NewBus { ,@((New-Object 'float[]' $N), (New-Object 'float[]' $N)) }
$busV = NewBus; $busS = NewBus; $busM = NewBus; $busA = NewBus
$ev = New-Object Ev; $ev.Key = 'vo'; $ev.T = 0; $ev.Gain = 1; $ev.FadeOut = 0.012; [LeechMix]::Render($ev, $busV, $N)
foreach ($e in $sfx) { [LeechMix]::Render($e, $busS, $N) }
foreach ($e in $music) { [LeechMix]::Render($e, $busM, $N) }
foreach ($e in $amb) { [LeechMix]::Render($e, $busA, $N) }
# music loop seam: crossfade the last L seconds toward what the laboratory underscore plays just before t = 0
$L = 0.7
$seamEv = E 'rm1_lab' 0 0.55 @{ Loop = $true; Off = 7.7 - $L; Len = $L; FadeIn = 0.001; FadeOut = 0.001; AutoT = [double[]](0); AutoG = [double[]](0.9) }
$preFull = NewBus; [LeechMix]::Render($seamEv, $preFull, $N)
[LeechMix]::Seam($busM, $preFull, $N, $L)
[LeechMix]::Duck($busM, $busV, 7, $N); [LeechMix]::Duck($busA, $busV, 5, $N); [LeechMix]::Duck($busS, $busV, 2.5, $N)
# ---------------- levels: voice is the anchor
$gV = 0.86 / [math]::Max(0.2, [LeechMix]::Peak($busV, $N))
$gS = 0.5; $gM = 0.92; $gA = 0.21
$mix = NewBus
for ($i = 0; $i -lt $N; $i++) { for ($c = 0; $c -lt 2; $c++) { $mix[$c][$i] = $busV[$c][$i] * $gV + $busS[$c][$i] * $gS + $busM[$c][$i] * $gM + $busA[$c][$i] * $gA } }
$pk = [LeechMix]::Peak($mix, $N); $gMix = if ($pk -gt 0.97) { 0.97 / $pk } else { 1 }
"peak mix {0:0.00} -> gain {1:0.000}" -f $pk, $gMix
$rv = [LeechMix]::Rms($busV, $N, 0, $N) * $gV; $rs = [LeechMix]::Rms($busS, $N, 0, $N) * $gS; $rm = [LeechMix]::Rms($busM, $N, 0, $N) * $gM; $ra = [LeechMix]::Rms($busA, $N, 0, $N) * $gA
"rms dB  voice {0:0.0}  sfx {1:0.0}  music {2:0.0}  amb {3:0.0}" -f (20 * [math]::Log10($rv)), (20 * [math]::Log10($rs + 1e-9)), (20 * [math]::Log10($rm + 1e-9)), (20 * [math]::Log10($ra + 1e-9))
function WriteBus($b, $g, $path) { $w = New-Object Wav; $w.Rate = 48000; $w.Ch = 2; $w.Bits = 16; $w.S = [LeechMix]::ToPcm($b, $N, $g); [AudioTool]::Write($path, $w) }
$od = (Resolve-Path $OutDir).Path
WriteBus $mix $gMix "$od\rabies_mix.wav"
WriteBus $busV ($gV * $gMix) "$od\rabies_voiceover.wav"
$sfxBus = NewBus; for ($i = 0; $i -lt $N; $i++) { for ($c = 0; $c -lt 2; $c++) { $sfxBus[$c][$i] = $busS[$c][$i] * $gS + $busA[$c][$i] * $gA } }
WriteBus $sfxBus $gMix "$od\rabies_sfx.wav"
WriteBus $busM ($gM * $gMix) "$od\rabies_music.wav"
"wrote mix + stems: {0:0.000}s" -f ($N / 48000)




