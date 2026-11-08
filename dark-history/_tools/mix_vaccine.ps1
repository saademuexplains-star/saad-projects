# Mix for "The First Vaccine" (loops): ElevenLabs music beds + ambiences + one-shot SFX around the voice-over.
# Writes the full mix and separate stems (voice, sfx, music), all exactly -Frames/-Fps long.
param([string]$Vo = '_vo9\vo_tight.wav', [string]$Dir = '_sfx9\wav', [string]$OutDir = '_vo9', [int]$Frames = 3265, [int]$Fps = 60)
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
# ---------------- the arrangement
$music = @(
  # the surgery underscore from the strap to the window (starts 10 s into the cue, past its dip)
  (E 'vm1_surgery' 0 0.55 @{ Loop = $true; Off = 13.5; Len = 11.9; FadeIn = 0.01; FadeOut = 0.8; AutoT = [double[]](0, 2.4, 5.4, 8.5, 11.0); AutoG = [double[]](0.9, 1.05, 0.95, 1.05, 1.0) }),
  # the plague street: cello and the funeral bell
  (E 'vm4_plague' 11.45 0.75 @{ Loop = $true; Off = 4.0; Len = 5.7; FadeIn = 0.5; FadeOut = 0.6 }),
  # back in the chair while you pull against the strap
  (E 'vm1_surgery' 16.6 0.55 @{ Loop = $true; Off = 20.5; Len = 4.9; FadeIn = 0.5; FadeOut = 0.5 }),
  # the cow, the blood, three days of fever (softer at dawn), tied down again, the dying man, the watch
  (E 'vm2_fever' 21.0 0.5 @{ Loop = $true; Off = 6.0; Len = 19.5; FadeIn = 0.6; FadeOut = 0.5; AutoT = [double[]](21.0, 24.0, 27.1, 28.4, 28.9, 30.3, 31.0, 37.5, 40.2); AutoG = [double[]](0.9, 1.0, 1.15, 1.15, 0.5, 0.55, 1.0, 1.1, 1.25) }),
  # the battle in the blood, the twenty cuts, the word; it runs into the loop seam
  (E 'vm3_triumph' 40.05 0.6 @{ Len = 3.6; FadeIn = 0.4; FadeOut = 0.45; AutoT = [double[]](40.05, 42.0); AutoG = [double[]](0.8, 1.0) }),
  (E 'vm3_triumph' 43.25 0.6 @{ Loop = $true; Off = 5.0; Len = ($T - 43.25); FadeIn = 0.45; FadeOut = 0.01; AutoT = [double[]](43.25, 44.9, 48.6, 50.4, 53.4); AutoG = [double[]](0.9, 0.85, 1.0, 0.85, 1.15) })
)
$amb = @(
  (E 'va1_study' 0 1.1 @{ Loop = $true; Len = 11.8; FadeOut = 0.5 }),
  (E 'va2_street' 11.45 1.1 @{ Loop = $true; Len = 5.7; FadeIn = 0.4; FadeOut = 0.5 }),
  (E 'va1_study' 16.6 1.1 @{ Loop = $true; Off = 3.0; Len = 4.8; FadeIn = 0.4; FadeOut = 0.4 }),
  (E 'va3_barn' 21.0 1.1 @{ Loop = $true; Len = 1.9; FadeIn = 0.25; FadeOut = 0.3 }),
  (E 'va6_blood' 22.3 1.15 @{ Loop = $true; Len = 1.95; FadeIn = 0.3; FadeOut = 0.4 }),
  (E 'va4_sick' 23.65 1.1 @{ Loop = $true; Len = 7.35; FadeIn = 0.4; FadeOut = 0.5 }),
  (E 'va1_study' 30.4 1.1 @{ Loop = $true; Off = 1.0; Len = 3.2; FadeIn = 0.4; FadeOut = 0.4 }),
  (E 'va5_hovel' 33.0 1.15 @{ Loop = $true; Len = 4.75; FadeIn = 0.4; FadeOut = 0.4 }),
  (E 'va1_study' 37.15 1.1 @{ Loop = $true; Off = 2.0; Len = 3.3; FadeIn = 0.4; FadeOut = 0.4 }),
  (E 'va6_blood' 39.95 1.15 @{ Loop = $true; Off = 2.0; Len = 3.8; FadeIn = 0.4; FadeOut = 0.5 }),
  (E 'va1_study' 43.15 1.1 @{ Loop = $true; Off = 4.0; Len = ($T - 43.15 - 0.4); FadeIn = 0.5; FadeOut = 0.4 }),
  # the study tone comes back under the loop dissolve and runs straight on into t = 0
  (E 'va1_study' ($T - 0.65) 1.1 @{ Loop = $true; Off = [LeechMix]::Dur('va1_study') - 0.65; FadeIn = 0.5 })
)
# one-shots: [key, time, gain, 'p' = the clip's peak lands on the time | 's' = the clip starts there]
$hits = @(
  @('vs4_boom', 0.0, 0.7, 'p'), @('vs1_strap', 0.55, 0.75, 'p'), @('vs2_gasp', 0.6, 0.5, 's'), @('vs1_strap', 1.25, 0.5, 'p'), @('vs3_lancet', 1.95, 0.6, 'p'), @('vs11_riser', 2.45, 0.45, 'p'),
  @('vs5_slice', 2.65, 0.85, 's'), @('vs6_cry', 3.1, 0.55, 's'), @('vs7_shing', 4.75, 0.55, 'p'), @('vs29_whoosh', 5.5, 0.5, 'p'),
  @('vs9_wince', 5.65, 0.55, 's'), @('vs8_squelch', 5.8, 0.7, 'p'), @('vs31_gloop', 8.55, 0.55, 'p'),
  @('vs10_rub', 9.2, 0.75, 's'), @('vs2_gasp', 9.35, 0.4, 's'), @('vs30_shimmer', 10.75, 0.4, 'p'),
  @('vs29_whoosh', 11.75, 0.5, 'p'), @('vs12_bell', 11.85, 0.6, 's'), @('vs14_cough', 12.0, 0.6, 's'), @('vs13_collapse', 13.5, 0.7, 's'), @('vs4_boom', 13.8, 0.45, 'p'), @('vs14_cough', 14.2, 0.5, 's'),
  @('vs32_reverse', 16.8, 0.45, 'p'), @('vs15_struggle', 17.85, 0.7, 's'), @('vs10_rub', 19.6, 0.5, 's'), @('vs11_riser', 21.3, 0.45, 'p'),
  @('vs16_moo', 21.5, 0.8, 's'), @('vs17_heart', 22.65, 0.7, 'p'), @('vs17_heart', 23.25, 0.6, 'p'), @('vs30_shimmer', 23.95, 0.4, 'p'),
  @('vs18_shiver', 24.4, 0.55, 's'), @('vs18_shiver', 26.9, 0.6, 's'), @('vs24_heartfast', 27.1, 0.35, 's'), @('vs19_rooster', 28.7, 0.5, 's'), @('vs33_sigh', 29.1, 0.6, 's'), @('vs34_relief', 29.6, 0.5, 's'), @('vs20_door', 29.85, 0.55, 's'), @('vs25_drop', 30.7, 0.55, 'p'),
  @('vs1_strap', 30.8, 0.7, 'p'), @('vs2_gasp', 31.0, 0.45, 's'), @('vs3_lancet', 32.2, 0.55, 'p'), @('vs7_shing', 32.85, 0.6, 'p'), @('vs4_boom', 33.3, 0.55, 'p'),
  @('vs21_rattle', 33.5, 0.7, 's'), @('vs22_scrape', 35.8, 0.8, 's'), @('vs21_rattle', 36.0, 0.45, 's'), @('vs29_whoosh', 37.45, 0.5, 'p'),
  @('vs10_rub', 37.6, 0.75, 's'), @('vs6_cry', 37.8, 0.5, 's'), @('vs32_reverse', 38.95, 0.4, 'p'),
  @('vs23_watch', 38.9, 0.6, 's'), @('vs24_heartfast', 39.0, 0.6, 's'), @('vs25_drop', 40.3, 0.7, 'p'),
  @('vs17_heart', 40.9, 0.6, 'p'), @('vs26_crunch', 41.75, 0.7, 's'), @('vs26_crunch', 42.4, 0.55, 's'), @('vs30_shimmer', 42.9, 0.45, 'p'), @('vs32_reverse', 43.45, 0.4, 'p'),
  @('vs5_slice', 45.25, 0.75, 's'), @('vs10_rub', 46.4, 0.6, 's'), @('vs17_heart', 47.55, 0.45, 'p'), @('vs17_heart', 47.9, 0.45, 'p'), @('vs17_heart', 48.25, 0.45, 'p'), @('vs29_whoosh', 48.6, 0.45, 'p'),
  @('vs23_watch', 48.9, 0.45, 's'), @('vs30_shimmer', 50.4, 0.45, 'p'), @('vs27_quill', 51.85, 0.7, 's'), @('vs28_final', 53.6, 0.75, 'p')
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
$seamEv = E 'vm1_surgery' 0 0.55 @{ Loop = $true; Off = 13.5 - $L; Len = $L; FadeIn = 0.001; FadeOut = 0.001; AutoT = [double[]](0); AutoG = [double[]](1.0) }
$preFull = NewBus; [LeechMix]::Render($seamEv, $preFull, $N)
[LeechMix]::Seam($busM, $preFull, $N, $L)
[LeechMix]::Duck($busM, $busV, 7, $N); [LeechMix]::Duck($busA, $busV, 5, $N); [LeechMix]::Duck($busS, $busV, 2.5, $N)
# ---------------- levels: voice is the anchor
$gV = 0.86 / [math]::Max(0.2, [LeechMix]::Peak($busV, $N))
$gS = 0.58; $gM = 0.92; $gA = 0.24
$mix = NewBus
for ($i = 0; $i -lt $N; $i++) { for ($c = 0; $c -lt 2; $c++) { $mix[$c][$i] = $busV[$c][$i] * $gV + $busS[$c][$i] * $gS + $busM[$c][$i] * $gM + $busA[$c][$i] * $gA } }
$pk = [LeechMix]::Peak($mix, $N); $gMix = if ($pk -gt 0.97) { 0.97 / $pk } else { 1 }
"peak mix {0:0.00} -> gain {1:0.000}" -f $pk, $gMix
$rv = [LeechMix]::Rms($busV, $N, 0, $N) * $gV; $rs = [LeechMix]::Rms($busS, $N, 0, $N) * $gS; $rm = [LeechMix]::Rms($busM, $N, 0, $N) * $gM; $ra = [LeechMix]::Rms($busA, $N, 0, $N) * $gA
"rms dB  voice {0:0.0}  sfx {1:0.0}  music {2:0.0}  amb {3:0.0}" -f (20 * [math]::Log10($rv)), (20 * [math]::Log10($rs + 1e-9)), (20 * [math]::Log10($rm + 1e-9)), (20 * [math]::Log10($ra + 1e-9))
function WriteBus($b, $g, $path) { $w = New-Object Wav; $w.Rate = 48000; $w.Ch = 2; $w.Bits = 16; $w.S = [LeechMix]::ToPcm($b, $N, $g); [AudioTool]::Write($path, $w) }
$od = (Resolve-Path $OutDir).Path
WriteBus $mix $gMix "$od\vaccine_mix.wav"
WriteBus $busV ($gV * $gMix) "$od\vaccine_voiceover.wav"
$sfxBus = NewBus; for ($i = 0; $i -lt $N; $i++) { for ($c = 0; $c -lt 2; $c++) { $sfxBus[$c][$i] = $busS[$c][$i] * $gS + $busA[$c][$i] * $gA } }
WriteBus $sfxBus $gMix "$od\vaccine_sfx.wav"
WriteBus $busM ($gM * $gMix) "$od\vaccine_music.wav"
"wrote mix + stems: {0:0.000}s" -f ($N / 48000)
