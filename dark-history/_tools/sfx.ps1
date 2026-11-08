# Synthesises the music bed + sound effects for "The Messenger" and mixes them under the voiceover.
# Output: 48 kHz stereo 16-bit WAV, exactly $Frames/30 s long (so the loop is seamless).
param([string]$Vo = '_vo\vo_tight.wav', [string]$Out = '_vo\mix.wav', [int]$Frames = 1372, [double]$MusicDb = -21, [double]$SfxDb = -9, [switch]$NoMusic)
$ErrorActionPreference = 'Stop'
$OutPath = $Out
. "$PSScriptRoot\audiotool.ps1" -Mode none
if (-not ('Synth' -as [type])) {
Add-Type -TypeDefinition @'
using System;
using System.Collections.Generic;
public class Synth {
  public int SR = 48000; public int N; public double[] L, R; uint rs = 2463534242;
  public Synth(int n) { N = n; L = new double[n]; R = new double[n]; }
  public double Rnd() { rs ^= rs << 13; rs ^= rs >> 17; rs ^= rs << 5; return (rs / 4294967296.0) * 2 - 1; }
  int I(double t) { return (int)Math.Round(t * SR); }
  void Put(int i, double v, double pan) { if (i < 0 || i >= N) return; double a = (pan + 1) * Math.PI / 4; L[i] += v * Math.Cos(a); R[i] += v * Math.Sin(a); }

  // band-passed noise sweep (state-variable filter); peak loudness at tc; pan moves p0 -> p1
  public void Whoosh(double tc, double dur, double f0, double f1, double f2, double g, double p0, double p1, double q) {
    int a = I(tc - dur / 2), n = I(dur); double lo = 0, bp = 0;
    for (int k = 0; k < n; k++) {
      double u = (double)k / n, fc = u < 0.5 ? f0 + (f1 - f0) * (u * 2) : f1 + (f2 - f1) * ((u - 0.5) * 2);
      double F = 2 * Math.Sin(Math.PI * Math.Min(fc, SR / 6.0) / SR), x = Rnd();
      double hi = x - lo - q * bp; bp += F * hi; lo += F * bp;
      double env = Math.Pow(Math.Sin(Math.PI * u), 2.2);
      Put(a + k, bp * env * g, p0 + (p1 - p0) * u);
    }
  }
  // low boom with falling pitch + noise thump
  public void Boom(double t, double g, double f0, double f1, double dec) {
    int a = I(t), n = I(dec * 4); double ph = 0, lo = 0;
    for (int k = 0; k < n; k++) {
      double tt = (double)k / SR, f = f1 + (f0 - f1) * Math.Exp(-tt * 6); ph += 2 * Math.PI * f / SR;
      lo += 0.02 * (Rnd() - lo);
      double v = (Math.Sin(ph) * 0.9 + lo * 2.5 * Math.Exp(-tt * 30)) * Math.Exp(-tt / dec) * Math.Min(1, tt * 400);
      Put(a + k, v * g, 0);
    }
  }
  // metallic / bell: inharmonic partials with individual decays
  public void Bell(double t, double f, double[] ratios, double[] amps, double dec, double g, double pan) {
    int a = I(t), n = I(dec * 5);
    for (int j = 0; j < ratios.Length; j++) {
      double w = 2 * Math.PI * f * ratios[j] / SR, d = dec / (1 + j * 0.35);
      for (int k = 0; k < n; k++) { double tt = (double)k / SR; Put(a + k, Math.Sin(w * k) * amps[j] * Math.Exp(-tt / d) * Math.Min(1, tt * 600) * g, pan); }
    }
  }
  public void Coin(double t, double f, double g, double pan) { Bell(t, f, new double[] { 1, 2.76, 5.4, 8.93 }, new double[] { 1, 0.6, 0.35, 0.2 }, 0.18, g, pan); Click(t, g * 0.6, 4000, pan); }
  // short filtered noise click / crack
  public void Click(double t, double g, double hp, double pan) {
    int a = I(t), n = I(0.04); double lo = 0, F = 2 * Math.Sin(Math.PI * hp / SR);
    for (int k = 0; k < n; k++) { double x = Rnd(); lo += F * (x - lo); Put(a + k, (x - lo) * Math.Exp(-k / (SR * 0.006)) * g, pan); }
  }
  // scratchy band noise (quill, paper) between t0 and t1 with bursty envelope
  public void Scratch(double t0, double t1, double fc, double q, double g, double rate, double pan) {
    int a = I(t0), n = I(t1 - t0); double lo = 0, bp = 0, F = 2 * Math.Sin(Math.PI * fc / SR), ph = 0, fade = SR * 0.03;
    for (int k = 0; k < n; k++) {
      double x = Rnd(), hi = x - lo - q * bp; bp += F * hi; lo += F * bp;
      ph += rate / SR * (1 + 0.5 * Math.Sin(k * 0.0007)); double burst = Math.Pow(Math.Max(0, Math.Sin(2 * Math.PI * ph)), 3);
      double edge = Math.Min(1, Math.Min(k / fade, (n - k) / fade));
      Put(a + k, bp * (0.25 + burst) * edge * g, pan);
    }
  }
  // fire crackle ambience
  public void Crackle(double t0, double t1, double g, double density) {
    int a = I(t0), n = I(t1 - t0); double lo = 0;
    for (int k = 0; k < n; k++) {
      lo += 0.004 * (Rnd() - lo);
      double edge = Math.Min(1, Math.Min(k / (SR * 0.3), (n - k) / (SR * 0.3)));
      Put(a + k, lo * 3 * g * edge, 0);
      if ((Rnd() + 1) / 2 < density / SR) Click((double)(a + k) / SR, g * (0.3 + (Rnd() + 1) * 0.5), 1500 + (Rnd() + 1) * 2000, Rnd() * 0.6);
    }
  }
  // Karplus-Strong plucked string (lute-ish)
  public void Pluck(double t, double f, double g, double dur, double pan, double bright) {
    int a = I(t), n = I(dur), P = Math.Max(2, (int)Math.Round(SR / f)); double[] buf = new double[P];
    double lo = 0; for (int i = 0; i < P; i++) { lo += bright * (Rnd() - lo); buf[i] = lo; }
    int idx = 0; double prev = 0;
    for (int k = 0; k < n; k++) {
      double cur = buf[idx]; int nx = (idx + 1) % P; double v = 0.996 * 0.5 * (cur + buf[nx]); buf[idx] = v; idx = nx;
      double env = Math.Min(1, k / (SR * 0.002)) * Math.Min(1, (n - k) / (SR * 0.05));
      prev += 0.35 * (cur - prev);
      Put(a + k, prev * env * g, pan);
    }
  }
  // drone: detuned saws through a soft low-pass, slow swell; amp(t) shapes the section dynamics
  // segT/segA: piecewise section gains (smoothed)
  public void Drone(double[] freqs, double g, double[] segT, double[] segA) {
    double[] ph = new double[freqs.Length * 2]; double lo1 = 0, lo2 = 0, F = 2 * Math.Sin(Math.PI * 520.0 / SR), a = segA[0];
    int si = 0;
    for (int k = 0; k < N; k++) {
      double tt = (double)k / SR, s = 0;
      while (si + 1 < segT.Length && tt >= segT[si + 1]) si++;
      a += (segA[si] - a) * 0.00005;
      for (int j = 0; j < freqs.Length; j++) for (int d = 0; d < 2; d++) { int q = j * 2 + d; ph[q] += freqs[j] * (1 + (d == 0 ? -0.003 : 0.003)) / SR; ph[q] -= Math.Floor(ph[q]); s += (ph[q] * 2 - 1) / freqs.Length; }
      lo1 += F * (s - lo1); lo2 += F * (lo1 - lo2);
      double v = lo2 * g * a * (0.85 + 0.15 * Math.Sin(tt * 0.9));
      L[k] += v; R[k] += v;
    }
  }
  // voice + ducked music + sfx, soft-clipped, interleaved 16-bit stereo
  public static short[] Mix(short[] vo, int ch, Synth mu, Synth sx, double gM, double gS) {
    int n = mu.N; var o = new short[n * 2]; double e = 0;
    for (int k = 0; k < n; k++) {
      int i = k * ch; double vl = 0, vr = 0;
      if (i < vo.Length) { vl = vo[i] / 32768.0; vr = ch > 1 && i + 1 < vo.Length ? vo[i + 1] / 32768.0 : vl; }
      e = Math.Max(Math.Abs(vl), e * 0.99985);
      double duck = 1.0 - 0.45 * Math.Min(1.0, e * 6);
      double l = vl + mu.L[k] * gM * duck + sx.L[k] * gS, r = vr + mu.R[k] * gM * duck + sx.R[k] * gS;
      l = Math.Tanh(l * 1.05) / 1.05; r = Math.Tanh(r * 1.05) / 1.05;
      o[k * 2] = (short)Math.Max(-32767, Math.Min(32767, l * 32767)); o[k * 2 + 1] = (short)Math.Max(-32767, Math.Min(32767, r * 32767));
    }
    return o;
  }
}
'@
}
$fps = 30.0; $T = $Frames / $fps
$voW = [AudioTool]::Read((Resolve-Path $Vo).Path); $sr = $voW.Rate
$N = [int][Math]::Round($T * $sr)
$sx = New-Object Synth $N; $sx.SR = $sr
$mu = New-Object Synth $N; $mu.SR = $sr

