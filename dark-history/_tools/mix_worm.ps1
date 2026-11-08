# Mix for "The Worm": ElevenLabs music beds + ambiences + one-shot SFX around the voice-over (no loop seam: the video has a real ending).
# Writes the full mix and separate stems (voice, sfx, music), all exactly -Frames/-Fps long.
param([string]$Vo = '_vo4\vo_tight.wav', [string]$Dir = '_sfx4\wav', [string]$OutDir = '_vo4', [int]$Frames = 2941, [int]$Fps = 60)
$ErrorActionPreference = 'Stop'
. "$PSScriptRoot\audiotool.ps1" -Mode none
if (-not ('WormMix' -as [type])) {
Add-Type -TypeDefinition @'
using System;
using System.Collections.Generic;
public class Ev { public string Key; public double T, Gain = 1, FadeIn = 0.005, FadeOut = 0.02, Off = 0, Len = -1, Lp = 0; public bool Loop; public int Bus; public double[] AutoT, AutoG; }
public static class WormMix {
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
  // the last few ms fade to silence so the ending is click-free
  public static void FadeEnd(float[][] b, int N, double sec) { int n = (int)(sec * SR); for (int k = 0; k < n; k++) { int i = N - n + k; double w = 1 - (double)k / n; w = w * w * (3 - 2 * w); b[0][i] *= (float)w; b[1][i] *= (float)w; } }
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
foreach ($f in (Get-ChildItem $Dir -Filter *.wav)) {
  $w = [AudioTool]::Read($f.FullName)
  $isBed = $f.BaseName -match '^w(m|a)\d'
  [WormMix]::Load($f.BaseName, $w.S, $w.Ch, $true, $(if ($isBed) { 0.8 } else { 0.89 }))
}
$vw = [AudioTool]::Read((Resolve-Path $Vo).Path)
[WormMix]::Load('vo', $vw.S, $vw.Ch, $false, 1)
function E($key, $t, $g, [hashtable]$o = @{}) { $e = New-Object Ev; $e.Key = $key; $e.T = $t; $e.Gain = $g; foreach ($k in $o.Keys) { $e.$k = $o[$k] }; return $e }
# ---------------- the arrangement
$music = @(
  # oud underscore: the market and the time-lapse year; leaves as the camera dives into his body; returns softly in the healer's hut
  (E 'wm1_underscore' 0 0.55 @{ Loop = $true; Len = 9.0; FadeIn = 0.01; FadeOut = 0.7; AutoT = [double[]](0, 2.3, 3.0, 5.6, 6.3, 7.9, 8.7); AutoG = [double[]](0.85, 0.85, 0.3, 0.3, 0.85, 0.8, 0.3) }),
  (E 'wm1_underscore' 32.35 0.5 @{ Loop = $true; Off = 13.6; Len = 9.4; FadeIn = 0.6; FadeOut = 1.2; AutoT = [double[]](32.35, 39.0, 41.2); AutoG = [double[]](1, 0.8, 0.4) }),
  (E 'wm2_micro' 2.45 0.6 @{ Len = 3.7; FadeIn = 0.35; FadeOut = 0.5 }),
  # horror build from inside the body (the cue's silent start skipped) through the burning morning and the river
  (E 'wm3_tension' 7.9 0.6 @{ Off = 3.0; Len = 14.4; FadeIn = 0.4; FadeOut = 0.7; AutoT = [double[]](7.9, 9.5, 13.0, 19.0, 21.0, 22.3); AutoG = [double[]](1.2, 0.9, 0.9, 0.9, 1.0, 0.8) }),
  # second pass of the build: its loudest stretch lands on the venom and the sunrise
  (E 'wm3_tension' 21.7 0.6 @{ Off = 8.0; Len = 10.7; FadeIn = 0.6; FadeOut = 0.5; AutoT = [double[]](21.7, 26.0, 27.2, 29.0, 31.2, 32.4); AutoG = [double[]](0.8, 1.0, 0.85, 1.0, 0.9, 0.3) }),
  # resolution from "millimeter by millimeter": its peak carries the symbol reveal, still playing at the last frame
  (E 'wm4_resolution' 40.1 0.6 @{ FadeIn = 0.6; FadeOut = 0.1; AutoT = [double[]](40.1, 43.0, 45.9, 48.4); AutoG = [double[]](0.8, 0.9, 1.0, 1.25) })
)
$amb = @(
  (E 'wa1_bazaar' 0 0.42 @{ Loop = $true; Len = 3.3; FadeOut = 0.7 }),
  (E 'wa2_fields' 5.5 0.36 @{ Loop = $true; Len = 2.6; FadeIn = 0.4; FadeOut = 0.4 }),
  (E 'wa6_body' 7.8 0.45 @{ Loop = $true; Len = 5.5; FadeIn = 0.3; FadeOut = 0.4 }),
  (E 'wa4_hut' 12.85 0.22 @{ Loop = $true; Off = 3.0; Len = 6.4; FadeIn = 0.4; FadeOut = 0.5 }),
  (E 'wa3_river' 18.95 0.42 @{ Loop = $true; Len = 2.2; FadeIn = 0.5; FadeOut = 0.3 }),
  (E 'wa7_under' 20.95 0.5 @{ Loop = $true; Len = 5.5; FadeIn = 0.2; FadeOut = 0.25 }),
  (E 'wa3_river' 26.3 0.42 @{ Loop = $true; Off = 3.0; Len = 1.3; FadeIn = 0.15; FadeOut = 0.3 }),
  (E 'wa6_body' 27.0 0.45 @{ Loop = $true; Off = 3.0; Len = 4.5; FadeIn = 0.3; FadeOut = 0.5 }),
  (E 'wa4_hut' 32.2 0.34 @{ Loop = $true; Len = 13.2; FadeIn = 0.6; FadeOut = 0.6 }),
  (E 'wa5_city' 45.4 0.45 @{ FadeIn = 0.5; FadeOut = 0.1 })
)
# one-shots: [key, time, gain, 'p' = time is where the clip's peak lands | 's' = clip starts there]
$hits = @(
  @('ws1_pour', 0.05, 0.7, 's'), @('ws2_gulps', 1.6, 0.75, 's'), @('ws3_lens', 3.1, 0.75, 'p'), @('ws4_sting', 4.85, 0.7, 'p'), @('ws5_swallow', 5.4, 0.85, 'p'),
  @('ws32_tlvillage', 5.6, 0.45, 's'), @('ws33_bite', 5.95, 0.6, 's'), @('ws35_rooster', 6.05, 0.35, 's'), @('ws34_whip', 6.72, 0.6, 'p'), @('ws36_dive', 7.95, 0.75, 'p'),
  @('ws8_squirm', 9.0, 0.55, 's'), @('ws8_squirm', 10.4, 0.5, 's'), @('ws37_descend', 10.8, 0.65, 's'),
  @('ws9_heart', 13.1, 0.85, 'p'), @('ws10_groan', 13.75, 0.6, 's'), @('ws11_iron', 15.1, 0.75, 's'), @('ws12_blister', 17.05, 0.7, 's'), @('ws12_blister', 18.2, 0.4, 's'),
  @('ws13_heat', 19.35, 0.6, 'p'), @('ws14_splash', 20.4, 0.7, 'p'), @('ws15_quench', 20.42, 0.65, 's'), @('ws38_dunk', 20.85, 0.7, 's'),
  @('ws16_pop', 21.78, 0.85, 'p'), @('ws17_wormout', 21.95, 0.7, 's'), @('ws39_plunge', 23.98, 0.6, 'p'), @('ws18_grunt', 24.3, 0.6, 's'),
  @('ws19_slap', 26.02, 1.0, 'p'), @('ws40_surface', 26.25, 0.6, 's'), @('ws20_shout', 26.55, 0.4, 's'),
  @('ws41_gush', 27.3, 0.75, 'p'), @('ws42_stretch', 27.35, 0.6, 's'), @('ws22_snap', 28.1, 0.95, 'p'), @('ws23_venom', 29.05, 0.7, 's'), @('ws24_sunrise', 31.2, 0.6, 's'), @('ws25_sweep', 32.55, 0.6, 'p'),
  @('ws26_thread', 33.4, 0.6, 's'), @('ws27_creak', 36.2, 0.7, 's'), @('ws34_whip', 36.6, 0.45, 'p'), @('ws28_hiss', 36.8, 0.65, 'p'), @('ws27_creak', 38.1, 0.4, 's'), @('ws28_hiss', 39.9, 0.4, 'p'),
  @('ws29_lapse', 41.15, 0.55, 's'), @('ws30_morph', 45.5, 0.65, 'p'), @('ws31_impact', 45.95, 0.7, 'p'), @('ws31_impact', 48.35, 0.55, 'p')
)
$sfx = @()
foreach ($h in $hits) {
  if (-not [WormMix]::Clips.ContainsKey($h[0])) { Write-Host "missing clip $($h[0])"; continue }
  $t0 = [double]$h[1]; if ($h[3] -eq 'p') { $t0 -= [WormMix]::PeakAt($h[0]) }
  $sfx += (E $h[0] $t0 ([double]$h[2]) @{ FadeOut = 0.08 })
}
# ---------------- render buses
function NewBus { ,@((New-Object 'float[]' $N), (New-Object 'float[]' $N)) }
$busV = NewBus; $busS = NewBus; $busM = NewBus; $busA = NewBus
$ev = New-Object Ev; $ev.Key = 'vo'; $ev.T = 0; $ev.Gain = 1; $ev.FadeOut = 0.012; [WormMix]::Render($ev, $busV, $N)
foreach ($e in $sfx) { [WormMix]::Render($e, $busS, $N) }
foreach ($e in $music) { [WormMix]::Render($e, $busM, $N) }
foreach ($e in $amb) { [WormMix]::Render($e, $busA, $N) }
[WormMix]::Duck($busM, $busV, 7, $N); [WormMix]::Duck($busA, $busV, 5, $N); [WormMix]::Duck($busS, $busV, 2.5, $N)
foreach ($b in @($busS, $busM, $busA)) { [WormMix]::FadeEnd($b, $N, 0.12) }
# ---------------- levels: voice is the anchor
$gV = 0.86 / [math]::Max(0.2, [WormMix]::Peak($busV, $N))
$gS = 0.8; $gM = 0.85; $gA = 0.6
$mix = NewBus
for ($i = 0; $i -lt $N; $i++) { for ($c = 0; $c -lt 2; $c++) { $mix[$c][$i] = $busV[$c][$i] * $gV + $busS[$c][$i] * $gS + $busM[$c][$i] * $gM + $busA[$c][$i] * $gA } }
$pk = [WormMix]::Peak($mix, $N); $gMix = if ($pk -gt 0.97) { 0.97 / $pk } else { 1 }
"peak mix {0:0.00} -> gain {1:0.000}" -f $pk, $gMix
$rv = [WormMix]::Rms($busV, $N, 0, $N) * $gV; $rs = [WormMix]::Rms($busS, $N, 0, $N) * $gS; $rm = [WormMix]::Rms($busM, $N, 0, $N) * $gM; $ra = [WormMix]::Rms($busA, $N, 0, $N) * $gA
"rms dB  voice {0:0.0}  sfx {1:0.0}  music {2:0.0}  amb {3:0.0}" -f (20 * [math]::Log10($rv)), (20 * [math]::Log10($rs + 1e-9)), (20 * [math]::Log10($rm + 1e-9)), (20 * [math]::Log10($ra + 1e-9))
function WriteBus($b, $g, $path) { $w = New-Object Wav; $w.Rate = 48000; $w.Ch = 2; $w.Bits = 16; $w.S = [WormMix]::ToPcm($b, $N, $g); [AudioTool]::Write($path, $w) }
$od = (Resolve-Path $OutDir).Path
WriteBus $mix $gMix "$od\worm_mix.wav"
WriteBus $busV ($gV * $gMix) "$od\worm_voiceover.wav"
$sfxBus = NewBus; for ($i = 0; $i -lt $N; $i++) { for ($c = 0; $c -lt 2; $c++) { $sfxBus[$c][$i] = $busS[$c][$i] * $gS + $busA[$c][$i] * $gA } }
WriteBus $sfxBus $gMix "$od\worm_sfx.wav"
WriteBus $busM ($gM * $gMix) "$od\worm_music.wav"
"wrote mix + stems: {0:0.000}s" -f ($N / 48000)
