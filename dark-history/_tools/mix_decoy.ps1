# Mix for "The King's Decoy" (loops): ElevenLabs music beds + ambiences + one-shot SFX around the voice-over.
# Writes the full mix and separate stems (voice, sfx, music), all exactly -Frames/-Fps long.
param([string]$Vo = '_vo11\vo_tight.wav', [string]$Dir = '_sfx11\wav', [string]$OutDir = '_vo11', [int]$Frames = 3454, [int]$Fps = 60)
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
  # the court: the crowning, the gate, the coach's roulette (it drops back under "every trip", swells at the arrow)
  (E 'dm1_court' 0 0.55 @{ Loop = $true; Len = 12.85; FadeIn = 0.01; FadeOut = 0.6; AutoT = [double[]](0, 4.6, 7.4, 9.0, 11.7, 12.4); AutoG = [double[]](0.9, 1.0, 1.15, 0.9, 1.15, 0.9) }),
  # the pass and the ridge: the journey, the king beside you, the bridge, the powder, the brother
  (E 'dm1_court' 0 0.3 @{ Loop = $true; Off = 11.0; Len = 12.85; FadeIn = 0.01; FadeOut = 0.6 }),
  (E 'dm2_pass' 12.25 0.35 @{ Loop = $true; Off = 11.5; Len = 18.9; FadeIn = 0.5; FadeOut = 0.6 }),
  (E 'dm2_pass' 12.25 0.6 @{ Loop = $true; Off = 1.0; Len = 18.9; FadeIn = 0.5; FadeOut = 0.6; AutoT = [double[]](12.25, 15.0, 20.3, 25.2, 28.0, 30.5); AutoG = [double[]](0.8, 0.95, 1.1, 1.2, 1.1, 0.9) }),
  # the brake, the gibbet, the village burning
  (E 'dm3_dread' 30.85 0.55 @{ Loop = $true; Off = 13.0; Len = 17.6; FadeIn = 0.5; FadeOut = 1.6; AutoT = [double[]](30.85, 33.3, 35.1, 38.6, 41.0, 43.5, 45.0, 46.5); AutoG = [double[]](0.8, 0.9, 0.65, 1.0, 0.95, 1.15, 1.0, 0.95) }),
  # the order, the gallop, the blast, the fall; it runs into the loop seam
  (E 'dm4_climax' 46.6 0.6 @{ Loop = $true; Off = 16.5; Len = 7.2; FadeIn = 1.4; FadeOut = 0.3; AutoT = [double[]](46.6, 50.8, 53.6); AutoG = [double[]](0.85, 1.05, 1.1) }),
  (E 'dm4_climax' 53.5 0.6 @{ Loop = $true; Off = 16.0; Len = ($T - 53.5); FadeIn = 0.3; FadeOut = 0.01; AutoT = [double[]](53.5, 55.0, 56.3, 57.5); AutoG = [double[]](1.0, 1.1, 1.3, 1.45) })
)
$amb = @(
  (E 'da1_chamber' 0 1.1 @{ Loop = $true; Len = 5.0; FadeOut = 0.5 }),
  (E 'da2_crowd' 4.45 1.0 @{ Loop = $true; Len = 4.9; FadeIn = 0.4; FadeOut = 0.5; AutoT = [double[]](4.45, 7.45, 7.9, 8.4); AutoG = [double[]](1.0, 1.0, 0.45, 0.35) }),
  (E 'da3_coach' 8.75 1.0 @{ Loop = $true; Len = 4.2; FadeIn = 0.3; FadeOut = 0.5 }),
  (E 'da4_pass' 12.35 1.0 @{ Loop = $true; Len = 13.2; FadeIn = 0.4; FadeOut = 0.5 }),
  (E 'da5_ridge' 24.95 1.0 @{ Loop = $true; Len = 6.5; FadeIn = 0.4; FadeOut = 0.5 }),
  (E 'da3_coach' 30.85 0.9 @{ Loop = $true; Off = 5.0; Len = 7.9; FadeIn = 0.4; FadeOut = 0.5 }),
  (E 'da6_dusk' 38.25 1.0 @{ Loop = $true; Len = 3.1; FadeIn = 0.4; FadeOut = 0.4 }),
  (E 'da7_village' 40.75 1.0 @{ Loop = $true; Len = 4.5; FadeIn = 0.4; FadeOut = 0.4; AutoT = [double[]](40.75, 42.4, 44.0); AutoG = [double[]](0.6, 0.9, 1.15) }),
  (E 'da4_pass' 44.75 1.0 @{ Loop = $true; Off = 6.0; Len = ($T - 44.75 - 0.4); FadeIn = 0.4; FadeOut = 0.4 }),
  # the chamber tone comes back under the loop dissolve and runs straight on into t = 0
  (E 'da1_chamber' ($T - 0.65) 1.1 @{ Loop = $true; Off = [LeechMix]::Dur('da1_chamber') - 0.65; FadeIn = 0.5 })
)
# one-shots: [key, time, gain, 'p' = the clip's peak lands on the time | 's' = the clip starts there, optional event options]
$hits = @(
  # the crowning: the downbeat, the crown seating on your head, the silk, the tilt down into the gate
  @('ds13_boom', 0.02, 0.5, 'p'), @('ds1_crown', 1.05, 0.85, 'p'), @('ds11_heart', 1.8, 0.4, 'p'), @('ds2_cloth', 2.65, 0.6, 's'), @('ds2_cloth', 3.45, 0.45, 's'), @('ds3_whoosh', 4.8, 0.5, 'p'),
  # the gate: the portcullis, the fanfare, the wheels, the bow drawn and loosed, the arrow, the crowd's gasp, the second arrow at your chest
  @('ds36_portcullis', 4.55, 0.5, 's'), @('ds8_fanfare', 5.15, 0.5, 's'), @('ds9_wheels', 5.5, 0.55, 's', @{ Len = 3.4; FadeOut = 0.4 }), @('ds21_snort', 6.25, 0.4, 's'),
  @('ds4_bow', 7.05, 0.75, 'p'), @('ds5_arrowfly', 7.12, 0.7, 's'), @('ds6_arrowhit', 7.43, 0.95, 'p'), @('ds13_boom', 7.43, 0.4, 'p'), @('ds32_crowdgasp', 7.5, 0.6, 's'),
  @('ds5_arrowfly', 8.0, 0.65, 's'), @('ds6_arrowhit', 8.29, 1.0, 'p'), @('ds7_gasp', 8.32, 0.8, 's'), @('ds11_heart', 8.62, 0.5, 'p'), @('ds3_whoosh', 9.0, 0.45, 'p'),
  # inside: heartbeats, the arrow punching through beside your head, your gasp; through the window into the pass
  @('ds11_heart', 10.0, 0.5, 'p'), @('ds11_heart', 10.8, 0.5, 'p'), @('ds12_riser', 11.72, 0.5, 'p'), @('ds10_punch', 11.72, 1.0, 'p'), @('ds7_gasp', 11.76, 0.7, 's'), @('ds3_whoosh', 12.6, 0.45, 'p'),
  # the pass: a snort, the king's face, the pull out to the bridge, the powder, the brother
  @('ds21_snort', 13.6, 0.35, 's'), @('ds11_heart', 16.2, 0.45, 'p'), @('ds3_whoosh', 19.3, 0.5, 'p'), @('ds13_boom', 20.3, 0.5, 'p'), @('ds11_heart', 21.95, 0.5, 'p'),
  @('ds12_riser', 25.25, 0.5, 'p'), @('ds13_boom', 25.3, 0.55, 'p'),
  # the ridge: the torch, heartbeats on the stare, down the edge, the rack to the brake
  @('ds14_torch', 26.1, 0.7, 's'), @('ds11_heart', 28.0, 0.55, 'p'), @('ds11_heart', 28.6, 0.55, 'p'), @('ds3_whoosh', 30.2, 0.4, 'p'), @('ds3_whoosh', 31.2, 0.3, 'p'),
  # the brake: the lever rattling under your hand, heartbeats, the dry swallows; into the gibbet
  @('ds16_lever', 31.9, 0.6, 's'), @('ds11_heart', 32.1, 0.6, 'p'), @('ds16_lever', 32.35, 0.45, 's'), @('ds11_heart', 32.9, 0.6, 'p'), @('ds15_swallow', 33.55, 0.9, 's'), @('ds15_swallow', 37.3, 0.85, 's'),
  @('ds12_riser', 38.6, 0.4, 'p'), @('ds3_whoosh', 38.6, 0.3, 'p'),
  # the gibbet: the rope, the hit on "ambush", the crows
  @('ds17_rope', 38.5, 0.7, 's'), @('ds13_boom', 39.97, 0.45, 'p'), @('ds18_crows', 40.0, 0.7, 's'),
  # the village: your wife's gasp, the torches, the roofs going up; the pine across the lens
  @('ds20_woman', 41.3, 0.55, 's'), @('ds14_torch', 42.0, 0.5, 's'), @('ds19_roofire', 42.5, 0.7, 's'), @('ds19_roofire', 43.6, 0.6, 's'), @('ds3_whoosh', 45.0, 0.45, 'p'),
  # the pass again: you lean out, the coach halts, the king's spurs, the gallop onto the stones, the fuse, the blast,
  # the debris, the horse's scream, the fall, the second ball of fire, the last hit carried over the loop
  @('ds35_lean', 44.95, 0.8, 's'), @('ds22_halt', 46.95, 0.7, 's'), @('ds21_snort', 48.7, 0.4, 's'), @('ds11_heart', 49.8, 0.5, 'p'),
  @('ds24_spur', 50.95, 0.85, 'p'), @('ds23_gallop', 51.1, 0.85, 's'), @('ds33_stonehooves', 52.1, 0.8, 's'), @('ds25_fuse', 51.9, 0.75, 's', @{ Len = 1.8; FadeOut = 0.1 }), @('ds12_riser', 53.62, 0.6, 'p'),
  @('ds26_explosion', 53.65, 0.8, 'p'), @('ds13_boom', 53.65, 0.5, 'p'), @('ds34_rumble', 53.8, 0.5, 's'), @('ds27_debris', 54.0, 0.5, 's'), @('ds28_horsescream', 54.2, 0.55, 's'),
  @('ds31_fallscream', 54.5, 0.6, 's'), @('ds29_fall', 54.5, 0.7, 's'), @('ds30_fireball', 56.0, 0.9, 'p'), @('ds37_final', 57.3, 0.8, 'p')
)
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
# music loop seam: crossfade the last L seconds toward what the court music plays just before t = 0
$L = 0.7
$seamEv = E 'dm1_court' 0 0.55 @{ Loop = $true; Off = -$L; Len = $L; FadeIn = 0.001; FadeOut = 0.001; AutoT = [double[]](0); AutoG = [double[]](0.9) }
$preFull = NewBus; [LeechMix]::Render($seamEv, $preFull, $N)
[LeechMix]::Seam($busM, $preFull, $N, $L)
[LeechMix]::Duck($busM, $busV, 7, $N); [LeechMix]::Duck($busA, $busV, 5, $N); [LeechMix]::Duck($busS, $busV, 2.5, $N)
# ---------------- levels: voice is the anchor
$gV = 0.86 / [math]::Max(0.2, [LeechMix]::Peak($busV, $N))
$gS = 0.5; $gM = 0.82; $gA = 0.21
$mix = NewBus
for ($i = 0; $i -lt $N; $i++) { for ($c = 0; $c -lt 2; $c++) { $mix[$c][$i] = $busV[$c][$i] * $gV + $busS[$c][$i] * $gS + $busM[$c][$i] * $gM + $busA[$c][$i] * $gA } }
$pkI = 0; $pkV = 0.0; for ($i = 0; $i -lt $N; $i += 1) { $v = [math]::Abs($mix[0][$i]); if ($v -gt $pkV) { $pkV = $v; $pkI = $i } }; "loudest sample at {0:0.000}s" -f ($pkI / 48000)
$pk = [LeechMix]::Peak($mix, $N); $gMix = if ($pk -gt 0.97) { 0.97 / $pk } else { 1 }
"peak mix {0:0.00} -> gain {1:0.000}" -f $pk, $gMix
$rv = [LeechMix]::Rms($busV, $N, 0, $N) * $gV; $rs = [LeechMix]::Rms($busS, $N, 0, $N) * $gS; $rm = [LeechMix]::Rms($busM, $N, 0, $N) * $gM; $ra = [LeechMix]::Rms($busA, $N, 0, $N) * $gA
"rms dB  voice {0:0.0}  sfx {1:0.0}  music {2:0.0}  amb {3:0.0}" -f (20 * [math]::Log10($rv)), (20 * [math]::Log10($rs + 1e-9)), (20 * [math]::Log10($rm + 1e-9)), (20 * [math]::Log10($ra + 1e-9))
function WriteBus($b, $g, $path) { $w = New-Object Wav; $w.Rate = 48000; $w.Ch = 2; $w.Bits = 16; $w.S = [LeechMix]::ToPcm($b, $N, $g); [AudioTool]::Write($path, $w) }
$od = (Resolve-Path $OutDir).Path
WriteBus $mix $gMix "$od\decoy_mix.wav"
WriteBus $busV ($gV * $gMix) "$od\decoy_voiceover.wav"
$sfxBus = NewBus; for ($i = 0; $i -lt $N; $i++) { for ($c = 0; $c -lt 2; $c++) { $sfxBus[$c][$i] = $busS[$c][$i] * $gS + $busA[$c][$i] * $gA } }
WriteBus $sfxBus $gMix "$od\decoy_sfx.wav"
WriteBus $busM ($gM * $gMix) "$od\decoy_music.wav"
"wrote mix + stems: {0:0.000}s" -f ($N / 48000)