# ---------------- music bed: bars sized so 19 bars == the whole video (seamless loop) ----------------
if (-not $NoMusic) {
  $bar = $T / 19.0; $e8 = $bar / 8
  $hz = @{ 'A2' = 110.0; 'Bb2' = 116.54; 'C3' = 130.81; 'D3' = 146.83; 'E3' = 164.81; 'F3' = 174.61; 'G3' = 196.0; 'A3' = 220.0; 'Bb3' = 233.08; 'C#4' = 277.18; 'C4' = 261.63; 'D4' = 293.66; 'E4' = 329.63; 'F4' = 349.23; 'G4' = 392.0; 'A4' = 440.0; 'C5' = 523.25; 'D5' = 587.33; 'F5' = 698.46; 'A5' = 880.0 }
  $pat = @(
    @('D4','F4','A4','F4','D4','F4','A4','C5'),
    @('D4','F4','A4','D5','C5','A4','F4','A4'),
    @('Bb3','D4','F4','D4','Bb3','D4','F4','D4'),
    @('A3','C#4','E4','A4','E4','C#4','A3','E4'))
  $bass = @('D3','D3','Bb2','A2')
  # sections: 1 = full, 0.5 = sparse, 0 = silent pluck
  function Sec($t) {
    if ($t -ge 12.83 -and $t -lt 14.2) { return 0 }
    if ($t -ge 23.94 -and $t -lt 30.34) { return 0 }
    if ($t -ge 30.34 -and $t -lt 33.16) { return 0.35 }
    return 1
  }
  for ($b = 0; $b -lt 19; $b++) {
    $p = $pat[$b % 4]
    for ($i = 0; $i -lt 8; $i++) {
      $t = $b * $bar + $i * $e8; $s = Sec $t; if ($s -le 0) { continue }
      if ($s -lt 1 -and ($i % 2) -eq 1) { continue }
      $f = $hz[$p[$i]]; $oct = if ($t -ge 36.33 -and $t -lt 40.04) { 2 } else { 1 }
      $acc = if ($i -eq 0) { 1.0 } else { 0.72 }
      $mu.Pluck($t, $f * $oct, 0.30 * $acc * $s, 1.4, (($i % 2) * 0.5 - 0.25), 0.55)
    }
    $tb = $b * $bar; if ((Sec $tb) -gt 0) { $mu.Pluck($tb, $hz[$bass[$b % 4]] / 2, 0.42 * (Sec $tb), 2.2, 0, 0.3) }
    # frame-drum on bar starts in the driving sections
    if ($tb -lt 12.8 -or $tb -ge 42.0) { $mu.Boom($tb, 0.22, 110, 60, 0.16); $mu.Boom($tb + $bar * 0.625, 0.12, 120, 70, 0.12) }
  }
  $mu.Drone(@(73.42, 110.0, 146.83), 0.35, [double[]]@(0, 12.83, 14.2, 23.94, 30.34), [double[]]@(1.0, 1.6, 1.0, 1.9, 1.0))
}

# ---------------- sound effects ----------------
# transitions
foreach ($w in @(@(2.03, -0.8, 0.8), @(36.33, -0.8, 0.8), @(45.50, -0.8, 0.8), @(23.94, 0.8, -0.8))) { $sx.Whoosh($w[0], 0.42, 300, 2600, 500, 0.9, $w[1], $w[2], 0.55) }
foreach ($w in @(6.70, 12.83, 43.80)) { $sx.Whoosh($w, 0.4, 250, 2000, 400, 0.85, 0, 0, 0.6) }
$sx.Whoosh(4.06, 0.5, 150, 900, 200, 0.7, 0.7, -0.7, 0.7)       # foreground wipe
$sx.Whoosh(10.30, 0.45, 400, 3200, 900, 0.55, 0, 0, 0.5)        # push into the scroll
$sx.Whoosh(16.00, 0.45, 400, 3200, 900, 0.55, 0, 0, 0.5)        # dive into the page
$sx.Whoosh(38.01, 0.3, 900, 3500, 1200, 0.45, 0.2, -0.2, 0.5)   # pull back
$sx.Whoosh(40.04, 0.9, 200, 4500, 3000, 0.5, 0, 0, 0.4)         # door light swell
$sx.Whoosh(42.18, 0.6, 1500, 6000, 3000, 0.25, 0, 0, 0.3)       # sun -> candle shimmer
$sx.Boom(26.95, 0.65, 90, 40, 0.5); $sx.Whoosh(26.95, 0.6, 120, 1400, 300, 0.7, 0, 0, 0.8)   # fire flare
$sx.Boom(30.34, 0.55, 70, 32, 0.9)                                # dip to dark
$sx.Scratch(14.0, 14.45, 2500, 0.8, 0.5, 18, 0)                  # parchment roller wipe
# story beats
$sx.Bell(3.62, 196, @(0.5, 1, 1.183, 1.506, 2, 2.514, 2.662, 3.011), @(0.6, 1, 0.7, 0.5, 0.45, 0.3, 0.25, 0.2), 1.8, 0.16, -0.3)   # funeral bell
$sx.Bell(7.64, 820, @(1, 1.5, 2.71, 4.1), @(1, 0.5, 0.4, 0.2), 0.7, 0.10, 0.3); $sx.Whoosh(7.62, 0.25, 2000, 7000, 3000, 0.25, 0.3, 0.3, 0.4)   # axe ring
$sx.Click(10.55, 0.9, 1500, 0); $sx.Click(10.62, 0.7, 2500, 0.1); $sx.Click(10.71, 0.5, 2000, -0.1)   # wax seal cracks
$sx.Scratch(10.95, 11.6, 3000, 0.9, 0.35, 22, 0)                 # unrolling
foreach ($hb in @(12.95, 13.2, 13.7, 13.95)) { $sx.Boom($hb, 0.42, 60, 45, 0.12) }   # heartbeat
foreach ($wnd in @(@(16.0, 16.95), @(17.78, 18.12), @(18.3, 18.62), @(18.62, 19.12), @(19.45, 20.65), @(42.25, 43.6))) { $sx.Scratch($wnd[0], $wnd[1], 3800, 0.7, 0.4, 14, 0.15) }   # quill
foreach ($tk in @(18.13, 18.63, 19.13)) { $sx.Boom($tk, 0.35, 140, 90, 0.08) }   # word stamps
$sx.Scratch(21.0, 21.9, 3200, 0.9, 0.25, 30, 0); $sx.Scratch(22.0, 22.6, 2400, 0.9, 0.35, 12, 0)   # trembling page, lowering
foreach ($tk in @(22.95, 23.25, 23.55)) { $sx.Boom($tk, 0.3, 200, 120, 0.05); $sx.Click($tk, 0.3, 800, -0.2) }   # axe taps in palm
$sx.Crackle(4.06, 14.2, 0.05, 6); $sx.Crackle(20.95, 30.34, 0.06, 7); $sx.Crackle(30.34, 40.04, 0.04, 5)
foreach ($ct in @(24.4, 25.3, 26.2)) { $sx.Bell($ct, 1450, @(1, 2.3, 3.9), @(1, 0.5, 0.3), 0.15, 0.05, -0.4) }   # chains
foreach ($st in @(27.2, 27.55, 27.9, 28.3)) { $sx.Boom($st, 0.4, 90, 60, 0.07) }   # struggle
$sx.Scratch(29.3, 30.15, 5000, 0.4, 0.5, 4, 0)                   # molten sizzle
$sx.Pluck(37.2, 587.33, 0.35, 1.0, -0.3, 0.7); $sx.Pluck(37.27, 739.99, 0.32, 1.0, -0.1, 0.7); $sx.Pluck(37.34, 880.0, 0.3, 1.0, 0.1, 0.7); $sx.Pluck(37.41, 1174.66, 0.28, 1.2, 0.3, 0.7)   # blush harp
foreach ($c in @(38.44, 38.5, 38.55)) { $sx.Coin($c, 2300 + ($c * 1000 % 400), 0.15, 0.3) }
foreach ($c in @(39.02, 39.05, 39.09, 39.13)) { $sx.Coin($c, 2100 + ($c * 1000 % 500), 0.17, -0.4) }; $sx.Boom(39.02, 0.35, 160, 100, 0.06)
foreach ($c in @(39.32, 39.48, 39.61)) { $sx.Coin($c, 1700 + ($c * 1000 % 300), 0.13, -0.5) }
foreach ($bd in @(40.5, 40.9, 41.5)) { for ($j = 0; $j -lt 3; $j++) { $sx.Bell($bd + $j * 0.07, 3200 + $j * 300, @(1), @(1), 0.03, 0.04, 0.5) } }   # birds
for ($ft = 43.95; $ft -lt 45.5; $ft += 0.483) { $sx.Boom($ft, 0.45, 110, 70, 0.06); $sx.Click($ft, 0.2, 1200, 0.3); $sx.Boom($ft + 0.24, 0.3, 100, 65, 0.05) }   # marching boots

# ---------------- mix ----------------
$gM = [Math]::Pow(10, $MusicDb / 20); $gS = [Math]::Pow(10, $SfxDb / 20)
$w = New-Object Wav; $w.Rate = $sr; $w.Ch = 2; $w.Bits = 16; $w.S = [Synth]::Mix($voW.S, $voW.Ch, $mu, $sx, $gM, $gS)
[AudioTool]::Write((Join-Path (Get-Location) $OutPath), $w)
"wrote $OutPath ($([Math]::Round($N / $sr, 3))s)"

